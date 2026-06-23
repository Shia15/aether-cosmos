export default function Slide02Problem() {
  return (
    <div style={{ width: "100vw", height: "100vh", overflow: "hidden", backgroundColor: "#1A1B26", fontFamily: "'Inter', sans-serif", display: "flex", color: "#C0CAF5", position: "relative" }}>
      {/* Sidebar */}
      <div style={{ width: "22vw", height: "100vh", borderRight: "1px solid rgba(255,255,255,0.05)", padding: "4vh 2.5vw", display: "flex", flexDirection: "column", flexShrink: 0 }}>
        <div style={{ display: "flex", alignItems: "center", gap: "0.8vw", marginBottom: "5vh" }}>
          <div style={{ width: "1.4vw", height: "1.4vw", backgroundColor: "#7AA2F7", borderRadius: "0.25vw" }} />
          <div style={{ fontSize: "1.1vw", fontWeight: 700, color: "#FFFFFF", letterSpacing: "0.04em" }}>AETHER</div>
        </div>
        <div style={{ fontSize: "0.75vw", fontWeight: 600, color: "#565F89", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: "1.5vh" }}>Overview</div>
        <div style={{ display: "flex", flexDirection: "column", gap: "1.2vh", marginBottom: "3.5vh" }}>
          <div style={{ fontSize: "0.9vw", color: "#C0CAF5", opacity: 0.55 }}>AETHER</div>
          <div style={{ fontSize: "0.9vw", color: "#7AA2F7", fontWeight: 600, display: "flex", alignItems: "center", gap: "0.6vw" }}>
            <span style={{ width: "3px", height: "1.1vw", backgroundColor: "#7AA2F7", borderRadius: "2px", marginLeft: "-2.5vw", flexShrink: 0 }} />
            The Problem
          </div>
          <div style={{ fontSize: "0.9vw", color: "#C0CAF5", opacity: 0.55 }}>Crystallization Model</div>
        </div>
        <div style={{ fontSize: "0.75vw", fontWeight: 600, color: "#565F89", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: "1.5vh" }}>Architecture</div>
        <div style={{ display: "flex", flexDirection: "column", gap: "1.2vh", marginBottom: "3.5vh" }}>
          <div style={{ fontSize: "0.9vw", color: "#C0CAF5", opacity: 0.55 }}>Knowledge Graph</div>
          <div style={{ fontSize: "0.9vw", color: "#C0CAF5", opacity: 0.55 }}>M.A.R.I. Agents</div>
          <div style={{ fontSize: "0.9vw", color: "#C0CAF5", opacity: 0.55 }}>Cognitive Functions</div>
          <div style={{ fontSize: "0.9vw", color: "#C0CAF5", opacity: 0.55 }}>Document Ingestion</div>
        </div>
        <div style={{ fontSize: "0.75vw", fontWeight: 600, color: "#565F89", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: "1.5vh" }}>Simulators</div>
        <div style={{ fontSize: "0.75vw", fontWeight: 600, color: "#565F89", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: "1.5vh", marginTop: "2vh" }}>Products</div>
        <div style={{ fontSize: "0.75vw", fontWeight: 600, color: "#565F89", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: "1.5vh", marginTop: "2vh" }}>Investment</div>
        <div style={{ marginTop: "auto", fontSize: "0.75vw", color: "#565F89" }}>v1.0 · 2026</div>
      </div>

      {/* Main */}
      <div style={{ flex: 1, padding: "6vh 4vw", display: "flex", flexDirection: "column" }}>
        <div style={{ fontSize: "0.9vw", color: "#7AA2F7", textTransform: "uppercase", letterSpacing: "0.08em", fontWeight: 600, marginBottom: "2vh" }}>Overview</div>
        <h1 style={{ fontSize: "3.8vw", fontWeight: 700, color: "#FFFFFF", margin: "0 0 1.5vh 0", letterSpacing: "-0.02em" }}>The Problem</h1>
        <p style={{ fontSize: "1.3vw", color: "#9AA5CE", lineHeight: 1.6, maxWidth: "38vw", margin: "0 0 5vh 0" }}>
          Data accumulates. Insight does not. The gap between information and understanding is widening.
        </p>
        <div style={{ display: "flex", flexDirection: "column", gap: "3.5vh", maxWidth: "52vw" }}>
          <div style={{ display: "flex", alignItems: "flex-start", gap: "2vw" }}>
            <div style={{ width: "2.8vw", height: "2.8vw", borderRadius: "50%", backgroundColor: "rgba(255,158,100,0.1)", display: "flex", alignItems: "center", justifyContent: "center", color: "#FF9E64", fontSize: "1.1vw", fontWeight: 700, flexShrink: 0 }}>01</div>
            <div>
              <div style={{ fontSize: "1.3vw", color: "#FFFFFF", fontWeight: 600, marginBottom: "0.8vh" }}>Knowledge is fragmented</div>
              <div style={{ fontSize: "1.1vw", color: "#9AA5CE", lineHeight: 1.55 }}>PDFs, notes, research, and conversations exist in silos. No coherence layer connects them into a compounding structure.</div>
            </div>
          </div>
          <div style={{ display: "flex", alignItems: "flex-start", gap: "2vw" }}>
            <div style={{ width: "2.8vw", height: "2.8vw", borderRadius: "50%", backgroundColor: "rgba(122,162,247,0.1)", display: "flex", alignItems: "center", justifyContent: "center", color: "#7AA2F7", fontSize: "1.1vw", fontWeight: 700, flexShrink: 0 }}>02</div>
            <div>
              <div style={{ fontSize: "1.3vw", color: "#FFFFFF", fontWeight: 600, marginBottom: "0.8vh" }}>AI agents lack coherence architecture</div>
              <div style={{ fontSize: "1.1vw", color: "#9AA5CE", lineHeight: 1.55 }}>Current agent frameworks treat tasks as isolated calls. They have no memory topology, no shared cognitive map, no synthesis layer.</div>
            </div>
          </div>
          <div style={{ display: "flex", alignItems: "flex-start", gap: "2vw" }}>
            <div style={{ width: "2.8vw", height: "2.8vw", borderRadius: "50%", backgroundColor: "rgba(158,206,106,0.1)", display: "flex", alignItems: "center", justifyContent: "center", color: "#9ECE6A", fontSize: "1.1vw", fontWeight: 700, flexShrink: 0 }}>03</div>
            <div>
              <div style={{ fontSize: "1.3vw", color: "#FFFFFF", fontWeight: 600, marginBottom: "0.8vh" }}>Organisations accumulate data without crystallising insight</div>
              <div style={{ fontSize: "1.1vw", color: "#9AA5CE", lineHeight: 1.55 }}>Retrieval is not synthesis. Search returns results; it does not produce understanding. The crystallisation step is missing.</div>
            </div>
          </div>
        </div>
        <div style={{ marginTop: "auto", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div style={{ fontSize: "0.9vw", color: "#565F89", fontWeight: 600 }}>02</div>
          <div style={{ fontSize: "0.8vw", color: "#565F89" }}>AETHER Knowledge System, Inc.</div>
        </div>
      </div>
    </div>
  );
}
