export default function Slide19ExtendedSims() {
  const orig = [
    { label: "PDE Simulator",          desc: "Wave propagation · diffusion · reaction fields" },
    { label: "Morphogenetic Computer", desc: "Turing patterns · reaction-diffusion morphogenesis" },
    { label: "Lunar Coherence",        desc: "SVG tide-envelope · lunar gravitational mechanisms" },
    { label: "Quantum Ammeter",        desc: "Photovoltaic electron counting · 1ms Poisson · SNR" },
    { label: "CUCA Gyroid v3.0",       desc: "Photonic gyroid + biological skin · WebGL canvas" },
  ];
  const newSims = [
    { label: "Crystallization Atlas",   desc: "14 substrates · diamond→bismuth · 4 phase transitions" },
    { label: "AETHER Engine",           desc: "C(x,t) unified field · N helical vortex mechanisms · LPE gate" },
    { label: "Gradient Field",          desc: "Rankine vortex superposition · Fibonacci spiral · arrow field" },
    { label: "Uptipple Boat",           desc: "Hull-on-waves physics · metacentric GM · capsize detection" },
    { label: "Chromatic Glare",         desc: "Vibrating boundary · inversion field · afterimage chamber" },
    { label: "Circular Farm",           desc: "Hubble H(a) · entropy-growth G(t) · energy density ρ(a)" },
    { label: "Coherence Condensation",  desc: "128-particle gas→genesis→cellular→atomic lattice · order param ℂ" },
    { label: "Rhombus Gate Piezo",      desc: "4-cavity piezo building · Kuramoto R · apex-in/out resonance" },
    { label: "Air Nanotube Propulsion", desc: "Pneumatic pod · pressure-launch · Bernoulli glide efficiency" },
    { label: "Resonant Tunnel Stress",  desc: "Hoop stress P=ρgh · graphene t_min · braided redundancy canvas" },
  ];

  return (
    <div style={{ width: "100vw", height: "100vh", overflow: "hidden", backgroundColor: "#1A1B26", fontFamily: "'Inter', sans-serif", display: "flex", color: "#C0CAF5", position: "relative" }}>
      {/* Sidebar */}
      <div style={{ width: "22vw", height: "100vh", borderRight: "1px solid rgba(255,255,255,0.05)", padding: "4vh 2.5vw", display: "flex", flexDirection: "column", flexShrink: 0 }}>
        <div style={{ display: "flex", alignItems: "center", gap: "0.8vw", marginBottom: "5vh" }}>
          <div style={{ width: "1.4vw", height: "1.4vw", backgroundColor: "#7AA2F7", borderRadius: "0.25vw" }} />
          <div style={{ fontSize: "1.1vw", fontWeight: 700, color: "#FFFFFF", letterSpacing: "0.04em" }}>AETHER</div>
        </div>
        <div style={{ fontSize: "0.75vw", fontWeight: 600, color: "#565F89", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: "1.5vh" }}>Overview + Architecture + Simulators + Products</div>
        <div style={{ fontSize: "0.9vw", color: "#C0CAF5", opacity: 0.45, marginBottom: "3.5vh" }}>14 modules</div>
        <div style={{ fontSize: "0.75vw", fontWeight: 600, color: "#565F89", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: "1.5vh" }}>Investment</div>
        <div style={{ display: "flex", flexDirection: "column", gap: "1.2vh" }}>
          <div style={{ fontSize: "0.9vw", color: "#7AA2F7", fontWeight: 600, display: "flex", alignItems: "center", gap: "0.6vw" }}>
            <span style={{ width: "3px", height: "1.1vw", backgroundColor: "#7AA2F7", borderRadius: "2px", marginLeft: "-2.5vw", flexShrink: 0 }} />
            Extended Simulator Library
          </div>
          <div style={{ fontSize: "0.9vw", color: "#C0CAF5", opacity: 0.55 }}>Knowledge Synthesis Layer</div>
          <div style={{ fontSize: "0.9vw", color: "#C0CAF5", opacity: 0.55 }}>Market Position</div>
          <div style={{ fontSize: "0.9vw", color: "#C0CAF5", opacity: 0.55 }}>The Ask</div>
        </div>
        <div style={{ marginTop: "auto", fontSize: "0.75vw", color: "#565F89" }}>v1.0 · 2026</div>
      </div>

      {/* Main */}
      <div style={{ flex: 1, padding: "4.5vh 3.5vw", display: "flex", flexDirection: "column", overflow: "hidden" }}>
        <div style={{ fontSize: "0.9vw", color: "#7AA2F7", textTransform: "uppercase", letterSpacing: "0.08em", fontWeight: 600, marginBottom: "1.2vh" }}>Investment</div>
        <h1 style={{ fontSize: "2.8vw", fontWeight: 700, color: "#FFFFFF", margin: "0 0 0.8vh 0", letterSpacing: "-0.02em" }}>Extended Physics Library</h1>
        <p style={{ fontSize: "1vw", color: "#9AA5CE", lineHeight: 1.5, maxWidth: "44vw", margin: "0 0 2.2vh 0" }}>
          15 → 20+ live canvas simulations. All client-side. No server round-trips. New simulators added in 2026.
        </p>

        {/* Stats row */}
        <div style={{ display: "flex", gap: "1.5vw", marginBottom: "2vh" }}>
          {[["20+", "simulators live", "#9ECE6A"], ["100%", "client-side canvas", "#7AA2F7"], ["0", "server round-trips", "#E0AF68"]].map(([n, l, c]) => (
            <div key={l} style={{ backgroundColor: "#16161E", border: `1px solid ${c}30`, borderRadius: "0.4vw", padding: "1vh 1.5vw", display: "flex", alignItems: "center", gap: "0.8vw" }}>
              <span style={{ fontSize: "1.6vw", fontWeight: 700, color: c as string, fontFamily: "'DM Mono', monospace" }}>{n}</span>
              <span style={{ fontSize: "0.78vw", color: "#9AA5CE" }}>{l}</span>
            </div>
          ))}
        </div>

        {/* Original 5 */}
        <div style={{ fontSize: "0.72vw", fontWeight: 700, color: "#565F89", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: "0.8vh" }}>Original · v1.0</div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: "0.7vw", marginBottom: "1.4vh" }}>
          {orig.map(s => (
            <div key={s.label} style={{ backgroundColor: "#16161E", border: "1px solid rgba(158,206,106,0.18)", borderRadius: "0.4vw", padding: "1vh 1vw" }}>
              <div style={{ display: "flex", gap: "0.4vw", alignItems: "center", marginBottom: "0.4vh" }}>
                <span style={{ fontSize: "0.62vw", fontFamily: "'DM Mono', monospace", color: "#9ECE6A", backgroundColor: "rgba(158,206,106,0.1)", padding: "0.1vh 0.4vw", borderRadius: "0.2vw" }}>LIVE</span>
              </div>
              <div style={{ fontSize: "0.78vw", color: "#FFFFFF", fontWeight: 600, marginBottom: "0.3vh" }}>{s.label}</div>
              <div style={{ fontSize: "0.7vw", color: "#565F89", lineHeight: 1.4 }}>{s.desc}</div>
            </div>
          ))}
        </div>

        {/* New 10 */}
        <div style={{ fontSize: "0.72vw", fontWeight: 700, color: "#7AA2F7", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: "0.8vh" }}>New · 2026</div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: "0.7vw" }}>
          {newSims.map(s => (
            <div key={s.label} style={{ backgroundColor: "#16161E", border: "1px solid rgba(122,162,247,0.18)", borderRadius: "0.4vw", padding: "1vh 1vw" }}>
              <div style={{ display: "flex", gap: "0.4vw", alignItems: "center", marginBottom: "0.4vh" }}>
                <span style={{ fontSize: "0.62vw", fontFamily: "'DM Mono', monospace", color: "#7AA2F7", backgroundColor: "rgba(122,162,247,0.1)", padding: "0.1vh 0.4vw", borderRadius: "0.2vw" }}>NEW</span>
              </div>
              <div style={{ fontSize: "0.78vw", color: "#FFFFFF", fontWeight: 600, marginBottom: "0.3vh" }}>{s.label}</div>
              <div style={{ fontSize: "0.7vw", color: "#565F89", lineHeight: 1.4 }}>{s.desc}</div>
            </div>
          ))}
        </div>

        <div style={{ marginTop: "auto", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div style={{ fontSize: "0.9vw", color: "#565F89", fontWeight: 600 }}>19</div>
          <div style={{ fontSize: "0.8vw", color: "#565F89" }}>AETHER Knowledge System, Inc.</div>
        </div>
      </div>
    </div>
  );
}
