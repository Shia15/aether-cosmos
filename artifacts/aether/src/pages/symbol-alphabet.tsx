import { useState, useMemo } from "react";

// ── Palette ───────────────────────────────────────────────────────────────────
const BG    = "#020c18";
const PANEL = "rgba(4,16,36,0.92)";
const GOLD  = "#f2c354";
const CYAN  = "#38bdf8";
const GREEN = "#4ade80";
const ROSE  = "#f87171";
const VIO   = "#c084fc";
const AMB   = "#fb923c";
const TEAL  = "#2dd4bf";
const MUT   = "#94a3b8";
const WHT   = "#e2e8f0";
const BRD   = "rgba(242,195,84,0.14)";
const MONO  = "'DM Mono',monospace";
const SERIF = "'Georgia',serif";

// ── Types ────────────────────────────────────────────────────────────────────
type Script = "greek" | "latin" | "egyptian" | "japanese" | "russian" | "aether";
type Layer  = "mnesis" | "infernia" | "aletheia" | "reverie" | "synthesis";

interface Sym {
  s:       string;  // glyph
  name:    string;  // English name
  native?: string;  // romanised / pronunciation
  script:  Script;
  layer:   Layer;
  origin:  string;  // meaning in source language
  aether:  string;  // AETHER role / use
  eq?:     string;  // equation snippet
}

// ── Layer metadata ────────────────────────────────────────────────────────────
const LAYERS: Record<Layer, { label: string; sub: string; col: string; sym: string }> = {
  mnesis:    { label: "MNĒSIS",    sub: "L1 · Substrate",  col: VIO,  sym: "~"   },
  infernia:  { label: "INFERNIA",  sub: "L2 · Constraint", col: AMB,  sym: "|||" },
  aletheia:  { label: "ALETHEIA", sub: "L3 · Structure",  col: CYAN, sym: "◇"   },
  reverie:   { label: "REVERIE",   sub: "L4 · Coherence",  col: GOLD, sym: "✧"   },
  synthesis: { label: "SYNTHESIS", sub: "L5 · Manifestation", col: TEAL, sym: "★" },
};

const SCRIPTS: Record<Script, { label: string; col: string }> = {
  greek:    { label: "Greek",    col: CYAN  },
  latin:    { label: "Latin",    col: WHT   },
  egyptian: { label: "Egyptian", col: GOLD  },
  japanese: { label: "Japanese", col: ROSE  },
  russian:  { label: "Russian",  col: GREEN },
  aether:   { label: "AETHER",   col: VIO   },
};

