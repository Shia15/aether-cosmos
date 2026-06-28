import { useEffect, useRef } from "react";

const BG = "#04060E";
const AURORA = "#00FFB2";
const GOLD = "#C8A030";
const QUANT = "#00ffe0";
const DIM = "#2a4060";
const MONO = "'Space Mono', monospace";
const SERIF = "'Crimson Pro', serif";
const DISP = "'Orbitron', 'Cinzel', serif";

const card: React.CSSProperties = { background: "rgba(10,20,40,0.85)", border: `1px solid ${DIM}`, borderRadius: 10, padding: "20px 24px" };
const sh = (c: string): React.CSSProperties => ({ background: "linear-gradient(90deg,rgba(14,26,48,0.95),rgba(14,26,48,0.4))", borderLeft: `4px solid ${c}`, borderRadius: 4, padding: "16px 22px", margin: "48px 0 10px" });
const lbl = (c: string): React.CSSProperties => ({ fontFamily: MONO, fontSize: "0.66em", letterSpacing: 4, color: c, textTransform: "uppercase", marginBottom: 3 });
const eq: React.CSSProperties = { background: "#060c18", border: `1px solid ${DIM}`, borderLeft: `3px solid ${AURORA}`, borderRadius: 6, padding: "14px 20px", margin: "14px 0", fontFamily: MONO, fontSize: "0.82em", color: QUANT, whiteSpace: "pre" };

