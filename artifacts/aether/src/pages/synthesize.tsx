import { useState, useMemo } from "react";
import { Link } from "wouter";

const BG    = "#020408";
const TEAL  = "#0d7377";
const AQUA  = "#14bdac";
const GOLD  = "#c9a84c";
const CORAL = "#e05c4b";
const WEB   = "#2ecc9a";
const TOUCH = "#e8a838";
const VIOLET= "#9b59b6";
const BLUE  = "#1a9fd4";
const ROSE  = "#e05c9a";
const DIM   = "#4a6a78";
const TEXT  = "#d8e8ec";
const mono  = "'Space Mono', monospace";
const serif = "'Cinzel', serif";
const body  = "'Crimson Pro', Georgia, serif";

/* ── Page registry ─────────────────────────────────────────────────────────── */
interface PageEntry {
  href: string;
  title: string;
  short: string;
  col: string;
  tags: string[];
  concepts: string[];
  equations: string[];
  synthesis: string;
}

const PAGES: PageEntry[] = [
  {
    href: "/dark-sun",
    title: "Dark Side of the Sun",
    short: "Dark Sun",
    col: CORAL,
    tags: ["solar", "quantum", "biology", "entropy"],
    concepts: ["Solar differential rotation", "Sunspot cycle 11yr", "Asteroid 24 Themis water", "Photosynthetic quantum coherence", "DNA piano epigenetics", "ATP synthase nano-motor", "Ozone-cortisol pipeline"],
    equations: ["B_sunspot ≈ 0.3 T", "η_photosynthesis ≈ 95%", "f_ATP = 100–200 Hz"],
    synthesis: "The Sun is not a static emitter — it is a dynamic, differentially-rotating plasma body whose coherence cycles (sunspot cycles) drive coherence/decoherence rhythms in Earth's biosphere. Solar coherence maps directly to biological quantum coherence (photosynthesis, DNA epigenetics) via the ozone-UV-cortisol pipeline.",
  },
  {
    href: "/phi-cellular",
    title: "φ-Cellular Architecture",
    short: "φ-Cellular",
    col: GOLD,
    tags: ["topology", "plasma", "quantum", "CUCA", "coherence"],
    concepts: ["Golden ratio φ = 1.618", "Phonon bandgap in TPS", "PICA re-entry plasma 1600°C", "Gibson-Ashby scaling", "C-13 spin bath decoherence", "Gyroid P3 Ia3̄d", "Cephalopod edge law CUCA §32"],
    equations: ["φ² = φ + 1", "κ_φ → 0.06 W/m·K", "T₂* 10μs → 1–5ms"],
    synthesis: "φ-proportioned periodic arrays create bandgaps at the dominant frequency of any chaos-generating process — whether 1,600°C plasma, 75klb structural load, or C-13 quantum spin bath decoherence. The golden ratio is not aesthetic — it is the fixed point of renormalization that is scale-invariant by construction.",
  },
  {
    href: "/webbed-leg",
    title: "Webbed Leg Method",
    short: "Webbed Leg",
    col: WEB,
    tags: ["cognition", "phase transition", "perception", "GUT"],
    concepts: ["Cognitive phase membrane", "Landau-Ginzburg V(α)", "Phase A analytical / Phase B creative", "Touch the Ball coherence lock", "Full Perception Universe 7 layers", "OKLab Riemannian manifold", "Impossible colors boundary", "Japanese cultural color space"],
    equations: ["|⟨Ψ|Φ⟩| ≥ ε_lock", "F[Ψ] = ∫[r|Ψ|² + u|Ψ|⁴]dx", "V(α) = V₀[1-cos(πα)]"],
    synthesis: "The mind transitions between computational phases not by switching but by propagating through a coupling membrane — the Webbed Leg — analogous to plasma propagating through a torus knot topology. Cognitive coherence lock (Touch the Ball) is the same condition as magnetic helicity conservation: the topology protects the state.",
  },
  {
    href: "/cognitive-bands",
    title: "Cognitive Decoherence",
    short: "8 Bands",
    col: AQUA,
    tags: ["cognition", "quantum", "solar", "identity"],
    concepts: ["8 mental bands standing waves", "Attention as measurement / collapse", "8 → 16 bifurcation", "64 interaction matrix", "Quasi-affine oscillation", "Sun as antigen perturbation", "Sun→Identity unified flow", "Trophy exchange structure transfer"],
    equations: ["|Ψ_mind⟩ = Σᵢ αᵢ|bandᵢ⟩", "dρ/dt = -i[H,ρ] - Γρ", "x(t+T) = Ax(t) + b + ε(t)"],
    synthesis: "Cognitive decoherence is the same process as quantum decoherence: attention (measurement) collapses the interference pattern of 8 mental bands. The Sun is the universal perturbation source driving this system at every scale — from atmospheric cloud formation to memory consolidation to the quasi-affine identity oscillator.",
  },
  {
    href: "/plasma-knots",
    title: "Knots Around Plasma",
    short: "Plasma Knots",
    col: BLUE,
    tags: ["topology", "plasma", "coherence", "helicity"],
    concepts: ["Torus knot T(p,q)", "Safety factor q = p/q_pol", "Magnetic helicity H = ∫A·B dV", "Taylor relaxation minimum energy", "Writhe + Twist = Linking number", "Magnetic reconnection X-point", "Sweet-Parker reconnection"],
    equations: ["Lk = Tw + Wr", "H = ∫A·B dV = const", "q(r) = r·B_T / R·B_P"],
    synthesis: "The magnetic field in plasma does not choose its knot arbitrarily — it finds the T(p,q) torus knot shape that minimises energy subject to the constraint that helicity is conserved. This Taylor relaxation principle is the universal principle behind all coherent structure: the system finds the most efficient topological state consistent with its conserved invariants.",
  },
  {
    href: "/quantum-gravity",
    title: "Quantum Gravity & Relativity",
    short: "QG + AETHER",
    col: VIOLET,
    tags: ["physics", "spacetime", "coherence", "strings"],
    concepts: ["GR: Gμν = 8πG Tμν smooth manifold", "QM: iħ∂|Ψ⟩/∂t = Ĥ|Ψ⟩ discrete", "Non-renormalizable incompatibility", "LQG spin networks area quantisation", "Superstrings D=10 vibrational modes", "AdS/CFT holographic duality", "AETHER C(x,t) quaternion field", "Planck scale ℓ_P as membrane"],
    equations: ["Â = 8πγℓ²_P Σ√(j(j+1))", "S_BH = A/4ℓ²_P", "C(x,t) ∈ ℍ: GR↔QM limits"],
    synthesis: "GR and QM are incompatible because each assumes the other's domain is fixed. AETHER resolves this by treating C(x,t) as the common substrate: GR emerges at low frequency (smooth, classical coherence) and QM emerges at high frequency (fluctuating, discrete coherence). The Planck scale is the membrane — C(x,t) is the webbed leg.",
  },
  {
    href: "/biomagnetism",
    title: "Biomagnetism & Non-Physical",
    short: "Biomagnetism",
    col: TOUCH,
    tags: ["biology", "quantum", "coherence", "morphic"],
    concepts: ["Heart toroidal field 50,000 fT", "Brain MEG 100–500 fT", "Magnetite Fe₃O₄ 5M crystals/brain", "Radical pair cryptochrome compass", "HRV cardiac coherence 0.1Hz", "Morphic resonance topological attractor", "Demagnetization EMF cortisol", "5-scale biofield hierarchy"],
    equations: ["B_heart ~ 50,000 fT", "τ_collapse = ħ/E_grav", "S_BH = A/4ℓ²_P (Bekenstein)"],
    synthesis: "The human body is a 5-scale coherence system from magnetite quantum oscillators to morphic C-field attractors. Heart cardiac coherence (0.1Hz toroidal field) is the body's primary coherence clock — it phase-locks with environmental magnetic fields, other hearts, and geomagnetic fluctuations driven by solar activity. Demagnetization = biofield decoherence.",
  },
];

