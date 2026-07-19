/*═══════════════════════════════════════════════════════════════════
  AETHER Dynamic Synthesis Timeline
  From Extraterrestrial Meteorite to Biosynthetic Medicine
  & Plasma Coherence at Maximum Cellular & Energetic Level

  Covers: Alfvén waves · MHD · Floquet resonance · Tubular networks
  Slime mold / mycorrhizae retraction · Fusion plasma modeling
═══════════════════════════════════════════════════════════════════*/
import { useRef, useEffect, useState } from "react";

const P = {
  bg: "#060810", panel: "#0d1018", panel2: "#131825",
  gold: "#f5c84c", ivory: "#f4f1ea", dim: "rgba(244,241,234,0.5)",
  line: "rgba(79,200,232,0.12)", cyan: "#4fe8e8", purple: "#c084fc",
  blue: "#60a5fa", teal: "#2dd4bf", green: "#34d399", red: "#f87171",
  orange: "#fb923c", muted: "rgba(244,241,234,0.3)",
};

/* ── shared helpers ── */
function Sec({ id, children }: { id?: string; children: React.ReactNode }) {
  return (
    <section id={id} style={{ borderTop: `1px solid ${P.line}`, padding: "52px 0" }}>
      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "0 32px" }}>{children}</div>
    </section>
  );
}
function Tag({ label, color = P.cyan }: { label: string; color?: string }) {
  return <span style={{ fontSize: 10, fontWeight: 700, color, letterSpacing: 1.5, textTransform: "uppercase" as const }}>{label}</span>;
}
function Card({ title, body, color = P.cyan }: { title: string; body: string; color?: string }) {
  return (
    <div style={{ padding: "16px 18px", background: P.panel, borderRadius: 10, border: `1px solid ${color}22` }}>
      <div style={{ fontSize: 11, fontWeight: 700, color, letterSpacing: 0.8, marginBottom: 7, textTransform: "uppercase" as const }}>{title}</div>
      <div style={{ fontSize: 13, color: P.dim, lineHeight: 1.75 }}>{body}</div>
    </div>
  );
}
function Eq({ label, eq, note }: { label: string; eq: string; note?: string }) {
  return (
    <div style={{ padding: "14px 18px", background: P.panel2, borderRadius: 9, border: `1px solid ${P.line}`, marginBottom: 12 }}>
      <div style={{ fontSize: 10, color: P.muted, marginBottom: 5, letterSpacing: 1 }}>{label}</div>
      <div style={{ fontSize: 17, fontFamily: "monospace", color: P.cyan, marginBottom: note ? 6 : 0 }}>{eq}</div>
      {note && <div style={{ fontSize: 12, color: P.dim, lineHeight: 1.6 }}>{note}</div>}
    </div>
  );
}

