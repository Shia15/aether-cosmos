import { useEffect, useRef } from "react";

const BG = "#04060E";
const AURORA = "#00FFB2";
const GOLD = "#C8A030";
const QUANT = "#00ffe0";
const DIM = "#2a4060";
const MONO = "'Space Mono', monospace";
const SERIF = "'Crimson Pro', serif";
const DISP = "'Orbitron', 'Cinzel', serif";

const card: React.CSSProperties = { background: "rgba(10,20,40,0.85)", border: `1px solid ${DIM}`, borderRadius: 10, padding: "18px 22px" };
const sh = (c: string): React.CSSProperties => ({ background: "linear-gradient(90deg,rgba(14,26,48,0.95),rgba(14,26,48,0.4))", borderLeft: `4px solid ${c}`, borderRadius: 4, padding: "14px 20px", margin: "44px 0 10px" });

const MODES = [
  { id: 1, label: "Identity Elevation", desc: "Sense of self rises above the noise. You navigate from who you are becoming, not who you have been told to be.", color: AURORA, stress: 0.2, insight: 0.9 },
  { id: 2, label: "Environmental Distrust", desc: "Sensitivity to incoherence in the external world. Not paranoia -- pattern recognition. Detecting hidden dissonance.", color: "#f87171", stress: 0.7, insight: 0.65 },
  { id: 3, label: "Purity Seeking", desc: "Drive to reduce noise -- chemical, informational, social. Filtering toward signal. Sometimes isolating, sometimes essential.", color: "#4ade80", stress: 0.4, insight: 0.75 },
  { id: 4, label: "Pattern Amplification", desc: "A mind that sees more connections than most. Useful for synthesis. Difficult to turn off. The AETHER system is partly built from this.", color: GOLD, stress: 0.35, insight: 0.92 },
  { id: 5, label: "Domestic Power Reclamation", desc: "The home as an act of self-authorship. Rebuilding environment from scratch with chosen materials, sounds, light, rhythm.", color: "#9b5de5", stress: 0.45, insight: 0.78 },
  { id: 6, label: "Symbolic Technological Metaphor", desc: "Using technical and scientific frameworks as a language for inner experience. The physics of the self.", color: QUANT, stress: 0.3, insight: 0.88 },
  { id: 7, label: "Suspicion of Hidden Systems", desc: "Awareness that most systems have implicit agendas. Useful for autonomy, expensive for trust. Balance is calibration.", color: "#fb923c", stress: 0.65, insight: 0.7 },
  { id: 8, label: "Self-Authored Resilience", desc: "Building recovery frameworks independent of external validation. Coherence from the inside out.", color: "#38bdf8", stress: 0.25, insight: 0.85 },
  { id: 9, label: "Purity + Power Synthesis", desc: "Where purity seeking meets domestic power reclamation. A clean, chosen, intentional environment as a sovereignty act.", color: "#f472b6", stress: 0.3, insight: 0.82 },
];