/* ── Cross-page connection map ─────────────────────────────────────────────── */
interface Connection {
  from: string; to: string;
  concept: string;
  strength: "strong" | "medium" | "emergent";
  col: string;
}

const CONNECTIONS: Connection[] = [
  { from: "/dark-sun", to: "/cognitive-bands", concept: "Sun as antigen → cognitive decoherence driver", strength: "strong", col: CORAL },
  { from: "/dark-sun", to: "/biomagnetism", concept: "Solar cycles ↔ geomagnetic field ↔ magnetite crystal sensitivity", strength: "strong", col: CORAL },
  { from: "/phi-cellular", to: "/plasma-knots", concept: "φ-bandgap ↔ topological helicity conservation — both prevent decoherence via topology", strength: "strong", col: GOLD },
  { from: "/phi-cellular", to: "/quantum-gravity", concept: "φ renormalization fixed point ↔ Planck scale fixed point in LQG", strength: "medium", col: GOLD },
  { from: "/webbed-leg", to: "/cognitive-bands", concept: "Phase membrane (Webbed Leg) ↔ cognitive decoherence model — same Landau-Ginzburg field", strength: "strong", col: WEB },
  { from: "/webbed-leg", to: "/plasma-knots", concept: "Phase transition via membrane ↔ Taylor relaxation to minimum-energy knot state", strength: "medium", col: WEB },
  { from: "/webbed-leg", to: "/quantum-gravity", concept: "Planck scale membrane (GR↔QM) = Webbed Leg at fundamental physics level", strength: "emergent", col: WEB },
  { from: "/cognitive-bands", to: "/biomagnetism", concept: "8-band MEG field + cardiac toroid = direct overlap — biomagnetism IS the cognitive bands' physical substrate", strength: "strong", col: AQUA },
  { from: "/cognitive-bands", to: "/quantum-gravity", concept: "Quantum measurement = cognitive measurement = same decoherence equation dρ/dt = -i[H,ρ] - Γρ", strength: "strong", col: AQUA },
  { from: "/plasma-knots", to: "/quantum-gravity", concept: "Magnetic helicity conservation ↔ holographic information conservation — both are topological invariants", strength: "medium", col: BLUE },
  { from: "/plasma-knots", to: "/biomagnetism", concept: "Heart toroidal field topology = T(2,1) torus knot — heart IS a plasma-like magnetic system", strength: "emergent", col: BLUE },
  { from: "/quantum-gravity", to: "/biomagnetism", concept: "AETHER C(x,t) = common field for QG and biofield coherence — same quaternion structure", strength: "strong", col: VIOLET },
  { from: "/biomagnetism", to: "/dark-sun", concept: "Magnetite solar sensitivity (25μT field → EEG response) closes the Sun→body loop", strength: "medium", col: TOUCH },
  { from: "/phi-cellular", to: "/webbed-leg", concept: "φ-OKLab color space geometry ↔ φ-cellular perceptual manifold — perception stack shares φ basis", strength: "medium", col: GOLD },
];

