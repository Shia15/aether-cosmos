import { useEffect, useRef, useState } from "react";

/* ── Palette ── */
const BG     = "#020308";
const PANEL  = "rgba(2,3,8,0.97)";
const BORDER = "#0c0f18";
const GOLD   = "#c9a84c";
const TEXT   = "#b8c8d8";
const MUTED  = "#1e2a3a";
const DIM    = "#0a1220";
const mono   = "'Space Mono', monospace";
const serif  = "'Cinzel', serif";
const body   = "'Crimson Pro', Georgia, serif";

type CanvasTab = "spectrum" | "substrate" | "gradient";

/* ══════════════════════════════════════════
   COMPLETE BIOLUMINESCENT CHANNEL DATA
   20 standard channels + 8 AETHER-extended
   "unknown" / beyond-visual-vocabulary channels
══════════════════════════════════════════ */
interface BioChannel {
  id: number;
  name: string;           // color name (some human-named, some AETHER-coined)
  nm: number;             // peak emission wavelength
  nmRange: [number,number];
  hex: string;            // display colour
  organism: string;       // biological source
  luciferase: string;     // enzyme
  luciferin: string;      // substrate
  quantumYield: string;   // η_Q
  halfLife: string;       // emission half-life
  category: "visible" | "near-ir" | "aether-unknown";
  uses: string;
  aetherRole: string;
  substrate: string;      // best substrate material for this channel
}

