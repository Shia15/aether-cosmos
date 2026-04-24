import { useEffect, useRef, useState } from "react";

const PHI = 1.6180339887;
const FIBS = [1, 2, 3, 5, 8, 13, 21, 34, 55, 89, 144, 233, 377, 610, 987];

const COLORS = {
  gold:   "#d4a855",
  gold2:  "#f0c878",
  amber:  "#b87333",
  cream:  "#f5ecd7",
  rust:   "#8b4513",
  deep:   "#0a0805",
  mid:    "#120f08",
  panel:  "rgba(18,14,8,0.92)",
  border: "rgba(212,168,85,0.18)",
  text:   "#c8b88a",
  dim:    "#7a6840",
};

type Mode = "spiral" | "tree" | "wave";

function zeckendorf(n: number): number[] {
  const result: number[] = [];
  let rem = n;
  for (let i = FIBS.length - 1; i >= 0; i--) {
    if (FIBS[i] <= rem) { result.push(FIBS[i]); rem -= FIBS[i]; }
  }
  return result;
}

export default function FibonacciQuantizationView() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const runningRef = useRef(true);
  const rafRef = useRef(0);
  const tRef = useRef(0);

  const [mode, setMode] = useState<Mode>("spiral");
  const [input, setInput] = useState(42);
  const [running, setRunning] = useState(true);
  const [density, setDensity] = useState(60);

  const modeRef = useRef<Mode>("spiral");
  const inputRef = useRef(42);
  const densityRef = useRef(60);
  useEffect(() => { modeRef.current = mode; }, [mode]);
  useEffect(() => { inputRef.current = input; }, [input]);
  useEffect(() => { densityRef.current = density; }, [density]);

  const decomp = zeckendorf(input);

  useEffect(() => {
    const c = canvasRef.current; if (!c) return;
    const ctx = c.getContext("2d"); if (!ctx) return;
    const resize = () => {
      const r = c.parentElement!.getBoundingClientRect();
      c.width = r.width; c.height = Math.max(420, r.height);
    };
    resize();
    const onR = () => resize(); window.addEventListener("resize", onR);

    const draw = () => {
      if (!runningRef.current) { rafRef.current = requestAnimationFrame(draw); return; }
      const W = c.width, H = c.height;
      tRef.current += 0.012;
      const t = tRef.current;
      const dec = zeckendorf(inputRef.current);
      const dens = densityRef.current;

      // background
      ctx.fillStyle = COLORS.mid; ctx.fillRect(0, 0, W, H);
      // vignette
      const vg = ctx.createRadialGradient(W / 2, H / 2, 0, W / 2, H / 2, Math.max(W, H) / 1.2);
      vg.addColorStop(0, "rgba(212,168,85,0.05)");
      vg.addColorStop(1, "rgba(0,0,0,0.6)");
      ctx.fillStyle = vg; ctx.fillRect(0, 0, W, H);

      const cx = W / 2, cy = H / 2;
      const baseR = Math.min(W, H) * 0.04;

      if (modeRef.current === "spiral") {
        // golden-angle spiral
        const goldenAngle = Math.PI * (3 - Math.sqrt(5));
        const N = dens;
        for (let i = 0; i < N; i++) {
          const r = baseR * Math.sqrt(i + 1) * 1.6;
          const a = i * goldenAngle + t * 0.2;
          const x = cx + Math.cos(a) * r;
          const y = cy + Math.sin(a) * r;
          const isFib = FIBS.includes(i + 1);
          const isInDecomp = dec.includes(i + 1);
          const size = isInDecomp ? 7 : isFib ? 4 : 2;
          const alpha = isInDecomp ? 1 : isFib ? 0.55 : 0.28;
          const col = isInDecomp ? COLORS.gold2 : isFib ? COLORS.gold : COLORS.amber;
          // glow
          if (isInDecomp || isFib) {
            const grd = ctx.createRadialGradient(x, y, 0, x, y, size * 4);
            grd.addColorStop(0, hexA(col, alpha * 0.7));
            grd.addColorStop(1, hexA(col, 0));
            ctx.fillStyle = grd;
            ctx.beginPath(); ctx.arc(x, y, size * 4, 0, Math.PI * 2); ctx.fill();
          }
          ctx.fillStyle = hexA(col, alpha);
          ctx.beginPath(); ctx.arc(x, y, size, 0, Math.PI * 2); ctx.fill();
        }
      } else if (modeRef.current === "tree") {
        // recursive Fibonacci branching
        const drawBranch = (x: number, y: number, len: number, ang: number, depth: number) => {
          if (depth <= 0 || len < 1) return;
          const nx = x + Math.cos(ang) * len;
          const ny = y + Math.sin(ang) * len;
          const isHi = depth % 3 === 0;
          ctx.strokeStyle = hexA(isHi ? COLORS.gold2 : COLORS.gold, 0.35 + depth * 0.06);
          ctx.lineWidth = depth * 0.3 + 0.3;
          ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(nx, ny); ctx.stroke();
          // node
          if (isHi) {
            ctx.fillStyle = hexA(COLORS.gold2, 0.7);
            ctx.beginPath(); ctx.arc(nx, ny, 2.5, 0, Math.PI * 2); ctx.fill();
          }
          const sway = Math.sin(t + depth) * 0.05;
          drawBranch(nx, ny, len / PHI, ang - 0.5 + sway, depth - 1);
          drawBranch(nx, ny, len / PHI, ang + 0.5 + sway, depth - 1);
        };
        drawBranch(cx, H * 0.92, H * 0.18, -Math.PI / 2, Math.min(11, Math.floor(dens / 6) + 5));
      } else {
        // wave: superposition of Fibonacci frequencies
        ctx.strokeStyle = hexA(COLORS.gold, 0.8);
        ctx.lineWidth = 1.4;
        ctx.beginPath();
        for (let x = 0; x <= W; x += 2) {
          let y = 0;
          dec.forEach((f, i) => {
            const freq = f * 0.012;
            const amp = (H * 0.18) / (i + 1);
            y += Math.sin(x * freq + t * (1 + i * 0.4)) * amp;
          });
          y = cy + y;
          x === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
        }
        ctx.stroke();
        // baseline
        ctx.strokeStyle = hexA(COLORS.amber, 0.15);
        ctx.lineWidth = 0.5;
        ctx.beginPath(); ctx.moveTo(0, cy); ctx.lineTo(W, cy); ctx.stroke();
        // markers per frequency
        dec.forEach((f, i) => {
          const xMark = (i + 1) * 70;
          if (xMark > W - 20) return;
          ctx.fillStyle = COLORS.gold2;
          ctx.fillRect(xMark, cy - 80, 1, 160);
          ctx.fillStyle = hexA(COLORS.gold2, 0.7);
          ctx.font = "10px 'DM Mono', monospace";
          ctx.fillText(`F=${f}`, xMark + 4, cy - 84);
        });
      }

      rafRef.current = requestAnimationFrame(draw);
    };
    rafRef.current = requestAnimationFrame(draw);
    return () => { cancelAnimationFrame(rafRef.current); window.removeEventListener("resize", onR); };
  }, []);

  const togglePlay = () => { runningRef.current = !runningRef.current; setRunning(runningRef.current); };

  return (
    <div style={{ minHeight: "100%", background: COLORS.deep, color: COLORS.text, fontFamily: "'Cormorant Garamond', Georgia, serif", cursor: "crosshair" }}>
      <header style={{ padding: "2rem 2rem 1.4rem", borderBottom: `1px solid ${COLORS.border}`, display: "flex", alignItems: "flex-end", justifyContent: "space-between", flexWrap: "wrap", gap: "1rem" }}>
        <div>
          <div style={{ fontFamily: "'DM Mono', monospace", fontSize: "0.6rem", letterSpacing: "0.28em", color: COLORS.gold, opacity: 0.6, textTransform: "uppercase" }}>
            FQP · Fibonacci Quantization Processor
          </div>
          <h1 style={{ fontFamily: "'Playfair Display', Georgia, serif", fontSize: "clamp(2rem, 4.5vw, 3.4rem)", color: COLORS.cream, fontWeight: 900, marginTop: "0.5rem", letterSpacing: "-0.01em", lineHeight: 1 }}>
            <em style={{ fontStyle: "italic", color: COLORS.gold2 }}>φ</em> · Sparse Recursive Encoding
          </h1>
          <div style={{ fontFamily: "'DM Mono', monospace", fontSize: "0.62rem", letterSpacing: "0.14em", color: COLORS.dim, marginTop: "0.45rem" }}>
            Zeckendorf decomposition · golden-angle topology · harmonic constraint
          </div>
        </div>
        <div style={{ fontFamily: "'Playfair Display', Georgia, serif", fontSize: "clamp(2.5rem, 6vw, 5rem)", fontStyle: "italic", color: COLORS.gold, opacity: 0.12, lineHeight: 1, userSelect: "none" }}>
          1.6180339887
        </div>
      </header>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 320px", gap: "1.4rem", padding: "1.4rem 2rem 2rem", alignItems: "start" }}>
        <main>
          {/* Controls */}
          <div style={{ display: "flex", alignItems: "center", gap: "0.6rem", padding: "0.8rem 0", borderBottom: `1px solid ${COLORS.border}`, flexWrap: "wrap" }}>
            {(["spiral", "tree", "wave"] as Mode[]).map((m) => (
              <button key={m} onClick={() => setMode(m)} data-testid={`mode-${m}`} style={{
                fontFamily: "'DM Mono', monospace", fontSize: "0.6rem", letterSpacing: "0.1em",
                textTransform: "uppercase", padding: "0.4rem 0.95rem",
                background: mode === m ? "rgba(212,168,85,0.1)" : "transparent",
                border: `1px solid ${mode === m ? COLORS.gold : COLORS.border}`,
                color: mode === m ? COLORS.gold : COLORS.text,
                cursor: "pointer",
              }}>{m}</button>
            ))}
            <div style={{ width: 1, height: 20, background: COLORS.border, margin: "0 0.4rem" }} />
            <button onClick={togglePlay} data-testid="btn-play" style={{ fontFamily: "'DM Mono', monospace", fontSize: "0.6rem", letterSpacing: "0.1em", padding: "0.4rem 0.95rem", background: "transparent", border: `1px solid ${COLORS.border}`, color: COLORS.text, cursor: "pointer", textTransform: "uppercase" }}>
              {running ? "PAUSE" : "PLAY"}
            </button>
            <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 8 }}>
              <label style={{ fontFamily: "'DM Mono', monospace", fontSize: "0.55rem", letterSpacing: "0.1em", color: COLORS.dim }}>DENSITY</label>
              <input type="range" min={20} max={200} value={density} onChange={(e) => setDensity(Number(e.target.value))} style={{ width: 110, accentColor: COLORS.gold }} data-testid="density-slider" />
              <span style={{ fontFamily: "'DM Mono', monospace", fontSize: "0.62rem", color: COLORS.gold2, width: 32, textAlign: "right" }}>{density}</span>
            </div>
          </div>

          {/* Canvas */}
          <div style={{ position: "relative", border: `1px solid ${COLORS.border}`, background: COLORS.mid, marginTop: "0.7rem", overflow: "hidden", height: 520 }}>
            <canvas ref={canvasRef} style={{ display: "block", width: "100%", height: "100%" }} data-testid="fqp-canvas" />
            <div style={{ position: "absolute", bottom: 12, left: 14, fontFamily: "'DM Mono', monospace", fontSize: "0.5rem", letterSpacing: "0.14em", color: COLORS.gold, opacity: 0.4, lineHeight: 1.9, pointerEvents: "none" }}>
              MODE: {mode.toUpperCase()}<br />
              INPUT: {input}<br />
              ZECKENDORF: [{decomp.join(", ")}]
            </div>
          </div>

          {/* Zeckendorf encoder panel */}
          <div style={{ marginTop: "1rem", padding: "0.9rem 1rem", border: `1px solid ${COLORS.border}`, background: "rgba(212,168,85,0.04)" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
              <label style={{ fontFamily: "'DM Mono', monospace", fontSize: "0.62rem", letterSpacing: "0.16em", color: COLORS.dim, textTransform: "uppercase" }}>
                Encode Integer
              </label>
              <input
                type="number"
                value={input}
                min={1}
                max={1000}
                onChange={(e) => setInput(Math.max(1, Math.min(1000, Number(e.target.value) || 1)))}
                data-testid="input-number"
                style={{
                  width: 90, fontFamily: "'DM Mono', monospace", fontSize: "0.95rem",
                  background: "transparent", border: `1px solid ${COLORS.border}`,
                  color: COLORS.gold2, padding: "0.4rem 0.6rem", textAlign: "center",
                }}
              />
              <span style={{ color: COLORS.dim, fontFamily: "'DM Mono', monospace", fontSize: "0.7rem" }}>=</span>
              <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                {decomp.map((f, i) => (
                  <span key={i} style={{
                    fontFamily: "'DM Mono', monospace", fontSize: "0.85rem",
                    color: COLORS.cream, padding: "0.3rem 0.55rem",
                    border: `1px solid ${COLORS.gold}`, background: "rgba(212,168,85,0.08)",
                  }}>F{FIBS.indexOf(f) + 1}={f}</span>
                ))}
                {decomp.length > 1 && (
                  <span style={{ color: COLORS.dim, fontSize: "0.85rem", alignSelf: "center" }}>
                    sum = {decomp.reduce((a, b) => a + b, 0)}
                  </span>
                )}
              </div>
            </div>
            <div style={{ marginTop: 10, fontSize: "0.78rem", color: COLORS.text, fontStyle: "italic" }}>
              Sparse, non-consecutive Fibonacci representation. Each integer maps uniquely to a minimum set —
              the geometry of efficient encoding.
            </div>
          </div>
        </main>

        <aside style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
          <div style={{ border: `1px solid ${COLORS.border}`, padding: "1rem", background: COLORS.panel }}>
            <div style={{ fontFamily: "'DM Mono', monospace", fontSize: "0.6rem", letterSpacing: "0.2em", color: COLORS.dim, textTransform: "uppercase" }}>Golden Constants</div>
            <div style={{ fontFamily: "'Playfair Display', Georgia, serif", fontSize: "1.7rem", color: COLORS.gold2, fontStyle: "italic", marginTop: 6 }}>φ = 1.6180339887</div>
            <div style={{ color: COLORS.text, fontSize: "0.78rem", marginTop: 4 }}>Asymptotic attractor of recursive addition.</div>
            <div style={{ marginTop: 12, color: COLORS.cream, fontFamily: "'DM Mono', monospace", fontSize: "0.85rem", letterSpacing: "0.06em" }}>
              {FIBS.slice(0, 12).join("  ·  ")}
            </div>
            <div style={{ color: COLORS.dim, fontSize: "0.7rem", marginTop: 4 }}>F(n+1) / F(n) → φ</div>
          </div>

          <div style={{ border: `1px solid ${COLORS.border}`, padding: "1rem", background: COLORS.panel }}>
            <div style={{ fontFamily: "'DM Mono', monospace", fontSize: "0.6rem", letterSpacing: "0.2em", color: COLORS.dim, textTransform: "uppercase" }}>Mode Notes</div>
            <div style={{ marginTop: 8, fontSize: "0.82rem", lineHeight: 1.55 }}>
              <div style={{ color: COLORS.gold2 }}>SPIRAL</div>
              <div style={{ color: COLORS.text, marginBottom: 8 }}>Phyllotactic golden-angle distribution. Active Fibonacci nodes glow.</div>
              <div style={{ color: COLORS.gold2 }}>TREE</div>
              <div style={{ color: COLORS.text, marginBottom: 8 }}>Recursive φ-branching — each branch length = parent / φ.</div>
              <div style={{ color: COLORS.gold2 }}>WAVE</div>
              <div style={{ color: COLORS.text }}>Superposition of frequencies indexed by the current Zeckendorf set.</div>
            </div>
          </div>

          <div style={{ border: `1px solid ${COLORS.border}`, padding: "1rem", background: COLORS.panel }}>
            <div style={{ fontFamily: "'DM Mono', monospace", fontSize: "0.6rem", letterSpacing: "0.2em", color: COLORS.dim, textTransform: "uppercase" }}>Sparse Encoding Principle</div>
            <div style={{ color: COLORS.text, fontSize: "0.78rem", marginTop: 8, fontStyle: "italic" }}>
              Neural firing approximates Fibonacci decomposition. Cognition approximates emergent pattern stabilization.
              Complexity is not injected — it accumulates through recursion.
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}

function hexA(hex: string, a: number) {
  const h = hex.replace("#", "");
  const r = parseInt(h.slice(0, 2), 16), g = parseInt(h.slice(2, 4), 16), b = parseInt(h.slice(4, 6), 16);
  return `rgba(${r},${g},${b},${a})`;
}
