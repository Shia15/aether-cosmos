import { useEffect, useRef, useState } from "react";

const PHASES = [
  { name: "STANDBY",        t: -1,  desc: "Awaiting launch command. All systems nominal.",                          throttle: 0,    color: "#00e5c8" },
  { name: "IGNITION",       t: 0,   desc: "Engine ignition. Full throttle. Liftoff sequence engaged.",              throttle: 1.0,  color: "#00e5c8" },
  { name: "ASCENT",         t: 10,  desc: "Vertical climb. Pitch maneuver initiating.",                             throttle: 1.0,  color: "#00e5c8" },
  { name: "MAX-Q APPROACH", t: 45,  desc: "Dynamic pressure rising. Throttle-down initiated.",                      throttle: 0.72, color: "#c9a84c" },
  { name: "MAX Q",          t: 58,  desc: "Peak aerodynamic loading. ½ρv² at maximum. Structural limit.",          throttle: 0.68, color: "#ff3b5c" },
  { name: "POST MAX-Q",     t: 72,  desc: "Pressure declining. Throttle restoring to full power.",                  throttle: 0.85, color: "#c9a84c" },
  { name: "FULL THROTTLE",  t: 90,  desc: "Full thrust restored. Atmosphere thinning. Acceleration rising.",        throttle: 1.0,  color: "#00e5c8" },
  { name: "MECO",           t: 145, desc: "Main Engine Cutoff. Orbital insertion phase.",                           throttle: 0.0,  color: "#7b4fff" },
  { name: "ORBITAL",        t: 160, desc: "Exoatmospheric. Zero drag. Trajectory nominal.",                         throttle: 0.0,  color: "#7b4fff" },
];

function atmos(alt: number) {
  if (alt < 0) return { rho: 1.225, P: 101325, T: 288 };
  const H = 8500;
  const rho = 1.225 * Math.exp(-alt / H);
  const P = 101325 * Math.exp(-alt / H);
  const T = Math.max(200, 288 - 6.5 * (alt / 1000));
  return { rho, P, T };
}

function getState(t: number) {
  let alt: number;
  if (t <= 0) alt = 0;
  else if (t < 145) alt = 0.0012 * t * t + 0.08 * t;
  else { const a145 = 0.0012 * 145 * 145 + 0.08 * 145; alt = a145 + (t - 145) * 2.8; }
  alt = Math.max(0, alt);
  let vel: number;
  if (t <= 0) vel = 0;
  else if (t < 145) vel = 2.4 * t + 0.001 * t * t;
  else vel = 2.4 * 145 + 0.001 * 145 * 145;
  vel = Math.max(0, vel);
  const { rho, P, T } = atmos(alt * 1000);
  const q = 0.5 * rho * vel * vel;
  let phaseIdx = 0;
  for (let i = PHASES.length - 1; i >= 0; i--) { if (t >= PHASES[i].t) { phaseIdx = i; break; } }
  const phase = PHASES[phaseIdx];
  const mach = vel / 340;
  const accel = t < 145 && t > 0 ? (2.4 + 0.002 * t) / 9.81 : 0;
  const Cd = 0.3, A = 78.5;
  const drag = 0.5 * rho * vel * vel * Cd * A / 1000;
  const structLoad = Math.min(100, (q / 35000) * 100);
  const thrust = t > 0 && t < 145 ? phase.throttle * 8.5 : 0;
  const isp = t > 0 && t < 145 ? 380 : 0;
  const fuel = Math.max(0, 100 - (Math.max(0, t) / 145) * 100);
  return { alt, vel, mach, accel, q, rho, P, T, drag, structLoad, phase, phaseIdx, thrust, isp, fuel };
}

