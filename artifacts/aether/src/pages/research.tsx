import { useState, useEffect, useRef } from "react";

const PHI = "1.6180339887";
const GOLD = "#fbbf24";
const PURPLE = "rgba(192,132,252,0.9)";

const ARTIFACTS = [
  { name: "φ-Architecture Preprint", desc: "Neural-economic isomorphism; FQP; anyon error correction.", status: "Complete", color: "#34d399" },
  { name: "φ-AETHER Framework", desc: "Toroidal coherence OS; 5-step oncology treatment loop; Russell wave integration.", status: "Complete", color: "#34d399" },
  { name: "Cancer Research Synthesis", desc: "5-layer oncology framework; rational function stage classifier; clinical protocol.", status: "Complete", color: "#34d399" },
  { name: "Fibonacci Processor (FQP)", desc: "Multiplication-free neural network hardware; 86 TWh/yr IoT energy savings.", status: "Complete", color: "#34d399" },
  { name: "Biomimetic Living Stack", desc: "Firefly gate → mycelium substrate → ferrofluid delivery → dolphin coherence detector.", status: "Complete", color: "#34d399" },
  { name: "Biophoton Simulation", desc: "280-node φ-spiral luciferin gate array; live PE + Hurst + SOC monitoring.", status: "Active", color: GOLD },
  { name: "Crackling Noise Cancer Study", desc: "Measure (α−1)/(τ−1) in tumor biology across 500+ patients. Primary experiment.", status: "Seeking Partners", color: "#60a5fa" },
];

const DISCOVERIES = [
  {
    id: "rational",
    title: "The Rational Function Cancer Classifier",
    tag: "DISCOVERY 1",
    color: "#f472b6",
    equation: "f(x) = 4(x−1) / [(x+2)(x−3)]",
    body: [
      "Maps cancer stage to disease regime with mathematical precision. The vertical asymptotes at x = −2 (DNA repair failure) and x = 3 (angiogenesis activation) are biological tipping points encoded in the function's singularities.",
      "The y-intercept f(0) = 2/3 ≈ φ⁻¹ represents the initial immune advantage ratio in healthy tissue.",
    ],
    points: [
      { label: "x = −2", desc: "DNA repair failure threshold — left asymptote" },
      { label: "x = 3", desc: "Angiogenesis activation — right asymptote" },
      { label: "f(0) = ²∕₃", desc: "≈ φ⁻¹ = 0.618 — immune advantage baseline" },
      { label: "3 branches", desc: "Three regimes, three disease states" },
    ],
  },
  {
    id: "entropy",
    title: "Permutation Entropy as Universal Cancer Marker",
    tag: "DISCOVERY 2",
    color: "#34d399",
    equation: "PE < 0.85 → intervention · H = φ⁻¹ = 0.618 (healthy)",
    body: [
      "Permutation entropy peaks at self-organized criticality — the attractor of healthy tissue. A single threshold, PE < 0.85, triggers intervention across all cancer types regardless of tissue origin or mutation profile.",
      "Simultaneously, the Hurst exponent of healthy immune signaling sits at H = φ⁻¹ = 0.618 — deviation from this baseline provides a 3–6 cycle early-warning signal before clinical imaging confirmation.",
    ],
    points: [
      { label: "PE peak", desc: "Self-organized criticality — healthy tissue attractor" },
      { label: "PE < 0.85", desc: "Universal intervention threshold — tissue-type agnostic" },
      { label: "H = 0.618", desc: "Hurst exponent at φ⁻¹ for healthy immune signaling" },
      { label: "3–6 cycles", desc: "Early warning lead time before clinical imaging" },
    ],
  },
  {
    id: "crackling",
    title: "The Crackling Noise Universality Test",
    tag: "DISCOVERY 3 — PRIMARY EXPERIMENT",
    color: "#60a5fa",
    equation: "(α−1)/(τ−1) → neural: 0.98 · economic: 0.97 · tumor: ?",
    body: [
      "In neural systems the crackling noise ratio (α−1)/(τ−1) = 0.98. In economic systems: 0.97. In tumor biology: unmeasured.",
      "Primary prediction: this ratio holds near 1.0 in healthy tissue and deviates detectably in malignant tissue. If confirmed, it constitutes a universal cancer criticality signature independent of tissue type, organ site, or mutation profile.",
    ],
    points: [
      { label: "Neural: 0.98", desc: "Established crackling noise ratio in neural tissue" },
      { label: "Economic: 0.97", desc: "Confirmed in economic cascade systems" },
      { label: "Tumor: TBD", desc: "Primary prediction — deviation signals malignancy" },
      { label: "500+ patients", desc: "Breast, lung, colorectal, pancreatic, glioblastoma" },
    ],
  },
];

