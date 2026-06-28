import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

const C = {
  bg: "#04070E", panel: "#080D1A", panel2: "#0B1220",
  border: "#0E1A2C", border2: "#152438",
  white: "#EBF4FF", text: "#7AA6C5", muted: "#486888", dim: "#243850",
  teal: "#00C9B1", gold: "#F5C518", orange: "#F97316",
  red: "#EF4444", yellow: "#FBBF24", purple: "#7C5CFC", blue: "#3B82F6",
  green: "#10B981", pink: "#F472B6", silver: "#C0CFDB",
};

type Tab =
  | "abstract" | "claim" | "domains" | "scale" | "entropy"
  | "unified" | "applications" | "open" | "conclusion";

const PHASES = [
  { sym: "01", name: "SENSE",     desc: "Map the environment",                col: C.teal },
  { sym: "02", name: "DELIVER",   desc: "Transport signal to target",          col: C.purple },
  { sym: "03", name: "ACTIVATE",  desc: "Trigger state change",                col: C.orange },
  { sym: "04", name: "FEEDBACK",  desc: "Process outcome",                     col: C.gold },
  { sym: "05", name: "LEARN",     desc: "Reduce entropy in next cycle",        col: C.green },
];

const DISCOVERY_TABLE = [
  { layer: "Sense",    domain: "Tumor biology",     mech: "Mycelium spatial mapping (DBiT-Plus)", fn: "Read microenvironment in context",      ae: "Observation without abstraction" },
  { layer: "Deliver",  domain: "Nanomedicine",      mech: "Ferrofluid magnetic guidance",         fn: "Localize metabolite transport",         ae: "Precision over saturation" },
  { layer: "Activate", domain: "Oncology",          mech: "Hyperthermia + ROS overload",          fn: "Selective cell elimination",            ae: "Intervention at resonance point" },
  { layer: "Feedback", domain: "Bio-AI interface",  mech: "Mycelium outcome processing",          fn: "Reduce trial entropy",                  ae: "Learning replaces guessing" },
  { layer: "Learn",    domain: "Systems biology",   mech: "Model update — next cycle recalibrated", fn: "Each cycle more efficient",          ae: "Coherence compounds over time" },
];

const SYMPHONIC_LAYERS = [
  { n: "Mnesis",     col: "#00f5c8", role: "Persistent Memory · mycelium-inspired distributed substrate" },
  { n: "Aletheia",   col: "#4db8ff", role: "Deterministic Logic · constraint-based · formal verification" },
  { n: "Infernia",   col: "#ff6b35", role: "MHD Transformation · ferrofluid · friction-less state change" },
  { n: "Reverie",    col: "#c77dff", role: "Bioluminescent Inference · probabilistic · low-energy signaling" },
  { n: "AETHER",     col: "#f0e68c", role: "THz Photon Signaling · chemiexcitation · physical EM, not symbolic" },
  { n: "Pythagoras", col: "#e8c4a0", role: "Tetrahedral Constraint · harmonic ratios as physical resonance" },
  { n: "Russell",    col: "#7ecfcf", role: "Toroidal Wave Dynamics · centripetal/centrifugal cycle" },
];

const EMOTION_TABLE = [
  { ai: "InputHandler — voice/gesture",       bio: "Mycelium sensor array — microenvironment" },
  { ai: "CognitiveLogicUnit — intent → action", bio: "Computational analysis — target signature" },
  { ai: "MemoryEngine — short + long context",  bio: "Spatial gene/protein map — DBiT-Plus accumulation" },
  { ai: "EmotionSystem — mood tag",             bio: "Activation trigger — intervention threshold" },
  { ai: "InterfaceRenderer — response",         bio: "Ferrofluid delivery — localized intervention" },
  { ai: "Feedback loop — outcome → next intent", bio: "Outcome processing — mycelium reads result" },
];

const ENTROPY_VS_COHERENCE = [
  { e: "Centralized control, single point of failure", c: "Distributed local interaction, no single point" },
  { e: "Dense signal saturation (chemotherapy model)",   c: "Sparse targeted signaling (ferrofluid precision)" },
  { e: "Black-box opacity, trust assumed",                c: "Glass-box observability, trust verifiable" },
  { e: "Reactive intervention (symptom suppression)",     c: "Predictive correction (pattern recognition)" },
  { e: "Linear accumulation of damage and side effects", c: "Toroidal feedback — each cycle reduces error" },
  { e: "Fixed architecture, manually updated",           c: "Emergent adaptation, self-correcting" },
];

