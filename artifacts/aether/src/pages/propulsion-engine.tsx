import { useState } from "react";
import { Link } from "wouter";
import scaleHierarchy from "@assets/ChatGPT_Image_Jun_13,_2026,_01_58_40_PM_1781374238871.png";
import organicHeart from "@assets/image_(7)_1781374277640.jpg";
import organicCell from "@assets/Pczu4_1781374277641.jpg";
import compoundEyeMath from "@assets/ChatGPT_Image_Jun_6,_2026,_10_16_24_PM_1781374303074.png";
import ferroSiliconDetailed from "@assets/ChatGPT_Image_Jun_8,_2026,_02_03_27_PM_1781374303075.png";
import compoundEyeMath2 from "@assets/ChatGPT_Image_Jun_6,_2026,_10_13_36_PM_1781374310172.png";
import compoundEyeVisual from "@assets/ChatGPT_Image_Jun_6,_2026,_10_16_15_PM_1781374310174.png";

const C = {
  void:   "#010408",
  deep:   "#030912",
  panel:  "#060f1e",
  border: "rgba(46,109,164,0.22)",
  border2:"rgba(46,109,164,0.45)",
  teal:   "#1fd4c8",
  bright: "#4a9fd4",
  gold:   "#c9a84c",
  violet: "#8b5cf6",
  pink:   "#ec4899",
  red:    "#ef4444",
  green:  "#22c55e",
  orange: "#f97316",
  text:   "#d4e8f7",
  dim:    "#3a5a7a",
};

const BADGE = ({ label, color = C.teal }: { label: string; color?: string }) => (
  <span style={{
    fontSize: 10, letterSpacing: "0.18em", padding: "3px 10px",
    borderRadius: 4, border: `1px solid ${color}44`,
    color, fontFamily: "'DM Mono',monospace", textTransform: "uppercase",
    background: `${color}0d`, whiteSpace: "nowrap",
  }}>{label}</span>
);

function KickerSection({ kicker, title, lead, color = C.teal, children }: {
  kicker: string; title: string; lead?: string; color?: string; children?: React.ReactNode;
}) {
  return (
    <section style={{ marginBottom: "3.5rem", scrollMarginTop: "2rem" }}>
      <div style={{ fontSize: 11, letterSpacing: "0.34em", color, fontFamily: "'DM Mono',monospace",
        textTransform: "uppercase", marginBottom: 6 }}>{kicker}</div>
      <h2 style={{ fontSize: "clamp(1.4rem, 3vw, 2rem)", fontWeight: 700, color: "#f1f5f9",
        margin: "0 0 0.6rem", letterSpacing: "-0.01em", lineHeight: 1.2 }}>{title}</h2>
      {lead && <p style={{ color: "#94a3b8", fontSize: "0.97rem", lineHeight: 1.7,
        maxWidth: 860, margin: "0 0 1.4rem" }}>{lead}</p>}
      {children}
    </section>
  );
}

function InfoCard({ title, body, color = C.teal, tags = [] }: {
  title: string; body: string; color?: string; tags?: string[];
}) {
  return (
    <div style={{
      background: "rgba(6,15,30,0.8)", border: `1px solid ${color}33`,
      borderRadius: 12, padding: "1.2rem 1.4rem",
      borderLeft: `3px solid ${color}`,
    }}>
      <div style={{ fontSize: 12, fontWeight: 700, color, letterSpacing: "0.08em",
        fontFamily: "'DM Mono',monospace", marginBottom: 6, textTransform: "uppercase" }}>{title}</div>
      <p style={{ color: "#94a3b8", fontSize: "0.9rem", lineHeight: 1.65, margin: "0 0 0.8rem" }}>{body}</p>
      {tags.length > 0 && (
        <div style={{ display: "flex", flexWrap: "wrap", gap: 5 }}>
          {tags.map(t => <BADGE key={t} label={t} color={color} />)}
        </div>
      )}
    </div>
  );
}

function FullImage({ src, caption, meta }: { src: string; caption: string; meta?: string }) {
  return (
    <figure style={{ margin: 0, borderRadius: 14, overflow: "hidden",
      background: "rgba(15,23,42,0.7)", border: "1px solid rgba(255,255,255,0.08)",
      boxShadow: "0 8px 32px rgba(0,0,0,0.4)" }}>
      <img src={src} alt={caption} loading="lazy"
        style={{ width: "100%", height: "auto", display: "block" }} />
      <figcaption style={{ padding: "0.75rem 1rem", fontSize: "0.82rem", color: "#94a3b8", lineHeight: 1.5 }}>
        {meta && <span style={{ fontSize: 10, letterSpacing: "0.2em", color: C.teal,
          fontFamily: "'DM Mono',monospace", textTransform: "uppercase",
          display: "block", marginBottom: 3 }}>{meta}</span>}
        {caption}
      </figcaption>
    </figure>
  );
}

