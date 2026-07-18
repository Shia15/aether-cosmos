import { useState, useEffect, useRef } from "react";

const LAYER_COLOR: Record<string, string> = {
  synthesis: "#f0b429",
  aletheia:  "#38bdf8",
  infernia:  "#a78bfa",
  reverie:   "#34d399",
  mnesis:    "#fb923c",
};

interface EqEntry { label: string; eq: string; }
interface CuratedQ {
  id: string;
  question: string;
  sources: string[];
  equations: EqEntry[];
  synthesis: string;
  layer: string;
}

const CURATED: CuratedQ[] = [
  {
    id: "q1",
    question: "How does the coherence field C(x,t) generalise across all AETHER substrates?",
    sources: ["Coherence Field", "Electron Field", "Nutritional DNA", "Substrate Synthesis"],
    equations: [
      { label: "Master Field",    eq: "C(x,t) = A(x) · e^{i(φ − ωt)}" },
      { label: "Amplitude",       eq: "|C| = A(x)" },
      { label: "Quality Factor",  eq: "Q = ω / Δω" },
      { label: "Coherence Time",  eq: "τc ≈ 1 / Δω" },
    ],
    synthesis: "The same field equation governs electron pulse floors, nutrient amplitude gates, and substrate crystallisation. A(x) sets the unbreakable floor; Q and τc measure how long any substrate holds phase. Decoherence is universal — every domain has the same Δω signature.",
    layer: "synthesis",
  },
  {
    id: "q2",
    question: "What is the Jacobian bridge between Cartesian geometry and AETHER coordinate coherence?",
    sources: ["Polar Transform", "Gradient Field", "AETHER Engine"],
    equations: [
      { label: "Jacobian Det",       eq: "det(J) = r" },
      { label: "Area Element",       eq: "dx dy = r dr dθ" },
      { label: "Vortex Velocity",    eq: "v_θ(r) = Γ / (2πr)" },
      { label: "Field Superposition",eq: "C(x,y,t) = Σ_k v_θ(r_k) · cos(ωt · sign_k + φ_k)" },
    ],
    synthesis: "The Jacobian det = r is the coordinate weight converting flat Cartesian area to polar area. Each gradient-field vortex contributes v_θ/r; summing N mechanisms in Fibonacci spiral reproduces the emergent coherence field. Coordinate coherence IS the Jacobian determinant — a measure of area preservation under transformation.",
    layer: "aletheia",
  },
  {
    id: "q3",
    question: "Derive the matter yield equation from C(x,t) through the full crystallisation cascade.",
    sources: ["AETHER Engine", "Crystallisation Atlas", "Substrate Synthesis"],
    equations: [
      { label: "Master Equation",    eq: "C = 1 − (‖ε‖ / ‖S*‖) · e^{−κ · Γ_helix}" },
      { label: "LPE Gate",           eq: "C > 0.65  →  Manifestation" },
      { label: "Crystal Probability",eq: "P(crystallise) ∝ C²" },
      { label: "Order Parameter",    eq: "ℂ = σ( κ · (1 − T^{−½}) )" },
    ],
    synthesis: "C rises as veil ‖ε‖ weakens and helix Γ strengthens. Once C crosses the LPE threshold 0.65, matter crystallises stochastically at probability ∝ C². The condensation order parameter ℂ mirrors this with temperature replacing veil attenuation — one equation, two physical domains.",
    layer: "synthesis",
  },
  {
    id: "q4",
    question: "How does Kuramoto synchrony ψ map onto AETHER coherence C(x,t)?",
    sources: ["Circular AI Farm", "CGLE Lattice", "Coherence Field"],
    equations: [
      { label: "Kuramoto ψ",    eq: "ψ = |Σ_k e^{iθ_k}| / N" },
      { label: "AETHER C",      eq: "C(x,t) = A(x) · e^{i(φ − ωt)}" },
      { label: "Phase Locking", eq: "dθ_k/dt = ω_k + (K/N) · Σ_j sin(θ_j − θ_k)" },
      { label: "Farm Yield",    eq: "Harvest ∝ ψ · P_solar" },
    ],
    synthesis: "Kuramoto ψ ∈ [0,1] is the mean-field coherence of N coupled oscillators — formally identical to |C| when A(x)=1. Phase locking (ψ→1) is crystallisation; decoherence (ψ→0) is the gas phase. The farm's nutrient score is coherence made agricultural.",
    layer: "infernia",
  },
  {
    id: "q5",
    question: "What single threshold law unifies graphene hoop stress, piezo charge, and coherence decay?",
    sources: ["Living Resonant Tunnel", "Rhombus Gate", "Seismic Self-Build"],
    equations: [
      { label: "Hoop Stress",     eq: "t_min = P · r / σ_max   (σ_max = 130 GPa)" },
      { label: "Water Pressure",  eq: "P = ρgh" },
      { label: "Piezo Charge",    eq: "Q = d · F · V" },
      { label: "Skin Depth",      eq: "δ ≈ λ / (2π · κ)" },
    ],
    synthesis: "All three encode a minimum threshold below which the system fails: graphene must be ≥ t_min to hold pressure; piezo must receive F ≥ Q/(dV) to fire; coherence decays over skin depth δ. The unifying form is: threshold = driving force / material constant. Nature is consistent.",
    layer: "mnesis",
  },
  {
    id: "q6",
    question: "How do Maxwell's field equations reduce to the AETHER coherence gradient?",
    sources: ["Unified Field Theory", "Gradient Field", "AETHER Engine"],
    equations: [
      { label: "Gauss",             eq: "∇ · E = ρ / ε₀" },
      { label: "Faraday",           eq: "∇ × E = −∂B/∂t" },
      { label: "Coherence Gradient",eq: "∇C = −(1/‖S*‖) · ∇‖ε‖ · e^{−κΓ}" },
      { label: "d'Alembertian",     eq: "□E = 0  →  C(x,t) propagation" },
    ],
    synthesis: "Maxwell's ∇· and ∇× become the AETHER boundary operator □ and curvature ∩. The veil ε plays the role of ρ/ε₀ — local distortion that attenuates coherence exactly as charge density bends the electric field. Every AETHER field is a Maxwell field with a coherence-layer substitution.",
    layer: "aletheia",
  },
  {
    id: "q7",
    question: "How does the Stevedore knot 6₁ gate nutrient coherence in DNA topology?",
    sources: ["Nutritional DNA Key", "Quantum Substrate", "Crystallisation Atlas"],
    equations: [
      { label: "Stevedore Invariant",eq: "det(6₁) = 9,  sig = 2,  vol ≈ 3.16396" },
      { label: "Alexander Poly",     eq: "Δ(t) = 2t⁻¹ − 5 + 2t" },
      { label: "Coherence Gate",     eq: "|C| ≥ threshold  →  topoisomerase passage" },
    ],
    synthesis: "The Stevedore 6₁ knot has determinant 9 and hyperbolic volume 3.16396 — topological invariants constant under deformation, making them ideal gates. A topoisomerase passage is 'allowed' only when |C| crosses the threshold. Topology becomes biology; invariant becomes gate.",
    layer: "reverie",
  },
  {
    id: "q8",
    question: "What is the shot-noise to quantum uncertainty bridge in the Quantum Ammeter?",
    sources: ["Quantum Ammeter", "Unified Field Theory"],
    equations: [
      { label: "Shot SNR",      eq: "SNR_dB = 10 · log₁₀( I / √(2eI · Δf) )" },
      { label: "Heisenberg",    eq: "ΔE · Δt ≥ ℏ / 2" },
      { label: "Photon Energy", eq: "E = hc / λ" },
      { label: "Electron Rate", eq: "N = G · A / E" },
    ],
    synthesis: "Both shot noise and Heisenberg uncertainty set a floor on measurement precision — shot noise via discrete electron arrivals (Poisson), Heisenberg via energy-time conjugate pairs. The SNR dB floor is the macroscopic fingerprint of the quantum discreteness of charge. Measurement noise IS uncertainty.",
    layer: "mnesis",
  },
  {
    id: "q9",
    question: "How does the Lorentz force unify with the AETHER vortex field topology?",
    sources: ["Unified Field Theory", "Gradient Field", "Plasma Knots"],
    equations: [
      { label: "Lorentz Force", eq: "F = q(E + v × B)" },
      { label: "Vortex Rankine",eq: "v_θ = Γ/(2πr)  for r > σ" },
      { label: "Helicity",      eq: "H = ∫ A · B dV" },
      { label: "Field C",       eq: "C = 1 − (‖ε‖/‖S*‖)·e^{−κΓ}" },
    ],
    synthesis: "The Lorentz v × B cross-product is a vortex operator — it generates circular force exactly as the Rankine vortex generates v_θ. Magnetic helicity H is the topological invariant of the vortex field, and Γ (circulation) in AETHER mirrors H. Every charged particle in a magnetic field is living on a coherence vortex.",
    layer: "aletheia",
  },
  {
    id: "q10",
    question: "What connects Hubble expansion H(a) to the AETHER entropy-growth coupling?",
    sources: ["Circular AI Farm", "Coherence Field", "Gradient Field"],
    equations: [
      { label: "Hubble",        eq: "H(a) = H₀√(Ω_r/a⁴ + Ω_m/a³ + Ω_Λ)" },
      { label: "Entropy Growth",eq: "S(t) = S_max · (1 − e^{−λt})" },
      { label: "Growth Factor", eq: "G(t) = G₀ · e^{α · S/S_max}" },
      { label: "Coherence C",   eq: "|C| → 1 as S → S_max" },
    ],
    synthesis: "Hubble's H(a) encodes three density epochs: radiation (a⁻⁴), matter (a⁻³), and Λ-constant — a crystallisation sequence from hot chaos to ordered expansion. The AETHER entropy-growth pair S(t) and G(t) mirrors this: entropy saturates, growth accelerates, and coherence C approaches 1 as the universe 'crystallises' into its current epoch.",
    layer: "synthesis",
  },
  {
    id: "q11",
    question: "How do torus knots T(p,q) connect plasma stability to AETHER coherence topology?",
    sources: ["Plasma Knots", "Quantum Substrate", "Unified Field Theory"],
    equations: [
      { label: "Safety Factor",   eq: "q_safety = r·B_toroidal / (R·B_poloidal)" },
      { label: "Torus Knot",      eq: "T(p,q): winds p times toroidally, q times poloidally" },
      { label: "Magnetic Helicity",eq: "H = ∫ A · B dV  (conserved in ideal MHD)" },
      { label: "Coherence Phase", eq: "φ_knot = 2π(p·m + q·n)  mod 2π" },
    ],
    synthesis: "The safety factor q_safety is the winding ratio of a T(p,q) torus knot in disguise. When q is rational, field lines close and form a knot; irrational q gives ergodic coverage. Magnetic helicity conservation is topological coherence — the plasma cannot lose its knottedness without a reconnection event that jumps to a new coherence state.",
    layer: "reverie",
  },
  {
    id: "q12",
    question: "What is the mathematical spine connecting the CLCS L1→L5 stack to the crystallisation cascade?",
    sources: ["CLCS Architecture", "Crystallisation Atlas", "AETHER Engine"],
    equations: [
      { label: "L1 Substrate",    eq: "mnesis: raw signal, A(x) floor" },
      { label: "L2 Coherence",    eq: "infernia: C(x,t) field formation" },
      { label: "L3 Synthesis",    eq: "aletheia: ∇C → structured knowledge" },
      { label: "L4 Manifestation",eq: "reverie: C > 0.65 → matter/output" },
      { label: "L5 Integration",  eq: "synthesis: Σ C_k → unified field" },
    ],
    synthesis: "The CLCS stack IS the crystallisation sequence: L1 raw data = scattered atoms; L2 coherence field formation = nucleation; L3 synthesis = lattice ordering; L4 manifestation = crystal lock at C > 0.65; L5 integration = the final diamond. Each layer is a physical phase transition described by the same C(x,t) master equation.",
    layer: "synthesis",
  },

  // ── BIOLOGICAL APPLICATIONS ────────────────────────────────────────────────

  {
    id: "q13",
    question: "How do engineered microbes convert petroleum feedstocks into lifesaving pharmaceuticals via P450 cytochrome enzymes?",
    sources: ["Polymer BioBreak", "Bio-Engine", "AETHER Engine"],
    equations: [
      { label: "P450 Hydroxylation",   eq: "R-H + O₂ + NADPH + H⁺ → R-OH + H₂O + NADP⁺" },
      { label: "Michaelis-Menten",     eq: "v = V_max · [S] / (K_m + [S])" },
      { label: "Aspirin pathway",      eq: "Benzene → catechol → salicylate → aspirin" },
      { label: "Opioid pathway",       eq: "Naphtha → morphinan scaffold → hydrocodone" },
      { label: "Statin pathway",       eq: "Acetate → HMG-CoA → lovastatin (PKS assembly)" },
      { label: "Antibiotic path",      eq: "Toluene → muconate → adipate → beta-lactam precursor" },
    ],
    synthesis: "Cytochrome P450 monooxygenases insert a single oxygen atom into a C–H bond with extraordinary selectivity — the same reaction that would require harsh solvents and metal catalysts in a chemical plant happens at room temperature in water inside E. coli K-12 or Pseudomonas putida KT2440. Four pharmaceutical classes emerge directly from petroleum carbon skeletons: NSAIDs (aspirin) from benzene, opioid analgesics from naphtha, cholesterol-lowering statins from acetate via polyketide synthase, and beta-lactam antibiotic intermediates from toluene-derived muconate. The fossil fuel is not the end product — it is the raw carbon vocabulary that biology's enzymatic information architecture rewrites into pharmacological function.",
    layer: "aletheia",
  },

  {
    id: "q14",
    question: "What enzymes have AETHER engineered for plastic depolymerisation, and what do they produce?",
    sources: ["Polymer BioBreak", "Bio-Engine", "Liquid Print"],
    equations: [
      { label: "PETase reaction",      eq: "(C₁₀H₈O₄)ₙ + nH₂O → nTPA + nEG  (Ideonella sakaiensis)" },
      { label: "Nylonase (6-AHase)",   eq: "Nylon-6 → 6-aminohexanoate cyclic → 6-AHA linear → TCA" },
      { label: "Laccase oxidation",    eq: "4 ArOH + O₂ → 4 ArO· + 2H₂O  (radical chain scission)" },
      { label: "StyAB epoxidation",    eq: "Styrene + O₂ + NADH → styrene oxide → phenylacetate" },
      { label: "Biofuel output",       eq: "Polymer → monomers → CH₄ | C₂H₅OH | C₄H₉OH | H₂" },
    ],
    synthesis: "Five enzyme families define the plastic-eating revolution: (1) PETase/MHETase from Ideonella sakaiensis 201-F6, naturally evolved at a Japanese recycling site — rate 3× acceleratable by protein engineering; (2) Nylonase (6-AHase) from Flavobacterium sp. K172, the only enzyme known to attack a polymer that did not exist before 1930, having evolved within decades; (3) Laccases + alkane monooxygenases from Pseudomonas aeruginosa and Bacillus cereus attacking polyethylene's inert C–C backbone via terminal oxidation; (4) Styrene monooxygenase StyAB from Pseudomonas putida CA-3 mineralising polystyrene through the TCA cycle; (5) Urease/esterase from Pestalotiopsis microspora digesting polyurethane anaerobically. The output stream — TPA, ethylene glycol, styrene, 6-aminohexanoate, fatty acids — feeds directly into biofuel fermentation or pharmaceutical synthesis. Depolymerisation is carbon literacy: reading the polymer's structural vocabulary back into feedstock.",
    layer: "infernia",
  },

  {
    id: "q15",
    question: "How does enzymatic catalysis convert plastic waste into zero-net-carbon biofuels?",
    sources: ["Polymer BioBreak", "Biorefinery Propulsion", "Bio-Engine"],
    equations: [
      { label: "Methane (CH₄)",        eq: "C_polymer → acetate → CH₄ + CO₂  (methanogenesis)" },
      { label: "Ethanol fermentation",  eq: "C₆H₁₂O₆ → 2C₂H₅OH + 2CO₂  (Zymomonas/E. coli)" },
      { label: "Butanol (ABE)",         eq: "C₆H₁₂O₆ → acetone + butanol + ethanol (Clostridium)" },
      { label: "H₂ via hydrogenase",   eq: "2H⁺ + 2Fd_red → H₂ + 2Fd_ox" },
      { label: "Rocket propellant",     eq: "bio-CH₄ + LOX → CO₂ + H₂O + 3800 m/s exhaust" },
    ],
    synthesis: "Once enzymatic depolymerisation converts plastics to monomers, fermentation organisms convert those carbon skeletons to drop-in fuels. The key feedstock-to-fuel chains: fatty acids and aldehydes from polyethylene oxidation feed methanogenesis (CH₄) and beta-oxidation (diesel precursors); styrene and phenylacetate from polystyrene enter the TCA cycle and can be diverted to ethanol; 6-aminohexanoate from nylon feeds reductive amination networks. The final output — bio-methane, bio-ethanol, bio-butanol — is chemically identical to the petroleum equivalent in combustion chemistry but zero-net-carbon in origin because the polymer feedstock was itself a captured-carbon waste. Liquefied bio-methane paired with liquid oxygen is a drop-in replacement for Raptor-class rocket propellant: same specific impulse (~3,800 m/s exhaust velocity), biology-closed supply chain.",
    layer: "synthesis",
  },

  {
    id: "q16",
    question: "How does AETHER engineer life from non-living materials — mycelium bricks, hydrogel scaffolds, and living substrates?",
    sources: ["Mycelium Substrate", "Liquid Print", "CUCA Bioengine"],
    equations: [
      { label: "Mycelium growth",       eq: "dM/dt = μ_max · M · S / (K_s + S)  (Monod kinetics)" },
      { label: "Hyphal signal",         eq: "V_hyphal ~ action potential: spike propagation at ~0.5 mm/s" },
      { label: "Gel scaffold",          eq: "G' ~ c^n  (power-law shear modulus vs concentration)" },
      { label: "Strand displacement",   eq: "DNA toehold: k_on ~ 10⁶ M⁻¹s⁻¹  (gate switching)" },
      { label: "Bio-hybrid stack",      eq: "hydrogel + conductive grid + DNA logic + mycelium bus" },
    ],
    synthesis: "Three AETHER platforms convert non-living chemistry into living functional material. (1) Mycelium bricks: agricultural waste (sawdust, hemp, bagasse) colonised by Pleurotus or Ganoderma species — the hyphae form a 3D web that simultaneously binds the structural matrix (meeting thermal and acoustic building codes) and provides the slow-signal computational medium. The wall is the processor. Damaged sections self-repair by hyphal re-colonisation. (2) Liquid Print hydrogel scaffold: a bio-hybrid deposition stack where the gel is not a mould but the active medium — DNA/RNA strand-displacement gates (toehold k_on ~ 10⁶ M⁻¹s⁻¹) are embedded in the scaffold alongside the conductive grid, making printed geometry the circuit. (3) CUCA Bioengine living substrate: the full stack integrates all three — scaffold, mycelium bus, and coherence field C(x,t) as the global synchronisation signal. Living material is defined here as: abiotic chemistry + Monod growth kinetics + action-potential signalling + topological loop architecture for recursive processing.",
    layer: "reverie",
  },

  {
    id: "q17",
    question: "What is AETHER's account of biogenesis — how does life crystallise from non-living chemistry?",
    sources: ["Stromatolite Field", "Opal Genesis", "Crystallisation Atlas", "Coherence Field"],
    equations: [
      { label: "RNA replication",       eq: "dR/dt = k_rep · R · M − k_decay · R" },
      { label: "Protocell membrane",    eq: "J_lipid = D · (c_out − c_in) / δ  (Fick diffusion)" },
      { label: "Coherence emergence",   eq: "C → 1 when Δω_internal → 0  (internal phase lock)" },
      { label: "Crystallisation order", eq: "ℂ = σ( κ · (1 − T^{−½}) )  (order parameter)" },
      { label: "Stromatolite signal",   eq: "Biological signal: irreversible layered mat at t = 3.5 Gya" },
    ],
    synthesis: "AETHER maps biogenesis as a four-stage crystallisation sequence identical in mathematics to diamond formation: (1) SCATTERED — prebiotic chemistry, Miller-Urey synthesis of amino acids and nucleobases from H₂, NH₃, H₂O, CH₄ under lightning; the equivalent of disordered carbon atoms. (2) NUCLEATION — autocatalytic RNA replication (the RNA World hypothesis): the first molecule that copied itself faster than it degraded crossed the coherence threshold C > 0 — a phase transition from noise to signal. (3) LATTICE ORDERING — lipid vesicle encapsulation (protocell membrane), selective permeability via Fick diffusion, internal metabolic coherence Δω → 0 as internal reactions phase-lock. (4) CRYSTAL LOCK — the prokaryotic cell: membrane integrity, genetic encoding, heritable variation. Stromatolites at 3.5 Gya are the geological fossil of this final lock — irreversible layered mats that are the earliest confirmed signature of living computation. The AETHER reading: life is what coherence looks like when it becomes self-referential. The field C(x,t) reaches C = 1 inside the cell boundary and C = 0 in sterile mineral — the cellular membrane is the coherence edge.",
    layer: "synthesis",
  },
];