const CHANNELS: BioChannel[] = [
  // ── VISIBLE SPECTRUM (human-named) ──
  { id:1,  name:"Proto-Violet",      nm:388, nmRange:[380,400], hex:"#8800cc",
    organism:"Engineered E. coli (de novo luciferase 2024)", luciferase:"NanoLuc-UV variant",
    luciferin:"Furimazine-UV", quantumYield:"0.04", halfLife:"8 min",
    category:"visible", uses:"Cell membrane marker · UV-wavelength deep imaging",
    aetherRole:"Coherence field boundary — edge of C(x,t) visibility range",
    substrate:"DNA hydrogel scaffold" },
  { id:2,  name:"Deep Violet",       nm:420, nmRange:[400,440], hex:"#6633ff",
    organism:"Aequorea victoria (mutant)", luciferase:"Aequorin AQR-420",
    luciferin:"Coelenterazine-420", quantumYield:"0.12", halfLife:"12 min",
    category:"visible", uses:"Nuclear tracking · chromatin imaging",
    aetherRole:"Torsion layer — first resonance above UV threshold",
    substrate:"Silica nanoporous matrix" },
  { id:3,  name:"True Blue",         nm:455, nmRange:[440,470], hex:"#2244ff",
    organism:"Renilla reniformis", luciferase:"RLuc",
    luciferin:"Coelenterazine-h", quantumYield:"0.055", halfLife:"5 min",
    category:"visible", uses:"Classic reporter · protein–protein interaction",
    aetherRole:"Baseline coherence tone — the reference oscillator",
    substrate:"κ-Carrageenan hydrogel" },
  { id:4,  name:"Cerulean",          nm:476, nmRange:[470,490], hex:"#00aaff",
    organism:"Symbiodinium (dinoflagellate)", luciferase:"DinLuc",
    luciferin:"Dinoflagellate luciferin", quantumYield:"0.09", halfLife:"3 min",
    category:"visible", uses:"Sea-milk primary emitter · plankton blooms",
    aetherRole:"Sea milk channel — the original AETHER bioluminescent energy source",
    substrate:"λ-Carrageenan (fluid gel)" },
  { id:5,  name:"Cyan",              nm:493, nmRange:[490,505], hex:"#00ddcc",
    organism:"Gaussia princeps", luciferase:"GLuc",
    luciferin:"Coelenterazine-cp", quantumYield:"0.45", halfLife:"30 min",
    category:"visible", uses:"Secreted reporter · blood-borne sensing",
    aetherRole:"EDL interface tone — seamoss gate channel frequency",
    substrate:"κ-Carrageenan hydrogel" },
  { id:6,  name:"Teal",              nm:512, nmRange:[505,525], hex:"#00cc88",
    organism:"Oplophorus gracilirostris", luciferase:"NanoLuc",
    luciferin:"Furimazine", quantumYield:"0.93", halfLife:"180 min",
    category:"visible", uses:"Highest QY luciferase — ultra-bright compact reporter",
    aetherRole:"Maximum coherence emitter — Q_max node of the bioluminescent lattice",
    substrate:"Mycelium network" },
  { id:7,  name:"Green",             nm:530, nmRange:[525,545], hex:"#44ee44",
    organism:"Photinus pyralis (firefly)", luciferase:"Fluc",
    luciferin:"D-Luciferin", quantumYield:"0.41", halfLife:"60 min",
    category:"visible", uses:"Standard reporter · ATP sensor · in vivo imaging",
    aetherRole:"Primary energy channel — combustion-cycle output colour",
    substrate:"DNA hydrogel scaffold" },
  { id:8,  name:"Chartreuse",        nm:548, nmRange:[545,560], hex:"#aaee00",
    organism:"Click beetle (Pyrophorus plagiophthalamus)", luciferase:"CBG99",
    luciferin:"D-Luciferin variant", quantumYield:"0.38", halfLife:"45 min",
    category:"visible", uses:"Dual-reporter partner to standard green · ratio imaging",
    aetherRole:"Interference grid channel — second arm of constructive overlap",
    substrate:"Gyroid photonic crystal" },
  { id:9,  name:"Yellow-Green",      nm:558, nmRange:[560,575], hex:"#ddee00",
    organism:"Click beetle yellow (CBy)", luciferase:"CBYluc",
    luciferin:"D-Luciferin", quantumYield:"0.36", halfLife:"40 min",
    category:"visible", uses:"Triple-reporter third channel · cancer subclone tracking",
    aetherRole:"Phase-locking secondary — beats against green to form standing node",
    substrate:"Gyroid photonic crystal" },
  { id:10, name:"Amber-Yellow",      nm:572, nmRange:[575,590], hex:"#ffcc00",
    organism:"Pyrearinus termitilluminans", luciferase:"PtLuc",
    luciferin:"D-Luciferin", quantumYield:"0.28", halfLife:"35 min",
    category:"visible", uses:"Warm-shift reporter · tissue-depth optimised",
    aetherRole:"AETHER gold tone — coherence crystallisation colour at C=φ⁻¹",
    substrate:"CaCO₃ crystalline matrix" },
  { id:11, name:"Orange",            nm:594, nmRange:[590,615], hex:"#ff8800",
    organism:"PpyRE8 (firefly variant)", luciferase:"PpyRE8",
    luciferin:"AkaLumine-HCl", quantumYield:"0.22", halfLife:"25 min",
    category:"visible", uses:"Red-shift series #1 · tumour hypoxia imaging",
    aetherRole:"Combustion mid-tone — intermediate burst-event colour",
    substrate:"κ-Carrageenan hydrogel" },
  { id:12, name:"Red-Orange",        nm:617, nmRange:[615,635], hex:"#ff5500",
    organism:"Antares (NanoLuc-RFP fusion)", luciferase:"Antares",
    luciferin:"Diphenylterazine (DTZ)", quantumYield:"0.17", halfLife:"20 min",
    category:"visible", uses:"Deep-tissue penetration · whole-animal imaging",
    aetherRole:"Seamoss iodine overtone — carrageenan absorption window channel",
    substrate:"λ-Carrageenan (fluid gel)" },
  { id:13, name:"Red",               nm:637, nmRange:[635,655], hex:"#ee2222",
    organism:"CeNL (Trichoplusia ni cell line)", luciferase:"CeNL",
    luciferin:"Akalumine", quantumYield:"0.11", halfLife:"18 min",
    category:"visible", uses:"Deepest tissue bioluminescence — no autofluorescence",
    aetherRole:"Thyroid resonance — iodine T3/T4 absorption frequency proxy",
    substrate:"CaCO₃ crystalline matrix" },
  { id:14, name:"Crimson",           nm:655, nmRange:[655,675], hex:"#cc0044",
    organism:"CrimsonLuc (2024 de novo design)", luciferase:"CrimsonLuc",
    luciferin:"HCl-AkaLumine", quantumYield:"0.08", halfLife:"14 min",
    category:"visible", uses:"Newest deep-red channel · 2024 de novo protein design",
    aetherRole:"Crystallisation boundary — last channel before IR void",
    substrate:"Silica nanoporous matrix" },
  // ── NEAR-IR (human words become approximate) ──
  { id:15, name:"Carmine-IR",        nm:690, nmRange:[675,710], hex:"#880033",
    organism:"BphS1 bacteriophytochrome fusion", luciferase:"BphS1-NLuc",
    luciferin:"Biliverdin", quantumYield:"0.06", halfLife:"10 min",
    category:"near-ir", uses:"Bacterial channel · photosynthesis-zone imaging",
    aetherRole:"Photorefractive boundary — Kerr saturation onset wavelength",
    substrate:"Mycelium network" },
  { id:16, name:"Rhodamine-Void",    nm:728, nmRange:[710,750], hex:"#660022",
    organism:"iRFP670 fusion (2025 variant)", luciferase:"iRFP-GLuc",
    luciferin:"Coelenterazine + biliverdin", quantumYield:"0.04", halfLife:"8 min",
    category:"near-ir", uses:"Deep whole-body imaging — 2–3 cm tissue penetration",
    aetherRole:"Void interface — first channel invisible to human eye in dark",
    substrate:"DNA hydrogel scaffold" },
  { id:17, name:"Phantom-IR",        nm:760, nmRange:[750,800], hex:"#440011",
    organism:"Oplophorus IR (2025 engineered)", luciferase:"OplIR",
    luciferin:"Furimazine-IR analog", quantumYield:"0.03", halfLife:"6 min",
    category:"near-ir", uses:"Phantom imaging — no cross-talk with visual channels",
    aetherRole:"Standing wave antinode at sub-mm microwave cavity scale analogue",
    substrate:"Gyroid photonic crystal" },
  // ── AETHER UNKNOWN / BEYOND-VOCABULARY ──
  { id:18, name:"φ-Resonance",       nm:831, nmRange:[815,848], hex:"#330008",
    organism:"φ-Engineered NanoLuc (theoretical · 2026 design target)", luciferase:"φ-Luc",
    luciferin:"φ-Furimazine (φ-ratio chain length)", quantumYield:"~0.02 (projected)", halfLife:"5 min",
    category:"aether-unknown", uses:"AETHER spiral time-imaging · coherence field visualisation",
    aetherRole:"φ×514nm = 831nm — the golden-ratio harmonic of NanoLuc teal. φ-Resonance channel tracks the torsion spiral R(t) expansion through tissue",
    substrate:"κ-Carrageenan + gyroid crystal hybrid" },
  { id:19, name:"Void-Ember",        nm:880, nmRange:[860,920], hex:"#220005",
    organism:"Bacteriophytochrome BphP1 (deep IR variant)", luciferase:"BphP1-IR",
    luciferin:"Biliverdin IX-α (far-IR form)", quantumYield:"~0.015", halfLife:"4 min",
    category:"aether-unknown", uses:"Deep-void tissue imaging · 4–6 cm penetration depth · no visual colour name in human vocabulary",
    aetherRole:"Void-ember: emission in the thermal-near-IR boundary — the carrageenan iodine absorption overtone at 880nm. Seamoss gate Nernst channel for I⁻ anions",
    substrate:"λ-Carrageenan (fluid gel) + iodine-doped" },
  { id:20, name:"Coherence-Node",    nm:940, nmRange:[920,960], hex:"#180004",
    organism:"AETHER synthetic photoprobe (design stage)", luciferase:"CohLuc (C(x,t)-gated)",
    luciferin:"Coherence-sensitive luciferin analog", quantumYield:"~0.01 (field-dependent)", halfLife:"Variable with C(x,t)",
    category:"aether-unknown", uses:"Bioluminescence that intensifies when local coherence C(x,t) > C* — a self-reporting coherence sensor. Emission is the measurement.",
    aetherRole:"The coherence node emitter: when C(x,t)≥φ⁻¹, quantum yield spikes from 0.001→0.01. The living tissue literally glows at its equilibrium point",
    substrate:"DNA hydrogel + coherence field antenna" },
  { id:21, name:"Crystal-IR",        nm:1064, nmRange:[1040,1090], hex:"#0f0002",
    organism:"CaCO₃-coupled synthetic bioluminophore (AETHER Foundations)", luciferase:"CrysLuc",
    luciferin:"Calcite-luciferin (carbonate-conjugated)", quantumYield:"~0.008", halfLife:"3 min",
    category:"aether-unknown", uses:"Nd:YAG wavelength — crystalline CaCO₃ matrix resonance at 1064nm. Birefringent emission: polarisation encodes crystal orientation",
    aetherRole:"Light-as-sculptor channel — emission at the calcite photonic resonance. CaCO₃ crystal formed by bioluminescent pressure (Atlantis/Richat substrate connection)",
    substrate:"CaCO₃ crystalline matrix" },
  { id:22, name:"Mycelium-Dark",     nm:1120, nmRange:[1090,1200], hex:"#0a0001",
    organism:"Panellus stipticus fungal network (SWIR-shifted)", luciferase:"PanLuc-SWIR",
    luciferin:"Caffeic acid SWIR-analog", quantumYield:"~0.006", halfLife:"2 min",
    category:"aether-unknown", uses:"Short-wave IR channel — mycelium wood-wide-web signal tracking in opaque substrate. 6–10 cm penetration",
    aetherRole:"Mycelium gate channel — the fungal network routing signal analogous to neural electric impulse. Encodes mycelium lattice topology in emission pattern",
    substrate:"Mycelium network (Panellus living)" },
  { id:23, name:"Gyroid-Null",       nm:1300, nmRange:[1250,1400], hex:"#050001",
    organism:"Gyroid photonic crystal bio-composite (CUCA v3.0 substrate)", luciferase:"GyroidLuc (theoretical)",
    luciferin:"Gyroid-intercalated luciferin", quantumYield:"~0.004 (bandgap-enhanced)", halfLife:"1 min",
    category:"aether-unknown", uses:"Telecom-window IR — photonic bandgap of gyroid crystal enhances emission at 1300nm. Used in CUCA Hybrid Skin bio-photonic layer",
    aetherRole:"Gyroid null-mode: emission only permitted outside the photonic bandgap. The crystal decides which wavelengths exist — substrate as coherence filter",
    substrate:"Gyroid photonic crystal (CUCA v3.0)" },
  { id:24, name:"φ²-Overtone",       nm:1377, nmRange:[1350,1420], hex:"#030001",
    organism:"AETHER theoretical — φ² harmonic of blue channel (455nm × φ² = 1191nm, rounded to SWIR window)", luciferase:"φ²-Luc (design target)",
    luciferin:"Double-φ chain luciferin", quantumYield:"~0.003", halfLife:"<1 min",
    category:"aether-unknown", uses:"Second golden-ratio overtone of the blue channel. Maps the torsion helix R(t) second rotation period onto wavelength space",
    aetherRole:"The second harmonic of the torsion spiral: φ²×455nm maps the n=2 standing wave mode of the toroidal maser cavity onto bioluminescent wavelength",
    substrate:"κ-Carrageenan + silica hybrid scaffold" },
  { id:25, name:"Substrate-Dark",    nm:1550, nmRange:[1480,1650], hex:"#020000",
    organism:"Deep-SWIR biological emitter (hypothetical coral–luciferase hybrid)", luciferase:"CoralLuc-SWIR",
    luciferin:"Coral carotenoid-luciferin", quantumYield:"~0.002", halfLife:"<1 min",
    category:"aether-unknown", uses:"Optical telecom C-band — bioluminescence at fibre-optic wavelength. Would allow direct biological signal injection into photonic infrastructure",
    aetherRole:"The interface between biology and photonics at the quantum level — the substrate-dark channel is where living matter speaks at the frequency of light-speed data",
    substrate:"Silica nanoporous matrix (photonic fibre-compatible)" },
];

