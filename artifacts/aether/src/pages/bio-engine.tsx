import { useRef, useEffect } from "react";
import { Link } from "wouter";
import { ArrowUpRight } from "lucide-react";
import imgBoat         from "@assets/ChatGPT_Image_Apr_26,_2026,_01_45_14_PM_1777225527845.png";
import imgAhnen        from "@assets/ChatGPT_Image_Apr_26,_2026,_01_39_03_PM_1777225145784.png";
import imgQuantumCells from "@assets/ChatGPT_Image_Apr_26,_2026,_01_44_37_PM_1777225480410.png";

const B = {
  bg:        "#F1ECDC",
  panel:     "#FAF6E8",
  panelWarm: "#EFE6CD",
  ink:       "#1F2A28",
  text:      "#2E3A36",
  textWarm:  "#3a322a",
  muted:     "rgba(40,44,40,0.55)",
  border:    "rgba(70,90,75,0.18)",
  borderWarm:"rgba(140,107,48,0.30)",

  moss:      "#5F7A4E",
  mossDeep:  "#3F5634",
  ocean:     "#3D7A89",
  oceanDeep: "#1F4D5C",
  seaglass:  "#7BB6A8",
  clay:      "#B5734C",
  clayDeep:  "#7A4A2A",
  wheat:     "#C9A35E",
  wheatDeep: "#8C6B30",
  algae:     "#86A36F",
  rust:      "#A6553A",
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
    <figure className="rounded-md overflow-hidden mt-2"
            style={{ border: `1px solid ${B.borderWarm}`, background: B.panel }}>
      <img src={src} alt={alt} loading="lazy" decoding="async" className="block w-full h-auto" />
      <figcaption className="px-4 py-2 text-[10.5px] uppercase tracking-[0.22em]"
                  style={{ color: B.muted, background: B.panelWarm, fontFamily: "Inter, sans-serif" }}>
        {caption}
      </figcaption>
    </figure>
  );
}

function Chip({ c, l }: { c: string; l: string }) {
  return (
    <span className="text-[10.5px] uppercase tracking-[0.22em] px-3 py-1.5 rounded-full border"
          style={{ color: c, borderColor: c + "55", background: B.panel, fontFamily: "ui-monospace, monospace" }}>{l}</span>
  );
}

function Card({ accent, eyebrow, title, body }:
  { accent: string; eyebrow: string; title: string; body: React.ReactNode }) {
  return (
    <div className="rounded-md p-4 border h-full" style={{ borderColor: B.border, background: B.panel }}>
      <div className="text-[10px] uppercase tracking-[0.28em] mb-1.5"
           style={{ color: accent, fontFamily: "Inter, sans-serif" }}>{eyebrow}</div>
      <div className="text-[15px] mb-2" style={{ color: B.ink, fontFamily: "Cinzel, serif" }}>{title}</div>
      <div className="text-[13px] leading-relaxed" style={{ color: B.text }}>{body}</div>
    </div>
  );
}

function Bridge({ to, eyebrow, title, body, accent }:
  { to: string; eyebrow: string; title: string; body: string; accent: string }) {
  return (
    <Link href={to}>
      <div className="rounded-md p-4 border h-full cursor-pointer transition-all hover:-translate-y-0.5"
           style={{ borderColor: B.border, background: B.panel }}
           data-testid={`bridge-${to.replace(/^\//, "")}`}>
        <div className="flex items-start justify-between gap-2">
          <div className="text-[10px] uppercase tracking-[0.28em]"
               style={{ color: accent, fontFamily: "Inter, sans-serif" }}>{eyebrow}</div>
          <ArrowUpRight className="w-3.5 h-3.5 mt-0.5" style={{ color: accent }} />
        </div>
        <div className="text-[15px] mt-1.5 mb-1.5" style={{ color: B.ink, fontFamily: "Cinzel, serif" }}>{title}</div>
        <div className="text-[12.5px] leading-relaxed" style={{ color: B.text }}>{body}</div>
        <div className="text-[10.5px] mt-2 underline" style={{ color: accent, fontFamily: "ui-monospace, monospace" }}>{to}</div>
      </div>
    </Link>
  );
}

