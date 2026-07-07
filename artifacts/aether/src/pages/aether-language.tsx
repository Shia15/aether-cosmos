import { useState, useMemo, useRef, useEffect } from "react";

// ── Palette ───────────────────────────────────────────────────────────────────
const C = {
  phi:  "#fbbf24",
  var:  "#06b6d4",
  op:   "#22c55e",
  fn:   "#c084fc",
  vec:  "#ec4899",
  num:  "#f97316",
  coh:  "#00ff88",
  lqg:  "#60a5fa",
};
const GOLD  = "#f2c354";
const BG    = "#020c18";
const PANEL = "rgba(4,16,36,0.92)";
const BRD   = "rgba(242,195,84,0.14)";
const MONO  = "'DM Mono',monospace";
const SERIF = "'Georgia',serif";

// ── Types ─────────────────────────────────────────────────────────────────────
type Tab = "alphabet" | "grammar" | "lexicon" | "lens" | "index";

interface Sym {
  sym: string; name: string; color: string; stype: string;
  meaning: string; val?: string; eqs?: string[];
}

interface Rule {
  lhs: string; rhs: string; note: string; color: string;
}

interface Term {
  id: string; label: string; domain: string; layer: string;
  color: string; def: string;
}

// ── Symbol catalogue ──────────────────────────────────────────────────────────
const SYMBOLS: Sym[] = [
  // Golden / Constant
  { sym:"φ",        stype:"phi",  color:C.phi, name:"Golden ratio",            val:"1.6180339887…", meaning:"Foundation of AETHER phyllotaxis, spiral geometry, gate periods, and amplitude scaling.", eqs:["Golden Ratio φ","Fibonacci Spiral","Golden Gate","AETHER Wave","Fibonacci Toroidal Wave","Solar Power","Pigment Diffusion","CUCA Geometry"] },
  { sym:"γ",        stype:"phi",  color:C.phi, name:"Barbero-Immirzi",         val:"0.2375",         meaning:"LQG parameter fixing black-hole entropy. Also AETHER wave damping coefficient at Planck limit.", eqs:["LQG Area Eigenvalue","AETHER Wave","CUCA Geometry"] },
  { sym:"π",        stype:"phi",  color:C.phi, name:"Pi",                      val:"3.14159…",       meaning:"Circle constant appearing in golden-angle formula (2π/φ) and Fibonacci gate period.", eqs:["Golden Gate","Fibonacci Spiral"] },
  { sym:"ℏ",        stype:"phi",  color:C.phi, name:"Reduced Planck constant", val:"1.055×10⁻³⁴ J·s", meaning:"Fundamental quantum of action. Governs all quantum mechanics; appears in Planck length and BH entropy.", eqs:["Planck Length","Bekenstein-Hawking Entropy"] },
  { sym:"k_B",      stype:"phi",  color:C.phi, name:"Boltzmann constant",      val:"1.381×10⁻²³ J/K", meaning:"Converts temperature to energy. Anchors the black-hole entropy scale.", eqs:["Bekenstein-Hawking Entropy"] },
  { sym:"K",        stype:"phi",  color:C.phi, name:"Gain matrix",             val:"tuning param",   meaning:"Proportional feedback gain in CLCS control law. Larger K = faster correction but risk overshoot.", eqs:["CLCS Control Law"] },
  { sym:"N",        stype:"phi",  color:C.phi, name:"Oscillator count",        val:"89 or 144",      meaning:"Total agents/plants/nodes. Fibonacci numbers (89, 144) give maximum φ-packing density.", eqs:["Kuramoto ψ","Fibonacci Spiral","Resonant Power"] },
  { sym:"α",        stype:"phi",  color:C.phi, name:"Linear dispersion",       val:"field param",    meaning:"Governs linear coupling between amplitude and phase gradients in CGLE. Controls wave speed.", eqs:["Complex Ginzburg-Landau"] },
  { sym:"β",        stype:"phi",  color:C.phi, name:"Nonlinear dispersion",    val:"field param",    meaning:"Nonlinear frequency shift. β > 1 triggers Benjamin-Feir instability — spiral chaos.", eqs:["Complex Ginzburg-Landau"] },
  { sym:"137.508°", stype:"phi",  color:C.phi, name:"Golden angle",            val:"360°/φ²",        meaning:"The only angle that never repeats modulo a circle. Used for zero-waste spiral plant placement.", eqs:["Fibonacci Spiral"] },
  // State variables
  { sym:"x",        stype:"var",  color:C.var, name:"System state",            meaning:"Generic state of the AETHER system. ẋ = v(x) + u_input + u_control in the CLCS law.", eqs:["CLCS Control Law"] },
  { sym:"A₀",       stype:"var",  color:C.var, name:"Initial amplitude",       meaning:"Seed amplitude at the centre of the spiral farm. Broadcasts outward along φ-spiral arms.", eqs:["Fibonacci Toroidal Wave"] },
  { sym:"Cᵢ",       stype:"var",  color:C.var, name:"Pigment concentration",   meaning:"Concentration of ith pigment fraction in granular soil. ∈ [0, 1]. Driven by field coupling.", eqs:["Granular Pigment Diffusion"] },
  { sym:"Dᵢ",       stype:"var",  color:C.var, name:"Diffusivity of pigment i", meaning:"Governs Fickian spreading of pigment i through granular soil gaps.", eqs:["Granular Pigment Diffusion"] },
  { sym:"rₙ",       stype:"var",  color:C.var, name:"Radial position",         meaning:"rₙ = R√(n/N). Grows as √n for equal-area ring packing.", eqs:["Fibonacci Spiral"] },
  { sym:"c",        stype:"var",  color:C.var, name:"Speed of light",          val:"2.998×10⁸ m/s",  meaning:"Universal speed limit. Appears in wave propagation c²∇²ψ, Planck length c³, BH entropy c³.", eqs:["Planck Length","AETHER Wave","Fibonacci Toroidal Wave"] },
  { sym:"G",        stype:"var",  color:C.var, name:"Newton gravitational const", val:"6.674×10⁻¹¹ N·m²/kg²", meaning:"Couples mass to spacetime curvature. Appears in Planck length and BH entropy.", eqs:["Planck Length","Bekenstein-Hawking Entropy"] },
  { sym:"P₀",       stype:"var",  color:C.var, name:"Baseline power",          meaning:"Standard solar panel output without coherence gating. P_free ≥ P₀ always.", eqs:["Resonant Power"] },
  { sym:"Gₛ",       stype:"var",  color:C.var, name:"Solar irradiance",        val:"900–1000 W/m²",  meaning:"Power density of sunlight before panel losses. Modulated by cosine of incidence angle δ.", eqs:["Solar Power"] },
  { sym:"j",        stype:"var",  color:C.var, name:"Spin quantum number",     meaning:"j ∈ {½, 1, 3/2, 2, …}. Labels SU(2) irreps in LQG spin networks.", eqs:["LQG Area Eigenvalue"] },
  // Operators
  { sym:"∂",        stype:"op",   color:C.op,  name:"Partial derivative",      meaning:"Rate of change with respect to one variable. ∂A/∂t = how A evolves in time.", eqs:["Complex Ginzburg-Landau","AETHER Wave","Granular Pigment Diffusion"] },
  { sym:"∇²",       stype:"op",   color:C.op,  name:"Laplacian",               meaning:"Spatial second-derivative — sum of curvatures in all directions. Drives diffusion and wave propagation.", eqs:["Complex Ginzburg-Landau","AETHER Wave","CLCS Control Law","Granular Pigment Diffusion"] },
  { sym:"Σ",        stype:"op",   color:C.op,  name:"Summation",               meaning:"Sum over all oscillators/wave-packets. Central to Kuramoto ψ and resonant power.", eqs:["Kuramoto ψ","Resonant Power"] },
  { sym:"|·|",      stype:"op",   color:C.op,  name:"Modulus / magnitude",     meaning:"Length of a vector. |E(t)|/|X*(t)| gives the normalized error in coherence metric.", eqs:["Kuramoto ψ","AETHER Coherence Metric"] },
  { sym:"ẋ",        stype:"op",   color:C.op,  name:"Time derivative of x",    meaning:"How fast the system state moves. = natural flow + intention + coherence correction.", eqs:["CLCS Control Law"] },
  { sym:"□",        stype:"op",   color:C.op,  name:"d'Alembertian operator",  meaning:"Wave operator □ = ∂²/∂t² − c²∇². Boundary condition symbol in AETHER Engine equation.", eqs:["AETHER Engine"] },
  { sym:"⊗",        stype:"op",   color:C.op,  name:"Tensor product",          meaning:"Combines two fields into a joint field. Appears in AETHER matter manifestation integral.", eqs:["AETHER Engine"] },
  { sym:"Σᵢ vᵢdᵢ", stype:"op",   color:C.op,  name:"VOC deformation sum",     meaning:"Each VOC compound pushes geometry in direction dᵢ with magnitude vᵢ. Biochemistry shapes form.", eqs:["CUCA Geometry"] },
  // Functions
  { sym:"sin",      stype:"fn",   color:C.fn,  name:"Sine",                    meaning:"Periodic oscillation. sin(θ) appears in Fibonacci toroidal wave and CUCA Z-modulation.", eqs:["Fibonacci Toroidal Wave","CUCA Geometry"] },
  { sym:"cos",      stype:"fn",   color:C.fn,  name:"Cosine",                  meaning:"Phase projection. cos²(·) is the coherence gate function; cos(δ) is solar incidence angle.", eqs:["Golden Gate","Solar Power","CUCA Geometry"] },
  { sym:"exp",      stype:"fn",   color:C.fn,  name:"Exponential",             meaning:"e^x. Appears as e^(iθ_k) in Kuramoto phasor and e^(−θ/20) angular damping in toroidal wave.", eqs:["Kuramoto ψ","Fibonacci Toroidal Wave"] },
  { sym:"√",        stype:"fn",   color:C.fn,  name:"Square root",             meaning:"√n in radial placement; √(ℏG/c³) defining Planck length; √(j(j+1)) Casimir operator.", eqs:["Fibonacci Spiral","Planck Length","LQG Area Eigenvalue","Golden Ratio φ"] },
  { sym:"R₃₆₉",    stype:"fn",   color:C.fn,  name:"Toroidal vortex operator", meaning:"R₃₆₉(ψ) = sin(9θ)·exp(−0.05θ). Captures Tesla 3-6-9 resonance in spiral media.", eqs:["AETHER Wave"] },
  { sym:"cos²",     stype:"fn",   color:C.fn,  name:"Squared cosine (gate)",   meaning:"Periodic maxima at Fibonacci phase resonances. Gate passes when cos² > 0.8.", eqs:["Golden Gate"] },
  // Vectors / Phase
  { sym:"θₙ",       stype:"vec",  color:C.vec, name:"Angular position",        meaning:"θₙ = n × 137.508°. Golden angle placement in the Fibonacci spiral geometry.", eqs:["Fibonacci Spiral","Fibonacci Toroidal Wave"] },
  { sym:"E(t)",     stype:"vec",  color:C.vec, name:"Error vector",            meaning:"E(t) = X*(t) − X(t). Distance from desired state. Drives CLCS correction u = K·E.", eqs:["AETHER Coherence Metric","CLCS Control Law"] },
  { sym:"u_input",  stype:"vec",  color:C.vec, name:"Intention injection",     meaning:"External goal vector. Modifies the natural vector field — a deliberate act of coherence.", eqs:["CLCS Control Law"] },
  { sym:"u_ctrl",   stype:"vec",  color:C.vec, name:"Coherence correction",    meaning:"Proportional feedback u = K·E. Aligns the system toward X* without forcing.", eqs:["CLCS Control Law"] },
  { sym:"ξₙ",       stype:"vec",  color:C.vec, name:"Incoherence noise",       meaning:"Random perturbation scaled by (1−C). At C=1 geometry is perfect; at C=0 it dissolves.", eqs:["CUCA Geometry"] },
  { sym:"dᵢ",       stype:"vec",  color:C.vec, name:"VOC direction vector",    meaning:"Unit direction in which the ith VOC compound deforms the CUCA geometry.", eqs:["CUCA Geometry"] },
  // Numbers / Indices
  { sym:"0.618",    stype:"num",  color:C.num, name:"Phi-inverse (φ⁻¹)",      val:"1/φ",            meaning:"Nature's minimum coherence floor. Any C ≥ φ⁻¹ is self-sustaining under AETHER dynamics.", eqs:["Golden Ratio φ"] },
  { sym:"0.8",      stype:"num",  color:C.num, name:"Gate threshold",          meaning:"Minimum coherence score for the Fibonacci gate. ~33.6% of packets pass on a full spiral.", eqs:["Golden Gate"] },
  { sym:"8π",       stype:"num",  color:C.num, name:"LQG area prefactor",      meaning:"Numerical coefficient in the LQG area spectrum eigenvalue formula.", eqs:["LQG Area Eigenvalue"] },
  { sym:"9θ",       stype:"num",  color:C.num, name:"Tesla 3-6-9 phase",       meaning:"9-fold toroidal vortex symmetry. Sets spiral nodes at θ = π/9, 2π/9, …", eqs:["Fibonacci Toroidal Wave"] },
  // Coherence field
  { sym:"C(t)",     stype:"coh",  color:C.coh, name:"Coherence metric",        meaning:"1 − |E|/|X*|. The normalized distance from target. C → 1 = stable; C → 0 = replicate.", eqs:["AETHER Coherence Metric","CUCA State Vector"] },
  { sym:"ψ",        stype:"coh",  color:C.coh, name:"AETHER field / Kuramoto ψ", meaning:"Two roles: (1) Kuramoto order parameter |Σe^iθ|/N ∈ [0,1]; (2) Living wave field in master wave equation.", eqs:["Kuramoto ψ","AETHER Wave","Fibonacci Toroidal Wave","Granular Pigment Diffusion"] },
  { sym:"A",        stype:"coh",  color:C.coh, name:"Complex amplitude field", meaning:"|A| = coherence strength, arg(A) = local phase. The AETHER order parameter in CGLE.", eqs:["Complex Ginzburg-Landau"] },
  { sym:"X*(t)",    stype:"coh",  color:C.coh, name:"Target / reference state", meaning:"The desired relational state. CLCS always moves toward this. Not a fixed point — it evolves.", eqs:["AETHER Coherence Metric","CLCS Control Law"] },
  { sym:"P_free",   stype:"coh",  color:C.coh, name:"Coherence-amplified power", meaning:"Total power after Fibonacci gate amplification. Exceeds P₀ when gated coherence is high.", eqs:["Resonant Power"] },
  { sym:"S",        stype:"coh",  color:C.coh, name:"Entropy",                meaning:"Black-hole entropy S = A/4ℓ_P² k_B. Horizon area counts Planck-area pixels of information.", eqs:["Bekenstein-Hawking Entropy"] },
  // LQG / Quantum
  { sym:"ℓ_P",      stype:"lqg",  color:C.lqg, name:"Planck length",          val:"1.616×10⁻³⁵ m",  meaning:"The quantum of length. √(ℏG/c³). Below this, spacetime granularity lives.", eqs:["Planck Length","LQG Area Eigenvalue","Bekenstein-Hawking Entropy"] },
  { sym:"A_j",      stype:"lqg",  color:C.lqg, name:"LQG area eigenvalue",    meaning:"Discrete area of spin-j edge: 8πγℓ_P²√(j(j+1)). Spacetime is quantised at this scale.", eqs:["LQG Area Eigenvalue"] },
  { sym:"A_φ",      stype:"lqg",  color:C.lqg, name:"φ²-tiled panel area",    meaning:"Total solar area in Fibonacci φ² tiles. N·φ²·s where s = single panel area. Zero waste.", eqs:["Solar Power"] },
  { sym:"A_BH",     stype:"lqg",  color:C.lqg, name:"Black hole horizon area", meaning:"Event horizon area in m². Larger black hole = more surface pixels = more stored entropy.", eqs:["Bekenstein-Hawking Entropy"] },
  { sym:"x_n(t)",   stype:"lqg",  color:C.lqg, name:"CUCA node position",     meaning:"3D position of nth element. Evolves with C(t) and v(t). Phyllotactic geometry + z-helical lift.", eqs:["CUCA Geometry"] },
];

