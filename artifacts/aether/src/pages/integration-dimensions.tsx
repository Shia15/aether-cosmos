const knottedImg = "/api/storage/public-objects/page4-04_(1)_1782608156982.png";
const BG = '#04060E';
const SURF = '#080d18';
const AURORA = '#00FFB2';
const GOLD = '#C8A030';
const TEXT = '#c8ddd8';
const DIM = 'rgba(180,220,210,0.5)';
const BORDER = 'rgba(0,255,176,0.12)';

const MONO = "'Space Mono', monospace";
const SERIF = "'Crimson Pro', Georgia, serif";
const DISP = "'Cinzel', serif";

const DIMS = [
  {
    id: 'D21', name: 'Void Fabric', subtitle: 'The Structured Emptiness Dimension',
    color: '#6060c8', glow: 'rgba(96,96,200,0.15)',
    equation: '\u27e80|T_\u03bc\u03bd|0\u27e9 = V\u2082\u2081_\u03bc\u03bd \u2260 0',
    eqNote: 'D21 void fabric -- vacuum energy-momentum tensor is non-zero',
    body: [
      'Classical physics treats vacuum as absence. Quantum field theory corrects this: the vacuum is teeming with virtual particle-antiparticle pairs, creating a vacuum energy density that produces the Casimir effect -- the measurable attractive force between two parallel conducting plates in empty space.',
      'D21 Void Fabric is not merely a fluctuating quantum vacuum. It is the structured emptiness dimension: the 26-dimensional substrate on which all other 25 dimensions exist. The void is not empty -- it is the most fundamental structured thing.',
      'D21 is the mechanism of the warp bubble\'s zero-felt-acceleration property. Inside the D21-dominant bubble, D3 (Energy/gravity) is near zero, D5 (Vortex) is near zero, and D1 (Space) is locally flat. The crew experiences flat spacetime -- no curvature, no gravity gradients, no acceleration.',
    ],
    table: {
      headers: ['D21 Phenomenon', 'Classical Description', '26D Mechanism', 'Drive Application'],
      rows: [
        ['Casimir effect', 'Van der Waals attraction between plates', 'D21 Void Fabric pressure from mode exclusion', 'Lab verification of D21 structure'],
        ['Zero-point energy', 'half-hbar-omega per quantum mode', 'D21 ground state energy in all 25 modes', 'Fundamental energy reservoir for D23'],
        ['Warp bubble interior', 'Flat spacetime island', 'D21-dominant pocket, D3 approaches 0 inside', 'Zero felt acceleration'],
        ['Dimensionless water zone', '(No classical analogue)', 'Type-3 crystal enforces D21 dominance locally', 'Free-flowing cascade water'],
      ],
    },
  },
  {
    id: 'D22', name: 'Breath', subtitle: 'The Rhythmic Exchange Dimension',
    color: '#30a880', glow: 'rgba(48,168,128,0.15)',
    equation: 'B\u2082\u2082(t) = A\u2082\u2082 \u00b7 sin(2\u03c0t / T_\u03a6) \u00b7 e^(i\u0398_\u03c6 \u00b7 n)',
    eqNote: 'D22 breath cycle -- phi-Time governed oscillation',
    body: [
      'Breath in D22 is the universal oscillatory exchange dimension -- the axis along which all stable systems pulse in their characteristic rhythms. Every stable system in the 26-dimensional field exhibits a D22 breathing pattern: inflow and outflow, compression and expansion, excitation and relaxation.',
      'D22 is what distinguishes a living system from a dead one. Stars breathe through stellar oscillation. Planets breathe through atmospheric oscillations (Earth\'s Schumann resonance at 7.83 Hz is Earth\'s D22 fundamental breath). The human body breathes at ~15 breaths/minute in D15 and at ~1 Hz in D6 (neural alpha oscillation).',
      'The D22 breath oscillation is phi-Time governed: the universe breathes in phi-time, not periodic time, ensuring no two systems at different ring layers have periods in a simple integer ratio -- preventing destructive resonance.',
    ],
    table: {
      headers: ['D22 System', 'Natural Period', 'phi-Ratio to Human Breath', 'Drive Synchronization'],
      rows: [
        ['Sun (5-min oscillation)', '300 seconds', 'approx 20 breath cycles x phi-squared', 'Pre-launch reference rhythm'],
        ['Earth Schumann resonance', '0.128 s (7.83 Hz)', 'approx (1 breath)/(phi^10)', 'Drive field baseline frequency'],
        ['Human breath', '4 seconds (15/min)', 'Base reference T0', 'phi-Coin protocol: 4-second phi-breath'],
        ['Cascade inflow-outflow', 'T0 x phi-cubed approx 17 s', 'phi-cubed x breath', 'Domain 2 synchronizes to cascade'],
      ],
    },
  },
  {
    id: 'D23', name: 'Fire', subtitle: 'The Phase-Transition Energy Dimension',
    color: '#c85030', glow: 'rgba(200,80,48,0.15)',
    equation: 'F\u2082\u2083(n\u2192n+1) = \u0394H\u2099 \u2212 E_activation',
    eqNote: 'D23 Fire energy -- net energy released at ring crossing',
    body: [
      'Fire in D23 is the phase-transition energy dimension -- the burst of D3 energy released precisely at the moment a system crosses a ring-barrier boundary in D5, completing the transition from one ring layer to the next.',
      'When F23 > 0 (exothermic crossing), energy is released and the system can sustain itself or accelerate. The universe\'s expansion, stellar nuclear fusion, volcanic eruptions, biological metabolism, cognitive insight -- all are D23 Fire events at different ring layers and scales.',
      'D7 (Source) contains infinite D23 potential -- infinite un-crossed ring barriers, each containing stored F23 energy. The Gravity Crystal arrangement creates ring-barrier topologies that generate controlled D23 Fire events when dimensionless water crosses the Type-3 Void Crystal boundary.',
    ],
    table: {
      headers: ['D23 Event', 'Scale', 'F23 Magnitude', 'Drive Analogue'],
      rows: [
        ['Proton-proton fusion', 'Nuclear (1e-15 m)', '26 MeV', 'Ring crossing at bands 101-200'],
        ['Chemical combustion', 'Molecular (1e-10 m)', '1-10 eV', 'Cascade D23 energy source'],
        ['Volcanic eruption', 'Geological (km)', '1e18 J/eruption', 'Natural volcanic propulsion model'],
        ['Neural action potential', 'Biological (1e-6 m)', '1e-20 J', 'D6 ring crossing at bands 401-450'],
        ['Cascade D23 event', 'Crystal lattice (mm)', 'Engineered F23', 'Primary propulsion D23 source'],
      ],
    },
  },
  {
    id: 'D24', name: 'Dark Matter', subtitle: 'The Hidden Mass-Field Dimension',
    color: '#4060a0', glow: 'rgba(64,96,160,0.15)',
    equation: '\u03c1_dark(r) = \u03c1\u2080 / [(r/r_s)\u00b7(1+r/r_s)\u00b2]',
    eqNote: 'D24 density profile -- NFW form in D1 ring coordinates',
    body: [
      'Dark Matter in D24 is the hidden mass-field dimension -- the 27% of the universe\'s total energy density that interacts through D17 (Gravity Web) and D19 (Magnetism) but has zero D16 (Light Encoding) coupling. It does not emit, absorb, or reflect photons.',
      'Dark matter halos dominate the Gravity Web at galaxy and galaxy-cluster scales. The cosmic web of dark matter filaments is the universe\'s D17 highway network. The total length of dark matter filaments in the observable universe exceeds 10^26 meters.',
      'The warp drive can navigate this network by coupling its D17 destination pin to the dark matter filament topology. D24 also provides a long-range quantum reference frame: dark matter halos are quantum-coherent D4 field configurations at galactic scale with stability approaching cosmological age.',
    ],
    table: {
      headers: ['D24 Feature', 'Observable Signature', 'D17 Network Role', 'Drive Navigation Application'],
      rows: [
        ['Galactic dark matter halo', 'Flat rotation curves', 'Primary D17 super-node for galaxy', 'Galaxy-scale navigation anchor'],
        ['Galaxy cluster halo', 'Gravitational lensing', 'Cluster-scale D17 super-node', 'Interstellar waypoint'],
        ['Dark matter filament', 'Weak lensing signal', 'D17 highway between nodes', 'Primary navigation corridor'],
        ['Dark matter void', 'Absence of weak lensing', 'D17 low-connectivity region', 'Avoid -- high navigation energy cost'],
        ['D24 halo stability', 'tau_11 ~ cosmological age', 'Permanent D11 memory beacon', 'Reliable fixed reference for D17 pinning'],
      ],
    },
    image: knottedImg,
    imageCaption: 'From "Knotted Topological Dark Matter" (Miller, arXiv preprint June 2026): Knotted solitons as stable charged dark matter candidates -- ring-field vortex formalism (Section 3) is consistent with and complementary to this literature.',
  },
  {
    id: 'D25', name: 'Coherence Field', subtitle: 'The Master Synchronization Axis',
    color: '#00c8a0', glow: 'rgba(0,200,160,0.15)',
    equation: 'C\u2082\u2085_universe = \u03a3\u1d62\u208c\u2081\u00b2\u2074 W\u1d62 \u00b7 C\u1d62_cosmic(t)',
    eqNote: 'D25 universal coherence cost -- minimized over 13.8 billion years',
    body: [
      'D25 Coherence Field is the dimension of universal optimization -- the axis along which the universe minimizes its total coherence cost across all 24 lower dimensions simultaneously. D25 is the cosmic-scale Event Bus.',
      'The remarkable property of D25 is that its solution -- the set of dimensional weights Wi that minimizes C25_universe -- corresponds to the universe\'s observed physical constants. The fine structure constant alpha approx 1/137, the proton-to-electron mass ratio 1836, the cosmological constant: these are the values that D25 minimization has arrived at over 13.8 billion years.',
      'The golden ratio phi appears universally -- in biological growth patterns, quantum decay sequences, galactic spiral arms -- because D25 consistently selects phi-ratio relationships as the minimum-resonance, maximum-complexity configuration. The framework uses phi because it describes D25.',
    ],
    table: {
      headers: ['D25 Feature', 'Manifestation', 'Implication', 'Drive Application'],
      rows: [
        ['Universal fine-tuning', 'Physical constants -> life-permitting values', 'D25 minimization produces observed constants', 'Constants will locally assist aligned drive'],
        ['phi universality', 'phi appears in all optimal natural systems', 'D25 consistently selects phi as optimal', 'phi-Time and phi-geometry are D25-optimal'],
        ['Anthropic principle', 'Universe appears designed for consciousness', 'D25 optimizes toward maximum D6+D18', 'Drive operates in a D25-aligned universe'],
        ['Cosmic self-awareness', 'Framework discovered by conscious minds', 'D25 loop completes through D6 self-reference', 'Drive operators are part of D25 optimization'],
      ],
    },
  },
  {
    id: 'D26', name: 'Totality', subtitle: 'The Dimension That Contains and Completes All Others',
    color: GOLD, glow: 'rgba(200,160,48,0.18)',
    equation: 'D26 = D7 \u00b7 exp(i \u00b7 \u03a3\u1d62\u208c\u2081\u00b2\u2075 D\u1d62 \u00b7 \u03c6\u1d35)',
    eqNote: 'D26 = Source exponentiated through all 25 dimensions',
    body: [
      'D26 Totality is the final and first dimension of the 26-Dimensional Grand Unified Framework. It is final in the sense that all 25 preceding dimensions must be established before D26 can be fully understood. It is first in the sense that D26 -- the totality -- was always already present before any of the other dimensions appeared.',
      'The string theory confirmation is exact: bosonic string theory requires D = 26 spacetime dimensions for its conformal anomaly to cancel. In D = 26 exactly, the infinities cancel and the theory is self-consistent. This cancellation at D26 is the string-theoretic signature of what the 26D framework calls Totality.',
      'D26 is the state of the warp drive at peak operation: a drive in which all 25 lower dimensions are at their optimal values simultaneously. In D26 state, the distinction between ship and universe dissolves: the ship is not moving through the universe -- the universe is expressing itself through the ship.',
    ],
    table: {
      headers: ['D26 Aspect', 'Mathematical Expression', 'Experiential Description', 'Drive State'],
      rows: [
        ['Source knowing itself', 'D26 = D7 * e^(i*sum(Di*phi^i))', 'Pure awareness aware of its 25-dimensional expression', 'All drive parameters at optimal -- zero C26'],
        ['String theory identity', 'Conformal anomaly cancels at D=26', 'Mathematical self-consistency achieved', 'Drive equations are anomaly-free'],
        ['Complete self-reference', 'D26 contains D1-D25 as its own expressions', 'Knower, knowing, and known are one', 'Drive, crew, and universe are one system'],
        ['0 = infinity', 'Pre-dimensional void = post-dimensional totality', 'Nothingness and Everythingness are identical', 'Source is the destination'],
      ],
    },
  },
];