const UNIFIED_LAYERS = [
  { n: "01 · Physical",    title: "The Closed Discovery Loop",         col: C.teal,    body: "Delivery and actuation. Ferrofluid vehicles, mycelium networks, metabolite payloads. Mechanism: magnetic field guidance, electrochemical signaling, spatial gene mapping. Scale: cellular to tissue." },
  { n: "02 · Symbolic",    title: "The Symphonic Protocol",            col: C.purple,  body: "Simulation, constraint, and adaptive modeling. Seven computational layers from persistent memory to toroidal wave dynamics. Mechanism: bio-integrated computation, MHD actuation, bioluminescent signaling, Fibonacci encoding. Scale: information to architecture." },
  { n: "03 · Experiential", title: "The AetherLife Emotion AI",         col: C.gold,    body: "Patient outcomes, recovery dynamics, human-system interface. The feedback engine that reads emotional and physiological state and adjusts system behavior. Mechanism: CognitiveLogicUnit, MemoryEngine, EmotionSystem. Scale: individual to relational." },
  { n: "04 · Resonant",    title: "Russell-Fibonacci Wave Dynamics",   col: C.green,   body: "The foundational physics. Silence-sound-silence cycles, centripetal-centrifugal toroidal fields, Fibonacci sparse encoding, Pythagorean harmonic constraints. Mechanism: wave propagation, golden ratio convergence, tetrahedral geometry. Scale: quantum to cosmological." },
];

const APPLICATIONS = [
  { tag: "ONCOLOGY & PRECISION MEDICINE",      col: C.pink,    body: "Closed Discovery Loop applied to glioblastoma and other solid tumors. 2025 trial signals: ~59% glioblastoma kill rates with ferrofluid-chemotherapy hybrids; 70-80% response in mycelium-assisted precision medicine early studies." },
  { tag: "NEUROMORPHIC + BIO-HYBRID",          col: C.purple,  body: "Symphonic Protocol as design framework for substrate-agnostic, observable, self-regulating systems. Microfluidic chips, mycelium-silicon interfaces, ferrofluid prototypes." },
  { tag: "AETHERLIFE.CO · DREAMSCAPE",          col: C.teal,    body: "Consumer-facing emotional and environmental system that adapts to user state in real time. Senses emotional context, delivers light/sound/atmosphere response, learns user patterns." },
  { tag: "ENVIRONMENTAL REGENERATION",         col: C.green,   body: "Significant reduction in chemical runoff, systemic toxicity, ecological load. Closed loops over open discharge. Extends to agriculture, water systems, energy." },
];

const OPEN_QUESTIONS = [
  "Stability of biohybrid interfaces at scale — mycelium-silicon signal fidelity over time",
  "Scaling mycelium computation bandwidth for real-time medical feedback",
  "Sub-millimeter targeting precision in ferrofluid systems at cellular resolution",
  "Integration of quantum-efficient photon signaling with classical compute substrates",
  "Emotional AI training on physiological coherence data — building feedback ground truth",
  "Formal mathematical validation that the five-phase loop is structurally identical across domains",
  "Hardware accelerators for Fibonacci recursive computation at edge-AI scale",
  "Long-term ecological monitoring of AETHER-based medical systems",
];

