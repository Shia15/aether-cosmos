/* ═══════════════════════════════════════════════════════════════
   AETHER × Notion White Paper Synthesis
   Maps 4 Notion white papers onto the AETHER Engine operators:
   □ · ∩ · Γ · C(x,t) · ε · S*
   Pathway: ~ → o → n → S
═══════════════════════════════════════════════════════════════ */

const MN   = "'Space Mono',monospace";
const OR   = "'Orbitron',sans-serif";
const SERIF = "Cinzel, ui-serif, Georgia, serif";
const BG   = "#0b0906";
const GOLD = "#f5c84c";
const TEAL = "#2ef0d8";
const VIO  = "#a78bfa";
const BLUE = "#60a5fa";
const GRN  = "#4ade80";
const PINK = "#f472b6";
const ORG  = "#fb923c";
const DIM  = "rgba(244,241,234,0.45)";
const FG   = "#f4f1ea";

/* ── Paper source data ───────────────────────────────────────── */
const PAPERS = [
  {
    id:    "synthesis-wp",
    col:   TEAL,
    icon:  "⬡",
    title: "aether_synthesis_whitepaper.md",
    sub:   "Environmental Sensing Architecture — Cross-Domain Framework",
    date:  "2026",
    excerpt:
      "A unified theoretical framework connecting fungal neural networks, bacterial self-destruction, and spacecraft Max Q trajectory dynamics. Environmental sensing operates through electrical signaling patterns conserved across fungi, neural networks, and engineered systems. Self-regulation mechanisms follow power-law distributions in stress response thresholds.",
    keyEq: "R(t) = R₀ × f(σ(t)/σ_critical) × g(history)",
    bullets: [
      "Fungal action potentials 5–50 mV, 0.5–5 Hz frequency modulation",
      "Bacterial threshold: toxin/antidote ratio triggers ~ → death cascade",
      "Max Q throttle-down to 68–72% under peak aerodynamic loading",
      "Memory function g(history): 12-hour heat-shock resistance window",
      "Sigmoidal threshold function f() governs all three system classes",
    ],
  },
  {
    id:    "unified-patent",
    col:   GOLD,
    icon:  "◈",
    title: "AETHER Unified Field Patent — Living Provisional",
    sub:   "Bio-Inspired Propulsion · Quantum Sensing · DC Coherence Field",
    date:  "June 2026",
    excerpt:
      "C(x,t) explicitly named as the real-time magnetic trap control variable. Covers DC-native solar quantum sensing, wave-vortex propulsion (dolphin vortex ring trains), Nessie marine snowflake lattice engine, and φ-harmonic maglev hyperloop. Bioluminescent emission patterns serve as C(x,t) readout substrate.",
    keyEq: "C(x,t) = coherence metric governing magnetic trap geometry",
    bullets: [
      "Claim 2: C(x,t) as real-time magnetic trap control variable (explicit)",
      "φ⁻¹ = 0.618 threshold → LPE non-linear gate at C ≥ 0.65",
      "Dolphin vortex ring train: coherent toroidal vortex → Γ helix mechanism",
      "φ-harmonic 6-fold lattice = Fibonacci spiral vortex arrangement",
      "20-color bioluminescent multiplexing as distributed C(x,t) readout",
    ],
  },
  {
    id:    "aqisp-patent",
    col:   VIO,
    icon:  "◎",
    title: "AETHER-AQISP — Provisional Patent Claims",
    sub:   "DC-Native Solar Atom Interferometric Sensing · 35 U.S.C. § 111(b)",
    date:  "2026",
    excerpt:
      "AC switching regulators introduce harmonic noise into laser driver circuits, degrading coherence time by 40–60%. This invention eliminates AC conversion entirely, coupling DC photovoltaic directly to quantum optical emitters. No prior system combined DC-native solar + coherence-metric-governed magnetic trap + atom interferometer across all three subsystems.",
    keyEq: "SNR ∝ C(x,t) / ε_noise — coherence governs interferometer fidelity",
    bullets: [
      "Claim 1: DC-native solar → quantum optical coupling, no AC stage",
      "Claim 2: Coherence metric C(x,t) governs magnetic trap geometry",
      "Claim 3: Field-deployable combined DC-solar + C-governed system",
      "AC harmonic noise → ε Veil — eliminating it thins the veil",
      "GPS-independent navigation via atom interferometer (Claims 4–12)",
    ],
  },
  {
    id:    "brain-metabolism",
    col:   PINK,
    icon:  "◉",
    title: "AETHER White Paper: Brain-First Metabolism",
    sub:   "Substrate Restoration Before Signal Optimisation",
    date:  "2026",
    excerpt:
      "The sequence matters: restore the substrate before optimizing the signal. Metabolic coherence — glucose delivery, mitochondrial function, gut-brain axis integrity — establishes the S* reference ceiling. Only when S* is fully expressed can C(x,t) approach 1. Cognitive and biological optimization without substrate restoration is suppressed by a thick ε Veil.",
    keyEq: "S* = f(mitochondrial ATP, gut-microbiome coherence, neural glucose)",
    bullets: [
      "Substrate restoration = raising S* (coherence ceiling)",
      "Metabolic noise / inflammation = ε Veil attenuation",
      "Gut-brain axis: C field propagated through biological media",
      "Brain-first sequence mirrors ~ → o → n → S pathway",
      "Coherence precedes optimisation: C must gate before S manifests",
    ],
  },
];