/* ── Synthesis engine ──────────────────────────────────────────────────────── */
function synthesise(selected: string[]): {
  title: string;
  unifying: string;
  keyConnections: Connection[];
  sharedConcepts: string[];
  emergentInsight: string;
  equation: string;
} {
  if (selected.length === 0) return {
    title: "", unifying: "", keyConnections: [], sharedConcepts: [], emergentInsight: "", equation: "",
  };

  const pages = PAGES.filter(p => selected.includes(p.href));
  const conns = CONNECTIONS.filter(c => selected.includes(c.from) && selected.includes(c.to));

  // Find shared tags
  const tagCounts: Record<string, number> = {};
  for (const p of pages) for (const tag of p.tags) tagCounts[tag] = (tagCounts[tag] || 0) + 1;
  const sharedTags = Object.entries(tagCounts).filter(([, n]) => n >= Math.max(2, selected.length * 0.5)).map(([t]) => t);

  // All concepts from selected pages
  const allConcepts = pages.flatMap(p => p.concepts);

  // Pattern matching for emergent insights
  const pageSet = new Set(selected);
  let title = `${pages.map(p => p.short).join(" × ")} Synthesis`;
  let unifying = "";
  let emergentInsight = "";
  let equation = "";

  const has = (href: string) => pageSet.has(href);

  // Specific multi-page insights
  if (has("/quantum-gravity") && has("/webbed-leg") && has("/plasma-knots")) {
    emergentInsight = "The Planck scale (QG) is the membrane (Webbed Leg) that the magnetic field crosses during reconnection (Plasma Knots). All three describe the same topology-change event at different scales: spacetime phase transition, cognitive phase transition, and magnetic reconnection are formally identical — they all involve crossing a membrane separating two topological phases, releasing stored energy as the system falls to a lower-knot-complexity state.";
    equation = "Reconnection ≡ Cognitive Decoherence ≡ GR→QM Transition: ΔLk = ΔC(x,t) = ΔΨ_collapse";
  } else if (has("/dark-sun") && has("/cognitive-bands") && has("/biomagnetism")) {
    emergentInsight = "The Sun→Atmosphere→Rain→Attention→Memory→Identity cascade (Cognitive Bands) physically passes through the body's magnetic field system (Biomagnetism) which is driven by the same solar perturbation cycles (Dark Sun). The 11-year sunspot cycle modulates the geomagnetic field, which modulates magnetite crystal sensitivity, which modulates 8-band neural coherence, which determines the quasi-affine identity oscillator's attractor depth. Solar coherence IS cognitive coherence.";
    equation = "C_solar(t) → C_geomagnetic(t) → C_magnetite(t) → C_8bands(t) → C_identity(t)";
  } else if (has("/phi-cellular") && has("/plasma-knots")) {
    emergentInsight = "φ-proportioned cellular arrays and torus-knot plasma confinement are both minimum-energy topological solutions. The φ-lattice (golden angle 137.5°) creates a dense reciprocal lattice with zeros at all φⁿ harmonics simultaneously — maximising bandgap coverage. The T(p,q) torus knot minimises magnetic energy subject to helicity conservation. Both are the same mathematical principle: find the geometry whose resonant structure most efficiently blocks the dominant perturbation frequencies.";
    equation = "φ-lattice Bragg condition = Taylor relaxation: argmin{∫B²dV | H = const} = T(q_opt)";
  } else if (has("/cognitive-bands") && has("/quantum-gravity")) {
    emergentInsight = "The decoherence equation for 8 mental bands (dρ/dt = -i[H,ρ] - Γρ) is formally identical to the Lindblad master equation for quantum decoherence — and to the equation governing the AETHER C(x,t) field's approach to the GR or QM limit. Cognitive decoherence (interruption rate Γ collapsing the 8-band interference pattern) and quantum measurement (environment collapsing the wavefunction) and GR-QM incompatibility (smoothness vs discreteness at ℓ_P) are all the same decoherence at different scales.";
    equation = "Cognitive: dρ/dt = -i[H,ρ] - Γρ = Quantum: Lindblad = AETHER: ‖C‖→0 at Planck scale";
  } else if (has("/biomagnetism") && has("/plasma-knots")) {
    emergentInsight = "The heart's toroidal magnetic field has exactly the topology of a T(2,1) torus knot — the simplest non-trivial torus knot. The heart IS a biological plasma-like magnetic system. The heart's safety factor q (rhythm regularity) maps directly to tokamak safety factor q: high HRV = high q = stable, far from reconnection. Cardiac arrhythmia = magnetic reconnection event in the heart's toroidal field. AETHER reading: heart coherence protocol = plasma stability protocol.";
    equation = "Heart HRV q_cardiac > q_crit ↔ Tokamak q_95 > 2: same stability condition, different scale";
  } else {
    // Generic synthesis
    emergentInsight = pages.map(p => p.synthesis).join(" ∴ ");
    equation = pages.map(p => p.equations[0]).join("  ←→  ");
  }

  if (!unifying) {
    unifying = `The selected pages share the following organising principle: coherent structures emerge when their ${sharedTags.join(", ")} dynamics are governed by a conserved topological invariant. Each page describes a different scale of the same process — the C(x,t) coherence field maintaining structure against perturbation through topological protection.`;
  }

  return { title, unifying, keyConnections: conns, sharedConcepts: allConcepts, emergentInsight, equation };
}

