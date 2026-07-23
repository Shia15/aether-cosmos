import { useState, useEffect, useRef } from "react";
const heroLiving = "/api/storage/public-objects/ChatGPT_Image_Jun_28,_2026,_01_06_29_PM_1782666399331.png";
const heroSpectrum = "/api/storage/public-objects/ChatGPT_Image_Jun_28,_2026,_01_10_58_PM_1782666667059.png";
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
  moon:   "#dfe8ff",
  steel:  "#9fb2c8",
  dim:    "#2a4060",
  text:   "rgba(200,230,255,0.78)",
};

// ── real graphene constants (measured, 2024) ──
const SIGMA_MAX = 130e9;   // Pa, ultimate tensile strength
const RHO_SEA = 1025;      // kg/m3 seawater
const G = 9.81;            // m/s2
const MU_GRAPHENE = 0.02;
const MU_STEEL = 0.4;

// ─── Graphene Shell Cross-Section ─────────────────────────────────────────────

function GrapheneCanvas({ depth, radius }: { depth: number; radius: number }) {
  const ref = useRef<HTMLCanvasElement>(null);
  const raf = useRef(0);
  const dRef = useRef(depth);  useEffect(() => { dRef.current = depth; }, [depth]);
  const rRef = useRef(radius); useEffect(() => { rRef.current = radius; }, [radius]);

  useEffect(() => {
    const canvas = ref.current; if (!canvas) return;
    const ctx = canvas.getContext("2d"); if (!ctx) return;
    const W = 380, H = 320;
    canvas.width = W; canvas.height = H;
    const cx = W / 2, cy = H / 2;
    let t = 0, podA = 0;

    const draw = () => {
      t++;
      const depthN = dRef.current / 1000;           // 0..1
      const P = RHO_SEA * G * dRef.current;  // Pa, water-column (gauge)
      const Pn = Math.min(1, P / 1.1e7);             // normalize for arrow length
      const R = 55 + rRef.current * 14;              // tunnel outer radius px

      ctx.fillStyle = C.bg; ctx.fillRect(0, 0, W, H);

      // surrounding water, darker with depth
      const wb = 12 + depthN * 30;
      ctx.fillStyle = `rgb(${4},${8 + (1 - depthN) * 10},${wb})`;
      ctx.fillRect(0, 0, W, H);
      // caustic shimmer
      ctx.strokeStyle = "rgba(68,136,255,0.07)"; ctx.lineWidth = 1;
      for (let i = 0; i < 5; i++) {
        ctx.beginPath();
        for (let x = 0; x <= W; x += 8) {
          const y = 30 + i * 60 + Math.sin(x * 0.04 + t * 0.02 + i) * 6;
          x === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
        }
        ctx.stroke();
      }

      // inward pressure arrows (gravity-driven, length ~ depth)
      const arrows = 16;
      for (let i = 0; i < arrows; i++) {
        const a = (i / arrows) * Math.PI * 2;
        const len = 16 + Pn * 34 + Math.sin(t * 0.06 + i) * 2;
        const ox = cx + Math.cos(a) * (R + 12 + len);
        const oy = cy + Math.sin(a) * (R + 12 + len);
        const ix = cx + Math.cos(a) * (R + 12);
        const iy = cy + Math.sin(a) * (R + 12);
        ctx.strokeStyle = `rgba(255,68,136,${0.3 + Pn * 0.5})`; ctx.lineWidth = 1.4;
        ctx.beginPath(); ctx.moveTo(ox, oy); ctx.lineTo(ix, iy); ctx.stroke();
        // arrowhead
        ctx.beginPath();
        ctx.moveTo(ix, iy);
        ctx.lineTo(ix + Math.cos(a + 2.5) * 5, iy + Math.sin(a + 2.5) * 5);
        ctx.lineTo(ix + Math.cos(a - 2.5) * 5, iy + Math.sin(a - 2.5) * 5);
        ctx.closePath(); ctx.fillStyle = `rgba(255,68,136,${0.4 + Pn * 0.5})`; ctx.fill();
      }

      // graphene shell ring (bright, impermeable)
      ctx.beginPath(); ctx.arc(cx, cy, R, 0, Math.PI * 2);
      ctx.lineWidth = 4 + Pn * 3;
      ctx.strokeStyle = C.aurora; ctx.shadowBlur = 12; ctx.shadowColor = C.aurora; ctx.stroke();
      ctx.shadowBlur = 0;
      // hex lattice hint on ring
      ctx.strokeStyle = "rgba(0,255,178,0.25)"; ctx.lineWidth = 0.6;
      for (let i = 0; i < 40; i++) {
        const a = (i / 40) * Math.PI * 2 + t * 0.004;
        ctx.beginPath();
        ctx.arc(cx + Math.cos(a) * R, cy + Math.sin(a) * R, 2.2, 0, Math.PI * 2);
        ctx.stroke();
      }

      // inner air corridor
      const ig = ctx.createRadialGradient(cx, cy, 0, cx, cy, R - 6);
      ig.addColorStop(0, "rgba(0,255,238,0.10)");
      ig.addColorStop(1, "rgba(4,6,14,0.9)");
      ctx.beginPath(); ctx.arc(cx, cy, R - 6, 0, Math.PI * 2); ctx.fillStyle = ig; ctx.fill();

      // gliding pod (small) orbiting corridor to show motion
      podA += 0.02;
      const pr = R - 22;
      ctx.beginPath();
      ctx.arc(cx + Math.cos(podA) * pr, cy + Math.sin(podA) * pr, 4, 0, Math.PI * 2);
      ctx.fillStyle = C.cyan; ctx.shadowBlur = 8; ctx.shadowColor = C.cyan; ctx.fill(); ctx.shadowBlur = 0;

      // labels
      ctx.fillStyle = C.dim; ctx.font = "8px 'DM Mono',monospace"; ctx.textAlign = "center";
      ctx.fillText("GRAPHENE SHELL", cx, cy - R - 18);
      ctx.fillText("AIR CORRIDOR", cx, cy + 3);

      raf.current = requestAnimationFrame(draw);
    };
    draw();
    return () => cancelAnimationFrame(raf.current);
  }, []);

  return <canvas ref={ref} style={{ width: "100%", height: "auto", display: "block", borderRadius: 8 }} />;
}

