export default function Slide06CognitiveArch() {
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
        <div style={{ display: "flex", flexDirection: "column", gap: "1.2vh", marginBottom: "3.5vh" }}>
          <div style={{ fontSize: "0.9vw", color: "#C0CAF5", opacity: 0.45 }}>Knowledge Graph</div>
          <div style={{ fontSize: "0.9vw", color: "#C0CAF5", opacity: 0.45 }}>M.A.R.I. Agents</div>
          <div style={{ fontSize: "0.9vw", color: "#7AA2F7", fontWeight: 600, display: "flex", alignItems: "center", gap: "0.6vw" }}>
            <span style={{ width: "3px", height: "1.1vw", backgroundColor: "#7AA2F7", borderRadius: "2px", marginLeft: "-2.5vw", flexShrink: 0 }} />
            Cognitive Functions
          </div>
          <div style={{ fontSize: "0.9vw", color: "#C0CAF5", opacity: 0.55 }}>Document Ingestion</div>
        </div>
        <div style={{ fontSize: "0.75vw", fontWeight: 600, color: "#565F89", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: "1.5vh" }}>Simulators</div>
        <div style={{ fontSize: "0.75vw", fontWeight: 600, color: "#565F89", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: "1.5vh", marginTop: "2vh" }}>Products</div>
        <div style={{ fontSize: "0.75vw", fontWeight: 600, color: "#565F89", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: "1.5vh", marginTop: "2vh" }}>Investment</div>
        <div style={{ marginTop: "auto", fontSize: "0.75vw", color: "#565F89" }}>v1.0 · 2026</div>
      </div>
      <div style={{ flex: 1, padding: "6vh 4vw", display: "flex", flexDirection: "column" }}>
        <div style={{ fontSize: "0.9vw", color: "#7AA2F7", textTransform: "uppercase", letterSpacing: "0.08em", fontWeight: 600, marginBottom: "2vh" }}>Architecture</div>
        <h1 style={{ fontSize: "3.5vw", fontWeight: 700, color: "#FFFFFF", margin: "0 0 1.5vh 0", letterSpacing: "-0.02em" }}>Cognitive Architecture Layer</h1>
        <p style={{ fontSize: "1.1vw", color: "#9AA5CE", lineHeight: 1.6, maxWidth: "44vw", margin: "0 0 3vh 0" }}>
          8 Jungian cognitive functions mapped to 8 AETHER agents. Source: MBTI stacks across all 16 types — /cognitive-architecture.
        </p>
        <div style={{ display: "flex", gap: "2.5vw" }}>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: "0.8vw", color: "#565F89", textTransform: "uppercase", letterSpacing: "0.08em", fontFamily: "'DM Mono', monospace", marginBottom: "1.5vh" }}>// Perceiving Axis</div>
            <div style={{ backgroundColor: "#16161E", borderRadius: "0.4vw", padding: "2vh 1.6vw", border: "1px solid rgba(255,255,255,0.05)", fontFamily: "'DM Mono', monospace", fontSize: "0.9vw", lineHeight: 1.9 }}>
              <div><span style={{ color: "#9ECE6A" }}>Ne</span> <span style={{ color: "#565F89" }}>→</span> <span style={{ color: "#88c7ff" }}>Reverie</span> <span style={{ color: "#565F89" }}>// Interface Renderer</span></div>
              <div><span style={{ color: "#8b5cf6" }}>Ni</span> <span style={{ color: "#565F89" }}>→</span> <span style={{ color: "#ffdca8" }}>Aletheia</span> <span style={{ color: "#565F89" }}>// Cognitive Logic</span></div>
              <div><span style={{ color: "#22c55e" }}>Se</span> <span style={{ color: "#565F89" }}>→</span> <span style={{ color: "#facc15" }}>Caelus</span> <span style={{ color: "#565F89" }}>// Input Handler</span></div>
              <div><span style={{ color: "#3b82f6" }}>Si</span> <span style={{ color: "#565F89" }}>→</span> <span style={{ color: "#8047d4" }}>Mnēsis</span> <span style={{ color: "#565F89" }}>// Memory Engine</span></div>
            </div>
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: "0.8vw", color: "#565F89", textTransform: "uppercase", letterSpacing: "0.08em", fontFamily: "'DM Mono', monospace", marginBottom: "1.5vh" }}>// Judging Axis</div>
            <div style={{ backgroundColor: "#16161E", borderRadius: "0.4vw", padding: "2vh 1.6vw", border: "1px solid rgba(255,255,255,0.05)", fontFamily: "'DM Mono', monospace", fontSize: "0.9vw", lineHeight: 1.9 }}>
              <div><span style={{ color: "#06b6d4" }}>Te</span> <span style={{ color: "#565F89" }}>→</span> <span style={{ color: "#06b6d4" }}>Orin</span> <span style={{ color: "#565F89" }}>// Multi-System Bridge</span></div>
              <div><span style={{ color: "#c9a84c" }}>Ti</span> <span style={{ color: "#565F89" }}>→</span> <span style={{ color: "#10b981" }}>Vērus</span> <span style={{ color: "#565F89" }}>// Controller</span></div>
              <div><span style={{ color: "#ec4899" }}>Fe</span> <span style={{ color: "#565F89" }}>→</span> <span style={{ color: "#f472b6" }}>Nyra</span> <span style={{ color: "#565F89" }}>// Feedback Layer</span></div>
              <div><span style={{ color: "#ef4444" }}>Fi</span> <span style={{ color: "#565F89" }}>→</span> <span style={{ color: "#e64522" }}>Inferaia</span> <span style={{ color: "#565F89" }}>// Motivation</span></div>
            </div>
          </div>
        </div>
        <div style={{ marginTop: "2.5vh", backgroundColor: "rgba(122,162,247,0.06)", border: "1px solid rgba(122,162,247,0.15)", borderRadius: "0.4vw", padding: "1.8vh 1.8vw" }}>
          <div style={{ fontSize: "1vw", color: "#C0CAF5", lineHeight: 1.6 }}>
            <span style={{ color: "#7AA2F7", fontWeight: 600 }}>Pe agents</span> (Caelus + Reverie) receive new input.
            <span style={{ color: "#9ECE6A", fontWeight: 600 }}> Pi agents</span> (Mnēsis + Aletheia) process from internal reference.
            <span style={{ color: "#E0AF68", fontWeight: 600 }}> Je agents</span> (Orin + Nyra) organise externally.
            <span style={{ color: "#FF9E64", fontWeight: 600 }}> Ji agents</span> (Vērus + Inferaia) govern internal structure.
          </div>
        </div>
        <div style={{ marginTop: "auto", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div style={{ fontSize: "0.9vw", color: "#565F89", fontWeight: 600 }}>06</div>
          <div style={{ fontSize: "0.8vw", color: "#565F89" }}>AETHER Knowledge System, Inc.</div>
        </div>
      </div>
    </div>
  );
}