/* ── Substrate materials ── */
interface Substrate {
  id: string; name: string; color: string;
  type: string; density: string; emissionPattern: string;
  nodes: string; porosity: string; aetherLink: string;
  channels: number[]; // channel IDs it best supports
}
const SUBSTRATES: Substrate[] = [
  { id:"kappa-carra", name:"κ-Carrageenan Hydrogel", color:"#44ee88",
    type:"Ionically cross-linked biopolymer gel", density:"1.01–1.06 g/cm³",
    emissionPattern:"Isotropic diffuse — uniform sphere of emission in 4π sr",
    nodes:"~10⁴ luciferin binding sites/cm³", porosity:"60–80% water content",
    aetherRole:"The primary AETHER seamoss substrate — connects bioluminescence to the seamoss gate dielectric and seamoss transceiver",
    channels:[3,5,11,12,18] },
  { id:"lambda-carra", name:"λ-Carrageenan (Fluid Gel)", color:"#2ef0d8",
    type:"Non-gelling, viscous polysaccharide solution", density:"1.00–1.03 g/cm³",
    emissionPattern:"Flow-coupled — emission streaks along fluid shear lines",
    nodes:"~10³ sites/cm³ (mobile)", porosity:"85–95% water",
    aetherRole:"Sea-milk medium — dinoflagellate suspension matrix; fluid carrageenan IS sea milk. Emission tracks fluid vortex topology",
    channels:[4,12,19] },
  { id:"mycelium", name:"Mycelium Network", color:"#c9a84c",
    type:"Living fungal hyphal network (Panellus stipticus)", density:"0.15–0.40 g/cm³",
    emissionPattern:"Filamentary — emission confined to hyphal strands, traces network topology",
    nodes:"~10⁶ fungal nodes/m² hyphal surface", porosity:"90–97% air/water void",
    aetherRole:"Wood-wide-web analogue — mycelium routes bioluminescent signals along network paths like electrical impulses in a neural mesh",
    channels:[6,15,22] },
  { id:"gyroid", name:"Gyroid Photonic Crystal", color:"#9966ff",
    type:"Triply-periodic minimal surface bio-composite (CUCA v3.0)", density:"1.2–1.8 g/cm³",
    emissionPattern:"Bandgap-filtered — only wavelengths outside photonic bandgap are emitted; others are reflected internally",
    nodes:"~10⁸ unit cells/cm³ (gyroid period: 200–400 nm)", porosity:"50% (gyroid geometry)",
    aetherRole:"CUCA Gyroid v3.0 substrate — the photonic crystal selects which wavelengths are emitted. The structure IS the filter. Geometry as information substrate",
    channels:[8,9,17,23] },
  { id:"dna-hydrogel", name:"DNA Hydrogel Scaffold", color:"#ff5580",
    type:"Self-assembled DNA tile hydrogel", density:"1.05–1.12 g/cm³",
    emissionPattern:"Programmable node grid — emission at designed DNA tile junctions, spacing tunable 5–500 nm",
    nodes:"10⁶–10¹² nodes/cm³ (sequence-programmable)", porosity:"70–85%",
    aetherRole:"Programmable coherence lattice — DNA sequence encodes spatial emission pattern. Same lattice stores information AND generates photon emission (DCMA connection)",
    channels:[1,7,16,20] },
  { id:"caco3", name:"CaCO₃ Crystalline Matrix", color:"#e8c020",
    type:"Biogenic calcite/aragonite crystal (coral-inspired)", density:"2.71 g/cm³",
    emissionPattern:"Birefringent — emission is linearly polarised along crystal axes; polarisation encodes orientation",
    nodes:"~10¹⁰ lattice sites/cm³ (crystal periodicity 0.5 nm)", porosity:"<5% (dense crystal)",
    aetherRole:"Light-as-sculptor substrate — the CaCO₃ crystal is formed by photonic pressure (Atlantis CaCO₃ page connection). Bioluminescence feeds back into crystal growth",
    channels:[10,13,21] },
  { id:"silica", name:"Silica Nanoporous Matrix", color:"#66ccff",
    type:"Sol-gel derived mesoporous silica (MCM-41 class)", density:"0.4–0.8 g/cm³",
    emissionPattern:"Nano-confined — luciferin molecules in 2–50 nm pores; quantum yield enhanced by confinement effect",
    nodes:"~10¹² pore sites/cm³ (BET surface: 800–1200 m²/g)", porosity:"40–70%",
    aetherRole:"AQISP coherence substrate — DC-native solar powers silica-embedded luciferase array; silica = SiO₂ of the seamoss gate in solid form",
    channels:[2,14,16,25] },
];

/* ── AETHER gradient types ── */
const GRADIENTS = [
  { name:"φ-Harmonic Series",   desc:"Wavelength series λₙ = λ₀ × φⁿ. Starting from blue (455nm): 455 → 736 → 1192 → 1929 nm. Maps torsion spiral expansion onto wavelength space.", color:"#c9a84c", eq:"λₙ = λ₀ · φⁿ" },
  { name:"Coherence Gradient",  desc:"Emission intensity ∝ C(x,t). Where coherence is high (near equilibrium C*), luciferases fire more. The tissue maps its own C-field in photons.", color:"#44ee88", eq:"I(x,t) ∝ C(x,t) · η_Q" },
  { name:"Density Cascade",     desc:"10 orders of magnitude from crystalline (10¹⁰/cm³) to fluid carrageenan (10³/cm³). Density sets spatial resolution. Log₁₀ density maps the substrate scale.", color:"#2ef0d8", eq:"ρ_node = 10³ → 10¹²/cm³" },
  { name:"Substrate Refractive", desc:"Each substrate has a refractive index n. Higher n → shorter effective wavelength in medium. λ_eff = λ/n. Gyroid n≈1.6 → apparent blue-shift of all channels.", color:"#9966ff", eq:"λ_eff = λ_vacuum / n_substrate" },
  { name:"Quantum Yield Field",  desc:"η_Q ranges 0.002 (substrate-dark) → 0.93 (NanoLuc teal). Gradient maps where in tissue the brightest emission occurs — always at the coherence maximum.", color:"#ff5580", eq:"η_Q(x) = f(C(x,t), T, [S])" },
  { name:"FRET Cascade",         desc:"Donor emits at λ_D → FRET transfer to acceptor at λ_A via Förster resonance. Energy flows downhill in wavelength. Full cascade: violet→blue→cyan→green→red→IR.", color:"#ff9933", eq:"E_FRET = R₀⁶/(R₀⁶+r⁶)" },
];

