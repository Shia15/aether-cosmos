import { useEffect, useRef, useState } from "react";

const LAYERS = {
  mnesis:   { name: "MNESIS",   role: "Persistent memory · mycelium threads",      color: "#00f5c8", y: [0.0, 0.25] as const },
  aletheia: { name: "ALETHEIA", role: "Deterministic logic · current flow",        color: "#4db8ff", y: [0.25, 0.5] as const },
  infernia: { name: "INFERNIA", role: "MHD transformation · ferrofluid spikes",    color: "#ff6b35", y: [0.5, 0.75] as const },
  reverie:  { name: "REVERIE",  role: "Bioluminescent inference · particles",      color: "#c77dff", y: [0.75, 1.0] as const },
};

type LayerKey = keyof typeof LAYERS;
const ORDER: LayerKey[] = ["mnesis", "aletheia", "infernia", "reverie"];

type Particle = { x: number; y: number; vx: number; vy: number; life: number; r: number; color: string };
type Signal   = { x: number; y: number; layer: LayerKey; t: number };

export default function SymphonicProtocolView() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const runningRef = useRef(true);
  const rafRef = useRef(0);
  const tRef = useRef(0);
  const frameRef = useRef(0);
  const particlesRef = useRef<Particle[]>([]);
  const signalsRef = useRef<Signal[]>([]);
  const myceliumRef = useRef<{ from: { x: number; y: number; phase: number }; to: { x: number; y: number; phase: number }; opacity: number }[]>([]);
  const ferroRef = useRef<{ x: number; y: number; vx: number; vy: number; r: number; phase: number }[]>([]);
  const starsRef = useRef<{ x: number; y: number; r: number; tw: number }[]>([]);

  const [active, setActive] = useState<LayerKey>("mnesis");
  const [running, setRunning] = useState(true);
  const [signalCount, setSignalCount] = useState(0);

  const init = (W: number, H: number) => {
    starsRef.current = Array.from({ length: 80 }, () => ({
      x: Math.random() * W, y: Math.random() * H,
      r: Math.random() * 1.2, tw: Math.random() * Math.PI * 2,
    }));
    // mycelium nodes (top half)
    const myNodes = Array.from({ length: 14 }, () => ({
      x: Math.random() * W,
      y: LAYERS.mnesis.y[0] * H + Math.random() * (LAYERS.mnesis.y[1] - LAYERS.mnesis.y[0]) * H,
      phase: Math.random() * Math.PI * 2,
    }));
    const myc: typeof myceliumRef.current = [];
    for (let i = 0; i < myNodes.length; i++) {
      for (let j = i + 1; j < myNodes.length; j++) {
        const d = Math.hypot(myNodes[i].x - myNodes[j].x, myNodes[i].y - myNodes[j].y);
        if (d < W * 0.25) myc.push({ from: myNodes[i], to: myNodes[j], opacity: 0.4 + Math.random() * 0.4 });
      }
    }
    myceliumRef.current = myc;
    // ferro drops in infernia
    ferroRef.current = Array.from({ length: 5 }, () => ({
      x: Math.random() * W,
      y: LAYERS.infernia.y[0] * H + Math.random() * (LAYERS.infernia.y[1] - LAYERS.infernia.y[0]) * H,
      vx: 0, vy: 0,
      r: 5 + Math.random() * 3,
      phase: Math.random() * Math.PI * 2,
    }));
    particlesRef.current = [];
    signalsRef.current = [];
  };

  useEffect(() => {
    const c = canvasRef.current; if (!c) return;
    const ctx = c.getContext("2d"); if (!ctx) return;
    const resize = () => {
      const r = c.parentElement!.getBoundingClientRect();
      c.width = r.width; c.height = Math.max(560, r.height);
    };
    resize();
    init(c.width, c.height);
    const onR = () => { resize(); init(c.width, c.height); };
    window.addEventListener("resize", onR);

    const draw = () => {
      if (!runningRef.current) { rafRef.current = requestAnimationFrame(draw); return; }
      const W = c.width, H = c.height;
      tRef.current += 0.016; frameRef.current++;
      const t = tRef.current;

      ctx.fillStyle = "#03050a";
      ctx.fillRect(0, 0, W, H);

      // background stars
      starsRef.current.forEach((s) => {
        const tw = (Math.sin(t * 1.4 + s.tw) + 1) / 2;
        ctx.fillStyle = `rgba(180,200,230,${0.2 + tw * 0.5})`;
        ctx.beginPath(); ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2); ctx.fill();
      });

      // layer bands
      ORDER.forEach((key) => {
        const l = LAYERS[key];
        const y0 = l.y[0] * H, y1 = l.y[1] * H;
        const grd = ctx.createLinearGradient(0, y0, 0, y1);
        grd.addColorStop(0, hexA(l.color, 0.05));
        grd.addColorStop(1, hexA(l.color, 0.012));
        ctx.fillStyle = grd; ctx.fillRect(0, y0, W, y1 - y0);
        // wavy divider
        if (key !== "mnesis") {
          ctx.beginPath();
          for (let i = 0; i <= 8; i++) {
            const px = (i / 8) * W;
            const py = y0 + Math.sin(t * 0.5 + i * 1.1) * 1.4;
            i === 0 ? ctx.moveTo(px, py) : ctx.lineTo(px, py);
          }
          ctx.strokeStyle = hexA(l.color, 0.13); ctx.lineWidth = 0.6; ctx.stroke();
        }
        // label
        ctx.font = "9px 'Share Tech Mono', monospace";
        ctx.fillStyle = hexA(l.color, key === active ? 0.9 : 0.35);
        ctx.fillText(l.name + " · " + l.role, 12, y0 + 14);
      });

      // mycelium threads
      myceliumRef.current.forEach((m) => {
        const pulse = (Math.sin(t * 0.8 + m.from.phase) + 1) / 2;
        ctx.beginPath();
        ctx.moveTo(m.from.x, m.from.y);
        const mx = (m.from.x + m.to.x) / 2 + Math.sin(t + m.from.phase) * 8;
        const my = (m.from.y + m.to.y) / 2 + Math.cos(t * 0.7 + m.from.phase) * 6;
        ctx.quadraticCurveTo(mx, my, m.to.x, m.to.y);
        ctx.strokeStyle = hexA(LAYERS.mnesis.color, m.opacity * (0.4 + pulse * 0.6));
        ctx.lineWidth = 0.5; ctx.stroke();
      });

      // aletheia logic currents (horizontal flowing dashes)
      ctx.strokeStyle = hexA(LAYERS.aletheia.color, 0.35);
      ctx.lineWidth = 0.7;
      const yA0 = LAYERS.aletheia.y[0] * H, yA1 = LAYERS.aletheia.y[1] * H;
      for (let i = 0; i < 4; i++) {
        const y = yA0 + ((i + 0.5) / 4) * (yA1 - yA0);
        ctx.setLineDash([6, 14]);
        ctx.lineDashOffset = -t * 30 - i * 7;
        ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke();
      }
      ctx.setLineDash([]);

      // ferro drops (infernia)
      ferroRef.current.forEach((fd) => {
        // attracted to recent infernia signals
        signalsRef.current.filter((s) => s.layer === "infernia").forEach((s) => {
          const dx = s.x - fd.x, dy = s.y - fd.y, d = Math.hypot(dx, dy);
          if (d < 110 && d > 1) { fd.vx += dx / d * 0.04; fd.vy += dy / d * 0.04; }
        });
        fd.vx *= 0.94; fd.vy *= 0.94;
        fd.x += fd.vx; fd.y += fd.vy;
        const yI0 = LAYERS.infernia.y[0] * H, yI1 = LAYERS.infernia.y[1] * H;
        fd.x = Math.max(fd.r, Math.min(W - fd.r, fd.x));
        fd.y = Math.max(yI0 + fd.r, Math.min(yI1 - fd.r, fd.y));
        const spikes = 5;
        const mag = Math.min(1, Math.hypot(fd.vx, fd.vy) * 6);
        ctx.save(); ctx.translate(fd.x, fd.y);
        ctx.rotate(Math.atan2(fd.vy, fd.vx));
        ctx.beginPath();
        for (let i = 0; i < spikes * 2; i++) {
          const a = (i / spikes) * Math.PI - Math.PI / 2;
          const r2 = i % 2 === 0 ? fd.r * (1 + mag * 0.7) : fd.r * 0.5;
          i === 0 ? ctx.moveTo(Math.cos(a) * r2, Math.sin(a) * r2) : ctx.lineTo(Math.cos(a) * r2, Math.sin(a) * r2);
        }
        ctx.closePath();
        const fg = ctx.createRadialGradient(0, 0, 0, 0, 0, fd.r * 1.5);
        fg.addColorStop(0, hexA(LAYERS.infernia.color, 0.9));
        fg.addColorStop(1, hexA(LAYERS.infernia.color, 0.05));
        ctx.fillStyle = fg; ctx.fill();
        ctx.restore();
      });

      // bioluminescent particles (reverie) - spawn occasionally
      if (frameRef.current % 5 === 0) {
        const yR0 = LAYERS.reverie.y[0] * H, yR1 = LAYERS.reverie.y[1] * H;
        for (let i = 0; i < 2; i++) {
          particlesRef.current.push({
            x: Math.random() * W, y: yR0 + Math.random() * (yR1 - yR0),
            vx: (Math.random() - 0.5) * 0.4, vy: (Math.random() - 0.4) * 0.5 - 0.1,
            life: 1, r: Math.random() * 2 + 0.6, color: LAYERS.reverie.color,
          });
        }
      }
      particlesRef.current = particlesRef.current.filter((p) => p.life > 0.04);
      particlesRef.current.forEach((p) => {
        p.x += p.vx; p.y += p.vy; p.life -= 0.011;
        const grd = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.r * 5);
        grd.addColorStop(0, hexA(p.color, p.life * 0.7));
        grd.addColorStop(1, hexA(p.color, 0));
        ctx.fillStyle = grd;
        ctx.beginPath(); ctx.arc(p.x, p.y, p.r * 5, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = hexA(p.color, p.life);
        ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2); ctx.fill();
      });

      // signals (user clicks)
      signalsRef.current = signalsRef.current.filter((s) => s.t > 0.05);
      signalsRef.current.forEach((s) => {
        s.t -= 0.02;
        const cfg = LAYERS[s.layer];
        ctx.strokeStyle = hexA(cfg.color, s.t * 0.7);
        ctx.lineWidth = 1.5;
        ctx.beginPath(); ctx.arc(s.x, s.y, (1 - s.t) * 60, 0, Math.PI * 2); ctx.stroke();
      });

      rafRef.current = requestAnimationFrame(draw);
    };
    rafRef.current = requestAnimationFrame(draw);
    return () => { cancelAnimationFrame(rafRef.current); window.removeEventListener("resize", onR); };
  }, []);

  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const c = canvasRef.current; if (!c) return;
    const rect = c.getBoundingClientRect();
    const x = e.clientX - rect.left, y = e.clientY - rect.top;
    // determine layer from y
    const ratio = y / rect.height;
    const layer: LayerKey = ratio < 0.25 ? "mnesis" : ratio < 0.5 ? "aletheia" : ratio < 0.75 ? "infernia" : "reverie";
    signalsRef.current.push({ x: x * (c.width / rect.width), y: y * (c.height / rect.height), layer, t: 1 });
    setActive(layer);
    setSignalCount((n) => n + 1);
    // also spawn a few particles
    if (layer === "reverie") {
      for (let i = 0; i < 6; i++) {
        particlesRef.current.push({
          x: x * (c.width / rect.width) + (Math.random() - 0.5) * 20,
          y: y * (c.height / rect.height) + (Math.random() - 0.5) * 20,
          vx: (Math.random() - 0.5) * 1, vy: (Math.random() - 0.5) * 1,
          life: 1, r: Math.random() * 2 + 0.6, color: LAYERS[layer].color,
        });
      }
    }
  };

  const togglePlay = () => { runningRef.current = !runningRef.current; setRunning(runningRef.current); };

  return (
    <div style={{ minHeight: "100%", background: "#03050a", color: "#8aacbe", fontFamily: "'Oxanium', sans-serif", cursor: "crosshair" }}>
      <header style={{ padding: "1.2rem 1.6rem", borderBottom: "1px solid rgba(77,184,255,0.15)", display: "grid", gridTemplateColumns: "1fr auto 1fr", alignItems: "center", gap: "1rem" }}>
        <div style={{ fontFamily: "'Share Tech Mono', monospace", fontSize: "0.55rem", letterSpacing: "0.25em", color: LAYERS.aletheia.color, opacity: 0.5, lineHeight: 1.8 }}>
          AETHER · GLASS-BOX AQUARIUM<br />PROTOCOL v1.0
        </div>
        <div style={{ textAlign: "center" }}>
          <h1 style={{ fontFamily: "'Oxanium', sans-serif", fontSize: "clamp(1.3rem, 2.4vw, 2rem)", color: "#ddeeff", fontWeight: 800, letterSpacing: "0.08em", lineHeight: 1 }}>
            SYMPHONIC <span style={{ color: LAYERS.mnesis.color }}>PROTOCOL</span>
          </h1>
          <div style={{ fontFamily: "'Share Tech Mono', monospace", fontSize: "0.55rem", letterSpacing: "0.2em", color: "#3a5268", marginTop: 4 }}>
            FOUR LAYERS · CLICK TO INJECT SIGNAL
          </div>
        </div>
        <div style={{ textAlign: "right", color: "#3a5268", fontFamily: "'Share Tech Mono', monospace", fontSize: "0.55rem", letterSpacing: "0.18em" }}>
          <div>SIGNALS · {signalCount}</div>
          <div>ACTIVE · <span style={{ color: LAYERS[active].color }}>{LAYERS[active].name}</span></div>
        </div>
      </header>

      <div style={{ display: "grid", gridTemplateColumns: "200px 1fr 240px", gap: "1rem", padding: "1rem 1.4rem 2rem", alignItems: "start" }}>
        {/* Layer nav */}
        <aside style={{ display: "flex", flexDirection: "column", gap: "0.4rem" }}>
          <div style={{ fontFamily: "'Share Tech Mono', monospace", fontSize: "0.5rem", letterSpacing: "0.2em", color: "#3a5268", textTransform: "uppercase", padding: "0.4rem 0" }}>
            Aquarium Layers
          </div>
          {ORDER.map((k) => {
            const l = LAYERS[k];
            const isActive = active === k;
            return (
              <button key={k} onClick={() => setActive(k)} data-testid={`layer-${k}`} style={{
                display: "flex", alignItems: "center", gap: 10,
                padding: "0.55rem 0.7rem",
                border: `1px solid ${isActive ? l.color : "transparent"}`,
                background: isActive ? "rgba(0,0,0,0.4)" : "transparent",
                cursor: "pointer", textAlign: "left", width: "100%",
                color: isActive ? l.color : "#8aacbe",
                fontFamily: "inherit",
              }}>
                <div style={{ width: 8, height: 8, borderRadius: "50%", background: l.color, boxShadow: `0 0 6px ${l.color}` }} />
                <div>
                  <div style={{ fontFamily: "'Share Tech Mono', monospace", fontSize: "0.65rem", letterSpacing: "0.06em" }}>{l.name}</div>
                  <div style={{ fontSize: "0.55rem", color: "#3a5268", letterSpacing: "0.04em", marginTop: 2 }}>{l.role}</div>
                </div>
              </button>
            );
          })}
        </aside>

        {/* Canvas */}
        <main>
          <div style={{ display: "flex", gap: "0.5rem", padding: "0.55rem 0", borderBottom: "1px solid rgba(77,184,255,0.12)", flexWrap: "wrap", marginBottom: "0.6rem" }}>
            <button onClick={togglePlay} data-testid="btn-play" style={btn(active)}>{running ? "PAUSE" : "PLAY"}</button>
            <button onClick={() => { signalsRef.current = []; particlesRef.current = []; setSignalCount(0); }} data-testid="btn-clear" style={btn(active)}>CLEAR</button>
          </div>
          <div style={{ position: "relative", border: "1px solid rgba(77,184,255,0.15)", background: "#07101a", overflow: "hidden", height: 600 }}>
            <canvas ref={canvasRef} onClick={handleCanvasClick} style={{ display: "block", width: "100%", height: "100%", cursor: "crosshair" }} data-testid="protocol-canvas" />
          </div>
          <div style={{ marginTop: "0.7rem", fontSize: "0.85rem", color: "#8aacbe", fontStyle: "italic" }}>
            Transparency + layered depth + temporal continuity + closed-loop regulation. Computation as inspectable ecology.
            <strong style={{ color: LAYERS.mnesis.color, marginLeft: 8 }}>Click anywhere</strong> to inject a signal into the layer at that depth.
          </div>
        </main>

        {/* Right info */}
        <aside style={{ display: "flex", flexDirection: "column", gap: "0.8rem" }}>
          <div style={{ border: "1px solid rgba(77,184,255,0.12)", padding: "0.85rem", background: "rgba(3,8,15,0.7)" }}>
            <div style={{ fontFamily: "'Share Tech Mono', monospace", fontSize: "0.55rem", letterSpacing: "0.2em", color: "#3a5268", textTransform: "uppercase" }}>Active Layer</div>
            <div style={{ fontFamily: "'Share Tech Mono', monospace", color: LAYERS[active].color, fontSize: "1rem", letterSpacing: "0.1em", marginTop: 6 }}>
              {LAYERS[active].name}
            </div>
            <div style={{ color: "#8aacbe", fontSize: "0.78rem", marginTop: 4 }}>{LAYERS[active].role}</div>
            <div style={{ color: "#3a5268", fontSize: "0.7rem", marginTop: 8, fontStyle: "italic" }}>
              {active === "mnesis" && "Persistent memory routed through living mycelial threads. No central processor — distributed electrochemical signaling."}
              {active === "aletheia" && "Deterministic flow of logic currents. Truth as readable, observable signal motion."}
              {active === "infernia" && "Magnetohydrodynamic transformation. Ferrofluid spikes seek signal — precision over saturation."}
              {active === "reverie" && "Bioluminescent particle inference. Sparse activation. Soft probabilistic glow."}
            </div>
          </div>
          <div style={{ border: "1px solid rgba(77,184,255,0.12)", padding: "0.85rem", background: "rgba(3,8,15,0.7)" }}>
            <div style={{ fontFamily: "'Share Tech Mono', monospace", fontSize: "0.55rem", letterSpacing: "0.2em", color: "#3a5268", textTransform: "uppercase" }}>The Aquarium Model</div>
            <ul style={{ marginTop: 8, paddingLeft: "1.1rem", fontSize: "0.78rem", lineHeight: 1.6 }}>
              <li>Transparency — all signal pathways observable</li>
              <li>Layered depth — concurrent processing strata</li>
              <li>Temporal continuity — legible state transitions</li>
              <li>Closed-loop regulation — feedback equilibrium</li>
            </ul>
          </div>
        </aside>
      </div>
    </div>
  );
}

function btn(layer: keyof typeof LAYERS): React.CSSProperties {
  return {
    fontFamily: "'Share Tech Mono', monospace", fontSize: "0.58rem", letterSpacing: "0.1em",
    padding: "0.35rem 0.85rem", background: "transparent",
    border: `1px solid rgba(77,184,255,0.25)`,
    color: "#8aacbe", cursor: "pointer", textTransform: "uppercase",
  };
}

function hexA(hex: string, a: number) {
  const h = hex.replace("#", "");
  const r = parseInt(h.slice(0, 2), 16), g = parseInt(h.slice(2, 4), 16), b = parseInt(h.slice(4, 6), 16);
  return `rgba(${r},${g},${b},${a})`;
}