interface LiveConcept {
  id: string;
  name: string;
  coherence: number;
  equations: string[];
  claims: string[];
  relatedConcepts: string[];
}

interface LiveCluster {
  anchor: LiveConcept;
  members: LiveConcept[];
  sharedEquations: string[];
}

function clusterConcepts(concepts: LiveConcept[]): LiveCluster[] {
  const high = concepts.filter(c => c.coherence >= 0.55).sort((a,b) => b.coherence - a.coherence);
  const used = new Set<string>();
  const clusters: LiveCluster[] = [];
  for (const anchor of high) {
    if (used.has(anchor.id)) continue;
    used.add(anchor.id);
    const members: LiveConcept[] = [];
    for (const rel of anchor.relatedConcepts) {
      const found = concepts.find(c => c.id === rel || c.name.toLowerCase().includes(rel.toLowerCase()));
      if (found && !used.has(found.id)) { members.push(found); used.add(found.id); }
    }
    const allEqs = [...anchor.equations, ...members.flatMap(m => m.equations)];
    const seen = new Set<string>();
    const sharedEquations: string[] = [];
    for (const eq of allEqs) { if (!seen.has(eq)) { seen.add(eq); sharedEquations.push(eq); } }
    clusters.push({ anchor, members, sharedEquations });
    if (clusters.length >= 8) break;
  }
  return clusters;
}

