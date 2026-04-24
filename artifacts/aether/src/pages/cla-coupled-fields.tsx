import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

const C = {
  bg: "#03060f", panel: "rgba(6,10,22,0.86)",
  border: "rgba(120,180,255,0.12)", border2: "rgba(120,180,255,0.26)",
  white: "#E8F2FF", text: "#8FA8C2", muted: "#5F778F", dim: "#3F5167",
  water: "#4FC3F7", animal: "#E8A820", human: "#C77DFF", planet: "#FFD66B",
  good: "#5DBA6E",
};

type Mode = "solo" | "coupled" | "planetary";

const MODES: { key: Mode; n: string; label: string; col: string; desc: string }[] = [
  { key: "solo",      n: "01", label: "Solo",      col: C.text,
    desc: "Three CGLE lattices evolve independently. ε_WA = ε_AH = ε_WH = 0. Each domain finds its own attractor." },
  { key: "coupled",   n: "02", label: "Coupled",   col: C.water,
    desc: "Pairwise diffusive coupling between water · animal · human lattices. Order parameters R_X synchronise as ε increases." },
  { key: "planetary", n: "03", label: "Planetary", col: C.planet,
    desc: "Global periodic forcing F(t) modulates all three lattices. Models a planetary alignment as a coherent driver of biospheric phase." },
];

const FIELDS = [
  { key: "water",  label: "Water",  col: C.water,  glyph: "≋" },
  { key: "animal", label: "Animal", col: C.animal, glyph: "✻" },
  { key: "human",  label: "Human",  col: C.human,  glyph: "☉" },
] as const;

interface FieldState { phi: number[]; }
interface LogEntry { ts: string; field: string; msg: string; col: string; }

const N = 24;

function newField(): FieldState {
  const phi: number[] = [];
  for (let i = 0; i < N * N; i++) phi.push(Math.random() * Math.PI * 2);
  return { phi };
}

function stepCGLE(field: FieldState, neighbors: FieldState[], eps: number, drive: number, omega: number) {
  const next = new Array(N * N);
  for (let y = 0; y < N; y++) {
    for (let x = 0; x < N; x++) {
      const i = y * N + x;
      const phi = field.phi[i];
      const px = field.phi[y * N + ((x + 1) % N)];
      const nx = field.phi[y * N + ((x - 1 + N) % N)];
      const py = field.phi[((y + 1) % N) * N + x];
      const ny = field.phi[((y - 1 + N) % N) * N + x];
      const lap = Math.sin(px - phi) + Math.sin(nx - phi) + Math.sin(py - phi) + Math.sin(ny - phi);
      let coupling = 0;
      neighbors.forEach(nb => { coupling += Math.sin(nb.phi[i] - phi); });
      next[i] = phi + 0.04 * (omega + 0.6 * lap + eps * coupling + drive);
    }
  }
  field.phi = next;
}

function orderParam(field: FieldState): number {
  let sx = 0, sy = 0;
  field.phi.forEach(p => { sx += Math.cos(p); sy += Math.sin(p); });
  return Math.hypot(sx, sy) / field.phi.length;
}