/* ═══════════════════════════════════════════════════
   CANVAS 1: FULL SPECTRUM WAVELENGTH DISPLAY
   Horizontal band 380–1550nm with animated photon emission
═══════════════════════════════════════════════════ */
function SpectrumCanvas({ activeId, onHover }: { activeId: number; onHover:(id:number)=>void }) {
  const cvRef = useRef<HTMLCanvasElement>(null);
  const raf   = useRef(0);
  const t0    = useRef(0);
  const activeRef = useRef(activeId);
  activeRef.current = activeId;

  useEffect(() => {
    const cv = cvRef.current; if (!cv) return;
    const ctx = cv.getContext("2d"); if (!ctx) return;
    const resize = () => {
      const dpr = Math.min(2, window.devicePixelRatio || 1);
      const r = cv!.getBoundingClientRect();
      cv!.width = r.width*dpr; cv!.height = r.height*dpr;
      ctx!.setTransform(dpr,0,0,dpr,0,0);
    };
    resize(); window.addEventListener("resize", resize);

    type Photon = { ch: BioChannel; x: number; y: number; vy: number; alpha: number; size: number; life: number };
    const photons: Photon[] = [];

    const NM_MIN = 375, NM_MAX = 1600;
    const nmToX = (nm: number, W: number) => ((nm - NM_MIN)/(NM_MAX-NM_MIN)) * W;

    const loop = () => {
      raf.current = requestAnimationFrame(loop);
      t0.current += 0.014;
      const T = t0.current;
      const r = cv!.getBoundingClientRect();
      const W = r.width, H = r.height;
      ctx!.clearRect(0,0,W,H); ctx!.fillStyle = BG; ctx!.fillRect(0,0,W,H);

      // ── Spectrum bar (bottom third) ──
      const barY = H * 0.72, barH = H * 0.18;

      // Background gradient (visible → near-IR → IR)
      const specGrad = ctx!.createLinearGradient(0, barY, W, barY);
      const specStops: [number, string][] = [
        [0, "#7700ff"], [0.08, "#4400ff"], [0.12, "#2244ff"], [0.18, "#00aaff"],
        [0.23, "#00ddcc"], [0.29, "#44ee44"], [0.35, "#aaee00"], [0.41, "#ffcc00"],
        [0.47, "#ff8800"], [0.52, "#ff5500"], [0.58, "#ee2222"], [0.63, "#cc0044"],
        [0.68, "#880033"], [0.73, "#440011"], [0.78, "#220005"],
        [0.82, "#150003"], [0.87, "#0f0002"], [0.92, "#0a0001"], [1.0, "#050000"],
      ];
      specStops.forEach(([s,c]) => specGrad.addColorStop(s, c));
      ctx!.fillStyle = specGrad;
      ctx!.fillRect(0, barY, W, barH);

      // Spectrum border
      ctx!.strokeStyle = MUTED+"80"; ctx!.lineWidth=1;
      ctx!.strokeRect(0, barY, W, barH);

      // ── Channel tick marks on spectrum bar ──
      CHANNELS.forEach(ch => {
        const x = nmToX(ch.nm, W);
        const isActive = activeRef.current === ch.id;
        ctx!.beginPath(); ctx!.moveTo(x, barY - (isActive?14:7)); ctx!.lineTo(x, barY);
        ctx!.strokeStyle = ch.hex + (isActive?"ff":"88"); ctx!.lineWidth = isActive?2:1;
        ctx!.stroke();
        if (isActive || ch.category==="aether-unknown") {
          ctx!.font=`5.5px ${mono}`; ctx!.textAlign="center"; ctx!.fillStyle = ch.hex+"cc";
          ctx!.fillText(`${ch.nm}`, x, barY-16);
          if (isActive) {
            ctx!.font=`5px ${mono}`; ctx!.fillStyle=ch.hex+"99";
            ctx!.fillText(ch.name, x, barY-24);
          }
        }
      });

      // ── Wavelength axis labels ──
      [380,450,500,550,600,650,700,800,900,1000,1100,1300,1550].forEach(nm => {
        const x = nmToX(nm, W);
        ctx!.font=`6px ${mono}`; ctx!.textAlign="center"; ctx!.fillStyle=TEXT+"40";
        ctx!.fillText(`${nm}`, x, barY+barH+11);
      });
      ctx!.font=`6px ${mono}`; ctx!.fillStyle=TEXT+"30";
      ctx!.textAlign="left"; ctx!.fillText("VISIBLE", nmToX(420,W), barY+barH+22);
      ctx!.fillStyle=TEXT+"20";
      ctx!.fillText("NEAR-IR", nmToX(720,W), barY+barH+22);
      ctx!.fillText("SHORT-WAVE IR (AETHER-EXTENDED)", nmToX(900,W), barY+barH+22);

      // ── Photon emission columns (per channel) ──
      CHANNELS.forEach(ch => {
        const x = nmToX(ch.nm, W);
        const isActive = activeRef.current === ch.id;
        const intensity = isActive ? 1.0 : (ch.category==="aether-unknown" ? 0.3 : 0.55);

        // Spawn photons
        if (Math.random() < (isActive?0.35:ch.category==="visible"?0.08:0.03) && photons.length < 200) {
          photons.push({
            ch, x: x + (Math.random()-0.5)*8,
            y: barY - 2, vy: -(1.2 + Math.random()*1.8),
            alpha: intensity * 0.9, size: isActive ? 3.5 : 2, life: 1,
          });
        }

        // Emission column glow
        const colGrad = ctx!.createLinearGradient(0, barY-80, 0, barY);
        colGrad.addColorStop(0, "transparent");
        colGrad.addColorStop(1, ch.hex + Math.round(intensity*50).toString(16).padStart(2,"0"));
        ctx!.fillStyle = colGrad;
        ctx!.fillRect(x - 4, barY-80, 8, 80);
      });

      // ── Active channel highlight bar ──
      const activeCh = CHANNELS.find(c=>c.id===activeRef.current);
      if (activeCh) {
        const x = nmToX(activeCh.nm, W);
        const hlGrad = ctx!.createRadialGradient(x,barY,0,x,barY,60);
        hlGrad.addColorStop(0, activeCh.hex+"50");
        hlGrad.addColorStop(1, "transparent");
        ctx!.fillStyle = hlGrad;
        ctx!.fillRect(x-60, barY-60, 120, 80);
      }

      // ── Update & draw photons ──
      for (let i = photons.length-1; i>=0; i--) {
        const p = photons[i];
        p.y += p.vy; p.vy *= 0.985;
        p.life -= 0.018; p.alpha *= 0.988;
        if (p.life<=0 || p.y < 0) { photons.splice(i,1); continue; }
        ctx!.beginPath(); ctx!.arc(p.x, p.y, p.size, 0, Math.PI*2);
        ctx!.fillStyle = p.ch.hex + Math.round(p.alpha*220).toString(16).padStart(2,"0");
        ctx!.fill();
        // glow ring
        ctx!.beginPath(); ctx!.arc(p.x, p.y, p.size*2.5, 0, Math.PI*2);
        ctx!.fillStyle = p.ch.hex + Math.round(p.alpha*40).toString(16).padStart(2,"0");
        ctx!.fill();
      }

      // ── Active channel info panel ──
      if (activeCh) {
        ctx!.font=`7px ${mono}`; ctx!.textAlign="left"; ctx!.fillStyle=activeCh.hex+"cc";
        ctx!.fillText(`${activeCh.name}  ·  λ=${activeCh.nm}nm  ·  η_Q=${activeCh.quantumYield}  ·  t½=${activeCh.halfLife}`, 8, 18);
        ctx!.font=`6.5px ${mono}`; ctx!.fillStyle=activeCh.hex+"80";
        ctx!.fillText(activeCh.organism, 8, 32);
        ctx!.font=`6px ${mono}`; ctx!.fillStyle=TEXT+"50";
        ctx!.fillText(activeCh.aetherRole, 8, 46);
      }

      // ── Region labels ──
      ctx!.font=`7px ${mono}`; ctx!.textAlign="center";
      ctx!.fillStyle="#ffffff18";
      ctx!.fillText("STANDARD BIOLUMINESCENT PALETTE  (380–680 nm)", nmToX(530,W), H*0.68);
      ctx!.fillStyle="#ffffff0a";
      ctx!.fillText("NEAR-IR", nmToX(760,W), H*0.68);
      ctx!.fillStyle="#ffffff08";
      ctx!.fillText("← AETHER EXTENDED →", nmToX(1100,W), H*0.68);
    };
    loop();

    // Click/hover detection
    const handleMove = (e: MouseEvent) => {
      const rect = cv!.getBoundingClientRect();
      const mx = e.clientX - rect.left;
      const mxFrac = mx / rect.width;
      const nm_hover = NM_MIN + mxFrac*(NM_MAX-NM_MIN);
      let closest = CHANNELS[0], minDist = Infinity;
      CHANNELS.forEach(ch => {
        const d = Math.abs(ch.nm - nm_hover);
        if (d < minDist) { minDist = d; closest = ch; }
      });
      if (minDist < 40) onHover(closest.id);
    };
    cv.addEventListener("mousemove", handleMove);
    return () => {
      cancelAnimationFrame(raf.current);
      window.removeEventListener("resize", resize);
      cv.removeEventListener("mousemove", handleMove);
    };
  }, [onHover]);

  return <canvas ref={cvRef} style={{ display:"block", width:"100%", height:300, cursor:"crosshair" }} />;
}

