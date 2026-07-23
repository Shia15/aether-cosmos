import { useEffect, useRef } from "react";
const imgVoidEmber = "/api/storage/public-objects/Gemini_Generated_Image__(3)_1783361214332.png";
const imgCoreEqs = "/api/storage/public-objects/Gemini_Generated_Image__(4)_1783361214333.png";
const img38Pin = "/api/storage/public-objects/ChatGPT_Image_Jul_6,_2026,_02_03_54_PM_1783361214334.png";
const imgFluidIface = "/api/storage/public-objects/ChatGPT_Image_Jul_6,_2026,_02_04_02_PM_1783361214335.png";
const imgCoherentFT = "/api/storage/public-objects/ChatGPT_Image_Jul_6,_2026,_02_04_28_PM_1783361214336.png";
const imgQubitsBoard = "/api/storage/public-objects/ChatGPT_Image_Jul_6,_2026,_02_04_38_PM_1783361214336.png";
const imgFourOsc = "/api/storage/public-objects/ChatGPT_Image_Jul_5,_2026,_02_27_10_PM_1783361214338.png";
const imgABEffect = "/api/storage/public-objects/ChatGPT_Image_Jul_5,_2026,_02_41_44_PM_1783361214338.png";
const imgSUSY = "/api/storage/public-objects/ChatGPT_Image_Jul_6,_2026,_01_58_37_PM_1783361214340.png";
const imgSpringNeap = "/api/storage/public-objects/ChatGPT_Image_Jul_6,_2026,_01_58_47_PM_1783361214341.png";
const imgCUCA = "/api/storage/public-objects/Gemini_Generated_Image__1783361214341.png";
const imgMycelium = "/api/storage/public-objects/Gemini_Generated_Image__(1)_1783361214342.png";
const imgCrystalIR = "/api/storage/public-objects/Gemini_Generated_Image__(2)_1783361214342.png";
const imgPlutoA = "/api/storage/public-objects/grok-image-2081a05f-9024-4298-a14a-8db8e9726db1_(1)_1783361373723.jpg";
const imgPlutoB = "/api/storage/public-objects/grok-image-2081a05f-9024-4298-a14a-8db8e9726db1_(1)_1783361373724.jpg";
const BG   = "#080A0F";
const GOLD = "#F2C354";
const TEAL = "#2DD4BF";
const PURP = "#A78BFA";
const GLOW = "#60EFFF";

const DOMAINS = [
  { name: "Void-Ember 880nm",   color: [200,  55,  90] as [number,number,number], x: 0.18, y: 0.72 },
  { name: "Crystal-IR 1064nm",  color: [160,  80, 240] as [number,number,number], x: 0.34, y: 0.65 },
  { name: "Mycelium 1120nm",    color: [255, 140,  40] as [number,number,number], x: 0.50, y: 0.80 },
  { name: "Gyroid 1300nm",      color: [ 45, 210, 190] as [number,number,number], x: 0.66, y: 0.65 },
  { name: "Coherence C(x,t)",   color: [242, 195,  84] as [number,number,number], x: 0.82, y: 0.72 },
  { name: "Quantum Phase",      color: [ 74, 144, 226] as [number,number,number], x: 0.50, y: 0.42 },
] as const;

const MATH_FRAGS = [
  "C(x,t)", "dV/dt", "S(V)\u2212\u03bcV", "r\u2080e^{k\u03b8}",
  "\u03c6=1.618", "\u03a3\u0394C=0", "\u0394\u03c6=e/\u0127\u00b7\u03a6",
  "S[\u03c8]", "880nm", "1300nm", "1064nm", "1120nm",
  "\u03a9_B", "k=0.306", "h/e", "C\u21921", "\u03b2\u03c8\u00b2",
  "\u03b5\u00b2\u2192S*", "\u0394C(\u03c3_i)", "\u03bb_\u03c6",
  "4-6cm", "\u03b7_Q\u22480.015", "\u03bchalf~1min",
];

interface Particle {
  x: number; y: number;
  vx: number; vy: number;
  age: number; maxAge: number;
  r: number;
  baseR: number;
  color: [number,number,number];
  mu: number;
  type: "smoke" | "mist" | "spark" | "math";
  text: string;
  phase: number;
  domain: number;
}