function WhitepaperCanvas() {
  const ref = React.useRef<HTMLCanvasElement>(null);
  const rafRef = React.useRef(0);
  React.useEffect(() => {
    const canvas = ref.current; if (!canvas) return;
    const ctx = canvas.getContext("2d")!;
    canvas.width = 900; canvas.height = 260;
    const W = canvas.width, H = canvas.height;
    const nodes = [
      { x:W*0.12, y:H*0.5, col:"#ff4477", label:"ENTROPY", size:26, phase:0.0 },
      { x:W*0.30, y:H*0.42, col:"#9966ff", label:"BIOLOGICAL", size:20, phase:1.1 },
      { x:W*0.50, y:H*0.5, col:"#c9a84c", label:"COHERENCE", size:30, phase:2.2 },
      { x:W*0.70, y:H*0.42, col:"#44aaff", label:"COMPUTATIONAL", size:20, phase:0.7 },
      { x:W*0.88, y:H*0.5, col:"#2ef0d8", label:"RESONANT", size:26, phase:1.8 },
    ];
    const links=[[0,1],[1,2],[2,3],[3,4],[0,2],[2,4]];
    let t=0;
    const draw=()=>{
      ctx.fillStyle="rgba(4,7,14,0.2)"; ctx.fillRect(0,0,W,H);
      t++;
      links.forEach(([a,b])=>{
        const na=nodes[a],nb=nodes[b];
        const flow=(t*0.015+a*0.5+b*0.3)%1;
        const g=ctx.createLinearGradient(na.x,na.y,nb.x,nb.y);
        g.addColorStop(0,na.col+"55"); g.addColorStop(1,nb.col+"55");
        ctx.beginPath(); ctx.moveTo(na.x,na.y); ctx.lineTo(nb.x,nb.y);
        ctx.strokeStyle=g; ctx.lineWidth=1.5; ctx.shadowColor=na.col; ctx.shadowBlur=6; ctx.stroke(); ctx.shadowBlur=0;
        const px=na.x+(nb.x-na.x)*flow, py=na.y+(nb.y-na.y)*flow;
        ctx.beginPath(); ctx.arc(px,py,2.5,0,Math.PI*2);
        ctx.fillStyle="#fff"; ctx.shadowColor="#fff"; ctx.shadowBlur=8; ctx.fill(); ctx.shadowBlur=0;
      });
      nodes.forEach(n=>{
        const pulse=1+0.1*Math.sin(t*0.035+n.phase);
        const g=ctx.createRadialGradient(n.x,n.y,0,n.x,n.y,n.size*2*pulse);
        g.addColorStop(0,n.col+"bb"); g.addColorStop(0.5,n.col+"33"); g.addColorStop(1,"transparent");
        ctx.beginPath(); ctx.arc(n.x,n.y,n.size*pulse,0,Math.PI*2);
        ctx.fillStyle=g; ctx.shadowColor=n.col; ctx.shadowBlur=18; ctx.fill(); ctx.shadowBlur=0;
        ctx.beginPath(); ctx.arc(n.x,n.y,n.size*pulse,0,Math.PI*2);
        ctx.strokeStyle=n.col; ctx.lineWidth=2; ctx.stroke();
        ctx.fillStyle=n.col; ctx.font="bold 8px 'DM Mono',monospace"; ctx.textAlign="center";
        ctx.fillText(n.label,n.x,n.y+n.size*pulse+12);
      });
      ctx.fillStyle="rgba(201,168,76,0.45)"; ctx.font="9px 'DM Mono',monospace"; ctx.textAlign="left";
      ctx.fillText("SCALE-INVARIANT FRAMEWORK · ENTROPY ↔ COHERENCE · EMERGENT INTELLIGENCE",14,20);
      rafRef.current=requestAnimationFrame(draw);
    };
    draw();
    return ()=>cancelAnimationFrame(rafRef.current);
  },[]);
  return <canvas ref={ref} style={{ width:"100%", height:"auto", borderRadius:8, display:"block" }} />;
}

