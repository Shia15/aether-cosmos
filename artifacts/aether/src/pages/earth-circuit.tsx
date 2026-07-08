import { useEffect, useRef } from "react";
import imgDipole       from "@assets/ChatGPT_Image_Apr_26,_2026,_12_57_25_PM_1777222648879.png";
import imgTransition   from "@assets/cbc24b1e-72e0-4a6f-8482-df9d87f7d424_1777222684737.png";
import imgFieldLines   from "@assets/ChatGPT_Image_Apr_26,_2026,_01_03_26_PM_1777223014978.png";
import imgIonization   from "@assets/ChatGPT_Image_Apr_26,_2026,_01_05_39_PM_1777223144093.png";

const B = {
  bg: "#0a0712",
  panel: "#150f1f",
  panelLite: "#1c1428",
  ink: "#f0e8ff",
  text: "rgba(232,222,255,0.78)",
  muted: "rgba(232,222,255,0.45)",
  border: "rgba(180,150,240,0.14)",
  violet: "#b48cff",
  cyan: "#7be4ea",
  amber: "#f5b942",
  rose: "#f59ec3",
  green: "#7be59f",
  blue: "#7cc8ff",
  gold: "#e8c878",
};

function H({ num, label, accent = B.violet }: { num: string; label: string; accent?: string }) {
  return (
    <div className="mb-3">
      <div className="text-[10px] uppercase tracking-[0.32em]" style={{ color: accent, fontFamily: "Inter, sans-serif" }}>
        Section {num}
      </div>
      <h2 className="text-[22px] mt-1" style={{ color: B.ink, fontFamily: "Cinzel, serif" }}>{label}</h2>
    </div>
  );
}

function ImgFig({ src, alt, caption, accent = B.violet }: { src: string; alt: string; caption: string; accent?: string }) {
  return (
    <figure className="rounded-md overflow-hidden" style={{ border: `1px solid ${accent}33`, background: "#000" }}>
      <img src={src} alt={alt} loading="lazy" decoding="async" className="block w-full h-auto" />
      <figcaption className="px-4 py-2 text-[10.5px] uppercase tracking-[0.22em]"
                  style={{ color: B.muted, background: B.panel }}>
        {caption}
      </figcaption>
    </figure>
  );
}

function EarthCircuitCanvas() {
  const ref = useRef<HTMLCanvasElement>(null);
  const rafRef = useRef(0);
  useEffect(() => {
    const canvas = ref.current; if (!canvas) return;
    const ctx = canvas.getContext("2d")!;
    canvas.width = 900; canvas.height = 200;
    const W = canvas.width, H = canvas.height;
    const cx=W/2, cy=H/2;
    let t=0;
    const nodes=[
      { x:W*0.12, y:cy, col:"#2ef0d8", label:"SURFACE" },
      { x:W*0.3,  y:cy-30, col:"#44aaff", label:"IONOSPHERE" },
      { x:W*0.5,  y:cy, col:"#9966ff", label:"SCHUMANN" },
      { x:W*0.7,  y:cy+25, col:"#c9a84c", label:"MAGNETOSPHERE" },
      { x:W*0.88, y:cy, col:"#44cc77", label:"GROUND" },
    ];
    const bolts: {from:number,to:number,t:number}[]=[];
    let tick=0;
    const draw=()=>{
      ctx.fillStyle="rgba(2,4,8,0.18)"; ctx.fillRect(0,0,W,H);
      t++;tick++;
      if(tick%25===0&&bolts.length<5) bolts.push({ from:Math.floor(Math.random()*nodes.length),to:Math.floor(Math.random()*nodes.length),t:0 });
      for(let i=bolts.length-1;i>=0;i--){
        const b=bolts[i]; b.t+=0.08;
        const a=nodes[b.from], bNode=nodes[b.to];
        const midX=(a.x+bNode.x)/2+(Math.random()-.5)*40;
        const midY=(a.y+bNode.y)/2+(Math.random()-.5)*30;
        const alpha=Math.max(0,0.5-b.t*0.5);
        ctx.beginPath(); ctx.moveTo(a.x,a.y); ctx.quadraticCurveTo(midX,midY,bNode.x,bNode.y);
        ctx.strokeStyle=`rgba(46,240,216,${alpha})`; ctx.lineWidth=1; ctx.stroke();
        if(b.t>=1) bolts.splice(i,1);
      }
      nodes.forEach(n=>{
        const psi=0.5+0.5*Math.sin(t*0.05);
        ctx.beginPath(); ctx.arc(n.x,n.y,10+3*psi,0,Math.PI*2);
        ctx.fillStyle=n.col; ctx.shadowColor=n.col; ctx.shadowBlur=10*psi; ctx.fill(); ctx.shadowBlur=0;
        ctx.fillStyle=n.col; ctx.font="bold 6px 'DM Mono',monospace"; ctx.textAlign="center";
        ctx.fillText(n.label,n.x,n.y+22);
      });
      ctx.fillStyle="rgba(46,240,216,0.35)"; ctx.font="9px 'DM Mono',monospace"; ctx.textAlign="left";
      ctx.fillText("EARTH CIRCUIT · SCHUMANN RESONANCE · GLOBAL ELECTROMAGNETIC CIRCUIT · AETHER",14,14);
      rafRef.current=requestAnimationFrame(draw);
    };
    draw();
    return ()=>cancelAnimationFrame(rafRef.current);
  },[]);
  return <canvas ref={ref} style={{ width:"100%", height:"auto", borderRadius:8, display:"block" }} />;
}