/* ── Tag pill ───────────────────────────────────────────────────────────────── */
function TagPill({ tag }: { tag: string }) {
  const colMap: Record<string, string> = {
    solar: CORAL, quantum: VIOLET, biology: WEB, coherence: AQUA, topology: GOLD,
    plasma: BLUE, cognition: TOUCH, identity: ROSE, physics: VIOLET, morphic: WEB,
    helicity: BLUE, strings: VIOLET, "phase transition": WEB,
  };
  const col = colMap[tag] || DIM;
  return <span style={{ fontFamily: mono, fontSize: 9, color: col, background: `${col}15`, border: `1px solid ${col}30`, borderRadius: 12, padding: "2px 8px", letterSpacing: 1, textTransform: "uppercase" as const }}>{tag}</span>;
}

/* ── Page card ─────────────────────────────────────────────────────────────── */
function PageCard({ page, selected, onToggle }: { page: PageEntry; selected: boolean; onToggle: () => void }) {
  return (
    <button onClick={onToggle} style={{
      border: `2px solid ${selected ? page.col : `${DIM}30`}`,
      background: selected ? `${page.col}10` : "rgba(10,18,28,0.6)",
      borderRadius: 8, padding: "14px 16px", cursor: "pointer", textAlign: "left" as const,
      transition: "all 0.2s", width: "100%", position: "relative" as const,
    }}>
      {selected && (
        <div style={{ position: "absolute" as const, top: 8, right: 10, fontFamily: mono, fontSize: 9, color: page.col, background: `${page.col}20`, borderRadius: 10, padding: "2px 6px" }}>SELECTED</div>
      )}
      <div style={{ fontFamily: serif, fontSize: 13, color: selected ? page.col : "#fff", marginBottom: 6 }}>{page.title}</div>
      <div style={{ display: "flex", gap: 4, flexWrap: "wrap" as const, marginBottom: 8 }}>
        {page.tags.slice(0, 4).map(t => <TagPill key={t} tag={t} />)}
      </div>
      <div style={{ fontFamily: body, fontSize: 12, color: DIM, lineHeight: 1.5 }}>{page.concepts.slice(0, 3).join(" · ")}</div>
    </button>
  );
}

