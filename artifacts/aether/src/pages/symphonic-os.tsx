import { useEffect, useRef, useState } from "react";

const PHI = 1.6180339887;

const LAYERS = {
  mnesis:   { name: "MNESIS",     role: "Persistent Memory",         color: "#00f5c8" },
  aletheia: { name: "ALETHEIA",   role: "Deterministic Logic",       color: "#4db8ff" },
  infernia: { name: "INFERNIA",   role: "MHD Transformation",        color: "#ff6b35" },
  reverie:  { name: "REVERIE",    role: "Bioluminescent Inference",  color: "#c77dff" },
  aether:   { name: "AETHER",     role: "THz Photon Signaling",      color: "#f0e68c" },
  pythag:   { name: "PYTHAGORAS", role: "Tetrahedral Constraint",    color: "#e8c4a0" },
  russell:  { name: "RUSSELL",    role: "Toroidal Wave Dynamics",    color: "#7ecfcf" },
};

type LayerKey = keyof typeof LAYERS;
const ORDER: LayerKey[] = ["mnesis", "aletheia", "infernia", "reverie", "aether", "pythag", "russell"];

const HARMONIC_RATIOS = [
  { ratio: "1:1", name: "Unison",   value: 1.0 },
  { ratio: "2:1", name: "Octave",   value: 2.0 },
  { ratio: "3:2", name: "Fifth",    value: 1.5 },
  { ratio: "4:3", name: "Fourth",   value: 1.333 },
];

const EMOTIONS = ["Equilibrium", "Resonance", "Wonder", "Reverie", "Entropic", "Crystallizing"];

