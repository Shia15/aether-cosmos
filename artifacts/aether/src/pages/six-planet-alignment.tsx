import { useEffect, useRef, useState } from "react";

const PHI = 1.6180339887;

type Planet = {
  name: string;
  color: string;
  angular: number;     // degrees in arc
  period: string;
  size: number;
  coherence: number;   // %
};

const PLANETS: Planet[] = [
  { name: "MERCURY", color: "#ff9b6b", angular: 15.2, period: "87.97d",  size: 4, coherence: 73 },
  { name: "VENUS",   color: "#ffd966", angular: 28.7, period: "224.7d",  size: 6, coherence: 85 },
  { name: "JUPITER", color: "#e8a55a", angular: 45.1, period: "11.86y",  size: 11, coherence: 92 },
  { name: "SATURN",  color: "#d4a878", angular: 52.8, period: "29.46y",  size: 9, coherence: 88 },
  { name: "URANUS",  color: "#7ec8d4", angular: 67.4, period: "84.01y",  size: 7, coherence: 81 },
  { name: "NEPTUNE", color: "#5b8fc4", angular: 73.9, period: "164.8y",  size: 7, coherence: 76 },
];

export default function SixPlanetAlignmentView() {
  const skyRef   = useRef<HTMLCanvasElement>(null);
  const wavesRef = useRef<HTMLCanvasElement>(null);
  const phiRef   = useRef<HTMLCanvasElement>(null);
  const [tick, setTick] = useState(0);

  // Sky canvas
  useEffect(() => {
    const c = skyRef.current; if (!c) return;
    const ctx = c.getContext("2d"); if (!ctx) return;
    let raf = 0; let t = 0;
    const stars = Array.from({ length: 220 }, () => ({
      x: Math.random(), y: Math.random() * 0.7,
      r: Math.random() * 1.2 + 0.2,
      tw: Math.random() * Math.PI * 2,
    }));
    const resize = () => {
      const r = c.parentElement!.getBoundingClientRect();
      c.width = r.width; c.height = r.height;
    };
    resize();
    const onResize = () => resize();
    window.addEventListener("resize", onResize);

    const draw = () => {
      const W = c.width, H = c.height;
      // gradient sky
      const grad = ctx.createLinearGradient(0, 0, 0, H);
      grad.addColorStop(0, "#0a0d18");
      grad.addColorStop(0.55, "#13182c");
      grad.addColorStop(0.78, "#3d2547");
      grad.addColorStop(0.92, "#7a3a40");
      grad.addColorStop(1, "#a05533");
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, W, H);

      // horizon line
      ctx.strokeStyle = "rgba(255,180,120,0.4)";
      ctx.lineWidth = 1;
      ctx.beginPath(); ctx.moveTo(0, H * 0.78); ctx.lineTo(W, H * 0.78); ctx.stroke();

      // distant landscape
      ctx.fillStyle = "rgba(0,0,0,0.85)";
      ctx.beginPath();
      ctx.moveTo(0, H);
      for (let x = 0; x <= W; x += 12) {
        const y = H * 0.78 + Math.sin(x * 0.012 + 1) * 4 + Math.sin(x * 0.04) * 2;
        ctx.lineTo(x, y);
      }
      ctx.lineTo(W, H); ctx.closePath(); ctx.fill();

      // stars
      stars.forEach((s) => {
        const tw = 0.5 + 0.5 * Math.sin(t * 1.2 + s.tw);
        ctx.fillStyle = `rgba(220,230,255,${0.4 + tw * 0.6})`;
        ctx.beginPath(); ctx.arc(s.x * W, s.y * H, s.r, 0, Math.PI * 2); ctx.fill();
      });

      // arc of planets across western horizon
      const cx = W * 0.5, cy = H * 0.95;
      const radius = Math.min(W * 0.42, H * 0.7);
      PLANETS.forEach((p, i) => {
        const baseAngle = Math.PI * 1.05; // start
        const span = Math.PI * 0.85;
        const a = baseAngle + (i / (PLANETS.length - 1)) * span;
        const wobble = Math.sin(t * 0.6 + i) * 0.005;
        const x = cx + Math.cos(a + wobble) * radius;
        const y = cy + Math.sin(a + wobble) * radius * 0.55;

        // glow
        const grd = ctx.createRadialGradient(x, y, 0, x, y, p.size * 5);
        grd.addColorStop(0, p.color);
        grd.addColorStop(0.4, p.color + "55");
        grd.addColorStop(1, p.color + "00");
        ctx.fillStyle = grd;
        ctx.beginPath(); ctx.arc(x, y, p.size * 5, 0, Math.PI * 2); ctx.fill();

        // body
        ctx.fillStyle = p.color;
        ctx.beginPath(); ctx.arc(x, y, p.size, 0, Math.PI * 2); ctx.fill();

        // label
        ctx.fillStyle = "rgba(255,255,255,0.6)";
        ctx.font = "8px 'Share Tech Mono', monospace";
        ctx.textAlign = "center";
        ctx.fillText(p.name, x, y - p.size - 6);
      });

      // toroidal coupling field overlay
      ctx.strokeStyle = "rgba(0,229,200,0.12)";
      ctx.lineWidth = 0.6;
      for (let r = 30; r < radius; r += 30) {
        ctx.beginPath();
        ctx.ellipse(cx, cy, r, r * 0.55, 0, Math.PI * 1.05, Math.PI * 1.95);
        ctx.stroke();
      }

      t += 0.012;
      raf = requestAnimationFrame(draw);
    };
    draw();
    return () => { cancelAnimationFrame(raf); window.removeEventListener("resize", onResize); };
  }, []);

  // Waves canvas (resonance)
  useEffect(() => {
    const c = wavesRef.current; if (!c) return;
    const ctx = c.getContext("2d"); if (!ctx) return;
    let raf = 0; let t = 0;
    const resize = () => {
      const r = c.parentElement!.getBoundingClientRect();
      c.width = r.width; c.height = r.height;
    };
    resize();
    const onR = () => resize(); window.addEventListener("resize", onR);
    const draw = () => {
      const W = c.width, H = c.height;
      ctx.clearRect(0, 0, W, H);
      ctx.fillStyle = "rgba(8,10,18,0.7)"; ctx.fillRect(0, 0, W, H);
      // Three coupled waves: quantum, biological, planetary
      const freqs = [{ f: 0.06, c: "#a78bfa", amp: 0.5 }, { f: 0.025, c: "#5dba6e", amp: 0.7 }, { f: 0.01, c: "#00e5c8", amp: 0.9 }];
      freqs.forEach((wf, idx) => {
        ctx.strokeStyle = wf.c;
        ctx.lineWidth = 1.2;
        ctx.globalAlpha = 0.7;
        ctx.beginPath();
        for (let x = 0; x <= W; x += 2) {
          const y = H / 2 + Math.sin(x * wf.f + t * (1 + idx * 0.3)) * H * 0.18 * wf.amp;
          x === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
        }
        ctx.stroke();
      });
      ctx.globalAlpha = 1;
      t += 0.05;
      raf = requestAnimationFrame(draw);
    };
    draw();
    return () => { cancelAnimationFrame(raf); window.removeEventListener("resize", onR); };
  }, []);

  // Fibonacci spiral canvas
  useEffect(() => {
    const c = phiRef.current; if (!c) return;
    const ctx = c.getContext("2d"); if (!ctx) return;
    const draw = () => {
      const rect = c.parentElement!.getBoundingClientRect();
      c.width = rect.width; c.height = rect.height;
      const W = c.width, H = c.height;
      ctx.clearRect(0, 0, W, H);
      ctx.strokeStyle = "rgba(244,209,59,0.7)";
      ctx.lineWidth = 1.4;
      ctx.beginPath();
      const cx = W / 2, cy = H / 2;
      const a = 0.16;
      for (let theta = 0; theta < Math.PI * 6; theta += 0.05) {
        const r2 = a * Math.exp(theta * Math.log(PHI) / (Math.PI / 2));
        const x = cx + r2 * Math.cos(theta) * 14;
        const y = cy + r2 * Math.sin(theta) * 14;
        theta === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
      }
      ctx.stroke();
      [1, 2, 3, 5, 8, 13].forEach((fi, i) => {
        const theta = (i + 1) * 0.65;
        const r2 = a * Math.exp(theta * Math.log(PHI) / (Math.PI / 2));
        const x = cx + r2 * Math.cos(theta) * 14;
        const y = cy + r2 * Math.sin(theta) * 14;
        ctx.fillStyle = "#f4d13b";
        ctx.beginPath(); ctx.arc(x, y, 3, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = "rgba(244,209,59,0.7)";
        ctx.font = "9px monospace"; ctx.textAlign = "center";
        ctx.fillText(String(fi), x, y - 6);
      });
    };
    draw();
    window.addEventListener("resize", draw);
    return () => window.removeEventListener("resize", draw);
  }, []);

  useEffect(() => {
    const id = setInterval(() => setTick((t) => t + 1), 1000);
    return () => clearInterval(id);
  }, []);

  return (
    <div style={{ minHeight: "100%", background: "#0a0d18", color: "#e2e8f0", fontFamily: "'Inter', system-ui, sans-serif" }}>
      <header style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "1.4rem 2rem", borderBottom: "1px solid rgba(0,229,200,0.18)", background: "linear-gradient(90deg, rgba(0,229,200,0.04), transparent)" }}>
        <div>
          <div style={{ color: "#00e5c8", fontFamily: "'Cinzel', serif", letterSpacing: "0.3em", fontSize: "0.72rem", textTransform: "uppercase" }}>AETHER · Planetary Alignment Analysis</div>
          <h1 style={{ fontFamily: "'Cinzel', serif", fontSize: "clamp(1.4rem, 2.4vw, 2rem)", marginTop: 6, letterSpacing: "0.04em" }}>
            Six-Planet Evening Arc · <span style={{ color: "#00e5c8" }}>March 2026</span>
          </h1>
        </div>
        <div style={{ textAlign: "right", color: "#94a3b8", fontFamily: "'Share Tech Mono', monospace", fontSize: "0.7rem", letterSpacing: "0.15em" }}>
          <div>MARCH 1–8, 2026</div>
          <div style={{ color: "#475569", marginTop: 2 }}>WESTERN HORIZON · t = {tick}s</div>
        </div>
      </header>

      <div style={{ display: "grid", gridTemplateColumns: "260px 1fr 280px", gap: "1rem", padding: "1rem", height: "calc(100vh - 88px)" }}>
        {/* LEFT */}
        <aside style={{ display: "flex", flexDirection: "column", gap: "0.7rem", overflow: "auto" }}>
          <div style={{ color: "#475569", fontFamily: "'Share Tech Mono', monospace", letterSpacing: "0.2em", fontSize: "0.62rem", textTransform: "uppercase" }}>Planetary Configuration</div>
          {PLANETS.map((p) => (
            <div key={p.name} style={{ display: "flex", alignItems: "center", gap: "0.7rem", border: "1px solid rgba(255,255,255,0.06)", padding: "0.6rem 0.7rem", background: "rgba(255,255,255,0.02)" }} data-testid={`planet-${p.name.toLowerCase()}`}>
              <div style={{ width: 12, height: 12, borderRadius: "50%", background: p.color, boxShadow: `0 0 12px ${p.color}` }} />
              <div style={{ flex: 1 }}>
                <div style={{ color: p.color, fontFamily: "'Share Tech Mono', monospace", fontSize: "0.78rem", letterSpacing: "0.1em" }}>{p.name}</div>
                <div style={{ color: "#94a3b8", fontSize: "0.7rem", marginTop: 2 }}>Angular: {p.angular}° · Period: {p.period}</div>
              </div>
            </div>
          ))}

          <div style={{ marginTop: "0.5rem", border: "1px solid rgba(244,209,59,0.25)", padding: "0.9rem", background: "rgba(244,209,59,0.04)" }}>
            <div style={{ color: "#f4d13b", fontFamily: "'Share Tech Mono', monospace", letterSpacing: "0.18em", fontSize: "0.62rem", textTransform: "uppercase", textAlign: "center" }}>Phi-Ratio Analysis</div>
            <div style={{ color: "#f4d13b", fontFamily: "'Cinzel', serif", fontSize: "1.4rem", textAlign: "center", margin: "0.5rem 0" }}>φ = 1.618034…</div>
            <div style={{ fontSize: "0.7rem", color: "rgba(255,255,255,0.55)", textAlign: "center" }}>Angular spacing follows Fibonacci quantization</div>
          </div>
        </aside>

        {/* MAIN VIZ */}
        <main style={{ display: "grid", gridTemplateRows: "1.4fr 0.7fr", gap: "0.6rem", minHeight: 0 }}>
          <div style={{ position: "relative", border: "1px solid rgba(0,229,200,0.18)", overflow: "hidden", background: "#000" }}>
            <canvas ref={skyRef} style={{ display: "block", width: "100%", height: "100%" }} data-testid="sky-canvas" />
            <div style={{ position: "absolute", top: 12, left: 14, color: "rgba(0,229,200,0.7)", fontFamily: "'Cinzel', serif", letterSpacing: "0.15em", fontSize: "0.78rem" }}>
              Six-Planet Evening Arc
            </div>
            <div style={{ position: "absolute", top: 32, left: 14, color: "#94a3b8", fontFamily: "'Share Tech Mono', monospace", fontSize: "0.6rem", letterSpacing: "0.18em" }}>
              MARCH 2026 · WESTERN HORIZON
            </div>
            <div style={{ position: "absolute", bottom: 10, right: 12, display: "flex", flexDirection: "column", gap: 4, fontFamily: "'Share Tech Mono', monospace", fontSize: "0.58rem", color: "#94a3b8" }}>
              {[
                ["#a78bfa", "QUANTUM"],
                ["#5dba6e", "BIOLOGICAL"],
                ["#00e5c8", "PLANETARY"],
              ].map(([col, lbl]) => (
                <div key={lbl} style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  <div style={{ width: 8, height: 8, background: col, borderRadius: "50%" }} /> {lbl}
                </div>
              ))}
            </div>
          </div>
          <div style={{ position: "relative", border: "1px solid rgba(0,229,200,0.18)", overflow: "hidden", background: "#000" }}>
            <canvas ref={wavesRef} style={{ display: "block", width: "100%", height: "100%" }} data-testid="waves-canvas" />
            <div style={{ position: "absolute", top: 8, left: 12, color: "rgba(0,229,200,0.7)", fontFamily: "'Share Tech Mono', monospace", letterSpacing: "0.18em", fontSize: "0.6rem", textTransform: "uppercase" }}>
              Coupled Wave Dynamics — Quantum · Biological · Planetary
            </div>
          </div>
        </main>

        {/* RIGHT */}
        <aside style={{ display: "flex", flexDirection: "column", gap: "0.8rem", overflow: "auto" }}>
          <div style={{ color: "#475569", fontFamily: "'Share Tech Mono', monospace", letterSpacing: "0.2em", fontSize: "0.62rem", textTransform: "uppercase" }}>Wave Dynamics</div>
          <div style={{ border: "1px solid rgba(255,255,255,0.08)", padding: "0.9rem", background: "rgba(0,229,200,0.04)" }}>
            <div style={{ color: "#94a3b8", fontFamily: "'Share Tech Mono', monospace", fontSize: "0.62rem", letterSpacing: "0.15em", textTransform: "uppercase" }}>Scale-Invariant Coupling</div>
            <div style={{ color: "#00e5c8", fontFamily: "'Cinzel', serif", fontSize: "1.45rem", textAlign: "center", margin: "0.5rem 0" }}>∇²Ψ = k²φⁿΨ</div>
            <div style={{ color: "rgba(255,255,255,0.55)", fontSize: "0.7rem", textAlign: "center" }}>The same field equation governs quantum, biological, and orbital coherence — only n changes.</div>
          </div>

          <div style={{ color: "#475569", fontFamily: "'Share Tech Mono', monospace", letterSpacing: "0.2em", fontSize: "0.62rem", textTransform: "uppercase" }}>Coherence Meters</div>
          {PLANETS.slice(2, 5).map((p) => (
            <div key={p.name}>
              <div style={{ display: "flex", justifyContent: "space-between", fontFamily: "'Share Tech Mono', monospace", fontSize: "0.62rem", color: p.color, letterSpacing: "0.1em" }}>
                <span>{p.name}</span><span>{p.coherence}%</span>
              </div>
              <div style={{ height: 6, background: "rgba(255,255,255,0.06)", marginTop: 4, position: "relative", overflow: "hidden" }}>
                <div style={{ position: "absolute", inset: 0, width: `${p.coherence}%`, background: `linear-gradient(90deg, ${p.color}, ${p.color}AA)`, boxShadow: `0 0 8px ${p.color}` }} />
              </div>
            </div>
          ))}

          <div style={{ marginTop: "0.4rem", color: "#475569", fontFamily: "'Share Tech Mono', monospace", letterSpacing: "0.2em", fontSize: "0.62rem", textTransform: "uppercase" }}>Fibonacci Spiral</div>
          <div style={{ border: "1px solid rgba(244,209,59,0.2)", height: 200, background: "#000", overflow: "hidden" }}>
            <canvas ref={phiRef} style={{ display: "block", width: "100%", height: "100%" }} data-testid="phi-canvas" />
          </div>
        </aside>
      </div>
    </div>
  );
}