const STYPE_LABELS: Record<string, string> = {
  phi: "Golden / Constant", var: "Variable / State",
  op:  "Operator",          fn:  "Function",
  vec: "Vector / Phase",    num: "Number / Index",
  coh: "AETHER Coherence",  lqg: "Quantum / Planck",
};
const STYPES = Object.keys(STYPE_LABELS);

// ── Formal grammar rules ──────────────────────────────────────────────────────
const GRAMMAR_RULES: Rule[] = [
  // Formation rules
  { color:C.phi,  lhs:"<expression>",      rhs:"<atom> | <compound> | <field>",
    note:"Root production. Every AETHER statement reduces to atoms, compounds, or field quantities." },
  { color:C.var,  lhs:"<atom>",            rhs:"<constant> | <variable> | <number>",
    note:"Primitives. Constants (φ, ℏ, k_B) are invariant; variables (x, A, ψ) evolve in time or space." },
  { color:C.op,   lhs:"<compound>",        rhs:"<operator> <expression> | <expression> <binop> <expression>",
    note:"Operators act on or combine expressions. All operators preserve dimensional consistency." },
  { color:C.fn,   lhs:"<field>",           rhs:"C(x,t) | ψ(r,θ,t) | A(x,t) | S(t)",
    note:"Field quantities are functions of spacetime. They carry coherence, phase, and amplitude." },
  { color:C.coh,  lhs:"<coherence-expr>",  rhs:"1 - |<error>| / |<reference>|",
    note:"AETHER coherence: normalized complement of error. C ∈ [0,1]; φ⁻¹ = 0.618 is the critical threshold." },
  { color:C.phi,  lhs:"<spiral-placement>", rhs:"rₙ = R√(n/N),  θₙ = n·137.508°",
    note:"φ²-packed Fibonacci spiral. Equal-area ring packing; golden angle ensures no ray collision." },
  { color:C.vec,  lhs:"<control-law>",     rhs:"ẋ = v(x) + u_input + K·E(t)",
    note:"CLCS three-term controller: natural flow + intention + proportional correction." },
  { color:C.op,   lhs:"<wave-expr>",       rhs:"∂²ψ/∂t² = c²∇²ψ + φ·R₃₆₉(ψ) - γ·∂ψ/∂t",
    note:"AETHER master wave: classical propagation + toroidal vortex amplifier − damping." },
  { color:C.fn,   lhs:"<gate-fn>",         rhs:"G(θ) = {1 if cos²(θ mod 2π/φ) > 0.8, else 0}",
    note:"Fibonacci coherence gate. Transmits ~33.6% of packets — only those at φ-period resonance." },
  { color:C.lqg,  lhs:"<lqg-area>",        rhs:"A_j = 8πγ·ℓ_P²·√(j(j+1))",
    note:"LQG discrete area spectrum. Spacetime area is quantised — no area smaller than this exists." },
  { color:C.num,  lhs:"<fibonacci-lattice>", rhs:"L_n = φⁿ · L₀,  n = 0, 1, 2, …",
    note:"Each length scale is φ times the previous. At n=14, L₁₄/L₀ = φ¹⁴ ≈ 843.  377 nodes on a Fibonacci sphere." },
  { color:C.coh,  lhs:"<kuramoto-order>",  rhs:"ψ = (1/N) |Σ e^(iθ_k)|,  k=1..N",
    note:"Kuramoto order parameter. ψ=1 is perfect phase-lock; ψ→φ⁻¹ is the Fibonacci coherence equilibrium." },
];