export default function CLACoupledFieldsPage() {
  const cvRefW = useRef<HTMLCanvasElement>(null);
  const cvRefA = useRef<HTMLCanvasElement>(null);
  const cvRefH = useRef<HTMLCanvasElement>(null);
  const cvRefs = [cvRefW, cvRefA, cvRefH];
  const stateRef = useRef({
    fields: [newField(), newField(), newField()],
    mode: "coupled" as Mode,
    epsWA: 0.4, epsAH: 0.4, epsWH: 0.2,
    forcing: 80, omega: 1.0,
    R: [0, 0, 0], Rglobal: 0, Rhist: [] as number[],
    running: true, frame: 0, time: 0,
  });
  const [mode, setMode] = useState<Mode>("coupled");
  const [running, setRunning] = useState(true);
  const [epsWA, setEpsWA] = useState(40);
  const [epsAH, setEpsAH] = useState(40);
  const [epsWH, setEpsWH] = useState(20);
  const [forcing, setForcing] = useState(80);
  const [metrics, setMetrics] = useState({ rW: 0, rA: 0, rH: 0, rG: 0 });
  const [events, setEvents] = useState<LogEntry[]>([]);
  const histCanvasRef = useRef<HTMLCanvasElement>(null);

  function log(field: string, msg: string, col: string) {
    const now = new Date();
    const ts = [now.getHours(), now.getMinutes(), now.getSeconds()].map(n => String(n).padStart(2, "0")).join(":");
    setEvents(prev => [{ ts, field, msg, col }, ...prev].slice(0, 36));
  }

  useEffect(() => { stateRef.current.running = running; }, [running]);
  useEffect(() => { stateRef.current.epsWA = epsWA / 100; }, [epsWA]);
  useEffect(() => { stateRef.current.epsAH = epsAH / 100; }, [epsAH]);
  useEffect(() => { stateRef.current.epsWH = epsWH / 100; }, [epsWH]);
  useEffect(() => { stateRef.current.forcing = forcing; }, [forcing]);
  useEffect(() => {
    stateRef.current.mode = mode;
    const m = MODES.find(x => x.key === mode)!;
    log("MODE", `Switched to ${m.label.toUpperCase()} regime`, m.col);
  }, [mode]);

  function reset() {
    stateRef.current.fields = [newField(), newField(), newField()];
    stateRef.current.Rhist = [];
    log("SYS", "Lattice fields reseeded · Φ ~ U(0, 2π)", C.muted);
  }

  useEffect(() => {
    cvRefs.forEach(r => {
      const c = r.current; if (!c) return;
      c.width = c.offsetWidth; c.height = c.offsetHeight;
    });
    const hc = histCanvasRef.current; if (hc) { hc.width = hc.offsetWidth; hc.height = hc.offsetHeight; }
    log("SYS", "AETHER-CLA · three-domain coupled phase lattice initialised", C.water);

    let raf = 0;
    function frame() {
      const s = stateRef.current;
      if (!s.running) { raf = requestAnimationFrame(frame); return; }
      s.frame++; s.time += 0.016;

      let driveW = 0, driveA = 0, driveH = 0;
      if (s.mode === "planetary") {
        const f = (s.forcing / 100) * 0.6;
        const t = s.time * 0.7;
        driveW = f * Math.sin(t);
        driveA = f * Math.sin(t + 0.4);
        driveH = f * Math.sin(t + 0.8);
      }

      const useEps = s.mode === "solo" ? 0 : 1;
      stepCGLE(s.fields[0], s.mode === "solo" ? [] : [s.fields[1], s.fields[2]], useEps * 0.5 * (s.epsWA + s.epsWH), driveW, 0.9);
      stepCGLE(s.fields[1], s.mode === "solo" ? [] : [s.fields[0], s.fields[2]], useEps * 0.5 * (s.epsWA + s.epsAH), driveA, 1.0);
      stepCGLE(s.fields[2], s.mode === "solo" ? [] : [s.fields[0], s.fields[1]], useEps * 0.5 * (s.epsAH + s.epsWH), driveH, 1.1);

      s.R = [orderParam(s.fields[0]), orderParam(s.fields[1]), orderParam(s.fields[2])];
      s.Rglobal = (s.R[0] + s.R[1] + s.R[2]) / 3;
      s.Rhist.push(s.Rglobal);
      if (s.Rhist.length > 240) s.Rhist.shift();

      // Render lattices
      cvRefs.forEach((r, idx) => {
        const c = r.current; if (!c) return;
        const ctx = c.getContext("2d"); if (!ctx) return;
        const W = c.width, Hh = c.height;
        ctx.fillStyle = C.bg; ctx.fillRect(0, 0, W, Hh);
        const cellW = W / N, cellH = Hh / N;
        const baseCol = FIELDS[idx].col;
        for (let y = 0; y < N; y++) {
          for (let x = 0; x < N; x++) {
            const phi = s.fields[idx].phi[y * N + x];
            const a = (Math.cos(phi) + 1) / 2;
            ctx.fillStyle = `${baseCol}${Math.floor(a * 220 + 30).toString(16).padStart(2, "0")}`;
            ctx.fillRect(x * cellW, y * cellH, cellW + 1, cellH + 1);
          }
        }
        // Order parameter overlay
        ctx.fillStyle = "rgba(3,6,15,0.7)";
        ctx.fillRect(0, 0, 70, 22);
        ctx.fillStyle = C.white;
        ctx.font = "11px JetBrains Mono, monospace";
        ctx.fillText(`R=${s.R[idx].toFixed(3)}`, 6, 15);
      });

      // History plot
      if (hc) {
        const hctx = hc.getContext("2d"); if (hctx) {
          const W = hc.width, Hh = hc.height;
          hctx.fillStyle = C.bg; hctx.fillRect(0, 0, W, Hh);
          hctx.strokeStyle = "rgba(120,180,255,0.06)"; hctx.lineWidth = 1;
          for (let y = 0; y <= 4; y++) {
            const yy = (y / 4) * Hh;
            hctx.beginPath(); hctx.moveTo(0, yy); hctx.lineTo(W, yy); hctx.stroke();
          }
          [0, 1, 2].forEach(idx => {
            hctx.strokeStyle = FIELDS[idx].col;
            hctx.globalAlpha = 0.55; hctx.lineWidth = 1.2;
            hctx.beginPath();
            // approximate per-field history not stored; use planar offsets
            for (let i = 0; i < s.Rhist.length; i++) {
              const x = (i / Math.max(1, s.Rhist.length - 1)) * W;
              const y = Hh - (s.Rhist[i] * 0.96 + idx * 0.02) * Hh;
              if (i === 0) hctx.moveTo(x, y); else hctx.lineTo(x, y);
            }
            hctx.stroke();
          });
          hctx.globalAlpha = 1;
          hctx.strokeStyle = C.planet; hctx.lineWidth = 1.6;
          hctx.beginPath();
          for (let i = 0; i < s.Rhist.length; i++) {
            const x = (i / Math.max(1, s.Rhist.length - 1)) * W;
            const y = Hh - s.Rhist[i] * Hh;
            if (i === 0) hctx.moveTo(x, y); else hctx.lineTo(x, y);
          }
          hctx.stroke();
        }
      }

      if (s.frame % 8 === 0) {
        setMetrics({
          rW: Math.round(s.R[0] * 1000) / 1000,
          rA: Math.round(s.R[1] * 1000) / 1000,
          rH: Math.round(s.R[2] * 1000) / 1000,
          rG: Math.round(s.Rglobal * 1000) / 1000,
        });
      }
      if (s.frame % 240 === 0) {
        log("R(t)", `R_global=${s.Rglobal.toFixed(3)} · regime=${s.mode}`, C.planet);
      }

      raf = requestAnimationFrame(frame);
    }
    raf = requestAnimationFrame(frame);
    return () => cancelAnimationFrame(raf);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const mInfo = MODES.find(m => m.key === mode)!;

  return (
    <div className="min-h-screen p-6 md:p-10 font-mono text-sm" style={{ background: C.bg, color: C.text }} data-testid="page-cla-coupled-fields">
      <div className="max-w-7xl mx-auto">
        <header className="mb-6">
          <div className="text-xs tracking-[0.4em] uppercase mb-2" style={{ color: C.water }}>
            AETHER-CLA · Coherent Phase Lattice Architecture
          </div>
          <h1 className="text-3xl md:text-5xl tracking-tight mb-2" style={{ fontFamily: "Cinzel, serif", color: C.white }}>
            Coupled Fields
          </h1>
          <div className="text-sm" style={{ color: C.muted }}>
            Three CGLE lattices · water · animal · human · cross-coupled by ε &amp; periodically forced by planetary resonance F(t)
          </div>
        </header>

        <div className="flex flex-wrap gap-2 mb-4" data-testid="mode-tabs">
          {MODES.map(m => (
            <button
              key={m.key}
              onClick={() => setMode(m.key)}
              data-testid={`mode-${m.key}`}
              className="px-3 py-2 text-xs tracking-[0.18em] uppercase border transition-colors"
              style={{
                borderColor: mode === m.key ? m.col : C.border,
                color: mode === m.key ? m.col : C.text,
                background: mode === m.key ? `${m.col}14` : "transparent",
              }}
            >
              <span style={{ color: mode === m.key ? m.col : C.dim, marginRight: 8 }}>{m.n}</span>
              {m.label}
            </button>
          ))}
          <button
            onClick={reset}
            data-testid="btn-reseed"
            className="px-3 py-2 text-xs tracking-[0.18em] uppercase border ml-auto"
            style={{ borderColor: C.border2, color: C.text }}
          >Reseed Φ</button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-4">
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {FIELDS.map((f, idx) => (
                <div key={f.key} className="border" style={{ borderColor: C.border, background: C.panel }} data-testid={`lattice-${f.key}`}>
                  <div className="px-3 py-2 border-b flex items-center justify-between" style={{ borderColor: C.border }}>
                    <div className="flex items-center gap-2">
                      <span style={{ color: f.col, fontSize: 14 }}>{f.glyph}</span>
                      <span className="text-xs uppercase tracking-[0.2em]" style={{ color: f.col }}>{f.label}</span>
                    </div>
                    <span className="text-[10px]" style={{ color: C.dim }}>N={N}×{N}</span>
                  </div>
                  <canvas ref={cvRefs[idx]} className="w-full block" style={{ height: 200 }} />
                </div>
              ))}
            </div>

            <div className="border" style={{ borderColor: C.border, background: C.panel }}>
              <div className="px-4 py-2 border-b flex justify-between items-center" style={{ borderColor: C.border }}>
                <span className="text-xs tracking-[0.2em] uppercase" style={{ color: C.muted }}>R(t) · Order Parameter History</span>
                <button
                  onClick={() => setRunning(r => !r)}
                  data-testid="btn-toggle-run"
                  className="px-2 py-1 text-[11px] uppercase border"
                  style={{ borderColor: C.border2, color: running ? C.water : C.muted }}
                >{running ? "Pause" : "Run"}</button>
              </div>
              <canvas ref={histCanvasRef} className="w-full block" style={{ height: 160 }} data-testid="canvas-rhist" />
              <div className="border-t p-4 grid grid-cols-2 md:grid-cols-4 gap-3 text-xs" style={{ borderColor: C.border }}>
                <label>
                  <div className="flex justify-between mb-1"><span style={{ color: C.muted }}>ε_WA</span><span style={{ color: C.water }}>{(epsWA / 100).toFixed(2)}</span></div>
                  <input type="range" min={0} max={100} value={epsWA} onChange={e => setEpsWA(Number(e.target.value))} className="w-full" data-testid="slider-eps-wa" />
                </label>
                <label>
                  <div className="flex justify-between mb-1"><span style={{ color: C.muted }}>ε_AH</span><span style={{ color: C.animal }}>{(epsAH / 100).toFixed(2)}</span></div>
                  <input type="range" min={0} max={100} value={epsAH} onChange={e => setEpsAH(Number(e.target.value))} className="w-full" data-testid="slider-eps-ah" />
                </label>
                <label>
                  <div className="flex justify-between mb-1"><span style={{ color: C.muted }}>ε_WH</span><span style={{ color: C.human }}>{(epsWH / 100).toFixed(2)}</span></div>
                  <input type="range" min={0} max={100} value={epsWH} onChange={e => setEpsWH(Number(e.target.value))} className="w-full" data-testid="slider-eps-wh" />
                </label>
                <label>
                  <div className="flex justify-between mb-1"><span style={{ color: C.muted }}>F(t)</span><span style={{ color: C.planet }}>{forcing}%</span></div>
                  <input type="range" min={0} max={100} value={forcing} onChange={e => setForcing(Number(e.target.value))} className="w-full" data-testid="slider-forcing" disabled={mode !== "planetary"} />
                </label>
              </div>
            </div>
          </div>

          <aside className="space-y-4">
            <div className="border p-4" style={{ borderColor: C.border, background: C.panel }} data-testid="metrics-panel">
              <div className="text-xs tracking-[0.2em] uppercase mb-3" style={{ color: C.muted }}>Order Parameters</div>
              {[
                { l: "R_water",  v: metrics.rW, col: C.water },
                { l: "R_animal", v: metrics.rA, col: C.animal },
                { l: "R_human",  v: metrics.rH, col: C.human },
                { l: "R_global", v: metrics.rG, col: C.planet },
              ].map(m => (
                <div key={m.l} className="py-1">
                  <div className="flex justify-between text-xs">
                    <span style={{ color: C.muted }}>{m.l}</span>
                    <span style={{ color: m.col }} data-testid={`metric-${m.l}`}>{m.v.toFixed(3)}</span>
                  </div>
                  <div className="h-1 mt-1" style={{ background: "rgba(120,180,255,0.06)" }}>
                    <div style={{ width: `${m.v * 100}%`, height: "100%", background: m.col }} />
                  </div>
                </div>
              ))}
            </div>

            <div className="border p-4" style={{ borderColor: C.border, background: C.panel }}>
              <div className="text-xs tracking-[0.2em] uppercase mb-3" style={{ color: C.muted }}>Regime</div>
              <div className="text-xs leading-relaxed" style={{ color: C.text }}>{mInfo.desc}</div>
            </div>

            <div className="border" style={{ borderColor: C.border, background: C.panel }}>
              <div className="px-4 py-2 border-b text-xs tracking-[0.2em] uppercase" style={{ borderColor: C.border, color: C.muted }}>Event Log</div>
              <div className="max-h-72 overflow-y-auto p-3 space-y-1 text-[11px]" data-testid="log-panel">
                <AnimatePresence initial={false}>
                  {events.map((e, i) => (
                    <motion.div
                      key={`${e.ts}-${i}`}
                      initial={{ opacity: 0, x: -6 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }}
                      className="flex gap-2"
                    >
                      <span style={{ color: C.dim }}>{e.ts}</span>
                      <span style={{ color: e.col, width: 60 }} className="uppercase">{e.field}</span>
                      <span style={{ color: C.text }}>{e.msg}</span>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            </div>
          </aside>
        </div>

        <div className="mt-8 text-xs text-center tracking-[0.6em] uppercase" style={{ color: C.dim }}>
          ε_WA · ε_AH · ε_WH · F(t)
        </div>
      </div>
    </div>
  );
}
