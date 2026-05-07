import { useEffect, useRef, useState } from "react";
import katex from "katex";
import "katex/dist/katex.min.css";

// ── Color palette ────────────────────────────────────────────────────────────
const C = {
  phi:      "#fbbf24", // golden constants  φ γ π
  var:      "#06b6d4", // state variables   x y z A ψ
  op:       "#22c55e", // operators         ∂ ∇ ∫ Σ
  fn:       "#c084fc", // functions         sin cos exp
  vec:      "#ec4899", // vectors / tensors θ E B
  num:      "#f97316", // numbers & indices
  coh:      "#00ff88", // AETHER coherence  C ψ coherence
  lqg:      "#60a5fa", // LQG quantities    j A_j ℓ_P
};

// ── KaTeX helper ─────────────────────────────────────────────────────────────
function k(tex: string) {
  try { return katex.renderToString(tex, { throwOnError: false, output: "html", trust: true }); }
  catch { return `<span style="color:#ef4444;font-size:10px">parse error</span>`; }
}

// ── Color-coded LaTeX strings ────────────────────────────────────────────────
// Each equation uses \textcolor{hex}{content}  (KaTeX supports this natively)
const φ  = (s: string) => `\\textcolor{${C.phi}}{${s}}`;
const V  = (s: string) => `\\textcolor{${C.var}}{${s}}`;
const O  = (s: string) => `\\textcolor{${C.op}}{${s}}`;
const F  = (s: string) => `\\textcolor{${C.fn}}{${s}}`;
const Vv = (s: string) => `\\textcolor{${C.vec}}{${s}}`;
const N  = (s: string) => `\\textcolor{${C.num}}{${s}}`;
const Coh = (s: string) => `\\textcolor{${C.coh}}{${s}}`;
const Lqg = (s: string) => `\\textcolor{${C.lqg}}{${s}}`;

// ── Equation library ─────────────────────────────────────────────────────────
interface Term { sym: string; name: string; color: string; meaning: string }
interface Eq {
  id: string; cat: string; label: string; desc: string;
  tex: string; terms: Term[];
}