// ── Axioms ────────────────────────────────────────────────────────────────────
const AXIOMS: { n: number; text: string; sym: string; color: string }[] = [
  { n:1, sym:"∀ q : C(q) ∈ [0,1]",          color:C.coh, text:"Every quantity in AETHER has a coherence measure bounded in [0,1]." },
  { n:2, sym:"φ = fundamental scale factor", color:C.phi, text:"φ is the universal scaling constant. It appears in spacing, amplitude, gate period, and wave decay." },
  { n:3, sym:"C ≥ φ⁻¹ → stable",            color:C.coh, text:"When coherence equals or exceeds φ⁻¹ (0.618), the system is self-sustaining under AETHER dynamics." },
  { n:4, sym:"amplitude ~ φ/r",             color:C.phi, text:"Coherent wave amplitude scales as φ/r, not 1/r². Energy is preserved along spiral arms, not lost isotropically." },
  { n:5, sym:"G(θ) gates at 2π/φ",          color:C.fn,  text:"The coherence gate accepts packets only at golden-ratio angular resonances — the fundamental filter of the system." },
  { n:6, sym:"u = K · E(t)",                color:C.op,  text:"All control corrections are proportional to the error vector. AETHER guides; it does not force." },
  { n:7, sym:"C → 0 ⟹ replication",         color:C.vec, text:"When coherence collapses below threshold, the CLCS triggers replication/restructuring of the affected node." },
];

