export default function Slide10Quantum() {
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
          <div style={{ fontSize: "0.9vw", color: "#C0CAF5", opacity: 0.45 }}>Scientific Simulators</div>
          <div style={{ fontSize: "0.9vw", color: "#C0CAF5", opacity: 0.45 }}>Regulatory Depth</div>
          <div style={{ fontSize: "0.9vw", color: "#7AA2F7", fontWeight: 600, display: "flex", alignItems: "center", gap: "0.6vw" }}>
            <span style={{ width: "3px", height: "1.1vw", backgroundColor: "#7AA2F7", borderRadius: "2px", marginLeft: "-2.5vw", flexShrink: 0 }} />
            Quantum Layer
          </div>
        </div>
        <div style={{ fontSize: "0.75vw", fontWeight: 600, color: "#565F89", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: "1.5vh" }}>Products</div>
        <div style={{ fontSize: "0.75vw", fontWeight: 600, color: "#565F89", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: "1.5vh", marginTop: "2vh" }}>Investment</div>
        <div style={{ marginTop: "auto", fontSize: "0.75vw", color: "#565F89" }}>v1.0 · 2026</div>
      </div>
      <div style={{ flex: 1, padding: "6vh 4vw", display: "flex", flexDirection: "column" }}>
        <div style={{ fontSize: "0.9vw", color: "#7AA2F7", textTransform: "uppercase", letterSpacing: "0.08em", fontWeight: 600, marginBottom: "2vh" }}>Simulators</div>
        <h1 style={{ fontSize: "3.5vw", fontWeight: 700, color: "#FFFFFF", margin: "0 0 1.5vh 0", letterSpacing: "-0.02em" }}>Quantum and Antimatter Layer</h1>
        <p style={{ fontSize: "1.1vw", color: "#9AA5CE", lineHeight: 1.6, maxWidth: "42vw", margin: "0 0 3.5vh 0" }}>
          AETHER treats physics laws as cognitive design constraints. Dirac 1928 → Anderson 1932: prediction before observation — the AETHER standard.
        </p>
        <div style={{ display: "flex", gap: "3vw" }}>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: "1vw", fontWeight: 600, color: "#FFFFFF", borderBottom: "1px solid rgba(255,255,255,0.08)", paddingBottom: "0.8vh", marginBottom: "2vh" }}>CPT Symmetry Schema</div>
            <div style={{ backgroundColor: "#16161E", borderRadius: "0.4vw", padding: "2vh 1.8vw", border: "1px solid rgba(255,255,255,0.05)", fontFamily: "'DM Mono', monospace", fontSize: "0.9vw", lineHeight: 1.8 }}>
              <div style={{ color: "#C0CAF5" }}>type <span style={{ color: "#7AA2F7" }}>CPTSymmetry</span> {"{"}</div>
              <div style={{ paddingLeft: "1.5vw" }}><span style={{ color: "#E0AF68" }}>C</span>: <span style={{ color: "#9ECE6A" }}>"charge conjugation"</span></div>
              <div style={{ paddingLeft: "1.5vw" }}><span style={{ color: "#E0AF68" }}>P</span>: <span style={{ color: "#9ECE6A" }}>"parity inversion"</span></div>
              <div style={{ paddingLeft: "1.5vw" }}><span style={{ color: "#E0AF68" }}>T</span>: <span style={{ color: "#9ECE6A" }}>"time reversal"</span></div>
              <div style={{ paddingLeft: "1.5vw", color: "#565F89" }}>// coherence under transformation</div>
              <div style={{ color: "#C0CAF5" }}>{"}"}</div>
            </div>
            <div style={{ marginTop: "2vh", backgroundColor: "#16161E", borderRadius: "0.4vw", padding: "1.5vh 1.8vw", border: "1px solid rgba(255,255,255,0.05)", fontFamily: "'DM Mono', monospace", fontSize: "0.88vw", lineHeight: 1.7 }}>
              <div style={{ color: "#7AA2F7" }}>timeline <span style={{ color: "#C0CAF5" }}>{"{"}</span></div>
              <div style={{ paddingLeft: "1.5vw" }}><span style={{ color: "#FF9E64" }}>1928</span>: <span style={{ color: "#9ECE6A" }}>"Dirac predicts antimatter"</span>,</div>
              <div style={{ paddingLeft: "1.5vw" }}><span style={{ color: "#FF9E64" }}>1932</span>: <span style={{ color: "#9ECE6A" }}>"Anderson observes positron"</span></div>
              <div style={{ color: "#C0CAF5" }}>{"}"}</div>
            </div>
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: "1vw", fontWeight: 600, color: "#FFFFFF", borderBottom: "1px solid rgba(255,255,255,0.08)", paddingBottom: "0.8vh", marginBottom: "2vh" }}>AETHER Design Constraints</div>
            <div style={{ display: "flex", flexDirection: "column", gap: "2vh" }}>
              <div style={{ backgroundColor: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: "0.4vw", padding: "1.5vh 1.5vw" }}>
                <div style={{ fontSize: "0.95vw", color: "#FFFFFF", fontWeight: 600, marginBottom: "0.5vh" }}>Coherence under transformation</div>
                <div style={{ fontSize: "0.88vw", color: "#9AA5CE" }}>CPT symmetry: structure is preserved across charge, parity, and time. AETHER: knowledge remains coherent across agent, format, and time.</div>
              </div>
              <div style={{ backgroundColor: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: "0.4vw", padding: "1.5vh 1.5vw" }}>
                <div style={{ fontSize: "0.95vw", color: "#FFFFFF", fontWeight: 600, marginBottom: "0.5vh" }}>Prediction before observation</div>
                <div style={{ fontSize: "0.88vw", color: "#9AA5CE" }}>Dirac derived the positron mathematically before it was detected. AETHER's gap detection surfaces missing knowledge before it is named.</div>
              </div>
              <div style={{ backgroundColor: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: "0.4vw", padding: "1.5vh 1.5vw" }}>
                <div style={{ fontSize: "0.95vw", color: "#FFFFFF", fontWeight: 600, marginBottom: "0.5vh" }}>PET scan proof-of-concept</div>
                <div style={{ fontSize: "0.88vw", color: "#9AA5CE" }}>Antimatter detected in living tissue, clinically. Physics that seemed purely theoretical became medical infrastructure.</div>
              </div>
            </div>
          </div>
        </div>
        <div style={{ marginTop: "auto", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div style={{ fontSize: "0.9vw", color: "#565F89", fontWeight: 600 }}>10</div>
          <div style={{ fontSize: "0.8vw", color: "#565F89" }}>AETHER Knowledge System, Inc.</div>
        </div>
      </div>
    </div>
  );
}
