import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

const C = {
  bg: "#04040a", panel: "rgba(12,13,26,0.86)",
  border: "rgba(200,160,48,0.14)", border2: "rgba(200,160,48,0.32)",
  white: "#DCD8F0", text: "#A89CC8", muted: "#5A5878", dim: "#2A2838",
  phi: "#C8A030", phi2: "#F0D878",
  cyan: "#30C8C0", violet: "#8840D8", rose: "#D83068", sage: "#48B870", ice: "#50A8E0",
};

const PHI = (1 + Math.sqrt(5)) / 2;
const GA = 2 * Math.PI / (PHI * PHI);

type Geom = "phi" | "square" | "hex" | "random";
type Mode = "coherent" | "decoherent";

interface Atom { x: number; y: number; r: number; lit: boolean; pop0: number; pop1: number; coh: number; entWith: number; phase: number; }
interface LogEntry { ts: string; tag: string; msg: string; col: string; }

export default function PhiHOTPage() {
  const cvRef = useRef<HTMLCanvasElement>(null);
  const stRef = useRef({
    rings: 5, r0: 38, laser: 0.7, gamma: 0.012,
    geom: "phi" as Geom, mode: "coherent" as Mode,
    atoms: [] as Atom[],
    running: true, frame: 0,
    entCount: 0, t2: 0, fid: 0,
  });
  const [rings, setRings] = useState(5);
  const [r0, setR0] = useState(38);
  const [laser, setLaser] = useState(0.7);
  const [gamma, setGamma] = useState(0.012);
  const [geom, setGeom] = useState<Geom>("phi");
  const [mode, setMode] = useState<Mode>("coherent");
  const [running, setRunning] = useState(true);
  const [pop, setPop] = useState({ p0: 0.5, p1: 0.5, coh: 0.8, ent: 0 });
  const [metrics, setMetrics] = useState({ atoms: 0, total: 0, cxt: 0, ent: 0, t2: 0, fid: 0 });
  const [events, setEvents] = useState<LogEntry[]>([]);
  const initRef = useRef(false);

  function pushLog(tag: string, msg: string, col: string) {
    const now = new Date();
    const ts = [now.getHours(), now.getMinutes(), now.getSeconds()].map(n => String(n).padStart(2, "0")).join(":");
    setEvents(prev => [{ ts, tag, msg, col }, ...prev].slice(0, 36));
  }

  function rebuild() {
    const c = cvRef.current; if (!c) return;
    const W = c.offsetWidth, H = c.offsetHeight;
    const cx = W / 2, cy = H / 2;
    const atoms: Atom[] = [];
    const s = stRef.current;
    if (s.geom === "phi") {
      const total = s.rings * 13;
      for (let i = 0; i < total; i++) {
        const r = s.r0 + Math.sqrt(i) * 18;
        const a = i * GA;
        atoms.push({ x: cx + r * Math.cos(a), y: cy + r * Math.sin(a), r: 4, lit: i % 3 !== 0, pop0: 0.5, pop1: 0.5, coh: 0.8, entWith: -1, phase: Math.random() * Math.PI * 2 });
      }
    } else if (s.geom === "square") {
      const n = s.rings * 2 + 1;
      const step = s.r0;
      for (let i = -n; i <= n; i++) {
        for (let j = -n; j <= n; j++) {
          if (Math.abs(i) + Math.abs(j) > n + 2) continue;
          atoms.push({ x: cx + i * step, y: cy + j * step, r: 4, lit: (i + j) % 2 === 0, pop0: 0.5, pop1: 0.5, coh: 0.8, entWith: -1, phase: Math.random() * Math.PI * 2 });
        }
      }
    } else if (s.geom === "hex") {
      const n = s.rings;
      for (let q = -n; q <= n; q++) {
        for (let r = Math.max(-n, -q - n); r <= Math.min(n, -q + n); r++) {
          const x = s.r0 * (3 / 2 * q);
          const y = s.r0 * (Math.sqrt(3) * (r + q / 2));
          atoms.push({ x: cx + x, y: cy + y, r: 4, lit: true, pop0: 0.5, pop1: 0.5, coh: 0.8, entWith: -1, phase: Math.random() * Math.PI * 2 });
        }
      }
    } else {
      const total = s.rings * 13;
      for (let i = 0; i < total; i++) {
        const r = s.r0 + Math.random() * s.r0 * (s.rings - 1);
        const a = Math.random() * Math.PI * 2;
        atoms.push({ x: cx + r * Math.cos(a), y: cy + r * Math.sin(a), r: 4, lit: Math.random() > 0.3, pop0: 0.5, pop1: 0.5, coh: 0.8, entWith: -1, phase: Math.random() * Math.PI * 2 });
      }
    }
    s.atoms = atoms;
  }

  useEffect(() => { stRef.current.rings = rings; rebuild(); }, [rings]);
  useEffect(() => { stRef.current.r0 = r0; rebuild(); }, [r0]);
  useEffect(() => { stRef.current.laser = laser; }, [laser]);
  useEffect(() => { stRef.current.gamma = gamma; }, [gamma]);
  useEffect(() => { stRef.current.geom = geom; rebuild(); pushLog("GEOM", `Trap geometry → ${geom.toUpperCase()}`, C.cyan); }, [geom]);
  useEffect(() => { stRef.current.mode = mode; pushLog("MODE", `Quantum mode → ${mode.toUpperCase()}`, mode === "coherent" ? C.sage : C.rose); }, [mode]);
  useEffect(() => { stRef.current.running = running; }, [running]);

  useEffect(() => {
    if (!initRef.current) {
      initRef.current = true;
      pushLog("SYS", "φ-HOT array online · holographic SLM trap field stable", C.phi);
    }
    const c = cvRef.current; if (!c) return;
    const ctx = c.getContext("2d"); if (!ctx) return;
    c.width = c.offsetWidth; c.height = c.offsetHeight;
    rebuild();

    let raf = 0;
    function frame() {
      const s = stRef.current;
      if (!s.running) { raf = requestAnimationFrame(frame); return; }
      s.frame++;

      const W = c.width, H = c.height;
      ctx.fillStyle = C.bg; ctx.fillRect(0, 0, W, H);

      // Background spiral guide
      ctx.strokeStyle = "rgba(200,160,48,0.04)"; ctx.lineWidth = 1;
      ctx.beginPath();
      const cx = W / 2, cy = H / 2;
      for (let i = 0; i < 200; i++) {
        const r = 12 + Math.sqrt(i) * 16;
        const a = i * GA;
        const x = cx + r * Math.cos(a), y = cy + r * Math.sin(a);
        i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
      }
      ctx.stroke();

      let trapped = 0, entPairs = 0;
      const decay = s.mode === "coherent" ? s.gamma : s.gamma * 5;

      // Update atoms
      for (let i = 0; i < s.atoms.length; i++) {
        const a = s.atoms[i];
        if (!a.lit) continue;
        trapped++;
        a.phase += 0.03;
        // Coherence decay
        a.coh = Math.max(0, a.coh - decay);
        if (a.coh < 0.1 && Math.random() < 0.005) a.coh = 0.6 + Math.random() * 0.3;
        if (a.entWith >= 0) entPairs++;
      }

      // Draw entanglement bonds
      ctx.lineWidth = 0.8;
      for (let i = 0; i < s.atoms.length; i++) {
        const a = s.atoms[i];
        if (a.entWith < 0 || a.entWith <= i) continue;
        const b = s.atoms[a.entWith];
        ctx.strokeStyle = `rgba(80,168,224,${0.25 + 0.4 * Math.sin(s.frame * 0.04 + i)})`;
        ctx.beginPath();
        ctx.moveTo(a.x, a.y);
        ctx.lineTo(b.x, b.y);
        ctx.stroke();
      }

      // Draw atoms
      for (let i = 0; i < s.atoms.length; i++) {
        const a = s.atoms[i];
        if (!a.lit) {
          ctx.fillStyle = "rgba(120,120,160,0.15)";
          ctx.beginPath(); ctx.arc(a.x, a.y, 1.5, 0, Math.PI * 2); ctx.fill();
          continue;
        }
        const pulse = 1 + 0.3 * Math.sin(s.frame * 0.05 + a.phase);
        const halo = a.r * 3 * pulse * s.laser;
        const grad = ctx.createRadialGradient(a.x, a.y, 0, a.x, a.y, halo);
        const baseCol = a.entWith >= 0 ? C.ice : (s.mode === "coherent" ? C.phi2 : C.rose);
        grad.addColorStop(0, baseCol);
        grad.addColorStop(0.3, baseCol + "88");
        grad.addColorStop(1, baseCol + "00");
        ctx.fillStyle = grad;
        ctx.beginPath(); ctx.arc(a.x, a.y, halo, 0, Math.PI * 2); ctx.fill();

        ctx.fillStyle = baseCol;
        ctx.beginPath(); ctx.arc(a.x, a.y, a.r * pulse, 0, Math.PI * 2); ctx.fill();
      }

      // φ label center
      ctx.fillStyle = "rgba(200,160,48,0.15)";
      ctx.font = "12px 'Cinzel', serif";
      ctx.textAlign = "center";
      ctx.fillText("φ = 1.6180339...", cx, cy + 5);
      ctx.textAlign = "start";

      if (s.frame % 12 === 0) {
        const total = s.atoms.length;
        const cxt = trapped > 0 ? (s.atoms.filter(a => a.lit).reduce((a, b) => a + b.coh, 0) / Math.max(1, trapped)) : 0;
        const t2 = Math.round((1 / Math.max(0.001, decay)) / 80);
        const fid = Math.round(85 + cxt * 13);
        s.entCount = entPairs;
        s.t2 = t2;
        s.fid = fid;
        setMetrics({ atoms: trapped, total, cxt: Math.round(cxt * 1000) / 1000, ent: entPairs, t2, fid });
        const p1 = 0.5 + 0.3 * Math.sin(s.frame * 0.03);
        const coh = cxt;
        const entN = entPairs > 0 ? Math.min(1, entPairs / 10) : 0;
        setPop({ p0: 1 - p1, p1, coh, ent: entN });
      }

      raf = requestAnimationFrame(frame);
    }
    raf = requestAnimationFrame(frame);
    return () => cancelAnimationFrame(raf);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function gateH() {
    const s = stRef.current;
    s.atoms.forEach(a => { if (a.lit) { a.pop0 = a.pop1 = 0.5; a.coh = Math.min(1, a.coh + 0.3); } });
    pushLog("GATE", "Hadamard pulse · superposition restored", C.cyan);
  }
  function gateCZ() {
    const s = stRef.current;
    const lit = s.atoms.map((a, i) => ({ a, i })).filter(x => x.a.lit);
    let pairs = 0;
    for (let k = 0; k < lit.length; k += 2) {
      if (k + 1 < lit.length && Math.random() < 0.7) {
        lit[k].a.entWith = lit[k + 1].i;
        lit[k + 1].a.entWith = lit[k].i;
        pairs++;
      }
    }
    pushLog("GATE", `CZ entangle · ${pairs} pairs locked`, C.ice);
  }
  function gateReset() {
    const s = stRef.current;
    s.atoms.forEach(a => { a.coh = 0.85; a.entWith = -1; a.pop0 = 1; a.pop1 = 0; });
    pushLog("GATE", "Array reset · |0⟩ ground state", C.sage);
  }

  return (
    <div className="min-h-screen flex flex-col" style={{ background: C.bg, color: C.text }} data-testid="page-phi-hot">
      <header className="px-8 pt-8 pb-4 border-b" style={{ borderColor: C.border }}>
        <div className="text-[11px] tracking-[0.45em] uppercase" style={{ color: C.muted }}>
          AETHER · φ-HOT · HOLOGRAPHIC OPTICAL TWEEZER ARRAY · MARCH 2026
        </div>
        <h1 className="font-serif text-4xl mt-2 tracking-wide" style={{ color: C.phi, fontFamily: "Cinzel, serif" }}>
          φ-HOT · Holographic Tweezer
        </h1>
        <div className="mt-1 text-sm" style={{ color: C.text }}>
          Single-laser, thousands of atoms · Fibonacci-spiral qubit array · the geometry IS the processor
        </div>
      </header>

      <section className="px-8 pt-6">
        <div className="flex gap-2 flex-wrap items-center" data-testid="gate-bar">
          <button onClick={() => { setRunning(r => !r); pushLog("CTRL", running ? "Array paused" : "Array running", C.muted); }}
            data-testid="btn-toggle-run"
            className="px-3 py-1 text-[10px] tracking-[0.2em] uppercase border"
            style={{ borderColor: C.border2, color: C.text }}>{running ? "Pause" : "Run"}</button>
          <button onClick={gateH} data-testid="btn-gate-h"
            className="px-3 py-1 text-[10px] tracking-[0.2em] uppercase border"
            style={{ borderColor: C.cyan, color: C.cyan }}>H Gate</button>
          <button onClick={gateCZ} data-testid="btn-gate-cz"
            className="px-3 py-1 text-[10px] tracking-[0.2em] uppercase border"
            style={{ borderColor: C.ice, color: C.ice }}>CZ Entangle</button>
          <button onClick={gateReset} data-testid="btn-gate-reset"
            className="px-3 py-1 text-[10px] tracking-[0.2em] uppercase border"
            style={{ borderColor: C.sage, color: C.sage }}>Reset</button>
          <button onClick={() => setMode(m => m === "coherent" ? "decoherent" : "coherent")} data-testid="btn-mode"
            className="px-3 py-1 text-[10px] tracking-[0.2em] uppercase border"
            style={{ borderColor: C.phi, color: C.phi }}>Mode · {mode.toUpperCase()}</button>
        </div>
      </section>

      <section className="flex-1 px-8 pt-6 pb-8 grid gap-6" style={{ gridTemplateColumns: "minmax(0, 1fr) 320px" }}>
        <div className="space-y-4 min-w-0">
          <div className="border" style={{ borderColor: C.border, background: C.panel }}>
            <div className="px-4 py-2 border-b text-xs tracking-[0.2em] uppercase" style={{ borderColor: C.border, color: C.phi }}>
              ◉ {geom.toUpperCase()} · {metrics.atoms} / {metrics.total} sites trapped · C(x,t) = {metrics.cxt}
            </div>
            <div className="aspect-[16/10] relative">
              <canvas ref={cvRef} className="absolute inset-0 w-full h-full" data-testid="canvas-phihot"
                role="img" aria-label="Holographic optical tweezer φ-spiral array" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="border p-4" style={{ borderColor: C.border, background: C.panel }} data-testid="ctrl-array">
              <div className="text-xs tracking-[0.2em] uppercase mb-3" style={{ color: C.muted }}>Array Configuration</div>
              <Slider id="rings" label="φ-Rings N" value={rings} min={3} max={8} step={1} fmt={v => v.toFixed(0)}
                onChange={v => setRings(v)} col={C.phi} />
              <Slider id="r0" label="Base radius" value={r0} min={20} max={80} step={1} fmt={v => `${v} px`}
                onChange={v => setR0(v)} col={C.phi2} />
              <Slider id="laser" label="Laser power" value={laser} min={0.01} max={1} step={0.01} fmt={v => v.toFixed(2)}
                onChange={v => setLaser(v)} col={C.cyan} />
              <Slider id="gamma" label="Decoherence Γ" value={gamma} min={0.001} max={0.08} step={0.001} fmt={v => v.toFixed(3)}
                onChange={v => setGamma(v)} col={C.rose} />
            </div>

            <div className="border p-4" style={{ borderColor: C.border, background: C.panel }} data-testid="ctrl-geom">
              <div className="text-xs tracking-[0.2em] uppercase mb-3" style={{ color: C.muted }}>Geometry · Trap Arrangement</div>
              <div className="grid grid-cols-2 gap-2 mb-3">
                {(["phi", "square", "hex", "random"] as Geom[]).map(g => (
                  <button key={g} onClick={() => setGeom(g)} data-testid={`geom-${g}`}
                    className="px-2 py-1.5 text-[10px] tracking-[0.15em] uppercase border"
                    style={{ borderColor: geom === g ? C.phi : C.border, color: geom === g ? C.phi : C.muted, background: geom === g ? C.phi + "12" : "transparent" }}>
                    {g === "phi" ? "φ-Spiral" : g}
                  </button>
                ))}
              </div>
              <div className="text-xs tracking-[0.2em] uppercase mb-2" style={{ color: C.muted }}>Ensemble Quantum State</div>
              {[
                { l: "|0⟩", v: pop.p0, col: C.cyan },
                { l: "|1⟩", v: pop.p1, col: C.violet },
                { l: "Coh", v: pop.coh, col: C.phi },
                { l: "Ent", v: pop.ent, col: C.ice },
              ].map(s => (
                <div key={s.l} className="flex items-center gap-2 my-1.5">
                  <span className="text-[10px] w-8" style={{ color: C.muted }}>{s.l}</span>
                  <div className="flex-1 h-1.5 rounded" style={{ background: C.dim }}>
                    <div className="h-full rounded transition-all" style={{ background: s.col, width: `${Math.round(s.v * 100)}%` }} />
                  </div>
                  <span className="text-[10px] w-10 text-right" style={{ color: s.col }}>{s.v.toFixed(2)}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="border p-5" style={{ borderColor: C.border, background: C.panel }}>
            <div className="text-xs tracking-[0.2em] uppercase mb-4" style={{ color: C.muted }}>AETHER 5-phase loop · φ-HOT mapping</div>
            <div className="grid grid-cols-5 gap-3">
              {[
                { sym: "Σ", l: "Sense",    d: "SLM hologram reads trap state" },
                { sym: "Λ", l: "Deliver",  d: "Tweezer beam addresses atom" },
                { sym: "α", l: "Activate", d: "Gate pulse · H, CZ, π-rotation" },
                { sym: "Φ", l: "Feedback", d: "Fluorescence → WGS update" },
                { sym: "Θ", l: "Learn",    d: "Hebbian φ-schedule adapts" },
              ].map((s, i) => (
                <div key={s.l} className="border p-3" style={{ borderColor: C.phi + "55", background: C.phi + "10" }}>
                  <div className="text-[10px] tracking-[0.18em] uppercase" style={{ color: C.muted }}>0{i + 1} · {s.sym}</div>
                  <div className="text-sm mt-1" style={{ color: C.phi }}>{s.l}</div>
                  <div className="text-[11px] mt-2" style={{ color: C.text }}>{s.d}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <aside className="space-y-4">
          <div className="border p-4" style={{ borderColor: C.border, background: C.panel }} data-testid="metrics-panel">
            <div className="text-xs tracking-[0.2em] uppercase mb-3" style={{ color: C.muted }}>Telemetry</div>
            {[
              { l: "φ-Rings",        v: rings.toString(),               col: C.phi },
              { l: "Trapped",        v: `${metrics.atoms}/${metrics.total}`, col: C.cyan },
              { l: "Entangled pairs", v: metrics.ent.toString(),        col: C.ice },
              { l: "T₂ coherence",   v: `${metrics.t2} ms`,             col: C.cyan },
              { l: "Gate fidelity",  v: `${metrics.fid}%`,              col: C.sage },
              { l: "C(x,t)",         v: metrics.cxt.toFixed(3),         col: C.phi },
            ].map(m => (
              <div key={m.l} className="flex justify-between py-1 text-xs">
                <span style={{ color: C.muted }}>{m.l}</span>
                <span style={{ color: m.col }} data-testid={`metric-${m.l}`}>{m.v}</span>
              </div>
            ))}
          </div>

          <div className="border p-4" style={{ borderColor: C.border, background: C.panel }}>
            <div className="text-xs tracking-[0.2em] uppercase mb-3" style={{ color: C.muted }}>Brief</div>
            <div className="text-xs leading-relaxed" style={{ color: C.text }}>
              A single laser is split through a spatial-light-modulator (SLM) hologram into thousands of micro-traps. Atoms cooled to micro-Kelvin fall into each trap and become a qubit. Arranging traps in a φ-spiral produces uniform nearest-neighbour spacing — the golden ratio is the only ratio that avoids resonant gaps.
            </div>
          </div>

          <div className="border" style={{ borderColor: C.border, background: C.panel }}>
            <div className="px-4 py-2 border-b text-xs tracking-[0.2em] uppercase" style={{ borderColor: C.border, color: C.muted }}>Event Log</div>
            <div className="max-h-60 overflow-y-auto p-3 space-y-1 text-[11px]" data-testid="log-panel">
              <AnimatePresence initial={false}>
                {events.map((e, i) => (
                  <motion.div key={`${e.ts}-${i}`}
                    initial={{ opacity: 0, x: -6 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }}
                    className="flex gap-2">
                    <span style={{ color: C.dim }}>{e.ts}</span>
                    <span style={{ color: e.col, width: 60 }} className="uppercase">{e.tag}</span>
                    <span style={{ color: C.text }}>{e.msg}</span>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </div>
        </aside>
      </section>

      <footer className="px-8 py-4 border-t text-[10px] tracking-[0.3em] uppercase" style={{ borderColor: C.border, color: C.dim }}>
        φ · Σ · Λ · α · Φ · Θ · one beam · thousands of qubits · golden-ratio packing · Hebbian learning
      </footer>
    </div>
  );
}

function Slider({ id, label, value, min, max, step, fmt, onChange, col }: {
  id: string; label: string; value: number; min: number; max: number; step: number;
  fmt: (v: number) => string; onChange: (v: number) => void; col: string;
}) {
  return (
    <div className="mb-3">
      <div className="flex justify-between text-[11px] mb-1">
        <span style={{ color: C.muted }}>{label}</span>
        <span style={{ color: col }}>{fmt(value)}</span>
      </div>
      <input type="range" min={min} max={max} step={step} value={value}
        onChange={e => onChange(parseFloat(e.target.value))}
        data-testid={`slider-${id}`}
        aria-label={label}
        className="w-full" />
    </div>
  );
}