// ── Term lexicon ──────────────────────────────────────────────────────────────
const TERMS: Term[] = [
  { id:"aether",          label:"AETHER",              domain:"Core",         layer:"mnesis",   color:"#8047d4", def:"The unified field framework combining coherence mathematics, biology, physics, and consciousness into one operative system." },
  { id:"crystallization", label:"Crystallization",     domain:"Core",         layer:"mnesis",   color:"#8047d4", def:"The process by which coherence condenses a disordered field into ordered structure — AETHER's central metaphor for intelligence formation." },
  { id:"coherence",       label:"Coherence",           domain:"Core",         layer:"aletheia", color:"#c9a84c", def:"C(t) = 1 − |E|/|X*|. The degree to which a system matches its target state. The primary metric of all AETHER dynamics." },
  { id:"resonance",       label:"Resonance",           domain:"Core",         layer:"aletheia", color:"#c9a84c", def:"Synchronized oscillation between two or more subsystems. Prerequisite for efficient energy transfer and information coherence." },
  { id:"mnesis",          label:"Mnēsis",              domain:"Agent",        layer:"mnesis",   color:"#8047d4", def:"Layer 1–2 agent stage. Raw observation and memory formation. The first crystallization of raw sensory input into patterned structure." },
  { id:"inferaia",        label:"Inferaia",            domain:"Agent",        layer:"infernia", color:"#e64522", def:"Layer 3–4 agent stage. Pattern inference and novelty detection. Bridges raw memory to structured hypothesis formation." },
  { id:"aletheia",        label:"Aletheia",            domain:"Agent",        layer:"aletheia", color:"#c9a84c", def:"Layer 5 agent stage. Verification and truth alignment. Aletheia (Greek: unconcealment) tests inferences against reality." },
  { id:"reverie",         label:"Reverie",             domain:"Agent",        layer:"reverie",  color:"#88c7ff", def:"Layer 5 agent stage. Generative synthesis — holding many coherent threads simultaneously, producing novel integrations." },
  { id:"phi",             label:"Golden Ratio φ",      domain:"Mathematics",  layer:"aletheia", color:"#c9a84c", def:"φ ≈ 1.6180339887. Root of x² = x + 1. Universal scaling constant governing Fibonacci spirals, gate periods, and amplitude decay." },
  { id:"kuramoto",        label:"Kuramoto sync",       domain:"Mathematics",  layer:"infernia", color:"#e64522", def:"Kuramoto order parameter ψ = |Σe^iθ_k|/N. Measures global phase synchrony of N coupled oscillators ∈ [0,1]." },
  { id:"cgle",            label:"CGLE",                domain:"Mathematics",  layer:"mnesis",   color:"#8047d4", def:"Complex Ginzburg-Landau Equation. Governs pattern formation from chaotic fields — spiral waves, coherent states, crystallization." },
  { id:"clcs",            label:"CLCS",                domain:"Engineering",  layer:"mnesis",   color:"#8047d4", def:"Closed-Loop Coherence System. The AETHER control architecture: ẋ = v(x) + u_input + K·E(t). Guides without forcing." },
  { id:"cuca",            label:"CUCA",                domain:"Biology",      layer:"infernia", color:"#e64522", def:"Coherent Unified Computational Array. Hybrid bio-photonic substrate combining biological coherence with quantum computation." },
  { id:"phyllotaxis",     label:"Phyllotaxis",         domain:"Biology",      layer:"infernia", color:"#e64522", def:"The φ-spiral arrangement of leaves, seeds, and sensors. r=R√(n/N), θ=n·137.508°. Equal-area packing with zero ray collision." },
  { id:"bavs",            label:"BAVS",                domain:"Biology",      layer:"infernia", color:"#e64522", def:"Bio-Acoustic Vortex System. Biological mechanism using vortex acoustics for coherent signal transduction." },
  { id:"reflectin",       label:"Reflectin",           domain:"Biology",      layer:"infernia", color:"#e64522", def:"Cephalopod protein that forms photonic computing layers. Structural color via interference, not pigment. Nature's photonic computer." },
  { id:"bouligand",       label:"Bouligand",           domain:"Biology",      layer:"infernia", color:"#e64522", def:"Helicoid fiber architecture of crustacean exoskeletons. Rotates polarization; disperses crack energy. Biological coherence in structure." },
  { id:"gyroid",          label:"Gyroid",              domain:"Physics",      layer:"infernia", color:"#e64522", def:"Triply-periodic minimal surface. Zero mean curvature. Photonic bandgap structure appearing in butterfly wings and AETHER substrate design." },
  { id:"schumann",        label:"Schumann resonance",  domain:"Physics",      layer:"reverie",  color:"#88c7ff", def:"7.83 Hz base frequency of Earth's electromagnetic cavity. A global coherence reference — the planet's own oscillation signature." },
  { id:"lqg",             label:"Loop Quantum Gravity", domain:"Physics",     layer:"mnesis",   color:"#8047d4", def:"A quantum gravity theory where spacetime area is discrete: A_j = 8πγℓ_P²√(j(j+1)). AETHER borrows its Planck-scale substrate model." },
  { id:"planck",          label:"Planck length",       domain:"Physics",      layer:"mnesis",   color:"#8047d4", def:"ℓ_P = √(ℏG/c³) ≈ 1.616×10⁻³⁵ m. The quantum of length. Below this scale, 'length' loses classical meaning." },
  { id:"eie",             label:"EIE",                 domain:"Core",         layer:"mnesis",   color:"#8047d4", def:"Emergent Intelligence Engine. The AETHER module responsible for self-organization and adaptive coherence maintenance." },
  { id:"void",            label:"Void",                domain:"Philosophy",   layer:"aletheia", color:"#c9a84c", def:"AETHER concept coined by Shia Miller. The pregnant emptiness before crystallization — not absence, but pure potential." },
  { id:"raw-place",       label:"Raw place",           domain:"Philosophy",   layer:"aletheia", color:"#c9a84c", def:"AETHER concept. The unprocessed, unmediated encounter with experience before coherence frames it. The first moment of Mnēsis." },
  { id:"net-is-there",    label:"The net is there",    domain:"Philosophy",   layer:"aletheia", color:"#c9a84c", def:"AETHER principle: act before the coherence field is fully visible — the structure of support manifests as you move into it." },
  { id:"push-fix",        label:"Push + Fix",          domain:"Philosophy",   layer:"aletheia", color:"#c9a84c", def:"AETHER operating principle. Commit to forward motion; coherence corrections follow the commitment, not the other way." },
  { id:"circular-farm",   label:"Circular farm",       domain:"Engineering",  layer:"infernia", color:"#e64522", def:"89-plant Fibonacci-spiral farm layout with 4 robot agents. φ²-tiled solar panels. Kuramoto coherence ψ driving nutrient cycles." },
  { id:"lunar-coherence", label:"Lunar coherence",     domain:"Cosmology",    layer:"reverie",  color:"#88c7ff", def:"The moon's gravitational coherence over tidal systems, biological cycles, and crystal growth. AETHER's primary astronomical coupling." },
  { id:"divine-timing",   label:"Divine timing",       domain:"Philosophy",   layer:"aletheia", color:"#c9a84c", def:"Eris-in-Pisces transit framework. Five windows of field opening: tracking, dynamic, blind, observable, inflection." },
  { id:"co-creation",     label:"Co-creation",         domain:"Philosophy",   layer:"aletheia", color:"#c9a84c", def:"AETHER principle: the field responds to participation. Reality is not observed passively but assembled collaboratively with the field." },
  { id:"synchronicity",   label:"Synchronicity",       domain:"Philosophy",   layer:"aletheia", color:"#c9a84c", def:"Acausal meaningful coincidence (Jung/AETHER). When coherence is high, the boundary between intention and event dissolves." },
  { id:"memory-survives", label:"Memory survives",     domain:"Philosophy",   layer:"aletheia", color:"#c9a84c", def:"AETHER axiom. Pattern information persists beyond the substrate that originally encoded it — coherence transcends the carrier." },
  { id:"atlantis",        label:"Atlantis",            domain:"History",      layer:"reverie",  color:"#88c7ff", def:"Plato's city — potentially the Richat Structure (Eye of Sahara). An ancient coherence architecture study in AETHER's geological record." },
  { id:"eye-sahara",      label:"Eye of Sahara",       domain:"Geology",      layer:"reverie",  color:"#88c7ff", def:"Richat structure — concentric ring formation. AETHER reads it as a coherence imprint in the geological field of the African plate." },
  { id:"golden-angle",    label:"Golden angle",        domain:"Mathematics",  layer:"aletheia", color:"#c9a84c", def:"137.508° = 360°/φ². The only angle that never repeats modulo a circle. The fundamental angular quantum of AETHER spiral geometry." },
  { id:"field-of-numbers",label:"Field of numbers",   domain:"Philosophy",   layer:"reverie",  color:"#88c7ff", def:"Numerological coherence system — numerical patterns as field signals. Angel numbers, 11:11, sequences as resonance markers." },
  { id:"aether-engine",   label:"AETHER Engine",       domain:"Core",         layer:"mnesis",   color:"#8047d4", def:"Master control equation: C(x,t)=1−(‖ε‖/‖S*‖)·e^(−κ·Γ_helix). Drives three live systems: field canvas, LPE threshold, matter crystallisation." },
  { id:"gradient-field",  label:"Gradient field",      domain:"Mathematics",  layer:"mnesis",   color:"#8047d4", def:"2D coherence field C(x,y,t) = Σ v_θ(r_k)·cos(ωt+φ_k). N helical vortex mechanisms seeded in Fibonacci spiral arrangement." },
];