/* ═══════════════════════════════════════════════════
   CANVAS 2: SUBSTRATE EMISSION DENSITY MAP
   2D spatial emission pattern per substrate
═══════════════════════════════════════════════════ */
function SubstrateCanvas({ substId }: { substId: string }) {
  const cvRef = useRef<HTMLCanvasElement>(null);
  const raf   = useRef(0);
  const t0    = useRef(0);
  const substRef = useRef(substId);
  substRef.current = substId;

  useEffect(() => {
    const cv = cvRef.current; if (!cv) return;
    const ctx = cv.getContext("2d"); if (!ctx) return;
    const resize = () => {
      const dpr = Math.min(2, window.devicePixelRatio || 1);
      const r = cv!.getBoundingClientRect();
      cv!.width = r.width*dpr; cv!.height = r.height*dpr;
      ctx!.setTransform(dpr,0,0,dpr,0,0);
    };
    resize(); window.addEventListener("resize", resize);

    type Node = { x:number; y:number; phase:number; intensity:number; size:number; color:string; linked?:{x:number;y:number}[] };
    let nodes: Node[] = [];
    let lastSubst = "";

    const buildNodes = (W: number, H: number, sid: string) => {
      const subst = SUBSTRATES.find(s=>s.id===sid) || SUBSTRATES[0];
      nodes = [];
      // Pattern depends on substrate type
      if (sid === "kappa-carra") {
        // Isotropic diffuse — Poisson process
        for (let i=0; i<120; i++) nodes.push({
          x:Math.random()*W, y:Math.random()*H,
          phase:Math.random()*Math.PI*2, intensity:0.4+Math.random()*0.6,
          size:1.5+Math.random()*3, color:subst.color,
        });
      } else if (sid === "lambda-carra") {
        // Flow streaks — along sine curves
        for (let i=0; i<80; i++) {
          const xt = Math.random()*W;
          const yt = H*0.1 + Math.random()*H*0.8;
          nodes.push({ x:xt, y:yt, phase:Math.random()*Math.PI*2, intensity:0.5+Math.random()*0.5,
            size:1+Math.random()*2, color:subst.color });
        }
      } else if (sid === "mycelium") {
        // Networked filaments — branching tree
        const buildBranch = (x:number, y:number, angle:number, len:number, depth:number) => {
          if (depth<0 || len<3) return;
          const nx = x + Math.cos(angle)*len, ny = y + Math.sin(angle)*len;
          nodes.push({ x:nx, y:ny, phase:Math.random()*Math.PI*2, intensity:0.3+Math.random()*0.7,
            size:depth+1, color:subst.color, linked:[{x,y}] });
          buildBranch(nx,ny,angle-0.4,len*0.72,depth-1);
          buildBranch(nx,ny,angle+0.35,len*0.68,depth-1);
          if (Math.random()<0.4) buildBranch(nx,ny,angle+0.1,len*0.65,depth-2);
        };
        buildBranch(W*0.5, H*0.95, -Math.PI/2, H*0.18, 5);
        buildBranch(W*0.3, H*0.95, -Math.PI/2.2, H*0.15, 4);
        buildBranch(W*0.7, H*0.95, -Math.PI/1.9, H*0.15, 4);
      } else if (sid === "gyroid") {
        // Periodic grid (gyroid crystal period)
        const periodX = W/14, periodY = H/10;
        for (let ix=0; ix<14; ix++) for (let iy=0; iy<10; iy++) {
          const xo = (ix+0.5)*periodX + Math.sin(iy*1.2)*periodX*0.2;
          const yo = (iy+0.5)*periodY + Math.cos(ix*1.0)*periodY*0.15;
          // Gyroid equation: sin(x)cos(y)+sin(y)cos(z)+sin(z)cos(x) < threshold
          const gval = Math.sin(ix*0.8)*Math.cos(iy*0.8);
          if (Math.abs(gval) < 0.6) continue; // only emit outside bandgap
          nodes.push({ x:xo, y:yo, phase:ix*0.4+iy*0.6, intensity:0.6+Math.abs(gval)*0.4,
            size:2.5, color:subst.color });
        }
      } else if (sid === "dna-hydrogel") {
        // Programmable grid — fibonacci spacing
        const phi = 1.6180339887;
        let r=8, angle=0;
        for (let i=0; i<100; i++) {
          const x = W/2 + r*Math.cos(angle), y = H/2 + r*Math.sin(angle);
          if (x>0&&x<W&&y>0&&y<H) nodes.push({
            x, y, phase:i*0.4, intensity:0.5+0.5*(i%3===0?1:0.3),
            size:2, color:subst.color });
          angle += 2.39996; r += 3/Math.sqrt(i+1); // golden angle spiral
        }
      } else if (sid === "caco3") {
        // Crystal lattice — hexagonal close-packed
        const a = W/16, h = a*Math.sqrt(3)/2;
        for (let row=0; row<12; row++) for (let col=0; col<18; col++) {
          const xo = col*a + (row%2)*a/2;
          const yo = row*h;
          nodes.push({ x:xo, y:yo, phase:(row+col)*0.5, intensity:0.7,
            size:1.8, color:subst.color });
        }
      } else if (sid === "silica") {
        // Nanoporous — dense random close-packing
        for (let i=0; i<200; i++) {
          const x=Math.random()*W, y=Math.random()*H;
          nodes.push({ x, y, phase:Math.random()*Math.PI*2, intensity:0.2+Math.random()*0.5,
            size:1+Math.random()*1.5, color:subst.color });
        }
      }
    };

    const loop = () => {
      raf.current = requestAnimationFrame(loop);
      t0.current += 0.012;
      const T = t0.current;
      const r = cv!.getBoundingClientRect();
      const W = r.width, H = r.height;

      if (substRef.current !== lastSubst) {
        lastSubst = substRef.current;
        buildNodes(W, H, substRef.current);
      }

      ctx!.clearRect(0,0,W,H); ctx!.fillStyle = BG; ctx!.fillRect(0,0,W,H);
      const subst = SUBSTRATES.find(s=>s.id===substRef.current) || SUBSTRATES[0];

      // ── Draw links (mycelium filaments) ──
      nodes.forEach(n => {
        if (n.linked) {
          n.linked.forEach(lk => {
            ctx!.beginPath(); ctx!.moveTo(n.x,n.y); ctx!.lineTo(lk.x,lk.y);
            ctx!.strokeStyle = subst.color+"40"; ctx!.lineWidth=0.8; ctx!.stroke();
          });
        }
      });

      // ── Flow lines (carrageenan fluid) ──
      if (substRef.current === "lambda-carra") {
        for (let i=0; i<6; i++) {
          ctx!.beginPath();
          for (let x=0; x<=W; x+=4) {
            const y = H*(0.15+i*0.14) + Math.sin(x*0.02+T*(0.5+i*0.1))*30;
            if (x===0) ctx!.moveTo(x,y); else ctx!.lineTo(x,y);
          }
          ctx!.strokeStyle = subst.color+"20"; ctx!.lineWidth=1; ctx!.stroke();
        }
      }

      // ── Draw nodes ──
      nodes.forEach(n => {
        const pulse = 0.5 + 0.5*Math.sin(T*2 + n.phase);
        const ia = n.intensity * pulse;
        ctx!.beginPath(); ctx!.arc(n.x, n.y, n.size*3, 0, Math.PI*2);
        ctx!.fillStyle = subst.color + Math.round(ia*30).toString(16).padStart(2,"0");
        ctx!.fill();
        ctx!.beginPath(); ctx!.arc(n.x, n.y, n.size, 0, Math.PI*2);
        ctx!.fillStyle = subst.color + Math.round(ia*220).toString(16).padStart(2,"0");
        ctx!.fill();
      });

      // ── Substrate label ──
      ctx!.font=`8px ${serif}`; ctx!.textAlign="center"; ctx!.fillStyle=subst.color+"cc";
      ctx!.fillText(subst.name, W/2, 18);
      ctx!.font=`6.5px ${mono}`; ctx!.fillStyle=subst.color+"70";
      ctx!.fillText(subst.emissionPattern, W/2, 30);
      ctx!.font=`6px ${mono}`; ctx!.fillStyle=TEXT+"30";
      ctx!.fillText(`density: ${subst.nodes}`, W/2, H-20);
      ctx!.fillText(`porosity: ${subst.porosity}`, W/2, H-10);
    };
    loop();
    return () => { cancelAnimationFrame(raf.current); window.removeEventListener("resize", resize); };
  }, []);

  return <canvas ref={cvRef} style={{ display:"block", width:"100%", height:280 }} />;
}