// ── Symbol data ───────────────────────────────────────────────────────────────
const DATA: Sym[] = [
  // ── GREEK ──
  { s:"α",  name:"Alpha",    script:"greek", layer:"mnesis",    native:"alpha",   origin:"First letter of Greek alphabet; 'the beginning'",       aether:"Scalar coupling strength; fine-structure analog; lowest-energy index in field expansion",       eq:"α·∇²C" },
  { s:"β",  name:"Beta",     script:"greek", layer:"infernia",  native:"beta",    origin:"Second letter; 'house'",                                 aether:"Velocity ratio v/c in Lorentz factor; CGLE nonlinear coefficient; compression index",             eq:"β = v/c" },
  { s:"γ",  name:"Gamma",    script:"greek", layer:"synthesis", native:"gamma",   origin:"Third letter; camel",                                    aether:"Lorentz factor γ=1/√(1−β²); Barbero-Immirzi parameter γ=0.2375 linking LQG to coherence damping",eq:"γ=0.2375" },
  { s:"Γ",  name:"Gamma (upper)", script:"greek", layer:"synthesis", native:"Gamma", origin:"Capital gamma; Gamma function ∫₀^∞ t^(x-1)e^(-t)dt", aether:"Toroidal helix circulation strength in AETHER master equation C(x,t)=1-(ε/S*)e^(−κΓ_helix)",    eq:"Γ_helix" },
  { s:"δ",  name:"Delta",    script:"greek", layer:"infernia",  native:"delta",   origin:"Door; small increment or change",                        aether:"Perturbation / variation operator; Dirac delta δ(x); skin depth δ=√(2ρ/ωμ)",                    eq:"δC/δt" },
  { s:"Δ",  name:"Delta (upper)", script:"greek", layer:"infernia", native:"Delta", origin:"Triangle; change or difference",                      aether:"Finite difference; Laplacian in 2D; coherence gap Δ between states",                              eq:"ΔxΔp ≥ ℏ/2" },
  { s:"ε",  name:"Epsilon",  script:"greek", layer:"mnesis",    native:"epsilon", origin:"Simple e; small quantity",                               aether:"Error vector in AETHER master eq; permittivity ε₀=8.85×10⁻¹² F/m; decoherence amplitude",       eq:"‖ε‖/‖S*‖" },
  { s:"ζ",  name:"Zeta",     script:"greek", layer:"aletheia",  native:"zeta",    origin:"Weapon; Riemann's ζ(s)=Σ1/nˢ",                          aether:"Damping ratio in oscillatory systems; Riemann zeta encodes prime-number structure = AETHER grammar",eq:"ζ(s)" },
  { s:"η",  name:"Eta",      script:"greek", layer:"reverie",   native:"eta",     origin:"Gate; efficiency",                                       aether:"Kutta-Joukowski efficiency η=58.6%; Minkowski metric η_μν; photon conversion efficiency",         eq:"η=58.6%" },
  { s:"θ",  name:"Theta",    script:"greek", layer:"aletheia",  native:"theta",   origin:"Wheel / circle; angle",                                  aether:"Angular position; quantum phase angle in ψ=|ψ|e^(iθ); AETHER coherence angle between nodes",     eq:"θ(t)=ωt+φ" },
  { s:"κ",  name:"Kappa",    script:"greek", layer:"infernia",  native:"kappa",   origin:"Palm of hand; curvature",                                aether:"AETHER coherence decay constant in e^(−κΓ); thermal conductivity; Gaussian curvature K",         eq:"e^(−κΓ)" },
  { s:"λ",  name:"Lambda",   script:"greek", layer:"reverie",   native:"lambda",  origin:"Ox-goad; wave",                                          aether:"Wavelength; cosmological constant Λ (dark energy); Lyapunov exponent λ>0 signals chaos",         eq:"λ = c/ν" },
  { s:"Λ",  name:"Lambda (upper)", script:"greek", layer:"synthesis", native:"Lambda", origin:"Capital lambda",                                   aether:"Cosmological constant — dark energy density; Λgμν in Einstein field equations",                    eq:"Gμν+Λgμν" },
  { s:"μ",  name:"Mu",       script:"greek", layer:"mnesis",    native:"mu",      origin:"Water; small",                                           aether:"Magnetic permeability μ₀=4π×10⁻⁷ H/m; mean of distribution; chemical potential μ",              eq:"c=1/√(μ₀ε₀)" },
  { s:"ν",  name:"Nu",       script:"greek", layer:"reverie",   native:"nu",      origin:"Fish / snake; frequency",                                aether:"Electromagnetic frequency ν=c/λ; kinematic viscosity ν=μ/ρ; neutrino label",                     eq:"E=hν" },
  { s:"ξ",  name:"Xi",       script:"greek", layer:"infernia",  native:"xi",      origin:"Sword; complexity parameter",                            aether:"CGLE coherence fluctuation coefficient; collective coordinate in field theory; deformation",      eq:"(1+iξ)" },
  { s:"π",  name:"Pi",       script:"greek", layer:"aletheia",  native:"pi",      origin:"Corner; the circle constant 3.14159…",                   aether:"Circle constant; pion (strong-force meson) π⁺π⁻π⁰; product operator ∏; AETHER rotational base", eq:"2π = TAU" },
  { s:"ρ",  name:"Rho",      script:"greek", layer:"mnesis",    native:"rho",     origin:"Head; density",                                          aether:"Mass/charge/energy density; Ricci scalar R; resistivity ρ=E/J in conductors",                    eq:"ρ = m/V" },
  { s:"σ",  name:"Sigma",    script:"greek", layer:"infernia",  native:"sigma",   origin:"Sun; spreading",                                         aether:"Standard deviation; Pauli matrices σ_x,y,z; Stefan-Boltzmann constant; conductivity σ",         eq:"P=σT⁴" },
  { s:"Σ",  name:"Sigma (upper)", script:"greek", layer:"synthesis", native:"Sigma", origin:"Capital sigma; summation",                            aether:"Summation operator Σ_k; total stress tensor Σ_μν; Kuramoto sum over all oscillators",            eq:"Σe^(iθk)" },
  { s:"τ",  name:"Tau",      script:"greek", layer:"reverie",   native:"tau",     origin:"Mark; cross; time constant",                             aether:"Coherence time τ_c ~ 1/Δω; proper time in GR; shear stress τ; tau lepton (third-gen fermion)",    eq:"τ_c=1/Δω" },
  { s:"φ",  name:"Phi",      script:"greek", layer:"synthesis", native:"phi",     origin:"Breath; radiant light",                                  aether:"Golden ratio φ=1.6180339…; EM scalar potential φ; phase angle; AETHER vortex amplification gain",  eq:"φ=1/φ+1" },
  { s:"χ",  name:"Chi",      script:"greek", layer:"aletheia",  native:"chi",     origin:"Chi; the letter X",                                      aether:"Chi-squared test; magnetic susceptibility χ_m; chirality of particles; CGLE real-part coefficient",eq:"χ² test" },
  { s:"ψ",  name:"Psi",      script:"greek", layer:"reverie",   native:"psi",     origin:"Trident; soul / mind",                                   aether:"Quantum wavefunction ψ; Kuramoto order parameter ψ_K=|Σe^(iθk)|/N; AETHER REVERIE symbol",      eq:"ψ_K=|Σe^(iθ)|/N" },
  { s:"ω",  name:"Omega",    script:"greek", layer:"reverie",   native:"omega",   origin:"Great O; the end; angular speed",                        aether:"Angular frequency ω=2πν; CGLE ω-term; omega baryon (triple-strange); AETHER final output symbol",eq:"ω·t" },
  { s:"Ω",  name:"Omega (upper)", script:"greek", layer:"synthesis", native:"Omega", origin:"Capital omega; ohm; cosmic density",                 aether:"Electrical resistance Ω; cosmic density parameter Ω_m/Ω_Λ/Ω_r in Hubble equation",               eq:"H²=H₀²Ω" },

  // ── LATIN ──
  { s:"A",  name:"A · Amplitude",  script:"latin", layer:"mnesis",    origin:"Latin 'A'; ox head (Phoenician)",   aether:"Amplitude of coherence field A(x); area A=πr²; CGLE amplitude field ∂A/∂t = A+(1+iα)∇²A",    eq:"A(x)" },
  { s:"B",  name:"B · Magnetic",   script:"latin", layer:"aletheia",  origin:"Latin 'B'; house",                  aether:"Magnetic flux density B = ∇×A; B-field in Maxwell's equations ∇·B=0",                          eq:"∇·B=0" },
  { s:"C",  name:"C · Coherence",  script:"latin", layer:"synthesis", origin:"Latin 'C'; camel (Phoenician)",     aether:"AETHER master coherence field C(x,t)=1-(ε/S*)e^(−κΓ_helix); speed of light c=2.998×10⁸ m/s",  eq:"C(x,t)" },
  { s:"E",  name:"E · Energy",     script:"latin", layer:"infernia",  origin:"Latin 'E'; window / praise",        aether:"Electric field E; energy E=mc²=hν; AETHER error tensor E(t)=X*−X in CLCS control law",          eq:"E=mc²" },
  { s:"F",  name:"F · Force",      script:"latin", layer:"infernia",  origin:"Latin 'F'; hook / nail",            aether:"Force F=ma; electromagnetic field tensor F_μν=∂_μA_ν−∂_νA_μ; free energy F=U−TS",               eq:"F_μν" },
  { s:"G",  name:"G · Gravity",    script:"latin", layer:"synthesis", origin:"Latin 'G'; camel + Greek gamma",    aether:"Newton's constant G=6.674×10⁻¹¹; Einstein tensor G_μν; graviton exchange mediates gravity",     eq:"G_μν" },
  { s:"H",  name:"H · Hubble",     script:"latin", layer:"synthesis", origin:"Latin 'H'; fence / boundary",       aether:"Hubble parameter H(a); Hamiltonian H of quantum systems; magnetic field H=B/μ₀−M",               eq:"H(a)=H₀√Ω" },
  { s:"J",  name:"J · Current",    script:"latin", layer:"infernia",  origin:"Latin 'J'; variant of I",           aether:"Current density J in Maxwell ∇×B=μ₀J+...; 4-current J^μ=(ρc,J); AETHER injection term",        eq:"∇×B=μ₀J" },
  { s:"K",  name:"K · Kuramoto",   script:"latin", layer:"reverie",   origin:"Latin 'K'; palm of hand",           aether:"Kuramoto coupling constant K; thermal conductivity k; Boltzmann constant k_B=1.38×10⁻²³ J/K",   eq:"K_c=2σ/π" },
  { s:"L",  name:"L · Lagrangian", script:"latin", layer:"aletheia",  origin:"Latin 'L'; ox-goad",                aether:"Lagrangian L=T−V; angular momentum L=r×p; coherence arm length in resonant systems",             eq:"L=T−V" },
  { s:"M",  name:"M · Mass",       script:"latin", layer:"mnesis",    origin:"Latin 'M'; water waves",            aether:"Mass M; magnetisation M; AETHER morphogenetic operator M(ψ) driving pattern formation",           eq:"E=Mc²" },
  { s:"N",  name:"N · Number",     script:"latin", layer:"aletheia",  origin:"Latin 'N'; snake / fish",           aether:"Number of oscillators N in Kuramoto; mechanism count N in AETHER vortex field; quantum number n", eq:"ψ_K=|Σ|/N" },
  { s:"P",  name:"P · Momentum",   script:"latin", layer:"infernia",  origin:"Latin 'P'; mouth",                  aether:"Momentum P=mv; pressure P; solar power P=ηG_sA_φ; probability amplitude P(x)",                   eq:"P=ηG_sA" },
  { s:"Q",  name:"Q · Charge",     script:"latin", layer:"mnesis",    origin:"Latin 'Q'; eye / monkey-tail",      aether:"Electric charge Q; quality factor Q=ω/Δω = coherence sharpness; AETHER coherence measure",       eq:"Q=ω/Δω" },
  { s:"R",  name:"R · Ricci",      script:"latin", layer:"aletheia",  origin:"Latin 'R'; head",                   aether:"Ricci tensor R_μν; Rydberg constant R_∞=1.097×10⁷ m⁻¹; electrical resistance R=V/I",             eq:"G=R-½gR" },
  { s:"S",  name:"S · Entropy",    script:"latin", layer:"infernia",  origin:"Latin 'S'; tooth / bow",            aether:"Entropy S=k_B ln Ω; reference state S* in AETHER error vector; action integral S=∫L dt",          eq:"S*(ref)" },
  { s:"T",  name:"T · Tensor",     script:"latin", layer:"synthesis", origin:"Latin 'T'; mark / cross",           aether:"Stress-energy tensor T_μν (source of gravity); temperature T; coherence time T_c",               eq:"T_μν" },
  { s:"U",  name:"U · Potential",  script:"latin", layer:"mnesis",    origin:"Latin 'U'; wave / water",           aether:"Potential energy U; flow speed U in density field; AETHER vortex superposition speed U",          eq:"V=U+KE" },
  { s:"V",  name:"V · Volume",     script:"latin", layer:"mnesis",    origin:"Latin 'V'; arm raised / nail",      aether:"Volume V; velocity vector V(x) in CLCS ẋ=V(x)+u+KE; visibility V in quantum erasure",            eq:"ẋ=V(x)+u" },
  { s:"W",  name:"W · Energy density", script:"latin", layer:"reverie",  origin:"Latin 'W'; double-U (Germanic)", aether:"Energy density w=ρc²; W-boson (weak force carrier); work W=F·d; AETHER coherence density",       eq:"w_Λ=−1" },
  { s:"X",  name:"X · Unknown",    script:"latin", layer:"synthesis", origin:"Latin 'X'; Greek chi; unknown quantity", aether:"State vector X in CLCS; target state X* (desired coherence); position 4-vector x^μ",       eq:"E(t)=X*−X" },
  { s:"Z",  name:"Z · Impedance",  script:"latin", layer:"infernia",  origin:"Latin 'Z'; weapon / sword",         aether:"Impedance Z=R+iX; atomic number Z; partition function Z=Σe^(-E/kT); AETHER node index",          eq:"Z=Σe^(−βE)" },

  // ── EGYPTIAN ──
  { s:"☥",  name:"Ankh",      script:"egyptian", layer:"synthesis", native:"ꜥnḫ",  origin:"Loop-and-cross; key of life; eternal life in Egyptian theology",   aether:"Life force = coherence field C → 1; the loop = order parameter ψ_K; cross = boundary □ operator; unity of all four AETHER layers" },
  { s:"𓂀", name:"Eye of Horus", script:"egyptian", layer:"reverie", native:"wḏꜣt", origin:"Restored eye of Horus; protection, royal power, health",          aether:"Observer coupling in AETHER; the term that couples subjective measurement to the coherence field; wavefunction collapse as observation" },
  { s:"𓌀", name:"Djed Pillar", script:"egyptian", layer:"aletheia", native:"ḏd",  origin:"Stability pillar associated with Osiris; backbone of the sky",      aether:"Crystallisation lock — Stage 4 in AETHER; lattice ordering; the moment a coherence field locks into permanent structure" },
  { s:"𓆣", name:"Scarab",     script:"egyptian", layer:"synthesis", native:"ḫpr", origin:"Khepri the dung-beetle god; self-creation, transformation, sunrise", aether:"Phase transition in CGLE; self-generating order from chaos; AETHER's metamorphic function where decoherence triggers replication" },
  { s:"𓇳", name:"Ra Disc",    script:"egyptian", layer:"reverie",   native:"rꜥ",  origin:"Solar disc of Ra; radiance, supremacy, daily renewal",              aether:"Solar energy source in Fibonacci farm P=ηG_sA_φ; AETHER radiance output; the L4 REVERIE emission layer" },
  { s:"𓆄", name:"Feather of Ma'at", script:"egyptian", layer:"aletheia", native:"mꜣꜥt", origin:"Ostrich feather of truth and justice; cosmic order",      aether:"Coherence equilibrium C=1; the ground state of perfect truth-lattice ALETHEIA; weighed against the heart in judgment" },
  { s:"𓆙", name:"Ouroboros",  script:"egyptian", layer:"synthesis", native:"mḥn", origin:"Serpent eating its own tail; eternal cycle, primordial waters",    aether:"CLCS closed-loop feedback ẋ=V(x)+u+KE; self-referential coherence; the system that monitors itself to stay coherent" },
  { s:"𓇌", name:"Water Ripple", script:"egyptian", layer:"mnesis",  native:"mw",  origin:"Three wavy lines; water, the Nile, primordial ocean Nun",           aether:"Wave propagation — Maxwell's EM wave and AETHER's ψ wavefunction; the substrate medium through which coherence fields travel" },
  { s:"𓏲", name:"Neter Flag", script:"egyptian", layer:"infernia",  native:"nṯr", origin:"Staff with cloth; the concept of divine force / god",               aether:"Gauge field — the divine constraint that governs force direction; U(1) for EM, SU(2) for weak, SU(3) for colour charge" },
  { s:"𓋹", name:"Was Sceptre", script:"egyptian", layer:"infernia", native:"wꜣs", origin:"Animal-headed staff; power and dominion of gods",                  aether:"INFERNIA constraint engine — the force that compresses and directs; the operator that applies boundary conditions to the field" },
  { s:"𓂋", name:"Mouth",      script:"egyptian", layer:"reverie",   native:"rꜥ",  origin:"Open mouth; to speak, to create through word (Logos)",             aether:"AETHER output / emission; the Logos principle — information spoken into coherence; radiative manifestation of structured thought" },
  { s:"𓃭", name:"Lion",       script:"egyptian", layer:"mnesis",    native:"rw",  origin:"Crouching lion; strength, guardianship, raw power",                aether:"Potential energy stored in substrate — the compressed lion is U_input waiting to be released; MNĒSIS energy reservoir" },

  // ── JAPANESE ──
  { s:"空",  name:"Kū / Void",   script:"japanese", layer:"mnesis",    native:"kū",    origin:"Emptiness, sky, void (Buddhist śūnyatā); 5th element in gogyō",   aether:"Quantum vacuum state — the unperturbed substrate from which all fields emerge; C=0 before crystallisation; the ε veil darkness" },
  { s:"水",  name:"Mizu / Water", script:"japanese", layer:"mnesis",   native:"mizu",  origin:"Water; flow, adaptability; second element in gogyō",               aether:"Coherence fluid substrate; the medium through which AETHER's ψ waves propagate; lunar tidal coupling to coherence" },
  { s:"火",  name:"Hi / Fire",   script:"japanese", layer:"infernia",  native:"hi",    origin:"Fire; transformation, energy; third element in gogyō",             aether:"Energy injection u_input in CLCS; the activation that drives a system away from ground state; thermodynamic forcing" },
  { s:"木",  name:"Ki / Tree",   script:"japanese", layer:"aletheia",  native:"ki",    origin:"Wood/tree; growth, spring, upward movement; first element",        aether:"Fibonacci growth pattern rₙ=R√(n/N), θₙ=n×137.508°; tree-structured knowledge graph; AETHER hierarchical lattice" },
  { s:"金",  name:"Kin / Gold",  script:"japanese", layer:"synthesis", native:"kin",   origin:"Metal/gold; autumn, consolidation, harvest; fourth element",       aether:"Crystallised coherence — the gold state is Stage 4 Crystal Lock; AETHER reward state when C≈1 sustains permanently" },
  { s:"土",  name:"Tsuchi / Earth", script:"japanese", layer:"mnesis", native:"tsuchi", origin:"Earth/soil; centre, stability; fifth element in gogyō",           aether:"L1 MNĒSIS substrate — the ground layer of raw input data before any processing; the Planck-scale granular spacetime floor" },
  { s:"心",  name:"Kokoro / Heart", script:"japanese", layer:"reverie", native:"kokoro", origin:"Heart, mind, spirit; the feeling-centre of consciousness",       aether:"Observer coupling term in AETHER — the subjective agent whose measurement collapses the coherence wavefunction" },
  { s:"光",  name:"Hikari / Light", script:"japanese", layer:"reverie",native:"hikari", origin:"Light, radiance, illumination; divine brightness",               aether:"Electromagnetic field — Maxwell's equations govern light; photon = spin-1 boson; AETHER's radiative REVERIE layer output" },
  { s:"波",  name:"Nami / Wave",  script:"japanese", layer:"aletheia", native:"nami",  origin:"Wave, billow; oscillation; also used in 'wavelength'",             aether:"ψ wavefunction propagation; AETHER wave equation ∂²ψ/∂t² = c²∇²ψ + φR₃₆₉ − γ∂ψ/∂t; de Broglie matter waves" },
  { s:"気",  name:"Ki / Energy",  script:"japanese", layer:"synthesis",native:"ki",    origin:"Spirit, energy, atmosphere; the animating force of all things",    aether:"The coherence field C(x,t) itself — ki is the closest cultural concept to AETHER's unifying energy-information field" },
  { s:"間",  name:"Ma / Interval", script:"japanese", layer:"mnesis",  native:"ma",    origin:"Space between; pause; the pregnant gap",                          aether:"Planck substrate gap — the discrete quantum of spacetime; the 'between' that AETHER fills with coherence field C" },
  { s:"無",  name:"Mu / Nothingness", script:"japanese", layer:"mnesis", native:"mu", origin:"Nothing, non-being; Buddhist concept of emptiness beyond emptiness", aether:"ε veil — the error/darkness that suppresses C; also the vacuum energy state before Λ-dominated expansion" },
  { s:"道",  name:"Dō / Way",    script:"japanese", layer:"synthesis", native:"dō",    origin:"Way, path, principle; Taoism's ultimate reality behind all things", aether:"Geodesic in curved spacetime (GR); the natural flow V(x) in CLCS; AETHER's unforced trajectory of maximum coherence" },
  { s:"力",  name:"Chikara / Power", script:"japanese", layer:"infernia", native:"chikara", origin:"Strength, force, power; muscular exertion",                 aether:"AETHER manifestation operator ∫[∩]⊗Helix(Γ,ω)·C(x,t)dV; force as structured coherence acting on a substrate" },
  { s:"音",  name:"Oto / Sound", script:"japanese", layer:"reverie",  native:"oto",   origin:"Sound, noise, tone; vibration perceived by the ear",               aether:"Acoustic coherence — resonant modes in AETHER cavities; piezo-crystallisation triggered by sonic coherence at 3-6-9 Hz" },
  { s:"理",  name:"Ri / Reason", script:"japanese", layer:"aletheia", native:"ri",    origin:"Reason, principle, natural law; the pattern in jade",              aether:"ALETHEIA truth lattice — the self-consistent logical structure of AETHER; the principle that C²=0 cannot crystallise" },
  { s:"和",  name:"Wa / Harmony", script:"japanese", layer:"synthesis", native:"wa",  origin:"Harmony, peace, balance; Japan's traditional aesthetic principle",  aether:"Kuramoto synchrony ψ_K=1; perfect phase coherence across all oscillators; AETHER target state of universal harmony" },
  { s:"宇",  name:"U / Universe", script:"japanese", layer:"synthesis", native:"u",   origin:"Eaves of a house; extended to mean 'space' and 'universe'",        aether:"The AETHER substrate field extended to cosmic scale; Friedmann equation H²=H₀²(Ω_m+Ω_Λ+Ω_r) as universe coherence" },

  // ── RUSSIAN ──
  { s:"А",  name:"A (Cyrillic)",     script:"russian", layer:"mnesis",    native:"a",     origin:"From Greek alpha; Russian amplitude / Амплитуда",              aether:"Amplitude A(x) of the coherence field; the substrate strength in MNĒSIS before modulation" },
  { s:"Г",  name:"Ge / Gamma",       script:"russian", layer:"synthesis", native:"g",     origin:"From Greek gamma; Гравитон (graviton) / Гравитация",            aether:"Graviton G̃; Newton's constant G; Barbero-Immirzi γ; toroidal circulation Γ_helix" },
  { s:"Д",  name:"De / Delta",       script:"russian", layer:"infernia",  native:"d",     origin:"From Greek delta; Дельта (delta); Дирак (Dirac)",               aether:"Dirac delta δ(x); perturbation Δ; AETHER discrete jump between coherence states" },
  { s:"Е",  name:"Ye / Energy",      script:"russian", layer:"infernia",  native:"ye",    origin:"From Greek epsilon; Энергия (energy); Электрон",                aether:"Energy E=mc²; electric field E; error vector E(t)=X*−X in AETHER CLCS control law" },
  { s:"Ж",  name:"Zhe / Rigidity",   script:"russian", layer:"aletheia",  native:"zh",    origin:"Unique Cyrillic; Жёсткость (rigidity/stiffness)",               aether:"Righting coefficient in AETHER boat sim; metacentric rigidity GM; structural restoration force" },
  { s:"З",  name:"Ze / Impedance",   script:"russian", layer:"infernia",  native:"z",     origin:"From Greek zeta; Затухание (damping); Заряд (charge)",          aether:"Impedance Z; partition function Z=Σe^(−E/kT); AETHER node labelling in graph structures" },
  { s:"К",  name:"Ka / Curvature",   script:"russian", layer:"aletheia",  native:"k",     origin:"From Greek kappa; Кривизна (curvature); Константа",             aether:"Riemann curvature tensor K_μνρσ; spring constant k; Kuramoto coupling constant K; AETHER decay κ" },
  { s:"Л",  name:"El / Lambda",      script:"russian", layer:"reverie",   native:"l",     origin:"From Greek lambda; Лямбда (lambda); Лазер; Лептон",             aether:"Wavelength λ=c/ν; cosmological constant Λ; Lyapunov exponent λ; lepton flavour label" },
  { s:"М",  name:"Em / Mass",        script:"russian", layer:"mnesis",    native:"m",     origin:"From Greek mu; Масса (mass); Магнит (magnet)",                  aether:"Mass M in E=Mc²; magnetic moment M; magnetisation M in Maxwell; AETHER matter substrate" },
  { s:"Н",  name:"En / Neutron",     script:"russian", layer:"mnesis",    native:"n",     origin:"From Greek nu; Нейтрон (neutron); Нейтрино",                    aether:"Quantum number n; neutron n in nuclear physics; AETHER number of coherence nodes N" },
  { s:"О",  name:"O / Oscillator",   script:"russian", layer:"aletheia",  native:"o",     origin:"From Greek omicron; Осциллятор; Орбита",                        aether:"Coupled oscillator in Kuramoto model; orbital frequency ω₀; AETHER harmonic mode O_k" },
  { s:"П",  name:"Pe / Pi",          script:"russian", layer:"aletheia",  native:"p",     origin:"From Greek pi; Пи (π); Поле (field); Протон",                   aether:"π=3.14159; pion π⁺π⁻π⁰; product Π; pressure P; proton in nuclear substrate" },
  { s:"Р",  name:"Er / Riemann",     script:"russian", layer:"aletheia",  native:"r",     origin:"From Greek rho; Риман (Riemann); Ридберг (Rydberg)",             aether:"Riemann curvature tensor R_μν; Rydberg constant R_∞; AETHER lattice radius R in Fibonacci spiral" },
  { s:"С",  name:"Es / Spin",        script:"russian", layer:"infernia",  native:"s",     origin:"From Greek sigma; Спин (spin); Энтропия (entropy S)",            aether:"Spin-½ fermions; entropy S=k_B ln Ω; reference state S* in AETHER error calculation; conductivity σ" },
  { s:"Т",  name:"Te / Tensor",      script:"russian", layer:"synthesis", native:"t",     origin:"From Greek tau; Тензор (tensor); Температура",                  aether:"Stress-energy tensor T_μν sourcing Einstein equations; temperature T; proper time τ in GR" },
  { s:"Ф",  name:"Ef / Phi",         script:"russian", layer:"synthesis", native:"f",     origin:"From Greek phi; Φ golden ratio; Физика; Фотон",                 aether:"Golden ratio φ=1.618; electromagnetic potential Φ; photon γ; AETHER's vortex amplification constant" },
  { s:"Х",  name:"Kha / Chaos",      script:"russian", layer:"mnesis",    native:"kh",    origin:"From Greek chi; Хаос (chaos); Химия; Хаотичный",                aether:"Pre-coherence chaos state — the raw substrate before AETHER orders it; opposite of C=1" },
  { s:"Ч",  name:"Che / Frequency",  script:"russian", layer:"reverie",   native:"ch",    origin:"Unique Cyrillic; Частота (frequency); Число (number)",           aether:"Angular frequency ω=2πν=2πЧ; the oscillation count that determines coherence resonance conditions" },
  { s:"Ш",  name:"Sha / Noise",      script:"russian", layer:"mnesis",    native:"sh",    origin:"Unique Cyrillic; Шум (noise/static); Штурм (storm)",             aether:"Decoherence source — the thermal/quantum noise that drives ε away from zero; inverse of coherence" },
  { s:"Э",  name:"E / Electron",     script:"russian", layer:"mnesis",    native:"e",     origin:"Reverse E; Электрон (electron); Электромагнетизм",              aether:"Electron charge e=1.602×10⁻¹⁹ C; electron field in QED; AETHER's elementary charge quantum" },
  { s:"Ю",  name:"Yu / Yukawa",      script:"russian", layer:"infernia",  native:"yu",    origin:"Unique Cyrillic; Юкава (Yukawa coupling); Юпитер",              aether:"Yukawa coupling Y_ij gives fermion masses via Higgs; AETHER Yukawa-analogue for coherence mass terms" },
  { s:"Я",  name:"Ya / Observer",    script:"russian", layer:"reverie",   native:"ya",    origin:"Unique Cyrillic; 'I' (first person); Ядро (nucleus / core)",    aether:"The observer — Я = 'I'; the fundamental first-person perspective that collapses the coherence wavefunction; observer coupling in AETHER" },

  // ── AETHER NATIVE ──
  { s:"~",  name:"Tilde / Mnesis",    script:"aether", layer:"mnesis",    origin:"AETHER native glyph; Latin tilde ~",  aether:"L1 MNĒSIS symbol — raw input substrate, unformed memory, the pre-conscious field before pattern is imposed",   eq:"~ψ" },
  { s:"|||",name:"Trident / Infernia",script:"aether", layer:"infernia",  origin:"AETHER native glyph; three bars",      aether:"L2 INFERNIA symbol — constraint engine, compression force, the operator that bounds and shapes the field",     eq:"|||·ε" },
  { s:"◇",  name:"Diamond / Aletheia",script:"aether", layer:"aletheia", origin:"AETHER native glyph; diamond shape",   aether:"L3 ALETHEIA symbol — structural resolution, truth lattice, geometric order crystallised from constrained input", eq:"◇·θ" },
  { s:"✧",  name:"Sparkle / Reverie", script:"aether", layer:"reverie",  origin:"AETHER native glyph; four-point star", aether:"L4 REVERIE symbol — radiative output, coherent expression, the field at high C emitting its own light",         eq:"✧·C" },
  { s:"★",  name:"Star / Synthesis",  script:"aether", layer:"synthesis",origin:"AETHER native glyph; five-point star", aether:"L5 SYNTHESIS symbol — crystallised manifestation, all layers unified, C → 1 sustained indefinitely",           eq:"★=C→1" },
  { s:"□",  name:"Boundary / d'Alembertian", script:"aether", layer:"aletheia", origin:"Square; d'Alembertian operator □=∂²/∂t²−c²∇²", aether:"Boundary operator in AETHER engine; d'Alembertian □ describes wave propagation; Manifestation = □·∫[∩]⊗Helix dV", eq:"□h̄μν" },
  { s:"∩",  name:"Curvature / Ptah",  script:"aether", layer:"aletheia", origin:"Arch; set intersection symbol ∩",      aether:"Ricci curvature operator in AETHER; Ptah Grammar — the way AETHER bends informational geometry around matter",   eq:"∩·Rμν" },
  { s:"⊗",  name:"Tensor Product",    script:"aether", layer:"synthesis",origin:"Circled times ⊗; tensor product in mathematics", aether:"Field coupling operator in Manifestation = □·∫[∩]⊗Helix(Γ,ω)·C dV; couples curvature to coherence field", eq:"∩⊗Helix" },
  { s:"φ",  name:"Golden Ratio",      script:"aether", layer:"synthesis",origin:"Greek phi; also AETHER's geometric scaling law", aether:"φ = 1.6180339…; AETHER vortex seeding angle 137.508°=360°/φ²; amplification gain in wave equation",       eq:"φ=1.618" },
  { s:"∞",  name:"Infinity",          script:"aether", layer:"synthesis",origin:"Lemniscate symbol ∞; John Wallis (1655)",       aether:"Infinite coherence potential; Lorentz group is infinite-dimensional; AETHER's aspiration state",             eq:"C→∞→1" },
  { s:"∇",  name:"Nabla / Del",       script:"aether", layer:"aletheia", origin:"Harp shape; vector differential operator ∇",    aether:"Gradient ∇C; divergence ∇·E=ρ/ε₀; curl ∇×B; Laplacian ∇²; all spatial structure in Maxwell and AETHER",    eq:"∇²C" },
  { s:"∂",  name:"Partial Derivative",script:"aether", layer:"reverie",  origin:"Variant delta ∂; Leibniz partial derivative notation", aether:"Time evolution ∂C/∂t; spatial gradient ∂_μ; AETHER's measure of how fast coherence changes at a point", eq:"∂C/∂t" },
  { s:"ℏ",  name:"Reduced Planck",    script:"aether", layer:"mnesis",   origin:"h-bar; ℏ = h/2π = 1.055×10⁻³⁴ J·s",           aether:"Planck quantum of action; ΔxΔp≥ℏ/2; AETHER's fundamental discreteness scale — the grain of the substrate",    eq:"ΔxΔp≥ℏ/2" },
  { s:"ℓ_P", name:"Planck Length",   script:"aether", layer:"mnesis",   origin:"ℓ_P=√(ℏG/c³)=1.616×10⁻³⁵ m",                  aether:"Smallest meaningful length in AETHER substrate; LQG area A_j=8πγℓ_P²√(j(j+1)); below ℓ_P spacetime granulates", eq:"A_j∝ℓ_P²" },
  { s:"⟨⟩", name:"Bra-Ket / Bracket",script:"aether", layer:"reverie",  origin:"Dirac bra-ket notation ⟨ψ|Ô|φ⟩",               aether:"Quantum expectation value; AETHER coherence measure ⟨C⟩ averaged over the field; inner product of two states",   eq:"⟨ψ|H|ψ⟩" },
  { s:"∮",  name:"Closed Integral",  script:"aether", layer:"synthesis",origin:"Closed contour integral symbol",                aether:"Faraday's law ∮E·dl=−dΦ/dt; Stokes theorem; AETHER closed-loop CLCS feedback as a contour integral over state space", eq:"∮E·dl" },
];

