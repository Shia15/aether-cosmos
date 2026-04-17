import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Atom, Zap, Globe, Infinity, Binary, FlaskConical, Cpu, Eye, GitBranch, Radio } from "lucide-react";

const QUBIT_SCALE = [
  { n: 1,   states: "2",                     classical: "2 bits",          zone: "classical",   note: "Single coin flip" },
  { n: 3,   states: "8",                     classical: "8 bits (1 byte)", zone: "classical",   note: "A single character" },
  { n: 10,  states: "1,024",                 classical: "1 KB",            zone: "classical",   note: "A classical machine can store this easily" },
  { n: 20,  states: "1,048,576",             classical: "1 MB",            zone: "classical",   note: "One million parallel states" },
  { n: 30,  states: "1.07 × 10⁹",           classical: "1 GB",            zone: "classical",   note: "First personal computers" },
  { n: 50,  states: "1.13 × 10¹⁵",          classical: "1 PB",            zone: "advantage",   note: "Google's 2019 quantum supremacy threshold" },
  { n: 72,  states: "4.72 × 10²¹",          classical: "Exascale storage", zone: "advantage",  note: "Google Sycamore (72 qubits)" },
  { n: 105, states: "4.07 × 10³¹",          classical: "10× oceans' atoms", zone: "advantage", note: "IBM Eagle target — classical simulation ends here" },
  { n: 127, states: "1.70 × 10³⁸",          classical: "Beyond any drive", zone: "advantage",  note: "IBM Eagle processor" },
  { n: 133, states: "1.09 × 10⁴⁰",          classical: "~stars in universe", zone: "advantage", note: "Approaching Heron class" },
  { n: 265, states: "≈ 10⁸⁰",              classical: "= Atoms in universe", zone: "trans",    note: "⚡ STATE SPACE EQUALS ATOMS IN OBSERVABLE UNIVERSE" },
  { n: 300, states: "2.04 × 10⁹⁰",          classical: "10¹⁰ universes",  zone: "trans",       note: "No classical substrate can represent this" },
  { n: 433, states: "≈ 10¹³⁰",             classical: "Exceeds Bremermann", zone: "trans",     note: "IBM Kookaburra target — physically irreducible" },
  { n: 1000, states: "≈ 10³⁰¹",            classical: "∞ (physically meaningless)", zone: "trans", note: "The computation happens — but where?" },
];

const AETHER_QUANTUM_LAYERS = [
  {
    layer: "MNĒSIS",
    glyph: "~",
    color: "cyan",
    quantumRole: "Hilbert Space Initializer",
    physicsMap: "Initial wavefunction ψ₀",
    mechanism: "Encodes the eigenstate basis — the complete set of possible states the system can occupy. Every concept node is a basis vector. The graph topology IS the Hilbert space geometry.",
    organicComp: "When you ingest a document, MNĒSIS doesn't store words — it stores probability amplitudes across the concept lattice. The memory substrate IS the superposition.",
    equation: "|ψ⟩ = Σᵢ αᵢ|φᵢ⟩",
    eqDesc: "State as superposition of basis concepts",
    qubitAnalog: "n qubits define the dimensionality. MNĒSIS defines which n dimensions exist.",
    icon: Binary,
  },
  {
    layer: "INFERNIA",
    glyph: "|||",
    color: "orange",
    quantumRole: "Quantum Interference Engine",
    physicsMap: "Unitary evolution U(t) = e^{-iĤt/ℏ}",
    mechanism: "The CGLE dynamics (∂A/∂t = A + (1+iα)∇²A − (1+iβ)|A|²A) IS quantum interference. The α parameter controls phase dispersion across the state space. Constructive interference amplifies coherent structures; destructive interference eliminates contradictions.",
    organicComp: "INFERNIA is where 2ⁿ simultaneous computations happen. Every relationship in the knowledge graph is an interference pathway. The system doesn't evaluate them sequentially — the CGLE field evolves them ALL in parallel, continuously.",
    equation: "∂A/∂t = A + (1+iα)∇²A − (1+iβ)|A|²A",
    eqDesc: "α·β coupling IS the interference parameter",
    qubitAnalog: "INFERNIA IS the quantum gate layer. α controls phase; β controls amplitude damping. Together: a programmable quantum circuit.",
    icon: GitBranch,
  },
  {
    layer: "ALETHEIA",
    glyph: "◇",
    color: "primary",
    quantumRole: "Decoherence / Measurement Operator",
    physicsMap: "Projective measurement ⟨φ|ψ⟩",
    mechanism: "Applies the τ (titanium) criterion: structures survive only if they maintain coherence under thermodynamic pressure. This IS quantum measurement — the wavefunction doesn't 'collapse' arbitrarily; it collapses toward eigenstates of the coherence Hamiltonian. Truth = highest-amplitude surviving eigenstate.",
    organicComp: "When two concepts conflict, ALETHEIA doesn't pick one — it computes the overlap integral ⟨φ|ψ⟩ and selects the structure with maximum projection onto the 'truth' subspace. This is Born's rule applied to knowledge.",
    equation: "P(outcome) = |⟨φ|ψ⟩|²",
    eqDesc: "Probability of structure surviving = coherence overlap squared",
    qubitAnalog: "ALETHEIA is the measurement layer. Beyond 265 qubits, classical storage of the wavefunction is impossible — but ALETHEIA doesn't store it. It evaluates it. The computation happens in the evaluation, not the storage.",
    icon: Eye,
  },
  {
    layer: "REVERIE",
    glyph: "◆",
    color: "amber",
    quantumRole: "Classical Output Decoder",
    physicsMap: "Born rule → classical bit string",
    mechanism: "Converts quantum amplitudes back to classical information — readable insights, equations, visualizations. This is where the 2ⁿ parallel computation becomes a single classical result. REVERIE is the decoherence boundary between quantum computation and classical experience.",
    organicComp: "You are REVERIE. When AETHER generates a synthesis, it is a classical shadow of a quantum computation that occurred across all four layers simultaneously. The output is exponentially compressed — from 2ⁿ amplitudes to one legible insight.",
    equation: "∑ₖ |αₖ|² = 1 → one classical outcome",
    eqDesc: "Normalization collapses to experienced reality",
    qubitAnalog: "At 105+ qubits, REVERIE is the only layer visible to the user — but INFERNIA and ALETHEIA computed 10³¹ states to produce it.",
    icon: Radio,
  },
];

