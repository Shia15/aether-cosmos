import { useState, useEffect, useRef } from "react";
import heroImg from "@assets/ChatGPT_Image_Jun_28,_2026,_01_03_43_PM_1782666242276.png";

const C = {
  bg:     "#04060E",
  panel:  "rgba(8,12,24,0.85)",
  border: "rgba(0,229,192,0.12)",
  aurora: "#00FFB2",
  gold:   "#C8A030",
  violet: "#9966ff",
  rose:   "#ff4488",
  cyan:   "#00FFEE",
  blue:   "#4488ff",
  steel:  "#9fb2c8",
  dim:    "#2a4060",
  text:   "rgba(200,230,255,0.78)",
};

type Particle = { x: number; y: number; vx: number; life: number };
type Topo = "linear" | "branched" | "mesh" | "vertical";
type Node = { x: number; y: number };
type TopoDef = { nodes: Node[]; edges: [number, number][]; label: string; desc: string };

const PHASES = ["PRESSURIZE", "LAUNCH", "GLIDE"];

// topology layouts (normalized 0..1 coordinates)
const TOPOS: Record<Topo, TopoDef> = {
  linear: {
    label: "Linear",
    desc: "Point-to-point spine. Simplest route, maximum throughput between two ports.",
    nodes: [{ x: 0.1, y: 0.5 }, { x: 0.32, y: 0.5 }, { x: 0.54, y: 0.5 }, { x: 0.76, y: 0.5 }, { x: 0.9, y: 0.5 }],
    edges: [[0, 1], [1, 2], [2, 3], [3, 4]],
  },
  branched: {
    label: "Branched",
    desc: "Trunk with offshoots. Serves clustered destinations from a shared backbone.",
    nodes: [{ x: 0.12, y: 0.5 }, { x: 0.38, y: 0.5 }, { x: 0.62, y: 0.28 }, { x: 0.62, y: 0.72 }, { x: 0.88, y: 0.28 }, { x: 0.88, y: 0.72 }],
    edges: [[0, 1], [1, 2], [1, 3], [2, 4], [3, 5]],
  },
  mesh: {
    label: "Mesh",
    desc: "Fully cross-linked grid. Redundant paths -- failure of any node reroutes instantly.",
    nodes: [{ x: 0.2, y: 0.25 }, { x: 0.5, y: 0.2 }, { x: 0.8, y: 0.25 }, { x: 0.2, y: 0.75 }, { x: 0.5, y: 0.8 }, { x: 0.8, y: 0.75 }, { x: 0.5, y: 0.5 }],
    edges: [[0, 1], [1, 2], [3, 4], [4, 5], [0, 6], [2, 6], [3, 6], [5, 6], [1, 6], [4, 6]],
  },
  vertical: {
    label: "Vertical Stack",
    desc: "Layered floors connected by risers. Maximizes routes within a small footprint.",
    nodes: [{ x: 0.3, y: 0.2 }, { x: 0.7, y: 0.2 }, { x: 0.3, y: 0.5 }, { x: 0.7, y: 0.5 }, { x: 0.3, y: 0.8 }, { x: 0.7, y: 0.8 }],
    edges: [[0, 1], [2, 3], [4, 5], [0, 2], [2, 4], [1, 3], [3, 5]],
  },
};

// ─── Propulsion Simulator ─────────────────────────────────────────────────────

