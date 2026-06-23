export default function Slide18TheAsk() {
  return (
    <div style={{ width: "100vw", height: "100vh", overflow: "hidden", backgroundColor: "#1A1B26", fontFamily: "'Inter', sans-serif", display: "flex", color: "#C0CAF5", position: "relative" }}>
      <div style={{ position: "absolute", inset: 0, background: "radial-gradient(ellipse at 50% 40%, rgba(122,162,247,0.12) 0%, rgba(139,92,246,0.06) 35%, transparent 65%)", pointerEvents: "none" }} />
      <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "8vh 10vw", position: "relative" }}>
        <div style={{ width: "3.5vw", height: "3.5vw", backgroundColor: "#7AA2F7", borderRadius: "0.8vw", marginBottom: "4vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <div style={{ width: "1.8vw", height: "1.8vw", backgroundColor: "#1A1B26", borderRadius: "0.4vw" }} />
        </div>
        <h1 style={{ fontSize: "4.5vw", fontWeight: 700, color: "#FFFFFF", margin: "0 0 2vh 0", letterSpacing: "-0.03em", textAlign: "center" }}>AETHER · The Ask</h1>
        <p style={{ fontSize: "1.4vw", color: "#9AA5CE", lineHeight: 1.65, maxWidth: "38vw", margin: "0 0 5vh 0", textAlign: "center" }}>
          Seeking seed investment to accelerate agent infrastructure, public API, and educational licensing pipeline.
        </p>
        <div style={{ display: "flex", gap: "3vw", marginBottom: "6vh" }}>
          <div style={{ backgroundColor: "rgba(255,255,255,0.03)", border: "1px solid rgba(122,162,247,0.2)", borderRadius: "0.5vw", padding: "2.5vh 3vw", textAlign: "center", minWidth: "14vw" }}>
            <div style={{ fontSize: "0.8vw", color: "#7AA2F7", fontFamily: "'DM Mono', monospace", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: "1.2vh" }}>Use of Funds</div>
            <div style={{ fontSize: "1vw", color: "#C0CAF5", lineHeight: 1.7 }}>
              Agent infrastructure<br/>
              Public API layer<br/>
              Educational licensing
            </div>
          </div>
          <div style={{ backgroundColor: "rgba(255,255,255,0.03)", border: "1px solid rgba(158,206,106,0.2)", borderRadius: "0.5vw", padding: "2.5vh 3vw", textAlign: "center", minWidth: "14vw" }}>
            <div style={{ fontSize: "0.8vw", color: "#9ECE6A", fontFamily: "'DM Mono', monospace", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: "1.2vh" }}>Current Status</div>
            <div style={{ fontSize: "1vw", color: "#C0CAF5", lineHeight: 1.7 }}>
              40+ pages live<br/>
              8 simulators deployed<br/>
              Full content OS running
            </div>
          </div>
          <div style={{ backgroundColor: "rgba(255,255,255,0.03)", border: "1px solid rgba(224,175,104,0.2)", borderRadius: "0.5vw", padding: "2.5vh 3vw", textAlign: "center", minWidth: "14vw" }}>
            <div style={{ fontSize: "0.8vw", color: "#E0AF68", fontFamily: "'DM Mono', monospace", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: "1.2vh" }}>Next Milestones</div>
            <div style={{ fontSize: "1vw", color: "#C0CAF5", lineHeight: 1.7 }}>
              /graph/v1 public API<br/>
              M.A.R.I. SDK<br/>
              Institutional pilot
            </div>
          </div>
        </div>
        <div style={{ borderTop: "1px solid rgba(255,255,255,0.06)", paddingTop: "3.5vh", display: "flex", gap: "4vw", alignItems: "center" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "0.6vw" }}>
            <div style={{ width: "0.5vw", height: "0.5vw", backgroundColor: "#9ECE6A", borderRadius: "50%" }} />
            <div style={{ fontSize: "1vw", color: "#C0CAF5", fontFamily: "'DM Mono', monospace" }}>aether.system</div>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "0.6vw" }}>
            <div style={{ width: "0.5vw", height: "0.5vw", backgroundColor: "#7AA2F7", borderRadius: "50%" }} />
            <div style={{ fontSize: "1vw", color: "#C0CAF5", fontFamily: "'DM Mono', monospace" }}>contact@aether.system</div>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "0.6vw" }}>
            <div style={{ width: "0.5vw", height: "0.5vw", backgroundColor: "#E0AF68", borderRadius: "50%" }} />
            <div style={{ fontSize: "1vw", color: "#C0CAF5", fontFamily: "'DM Mono', monospace" }}>v1.0 · 2026</div>
          </div>
        </div>
        <div style={{ position: "absolute", bottom: "4vh", left: "10vw", right: "10vw", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div style={{ fontSize: "0.9vw", color: "#565F89", fontWeight: 600 }}>18</div>
          <div style={{ fontSize: "0.8vw", color: "#565F89" }}>AETHER Knowledge System, Inc.</div>
        </div>
      </div>
    </div>
  );
}
