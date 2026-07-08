import { useEffect, useRef } from "react";
import { Link } from "wouter";
import {
  Triangle, Activity, Radio, Waves, Antenna, Layers,
  AudioWaveform, Compass, BookOpen, Scale, ArrowUpRight,
  type LucideIcon,
} from "lucide-react";

import imgGizaCode    from "@assets/1c7dc8a4-b3bc-40a5-ab00-fb02edf4babc_1777220453234.png";
import imgGoldHead    from "@assets/f4a65042-bde6-49d2-a810-4e65911baaa3_1777220462178.png";
import imgManifesto   from "@assets/ChatGPT_Image_Apr_26,_2026,_12_18_25_PM_1777220502883.png";
import imgTarot       from "@assets/f3213d92-97e3-41af-8609-400ba620039c_1777220534955.png";
import imgSchematic   from "@assets/92d50ed6-2c9c-4d07-99a7-0d112e2ee14d_1777220671515.png";
import imgHermeticSeal      from "@assets/ChatGPT_Image_Apr_26,_2026,_12_50_18_PM_1777222220016.png";
import imgHermeticResonator from "@assets/ChatGPT_Image_Apr_26,_2026,_12_50_27_PM_1777222235348.png";
import imgTimeStoneSound    from "@assets/ChatGPT_Image_Apr_26,_2026,_12_51_25_PM_1777222331319.png";

// boho-creme + stone palette (matches /atlas-3i family)
const B = {
  bg:        "#F4EDE0",
  panel:     "#FAF6EC",
  panelWarm: "#F1E6D0",
  cream:     "#FFFBF1",
  border:    "rgba(124, 100, 60, 0.18)",
  borderWarm:"rgba(140, 107, 48, 0.30)",
  shadow:    "rgba(58, 45, 26, 0.18)",
  gold:      "#C9A35E",
  goldDeep:  "#8C6B30",
  terracotta:"#B5734C",
  terraDeep: "#7A4824",
  olive:     "#8B8557",
  oliveDeep: "#5F5C32",
  navy:      "#1F2A44",
  navyDeep:  "#162038",
  brownDeep: "#3A2D1A",
  ink:       "#2A2419",
  text:      "#4A3F2D",
  muted:     "#6D5E40",
};

type ReadingCard = { title: string; body: string; accent: string; icon: LucideIcon };

const QUADRANT_READINGS: ReadingCard[] = [
  {
    title: "Cartography",
    body: "Contour grid with red riverlines and faint Cairo street tracery. The same plateau the geologist sees — bedrock, groundwater, urban edge. The yellow squares are coordinates, not yet symbols.",
    accent: B.terracotta, icon: Compass,
  },
  {
    title: "Naming",
    body: "The same site, with the names attached: Pyramid of Khufu, Khafre, Western Cemetery, Eastern Cemetery, Great Sphinx. Once labeled, the dots become a system you can reason about.",
    accent: B.gold, icon: BookOpen,
  },
  {
    title: "Geometry",
    body: "Local north-arrow map: three pyramids (Khufu, Khafre, Menkaure) plotted at scale (≈ 5-metre grid). The triangulation that the manifesto reads as Orion's Belt is the literal floor plan.",
    accent: B.olive, icon: Triangle,
  },
  {
    title: "Vision",
    body: "Night sky with three vertical light beams converging on a single star above the pyramid trio. The reading the page is asking you to consider: what does this geometry do, regardless of why it was built?",
    accent: B.navy, icon: Activity,
  },
];

type Pull = { tag: string; line: string; accent: string };
const MANIFESTO_PULLS: Pull[] = [
  { tag: "soundboard",   line: "“The plateau is a soundboard. Different patches of land, different frequencies.”", accent: B.terracotta },
  { tag: "quartz cell",  line: "“Each pyramid becomes a quartz battery wrapped in a limestone shell.”",            accent: B.gold },
  { tag: "antenna array",line: "“The three pyramids form a multi-node antenna array — a triangular field tuned with mathematical ratios.”", accent: B.olive },
  { tag: "phase regulator", line: "“The Sphinx sits at the eastern horizon like a phase regulator.”",              accent: B.navy },
];

type SchematicNode = { name: string; role: string; accent: string };
const SCHEMATIC_NODES: SchematicNode[] = [
  { name: "Granite + limestone substrate", role: "the dielectric · piezoelectric quartz veins in the bedrock + the limestone shell that contains them",          accent: B.terracotta },
  { name: "Three pyramids in parallel",    role: "three resonators sharing a substrate · their spacing is the wavelength constraint, not just the funeral plan", accent: B.gold },
  { name: "Sphinx node",                    role: "the equinoctial alignment marker · in the schematic it's drawn as the phase-regulating element on the line",  accent: B.olive },
  { name: "Resonant energy bus",            role: "the output rail · whatever the system stores or emits, this is where the schematic reads it out",              accent: B.navy },
];

