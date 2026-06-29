import React from "react";
import imgTimeline from "@assets/fnint-18-1321872-g001_1782757431754.png";

/* ==========================================================================
   THE SYMPHONIC CONVERGENCE - HIGH-VIEW ATLAS
   --------------------------------------------------------------------------
   A digest of five source documents into one high-level understanding map:
     - Bio-Medicine Convergence (ferrofluids / mycelium / Earth-as-organism)
     - Bioelectronic Medicine timeline (real FDA-approved lineage)
     - Rootex / ASCII Vision (morphing multi-modal vehicle concept)
     - The Symphonic Protocol (civilizational OS, Aquarium computing)
     - Ecological Growth / Quantum Aether Dynamics (plants, dolphins, aether)
   Organised as a REALITY GRADIENT so the visionary stays legible against the
   established. The Symphonic quartet (Mnesis / Aletheia / Infernia / Reverie)
   is the same engine that powers AETHER's Sky Dial.
   ========================================================================== */

/* palette */
const BG   = "#040508";
const TEAL = "#1fd4c8";
const GOLD = "#c9a84c";
const VIO  = "#8b5cf6";
const GRN  = "#22c55e";
const PINK = "#ec4899";
const BLUE = "#3b82f6";
const ORG  = "#f97316";
const DIM  = "#374858";
const MN   = "'Space Mono', monospace";
const OR   = "'Orbitron', sans-serif";

function Anno({ col, k, v }: { col:string; k:string; v:string }) {
  return (
    <div style={{ background:`${col}0d`, border:`1px solid ${col}33`, borderRadius:4, padding:"8px 11px" }}>
      <div style={{ fontFamily:MN, fontSize:8.5, color:col, fontWeight:700, marginBottom:3 }}>{k}</div>
      <div style={{ fontSize:10, color:"rgba(190,205,225,0.66)", lineHeight:1.55 }}>{v}</div>
    </div>
  );
}

function ClusterHead({ n, col, title, sub }: { n:string; col:string; title:string; sub:string }) {
  return (
    <div style={{ display:"flex", alignItems:"baseline", gap:12, marginBottom:12,
      paddingBottom:8, borderBottom:`1px solid ${col}33` }}>
      <div style={{ fontFamily:OR, fontSize:26, color:col, opacity:0.22, flexShrink:0 }}>{n}</div>
      <div>
        <div style={{ fontFamily:OR, fontSize:11, color:col, letterSpacing:1 }}>{title}</div>
        <div style={{ fontFamily:MN, fontSize:8, color:col+"77", letterSpacing:"0.12em", marginTop:2 }}>{sub}</div>
      </div>
    </div>
  );
}

function SynthesisNote({ col, children }: { col:string; children:string }) {
  return (
    <div style={{ background:`${col}08`, border:`1px solid ${col}22`, borderRadius:4,
      padding:"9px 13px", marginTop:10,
      fontFamily:"'Rajdhani',sans-serif", fontSize:11, color:"rgba(190,210,235,0.7)", lineHeight:1.7 }}>
      <span style={{ fontFamily:MN, fontSize:7.5, color:col, letterSpacing:"0.12em",
        marginRight:8, verticalAlign:"middle" }}>AETHER</span>
      {children}
    </div>
  );
}

const card = (col=TEAL): React.CSSProperties => ({
  background:"rgba(0,0,0,0.42)", border:`1px solid ${col}22`, borderRadius:4, padding:"14px 18px",
  marginBottom:14,
});
const annoGrid: React.CSSProperties = {
  display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(175px,1fr))", gap:8, marginTop:10,
};

/* a small labelled "tier" chip used in the reality ladder */
function Tier({ col, tag, head, body }: { col:string; tag:string; head:string; body:string }) {
  return (
    <div style={{ background:`${col}0c`, border:`1px solid ${col}3a`, borderRadius:6, padding:"12px 14px" }}>
      <div style={{ fontFamily:MN, fontSize:7.5, letterSpacing:"0.18em", color:col, marginBottom:6 }}>{tag}</div>
      <div style={{ fontFamily:OR, fontSize:12, color:col, marginBottom:6 }}>{head}</div>
      <div style={{ fontSize:10.5, color:"rgba(195,210,230,0.7)", lineHeight:1.62 }}>{body}</div>
    </div>
  );
}

