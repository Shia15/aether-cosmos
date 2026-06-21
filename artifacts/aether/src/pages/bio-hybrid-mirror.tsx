import { useEffect, useRef } from "react";
import { Link } from "wouter";
import { ArrowUpRight } from "lucide-react";
import imgQuad from "@assets/ChatGPT_Image_Apr_26,_2026,_02_24_45_PM_1777227890013.png";

const B = {
  bg:        "#06080f",
  panel:     "#0c1120",
  panelLite: "#121830",
  ink:       "#eef2ff",
  text:      "rgba(220,226,255,0.78)",
  textWarm:  "rgba(220,226,255,0.90)",
  muted:     "rgba(220,226,255,0.46)",
  border:    "rgba(180,196,255,0.14)",
  cyan:      "#7be4ea",
  green:     "#7be59f",
  amber:     "#f5b942",
  gold:      "#e9b94e",
  violet:    "#b48cff",
  blue:      "#7cc8ff",
  rose:      "#f59ec3",
  red:       "#ff7a6a",
};

function H({ num, label, accent = B.cyan }: { num: string; label: string; accent?: string }) {
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

const RLBHC = [
  { c: B.cyan,   l: "GEL SCAFFOLD" },
  { c: B.green,  l: "BIOCHEMICAL LOGIC · DNA" },
  { c: B.amber,  l: "SENSOR NODES" },
  { c: B.violet, l: "CONDUCTIVE PATHWAYS" },
  { c: B.rose,   l: "FPGA CONTROL CHIP" },
];

const AETHER_FIELD = [
  { c: B.violet, l: "MEMORY FIELD · MNESIS" },
  { c: B.cyan,   l: "LOGIC ROUTING · ALETHEIA" },
  { c: B.amber,  l: "PROCESSING AGENTS · INFERIA" },
  { c: B.rose,   l: "INCOMING SIGNALS · REVERIE" },
];

const LAYERS = [
  { c: B.blue,   name: "Memory + State Field",     map: "Mnesis" },
  { c: B.green,  name: "Signal Routing + Logic Flow", map: "Aletheia" },
  { c: B.amber,  name: "Bio-Compute Layer",         map: "Inferia" },
  { c: B.rose,   name: "Sensing Layer",             map: "afferent boundary" },
  { c: B.red,    name: "Mood + Input Detection",    map: "Reverie" },
];

const MAPPING = [
  { row: "Substrate",   bhc: "DNA + gel scaffold + biochemical logic gates",          aether: "Memory field (Mnesis) — holographic state distribution" },
  { row: "Wiring",      bhc: "Conductive pathways + sensor nodes",                    aether: "Logic routing (Aletheia) — coherence-aligned flow" },
  { row: "Computation", bhc: "FPGA control chip orchestrating biochemical reactions", aether: "Processing agents (Inferia) — task-specific solvers" },
  { row: "Input",       bhc: "Sensor nodes (chem · mech · optical)",                  aether: "Incoming signals (Reverie) — afferent stream" },
  { row: "State view",  bhc: "Pulsing nodes + dynamic luminance in the gel volume",   aether: "Energy currents + emotion-and-logic colour scheme" },
  { row: "Identity",    bhc: "Volumetric (a cube you can see into)",                  aether: "Field (a topology you can be inside)" },
];

const VISIBLE = [
  { c: B.amber, eyebrow: "Energy currents", title: "Pathways become visible",
    body: "Active routes between regions glow as currents — the wiring is not implied, it is on display." },
  { c: B.green, eyebrow: "Pulsing nodes", title: "Activity is luminous",
    body: "Nodes pulse on the rhythm of their own update bus. Diagnostics are an ambient property, not a separate dashboard." },
  { c: B.cyan, eyebrow: "Dynamic states", title: "Topology shifts in time",
    body: "The configuration of glow — which nodes are bright, which paths are warm — is the state. There is no hidden register." },
  { c: B.rose, eyebrow: "Emotion + logic colours", title: "A two-axis legend",
    body: "Hue carries logic class; saturation/temperature carries affective load. Two glances tell you both what is happening and how the system feels about it." },
];

function BioHybridCanvas() {
  const cvRef = useRef<HTMLCanvasElement>(null);
  const rafRef = useRef(0);
  const tRef = useRef(0);
  const W = 860, H = 260;
  useEffect(() => {
    const cv = cvRef.current; if (!cv) return;
    const ctx = cv.getContext("2d"); if (!ctx) return;
    cv.width = W; cv.height = H;
    function draw() {
      ctx.clearRect(0, 0, W, H);
      ctx.fillStyle = "#06080f"; ctx.fillRect(0, 0, W, H);
      const t = tRef.current;
      const midX = W / 2;
      ctx.strokeStyle = "rgba(180,196,255,0.15)"; ctx.lineWidth = 1;
      ctx.setLineDash([4, 6]);
      ctx.beginPath(); ctx.moveTo(midX, 0); ctx.lineTo(midX, H); ctx.stroke();
      ctx.setLineDash([]);
      const ROWS = 6;
      for (let row = 0; row < ROWS; row++) {
        const y = 30 + row * ((H - 40) / ROWS);
        const baseFreq = 0.04 + row * 0.008;
        for (let side = 0; side < 2; side++) {
          const color = side === 0 ? "#7be59f" : "#b48cff";
          const phaseShift = side === 0 ? 0 : Math.PI;
          ctx.beginPath();
          for (let x = 0; x <= midX - 10; x++) {
            const sx = side === 0 ? x : W - x;
            const amp = 12 + 6 * Math.sin(t * 0.02 + row * 0.9);
            const wave = Math.sin((x / (midX - 10)) * Math.PI * 4 + t * baseFreq + phaseShift);
            const py = y + wave * amp;
            if (x === 0) ctx.moveTo(sx, py); else ctx.lineTo(sx, py);
          }
          ctx.strokeStyle = color + "99"; ctx.lineWidth = 1.4; ctx.stroke();
        }
      }
      const mx = midX, my = H / 2;
      const mr = 22 + 6 * Math.sin(t * 0.03);
      const mg = ctx.createRadialGradient(mx, my, 0, mx, my, mr);
      mg.addColorStop(0, "#7cc8ff");
      mg.addColorStop(0.5, "#7cc8ff55");
      mg.addColorStop(1, "#7cc8ff00");
      ctx.beginPath(); ctx.arc(mx, my, mr, 0, Math.PI * 2);
      ctx.fillStyle = mg; ctx.fill();
      ctx.fillStyle = "rgba(123,228,234,0.25)";
      ctx.font = "7px 'Space Mono', monospace";
      ctx.textAlign = "center";
      ctx.fillText("BIO", midX - 140, H - 10);
      ctx.fillText("MIRROR", midX, H - 10);
      ctx.fillText("DIGITAL", midX + 140, H - 10);
      ctx.textAlign = "left";
      ctx.fillStyle = "rgba(123,228,234,0.3)";
      ctx.font = "8px 'Space Mono', monospace";
      ctx.fillText("BIO-HYBRID MIRROR · BIOLOGICAL ↔ DIGITAL COHERENCE", 10, H - 10);
      tRef.current += 0.5;
      rafRef.current = requestAnimationFrame(draw);
    }
    draw();
    return () => cancelAnimationFrame(rafRef.current);
  }, []);
  return <canvas ref={cvRef} style={{ width:"100%", height:"auto", display:"block", borderRadius:6 }} />;
}

export default function BioHybridMirrorPage() {
  return (
    <div className="min-h-screen px-4 sm:px-6 lg:px-8 py-10" style={{ background: B.bg }} data-testid="bio-hybrid-mirror-page">
      <div className="max-w-5xl mx-auto">

        {/* HEADER */}
        <header className="mb-10">
          <div className="text-[10.5px] uppercase tracking-[0.32em] mb-2"
               style={{ color: B.cyan, fontFamily: "Inter, sans-serif" }}>
            RL-BHC ↔ AETHER · Volumetric Bio-Hybrid · Field-Based Mirror
          </div>
          <h1 className="text-[44px] leading-[1.05] tracking-tight"
              style={{ color: B.ink, fontFamily: "Cinzel, serif" }}>The Visible Thinking System</h1>
          <p className="text-[14.5px] mt-4 leading-relaxed max-w-3xl" style={{ color: B.text }}>
            Two systems, one structure. The <strong style={{ color: B.green }}>RL-BHC</strong> is a
            volumetric bio-hybrid computer — a transparent gel cube with biochemical logic, sensor
            nodes, conductive pathways, and an FPGA control chip at the base. The
            <strong style={{ color: B.violet }}> AETHER mirror</strong> is the same architecture
            expressed as a field, not a cube: Memory Field (Mnesis), Logic Routing (Aletheia),
            Processing Agents (Inferia), Incoming Signals (Reverie). This page maps one onto the
            other, layer by layer, so the cube and the field can be read as the same machine.
          </p>
          <div className="mt-5 flex flex-wrap gap-2">
            <Chip c={B.cyan}   l="VOLUMETRIC ↔ FIELD" />
            <Chip c={B.green}  l="BIOCHEMICAL ↔ MNEMONIC" />
            <Chip c={B.amber}  l="FPGA ↔ INFERIA" />
            <Chip c={B.rose}   l="SENSORS ↔ REVERIE" />
            <Chip c={B.violet} l="VISIBLE BY DESIGN" />
          </div>

          <div style={{ marginTop:20 }}>
            <div style={{ display:"inline-block", background:"rgba(123,228,234,0.08)", border:"1px solid rgba(123,228,234,0.25)",
              borderRadius:8, padding:"0.3rem 1rem", fontSize:"0.7rem", letterSpacing:"0.2em",
              color:B.cyan, textTransform:"uppercase", fontFamily:"Inter,sans-serif", marginBottom:12 }}>
              Live Simulation
            </div>
            <div style={{ background:B.panel, border:`1px solid ${B.border}`, borderLeft:`3px solid ${B.cyan}`,
              borderRadius:10, padding:20 }}>
              <h2 style={{ fontFamily:"Cinzel,serif", fontSize:18, color:B.ink, margin:"0 0 6px" }}>
                Bio-Hybrid Mirror · Biological ↔ Digital Coherence
              </h2>
              <p style={{ fontFamily:"Inter,sans-serif", fontSize:12, color:B.muted, margin:"0 0 14px", lineHeight:1.65 }}>
                Six paired wave rows — green (biological, left) mirroring violet (digital, right) — separated by a
                pulsing blue bridge node at center. The waves modulate in amplitude and phase, showing the live
                coherence state between the RL-BHC cube and the AETHER field representation.
              </p>
              <BioHybridCanvas />
            </div>
          </div>

          <div className="mt-6 rounded-md p-4 border" style={{ borderColor: B.border, background: B.panel }}>
            <div className="text-[10px] uppercase tracking-[0.32em] mb-2"
                 style={{ color: B.amber, fontFamily: "Inter, sans-serif" }}>How to read this page</div>
            <p className="text-[13px] leading-relaxed" style={{ color: B.text }}>
              Read it as four panels and a translation table. Panel 1 is the
              <strong style={{ color: B.green }}> RL-BHC cube</strong>. Panel 2 is the
              <strong style={{ color: B.violet }}> AETHER field-mirror</strong>. Panel 3 is the
              <strong style={{ color: B.cyan }}> layer mapping</strong> (five clean horizontal slabs
              that match cube to field). Panel 4 is the <strong style={{ color: B.rose }}>visible
              thinking system</strong> — what makes both readable at a glance. Then the
              <strong style={{ color: B.amber }}> mapping table</strong>, the
              <strong style={{ color: B.muted }}> honest line</strong>, and bridges.
            </p>
          </div>
        </header>

        {/* COMBINED IMAGE */}
        <section className="mb-14" data-testid="section-poster">
          <ImgFig
            src={imgQuad}
            alt="Four-panel illustration: top-left a transparent gel cube labelled RL-BHC with bio-nodes and an FPGA at the base, top-right a luminous filament field labelled AETHER with Mnesis/Aletheia/Inferia/Reverie regions, bottom-left a five-layer stacked slab translating cube to field, bottom-right a glowing cube of pulsing nodes and currents labelled the visible thinking system."
            caption="Four panels · the cube · the field · the layer mapping · the visible thinking system"
          />
        </section>

        {/* SECTION 01 — RL-BHC */}
        <section className="mb-14" data-testid="section-bhc">
          <H num="01" label="RL-BHC · Volumetric Bio-Hybrid Computer" accent={B.green} />
          <p className="text-[14px] leading-relaxed mb-4" style={{ color: B.text }}>
            A transparent gel cube hosts a 3D arrangement of biochemical logic, sensor nodes, and
            conductive pathways, all orchestrated by an FPGA control chip seated at the base.
            Computation runs <em>in</em> the volume — it is not abstracted away from its substrate.
          </p>
          <div className="flex flex-wrap gap-2 mb-4">
            {RLBHC.map((c) => <Chip key={c.l} {...c} />)}
          </div>
          <div className="grid md:grid-cols-2 gap-3">
            <Card accent={B.cyan}   eyebrow="Gel scaffold" title="The volume itself"
                  body="A hydrogel matrix that holds bio-nodes in place, transmits ionic signals, and lets light through so the running state is visible. The substrate is part of the computer." />
            <Card accent={B.green}  eyebrow="Biochemical logic · DNA" title="Strand-displacement gates"
                  body="DNA-based logic gates do the boolean and analogue work — slow compared to silicon, but molecularly precise and self-assembling. Each gate is a programmable colloidal element." />
            <Card accent={B.amber}  eyebrow="Sensor nodes" title="Chem + mech + optical"
                  body="Embedded sensor nodes pick up local pH, ion gradients, mechanical strain, and incident light. They are the input boundary of the cube." />
            <Card accent={B.violet} eyebrow="Conductive pathways" title="Wiring without wires"
                  body="Conductive corridors built into the gel route signals between regions of the volume — the topology of the wiring is part of the program." />
            <Card accent={B.rose}   eyebrow="FPGA control chip" title="The classical companion"
                  body="A reconfigurable silicon controller schedules biochemical updates, monitors sensor lines, and exposes a clean digital interface to the outside world. The cube and the chip share work." />
          </div>
        </section>

        {/* SECTION 02 — AETHER MIRROR */}
        <section className="mb-14" data-testid="section-aether-mirror">
          <H num="02" label="AETHER · Field-Based System Mirror" accent={B.violet} />
          <p className="text-[14px] leading-relaxed mb-4" style={{ color: B.text }}>
            The same machine, but field-shaped. Where the cube has surfaces, the field has
            crossings of light. Where the cube has slabs, the field has named regions of the
            distributed state.
          </p>
          <div className="flex flex-wrap gap-2 mb-4">
            {AETHER_FIELD.map((c) => <Chip key={c.l} {...c} />)}
          </div>
          <div className="grid md:grid-cols-2 gap-3">
            <Card accent={B.violet} eyebrow="Memory field · Mnesis" title="Distributed remembering"
                  body="State is held everywhere at once — there is no register file. Reading is a sampling of the field; writing is a perturbation of it. The history of the system is its current geometry." />
            <Card accent={B.cyan}   eyebrow="Logic routing · Aletheia" title="Coherence-aligned flow"
                  body="Logic is not on rails; it is on coherence gradients. Routes from one region to another open when phase alignment is sufficient and close when it isn't." />
            <Card accent={B.amber}  eyebrow="Processing agents · Inferia" title="Task-specific solvers"
                  body="Inferia are bounded agents that take on a piece of work — a constraint, a query, a control loop — and dissolve back into the field when the work is done. The field hosts; agents act." />
            <Card accent={B.rose}   eyebrow="Incoming signals · Reverie" title="Afferent stream"
                  body="Reverie is the always-on input boundary — sensors, queries, ambient data. It feeds the field without forcing it; the field decides what to attend to." />
          </div>
        </section>

        {/* SECTION 03 — LAYER MAPPING */}
        <section className="mb-14" data-testid="section-layers">
          <H num="03" label="Layer Mapping · Clean System Translation" accent={B.amber} />
          <p className="text-[14px] leading-relaxed mb-4" style={{ color: B.text }}>
            Five horizontal slabs translate the cube into the field with no leftover terms.
            Reading top-down is the data flow; reading bottom-up is the input flow.
          </p>
          <div className="rounded-md overflow-hidden border" style={{ borderColor: B.border, background: B.panel }}>
            <div className="grid grid-cols-12 px-4 py-2 text-[10.5px] uppercase tracking-[0.22em]"
                 style={{ color: B.muted, background: B.panelLite, fontFamily: "Inter, sans-serif" }}>
              <div className="col-span-1">#</div>
              <div className="col-span-6">Layer</div>
              <div className="col-span-5">AETHER mapping</div>
            </div>
            {LAYERS.map((row, i) => (
              <div key={row.name} className="grid grid-cols-12 px-4 py-3 text-[13px] border-t"
                   style={{ borderColor: B.border, fontFamily: "Inter, sans-serif" }}>
                <div className="col-span-1" style={{ color: row.c, fontFamily: "ui-monospace, monospace" }}>{i+1}</div>
                <div className="col-span-6" style={{ color: B.textWarm }}>{row.name}</div>
                <div className="col-span-5" style={{ color: B.text }}>{row.map}</div>
              </div>
            ))}
          </div>
        </section>

        {/* SECTION 04 — VISIBLE THINKING */}
        <section className="mb-14" data-testid="section-visible">
          <H num="04" label="The Visible Thinking System" accent={B.rose} />
          <p className="text-[14px] leading-relaxed mb-4" style={{ color: B.text }}>
            The criterion both systems share: the running state must be visible without
            instrumentation. If you cannot read it by looking at it, the design has failed.
          </p>
          <div className="grid md:grid-cols-2 gap-3">
            {VISIBLE.map((v) => (
              <Card key={v.eyebrow} accent={v.c} eyebrow={v.eyebrow} title={v.title} body={v.body} />
            ))}
          </div>
        </section>

        {/* SECTION 05 — MAPPING TABLE */}
        <section className="mb-14" data-testid="section-mapping">
          <H num="05" label="RL-BHC ↔ AETHER · Side by Side" accent={B.cyan} />
          <div className="rounded-md overflow-hidden border" style={{ borderColor: B.border, background: B.panel }}>
            <div className="grid grid-cols-12 px-4 py-2 text-[10.5px] uppercase tracking-[0.22em]"
                 style={{ color: B.muted, background: B.panelLite, fontFamily: "Inter, sans-serif" }}>
              <div className="col-span-2">Aspect</div>
              <div className="col-span-5">RL-BHC (the cube)</div>
              <div className="col-span-5">AETHER (the field)</div>
            </div>
            {MAPPING.map((m) => (
              <div key={m.row} className="grid grid-cols-12 px-4 py-3 text-[13px] border-t"
                   style={{ borderColor: B.border, fontFamily: "Inter, sans-serif" }}>
                <div className="col-span-2" style={{ color: B.amber }}>{m.row}</div>
                <div className="col-span-5" style={{ color: B.textWarm }}>{m.bhc}</div>
                <div className="col-span-5" style={{ color: B.text }}>{m.aether}</div>
              </div>
            ))}
          </div>
        </section>

        {/* SECTION 06 — HONEST LINE */}
        <section className="mb-14" data-testid="section-honest">
          <H num="06" label="Honest Line · What Is Built, What Is Mirror, What Is Aspiration" accent={B.muted} />
          <div className="grid md:grid-cols-3 gap-3">
            <Card accent={B.green} eyebrow="Built today" title="Pieces in a lab"
                  body="DNA strand-displacement gates, hydrogel scaffolds, reconfigurable silicon controllers, embedded chemical and optical sensors — each piece exists. A complete RL-BHC cube of useful scale has not been demonstrated." />
            <Card accent={B.violet} eyebrow="Mirror, not implementation" title="AETHER as architecture"
                  body="The Mnesis · Aletheia · Inferia · Reverie naming is an architecture, not a deployed system. It exists to make the cube reasonable about itself, and to expose the same shape in field language for the rest of the AETHER stack." />
            <Card accent={B.rose}  eyebrow="Aspiration" title="Visibility as a primitive"
                  body="The claim that the running state is fully readable by eye — energy currents, pulsing nodes, dynamic states, emotion-and-logic colours — is a design ethic. How well it survives complexity is an empirical question for the first working cube." />
          </div>
        </section>

        {/* SECTION 07 — BRIDGES */}
        <section data-testid="section-bridges">
          <H num="07" label="Bridges · Where the Cube Meets the Stack" accent={B.gold} />
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
            <Bridge to="/aquarium-chip"          label="Aquarium Chip · Wet Compute"        accent={B.cyan} />
            <Bridge to="/cerebral-organoids"     label="Cerebral Organoids"                 accent={B.green} />
            <Bridge to="/analog-reservoir"       label="Analog Reservoir"                   accent={B.amber} />
            <Bridge to="/architecture"           label="Architecture · System Layers"       accent={B.violet} />
            <Bridge to="/core"                   label="Core Engine"                        accent={B.rose} />
            <Bridge to="/biology"                label="Biology · Living Components"        accent={B.gold} />
          </div>
        </section>

      </div>
    </div>
  );
}
