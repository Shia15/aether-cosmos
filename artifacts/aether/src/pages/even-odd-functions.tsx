import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";

// ── Example functions ─────────────────────────────────────────────────────────
interface FnExample {
  id: string;
  label: string;
  latex: string;
  type: "even" | "odd" | "neither";
  color: string;
  fn: (x: number) => number;
  steps: {
    fNeg: string;
    fNegResult: string;
    negF: string;
    reasoning: string;
    conclusion: string;
  };
}

const EXAMPLES: FnExample[] = [
  {
    id: "a",
    label: "f(x)",
    latex: "f(x) = −x⁶ + 7x² + 2",
    type: "even",
    color: "#60a5fa",
    fn: (x) => -Math.pow(x, 6) + 7 * x * x + 2,
    steps: {
      fNeg: "f(−x) = −(−x)⁶ + 7(−x)² + 2",
      fNegResult: "= −x⁶ + 7x² + 2",
      negF: "−f(x) = x⁶ − 7x² − 2",
      reasoning:
        "(−x)⁶ = x⁶ because exponent 6 is even → (−1)⁶ = 1. " +
        "(−x)² = x² same reason. Constant 2 is unchanged.",
      conclusion:
        "f(−x) = −x⁶ + 7x² + 2 = f(x) ✓  →  EVEN (symmetric about y-axis)",
    },
  },
  {
    id: "b",
    label: "g(t)",
    latex: "g(t) = 3t / (t + 1)",
    type: "neither",
    color: "#f2bf65",
    fn: (x) => (3 * x) / (x + 1),
    steps: {
      fNeg: "g(−t) = 3(−t) / (−t + 1)",
      fNegResult: "= −3t / (1 − t)",
      negF: "−g(t) = −3t / (t + 1)",
      reasoning:
        "g(−t) = −3t/(1−t). Compare: g(t) = 3t/(t+1) and −g(t) = −3t/(t+1). " +
        "The denominator (1−t) ≠ (t+1) unless t = 0, so neither condition holds.",
      conclusion:
        "g(−t) ≠ g(t) and g(−t) ≠ −g(t)  →  NEITHER even nor odd",
    },
  },
  {
    id: "c",
    label: "m(x)",
    latex: "m(x) = 9x / (5 − x²)",
    type: "odd",
    color: "#c084fc",
    fn: (x) => (9 * x) / (5 - x * x),
    steps: {
      fNeg: "m(−x) = 9(−x) / (5 − (−x)²)",
      fNegResult: "= −9x / (5 − x²)",
      negF: "−m(x) = −9x / (5 − x²)",
      reasoning:
        "(−x)² = x² so the denominator (5 − x²) is unchanged. " +
        "The numerator flips sign: 9(−x) = −9x.",
      conclusion:
        "m(−x) = −9x/(5−x²) = −m(x) ✓  →  ODD (180° rotational symmetry)",
    },
  },
];

const TYPE_META = {
  even:    { label: "EVEN",    color: "#60a5fa", glow: "rgba(96,165,250,0.18)",  rule: "f(−x) = f(x)",  symmetry: "y-axis symmetry" },
  odd:     { label: "ODD",     color: "#c084fc", glow: "rgba(192,132,252,0.18)", rule: "f(−x) = −f(x)", symmetry: "rotational symmetry (180°)" },
  neither: { label: "NEITHER", color: "#f2bf65", glow: "rgba(242,191,101,0.18)",rule: "neither rule holds", symmetry: "no symmetry" },
};