function PropulsionCanvas({ pressure, friction, mass, onTelemetry }:
  { pressure: number; friction: number; mass: number; onTelemetry: (v: number, p: number, phase: number) => void }) {
  const ref = useRef<HTMLCanvasElement>(null);
  const raf = useRef(0);
  const pRef = useRef(pressure); useEffect(() => { pRef.current = pressure; }, [pressure]);
  const fRef = useRef(friction); useEffect(() => { fRef.current = friction; }, [friction]);
  const mRef = useRef(mass);     useEffect(() => { mRef.current = mass; }, [mass]);
  const tRef = useRef(onTelemetry); useEffect(() => { tRef.current = onTelemetry; }, [onTelemetry]);

  useEffect(() => {
    const canvas = ref.current; if (!canvas) return;
    const ctx = canvas.getContext("2d"); if (!ctx) return;
    const W = 880, H = 240;
    canvas.width = W; canvas.height = H;
    const tubeY = H / 2;
    const tubeR = 42;
    const startX = 110, endX = W - 90;

    let x = startX, v = 0, P = 0, phase = 0, phaseT = 0;
    const parts: Particle[] = [];
    let tick = 0;

    const reset = () => { x = startX; v = 0; P = 0; phase = 0; phaseT = 0; parts.length = 0; };

    const draw = () => {
      tick++;
      const setP = pRef.current, fr = fRef.current, m = mRef.current;

      // ── physics state machine ──
      if (phase === 0) { // pressurize
        P += setP * 0.012;
        phaseT++;
        if (tick % 2 === 0) parts.push({ x: x - 30 - Math.random() * 40, y: tubeY + (Math.random() - 0.5) * tubeR * 1.2, vx: 0.5 + Math.random(), life: 1 });
        if (P >= setP || phaseT > 140) { phase = 1; phaseT = 0; }
      } else if (phase === 1) { // launch
        const force = P * 0.06;
        v += (force - v * fr) / (m + 0.5);
        x += v;
        P *= 0.94;
        phaseT++;
        for (let i = 0; i < 3; i++) parts.push({ x: x - 35, y: tubeY + (Math.random() - 0.5) * tubeR * 1.1, vx: v * 0.8 + 1, life: 1 });
        if (phaseT > 40 || P < setP * 0.1) { phase = 2; phaseT = 0; }
      } else { // glide
        v -= v * fr * 0.04 + 0.02;
        if (v < 0) v = 0;
        x += v;
        if (x > endX) x = endX;
        if (x >= endX || (v <= 0.02 && phaseT > 30)) { reset(); }
        phaseT++;
      }

      // particle update
      for (let i = parts.length - 1; i >= 0; i--) {
        const p = parts[i];
        p.x += p.vx; p.life -= 0.012;
        if (p.life <= 0 || p.x > endX + 20) parts.splice(i, 1);
      }

      tRef.current(v, P, phase);

      // ── render ──
      ctx.fillStyle = C.bg;
      ctx.fillRect(0, 0, W, H);

      // tube body
      const tg = ctx.createLinearGradient(0, tubeY - tubeR, 0, tubeY + tubeR);
      tg.addColorStop(0, "rgba(60,80,110,0.12)");
      tg.addColorStop(0.5, "rgba(0,255,238,0.05)");
      tg.addColorStop(1, "rgba(60,80,110,0.12)");
      ctx.fillStyle = tg;
      ctx.fillRect(startX - 50, tubeY - tubeR, endX - startX + 90, tubeR * 2);
      ctx.strokeStyle = "rgba(159,178,200,0.3)"; ctx.lineWidth = 1.5;
      ctx.strokeRect(startX - 50, tubeY - tubeR, endX - startX + 90, tubeR * 2);
      // tube ribs
      ctx.strokeStyle = "rgba(159,178,200,0.12)"; ctx.lineWidth = 1;
      for (let rx = startX - 30; rx < endX + 50; rx += 46) {
        ctx.beginPath(); ctx.moveTo(rx, tubeY - tubeR); ctx.lineTo(rx, tubeY + tubeR); ctx.stroke();
      }

      // launch chamber (left) + port (right)
      ctx.fillStyle = "rgba(0,255,178,0.06)";
      ctx.fillRect(startX - 50, tubeY - tubeR, 46, tubeR * 2);
      ctx.fillStyle = C.dim; ctx.font = "8px 'DM Mono',monospace"; ctx.textAlign = "center";
      ctx.fillText("CHAMBER", startX - 27, tubeY - tubeR - 8);
      ctx.fillText("PORT", endX + 18, tubeY - tubeR - 8);

      // air particles
      parts.forEach(p => {
        ctx.beginPath(); ctx.arc(p.x, p.y, 1.6, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(0,255,238,${p.life * 0.6})`;
        ctx.fill();
      });

      // pressure cloud behind pod (during pressurize/launch)
      if (phase <= 1) {
        const cloud = ctx.createRadialGradient(x - 40, tubeY, 0, x - 40, tubeY, 60);
        const inten = Math.min(1, P / Math.max(1, setP));
        cloud.addColorStop(0, `rgba(255,68,136,${0.25 * inten})`);
        cloud.addColorStop(1, "rgba(255,68,136,0)");
        ctx.fillStyle = cloud;
        ctx.fillRect(x - 100, tubeY - tubeR, 100, tubeR * 2);
      }

      // pod (capsule with nose)
      ctx.save();
      ctx.translate(x, tubeY);
      const podL = 28, podH = 22;
      const grad = ctx.createLinearGradient(0, -podH, 0, podH);
      grad.addColorStop(0, "#c8d6e8");
      grad.addColorStop(0.5, C.steel);
      grad.addColorStop(1, "#5a6b80");
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.moveTo(-podL, -podH);
      ctx.lineTo(podL - 8, -podH);
      ctx.quadraticCurveTo(podL + 10, 0, podL - 8, podH);
      ctx.lineTo(-podL, podH);
      ctx.quadraticCurveTo(-podL - 8, 0, -podL, -podH);
      ctx.closePath();
      ctx.fill();
      ctx.strokeStyle = "rgba(255,255,255,0.35)"; ctx.lineWidth = 1; ctx.stroke();
      // window
      ctx.beginPath(); ctx.arc(2, 0, 6, 0, Math.PI * 2);
      ctx.fillStyle = phase === 1 ? C.aurora : C.cyan;
      ctx.shadowBlur = 10; ctx.shadowColor = ctx.fillStyle; ctx.fill(); ctx.shadowBlur = 0;
      ctx.restore();

      raf.current = requestAnimationFrame(draw);
    };
    draw();
    return () => cancelAnimationFrame(raf.current);
  }, []);

  return <canvas ref={ref} style={{ width: "100%", height: "auto", display: "block", borderRadius: 8 }} />;
}

// ─── Topology Canvas ──────────────────────────────────────────────────────────

function TopoCanvas({ topo }: { topo: Topo }) {
  const ref = useRef<HTMLCanvasElement>(null);
  const raf = useRef(0);
  const topoRef = useRef(topo); useEffect(() => { topoRef.current = topo; }, [topo]);

  useEffect(() => {
    const canvas = ref.current; if (!canvas) return;
    const ctx = canvas.getContext("2d"); if (!ctx) return;
    const W = 420, H = 300;
    canvas.width = W; canvas.height = H;
    const pad = 30;
    let t = 0;

    const draw = () => {
      ctx.fillStyle = "rgba(4,6,14,0.3)";
      ctx.fillRect(0, 0, W, H);
      const def = TOPOS[topoRef.current];
      const px = (n: Node) => pad + n.x * (W - pad * 2);
      const py = (n: Node) => pad + n.y * (H - pad * 2);

      // edges
      def.edges.forEach(([a, b]) => {
        const na = def.nodes[a], nb = def.nodes[b];
        ctx.beginPath(); ctx.moveTo(px(na), py(na)); ctx.lineTo(px(nb), py(nb));
        ctx.strokeStyle = "rgba(0,255,238,0.18)"; ctx.lineWidth = 2; ctx.stroke();
      });
      // traveling pods along each edge
      def.edges.forEach(([a, b], i) => {
        const na = def.nodes[a], nb = def.nodes[b];
        const prog = ((t * 0.01 + i * 0.27) % 1);
        const x = px(na) + (px(nb) - px(na)) * prog;
        const y = py(na) + (py(nb) - py(na)) * prog;
        ctx.beginPath(); ctx.arc(x, y, 2.5, 0, Math.PI * 2);
        ctx.fillStyle = C.aurora; ctx.shadowBlur = 6; ctx.shadowColor = C.aurora; ctx.fill(); ctx.shadowBlur = 0;
      });
      // nodes
      def.nodes.forEach((n, i) => {
        const x = px(n), y = py(n);
        const r = 7 + 1.5 * Math.sin(t * 0.05 + i);
        const g = ctx.createRadialGradient(x, y, 0, x, y, r * 2);
        g.addColorStop(0, "rgba(153,102,255,0.9)");
        g.addColorStop(1, "rgba(153,102,255,0)");
        ctx.beginPath(); ctx.arc(x, y, r * 2, 0, Math.PI * 2); ctx.fillStyle = g; ctx.fill();
        ctx.beginPath(); ctx.arc(x, y, r * 0.5, 0, Math.PI * 2); ctx.fillStyle = C.violet; ctx.fill();
      });
      t++;
      raf.current = requestAnimationFrame(draw);
    };
    draw();
    return () => cancelAnimationFrame(raf.current);
  }, []);

  return <canvas ref={ref} style={{ width: "100%", height: "auto", display: "block", borderRadius: 8 }} />;
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function AirNanotubePage() {
  const [pressure, setPressure] = useState(60);
  const [friction, setFriction] = useState(0.25);
  const [mass, setMass] = useState(1);
  const [topo, setTopo] = useState<Topo>("branched");
  const [vel, setVel] = useState(0);
  const [pDiff, setPDiff] = useState(0);
  const [phase, setPhase] = useState(0);

  // throttle telemetry to ~10fps via interval reading latest from a ref
  const teleRef = useRef({ v: 0, p: 0, ph: 0 });
  const handleTele = (v: number, p: number, ph: number) => { teleRef.current = { v, p, ph }; };
  useEffect(() => {
    const id = setInterval(() => {
      setVel(teleRef.current.v);
      setPDiff(teleRef.current.p);
      setPhase(teleRef.current.ph);
    }, 100);
    return () => clearInterval(id);
  }, []);

  // glide efficiency is governed by tube friction: lower friction -> longer coast
  const efficiency = Math.round((1 - friction * 0.7) * 100);

  const panel = { background: C.panel, border: `1px solid ${C.border}`, borderRadius: 12 };
  const slider = (label: string, val: number, set: (v: number) => void, col: string, min: number, max: number, step: number, fmt: string) => (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", fontSize: 9, marginBottom: 5 }}>
        <span style={{ color: C.dim }}>{label}</span>
        <span style={{ color: col }}>{fmt}</span>
      </div>
      <input type="range" min={min} max={max} step={step} value={val}
        onChange={e => set(Number(e.target.value))} style={{ width: "100%", accentColor: col }} />
    </div>
  );

  const ROBOTS = [
    { k: "Inspection", c: C.cyan,   t: "Crawl tube interiors scanning for micro-fractures and pressure leaks." },
    { k: "Maintenance", c: C.aurora, t: "Service airlocks and seals in place, no system shutdown required." },
    { k: "Sampling", c: C.gold,    t: "Collect environmental samples from underwater and underground runs." },
    { k: "Repair", c: C.rose,      t: "Weld, patch, and re-seal damaged segments autonomously." },
    { k: "Transport", c: C.violet, t: "Carry cargo or payload pods between nodes on demand." },
    { k: "Surveillance", c: C.blue, t: "Persistent monitoring with onboard sensors and optional manipulator arm." },
  ];
  const ADV = [
    { k: "Safe & Contained", c: C.aurora, t: "Air, not water -- no flooding risk, and pressure stays sealed inside the tube." },
    { k: "Energy Efficient", c: C.cyan,   t: "Pressure differential does the work; glide phase coasts with minimal friction." },
    { k: "Scalable & Modular", c: C.violet, t: "Add nodes and tubes like building blocks; the network grows organically." },
    { k: "Versatile", c: C.gold,          t: "Same architecture serves inspection bots, cargo pods, and crewed capsules." },
    { k: "Low Impact", c: C.rose,         t: "Bendable routing threads around terrain and habitats with a tiny footprint." },
  ];

  return (
    <div style={{ background: C.bg, minHeight: "100vh", color: C.text, fontFamily: "'DM Mono',monospace" }}>
      <div style={{ padding: "2rem 2.5rem 1.2rem", borderBottom: `1px solid ${C.border}` }}>
        <div style={{ fontSize: 8, letterSpacing: "0.4em", color: C.dim, textTransform: "uppercase", marginBottom: 6 }}>
          AETHER · PNEUMATIC TRANSPORT ARCHITECTURE
        </div>
        <h1 style={{
          margin: 0, fontSize: 32, letterSpacing: "0.08em", fontFamily: "'Orbitron','Cinzel',sans-serif",
          background: `linear-gradient(135deg, ${C.cyan}, ${C.aurora}, ${C.steel})`,
          WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
        }}>
          Air Nanotube Transport
        </h1>
        <p style={{ margin: "8px 0 0", fontSize: 11, color: "rgba(200,230,255,0.35)", lineHeight: 1.6, maxWidth: 680 }}>
          Where water-pressure transport floods on failure, an air-nanotube network glides on a pressure differential -- safer, energy-light, and reconfigurable. A flexible, programmable, mini-robotic mechanistic ethos for underwater and underground routes.
        </p>
        <div style={{ display: "flex", gap: 8, marginTop: 12, flexWrap: "wrap" }}>
          {["Air Pressure Propulsion", "Modular & Programmable", "Flexible Architecture", "Mini Robotic Ethos", "Underwater / Underground"].map(t => (
            <span key={t} style={{ fontSize: 8, padding: "3px 9px", borderRadius: 20, border: `1px solid ${C.border}`, color: C.aurora, letterSpacing: "0.1em" }}>{t}</span>
          ))}
        </div>
      </div>

      <div style={{ padding: "1.5rem 2.5rem", display: "flex", flexDirection: "column", gap: "1.4rem" }}>

        {/* Propulsion simulator */}
        <div style={{ ...panel, padding: "1.2rem 1.3rem" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 12, flexWrap: "wrap", gap: 8 }}>
            <div style={{ fontSize: 9, color: C.cyan, letterSpacing: "0.25em", textTransform: "uppercase" }}>
              Pressure Propulsion Simulator
            </div>
            <div style={{ display: "flex", gap: 6 }}>
              {PHASES.map((p, i) => (
                <span key={p} style={{
                  fontSize: 8, padding: "3px 10px", borderRadius: 6, letterSpacing: "0.12em",
                  border: `1px solid ${phase === i ? C.aurora : C.border}`,
                  background: phase === i ? `${C.aurora}1a` : "transparent",
                  color: phase === i ? C.aurora : C.dim,
                }}>{i + 1}. {p}</span>
              ))}
            </div>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 280px", gap: "1.2rem", alignItems: "start" }}>
            <PropulsionCanvas pressure={pressure} friction={friction} mass={mass} onTelemetry={handleTele} />
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8 }}>
                {[
                  { l: "Velocity", v: vel.toFixed(1), u: "m/s", c: C.aurora },
                  { l: "Pressure Δ", v: pDiff.toFixed(0), u: "kPa", c: C.rose },
                  { l: "Glide Eff.", v: efficiency + "", u: "%", c: C.cyan },
                ].map(r => (
                  <div key={r.l} style={{ border: `1px solid ${C.border}`, borderRadius: 6, padding: "7px 6px", textAlign: "center" }}>
                    <div style={{ fontSize: 14, color: r.c }}>{r.v}</div>
                    <div style={{ fontSize: 7, color: C.dim }}>{r.l} {r.u}</div>
                  </div>
                ))}
              </div>
              {slider("Chamber Pressure", pressure, setPressure, C.rose, 20, 100, 1, pressure + " kPa")}
              {slider("Tube Friction", friction, setFriction, C.gold, 0.05, 0.6, 0.01, friction.toFixed(2))}
              {slider("Pod Mass", mass, setMass, C.violet, 0.3, 3, 0.1, mass.toFixed(1) + " t")}
              <div style={{ fontSize: 7.5, color: "rgba(200,230,255,0.3)", lineHeight: 1.6 }}>
                Air is compressed behind the pod, a pressure differential launches it, then it glides with near-zero friction. Lower pressure or higher friction shortens the glide -- raise pressure for range, drop friction for efficiency.
              </div>
            </div>
          </div>
        </div>

        {/* System architecture pipeline */}
        <div style={{ ...panel, padding: "1.2rem 1.5rem" }}>
          <div style={{ fontSize: 9, color: C.aurora, letterSpacing: "0.25em", textTransform: "uppercase", marginBottom: 14 }}>
            System Architecture
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap" }}>
            {["Air Inlet", "Launch Chamber", "Tube Network", "Airlock / Node", "Destination Port"].map((s, i, arr) => (
              <div key={s} style={{ display: "flex", alignItems: "center", gap: 6, flex: "1 1 auto" }}>
                <div style={{
                  flex: 1, textAlign: "center", padding: "0.7rem 0.5rem", borderRadius: 8,
                  border: `1px solid ${C.border}`, background: "rgba(0,255,238,0.04)",
                  fontSize: 9, color: C.text, minWidth: 90,
                }}>{s}</div>
                {i < arr.length - 1 && <span style={{ color: C.aurora, fontSize: 14 }}>&rarr;</span>}
              </div>
            ))}
          </div>
        </div>

        {/* Topology + flexible/programmable */}
        <div style={{ display: "grid", gridTemplateColumns: "440px 1fr", gap: "1.4rem" }}>
          <div style={{ ...panel, padding: "1.2rem 1.3rem" }}>
            <div style={{ fontSize: 9, color: C.violet, letterSpacing: "0.25em", textTransform: "uppercase", marginBottom: 12 }}>
              Tube Network Topology
            </div>
            <div style={{ display: "flex", gap: 6, marginBottom: 12, flexWrap: "wrap" }}>
              {(Object.keys(TOPOS) as Topo[]).map(k => (
                <button key={k} onClick={() => setTopo(k)} style={{
                  fontSize: 9, padding: "5px 12px", borderRadius: 6, cursor: "pointer",
                  border: `1px solid ${topo === k ? C.violet : C.border}`,
                  background: topo === k ? `${C.violet}1a` : "transparent",
                  color: topo === k ? C.violet : C.dim, fontFamily: "'DM Mono',monospace",
                }}>{TOPOS[k].label}</button>
              ))}
            </div>
            <TopoCanvas topo={topo} />
            <p style={{ fontSize: 9.5, color: "rgba(200,230,255,0.45)", lineHeight: 1.6, marginTop: 10, marginBottom: 0 }}>
              {TOPOS[topo].desc}
            </p>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: "0.9rem" }}>
            <div style={{ ...panel, padding: "1rem 1.2rem", borderLeft: `3px solid ${C.aurora}` }}>
              <div style={{ fontSize: 9, color: C.aurora, letterSpacing: "0.15em", textTransform: "uppercase", marginBottom: 8 }}>Flexible Architecture</div>
              <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
                {["Bendable tubes", "Adaptive routing", "Reconfigurable system"].map(t => (
                  <span key={t} style={{ fontSize: 9.5, color: "rgba(200,230,255,0.5)" }}>&middot; {t}</span>
                ))}
              </div>
            </div>
            <div style={{ ...panel, padding: "1rem 1.2rem", borderLeft: `3px solid ${C.cyan}` }}>
              <div style={{ fontSize: 9, color: C.cyan, letterSpacing: "0.15em", textTransform: "uppercase", marginBottom: 8 }}>Programmable System Logic</div>
              <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
                {["Route optimization", "Pod scheduling", "Real-time monitoring", "Failsafe protocols"].map(t => (
                  <span key={t} style={{ fontSize: 9.5, color: "rgba(200,230,255,0.5)" }}>&middot; {t}</span>
                ))}
              </div>
            </div>
            <div style={{ ...panel, padding: "1rem 1.2rem", borderLeft: `3px solid ${C.gold}` }}>
              <div style={{ fontSize: 9, color: C.gold, letterSpacing: "0.15em", textTransform: "uppercase", marginBottom: 8 }}>Airlock / Node Detail</div>
              <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
                {["Pressure gate", "Control interface", "Pod docking ring", "Tube connections"].map(t => (
                  <span key={t} style={{ fontSize: 9.5, color: "rgba(200,230,255,0.5)" }}>&middot; {t}</span>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Hero reference */}
        <div style={{ ...panel, overflow: "hidden" }}>
          <img src={heroImg} alt="Air Nanotube Transport System concept sketches" style={{ width: "100%", display: "block" }} />
        </div>

        {/* Mini robot roles */}
        <div>
          <div style={{ fontSize: 9, color: C.steel, letterSpacing: "0.25em", textTransform: "uppercase", marginBottom: 12 }}>
            Mini Robot &middot; Mechanistic Ethos
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "0.8rem" }}>
            {ROBOTS.map(r => (
              <div key={r.k} style={{ ...panel, padding: "0.9rem 1rem", borderTop: `2px solid ${r.c}` }}>
                <div style={{ fontSize: 10, color: r.c, letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 5 }}>{r.k}</div>
                <p style={{ fontSize: 9, color: "rgba(200,230,255,0.42)", lineHeight: 1.6, margin: 0 }}>{r.t}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Key advantages */}
        <div>
          <div style={{ fontSize: 9, color: C.aurora, letterSpacing: "0.25em", textTransform: "uppercase", marginBottom: 12 }}>
            Key Advantages
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: "0.7rem" }}>
            {ADV.map(a => (
              <div key={a.k} style={{ ...panel, padding: "0.9rem 0.8rem", textAlign: "center" }}>
                <div style={{
                  width: 30, height: 30, margin: "0 auto 8px", borderRadius: "50%",
                  border: `1px solid ${a.c}`, boxShadow: `0 0 10px ${a.c}55`,
                }} />
                <div style={{ fontSize: 9, color: a.c, marginBottom: 5 }}>{a.k}</div>
                <p style={{ fontSize: 8, color: "rgba(200,230,255,0.38)", lineHeight: 1.5, margin: 0 }}>{a.t}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
