export default function Slide09RegulatoryDepth() {
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
          <div style={{ fontSize: "0.9vw", color: "#7AA2F7", fontWeight: 600, display: "flex", alignItems: "center", gap: "0.6vw" }}>
            <span style={{ width: "3px", height: "1.1vw", backgroundColor: "#7AA2F7", borderRadius: "2px", marginLeft: "-2.5vw", flexShrink: 0 }} />
            Regulatory Depth
          </div>
          <div style={{ fontSize: "0.9vw", color: "#C0CAF5", opacity: 0.55 }}>Quantum Layer</div>
        </div>
        <div style={{ fontSize: "0.75vw", fontWeight: 600, color: "#565F89", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: "1.5vh" }}>Products</div>
        <div style={{ fontSize: "0.75vw", fontWeight: 600, color: "#565F89", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: "1.5vh", marginTop: "2vh" }}>Investment</div>
        <div style={{ marginTop: "auto", fontSize: "0.75vw", color: "#565F89" }}>v1.0 · 2026</div>
      </div>
      <div style={{ flex: 1, padding: "6vh 4vw", display: "flex", flexDirection: "column" }}>
        <div style={{ fontSize: "0.9vw", color: "#7AA2F7", textTransform: "uppercase", letterSpacing: "0.08em", fontWeight: 600, marginBottom: "2vh" }}>Simulators</div>
        <h1 style={{ fontSize: "3.5vw", fontWeight: 700, color: "#FFFFFF", margin: "0 0 1.5vh 0", letterSpacing: "-0.02em" }}>Regulatory Depth · Biological Intelligence</h1>
        <p style={{ fontSize: "1.1vw", color: "#9AA5CE", lineHeight: 1.6, maxWidth: "44vw", margin: "0 0 3.5vh 0" }}>
          Four biological levers inform AETHER's architecture. Intelligence is not a layer — it is a tunable, recursive substrate.
        </p>
        <div style={{ display: "flex", flexDirection: "column", gap: "2.2vh", maxWidth: "54vw" }}>
          <div style={{ display: "flex", gap: "1.8vw", alignItems: "center" }}>
            <div style={{ width: "2.8vw", height: "2.8vw", borderRadius: "50%", backgroundColor: "rgba(158,206,106,0.1)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
              <div style={{ fontSize: "0.75vw", fontFamily: "'DM Mono', monospace", color: "#9ECE6A", fontWeight: 700 }}>L1</div>
            </div>
            <div>
              <div style={{ fontSize: "1.1vw", color: "#FFFFFF", fontWeight: 600 }}>Epigenetic Switches</div>
              <div style={{ fontSize: "0.95vw", color: "#9AA5CE" }}>DNA methylation + histone modification — context-sensitive gene expression without sequence change. AETHER analogue: coherence-weighted node activation.</div>
            </div>
          </div>
          <div style={{ display: "flex", gap: "1.8vw", alignItems: "center" }}>
            <div style={{ width: "2.8vw", height: "2.8vw", borderRadius: "50%", backgroundColor: "rgba(122,162,247,0.1)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
              <div style={{ fontSize: "0.75vw", fontFamily: "'DM Mono', monospace", color: "#7AA2F7", fontWeight: 700 }}>L2</div>
            </div>
            <div>
              <div style={{ fontSize: "1.1vw", color: "#FFFFFF", fontWeight: 600 }}>Alternative Splicing</div>
              <div style={{ fontSize: "0.95vw", color: "#9AA5CE" }}>One gene, many proteins — context determines output. AETHER analogue: one knowledge node, multiple agent interpretations.</div>
            </div>
          </div>
          <div style={{ display: "flex", gap: "1.8vw", alignItems: "center" }}>
            <div style={{ width: "2.8vw", height: "2.8vw", borderRadius: "50%", backgroundColor: "rgba(224,175,104,0.1)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
              <div style={{ fontSize: "0.75vw", fontFamily: "'DM Mono', monospace", color: "#E0AF68", fontWeight: 700 }}>L3</div>
            </div>
            <div>
              <div style={{ fontSize: "1.1vw", color: "#FFFFFF", fontWeight: 600 }}>ncRNA Regulation</div>
              <div style={{ fontSize: "0.95vw", color: "#9AA5CE" }}>microRNA + lncRNA — post-transcriptional fine-tuning. AETHER analogue: Nyra/Fe feedback layer modulating agent output after generation.</div>
            </div>
          </div>
          <div style={{ display: "flex", gap: "1.8vw", alignItems: "center" }}>
            <div style={{ width: "2.8vw", height: "2.8vw", borderRadius: "50%", backgroundColor: "rgba(255,158,100,0.1)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
              <div style={{ fontSize: "0.75vw", fontFamily: "'DM Mono', monospace", color: "#FF9E64", fontWeight: 700 }}>L4</div>
            </div>
            <div>
              <div style={{ fontSize: "1.1vw", color: "#FFFFFF", fontWeight: 600 }}>Cross-System Feedback Loops</div>
              <div style={{ fontSize: "0.95vw", color: "#9AA5CE" }}>4-node cross-domain feedback: immune-neural-endocrine-metabolic. AETHER analogue: the 8-agent mesh — every agent reads from and writes to every other.</div>
            </div>
          </div>
        </div>
        <div style={{ marginTop: "auto", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div style={{ fontSize: "0.9vw", color: "#565F89", fontWeight: 600 }}>09</div>
          <div style={{ fontSize: "0.8vw", color: "#565F89" }}>AETHER Knowledge System, Inc.</div>
        </div>
      </div>
    </div>
  );
}