// ── Graph canvas ──────────────────────────────────────────────────────────────
function FunctionGraph({ fn, type, color, label }: { fn: (x: number) => number; type: string; color: string; label: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [tick, setTick] = useState(0);

  // Animate the marker dot
  useEffect(() => {
    const id = setInterval(() => setTick(t => (t + 1) % 100), 40);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current; if (!canvas) return;
    const ctx = canvas.getContext("2d"); if (!ctx) return;
    const W = canvas.width, H = canvas.height;
    const cx = W / 2, cy = H / 2;
    const scale = 28; // px per unit

    ctx.clearRect(0, 0, W, H);

    // Grid
    ctx.strokeStyle = "rgba(200,195,240,0.05)";
    ctx.lineWidth = 1;
    for (let gx = -8; gx <= 8; gx++) {
      const px = cx + gx * scale;
      ctx.beginPath(); ctx.moveTo(px, 0); ctx.lineTo(px, H); ctx.stroke();
    }
    for (let gy = -6; gy <= 6; gy++) {
      const py = cy + gy * scale;
      ctx.beginPath(); ctx.moveTo(0, py); ctx.lineTo(W, py); ctx.stroke();
    }

    // Axes
    ctx.strokeStyle = "rgba(200,195,240,0.2)";
    ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(0, cy); ctx.lineTo(W, cy); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(cx, 0); ctx.lineTo(cx, H); ctx.stroke();

    // Symmetry guide
    if (type === "even") {
      // y-axis highlight
      ctx.strokeStyle = color + "40";
      ctx.lineWidth = 2;
      ctx.setLineDash([5, 4]);
      ctx.beginPath(); ctx.moveTo(cx, 0); ctx.lineTo(cx, H); ctx.stroke();
      ctx.setLineDash([]);
    } else if (type === "odd") {
      // origin marker
      ctx.beginPath(); ctx.arc(cx, cy, 6, 0, 2 * Math.PI);
      ctx.strokeStyle = color + "60"; ctx.lineWidth = 1.5;
      ctx.stroke();
      // diagonal dashes
      ctx.strokeStyle = color + "25"; ctx.lineWidth = 1;
      ctx.setLineDash([4, 6]);
      ctx.beginPath(); ctx.moveTo(0, H); ctx.lineTo(W, 0); ctx.stroke();
      ctx.setLineDash([]);
    }

    // Function curve
    ctx.beginPath();
    ctx.strokeStyle = color;
    ctx.lineWidth = 2;
    let first = true;
    for (let px = 0; px < W; px++) {
      const x = (px - cx) / scale;
      let y: number;
      try { y = fn(x); } catch { continue; }
      if (!isFinite(y) || Math.abs(y) > 200) { first = true; continue; }
      const py = cy - y * scale;
      if (first) { ctx.moveTo(px, py); first = false; }
      else ctx.lineTo(px, py);
    }
    ctx.stroke();

    // Mirrored point demonstration
    const xDemo = (tick / 100) * 4 - 2; // oscillates -2 to +2
    let yDemo: number;
    try { yDemo = fn(xDemo); } catch { yDemo = 0; }
    if (isFinite(yDemo) && Math.abs(yDemo) < 100) {
      const px1 = cx + xDemo * scale, py1 = cy - yDemo * scale;
      const px2 = cx - xDemo * scale, py2 = cy - (type === "odd" ? -yDemo : yDemo) * scale;

      // connecting dashed line
      ctx.setLineDash([3, 4]);
      ctx.strokeStyle = color + "50";
      ctx.lineWidth = 1;
      ctx.beginPath(); ctx.moveTo(px1, py1); ctx.lineTo(px2, py2); ctx.stroke();
      ctx.setLineDash([]);

      // points
      ctx.beginPath(); ctx.arc(px1, py1, 4, 0, 2 * Math.PI);
      ctx.fillStyle = color; ctx.fill();
      ctx.beginPath(); ctx.arc(px2, py2, 4, 0, 2 * Math.PI);
      ctx.fillStyle = color + "90"; ctx.fill();

      // labels
      ctx.font = "9px monospace";
      ctx.fillStyle = color + "cc";
      ctx.textAlign = "left";
      ctx.fillText(`(x, f(x))`, px1 + 6, py1 - 4);
      ctx.fillText(type === "odd" ? "(−x, −f(x))" : "(−x, f(x))", px2 + 6, py2 - 4);
    }

    // Axis labels
    ctx.font = "9px monospace";
    ctx.fillStyle = "rgba(200,195,240,0.3)";
    ctx.textAlign = "center";
    ctx.fillText("x", W - 8, cy - 6);
    ctx.textAlign = "left";
    ctx.fillText("y", cx + 5, 10);

  }, [fn, type, color, tick]);

  return <canvas ref={canvasRef} width={340} height={240} style={{ display: "block" }} />;
}

// ── Three-step test panel ─────────────────────────────────────────────────────
function StepPanel({ ex }: { ex: FnExample }) {
  const meta = TYPE_META[ex.type];
  return (
    <AnimatePresence mode="wait">
      <motion.div key={ex.id}
        initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }}
        transition={{ duration: 0.2 }}
        style={{ padding: "18px 20px" }}>

        <div style={{ fontFamily: "Cinzel, serif", fontSize: 9, color: "rgba(192,132,252,0.45)", letterSpacing: "0.18em", marginBottom: 6 }}>
          THREE-STEP TEST
        </div>
        <div style={{ fontFamily: "serif", fontSize: 16, color: ex.color, marginBottom: 18, fontWeight: 700 }}>
          {ex.latex}
        </div>

        {/* Step 1 */}
        <div style={{ marginBottom: 14 }}>
          <div style={{ fontSize: 9, fontFamily: "Cinzel, serif", letterSpacing: "0.14em", color: "rgba(200,195,240,0.35)", marginBottom: 6 }}>
            STEP 1 — FIND f(−x)
          </div>
          <div style={{ padding: "10px 12px", borderRadius: 7, border: `1px solid ${ex.color}20`, background: ex.color + "07" }}>
            <div style={{ fontFamily: "monospace", fontSize: 12, color: ex.color + "cc", marginBottom: 4 }}>{ex.steps.fNeg}</div>
            <div style={{ fontFamily: "monospace", fontSize: 12, color: "rgba(200,195,240,0.7)" }}>{ex.steps.fNegResult}</div>
          </div>
        </div>

        {/* Step 2 */}
        <div style={{ marginBottom: 14 }}>
          <div style={{ fontSize: 9, fontFamily: "Cinzel, serif", letterSpacing: "0.14em", color: "rgba(200,195,240,0.35)", marginBottom: 6 }}>
            STEP 2 — COMPUTE −f(x)
          </div>
          <div style={{ padding: "10px 12px", borderRadius: 7, border: "1px solid rgba(248,113,113,0.15)", background: "rgba(248,113,113,0.04)" }}>
            <div style={{ fontFamily: "monospace", fontSize: 12, color: "#f87171cc" }}>{ex.steps.negF}</div>
          </div>
        </div>

        {/* Step 3 */}
        <div style={{ marginBottom: 14 }}>
          <div style={{ fontSize: 9, fontFamily: "Cinzel, serif", letterSpacing: "0.14em", color: "rgba(200,195,240,0.35)", marginBottom: 6 }}>
            STEP 3 — COMPARE & REASON
          </div>
          <div style={{ padding: "10px 12px", borderRadius: 7, border: "1px solid rgba(200,195,240,0.06)", background: "rgba(255,255,255,0.02)", fontSize: 11, color: "rgba(200,195,240,0.65)", lineHeight: 1.6 }}>
            {ex.steps.reasoning}
          </div>
        </div>

        {/* Conclusion */}
        <div style={{ padding: "11px 14px", borderRadius: 8, border: `1px solid ${meta.color}40`, background: meta.color + "12",
          boxShadow: `0 0 14px ${meta.glow}` }}>
          <div style={{ fontSize: 9, fontFamily: "Cinzel, serif", letterSpacing: "0.15em", color: meta.color + "88", marginBottom: 5 }}>CONCLUSION</div>
          <div style={{ fontFamily: "monospace", fontSize: 11, color: meta.color, lineHeight: 1.6 }}>{ex.steps.conclusion}</div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}