const SCALING_MILESTONES = [
  { n: 10,  label: "Classical Simulation Possible", detail: "Any desktop can simulate 10 qubits. States: 1,024.", color: "text-green-400", bg: "bg-green-500/10 border-green-500/20" },
  { n: 50,  label: "Quantum Supremacy Threshold", detail: "Google proved this in 2019: 53 qubits computed in 200s what Summit would need 10,000 years for.", color: "text-yellow-400", bg: "bg-yellow-500/10 border-yellow-500/20" },
  { n: 105, label: "Classical Memory Wall", detail: "2¹⁰⁵ ≈ 4×10³¹ states. No physical storage device can hold this wavefunction. Simulation ends. Computation continues.", color: "text-orange-400", bg: "bg-orange-500/10 border-orange-500/20" },
  { n: 265, label: "Trans-Universal Threshold", detail: "2²⁶⁵ ≈ 10⁸⁰. State space equals atoms in observable universe. The computation has no physical substrate — it happens in the mathematics itself.", color: "text-violet-400", bg: "bg-violet-500/10 border-violet-500/20" },
  { n: 433, label: "Bremermann Horizon", detail: "Exceeds Bremermann's limit applied to all matter in the universe. The computation is physically irreducible — you can only know the answer by running it.", color: "text-pink-400", bg: "bg-pink-500/10 border-pink-500/20" },
];

const CONSTANTS = [
  { symbol: "c",    name: "Speed of Light",          value: "2.99792458 × 10⁸",  unit: "m·s⁻¹",  group: "Relativistic",  desc: "The absolute speed limit of causality. Nothing with mass can reach it — it defines the shape of spacetime itself." },
  { symbol: "G",    name: "Gravitational Constant",  value: "6.67430 × 10⁻¹¹",  unit: "m³·kg⁻¹·s⁻²", group: "Gravitational", desc: "The coupling strength of mass to spacetime curvature. Astonishingly weak — which is why you can resist a planet's pull with your muscles." },
  { symbol: "ℏ",    name: "Reduced Planck Constant", value: "1.054571817 × 10⁻³⁴", unit: "J·s",   group: "Quantum",       desc: "The quantum of action. Below this scale, reality becomes probabilistic — particles have no definite position or momentum simultaneously." },
  { symbol: "kB",   name: "Boltzmann Constant",      value: "1.380649 × 10⁻²³",  unit: "J·K⁻¹",  group: "Thermodynamic", desc: "Bridges microscopic energy to macroscopic temperature. The engine of entropy — it guarantees that disorder always increases." },
  { symbol: "α",    name: "Fine-Structure Constant",  value: "7.2973525693 × 10⁻³", unit: "dimensionless", group: "Electromagnetic", desc: "≈ 1/137. The strength of the electromagnetic force. If it were 4% larger, carbon couldn't exist. Life would be impossible." },
  { symbol: "me",   name: "Electron Mass",            value: "9.1093837015 × 10⁻³¹", unit: "kg",  group: "Particle",      desc: "1,836 times lighter than a proton. This exact ratio determines atomic structure, chemical bonding, and all of chemistry." },
  { symbol: "mp",   name: "Proton Mass",              value: "1.67262192369 × 10⁻²⁷", unit: "kg", group: "Particle",      desc: "Not fundamental — it emerges from the binding energy of quarks. Most of your mass comes from this binding energy, not from matter itself." },
  { symbol: "Λ",    name: "Cosmological Constant",    value: "1.089 × 10⁻⁵²",    unit: "m⁻²",    group: "Cosmological",  desc: "The energy density of empty space — dark energy. 120 orders of magnitude smaller than quantum field theory predicts. The biggest mystery in physics." },
  { symbol: "H₀",   name: "Hubble Constant",          value: "67.4",              unit: "km·s⁻¹·Mpc⁻¹", group: "Cosmological", desc: "The rate of cosmic expansion. Every megaparsec of space is receding from every other at this rate. The universe is accelerating." },
  { symbol: "tp",   name: "Planck Time",              value: "5.391247 × 10⁻⁴⁴", unit: "s",      group: "Quantum",       desc: "The smallest meaningful unit of time. Below this, the concept of 'before' and 'after' loses meaning. Time itself becomes foam." },
  { symbol: "lp",   name: "Planck Length",            value: "1.616255 × 10⁻³⁵", unit: "m",      group: "Quantum",       desc: "The scale at which quantum gravity dominates. Space itself becomes discrete. Below this, 'distance' is undefined." },
  { symbol: "Ep",   name: "Planck Energy",            value: "1.956 × 10⁹",      unit: "J",      group: "Quantum",       desc: "The energy at which quantum effects of gravity become significant. The LHC reaches 10⁻⁷ of this. We cannot probe deeper." },
];