const EQUATIONS: Eq[] = [
  // ── Fibonacci / Golden ──────────────────────────────────────────────────
  {
    id:"phi", cat:"Golden Ratio", label:"Golden Ratio φ",
    desc:"The most irrational number. Ratio of consecutive Fibonacci numbers. Foundation of AETHER's phyllotaxis engine.",
    tex:`${φ("\\phi")} = \\dfrac{${N("1")} + \\sqrt{${N("5")}}}{${N("2")}} \\approx ${φ("1.6180339887")}`,
    terms:[
      { sym:"φ", name:"Golden Ratio", color:C.phi, meaning:"The unique positive root of x² = x + 1. Basis of Fibonacci spiral geometry." },
      { sym:"√5", name:"Square root of 5", color:C.num, meaning:"Irrational component — makes φ transcend rational approximation." },
      { sym:"2", name:"Denominator", color:C.num, meaning:"The normalization that produces the [0,1] range self-similar ratio." },
    ],
  },
  {
    id:"fib-spiral", cat:"Golden Ratio", label:"Fibonacci Spiral Placement",
    desc:"Every seed/crop is placed at angle n × 137.508° from the previous. The golden angle — no two plants ever share the same ray from centre.",
    tex:`${V("r_n")} = ${Lqg("R")}\\sqrt{\\dfrac{${V("n")}}{${φ("N")}}}, \\qquad ${Vv("\\theta_n")} = ${V("n")} \\cdot ${φ("137.508°")}`,
    terms:[
      { sym:"r_n", name:"Radial distance of nth plant", color:C.var, meaning:"Grows as √n — equal-area ring packing for uniform light access." },
      { sym:"R", name:"Farm radius", color:C.lqg, meaning:"Outer boundary of the circular farm. Scales all positions." },
      { sym:"θ_n", name:"Angular position", color:C.vec, meaning:"n × 137.508° — the golden angle, ensuring no two plants share a direction vector from centre." },
      { sym:"137.508°", name:"Golden angle", color:C.phi, meaning:"= 360° / φ² = 2π/φ². The only angle that never repeats modulo a circle. Denser than any rational fraction." },
    ],
  },
  {
    id:"golden-gate", cat:"Golden Ratio", label:"AETHER Math Gate (Coherence Filter)",
    desc:"Only wave packets passing the Fibonacci-quantized coherence gate are transmitted. Drops ~66% of incoherent data instantly.",
    tex:`G(${Vv("\\theta")}) = \\begin{cases} ${N("1")} & ${F("\\cos^2")}\\!\\left(\\dfrac{${Vv("\\theta")} \\bmod \\frac{2${φ("\\pi")}}{${φ("\\phi")}}}{${N("1")}}\\right) > ${N("0.8")} \\\\ ${N("0")} & \\text{otherwise} \\end{cases}`,
    terms:[
      { sym:"G(θ)", name:"Gate function", color:C.vec, meaning:"Binary coherence gate. 1 = pass, 0 = reject. Applied to every sensor packet, wave, or pigment fraction." },
      { sym:"cos²(·)", name:"Squared cosine", color:C.fn, meaning:"Produces periodic maxima at Fibonacci phase resonances. Peak = 1, trough = 0." },
      { sym:"2π/φ", name:"Fibonacci period", color:C.phi, meaning:"The angular period of the gate — set to the golden ratio interval. Only resonant packets pass." },
      { sym:"0.8", name:"Coherence threshold", color:C.num, meaning:"The minimum coherence score for transmission. ~33.6% of packets pass on a full Fibonacci spiral." },
    ],
  },

  // ── AETHER Coherence ────────────────────────────────────────────────────
  {
    id:"kuramoto", cat:"AETHER Coherence", label:"Kuramoto Order Parameter ψ",
    desc:"Measures global synchrony of N oscillators. ψ = 1 → perfect coherence. ψ → 1/φ for Fibonacci phyllotaxis — the golden coherence ratio.",
    tex:`${Coh("\\psi")} = \\dfrac{${N("1")}}{${φ("N")}} \\left| \\sum_{${V("k")}=${N("1")}}^{${φ("N")}} e^{\\,i${Vv("\\theta_k")}} \\right|`,
    terms:[
      { sym:"ψ", name:"Coherence order parameter", color:C.coh, meaning:"Magnitude of the mean complex phasor. 0 = incoherent, 1 = perfectly phase-locked." },
      { sym:"N", name:"Number of oscillators", color:C.phi, meaning:"Total agents (plants, nodes, robots). For AETHER farms: N = 89 or 144 (Fibonacci numbers)." },
      { sym:"e^(iθ_k)", name:"Complex phasor", color:C.vec, meaning:"Unit vector on the complex plane at phase angle θ_k. The sum of N phasors gives the collective field direction." },
      { sym:"|·|", name:"Modulus", color:C.op, meaning:"Length of the sum vector. Cancellation of opposing phasors reduces ψ; alignment increases it." },
    ],
  },
  {
    id:"coherence", cat:"AETHER Coherence", label:"AETHER Coherence Metric C(t)",
    desc:"CLCS (Closed Loop Coherence System) stability measure. C → 1 means error is vanishing. C → 0 means replication is triggered.",
    tex:`${Coh("\\mathcal{C}(t)")} = ${N("1")} - \\dfrac{\\lvert${Vv("\\mathbf{E}(t)")}\\rvert}{\\lvert${φ("\\mathbf{X}^{*}(t)")}\\rvert}`,
    terms:[
      { sym:"C(t)", name:"Coherence at time t", color:C.coh, meaning:"Normalized error complement. The closer to 1, the more the system matches its target state." },
      { sym:"E(t)", name:"Error vector", color:C.vec, meaning:"E(t) = X*(t) − X(t). Distance from desired state. Drives the control correction u(t)." },
      { sym:"X*(t)", name:"Target state", color:C.phi, meaning:"The desired relational state — healthy tissue, balanced ecology, stable orbit. System is always moving toward this." },
    ],
  },
  {
    id:"cgle", cat:"AETHER Coherence", label:"Complex Ginzburg-Landau Equation",
    desc:"The AETHER crystallization equation. Describes how order emerges from a chaotic field — pattern formation, spiral waves, coherent states.",
    tex:`\\dfrac{${O("\\partial")} ${Coh("A")}}{${O("\\partial")} t} = ${Coh("A")} + (${N("1")} + i${φ("\\alpha")})${O("\\nabla^2")}${Coh("A")} - (${N("1")} + i${φ("\\beta")})|${Coh("A")}|^{${N("2")}}${Coh("A")}`,
    terms:[
      { sym:"A", name:"Complex amplitude field", color:C.coh, meaning:"The AETHER order parameter. |A| = amplitude (coherence strength), arg(A) = local phase." },
      { sym:"∂A/∂t", name:"Time derivative", color:C.op, meaning:"Rate of change of the field. Left side = how A evolves. Right side = the three forces driving it." },
      { sym:"∇²A", name:"Laplacian (diffusion)", color:C.op, meaning:"Spatial smoothing term. Coherent patches spread; isolated fluctuations are damped." },
      { sym:"α", name:"Linear dispersion", color:C.phi, meaning:"Governs the linear coupling between amplitude and phase gradients. Controls wave speed." },
      { sym:"β", name:"Nonlinear dispersion", color:C.phi, meaning:"Controls the nonlinear frequency shift. β > 1 → Benjamin-Feir instability → spiral chaos." },
      { sym:"-|A|²A", name:"Saturation term", color:C.coh, meaning:"Cubic nonlinearity. Prevents unbounded growth — sets the amplitude of the final coherent state." },
    ],
  },
  {
    id:"clcs-loop", cat:"AETHER Coherence", label:"CLCS Control Law",
    desc:"The closed-loop control that keeps AETHER nodes aligned. Not forcing — gently guiding. Natural flow plus coherence correction.",
    tex:`${O("\\dot{\\mathbf{x}}")} = ${V("\\mathbf{v}(\\mathbf{x})")} + ${Vv("\\mathbf{u}_{input}")} + ${Coh("\\mathbf{u}_{control}}")} \\quad \\text{where} \\quad ${Coh("\\mathbf{u}")} = ${φ("K")}\\,${Vv("\\mathbf{E}(t)")}`,
    terms:[
      { sym:"ẋ", name:"State velocity", color:C.op, meaning:"How fast the system state moves. Sum of natural flow + intention + correction." },
      { sym:"v(x)", name:"Natural vector field", color:C.var, meaning:"The system's inherent direction of motion — biology, physics, ecology. AETHER flows within this." },
      { sym:"u_input", name:"Intention injection", color:C.vec, meaning:"External goal or intention vector. Modifies the vector field itself, not just the node." },
      { sym:"u_control", name:"Coherence correction", color:C.coh, meaning:"Proportional feedback u = K·E. Nudges toward target — never forces. Aligns, not dominates." },
      { sym:"K", name:"Gain matrix", color:C.phi, meaning:"Tuning parameter. Larger K = faster correction but risk of overshoot and oscillation." },
    ],
  },

  // ── Quantum Gravity ─────────────────────────────────────────────────────
  {
    id:"lqg-area", cat:"Quantum Gravity", label:"LQG Area Eigenvalue",
    desc:"Spacetime has a minimum area. No smooth manifold at the Planck scale — only discrete quanta, each labelled by a spin quantum number j.",
    tex:`${Lqg("A_j")} = ${N("8")}${φ("\\pi")}\\,${φ("\\gamma")}\\,${Lqg("\\ell_P^2")}\\,\\sqrt{${V("j")}(${V("j")}+${N("1")})}`,
    terms:[
      { sym:"A_j", name:"Area eigenvalue", color:C.lqg, meaning:"The discrete area associated with a spin-j edge in a spin network. Cannot take continuous values." },
      { sym:"γ", name:"Barbero-Immirzi parameter", color:C.phi, meaning:"γ ≈ 0.2375. Fixed by demanding LQG reproduces the Bekenstein-Hawking black hole entropy formula." },
      { sym:"ℓ_P", name:"Planck length", color:C.lqg, meaning:"ℓ_P = √(ℏG/c³) ≈ 1.616 × 10⁻³⁵ m. The fundamental quantum of length. Below this, 'length' loses classical meaning." },
      { sym:"j", name:"Spin quantum number", color:C.var, meaning:"j ∈ {½, 1, 3/2, 2, …}. Labels SU(2) irreducible representations. Each edge in the spin network carries one j." },
      { sym:"√j(j+1)", name:"Casimir operator", color:C.fn, meaning:"The quadratic Casimir of SU(2). Eigenvalue of the angular-momentum-squared operator in quantum mechanics." },
    ],
  },
  {
    id:"planck", cat:"Quantum Gravity", label:"Planck Length",
    desc:"The scale at which quantum gravitational effects dominate. Derived from the three fundamental constants that govern QM (ℏ), gravity (G), and relativity (c).",
    tex:`${Lqg("\\ell_P")} = \\sqrt{\\dfrac{${φ("\\hbar")}\\,${Coh("G")}}{${V("c")}^{${N("3")}}}} \\approx ${N("1.616")} \\times ${N("10^{-35}")}\\,\\mathrm{m}`,
    terms:[
      { sym:"ℓ_P", name:"Planck length", color:C.lqg, meaning:"≈ 1.616 × 10⁻³⁵ m. Seventeen orders of magnitude smaller than a proton. Spacetime granularity lives here." },
      { sym:"ℏ", name:"Reduced Planck constant", color:C.phi, meaning:"ℏ = h/2π ≈ 1.055 × 10⁻³⁴ J·s. The fundamental quantum of action. Governs all quantum mechanics." },
      { sym:"G", name:"Newton's gravitational constant", color:C.coh, meaning:"G ≈ 6.674 × 10⁻¹¹ N·m²/kg². Couples mass to spacetime curvature in Einstein's equations." },
      { sym:"c", name:"Speed of light", color:C.var, meaning:"c ≈ 2.998 × 10⁸ m/s. The universal speed limit. c³ reflects three spatial dimensions." },
    ],
  },
  {
    id:"bh-entropy", cat:"Quantum Gravity", label:"Black Hole Entropy (Bekenstein-Hawking)",
    desc:"A black hole's entropy is proportional to its horizon area — not its volume. This is the deepest clue that spacetime information is fundamentally 2D.",
    tex:`${Coh("S")} = \\dfrac{${Lqg("A")}}{${N("4")}\\,${Lqg("\\ell_P^2")}} \\cdot ${φ("k_B")} = \\dfrac{${Lqg("A")}\\,${V("c^3")}}{${N("4")}\\,${φ("\\hbar")}\\,${Coh("G")}} \\cdot ${φ("k_B")}`,
    terms:[
      { sym:"S", name:"Entropy", color:C.coh, meaning:"Information content. For a black hole, S = A/4ℓ_P² k_B — area counts Planck-area pixels on the horizon." },
      { sym:"A", name:"Horizon area", color:C.lqg, meaning:"The area of the event horizon in m². Larger black hole = more surface pixels = more stored entropy." },
      { sym:"k_B", name:"Boltzmann constant", color:C.phi, meaning:"k_B ≈ 1.381 × 10⁻²³ J/K. Converts between temperature and energy — anchors the entropy scale." },
    ],
  },

  // ── Energy / Power ──────────────────────────────────────────────────────
  {
    id:"solar", cat:"Energy & Power", label:"Solar Power — Fibonacci Farm",
    desc:"Free energy from sunlight, tiled with φ²-efficiency. Fibonacci packing wastes no panel area — each tile fits the next without gaps.",
    tex:`${Coh("P")} = ${φ("\\eta")} \\cdot ${V("G_s")} \\cdot ${Lqg("A_{\\phi}")} \\cdot ${F("\\cos")}(${Vv("\\delta")}), \\quad ${Lqg("A_{\\phi}")} = ${V("N")} \\cdot ${φ("\\phi^2")} \\cdot ${V("s")}`,
    terms:[
      { sym:"P", name:"Power output (W)", color:C.coh, meaning:"Total electrical power from the Fibonacci-tiled solar array." },
      { sym:"η", name:"Panel efficiency", color:C.phi, meaning:"η ≈ 0.22 for modern monocrystalline silicon. Fraction of incident light converted to electricity." },
      { sym:"G_s", name:"Solar irradiance", color:C.var, meaning:"G_s ≈ 900–1000 W/m² at Earth's surface. The power density of sunlight before panel losses." },
      { sym:"A_φ", name:"φ²-tiled area", color:C.lqg, meaning:"Total panel area arranged in Fibonacci φ² tiles. N·φ²·s where s = single panel area. Zero geometric waste." },
      { sym:"cos(δ)", name:"Angle of incidence", color:C.fn, meaning:"Cosine of the angle between sunlight and panel normal. SOLAR-φ3 robot optimises δ → 0 in real time." },
    ],
  },
  {
    id:"resonant-power", cat:"Energy & Power", label:"Resonant Power Harvest (AETHER Wave)",
    desc:"Fibonacci-gated wave coherence amplifies ambient energy beyond the baseline. The summation of coherent field packets exceeds classical prediction.",
    tex:`${Coh("P_\\mathrm{free}")} = ${V("P_0")}\\!\\left(${N("1")} + \\dfrac{${O("\\Sigma")}\\,${Coh("\\psi")}_\\mathrm{gated}}{${φ("N")}} \\cdot ${φ("\\phi")}\\right)`,
    terms:[
      { sym:"P_free", name:"Coherence-amplified power", color:C.coh, meaning:"Total harvested power after Fibonacci gate amplification. Exceeds P₀ when gated coherence is high." },
      { sym:"P₀", name:"Baseline power", color:C.var, meaning:"Standard solar panel output without coherence gating. The floor — P_free ≥ P₀ always." },
      { sym:"Σ ψ_gated", name:"Sum of gated coherence", color:C.coh, meaning:"Sum over all Fibonacci-gate-passing wave packets. Higher coherence field = more gated packets = more power." },
      { sym:"φ", name:"Golden amplifier", color:C.phi, meaning:"The φ factor converts coherence gain to power gain. Reflects the φ²-area tiling efficiency of the panel array." },
    ],
  },

  // ── AETHER Wave ─────────────────────────────────────────────────────────
  {
    id:"aether-wave", cat:"AETHER Wave", label:"AETHER Master Wave Equation",
    desc:"A novel coupling: golden-ratio amplifier φ × a 3-6-9 toroidal vortex operator directly driving a damped wave equation for living granular systems.",
    tex:`\\dfrac{${O("\\partial^2")}${Coh("\\psi")}}{${O("\\partial")} t^2} = ${V("c^2")}${O("\\nabla^2")}${Coh("\\psi")} + ${φ("\\phi")}\\cdot${F("\\mathcal{R}_{369}")}(${Coh("\\psi")}) - ${φ("\\gamma")}\\dfrac{${O("\\partial")}${Coh("\\psi")}}{${O("\\partial")} t}`,
    terms:[
      { sym:"ψ", name:"AETHER field", color:C.coh, meaning:"The living wave field permeating the AETHER substrate — light, biophotons, and coherence all propagate as ψ." },
      { sym:"c²∇²ψ", name:"Wave propagation", color:C.var, meaning:"Standard wave equation term. Spatial curvature of ψ drives propagation at speed c through the medium." },
      { sym:"φ·R₃₆₉(ψ)", name:"Toroidal vortex amplifier", color:C.phi, meaning:"Original AETHER operator: R₃₆₉(ψ) = sin(9θ)·exp(−0.05θ). Captures Tesla's 3-6-9 resonance in spiral media. φ amplifies the resonant contribution." },
      { sym:"−γ·∂ψ/∂t", name:"Damping term", color:C.phi, meaning:"Dissipation that prevents runaway oscillation. γ ≈ Immirzi parameter in Planck-scale limit — connects biology to quantum gravity." },
    ],
  },
  {
    id:"fib-wave", cat:"AETHER Wave", label:"Fibonacci Toroidal Wave",
    desc:"A propagating wave solution locked to the φ-spiral geometry. Amplitude scales as φ/r — coherent power is maintained over distance unlike 1/r² for incoherent waves.",
    tex:`${Coh("\\psi")}(r,${Vv("\\theta")},t) = ${V("A_0")} \\cdot \\dfrac{${φ("\\phi")}}{r} ${F("\\sin")}\\!\\left(${V("k")}r - ${V("\\omega")} t + ${N("9")}${Vv("\\theta")}\\right) e^{-${Vv("\\theta")}/20}`,
    terms:[
      { sym:"A₀", name:"Initial amplitude", color:C.var, meaning:"Seed amplitude at the centre of the spiral farm. Broadcasts outward along the φ-spiral." },
      { sym:"φ/r", name:"Golden amplitude decay", color:C.phi, meaning:"Amplitude scales as φ/r, not 1/r². Coherent wave — energy is focused along the Fibonacci arms, not lost isotropically." },
      { sym:"9θ", name:"9θ toroidal phase", color:C.num, meaning:"Encodes the 9-fold vortex symmetry (Tesla 3-6-9). Sets phase resonances at θ = π/9, 2π/9, … — the spiral nodes." },
      { sym:"e^(−θ/20)", name:"Angular damping", color:C.fn, meaning:"Exponential attenuation along the spiral angle. Ensures the wave converges to the farm centre rather than escaping." },
    ],
  },
  {
    id:"pigment-diffusion", cat:"AETHER Wave", label:"Granular Pigment–Wave Diffusion",
    desc:"Bridges granular physics (soil particles, nutrient diffusion) with AETHER biophoton coherence. Shows how pure-gold nutrients flow from soil to plant to human cell.",
    tex:`\\dfrac{${O("\\partial")} ${V("C_i")}}{${O("\\partial")} t} = ${V("D_i")}${O("\\nabla^2")}${V("C_i")} + ${φ("\\phi")} \\cdot ${Coh("\\psi")} \\cdot ${V("C_i")}(${N("1")} - ${V("C_i")}) - ${φ("\\kappa")}\\dfrac{${O("\\partial^2")}${V("C_i")}}{${O("\\partial")}${Vv("\\theta")}^{${N("2")}}}`,
    terms:[
      { sym:"Cᵢ", name:"Pigment concentration", color:C.var, meaning:"Concentration of the ith pigment fraction (chlorophyll, carotenoid, anthocyanin, etc.) in the granular soil medium. ∈ [0, 1]." },
      { sym:"Dᵢ∇²Cᵢ", name:"Fickian diffusion", color:C.var, meaning:"Standard diffusion through granular soil. Dᵢ = diffusivity of pigment i. Gaussian spreading through particle gaps." },
      { sym:"φ·ψ·Cᵢ(1−Cᵢ)", name:"Coherent wave amplification", color:C.phi, meaning:"Novel coupling: the AETHER biophoton field ψ directly drives pigment uptake. φ scales the coupling — biological amplification." },
      { sym:"κ·∂²Cᵢ/∂θ²", name:"Angular dispersion", color:C.phi, meaning:"Fibonacci-angular diffusion correction. Pigments preferentially diffuse along the spiral arms — zero waste transport geometry." },
    ],
  },
  {
    id:"cuca-state", cat:"CUCA Architecture", label:"CUCA–AETHER State Vector S(t)",
    desc:"The full multi-domain state of the CUCA system at time t. Unifies biological phase, coherence, body/environment/social/chemical signals into one vector.",
    tex:`${V("\\mathbf{S}(t)")} = \\bigl[${Vv("\\theta(t)")},\\; ${Coh("\\mathcal{C}(t)")},\\; ${V("\\mathbf{b}(t)")},\\; ${V("\\mathbf{e}(t)")},\\; ${V("\\mathbf{s}(t)")},\\; ${V("\\mathbf{v}(t)")}\\bigr]`,
    terms:[
      { sym:"S(t)", name:"Full system state", color:C.var, meaning:"The complete multidimensional state of the CUCA system. All other equations operate on or update this vector." },
      { sym:"θ(t)", name:"Biological phase", color:C.vec, meaning:"Cyclic phase of the biological oscillator. θ ∈ [0, 2π]. Modulates chemical emission: v(t) = g(θ(t), b(t))." },
      { sym:"C(t)", name:"Coherence metric", color:C.coh, meaning:"Real-time measure of system alignment. C → 1 = stable, ordered. C → 0 = trigger replication/intervention." },
      { sym:"b, e, s", name:"Body, Environment, Social", color:C.var, meaning:"Three signal domains. b = physiological state, e = environmental inputs, s = social/relational signals." },
      { sym:"v(t)", name:"VOC signal vector", color:C.var, meaning:"Volatile organic compound concentration vector — the biochemical language of the system at time t." },
    ],
  },
  {
    id:"cuca-geometry", cat:"CUCA Architecture", label:"CUCA Phyllotactic Geometry Map",
    desc:"The 3D geometric rendering of system state. Coherence drives structural order; phase creates temporal modulation; VOC signals deform the spiral geometry.",
    tex:`${Lqg("\\mathbf{x}_n(t)")} = \\begin{pmatrix} ${V("r_n'")}${F("\\cos")}(n${φ("\\phi")}) \\\\ ${V("r_n'")}${F("\\sin")}(n${φ("\\phi")}) \\\\ ${φ("\\gamma")}${F("\\sin")}(${Vv("\\theta(t)")}+${V("\\omega")} n) \\end{pmatrix} + (1-${Coh("\\mathcal{C}")})${Vv("\\xi_n")} + ${O("\\sum_i")} ${V("v_i")}${Vv("\\mathbf{d}_i")}`,
    terms:[
      { sym:"x_n(t)", name:"3D position of nth node", color:C.lqg, meaning:"The spatial location of the nth element in the CUCA geometry. Changes continuously as C(t) and v(t) evolve." },
      { sym:"r_n′ cos(nφ)", name:"Fibonacci spiral X/Y", color:C.var, meaning:"The 2D phyllotactic base: golden-angle placement on a √n-radius spiral. Same as the farm geometry." },
      { sym:"γ sin(θ + ωn)", name:"Z-modulation (phase)", color:C.phi, meaning:"The biological phase θ(t) lifts the 2D spiral into 3D — creating a helical coherence structure over time." },
      { sym:"(1−C)·ξ_n", name:"Incoherence distortion", color:C.coh, meaning:"Random noise term scaled by (1−C). At C = 1, geometry is perfectly ordered. At C = 0, it dissolves to noise." },
      { sym:"Σ vᵢ·dᵢ", name:"VOC directional deformation", color:C.op, meaning:"Each VOC compound pushes the geometry in direction dᵢ with magnitude vᵢ. Biochemistry shapes the visible form." },
    ],
  },
];

