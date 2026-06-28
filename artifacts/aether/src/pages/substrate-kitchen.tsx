import { useEffect, useRef, useState } from "react";

const BG     = "#020408";
const ACCENT = "#1fa8d4";
const GOLD   = "#c9a84c";
const VIOLET = "#8b5cf6";
const GREEN  = "#22c55e";
const STONE  = "#b0a090";
const DIM    = "#3d6070";
const TEXT   = "#c8d8e0";
const AMBER  = "#e8a030";
const ROSE   = "#f472b6";
const EARTH  = "#7a5c30";
const SKY    = "#1a6aaa";
const SEA    = "#0a3a50";

const mono  = "'Space Mono', monospace";
const serif = "'Cinzel', serif";
const body  = "'Crimson Pro', Georgia, serif";

const PHI     = 1.6180339887;
const PHI_INV = 1 / PHI;

function EQ({ children }: { children: string }) {
  return (
    <pre style={{
      fontFamily: mono, fontSize: 12, color: GOLD,
      background: "#030d18", border: `1px solid ${GOLD}28`,
      borderRadius: 6, padding: "12px 18px", margin: "12px 0",
      overflowX: "auto", whiteSpace: "pre-wrap",
    }}>{children}</pre>
  );
}
function SecHead({ id, n, title, sub, col = ACCENT }:
  { id: string; n: string; title: string; sub: string; col?: string }) {
  return (
    <div id={id} style={{ marginTop: 64, scrollMarginTop: 80 }}>
      <div style={{ fontFamily: mono, fontSize: 10, color: col, letterSpacing: 3, marginBottom: 6 }}>{n}</div>
      <h2 style={{ fontFamily: serif, fontSize: 26, color: "#fff", margin: "0 0 4px", letterSpacing: 1 }}>{title}</h2>
      <div style={{ fontFamily: body, fontSize: 15, color: DIM, marginBottom: 20 }}>{sub}</div>
      <div style={{ height: 1, background: `linear-gradient(90deg,${col}60,transparent)`, marginBottom: 28 }} />
    </div>
  );
}
function Card({ title, col = ACCENT, children }: { title: string; col?: string; children: React.ReactNode }) {
  return (
    <div style={{ background: `${col}08`, border: `1px solid ${col}28`, borderRadius: 8, padding: "16px 20px", marginBottom: 16 }}>
      <div style={{ fontFamily: mono, fontSize: 10, color: col, letterSpacing: 2, marginBottom: 8 }}>{title}</div>
      <div style={{ fontFamily: body, fontSize: 15, color: TEXT, lineHeight: 1.75 }}>{children}</div>
    </div>
  );
}