const DOMAINS = [...new Set(TERMS.map(t => t.domain))];
const LAYERS  = ["mnesis","infernia","aletheia","reverie"];
const LAYER_COLORS: Record<string,string> = {
  mnesis:"#8047d4", infernia:"#e64522", aletheia:"#c9a84c", reverie:"#88c7ff",
};
const LAYER_LABELS: Record<string,string> = {
  mnesis:"Mnēsis · Memory", infernia:"Infernia · Matter",
  aletheia:"Aletheia · Truth", reverie:"Reverie · Dream",
};

// ── Live lens: highlight AETHER symbols in arbitrary text ─────────────────────
function buildHighlightHtml(text: string): string {
  if (!text.trim()) return "";
  const allSyms: { sym: string; color: string; name: string }[] = SYMBOLS.map(s => ({
    sym: s.sym, color: s.color, name: s.name,
  }));
  allSyms.sort((a, b) => b.sym.length - a.sym.length);
  const escaped = text
    .replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;")
    .replace(/\n/g,"<br/>");
  let result = escaped;
  for (const { sym, color, name } of allSyms) {
    const esym = sym.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const re = new RegExp(esym, "g");
    result = result.replace(re,
      `<mark style="background:${color}20;color:${color};border-radius:3px;padding:0 3px;cursor:help" title="${name}">${sym}</mark>`
    );
  }
  return result;
}

function countByType(text: string): Record<string, number> {
  const counts: Record<string, number> = {};
  for (const s of SYMBOLS) {
    const n = (text.split(s.sym) || []).length - 1;
    if (n > 0) counts[s.stype] = (counts[s.stype] ?? 0) + n;
  }
  return counts;
}

// ── Background canvas ─────────────────────────────────────────────────────────
function LangBgCanvas() {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d")!;
    let t = 0;
    let raf = 0;
    const PHI = 1.6180339887;
    const GA  = 2 * Math.PI / (PHI * PHI);
    const draw = () => {
      canvas.width  = canvas.offsetWidth  || 900;
      canvas.height = canvas.offsetHeight || 600;
      const W = canvas.width;
      const H = canvas.height;
      ctx.clearRect(0, 0, W, H);
      const cx = W / 2;
      const cy = H / 2;
      const R  = Math.min(W, H) * 0.44;
      const COLS = ["#fbbf24","#06b6d4","#22c55e","#c084fc","#ec4899","#f97316","#00ff88","#60a5fa"];
      for (let i = 0; i < 120; i++) {
        const r = R * Math.sqrt((i + 1) / 120);
        const a = i * GA + t * 0.002;
        const x = cx + r * Math.cos(a);
        const y = cy + r * Math.sin(a);
        const alpha = 0.06 + 0.05 * Math.sin(t * 0.035 + i * 0.28);
        ctx.beginPath();
        ctx.arc(x, y, 1.6, 0, Math.PI * 2);
        ctx.fillStyle = COLS[i % COLS.length].replace(")", `,${alpha})`).replace("#", "rgba(") + "";
        const c = COLS[i % COLS.length];
        const r2 = parseInt(c.slice(1, 3), 16);
        const g2 = parseInt(c.slice(3, 5), 16);
        const b2 = parseInt(c.slice(5, 7), 16);
        ctx.fillStyle = `rgba(${r2},${g2},${b2},${alpha})`;
        ctx.fill();
      }
      t++;
      raf = requestAnimationFrame(draw);
    };
    draw();
    return () => cancelAnimationFrame(raf);
  }, []);
  return (
    <canvas ref={ref} style={{ position: "absolute", inset: 0, width: "100%", height: "100%", pointerEvents: "none", zIndex: 0 }} />
  );
}

