export default function Slide01Cover() {
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
          <div style={{ fontSize: "0.9vw", color: "#7AA2F7", fontWeight: 600, display: "flex", alignItems: "center", gap: "0.6vw" }}>
            <span style={{ width: "3px", height: "1.1vw", backgroundColor: "#7AA2F7", borderRadius: "2px", marginLeft: "-2.5vw", flexShrink: 0 }} />
            AETHER
          </div>
          <div style={{ fontSize: "0.9vw", color: "#C0CAF5", opacity: 0.55 }}>The Problem</div>
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

      {/* Main Content */}
      <div style={{ flex: 1, padding: "6vh 4vw", display: "flex", flexDirection: "column", position: "relative" }}>
        <div style={{ fontSize: "0.9vw", color: "#7AA2F7", textTransform: "uppercase", letterSpacing: "0.08em", fontWeight: 600, marginBottom: "2vh" }}>Knowledge Operating System</div>
        <h1 style={{ fontSize: "5vw", fontWeight: 700, color: "#FFFFFF", margin: "0 0 2vh 0", letterSpacing: "-0.03em", lineHeight: 1.1 }}>AETHER</h1>
        <p style={{ fontSize: "1.4vw", color: "#9AA5CE", lineHeight: 1.6, maxWidth: "38vw", margin: "0 0 4vh 0", fontWeight: 400 }}>
          A self-synthesising knowledge operating system built on the Crystallization Model of Intelligence.
        </p>
        <div style={{ display: "flex", alignItems: "center", padding: "1.5vh 1.8vw", backgroundColor: "rgba(158,206,106,0.08)", border: "1px solid rgba(158,206,106,0.2)", borderRadius: "0.4vw", marginBottom: "4vh", width: "fit-content" }}>
          <div style={{ fontSize: "1vw", fontWeight: 700, color: "#9ECE6A", marginRight: "1.2vw", fontFamily: "'DM Mono', monospace" }}>GET</div>
          <div style={{ fontSize: "1.1vw", color: "#FFFFFF", fontFamily: "'DM Mono', monospace" }}>/aether/v1/synthesise</div>
        </div>
        <div style={{ display: "flex", gap: "3vw" }}>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: "1.1vw", fontWeight: 600, color: "#FFFFFF", borderBottom: "1px solid rgba(255,255,255,0.08)", paddingBottom: "0.8vh", marginBottom: "2vh" }}>Request</div>
            <div style={{ backgroundColor: "#16161E", borderRadius: "0.4vw", padding: "2vh 1.8vw", border: "1px solid rgba(255,255,255,0.05)", fontFamily: "'DM Mono', monospace", fontSize: "0.95vw", lineHeight: 1.7 }}>
              <div style={{ color: "#7AA2F7" }}>POST <span style={{ color: "#C0CAF5" }}>/aether/v1/synthesise</span></div>
              <div style={{ color: "#C0CAF5", marginTop: "1vh" }}>{`{`}</div>
              <div style={{ paddingLeft: "1.5vw", color: "#C0CAF5" }}><span style={{ color: "#7AA2F7" }}>"source"</span>: <span style={{ color: "#9ECE6A" }}>"pdf | image | text"</span>,</div>
              <div style={{ paddingLeft: "1.5vw", color: "#C0CAF5" }}><span style={{ color: "#7AA2F7" }}>"mode"</span>: <span style={{ color: "#9ECE6A" }}>"crystallise"</span>,</div>
              <div style={{ paddingLeft: "1.5vw", color: "#C0CAF5" }}><span style={{ color: "#7AA2F7" }}>"agent"</span>: <span style={{ color: "#9ECE6A" }}>"aletheia"</span></div>
              <div style={{ color: "#C0CAF5" }}>{`}`}</div>
            </div>
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid rgba(255,255,255,0.08)", paddingBottom: "0.8vh", marginBottom: "2vh" }}>
              <div style={{ fontSize: "1.1vw", fontWeight: 600, color: "#FFFFFF" }}>Response</div>
              <div style={{ display: "flex", alignItems: "center", gap: "0.4vw" }}>
                <div style={{ width: "0.5vw", height: "0.5vw", backgroundColor: "#9ECE6A", borderRadius: "50%" }} />
                <div style={{ fontSize: "0.85vw", fontFamily: "'DM Mono', monospace", color: "#9ECE6A" }}>200 OK</div>
              </div>
            </div>
            <div style={{ backgroundColor: "#16161E", borderRadius: "0.4vw", padding: "2vh 1.8vw", border: "1px solid rgba(255,255,255,0.05)", fontFamily: "'DM Mono', monospace", fontSize: "0.95vw", lineHeight: 1.7 }}>
              <div style={{ color: "#C0CAF5" }}>{`{`}</div>
              <div style={{ paddingLeft: "1.5vw" }}><span style={{ color: "#7AA2F7" }}>"status"</span>: <span style={{ color: "#9ECE6A" }}>"crystallised"</span>,</div>
              <div style={{ paddingLeft: "1.5vw" }}><span style={{ color: "#7AA2F7" }}>"nodes_added"</span>: <span style={{ color: "#FF9E64" }}>47</span>,</div>
              <div style={{ paddingLeft: "1.5vw" }}><span style={{ color: "#7AA2F7" }}>"coherence_score"</span>: <span style={{ color: "#FF9E64" }}>0.94</span>,</div>
              <div style={{ paddingLeft: "1.5vw" }}><span style={{ color: "#7AA2F7" }}>"agent"</span>: <span style={{ color: "#9ECE6A" }}>"aletheia"</span></div>
              <div style={{ color: "#C0CAF5" }}>{`}`}</div>
            </div>
          </div>
        </div>
        <div style={{ marginTop: "auto", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div style={{ fontSize: "0.9vw", color: "#565F89", fontWeight: 600 }}>01</div>
          <div style={{ fontSize: "0.8vw", color: "#565F89" }}>AETHER Knowledge System, Inc.</div>
        </div>
      </div>
    </div>
  );
}