/* ── Land / Air / Sea Machine Canvas ─────────────────── */
function LandAirSeaCanvas() {
  const cvs  = useRef<HTMLCanvasElement>(null);
  const raf  = useRef(0);
  const tick = useRef(0);
  const machines = useRef<{ x: number; y: number; zone: number; angle: number; speed: number; substrate: string; ping: number; col: string }[]>([]);

  useEffect(() => {
    const canvas = cvs.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d")!;

    const resize = () => {
      canvas.width  = canvas.parentElement!.clientWidth;
      canvas.height = 360;
    };
    resize();
    window.addEventListener("resize", resize);

    const ZONE_SUBSTRATES = [
      ["root starch", "mineral silica", "soil microbiome", "rhizosphere extract", "seed bank"],
      ["pollen spore", "aerial mycelium", "atmospheric iodine", "cloud chlorophyll", "wind seed"],
      ["kelp alginate", "omega-3 depot", "sea mineral brine", "phytoplankton bloom", "brine extract"],
    ];
    const ZONE_COLS = [AMBER, ACCENT, "#1fd4c8"];

    machines.current = Array.from({ length: 12 }, (_, i) => ({
      x: Math.random() * 0.9 + 0.05,
      y: Math.random(),
      zone: i % 3,
      angle: Math.random() * Math.PI * 2,
      speed: 0.0015 + Math.random() * 0.001,
      substrate: ZONE_SUBSTRATES[i % 3][Math.floor(Math.random() * 5)],
      ping: 0,
      col: ZONE_COLS[i % 3],
    }));

    const pings: { x: number; y: number; r: number; col: string; label: string }[] = [];

    const draw = () => {
      tick.current++;
      const W = canvas.width, H = canvas.height;
      ctx.clearRect(0, 0, W, H);

      const ZONE_H = H / 3;

      // Zone backgrounds
      const zoneData = [
        { label: "LAND", sublabel: "Soil · Root · Seed", col: AMBER, bg: "#1a0e04" },
        { label: "AIR",  sublabel: "Atmosphere · Pollen · Spore", col: ACCENT, bg: "#020c18" },
        { label: "SEA",  sublabel: "Ocean · Algae · Mineral", col: "#1fd4c8", bg: "#010c10" },
      ];
      zoneData.forEach((z, zi) => {
        const y0 = zi * ZONE_H;
        const zg = ctx.createLinearGradient(0, y0, W, y0 + ZONE_H);
        zg.addColorStop(0, `${z.bg}`);
        zg.addColorStop(1, `${z.bg}88`);
        ctx.fillStyle = zg;
        ctx.fillRect(0, y0, W, ZONE_H);
        ctx.strokeStyle = `${z.col}20`;
        ctx.lineWidth = 0.5;
        ctx.strokeRect(0, y0, W, ZONE_H);

        ctx.font = `10px ${mono}`; ctx.fillStyle = `${z.col}40`; ctx.textAlign = "left";
        ctx.fillText(z.label, 12, y0 + 18);
        ctx.font = `7.5px ${mono}`; ctx.fillStyle = `${z.col}28`;
        ctx.fillText(z.sublabel, 12, y0 + 30);
      });

      // Zone dividers
      ctx.setLineDash([4, 6]);
      ctx.strokeStyle = "#ffffff15"; ctx.lineWidth = 1;
      ctx.beginPath(); ctx.moveTo(0, ZONE_H); ctx.lineTo(W, ZONE_H); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(0, ZONE_H * 2); ctx.lineTo(W, ZONE_H * 2); ctx.stroke();
      ctx.setLineDash([]);

      // Substrate grid dots
      const t = tick.current;
      for (let gx = 0; gx < W; gx += 40) {
        for (let gy = 0; gy < H; gy += 40) {
          const zone = Math.floor(gy / ZONE_H);
          const phase = Math.sin(gx * 0.05 + gy * 0.04 + t * 0.02 * PHI_INV) * 0.5 + 0.5;
          const zcol = zoneData[zone].col;
          ctx.beginPath(); ctx.arc(gx, gy, 1.2, 0, Math.PI * 2);
          ctx.fillStyle = `${zcol}${Math.floor(phase * 25).toString(16).padStart(2,"0")}`;
          ctx.fill();
        }
      }

      // Machines
      machines.current.forEach(m => {
        const zone = m.zone;
        const yBand0 = zone * ZONE_H;
        const yBand1 = yBand0 + ZONE_H;
        const mx = m.x * W;
        const my = yBand0 + (m.y * 0.85 + 0.075) * ZONE_H;

        m.angle += (Math.random() - 0.5) * 0.08;
        m.x += Math.cos(m.angle) * m.speed;
        m.y += Math.sin(m.angle) * m.speed * 0.5;
        if (m.x < 0.05 || m.x > 0.95) m.angle = Math.PI - m.angle;
        if (m.y < 0.05 || m.y > 0.90) m.angle = -m.angle;

        // Scan radius
        const scanR = 22 + 8 * Math.sin(t * 0.04 + m.x * 5);
        const sg = ctx.createRadialGradient(mx, my, 0, mx, my, scanR);
        sg.addColorStop(0, `${m.col}22`); sg.addColorStop(1, "transparent");
        ctx.fillStyle = sg; ctx.fillRect(mx - scanR, my - scanR, scanR * 2, scanR * 2);

        // Machine body (zone-specific shape)
        ctx.save();
        ctx.translate(mx, my);
        ctx.rotate(m.angle);
        if (zone === 0) {
          // Land rover — rectangle with wheels
          ctx.fillStyle = m.col;
          ctx.fillRect(-8, -4, 16, 8);
          ctx.fillStyle = `${m.col}80`;
          [-6, 6].forEach(xo => { ctx.beginPath(); ctx.arc(xo, 6, 3, 0, Math.PI * 2); ctx.fill(); });
        } else if (zone === 1) {
          // Air drone — cross shape
          ctx.strokeStyle = m.col; ctx.lineWidth = 2;
          ctx.beginPath(); ctx.moveTo(-10, 0); ctx.lineTo(10, 0); ctx.stroke();
          ctx.beginPath(); ctx.moveTo(0, -10); ctx.lineTo(0, 10); ctx.stroke();
          ctx.beginPath(); ctx.arc(0, 0, 3, 0, Math.PI * 2); ctx.fillStyle = m.col; ctx.fill();
          [[-10,0],[10,0],[0,-10],[0,10]].forEach(([xx, yy]) => {
            ctx.beginPath(); ctx.arc(xx, yy, 2.5, 0, Math.PI * 2); ctx.fill();
          });
        } else {
          // Sea submersible — ellipse with tail
          ctx.fillStyle = m.col;
          ctx.beginPath(); ctx.ellipse(0, 0, 10, 5, 0, 0, Math.PI * 2); ctx.fill();
          ctx.beginPath(); ctx.moveTo(-10, 0); ctx.lineTo(-16, -4); ctx.lineTo(-16, 4); ctx.closePath();
          ctx.fill();
        }
        ctx.restore();

        // Discovery ping
        if (t % 80 === Math.floor(m.x * 80) % 80) {
          m.ping = 1;
          pings.push({ x: mx, y: my, r: 0, col: m.col, label: m.substrate });
          if (pings.length > 16) pings.shift();
        }

        // Machine readout
        ctx.font = `6px ${mono}`; ctx.textAlign = "center";
        ctx.fillStyle = `${m.col}80`; ctx.fillText(m.substrate, mx, my - 16);
      });

      // Pings (expanding circles)
      pings.forEach(p => {
        p.r += 1.5;
        const alpha = Math.max(0, 0.6 - p.r / 80);
        ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.strokeStyle = `${p.col}${Math.floor(alpha * 255).toString(16).padStart(2,"0")}`;
        ctx.lineWidth = 1; ctx.stroke();
        if (p.r < 30 && alpha > 0.3) {
          ctx.font = `6px ${mono}`; ctx.fillStyle = p.col + "90"; ctx.textAlign = "center";
          ctx.fillText(`↑ ${p.label}`, p.x, p.y - p.r - 4);
        }
      });

      // Legend
      ctx.font = `8px ${mono}`; ctx.textAlign = "right";
      ctx.fillStyle = "#ffffff20"; ctx.fillText("SUBSTRATE DISCOVERY NETWORK", W - 12, H - 8);

      raf.current = requestAnimationFrame(draw);
    };
    raf.current = requestAnimationFrame(draw);
    return () => { cancelAnimationFrame(raf.current); window.removeEventListener("resize", resize); };
  }, []);

  return <canvas ref={cvs} style={{ width: "100%", display: "block", borderRadius: 8, border: `1px solid ${ACCENT}20` }} />;
}