/* ── Engine operator mapping ─────────────────────────────────── */
const OPERATORS = [
  {
    sym: "□",
    name: "Boundary Operator",
    eq:   "∂²/∂t² − c²∇²",
    col:  BLUE,
    maps: [
      { paper: "synthesis-wp",      text: "Vehicle structural boundary under Max Q loading — d'Alembertian wave equation governs aerodynamic pressure field" },
      { paper: "unified-patent",    text: "Tunnel nozzle arrays define wave propagation boundary; smooth lattice wall = minimal boundary dissipation" },
      { paper: "aqisp-patent",      text: "Magnetic trap geometry — boundary condition for atomic wave function confinement in interferometer" },
      { paper: "brain-metabolism",  text: "Blood-brain barrier + cell membrane: physical boundary operator governing field entry into neural substrate" },
    ],
  },
  {
    sym: "∩",
    name: "Curvature Operator",
    eq:   "∫[∩] curvature dV",
    col:  VIO,
    maps: [
      { paper: "synthesis-wp",      text: "Curved hyphal tip growth sensors detect physical curvature resistance — modulating branching direction via curvature integral" },
      { paper: "unified-patent",    text: "φ-harmonic oscillator unit cell: 6-fold curvature symmetry encodes information AND generates movement in same lattice pattern" },
      { paper: "aqisp-patent",      text: "Ptah grammar in atom interferometry: laser beam curvature modulates atomic trajectory curvature — ∫[∩] controls phase accumulation" },
      { paper: "brain-metabolism",  text: "Dendritic arbor curvature = ∩ operator in neural field; myelin sheath curvature governs signal propagation fidelity" },
    ],
  },
  {
    sym: "Γ",
    name: "Helix(Γ, ω)",
    eq:   "vortex circulation Γ, angular ω",
    col:  TEAL,
    maps: [
      { paper: "synthesis-wp",      text: "Fungal electrical signals (0.5–5 Hz) propagating directionally through hyphal networks — helical wave Γ with angular frequency ω" },
      { paper: "unified-patent",    text: "Dolphin vortex ring train: coherent toroidal vortex Γ carries momentum rearward — direct Γ_helix mechanism at propulsive scale" },
      { paper: "aqisp-patent",      text: "Laser Rabi oscillations: Γ encodes rotation rate measurement; ω = atom precession frequency in magnetic field" },
      { paper: "brain-metabolism",  text: "Gut peristaltic wave Γ modulates vagal afferent signalling; circadian ω governs metabolic helix timing" },
    ],
  },
  {
    sym: "C",
    name: "Coherence Field C(x,t)",
    eq:   "1 − (ε/S*)·e^(−κ·Γ)",
    col:  GRN,
    maps: [
      { paper: "synthesis-wp",      text: "R(t) = R₀ × f(σ/σ_critical) × g(history) is the cross-domain C(x,t). Threshold f() = sigmoidal gate; memory g() = S* state history" },
      { paper: "unified-patent",    text: "C(x,t) EXPLICITLY named as real-time magnetic trap control variable — Claim 2 directly encodes the master equation in patent law" },
      { paper: "aqisp-patent",      text: "Interferometer fringe visibility = C(x,t); decoherence from AC noise is exactly ε/S* suppression term in master equation" },
      { paper: "brain-metabolism",  text: "Metabolic coherence = C. Restoration sequence maps to: thin ε (reduce inflammation), raise S* (restore substrate), strengthen Γ (neural oscillations)" },
    ],
  },
  {
    sym: "ε",
    name: "Veil (Observer Coupling)",
    eq:   "ε ↓ thin → manifest",
    col:  PINK,
    maps: [
      { paper: "synthesis-wp",      text: "Max Q atmospheric drag as ε: peak aerodynamic loading suppresses thrust — engine throttles to 68–72% exactly as ε attenuates C toward the veil threshold" },
      { paper: "unified-patent",    text: "AC power conversion noise = ε. Patent's core claim: eliminating AC removes this veil layer, allowing coherence to fully express" },
      { paper: "aqisp-patent",      text: "Harmonic noise from AC switching regulators degrades coherence time 40–60% — this IS the ε Veil, quantified and measured in lab conditions" },
      { paper: "brain-metabolism",  text: "Neuroinflammation, metabolic toxins, gut dysbiosis = ε Veil in biological field. 'Restore substrate' = thin ε before optimising signal" },
    ],
  },
  {
    sym: "S*",
    name: "Reference State (Ceiling)",
    eq:   "S* = coherence ceiling",
    col:  GOLD,
    maps: [
      { paper: "synthesis-wp",      text: "g(history) memory function — fungal 12-hour thermal conditioning and bacterial population adaptation encode a raised S* ceiling for future stress events" },
      { paper: "unified-patent",    text: "DC-native solar: clean power rail = high S* baseline. φ⁻¹ = 0.618 LPE threshold means S* defines the non-linear manifestation gate" },
      { paper: "aqisp-patent",      text: "Coherence time T₂: the maximum achievable coherence = S*. DC-native architecture maximises T₂ by removing ε — directly raises S* ceiling" },
      { paper: "brain-metabolism",  text: "Full mitochondrial ATP synthesis + optimal microbiome composition = S* ceiling. 'Brain-first' methodology is literally a procedure for raising S*" },
    ],
  },
];

