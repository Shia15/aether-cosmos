import { useEffect, useRef } from "react";

const BG = "#04060E";
const AURORA = "#00FFB2";
const GOLD = "#C8A030";
const QUANT = "#00ffe0";
const DIM = "#2a4060";
const MONO = "'Space Mono', monospace";
const SERIF = "'Crimson Pro', serif";
const DISP = "'Orbitron', 'Cinzel', serif";

const card: React.CSSProperties = {
  background: "rgba(10,20,40,0.85)",
  border: `1px solid ${DIM}`,
  borderRadius: 10,
  padding: "22px 26px",
};

const chHead: React.CSSProperties = {
  background: "linear-gradient(90deg,rgba(14,26,48,0.95) 0%,rgba(14,26,48,0.4) 100%)",
  borderLeft: `4px solid ${GOLD}`,
  borderRadius: 4,
  padding: "18px 24px",
  margin: "52px 0 10px",
};

const eq: React.CSSProperties = {
  background: "#060c18",
  border: `1px solid ${DIM}`,
  borderLeft: `3px solid ${AURORA}`,
  borderRadius: 6,
  padding: "14px 20px",
  margin: "14px 0",
  fontFamily: MONO,
  fontSize: "0.82em",
  color: QUANT,
  overflowX: "auto",
  whiteSpace: "pre",
};

const pill: React.CSSProperties = {
  display: "inline-block",
  background: `linear-gradient(90deg,${GOLD},#ff8c42)`,
  color: "#000",
  fontFamily: MONO,
  fontSize: "0.7em",
  fontWeight: "bold",
  letterSpacing: 3,
  padding: "5px 18px",
  borderRadius: 20,
  marginBottom: 20,
  textTransform: "uppercase",
};

const statBox: React.CSSProperties = {
  background: "rgba(10,20,40,0.85)",
  border: `1px solid ${DIM}`,
  borderRadius: 10,
  padding: "20px",
  textAlign: "center",
};