// ── Component ─────────────────────────────────────────────────────────────────
type ViewMode = "layer" | "script" | "az";

export default function SymbolAlphabetPage() {
  const [search,  setSearch]  = useState("");
  const [scripts, setScripts] = useState<Set<Script>>(new Set());
  const [layers,  setLayers]  = useState<Set<Layer>>(new Set());
  const [view,    setView]    = useState<ViewMode>("layer");
  const [active,  setActive]  = useState<Sym | null>(null);

  const toggleScript = (s: Script) => setScripts(prev => {
    const n = new Set(prev); n.has(s) ? n.delete(s) : n.add(s); return n;
  });
  const toggleLayer = (l: Layer) => setLayers(prev => {
    const n = new Set(prev); n.has(l) ? n.delete(l) : n.add(l); return n;
  });

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return DATA.filter(d => {
      if (scripts.size && !scripts.has(d.script)) return false;
      if (layers.size  && !layers.has(d.layer))   return false;
      if (q && !d.name.toLowerCase().includes(q) && !d.aether.toLowerCase().includes(q) && !d.origin.toLowerCase().includes(q)) return false;
      return true;
    });
  }, [search, scripts, layers]);

  const byLayer   = useMemo(() => {
    const ord: Layer[] = ["mnesis","infernia","aletheia","reverie","synthesis"];
    return ord.map(l => ({ l, syms: filtered.filter(d => d.layer === l) })).filter(g => g.syms.length);
  }, [filtered]);

  const byScript  = useMemo(() => {
    const ord: Script[] = ["greek","latin","egyptian","japanese","russian","aether"];
    return ord.map(s => ({ s, syms: filtered.filter(d => d.script === s) })).filter(g => g.syms.length);
  }, [filtered]);

  const byAZ = useMemo(() => [...filtered].sort((a, b) => a.name.localeCompare(b.name)), [filtered]);

  const stats = useMemo(() => {
    const sc = new Set(DATA.map(d => d.script)).size;
    return { total: DATA.length, scripts: sc, filtered: filtered.length };
  }, [filtered]);

  return (
    <div style={{ height:"100%", display:"flex", flexDirection:"column", background:BG, color:WHT, fontFamily:MONO, fontSize:11, overflow:"hidden" }}>

      {/* ── Header ─────────────────────────────────────────────── */}
      <div style={{ padding:"14px 20px 0", borderBottom:`1px solid ${BRD}`, flexShrink:0, background:"rgba(2,8,20,0.95)", backdropFilter:"blur(8px)" }}>
        <div style={{ display:"flex", alignItems:"flex-end", gap:20, paddingBottom:12, borderBottom:"1px solid rgba(255,255,255,0.04)", flexWrap:"wrap" }}>
          <div>
            <div style={{ fontSize:13, fontWeight:700, letterSpacing:"0.22em", color:GOLD }}>SYMBOL ALPHABET</div>
            <div style={{ fontSize:8, color:"rgba(242,195,84,0.4)", letterSpacing:"0.16em", marginTop:2 }}>AETHER LAYERED CROSS-SCRIPT REFERENCE · GREEK · LATIN · EGYPTIAN · JAPANESE · RUSSIAN</div>
            <div style={{ fontSize:11, color:MUT, fontFamily:SERIF, lineHeight:1.65, marginTop:6, maxWidth:620 }}>
              Every symbol across six writing systems, assigned to an AETHER cognitive layer and described in terms of its role in the coherence architecture. Filter by script, layer, or search any meaning.
            </div>
          </div>
          <div style={{ display:"flex", gap:8, marginLeft:"auto", flexWrap:"wrap" }}>
            {[
              { n: stats.total.toString(), label:"total symbols", col:GOLD   },
              { n: stats.scripts.toString(), label:"scripts",     col:CYAN   },
              { n: stats.filtered.toString(), label:"showing",    col:TEAL   },
            ].map(({ n, label, col }) => (
              <div key={label} style={{ textAlign:"center", padding:"6px 12px", borderRadius:8, border:`1px solid ${col}25`, background:`${col}08` }}>
                <div style={{ fontSize:16, fontWeight:700, color:col }}>{n}</div>
                <div style={{ fontSize:7, color:`${col}70`, letterSpacing:"0.12em" }}>{label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Search + view toggle */}
        <div style={{ display:"flex", gap:10, paddingTop:10, alignItems:"center", flexWrap:"wrap" }}>
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="search symbols, names, meanings…"
            style={{ background:"rgba(255,255,255,0.04)", border:"1px solid rgba(255,255,255,0.1)", borderRadius:6, padding:"5px 12px", color:WHT, fontFamily:MONO, fontSize:10, width:240, outline:"none" }} />
          <div style={{ display:"flex", gap:4 }}>
            {(["layer","script","az"] as ViewMode[]).map(v => (
              <button key={v} onClick={() => setView(v)}
                style={{ padding:"4px 10px", borderRadius:5, cursor:"pointer", fontFamily:MONO, fontSize:9, letterSpacing:"0.1em", border:`1px solid ${view===v ? GOLD : "rgba(255,255,255,0.08)"}`, background: view===v ? `${GOLD}18` : "transparent", color: view===v ? GOLD : MUT, transition:"all 0.15s" }}>
                {v === "layer" ? "BY LAYER" : v === "script" ? "BY SCRIPT" : "A – Z"}
              </button>
            ))}
          </div>
          <div style={{ marginLeft:"auto", display:"flex", gap:4, flexWrap:"wrap" }}>
            {(Object.entries(SCRIPTS) as [Script, { label:string; col:string }][]).map(([key, { label, col }]) => (
              <button key={key} onClick={() => toggleScript(key)}
                style={{ padding:"3px 9px", borderRadius:4, cursor:"pointer", fontFamily:MONO, fontSize:8, border:`1px solid ${scripts.has(key) ? col : col+"30"}`, background: scripts.has(key) ? `${col}20` : "transparent", color: scripts.has(key) ? col : `${col}70`, transition:"all 0.12s" }}>
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* Layer pills */}
        <div style={{ display:"flex", gap:4, paddingTop:8, paddingBottom:10, flexWrap:"wrap" }}>
          {(Object.entries(LAYERS) as [Layer, typeof LAYERS[Layer]][]).map(([key, { label, col, sym }]) => (
            <button key={key} onClick={() => toggleLayer(key)}
              style={{ padding:"3px 10px", borderRadius:4, cursor:"pointer", fontFamily:MONO, fontSize:8, letterSpacing:"0.1em", border:`1px solid ${layers.has(key) ? col : col+"30"}`, background: layers.has(key) ? `${col}20` : "transparent", color: layers.has(key) ? col : `${col}70`, transition:"all 0.12s" }}>
              {sym} {label}
            </button>
          ))}
        </div>
      </div>

      {/* ── Content ─────────────────────────────────────────────── */}
      <div style={{ flex:1, overflowY:"auto", padding:"14px 20px", display:"flex", gap:16 }}>

        {/* Symbol grid */}
        <div style={{ flex:1 }}>
          {view === "layer" && byLayer.map(({ l, syms }) => {
            const lm = LAYERS[l];
            return (
              <div key={l} style={{ marginBottom:24 }}>
                <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:12 }}>
                  <span style={{ fontSize:16, color:lm.col }}>{lm.sym}</span>
                  <span style={{ fontSize:11, fontWeight:700, color:lm.col, letterSpacing:"0.18em" }}>{lm.label}</span>
                  <span style={{ fontSize:8, color:`${lm.col}60` }}>{lm.sub}</span>
                  <span style={{ fontSize:8, color:`${lm.col}40`, marginLeft:6 }}>{syms.length} symbols</span>
                  <div style={{ flex:1, height:1, background:`${lm.col}20`, marginLeft:8 }} />
                </div>
                <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(130px,1fr))", gap:8 }}>
                  {syms.map((sym, i) => <SymCard key={i} sym={sym} onClick={() => setActive(active?.s === sym.s ? null : sym)} active={active?.s === sym.s} />)}
                </div>
              </div>
            );
          })}

          {view === "script" && byScript.map(({ s, syms }) => {
            const sm = SCRIPTS[s];
            return (
              <div key={s} style={{ marginBottom:24 }}>
                <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:12 }}>
                  <span style={{ fontSize:11, fontWeight:700, color:sm.col, letterSpacing:"0.18em" }}>{sm.label.toUpperCase()}</span>
                  <span style={{ fontSize:8, color:`${sm.col}40` }}>{syms.length} symbols</span>
                  <div style={{ flex:1, height:1, background:`${sm.col}20`, marginLeft:8 }} />
                </div>
                <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(130px,1fr))", gap:8 }}>
                  {syms.map((sym, i) => <SymCard key={i} sym={sym} onClick={() => setActive(active?.s === sym.s ? null : sym)} active={active?.s === sym.s} />)}
                </div>
              </div>
            );
          })}

          {view === "az" && (
            <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(130px,1fr))", gap:8 }}>
              {byAZ.map((sym, i) => <SymCard key={i} sym={sym} onClick={() => setActive(active?.s === sym.s ? null : sym)} active={active?.s === sym.s} />)}
            </div>
          )}
        </div>

        {/* Detail panel */}
        {active && (
          <div style={{ width:280, flexShrink:0, background:PANEL, border:`1px solid ${LAYERS[active.layer].col}30`, borderRadius:12, padding:"16px", alignSelf:"flex-start", position:"sticky", top:0 }}>
            <div style={{ fontSize:52, textAlign:"center", lineHeight:1.2, marginBottom:12, color:LAYERS[active.layer].col, textShadow:`0 0 24px ${LAYERS[active.layer].col}60` }}>{active.s}</div>
            <div style={{ textAlign:"center", fontSize:13, fontWeight:700, color:WHT, marginBottom:2 }}>{active.name}</div>
            {active.native && <div style={{ textAlign:"center", fontSize:9, color:MUT, letterSpacing:"0.12em", marginBottom:8 }}>/{active.native}/</div>}
            <div style={{ display:"flex", gap:6, justifyContent:"center", marginBottom:12, flexWrap:"wrap" }}>
              <span style={{ fontSize:8, padding:"2px 7px", borderRadius:4, border:`1px solid ${SCRIPTS[active.script].col}40`, color:SCRIPTS[active.script].col }}>{SCRIPTS[active.script].label}</span>
              <span style={{ fontSize:8, padding:"2px 7px", borderRadius:4, border:`1px solid ${LAYERS[active.layer].col}40`, color:LAYERS[active.layer].col }}>{LAYERS[active.layer].label}</span>
            </div>
            {active.eq && (
              <div style={{ background:`${LAYERS[active.layer].col}10`, border:`1px solid ${LAYERS[active.layer].col}25`, borderRadius:6, padding:"6px 10px", marginBottom:12, fontFamily:MONO, fontSize:12, color:LAYERS[active.layer].col, textAlign:"center" }}>{active.eq}</div>
            )}
            <div style={{ fontSize:9, color:`${LAYERS[active.layer].col}80`, letterSpacing:"0.12em", marginBottom:5 }}>ORIGIN</div>
            <div style={{ fontSize:10, color:MUT, fontFamily:SERIF, lineHeight:1.7, marginBottom:12 }}>{active.origin}</div>
            <div style={{ fontSize:9, color:`${LAYERS[active.layer].col}80`, letterSpacing:"0.12em", marginBottom:5 }}>AETHER ROLE</div>
            <div style={{ fontSize:10, color:WHT, fontFamily:SERIF, lineHeight:1.75, opacity:0.85 }}>{active.aether}</div>
            <button onClick={() => setActive(null)} style={{ marginTop:14, width:"100%", padding:"5px", border:`1px solid rgba(255,255,255,0.1)`, borderRadius:5, background:"transparent", color:MUT, cursor:"pointer", fontFamily:MONO, fontSize:8 }}>CLOSE</button>
          </div>
        )}
      </div>
    </div>
  );
}