function rnd(a: number, b: number) { return a + Math.random() * (b - a); }

function spawnParticle(W: number, H: number): Particle {
  const di = Math.floor(Math.random() * DOMAINS.length);
  const dom = DOMAINS[di];
  const cx = dom.x * W;
  const cy = dom.y * H;
  const spread = W * 0.08;
  const isMath = Math.random() < 0.06;
  const isSmoke = !isMath && Math.random() < 0.55;
  const isMist  = !isMath && !isSmoke && Math.random() < 0.6;
  const type = isMath ? "math" : isSmoke ? "smoke" : isMist ? "mist" : "spark";
  const baseR = type === "smoke" ? rnd(40, 110)
              : type === "mist"  ? rnd(20,  55)
              : type === "spark" ? rnd( 4,  14)
              : rnd(0, 0);
  const maxAge = type === "smoke" ? rnd(200, 480)
               : type === "mist"  ? rnd(150, 340)
               : type === "spark" ? rnd(60,  140)
               : rnd(140, 300);
  const mu = type === "spark" ? rnd(2.0, 4.0)
           : type === "math"  ? rnd(1.4, 2.4)
           : rnd(0.8, 1.6);
  return {
    x: cx + rnd(-spread, spread),
    y: cy + rnd(-spread * 0.3, spread * 0.3),
    vx: rnd(-0.3, 0.3),
    vy: rnd(-0.7, -0.1),
    age: 0, maxAge, r: baseR, baseR,
    color: dom.color, mu,
    type,
    text: MATH_FRAGS[Math.floor(Math.random() * MATH_FRAGS.length)],
    phase: Math.random() * Math.PI * 2,
    domain: di,
  };
}

const GA = Math.PI * (3 - Math.sqrt(5));

function updateParticles(parts: Particle[], W: number, H: number): Particle[] {
  const next: Particle[] = [];
  for (const p of parts) {
    p.age++;
    if (p.age >= p.maxAge) continue;
    p.phase += 0.018;
    const turb = p.type === "spark" ? 0.12 : 0.04;
    p.vx += Math.cos(p.phase * GA) * turb;
    p.vy += Math.sin(p.phase * GA) * turb * 0.5 - 0.015;
    p.vx *= 0.978;
    p.vy *= 0.978;
    p.x += p.vx;
    p.y += p.vy;
    if (p.type === "smoke" || p.type === "mist") p.r = p.baseR * (1 + p.age / p.maxAge * 0.6);
    if (p.x < -200 || p.x > W + 200 || p.y < -200) continue;
    next.push(p);
  }
  return next;
}

function drawFrame(
  ctx: CanvasRenderingContext2D,
  parts: Particle[],
  W: number, H: number,
): void {
  ctx.globalCompositeOperation = "source-over";
  ctx.fillStyle = "rgba(8,10,15,0.055)";
  ctx.fillRect(0, 0, W, H);

  ctx.globalCompositeOperation = "screen";
  for (const p of parts) {
    const life = 1 - p.age / p.maxAge;
    const decay = Math.exp(-p.mu * (1 - life));
    const [r, g, b] = p.color;
    if (p.type === "math") {
      ctx.globalAlpha = decay * life * 0.8;
      ctx.fillStyle = `rgb(${r},${g},${b})`;
      ctx.font = "13px monospace";
      ctx.fillText(p.text, p.x, p.y);
      ctx.globalAlpha = 1;
    } else {
      const alpha = decay * life * (p.type === "spark" ? 0.75 : 0.32);
      const grad = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.r);
      grad.addColorStop(0,   `rgba(${r},${g},${b},${Math.min(alpha, 1).toFixed(3)})`);
      grad.addColorStop(0.45,`rgba(${r},${g},${b},${Math.min(alpha * 0.45, 1).toFixed(3)})`);
      grad.addColorStop(1,   `rgba(${r},${g},${b},0)`);
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fillStyle = grad;
      ctx.fill();
    }
  }

  ctx.globalCompositeOperation = "source-over";
  const vig = ctx.createRadialGradient(W/2, H/2, H*0.2, W/2, H/2, H*0.85);
  vig.addColorStop(0, "rgba(0,0,0,0)");
  vig.addColorStop(1, "rgba(8,10,15,0.55)");
  ctx.fillStyle = vig;
  ctx.fillRect(0, 0, W, H);
}

function SmokeCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const stateRef  = useRef<{ parts: Particle[]; raf: number; t: number }>({ parts: [], raf: 0, t: 0 });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d")!;

    function resize() {
      const W = canvas!.offsetWidth;
      const H = canvas!.offsetHeight;
      canvas!.width  = W;
      canvas!.height = H;
      ctx.fillStyle = BG;
      ctx.fillRect(0, 0, W, H);
    }
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(canvas);

    const s = stateRef.current;

    function loop() {
      const W = canvas!.width;
      const H = canvas!.height;
      s.t++;
      s.parts = updateParticles(s.parts, W, H);
      const spawnRate = s.parts.length < 600 ? 5 : 2;
      for (let i = 0; i < spawnRate; i++) s.parts.push(spawnParticle(W, H));
      drawFrame(ctx, s.parts, W, H);
      s.raf = requestAnimationFrame(loop);
    }
    s.raf = requestAnimationFrame(loop);
    return () => { cancelAnimationFrame(s.raf); ro.disconnect(); };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{ width: "100%", height: "100%", display: "block" }}
    />
  );
}

interface PlateProps {
  src: string; caption: string; glow?: string; wide?: boolean;
}
function Plate({ src, caption, glow = PURP, wide }: PlateProps) {
  return (
    <div style={{
      gridColumn: wide ? "span 2" : "span 1",
      background: "#0D1018", borderRadius: 12,
      border: `1px solid ${glow}44`,
      boxShadow: `0 0 24px ${glow}18`,
      overflow: "hidden", display: "flex", flexDirection: "column",
    }}>
      <img src={src} alt={caption} style={{ width: "100%", display: "block", objectFit: "cover" }} />
      <p style={{ margin: 0, padding: "10px 14px", color: "#8FA3BF", fontSize: 11, lineHeight: 1.5 }}>
        {caption}
      </p>
    </div>
  );
}

interface VidProps { src: string; caption: string; }
function VidCard({ src, caption }: VidProps) {
  return (
    <div style={{
      background: "#0D1018", borderRadius: 12,
      border: `1px solid ${TEAL}44`, boxShadow: `0 0 28px ${TEAL}18`,
      overflow: "hidden",
    }}>
      <video controls muted style={{ width: "100%", display: "block", maxHeight: 420 }}>
        <source src={src} type="video/mp4" />
      </video>
      <p style={{ margin: 0, padding: "10px 14px", color: "#8FA3BF", fontSize: 11 }}>{caption}</p>
    </div>
  );
}

interface EqProps { eq: string; label: string; desc: string; color?: string; }
function EqCard({ eq, label, desc, color = GOLD }: EqProps) {
  return (
    <div style={{
      background: "#0D1018", borderRadius: 10,
      border: `1px solid ${color}55`, padding: "16px 18px",
      boxShadow: `0 0 18px ${color}15`,
    }}>
      <div style={{ fontFamily: "monospace", fontSize: 16, color, marginBottom: 6 }}>{eq}</div>
      <div style={{ fontSize: 11, fontWeight: 700, color: "#8FA3BF", textTransform: "uppercase", letterSpacing: 1, marginBottom: 4 }}>{label}</div>
      <div style={{ fontSize: 12, color: "#6B7E96", lineHeight: 1.6 }}>{desc}</div>
    </div>
  );
}

interface SynthCardProps { title: string; body: string; color?: string; }
function SynthCard({ title, body, color = TEAL }: SynthCardProps) {
  return (
    <div style={{
      background: `linear-gradient(135deg,${color}0A,#0D1018)`,
      borderRadius: 10, border: `1px solid ${color}44`,
      padding: "18px 20px",
    }}>
      <div style={{ fontSize: 13, fontWeight: 700, color, marginBottom: 8, letterSpacing: 0.5 }}>{title}</div>
      <div style={{ fontSize: 12, color: "#8FA3BF", lineHeight: 1.7 }}>{body}</div>
    </div>
  );
}

