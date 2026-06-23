export default function Slide08Simulators() {
  return (
    <div style={{ width: "100vw", height: "100vh", overflow: "hidden", backgroundColor: "#1A1B26", fontFamily: "'Inter', sans-serif", display: "flex", color: "#C0CAF5", position: "relative" }}>
      <div style={{ width: "22vw", height: "100vh", borderRight: "1px solid rgba(255,255,255,0.05)", padding: "4vh 2.5vw", display: "flex", flexDirection: "column", flexShrink: 0 }}>
        <div style={{ display: "flex", alignItems: "center", gap: "0.8vw", marginBottom: "5vh" }}>
          <div style={{ width: "1.4vw", height: "1.4vw", backgroundColor: "#7AA2F7", borderRadius: "0.25vw" }} />
          <div style={{ fontSize: "1.1vw", fontWeight: 700, color: "#FFFFFF", letterSpacing: "0.04em" }}>AETHER</div>
        </div>
        <div style={{ fontSize: "0.75vw", fontWeight: 600, color: "#565F89", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: "1.5vh" }}>Overview</div>
        <div style={{ fontSize: "0.9vw", color: "#C0CAF5", opacity: 0.45, marginBottom: "3.5vh" }}>AETHER · Problem · Crystallization</div>
        <div style={{ fontSize: "0.75vw", fontWeight: 600, color: "#565F89", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: "1.5vh" }}>Architecture</div>
        <div style={{ fontSize: "0.9vw", color: "#C0CAF5", opacity: 0.45, marginBottom: "3.5vh" }}>Graph · Agents · Functions · Ingestion</div>
        <div style={{ fontSize: "0.75vw", fontWeight: 600, color: "#565F89", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: "1.5vh" }}>Simulators</div>
        <div style={{ display: "flex", flexDirection: "column", gap: "1.2vh", marginBottom: "3.5vh" }}>
          <div style={{ fontSize: "0.9vw", color: "#7AA2F7", fontWeight: 600, display: "flex", alignItems: "center", gap: "0.6vw" }}>
            <span style={{ width: "3px", height: "1.1vw", backgroundColor: "#7AA2F7", borderRadius: "2px", marginLeft: "-2.5vw", flexShrink: 0 }} />
            Scientific Simulators
          </div>
          <div style={{ fontSize: "0.9vw", color: "#C0CAF5", opacity: 0.55 }}>Regulatory Depth</div>
          <div style={{ fontSize: "0.9vw", color: "#C0CAF5", opacity: 0.55 }}>Quantum Layer</div>
        </div>
        <div style={{ fontSize: "0.75vw", fontWeight: 600, color: "#565F89", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: "1.5vh" }}>Products</div>
        <div style={{ fontSize: "0.75vw", fontWeight: 600, color: "#565F89", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: "1.5vh", marginTop: "2vh" }}>Investment</div>
        <div style={{ marginTop: "auto", fontSize: "0.75vw", color: "#565F89" }}>v1.0 · 2026</div>
      </div>
      <div style={{ flex: 1, padding: "6vh 4vw", display: "flex", flexDirection: "column" }}>
        <div style={{ fontSize: "0.9vw", color: "#7AA2F7", textTransform: "uppercase", letterSpacing: "0.08em", fontWeight: 600, marginBottom: "2vh" }}>Simulators</div>
        <h1 style={{ fontSize: "3.5vw", fontWeight: 700, color: "#FFFFFF", margin: "0 0 1.5vh 0", letterSpacing: "-0.02em" }}>Scientific Simulators</h1>
        <p style={{ fontSize: "1.1vw", color: "#9AA5CE", lineHeight: 1.6, maxWidth: "42vw", margin: "0 0 3vh 0" }}>
          Real physics, rendered in-browser. No server round-trips. Every simulator runs as a live canvas on the client.
        </p>
        <div style={{ display: "flex", gap: "1.5vw", marginBottom: "1.5vh" }}>
          <div style={{ flex: 1, backgroundColor: "#16161E", border: "1px solid rgba(255,255,255,0.06)", borderRadius: "0.4vw", padding: "1.8vh 1.5vw" }}>
            <div style={{ display: "flex", gap: "0.8vw", alignItems: "center", marginBottom: "0.8vh" }}>
              <div style={{ fontSize: "0.75vw", fontFamily: "'DM Mono', monospace", color: "#9ECE6A", backgroundColor: "rgba(158,206,106,0.12)", padding: "0.2vh 0.5vw", borderRadius: "0.2vw" }}>LIVE</div>
              <div style={{ fontSize: "0.95vw", color: "#FFFFFF", fontWeight: 600 }}>PDE Simulator</div>
            </div>
            <div style={{ fontSize: "0.85vw", color: "#9AA5CE" }}>Partial differential equations — wave propagation, diffusion, reaction fields</div>
          </div>
          <div style={{ flex: 1, backgroundColor: "#16161E", border: "1px solid rgba(255,255,255,0.06)", borderRadius: "0.4vw", padding: "1.8vh 1.5vw" }}>
            <div style={{ display: "flex", gap: "0.8vw", alignItems: "center", marginBottom: "0.8vh" }}>
              <div style={{ fontSize: "0.75vw", fontFamily: "'DM Mono', monospace", color: "#9ECE6A", backgroundColor: "rgba(158,206,106,0.12)", padding: "0.2vh 0.5vw", borderRadius: "0.2vw" }}>LIVE</div>
              <div style={{ fontSize: "0.95vw", color: "#FFFFFF", fontWeight: 600 }}>Morphogenetic Computer</div>
            </div>
            <div style={{ fontSize: "0.85vw", color: "#9AA5CE" }}>Turing pattern formation, reaction-diffusion morphogenesis on canvas</div>
          </div>
        </div>
        <div style={{ display: "flex", gap: "1.5vw" }}>
          <div style={{ flex: 1, backgroundColor: "#16161E", border: "1px solid rgba(255,255,255,0.06)", borderRadius: "0.4vw", padding: "1.8vh 1.5vw" }}>
            <div style={{ display: "flex", gap: "0.8vw", alignItems: "center", marginBottom: "0.8vh" }}>
              <div style={{ fontSize: "0.75vw", fontFamily: "'DM Mono', monospace", color: "#9ECE6A", backgroundColor: "rgba(158,206,106,0.12)", padding: "0.2vh 0.5vw", borderRadius: "0.2vw" }}>LIVE</div>
              <div style={{ fontSize: "0.95vw", color: "#FFFFFF", fontWeight: 600 }}>Lunar Coherence</div>
            </div>
            <div style={{ fontSize: "0.85vw", color: "#9AA5CE" }}>SVG tide-envelope simulator, lunar gravitational mechanisms</div>
          </div>
          <div style={{ flex: 1, backgroundColor: "#16161E", border: "1px solid rgba(255,255,255,0.06)", borderRadius: "0.4vw", padding: "1.8vh 1.5vw" }}>
            <div style={{ display: "flex", gap: "0.8vw", alignItems: "center", marginBottom: "0.8vh" }}>
              <div style={{ fontSize: "0.75vw", fontFamily: "'DM Mono', monospace", color: "#9ECE6A", backgroundColor: "rgba(158,206,106,0.12)", padding: "0.2vh 0.5vw", borderRadius: "0.2vw" }}>LIVE</div>
              <div style={{ fontSize: "0.95vw", color: "#FFFFFF", fontWeight: 600 }}>Quantum Ammeter</div>
            </div>
            <div style={{ fontSize: "0.85vw", color: "#9AA5CE" }}>Solar photovoltaic electron counting, 1ms Poisson sampling, SNR readout</div>
          </div>
          <div style={{ flex: 1, backgroundColor: "#16161E", border: "1px solid rgba(255,255,255,0.06)", borderRadius: "0.4vw", padding: "1.8vh 1.5vw" }}>
            <div style={{ display: "flex", gap: "0.8vw", alignItems: "center", marginBottom: "0.8vh" }}>
              <div style={{ fontSize: "0.75vw", fontFamily: "'DM Mono', monospace", color: "#9ECE6A", backgroundColor: "rgba(158,206,106,0.12)", padding: "0.2vh 0.5vw", borderRadius: "0.2vw" }}>LIVE</div>
              <div style={{ fontSize: "0.95vw", color: "#FFFFFF", fontWeight: 600 }}>CUCA Gyroid v3</div>
            </div>
            <div style={{ fontSize: "0.85vw", color: "#9AA5CE" }}>Photonic gyroid + biological skin hybrid, live WebGL canvas</div>
          </div>
        </div>
        <div style={{ marginTop: "auto", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div style={{ fontSize: "0.9vw", color: "#565F89", fontWeight: 600 }}>08</div>
          <div style={{ fontSize: "0.8vw", color: "#565F89" }}>AETHER Knowledge System, Inc.</div>
        </div>
      </div>
    </div>
  );
}