const DOMAIN_CARDS = [
  {
    icon: "⚛", label: "Nano · Atomic", color: C.teal,
    scale: "0.2 nm → 100 nm",
    mechanism: "Molecular motor arrays, ferrofluid magnetic domain actuation, moth-eye nanostructure propulsive surfaces, phononic crystal waveguides.",
    substrate: "Fe₃O₄ nanoparticle chains (5–20 nm) in magnetised fluid medium; silicon lattice-anchored quantum dot arrays.",
    guf: "Ring bands 1–50 · Pure potential layer. ρ_info at maximum — smallest pixels, strongest curvature.",
  },
  {
    icon: "🌍", label: "Land · Ground", color: C.green,
    scale: "1 mm → 10 m",
    mechanism: "Ferrofluid magnetic bearing wheels with zero-friction contact; crystalline substrate treads that adapt topology in real time; vortex-turbine ground-effect propulsion.",
    substrate: "BAVS substrate layers — bio-adaptive vortex structures grown from CaCO₃ precipitation under violet light — form the reactive ground-contact material.",
    guf: "Ring bands 101–200 · Particle/molecular dynamics. Pixelated gravity gradient drives ground-contact coherence.",
  },
  {
    icon: "🌊", label: "Sea · Fluid", color: C.bright,
    scale: "10 mm → 100 m",
    mechanism: "Ferrofluid hull morphology — field-shaped spikes and domain flows reduce drag to near zero. Biological undulatory fin propulsion mimicked in gyroid substrate sheets.",
    substrate: "Gyroid v3.0 photonic crystal channels embedded in ferrofluid hull. Light-directed CaCO₃ precipitation hardens structural elements on demand.",
    guf: "Ring bands 151–250 · Chemical/fluid architectures. D5 Vortex dimension drives undulatory modes.",
  },
  {
    icon: "🌬", label: "Air · Atmospheric", color: "#f59e0b",
    scale: "1 cm → 1 km",
    mechanism: "Compound-eye ommatidium array for wide-field flow sensing (180°+). Metasurface phase-control surfaces eliminate induced drag. Bio-inspired flocking algorithms for swarm formation.",
    substrate: "Metasurface coating (0.5–5 µm elements) over moth-eye nanostructure base — <1% reflection loss, adaptive aerodynamic profile.",
    guf: "Ring bands 201–300 · Macro-molecular & atmospheric. D4 Field dimension governs phase-aligned surface actuation.",
  },
  {
    icon: "🚀", label: "Space · Orbital", color: C.violet,
    scale: "100 m → 1,000 km",
    mechanism: "Compound-eye laser aperture array (coherent beam combining: P_total = η_coh · N · P_single). Radiation pressure sail: F = 2P/c. Orbital laser relay: 100 m → 10 km aperture.",
    substrate: "Plate-switching optical hull — each hexagonal plate is a full optical cell (sense · steer · emit · absorb) with 6-axis MEMS actuation.",
    guf: "Ring bands 301–400 · Planetary ring layer. Ring-barrier crossing threshold = escape velocity.",
  },
  {
    icon: "🌌", label: "Warp · D8", color: C.pink,
    scale: "Lightyears",
    mechanism: "Twisted Zipper Drive — Alcubierre metric + Φ-Time modulation. Three D8 propagation mechanisms: Laser Thread Warp Bounce, Volcanic Propulsion, Gravity Crystal Flow (dimensionless water over gravity crystals).",
    substrate: "D8 coordinate: ξ = ∂(D1...D7)/∂s. Reality itself is the medium. The eight-dimensional wave equation: ∂²Φ₈/∂ξ² = c₈² · ∇₇²Φ₈.",
    guf: "Ring band 500+ · Consciousness/Source threshold. v_escape(ring 500) → c. The warp bubble is a ring-barrier crossing event at the universal scale.",
  },
];

const SYMBOLS = [
  { sym: "φ", name: "Golden Ratio", val: "1.618…", role: "Φ-Time non-periodic scheduling — resonance suppression across all ring layers. Sunflower, nautilus, FMO photosynthesis, quasicrystals, Schumann resonance ratios." },
  { sym: "∇", name: "Gradient", val: "del", role: "G(x,y,z,t) ≈ ∇ρ_info — gravity is the informational density gradient. The propulsion problem is: engineer ∇ρ_info." },
  { sym: "Ψ", name: "Wave Function", val: "field state", role: "Φ₈(ξ, D1…D7) — the eight-dimensional wave packet that carries a ship along D8 without force in D1." },
  { sym: "⊕", name: "Ring Sum", val: "⊕ all layers", role: "U = ∪ R_n — the universe is the union of all ring layers. Each propulsion domain is one ring-band crossing." },
  { sym: "∞", name: "Recursion", val: "R_n ⊂ R_{n+1}", role: "Infinite recursion: each ring contains and is contained by infinite rings. Scale is perspectival — the nano engine and the warp drive obey the same crossing mechanics." },
  { sym: "Θ", name: "Twist Angle", val: "n × 222.5°", role: "Θ_φ = 2π/φ — the golden angle. Φ-pulsed twist rate for the Twisted Zipper Drive; also the phyllotaxis packing angle in substrate growth." },
  { sym: "σ", name: "Coherence", val: "field quality", role: "Coherence (C_total) is the sum across 5 domains weighted dynamically. The propulsion system IS a coherence minimization engine." },
  { sym: "∂", name: "Partial", val: "∂/∂ξ", role: "D8 coordinate derivative — the rate of change of the entire 7D field configuration along the wave path. Travel is differentiation, not translation." },
];

