import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

const C = {
  bg: "#04070d", bg2: "#080d1a", panel: "rgba(8,13,26,0.86)",
  border: "rgba(232,168,32,0.14)", border2: "rgba(232,168,32,0.28)",
  white: "#F4ECD8", text: "#A89A7E", muted: "#776A52", dim: "#574E3E",
  ferro: "#E8A820", ferro2: "#B8860B", ferro3: "#FFD66B",
  field: "#4FC3F7", myc: "#5DBA6E", plasma: "#C77DFF", earth: "#7FA67F",
  rogue: "#E84040",
};

type Section = "propulsion" | "medicine" | "mycelium" | "earth" | "plasma";

const SECTIONS: { key: Section; n: string; label: string; col: string; tag: string; lead: string }[] = [
  { key: "propulsion", n: "01", label: "Propulsion",  col: C.ferro,  tag: "Ferrofluid Drive",
    lead: "Magnetorheological propulsion. Ferrofluid mass redistributes under shaped B-fields to generate frictionless thrust without moving mechanical parts." },
  { key: "medicine",   n: "02", label: "Medicine",    col: C.rogue,  tag: "DNA-Magnetic Therapy",
    lead: "Iron-oxide nanocarriers loaded with metabolite payloads. Magnetic guidance plus AC-induced hyperthermia selectively eliminates rogue cells while preserving healthy tissue." },
  { key: "mycelium",   n: "03", label: "Mycelium",    col: C.myc,    tag: "Living Circuits",
    lead: "Mycelial networks as adaptive substrate. Hyphae grow into wiring topologies that route signals, store memory, and self-repair. Computation as biology." },
  { key: "earth",      n: "04", label: "Earth-Grid",  col: C.earth,  tag: "Resonant Vehicle Mesh",
    lead: "Vehicles couple to the geomagnetic substrate. Roadway-embedded coils inductively pair with onboard ferrofluid mass for charge transfer and lateral guidance." },
  { key: "plasma",     n: "05", label: "Plasma",      col: C.plasma, tag: "Condensed Plasmoids",
    lead: "Self-organising plasma toroids as power-dense storage. Magnetic confinement + spin polarization yields stable kJ-scale plasmoids at ambient pressure." },
];

interface Drop { x: number; y: number; vx: number; vy: number; r: number; phase: number; }
interface FieldLine { x: number; y: number; vx: number; vy: number; life: number; }
interface Spike { angle: number; len: number; targetLen: number; }
interface LogEntry { ts: string; section: Section; msg: string; col: string; }

