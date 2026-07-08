import { useEffect, useRef } from "react";
import { Link } from "wouter";
import { ArrowUpRight } from "lucide-react";
import imgPaper from "@assets/ChatGPT_Image_Apr_26,_2026,_02_25_54_PM_1777227956352.png";

const B = {
  bg:        "#F1ECDC",
  panel:     "#FAF6E8",
  panelWarm: "#EFE6CD",
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

const FACTS = [
  { c: B.algae,    l: "λ ≈ 0.035–0.048 W/m·K" },
  { c: B.moss,     l: "ROOM-TEMPERATURE GROWTH" },
  { c: B.clay,     l: "FULLY BIODEGRADABLE" },
  { c: B.wheatDeep,l: "FIRE-CHAR · NATURAL" },
  { c: B.ocean,    l: "BREATHABLE · HYDROPHOBIC WHEN CURED" },
];

const REFS = [
  "UTS News on mycelium blocks (2025)",
  "Studies on fire properties of MBCs",
  "Cornell biohybrid robots with mycelial control (2024)",
  "Robotic mycelium fabrication projects (2025)",
  "Flash Joule heating applications for nanodiamonds",
];

function MyceliumNetworkCanvas() {
  const cvRef = useRef<HTMLCanvasElement>(null);
  const rafRef = useRef(0);
  const tRef = useRef(0);
  const W = 860, H = 280;
  useEffect(() => {
    const cv = cvRef.current; if (!cv) return;
    const ctx = cv.getContext("2d"); if (!ctx) return;
    cv.width = W; cv.height = H;
    type Branch = { x: number; y: number; angle: number; len: number; depth: number; age: number };
    const rng = (seed: number) => {
      let s = seed;
      return () => { s = (s * 1664525 + 1013904223) & 0xffffffff; return (s >>> 0) / 0xffffffff; };
    };
    const rand = rng(42);
    const branches: Branch[] = [];
    const MAX_DEPTH = 7;
    function sprout(x: number, y: number, angle: number, len: number, depth: number) {
      if (depth > MAX_DEPTH || len < 3) return;
      branches.push({ x, y, angle, len, depth, age: 0 });
    }
    for (let i = 0; i < 5; i++) sprout(W * (0.1 + i * 0.2), H, -Math.PI / 2 + (rand() - 0.5) * 0.3, 60 + rand() * 20, 0);
    const grown: Branch[] = [];
    function step() {
      if (branches.length === 0) return;
      const b = branches.shift()!;
      grown.push({ ...b });
      const ex = b.x + Math.cos(b.angle) * b.len;
      const ey = b.y + Math.sin(b.angle) * b.len;
      if (b.depth < MAX_DEPTH && ey > 10) {
        const nlen = b.len * (0.62 + rand() * 0.12);
        sprout(ex, ey, b.angle + (rand() - 0.5) * 0.7, nlen, b.depth + 1);
        if (rand() < 0.65) sprout(ex, ey, b.angle + (rand() - 0.5) * 1.2, nlen * 0.7, b.depth + 2);
      }
    }
    for (let i = 0; i < 200; i++) step();
    function draw() {
      ctx.clearRect(0, 0, W, H);
      ctx.fillStyle = "#F1ECDC"; ctx.fillRect(0, 0, W, H);
      const t = tRef.current;
      grown.forEach((b, i) => {
        const pulse = 0.55 + 0.35 * Math.sin(t * 0.025 + i * 0.15);
        const ex = b.x + Math.cos(b.angle) * b.len;
        const ey = b.y + Math.sin(b.angle) * b.len;
        const thick = Math.max(0.4, (MAX_DEPTH - b.depth) * 0.6);
        ctx.beginPath();
        ctx.moveTo(b.x, b.y);
        ctx.lineTo(ex, ey);
        const alpha = Math.round(pulse * 200).toString(16).padStart(2, "0");
        ctx.strokeStyle = b.depth < 3 ? `#3F5A2C${alpha}` : b.depth < 5 ? `#5A7C45${alpha}` : `#86A36F${alpha}`;
        ctx.lineWidth = thick;
        ctx.stroke();
      });
      for (let p = 0; p < 6; p++) {
        const px = (t * 0.8 + p * 143) % W;
        const py = 40 + (p * 47) % (H - 60);
        const a = 0.35 + 0.25 * Math.sin(t * 0.04 + p);
        ctx.beginPath();
        ctx.arc(px, py, 2.5 + Math.sin(t * 0.03 + p) * 1.2, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(134,163,111,${a})`;
        ctx.fill();
      }
      ctx.fillStyle = "rgba(63,90,44,0.5)";
      ctx.font = "8px 'Space Mono', monospace";
      ctx.fillText("MYCELIUM NETWORK · BRANCHING GROWTH SIMULATION", 10, H - 10);
      tRef.current += 0.5;
      rafRef.current = requestAnimationFrame(draw);
    }
    draw();
    return () => cancelAnimationFrame(rafRef.current);
  }, []);
  return <canvas ref={cvRef} style={{ width:"100%", height:"auto", display:"block", borderRadius:6 }} />;
}

export default function MyceliumSubstratePage() {
  return (
    <div className="min-h-screen px-4 sm:px-6 lg:px-8 py-10" style={{ background: B.bg }} data-testid="mycelium-substrate-page">
      <div className="max-w-5xl mx-auto">

        {/* HEADER */}
        <header className="mb-10">
          <div className="text-[10.5px] uppercase tracking-[0.32em] mb-2"
               style={{ color: B.mossDeep, fontFamily: "Inter, sans-serif" }}>
            Shia Miller (@StrategicProce) · A Living Computational Substrate
          </div>
          <h1 className="text-[44px] leading-[1.05] tracking-tight"
              style={{ color: B.ink, fontFamily: "Cinzel, serif" }}>Mycelium Bricks</h1>
          <p className="text-[14.5px] mt-4 leading-relaxed max-w-3xl" style={{ color: B.textWarm }}>
            A reading of Shia Miller's April 2026 paper, <em>"A Living Computational Substrate:
            Mycelium-Based Bricks and Binders for Closed-Loop Residential Bio-Mechanical
            Systems."</em> The paper synthesises an emerging paradigm: mycelium-compressed
            bio-mechanical blocks that function as both <strong>structural elements</strong> and
            <strong> living computational substrates</strong>. Grown robotically within fixed
            residential confines, the blocks leverage the fungus's hyphal network — a
            three-dimensional microscopic web of filaments — as a natural binder and recursive
            processor.
          </p>
          <div className="mt-5 flex flex-wrap gap-2">
            {FACTS.map((f) => <Chip key={f.l} {...f} />)}
          </div>
          <div style={{ marginTop:24 }}>
            <div style={{ display:"inline-block", background:"rgba(90,124,69,0.12)", border:"1px solid rgba(90,124,69,0.3)",
              borderRadius:8, padding:"0.3rem 1rem", fontSize:"0.7rem", letterSpacing:"0.2em",
              color:B.mossDeep, textTransform:"uppercase", fontFamily:"Inter,sans-serif", marginBottom:12 }}>
              Live Simulation
            </div>
            <div style={{ background:B.panel, border:`1px solid ${B.border}`, borderLeft:`3px solid ${B.mossDeep}`,
              borderRadius:10, padding:20 }}>
              <h2 style={{ fontFamily:"Cinzel,serif", fontSize:18, color:B.ink, margin:"0 0 6px" }}>
                Mycelium Network · Branching Growth Simulation
              </h2>
              <p style={{ fontFamily:"Inter,sans-serif", fontSize:12, color:B.muted, margin:"0 0 14px", lineHeight:1.65 }}>
                Five root nodes sprout from the base, each branching recursively up to depth 7 with organic angular jitter
                (growth constant k=0.62). Pulse amplitude breathes slowly. Drifting spore particles represent nutrient transport.
              </p>
              <MyceliumNetworkCanvas />
            </div>
          </div>

          <div className="mt-6 rounded-md p-4 border" style={{ borderColor: B.border, background: B.panelWarm }}>
            <div className="text-[10px] uppercase tracking-[0.32em] mb-2"
                 style={{ color: B.clayDeep, fontFamily: "Inter, sans-serif" }}>How to read this page</div>
            <p className="text-[13px] leading-relaxed" style={{ color: B.textWarm }}>
              Read it as the paper's own outline: <strong style={{ color: B.mossDeep }}>abstract</strong>
              → <strong style={{ color: B.ocean }}>mycelium as binder + structural matrix</strong>
              → <strong style={{ color: B.rust }}>fire and mold resistance</strong>
              → <strong style={{ color: B.wheatDeep }}>the computational layer (recursive loops in
              hyphal networks)</strong> → <strong style={{ color: B.clayDeep }}>closed-loop
              residential bio-mechanical systems</strong> → <strong style={{ color: B.mossDeep }}>
              selected references</strong> → <strong style={{ color: B.muted }}>honest line</strong>.
            </p>
          </div>
        </header>

        {/* THE PAPER */}
        <section className="mb-14" data-testid="section-paper">
          <ImgFig
            src={imgPaper}
            alt="First page of Shia Miller's April 2026 academic paper on mycelium-based bricks as a living computational substrate, with abstract, sections on mycelium as binder and structural matrix, fire and mold resistance, the computational layer of hyphal networks, and a selected references list."
            caption="Shia Miller · the source paper"
          />
        </section>

        {/* SECTION 01 — ABSTRACT */}
        <section className="mb-14" data-testid="section-abstract">
          <H num="01" label="Abstract · Two Functions in One Block" accent={B.mossDeep} />
          <p className="text-[14px] leading-relaxed mb-3" style={{ color: B.text }}>
            One block, two roles. The structural role is what the building inspector sees: a
            lightweight insulating brick that meets thermal and acoustic specifications. The
            computational role is what the building <em>does</em> while it stands: the hyphal
            network inside each block transmits chemical and electrical signals, and the wall
            becomes a slow, distributed sensor of its own internal climate.
          </p>
          <div className="grid md:grid-cols-2 gap-3">
            <Card accent={B.mossDeep} eyebrow="Substrate" title="Lignocellulose + hyphae"
                  body="Sawdust, straw, hemp, or bagasse colonised by mycelium. The hyphae form a 3D web that binds the substrate and, at the same time, provides the conductive medium for slow biological signalling." />
            <Card accent={B.clayDeep} eyebrow="Process" title="Robotic in situ growth"
                  body="The paper's distinguishing move: blocks are grown robotically within fixed residential confines — the wall fabricates the wall. Curing happens at room temperature, with minimal energy input, fully biodegradable at end of life." />
          </div>
        </section>

        {/* SECTION 02 — BINDER */}
        <section className="mb-14" data-testid="section-binder">
          <H num="02" label="Mycelium as Binder + Structural Matrix" accent={B.ocean} />
          <p className="text-[14px] leading-relaxed mb-4" style={{ color: B.text }}>
            The mechanical case for the material — the part that has to satisfy a contractor
            before any of the computational claims matter.
          </p>
          <div className="grid md:grid-cols-3 gap-3">
            <Card accent={B.ocean} eyebrow="Thermal · acoustic" title="λ ≈ 0.035–0.048 W/m·K"
                  body="Reported thermal conductivity puts cured mycelium-based composites in the same band as conventional polymer insulation, with comparable acoustic absorption." />
            <Card accent={B.moss}  eyebrow="Mechanical" title="Insulation panels + interior walls"
                  body="The reported strength envelope is sufficient for non-load-bearing insulation panels and interior partition walls. The paper does not claim primary structural use." />
            <Card accent={B.algae} eyebrow="Moisture" title="Breathable + hydrophobic when cured"
                  body="Properly cured composites breathe (vapour permeable) yet shed liquid water — the combination that conventional foam insulation cannot offer." />
          </div>
        </section>

        {/* SECTION 03 — FIRE + MOLD */}
        <section className="mb-14" data-testid="section-fire-mold">
          <H num="03" label="Fire + Mold Resistance" accent={B.rust} />
          <p className="text-[14px] leading-relaxed mb-3" style={{ color: B.text }}>
            Two failure modes that traditionally rule out organic insulation. The paper reports
            that mycelium composites address both natively, without added flame-retardants or
            biocides.
          </p>
          <div className="grid md:grid-cols-2 gap-3">
            <Card accent={B.rust}      eyebrow="Fire" title="Char-layer thermal barrier"
                  body="On exposure to flame, mycelium composites char rather than combust freely. The char layer acts as a thermal barrier that slows further pyrolysis — a natural fire-retardant geometry, not a chemical additive." />
            <Card accent={B.mossDeep}  eyebrow="Mold" title="Outcompetes by colonisation"
                  body="The living mycelium itself outcompetes mold via rapid colonisation and antimicrobial metabolites. The wall stays viable as long as it stays alive on its own terms." />
          </div>
        </section>

        {/* SECTION 04 — COMPUTATIONAL LAYER */}
        <section className="mb-14" data-testid="section-compute">
          <H num="04" label="The Computational Layer · Recursive Loops in Hyphal Networks" accent={B.wheatDeep} />
          <p className="text-[14px] leading-relaxed mb-3" style={{ color: B.text }}>
            This is the part of the paper that is interesting beyond construction. Mycelium
            networks transmit electrical signals in the form of action-potential-like spikes,
            with patterns that respond to chemical and mechanical stimuli. The hyphal web is a
            distributed signalling medium, and a wall built from many blocks is — in principle —
            a reservoir-style processor with a very low clock and a very large physical extent.
          </p>
          <div className="grid md:grid-cols-3 gap-3">
            <Card accent={B.wheatDeep} eyebrow="Signal" title="Hyphal action potentials"
                  body="Action-potential-like spikes propagate along hyphae in response to local stimuli. The paper treats this signalling as the substrate's native primitive — slow, but real and measurable." />
            <Card accent={B.algae}     eyebrow="Topology" title="3D recursive loops"
                  body="The hyphal network is densely loop-rich. The paper frames this loop topology as the source of the substrate's recursive-processor character, not an incidental property of growth." />
            <Card accent={B.clayDeep}  eyebrow="Read-out" title="Electrode + chemical probes"
                  body="Read-out is by embedded electrodes and chemical probes — the same techniques used in plant-electrophysiology and biofilm studies. Engineering work, not new physics." />
          </div>
        </section>

        {/* SECTION 05 — CLOSED LOOP */}
        <section className="mb-14" data-testid="section-closed-loop">
          <H num="05" label="Closed-Loop Residential Bio-Mechanical Systems" accent={B.clayDeep} />
          <p className="text-[14px] leading-relaxed mb-3" style={{ color: B.text }}>
            The paper's framing question: what does the building gain when its walls are alive?
            A closed loop of growth, sense, response, and repair, where the structure and the
            controller are the same material.
          </p>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-3">
            <Card accent={B.mossDeep} eyebrow="Grow"   title="Robotic in-place fabrication"
                  body="Blocks colonise their final location during curing. There is no separate factory step." />
            <Card accent={B.ocean}    eyebrow="Sense"  title="Climate · strain · chemistry"
                  body="The hyphal network reads its own thermal, mechanical, and chemical environment as part of its ordinary signalling life." />
            <Card accent={B.wheatDeep} eyebrow="Respond" title="Slow control loop"
                  body="Sensor data drives slow control actions: ventilation cues, humidity adjustment, occupant alerting — at biological, not silicon, timescales." />
            <Card accent={B.rust}     eyebrow="Repair"  title="Re-colonisation"
                  body="Damaged sections can be re-colonised by feeding new substrate to the surviving hyphal margin. Repair is biological, not material-replacement." />
          </div>
        </section>

        {/* SECTION 06 — REFERENCES */}
        <section className="mb-14" data-testid="section-references">
          <H num="06" label="Selected References (from the paper)" accent={B.mossDeep} />
          <ul className="rounded-md border p-4 space-y-2" style={{ borderColor: B.border, background: B.panel }}>
            {REFS.map((r) => (
              <li key={r} className="text-[13px] leading-relaxed" style={{ color: B.textWarm, fontFamily: "Inter, sans-serif" }}>
                <span style={{ color: B.mossDeep }}>·</span> {r}
              </li>
            ))}
          </ul>
        </section>

        {/* SECTION 07 — HONEST LINE */}
        <section className="mb-14" data-testid="section-honest">
          <H num="07" label="Honest Line · What Is Reported, What Is Open" accent={B.muted} />
          <div className="grid md:grid-cols-3 gap-3">
            <Card accent={B.moss}      eyebrow="Reported · supported" title="Material properties"
                  body="The thermal/acoustic figures, the breathable-yet-hydrophobic behaviour after curing, the natural char-layer fire response, and the antimicrobial outcompeting of mold are all discussed in the literature the paper cites." />
            <Card accent={B.wheatDeep} eyebrow="Reported · early-stage" title="Computational claims"
                  body="Hyphal action potentials are real and measured. Treating a wall of MBC blocks as a usable reservoir computer is an extrapolation — the paper presents it as a research direction, not a deployed capability." />
            <Card accent={B.clay}      eyebrow="Open" title="Robotic in-place growth"
                  body="The picture of blocks grown robotically inside a residence, with the wall fabricating the wall, is an aspirational scenario. The fabrication, sensing, and repair steps are individually demonstrated; their integration into a residential closed loop is not." />
          </div>
        </section>

        {/* SECTION 08 — BRIDGES */}
        <section data-testid="section-bridges">
          <H num="08" label="Bridges · Where the Living Brick Meets the Stack" accent={B.mossDeep} />
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
            <Bridge to="/bio-engine"             label="Bio-Engine · Land + Ocean"          accent={B.mossDeep} />
            <Bridge to="/bio-hybrid-mirror"      label="Bio-Hybrid · Visible Thinking"      accent={B.ocean} />
            <Bridge to="/biology"                label="Biology · Living Components"        accent={B.algae} />
            <Bridge to="/ecological-intelligence" label="Ecological Intelligence"           accent={B.wheatDeep} />
            <Bridge to="/biomimetic-symphony"    label="Biomimetic Symphony"                accent={B.clayDeep} />
            <Bridge to="/biomimetic-quantum"     label="Biomimetic Quantum"                 accent={B.rust} />
          </div>
        </section>

      </div>
    </div>
  );
}
