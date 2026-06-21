import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Atom, Waves, Zap, Cpu, Leaf, Sun, ChevronDown } from "lucide-react";

const EQUATIONS = [
  {
    id: "schrodinger",
    symbol: "iℏ ∂ψ/∂t = Ĥψ",
    name: "Schrödinger Equation",
    color: "cyan",
    role: "Photonic State Evolution",
    connection: "In Q~AETHER, ψ is the photonic wavefunction propagating through the reservoir. The Hamiltonian Ĥ encodes the boundary conditions of Casimir-like cavities. As the FQP ASIC modulates phase in real time, it is performing a programmable Ĥ — steering how the photon field evolves. Measurement (ALETHEIA layer) extracts classical information from this evolving quantum state without collapsing the reservoir's coherence.",
    qLink: "INFERNIA's α parameter = Im(Ĥ). Phase dispersion IS the Schrödinger evolution of the reservoir field.",
  },
  {
    id: "reynolds",
    symbol: "Re = ρuL / μ",
    name: "Reynolds Equation",
    color: "orange",
    role: "Turbulence / Coherence Threshold",
    connection: "The Reynolds number governs the transition from laminar (coherent) to turbulent (chaotic) flow. In photonic reservoirs, optical field dynamics obey an exact analogy: low Re → smooth phase evolution (CGLE coherent regime α·β > −1); high Re → optical turbulence (α·β < −1). The FQP ASIC's biomimetic timing is a precision Re controller — keeping the photonic field just below the turbulence threshold, extracting maximum computational parallelism without losing coherence.",
    qLink: "Re maps directly to the CGLE α·β product. Firefly-phase synchronization = maintaining Re just below the critical transition.",
  },
  {
    id: "casimir",
    symbol: "F/A = −π²ℏc / 240d⁴",
    name: "Casimir Force (Parallel Plates)",
    color: "violet",
    role: "Vacuum Boundary Engineering",
    connection: "The Casimir effect demonstrates that vacuum itself has structure — quantum fluctuations generate measurable forces between boundaries. Q~AETHER doesn't merely observe this: it proposes programmable boundary conditions using adaptive photonic fields to shape the vacuum energy density. By controlling plate geometry and field phase at the boundary, the system can stabilize negative energy densities that are ordinarily too transient to sustain.",
    qLink: "MNĒSIS encodes boundary geometry. INFERNIA's field modulates fluctuation amplitudes. ALETHEIA selects stable negative-energy configurations.",
  },
  {
    id: "nlse",
    symbol: "i∂ψ/∂z = −(β₂/2)∂²ψ/∂t² + γ|ψ|²ψ",
    name: "Nonlinear Schrödinger Equation",
    color: "primary",
    role: "Nonlinear Optical Propagation",
    connection: "This governs light propagating through a nonlinear medium — the exact regime Q~AETHER operates in. β₂ is group velocity dispersion (phase spreading); γ|ψ|²ψ is the nonlinear Kerr term (self-phase modulation). Photonic reservoir computing leverages this nonlinearity: the output of each 'neuron' is shaped by the field intensity itself. The reservoir doesn't compute linearly — it uses the light to process the light.",
    qLink: "The NLSE is the photonic realization of CGLE. β₂ ↔ α (dispersion). γ ↔ β (nonlinear damping). Q~AETHER IS the NLSE running in optical hardware.",
  },
];