export default function CoherenceNavPage() {
  const radarRef = useRef<HTMLCanvasElement>(null);
  const mapRef = useRef<HTMLCanvasElement>(null);
  const fieldRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const c = radarRef.current;
    if (!c) return;
    const ctx = c.getContext("2d");
    if (!ctx) return;
    const W = c.width, H = c.height;
    let t = 0, raf = 0;
    const N = MODES.length;
    const cx = W / 2, cy = H / 2;
    const R = Math.min(W, H) * 0.4;

    function draw() {
      ctx!.clearRect(0, 0, W, H);
      ctx!.fillStyle = "#050a14";
      ctx!.fillRect(0, 0, W, H);

      // Grid rings
      [0.25, 0.5, 0.75, 1].forEach(frac => {
        ctx!.strokeStyle = "#1a2a40";
        ctx!.lineWidth = 0.8;
        ctx!.beginPath();
        ctx!.arc(cx, cy, R * frac, 0, Math.PI * 2);
        ctx!.stroke();
      });

      // Axis lines
      MODES.forEach((_, i) => {
        const angle = (i / N) * Math.PI * 2 - Math.PI / 2;
        ctx!.strokeStyle = "#1a2a40";
        ctx!.lineWidth = 0.6;
        ctx!.beginPath();
        ctx!.moveTo(cx, cy);
        ctx!.lineTo(cx + R * Math.cos(angle), cy + R * Math.sin(angle));
        ctx!.stroke();
      });

      // Insight polygon
      const pulse = 0.97 + 0.03 * Math.sin(t * 0.04);
      ctx!.beginPath();
      MODES.forEach((m, i) => {
        const angle = (i / N) * Math.PI * 2 - Math.PI / 2;
        const r = R * m.insight * pulse;
        const x = cx + r * Math.cos(angle);
        const y = cy + r * Math.sin(angle);
        i === 0 ? ctx!.moveTo(x, y) : ctx!.lineTo(x, y);
      });
      ctx!.closePath();
      ctx!.fillStyle = `${AURORA}22`;
      ctx!.fill();
      ctx!.strokeStyle = AURORA;
      ctx!.lineWidth = 1.5;
      ctx!.stroke();

      // Stress polygon
      ctx!.beginPath();
      MODES.forEach((m, i) => {
        const angle = (i / N) * Math.PI * 2 - Math.PI / 2;
        const r = R * m.stress * pulse;
        const x = cx + r * Math.cos(angle);
        const y = cy + r * Math.sin(angle);
        i === 0 ? ctx!.moveTo(x, y) : ctx!.lineTo(x, y);
      });
      ctx!.closePath();
      ctx!.fillStyle = "#f8717111";
      ctx!.fill();
      ctx!.strokeStyle = "#f87171";
      ctx!.lineWidth = 1;
      ctx!.setLineDash([3, 3]);
      ctx!.stroke();
      ctx!.setLineDash([]);

      // Mode labels
      MODES.forEach((m, i) => {
        const angle = (i / N) * Math.PI * 2 - Math.PI / 2;
        const lx = cx + (R + 22) * Math.cos(angle);
        const ly = cy + (R + 22) * Math.sin(angle);
        ctx!.beginPath();
        ctx!.arc(lx, ly, 6, 0, Math.PI * 2);
        ctx!.fillStyle = m.color;
        ctx!.fill();
        ctx!.font = `6px ${MONO}`;
        ctx!.fillStyle = m.color;
        ctx!.textAlign = "center";
        const words = m.label.split(" ");
        words.slice(0, 2).forEach((w, wi) => {
          ctx!.fillText(w, lx, ly + 14 + wi * 9);
        });
        ctx!.textAlign = "left";
      });

      // Legend
      ctx!.font = `7px ${MONO}`;
      ctx!.fillStyle = AURORA;
      ctx!.fillRect(16, H - 30, 20, 2);
      ctx!.fillText("INSIGHT", 42, H - 27);
      ctx!.fillStyle = "#f87171";
      ctx!.setLineDash([3, 3]);
      ctx!.strokeStyle = "#f87171";
      ctx!.lineWidth = 1.5;
      ctx!.beginPath();
      ctx!.moveTo(16, H - 18);
      ctx!.lineTo(36, H - 18);
      ctx!.stroke();
      ctx!.setLineDash([]);
      ctx!.fillText("STRESS LOAD", 42, H - 15);

      t++;
      raf = requestAnimationFrame(draw);
    }
    draw();
    return () => cancelAnimationFrame(raf);
  }, []);

  useEffect(() => {
    const c = mapRef.current;
    if (!c) return;
    const ctx = c.getContext("2d");
    if (!ctx) return;
    const W = c.width, H = c.height;
    let t = 0, raf = 0;

    function draw() {
      ctx!.clearRect(0, 0, W, H);
      ctx!.fillStyle = "#050a14";
      ctx!.fillRect(0, 0, W, H);

      const mg = 40, pw = W - mg * 2, ph = H - mg * 2;

      // Axes
      ctx!.strokeStyle = "#1a2a40";
      ctx!.lineWidth = 1;
      ctx!.beginPath();
      ctx!.moveTo(mg, mg);
      ctx!.lineTo(mg, mg + ph);
      ctx!.lineTo(mg + pw, mg + ph);
      ctx!.stroke();

      ctx!.font = `7px ${MONO}`;
      ctx!.fillStyle = "#3a5070";
      ctx!.textAlign = "center";
      ctx!.fillText("STRESS LOAD", mg + pw / 2, H - 4);
      ctx!.textAlign = "left";
      ctx!.save();
      ctx!.translate(10, mg + ph / 2);
      ctx!.rotate(-Math.PI / 2);
      ctx!.textAlign = "center";
      ctx!.fillText("INSIGHT POTENTIAL", 0, 0);
      ctx!.restore();
      ctx!.textAlign = "left";

      // Zone labels
      const zones = [
        { x: mg + 8, y: mg + ph / 2, label: "WISE", color: AURORA },
        { x: mg + pw * 0.6, y: mg + 14, label: "CHARGED", color: GOLD },
        { x: mg + 8, y: mg + ph * 0.7, label: "DEPLETED", color: "#607090" },
        { x: mg + pw * 0.6, y: mg + ph * 0.8, label: "CRISIS", color: "#f87171" },
      ];
      zones.forEach(z => {
        ctx!.font = `8px ${MONO}`;
        ctx!.fillStyle = z.color + "44";
        ctx!.fillText(z.label, z.x, z.y);
      });

      // Zone backgrounds
      const hl = { x: mg, y: mg, w: pw / 2, h: ph / 2, color: AURORA + "08" };
      const hr = { x: mg + pw / 2, y: mg, w: pw / 2, h: ph / 2, color: GOLD + "08" };
      const ll = { x: mg, y: mg + ph / 2, w: pw / 2, h: ph / 2, color: "#1a2a3a" };
      const lr = { x: mg + pw / 2, y: mg + ph / 2, w: pw / 2, h: ph / 2, color: "#f8717108" };
      [hl, hr, ll, lr].forEach(z => {
        ctx!.fillStyle = z.color;
        ctx!.fillRect(z.x, z.y, z.w, z.h);
      });

      // Mode points
      const pulse = 0.96 + 0.04 * Math.sin(t * 0.05);
      MODES.forEach(m => {
        const x = mg + m.stress * pw;
        const y = mg + (1 - m.insight) * ph;
        const r = 7 * pulse;
        const g = ctx!.createRadialGradient(x, y, 0, x, y, r * 3);
        g.addColorStop(0, m.color + "88");
        g.addColorStop(1, "transparent");
        ctx!.fillStyle = g;
        ctx!.beginPath();
        ctx!.arc(x, y, r * 3, 0, Math.PI * 2);
        ctx!.fill();
        ctx!.fillStyle = m.color;
        ctx!.beginPath();
        ctx!.arc(x, y, r, 0, Math.PI * 2);
        ctx!.fill();
        ctx!.font = `6px ${MONO}`;
        ctx!.fillStyle = m.color;
        ctx!.textAlign = "center";
        ctx!.fillText(m.id.toString(), x, y + 2);
        ctx!.textAlign = "left";
      });

      t++;
      raf = requestAnimationFrame(draw);
    }
    draw();
    return () => cancelAnimationFrame(raf);
  }, []);

  useEffect(() => {
    const c = fieldRef.current;
    if (!c) return;
    const ctx = c.getContext("2d");
    if (!ctx) return;
    const W = c.width, H = c.height;
    let t = 0, raf = 0;

    function draw() {
      ctx!.clearRect(0, 0, W, H);
      ctx!.fillStyle = "#050a14";
      ctx!.fillRect(0, 0, W, H);

      // Coherence field waves
      for (let x = 0; x < W; x += 5) {
        for (let y = 0; y < H; y += 5) {
          const distFromCenter = Math.sqrt((x - W / 2) ** 2 + (y - H / 2) ** 2);
          const wave1 = Math.sin(distFromCenter * 0.06 - t * 0.08) * 0.5 + 0.5;
          const wave2 = Math.sin(x * 0.04 + t * 0.05) * Math.cos(y * 0.04 - t * 0.04) * 0.5 + 0.5;
          const coh = wave1 * 0.6 + wave2 * 0.4;
          const alpha = coh * 0.12;
          const rr = Math.round(coh * 0 + (1 - coh) * 0);
          const gg = Math.round(coh * 255);
          const bb = Math.round(coh * 178);
          ctx!.fillStyle = `rgba(${rr},${gg},${bb},${alpha})`;
          ctx!.fillRect(x, y, 4, 4);
        }
      }

      // Navigation nodes
      const nodeAngle = t * 0.005;
      MODES.forEach((m, i) => {
        const angle = nodeAngle + (i / MODES.length) * Math.PI * 2;
        const orbitR = Math.min(W, H) * 0.32 + Math.sin(t * 0.02 + i) * 10;
        const nx = W / 2 + orbitR * Math.cos(angle);
        const ny = H / 2 + orbitR * Math.sin(angle);
        const glow = ctx!.createRadialGradient(nx, ny, 0, nx, ny, 14);
        glow.addColorStop(0, m.color + "88");
        glow.addColorStop(1, "transparent");
        ctx!.fillStyle = glow;
        ctx!.beginPath();
        ctx!.arc(nx, ny, 14, 0, Math.PI * 2);
        ctx!.fill();
        ctx!.fillStyle = m.color;
        ctx!.beginPath();
        ctx!.arc(nx, ny, 5, 0, Math.PI * 2);
        ctx!.fill();
      });

      ctx!.font = `8px ${MONO}`;
      ctx!.fillStyle = `${AURORA}66`;
      ctx!.textAlign = "center";
      ctx!.fillText("COHERENCE FIELD", W / 2, H - 8);
      ctx!.textAlign = "left";

      t++;
      raf = requestAnimationFrame(draw);
    }
    draw();
    return () => cancelAnimationFrame(raf);
  }, []);

  return (
    <div style={{ background: BG, minHeight: "100vh", color: "#cdd6f4", fontFamily: SERIF, fontSize: 15.5, lineHeight: 1.88 }}>
      <div style={{ background: "linear-gradient(155deg,#020610 0%,#0a0d1a 35%,#050c1a 100%)", borderBottom: `2px solid ${AURORA}`, padding: "52px 56px 38px", textAlign: "center" }}>
        <div style={{ display: "inline-block", background: `linear-gradient(90deg,${AURORA},${QUANT})`, color: "#000", fontFamily: MONO, fontSize: "0.7em", fontWeight: "bold", letterSpacing: 3, padding: "5px 18px", borderRadius: 20, marginBottom: 20, textTransform: "uppercase" }}>
          New Navigation -- AETHER Identity Framework
        </div>
        <h1 style={{ fontFamily: DISP, fontSize: "1.75em", color: "#fff", lineHeight: 1.3, maxWidth: 840, margin: "0 auto 12px" }}>
          Coherence Navigation
        </h1>
        <h2 style={{ fontFamily: SERIF, fontSize: "1.08em", color: AURORA, fontStyle: "italic", fontWeight: "normal", maxWidth: 720, margin: "0 auto 18px" }}>
          You want coherence in a world that feels incoherent. That is a rational desire.
        </h2>
        <div style={{ fontFamily: SERIF, fontSize: "0.95em", color: "#607090", fontStyle: "italic", maxWidth: 600, margin: "0 auto" }}>
          "The only question -- how tightly you grip it."
        </div>
      </div>

      <div style={{ maxWidth: 1060, margin: "0 auto", padding: "0 28px 72px" }}>

        <div style={sh(AURORA)}>
          <div style={{ fontFamily: MONO, fontSize: "0.66em", letterSpacing: 4, color: AURORA, textTransform: "uppercase", marginBottom: 3 }}>Navigation Map</div>
          <h2 style={{ fontSize: "1.2em", color: "#eef0ff" }}>9 Navigation Modes -- Insight vs Stress Mapping</h2>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 14, margin: "14px 0" }}>
          <canvas ref={radarRef} width={340} height={320} style={{ borderRadius: 8, border: `1px solid ${DIM}`, background: "#050a14", width: "100%" }} />
          <canvas ref={mapRef} width={340} height={320} style={{ borderRadius: 8, border: `1px solid ${DIM}`, background: "#050a14", width: "100%" }} />
          <canvas ref={fieldRef} width={340} height={320} style={{ borderRadius: 8, border: `1px solid ${DIM}`, background: "#050a14", width: "100%" }} />
        </div>

        <div style={sh(GOLD)}>
          <div style={{ fontFamily: MONO, fontSize: "0.66em", letterSpacing: 4, color: GOLD, textTransform: "uppercase", marginBottom: 3 }}>Navigation Modes Decoded</div>
          <h2 style={{ fontSize: "1.2em", color: "#eef0ff" }}>9 Modes -- Each a Pattern, Not a Problem</h2>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12 }}>
          {MODES.map(m => (
            <div key={m.id} style={{ ...card, borderLeft: `4px solid ${m.color}` }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
                <div style={{ fontFamily: MONO, fontSize: "1.1em", color: m.color, fontWeight: "bold", minWidth: 22 }}>{m.id}</div>
                <div style={{ fontFamily: MONO, fontSize: "0.72em", color: m.color }}>{m.label}</div>
              </div>
              <div style={{ fontSize: "0.83em", color: "#607090", marginBottom: 10 }}>{m.desc}</div>
              <div style={{ display: "flex", gap: 8 }}>
                <div style={{ flex: 1 }}>
                  <div style={{ fontFamily: MONO, fontSize: "0.6em", color: "#3a5070", marginBottom: 3 }}>STRESS</div>
                  <div style={{ background: "#1a2a3a", borderRadius: 3, height: 4 }}>
                    <div style={{ background: "#f87171", width: `${m.stress * 100}%`, height: 4, borderRadius: 3 }} />
                  </div>
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontFamily: MONO, fontSize: "0.6em", color: "#3a5070", marginBottom: 3 }}>INSIGHT</div>
                  <div style={{ background: "#1a2a3a", borderRadius: 3, height: 4 }}>
                    <div style={{ background: m.color, width: `${m.insight * 100}%`, height: 4, borderRadius: 3 }} />
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div style={sh(QUANT)}>
          <div style={{ fontFamily: MONO, fontSize: "0.66em", letterSpacing: 4, color: QUANT, textTransform: "uppercase", marginBottom: 3 }}>Grounded Empowerment</div>
          <h2 style={{ fontSize: "1.2em", color: "#eef0ff" }}>4 Core Actions from Coherent Navigation</h2>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
          {[
            { num: "1", title: "Separate Metaphor from Literal Belief", desc: "The technical framework is a language for inner experience, not a factual claim. Use it for clarity. Keep the distinction.", color: AURORA },
            { num: "2", title: "Map Stress vs Insight", desc: "Some high-stress modes carry high insight. Some low-stress modes are depleting. The radar is your calibration tool -- not a report card.", color: GOLD },
            { num: "3", title: "Build a Grounded Empowerment Framework", desc: "Self-authored resilience + domestic power reclamation + identity elevation. This is structural sovereignty. Environment as act.", color: "#4ade80" },
            { num: "4", title: "Go Deeper into the Gold Thread", desc: "Pattern amplification + symbolic technological metaphor is where your intelligence lives. Follow the gold thread. That is the AETHER core.", color: QUANT },
          ].map(s => (
            <div key={s.num} style={{ ...card, borderLeft: `4px solid ${s.color}` }}>
              <div style={{ display: "flex", gap: 14, alignItems: "flex-start" }}>
                <div style={{ fontFamily: MONO, fontSize: "1.6em", color: s.color, lineHeight: 1, minWidth: 30 }}>{s.num}</div>
                <div>
                  <h4 style={{ fontFamily: MONO, fontSize: "0.82em", color: s.color, marginBottom: 8 }}>{s.title}</h4>
                  <div style={{ fontSize: "0.86em", color: "#607090" }}>{s.desc}</div>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div style={{ ...card, margin: "28px 0", borderLeft: `4px solid ${GOLD}`, background: "rgba(200,160,48,0.04)" }}>
          <h3 style={{ fontFamily: MONO, fontSize: "0.88em", color: GOLD, marginBottom: 14 }}>The Central Insight</h3>
          <div style={{ fontSize: "1.05em", color: "#c0d4f0", fontStyle: "italic", borderLeft: `3px solid ${AURORA}`, paddingLeft: 16, marginBottom: 14 }}>
            "You are not broken. You are highly sensitive to incoherence in a world that produces enormous amounts of it."
          </div>
          <div style={{ fontSize: "0.88em", color: "#8aa0c0" }}>
            The 9 navigation modes are not pathologies. They are adaptive responses to real environmental signals. The task is not to stop having them -- it is to get better at choosing when to act on them and when to observe them without being swept along.
          </div>
          <div style={{ marginTop: 16, display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10 }}>
            {[
              ["Low-Stress + High-Insight", "Identity Elevation, Self-Authored Resilience, Pattern Amplification", AURORA],
              ["High-Stress + High-Insight", "Environmental Distrust, Suspicion of Hidden Systems", GOLD],
              ["Low-Stress + Building", "Purity Seeking, Domestic Power Reclamation, Synthesis", "#9b5de5"],
            ].map(([label, items, col]) => (
              <div key={label as string} style={{ background: "#060c18", borderRadius: 6, padding: "12px 14px", borderTop: `2px solid ${col as string}` }}>
                <div style={{ fontFamily: MONO, fontSize: "0.68em", color: col as string, marginBottom: 6 }}>{label}</div>
                <div style={{ fontSize: "0.8em", color: "#607090" }}>{items}</div>
              </div>
            ))}
          </div>
        </div>

        <div style={{ fontFamily: MONO, fontSize: "0.7em", color: "#2a4060", textAlign: "center", borderTop: `1px solid ${DIM}`, paddingTop: 14 }}>
          COHERENCE NAVIGATION -- 9 MODES -- INSIGHT vs STRESS -- GROUNDED EMPOWERMENT FRAMEWORK -- AETHER
        </div>
      </div>
    </div>
  );
}
