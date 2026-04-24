import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

const C = {
  bg: "#04060a", panel: "rgba(8,12,18,0.86)",
  border: "rgba(120,180,255,0.14)", border2: "rgba(120,180,255,0.32)",
  white: "#E5F0FF", text: "#A8BCD0", muted: "#6A7E92", dim: "#3F5060",
  robot: "#5BC0EB",      // cyan
  env: "#8FE388",        // green
  contam: "#F2A65A",     // amber
  auto: "#C77DFF",       // violet
  good: "#7AE582",
  warn: "#F2C14E",
  danger: "#FF5C5C",
  meta: "#9DB5C9",
};

type DomainKey = "robot" | "env" | "contam" | "auto";

interface Domain {
  key: DomainKey;
  n: string;
  label: string;
  unit: string;
  setpointRange: [number, number];
  defaultSet: number;
  col: string;
  brief: string;
  sense: string;
  control: string;
  actuate: string;
  plant: string;
}

const DOMAINS: Domain[] = [
  { key: "robot",  n: "01", label: "Robotics",      unit: "rad",   setpointRange: [-3.14, 3.14], defaultSet: 1.0,
    col: C.robot, brief: "Joint-angle servo · the canonical PID arm",
    sense: "Encoder θ", control: "PID + saturation", actuate: "Torque τ", plant: "Inertia + damping" },
  { key: "env",    n: "02", label: "Environmental",  unit: "°C",    setpointRange: [16, 26], defaultSet: 21,
    col: C.env, brief: "Cleanroom thermal regulation under solar disturbance",
    sense: "RTD probe", control: "PI compensator", actuate: "Heater / chiller", plant: "Room thermal mass" },
  { key: "contam", n: "03", label: "Contamination",  unit: "ppm",   setpointRange: [0, 20], defaultSet: 5,
    col: C.contam, brief: "Particulate count maintained below threshold via HEPA modulation",
    sense: "Optical counter", control: "Bang-bang + hysteresis", actuate: "HEPA fan", plant: "Aerosol diffusion" },
  { key: "auto",   n: "04", label: "Autonomous",     unit: "m/s",   setpointRange: [0, 30], defaultSet: 18,
    col: C.auto, brief: "Vehicle speed under road grade and wind disturbance",
    sense: "GPS / IMU", control: "MPC short-horizon", actuate: "Throttle / brake", plant: "Vehicle dynamics" },
];

interface LoopState {
  y: number;       // measured output
  u: number;       // control signal
  err: number;     // error
  iAcc: number;    // integral accumulator
  prevErr: number; // for derivative
  hist: number[];  // y history
  histSet: number[];
  noise: number;
}

interface LogEntry { ts: string; tag: string; msg: string; col: string; }