const LOG_EVENTS = [
  { t: 0,   msg: "Engine ignition sequence",        cls: "new" },
  { t: 5,   msg: "Liftoff confirmed",                cls: "new" },
  { t: 15,  msg: "Pitch maneuver nominal",           cls: "new" },
  { t: 30,  msg: "Dynamic pressure rising",          cls: "warn" },
  { t: 45,  msg: "Max-Q approach — throttle down",   cls: "warn" },
  { t: 58,  msg: "⚠ MAX Q — peak structural load",   cls: "crit" },
  { t: 65,  msg: "Max-Q passed — throttle restoring",cls: "warn" },
  { t: 90,  msg: "Full throttle — atmosphere thinning", cls: "new" },
  { t: 100, msg: "Kármán line approach",             cls: "new" },
  { t: 110, msg: "Exoatmospheric — drag nominal zero", cls: "new" },
  { t: 145, msg: "MECO — main engine cutoff",        cls: "warn" },
  { t: 160, msg: "Orbital insertion nominal",        cls: "new" },
] as const;

type LogEntry = { t: number; msg: string; cls: string };

function UFOAscentHeaderCanvas() {
  const ref = useRef<HTMLCanvasElement>(null);
  const rafRef = useRef(0);
  useEffect(() => {
    const canvas = ref.current; if (!canvas) return;
    const ctx = canvas.getContext("2d")!;
    canvas.width = 900; canvas.height = 145;
    const W = canvas.width, H = canvas.height;
    const cx=W/2;
    let t=0;
    const draw=()=>{
      ctx.fillStyle="rgba(2,4,8,0.28)"; ctx.fillRect(0,0,W,H);
      const shipY=H*0.55-15*Math.sin(t*0.03);
      ctx.beginPath();ctx.ellipse(cx,shipY,40,12,0,0,Math.PI*2);ctx.fillStyle="rgba(153,102,255,0.12)";ctx.fill();ctx.strokeStyle="rgba(153,102,255,0.4)";ctx.lineWidth=1;ctx.stroke();
      ctx.beginPath();ctx.ellipse(cx,shipY-8,20,8,0,0,Math.PI*2);ctx.fillStyle="rgba(153,102,255,0.15)";ctx.fill();ctx.strokeStyle="rgba(153,102,255,0.3)";ctx.lineWidth=0.8;ctx.stroke();
      const grd=ctx.createRadialGradient(cx,shipY+20,0,cx,shipY+20,30);
      grd.addColorStop(0,"rgba(153,102,255,0.15)");grd.addColorStop(1,"rgba(153,102,255,0)");
      ctx.fillStyle=grd;ctx.fillRect(cx-30,shipY+12,60,30);
      for(let i=0;i<4;i++){
        const lx=cx-30+i*20,ly=shipY+10;
        ctx.beginPath();ctx.moveTo(lx,ly);ctx.lineTo(lx+6*Math.sin(t*0.05+i),ly+12+5*Math.sin(t*0.07+i*0.5));ctx.strokeStyle=`rgba(68,170,255,${0.15+0.1*Math.sin(t*0.05+i)})`;ctx.lineWidth=0.5;ctx.stroke();
      }
      ctx.fillStyle="rgba(153,102,255,0.3)"; ctx.font="9px 'DM Mono',monospace";
      ctx.fillText("UFO ASCENT · FIELD PROPULSION · ANTI-GRAVITY · SAUCER DYNAMICS · AETHER",14,14);
      t++; rafRef.current=requestAnimationFrame(draw);
    };
    draw();
    return ()=>cancelAnimationFrame(rafRef.current);
  },[]);
  return <canvas ref={ref} style={{width:"100%",height:"auto",borderRadius:8,display:"block"}} />;
}

