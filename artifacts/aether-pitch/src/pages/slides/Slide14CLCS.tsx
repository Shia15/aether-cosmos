export default function Slide14CLCS() {
  return (
    <div style={{ width: "100vw", height: "100vh", overflow: "hidden", backgroundColor: "#1A1B26", fontFamily: "'Inter', sans-serif", display: "flex", color: "#C0CAF5", position: "relative" }}>
      <div style={{ width: "22vw", height: "100vh", borderRight: "1px solid rgba(255,255,255,0.05)", padding: "4vh 2.5vw", display: "flex", flexDirection: "column", flexShrink: 0 }}>
        <div style={{ display: "flex", alignItems: "center", gap: "0.8vw", marginBottom: "5vh" }}>
          <div style={{ width: "1.4vw", height: "1.4vw", backgroundColor: "#7AA2F7", borderRadius: "0.25vw" }} />
          <div style={{ fontSize: "1.1vw", fontWeight: 700, color: "#FFFFFF", letterSpacing: "0.04em" }}>AETHER</div>
        </div>
        <div style={{ fontSize: "0.75vw", fontWeight: 600, color: "#565F89", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: "1.5vh" }}>Overview + Architecture + Simulators</div>
        <div style={{ fontSize: "0.9vw", color: "#C0CAF5", opacity: 0.45, marginBottom: "3.5vh" }}>10 modules</div>
        <div style={{ fontSize: "0.75vw", fontWeight: 600, color: "#565F89", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: "1.5vh" }}>Products</div>
        <div style={{ display: "flex", flexDirection: "column", gap: "1.2vh", marginBottom: "3.5vh" }}>
          <div style={{ fontSize: "0.9vw", color: "#C0CAF5", opacity: 0.45 }}>Educational Stack</div>
          <div style={{ fontSize: "0.9vw", color: "#C0CAF5", opacity: 0.45 }}>Content Engine</div>
          <div style={{ fontSize: "0.9vw", color: "#C0CAF5", opacity: 0.45 }}>Prism Principle</div>
          <div style={{ fontSize: "0.9vw", color: "#7AA2F7", fontWeight: 600, display: "flex", alignItems: "center", gap: "0.6vw" }}>
            <span style={{ width: "3px", height: "1.1vw", backgroundColor: "#7AA2F7", borderRadius: "2px", marginLeft: "-2.5vw", flexShrink: 0 }} />
            CLCS Architecture
          </div>
        </div>
        <div style={{ fontSize: "0.75vw", fontWeight: 600, color: "#565F89", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: "1.5vh" }}>Investment</div>
        <div style={{ marginTop: "auto", fontSize: "0.75vw", color: "#565F89" }}>v1.0 · 2026</div>
      </div>
      <div style={{ flex: 1, padding: "6vh 4vw", display: "flex", flexDirection: "column" }}>
        <div style={{ fontSize: "0.9vw", color: "#7AA2F7", textTransform: "uppercase", letterSpacing: "0.08em", fontWeight: 600, marginBottom: "2vh" }}>Products</div>
        <h1 style={{ fontSize: "3.5vw", fontWeight: 700, color: "#FFFFFF", margin: "0 0 1.5vh 0", letterSpacing: "-0.02em" }}>CLCS Architecture</h1>
        <p style={{ fontSize: "1.1vw", color: "#9AA5CE", lineHeight: 1.6, maxWidth: "44vw", margin: "0 0 3vh 0" }}>
          Coherent Layered Crystallisation Stack — the processing spine of the AETHER runtime. L1 to L5 with pseudocode and mathematical chips.
        </p>
        <div style={{ display: "flex", gap: "1.2vw" }}>
          <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: "1.2vh" }}>
            <div style={{ backgroundColor: "#16161E", border: "1px solid rgba(255,158,100,0.25)", borderRadius: "0.4vw", padding: "1.5vh 1.5vw" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.6vh" }}>
                <span style={{ fontSize: "0.8vw", fontFamily: "'DM Mono', monospace", color: "#FF9E64", fontWeight: 700 }}>L1</span>
                <span style={{ fontSize: "0.75vw", color: "#565F89", fontFamily: "'DM Mono', monospace" }}>raw_signal</span>
              </div>
              <div style={{ fontSize: "0.92vw", color: "#FFFFFF", fontWeight: 600 }}>Input Capture</div>
              <div style={{ fontSize: "0.82vw", color: "#9AA5CE" }}>PDF · image · note · url · text stream ingested</div>
            </div>
            <div style={{ backgroundColor: "#16161E", border: "1px solid rgba(224,175,104,0.25)", borderRadius: "0.4vw", padding: "1.5vh 1.5vw" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.6vh" }}>
                <span style={{ fontSize: "0.8vw", fontFamily: "'DM Mono', monospace", color: "#E0AF68", fontWeight: 700 }}>L2</span>
                <span style={{ fontSize: "0.75vw", color: "#565F89", fontFamily: "'DM Mono', monospace" }}>pattern_detect</span>
              </div>
              <div style={{ fontSize: "0.92vw", color: "#FFFFFF", fontWeight: 600 }}>Pattern Detection</div>
              <div style={{ fontSize: "0.82vw", color: "#9AA5CE" }}>Claude extracts structure · f(x) = argmax P(concept|context)</div>
            </div>
            <div style={{ backgroundColor: "#16161E", border: "1px solid rgba(122,162,247,0.25)", borderRadius: "0.4vw", padding: "1.5vh 1.5vw" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.6vh" }}>
                <span style={{ fontSize: "0.8vw", fontFamily: "'DM Mono', monospace", color: "#7AA2F7", fontWeight: 700 }}>L3</span>
                <span style={{ fontSize: "0.75vw", color: "#565F89", fontFamily: "'DM Mono', monospace" }}>semantic_cluster</span>
              </div>
              <div style={{ fontSize: "0.92vw", color: "#FFFFFF", fontWeight: 600 }}>Semantic Clustering</div>
              <div style={{ fontSize: "0.82vw", color: "#9AA5CE" }}>Concepts grouped by domain · graph neighbourhood assigned</div>
            </div>
            <div style={{ backgroundColor: "#16161E", border: "1px solid rgba(158,206,106,0.25)", borderRadius: "0.4vw", padding: "1.5vh 1.5vw" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.6vh" }}>
                <span style={{ fontSize: "0.8vw", fontFamily: "'DM Mono', monospace", color: "#9ECE6A", fontWeight: 700 }}>L4</span>
                <span style={{ fontSize: "0.75vw", color: "#565F89", fontFamily: "'DM Mono', monospace" }}>coherence_score</span>
              </div>
              <div style={{ fontSize: "0.92vw", color: "#FFFFFF", fontWeight: 600 }}>Coherence Scoring</div>
              <div style={{ fontSize: "0.82vw", color: "#9AA5CE" }}>Edge weights computed · C(a,b) = sim(a,b) * confidence</div>
            </div>
            <div style={{ backgroundColor: "#16161E", border: "1px solid rgba(139,92,246,0.35)", borderRadius: "0.4vw", padding: "1.5vh 1.5vw" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.6vh" }}>
                <span style={{ fontSize: "0.8vw", fontFamily: "'DM Mono', monospace", color: "#8b5cf6", fontWeight: 700 }}>L5</span>
                <span style={{ fontSize: "0.75vw", color: "#565F89", fontFamily: "'DM Mono', monospace" }}>crystal_output</span>
              </div>
              <div style={{ fontSize: "0.92vw", color: "#FFFFFF", fontWeight: 600 }}>Crystallised Output</div>
              <div style={{ fontSize: "0.82vw", color: "#9AA5CE" }}>Node positioned in graph · gaps surfaced · ready for query</div>
            </div>
          </div>
          <div style={{ flex: 1, backgroundColor: "#16161E", borderRadius: "0.4vw", padding: "2vh 1.8vw", border: "1px solid rgba(255,255,255,0.05)", fontFamily: "'DM Mono', monospace", fontSize: "0.82vw", lineHeight: 1.75 }}>
            <div style={{ color: "#565F89", marginBottom: "1vh" }}>// CLCS pseudocode</div>
            <div style={{ color: "#7AA2F7" }}>function <span style={{ color: "#9ECE6A" }}>crystallise</span>(input) {"{"}</div>
            <div style={{ paddingLeft: "1.5vw", color: "#C0CAF5" }}>const raw = <span style={{ color: "#9ECE6A" }}>L1_capture</span>(input)</div>
            <div style={{ paddingLeft: "1.5vw", color: "#C0CAF5" }}>const patterns = <span style={{ color: "#E0AF68" }}>L2_detect</span>(raw)</div>
            <div style={{ paddingLeft: "1.5vw", color: "#C0CAF5" }}>const clusters = <span style={{ color: "#7AA2F7" }}>L3_cluster</span>(patterns)</div>
            <div style={{ paddingLeft: "1.5vw", color: "#C0CAF5" }}>const scored = <span style={{ color: "#9ECE6A" }}>L4_score</span>(clusters)</div>
            <div style={{ paddingLeft: "1.5vw", color: "#C0CAF5" }}>return <span style={{ color: "#8b5cf6" }}>L5_position</span>(scored)</div>
            <div style={{ color: "#7AA2F7" }}>{"}"}</div>
            <div style={{ color: "#565F89", marginTop: "1.5vh" }}>// coherence invariant</div>
            <div style={{ color: "#C0CAF5" }}>assert(output.coherence {">"} <span style={{ color: "#FF9E64" }}>0.7</span>)</div>
            <div style={{ color: "#C0CAF5" }}>assert(output.gaps !== <span style={{ color: "#FF9E64" }}>null</span>)</div>
          </div>
        </div>
        <div style={{ marginTop: "auto", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div style={{ fontSize: "0.9vw", color: "#565F89", fontWeight: 600 }}>14</div>
          <div style={{ fontSize: "0.8vw", color: "#565F89" }}>AETHER Knowledge System, Inc.</div>
        </div>
      </div>
    </div>
  );
}
