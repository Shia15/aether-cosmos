import { useEffect, useRef, useState } from "react";
import manifestImg from "@assets/preview_1781619226428.webp";

const BG     = "#020408";
const ACCENT = "#1fa8d4";
const GOLD   = "#c9a84c";
const VIOLET = "#8b5cf6";
const GREEN  = "#22c55e";
const DIM    = "#3d6070";
const TEXT   = "#c8d8e0";
const AMBER  = "#e8a030";
const TEAL   = "#1fd4c8";
const ROSE   = "#f472b6";

const mono  = "'Space Mono', monospace";
const serif = "'Cinzel', serif";
const body  = "'Crimson Pro', Georgia, serif";

const PHI_INV = 1 / 1.6180339887;

const LAYERS = [
  { id: "sky",     label: "Celestial Navigation Grid",        col: ACCENT,  desc: "Polarized skylight current map — bees navigate by the polarization angle of scattered skylight, encoding a 360° compass without a magnetic field. The sky is a real-time celestial nav system." },
  { id: "canopy",  label: "Biochemical Stress Patterns",      col: ROSE,    desc: "VOC Emission Defense Alert — trees under herbivore attack release volatile organic compounds (terpenes, methyl jasmonate) detectable by neighboring trees up to 50m away. Airborne chemical signaling." },
  { id: "em",      label: "Electromagnetic Scattering",       col: GREEN,   desc: "Leaf surface nanostructures (cuticular wax crystals, trichomes) scatter UV and visible light in species-specific angular patterns — a living electromagnetic signature readable at distance." },
  { id: "thermal", label: "Thermal Signatures",               col: AMBER,   desc: "Trees maintain thermal gradients along their transpiration column. Bark temperature follows sap flow rate. The thermal map is a real-time hydraulic flow chart of the forest substrate." },
  { id: "uv",      label: "UV Beacon for Pollinator Guidance",col: VIOLET,  desc: "Flower petals carry UV-absorbing pigment patterns invisible to humans but vivid to insect compound eyes. Petal with ultraviolet pathways — landing strip geometry encoded in frequencies we cannot see." },
  { id: "moisture",label: "Moisture / Thermal Signatures",    col: TEAL,    desc: "Root-zone moisture gradients generate electrochemical potentials in soil. Above-ground, transpiration rate determines local humidity plumes that insects, fungi, and microbes navigate by." },
  { id: "resonance",label: "Overlapping Resonance Map",       col: GOLD,    desc: "Ground-level: water flow field, mycelial network pulse, Schumann resonance coupling, and root-tip electrochemical signals create an overlapping multi-frequency coherence map. C(x,t) visible in topology." },
];

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
function EQ({ children }: { children: string }) {
  return (
    <pre style={{
      fontFamily: mono, fontSize: 12, color: GOLD, background: "#030d18",
      border: `1px solid ${GOLD}28`, borderRadius: 6, padding: "12px 18px",
      margin: "12px 0", overflowX: "auto", whiteSpace: "pre-wrap",
    }}>{children}</pre>
  );
}