export default function SymphonicOSView() {
  const tetraRef = useRef<HTMLCanvasElement>(null);
  const torusRef = useRef<HTMLCanvasElement>(null);
  const aetherRef = useRef<HTMLCanvasElement>(null);
  const runningRef = useRef(true);
  const tRef = useRef(0);
  const rafRef = useRef(0);
  const ratioRef = useRef(1.5);

  const [active, setActive] = useState<LayerKey>("aether");
  const [running, setRunning] = useState(true);
  const [ratio, setRatio] = useState(1.5);
  const [emotion, setEmotion] = useState("Equilibrium");
  const [photonCount, setPhotonCount] = useState(0);
  const [tickCount, setTickCount] = useState(0);

  useEffect(() => { ratioRef.current = ratio; }, [ratio]);

  // tetra (Pythagoras) canvas
  useEffect(() => {
    const c = tetraRef.current; if (!c) return;
    const ctx = c.getContext("2d"); if (!ctx) return;
    const resize = () => {
      const r = c.parentElement!.getBoundingClientRect();
      c.width = r.width; c.height = r.height;
    };
    resize();
    window.addEventListener("resize", resize);
    let raf = 0; let t = 0;
    const draw = () => {
      if (!runningRef.current) { raf = requestAnimationFrame(draw); return; }
      const W = c.width, H = c.height;
      ctx.clearRect(0, 0, W, H);
      ctx.fillStyle = "#07101a"; ctx.fillRect(0, 0, W, H);
      const cx = W / 2, cy = H / 2;
      const R = Math.min(W, H) * 0.32;
      const rot = t * 0.4;
      // tetrahedron vertices (projected)
      const verts = [
        [0, -1, 0], [Math.sqrt(8 / 9), 1 / 3, 0],
        [-Math.sqrt(2 / 9), 1 / 3, Math.sqrt(2 / 3)],
        [-Math.sqrt(2 / 9), 1 / 3, -Math.sqrt(2 / 3)],
      ].map(([x, y, z]) => {
        const xr = x * Math.cos(rot) - z * Math.sin(rot);
        const zr = x * Math.sin(rot) + z * Math.cos(rot);
        const sc = 1 / (1 + zr * 0.3);
        return [cx + xr * R * sc, cy + y * R * sc, zr];
      });
      // edges
      const edges = [[0, 1], [0, 2], [0, 3], [1, 2], [1, 3], [2, 3]];
      ctx.strokeStyle = hexA(LAYERS.pythag.color, 0.7);
      ctx.lineWidth = 1.2;
      edges.forEach(([a, b]) => {
        ctx.beginPath();
        ctx.moveTo(verts[a][0], verts[a][1]);
        ctx.lineTo(verts[b][0], verts[b][1]);
        ctx.stroke();
      });
      // verts
      verts.forEach((v) => {
        ctx.fillStyle = LAYERS.pythag.color;
        ctx.beginPath(); ctx.arc(v[0], v[1], 4, 0, Math.PI * 2); ctx.fill();
      });
      // harmonic constraint lines (faint)
      ctx.strokeStyle = hexA(LAYERS.pythag.color, 0.15);
      ctx.lineWidth = 0.5;
      ctx.setLineDash([3, 6]);
      for (let i = 0; i < verts.length; i++) {
        for (let j = i + 1; j < verts.length; j++) {
          const mx = (verts[i][0] + verts[j][0]) / 2;
          const my = (verts[i][1] + verts[j][1]) / 2;
          ctx.beginPath();
          ctx.moveTo(mx, my);
          ctx.lineTo(cx, cy);
          ctx.stroke();
        }
      }
      ctx.setLineDash([]);
      t += 0.012 * ratioRef.current;
      raf = requestAnimationFrame(draw);
    };
    draw();
    return () => { cancelAnimationFrame(raf); window.removeEventListener("resize", resize); };
  }, []);

  // torus (Russell) canvas — toroidal field lines
  useEffect(() => {
    const c = torusRef.current; if (!c) return;
    const ctx = c.getContext("2d"); if (!ctx) return;
    const resize = () => {
      const r = c.parentElement!.getBoundingClientRect();
      c.width = r.width; c.height = r.height;
    };
    resize();
    window.addEventListener("resize", resize);
    let raf = 0; let t = 0;
    const draw = () => {
      if (!runningRef.current) { raf = requestAnimationFrame(draw); return; }
      const W = c.width, H = c.height;
      ctx.clearRect(0, 0, W, H);
      ctx.fillStyle = "#07101a"; ctx.fillRect(0, 0, W, H);
      const cx = W / 2, cy = H / 2;
      const R = Math.min(W, H) * 0.32, rTube = R * 0.4;
      // toroidal field lines
      for (let i = 0; i < 24; i++) {
        const phi = (i / 24) * Math.PI * 2 + t * 0.3;
        ctx.beginPath();
        for (let theta = 0; theta <= Math.PI * 2; theta += 0.1) {
          const xx = (R + rTube * Math.cos(theta)) * Math.cos(phi);
          const yy = (R + rTube * Math.cos(theta)) * Math.sin(phi);
          // perspective project
          const px = cx + xx;
          const py = cy + yy * 0.45 + Math.sin(theta) * rTube * 0.35;
          theta === 0 ? ctx.moveTo(px, py) : ctx.lineTo(px, py);
        }
        ctx.closePath();
        const alpha = 0.1 + 0.25 * (Math.sin(phi * 2 + t) * 0.5 + 0.5);
        ctx.strokeStyle = hexA(LAYERS.russell.color, alpha);
        ctx.lineWidth = 0.5; ctx.stroke();
      }
      // centripetal/centrifugal arrows
      [-1, 1].forEach((dir, idx) => {
        const ax = cx + (R - rTube * 0.4) * dir;
        const sweep = (Math.sin(t * 1.2 + idx) + 1) / 2;
        ctx.fillStyle = hexA(LAYERS.russell.color, 0.7);
        ctx.beginPath();
        ctx.arc(ax, cy, 3 + sweep * 4, 0, Math.PI * 2); ctx.fill();
      });
      t += 0.014 * ratioRef.current;
      raf = requestAnimationFrame(draw);
    };
    draw();
    return () => { cancelAnimationFrame(raf); window.removeEventListener("resize", resize); };
  }, []);

  // aether photon canvas
  useEffect(() => {
    const c = aetherRef.current; if (!c) return;
    const ctx = c.getContext("2d"); if (!ctx) return;
    const resize = () => {
      const r = c.parentElement!.getBoundingClientRect();
      c.width = r.width; c.height = r.height;
    };
    resize();
    window.addEventListener("resize", resize);
    type Ph = { x: number; y: number; vx: number; vy: number; life: number };
    const ph: Ph[] = [];
    let raf = 0; let frame = 0;
    const draw = () => {
      if (!runningRef.current) { raf = requestAnimationFrame(draw); return; }
      const W = c.width, H = c.height;
      ctx.fillStyle = "rgba(7,16,26,0.25)"; ctx.fillRect(0, 0, W, H);
      frame++;
      const interval = Math.max(8, Math.round(40 / ratioRef.current));
      if (frame % interval === 0) {
        ph.push({
          x: Math.random() * W, y: Math.random() * H,
          vx: (Math.random() - 0.5) * 2, vy: (Math.random() - 0.5) * 0.8,
          life: 1,
        });
        setPhotonCount((c) => c + 1);
      }
      for (let i = ph.length - 1; i >= 0; i--) {
        const p = ph[i]; p.x += p.vx; p.y += p.vy; p.life -= 0.018;
        if (p.life < 0.01) { ph.splice(i, 1); continue; }
        ctx.fillStyle = hexA(LAYERS.aether.color, p.life * 0.85);
        ctx.beginPath(); ctx.arc(p.x, p.y, 2, 0, Math.PI * 2); ctx.fill();
        ctx.strokeStyle = hexA(LAYERS.aether.color, p.life * 0.2);
        ctx.lineWidth = 0.4;
        ctx.beginPath(); ctx.arc(p.x, p.y, (1 - p.life) * 12, 0, Math.PI * 2); ctx.stroke();
      }
      raf = requestAnimationFrame(draw);
    };
    draw();
    return () => { cancelAnimationFrame(raf); window.removeEventListener("resize", resize); };
  }, []);

  // tick + emotion drift
  useEffect(() => {
    const id = setInterval(() => {
      setTickCount((t) => t + 1);
      // shift emotion subtly
      if (Math.random() < 0.18) setEmotion(EMOTIONS[Math.floor(Math.random() * EMOTIONS.length)]);
    }, 1000);
    return () => clearInterval(id);
  }, []);

  return (
    <div style={{ minHeight: "100%", background: "#03050a", color: "#8aacbe", fontFamily: "'Oxanium', sans-serif", cursor: "crosshair" }}>
      <header style={{ padding: "1.2rem 1.6rem", borderBottom: "1px solid rgba(77,184,255,0.15)", display: "grid", gridTemplateColumns: "1fr auto 1fr", alignItems: "center", gap: "1rem" }}>
        <div style={{ fontFamily: "'Share Tech Mono', monospace", fontSize: "0.55rem", letterSpacing: "0.25em", color: LAYERS.aletheia.color, opacity: 0.5, lineHeight: 1.8 }}>
          AETHER · UNIFIED OPERATING SYSTEM<br />SEVEN LAYERS · GLASS-BOX
        </div>
        <div style={{ textAlign: "center" }}>
          <h1 style={{ fontFamily: "'Oxanium', sans-serif", fontSize: "clamp(1.2rem, 2.5vw, 2rem)", color: "#ddeeff", fontWeight: 800, letterSpacing: "0.08em", lineHeight: 1 }}>
            SYMPHONIC <span style={{ color: LAYERS.mnesis.color }}>PROTOCOL</span> · OS v2
          </h1>
          <div style={{ fontFamily: "'Share Tech Mono', monospace", fontSize: "0.5rem", letterSpacing: "0.2em", color: "#3a5268", marginTop: 4 }}>
            MNESIS · ALETHEIA · INFERNIA · REVERIE · AETHER · PYTHAGORAS · RUSSELL
          </div>
        </div>
        <div style={{ textAlign: "right", color: "#3a5268", fontFamily: "'Share Tech Mono', monospace", fontSize: "0.55rem", letterSpacing: "0.18em" }}>
          <div>TICK · {tickCount}</div>
          <div>EMOTION · <span style={{ color: LAYERS.reverie.color }}>{emotion}</span></div>
          <div>PHOTONS · {photonCount}</div>
        </div>
      </header>

      <div style={{ display: "grid", gridTemplateColumns: "200px 1fr 1fr 240px", gap: "1rem", padding: "1rem 1.4rem 2rem", alignItems: "start" }}>
        {/* Layer nav */}
        <aside style={{ display: "flex", flexDirection: "column", gap: "0.35rem" }}>
          <div style={{ fontFamily: "'Share Tech Mono', monospace", fontSize: "0.5rem", letterSpacing: "0.2em", color: "#3a5268", textTransform: "uppercase", padding: "0.4rem 0" }}>
            Original (4)
          </div>
          {ORDER.slice(0, 4).map((k) => <LayerBtn key={k} k={k} active={active} setActive={setActive} />)}
          <div style={{ fontFamily: "'Share Tech Mono', monospace", fontSize: "0.5rem", letterSpacing: "0.2em", color: "#3a5268", textTransform: "uppercase", padding: "0.5rem 0 0.2rem", borderTop: "1px solid rgba(77,184,255,0.12)", marginTop: "0.4rem" }}>
            Resonance (3)
          </div>
          {ORDER.slice(4).map((k) => <LayerBtn key={k} k={k} active={active} setActive={setActive} />)}
        </aside>

        {/* Two canvases column */}
        <main style={{ display: "flex", flexDirection: "column", gap: "0.7rem" }}>
          <div style={{ display: "flex", gap: "0.5rem", padding: "0.5rem 0", borderBottom: "1px solid rgba(77,184,255,0.12)", flexWrap: "wrap", alignItems: "center" }}>
            <button onClick={() => { runningRef.current = !runningRef.current; setRunning(runningRef.current); }} data-testid="btn-play" style={btn()}>{running ? "PAUSE" : "PLAY"}</button>
            <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 8 }}>
              <label style={{ fontFamily: "'Share Tech Mono', monospace", fontSize: "0.55rem", letterSpacing: "0.15em", color: "#3a5268", textTransform: "uppercase" }}>HARMONIC</label>
              {HARMONIC_RATIOS.map((h) => (
                <button key={h.ratio} onClick={() => setRatio(h.value)} data-testid={`ratio-${h.ratio.replace(":","-")}`} style={{
                  ...btn(),
                  borderColor: ratio === h.value ? LAYERS.aether.color : "rgba(77,184,255,0.25)",
                  color: ratio === h.value ? LAYERS.aether.color : "#8aacbe",
                  background: ratio === h.value ? "rgba(240,230,140,0.06)" : "transparent",
                }}>
                  {h.ratio}
                </button>
              ))}
            </div>
          </div>

          <div style={{ position: "relative", border: "1px solid rgba(232,196,160,0.18)", background: "#07101a", overflow: "hidden", height: 280 }}>
            <canvas ref={tetraRef} style={{ display: "block", width: "100%", height: "100%" }} data-testid="tetra-canvas" />
            <div style={{ position: "absolute", top: 8, left: 10, fontFamily: "'Share Tech Mono', monospace", fontSize: "0.55rem", letterSpacing: "0.18em", color: LAYERS.pythag.color, opacity: 0.55, textTransform: "uppercase" }}>
              PYTHAGORAS · TETRAHEDRAL CONSTRAINT
            </div>
          </div>

          <div style={{ position: "relative", border: "1px solid rgba(126,207,207,0.2)", background: "#07101a", overflow: "hidden", height: 280 }}>
            <canvas ref={torusRef} style={{ display: "block", width: "100%", height: "100%" }} data-testid="torus-canvas" />
            <div style={{ position: "absolute", top: 8, left: 10, fontFamily: "'Share Tech Mono', monospace", fontSize: "0.55rem", letterSpacing: "0.18em", color: LAYERS.russell.color, opacity: 0.6, textTransform: "uppercase" }}>
              RUSSELL · TOROIDAL WAVE DYNAMICS
            </div>
          </div>
        </main>

        {/* AETHER photons + emotion */}
        <main style={{ display: "flex", flexDirection: "column", gap: "0.7rem" }}>
          <div style={{ height: 36 }} />
          <div style={{ position: "relative", border: "1px solid rgba(240,230,140,0.2)", background: "#07101a", overflow: "hidden", height: 280 }}>
            <canvas ref={aetherRef} style={{ display: "block", width: "100%", height: "100%" }} data-testid="aether-canvas" />
            <div style={{ position: "absolute", top: 8, left: 10, fontFamily: "'Share Tech Mono', monospace", fontSize: "0.55rem", letterSpacing: "0.18em", color: LAYERS.aether.color, opacity: 0.6, textTransform: "uppercase" }}>
              AETHER · THz PHOTON FIELD
            </div>
            <div style={{ position: "absolute", bottom: 8, right: 10, fontFamily: "'Share Tech Mono', monospace", fontSize: "0.55rem", color: LAYERS.aether.color, opacity: 0.6 }}>
              ratio × {ratio.toFixed(3)}
            </div>
          </div>

          <div style={{ border: "1px solid rgba(199,125,255,0.18)", padding: "0.85rem", background: "rgba(0,0,0,0.3)", height: 280, overflow: "hidden", display: "flex", flexDirection: "column" }}>
            <div style={{ fontFamily: "'Share Tech Mono', monospace", fontSize: "0.55rem", letterSpacing: "0.2em", color: LAYERS.reverie.color, textTransform: "uppercase", opacity: 0.7 }}>
              EMOTION AI · FEEDBACK ENGINE
            </div>
            <div style={{ marginTop: 12, fontFamily: "'Libre Baskerville', Georgia, serif", fontStyle: "italic", color: "#ddeeff", fontSize: "1.4rem", textAlign: "center" }}>
              {emotion}
            </div>
            <div style={{ flex: 1, marginTop: 12, display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6, alignContent: "start" }}>
              {EMOTIONS.map((e) => (
                <div key={e} style={{
                  fontFamily: "'Share Tech Mono', monospace", fontSize: "0.55rem", letterSpacing: "0.1em",
                  padding: "0.3rem 0.5rem",
                  border: `1px solid ${e === emotion ? LAYERS.reverie.color : "rgba(199,125,255,0.15)"}`,
                  color: e === emotion ? LAYERS.reverie.color : "#8aacbe",
                  textAlign: "center",
                  background: e === emotion ? "rgba(199,125,255,0.06)" : "transparent",
                  textTransform: "uppercase",
                }}>{e}</div>
              ))}
            </div>
            <div style={{ marginTop: 8, color: "#3a5268", fontSize: "0.7rem", fontStyle: "italic" }}>
              Senses internal state · initiates corrective response · maintains coherence.
            </div>
          </div>
        </main>

        {/* Right detail */}
        <aside style={{ display: "flex", flexDirection: "column", gap: "0.8rem" }}>
          <div style={{ border: `1px solid ${LAYERS[active].color}33`, padding: "0.85rem", background: "rgba(3,8,15,0.7)" }}>
            <div style={{ fontFamily: "'Share Tech Mono', monospace", fontSize: "0.55rem", letterSpacing: "0.2em", color: "#3a5268", textTransform: "uppercase" }}>Selected Layer</div>
            <div style={{ fontFamily: "'Share Tech Mono', monospace", color: LAYERS[active].color, fontSize: "1rem", letterSpacing: "0.1em", marginTop: 6 }}>
              {LAYERS[active].name}
            </div>
            <div style={{ color: "#8aacbe", fontSize: "0.78rem", marginTop: 4 }}>{LAYERS[active].role}</div>
            <div style={{ color: "#3a5268", fontSize: "0.7rem", marginTop: 8, fontStyle: "italic" }}>
              {layerDesc(active)}
            </div>
          </div>

          <div style={{ border: "1px solid rgba(232,196,160,0.18)", padding: "0.85rem", background: "rgba(3,8,15,0.7)" }}>
            <div style={{ fontFamily: "'Share Tech Mono', monospace", fontSize: "0.55rem", letterSpacing: "0.2em", color: "#3a5268", textTransform: "uppercase" }}>Harmonic Ratios</div>
            <ul style={{ marginTop: 8, paddingLeft: "1.1rem", fontSize: "0.78rem", lineHeight: 1.7, color: "#8aacbe" }}>
              {HARMONIC_RATIOS.map((h) => (
                <li key={h.ratio}>
                  <span style={{ color: LAYERS.pythag.color, fontFamily: "'Share Tech Mono', monospace" }}>{h.ratio}</span> &nbsp;{h.name} <span style={{ color: "#3a5268" }}>· ×{h.value.toFixed(3)}</span>
                </li>
              ))}
            </ul>
            <div style={{ color: "#3a5268", fontSize: "0.7rem", marginTop: 6, fontStyle: "italic" }}>
              Constraint architecture — physically real resonance. φ = {PHI}.
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}