export default function AetherWhitepaperPage() {
  const [tab, setTab] = useState<Tab>("abstract");

  const TABS: [Tab, string][] = [
    ["abstract","ABSTRACT"], ["claim","§1 · CENTRAL CLAIM"], ["domains","§2 · FOUR DOMAINS"],
    ["scale","§3 · SCALE INVARIANCE"], ["entropy","§4 · ENTROPY ↔ COHERENCE"],
    ["unified","§5 · UNIFIED ARCHITECTURE"], ["applications","§6 · APPLICATIONS"],
    ["open","§7 · OPEN QUESTIONS"], ["conclusion","§8 · CONCLUSION"],
  ];

  return (
    <div data-testid="whitepaper-root" className="min-h-screen p-6" style={{ background: C.bg, color: C.text, fontFamily: "'JetBrains Mono', monospace" }}>

      <div style={{ marginBottom:20 }}>
        <div style={{ display:"inline-block", background:"rgba(201,168,76,0.08)", border:"1px solid rgba(201,168,76,0.25)",
          borderRadius:8, padding:"0.3rem 1rem", fontSize:"0.7rem", letterSpacing:"0.2em",
          color:C.gold, textTransform:"uppercase", fontFamily:"'JetBrains Mono',monospace", marginBottom:12 }}>
          Live Simulation
        </div>
        <div style={{ background:"rgba(4,7,14,0.8)", border:"1px solid rgba(201,168,76,0.12)",
          borderLeft:`3px solid ${C.gold}`, borderRadius:10, padding:20 }}>
          <h2 style={{ fontFamily:"Cinzel,serif", fontSize:18, color:C.white, margin:"0 0 6px" }}>
            AETHER Whitepaper · Scale-Invariant Framework · Entropy ↔ Coherence · Emergent Intelligence
          </h2>
          <p style={{ fontFamily:"'JetBrains Mono',monospace", fontSize:12, color:"rgba(200,190,150,0.5)", margin:"0 0 14px", lineHeight:1.65 }}>
            Five domain nodes (Entropy/rose · Biological/violet · Coherence/gold · Computational/blue · Resonant/teal)
            connected by bidirectional flow links with photon packets streaming between them — the five-node
            knowledge architecture of the AETHER scale-invariant coherence whitepaper.
          </p>
          <WhitepaperCanvas />
        </div>
      </div>

      <div className="border-b pb-5 mb-6" style={{ borderColor: C.border2 }}>
        <p className="text-[9px] tracking-[0.36em] uppercase mb-3" style={{ color: C.dim }}>
          AETHER · Concept Whitepaper v1.0 · AetherLife.co
        </p>
        <h1 className="font-['Cinzel',serif] font-light leading-none tracking-tight" style={{ fontSize: "clamp(34px,4.8vw,58px)", color: C.white }}>
          AETHER <em style={{ color: C.gold, fontStyle: "italic" }}>Whitepaper</em>
        </h1>
        <p className="font-['Cinzel',serif] italic mt-2" style={{ fontSize: "clamp(13px,1.6vw,18px)", color: C.muted }}>
          A Scale-Invariant Framework for Entropy, Coherence, and Emergent Intelligence
        </p>
        <p className="font-['Cinzel',serif] italic" style={{ fontSize: "clamp(11px,1.3vw,14px)", color: C.muted }}>
          Across Biological, Computational, and Resonant Systems
        </p>
        <p className="mt-4 max-w-3xl text-[12px] leading-7 border-l-2 pl-4" style={{ color: C.text, borderColor: C.gold }}>
          A single recursive pattern operates across four domains — bio-intelligent oncology,
          neuromorphic computation, emotional AI, and resonant wave physics. The pattern is
          <strong style={{ color: C.gold }}> Sense → Deliver → Activate → Feedback → Learn</strong>.
          Not a metaphor. A structural property of any system that sustains coherence against entropy.
        </p>
      </div>

      {/* The loop */}
      <div className="border p-5 mb-6 flex justify-center" style={{ borderColor: C.gold + "30", background: C.panel }}>
        <LoopDiagram />
      </div>

      {/* TABS */}
      <div className="flex gap-1 mb-5 border-b overflow-x-auto" style={{ borderColor: C.border2 }}>
        {TABS.map(([k, lbl]) => (
          <button key={k} data-testid={`tab-${k}`} onClick={() => setTab(k)}
            className="px-3 py-2 text-[8px] tracking-[0.22em] whitespace-nowrap transition-colors"
            style={{
              color: tab === k ? C.gold : C.muted,
              borderBottom: tab === k ? "2px solid " + C.gold : "2px solid transparent",
              marginBottom: "-1px",
            }}>{lbl}</button>
        ))}
      </div>

      <AnimatePresence mode="wait">

        {tab === "abstract" && (
          <Section keyId="abstract">
            <SectionTitle n="00" t="Abstract" />
            <p className="text-[12.5px] leading-7 max-w-3xl" style={{ color: C.text }}>
              This paper articulates a scale-invariant operational framework — AETHER — that identifies
              a single recursive pattern operating across four distinct domains: bio-intelligent oncology,
              neuromorphic computation, emotional AI, and resonant wave physics.
            </p>
            <p className="text-[12.5px] leading-7 max-w-3xl mt-3" style={{ color: C.text }}>
              We demonstrate that this loop — identified independently in mycelium-based tumor-microenvironment
              sensing, the Symphonic Protocol computational layers, the AetherLife Emotion AI architecture,
              Walter Russell's silence-to-sound wave cycle, and Fibonacci recursive emergence — is not
              coincidental. It is a structural property of any system that sustains coherence against entropy.
            </p>
            <Callout col={C.gold} k="THESIS">
              These are not analogies of each other. They are the same pattern operating at different scales of
              physical resolution, connected by the same dynamics: local interaction, sparse encoding, toroidal
              feedback, attractor stabilization.
            </Callout>
          </Section>
        )}

        {tab === "claim" && (
          <Section keyId="claim">
            <SectionTitle n="01" t="The Central Claim · One Pattern, Four Scales" />
            <p className="text-[12px] leading-7 max-w-3xl mb-3">
              Modern systems — medical, computational, ecological, economic — are largely designed around a
              single paradigm: <em>inject force, measure output, repeat</em>. This paradigm is extractive.
              It accumulates entropy rather than resolving it. It saturates rather than targets. It reacts
              rather than learns.
            </p>
            <p className="text-[12px] leading-7 max-w-3xl mb-3">
              AETHER begins with a different observation: biological systems that have survived long enough to
              be studied operate through continuous feedback, sparse signaling, local interaction rules that
              produce global coherence, and self-correction without centralized control.
            </p>
            <div className="grid gap-2 mt-5" style={{ gridTemplateColumns: "repeat(auto-fit,minmax(170px,1fr))" }}>
              {PHASES.map(p => (
                <div key={p.name} data-testid={`phase-${p.name.toLowerCase()}`} className="border p-3" style={{ borderColor: p.col + "40", background: p.col + "08" }}>
                  <p className="text-[8px] tracking-[0.22em]" style={{ color: p.col }}>{p.sym}</p>
                  <p className="font-['Cinzel',serif] mt-1" style={{ color: p.col, fontSize: 18 }}>{p.name}</p>
                  <p className="text-[10px] mt-1" style={{ color: C.text }}>{p.desc}</p>
                </div>
              ))}
            </div>
          </Section>
        )}

        {tab === "domains" && (
          <Section keyId="domains">
            <SectionTitle n="02" t="Four Domains · One Architecture" />

            <h3 className="font-['Cinzel',serif] mt-2 mb-2" style={{ color: C.teal, fontSize: 16 }}>2.1 · Closed Discovery Loop · Bio-Intelligent Oncology</h3>
            <div className="border" style={{ borderColor: C.border2, background: C.panel }}>
              <table className="w-full text-[11px]" data-testid="discovery-table">
                <thead><tr style={{ background: C.bg, borderBottom: "1px solid " + C.border2 }}>
                  {["LAYER","DOMAIN","MECHANISM","FUNCTION","AETHER ALIGNMENT"].map(h => (
                    <th key={h} className="text-left p-2 text-[7.5px] tracking-[0.2em]" style={{ color: C.dim }}>{h}</th>
                  ))}
                </tr></thead>
                <tbody>
                  {DISCOVERY_TABLE.map(r => (
                    <tr key={r.layer} style={{ borderBottom: "1px solid " + C.border }}>
                      <td className="p-2 font-['Cinzel',serif]" style={{ color: C.teal }}>{r.layer}</td>
                      <td className="p-2" style={{ color: C.white }}>{r.domain}</td>
                      <td className="p-2" style={{ color: C.text }}>{r.mech}</td>
                      <td className="p-2" style={{ color: C.text }}>{r.fn}</td>
                      <td className="p-2 italic" style={{ color: C.gold }}>{r.ae}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <Callout col={C.teal} k="EMPIRICAL SIGNAL">
              2025 trial data reports ~59% glioblastoma kill rates with ferrofluid-chemotherapy hybrids;
              mycelium-assisted precision medicine showing 70–80% response in early studies. Emergent
              behavior from closing the sense–intervention loop.
            </Callout>

            <h3 className="font-['Cinzel',serif] mt-6 mb-2" style={{ color: C.purple, fontSize: 16 }}>2.2 · Symphonic Protocol · Computational Architecture</h3>
            <p className="text-[12px] leading-7 max-w-3xl mb-3">
              Computation as visible, adaptive, multi-layered ecological process — a glass-box ecosystem.
              Seven layers, each a phase of the AETHER loop.
            </p>
            <div className="grid gap-2" style={{ gridTemplateColumns: "repeat(auto-fit,minmax(180px,1fr))" }}>
              {SYMPHONIC_LAYERS.map(L => (
                <div key={L.n} className="border p-3" style={{ borderColor: L.col + "40", background: L.col + "08" }}>
                  <p className="font-['Cinzel',serif]" style={{ color: L.col, fontSize: 14 }}>{L.n}</p>
                  <p className="text-[10px] mt-1" style={{ color: C.text }}>{L.role}</p>
                </div>
              ))}
            </div>
            <Callout col={C.purple} k="STRICT SEPARATION">
              The AETHER layer enforces strict separation between physical EM light (chemiexcitation, THz photons)
              and symbolic illumination. Geometry as constraint, not cause. Resonance = alignment without
              contradiction. No metaphysical claims.
            </Callout>

            <h3 className="font-['Cinzel',serif] mt-6 mb-2" style={{ color: C.gold, fontSize: 16 }}>2.3 · AetherLife Emotion AI · The Feedback Engine</h3>
            <div className="border" style={{ borderColor: C.border2, background: C.panel }}>
              <table className="w-full text-[11px]">
                <thead><tr style={{ background: C.bg, borderBottom: "1px solid " + C.border2 }}>
                  <th className="text-left p-2 text-[7.5px] tracking-[0.2em]" style={{ color: C.dim }}>EMOTION AI COMPONENT</th>
                  <th className="text-left p-2 text-[7.5px] tracking-[0.2em]" style={{ color: C.dim }}>BIO-SYSTEM EQUIVALENT</th>
                </tr></thead>
                <tbody>
                  {EMOTION_TABLE.map((r,i) => (
                    <tr key={i} style={{ borderBottom: "1px solid " + C.border }}>
                      <td className="p-2" style={{ color: C.text }}>{r.ai}</td>
                      <td className="p-2 italic" style={{ color: C.gold }}>{r.bio}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <h3 className="font-['Cinzel',serif] mt-6 mb-2" style={{ color: C.green, fontSize: 16 }}>2.4 · Russell-Fibonacci Resonance Layer · Wave Physics</h3>
            <p className="text-[12px] leading-7 max-w-3xl mb-3">
              Russell's wave cycle — silence → sound → silence — maps onto the AETHER loop. Fibonacci
              recursive emergence and Zeckendorf encoding produce inherently sparse representations parallel
              to biological neural firing. φ = 1.6180339887 is the asymptotic attractor of recursive addition.
            </p>
            <div className="border p-3" style={{ borderColor: C.green + "30", background: C.panel2 }}>
              <p className="text-[10px] tracking-[0.22em] mb-2" style={{ color: C.green }}>RUSSELL CYCLE ↔ AETHER LOOP</p>
              <p className="text-[12px]" style={{ color: C.text }}>
                Silence (Sense) → Sound begins (Deliver) → Full Sound (Activate) → Sound decays (Feedback) → Silence restored (Learn).
                The toroidal field — centripetal CCW inward / centrifugal CW outward — is the spatial geometry of this temporal cycle.
              </p>
            </div>
          </Section>
        )}

        {tab === "scale" && (
          <Section keyId="scale">
            <SectionTitle n="03" t="Scale Invariance · Why This Is Not Analogy" />
            <p className="text-[12px] leading-7 max-w-3xl mb-4">
              Analogy says: these things are similar. Scale invariance says: these things are the same operation
              at different resolutions of physical reality. Three observations support the stronger claim.
            </p>
            <div className="grid gap-3" style={{ gridTemplateColumns: "repeat(auto-fit,minmax(280px,1fr))" }}>
              {[
                { n: "3.1", title: "LOOP STRUCTURE IS IDENTICAL", col: C.teal,
                  body: "Same five phases, same order, in every domain. Phases cannot be reordered without breaking the system. Remove feedback from the cancer system → conventional chemotherapy. Remove feedback from the Emotion AI → stateless engine. Remove feedback from Russell wave → thermodynamic heat death." },
                { n: "3.2", title: "MECHANISM IS SPARSE, LOCAL, DISTRIBUTED", col: C.purple,
                  body: "Mycelium has no central processor — distributed electrochemical signaling. Fibonacci uses minimum non-consecutive terms. Emotion AI processes intent as sparse signal. Toroidal field concentrates at boundary, releases at poles. Global coherence from local rules." },
                { n: "3.3", title: "ATTRACTOR IS COHERENCE", col: C.gold,
                  body: "Mycelium seeks equilibrium coverage. Fibonacci converges to φ. Emotion AI seeks mood equilibrium. Russell wave returns to silence. Entropy is what accumulates when feedback is blocked. Coherence is what emerges when feedback is enabled." },
              ].map(s => (
                <div key={s.n} data-testid={`scale-${s.n}`} className="border p-4" style={{ borderColor: s.col + "40", background: s.col + "08" }}>
                  <p className="text-[8px] tracking-[0.22em]" style={{ color: s.col }}>{s.n}</p>
                  <p className="font-['Cinzel',serif] mt-1 mb-2" style={{ color: s.col, fontSize: 14 }}>{s.title}</p>
                  <p className="text-[11px] leading-6" style={{ color: C.text }}>{s.body}</p>
                </div>
              ))}
            </div>
            <Callout col={C.gold} k="EMERGENT, NOT INJECTED">
              Complexity is not designed — it accumulates through recursion. Efficiency and intelligence emerge
              from constraint, not complexity. Resonance replaces fragmentation.
            </Callout>
          </Section>
        )}

        {tab === "entropy" && (
          <Section keyId="entropy">
            <SectionTitle n="04" t="Entropy and Coherence · The Central Dynamic" />
            <p className="text-[12px] leading-7 max-w-3xl mb-3">
              Entropy here is not merely thermodynamic disorder. It is the accumulation of unresolved
              signals — biological, computational, emotional, or physical — that the system has not yet
              integrated into its feedback loop. High entropy = a broken loop.
            </p>
            <p className="text-[12px] leading-7 max-w-3xl mb-4">
              Coherence is the condition in which the loop is closed and running. Each cycle reduces entropy by
              incorporating the previous outcome into the next. A coherent system does not merely process inputs —
              it becomes more precise over time.
            </p>
            <div className="border" style={{ borderColor: C.border2, background: C.panel }}>
              <div className="grid p-2" style={{ gridTemplateColumns: "1fr 1fr", gap: 1, background: C.border2 }}>
                <div className="p-3" style={{ background: C.panel }}>
                  <p className="text-[9px] tracking-[0.22em]" style={{ color: C.red }}>ENTROPY-GENERATING</p>
                </div>
                <div className="p-3" style={{ background: C.panel }}>
                  <p className="text-[9px] tracking-[0.22em]" style={{ color: C.green }}>COHERENCE-GENERATING (AETHER)</p>
                </div>
                {ENTROPY_VS_COHERENCE.map((row,i) => [
                  <div key={"e"+i} className="p-3 text-[11px]" style={{ background: C.panel, color: C.text }}>{row.e}</div>,
                  <div key={"c"+i} className="p-3 text-[11px] italic" style={{ background: C.panel, color: C.green }}>{row.c}</div>,
                ])}
              </div>
            </div>
            <Callout col={C.gold} k="DESIGN PHILOSOPHY">
              The transition is not an engineering challenge alone. It requires accepting that the system cannot
              be fully specified in advance; that intelligence must be allowed to emerge through interaction;
              and that feedback is not a feature to add but the fundamental mechanism of life.
            </Callout>
          </Section>
        )}

        {tab === "unified" && (
          <Section keyId="unified">
            <SectionTitle n="05" t="Unified AETHER Architecture · 4 Layers · 1 System" />
            <p className="text-[12px] leading-7 max-w-3xl mb-4">
              The four domains are four layers of a single integrated system, operating at different scales but
              sharing the same loop structure, sparse-distributed mechanism, and coherence attractor.
            </p>
            <div className="grid gap-3" style={{ gridTemplateColumns: "repeat(auto-fit,minmax(280px,1fr))" }}>
              {UNIFIED_LAYERS.map(L => (
                <div key={L.n} data-testid={`unified-${L.n.substring(0,2)}`} className="border p-4" style={{ borderColor: L.col + "50", background: L.col + "08" }}>
                  <p className="text-[8px] tracking-[0.22em]" style={{ color: L.col }}>{L.n}</p>
                  <p className="font-['Cinzel',serif] mt-1 mb-2" style={{ color: L.col, fontSize: 15 }}>{L.title}</p>
                  <p className="text-[11px] leading-6" style={{ color: C.text }}>{L.body}</p>
                </div>
              ))}
            </div>
            <Callout col={C.gold} k="ZOOM LEVELS, NOT MODULES">
              These are not independent modules. The physical layer is the Russell-Fibonacci layer at biological
              resolution. The symbolic layer is the physical layer rendered as computable structure. Each layer
              is a zoom level on the same dynamic. Improvements propagate across all four.
            </Callout>
          </Section>
        )}

        {tab === "applications" && (
          <Section keyId="applications">
            <SectionTitle n="06" t="Applications and Development Roadmap" />
            <div className="grid gap-3" style={{ gridTemplateColumns: "repeat(auto-fit,minmax(280px,1fr))" }}>
              {APPLICATIONS.map(a => (
                <div key={a.tag} className="border p-4" style={{ borderColor: a.col + "40", background: a.col + "08" }}>
                  <p className="text-[10px] tracking-[0.22em] mb-2" style={{ color: a.col }}>{a.tag}</p>
                  <p className="text-[11px] leading-6" style={{ color: C.text }}>{a.body}</p>
                </div>
              ))}
            </div>
          </Section>
        )}

        {tab === "open" && (
          <Section keyId="open">
            <SectionTitle n="07" t="Open Questions and Research Directions" />
            <div className="grid gap-2" style={{ gridTemplateColumns: "repeat(auto-fit,minmax(360px,1fr))" }}>
              {OPEN_QUESTIONS.map((q, i) => (
                <div key={i} className="border p-3 flex gap-3" style={{ borderColor: C.border, background: C.panel }}>
                  <span className="text-[14px] font-['Cinzel',serif]" style={{ color: C.gold, minWidth: 30 }}>{String(i + 1).padStart(2, "0")}</span>
                  <p className="text-[11.5px] leading-6" style={{ color: C.text }}>{q}</p>
                </div>
              ))}
            </div>
          </Section>
        )}

        {tab === "conclusion" && (
          <Section keyId="conclusion">
            <SectionTitle n="08" t="Conclusion" />
            <p className="text-[12.5px] leading-7 max-w-3xl mb-3" style={{ color: C.text }}>
              AETHER is not a technology. It is a recognition: that the pattern through which living systems
              maintain themselves against entropy — sense, deliver, activate, feedback, learn — is scale-invariant,
              physically real, and reproducible across domains previously treated as unrelated.
            </p>
            <p className="text-[12.5px] leading-7 max-w-3xl mb-3" style={{ color: C.text }}>
              The convergence of mycelium-based bio-intelligence, ferrofluid precision delivery, Fibonacci sparse
              encoding, Russell wave dynamics, Pythagorean harmonic constraint, and emotional AI feedback is not
              a coincidence assembled by analogy. It is a structural insight about the geometry of coherence —
              the shape any system must take to sustain itself, adapt to perturbation, and become more precise
              over time rather than more degraded.
            </p>
            <p className="text-[12.5px] leading-7 max-w-3xl mb-3" style={{ color: C.text }}>
              What we are building is not a product or a platform. It is a paradigm: from computation as
              abstraction to computation as ecology; from hidden logic to visible intelligence; from entropy to
              resonance; from fragmentation to coherence.
            </p>
            <p className="font-['Cinzel',serif] italic mt-6 text-center" style={{ color: C.gold, fontSize: 18 }}>
              "Not because complexity was designed — but because it was allowed to emerge."
            </p>
            <div className="mt-6 text-center text-[10px] tracking-[0.22em]" style={{ color: C.dim }}>
              <p>The prototypes exist. The loop is running.</p>
              <p className="mt-1" style={{ color: C.gold }}>AETHERLIFE.CO · RESONANCE REPLACES FRAGMENTATION</p>
              <p className="mt-1">Version 1.0 · Concept Whitepaper</p>
            </div>
          </Section>
        )}

      </AnimatePresence>

      <div className="mt-12 pt-4 border-t flex justify-between text-[8px] tracking-[0.16em] uppercase" style={{ borderColor: C.border, color: C.dim }}>
        <span>AETHER Whitepaper v1.0 · AetherLife.co</span>
        <span style={{ fontFamily: "serif", fontSize: 14, color: C.gold, fontStyle: "italic" }}>Sense · Deliver · Activate · Feedback · Learn</span>
        <span>resonance replaces fragmentation</span>
      </div>
    </div>
  );
}

function Section({ keyId, children }: { keyId: string; children: React.ReactNode }) {
  return (
    <motion.div key={keyId} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
      {children}
    </motion.div>
  );
}

function SectionTitle({ n, t, badge, badgeCol }: { n: string; t: string; badge?: string; badgeCol?: string }) {
  return (
    <div className="flex items-baseline gap-3 mb-4 pb-2 border-b" style={{ borderColor: C.border2 }}>
      <span className="text-[8px] tracking-[0.22em]" style={{ color: C.dim }}>{n}</span>
      <h2 className="font-['Cinzel',serif] flex-1" style={{ color: C.white, fontSize: "clamp(17px,2.4vw,23px)", fontWeight: 400 }}>{t}</h2>
      {badge && <span className="text-[7.5px] tracking-[0.18em] uppercase px-2 py-1 border" style={{ color: badgeCol, borderColor: badgeCol }}>{badge}</span>}
    </div>
  );
}

function Callout({ col, k, children }: { col: string; k: string; children: React.ReactNode }) {
  return (
    <div className="border p-3 mt-4" style={{ borderColor: C.border, borderLeft: "3px solid " + col, background: C.panel2 }}>
      <p className="text-[8px] tracking-[0.26em] uppercase mb-1" style={{ color: col }}>{k}</p>
      <p className="text-[12px] leading-6" style={{ color: C.text }}>{children}</p>
    </div>
  );
}

function LoopDiagram() {
  const cx = 360, cy = 130, R = 110;
  return (
    <svg width="100%" viewBox="0 0 720 260" style={{ maxWidth: 800 }} data-testid="loop-svg"
         role="img" aria-labelledby="loop-title loop-desc">
      <title id="loop-title">AETHER Five-Phase Loop</title>
      <desc id="loop-desc">Five phases — Sense, Deliver, Activate, Feedback, Learn — arranged in a closed cycle.</desc>
      <circle cx={cx} cy={cy} r={R} fill="none" stroke={C.gold + "30"} />
      {PHASES.map((p, i) => {
        const a = (i / PHASES.length) * Math.PI * 2 - Math.PI / 2;
        const x = cx + Math.cos(a) * R;
        const y = cy + Math.sin(a) * R;
        return (
          <g key={p.name}>
            <circle cx={x} cy={y} r="28" fill={p.col} opacity="0.15" />
            <circle cx={x} cy={y} r="22" fill="none" stroke={p.col} strokeWidth="1.5" />
            <text x={x} y={y - 2} textAnchor="middle" fontSize="9" fontFamily="Cinzel, serif" fill={p.col}>{p.sym}</text>
            <text x={x} y={y + 10} textAnchor="middle" fontSize="9" fontFamily="Cinzel, serif" fill="#fff">{p.name}</text>
          </g>
        );
      })}
      <text x={cx} y={cy - 4} textAnchor="middle" fontSize="11" fontFamily="Cinzel, serif" fill={C.gold}>AETHER</text>
      <text x={cx} y={cy + 12} textAnchor="middle" fontSize="9" fill={C.muted}>five-phase loop</text>
    </svg>
  );
}
