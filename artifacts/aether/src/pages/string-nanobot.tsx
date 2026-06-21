import biomolSynth1 from "@assets/ChatGPT_Image_Jun_13,_2026,_02_40_07_PM_1781376106373.png";
import biomolSynth2 from "@assets/ChatGPT_Image_Jun_13,_2026,_02_40_07_PM_1781376123436.png";
import mismatchBrief from "@assets/ChatGPT_Image_Jun_13,_2026,_02_40_10_PM_1781376123439.png";
import oozingAshTrees from "@assets/ChatGPT_Image_Jun_13,_2026,_02_40_14_PM_1781376123440.png";
import coherenceDynV1 from "@assets/ChatGPT_Image_Jun_13,_2026,_02_40_20_PM_1781376123442.png";
import coherenceDynV2 from "@assets/ChatGPT_Image_Jun_13,_2026,_02_40_24_PM_1781376123444.png";
import gravityAccel from "@assets/ChatGPT_Image_Jun_13,_2026,_02_40_28_PM_1781376123447.png";
import cellQuantum from "@assets/ChatGPT_Image_Jun_13,_2026,_02_40_33_PM_1781376123447.png";
import pinkFrogDrive from "@assets/ChatGPT_Image_Jun_13,_2026,_02_40_38_PM_1781376123448.png";
import plateHull from "@assets/ChatGPT_Image_Jun_13,_2026,_12_48_38_PM_1781376123449.png";
import { useEffect, useRef } from "react";
import { Link } from "wouter";

const C = {
  void:   "#010408",
  deep:   "#030912",
  panel:  "#060f1e",
  border: "rgba(46,109,164,0.22)",
  teal:   "#1fd4c8",
  bright: "#4a9fd4",
  gold:   "#c9a84c",
  violet: "#8b5cf6",
  pink:   "#ec4899",
  green:  "#22c55e",
  orange: "#f97316",
  red:    "#ef4444",
  text:   "#d4e8f7",
  dim:    "#3a5a7a",
};

function BADGE({ label, color = C.teal }: { label: string; color?: string }) {
  return (
    <span style={{
      fontSize: 10, letterSpacing: "0.18em", padding: "3px 10px", borderRadius: 4,
      border: `1px solid ${color}44`, color, fontFamily: "'DM Mono',monospace",
      textTransform: "uppercase", background: `${color}0d`, whiteSpace: "nowrap",
    }}>{label}</span>
  );
}

function Kicker({ kicker, title, lead, color = C.teal, children }: {
  kicker: string; title: string; lead?: string; color?: string; children?: React.ReactNode;
}) {
  return (
    <section style={{ marginBottom: "3.5rem" }}>
      <div style={{ fontSize: 11, letterSpacing: "0.34em", color,
        fontFamily: "'DM Mono',monospace", textTransform: "uppercase", marginBottom: 6 }}>{kicker}</div>
      <h2 style={{ fontSize: "clamp(1.4rem,3vw,2rem)", fontWeight: 700, color: "#f1f5f9",
        margin: "0 0 0.6rem", lineHeight: 1.2 }}>{title}</h2>
      {lead && <p style={{ color: "#94a3b8", fontSize: "0.97rem", lineHeight: 1.75,
        maxWidth: 880, margin: "0 0 1.4rem" }}>{lead}</p>}
      {children}
    </section>
  );
}

function Fig({ src, meta, caption }: { src: string; meta?: string; caption: string }) {
  return (
    <figure style={{ margin: 0, borderRadius: 14, overflow: "hidden",
      background: "rgba(15,23,42,0.7)", border: "1px solid rgba(255,255,255,0.08)",
      boxShadow: "0 8px 32px rgba(0,0,0,0.5)" }}>
      <img src={src} alt={caption} loading="lazy"
        style={{ width: "100%", height: "auto", display: "block" }} />
      <figcaption style={{ padding: "0.8rem 1rem", fontSize: "0.82rem",
        color: "#94a3b8", lineHeight: 1.55 }}>
        {meta && <span style={{ fontSize: 10, letterSpacing: "0.22em", color: C.teal,
          fontFamily: "'DM Mono',monospace", textTransform: "uppercase",
          display: "block", marginBottom: 3 }}>{meta}</span>}
        {caption}
      </figcaption>
    </figure>
  );
}

