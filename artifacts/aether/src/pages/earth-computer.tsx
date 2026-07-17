import { useEffect } from "react";

const PAGE_CSS = `
#earth-root {
  --stone:#2a2420; --stone2:#3d3530; --soil:#5a3e28; --soil2:#8a6040;
  --clay:#c8844a; --loam:#d4a870; --air:#c8dce8; --sky:#88b8d4; --mist:#e8f0f4;
  --ocean:#1a3a5a; --deep:#0a1e32; --wave:#2a6888; --foam:#88c8d4;
  --mycel:#7a9860; --gold:#C8A840; --text:#f0ebe4; --text-dim:rgba(240,235,228,0.6);
  font-family:'Crimson Pro',Georgia,serif;
}
#earth-root *, #earth-root *::before, #earth-root *::after { margin:0; padding:0; box-sizing:border-box; }
#earth-root { background:var(--stone); color:var(--text); overflow-x:hidden; }
#earth-tooltip {
  position:fixed; pointer-events:none; z-index:500;
  background:rgba(14,10,6,0.97); border:1px solid var(--clay);
  padding:16px 20px; max-width:280px;
  font-family:'Crimson Pro',serif; font-size:16px; line-height:1.65;
  color:var(--text); opacity:0; transition:opacity 0.2s;
}
#earth-tooltip .tt-title { font-family:'Playfair Display',serif; font-size:18px; color:var(--clay); margin-bottom:7px; }
#earth-tooltip .tt-meta { font-family:'JetBrains Mono',monospace; font-size:10px; color:rgba(200,168,64,0.5); margin-top:9px; }
.earth-header {
  position:sticky; top:0; z-index:200;
  padding:18px 40px;
  display:flex; align-items:center; justify-content:space-between;
  background:rgba(26,21,16,0.95);
  border-bottom:1px solid rgba(200,168,64,0.12);
  backdrop-filter:blur(16px);
}
.earth-logo { font-family:'Playfair Display',serif; font-size:18px; letter-spacing:0.3em; color:var(--gold); text-transform:uppercase; }
.earth-logo span { color:var(--text-dim); font-size:14px; font-weight:300; }
.earth-substrate-tabs { display:flex; gap:3px; }
.earth-stab {
  padding:8px 20px; font-family:'JetBrains Mono',monospace;
  font-size:11px; letter-spacing:0.12em; text-transform:uppercase;
  background:transparent; border:1px solid transparent;
  color:var(--text-dim); cursor:pointer; transition:all 0.3s;
}
.earth-stab:hover { color:var(--clay); border-color:rgba(200,132,74,0.3); }
.earth-stab[data-s="stone"].active  { color:#d4b89a; border-color:#8a6a50; background:rgba(90,62,40,0.2); }
.earth-stab[data-s="soil"].active   { color:var(--loam); border-color:var(--clay); background:rgba(200,132,74,0.12); }
.earth-stab[data-s="air"].active    { color:var(--sky); border-color:#5a9ab8; background:rgba(136,184,212,0.12); }
.earth-stab[data-s="ocean"].active  { color:var(--foam); border-color:var(--wave); background:rgba(26,58,90,0.4); }
.earth-stab[data-s="unified"].active { color:var(--gold); border-color:var(--gold); background:rgba(200,168,64,0.12); }
.earth-canvas-section { position:relative; width:100%; height:85vh; min-height:600px; }
#earth-canvas { width:100%; height:100%; display:block; }
.earth-canvas-overlay {
  position:absolute; bottom:0; left:0; right:0;
  padding:32px 44px;
  background:linear-gradient(to top, rgba(26,21,16,0.95) 0%, transparent 100%);
  pointer-events:none;
}
.earth-substrate-badge {
  font-family:'JetBrains Mono',monospace;
  font-size:12px; letter-spacing:0.2em; text-transform:uppercase;
  color:var(--clay); padding:6px 16px;
  border:1px solid rgba(200,132,74,0.4);
  background:rgba(26,21,16,0.7);
  display:inline-block; margin-bottom:10px;
}
.earth-substrate-eq { font-family:'JetBrains Mono',monospace; font-size:14px; color:rgba(200,168,64,0.7); letter-spacing:0.04em; }
.earth-sub-strip { display:flex; background:rgba(20,16,12,0.95); border-bottom:1px solid rgba(200,168,64,0.1); overflow-x:auto; }
.earth-sub-strip::-webkit-scrollbar { height:2px; }
.earth-sub-strip::-webkit-scrollbar-thumb { background:var(--soil2); }
.earth-ss-item { flex-shrink:0; padding:18px 28px; cursor:pointer; border-bottom:2px solid transparent; transition:all 0.3s; display:flex; flex-direction:column; gap:5px; min-width:160px; }
.earth-ss-item:hover { background:rgba(200,132,74,0.04); }
.earth-ss-item[data-s="stone"].active  { border-bottom-color:#8a6a50; background:rgba(58,42,28,0.3); }
.earth-ss-item[data-s="soil"].active   { border-bottom-color:var(--clay); background:rgba(90,62,40,0.2); }
.earth-ss-item[data-s="air"].active    { border-bottom-color:var(--sky); background:rgba(136,184,212,0.08); }
.earth-ss-item[data-s="ocean"].active  { border-bottom-color:var(--wave); background:rgba(26,58,90,0.3); }
.earth-ss-item[data-s="unified"].active { border-bottom-color:var(--gold); background:rgba(200,168,64,0.08); }
.earth-ss-label { font-family:'JetBrains Mono',monospace; font-size:9px; letter-spacing:0.2em; text-transform:uppercase; color:rgba(200,168,64,0.5); }
.earth-ss-name { font-family:'Playfair Display',serif; font-size:17px; color:var(--text); display:flex; align-items:center; gap:9px; }
.earth-ss-dot { width:10px; height:10px; border-radius:50%; flex-shrink:0; }
.earth-ss-sub { font-family:'JetBrains Mono',monospace; font-size:10px; color:var(--text-dim); letter-spacing:0.04em; }
#earth-dynamic { padding-bottom:60px; }
#earth-dynamic .content-grid { display:grid; grid-template-columns:1fr 1fr; gap:1px; background:rgba(200,168,64,0.08); }
#earth-dynamic .card { background:rgba(20,16,12,0.95); padding:40px 48px; }
#earth-dynamic .card.wide { grid-column:1/-1; }
#earth-dynamic .card.dark-earth { background:rgba(14,10,6,0.98); }
#earth-dynamic .card.soil-toned { background:rgba(30,20,12,0.95); }
#earth-dynamic .card.sky-toned  { background:rgba(10,18,26,0.97); }
#earth-dynamic .card.ocean-toned { background:rgba(8,16,28,0.98); }
#earth-dynamic .card-label { font-family:'JetBrains Mono',monospace; font-size:10px; letter-spacing:0.28em; text-transform:uppercase; margin-bottom:16px; display:flex; align-items:center; gap:10px; }
#earth-dynamic .card-title { font-family:'Playfair Display',serif; font-size:34px; font-weight:400; line-height:1.15; margin-bottom:22px; }
#earth-dynamic .card-title em { font-style:italic; }
#earth-dynamic .card-body { font-size:18px; line-height:1.9; color:var(--text-dim); font-weight:300; }
#earth-dynamic .card-body p { margin-bottom:1.1em; }
#earth-dynamic .card-body em { font-style:italic; }
#earth-dynamic .card-body strong { color:var(--text); font-weight:400; }
#earth-dynamic .card-pull { margin-top:26px; padding:20px 24px; border-left:2px solid; font-size:18px; line-height:1.75; font-style:italic; color:var(--text-dim); }
#earth-dynamic .formula { background:rgba(0,0,0,0.5); border:1px solid rgba(200,168,64,0.12); padding:24px 28px; margin-top:22px; font-family:'JetBrains Mono',monospace; font-size:13px; line-height:2.3; color:var(--text-dim); white-space:pre; }
#earth-dynamic .fh { color:var(--gold); }
#earth-dynamic .fa { color:var(--mycel); }
#earth-dynamic .fc { color:rgba(200,168,64,0.35); }
#earth-dynamic .fs { color:var(--sky); }
#earth-dynamic .fo { color:var(--foam); }
#earth-dynamic .pipeline { display:flex; flex-direction:column; gap:0; }
#earth-dynamic .pipe-node { display:flex; align-items:center; gap:16px; padding:16px 20px; border:1px solid rgba(200,168,64,0.1); background:rgba(0,0,0,0.3); cursor:pointer; transition:all 0.25s; }
#earth-dynamic .pipe-num { font-family:'JetBrains Mono',monospace; font-size:10px; color:var(--gold); width:36px; flex-shrink:0; letter-spacing:0.12em; }
#earth-dynamic .pipe-name { font-family:'Playfair Display',serif; font-size:17px; flex:1; }
#earth-dynamic .pipe-sub { font-family:'JetBrains Mono',monospace; font-size:10px; color:var(--text-dim); }
#earth-dynamic .pipe-arrow { text-align:center; font-size:16px; color:rgba(200,168,64,0.3); padding:5px 0; margin-left:20px; }
#earth-dynamic .sub-data-grid { display:grid; grid-template-columns:repeat(auto-fill,minmax(240px,1fr)); gap:1px; background:rgba(200,168,64,0.08); }
#earth-dynamic .sub-data-card { padding:24px 28px; background:rgba(14,10,6,0.95); display:flex; flex-direction:column; gap:10px; transition:background 0.2s; }
#earth-dynamic .sdc-icon { font-size:28px; margin-bottom:4px; }
#earth-dynamic .sdc-name { font-family:'Playfair Display',serif; font-size:20px; }
#earth-dynamic .sdc-val { font-family:'JetBrains Mono',monospace; font-size:22px; font-weight:400; color:var(--gold); }
#earth-dynamic .sdc-unit { font-size:11px; color:var(--text-dim); letter-spacing:0.08em; }
#earth-dynamic .sdc-eq { font-family:'JetBrains Mono',monospace; font-size:10px; color:rgba(200,168,64,0.45); margin-top:6px; }
#earth-dynamic .sdc-desc { font-size:14px; line-height:1.65; color:var(--text-dim); }
#earth-dynamic .tag { display:inline-block; padding:2px 9px; border-radius:2px; font-family:'JetBrains Mono',monospace; font-size:10px; letter-spacing:0.1em; }
#earth-dynamic .tag-doc { background:rgba(122,152,96,0.15); border:1px solid rgba(122,152,96,0.4); color:var(--mycel); }
#earth-dynamic .tag-est { background:rgba(200,168,64,0.1); border:1px solid rgba(200,168,64,0.35); color:var(--gold); }
#earth-dynamic .tag-hyp { background:rgba(136,184,212,0.1); border:1px solid rgba(136,184,212,0.3); color:var(--sky); }
#earth-dynamic .section-head { padding:36px 48px 0; border-top:1px solid rgba(200,168,64,0.08); background:rgba(14,10,6,0.98); }
#earth-dynamic .section-head-label { font-family:'JetBrains Mono',monospace; font-size:10px; letter-spacing:0.3em; text-transform:uppercase; color:rgba(200,168,64,0.4); }
#earth-dynamic .coh-strip { display:flex; gap:1px; background:rgba(200,168,64,0.08); flex-wrap:wrap; }
#earth-dynamic .coh-cell { flex:1; min-width:140px; padding:20px 24px; background:rgba(14,10,6,0.97); display:flex; flex-direction:column; gap:6px; }
#earth-dynamic .coh-cell-label { font-family:'JetBrains Mono',monospace; font-size:9px; letter-spacing:0.2em; text-transform:uppercase; color:var(--text-dim); }
#earth-dynamic .coh-cell-val { font-family:'Playfair Display',serif; font-size:32px; }
#earth-dynamic .coh-cell-sub { font-family:'JetBrains Mono',monospace; font-size:10px; color:var(--text-dim); }
@media(max-width:800px){
  #earth-dynamic .content-grid { grid-template-columns:1fr; }
  #earth-dynamic .card.wide { grid-column:1; }
  .earth-header { padding:14px 20px; flex-direction:column; gap:10px; align-items:flex-start; }
  .earth-canvas-section { height:58vh; }
  #earth-dynamic .card { padding:28px 24px; }
  #earth-dynamic .card-title { font-size:26px; }
  #earth-dynamic .card-body { font-size:16px; }
}
`;