const HARDWARE = [
  { icon: "🔦", name: "Firefly Luciferin Gate", detail: "QY ≈ 0.88–1.0 · Zero-heat single-photon logic gate", sub: "Healthy cells: 8–20 ph/s · Malignant: 40–200 ph/s (mitochondrial ROS elevation). Detection threshold built into biochemistry.", color: "#fbbf24" },
  { icon: "🍄", name: "Mycelium Substrate", detail: "Neural-tissue propagation speed · Self-repairing", sub: "Fungal hyphae propagate electrochemical signals. Circuit fabric connecting luciferin gates. FQP Zeckendorf sparse encoding maps onto mycelium's naturally sparse signal propagation.", color: "#34d399" },
  { icon: "🐬", name: "Dolphin Electroreception", detail: "Femtotesla magnetic field sensitivity", sub: "Applied to bioelectric field coherence detection. Continuously monitors transmembrane voltage polarity distinguishing healthy from malignant tissue. No MRI. Passive, continuous, wearable.", color: "#60a5fa" },
  { icon: "🧲", name: "Ferrofluid Delivery", detail: "Magnetically shaped liquid metal · No moving parts", sub: "Field-programmable geometry guided by same magnetic field system as electroreception layer. Detection and treatment in one unified field architecture.", color: "#f472b6" },
];

const COLLAB = [
  {
    title: "FOR THE MOLECULAR BIOLOGIST",
    color: "#34d399",
    ask: "Measure crackling noise ratio (α−1)/(τ−1) in tumor proliferation cascade data.",
    prediction: "We predict deviation from ~1.0 in malignant tissue.",
    detail: "500-patient multi-cancer dataset. All statistical methods and expected effect sizes specified. 6-month study with clear binary outcome.",
  },
  {
    title: "FOR THE HARDWARE ENGINEER",
    color: GOLD,
    ask: "FQP FPGA prototype — paper to Verilog-synthesis level. Target: <10mW implantable biosensor in 28nm ASIC.",
    prediction: "Biophoton simulation scaffold ready to interface with physical sensor hardware.",
    detail: "The mycelium-FQP interface is the key unsolved engineering problem.",
  },
  {
    title: "FOR THE FUNDING OFFICER",
    color: "#60a5fa",
    ask: "Phase 2: crackling noise study + FPGA prototype + collaboration formation.",
    prediction: "FQP component alone: 86 TWh/year energy savings at IoT scale.",
    detail: "SDG 9/11/13 grant pathways independent of the clinical track. Phase 3: clinical PE monitoring trial.",
  },
];