export default function ClosedLoopCoherencePage() {
  const cvRef = useRef<HTMLCanvasElement>(null);
  const stRef = useRef({
    setpoints: { robot: 1.0, env: 21, contam: 5, auto: 18 } as Record<DomainKey, number>,
    Kp: 0.6, Ki: 0.05, Kd: 0.12,
    coupling: 0.18,        // cross-domain disturbance amplitude
    disturb: 0.4,          // injected disturbance amplitude
    noiseLvl: 0.05,
    running: true,
    frame: 0,
    loops: {
      robot:  { y: 0,    u: 0, err: 0, iAcc: 0, prevErr: 0, hist: [], histSet: [], noise: 0 } as LoopState,
      env:    { y: 19,   u: 0, err: 0, iAcc: 0, prevErr: 0, hist: [], histSet: [], noise: 0 } as LoopState,
      contam: { y: 12,   u: 0, err: 0, iAcc: 0, prevErr: 0, hist: [], histSet: [], noise: 0 } as LoopState,
      auto:   { y: 8,    u: 0, err: 0, iAcc: 0, prevErr: 0, hist: [], histSet: [], noise: 0 } as LoopState,
    } as Record<DomainKey, LoopState>,
  });

  const [setpoints, setSetpoints] = useState<Record<DomainKey, number>>({ robot: 1.0, env: 21, contam: 5, auto: 18 });
  const [Kp, setKp] = useState(0.6);
  const [Ki, setKi] = useState(0.05);
  const [Kd, setKd] = useState(0.12);
  const [coupling, setCoupling] = useState(0.18);
  const [disturb, setDisturb] = useState(0.4);
  const [noiseLvl, setNoiseLvl] = useState(0.05);
  const [running, setRunning] = useState(true);
  const [activeDomain, setActiveDomain] = useState<DomainKey>("robot");
  const activeRef = useRef<DomainKey>("robot");
  const [coherence, setCoherence] = useState(0);
  const [stability, setStability] = useState({ robot: 100, env: 100, contam: 100, auto: 100 } as Record<DomainKey, number>);
  const [events, setEvents] = useState<LogEntry[]>([]);
  const initRef = useRef(false);

  function pushLog(tag: string, msg: string, col: string) {
    const now = new Date();
    const ts = [now.getHours(), now.getMinutes(), now.getSeconds()].map(n => String(n).padStart(2, "0")).join(":");
    setEvents(prev => [{ ts, tag, msg, col }, ...prev].slice(0, 40));
  }

  useEffect(() => { stRef.current.setpoints = setpoints; }, [setpoints]);
  useEffect(() => { stRef.current.Kp = Kp; }, [Kp]);
  useEffect(() => { stRef.current.Ki = Ki; }, [Ki]);
  useEffect(() => { stRef.current.Kd = Kd; }, [Kd]);
  useEffect(() => { stRef.current.coupling = coupling; }, [coupling]);
  useEffect(() => { stRef.current.disturb = disturb; }, [disturb]);
  useEffect(() => { stRef.current.noiseLvl = noiseLvl; }, [noiseLvl]);
  useEffect(() => { stRef.current.running = running; }, [running]);
  useEffect(() => { activeRef.current = activeDomain; }, [activeDomain]);

  useEffect(() => {
    if (!initRef.current) {
      initRef.current = true;
      pushLog("SYS", "Closed-loop coherence framework armed · 4 coupled domains", C.meta);
      pushLog("SYS", "Loops: robotics ⇄ environmental ⇄ contamination ⇄ autonomous", C.meta);
    }
    const c = cvRef.current; if (!c) return;
    const ctx = c.getContext("2d"); if (!ctx) return;
    c.width = c.offsetWidth; c.height = c.offsetHeight;

    let raf = 0;
    function frame() {
      const s = stRef.current;
      if (!s.running) { raf = requestAnimationFrame(frame); return; }
      s.frame++;
      const dt = 0.05;

      // Update each loop
      const keys: DomainKey[] = ["robot", "env", "contam", "auto"];
      for (let ki = 0; ki < keys.length; ki++) {
        const k = keys[ki];
        const L = s.loops[k];
        const sp = s.setpoints[k];

        // Cross-domain coupling: each loop receives disturbance proportional to
        // neighbour error (closed-loop coherence: loops listen to each other)
        let coupleDist = 0;
        for (let kj = 0; kj < keys.length; kj++) {
          if (kj === ki) continue;
          coupleDist += s.loops[keys[kj]].err * s.coupling * 0.4;
        }

        // Random disturbance + slow walk
        const slow = Math.sin(s.frame * 0.003 + ki * 1.7) * s.disturb;
        const noise = (Math.random() - 0.5) * 2 * s.noiseLvl;
        L.noise = noise;

        // PID computation
        const err = sp - L.y;
        L.iAcc += err * dt;
        L.iAcc = Math.max(-50, Math.min(50, L.iAcc));
        const dErr = (err - L.prevErr) / dt;
        const u = s.Kp * err + s.Ki * L.iAcc + s.Kd * dErr;
        L.prevErr = err;
        L.err = err;
        L.u = u;

        // Plant model — simple first-order with limited actuation
        const uClamped = Math.max(-10, Math.min(10, u));
        let plantGain = 0.6;
        if (k === "env")    plantGain = 0.18;   // slow thermal mass
        if (k === "contam") plantGain = 0.45;
        if (k === "auto")   plantGain = 0.85;
        if (k === "robot")  plantGain = 1.1;

        L.y += (uClamped * plantGain * dt) + (slow * 0.04) + (coupleDist * 0.02) + noise * 0.1;

        // Domain-specific clamps
        if (k === "robot")  L.y = Math.max(-4, Math.min(4, L.y));
        if (k === "env")    L.y = Math.max(10, Math.min(35, L.y));
        if (k === "contam") L.y = Math.max(0, Math.min(60, L.y));
        if (k === "auto")   L.y = Math.max(0, Math.min(45, L.y));

        L.hist.push(L.y);
        L.histSet.push(sp);
        if (L.hist.length > 220) { L.hist.shift(); L.histSet.shift(); }
      }

      // Coherence: fraction of loops within tolerance band
      if (s.frame % 10 === 0) {
        let inBand = 0;
        const stab: Record<DomainKey, number> = { robot: 0, env: 0, contam: 0, auto: 0 };
        for (let ki = 0; ki < keys.length; ki++) {
          const k = keys[ki];
          const L = s.loops[k];
          const sp = s.setpoints[k];
          const range = DOMAINS[ki].setpointRange;
          const tol = (range[1] - range[0]) * 0.05;
          const dev = Math.abs(L.y - sp);
          const score = Math.max(0, 100 - (dev / tol) * 25);
          stab[k] = Math.round(score);
          if (dev < tol) inBand++;
        }
        setStability(stab);
        setCoherence(Math.round((inBand / 4) * 100));
      }

      // Render
      const W = c.width, H = c.height;
      ctx.fillStyle = C.bg; ctx.fillRect(0, 0, W, H);

      // Background grid
      ctx.strokeStyle = "rgba(120,180,255,0.04)"; ctx.lineWidth = 1;
      for (let x = 0; x < W; x += 40) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, H); ctx.stroke(); }
      for (let y = 0; y < H; y += 40) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke(); }

      // Layout: 2x2 mini-loops
      const halfW = W / 2, halfH = H / 2;
      const pads = [
        { x: 0,     y: 0,     w: halfW, h: halfH, dom: DOMAINS[0] },
        { x: halfW, y: 0,     w: halfW, h: halfH, dom: DOMAINS[1] },
        { x: 0,     y: halfH, w: halfW, h: halfH, dom: DOMAINS[2] },
        { x: halfW, y: halfH, w: halfW, h: halfH, dom: DOMAINS[3] },
      ];

      for (const pad of pads) {
        const L = s.loops[pad.dom.key];
        const sp = s.setpoints[pad.dom.key];
        const range = pad.dom.setpointRange;
        const padX = pad.x + 18, padY = pad.y + 26;
        const padW = pad.w - 36, padH = pad.h - 52;

        // Frame
        const isActive = pad.dom.key === activeRef.current;
        ctx.strokeStyle = isActive ? pad.dom.col : C.border;
        ctx.lineWidth = isActive ? 1.5 : 1;
        ctx.strokeRect(padX, padY, padW, padH);

        // Title
        ctx.fillStyle = pad.dom.col;
        ctx.font = "11px 'JetBrains Mono', monospace";
        ctx.fillText(`${pad.dom.n} · ${pad.dom.label.toUpperCase()}`, padX + 8, pad.y + 18);

        // Setpoint line
        const yScale = (v: number) => padY + padH - ((v - range[0]) / (range[1] - range[0])) * padH;
        ctx.strokeStyle = pad.dom.col + "55";
        ctx.setLineDash([4, 3]);
        ctx.beginPath();
        ctx.moveTo(padX, yScale(sp));
        ctx.lineTo(padX + padW, yScale(sp));
        ctx.stroke();
        ctx.setLineDash([]);

        // Tolerance band
        const tol = (range[1] - range[0]) * 0.05;
        ctx.fillStyle = pad.dom.col + "10";
        ctx.fillRect(padX, yScale(sp + tol), padW, yScale(sp - tol) - yScale(sp + tol));

        // y(t) trace
        if (L.hist.length > 1) {
          ctx.strokeStyle = pad.dom.col;
          ctx.lineWidth = 1.5;
          ctx.beginPath();
          for (let i = 0; i < L.hist.length; i++) {
            const x = padX + (i / 220) * padW;
            const y = yScale(L.hist[i]);
            i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
          }
          ctx.stroke();
        }

        // Current value text
        ctx.fillStyle = C.white;
        ctx.font = "10px 'JetBrains Mono', monospace";
        ctx.fillText(`y = ${L.y.toFixed(2)} ${pad.dom.unit}`, padX + 8, padY + padH - 8);
        ctx.fillStyle = C.muted;
        ctx.fillText(`SP ${sp.toFixed(2)} · err ${L.err.toFixed(2)} · u ${L.u.toFixed(2)}`, padX + 8, padY + padH + 14);
      }

      // Center coupling annotation
      ctx.strokeStyle = C.border2;
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(halfW, 0); ctx.lineTo(halfW, H);
      ctx.moveTo(0, halfH); ctx.lineTo(W, halfH);
      ctx.stroke();
      ctx.fillStyle = C.meta;
      ctx.font = "9px 'JetBrains Mono', monospace";
      ctx.save();
      ctx.translate(halfW + 4, halfH - 6);
      ctx.fillText(`ε = ${s.coupling.toFixed(2)}`, 0, 0);
      ctx.restore();

      raf = requestAnimationFrame(frame);
    }
    raf = requestAnimationFrame(frame);
    return () => cancelAnimationFrame(raf);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function setSP(k: DomainKey, v: number) {
    setSetpoints(prev => ({ ...prev, [k]: v }));
    pushLog("SET", `${DOMAINS.find(d => d.key === k)!.label} setpoint → ${v.toFixed(2)} ${DOMAINS.find(d => d.key === k)!.unit}`, DOMAINS.find(d => d.key === k)!.col);
  }

  function injectShock() {
    const s = stRef.current;
    const keys: DomainKey[] = ["robot", "env", "contam", "auto"];
    for (const k of keys) {
      s.loops[k].y += (Math.random() - 0.5) * 4;
    }
    pushLog("SHOCK", "Step disturbance injected on all 4 plants", C.warn);
  }

  function resetIntegrals() {
    const s = stRef.current;
    const keys: DomainKey[] = ["robot", "env", "contam", "auto"];
    for (const k of keys) { s.loops[k].iAcc = 0; }
    pushLog("RESET", "Integral accumulators cleared", C.meta);
  }

  const active = DOMAINS.find(d => d.key === activeDomain)!;

  return (
    <div className="min-h-screen flex flex-col" style={{ background: C.bg, color: C.text }} data-testid="page-closed-loop-coherence">
      <header className="px-8 pt-8 pb-4 border-b" style={{ borderColor: C.border }}>
        <div className="text-[11px] tracking-[0.45em] uppercase" style={{ color: C.muted }}>
          AETHER · CLOSED-LOOP COHERENCE SYSTEM · APRIL 2026
        </div>
        <h1 className="font-serif text-4xl mt-2 tracking-wide" style={{ color: C.white, fontFamily: "Cinzel, serif" }}>
          Closed-Loop Coherence
        </h1>
        <div className="mt-1 text-sm" style={{ color: C.text }}>
          Robotics · Environmental Control · Contamination · Autonomous Vehicles · one stability principle, four coupled domains
        </div>
      </header>

      <section className="px-8 pt-6">
        <div className="flex gap-2 flex-wrap" data-testid="domain-tabs">
          {DOMAINS.map(d => {
            const isOn = activeDomain === d.key;
            return (
              <button key={d.key}
                onClick={() => { setActiveDomain(d.key); pushLog("FOCUS", `Inspecting ${d.label}`, d.col); }}
                data-testid={`tab-${d.key}`}
                aria-pressed={isOn}
                aria-label={`Focus ${d.label} domain`}
                className="px-4 py-2 text-xs tracking-[0.2em] uppercase border transition-all"
                style={{
                  borderColor: isOn ? d.col : C.border,
                  color: isOn ? d.col : C.muted,
                  background: isOn ? d.col + "15" : "transparent",
                }}>
                {d.n}&nbsp;&nbsp;{d.label}
              </button>
            );
          })}
        </div>
      </section>

      <section className="flex-1 px-8 pt-6 pb-8 grid gap-6" style={{ gridTemplateColumns: "minmax(0, 1fr) 320px" }}>
        <div className="space-y-4 min-w-0">
          <div className="border" style={{ borderColor: C.border, background: C.panel }}>
            <div className="px-4 py-2 border-b flex items-center justify-between" style={{ borderColor: C.border }}>
              <div className="text-xs tracking-[0.2em] uppercase" style={{ color: active.col }}>
                ◉ Four-loop coupled response · y(t) traces
              </div>
              <div className="flex gap-2">
                <button onClick={() => { setRunning(r => !r); pushLog("CTRL", running ? "Loops paused" : "Loops resumed", C.meta); }}
                  data-testid="btn-toggle-run"
                  className="px-3 py-1 text-[10px] tracking-[0.2em] uppercase border"
                  style={{ borderColor: C.border2, color: C.text }}>
                  {running ? "Pause" : "Run"}
                </button>
                <button onClick={injectShock} data-testid="btn-shock"
                  className="px-3 py-1 text-[10px] tracking-[0.2em] uppercase border"
                  style={{ borderColor: C.warn, color: C.warn }}>Shock</button>
                <button onClick={resetIntegrals} data-testid="btn-reset"
                  className="px-3 py-1 text-[10px] tracking-[0.2em] uppercase border"
                  style={{ borderColor: C.border2, color: C.text }}>Reset I</button>
              </div>
            </div>
            <div className="aspect-[16/9] relative">
              <canvas ref={cvRef} className="absolute inset-0 w-full h-full" data-testid="canvas-clcs"
                role="img" aria-label="Four-domain closed-loop response traces" />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="border p-4" style={{ borderColor: C.border, background: C.panel }} data-testid="ctrl-pid">
              <div className="text-xs tracking-[0.2em] uppercase mb-3" style={{ color: C.muted }}>PID Gains</div>
              <Slider id="kp" label="Kp · proportional" value={Kp} min={0} max={2} step={0.01}
                fmt={v => v.toFixed(2)} onChange={v => { setKp(v); pushLog("GAIN", `Kp = ${v.toFixed(2)}`, C.meta); }} col={C.robot} />
              <Slider id="ki" label="Ki · integral" value={Ki} min={0} max={0.5} step={0.005}
                fmt={v => v.toFixed(3)} onChange={v => setKi(v)} col={C.env} />
              <Slider id="kd" label="Kd · derivative" value={Kd} min={0} max={0.6} step={0.01}
                fmt={v => v.toFixed(2)} onChange={v => setKd(v)} col={C.contam} />
            </div>

            <div className="border p-4" style={{ borderColor: C.border, background: C.panel }} data-testid="ctrl-coupling">
              <div className="text-xs tracking-[0.2em] uppercase mb-3" style={{ color: C.muted }}>Coupling & Noise</div>
              <Slider id="coupling" label="ε · cross-domain" value={coupling} min={0} max={0.6} step={0.01}
                fmt={v => v.toFixed(2)} onChange={v => { setCoupling(v); pushLog("ε", `Coupling → ${v.toFixed(2)}`, C.auto); }} col={C.auto} />
              <Slider id="disturb" label="d · disturbance" value={disturb} min={0} max={1.5} step={0.01}
                fmt={v => v.toFixed(2)} onChange={v => setDisturb(v)} col={C.warn} />
              <Slider id="noise" label="σ · sensor noise" value={noiseLvl} min={0} max={0.4} step={0.005}
                fmt={v => v.toFixed(3)} onChange={v => setNoiseLvl(v)} col={C.meta} />
            </div>

            <div className="border p-4" style={{ borderColor: C.border, background: C.panel }} data-testid="ctrl-setpoint">
              <div className="text-xs tracking-[0.2em] uppercase mb-3" style={{ color: active.col }}>{active.label} · Setpoint</div>
              <Slider id="sp-active" label={`SP · ${active.unit}`} value={setpoints[activeDomain]}
                min={active.setpointRange[0]} max={active.setpointRange[1]} step={(active.setpointRange[1] - active.setpointRange[0]) / 100}
                fmt={v => v.toFixed(2)} onChange={v => setSP(activeDomain, v)} col={active.col} />
              <div className="mt-3 pt-3 border-t text-[11px] leading-relaxed" style={{ borderColor: C.border, color: C.muted }}>
                {active.brief}
              </div>
            </div>
          </div>

          <div className="border p-5" style={{ borderColor: C.border, background: C.panel }}>
            <div className="text-xs tracking-[0.2em] uppercase mb-4" style={{ color: C.muted }}>Five-step loop · {active.label}</div>
            <div className="grid grid-cols-5 gap-3">
              {[
                { label: "Sense",    val: active.sense,                                                sym: "Σ" },
                { label: "Deliver",  val: `${active.control} routes correction`,                      sym: "Λ" },
                { label: "Activate", val: active.actuate,                                              sym: "α" },
                { label: "Feedback", val: `${active.plant} · sensor reads y(t)`,                      sym: "Φ" },
                { label: "Learn",    val: `gains adapt · I-accumulator now ${stRef.current.loops[activeDomain].iAcc.toFixed(2)}`, sym: "Θ" },
              ].map((step, i) => (
                <div key={step.label} className="border p-3" style={{ borderColor: active.col + "55", background: active.col + "10" }} data-testid={`step-${step.label}`}>
                  <div className="text-[10px] tracking-[0.18em] uppercase" style={{ color: C.muted }}>0{i + 1} · {step.sym}</div>
                  <div className="text-sm mt-1" style={{ color: active.col }}>{step.label}</div>
                  <div className="text-[11px] mt-2" style={{ color: C.text }}>{step.val}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <aside className="space-y-4">
          <div className="border p-4" style={{ borderColor: C.border, background: C.panel }} data-testid="metrics-panel">
            <div className="text-xs tracking-[0.2em] uppercase mb-3" style={{ color: C.muted }}>Telemetry</div>
            {[
              { l: "Coherence",       v: `${coherence}%`,                col: coherence >= 75 ? C.good : coherence >= 40 ? C.warn : C.danger },
              { l: "Robotics stab",   v: `${stability.robot}%`,          col: C.robot },
              { l: "Environmental",   v: `${stability.env}%`,            col: C.env },
              { l: "Contamination",   v: `${stability.contam}%`,         col: C.contam },
              { l: "Autonomous",      v: `${stability.auto}%`,           col: C.auto },
              { l: "ε coupling",      v: coupling.toFixed(2),            col: C.meta },
            ].map(m => (
              <div key={m.l} className="flex justify-between py-1 text-xs">
                <span style={{ color: C.muted }}>{m.l}</span>
                <span style={{ color: m.col }} data-testid={`metric-${m.l}`}>{m.v}</span>
              </div>
            ))}
          </div>

          <div className="border p-4" style={{ borderColor: C.border, background: C.panel }}>
            <div className="text-xs tracking-[0.2em] uppercase mb-3" style={{ color: C.muted }}>Principle</div>
            <div className="text-xs leading-relaxed" style={{ color: C.text }}>
              The aim is no longer to <em>detect, deviate, fix</em>. The aim becomes:
              <span style={{ color: C.white }}> maintain stability automatically through continuous feedback and adjustment.</span>
              The four loops below run independently yet listen to one another via cross-coupling ε — a contamination spike nudges the environmental loop, which nudges the robot, which nudges the vehicle. Stability emerges as a system property, not a single-loop guarantee.
            </div>
          </div>

          <div className="border" style={{ borderColor: C.border, background: C.panel }}>
            <div className="px-4 py-2 border-b text-xs tracking-[0.2em] uppercase" style={{ borderColor: C.border, color: C.muted }}>Event Log</div>
            <div className="max-h-72 overflow-y-auto p-3 space-y-1 text-[11px]" data-testid="log-panel">
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

          <div className="border p-4" style={{ borderColor: C.border, background: C.panel }}>
            <div className="text-xs tracking-[0.2em] uppercase mb-3" style={{ color: C.muted }}>AETHER mapping</div>
            <div className="text-[11px] leading-relaxed space-y-1" style={{ color: C.text }}>
              <div><span style={{ color: C.robot }}>Σ Sense</span> · per-loop measurement</div>
              <div><span style={{ color: C.env }}>Λ Deliver</span> · controller routes correction</div>
              <div><span style={{ color: C.contam }}>α Activate</span> · actuator enacts control</div>
              <div><span style={{ color: C.auto }}>Φ Feedback</span> · plant responds, sensor reads</div>
              <div><span style={{ color: C.meta }}>Θ Learn</span> · gains adapt to disturbance regime</div>
            </div>
          </div>
        </aside>
      </section>

      <footer className="px-8 py-4 border-t text-[10px] tracking-[0.3em] uppercase" style={{ borderColor: C.border, color: C.dim }}>
        Σ → Λ → α → Φ → Θ · ε · κ · σ · γ · stability is a system property, not a single-loop guarantee
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