export default function EarthCircuitPage() {
  return (
    <div className="min-h-full" style={{ background: B.bg, color: B.text, fontFamily: "Inter, sans-serif" }}>
      <style>{`@keyframes ec-fade { from { opacity:0; transform: translateY(6px) } to { opacity:1; transform: none } }
        .ec-fade { animation: ec-fade 0.55s ease-out both; }
        @media (prefers-reduced-motion: reduce) { .ec-fade { animation: none; } }`}</style>

      <div className="max-w-5xl mx-auto px-7 py-10 space-y-10">

        {/* HERO */}
        <header className="ec-fade space-y-3" data-testid="ec-hero">
          <div className="text-[10px] uppercase tracking-[0.32em]" style={{ color: B.cyan }}>
            Earth Circuit · Geomagnetism · Global Electric Loop · Space-Weather Coupling
          </div>
          <h1 className="text-[34px] leading-tight" style={{ color: B.ink, fontFamily: "Cinzel, serif", letterSpacing: "0.02em" }}>
            Earth as a coupled energetic system.
          </h1>
          <p className="text-[14px] leading-relaxed max-w-3xl" style={{ color: B.text }}>
            Four posters arrived on the same subject — Earth's magnetic field, the ongoing transition from a
            <em> stable dipole shield</em> to a <em>fragmented multipolar filter</em>, the way magnetic field
            lines guide information in spintronic and biological systems, and the speculative read that
            planetary ionization couples down through tectonic faults via the global electric circuit. AETHER
            reads them in order: the established geomagnetic physics first, the multipolar transition that
            geophysicists already observe in the data second, the technology echo (magnetism as an
            information substrate) third, and the Sun-to-faultline coupling poster fourth — labeled honestly
            as the speculative end of the ladder.
          </p>
        </header>

        {/* SECTION 01 — DIPOLE */}
        <section className="ec-fade space-y-3" style={{ animationDelay: "120ms" }} data-testid="ec-dipole">
          <H num="01" label="The dipole · what is established." accent={B.blue} />
          <ImgFig src={imgDipole} accent={B.blue}
                  alt="Cinematic render of Earth from space against a violet starfield. Bright blue and purple magnetic field lines arc out symmetrically from both magnetic poles, drawn as a classic dipole. Above the north pole, a small molecular cluster shows two paired N–S labelled spheres standing for the geometric N–S–N–S of a multipolar configuration. Earth's continents glow in violet. The image carries the visual language of a planetary magnet."
                  caption="Earth's magnetic field · idealized dipole render with multipolar inset." />
          <p className="text-[12.5px] leading-relaxed mt-2" style={{ color: B.text }}>
            The dominant component of Earth's magnetic field is a dipole generated by convection in the
            liquid outer core (the geodynamo). The dipole shields Earth from the bulk of the solar wind, and
            its axis is offset from the rotation axis by ~11°. Higher-order spherical-harmonic terms
            (quadrupole, octupole, …) carry the deviations. Field strength has been declining at roughly
            5% per century over recent decades, and the South Atlantic Anomaly is one regional fingerprint
            of that decline. None of this is speculative — it is what magnetometer networks and the IGRF
            model already report.
          </p>
        </section>

        {/* SECTION 02 — TRANSITION */}
        <section className="ec-fade space-y-3" style={{ animationDelay: "200ms" }} data-testid="ec-transition">
          <H num="02" label="From shield to filter · the multipolar transition." accent={B.amber} />
          <ImgFig src={imgTransition} accent={B.amber}
                  alt="Tall infographic poster titled 'Geomagnetic Transition: From Stable Shield to Fragmented Filter.' Top row: two side-by-side Earth renders — left, 'Stable Dipole Shield' with one bright N pole and clean field lines arcing over the planet; right, 'Fragmented Filter' with the same Earth but with multiple small N and S labels clustered above the pole and tangled multipolar field lines, captioned 'Quadrupoles and octupoles temporarily dominate.' Below the diagram: 'Near-Collapse of Dipole Field — Stable dipole shield vs Quadrupoles and octupoles temporarily dominate.' Middle block: 'Space-Weather Implications — Geomagnetic shielding shrinks + fragments, prolonged space radiation events, diffuse regional power-grid stress.' Pull-quote: Stability is not the same as strength. As dominant structure fades, minor modes define behavior in this space-weather regime. Bottom row of four icons with captions: 'Satellites — More radiation exposure'; 'GNSS & Comms — Signal disruptions at low latitude'; 'Energy Grids — Frequent grid fluctuations'; 'Modern — Heightened technological risk.' Bottom strip: 'Dipole stabilization → limited space-weather amplification. Dipole collapse → prolonged exposure to diffuse solar particle entry.'"
                  caption="Geomagnetic transition · poster reading of the dipole-to-multipole regime." />
          <div className="grid gap-3 md:grid-cols-2 mt-2">
            <div className="rounded-md p-3" style={{ background: B.panel, border: `1px solid ${B.green}33` }}>
              <div className="text-[10px] uppercase tracking-[0.22em] mb-1" style={{ color: B.green }}>What is rigorous on the poster</div>
              <ul className="text-[11.5px] leading-relaxed space-y-1" style={{ color: B.text }}>
                <li>· Dipole strength has been decreasing for at least the satellite era.</li>
                <li>· Higher-order multipoles do contribute a larger relative share when the dipole weakens.</li>
                <li>· Geomagnetically induced currents (GICs) are a documented power-grid stressor.</li>
                <li>· GNSS scintillation at low / high latitude is a real space-weather effect.</li>
              </ul>
            </div>
            <div className="rounded-md p-3" style={{ background: B.panel, border: `1px solid ${B.amber}33` }}>
              <div className="text-[10px] uppercase tracking-[0.22em] mb-1" style={{ color: B.amber }}>What needs care</div>
              <ul className="text-[11.5px] leading-relaxed space-y-1" style={{ color: B.text }}>
                <li>· "Near-collapse of dipole field" is rhetorical — the dipole is not predicted to collapse imminently. A reversal, if it happens, takes thousands of years.</li>
                <li>· "Heightened technological risk" is true at scale; the magnitude depends on solar activity, not just the geomagnetic state.</li>
                <li>· The poster's tone is dramatic; the underlying physics is ongoing, slow, and well-monitored.</li>
              </ul>
            </div>
          </div>
        </section>

        {/* SECTION 03 — FIELD LINES AS INFO SUBSTRATE */}
        <section className="ec-fade space-y-3" style={{ animationDelay: "280ms" }} data-testid="ec-info">
          <H num="03" label="Field lines as information substrate · the technology echo." accent={B.cyan} />
          <ImgFig src={imgFieldLines} accent={B.cyan}
                  alt="Wide cinematic poster titled 'Magnetic Field Lines Guide Information Flow' with subtitle 'Spintronics · MRI · Brain Microtubules · Nanomedicine.' On the left, two coil-like field generators with violet-cyan field-line halos and a small chip-on-board labelled 'Spintronics & MRI.' Center: a bright yellow-orange convergence point with branching golden filaments. On the right, a translucent cylindrical microtubule render and a brain with golden filament threads, labelled 'Microtubules & Nanomedicine.' Across the top a starfield with scattered nanoparticles. Bottom strip: 'Spintronics & MRI    Microtubules & Nanomedicine.'"
                  caption="Magnetism as a routing fabric for information across scales." />
          <div className="grid gap-3 md:grid-cols-3 mt-2">
            <div className="rounded-md p-3" style={{ background: B.panel, border: `1px solid ${B.cyan}33` }}>
              <div className="text-[10px] uppercase tracking-[0.22em] mb-1" style={{ color: B.cyan }}>Spintronics</div>
              <p className="text-[11.5px]" style={{ color: B.text }}>Electron spin as the carrier; magnetic tunnel junctions and spin-orbit torque are the engineering substrate. Mature lab physics.</p>
            </div>
            <div className="rounded-md p-3" style={{ background: B.panel, border: `1px solid ${B.violet}33` }}>
              <div className="text-[10px] uppercase tracking-[0.22em] mb-1" style={{ color: B.violet }}>MRI</div>
              <p className="text-[11.5px]" style={{ color: B.text }}>Static B₀ + gradient and RF fields encoding spatial position into NMR signal. Routine clinical instrument; the "field guides info" intuition is literally true here.</p>
            </div>
            <div className="rounded-md p-3" style={{ background: B.panel, border: `1px solid ${B.gold}33` }}>
              <div className="text-[10px] uppercase tracking-[0.22em] mb-1" style={{ color: B.gold }}>Microtubules / nano</div>
              <p className="text-[11.5px]" style={{ color: B.text }}>Speculative. Microtubule-based information processing (Penrose-Hameroff) is an open hypothesis, not established physics. AETHER labels it as such.</p>
            </div>
          </div>
        </section>

        {/* SECTION 04 — IONIZATION POSTER */}
        <section className="ec-fade space-y-3" style={{ animationDelay: "360ms" }} data-testid="ec-ionization">
          <H num="04" label="Planetary ionization & seismic coupling · the speculative end." accent={B.gold} />
          <ImgFig src={imgIonization} accent={B.gold}
                  alt="Tall ornate gold-and-black poster framed in alchemical borders titled 'AETHER — Planetary Ionization & Seismic Coupling.' Top half: stylised solar system with the Sun as a coronal-hole disc upper-left, planets along a curving orbital track including Mercury (labelled Mercury Activator), Jupiter, Pluto, and Earth at the centre, threaded together by golden ionised filaments labelled Corotating High-Speed Solar Wind, High Charge Density, Alignment Synchronization. Earth is shown with its surface cracked open and golden lightning streaming down into a fissure. Banner across the centre: 'Global Electric Circuit.' Three bottom panels labelled 'Tectonic Faults' each with golden lightning bolts striking ground. Caption beneath: '7.5⚡ — High Charge Density.' Bottom banner: 'Earth as a coupled energetic system — Energy flows from Sun to faultline.' Hexagram and sun glyphs anchor the bottom corners."
                  caption="The ionization-to-seismic poster · honest reading required." />
          <div className="rounded-md p-4 space-y-3" style={{ background: "linear-gradient(135deg, rgba(232,200,120,0.05), rgba(180,140,255,0.04))",
                       border: `1px solid ${B.gold}33` }}>
            <div className="text-[10px] uppercase tracking-[0.25em]" style={{ color: B.gold }}>What is rigorous</div>
            <p className="text-[12.5px] leading-relaxed" style={{ color: B.text }}>
              The Global Atmospheric Electric Circuit is a real, well-measured system: thunderstorms and
              electrified clouds drive a fair-weather current density of ~2 pA/m² between the conducting
              ionosphere and the conducting ground. Solar-wind variations modulate ionospheric potential
              and, through it, the global circuit. Coronal-hole high-speed streams and CME impacts are
              recognised drivers of geomagnetic storms.
            </p>
            <div className="text-[10px] uppercase tracking-[0.25em] pt-2" style={{ color: B.rose }}>What is speculative</div>
            <p className="text-[12.5px] leading-relaxed" style={{ color: B.text }}>
              A direct, physically demonstrated mechanism by which solar-wind ionization triggers tectonic
              faults is <em>not</em> established. There are research papers on possible electromagnetic
              precursors to earthquakes; the causal chain "Sun → ionosphere → tectonic stress release" is
              an open hypothesis, not a confirmed pathway. Read this poster as an artistic compression of an
              ongoing research question, not as a settled diagram.
            </p>
            <div className="text-[10px] uppercase tracking-[0.25em] pt-2" style={{ color: B.green }}>What AETHER does with it</div>
            <p className="text-[12.5px] leading-relaxed" style={{ color: B.text }}>
              Files it next to the established work — the dipole, the multipolar transition, the technology
              echo — so the speculative tile is held visibly to the same standard as the established ones,
              and labeled.
            </p>
          </div>
        </section>

        {/* CODA */}
        <section className="ec-fade max-w-3xl pt-2 pb-6" style={{ animationDelay: "440ms" }} data-testid="ec-coda">
          <div className="h-px mb-4" style={{ background: `linear-gradient(90deg, transparent, ${B.cyan}66, ${B.gold}55, transparent)` }} />
          <p className="text-[14px] leading-relaxed italic" style={{ color: B.text }}>
            Earth is a coupled system. The dipole is the bass note. The multipoles are the upper partials.
            The grid feels them both. The Sun-to-faultline coupling is a question, not a conclusion. Each
            poster goes on the wall at its own confidence level.
          </p>
        </section>

      </div>
    </div>
  );
}
