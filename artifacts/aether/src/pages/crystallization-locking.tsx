import { useState, useEffect, useRef, useCallback } from "react";
import heroImg from "@assets/e89bc72f-a011-4d76-9073-3dbc7e4d7296_(1)_1782665554449.jpg";

const C = {
  bg:     "#04060E",
  panel:  "rgba(8,12,24,0.85)",
  border: "rgba(0,229,192,0.12)",
  aurora: "#00FFB2",
  gold:   "#C8A030",
  violet: "#9966ff",
  rose:   "#ff4488",
  cyan:   "#00FFEE",
  stone:  "#8a8478",
  dim:    "#2a4060",
  text:   "rgba(200,230,255,0.78)",
};

const GRID = 44;          // SOC grid cells per side
const THRESH = 4;         // topple threshold

type Stage = { n: string; title: string; col: string; body: string };
const STAGES: Stage[] = [
  { n: "1", title: "Disruption", col: C.aurora,
    body: "Fluid networks overload -- synaptic flooding under stress. The living lattice still flows, but coherence begins to fracture as load exceeds capacity." },
  { n: "2", title: "Infiltration", col: C.violet,
    body: "Minerals and perturbations replace organics, atom by atom. Plastic, flowing tissue is substituted with rigid crystalline structure that cannot adapt." },
  { n: "3", title: "Locking", col: C.stone,
    body: "A power-law state emerges. Small shocks trigger cascading failures with Zipf-distributed fragility. The system converges to a brittle equilibrium where entropy maximizes." },
];

function clamp(v: number, lo: number, hi: number) { return Math.max(lo, Math.min(hi, v)); }

// ─── SOC Avalanche Canvas ─────────────────────────────────────────────────────