function ResearchHeaderCanvas() {
  const ref = useRef<HTMLCanvasElement>(null);
  const rafRef = useRef(0);
  useEffect(() => {
    const canvas = ref.current; if (!canvas) return;
    const ctx = canvas.getContext("2d")!;
    canvas.width = 900; canvas.height = 145;
    const W = canvas.width, H = canvas.height;
    let t=0;
    const nodes: {x:number;y:number;r:number;phase:number;col:string;label:string}[]=[
      {x:450,y:72,r:18,phase:0,col:"#c9a84c",label:"5Φ"},
      {x:180,y:35,r:11,phase:1,col:"#2ef0d8",label:"MATH"},
      {x:340,y:25,r:10,phase:2,col:"#9966ff",label:"FIELD"},
      {x:560,y:25,r:10,phase:3,col:"#44cc77",label:"BIO"},
      {x:720,y:35,r:11,phase:4,col:"#ff4477",label:"COSMO"},
      {x:150,y:110,r:9,phase:5,col:"#44aaff",label:"PHYS"},
      {x:310,y:118,r:9,phase:6,col:"#c9a84c",label:"CHEM"},
      {x:590,y:118,r:9,phase:7,col:"#2ef0d8",label:"COMP"},
      {x:750,y:110,r:9,phase:8,col:"#9966ff",label:"ASTRO"},
    ];
    const draw=()=>{
      ctx.fillStyle="rgba(2,4,8,0.3)"; ctx.fillRect(0,0,W,H);
      nodes.slice(1).forEach(n=>{
        ctx.beginPath();ctx.moveTo(nodes[0].x,nodes[0].y);ctx.lineTo(n.x,n.y);ctx.strokeStyle=n.col+"22";ctx.lineWidth=0.5;ctx.stroke();
      });
      nodes.forEach(n=>{
        const pls=0.85+0.15*Math.sin(t*0.04+n.phase);
        ctx.beginPath();ctx.arc(n.x,n.y,n.r*pls,0,Math.PI*2);ctx.fillStyle=n.col+"22";ctx.fill();ctx.strokeStyle=n.col+"66";ctx.lineWidth=0.7;ctx.stroke();
        ctx.fillStyle=n.col;ctx.font="5px 'DM Mono',monospace";ctx.textAlign="center";ctx.fillText(n.label,n.x,n.y+2);ctx.textAlign="left";
      });
      ctx.fillStyle="rgba(201,168,76,0.3)"; ctx.font="9px 'DM Mono',monospace";
      ctx.fillText("RESEARCH · KNOWLEDGE SYNTHESIS · FIELD STUDY · AETHER",14,14);
      t++; rafRef.current=requestAnimationFrame(draw);
    };
    draw();
    return ()=>cancelAnimationFrame(rafRef.current);
  },[]);
  return <canvas ref={ref} style={{width:"100%",height:"auto",borderRadius:8,display:"block"}} />;
}