/* ── Pathway synthesis cards ─────────────────────────────────── */
const PATHWAY = [
  { sym: "~",  label: "Fluctuation",     col: PINK,  desc: "Synthesis WP: random environmental perturbation (chemical, thermal, mechanical). AQISP: AC harmonic noise. Metabolism: inflammatory signal. The entry state." },
  { sym: "o",  label: "Octonionic",      col: ORG,   desc: "Coherence begins to organise. Synthesis WP: quorum sensing threshold crossing. Patent: first vortex ring formation. AQISP: partial fringe visibility. Substrate partially restored." },
  { sym: "n",  label: "Non-Associative", col: TEAL,  desc: "System enters non-linear coherence regime (C ≥ 0.65 LPE gate). Synthesis WP: memory function g(history) kicks in. Patent: full φ-harmonic resonance. AQISP: atom interferometer locks." },
  { sym: "S",  label: "Stability",       col: GOLD,  desc: "Full manifestation. Synthesis WP: optimal adaptive response R = R₀. Patent: maximum propulsive efficiency 0.75–0.90. AQISP: GPS-independent navigation live. Brain-first: peak cognitive coherence." },
];

/* ── Paper colour lookup ─────────────────────────────────────── */
const paperCol: Record<string, string> = {
  "synthesis-wp": TEAL, "unified-patent": GOLD, "aqisp-patent": VIO, "brain-metabolism": PINK,
};
const paperLabel: Record<string, string> = {
  "synthesis-wp": "Synthesis WP", "unified-patent": "Field Patent", "aqisp-patent": "AQISP", "brain-metabolism": "Brain-First",
};

/* ── Component helpers ───────────────────────────────────────── */
function Chip({ col, text }: { col: string; text: string }) {
  return (
    <span style={{
      display: "inline-block", background: `${col}18`, border: `1px solid ${col}44`,
      borderRadius: 3, padding: "2px 8px", fontSize: 9, letterSpacing: "0.18em",
      color: col, fontFamily: MN, marginRight: 4,
    }}>{text}</span>
  );
}