function SOCanvas({ minerals, chaos, resetKey, onAvalanche }:
  { minerals: number; chaos: number; resetKey: number; onAvalanche: (size: number) => void }) {
  const ref = useRef<HTMLCanvasElement>(null);
  const raf = useRef(0);
  const mRef = useRef(minerals); useEffect(() => { mRef.current = minerals; }, [minerals]);
  const kRef = useRef(chaos);    useEffect(() => { kRef.current = chaos; }, [chaos]);
  const cbRef = useRef(onAvalanche); useEffect(() => { cbRef.current = onAvalanche; }, [onAvalanche]);

  useEffect(() => {
    const canvas = ref.current; if (!canvas) return;
    const ctx = canvas.getContext("2d")!;
    const SZ = 520;
    canvas.width = SZ; canvas.height = SZ;
    const cell = SZ / GRID;
    const grid = new Float32Array(GRID * GRID);
    const active = new Uint8Array(GRID * GRID); // recently toppled for glow
    let t = 0;
    let frame = 0;
    const idx = (x: number, y: number) => y * GRID + x;

    const topple = () => {
      let avalanche = 0;
      let unstable = true;
      let guard = 0;
      while (unstable && guard < 60) {
        unstable = false; guard++;
        for (let y = 0; y < GRID; y++) {
          for (let x = 0; x < GRID; x++) {
            const i = idx(x, y);
            if (grid[i] >= THRESH) {
              grid[i] -= THRESH;
              active[i] = 8;
              avalanche++;
              unstable = true;
              if (x > 0)        grid[idx(x - 1, y)] += 1;
              if (x < GRID - 1) grid[idx(x + 1, y)] += 1;
              if (y > 0)        grid[idx(x, y - 1)] += 1;
              if (y < GRID - 1) grid[idx(x, y + 1)] += 1;
            }
          }
        }
      }
      if (avalanche > 0) cbRef.current(avalanche);
    };

    const draw = () => {
      frame++;
      // grain addition rate scales with minerals; chaos adds random scatter
      const adds = 1 + Math.round(mRef.current * 4);
      for (let a = 0; a < adds; a++) {
        const rx = Math.floor(Math.random() * GRID);
        const ry = Math.floor(Math.random() * GRID);
        grid[idx(rx, ry)] += 1;
      }
      // chaos = plasticity: randomly relax some cells (resists locking)
      const relax = Math.round(kRef.current * 6);
      for (let a = 0; a < relax; a++) {
        const rx = Math.floor(Math.random() * GRID);
        const ry = Math.floor(Math.random() * GRID);
        if (grid[idx(rx, ry)] > 0) grid[idx(rx, ry)] -= 1;
      }
      topple();

      ctx.fillStyle = C.bg;
      ctx.fillRect(0, 0, SZ, SZ);
      for (let y = 0; y < GRID; y++) {
        for (let x = 0; x < GRID; x++) {
          const i = idx(x, y);
          const v = grid[i];
          const lvl = clamp(v / THRESH, 0, 1);
          // fluid (aurora) -> crystal (cyan/violet) -> brittle stone (grey)
          let r: number, g: number, b: number;
          if (lvl < 0.4) {
            const u = lvl / 0.4;
            r = Math.round(0 + u * 40); g = Math.round(60 + u * 195); b = Math.round(90 + u * 90);
          } else if (lvl < 0.8) {
            const u = (lvl - 0.4) / 0.4;
            r = Math.round(40 + u * 113); g = Math.round(255 - u * 105); b = Math.round(180 - u * 60);
          } else {
            const u = (lvl - 0.8) / 0.2;
            r = Math.round(153 + u * (138 - 153)); g = Math.round(150 + u * (132 - 150)); b = Math.round(120 + u * (120 - 120));
          }
          if (active[i] > 0) {
            const f = active[i] / 8;
            r = Math.round(r + (255 - r) * f);
            g = Math.round(g + (255 - g) * f);
            b = Math.round(b + (255 - b) * f);
            active[i]--;
          }
          if (v <= 0.01) { ctx.fillStyle = "rgba(10,16,30,0.9)"; }
          else { ctx.fillStyle = `rgb(${r},${g},${b})`; }
          ctx.fillRect(x * cell, y * cell, cell - 0.5, cell - 0.5);
        }
      }
      t++;
      raf.current = requestAnimationFrame(draw);
    };
    draw();
    return () => cancelAnimationFrame(raf.current);
  }, [resetKey]);

  return <canvas ref={ref} style={{ width: "100%", height: "auto", display: "block", borderRadius: 8, imageRendering: "pixelated" }} />;
}

// ─── Power-law histogram ──────────────────────────────────────────────────────