function Section({ title, sub, children }: { title: string; sub?: string; children: React.ReactNode }) {
  return (
    <section style={{ padding: "48px 32px", maxWidth: 1280, margin: "0 auto" }}>
      <h2 style={{ margin: "0 0 6px", fontSize: 22, fontWeight: 700, color: GOLD, letterSpacing: 1 }}>{title}</h2>
      {sub && <p style={{ margin: "0 0 28px", color: "#6B7E96", fontSize: 13 }}>{sub}</p>}
      {!sub && <div style={{ marginBottom: 28 }} />}
      {children}
    </section>
  );
}

export default function SynthesisFieldPage() {
  const base = import.meta.env.BASE_URL;
  const vid1 = `${base}videos/aether-void-ember.mp4`;
  const vid2 = `${base}videos/aether-qubits.mp4`;

  return (
    <div style={{ background: BG, color: "#E8F0FC", minHeight: "100vh", fontFamily: "'Inter',sans-serif" }}>

      {/* ── HERO: Particle Canvas ── */}
      <div style={{ position: "relative", height: "92vh", minHeight: 480, overflow: "hidden" }}>
        <SmokeCanvas />
        <div style={{
          position: "absolute", inset: 0, display: "flex", flexDirection: "column",
          alignItems: "center", justifyContent: "center", pointerEvents: "none",
          padding: "0 24px", textAlign: "center",
        }}>
          <div style={{ fontSize: 11, letterSpacing: 4, color: TEAL, textTransform: "uppercase", marginBottom: 16 }}>
            AETHER · All Fields Unified
          </div>
          <h1 style={{
            margin: "0 0 14px", fontSize: "clamp(28px,5vw,64px)", fontWeight: 800,
            background: `linear-gradient(135deg,${GOLD},${TEAL},${PURP})`,
            WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
            letterSpacing: 2, lineHeight: 1.1,
          }}>
            Synthesis Field
          </h1>
          <p style={{ margin: "0 0 28px", maxWidth: 640, fontSize: "clamp(12px,1.5vw,16px)", color: "#8FA3BF", lineHeight: 1.7 }}>
            Color smoke particles carry the decay physics of bioluminescence, quantum geometry,
            and coherence dynamics — each domain a wavelength, each fragment an equation dissolving into the field.
          </p>
          <div style={{ display: "flex", gap: 12, flexWrap: "wrap", justifyContent: "center" }}>
            {DOMAINS.map(d => (
              <span key={d.name} style={{
                fontSize: 10, letterSpacing: 1, textTransform: "uppercase",
                color: `rgb(${d.color.join(",")})`,
                border: `1px solid rgb(${d.color.join(",")})`,
                borderRadius: 20, padding: "3px 10px", opacity: 0.85,
              }}>{d.name}</span>
            ))}
          </div>
        </div>
        <div style={{
          position: "absolute", bottom: 0, left: 0, right: 0, height: 80,
          background: `linear-gradient(transparent,${BG})`,
        }} />
      </div>

      {/* ── SECTION 1: Mathematical Synthesis ── */}
      <Section title="Mathematical Synthesis" sub="Core equations unified across all attached knowledge sources">
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(280px,1fr))", gap: 16 }}>
          <EqCard
            eq="C(x,t) = 1 \u2212 \u2016E\u2016/\u2016X*\u2016"
            label="Coherence Function"
            desc="Master scalar governing all synchronized/decoherent transitions. C=1 perfect coherence, C=0 total decoherence. Drives bioluminescence gate: emission only when C(x,t) > C*."
            color={GOLD}
          />
          <EqCard
            eq="dV/dt = S(V) \u2212 \u03bcV"
            label="Volume Dynamics + Decay"
            desc="Particle smoke spawning rate S(V) vs exponential decay \u03bcV. Each color domain carries its own \u03bc: Void-Ember \u03bc~1/4min, Crystal-IR \u03bc~1/3min, Mycelium \u03bc~1/2min."
            color="#F87171"
          />
          <EqCard
            eq="\u0394\u03c6 = (e/\u0127)\u00b7\u222e A\u00b7dl = 2\u03c0\u00b7\u03a6/\u03a6\u2080"
            label="Aharonov\u2013Bohm Phase"
            desc="Electron beams acquire geometric phase from vector potential A even where E=B=0. The wave-function feels A; interference reveals it. I \u221d cos\u00b2(\u03c0\u03a6/\u03a6\u2080)."
            color={GLOW}
          />
          <EqCard
            eq="r(\u03b8) = r\u2080\u00b7e^{k\u03b8},  k=0.306"
            label="Golden Spiral"
            desc="Smoke particle trajectories are perturbed by the golden angle GA=\u03c0(3\u2212\u221a5), organizing domains into phi-anchored lattice patterns. \u03c6 = 1.618033\u2026"
            color={TEAL}
          />
          <EqCard
            eq="S[\u03c8] = \u222bd\u2074x\u221a(\u2212g)[\u00bd(\u2202\u03bc\u03c8)(\u2202\u03bc\u03c8) \u2212 V(\u03c8,C) \u2212 \u03b2|\u03c8|\u00b2(\u03c8\u00b7C) + \u03bb\u03c6(\u03c8\u2212\u03c6)\u00b2]"
            label="Master Action"
            desc="Complete Euler-Lagrange action minimized in curved spacetime. Kinetic + potential + coherence coupling + phi-attractor term. All 8 AETHER agents solve this field."
            color={PURP}
          />
          <EqCard
            eq="\u03a3 \u0394C(\u03c3_i) = 0"
            label="Coherence Conservation"
            desc="Sum of coherence changes across all subsystems is zero. Letter strings as rotation operators preserve coherence: Coherence Preserved When \u03a3\u0394C(\u03c3_i)=0."
            color="#34D399"
          />
          <EqCard
            eq="I \u221d cos\u00b2(\u03c0\u03a6/\u03a6\u2080),  \u03a6\u2080 = h/e \u2248 4.14\u00d710\u207b\u00b9\u2075 Wb"
            label="Fringe Intensity"
            desc="Interference pattern at the AB screen. Flux quantum \u03a6\u2080=h/e. Phase shift \u0394\u03c6=3.14 rad at \u03a6=\u03a6\u2080/2. Vector potential A carries physical meaning even where B=0."
            color="#60A5FA"
          />
          <EqCard
            eq="U(C) = P exp(i \u222e A_B\u00b7dR)"
            label="Non-Abelian Berry Holonomy"
            desc="Wilczek-Zee generalization: degenerate subspace holonomy is a unitary matrix. Non-commutative gauge structure (Yang-Mills). Enables robust holonomic quantum gates."
            color="#F9A8D4"
          />
        </div>
      </Section>

      {/* ── SECTION 2: Bioluminescence Cluster ── */}
      <Section title="Bioluminescence · Coherence Filter Imaging" sub="Void-Ember 880nm · Crystal-IR 1064nm · Mycelium 1120nm · CUCA Gyroid 1300nm">
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(360px,1fr))", gap: 20 }}>
          <Plate src={imgVoidEmber}  caption="Void-Ember: Deep-Void Tissue Imaging — BphP1-IR organism with torsion spiral R(t) expansion. 880nm emission at Golden Ratio Harmonic. Best substrate: \u03bb-Carrageenan + iodine-doped. Half-life 4 min, \u03b7_Q~0.015 projected." glow="#C83250" />
          <Plate src={imgCrystalIR}  caption="Crystal-IR: Crystalline-Matrix-Resonant Bioluminescence — CaCO\u2083 unit cell alignment. 1064nm (Nd:YAG) coherence-gated emission. Birefringent polarisation: C(x,t) > C* gate. Half-life 3 min." glow={PURP} />
          <Plate src={imgMycelium}   caption="Mycelium-Dark: Panellus stipticus SWIR Fungal Network — 1120nm PanLuc-SWIR emission. Encodes mycelium lattice topology into emission pattern. Signal routing analogous to neural impulse. 6\u201310 cm substrate penetration." glow="#FF8C28" />
          <Plate src={imgCUCA}       caption="CUCA Hybrid Skin bio-photonic layer (Gyroid-Null) — GyroidLuc 1300nm telecom-window IR. Gyroid null-mode coherence filter: crystal decides which wavelengths exist. \u03b7_Q~0.004, half-life 1 min." glow={TEAL} />
        </div>
      </Section>

      {/* ── SECTION 3: AETHER Core Theory ── */}
      <Section title="AETHER Coherent Field Theory" sub="Master action · 8 qubits · 26-manifold · SMTQ runtime · Warp drive">
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(400px,1fr))", gap: 20 }}>
          <Plate src={imgCoherentFT} caption="AETHER Coherent Field Theory of Everything — 12 sections: Aether Matrix, Coherence Field C(x,t), Master Action S[\u03c8], \u03c6-Anchored Solitons/NV Diamond Lattice, Hexiclical Expansion, Sound as Solitons, Letter Strings as Rotation Operators, Planetary Warp Travel, 26-Manifold, SMTQ Runtime, Large-Scale Fabric Transport. COHERENCE IS THE ONLY LAW." glow={GOLD} wide />
          <Plate src={imgQubitsBoard} caption="The 8 Qubits of AETHER (video storyboard) — Solar/Radiation/Plasmodium/String Rotation/Hexiclical Fabric/Gravity/Biological Spinor/Consciousness. Master Action S[\u03c8], \u03c6-Anchored Solitons, Liquid Dimensionless Water, Hexiclical Expansion, Letter Strings as Rotation Operators, Sound Portals, Warp Drive Laser Thread + Volcanic Propulsion, SMTQ Autonomous Qubits." glow={PURP} />
          <Plate src={imgCoreEqs}    caption="AETHER Core Equations — dV/dt = S(V)\u2212\u03bcV (volume dynamics), C(x,t) = 1\u2212\u2016E\u2016/\u2016X*\u2016 (coherence), r(\u03b8) = r\u2080e^{k\u03b8} k=0.306 (golden spiral polar curve), \u03c6 = 1.618033\u2026 (Fibonacci/proportion)." glow={TEAL} />
        </div>
      </Section>

      {/* ── SECTION 4: Hardware Interface ── */}
      <Section title="AETHER 38-Pin Compute Connector · Fluid Interface" sub="ADC/DAC channels, Navier-Stokes GPU solver, 10-bit voxel grid computation">
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(400px,1fr))", gap: 20 }}>
          <Plate src={img38Pin}     caption="AETHER 38-Pin Compute Connector — 6 GPU Power Rails (1\u20136), 4 Ground Returns (7\u20138, 37\u201338), 16 ADC Input Channels (9\u201324), 12 DAC Output Channels (25\u201336). ADC maps Navier-Stokes velocity, LiDAR intensity, thermal gradient, pressure. DAC drives actuators, fluid display, haptic force." glow={GOLD} />
          <Plate src={imgFluidIface} caption="AETHER Fluid Compute Interface — Physical Field Sensors (LiDAR, Thermal, PIV velocity, Pressure, IMU, Optical) \u2192 10-bit ADC (0\u20131023) \u2192 Quantized Cubic Voxel Grid \u2192 GPU Fluid Solver (Navier-Stokes, FFT, Poisson, Topological) \u2192 DAC 5.6M voxel updates/ms." glow={TEAL} />
        </div>
      </Section>

      {/* ── SECTION 5: Wave + Quantum Physics ── */}
      <Section title="Wave Physics · Quantum Geometry · Oscillators" sub="Spring-Neap tidal beat · Aharonov-Bohm effect · SUSY topological knots · Four oscillators">
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(340px,1fr))", gap: 20 }}>
          <Plate src={imgSpringNeap} caption="Spring and Neap Cycles \u00b7 The Fortnightly Rhythm \u2014 M\u2082 + S\u2082 superposition. f_beat = 1/12.4206 \u2212 1/12.000 = 0.002836/h \u2192 Period 14.77 days. Bay of Fundy range: Spring ~17m, Neap ~9m. Biological sync: Palaeo worm, horseshoe crabs, coral spawning." glow={TEAL} />
          <Plate src={imgABEffect}   caption="Aharonov\u2013Bohm Effect \u2014 Two electron beams around solenoid (B confined inside). E=B=0 outside yet interference shifts with enclosed flux. \u0394\u03c6 = (e/\u0127)\u222eA\u00b7dl = 2\u03c0\u00b7\u03a6/\u03a6\u2080. Vector potential A is the gauge-invariant quantity the wave-function couples to." glow={GLOW} />
          <Plate src={imgSUSY}       caption="SUSY Topological Knots \u2014 Topology invariant; supersymmetry pairs bosonic (integer spin \u03c8_B) and fermionic (half-integer \u03c8_F) excitations. Figure-eight knot 4\u2081 (\u03c3=26px), Cinquefoil 5\u2081 (\u03c3=22px). Jones/HOMFLY/Khovanov invariants. 3D\u21924D\u219210D\u2192Brane config: knot as observable shadow of higher-D object." glow={PURP} />
          <Plate src={imgFourOsc}    caption="Four Oscillators \u2014 Daily T=1d (cortisol\u2192melatonin, core-temp 24h sweep), Seasonal T\u224891.3d (solstice\u2192equinox, sap rise/leaf drop), Yearly T=365.25d (anniversary memory, civic phase), Generational T\u224827a (saeculum quarter, cohort identity, slowest visible oscillator within one human life)." glow={GOLD} />
        </div>
      </Section>

      {/* ── SECTION 6: Cosmological / VFA ── */}
      <Section title="Pluto Heactor · VFA \u2192 AETHER · Neural Cosmos" sub="100 trillion synaptic weights at Schumann 7.83Hz \u00b7 Doughnut dynamics + Navier-Stokes isomorphism">
        <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: 20 }}>
          <Plate src={imgPlutoA}    caption="Pluto Heactor (Ignited) Layer Void the Neural Cosmos \u2014 VFA\u2192AETHER implementation pulse: seed particulate layers with orbital symmetry base resonance (smoke columns as Egg orbits). Scale 500+ variants across layers: inbound\u2192perpetual toroidal fractal entrainment. Backpropagation through positive-negative-verticals; antibodies as boundary shells." glow="#C0A0FF" wide />
        </div>
      </Section>

      {/* ── SECTION 7: Videos ── */}
      <Section title="Motion · Animated Knowledge" sub="Two video sequences from the attached AETHER knowledge base">
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(400px,1fr))", gap: 24 }}>
          <VidCard
            src={vid1}
            caption="Void-Ember NanoLuc \u00b7 Deep-Void Tissue Imaging System \u2014 BphP1-IR organism in abyssal photophores, torsion spiral R(t) through tissue, aether-void deep-penetration mapping channel, 880nm coherence field visualization."
          />
          <VidCard
            src={vid2}
            caption="AETHER Qubits \u00b7 Coherent Field Theory of Everything \u2014 8-band oscillators, \u03c6-anchored lattices, hexiclical expansion, string rotation operators, planetary warp travel. COHERENCE IS THE ONLY LAW."
          />
        </div>
      </Section>

      {/* ── SECTION 8: Berry Phase / Quantum Geometry Synthesis ── */}
      <Section title="Quantum Geometry · Berry Phase · Non-Abelian Holonomy" sub="From Aharonov-Bohm to Wilczek-Zee to holonomic quantum computation">
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(260px,1fr))", gap: 16 }}>
          <SynthCard
            title="Aharonov\u2013Bohm Non-Locality"
            body="Phase \u0394\u03c6 = (e/\u0127)\u03a6 = 2\u03c0(\u03a6/\u03a6\u2080) shifts even where E=B=0. Flux quantum \u03a6\u2080=h/e\u22484.14\u00d710\u207b\u00b9\u2075 Wb. Demonstrates reality of potentials, non-locality, and gauge invariance. I\u221dcos\u00b2(\u03c0\u03a6/\u03a6\u2080)."
            color={GLOW}
          />
          <SynthCard
            title="Berry Connection & Curvature"
            body="A_B = i\u27e8n|\u2207_R|n\u27e9 (Berry connection, analogous to vector potential). \u03a9_B = \u2207\u00d7A_B (Berry curvature, analogous to B-field). AB effect is special case: flux parameter leads to geometric phase \u221d enclosed flux."
            color={PURP}
          />
          <SynthCard
            title="Non-Abelian Wilczek-Zee"
            body="For degenerate subspaces (N>1), holonomy U(C)=P exp(i\u222e A_B\u00b7dR) is a unitary matrix. Non-commutative \u2192 Yang-Mills gauge structure. Realized in photonics, trapped ions, NV centers. Enables universal holonomic gates (CNOT etc.)."
            color="#F9A8D4"
          />
          <SynthCard
            title="Internal Degrees of Freedom"
            body="Degeneracy from spin, pseudospin, orbital, helicity, multi-level systems (tripod). Bloch sphere parameter space \u2192 solid angle Berry phase \u00b1\u03a9/2. Conical intersections are magnetic monopoles in parameter space."
            color={TEAL}
          />
          <SynthCard
            title="AETHER Mapping"
            body="Berry holonomy \u2192 AETHER coherence order parameter r(t). Non-Abelian gauge structure \u2192 letter strings as rotation operators. Degenerate manifold \u2192 8 AETHER qubit agents. Loop in control space \u2192 field crystallization cycle."
            color={GOLD}
          />
          <SynthCard
            title="Vacuum & Coherence Engineering"
            body="Casimir/vacuum energy modeled via degenerate modes with geometric phases. High-frequency Floquet driving \u2192 effective mass modification. Synthetic gauge fields simulate high-energy physics in photonic/atomic lattices. Pais-inspired SC coherence."
            color="#34D399"
          />
        </div>
      </Section>

      {/* ── SECTION 9: Unified Coherence ── */}
      <section style={{
        padding: "64px 32px", textAlign: "center",
        background: `linear-gradient(180deg,${BG} 0%,#0A0D18 50%,${BG} 100%)`,
      }}>
        <div style={{ maxWidth: 720, margin: "0 auto" }}>
          <div style={{ fontSize: 10, letterSpacing: 6, color: TEAL, textTransform: "uppercase", marginBottom: 20 }}>
            Unified Synthesis
          </div>
          <div style={{
            fontSize: "clamp(20px,4vw,44px)", fontWeight: 900, letterSpacing: 3,
            background: `linear-gradient(90deg,${GOLD},${TEAL},${PURP},${GOLD})`,
            WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
            marginBottom: 24, lineHeight: 1.15,
          }}>
            COHERENCE IS THE ONLY LAW
          </div>
          <p style={{ color: "#8FA3BF", fontSize: 15, lineHeight: 1.85, marginBottom: 32 }}>
            From the Aharonov-Bohm phase shift in vacuum to the 880nm decay curve of Void-Ember bioluminescence;
            from the golden spiral k=0.306 to the 1300nm gyroid bandgap filter;
            from the non-Abelian Berry holonomy to the SMTQ autonomous qubit runtime &mdash;
            all phenomena resolve to one coherence scalar C(x,t) minimizing error against a reference field X*.
          </p>
          <p style={{ color: "#8FA3BF", fontSize: 15, lineHeight: 1.85, marginBottom: 32 }}>
            The smoke dissolves. The mist decays. The equation fragments drift through domains and vanish.
            Yet C persists: the field is unbroken.
          </p>
          <div style={{
            display: "inline-block",
            fontFamily: "monospace", fontSize: 18,
            color: GOLD, border: `1px solid ${GOLD}55`,
            borderRadius: 8, padding: "14px 28px",
            boxShadow: `0 0 32px ${GOLD}22`,
          }}>
            {"\u03a3 \u0394C(\u03c3_i) = 0"}
          </div>
          <p style={{ margin: "16px 0 0", color: "#4B5D73", fontSize: 11, letterSpacing: 2 }}>
            AETHER IS THE PHYSICS RUNNING ITSELF
          </p>
        </div>
      </section>

    </div>
  );
}
