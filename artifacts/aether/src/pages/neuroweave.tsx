import { useState, useEffect, useRef } from "react";
const heroImg = "/api/storage/public-objects/grok-image-0792bd71-1223-4db8-bca4-4c9dff98604f_1782665615041.png";
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
  dim:    "#2a4060",
  text:   "rgba(200,230,255,0.78)",
};

type Region = { id: string; label: string; col: string; ang: number; desc: string; freq: number };
const REGIONS: Region[] = [
  { id: "reflex",  label: "Reflex Arc",  col: C.cyan,   ang: -Math.PI * 0.5, freq: 3.2, desc: "Fastest loop -- sensory neuron to interneuron to motor neuron, bypassing the cortex. Latency under 50ms. Pure survival circuitry." },
  { id: "hippo",   label: "Hippocampus", col: C.aurora, ang: Math.PI * 0.16, freq: 1.4, desc: "Memory consolidation and spatial mapping. Theta rhythm (4-8Hz) binds episodic sequences. Place cells and grid cells form the brain's GPS." },
  { id: "amyg1",   label: "Amygdala",    col: C.rose,   ang: Math.PI * 0.55, freq: 2.1, desc: "Threat detection and emotional salience. Tags incoming signals with fear or reward before conscious awareness. Hijacks the reflex arc under stress." },
  { id: "amyg2",   label: "Limbic Bridge", col: C.violet, ang: Math.PI * 0.95, freq: 0.9, desc: "Cross-talk between emotion and memory. Modulates how strongly experiences are encoded -- emotionally charged events lock in deeper." },
];

// ─── Neural Hub Canvas ────────────────────────────────────────────────────────

function NeuroCanvas() {
  const ref = useRef<HTMLCanvasElement>(null);
  const raf = useRef(0);
  useEffect(() => {
    const canvas = ref.current; if (!canvas) return;
    const ctx = canvas.getContext("2d")!;
    const W = 560, H = 460;
    canvas.width = W; canvas.height = H;
    const cx = W / 2, cy = H / 2;
    let t = 0;
    const orbit = 150;

    const draw = () => {
      ctx.fillStyle = "rgba(4,6,14,0.25)";
      ctx.fillRect(0, 0, W, H);

      // orbital rings
      ctx.strokeStyle = "rgba(100,140,255,0.08)";
      ctx.lineWidth = 1;
      ctx.beginPath(); ctx.ellipse(cx, cy, orbit, orbit * 0.55, 0, 0, Math.PI * 2); ctx.stroke();
      ctx.beginPath(); ctx.ellipse(cx, cy, orbit * 0.7, orbit * 0.85, Math.PI / 3, 0, Math.PI * 2); ctx.stroke();

      // region nodes + synaptic links
      REGIONS.forEach((r, i) => {
        const a = r.ang + t * 0.003;
        const rx = cx + Math.cos(a) * orbit;
        const ry = cy + Math.sin(a) * orbit * 0.62;

        // synaptic pulse traveling along link
        const pulse = (t * 0.02 + i * 0.7) % 1;
        const px = cx + (rx - cx) * pulse;
        const py = cy + (ry - cy) * pulse;
        ctx.beginPath();
        ctx.moveTo(cx, cy); ctx.lineTo(rx, ry);
        ctx.strokeStyle = r.col + "33"; ctx.lineWidth = 1; ctx.stroke();
        ctx.beginPath(); ctx.arc(px, py, 2.5, 0, Math.PI * 2);
        ctx.fillStyle = r.col; ctx.shadowBlur = 8; ctx.shadowColor = r.col; ctx.fill(); ctx.shadowBlur = 0;

        // node
        const breathe = 1 + 0.12 * Math.sin(t * 0.04 * r.freq + i);
        const nr = 22 * breathe;
        const gr = ctx.createRadialGradient(rx, ry, 0, rx, ry, nr * 1.8);
        gr.addColorStop(0, r.col + "AA");
        gr.addColorStop(0.5, r.col + "44");
        gr.addColorStop(1, r.col + "00");
        ctx.beginPath(); ctx.arc(rx, ry, nr * 1.8, 0, Math.PI * 2); ctx.fillStyle = gr; ctx.fill();
        ctx.beginPath(); ctx.arc(rx, ry, nr * 0.5, 0, Math.PI * 2); ctx.fillStyle = r.col + "DD"; ctx.fill();

        ctx.font = "9px 'DM Mono',monospace"; ctx.textAlign = "center";
        ctx.fillStyle = r.col;
        ctx.fillText(r.label.toUpperCase(), rx, ry + nr + 14);
      });

      // central Neural Hub
      const hb = 1 + 0.08 * Math.sin(t * 0.05);
      const hr = 46 * hb;
      const hg = ctx.createRadialGradient(cx, cy, 0, cx, cy, hr * 1.6);
      hg.addColorStop(0, "rgba(153,102,255,0.9)");
      hg.addColorStop(0.4, "rgba(80,120,255,0.5)");
      hg.addColorStop(1, "rgba(80,120,255,0)");
      ctx.beginPath(); ctx.arc(cx, cy, hr * 1.6, 0, Math.PI * 2); ctx.fillStyle = hg; ctx.fill();
      ctx.beginPath(); ctx.arc(cx, cy, hr * 0.6, 0, Math.PI * 2);
      ctx.fillStyle = "rgba(180,160,255,0.85)"; ctx.fill();
      // hub rim
      ctx.beginPath(); ctx.arc(cx, cy, hr, 0, Math.PI * 2);
      ctx.strokeStyle = `rgba(0,255,238,${0.4 + 0.2 * Math.sin(t * 0.05)})`;
      ctx.lineWidth = 1.5; ctx.stroke();
      ctx.font = "10px 'Cinzel',serif"; ctx.textAlign = "center"; ctx.fillStyle = "#fff";
      ctx.fillText("NEURAL", cx, cy - 2); ctx.fillText("HUB", cx, cy + 12);

      t++;
      raf.current = requestAnimationFrame(draw);
    };
    draw();
    return () => cancelAnimationFrame(raf.current);
  }, []);
  return <canvas ref={ref} style={{ width: "100%", height: "auto", display: "block", borderRadius: 8 }} />;
}