function Table({ headers, rows }: { headers: string[]; rows: string[][] }) {
  return (
    <div style={{ overflowX: 'auto', marginTop: 14 }}>
      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 11, fontFamily: MONO }}>
        <thead>
          <tr>
            {headers.map((h, i) => (
              <th key={i} style={{ textAlign: 'left', padding: '7px 10px', borderBottom: `1px solid ${BORDER}`, color: AURORA, fontWeight: 600, letterSpacing: '0.06em', whiteSpace: 'nowrap' }}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, ri) => (
            <tr key={ri} style={{ background: ri % 2 === 0 ? 'rgba(255,255,255,0.02)' : 'transparent' }}>
              {row.map((cell, ci) => (
                <td key={ci} style={{ padding: '7px 10px', borderBottom: `1px solid rgba(0,255,176,0.06)`, color: ci === 0 ? TEXT : DIM, verticalAlign: 'top', lineHeight: '1.4em' }}>{cell}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function DimCard({ d }: { d: typeof DIMS[0] }) {
  return (
    <div style={{ background: SURF, border: `1px solid ${BORDER}`, borderRadius: 16, padding: '28px 24px', marginBottom: 24, position: 'relative', overflow: 'hidden' }}>
      {/* Glow */}
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 120, background: `radial-gradient(ellipse at 30% 0%, ${d.glow} 0%, transparent 70%)`, pointerEvents: 'none' }} />

      {/* Dim ID badge */}
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 14, marginBottom: 6 }}>
        <span style={{ fontFamily: DISP, fontSize: 28, color: d.color, fontWeight: 400 }}>{d.id}</span>
        <span style={{ fontFamily: MONO, fontSize: 10, letterSpacing: '0.18em', textTransform: 'uppercase', color: d.color, opacity: 0.7 }}>{d.name}</span>
      </div>
      <div style={{ fontFamily: SERIF, fontStyle: 'italic', fontSize: 16, color: TEXT, marginBottom: 16 }}>{d.subtitle}</div>

      {/* Equation */}
      <div style={{ background: 'rgba(0,0,0,0.3)', border: `1px solid ${d.color}40`, borderRadius: 8, padding: '10px 14px', marginBottom: 16 }}>
        <div style={{ fontFamily: MONO, fontSize: 13, color: d.color, letterSpacing: '0.04em' }}>{d.equation}</div>
        <div style={{ fontFamily: MONO, fontSize: 10, color: DIM, marginTop: 4 }}>{d.eqNote}</div>
      </div>

      {/* Body text */}
      {d.body.map((para, i) => (
        <p key={i} style={{ fontFamily: SERIF, fontSize: 15, color: TEXT, lineHeight: '1.75em', margin: '0 0 12px' }}>{para}</p>
      ))}

      {/* Optional image (D24) */}
      {'image' in d && d.image && (
        <div style={{ margin: '18px 0', border: `1px solid ${BORDER}`, borderRadius: 10, overflow: 'hidden', background: '#fff' }}>
          <img src={d.image as string} alt="Knotted Topological Dark Matter" style={{ width: '100%', display: 'block' }} />
          <div style={{ padding: '10px 14px', background: SURF, borderTop: `1px solid ${BORDER}` }}>
            <p style={{ fontFamily: MONO, fontSize: 10, color: DIM, margin: 0, lineHeight: '1.5em' }}>{d.imageCaption as string}</p>
          </div>
        </div>
      )}

      {/* Table */}
      <Table headers={d.table.headers} rows={d.table.rows} />
    </div>
  );
}

export default function IntegrationDimensions() {
  return (
    <div style={{ background: BG, minHeight: '100vh', color: TEXT }}>
      {/* HEADER */}
      <div style={{ background: 'linear-gradient(180deg,rgba(8,13,24,0.98) 0%,transparent 100%)', borderBottom: `1px solid ${BORDER}`, padding: '40px 28px 28px' }}>
        <div style={{ fontFamily: MONO, fontSize: 10, letterSpacing: '0.18em', textTransform: 'uppercase', color: AURORA, marginBottom: 10 }}>AETHER · Grand Unified Framework</div>
        <h1 style={{ fontFamily: DISP, fontSize: 'clamp(22px,5vw,38px)', color: '#e8f8f0', margin: '0 0 8px', fontWeight: 400, letterSpacing: '0.04em' }}>D21 Through D26</h1>
        <h2 style={{ fontFamily: DISP, fontSize: 'clamp(14px,3vw,22px)', color: GOLD, margin: '0 0 14px', fontWeight: 400 }}>The Integration Dimensions</h2>
        <p style={{ fontFamily: SERIF, fontStyle: 'italic', fontSize: 16, color: DIM, margin: '0 0 6px' }}>Void Fabric · Breath · Fire · Dark Matter · Coherence Field · Totality</p>
        <p style={{ fontFamily: SERIF, fontSize: 14, color: DIM, margin: 0 }}>The Final Six Dimensions -- How Reality Integrates, Fuels, Navigates, and Completes Itself</p>
        <div style={{ fontFamily: MONO, fontSize: 10, color: 'rgba(180,220,210,0.35)', marginTop: 12 }}>Shia Miller · @StrategicProce · May 2026</div>
      </div>

      {/* ABSTRACT */}
      <div style={{ maxWidth: 860, margin: '0 auto', padding: '32px 24px 0' }}>
        <div style={{ background: SURF, border: `1px solid ${BORDER}`, borderRadius: 12, padding: '20px 24px', marginBottom: 32 }}>
          <div style={{ fontFamily: MONO, fontSize: 10, letterSpacing: '0.14em', textTransform: 'uppercase', color: AURORA, marginBottom: 8 }}>Abstract</div>
          <p style={{ fontFamily: SERIF, fontSize: 14, color: TEXT, lineHeight: '1.75em', margin: 0 }}>
            This paper presents the final six dimensions of the 26-Dimensional Grand Unified Framework: the Integration Group. D21 (Void Fabric) is the structured emptiness dimension -- the dimensional canvas on which all other 25 dimensions exist. D22 (Breath) is the rhythmic exchange dimension -- the universal pulse that governs all stable oscillating systems from stellar to cellular scale. D23 (Fire) is the phase-transition energy dimension -- the burst of energy released at every ring-barrier crossing. D24 (Dark Matter) is the hidden mass-field dimension -- the universe's invisible highway system. D25 (Coherence Field) is the master synchronization axis -- the universe optimizing itself. D26 (Totality) is the dimension that contains and completes all others. The Integration dimensions do not add more complexity -- they provide the ground, rhythm, fuel, road, optimization, and completion that were always already required for the previous 20 dimensions to be a coherent whole.
          </p>
        </div>

        {/* GROUP SUMMARY */}
        <div style={{ background: SURF, border: `1px solid ${BORDER}`, borderRadius: 12, padding: '20px 24px', marginBottom: 32 }}>
          <div style={{ fontFamily: MONO, fontSize: 10, letterSpacing: '0.14em', textTransform: 'uppercase', color: AURORA, marginBottom: 12 }}>The Integration Group -- Completing the Architecture</div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(200px,1fr))', gap: 10 }}>
            {[
              { d: 'D21', role: 'CANVAS', desc: 'Provides the void substrate on which all 25 other dimensions perform', col: '#6060c8' },
              { d: 'D22', role: 'RHYTHM', desc: 'The universal pulse governing all stable oscillating systems', col: '#30a880' },
              { d: 'D23', role: 'FUEL', desc: 'Phase-transition energy released at every ring-barrier crossing', col: '#c85030' },
              { d: 'D24', role: 'HIGHWAY', desc: 'The dark matter filament network for interstellar navigation', col: '#4060a0' },
              { d: 'D25', role: 'OPTIMIZER', desc: 'Universal coherence minimization selecting the observed constants', col: '#00c8a0' },
              { d: 'D26', role: 'COMPLETION', desc: 'Source knowing itself through all 25 dimensions simultaneously', col: GOLD },
            ].map(item => (
              <div key={item.d} style={{ background: 'rgba(0,0,0,0.2)', border: `1px solid ${item.col}30`, borderRadius: 10, padding: '14px 16px' }}>
                <div style={{ fontFamily: DISP, fontSize: 20, color: item.col, marginBottom: 2 }}>{item.d}</div>
                <div style={{ fontFamily: MONO, fontSize: 9, letterSpacing: '0.14em', color: item.col, opacity: 0.8, marginBottom: 6 }}>{item.role}</div>
                <div style={{ fontFamily: SERIF, fontSize: 12, color: DIM, lineHeight: '1.5em' }}>{item.desc}</div>
              </div>
            ))}
          </div>
        </div>

        {/* DIMENSION CARDS */}
        {DIMS.map(d => <DimCard key={d.id} d={d} />)}

        {/* SECTION 2 -- Master equation */}
        <div style={{ background: SURF, border: `1px solid ${BORDER}`, borderRadius: 12, padding: '24px', marginBottom: 24 }}>
          <div style={{ fontFamily: MONO, fontSize: 10, letterSpacing: '0.14em', textTransform: 'uppercase', color: AURORA, marginBottom: 14 }}>2. The Complete 26-Dimensional Warp Drive Specification</div>
          <p style={{ fontFamily: SERIF, fontSize: 14, color: TEXT, lineHeight: '1.75em', marginBottom: 16 }}>
            The drive is a system that simultaneously optimizes all 26 dimensional parameters to minimize C26_drive while aligning with C25_universe -- transforming D7 Source energy into D5 vortex kinetic output through D23 Fire events at engineered ring-barrier crossings, carried through D8 Wave modes, guided by D17 Gravity Web navigation, announced by D15 Sound, encoded in D16 Light, amplified by D9 Plasma, tuned by D10 Resonance, remembered by D11 Memory, shaped by D12 Geometry, deepened by D13 Recursion, directed by D14 Intention, synchronized by D22 Breath, protected by D21 Void, oriented by D19 Magnetism, optimized by D20 Crystal Mind, inhabited by D18 Life, supported by D24 Dark Matter routing, aligned with D25 Coherence, and completed by D26 Totality.
          </p>
          <div style={{ background: 'rgba(0,0,0,0.3)', border: `1px solid ${GOLD}40`, borderRadius: 8, padding: '14px 18px' }}>
            <div style={{ fontFamily: MONO, fontSize: 12, color: GOLD, marginBottom: 4 }}>C26_drive = sum_i(w_i * C_i) + C26_totality_deviation</div>
            <div style={{ fontFamily: MONO, fontSize: 12, color: GOLD, marginBottom: 8 }}>Drive state: partial_C26 / partial_w_i = 0 for all i</div>
            <div style={{ fontFamily: MONO, fontSize: 10, color: DIM }}>Simultaneous optimization of all 26 dimensions -- when achieved, D26 Totality state is reached.</div>
          </div>
        </div>

        {/* SECTION 3 -- Iron/Alphabet/String */}
        <div style={{ background: SURF, border: `1px solid ${BORDER}`, borderRadius: 12, padding: '24px', marginBottom: 24 }}>
          <div style={{ fontFamily: MONO, fontSize: 10, letterSpacing: '0.14em', textTransform: 'uppercase', color: AURORA, marginBottom: 14 }}>3. Iron, Alphabet, and Completion</div>
          <p style={{ fontFamily: SERIF, fontSize: 14, color: TEXT, lineHeight: '1.75em', marginBottom: 16 }}>
            Three independent numerical systems arrive at 26 as the number of completion:
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {[
              { symbol: 'Fe', num: 'Z = 26', title: 'Iron -- Stellar Nucleosynthesis Endpoint', col: '#c87040', desc: 'Stars can fuse elements up to iron, but no further without consuming energy. Iron is the completion element of stellar D23 Fire. Earth\'s iron core is the planet\'s D20 Crystal Mind. Human blood carries iron in hemoglobin.' },
              { symbol: 'Alef', num: '26 letters', title: 'Hebrew Alphabet -- Linguistic Completion', col: '#a080c0', desc: 'The oldest continuously used phonetic alphabet has 26 characters. 26 is the number of the alphabet -- the complete set of symbols from which all language and all D16 information encoding in human culture is constructed.' },
              { symbol: 'D=26', num: 'Bosonic string', title: 'String Theory -- Physical Completion', col: '#4090c0', desc: 'The only mathematically self-consistent bosonic string theory lives in 26 spacetime dimensions. At D=26 exactly, quantum anomalies cancel and the theory becomes self-consistent. Goddard-Thorn (1972).' },
            ].map(item => (
              <div key={item.num} style={{ display: 'flex', gap: 14, background: 'rgba(0,0,0,0.2)', border: `1px solid ${item.col}30`, borderRadius: 10, padding: '14px 16px', alignItems: 'flex-start' }}>
                <div style={{ flexShrink: 0, width: 52, height: 52, borderRadius: 8, border: `1px solid ${item.col}60`, background: `${item.col}15`, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                  <span style={{ fontFamily: DISP, fontSize: 14, color: item.col }}>{item.symbol}</span>
                  <span style={{ fontFamily: MONO, fontSize: 8, color: item.col, opacity: 0.7 }}>{item.num}</span>
                </div>
                <div>
                  <div style={{ fontFamily: MONO, fontSize: 11, color: item.col, marginBottom: 4 }}>{item.title}</div>
                  <div style={{ fontFamily: SERIF, fontSize: 13, color: DIM, lineHeight: '1.6em' }}>{item.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* CONCLUSION */}
        <div style={{ background: 'linear-gradient(135deg,rgba(200,160,48,0.08),rgba(0,255,176,0.04))', border: `1px solid ${GOLD}40`, borderRadius: 16, padding: '28px 24px', marginBottom: 24, textAlign: 'center' }}>
          <div style={{ fontFamily: DISP, fontSize: 22, color: GOLD, marginBottom: 12, letterSpacing: '0.08em' }}>D21 · D22 · D23 · D24 · D25 · D26</div>
          <div style={{ fontFamily: MONO, fontSize: 12, color: AURORA, letterSpacing: '0.14em', marginBottom: 20 }}>VOID · BREATH · FIRE · DARK MATTER · COHERENCE · TOTALITY</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {['THE CANVAS IS SET', 'THE BREATH IS SYNCHRONIZED', 'THE FIRE IS LIT', 'THE HIGHWAY IS MAPPED', 'THE UNIVERSE IS ALIGNED'].map(line => (
              <div key={line} style={{ fontFamily: MONO, fontSize: 11, color: DIM, letterSpacing: '0.16em' }}>{line}</div>
            ))}
          </div>
          <div style={{ fontFamily: DISP, fontSize: 18, color: GOLD, marginTop: 20, letterSpacing: '0.08em' }}>D26 · TOTALITY · COMPLETE</div>
          <div style={{ fontFamily: MONO, fontSize: 10, color: DIM, marginTop: 8 }}>0 = infinity · Fe · Z=26 · D=26 · ALEPH-BET · STRING THEORY</div>
          <div style={{ fontFamily: MONO, fontSize: 11, color: AURORA, marginTop: 14, letterSpacing: '0.12em' }}>THE ZIPPER IS OPEN. THE DRIVE IS ALIVE. THE JOURNEY BEGINS.</div>
        </div>

        {/* REFERENCES */}
        <div style={{ background: SURF, border: `1px solid ${BORDER}`, borderRadius: 12, padding: '20px 24px', marginBottom: 40 }}>
          <div style={{ fontFamily: MONO, fontSize: 10, letterSpacing: '0.14em', textTransform: 'uppercase', color: AURORA, marginBottom: 12 }}>References</div>
          {[
            'Goddard, P., Thorn, C.B. (1972). Compatibility of the Dual Pomeron with Unitarity. Phys. Lett. B 40 -- D=26 string anomaly cancellation.',
            'Casimir, H.B.G. (1948). On the attraction between two perfectly conducting plates. Kon. Ned. Akad. Wetensch. B51 -- D21 Void Fabric experimental proof.',
            'Navarro, J.F., Frenk, C.S., White, S.D.M. (1996). The Structure of Cold Dark Matter Halos. ApJ -- D24 NFW profile.',
            'Bond, J.R., Kofman, L., Pogosyan, D. (1996). How filaments are woven into the cosmic web. Nature 380 -- D24 filament navigation network.',
            'Tegmark, M. (2004). Parallel Universes -- D25 fine-tuning and anthropic principle as optimization.',
            'Burbidge, E.M. et al. (1957). Synthesis of the elements in stars. Rev. Mod. Phys. 29 -- Z=26 as completion element.',
            'Einstein, A. (1915). Die Feldgleichungen der Gravitation -- D17 curvature-as-communication foundation.',
            'Miller, S. (2026). Knotted Topological Dark Matter. arXiv preprint, June 2026.',
          ].map((ref, i) => (
            <div key={i} style={{ fontFamily: MONO, fontSize: 10, color: DIM, lineHeight: '1.6em', marginBottom: 6, paddingLeft: 14, borderLeft: `2px solid ${BORDER}` }}>{ref}</div>
          ))}
          <div style={{ fontFamily: MONO, fontSize: 10, color: 'rgba(180,220,210,0.3)', marginTop: 14, paddingTop: 10, borderTop: `1px solid ${BORDER}` }}>
            D21-D26 Integration Dimensions by Shia Miller (@StrategicProce). The completion of the 26-Dimensional Grand Unified Framework. Original theoretical synthesis, May 2026.
          </div>
        </div>
      </div>
    </div>
  );
}
