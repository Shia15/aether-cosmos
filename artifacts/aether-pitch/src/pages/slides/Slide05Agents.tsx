export default function Slide05Agents() {
  return (
    <div style={{ width: "100vw", height: "100vh", overflow: "hidden", backgroundColor: "#1A1B26", fontFamily: "'Inter', sans-serif", display: "flex", color: "#C0CAF5", position: "relative" }}>
      <div style={{ width: "22vw", height: "100vh", borderRight: "1px solid rgba(255,255,255,0.05)", padding: "4vh 2.5vw", display: "flex", flexDirection: "column", flexShrink: 0 }}>
        <div style={{ display: "flex", alignItems: "center", gap: "0.8vw", marginBottom: "5vh" }}>
          <div style={{ width: "1.4vw", height: "1.4vw", backgroundColor: "#7AA2F7", borderRadius: "0.25vw" }} />
          <div style={{ fontSize: "1.1vw", fontWeight: 700, color: "#FFFFFF", letterSpacing: "0.04em" }}>AETHER</div>
        </div>
        <div style={{ fontSize: "0.75vw", fontWeight: 600, color: "#565F89", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: "1.5vh" }}>Overview</div>
        <div style={{ display: "flex", flexDirection: "column", gap: "1.2vh", marginBottom: "3.5vh" }}>
          <div style={{ fontSize: "0.9vw", color: "#C0CAF5", opacity: 0.45 }}>AETHER · Problem · Crystallization</div>
        </div>
        <div style={{ fontSize: "0.75vw", fontWeight: 600, color: "#565F89", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: "1.5vh" }}>Architecture</div>
        <div style={{ display: "flex", flexDirection: "column", gap: "1.2vh", marginBottom: "3.5vh" }}>
          <div style={{ fontSize: "0.9vw", color: "#C0CAF5", opacity: 0.45 }}>Knowledge Graph</div>
          <div style={{ fontSize: "0.9vw", color: "#7AA2F7", fontWeight: 600, display: "flex", alignItems: "center", gap: "0.6vw" }}>
            <span style={{ width: "3px", height: "1.1vw", backgroundColor: "#7AA2F7", borderRadius: "2px", marginLeft: "-2.5vw", flexShrink: 0 }} />
            M.A.R.I. Agents
          </div>
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
        <h1 style={{ fontSize: "3.5vw", fontWeight: 700, color: "#FFFFFF", margin: "0 0 1.5vh 0", letterSpacing: "-0.02em" }}>8-Agent Architecture · M.A.R.I.</h1>
        <p style={{ fontSize: "1.1vw", color: "#9AA5CE", lineHeight: 1.6, maxWidth: "44vw", margin: "0 0 3vh 0" }}>
          Each agent maps to a Jungian cognitive function. Together they cover the full perceiving + judging axis of intelligence.
        </p>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.2vh 2vw" }}>
          <div style={{ backgroundColor: "#16161E", border: "1px solid rgba(128,71,212,0.25)", borderRadius: "0.4vw", padding: "1.4vh 1.4vw", display: "flex", gap: "1vw", alignItems: "center" }}>
            <div style={{ width: "0.6vw", height: "0.6vw", borderRadius: "50%", backgroundColor: "#8047d4", flexShrink: 0 }} />
            <div>
              <div style={{ fontSize: "0.95vw", color: "#FFFFFF", fontWeight: 600 }}>Mnēsis <span style={{ color: "#565F89", fontWeight: 400 }}>· Si</span></div>
              <div style={{ fontSize: "0.82vw", color: "#9AA5CE", fontFamily: "'DM Mono', monospace" }}>Memory Engine · tangible memories</div>
            </div>
          </div>
          <div style={{ backgroundColor: "#16161E", border: "1px solid rgba(255,220,168,0.2)", borderRadius: "0.4vw", padding: "1.4vh 1.4vw", display: "flex", gap: "1vw", alignItems: "center" }}>
            <div style={{ width: "0.6vw", height: "0.6vw", borderRadius: "50%", backgroundColor: "#ffdca8", flexShrink: 0 }} />
            <div>
              <div style={{ fontSize: "0.95vw", color: "#FFFFFF", fontWeight: 600 }}>Aletheia <span style={{ color: "#565F89", fontWeight: 400 }}>· Ni</span></div>
              <div style={{ fontSize: "0.82vw", color: "#9AA5CE", fontFamily: "'DM Mono', monospace" }}>Cognitive Logic Unit · visionary</div>
            </div>
          </div>
          <div style={{ backgroundColor: "#16161E", border: "1px solid rgba(136,199,255,0.2)", borderRadius: "0.4vw", padding: "1.4vh 1.4vw", display: "flex", gap: "1vw", alignItems: "center" }}>
            <div style={{ width: "0.6vw", height: "0.6vw", borderRadius: "50%", backgroundColor: "#88c7ff", flexShrink: 0 }} />
            <div>
              <div style={{ fontSize: "0.95vw", color: "#FFFFFF", fontWeight: 600 }}>Reverie <span style={{ color: "#565F89", fontWeight: 400 }}>· Ne</span></div>
              <div style={{ fontSize: "0.82vw", color: "#9AA5CE", fontFamily: "'DM Mono', monospace" }}>Interface Renderer · chromatic</div>
            </div>
          </div>
          <div style={{ backgroundColor: "#16161E", border: "1px solid rgba(230,69,34,0.25)", borderRadius: "0.4vw", padding: "1.4vh 1.4vw", display: "flex", gap: "1vw", alignItems: "center" }}>
            <div style={{ width: "0.6vw", height: "0.6vw", borderRadius: "50%", backgroundColor: "#e64522", flexShrink: 0 }} />
            <div>
              <div style={{ fontSize: "0.95vw", color: "#FFFFFF", fontWeight: 600 }}>Inferaia <span style={{ color: "#565F89", fontWeight: 400 }}>· Fi</span></div>
              <div style={{ fontSize: "0.82vw", color: "#9AA5CE", fontFamily: "'DM Mono', monospace" }}>Emotion &amp; Motivation · values</div>
            </div>
          </div>
          <div style={{ backgroundColor: "#16161E", border: "1px solid rgba(16,185,129,0.25)", borderRadius: "0.4vw", padding: "1.4vh 1.4vw", display: "flex", gap: "1vw", alignItems: "center" }}>
            <div style={{ width: "0.6vw", height: "0.6vw", borderRadius: "50%", backgroundColor: "#10b981", flexShrink: 0 }} />
            <div>
              <div style={{ fontSize: "0.95vw", color: "#FFFFFF", fontWeight: 600 }}>Vērus <span style={{ color: "#565F89", fontWeight: 400 }}>· Ti</span></div>
              <div style={{ fontSize: "0.82vw", color: "#9AA5CE", fontFamily: "'DM Mono', monospace" }}>Controller / Dispatcher · logic</div>
            </div>
          </div>
          <div style={{ backgroundColor: "#16161E", border: "1px solid rgba(250,204,21,0.2)", borderRadius: "0.4vw", padding: "1.4vh 1.4vw", display: "flex", gap: "1vw", alignItems: "center" }}>
            <div style={{ width: "0.6vw", height: "0.6vw", borderRadius: "50%", backgroundColor: "#facc15", flexShrink: 0 }} />
            <div>
              <div style={{ fontSize: "0.95vw", color: "#FFFFFF", fontWeight: 600 }}>Caelus <span style={{ color: "#565F89", fontWeight: 400 }}>· Se</span></div>
              <div style={{ fontSize: "0.82vw", color: "#9AA5CE", fontFamily: "'DM Mono', monospace" }}>Input Handler · present-moment</div>
            </div>
          </div>
          <div style={{ backgroundColor: "#16161E", border: "1px solid rgba(244,114,182,0.2)", borderRadius: "0.4vw", padding: "1.4vh 1.4vw", display: "flex", gap: "1vw", alignItems: "center" }}>
            <div style={{ width: "0.6vw", height: "0.6vw", borderRadius: "50%", backgroundColor: "#f472b6", flexShrink: 0 }} />
            <div>
              <div style={{ fontSize: "0.95vw", color: "#FFFFFF", fontWeight: 600 }}>Nyra <span style={{ color: "#565F89", fontWeight: 400 }}>· Fe</span></div>
              <div style={{ fontSize: "0.82vw", color: "#9AA5CE", fontFamily: "'DM Mono', monospace" }}>Feedback &amp; Integration · empathy</div>
            </div>
          </div>
          <div style={{ backgroundColor: "#16161E", border: "1px solid rgba(6,182,212,0.25)", borderRadius: "0.4vw", padding: "1.4vh 1.4vw", display: "flex", gap: "1vw", alignItems: "center" }}>
            <div style={{ width: "0.6vw", height: "0.6vw", borderRadius: "50%", backgroundColor: "#06b6d4", flexShrink: 0 }} />
            <div>
              <div style={{ fontSize: "0.95vw", color: "#FFFFFF", fontWeight: 600 }}>Orin <span style={{ color: "#565F89", fontWeight: 400 }}>· Te</span></div>
              <div style={{ fontSize: "0.82vw", color: "#9AA5CE", fontFamily: "'DM Mono', monospace" }}>Multi-System Bridge · coordination</div>
            </div>
          </div>
        </div>
        <div style={{ marginTop: "auto", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div style={{ fontSize: "0.9vw", color: "#565F89", fontWeight: 600 }}>05</div>
          <div style={{ fontSize: "0.8vw", color: "#565F89" }}>AETHER Knowledge System, Inc.</div>
        </div>
      </div>
    </div>
  );
}