const CATEGORIES = [...new Set(EQUATIONS.map(e => e.cat))];
const TERM_TYPE_LABELS: Record<string, string> = {
  [C.phi]: "Golden / Constant", [C.var]: "Variable / State", [C.op]: "Operator",
  [C.fn]: "Function", [C.vec]: "Vector / Phase", [C.num]: "Number / Index",
  [C.coh]: "AETHER Coherence", [C.lqg]: "Quantum / Planck",
};

// ── Mini canvas: animated Fibonacci background ───────────────────────────────
function usePhiBg(ref: React.RefObject<HTMLCanvasElement | null>) {
  useEffect(() => {
    const canvas = ref.current; if (!canvas) return;
    const ctx = canvas.getContext("2d")!;
    let t = 0, raf = 0;
    const draw = () => {
      canvas.width = canvas.offsetWidth || 800;
      canvas.height = canvas.offsetHeight || 600;
      const W = canvas.width, H = canvas.height;
      ctx.clearRect(0, 0, W, H);
      const cx = W / 2, cy = H / 2;
      const R = Math.min(W, H) * 0.45;
      const φv = 1.618;
      const ga = 2 * Math.PI / (φv * φv);
      for (let i = 0; i < 120; i++) {
        const r = R * Math.sqrt((i + 1) / 120);
        const a = i * ga + t * 0.003;
        const x = cx + r * Math.cos(a), y = cy + r * Math.sin(a);
        const hue = (i * 3 + t * 0.5) % 360;
        ctx.beginPath(); ctx.arc(x, y, 1.5 + (i % 5 === 0 ? 1 : 0), 0, Math.PI * 2);
        ctx.fillStyle = `hsla(${hue},80%,60%,${0.12 + 0.06 * Math.sin(t * 0.04 + i * 0.3)})`;
        ctx.fill();
      }
      t++; raf = requestAnimationFrame(draw);
    };
    draw();
    return () => cancelAnimationFrame(raf);
  }, []);
}