export default function PhotosynthesisPlanetPage() {
  const reactionRef = useRef<HTMLCanvasElement>(null);
  const oxygenRef = useRef<HTMLCanvasElement>(null);
  const biosigRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const c = reactionRef.current;
    if (!c) return;
    const ctx = c.getContext("2d");
    if (!ctx) return;
    const W = c.width, H = c.height;
    let t = 0, raf = 0;

    type RMol = { x: number; y: number; vx: number; vy: number; label: string; color: string; r: number; life: number };
    const inputMols: RMol[] = [];
    const outputMols: RMol[] = [];

    function spawnInput() {
      const types = [
        { label: "CO2", color: "#f87171", r: 8 },
        { label: "H2O", color: "#38bdf8", r: 7 },
        { label: "h*v", color: GOLD, r: 6 },
      ];
      const tp = types[Math.floor(Math.random() * types.length)];
      inputMols.push({ x: 30, y: 20 + Math.random() * (H - 40), vx: 1.2 + Math.random() * 0.6, vy: (Math.random() - 0.5) * 0.5, ...tp, life: 1 });
    }

    function draw() {
      ctx!.clearRect(0, 0, W, H);
      ctx!.fillStyle = "#050a14";
      ctx!.fillRect(0, 0, W, H);

      const cx = W / 2, cy = H / 2;

      // Leaf/chloroplast center
      const leafR = 44;
      const leafGrad = ctx!.createRadialGradient(cx, cy, 0, cx, cy, leafR);
      leafGrad.addColorStop(0, "#4ade8088");
      leafGrad.addColorStop(0.6, "#22c55e44");
      leafGrad.addColorStop(1, "#16a34a22");
      ctx!.fillStyle = leafGrad;
      ctx!.beginPath();
      ctx!.arc(cx, cy, leafR, 0, Math.PI * 2);
      ctx!.fill();
      ctx!.strokeStyle = "#4ade80";
      ctx!.lineWidth = 2;
      ctx!.beginPath();
      ctx!.arc(cx, cy, leafR, 0, Math.PI * 2);
      ctx!.stroke();
      ctx!.font = `bold 9px ${MONO}`;
      ctx!.fillStyle = "#4ade80";
      ctx!.textAlign = "center";
      ctx!.fillText("CHLORO-", cx, cy - 4);
      ctx!.fillText("PLAST", cx, cy + 8);
      ctx!.textAlign = "left";

      const pulse = 0.6 + 0.4 * Math.sin(t * 0.05);
      ctx!.strokeStyle = "#4ade80" + Math.round(pulse * 100).toString(16).padStart(2, "0");
      ctx!.lineWidth = 1;
      ctx!.beginPath();
      ctx!.arc(cx, cy, leafR + 12 * pulse, 0, Math.PI * 2);
      ctx!.stroke();

      // Labels
      ctx!.font = `8px ${MONO}`;
      ctx!.fillStyle = "#607090";
      ctx!.fillText("INPUTS (abundant)", 10, 14);
      ctx!.textAlign = "right";
      ctx!.fillText("OUTPUTS (transformative)", W - 10, 14);
      ctx!.textAlign = "left";

      // Spawn
      if (t % 30 === 0 && inputMols.length < 18) spawnInput();

      // Update/draw inputs
      for (let i = inputMols.length - 1; i >= 0; i--) {
        const m = inputMols[i];
        const dx = cx - m.x, dy = cy - m.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < leafR + 10) {
          const outTypes = [
            { label: "C6H12O6", color: "#f472b6", r: 9 },
            { label: "O2", color: AURORA, r: 7 },
          ];
          const ot = outTypes[Math.floor(Math.random() * outTypes.length)];
          outputMols.push({ x: cx + (Math.random() - 0.5) * 20, y: cy + (Math.random() - 0.5) * 20, vx: 1.5 + Math.random(), vy: (Math.random() - 0.5), ...ot, life: 1 });
          inputMols.splice(i, 1);
          continue;
        }
        m.x += m.vx;
        m.y += m.vy + (dy / dist) * 0.2;
        m.life -= 0.004;
        if (m.life <= 0) { inputMols.splice(i, 1); continue; }

        const g = ctx!.createRadialGradient(m.x, m.y, 0, m.x, m.y, m.r * 2);
        g.addColorStop(0, m.color + "cc");
        g.addColorStop(1, "transparent");
        ctx!.fillStyle = g;
        ctx!.beginPath();
        ctx!.arc(m.x, m.y, m.r * 2, 0, Math.PI * 2);
        ctx!.fill();
        ctx!.fillStyle = m.color;
        ctx!.beginPath();
        ctx!.arc(m.x, m.y, m.r, 0, Math.PI * 2);
        ctx!.fill();
        ctx!.font = `7px ${MONO}`;
        ctx!.fillStyle = "#fff";
        ctx!.textAlign = "center";
        ctx!.fillText(m.label, m.x, m.y + 3);
        ctx!.textAlign = "left";
      }

      for (let i = outputMols.length - 1; i >= 0; i--) {
        const m = outputMols[i];
        m.x += m.vx;
        m.vy += 0;
        m.y += m.vy;
        m.life -= 0.006;
        if (m.x > W + 20 || m.life <= 0) { outputMols.splice(i, 1); continue; }

        const g = ctx!.createRadialGradient(m.x, m.y, 0, m.x, m.y, m.r * 2.5);
        g.addColorStop(0, m.color + "cc");
        g.addColorStop(1, "transparent");
        ctx!.fillStyle = g;
        ctx!.beginPath();
        ctx!.arc(m.x, m.y, m.r * 2.5, 0, Math.PI * 2);
        ctx!.fill();
        ctx!.fillStyle = m.color;
        ctx!.beginPath();
        ctx!.arc(m.x, m.y, m.r, 0, Math.PI * 2);
        ctx!.fill();
        ctx!.font = `7px ${MONO}`;
        ctx!.fillStyle = "#fff";
        ctx!.textAlign = "center";
        ctx!.fillText(m.label, m.x, m.y + 3);
        ctx!.textAlign = "left";
      }

      ctx!.font = `8px ${MONO}`;
      ctx!.fillStyle = "#3a5070";
      ctx!.textAlign = "center";
      ctx!.fillText("6CO2 + 6H2O + LIGHT  ->  C6H12O6 + 6O2", cx, H - 8);
      ctx!.textAlign = "left";

      t++;
      raf = requestAnimationFrame(draw);
    }
    draw();
    return () => cancelAnimationFrame(raf);
  }, []);

  useEffect(() => {
    const c = oxygenRef.current;
    if (!c) return;
    const ctx = c.getContext("2d");
    if (!ctx) return;
    const W = c.width, H = c.height;
    let t = 0, raf = 0;
    const stages = [
      { label: "BEFORE OXYGEN", sub: ">2.4B yrs ago", color: "#607090" },
      { label: "CYANOBACTERIA", sub: "Photosynthesis at scale", color: "#4ade80" },
      { label: "O2 ACCUMULATES", sub: "2.4-2.0B yrs ago", color: AURORA },
      { label: "LIFE REORGANIZES", sub: "Aerobic metabolism", color: GOLD },
      { label: "NEW POSSIBILITIES", sub: "More energy, complexity", color: "#f472b6" },
    ];

    function draw() {
      ctx!.clearRect(0, 0, W, H);
      ctx!.fillStyle = "#050a14";
      ctx!.fillRect(0, 0, W, H);

      const stW = W / stages.length;
      const o2Level = Math.min(0.95, (t * 0.001) % 1.1);

      stages.forEach((s, i) => {
        const x = i * stW;
        const fade = i < 2 ? 0.3 : i === 2 ? 0.5 + 0.3 * Math.sin(t * 0.04) : 0.7;
        ctx!.fillStyle = s.color + Math.round(fade * 20).toString(16).padStart(2, "0");
        ctx!.fillRect(x, 0, stW - 2, H);
        ctx!.strokeStyle = s.color + "44";
        ctx!.lineWidth = 1;
        ctx!.strokeRect(x, 0, stW - 2, H);

        ctx!.font = `bold 8px ${MONO}`;
        ctx!.fillStyle = s.color;
        ctx!.textAlign = "center";
        ctx!.fillText(s.label, x + stW / 2, 16);
        ctx!.font = `7px ${MONO}`;
        ctx!.fillStyle = s.color + "88";
        ctx!.fillText(s.sub, x + stW / 2, 28);
        ctx!.textAlign = "left";
      });

      // O2 level curve
      ctx!.beginPath();
      for (let x = 0; x < W; x++) {
        const frac = x / W;
        const o2 = frac < 0.25 ? 0.02 : frac < 0.5 ? 0.02 + Math.pow((frac - 0.25) * 4, 2) * (o2Level - 0.02) : o2Level;
        const y = H - 10 - o2 * (H - 50);
        x === 0 ? ctx!.moveTo(x, y) : ctx!.lineTo(x, y);
      }
      ctx!.strokeStyle = AURORA;
      ctx!.lineWidth = 2.5;
      ctx!.stroke();

      ctx!.font = `8px ${MONO}`;
      ctx!.fillStyle = AURORA + "88";
      ctx!.fillText("O2 ATMOSPHERIC CONCENTRATION", 8, H - 14);

      t++;
      raf = requestAnimationFrame(draw);
    }
    draw();
    return () => cancelAnimationFrame(raf);
  }, []);

  useEffect(() => {
    const c = biosigRef.current;
    if (!c) return;
    const ctx = c.getContext("2d");
    if (!ctx) return;
    const W = c.width, H = c.height;
    let t = 0, raf = 0;

    function gauss(x: number, mu: number, sig: number) { return Math.exp(-0.5 * ((x - mu) / sig) ** 2); }

    function draw() {
      ctx!.clearRect(0, 0, W, H);
      ctx!.fillStyle = "#050a14";
      ctx!.fillRect(0, 0, W, H);

      const margin = 40, plotW = W - margin * 2, plotH = H - 50;

      ctx!.strokeStyle = "#1a2a3a";
      ctx!.lineWidth = 0.5;
      for (let y = 0; y < plotH; y += 20) {
        ctx!.beginPath();
        ctx!.moveTo(margin, y + 10);
        ctx!.lineTo(W - margin, y + 10);
        ctx!.stroke();
      }

      const wls = [400, 500, 600, 700, 800, 900];
      wls.forEach(wl => {
        const x = margin + ((wl - 400) / 500) * plotW;
        ctx!.strokeStyle = "#1a2a3a";
        ctx!.lineWidth = 0.5;
        ctx!.beginPath();
        ctx!.moveTo(x, 10);
        ctx!.lineTo(x, plotH + 10);
        ctx!.stroke();
        ctx!.font = `7px ${MONO}`;
        ctx!.fillStyle = "#3a5070";
        ctx!.textAlign = "center";
        ctx!.fillText(String(wl), x, plotH + 22);
        ctx!.textAlign = "left";
      });

      const nPts = plotW;
      // Solar spectrum (white)
      ctx!.beginPath();
      for (let i = 0; i <= nPts; i++) {
        const wl = 400 + (i / nPts) * 500;
        const v = 0.9 * gauss(wl, 550, 130) + 0.1;
        const y = plotH + 10 - v * (plotH - 10);
        i === 0 ? ctx!.moveTo(margin + i, y) : ctx!.lineTo(margin + i, y);
      }
      ctx!.strokeStyle = "rgba(255,255,220,0.6)";
      ctx!.lineWidth = 1.5;
      ctx!.stroke();

      // Chlorophyll absorption (green peak -- inverted dip)
      const pulse = 0.8 + 0.2 * Math.sin(t * 0.04);
      ctx!.beginPath();
      for (let i = 0; i <= nPts; i++) {
        const wl = 400 + (i / nPts) * 500;
        const v = (gauss(wl, 440, 20) * 0.9 + gauss(wl, 680, 25) * 0.85) * pulse;
        const y = plotH + 10 - v * (plotH - 10);
        i === 0 ? ctx!.moveTo(margin + i, y) : ctx!.lineTo(margin + i, y);
      }
      ctx!.strokeStyle = "#4ade80";
      ctx!.lineWidth = 2;
      ctx!.stroke();

      // Red edge (sharp rise at 700nm)
      ctx!.beginPath();
      for (let i = 0; i <= nPts; i++) {
        const wl = 400 + (i / nPts) * 500;
        const re = wl > 680 ? Math.min(1, (wl - 680) / 40) * 0.8 : 0;
        const y = plotH + 10 - re * (plotH - 10);
        i === 0 ? ctx!.moveTo(margin + i, y) : ctx!.lineTo(margin + i, y);
      }
      ctx!.strokeStyle = "#f87171";
      ctx!.lineWidth = 2;
      ctx!.stroke();

      // O2/O3 absorption dips
      [[760, 15, AURORA], [680, 12, QUANT]].forEach(([mu, sig, col]) => {
        const x = margin + ((Number(mu) - 400) / 500) * plotW;
        ctx!.strokeStyle = col as string;
        ctx!.lineWidth = 1;
        ctx!.setLineDash([3, 3]);
        ctx!.beginPath();
        ctx!.moveTo(x, 10);
        ctx!.lineTo(x, plotH + 10);
        ctx!.stroke();
        ctx!.setLineDash([]);
        ctx!.font = `7px ${MONO}`;
        ctx!.fillStyle = col as string;
        ctx!.textAlign = "center";
        ctx!.fillText(Number(mu) === 760 ? "O2" : "O3", x, 22);
        ctx!.textAlign = "left";
      });

      // Red edge label
      const reX = margin + ((700 - 400) / 500) * plotW;
      ctx!.font = `7px ${MONO}`;
      ctx!.fillStyle = "#f87171";
      ctx!.fillText("RED EDGE", reX + 4, 35);

      // Legend
      const items = [["SOLAR", "rgba(255,255,220,0.6)"], ["CHLOROPHYLL", "#4ade80"], ["RED EDGE", "#f87171"], ["O2/O3", AURORA]];
      items.forEach(([name, col], i) => {
        ctx!.fillStyle = col;
        ctx!.fillRect(margin + i * 110, H - 14, 12, 3);
        ctx!.font = `7px ${MONO}`;
        ctx!.fillStyle = col;
        ctx!.fillText(name, margin + i * 110 + 16, H - 10);
      });

      ctx!.font = `8px ${MONO}`;
      ctx!.fillStyle = "#3a5070";
      ctx!.fillText("WAVELENGTH (nm)", W / 2 - 40, H - 2);

      t++;
      raf = requestAnimationFrame(draw);
    }
    draw();
    return () => cancelAnimationFrame(raf);
  }, []);

  return (
    <div style={{ background: BG, minHeight: "100vh", color: "#cdd6f4", fontFamily: SERIF, fontSize: 15.5, lineHeight: 1.88 }}>
      <div style={{ background: "linear-gradient(155deg,#020610 0%,#080f20 35%,#050c1a 100%)", borderBottom: `2px solid #4ade80`, padding: "56px 56px 40px", textAlign: "center" }}>
        <div style={{ display: "inline-block", background: "linear-gradient(90deg,#4ade80,#22c55e)", color: "#000", fontFamily: MONO, fontSize: "0.7em", fontWeight: "bold", letterSpacing: 3, padding: "5px 18px", borderRadius: 20, marginBottom: 22, textTransform: "uppercase" }}>
          Planetary Biology -- AETHER Biosignature Framework
        </div>
        <h1 style={{ fontFamily: DISP, fontSize: "1.8em", color: "#fff", lineHeight: 1.3, maxWidth: 860, margin: "0 auto 12px" }}>
          Photosynthesis -- The Moment a Planet Starts Changing Itself
        </h1>
        <h2 style={{ fontFamily: SERIF, fontSize: "1.05em", color: "#4ade80", fontStyle: "italic", fontWeight: "normal", maxWidth: 760, margin: "0 auto 18px" }}>
          Life doesn't just survive. It transforms the world it lives on.
        </h2>
      </div>

      <div style={{ maxWidth: 980, margin: "0 auto", padding: "0 32px 72px" }}>

        <div style={sh("#4ade80")}>
          <div style={lbl("#4ade80")}>The Photosynthesis Reaction</div>
          <h2 style={{ fontSize: "1.2em", color: "#eef0ff" }}>Converting Continuous Energy into Persistent Structure</h2>
        </div>
        <canvas ref={reactionRef} width={880} height={200} style={{ width: "100%", borderRadius: 8, border: `1px solid ${DIM}`, background: "#050a14", marginBottom: 8 }} />
        <div style={eq}>{`6 CO2  +  6 H2O  +  LIGHT  ->  C6H12O6  +  6 O2
carbon dioxide  water  sunlight       glucose      oxygen

This process converts continuous energy input into persistent stored structure,
reshaping the chemistry of entire planets over geological time.`}</div>

        <div style={sh(AURORA)}>
          <div style={lbl(AURORA)}>The Great Oxygenation Event</div>
          <h2 style={{ fontSize: "1.2em", color: "#eef0ff" }}>Why This Mattered for Earth -- 2.4 Billion Years Ago</h2>
          <div style={{ fontSize: "0.86em", color: "#607090", fontStyle: "italic", marginTop: 3 }}>This is the first time life didn't just exist on a planet -- it started reprogramming the planet itself.</div>
        </div>
        <canvas ref={oxygenRef} width={880} height={160} style={{ width: "100%", borderRadius: 8, border: `1px solid ${DIM}`, background: "#050a14", marginBottom: 14 }} />
        <div style={{ display: "grid", gridTemplateColumns: "repeat(5,1fr)", gap: 10 }}>
          {[
            { label: "Before Oxygen", desc: "Life small, anaerobic. Reducing atmosphere -- no free O2", color: "#607090" },
            { label: "Cyanobacteria", desc: "Photosynthesis at scale. CO2 + H2O -> biomass + O2", color: "#4ade80" },
            { label: "O2 Accumulates", desc: "Oxygen builds in oceans, spills to atmosphere. Iron oxidizes -- banded iron formations", color: AURORA },
            { label: "Life Reorganizes", desc: "Anaerobic life pushed out or adapts. Aerobic metabolism emerges -- higher energy yield", color: GOLD },
            { label: "New Possibilities", desc: "More energy, complexity, larger organisms, ecosystems, eventual intelligence", color: "#f472b6" },
          ].map(s => (
            <div key={s.label} style={{ ...card, padding: "12px 14px", borderTop: `3px solid ${s.color}` }}>
              <div style={{ fontFamily: MONO, fontSize: "0.7em", color: s.color, marginBottom: 6 }}>{s.label}</div>
              <div style={{ fontSize: "0.82em", color: "#607090" }}>{s.desc}</div>
            </div>
          ))}
        </div>

        <div style={sh("#f87171")}>
          <div style={lbl("#f87171")}>Biosignature Detection</div>
          <h2 style={{ fontSize: "1.2em", color: "#eef0ff" }}>How Scientists Search for Life on Other Worlds</h2>
          <div style={{ fontSize: "0.86em", color: "#607090", fontStyle: "italic", marginTop: 3 }}>We don't look for life directly. We look for signatures of processes like photosynthesis.</div>
        </div>
        <canvas ref={biosigRef} width={880} height={220} style={{ width: "100%", borderRadius: 8, border: `1px solid ${DIM}`, background: "#050a14", marginBottom: 14 }} />
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: 12 }}>
          {[
            { num: "1", title: "Atmospheric Biosignatures", desc: "Life leaves chemical imbalances that shouldn't exist naturally. O2 + CH4 together. O3 as byproduct of oxygen. Studied via James Webb.", color: AURORA },
            { num: "2", title: "Surface Reflectance", desc: "The vegetation signal -- plants reflect light in a distinct way called the red edge. Scientists look for similar spectral signatures on exoplanets.", color: "#f87171" },
            { num: "3", title: "Chemical Disequilibrium", desc: "Planets tend toward equilibrium unless something disrupts them. Life is a continuous disruptor -- gases that should react yet persist.", color: GOLD },
            { num: "4", title: "Subsurface / Ocean Worlds", desc: "Europa or Enceladus may host chemosynthesis, hydrothermal systems. Life doesn't need photosynthesis if there's chemical energy.", color: "#9b5de5" },
          ].map(s => (
            <div key={s.num} style={{ ...card, borderLeft: `4px solid ${s.color}` }}>
              <div style={{ fontFamily: MONO, fontSize: "0.7em", color: s.color, marginBottom: 6 }}>{s.num}. {s.title}</div>
              <div style={{ fontSize: "0.82em", color: "#607090" }}>{s.desc}</div>
            </div>
          ))}
        </div>

        <div style={sh(QUANT)}>
          <div style={lbl(QUANT)}>The Deeper Pattern</div>
          <h2 style={{ fontSize: "1.2em", color: "#eef0ff" }}>Photosynthesis as One Instance of a Broader Rule</h2>
        </div>
        <div style={{ ...card, marginBottom: 14, borderLeft: `4px solid ${QUANT}` }}>
          <div style={{ fontSize: "1.05em", color: "#c0d4f0", fontStyle: "italic", borderLeft: `3px solid ${GOLD}`, paddingLeft: 16, marginBottom: 16 }}>
            "Life emerges when a system can capture energy, store it, and use it to maintain structure against decay."
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 14 }}>
            {[
              { label: "1. Energy Gradient", desc: "Sunlight, chemical, geothermal -- any free energy source works", color: GOLD },
              { label: "2. Medium", desc: "Water, atmosphere, substrate -- a phase where chemistry can happen", color: AURORA },
              { label: "3. Mechanism", desc: "Molecules or systems that exploit the gradient and maintain themselves", color: QUANT },
            ].map(s => (
              <div key={s.label} style={{ ...card, padding: "14px 16px", borderTop: `3px solid ${s.color}` }}>
                <div style={{ fontFamily: MONO, fontSize: "0.75em", color: s.color, marginBottom: 6 }}>{s.label}</div>
                <div style={{ fontSize: "0.84em", color: "#607090" }}>{s.desc}</div>
              </div>
            ))}
          </div>
          <div style={{ marginTop: 16, fontSize: "0.88em", color: "#8aa0c0" }}>
            When these align, systems can build complexity, self-organize, and eventually transform planets. Photosynthesis is a planetary-scale process where local biochemical rules convert continuous energy input into stored structure -- enabling life to expand its influence from microscopic reactions to global environmental transformation.
          </div>
        </div>

        <div style={sh("#4ade80")}>
          <div style={lbl("#4ade80")}>Why This Matters for New Life Detection</div>
          <h2 style={{ fontSize: "1.2em", color: "#eef0ff" }}>The Real Definition Scientists Use</h2>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
          <div style={card}>
            <h4 style={{ fontFamily: MONO, fontSize: "0.8em", color: "#4ade80", marginBottom: 10 }}>We Don't Need Earth-Like Organisms</h4>
            <div style={{ fontSize: "0.88em", color: "#8aa0c0", marginBottom: 10 }}>We need systems that:</div>
            {["Take in energy", "Create persistent, non-random structure", "Alter their environment in detectable ways"].map(it => (
              <div key={it} style={{ display: "flex", gap: 10, marginBottom: 8 }}>
                <span style={{ color: "#4ade80", fontFamily: MONO }}>--</span>
                <span style={{ fontSize: "0.86em", color: "#8aa0c0" }}>{it}</span>
              </div>
            ))}
          </div>
          <div style={card}>
            <h4 style={{ fontFamily: MONO, fontSize: "0.8em", color: GOLD, marginBottom: 10 }}>AETHER Stromatolite Connection</h4>
            <div style={{ fontSize: "0.86em", color: "#607090", marginBottom: 8 }}>Design a general life detector based on energy flow and structure that:</div>
            {["Works for photosynthetic life", "Works for chemosynthetic life", "Works for life we don't yet know", "Maps your stromatolite simulation to a proto-photosynthetic system"].map(it => (
              <div key={it} style={{ display: "flex", gap: 10, marginBottom: 6 }}>
                <span style={{ color: GOLD, fontFamily: MONO }}>--</span>
                <span style={{ fontSize: "0.84em", color: "#607090" }}>{it}</span>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}
