import { useEffect, useRef, useState, useCallback } from "react";
import katex from "katex";
import "katex/dist/katex.min.css";

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
const GOLD   = "#f2c354";
const BG     = "rgb(2,8,18)";
const PANEL  = "rgba(4,14,32,0.92)";
const BRD    = "rgba(242,195,84,0.12)";
const MONO   = "'DM Mono',monospace";
const SERIF  = "'Georgia',serif";

// ── KaTeX helper ──────────────────────────────────────────────────────────────
function k(tex: string) {
  try { return katex.renderToString(tex, { throwOnError: false, output: "html", trust: true }); }
  catch { return `<span style="color:#ef4444;font-size:10px">parse error</span>`; }
}

// ── Color helpers ─────────────────────────────────────────────────────────────
const φ   = (s: string) => `\\textcolor{${C.phi}}{${s}}`;
const V   = (s: string) => `\\textcolor{${C.var}}{${s}}`;
const O   = (s: string) => `\\textcolor{${C.op}}{${s}}`;
const F   = (s: string) => `\\textcolor{${C.fn}}{${s}}`;
const Vv  = (s: string) => `\\textcolor{${C.vec}}{${s}}`;
const N   = (s: string) => `\\textcolor{${C.num}}{${s}}`;
const Coh = (s: string) => `\\textcolor{${C.coh}}{${s}}`;
const Lqg = (s: string) => `\\textcolor{${C.lqg}}{${s}}`;

// ── Types ─────────────────────────────────────────────────────────────────────
interface Term { sym: string; name: string; color: string; meaning: string }
interface Eq   { id: string; cat: string; label: string; desc: string; tex: string; terms: Term[] }

