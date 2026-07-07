export default function Slide20SynthesisLayer() {
  const tools = [
    {
      name: "Question Bank",
      tag: "NEW",
      color: "#f0b429",
      lines: [
        "12 curated cross-system equation bridges",
        "SCAN SYSTEM → live concept clustering",
        "Bridges coherence field C(x,t) across all substrates",
      ],
      eq: "Σ equations → synthesis bridge",
    },
    {
      name: "Symbol Alphabet",
      tag: "NEW",
      color: "#38bdf8",
      lines: [
        "114 symbols across 6 writing systems",
        "Each mapped to MNESIS → SYNTHESIS layer",
        "Greek · Latin · Egyptian · Japanese · Russian · AETHER",
      ],
      eq: "symbol → AETHER layer → coherence weight",
    },
    {
      name: "Alphabet Map",
      tag: "NEW",
      color: "#a78bfa",
      lines: [
        "26-letter DNA — every form of every letter",
        "Math typography variants · cross-script cognates",
        "IPA phonetics · binary/hex code anatomy",
      ],
      eq: "A–Z → Unicode · Greek · Cyrillic · Hebrew",
    },
    {
      name: "Polar Transform",
      tag: "NEW",
      color: "#34d399",
      lines: [
        "Dual live canvas: Cartesian ↔ Polar",
        "Jacobian det(J) = r · area element dx dy = r dr dθ",
        "Tensor invariants · coordinate geometry",
      ],
      eq: "det(J) = r → AETHER coordinate coherence",
    },
    {
      name: "Unified Field Theory",
      tag: "NEW",
      color: "#fb923c",
      lines: [
        "Einstein · Maxwell · Lorentz · AETHER synthesis",
        "5 tabs · graviton field",
        "Maxwell ∇·/∇× → AETHER boundary operator □",
      ],
      eq: "□E = 0 → C(x,t) propagation",
    },
  ];

  return (
    <div style={{ width: "100vw", height: "100vh", overflow: "hidden", backgroundColor: "#1A1B26", fontFamily: "'Inter', sans-serif", display: "flex", color: "#C0CAF5", position: "relative" }}>
      {/* Sidebar */}
      <div style={{ width: "22vw", height: "100vh", borderRight: "1px solid rgba(255,255,255,0.05)", padding: "4vh 2.5vw", display: "flex", flexDirection: "column", flexShrink: 0 }}>
        <div style={{ display: "flex", alignItems: "center", gap: "0.8vw", marginBottom: "5vh" }}>
          <div style={{ width: "1.4vw", height: "1.4vw", backgroundColor: "#7AA2F7", borderRadius: "0.25vw" }} />
          <div style={{ fontSize: "1.1vw", fontWeight: 700, color: "#FFFFFF", letterSpacing: "0.04em" }}>AETHER</div>
        </div>
        <div style={{ fontSize: "0.75vw", fontWeight: 600, color: "#565F89", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: "1.5vh" }}>Overview + Architecture + Simulators + Products</div>
        <div style={{ fontSize: "0.9vw", color: "#C0CAF5", opacity: 0.45, marginBottom: "3.5vh" }}>14 modules</div>
        <div style={{ fontSize: "0.75vw", fontWeight: 600, color: "#565F89", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: "1.5vh" }}>Investment</div>
        <div style={{ display: "flex", flexDirection: "column", gap: "1.2vh" }}>
          <div style={{ fontSize: "0.9vw", color: "#C0CAF5", opacity: 0.55 }}>Extended Simulator Library</div>
          <div style={{ fontSize: "0.9vw", color: "#7AA2F7", fontWeight: 600, display: "flex", alignItems: "center", gap: "0.6vw" }}>
            <span style={{ width: "3px", height: "1.1vw", backgroundColor: "#7AA2F7", borderRadius: "2px", marginLeft: "-2.5vw", flexShrink: 0 }} />
            Knowledge Synthesis Layer
          </div>
          <div style={{ fontSize: "0.9vw", color: "#C0CAF5", opacity: 0.55 }}>Market Position</div>
          <div style={{ fontSize: "0.9vw", color: "#C0CAF5", opacity: 0.55 }}>The Ask</div>
        </div>
        <div style={{ marginTop: "auto", fontSize: "0.75vw", color: "#565F89" }}>v1.0 · 2026</div>
      </div>

      {/* Main */}
      <div style={{ flex: 1, padding: "5vh 4vw", display: "flex", flexDirection: "column" }}>
        <div style={{ fontSize: "0.9vw", color: "#7AA2F7", textTransform: "uppercase", letterSpacing: "0.08em", fontWeight: 600, marginBottom: "1.5vh" }}>Investment</div>
        <h1 style={{ fontSize: "3vw", fontWeight: 700, color: "#FFFFFF", margin: "0 0 1vh 0", letterSpacing: "-0.02em" }}>Knowledge Synthesis Layer</h1>
        <p style={{ fontSize: "1.05vw", color: "#9AA5CE", lineHeight: 1.6, maxWidth: "44vw", margin: "0 0 3vh 0" }}>
          Mathematical language tools built directly on AETHER's coherence architecture. Every symbol, equation, and transform maps back to C(x,t).
        </p>

        <div style={{ display: "flex", flexDirection: "column", gap: "1.1vh", flex: 1 }}>
          {tools.map(t => (
            <div key={t.name} style={{
              backgroundColor: "#16161E",
              border: `1px solid ${t.color}28`,
              borderLeft: `3px solid ${t.color}`,
              borderRadius: "0.4vw",
              padding: "1.3vh 1.5vw",
              display: "flex",
              gap: "1.5vw",
              alignItems: "flex-start",
            }}>
              {/* Name + tag */}
              <div style={{ width: "11vw", flexShrink: 0 }}>
                <div style={{ display: "flex", alignItems: "center", gap: "0.6vw", marginBottom: "0.4vh" }}>
                  <span style={{
                    fontSize: "0.62vw", fontFamily: "'DM Mono', monospace",
                    color: t.color, backgroundColor: t.color + "18",
                    padding: "0.1vh 0.5vw", borderRadius: "0.2vw", fontWeight: 700,
                  }}>{t.tag}</span>
                  <span style={{ fontSize: "0.95vw", color: "#FFFFFF", fontWeight: 700 }}>{t.name}</span>
                </div>
                <div style={{
                  fontFamily: "'DM Mono', monospace", fontSize: "0.72vw",
                  color: t.color, lineHeight: 1.4,
                }}>{t.eq}</div>
              </div>
              {/* Bullet lines */}
              <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: "0.3vh", justifyContent: "center" }}>
                {t.lines.map((l, i) => (
                  <div key={i} style={{ fontSize: "0.85vw", color: "#9AA5CE", display: "flex", gap: "0.5vw", alignItems: "flex-start" }}>
                    <span style={{ color: t.color, flexShrink: 0 }}>·</span>
                    {l}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Footer tag */}
        <div style={{ marginTop: "2vh", display: "flex", alignItems: "center", gap: "1vw" }}>
          <div style={{
            fontSize: "0.78vw", fontFamily: "'DM Mono', monospace",
            color: "#9ECE6A", backgroundColor: "rgba(158,206,106,0.08)",
            border: "1px solid rgba(158,206,106,0.2)", borderRadius: "0.3vw",
            padding: "0.5vh 1vw",
          }}>
            5 new tools · 2026 · All live in production
          </div>
          <div style={{ flex: 1 }} />
          <div style={{ fontSize: "0.9vw", color: "#565F89", fontWeight: 600 }}>20</div>
          <div style={{ fontSize: "0.8vw", color: "#565F89", marginLeft: "1vw" }}>AETHER Knowledge System, Inc.</div>
        </div>
      </div>
    </div>
  );
}
