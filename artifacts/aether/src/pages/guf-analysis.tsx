const BASE = import.meta.env.BASE_URL.replace(/\/$/, "");

const GUF_DIMS = [
  { id: "D1", label: "Space", color: "#00ffee", desc: "3D spatial geometry — the base manifold in which all GUF interactions propagate. Curvature here encodes the gravitational sector of the unified field." },
  { id: "D2", label: "Time", color: "#7c3aed", desc: "Temporal dimension with intrinsic directionality. GUF treats time not as a background parameter but as a dynamic field coupled to the energy dimension D3." },
  { id: "D3", label: "Energy", color: "#f59e0b", desc: "Scalar energy density field. The GUF collision produces energy redistribution across all seven dimensions simultaneously — measured as E_cm in TeV at the collider vertex." },
  { id: "D4", label: "Field", color: "#10b981", desc: "Gauge field manifold — electroweak + strong interactions unified at GUF energy scales. At E_cm > 80 TeV the GUF field dimension opens and previously forbidden decay channels become accessible." },
  { id: "D5", label: "Vortex", color: "#ef4444", desc: "Topological vortex sector — GUF predicts stable vortex rings in the post-collision debris. Vortex winding number is a conserved GUF quantum number with no Standard Model analog." },
  { id: "D6", label: "Mind", color: "#ec4899", desc: "Information / consciousness dimension — the most speculative GUF claim. Scattering amplitudes develop an imaginary pole in D6 at criticality, interpreted as coherent information transfer between collider events across temporal separation." },
  { id: "D7", label: "Source", color: "#f8fafc", desc: "The primordial source field — always at 100% intensity. D7 is the GUF equivalent of the Buddhist 'ground of being': the unchanging background from which all other dimensions arise and to which they return at the end of each collision event." },
];

const COLLIDER_FEATURES = [
  {
    name: "Linear Collider Module",
    color: "#00ffee",
    icon: "⟶",
    desc: "Two counter-propagating beam lines accelerated to configurable center-of-mass energies (1–100 TeV). Bunch charge, focus, and RF voltage tunable in real time. The linear geometry eliminates synchrotron radiation losses that limit circular colliders at these energies.",
    specs: [
      { k: "E_cm range", v: "1–100 TeV" },
      { k: "Bunch density N", v: "1–100 (arb.)" },
      { k: "Focus parameter", v: "1–100" },
      { k: "RF Voltage", v: "1–100 MV" },
    ],
  },
  {
    name: "Twisted Zipper Geometry",
    color: "#7c3aed",
    icon: "⟳",
    desc: "The GUF Collider introduces a novel beam geometry: the Twisted Zipper. Rather than head-on collisions, beams are helically counter-wound with a tunable twist angle Θ_twist. At specific Θ_twist values, the impact parameter scans a toroidal cross-section — probing GUF vortex topology directly.",
    specs: [
      { k: "Θ_twist range", v: "0–360°" },
      { k: "Geometry", v: "Helical counter-wound" },
      { k: "Impact parameter", v: "Toroidal scan" },
      { k: "GUF vortex probe", v: "D5 direct" },
    ],
  },
  {
    name: "Compound-Eye Optics",
    color: "#f59e0b",
    icon: "◈",
    desc: "Detector array modeled on arthropod compound eyes — ~3,500 ommatidia (micro-detector units) arranged on a hemispherical surface surrounding the interaction point. Each ommatidium captures a different solid-angle slice of the collision debris. Coherence efficiency η = 0.85 across the full array.",
    specs: [
      { k: "Ommatidium N", v: "~3,500" },
      { k: "η_coherence", v: "0.85" },
      { k: "Geometry", v: "Hemispherical" },
      { k: "Coverage", v: "4π sr" },
    ],
  },
  {
    name: "Post-Collision Analysis Engine",
    color: "#10b981",
    icon: "◎",
    desc: "Multi-tab analysis suite running on the collision event stream: Particle Registry (full Standard Model + GUF exotic particle catalog), Decay Channels, Dimensional Analysis (D1–D7 energy distribution), and Mass Plot (real-time particle mass histogram updated at each collision event).",
    specs: [
      { k: "Particle types tracked", v: "40+" },
      { k: "GUF exotic particles", v: "7" },
      { k: "Mass plot update rate", v: "Real-time" },
      { k: "Statistical threshold", v: "5σ discovery" },
    ],
  },
];