const MATERIALS_OCEAN = [
  { c: B.algae,     l: "Algae coating" },
  { c: B.seaglass,  l: "Biofilm matrix" },
  { c: B.ocean,     l: "Mycelium-bonded basalt" },
  { c: B.moss,      l: "Hempcrete shell" },
  { c: B.wheat,     l: "Calcium-silicate hull" },
  { c: B.clay,      l: "Cork-flotation core" },
];

const MATERIALS_LAND = [
  { c: B.moss,      l: "Hempcrete walls" },
  { c: B.wheat,     l: "Straw + clay daub" },
  { c: B.algae,     l: "Mycelium insulation" },
  { c: B.clay,      l: "Lime-render skin" },
  { c: B.wheatDeep, l: "Reclaimed timber frame" },
  { c: B.rust,      l: "Iron-tannin sealant" },
];

function BioEngineCanvas() {
  const ref = useRef<HTMLCanvasElement>(null);
  const rafRef = useRef(0);
  useEffect(() => {
    const canvas = ref.current; if (!canvas) return;
    const ctx = canvas.getContext("2d")!;
    canvas.width = 900; canvas.height = 260;
    const W = canvas.width, H = canvas.height;
    const systems = [
      { label:"PHOTOSYNTHESIS\nENGINE", col:"#34d399", x:W*0.12, y:H*0.5 },
      { label:"NEURAL\nCOHERENCE", col:"#a78bfa", x:W*0.28, y:H*0.5 },
      { label:"QUANTUM\nBIOLOGY", col:"#2ef0d8", x:W*0.44, y:H*0.5 },
      { label:"MYCELIUM\nNETWORK", col:"#c9a84c", x:W*0.60, y:H*0.5 },
      { label:"PLASMOID\nFIELD", col:"#f472b6", x:W*0.76, y:H*0.5 },
      { label:"BIO\nSYNTHESIS", col:"#60a5fa", x:W*0.91, y:H*0.5 },
    ];
    let t=0;
    const draw=()=>{
      ctx.fillStyle="rgba(2,4,8,0.18)"; ctx.fillRect(0,0,W,H);
      t++;
      for (let i=0;i<systems.length-1;i++) {
        const a=systems[i],b=systems[i+1];
        const pkt=(t*0.014+i*0.45)%1;
        const px=a.x+(b.x-a.x)*pkt;
        ctx.beginPath(); ctx.arc(px,H/2,2.5,0,Math.PI*2);
        ctx.fillStyle="#fff"; ctx.shadowColor="#fff"; ctx.shadowBlur=7; ctx.fill(); ctx.shadowBlur=0;
        const g=ctx.createLinearGradient(a.x,a.y,b.x,b.y);
        g.addColorStop(0,a.col+"44"); g.addColorStop(1,b.col+"44");
        ctx.beginPath(); ctx.moveTo(a.x,a.y); ctx.lineTo(b.x,b.y);
        ctx.strokeStyle=g; ctx.lineWidth=1; ctx.stroke();
      }
      systems.forEach((s,i)=>{
        const pulse=1+0.1*Math.sin(t*0.04+i*1.1);
        const g=ctx.createRadialGradient(s.x,s.y,0,s.x,s.y,16*pulse);
        g.addColorStop(0,s.col+"cc"); g.addColorStop(0.5,s.col+"44"); g.addColorStop(1,"transparent");
        ctx.beginPath(); ctx.arc(s.x,s.y,14*pulse,0,Math.PI*2);
        ctx.fillStyle=g; ctx.shadowColor=s.col; ctx.shadowBlur=14*pulse; ctx.fill(); ctx.shadowBlur=0;
        ctx.strokeStyle=s.col; ctx.lineWidth=1.5; ctx.stroke();
        ctx.fillStyle=s.col; ctx.font="bold 7px 'DM Mono',monospace"; ctx.textAlign="center";
        s.label.split("\n").forEach((ln,li)=>ctx.fillText(ln,s.x,s.y+18*pulse+li*9));
      });
      ctx.fillStyle="rgba(52,211,153,0.4)"; ctx.font="9px 'DM Mono',monospace"; ctx.textAlign="left";
      ctx.fillText("BIO ENGINE · PHOTOSYNTHESIS · NEURAL COHERENCE · QUANTUM BIOLOGY · PLASMOID FIELD",14,18);
      rafRef.current=requestAnimationFrame(draw);
    };
    draw();
    return ()=>cancelAnimationFrame(rafRef.current);
  },[]);
  return <canvas ref={ref} style={{ width:"100%", height:"auto", borderRadius:8, display:"block" }} />;
}