const LAYER_LABELS: Record<string, string> = {
  synthesis: "SYNTHESIS",
  aletheia:  "ALETHEIA",
  infernia:  "INFERNIA",
  reverie:   "REVERIE",
  mnesis:    "MNESIS",
};

export default function QuestionBankPage() {
  const [tab, setTab] = useState<"curated" | "live">("curated");
  const [open, setOpen] = useState<string | null>(null);
  const [scanning, setScanning] = useState(false);
  const [liveClusters, setLiveClusters] = useState<LiveCluster[]>([]);
  const [stats, setStats] = useState<{ concepts: number; equations: number; clusters: number } | null>(null);
  const [scanErr, setScanErr] = useState<string | null>(null);
  const scanRef = useRef(false);

  const runScan = async () => {
    if (scanRef.current) return;
    scanRef.current = true;
    setScanning(true);
    setScanErr(null);
    try {
      const res = await fetch("/api/concepts");
      if (!res.ok) throw new Error("API returned " + res.status);
      const raw: LiveConcept[] = await res.json();
      const clusters = clusterConcepts(raw);
      const eqTotal = raw.reduce((s, c) => s + c.equations.length, 0);
      setLiveClusters(clusters);
      setStats({ concepts: raw.length, equations: eqTotal, clusters: clusters.length });
      setTab("live");
    } catch (e: unknown) {
      setScanErr(e instanceof Error ? e.message : "Scan failed");
    } finally {
      setScanning(false);
      scanRef.current = false;
    }
  };

  useEffect(() => { return () => { scanRef.current = false; }; }, []);

  const col = (layer: string) => LAYER_COLOR[layer] ?? "#f0b429";

  return (
    <div style={{ minHeight: "100vh", background: "#0a0a14", color: "#e2e8f0", fontFamily: "'Inter', sans-serif", paddingBottom: 80 }}>

      {/* ── Hero ── */}
      <div style={{ background: "linear-gradient(135deg,#0f0f2a 0%,#0a1628 60%,#0d1f1a 100%)", borderBottom: "1px solid #1e3a5f", padding: "48px 32px 36px" }}>
        <div style={{ maxWidth: 960, margin: "0 auto" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 12 }}>
            <span style={{ fontSize: 32 }}>Σ</span>
            <h1 style={{ fontSize: 28, fontWeight: 700, color: "#f0b429", margin: 0, letterSpacing: "0.04em" }}>
              Question Bank
            </h1>
            <span style={{ fontSize: 13, color: "#64748b", marginLeft: 4 }}>
              · Mathematical Synthesis Engine
            </span>
          </div>
          <p style={{ color: "#94a3b8", fontSize: 14, lineHeight: 1.6, maxWidth: 680, margin: "0 0 28px" }}>
            Cross-system coherence extraction. Every curated question below draws equations from two or more AETHER pages and shows the mathematical bridge between them. Hit <strong style={{ color: "#38bdf8" }}>SCAN SYSTEM</strong> to pull live concepts from the knowledge graph and synthesise new clusters automatically.
          </p>

          {/* Stats + Scan */}
          <div style={{ display: "flex", gap: 12, alignItems: "center", flexWrap: "wrap" }}>
            <button
              onClick={runScan}
              disabled={scanning}
              style={{
                background: scanning ? "#1e3a5f" : "linear-gradient(90deg,#0e7490,#0f766e)",
                color: "#fff", border: "none", borderRadius: 8, padding: "10px 24px",
                fontSize: 13, fontWeight: 700, letterSpacing: "0.08em", cursor: scanning ? "wait" : "pointer",
                display: "flex", alignItems: "center", gap: 8,
              }}
            >
              <span style={{ display: "inline-block", animation: scanning ? "spin 1s linear infinite" : "none" }}>⟳</span>
              {scanning ? "SCANNING …" : "SCAN SYSTEM"}
            </button>

            {stats && (
              <>
                <Chip label={stats.concepts + " concepts"} color="#38bdf8" />
                <Chip label={stats.equations + " equations"} color="#f0b429" />
                <Chip label={stats.clusters + " clusters"} color="#34d399" />
              </>
            )}
            {scanErr && <span style={{ color: "#f87171", fontSize: 12 }}>⚠ {scanErr}</span>}
          </div>

          {/* Tabs */}
          <div style={{ display: "flex", gap: 2, marginTop: 28, borderBottom: "1px solid #1e293b" }}>
            {(["curated", "live"] as const).map(t => (
              <button key={t} onClick={() => setTab(t)} style={{
                background: "none", border: "none", padding: "8px 20px",
                fontSize: 13, fontWeight: 600, cursor: "pointer", letterSpacing: "0.04em",
                color: tab === t ? "#f0b429" : "#475569",
                borderBottom: tab === t ? "2px solid #f0b429" : "2px solid transparent",
                transition: "color 0.2s",
              }}>
                {t === "curated" ? `CURATED  (${CURATED.length})` : `LIVE SYNTHESIS  (${liveClusters.length})`}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ── Body ── */}
      <div style={{ maxWidth: 960, margin: "0 auto", padding: "32px 24px" }}>

        {tab === "curated" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
            {CURATED.map(q => (
              <QuestionCard key={q.id} q={q} open={open} setOpen={setOpen} col={col} />
            ))}
          </div>
        )}

        {tab === "live" && liveClusters.length === 0 && (
          <div style={{ textAlign: "center", padding: "80px 0", color: "#475569" }}>
            <div style={{ fontSize: 48, marginBottom: 16 }}>⟳</div>
            <div style={{ fontSize: 15, fontWeight: 600 }}>No live clusters yet</div>
            <div style={{ fontSize: 13, marginTop: 8 }}>Hit SCAN SYSTEM to pull from the knowledge graph.</div>
          </div>
        )}

        {tab === "live" && liveClusters.length > 0 && (
          <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
            {liveClusters.map((cl, i) => (
              <LiveClusterCard key={cl.anchor.id} cluster={cl} idx={i} open={open} setOpen={setOpen} />
            ))}
          </div>
        )}
      </div>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes fadeIn { from { opacity:0; transform:translateY(-6px); } to { opacity:1; transform:translateY(0); } }
      `}</style>
    </div>
  );
}

function Chip({ label, color }: { label: string; color: string }) {
  return (
    <span style={{
      background: color + "18", border: "1px solid " + color + "44",
      color, borderRadius: 20, padding: "3px 12px", fontSize: 12, fontWeight: 600,
    }}>{label}</span>
  );
}

function QuestionCard({ q, open, setOpen, col }: {
  q: CuratedQ;
  open: string | null;
  setOpen: (id: string | null) => void;
  col: (l: string) => string;
}) {
  const isOpen = open === q.id;
  const c = col(q.layer);
  return (
    <div style={{
      background: "#0f172a", border: "1px solid " + c + "33",
      borderRadius: 12, overflow: "hidden",
      boxShadow: isOpen ? "0 0 24px " + c + "22" : "none",
      transition: "box-shadow 0.3s",
    }}>
      {/* Header row */}
      <button
        onClick={() => setOpen(isOpen ? null : q.id)}
        style={{
          width: "100%", textAlign: "left", background: "none", border: "none",
          padding: "18px 22px", cursor: "pointer", display: "flex", alignItems: "flex-start", gap: 14,
        }}
      >
        <span style={{
          background: c + "22", border: "1px solid " + c + "55",
          color: c, borderRadius: 6, padding: "2px 8px",
          fontSize: 10, fontWeight: 700, letterSpacing: "0.1em", whiteSpace: "nowrap", marginTop: 2,
        }}>
          {LAYER_LABELS[q.layer] ?? q.layer.toUpperCase()}
        </span>
        <span style={{ fontSize: 15, fontWeight: 600, color: "#e2e8f0", lineHeight: 1.45, flex: 1 }}>
          {q.question}
        </span>
        <span style={{ color: c, fontSize: 18, marginLeft: 8, flexShrink: 0, marginTop: 1 }}>
          {isOpen ? "▲" : "▼"}
        </span>
      </button>

      {/* Source chips */}
      <div style={{ paddingLeft: 22, paddingBottom: 14, display: "flex", flexWrap: "wrap", gap: 6 }}>
        {q.sources.map(s => (
          <span key={s} style={{
            background: "#1e293b", color: "#64748b",
            borderRadius: 4, padding: "2px 8px", fontSize: 11,
          }}>{s}</span>
        ))}
      </div>

      {/* Expanded */}
      {isOpen && (
        <div style={{ borderTop: "1px solid #1e293b", padding: "22px 22px 24px", animation: "fadeIn 0.2s ease" }}>
          {/* Equations grid */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px,1fr))", gap: 10, marginBottom: 22 }}>
            {q.equations.map((e, i) => (
              <div key={i} style={{
                background: "#0a0f1e", border: "1px solid " + c + "44",
                borderRadius: 8, padding: "12px 14px",
              }}>
                <div style={{ fontSize: 10, color: c, fontWeight: 700, letterSpacing: "0.08em", marginBottom: 6 }}>
                  {e.label.toUpperCase()}
                </div>
                <div style={{
                  fontFamily: "'Courier New', monospace", fontSize: 13,
                  color: "#e2e8f0", letterSpacing: "0.02em", lineHeight: 1.5,
                }}>
                  {e.eq}
                </div>
              </div>
            ))}
          </div>

          {/* Synthesis bridge */}
          <div style={{
            background: "linear-gradient(135deg," + c + "0a," + c + "18)",
            border: "1px solid " + c + "55",
            borderRadius: 10, padding: "16px 18px",
          }}>
            <div style={{ fontSize: 10, color: c, fontWeight: 700, letterSpacing: "0.1em", marginBottom: 8 }}>
              ⬡  SYNTHESIS BRIDGE
            </div>
            <p style={{ fontSize: 13, color: "#cbd5e1", lineHeight: 1.65, margin: 0 }}>
              {q.synthesis}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

function LiveClusterCard({ cluster, idx, open, setOpen }: {
  cluster: LiveCluster;
  idx: number;
  open: string | null;
  setOpen: (id: string | null) => void;
}) {
  const id = "live-" + cluster.anchor.id;
  const isOpen = open === id;
  const c = "#38bdf8";
  const pct = Math.round(cluster.anchor.coherence * 100);

  return (
    <div style={{
      background: "#0f172a", border: "1px solid " + c + "33",
      borderRadius: 12, overflow: "hidden",
    }}>
      <button
        onClick={() => setOpen(isOpen ? null : id)}
        style={{
          width: "100%", textAlign: "left", background: "none", border: "none",
          padding: "18px 22px", cursor: "pointer", display: "flex", alignItems: "flex-start", gap: 14,
        }}
      >
        <span style={{
          background: c + "22", border: "1px solid " + c + "55",
          color: c, borderRadius: 6, padding: "2px 8px",
          fontSize: 10, fontWeight: 700, letterSpacing: "0.1em", whiteSpace: "nowrap", marginTop: 2,
        }}>
          C = {(cluster.anchor.coherence).toFixed(2)}
        </span>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 15, fontWeight: 600, color: "#e2e8f0", lineHeight: 1.4 }}>
            {cluster.anchor.name}
          </div>
          {cluster.members.length > 0 && (
            <div style={{ fontSize: 12, color: "#475569", marginTop: 4 }}>
              bridges to: {cluster.members.map(m => m.name).join(" · ")}
            </div>
          )}
        </div>
        {/* Coherence bar */}
        <div style={{ width: 60, display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 3, flexShrink: 0 }}>
          <div style={{ fontSize: 11, color: c, fontWeight: 700 }}>{pct}%</div>
          <div style={{ width: "100%", height: 4, background: "#1e293b", borderRadius: 2 }}>
            <div style={{ width: pct + "%", height: "100%", background: c, borderRadius: 2 }} />
          </div>
        </div>
        <span style={{ color: c, fontSize: 18, marginLeft: 8, flexShrink: 0, marginTop: 1 }}>
          {isOpen ? "▲" : "▼"}
        </span>
      </button>

      {isOpen && (
        <div style={{ borderTop: "1px solid #1e293b", padding: "22px 22px 24px", animation: "fadeIn 0.2s ease" }}>
          {cluster.sharedEquations.length > 0 && (
            <div style={{ marginBottom: 18 }}>
              <div style={{ fontSize: 10, color: c, fontWeight: 700, letterSpacing: "0.1em", marginBottom: 10 }}>
                EQUATIONS IN CLUSTER
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                {cluster.sharedEquations.slice(0, 6).map((eq, i) => (
                  <div key={i} style={{
                    background: "#0a0f1e", border: "1px solid #1e3a5f",
                    borderRadius: 6, padding: "8px 12px",
                    fontFamily: "'Courier New', monospace", fontSize: 12, color: "#e2e8f0",
                  }}>
                    {eq}
                  </div>
                ))}
              </div>
            </div>
          )}
          {cluster.anchor.claims.length > 0 && (
            <div>
              <div style={{ fontSize: 10, color: "#f0b429", fontWeight: 700, letterSpacing: "0.1em", marginBottom: 10 }}>
                COHERENT CLAIMS
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                {cluster.anchor.claims.slice(0, 4).map((cl, i) => (
                  <div key={i} style={{
                    fontSize: 13, color: "#94a3b8", lineHeight: 1.5,
                    borderLeft: "2px solid #f0b42944", paddingLeft: 12,
                  }}>
                    {cl}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