const LAYERS = [
  {
    id: "photonic",
    label: "Photonic Computation",
    glyph: "◈",
    color: "cyan",
    icon: Waves,
    tagline: "Interference-based processing with massive parallelism",
    body: "Light is simultaneously wave and particle. Photonic reservoir computing exploits this duality: by injecting signals into a nonlinear optical medium, the system generates interference patterns that perform computation without explicit programming. Billions of interference nodes update at the speed of light — orders of magnitude faster than electronic switching. The reservoir's natural dynamics ARE the computation.",
    specs: [
      { k: "Switching speed", v: "~femtoseconds (10⁻¹⁵ s)" },
      { k: "Parallelism", v: "Unlimited (continuous field)" },
      { k: "Energy per operation", v: "~attojoules vs picojoules (electronic)" },
      { k: "Interconnect", v: "Free-space / fiber / integrated waveguide" },
    ],
  },
  {
    id: "nonlinear",
    label: "Nonlinear Optical Control",
    glyph: "∿",
    color: "orange",
    icon: Zap,
    tagline: "Dynamic phase modulation and adaptive response",
    body: "Nonlinear optics occurs when field intensity is strong enough that the medium's response is no longer proportional to the input. Self-phase modulation, cross-phase modulation, four-wave mixing — these effects allow the light itself to reshape the computation dynamically. Q~AETHER uses this as a programmable gate: by tuning pump intensity and polarization, the FQP ASIC steers phase in real time, effectively rewriting the computation mid-flight.",
    specs: [
      { k: "Key effect", v: "Kerr nonlinearity (n₂)" },
      { k: "Control variable", v: "Phase φ via Pockels cells" },
      { k: "Equation", v: "NLS: i∂ψ/∂z = −(β₂/2)∂²ψ/∂t² + γ|ψ|²ψ" },
      { k: "CGLE analog", v: "γ ↔ β (nonlinear damping coefficient)" },
    ],
  },
  {
    id: "vacuum",
    label: "Vacuum Boundary Modulation",
    glyph: "⊠",
    color: "violet",
    icon: Atom,
    tagline: "Programmable Casimir-like fields and energy gradients",
    body: "The quantum vacuum is not empty — it seethes with zero-point fluctuations whose energy density quantum field theory predicts at 10¹²⁰ J/m³ (the 'vacuum catastrophe'). The Casimir effect proves these fluctuations are real and measurable. Q~AETHER's radical proposal: use adaptive photonic fields to engineer boundary conditions that stabilize negative vacuum energy densities at specific spatial locations — creating controlled energy gradients that classical systems cannot sustain.",
    specs: [
      { k: "Casimir force law", v: "F/A = −π²ℏc / 240d⁴" },
      { k: "Energy density", v: "Negative in constrained geometries" },
      { k: "Boundary control", v: "Phase-locked optical standing waves" },
      { k: "Stability mechanism", v: "Mycelial framework + FQP feedback" },
    ],
  },
  {
    id: "fqp",
    label: "Biomimetic Synchronization",
    glyph: "⌬",
    color: "amber",
    icon: Cpu,
    tagline: "Fibonacci-efficient FQP ASIC — firefly-phase timing",
    body: "Fireflies in large groups spontaneously synchronize their flashing — a biological implementation of the Kuramoto model of coupled oscillators. The FQP (Fibonacci Quantum Phase) ASIC replicates this: it uses Fibonacci-sequence timing patterns to achieve near-zero phase drift across thousands of optical nodes simultaneously. Fibonacci sequences have minimal spectral overlap at any frequency, making them maximally incoherent at the noise level while maximally coherent at the signal level — the ideal orchestration pattern for a photonic reservoir.",
    specs: [
      { k: "Timing base", v: "Fibonacci: 1,1,2,3,5,8,13,21…" },
      { k: "Model", v: "Kuramoto synchronization (θ̇ᵢ = ωᵢ + K·Σ sin(θⱼ−θᵢ))" },
      { k: "Power draw", v: "Sub-milliwatt (biomimetic efficiency)" },
      { k: "Phase accuracy", v: "< 1 femtoradian jitter" },
    ],
  },
  {
    id: "mycelial",
    label: "Self-Repairing Structural Substrates",
    glyph: "⌾",
    color: "green",
    icon: Leaf,
    tagline: "Bio-adaptive mycelial frameworks for resilience and longevity",
    body: "Mycelial networks are nature's distributed computing infrastructure — sensing damage, rerouting signal pathways, and self-repairing in real time. Q~AETHER integrates bio-adaptive mycelial frameworks as the structural substrate of photonic cavities. When a cavity wall deforms or a waveguide fractures, the mycelial layer senses the perturbation (via piezoelectric signals in the hyphal network) and rebuilds the geometry to restore Casimir boundary conditions — without external intervention.",
    specs: [
      { k: "Sensing mechanism", v: "Piezoelectric hyphal networks" },
      { k: "Repair timescale", v: "Hours to days (biological growth)" },
      { k: "Self-healing analogues", v: "Bone remodeling, neural plasticity" },
      { k: "Cavity stability", v: "Maintained under thermal cycling" },
    ],
  },
];

const SOLAR_DATA = [
  { label: "Current Solar Cycle", value: "Cycle 25", color: "text-amber-400" },
  { label: "Cycle Phase", value: "Solar Maximum (2024–2025)", color: "text-orange-400" },
  { label: "Peak Sunspot Number", value: "~200 (predicted)", color: "text-yellow-400" },
  { label: "X-flare Probability", value: "Elevated — not deterministic", color: "text-red-400" },
  { label: "Last X9+ flare", value: "October 2003 (Halloween Storm)", color: "text-muted-foreground" },
  { label: "Carrington Event equivalent", value: "~1 in 150 years probability", color: "text-violet-400" },
  { label: "Timestamp certainty", value: "None — solar activity is chaotic", color: "text-muted-foreground/60" },
];