export default function FerroDrivePage() {
  const cvRef = useRef<HTMLCanvasElement>(null);
  const stateRef = useRef({
    drops: [] as Drop[], lines: [] as FieldLine[], spikes: [] as Spike[],
    section: "propulsion" as Section,
    bField: 60, viscosity: 30, fieldAngle: 0, swirl: 0, running: true, frame: 0, time: 0,
  });
  const [section, setSection] = useState<Section>("propulsion");
  const [running, setRunning] = useState(true);
  const [bField, setBField] = useState(60);
  const [viscosity, setViscosity] = useState(30);
  const [metrics, setMetrics] = useState({ thrust: 0, throughput: 0, efficiency: 92, coupling: 0 });
  const [events, setEvents] = useState<LogEntry[]>([]);

  function log(s: Section, msg: string, col: string) {
    const now = new Date();
    const ts = [now.getHours(), now.getMinutes(), now.getSeconds()].map(n => String(n).padStart(2, "0")).join(":");
    setEvents(prev => [{ ts, section: s, msg, col }, ...prev].slice(0, 36));
  }

  useEffect(() => { stateRef.current.running = running; }, [running]);
  useEffect(() => { stateRef.current.bField = bField; }, [bField]);
  useEffect(() => { stateRef.current.viscosity = viscosity; }, [viscosity]);
  useEffect(() => {
    stateRef.current.section = section;
    const sec = SECTIONS.find(s => s.key === section)!;
    log(section, `Module engaged · ${sec.tag}`, sec.col);
  }, [section]);

  function buildDrops(W: number, H: number) {
    const s = stateRef.current;
    s.drops = [];
    const cx = W * 0.5, cy = H * 0.55;
    for (let i = 0; i < 36; i++) {
      const a = (i / 36) * Math.PI * 2;
      s.drops.push({
        x: cx + Math.cos(a) * 30 + (Math.random() - 0.5) * 8,
        y: cy + Math.sin(a) * 30 + (Math.random() - 0.5) * 8,
        vx: 0, vy: 0,
        r: 4 + Math.random() * 3, phase: Math.random() * Math.PI * 2,
      });
    }
    s.spikes = [];
    for (let i = 0; i < 18; i++) {
      s.spikes.push({ angle: (i / 18) * Math.PI * 2, len: 0, targetLen: 0 });
    }
  }

  useEffect(() => {
    const c = cvRef.current; if (!c) return;
    const ctx = c.getContext("2d"); if (!ctx) return;
    c.width = c.offsetWidth; c.height = c.offsetHeight;
    buildDrops(c.width, c.height);
    log("propulsion", "FerroDrive stack online · ferrofluid mass loaded · field controllers nominal", C.ferro);

    let raf = 0;
    function frame() {
      const s = stateRef.current;
      if (!s.running) { raf = requestAnimationFrame(frame); return; }
      s.frame++; s.time += 0.016;
      const W = c!.width, H = c!.height;
      const cx = W * 0.5, cy = H * 0.55;

      // background
      const bg = ctx!.createRadialGradient(cx, cy, 30, cx, cy, Math.max(W, H) * 0.6);
      bg.addColorStop(0, "rgba(232,168,32,0.06)");
      bg.addColorStop(1, "rgba(4,7,13,0.0)");
      ctx!.fillStyle = C.bg; ctx!.fillRect(0, 0, W, H);
      ctx!.fillStyle = bg; ctx!.fillRect(0, 0, W, H);

      // grid
      ctx!.strokeStyle = "rgba(232,168,32,0.05)"; ctx!.lineWidth = 1;
      for (let x = 0; x < W; x += 40) { ctx!.beginPath(); ctx!.moveTo(x, 0); ctx!.lineTo(x, H); ctx!.stroke(); }
      for (let y = 0; y < H; y += 40) { ctx!.beginPath(); ctx!.moveTo(0, y); ctx!.lineTo(W, y); ctx!.stroke(); }

      const Bnorm = s.bField / 100;
      const muNorm = s.viscosity / 100;
      s.fieldAngle += 0.005 * (1 - muNorm);
      s.swirl = Bnorm * 1.4;

      // field lines
      if (s.frame % 3 === 0 && s.section !== "medicine") {
        for (let i = 0; i < 2; i++) {
          const a = Math.random() * Math.PI * 2;
          const r0 = 80 + Math.random() * 40;
          s.lines.push({
            x: cx + Math.cos(a) * r0, y: cy + Math.sin(a) * r0,
            vx: -Math.cos(a) * 0.6, vy: -Math.sin(a) * 0.6, life: 1,
          });
        }
      }
      ctx!.strokeStyle = C.field; ctx!.lineWidth = 1;
      s.lines.forEach(l => {
        l.x += l.vx; l.y += l.vy; l.life -= 0.012;
        const dx = cx - l.x, dy = cy - l.y;
        const d = Math.hypot(dx, dy) + 0.0001;
        l.vx += (dx / d) * 0.04 * Bnorm;
        l.vy += (dy / d) * 0.04 * Bnorm;
        ctx!.globalAlpha = Math.max(0, l.life) * 0.6;
        ctx!.beginPath(); ctx!.moveTo(l.x, l.y);
        ctx!.lineTo(l.x - l.vx * 4, l.y - l.vy * 4); ctx!.stroke();
      });
      ctx!.globalAlpha = 1;
      s.lines = s.lines.filter(l => l.life > 0);

      // spike pattern (Rosensweig instability)
      s.spikes.forEach((sp, i) => {
        sp.targetLen = 12 + Bnorm * 38 + Math.sin(s.time * 2 + i) * 4 * Bnorm;
        sp.len += (sp.targetLen - sp.len) * 0.06;
        const a = sp.angle + s.fieldAngle * 0.3;
        const ix = cx + Math.cos(a) * 28;
        const iy = cy + Math.sin(a) * 28;
        const ox = cx + Math.cos(a) * (28 + sp.len);
        const oy = cy + Math.sin(a) * (28 + sp.len);
        const grd = ctx!.createLinearGradient(ix, iy, ox, oy);
        grd.addColorStop(0, C.ferro);
        grd.addColorStop(1, "rgba(232,168,32,0.05)");
        ctx!.strokeStyle = grd; ctx!.lineWidth = 5;
        ctx!.lineCap = "round";
        ctx!.beginPath(); ctx!.moveTo(ix, iy); ctx!.lineTo(ox, oy); ctx!.stroke();
      });

      // central blob
      const blobR = 32 + Bnorm * 14;
      ctx!.fillStyle = C.ferro2;
      ctx!.beginPath(); ctx!.arc(cx, cy, blobR, 0, Math.PI * 2); ctx!.fill();
      ctx!.fillStyle = C.ferro;
      ctx!.beginPath(); ctx!.arc(cx - blobR * 0.2, cy - blobR * 0.2, blobR * 0.6, 0, Math.PI * 2); ctx!.fill();
      ctx!.fillStyle = C.ferro3;
      ctx!.beginPath(); ctx!.arc(cx - blobR * 0.4, cy - blobR * 0.4, blobR * 0.2, 0, Math.PI * 2); ctx!.fill();

      // satellite drops swirl
      s.drops.forEach((d, i) => {
        const dx = cx - d.x, dy = cy - d.y;
        const dist = Math.hypot(dx, dy) + 0.0001;
        const tang = { x: -dy / dist, y: dx / dist };
        d.vx += (dx / dist) * 0.04 * Bnorm + tang.x * 0.06 * s.swirl;
        d.vy += (dy / dist) * 0.04 * Bnorm + tang.y * 0.06 * s.swirl;
        d.vx *= 0.86 + muNorm * 0.05;
        d.vy *= 0.86 + muNorm * 0.05;
        d.x += d.vx; d.y += d.vy;
        ctx!.fillStyle = C.ferro;
        ctx!.globalAlpha = 0.85;
        ctx!.beginPath(); ctx!.arc(d.x, d.y, d.r * (0.7 + Bnorm * 0.4), 0, Math.PI * 2); ctx!.fill();
        ctx!.globalAlpha = 1;
      });

      // section-specific overlays
      if (s.section === "propulsion") {
        // thrust vector
        const thrustL = 60 + Bnorm * 80;
        ctx!.strokeStyle = C.ferro3; ctx!.lineWidth = 3;
        ctx!.beginPath(); ctx!.moveTo(cx, cy + blobR + 6); ctx!.lineTo(cx, cy + blobR + 6 + thrustL); ctx!.stroke();
        ctx!.beginPath();
        ctx!.moveTo(cx - 6, cy + blobR + thrustL); ctx!.lineTo(cx, cy + blobR + 12 + thrustL);
        ctx!.lineTo(cx + 6, cy + blobR + thrustL); ctx!.fillStyle = C.ferro3; ctx!.fill();
      }
      if (s.section === "medicine") {
        for (let i = 0; i < 8; i++) {
          const a = (s.time * 0.4 + i / 8 * Math.PI * 2);
          const rr = 90 + Math.sin(s.time + i) * 8;
          const x = cx + Math.cos(a) * rr;
          const y = cy + Math.sin(a) * rr;
          ctx!.fillStyle = C.rogue; ctx!.globalAlpha = 0.7;
          ctx!.beginPath(); ctx!.arc(x, y, 3, 0, Math.PI * 2); ctx!.fill();
        }
        ctx!.globalAlpha = 1;
      }
      if (s.section === "mycelium") {
        ctx!.strokeStyle = C.myc; ctx!.lineWidth = 1; ctx!.globalAlpha = 0.5;
        for (let i = 0; i < 24; i++) {
          const a = (i / 24) * Math.PI * 2;
          const r0 = blobR + 4;
          const r1 = blobR + 30 + Math.sin(s.time * 1.3 + i) * 6;
          ctx!.beginPath();
          ctx!.moveTo(cx + Math.cos(a) * r0, cy + Math.sin(a) * r0);
          ctx!.bezierCurveTo(
            cx + Math.cos(a + 0.2) * (r0 + 12), cy + Math.sin(a + 0.2) * (r0 + 12),
            cx + Math.cos(a - 0.2) * (r1 - 8),  cy + Math.sin(a - 0.2) * (r1 - 8),
            cx + Math.cos(a) * r1, cy + Math.sin(a) * r1,
          );
          ctx!.stroke();
        }
        ctx!.globalAlpha = 1;
      }
      if (s.section === "earth") {
        ctx!.strokeStyle = C.earth; ctx!.lineWidth = 1.5; ctx!.globalAlpha = 0.7;
        ctx!.beginPath(); ctx!.moveTo(20, H - 60); ctx!.lineTo(W - 20, H - 60); ctx!.stroke();
        for (let i = 0; i < 12; i++) {
          const x = 40 + i * ((W - 80) / 11);
          const pulse = (Math.sin(s.time * 2 + i * 0.5) + 1) / 2;
          ctx!.beginPath(); ctx!.arc(x, H - 60, 4 + pulse * 4, 0, Math.PI * 2);
          ctx!.fillStyle = C.earth; ctx!.globalAlpha = 0.4 + pulse * 0.5; ctx!.fill();
        }
        ctx!.globalAlpha = 1;
      }
      if (s.section === "plasma") {
        for (let i = 0; i < 20; i++) {
          const a = s.time * 0.6 + i * 0.32;
          const rr = 50 + (i % 4) * 14;
          ctx!.fillStyle = C.plasma; ctx!.globalAlpha = 0.5;
          ctx!.beginPath();
          ctx!.arc(cx + Math.cos(a) * rr, cy + Math.sin(a) * rr * 0.4, 2, 0, Math.PI * 2);
          ctx!.fill();
        }
        ctx!.globalAlpha = 1;
      }

      if (s.frame % 8 === 0) {
        const thrust = Math.round(Bnorm * (1 - muNorm * 0.4) * 1000);
        const throughput = Math.round(Bnorm * 480 + 60);
        const eff = Math.round(86 + Bnorm * (1 - muNorm * 0.3) * 12);
        const coupling = Math.round((1 - muNorm) * Bnorm * 100);
        setMetrics({ thrust, throughput, efficiency: eff, coupling });
      }
      if (s.frame % 200 === 0) {
        const sec = SECTIONS.find(x => x.key === s.section)!;
        log(s.section, `Telemetry · B=${s.bField}% · μ=${s.viscosity}% · ${sec.tag}`, sec.col);
      }

      raf = requestAnimationFrame(frame);
    }
    raf = requestAnimationFrame(frame);
    return () => cancelAnimationFrame(raf);
  }, []);

  const sec = SECTIONS.find(s => s.key === section)!;

  return (
    <div className="min-h-screen p-6 md:p-10 font-mono text-sm" style={{ background: C.bg, color: C.text }} data-testid="page-ferrodrive">
      <div className="max-w-7xl mx-auto">
        <header className="mb-6">
          <div className="text-xs tracking-[0.4em] uppercase mb-2" style={{ color: C.ferro }}>
            Civilizational OS · Bio-Magnetic Convergence
          </div>
          <h1 className="text-3xl md:text-5xl tracking-tight mb-2" style={{ fontFamily: "Cinzel, serif", color: C.white }}>
            FerroDrive
          </h1>
          <div className="text-sm" style={{ color: C.muted }}>
            Ferrofluid propulsion · mycelial circuits · DNA-magnetic medicine · Earth-vehicle resonant grid · condensed plasmoids
          </div>
        </header>

        <div className="flex flex-wrap gap-2 mb-4" data-testid="section-tabs">
          {SECTIONS.map(s => (
            <button
              key={s.key}
              onClick={() => setSection(s.key)}
              data-testid={`tab-${s.key}`}
              className="px-3 py-2 text-xs tracking-[0.18em] uppercase border transition-colors"
              style={{
                borderColor: section === s.key ? s.col : C.border,
                color: section === s.key ? s.col : C.text,
                background: section === s.key ? `${s.col}14` : "transparent",
              }}
            >
              <span style={{ color: section === s.key ? s.col : C.dim, marginRight: 8 }}>{s.n}</span>
              {s.label}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-4">
          <div className="border" style={{ borderColor: C.border, background: C.panel }}>
            <div className="border-b px-4 py-2 flex items-center justify-between" style={{ borderColor: C.border }}>
              <div className="flex items-center gap-2">
                <span style={{ color: sec.col }}>●</span>
                <span className="text-xs uppercase tracking-[0.2em]" style={{ color: C.text }}>{sec.tag}</span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setRunning(r => !r)}
                  data-testid="btn-toggle-run"
                  className="px-2 py-1 text-[11px] uppercase border"
                  style={{ borderColor: C.border2, color: running ? C.ferro : C.muted }}
                >{running ? "Pause" : "Run"}</button>
              </div>
            </div>
            <div className="relative" style={{ height: 460 }}>
              <canvas ref={cvRef} className="w-full h-full block" data-testid="canvas-ferro" />
            </div>
            <div className="border-t px-4 py-3 grid grid-cols-2 gap-4" style={{ borderColor: C.border }}>
              <label className="text-xs">
                <div className="flex justify-between mb-1">
                  <span style={{ color: C.muted }}>Applied B-field</span>
                  <span style={{ color: C.ferro }}>{bField}%</span>
                </div>
                <input
                  type="range" min={0} max={100} value={bField}
                  onChange={e => setBField(Number(e.target.value))}
                  data-testid="slider-bfield"
                  className="w-full"
                />
              </label>
              <label className="text-xs">
                <div className="flex justify-between mb-1">
                  <span style={{ color: C.muted }}>Carrier viscosity</span>
                  <span style={{ color: C.field }}>{viscosity}%</span>
                </div>
                <input
                  type="range" min={0} max={100} value={viscosity}
                  onChange={e => setViscosity(Number(e.target.value))}
                  data-testid="slider-viscosity"
                  className="w-full"
                />
              </label>
            </div>
          </div>

          <aside className="space-y-4">
            <div className="border p-4" style={{ borderColor: C.border, background: C.panel }} data-testid="metrics-panel">
              <div className="text-xs tracking-[0.2em] uppercase mb-3" style={{ color: C.muted }}>Telemetry</div>
              {[
                { l: "Thrust [N]",      v: metrics.thrust,     col: C.ferro },
                { l: "Throughput",      v: metrics.throughput, col: C.field },
                { l: "Efficiency [%]",  v: metrics.efficiency, col: C.myc },
                { l: "Coupling [%]",    v: metrics.coupling,   col: C.plasma },
              ].map(m => (
                <div key={m.l} className="flex justify-between py-1 text-xs">
                  <span style={{ color: C.muted }}>{m.l}</span>
                  <span style={{ color: m.col }} data-testid={`metric-${m.l}`}>{m.v}</span>
                </div>
              ))}
            </div>

            <div className="border p-4" style={{ borderColor: C.border, background: C.panel }}>
              <div className="text-xs tracking-[0.2em] uppercase mb-3" style={{ color: C.muted }}>Module</div>
              <div className="text-xs leading-relaxed" style={{ color: C.text }}>{sec.lead}</div>
            </div>

            <div className="border" style={{ borderColor: C.border, background: C.panel }}>
              <div className="px-4 py-2 border-b text-xs tracking-[0.2em] uppercase" style={{ borderColor: C.border, color: C.muted }}>
                Event Log
              </div>
              <div className="max-h-72 overflow-y-auto p-3 space-y-1 text-[11px]" data-testid="log-panel">
                <AnimatePresence initial={false}>
                  {events.map((e, i) => (
                    <motion.div
                      key={`${e.ts}-${i}`}
                      initial={{ opacity: 0, x: -6 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }}
                      className="flex gap-2"
                    >
                      <span style={{ color: C.dim }}>{e.ts}</span>
                      <span style={{ color: e.col, width: 70 }} className="uppercase">{e.section}</span>
                      <span style={{ color: C.text }}>{e.msg}</span>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            </div>
          </aside>
        </div>

        <div className="mt-8 text-xs text-center tracking-[0.6em] uppercase" style={{ color: C.dim }}>
          ⊕ Ferrum · Mycelium · Plasma · Resonance ⊕
        </div>
      </div>
    </div>
  );
}