// ── Equation library ──────────────────────────────────────────────────────────
const EQUATIONS: Eq[] = [
  {
    id:"phi", cat:"Golden Ratio", label:"Golden Ratio φ",
    desc:"The most irrational number. Ratio of consecutive Fibonacci numbers. Foundation of AETHER phyllotaxis.",
    tex:`${φ("\\phi")} = \\dfrac{${N("1")} + \\sqrt{${N("5")}}}{${N("2")}} \\approx ${φ("1.6180339887")}`,
    terms:[
      { sym:"φ",  name:"Golden Ratio",       color:C.phi, meaning:"The unique positive root of x² = x + 1. Basis of Fibonacci spiral geometry and all phyllotactic layouts." },
      { sym:"√5", name:"Square root of 5",   color:C.num, meaning:"Irrational component — makes φ transcend rational approximation. Cannot be expressed as a fraction." },
      { sym:"2",  name:"Denominator",        color:C.num, meaning:"The normalization that produces the [0,1] range self-similar ratio." },
    ],
  },
  {
    id:"fib-spiral", cat:"Golden Ratio", label:"Fibonacci Spiral Placement",
    desc:"Every seed is placed at angle n × 137.508° from the previous — the golden angle. No two plants share the same ray from centre.",
    tex:`${V("r_n")} = ${Lqg("R")}\\sqrt{\\dfrac{${V("n")}}{${φ("N")}}}, \\qquad ${Vv("\\theta_n")} = ${V("n")} \\cdot ${φ("137.508°")}`,
    terms:[
      { sym:"r_n",      name:"Radial distance of nth plant", color:C.var, meaning:"Grows as √n — equal-area ring packing for uniform light access across all plants." },
      { sym:"R",        name:"Farm radius",                  color:C.lqg, meaning:"Outer boundary of the circular farm. Scales all radial positions proportionally." },
      { sym:"θ_n",      name:"Angular position",             color:C.vec, meaning:"n × 137.508° — the golden angle. Ensures no two plants share a direction vector from centre." },
      { sym:"137.508°", name:"Golden angle",                 color:C.phi, meaning:"= 360°/φ² = 2π/φ². The only angle that never repeats modulo a circle. Maximally space-efficient." },
    ],
  },
  {
    id:"golden-gate", cat:"Golden Ratio", label:"AETHER Math Gate (Coherence Filter)",
    desc:"Only wave packets passing the Fibonacci-quantized coherence gate are transmitted. Drops ~66% of incoherent data.",
    tex:`G(${Vv("\\theta")}) = \\begin{cases} ${N("1")} & ${F("\\cos^2")}\\!\\left(\\dfrac{${Vv("\\theta")} \\bmod \\frac{2${φ("\\pi")}}{${φ("\\phi")}}}{${N("1")}}\\right) > ${N("0.8")} \\\\ ${N("0")} & \\text{otherwise} \\end{cases}`,
    terms:[
      { sym:"G(θ)",    name:"Gate function",        color:C.vec, meaning:"Binary coherence gate. 1 = pass, 0 = reject. Applied to every sensor packet, wave, or pigment fraction." },
      { sym:"cos²(·)", name:"Squared cosine",       color:C.fn,  meaning:"Produces periodic maxima at Fibonacci phase resonances. Peak = 1, trough = 0." },
      { sym:"2π/φ",    name:"Fibonacci period",     color:C.phi, meaning:"The angular period of the gate — set to the golden ratio interval. Only resonant packets pass." },
      { sym:"0.8",     name:"Coherence threshold",  color:C.num, meaning:"The minimum coherence score for transmission. ~33.6% of packets pass on a full Fibonacci spiral." },
    ],
  },
  {
    id:"kuramoto", cat:"AETHER Coherence", label:"Kuramoto Order Parameter ψ",
    desc:"Measures global synchrony of N oscillators. ψ = 1 → perfect coherence. ψ → 1/φ for Fibonacci phyllotaxis — the golden coherence ratio.",
    tex:`${Coh("\\psi")} = \\dfrac{${N("1")}}{${φ("N")}} \\left| \\sum_{${V("k")}=${N("1")}}^{${φ("N")}} e^{\\,i${Vv("\\theta_k")}} \\right|`,
    terms:[
      { sym:"ψ",        name:"Coherence order parameter", color:C.coh, meaning:"Magnitude of the mean complex phasor. 0 = incoherent chaos, 1 = perfectly phase-locked crystal." },
      { sym:"N",        name:"Number of oscillators",     color:C.phi, meaning:"Total agents. For AETHER farms: N = 89 or 144 (Fibonacci numbers) for maximum packing efficiency." },
      { sym:"e^(iθ_k)", name:"Complex phasor",            color:C.vec, meaning:"Unit vector on the complex plane at phase angle θ_k. Sum of N phasors gives the collective field direction." },
      { sym:"|·|",      name:"Modulus (magnitude)",       color:C.op,  meaning:"Length of the sum vector. Opposing phasors cancel; aligned phasors reinforce. Measures order." },
    ],
  },
  {
    id:"coherence", cat:"AETHER Coherence", label:"AETHER Coherence Metric C(t)",
    desc:"CLCS stability measure. C → 1 means error is vanishing and system matches target. C → 0 triggers replication.",
    tex:`${Coh("\\mathcal{C}(t)")} = ${N("1")} - \\dfrac{\\lvert${Vv("\\mathbf{E}(t)")}\\rvert}{\\lvert${φ("\\mathbf{X}^{*}(t)")}\\rvert}`,
    terms:[
      { sym:"C(t)",  name:"Coherence at time t", color:C.coh, meaning:"Normalized error complement ∈ [0,1]. The closer to 1, the more the system matches its target state." },
      { sym:"E(t)",  name:"Error vector",         color:C.vec, meaning:"E(t) = X*(t) − X(t). Distance from desired state. Drives the control correction u(t) proportionally." },
      { sym:"X*(t)", name:"Target / reference state", color:C.phi, meaning:"The desired relational state — healthy tissue, balanced ecology, stable orbit. System always moves toward this." },
    ],
  },
  {
    id:"cgle", cat:"AETHER Coherence", label:"Complex Ginzburg-Landau Equation",
    desc:"The AETHER crystallization equation. Describes how order emerges from a chaotic field — pattern formation, spiral waves, coherent states.",
    tex:`\\dfrac{${O("\\partial")} ${Coh("A")}}{${O("\\partial")} t} = ${Coh("A")} + (${N("1")} + i${φ("\\alpha")})${O("\\nabla^2")}${Coh("A")} - (${N("1")} + i${φ("\\beta")})|${Coh("A")}|^{${N("2")}}${Coh("A")}`,
    terms:[
      { sym:"A",        name:"Complex amplitude field", color:C.coh, meaning:"|A| = amplitude (coherence strength), arg(A) = local phase. The AETHER order parameter." },
      { sym:"∂A/∂t",   name:"Time derivative",          color:C.op,  meaning:"Rate of change of the field. Left side = how A evolves. Right side = three forces driving it." },
      { sym:"∇²A",      name:"Laplacian (diffusion)",    color:C.op,  meaning:"Spatial smoothing. Coherent patches spread outward; isolated fluctuations are damped." },
      { sym:"α",        name:"Linear dispersion",        color:C.phi, meaning:"Governs linear coupling between amplitude and phase gradients. Controls wave propagation speed." },
      { sym:"β",        name:"Nonlinear dispersion",     color:C.phi, meaning:"Controls nonlinear frequency shift. β > 1 → Benjamin-Feir instability → spiral chaos." },
      { sym:"-|A|²A",   name:"Saturation term",          color:C.coh, meaning:"Cubic nonlinearity. Prevents unbounded growth — sets the amplitude of the final coherent state." },
    ],
  },
  {
    id:"clcs-loop", cat:"AETHER Coherence", label:"CLCS Control Law",
    desc:"The closed-loop control that keeps AETHER nodes aligned. Not forcing — gently guiding. Natural flow plus coherence correction.",
    tex:`${O("\\dot{\\mathbf{x}}")} = ${V("\\mathbf{v}(\\mathbf{x})")} + ${Vv("\\mathbf{u}_{\\mathrm{input}}")} + ${Coh("\\mathbf{u}_{\\mathrm{control}}")} \\quad \\text{where} \\quad ${Coh("\\mathbf{u}")} = ${φ("K")}\\,${Vv("\\mathbf{E}(t)")}`,
    terms:[
      { sym:"ẋ",       name:"State velocity",       color:C.op,  meaning:"How fast the system state moves. Sum of natural flow + intention + correction." },
      { sym:"v(x)",    name:"Natural vector field",  color:C.var, meaning:"The system's inherent direction of motion — biology, physics, ecology. AETHER flows within this." },
      { sym:"u_input", name:"Intention injection",   color:C.vec, meaning:"External goal or intention vector. Modifies the vector field itself, not just the trajectory." },
      { sym:"u_ctrl",  name:"Coherence correction",  color:C.coh, meaning:"Proportional feedback u = K·E. Nudges toward target — never forces. Aligns, not dominates." },
      { sym:"K",       name:"Gain matrix",           color:C.phi, meaning:"Tuning parameter. Larger K = faster correction but risk of overshoot and oscillation." },
    ],
  },
  {
    id:"lqg-area", cat:"Quantum Gravity", label:"LQG Area Eigenvalue",
    desc:"Spacetime has a minimum area. No smooth manifold at the Planck scale — only discrete quanta labelled by spin quantum number j.",
    tex:`${Lqg("A_j")} = ${N("8")}${φ("\\pi")}\\,${φ("\\gamma")}\\,${Lqg("\\ell_P^2")}\\,\\sqrt{${V("j")}(${V("j")}+${N("1")})}`,
    terms:[
      { sym:"A_j",  name:"Area eigenvalue",           color:C.lqg, meaning:"The discrete area of a spin-j edge in a spin network. Cannot take continuous values." },
      { sym:"γ",    name:"Barbero-Immirzi parameter", color:C.phi, meaning:"γ ≈ 0.2375. Fixed by demanding LQG reproduces the Bekenstein-Hawking black hole entropy formula." },
      { sym:"ℓ_P",  name:"Planck length",             color:C.lqg, meaning:"ℓ_P ≈ 1.616 × 10⁻³⁵ m. The fundamental quantum of length. Below this, 'length' loses classical meaning." },
      { sym:"j",    name:"Spin quantum number",       color:C.var, meaning:"j ∈ {½, 1, 3/2, 2, …}. Labels SU(2) irreducible representations. Each spin-network edge carries one j." },
      { sym:"√j(j+1)", name:"Casimir operator",      color:C.fn,  meaning:"Quadratic Casimir of SU(2). Eigenvalue of angular-momentum-squared in quantum mechanics." },
    ],
  },
  {
    id:"planck", cat:"Quantum Gravity", label:"Planck Length",
    desc:"The scale at which quantum gravitational effects dominate. Derived from the three fundamental constants governing QM, gravity, and relativity.",
    tex:`${Lqg("\\ell_P")} = \\sqrt{\\dfrac{${φ("\\hbar")}\\,${Coh("G")}}{${V("c")}^{${N("3")}}}} \\approx ${N("1.616")} \\times ${N("10^{-35}")}\\,\\mathrm{m}`,
    terms:[
      { sym:"ℓ_P", name:"Planck length",                 color:C.lqg, meaning:"≈ 1.616 × 10⁻³⁵ m. Seventeen orders of magnitude smaller than a proton. Spacetime granularity." },
      { sym:"ℏ",   name:"Reduced Planck constant",       color:C.phi, meaning:"ℏ = h/2π ≈ 1.055 × 10⁻³⁴ J·s. The fundamental quantum of action. Governs all quantum mechanics." },
      { sym:"G",   name:"Newton's gravitational constant",color:C.coh, meaning:"G ≈ 6.674 × 10⁻¹¹ N·m²/kg². Couples mass to spacetime curvature in Einstein's field equations." },
      { sym:"c",   name:"Speed of light",                color:C.var, meaning:"c ≈ 2.998 × 10⁸ m/s. The universal speed limit. c³ in denominator reflects three spatial dimensions." },
    ],
  },
  {
    id:"bh-entropy", cat:"Quantum Gravity", label:"Bekenstein-Hawking Black Hole Entropy",
    desc:"A black hole's entropy is proportional to its horizon area — not its volume. The deepest clue that spacetime information is fundamentally 2D.",
    tex:`${Coh("S")} = \\dfrac{${Lqg("A")}}{${N("4")}\\,${Lqg("\\ell_P^2")}} \\cdot ${φ("k_B")} = \\dfrac{${Lqg("A")}\\,${V("c^3")}}{${N("4")}\\,${φ("\\hbar")}\\,${Coh("G")}} \\cdot ${φ("k_B")}`,
    terms:[
      { sym:"S",   name:"Entropy",            color:C.coh, meaning:"Information content. For a black hole: S = A/4ℓ_P² k_B — horizon area counts Planck-area pixels." },
      { sym:"A",   name:"Horizon area",       color:C.lqg, meaning:"The area of the event horizon in m². Larger black hole = more surface pixels = more stored entropy." },
      { sym:"k_B", name:"Boltzmann constant", color:C.phi, meaning:"k_B ≈ 1.381 × 10⁻²³ J/K. Converts between temperature and energy — anchors the entropy scale." },
    ],
  },
  {
    id:"solar", cat:"Energy & Power", label:"Solar Power — Fibonacci Farm",
    desc:"Free energy from sunlight, tiled with φ²-efficiency. Fibonacci packing wastes no panel area — each tile fits the next without gaps.",
    tex:`${Coh("P")} = ${φ("\\eta")} \\cdot ${V("G_s")} \\cdot ${Lqg("A_{\\phi}")} \\cdot ${F("\\cos")}(${Vv("\\delta")}), \\quad ${Lqg("A_{\\phi}")} = ${V("N")} \\cdot ${φ("\\phi^2")} \\cdot ${V("s")}`,
    terms:[
      { sym:"P",       name:"Power output (W)",    color:C.coh, meaning:"Total electrical power from the Fibonacci-tiled solar array in watts." },
      { sym:"η",       name:"Panel efficiency",    color:C.phi, meaning:"η ≈ 0.22 for modern monocrystalline silicon. Fraction of incident light converted to electricity." },
      { sym:"G_s",     name:"Solar irradiance",    color:C.var, meaning:"G_s ≈ 900–1000 W/m² at Earth's surface. Power density of sunlight before panel losses." },
      { sym:"A_φ",     name:"φ²-tiled area",       color:C.lqg, meaning:"Total panel area in Fibonacci φ² tiles. N·φ²·s where s = single panel area. Zero geometric waste." },
      { sym:"cos(δ)",  name:"Angle of incidence",  color:C.fn,  meaning:"Cosine of angle between sunlight and panel normal. SOLAR-φ3 robot optimises δ → 0 in real time." },
    ],
  },
  {
    id:"resonant-power", cat:"Energy & Power", label:"Resonant Power Harvest (AETHER Wave)",
    desc:"Fibonacci-gated wave coherence amplifies ambient energy beyond baseline. Coherent field packets exceed classical prediction.",
    tex:`${Coh("P_\\mathrm{free}")} = ${V("P_0")}\\!\\left(${N("1")} + \\dfrac{${O("\\Sigma")}\\,${Coh("\\psi")}_\\mathrm{gated}}{${φ("N")}} \\cdot ${φ("\\phi")}\\right)`,
    terms:[
      { sym:"P_free",      name:"Coherence-amplified power", color:C.coh, meaning:"Total harvested power after Fibonacci gate amplification. Exceeds P₀ when gated coherence is high." },
      { sym:"P₀",          name:"Baseline power",            color:C.var, meaning:"Standard solar panel output without coherence gating. The floor — P_free ≥ P₀ always." },
      { sym:"Σ ψ_gated",   name:"Sum of gated coherence",    color:C.coh, meaning:"Sum over all Fibonacci-gate-passing wave packets. Higher coherence = more gated packets = more power." },
      { sym:"φ amplifier", name:"Golden amplifier",          color:C.phi, meaning:"The φ factor converts coherence gain to power gain. Reflects φ²-area tiling efficiency." },
    ],
  },
  {
    id:"aether-wave", cat:"AETHER Wave", label:"AETHER Master Wave Equation",
    desc:"Golden-ratio amplifier φ × a 3-6-9 toroidal vortex operator driving a damped wave equation for living granular systems.",
    tex:`\\dfrac{${O("\\partial^2")}${Coh("\\psi")}}{${O("\\partial")} t^2} = ${V("c^2")}${O("\\nabla^2")}${Coh("\\psi")} + ${φ("\\phi")}\\cdot${F("\\mathcal{R}_{369}")}(${Coh("\\psi")}) - ${φ("\\gamma")}\\dfrac{${O("\\partial")}${Coh("\\psi")}}{${O("\\partial")} t}`,
    terms:[
      { sym:"ψ",            name:"AETHER field",           color:C.coh, meaning:"The living wave field permeating the AETHER substrate — light, biophotons, and coherence all propagate as ψ." },
      { sym:"c²∇²ψ",        name:"Wave propagation",       color:C.var, meaning:"Standard wave equation term. Spatial curvature of ψ drives propagation at speed c through the medium." },
      { sym:"φ·R₃₆₉(ψ)",   name:"Toroidal vortex amplifier",color:C.phi, meaning:"R₃₆₉(ψ) = sin(9θ)·exp(−0.05θ). Captures Tesla's 3-6-9 resonance in spiral media. φ amplifies." },
      { sym:"−γ·∂ψ/∂t",    name:"Damping term",           color:C.phi, meaning:"Dissipation preventing runaway oscillation. γ ≈ Immirzi parameter — connects biology to quantum gravity." },
    ],
  },
  {
    id:"fib-wave", cat:"AETHER Wave", label:"Fibonacci Toroidal Wave",
    desc:"A propagating wave locked to φ-spiral geometry. Amplitude scales as φ/r — coherent power is maintained over distance unlike 1/r² for incoherent waves.",
    tex:`${Coh("\\psi")}(r,${Vv("\\theta")},t) = ${V("A_0")} \\cdot \\dfrac{${φ("\\phi")}}{r} ${F("\\sin")}\\!\\left(${V("k")}r - ${V("\\omega")} t + ${N("9")}${Vv("\\theta")}\\right) e^{-${Vv("\\theta")}/20}`,
    terms:[
      { sym:"A₀",     name:"Initial amplitude",    color:C.var, meaning:"Seed amplitude at the centre of the spiral farm. Broadcasts outward along the φ-spiral arms." },
      { sym:"φ/r",    name:"Golden amplitude decay",color:C.phi, meaning:"Amplitude scales as φ/r, not 1/r². Coherent wave — energy is focused along Fibonacci arms, not lost isotropically." },
      { sym:"9θ",     name:"9θ toroidal phase",    color:C.num, meaning:"Encodes 9-fold vortex symmetry (Tesla 3-6-9). Sets phase resonances at θ = π/9, 2π/9, … — the spiral nodes." },
      { sym:"e^(−θ/20)", name:"Angular damping",   color:C.fn,  meaning:"Exponential attenuation along spiral angle. Ensures wave converges to farm centre rather than escaping." },
    ],
  },
  {
    id:"pigment-diffusion", cat:"AETHER Wave", label:"Granular Pigment–Wave Diffusion",
    desc:"Bridges granular physics with AETHER biophoton coherence. Shows how pure-gold nutrients flow from soil to plant to human cell.",
    tex:`\\dfrac{${O("\\partial")} ${V("C_i")}}{${O("\\partial")} t} = ${V("D_i")}${O("\\nabla^2")}${V("C_i")} + ${φ("\\phi")} \\cdot ${Coh("\\psi")} \\cdot ${V("C_i")}(${N("1")} - ${V("C_i")}) - ${φ("\\kappa")}\\dfrac{${O("\\partial^2")}${V("C_i")}}{${O("\\partial")}${Vv("\\theta")}^{${N("2")}}}`,
    terms:[
      { sym:"Cᵢ",            name:"Pigment concentration",        color:C.var, meaning:"Concentration of ith pigment fraction (chlorophyll/carotenoid/anthocyanin) in granular soil. ∈ [0, 1]." },
      { sym:"Dᵢ∇²Cᵢ",       name:"Fickian diffusion",            color:C.var, meaning:"Standard diffusion through granular soil. Dᵢ = diffusivity. Gaussian spreading through particle gaps." },
      { sym:"φ·ψ·Cᵢ(1−Cᵢ)", name:"Coherent wave amplification",  color:C.phi, meaning:"Novel coupling: AETHER biophoton field ψ directly drives pigment uptake. φ scales the coupling." },
      { sym:"κ·∂²Cᵢ/∂θ²",   name:"Angular dispersion",          color:C.phi, meaning:"Fibonacci-angular diffusion. Pigments preferentially diffuse along spiral arms — zero-waste transport." },
    ],
  },
  {
    id:"cuca-state", cat:"CUCA Architecture", label:"CUCA–AETHER State Vector S(t)",
    desc:"The full multi-domain state of the CUCA system. Unifies biological phase, coherence, body/environment/social/chemical signals.",
    tex:`${V("\\mathbf{S}(t)")} = \\bigl[${Vv("\\theta(t)")},\\; ${Coh("\\mathcal{C}(t)")},\\; ${V("\\mathbf{b}(t)")},\\; ${V("\\mathbf{e}(t)")},\\; ${V("\\mathbf{s}(t)")},\\; ${V("\\mathbf{v}(t)")}\\bigr]`,
    terms:[
      { sym:"S(t)",    name:"Full system state",    color:C.var, meaning:"Complete multidimensional CUCA state. All other equations operate on or update this vector." },
      { sym:"θ(t)",    name:"Biological phase",     color:C.vec, meaning:"Cyclic phase of the biological oscillator. θ ∈ [0, 2π]. Modulates chemical emission: v(t) = g(θ(t), b(t))." },
      { sym:"C(t)",    name:"Coherence metric",     color:C.coh, meaning:"Real-time measure of system alignment. C → 1 = stable. C → 0 = trigger replication/intervention." },
      { sym:"b, e, s", name:"Body, Environment, Social", color:C.var, meaning:"Three signal domains. b = physiological state, e = environmental inputs, s = social/relational signals." },
      { sym:"v(t)",    name:"VOC signal vector",    color:C.var, meaning:"Volatile organic compound concentration vector — biochemical language of the system at time t." },
    ],
  },
  {
    id:"cuca-geometry", cat:"CUCA Architecture", label:"CUCA Phyllotactic Geometry Map",
    desc:"The 3D geometric rendering of system state. Coherence drives structural order; phase creates temporal modulation; VOC signals deform the spiral.",
    tex:`${Lqg("\\mathbf{x}_n(t)")} = \\begin{pmatrix} ${V("r_n'")}${F("\\cos")}(n${φ("\\phi")}) \\\\ ${V("r_n'")}${F("\\sin")}(n${φ("\\phi")}) \\\\ ${φ("\\gamma")}${F("\\sin")}(${Vv("\\theta(t)")}+${V("\\omega")} n) \\end{pmatrix} + (1-${Coh("\\mathcal{C}")})${Vv("\\xi_n")} + ${O("\\sum_i")} ${V("v_i")}${Vv("\\mathbf{d}_i")}`,
    terms:[
      { sym:"x_n(t)",      name:"3D position of nth node",    color:C.lqg, meaning:"Spatial location of nth element in CUCA geometry. Changes continuously as C(t) and v(t) evolve." },
      { sym:"r_n′·trig",   name:"Fibonacci spiral X/Y base",  color:C.var, meaning:"The 2D phyllotactic base: golden-angle placement on a √n-radius spiral." },
      { sym:"γ sin(θ+ωn)", name:"Z-modulation (phase)",       color:C.phi, meaning:"The biological phase θ(t) lifts the 2D spiral into 3D — creating a helical coherence structure in time." },
      { sym:"(1−C)·ξ_n",  name:"Incoherence distortion",     color:C.coh, meaning:"Random noise scaled by (1−C). At C = 1, geometry is perfectly ordered. At C = 0, it dissolves to noise." },
      { sym:"Σ vᵢ·dᵢ",    name:"VOC directional deformation",color:C.op,  meaning:"Each VOC compound pushes geometry in direction dᵢ with magnitude vᵢ. Biochemistry shapes form." },
    ],
  },
];