/* one droplet of the Symphonic quartet */
function Droplet({ col, name, role, comp }: { col:string; name:string; role:string; comp:string }) {
  return (
    <div style={{ background:`${col}0d`, border:`1px solid ${col}40`, borderRadius:6, padding:"12px 14px",
      boxShadow:`inset 0 0 24px ${col}10` }}>
      <div style={{ display:"flex", alignItems:"center", gap:9, marginBottom:7 }}>
        <span style={{ width:12, height:12, borderRadius:"50%", background:col,
          boxShadow:`0 0 12px ${col}` }} />
        <span style={{ fontFamily:OR, fontSize:13, color:col, letterSpacing:1 }}>{name}</span>
      </div>
      <div style={{ fontFamily:MN, fontSize:8, color:col+"aa", letterSpacing:"0.1em", marginBottom:5 }}>{role}</div>
      <div style={{ fontSize:10.5, color:"rgba(195,210,230,0.72)", lineHeight:1.6 }}>{comp}</div>
    </div>
  );
}

export default function ConvergencePage() {
  return (
    <div style={{ minHeight:"100%", background:BG, color:"#d4e4f4",
      fontFamily:"'Rajdhani',sans-serif", overflowY:"auto" }}>
      <div style={{ maxWidth:1100, margin:"0 auto", padding:"16px 20px" }}>

        {/* title */}
        <div style={{ marginBottom:18 }}>
          <div style={{ display:"inline-block", border:`1px solid ${TEAL}55`,
            padding:"3px 10px", fontSize:9, letterSpacing:"0.2em",
            color:`${TEAL}cc`, fontFamily:MN, marginBottom:8 }}>
            HIGH-VIEW ATLAS · 5 SOURCE DOCUMENTS · 1 CONVERGENT PATTERN
          </div>
          <h1 style={{ fontFamily:OR, fontSize:21, fontWeight:900, letterSpacing:2,
            color:TEAL, textShadow:`0 0 24px ${TEAL}44`, margin:"4px 0 6px" }}>
            The Symphonic Convergence
          </h1>
          <p style={{ fontSize:11.5, color:"rgba(200,210,228,0.7)", lineHeight:1.72,
            maxWidth:840, margin:0 }}>
            Five documents, one underlying move: stop building rigid machines and start growing
            fluid, living, adaptive networks. Magnetic nanomedicine, mycelial electronics,
            ferrofluid propulsion, bioluminescent signalling and bio-inspired vehicles are not
            separate ideas &mdash; they are the same systems-thinking pattern applied at the scale
            of the cell, the circuit, the vehicle and the planet. This atlas digests them from a
            high view and sorts each claim onto a reality gradient, so the visionary stays honest
            next to the established.
          </p>
          <div style={{ display:"flex", flexWrap:"wrap", gap:6, marginTop:10 }}>
            {[["01 · The Pattern",TEAL],["02 · Four Domains",GOLD],["03 · Symphonic Protocol",VIO],
              ["04 · Bioelectric Lineage",GRN],["05 · Visionary Edge",ORG],["06 · Reality Ladder",PINK]].map(([t,c])=>(
              <div key={t} style={{ fontFamily:MN, fontSize:8, padding:"3px 9px", borderRadius:3,
                background:`${c}14`, border:`1px solid ${c}44`, color:c }}>{t}</div>
            ))}
          </div>
        </div>

        {/* CLUSTER 01 - the unifying pattern */}
        <div style={card(TEAL)}>
          <ClusterHead n="01" col={TEAL} title="The Unifying Pattern · Machine-as-Tissue"
            sub="FLUID ADAPTIVE NETWORKS REPLACE RIGID MACHINES · THE FRICTION TAX" />
          <p style={{ fontSize:11, color:"rgba(200,212,230,0.74)", lineHeight:1.72, margin:"0 0 4px" }}>
            Every source circles the same thesis. Civilization pays a hidden &ldquo;Friction Tax&rdquo;
            &mdash; energy lost to heat, capital lost to maintenance, health lost to system-induced
            stress. The proposed escape is to design systems that behave like living tissue:
            transparent, self-healing, resonant. Computation becomes a breath rather than a spike;
            motion becomes a pulse rather than a rotation.
          </p>
          <div style={annoGrid}>
            <Anno col={TEAL} k="Friction Tax"
              v="Entropy leaks value: heat, waste, maintenance, mistrust. Resonant systems internalise the surplus instead of externalising it." />
            <Anno col={TEAL} k="Machine -> Tissue"
              v="Intelligence is made legible, not hidden in a black box. State is visible and inspectable, like watching currents in an aquarium." />
            <Anno col={TEAL} k="Work With The Field"
              v="The wave is not the enemy but the power source. Stability through compliance, not rigidity. AETHER's core design philosophy." />
            <Anno col={TEAL} k="Cross-Scale Self-Similarity"
              v="The same network logic appears in the cell, the circuit, the vehicle and the biosphere - a fractal of fluid adaptive systems." />
          </div>
        </div>

        {/* CLUSTER 02 - four converging domains */}
        <div style={card(GOLD)}>
          <ClusterHead n="02" col={GOLD} title="Four Converging Domains"
            sub="ELECTROMAGNETISM · NANOMEDICINE · BIO-MATERIALS · INTELLIGENT TRANSPORT" />
          <p style={{ fontSize:11, color:"rgba(200,212,230,0.74)", lineHeight:1.72, margin:"0 0 4px" }}>
            The Bio-Medicine Convergence note names four fields collapsing into one. Each already
            has a real, grounded core; the vision is the logical continuation, not a fantasy.
          </p>
          <div style={annoGrid}>
            <Anno col={GOLD} k="Electromagnetism"
              v="Magnetic fields as the universal actuator - from ion-thruster research to inductive roadways that guide motion without gears." />
            <Anno col={GOLD} k="Nanomedicine"
              v="Magnetic nanoparticles already do targeted drug delivery, MRI contrast and magnetic hyperthermia. Extension: micro-jets and gene-carrier navigation." />
            <Anno col={GOLD} k="Bio-Materials"
              v="Mycelium as biodegradable circuit boards, battery electrodes and self-healing circuits. Energy storage grown rather than manufactured." />
            <Anno col={GOLD} k="Intelligent Transport"
              v="Vehicles as organisms-in-conversation-with-planet: reading biofields, terrain stress and EM signatures rather than only consuming fuel." />
          </div>
          <SynthesisNote col={GOLD}>
            {"The convergence is the message. Treated separately these are four research silos; treated together they describe one substrate - magnetic, biological, adaptive - expressed at four scales. That cross-domain unity is exactly the coherence principle AETHER models everywhere else."}
          </SynthesisNote>
        </div>

        {/* CLUSTER 03 - the symphonic protocol + quartet */}
        <div style={card(VIO)}>
          <ClusterHead n="03" col={VIO} title="The Symphonic Protocol · The Aquarium Chip"
            sub="TRANSPARENT, LAYERED, SLOW-LEGIBLE COMPUTATION · THE RESONANT QUARTET" />
          <p style={{ fontSize:11, color:"rgba(200,212,230,0.74)", lineHeight:1.72, margin:"0 0 8px" }}>
            The Symphonic Protocol reframes a civilization as one operating system whose
            computation is visible like an aquarium: a foreground that reacts, a mid-water that
            adapts, and a deep layer that archives. Crucially it maps computation onto four living
            functions &mdash; the very same quartet that drives AETHER&rsquo;s Sky Dial resonance engine.
          </p>
          <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(210px,1fr))", gap:10 }}>
            <Droplet col={BLUE} name="MNESIS" role="MEMORY · SUBSTRATE"
              comp="Sediment and strata. Accumulative, inspectable memory layers - like coral growth or geological rock." />
            <Droplet col={TEAL} name="ALETHEIA" role="LOGIC · CLEAR CURRENT"
              comp="Deterministic, low-noise signal routing that resists opacity. The clear path through the water." />
            <Droplet col={ORG} name="INFERNIA" role="TRANSFORMATION · VENTS"
              comp="Thermal vents and catalytic zones where energy gradients drive change. Where work actually happens." />
            <Droplet col={VIO} name="REVERIE" role="INTUITION · LIGHT"
              comp="Low-energy bioluminescent signalling that surfaces insight without thermal cost. Light, not heat." />
          </div>
          <SynthesisNote col={VIO}>
            {"This is the bridge: the Symphonic Protocol's quartet IS the Sky Dial's four resonance droplets. The same Mnesis / Aletheia / Infernia / Reverie cycle that scores planetary positions on the dial is here proposed as the architecture of a transparent civilization. AETHER already runs this engine - see /sky-dial."}
          </SynthesisNote>
        </div>

        {/* CLUSTER 04 - bioelectric lineage (image) */}
        <div style={card(GRN)}>
          <ClusterHead n="04" col={GRN} title="The Bioelectric Lineage · What Is Already Real"
            sub="FROM GALVANI TO FDA-APPROVED BIOELECTRONIC MEDICINE" />
          <figure style={{ margin:0, borderRadius:7, overflow:"hidden",
            border:`1px solid ${GRN}55`, background:"#05070b",
            boxShadow:`0 0 34px ${GRN}1f, inset 0 0 0 1px ${GRN}11` }}>
            <img src={imgTimeline} alt="Timeline of bioelectronic medicine from 50 C.E. to 2020"
              loading="lazy" style={{ width:"100%", display:"block" }} />
            <figcaption style={{ padding:"10px 14px", borderTop:`1px solid ${GRN}26`,
              background:`linear-gradient(180deg, ${GRN}0a, transparent)` }}>
              <div style={{ fontFamily:MN, fontSize:8, color:GRN, letterSpacing:"0.16em", marginBottom:5 }}>
                BIOELECTRONIC MEDICINE · ~2000 YEAR LINEAGE
              </div>
              <div style={{ fontSize:10.5, color:"rgba(200,210,228,0.68)", lineHeight:1.62 }}>
                Electric torpedo-fish pain relief (Egypt &amp; Rome) &rarr; Galvani&rsquo;s frog nerves (1780)
                &rarr; the 19th-century &ldquo;golden age&rdquo; of electrotherapy &rarr; a 20th-century decline as
                pharmacology rose &rarr; the modern revival: vagus-nerve stimulation (FDA 1997/2005), deep-brain
                stimulation, brain-machine interfaces (2000s), and the formalisation of Bioelectronic Medicine.
                The &ldquo;living electronics&rdquo; vision is not new &mdash; it is the next chapter of a very old line.
              </div>
            </figcaption>
          </figure>
          <SynthesisNote col={GRN}>
            {"This timeline is the anchor that keeps the rest honest. Electricity-as-medicine is a 2000-year-old, FDA-approved reality. So when the sources extend toward ferrofluid nanorobots and resonant medicine, they are extrapolating from a real curve - not inventing one."}
          </SynthesisNote>
        </div>

        {/* CLUSTER 05 - the visionary edge */}
        <div style={card(ORG)}>
          <ClusterHead n="05" col={ORG} title="The Visionary Edge · Devices & Vehicles"
            sub="FERRODRIVE · ROOTEX EVO · BIO-ROBOTIC FREE-ENERGY CONCEPTS" />
          <div style={annoGrid}>
            <Anno col={ORG} k="FerroDrive Propulsion"
              v="A ferrofluid 'smart liquid' core shaped by electric/magnetic fields into propulsive spikes/micro-jets - friction-free, silent motion for compact EVs. Magnetohydrodynamics, no gears." />
            <Anno col={ORG} k="Rootex Evo - Glowing Glass"
              v="Switchable/electrochromic glass + electroluminescent panels + HUD projection fused into modes (Idle, Flow, Shield, Clean, Adapt). Built on real Gauzy/Gentex/LUMINEQ tech." />
            <Anno col={ORG} k="Rootex Evo - Transformer"
              v="A morphing chassis (shape-memory alloy / 4D-print) that walks, dives and floats - inspired by M4 morphobot, Rinspeed sQuba and eVTOL. Pure concept, grounded in real prototypes." />
            <Anno col={ORG} k="Bio-Robotic Devices"
              v="Milk-plant clock robots, saffron-poppy root systems, atomic gravity microchips - speculative bio-machines that program ecological growth with salt-stress 'Morse code' pulses." />
          </div>
          <SynthesisNote col={ORG}>
            {"These are the imagination layer. Each one anchors to a real building block (smart glass, magnetic hyperthermia, eVTOL, plant electrical signalling) and then projects forward. Read them as design fiction with a real seed - the value is the direction of travel, not a buildable spec sheet."}
          </SynthesisNote>
        </div>

        {/* CLUSTER 06 - the reality ladder */}
        <div style={card(PINK)}>
          <ClusterHead n="06" col={PINK} title="The Reality Ladder · Reading It Honestly"
            sub="ESTABLISHED · EMERGING · SPECULATIVE" />
          <p style={{ fontSize:11, color:"rgba(200,212,230,0.74)", lineHeight:1.72, margin:"0 0 10px" }}>
            The single most useful high-view move is to sort every claim by how far it sits from
            today&rsquo;s evidence. The same idea can appear on all three rungs at different scales.
          </p>
          <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(240px,1fr))", gap:10 }}>
            <Tier col={GRN} tag="RUNG 1 · ESTABLISHED"
              head="Real today"
              body="Magnetic nanoparticles in oncology · MRI contrast · magnetic hyperthermia · FDA vagus-nerve / deep-brain stimulation · mycelium composites · switchable smart glass · firefly luciferase near-100% quantum yield." />
            <Tier col={GOLD} tag="RUNG 2 · EMERGING"
              head="Logical next step"
              body="Magnetically guided nanorobotics · programmable drug capsules · hybrid silicon-mycelium logic · ferrofluid magnetohydrodynamic drives · bioluminescent (heat-free) signalling · self-healing inductive infrastructure." />
            <Tier col={VIO} tag="RUNG 3 · SPECULATIVE"
              head="Needs new physics"
              body="Aether-mediated wormhole energy teleportation · anti-gravity atomic microchips · transformer sub-bubble vehicles · plant/dolphin free-energy bridges · consciousness as a non-binary aether field. Inspiring; unproven." />
          </div>
          <SynthesisNote col={PINK}>
            {"High view of understanding: there is one coherent vision (living, resonant, fluid systems) carried across three confidence tiers. Build on Rung 1, prototype Rung 2, and treat Rung 3 as the compass heading - the direction that tells you which Rung 2 experiments are worth running. That is how speculation becomes a research program instead of a daydream."}
          </SynthesisNote>
        </div>

        {/* footer */}
        <div style={{ paddingTop:10, borderTop:"1px solid rgba(31,212,200,0.08)",
          fontFamily:MN, fontSize:7.5, color:DIM, letterSpacing:"0.12em", textAlign:"center" }}>
          THE SYMPHONIC CONVERGENCE · FRICTION TAX · MACHINE-AS-TISSUE · FOUR DOMAINS ·
          AQUARIUM CHIP · MNESIS · ALETHEIA · INFERNIA · REVERIE · BIOELECTRIC LINEAGE ·
          FERRODRIVE · ROOTEX EVO · REALITY LADDER · COHERENCE FIELD
        </div>
      </div>
    </div>
  );
}