// ─── Knot Routing Braid ───────────────────────────────────────────────────────

function KnotCanvas({ strands, weave }: { strands: number; weave: number }) {
  const ref = useRef<HTMLCanvasElement>(null);
  const raf = useRef(0);
  const sRef = useRef(strands); useEffect(() => { sRef.current = strands; }, [strands]);
  const wRef = useRef(weave);   useEffect(() => { wRef.current = weave; }, [weave]);

  useEffect(() => {
    const canvas = ref.current; if (!canvas) return;
    const ctx = canvas.getContext("2d"); if (!ctx) return;
    const W = 860, H = 220;
    canvas.width = W; canvas.height = H;
    const palette = [C.aurora, C.cyan, C.violet, C.gold, C.rose, C.blue, "#66ffaa", "#ff88cc", "#88ccff"];
    let t = 0;

    const draw = () => {
      t++;
      ctx.fillStyle = C.bg; ctx.fillRect(0, 0, W, H);
      const N = sRef.current;
      const cross = wRef.current;            // crossings density
      const amp = 22 + cross * 5;
      const freq = 0.004 + cross * 0.0016;
      const pad = 30;
      const span = W - pad * 2;
      const gap = (H - 60) / (N - 1);

      // draw strands back-to-front so weaving reads as over/under
      for (let s = 0; s < N; s++) {
        const baseY = 30 + s * gap;
        const phase = s * (Math.PI / N);
        ctx.beginPath();
        for (let x = 0; x <= span; x += 4) {
          const y = baseY + Math.sin(x * freq + phase + t * 0.02) * amp;
          x === 0 ? ctx.moveTo(pad + x, y) : ctx.lineTo(pad + x, y);
        }
        ctx.strokeStyle = palette[s % palette.length];
        ctx.lineWidth = 3;
        ctx.shadowBlur = 6; ctx.shadowColor = ctx.strokeStyle;
        ctx.stroke();
        ctx.shadowBlur = 0;
        // flow pulse traveling each strand
        const fp = (t * 0.006 + s * 0.18) % 1;
        const fx = pad + fp * span;
        const fy = baseY + Math.sin(fp * span * freq + phase + t * 0.02) * amp;
        ctx.beginPath(); ctx.arc(fx, fy, 3.5, 0, Math.PI * 2);
        ctx.fillStyle = "#ffffff"; ctx.shadowBlur = 10; ctx.shadowColor = palette[s % palette.length];
        ctx.fill(); ctx.shadowBlur = 0;
      }

      // crossing markers (knot nodes) where strands meet center band
      ctx.fillStyle = "rgba(255,255,255,0.0)";
      const knots = Math.round(cross) + 2;
      for (let k = 0; k < knots; k++) {
        const kx = pad + (span / (knots + 1)) * (k + 1);
        ctx.beginPath(); ctx.arc(kx, H / 2, 5, 0, Math.PI * 2);
        ctx.strokeStyle = "rgba(255,255,255,0.35)"; ctx.lineWidth = 1; ctx.stroke();
      }
      // port caps
      ctx.fillStyle = C.dim; ctx.font = "8px 'DM Mono',monospace";
      ctx.textAlign = "left"; ctx.fillText("PORT A", 6, H - 6);
      ctx.textAlign = "right"; ctx.fillText("PORT B", W - 6, H - 6);

      raf.current = requestAnimationFrame(draw);
    };
    draw();
    return () => cancelAnimationFrame(raf.current);
  }, []);

  return <canvas ref={ref} style={{ width: "100%", height: "auto", display: "block", borderRadius: 8 }} />;
}