const CATEGORIES = [...new Set(EQUATIONS.map(e => e.cat))];

const TYPE_LABELS: Record<string, string> = {
  [C.phi]: "Golden / Constant",
  [C.var]: "Variable / State",
  [C.op]:  "Operator",
  [C.fn]:  "Function",
  [C.vec]: "Vector / Phase",
  [C.num]: "Number / Index",
  [C.coh]: "AETHER Coherence",
  [C.lqg]: "Quantum / Planck",
};

// ── Fibonacci background ──────────────────────────────────────────────────────
function PhiBgCanvas() {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d")!;
    let t = 0;
    let raf = 0;
    const SUNSET = ["#fbbf24","#f59e0b","#f97316","#fb7185","#ec4899","#c084fc","#818cf8","#06b6d4"];
    const draw = () => {
      canvas.width  = canvas.offsetWidth  || 800;
      canvas.height = canvas.offsetHeight || 600;
      const W = canvas.width;
      const H = canvas.height;
      ctx.clearRect(0, 0, W, H);
      const cx = W / 2;
      const cy = H / 2;
      const R  = Math.min(W, H) * 0.45;
      const ga = 2 * Math.PI / (1.618 * 1.618);
      for (let i = 0; i < 144; i++) {
        const r   = R * Math.sqrt((i + 1) / 144);
        const a   = i * ga + t * 0.003;
        const x   = cx + r * Math.cos(a);
        const y   = cy + r * Math.sin(a);
        const alpha = 0.07 + 0.05 * Math.sin(t * 0.04 + i * 0.3);
        const sz  = 1.3 + (i % 8 === 0 ? 1.6 : 0);
        const pct = ((i * 0.08 + t * 0.002) % 1 + 1) % 1;
        const n   = SUNSET.length - 1;
        const lo  = Math.floor(pct * n);
        const hi  = Math.min(lo + 1, n);
        const mix = pct * n - lo;
        const pa  = parseInt(SUNSET[lo].slice(1), 16);
        const pb  = parseInt(SUNSET[hi].slice(1), 16);
        const rr  = Math.round(((pa >> 16) & 0xff) * (1 - mix) + ((pb >> 16) & 0xff) * mix);
        const rg  = Math.round(((pa >>  8) & 0xff) * (1 - mix) + ((pb >>  8) & 0xff) * mix);
        const rb  = Math.round(( pa        & 0xff) * (1 - mix) + ( pb        & 0xff) * mix);
        ctx.beginPath();
        ctx.arc(x, y, sz, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${rr},${rg},${rb},${alpha})`;
        ctx.fill();
      }
      t++;
      raf = requestAnimationFrame(draw);
    };
    draw();
    return () => cancelAnimationFrame(raf);
  }, []);
  return (
    <canvas
      ref={ref}
      style={{ position: "absolute", inset: 0, width: "100%", height: "100%", pointerEvents: "none", zIndex: 0 }}
    />
  );
}

// ── Term hover tooltip ────────────────────────────────────────────────────────
function TermChip({ term, active, onHover, onLeave }: {
  term: Term;
  active: boolean;
  onHover: (t: Term, rect: DOMRect) => void;
  onLeave: () => void;
}) {
  const ref = useRef<HTMLButtonElement>(null);
  const handleEnter = useCallback(() => {
    if (ref.current) onHover(term, ref.current.getBoundingClientRect());
  }, [term, onHover]);

  return (
    <button
      ref={ref}
      onMouseEnter={handleEnter}
      onMouseLeave={onLeave}
      style={{
        all: "unset",
        cursor: "default",
        display: "inline-flex",
        alignItems: "center",
        gap: 7,
        padding: "6px 12px",
        borderRadius: 20,
        border: `1px solid ${active ? GOLD : term.color + "35"}`,
        background: active ? "rgba(242,195,84,0.1)" : `${term.color}08`,
        transition: "all 0.18s ease",
        boxShadow: active ? `0 0 14px rgba(242,195,84,0.25)` : "none",
      }}
    >
      <span style={{
        fontFamily: MONO,
        fontSize: 13,
        fontWeight: 700,
        color: active ? GOLD : term.color,
        transition: "color 0.18s",
        lineHeight: 1,
      }}>
        {term.sym}
      </span>
      <span style={{
        fontFamily: MONO,
        fontSize: 9,
        letterSpacing: "0.1em",
        color: active ? "rgba(242,195,84,0.7)" : `${term.color}80`,
        transition: "color 0.18s",
      }}>
        {term.name}
      </span>
    </button>
  );
}

// ── Saved entry ───────────────────────────────────────────────────────────────
const LS_SAVED = "aether.mathstudio.saved.v2";
interface SavedEntry { id: string; name: string; mode: string; latex: string; text: string; ts: number }
function loadSaved(): SavedEntry[] {
  try { return JSON.parse(localStorage.getItem(LS_SAVED) ?? "[]"); }
  catch { return []; }
}

function escHtml(s: string): string {
  return s.replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/\n/g,"<br/>");
}

function renderMixed(input: string): string {
  const parts: string[] = [];
  let rem = input;
  while (rem.length) {
    const d = rem.indexOf("$$");
    if (d !== -1) {
      const d2 = rem.indexOf("$$", d + 2);
      if (d2 !== -1) {
        if (d > 0) parts.push(`<span class="ms-text">${escHtml(rem.slice(0, d))}</span>`);
        parts.push(k(rem.slice(d + 2, d2)));
        rem = rem.slice(d2 + 2); continue;
      }
    }
    const s = rem.indexOf("$");
    if (s !== -1) {
      const s2 = rem.indexOf("$", s + 1);
      if (s2 !== -1) {
        if (s > 0) parts.push(`<span class="ms-text">${escHtml(rem.slice(0, s))}</span>`);
        parts.push(`<span class="ms-inline-katex">${k(rem.slice(s + 1, s2))}</span>`);
        rem = rem.slice(s2 + 1); continue;
      }
    }
    parts.push(`<span class="ms-text">${escHtml(rem)}</span>`);
    break;
  }
  return parts.join("");
}

// ── Main export ───────────────────────────────────────────────────────────────
export default function MathStudioPage() {
  const eqDisplayRef = useRef<HTMLDivElement>(null);

  const [selectedId,  setSelectedId]  = useState("kuramoto");
  const [activeCat,   setActiveCat]   = useState<string | null>(null);
  const [showCustom,  setShowCustom]  = useState(false);
  const [inputMode,   setInputMode]   = useState<"latex" | "text" | "mixed">("latex");
  const [customTex,   setCustomTex]   = useState("");
  const [customText,  setCustomText]  = useState("");
  const [saveName,    setSaveName]    = useState("");
  const [showSaveBar, setShowSaveBar] = useState(false);
  const [saved,       setSaved]       = useState<SavedEntry[]>(loadSaved);
  const [copied,      setCopied]      = useState(false);
  const [saveFlash,   setSaveFlash]   = useState(false);
  const [imgState,    setImgState]    = useState<"idle"|"working"|"done-clip"|"done-dl">("idle");

  // Tooltip state
  const [tooltip, setTooltip] = useState<{ term: Term; rect: DOMRect } | null>(null);

  const eq = EQUATIONS.find(e => e.id === selectedId) ?? EQUATIONS[0];
  const filtered = EQUATIONS.filter(e => !activeCat || e.cat === activeCat);

  const rendered: string = (() => {
    if (!showCustom) {
      return katex.renderToString(eq.tex, { throwOnError: false, output: "html", trust: true, displayMode: true });
    }
    if (inputMode === "latex") {
      return katex.renderToString(customTex, { throwOnError: false, output: "html", trust: true, displayMode: true });
    }
    if (inputMode === "text") {
      return customText.split("\n").map((line, li) =>
        `<div class="ms-textline" style="--li:${li}">${escHtml(line) || "&nbsp;"}</div>`
      ).join("");
    }
    return renderMixed(customText);
  })();

  const handleCopy = () => {
    const src = showCustom ? (inputMode === "latex" ? customTex : customText) : eq.tex;
    navigator.clipboard.writeText(src).then(() => {
      setCopied(true); setTimeout(() => setCopied(false), 2000);
    }).catch(() => {
      const ta = document.createElement("textarea");
      ta.value = src;
      document.body.appendChild(ta); ta.select();
      document.execCommand("copy");
      document.body.removeChild(ta);
      setCopied(true); setTimeout(() => setCopied(false), 2000);
    });
  };

  const handleSave = () => {
    if (!saveName.trim()) return;
    const entry: SavedEntry = {
      id: `${Date.now()}`, name: saveName.trim(), mode: inputMode,
      latex: customTex, text: customText, ts: Date.now(),
    };
    const next = [entry, ...saved].slice(0, 40);
    setSaved(next);
    localStorage.setItem(LS_SAVED, JSON.stringify(next));
    setSaveName(""); setShowSaveBar(false);
    setSaveFlash(true); setTimeout(() => setSaveFlash(false), 1800);
  };

  const handleLoad = (id: string) => {
    const e = saved.find(s => s.id === id); if (!e) return;
    setInputMode(e.mode as "latex" | "text" | "mixed");
    setCustomTex(e.latex); setCustomText(e.text);
    setShowCustom(true);
  };

  const handleDelete = (id: string) => {
    const next = saved.filter(s => s.id !== id);
    setSaved(next);
    localStorage.setItem(LS_SAVED, JSON.stringify(next));
  };

  const handleCopyImage = async () => {
    const el = eqDisplayRef.current;
    if (!el || imgState === "working") return;
    setImgState("working");
    try {
      await document.fonts.ready;
      const rect = el.getBoundingClientRect();
      const PAD = 40;
      const DPR = 2;
      const W   = Math.max(Math.ceil(rect.width) + PAD * 2, 420);
      const H   = Math.ceil(rect.height) + PAD * 2 + 32;
      const inlineCss = Array.from(document.styleSheets).flatMap(ss => {
        try { return Array.from(ss.cssRules).map(r => r.cssText); }
        catch { return []; }
      }).join("\n");
      const label = showCustom ? "AETHER · CUSTOM EQUATION" : `AETHER · ${eq.label.toUpperCase()}`;
      const svgStr = [
        `<svg xmlns="http://www.w3.org/2000/svg" width="${W * DPR}" height="${H * DPR}">`,
        `<rect width="100%" height="100%" fill="#020818"/>`,
        `<foreignObject x="0" y="0" width="${W * DPR}" height="${H * DPR}">`,
        `<html xmlns="http://www.w3.org/1999/xhtml"><head><style>`,
        `*{box-sizing:border-box;margin:0;padding:0;}`,
        `body{margin:0;padding:${PAD * DPR}px;background:transparent;`,
        `display:flex;align-items:center;justify-content:center;`,
        `min-height:${(H - 32) * DPR}px;}`,
        inlineCss,
        `.aether-katex .katex{font-size:${2.2 * DPR}em;color:rgba(255,255,255,0.92);}`,
        `</style></head><body>`,
        `<div class="aether-katex" style="max-width:${(W - PAD * 2) * DPR}px">`,
        el.innerHTML,
        `</div></body></html>`,
        `</foreignObject></svg>`,
      ].join("");
      const svgBlob = new Blob([svgStr], { type: "image/svg+xml;charset=utf-8" });
      const svgUrl  = URL.createObjectURL(svgBlob);
      await new Promise<void>((resolve, reject) => {
        const img = new Image();
        img.onload = () => {
          const offscreen = document.createElement("canvas");
          offscreen.width  = W * DPR;
          offscreen.height = H * DPR;
          const ctx = offscreen.getContext("2d")!;
          ctx.fillStyle = "#020818";
          ctx.fillRect(0, 0, offscreen.width, offscreen.height);
          ctx.drawImage(img, 0, 0);
          URL.revokeObjectURL(svgUrl);
          const footerY = (H - 32) * DPR;
          ctx.fillStyle = "#020c1a";
          ctx.fillRect(0, footerY, offscreen.width, 32 * DPR);
          ctx.font = `${10 * DPR}px "DM Mono", monospace`;
          ctx.fillStyle = "rgba(242,195,84,0.55)";
          ctx.textAlign = "center";
          ctx.fillText(label, offscreen.width / 2, footerY + 20 * DPR);
          offscreen.toBlob(pngBlob => {
            if (!pngBlob) { reject(new Error("toBlob failed")); return; }
            navigator.clipboard.write([new ClipboardItem({ "image/png": pngBlob })])
              .then(() => { setImgState("done-clip"); setTimeout(() => setImgState("idle"), 2400); resolve(); })
              .catch(() => {
                const a = document.createElement("a");
                a.download = `aether-${showCustom ? "custom" : eq.id}-eq.png`;
                a.href = offscreen.toDataURL("image/png");
                a.click();
                setImgState("done-dl"); setTimeout(() => setImgState("idle"), 2400);
                resolve();
              });
          }, "image/png");
        };
        img.onerror = () => { URL.revokeObjectURL(svgUrl); reject(new Error("img load failed")); };
        img.src = svgUrl;
      });
    } catch {
      setImgState("idle");
    }
  };

  const handleTermHover = useCallback((term: Term, rect: DOMRect) => {
    setTooltip({ term, rect });
  }, []);
  const handleTermLeave = useCallback(() => setTooltip(null), []);

  // ── Render ──────────────────────────────────────────────────────────────────
  return (
    <div style={{
      height: "100%", display: "flex", flexDirection: "column",
      background: BG, color: "#e2e8f0", fontFamily: MONO,
      overflow: "hidden", fontSize: 11, position: "relative",
    }}>
      <PhiBgCanvas />

      <div style={{ position: "relative", zIndex: 1, display: "flex", flexDirection: "column", height: "100%" }}>

        {/* ── TOP HEADER ── */}
        <div style={{
          padding: "12px 20px",
          borderBottom: `1px solid ${BRD}`,
          flexShrink: 0,
          display: "flex", alignItems: "center", gap: 14, flexWrap: "wrap",
          background: "rgba(2,8,18,0.85)",
          backdropFilter: "blur(8px)",
        }}>
          <div>
            <div style={{ fontSize: 13, fontWeight: 700, letterSpacing: "0.22em", color: GOLD }}>
              AETHER MATH STUDIO
            </div>
            <div style={{ fontSize: 9, color: "rgba(242,195,84,0.4)", letterSpacing: "0.14em", marginTop: 2 }}>
              {EQUATIONS.length} EQUATIONS · COLOR-CODED VARIABLES · HOVER TERM FOR DEFINITION
            </div>
          </div>

          {/* Color legend */}
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginLeft: 12 }}>
            {Object.entries(TYPE_LABELS).map(([col, label]) => (
              <div key={col} style={{ display: "flex", alignItems: "center", gap: 4, padding: "3px 8px", borderRadius: 12, border: `1px solid ${col}20`, background: `${col}08` }}>
                <div style={{ width: 6, height: 6, borderRadius: "50%", background: col, flexShrink: 0 }} />
                <span style={{ fontSize: 8, color: col, opacity: 0.9, letterSpacing: "0.08em" }}>{label}</span>
              </div>
            ))}
          </div>

          <div style={{ marginLeft: "auto", display: "flex", gap: 8, alignItems: "center" }}>
            {showCustom && saved.length > 0 && (
              <select
                onChange={e => { if (e.target.value) handleLoad(e.target.value); }}
                defaultValue=""
                style={{ background: "rgba(0,0,0,0.5)", border: `1px solid ${BRD}`, color: "rgba(255,255,255,0.5)", borderRadius: 4, padding: "3px 8px", fontSize: 8, cursor: "pointer", fontFamily: MONO }}>
                <option value="">load saved…</option>
                {saved.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
              </select>
            )}
            <button
              onClick={() => setShowCustom(s => !s)}
              style={{
                background: showCustom ? "rgba(242,195,84,0.12)" : "rgba(242,195,84,0.05)",
                border: `1px solid ${showCustom ? "rgba(242,195,84,0.5)" : "rgba(242,195,84,0.2)"}`,
                color: GOLD, borderRadius: 6, padding: "5px 14px",
                cursor: "pointer", fontSize: 9, fontFamily: MONO, letterSpacing: "0.14em",
              }}>
              {showCustom ? "✦ CUSTOM MODE" : "✦ CUSTOM INPUT"}
            </button>
          </div>
        </div>

        {/* ── MAIN 3-PANEL ── */}
        <div style={{ flex: 1, display: "grid", gridTemplateColumns: "228px 1fr 280px", minHeight: 0 }}>

          {/* LEFT — library list */}
          <div style={{ borderRight: `1px solid ${BRD}`, display: "flex", flexDirection: "column", overflow: "hidden", background: "rgba(2,8,18,0.6)" }}>
            {/* Category filters */}
            <div style={{ padding: "10px 10px 8px", borderBottom: `1px solid ${BRD}`, display: "flex", flexWrap: "wrap", gap: 4 }}>
              <button
                onClick={() => setActiveCat(null)}
                style={{ fontSize: 8, padding: "3px 9px", borderRadius: 12, border: `1px solid ${activeCat === null ? GOLD : "rgba(255,255,255,0.1)"}`, background: activeCat === null ? "rgba(242,195,84,0.1)" : "transparent", color: activeCat === null ? GOLD : "rgba(255,255,255,0.35)", cursor: "pointer", fontFamily: MONO }}>
                All
              </button>
              {CATEGORIES.map(cat => (
                <button key={cat} onClick={() => setActiveCat(c => c === cat ? null : cat)}
                  style={{ fontSize: 8, padding: "3px 9px", borderRadius: 12, border: `1px solid ${activeCat === cat ? GOLD : "rgba(255,255,255,0.1)"}`, background: activeCat === cat ? "rgba(242,195,84,0.1)" : "transparent", color: activeCat === cat ? GOLD : "rgba(255,255,255,0.35)", cursor: "pointer", fontFamily: MONO }}>
                  {cat}
                </button>
              ))}
            </div>

            {/* Equation list */}
            <div style={{ flex: 1, overflowY: "auto" }}>
              {filtered.map(e => {
                const isActive = selectedId === e.id && !showCustom;
                return (
                  <button key={e.id} onClick={() => { setSelectedId(e.id); setShowCustom(false); }}
                    style={{
                      width: "100%", textAlign: "left", padding: "10px 12px",
                      borderBottom: "1px solid rgba(255,255,255,0.04)",
                      background: isActive ? "rgba(242,195,84,0.07)" : "transparent",
                      border: "none",
                      borderLeft: `3px solid ${isActive ? GOLD : "transparent"}`,
                      cursor: "pointer", display: "block",
                      transition: "all 0.15s",
                    }}>
                    <div style={{ fontSize: 10, color: isActive ? GOLD : "rgba(255,255,255,0.55)", fontWeight: isActive ? 700 : 400, letterSpacing: "0.08em", fontFamily: MONO, lineHeight: 1.4 }}>
                      {e.label}
                    </div>
                    <div style={{ fontSize: 8, color: isActive ? "rgba(242,195,84,0.5)" : "rgba(255,255,255,0.2)", marginTop: 3, fontFamily: MONO, letterSpacing: "0.06em" }}>
                      {e.cat}
                    </div>
                  </button>
                );
              })}

              {saved.length > 0 && (
                <>
                  <div style={{ padding: "8px 12px 4px", fontSize: 7, color: "rgba(255,255,255,0.2)", letterSpacing: "0.2em", borderTop: `1px solid ${BRD}` }}>
                    SAVED
                  </div>
                  {saved.map(s => (
                    <div key={s.id} style={{ display: "flex", alignItems: "center", borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
                      <button onClick={() => handleLoad(s.id)}
                        style={{ flex: 1, textAlign: "left", padding: "7px 12px", background: "transparent", border: "none", cursor: "pointer" }}>
                        <div style={{ fontSize: 9, color: "#c084fc", fontFamily: MONO }}>{s.name}</div>
                        <div style={{ fontSize: 7, color: "rgba(255,255,255,0.2)", fontFamily: MONO }}>{s.mode}</div>
                      </button>
                      <button onClick={() => handleDelete(s.id)}
                        style={{ padding: "4px 8px", background: "transparent", border: "none", color: "rgba(255,255,255,0.2)", cursor: "pointer", fontSize: 12 }}>
                        ×
                      </button>
                    </div>
                  ))}
                </>
              )}
            </div>
          </div>

          {/* CENTER — equation display */}
          <div style={{ display: "flex", flexDirection: "column", borderRight: `1px solid ${BRD}`, background: "rgba(2,8,18,0.4)" }}>

            {/* Equation label / mode bar */}
            <div style={{ padding: "14px 20px 12px", borderBottom: `1px solid ${BRD}`, flexShrink: 0 }}>
              {showCustom ? (
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <span style={{ fontSize: 9, color: GOLD, letterSpacing: "0.2em" }}>INPUT MODE</span>
                  {(["latex","text","mixed"] as const).map(m => (
                    <button key={m} onClick={() => setInputMode(m)}
                      style={{ padding: "3px 10px", borderRadius: 10, fontSize: 8, cursor: "pointer", border: `1px solid ${inputMode === m ? GOLD : "rgba(255,255,255,0.12)"}`, background: inputMode === m ? "rgba(242,195,84,0.12)" : "transparent", color: inputMode === m ? GOLD : "rgba(255,255,255,0.4)", letterSpacing: "0.08em", fontFamily: MONO }}>
                      {m === "latex" ? "LaTeX" : m === "text" ? "Plain Text" : "Mixed"}
                    </button>
                  ))}
                </div>
              ) : (
                <>
                  <div style={{ fontSize: 14, fontWeight: 700, letterSpacing: "0.14em", color: GOLD, marginBottom: 5, fontFamily: MONO }}>
                    {eq.label.toUpperCase()}
                  </div>
                  <div style={{ fontSize: 11, color: "rgba(226,232,240,0.45)", lineHeight: 1.6, fontFamily: SERIF }}>
                    {eq.desc}
                  </div>
                </>
              )}
            </div>

            {/* Custom textarea */}
            {showCustom && (
              <div style={{ padding: "12px 20px", borderBottom: `1px solid ${BRD}`, flexShrink: 0 }}>
                {inputMode === "latex" ? (
                  <textarea
                    value={customTex}
                    onChange={e => setCustomTex(e.target.value)}
                    placeholder={"Enter LaTeX — e.g.  \\frac{\\partial \\psi}{\\partial t} = \\phi \\cdot \\nabla^2 \\psi\nColor: \\textcolor{#fbbf24}{φ}"}
                    rows={4}
                    style={{ width: "100%", background: "rgba(242,195,84,0.03)", border: `1px solid rgba(242,195,84,0.2)`, borderRadius: 6, color: GOLD, fontFamily: MONO, fontSize: 11, padding: "9px 12px", resize: "vertical", outline: "none", boxSizing: "border-box" }}
                  />
                ) : (
                  <textarea
                    value={customText}
                    onChange={e => setCustomText(e.target.value)}
                    placeholder={inputMode === "mixed" ? "Text + $inline math$ or $$display math$$" : "Plain text — rendered with sunset gradient"}
                    rows={4}
                    style={{ width: "100%", background: "rgba(192,132,252,0.03)", border: "1px solid rgba(192,132,252,0.18)", borderRadius: 6, color: "#c084fc", fontFamily: SERIF, fontSize: 12, padding: "9px 12px", resize: "vertical", outline: "none", boxSizing: "border-box" }}
                  />
                )}
              </div>
            )}

            {/* Equation render */}
            <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "28px 36px 12px", position: "relative", overflowY: "auto" }}>
              {/* Subtle border frame */}
              <div style={{ position: "absolute", inset: 16, border: `1px solid rgba(242,195,84,0.06)`, borderRadius: 14, pointerEvents: "none" }} />

              <div
                ref={eqDisplayRef}
                className="aether-katex"
                style={{ position: "relative", zIndex: 1, maxWidth: "100%", overflowX: "auto" }}
                dangerouslySetInnerHTML={{ __html: rendered }}
              />

              {/* Term chips */}
              {!showCustom && eq.terms.length > 0 && (
                <div style={{ marginTop: 28, display: "flex", flexWrap: "wrap", gap: 8, justifyContent: "center", position: "relative", zIndex: 1 }}>
                  {eq.terms.map((term, i) => (
                    <TermChip
                      key={i}
                      term={term}
                      active={tooltip?.term === term}
                      onHover={handleTermHover}
                      onLeave={handleTermLeave}
                    />
                  ))}
                </div>
              )}
            </div>

            {/* Action bar */}
            <div style={{ borderTop: `1px solid ${BRD}`, padding: "10px 20px", display: "flex", gap: 8, alignItems: "center", flexShrink: 0, flexWrap: "wrap", background: "rgba(2,8,18,0.7)" }}>
              <button onClick={handleCopy}
                style={{ background: copied ? "rgba(242,195,84,0.15)" : "rgba(242,195,84,0.06)", border: `1px solid ${copied ? "rgba(242,195,84,0.5)" : "rgba(242,195,84,0.2)"}`, color: GOLD, borderRadius: 5, padding: "5px 16px", cursor: "pointer", fontSize: 8, letterSpacing: "0.16em", fontFamily: MONO, transition: "all 0.2s" }}>
                {copied ? "✓ COPIED" : "⧉ COPY LATEX"}
              </button>

              <button onClick={handleCopyImage} disabled={imgState === "working"}
                style={{
                  background: imgState.startsWith("done") ? "rgba(99,179,237,0.12)" : "rgba(99,179,237,0.06)",
                  border: `1px solid ${imgState.startsWith("done") ? "rgba(99,179,237,0.5)" : "rgba(99,179,237,0.2)"}`,
                  color: "#63b3ed", borderRadius: 5, padding: "5px 16px",
                  cursor: imgState === "working" ? "wait" : "pointer",
                  fontSize: 8, letterSpacing: "0.16em", fontFamily: MONO, transition: "all 0.2s",
                  opacity: imgState === "working" ? 0.6 : 1,
                }}>
                {imgState === "done-clip" ? "✓ IMAGE COPIED" : imgState === "done-dl" ? "✓ IMAGE SAVED" : imgState === "working" ? "… RENDERING" : "⬡ COPY IMAGE"}
              </button>

              {showCustom && (
                <>
                  <button onClick={() => setShowSaveBar(s => !s)}
                    style={{ background: saveFlash ? "rgba(192,132,252,0.18)" : "rgba(192,132,252,0.06)", border: `1px solid ${saveFlash ? "rgba(192,132,252,0.6)" : "rgba(192,132,252,0.2)"}`, color: "#c084fc", borderRadius: 5, padding: "5px 16px", cursor: "pointer", fontSize: 8, letterSpacing: "0.16em", fontFamily: MONO, transition: "all 0.2s" }}>
                    {saveFlash ? "✓ SAVED" : "↓ SAVE"}
                  </button>
                  {showSaveBar && (
                    <>
                      <input value={saveName} onChange={e => setSaveName(e.target.value)}
                        onKeyDown={e => e.key === "Enter" && handleSave()}
                        placeholder="entry name…" autoFocus
                        style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(192,132,252,0.25)", borderRadius: 4, color: "rgba(255,255,255,0.7)", fontFamily: MONO, fontSize: 9, padding: "5px 10px", outline: "none", width: 140 }}
                      />
                      <button onClick={handleSave} disabled={!saveName.trim()}
                        style={{ background: saveName.trim() ? "rgba(192,132,252,0.15)" : "transparent", border: "1px solid rgba(192,132,252,0.3)", color: "#c084fc", borderRadius: 4, padding: "5px 12px", cursor: "pointer", fontSize: 8, letterSpacing: "0.14em", fontFamily: MONO }}>
                        CONFIRM
                      </button>
                    </>
                  )}
                </>
              )}
            </div>
          </div>

          {/* RIGHT — term deep-dive */}
          <div style={{ display: "flex", flexDirection: "column", overflow: "hidden", background: "rgba(2,8,18,0.7)" }}>
            <div style={{ padding: "12px 14px 10px", fontSize: 8, letterSpacing: "0.24em", color: GOLD, opacity: 0.7, borderBottom: `1px solid ${BRD}`, flexShrink: 0, fontFamily: MONO }}>
              {showCustom ? "✦ INPUT GUIDE" : "∑ VARIABLE DEFINITIONS"}
            </div>

            {showCustom ? (
              <div style={{ padding: "14px 16px", display: "flex", flexDirection: "column", gap: 14, overflowY: "auto" }}>
                {[
                  { col: GOLD, title: "LaTeX mode", body: "Standard KaTeX. Use \\textcolor{#hex}{x} for color-coded variables matching the type legend above." },
                  { col: "#c084fc", title: "Plain Text mode", body: "Type freely. Each line renders in the sunset ombré gradient — gold → orange → pink → violet → sky." },
                  { col: "#22c55e", title: "Mixed mode", body: "Text + inline math. Wrap LaTeX in $...$ or display blocks in $$...$$." },
                ].map(({ col, title, body }) => (
                  <div key={title} style={{ background: `${col}06`, border: `1px solid ${col}20`, borderRadius: 8, padding: "12px 14px" }}>
                    <div style={{ fontSize: 9, color: col, fontWeight: 700, marginBottom: 6, fontFamily: MONO, letterSpacing: "0.12em" }}>{title}</div>
                    <div style={{ fontSize: 11, color: "rgba(226,232,240,0.45)", lineHeight: 1.65, fontFamily: SERIF }}>{body}</div>
                  </div>
                ))}
              </div>
            ) : (
              <div style={{ flex: 1, overflowY: "auto" }}>
                {eq.terms.map((term, i) => {
                  const isHovered = tooltip?.term === term;
                  return (
                    <div key={i} style={{
                      padding: "14px 16px",
                      borderBottom: "1px solid rgba(255,255,255,0.05)",
                      borderLeft: `3px solid ${isHovered ? GOLD : term.color + "55"}`,
                      background: isHovered ? "rgba(242,195,84,0.06)" : "transparent",
                      transition: "all 0.18s ease",
                    }}>
                      {/* Symbol + type badge */}
                      <div style={{ display: "flex", alignItems: "baseline", gap: 10, marginBottom: 6 }}>
                        <span style={{
                          color: isHovered ? GOLD : term.color,
                          fontSize: 18, fontWeight: 700, fontFamily: MONO,
                          transition: "color 0.18s",
                          textShadow: isHovered ? `0 0 12px rgba(242,195,84,0.6)` : "none",
                        }}>
                          {term.sym}
                        </span>
                        <span style={{
                          fontSize: 8,
                          background: isHovered ? "rgba(242,195,84,0.15)" : `${term.color}15`,
                          border: `1px solid ${isHovered ? "rgba(242,195,84,0.4)" : term.color + "30"}`,
                          color: isHovered ? GOLD : term.color,
                          borderRadius: 4, padding: "1px 6px",
                          fontFamily: MONO, letterSpacing: "0.1em",
                          transition: "all 0.18s",
                        }}>
                          {TYPE_LABELS[term.color] ?? "Term"}
                        </span>
                      </div>

                      {/* Name */}
                      <div style={{ fontSize: 10, color: isHovered ? "rgba(242,195,84,0.85)" : "rgba(226,232,240,0.7)", fontWeight: 600, marginBottom: 6, fontFamily: MONO, letterSpacing: "0.06em", transition: "color 0.18s" }}>
                        {term.name}
                      </div>

                      {/* Meaning */}
                      <div style={{ fontSize: 11, color: "rgba(226,232,240,0.45)", lineHeight: 1.65, fontFamily: SERIF }}>
                        {term.meaning}
                      </div>
                    </div>
                  );
                })}

                {/* Bottom color key */}
                <div style={{ padding: "14px 16px", borderTop: `1px solid ${BRD}`, marginTop: "auto" }}>
                  <div style={{ fontSize: 7, letterSpacing: "0.22em", color: "rgba(255,255,255,0.2)", marginBottom: 8, fontFamily: MONO }}>
                    COLOR KEY
                  </div>
                  {Object.entries(TYPE_LABELS).map(([col, label]) => (
                    <div key={col} style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                      <div style={{ width: 7, height: 7, borderRadius: "50%", background: col, flexShrink: 0 }} />
                      <span style={{ fontSize: 9, color: col, opacity: 0.75, fontFamily: MONO }}>{label}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── HOVER TOOLTIP ── */}
      {tooltip && (() => {
        const { term, rect } = tooltip;
        const left = Math.min(rect.left + rect.width / 2, window.innerWidth - 280);
        const top  = rect.top - 8;
        return (
          <div style={{
            position: "fixed",
            left: Math.max(12, left - 140),
            top: top,
            transform: "translateY(-100%)",
            zIndex: 9999,
            width: 280,
            background: "rgba(4,10,24,0.98)",
            border: `1px solid ${GOLD}`,
            borderRadius: 10,
            padding: "14px 16px",
            boxShadow: `0 0 32px rgba(242,195,84,0.25), 0 4px 20px rgba(0,0,0,0.7)`,
            pointerEvents: "none",
          }}>
            {/* Gold top accent line */}
            <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 2, background: `linear-gradient(90deg, transparent, ${GOLD}, transparent)`, borderRadius: "10px 10px 0 0" }} />

            <div style={{ display: "flex", alignItems: "baseline", gap: 10, marginBottom: 8 }}>
              <span style={{ fontSize: 22, fontWeight: 700, color: GOLD, fontFamily: MONO, textShadow: `0 0 16px rgba(242,195,84,0.5)` }}>
                {term.sym}
              </span>
              <span style={{ fontSize: 8, background: "rgba(242,195,84,0.12)", border: "1px solid rgba(242,195,84,0.3)", color: GOLD, borderRadius: 4, padding: "1px 7px", fontFamily: MONO, letterSpacing: "0.1em" }}>
                {TYPE_LABELS[term.color] ?? "term"}
              </span>
            </div>

            <div style={{ fontSize: 11, color: "rgba(242,195,84,0.85)", fontWeight: 600, marginBottom: 8, fontFamily: MONO, letterSpacing: "0.06em" }}>
              {term.name}
            </div>

            <div style={{ fontSize: 12, color: "rgba(226,232,240,0.75)", lineHeight: 1.65, fontFamily: SERIF }}>
              {term.meaning}
            </div>

            {/* Arrow pointing down */}
            <div style={{ position: "absolute", bottom: -7, left: "50%", transform: "translateX(-50%)", width: 12, height: 7, overflow: "hidden" }}>
              <div style={{ width: 10, height: 10, background: GOLD, transform: "rotate(45deg) translateY(-5px)", marginLeft: 1, border: `1px solid ${GOLD}` }} />
            </div>
          </div>
        );
      })()}

      {/* ── GLOBAL STYLES ── */}
      <style>{`
        .aether-katex .katex { font-size: 2.4em; color: rgba(255,255,255,0.9); }
        .aether-katex .katex-display { overflow-x: auto; padding: 12px 0; }
        .aether-katex .katex .base { color: rgba(255,255,255,0.88); }
        .aether-katex .katex .mfrac .frac-line { border-bottom-color: rgba(242,195,84,0.55) !important; }
        .aether-katex .katex .sqrt > .sqrt-sign { color: rgba(242,195,84,0.65); }
        .ms-textline {
          background: linear-gradient(90deg, #fbbf24, #f97316, #ec4899, #c084fc, #06b6d4);
          background-size: 300% 100%;
          background-position: calc(var(--li, 0) * 18%) 0;
          -webkit-background-clip: text; -webkit-text-fill-color: transparent;
          background-clip: text;
          font-size: 15px; font-weight: 500; line-height: 1.85; min-height: 1.85em;
        }
        .ms-text-render .ms-text {
          background: linear-gradient(90deg,#fbbf24 0%,#f97316 25%,#ec4899 50%,#c084fc 75%,#06b6d4 100%);
          -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text;
        }
        .ms-text-render .ms-inline-katex .katex { font-size: 1.1em; color: rgba(255,255,255,0.9); }
        .ms-text-render .katex-display { color: rgba(255,255,255,0.9); font-size: 1.4em; overflow-x: auto; }
      `}</style>
    </div>
  );
}