import { useEffect, useRef } from "react";

function PropulsionHeaderCanvas() {
  const ref = useRef<HTMLCanvasElement>(null);
  const rafRef = useRef(0);
  useEffect(() => {
    const canvas = ref.current; if (!canvas) return;
    const ctx = canvas.getContext("2d")!;
    canvas.width = 900; canvas.height = 145;
    const W = canvas.width, H = canvas.height;
    let t=0;
    const particles: {x:number;y:number;vx:number;vy:number;life:number;maxLife:number}[]=[];
    const emit=()=>{
      const cx=W*0.25,cy=H/2;
      particles.push({x:cx,y:cy,vx:-(3+Math.random()*4),vy:(Math.random()-0.5)*2,life:0,maxLife:40+Math.random()*20});
    };
    const draw=()=>{
      ctx.fillStyle="rgba(2,4,8,0.3)"; ctx.fillRect(0,0,W,H);
      if(t%4===0) emit();
      const cx=W*0.25,cy=H/2;
      ctx.beginPath();
      ctx.moveTo(cx,cy-40);ctx.lineTo(cx+120,cy);ctx.lineTo(cx,cy+40);ctx.closePath();
      ctx.fillStyle="rgba(153,102,255,0.15)";ctx.fill();ctx.strokeStyle="rgba(153,102,255,0.5)";ctx.lineWidth=0.8;ctx.stroke();
      for(let i=particles.length-1;i>=0;i--){
        const p=particles[i];p.x+=p.vx;p.y+=p.vy;p.life++;
        if(p.life>p.maxLife){particles.splice(i,1);continue;}
        const alpha=1-p.life/p.maxLife;
        const r=Math.round(255*alpha),g=Math.round(100*alpha),b=0;
        ctx.beginPath();ctx.arc(p.x,p.y,2+alpha*3,0,Math.PI*2);ctx.fillStyle=`rgba(${r},${g},${b},${alpha})`;ctx.fill();
      }
      ctx.fillStyle="rgba(153,102,255,0.3)"; ctx.font="9px 'DM Mono',monospace";
      ctx.fillText("PROPULSION ENGINE · THRUST · EXHAUST PLUME · ELECTROMAGNETIC · AETHER",14,14);
      t++; rafRef.current=requestAnimationFrame(draw);
    };
    draw();
    return ()=>cancelAnimationFrame(rafRef.current);
  },[]);
  return <canvas ref={ref} style={{width:"100%",height:"auto",borderRadius:8,display:"block"}} />;
}