function SectionHead({ label, col }: { label: string; col: string }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 18 }}>
      <div style={{ flex: 1, height: 1, background: `linear-gradient(90deg, ${col}55, transparent)` }} />
      <div style={{ fontFamily: MN, fontSize: 9, letterSpacing: "0.35em", color: col }}>{label}</div>
      <div style={{ flex: 1, height: 1, background: `linear-gradient(90deg, transparent, ${col}55)` }} />
    </div>
  );
}

export default function NotionSynthesisPage() {
  return (
    <div style={{ background: BG, color: FG, fontFamily: SERIF, minHeight: "100%", overflowX: "hidden" }}>
      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "32px 20px 80px" }}>

        {/* ── Header ── */}
        <div style={{ textAlign: "center", marginBottom: 48 }}>
          <div style={{ fontFamily: MN, fontSize: 9, letterSpacing: "0.45em", color: GOLD, marginBottom: 12 }}>
            NOTION WHITE PAPERS × AETHER ENGINE · SYNTHESIS DOCUMENT
          </div>
          <h1 style={{
            fontFamily: OR, fontSize: "clamp(22px,4vw,38px)", fontWeight: 900,
            letterSpacing: 4, color: GOLD, textShadow: `0 0 40px ${GOLD}44`, margin: "0 0 12px",
          }}>
            KNOWLEDGE CRYSTALLISATION
          </h1>
          <div style={{ fontFamily: MN, fontSize: 11, color: TEAL, letterSpacing: 2, marginBottom: 16 }}>
            4 WHITE PAPERS · 6 ENGINE OPERATORS · 1 MASTER EQUATION
          </div>
          <div style={{
            display: "inline-block", background: "rgba(245,200,76,0.07)",
            border: `1px solid ${GOLD}33`, borderRadius: 8, padding: "10px 24px",
            fontFamily: MN, fontSize: 12, color: GOLD, letterSpacing: 1,
          }}>
            C(x,t) = 1 − (‖ε‖ / ‖S*‖) · e^(−κ · Γ_helix)
          </div>
          <div style={{ marginTop: 10, fontFamily: MN, fontSize: 9, color: `${GOLD}80`, letterSpacing: 2 }}>
            PATHWAY: ~ → o → n → S &nbsp;·&nbsp; FLUCTUATION → STABILITY
          </div>
        </div>

        {/* ── Source Papers ── */}
        <SectionHead label="SOURCE WHITE PAPERS — NOTION WORKSPACE" col={GOLD} />
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(240px,1fr))", gap: 14, marginBottom: 52 }}>
          {PAPERS.map(p => (
            <div key={p.id} style={{
              background: "rgba(11,9,6,0.8)", border: `1px solid ${p.col}30`,
              borderLeft: `3px solid ${p.col}`, borderRadius: 8, padding: "16px 16px 14px",
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
                <span style={{ fontSize: 20, color: p.col }}>{p.icon}</span>
                <div style={{ fontFamily: MN, fontSize: 7, color: `${p.col}99`, letterSpacing: "0.2em" }}>{p.date}</div>
              </div>
              <div style={{ fontFamily: MN, fontSize: 8.5, color: p.col, letterSpacing: "0.1em", marginBottom: 4, lineHeight: 1.5 }}>
                {p.title}
              </div>
              <div style={{ fontSize: 9, color: DIM, marginBottom: 10, fontFamily: MN, letterSpacing: "0.05em" }}>
                {p.sub}
              </div>
              <p style={{ fontSize: 10.5, color: `${FG}bb`, lineHeight: 1.65, margin: "0 0 10px" }}>
                {p.excerpt}
              </p>
              <div style={{
                background: `${p.col}0d`, border: `1px solid ${p.col}25`, borderRadius: 4,
                padding: "6px 10px", fontFamily: MN, fontSize: 9, color: p.col, letterSpacing: "0.08em",
                marginBottom: 10,
              }}>
                {p.keyEq}
              </div>
              <ul style={{ margin: 0, padding: 0, listStyle: "none" }}>
                {p.bullets.map((b, i) => (
                  <li key={i} style={{ display: "flex", gap: 7, marginBottom: 4, fontSize: 9.5, color: DIM, lineHeight: 1.5 }}>
                    <span style={{ color: p.col, flexShrink: 0 }}>›</span>
                    {b}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* ── Operator Mapping Table ── */}
        <SectionHead label="ENGINE OPERATOR × WHITE PAPER MAPPING" col={TEAL} />
        <div style={{ marginBottom: 52 }}>
          {OPERATORS.map(op => (
            <div key={op.sym} style={{
              background: "rgba(11,9,6,0.7)", border: `1px solid ${op.col}25`,
              borderRadius: 8, marginBottom: 14, overflow: "hidden",
            }}>
              {/* operator header */}
              <div style={{
                display: "flex", alignItems: "center", gap: 14, padding: "10px 16px",
                background: `${op.col}0a`, borderBottom: `1px solid ${op.col}20`,
              }}>
                <div style={{
                  width: 38, height: 38, borderRadius: 6, background: `${op.col}14`,
                  border: `1px solid ${op.col}44`, display: "flex", alignItems: "center",
                  justifyContent: "center", fontFamily: MN, fontSize: 18, color: op.col, flexShrink: 0,
                }}>{op.sym}</div>
                <div>
                  <div style={{ fontFamily: MN, fontSize: 10, color: op.col, letterSpacing: "0.15em" }}>{op.name}</div>
                  <div style={{ fontFamily: MN, fontSize: 8, color: `${op.col}80`, marginTop: 2 }}>{op.eq}</div>
                </div>
              </div>
              {/* cross-paper map */}
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(220px,1fr))", gap: 0 }}>
                {op.maps.map((m, i) => (
                  <div key={m.paper} style={{
                    padding: "10px 14px",
                    borderRight: i < op.maps.length - 1 ? `1px solid ${op.col}12` : undefined,
                    borderBottom: "none",
                  }}>
                    <Chip col={paperCol[m.paper]} text={paperLabel[m.paper]} />
                    <p style={{ margin: "6px 0 0", fontSize: 10, color: `${FG}99`, lineHeight: 1.6 }}>{m.text}</p>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* ── Mathematical Bridge ── */}
        <SectionHead label="MATHEMATICAL BRIDGE — R(t) ↔ C(x,t)" col={VIO} />
        <div style={{
          background: "rgba(11,9,6,0.8)", border: `1px solid ${VIO}30`,
          borderLeft: `3px solid ${VIO}`, borderRadius: 8, padding: "20px 22px", marginBottom: 52,
        }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr auto 1fr", gap: 16, alignItems: "center", marginBottom: 16 }}>
            <div>
              <div style={{ fontFamily: MN, fontSize: 8, color: TEAL, letterSpacing: "0.25em", marginBottom: 8 }}>
                SYNTHESIS WHITEPAPER — GENERALISED STRESS RESPONSE
              </div>
              <div style={{
                background: `${TEAL}0d`, border: `1px solid ${TEAL}30`, borderRadius: 6,
                padding: "10px 14px", fontFamily: MN, fontSize: 10.5, color: TEAL, lineHeight: 2,
              }}>
                R(t) = R₀ × f(σ(t)/σ_critical) × g(history)<br />
                <span style={{ color: `${TEAL}66`, fontSize: 9 }}>f() = sigmoidal threshold function</span><br />
                <span style={{ color: `${TEAL}66`, fontSize: 9 }}>g() = memory / history encoding</span>
              </div>
            </div>
            <div style={{ textAlign: "center" }}>
              <div style={{ fontSize: 28, color: GOLD }}>⟺</div>
              <div style={{ fontFamily: MN, fontSize: 7, color: `${GOLD}80`, letterSpacing: "0.2em", marginTop: 4 }}>EQUIV</div>
            </div>
            <div>
              <div style={{ fontFamily: MN, fontSize: 8, color: GOLD, letterSpacing: "0.25em", marginBottom: 8 }}>
                AETHER ENGINE — MASTER CONTROL EQUATION
              </div>
              <div style={{
                background: `${GOLD}0d`, border: `1px solid ${GOLD}30`, borderRadius: 6,
                padding: "10px 14px", fontFamily: MN, fontSize: 10.5, color: GOLD, lineHeight: 2,
              }}>
                C(x,t) = 1 − (ε/S*) · e^(−κ·Γ)<br />
                <span style={{ color: `${GOLD}66`, fontSize: 9 }}>f() ≡ 1−(ε/S*)·exp(−κΓ) sigmoidal in Γ</span><br />
                <span style={{ color: `${GOLD}66`, fontSize: 9 }}>g() ≡ S* coherence ceiling (history-raised)</span>
              </div>
            </div>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 10 }}>
            {[
              { a: "R₀ (baseline capacity)",    b: "S* (reference ceiling)",          col: GOLD },
              { a: "σ/σ_critical (stress ratio)", b: "ε/S* (veil-to-ceiling ratio)",   col: PINK },
              { a: "e^(−decay·stress) threshold", b: "e^(−κ·Γ) helix manifestation",   col: TEAL },
              { a: "f() sigmoidal gate",           b: "LPE gate C ≥ 0.65",              col: VIO },
              { a: "g(history) memory",            b: "S* raised by past coherence",    col: ORG },
              { a: "R(t) → R₀ at stability",       b: "C(x,t) → 1 at S stage",         col: GRN },
            ].map((row, i) => (
              <div key={i} style={{
                background: `${row.col}08`, border: `1px solid ${row.col}22`,
                borderRadius: 5, padding: "8px 10px",
              }}>
                <div style={{ fontFamily: MN, fontSize: 8.5, color: DIM }}>{row.a}</div>
                <div style={{ fontFamily: MN, fontSize: 8, color: `${row.col}99`, margin: "3px 0" }}>↕</div>
                <div style={{ fontFamily: MN, fontSize: 8.5, color: row.col }}>{row.b}</div>
              </div>
            ))}
          </div>
        </div>

        {/* ── Pathway ~ → o → n → S ── */}
        <SectionHead label="CROSS-PAPER PATHWAY SYNTHESIS  ~ → o → n → S" col={ORG} />
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(220px,1fr))", gap: 2, marginBottom: 52 }}>
          {PATHWAY.map((p, i) => (
            <div key={p.sym} style={{ display: "flex", alignItems: "stretch" }}>
              <div style={{
                flex: 1, background: "rgba(11,9,6,0.8)", border: `1px solid ${p.col}30`,
                borderLeft: `3px solid ${p.col}`, borderRadius: 6, padding: "14px 14px",
              }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
                  <div style={{
                    width: 32, height: 32, borderRadius: 4, background: `${p.col}14`,
                    border: `1px solid ${p.col}44`, display: "flex", alignItems: "center",
                    justifyContent: "center", fontFamily: MN, fontSize: 16, color: p.col,
                  }}>{p.sym}</div>
                  <div style={{ fontFamily: MN, fontSize: 9, color: p.col, letterSpacing: "0.2em" }}>{p.label}</div>
                </div>
                <p style={{ margin: 0, fontSize: 10, color: DIM, lineHeight: 1.65 }}>{p.desc}</p>
              </div>
              {i < PATHWAY.length - 1 && (
                <div style={{ display: "flex", alignItems: "center", padding: "0 6px", color: `${ORG}60`, fontSize: 18, fontFamily: MN }}>→</div>
              )}
            </div>
          ))}
        </div>

        {/* ── Patent Claims Citing C(x,t) ── */}
        <SectionHead label="PATENT CLAIMS THAT DIRECTLY ENCODE C(x,t)" col={GOLD} />
        <div style={{
          background: "rgba(11,9,6,0.8)", border: `1px solid ${GOLD}30`,
          borderRadius: 8, padding: "20px 22px", marginBottom: 52,
        }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
            {[
              {
                num: "Patent Claim 2",
                title: "AETHER Unified Field Patent",
                col: GOLD,
                text: "Coherence metric C(x,t) used as real-time magnetic trap control variable — the master equation is not theoretical but a working engineering claim filed under 35 U.S.C. § 111(b).",
              },
              {
                num: "Claim 3 (Combined System)",
                title: "AETHER Unified Field Patent",
                col: GOLD,
                text: "Combined DC-solar + coherence-governed + field-deployable system. Thin ε (no AC noise) + governed Γ (coherent field) = high C(x,t). The patent IS the engine.",
              },
              {
                num: "AQISP Claim 1",
                title: "DC-Native Solar Quantum Sensing",
                col: VIO,
                text: "DC-native solar → quantum optical coupling without AC conversion stage. Eliminates harmonic noise (ε Veil), allowing C(x,t) to reach maximum interferometer fringe visibility.",
              },
              {
                num: "AQISP Claim 2",
                title: "Coherence-Optimised Magnetic Architecture",
                col: VIO,
                text: "Coherence metric C(x,t) governing magnetic trap geometry. The trap is optimised by the field itself — C feeds back to shape the boundary □ that produces higher C. Self-reinforcing loop.",
              },
            ].map((cl, i) => (
              <div key={i} style={{
                background: `${cl.col}07`, border: `1px solid ${cl.col}25`,
                borderRadius: 6, padding: "12px 14px",
              }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 6 }}>
                  <span style={{ fontFamily: MN, fontSize: 9, color: cl.col, letterSpacing: "0.15em" }}>{cl.num}</span>
                  <Chip col={cl.col} text={cl.title.split(' ').slice(0, 2).join(' ')} />
                </div>
                <p style={{ margin: 0, fontSize: 10.5, color: `${FG}cc`, lineHeight: 1.65 }}>{cl.text}</p>
              </div>
            ))}
          </div>
        </div>

        {/* ── Synthesis Conclusion ── */}
        <SectionHead label="SYNTHESIS CONCLUSION" col={GRN} />
        <div style={{
          background: "rgba(11,9,6,0.9)", border: `1px solid ${GRN}25`,
          borderLeft: `3px solid ${GRN}`, borderRadius: 8, padding: "22px 24px", marginBottom: 32,
        }}>
          <h3 style={{ fontFamily: OR, fontSize: 15, color: GRN, letterSpacing: 2, margin: "0 0 14px" }}>
            ALL FOUR WHITE PAPERS CONVERGE ON ONE EQUATION
          </h3>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 16 }}>
            {[
              { col: TEAL, paper: "Synthesis WP",   insight: "R(t) = R₀ × f(σ/σ_critical) × g(history) is C(x,t) stated in cross-domain form. Same sigmoidal gate, same memory ceiling, same threshold dynamics." },
              { col: GOLD, paper: "Field Patent",   insight: "C(x,t) filed as patent Claim 2. The master equation is live engineering — vortex ring Γ, φ-harmonic lattice, and bioluminescent readout all express engine parts." },
              { col: VIO,  paper: "AQISP",          insight: "AC harmonic noise is ε Veil measured in laboratory conditions. Eliminating it raises C(x,t) — quantum sensing directly validates the suppression term." },
              { col: PINK, paper: "Brain-First",    insight: "Substrate restoration = raising S*. Metabolic noise = ε. The sequence 'restore before optimise' is literally the C(x,t) formula executed in biological time." },
            ].map((r, i) => (
              <div key={i} style={{ display: "flex", gap: 10 }}>
                <div style={{
                  width: 3, borderRadius: 2, background: r.col, flexShrink: 0, alignSelf: "stretch",
                }} />
                <div>
                  <div style={{ fontFamily: MN, fontSize: 8, color: r.col, letterSpacing: "0.2em", marginBottom: 4 }}>{r.paper}</div>
                  <p style={{ margin: 0, fontSize: 10.5, color: `${FG}bb`, lineHeight: 1.65 }}>{r.insight}</p>
                </div>
              </div>
            ))}
          </div>
          <div style={{
            textAlign: "center", padding: "14px 20px", background: `${GOLD}08`,
            border: `1px solid ${GOLD}25`, borderRadius: 6,
            fontFamily: MN, fontSize: 11, color: GOLD, letterSpacing: "0.1em", lineHeight: 1.8,
          }}>
            The AETHER Engine is not a metaphor.<br />
            <span style={{ color: DIM, fontSize: 10 }}>
              It is a formalised cross-domain coherence law that fungal networks, quantum sensors,<br />
              propulsion systems, and biological metabolism all independently rediscover.
            </span>
          </div>
        </div>

        {/* ── Footer links ── */}
        <div style={{ display: "flex", justifyContent: "center", gap: 20, flexWrap: "wrap" }}>
          {[
            { href: "/aether-engine", label: "→ AETHER Engine · Live Simulation" },
            { href: "/graph-map",     label: "→ Knowledge Graph" },
            { href: "/coherence",     label: "→ Coherence Field Theory" },
          ].map(l => (
            <a key={l.href} href={l.href} style={{
              fontFamily: MN, fontSize: 9, color: GOLD, letterSpacing: "0.25em",
              textDecoration: "none", border: `1px solid ${GOLD}33`, borderRadius: 4,
              padding: "6px 14px", opacity: 0.75,
            }}>{l.label}</a>
          ))}
        </div>

      </div>
    </div>
  );
}