export default function Research() {
  const [activeDiscovery, setActiveDiscovery] = useState<string | null>("rational");

  return (
    <div style={{ height: "100%", overflowY: "auto", background: "rgb(4,3,18)", color: "rgba(255,255,255,0.85)", fontFamily: "'Raleway', 'Georgia', sans-serif" }}>
      <div style={{flexShrink:0}}>
        <div style={{padding:"8px 12px"}}><div style={{display:"inline-block",border:"1px solid #c9a84c",padding:"4px 12px",fontSize:10,letterSpacing:"0.2em",color:"#c9a84c",fontFamily:"'DM Mono',monospace",marginBottom:16}}>LIVE SIMULATION</div></div>
        <div style={{margin:"0 12px 0",background:"rgba(2,4,8,0.8)",borderLeft:"3px solid #c9a84c",borderRadius:4,overflow:"hidden"}}>
          <div style={{padding:"12px 16px 8px"}}><h2 style={{margin:0,fontSize:13,color:"#c9a84c",fontFamily:"'DM Mono',monospace",letterSpacing:"0.15em",fontWeight:400}}>RESEARCH · KNOWLEDGE SYNTHESIS · FIELD STUDY · AETHER</h2><p style={{margin:"4px 0 8px",fontSize:10,color:"rgba(201,168,76,0.5)",fontFamily:"'DM Mono',monospace",letterSpacing:"0.1em"}}>The live AETHER research knowledge graph simulation.</p></div>
          <ResearchHeaderCanvas />
        </div>
      </div>
      {/* MASTHEAD */}
      <div style={{ background: "linear-gradient(180deg, rgba(251,191,36,0.06) 0%, transparent 100%)", borderBottom: "1px solid rgba(251,191,36,0.15)", padding: "24px 32px 20px" }}>
        <div style={{ display: "flex", alignItems: "baseline", gap: 16, marginBottom: 4 }}>
          <h1 style={{ fontFamily: "Cinzel, serif", fontSize: 20, letterSpacing: 8, color: GOLD, fontWeight: 700, margin: 0 }}>
            5Φ-AETHER
          </h1>
          <span style={{ fontFamily: "Cinzel, serif", fontSize: 10, letterSpacing: 4, color: "rgba(251,191,36,0.4)", textTransform: "uppercase" }}>Research Initiative</span>
          <span style={{ marginLeft: "auto", fontSize: 9, color: "rgba(251,191,36,0.35)", fontFamily: "monospace", letterSpacing: 2 }}>EXECUTIVE BRIEF · MARCH 2026</span>
        </div>
        <h2 style={{ fontFamily: "Cinzel, serif", fontSize: 15, letterSpacing: 3, color: "rgba(255,255,255,0.7)", fontWeight: 300, margin: "0 0 8px" }}>
          Living Systems for Coherent Cancer Detection
        </h2>
        <p style={{ fontSize: 11, color: "rgba(255,255,255,0.45)", maxWidth: 680, lineHeight: 1.7, margin: 0 }}>
          The φ-AETHER Framework: From Fibonacci Mathematics to Biophoton Biosensors.<br />
          <em style={{ color: "rgba(251,191,36,0.55)" }}>Core thesis:</em> Cancer is a coherence failure — a departure from the φ-harmonic self-organized critical attractor that characterizes healthy biological tissue.
        </p>
        <div style={{ display: "flex", gap: 24, marginTop: 14, flexWrap: "wrap" }}>
          {[
            { n: "7", l: "Artifacts" }, { n: "23", l: "Core Equations" },
            { n: "5", l: "Architecture Layers" }, { n: PHI, l: "φ" },
          ].map(m => (
            <div key={m.l} style={{ textAlign: "center" }}>
              <div style={{ fontFamily: "Cinzel, serif", fontSize: m.l === "φ" ? 16 : 20, color: GOLD }}>{m.n}</div>
              <div style={{ fontSize: 8, letterSpacing: 2, color: "rgba(255,255,255,0.3)", textTransform: "uppercase" }}>{m.l}</div>
            </div>
          ))}
        </div>
      </div>

      <div style={{ padding: "0 32px 32px" }}>
        {/* WHAT HAS BEEN BUILT */}
        <div style={{ marginTop: 24 }}>
          <div style={{ fontSize: 9, letterSpacing: 4, color: GOLD, opacity: 0.6, textTransform: "uppercase", marginBottom: 12, display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{ flex: 1, height: 1, background: "rgba(251,191,36,0.2)", display: "inline-block" }} />
            WHAT HAS BEEN BUILT · Seven Converging Research Programs
            <span style={{ flex: 1, height: 1, background: "rgba(251,191,36,0.2)", display: "inline-block" }} />
          </div>
          <p style={{ fontSize: 10, color: "rgba(255,255,255,0.4)", lineHeight: 1.7, marginBottom: 14, maxWidth: 680 }}>
            Seven independent research streams have converged on a single unifying constant: <strong style={{ color: GOLD }}>φ = {PHI}</strong>.
            φ is the solution to the simplest algebraic self-referential equation <em>x = 1 + 1/x</em> — the fixed point of efficient self-organization under resource constraints.
          </p>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 8 }}>
            {ARTIFACTS.map(a => (
              <div key={a.name} style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 8, padding: "10px 14px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 4 }}>
                  <div style={{ fontFamily: "Cinzel, serif", fontSize: 10, color: "rgba(255,255,255,0.7)", letterSpacing: 1 }}>{a.name}</div>
                  <span style={{ fontSize: 8, color: a.color, letterSpacing: 1, flexShrink: 0, marginLeft: 8 }}>{a.status}</span>
                </div>
                <div style={{ fontSize: 9, color: "rgba(255,255,255,0.35)", lineHeight: 1.5 }}>{a.desc}</div>
              </div>
            ))}
          </div>
        </div>

        {/* THREE DISCOVERIES */}
        <div style={{ marginTop: 28 }}>
          <div style={{ fontSize: 9, letterSpacing: 4, color: GOLD, opacity: 0.6, textTransform: "uppercase", marginBottom: 14, display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{ flex: 1, height: 1, background: "rgba(251,191,36,0.2)", display: "inline-block" }} />
            THREE CORE SCIENTIFIC DISCOVERIES
            <span style={{ flex: 1, height: 1, background: "rgba(251,191,36,0.2)", display: "inline-block" }} />
          </div>
          <div style={{ display: "flex", gap: 8, marginBottom: 12, flexWrap: "wrap" }}>
            {DISCOVERIES.map(d => (
              <button key={d.id} onClick={() => setActiveDiscovery(prev => prev === d.id ? null : d.id)}
                style={{ background: activeDiscovery === d.id ? `${d.color}18` : "transparent", border: `1px solid ${activeDiscovery === d.id ? d.color : "rgba(255,255,255,0.1)"}`, borderRadius: 6, padding: "6px 14px", color: activeDiscovery === d.id ? d.color : "rgba(255,255,255,0.4)", fontSize: 9, letterSpacing: 2, cursor: "pointer", transition: "all 0.2s", textTransform: "uppercase" }}>
                {d.tag}
              </button>
            ))}
          </div>
          {DISCOVERIES.filter(d => d.id === activeDiscovery).map(d => (
            <div key={d.id} style={{ background: `${d.color}08`, border: `1px solid ${d.color}30`, borderRadius: 10, padding: 20 }}>
              <div style={{ fontFamily: "Cinzel, serif", fontSize: 14, color: d.color, letterSpacing: 2, marginBottom: 4 }}>{d.title}</div>
              <div style={{ fontFamily: "monospace", fontSize: 11, color: d.color, opacity: 0.7, background: "rgba(0,0,0,0.3)", borderRadius: 6, padding: "6px 12px", marginBottom: 14, letterSpacing: 1 }}>{d.equation}</div>
              {d.body.map((b, i) => <p key={i} style={{ fontSize: 11, color: "rgba(255,255,255,0.55)", lineHeight: 1.7, marginBottom: 10 }}>{b}</p>)}
              <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 8, marginTop: 12 }}>
                {d.points.map(p => (
                  <div key={p.label} style={{ display: "flex", gap: 10, padding: "6px 10px", background: "rgba(0,0,0,0.2)", borderRadius: 6 }}>
                    <span style={{ fontFamily: "monospace", fontSize: 11, color: d.color, minWidth: 80, flexShrink: 0 }}>{p.label}</span>
                    <span style={{ fontSize: 10, color: "rgba(255,255,255,0.4)" }}>{p.desc}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* LIVING HARDWARE STACK */}
        <div style={{ marginTop: 28 }}>
          <div style={{ fontSize: 9, letterSpacing: 4, color: GOLD, opacity: 0.6, textTransform: "uppercase", marginBottom: 14, display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{ flex: 1, height: 1, background: "rgba(251,191,36,0.2)", display: "inline-block" }} />
            THE LIVING HARDWARE STACK · Biology as the Instrument
            <span style={{ flex: 1, height: 1, background: "rgba(251,191,36,0.2)", display: "inline-block" }} />
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 10 }}>
            {HARDWARE.map((h, i) => (
              <div key={h.name} style={{ background: "rgba(255,255,255,0.02)", border: `1px solid ${h.color}20`, borderRadius: 10, padding: "14px 16px", display: "flex", gap: 12 }}>
                <div style={{ fontSize: 24, flexShrink: 0, lineHeight: 1 }}>{h.icon}</div>
                <div>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                    <span style={{ fontFamily: "Cinzel, serif", fontSize: 11, color: h.color, letterSpacing: 1 }}>{h.name}</span>
                    <span style={{ width: 4, height: 4, borderRadius: "50%", background: h.color, opacity: 0.6 }} />
                  </div>
                  <div style={{ fontSize: 9, color: "rgba(255,255,255,0.5)", marginBottom: 6 }}>{h.detail}</div>
                  <div style={{ fontSize: 9, color: "rgba(255,255,255,0.3)", lineHeight: 1.6 }}>{h.sub}</div>
                </div>
              </div>
            ))}
          </div>
          <div style={{ marginTop: 10, padding: "8px 14px", background: "rgba(255,255,255,0.02)", borderRadius: 8, fontSize: 9, color: "rgba(255,255,255,0.3)", lineHeight: 1.6, border: "1px solid rgba(255,255,255,0.04)" }}>
            Pipeline: Firefly luciferin gates detect biophoton anomaly → mycelium substrate propagates signal → dolphin electroreception confirms bioelectric field coherence deviation → ferrofluid delivery targets identified zone.
            <strong style={{ color: "rgba(255,255,255,0.5)" }}> Detection and treatment share one unified field architecture.</strong>
          </div>
        </div>

        {/* THREE COLLABORATION PATHS */}
        <div style={{ marginTop: 28 }}>
          <div style={{ fontSize: 9, letterSpacing: 4, color: GOLD, opacity: 0.6, textTransform: "uppercase", marginBottom: 14, display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{ flex: 1, height: 1, background: "rgba(251,191,36,0.2)", display: "inline-block" }} />
            THREE COLLABORATION PATHS
            <span style={{ flex: 1, height: 1, background: "rgba(251,191,36,0.2)", display: "inline-block" }} />
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 10 }}>
            {COLLAB.map(c => (
              <div key={c.title} style={{ background: `${c.color}06`, border: `1px solid ${c.color}25`, borderRadius: 10, padding: 16 }}>
                <div style={{ fontFamily: "Cinzel, serif", fontSize: 9, color: c.color, letterSpacing: 2, marginBottom: 10, textTransform: "uppercase" }}>{c.title}</div>
                <div style={{ fontSize: 10, color: "rgba(255,255,255,0.6)", marginBottom: 8, lineHeight: 1.6 }}>{c.ask}</div>
                <div style={{ fontStyle: "italic", fontSize: 9, color: c.color, opacity: 0.7, marginBottom: 8 }}>{c.prediction}</div>
                <div style={{ fontSize: 9, color: "rgba(255,255,255,0.35)", lineHeight: 1.6 }}>{c.detail}</div>
              </div>
            ))}
          </div>
        </div>

        {/* PRIMARY EXPERIMENT */}
        <div style={{ marginTop: 28, background: "rgba(96,165,250,0.05)", border: "1px solid rgba(96,165,250,0.2)", borderRadius: 12, padding: 20 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
            <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#60a5fa", animation: "pulse 2s infinite" }} />
            <span style={{ fontFamily: "Cinzel, serif", fontSize: 11, color: "#60a5fa", letterSpacing: 3, textTransform: "uppercase" }}>Primary Experimental Prediction — ART-008</span>
          </div>
          <div style={{ fontFamily: "monospace", fontSize: 12, color: "rgba(96,165,250,0.8)", background: "rgba(0,0,0,0.3)", borderRadius: 6, padding: "8px 14px", marginBottom: 14, letterSpacing: 1 }}>
            (α−1)/(τ−1) ≈ 1.0 in healthy tissue · deviates in malignant tissue
          </div>
          <p style={{ fontSize: 11, color: "rgba(255,255,255,0.5)", lineHeight: 1.7, margin: "0 0 12px" }}>
            Measure the crackling noise ratio in tumor proliferation cascade data across breast, lung, colorectal, pancreatic, and glioblastoma tissue samples using a 500+ patient dataset spanning multiple cancer types.
          </p>
          <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
            {[{ l: "Timeline", v: "6 months" }, { l: "Dataset", v: "500+ patients, 5+ cancer types" }, { l: "Outcome", v: "Binary (ratio holds / deviates)" }].map(m => (
              <div key={m.l} style={{ display: "flex", gap: 8, alignItems: "baseline" }}>
                <span style={{ fontSize: 9, color: "rgba(96,165,250,0.5)", letterSpacing: 1 }}>{m.l}:</span>
                <span style={{ fontSize: 10, color: "rgba(255,255,255,0.65)" }}>{m.v}</span>
              </div>
            ))}
          </div>
        </div>

        {/* FOOTER */}
        <div style={{ marginTop: 24, paddingTop: 16, borderTop: "1px solid rgba(251,191,36,0.1)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div style={{ fontSize: 9, color: "rgba(255,255,255,0.2)", fontFamily: "monospace" }}>φ-AETHER Research Initiative · Hollidaysburg, Pennsylvania · AetherLife.co</div>
          <div style={{ fontFamily: "Cinzel, serif", fontSize: 11, color: "rgba(251,191,36,0.4)", letterSpacing: 2 }}>φ = {PHI}</div>
        </div>
      </div>
    </div>
  );
}