const PARTICLES = [
  { name: "GUF Graviton-X", color: "#00ffee", mass: "126.3 GeV", spin: "2", guf: true, desc: "Massive graviton with GUF-predicted tiny mass. Responsible for D1↔D7 coupling." },
  { name: "Vortex Boson Ω", color: "#ef4444", mass: "2.4 TeV", spin: "1", guf: true, desc: "Carries the D5 vortex charge. Decays to vortex ring + photon pairs." },
  { name: "Mind Field Scalar φ_M", color: "#ec4899", mass: "340 GeV", spin: "0", guf: true, desc: "Higgs-like scalar in D6. Couples only to coherent information states." },
  { name: "Zipper Fermion Ζ_f", color: "#7c3aed", mass: "88 GeV", spin: "1/2", guf: true, desc: "Chiral fermion emerging uniquely from Twisted Zipper beam geometry." },
  { name: "Source Condensate S₀", color: "#f8fafc", mass: "0", spin: "0", guf: true, desc: "D7 source condensate — zero mass, zero spin, infinite lifetime." },
  { name: "Higgs (SM)", color: "#f59e0b", mass: "125.09 GeV", spin: "0", guf: false, desc: "Standard Model Higgs boson for calibration." },
  { name: "Z Boson (SM)", color: "#3b82f6", mass: "91.19 GeV", spin: "1", guf: false, desc: "Electroweak Z for luminosity normalization." },
];

const ANALYSIS_TABS = [
  { name: "Particle Registry", color: "#00ffee", desc: "Full catalog of particles expected in GUF collisions: Standard Model particles (quarks, leptons, gauge bosons, Higgs) plus the seven GUF exotics. Each particle tagged with mass, spin, charge, decay channels, and GUF dimension of origin." },
  { name: "Decay Channels", color: "#f59e0b", desc: "Decay topology trees for each GUF exotic. The Vortex Boson Ω → gg + photon pair is the primary discovery channel. The Mind Field Scalar φ_M has a unique decay signature: it couples exclusively to coherent information states, producing a characteristic missing-energy plus low-multiplicity final state." },
  { name: "Dimensional Analysis", color: "#7c3aed", desc: "Real-time energy distribution across D1–D7. The dimensional fraction bars show what percentage of collision energy flows into each GUF dimension. At peak E_cm, D5 Vortex and D6 Mind dimensions capture a combined 15% of total collision energy — a GUF prediction distinguishing it from all Standard Model extensions." },
  { name: "Mass Plot", color: "#10b981", desc: "Live invariant-mass histogram streaming collision-by-collision. Expected GUF peaks appear as bumps above the QCD background. The 5σ discovery threshold line is drawn automatically; when a peak crosses it, the significance readout in the top bar triggers an alert." },
];