function PowerLawChart({ buckets }: { buckets: number[] }) {
  const max = Math.max(1, ...buckets);
  return (
    <div style={{ display: "flex", alignItems: "flex-end", gap: 3, height: 120, padding: "8px 0" }}>
      {buckets.map((b, i) => {
        const h = b > 0 ? (Math.log(b + 1) / Math.log(max + 1)) * 100 : 0;
        return (
          <div key={i} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 3 }}>
            <div style={{
              width: "100%",
              height: `${h}%`,
              minHeight: b > 0 ? 2 : 0,
              background: `linear-gradient(180deg, ${C.aurora}, ${C.violet})`,
              borderRadius: "2px 2px 0 0",
              transition: "height 0.3s",
            }} />
            <span style={{ fontSize: 7, color: C.dim, fontFamily: "'DM Mono',monospace" }}>{Math.pow(2, i)}</span>
          </div>
        );
      })}
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function CrystallizationLockingPage() {
  const [minerals, setMinerals] = useState(0.5);
  const [chaos, setChaos] = useState(0.3);
  const [resetKey, setResetKey] = useState(0);
  const [buckets, setBuckets] = useState<number[]>(() => new Array(9).fill(0));
  const [totalAval, setTotalAval] = useState(0);
  const [lockState, setLockState] = useState(0);

  const onAvalanche = useCallback((size: number) => {
    const bucket = clamp(Math.floor(Math.log2(size)), 0, 8);
    setBuckets(prev => { const next = prev.slice(); next[bucket]++; return next; });
    setTotalAval(n => n + 1);
    setLockState(s => clamp(s + size * 0.0004, 0, 1));
  }, []);

  // S(t) advances toward brittle equilibrium per dS/dt = -k(chaos) + m(minerals)
  useEffect(() => {
    const id = setInterval(() => {
      setLockState(s => clamp(s + (minerals * 0.02) - (chaos * 0.012), 0, 1));
    }, 200);
    return () => clearInterval(id);
  }, [chaos, minerals]);

  const dSdt = (minerals * 1.4 - chaos * 1);

  const injectCoherence = () => {
    setLockState(0);
    setBuckets(new Array(9).fill(0));
    setTotalAval(0);
    setResetKey(k => k + 1);
  };

  const panel = { background: C.panel, border: `1px solid ${C.border}`, borderRadius: 12 };
  const slider = (label: string, val: number, set: (v: number) => void, col: string, sub: string) => (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", fontSize: 9, marginBottom: 5 }}>
        <span style={{ color: C.dim }}>{label}</span>
        <span style={{ color: col }}>{val.toFixed(2)}</span>
      </div>
      <input type="range" min={0} max={1} step={0.01} value={val}
        onChange={e => set(Number(e.target.value))}
        style={{ width: "100%", accentColor: col }} />
      <div style={{ fontSize: 7.5, color: "rgba(200,230,255,0.25)", marginTop: 3 }}>{sub}</div>
    </div>
  );

  return (
    <div style={{ background: C.bg, minHeight: "100vh", color: C.text, fontFamily: "'DM Mono',monospace" }}>
      {/* Header */}
      <div style={{ padding: "2rem 2.5rem 1.2rem", borderBottom: `1px solid ${C.border}` }}>
        <div style={{ fontSize: 8, letterSpacing: "0.4em", color: C.dim, textTransform: "uppercase", marginBottom: 6 }}>
          AETHER · CRYSTALLIZATION MODEL
        </div>
        <h1 style={{
          margin: 0, fontSize: 32, letterSpacing: "0.06em", fontFamily: "'Cinzel','Orbitron',sans-serif",
          background: `linear-gradient(135deg, ${C.aurora}, ${C.cyan}, ${C.stone})`,
          WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
        }}>
          Crystallization &middot; Locking
        </h1>
        <p style={{ margin: "8px 0 0", fontSize: 11, color: "rgba(200,230,255,0.35)", lineHeight: 1.6, maxWidth: 640 }}>
          How a living fluid network locks into brittle stone -- disruption, mineral infiltration, and the power-law fragility of self-organized criticality.
        </p>
      </div>

      <div style={{ padding: "1.5rem 2.5rem", display: "flex", flexDirection: "column", gap: "1.4rem" }}>

        {/* Stages + hero */}
        <div style={{ display: "grid", gridTemplateColumns: "300px 1fr", gap: "1.4rem" }}>
          <div style={{ ...panel, overflow: "hidden" }}>
            <img src={heroImg} alt="Crystallization model: fluid network to brittle stone" style={{ width: "100%", display: "block" }} />
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: "0.8rem" }}>
            {STAGES.map(s => (
              <div key={s.n} style={{ ...panel, padding: "0.9rem 1.1rem", borderLeft: `3px solid ${s.col}`, display: "flex", gap: 14 }}>
                <div style={{
                  width: 30, height: 30, flexShrink: 0, borderRadius: "50%",
                  border: `1px solid ${s.col}`, color: s.col, display: "flex",
                  alignItems: "center", justifyContent: "center", fontSize: 13, fontFamily: "'Cinzel',serif",
                }}>{s.n}</div>
                <div>
                  <div style={{ fontSize: 12, color: s.col, letterSpacing: "0.15em", textTransform: "uppercase", marginBottom: 4 }}>{s.title}</div>
                  <p style={{ fontSize: 9.5, color: "rgba(200,230,255,0.42)", lineHeight: 1.6, margin: 0 }}>{s.body}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* SOC simulation */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 300px", gap: "1.4rem" }}>
          <div style={{ ...panel, overflow: "hidden", display: "flex", justifyContent: "center", padding: 12 }}>
            <SOCanvas minerals={minerals} chaos={chaos} resetKey={resetKey} onAvalanche={onAvalanche} />
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
            <div style={{ ...panel, padding: "1.1rem 1.2rem" }}>
              <div style={{ fontSize: 9, color: C.aurora, letterSpacing: "0.25em", textTransform: "uppercase", marginBottom: 14 }}>
                Governing Equation
              </div>
              <div style={{
                fontSize: 16, fontFamily: "'Crimson Pro',serif", fontStyle: "italic",
                color: C.text, textAlign: "center", marginBottom: 6,
              }}>
                dS/dt = &minus;k(chaos) + m(minerals)
              </div>
              <div style={{ textAlign: "center", fontSize: 10, color: dSdt >= 0 ? C.rose : C.aurora, marginBottom: 14 }}>
                dS/dt = {dSdt >= 0 ? "+" : ""}{dSdt.toFixed(2)} {dSdt >= 0 ? "(locking)" : "(restoring)"}
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                {slider("m -- mineral infiltration", minerals, setMinerals, C.violet, "rate of brittle substitution")}
                {slider("k -- chaos / plasticity", chaos, setChaos, C.aurora, "flow that resists locking")}
              </div>
            </div>

            <div style={{ ...panel, padding: "1.1rem 1.2rem" }}>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 9, marginBottom: 8 }}>
                <span style={{ color: C.dim, letterSpacing: "0.2em", textTransform: "uppercase" }}>Lock State S(t)</span>
                <span style={{ color: lockState < 0.5 ? C.aurora : lockState < 0.8 ? C.gold : C.rose }}>{(lockState * 100).toFixed(0)}%</span>
              </div>
              <div style={{ height: 6, borderRadius: 3, overflow: "hidden", background: "rgba(255,255,255,0.05)" }}>
                <div style={{
                  height: "100%", width: `${lockState * 100}%`,
                  background: `linear-gradient(90deg, ${C.aurora}, ${C.gold}, ${C.rose})`,
                  transition: "width 0.3s",
                }} />
              </div>
              <button onClick={injectCoherence} style={{
                width: "100%", marginTop: 14, padding: "0.6rem", borderRadius: 8,
                border: `1px solid ${C.aurora}66`, background: `${C.aurora}14`, color: C.aurora,
                fontFamily: "'DM Mono',monospace", fontSize: 9.5, letterSpacing: "0.15em",
                textTransform: "uppercase", cursor: "pointer",
              }}>
                Inject Coherence &middot; β-reset
              </button>
              <div style={{ fontSize: 7.5, color: "rgba(200,230,255,0.28)", marginTop: 8, lineHeight: 1.5 }}>
                Reversal requires coherence injection -- a β-scaled reset that retunes the SOC thresholds back toward plasticity.
              </div>
            </div>
          </div>
        </div>

        {/* Power-law */}
        <div style={{ ...panel, padding: "1.2rem 1.5rem", borderLeft: `3px solid ${C.violet}` }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 6 }}>
            <div style={{ fontSize: 9, color: C.violet, letterSpacing: "0.25em", textTransform: "uppercase" }}>
              Avalanche Size Distribution &middot; Zipf Fragility
            </div>
            <div style={{ fontSize: 9, color: C.dim }}>total failures: <span style={{ color: C.gold }}>{totalAval}</span></div>
          </div>
          <PowerLawChart buckets={buckets} />
          <div style={{ fontSize: 8.5, color: "rgba(200,230,255,0.3)", lineHeight: 1.6, marginTop: 4 }}>
            Once locked, failures follow a power law: many tiny shocks, rare catastrophic cascades. The log-scaled bars (avalanche size, base 2) reveal the signature straight-line slope of self-organized criticality -- the same statistics that govern earthquakes, neuronal avalanches, and brittle fracture.
          </div>
        </div>
      </div>
    </div>
  );
}
