import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

const C = {
  bg: "#020608", bg2: "#04090d", panel: "rgba(4,9,13,0.86)",
  border: "rgba(0,245,200,0.14)", border2: "rgba(0,245,200,0.28)",
  white: "#E5FBF5", text: "#9BBFB5", muted: "#5F8378", dim: "#3F5C53",
  photon: "#00f5c8", proton: "#FFD66B", hybrid: "#C77DFF",
  site: "#4FC3F7", barrier: "#E84040", tunnel: "#FFD66B",
};

type Mode = "photonic" | "protonic" | "hybrid";

const MODES: { key: Mode; n: string; label: string; col: string; lead: string }[] = [
  { key: "photonic", n: "01", label: "Photonic",  col: C.photon,
    lead: "FMO-complex-inspired exciton transport. Coherent quantum walk across 7 chlorosome sites with environment-assisted dephasing. Energy hops as a delocalised wavepacket." },
  { key: "protonic", n: "02", label: "Protonic",  col: C.proton,
    lead: "Hydrogen-atom tunnelling through enzymatic barriers. Probability mass leaks through a forbidden region — quantum gating without a thermal step." },
  { key: "hybrid",   n: "03", label: "Hybrid",    col: C.hybrid,
    lead: "Photonic walk drives protonic tunnelling. Energy from coherent excitons opens proton gates · biomimetic two-stage quantum logic." },
];

const SITES = 7;

interface ExciState { amp: number[]; phase: number[]; }
interface ProtonPkt { x: number; e: number; alive: boolean; tunneled: boolean; }
interface LogEntry { ts: string; mode: string; msg: string; col: string; }