/* ═══════════════════════════════════════════════════
   CANVAS 3: φ-GRADIENT AND COHERENCE FIELD OVERLAY
═══════════════════════════════════════════════════ */
function GradientCanvas() {
  const cvRef = useRef<HTMLCanvasElement>(null);
  const raf   = useRef(0);
  const t0    = useRef(0);

  useEffect(() => {
    const cv = cvRef.current; if (!cv) return;
    const ctx = cv.getContext("2d"); if (!ctx) return;
    const resize = () => {
      const dpr = Math.min(2, window.devicePixelRatio || 1);
      const r = cv!.getBoundingClientRect();
      cv!.width = r.width*dpr; cv!.height = r.height*dpr;
      ctx!.setTransform(dpr,0,0,dpr,0,0);
    };
    resize(); window.addEventListener("resize", resize);

    const phi = 1.6180339887;
    // φ-harmonic wavelength series from blue 455nm
    const phiSeries = [455, 455*phi, 455*phi*phi, 455*phi*phi*phi].filter(n=>n<1600);

    const loop = () => {
      raf.current = requestAnimationFrame(loop);
      t0.current += 0.011;
      const T = t0.current;
      const r = cv!.getBoundingClientRect();
      const W = r.width, H = r.height;
      ctx!.clearRect(0,0,W,H); ctx!.fillStyle = BG; ctx!.fillRect(0,0,W,H);

      // ── FRET energy cascade (top half) ──
      const cascadeH = H*0.45;
      const nCh = CHANNELS.filter(c=>c.nm<=690);
      nCh.forEach((ch, i) => {
        const xFrac = i/(nCh.length-1);
        const x = xFrac*W;
        // Vertical emission column
        const intensity = 0.4 + 0.6*Math.abs(Math.sin(T*1.5 + i*0.4));
        const colGrad = ctx!.createLinearGradient(0,0,0,cascadeH);
        colGrad.addColorStop(0,"transparent");
        colGrad.addColorStop(1, ch.hex+Math.round(intensity*60).toString(16).padStart(2,"0"));
        ctx!.fillStyle=colGrad;
        ctx!.fillRect(x-W/(nCh.length*2), 0, W/nCh.length, cascadeH);

        // FRET arrow to next channel
        if (i<nCh.length-1) {
          const nextCh = nCh[i+1];
          const nx = (i+1)/(nCh.length-1)*W;
          const arrowY = cascadeH*0.6 + Math.sin(T*0.8+i)*10;
          ctx!.beginPath(); ctx!.moveTo(x,arrowY); ctx!.lineTo(nx,arrowY);
          ctx!.strokeStyle = "#ffffff20"; ctx!.lineWidth=0.8;
          const ad = [4,4]; ctx!.setLineDash(ad); ctx!.stroke(); ctx!.setLineDash([]);
          // Traveling photon along FRET arrow
          const tp = ((T*0.6+i*0.15)%1);
          ctx!.beginPath(); ctx!.arc(x+tp*(nx-x), arrowY, 2.5, 0, Math.PI*2);
          ctx!.fillStyle=ch.hex+"cc"; ctx!.fill();
        }

        // Channel name
        ctx!.font=`5.5px ${mono}`; ctx!.textAlign="center"; ctx!.fillStyle=ch.hex+"80";
        ctx!.fillText(ch.name, x, cascadeH-8);
        ctx!.font=`5px ${mono}`; ctx!.fillStyle=ch.hex+"50";
        ctx!.fillText(`${ch.nm}`, x, cascadeH-18);
      });
      ctx!.font=`6px ${mono}`; ctx!.textAlign="left"; ctx!.fillStyle=TEXT+"30";
      ctx!.fillText("FRET CASCADE →  donor → acceptor → … energy flows to longer λ", 6, 12);

      // Divider
      ctx!.beginPath(); ctx!.moveTo(0,cascadeH); ctx!.lineTo(W,cascadeH);
      ctx!.strokeStyle=MUTED+"50"; ctx!.lineWidth=1; ctx!.stroke();

      // ── φ-harmonic series + coherence gradient (bottom half) ──
      const btY = cascadeH;
      // Coherence field C(x,t) — wave pattern
      for (let x=0; x<W; x+=2) {
        const cohFrac = x/W;
        const C = 0.4 + 0.35*Math.sin(x*0.025 + T*0.4) + 0.15*Math.sin(x*0.06+T*0.7);
        const Cnorm = Math.min(1, Math.max(0, C));
        // Above threshold φ⁻¹: glow
        const aboveThresh = Cnorm > 0.618;
        const ht = H-btY;
        const barH2 = ht*Cnorm;
        const g = ctx!.createLinearGradient(0, btY+ht, 0, btY+ht-barH2);
        g.addColorStop(0, (aboveThresh?"#44ee88":"#9966ff")+"30");
        g.addColorStop(1, (aboveThresh?"#44ee88":"#9966ff")+"00");
        ctx!.fillStyle=g;
        ctx!.fillRect(x, btY+ht-barH2, 2, barH2);
      }

      // Threshold line φ⁻¹
      const threshY = btY + (H-btY)*(1-0.618);
      ctx!.beginPath(); ctx!.moveTo(0,threshY); ctx!.lineTo(W,threshY);
      ctx!.strokeStyle="#44ee8850"; ctx!.lineWidth=1; ctx!.setLineDash([5,7]); ctx!.stroke(); ctx!.setLineDash([]);
      ctx!.font=`6px ${mono}`; ctx!.textAlign="left"; ctx!.fillStyle="#44ee8880";
      ctx!.fillText("C* = φ⁻¹ = 0.618  [coherence threshold — emission above here is AETHER-active]", 6, threshY-4);

      // φ-harmonic wavelength markers
      const nmMin2=380, nmMax2=1600;
      phiSeries.forEach((nm, pi) => {
        const x = ((nm-nmMin2)/(nmMax2-nmMin2))*W;
        const pcolor = [GOLD,"#cc6600","#880033","#440011"][pi];
        ctx!.beginPath(); ctx!.moveTo(x, btY+4); ctx!.lineTo(x, H-6);
        ctx!.strokeStyle=pcolor+"70"; ctx!.lineWidth=1.5; ctx!.stroke();
        ctx!.font=`6px ${serif}`; ctx!.textAlign="center"; ctx!.fillStyle=pcolor+"cc";
        ctx!.fillText(`φ${pi>0?"^"+pi:""} · ${nm.toFixed(0)}nm`, x, btY+16);
        // Pulsing indicator
        const p2 = 0.5+0.5*Math.sin(T*2+pi*1.2);
        ctx!.beginPath(); ctx!.arc(x, btY+26, 4*p2, 0, Math.PI*2);
        ctx!.fillStyle=pcolor+Math.round(p2*120).toString(16).padStart(2,"0"); ctx!.fill();
      });

      // φ series label
      ctx!.font=`6px ${mono}`; ctx!.textAlign="right"; ctx!.fillStyle=GOLD+"60";
      ctx!.fillText("φ-HARMONIC SERIES  λₙ = 455·φⁿ", W-6, btY+16);
      ctx!.font=`6px ${mono}`; ctx!.textAlign="left"; ctx!.fillStyle=TEXT+"25";
      ctx!.fillText("C(x,t) coherence field →", 6, H-10);
    };
    loop();
    return () => { cancelAnimationFrame(raf.current); window.removeEventListener("resize", resize); };
  }, []);

  return <canvas ref={cvRef} style={{ display:"block", width:"100%", height:280 }} />;
}

