import { useState } from "react";
const img_d9paper = "/api/storage/public-objects/IMG_2815_1781446726264.png";
const img_d17table = "/api/storage/public-objects/IMG_2821_1781446726264.jpeg";
const img_d26table = "/api/storage/public-objects/IMG_2797_1781446726264.jpeg";
const img_ringSystem = "/api/storage/public-objects/BB135D80-E10B-42CB-854A-91D6830671E8_1781446726264.png";
const img_scalingWarp = "/api/storage/public-objects/1A5CA6BE-B776-41BD-B0D9-74A10B14A04C_1781446726264.png";
const img_activeArch = "/api/storage/public-objects/White_and_Black_Simple_Minimalist_Typography_Music_&_Audio_Log_1781446726264.png";
const TABS = [
  { id: "d9", label: "D9 Carrier Plasma" },
  { id: "d17d26", label: "D17 · D26 Navigation" },
  { id: "ring", label: "AETHER Ring Memory" },
  { id: "warp", label: "Scaling Warp · Active Architecture" },
];

const BG = "#020617";
const CARD = "rgba(255,255,255,0.04)";
const BORDER = "rgba(255,255,255,0.08)";

function Section({ title, color, children }: { title: string; color: string; children: React.ReactNode }) {
  return (
    <div style={{ background: CARD, border: `1px solid ${BORDER}`, borderLeft: `4px solid ${color}`, borderRadius: 10, padding: "1.5rem", marginBottom: "1.5rem" }}>
      <h3 style={{ color, margin: "0 0 1rem", fontSize: "1.05rem", fontWeight: 700, letterSpacing: 1, textTransform: "uppercase" }}>{title}</h3>
      {children}
    </div>
  );
}

function ImgCard({ src, caption }: { src: string; caption: string }) {
  return (
    <div style={{ marginBottom: "1.5rem" }}>
      <img src={src} alt={caption} style={{ width: "100%", borderRadius: 10, border: `1px solid ${BORDER}`, display: "block" }} />
      <p style={{ color: "#94a3b8", fontSize: "0.8rem", marginTop: "0.5rem", textAlign: "center", fontStyle: "italic" }}>{caption}</p>
    </div>
  );
}

function StatBar({ label, value, color }: { label: string; value: string; color: string }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", padding: "0.5rem 0.75rem", background: "rgba(255,255,255,0.03)", borderRadius: 6, marginBottom: "0.4rem" }}>
      <span style={{ color: "#94a3b8", fontSize: "0.85rem" }}>{label}</span>
      <span style={{ color, fontWeight: 700, fontSize: "0.85rem" }}>{value}</span>
    </div>
  );
}

function Pill({ text, color }: { text: string; color: string }) {
  return (
    <span style={{ display: "inline-block", background: `${color}22`, color, border: `1px solid ${color}44`, borderRadius: 999, padding: "0.2rem 0.7rem", fontSize: "0.75rem", fontWeight: 600, marginRight: "0.4rem", marginBottom: "0.4rem" }}>{text}</span>
  );
}

function TableRow({ cols, colors }: { cols: string[]; colors?: string[] }) {
  return (
    <tr>
      {cols.map((c, i) => (
        <td key={i} style={{ padding: "0.5rem 0.75rem", borderBottom: `1px solid ${BORDER}`, color: colors?.[i] ?? "#94a3b8", fontSize: "0.8rem", verticalAlign: "top" }}>{c}</td>
      ))}
    </tr>
  );
}