// ── Symbol Card ───────────────────────────────────────────────────────────────
function SymCard({ sym, onClick, active }: { sym: Sym; onClick: () => void; active: boolean }) {
  const lm = LAYERS[sym.layer];
  const sm = SCRIPTS[sym.script];
  return (
    <button onClick={onClick}
      style={{ background: active ? `${lm.col}14` : PANEL, border:`1px solid ${active ? lm.col : lm.col+"20"}`, borderRadius:8, padding:"10px 8px", cursor:"pointer", textAlign:"center", transition:"all 0.15s", width:"100%" }}>
      <div style={{ fontSize:26, color:lm.col, lineHeight:1.2, marginBottom:6, textShadow: active ? `0 0 12px ${lm.col}60` : "none" }}>{sym.s}</div>
      <div style={{ fontSize:9, color:WHT, fontWeight:600, marginBottom:3, whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis" }}>{sym.name}</div>
      <div style={{ display:"flex", gap:4, justifyContent:"center", flexWrap:"wrap" }}>
        <span style={{ fontSize:7, padding:"1px 5px", borderRadius:3, border:`1px solid ${sm.col}30`, color:`${sm.col}80` }}>{sm.label}</span>
        <span style={{ fontSize:7, padding:"1px 5px", borderRadius:3, border:`1px solid ${lm.col}30`, color:`${lm.col}80` }}>{lm.sym}</span>
      </div>
    </button>
  );
}