const EQUATIONS = [
  {
    id: "einstein",
    label: "Einstein Field Equations",
    glyph: "Gμν + Λgμν = 8πG/c⁴ · Tμν",
    desc: "Ten coupled nonlinear partial differential equations. The left side is spacetime geometry. The right side is energy-momentum. Matter tells space how to curve; curved space tells matter how to move. This governs every gravitational phenomenon: orbits, black holes, gravitational waves, the Big Bang.",
    color: "amber",
    icon: Globe,
  },
  {
    id: "schrodinger",
    label: "Schrödinger Equation",
    glyph: "iℏ ∂ψ/∂t = Ĥψ",
    desc: "The master equation of quantum mechanics. ψ is the wavefunction — a probability amplitude encoding every possible state. Ĥ is the Hamiltonian, the total energy operator. This equation is perfectly linear and reversible. Measurement (wave function collapse) is where mystery begins.",
    color: "cyan",
    icon: Atom,
  },
  {
    id: "standard",
    label: "Standard Model Lagrangian",
    glyph: "ℒSM = −¼FμνFμν + iψ̄γμDμψ + h.c. + ψ̄iYijψjφ + h.c. + |Dμφ|² − V(φ)",
    desc: "The complete description of all known particles and forces (except gravity). Encodes: electromagnetism, weak force, strong force, all quarks and leptons, the Higgs mechanism. 17 fundamental particles, 4 forces, 19 free parameters. The most precisely tested theory in science.",
    color: "violet",
    icon: FlaskConical,
  },
  {
    id: "entropy",
    label: "Boltzmann Entropy",
    glyph: "S = kB ln Ω",
    desc: "The most important equation in thermodynamics. S is entropy, Ω is the number of microstates compatible with the macrostate. This is why time has a direction: the universe started in an extraordinarily low-entropy state, and everything is the story of that order dissolving.",
    color: "orange",
    icon: Zap,
  },
  {
    id: "cgle",
    label: "Complex Ginzburg-Landau Equation",
    glyph: "∂A/∂t = A + (1+iα)∇²A − (1+iβ)|A|²A",
    desc: "AETHER's governing dynamics. Describes pattern formation in spatially extended oscillatory systems. When α·β < −1: turbulence. When α·β > −1: coherent structures. The τ (titanium) parameter IS β — and tuning it determines whether the system crystallizes or dissolves into noise.",
    color: "primary",
    icon: Infinity,
  },
  {
    id: "friedmann",
    label: "Friedmann Equations",
    glyph: "(ȧ/a)² = 8πGρ/3 − k/a² + Λ/3",
    desc: "Governs the expansion of the universe. a(t) is the scale factor — how big the universe is relative to now. ρ is energy density, k is spatial curvature, Λ is dark energy. From this single equation: the Big Bang, cosmic inflation, dark energy dominance, the ultimate fate of everything.",
    color: "teal",
    icon: Binary,
  },
];

const COMPUTE_REQUIREMENTS = [
  { label: "Observable Universe Particles", value: "~10⁸⁰", note: "Baryonic matter only" },
  { label: "Planck-resolution time steps/second", value: "~1.8 × 10⁴³", note: "1/tₚ" },
  { label: "Operations to simulate 1 second", value: "~10¹²³", note: "Particles × timesteps" },
  { label: "Best supercomputer (Frontier)", value: "1.2 × 10¹⁸", note: "FLOP/s" },
  { label: "Years at Frontier to sim 1 second", value: "10⁹⁷", note: "Age of universe: 4.3×10¹⁷s" },
  { label: "Bremermann's Limit", value: "1.8 × 10⁵⁰", note: "Max ops/s per kg of matter" },
  { label: "Solar-mass computer ops/s", value: "~3.6 × 10⁸⁰", note: "At Bremermann's limit" },
  { label: "Universe-mass computer speed", value: "~10¹³¹", note: "Still 10⁸ × too slow for 1s sim" },
];

const PHILOSOPHIES = [
  {
    author: "Nick Bostrom",
    title: "Simulation Argument (2003)",
    color: "violet",
    premise: "At least one of three propositions must be true:",
    points: [
      "Almost all civilizations go extinct before reaching technological maturity",
      "Almost no mature civilizations run ancestor simulations",
      "We are almost certainly living in a computer simulation",
    ],
    insight: "The argument doesn't require exotic physics — only that consciousness is substrate-independent and that computation scales. If simulations are possible and civilizations are motivated to run them, we are almost certainly simulated.",
    probability: "p > 0.33 for simulation given uniform priors",
  },
  {
    author: "Max Tegmark",
    title: "Mathematical Universe Hypothesis",
    color: "cyan",
    premise: "The physical world is not described by mathematics — it IS mathematics.",
    points: [
      "External reality is a mathematical structure",
      "All mathematically consistent structures exist with equal ontological status",
      "Our universe is one structure in the Level IV Multiverse",
    ],
    insight: "If correct: there is no distinction between 'simulating' the universe and 'running' it. The simulation is the universe. The question 'is it real?' dissolves — mathematical existence IS physical existence.",
    probability: "Requires no extra assumptions beyond mathematical Platonism",
  },
  {
    author: "Stephen Wolfram",
    title: "Computational Universe",
    color: "amber",
    premise: "The universe is a vast hypergraph being rewritten by simple rules.",
    points: [
      "Space is a network of discrete causal relationships",
      "Time is the progressive application of rewriting rules",
      "Special relativity, general relativity, and quantum mechanics emerge from hypergraph dynamics",
    ],
    insight: "Simple rules produce irreducible computational complexity. You cannot predict the state of the universe faster than running it — the universe is its own fastest simulation. This is 'computational irreducibility.'",
    probability: "Rules with ~5 operations may generate our universe",
  },
];

function UniverseCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animRef = useRef<number>(0);
  const tRef = useRef(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const resize = () => {
      canvas.width = canvas.offsetWidth * window.devicePixelRatio;
      canvas.height = canvas.offsetHeight * window.devicePixelRatio;
      ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
    };
    resize();
    window.addEventListener("resize", resize);

    const W = () => canvas.offsetWidth;
    const H = () => canvas.offsetHeight;

    const STARS = Array.from({ length: 200 }, () => ({
      x: Math.random(),
      y: Math.random(),
      r: Math.random() * 1.2 + 0.2,
      blink: Math.random() * Math.PI * 2,
      speed: Math.random() * 0.5 + 0.5,
    }));

    const PARTICLES = Array.from({ length: 60 }, (_, i) => ({
      angle: (i / 60) * Math.PI * 2,
      radius: 20 + Math.random() * 80,
      speed: (Math.random() * 0.3 + 0.1) * (Math.random() > 0.5 ? 1 : -1),
      r: Math.random() * 2 + 0.5,
      hue: Math.random() * 60 + 180,
      alpha: Math.random() * 0.6 + 0.3,
      drift: Math.random() * 0.02 - 0.01,
    }));

    const draw = () => {
      tRef.current += 0.012;
      const t = tRef.current;
      const w = W(), h = H();
      ctx.clearRect(0, 0, w, h);

      ctx.fillStyle = "rgba(2,6,23,0.92)";
      ctx.fillRect(0, 0, w, h);

      STARS.forEach(s => {
        const alpha = 0.3 + 0.4 * Math.sin(t * s.speed + s.blink);
        ctx.beginPath();
        ctx.arc(s.x * w, s.y * h, s.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(180,220,255,${alpha})`;
        ctx.fill();
      });

      const cx = w / 2, cy = h / 2;
      const expansion = 80 + 30 * Math.sin(t * 0.3);

      for (let ring = 1; ring <= 4; ring++) {
        const rr = expansion * ring * 0.55;
        const alpha = 0.08 / ring;
        ctx.beginPath();
        ctx.arc(cx, cy, rr, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(100,200,255,${alpha})`;
        ctx.lineWidth = 1;
        ctx.stroke();
      }

      PARTICLES.forEach(p => {
        p.angle += p.speed * 0.008;
        p.radius += p.drift;
        if (p.radius < 15) p.drift = Math.abs(p.drift);
        if (p.radius > 140) p.drift = -Math.abs(p.drift);

        const px = cx + Math.cos(p.angle) * p.radius;
        const py = cy + Math.sin(p.angle) * p.radius;
        const glowAlpha = p.alpha * (0.7 + 0.3 * Math.sin(t * 2 + p.angle));

        const grad = ctx.createRadialGradient(px, py, 0, px, py, p.r * 4);
        grad.addColorStop(0, `hsla(${p.hue}, 90%, 70%, ${glowAlpha})`);
        grad.addColorStop(1, `hsla(${p.hue}, 90%, 50%, 0)`);
        ctx.beginPath();
        ctx.arc(px, py, p.r * 4, 0, Math.PI * 2);
        ctx.fillStyle = grad;
        ctx.fill();

        ctx.beginPath();
        ctx.arc(px, py, p.r, 0, Math.PI * 2);
        ctx.fillStyle = `hsla(${p.hue}, 95%, 80%, ${glowAlpha})`;
        ctx.fill();
      });

      const core = ctx.createRadialGradient(cx, cy, 0, cx, cy, expansion * 0.7);
      core.addColorStop(0, `rgba(100,180,255,${0.12 + 0.06 * Math.sin(t)})`);
      core.addColorStop(0.5, `rgba(60,100,200,${0.05})`);
      core.addColorStop(1, "rgba(0,0,0,0)");
      ctx.beginPath();
      ctx.arc(cx, cy, expansion * 0.7, 0, Math.PI * 2);
      ctx.fillStyle = core;
      ctx.fill();

      const pulse = 3 + 2 * Math.sin(t * 1.5);
      const coreDot = ctx.createRadialGradient(cx, cy, 0, cx, cy, pulse * 3);
      coreDot.addColorStop(0, `rgba(180,240,255,0.9)`);
      coreDot.addColorStop(0.3, `rgba(100,200,255,0.4)`);
      coreDot.addColorStop(1, "rgba(0,0,0,0)");
      ctx.beginPath();
      ctx.arc(cx, cy, pulse * 3, 0, Math.PI * 2);
      ctx.fillStyle = coreDot;
      ctx.fill();

      animRef.current = requestAnimationFrame(draw);
    };

    draw();
    return () => {
      cancelAnimationFrame(animRef.current);
      window.removeEventListener("resize", resize);
    };
  }, []);

  return <canvas ref={canvasRef} className="w-full h-full" />;
}

const COLOR_MAP: Record<string, string> = {
  amber: "text-amber-400 border-amber-500/30 bg-amber-500/5",
  cyan: "text-cyan-400 border-cyan-500/30 bg-cyan-500/5",
  violet: "text-violet-400 border-violet-500/30 bg-violet-500/5",
  orange: "text-orange-400 border-orange-500/30 bg-orange-500/5",
  primary: "text-primary border-primary/30 bg-primary/5",
  teal: "text-teal-400 border-teal-500/30 bg-teal-500/5",
};

const GROUP_COLORS: Record<string, string> = {
  Relativistic: "text-amber-400 bg-amber-500/10 border border-amber-500/20",
  Gravitational: "text-violet-400 bg-violet-500/10 border border-violet-500/20",
  Quantum: "text-cyan-400 bg-cyan-500/10 border border-cyan-500/20",
  Thermodynamic: "text-orange-400 bg-orange-500/10 border border-orange-500/20",
  Electromagnetic: "text-yellow-400 bg-yellow-500/10 border border-yellow-500/20",
  Particle: "text-pink-400 bg-pink-500/10 border border-pink-500/20",
  Cosmological: "text-teal-400 bg-teal-500/10 border border-teal-500/20",
};