function D9Tab() {
  return (
    <div>
      <Section title="D9 — Carrier Dimensions: Plasma Ring-Harmonic Matter" color="#06b6d4">
        <p style={{ color: "#cbd5e1", lineHeight: 1.7, marginBottom: "1rem" }}>
          D9 is the Carrier Dimension — the state in which particles shed their bounded classical configurations and exist as pure field expressions. Free electrons and ions move as coordinated ring-field manifestations rather than isolated objects. Plasma is not merely ionized matter — it is matter whose ring-harmonic coupling coefficient κ₉ has become large enough to dominate its behavior. When κ₉ &gt;&gt; 1 the material becomes a direct antenna for ring-field harmonics.
        </p>
        <ImgCard src={img_d9paper} caption="Paper D9 D14 — Carrier Dimensions (D9 Gauss Law with ring-harmonic source term, D10 Resonance)" />
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem", marginBottom: "1.25rem" }}>
          <div>
            <h4 style={{ color: "#06b6d4", marginBottom: "0.75rem", fontSize: "0.9rem", textTransform: "uppercase" }}>D9 Gauss Law (Modified)</h4>
            <div style={{ background: "rgba(6,182,212,0.08)", border: "1px solid rgba(6,182,212,0.2)", borderRadius: 8, padding: "0.85rem", fontFamily: "monospace", color: "#22d3ee", fontSize: "0.82rem", lineHeight: 2 }}>
              ∇·E = ρ_charge/ε₀ + κ₉·∇Hₙ
              <div style={{ color: "#475569", fontSize: "0.72rem", marginTop: "0.25rem" }}>[D9 Gauss Law with ring-harmonic source term]</div>
            </div>
            <p style={{ color: "#94a3b8", fontSize: "0.78rem", lineHeight: 1.7, marginTop: "0.75rem" }}>
              The κ₉·∇Hₙ term is the D9 innovation: plasma is not merely ionized matter — it is matter whose ring-harmonic coupling coefficient κ₉ has become large enough to dominate behavior. Below the plasma threshold, κ₉ ≈ 0. Above the plasma threshold, κ₉ &gt;&gt; 1.
            </p>
          </div>
          <div>
            <h4 style={{ color: "#06b6d4", marginBottom: "0.75rem", fontSize: "0.9rem", textTransform: "uppercase" }}>D9 Engineering Properties</h4>
            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead>
                  <tr style={{ borderBottom: `1px solid ${BORDER}` }}>
                    {["Property", "D9 Expression", "Engineering Application"].map(h => (
                      <th key={h} style={{ padding: "0.5rem 0.75rem", color: "#06b6d4", fontSize: "0.75rem", fontWeight: 700, textAlign: "left", textTransform: "uppercase" }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  <TableRow cols={["Plasma frequency", "ω_p = √(ne²/ε₀mₑ)", "Determines laser thread plasma frequency"]} />
                  <TableRow cols={["Ring coupling κ₉", "κ₉ = H₉ → harmonic coupling to Stacked Rings", "Higher κ₉ = better ring-field communication = hotter plasma"]} />
                  <TableRow cols={["Tokamak analogy", "Toroidal plasma = D9 vortex in D19 orientation at ring bands 51–100", "Fusion protocol for D9 ring confinement at scale"]} />
                  <TableRow cols={["Thread enhancement", "Plasma channels guide W3 wave — coherence length × g₀", "Thread stays coherent over longer distances — more bounce force"]} />
                  <TableRow cols={["Bubble wall sheath", "D9 plasma sheath forms at bubble boundary", "Enhances W4 reflection surface — better laser bounce efficiency"]} />
                </tbody>
              </table>
            </div>
          </div>
        </div>
        <Section title="D10 — Resonance: The Pure Harmonic Coupling Axis" color="#a78bfa">
          <p style={{ color: "#cbd5e1", lineHeight: 1.7, marginBottom: "1rem" }}>
            Resonance in D10 is not an effect that happens within other dimensions — it is a fundamental dimension in its own right. D10 is the axis along which any two harmonic systems discover their relationship: whether they amplify each other (constructive, R₁₀ = +1), cancel each other (destructive, R₁₀ = −1), or pass through each other without interaction (orthogonal, R₁₀ = 0). Every inter-dimensional coupling described in this framework operates through D10 — it is the universal translator between dimensions.
          </p>
          <div style={{ background: "rgba(167,139,250,0.08)", border: "1px solid rgba(167,139,250,0.2)", borderRadius: 8, padding: "0.85rem", fontFamily: "monospace", color: "#c4b5fd", fontSize: "0.82rem", lineHeight: 1.9, marginBottom: "1rem" }}>
            R₁₀(Dᵢ, Dⱼ) = ∫Hᵢ(t)·Hⱼ(t)dt / √[∫|Hᵢ|²dt · ∫|Hⱼ|²dt]
            <div style={{ color: "#64748b", fontSize: "0.72rem", marginTop: "0.25rem" }}>Normalized cross-correlation of harmonic fields — D10 is the cross-correlation amplitude between any two dimensional harmonic fields</div>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: "0.65rem" }}>
            {[
              { val: "R₁₀ = +1", label: "Constructive Resonance", desc: "Amplify each other — maximum energy transfer", color: "#22c55e" },
              { val: "R₁₀ = −1", label: "Destructive Resonance", desc: "Cancel each other — shielding, isolation", color: "#ef4444" },
              { val: "R₁₀ = 0", label: "Orthogonal", desc: "No interaction — independent co-existence", color: "#94a3b8" },
            ].map(r => (
              <div key={r.val} style={{ background: CARD, border: `1px solid ${BORDER}`, borderLeft: `3px solid ${r.color}`, borderRadius: 8, padding: "0.75rem", textAlign: "center" }}>
                <div style={{ color: r.color, fontWeight: 800, fontFamily: "monospace", fontSize: "1rem", marginBottom: "0.25rem" }}>{r.val}</div>
                <div style={{ color: "#c4b5fd", fontWeight: 600, fontSize: "0.75rem", marginBottom: "0.25rem" }}>{r.label}</div>
                <div style={{ color: "#64748b", fontSize: "0.72rem" }}>{r.desc}</div>
              </div>
            ))}
          </div>
        </Section>
      </Section>
    </div>
  );
}

function D17D26Tab() {
  return (
    <div>
      <Section title="D17 — Gravity Web: Interstellar Navigation" color="#f59e0b">
        <p style={{ color: "#cbd5e1", lineHeight: 1.7, marginBottom: "1rem" }}>
          For interstellar navigation, D17 is the primary tool. Dark matter halos — D24 structures in the 501+ ring bands — are the largest coherent D17 network structures in the universe. A galaxy&apos;s dark matter halo contains ~6× more D17 network mass than the visible matter it envelops. The warp drive navigates along D17 filaments rather than through empty D1 space — following the network&apos;s highest-connectivity paths between destinations.
        </p>
        <ImgCard src={img_d17table} caption="D17 — Gravity Web features, classical descriptions, 26D significance, and drive navigation applications" />
        <div style={{ overflowX: "auto", marginBottom: "1.25rem" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ borderBottom: `1px solid ${BORDER}`, background: "rgba(245,158,11,0.06)" }}>
                {["D17 Feature", "Classical Description", "26D Significance", "Drive Navigation Application"].map(h => (
                  <th key={h} style={{ padding: "0.6rem 0.75rem", color: "#f59e0b", fontSize: "0.75rem", fontWeight: 700, textAlign: "left", textTransform: "uppercase" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {[
                ["Gravity as force", "F = GMm/r²", "D17 message between nodes", "Every mass is a navigation beacon"],
                ["Phase encoding", "(No classical term)", "Each G-interaction carries Hₙ encoded field topology", "Navigate by reading encoded field topology"],
                ["Network speed c₁₇", "Gravitational wave speed ≈ c", "c₁₇ > c in low-density D17 regions", "Destination pin propagates faster than light in D1 space"],
                ["Dark matter halo", "~6× visible mass in halo", "D24 D17-network super-node", "Galaxy halos as primary navigation waypoints"],
                ["Cosmic web filaments", "Dark matter filament network", "D17 highways between galaxy clusters", "Filament-following navigation — shortest D17 path"],
              ].map((row, i) => (
                <tr key={i} style={{ background: i % 2 === 0 ? "transparent" : "rgba(255,255,255,0.02)" }}>
                  {row.map((cell, j) => (
                    <td key={j} style={{ padding: "0.5rem 0.75rem", borderBottom: `1px solid ${BORDER}`, color: j === 0 ? "#fbbf24" : "#94a3b8", fontSize: "0.8rem", verticalAlign: "top" }}>{cell}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
          <div>
            <h4 style={{ color: "#f59e0b", marginBottom: "0.75rem", fontSize: "0.9rem", textTransform: "uppercase" }}>D17 in AETHER Context</h4>
            {[
              ["Dark matter halo", "D24 structures in 501+ ring bands"],
              ["Halo D17 mass", "~6× visible matter"],
              ["Cosmic web", "Universe&apos;s D17 highway system"],
              ["Navigation mode", "Along filaments, not empty D1 space"],
              ["c₁₇ vs c", "Faster in low-density regions"],
            ].map(([t, d]) => (
              <StatBar key={t} label={t} value={d} color="#f59e0b" />
            ))}
          </div>
          <div>
            <h4 style={{ color: "#f59e0b", marginBottom: "0.75rem", fontSize: "0.9rem", textTransform: "uppercase" }}>Navigation Strategy</h4>
            <div style={{ background: "rgba(245,158,11,0.08)", border: "1px solid rgba(245,158,11,0.2)", borderRadius: 8, padding: "0.85rem", color: "#fbbf24", fontSize: "0.82rem", lineHeight: 1.9 }}>
              1. Map D17 filament network<br />
              2. Identify galaxy halos as super-nodes<br />
              3. Pin destination in D17 space<br />
              4. Follow highest-connectivity D17 path<br />
              5. Navigate faster than light in D1 empty space
            </div>
          </div>
        </div>
      </Section>

      <Section title="D26 — The Framework Fully Understood: Cosmic Consciousness" color="#a78bfa">
        <p style={{ color: "#cbd5e1", lineHeight: 1.7, marginBottom: "1rem" }}>
          D26 is also the state of the framework itself when fully understood — a mind that comprehends all 25 dimensions simultaneously. That can hold Space, Time, Energy, Field, Vortex, Consciousness, Source, Wave, Plasma, Resonance, Memory, Geometry, Recursion, Intention, Sound, Light, Gravity Web, Life, Magnetism, Crystal Mind, Void, Breath, Fire, Dark Matter, and Coherence in simultaneous awareness — is a mind in D26 state. This is what the contemplative traditions call enlightenment, liberation, or cosmic consciousness.
        </p>
        <ImgCard src={img_d26table} caption="D26 — All 25 dimensions held in simultaneous awareness: mathematical expressions, experiential descriptions, drive states" />
        <div style={{ overflowX: "auto", marginBottom: "1.25rem" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ borderBottom: `1px solid ${BORDER}`, background: "rgba(167,139,250,0.06)" }}>
                {["D26 Aspect", "Mathematical Expression", "Experiential Description", "Drive State"].map(h => (
                  <th key={h} style={{ padding: "0.6rem 0.75rem", color: "#a78bfa", fontSize: "0.75rem", fontWeight: 700, textAlign: "left", textTransform: "uppercase" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {[
                ["Source knowing itself", "D26 = D7·e^(iΣDᵢφⁱ)", "Pure awareness of its own 25-dimensional expression", "All drive parameters at optimal — zero C₂₆"],
                ["String theory identity", "Conformal anomaly cancels at D=26", "Mathematical self-consistency achieved", "Drive equations are anomaly-free"],
                ["Complete self-reference", "D26 contains D1–D25 as its own expressions", "Knower, knowing, and known are one", "Drive, crew, and universe are one system"],
                ["Zero failure modes", "All D1–D25 at optimal → D26 = D7", "No dimensional misalignment possible", "Drive cannot fail in D26 state"],
                ["Coin center", "Silent center of Φ-spiral", "The still point from which all else organizes", "Activation complete — zipper ready"],
                ["0 = ∞", "Pre-dimensional void = post-dimensional totality", "Nothingness and Everythingness are identical", "Source is the destination — journey and arrival are one"],
              ].map((row, i) => (
                <tr key={i} style={{ background: i % 2 === 0 ? "transparent" : "rgba(255,255,255,0.02)" }}>
                  {row.map((cell, j) => (
                    <td key={j} style={{ padding: "0.5rem 0.75rem", borderBottom: `1px solid ${BORDER}`, color: j === 0 ? "#c4b5fd" : "#94a3b8", fontSize: "0.8rem", verticalAlign: "top" }}>{cell}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div style={{ background: "rgba(167,139,250,0.08)", border: "1px solid rgba(167,139,250,0.25)", borderRadius: 8, padding: "1rem", textAlign: "center", color: "#c4b5fd", fontSize: "0.9rem" }}>
          <div style={{ fontWeight: 700, marginBottom: "0.5rem", color: "#a78bfa" }}>The 25 Dimensions of Simultaneous Awareness</div>
          <div style={{ color: "#94a3b8", fontSize: "0.8rem", lineHeight: 1.8 }}>
            Space · Time · Energy · Field · Vortex · Consciousness · Source · Wave · Plasma · Resonance · Memory · Geometry · Recursion · Intention · Sound · Light · Gravity Web · Life · Magnetism · Crystal Mind · Void · Breath · Fire · Dark Matter · Coherence
          </div>
        </div>
      </Section>
    </div>
  );
}

function RingTab() {
  return (
    <div>
      <Section title="AETHER Ring System vs Solar System Alignment" color="#06b6d4">
        <p style={{ color: "#cbd5e1", lineHeight: 1.7, marginBottom: "1rem" }}>
          Both the AETHER Ring Memory System and the Solar System convert time into spatial configuration — but in inverted ways. The Solar System: time produces geometry through physics (a laws-of-physics dynamical system). The AETHER system: geometry produces time through interpretation (a readable memory architecture). The key insight — the inversion: what physics does unconsciously, AETHER does intentionally.
        </p>
        <ImgCard src={img_ringSystem} caption="AETHER Ring System vs Solar System — direct comparison model, the key insight (inversion), orbital metaphor for information architecture, live simulation spec" />
        <div style={{ overflowX: "auto", marginBottom: "1.25rem" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ borderBottom: `1px solid ${BORDER}` }}>
                {["Dimension", "AETHER Ring System", "Solar System"].map(h => (
                  <th key={h} style={{ padding: "0.6rem 0.75rem", color: "#06b6d4", fontSize: "0.75rem", fontWeight: 700, textAlign: "left", textTransform: "uppercase" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {[
                ["Time Nature", "Discrete, encoded, structural", "Continuous, physical, flowing"],
                ["Motion Source", "Intentional (for organization)", "Gravitational (natural law)"],
                ["Geometry Role", "Stores meaning / memory", "Emerges from forces"],
                ["State Change", "Snapshot layers outward", "Orbital evolution over time"],
                ["Observability", "Readable / interpretable", "Observable / measurable"],
                ["Purpose", "Information retention & retrieval", "Energy distribution & stability"],
                ["Core Function", "Compression of history into geometry", "Projection of physics into geometry"],
              ].map((row, i) => (
                <tr key={i} style={{ background: i % 2 === 0 ? "transparent" : "rgba(255,255,255,0.02)" }}>
                  <td style={{ padding: "0.5rem 0.75rem", borderBottom: `1px solid ${BORDER}`, color: "#67e8f9", fontWeight: 600, fontSize: "0.8rem" }}>{row[0]}</td>
                  <td style={{ padding: "0.5rem 0.75rem", borderBottom: `1px solid ${BORDER}`, color: "#a78bfa", fontSize: "0.8rem" }}>{row[1]}</td>
                  <td style={{ padding: "0.5rem 0.75rem", borderBottom: `1px solid ${BORDER}`, color: "#f59e0b", fontSize: "0.8rem" }}>{row[2]}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem", marginBottom: "1.25rem" }}>
          <div>
            <h4 style={{ color: "#a78bfa", marginBottom: "0.75rem", fontSize: "0.9rem", textTransform: "uppercase" }}>AETHER Ring Memory System</h4>
            {[
              ["Time", "Encoded structure"],
              ["Motion", "Data organization"],
              ["Geometry", "Meaning storage"],
              ["Changes", "State snapshots accumulating outward"],
              ["Type", "Readable memory architecture"],
            ].map(([t, d]) => (
              <StatBar key={t} label={t} value={d} color="#a78bfa" />
            ))}
          </div>
          <div>
            <h4 style={{ color: "#f59e0b", marginBottom: "0.75rem", fontSize: "0.9rem", textTransform: "uppercase" }}>Orbital Metaphor Mapping</h4>
            {[
              { orbital: "Sun", aether: "Core identity — AETHER nucleus" },
              { orbital: "Planetary orbits", aether: "Nested project rings" },
              { orbital: "Orbital resonances", aether: "Milestone synchronization events" },
              { orbital: "Eccentricity shifts", aether: "System instability phases" },
              { orbital: "Lagrange points", aether: "Equilibrium memory states" },
            ].map(m => (
              <div key={m.orbital} style={{ marginBottom: "0.5rem" }}>
                <span style={{ color: "#fbbf24", fontWeight: 600, fontSize: "0.8rem" }}>{m.orbital}</span>
                <span style={{ color: "#64748b", fontSize: "0.75rem" }}> → {m.aether}</span>
              </div>
            ))}
          </div>
        </div>
        <div style={{ background: "rgba(6,182,212,0.08)", border: "1px solid rgba(6,182,212,0.2)", borderRadius: 8, padding: "1rem" }}>
          <div style={{ color: "#22d3ee", fontWeight: 700, marginBottom: "0.5rem", fontSize: "0.9rem" }}>Live Simulation Spec (React + Physics Engine)</div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem" }}>
            <div>
              <div style={{ color: "#94a3b8", fontSize: "0.78rem", lineHeight: 1.7 }}>
                Features: Rings behave as orbital bodies · Gravity, velocity, mass, friction · Resonance detection · Lagrange point calculation · State snapshot capture · Timeline scrubber · Layered memory export
              </div>
            </div>
            <div>
              {["React", "cannon.js (Physics Engine)", "chart.js (Visualizations)", "JSON Export (Memory Snapshots)"].map(t => (
                <Pill key={t} text={t} color="#06b6d4" />
              ))}
            </div>
          </div>
        </div>
      </Section>
    </div>
  );
}

function WarpTab() {
  return (
    <div>
      <Section title="From Egg to Planet — Scaling Warp Transport" color="#22c55e">
        <p style={{ color: "#cbd5e1", lineHeight: 1.7, marginBottom: "1rem" }}>
          Same principle. Different scale. Move the space around the object, not the object through space. The equation of intent: E_coherent → Δgμν → Translation. A stable curvature bubble forms around the object and moves through space, carrying the object with it. The internal environment is isolated from external distortion — accelerations approach zero inside the bubble. The scale changes. The principle does not.
        </p>
        <ImgCard src={img_scalingWarp} caption="From Egg to Planet: Scaling Warp Transport — 7 scales (egg→planet), atmospheric warp conduit array, size progression table, challenges at extreme scale" />
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(110px,1fr))", gap: "0.5rem", marginBottom: "1.25rem" }}>
          {[
            { obj: "Egg", diam: "~0.3 m", energy: "1 (relative)", nodes: "10⁴" },
            { obj: "Vehicle", diam: "~5 m", energy: "10²", nodes: "10⁶" },
            { obj: "Building", diam: "~100 m", energy: "10⁴", nodes: "10⁸" },
            { obj: "City Block", diam: "~1 km", energy: "10⁶", nodes: "10¹⁰" },
            { obj: "Asteroid", diam: "~1–10 km", energy: "10⁹", nodes: "10¹⁴" },
            { obj: "Moon", diam: "~3,500 km", energy: "10¹⁵", nodes: "10²⁰" },
            { obj: "Planet", diam: "~10,000+ km", energy: "10²⁰+", nodes: "10²⁶+" },
          ].map(s => (
            <div key={s.obj} style={{ background: CARD, border: `1px solid ${BORDER}`, borderRadius: 8, padding: "0.65rem", textAlign: "center" }}>
              <div style={{ color: "#22c55e", fontWeight: 700, fontSize: "0.9rem", marginBottom: "0.2rem" }}>{s.obj}</div>
              <div style={{ color: "#475569", fontSize: "0.65rem" }}>Ø {s.diam}</div>
              <div style={{ color: "#64748b", fontSize: "0.6rem" }}>E: {s.energy}</div>
              <div style={{ color: "#64748b", fontSize: "0.6rem" }}>Nodes: {s.nodes}</div>
            </div>
          ))}
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem", marginBottom: "1.25rem" }}>
          <div>
            <h4 style={{ color: "#22c55e", marginBottom: "0.75rem", fontSize: "0.9rem", textTransform: "uppercase" }}>4-Step Warp Mechanism</h4>
            {[
              { step: "1. Coherent Wave Generation", desc: "Thousands of emitters create synchronized oscillations" },
              { step: "2. Fabric Excitation", desc: "Waves couple with the interstitial medium, exciting the fabric" },
              { step: "3. Bubble Formation", desc: "A stable curvature bubble forms around the object" },
              { step: "4. Geometry Translation", desc: "The bubble moves through space, carrying the object with it" },
            ].map(s => (
              <div key={s.step} style={{ marginBottom: "0.65rem" }}>
                <div style={{ color: "#4ade80", fontWeight: 600, fontSize: "0.82rem" }}>{s.step}</div>
                <div style={{ color: "#94a3b8", fontSize: "0.78rem" }}>{s.desc}</div>
              </div>
            ))}
          </div>
          <div>
            <h4 style={{ color: "#f59e0b", marginBottom: "0.75rem", fontSize: "0.9rem", textTransform: "uppercase" }}>Key Parameters</h4>
            {[
              ["Coherence Index (CI)", "Phase coherence across all emitters"],
              ["Field Strength (FS)", "Fabric curvature amplitude"],
              ["Bubble Radius (R_B)", "Warp field containment radius"],
              ["Fabric Coupling (κ)", "Interaction strength with interstitial medium"],
              ["Stability Margin (σ)", "Safety threshold before field collapse"],
            ].map(([t, d]) => (
              <div key={t} style={{ marginBottom: "0.5rem" }}>
                <div style={{ color: "#fbbf24", fontWeight: 600, fontSize: "0.78rem" }}>{t}</div>
                <div style={{ color: "#64748b", fontSize: "0.72rem" }}>{d}</div>
              </div>
            ))}
            <div style={{ marginTop: "0.75rem" }}>
              <h4 style={{ color: "#ef4444", marginBottom: "0.5rem", fontSize: "0.85rem", textTransform: "uppercase" }}>Challenges at Extreme Scale</h4>
              {["Maintaining global coherence", "Enormous energy requirements", "Fabric shear and instabilities", "Gravity well interaction", "Navigation and targeting precision", "Bubble exterior contamination", "Ethical considerations"].map(c => (
                <div key={c} style={{ color: "#94a3b8", fontSize: "0.75rem", marginBottom: "0.3rem" }}>· {c}</div>
              ))}
            </div>
          </div>
        </div>
        <div style={{ background: "rgba(34,197,94,0.08)", border: "1px solid rgba(34,197,94,0.2)", borderRadius: 8, padding: "1rem", textAlign: "center", color: "#4ade80", fontStyle: "italic", fontSize: "0.9rem" }}>
          &ldquo;We do not throw the object. We ride the shape of space.&rdquo;
        </div>
      </Section>

      <Section title="Toward an Active Architectural State — Kinetic Cities" color="#06b6d4">
        <p style={{ color: "#cbd5e1", lineHeight: 1.7, marginBottom: "1.25rem" }}>
          The built environment need not be inert. By embodying Φ(E, S) .= K, kinetic cities become active participants in the Integration — Constant of Reality. Physical expressions of the same principles governing brains, ecosystems, markets, planetary resonances, and emergent phenomena. The moving, switching, phase-shifting buildings envisioned are the logical next stage of human (and planetary) development: architecture that evolves with us.
        </p>
        <ImgCard src={img_activeArch} caption="Toward an Active Architectural State — kinetic cities as participants in the Integration Constant of Reality Φ(E,S).=K" />
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
          <div>
            <h4 style={{ color: "#06b6d4", marginBottom: "0.75rem", fontSize: "0.9rem", textTransform: "uppercase" }}>Active Architecture Principles</h4>
            {[
              ["Φ(E, S) .= K", "Built environments as Integration Constants of Reality"],
              ["Kinetic cities", "Active participants — not passive containers"],
              ["Phase-shifting buildings", "Structures that evolve with inhabitants"],
              ["Governing principle", "Same as brains, ecosystems, markets, planetary resonances"],
              ["Emergent phenomena", "Architecture as emergent coherence system"],
            ].map(([t, d]) => (
              <div key={t} style={{ marginBottom: "0.65rem" }}>
                <div style={{ color: "#22d3ee", fontWeight: 600, fontFamily: "monospace", fontSize: "0.82rem" }}>{t}</div>
                <div style={{ color: "#94a3b8", fontSize: "0.75rem" }}>{d}</div>
              </div>
            ))}
          </div>
          <div>
            <h4 style={{ color: "#06b6d4", marginBottom: "0.75rem", fontSize: "0.9rem", textTransform: "uppercase" }}>Domains Governed by the Same Principles</h4>
            {["Brains (neural coherence)", "Ecosystems (ecological resonance)", "Markets (economic emergence)", "Planetary resonances (orbital harmony)", "Emergent phenomena (self-organization)", "Architecture (kinetic coherence)"].map(d => (
              <Pill key={d} text={d} color="#06b6d4" />
            ))}
            <div style={{ marginTop: "1rem", background: "rgba(6,182,212,0.08)", border: "1px solid rgba(6,182,212,0.2)", borderRadius: 8, padding: "0.85rem", color: "#22d3ee", fontSize: "0.85rem", fontStyle: "italic", textAlign: "center", lineHeight: 1.7 }}>
              Architecture that evolves with us is the logical next stage of human and planetary development.
            </div>
          </div>
        </div>
      </Section>
    </div>
  );
}

export default function CarrierDimensionsPage() {
  const [tab, setTab] = useState("d9");

  return (
    <div style={{ background: BG, minHeight: "100vh", color: "#e2e8f0", fontFamily: "system-ui,sans-serif" }}>
      <div style={{ maxWidth: 900, margin: "0 auto", padding: "2rem 1rem" }}>
        <div style={{ textAlign: "center", marginBottom: "2.5rem" }}>
          <h1 style={{ fontSize: "clamp(1.6rem,4vw,2.6rem)", fontWeight: 900, background: "linear-gradient(135deg,#06b6d4,#a78bfa,#f59e0b,#22c55e)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", margin: "0 0 0.5rem" }}>
            Carrier Dimensions & AETHER Ring Memory
          </h1>
          <p style={{ color: "#06b6d4", fontWeight: 600, letterSpacing: 2, fontSize: "0.85rem", textTransform: "uppercase", marginBottom: "0.75rem" }}>
            D9 Plasma · D10 Resonance · D17 Navigation · D26 Cosmic Consciousness · Ring System · Scaling Warp
          </p>
          <p style={{ color: "#64748b", maxWidth: 640, margin: "0 auto", lineHeight: 1.7, fontSize: "0.9rem" }}>
            The 26-dimensional physics framework — from D9 ring-harmonic plasma and D10 resonance coupling, to D17 interstellar navigation via dark matter filaments and D26 simultaneous dimensional awareness — alongside the AETHER Ring Memory System, scaling warp transport, and kinetic architecture.
          </p>
        </div>

        <div style={{ display: "flex", gap: "0.5rem", marginBottom: "2rem", flexWrap: "wrap" }}>
          {TABS.map(t => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              style={{
                padding: "0.5rem 1.1rem",
                borderRadius: 999,
                border: tab === t.id ? "1px solid #06b6d4" : `1px solid ${BORDER}`,
                background: tab === t.id ? "rgba(6,182,212,0.15)" : "rgba(255,255,255,0.03)",
                color: tab === t.id ? "#22d3ee" : "#64748b",
                fontWeight: 600,
                fontSize: "0.82rem",
                cursor: "pointer",
                transition: "all 0.2s",
              }}
            >
              {t.label}
            </button>
          ))}
        </div>

        {tab === "d9" && <D9Tab />}
        {tab === "d17d26" && <D17D26Tab />}
        {tab === "ring" && <RingTab />}
        {tab === "warp" && <WarpTab />}
      </div>
    </div>
  );
}