/* ── Connection badge ───────────────────────────────────────────────────────── */
function ConnBadge({ conn }: { conn: Connection }) {
  const fromPage = PAGES.find(p => p.href === conn.from)!;
  const toPage   = PAGES.find(p => p.href === conn.to)!;
  const strengthIcon = { strong: "━━", medium: "╌╌", emergent: "⋯⋯" }[conn.strength];
  const strengthCol  = { strong: WEB, medium: GOLD, emergent: VIOLET }[conn.strength];
  return (
    <div style={{ border: `1px solid ${strengthCol}30`, background: `${strengthCol}08`, borderRadius: 6, padding: "10px 14px", marginBottom: 8 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
        <span style={{ fontFamily: mono, fontSize: 10, color: fromPage.col }}>{fromPage.short}</span>
        <span style={{ fontFamily: mono, fontSize: 9, color: strengthCol, letterSpacing: 2 }}>{strengthIcon}</span>
        <span style={{ fontFamily: mono, fontSize: 10, color: toPage.col }}>{toPage.short}</span>
        <span style={{ fontFamily: mono, fontSize: 8, color: strengthCol, marginLeft: "auto", textTransform: "uppercase" as const, letterSpacing: 1 }}>{conn.strength}</span>
      </div>
      <div style={{ fontFamily: body, fontSize: 13, color: "#7a9aa2", lineHeight: 1.55 }}>{conn.concept}</div>
    </div>
  );
}

export default function SynthesizePage() {
  const [selected, setSelected] = useState<string[]>([]);

  const toggle = (href: string) => {
    setSelected(prev => prev.includes(href) ? prev.filter(h => h !== href) : [...prev, href]);
  };

  const result = useMemo(() => synthesise(selected), [selected]);

  return (
    <div style={{ background: BG, minHeight: "100vh", fontFamily: body, color: TEXT }}>
      {/* Hero */}
      <div style={{ padding: "56px 28px 36px", textAlign: "center", background: "linear-gradient(180deg,#030a14 0%,#020408 100%)", borderBottom: `1px solid ${AQUA}18` }}>
        <div style={{ fontFamily: mono, fontSize: 10, color: AQUA, letterSpacing: 4, marginBottom: 10 }}>AETHER · KNOWLEDGE SYNTHESIS · CROSS-PAGE</div>
        <h1 style={{ fontFamily: serif, fontSize: "clamp(20px,3.8vw,38px)", color: "#fff", margin: "0 0 10px", letterSpacing: 2 }}>
          SYNTHESIZE
        </h1>
        <p style={{ fontFamily: body, fontSize: 16, color: DIM, maxWidth: 620, margin: "0 auto", lineHeight: 1.8 }}>
          Select 2 or more pages below to synthesise their concepts into a unified insight.
          The engine surfaces shared principles, cross-page connections, and emergent theories
          that only appear when the frameworks are viewed together.
        </p>
      </div>

      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "28px 22px 96px", display: "grid", gridTemplateColumns: "1fr 1fr", gap: 28, alignItems: "start" }}>

        {/* LEFT — selection panel */}
        <div>
          <div style={{ fontFamily: mono, fontSize: 10, color: AQUA, letterSpacing: 3, marginBottom: 14 }}>
            SELECT PAGES · {selected.length} / {PAGES.length} SELECTED
          </div>
          {selected.length >= 2 && (
            <div style={{ fontFamily: mono, fontSize: 9, color: WEB, marginBottom: 12, letterSpacing: 1 }}>
              ✓ READY TO SYNTHESIZE — see results on right →
            </div>
          )}
          {selected.length > 0 && (
            <button onClick={() => setSelected([])} style={{ fontFamily: mono, fontSize: 9, color: CORAL, background: "transparent", border: `1px solid ${CORAL}40`, borderRadius: 4, padding: "3px 10px", cursor: "pointer", marginBottom: 14, letterSpacing: 1 }}>
              CLEAR ALL
            </button>
          )}
          <div style={{ display: "flex", flexDirection: "column" as const, gap: 10 }}>
            {PAGES.map(page => (
              <PageCard key={page.href} page={page} selected={selected.includes(page.href)} onToggle={() => toggle(page.href)} />
            ))}
          </div>
          <div style={{ marginTop: 18, fontFamily: mono, fontSize: 8, color: `${DIM}80`, lineHeight: 2 }}>
            CONNECTION STRENGTH LEGEND:<br />
            <span style={{ color: WEB }}>━━ STRONG</span> · <span style={{ color: GOLD }}>╌╌ MEDIUM</span> · <span style={{ color: VIOLET }}>⋯⋯ EMERGENT</span>
          </div>
        </div>

        {/* RIGHT — synthesis output */}
        <div style={{ position: "sticky" as const, top: 20 }}>
          {selected.length === 0 && (
            <div style={{ border: `1px solid ${DIM}20`, borderRadius: 10, padding: "40px 28px", textAlign: "center" }}>
              <div style={{ fontFamily: serif, fontSize: 22, color: `${DIM}80`, marginBottom: 12 }}>←</div>
              <div style={{ fontFamily: body, fontSize: 15, color: DIM, lineHeight: 1.7 }}>
                Select pages from the left panel to synthesise their concepts.
                Start with 2 pages — the engine will surface cross-framework connections.
              </div>
            </div>
          )}
          {selected.length === 1 && (
            <div style={{ border: `1px solid ${DIM}20`, borderRadius: 10, padding: "28px" }}>
              <div style={{ fontFamily: mono, fontSize: 10, color: DIM, letterSpacing: 2, marginBottom: 10 }}>SINGLE PAGE — SELECT ONE MORE</div>
              {(() => { const p = PAGES.find(pg => pg.href === selected[0])!; return (
                <>
                  <div style={{ fontFamily: serif, fontSize: 16, color: p.col, marginBottom: 10 }}>{p.title}</div>
                  <div style={{ fontFamily: body, fontSize: 14, color: "#7a9aa2", lineHeight: 1.7, marginBottom: 14 }}>{p.synthesis}</div>
                  <div style={{ fontFamily: mono, fontSize: 10, color: GOLD, marginBottom: 6 }}>PAGES IT CONNECTS STRONGLY TO:</div>
                  {CONNECTIONS.filter(c => (c.from === p.href || c.to === p.href) && c.strength === "strong").map((c, i) => {
                    const other = PAGES.find(pg => pg.href === (c.from === p.href ? c.to : c.from))!;
                    return (
                      <div key={i} style={{ fontFamily: body, fontSize: 12, color: DIM, marginBottom: 6 }}>
                        <span style={{ color: other.col }}>{other.short}</span> — {c.concept}
                      </div>
                    );
                  })}
                  <div style={{ marginTop: 14 }}>
                    <Link href={p.href} style={{ fontFamily: mono, fontSize: 9, color: p.col, border: `1px solid ${p.col}40`, borderRadius: 4, padding: "4px 12px", textDecoration: "none" }}>
                      OPEN PAGE →
                    </Link>
                  </div>
                </>
              ); })()}
            </div>
          )}
          {selected.length >= 2 && (
            <div>
              {/* Synthesis header */}
              <div style={{ border: `1px solid ${WEB}30`, background: `${WEB}06`, borderRadius: 10, padding: "20px 22px", marginBottom: 16 }}>
                <div style={{ fontFamily: mono, fontSize: 9, color: WEB, letterSpacing: 2, marginBottom: 8 }}>SYNTHESIS · {selected.length} PAGES</div>
                <div style={{ fontFamily: serif, fontSize: 16, color: "#fff", marginBottom: 14 }}>{result.title}</div>
                <div style={{ fontFamily: body, fontSize: 14, color: "#7a9aa2", lineHeight: 1.7 }}>{result.unifying}</div>
              </div>

              {/* Emergent insight */}
              <div style={{ border: `1px solid ${GOLD}30`, background: `${GOLD}06`, borderRadius: 10, padding: "20px 22px", marginBottom: 16 }}>
                <div style={{ fontFamily: mono, fontSize: 9, color: GOLD, letterSpacing: 2, marginBottom: 10 }}>EMERGENT INSIGHT</div>
                <div style={{ fontFamily: body, fontSize: 14, color: TEXT, lineHeight: 1.8 }}>{result.emergentInsight}</div>
                {result.equation && (
                  <pre style={{ fontFamily: mono, fontSize: 11, color: AQUA, background: "#030a14", borderLeft: `2px solid ${AQUA}`, borderRadius: "0 4px 4px 0", padding: "10px 14px", marginTop: 14, whiteSpace: "pre-wrap" as const, overflowX: "auto" }}>{result.equation}</pre>
                )}
              </div>

              {/* Cross-page connections */}
              {result.keyConnections.length > 0 && (
                <div style={{ border: `1px solid ${TEAL}20`, borderRadius: 10, padding: "18px 20px", marginBottom: 16 }}>
                  <div style={{ fontFamily: mono, fontSize: 9, color: AQUA, letterSpacing: 2, marginBottom: 12 }}>
                    CROSS-PAGE CONNECTIONS · {result.keyConnections.length} FOUND
                  </div>
                  {result.keyConnections.map((c, i) => <ConnBadge key={i} conn={c} />)}
                </div>
              )}

              {/* All concepts */}
              <div style={{ border: `1px solid ${DIM}20`, borderRadius: 10, padding: "16px 18px", marginBottom: 16 }}>
                <div style={{ fontFamily: mono, fontSize: 9, color: DIM, letterSpacing: 2, marginBottom: 10 }}>ALL CONCEPTS IN SCOPE · {result.sharedConcepts.length}</div>
                <div style={{ display: "flex", flexWrap: "wrap" as const, gap: 5 }}>
                  {result.sharedConcepts.map((c, i) => (
                    <span key={i} style={{ fontFamily: mono, fontSize: 9, color: PAGES[i % PAGES.length].col, background: `${PAGES[i % PAGES.length].col}12`, border: `1px solid ${PAGES[i % PAGES.length].col}25`, borderRadius: 4, padding: "2px 6px" }}>{c}</span>
                  ))}
                </div>
              </div>

              {/* Page links */}
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap" as const }}>
                {PAGES.filter(p => selected.includes(p.href)).map(p => (
                  <Link key={p.href} href={p.href} style={{ fontFamily: mono, fontSize: 9, color: p.col, border: `1px solid ${p.col}40`, borderRadius: 4, padding: "4px 12px", textDecoration: "none" }}>
                    → {p.short}
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