export default function GufAnalysisPage() {
  return (
    <div style={{ background: "#020617", minHeight: "100vh", color: "#e2e8f0", fontFamily: "system-ui, sans-serif" }}>

      {/* Hero */}
      <div style={{ padding: "3rem 2rem 2rem", borderBottom: "1px solid #1e293b", background: "linear-gradient(180deg,#000d1a 0%,#020617 100%)" }}>
        <div style={{ maxWidth: 920, margin: "0 auto" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "0.6rem", marginBottom: "0.75rem" }}>
            <span style={{ fontSize: "0.65rem", letterSpacing: "0.2em", color: "#00ffee", textTransform: "uppercase" }}>GUF System · Collider Complex</span>
            <span style={{ color: "#334155" }}>·</span>
            <span style={{ fontSize: "0.65rem", letterSpacing: "0.15em", color: "#64748b", textTransform: "uppercase" }}>Shia Miller 2026</span>
          </div>
          <h1 style={{ fontSize: "clamp(1.6rem,4vw,2.8rem)", fontWeight: 800, margin: 0, lineHeight: 1.15,
            background: "linear-gradient(135deg,#00ffee,#7c3aed,#f59e0b)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
            GUF Unified Collider + Analysis Engine
          </h1>
          <p style={{ marginTop: "0.75rem", color: "#94a3b8", fontSize: "1rem", lineHeight: 1.7, maxWidth: 720 }}>
            Linear Collider · Twisted Zipper geometry · Compound-Eye Optics · Post-Collision Analysis across all 7 GUF dimensions. Real-time particle registry, decay-channel topology, dimensional energy distribution, and live mass-plot histograms.
          </p>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "1.5rem", marginTop: "1.5rem" }}>
            {[
              { v: "7", l: "GUF Dimensions" },
              { v: "100 TeV", l: "Max E_cm" },
              { v: "~3,500", l: "Ommatidia" },
              { v: "0.85", l: "η Coherence" },
              { v: "5σ", l: "Discovery Threshold" },
              { v: "40+", l: "Particle Types" },
            ].map(s => (
              <div key={s.l}>
                <div style={{ fontSize: "1.25rem", fontWeight: 700, color: "#00ffee" }}>{s.v}</div>
                <div style={{ fontSize: "0.6rem", letterSpacing: "0.12em", color: "#475569", textTransform: "uppercase" }}>{s.l}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div style={{ maxWidth: 920, margin: "0 auto", padding: "2rem 2rem 4rem" }}>

        {/* Live Simulator */}
        <div style={{ marginBottom: "0.5rem", fontSize: "0.65rem", letterSpacing: "0.2em", color: "#64748b", textTransform: "uppercase" }}>Live Interactive Simulator</div>
        <h2 style={{ fontSize: "1.4rem", fontWeight: 700, color: "#f1f5f9", margin: "0 0 0.5rem" }}>GUF Post-Collision Analysis · Full Simulator</h2>
        <p style={{ color: "#94a3b8", fontSize: "0.85rem", lineHeight: 1.65, marginBottom: "1rem" }}>
          Click <strong style={{ color: "#00ffee" }}>⚡ INJECT</strong> to start beam injection. Tune Energy, Bunch N, Focus, and RF Voltage sliders. Toggle WARP (GUF warp field), OPTICS (Compound-Eye), and Φ PHI (phi-optimization). Navigate the analysis tabs to explore particle registry, decay channels, dimensional breakdown, and live mass plots.
        </p>
        <div style={{ border: "1px solid #1e293b", borderRadius: 8, overflow: "hidden", height: 680 }}>
          <iframe src={`${BASE}/guf-collider-v2.html`} style={{ width: "100%", height: "100%", border: "none", display: "block" }} title="GUF Unified Collider + Analysis Engine" />
        </div>

        {/* 4 Collider Features */}
        <div style={{ marginTop: "2.5rem", marginBottom: "0.5rem", fontSize: "0.65rem", letterSpacing: "0.2em", color: "#64748b", textTransform: "uppercase" }}>System Architecture</div>
        <h2 style={{ fontSize: "1.4rem", fontWeight: 700, color: "#f1f5f9", margin: "0 0 1.25rem" }}>4 Core Subsystems</h2>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem", marginBottom: "2.5rem" }}>
          {COLLIDER_FEATURES.map(f => (
            <div key={f.name} style={{ background: "#0a0f1f", border: `1px solid ${f.color}25`, borderLeft: `3px solid ${f.color}`, borderRadius: 6, padding: "1rem 1.1rem" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.5rem" }}>
                <span style={{ fontSize: "1.1rem", color: f.color }}>{f.icon}</span>
                <span style={{ fontWeight: 700, color: f.color, fontSize: "0.95rem" }}>{f.name}</span>
              </div>
              <p style={{ color: "#94a3b8", fontSize: "0.78rem", lineHeight: 1.7, marginBottom: "0.75rem" }}>{f.desc}</p>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.3rem" }}>
                {f.specs.map(m => (
                  <div key={m.k} style={{ display: "flex", justifyContent: "space-between", fontSize: "0.65rem", padding: "0.25rem 0.4rem", background: "rgba(255,255,255,0.02)", borderRadius: 3 }}>
                    <span style={{ color: "#64748b" }}>{m.k}</span>
                    <span style={{ color: f.color, fontFamily: "monospace" }}>{m.v}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* 7 GUF Dimensions */}
        <div style={{ marginBottom: "0.5rem", fontSize: "0.65rem", letterSpacing: "0.2em", color: "#64748b", textTransform: "uppercase" }}>Framework</div>
        <h2 style={{ fontSize: "1.4rem", fontWeight: 700, color: "#f1f5f9", margin: "0 0 1.25rem" }}>7 GUF Dimensions</h2>
        <div style={{ display: "flex", flexDirection: "column", gap: "0.6rem", marginBottom: "2.5rem" }}>
          {GUF_DIMS.map((d, i) => (
            <div key={d.id} style={{ display: "grid", gridTemplateColumns: "52px 80px 1fr", gap: "1rem", background: "#0a0f1f", border: `1px solid ${d.color}20`, borderLeft: `3px solid ${d.color}`, borderRadius: 6, padding: "0.75rem 1rem", alignItems: "start" }}>
              <div style={{ fontWeight: 900, fontSize: "1rem", color: d.color, fontFamily: "monospace" }}>D{i + 1}</div>
              <div style={{ fontWeight: 600, color: d.color, fontSize: "0.85rem", paddingTop: "0.1rem" }}>{d.label}</div>
              <p style={{ color: "#94a3b8", fontSize: "0.8rem", lineHeight: 1.65, margin: 0 }}>{d.desc}</p>
            </div>
          ))}
        </div>

        {/* Analysis Tabs */}
        <div style={{ marginBottom: "0.5rem", fontSize: "0.65rem", letterSpacing: "0.2em", color: "#64748b", textTransform: "uppercase" }}>Analysis Suite</div>
        <h2 style={{ fontSize: "1.4rem", fontWeight: 700, color: "#f1f5f9", margin: "0 0 1.25rem" }}>4 Analysis Tabs</h2>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem", marginBottom: "2.5rem" }}>
          {ANALYSIS_TABS.map(tab => (
            <div key={tab.name} style={{ background: "#0a0f1f", border: `1px solid ${tab.color}20`, borderTop: `2px solid ${tab.color}`, borderRadius: 6, padding: "1rem 1.1rem" }}>
              <div style={{ fontWeight: 700, color: tab.color, fontSize: "0.88rem", marginBottom: "0.5rem" }}>{tab.name}</div>
              <p style={{ color: "#94a3b8", fontSize: "0.78rem", lineHeight: 1.7, margin: 0 }}>{tab.desc}</p>
            </div>
          ))}
        </div>

        {/* GUF Exotic Particles */}
        <div style={{ marginBottom: "0.5rem", fontSize: "0.65rem", letterSpacing: "0.2em", color: "#64748b", textTransform: "uppercase" }}>Particle Catalog</div>
        <h2 style={{ fontSize: "1.4rem", fontWeight: 700, color: "#f1f5f9", margin: "0 0 1.25rem" }}>GUF Exotics + SM Calibration</h2>
        <div style={{ overflowX: "auto", marginBottom: "2.5rem" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.82rem" }}>
            <thead>
              <tr style={{ borderBottom: "1px solid #1e293b" }}>
                {["Particle", "Mass", "Spin", "Type", "Description"].map(h => (
                  <th key={h} style={{ padding: "0.6rem 0.8rem", textAlign: "left", fontSize: "0.6rem", letterSpacing: "0.12em", color: "#475569", textTransform: "uppercase" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {PARTICLES.map(p => (
                <tr key={p.name} style={{ borderBottom: "1px solid #0f172a" }}>
                  <td style={{ padding: "0.6rem 0.8rem", color: p.color, fontWeight: 600, fontFamily: "monospace", fontSize: "0.78rem" }}>{p.name}</td>
                  <td style={{ padding: "0.6rem 0.8rem", fontFamily: "monospace", color: "#94a3b8" }}>{p.mass}</td>
                  <td style={{ padding: "0.6rem 0.8rem", fontFamily: "monospace", color: "#64748b" }}>{p.spin}</td>
                  <td style={{ padding: "0.6rem 0.8rem" }}>
                    <span style={{ fontSize: "0.58rem", padding: "0.15rem 0.45rem", background: p.guf ? "rgba(0,255,238,0.08)" : "rgba(100,116,139,0.12)", border: `1px solid ${p.guf ? "rgba(0,255,238,0.2)" : "rgba(100,116,139,0.2)"}`, borderRadius: 999, color: p.guf ? "#00ffee" : "#64748b", letterSpacing: "0.08em" }}>
                      {p.guf ? "GUF EXOTIC" : "SM"}
                    </span>
                  </td>
                  <td style={{ padding: "0.6rem 0.8rem", color: "#64748b", fontSize: "0.75rem" }}>{p.desc}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Footer tags */}
        <div style={{ marginTop: "3rem", paddingTop: "1.5rem", borderTop: "1px solid #1e293b", display: "flex", flexWrap: "wrap", gap: "0.5rem" }}>
          {["GUF Collider", "7 Dimensions", "Linear Collider", "Twisted Zipper", "Compound-Eye Optics", "Post-Collision Analysis", "GUF Graviton-X", "Vortex Boson", "Mind Field Scalar", "Zipper Fermion", "Source Condensate", "5σ Discovery", "Mass Plot", "Decay Channels", "Particle Registry"].map(t => (
            <span key={t} style={{ fontSize: "0.6rem", padding: "0.2rem 0.6rem", background: "rgba(0,255,238,0.05)", border: "1px solid rgba(0,255,238,0.12)", borderRadius: 999, color: "#00ffee", letterSpacing: "0.06em" }}>{t}</span>
          ))}
        </div>
      </div>
    </div>
  );
}