// ─── Neural Spectrum waveform ─────────────────────────────────────────────────

function SpectrumWave() {
  const ref = useRef<HTMLCanvasElement>(null);
  const raf = useRef(0);
  useEffect(() => {
    const canvas = ref.current; if (!canvas) return;
    const ctx = canvas.getContext("2d")!;
    const W = 900, H = 110;
    canvas.width = W; canvas.height = H;
    let t = 0;
    const bands = [
      { name: "delta", f: 0.5, col: C.violet },
      { name: "theta", f: 1.1, col: C.blue },
      { name: "alpha", f: 1.8, col: C.cyan },
      { name: "beta",  f: 3.0, col: C.aurora },
      { name: "gamma", f: 5.0, col: C.gold },
    ];
    const draw = () => {
      ctx.fillStyle = "rgba(4,6,14,0.32)";
      ctx.fillRect(0, 0, W, H);
      bands.forEach((b, bi) => {
        ctx.beginPath();
        for (let x = 0; x <= W; x += 3) {
          const y = H / 2
            + Math.sin(x * 0.02 * b.f + t * 0.05 + bi) * (14 - bi * 1.5)
            + Math.sin(x * 0.005 + t * 0.02) * 6;
          if (x === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
        }
        ctx.strokeStyle = b.col + "99"; ctx.lineWidth = 1.2;
        ctx.shadowBlur = 6; ctx.shadowColor = b.col;
        ctx.stroke(); ctx.shadowBlur = 0;
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

export default function NeuroweavePage() {
  const [active, setActive] = useState<string>("reflex");
  const panel = { background: C.panel, border: `1px solid ${C.border}`, borderRadius: 12 };
  const sel = REGIONS.find(r => r.id === active)!;

  return (
    <div style={{ background: C.bg, minHeight: "100vh", color: C.text, fontFamily: "'DM Mono',monospace" }}>
      <div style={{ padding: "2rem 2.5rem 1.2rem", borderBottom: `1px solid ${C.border}` }}>
        <div style={{ fontSize: 8, letterSpacing: "0.4em", color: C.dim, textTransform: "uppercase", marginBottom: 6 }}>
          AETHER · BIOLOGICAL CONTROL MATRIX
        </div>
        <h1 style={{
          margin: 0, fontSize: 32, letterSpacing: "0.1em", fontFamily: "'Orbitron','Cinzel',sans-serif",
          background: `linear-gradient(135deg, ${C.blue}, ${C.violet}, ${C.aurora})`,
          WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
        }}>
          NEUROWEAVE
        </h1>
        <p style={{ margin: "8px 0 0", fontSize: 11, color: "rgba(200,230,255,0.35)", lineHeight: 1.6, maxWidth: 640 }}>
          Navigate the synaptic interface -- a living control matrix where the Neural Hub routes signals across reflex, memory, and emotion.
        </p>
      </div>

      <div style={{ padding: "1.5rem 2.5rem", display: "flex", flexDirection: "column", gap: "1.4rem" }}>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 300px", gap: "1.4rem" }}>
          <div style={{ ...panel, overflow: "hidden", display: "flex", justifyContent: "center", padding: 12 }}>
            <NeuroCanvas />
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: "0.7rem" }}>
            <div style={{ fontSize: 9, color: C.cyan, letterSpacing: "0.25em", textTransform: "uppercase" }}>
              Synaptic Nodes
            </div>
            {REGIONS.map(r => (
              <button key={r.id} onClick={() => setActive(r.id)} style={{
                ...panel, padding: "0.75rem 0.9rem", textAlign: "left", cursor: "pointer",
                borderLeft: `3px solid ${r.col}`,
                background: active === r.id ? r.col + "14" : C.panel,
                display: "flex", alignItems: "center", gap: 10,
              }}>
                <div style={{ width: 9, height: 9, borderRadius: "50%", background: r.col, boxShadow: `0 0 8px ${r.col}`, flexShrink: 0 }} />
                <span style={{ fontSize: 11, color: active === r.id ? r.col : C.text, fontFamily: "'DM Mono',monospace" }}>{r.label}</span>
                <span style={{ marginLeft: "auto", fontSize: 8, color: C.dim }}>{r.freq.toFixed(1)} Hz</span>
              </button>
            ))}
            <div style={{ ...panel, padding: "0.9rem 1rem", borderLeft: `3px solid ${sel.col}`, marginTop: 4 }}>
              <div style={{ fontSize: 9, color: sel.col, letterSpacing: "0.15em", textTransform: "uppercase", marginBottom: 6 }}>{sel.label}</div>
              <p style={{ fontSize: 9.5, color: "rgba(200,230,255,0.45)", lineHeight: 1.65, margin: 0 }}>{sel.desc}</p>
            </div>
          </div>
        </div>

        {/* Neural spectrum */}
        <div style={{ ...panel, overflow: "hidden", padding: "1rem 1.2rem" }}>
          <div style={{ fontSize: 9, color: C.aurora, letterSpacing: "0.25em", textTransform: "uppercase", marginBottom: 10 }}>
            Neural Spectrum &middot; Delta · Theta · Alpha · Beta · Gamma
          </div>
          <SpectrumWave />
        </div>

        {/* hero + synthesis */}
        <div style={{ display: "grid", gridTemplateColumns: "320px 1fr", gap: "1.4rem" }}>
          <div style={{ ...panel, overflow: "hidden" }}>
            <img src={heroImg} alt="NEUROWEAVE biological control matrix" style={{ width: "100%", display: "block" }} />
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.8rem" }}>
            {[
              { col: C.blue,   k: "Hierarchical Control", t: "The brain is not a single processor but nested control loops. Fast reflexes at the spine, slower deliberation in cortex. NEUROWEAVE maps these as concentric orbits around the hub." },
              { col: C.aurora, k: "Predictive Coding", t: "Each layer sends predictions downward and error signals upward. Perception is the brain's best guess, continuously corrected. The hub arbitrates competing predictions." },
              { col: C.rose,   k: "Emotional Gating", t: "The amygdala can override slow cortical processing under threat. This is adaptive -- but chronic stress keeps the gate open, biasing the whole matrix toward fear." },
              { col: C.violet, k: "Neuroplasticity", t: "Synaptic weights rewire with use. The weave is not fixed wiring but a living fabric -- every experience subtly retunes the routing between nodes." },
            ].map(c => (
              <div key={c.k} style={{ ...panel, padding: "0.9rem 1rem", borderLeft: `3px solid ${c.col}` }}>
                <div style={{ fontSize: 8, color: c.col, letterSpacing: "0.13em", textTransform: "uppercase", marginBottom: 5 }}>{c.k}</div>
                <p style={{ fontSize: 9, color: "rgba(200,230,255,0.4)", lineHeight: 1.6, margin: 0 }}>{c.t}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