// ── Main page ─────────────────────────────────────────────────────────────────
export default function EvenOddFunctionsView() {
  const [selected, setSelected] = useState<string>("a");
  const ex = EXAMPLES.find(e => e.id === selected)!;
  const meta = TYPE_META[ex.type];

  return (
    <div style={{ height: "100%", display: "flex", flexDirection: "column", background: "#030514", color: "#ccc", fontFamily: "Raleway, sans-serif", overflow: "hidden" }}>

      {/* Header */}
      <div style={{ borderBottom: "1px solid rgba(192,132,252,0.1)", padding: "12px 28px 10px", flexShrink: 0 }}>
        <div style={{ fontFamily: "Cinzel, serif", fontSize: 10, color: "#c084fc", letterSpacing: "0.25em", marginBottom: 3 }}>
          SYSTEM · MATHEMATICS · FUNCTION SYMMETRY
        </div>
        <h1 style={{ fontFamily: "Cinzel, serif", fontSize: 18, fontWeight: 700, color: "#e0d8ff", margin: 0, letterSpacing: "0.08em" }}>
          Even & Odd Functions
        </h1>
        <p style={{ fontSize: 11, color: "rgba(200,195,240,0.45)", margin: "3px 0 0", letterSpacing: "0.04em" }}>
          Three-step test · Symmetry analysis · Worked examples
        </p>
      </div>

      {/* Body */}
      <div style={{ flex: 1, display: "flex", overflow: "hidden" }}>

        {/* Left: definition + rule cards */}
        <div style={{ width: 240, borderRight: "1px solid rgba(192,132,252,0.07)", display: "flex", flexDirection: "column", padding: 16, gap: 10, flexShrink: 0 }}>

          {/* Rule cards */}
          {(["even", "odd", "neither"] as const).map(t => {
            const m = TYPE_META[t];
            return (
              <div key={t} style={{ padding: "10px 12px", borderRadius: 8,
                border: `1px solid ${m.color}22`, background: m.color + "08" }}>
                <div style={{ fontFamily: "Cinzel, serif", fontSize: 11, color: m.color, fontWeight: 700, marginBottom: 4 }}>{m.label}</div>
                <div style={{ fontFamily: "monospace", fontSize: 10, color: m.color + "cc", marginBottom: 5 }}>{m.rule}</div>
                <div style={{ fontSize: 9, color: "rgba(200,195,240,0.4)", lineHeight: 1.5 }}>{m.symmetry}</div>
              </div>
            );
          })}

          {/* Three-step rule */}
          <div style={{ marginTop: 8, padding: "10px 12px", borderRadius: 8, border: "1px solid rgba(192,132,252,0.12)", background: "rgba(192,132,252,0.05)" }}>
            <div style={{ fontFamily: "Cinzel, serif", fontSize: 9, color: "#c084fc", letterSpacing: "0.15em", marginBottom: 8 }}>THREE-STEP TEST</div>
            {["1. Find f(−x) — substitute −x into f", "2. Compute −f(x) — negate the whole function", "3. Compare f(−x) to f(x) and −f(x)"].map((s, i) => (
              <div key={i} style={{ display: "flex", gap: 8, marginBottom: 5 }}>
                <span style={{ color: "#c084fc66", fontSize: 9, flexShrink: 0 }}>◆</span>
                <span style={{ fontSize: 9, color: "rgba(200,195,240,0.55)", lineHeight: 1.5 }}>{s}</span>
              </div>
            ))}
          </div>

          {/* Exponent parity reminder */}
          <div style={{ padding: "10px 12px", borderRadius: 8, border: "1px solid rgba(242,191,101,0.1)", background: "rgba(242,191,101,0.04)" }}>
            <div style={{ fontFamily: "Cinzel, serif", fontSize: 9, color: "#f2bf65", letterSpacing: "0.15em", marginBottom: 8 }}>EXPONENT PARITY</div>
            {[
              { rule: "(−x)ⁿ = xⁿ", when: "n is even", color: "#60a5fa" },
              { rule: "(−x)ⁿ = −xⁿ", when: "n is odd", color: "#c084fc" },
            ].map(({ rule, when, color }) => (
              <div key={rule} style={{ marginBottom: 5 }}>
                <span style={{ fontFamily: "monospace", fontSize: 10, color }}>{rule}</span>
                <span style={{ fontSize: 9, color: "rgba(200,195,240,0.35)", marginLeft: 6 }}>when {when}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Centre: example selector + graph */}
        <div style={{ width: 380, borderRight: "1px solid rgba(192,132,252,0.07)", display: "flex", flexDirection: "column", flexShrink: 0 }}>

          {/* Example tabs */}
          <div style={{ display: "flex", borderBottom: "1px solid rgba(192,132,252,0.08)", padding: "10px 16px 0", gap: 6 }}>
            {EXAMPLES.map(e => {
              const m = TYPE_META[e.type];
              const isActive = selected === e.id;
              return (
                <button key={e.id} onClick={() => setSelected(e.id)}
                  style={{ padding: "6px 14px", borderRadius: "6px 6px 0 0", cursor: "pointer",
                    border: `1px solid ${isActive ? m.color + "50" : "rgba(255,255,255,0.06)"}`,
                    borderBottom: isActive ? `1px solid #030514` : undefined,
                    background: isActive ? m.color + "15" : "transparent",
                    color: isActive ? m.color : "rgba(200,195,240,0.4)",
                    fontFamily: "Cinzel, serif", fontSize: 10, letterSpacing: "0.1em",
                    transition: "all 0.2s", marginBottom: -1 }}>
                  {e.label}
                  <span style={{ marginLeft: 6, fontSize: 8, opacity: 0.7 }}>{m.label}</span>
                </button>
              );
            })}
          </div>

          {/* Graph */}
          <div style={{ padding: "16px", borderBottom: "1px solid rgba(192,132,252,0.07)" }}>
            <div style={{ fontFamily: "Cinzel, serif", fontSize: 9, color: "rgba(192,132,252,0.4)", letterSpacing: "0.15em", marginBottom: 8 }}>
              LIVE GRAPH — {meta.symmetry.toUpperCase()}
            </div>
            <div style={{ borderRadius: 8, overflow: "hidden", border: `1px solid ${meta.color}25`, background: "rgba(0,0,0,0.4)",
              boxShadow: `0 0 20px ${meta.glow}` }}>
              <FunctionGraph fn={ex.fn} type={ex.type} color={ex.color} label={ex.label} />
            </div>
            {/* Symmetry badge */}
            <div style={{ display: "flex", justifyContent: "center", marginTop: 10 }}>
              <div style={{ padding: "4px 14px", borderRadius: 12, border: `1px solid ${meta.color}40`,
                background: meta.color + "15", fontFamily: "Cinzel, serif", fontSize: 9,
                color: meta.color, letterSpacing: "0.12em" }}>
                {meta.label} — {meta.rule}
              </div>
            </div>
          </div>

          {/* Summary table */}
          <div style={{ flex: 1, overflowY: "auto", padding: "14px 16px" }}>
            <div style={{ fontFamily: "Cinzel, serif", fontSize: 9, color: "rgba(192,132,252,0.4)", letterSpacing: "0.15em", marginBottom: 10 }}>
              PROBLEM SET SUMMARY
            </div>
            <table style={{ width: "100%", borderCollapse: "separate", borderSpacing: "0 4px" }}>
              <thead>
                <tr>
                  {["Function", "f(−x)", "Result"].map(h => (
                    <th key={h} style={{ fontFamily: "Cinzel, serif", fontSize: 8, color: "rgba(200,195,240,0.3)",
                      letterSpacing: "0.12em", padding: "4px 8px", textAlign: "left" }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {EXAMPLES.map(e => {
                  const m = TYPE_META[e.type];
                  const isActive = selected === e.id;
                  return (
                    <tr key={e.id} onClick={() => setSelected(e.id)} style={{ cursor: "pointer" }}>
                      <td style={{ padding: "8px 10px", borderRadius: "6px 0 0 6px",
                        border: `1px solid ${isActive ? m.color + "40" : "rgba(255,255,255,0.03)"}`,
                        borderRight: "none", background: isActive ? m.color + "0a" : "rgba(3,5,20,0.4)",
                        fontFamily: "serif", fontSize: 11, color: isActive ? m.color : "rgba(200,195,240,0.5)",
                        transition: "all 0.2s" }}>
                        {e.latex}
                      </td>
                      <td style={{ padding: "8px 8px", borderTop: `1px solid ${isActive ? m.color + "40" : "rgba(255,255,255,0.03)"}`,
                        borderBottom: `1px solid ${isActive ? m.color + "40" : "rgba(255,255,255,0.03)"}`,
                        background: isActive ? m.color + "0a" : "rgba(3,5,20,0.4)",
                        fontFamily: "monospace", fontSize: 10, color: "rgba(200,195,240,0.55)",
                        transition: "all 0.2s" }}>
                        {e.steps.fNegResult}
                      </td>
                      <td style={{ padding: "8px 10px", borderRadius: "0 6px 6px 0",
                        border: `1px solid ${isActive ? m.color + "40" : "rgba(255,255,255,0.03)"}`,
                        borderLeft: "none", background: isActive ? m.color + "0a" : "rgba(3,5,20,0.4)",
                        transition: "all 0.2s" }}>
                        <span style={{ fontFamily: "Cinzel, serif", fontSize: 9, color: m.color,
                          padding: "2px 8px", borderRadius: 8, background: m.color + "18",
                          border: `1px solid ${m.color}30` }}>
                          {m.label}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right: worked steps */}
        <div style={{ flex: 1, overflowY: "auto" }}>
          <StepPanel ex={ex} />
        </div>
      </div>
    </div>
  );
}