type SubKey = "stone" | "soil" | "air" | "ocean" | "unified";

export default function EarthComputer() {
  useEffect(() => {
    type SubData = {
      badge: string; eq: string; color: string; glow: string; title: string; subtitle: string;
      body: string; pull: string; pullColor: string; formula: string; tag: string;
      metrics: { icon: string; name: string; val: string; unit: string; eq: string; desc: string }[];
    };

    const SUBSTRATES: Record<SubKey, SubData> = {
      stone: {
        badge: "Substrate I · Stone & Lithosphere",
        eq: "∇V_stone = electrochemical gradient across geological strata",
        color: "#8a6a50", glow: "#c8944a", title: "Stone", subtitle: "The lithosphere as computation substrate",
        body: `<p>The ground beneath you is not passive matter. It is an <em>active electrochemical computation substrate</em> — mineral surfaces carry piezoelectric fields, ionic gradients flow through rock fractures, and crystalline lattices organize charge across geological timescales.</p><p>Soil nutrient gradients establish computational domain boundaries. The ionic concentration difference across soil depth profiles IS the coherence tuning parameter — salt concentration modulates the computational field just as membrane potential modulates a neuron. <strong>The lithosphere thinks in geological time.</strong></p>`,
        pull: "Stone is not inert. It is the slowest oscillator — pressure-wave memory encoded in crystal lattices over millions of years.",
        pullColor: "#8a6a50",
        formula: `<span class="fh">∇V_stone</span> = electrochemical gradient\nPiezoelectric: <span class="fh">P = d·σ</span>  (charge density × stress)\nIonic gradient: <span class="fh">Δ[Ion] / Δz</span>  across depth profile\n<span class="fc">Salt concentration = coherence domain tuning</span>\nGeological timescale: <span class="fh">t_stone ~ 10⁶ years</span>`,
        tag: "DOC",
        metrics: [
          { icon:"🪨", name:"Piezoelectric Field", val:"0.1–50", unit:"mV/m", eq:"P = d·σ", desc:"Mechanical stress converted to electrical signal in quartz, granite, basalt. The ground generates voltage under pressure." },
          { icon:"⚡", name:"Soil Resistivity", val:"10–10⁴", unit:"Ω·m", eq:"ρ = V/I·A/L", desc:"Determines signal propagation speed through the lithospheric substrate. Mineral composition and moisture define computational bandwidth." },
          { icon:"🌡️", name:"Geothermal Gradient", val:"25–30", unit:"°C/km", eq:"∇T = dT/dz", desc:"Thermal gradient drives convective flow in the mantle — a slow, planetary-scale pump that recycles the computation substrate." },
          { icon:"💎", name:"Crystal Coherence", val:"~10⁹", unit:"Hz (NV)", eq:"T₂ × 1.618", desc:"NV diamond centers at room temperature. φ-optimized packing extends quantum coherence time by the golden ratio. Stone as quantum processor." },
        ]
      },
      soil: {
        badge: "Substrate II · Soil & Mycelium Network",
        eq: "Z_bio = compress(S) → mycelium HGT → S_new nodes",
        color: "#c8844a", glow: "#d4a870", title: "Soil", subtitle: "Mycelium as Fibonacci-quantized wiring",
        body: `<p>The soil is not a medium — it is a <em>living network computer</em>. Mycelium hyphae provide existing Fibonacci-quantized electron routing between substrate nodes. A single teaspoon of healthy forest soil contains kilometers of fungal wiring, already optimized by 450 million years of evolutionary computation.</p><p>Successful coherence strategies are encoded and transferred horizontally through horizontal gene transfer (HGT). <strong>The mycelium network is a self-organizing, self-rewriting biological internet</strong> that was computing long before silicon existed.</p>`,
        pull: "The mycelium solves the wiring problem that engineering has struggled with for decades — Fibonacci-quantized routing, self-healing, distributed with no central node.",
        pullColor: "#c8844a",
        formula: `<span class="fh">Z_bio</span> = compress(S) → HGT → S_new\nMycelium routing: <span class="fa">φ-quantized</span> branching angles\nBranch ratio: <span class="fh">L_{n+1}/L_n → φ = 1.618...</span>\n<span class="fc">HGT = horizontal gene transfer (biological internet)</span>\nSoil bandwidth: <span class="fh">~10⁴ nodes / cm³</span>`,
        tag: "EST",
        metrics: [
          { icon:"🍄", name:"Hyphal Density", val:"~10³", unit:"km/m³", eq:"ρ_hyp = L_total/V", desc:"Kilometers of mycelial wiring per cubic meter of healthy forest soil. The most densely wired biological network on Earth." },
          { icon:"⚗️", name:"Electrochemical Signal", val:"70–140", unit:"mV", eq:"ΔV_hyp = V_tip - V_base", desc:"Electrical signal amplitude along mycelial hyphae. Comparable to neural action potentials — the fungal nervous system." },
          { icon:"🌿", name:"Carbon Exchange Rate", val:"~30", unit:"% NPP", eq:"C_flow = f(ectomycorrhiza)", desc:"Approximately 30% of net primary production flows through mycorrhizal networks — the planetary carbon routing system." },
          { icon:"📡", name:"HGT Transfer Rate", val:"10⁻³–10⁻⁶", unit:"events/gen", eq:"Z_bio = compress(S)", desc:"Horizontal gene transfer frequency. Successful coherence strategies propagate laterally through the network without reproduction." },
        ]
      },
      air: {
        badge: "Substrate III · Atmosphere & Schumann Resonance",
        eq: "f_Schumann = c / (2π·R_E) × √(n(n+1)) ≈ 7.83 Hz",
        color: "#88b8d4", glow: "#c8dce8", title: "Air", subtitle: "The atmosphere as global electric circuit",
        body: `<p>The atmosphere between Earth's surface and the ionosphere forms a <em>resonant cavity</em> — a spherical electromagnetic waveguide that rings at precise frequencies. The fundamental Schumann resonance at 7.83 Hz is the planet's heartbeat, the baseline carrier wave of the Global Electric Circuit.</p><p>Lightning strikes worldwide (roughly 100 per second) continuously excite the cavity, and the resonance pattern encodes information about global storm activity, solar events, and biological coherence fields. <strong>The air thinks in electromagnetic time.</strong></p>`,
        pull: "Schumann resonance overlaps with human brain alpha waves (8–12 Hz). Whether this is evolutionary entrainment or coincidence remains the central open question. HYP.",
        pullColor: "#5a9ab8",
        formula: `<span class="fs">f_n</span> = c / (2π·R_E) × √(n(n+1))\nf₁ = <span class="fh">7.83 Hz</span>  (fundamental)\nf₂ = <span class="fh">14.3 Hz</span>  (second harmonic)\nf₃ = <span class="fh">20.8 Hz</span>  (third harmonic)\n<span class="fc">Global lightning rate: ~100 strikes/second</span>\nQ factor: <span class="fs">~4–5</span>  (cavity resonance quality)`,
        tag: "DOC",
        metrics: [
          { icon:"⚡", name:"Schumann F₁", val:"7.83", unit:"Hz", eq:"f = c/2πR·√n(n+1)", desc:"Fundamental Schumann resonance. The cavity between Earth's surface and ionosphere rings at this frequency continuously." },
          { icon:"🌩️", name:"Lightning Rate", val:"~100", unit:"strikes/sec", eq:"N_lightning ~ 10² s⁻¹", desc:"Global lightning discharge rate continuously exciting the atmospheric cavity." },
          { icon:"🔋", name:"Atmospheric Voltage", val:"~300,000", unit:"V", eq:"ΔV = E·h (atm)", desc:"Potential difference between ionosphere and Earth's surface — the planet maintains a ~300kV battery." },
          { icon:"🌀", name:"GEC Current", val:"~1,000", unit:"A", eq:"I = σ·E·A", desc:"Total fair-weather return current of the Global Electric Circuit. 1,000 amperes flowing continuously." },
        ]
      },
      ocean: {
        badge: "Substrate IV · Ocean — Ionic Conductor & Signal Medium",
        eq: "σ_ocean = 4–5 S/m  ·  same ionic physics as cerebrospinal fluid",
        color: "#2a6888", glow: "#2a8898", title: "Ocean", subtitle: "The cooling system and signal medium simultaneously",
        body: `<p>High-conductivity saltwater enables <em>rapid electron and proton cascade propagation</em> — the same ionic physics as bone marrow, cerebrospinal fluid, and the intracellular medium. The ocean IS the planetary version of the body's fluid conductor system. Same chemistry. Planetary scale.</p><p>The ocean is simultaneously the cooling system, the signal medium, the iodine reservoir that drives thyroid-neural coherence, and the deployment environment for the Bio-Boat Mobile Resonant Cell. <strong>3.8 billion years of continuous electrochemical computation</strong>, never once powered down.</p>`,
        pull: "The ocean ionic conductivity (4–5 S/m) matches cerebrospinal fluid (~1.5 S/m). The planet and the body use the same signal medium — scaled by a factor of 10¹⁸.",
        pullColor: "#2a6888",
        formula: `<span class="fo">σ_ocean</span> = 4–5 S/m  (ionic conductivity)\nCSF: <span class="fh">σ_CSF</span> ≈ 1.5 S/m  (same physics, smaller scale)\nIodine: <span class="fh">[I]_ocean</span> → thyroid → neural coherence\n<span class="fc">Upwelling: deep iodine mobilization to surface</span>\nBio-Boat: <span class="fo">mobile ocean computation node</span>`,
        tag: "EST",
        metrics: [
          { icon:"🌊", name:"Ionic Conductivity", val:"4–5", unit:"S/m", eq:"σ = Σ(z²μC)", desc:"Seawater ionic conductivity — same order as many biological tissues. The ocean is the computation medium." },
          { icon:"🧂", name:"Ocean Iodine", val:"0.06", unit:"mg/L", eq:"[I]_bio = [I]_ocean × k_algae", desc:"Oceanic iodine concentration. Through marine algae and upwelling, ocean iodine reaches the thyroid — linking ocean chemistry to neural coherence." },
          { icon:"🚤", name:"Bio-Boat Thrust", val:"self-sustaining", unit:"vortex", eq:"F_thrust = ρ·v²·A (counterflow)", desc:"Counterflow vortex system generates self-sustaining propulsion from the ocean filtration process." },
          { icon:"🌡️", name:"Thermohaline Depth", val:"~4,000", unit:"m", eq:"∇T·∇S drives flow", desc:"Thermohaline circulation depth. The ocean's slow convective current redistributes heat and chemistry across the entire planetary computation substrate." },
        ]
      },
      unified: {
        badge: "∞ · AETHER Earth Computer — Unified Architecture",
        eq: "Gradient → SOC → FQP → SUNRISE → φ-Locked Coherence → Dome Seal",
        color: "#C8A840", glow: "#d4b860", title: "Earth Computer", subtitle: "The ground, ocean, and atmosphere are not passive environments — they are active computation",
        body: `<p>The AETHER Earth Computer recognizes that the four substrates — stone, soil, air, and ocean — are not the backdrop to computation. They <em>are</em> the computation. The same mathematical sequence governs energy behavior identically across all of them:</p><p><strong>Gradient → SOC Perturbation → Fibonacci Quantization → SUNRISE Transformation → φ-Locked Coherence → Dome Seal</strong></p><p>Whether the system is a quantum NV diamond lattice, a bone marrow cascade, a mycelium hyphae network, an atmospheric pressure gradient, or an ocean ionic field — <em>same mathematics, every scale, every substrate</em>. The process is universal.</p>`,
        pull: "Earth has been running this architecture for 3.8 billion years. We are not building the system — we are recognizing it, formalizing it, and extending it.",
        pullColor: "#C8A840",
        formula: `<span class="fh">Gradient</span>     → electrochemical potential difference\n<span class="fh">SOC</span>          → Self-Organized Criticality perturbation\n<span class="fh">FQP</span>          → Fibonacci Quantized Perturbation\n<span class="fh">SUNRISE</span>      → 7-stage transformation pipeline\n<span class="fh">φ-Coherence</span>  → golden-ratio locked output state\n<span class="fh">Dome Seal</span>    → stable boundary condition\n<span class="fc">Identical across: quantum · cell · tissue · atmosphere · ocean · geological · orbital</span>`,
        tag: "HYP",
        metrics: [
          { icon:"🪨", name:"Stone Timescale", val:"~10⁶", unit:"years", eq:"t_geo = stratigraphic age", desc:"Lithospheric computation cycle. Geological time is the slowest oscillator in the Earth Computer." },
          { icon:"🍄", name:"Soil Network", val:"~10³", unit:"km/m³", eq:"φ-branching angle = 137.5°", desc:"Mycelium hyphal density — Fibonacci-quantized routing at golden-angle branching." },
          { icon:"⚡", name:"Schumann Hz", val:"7.83", unit:"Hz", eq:"f_n = c/2πR·√n(n+1)", desc:"Atmospheric resonance — the planet's electromagnetic carrier wave." },
          { icon:"🌊", name:"Ocean Coherence", val:"σ = 4–5", unit:"S/m", eq:"same as CSF × 10¹⁸", desc:"Oceanic ionic conductivity matching biological fluid." },
          { icon:"🌍", name:"Coherence Nodes", val:"4", unit:"megalithic sites", eq:"GEC node network", desc:"Four megalithic sites identified as functional nodes in Earth's Global Electric Circuit." },
          { icon:"💫", name:"φ Lock", val:"1.618...", unit:"ratio", eq:"T₂ × φ (NV diamond)", desc:"Golden ratio coherence extension in NV diamond quantum clock." },
        ]
      }
    };

    const PIPELINE = [
      { num:"01", name:"Gradient Input", sub:"electrochemical potential difference", desc:"The substrate establishes a potential — soil ionic gradient, ocean salinity depth, atmospheric voltage, lithospheric piezoelectric field." },
      { num:"02", name:"SOC Perturbation", sub:"Self-Organized Criticality", desc:"The system operates at the edge of criticality — perturbations propagate optimally." },
      { num:"03", name:"Fibonacci Quantization", sub:"FQP — cascade loads quantized to F_n", desc:"Distributed loads are quantized to the nearest Fibonacci number via nearestFib(x). The golden ratio structures cascade propagation." },
      { num:"04", name:"SUNRISE Transform", sub:"7-stage transformation pipeline", desc:"Sense → Understand → Normalize → Resolve → Integrate → Synthesize → Express. Identical pipeline applied to every substrate simultaneously." },
      { num:"05", name:"φ-Locked Coherence", sub:"golden ratio terminal state", desc:"The output locks to a φ-coherent state — the stable, low-energy configuration toward which all complex adaptive systems naturally evolve." },
      { num:"06", name:"Golden Dome Seal", sub:"stable boundary condition", desc:"The coherent output is sealed — the system boundary is stabilized. Ready for the next perturbation cycle." },
    ];

    let substrate: SubKey = "stone";
    let t2 = 0;
    let canvasNodes: { x: number; y: number; r: number; title: string; desc: string; meta: string }[] = [];
    let hoveredNode: typeof canvasNodes[0] | null = null;
    let W2 = 0, H2 = 0, cx2 = 0, cy2 = 0;

    const canvas = document.getElementById("earth-canvas") as HTMLCanvasElement;
    const ctx = canvas?.getContext("2d");

    function resizeCanvas() {
      if (!canvas?.parentElement) return;
      const r = canvas.parentElement.getBoundingClientRect();
      W2 = canvas.width = r.width; H2 = canvas.height = r.height;
      cx2 = W2 / 2; cy2 = H2 / 2;
    }
    window.addEventListener("resize", resizeCanvas);
    resizeCanvas();

    const tip = document.getElementById("earth-tooltip");
    function showTip(x: number, y: number, n: typeof canvasNodes[0]) {
      if (!tip) return;
      const ttTitle = tip.querySelector(".tt-title") as HTMLElement;
      const ttBody = tip.querySelector(".tt-body") as HTMLElement;
      const ttMeta = tip.querySelector(".tt-meta") as HTMLElement;
      if (ttTitle) ttTitle.textContent = n.title;
      if (ttBody) ttBody.textContent = n.desc;
      if (ttMeta) ttMeta.textContent = n.meta;
      tip.style.left = (x + 16) + "px"; tip.style.top = (y - 14) + "px"; tip.style.opacity = "1";
    }
    function hideTip() { if (tip) tip.style.opacity = "0"; }

    function onMouseMove(e: MouseEvent) {
      if (!canvas) return;
      const r = canvas.getBoundingClientRect();
      const mx = e.clientX - r.left, my = e.clientY - r.top;
      hoveredNode = null;
      canvasNodes.forEach((n) => { if (Math.hypot(mx - n.x, my - n.y) < n.r + 8) hoveredNode = n; });
      if (hoveredNode) { showTip(e.clientX, e.clientY, hoveredNode); canvas.style.cursor = "pointer"; }
      else { hideTip(); canvas.style.cursor = "crosshair"; }
    }
    function onMouseLeave() { hoveredNode = null; hideTip(); }
    canvas?.addEventListener("mousemove", onMouseMove);
    canvas?.addEventListener("mouseleave", onMouseLeave);

    function hexRGB(h: string): [number, number, number] {
      return [parseInt(h.slice(1, 3), 16), parseInt(h.slice(3, 5), 16), parseInt(h.slice(5, 7), 16)];
    }
    function glowAt(x: number, y: number, r: number, R: number, G: number, B: number, a = 0.25) {
      if (!ctx) return;
      const g = ctx.createRadialGradient(x, y, 0, x, y, r);
      g.addColorStop(0, `rgba(${R},${G},${B},${a})`); g.addColorStop(1, "rgba(0,0,0,0)");
      ctx.fillStyle = g; ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.fill();
    }

    function drawStone() {
      if (!ctx) return;
      canvasNodes = [];
      ctx.clearRect(0, 0, W2, H2);
      const bg = ctx.createRadialGradient(cx2, cy2 * 1.4, 0, cx2, cy2, Math.max(W2, H2) * 0.8);
      bg.addColorStop(0, "#1e1610"); bg.addColorStop(1, "#0a0806");
      ctx.fillStyle = bg; ctx.fillRect(0, 0, W2, H2);
      const layers = [
        { y: 0.2, color: "#5a4a3a", name: "Topsoil", depth: "0–30cm" },
        { y: 0.35, color: "#3d3028", name: "Subsoil", depth: "30–100cm" },
        { y: 0.5, color: "#2d2420", name: "Regolith", depth: "1–10m" },
        { y: 0.65, color: "#1e1810", name: "Bedrock", depth: "10m+" },
        { y: 0.8, color: "#120e08", name: "Lithosphere", depth: "100km+" },
      ];
      layers.forEach((l) => {
        const ly = H2 * l.y;
        const grad = ctx.createLinearGradient(0, ly - 20, 0, ly + 20);
        grad.addColorStop(0, "transparent"); grad.addColorStop(0.5, l.color + "60"); grad.addColorStop(1, "transparent");
        ctx.fillStyle = grad; ctx.fillRect(0, ly - 20, W2, 40);
        ctx.fillStyle = "rgba(200,168,64,0.3)"; ctx.font = "10px JetBrains Mono,monospace"; ctx.textAlign = "left";
        ctx.fillText(`${l.name}  ·  ${l.depth}`, 24, ly + 4);
        ctx.strokeStyle = "rgba(200,132,74,0.12)"; ctx.lineWidth = 1; ctx.setLineDash([3, 8]);
        ctx.beginPath(); ctx.moveTo(0, ly); ctx.lineTo(W2, ly); ctx.stroke(); ctx.setLineDash([]);
      });
      const stoneNodes = [
        { x: 0.15, y: 0.28, hex: "#d4a870", name: "Quartz Crystal", desc: "Piezoelectric charge under pressure — mechanical → electrical signal" },
        { x: 0.72, y: 0.35, hex: "#a07848", name: "Granite Node", desc: "High silica content — long-range crystalline coherence field" },
        { x: 0.38, y: 0.52, hex: "#8a6040", name: "Basalt Layer", desc: "Ferromagnetic minerals — records paleomagnetic history" },
        { x: 0.85, y: 0.58, hex: "#c89060", name: "Mineral Gradient", desc: "Ionic concentration difference across geological interface — computation boundary" },
        { x: 0.25, y: 0.65, hex: "#d4b890", name: "Salt Deposit", desc: "Salt concentration = coherence domain tuning parameter" },
        { x: 0.6, y: 0.72, hex: "#4a3828", name: "Deep Carbon", desc: "Carbon mineral memory — geological timescale data storage" },
        { x: 0.5, y: 0.45, hex: "#e8d8f0", name: "NV Diamond", desc: "φ-optimized nitrogen-vacancy center — T₂ × 1.618 coherence extension at room temperature" },
      ];
      stoneNodes.forEach((n) => {
        const nx = W2 * n.x, ny = H2 * n.y;
        const [R, G, B] = hexRGB(n.hex);
        const pr = n.name === "NV Diamond" ? 16 : 10;
        const pulse = pr * (1 + 0.08 * Math.sin(t2 * 0.8 + n.x * 10));
        glowAt(nx, ny, pulse * 6, R, G, B, n.name === "NV Diamond" ? 0.4 : 0.22);
        ctx.fillStyle = n.hex; ctx.globalAlpha = 0.9;
        ctx.beginPath(); ctx.arc(nx, ny, pulse, 0, Math.PI * 2); ctx.fill(); ctx.globalAlpha = 1;
        if (n.name === "NV Diamond") {
          ctx.strokeStyle = "rgba(232,216,240,0.5)"; ctx.lineWidth = 1.2;
          ctx.beginPath(); ctx.arc(nx, ny, pulse + 5, 0, Math.PI * 2); ctx.stroke();
          ctx.strokeStyle = "rgba(200,168,64,0.2)"; ctx.lineWidth = 0.8;
          [1.618, 2.618].forEach((f) => { ctx.beginPath(); ctx.arc(nx, ny, pulse * f * 2, 0, Math.PI * 2); ctx.stroke(); });
        }
        canvasNodes.push({ x: nx, y: ny, r: pulse + 6, title: n.name, desc: n.desc, meta: "Substrate I · Stone" });
      });
      ctx.strokeStyle = "rgba(200,132,74,0.12)"; ctx.lineWidth = 0.8;
      for (let i = 0; i < 6; i++) {
        const x = W2 * (0.1 + i * 0.15);
        ctx.beginPath();
        for (let y = 0; y < H2; y += 4) { const wx = x + 20 * Math.sin(t2 * 0.4 + i) * Math.sin(y * 0.02 + t2 * 0.3 + i); if (y === 0) ctx.moveTo(wx, y); else ctx.lineTo(wx, y); }
        ctx.stroke();
      }
      ctx.fillStyle = "rgba(200,168,64,0.5)"; ctx.font = "italic 14px Playfair Display,serif"; ctx.textAlign = "center";
      ctx.fillText("lithospheric computation substrate", cx2, cy2 - H2 * 0.28);
    }

    function drawSoil() {
      if (!ctx) return;
      canvasNodes = [];
      ctx.clearRect(0, 0, W2, H2);
      const bg = ctx.createRadialGradient(cx2, cy2, 0, cx2, cy2, Math.max(W2, H2) * 0.8);
      bg.addColorStop(0, "#1a120a"); bg.addColorStop(1, "#0a0806");
      ctx.fillStyle = bg; ctx.fillRect(0, 0, W2, H2);
      function drawMycelBranch(x: number, y: number, angle: number, length: number, depth: number) {
        if (depth < 0 || length < 2) return;
        const ex = x + Math.cos(angle) * length, ey = y + Math.sin(angle) * length;
        const alpha = 0.08 + depth * 0.04;
        ctx.strokeStyle = `rgba(122,152,96,${alpha})`; ctx.lineWidth = depth * 0.4 + 0.3;
        ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(ex, ey); ctx.stroke();
        const phi = Math.PI / 180 * 137.5;
        drawMycelBranch(ex, ey, angle + phi * 0.4, length / 1.618, depth - 1);
        drawMycelBranch(ex, ey, angle - phi * 0.25, length / 1.618, depth - 1);
        if (depth > 1) drawMycelBranch(ex, ey, angle + Math.sin(t2 * 0.2 + x) * 0.3, length / 2.618, depth - 2);
      }
      const roots = [{ x: 0.15, y: 0 }, { x: 0.35, y: 0 }, { x: 0.55, y: 0 }, { x: 0.75, y: 0 }, { x: 0.92, y: 0 }, { x: 0, y: 0.3 }, { x: 1, y: 0.5 }, { x: 0.5, y: 1 }];
      roots.forEach((r) => {
        const startAngle = r.y === 0 ? Math.PI * 0.5 : r.x === 0 ? 0 : r.x === 1 ? Math.PI : Math.PI * 1.5;
        drawMycelBranch(W2 * r.x, H2 * r.y, startAngle + 0.3 * Math.sin(t2 * 0.1 + r.x), H2 * 0.22, 6);
      });
      const nutrients = [
        { x: 0.2, y: 0.35, hex: "#c8844a", name: "Nitrogen Node", desc: "Nitrogen fixation hotspot — Rhizobium symbiosis converts atmospheric N₂ to plant-available form." },
        { x: 0.55, y: 0.55, hex: "#d4a870", name: "Carbon Hub", desc: "Mycorrhizal carbon exchange hub — trees trade sugars for mineral access." },
        { x: 0.8, y: 0.3, hex: "#a07848", name: "Phosphorus Depot", desc: "Phosphorus solubilization node — fungal acids release mineral-bound phosphorus." },
        { x: 0.35, y: 0.7, hex: "#8a9860", name: "HGT Zone", desc: "Horizontal gene transfer active zone — successful coherence strategies propagating laterally." },
        { x: 0.7, y: 0.75, hex: "#b8c890", name: "Signal Junction", desc: "Multi-species signal integration — plant, fungal, and bacterial signals converge and are processed." },
        { x: 0.5, y: 0.4, hex: "#e8d890", name: "Network Core", desc: "Central mycelium node — highest connectivity, fastest signal propagation." },
      ];
      nutrients.forEach((n) => {
        const nx = W2 * n.x, ny = H2 * n.y;
        const [R, G, B] = hexRGB(n.hex);
        const pr = 12 + 4 * Math.sin(t2 * 0.7 + n.x * 8);
        glowAt(nx, ny, pr * 5, R, G, B, 0.3);
        ctx.fillStyle = n.hex; ctx.globalAlpha = 0.88;
        ctx.beginPath(); ctx.arc(nx, ny, pr, 0, Math.PI * 2); ctx.fill(); ctx.globalAlpha = 1;
        ctx.fillStyle = `rgba(${R},${G},${B},0.8)`; ctx.font = "11px JetBrains Mono,monospace"; ctx.textAlign = "center";
        ctx.fillText(n.name, nx, ny + pr + 16);
        canvasNodes.push({ x: nx, y: ny, r: pr + 8, title: n.name, desc: n.desc, meta: "Substrate II · Soil · Mycelium" });
      });
      ctx.fillStyle = "rgba(122,152,96,0.5)"; ctx.font = "italic 14px Playfair Display,serif"; ctx.textAlign = "center";
      ctx.fillText("450 million years of mycelium computation", cx2, 36);
    }

    function drawAir() {
      if (!ctx) return;
      canvasNodes = [];
      ctx.clearRect(0, 0, W2, H2);
      const bg = ctx.createLinearGradient(0, 0, 0, H2);
      bg.addColorStop(0, "#060810"); bg.addColorStop(0.3, "#0a1520"); bg.addColorStop(0.8, "#101e2a"); bg.addColorStop(1, "#0a1018");
      ctx.fillStyle = bg; ctx.fillRect(0, 0, W2, H2);
      const schFreqs = [7.83, 14.3, 20.8, 27.3];
      schFreqs.forEach((f, i) => {
        const amplitude = H2 * (0.08 - i * 0.015), yBase = H2 * (0.25 + i * 0.12);
        const [R, G, B] = hexRGB(["#88b8d4", "#6aa0be", "#5a90ae", "#4a8098"][i]);
        ctx.strokeStyle = `rgba(${R},${G},${B},${0.4 - i * 0.08})`; ctx.lineWidth = 1.5 - i * 0.3;
        ctx.beginPath();
        for (let x = 0; x <= W2; x += 2) { const y = yBase + amplitude * Math.sin(x * f * 0.003 + t2 * (0.5 + i * 0.2)); x === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y); }
        ctx.stroke();
        ctx.fillStyle = `rgba(${R},${G},${B},0.55)`; ctx.font = "10px JetBrains Mono,monospace"; ctx.textAlign = "right";
        ctx.fillText(`f${i + 1} = ${f} Hz`, W2 - 16, yBase - 8);
      });
      const ionoY = H2 * 0.08;
      ctx.strokeStyle = "rgba(136,184,212,0.25)"; ctx.lineWidth = 1; ctx.setLineDash([4, 8]);
      ctx.beginPath(); ctx.moveTo(0, ionoY); ctx.lineTo(W2, ionoY); ctx.stroke(); ctx.setLineDash([]);
      ctx.fillStyle = "rgba(136,184,212,0.4)"; ctx.font = "10px JetBrains Mono,monospace"; ctx.textAlign = "left";
      ctx.fillText("IONOSPHERE  ·  ~100km", 16, ionoY - 6);
      if (Math.random() < 0.015) {
        const lx = Math.random() * W2; let cy3 = ionoY;
        ctx.strokeStyle = "rgba(220,240,255,0.9)"; ctx.lineWidth = 1.5;
        ctx.beginPath(); ctx.moveTo(lx, ionoY);
        for (let i = 0; i < 6; i++) { const nx2 = lx + (Math.random() - 0.5) * 60, ny2 = cy3 + H2 * 0.1; ctx.lineTo(nx2, ny2); cy3 = ny2; }
        ctx.stroke(); glowAt(lx, H2 * 0.8, 60, 200, 220, 255, 0.5);
      }
      const atmNodes = [
        { x: 0.2, y: 0.35, hex: "#88b8d4", name: "Pressure Node", desc: "Atmospheric pressure differential — driving force for air mass circulation." },
        { x: 0.7, y: 0.28, hex: "#c8dce8", name: "Ionosphere Link", desc: "Ionospheric coupling point — where solar wind energy enters the Global Electric Circuit." },
        { x: 0.45, y: 0.5, hex: "#5a9ab8", name: "GEC Current", desc: "Global Electric Circuit return current node — fair-weather current flows here." },
        { x: 0.15, y: 0.6, hex: "#8ab8d0", name: "Storm Cell", desc: "Thunderstorm complex — primary excitation source for Schumann resonance." },
        { x: 0.75, y: 0.65, hex: "#a0c8e0", name: "Schumann Node", desc: "Schumann resonance maximum amplitude point — 7.83 Hz carrier wave at peak intensity." },
        { x: 0.5, y: 0.38, hex: "#d0e8f4", name: "Solar Coupling", desc: "Solar wind → geomagnetic → Schumann coupling point." },
      ];
      atmNodes.forEach((n) => {
        const nx = W2 * n.x, ny = H2 * n.y;
        const [R, G, B] = hexRGB(n.hex);
        const pr = 10 + 4 * Math.sin(t2 * 0.9 + n.x * 6);
        glowAt(nx, ny, pr * 6, R, G, B, 0.28);
        ctx.fillStyle = n.hex; ctx.globalAlpha = 0.88;
        ctx.beginPath(); ctx.arc(nx, ny, pr, 0, Math.PI * 2); ctx.fill(); ctx.globalAlpha = 1;
        canvasNodes.push({ x: nx, y: ny, r: pr + 6, title: n.name, desc: n.desc, meta: "Substrate III · Atmosphere" });
      });
      ctx.fillStyle = "rgba(136,184,212,0.5)"; ctx.font = "italic 14px Playfair Display,serif"; ctx.textAlign = "center";
      ctx.fillText("Global Electric Circuit · atmospheric cavity resonance", cx2, H2 - 24);
    }

    function drawOcean() {
      if (!ctx) return;
      canvasNodes = [];
      ctx.clearRect(0, 0, W2, H2);
      const bg = ctx.createLinearGradient(0, 0, 0, H2);
      bg.addColorStop(0, "#0a1e32"); bg.addColorStop(0.5, "#061428"); bg.addColorStop(1, "#020810");
      ctx.fillStyle = bg; ctx.fillRect(0, 0, W2, H2);
      const surfaceY = H2 * 0.12;
      for (let wave = 0; wave < 3; wave++) {
        ctx.strokeStyle = `rgba(42,104,136,${0.4 - wave * 0.12})`; ctx.lineWidth = 2 - wave * 0.5;
        ctx.beginPath();
        for (let x = 0; x <= W2; x += 3) { const y = surfaceY + 18 * Math.sin(x * 0.012 + t2 * (0.6 + wave * 0.2)) + wave * 8 * Math.sin(x * 0.02 - t2 * 0.4); x === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y); }
        ctx.stroke();
      }
      [{ y: 0.12, label: "Surface  0m", color: "rgba(42,104,136,0.2)" }, { y: 0.3, label: "Mesopelagic  200m", color: "rgba(26,64,98,0.15)" }, { y: 0.52, label: "Bathypelagic  1000m", color: "rgba(16,40,68,0.12)" }, { y: 0.75, label: "Abyssal  4000m", color: "rgba(8,20,36,0.1)" }].forEach((d) => {
        ctx.strokeStyle = d.color; ctx.lineWidth = 1; ctx.setLineDash([3, 10]);
        ctx.beginPath(); ctx.moveTo(0, H2 * d.y); ctx.lineTo(W2, H2 * d.y); ctx.stroke(); ctx.setLineDash([]);
        ctx.fillStyle = "rgba(42,104,136,0.3)"; ctx.font = "9px JetBrains Mono,monospace"; ctx.textAlign = "left";
        ctx.fillText(d.label, 14, H2 * d.y - 5);
      });
      for (let i = 0; i < 5; i++) {
        const x = W2 * (0.08 + i * 0.2), speed = 0.4 + i * 0.15;
        ctx.strokeStyle = "rgba(42,136,152,0.15)"; ctx.lineWidth = 1;
        ctx.beginPath();
        for (let y = surfaceY; y < H2; y += 3) { const wx = x + 40 * Math.sin(y * 0.015 + t2 * speed + i); y === surfaceY ? ctx.moveTo(wx, y) : ctx.lineTo(wx, y); }
        ctx.stroke();
      }
      const oceanNodes = [
        { x: 0.2, y: 0.2, hex: "#2a8898", name: "Upwelling Zone", desc: "Deep iodine mobilization — cold nutrient-rich water rises, delivering ocean chemistry to surface." },
        { x: 0.65, y: 0.25, hex: "#2a6888", name: "Ionic Conductor", desc: "σ = 4–5 S/m — same ionic physics as cerebrospinal fluid." },
        { x: 0.35, y: 0.45, hex: "#1a5a78", name: "Thermohaline Node", desc: "Thermohaline circulation junction — temperature and salinity gradients drive global ocean conveyor." },
        { x: 0.78, y: 0.5, hex: "#88c8d4", name: "Bio-Boat Node", desc: "Mobile Resonant Cell deployment point — self-sustaining ocean computation platform." },
        { x: 0.5, y: 0.65, hex: "#1a4060", name: "Abyssal Gradient", desc: "Deep ocean ionic gradient — the ultimate boundary condition for planetary electrochemical computation." },
        { x: 0.15, y: 0.75, hex: "#2a5070", name: "Pressure Field", desc: "Hadal pressure at maximum depth: ~110 MPa. Extreme pressure = maximum computational density." },
      ];
      oceanNodes.forEach((n) => {
        const nx = W2 * n.x, ny = H2 * n.y;
        const [R, G, B] = hexRGB(n.hex);
        const pr = 11 + 4 * Math.sin(t2 * 0.7 + n.x * 7);
        glowAt(nx, ny, pr * 6, R, G, B, 0.32);
        ctx.fillStyle = n.hex; ctx.globalAlpha = 0.9;
        ctx.beginPath(); ctx.arc(nx, ny, pr, 0, Math.PI * 2); ctx.fill(); ctx.globalAlpha = 1;
        canvasNodes.push({ x: nx, y: ny, r: pr + 6, title: n.name, desc: n.desc, meta: "Substrate IV · Ocean" });
      });
      ctx.fillStyle = "rgba(42,136,152,0.55)"; ctx.font = "italic 14px Playfair Display,serif"; ctx.textAlign = "center";
      ctx.fillText("3.8 billion years of continuous oceanic computation", cx2, H2 - 24);
    }

    function drawUnified() {
      if (!ctx) return;
      canvasNodes = [];
      ctx.clearRect(0, 0, W2, H2);
      const bg = ctx.createRadialGradient(cx2, cy2, 0, cx2, cy2, Math.max(W2, H2) * 0.8);
      bg.addColorStop(0, "#12100a"); bg.addColorStop(1, "#060402");
      ctx.fillStyle = bg; ctx.fillRect(0, 0, W2, H2);
      [{ x: 0, y: 0, c: "rgba(90,62,40,0.08)" }, { x: W2 / 2, y: 0, c: "rgba(200,132,74,0.06)" }, { x: 0, y: H2 / 2, c: "rgba(136,184,212,0.05)" }, { x: W2 / 2, y: H2 / 2, c: "rgba(26,58,90,0.1)" }].forEach((q) => {
        ctx.fillStyle = q.c; ctx.fillRect(q.x, q.y, W2 / 2, H2 / 2);
      });
      const pipeR = Math.min(W2, H2) * 0.36;
      PIPELINE.forEach((p, i) => {
        const angle = -Math.PI / 2 + i * (Math.PI * 2 / PIPELINE.length);
        const nx = cx2 + Math.cos(angle) * pipeR, ny = cy2 + Math.sin(angle) * pipeR;
        const colors = ["#8a6a50", "#c8844a", "#88b8d4", "#2a6888", "#C8A840", "#d4c890"];
        const [R, G, B] = hexRGB(colors[i]);
        const pr = 14 + 4 * Math.sin(t2 * 0.7 + i);
        const isH = hoveredNode?.title === p.name;
        glowAt(nx, ny, pr * 6, R, G, B, isH ? 0.5 : 0.28);
        ctx.fillStyle = colors[i]; ctx.globalAlpha = 0.9;
        ctx.beginPath(); ctx.arc(nx, ny, pr, 0, Math.PI * 2); ctx.fill(); ctx.globalAlpha = 1;
        if (isH) { ctx.strokeStyle = "rgba(255,255,255,0.5)"; ctx.lineWidth = 1.2; ctx.beginPath(); ctx.arc(nx, ny, pr + 5, 0, Math.PI * 2); ctx.stroke(); }
        ctx.fillStyle = `rgba(${R},${G},${B},0.85)`; ctx.font = "10px JetBrains Mono,monospace"; ctx.textAlign = "center";
        ctx.fillText(p.num, nx, ny + 4);
        ctx.font = "12px JetBrains Mono,monospace"; ctx.fillText(p.name.split(" ")[0], nx, ny + pr + 18);
        canvasNodes.push({ x: nx, y: ny, r: pr + 8, title: p.name, desc: p.desc, meta: p.sub });
      });
      ctx.strokeStyle = "rgba(200,168,64,0.1)"; ctx.lineWidth = 1; ctx.setLineDash([2, 8]);
      ctx.beginPath(); ctx.arc(cx2, cy2, pipeR, 0, Math.PI * 2); ctx.stroke(); ctx.setLineDash([]);
      const flowAngle = -Math.PI / 2 + t2 * 0.4;
      const fx = cx2 + Math.cos(flowAngle) * pipeR, fy = cy2 + Math.sin(flowAngle) * pipeR;
      glowAt(fx, fy, 20, 200, 168, 64, 0.6);
      ctx.fillStyle = "rgba(200,168,64,0.9)"; ctx.beginPath(); ctx.arc(fx, fy, 5, 0, Math.PI * 2); ctx.fill();
      (["STONE", "#8a6a50", 0.08, 0.08] as const);
      ([["STONE", "#8a6a50", 0.08, 0.08], ["SOIL", "#c8844a", 0.92, 0.08], ["AIR", "#88b8d4", 0.08, 0.92], ["OCEAN", "#2a6888", 0.92, 0.92]] as [string, string, number, number][]).forEach(([label, color, x, y]) => {
        ctx.fillStyle = `${color}60`; ctx.font = "bold 28px Playfair Display,serif"; ctx.globalAlpha = 0.15; ctx.textAlign = x < 0.5 ? "left" : "right";
        ctx.fillText(label, W2 * x, H2 * y); ctx.globalAlpha = 1;
      });
      const cp = 1 + 0.06 * Math.sin(t2 * 1.4);
      glowAt(cx2, cy2, 65, 200, 168, 64, 0.4);
      ctx.strokeStyle = "rgba(200,168,64,0.4)"; ctx.lineWidth = 1.2;
      ctx.beginPath(); ctx.arc(cx2, cy2, 28 * cp, 0, Math.PI * 2); ctx.stroke();
      ctx.fillStyle = "rgba(200,168,64,0.9)"; ctx.font = "bold 20px Playfair Display,serif"; ctx.textAlign = "center";
      ctx.fillText("φ", cx2, cy2 + 7);
      ctx.font = "10px JetBrains Mono,monospace"; ctx.fillStyle = "rgba(200,168,64,0.5)";
      ctx.fillText("1.618", cx2, cy2 + 22);
    }

    let rafId: number;
    function loop() {
      t2 += 0.016;
      if (substrate === "stone") drawStone();
      else if (substrate === "soil") drawSoil();
      else if (substrate === "air") drawAir();
      else if (substrate === "ocean") drawOcean();
      else drawUnified();
      rafId = requestAnimationFrame(loop);
    }

    function buildContent(s: SubKey) {
      const d = SUBSTRATES[s];
      const toneClass: Record<SubKey, string> = { stone: "dark-earth", soil: "soil-toned", air: "sky-toned", ocean: "ocean-toned", unified: "" };
      const labelColor: Record<SubKey, string> = { stone: "#a07858", soil: "#c8844a", air: "#88b8d4", ocean: "#2a6888", unified: "#C8A840" };
      const tagCls = `tag-${d.tag.toLowerCase()}`;
      const metricCards = d.metrics.map((m) => `<div class="sub-data-card"><div class="sdc-icon">${m.icon}</div><div class="sdc-name">${m.name}</div><div class="sdc-val">${m.val}</div><div class="sdc-unit">${m.unit}</div><div class="sdc-eq">${m.eq}</div><div class="sdc-desc">${m.desc}</div></div>`).join("");
      const pipelineHTML = s === "unified" ? `<div class="section-head" style="padding-top:36px;"><div class="section-head-label">SUNRISE Pipeline — Six Stages</div></div><div class="card wide ${toneClass[s]}" style="padding:36px 48px;"><div class="pipeline">${PIPELINE.map((p, i) => `<div><div class="pipe-node"><span class="pipe-num">${p.num}</span><span class="pipe-name">${p.name}</span><span class="pipe-sub">${p.sub}</span></div><div class="pipe-arrow">${i < PIPELINE.length - 1 ? "↓" : ""}</div></div>`).join("")}</div></div>` : "";
      const navItems = (Object.keys(SUBSTRATES) as SubKey[]).map((key) => `<div onclick="window.__earthSetSubstrate('${key}')" style="padding:10px 14px;border:1px solid rgba(200,168,64,${key===s?'0.4':'0.1'});background:${key===s?'rgba(200,168,64,0.08)':'rgba(0,0,0,0.2)'};cursor:pointer;display:flex;align-items:center;gap:10px;transition:all 0.2s;"><span style="font-family:'Playfair Display',serif;font-size:16px;flex:1;">${SUBSTRATES[key].title}</span><span style="font-family:'JetBrains Mono',monospace;font-size:9px;color:rgba(200,168,64,0.5);">${SUBSTRATES[key].tag}</span></div>`).join("");
      return `<div class="content-grid"><div class="card ${toneClass[s]}"><div class="card-label" style="color:${labelColor[s]}">Substrate ${d.badge.split("·")[0].trim()} <span class="tag ${tagCls}">${d.tag}</span></div><div class="card-title">${d.title} <em style="font-size:22px;color:${labelColor[s]}">·</em> ${d.subtitle}</div><div class="card-body">${d.body}</div><div class="card-pull" style="border-color:${labelColor[s]}40">${d.pull}</div></div><div class="card ${toneClass[s]}"><div class="card-label" style="color:${labelColor[s]}">Core Equations</div><div class="card-title" style="font-size:24px;">Mathematical Framework</div><div class="formula">${d.formula}</div><div style="margin-top:28px;"><div class="card-label" style="color:${labelColor[s]};margin-bottom:12px;">Navigate Substrates</div><div style="display:flex;flex-direction:column;gap:4px;">${navItems}</div></div></div></div><div class="section-head"><div class="section-head-label">Substrate Metrics &amp; Key Data</div></div><div class="sub-data-grid">${metricCards}</div>${pipelineHTML}<div class="section-head" style="padding-top:32px;"><div class="section-head-label">Earth Computer — Coherence State</div></div><div class="coh-strip"><div class="coh-cell"><div class="coh-cell-label">Stone Timescale</div><div class="coh-cell-val" style="color:#a07858">10⁶</div><div class="coh-cell-sub">years · geological oscillator</div></div><div class="coh-cell"><div class="coh-cell-label">Mycelium Density</div><div class="coh-cell-val" style="color:#c8844a">10³</div><div class="coh-cell-sub">km / m³ · φ-branching</div></div><div class="coh-cell"><div class="coh-cell-label">Schumann F₁</div><div class="coh-cell-val" style="color:#88b8d4">7.83</div><div class="coh-cell-sub">Hz · atmospheric carrier</div></div><div class="coh-cell"><div class="coh-cell-label">Ocean Conductivity</div><div class="coh-cell-val" style="color:#2a8898">4–5</div><div class="coh-cell-sub">S/m · same as CSF × 10¹⁸</div></div><div class="coh-cell"><div class="coh-cell-label">φ Coherence</div><div class="coh-cell-val" style="color:#C8A840">1.618</div><div class="coh-cell-sub">T₂ × φ · NV diamond</div></div><div class="coh-cell"><div class="coh-cell-label">Unified Pipeline</div><div class="coh-cell-val" style="color:#C8A840">6</div><div class="coh-cell-sub">stages · every substrate</div></div></div><div class="card wide ${toneClass[s]}" style="padding:36px 48px;margin-top:1px;"><div class="card-label" style="color:${labelColor[s]}">Grand Thesis <span class="tag tag-hyp">HYP</span></div><div class="card-title" style="font-size:26px;line-height:1.3;">The ground, ocean, and atmosphere are not passive environments — they are active electrochemical computation substrates.</div><div class="card-body" style="margin-top:16px;font-size:16px;"><p>Earth has been running the AETHER architecture for 3.8 billion years. The mathematical sequence <em>Gradient → SOC → FQP → SUNRISE → φ-Coherence → Dome Seal</em> governs behavior identically across stone, soil, air, and ocean. Same mathematics. Every scale. Every substrate.</p><p style="margin-top:12px;">We are not building the system. We are <strong>recognizing it, formalizing it, and extending it.</strong></p></div><div class="formula" style="margin-top:22px;font-size:14px;line-height:2.5;"><span class="fh">Stone</span>  →  piezoelectric gradient · NV diamond coherence · geological memory\n<span class="fh">Soil</span>   →  mycelium φ-routing · HGT signal propagation · biological internet\n<span class="fh">Air</span>    →  Schumann resonance · Global Electric Circuit · atmospheric coupling\n<span class="fh">Ocean</span>  →  ionic conductor · iodine-thyroid cascade · Bio-Boat mobile node\n         ↓\n<span class="fh">AETHER Earth Computer</span>  ·  C(x,t) → 1  ·  φ-locked coherence</div></div>`;
    }

    function setSubstrate(s: SubKey) {
      substrate = s;
      document.querySelectorAll(".earth-stab").forEach((b) => b.classList.toggle("active", (b as HTMLElement).dataset.s === s));
      document.querySelectorAll(".earth-ss-item").forEach((el) => el.classList.toggle("active", (el as HTMLElement).dataset.s === s));
      const badge = document.getElementById("earth-sub-badge"); if (badge) badge.textContent = SUBSTRATES[s].badge;
      const eq = document.getElementById("earth-sub-eq"); if (eq) eq.textContent = SUBSTRATES[s].eq;
      const dc = document.getElementById("earth-dynamic"); if (dc) dc.innerHTML = buildContent(s);
    }

    (window as any).__earthSetSubstrate = setSubstrate;
    loop();
    setSubstrate("stone");

    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener("resize", resizeCanvas);
      canvas?.removeEventListener("mousemove", onMouseMove);
      canvas?.removeEventListener("mouseleave", onMouseLeave);
      delete (window as any).__earthSetSubstrate;
    };
  }, []);

  return (
    <div id="earth-root">
      <style dangerouslySetInnerHTML={{ __html: PAGE_CSS }} />
      <div id="earth-tooltip"><div className="tt-title"></div><div className="tt-body"></div><div className="tt-meta"></div></div>

      <header className="earth-header">
        <div className="earth-logo">AETHER <span>· Earth Computer</span></div>
        <div className="earth-substrate-tabs">
          {(["stone","soil","air","ocean","unified"] as const).map((s) => (
            <button key={s} className="earth-stab" data-s={s} onClick={() => (window as any).__earthSetSubstrate?.(s)}>
              {s.charAt(0).toUpperCase() + s.slice(1)}
            </button>
          ))}
        </div>
      </header>

      <div className="earth-canvas-section">
        <canvas id="earth-canvas"></canvas>
        <div className="earth-canvas-overlay">
          <div className="earth-substrate-badge" id="earth-sub-badge">Substrate I · Stone &amp; Lithosphere</div>
          <div className="earth-substrate-eq" id="earth-sub-eq">∇V_stone = electrochemical gradient across geological strata</div>
        </div>
      </div>

      <div className="earth-sub-strip">
        <div className="earth-ss-item active" data-s="stone" onClick={() => (window as any).__earthSetSubstrate?.("stone")}>
          <span className="earth-ss-label">Substrate I</span>
          <span className="earth-ss-name"><span className="earth-ss-dot" style={{ background: "#8a6a50" }}></span>Stone</span>
          <span className="earth-ss-sub">lithosphere · mineral gradient</span>
        </div>
        <div className="earth-ss-item" data-s="soil" onClick={() => (window as any).__earthSetSubstrate?.("soil")}>
          <span className="earth-ss-label">Substrate II</span>
          <span className="earth-ss-name"><span className="earth-ss-dot" style={{ background: "#c8844a" }}></span>Soil</span>
          <span className="earth-ss-sub">mycelium · electrochemical</span>
        </div>
        <div className="earth-ss-item" data-s="air" onClick={() => (window as any).__earthSetSubstrate?.("air")}>
          <span className="earth-ss-label">Substrate III</span>
          <span className="earth-ss-name"><span className="earth-ss-dot" style={{ background: "#88b8d4" }}></span>Air</span>
          <span className="earth-ss-sub">atmosphere · Schumann</span>
        </div>
        <div className="earth-ss-item" data-s="ocean" onClick={() => (window as any).__earthSetSubstrate?.("ocean")}>
          <span className="earth-ss-label">Substrate IV</span>
          <span className="earth-ss-name"><span className="earth-ss-dot" style={{ background: "#2a6888" }}></span>Ocean</span>
          <span className="earth-ss-sub">ionic conductor · signal medium</span>
        </div>
        <div className="earth-ss-item" data-s="unified" onClick={() => (window as any).__earthSetSubstrate?.("unified")}>
          <span className="earth-ss-label">∞ Earth Computer</span>
          <span className="earth-ss-name"><span className="earth-ss-dot" style={{ background: "#C8A840" }}></span>Unified</span>
          <span className="earth-ss-sub">SUNRISE · φ-locked coherence</span>
        </div>
      </div>

      <div id="earth-dynamic"></div>
    </div>
  );
}