export default function PropulsionEnginePage() {
  const [activeTab, setActiveTab] = useState<"all" | "nano" | "land" | "air" | "sea" | "space" | "warp">("all");
  const BASE = import.meta.env.BASE_URL.replace(/\/$/, "");

  const visibleDomains = activeTab === "all"
    ? DOMAIN_CARDS
    : DOMAIN_CARDS.filter(d => d.label.toLowerCase().startsWith(activeTab));

  return (
    <div style={{ minHeight: "100vh", background: `radial-gradient(ellipse at top, #040d1c 0%, ${C.void} 60%)`,
      color: C.text, fontFamily: "'Outfit', system-ui, sans-serif",
      padding: "3rem 1.5rem 6rem" }}>
      <div style={{flexShrink:0,margin:"-3rem -1.5rem 20px"}}>
        <div style={{padding:"8px 24px"}}><div style={{display:"inline-block",border:"1px solid #9966ff",padding:"4px 12px",fontSize:10,letterSpacing:"0.2em",color:"#9966ff",fontFamily:"'DM Mono',monospace",marginBottom:16}}>LIVE SIMULATION</div></div>
        <div style={{margin:"0 24px 0",background:"rgba(2,4,8,0.8)",borderLeft:"3px solid #9966ff",borderRadius:4,overflow:"hidden"}}>
          <div style={{padding:"12px 16px 8px"}}><h2 style={{margin:0,fontSize:13,color:"#9966ff",fontFamily:"'DM Mono',monospace",letterSpacing:"0.15em",fontWeight:400}}>PROPULSION ENGINE · THRUST · EXHAUST PLUME · ELECTROMAGNETIC · AETHER</h2><p style={{margin:"4px 0 8px",fontSize:10,color:"rgba(153,102,255,0.5)",fontFamily:"'DM Mono',monospace",letterSpacing:"0.1em"}}>Live exhaust plume — the AETHER propulsion engine simulation.</p></div>
          <PropulsionHeaderCanvas />
        </div>
      </div>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Outfit:wght@400;600;700;800&family=DM+Mono&display=swap');`}</style>

      <div style={{ maxWidth: 1280, margin: "0 auto" }}>

        {/* ── Masthead ── */}
        <header style={{ padding: "2rem 2rem 2.5rem", borderRadius: 20,
          marginBottom: "2.5rem",
          background: "linear-gradient(135deg, rgba(31,212,200,0.08), rgba(139,92,246,0.08))",
          border: "1px solid rgba(31,212,200,0.2)" }}>
          <div style={{ fontSize: 11, letterSpacing: "0.42em", color: C.teal,
            fontFamily: "'DM Mono',monospace", textTransform: "uppercase", marginBottom: 8 }}>
            AETHER · GUF · Shia Miller 2026
          </div>
          <h1 style={{ fontSize: "clamp(2rem, 5vw, 3.4rem)", fontWeight: 800, color: "#f1f5f9",
            margin: "0 0 0.6rem", letterSpacing: "-0.025em", lineHeight: 1.08 }}>
            PROPULSION ENGINE
          </h1>
          <p style={{ fontSize: "1.05rem", color: "#94a3b8", lineHeight: 1.7, maxWidth: 860, margin: "0 0 1.2rem" }}>
            From the silicon lattice at 0.2 nm to an interplanetary beam array spanning 1,000 km — a unified propulsion
            architecture for land · air · sea · orbital · warp domains, grounded in the GUF's eight-dimensional framework,
            the Stacked Rings substrate, and Φ-coherence resonance physics. Every scale obeys the same ring-barrier
            crossing mechanics. Every engine is a coherence engine.
          </p>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 7 }}>
            {["Nano · 0.2 nm", "Land · Robotics", "Air · Atmospheric", "Sea · Ferrofluid", "Orbital · Laser Sail", "Warp · D8 Wave", "Φ-Coherence", "Compound-Eye Optics", "Crystallization Control", "5-Domain Event Bus"].map(b => (
              <BADGE key={b} label={b} color={C.teal} />
            ))}
          </div>
        </header>

        {/* ── I. Scale Hierarchy ── */}
        <KickerSection kicker="I · Scale Architecture · Nano to Interplanetary"
          title="The Propulsion Ladder: 0.2 nm → 1,000 km"
          color={C.teal}
          lead="Every propulsion mechanism in the AETHER system maps to a rung on this 12-order-of-magnitude scale. Atomic lattice spacing (0.2 nm silicon) → moth-eye nanostructure pillars (100–300 nm) → metasurface phase elements (0.5–5 µm) → ommatidium microlens (10–50 µm) → compound-eye cluster (1–10 mm) → laser aperture array (10 cm–10 m) → directed energy platform (1–100 m) → orbital laser array (100 m–10 km) → interplanetary beam (10–1,000 km). The GUF ring-band system maps each rung to a ring layer: ring bands 1–300 for classical substrate, 301–400 for planetary, 401–500 for consciousness, 500+ for warp.">
          <FullImage src={scaleHierarchy}
            meta="Optical Scale Hierarchy · 12 rungs · 0.2 nm → 1,000 km"
            caption="Scale: Atomic (Silicon lattice, 0.2 nm) · Nanostructure (Moth-eye AR pillars, 100–300 nm) · Metasurface (Phase elements, 0.5–5 µm) · Ommatidium Lens (Individual microlens, 10–50 µm) · Waveguide Core (Light channel, 5–20 µm) · Artificial Ommatidium (Complete optical cell, 20–100 µm) · Compound-Eye Cluster (Lens sub-array, 1–10 mm) · Full Compound-Eye Optic (Curved surface, 1–20 cm) · Laser Aperture Array (Coherent emitter field, 10 cm–10 m) · Directed Energy System (Beam-forming platform, 1–100 m) · Orbital Laser Array (Spacecraft-scale optics, 100 m–10 km) · Interplanetary Beamer (Propulsion infrastructure, 10–1,000 km)." />
        </KickerSection>

        {/* ── II. Compound-Eye Bioinspired Optics ── */}
        <KickerSection kicker="II · Compound-Eye Bioinspired Optics"
          title="Biology → Engineering → Propulsion"
          color={C.bright}
          lead="Insect compound eyes are the most efficient wide-field optical systems in nature: 180°+ field of view, <1% reflection loss (moth-eye nanostructure), parallel distributed processing across thousands of ommatidia. AETHER's propulsion architecture borrows all three properties — wide sensing, near-zero loss, massively parallel beam control. P_total = η_coh · N · P_single for coherent combining; F = 2P/c for radiation pressure thrust.">
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 560px), 1fr))", gap: "1.2rem", marginBottom: "1.4rem" }}>
            <FullImage src={compoundEyeVisual}
              meta="Compound Eyes → High-Efficiency Lasers & Propulsion · Visual"
              caption="Nature's design: insect ommatidium (corneal microlens · nipple array anti-reflection · crystalline cone waveguide · pigment sheath · photoreceptor) → biomimetic arrays → compound-eye laser optic array → propulsion and orbital beam-forming systems. Hierarchical progression: Insect Eye (1–10 mm) → Ommatidium → Microlens Array → Compound-Eye Optic (1–20 cm) → Laser Aperture Array (10 cm–10 m) → Beam-Forming System → Orbital Laser Array (100 m–10 km) → Interplanetary Beamer (10–1,000 km)." />
            <FullImage src={compoundEyeMath}
              meta="Compound-Eye Bioinspired Optics · Mathematical & Physical Scale Chart"
              caption="Full mathematical framework: (1) Scale Hierarchy 0.2 nm → 1,000 km. (2) Diffraction Limit θ ≈ 1.22 λ/D. (3) Ommatidium Count Scaling N ≈ A/p². (4) Coherent Laser Combining P_total = η_coh · N · P_single. (5) Laser Sail Radiation Pressure F = 2P/c · Acceleration a = 2P/cm_sail. (6) Optical Throughput & Efficiency. (7) Wave Optics & Phase Control: |Δφ| < π/10 for >90% coherence; ΔL < λ/20. (8) Hierarchical Progression Biology → Engineering → Propulsion. Key constants: c = 3×10⁸ m/s · h = 6.626×10⁻³⁴ J·s · k_B = 1.381×10⁻²³ J/K · 1 AU = 1.496×10¹¹ m." />
          </div>
          <FullImage src={compoundEyeMath2}
            meta="Compound-Eye Bioinspired Optics · Full Chart Version 2"
            caption="Duplicate reference panel — identical mathematical framework for cross-checking. Beam steering: θ_steer = arcsin(mλ/d). Focal spot size (Airy disk): d_Airy = 2.44 λf/D. Phase difference: Δφ = 2π/λ · ΔL. Coherent combining condition: |Δφ| < π/10 requires ΔL < λ/20." />
        </KickerSection>

        {/* ── III. Ferrofluid vs Silicon Full ── */}
        <KickerSection kicker="III · Substrate Architecture · Dual-Material Scale Map"
          title="Ferrofluid vs Silicon — From Atom to Terascale"
          color={C.gold}
          lead="Two complementary substrate architectures — ferrofluid (Fe₃O₄ nanoparticles, 0.1–1 nm magnetic domain clusters) and silicon (diamond-cubic lattice, 0.2 nm) — mapped across 8 scale bands from Atomic through Terascale (100–1,000 km). Ferrofluid provides field-adaptive, magnetically programmable surfaces (zero-contact bearings, hull morphology, energy damping). Silicon provides crystalline precision for sensing, computation, and quantum coherence. GUF uses both as complementary layers of the propulsion substrate.">
          <FullImage src={ferroSiliconDetailed}
            meta="Ferrofluid vs Silicon · Cross-Scale Comparison · Atomic → Terascale"
            caption="Left: Ferrofluid — Iron atoms in magnetic domains (~0.1–1 nm) → Fe₃O₄ nanoparticles 5–20 nm → chain/spike/domain patterns in fluid (1–100 µm) → field-shaped interfaces and complex flows (100 µm–1 mm) → bulk fluid under magnetic field (1 mm–1 m) → industrial seals and dampers (1–100 m) → conceptual energy-damping gigasystems (100 m–100 km) → theoretically magnetically controlled space structures (100–1,000 km). Right: Silicon — Silicon lattice constant 0.2 nm → nanowires/quantum dots/thin films (10–1,000 nm) → microelectronic features/transistors/interconnects (1–100 µm) → die layout/MEMS/micro-optical elements (100 µm–1 mm) → wafers/chips/packaged semiconductor devices (1 mm–1 m) → fab tools and industrial semiconductor lines (1–100 m) → fab facilities/data centers/supply chains (100 m–100 km) → space electronics/satellite systems/integrated silicon at scale (100–1,000 km)." />
        </KickerSection>

        {/* ── IV. Living Substrate — Organic Images ── */}
        <KickerSection kicker="IV · Living Substrate · Bio-Hybrid Engine Architecture"
          title="The Engine Is Alive — Crystalline Organic Propulsion"
          color={C.pink}
          lead="The GUF propulsion framework is not purely mechanical. The substrate itself is alive — CaCO₃ crystallisation under violet light produces biological-grade structures with responsive topology. These images show what the propulsion substrate looks like at the cellular/organ scale: crystalline networks that flex, route energy, and self-repair. The 'engine' is the substrate. The thrust emerges from coherent substrate state change.">
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 340px), 1fr))", gap: "1.2rem" }}>
            <FullImage src={organicHeart}
              meta="Living Engine · Crystalline Heart Substrate"
              caption="Crystalline organic substrate at organ scale — GUF bio-hybrid engine architecture. Layered crystalline cells (amber/translucent geometry) arranged around a central pumping node, embedded in a fluid vascular network (translucent filaments + droplets). This is the physical form of a living propulsion engine: the crystal lattice stores phase information; the vascular network distributes it; the topology changes produce thrust." />
            <FullImage src={organicCell}
              meta="Living Engine · Cellular Network Node"
              caption="Cellular network junction — the node where three substrate channels converge. Translucent connective tissue (D4 Field substrate) surrounds a central amber crystalline computation node (D3 Energy store). The droplets along the filaments are coherence checkpoints — localised ring-harmonic resonance sites where the substrate reads its own state and adjusts flow. This is D6 Conscious substrate: self-referential at the cellular level." />
          </div>
        </KickerSection>

        {/* ── V. Domain Cards ── */}
        <KickerSection kicker="V · Propulsion Domains"
          title="Six Domains · One Crossing Mechanics"
          color="#22c55e"
          lead="Every domain — nano through warp — is a ring-barrier crossing event at a different ring-band threshold. The mechanism is identical: accumulate coherence energy above the crossing threshold, modulate with Φ-Time to suppress resonance, engage the 5-Domain Event Bus. What differs is the medium, the scale, and which dimension of the GUF framework does the work.">
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: "1.4rem" }}>
            {[
              { key: "all", label: "All Domains" },
              { key: "nano", label: "⚛ Nano" },
              { key: "land", label: "🌍 Land" },
              { key: "sea", label: "🌊 Sea" },
              { key: "air", label: "🌬 Air" },
              { key: "space", label: "🚀 Space" },
              { key: "warp", label: "🌌 Warp" },
            ].map(({ key, label }) => (
              <button key={key} onClick={() => setActiveTab(key as typeof activeTab)}
                style={{
                  fontSize: 11, letterSpacing: "0.14em", padding: "5px 14px",
                  borderRadius: 6, border: `1px solid ${activeTab === key ? C.teal : C.border}`,
                  color: activeTab === key ? C.teal : "#64748b",
                  background: activeTab === key ? "rgba(31,212,200,0.12)" : "rgba(6,15,30,0.5)",
                  cursor: "pointer", fontFamily: "'DM Mono',monospace", textTransform: "uppercase",
                }}>
                {label}
              </button>
            ))}
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 400px), 1fr))", gap: "1rem" }}>
            {visibleDomains.map(d => (
              <div key={d.label} style={{
                background: "rgba(6,15,30,0.85)", border: `1px solid ${d.color}33`,
                borderRadius: 14, padding: "1.3rem 1.5rem", borderLeft: `4px solid ${d.color}`,
              }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
                  <span style={{ fontSize: 22 }}>{d.icon}</span>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 700, color: d.color,
                      fontFamily: "'DM Mono',monospace", letterSpacing: "0.12em",
                      textTransform: "uppercase" }}>{d.label}</div>
                    <div style={{ fontSize: 11, color: C.dim, letterSpacing: "0.1em",
                      fontFamily: "'DM Mono',monospace" }}>{d.scale}</div>
                  </div>
                </div>
                <div style={{ fontSize: "0.88rem", color: "#94a3b8", lineHeight: 1.6, marginBottom: 8 }}>
                  <strong style={{ color: "#cbd5e1" }}>Mechanism: </strong>{d.mechanism}
                </div>
                <div style={{ fontSize: "0.83rem", color: "#64748b", lineHeight: 1.55, marginBottom: 8 }}>
                  <strong style={{ color: "#94a3b8" }}>Substrate: </strong>{d.substrate}
                </div>
                <div style={{ fontSize: "0.8rem", color: d.color, opacity: 0.7,
                  fontFamily: "'DM Mono',monospace", lineHeight: 1.5, borderTop: `1px solid ${d.color}22`,
                  paddingTop: 8 }}>
                  GUF: {d.guf}
                </div>
              </div>
            ))}
          </div>
        </KickerSection>

        {/* ── VI. GUF Physics ── */}
        <KickerSection kicker="VI · GUF Propulsion Physics"
          title="The Unified Crossing Equation"
          color={C.violet}
          lead="Classical escape velocity is a special case of the ring-barrier crossing threshold: v_cross = √(2 · [ρ_info(r₀) − ρ_info(r∞)] · Γ). When Γ = GM/r, this reduces exactly to v_escape = √(2GM/r). Every propulsion problem — from nano-motor to warp bubble — is the same equation at a different ring layer.">
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 320px), 1fr))", gap: "1rem", marginBottom: "1.4rem" }}>
            <InfoCard color={C.teal} title="D8 Wave Equation"
              body="∂²Φ₈/∂ξ² = c₈² · ∇₇²Φ₈ — the master propagation equation. The ship is not moved through D1 space; its seven-dimensional field configuration is propagated along D8. D8 coordinate: ξ = ∂(D1…D7)/∂s."
              tags={["D8 Wave", "Seven-Dim Field", "Propagation Axis", "Ring-Field Navigation"]} />
            <InfoCard color={C.gold} title="Laser Thread Warp Bounce"
              body="Coherence thickness T_c ≥ Δn · λ_ring / λ_photon. When T_c exceeds the ring-barrier thickness, the laser thread creates a D4 harmonic reflective surface. The metric folds: Δx_eff = Δx_actual · (1 − f_bounce)."
              tags={["Coherence Thickness", "D4 Mirror Surface", "Metric Fold", "Φ-Modulated Pulse"]} />
            <InfoCard color={C.violet} title="Φ-Time Resonance Suppression"
              body="I_laser(tₙ) = I₀ · φ^(−n) · e^(i·n·Θ_φ). Golden-angle pulse spacing (Θ_φ = 222.5°) prevents standing-wave resonance buildup in the D4 surface — the same principle that governs phyllotaxis, FMO photosynthesis, and Schumann resonance ratios."
              tags={["Golden Angle 222.5°", "Resonance Suppression", "Φ-Pulsed Laser", "D4 Stability"]} />
            <InfoCard color={C.green} title="Radiation Pressure Propulsion"
              body="F = 2P/c (perfect reflector). Acceleration a = 2P / (c · m_sail). At 1 GW power: F = 6.67 N. At 1 TW: F = 6.67 kN. Coherent combining: P_total = η_coh · N · P_single (η_coh ≈ 0.85–0.95 for phased arrays)."
              tags={["F = 2P/c", "Coherent Combining", "η_coh 0.85–0.95", "Phased Array"]} />
            <InfoCard color={C.pink} title="Gravity Crystal Flow (D3+D1+D2)"
              body="Dimensionless water flowing over crystalline gravity gradients produces self-regulating spacetime curvature. Water's dimensionless flow properties in a crystalline field architecture generate sustained warp — continuous curvature traversal without exotic matter."
              tags={["Gravity Crystals", "Dimensionless Water", "D3 Energy", "Sustained Warp"]} />
            <InfoCard color={C.orange} title="Volcanic Propulsion (D5+D3)"
              body="High-pressure planetary vortex dynamics at the crust-to-surface ring-band boundary generate directional D8 impulse. A volcano is a natural dimensional boundary event — ring bands 201–300 breaking through to surface layer. Impulse warp via pressure-differential traverse."
              tags={["Planetary Vortex", "D5 Vortex", "Ring-Band Boundary", "Impulse Warp"]} />
          </div>
        </KickerSection>

        {/* ── VII. Culture + Symbols ── */}
        <KickerSection kicker="VII · Culture · Mathematics · Symbols"
          title="The Universal Language of Propulsion"
          color={C.gold}
          lead="Science advances when it borrows structure from culture. The golden ratio appears in Sanskrit poetry, Islamic geometric tiling, African fractal architecture, and Celtic knotwork — all long before it appeared in physics. The ring-field topology recurs across Aztec sun calendars, Buddhist mandalas, Norse Yggdrasil, and Chinese cosmological diagrams. These are not coincidences — they are independent rediscoveries of the same ring-harmonic structure underlying reality. Integrating cultural mathematics enriches the framework and acknowledges that human civilisations have been computing with the GUF for millennia.">
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 280px), 1fr))", gap: "0.85rem" }}>
            {SYMBOLS.map(s => (
              <div key={s.sym} style={{
                background: "rgba(6,15,30,0.8)", border: "1px solid rgba(201,168,76,0.2)",
                borderRadius: 10, padding: "1rem 1.1rem", display: "flex", gap: 14, alignItems: "flex-start",
              }}>
                <div style={{ fontSize: 36, lineHeight: 1, color: C.gold, fontFamily: "Georgia, serif",
                  flexShrink: 0, minWidth: 44, textAlign: "center" }}>{s.sym}</div>
                <div>
                  <div style={{ fontSize: 12, fontWeight: 700, color: C.gold, fontFamily: "'DM Mono',monospace",
                    textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 3 }}>
                    {s.name} <span style={{ color: C.dim, fontWeight: 400 }}>· {s.val}</span>
                  </div>
                  <div style={{ fontSize: "0.84rem", color: "#94a3b8", lineHeight: 1.6 }}>{s.role}</div>
                </div>
              </div>
            ))}
          </div>
          <div style={{ marginTop: "1.4rem", padding: "1.2rem 1.5rem", borderRadius: 12,
            background: "rgba(201,168,76,0.06)", border: "1px solid rgba(201,168,76,0.18)" }}>
            <div style={{ fontSize: 11, letterSpacing: "0.28em", color: C.gold,
              fontFamily: "'DM Mono',monospace", textTransform: "uppercase", marginBottom: 10 }}>
              Cultural Cross-References · Ring Topology in World Tradition
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 220px), 1fr))", gap: "0.6rem" }}>
              {[
                ["Sanskrit", "Mandala — concentric ring cosmology. Bindu (central point) = D7 Source."],
                ["Islamic Geometry", "8-fold star tiling — Θ_φ = 45° × 8 approximates golden-angle packing."],
                ["African Fractal", "Recursive village layouts — Turing's diffusion equation in mud and stone."],
                ["Aztec Sun", "20+13 ring calendar — prime ring-band interference pattern encoding time."],
                ["Celtic Knot", "Continuous single-thread topology — vortex without termination, R₀ = 1."],
                ["Chinese Ba Gua", "8-trigram octagon — 8D field projection onto 2D cultural interface."],
                ["Norse Yggdrasil", "9-world tree = 9 ring layers, each world a band threshold crossing."],
                ["Fibonacci Series", "1,1,2,3,5,8,13… → φ. Every spiral in nature is a Φ-Time clock."],
              ].map(([culture, note]) => (
                <div key={culture} style={{ fontSize: "0.82rem", color: "#64748b", lineHeight: 1.55,
                  padding: "0.55rem 0.7rem", borderRadius: 7,
                  background: "rgba(201,168,76,0.04)", border: "1px solid rgba(201,168,76,0.1)" }}>
                  <strong style={{ color: C.gold, display: "block", fontSize: 11,
                    letterSpacing: "0.1em", marginBottom: 2 }}>{culture}</strong>
                  {note}
                </div>
              ))}
            </div>
          </div>
        </KickerSection>

        {/* ── VIII. Live Simulators ── */}
        <KickerSection kicker="VIII · Live Simulators"
          title="Run the Physics Now"
          color={C.bright}>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 340px), 1fr))", gap: "1rem" }}>
            {[
              { href: `${BASE}/warp-bubble-engine.html`, label: "Twisted Zipper Warp Bubble Engine", sub: "Alcubierre metric · Φ-Time · 5-Domain Bus", color: C.teal },
              { href: `${BASE}/seven-dimensional-engine.html`, label: "7D Framework Engine", sub: "D1–D7 live field sliders · Knowledge query", color: "#ec4899" },
              { href: `${BASE}/stacked-rings-engine.html`, label: "Stacked Rings System Engine", sub: "500+ ring layers · Pixelated gravity · 500D pipeline", color: C.violet },
              { href: `${BASE}/guf-collider.html`, label: "GUF Unified Collider + Analysis", sub: "Linear collider · Compound-eye detector · Post-collision tabs", color: C.gold },
              { href: `${BASE}/guf-master-engine.html`, label: "GUF Master Engine", sub: "Stacked Rings · 7D Field · Twisted Zipper unified", color: C.bright },
            ].map(s => (
              <a key={s.href} href={s.href} target="_blank" rel="noreferrer"
                style={{
                  display: "flex", flexDirection: "column", gap: 6,
                  padding: "1rem 1.2rem", borderRadius: 12, textDecoration: "none",
                  background: `${s.color}0d`, border: `1px solid ${s.color}33`,
                  transition: "border-color 0.2s",
                }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: s.color,
                  fontFamily: "'DM Mono',monospace", letterSpacing: "0.08em",
                  textTransform: "uppercase" }}>⚡ {s.label}</div>
                <div style={{ fontSize: 11, color: C.dim, letterSpacing: "0.1em",
                  fontFamily: "'DM Mono',monospace" }}>{s.sub}</div>
              </a>
            ))}
          </div>
        </KickerSection>

        {/* ── Cross-links ── */}
        <div style={{ display: "flex", flexWrap: "wrap", gap: 10, marginTop: "1rem",
          paddingTop: "1.5rem", borderTop: "1px solid rgba(255,255,255,0.06)" }}>
          {[
            ["/guf-engine", "GUF Engine · All Simulators + Infographics"],
            ["/substrate-synthesis", "Substrate Synthesis · CaCO₃ + BAVS"],
            ["/aether-foundations", "AETHER Foundations · Crystallization Model"],
            ["/unified-field", "Unified Field · Ψ·ΔG·e^iπ"],
          ].map(([href, label]) => (
            <Link key={href} href={href} style={{ fontSize: "0.8rem", color: C.bright,
              fontFamily: "'DM Mono',monospace", letterSpacing: "0.1em",
              textDecoration: "none", textTransform: "uppercase" }}>
              → {label}
            </Link>
          ))}
        </div>

        <footer style={{ marginTop: "2.5rem", paddingTop: "1.4rem",
          borderTop: "1px solid rgba(255,255,255,0.06)", textAlign: "center",
          fontSize: "0.78rem", color: "#334155", fontFamily: "'DM Mono',monospace",
          letterSpacing: "0.2em", textTransform: "uppercase" }}>
          Propulsion Engine · 6 Domains · 8 Infographics · 5 Live Simulators · One Crossing Equation
        </footer>
      </div>
    </div>
  );
}