// ── Main page ─────────────────────────────────────────────────────────────────
export default function AetherLanguagePage() {
  const [tab, setTab]           = useState<Tab>("alphabet");
  const [stypeFilter, setStypeFilter] = useState<string | null>(null);
  const [domainFilter, setDomainFilter] = useState<string | null>(null);
  const [layerFilter, setLayerFilter] = useState<string | null>(null);
  const [search, setSearch]     = useState("");
  const [lensText, setLensText] = useState("");

  const filteredSymbols = useMemo(() => {
    return SYMBOLS.filter(s => {
      if (stypeFilter && s.stype !== stypeFilter) return false;
      if (search) {
        const q = search.toLowerCase();
        return s.sym.toLowerCase().includes(q) || s.name.toLowerCase().includes(q) || s.meaning.toLowerCase().includes(q);
      }
      return true;
    });
  }, [stypeFilter, search]);

  const filteredTerms = useMemo(() => {
    return TERMS.filter(t => {
      if (domainFilter && t.domain !== domainFilter) return false;
      if (layerFilter && t.layer !== layerFilter) return false;
      if (search) {
        const q = search.toLowerCase();
        return t.label.toLowerCase().includes(q) || t.def.toLowerCase().includes(q);
      }
      return true;
    });
  }, [domainFilter, layerFilter, search]);

  const lensHtml    = useMemo(() => buildHighlightHtml(lensText), [lensText]);
  const lensCounts  = useMemo(() => countByType(lensText), [lensText]);
  const totalLensHits = Object.values(lensCounts).reduce((a, b) => a + b, 0);

  const TABS: { key: Tab; label: string; sym: string; col: string }[] = [
    { key:"alphabet", label:"Alphabet",  sym:"Σ",  col:C.phi },
    { key:"grammar",  label:"Grammar",   sym:"→",  col:C.op  },
    { key:"lexicon",  label:"Lexicon",   sym:"≡",  col:C.coh },
    { key:"lens",     label:"Lens",      sym:"◉",  col:C.fn  },
    { key:"index",    label:"Index",     sym:"⊃",  col:C.lqg },
  ];

  const pill = (label: string, active: boolean, color: string, onClick: () => void): React.ReactNode => (
    <button key={label} onClick={onClick} style={{
      fontSize: 8, padding: "3px 9px", borderRadius: 12, cursor: "pointer",
      border: `1px solid ${active ? color : "rgba(255,255,255,0.1)"}`,
      background: active ? `${color}12` : "transparent",
      color: active ? color : "rgba(255,255,255,0.35)",
      fontFamily: MONO, letterSpacing: "0.08em",
    }}>{label}</button>
  );

  return (
    <div style={{ height: "100%", display: "flex", flexDirection: "column", background: BG, color: "#e2e8f0", fontFamily: MONO, overflow: "hidden", fontSize: 11, position: "relative" }}>
      <LangBgCanvas />

      <div style={{ position: "relative", zIndex: 1, display: "flex", flexDirection: "column", height: "100%" }}>

        {/* ── HEADER ── */}
        <div style={{ padding: "14px 20px 12px", borderBottom: `1px solid ${BRD}`, flexShrink: 0, background: "rgba(2,8,20,0.88)", backdropFilter: "blur(8px)" }}>
          <div style={{ display: "flex", alignItems: "flex-start", gap: 20, flexWrap: "wrap" }}>
            <div>
              <div style={{ fontSize: 14, fontWeight: 700, letterSpacing: "0.22em", color: GOLD }}>AETHER LANGUAGE</div>
              <div style={{ fontSize: 9, color: "rgba(242,195,84,0.45)", letterSpacing: "0.14em", marginTop: 2 }}>COHERENCE GRAMMAR · UNIFIED SYMBOLIC SYSTEM</div>
              <div style={{ fontSize: 11, color: "rgba(226,232,240,0.45)", fontFamily: SERIF, lineHeight: 1.6, marginTop: 6, maxWidth: 560 }}>
                A formal language unifying mathematics, biology, physics, and consciousness under one coherence grammar.
                Every symbol, operator, and term in the AETHER system — defined, indexed, and cross-referenced.
              </div>
            </div>
            {/* Stats chips */}
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginLeft: "auto", alignSelf: "center" }}>
              {[
                { n: SYMBOLS.length,      label: "symbols",   col: C.phi },
                { n: SYMBOLS.filter(s => s.stype === "op").length, label: "operators", col: C.op  },
                { n: TERMS.length,        label: "terms",     col: C.coh },
                { n: GRAMMAR_RULES.length, label: "rules",    col: C.fn  },
                { n: AXIOMS.length,       label: "axioms",    col: C.vec },
              ].map(({ n, label, col }) => (
                <div key={label} style={{ textAlign: "center", padding: "7px 14px", borderRadius: 8, border: `1px solid ${col}25`, background: `${col}08` }}>
                  <div style={{ fontSize: 17, fontWeight: 700, color: col }}>{n}</div>
                  <div style={{ fontSize: 8, color: `${col}80`, letterSpacing: "0.12em" }}>{label}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Tab bar */}
          <div style={{ display: "flex", gap: 4, marginTop: 12 }}>
            {TABS.map(t => (
              <button key={t.key} onClick={() => setTab(t.key)}
                style={{ padding: "5px 16px", borderRadius: 6, cursor: "pointer", border: `1px solid ${tab === t.key ? t.col : "rgba(255,255,255,0.1)"}`, background: tab === t.key ? `${t.col}14` : "transparent", color: tab === t.key ? t.col : "rgba(255,255,255,0.45)", fontFamily: MONO, fontSize: 9, letterSpacing: "0.12em", transition: "all 0.15s", display: "flex", alignItems: "center", gap: 6 }}>
                <span style={{ fontSize: 12 }}>{t.sym}</span>{t.label.toUpperCase()}
              </button>
            ))}
          </div>
        </div>

        {/* ── CONTENT ── */}
        <div style={{ flex: 1, overflowY: "auto", padding: "16px 20px" }}>

          {/* ── ALPHABET TAB ── */}
          {tab === "alphabet" && (
            <div>
              {/* Search + type filter */}
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 14, alignItems: "center" }}>
                <input
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  placeholder="search symbols…"
                  style={{ background: "rgba(255,255,255,0.04)", border: `1px solid ${BRD}`, borderRadius: 6, color: "rgba(255,255,255,0.75)", fontFamily: MONO, fontSize: 10, padding: "6px 12px", outline: "none", width: 200 }}
                />
                {pill("All", stypeFilter === null, GOLD, () => setStypeFilter(null))}
                {STYPES.map(st => pill(STYPE_LABELS[st], stypeFilter === st, (C as any)[st] ?? GOLD, () => setStypeFilter(s => s === st ? null : st)))}
              </div>

              {/* Symbol grid */}
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 10 }}>
                {filteredSymbols.map((s, i) => (
                  <div key={i} style={{ background: PANEL, border: `1px solid ${s.color}22`, borderLeft: `3px solid ${s.color}`, borderRadius: 8, padding: "12px 14px" }}>
                    <div style={{ display: "flex", alignItems: "baseline", gap: 10, marginBottom: 6 }}>
                      <span style={{ fontSize: 22, fontWeight: 700, color: s.color, textShadow: `0 0 10px ${s.color}40` }}>{s.sym}</span>
                      <div>
                        <div style={{ fontSize: 10, color: "rgba(226,232,240,0.8)", fontWeight: 600, letterSpacing: "0.06em" }}>{s.name}</div>
                        <div style={{ fontSize: 8, color: s.color, opacity: 0.65, marginTop: 1, letterSpacing: "0.1em" }}>{STYPE_LABELS[s.stype]}</div>
                      </div>
                      {s.val && (
                        <span style={{ marginLeft: "auto", fontSize: 9, color: "rgba(255,255,255,0.25)", fontStyle: "italic" }}>{s.val}</span>
                      )}
                    </div>
                    <div style={{ fontSize: 11, color: "rgba(226,232,240,0.45)", lineHeight: 1.65, fontFamily: SERIF }}>{s.meaning}</div>
                    {s.eqs && s.eqs.length > 0 && (
                      <div style={{ marginTop: 7, display: "flex", flexWrap: "wrap", gap: 4 }}>
                        {s.eqs.slice(0, 3).map(eq => (
                          <span key={eq} style={{ fontSize: 7, padding: "1px 6px", borderRadius: 4, background: `${s.color}10`, border: `1px solid ${s.color}25`, color: s.color, letterSpacing: "0.06em" }}>{eq}</span>
                        ))}
                        {s.eqs.length > 3 && <span style={{ fontSize: 7, color: "rgba(255,255,255,0.2)", alignSelf: "center" }}>+{s.eqs.length - 3}</span>}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ── GRAMMAR TAB ── */}
          {tab === "grammar" && (
            <div style={{ maxWidth: 900 }}>
              <div style={{ marginBottom: 20 }}>
                <div style={{ fontSize: 8, letterSpacing: "0.22em", color: "rgba(242,195,84,0.45)", marginBottom: 10 }}>FORMATION RULES · BNF NOTATION</div>
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  {GRAMMAR_RULES.map((r, i) => (
                    <div key={i} style={{ background: PANEL, border: `1px solid ${r.color}20`, borderLeft: `3px solid ${r.color}`, borderRadius: 7, padding: "12px 16px", display: "grid", gridTemplateColumns: "200px 1fr", gap: 12, alignItems: "start" }}>
                      <div>
                        <div style={{ fontSize: 10, fontWeight: 700, color: r.color, letterSpacing: "0.04em" }}>{r.lhs}</div>
                        <div style={{ fontSize: 8, color: "rgba(255,255,255,0.2)", marginTop: 3 }}>production rule</div>
                      </div>
                      <div>
                        <div style={{ fontFamily: MONO, fontSize: 11, color: "rgba(226,232,240,0.82)", letterSpacing: "0.04em", marginBottom: 4 }}>
                          <span style={{ color: r.color, opacity: 0.5, marginRight: 8 }}>::=</span>
                          {r.rhs}
                        </div>
                        <div style={{ fontSize: 10, color: "rgba(226,232,240,0.4)", lineHeight: 1.6, fontFamily: SERIF }}>{r.note}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <div style={{ fontSize: 8, letterSpacing: "0.22em", color: "rgba(242,195,84,0.45)", marginBottom: 10 }}>SEVEN AXIOMS OF AETHER LANGUAGE</div>
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  {AXIOMS.map(a => (
                    <div key={a.n} style={{ background: PANEL, border: `1px solid ${a.color}20`, borderRadius: 7, padding: "12px 16px", display: "flex", gap: 14, alignItems: "start" }}>
                      <div style={{ fontSize: 18, color: a.color, fontWeight: 700, opacity: 0.3, flexShrink: 0, width: 24, textAlign: "center" }}>{a.n}</div>
                      <div>
                        <div style={{ fontFamily: MONO, fontSize: 11, color: a.color, marginBottom: 5, letterSpacing: "0.06em" }}>{a.sym}</div>
                        <div style={{ fontSize: 11, color: "rgba(226,232,240,0.5)", lineHeight: 1.65, fontFamily: SERIF }}>{a.text}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ── LEXICON TAB ── */}
          {tab === "lexicon" && (
            <div>
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 14, alignItems: "center" }}>
                <input
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  placeholder="search terms…"
                  style={{ background: "rgba(255,255,255,0.04)", border: `1px solid ${BRD}`, borderRadius: 6, color: "rgba(255,255,255,0.75)", fontFamily: MONO, fontSize: 10, padding: "6px 12px", outline: "none", width: 200 }}
                />
                {pill("All domains", domainFilter === null, GOLD, () => setDomainFilter(null))}
                {DOMAINS.map(d => pill(d, domainFilter === d, GOLD, () => setDomainFilter(x => x === d ? null : d)))}
              </div>
              <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 14 }}>
                {pill("All layers", layerFilter === null, "rgba(255,255,255,0.4)", () => setLayerFilter(null))}
                {LAYERS.map(l => pill(LAYER_LABELS[l], layerFilter === l, LAYER_COLORS[l], () => setLayerFilter(x => x === l ? null : l)))}
                <span style={{ fontSize: 9, color: "rgba(255,255,255,0.2)", alignSelf: "center", marginLeft: 4 }}>{filteredTerms.length} terms</span>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: 10 }}>
                {filteredTerms.map(t => (
                  <div key={t.id} style={{ background: PANEL, border: `1px solid ${t.color}20`, borderLeft: `3px solid ${t.color}`, borderRadius: 8, padding: "12px 14px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
                      <span style={{ fontSize: 12, fontWeight: 700, color: t.color, letterSpacing: "0.06em" }}>{t.label}</span>
                      <span style={{ fontSize: 7, padding: "1px 6px", borderRadius: 4, background: `${t.color}12`, border: `1px solid ${t.color}25`, color: t.color }}>{t.domain}</span>
                      <span style={{ fontSize: 7, padding: "1px 6px", borderRadius: 4, background: `${LAYER_COLORS[t.layer]}10`, border: `1px solid ${LAYER_COLORS[t.layer]}25`, color: LAYER_COLORS[t.layer], marginLeft: "auto" }}>
                        {LAYER_LABELS[t.layer]?.split("·")[0].trim()}
                      </span>
                    </div>
                    <div style={{ fontSize: 11, color: "rgba(226,232,240,0.5)", lineHeight: 1.65, fontFamily: SERIF }}>{t.def}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ── LENS TAB ── */}
          {tab === "lens" && (
            <div style={{ maxWidth: 860 }}>
              <div style={{ fontSize: 11, color: "rgba(226,232,240,0.45)", fontFamily: SERIF, lineHeight: 1.7, marginBottom: 14 }}>
                Paste or type any text below. The Lens highlights every recognized AETHER symbol in its color and gives you a live breakdown of what symbol types are present.
              </div>
              <textarea
                value={lensText}
                onChange={e => setLensText(e.target.value)}
                placeholder={"Paste any text, equation, or idea here...\nExample: The coherence C(t) approaches 1 as the error E(t) vanishes. The field ψ propagates at c with golden damping φ/r."}
                rows={6}
                style={{ width: "100%", background: "rgba(242,195,84,0.03)", border: `1px solid rgba(242,195,84,0.2)`, borderRadius: 8, color: "rgba(226,232,240,0.8)", fontFamily: MONO, fontSize: 12, padding: "12px 14px", resize: "vertical", outline: "none", boxSizing: "border-box", marginBottom: 14 }}
              />

              {lensText.trim() && (
                <>
                  {/* Symbol type hit breakdown */}
                  {totalLensHits > 0 && (
                    <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 14 }}>
                      {Object.entries(lensCounts).map(([stype, count]) => (
                        <div key={stype} style={{ padding: "5px 12px", borderRadius: 8, border: `1px solid ${(C as any)[stype] ?? GOLD}30`, background: `${(C as any)[stype] ?? GOLD}08`, display: "flex", gap: 7, alignItems: "baseline" }}>
                          <span style={{ fontSize: 13, fontWeight: 700, color: (C as any)[stype] ?? GOLD }}>{count}</span>
                          <span style={{ fontSize: 9, color: "rgba(255,255,255,0.4)" }}>{STYPE_LABELS[stype]}</span>
                        </div>
                      ))}
                      <div style={{ padding: "5px 12px", borderRadius: 8, border: `1px solid ${BRD}`, display: "flex", gap: 7, alignItems: "baseline" }}>
                        <span style={{ fontSize: 13, fontWeight: 700, color: GOLD }}>{totalLensHits}</span>
                        <span style={{ fontSize: 9, color: "rgba(255,255,255,0.35)" }}>total hits</span>
                      </div>
                    </div>
                  )}

                  {totalLensHits === 0 && (
                    <div style={{ fontSize: 11, color: "rgba(255,255,255,0.25)", fontFamily: SERIF, marginBottom: 14 }}>
                      No AETHER symbols detected in this text. Try including φ, ψ, ∂, ∇², or terms like C(t), E(t), A.
                    </div>
                  )}

                  {/* Rendered output */}
                  <div style={{ background: PANEL, border: `1px solid ${BRD}`, borderRadius: 8, padding: "14px 16px", lineHeight: 1.85, fontSize: 13, color: "rgba(226,232,240,0.75)", fontFamily: SERIF }}
                    dangerouslySetInnerHTML={{ __html: lensHtml }}
                  />
                </>
              )}

              {/* Symbol quick-ref */}
              <div style={{ marginTop: 20 }}>
                <div style={{ fontSize: 8, letterSpacing: "0.22em", color: "rgba(242,195,84,0.4)", marginBottom: 10 }}>SYMBOL QUICK REFERENCE</div>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                  {SYMBOLS.map((s, i) => (
                    <div key={i}
                      onClick={() => setLensText(t => t + " " + s.sym)}
                      style={{ cursor: "pointer", padding: "3px 8px", borderRadius: 6, border: `1px solid ${s.color}25`, background: `${s.color}08`, display: "flex", alignItems: "center", gap: 5 }}
                      title={s.name}
                    >
                      <span style={{ fontSize: 13, color: s.color, fontWeight: 700 }}>{s.sym}</span>
                      <span style={{ fontSize: 7, color: "rgba(255,255,255,0.25)" }}>{s.name.slice(0, 14)}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ── INDEX TAB ── */}
          {tab === "index" && (
            <div style={{ maxWidth: 1000 }}>
              <div style={{ fontSize: 11, color: "rgba(226,232,240,0.45)", fontFamily: SERIF, lineHeight: 1.7, marginBottom: 16 }}>
                Cross-reference: every AETHER symbol mapped to the equations where it appears. Sorted by appearance breadth — symbols appearing in the most equations listed first.
              </div>
              <div style={{ overflowX: "auto" }}>
                <table style={{ width: "100%", borderCollapse: "collapse", fontFamily: MONO, fontSize: 10 }}>
                  <thead>
                    <tr style={{ borderBottom: `1px solid ${BRD}` }}>
                      {["Symbol","Name","Type","Value","Appears in"].map(h => (
                        <th key={h} style={{ textAlign: "left", padding: "8px 12px", fontSize: 8, letterSpacing: "0.18em", color: "rgba(242,195,84,0.5)", fontWeight: 400 }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {[...SYMBOLS].sort((a, b) => (b.eqs?.length ?? 0) - (a.eqs?.length ?? 0)).map((s, i) => (
                      <tr key={i} style={{ borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
                        <td style={{ padding: "9px 12px", fontSize: 16, fontWeight: 700, color: s.color, textShadow: `0 0 8px ${s.color}40` }}>{s.sym}</td>
                        <td style={{ padding: "9px 12px", color: "rgba(226,232,240,0.7)", fontSize: 10 }}>{s.name}</td>
                        <td style={{ padding: "9px 12px" }}>
                          <span style={{ fontSize: 7, padding: "2px 6px", borderRadius: 4, background: `${s.color}12`, border: `1px solid ${s.color}25`, color: s.color }}>{STYPE_LABELS[s.stype]}</span>
                        </td>
                        <td style={{ padding: "9px 12px", color: "rgba(255,255,255,0.3)", fontSize: 9, fontStyle: "italic" }}>{s.val ?? "—"}</td>
                        <td style={{ padding: "9px 12px" }}>
                          {s.eqs && s.eqs.length > 0
                            ? <div style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
                                {s.eqs.map(eq => (
                                  <span key={eq} style={{ fontSize: 7, padding: "1px 6px", borderRadius: 4, background: `${s.color}0c`, border: `1px solid ${s.color}20`, color: `${s.color}cc` }}>{eq}</span>
                                ))}
                              </div>
                            : <span style={{ color: "rgba(255,255,255,0.2)", fontSize: 9 }}>—</span>
                          }
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