type ScienceCard = { title: string; intuition: string; physics: string; examples: string; icon: LucideIcon; accent: string };
const SCIENCE_CARDS: ScienceCard[] = [
  {
    title: "The plateau has physical properties.",
    intuition: "“Different patches of land, different frequencies.”",
    physics: "Bedrock, groundwater, and structure are a real medium for acoustic resonance and seismic wave propagation. Wave velocity is set by the elastic moduli (Vₚ = √((K + 4G/3)/ρ)). The geology of the Giza plateau is therefore a real boundary condition, not a metaphor.",
    examples: "Engineered seismic sensors, geophones, infrasound stations, and underground resonance chambers all rely on exactly this physics.",
    icon: Layers, accent: B.terracotta,
  },
  {
    title: "Large stone structures can resonate.",
    intuition: "“Each pyramid becomes a quartz battery wrapped in a limestone shell.”",
    physics: "The chambers inside the Great Pyramid have measurable acoustic properties — published modal frequencies in the King's Chamber sit in the low-Hz / infrasound band, and the cavity can support standing waves under driven excitation. The structure behaves as a Helmholtz-class resonator under those conditions.",
    examples: "Concert-hall mode shapes, organ-pipe overtones, MEMS quartz oscillators, and architectural acoustic design all live in the same equations.",
    icon: AudioWaveform, accent: B.gold,
  },
  {
    title: "Geometry + placement matter.",
    intuition: "“The three pyramids form a multi-node antenna array.”",
    physics: "In any wave system, the spatial relationship between elements is part of the device. Phased arrays, interferometers, and distributed sensor networks all encode information in geometry. Whether or not the builders intended it, the spacing and alignment are a measurable parameter of how the site interacts with waves.",
    examples: "Phased-array radar, very-long-baseline interferometry (VLBI), antenna farms, distributed-computing clusters, MIMO Wi-Fi.",
    icon: Antenna, accent: B.olive,
  },
];

type Bridge = { href: string; title: string; subtitle: string; icon: LucideIcon; accent: string };
const BRIDGES: Bridge[] = [
  { href: "/gobekli-tepe",  title: "Göbekli Tepe Engine",       subtitle: "Older monumental site, same engineering question",        icon: Triangle,       accent: B.terracotta },
  { href: "/unified-field", title: "Unified Field · Ψ·ΔG·e^iπ", subtitle: "The framework: physics + chemistry + math as one space",  icon: Activity,       accent: B.navy        },
  { href: "/aether-core",   title: "AETHER Core",                subtitle: "Crystalline intelligence engine · piezoelectric primitives", icon: Radio,       accent: B.gold        },
  { href: "/lattice",       title: "CGLE Lattice",               subtitle: "Wave propagation in a 2-D coupled lattice",                  icon: Waves,       accent: B.olive       },
];

function GizaCircuitCanvas() {
  const ref = useRef<HTMLCanvasElement>(null);
  const rafRef = useRef(0);
  useEffect(() => {
    const canvas = ref.current; if (!canvas) return;
    const ctx = canvas.getContext("2d")!;
    canvas.width = 900; canvas.height = 170;
    const W = canvas.width, H = canvas.height;
    const pyramids = [{cx:W*0.25,h:90},{cx:W*0.5,h:110},{cx:W*0.75,h:75}];
    let t=0;
    const draw=()=>{
      ctx.fillStyle="rgba(2,4,8,0.25)"; ctx.fillRect(0,0,W,H);
      pyramids.forEach((p,i)=>{
        const base=80+i*10;
        const glow=0.4+0.3*Math.sin(t*0.03+i*1.2);
        ctx.beginPath(); ctx.moveTo(p.cx,H-p.h-20); ctx.lineTo(p.cx-base/2,H-20); ctx.lineTo(p.cx+base/2,H-20); ctx.closePath();
        ctx.fillStyle=`rgba(201,168,76,${glow*0.15})`; ctx.fill();
        ctx.strokeStyle=`rgba(201,168,76,${glow})`; ctx.lineWidth=1; ctx.stroke();
        const beamA=0.5+0.4*Math.sin(t*0.025+i);
        ctx.beginPath(); ctx.moveTo(p.cx,H-p.h-20); ctx.lineTo(p.cx+Math.sin(t*0.015+i)*40,20);
        ctx.strokeStyle=`rgba(46,240,216,${beamA*0.6})`; ctx.lineWidth=1; ctx.stroke();
        ctx.beginPath(); ctx.arc(p.cx+Math.sin(t*0.015+i)*40,20,4+2*Math.sin(t*0.04+i),0,Math.PI*2);
        ctx.fillStyle=`rgba(46,240,216,${beamA})`; ctx.fill();
      });
      ctx.fillStyle="rgba(201,168,76,0.3)"; ctx.font="9px 'DM Mono',monospace";
      ctx.fillText("GIZA CIRCUIT · PYRAMID RESONATOR · BEAM COHERENCE · AETHER",14,14);
      t++; rafRef.current=requestAnimationFrame(draw);
    };
    draw();
    return ()=>cancelAnimationFrame(rafRef.current);
  },[]);
  return <canvas ref={ref} style={{width:"100%",height:"auto",borderRadius:8,display:"block"}} />;
}