/* ── Kitchen Math Canvas ──────────────────────────────── */
function KitchenMathCanvas() {
  const cvs  = useRef<HTMLCanvasElement>(null);
  const raf  = useRef(0);
  const tick = useRef(0);

  useEffect(() => {
    const canvas = cvs.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d")!;
    const resize = () => { canvas.width = canvas.parentElement!.clientWidth; canvas.height = 220; };
    resize();
    window.addEventListener("resize", resize);

    const OPS = [
      { label: "CHOP",    math: "v⃗ = ∂F/∂x",  col: AMBER,  x: 0.08 },
      { label: "MIX",     math: "Ψ = Σ Aᵢ·fᵢ", col: ACCENT, x: 0.24 },
      { label: "HEAT",    math: "dE/dt = kΔT",  col: "#ef4444", x: 0.40 },
      { label: "FERMENT", math: "dC/dt = ΔC·φ", col: VIOLET, x: 0.56 },
      { label: "EXTRACT", math: "∫ρ·C dx = N",  col: GREEN,  x: 0.72 },
      { label: "SEED",    math: "C → C·φ",      col: GOLD,   x: 0.88 },
    ];

    const draw = () => {
      tick.current++;
      const W = canvas.width, H = canvas.height;
      ctx.clearRect(0, 0, W, H);
      ctx.fillStyle = "#010810"; ctx.fillRect(0, 0, W, H);

      const t = tick.current * 0.015;

      // Flow line connecting operations
      ctx.beginPath();
      OPS.forEach((op, i) => {
        const x = op.x * W;
        const y = H / 2 + Math.sin(t + i * 0.8) * 20;
        i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
      });
      ctx.strokeStyle = "#ffffff12"; ctx.lineWidth = 2; ctx.stroke();

      OPS.forEach((op, i) => {
        const x = op.x * W;
        const y = H / 2 + Math.sin(t + i * 0.8) * 20;
        const pulse = 0.6 + 0.4 * Math.sin(t * PHI + i * PHI_INV);

        const g = ctx.createRadialGradient(x, y, 0, x, y, 30);
        g.addColorStop(0, `${op.col}25`); g.addColorStop(1, "transparent");
        ctx.fillStyle = g; ctx.fillRect(x - 30, y - 30, 60, 60);

        ctx.beginPath(); ctx.arc(x, y, 18, 0, Math.PI * 2);
        ctx.strokeStyle = `${op.col}${Math.floor(pulse * 180).toString(16).padStart(2,"0")}`;
        ctx.lineWidth = 2; ctx.stroke();

        ctx.font = `8px ${mono}`; ctx.textAlign = "center";
        ctx.fillStyle = op.col; ctx.fillText(op.label, x, y + 1);
        ctx.font = `7px ${mono}`; ctx.fillStyle = `${op.col}80`;
        ctx.fillText(op.math, x, y + 32);

        // Arrow to next
        if (i < OPS.length - 1) {
          const nx = OPS[i + 1].x * W;
          const ny = H / 2 + Math.sin(t + (i + 1) * 0.8) * 20;
          ctx.beginPath(); ctx.moveTo(x + 22, y); ctx.lineTo(nx - 22, ny);
          ctx.strokeStyle = "#ffffff15"; ctx.lineWidth = 1; ctx.stroke();
        }
      });

      ctx.font = `8px ${mono}`; ctx.textAlign = "center"; ctx.fillStyle = "#ffffff20";
      ctx.fillText("KITCHEN = MATHEMATICS · Each operation is a transformation of the coherence field", W / 2, H - 12);

      raf.current = requestAnimationFrame(draw);
    };
    raf.current = requestAnimationFrame(draw);
    return () => { cancelAnimationFrame(raf.current); window.removeEventListener("resize", resize); };
  }, []);

  return <canvas ref={cvs} style={{ width: "100%", display: "block", borderRadius: 8, border: `1px solid ${GOLD}18` }} />;
}