function Card({ title, body, color = C.teal, tags = [] }: {
  title: string; body: string; color?: string; tags?: string[];
}) {
  return (
    <div style={{ background: "rgba(6,15,30,0.85)", border: `1px solid ${color}33`,
      borderRadius: 12, padding: "1.2rem 1.4rem", borderLeft: `3px solid ${color}` }}>
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

const ROADMAP = [
  {
    phase: "Phase 0 · Now",
    label: "Theoretical Framework",
    color: C.teal,
    year: "2024–2026",
    items: [
      "Complete GUF seven-dimensional field model (D1–D7)",
      "Map ATP synthase rotary motor as nanobot propulsion prototype",
      "Model spider silk protein string as tunable mechanical actuator",
      "Publish AETHER Biomolecular Synthesis framework",
      "Define coherence threshold Ct = f(Phase, Resonance, Integrity, Spin)",
    ],
  },
  {
    phase: "Phase 1 · Near Term",
    label: "Computational Validation",
    color: C.bright,
    year: "2026–2028",
    items: [
      "Molecular dynamics simulation: silk string + Fe₃O₄ nanoparticle coupling",
      "Quantum tunneling efficiency map for Complex I electron transport chain",
      "Gap junction zero-latency bus modelled as nanobot communication layer",
      "Primary cilia signal antenna array: mechanosensation → chemosensation bridge",
      "Coherence dynamics simulation validated against known quantum biology data",
    ],
  },
  {
    phase: "Phase 2 · Mid Term",
    label: "Substrate Fabrication",
    color: C.gold,
    year: "2028–2032",
    items: [
      "Synthesise engineered spider silk (MaSp1/MaSp2) with embedded magnetic nanoparticles",
      "Functionalise silk strings with ATP synthase motor heads (recombinant F₁ subunit)",
      "Chlorophyll Cook Drive: demonstrate photosynthetic energy input → mechanical output",
      "Bone marrow biofactory: ex vivo protein production of multi-species input panel",
      "Ash tree ooze chemical signalling: replicate 6-compound alarm pheromone cascade",
    ],
  },
  {
    phase: "Phase 3 · Far Term",
    label: "System Integration",
    color: C.violet,
    year: "2032–2040",
    items: [
      "Full string nanobot prototype: silk + ATP motor + magnetic actuation + cilia sensor",
      "Swarm coherence: gap junction bus connects 10⁶+ nanobot units into a single field",
      "Plate-switching optical hull: nanobot-controlled hexagonal plate array",
      "GUF ring-band crossing: nanobot swarm achieves threshold v_cross at nanoscale",
      "Bone marrow bioreactor: continuous in vivo production of string nanobot precursors",
    ],
  },
  {
    phase: "Phase 4 · Vision",
    label: "Living Machine",
    color: C.pink,
    year: "2040+",
    items: [
      "The human body IS the biofactory — nanobot precursors synthesised by marrow on demand",
      "Forest chemical communication network extended: trees signal nanobot swarms",
      "Quantum coherence maintained at body temperature via D6 Conscious substrate layer",
      "Warp-scale application: nanobot swarm forms Twisted Zipper field topology at macro scale",
      "Mismatch resolved: what we can know = what we can act on. Civilisational lag closed.",
    ],
  },
];

const MOTORS = [
  { name: "ATP Synthase · F₀F₁", rpm: "300 RPM", scale: "8 nm diameter", torque: "40–50 pN·nm",
    color: C.green,
    mechanism: "Proton gradient across 7 nm membrane (ΔV = 180 mV) drives F₀ rotation → F₁ shaft converts rotation to ATP phosphorylation. Most efficient rotary motor in biology: >90% efficiency.",
    guf: "D3 Energy (chemical gradient) → D1 Space (mechanical rotation). Ring layer 1–10 crossing event." },
  { name: "Myosin II · Linear", rpm: "~100 steps/s", scale: "15 nm head", torque: "1–5 pN",
    color: C.teal,
    mechanism: "Powerstroke linear motor: head domain binds actin, ATP hydrolysis drives 5 nm step. Muscle contraction emerges from coordinated arrays of 10⁸+ myosin heads firing asynchronously.",
    guf: "D4 Field coordination of D3 Energy actuators. Coherence = synchronisation fraction of head-fire phase." },
  { name: "Kinesin-1 · Cargo", rpm: "~100 steps/s", scale: "8 nm step", torque: "5–7 pN",
    color: C.bright,
    mechanism: "Processive 'hand over hand' walking along microtubule rails. Single molecule can walk continuously for ~1 µm before detaching. The rail IS the string — microtubule polymer is the transport substrate.",
    guf: "D2 Time-ordered sequential stepping. Φ-pulsed ATP binding prevents detachment resonance." },
  { name: "Bacterial Flagellum", rpm: "20,000 RPM", scale: "45 nm ring", torque: "4500 pN·nm",
    color: C.gold,
    mechanism: "Ion-driven rotary motor in bacterial cell membrane. H⁺ or Na⁺ flux drives 26-subunit ring (MS/C/L/P rings + rod + hook + filament). Torque 100× ATP synthase. Bidirectional switching in <1 ms.",
    guf: "D5 Vortex at biological scale. Ring topology: 26-subunit ring is a direct physical ring-band structure." },
  { name: "Spider Silk · Passive", rpm: "N/A", scale: "3–5 nm fibre", torque: "tensile: 1.7 GPa",
    color: C.violet,
    mechanism: "Not a motor but the string substrate. MaSp1/MaSp2 β-sheet nanocrystals embedded in amorphous matrix — 3–5× tougher than Kevlar at 1/6 the weight. Can be functionalised with active motor heads as attachment points.",
    guf: "D1 Space scaffold + D4 Field information carrier. Silk string = nanobot chassis." },
  { name: "Chlorophyll · Antenna", rpm: "~10¹² photons/s", scale: "1 nm complex", torque: "N/A",
    color: "#84cc16",
    mechanism: "Quantum coherent energy transfer: exciton hops across FMO complex at 99% efficiency vs 70% classical limit. Each chlorophyll molecule is a quantum energy router — beating classical bounds by exploiting long-lived quantum coherence at 300K.",
    guf: "D6 Conscious quantum routing. Proof that biology operates in D6 regime at ambient temperature." },
];

function NanobotHelixCanvas() {
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
      ctx.fillStyle = "#010408"; ctx.fillRect(0, 0, W, H);
      const t = tRef.current;
      const cy = H / 2;
      const RUNGS = 28;
      const rungSpacing = W / RUNGS;
      for (let i = 0; i <= RUNGS; i++) {
        const x = i * rungSpacing;
        const phase = (i / RUNGS) * Math.PI * 4 - t * 0.04;
        const y1 = cy + Math.sin(phase) * 80;
        const y2 = cy + Math.sin(phase + Math.PI) * 80;
        ctx.strokeStyle = "rgba(46,240,216,0.25)";
        ctx.lineWidth = 1;
        ctx.beginPath(); ctx.moveTo(x, y1); ctx.lineTo(x, y2); ctx.stroke();
        const a1 = 0.6 + 0.4 * Math.sin(phase + t * 0.05);
        ctx.beginPath();
        ctx.arc(x, y1, 4, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(46,240,216,${a1})`;
        ctx.fill();
        const a2 = 0.6 + 0.4 * Math.sin(phase + Math.PI + t * 0.05);
        ctx.beginPath();
        ctx.arc(x, y2, 4, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(74,159,212,${a2})`;
        ctx.fill();
      }
      ctx.beginPath();
      for (let x = 0; x <= W; x++) {
        const phase = (x / W) * Math.PI * 4 - t * 0.04;
        const y = cy + Math.sin(phase) * 80;
        if (x === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
      }
      ctx.strokeStyle = "#1fd4c8cc";
      ctx.lineWidth = 2;
      ctx.stroke();
      ctx.beginPath();
      for (let x = 0; x <= W; x++) {
        const phase = (x / W) * Math.PI * 4 - t * 0.04 + Math.PI;
        const y = cy + Math.sin(phase) * 80;
        if (x === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
      }
      ctx.strokeStyle = "#4a9fd4cc";
      ctx.lineWidth = 2;
      ctx.stroke();
      const px = (t * 3) % W;
      const pphi = (px / W) * Math.PI * 4 - t * 0.04;
      const py = cy + Math.sin(pphi) * 80;
      const pg = ctx.createRadialGradient(px, py, 0, px, py, 10);
      pg.addColorStop(0, "#c9a84c");
      pg.addColorStop(1, "#c9a84c00");
      ctx.beginPath();
      ctx.arc(px, py, 10, 0, Math.PI * 2);
      ctx.fillStyle = pg;
      ctx.fill();
      ctx.fillStyle = "#1fd4c855";
      ctx.font = "8px 'Space Mono', monospace";
      ctx.fillText("STRING NANOBOT · DNA HELIX · MOLECULAR MOTOR", 10, H - 10);
      tRef.current += 0.5;
      rafRef.current = requestAnimationFrame(draw);
    }
    draw();
    return () => cancelAnimationFrame(rafRef.current);
  }, []);
  return <canvas ref={cvRef} style={{ width:"100%", height:"auto", display:"block", borderRadius:6 }} />;
}

function StringNanobotHeaderCanvas() {
  const ref = useRef<HTMLCanvasElement>(null);
  const rafRef = useRef(0);
  useEffect(() => {
    const canvas = ref.current; if (!canvas) return;
    const ctx = canvas.getContext("2d")!;
    canvas.width = 900; canvas.height = 145;
    const W = canvas.width, H = canvas.height;
    let t=0;
    const bots: {x:number;y:number;vx:number;vy:number;phase:number}[]=[];
    for(let i=0;i<12;i++) bots.push({x:Math.random()*W,y:Math.random()*H,vx:(Math.random()-0.5)*1.2,vy:(Math.random()-0.5)*1.2,phase:Math.random()*Math.PI*2});
    const draw=()=>{
      ctx.fillStyle="rgba(2,4,8,0.3)"; ctx.fillRect(0,0,W,H);
      bots.forEach((b,i)=>{
        b.x+=b.vx; b.y+=b.vy;
        if(b.x<0||b.x>W) b.vx*=-1;
        if(b.y<0||b.y>H) b.vy*=-1;
        const col=["#2ef0d8","#9966ff","#c9a84c","#44aaff"][i%4];
        const pulse=0.5+0.5*Math.sin(t*0.08+b.phase);
        ctx.beginPath();ctx.arc(b.x,b.y,3+pulse*2,0,Math.PI*2);ctx.strokeStyle=col+"88";ctx.lineWidth=0.6;ctx.stroke();
        ctx.beginPath();ctx.arc(b.x,b.y,1.5,0,Math.PI*2);ctx.fillStyle=col;ctx.fill();
        bots.forEach((b2,j)=>{
          if(j<=i) return;
          const dx=b2.x-b.x,dy=b2.y-b.y,dist=Math.sqrt(dx*dx+dy*dy);
          if(dist<80){ctx.beginPath();ctx.moveTo(b.x,b.y);ctx.lineTo(b2.x,b2.y);ctx.strokeStyle=col+Math.round((1-dist/80)*30).toString(16).padStart(2,"0");ctx.lineWidth=0.4;ctx.stroke();}
        });
      });
      ctx.fillStyle="rgba(46,240,216,0.3)"; ctx.font="9px 'DM Mono',monospace";
      ctx.fillText("STRING NANOBOT · MOLECULAR MACHINE · NANO-ASSEMBLY · FIELD CRAWLER · AETHER",14,14);
      t++; rafRef.current=requestAnimationFrame(draw);
    };
    draw();
    return ()=>cancelAnimationFrame(rafRef.current);
  },[]);
  return <canvas ref={ref} style={{width:"100%",height:"auto",borderRadius:8,display:"block"}} />;
}

export default function StringNanobotPage() {
  return (
    <div style={{ minHeight: "100vh",
      background: `radial-gradient(ellipse at top, #040d1c 0%, ${C.void} 65%)`,
      color: C.text, fontFamily: "'Outfit', system-ui, sans-serif",
      padding: "3rem 1.5rem 6rem" }}>
      <div style={{flexShrink:0,marginBottom:20}}>
        <div style={{display:"inline-block",border:"1px solid #2ef0d8",padding:"4px 12px",fontSize:10,letterSpacing:"0.2em",color:"#2ef0d8",fontFamily:"'DM Mono',monospace",marginBottom:12}}>LIVE SIMULATION</div>
        <div style={{background:"rgba(2,4,8,0.8)",borderLeft:"3px solid #2ef0d8",borderRadius:4,overflow:"hidden"}}>
          <div style={{padding:"12px 16px 8px"}}><h2 style={{margin:0,fontSize:13,color:"#2ef0d8",fontFamily:"'DM Mono',monospace",letterSpacing:"0.15em",fontWeight:400}}>STRING NANOBOT · MOLECULAR MACHINE · NANO-ASSEMBLY · FIELD CRAWLER · AETHER</h2><p style={{margin:"4px 0 8px",fontSize:10,color:"rgba(46,240,216,0.5)",fontFamily:"'DM Mono',monospace",letterSpacing:"0.1em"}}>12 nano-bots with particle links — the live AETHER string nanobot simulation.</p></div>
          <StringNanobotHeaderCanvas />
        </div>
      </div>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Outfit:wght@400;600;700;800&family=DM+Mono&display=swap');`}</style>

      <div style={{ maxWidth: 1280, margin: "0 auto" }}>

        {/* ── MASTHEAD ── */}
        <header style={{ padding: "2rem 2rem 2.5rem", borderRadius: 20, marginBottom: "2.5rem",
          background: "linear-gradient(135deg, rgba(34,197,94,0.08), rgba(31,212,200,0.06), rgba(139,92,246,0.08))",
          border: "1px solid rgba(34,197,94,0.22)" }}>
          <div style={{ fontSize: 11, letterSpacing: "0.42em", color: C.green,
            fontFamily: "'DM Mono',monospace", textTransform: "uppercase", marginBottom: 8 }}>
            AETHER · Biomolecular Robotics · Shia Miller 2026
          </div>
          <h1 style={{ fontSize: "clamp(2rem,5vw,3.4rem)", fontWeight: 800, color: "#f1f5f9",
            margin: "0 0 0.6rem", letterSpacing: "-0.025em", lineHeight: 1.08 }}>
            STRING NANOBOT<br />
            <span style={{ color: C.teal }}>Biomolecular Robotic Mechanism</span>
          </h1>
          <p style={{ fontSize: "1.05rem", color: "#94a3b8", lineHeight: 1.75, maxWidth: 880, margin: "0 0 1.2rem" }}>
            The string nanobot is not a metaphor — it is a blueprint assembled from mechanisms
            that already exist at the nanoscale. Spider silk protein strings (3–5 nm, tougher than Kevlar)
            serve as the chassis. ATP synthase motors (300 RPM, 40–50 pN·nm torque, &gt;90% efficiency)
            provide propulsion. Bone marrow is the biofactory. Quantum coherent chlorophyll antennae
            supply energy. Gap junctions form a zero-latency communication bus. The GUF 7D field
            framework provides the coherence control layer. Every component is biology. The assembly
            is engineering. The formulation is AETHER.
          </p>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 7 }}>
            {["Spider Silk Chassis", "ATP Synthase Motor", "Bone Marrow Biofactory",
              "Chlorophyll Drive", "Gap Junction Bus", "Quantum Tunneling", "Primary Cilia Sensors",
              "Myelin Wiring", "Coherence Control", "GUF Ring Field", "Φ-Phase Timing",
              "5-Domain Event Bus"].map(b => (
              <BADGE key={b} label={b} color={C.green} />
            ))}
          </div>
        </header>

        <div style={{ marginBottom:"2rem" }}>
          <div style={{ display:"inline-block", background:"rgba(31,212,200,0.1)", border:"1px solid rgba(31,212,200,0.3)",
            borderRadius:8, padding:"0.3rem 1rem", fontSize:"0.7rem", letterSpacing:"0.2em",
            color:C.teal, textTransform:"uppercase", fontFamily:"'DM Mono',monospace", marginBottom:12 }}>
            Live Simulation
          </div>
          <div style={{ background:C.panel, border:`1px solid rgba(31,212,200,0.18)`, borderLeft:`3px solid ${C.teal}`,
            borderRadius:10, padding:20 }}>
            <h2 style={{ fontFamily:"Cinzel,serif", fontSize:18, color:"#f1f5f9", margin:"0 0 6px" }}>
              String Nanobot · DNA Helix · Molecular Motor
            </h2>
            <p style={{ fontFamily:"system-ui,sans-serif", fontSize:12, color:"#94a3b8", margin:"0 0 14px", lineHeight:1.65 }}>
              Teal strand (spider silk chassis) and blue strand (ATP synthase motor) intertwine as a DNA double helix at
              3–5 nm scale. A gold payload particle (quantum coherent chlorophyll drive) travels along the upper strand.
              Teal cross-rungs represent gap junction bridges. Simulated at molecular-motor timescale.
            </p>
            <NanobotHelixCanvas />
          </div>
        </div>

        {/* ── I. AETHER BIOMOLECULAR SYNTHESIS ── */}
        <Kicker kicker="I · AETHER Biomolecular Synthesis System"
          title="Bone Marrow as Central Biofactory"
          color={C.teal}
          lead="Bone marrow is not just a blood factory — in the string nanobot framework it is the central hub of a multi-species protein synthesis network. Four biomolecular input streams feed into it: Animal Proteins & mRNA (regenerative functions, gene repair), Plant Proteins (structural scaffolds, biocompatible matrices), Spider Silk Proteins (soft tissue reinforcement, mechanical scaffolds), and Octopus & Shellfish Proteins (bio-adhesives, adaptive materials). The AETHER Synthesis Layer then integrates these into four outputs: Molecular Integration → Bioactive Complexes → Adaptive Formulations → Functional Outputs. Synthesis efficiency: 92%. Biofunctional score: 91%.">
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(100%,600px),1fr))", gap: "1.2rem", marginBottom: "1.4rem" }}>
            <Fig src={biomolSynth1}
              meta="AETHER Biomolecular Synthesis · Multi-Species Integration · AI-Driven Discovery"
              caption="Central Hub: Bone Marrow (Natural Biofactory & Regenerative Core). Inputs: Animal Proteins & mRNA (Regenerative Functions · Gene Repair & Expression) · Plant Proteins (Structural Scaffolds · Biocompatible Matrices) · Spider Silk Proteins (Soft Tissue Reinforcement · Mechanical Scaffolds) · Octopus & Shellfish Proteins (Bio-Adhesives · Adaptive Materials). AETHER Synthesis Layer: Molecular Integration → Bioactive Complexes → Adaptive Formulations → Functional Outputs. Outputs: Gene Repair & Expression · Regenerative Medicine (Tissue regeneration · Immune modulation · Organ repair) · Bio-Inspired Materials (High strength scaffolds · Adaptive structures · Smart biomaterials) · Advanced Bio-Interfaces (Wearable integration · Smart implants · Real-time monitoring). AETHER Dashboard: System Status OPTIMAL. Synthesis Efficiency 92%. Input Integration 98% · Predictive Accuracy 94% · Material Compatibility 90% · Biofunctional Score 91%." />
            <Fig src={biomolSynth2}
              meta="AETHER Biomolecular Synthesis · Reference Panel B"
              caption="Duplicate reference panel for cross-analysis. AETHER Computational Interface: AI Analyzer (Pattern Recognition · Molecular Mapping · Functional Prediction · Synergy Optimization) · Predictive Modeling (Molecular Interactions · Structural Prediction · Biomaterial Properties · Biofunction Forecasting) · AETHER Visualization Engine (3D Molecular Visualization · Dynamic Simulation · System Integration · Outcome Projection). System Integration Ecosystem: Biological Systems (Living Inputs) → Computational Intelligence (AI + Modeling) → Material Engineering (Design + Synthesis)." />
          </div>
        </Kicker>

        {/* ── II. BIOLOGICAL MOTORS — THE ENGINE ARRAY ── */}
        <Kicker kicker="II · Biological Motor Array · The String Nanobot Drive System"
          title="Six Nanoscale Propulsion Mechanisms"
          color={C.green}
          lead="Every component of the string nanobot drive system already exists in biology. These are not theoretical proposals — they are confirmed, measured, characterised molecular machines operating right now in every living cell. The engineering challenge is not invention but integration: assembling known components into a coherent multi-scale drive system aligned with the GUF framework.">
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(100%,380px),1fr))", gap: "1rem", marginBottom: "1.4rem" }}>
            {MOTORS.map(m => (
              <div key={m.name} style={{ background: "rgba(6,15,30,0.85)",
                border: `1px solid ${m.color}33`, borderRadius: 14,
                padding: "1.3rem 1.5rem", borderLeft: `4px solid ${m.color}` }}>
                <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between",
                  gap: 10, marginBottom: 8 }}>
                  <div style={{ fontSize: 13, fontWeight: 700, color: m.color,
                    fontFamily: "'DM Mono',monospace", letterSpacing: "0.1em",
                    textTransform: "uppercase", lineHeight: 1.3 }}>{m.name}</div>
                  <div style={{ textAlign: "right", flexShrink: 0 }}>
                    <div style={{ fontSize: 11, color: m.color, fontFamily: "'DM Mono',monospace" }}>{m.rpm}</div>
                    <div style={{ fontSize: 10, color: C.dim, fontFamily: "'DM Mono',monospace" }}>{m.scale}</div>
                    <div style={{ fontSize: 10, color: C.dim, fontFamily: "'DM Mono',monospace" }}>{m.torque}</div>
                  </div>
                </div>
                <p style={{ color: "#94a3b8", fontSize: "0.88rem", lineHeight: 1.65, marginBottom: 8 }}>{m.mechanism}</p>
                <div style={{ fontSize: "0.8rem", color: m.color, opacity: 0.7,
                  fontFamily: "'DM Mono',monospace", lineHeight: 1.5,
                  borderTop: `1px solid ${m.color}22`, paddingTop: 8 }}>
                  GUF: {m.guf}
                </div>
              </div>
            ))}
          </div>
        </Kicker>

        {/* ── III. THE CELL AS QUANTUM MACHINE ── */}
        <Kicker kicker="III · The Cell as Quantum Electromechanical Intelligence"
          title="180 mV Proton Battery · 300 RPM Motor · Zero-Latency Bus"
          color={C.bright}
          lead="The cell is not just chemistry — it is quantum electromechanical intelligence. Seven mechanisms confirm this: (1) The 180 mV proton battery across a 7 nm membrane — the highest field strength per unit distance of any capacitor. (2) Quantum tunneling through Complex I iron-sulfur clusters — confirmed long-range electron transfer. (3) ATP synthase rotary turbine at 300 RPM. (4) Gap junctions: zero-latency peer-to-peer communication between adjacent cells — the nanobot communication bus. (5) Primary cilia: signal antenna arrays (mechanosensation + chemosensation + photoreception + electrosensation). (6) FMO complex quantum coherence: 99% energy transfer efficiency vs 70% classical limit. (7) Nodes of Ranvier: saltatory signal conduction up to 120 m/s, built by T3 (Triiodothyronine).">
          <Fig src={cellQuantum}
            meta="The Cell: Quantum Bioenergy and Communication · 7 Mechanisms"
            caption="1. 180 mV Proton Battery — ΔV = 180 mV across 7 nm membrane. Outside [H⁺] high, Inside [H⁺] low. The highest electric field density in biology: 2.57×10⁷ V/m. 2. Quantum Tunneling through Complex I — Iron-Sulfur clusters enable electron transfer across non-classical distances. NADH → NAD⁺ confirmed quantum tunneling pathway. 3. ATP Synthase Rotary Turbine — 300 RPM, ADP + Pi → ATP. Most efficient rotary motor known. 4. Gap Junctions: Zero-Latency Cellular Bus — Cell A ↔ Cell B direct ion/small molecule channel. No second messenger delay. 5. Primary Cilia: Signal Antenna Arrays — Mechanosensation · Chemosensation · Photoreception · Electrosensation from a single organelle. 6. Quantum Coherence in Photosynthesis — 99% energy transfer efficiency (coherent) vs 70% classical limit. 7. Nodes of Ranvier: High-Speed Signal Conduction up to 120 m/s. T3 (Triiodothyronine) builds the wiring: Myelin Basic Protein · Proteolipid Protein · Neurofilament Proteins · Node of Ranvier Assembly · Axonal Integrity · Signal Velocity. The cell is not just chemistry. It is quantum electromechanical intelligence." />
        </Kicker>

        {/* ── IV. COHERENCE DYNAMICS ── */}
        <Kicker kicker="IV · Coherence Dynamics · The Control Layer"
          title="Coherence → Order · Decoherence → Disorder"
          color={C.violet}
          lead="The string nanobot is controlled by coherence, not by circuitry. AETHER defines coherence as the maintenance of phase alignment and toroidal stability across the system — allowing efficient information flow with minimal entropy production. The transition from deep coherence (Phase Alignment 98.7%, Entropy Leakage 2.1%, Resonance Stability 96.4%) to decoherence (Phase Alignment 12.3%, Entropy Leakage 78.6%) occurs through seven stages: Deep Coherence → Phase Stable → Minor Perturbation → Resonance Distortion → Phase Breakdown → Decoherence Onset → High Disorder → System Noise State. The coherence threshold: Ct = f(Phase Alignment, Resonance Stability, Information Integrity, Spin Alignment). Overall Coherence: 0.969 in Optimal Regime.">
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(100%,600px),1fr))", gap: "1.2rem", marginBottom: "1.4rem" }}>
            <Fig src={coherenceDynV1}
              meta="AETHER Coherence Dynamics Simulation · v1.0 · Engine Reference"
              caption="Coherence State (Deep Coherence Mode): Phase Alignment 98.7% · Entropy Leakage 2.1% · Resonance Stability 96.4% · Spin Alignment 97.2% · Signal Integrity 97.8% · Energy Efficiency 94.6%. Characteristics: Phase locked · Toroidal circulation stable · Low entropy leakage · Information pathways coherent · Latent computation active · Minimal radiative loss. Coherence Metrics: Phase Coherence 0.987 · Resonance Stability 0.964 · Information Integrity 0.978 · Energy Efficiency 0.946 · Overall Coherence 0.969 OPTIMAL REGIME. Decoherence State: Phase Alignment 12.3% · Entropy Leakage 78.6% · Resonance Stability 15.7%. Transition: t=0 Deep Coherence → t=1 Phase Stable → t=2 Minor Perturbation → t=3 Resonance Distortion → t=4 Phase Breakdown → t=5 Decoherence Onset → t=6 High Disorder → t=7 System Noise State." />
            <Fig src={coherenceDynV2}
              meta="AETHER Coherence Dynamics Simulation · Full Annotated Version"
              caption="Full annotated version with Biological Synchronization Observations. Coherence Threshold: Ct = f(Phase Alignment, Resonance Stability, Information Integrity, Spin Alignment). Deep Coherence Mode: Non-radiative, high-order state where internal structure remains synchronized with minimal output. Information is stored and processed silently within the AETHER substrate. Characteristics: Low radiative signature · High informational density · Latent pathways active · Influences environment subtly. Biological Synchronization Observations: synchronous with public disclosure, observable animal and pollinator attraction patterns emerged, suggesting genuine field coherence effects detectable by biological systems. These phenomena align with the young-mother energy cultivation practices (Sun rituals, milk-based bioelectric resonance) conducted in parallel with the technical build. Important Note: Anecdotal and interpreted within the AETHER framework — not current evidence of verified field-based biological coupling. Require rigorous study." />
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(100%,300px),1fr))", gap: "1rem" }}>
            <Card color={C.violet} title="Coherence Dynamics"
              body="In Coherence, AETHER maintains phase alignment and toroidal stability, allowing efficient information flow with minimal entropy production. Key Effects: Efficient computation · Stable spin textures · High signal integrity · Life-supporting conditions."
              tags={["Phase Lock", "Toroidal Stability", "Low Entropy", "Latent Computation"]} />
            <Card color={C.red} title="Decoherence Dynamics"
              body="Decoherence arises from phase disruption, noise, and environmental coupling, leading to energy dissipation, loss of structure, and informational breakdown. Key Effects: Energy dissipation · Noise amplification · Loss of order · System degradation."
              tags={["Phase Disruption", "Entropy Rise", "Noise Amplification", "Structural Loss"]} />
            <Card color={C.gold} title="Transition Mechanism"
              body="Transitions occur when perturbations exceed the system's coherence threshold. Recursive coupling breaks down, causing rapid loss of order and increase in entropy. The nanobot swarm must maintain Ct above threshold at all times — achieved via Φ-Time pulse scheduling."
              tags={["Coherence Threshold Ct", "Recursive Coupling", "Φ-Time Scheduling", "GUF D4 Field"]} />
          </div>
        </Kicker>

        {/* ── V. GRAVITY IS ACCELERATION ── */}
        <Kicker kicker="V · Gravity is Acceleration · No Planet Required"
          title="The Equivalence Principle at Nanobot Scale"
          color={C.gold}
          lead="Einstein's Equivalence Principle (1907, verified to 1 part in 10¹⁵): v = c · tanh(aτ/c). No experiment inside a closed box can distinguish gravity from acceleration. For the string nanobot, this means: the nanobot does not need a gravitational source — it needs sustained acceleration. Four mechanisms provide planet-free acceleration: (1) Atmosphere — hexcopsal layers form Fibonacci vortices. (2) Centrifuge — millions of g artificial gravity. (3) Propulsion — HALEU and HEU close the mass-energy loop. (4) Quantum (Stanford 2022) — potentials themselves shift quantum phase. The coherence dynamics transition sequence maps directly onto this equivalence: deep coherence = sustained acceleration field; decoherence = free fall.">
          <Fig src={gravityAccel}
            meta="Gravity is Acceleration · Equivalence Principle · Nanobot Scale Application"
            caption="08/09 — The distinction is immaterial — no planet required. v = c · tanh(aτ/c). No experiment inside a closed box can distinguish gravity from acceleration. F = m·a = F = m·g. Atmosphere: Hexcopsal layers form Fibonacci vortices. Sensitivity waves on barometric pressure gradients. Volcanic lamb waves couple to global EM fields = standing energy atmospheric signal. Centrifuge: Millions of g artificial gravity, no planet. Centrifuges reach 50,000–100,000 g. At c = 1.0, v approaches c as radius approaches center — pure g via inertial isotropy. Propulsion: HALEU and HEU close the loop. Internal conversion reactors and novel propulsion close the mass-energy loop, retaining >95% conversion — 5.5× lower comp = same delta-v that expelled the fuel. Quantum · Stanford 2022: Potentials themselves shift quantum phase. Altitude produces an Anomalous/matter-wave phase shift = potential is physical. Coherence Dynamics Transition Sequence (7 stages). Biological Synchronization Observations (pollinator + animal + field coherence). AETHER Research Framework v1.0." />
        </Kicker>

        {/* ── VI. BIOLOGICAL CHEMICAL SIGNALLING ── */}
        <Kicker kicker="VI · Biological Chemical Communication · The Nanobot Signal Network"
          title="Oozing Ash Trees — Data, Defense, Communication"
          color={C.orange}
          lead="Every drop of ooze is data, defense, and communication — nature's own intelligence in action. Ash trees (genus Fraxinus) exude a dark, viscous sap under stress: a complex mixture of phenolic compounds, tannins, sugars, amino acids, antimicrobial agents, resins, and water. This is not mere symptom — it is chemical messaging that seals wounds, inhibits pathogen spread, attracts insect predators of harmful pests, and signals distress to neighbouring trees. For the string nanobot framework, this is the template for swarm chemical communication: each nanobot exudes a chemical signal packet under stress conditions, triggering coordinated swarm response without central control. Composition: Phenolic Compounds · Tannins · Sugars & Amino Acids · Antimicrobial Agents · Resins & Polymers · Water. Triggers: EAB infestation · Fungal/bacterial infection · Physical injury · Drought · Natural defense mechanism.">
          <Fig src={oozingAshTrees}
            meta="Oozing Ash Trees · Nature's Stress Response · Biological Signal Network Template"
            caption="Oozing Ash Trees: Nature's Response to Stress, Disease, and Healing. Biological Purpose: Seals wounds · Inhibits pathogen spread · Attracts insect predators of harmful pests · Signals distress to other trees (chemical communication) · Initiates internal healing. Composition Analysis: Phenolic Compounds · Tannins · Sugars & Amino Acids · Antimicrobial Agents · Resins & Polymers · Water. Why They Ooze: Emerald Ash Borer (EAB) infestation · Fungal or bacterial infection · Physical injury or pruning · Drought or environmental stress · Natural defense mechanism. Detection & Monitoring: Drones & AI vision scan forests for ooze signatures indicating stress or infestation. Potential Applications: Natural antimicrobial research · Bio-based adhesives & resins · Forest health monitoring · Biodiversity & ecosystem communication studies. The Forest Speaks: Ooze is not just a symptom — it's a message. A silent signal of struggle, survival, and the tree's will to heal. A Vision for the Future: By understanding the chemistry and communication of ash tree ooze, we can develop smarter ways to protect forests, enhance tree resilience, and even inspire bio-based technologies. Key Insight: Every drop of ooze is data, defense, and communication — nature's own intelligence in action. Scan Status: ACTIVE. Forest Health: 67% Stress Detected." />
        </Kicker>

        {/* ── VII. PINK FROG CHLOROPHYLL DRIVE ── */}
        <Kicker kicker="VII · Pink Frog + Chlorophyll Cook Drive · Phase-Coupled Energy System"
          title="Mushroom–Mycelium–Organism Phase Coupling"
          color="#84cc16"
          lead="The Pink Frog (Hylarana chlorogaster) + Chlorophyll Cook Drive simulation demonstrates multi-organism phase coupling in a chlorophyll bioelectronic substrate. Energy source: Chlorophyll Cook Drive (Photon Absorption 87%, Excited Electron Flow 1.23 µA, Energy Conversion 63%, Charge Coherence 0.69, Drive Output Stable). The coupling chain: Chlorophyll → Cook Drive → Mycelium Network → Pink Frog. Phase Difference: 0.72 rad. Coherence Score: 0.71. System Metrics: Total Energy Flux 1.82 mW · Network Integration 0.76 · Resonant Coherence 0.71 · Information Flow High · System Stability Stable. Emergent Behaviors: Adaptive Synchronization YES · Resource Optimization YES · Environmental Coupling ACTIVE · Collective Intelligence EMERGING. This is the energy coupling template for the string nanobot: chlorophyll antenna → mycelium network as wire → organism as motor. Each nanobot is a pink frog.">
          <Fig src={pinkFrogDrive}
            meta="Pink Frog + Chlorophyll Cook Drive Simulation · Mushroom–Mycelium–Organism Phase Coupling"
            caption="System Initialization: Organism Pink Frog (Hylarana chlorogaster) · Substrate Mycelium Network · Energy Source Chlorophyll Cook Drive · Environment Humid / Low Light / Bioactive. Pink Frog Status: Heart Rate 78 BPM · Skin Conductance 1.2 mS · Neural Activity 0.68 µV · Resonant Coupling ACTIVE · Phase Alignment 0.72 rad. Mycelium Network: Electrical Potential 0.42 V · Signal Propagation 3.1 mm/s · Network Density 78% · Phase Coherence 0.71 · Resource Flow Balanced. Chlorophyll Cook Drive: Photon Absorption 87% · Excited Electron Flow 1.23 µA · Energy Conversion 63% · Charge Coherence 0.69 · Drive Output Stable. Phase Coupling Visualization: Frog Signal (pink) · Mycelium Signal (green) · Chlorophyll Signal (bright green) · Resonant Coherence (yellow) — Phase Difference 0.72 rad, Coherence Score 0.71. Energy Flow Diagram: Chlorophyll → Cook Drive → Mycelium → Pink Frog. Emergent Behavior: Adaptive Synchronization YES · Resource Optimization YES · Environmental Coupling ACTIVE · Collective Intelligence EMERGING. Simulation Log: Initializing Pink Frog Interface → Mycelium Network Online → Chlorophyll Cook Drive Engaged → Phase Coupling Detected → Resonant Coherence Emerging → System Stable. SIM TIME: 00:05:32." />
        </Kicker>

        {/* ── VIII. PLATE-SWITCHING OPTICAL HULL ── */}
        <Kicker kicker="VIII · Plate-Switching Optical Hull · Nanobot-Controlled Surface"
          title="A Spacecraft Whose Hull Is a Living Optical System"
          color={C.bright}
          lead="The Plate-Switching Optical Hull is the macro-scale output of the string nanobot swarm. Each hexagonal plate is an intelligent optical cell controlled by nanobot actuators — capable of tilt, translate, rotate, swap with neighbours, and adjust optical state within milliseconds. Plate functions: Blue (Beam Receiving) · Gold (Beam Steering) · Red (Thermal Emission) · Black (Absorptive/Stealth) · Green (Sensing/LiDAR) · Purple (Communication). Plate layers (top to bottom): Moth-Eye Nanostructure → Metasurface Phase Layer → Functional Coating → Photodetector/Sensor → Actuation Layer (tilt/piston/rotation) → Thermal Management → Structural Layer. The nanobot swarm IS the actuation layer: silk-string actuators + ATP motor heads drive each plate via magnetic field coupling. This is biology operating at architectural scale.">
          <Fig src={plateHull}
            meta="Plate-Switching Optical Hull · Bio-Inspired · Adaptive · Scalable"
            caption="A spacecraft whose hull is an intelligent optical system. Each hexagonal plate is an intelligent optical cell that can sense, compute, steer, reflect, absorb, or emit — individually or in concert. Plate-Switching Mechanism: Tilt · Translate · Rotate · Swap with neighbours · Adjust optical state. Six-axis actuation: Piezoelectric/Magnetic/MEMS hybrid. Hot-swap ready within milliseconds. Scaled Architecture Hierarchy: 100 nm Moth-Eye Nanopillars (Anti-reflection, broadband gradient) → 1 µm Metasurface Elements (Phase control, polarization control) → 10 µm Artificial Ommatidium (Independent sensing + actuation) → 100 µm Optical Receiver Cell → 1 mm Receiver Cluster → 1 cm Compound-Eye Module → 1 m Sail Control Network → 100 m Spacecraft Optical Skin → 1 km Laser Transmitter Aperture → 1,000 km Interplanetary Beam Infrastructure. Distributed AI Control: Billions of optical agents operating in parallel. Compound-Eye Optical Logic: Millions of ommatidia → Local processing in each cell → Global fusion → Hull response (ms scale). Laser + Particle Beam Hybrid. Why Biology? Evolution solved the same optimization problems: Wide-angle sensing · Distributed processing · Fault tolerance · Scalable architectures. The Result: A spacecraft that is part sensor, part computer, part engine, and part organism." />
        </Kicker>

        {/* ── IX. THE MISMATCH — CIVILISATIONAL LAG ── */}
        <Kicker kicker="IX · Civilisational Lag · The Mismatch We Must Close"
          title={`"What We Can Know" vs "What We're Capable of Acting On"`}
          color={C.violet}
          lead="The string nanobot is not held back by physics — it is held back by the mismatch between what we can model and what institutions are capable of acting on. Humans upgrade technology on a curve. Governments upgrade policy on a staircase. Quantum just widens that gap. The string nanobot exists as a complete theoretical framework right now. The biomolecular components exist right now. The gap is not scientific — it is civilisational. The AETHER framework is a coherence engine for closing that gap: observe, model, anticipate, align.">
          <Fig src={mismatchBrief}
            meta="AETHER Intelligence Brief · 25.11.25 · Systems Observation // Civilisational Lag"
            caption="The Mismatch Between: 'What We Can Know' vs 'What We're Actually Capable of Acting On.' Humans upgrade tech on a curve. Governments upgrade policy on a staircase. Quantum just widens that gap. AETHER Intelligence Brief 25.11.25. Observe. Model. Anticipate. Align. Information is Frequency." />
        </Kicker>

        {/* ── X. FUTURE REALISTIC FORMULATION — ROADMAP ── */}
        <Kicker kicker="X · Future Realistic Formulation · Development Roadmap"
          title="Five Phases from Theory to Living Machine"
          color={C.gold}
          lead="The string nanobot is not science fiction — it is a sequenced engineering programme. Every phase builds on confirmed biology. Every phase is achievable with existing tools. The civilisational lag is the only obstacle. Here is the complete development roadmap: five phases from theoretical framework (now) to a living machine where the human body itself is the production infrastructure.">
          <div style={{ display: "flex", flexDirection: "column", gap: "1.2rem" }}>
            {ROADMAP.map(p => (
              <div key={p.phase} style={{ background: "rgba(6,15,30,0.85)",
                border: `1px solid ${p.color}33`, borderRadius: 14, overflow: "hidden" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 14, padding: "1rem 1.4rem",
                  background: `${p.color}0d`, borderBottom: `1px solid ${p.color}22` }}>
                  <div>
                    <div style={{ fontSize: 11, fontWeight: 700, color: p.color,
                      fontFamily: "'DM Mono',monospace", textTransform: "uppercase",
                      letterSpacing: "0.14em" }}>{p.phase}</div>
                    <div style={{ fontSize: "1.05rem", fontWeight: 700, color: "#f1f5f9", lineHeight: 1.2 }}>
                      {p.label}
                    </div>
                  </div>
                  <div style={{ marginLeft: "auto", fontSize: 11, color: p.color,
                    fontFamily: "'DM Mono',monospace", opacity: 0.7 }}>{p.year}</div>
                </div>
                <ul style={{ padding: "1rem 1.4rem 1rem 2.8rem", margin: 0, listStyle: "none" }}>
                  {p.items.map((item, i) => (
                    <li key={i} style={{ color: "#94a3b8", fontSize: "0.9rem", lineHeight: 1.65,
                      paddingLeft: 4, marginBottom: 4, position: "relative" }}>
                      <span style={{ position: "absolute", left: -16, color: p.color, fontSize: 10 }}>▸</span>
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </Kicker>

        {/* ── XI. GUF INTEGRATION ── */}
        <Kicker kicker="XI · GUF Integration · String Nanobot in the Seven-Dimensional Framework"
          title="Where the Nanobot Lives in the GUF"
          color={C.teal}>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(100%,300px),1fr))", gap: "1rem" }}>
            {[
              { d: "D1 Space", color: C.teal, role: "The silk string occupies D1. The 3 nm fibre is the physical chassis. Ring band 1–10." },
              { d: "D2 Time", color: C.bright, role: "Kinesin step timing, ATP hydrolysis cycles, Φ-pulsed energy delivery — all time-domain coordination. Ring band 11–50." },
              { d: "D3 Energy", color: C.gold, role: "ATP synthase drive (300 RPM, 40 pN·nm), chlorophyll quantum energy routing (99% efficiency), proton battery (180 mV). Ring band 51–100." },
              { d: "D4 Field", color: C.green, role: "Magnetic nanoparticle field coupling across the silk string array. Gap junction zero-latency bus. Plate-switching optical hull coherence layer. Ring band 101–200." },
              { d: "D5 Vortex", color: C.orange, role: "Bacterial flagellum (20,000 RPM, D5 vortex at biological scale). Myosin swarm rotational coordination. Ring band 201–250." },
              { d: "D6 Conscious", color: C.violet, role: "Chlorophyll FMO quantum coherence (99% at 300K). Primary cilia electrosensation. Ash tree chemical signalling network. Self-referential swarm intelligence. Ring band 401–500." },
              { d: "D7 Source", color: C.pink, role: "Bone marrow as biofactory — the generative source of all nanobot precursors. D7 Source: the pure potential layer from which the string nanobot emerges." },
            ].map(({ d, color, role }) => (
              <div key={d} style={{ background: "rgba(6,15,30,0.85)", border: `1px solid ${color}33`,
                borderRadius: 10, padding: "1rem 1.2rem", borderLeft: `3px solid ${color}` }}>
                <div style={{ fontSize: 13, fontWeight: 700, color, fontFamily: "'DM Mono',monospace",
                  letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 6 }}>{d}</div>
                <p style={{ color: "#94a3b8", fontSize: "0.88rem", lineHeight: 1.6, margin: 0 }}>{role}</p>
              </div>
            ))}
          </div>
        </Kicker>

        {/* ── Cross-links ── */}
        <div style={{ display: "flex", flexWrap: "wrap", gap: 10, marginTop: "1rem",
          paddingTop: "1.5rem", borderTop: "1px solid rgba(255,255,255,0.06)" }}>
          {[
            ["/propulsion-engine", "Propulsion Engine · Nano → Warp"],
            ["/guf-engine", "GUF Master Engine · 7D Field · Collider"],
            ["/substrate-synthesis", "Substrate Synthesis · CaCO₃ + BAVS"],
            ["/aether-foundations", "AETHER Foundations · Crystallization Model"],
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
          String Nanobot · 10 Infographics · 6 Biological Motors · 5-Phase Roadmap · GUF D1–D7 Integration
        </footer>
      </div>
    </div>
  );
}