export default function DcSolarPage() {
  const effRef = useRef<HTMLCanvasElement>(null);
  const flowRef = useRef<HTMLCanvasElement>(null);
  const budRef = useRef<HTMLCanvasElement>(null);
  const animRef = useRef<number>(0);

  useEffect(() => {
    const c = effRef.current;
    if (!c) return;
    const ctx = c.getContext("2d");
    if (!ctx) return;
    let t = 0;

    function draw() {
      const W = c!.width, H = c!.height;
      ctx!.clearRect(0, 0, W, H);
      ctx!.fillStyle = "#04060E";
      ctx!.fillRect(0, 0, W, H);

      const rows = [
        { label: "AC System (baseline)", pct: 75, color: "#f87171", steps: ["Solar DC", "Inverter -4%", "Grid AC", "Device PSU -10%", "Load"] },
        { label: "DC-Native AETHER", pct: 93, color: AURORA, steps: ["Solar DC", "DC Bus", "DC Distribution", "Direct -2%", "Load"] },
      ];

      rows.forEach((row, ri) => {
        const y = 40 + ri * 130;
        ctx!.font = `bold 11px ${MONO}`;
        ctx!.fillStyle = row.color;
        ctx!.fillText(row.label, 10, y);

        const barW = W - 20;
        ctx!.fillStyle = "rgba(255,255,255,0.06)";
        ctx!.beginPath();
        ctx!.roundRect(10, y + 8, barW, 28, 4);
        ctx!.fill();

        const fill = (row.pct / 100) * barW;
        const grad = ctx!.createLinearGradient(10, 0, 10 + fill, 0);
        grad.addColorStop(0, row.color);
        grad.addColorStop(1, row.color + "88");
        ctx!.fillStyle = grad;
        ctx!.beginPath();
        ctx!.roundRect(10, y + 8, fill, 28, 4);
        ctx!.fill();

        ctx!.font = `bold 13px ${MONO}`;
        ctx!.fillStyle = "#fff";
        ctx!.fillText(row.pct + "% efficiency", 18, y + 27);

        row.steps.forEach((s, si) => {
          const px = 10 + (si / (row.steps.length - 1)) * (W - 20);
          const alive = (si * 0.25 + t * 0.8) % 1;
          const alpha = 0.5 + 0.5 * Math.sin(alive * Math.PI * 2);
          ctx!.beginPath();
          ctx!.arc(px, y + 60, 5, 0, Math.PI * 2);
          ctx!.fillStyle = row.color + Math.round(alpha * 255).toString(16).padStart(2, "0");
          ctx!.fill();
          ctx!.font = `9px ${MONO}`;
          ctx!.fillStyle = "#7a90b0";
          ctx!.textAlign = "center";
          ctx!.fillText(s, px, y + 77);
          ctx!.textAlign = "left";
          if (si < row.steps.length - 1) {
            ctx!.beginPath();
            ctx!.moveTo(px + 6, y + 60);
            ctx!.lineTo(px + (W - 20) / (row.steps.length - 1) - 6, y + 60);
            ctx!.strokeStyle = row.color + "44";
            ctx!.lineWidth = 1;
            ctx!.stroke();
          }
        });
      });

      ctx!.font = `10px ${MONO}`;
      ctx!.fillStyle = "#445870";
      ctx!.fillText("LOSS DELTA: " + (93 - 75) + "% = 150-200 kW per MW recovered", 10, H - 8);
      t += 0.008;
    }

    function loop() {
      draw();
      animRef.current = requestAnimationFrame(loop);
    }
    loop();
    return () => cancelAnimationFrame(animRef.current);
  }, []);

  useEffect(() => {
    const c = flowRef.current;
    if (!c) return;
    const ctx = c.getContext("2d");
    if (!ctx) return;
    let t = 0;
    let raf = 0;

    type Particle = { x: number; y: number; vx: number; vy: number; life: number; color: string; r: number };
    const particles: Particle[] = [];

    const nodes = [
      { x: 60, y: 110, label: "Solar Array\n5MW peak", color: GOLD },
      { x: 200, y: 70, label: "DC Bus\n48V/380V", color: AURORA },
      { x: 340, y: 70, label: "DC Distribution\n800V trunk", color: QUANT },
      { x: 480, y: 110, label: "AI Optimizer\nLoad balance", color: "#9b5de5" },
      { x: 340, y: 150, label: "PoE Network\n1-100 Gbps", color: "#4ade80" },
      { x: 200, y: 150, label: "IoT Sensors\n500+ nodes", color: "#f72585" },
    ];

    const edges = [
      [0, 1], [1, 2], [2, 3], [2, 4], [4, 5], [3, 1],
    ];

    function spawnParticle(from: number, to: number) {
      const a = nodes[from], b = nodes[to];
      const color = nodes[from].color;
      particles.push({ x: a.x, y: a.y, vx: (b.x - a.x) * 0.01, vy: (b.y - a.y) * 0.01, life: 1, color, r: 2.5 });
    }

    function draw() {
      ctx!.clearRect(0, 0, c!.width, c!.height);
      ctx!.fillStyle = "#04060E";
      ctx!.fillRect(0, 0, c!.width, c!.height);

      edges.forEach(([a, b]) => {
        ctx!.beginPath();
        ctx!.moveTo(nodes[a].x, nodes[a].y);
        ctx!.lineTo(nodes[b].x, nodes[b].y);
        ctx!.strokeStyle = DIM;
        ctx!.lineWidth = 1.5;
        ctx!.stroke();
      });

      nodes.forEach(n => {
        ctx!.beginPath();
        ctx!.arc(n.x, n.y, 18, 0, Math.PI * 2);
        ctx!.fillStyle = n.color + "22";
        ctx!.fill();
        ctx!.strokeStyle = n.color;
        ctx!.lineWidth = 2;
        ctx!.stroke();
        ctx!.font = `8px ${MONO}`;
        ctx!.fillStyle = n.color;
        ctx!.textAlign = "center";
        n.label.split("\n").forEach((ln, i) => ctx!.fillText(ln, n.x, n.y + 30 + i * 12));
        ctx!.textAlign = "left";
      });

      if (Math.random() < 0.12) {
        const idx = Math.floor(Math.random() * edges.length);
        spawnParticle(edges[idx][0], edges[idx][1]);
      }

      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        p.x += p.vx;
        p.y += p.vy;
        p.life -= 0.01;
        if (p.life <= 0) { particles.splice(i, 1); continue; }
        ctx!.beginPath();
        ctx!.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx!.fillStyle = p.color + Math.round(p.life * 200).toString(16).padStart(2, "0");
        ctx!.fill();
      }

      t += 0.01;
      raf = requestAnimationFrame(draw);
    }
    draw();
    return () => cancelAnimationFrame(raf);
  }, []);

  useEffect(() => {
    const c = budRef.current;
    if (!c) return;
    const ctx = c.getContext("2d");
    if (!ctx) return;

    const slices = [
      { label: "Solar Array & DC Infra", pct: 34, color: GOLD, val: "$1.2M" },
      { label: "Network Equipment", pct: 23, color: AURORA, val: "$800K" },
      { label: "AI/ML Development", pct: 17, color: "#9b5de5", val: "$600K" },
      { label: "Sensor Array & IoT", pct: 11, color: "#4ade80", val: "$400K" },
      { label: "Site Prep", pct: 9, color: "#f72585", val: "$300K" },
      { label: "Personnel", pct: 6, color: "#38bdf8", val: "$200K" },
    ];

    const cx = 110, cy = 90, r = 70;
    let angle = -Math.PI / 2;

    slices.forEach(s => {
      const sweep = (s.pct / 100) * Math.PI * 2;
      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.arc(cx, cy, r, angle, angle + sweep);
      ctx.closePath();
      ctx.fillStyle = s.color + "cc";
      ctx.fill();
      ctx.strokeStyle = "#04060E";
      ctx.lineWidth = 2;
      ctx.stroke();
      angle += sweep;
    });

    ctx.beginPath();
    ctx.arc(cx, cy, 36, 0, Math.PI * 2);
    ctx.fillStyle = "#04060E";
    ctx.fill();

    ctx.font = `bold 13px ${MONO}`;
    ctx.fillStyle = GOLD;
    ctx.textAlign = "center";
    ctx.fillText("$3.5M", cx, cy + 5);

    let ly = 14;
    slices.forEach(s => {
      ctx.beginPath();
      ctx.rect(200, ly, 12, 10);
      ctx.fillStyle = s.color;
      ctx.fill();
      ctx.font = `9px ${MONO}`;
      ctx.fillStyle = "#8aa0c0";
      ctx.textAlign = "left";
      ctx.fillText(s.label + " -- " + s.pct + "% " + s.val, 218, ly + 9);
      ly += 18;
    });
  }, []);

  return (
    <div style={{ background: BG, minHeight: "100vh", color: "#cdd6f4", fontFamily: SERIF, fontSize: 15.5, lineHeight: 1.88 }}>
      <div style={{ background: "linear-gradient(155deg,#020610 0%,#080f20 35%,#050c1a 100%)", borderBottom: `2px solid ${GOLD}`, padding: "64px 56px 48px", textAlign: "center" }}>
        <div style={pill}>ARPA-E FUNDING PROPOSAL</div>
        <h1 style={{ fontFamily: DISP, fontSize: "2em", color: "#fff", lineHeight: 1.3, maxWidth: 800, margin: "0 auto 14px" }}>
          DC-NATIVE SOLAR INFRASTRUCTURE
        </h1>
        <h2 style={{ fontFamily: SERIF, fontSize: "1.1em", color: GOLD, fontStyle: "italic", fontWeight: "normal", maxWidth: 760, margin: "0 auto 26px" }}>
          Eliminating 150-200 kW Energy Loss Per Megawatt Through Direct Current Distribution
        </h2>
        <div style={{ display: "flex", justifyContent: "center", gap: 36, fontFamily: MONO, fontSize: "0.78em", color: "#607090", borderTop: `1px solid ${DIM}`, paddingTop: 16 }}>
          <div>Prototype: <span style={{ color: AURORA }}>Johnstown, PA</span></div>
          <div>Ask: <span style={{ color: AURORA }}>$3.5M / 18 Months</span></div>
          <div>Filed: <span style={{ color: AURORA }}>June 2026 / Cosmic Chaos Corporation</span></div>
        </div>
      </div>

      <div style={{ maxWidth: 990, margin: "0 auto", padding: "0 34px 72px" }}>

        <div style={{ ...chHead, borderLeftColor: "#f87171" }}>
          <div style={{ fontFamily: MONO, fontSize: "0.68em", letterSpacing: 4, color: "#f87171", textTransform: "uppercase", marginBottom: 3 }}>The Problem</div>
          <h2 style={{ fontSize: "1.28em", color: "#eef0ff" }}>The $50 Billion Energy Loss Problem</h2>
          <div style={{ fontSize: "0.86em", color: "#607090", fontStyle: "italic", marginTop: 3 }}>Current solar wastes 10-30% through unnecessary AC/DC conversions</div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 15, margin: "20px 0" }}>
          {[
            { n: "1", title: "Solar Generates DC", sub: "Inverters convert to AC", loss: "3-8% loss", cost: "$200-400/kW", color: GOLD },
            { n: "2", title: "Buildings Use AC", sub: "But devices need DC", loss: "5-15% loss", cost: "Every device has AC-DC supply", color: "#f87171" },
            { n: "3", title: "Data Centers Worst Hit", sub: "Double conversion", loss: "15-25% total", cost: "30-40% energy for cooling", color: "#f72585" },
          ].map(s => (
            <div key={s.n} style={{ ...card, borderTop: `3px solid ${s.color}` }}>
              <div style={{ fontFamily: MONO, fontSize: "1.6em", color: s.color, marginBottom: 6 }}>{s.n}</div>
              <h4 style={{ fontFamily: MONO, fontSize: "0.82em", color: s.color, marginBottom: 6 }}>{s.title}</h4>
              <p style={{ fontSize: "0.85em", color: "#7a90b0", margin: "0 0 8px" }}>{s.sub}</p>
              <p style={{ fontSize: "0.88em", color: "#f87171", margin: 0, fontFamily: MONO }}>{s.loss}</p>
              <p style={{ fontSize: "0.8em", color: "#607090", margin: 0 }}>{s.cost}</p>
            </div>
          ))}
        </div>

        <div style={{ ...card, background: "rgba(248,113,113,0.08)", border: `1px solid rgba(248,113,113,0.3)`, textAlign: "center", margin: "20px 0" }}>
          <span style={{ fontFamily: MONO, fontSize: "0.82em", color: "#f87171" }}>ANNUAL U.S. IMPACT: </span>
          <span style={{ fontFamily: MONO, fontSize: "0.82em", color: "#fff" }}>50+ TWh wasted -- $5B+ in unnecessary equipment costs -- 25 million tons CO2</span>
        </div>

        <div style={chHead}>
          <div style={{ fontFamily: MONO, fontSize: "0.68em", letterSpacing: 4, color: GOLD, textTransform: "uppercase", marginBottom: 3 }}>Live Simulation</div>
          <h2 style={{ fontSize: "1.28em", color: "#eef0ff" }}>Efficiency Comparison: AC vs DC-Native</h2>
          <div style={{ fontSize: "0.86em", color: "#607090", fontStyle: "italic", marginTop: 3 }}>Animated power flow -- AC loss chain vs AETHER DC-native path</div>
        </div>
        <canvas ref={effRef} width={900} height={200} style={{ width: "100%", borderRadius: 8, border: `1px solid ${DIM}`, background: BG, marginBottom: 8 }} />

        <div style={chHead}>
          <div style={{ fontFamily: MONO, fontSize: "0.68em", letterSpacing: 4, color: AURORA, textTransform: "uppercase", marginBottom: 3 }}>Our Solution</div>
          <h2 style={{ fontSize: "1.28em", color: "#eef0ff" }}>DC-Native Infrastructure: Live Network Topology</h2>
          <div style={{ fontSize: "0.86em", color: "#607090", fontStyle: "italic", marginTop: 3 }}>Power + data + AI in one integrated system -- animated particle flow</div>
        </div>
        <canvas ref={flowRef} width={560} height={210} style={{ width: "100%", maxWidth: 560, borderRadius: 8, border: `1px solid ${DIM}`, background: BG, marginBottom: 8 }} />

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 15, margin: "20px 0" }}>
          {[
            { label: "DC-Native Solar", sub: "No inverters. Direct DC distribution at 48V/380V/800V. 90-95% efficiency.", color: GOLD, eff: "90-95%" },
            { label: "Integrated Network", sub: "Power + data in same infrastructure. PoE everywhere. 40-60% cost savings.", color: AURORA, eff: "40-60% savings" },
            { label: "AI Optimization", sub: "Predictive load balancing, HVAC coordination, maintenance forecasting. 30-50% energy reduction.", color: "#9b5de5", eff: "30-50% reduction" },
            { label: "Building Integration", sub: "Steel frames as ground planes. HVAC + power coordinated. 20-30% material savings.", color: "#4ade80", eff: "20-30% materials" },
          ].map(s => (
            <div key={s.label} style={{ ...card, borderTop: `3px solid ${s.color}` }}>
              <h4 style={{ fontFamily: MONO, fontSize: "0.82em", color: s.color, marginBottom: 6 }}>{s.label}</h4>
              <p style={{ fontSize: "0.85em", color: "#7a90b0", margin: "0 0 8px" }}>{s.sub}</p>
              <span style={{ fontFamily: MONO, fontSize: "0.8em", color: s.color }}>{s.eff}</span>
            </div>
          ))}
        </div>

        <div style={chHead}>
          <div style={{ fontFamily: MONO, fontSize: "0.68em", letterSpacing: 4, color: "#9b5de5", textTransform: "uppercase", marginBottom: 3 }}>Technical Innovation</div>
          <h2 style={{ fontSize: "1.28em", color: "#eef0ff" }}>Patent-Filed Architecture</h2>
        </div>
        <div style={{ ...eq, borderLeftColor: "#9b5de5" }}>
{`SOLAR DC NATIVE
      +
NETWORKING INFRASTRUCTURE
      +
AI OPTIMIZATION
      +
BUILT INFRASTRUCTURE
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
= DC-NATIVE SOLAR-POWERED INTELLIGENT INFRASTRUCTURE

Patent Application Filed: 10 Claims, H02J 3/00 Classification`}
        </div>

        <div style={chHead}>
          <div style={{ fontFamily: MONO, fontSize: "0.68em", letterSpacing: 4, color: QUANT, textTransform: "uppercase", marginBottom: 3 }}>Measurable Impact</div>
          <h2 style={{ fontSize: "1.28em", color: "#eef0ff" }}>Quantified Energy Gains</h2>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 15, margin: "20px 0" }}>
          {[
            { val: "15-20%", label: "Absolute Efficiency Gain", sub: "90-95% vs 75-80% baseline -- 1MW solar gives 150-200 kW more usable power", color: AURORA },
            { val: "30-50%", label: "Operational Energy Reduction", sub: "AI-driven holistic optimization -- data center cooling 40% down to 22%", color: GOLD },
            { val: "40-60%", label: "Installation Cost Reduction", sub: "Unified power + data infrastructure -- no inverters saves $200-400/kW", color: "#9b5de5" },
          ].map(s => (
            <div key={s.val} style={{ ...statBox, borderTop: `3px solid ${s.color}` }}>
              <div style={{ fontFamily: DISP, fontSize: "2.2em", color: s.color, marginBottom: 6 }}>{s.val}</div>
              <div style={{ fontFamily: MONO, fontSize: "0.8em", color: "#cdd6f4", marginBottom: 8 }}>{s.label}</div>
              <div style={{ fontSize: "0.82em", color: "#607090" }}>{s.sub}</div>
            </div>
          ))}
        </div>

        <div style={chHead}>
          <div style={{ fontFamily: MONO, fontSize: "0.68em", letterSpacing: 4, color: "#4ade80", textTransform: "uppercase", marginBottom: 3 }}>Prototype</div>
          <h2 style={{ fontSize: "1.28em", color: "#eef0ff" }}>Resonant Cell -- Johnstown, PA</h2>
          <div style={{ fontSize: "0.86em", color: "#607090", fontStyle: "italic", marginTop: 3 }}>6-12 Month Deployment Timeline</div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, margin: "18px 0" }}>
          {[
            ["Site Size", "10 acres"],
            ["Solar Capacity", "5 MW peak"],
            ["DC Distribution", "48V / 380V / 800V"],
            ["Network Integration", "1-100 Gbps fiber + PoE"],
            ["AI Optimization", "Real-time load balancing"],
            ["Sensor Array", "500+ IoT nodes"],
            ["Data Collection", "1 Hz - 1 kHz sampling"],
            ["Target Efficiency", "92%+ (vs 78% baseline)"],
          ].map(([k, v]) => (
            <div key={k} style={{ display: "flex", justifyContent: "space-between", padding: "10px 16px", background: "rgba(10,20,40,0.7)", borderRadius: 6, border: `1px solid ${DIM}` }}>
              <span style={{ fontFamily: MONO, fontSize: "0.8em", color: "#607090" }}>{k}</span>
              <span style={{ fontFamily: MONO, fontSize: "0.8em", color: AURORA }}>{v}</span>
            </div>
          ))}
        </div>

        <div style={{ margin: "18px 0" }}>
          <h3 style={{ fontFamily: MONO, fontSize: "0.95em", color: QUANT, marginBottom: 12 }}>Key Milestones</h3>
          {[
            { phase: "Month 1-3", label: "Site preparation, DC distribution infrastructure" },
            { phase: "Month 4-6", label: "Solar array deployment, network integration" },
            { phase: "Month 7-9", label: "AI optimization engine, sensor calibration" },
            { phase: "Month 10-12", label: "Performance validation, efficiency measurements" },
          ].map((m, i) => (
            <div key={i} style={{ display: "flex", gap: 16, padding: "10px 0", borderBottom: `1px solid ${DIM}` }}>
              <span style={{ fontFamily: MONO, fontSize: "0.8em", color: GOLD, minWidth: 110 }}>{m.phase}</span>
              <span style={{ fontSize: "0.88em", color: "#8aa0c0" }}>{m.label}</span>
            </div>
          ))}
        </div>

        <div style={chHead}>
          <div style={{ fontFamily: MONO, fontSize: "0.68em", letterSpacing: 4, color: "#f72585", textTransform: "uppercase", marginBottom: 3 }}>Market Opportunity</div>
          <h2 style={{ fontSize: "1.28em", color: "#eef0ff" }}>$880B+ Addressable Market</h2>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 14, margin: "18px 0" }}>
          {[
            { market: "Data Centers", val: "$250B by 2027", sub: "Immediate fit -- 35% energy costs", color: AURORA },
            { market: "Industrial Facilities", val: "$180B by 2026", sub: "New construction + retrofit -- 45% energy costs", color: GOLD },
            { market: "Commercial Buildings", val: "$400B by 2030", sub: "New construction priority -- 30-40% energy costs", color: "#9b5de5" },
          ].map(s => (
            <div key={s.market} style={{ ...statBox, borderTop: `3px solid ${s.color}` }}>
              <div style={{ fontFamily: MONO, fontSize: "0.78em", color: s.color, marginBottom: 6 }}>{s.market}</div>
              <div style={{ fontFamily: DISP, fontSize: "1.1em", color: "#fff", marginBottom: 6 }}>{s.val}</div>
              <div style={{ fontSize: "0.82em", color: "#607090" }}>{s.sub}</div>
            </div>
          ))}
        </div>
        <div style={{ ...card, textAlign: "center", margin: "14px 0" }}>
          <span style={{ fontFamily: MONO, fontSize: "0.82em", color: "#607090" }}>Revenue Model: </span>
          <span style={{ fontFamily: MONO, fontSize: "0.82em", color: AURORA }}>Hardware + Software + Integration Services</span>
          <span style={{ fontFamily: MONO, fontSize: "0.82em", color: "#607090" }}> -- Exit: Patent licensing, strategic acquisition, or public offering</span>
        </div>

        <div style={chHead}>
          <div style={{ fontFamily: MONO, fontSize: "0.68em", letterSpacing: 4, color: GOLD, textTransform: "uppercase", marginBottom: 3 }}>Budget</div>
          <h2 style={{ fontSize: "1.28em", color: "#eef0ff" }}>$3.5M Funding Request -- 18-Month Development</h2>
        </div>
        <canvas ref={budRef} width={900} height={130} style={{ width: "100%", borderRadius: 8, border: `1px solid ${DIM}`, background: BG, marginBottom: 8 }} />

        <div style={chHead}>
          <div style={{ fontFamily: MONO, fontSize: "0.68em", letterSpacing: 4, color: "#38bdf8", textTransform: "uppercase", marginBottom: 3 }}>ARPA-E Alignment</div>
          <h2 style={{ fontSize: "1.28em", color: "#eef0ff" }}>Mission-Critical Fit</h2>
        </div>
        {[
          { label: "High-Risk, High-Reward", body: "Completely redesigning building power architecture -- no one else eliminating AC distribution at this scale." },
          { label: "Energy Impact Potential", body: "50+ TWh annual savings if scaled nationwide. 25M tons CO2 reduction. Grid resilience through distributed DC topology." },
          { label: "Market Transformation", body: "$250B+ market. New infrastructure standard. Creates American manufacturing jobs through Johnstown, PA deployment." },
        ].map(s => (
          <div key={s.label} style={{ display: "flex", gap: 14, ...card, marginBottom: 10 }}>
            <div style={{ fontFamily: MONO, fontSize: "0.78em", color: QUANT, minWidth: 200 }}>{s.label}</div>
            <div style={{ fontSize: "0.88em", color: "#8aa0c0" }}>{s.body}</div>
          </div>
        ))}

        <div style={{ ...card, textAlign: "center", margin: "32px 0", background: `linear-gradient(135deg,rgba(0,255,178,0.08),rgba(200,160,48,0.06))`, border: `1px solid rgba(0,255,178,0.3)` }}>
          <div style={{ fontFamily: DISP, fontSize: "1.5em", color: AURORA, marginBottom: 8 }}>
            This is exactly the transformative energy technology ARPA-E was designed to support.
          </div>
          <div style={{ fontFamily: MONO, fontSize: "0.9em", color: GOLD }}>$3.5M | 18 Months | Johnstown, PA -- Let's transform American energy infrastructure.</div>
        </div>

        <div style={{ fontFamily: MONO, fontSize: "0.72em", color: "#1e3050", borderTop: `1px solid ${DIM}`, paddingTop: 14, marginTop: 40 }}>
          (c) 2026 Shia Miller / Cosmic Chaos Corporation -- ARPA-E Proposal -- AetherLife.co
        </div>
      </div>
    </div>
  );
}