// ── Main component ───────────────────────────────────────────────────────────
export default function MathStudioPage() {
  const bgRef = useRef<HTMLCanvasElement>(null);
  usePhiBg(bgRef);

  const [selectedId, setSelectedId] = useState("kuramoto");
  const [activeCat, setActiveCat]   = useState<string | null>(null);
  const [customTex, setCustomTex]   = useState("");
  const [customError, setCustomError] = useState("");
  const [showCustom, setShowCustom]   = useState(false);
  const [copied, setCopied] = useState(false);

  const eq = EQUATIONS.find(e => e.id === selectedId) ?? EQUATIONS[0];
  const displayTex = showCustom ? customTex : eq.tex;

  const rendered = (() => {
    try {
      return katex.renderToString(displayTex, {
        throwOnError: true, output: "html", trust: true,
        macros: { "\\textcolor": true },
        displayMode: true,
      });
    } catch (err) {
      return katex.renderToString(displayTex, { throwOnError: false, output: "html", trust: true, displayMode: true });
    }
  })();

  const filtered = EQUATIONS.filter(e => !activeCat || e.cat === activeCat);

  const mono: React.CSSProperties = { fontFamily: "'Courier New', monospace" };
  const G   = "#00ff88";
  const BRD = "rgba(0,255,136,0.12)";

  return (
    <div style={{ height: "100%", display: "flex", flexDirection: "column", background: "rgb(2,8,18)", color: G, ...mono, overflow: "hidden", fontSize: 11, position: "relative" }}>

      {/* Fibonacci background */}
      <canvas ref={bgRef} style={{ position: "absolute", inset: 0, width: "100%", height: "100%", pointerEvents: "none", zIndex: 0 }} />

      <div style={{ position: "relative", zIndex: 1, display: "flex", flexDirection: "column", height: "100%" }}>

        {/* Header */}
        <div style={{ padding: "8px 16px", borderBottom: `1px solid ${BRD}`, flexShrink: 0, display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
          <span style={{ fontSize: 12, letterSpacing: 4, fontWeight: 700 }}>AETHER MATH STUDIO</span>
          <span style={{ fontSize: 8, opacity: 0.4 }}>colorized equations · term breakdown · {EQUATIONS.length} AETHER formulas</span>
          <div style={{ marginLeft: "auto", display: "flex", gap: 8 }}>
            <button onClick={() => setShowCustom(s => !s)}
              style={{ background: showCustom ? "rgba(251,191,36,0.15)" : "rgba(0,255,136,0.08)", border: `1px solid ${showCustom ? "#fbbf2460" : "rgba(0,255,136,0.3)"}`, color: showCustom ? "#fbbf24" : G, borderRadius: 4, padding: "2px 12px", cursor: "pointer", fontSize: 9 }}>
              {showCustom ? "✦ CUSTOM MODE" : "✦ CUSTOM LaTeX"}
            </button>
          </div>
        </div>

        {/* Color legend */}
        <div style={{ display: "flex", gap: 0, borderBottom: `1px solid ${BRD}`, flexShrink: 0, overflowX: "auto" }}>
          {Object.entries(TERM_TYPE_LABELS).map(([col, label]) => (
            <div key={col} style={{ padding: "4px 10px", display: "flex", alignItems: "center", gap: 5, borderRight: `1px solid ${BRD}`, flexShrink: 0 }}>
              <div style={{ width: 8, height: 8, borderRadius: "50%", background: col }} />
              <span style={{ fontSize: 7, color: col, opacity: 0.8, letterSpacing: 1 }}>{label}</span>
            </div>
          ))}
        </div>

        {/* Main 3-panel */}
        <div style={{ flex: 1, display: "grid", gridTemplateColumns: "220px 1fr 260px", minHeight: 0 }}>

          {/* LEFT — Equation library */}
          <div style={{ borderRight: `1px solid ${BRD}`, display: "flex", flexDirection: "column", overflow: "hidden" }}>
            {/* Category filters */}
            <div style={{ padding: "6px 8px", borderBottom: `1px solid ${BRD}`, display: "flex", flexWrap: "wrap", gap: 4 }}>
              <button onClick={() => setActiveCat(null)}
                style={{ fontSize: 7, padding: "2px 7px", borderRadius: 12, border: `1px solid ${activeCat === null ? G : "rgba(255,255,255,0.1)"}`, background: activeCat === null ? "rgba(0,255,136,0.1)" : "transparent", color: activeCat === null ? G : "rgba(255,255,255,0.4)", cursor: "pointer" }}>
                All
              </button>
              {CATEGORIES.map(cat => (
                <button key={cat} onClick={() => setActiveCat(c => c === cat ? null : cat)}
                  style={{ fontSize: 7, padding: "2px 7px", borderRadius: 12, border: `1px solid ${activeCat === cat ? "#fbbf24" : "rgba(255,255,255,0.1)"}`, background: activeCat === cat ? "rgba(251,191,36,0.1)" : "transparent", color: activeCat === cat ? "#fbbf24" : "rgba(255,255,255,0.4)", cursor: "pointer" }}>
                  {cat}
                </button>
              ))}
            </div>

            {/* Equation list */}
            <div style={{ flex: 1, overflowY: "auto" }}>
              {filtered.map(e => (
                <button key={e.id} onClick={() => { setSelectedId(e.id); setShowCustom(false); }}
                  style={{ width: "100%", textAlign: "left", padding: "7px 10px", borderBottom: `1px solid rgba(255,255,255,0.04)`, background: selectedId === e.id ? "rgba(0,255,136,0.07)" : "transparent", border: "none", borderLeft: selectedId === e.id ? `2px solid ${G}` : "2px solid transparent", cursor: "pointer", display: "block" }}>
                  <div style={{ fontSize: 8, color: selectedId === e.id ? G : "rgba(255,255,255,0.5)", fontWeight: selectedId === e.id ? 700 : 400, letterSpacing: 1, ...mono }}>{e.label}</div>
                  <div style={{ fontSize: 7, color: "#fbbf2470", marginTop: 2, ...mono }}>{e.cat}</div>
                </button>
              ))}
            </div>
          </div>

          {/* CENTER — Main equation display */}
          <div style={{ display: "flex", flexDirection: "column", borderRight: `1px solid ${BRD}` }}>
            {/* Equation title */}
            {!showCustom && (
              <div style={{ padding: "10px 20px", borderBottom: `1px solid ${BRD}`, flexShrink: 0 }}>
                <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: 3, color: G, marginBottom: 3 }}>{eq.label.toUpperCase()}</div>
                <div style={{ fontSize: 8, opacity: 0.45, lineHeight: 1.6 }}>{eq.desc}</div>
              </div>
            )}

            {/* Big equation render */}
            <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "20px 30px", position: "relative" }}>
              {/* Glow frame */}
              <div style={{ position: "absolute", inset: 20, border: "1px solid rgba(0,255,136,0.06)", borderRadius: 12, background: "rgba(0,255,136,0.02)" }} />

              {/* Custom LaTeX editor */}
              {showCustom && (
                <div style={{ width: "100%", maxWidth: 600, marginBottom: 20 }}>
                  <textarea
                    value={customTex}
                    onChange={e => setCustomTex(e.target.value)}
                    placeholder="Enter LaTeX here, e.g.  \frac{\partial A}{\partial t} = A + \nabla^2 A&#10;Use \textcolor{#00ff88}{text} for color"
                    style={{ width: "100%", minHeight: 80, background: "rgba(0,255,136,0.04)", border: "1px solid rgba(0,255,136,0.2)", borderRadius: 6, color: G, ...mono, fontSize: 10, padding: 10, resize: "vertical" }}
                  />
                </div>
              )}

              {/* KaTeX rendered equation */}
              <div
                style={{ position: "relative", zIndex: 1, maxWidth: "100%", overflowX: "auto" }}
                className="aether-katex"
                dangerouslySetInnerHTML={{ __html: rendered }}
              />

              {/* Copy button */}
              <button onClick={() => {
                  navigator.clipboard.writeText(showCustom ? customTex : eq.tex);
                  setCopied(true); setTimeout(() => setCopied(false), 2000);
                }}
                style={{ marginTop: 20, background: "rgba(0,255,136,0.08)", border: `1px solid rgba(0,255,136,0.25)`, color: copied ? "#fbbf24" : G, borderRadius: 4, padding: "4px 16px", cursor: "pointer", fontSize: 8, letterSpacing: 2, ...mono }}>
                {copied ? "✓ COPIED LaTeX" : "⧉ COPY LaTeX"}
              </button>
            </div>

            {/* Term color swatches row */}
            {!showCustom && eq.terms.length > 0 && (
              <div style={{ borderTop: `1px solid ${BRD}`, padding: "6px 14px", display: "flex", gap: 8, flexWrap: "wrap", flexShrink: 0 }}>
                {eq.terms.map((term, i) => (
                  <div key={i} style={{ display: "flex", alignItems: "center", gap: 5, padding: "2px 8px", borderRadius: 12, border: `1px solid ${term.color}30`, background: `${term.color}10` }}>
                    <span style={{ color: term.color, fontSize: 10, fontWeight: 700 }}>{term.sym}</span>
                    <span style={{ fontSize: 7, color: term.color, opacity: 0.6 }}>{term.name}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* RIGHT — Term breakdown */}
          <div style={{ display: "flex", flexDirection: "column", overflow: "auto" }}>
            <div style={{ padding: "6px 10px", fontSize: 8, letterSpacing: 3, color: G, opacity: 0.6, borderBottom: `1px solid ${BRD}`, flexShrink: 0 }}>
              ∑ TERM BREAKDOWN
            </div>

            {!showCustom && eq.terms.map((term, i) => (
              <div key={i} style={{ padding: "8px 12px", borderBottom: `1px solid rgba(255,255,255,0.04)`, borderLeft: `2px solid ${term.color}50` }}>
                <div style={{ display: "flex", alignItems: "baseline", gap: 8, marginBottom: 4 }}>
                  <span style={{ color: term.color, fontSize: 13, fontWeight: 700 }}>{term.sym}</span>
                  <span style={{ color: term.color, fontSize: 7, letterSpacing: 1, opacity: 0.7 }}>{term.name.toUpperCase()}</span>
                </div>
                <div style={{ fontSize: 7, opacity: 0.45, lineHeight: 1.6 }}>{term.meaning}</div>
                <div style={{ fontSize: 6, color: term.color, opacity: 0.3, marginTop: 3 }}>{TERM_TYPE_LABELS[term.color] ?? "Term"}</div>
              </div>
            ))}

            {/* Color key reference */}
            <div style={{ padding: "8px 12px", borderTop: `1px solid ${BRD}`, marginTop: "auto", flexShrink: 0 }}>
              <div style={{ fontSize: 7, letterSpacing: 2, opacity: 0.3, marginBottom: 5 }}>COLOR KEY</div>
              {Object.entries(TERM_TYPE_LABELS).map(([col, label]) => (
                <div key={col} style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 3 }}>
                  <div style={{ width: 6, height: 6, borderRadius: "50%", background: col, flexShrink: 0 }} />
                  <span style={{ fontSize: 7, color: col, opacity: 0.6 }}>{label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* KaTeX color overrides */}
      <style>{`
        .aether-katex .katex { font-size: 2.2em; color: rgba(255,255,255,0.9); }
        .aether-katex .katex-display { overflow-x: auto; padding: 10px 0; }
        .aether-katex .katex .mord, .aether-katex .katex .mrel,
        .aether-katex .katex .mbin, .aether-katex .katex .mopen,
        .aether-katex .katex .mclose { color: inherit; }
        .aether-katex .katex .strut { display: inline-block; }
        .aether-katex .katex .base { color: rgba(255,255,255,0.85); }
        .aether-katex .katex .mfrac .frac-line { border-bottom-color: rgba(0,255,136,0.6) !important; }
        .aether-katex .katex .sqrt > .sqrt-sign { color: rgba(0,255,136,0.7); }
        .aether-katex .katex .minner { vertical-align: middle; }
      `}</style>
    </div>
  );
}