/* ── Live Spectral Field Canvas ─────────────── */
function ManifoldCanvas({ activeLayer }: { activeLayer: string | null }) {
  const cvs  = useRef<HTMLCanvasElement>(null);
  const raf  = useRef(0);
  const tick = useRef(0);

  useEffect(() => {
    const canvas = cvs.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d")!;
    const resize = () => { canvas.width = canvas.parentElement!.clientWidth; canvas.height = 480; };
    resize();
    window.addEventListener("resize", resize);

    // Particle systems per layer
    const moisture = Array.from({ length: 20 }, (_, i) => ({ x: Math.random() * 0.25, y: Math.random(), vy: -0.0008, vx: 0.0002, alpha: Math.random() }));
    const thermal  = Array.from({ length: 12 }, (_, i) => ({ x: 0.15 + i * 0.07, y: 0.8, vy: -0.003, alpha: Math.random() }));
    const voc      = Array.from({ length: 25 }, (_, i) => ({ x: 0.6 + Math.random() * 0.3, y: 0.25 + Math.random() * 0.3, vx: (Math.random()-0.5)*0.001, vy: -0.001, r: Math.random(), col: i % 3 === 0 ? ROSE : i % 3 === 1 ? "#f5d020" : GREEN }));
    const resonance= Array.from({ length: 8 }, (_, i) => ({ cx: 0.2 + i * 0.1, r: 0.01, phase: i * 0.4 }));

    const draw = () => {
      tick.current++;
      const W = canvas.width, H = canvas.height;
      ctx.clearRect(0, 0, W, H);

      const t = tick.current * 0.012;
      const isAll = activeLayer === null;
      const show = (id: string) => isAll || activeLayer === id;

      // Sky / atmosphere zone
      const skyG = ctx.createLinearGradient(0, 0, 0, H * 0.22);
      skyG.addColorStop(0, "#040a18"); skyG.addColorStop(1, "#061220");
      ctx.fillStyle = skyG; ctx.fillRect(0, 0, W, H * 0.22);

      // Forest body
      const forestG = ctx.createLinearGradient(0, H * 0.22, 0, H * 0.75);
      forestG.addColorStop(0, "#03100a"); forestG.addColorStop(1, "#020c06");
      ctx.fillStyle = forestG; ctx.fillRect(0, H * 0.22, W, H * 0.53);

      // Ground / water
      const groundG = ctx.createLinearGradient(0, H * 0.75, 0, H);
      groundG.addColorStop(0, "#031008"); groundG.addColorStop(1, "#02080a");
      ctx.fillStyle = groundG; ctx.fillRect(0, H * 0.75, W, H * 0.25);

      // ── Sky: Celestial Navigation Grid (polarized skylight arcs) ──
      if (show("sky")) {
        const alpha = activeLayer === "sky" ? 0.9 : 0.45;
        for (let arc = 0; arc < 6; arc++) {
          const r = (0.1 + arc * 0.08) * W;
          ctx.beginPath();
          ctx.arc(W * 0.5, H * 0.02, r, 0.15, Math.PI - 0.15);
          ctx.strokeStyle = `rgba(31,168,212,${alpha * (0.2 + arc * 0.05)})`;
          ctx.lineWidth = arc === 2 ? 1.5 : 0.7;
          ctx.stroke();
        }
        // Polarization vectors
        for (let vi = 0; vi < 12; vi++) {
          const vx = (vi / 12) * W;
          const vy = H * 0.05 + Math.sin(vx * 0.015 + t * 0.5) * H * 0.04;
          const angle = Math.PI * vi / 12 + t * 0.1;
          const len = 12;
          ctx.beginPath();
          ctx.moveTo(vx - Math.cos(angle) * len, vy - Math.sin(angle) * len);
          ctx.lineTo(vx + Math.cos(angle) * len, vy + Math.sin(angle) * len);
          ctx.strokeStyle = `rgba(31,168,212,${alpha * 0.5})`;
          ctx.lineWidth = 1; ctx.stroke();
        }
        if (activeLayer === "sky") {
          ctx.font = `8px ${mono}`; ctx.fillStyle = ACCENT + "99"; ctx.textAlign = "center";
          ctx.fillText("POLARIZED SKYLIGHT · CELESTIAL NAV GRID", W * 0.5, H * 0.12);
        }
      }

      // ── Biochemical stress / VOC emission (upper right cloud) ──
      if (show("canopy")) {
        const alpha = activeLayer === "canopy" ? 1 : 0.4;
        voc.forEach(p => {
          p.x += p.vx + Math.sin(t * PHI_INV + p.r * 5) * 0.0002;
          p.y += p.vy;
          if (p.y < 0.15) { p.y = 0.45; p.x = 0.6 + Math.random() * 0.35; }
          const pg = ctx.createRadialGradient(p.x * W, p.y * H, 0, p.x * W, p.y * H, 18 + p.r * 12);
          pg.addColorStop(0, p.col + Math.floor(alpha * 80).toString(16).padStart(2,"0"));
          pg.addColorStop(1, "transparent");
          ctx.fillStyle = pg; ctx.fillRect(p.x * W - 30, p.y * H - 30, 60, 60);
        });
        if (activeLayer === "canopy") {
          ctx.font = `8px ${mono}`; ctx.fillStyle = ROSE + "99"; ctx.textAlign = "right";
          ctx.fillText("VOC EMISSION · DEFENSE ALERT", W * 0.97, H * 0.20);
        }
      }

      // ── Electromagnetic scattering structures (leaf geometry) ──
      if (show("em")) {
        const alpha = activeLayer === "em" ? 1 : 0.35;
        [[0.82, 0.42], [0.88, 0.58], [0.76, 0.50]].forEach(([lx, ly]) => {
          const x = lx * W, y = ly * H;
          ctx.save(); ctx.translate(x, y);
          for (let face = 0; face < 6; face++) {
            const a = (face / 6) * Math.PI * 2;
            const r = 24 + 8 * Math.sin(t * 0.7 + face);
            ctx.beginPath();
            ctx.moveTo(0, 0);
            ctx.lineTo(r * Math.cos(a), r * Math.sin(a));
            ctx.lineTo(r * Math.cos(a + Math.PI / 3), r * Math.sin(a + Math.PI / 3));
            ctx.closePath();
            ctx.strokeStyle = `rgba(34,197,94,${alpha * 0.5})`;
            ctx.lineWidth = 0.8; ctx.stroke();
          }
          ctx.restore();
        });
        if (activeLayer === "em") {
          ctx.font = `8px ${mono}`; ctx.fillStyle = GREEN + "99"; ctx.textAlign = "right";
          ctx.fillText("ELECTROMAGNETIC SCATTERING STRUCTURES", W * 0.97, H * 0.38);
        }
      }

      // ── Thermal signatures (vertical column pulses on trees) ──
      if (show("thermal")) {
        const alpha = activeLayer === "thermal" ? 1 : 0.35;
        [[0.32, 0.72], [0.55, 0.68], [0.70, 0.70]].forEach(([tx, ty], ti) => {
          const x = tx * W;
          const pulse = 0.5 + 0.5 * Math.sin(t * 0.8 + ti * 1.2);
          for (let seg = 0; seg < 8; seg++) {
            const sy = ty * H - seg * H * 0.07;
            const segAlpha = alpha * pulse * (1 - seg / 8);
            ctx.beginPath(); ctx.arc(x, sy, 3 + seg * 0.5, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(232,160,48,${segAlpha * 0.6})`;
            ctx.fill();
          }
          // temp readout
          if (activeLayer === "thermal") {
            ctx.font = `7px ${mono}`; ctx.textAlign = "center"; ctx.fillStyle = AMBER + "80";
            ctx.fillText(`${(20 + ti * 3 + pulse * 5).toFixed(1)}°C`, x, ty * H + 12);
          }
        });
        if (activeLayer === "thermal") {
          ctx.font = `8px ${mono}`; ctx.fillStyle = AMBER + "99"; ctx.textAlign = "left";
          ctx.fillText("THERMAL SIGNATURES · TRANSPIRATION COLUMN", W * 0.03, H * 0.45);
        }
      }

      // ── UV Beacon (central flower) ──
      if (show("uv")) {
        const alpha = activeLayer === "uv" ? 1 : 0.5;
        const fx = W * 0.50, fy = H * 0.64;
        const pulse = 0.6 + 0.4 * Math.sin(t * 1.5);
        // Petals
        for (let p = 0; p < 6; p++) {
          const pa = (p / 6) * Math.PI * 2 + t * 0.2;
          const px = fx + Math.cos(pa) * 22;
          const py = fy + Math.sin(pa) * 22;
          const pg = ctx.createRadialGradient(px, py, 0, px, py, 18);
          pg.addColorStop(0, `rgba(139,92,246,${alpha * pulse * 0.9})`);
          pg.addColorStop(0.5, `rgba(139,92,246,${alpha * 0.3})`);
          pg.addColorStop(1, "transparent");
          ctx.fillStyle = pg; ctx.fillRect(px - 18, py - 18, 36, 36);
        }
        // Center glow
        const cg = ctx.createRadialGradient(fx, fy, 0, fx, fy, 30 * pulse);
        cg.addColorStop(0, `rgba(200,168,76,${alpha * 0.9})`);
        cg.addColorStop(0.5, `rgba(139,92,246,${alpha * 0.4})`);
        cg.addColorStop(1, "transparent");
        ctx.fillStyle = cg; ctx.fillRect(fx - 30, fy - 30, 60, 60);
        if (activeLayer === "uv") {
          ctx.font = `8px ${mono}`; ctx.fillStyle = VIOLET + "99"; ctx.textAlign = "center";
          ctx.fillText("UV BEACON · PETAL ULTRAVIOLET PATHWAYS", fx, fy + 45);
        }
      }

      // ── Moisture tendrils (left side) ──
      if (show("moisture")) {
        const alpha = activeLayer === "moisture" ? 1 : 0.4;
        moisture.forEach(p => {
          p.y += p.vy; p.x += p.vx * Math.sin(t + p.alpha * 5);
          if (p.y < 0) { p.y = 1; p.x = Math.random() * 0.25; }
          ctx.beginPath();
          ctx.arc(p.x * W, p.y * H, 2, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(31,212,200,${alpha * p.alpha * 0.7})`;
          ctx.fill();
        });
        // Humidity readouts
        [[0.05, 0.3, "9%"], [0.08, 0.55, "Humidity 9%"]].forEach(([x, y, label]) => {
          if (activeLayer === "moisture") {
            ctx.font = `7px ${mono}`; ctx.textAlign = "left"; ctx.fillStyle = TEAL + "80";
            ctx.fillText(String(label), Number(x) * W, Number(y) * H);
          }
        });
        if (activeLayer === "moisture") {
          ctx.font = `8px ${mono}`; ctx.fillStyle = TEAL + "99"; ctx.textAlign = "left";
          ctx.fillText("MOISTURE GRADIENTS · THERMAL SIGNATURES", W * 0.02, H * 0.85);
        }
      }

      // ── Ground resonance map (bottom flow field) ──
      if (show("resonance")) {
        const alpha = activeLayer === "resonance" ? 1 : 0.5;
        resonance.forEach(r => {
          r.r = 0.005 + 0.08 * ((tick.current * 0.003 + r.phase) % 1);
          const x = r.cx * W, y = H * 0.88;
          ctx.beginPath(); ctx.ellipse(x, y, r.r * W, r.r * W * 0.3, 0, 0, Math.PI * 2);
          ctx.strokeStyle = `rgba(200,168,76,${alpha * Math.max(0, 0.6 - r.r * 6)})`;
          ctx.lineWidth = 1; ctx.stroke();
        });
        // Flow lines
        for (let fl = 0; fl < 5; fl++) {
          ctx.beginPath();
          const y0 = H * 0.82 + fl * H * 0.03;
          for (let fx2 = 0; fx2 < W; fx2 += 4) {
            const fy2 = y0 + Math.sin(fx2 * 0.02 + t * 0.6 + fl * 0.5) * H * 0.015;
            fx2 === 0 ? ctx.moveTo(fx2, fy2) : ctx.lineTo(fx2, fy2);
          }
          ctx.strokeStyle = `rgba(31,168,212,${alpha * 0.2})`;
          ctx.lineWidth = 1; ctx.stroke();
        }
        if (activeLayer === "resonance") {
          ctx.font = `8px ${mono}`; ctx.fillStyle = GOLD + "99"; ctx.textAlign = "center";
          ctx.fillText("OVERLAPPING RESONANCE MAP · C(x,t) GROUND FIELD", W * 0.5, H * 0.98);
        }
      }

      // ── Center label ──
      if (!activeLayer) {
        ctx.font = `10px ${mono}`; ctx.textAlign = "left"; ctx.fillStyle = "#ffffff18";
        ctx.fillText("INFORMATION MANIFOLD · LIVING SPECTRAL TOPOLOGY", 14, H - 12);
      }

      raf.current = requestAnimationFrame(draw);
    };
    raf.current = requestAnimationFrame(draw);
    return () => { cancelAnimationFrame(raf.current); window.removeEventListener("resize", resize); };
  }, [activeLayer]);

  return <canvas ref={cvs} style={{ width: "100%", display: "block", borderRadius: 8, border: `1px solid ${ACCENT}18` }} />;
}

function InfoManifoldCanvas() {
  const ref = useRef<HTMLCanvasElement>(null);
  const rafRef = useRef(0);
  useEffect(() => {
    const canvas = ref.current; if (!canvas) return;
    const ctx = canvas.getContext("2d")!;
    canvas.width = 900; canvas.height = 155;
    const W = canvas.width, H = canvas.height;
    const N=40;
    const pts: {x:number;y:number}[] = [];
    for(let i=0;i<N;i++) pts.push({x:Math.random()*W,y:Math.random()*H});
    let t=0;
    const draw=()=>{
      ctx.fillStyle="rgba(2,4,8,0.3)"; ctx.fillRect(0,0,W,H);
      const upts=pts.map((p,i)=>({x:p.x+Math.sin(t*0.015+i*0.4)*8,y:p.y+Math.cos(t*0.012+i*0.5)*6}));
      upts.forEach((a,i)=>{
        upts.slice(i+1).forEach((b,j)=>{
          const d=Math.hypot(a.x-b.x,a.y-b.y);
          if(d<120){
            const col=d<60?"#9966ff":"#2ef0d8";
            ctx.beginPath();ctx.moveTo(a.x,a.y);ctx.lineTo(b.x,b.y);
            ctx.strokeStyle=col+Math.round((1-d/120)*30).toString(16).padStart(2,"0"); ctx.lineWidth=0.5; ctx.stroke();
          }
        });
        const pls=0.6+0.4*Math.sin(t*0.03+i*0.7);
        ctx.beginPath();ctx.arc(a.x,a.y,3*pls,0,Math.PI*2);ctx.fillStyle=`rgba(153,102,255,${pls*0.8})`;ctx.fill();
      });
      ctx.fillStyle="rgba(153,102,255,0.3)"; ctx.font="9px 'DM Mono',monospace";
      ctx.fillText("INFORMATION MANIFOLD · TOPOLOGY · KNOWLEDGE SURFACE · AETHER",14,14);
      t++; rafRef.current=requestAnimationFrame(draw);
    };
    draw();
    return ()=>cancelAnimationFrame(rafRef.current);
  },[]);
  return <canvas ref={ref} style={{width:"100%",height:"auto",borderRadius:8,display:"block"}} />;
}

export default function InformationManifoldPage() {
  const [activeLayer, setActiveLayer] = useState<string | null>(null);

  return (
    <div style={{ background: BG, minHeight: "100vh", fontFamily: body, color: TEXT }}>
      {/* Hero */}
      <div style={{ background: "linear-gradient(160deg,#020a04 0%,#030e12 50%,#020408 100%)",
        borderBottom: `1px solid ${GREEN}20`, padding: "60px 40px 40px", textAlign: "center" }}>
        <div style={{ fontFamily: mono, fontSize: 10, color: GREEN, letterSpacing: 4, marginBottom: 12 }}>
          AETHER · LIVING SPECTRAL TOPOLOGY · ECOSYSTEM INTELLIGENCE
        </div>
        <h1 style={{ fontFamily: serif, fontSize: 38, color: "#fff", margin: "0 0 12px", letterSpacing: 2 }}>
          Information Manifold
        </h1>
        <p style={{ fontFamily: body, fontSize: 18, color: DIM, maxWidth: 680, margin: "0 auto 20px" }}>
          Every forest is a living information network. Moisture gradients, thermal columns,
          UV beacons, biochemical alerts, and electromagnetic scattering — the ecosystem is a
          coherence field made visible.
        </p>
      </div>

      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "40px 24px" }}>

        <SecHead id="s1" n="I" title="The Living Spectral Field"
          sub="Select a layer to isolate its signal — or observe all layers simultaneously as the ecosystem broadcasts"
          col={GREEN} />

        {/* Reference image */}
        <div style={{ marginBottom: 24, borderRadius: 8, overflow: "hidden", border: `1px solid ${GREEN}18` }}>
          <img src={manifestImg} alt="Information Manifold — Living Spectral Topology"
            style={{ width: "100%", display: "block" }} />
          <div style={{ padding: "8px 14px", background: "#ffffff04", fontFamily: mono, fontSize: 9, color: DIM }}>
            Information Manifold · Living Spectral Topology · All labeled data streams are simultaneously present in the ecosystem field
          </div>
        </div>

        {/* Layer selector */}
        <div style={{ display: "flex", gap: 6, marginBottom: 16, flexWrap: "wrap" }}>
          <button onClick={() => setActiveLayer(null)} style={{
            fontFamily: mono, fontSize: 9, padding: "5px 12px", borderRadius: 4, cursor: "pointer",
            border: `1px solid ${activeLayer === null ? GREEN : DIM + "40"}`,
            background: activeLayer === null ? `${GREEN}15` : "transparent",
            color: activeLayer === null ? GREEN : DIM,
          }}>ALL LAYERS</button>
          {LAYERS.map(l => (
            <button key={l.id} onClick={() => setActiveLayer(activeLayer === l.id ? null : l.id)} style={{
              fontFamily: mono, fontSize: 9, padding: "5px 12px", borderRadius: 4, cursor: "pointer",
              border: `1px solid ${activeLayer === l.id ? l.col : l.col + "30"}`,
              background: activeLayer === l.id ? `${l.col}15` : "transparent",
              color: activeLayer === l.id ? l.col : DIM,
            }}>{l.label.split(" ")[0].toUpperCase()}</button>
          ))}
        </div>

        {/* Animated canvas */}
        <div style={{ marginBottom: 28 }}>
          <ManifoldCanvas activeLayer={activeLayer} />
        </div>

        {/* Active layer detail */}
        {activeLayer && (() => {
          const l = LAYERS.find(x => x.id === activeLayer)!;
          return (
            <div style={{ background: `${l.col}08`, border: `1px solid ${l.col}30`,
              borderRadius: 8, padding: "16px 20px", marginBottom: 28 }}>
              <div style={{ fontFamily: mono, fontSize: 10, color: l.col, marginBottom: 6 }}>{l.label}</div>
              <div style={{ fontFamily: body, fontSize: 15, color: TEXT, lineHeight: 1.75 }}>{l.desc}</div>
            </div>
          );
        })()}

        <SecHead id="s2" n="II" title="The Seven Spectral Streams"
          sub="Each stream is a distinct information channel — together they form the Information Manifold, the full coherence field of the living ecosystem"
          col={ACCENT} />

        <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 12, marginBottom: 28 }}>
          {LAYERS.map(l => (
            <div key={l.id}
              onClick={() => setActiveLayer(activeLayer === l.id ? null : l.id)}
              style={{ background: `${l.col}07`, border: `1px solid ${l.col}28`,
                borderRadius: 8, padding: "14px 16px", cursor: "pointer",
                opacity: activeLayer && activeLayer !== l.id ? 0.5 : 1 }}>
              <div style={{ fontFamily: mono, fontSize: 10, color: l.col, marginBottom: 6 }}>{l.label}</div>
              <div style={{ fontFamily: body, fontSize: 13, color: TEXT, lineHeight: 1.6 }}>{l.desc}</div>
            </div>
          ))}
        </div>

        <EQ>{`INFORMATION MANIFOLD — C(x,t) ACROSS ECOSYSTEM LAYERS:

LAYER 1 · SKY (polarized light field):
  θ_sky(x) = polarization angle at position x
  Bee navigation: φ_heading = arg min |θ_sky(x) − θ_internal|
  Celestial grid spacing: Δθ = π/180° per degree azimuth

LAYER 2 · CANOPY (VOC biochemical field):
  C_VOC(x,t) = Σ c_i · e^{−λᵢ·|x−x_i|}    (exponential plume decay)
  Signal: methyl jasmonate · terpene · ethylene
  Detection range: up to 50m upwind from source tree

LAYER 3 · LEAVES (EM scattering signature):
  f(θ,φ) = Σ aₙ · Pₙ(cos θ) · e^{iφ}    (angular distribution)
  Cuticle nanostructure → species-specific diffraction pattern

LAYER 4 · THERMAL (sap flow column):
  T(x,y,t) = T_ambient + ΔT · q(t) / (2πkz)
  q = sap flow rate · k = wood thermal conductivity
  Thermal map = real-time hydraulic infrastructure of forest

LAYER 5 · FLOWER (UV beacon):
  UV pattern wavelength: 300–380 nm (bee-visible, human-invisible)
  Petal absorption: melanin-based UV sink = runway marker
  Luciferin analogy: UV → excitation, no external source needed

LAYER 6 · MOISTURE (root–atmosphere gradient):
  VPD(z) = e_s(T) − e_a    (vapor pressure deficit by altitude)
  Electrochemical potential: ΔV = RT/nF · ln(C_root/C_air)

LAYER 7 · RESONANCE (ground coherence field):
  C_ground(x,t) = (1/N²) Σᵢⱼ [|sin((θᵢ − θⱼ)/2)| < ε_lock]
  Schumann coupling: 7.83 Hz earth-ionosphere cavity
  Mycelial pulse frequency: 0.5–4 Hz electrochemical spikes`}</EQ>

        <SecHead id="s3" n="III" title="Tetrachromatic Spectral Sensing"
          sub="Pollinators see the information manifold directly — 4-channel UV/Blue/Green/Red-enhanced vision encodes flower biochemical state as navigable manifold"
          col={VIOLET} />

        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 10, marginBottom: 28 }}>
          {[
            { ch: "UV", range: "300–380 nm", col: VIOLET, info: "Flower runway patterns, bee navigation grid, petal UV absorption sink" },
            { ch: "BLUE", range: "380–490 nm", col: ACCENT, info: "Sky polarization channel, flower freshness indicators, water depth cueing" },
            { ch: "GREEN", range: "490–560 nm", col: GREEN, info: "Leaf chlorophyll stress map, plant vigor index, canopy gap detection" },
            { ch: "RED+", range: "560–700 nm", col: AMBER, info: "Fruit ripeness, thermal emission overlap, VOC-fluorescence tagging" },
          ].map(c => (
            <div key={c.ch} style={{ background: `${c.col}08`, border: `1px solid ${c.col}28`, borderRadius: 8, padding: "14px 16px" }}>
              <div style={{ fontFamily: mono, fontSize: 14, color: c.col, marginBottom: 4 }}>{c.ch}</div>
              <div style={{ fontFamily: mono, fontSize: 9, color: DIM, marginBottom: 8 }}>{c.range}</div>
              <div style={{ fontFamily: body, fontSize: 13, color: TEXT, lineHeight: 1.55 }}>{c.info}</div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div style={{ marginTop: 48, padding: "22px 26px", background: "#ffffff04",
          border: `1px solid ${GREEN}18`, borderRadius: 10, textAlign: "center" }}>
          <div style={{ fontFamily: serif, fontSize: 16, color: GREEN, marginBottom: 8 }}>
            THE FOREST IS BROADCASTING · YOU ARE RECEIVING
          </div>
          <div style={{ fontFamily: body, fontSize: 15, color: DIM, lineHeight: 1.7 }}>
            Every species in the ecosystem is simultaneously a transmitter and a receiver of the Information Manifold.
            The coherence field C(x,t) is not a metaphor — it is the measurable superposition of all these signals.
          </div>
          <div style={{ fontFamily: mono, fontSize: 10, color: `${DIM}80`, marginTop: 12 }}>
            AETHER Framework · Shia Miller @StrategicProce
          </div>
        </div>
      </div>
    </div>
  );
}