export default function BiomimeticQuantumPage() {
  const cvRef = useRef<HTMLCanvasElement>(null);
  const stateRef = useRef({
    exci: { amp: new Array(SITES).fill(0), phase: new Array(SITES).fill(0) } as ExciState,
    protons: [] as ProtonPkt[],
    mode: "photonic" as Mode,
    coupling: 50, deph: 25, barrier: 50,
    running: true, frame: 0, time: 0,
    fidelity: 1, walkDist: 0, tunnelCount: 0, totalProtons: 0,
  });
  const [mode, setMode] = useState<Mode>("photonic");
  const [running, setRunning] = useState(true);
  const [coupling, setCoupling] = useState(50);
  const [deph, setDeph] = useState(25);
  const [barrier, setBarrier] = useState(50);
  const [metrics, setMetrics] = useState({ T1: 320, T2: 180, fidelity: 100, tunnel: 0, walk: 0 });
  const [events, setEvents] = useState<LogEntry[]>([]);

  function log(m: string, msg: string, col: string) {
    const now = new Date();
    const ts = [now.getHours(), now.getMinutes(), now.getSeconds()].map(n => String(n).padStart(2, "0")).join(":");
    setEvents(prev => [{ ts, mode: m, msg, col }, ...prev].slice(0, 36));
  }

  useEffect(() => { stateRef.current.running = running; }, [running]);
  useEffect(() => { stateRef.current.coupling = coupling; }, [coupling]);
  useEffect(() => { stateRef.current.deph = deph; }, [deph]);
  useEffect(() => { stateRef.current.barrier = barrier; }, [barrier]);
  useEffect(() => {
    stateRef.current.mode = mode;
    const m = MODES.find(x => x.key === mode)!;
    log("MODE", `Engaged ${m.label.toUpperCase()} substrate`, m.col);
    // reset state on mode swap
    stateRef.current.exci.amp = new Array(SITES).fill(0);
    stateRef.current.exci.phase = new Array(SITES).fill(0);
    stateRef.current.exci.amp[0] = 1;
    stateRef.current.protons = [];
    stateRef.current.tunnelCount = 0;
    stateRef.current.totalProtons = 0;
  }, [mode]);

  useEffect(() => {
    const c = cvRef.current; if (!c) return;
    const ctx = c.getContext("2d"); if (!ctx) return;
    c.width = c.offsetWidth; c.height = c.offsetHeight;

    stateRef.current.exci.amp[0] = 1;
    log("SYS", "Biomimetic QC stack online · FMO-7 lattice + H-tunnel barrier loaded", C.photon);

    let raf = 0;
    function frame() {
      const s = stateRef.current;
      if (!s.running) { raf = requestAnimationFrame(frame); return; }
      s.frame++; s.time += 0.016;
      const W = c!.width, Hh = c!.height;

      // background
      ctx!.fillStyle = C.bg; ctx!.fillRect(0, 0, W, Hh);
      const bgg = ctx!.createRadialGradient(W * 0.5, Hh * 0.5, 30, W * 0.5, Hh * 0.5, Math.max(W, Hh) * 0.6);
      const accent = MODES.find(m => m.key === s.mode)!.col;
      bgg.addColorStop(0, `${accent}10`);
      bgg.addColorStop(1, "rgba(2,6,8,0)");
      ctx!.fillStyle = bgg; ctx!.fillRect(0, 0, W, Hh);

      // grid
      ctx!.strokeStyle = "rgba(0,245,200,0.05)"; ctx!.lineWidth = 1;
      for (let x = 0; x < W; x += 40) { ctx!.beginPath(); ctx!.moveTo(x, 0); ctx!.lineTo(x, Hh); ctx!.stroke(); }
      for (let y = 0; y < Hh; y += 40) { ctx!.beginPath(); ctx!.moveTo(0, y); ctx!.lineTo(W, y); ctx!.stroke(); }

      // Photonic FMO walk (top half)
      const padX = 60;
      const yPhot = Hh * 0.32;
      const cellW = (W - padX * 2) / (SITES - 1);

      // step amplitudes (simple discrete-time quantum walk with dephasing)
      if (s.mode === "photonic" || s.mode === "hybrid") {
        const J = (s.coupling / 100) * 0.18;
        const g = (s.deph / 100) * 0.04;
        const newAmp = [...s.exci.amp];
        const newPh = [...s.exci.phase];
        for (let i = 0; i < SITES; i++) {
          const left = i > 0 ? s.exci.amp[i - 1] : 0;
          const right = i < SITES - 1 ? s.exci.amp[i + 1] : 0;
          newAmp[i] = s.exci.amp[i] * (1 - g) + J * (left + right - 2 * s.exci.amp[i]) * 0.4;
          newPh[i] = s.exci.phase[i] + 0.06 + g * (Math.random() - 0.5);
        }
        // renormalise
        let sum = 0; newAmp.forEach(a => sum += a * a);
        if (sum > 0) {
          const k = 1 / Math.sqrt(sum);
          for (let i = 0; i < SITES; i++) newAmp[i] *= k;
        }
        s.exci.amp = newAmp; s.exci.phase = newPh;

        // walk distance estimator
        let wsum = 0;
        s.exci.amp.forEach((a, i) => { wsum += i * a * a; });
        s.walkDist = wsum;
      }

      // Draw FMO chain
      for (let i = 0; i < SITES; i++) {
        const x = padX + i * cellW;
        ctx!.strokeStyle = "rgba(155,191,181,0.2)"; ctx!.lineWidth = 1;
        if (i < SITES - 1) {
          ctx!.beginPath(); ctx!.moveTo(x, yPhot); ctx!.lineTo(padX + (i + 1) * cellW, yPhot); ctx!.stroke();
        }
      }
      for (let i = 0; i < SITES; i++) {
        const x = padX + i * cellW;
        const a = s.exci.amp[i];
        const r = 8 + a * a * 26;
        const ph = s.exci.phase[i];
        ctx!.fillStyle = `${C.site}${Math.floor(60 + a * a * 180).toString(16).padStart(2, "0")}`;
        ctx!.beginPath(); ctx!.arc(x, yPhot, r, 0, Math.PI * 2); ctx!.fill();
        ctx!.strokeStyle = C.photon; ctx!.lineWidth = 1.2;
        ctx!.beginPath(); ctx!.arc(x, yPhot, r + 1, ph, ph + a * a * Math.PI * 2); ctx!.stroke();
        ctx!.fillStyle = C.muted; ctx!.font = "10px JetBrains Mono, monospace";
        ctx!.fillText(`|${i + 1}⟩`, x - 9, yPhot + r + 14);
      }
      ctx!.fillStyle = C.text; ctx!.font = "11px JetBrains Mono, monospace";
      ctx!.fillText("FMO-7 · exciton wavepacket", padX, yPhot - 40);

      // Protonic tunnelling (bottom half)
      const yProt = Hh * 0.72;
      const barX = W * 0.5;
      const barW = 50;
      const barH = 80 + (s.barrier / 100) * 60;

      // ground line
      ctx!.strokeStyle = "rgba(155,191,181,0.25)"; ctx!.lineWidth = 1;
      ctx!.beginPath(); ctx!.moveTo(20, yProt); ctx!.lineTo(W - 20, yProt); ctx!.stroke();

      // barrier
      ctx!.fillStyle = `${C.barrier}33`;
      ctx!.fillRect(barX - barW / 2, yProt - barH, barW, barH);
      ctx!.strokeStyle = C.barrier; ctx!.lineWidth = 1.5;
      ctx!.strokeRect(barX - barW / 2, yProt - barH, barW, barH);
      ctx!.fillStyle = C.barrier; ctx!.font = "10px JetBrains Mono, monospace";
      ctx!.fillText(`V₀ = ${s.barrier}%`, barX - 24, yProt - barH - 6);

      if (s.mode === "protonic" || s.mode === "hybrid") {
        // spawn protons periodically
        const spawnRate = s.mode === "hybrid" ? Math.max(20, 90 - s.exci.amp[SITES - 1] * s.exci.amp[SITES - 1] * 70) : 60;
        if (s.frame % Math.floor(spawnRate) === 0) {
          const e = 0.2 + Math.random() * 0.7;
          s.protons.push({ x: 30, e, alive: true, tunneled: false });
          s.totalProtons++;
        }
        s.protons.forEach(p => {
          if (!p.alive) return;
          p.x += 1.2;
          // hit barrier
          if (!p.tunneled && p.x > barX - barW / 2 - 4 && p.x < barX - barW / 2 + 4) {
            const v = s.barrier / 100;
            const T = Math.exp(-2 * Math.max(0, v - p.e) * 6);
            if (Math.random() < T) {
              p.tunneled = true;
              s.tunnelCount++;
              // teleport across barrier (visualisation)
              p.x = barX + barW / 2 + 4;
              log("QTUN", `H⁺ tunnelled · E=${p.e.toFixed(2)} V₀=${v.toFixed(2)} T≈${T.toFixed(3)}`, C.tunnel);
            } else {
              p.alive = false;
            }
          }
          if (p.x > W) p.alive = false;
          // draw
          ctx!.fillStyle = p.tunneled ? C.tunnel : C.proton;
          ctx!.beginPath();
          ctx!.arc(p.x, yProt - p.e * 50, 4, 0, Math.PI * 2);
          ctx!.fill();
          // trail
          ctx!.strokeStyle = `${p.tunneled ? C.tunnel : C.proton}66`;
          ctx!.lineWidth = 1;
          ctx!.beginPath();
          ctx!.moveTo(p.x - 16, yProt - p.e * 50);
          ctx!.lineTo(p.x, yProt - p.e * 50);
          ctx!.stroke();
        });
        s.protons = s.protons.filter(p => p.alive);
      }

      ctx!.fillStyle = C.text; ctx!.font = "11px JetBrains Mono, monospace";
      ctx!.fillText("H⁺ tunnelling · barrier traversal", 30, yProt - 60);

      if (s.frame % 8 === 0) {
        const T1 = Math.round(280 + (1 - s.deph / 100) * 220);
        const T2 = Math.round(120 + (1 - s.deph / 100) * 280);
        // fidelity = norm preservation proxy
        let sum = 0; s.exci.amp.forEach(a => sum += a * a);
        const fid = Math.round(Math.min(1, sum) * 100);
        const tun = s.totalProtons > 0 ? Math.round(s.tunnelCount / s.totalProtons * 100) : 0;
        setMetrics({ T1, T2, fidelity: fid, tunnel: tun, walk: Math.round(s.walkDist * 100) / 100 });
      }
      if (s.frame % 280 === 0) {
        log("STAT", `walk⟨n⟩=${s.walkDist.toFixed(2)} · tunnel rate=${s.totalProtons > 0 ? Math.round(s.tunnelCount / s.totalProtons * 100) : 0}%`, accent);
      }

      raf = requestAnimationFrame(frame);
    }
    raf = requestAnimationFrame(frame);
    return () => cancelAnimationFrame(raf);
  }, []);

  function reseed() {
    const s = stateRef.current;
    s.exci.amp = new Array(SITES).fill(0);
    s.exci.phase = new Array(SITES).fill(0);
    s.exci.amp[0] = 1;
    s.protons = [];
    s.tunnelCount = 0; s.totalProtons = 0;
    log("SYS", "State re-prepared · |1⟩ exciton at site 1 · proton queue cleared", C.photon);
  }

  const m = MODES.find(x => x.key === mode)!;

  return (
    <div className="min-h-screen p-6 md:p-10 font-mono text-sm" style={{ background: C.bg, color: C.text }} data-testid="page-biomimetic-quantum">
      <div className="max-w-7xl mx-auto">
        <header className="mb-6">
          <div className="text-xs tracking-[0.4em] uppercase mb-2" style={{ color: C.photon }}>
            Biomimetic Quantum Computing
          </div>
          <h1 className="text-3xl md:text-5xl tracking-tight mb-2" style={{ fontFamily: "Cinzel, serif", color: C.white }}>
            Photonic · Protonic
          </h1>
          <div className="text-sm" style={{ color: C.muted }}>
            FMO-complex exciton walk · hydrogen tunnelling gates · hybrid two-stage bio-quantum logic
          </div>
        </header>

        <div className="flex flex-wrap gap-2 mb-4" data-testid="mode-tabs">
          {MODES.map(mm => (
            <button
              key={mm.key}
              onClick={() => setMode(mm.key)}
              data-testid={`mode-${mm.key}`}
              className="px-3 py-2 text-xs tracking-[0.18em] uppercase border transition-colors"
              style={{
                borderColor: mode === mm.key ? mm.col : C.border,
                color: mode === mm.key ? mm.col : C.text,
                background: mode === mm.key ? `${mm.col}14` : "transparent",
              }}
            >
              <span style={{ color: mode === mm.key ? mm.col : C.dim, marginRight: 8 }}>{mm.n}</span>
              {mm.label}
            </button>
          ))}
          <button
            onClick={reseed}
            data-testid="btn-reseed"
            className="px-3 py-2 text-xs tracking-[0.18em] uppercase border ml-auto"
            style={{ borderColor: C.border2, color: C.text }}
          >Re-prepare |1⟩</button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-4">
          <div className="border" style={{ borderColor: C.border, background: C.panel }}>
            <div className="border-b px-4 py-2 flex items-center justify-between" style={{ borderColor: C.border }}>
              <div className="flex items-center gap-2">
                <span style={{ color: m.col }}>●</span>
                <span className="text-xs uppercase tracking-[0.2em]">{m.label} Substrate</span>
              </div>
              <button
                onClick={() => setRunning(r => !r)}
                data-testid="btn-toggle-run"
                className="px-2 py-1 text-[11px] uppercase border"
                style={{ borderColor: C.border2, color: running ? m.col : C.muted }}
              >{running ? "Pause" : "Run"}</button>
            </div>
            <div className="relative" style={{ height: 460 }}>
              <canvas ref={cvRef} className="w-full h-full block" data-testid="canvas-bioqc" />
            </div>
            <div className="border-t px-4 py-3 grid grid-cols-3 gap-4 text-xs" style={{ borderColor: C.border }}>
              <label>
                <div className="flex justify-between mb-1"><span style={{ color: C.muted }}>Site coupling J</span><span style={{ color: C.photon }}>{coupling}%</span></div>
                <input type="range" min={0} max={100} value={coupling} onChange={e => setCoupling(Number(e.target.value))} className="w-full" data-testid="slider-coupling" />
              </label>
              <label>
                <div className="flex justify-between mb-1"><span style={{ color: C.muted }}>Dephasing γ</span><span style={{ color: C.hybrid }}>{deph}%</span></div>
                <input type="range" min={0} max={100} value={deph} onChange={e => setDeph(Number(e.target.value))} className="w-full" data-testid="slider-deph" />
              </label>
              <label>
                <div className="flex justify-between mb-1"><span style={{ color: C.muted }}>Barrier V₀</span><span style={{ color: C.proton }}>{barrier}%</span></div>
                <input type="range" min={0} max={100} value={barrier} onChange={e => setBarrier(Number(e.target.value))} className="w-full" data-testid="slider-barrier" />
              </label>
            </div>
          </div>

          <aside className="space-y-4">
            <div className="border p-4" style={{ borderColor: C.border, background: C.panel }} data-testid="metrics-panel">
              <div className="text-xs tracking-[0.2em] uppercase mb-3" style={{ color: C.muted }}>Quantum Telemetry</div>
              {[
                { l: "T₁ [μs]",        v: metrics.T1,       col: C.photon },
                { l: "T₂ [μs]",        v: metrics.T2,       col: C.hybrid },
                { l: "Fidelity [%]",   v: metrics.fidelity, col: C.site },
                { l: "Tunnel rate [%]", v: metrics.tunnel,  col: C.tunnel },
                { l: "⟨n⟩ walk dist",  v: metrics.walk,     col: C.photon },
              ].map(mm => (
                <div key={mm.l} className="flex justify-between py-1 text-xs">
                  <span style={{ color: C.muted }}>{mm.l}</span>
                  <span style={{ color: mm.col }} data-testid={`metric-${mm.l}`}>{mm.v}</span>
                </div>
              ))}
            </div>

            <div className="border p-4" style={{ borderColor: C.border, background: C.panel }}>
              <div className="text-xs tracking-[0.2em] uppercase mb-3" style={{ color: C.muted }}>Substrate</div>
              <div className="text-xs leading-relaxed" style={{ color: C.text }}>{m.lead}</div>
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
                      <span style={{ color: e.col, width: 56 }} className="uppercase">{e.mode}</span>
                      <span style={{ color: C.text }}>{e.msg}</span>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            </div>
          </aside>
        </div>

        <div className="mt-8 text-xs text-center tracking-[0.6em] uppercase" style={{ color: C.dim }}>
          ψ · |1⟩ · H⁺ · ⟨φ|ψ⟩
        </div>
      </div>
    </div>
  );
}