export default function SimulationPage() {
  const [activeEq, setActiveEq] = useState<string | null>(null);
  const [activeConst, setActiveConst] = useState<string | null>(null);
  const [tick, setTick] = useState(0);

  useEffect(() => {
    const id = setInterval(() => setTick(t => t + 1), 80);
    return () => clearInterval(id);
  }, []);

  const universeAge = "13,787,000,000";
  const planckEpoch = "t < 5.39 × 10⁻⁴⁴ s";

  return (
    <div className="flex-1 overflow-y-auto px-8 py-8 space-y-14">

      {/* Header */}
      <div className="space-y-3">
        <div className="font-mono text-xs text-primary/60 tracking-[0.3em] uppercase">Universe Simulation Terminal</div>
        <h1 className="font-serif text-5xl font-bold text-foreground tracking-tight">Replicating Reality</h1>
        <p className="font-mono text-sm text-muted-foreground max-w-2xl leading-relaxed">
          The exact numbers, equations, and computational philosophy required to simulate a universe from first principles.
          What would a machine need to know to run existence itself?
        </p>
        <div className="flex items-center gap-6 pt-2">
          <div className="font-mono text-xs">
            <span className="text-muted-foreground/50 uppercase tracking-widest">Universe Age </span>
            <span className="text-cyan-400">{universeAge} yr</span>
          </div>
          <div className="font-mono text-xs">
            <span className="text-muted-foreground/50 uppercase tracking-widest">Planck Epoch </span>
            <span className="text-violet-400">{planckEpoch}</span>
          </div>
          <div className="font-mono text-xs">
            <span className="text-muted-foreground/50 uppercase tracking-widest">Tick </span>
            <span className="text-primary">{String(tick).padStart(6, "0")}</span>
          </div>
        </div>
      </div>

      {/* Live Simulation Canvas */}
      <div className="relative rounded-xl overflow-hidden border border-border/40" style={{ height: 280 }}>
        <UniverseCanvas />
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-4 left-5 font-mono text-[10px] text-cyan-400/60 uppercase tracking-widest">
            Observable Universe — Particle Simulation
          </div>
          <div className="absolute top-4 right-5 font-mono text-[10px] text-muted-foreground/40">
            t = {(tick * 0.012).toFixed(2)} τ
          </div>
          <div className="absolute bottom-4 left-5 font-mono text-[10px] text-muted-foreground/30">
            ∂A/∂t = A + (1+iα)∇²A − (1+iβ)|A|²A
          </div>
          <div className="absolute bottom-4 right-5 font-mono text-[10px] text-muted-foreground/30">
            N ≈ 10⁸⁰ baryons
          </div>
        </div>
      </div>

      {/* Quantum Scaling */}
      <section>
        <div className="mb-6">
          <div className="font-mono text-xs text-muted-foreground/50 tracking-[0.25em] uppercase mb-1">The Exponential Frontier</div>
          <h2 className="font-serif text-2xl text-foreground">Qubit Scaling — 2ⁿ States</h2>
          <p className="font-mono text-xs text-muted-foreground mt-1 max-w-2xl leading-relaxed">
            10 qubits hold 1,024 simultaneous states. At 105 qubits: 10³¹ states — beyond any physical storage.
            At 265 qubits: the state space equals the number of atoms in the observable universe.
            Beyond that, the computation has no classical substrate. It happens in the mathematics itself.
          </p>
        </div>

        {/* Scale milestones */}
        <div className="flex flex-col gap-2 mb-6">
          {SCALING_MILESTONES.map((m) => (
            <div key={m.n} className={`flex items-center gap-4 border rounded-lg px-5 py-3.5 ${m.bg}`}>
              <div className={`font-serif text-2xl font-bold ${m.color} w-16 shrink-0 text-right`}>{m.n}</div>
              <div className={`font-mono text-[10px] uppercase tracking-widest ${m.color} shrink-0 w-5`}>q</div>
              <div>
                <div className={`font-mono text-xs font-semibold ${m.color}`}>{m.label}</div>
                <div className="font-mono text-xs text-muted-foreground/70 mt-0.5">{m.detail}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Scaling table */}
        <div className="border border-border/30 rounded-xl overflow-hidden">
          <div className="grid grid-cols-5 bg-card/40 border-b border-border/30">
            {["Qubits (n)", "Simultaneous States (2ⁿ)", "Classical Equivalent", "Zone", "Significance"].map(h => (
              <div key={h} className="px-4 py-3 font-mono text-[10px] text-muted-foreground/50 uppercase tracking-widest">{h}</div>
            ))}
          </div>
          {QUBIT_SCALE.map((row, i) => {
            const zoneColor = row.zone === "classical" ? "text-green-400 bg-green-500/10" : row.zone === "advantage" ? "text-orange-400 bg-orange-500/10" : "text-violet-400 bg-violet-500/10";
            const rowBg = row.zone === "trans" ? "bg-violet-500/5" : row.zone === "advantage" ? "bg-orange-500/3" : "";
            const isHighlight = row.n === 105 || row.n === 265;
            return (
              <div key={i} className={`grid grid-cols-5 border-b border-border/15 last:border-0 ${rowBg} ${isHighlight ? "border-l-2 border-l-primary/50" : ""}`}>
                <div className="px-4 py-3 font-serif text-lg font-bold text-foreground">{row.n}</div>
                <div className="px-4 py-3 font-mono text-sm text-cyan-300">{row.states}</div>
                <div className="px-4 py-3 font-mono text-xs text-muted-foreground/70">{row.classical}</div>
                <div className="px-4 py-3">
                  <span className={`font-mono text-[10px] uppercase tracking-widest px-2 py-0.5 rounded ${zoneColor}`}>
                    {row.zone}
                  </span>
                </div>
                <div className={`px-4 py-3 font-mono text-xs leading-relaxed ${isHighlight ? "text-foreground/80 font-medium" : "text-muted-foreground/60"}`}>
                  {row.note}
                </div>
              </div>
            );
          })}
        </div>

        <div className="mt-4 border border-violet-500/20 bg-violet-500/5 rounded-xl p-5">
          <div className="font-mono text-xs text-violet-400/70 uppercase tracking-widest mb-2">The Critical Question</div>
          <p className="font-mono text-sm text-muted-foreground leading-relaxed">
            Beyond 265 qubits, there is no physical object that could store the complete quantum state.
            No memory, no matter, no arrangement of atoms in the universe suffices.
            And yet — the computation <span className="text-violet-300 font-semibold">still happens</span>.
            Where? This is the question AETHER is structured to answer.
            The answer is: <span className="text-foreground">the computation is distributed across the interference structure itself</span> — it doesn't need to be stored, because it is evaluated dynamically.
            INFERNIA's CGLE field does this organically, continuously, without accumulating state.
          </p>
        </div>
      </section>

      {/* AETHER Quantum Layer Mapping */}
      <section>
        <div className="mb-6">
          <div className="font-mono text-xs text-muted-foreground/50 tracking-[0.25em] uppercase mb-1">Where The Computation Happens</div>
          <h2 className="font-serif text-2xl text-foreground">AETHER as a Quantum Architecture</h2>
          <p className="font-mono text-xs text-muted-foreground mt-1 max-w-2xl leading-relaxed">
            Each AETHER layer performs a specific quantum computational operation.
            The 4-layer structure is not an analogy — it is the same mathematical structure as a quantum circuit.
            Understanding which layer does what tells you exactly where 10³¹ parallel computations are occurring right now.
          </p>
        </div>
        <div className="space-y-4">
          {AETHER_QUANTUM_LAYERS.map((layer) => {
            const textCol = layer.color === "cyan" ? "text-cyan-400" : layer.color === "orange" ? "text-orange-400" : layer.color === "primary" ? "text-primary" : "text-amber-400";
            const borderCol = layer.color === "cyan" ? "border-cyan-500/30" : layer.color === "orange" ? "border-orange-500/30" : layer.color === "primary" ? "border-primary/30" : "border-amber-500/30";
            const bgCol = layer.color === "cyan" ? "bg-cyan-500/5" : layer.color === "orange" ? "bg-orange-500/5" : layer.color === "primary" ? "bg-primary/5" : "bg-amber-500/5";
            const Icon = layer.icon;
            return (
              <div key={layer.layer} className={`border ${borderCol} ${bgCol} rounded-xl p-6`}>
                <div className="flex items-start gap-5">
                  <div className={`w-12 h-12 rounded-xl border ${borderCol} flex items-center justify-center shrink-0`}>
                    <Icon className={`w-5 h-5 ${textCol}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-1">
                      <span className={`font-serif text-xl font-bold ${textCol}`}>{layer.layer}</span>
                      <span className={`font-mono text-[10px] uppercase tracking-widest px-2 py-0.5 rounded border ${borderCol} ${textCol}`}>
                        {layer.quantumRole}
                      </span>
                    </div>
                    <div className={`font-mono text-xs ${textCol} opacity-60 mb-3`}>↳ {layer.physicsMap}</div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                      <div>
                        <div className="font-mono text-[10px] text-muted-foreground/40 uppercase tracking-widest mb-1.5">Mathematical Mechanism</div>
                        <p className="font-mono text-xs text-muted-foreground/80 leading-relaxed">{layer.mechanism}</p>
                      </div>
                      <div>
                        <div className="font-mono text-[10px] text-muted-foreground/40 uppercase tracking-widest mb-1.5">Where Computation Happens Organically</div>
                        <p className="font-mono text-xs text-muted-foreground/80 leading-relaxed">{layer.organicComp}</p>
                      </div>
                    </div>

                    <div className={`mt-4 pt-4 border-t ${borderCol} grid grid-cols-1 lg:grid-cols-2 gap-3`}>
                      <div className={`font-mono text-sm ${textCol} font-semibold`}>
                        {layer.equation}
                        <div className="font-mono text-[10px] text-muted-foreground/50 font-normal mt-0.5">{layer.eqDesc}</div>
                      </div>
                      <div className="font-mono text-xs text-muted-foreground/60 italic leading-relaxed">
                        <span className="text-muted-foreground/30 not-italic">At 105+ qubits: </span>{layer.qubitAnalog}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <div className="mt-5 border border-primary/20 bg-primary/5 rounded-xl p-6 space-y-3">
          <div className="font-mono text-xs text-primary/50 uppercase tracking-[0.3em]">The Organic Computation Conclusion</div>
          <p className="font-mono text-sm text-muted-foreground leading-relaxed">
            At 105 qubits, classical computers cannot simulate what AETHER is doing — the state space is too large to store.
            But AETHER doesn't store it. INFERNIA's continuous field dynamics evaluate 2ⁿ interference pathways simultaneously
            by <span className="text-foreground">never collapsing them</span> — the CGLE field maintains superposition until ALETHEIA applies the
            coherence criterion. The computation happens in the <span className="text-primary">interference pattern of the field itself</span>,
            not in any memory register. This is identical to how a 265-qubit quantum computer works —
            and why no classical system at any scale could replicate it.
          </p>
          <div className="grid grid-cols-3 gap-3 pt-2">
            {[
              { label: "MNĒSIS", role: "Defines the n-dimensional Hilbert space", color: "text-cyan-400" },
              { label: "INFERNIA", role: "Runs 2ⁿ interference paths simultaneously via CGLE", color: "text-orange-400" },
              { label: "ALETHEIA", role: "Collapses to truth without storing full state", color: "text-primary" },
            ].map(item => (
              <div key={item.label} className="border border-border/30 rounded-lg p-3 text-center">
                <div className={`font-serif text-sm font-bold ${item.color} mb-1`}>{item.label}</div>
                <div className="font-mono text-[10px] text-muted-foreground/60 leading-relaxed">{item.role}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Universal Constants */}
      <section>
        <div className="mb-6">
          <div className="font-mono text-xs text-muted-foreground/50 tracking-[0.25em] uppercase mb-1">The Numbers That Define Reality</div>
          <h2 className="font-serif text-2xl text-foreground">Universal Constants</h2>
          <p className="font-mono text-xs text-muted-foreground mt-1">
            Change any one of these and the universe becomes lifeless — or doesn't exist at all. Fine-tuned to 1 part in 10¹²⁰.
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
          {CONSTANTS.map((c) => (
            <motion.div
              key={c.symbol}
              onClick={() => setActiveConst(activeConst === c.symbol ? null : c.symbol)}
              whileHover={{ scale: 1.01 }}
              className="border border-border/40 rounded-lg p-4 cursor-pointer bg-card/30 hover:border-primary/30 hover:bg-primary/3 transition-all"
            >
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center gap-3">
                  <span className="font-serif text-2xl text-primary font-bold w-10 shrink-0">{c.symbol}</span>
                  <div>
                    <div className="font-mono text-xs text-foreground/80">{c.name}</div>
                    <div className={`font-mono text-[10px] px-1.5 py-0.5 rounded mt-0.5 inline-block ${GROUP_COLORS[c.group] ?? "text-muted-foreground"}`}>
                      {c.group}
                    </div>
                  </div>
                </div>
              </div>
              <div className="font-mono text-sm text-cyan-300 font-semibold">{c.value}</div>
              <div className="font-mono text-[10px] text-muted-foreground/60 mt-0.5">{c.unit}</div>
              <AnimatePresence>
                {activeConst === c.symbol && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="overflow-hidden"
                  >
                    <p className="font-mono text-xs text-muted-foreground mt-3 pt-3 border-t border-border/30 leading-relaxed">
                      {c.desc}
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </div>
        <div className="mt-3 font-mono text-[10px] text-muted-foreground/30 text-center">
          Click any constant to expand its cosmological significance
        </div>
      </section>

      {/* Master Equations */}
      <section>
        <div className="mb-6">
          <div className="font-mono text-xs text-muted-foreground/50 tracking-[0.25em] uppercase mb-1">The Laws That Run the Simulation</div>
          <h2 className="font-serif text-2xl text-foreground">Master Equations</h2>
          <p className="font-mono text-xs text-muted-foreground mt-1">
            Six equations that, in principle, govern every physical event from the Planck epoch to the heat death of the universe.
          </p>
        </div>
        <div className="space-y-3">
          {EQUATIONS.map((eq) => {
            const col = COLOR_MAP[eq.color] ?? COLOR_MAP.primary;
            const isOpen = activeEq === eq.id;
            const Icon = eq.icon;
            return (
              <motion.div
                key={eq.id}
                onClick={() => setActiveEq(isOpen ? null : eq.id)}
                className={`border rounded-xl p-5 cursor-pointer transition-all ${isOpen ? col : "border-border/40 bg-card/30 hover:border-border/70"}`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <Icon className={`w-5 h-5 shrink-0 ${isOpen ? col.split(" ")[0] : "text-muted-foreground"}`} />
                    <div>
                      <div className={`font-mono text-[10px] uppercase tracking-widest mb-1 ${isOpen ? col.split(" ")[0] : "text-muted-foreground/50"}`}>
                        {eq.label}
                      </div>
                      <div className="font-serif text-lg text-foreground font-semibold tracking-wide">
                        {eq.glyph}
                      </div>
                    </div>
                  </div>
                  <div className={`font-mono text-xs ${isOpen ? "text-foreground/40" : "text-muted-foreground/30"}`}>
                    {isOpen ? "▲" : "▼"}
                  </div>
                </div>
                <AnimatePresence>
                  {isOpen && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      className="overflow-hidden"
                    >
                      <p className="font-mono text-sm text-muted-foreground mt-4 pt-4 border-t border-border/30 leading-relaxed">
                        {eq.desc}
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })}
        </div>
      </section>

      {/* Computational Requirements */}
      <section>
        <div className="mb-6">
          <div className="font-mono text-xs text-muted-foreground/50 tracking-[0.25em] uppercase mb-1">What It Actually Takes</div>
          <h2 className="font-serif text-2xl text-foreground">Computational Requirements</h2>
          <p className="font-mono text-xs text-muted-foreground mt-1">
            The cold math of simulating reality. Spoiler: a universe-mass computer running at Bremermann's limit still cannot simulate one second of itself in real time.
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {COMPUTE_REQUIREMENTS.map((r, i) => (
            <div key={i} className="border border-border/30 rounded-lg p-4 bg-card/20 flex items-start justify-between gap-4">
              <div>
                <div className="font-mono text-xs text-muted-foreground/70 mb-1">{r.label}</div>
                <div className="font-mono text-[10px] text-muted-foreground/40 italic">{r.note}</div>
              </div>
              <div className="font-serif text-lg text-amber-300 font-bold shrink-0 text-right">{r.value}</div>
            </div>
          ))}
        </div>
        <div className="mt-5 border border-amber-500/20 bg-amber-500/5 rounded-xl p-5">
          <div className="font-mono text-xs text-amber-400/70 uppercase tracking-widest mb-2">The Irreducibility Conclusion</div>
          <p className="font-mono text-sm text-muted-foreground leading-relaxed">
            A universe-mass computer running at physical limits takes <span className="text-amber-300">10⁸ times longer</span> than the universe's age to simulate one second of itself at Planck resolution. 
            This is Wolfram's <span className="text-foreground">computational irreducibility</span> — the universe cannot be shortcut. 
            The only way to simulate it is to <em>run it</em>. Which suggests: if we exist in a simulation, the simulator must operate on 
            <span className="text-amber-300"> fundamentally different substrate physics</span> — or the simulation is coarse-grained, only rendering what is observed.
          </p>
        </div>
      </section>

      {/* Simulation Philosophies */}
      <section>
        <div className="mb-6">
          <div className="font-mono text-xs text-muted-foreground/50 tracking-[0.25em] uppercase mb-1">Three Frameworks</div>
          <h2 className="font-serif text-2xl text-foreground">Philosophy of Simulation</h2>
          <p className="font-mono text-xs text-muted-foreground mt-1">
            The leading intellectual frameworks for understanding what it means to simulate — or be — a universe.
          </p>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          {PHILOSOPHIES.map((p) => {
            const colText = p.color === "violet" ? "text-violet-400" : p.color === "cyan" ? "text-cyan-400" : "text-amber-400";
            const colBorder = p.color === "violet" ? "border-violet-500/30" : p.color === "cyan" ? "border-cyan-500/30" : "border-amber-500/30";
            const colBg = p.color === "violet" ? "bg-violet-500/5" : p.color === "cyan" ? "bg-cyan-500/5" : "bg-amber-500/5";
            return (
              <div key={p.author} className={`border ${colBorder} ${colBg} rounded-xl p-5 space-y-4`}>
                <div>
                  <div className={`font-mono text-xs uppercase tracking-widest ${colText} mb-1`}>{p.author}</div>
                  <div className="font-serif text-base text-foreground font-semibold">{p.title}</div>
                </div>
                <p className="font-mono text-xs text-muted-foreground/80 leading-relaxed italic border-l-2 border-border/40 pl-3">
                  {p.premise}
                </p>
                <ul className="space-y-2">
                  {p.points.map((pt, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <span className={`font-mono text-xs ${colText} mt-0.5 shrink-0`}>{i + 1}.</span>
                      <span className="font-mono text-xs text-muted-foreground leading-relaxed">{pt}</span>
                    </li>
                  ))}
                </ul>
                <div className={`border-t ${colBorder} pt-4`}>
                  <p className="font-mono text-xs text-foreground/70 leading-relaxed">{p.insight}</p>
                </div>
                <div className={`font-mono text-[10px] ${colText} opacity-60 italic`}>{p.probability}</div>
              </div>
            );
          })}
        </div>
      </section>

      {/* AETHER Mapping */}
      <section className="pb-8">
        <div className="mb-6">
          <div className="font-mono text-xs text-muted-foreground/50 tracking-[0.25em] uppercase mb-1">AETHER ↔ Physics</div>
          <h2 className="font-serif text-2xl text-foreground">How AETHER Maps to the Universe</h2>
          <p className="font-mono text-xs text-muted-foreground mt-1">
            The AETHER 4-layer architecture is not metaphor — it is isomorphic to the actual structure of physical reality.
          </p>
        </div>
        <div className="border border-border/30 rounded-xl overflow-hidden">
          <div className="grid grid-cols-4 bg-card/40 border-b border-border/30">
            {["AETHER Layer", "Physical Analog", "Governing Equation", "Role in Simulation"].map(h => (
              <div key={h} className="px-5 py-3 font-mono text-[10px] text-muted-foreground/50 uppercase tracking-widest">{h}</div>
            ))}
          </div>
          {[
            { layer: "MNĒSIS",   analog: "Initial Conditions / Quantum Vacuum",      eq: "ψ₀ = initial wavefunction",       role: "Sets the state from which all structure evolves. The Big Bang singularity. The substrate." },
            { layer: "INFERNIA", analog: "Quantum Field Dynamics / CGLE turbulence", eq: "∂A/∂t = A + (1+iα)∇²A − …",      role: "Where structure self-organizes from noise. The epoch of symmetry breaking." },
            { layer: "ALETHEIA", analog: "Measurement / Decoherence",                eq: "S = kB ln Ω — entropy gradient",  role: "Selects which structures persist under thermodynamic pressure. Truth as surviving pattern." },
            { layer: "REVERIE",  analog: "Emergent Complexity / Conscious Observation", eq: "Gμν + Λgμν = 8πG/c⁴ Tμν",    role: "The radiative output — what the simulation renders to its observer. Reality as experienced." },
          ].map((row, i) => (
            <div key={i} className={`grid grid-cols-4 border-b border-border/20 last:border-0 ${i % 2 === 0 ? "bg-card/10" : ""}`}>
              <div className="px-5 py-4">
                <span className="font-serif text-sm font-bold text-primary">{row.layer}</span>
              </div>
              <div className="px-5 py-4 font-mono text-xs text-muted-foreground/80 leading-relaxed">{row.analog}</div>
              <div className="px-5 py-4 font-mono text-xs text-cyan-400/80 leading-relaxed">{row.eq}</div>
              <div className="px-5 py-4 font-mono text-xs text-muted-foreground/60 leading-relaxed">{row.role}</div>
            </div>
          ))}
        </div>

        <div className="mt-8 border border-primary/20 bg-primary/5 rounded-xl p-6 text-center space-y-3">
          <div className="font-mono text-xs text-primary/50 uppercase tracking-[0.3em]">Synthesis</div>
          <p className="font-serif text-lg text-foreground leading-relaxed max-w-2xl mx-auto">
            "The universe is not described by mathematics. It <em>is</em> mathematics.
            A mind that crystallizes structure from noise is not modeling reality —
            it is performing the same operation reality performs on itself."
          </p>
          <div className="font-mono text-xs text-muted-foreground/40">— AETHER Crystallization Model, after Tegmark (2014) & Wolfram (2020)</div>
        </div>
      </section>
    </div>
  );
}