/* ══════════════════════════════════════════════════════════
   CANVAS 1 — Alfvén Wave Propagating Along Field Lines
   y(x,t) = A·sin(kx − v_A·t)   v_A = B/√(μ₀ρ)
═══════════════════════════════════════════════════════════ */
function AlfvenWaveCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const bRef   = useRef(1.5);
  const rhoRef = useRef(1.0);
  const ampRef = useRef(0.3);
  const [B, setB]     = useState(1.5);
  const [rho, setRho] = useState(1.0);
  const [amp, setAmp] = useState(0.3);
  const [vA, setVA]   = useState(0);

  useEffect(() => { bRef.current = B; }, [B]);
  useEffect(() => { rhoRef.current = rho; }, [rho]);
  useEffect(() => { ampRef.current = amp; }, [amp]);

  useEffect(() => {
    const c = canvasRef.current; if (!c) return;
    const ctx = c.getContext("2d")!;
    let raf = 0, t = 0;
    function resize() { c.width = c.offsetWidth; c.height = c.offsetHeight; }
    resize();
    const ro = new ResizeObserver(resize); ro.observe(c);

    function draw() {
      const W = c.width, H = c.height;
      ctx.clearRect(0, 0, W, H);
      ctx.fillStyle = P.bg; ctx.fillRect(0, 0, W, H);

      const vAcalc = bRef.current / Math.sqrt(rhoRef.current);
      if (t % 15 === 0) setVA(+vAcalc.toFixed(3));

      const MU0 = 1.0; // normalized
      const k = (2 * Math.PI) / (W * 0.4);
      const plotH = H * 0.55;
      const midY  = plotH / 2 + 40;
      const nx = W;

      // background field lines (horizontal guides)
      for (let i = 0; i < 7; i++) {
        const fy = 50 + i * (plotH / 6);
        ctx.strokeStyle = "rgba(96,165,250,0.08)";
        ctx.lineWidth = 1;
        ctx.beginPath(); ctx.moveTo(0, fy); ctx.lineTo(W, fy); ctx.stroke();
      }

      // core glow (left = plasma core)
      const coreGrd = ctx.createRadialGradient(0, midY, 0, 0, midY, 80);
      coreGrd.addColorStop(0, "rgba(248,146,113,0.4)");
      coreGrd.addColorStop(0.5, "rgba(192,132,252,0.2)");
      coreGrd.addColorStop(1, "transparent");
      ctx.fillStyle = coreGrd; ctx.beginPath(); ctx.arc(0, midY, 80, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = P.orange; ctx.font = "bold 9px monospace";
      ctx.fillText("PLASMA CORE", 6, midY - 55);

      // draw 3 Alfvén mode harmonics
      const harmonics = [
        { freq: 1, color: P.cyan,   label: "Shear Alfvén (n=1)" },
        { freq: 2, color: P.purple, label: "TAE (n=2)" },
        { freq: 3, color: P.teal,   label: "GAE (n=3)" },
      ];
      harmonics.forEach((h, hi) => {
        const A = ampRef.current * (1 - hi * 0.25);
        ctx.strokeStyle = h.color;
        ctx.lineWidth = 2 - hi * 0.4;
        ctx.globalAlpha = 0.9 - hi * 0.2;
        ctx.beginPath();
        for (let px = 0; px <= nx; px += 2) {
          const frac = px / W;
          // amplitude decays as wave propagates (damping)
          const decay = Math.exp(-frac * 1.2);
          const y = midY + A * H * 0.35 * decay * Math.sin(k * h.freq * px - vAcalc * t * 0.03 * h.freq);
          px === 0 ? ctx.moveTo(px, y) : ctx.lineTo(px, y);
        }
        ctx.stroke();
        ctx.globalAlpha = 1;

        // legend
        ctx.fillStyle = h.color; ctx.font = "9px monospace";
        ctx.fillText(h.label, W - 130, 20 + hi * 14);
      });

      // "edge of plasma" line
      ctx.setLineDash([4, 4]);
      ctx.strokeStyle = "rgba(251,146,60,0.4)"; ctx.lineWidth = 1;
      ctx.beginPath(); ctx.moveTo(W * 0.85, 30); ctx.lineTo(W * 0.85, plotH + 30); ctx.stroke();
      ctx.setLineDash([]);
      ctx.fillStyle = P.orange; ctx.font = "9px monospace";
      ctx.fillText("EDGE", W * 0.85 + 4, 42);

      // bottom panel: v_A indicator
      const panelY = plotH + 60;
      ctx.fillStyle = "rgba(13,16,24,0.8)"; ctx.fillRect(0, panelY, W, H - panelY);
      ctx.strokeStyle = P.line; ctx.lineWidth = 1;
      ctx.beginPath(); ctx.moveTo(0, panelY); ctx.lineTo(W, panelY); ctx.stroke();

      // v_A bar
      const vAmax = 3.0;
      const barW = Math.min(W * 0.7, 400);
      const barX = (W - barW) / 2;
      ctx.fillStyle = "rgba(79,232,232,0.15)"; ctx.fillRect(barX, panelY + 14, barW, 16);
      const barFill = Math.min(1, vAcalc / vAmax);
      const barGrd = ctx.createLinearGradient(barX, 0, barX + barW, 0);
      barGrd.addColorStop(0, P.blue); barGrd.addColorStop(0.5, P.cyan); barGrd.addColorStop(1, P.teal);
      ctx.fillStyle = barGrd; ctx.fillRect(barX, panelY + 14, barW * barFill, 16);
      ctx.fillStyle = P.ivory; ctx.font = "bold 11px monospace";
      ctx.textAlign = "center";
      ctx.fillText(`v_A = B / √(μ₀ρ) = ${vAcalc.toFixed(3)}  (normalized units)`, W / 2, panelY + 8);
      ctx.textAlign = "left";

      t++;
      raf = requestAnimationFrame(draw);
    }
    draw();
    return () => { cancelAnimationFrame(raf); ro.disconnect(); };
  }, []);

  return (
    <div style={{ border: `1px solid ${P.line}`, borderRadius: 12, overflow: "hidden", marginBottom: 32 }}>
      <canvas ref={canvasRef} style={{ width: "100%", height: 280, display: "block" }} />
      <div style={{ padding: "12px 16px", background: P.panel, display: "flex", gap: 20, flexWrap: "wrap", alignItems: "center" }}>
        <div>
          <div style={{ fontSize: 10, color: P.dim, marginBottom: 3 }}>MAGNETIC FIELD B · {B.toFixed(1)}</div>
          <input type="range" min={0.2} max={3.0} step={0.1} value={B} onChange={e => setB(+e.target.value)} style={{ width: 110 }} />
        </div>
        <div>
          <div style={{ fontSize: 10, color: P.dim, marginBottom: 3 }}>PLASMA DENSITY ρ · {rho.toFixed(1)}</div>
          <input type="range" min={0.1} max={4.0} step={0.1} value={rho} onChange={e => setRho(+e.target.value)} style={{ width: 110 }} />
        </div>
        <div>
          <div style={{ fontSize: 10, color: P.dim, marginBottom: 3 }}>AMPLITUDE · {amp.toFixed(2)}</div>
          <input type="range" min={0.05} max={0.5} step={0.01} value={amp} onChange={e => setAmp(+e.target.value)} style={{ width: 110 }} />
        </div>
        <div style={{ marginLeft: "auto", textAlign: "right" as const }}>
          <div style={{ fontSize: 10, color: P.dim }}>ALFVÉN SPEED</div>
          <div style={{ fontSize: 18, fontFamily: "monospace", color: P.cyan, fontWeight: 700 }}>{vA.toFixed(3)}</div>
        </div>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════
   CANVAS 2 — Tubular Network Retraction (Slime Mold / Mycorrhizae)
   Nodes explore all paths → sense dead ends → prune → optimal route
═══════════════════════════════════════════════════════════ */
interface NetNode { x: number; y: number; strength: number; active: boolean; }
interface NetEdge { a: number; b: number; flow: number; age: number; }

function NetworkRetractionCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const threshRef = useRef(0.18);
  const [threshold, setThresholdS] = useState(0.18);
  const [phase, setPhase] = useState("Exploring");
  const [activeEdges, setActiveEdges] = useState(0);

  useEffect(() => { threshRef.current = threshold; }, [threshold]);

  useEffect(() => {
    const c = canvasRef.current; if (!c) return;
    const ctx = c.getContext("2d")!;
    let raf = 0, t = 0;
    function resize() { c.width = c.offsetWidth; c.height = c.offsetHeight; }
    resize();
    const ro = new ResizeObserver(resize); ro.observe(c);

    // build a network: source (left) → sink (right), random nodes in between
    const rng = (s: number) => { let x = Math.sin(s) * 10000; return x - Math.floor(x); };
    let nodes: NetNode[] = [];
    let edges: NetEdge[] = [];

    function initNetwork(W: number, H: number) {
      nodes = [];
      edges = [];
      // source
      nodes.push({ x: 30, y: H / 2, strength: 1, active: true });
      // sink
      nodes.push({ x: W - 30, y: H / 2, strength: 1, active: true });
      // random intermediate nodes
      const count = 18;
      for (let i = 0; i < count; i++) {
        nodes.push({
          x: 80 + rng(i * 7) * (W - 160),
          y: 30 + rng(i * 13) * (H - 60),
          strength: 0.4 + rng(i * 3) * 0.6,
          active: true,
        });
      }
      // edges: connect each node to nearest ~3 neighbors
      for (let i = 0; i < nodes.length; i++) {
        const dists = nodes.map((n, j) => ({ j, d: Math.hypot(n.x - nodes[i].x, n.y - nodes[i].y) }))
          .filter(({ j }) => j !== i)
          .sort((a, b) => a.d - b.d)
          .slice(0, 3);
        dists.forEach(({ j }) => {
          if (!edges.some(e => (e.a === i && e.b === j) || (e.a === j && e.b === i))) {
            edges.push({ a: i, b: j, flow: 0.3 + rng(i * j + 1) * 0.7, age: 0 });
          }
        });
      }
    }

    function draw() {
      const W = c.width, H = c.height;
      if (t === 0) initNetwork(W, H);
      ctx.clearRect(0, 0, W, H);
      ctx.fillStyle = P.bg; ctx.fillRect(0, 0, W, H);

      const thr = threshRef.current;

      // evolve: flow dynamics + retraction
      edges.forEach(edge => {
        edge.age++;
        if (!edge.age) return;
        const nA = nodes[edge.a], nB = nodes[edge.b];
        // flow reinforcement: if both ends active, flow grows; else decays
        const both = nA.active && nB.active;
        const isOnPath = (edge.a === 0 || edge.b === 1); // connected to source/sink
        edge.flow += (both ? 0.003 : -0.008);
        edge.flow += isOnPath ? 0.002 : 0;
        edge.flow = Math.max(0, Math.min(1, edge.flow));
      });

      // prune weak edges
      edges.forEach(e => { if (e.flow < thr) e.flow *= 0.97; });

      // draw edges
      const alive = edges.filter(e => e.flow >= thr * 0.3);
      alive.forEach(edge => {
        const nA = nodes[edge.a], nB = nodes[edge.b];
        const opacity = Math.min(1, edge.flow * 1.5);
        const w = edge.flow * 4;
        // color: strong = cyan, weak = dim purple
        const r = Math.round(79 + (192 - 79) * (1 - edge.flow));
        const g = Math.round(232 + (132 - 232) * (1 - edge.flow));
        const b2 = Math.round(232 + (252 - 232) * (1 - edge.flow));
        ctx.strokeStyle = `rgba(${r},${g},${b2},${opacity})`;
        ctx.lineWidth = w;
        ctx.beginPath(); ctx.moveTo(nA.x, nA.y); ctx.lineTo(nB.x, nB.y); ctx.stroke();

        // flow particle
        if (edge.flow > thr) {
          const frac = ((t * 0.015 + edge.a * 0.3) % 1);
          const px = nA.x + (nB.x - nA.x) * frac;
          const py = nA.y + (nB.y - nA.y) * frac;
          ctx.fillStyle = `rgba(245,200,76,${edge.flow})`;
          ctx.beginPath(); ctx.arc(px, py, 2.5, 0, Math.PI * 2); ctx.fill();
        }
      });

      // draw nodes
      nodes.forEach((n, i) => {
        const isSource = i === 0, isSink = i === 1;
        const r = isSource || isSink ? 10 : 5 + n.strength * 4;
        const col = isSource ? P.orange : isSink ? P.green : P.cyan;
        const grd = ctx.createRadialGradient(n.x, n.y, 0, n.x, n.y, r * 2);
        grd.addColorStop(0, col);
        grd.addColorStop(1, "transparent");
        ctx.fillStyle = grd; ctx.beginPath(); ctx.arc(n.x, n.y, r * 2, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = col; ctx.beginPath(); ctx.arc(n.x, n.y, r * 0.7, 0, Math.PI * 2); ctx.fill();
        if (isSource) { ctx.fillStyle = P.ivory; ctx.font = "9px monospace"; ctx.fillText("SRC", n.x + 12, n.y + 4); }
        if (isSink)   { ctx.fillStyle = P.ivory; ctx.font = "9px monospace"; ctx.fillText("SINK", n.x - 32, n.y + 4); }
      });

      // phase readout
      const strongEdges = edges.filter(e => e.flow > thr).length;
      const allEdges = edges.length;
      if (t % 12 === 0) {
        setActiveEdges(strongEdges);
        const pct = strongEdges / allEdges;
        setPhase(pct > 0.7 ? "Exploring" : pct > 0.35 ? "Retracting" : "Optimal Path");
      }

      // legend
      ctx.fillStyle = "rgba(13,16,24,0.8)"; ctx.fillRect(4, 4, 220, 52);
      ctx.fillStyle = P.cyan; ctx.font = "9px monospace";
      ctx.fillText(`Active edges: ${strongEdges} / ${allEdges}`, 10, 18);
      ctx.fillText(`Threshold: ${thr.toFixed(2)}`, 10, 32);
      ctx.fillStyle = strongEdges / allEdges > 0.7 ? P.orange : strongEdges / allEdges > 0.35 ? P.gold : P.green;
      ctx.font = "bold 9px monospace";
      ctx.fillText(`Phase: ${strongEdges / allEdges > 0.7 ? "EXPLORING" : strongEdges / allEdges > 0.35 ? "RETRACTING" : "OPTIMAL PATH"}`, 10, 46);

      t++;
      raf = requestAnimationFrame(draw);
    }
    draw();
    return () => { cancelAnimationFrame(raf); ro.disconnect(); };
  }, []);

  return (
    <div style={{ border: `1px solid ${P.line}`, borderRadius: 12, overflow: "hidden", marginBottom: 32 }}>
      <canvas ref={canvasRef} style={{ width: "100%", height: 300, display: "block" }} />
      <div style={{ padding: "10px 16px", background: P.panel, display: "flex", gap: 20, flexWrap: "wrap", alignItems: "center" }}>
        <div>
          <div style={{ fontSize: 10, color: P.dim, marginBottom: 3 }}>RETRACTION THRESHOLD · {threshold.toFixed(2)}</div>
          <input type="range" min={0.05} max={0.5} step={0.01} value={threshold} onChange={e => setThresholdS(+e.target.value)} style={{ width: 140 }} />
        </div>
        <div style={{ fontSize: 11, color: phase === "OPTIMAL PATH" || activeEdges < 12 ? P.green : phase === "Retracting" ? P.gold : P.orange }}>
          {activeEdges} active edges · {phase}
        </div>
        <div style={{ marginLeft: "auto", fontSize: 11, color: P.dim }}>
          Flow particles = resource transport · dead ends prune automatically
        </div>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════
   CANVAS 3 — Floquet / Tokamak Cross-Section
   Toroidal geometry, field lines, wave modes, TAE instability
═══════════════════════════════════════════════════════════ */
function TokamarkCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const modeRef   = useRef<"stable" | "TAE" | "RFP">("stable");
  const [mode, setModeS] = useState<"stable" | "TAE" | "RFP">("stable");

  useEffect(() => { modeRef.current = mode; }, [mode]);

  useEffect(() => {
    const c = canvasRef.current; if (!c) return;
    const ctx = c.getContext("2d")!;
    let raf = 0, t = 0;
    function resize() { c.width = c.offsetWidth; c.height = c.offsetHeight; }
    resize();
    const ro = new ResizeObserver(resize); ro.observe(c);

    function draw() {
      const W = c.width, H = c.height;
      ctx.clearRect(0, 0, W, H);
      ctx.fillStyle = P.bg; ctx.fillRect(0, 0, W, H);

      const cx = W / 2, cy = H / 2;
      const R = Math.min(W, H) * 0.32; // major radius
      const r0 = R * 0.38; // minor radius
      const m = modeRef.current;

      // Draw nested flux surfaces (magnetic surfaces)
      const surfaces = 8;
      for (let s = 0; s < surfaces; s++) {
        const rs = r0 * (s + 1) / surfaces;
        const opacity = 0.05 + s * 0.015;
        const col = m === "TAE" ? `rgba(192,132,252,${opacity * 2})` :
                    m === "RFP" ? `rgba(248,146,60,${opacity * 2})` :
                    `rgba(96,165,250,${opacity * 2})`;
        ctx.strokeStyle = col;
        ctx.lineWidth = 1;
        ctx.beginPath();
        for (let a = 0; a <= Math.PI * 2; a += 0.04) {
          const px = cx + (R + rs * Math.cos(a)) * Math.cos(a * 0.5); // simplified torus projection
          const py = cy + (R * 0.45 + rs * 0.5 * Math.sin(a)) * Math.sin(a * 0.5 + 0.3);
          a === 0 ? ctx.moveTo(px, py) : ctx.lineTo(px, py);
        }
        ctx.stroke();
      }

      // draw the actual torus cross-section circle (poloidal)
      const poloidalAngles = 12;
      for (let i = 0; i < poloidalAngles; i++) {
        const angle = (i / poloidalAngles) * Math.PI * 2;
        const px = cx + R * 0.9 * Math.cos(angle);
        const py = cy + R * 0.45 * Math.sin(angle);

        // flux surface circle
        const circR = r0 * 0.6;
        ctx.strokeStyle = m === "TAE" ? `rgba(192,132,252,0.2)` :
                          m === "RFP" ? `rgba(248,146,60,0.18)` :
                          `rgba(96,165,250,0.18)`;
        ctx.lineWidth = 1;
        ctx.beginPath(); ctx.arc(px, py, circR, 0, Math.PI * 2); ctx.stroke();

        // Alfvén wave mode perturbation
        const modeN = m === "TAE" ? 2 : m === "RFP" ? 4 : 1;
        const pertAmp = circR * (m === "stable" ? 0.08 : 0.22);
        const waveColor = m === "TAE" ? P.purple : m === "RFP" ? P.orange : P.cyan;
        ctx.strokeStyle = waveColor;
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        for (let a = 0; a <= Math.PI * 2; a += 0.06) {
          const pert = pertAmp * Math.sin(modeN * a + t * 0.025);
          const ppx = px + (circR + pert) * Math.cos(a);
          const ppy = py + (circR + pert) * Math.sin(a);
          a === 0 ? ctx.moveTo(ppx, ppy) : ctx.lineTo(ppx, ppy);
        }
        ctx.stroke();
      }

      // plasma core hot spot
      const coreR = r0 * 0.45;
      const coreGrd = ctx.createRadialGradient(cx, cy, 0, cx, cy, coreR);
      coreGrd.addColorStop(0, "rgba(248,146,60,0.8)");
      coreGrd.addColorStop(0.4, "rgba(251,146,60,0.3)");
      coreGrd.addColorStop(1, "transparent");
      ctx.fillStyle = coreGrd; ctx.beginPath(); ctx.arc(cx, cy, coreR, 0, Math.PI * 2); ctx.fill();

      // alpha particles radiating outward (for TAE mode)
      if (m === "TAE") {
        for (let i = 0; i < 8; i++) {
          const a = (i / 8) * Math.PI * 2 + t * 0.01;
          const rad = (coreR + (t * 0.4 + i * 20) % (R * 0.9 - coreR));
          const px = cx + rad * Math.cos(a);
          const py = cy + rad * 0.5 * Math.sin(a);
          ctx.fillStyle = `rgba(245,200,76,${1 - rad / (R * 0.9)})`;
          ctx.beginPath(); ctx.arc(px, py, 2.5, 0, Math.PI * 2); ctx.fill();
        }
      }

      // labels
      ctx.fillStyle = P.ivory; ctx.font = "bold 12px monospace"; ctx.textAlign = "center";
      ctx.fillText(
        m === "stable" ? "TOKAMAK — Stable Mode" :
        m === "TAE"    ? "TAE INSTABILITY — Energetic Particle Loss" :
                         "RFP — Reversed Field Pinch",
        cx, 22
      );
      ctx.font = "10px monospace"; ctx.fillStyle = P.dim;
      ctx.fillText(
        m === "stable" ? "Shear Alfvén modes confined · n=1 perturbation" :
        m === "TAE"    ? "Alpha particles drive TAE · radial transport risk" :
                         "Alternative magnetic topology · different wave spectrum",
        cx, 36
      );
      ctx.textAlign = "left";

      t++;
      raf = requestAnimationFrame(draw);
    }
    draw();
    return () => { cancelAnimationFrame(raf); ro.disconnect(); };
  }, []);

  return (
    <div style={{ border: `1px solid ${P.line}`, borderRadius: 12, overflow: "hidden", marginBottom: 32 }}>
      <canvas ref={canvasRef} style={{ width: "100%", height: 300, display: "block" }} />
      <div style={{ padding: "10px 16px", background: P.panel, display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" }}>
        <div style={{ fontSize: 10, color: P.dim }}>MAGNETIC CONFIGURATION:</div>
        {([
          { key: "stable", label: "Stable Tokamak",  color: P.blue },
          { key: "TAE",    label: "TAE Instability", color: P.purple },
          { key: "RFP",    label: "Stellarator/RFP", color: P.orange },
        ] as { key: "stable"|"TAE"|"RFP"; label: string; color: string }[]).map(opt => (
          <button key={opt.key}
            onClick={() => setModeS(opt.key)}
            style={{ padding: "5px 14px", borderRadius: 7, border: `1px solid ${mode === opt.key ? opt.color : P.line}`, background: mode === opt.key ? opt.color + "22" : "transparent", color: mode === opt.key ? opt.color : P.dim, fontSize: 11, cursor: "pointer" }}
          >
            {opt.label}
          </button>
        ))}
        <div style={{ marginLeft: "auto", fontSize: 10, color: P.dim }}>
          Gold dots (TAE) = fusion alpha particles being lost radially
        </div>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════
   MAIN PAGE
═══════════════════════════════════════════════════════════ */
const TIMELINE_PHASES = [
  {
    n: "01", label: "Cosmic Seeding", time: "4.5 Billion Years Ago",
    color: P.orange,
    body: "Extraterrestrial meteorite/asteroid impact delivers primordial chemistry, water precursors, organic molecules, and prebiotic nano-machines. Wet, warm, swampy environments form. First tubular networks and ion channels emerge — the universal language of threading and response.",
    math: "Chemical evolution equations · Panspermia · Initial condition seeding",
  },
  {
    n: "02", label: "Primordial Networks", time: "Billions of Years",
    color: P.teal,
    body: "Slime molds (cytoplasmic streaming + retraction), mycorrhizal fungi, bacteria with ion channels and signaling cascades, early plants. Explore all paths → sense dead ends via feedback → retract and reinforce optimal routes. Thermodynamic efficiency via nano-scale sensing.",
    math: "C = Σ (length × resistance)   minimized subject to flow conservation",
  },
  {
    n: "03", label: "Molecular Bricks", time: "Modern Biology",
    color: P.green,
    body: "Ion channels, receptive proteins, signaling cascades, quantum switching, intrinsic mutation. Piezoelectric effects in tissues, Floquet periodic driving for stability. Nano thermodynamic meters + DNA environment noise sensors enable real-time heuristic processing (10 ms scale).",
    math: "x(t) = e^(μt) · p(t),   p(t+T) = p(t)   [Floquet stability]",
  },
  {
    n: "04", label: "AETHER Framework", time: "2026",
    color: P.gold,
    body: "Camera networks + live processing of forest/soil signals → mathematical synthesis of tubular networks, feedback loops, and resource optimization. Modular, intent-routing meta-architecture that models the primordial language across scales: from cytoplasm to plasma.",
    math: "C(x,t) = 1 − (‖ε‖/‖S*‖) · e^(−κ·Γ_helix)   [AETHER coherence field]",
  },
  {
    n: "05", label: "Biosynthetic Medicine & Plasma Fusion", time: "Now Possible",
    color: P.purple,
    body: "Engineer biosynthetic pathways (sugar → therapeutic compounds or magnetic scaffolds). Plasma modeling for fusion: Alfvén eigenmodes (TAEs, GAEs) predict and control energetic particle transport. The framework is now clear — defend survival by creation at the molecular brick level.",
    math: "v_A = B / √(μ₀ρ)   [Alfvén speed — the plasma coherence carrier]",
  },
];

export default function AlfvenSynthesisPage() {
  return (
    <div style={{ background: P.bg, color: P.ivory, minHeight: "100vh", fontFamily: "inherit" }}>

      {/* ── HERO ── */}
      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "52px 32px 36px" }}>
        <Tag label="AETHER · Plasma Physics · Biosynthetic Medicine" color={P.cyan} />
        <h1 style={{ fontSize: 34, fontWeight: 800, lineHeight: 1.15, marginBottom: 14, marginTop: 10, letterSpacing: -0.5 }}>
          <span style={{ color: P.cyan }}>Dynamic Synthesis Timeline</span><br />
          <span style={{ color: P.ivory, fontWeight: 300 }}>From Meteorite to Coherence</span>
        </h1>
        <p style={{ fontSize: 15, color: P.dim, lineHeight: 1.9, maxWidth: 740, marginBottom: 32 }}>
          The universe speaks a single primordial language of threaded, resonant, responsive networks. This language appears in meteoritic delivery, biological cytoplasmic flows, molecular signaling, forest ecosystems, and now in magnetized plasmas. Alfvén waves in fusion reactors and mycorrhizal retraction in soil are the same phenomenon at different scales — and AETHER is the meta-framework that connects them.
        </p>

        {/* ── 5-Phase Timeline bar ── */}
        <div style={{ display: "flex", gap: 0, marginBottom: 40, borderRadius: 12, overflow: "hidden", border: `1px solid rgba(79,232,232,0.15)` }}>
          {TIMELINE_PHASES.map((ph, i) => (
            <a key={i} href={`#phase-${i+1}`} style={{ flex: 1, padding: "14px 10px", background: P.panel, borderRight: i < 4 ? `1px solid rgba(79,232,232,0.1)` : "none", textDecoration: "none", display: "block", transition: "background .15s" }}
              onMouseEnter={e => (e.currentTarget.style.background = P.panel2)}
              onMouseLeave={e => (e.currentTarget.style.background = P.panel)}
            >
              <div style={{ fontSize: 9, color: ph.color, fontWeight: 700, letterSpacing: 1, marginBottom: 4 }}>PHASE {ph.n}</div>
              <div style={{ fontSize: 11, color: P.ivory, fontWeight: 600, lineHeight: 1.3, marginBottom: 3 }}>{ph.label}</div>
              <div style={{ fontSize: 9, color: P.muted }}>{ph.time}</div>
            </a>
          ))}
        </div>
      </div>

      {/* ── SECTION: ALFVÉN WAVES ── */}
      <Sec id="alfven">
        <Tag label="Section I · Plasma Physics" color={P.cyan} />
        <h2 style={{ fontSize: 24, fontWeight: 700, color: P.cyan, margin: "10px 0 14px" }}>
          Alfvén Waves · The Plasma Resonance Carrier
        </h2>
        <p style={{ fontSize: 14, color: P.dim, lineHeight: 1.85, maxWidth: 780, marginBottom: 28 }}>
          Alfvén waves are fundamental transverse electromagnetic waves in magnetized plasma — they propagate along magnetic field lines at the Alfvén speed v_A = B/√(μ₀ρ). In fusion devices (tokamaks, stellarators), these waves are excited in the hot plasma core and propagate outward. They heat the plasma, transport energy and particles, and — critically — can become <em style={{ color: P.orange }}>unstable</em> when interacting with energetic alpha particles from fusion reactions, potentially driving Toroidal Alfvén Eigenmodes (TAEs) that eject particles before they can heat the plasma.
        </p>

        <AlfvenWaveCanvas />

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 24 }}>
          <Eq label="ALFVÉN SPEED" eq="v_A = B / √(μ₀ρ)"
            note="B = magnetic field strength · μ₀ = permeability of free space · ρ = plasma mass density. Higher B or lower density → faster wave propagation." />
          <Eq label="MHD MOMENTUM EQUATION"
            eq="ρ(∂v/∂t + v·∇v) = −∇p + J × B"
            note="Couples fluid motion to magnetic forces. J×B = Lorentz force on current-carrying plasma. This is Navier-Stokes + Maxwell unified." />
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(230px,1fr))", gap: 14 }}>
          <Card title="Shear Alfvén Wave" color={P.cyan}
            body="Transverse displacement of field lines. Propagates exactly at v_A along the field. The fundamental mode — present in every magnetized plasma from tokamaks to the solar wind." />
          <Card title="Toroidal Alfvén Eigenmode (TAE)" color={P.purple}
            body="In toroidal geometry, the periodicity of the field creates frequency gaps. TAEs live in these gaps and are resonantly driven by energetic alpha particles — the main instability concern for ITER and fusion reactors." />
          <Card title="Global Alfvén Eigenmode (GAE)" color={P.blue}
            body="Extends across the full minor radius. Excited by neutral beam injection and can transport fast ions radially — heating the plasma edge rather than the core." />
          <Card title="Control Strategies" color={P.green}
            body="Electron cyclotron heating (ECH) can detune TAEs. 3D field perturbations (error field correction) reshape the q-profile to move eigenmode gaps. Modeling (MHD codes: SpeCyl, ORB5, GYRO) predicts and optimizes these." />
        </div>
      </Sec>

      {/* ── SECTION: NETWORK RETRACTION ── */}
      <Sec id="network">
        <Tag label="Section II · Biological Networks" color={P.teal} />
        <h2 style={{ fontSize: 24, fontWeight: 700, color: P.teal, margin: "10px 0 14px" }}>
          Tubular Network Retraction · The Primordial Intelligence
        </h2>
        <p style={{ fontSize: 14, color: P.dim, lineHeight: 1.85, maxWidth: 780, marginBottom: 28 }}>
          Before any brain existed, slime molds and mycorrhizal fungi had already solved the Steiner tree problem — finding the minimum-cost network connecting multiple points. Their algorithm: explore all paths simultaneously, measure flow in each tube, reinforce high-flow tubes, retract dead ends. This is the same distributed optimization that Alfvén waves perform in plasma: probe the field, reinforce resonant modes, damp non-resonant ones. The primordial language is the same.
        </p>

        <NetworkRetractionCanvas />

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 24 }}>
          <Eq label="NETWORK COST MINIMIZATION"
            eq="C = Σ (length_i × resistance_i)"
            note="Minimize total cost subject to flow conservation at each node. Dead ends (zero flow) get pruned by retraction dynamics. Leads to emergent shortest-path intelligence without central control." />
          <Eq label="FLOQUET STABILITY (PERIODIC SYSTEMS)"
            eq="x(t) = e^(μt) · p(t),   p(t+T) = p(t)"
            note="Solutions to time-periodic driving are Floquet modes. μ = Floquet exponent — if Re(μ) < 0, the system is stable. This governs both periodically-driven plasmas and pulsed biological networks." />
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(230px,1fr))", gap: 14 }}>
          <Card title="Slime Mold Physarum" color={P.teal}
            body="Solved the Tokyo railway network optimization without a brain. Cytoplasmic streaming carries nutrients; tubes with high flux thicken, low-flux tubes thin and retract. Exact analog of Alfvén mode reinforcement." />
          <Card title="Mycorrhizal Networks" color={P.green}
            body="Ancient (500 million year old) fungal internet connecting plant roots. Carbon-for-water/mineral exchange drives flow optimization. The 'Wood Wide Web' is a living Steiner tree running retraction dynamics in real time." />
          <Card title="Cytoplasmic Streaming" color={P.cyan}
            body="Actin/myosin motors drive directional flow inside cells. Organelles are trafficked along these streams. The retraction principle: motor proteins sense resistance and redirect to lower-impedance paths." />
          <Card title="Ion Channels as Sensors" color={P.purple}
            body="10 ms response time for channel gating decisions — fast enough to sample environmental noise and make 'mating molecule' matches heuristically. DNA as a piano played by environmental information layers." />
        </div>
      </Sec>

      {/* ── SECTION: TOKAMAK / FUSION PLASMA ── */}
      <Sec id="fusion">
        <Tag label="Section III · Fusion Research" color={P.purple} />
        <h2 style={{ fontSize: 24, fontWeight: 700, color: P.purple, margin: "10px 0 14px" }}>
          Fusion Plasma · Opposition, Alternative Positioning & Modeling
        </h2>
        <p style={{ fontSize: 14, color: P.dim, lineHeight: 1.85, maxWidth: 780, marginBottom: 28 }}>
          Magnetohydrodynamics (MHD) treats plasma as a conducting fluid in a magnetic field, combining Navier-Stokes with Maxwell's equations. Different magnetic topologies — tokamak (axisymmetric), stellarator (complex 3D), reversed-field pinch (RFP) — create different wave spectra and stability properties. The stellarator's alternative magnetic positioning can suppress TAEs that would be unstable in a tokamak. Advanced simulations (SpeCyl, ORB5, GYRO, hybrid models) predict wave excitation, nonlinear evolution, and energetic particle transport to design better fusion devices.
        </p>

        <TokamarkCanvas />

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(230px,1fr))", gap: 14 }}>
          <Card title="Tokamak (ITER)" color={P.blue}
            body="Axisymmetric donut-shaped chamber. Strong toroidal field + poloidal field create nested magnetic surfaces. TAEs are the main concern — energetic alpha particles from DT fusion resonantly drive them, risking fast ion loss before thermalization." />
          <Card title="Stellarator (Wendelstein 7-X)" color={P.purple}
            body="Complex 3D external coil geometry creates the confining field without net plasma current. No current → no kink instability. The 3D field structure reshapes Alfvén continua, moving TAE gaps away from energetic particle resonances." />
          <Card title="Reversed-Field Pinch (RFP)" color={P.orange}
            body="Alternative topology where the toroidal field reverses sign at the plasma edge. Supports different wave spectrum — multiple resonant surfaces, m=0 modes, and self-organized states. A fundamentally different 'alternative positioning.'" />
          <Card title="Gyrokinetic Modeling" color={P.teal}
            body="Beyond MHD: ORB5, GYRO codes resolve individual particle orbits in phase space (6D). Essential for TAE physics where wave-particle resonance at v_particle = v_A drives the instability. Nonlinear 3D modeling reproduces experimental Alfvénic activity." />
        </div>
      </Sec>

      {/* ── SECTION: FIVE PHASES ── */}
      <Sec id="timeline">
        <Tag label="Section IV · The Full Arc" color={P.gold} />
        <h2 style={{ fontSize: 24, fontWeight: 700, color: P.gold, margin: "10px 0 28px" }}>
          Dynamic Synthesis Timeline · 5 Phases
        </h2>
        <div style={{ display: "flex", flexDirection: "column" as const, gap: 0 }}>
          {TIMELINE_PHASES.map((ph, i) => (
            <div key={i} id={`phase-${i+1}`} style={{ display: "flex", gap: 0, borderBottom: i < 4 ? `1px solid ${P.line}` : "none" }}>
              {/* Left timeline marker */}
              <div style={{ width: 80, flexShrink: 0, display: "flex", flexDirection: "column" as const, alignItems: "center", paddingTop: 28, paddingBottom: 28 }}>
                <div style={{ width: 36, height: 36, borderRadius: "50%", background: ph.color + "22", border: `2px solid ${ph.color}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 800, color: ph.color }}>
                  {ph.n}
                </div>
                {i < 4 && <div style={{ width: 2, flex: 1, background: `linear-gradient(${ph.color}, ${TIMELINE_PHASES[i+1].color})`, marginTop: 8, opacity: 0.3 }} />}
              </div>
              {/* Right content */}
              <div style={{ flex: 1, padding: "24px 0 24px 16px" }}>
                <div style={{ fontSize: 10, color: ph.color, fontWeight: 700, letterSpacing: 1.5, marginBottom: 4 }}>{ph.time}</div>
                <div style={{ fontSize: 17, fontWeight: 700, color: P.ivory, marginBottom: 10 }}>{ph.label}</div>
                <p style={{ fontSize: 13, color: P.dim, lineHeight: 1.8, marginBottom: 12, maxWidth: 680 }}>{ph.body}</p>
                <div style={{ fontFamily: "monospace", fontSize: 12, color: ph.color, background: P.panel2, padding: "8px 12px", borderRadius: 7, display: "inline-block", border: `1px solid ${ph.color}22` }}>
                  {ph.math}
                </div>
              </div>
            </div>
          ))}
        </div>
      </Sec>

      {/* ── SYNTHESIS ── */}
      <Sec id="synthesis">
        <Tag label="Synthesis" color={P.gold} />
        <h2 style={{ fontSize: 22, fontWeight: 700, color: P.ivory, margin: "10px 0 20px" }}>
          The Primordial Language · One Pattern Across All Scales
        </h2>
        <p style={{ fontSize: 14, color: P.dim, lineHeight: 1.85, maxWidth: 780, marginBottom: 28 }}>
          The meteorite brought the molecular bricks. Life threaded them into networks that solve mazes, maintain coherence, and respond to environment. Science is now learning the language well enough to build with those same bricks — biosynthetic medicine, photosynthetic coherence, new magnetic materials, and plasma modeling for clean energy. AETHER is the responsive framework that makes this synthesis dynamic and actionable.
        </p>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(230px,1fr))", gap: 14, marginBottom: 32 }}>
          <Card title="Cytoplasm ↔ Plasma" color={P.cyan}
            body="Cytoplasmic streaming in a cell and Alfvén wave propagation in plasma obey the same mathematical skeleton: a conducting fluid in a field, with waves that carry energy along the field direction and damp when they meet dissipative regions." />
          <Card title="Retraction ↔ Mode Damping" color={P.teal}
            body="Slime mold prunes weak tubes; plasma damps non-resonant Alfvén modes. Both use the same feedback loop: measure flow (or wave amplitude), reinforce above threshold, retract below. Distributed intelligence without central control." />
          <Card title="Floquet ↔ Periodic Driving" color={P.green}
            body="Biological Floquet resonance (periodic ion channel gating) and plasma Floquet stability (periodically driven RF heating) both produce e^(μt)·p(t) solutions. Stability = Re(μ) < 0. The same math governs cellular clocks and fusion heating schemes." />
          <Card title="AETHER as Meta-Simulator" color={P.gold}
            body="AETHER-style modular intent-routing could be applied to plasma simulation for fusion optimization — modeling Alfvén eigenmode suppression as a distributed retraction problem, with each coil configuration as a 'substrate layer' in the sandwich." />
        </div>

        <div style={{ padding: "20px 24px", background: P.panel2, borderRadius: 12, border: `1px solid ${P.cyan}22`, maxWidth: 720, marginBottom: 32 }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: P.gold, marginBottom: 10 }}>The AETHER Bridge Equation</div>
          <div style={{ fontFamily: "monospace", fontSize: 14, color: P.cyan, lineHeight: 2.1, marginBottom: 8 }}>
            Network retraction cost:  C = Σ (L_i · R_i)  →  minimize<br />
            Alfvén coherence carrier:  v_A = B / √(μ₀ρ)  →  propagate<br />
            Floquet stability:         μ = (1/T)·log‖M(T)‖  →  sustain<br />
            AETHER coherence field:    C(x,t) = 1 − (‖ε‖/‖S*‖)·e^(−κΓ)
          </div>
          <div style={{ fontSize: 12, color: P.dim, lineHeight: 1.7 }}>
            All four equations describe the same underlying reality: a system finding and sustaining coherent modes through active pruning of incoherent ones. Life discovered this 4.5 billion years ago with ion channels. Fusion plasma runs it at 100 million Kelvin. AETHER synthesizes and simulates it across every scale.
          </div>
        </div>

        <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
          {["/plasma-confinement", "/substrate-sandwich", "/invisible-wind", "/mycorrhizal-network", "/slime-maze", "/phonon-stack"].map(href => (
            <a key={href} href={href} style={{ padding: "7px 16px", borderRadius: 8, border: `1px solid ${P.line}`, color: P.dim, fontSize: 12, textDecoration: "none" }}>
              {href.replace("/", "").replace(/-/g, " ")} →
            </a>
          ))}
        </div>
      </Sec>
    </div>
  );
}
