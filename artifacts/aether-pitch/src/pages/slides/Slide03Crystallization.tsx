export default function Slide03Crystallization() {
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
          <div style={{ fontSize: "0.9vw", color: "#C0CAF5", opacity: 0.55 }}>The Problem</div>
          <div style={{ fontSize: "0.9vw", color: "#7AA2F7", fontWeight: 600, display: "flex", alignItems: "center", gap: "0.6vw" }}>
            <span style={{ width: "3px", height: "1.1vw", backgroundColor: "#7AA2F7", borderRadius: "2px", marginLeft: "-2.5vw", flexShrink: 0 }} />
            Crystallization Model
          </div>
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
        <div style={{ fontSize: "0.9vw", color: "#7AA2F7", textTransform: "uppercase", letterSpacing: "0.08em", fontWeight: 600, marginBottom: "2vh" }}>Core Thesis</div>
        <h1 style={{ fontSize: "3.5vw", fontWeight: 700, color: "#FFFFFF", margin: "0 0 1.5vh 0", letterSpacing: "-0.02em" }}>The Crystallization Model</h1>
        <p style={{ fontSize: "1.2vw", color: "#9AA5CE", lineHeight: 1.6, maxWidth: "40vw", margin: "0 0 4vh 0" }}>
          Intelligence is not retrieval — it is crystallisation. Raw data enters as noise; structured synthesis produces coherent, compounding knowledge.
        </p>
        <div style={{ display: "flex", alignItems: "center", gap: "1.5vw", marginBottom: "4vh" }}>
          <div style={{ backgroundColor: "#16161E", border: "1px solid rgba(255,158,100,0.3)", borderRadius: "0.4vw", padding: "2vh 1.8vw", textAlign: "center", flex: 1 }}>
            <div style={{ fontSize: "0.8vw", color: "#FF9E64", fontFamily: "'DM Mono', monospace", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "1vh" }}>L0 · Raw Input</div>
            <div style={{ fontSize: "1vw", color: "#C0CAF5", fontFamily: "'DM Mono', monospace" }}>pdf · image · note · url</div>
            <div style={{ fontSize: "0.8vw", color: "#565F89", marginTop: "0.8vh" }}>noise, unstructured</div>
          </div>
          <div style={{ fontSize: "1.5vw", color: "#565F89" }}>→</div>
          <div style={{ backgroundColor: "#16161E", border: "1px solid rgba(122,162,247,0.3)", borderRadius: "0.4vw", padding: "2vh 1.8vw", textAlign: "center", flex: 1 }}>
            <div style={{ fontSize: "0.8vw", color: "#7AA2F7", fontFamily: "'DM Mono', monospace", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "1vh" }}>L1–L4 · Synthesis</div>
            <div style={{ fontSize: "1vw", color: "#C0CAF5", fontFamily: "'DM Mono', monospace" }}>extract · cluster · score</div>
            <div style={{ fontSize: "0.8vw", color: "#565F89", marginTop: "0.8vh" }}>CLCS coherence pipeline</div>
          </div>
          <div style={{ fontSize: "1.5vw", color: "#565F89" }}>→</div>
          <div style={{ backgroundColor: "#16161E", border: "1px solid rgba(158,206,106,0.3)", borderRadius: "0.4vw", padding: "2vh 1.8vw", textAlign: "center", flex: 1 }}>
            <div style={{ fontSize: "0.8vw", color: "#9ECE6A", fontFamily: "'DM Mono', monospace", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "1vh" }}>L5 · Crystal</div>
            <div style={{ fontSize: "1vw", color: "#C0CAF5", fontFamily: "'DM Mono', monospace" }}>node · edge · weight</div>
            <div style={{ fontSize: "0.8vw", color: "#565F89", marginTop: "0.8vh" }}>positioned knowledge</div>
          </div>
        </div>
        <div style={{ display: "flex", gap: "2.5vw" }}>
          <div style={{ flex: 1, backgroundColor: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: "0.4vw", padding: "2vh 1.8vw" }}>
            <div style={{ fontSize: "1.1vw", color: "#FFFFFF", fontWeight: 600, marginBottom: "1vh" }}>Compounding</div>
            <div style={{ fontSize: "1vw", color: "#9AA5CE", lineHeight: 1.55 }}>Each new document does not start fresh. It crystallises into the existing graph — reinforcing, extending, or correcting existing nodes.</div>
          </div>
          <div style={{ flex: 1, backgroundColor: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: "0.4vw", padding: "2vh 1.8vw" }}>
            <div style={{ fontSize: "1.1vw", color: "#FFFFFF", fontWeight: 600, marginBottom: "1vh" }}>Coherence Score</div>
            <div style={{ fontSize: "1vw", color: "#9AA5CE", lineHeight: 1.55 }}>Every edge carries a coherence weight. The system knows which connections are strong, which are speculative, and which are contradictions.</div>
          </div>
          <div style={{ flex: 1, backgroundColor: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: "0.4vw", padding: "2vh 1.8vw" }}>
            <div style={{ fontSize: "1.1vw", color: "#FFFFFF", fontWeight: 600, marginBottom: "1vh" }}>Source: AETHER Foundations</div>
            <div style={{ fontSize: "1vw", color: "#9AA5CE", lineHeight: 1.55 }}>Derived from the Crystallization Model of Intelligence — the theoretical substrate powering all AETHER modules.</div>
          </div>
        </div>
        <div style={{ marginTop: "auto", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div style={{ fontSize: "0.9vw", color: "#565F89", fontWeight: 600 }}>03</div>
          <div style={{ fontSize: "0.8vw", color: "#565F89" }}>AETHER Knowledge System, Inc.</div>
        </div>
      </div>
    </div>
  );
}