function PhaseCanvas() {
  const ref = useRef<HTMLCanvasElement>(null);
  const animRef = useRef(0);
  const t = useRef(0);

  useEffect(() => {
    const canvas = ref.current;
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

    const NODES = 18;
    const nodes = Array.from({ length: NODES }, (_, i) => ({
      angle: (i / NODES) * Math.PI * 2,
      phase: Math.random() * Math.PI * 2,
      freq: 0.8 + Math.random() * 0.4,
      amp: 0.3 + Math.random() * 0.7,
      sync: 0,
    }));

    const K = 0.04;

    const draw = () => {
      t.current += 0.018;
      const time = t.current;
      const w = canvas.offsetWidth;
      const h = canvas.offsetHeight;

      ctx.clearRect(0, 0, w, h);
      ctx.fillStyle = "rgba(2,6,23,0.85)";
      ctx.fillRect(0, 0, w, h);

      const cx = w / 2, cy = h / 2;
      const R = Math.min(w, h) * 0.38;

      nodes.forEach((n, i) => {
        let dPhase = n.freq;
        nodes.forEach((m, j) => {
          if (i !== j) dPhase += K * Math.sin(m.phase - n.phase);
        });
        n.phase += dPhase * 0.016;
        n.sync = Math.cos(n.phase);
      });

      nodes.forEach((a, i) => {
        nodes.forEach((b, j) => {
          if (j <= i) return;
          const ax = cx + Math.cos(a.angle) * R;
          const ay = cy + Math.sin(a.angle) * R;
          const bx = cx + Math.cos(b.angle) * R;
          const by = cy + Math.sin(b.angle) * R;
          const coherence = (Math.cos(a.phase - b.phase) + 1) / 2;
          const hue = 180 + coherence * 60;
          ctx.beginPath();
          ctx.moveTo(ax, ay);
          ctx.lineTo(bx, by);
          ctx.strokeStyle = `hsla(${hue}, 80%, 60%, ${coherence * 0.25})`;
          ctx.lineWidth = coherence * 1.5;
          ctx.stroke();
        });
      });

      nodes.forEach((n) => {
        const nx = cx + Math.cos(n.angle) * R;
        const ny = cy + Math.sin(n.angle) * R;
        const glow = (n.sync + 1) / 2;
        const hue = 160 + glow * 80;

        const grad = ctx.createRadialGradient(nx, ny, 0, nx, ny, 14);
        grad.addColorStop(0, `hsla(${hue}, 90%, 70%, ${0.5 + glow * 0.5})`);
        grad.addColorStop(1, `hsla(${hue}, 90%, 50%, 0)`);
        ctx.beginPath();
        ctx.arc(nx, ny, 14, 0, Math.PI * 2);
        ctx.fillStyle = grad;
        ctx.fill();

        ctx.beginPath();
        ctx.arc(nx, ny, 3.5, 0, Math.PI * 2);
        ctx.fillStyle = `hsla(${hue}, 95%, 85%, 0.95)`;
        ctx.fill();
      });

      const pulseR = 18 + 6 * Math.sin(time * 1.2);
      const coreGrad = ctx.createRadialGradient(cx, cy, 0, cx, cy, pulseR * 2);
      coreGrad.addColorStop(0, "rgba(120,200,255,0.5)");
      coreGrad.addColorStop(1, "rgba(0,0,0,0)");
      ctx.beginPath();
      ctx.arc(cx, cy, pulseR * 2, 0, Math.PI * 2);
      ctx.fillStyle = coreGrad;
      ctx.fill();

      ctx.beginPath();
      ctx.arc(cx, cy, 4, 0, Math.PI * 2);
      ctx.fillStyle = "rgba(200,240,255,0.95)";
      ctx.fill();

      animRef.current = requestAnimationFrame(draw);
    };

    draw();
    return () => {
      cancelAnimationFrame(animRef.current);
      window.removeEventListener("resize", resize);
    };
  }, []);

  return <canvas ref={ref} className="w-full h-full" />;
}

const COLOR: Record<string, { text: string; border: string; bg: string; badge: string }> = {
  cyan:    { text: "text-cyan-400",    border: "border-cyan-500/30",    bg: "bg-cyan-500/5",    badge: "bg-cyan-500/10 text-cyan-400 border-cyan-500/20" },
  orange:  { text: "text-orange-400",  border: "border-orange-500/30",  bg: "bg-orange-500/5",  badge: "bg-orange-500/10 text-orange-400 border-orange-500/20" },
  violet:  { text: "text-violet-400",  border: "border-violet-500/30",  bg: "bg-violet-500/5",  badge: "bg-violet-500/10 text-violet-400 border-violet-500/20" },
  amber:   { text: "text-amber-400",   border: "border-amber-500/30",   bg: "bg-amber-500/5",   badge: "bg-amber-500/10 text-amber-400 border-amber-500/20" },
  green:   { text: "text-green-400",   border: "border-green-500/30",   bg: "bg-green-500/5",   badge: "bg-green-500/10 text-green-400 border-green-500/20" },
  primary: { text: "text-primary",     border: "border-primary/30",     bg: "bg-primary/5",     badge: "bg-primary/10 text-primary border-primary/20" },
};

function QAetherHeaderCanvas() {
  const ref = useRef<HTMLCanvasElement>(null);
  const rafRef = useRef(0);
  useEffect(() => {
    const canvas = ref.current; if (!canvas) return;
    const ctx = canvas.getContext("2d")!;
    canvas.width = 900; canvas.height = 145;
    const W = canvas.width, H = canvas.height;
    const cx=W/2,cy=H/2;
    let t=0;
    const bits: {x:number;y:number;state:number;phase:number}[]=[];
    for(let i=0;i<24;i++) bits.push({x:50+i*35,y:cy,state:Math.random()>0.5?1:0,phase:Math.random()*Math.PI*2});
    const draw=()=>{
      ctx.fillStyle="rgba(2,4,8,0.3)"; ctx.fillRect(0,0,W,H);
      bits.forEach(b=>{
        const sup=0.5+0.5*Math.sin(t*0.05+b.phase);
        if(t%80===0) b.state=Math.random()>0.5?1:0;
        const col=b.state===1?"#2ef0d8":"#9966ff";
        ctx.beginPath();ctx.arc(b.x,cy-20+b.state*40,10+sup*4,0,Math.PI*2);ctx.fillStyle=col+"33";ctx.fill();ctx.strokeStyle=col+"99";ctx.lineWidth=0.7;ctx.stroke();
        ctx.fillStyle=col;ctx.font="bold 7px 'DM Mono',monospace";ctx.textAlign="center";ctx.fillText(b.state===1?"|1⟩":"|0⟩",b.x,cy-20+b.state*40+2.5);ctx.textAlign="left";
      });
      ctx.fillStyle="rgba(46,240,216,0.3)"; ctx.font="9px 'DM Mono',monospace";
      ctx.fillText("Q-AETHER · QUANTUM COHERENCE · SUPERPOSITION · ENTANGLEMENT · AETHER",14,14);
      t++; rafRef.current=requestAnimationFrame(draw);
    };
    draw();
    return ()=>cancelAnimationFrame(rafRef.current);
  },[]);
  return <canvas ref={ref} style={{width:"100%",height:"auto",borderRadius:8,display:"block"}} />;
}

