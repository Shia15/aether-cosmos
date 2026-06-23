export default function Slide04KnowledgeGraph() {
  return (
    <div style={{ width: "100vw", height: "100vh", overflow: "hidden", backgroundColor: "#1A1B26", fontFamily: "'Inter', sans-serif", display: "flex", color: "#C0CAF5", position: "relative" }}>
      <div style={{ width: "22vw", height: "100vh", borderRight: "1px solid rgba(255,255,255,0.05)", padding: "4vh 2.5vw", display: "flex", flexDirection: "column", flexShrink: 0 }}>
        <div style={{ display: "flex", alignItems: "center", gap: "0.8vw", marginBottom: "5vh" }}>
          <div style={{ width: "1.4vw", height: "1.4vw", backgroundColor: "#7AA2F7", borderRadius: "0.25vw" }} />
          <div style={{ fontSize: "1.1vw", fontWeight: 700, color: "#FFFFFF", letterSpacing: "0.04em" }}>AETHER</div>
        </div>
        <div style={{ fontSize: "0.75vw", fontWeight: 600, color: "#565F89", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: "1.5vh" }}>Overview</div>
        <div style={{ display: "flex", flexDirection: "column", gap: "1.2vh", marginBottom: "3.5vh" }}>
          <div style={{ fontSize: "0.9vw", color: "#C0CAF5", opacity: 0.45 }}>AETHER</div>
          <div style={{ fontSize: "0.9vw", color: "#C0CAF5", opacity: 0.45 }}>The Problem</div>
          <div style={{ fontSize: "0.9vw", color: "#C0CAF5", opacity: 0.45 }}>Crystallization Model</div>
        </div>
        <div style={{ fontSize: "0.75vw", fontWeight: 600, color: "#565F89", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: "1.5vh" }}>Architecture</div>
        <div style={{ display: "flex", flexDirection: "column", gap: "1.2vh", marginBottom: "3.5vh" }}>
          <div style={{ fontSize: "0.9vw", color: "#7AA2F7", fontWeight: 600, display: "flex", alignItems: "center", gap: "0.6vw" }}>
            <span style={{ width: "3px", height: "1.1vw", backgroundColor: "#7AA2F7", borderRadius: "2px", marginLeft: "-2.5vw", flexShrink: 0 }} />
            Knowledge Graph
          </div>
          <div style={{ fontSize: "0.9vw", color: "#C0CAF5", opacity: 0.55 }}>M.A.R.I. Agents</div>
          <div style={{ fontSize: "0.9vw", color: "#C0CAF5", opacity: 0.55 }}>Cognitive Functions</div>
          <div style={{ fontSize: "0.9vw", color: "#C0CAF5", opacity: 0.55 }}>Document Ingestion</div>
        </div>
        <div style={{ fontSize: "0.75vw", fontWeight: 600, color: "#565F89", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: "1.5vh" }}>Simulators</div>
        <div style={{ fontSize: "0.75vw", fontWeight: 600, color: "#565F89", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: "1.5vh", marginTop: "2vh" }}>Products</div>
        <div style={{ fontSize: "0.75vw", fontWeight: 600, color: "#565F89", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: "1.5vh", marginTop: "2vh" }}>Investment</div>
        <div style={{ marginTop: "auto", fontSize: "0.75vw", color: "#565F89" }}>v1.0 · 2026</div>
      </div>
      <div style={{ flex: 1, padding: "6vh 4vw", display: "flex", flexDirection: "column" }}>
        <div style={{ fontSize: "0.9vw", color: "#7AA2F7", textTransform: "uppercase", letterSpacing: "0.08em", fontWeight: 600, marginBottom: "2vh" }}>Architecture</div>
        <h1 style={{ fontSize: "3.5vw", fontWeight: 700, color: "#FFFFFF", margin: "0 0 1.5vh 0", letterSpacing: "-0.02em" }}>The Knowledge Graph</h1>
        <p style={{ fontSize: "1.2vw", color: "#9AA5CE", lineHeight: 1.6, maxWidth: "40vw", margin: "0 0 3.5vh 0" }}>
          A semantic coherence engine with 3,000+ nodes. Not a static index — a living structure that recrystallises as inputs arrive.
        </p>
        <div style={{ display: "flex", gap: "3vw" }}>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: "1.1vw", fontWeight: 600, color: "#FFFFFF", borderBottom: "1px solid rgba(255,255,255,0.08)", paddingBottom: "0.8vh", marginBottom: "2vh" }}>Node Schema</div>
            <div style={{ backgroundColor: "#16161E", borderRadius: "0.4vw", padding: "2vh 1.8vw", border: "1px solid rgba(255,255,255,0.05)", fontFamily: "'DM Mono', monospace", fontSize: "0.92vw", lineHeight: 1.75 }}>
              <div style={{ color: "#C0CAF5" }}>type <span style={{ color: "#7AA2F7" }}>KnowledgeNode</span> {"{"}</div>
              <div style={{ paddingLeft: "1.5vw", color: "#C0CAF5" }}><span style={{ color: "#E0AF68" }}>id</span>: <span style={{ color: "#9ECE6A" }}>string</span></div>
              <div style={{ paddingLeft: "1.5vw", color: "#C0CAF5" }}><span style={{ color: "#E0AF68" }}>concept</span>: <span style={{ color: "#9ECE6A" }}>string</span></div>
              <div style={{ paddingLeft: "1.5vw", color: "#C0CAF5" }}><span style={{ color: "#E0AF68" }}>weight</span>: <span style={{ color: "#FF9E64" }}>float</span></div>
              <div style={{ paddingLeft: "1.5vw", color: "#C0CAF5" }}><span style={{ color: "#E0AF68" }}>domain</span>: <span style={{ color: "#9ECE6A" }}>string[]</span></div>
              <div style={{ paddingLeft: "1.5vw", color: "#C0CAF5" }}><span style={{ color: "#E0AF68" }}>edges</span>: <span style={{ color: "#7AA2F7" }}>Edge[]</span></div>
              <div style={{ paddingLeft: "1.5vw", color: "#C0CAF5" }}><span style={{ color: "#E0AF68" }}>coherence_score</span>: <span style={{ color: "#FF9E64" }}>float</span></div>
              <div style={{ color: "#C0CAF5" }}>{"}"}</div>
            </div>
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid rgba(255,255,255,0.08)", paddingBottom: "0.8vh", marginBottom: "2vh" }}>
              <div style={{ fontSize: "1.1vw", fontWeight: 600, color: "#FFFFFF" }}>Live Query</div>
              <div style={{ display: "flex", alignItems: "center", gap: "0.4vw" }}>
                <div style={{ width: "0.5vw", height: "0.5vw", backgroundColor: "#9ECE6A", borderRadius: "50%" }} />
                <div style={{ fontSize: "0.85vw", fontFamily: "'DM Mono', monospace", color: "#9ECE6A" }}>3,000+ nodes</div>
              </div>
            </div>
            <div style={{ backgroundColor: "#16161E", borderRadius: "0.4vw", padding: "2vh 1.8vw", border: "1px solid rgba(255,255,255,0.05)", fontFamily: "'DM Mono', monospace", fontSize: "0.92vw", lineHeight: 1.75 }}>
              <div style={{ color: "#7AA2F7" }}>GET <span style={{ color: "#C0CAF5" }}>/graph/neighbours</span></div>
              <div style={{ color: "#C0CAF5", marginTop: "0.8vh" }}>{"{"}</div>
              <div style={{ paddingLeft: "1.5vw" }}><span style={{ color: "#7AA2F7" }}>"node"</span>: <span style={{ color: "#9ECE6A" }}>"crystallisation"</span>,</div>
              <div style={{ paddingLeft: "1.5vw" }}><span style={{ color: "#7AA2F7" }}>"depth"</span>: <span style={{ color: "#FF9E64" }}>2</span>,</div>
              <div style={{ paddingLeft: "1.5vw" }}><span style={{ color: "#7AA2F7" }}>"min_coherence"</span>: <span style={{ color: "#FF9E64" }}>0.7</span></div>
              <div style={{ color: "#C0CAF5" }}>{"}"}</div>
              <div style={{ color: "#565F89", marginTop: "1.2vh" }}>// returns 47 related nodes</div>
              <div style={{ color: "#565F89" }}>// gap_detected: true → ["entropy", "lattice"]</div>
            </div>
          </div>
        </div>
        <div style={{ marginTop: "3vh", display: "flex", gap: "1.5vw" }}>
          <div style={{ flex: 1, backgroundColor: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: "0.4vw", padding: "1.5vh 1.5vw" }}>
            <div style={{ fontSize: "1vw", color: "#FFFFFF", fontWeight: 600, marginBottom: "0.5vh" }}>Semantic Search</div>
            <div style={{ fontSize: "0.92vw", color: "#9AA5CE" }}>Query by meaning, not keyword</div>
          </div>
          <div style={{ flex: 1, backgroundColor: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: "0.4vw", padding: "1.5vh 1.5vw" }}>
            <div style={{ fontSize: "1vw", color: "#FFFFFF", fontWeight: 600, marginBottom: "0.5vh" }}>Path Inference</div>
            <div style={{ fontSize: "0.92vw", color: "#9AA5CE" }}>Find routes between concepts</div>
          </div>
          <div style={{ flex: 1, backgroundColor: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: "0.4vw", padding: "1.5vh 1.5vw" }}>
            <div style={{ fontSize: "1vw", color: "#FFFFFF", fontWeight: 600, marginBottom: "0.5vh" }}>Gap Detection</div>
            <div style={{ fontSize: "0.92vw", color: "#9AA5CE" }}>Surface missing connections</div>
          </div>
        </div>
        <div style={{ marginTop: "auto", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div style={{ fontSize: "0.9vw", color: "#565F89", fontWeight: 600 }}>04</div>
          <div style={{ fontSize: "0.8vw", color: "#565F89" }}>AETHER Knowledge System, Inc.</div>
        </div>
      </div>
    </div>
  );
}