function SubstrateKitchenHeaderCanvas() {
  const ref = useRef<HTMLCanvasElement>(null);
  const rafRef = useRef(0);
  useEffect(() => {
    const canvas = ref.current; if (!canvas) return;
    const ctx = canvas.getContext("2d")!;
    canvas.width = 900; canvas.height = 145;
    const W = canvas.width, H = canvas.height;
    let t=0;
    const bubbles: {x:number;y:number;r:number;vy:number;phase:number;col:string}[]=[];
    for(let i=0;i<20;i++) bubbles.push({x:Math.random()*W,y:H+Math.random()*40,r:2+Math.random()*6,vy:0.4+Math.random()*0.6,phase:Math.random()*Math.PI*2,col:["#2ef0d8","#9966ff","#c9a84c","#44cc77"][Math.floor(Math.random()*4)]});
    const draw=()=>{
      ctx.fillStyle="rgba(2,4,8,0.3)"; ctx.fillRect(0,0,W,H);
      ctx.fillStyle="rgba(46,240,216,0.03)"; ctx.fillRect(0,H-30,W,30);
      bubbles.forEach(b=>{
        b.y-=b.vy; b.x+=Math.sin(t*0.02+b.phase)*0.5;
        if(b.y<-10){b.y=H+10;b.x=Math.random()*W;}
        ctx.beginPath();ctx.arc(b.x,b.y,b.r,0,Math.PI*2);ctx.strokeStyle=b.col+"44";ctx.lineWidth=0.6;ctx.stroke();
        ctx.beginPath();ctx.arc(b.x-b.r*0.3,b.y-b.r*0.3,b.r*0.25,0,Math.PI*2);ctx.fillStyle=b.col+"33";ctx.fill();
      });
      ctx.fillStyle="rgba(68,204,119,0.3)"; ctx.font="9px 'DM Mono',monospace";
      ctx.fillText("SUBSTRATE KITCHEN · BIO-SYNTHESIS · CULTURE · GROWTH MEDIUM · AETHER",14,14);
      t++; rafRef.current=requestAnimationFrame(draw);
    };
    draw();
    return ()=>cancelAnimationFrame(rafRef.current);
  },[]);
  return <canvas ref={ref} style={{width:"100%",height:"auto",borderRadius:8,display:"block"}} />;
}