export default function UFOAscentView() {
  const trajRef = useRef<HTMLCanvasElement>(null);
  const dynRef = useRef<HTMLCanvasElement>(null);
  const tRef = useRef(0);
  const runningRef = useRef(false);
  const trajPointsRef = useRef<{ alt: number; x: number; throttle: number }[]>([]);
  const dynHistoryRef = useRef<{ t: number; q: number }[]>([]);
  const lastLogTRef = useRef(-1);

  const [state, setState] = useState(() => getState(0));
  const [tick, setTick] = useState(0);
  const [log, setLog] = useState<LogEntry[]>([]);
  const [running, setRunning] = useState(false);
  const [aborted, setAborted] = useState(false);
  const [showMaxQ, setShowMaxQ] = useState(false);

  const resizeCanvas = (c: HTMLCanvasElement | null) => {
    if (!c) return;
    const r = c.parentElement!.getBoundingClientRect();
    c.width = Math.max(100, r.width);
    c.height = Math.max(100, r.height);
  };

  const drawTraj = () => {
    const canvas = trajRef.current; if (!canvas) return;
    const ctx = canvas.getContext("2d"); if (!ctx) return;
    const W = canvas.width, H = canvas.height;
    ctx.clearRect(0, 0, W, H);
    ctx.fillStyle = "#000"; ctx.fillRect(0, 0, W, H);
    for (let i = 0; i < 120; i++) {
      const sx = (i * 137.5) % W;
      const sy = (i * 97.3 + 50) % H;
      const br = ((i * 41) % 70) / 100 + 0.2;
      ctx.fillStyle = `rgba(255,255,255,${br})`;
      ctx.beginPath(); ctx.arc(sx, sy, 0.5, 0, Math.PI * 2); ctx.fill();
    }
    const grad = ctx.createLinearGradient(0, H, 0, 0);
    grad.addColorStop(0, "rgba(0,30,60,0.4)");
    grad.addColorStop(0.25, "rgba(0,15,35,0.2)");
    grad.addColorStop(0.6, "rgba(0,0,20,0.05)");
    grad.addColorStop(1, "rgba(0,0,0,0)");
    ctx.fillStyle = grad; ctx.fillRect(0, 0, W, H);
    const maxAlt = 400;
    const karmanY = H - (100 / maxAlt) * H;
    ctx.strokeStyle = "rgba(123,79,255,0.3)"; ctx.setLineDash([4, 8]); ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(0, karmanY); ctx.lineTo(W, karmanY); ctx.stroke();
    ctx.setLineDash([]);
    ctx.fillStyle = "rgba(123,79,255,0.5)"; ctx.font = "8px DM Mono, monospace";
    ctx.fillText("KÁRMÁN LINE 100km", 8, karmanY - 6);
    const pts = trajPointsRef.current;
    if (pts.length > 1) {
      ctx.save();
      ctx.shadowColor = "rgba(0,229,200,0.6)"; ctx.shadowBlur = 8;
      ctx.strokeStyle = "rgba(0,229,200,0.6)"; ctx.lineWidth = 1.5;
      ctx.beginPath();
      pts.forEach((pt, i) => {
        const x = W * 0.2 + pt.x * W * 0.6;
        const y = H - (pt.alt / maxAlt) * H;
        i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
      });
      ctx.stroke(); ctx.restore();
    }
    if (pts.length > 0) {
      const last = pts[pts.length - 1];
      const ux = W * 0.2 + last.x * W * 0.6;
      const uy = H - (last.alt / maxAlt) * H;
      const plLen = 15 + last.throttle * 25;
      const pGrad = ctx.createLinearGradient(ux, uy, ux, uy + plLen);
      pGrad.addColorStop(0, "rgba(0,229,200,0.7)");
      pGrad.addColorStop(0.5, "rgba(0,200,180,0.3)");
      pGrad.addColorStop(1, "rgba(0,0,0,0)");
      ctx.fillStyle = pGrad;
      ctx.beginPath(); ctx.ellipse(ux, uy + plLen * 0.5, 4, plLen * 0.5, 0, 0, Math.PI * 2); ctx.fill();
      ctx.save(); ctx.translate(ux, uy);
      ctx.fillStyle = "#1a2a3a"; ctx.strokeStyle = "#00e5c8"; ctx.lineWidth = 0.8;
      ctx.beginPath(); ctx.ellipse(0, 0, 14, 4, 0, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
      ctx.fillStyle = "rgba(0,229,200,0.1)";
      ctx.beginPath(); ctx.ellipse(0, -2, 8, 3, 0, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = "#c9a84c";
      ctx.beginPath(); ctx.arc(-10, 0, 1.2, 0, Math.PI * 2); ctx.fill();
      ctx.beginPath(); ctx.arc(10, 0, 1.2, 0, Math.PI * 2); ctx.fill();
      ctx.restore();
    }
  };

  const drawDynChart = () => {
    const canvas = dynRef.current; if (!canvas) return;
    const ctx = canvas.getContext("2d"); if (!ctx) return;
    const W = canvas.width, H = canvas.height;
    ctx.clearRect(0, 0, W, H);
    const hist = dynHistoryRef.current;
    if (hist.length < 2) return;
    const maxQ = Math.max(...hist.map((d) => d.q), 35000);
    const maxT = 200;
    ctx.strokeStyle = "rgba(0,229,200,0.08)"; ctx.lineWidth = 1;
    for (let i = 0; i <= 4; i++) {
      const y = H - (i / 4) * H;
      ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke();
    }
    const mqY = H - (35000 / maxQ) * H;
    ctx.strokeStyle = "rgba(255,59,92,0.3)"; ctx.setLineDash([3, 6]);
    ctx.beginPath(); ctx.moveTo(0, mqY); ctx.lineTo(W, mqY); ctx.stroke();
    ctx.setLineDash([]);
    const grad = ctx.createLinearGradient(0, H, 0, 0);
    grad.addColorStop(0, "rgba(0,229,200,0.02)");
    grad.addColorStop(1, "rgba(0,229,200,0.12)");
    ctx.fillStyle = grad;
    ctx.beginPath(); ctx.moveTo(0, H);
    hist.forEach((d) => {
      const x = (d.t / maxT) * W;
      const y = H - (d.q / maxQ) * H;
      ctx.lineTo(x, y);
    });
    ctx.lineTo((hist[hist.length - 1].t / maxT) * W, H);
    ctx.closePath(); ctx.fill();
    ctx.strokeStyle = "#00e5c8"; ctx.lineWidth = 1.5;
    ctx.beginPath();
    hist.forEach((d, i) => {
      const x = (d.t / maxT) * W;
      const y = H - (d.q / maxQ) * H;
      i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
    });
    ctx.stroke();
  };

  // Resize handling
  useEffect(() => {
    const onResize = () => {
      resizeCanvas(trajRef.current);
      resizeCanvas(dynRef.current);
      drawTraj(); drawDynChart();
    };
    onResize();
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  // Sim tick
  useEffect(() => {
    const id = setInterval(() => {
      if (!runningRef.current) return;
      tRef.current += 0.5;
      const t = tRef.current;
      const s = getState(t);
      const xDrift = Math.sin(t * 0.02) * 0.05 + t * 0.002;
      trajPointsRef.current.push({ alt: s.alt, x: Math.min(0.8, xDrift), throttle: s.phase.throttle });
      dynHistoryRef.current.push({ t, q: s.q });
      LOG_EVENTS.forEach((ev) => {
        if (t >= ev.t && t < ev.t + 0.6 && lastLogTRef.current < ev.t) {
          setLog((prev) => [...prev, { t: Math.floor(t), msg: ev.msg, cls: ev.cls }]);
          lastLogTRef.current = ev.t;
        }
      });
      if (t >= 56 && t <= 63) setShowMaxQ(true); else setShowMaxQ(false);
      setState(s);
      setTick((k) => k + 1);
      drawTraj(); drawDynChart();
      if (t >= 200) { runningRef.current = false; setRunning(false); setLog((p) => [...p, { t: 200, msg: "Simulation complete", cls: "new" }]); }
    }, 80);
    return () => clearInterval(id);
  }, []);

  const fmt = (v: number, d = 1) => isNaN(v) ? "—" : v.toFixed(d);
  const mins = Math.floor(Math.max(0, tRef.current) / 60);
  const secs = Math.floor(Math.max(0, tRef.current) % 60);
  const clockStr = `T+${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;

  const startSim = () => {
    if (running || aborted) return;
    runningRef.current = true; setRunning(true);
    setLog((p) => [...p, { t: Math.floor(tRef.current), msg: "Launch sequence initiated", cls: "new" }]);
  };
  const resetSim = () => {
    runningRef.current = false; tRef.current = 0;
    trajPointsRef.current = []; dynHistoryRef.current = []; lastLogTRef.current = -1;
    setRunning(false); setAborted(false); setShowMaxQ(false);
    setLog([]); setState(getState(0)); setTick((k) => k + 1);
    drawTraj(); drawDynChart();
  };
  const abortSim = () => {
    runningRef.current = false; setRunning(false); setAborted(true);
    setLog((p) => [...p, { t: Math.floor(tRef.current), msg: "⊗ ABORT COMMAND RECEIVED", cls: "crit" }]);
  };

  const TEAL = "#00ffdf";
  const GOLD = "#ffd166";
  const RED = "#ff3b5c";
  const isMaxQ = tRef.current >= 54 && tRef.current <= 64;
  const dynColor = isMaxQ ? RED : state.q > 20000 ? GOLD : TEAL;
  const phaseColor = aborted ? RED : state.phase.color;
  const phaseName = aborted ? "ABORTED" : state.phase.name;

  const metric = (label: string, value: string, color = TEAL, testid?: string) => (
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", padding: "4px 0" }}>
      <span style={{ fontSize: 10, color: "rgba(255,255,255,0.65)", letterSpacing: "0.1em" }}>{label}</span>
      <span data-testid={testid} style={{ fontSize: 14, fontFamily: "'Syne Mono', monospace", color }}>{value}</span>
    </div>
  );

  const sectionLabel = (txt: string) => (
    <div style={{ fontSize: 9, letterSpacing: "0.3em", color: "rgba(0,229,200,0.45)", textTransform: "uppercase", borderBottom: "1px solid rgba(0,255,223,0.15)", paddingBottom: 6, marginBottom: 4 }}>{txt}</div>
  );

  const thrPct = Math.round(state.phase.throttle * 100);
  const stressColor = state.structLoad > 80 ? RED : state.structLoad > 50 ? GOLD : TEAL;

  return (
    <div style={{ background: "#000", color: TEAL, fontFamily: "'DM Mono', monospace", height: "100%", minHeight: "calc(100vh - 4rem)", overflow: "hidden", display: "grid", gridTemplateColumns: "320px 1fr 280px", gridTemplateRows: "auto 48px 1fr 200px" }} data-testid="ufo-ascent-root">
      {/* HEADER */}
      <header style={{ gridColumn: "1 / -1", display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 24px", borderBottom: "1px solid rgba(0,255,223,0.15)", background: "rgba(0,0,0,0.98)", zIndex: 10 }}>
        <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 15, fontWeight: 300, letterSpacing: "0.3em", textTransform: "uppercase", color: "#fff" }}>
          AETHER // <span style={{ color: TEAL }}>UFO ASCENT SIMULATION</span> // TRAJECTORY MODULE
        </div>
        <div style={{ fontSize: 11, letterSpacing: "0.15em", color: GOLD }}>
          <span style={{ width: 6, height: 6, borderRadius: "50%", background: TEAL, display: "inline-block", marginRight: 8, animation: "ufoPulse 1.2s ease-in-out infinite" }} />
          <span data-testid="clock-disp">{clockStr}</span>
        </div>
      </header>

      {/* LEFT PANEL */}
      <div style={{ borderRight: "1px solid rgba(0,255,223,0.15)", padding: 20, display: "flex", flexDirection: "column", gap: 16, overflow: "auto" }}>
        <div>
          {sectionLabel("Vehicle State")}
          {metric("ALTITUDE", fmt(state.alt) + " km", TEAL, "alt-val")}
          {metric("VELOCITY", fmt(state.vel, 0) + " m/s", TEAL, "vel-val")}
          {metric("MACH", "M " + fmt(state.mach, 2), TEAL, "mach-val")}
          {metric("ACCEL", fmt(state.accel, 2) + " G", TEAL, "accel-val")}
        </div>
        <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 20, fontWeight: 300, color: "rgba(255,255,255,0.6)", letterSpacing: "0.05em", textAlign: "center", padding: "10px 0", borderTop: "1px solid rgba(0,255,223,0.15)", borderBottom: "1px solid rgba(0,255,223,0.15)" }}>
          q = ½<span style={{ color: TEAL }}>ρ</span>v²
        </div>
        <div>
          {sectionLabel("Dynamics")}
          {metric("DYN PRESSURE", fmt(state.q, 0) + " Pa", dynColor, "dyn-val")}
          {metric("AIR DENSITY", fmt(state.rho, 4) + " kg/m³", TEAL)}
          {metric("DRAG FORCE", fmt(state.drag, 1) + " kN", TEAL)}
          {metric("STRUCT LOAD", fmt(state.structLoad, 1) + "%", stressColor, "stress-val")}
        </div>
        <div>
          {sectionLabel("Throttle")}
          <div style={{ marginTop: 2 }}>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 9, color: "rgba(255,255,255,0.3)", marginBottom: 4 }}>
              <span>ENGINE OUTPUT</span><span>{thrPct}%</span>
            </div>
            <div style={{ height: 4, background: "rgba(255,255,255,0.07)", borderRadius: 2, overflow: "hidden" }}>
              <div style={{ height: "100%", width: thrPct + "%", background: thrPct < 75 ? GOLD : TEAL, transition: "width 0.5s, background 0.5s" }} />
            </div>
          </div>
          <div style={{ marginTop: 8 }}>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 9, color: "rgba(255,255,255,0.3)", marginBottom: 4 }}>
              <span>HULL STRESS</span><span>{Math.round(state.structLoad)}%</span>
            </div>
            <div style={{ height: 4, background: "rgba(255,255,255,0.07)", borderRadius: 2, overflow: "hidden" }}>
              <div style={{ height: "100%", width: state.structLoad + "%", background: stressColor, transition: "width 0.5s, background 0.5s" }} />
            </div>
          </div>
        </div>
        <div style={{ padding: "10px 12px", border: "1px solid rgba(0,255,223,0.25)", background: "rgba(0,255,223,0.07)", borderRadius: 2 }}>
          <div data-testid="phase-name" style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 18, fontWeight: 600, color: phaseColor, letterSpacing: "0.05em", transition: "color 0.5s" }}>{phaseName}</div>
          <div style={{ fontSize: 9, color: "rgba(255,255,255,0.55)", marginTop: 4, letterSpacing: "0.08em", lineHeight: 1.6 }}>{state.phase.desc}</div>
        </div>
      </div>

      {/* CENTER CANVAS */}
      <div style={{ position: "relative", overflow: "hidden" }}>
        <canvas ref={trajRef} data-testid="traj-canvas" style={{ width: "100%", height: "100%", display: "block" }} />
        {showMaxQ && (
          <div style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%, -50%)", textAlign: "center", pointerEvents: "none", transition: "opacity 0.4s" }}>
            <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 48, fontWeight: 300, color: RED, letterSpacing: "0.1em", textShadow: "0 0 40px rgba(255,59,92,0.6)" }}>MAX Q</div>
            <div style={{ fontSize: 11, color: "rgba(255,59,92,0.7)", letterSpacing: "0.3em", marginTop: 4 }}>MAXIMUM DYNAMIC PRESSURE</div>
          </div>
        )}
        <div style={{ position: "absolute", right: 12, top: 10, bottom: 10, width: 36, display: "flex", flexDirection: "column", justifyContent: "space-between", alignItems: "flex-end" }}>
          {["400km", "300km", "200km", "100km", "50km", "0km"].map((m) => <span key={m} style={{ fontSize: 8, color: "rgba(0,255,223,0.55)", letterSpacing: "0.05em" }}>{m}</span>)}
        </div>
      </div>

      {/* RIGHT PANEL */}
      <div style={{ borderLeft: "1px solid rgba(0,255,223,0.15)", padding: 20, display: "flex", flexDirection: "column", gap: 14, overflow: "auto" }}>
        <div>
          {sectionLabel("Ascent Phases")}
          <div style={{ display: "flex", flexDirection: "column", gap: 6, marginTop: 4 }}>
            {PHASES.map((p, i) => (
              <div key={p.name} data-testid={`phase-${p.name.toLowerCase().replace(/[^a-z]/g, "-")}`} style={{ fontSize: 9, letterSpacing: "0.1em", padding: "3px 0", borderLeft: `2px solid ${p.color}`, paddingLeft: 8, opacity: i === state.phaseIdx ? 1 : 0.3, color: i === state.phaseIdx ? p.color : "rgba(0,229,200,0.4)", transition: "all 0.3s" }}>
                <span style={{ color: "rgba(255,255,255,0.5)" }}>T+{p.t < 0 ? "—" : p.t + "s"}</span>  {p.name}
              </div>
            ))}
          </div>
        </div>
        <div>
          {sectionLabel("Propulsion")}
          {metric("THRUST", fmt(state.thrust, 2) + " MN", TEAL)}
          {metric("ISP", state.isp > 0 ? fmt(state.isp, 0) + " s" : "—", TEAL)}
          {metric("FUEL MASS", fmt(state.fuel, 1) + "%", TEAL)}
        </div>
        <div>
          {sectionLabel("Environment")}
          {metric("TEMP", fmt(state.T - 273, 1) + " °C", TEAL)}
          {metric("PRESSURE", fmt(state.P / 1000, 2) + " kPa", TEAL)}
        </div>
      </div>

      {/* BOTTOM */}
      <div style={{ gridColumn: "1 / -1", borderTop: "1px solid rgba(0,255,223,0.15)", display: "grid", gridTemplateColumns: "320px 1fr 280px", overflow: "hidden" }}>
        <div data-testid="event-log" style={{ padding: "12px 20px", overflow: "auto", display: "flex", flexDirection: "column", gap: 3 }}>
          {sectionLabel("Event Log")}
          {log.length === 0 ? <div style={{ fontSize: 9, color: "rgba(0,229,200,0.4)" }}>— awaiting launch —</div> :
            log.map((l, i) => (
              <div key={i} style={{ fontSize: 9, letterSpacing: "0.08em", color: l.cls === "crit" ? RED : l.cls === "warn" ? GOLD : TEAL, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                T+{String(l.t).padStart(3, "0")}s  {l.msg}
              </div>
            ))
          }
        </div>
        <div style={{ padding: "12px 20px", position: "relative" }}>
          {sectionLabel("Dynamic Pressure — q(t)")}
          <canvas ref={dynRef} data-testid="dyn-canvas" style={{ width: "100%", height: "calc(100% - 30px)", display: "block" }} />
        </div>
        <div style={{ padding: "16px 20px", borderLeft: "1px solid rgba(0,255,223,0.15)", display: "flex", flexDirection: "column", justifyContent: "center", gap: 10 }}>
          <button data-testid="btn-launch" onClick={startSim} style={btn(running ? GOLD : TEAL)}>{running ? "● RUNNING" : "▶ LAUNCH"}</button>
          <button data-testid="btn-reset" onClick={resetSim} style={btn(TEAL)}>↺ RESET</button>
          <button data-testid="btn-abort" onClick={abortSim} style={btn(RED)}>⊗ ABORT</button>
        </div>
      </div>
      <style>{`@keyframes ufoPulse { 0%,100% { opacity: 1; transform: scale(1); } 50% { opacity: 0.3; transform: scale(0.7); } }`}</style>
    </div>
  );
}

function btn(color: string): React.CSSProperties {
  return { background: "transparent", border: `1px solid ${color}`, color, fontFamily: "'DM Mono', monospace", fontSize: 11, letterSpacing: "0.15em", padding: "8px 16px", cursor: "pointer", textTransform: "uppercase", transition: "all 0.2s" };
}