export default function BioEnginePage() {
  return (
    <div className="min-h-screen w-full" style={{ background: B.bg }}>
      <main className="max-w-5xl mx-auto px-6 md:px-10 py-12 md:py-16" data-testid="bio-engine-page">
        <div style={{ marginBottom:24 }}>
          <div style={{ display:"inline-block", background:"rgba(52,211,153,0.07)", border:"1px solid rgba(52,211,153,0.22)",
            borderRadius:8, padding:"0.3rem 1rem", fontSize:"0.7rem", letterSpacing:"0.2em",
            color:"#34d399", textTransform:"uppercase", fontFamily:"monospace", marginBottom:12 }}>
            Live Simulation
          </div>
          <div style={{ background:"rgba(2,4,8,0.88)", border:"1px solid rgba(52,211,153,0.1)",
            borderLeft:"3px solid #34d399", borderRadius:10, padding:20 }}>
            <h2 style={{ fontFamily:"'Cinzel',serif", fontSize:18, color:"#d0f8e8", margin:"0 0 6px" }}>
              Bio Engine · Photosynthesis · Neural Coherence · Quantum Biology · Plasmoid Field
            </h2>
            <p style={{ fontFamily:"monospace", fontSize:12, color:"rgba(150,230,200,0.45)", margin:"0 0 14px", lineHeight:1.65 }}>
              Six biological engine systems (Photosynthesis/teal · Neural Coherence/violet · Quantum Biology/mint
              · Mycelium Network/gold · Plasmoid Field/rose · Bio Synthesis/blue) with energy packets streaming
              sequentially — the living AETHER bio-engine architecture.
            </p>
            <BioEngineCanvas />
          </div>
        </div>

        {/* HEADER */}
        <header className="mb-12">
          <div className="text-[10.5px] uppercase tracking-[0.36em]"
               style={{ color: B.mossDeep, fontFamily: "Inter, sans-serif" }}>
            Sustainable Organic Materials Engine · Land + Ocean Peace Computers
          </div>
          <h1 className="mt-2 text-[40px] md:text-[52px] leading-[1.05]"
              style={{ color: B.ink, fontFamily: "Cinzel, serif", letterSpacing: "0.02em" }}>
            The Bio-Engine
          </h1>
          <div className="mt-2 text-[15px]" style={{ color: B.text, maxWidth: "62ch" }}>
            A "peace computer" is a system whose useful work and whose participation in nature's cycles are the
            same act. It computes <em>by being there</em>: filtering, hosting, sheltering, fixing, feeding.
            Two prototypes — one for the ocean, one for the land — built from materials a beach or a barn could
            metabolize. Both follow the same five-part loop: <strong>intake → process → output → energy → repair</strong>.
          </div>
          <div className="mt-5 flex flex-wrap gap-2">
            <Chip c={B.ocean}     l="Counterflow vortex" />
            <Chip c={B.algae}     l="Algae + biofilm" />
            <Chip c={B.moss}      l="Mycelium · hempcrete" />
            <Chip c={B.wheat}     l="Generational rhythm" />
            <Chip c={B.clayDeep}  l="Self-repairing" />
            <Chip c={B.seaglass}  l="Solar + tidal energy" />
          </div>

          <div className="mt-6 rounded-md p-4 border"
               style={{ borderColor: B.borderWarm, background: B.panelWarm }}>
            <div className="text-[10px] uppercase tracking-[0.28em]"
                 style={{ color: B.wheatDeep, fontFamily: "Inter, sans-serif" }}>How to read this page</div>
            <p className="mt-1 text-[13.5px] leading-relaxed" style={{ color: B.textWarm }}>
              The page reads as a pair:{" "}
              <span style={{ color: B.oceanDeep, fontWeight: 600 }}>ocean engine</span> (the bio-boat with its
              counterflow vortex) and{" "}
              <span style={{ color: B.mossDeep, fontWeight: 600 }}>land engine</span> (the inherited Rheinland →
              Pennsylvania farm rhythm). Both are then read against{" "}
              <span style={{ color: B.clayDeep, fontWeight: 600 }}>biology's own quantum substrate</span>{" "}
              (photosynthesis, magnetoreception, enzyme tunneling). A symmetry table compares them; the honest
              line says exactly what is built today, what is tradition, and what is aspiration.
            </p>
          </div>
        </header>

        {/* SECTION 01 — DEFINITION */}
        <section className="mb-14" data-testid="section-definition">
          <H num="01" label="What Is a Peace Computer" accent={B.mossDeep} />
          <div className="grid md:grid-cols-3 gap-3">
            <Card accent={B.mossDeep} eyebrow="Definition" title="Compute = Cycle"
                  body="A peace computer's useful output and its participation in the local cycle (water, soil, light, breath) are the same operation. Removing the computer removes the cycle. Removing the cycle removes the computer." />
            <Card accent={B.oceanDeep} eyebrow="Substrate" title="Built from what decomposes"
                  body="Every part is sourced from a material the surrounding biome can absorb on its own clock. No exotic alloys, no permanent plastics, no mined rare earths." />
            <Card accent={B.clayDeep} eyebrow="Energy" title="Ambient only"
                  body="Sun, wind, tide, vibration, and the body heat of inhabitants. Battery storage is sized to one diurnal cycle, not to a brown-out scenario." />
          </div>
          <div className="mt-4 rounded-md p-4 border"
               style={{ borderColor: B.borderWarm, background: B.panelWarm }}>
            <div className="text-[10px] uppercase tracking-[0.28em]"
                 style={{ color: B.wheatDeep, fontFamily: "Inter, sans-serif" }}>Why "peace"</div>
            <p className="mt-1 text-[13px] leading-relaxed" style={{ color: B.textWarm }}>
              A war computer extracts surplus and exports waste. A peace computer reaches an equilibrium with the
              surrounding flow — its existence does not subtract from the system that hosts it. The bio-boat
              filters the water it floats on; the farm feeds the village whose hands tend it. Compute, in both
              cases, is the visible side of an exchange that was already happening.
            </p>
          </div>
        </section>

        {/* SECTION 02 — OCEAN ENGINE */}
        <section className="mb-14" data-testid="section-ocean">
          <H num="02" label="Ocean Engine · The Feedback-Loop Bio-Boat" accent={B.oceanDeep} />
          <p className="text-[14px] leading-relaxed mb-4" style={{ color: B.text }}>
            The ocean engine is a slow, biologically-grown floating platform. Six flexible spiral arms reach
            outward from a central solar dome. The arms are coated in algae and biofilm; pollutants and water
            flow inward, clean water and gentle thrust flow out. The same vortex that filters also propels —
            <strong> the boat moves because it cleans</strong>.
          </p>
          <ImgFig
            src={imgBoat}
            alt="Aerial-perspective concept rendering of the Feedback-Loop Bio-Boat: a circular platform with a central solar dome and six flexible biologically-grown spiral arms reaching outward into the ocean. Cormorants and pelicans rest on the dome. Yellow-and-blue arrows annotate the flow: water and pollutants pulled in along the arms, clean water spiraling out, a counterflow vortex at the center labeled 'Filter ↔ Cleaned Water,' and gentle continuous thrust arrows labeled 'self-sustaining thrust.' Captions describe biologically grown arms coated in algae and biofilm, and recurring vortex cycles that boost water purification."
            caption="Feedback-Loop Bio-Boat · Counterflow Vortex · Filter ↔ Thrust as one operation"
          />
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-3 mt-4">
            <Card accent={B.oceanDeep} eyebrow="Intake"  title="Polluted water in"
                  body="Spiral arm geometry pulls surface water and floating pollutants inward through the algae-biofilm sleeves." />
            <Card accent={B.seaglass} eyebrow="Process" title="Counterflow vortex"
                  body="A central rotating vortex separates particulate, oils, and nitrate-rich runoff. Algae fix the nitrate; mycelium binds the oils." />
            <Card accent={B.algae}    eyebrow="Output"  title="Clean water + biomass"
                  body="Filtered water exits radially. Captured nitrate-fed algae periodically harvested as feedstock or fertilizer." />
            <Card accent={B.wheat}    eyebrow="Energy"  title="Solar dome + tidal vortex"
                  body="Top-mounted PV powers the trickle-charge electronics. The vortex itself is the propulsion budget — no motor." />
            <Card accent={B.clay}     eyebrow="Repair"  title="Self-growing arms"
                  body="The flexible arms regrow biofilm coverage as they shed. Damaged segments are replaced with woven mycelium-basalt patches." />
            <Card accent={B.mossDeep} eyebrow="Compute" title="What it actually computes"
                  body="Continuous water-quality readouts (turbidity, pH, nitrate, dissolved O₂) are streamed off-platform via low-power LoRa. The boat is a moving, self-powered sensor mesh." />
          </div>
        </section>

        {/* SECTION 03 — LAND ENGINE */}
        <section className="mb-14" data-testid="section-land">
          <H num="03" label="Land Engine · Strebsame Ahnen · Inherited Rhythm" accent={B.mossDeep} />
          <p className="text-[14px] leading-relaxed mb-4" style={{ color: B.text }}>
            The land engine is older. It is the inherited rhythm of farm and dairy — Rheinland to Pennsylvania —
            running on daily, seasonal, generational, and yearly clocks. <em>Fleiss · Treue · Beständigkeit</em>
            (diligence · loyalty · constancy) is its protocol stack. Bellefonte milk delivery is its data bus.
            Local products are its output buffer. The peace computer here is the village + the land, computing
            steady caloric, social, and ecological yield across centuries.
          </p>
          <ImgFig
            src={imgAhnen}
            alt="Vintage Pennsylvania-Dutch fraktur-style poster titled 'Strebsame Ahnen' (Diligent Ancestors). Top panel shows a Rheinland river-valley with castle ruins on the left and a Pennsylvania town with a church steeple on the right under a banner reading 'Quality & Reliability — Fleiss · Treue · Beständigkeit · Vertrauen · Ordnung · Bestand.' Middle panel shows a horse-drawn 'DAIRY' delivery wagon labeled 'Bellefonte Milk Delivery' on the left and a basket of breads, jars, and preserves labeled 'Local Products' on the right. Bottom row: four circular medallions for daily (sun), seasonal (wheat sheaf), generational (oak tree), and yearly (snowflake) cycles, captioned in German — Täglich, Saisonal, Generations, Jährlich — under a banner reading 'Ordnung und Beständigkeit.'"
            caption="Strebsame Ahnen · Rheinland → Pennsylvania · Daily · Seasonal · Generational · Yearly"
          />
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-3 mt-4">
            <Card accent={B.mossDeep} eyebrow="Intake"  title="Sun, rain, labor, seed"
                  body="The daily clock. Inputs are not metered — they are accepted from the sky and from the family." />
            <Card accent={B.algae}    eyebrow="Process" title="Soil + cattle + pasture rotation"
                  body="The seasonal clock. Multi-species rotation keeps the soil ledger positive across years, not weeks." />
            <Card accent={B.wheat}    eyebrow="Output"  title="Milk · grain · bread · preserves"
                  body="Daily delivery (Bellefonte run) + seasonal store. The output is biological, edible, and locally consumed." />
            <Card accent={B.clay}     eyebrow="Energy"  title="Caloric + animal + wind + water"
                  body="The pre-fossil energy mix. Animal traction, water-mill grain, fire-baked goods. Intermittent, sufficient, repairable." />
            <Card accent={B.clayDeep} eyebrow="Repair"  title="Generational + yearly cycles"
                  body="The oak in the medallion is the generational clock. Fences mended every spring. Apprenticeship in winter. Identity preserved by repetition." />
            <Card accent={B.wheatDeep} eyebrow="Compute" title="What it actually computes"
                  body="Settlement-scale optimization across centuries: which crop, which animal, which child to which trade, which day to deliver. The output is a stable culture." />
          </div>

          <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-2">
            {[
              { c: B.wheat,    l: "Täglich · Daily" },
              { c: B.algae,    l: "Saisonal · Seasonal" },
              { c: B.mossDeep, l: "Generations · Generational" },
              { c: B.ocean,    l: "Jährlich · Yearly" },
            ].map((c) => (
              <div key={c.l} className="rounded-md p-3 border text-center"
                   style={{ borderColor: B.borderWarm, background: B.panelWarm }}>
                <div className="text-[11px] uppercase tracking-[0.28em]"
                     style={{ color: c.c, fontFamily: "Inter, sans-serif" }}>{c.l}</div>
              </div>
            ))}
          </div>
        </section>

        {/* SECTION 04 — LIVING SUBSTRATE */}
        <section className="mb-14" data-testid="section-substrate">
          <H num="04" label="Living Substrate · Quantum Effects in Living Cells" accent={B.clayDeep} />
          <p className="text-[14px] leading-relaxed mb-4" style={{ color: B.text }}>
            The reason organic material is a credible computational substrate is that biology already computes
            with quantum-coherent processes — photosynthetic exciton transport, radical-pair magnetoreception in
            birds, proton/electron tunneling in enzymes. The bio-engine does not <em>add</em> these phenomena;
            it <em>chooses materials that host them</em> and lets the cycle do the work.
          </p>
          <ImgFig
            src={imgQuantumCells}
            alt="Three-panel illustration titled 'Quantum Effects in Living Cells.' Left panel: Photosynthesis — a green leaf with light arrows entering a chloroplast labeled 'Reaction Center,' annotated 'Energy Transfer · Quantum Coherence · Exciton Pathways (Superposition).' Right panel: Bird Navigation — a robin perched on a globe with magnetic-field arrows wrapping around it and a cartoon 'radical pair' showing two entangled electrons labeled 'Magnetic Sense · Quantum Entanglement · Magnetoreception in Birds.' Bottom panel: Enzyme Reactions — a DNA strand crossing through enzyme symbols with arrows labeled 'Quantum Tunneling · Proton or Electron Tunneling · Accelerated Biochemical Reactions.' A central Venn-diagram glyph labels the joining concept 'Quantum Biology · Coherence · Entanglement.'"
            caption="Quantum Effects in Living Cells · Photosynthesis · Magnetoreception · Enzyme Tunneling"
          />
          <div className="grid md:grid-cols-3 gap-3 mt-4">
            <Card accent={B.algae}     eyebrow="Photosynthesis" title="Coherent exciton transport"
                  body="Energy hops through the FMO complex with very high efficiency. Brief superposition of exciton pathways is one proposed mechanism still under active study. Algae on the bio-boat host the same molecular machinery — whether the engine exploits the coherence is open." />
            <Card accent={B.ocean}     eyebrow="Magnetoreception" title="Radical-pair compass"
                  body="A photochemical radical pair in the bird's cryptochrome appears sensitive to Earth's magnetic field through coherent spin dynamics. The mechanism is well-attested in vivo; using it as a passive geomagnetic sensor in the bio-engine is inspiration, not implementation." />
            <Card accent={B.wheatDeep} eyebrow="Enzymes"        title="Proton + electron tunneling"
                  body="Many enzymes accelerate reactions through tunneling rather than over-the-barrier hopping. Treating the slow remediation chemistry of mycelium and biofilm communities through this lens is an interpretive frame, not a demonstrated engineering pathway." />
          </div>
        </section>

        {/* SECTION 05 — MATERIAL STACK */}
        <section className="mb-14" data-testid="section-materials">
          <H num="05" label="Material Stack · What Each Engine Is Built Of" accent={B.clay} />
          <div className="grid md:grid-cols-2 gap-4">
            <div className="rounded-md p-4 border" style={{ borderColor: B.border, background: B.panel }}>
              <div className="text-[10px] uppercase tracking-[0.28em]"
                   style={{ color: B.oceanDeep, fontFamily: "Inter, sans-serif" }}>Ocean Engine · Bill of Materials</div>
              <div className="mt-3 flex flex-wrap gap-2">
                {MATERIALS_OCEAN.map((m) => <Chip key={m.l} {...m} />)}
              </div>
              <p className="mt-3 text-[13px] leading-relaxed" style={{ color: B.text }}>
                Hull from cast calcium-silicate over a cork core. Spiral arms are mycelium-bonded basalt
                rope wrapped in algae-receptive biofilm. Solar dome glass is the only non-biotic part —
                replaceable, recyclable, single-source.
              </p>
            </div>
            <div className="rounded-md p-4 border" style={{ borderColor: B.border, background: B.panel }}>
              <div className="text-[10px] uppercase tracking-[0.28em]"
                   style={{ color: B.mossDeep, fontFamily: "Inter, sans-serif" }}>Land Engine · Bill of Materials</div>
              <div className="mt-3 flex flex-wrap gap-2">
                {MATERIALS_LAND.map((m) => <Chip key={m.l} {...m} />)}
              </div>
              <p className="mt-3 text-[13px] leading-relaxed" style={{ color: B.text }}>
                Walls are hempcrete or straw + clay daub on a reclaimed-timber frame. Skin is lime-render
                with iron-tannin sealant — a Pennsylvania-Dutch heritage finish that ages instead of failing.
                Insulation is mycelium block.
              </p>
            </div>
          </div>
        </section>

        {/* SECTION 06 — SYMMETRY TABLE */}
        <section className="mb-14" data-testid="section-symmetry">
          <H num="06" label="Land · Ocean · Symmetry" accent={B.wheatDeep} />
          <p className="text-[14px] leading-relaxed mb-4" style={{ color: B.text }}>
            The same five-part loop runs in both engines. Read across the rows to see the pattern.
          </p>
          <div className="rounded-md border overflow-hidden"
               style={{ borderColor: B.borderWarm, background: B.panel }}>
            <table className="w-full text-[13px]" style={{ color: B.text }}>
              <thead>
                <tr style={{ background: B.panelWarm }}>
                  <th className="text-left px-3 py-2 text-[10.5px] uppercase tracking-[0.22em]"
                      style={{ color: B.muted }}>Step</th>
                  <th className="text-left px-3 py-2 text-[10.5px] uppercase tracking-[0.22em]"
                      style={{ color: B.oceanDeep }}>Ocean Engine</th>
                  <th className="text-left px-3 py-2 text-[10.5px] uppercase tracking-[0.22em]"
                      style={{ color: B.mossDeep }}>Land Engine</th>
                </tr>
              </thead>
              <tbody>
                {[
                  ["Intake",  "Polluted seawater + floating debris", "Sun, rain, seed, family labor"],
                  ["Process", "Counterflow vortex + algae + biofilm", "Pasture rotation + dairy + mill"],
                  ["Output",  "Clean water + biomass + sensor stream", "Milk, grain, bread, preserves"],
                  ["Energy",  "Solar dome + tidal vortex (free)",     "Animal traction + caloric + wind/water"],
                  ["Repair",  "Self-growing biofilm; mycelium patches", "Generational apprenticeship; spring mending"],
                  ["Compute", "Distributed water-quality mesh",         "Settlement-scale multi-decade optimisation"],
                ].map(([step, ocean, land], i) => (
                  <tr key={step} style={{ background: i % 2 === 0 ? B.panel : B.panelWarm }}>
                    <td className="px-3 py-2 align-top text-[11px] uppercase tracking-[0.22em]"
                        style={{ color: B.wheatDeep, fontFamily: "Inter, sans-serif" }}>{step}</td>
                    <td className="px-3 py-2 align-top">{ocean}</td>
                    <td className="px-3 py-2 align-top">{land}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* SECTION 07 — HONEST LINE */}
        <section className="mb-14" data-testid="section-honest">
          <H num="07" label="The Honest Line" accent={B.muted} />
          <div className="rounded-md p-5 border space-y-3"
               style={{ borderColor: B.borderWarm, background: B.panelWarm }}>
            <p className="text-[13.5px] leading-relaxed" style={{ color: B.textWarm }}>
              <span style={{ color: B.mossDeep, fontWeight: 600 }}>Tradition (already proven):</span>{" "}
              the land engine. Three centuries of Rheinland → Pennsylvania farms have run this loop.
              Hempcrete, straw-clay, lime-render, mycelium block, iron-tannin sealant — all in active use today.
            </p>
            <p className="text-[13.5px] leading-relaxed" style={{ color: B.textWarm }}>
              <span style={{ color: B.oceanDeep, fontWeight: 600 }}>Prototype (built, not at scale):</span>{" "}
              floating biofilm-coated wave-attenuators and algae-fed remediation rafts exist in pilot deployments.
              The integrated bio-boat with the counterflow vortex and self-sustaining thrust is, today, a credible
              concept built from existing parts — not a shipping product.
            </p>
            <p className="text-[13.5px] leading-relaxed" style={{ color: B.textWarm }}>
              <span style={{ color: B.clayDeep, fontWeight: 600 }}>Inspirational science (real but indirect):</span>{" "}
              quantum coherence in photosynthesis, radical-pair magnetoreception, and enzyme tunneling are
              experimentally confirmed phenomena. Whether they are <em>computationally exploitable</em> by an
              engineered bio-engine is an open question. The page treats them as substrate, not as mechanism.
            </p>
            <p className="text-[13.5px] leading-relaxed" style={{ color: B.muted, fontStyle: "italic" }}>
              The "peace computer" framing is a design ethic, not a marketing claim. It defines what the engine
              <em> may not do</em> (extract surplus, export waste, exceed local cycle rates), and lets engineering
              find the rest.
            </p>
          </div>
        </section>

        {/* SECTION 08 — BRIDGES */}
        <section className="mb-4" data-testid="section-bridges">
          <H num="08" label="Bridges Inside AETHER" accent={B.mossDeep} />
          <p className="text-[14px] leading-relaxed mb-4" style={{ color: B.text, maxWidth: "62ch" }}>
            The bio-engine sits inside a wider AETHER conversation about living substrates, ecological
            intelligence, and biomimetic computation.
          </p>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-3">
            <Bridge to="/feedback-loop" eyebrow="Closed loop" title="Feedback Loop"
                    body="The general theory of self-sustaining cycles that the bio-boat realises in seawater."
                    accent={B.oceanDeep} />
            <Bridge to="/biomimetic-symphony" eyebrow="Biomimicry" title="Biomimetic Symphony"
                    body="The musical-system reading of co-acting biological agents. The land engine is its multi-generational tempo."
                    accent={B.mossDeep} />
            <Bridge to="/ecological-intelligence" eyebrow="Cognition" title="Ecological Intelligence"
                    body="What the village + the land + the herd compute together. The land engine's compute output."
                    accent={B.algae} />
            <Bridge to="/biomimetic-quantum" eyebrow="Substrate" title="Biomimetic Quantum"
                    body="The quantum-biology layer — where photosynthesis, magnetoreception, and enzyme tunneling formally enter AETHER."
                    accent={B.clayDeep} />
            <Bridge to="/biology" eyebrow="Atlas" title="Biology"
                    body="The catalog of biological systems AETHER reads as engines."
                    accent={B.wheatDeep} />
            <Bridge to="/plant-intel" eyebrow="Pre-neural" title="Plant Intel · Pre-Neural"
                    body="Why the land engine works without a brain at the centre — distributed plant cognition."
                    accent={B.algae} />
          </div>
        </section>

        <footer className="mt-14 pt-6 border-t" style={{ borderColor: B.borderWarm }}>
          <div className="text-[10.5px] uppercase tracking-[0.32em]"
               style={{ color: B.muted, fontFamily: "Inter, sans-serif" }}>
            AETHER · Bio-Engine · Land + Ocean Peace Computers · /bio-engine
          </div>
        </footer>
      </main>
    </div>
  );
}