export default function SubstrateKitchenPage() {
  return (
    <div style={{ background: BG, minHeight: "100vh", fontFamily: body, color: TEXT }}>
      <div style={{flexShrink:0,padding:"8px 12px 0"}}>
        <div style={{display:"inline-block",border:"1px solid #44cc77",padding:"4px 12px",fontSize:10,letterSpacing:"0.2em",color:"#44cc77",fontFamily:"'DM Mono',monospace",marginBottom:12}}>LIVE SIMULATION</div>
        <div style={{background:"rgba(2,4,8,0.8)",borderLeft:"3px solid #44cc77",borderRadius:4,overflow:"hidden",marginBottom:20}}>
          <div style={{padding:"12px 16px 8px"}}><h2 style={{margin:0,fontSize:13,color:"#44cc77",fontFamily:"'DM Mono',monospace",letterSpacing:"0.15em",fontWeight:400}}>SUBSTRATE KITCHEN · BIO-SYNTHESIS · CULTURE · GROWTH MEDIUM · AETHER</h2><p style={{margin:"4px 0 8px",fontSize:10,color:"rgba(68,204,119,0.5)",fontFamily:"'DM Mono',monospace",letterSpacing:"0.1em"}}>20 rising culture bubbles — the live AETHER substrate kitchen simulation.</p></div>
          <SubstrateKitchenHeaderCanvas />
        </div>
      </div>
      {/* Hero */}
      <div style={{ background: "linear-gradient(160deg,#080501 0%,#040c14 50%,#020408 100%)",
        borderBottom: `1px solid ${AMBER}20`, padding: "60px 40px 40px", textAlign: "center" }}>
        <div style={{ fontFamily: mono, fontSize: 10, color: AMBER, letterSpacing: 4, marginBottom: 12 }}>
          AETHER · SUBSTRATE INTELLIGENCE · MACHINE-ASSISTED NUTRITION
        </div>
        <h1 style={{ fontFamily: serif, fontSize: 38, color: "#fff", margin: "0 0 12px", letterSpacing: 2 }}>
          Substrate Kitchen
        </h1>
        <p style={{ fontFamily: body, fontSize: 18, color: DIM, maxWidth: 680, margin: "0 auto 20px" }}>
          Math through cooking. Machines through land, air, and sea.
          Revolutionizing the understanding of science by building it from food — at every age.
        </p>
        <div style={{ display: "flex", gap: 8, justifyContent: "center", flexWrap: "wrap" }}>
          {["Land · Air · Sea Machines", "Kitchen = Mathematics", "Substrate Discovery", "All-Age Curriculum", "Powder → Seed → Extract"].map(t => (
            <span key={t} style={{ fontFamily: mono, fontSize: 10, color: AMBER,
              background: `${AMBER}12`, border: `1px solid ${AMBER}30`, borderRadius: 4, padding: "3px 8px" }}>{t}</span>
          ))}
        </div>
      </div>

      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "40px 24px" }}>

        <SecHead id="s1" n="I" title="Land · Air · Sea Substrate Discovery Network"
          sub="Three fleets of machines scanning Earth's substrate zones — identifying food sources, coherence signatures, and nutritional potential in real time"
          col={AMBER} />

        <div style={{ margin: "0 0 24px" }}>
          <LandAirSeaCanvas />
          <div style={{ display: "flex", gap: 16, marginTop: 8, flexWrap: "wrap" }}>
            <span style={{ fontFamily: mono, fontSize: 9, color: AMBER }}>▬ LAND ROVER · soil · root · seed bank discovery</span>
            <span style={{ fontFamily: mono, fontSize: 9, color: ACCENT }}>✛ AIR DRONE · pollen · atmospheric spore · aerial mycelium</span>
            <span style={{ fontFamily: mono, fontSize: 9, color: "#1fd4c8" }}>⟁ SEA SUBMERSIBLE · kelp · mineral brine · phytoplankton</span>
          </div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 14, marginBottom: 28 }}>
          {[
            { zone: "LAND", col: AMBER, icon: "▬",
              machines: ["Root scanner drone · 0.1m bore, mineral + starch analysis",
                "Soil coherence probe · C(x,t) field mapping at 5cm depth",
                "Seed bank rover · φ-optimal germination site selection",
                "Mycelium tracker · subsurface fungal network mapping"],
              discovery: "Rhizosphere minerals · root starch depots · seed banks · soil microbiome substrate" },
            { zone: "AIR", col: ACCENT, icon: "✛",
              machines: ["Pollen mapping drone · UV fluorescence · bioluminescent marker tracking",
                "Atmospheric sampler · aerial spore identification · iodine concentration",
                "Thermal column rider · maps heat gradients for fermentation site selection",
                "Chlorophyll sensor · aerial canopy coherence field measurement"],
              discovery: "Pollen clouds · aerial mycelium · atmospheric mineral transport · seed dispersal corridors" },
            { zone: "SEA", col: "#1fd4c8", icon: "⟁",
              machines: ["Submersible sampler · 100m depth · kelp extract · mineral brine analysis",
                "Phytoplankton sensor · omega-3 depot · fucoxanthin concentration mapping",
                "Tide-following probe · mineral upwelling detection · coherence peak tracking",
                "Bioluminescence mapper · sea organism photon output · luciferin identification"],
              discovery: "Kelp alginate · sea mineral concentrate · omega-3 depot · phytoplankton bloom extract" },
          ].map(z => (
            <div key={z.zone} style={{ background: `${z.col}07`, border: `1px solid ${z.col}25`, borderRadius: 8, padding: "16px 18px" }}>
              <div style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 10 }}>
                <span style={{ fontSize: 20, color: z.col }}>{z.icon}</span>
                <div style={{ fontFamily: mono, fontSize: 11, color: z.col }}>{z.zone} FLEET</div>
              </div>
              <div style={{ marginBottom: 10 }}>
                {z.machines.map(m => (
                  <div key={m} style={{ fontFamily: body, fontSize: 12, color: TEXT, lineHeight: 1.55,
                    borderBottom: "1px solid #ffffff06", paddingBottom: 5, marginBottom: 5 }}>
                    <span style={{ color: z.col, marginRight: 5, fontSize: 10 }}>›</span>{m}
                  </div>
                ))}
              </div>
              <div style={{ fontFamily: mono, fontSize: 8, color: DIM, marginBottom: 4 }}>DISCOVERIES</div>
              <div style={{ fontFamily: body, fontSize: 12, color: `${z.col}bb`, lineHeight: 1.5 }}>{z.discovery}</div>
            </div>
          ))}
        </div>

        <SecHead id="s2" n="II" title="Kitchen as Mathematical Laboratory"
          sub="Every cooking operation is a precise mathematical transformation of the substrate coherence field — the kitchen is the original science lab"
          col={GOLD} />

        <div style={{ margin: "0 0 24px" }}>
          <KitchenMathCanvas />
        </div>

        <EQ>{`KITCHEN OPERATIONS AS MATHEMATICAL TRANSFORMATIONS:

CHOP / SLICE:        Vector decomposition
  F_substrate → ∂F/∂x · Δx     (surface area ×N, coherence interface exposed)
  Teaching: vectors · gradients · surface area vs. volume

MIX / BLEND:         Superposition
  Ψ_mix = Σᵢ Aᵢ · fᵢ(x,t)      (φ-weighted component superposition)
  Teaching: wave addition · interference · signal mixing

HEAT / COOK:         Energy transfer & phase transition
  dE/dt = k·ΔT · A              (Fourier heat law in the pan)
  E_transition = L·m            (latent heat of phase change)
  Teaching: differential equations · thermal physics

FERMENT / CULTURE:   Coherence field evolution
  dC/dt = α·C·(1−C) − β·ε      (logistic coherence growth + entropy loss)
  → C(t) → φ⁻¹ at equilibrium  (fermentation reaches golden-ratio coherence)
  Teaching: differential equations · population dynamics · equilibrium

EXTRACT / BREW:      Integration
  N_extract = ∫₀ᵀ ρ_active(t)·C(t) dt   (total active compound extracted)
  Teaching: integration · area under curve · concentration

SEED / GERMINATE:    Coherence amplification
  C_seed(t) → C₀ · φⁿ          (exponential coherence growth at Φ rate)
  Teaching: exponential functions · golden ratio · growth modeling`}</EQ>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12, marginBottom: 28 }}>
          {[
            { op: "CHOP", math: "v⃗ = ∂F/∂x", col: AMBER, age: "Age 4+",
              lesson: "Why does slicing make food cook faster? Teach surface area to volume ratio through cutting different shapes and measuring cooking time.",
              science: "Vectors · partial derivatives · geometric surface area" },
            { op: "MIX", math: "Ψ = Σ Aᵢfᵢ", col: ACCENT, age: "Age 6+",
              lesson: "Mix two colours of spice. Watch interference patterns. Teach wave superposition through colour mixing and flavour blending experiments.",
              science: "Wave addition · Fourier decomposition · superposition principle" },
            { op: "HEAT", math: "dE/dt = kΔT", col: "#ef4444", age: "Age 8+",
              lesson: "Measure how fast ice melts at different temperatures. Plot the curve. This is your first differential equation — learned through making ice cream.",
              science: "Differential equations · Fourier heat law · phase transitions" },
            { op: "FERMENT", math: "dC/dt = φ·C", col: VIOLET, age: "Age 10+",
              lesson: "Culture a yogurt from scratch. Measure pH daily. The logistic growth curve of bacteria IS the coherence field equation — biology as mathematics.",
              science: "Logistic growth · equilibrium · phi-coherence dynamics" },
            { op: "EXTRACT", math: "∫ρ·C dx = N", col: GREEN, age: "Age 12+",
              lesson: "Brew different steeping times and measure colour (anthocyanin concentration). Plot concentration vs. time — this is integration learned through tea.",
              science: "Integration · area under curve · reaction kinetics" },
            { op: "SEED / GERMINATE", math: "C → C·φⁿ", col: GOLD, age: "All ages",
              lesson: "Plant seeds, measure growth daily. Plot the exponential curve. The golden ratio appears in leaf arrangement, root branching, and growth rate — math is alive.",
              science: "Exponential functions · φ-ratios · Fibonacci in nature" },
          ].map(op => (
            <div key={op.op} style={{ background: `${op.col}08`, border: `1px solid ${op.col}28`, borderRadius: 8, padding: "14px 16px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 6 }}>
                <div style={{ fontFamily: mono, fontSize: 10, color: op.col }}>{op.op}</div>
                <div style={{ fontFamily: mono, fontSize: 8, color: DIM }}>{op.age}</div>
              </div>
              <div style={{ fontFamily: mono, fontSize: 11, color: GOLD, background: "#030d18", padding: "4px 8px", borderRadius: 4, marginBottom: 8 }}>{op.math}</div>
              <div style={{ fontFamily: body, fontSize: 13, color: TEXT, lineHeight: 1.6, marginBottom: 8 }}>{op.lesson}</div>
              <div style={{ fontFamily: mono, fontSize: 8, color: op.col }}>{op.science}</div>
            </div>
          ))}
        </div>

        <SecHead id="s3" n="III" title="All-Age Substrate Curriculum"
          sub="The same substrate intelligence taught at every developmental stage — from sensory play to scientific research"
          col={VIOLET} />

        <Card title="THE CORE PRINCIPLE: SAME SUBSTRATE, DIFFERENT DEPTH" col={VIOLET}>
          A seed is a seed at age 3 and a seed at age 33. At age 3, you plant it and watch it grow
          (introduction to time and causality). At age 8, you measure its growth rate (introduction to
          functions). At age 14, you model its logistic growth curve (differential equations). At age 20,
          you engineer its luciferase expression for bioluminescent food monitoring (synthetic biology).
          At age 40, you run the coherence field integration across a whole farm substrate network (systems
          mathematics). <strong>The substrate does not change. The depth of understanding does.</strong>
        </Card>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 28 }}>
          {[
            { stage: "SENSORY STAGE (0–6)", col: ROSE ?? "#f472b6", icon: "◑",
              activities: ["Taste powders and describe textures (sensory vocabulary)",
                "Plant seeds in transparent tubes (observe root growth)",
                "Smell different extracts — name the plant source",
                "Sort foods by colour into rainbow categories (wavelength intuition)",
                "Watch bioluminescent fungi glow in the dark (wonder + inquiry)"],
              math: "Counting · sorting · pattern recognition · cause/effect" },
            { stage: "EXPLORER STAGE (6–12)", col: AMBER, icon: "◎",
              activities: ["Grind whole grains into flour — measure before/after mass",
                "Brew chlorophyll tea at 3 temperatures — plot colour vs. temp",
                "Ferment a simple yogurt — track pH, draw the growth curve",
                "Build a land/air/sea substrate map of your local area",
                "Design a machine that could scan for underground seeds"],
              math: "Fractions · graphs · basic calculus concepts · measurement" },
            { stage: "BUILDER STAGE (12–18)", col: ACCENT, icon: "◈",
              activities: ["Model the fermentation curve with logistic differential equation",
                "Design a bioluminescent indicator strip from fungi extract",
                "Program a simple land-rover substrate detection algorithm",
                "Analyze the amino acid spectrum of different protein powders",
                "Build a Φ-ratio garden layout and measure coherence improvement"],
              math: "Differential equations · probability · programming · φ-mathematics" },
            { stage: "RESEARCH STAGE (18+)", col: VIOLET, icon: "⟁",
              activities: ["Design de novo luciferase variants for specific food wavelengths",
                "Build ML models for substrate coherence field prediction",
                "Develop multi-spectral bioluminescent food monitoring systems",
                "Research long-term coherence effects across population age groups",
                "Integrate land/air/sea machine networks into coherent substrate maps"],
              math: "PDE systems · ML/AI · spectroscopy · systems biology" },
          ].map(s => (
            <div key={s.stage} style={{ background: `${s.col}07`, border: `1px solid ${s.col}25`, borderRadius: 8, padding: "16px 18px" }}>
              <div style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 10 }}>
                <span style={{ fontSize: 20, color: s.col }}>{s.icon}</span>
                <div style={{ fontFamily: mono, fontSize: 10, color: s.col }}>{s.stage}</div>
              </div>
              {s.activities.map(a => (
                <div key={a} style={{ fontFamily: body, fontSize: 13, color: TEXT, lineHeight: 1.55,
                  borderBottom: "1px solid #ffffff06", paddingBottom: 5, marginBottom: 5 }}>
                  <span style={{ color: s.col, marginRight: 5 }}>›</span>{a}
                </div>
              ))}
              <div style={{ marginTop: 10, fontFamily: mono, fontSize: 8, color: GOLD,
                background: "#030d18", padding: "6px 10px", borderRadius: 4 }}>{s.math}</div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div style={{ marginTop: 48, padding: "22px 26px", background: "#ffffff04",
          border: `1px solid ${AMBER}18`, borderRadius: 10, textAlign: "center" }}>
          <div style={{ fontFamily: serif, fontSize: 16, color: AMBER, marginBottom: 8 }}>
            THE KITCHEN IS THE UNIVERSE'S FIRST LABORATORY
          </div>
          <div style={{ fontFamily: body, fontSize: 15, color: DIM, lineHeight: 1.7 }}>
            Every transformation of substrate through heat, pressure, time, and extraction
            is a physical equation made edible. The machine and the cook are solving the same problem.
          </div>
          <div style={{ fontFamily: mono, fontSize: 10, color: `${DIM}80`, marginTop: 12 }}>
            AETHER Framework · Shia Miller @StrategicProce
          </div>
        </div>
      </div>
    </div>
  );
}