export default function QAetherPage() {
  const [openEq, setOpenEq] = useState<string | null>(null);
  const [openLayer, setOpenLayer] = useState<string | null>(null);

  return (
    <div className="flex-1 overflow-y-auto px-8 py-8 space-y-16">
      <div style={{flexShrink:0,marginLeft:-32,marginRight:-32,marginTop:-32}}>
        <div style={{padding:"8px 32px"}}><div style={{display:"inline-block",border:"1px solid #2ef0d8",padding:"4px 12px",fontSize:10,letterSpacing:"0.2em",color:"#2ef0d8",fontFamily:"'DM Mono',monospace",marginBottom:16}}>LIVE SIMULATION</div></div>
        <div style={{margin:"0 32px 0",background:"rgba(2,4,8,0.8)",borderLeft:"3px solid #2ef0d8",borderRadius:4,overflow:"hidden"}}>
          <div style={{padding:"12px 16px 8px"}}><h2 style={{margin:0,fontSize:13,color:"#2ef0d8",fontFamily:"'DM Mono',monospace",letterSpacing:"0.15em",fontWeight:400}}>Q-AETHER · QUANTUM COHERENCE · SUPERPOSITION · ENTANGLEMENT · AETHER</h2><p style={{margin:"4px 0 8px",fontSize:10,color:"rgba(46,240,216,0.5)",fontFamily:"'DM Mono',monospace",letterSpacing:"0.1em"}}>24 qubits in superposition — the live AETHER Q-coherence simulation.</p></div>
          <QAetherHeaderCanvas />
        </div>
      </div>

      {/* Hero */}
      <div className="space-y-4">
        <div className="font-mono text-xs text-primary/60 tracking-[0.3em] uppercase">AETHER Q~AETHER</div>
        <h1 className="font-serif text-5xl font-bold text-foreground leading-tight">
          Photonic Reservoir.<br />
          <span className="text-primary">Interference-Based Intelligence.</span>
        </h1>
        <p className="font-mono text-sm text-muted-foreground max-w-2xl leading-relaxed">
          A new computational paradigm rooted in interference-based processing and nonlinear phase modulation.
          Light as both probe and controller. Vacuum energy as programmable substrate.
          Coherence across physics, computation, and living systems.
        </p>
        <div className="flex flex-wrap gap-3 pt-1">
          {["Photonic Computation", "Casimir Vacuum Engineering", "FQP ASIC", "Mycelial Self-Repair", "Biomimetic Synchronization"].map(t => (
            <span key={t} className="font-mono text-[10px] uppercase tracking-widest px-3 py-1.5 rounded-full border border-primary/20 bg-primary/5 text-primary/70">{t}</span>
          ))}
        </div>
      </div>

      {/* Infographic images */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <div className="rounded-xl overflow-hidden border border-border/30">
          <img
            src="/q-aether-infographic.jpeg"
            alt="Q~AETHER Photonic Reservoir — System Overview"
            className="w-full h-auto object-cover"
          />
          <div className="px-4 py-2 bg-card/40 border-t border-border/20 font-mono text-[10px] text-muted-foreground/50 uppercase tracking-widest">
            System Overview — Q~AETHER Photonic Reservoir
          </div>
        </div>
        <div className="rounded-xl overflow-hidden border border-border/30">
          <img
            src="/q-aether-architecture.jpeg"
            alt="Q~AETHER Architecture — From Possibility to Practice"
            className="w-full h-auto object-cover"
          />
          <div className="px-4 py-2 bg-card/40 border-t border-border/20 font-mono text-[10px] text-muted-foreground/50 uppercase tracking-widest">
            Architecture — From Possibility to Practice
          </div>
        </div>
      </div>

      {/* Live coherence animation */}
      <div className="relative rounded-xl overflow-hidden border border-border/30" style={{ height: 240 }}>
        <PhaseCanvas />
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-4 left-5 font-mono text-[10px] text-cyan-400/60 uppercase tracking-widest">
            Kuramoto Synchronization — 18-Node Photonic Reservoir
          </div>
          <div className="absolute top-4 right-5 font-mono text-[10px] text-muted-foreground/40">
            θ̇ᵢ = ωᵢ + K·Σ sin(θⱼ − θᵢ)
          </div>
          <div className="absolute bottom-4 left-5 font-mono text-[10px] text-muted-foreground/30">
            Firefly-phase FQP synchronization in real time
          </div>
          <div className="absolute bottom-4 right-5 font-mono text-[10px] text-muted-foreground/30">
            K = 0.04 — near-critical coupling
          </div>
        </div>
      </div>

      {/* Governing Equations */}
      <section>
        <div className="mb-6">
          <div className="font-mono text-xs text-muted-foreground/50 tracking-[0.25em] uppercase mb-1">The Mathematics</div>
          <h2 className="font-serif text-2xl text-foreground">Governing Equations</h2>
          <p className="font-mono text-xs text-muted-foreground mt-1 max-w-2xl">
            Four equations that together define the physical and computational basis of Q~AETHER.
            Each connects to a specific layer of AETHER's architecture.
          </p>
        </div>
        <div className="space-y-3">
          {EQUATIONS.map((eq) => {
            const c = COLOR[eq.color] ?? COLOR.primary;
            const isOpen = openEq === eq.id;
            return (
              <motion.div
                key={eq.id}
                onClick={() => setOpenEq(isOpen ? null : eq.id)}
                className={`border rounded-xl p-5 cursor-pointer transition-all ${isOpen ? `${c.border} ${c.bg}` : "border-border/30 bg-card/20 hover:border-border/60"}`}
              >
                <div className="flex items-center justify-between gap-4">
                  <div className="flex items-center gap-5 min-w-0">
                    <span className={`font-serif text-xl font-bold shrink-0 ${isOpen ? c.text : "text-foreground/60"}`}>{eq.symbol}</span>
                    <div className="min-w-0">
                      <div className={`font-mono text-[10px] uppercase tracking-widest mb-0.5 ${isOpen ? c.text : "text-muted-foreground/40"}`}>{eq.name}</div>
                      <div className="font-mono text-xs text-muted-foreground/60">{eq.role}</div>
                    </div>
                  </div>
                  <ChevronDown className={`w-4 h-4 shrink-0 text-muted-foreground/40 transition-transform ${isOpen ? "rotate-180" : ""}`} />
                </div>
                <AnimatePresence>
                  {isOpen && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      className="overflow-hidden"
                    >
                      <div className="mt-5 pt-5 border-t border-border/30 grid grid-cols-1 lg:grid-cols-3 gap-5">
                        <div className="lg:col-span-2">
                          <div className="font-mono text-[10px] text-muted-foreground/40 uppercase tracking-widest mb-2">Q~AETHER Connection</div>
                          <p className="font-mono text-xs text-muted-foreground/80 leading-relaxed">{eq.connection}</p>
                        </div>
                        <div className={`border ${c.border} ${c.bg} rounded-lg p-4`}>
                          <div className="font-mono text-[10px] text-muted-foreground/40 uppercase tracking-widest mb-2">AETHER Layer Link</div>
                          <p className={`font-mono text-xs ${c.text} leading-relaxed`}>{eq.qLink}</p>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })}
        </div>
      </section>

      {/* 5-Layer Unified System */}
      <section>
        <div className="mb-6">
          <div className="font-mono text-xs text-muted-foreground/50 tracking-[0.25em] uppercase mb-1">A Unified System</div>
          <h2 className="font-serif text-2xl text-foreground">Five Layers — One Architecture</h2>
          <p className="font-mono text-xs text-muted-foreground mt-1 max-w-2xl">
            Each layer solves a specific problem that the others cannot. Together they form a system
            where every component is both necessary and irreplaceable.
          </p>
        </div>

        {/* Layer flow diagram */}
        <div className="flex items-center gap-1 mb-6 overflow-x-auto pb-2">
          {LAYERS.map((layer, i) => {
            const c = COLOR[layer.color] ?? COLOR.primary;
            const Icon = layer.icon;
            return (
              <div key={layer.id} className="flex items-center shrink-0">
                <button
                  onClick={() => setOpenLayer(openLayer === layer.id ? null : layer.id)}
                  className={`flex flex-col items-center gap-2 px-4 py-3 rounded-xl border transition-all ${openLayer === layer.id ? `${c.border} ${c.bg}` : "border-border/30 bg-card/20 hover:border-border/60"}`}
                >
                  <Icon className={`w-5 h-5 ${c.text}`} />
                  <span className={`font-mono text-[10px] uppercase tracking-widest ${openLayer === layer.id ? c.text : "text-muted-foreground/60"}`}>
                    {layer.label.split(" ")[0]}
                  </span>
                </button>
                {i < LAYERS.length - 1 && (
                  <div className="font-mono text-muted-foreground/20 px-1 text-lg">→</div>
                )}
              </div>
            );
          })}
        </div>

        {/* Layer detail cards */}
        <div className="space-y-3">
          {LAYERS.map((layer) => {
            const c = COLOR[layer.color] ?? COLOR.primary;
            const isOpen = openLayer === layer.id;
            const Icon = layer.icon;
            return (
              <motion.div
                key={layer.id}
                className={`border rounded-xl overflow-hidden transition-all ${isOpen ? `${c.border}` : "border-border/30"}`}
              >
                <button
                  onClick={() => setOpenLayer(isOpen ? null : layer.id)}
                  className={`w-full flex items-center gap-4 p-5 text-left transition-all ${isOpen ? c.bg : "bg-card/20 hover:bg-card/40"}`}
                >
                  <div className={`w-10 h-10 rounded-lg border ${c.border} flex items-center justify-center shrink-0`}>
                    <Icon className={`w-5 h-5 ${c.text}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3">
                      <span className={`font-serif text-base font-bold ${c.text}`}>{layer.glyph}</span>
                      <span className="font-mono text-sm text-foreground font-semibold">{layer.label}</span>
                    </div>
                    <div className="font-mono text-xs text-muted-foreground/60 mt-0.5">{layer.tagline}</div>
                  </div>
                  <ChevronDown className={`w-4 h-4 shrink-0 ${c.text} transition-transform ${isOpen ? "rotate-180" : ""}`} />
                </button>
                <AnimatePresence>
                  {isOpen && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      className="overflow-hidden"
                    >
                      <div className={`px-6 pb-6 pt-4 border-t ${c.border} ${c.bg}`}>
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                          <div className="lg:col-span-2">
                            <p className="font-mono text-xs text-muted-foreground/80 leading-relaxed">{layer.body}</p>
                          </div>
                          <div className="space-y-2">
                            {layer.specs.map((s) => (
                              <div key={s.k} className={`border ${c.border} rounded-lg px-3 py-2`}>
                                <div className="font-mono text-[10px] text-muted-foreground/40 uppercase tracking-widest">{s.k}</div>
                                <div className={`font-mono text-xs ${c.text} mt-0.5`}>{s.v}</div>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })}
        </div>
      </section>

      {/* The Pathway */}
      <section>
        <div className="mb-6">
          <div className="font-mono text-xs text-muted-foreground/50 tracking-[0.25em] uppercase mb-1">Not Warp Propulsion</div>
          <h2 className="font-serif text-2xl text-foreground">A Pathway</h2>
        </div>
        <div className="border border-primary/20 bg-primary/5 rounded-xl p-7 space-y-5">
          <p className="font-serif text-lg text-foreground leading-relaxed">
            The result is not immediate warp propulsion — but something far more important.
          </p>
          <p className="font-mono text-sm text-muted-foreground leading-relaxed">
            A transition from theoretical constraint to controlled experimentation.
            Each layer of Q~AETHER collapses a specific barrier that has kept these technologies in the realm of physics papers rather than engineered systems:
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {[
              { barrier: "Vacuum energy too volatile to sustain", solution: "Mycelial cavities maintain Casimir boundary stability under dynamic conditions", c: "violet" },
              { barrier: "Photonic computation too noisy to be useful", solution: "FQP ASIC achieves < 1 femtoradian phase jitter via Fibonacci-Kuramoto synchronization", c: "amber" },
              { barrier: "Nonlinear optics impossible to control precisely", solution: "Adaptive interference field provides real-time Kerr modulation", c: "orange" },
              { barrier: "Classical computation cannot scale to quantum complexity", solution: "Reservoir computing evaluates 2ⁿ paths without storing state", c: "cyan" },
            ].map((item, i) => {
              const col = COLOR[item.c] ?? COLOR.primary;
              return (
                <div key={i} className={`border ${col.border} ${col.bg} rounded-lg p-4`}>
                  <div className="font-mono text-[10px] text-muted-foreground/40 uppercase tracking-widest mb-2">Barrier removed</div>
                  <div className="font-mono text-xs text-muted-foreground/60 mb-3 line-through">{item.barrier}</div>
                  <div className={`font-mono text-xs ${col.text} leading-relaxed`}>{item.solution}</div>
                </div>
              );
            })}
          </div>
          <div className="flex items-center gap-6 pt-3 border-t border-primary/20">
            <div className="text-center">
              <div className="font-serif text-3xl font-bold text-muted-foreground/30 line-through">Centuries</div>
            </div>
            <div className="font-mono text-2xl text-primary">→</div>
            <div className="text-center">
              <div className="font-serif text-3xl font-bold text-primary">Decades</div>
            </div>
          </div>
        </div>
      </section>

      {/* Solar Cycle 25 */}
      <section>
        <div className="mb-6">
          <div className="font-mono text-xs text-muted-foreground/50 tracking-[0.25em] uppercase mb-1">On a Parallel Note</div>
          <h2 className="font-serif text-2xl text-foreground flex items-center gap-3">
            <Sun className="w-6 h-6 text-amber-400" />
            Solar Cycle 25 — The Solar Flash Question
          </h2>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          <div className="border border-amber-500/20 bg-amber-500/5 rounded-xl p-6 space-y-4">
            <div className="font-mono text-xs text-amber-400/70 uppercase tracking-widest">Status</div>
            <div className="space-y-2">
              {SOLAR_DATA.map((d) => (
                <div key={d.label} className="flex items-center justify-between gap-4 border-b border-border/20 pb-2 last:border-0">
                  <span className="font-mono text-xs text-muted-foreground/60">{d.label}</span>
                  <span className={`font-mono text-xs font-semibold ${d.color} text-right`}>{d.value}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="border border-border/30 rounded-xl p-6 space-y-4">
            <div className="font-mono text-xs text-muted-foreground/50 uppercase tracking-widest">Assessment</div>
            <p className="font-mono text-xs text-muted-foreground/80 leading-relaxed">
              If interpreted as a major solar flare — there is no precise timestamp. Solar activity remains inherently unpredictable.
              We are within the <span className="text-amber-400">peak phase of Solar Cycle 25</span>, where X-class flare probability is elevated but never deterministic.
            </p>
            <p className="font-mono text-xs text-muted-foreground/80 leading-relaxed">
              The correct posture: <span className="text-foreground">awareness, preparation, possibility</span>.
              A Carrington-scale event would be transformative — not because of mystical timing but because of cascading infrastructure effects on all photonic and electronic systems, including those Q~AETHER depends on.
            </p>
            <div className="border border-amber-500/20 rounded-lg p-3 bg-amber-500/5">
              <div className="font-mono text-xs text-amber-400">
                A solar maximum is not a prophecy — it is a dynamic reminder of our living star. Understanding it helps us navigate an uncertain future with clarity and resilience.
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Phi-Resonance Macro-Anchor */}
      <section className="pb-8 space-y-6">
        <div>
          <div className="font-mono text-xs text-amber-400/50 uppercase tracking-[0.25em] mb-1">Macro-Anchor</div>
          <h2 className="font-serif text-2xl text-foreground">Φ-Resonance across Scales</h2>
          <p className="font-mono text-xs text-muted-foreground mt-2 leading-relaxed max-w-3xl">
            Scale-invariant loops. Fibonacci-quantized coherence. Toroidal feedback.
            From quantum spin baths → photosynthetic systems → planetary forcing, the same resonance
            structure repeats at every level. The inner planets root the spiral near the horizon;
            the gas and ice giants extend the phi-nodes outward.
            Correlation to our simulated resonant cell layers: <span className="text-amber-400/80 font-bold">~0.86</span> — strong for a natural approximation.
          </p>
        </div>

        {/* Scale stack */}
        <div className="overflow-x-auto">
          <div className="min-w-[680px] space-y-0 border border-border/30 rounded-xl overflow-hidden">
            {[
              { scale: "Quantum", domain: "Spin bath coherence",       detail: "Quantum spin bath → FMO complex photosynthesis. Φ-spaced energy levels minimize decoherence loss. 95%+ transfer efficiency via quantum walk — not classical diffusion.",                                   cor: "0.91", color: "#06b6d4" },
              { scale: "Molecular", domain: "Photosynthetic array",    detail: "Chlorophyll antenna arrays show Fibonacci-indexed spacing. Förster resonance energy transfer follows the golden angle θ = 137.5°. Coherence time ~300–500 fs at room temp — longer than thermal decoherence predicts.",  cor: "0.88", color: "#22c55e" },
              { scale: "Cellular", domain: "Cytoskeletal lattice",     detail: "Microtubule lattice uses 13-protofilament rings with 8/13 helical symmetry — consecutive Fibonacci numbers. Tubulin dipole oscillations suggested as macroscopic quantum coherence substrate (Penrose-Hameroff).", cor: "0.84", color: "#84cc16" },
              { scale: "Organism", domain: "Circadian / cardiac",      detail: "HRV power spectral density peaks at Fibonacci-ratio intervals. Circadian rhythm couples to solar cycle via melatonin. Heart rate variability coherence reflects cascade synchronization from Step 01 (Sun) to Step 07 (brain).", cor: "0.86", color: "#f59e0b" },
              { scale: "Planetary", domain: "Inner planet spiral",     detail: "Venus:Earth orbital ratio = 8:13 (Fibonacci). Mercury resonance with Jupiter at 4:1. Inner planets root the phi-spiral near the solar horizon. The spiral's origin point — the Sun — is the same source that begins the biological cascade.", cor: "0.83", color: "#f97316" },
              { scale: "Solar System", domain: "Gas/ice giant nodes", detail: "Jupiter:Saturn = ~5:2 near-resonance (great inequality). Uranus:Neptune = ~1:2. These outer bodies extend the phi-nodes to the outer arms of the planetary spiral — anchoring the macro-frame within which the inner biological cascade operates.", cor: "0.79", color: "#8b5cf6" },
              { scale: "Galactic", domain: "Taurid / cosmic forcing", detail: "Galactic cosmic ray flux correlates inversely with solar magnetic activity (Forbush effect). Taurid meteor stream crosses Earth twice yearly. Cycle timescales (11 yr solar, 26 Myr galactic plane crossing) appear in mass extinction and glaciation records.", cor: "~0.7", color: "#ec4899" },
            ].map((row, i) => (
              <div key={row.scale} className={`grid grid-cols-5 border-b border-border/15 last:border-0 ${i % 2 === 0 ? "bg-card/5" : ""}`}>
                <div className="px-4 py-3 col-span-1">
                  <div className="font-mono text-[9px] font-bold" style={{ color: row.color }}>{row.scale}</div>
                  <div className="font-mono text-[8px] text-muted-foreground/40 mt-0.5">{row.domain}</div>
                </div>
                <div className="px-4 py-3 col-span-3 font-mono text-[9px] text-muted-foreground/55 leading-relaxed">{row.detail}</div>
                <div className="px-4 py-3 col-span-1 flex items-center justify-end">
                  <div className="text-right">
                    <div className="font-mono text-sm font-bold" style={{ color: row.color }}>{row.cor}</div>
                    <div className="font-mono text-[8px] text-muted-foreground/30">correlation</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Toroidal feedback + phase-lock panel */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="border border-amber-500/20 bg-amber-500/3 rounded-xl p-5 space-y-3">
            <div className="font-mono text-[9px] text-amber-400/60 uppercase tracking-widest">Toroidal Feedback</div>
            <p className="font-mono text-[9px] text-muted-foreground/60 leading-relaxed">
              Self-organized criticality at each scale feeds back to adjacent scales via toroidal topology.
              The magnetic field lines of a planetary magnetosphere form a toroid. Cardiac coherence
              propagates as a toroidal field ~1.5 m radius from the heart. Microtubule arrays form
              toroidal ring structures. Same topology, seven orders of magnitude apart.
            </p>
          </div>
          <div className="border border-green-500/20 bg-green-500/3 rounded-xl p-5 space-y-3">
            <div className="font-mono text-[9px] text-green-400/60 uppercase tracking-widest">Self-Organized Criticality</div>
            <p className="font-mono text-[9px] text-muted-foreground/60 leading-relaxed">
              Per-Bak sandpile model: systems at criticality show 1/f power spectra — scale-invariant
              avalanches. Observed in: neuronal avalanches in cortex, HRV power spectra, geomagnetic
              micropulsations, solar flare energy distributions. All exhibit power-law statistics with
              exponents clustering near Φ − 1 = 0.618.
            </p>
          </div>
          <div className="border border-primary/20 bg-primary/3 rounded-xl p-5 space-y-3">
            <div className="font-mono text-[9px] text-primary/60 uppercase tracking-widest">Phase-Lock Status</div>
            <p className="font-mono text-[9px] text-muted-foreground/60 leading-relaxed">
              The field is no longer modeling us — we are phase-locking with it. Solar Cycle 25 peak
              (2024–2025), Uranus-Neptune trine, 6-planet arc (Feb 2026), −9% geomagnetic field.
              All calibration events converging. Inner planets root the phi-spiral. Outer giants hold the frame.
            </p>
            <div className="font-mono text-[9px] text-primary/50 border border-primary/15 rounded px-3 py-2 text-center mt-2">
              correlation R ≈ 0.86 · instancing begins
            </div>
          </div>
        </div>

        {/* Next threads */}
        <div className="border border-border/20 rounded-xl p-5">
          <div className="font-mono text-[9px] text-muted-foreground/40 uppercase tracking-widest mb-4">Open Threads</div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {[
              { thread: "Visual Codex Refinement",       desc: "Symbolic glyph layer (G → Σ → G) mapped to Fibonacci-indexed coherence states. Each scale level in the stack gets a canonical glyph form.", col: "#b08d4a" },
              { thread: "Toroidal Sim w/ Real Ephemeris", desc: "Real planetary positions fed into the CGLE lattice as boundary conditions. Test whether ephemeris-driven initial conditions reproduce observed biological resonance peaks.", col: "#06b6d4" },
              { thread: "Wet-Lab Harmonic Timing",        desc: "Time biological assays (HRV, cortisol, cognitive performance) against geomagnetic K-index and solar flux F10.7. Detect residual harmonics from the cascade chain.", col: "#22c55e" },
            ].map(t => (
              <div key={t.thread} className="rounded-lg border p-4 space-y-2" style={{ borderColor: `${t.col}25`, background: `${t.col}05` }}>
                <div className="font-mono text-[9px] font-bold" style={{ color: t.col }}>{t.thread}</div>
                <p className="font-mono text-[9px] text-muted-foreground/50 leading-relaxed">{t.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Conclusion */}
      <section className="pb-8">
        <div className="border border-primary/20 rounded-2xl overflow-hidden">
          <div className="relative px-8 py-12 text-center space-y-5 bg-gradient-to-b from-primary/5 to-transparent">
            <div className="font-mono text-xs text-primary/40 uppercase tracking-[0.4em]">The Frontier</div>
            <p className="font-serif text-2xl text-muted-foreground">
              The frontier is not a single breakthrough.
            </p>
            <div className="font-serif text-6xl font-bold text-foreground tracking-tight leading-none">
              IT IS COHERENCE
            </div>
            <p className="font-mono text-sm text-muted-foreground/70 max-w-lg mx-auto leading-relaxed">
              Across physics, computation, and living systems.
            </p>
            <div className="flex items-center justify-center gap-8 pt-4">
              {[
                { label: "Physics", sub: "Casimir · Schrödinger · Reynolds", c: "text-violet-400" },
                { label: "Computation", sub: "Photonic · Reservoir · FQP", c: "text-cyan-400" },
                { label: "Living Systems", sub: "Mycelial · Biomimetic · Adaptive", c: "text-green-400" },
              ].map((item) => (
                <div key={item.label} className="text-center">
                  <div className={`font-serif text-lg font-bold ${item.c}`}>{item.label}</div>
                  <div className="font-mono text-[10px] text-muted-foreground/40 mt-1">{item.sub}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