function LayerBtn({ k, active, setActive }: { k: keyof typeof LAYERS; active: keyof typeof LAYERS; setActive: (k: keyof typeof LAYERS) => void }) {
  const l = LAYERS[k];
  const isActive = active === k;
  return (
    <button onClick={() => setActive(k)} data-testid={`layer-${k}`} style={{
      display: "flex", alignItems: "center", gap: 9,
      padding: "0.5rem 0.65rem",
      border: `1px solid ${isActive ? l.color : "transparent"}`,
      background: isActive ? "rgba(0,0,0,0.4)" : "transparent",
      cursor: "pointer", textAlign: "left", width: "100%",
      color: isActive ? l.color : "#8aacbe",
      fontFamily: "inherit",
    }}>
      <div style={{ width: 7, height: 7, borderRadius: "50%", background: l.color, boxShadow: `0 0 6px ${l.color}` }} />
      <div>
        <div style={{ fontFamily: "'Share Tech Mono', monospace", fontSize: "0.6rem", letterSpacing: "0.06em" }}>{l.name}</div>
        <div style={{ fontSize: "0.5rem", color: "#3a5268", letterSpacing: "0.04em", marginTop: 2 }}>{l.role}</div>
      </div>
    </button>
  );
}

function layerDesc(k: keyof typeof LAYERS): string {
  switch (k) {
    case "mnesis":   return "Persistent memory — distributed mycelial signaling, no central processor.";
    case "aletheia": return "Deterministic logic — observable, legible signal flow.";
    case "infernia": return "Magnetohydrodynamic transformation — ferrofluid precision delivery.";
    case "reverie":  return "Bioluminescent inference — sparse probabilistic activation.";
    case "aether":   return "THz photon signaling — physically grounded chemiexcitation, not metaphor.";
    case "pythag":   return "Tetrahedral constraint — harmonic ratios as physical resonance architecture.";
    case "russell":  return "Toroidal wave dynamics — silence → sound → silence cycle, the AETHER loop in space.";
  }
}

function btn(): React.CSSProperties {
  return {
    fontFamily: "'Share Tech Mono', monospace", fontSize: "0.55rem", letterSpacing: "0.1em",
    padding: "0.32rem 0.7rem", background: "transparent",
    border: `1px solid rgba(77,184,255,0.25)`,
    color: "#8aacbe", cursor: "pointer", textTransform: "uppercase",
  };
}

function hexA(hex: string, a: number) {
  const h = hex.replace("#", "");
  const r = parseInt(h.slice(0, 2), 16), g = parseInt(h.slice(2, 4), 16), b = parseInt(h.slice(4, 6), 16);
  return `rgba(${r},${g},${b},${a})`;
}