// ─── Lunar Energy Flow ────────────────────────────────────────────────────────

function LunarCanvas({ phase, tide }: { phase: number; tide: number }) {
  const ref = useRef<HTMLCanvasElement>(null);
  const raf = useRef(0);
  const pRef = useRef(phase); useEffect(() => { pRef.current = phase; }, [phase]);
  const tRef = useRef(tide);  useEffect(() => { tRef.current = tide; }, [tide]);

  useEffect(() => {
    const canvas = ref.current; if (!canvas) return;
    const ctx = canvas.getContext("2d"); if (!ctx) return;
    const W = 380, H = 320;
    canvas.width = W; canvas.height = H;
    let t = 0;
    const flow: { x: number; y: number; v: number }[] = [];

    const draw = () => {
      t++;
      const illum = pRef.current / 100;     // 0..1
      const tideA = tRef.current / 100;     // 0..1
      ctx.fillStyle = C.bg; ctx.fillRect(0, 0, W, H);

      // night sky
      const sky = ctx.createLinearGradient(0, 0, 0, H * 0.55);
      sky.addColorStop(0, "#060a1a"); sky.addColorStop(1, "#0a1430");
      ctx.fillStyle = sky; ctx.fillRect(0, 0, W, H * 0.55);
      // stars
      ctx.fillStyle = "rgba(220,232,255,0.5)";
      for (let i = 0; i < 30; i++) {
        const sx = (i * 53) % W, sy = (i * 37) % (H * 0.5);
        ctx.globalAlpha = 0.3 + 0.3 * Math.sin(t * 0.03 + i);
        ctx.fillRect(sx, sy, 1.4, 1.4);
      }
      ctx.globalAlpha = 1;

      // moon on a slow arc
      const arcX = 50 + ((Math.sin(t * 0.004) * 0.5 + 0.5)) * (W - 100);
      const my = 70 - Math.sin((arcX - 50) / (W - 100) * Math.PI) * 30;
      const mr = 22;
      // glow
      const mg = ctx.createRadialGradient(arcX, my, 0, arcX, my, mr * 3);
      mg.addColorStop(0, `rgba(223,232,255,${0.25 * illum + 0.05})`);
      mg.addColorStop(1, "rgba(223,232,255,0)");
      ctx.beginPath(); ctx.arc(arcX, my, mr * 3, 0, Math.PI * 2); ctx.fillStyle = mg; ctx.fill();
      // moon disc
      ctx.beginPath(); ctx.arc(arcX, my, mr, 0, Math.PI * 2);
      ctx.fillStyle = "#1a2236"; ctx.fill();
      // illuminated fraction (phase) -- clip a lit crescent/gibbous
      ctx.save();
      ctx.beginPath(); ctx.arc(arcX, my, mr, 0, Math.PI * 2); ctx.clip();
      ctx.beginPath();
      const term = arcX - mr + illum * 2 * mr;
      ctx.fillStyle = C.moon;
      ctx.fillRect(arcX - mr, my - mr, (term - (arcX - mr)), mr * 2);
      // soft terminator
      ctx.beginPath(); ctx.ellipse(term, my, Math.abs(mr * (1 - illum)) , mr, 0, 0, Math.PI * 2);
      ctx.fillStyle = illum > 0.5 ? C.moon : "#1a2236"; ctx.fill();
      ctx.restore();

      // sea surface with tide
      const seaY = H * 0.55;
      ctx.beginPath(); ctx.moveTo(0, H);
      for (let x = 0; x <= W; x += 6) {
        const y = seaY + Math.sin(x * 0.03 + t * 0.04) * (4 + tideA * 22) + Math.sin(t * 0.02) * tideA * 8;
        ctx.lineTo(x, y);
      }
      ctx.lineTo(W, H); ctx.closePath();
      const sg = ctx.createLinearGradient(0, seaY, 0, H);
      sg.addColorStop(0, "rgba(68,136,255,0.28)"); sg.addColorStop(1, "rgba(4,10,30,0.9)");
      ctx.fillStyle = sg; ctx.fill();

      // moon reflection / tidal pull line
      ctx.strokeStyle = `rgba(223,232,255,${0.1 + illum * 0.2})`; ctx.lineWidth = 1;
      ctx.beginPath(); ctx.moveTo(arcX, my + mr); ctx.lineTo(arcX, seaY); ctx.stroke();

      // energy flow particles drawn from tide into a core at bottom-right
      const coreX = W - 46, coreY = H - 40;
      const rate = tideA * tideA * 0.9 + illum * 0.12;  // tidal^2 + thin lunar term
      if (Math.random() < rate) flow.push({ x: 40 + Math.random() * (W - 120), y: seaY + 10, v: 1 + Math.random() });
      for (let i = flow.length - 1; i >= 0; i--) {
        const f = flow[i];
        const dx = coreX - f.x, dy = coreY - f.y;
        const d = Math.hypot(dx, dy) || 1;
        f.x += (dx / d) * (1.4 + f.v); f.y += (dy / d) * (1.4 + f.v);
        ctx.beginPath(); ctx.arc(f.x, f.y, 1.8, 0, Math.PI * 2);
        ctx.fillStyle = C.aurora; ctx.fill();
        if (d < 10) flow.splice(i, 1);
      }
      // core (custom energy store)
      const cg = ctx.createRadialGradient(coreX, coreY, 0, coreX, coreY, 26);
      cg.addColorStop(0, `rgba(0,255,178,${0.4 + rate})`); cg.addColorStop(1, "rgba(0,255,178,0)");
      ctx.beginPath(); ctx.arc(coreX, coreY, 26, 0, Math.PI * 2); ctx.fillStyle = cg; ctx.fill();
      ctx.beginPath(); ctx.arc(coreX, coreY, 8, 0, Math.PI * 2); ctx.fillStyle = C.aurora; ctx.fill();
      ctx.fillStyle = C.dim; ctx.font = "8px 'DM Mono',monospace"; ctx.textAlign = "center";
      ctx.fillText("ENERGY CORE", coreX, coreY + 24);

      raf.current = requestAnimationFrame(draw);
    };
    draw();
    return () => cancelAnimationFrame(raf.current);
  }, []);

  return <canvas ref={ref} style={{ width: "100%", height: "auto", display: "block", borderRadius: 8 }} />;
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function ResonantTunnelPage() {
  const [depth, setDepth] = useState(400);
  const [radius, setRadius] = useState(3);
  const [strands, setStrands] = useState(5);
  const [weave, setWeave] = useState(4);
  const [phase, setPhase] = useState(72);
  const [tide, setTide] = useState(55);

  // ── graphene engineering math (real) ──
  const P = RHO_SEA * G * depth;               // Pa, water-column (gauge)
  const P_MPa = P / 1e6;
  const tMin_um = (P * radius / SIGMA_MAX) * 1e6;
  const designT_mm = 4;                          // composite, puncture/abrasion
  const hoopAtDesign = P * radius / (designT_mm / 1000);  // Pa
  const utilization = (hoopAtDesign / SIGMA_MAX) * 100;

  // ── knot logistics math ──
  const redundancy = Math.max(1, Math.round((strands - 1) * (weave / 2)));
  const knotComplexity = Math.round(strands * weave * 0.5);

  // ── lunar / custom energy flow math ──
  const tideA = tide / 100, illum = phase / 100;
  const harvestKW = +(tideA * tideA * 140 + illum * 14).toFixed(0);   // tidal^2 + thin lunar
  const frictionSavePct = Math.round((1 - MU_GRAPHENE / MU_STEEL) * 100); // 95%
  const baseDrawKW = 100;
  const propulsionKW = Math.round(baseDrawKW * MU_GRAPHENE / MU_STEEL + baseDrawKW * 0.1); // graphene-reduced
  const netFlowKW = harvestKW - propulsionKW;

  const panel = { background: C.panel, border: `1px solid ${C.border}`, borderRadius: 12 };
  const slider = (label: string, val: number, set: (v: number) => void, col: string, min: number, max: number, step: number, fmt: string) => (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", fontSize: 9, marginBottom: 5 }}>
        <span style={{ color: C.dim }}>{label}</span>
        <span style={{ color: col }}>{fmt}</span>
      </div>
      <input type="range" min={min} max={max} step={step} value={val}
        onChange={e => set(Number(e.target.value))} style={{ width: "100%", accentColor: col }} />
    </div>
  );
  const readout = (l: string, v: string, u: string, c: string) => (
    <div style={{ border: `1px solid ${C.border}`, borderRadius: 6, padding: "7px 6px", textAlign: "center" }}>
      <div style={{ fontSize: 14, color: c }}>{v}</div>
      <div style={{ fontSize: 7, color: C.dim }}>{l} {u}</div>
    </div>
  );

  const SPEC = [
    ["Tensile σ", "130 GPa", "200x steel"],
    ["Young's E", "1,000 GPa", "5x steel"],
    ["Thickness", "0.34 nm", "1 atom"],
    ["Areal mass", "0.77 mg/m²", "ultralight"],
    ["Permeability", "ZERO", "H₂O · He · N₂"],
    ["Conductivity", "10⁸ S/m", "beats copper"],
    ["Thermal", "5,000 W/mK", "10x copper"],
    ["Optical", "97.7%", "transparent"],
  ];
  const CYCLE = [
    { k: "1 · Sense", c: C.cyan,   t: "Distributed quantum-hydro sensors read pressure, flow, vibration, chemistry, and bio-signal in real time." },
    { k: "2 · Interpret", c: C.blue, t: "A resonance engine predicts turbulence, cavitation, and field interference before it forms." },
    { k: "3 · Harmonize", c: C.aurora, t: "Field emitters and membrane cells shape the water into a coherent, low-resistance corridor." },
    { k: "4 · Adapt", c: C.gold,   t: "The vehicle glides inside a living air-lift corridor; water supports, stabilizes, and propels." },
    { k: "5 · Heal", c: C.rose,    t: "The system learns, evolves, and repairs itself through bio-robotic and living materials." },
  ];
  const HABITAT = ["Garden Lounge", "Work & Learn", "Rest & Rejuvenate", "Community Hub", "Meditation & Reflection"];
  const ROBOTS = ["Environmental Monitor", "Plant-Care Bot", "Cleaning & Maintenance", "Assistive Mobility", "Repair Drone", "Supply Transport", "Security & Surveillance"];
  const SPECTRA = [
    { k: "Pressure-Ring Signature", c: C.rose },
    { k: "Acoustic Resonance", c: C.gold },
    { k: "Electromagnetic Boundary", c: C.cyan },
    { k: "Thermal Exchange", c: C.violet },
    { k: "Chemical / Ionic", c: C.aurora },
    { k: "Flow Topology (field memory)", c: C.blue },
  ];

  return (
    <div style={{ background: C.bg, minHeight: "100vh", color: C.text, fontFamily: "'DM Mono',monospace" }}>
      <div style={{ padding: "2rem 2.5rem 1.2rem", borderBottom: `1px solid ${C.border}` }}>
        <div style={{ fontSize: 8, letterSpacing: "0.4em", color: C.dim, textTransform: "uppercase", marginBottom: 6 }}>
          AETHER · BUILDABLE REALIZATION · GRAPHENE · GRAVITY · LUNAR FLOW
        </div>
        <h1 style={{
          margin: 0, fontSize: 32, letterSpacing: "0.07em", fontFamily: "'Orbitron','Cinzel',sans-serif",
          background: `linear-gradient(135deg, ${C.moon}, ${C.aurora}, ${C.violet})`,
          WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
        }}>
          Living Resonant Tunnel
        </h1>
        <p style={{ margin: "8px 0 0", fontSize: 11, color: "rgba(200,230,255,0.4)", lineHeight: 1.6, maxWidth: 720 }}>
          The knotting logistics that make the air nanotube real -- a graphene shell that defeats depth-pressure by gravity, redundant routes braided into resilient knots, and a custom energy flow that threads thin lunar variability into the tide. Transport is not movement; it is co-creation.
        </p>
        <div style={{ display: "flex", gap: 8, marginTop: 12, flexWrap: "wrap" }}>
          {["Waterproof Graphene", "Hoop-Stress Engineering", "Knot Routing", "Lunar Energy Harvest", "Resonant Living Spectrum"].map(t => (
            <span key={t} style={{ fontSize: 8, padding: "3px 9px", borderRadius: 20, border: `1px solid ${C.border}`, color: C.aurora, letterSpacing: "0.1em" }}>{t}</span>
          ))}
        </div>
      </div>

      <div style={{ padding: "1.5rem 2.5rem", display: "flex", flexDirection: "column", gap: "1.4rem" }}>

        {/* Graphene shell engineering */}
        <div style={{ ...panel, padding: "1.2rem 1.3rem" }}>
          <div style={{ fontSize: 9, color: C.aurora, letterSpacing: "0.25em", textTransform: "uppercase", marginBottom: 12 }}>
            Graphene Shell Engineering &middot; Depth -&gt; Pressure -&gt; Thickness
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "380px 1fr", gap: "1.4rem", alignItems: "start" }}>
            <GrapheneCanvas depth={depth} radius={radius} />
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8 }}>
                {readout("Water-col P", P_MPa.toFixed(2), "MPa", C.rose)}
                {readout("Min shell", tMin_um.toFixed(0), "µm", C.aurora)}
                {readout("σ used @4mm", utilization.toFixed(2), "%", C.cyan)}
              </div>
              {slider("Depth below surface", depth, setDepth, C.blue, 50, 1000, 10, depth + " m")}
              {slider("Tunnel radius r", radius, setRadius, C.violet, 1, 6, 0.5, radius.toFixed(1) + " m")}
              <div style={{ fontSize: 8.5, color: "rgba(200,230,255,0.42)", lineHeight: 1.65 }}>
                Gravity sets the load: P = ρgh. The thin-shell hoop stress σ = P·r / t inverts to a minimum graphene thickness t = P·r / σ_max. With σ_max = 130 GPa, even a 400 m / r=3 m tunnel needs only ~93 µm of pure graphene -- a 3-5 mm composite is for puncture and abrasion, not pressure. The lattice is absolutely impermeable, so no water molecule ever crosses.
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 6 }}>
                {SPEC.map(([k, v, n]) => (
                  <div key={k} style={{ border: `1px solid ${C.border}`, borderRadius: 5, padding: "5px 6px" }}>
                    <div style={{ fontSize: 7, color: C.dim }}>{k}</div>
                    <div style={{ fontSize: 10, color: C.aurora }}>{v}</div>
                    <div style={{ fontSize: 6.5, color: "rgba(200,230,255,0.3)" }}>{n}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Knot routing */}
        <div style={{ ...panel, padding: "1.2rem 1.3rem" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 12, flexWrap: "wrap", gap: 8 }}>
            <div style={{ fontSize: 9, color: C.violet, letterSpacing: "0.25em", textTransform: "uppercase" }}>
              Knotting Logistics &middot; Braided Redundant Routing
            </div>
            <div style={{ display: "flex", gap: 8 }}>
              {readout("Redundant paths", redundancy + "", "", C.aurora)}
              {readout("Knot complexity", knotComplexity + "", "", C.gold)}
            </div>
          </div>
          <KnotCanvas strands={strands} weave={weave} />
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.2rem", marginTop: 14, alignItems: "center" }}>
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {slider("Parallel tube strands", strands, setStrands, C.cyan, 3, 9, 1, strands + " strands")}
              {slider("Weave / crossings", weave, setWeave, C.rose, 1, 8, 1, weave + "")}
            </div>
            <div style={{ fontSize: 8.5, color: "rgba(200,230,255,0.42)", lineHeight: 1.65 }}>
              Routes are not laid as a single fragile line -- they are braided. Each crossing is a switchable knot-node where a pod can hop strands, so the failure of any one tube re-routes instantly through its neighbors. More crossings buy resilience; the cost is knot complexity to schedule. This is the topological backbone that makes a living network survivable.
            </div>
          </div>
        </div>

        {/* Lunar energy flow */}
        <div style={{ ...panel, padding: "1.2rem 1.3rem" }}>
          <div style={{ fontSize: 9, color: C.moon, letterSpacing: "0.25em", textTransform: "uppercase", marginBottom: 12 }}>
            Lunar Variability &middot; Custom Energy Flow
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "380px 1fr", gap: "1.4rem", alignItems: "start" }}>
            <LunarCanvas phase={phase} tide={tide} />
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8 }}>
                {readout("Harvest", harvestKW + "", "kW", C.aurora)}
                {readout("Propulsion", propulsionKW + "", "kW", C.gold)}
                {readout(netFlowKW >= 0 ? "Net surplus" : "Net draw", (netFlowKW >= 0 ? "+" : "") + netFlowKW, "kW", netFlowKW >= 0 ? C.aurora : C.rose)}
              </div>
              {slider("Lunar illumination (phase)", phase, setPhase, C.moon, 0, 100, 1, phase + " %")}
              {slider("Tidal pull amplitude", tide, setTide, C.blue, 0, 100, 1, tide + " %")}
              <div style={{ fontSize: 8.5, color: "rgba(200,230,255,0.42)", lineHeight: 1.65 }}>
                The moon does the quiet work. Tidal head feeds a harvest that scales with amplitude squared, while thin moonlight adds a faint baseline -- variability threaded into the flow rather than fought. Against it, graphene cuts friction from μ≈0.4 to μ≈0.02 (a {frictionSavePct}% drop), so propulsion barely draws. When the tide is full, the tunnel runs at a surplus and banks energy in its core.
              </div>
            </div>
          </div>
        </div>

        {/* The tunnel is alive: 5-step cycle */}
        <div>
          <div style={{ fontSize: 9, color: C.aurora, letterSpacing: "0.25em", textTransform: "uppercase", marginBottom: 12 }}>
            The Tunnel Is Alive &middot; It Breathes, Listens, Responds
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: "0.7rem" }}>
            {CYCLE.map(s => (
              <div key={s.k} style={{ ...panel, padding: "0.9rem 0.9rem", borderTop: `2px solid ${s.c}` }}>
                <div style={{ fontSize: 10, color: s.c, letterSpacing: "0.06em", textTransform: "uppercase", marginBottom: 6 }}>{s.k}</div>
                <p style={{ fontSize: 8.5, color: "rgba(200,230,255,0.42)", lineHeight: 1.6, margin: 0 }}>{s.t}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Hero: living spectrum tunnel */}
        <div style={{ ...panel, overflow: "hidden" }}>
          <img src={heroSpectrum} alt="Living Resonant Spectrum Tunnel concept" style={{ width: "100%", display: "block" }} />
        </div>

        {/* Water as dimensional interface */}
        <div style={{ ...panel, padding: "1.2rem 1.3rem" }}>
          <div style={{ fontSize: 9, color: C.cyan, letterSpacing: "0.25em", textTransform: "uppercase", marginBottom: 6 }}>
            Water As A Dimensional Interface
          </div>
          <p style={{ fontSize: 9.5, color: "rgba(200,230,255,0.45)", lineHeight: 1.6, marginTop: 0, marginBottom: 12, maxWidth: 760 }}>
            Water is not a medium of transport -- it is a dynamic interface where matter, energy, and information are exchanged across multiple spectra. Every object leaves a signature; the tunnel reads, harmonizes, and guides it.
          </p>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "0.7rem" }}>
            {SPECTRA.map(s => (
              <div key={s.k} style={{ border: `1px solid ${C.border}`, borderLeft: `3px solid ${s.c}`, borderRadius: 6, padding: "0.7rem 0.9rem", fontSize: 9.5, color: s.c }}>{s.k}</div>
            ))}
          </div>
        </div>

        {/* Habitat + living hero */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 360px", gap: "1.4rem", alignItems: "start" }}>
          <div style={{ ...panel, overflow: "hidden" }}>
            <img src={heroLiving} alt="Living Resonant Air Nanotube human-centered habitat" style={{ width: "100%", display: "block" }} />
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: "0.9rem" }}>
            <div style={{ ...panel, padding: "1rem 1.1rem", borderLeft: `3px solid ${C.aurora}` }}>
              <div style={{ fontSize: 9, color: C.aurora, letterSpacing: "0.15em", textTransform: "uppercase", marginBottom: 8 }}>Habitat Module Types</div>
              {HABITAT.map(h => <div key={h} style={{ fontSize: 9.5, color: "rgba(200,230,255,0.5)", padding: "2px 0" }}>&middot; {h}</div>)}
            </div>
            <div style={{ ...panel, padding: "1rem 1.1rem", borderLeft: `3px solid ${C.violet}` }}>
              <div style={{ fontSize: 9, color: C.violet, letterSpacing: "0.15em", textTransform: "uppercase", marginBottom: 8 }}>Bio-Mechanistic Robots</div>
              {ROBOTS.map(r => <div key={r} style={{ fontSize: 9.5, color: "rgba(200,230,255,0.5)", padding: "2px 0" }}>&middot; {r}</div>)}
            </div>
          </div>
        </div>

        <div style={{ textAlign: "center", fontSize: 9, color: C.dim, letterSpacing: "0.3em", textTransform: "uppercase", padding: "0.5rem 0 1rem" }}>
          A Living Tunnel For A Living Planet &middot; Safe &middot; Efficient &middot; Adaptive &middot; Resonant &middot; Human-Centered
        </div>
      </div>
    </div>
  );
}