/* ═══════════════════════════════════════════════════
   MAIN PAGE
═══════════════════════════════════════════════════ */
export default function BioluminescenceSpectrumPage() {
  const [tab, setTab]           = useState<CanvasTab>("spectrum");
  const [activeChannel, setActiveChannel] = useState(6); // NanoLuc teal default
  const [activeSubstrate, setActiveSubstrate] = useState("kappa-carra");
  const [filterCat, setFilterCat] = useState<"all"|"visible"|"near-ir"|"aether-unknown">("all");

  const ch = CHANNELS.find(c=>c.id===activeChannel) || CHANNELS[5];
  const subst = SUBSTRATES.find(s=>s.id===activeSubstrate) || SUBSTRATES[0];

  const panelBox: React.CSSProperties = {
    background:PANEL, border:`1px solid ${BORDER}`,
    borderRadius:2, padding:"10px 12px", marginBottom:10, position:"relative",
  };
  const topLine = (c = GOLD) => (
    <div style={{ position:"absolute",top:0,left:0,right:0,height:1,
      background:`linear-gradient(90deg,${c},transparent)`,opacity:0.4 }} />
  );
  const SH = ({ label, color=GOLD }:{label:string;color?:string}) => (
    <div style={{ fontSize:7,letterSpacing:"0.2em",textTransform:"uppercase",
      color,marginBottom:6,borderBottom:`1px solid ${BORDER}`,paddingBottom:3 }}>
      {label}
    </div>
  );

  const catColors = { all:GOLD, visible:"#44ee44", "near-ir":"#cc0044", "aether-unknown":"#9966ff" };
  const filtered = CHANNELS.filter(c=>filterCat==="all"||c.category===filterCat);

  const tabs: [CanvasTab,string,string][] = [
    ["spectrum",  "FULL SPECTRUM",        "#44ee44"],
    ["substrate", "SUBSTRATE DENSITY",    GOLD     ],
    ["gradient",  "φ-GRADIENT · FRET",    "#9966ff"],
  ];

  return (
    <div style={{ background:BG, minHeight:"100vh", color:TEXT, fontFamily:mono, overflowY:"auto" }}>

      {/* ── HEADER ── */}
      <div style={{ padding:"12px 20px 10px", borderBottom:`1px solid ${BORDER}`,
        background:"rgba(2,3,9,0.98)", position:"sticky", top:0, zIndex:20 }}>
        <div style={{ position:"absolute", bottom:0, left:0, right:0, height:1,
          background:`linear-gradient(90deg,transparent,#7700ff,#2244ff,#00ddcc,#44ee44,#ffcc00,#ff5500,#cc0044,#880033,transparent)`,
          opacity:0.5 }} />
        <div style={{ maxWidth:1500, margin:"0 auto", display:"flex", alignItems:"center",
          justifyContent:"space-between", gap:12, flexWrap:"wrap" }}>
          <div>
            <div style={{ fontSize:7, letterSpacing:"0.2em", color:"#44ee44", marginBottom:3 }}>
              AETHER · BIOLUMINESCENCE · SEA MILK · 25-CHANNEL EXPANDED SPECTRUM · AETHER-UNKNOWN COLOURS
            </div>
            <div style={{ fontFamily:serif, fontSize:19, letterSpacing:2, color:"#fff" }}>
              BIOLUMINESCENCE SPECTRUM
            </div>
            <div style={{ fontFamily:body, fontStyle:"italic", fontSize:11, color:MUTED, marginTop:2 }}>
              20 standard channels · 8 AETHER-extended beyond visual vocabulary · 6 substrate density fields · φ-harmonic & coherence gradients
            </div>
          </div>
          <div style={{ display:"flex", gap:4 }}>
            {tabs.map(([id,label,c])=>(
              <button key={id} onClick={()=>setTab(id)} style={{
                padding:"6px 12px", fontFamily:mono, fontSize:8, letterSpacing:"0.1em",
                cursor:"pointer", borderRadius:2, transition:"all 0.15s",
                border:`1px solid ${tab===id?c:BORDER}`,
                background:tab===id?`${c}18`:"transparent",
                color:tab===id?c:MUTED }}>
                {label}
              </button>
            ))}
          </div>
          <div style={{ fontFamily:body, fontStyle:"italic", fontSize:10, color:MUTED,
            maxWidth:240, lineHeight:1.65 }}>
            No photobleaching · No autofluorescence · Ultra-low power (chemical energy only) · Deep-tissue penetration · 2024–2026 advances + AETHER-extended unknown channels
          </div>
        </div>
      </div>

      {/* ── BODY ── */}
      <div style={{ maxWidth:1500, margin:"0 auto", padding:"14px 20px 32px",
        display:"grid", gridTemplateColumns:"270px 1fr 270px", gap:12 }}>

        {/* ══ LEFT ══ */}
        <div>
          {/* Category filter */}
          <div style={panelBox}>
            {topLine("#44ee44")}
            <SH label="Channel Filter" color="#44ee44" />
            <div style={{ display:"flex", gap:4, flexWrap:"wrap", marginBottom:8 }}>
              {(["all","visible","near-ir","aether-unknown"] as const).map(cat=>(
                <button key={cat} onClick={()=>setFilterCat(cat)} style={{
                  padding:"4px 8px", fontSize:7, fontFamily:mono, cursor:"pointer",
                  border:`1px solid ${filterCat===cat?catColors[cat]:BORDER}`,
                  background:filterCat===cat?`${catColors[cat]}18`:"transparent",
                  color:filterCat===cat?catColors[cat]:MUTED, borderRadius:2 }}>
                  {cat}
                </button>
              ))}
            </div>
            <div style={{ maxHeight:480, overflowY:"auto" }}>
              {filtered.map(c2=>(
                <div key={c2.id} onClick={()=>setActiveChannel(c2.id)} style={{
                  display:"flex", alignItems:"center", gap:7, padding:"5px 7px",
                  marginBottom:3, cursor:"pointer",
                  background:activeChannel===c2.id?`${c2.hex}10`:"transparent",
                  border:`1px solid ${activeChannel===c2.id?c2.hex:BORDER}`,
                  borderRadius:2, transition:"all 0.12s" }}>
                  <div style={{ width:12, height:12, borderRadius:"50%",
                    background:c2.hex, flexShrink:0,
                    boxShadow:activeChannel===c2.id?`0 0 8px ${c2.hex}`:"none" }} />
                  <div style={{ flex:1, minWidth:0 }}>
                    <div style={{ display:"flex", justifyContent:"space-between" }}>
                      <div style={{ fontSize:8, color:c2.hex, fontWeight:"bold" }}>{c2.name}</div>
                      <div style={{ fontSize:7, color:MUTED }}>{c2.nm}nm</div>
                    </div>
                    <div style={{ fontSize:7, color:MUTED, overflow:"hidden",
                      textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{c2.luciferase}</div>
                  </div>
                  {c2.category==="aether-unknown" && (
                    <div style={{ fontSize:6, color:"#9966ff", padding:"1px 4px",
                      border:"1px solid #9966ff40", borderRadius:2, flexShrink:0 }}>
                      AETHER
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ══ CENTER ══ */}
        <div>
          {/* Canvas */}
          <div style={{ ...panelBox, padding:0, overflow:"hidden" }}>
            <div style={{ padding:"6px 12px 5px", borderBottom:`1px solid ${BORDER}`,
              display:"flex", justifyContent:"space-between" }}>
              <div style={{ fontSize:7, color:MUTED, letterSpacing:"0.13em", textTransform:"uppercase" }}>
                {tab==="spectrum"  ? "Hover spectrum bar to inspect channel · 380–1550nm · photon emission rising from each channel" :
                 tab==="substrate" ? `${subst.name} · ${subst.emissionPattern}` :
                 "FRET cascade (top) · φ-harmonic series + coherence field (bottom)"}
              </div>
              <div style={{ fontSize:8, color:tab==="spectrum"?"#44ee44":tab==="substrate"?GOLD:"#9966ff" }}>
                {tab==="spectrum"?`${ch.name} · ${ch.nm}nm`:tab==="substrate"?subst.density:"λₙ=455·φⁿ"}
              </div>
            </div>
            {tab==="spectrum"  && <SpectrumCanvas activeId={activeChannel} onHover={setActiveChannel} />}
            {tab==="substrate" && <SubstrateCanvas substId={activeSubstrate} />}
            {tab==="gradient"  && <GradientCanvas />}
          </div>

          {/* Active channel detail */}
          <div style={{ ...panelBox, border:`1px solid ${ch.hex}35` }}>
            {topLine(ch.hex)}
            <div style={{ display:"flex", gap:12, alignItems:"flex-start" }}>
              <div style={{ width:36, height:36, borderRadius:"50%", background:ch.hex,
                flexShrink:0, boxShadow:`0 0 16px ${ch.hex}80, 0 0 4px ${ch.hex}` }} />
              <div style={{ flex:1 }}>
                <div style={{ display:"flex", gap:10, marginBottom:4, flexWrap:"wrap" }}>
                  <div style={{ fontFamily:serif, fontSize:15, color:ch.hex }}>{ch.name}</div>
                  <div style={{ fontSize:8, color:MUTED, padding:"2px 8px",
                    border:`1px solid ${ch.hex}30`, borderRadius:2 }}>
                    {ch.nm}nm · {ch.nmRange[0]}–{ch.nmRange[1]}nm
                  </div>
                  <div style={{ fontSize:8, padding:"2px 8px",
                    border:`1px solid ${ch.category==="aether-unknown"?"#9966ff":"#44ee8840"}`,
                    background:ch.category==="aether-unknown"?"#9966ff10":"transparent",
                    color:ch.category==="aether-unknown"?"#9966ff":"#44ee8880", borderRadius:2 }}>
                    {ch.category}
                  </div>
                </div>
                <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:6, marginBottom:6 }}>
                  {[["Organism",ch.organism],["Luciferase",ch.luciferase],
                    ["Luciferin",ch.luciferin],["η_Q",ch.quantumYield],
                    ["Half-life",ch.halfLife],["Best Substrate",ch.substrate],
                  ].map(([k,v])=>(
                    <div key={k} style={{ padding:"4px 6px", background:DIM, borderRadius:2 }}>
                      <div style={{ fontSize:6, color:MUTED, marginBottom:1 }}>{k}</div>
                      <div style={{ fontSize:8, color:ch.hex }}>{v}</div>
                    </div>
                  ))}
                </div>
                <div style={{ padding:"6px 8px", background:`${ch.hex}07`,
                  border:`1px solid ${ch.hex}20`, borderRadius:2 }}>
                  <div style={{ fontSize:7, color:MUTED, marginBottom:2 }}>AETHER ROLE</div>
                  <div style={{ fontFamily:body, fontSize:10, color:TEXT, lineHeight:1.7 }}>{ch.aetherRole}</div>
                </div>
                <div style={{ marginTop:5, padding:"5px 8px",
                  borderLeft:`2px solid ${ch.hex}50`, background:`${ch.hex}04` }}>
                  <div style={{ fontSize:7, color:MUTED, marginBottom:1 }}>APPLICATIONS</div>
                  <div style={{ fontFamily:body, fontSize:10, color:MUTED }}>{ch.uses}</div>
                </div>
              </div>
            </div>
          </div>

          {/* Gradient reference */}
          <div style={panelBox}>
            {topLine("#9966ff")}
            <SH label="AETHER Gradient Types" color="#9966ff" />
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:6 }}>
              {GRADIENTS.map(g=>(
                <div key={g.name} style={{ padding:"6px 8px",
                  borderLeft:`2px solid ${g.color}50`, background:`${g.color}05`, borderRadius:2 }}>
                  <div style={{ fontSize:7, fontWeight:"bold", color:g.color, marginBottom:1 }}>{g.name}</div>
                  <div style={{ fontFamily:serif, fontSize:8, color:g.color, marginBottom:3 }}>{g.eq}</div>
                  <div style={{ fontFamily:body, fontSize:9, color:MUTED, lineHeight:1.5 }}>{g.desc}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ══ RIGHT ══ */}
        <div>
          {/* Substrate selector */}
          <div style={panelBox}>
            {topLine(GOLD)}
            <SH label="Substrate Material · Click to Explore" color={GOLD} />
            {SUBSTRATES.map(s=>(
              <div key={s.id} onClick={()=>{ setActiveSubstrate(s.id); setTab("substrate"); }} style={{
                marginBottom:6, padding:"7px 9px", cursor:"pointer",
                background:activeSubstrate===s.id?`${s.color}10`:"transparent",
                border:`1px solid ${activeSubstrate===s.id?s.color:BORDER}`,
                borderRadius:2, transition:"all 0.13s" }}>
                <div style={{ display:"flex", justifyContent:"space-between", marginBottom:3 }}>
                  <div style={{ fontSize:8, fontWeight:"bold", color:s.color }}>{s.name}</div>
                  <div style={{ fontSize:7, color:MUTED }}>{s.density}</div>
                </div>
                <div style={{ fontSize:7, color:MUTED, marginBottom:2 }}>{s.type}</div>
                {activeSubstrate===s.id && (
                  <>
                    <div style={{ fontFamily:body, fontSize:9, color:TEXT, lineHeight:1.5, marginBottom:3 }}>
                      {s.emissionPattern}
                    </div>
                    <div style={{ fontSize:7, color:s.color, opacity:0.7 }}>Nodes: {s.nodes}</div>
                    <div style={{ fontFamily:body, fontSize:9, color:MUTED, marginTop:4, lineHeight:1.5 }}>
                      {s.aetherRole}
                    </div>
                    <div style={{ display:"flex", gap:3, flexWrap:"wrap", marginTop:5 }}>
                      {s.channels.map(cid=>{
                        const ch2=CHANNELS.find(c2=>c2.id===cid);
                        return ch2 ? (
                          <div key={cid} onClick={e=>{e.stopPropagation();setActiveChannel(cid);}} style={{
                            padding:"2px 6px", fontSize:7, cursor:"pointer",
                            border:`1px solid ${ch2.hex}40`, borderRadius:2,
                            color:ch2.hex, background:`${ch2.hex}10` }}>
                            {ch2.name} {ch2.nm}nm
                          </div>
                        ) : null;
                      })}
                    </div>
                  </>
                )}
              </div>
            ))}
          </div>

          {/* AETHER synthesis */}
          <div style={{ ...panelBox, border:`1px solid #44ee8830` }}>
            {topLine("#44ee88")}
            <SH label="AETHER Synthesis · Bioluminescence" color="#44ee88" />
            <div style={{ fontFamily:body, fontSize:11, color:TEXT, lineHeight:1.85 }}>
              The standard 20-channel palette ends at ~680nm — the edge of human visual experience. AETHER extends this into territory that has no colour names in any human language. The <span style={{ color:"#9966ff" }}>φ-resonance channel</span> at 831nm is the golden-ratio harmonic of NanoLuc teal — the torsion spiral R(t) mapped onto wavelength. The <span style={{ color:"#220005" }}>void-ember</span> at 880nm corresponds to the carrageenan iodine (I⁻) anion absorption overtone — the seamoss gate in photonic form.
            </div>
            <div style={{ marginTop:8, padding:"7px 9px",
              background:"#9966ff08", border:"1px solid #9966ff20", borderRadius:2 }}>
              <div style={{ fontFamily:serif, fontSize:10, color:"#9966ff", marginBottom:3 }}>The Coherence-Node emitter (940nm)</div>
              <div style={{ fontFamily:body, fontSize:10, color:MUTED, lineHeight:1.65 }}>
                A luciferase whose quantum yield is field-dependent: η_Q ∝ C(x,t). Where coherence exceeds φ⁻¹, the enzyme fires. Living tissue literally glows at its own equilibrium points. The bioluminescent emission IS the coherence measurement — no external sensor needed.
              </div>
            </div>
            <div style={{ marginTop:6, padding:"7px 9px",
              background:"#33000508", border:"1px solid #33000520", borderRadius:2 }}>
              <div style={{ fontFamily:serif, fontSize:10, color:GOLD, marginBottom:3 }}>
                Substrate-Dark (1550nm) — fibre-optic bioluminescence
              </div>
              <div style={{ fontFamily:body, fontSize:10, color:MUTED, lineHeight:1.65 }}>
                The optical telecom C-band. A bioluminescent emitter at 1550nm would inject biological signals directly into silica optical fibre — no transducer needed. Living matter speaking at the frequency of light-speed data infrastructure.
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