export default function GizaCircuitPage() {
  return (
    <div className="min-h-screen" style={{ background: B.bg, color: B.text, fontFamily: "Cinzel, ui-serif, Georgia, serif" }}>
      <style>{`
        @keyframes gz-fade { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }
        .gz-fade { animation: gz-fade 720ms ease-out both; }
        @media (prefers-reduced-motion: reduce) { .gz-fade { animation: none; opacity: 1; transform: none; } }
      `}</style>

      <div className="max-w-7xl mx-auto px-8 py-10 space-y-14">

        {/* HERO */}
        <header className="gz-fade grid gap-8 grid-cols-1 lg:grid-cols-[minmax(0,300px)_1fr] items-start"
                data-testid="giza-hero">
          <div className="rounded-[14px] overflow-hidden border shadow-lg"
               style={{ borderColor: B.borderWarm, background: B.cream, boxShadow: `0 12px 28px ${B.shadow}` }}>
            <img src={imgTarot} loading="eager" decoding="async" className="block w-full h-auto"
                 alt="AETHER tarot card titled AETHER CIRCUIT · THE GIZA GRID — the Sphinx and three pyramids beneath a starlit sky with three vertical light beams converging on a star, and a topographic plateau map below showing four pyramid markers connected in a wired blue circuit overlay" />
          </div>
          <div>
            <div className="text-[10px] tracking-[0.32em] uppercase mb-2"
                 style={{ color: B.terracotta, fontFamily: "Inter, ui-sans-serif, system-ui, sans-serif" }}>
              aether circuit · plateau as soundboard · pyramid as quartz battery
            </div>
            <h1 className="text-[42px] leading-[1.05] mb-4" style={{ color: B.brownDeep }}>
              The Giza Grid.
            </h1>
            <p className="text-[14px] leading-relaxed mb-3"
               style={{ color: B.text, fontFamily: "Inter, ui-sans-serif, system-ui, sans-serif" }}>
              An old plateau read as a piece of engineering. The intuition is bold: the bedrock is the dielectric,
              each pyramid is a quartz cell wrapped in a limestone shell, the trio is a multi-node antenna array, and
              the Sphinx is a phase regulator on the eastern horizon.
            </p>
            <p className="text-[14px] leading-relaxed"
               style={{ color: B.text, fontFamily: "Inter, ui-sans-serif, system-ui, sans-serif" }}>
              This page does two things in parallel: it lays out the intuition exactly as the source material states it,
              <em style={{ color: B.brownDeep }}> and</em> it grounds each move in the real physics that already exists —
              acoustic resonance, seismic propagation, measured chamber modes, and the well-understood role of geometry
              in wave devices. Where the intuition meets a real piece of physics, the page says so. Where it leaves the
              evidence behind, the page says that too.
            </p>
            <div className="mt-5 flex flex-wrap gap-3">
              <Tag color={B.terracotta} label="Bedrock + groundwater" />
              <Tag color={B.gold}       label="Quartz · limestone" />
              <Tag color={B.olive}      label="Antenna geometry" />
              <Tag color={B.navy}       label="Equinoctial alignment" />
            </div>
          </div>
        </header>

        {/* SECTION 01 — THE CODE */}
        <section className="gz-fade space-y-6" style={{ animationDelay: "120ms" }} data-testid="giza-section-code">
          <SectionHeading num="01" label="The Code · four readings of the same plateau" />
          <div className="grid gap-6 grid-cols-1 lg:grid-cols-[1fr_minmax(0,360px)] items-start">
            <figure className="rounded-[14px] overflow-hidden border shadow"
                    style={{ borderColor: B.borderWarm, background: B.terraDeep, boxShadow: `0 8px 20px ${B.shadow}` }}>
              <img src={imgGizaCode} loading="lazy" decoding="async" className="block w-full h-auto"
                   alt="The Giza Code · burnt-terracotta poster reading THE GIZA CODE in cream serif, with four panels: a contoured topographic grid map of the plateau with three yellow pyramid markers and a faint city overlay; a labeled photograph map showing Western Cemetery, Pyramid of Khufu, Khafre, Eastern Cemetery, and Great Sphinx beside the actual pyramid silhouettes; a tan north-oriented site plan with Khufu, Khafre, and Menkaure plotted at scale with a 5-metre design scale bar; and a dusk photograph of the three pyramids beneath a starlit sky with three vertical light beams converging above them. The poster is signed AETHER at the bottom." />
              <figcaption className="px-5 py-3 text-[11px] uppercase tracking-[0.25em]"
                          style={{ color: B.cream, background: B.brownDeep, fontFamily: "Inter, ui-sans-serif, system-ui, sans-serif" }}>
                AETHER · The Giza Code · four-quadrant poster
              </figcaption>
            </figure>
            <div className="space-y-3">
              {QUADRANT_READINGS.map(q => (
                <article key={q.title} className="border rounded-[10px] p-4"
                         style={{ borderColor: B.border, background: B.panel }}
                         data-testid={`reading-${q.title.toLowerCase()}`}>
                  <div className="flex items-baseline gap-2 mb-1.5">
                    <q.icon className="w-3.5 h-3.5 mt-1" style={{ color: q.accent }} strokeWidth={1.6} />
                    <h3 className="text-[15px]" style={{ color: B.ink }}>{q.title}</h3>
                  </div>
                  <p className="text-[12.5px] leading-relaxed"
                     style={{ color: B.text, fontFamily: "Inter, ui-sans-serif, system-ui, sans-serif" }}>
                    {q.body}
                  </p>
                </article>
              ))}
            </div>
          </div>
        </section>

        {/* SECTION 02 — MANIFESTO */}
        <section className="gz-fade space-y-6" style={{ animationDelay: "200ms" }} data-testid="giza-section-manifesto">
          <SectionHeading num="02" label="The Manifesto · plateau as instrument" />
          <p className="text-[13.5px] leading-relaxed max-w-3xl"
             style={{ color: B.text, fontFamily: "Inter, ui-sans-serif, system-ui, sans-serif" }}>
            The source manifesto, transcribed from the AETHER text card on the right. It states the
            intuition cleanly: pyramids as instruments, plateau as soundboard, three nodes as a triangulating array,
            Sphinx as a phase regulator, the whole site as a planetary resonance engine. We hold this as
            the <em style={{ color: B.brownDeep }}>hypothesis</em> the page exists to examine.
          </p>
          <div className="grid gap-6 grid-cols-1 lg:grid-cols-[minmax(0,360px)_1fr] items-start">
            <figure className="rounded-[14px] overflow-hidden border shadow"
                    style={{ borderColor: B.borderWarm, background: "#0F0F10", boxShadow: `0 8px 20px ${B.shadow}` }}>
              <img src={imgManifesto} loading="lazy" decoding="async" className="block w-full h-auto"
                   alt="AETHER manifesto card on near-black background with cream serif body text — argues that the Giza plateau works like a soundboard with different patches of land carrying different frequencies, that each pyramid acts like a quartz battery wrapped in a limestone shell, that the three pyramids together form a multi-node antenna array tuned by mathematical ratios resembling Orion's Belt, that the Sphinx sits at the eastern horizon like a phase regulator amplifying Earth's natural frequencies, and that the entire site is the ancient equivalent of a planetary resonance engine. Signed AETHER." />
              <figcaption className="px-5 py-3 text-[11px] uppercase tracking-[0.25em]"
                          style={{ color: B.cream, background: B.brownDeep, fontFamily: "Inter, ui-sans-serif, system-ui, sans-serif" }}>
                AETHER · source manifesto
              </figcaption>
            </figure>
            <ul className="space-y-3">
              {MANIFESTO_PULLS.map(p => (
                <li key={p.tag} className="border rounded-[10px] p-4"
                    style={{ borderColor: B.border, background: B.panel }}
                    data-testid={`pull-${p.tag.replace(/\s+/g, "-")}`}>
                  <div className="text-[10px] uppercase tracking-[0.3em] mb-1.5"
                       style={{ color: p.accent, fontFamily: "Inter, ui-sans-serif, system-ui, sans-serif" }}>
                    pull · {p.tag}
                  </div>
                  <blockquote className="text-[15px] leading-relaxed italic"
                              style={{ color: B.brownDeep, borderLeft: `2px solid ${p.accent}`, paddingLeft: 12 }}>
                    {p.line}
                  </blockquote>
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* SECTION 03 — SCHEMATIC */}
        <section className="gz-fade space-y-6" style={{ animationDelay: "280ms" }} data-testid="giza-section-schematic">
          <SectionHeading num="03" label="The Schematic · reading the plateau as a circuit" />
          <div className="grid gap-6 grid-cols-1 lg:grid-cols-[minmax(0,460px)_1fr] items-start">
            <figure className="rounded-[14px] overflow-hidden border shadow"
                    style={{ borderColor: B.borderWarm, background: "#0A0A0B", boxShadow: `0 8px 20px ${B.shadow}` }}>
              <img src={imgSchematic} loading="lazy" decoding="async" className="block w-full h-auto"
                   alt="AETHER hand-drawn schematic on black background — a labeled triangle marked GREAT PYRAMID with internal layers granite over limestone and water-wave glyphs at the apex, wired to the right via a single line into three smaller stacked triangles labelled RYRAMIDS, RESONAN, and SPHINX, with a separate horizontal line below labelled RESONANCE running through a circle marked SPHINX into a resistor zigzag terminating at a node labelled RESONANT ENERGY" />
              <figcaption className="px-5 py-3 text-[11px] uppercase tracking-[0.25em]"
                          style={{ color: B.cream, background: B.brownDeep, fontFamily: "Inter, ui-sans-serif, system-ui, sans-serif" }}>
                AETHER · resonance schematic (source · spelling preserved)
              </figcaption>
            </figure>
            <div className="space-y-3">
              <p className="text-[13px] leading-relaxed"
                 style={{ color: B.text, fontFamily: "Inter, ui-sans-serif, system-ui, sans-serif" }}>
                Read literally: granite + limestone are the dielectric layers, three pyramids hang in parallel
                off a single bus, and the Sphinx is the resistor / phase element before the output node.
                Whether or not the original builders intended a circuit, the diagram is a straightforward
                resonator + array + tuning element + readout.
              </p>
              <ol className="space-y-2.5">
                {SCHEMATIC_NODES.map((n, i) => (
                  <li key={n.name} className="border rounded-[10px] p-3.5 flex gap-3"
                      style={{ borderColor: B.border, background: B.panel }}
                      data-testid={`schem-node-${i}`}>
                    <span className="shrink-0 w-7 h-7 rounded-full flex items-center justify-center text-[11px]"
                          style={{ background: n.accent, color: B.cream, fontFamily: "Inter, ui-sans-serif, system-ui, sans-serif" }}>
                      {i + 1}
                    </span>
                    <div>
                      <div className="text-[13.5px]" style={{ color: B.ink }}>{n.name}</div>
                      <div className="text-[12px] leading-relaxed mt-0.5"
                           style={{ color: B.text, fontFamily: "Inter, ui-sans-serif, system-ui, sans-serif" }}>
                        {n.role}
                      </div>
                    </div>
                  </li>
                ))}
              </ol>
            </div>
          </div>
        </section>

        {/* SECTION 04 — INTUITION ↔ REAL SCIENCE */}
        <section className="gz-fade space-y-6" style={{ animationDelay: "360ms" }} data-testid="giza-section-science">
          <SectionHeading num="04" label="Where intuition connects to real science" />
          <p className="text-[13.5px] leading-relaxed max-w-3xl"
             style={{ color: B.text, fontFamily: "Inter, ui-sans-serif, system-ui, sans-serif" }}>
            The honest middle. Each card states the intuition (italics, in quotes), then the
            <span style={{ color: B.brownDeep }}> piece of established physics</span> that the intuition is
            actually pointing at, and where you can already find the same equation working in modern hardware.
            None of this requires the ancient builders to have intended any of it — the geometry does what the
            geometry does.
          </p>
          <div className="grid gap-5 grid-cols-1 lg:grid-cols-[1fr_minmax(0,300px)] items-start">
            <div className="grid gap-4 grid-cols-1">
              {SCIENCE_CARDS.map(c => (
                <article key={c.title} className="border rounded-[12px] p-5"
                         style={{ borderColor: B.border, background: B.panel }}
                         data-testid={`science-${c.title.replace(/[^a-z]+/gi, "-").toLowerCase()}`}>
                  <div className="flex items-baseline gap-2.5 mb-2">
                    <c.icon className="w-4 h-4 mt-1" style={{ color: c.accent }} strokeWidth={1.6} />
                    <h3 className="text-[18px]" style={{ color: B.brownDeep }}>{c.title}</h3>
                  </div>
                  <p className="text-[12.5px] leading-relaxed mb-2 italic"
                     style={{ color: B.muted, fontFamily: "Inter, ui-sans-serif, system-ui, sans-serif" }}>
                    intuition · {c.intuition}
                  </p>
                  <p className="text-[13px] leading-relaxed mb-2"
                     style={{ color: B.text, fontFamily: "Inter, ui-sans-serif, system-ui, sans-serif" }}>
                    <span className="text-[10px] uppercase tracking-[0.25em] mr-2" style={{ color: c.accent }}>real physics</span>
                    {c.physics}
                  </p>
                  <p className="text-[12.5px] leading-relaxed"
                     style={{ color: B.text, fontFamily: "Inter, ui-sans-serif, system-ui, sans-serif" }}>
                    <span className="text-[10px] uppercase tracking-[0.25em] mr-2" style={{ color: c.accent }}>where it lives now</span>
                    {c.examples}
                  </p>
                </article>
              ))}
              <div className="border rounded-[12px] p-5"
                   style={{ borderColor: B.borderWarm, background: B.panelWarm }}
                   data-testid="science-honest-line">
                <div className="flex items-center gap-2 mb-2">
                  <Scale className="w-4 h-4" style={{ color: B.brownDeep }} strokeWidth={1.6} />
                  <span className="text-[10px] uppercase tracking-[0.3em]" style={{ color: B.brownDeep, fontFamily: "Inter, ui-sans-serif, system-ui, sans-serif" }}>
                    the honest line
                  </span>
                </div>
                <p className="text-[13px] leading-relaxed"
                   style={{ color: B.brownDeep, fontFamily: "Inter, ui-sans-serif, system-ui, sans-serif" }}>
                  Bedrock can carry waves. Stone chambers can resonate. Geometry sets device behaviour. All three are
                  measured science. What we do <em>not</em> claim from this page: that anyone has demonstrated the
                  Giza plateau as a working power source, communication device, or planetary engine. The intuition is
                  worth stating. The evidence for the strong version is not in.
                </p>
              </div>
            </div>
            <figure className="rounded-[14px] overflow-hidden border shadow lg:sticky lg:top-6"
                    style={{ borderColor: B.borderWarm, background: "#070605", boxShadow: `0 8px 20px ${B.shadow}` }}>
              <img src={imgGoldHead} loading="lazy" decoding="async" className="block w-full h-auto"
                   alt="Gold-toned silhouette of a human profile facing right, filled and surrounded by glowing handwritten equations including E equals m c squared, RT = CRT, and other physics shorthand, all enclosed inside a luminous geodesic-style sphere of dotted nodes with a small seven-pointed star at the crown" />
              <figcaption className="px-5 py-3 text-[10px] uppercase tracking-[0.25em]"
                          style={{ color: B.cream, background: B.brownDeep, fontFamily: "Inter, ui-sans-serif, system-ui, sans-serif" }}>
                The head that holds the formulas
              </figcaption>
            </figure>
          </div>
        </section>

        {/* SECTION 06 — RESONATOR DETAIL */}
        <ResonatorDetail />

        {/* SECTION 05 — BRIDGES */}
        <section className="gz-fade space-y-5" style={{ animationDelay: "440ms" }} data-testid="giza-section-bridges">
          <SectionHeading num="05" label="Threading into AETHER" />
          <div className="grid gap-3 grid-cols-1 md:grid-cols-2">
            {BRIDGES.map(b => (
              <Link key={b.href} href={b.href}
                    className="group border rounded-[10px] p-4 flex items-center gap-3 hover:bg-[rgba(124,100,60,0.06)] transition-colors"
                    style={{ borderColor: B.border, background: B.panel }}
                    data-testid={`bridge-${b.href.replace("/", "")}`}>
                <div className="w-9 h-9 rounded-full border flex items-center justify-center shrink-0"
                     style={{ borderColor: B.borderWarm, background: B.cream }}>
                  <b.icon className="w-4 h-4" style={{ color: b.accent }} strokeWidth={1.6} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-[14px]" style={{ color: B.ink }}>{b.title}</div>
                  <div className="text-[11.5px] mt-0.5"
                       style={{ color: B.muted, fontFamily: "Inter, ui-sans-serif, system-ui, sans-serif" }}>
                    {b.subtitle}
                  </div>
                </div>
                <ArrowUpRight className="w-3.5 h-3.5 opacity-50 group-hover:opacity-100 transition-opacity"
                              style={{ color: b.accent }} strokeWidth={1.6} />
              </Link>
            ))}
          </div>
        </section>

        {/* CODA */}
        <section className="gz-fade max-w-3xl pt-2 pb-4" style={{ animationDelay: "520ms" }} data-testid="giza-coda">
          <div className="h-px mb-5"
               style={{ background: `linear-gradient(90deg, transparent 0%, ${B.gold}66 25%, ${B.terracotta}55 50%, ${B.navy}55 75%, transparent 100%)` }} />
          <p className="text-[15px] leading-relaxed italic" style={{ color: B.text }}>
            Bedrock + geometry + placement <em>can</em> behave as a circuit. Even if the original builders intended
            only to bury kings, the thing they built has the topology of a resonance device — and resonance devices
            behave the way resonance devices behave. The intuition is not the conclusion. It is the question.
          </p>
          <p className="mt-5 text-[18px] tracking-[0.16em]" style={{ color: B.brownDeep }}>
            Plateau · Pyramid · Sphinx — three terminals, one substrate.
          </p>
        </section>
      </div>
    </div>
  );
}

// ─── helpers ──────────────────────────────────────────────────────────
function SectionHeading({ num, label }: { num: string; label: string }) {
  return (
    <div>
      <div className="text-[10px] uppercase tracking-[0.32em] mb-2"
           style={{ color: B.terracotta, fontFamily: "Inter, ui-sans-serif, system-ui, sans-serif" }}>
        Section {num}
      </div>
      <h2 className="text-[24px]" style={{ color: B.brownDeep }}>{label}</h2>
    </div>
  );
}

// ─── RESONATOR DETAIL ─────────────────────────────────────────────────
function ResonatorDetail() {
  const PANELS = [
    {
      img: imgHermeticSeal,
      title: "Hermetic seal · the engineering diagram.",
      caption: "Hermetic Seal Concept in the Great Pyramid of Giza · King's Chamber + Granite Sarcophagus",
      alt: "Cross-section infographic of the Great Pyramid of Giza on a sandstone background, titled 'Hermetic Seal Concept in the Great Pyramid of Giza'. Header strip notes c. 2580–2560 BCE construction, King's Chamber and Granite Sarcophagus with precise-cut granite coffer and portcullis blocks, and modern research markers including void-and-shaft scans and acoustic analysis. The pyramid cutaway labels Void Detected, Scan Anomalies, King's Chamber, Granite Sarcophagus, Peg Holes for Lid, Portcullis Blocks, Water Channels (in and out), Quartz Content 30–40%, Standing Wave Patterns, and Resonant Frequency 110–120 Hz. Three small panels along the bottom: Piezoelectric Effect (quartz in granite generates charge), Acoustic Resonance (ringing tone 110–120 Hz around the sarcophagus), and Hydraulic Seal (water pressure plus tight fit). Footer: 'Hermetic Seal Concept: Precision Fit + Sound Vibration + Water Pressure'.",
      readings: [
        ["Granite coffer · 30–40% quartz content", "Quartz is piezoelectric. Mechanical stress on a quartz lattice generates a charge — the well-established mechanism behind quartz oscillators and pressure transducers. The image flags this as a candidate for in-situ charge generation under acoustic load."],
        ["Resonant frequency · 110–120 Hz", "The King's Chamber's modal frequencies are well-documented in the architectural-acoustics literature; the central peak sits in the low-Hz range the image cites. This is empirical, not speculative."],
        ["Standing waves around the sarcophagus", "Any rectangular cavity supports standing-wave modes when driven near its eigenfrequencies. The granite coffer is approximately rectangular and the chamber is enclosed — both conditions are met."],
        ["Hydraulic seal · water + precision fit", "Water channels through the substructure and tight-fit portcullis blocks would, together, function as a damped-pressure boundary. Reading: a real engineering possibility, not a demonstrated working seal."],
      ],
    },
    {
      img: imgHermeticResonator,
      title: "Hermetic resonator · the symbolic diagram.",
      caption: "The Great Pyramid as a Hermetic Resonator · time, stone, sound",
      alt: "Symbolic illuminated poster titled 'The Great Pyramid as a Hermetic Resonator'. A central pyramid render rises into a starfield, with an Eye-of-Providence glyph at the apex and the line 'Where time, stone, and sound converge into a precision seal that echoes through millennia'. Around the pyramid are four circular medallions: Resonant Frequencies (a glowing bell with a 110–120 Hz waveform), Quartz Resonance (a luminous quartz crystal cluster inside a triangle), and a duplicated lower row of the same two motifs. The King's Chamber is labelled inside the pyramid, with golden waveforms emanating from the sarcophagus and blue water-flow arrows beneath. Footer: 'Harnessing Time, Stone, and Sound: The Great Pyramid of Giza as a Precision Resonator — where granite, vibration, and water converge to form a hermetic seal that echoes through millennia.'",
      readings: [
        ["Resonant frequencies · the bell motif", "The bell-with-waveform medallion is the artist's symbol for the chamber's measured 110–120 Hz acoustic mode."],
        ["Quartz resonance · the crystal motif", "Reads as a stylized restatement of the piezoelectric story above. As art, not as a separate physical claim."],
        ["Time / stone / sound convergence", "The page treats this as the manifesto framing — the reason the Giza work is on this site at all — and keeps the engineering-diagram panel as the one carrying the testable numbers."],
      ],
    },
    {
      img: imgTimeStoneSound,
      title: "Time · stone · sound · the headline poster.",
      caption: "Harnessing Time, Stone, and Sound · the Great Pyramid of Giza as precision resonator",
      alt: "Tall hero poster titled 'Harnessing Time, Stone, and Sound: The Great Pyramid of Giza as a Precision Resonator'. Three medallions across the top labelled Time (Eye-of-Horus glyph in a swirling halo), Stone (a quartz block on rubble), and Sound (a tuning fork). Below them, an illuminated cross-section of the pyramid shows the King's Chamber with the granite sarcophagus, golden standing-wave traces, blue water-channel currents, and luminous resonance halos. Three lower panels labelled Piezoelectric Energy (quartz in granite), Resonant Frequencies (standing waves at 110–120 Hz), and Hydraulic Pressure (hermetic seal). Footer: '— where granite, vibration, and water converge to form a hermetic seal that echoes through millennia.'",
      readings: [
        ["Three terminals · Time / Stone / Sound", "A cleaner restatement of the schematic on /giza-circuit's Section 03: substrate (stone), drive (sound), and the long-running observable (time)."],
        ["Numbers stay the same", "110–120 Hz, ~30–40% quartz — these are the same values used throughout the page, surfaced here as the headline."],
        ["Artistic compression", "The golden halos and starfield are art direction, not field readings. The physics on this poster is exactly what the engineering diagram above already names."],
      ],
    },
  ];

  return (
    <section className="gz-fade space-y-6" style={{ animationDelay: "400ms" }} data-testid="giza-section-resonator">
      <SectionHeading num="06" label="The resonator in detail · three readings of the chamber." />
      <p className="text-[13.5px] leading-relaxed max-w-3xl" style={{ color: B.text }}>
        Three more posters that came in around the same time as the schematic. The first is the engineering
        diagram that carries the testable numbers. The second is the symbolic / Hermetic re-rendering of the
        same content. The third is the headline pairing — Time, Stone, and Sound. Numbers stay the same
        across all three; what changes is the register.
      </p>

      <div className="space-y-8">
        {PANELS.map((p, i) => (
          <article key={i} className="grid gap-5 lg:grid-cols-[minmax(0,420px)_1fr] items-start"
                   data-testid={`giza-resonator-panel-${i}`}>
            <figure className="rounded-[14px] overflow-hidden border"
                    style={{ borderColor: B.borderWarm, background: "#070605", boxShadow: `0 8px 20px ${B.shadow}` }}>
              <img src={p.img} loading="lazy" decoding="async" className="block w-full h-auto" alt={p.alt} />
              <figcaption className="px-4 py-2 text-[10px] uppercase tracking-[0.22em]"
                          style={{ color: B.cream, background: B.brownDeep, fontFamily: "Inter, ui-sans-serif, system-ui, sans-serif" }}>
                {p.caption}
              </figcaption>
            </figure>
            <div>
              <h3 className="text-[18px] mb-3" style={{ color: B.brownDeep, fontFamily: "Cinzel, serif" }}>{p.title}</h3>
              <ul className="space-y-2">
                {p.readings.map(([k, v]) => (
                  <li key={k} className="rounded-md p-3"
                      style={{ background: B.cream, border: `1px solid ${B.border}` }}>
                    <div className="text-[10.5px] uppercase tracking-[0.22em] mb-1"
                         style={{ color: B.terracotta, fontFamily: "Inter, sans-serif" }}>{k}</div>
                    <p className="text-[12.5px] leading-relaxed" style={{ color: B.ink }}>{v}</p>
                  </li>
                ))}
              </ul>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

function Tag({ color, label }: { color: string; label: string }) {
  return (
    <span className="text-[10.5px] uppercase tracking-[0.22em] px-3 py-1.5 rounded-full border"
          style={{ color, borderColor: color + "66", background: B.cream,
                   fontFamily: "Inter, ui-sans-serif, system-ui, sans-serif" }}>
      {label}
    </span>
  );
}
