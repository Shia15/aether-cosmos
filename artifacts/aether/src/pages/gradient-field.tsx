import { useEffect, useRef, useState } from "react";
const imgHelical = "/api/storage/public-objects/image_1782753031971.png";
/* ──────────────────────────────────────────────────────────
   AETHER Gradient Field · Mechanisms Map
   Helical vacuum flow: v_θ = (Γ/2πr)·e^(−r²/σ²), v_z = ωr
   Field: C(x,y,t) = Σ_k v_θ(r_k)·cos(ωt + φ_k + arg_k)
   Manifestation = □·∫[∩] ⊗ Helix(Γ,ω)·C(x,t) dV
────────────────────────────────────────────────────────── */

const MN  = "'Space Mono',monospace";
const OR  = "'Orbitron',sans-serif";
const G   = "#00ff88";
const GOLD= "#c9a84c";
const TEAL= "#1fd4c8";
const VIO = "#8b5cf6";
const BLUE= "#3b82f6";
const PINK= "#ec4899";
const BRD = "rgba(0,255,136,0.12)";
const mono: React.CSSProperties = { fontFamily:"'Courier New',monospace" };

/* ── 6-stop AETHER gradient colour map ───────────────────── */
const CMAP_STOPS = [
  { t:0.00, r:2,   g:8,   b:18  },
  { t:0.15, r:2,   g:20,  b:55  },
  { t:0.35, r:0,   g:80,  b:110 },
  { t:0.58, r:0,   g:210, b:145 },
  { t:0.80, r:201, g:168, b:76  },
  { t:1.00, r:254, g:249, b:195 },
];
function fieldColor(v: number): [number,number,number] {
  const t = Math.max(0, Math.min(1, (v + 1) * 0.5));
  for (let i = 0; i < CMAP_STOPS.length - 1; i++) {
    const a = CMAP_STOPS[i], b = CMAP_STOPS[i + 1];
    if (t <= b.t) {
      const f = (t - a.t) / (b.t - a.t);
      return [a.r + (b.r - a.r) * f, a.g + (b.g - a.g) * f, a.b + (b.b - a.b) * f];
    }
  }
  const last = CMAP_STOPS[CMAP_STOPS.length - 1];
  return [last.r, last.g, last.b];
}

/* ── Vortex arrangement (pyramidal levels) ───────────────── */
function makeVortices(N: number, W: number, H: number) {
  const vortices: { x: number; y: number; phi: number; sign: number }[] = [];
  const cx = W * 0.5, cy = H * 0.5;
  const spread = Math.min(W, H) * 0.36;
  for (let k = 0; k < N; k++) {
    // Fibonacci spiral placement for 'natural' distribution
    const angle = k * 2.399963; // golden angle radians
    const radius = spread * Math.sqrt((k + 0.5) / N);
    vortices.push({
      x: cx + radius * Math.cos(angle),
      y: cy + radius * Math.sin(angle),
      phi: k * (Math.PI * 2 / N),
      sign: k % 2 === 0 ? 1 : -1,
    });
  }
  return vortices;
}

/* ── Main gradient field canvas ──────────────────────────── */
function GradientFieldCanvas({
  gamma, omega, sigma, nVortices, speed,
}: {
  gamma: number; omega: number; sigma: number; nVortices: number; speed: number;
}) {
  const cvRef  = useRef<HTMLCanvasElement>(null);
  const raf    = useRef(0);
  const tRef   = useRef(0);
  const propsRef = useRef({ gamma, omega, sigma, nVortices, speed });
  propsRef.current = { gamma, omega, sigma, nVortices, speed };

  useEffect(() => {
    const cv = cvRef.current; if (!cv) return;
    cv.width  = cv.offsetWidth  || 700;
    cv.height = cv.offsetHeight || 440;

    // Offscreen buffer at 1/5 resolution for performance
    const offW = Math.floor(cv.width  / 4);
    const offH = Math.floor(cv.height / 4);
    const off  = document.createElement("canvas");
    off.width  = offW; off.height = offH;
    const offCtx = off.getContext("2d")!;
    const imgData = offCtx.createImageData(offW, offH);
    const px = imgData.data;

    let vortices = makeVortices(propsRef.current.nVortices, offW, offH);
    let prevN = propsRef.current.nVortices;

    const draw = () => {
      const { gamma: G, omega: Om, sigma: sig, nVortices: N, speed: sp } = propsRef.current;
      tRef.current += sp * 0.016;
      const t = tRef.current;

      if (N !== prevN) { vortices = makeVortices(N, offW, offH); prevN = N; }

      const sig2 = sig * sig * offW * offW * 0.004; // σ in canvas-space
      const TWO_PI = Math.PI * 2;

      for (let j = 0; j < offH; j++) {
        for (let i = 0; i < offW; i++) {
          let C = 0;
          for (const v of vortices) {
            const dx = i - v.x, dy = j - v.y;
            const r2 = dx * dx + dy * dy;
            const r  = Math.sqrt(r2) + 0.01;
            const vtheta = (G / (TWO_PI * r)) * Math.exp(-r2 / sig2);
            const angle  = Math.atan2(dy, dx);
            C += vtheta * Math.cos(Om * t * v.sign + v.phi + angle);
          }
          // Normalize: typical max ≈ G·N/TWO_PI/0.01 → clamp softer
          const norm = Math.tanh(C / (N * 0.35));
          const [r, g, b] = fieldColor(norm);
          const idx = (j * offW + i) * 4;
          px[idx] = r; px[idx+1] = g; px[idx+2] = b; px[idx+3] = 255;
        }
      }
      offCtx.putImageData(imgData, 0, 0);

      const ctx = cv.getContext("2d")!;
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = "medium";
      ctx.drawImage(off, 0, 0, cv.width, cv.height);

      // ── Vortex overlays ──
      const scaleX = cv.width / offW, scaleY = cv.height / offH;
      vortices.forEach((v, vi) => {
        const cx = v.x * scaleX, cy = v.y * scaleY;
        const pulse = 4 + 3 * Math.sin(t * Om + v.phi);

        // outer ring
        ctx.beginPath(); ctx.arc(cx, cy, pulse + 8, 0, Math.PI * 2);
        ctx.strokeStyle = v.sign > 0 ? "rgba(0,255,136,0.18)" : "rgba(201,168,76,0.18)";
        ctx.lineWidth = 1; ctx.stroke();

        // inner dot
        ctx.beginPath(); ctx.arc(cx, cy, pulse, 0, Math.PI * 2);
        ctx.fillStyle = v.sign > 0 ? `rgba(0,255,136,0.55)` : `rgba(201,168,76,0.55)`;
        ctx.shadowColor = v.sign > 0 ? "#00ff88" : GOLD;
        ctx.shadowBlur  = 10; ctx.fill(); ctx.shadowBlur = 0;

        // index label
        ctx.fillStyle = "rgba(255,255,255,0.5)";
        ctx.font = "9px monospace"; ctx.textAlign = "center"; ctx.textBaseline = "middle";
        ctx.fillText(`φ${vi + 1}`, cx, cy);

        // rotating arm
        const armAngle = Om * t * v.sign + v.phi;
        ctx.beginPath();
        ctx.moveTo(cx, cy);
        ctx.lineTo(cx + (pulse + 14) * Math.cos(armAngle), cy + (pulse + 14) * Math.sin(armAngle));
        ctx.strokeStyle = v.sign > 0 ? "rgba(0,255,136,0.6)" : "rgba(201,168,76,0.6)";
        ctx.lineWidth = 1.2; ctx.stroke();
      });

      // ── Arrow field (every 40px grid) ──
      ctx.strokeStyle = "rgba(255,255,255,0.12)";
      ctx.lineWidth = 1;
      const step = 44;
      for (let jj = step / 2; jj < cv.height; jj += step) {
        for (let ii = step / 2; ii < cv.width; ii += step) {
          const ix = ii / scaleX, iy = jj / scaleY;
          let vx = 0, vy = 0;
          for (const v of vortices) {
            const dx = ix - v.x, dy = iy - v.y;
            const r2 = dx * dx + dy * dy, r = Math.sqrt(r2) + 0.01;
            const vt = (G / (r * TWO_PI)) * Math.exp(-r2 / sig2);
            const angle = Math.atan2(dy, dx);
            vx += vt * v.sign * (-Math.sin(angle));
            vy += vt * v.sign * ( Math.cos(angle));
          }
          const vmag = Math.sqrt(vx * vx + vy * vy) + 0.001;
          const len  = 12;
          const ex   = ii + (vx / vmag) * len;
          const ey   = jj + (vy / vmag) * len;
          ctx.beginPath(); ctx.moveTo(ii, jj); ctx.lineTo(ex, ey); ctx.stroke();
          ctx.beginPath(); ctx.arc(ex, ey, 1.5, 0, Math.PI * 2);
          ctx.fillStyle = "rgba(255,255,255,0.14)"; ctx.fill();
        }
      }

      // HUD
      ctx.fillStyle = "rgba(0,255,136,0.55)";
      ctx.font = "8px monospace"; ctx.textAlign = "left"; ctx.textBaseline = "top";
      ctx.fillText(`Γ=${G.toFixed(1)} ω=${Om.toFixed(2)} σ=${sig.toFixed(2)} N=${N}  t=${t.toFixed(2)}`, 10, 8);

      raf.current = requestAnimationFrame(draw);
    };
    draw();
    const onResize = () => { if (cv) { cv.width = cv.offsetWidth || 700; cv.height = cv.offsetHeight || 440; } };
    window.addEventListener("resize", onResize);
    return () => { cancelAnimationFrame(raf.current); window.removeEventListener("resize", onResize); };
  }, []);

  return (
    <canvas ref={cvRef}
      style={{ display:"block", width:"100%", height:"100%", borderRadius:6, background:"rgb(2,8,18)" }} />
  );
}

/* ── Helical cross-section polar canvas ──────────────────── */
function HelixCrossSection({ gamma, omega, sigma }: { gamma:number; omega:number; sigma:number }) {
  const ref = useRef<HTMLCanvasElement>(null);
  const raf = useRef(0);
  const propsRef = useRef({ gamma, omega, sigma });
  propsRef.current = { gamma, omega, sigma };

  useEffect(() => {
    const cv = ref.current; if (!cv) return;
    cv.width = cv.offsetWidth || 200; cv.height = cv.offsetHeight || 200;
    let t = 0;
    const draw = () => {
      const { gamma: G, omega: Om, sigma: sig } = propsRef.current;
      const ctx = cv.getContext("2d")!;
      const W = cv.width, H = cv.height;
      const cx = W / 2, cy = H / 2;
      const maxR = Math.min(W, H) * 0.43;
      ctx.fillStyle = "rgb(2,6,14)"; ctx.fillRect(0, 0, W, H);

      // Axes
      ctx.strokeStyle = "rgba(0,255,136,0.15)"; ctx.lineWidth = 1;
      [[cx, 0, cx, H], [0, cy, W, cy]].forEach(([x1, y1, x2, y2]) => {
        ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x2, y2); ctx.stroke();
      });

      // v_θ curve: v_θ = G/(2π·r)·e^(-r²/σ²)  in the horizontal direction
      ctx.beginPath(); ctx.strokeStyle = TEAL; ctx.lineWidth = 1.5;
      const sig2 = sig * sig * maxR * maxR * 0.06;
      for (let i = 0; i <= 80; i++) {
        const r = (i / 80) * maxR;
        const vth = (r < 0.5) ? 0 : (G / (Math.PI * 2 * r)) * Math.exp(-r * r / sig2);
        const x = cx + r;
        const y = cy - vth * maxR * 0.6;
        i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
      }
      ctx.stroke();
      // mirror left
      ctx.beginPath(); ctx.strokeStyle = TEAL + "88"; ctx.lineWidth = 1;
      for (let i = 0; i <= 80; i++) {
        const r = (i / 80) * maxR;
        const vth = (r < 0.5) ? 0 : (G / (Math.PI * 2 * r)) * Math.exp(-r * r / sig2);
        const x = cx - r;
        const y = cy - vth * maxR * 0.6;
        i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
      }
      ctx.stroke();

      // v_z curve: v_z = ω·r — linear, in the vertical direction
      ctx.beginPath(); ctx.strokeStyle = GOLD; ctx.lineWidth = 1.5;
      for (let i = 0; i <= 80; i++) {
        const r = (i / 80) * maxR;
        const vz = Om * r * 0.3;
        const x = cx;
        const y = cy - r;
        const x2 = x + vz;
        i === 0 ? ctx.moveTo(x2, y) : ctx.lineTo(x2, y);
      }
      ctx.stroke();

      // Animated core
      const coreR = 6 + 3 * Math.sin(t * Om);
      ctx.beginPath(); ctx.arc(cx, cy, coreR, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(0,255,136,${0.3 + 0.2 * Math.sin(t * Om)})`; ctx.fill();

      // Pulsing concentric rings
      for (let k = 1; k <= 4; k++) {
        const pr = maxR * k / 4;
        const alpha = 0.06 + 0.04 * Math.sin(t * Om * 0.5 + k);
        ctx.beginPath(); ctx.arc(cx, cy, pr, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(0,255,136,${alpha})`; ctx.lineWidth = 0.8; ctx.stroke();
      }

      // Labels
      ctx.fillStyle = TEAL; ctx.font = "8px monospace"; ctx.textAlign = "right"; ctx.textBaseline = "middle";
      ctx.fillText("v_θ", cx - 4, cy - maxR * 0.4);
      ctx.fillStyle = GOLD; ctx.textAlign = "left";
      ctx.fillText("v_z", cx + maxR * 0.25 + 4, cy - maxR * 0.4);
      ctx.fillStyle = "rgba(255,255,255,0.2)"; ctx.font = "7px monospace"; ctx.textAlign = "center"; ctx.textBaseline = "bottom";
      ctx.fillText("r →", W - 4, cy - 2);

      t += 0.04;
      raf.current = requestAnimationFrame(draw);
    };
    draw();
    return () => cancelAnimationFrame(raf.current);
  }, []);

  return <canvas ref={ref} style={{ display:"block", width:"100%", height:"100%", borderRadius:4 }} />;
}

/* ── Plate + Anno ─────────────────────────────────────────── */
function Plate({ src, alt, col, label, caption }:
  { src:string; alt:string; col:string; label:string; caption:string }) {
  return (
    <figure style={{ margin:0, borderRadius:7, overflow:"hidden",
      border:`1px solid ${col}55`, background:"#05070b",
      boxShadow:`0 0 28px ${col}1a` }}>
      <img src={src} alt={alt} loading="lazy" style={{ width:"100%", display:"block" }} />
      <figcaption style={{ padding:"9px 13px", borderTop:`1px solid ${col}22`,
        background:`linear-gradient(180deg,${col}08,transparent)` }}>
        <div style={{ fontFamily:MN, fontSize:8, color:col, letterSpacing:"0.15em", marginBottom:4 }}>{label}</div>
        <div style={{ fontSize:10.5, color:"rgba(200,210,228,0.65)", lineHeight:1.6 }}>{caption}</div>
      </figcaption>
    </figure>
  );
}
function Anno({ col, k, v }: { col:string; k:string; v:string }) {
  return (
    <div style={{ background:`${col}0d`, border:`1px solid ${col}2e`, borderRadius:4, padding:"7px 10px" }}>
      <div style={{ fontFamily:MN, fontSize:8, color:col, fontWeight:700, marginBottom:3 }}>{k}</div>
      <div style={{ fontSize:9.5, color:"rgba(185,200,222,0.65)", lineHeight:1.52 }}>{v}</div>
    </div>
  );
}

/* ── Main page ────────────────────────────────────────────── */
export default function GradientFieldPage() {
  const [gamma,     setGamma]     = useState(1.8);
  const [omega,     setOmega]     = useState(0.55);
  const [sigma,     setSigma]     = useState(0.55);
  const [nVortices, setNVortices] = useState(7);
  const [speed,     setSpeed]     = useState(1.0);

  const eqs = [
    { label:"Azimuthal velocity", eq:"v_θ = (Γ/2πr)·e^(−r²/σ²)", col:TEAL },
    { label:"Axial velocity",     eq:"v_z = ω·r",                   col:GOLD },
    { label:"AETHER coherence field", eq:"C(x,t) = Σ v_θ(rₖ)·cos(ωt+φₖ+argₖ)", col:G },
    { label:"Tanh normalisation", eq:"C_norm = tanh(C / N·0.35)",   col:BLUE },
    { label:"Manifestation",      eq:"□·∫[∩] ⊗ Helix(Γ,ω)·C(x,t) dV", col:VIO },
    { label:"Circulation Γ",      eq:`Γ = ${gamma.toFixed(2)}`,     col:TEAL },
    { label:"Angular ω",          eq:`ω = ${omega.toFixed(2)}`,     col:GOLD },
    { label:"Vortex core σ",      eq:`σ = ${sigma.toFixed(2)}`,     col:PINK },
    { label:"Mechanism count N",  eq:`N = ${nVortices}`,            col:G },
  ];

  const annoGrid: React.CSSProperties = {
    display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(200px,1fr))", gap:7, marginTop:10
  };

  return (
    <div style={{ minHeight:"100%", display:"flex", flexDirection:"column",
      background:"rgb(2,8,18)", color:G, ...mono, fontSize:11 }}>

      {/* ── Header ── */}
      <div style={{ padding:"12px 16px 8px", flexShrink:0 }}>
        <div style={{ display:"inline-block", background:"rgba(0,255,136,0.07)",
          border:"1px solid rgba(0,255,136,0.22)", borderRadius:8,
          padding:"0.3rem 1rem", fontSize:"0.7rem", letterSpacing:"0.2em",
          color:"#44cc77", textTransform:"uppercase", marginBottom:10 }}>
          Gradient Field · Live Simulation
        </div>
        <div style={{ background:"rgba(2,8,18,0.9)", border:"1px solid rgba(0,255,136,0.12)",
          borderLeft:"3px solid #00ff88", borderRadius:10, padding:"12px 16px", marginBottom:10 }}>
          <h2 style={{ fontFamily:OR, fontSize:14, color:"#a0f8d0", margin:"0 0 5px", letterSpacing:2 }}>
            GRADIENT FIELD · FULLY MAPPED MECHANISMS · HELICAL VACUUM FLOW · PYRAMIDAL ENGINE INTEGRATION
          </h2>
          <p style={{ fontSize:11, color:"rgba(0,255,136,0.35)", margin:0, lineHeight:1.6 }}>
            N helical vortex mechanisms seeded in a Fibonacci-spiral arrangement, each running
            v_θ = (Γ/2πr)·e^(−r²/σ²) and v_z = ωr. The superposed coherence field
            C(x,y,t) = Σ_k v_θ(r_k)·cos(ωt+φ_k+arg_k) is rendered as a large time-fluctuating
            gradient — a full spatial map of all mechanism interactions. Arrow field shows instantaneous
            flow direction; rotating arms mark each vortex core.
          </p>
        </div>
      </div>

      {/* ── Main simulation area ── */}
      <div style={{ flex:"0 0 auto", display:"grid", gridTemplateColumns:"1fr 240px", gap:8,
        padding:"0 8px 8px", minHeight:480 }}>

        {/* Large gradient field */}
        <div style={{ border:"1px solid rgba(0,255,136,0.2)", borderRadius:8, overflow:"hidden",
          display:"flex", flexDirection:"column" }}>
          <div style={{ padding:"5px 12px", borderBottom:`1px solid ${BRD}`, fontSize:8,
            letterSpacing:3, color:G, opacity:0.7, display:"flex", justifyContent:"space-between" }}>
            <span>⬡ C(x,y,t) GRADIENT FIELD · {nVortices} MECHANISMS</span>
            <span style={{ opacity:0.45 }}>tanh-normalised · arrow-field overlay · rotating vortex arms</span>
          </div>
          <div style={{ flex:1, minHeight:420 }}>
            <GradientFieldCanvas
              gamma={gamma} omega={omega} sigma={sigma}
              nVortices={nVortices} speed={speed} />
          </div>
        </div>

        {/* Right panel */}
        <div style={{ display:"flex", flexDirection:"column", gap:8 }}>

          {/* Helix cross-section */}
          <div style={{ border:`1px solid ${TEAL}33`, borderRadius:6, flexShrink:0, height:200 }}>
            <div style={{ padding:"4px 10px", fontSize:8, letterSpacing:2, color:TEAL,
              borderBottom:`1px solid ${TEAL}22` }}>
              HELIX CROSS-SECTION
            </div>
            <div style={{ height:168 }}>
              <HelixCrossSection gamma={gamma} omega={omega} sigma={sigma} />
            </div>
          </div>

          {/* Controls */}
          <div style={{ border:`1px solid rgba(0,255,136,0.2)`, borderRadius:6,
            padding:"8px 10px", display:"flex", flexDirection:"column", gap:9 }}>
            <div style={{ fontSize:8, letterSpacing:2, color:G, opacity:0.7, marginBottom:2 }}>
              FIELD CONTROLS
            </div>
            {[
              { label:"Γ circulation", val:gamma,     set:setGamma,     min:0.5, max:4.0, step:0.1, col:TEAL },
              { label:"ω angular vel", val:omega,     set:setOmega,     min:0.05,max:2.0, step:0.05,col:GOLD },
              { label:"σ core size",   val:sigma,     set:setSigma,     min:0.15,max:1.2, step:0.05,col:PINK },
              { label:"N mechanisms",  val:nVortices, set:setNVortices, min:1,   max:16,  step:1,   col:G, isInt:true },
              { label:"time speed",    val:speed,     set:setSpeed,     min:0.1, max:3.0, step:0.1, col:BLUE },
            ].map(s => (
              <label key={s.label} style={{ display:"flex", flexDirection:"column", gap:2 }}>
                <div style={{ display:"flex", justifyContent:"space-between", fontSize:7.5, opacity:0.55 }}>
                  <span>{s.label}</span>
                  <span style={{ color:s.col }}>{"isInt" in s ? String(s.val) : (s.val as number).toFixed(2)}</span>
                </div>
                <input type="range" min={s.min} max={s.max} step={s.step}
                  value={s.val} onChange={e => ("isInt" in s ? s.set(parseInt(e.target.value)) : s.set(parseFloat(e.target.value)))}
                  style={{ width:"100%", accentColor:s.col }} />
              </label>
            ))}
          </div>

          {/* Equations */}
          <div style={{ border:`1px solid rgba(201,168,76,0.25)`, borderRadius:6,
            padding:"8px 10px", display:"flex", flexDirection:"column", gap:7, flex:1, overflow:"auto" }}>
            <div style={{ fontSize:8, letterSpacing:2, color:GOLD, opacity:0.8, marginBottom:2 }}>
              ∑ FIELD EQUATIONS
            </div>
            {eqs.map(e => (
              <div key={e.label} style={{ borderLeft:`2px solid ${e.col}40`, paddingLeft:8 }}>
                <div style={{ fontSize:7, color:e.col, opacity:0.55, letterSpacing:1, marginBottom:1 }}>{e.label}</div>
                <div style={{ fontSize:9, color:e.col, fontWeight:700, lineHeight:1.4 }}>{e.eq}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Knowledge image plate ── */}
      <div style={{ padding:"8px 8px 0", flexShrink:0 }}>
        <div style={{ fontFamily:OR, fontSize:9, color:GOLD, letterSpacing:2, marginBottom:8, paddingLeft:4 }}>
          SOURCE MECHANISM MAP · HELICAL VACUUM FLOW · PYRAMIDAL ENGINE INTEGRATION
        </div>
        <div style={{ background:"rgba(0,0,0,0.4)", border:`1px solid ${TEAL}22`,
          borderRadius:6, padding:"12px 14px", marginBottom:10 }}>
          <Plate src={imgHelical} col={TEAL}
            alt="Helical Vacuum Flow and Pyramidal Engine Integration diagrams showing v_θ = Γ/2πr · e^(-r²/σ²) and v_z = ωr with Manifestation equation"
            label="HELICAL VACUUM FLOW · PYRAMIDAL ENGINE INTEGRATION · C(x,t) COEFFICIENT FIELD"
            caption="Left: a 3D helical vortex — azimuthal velocity v_θ = (Γ/2πr)·e^(−r²/σ²) peaks at the vortex core (σ = core size) and decays exponentially; axial velocity v_z = ωr grows linearly with radius. Cross-section shows the v_θ/v_z phase portrait. Right: a stepped pyramid with helical flows routed through four levels, each with input/output ports — the Pyramidal Engine. Manifestation = □·∫[∩] ⊗ Helix(Γ,ω)·C(x,t) dV, where □ is the d'Alembertian wave operator, ∩ is curvature integration, ⊗ outer product, and C(x,t) is the AETHER coherence coefficient varying in space and time." />
          <div style={annoGrid}>
            <Anno col={TEAL} k="Azimuthal velocity v_θ"
              v="v_θ = (Γ/2πr)·e^(−r²/σ²) — Rankine vortex core modified by Gaussian envelope. Peak is NOT at r=0 (singularity avoided) but at r=σ/√2. Beyond the core, v_θ falls off as 1/r (potential flow)." />
            <Anno col={GOLD} k="Axial velocity v_z"
              v="v_z = ωr — solid-body-like rotation in the axial direction. Linear with radius: inner annuli rotate slower, outer faster. Angular velocity ω controls how fast the helix climbs (pitch rate)." />
            <Anno col={PINK} k="Vortex core size σ"
              v="σ sets the radius at which the Gaussian envelope e^(−r²/σ²) halves — the characteristic core scale. Large σ = broad diffuse mechanism; small σ = tight concentrated vortex. Matches the AETHER coherence localisation parameter." />
            <Anno col={G} k="Circulation Γ"
              v="Γ is the total circulation: line integral of v around any closed loop enclosing the vortex. Γ = ∮ v·dl. Dimensionally [m²/s]. Higher Γ → stronger azimuthal spin → larger field amplitude." />
            <Anno col={VIO} k="Manifestation equation"
              v="□·∫[∩] ⊗ Helix(Γ,ω)·C(x,t) dV — the d'Alembertian □=(∂²/∂t²−c²∇²) acts on the volume integral of helical flow convolved with the AETHER coherence field C(x,t). Curvature integration [∩] captures the spiral geometry. The outer product ⊗ couples spatial and temporal components." />
            <Anno col={BLUE} k="Pyramidal Engine Levels"
              v="Each pyramid level is a mechanism stage: input port → helix routing → output port. The helix carries C(x,t) upward through levels, transforming coherence at each stage. Four levels = four CLCS layers (L1-L4): substrate → quantum → cellular → tissue." />
            <Anno col={GOLD} k="Field superposition"
              v="C(x,y,t) = Σ_k v_θ(r_k)·cos(ωt·sign_k + φ_k + arg_k). N mechanisms with alternating sign (clockwise/counter-clockwise) create interference — regions of constructive superposition glow gold/white; destructive regions return to deep navy. The tanh normalisation prevents blow-up at vortex centres." />
            <Anno col={G} k="Arrow field"
              v="The overlaid arrows show the instantaneous 2D flow velocity u=(u_x, u_y) computed as the tangential component of each vortex's v_θ at each grid point: u_x = −v_θ·sin(arg), u_y = +v_θ·cos(arg). Summed across all N mechanisms, the result is the true velocity field of the superposed vortex system." />
          </div>
        </div>
      </div>

      {/* ── Theory strip ── */}
      <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)",
        borderTop:`1px solid ${BRD}`, flexShrink:0, marginTop:8 }}>
        {[
          { title:"RANKINE-GAUSSIAN VORTEX", col:TEAL,
            body:"v_θ(r)=(Γ/2πr)·e^(−r²/σ²) combines the outer Rankine irrotational solution (1/r decay) with a Gaussian core envelope that removes the 1/r singularity at the origin. The core peak at r=σ/√2 is where azimuthal speed is maximum — the vortex wall." },
          { title:"FIELD INTERFERENCE", col:G,
            body:"N vortices with alternating rotation sign (clockwise/counter-clockwise) produce standing-wave-like interference in C(x,y,t). Constructive zones (field=+1) appear gold-white; destructive zones (field=−1) appear deep navy. The pattern rotates with ω and drifts in time — a fully time-varying gradient." },
          { title:"PYRAMIDAL ENGINE", col:VIO,
            body:"The pyramid routes helical flow through four coherence levels. Each level transforms C(x,t) via the Manifestation operator □·∫[∩]⊗. Input energy enters at base ports; coherent output exits apex ports. The pyramid geometry optimises constructive vortex summation across levels — a multi-stage coherence amplifier." },
          { title:"ARROW FIELD TOPOLOGY", col:GOLD,
            body:"The velocity arrow field u=Σ_k v_θ(r_k)·(−sin arg_k, cos arg_k) reveals the topological structure of the mechanism map: saddle points (opposing vortices), attractors (inward spiral), and repellers (outward spiral) emerge from the superposition — a complete topological portrait of the mechanism landscape." },
        ].map((t, i) => (
          <div key={t.title} style={{ padding:"6px 12px", borderLeft:i > 0 ? `1px solid ${BRD}` : "none" }}>
            <div style={{ fontSize:7, letterSpacing:2, color:t.col, opacity:0.8, marginBottom:2 }}>{t.title}</div>
            <div style={{ fontSize:7, opacity:0.3, lineHeight:1.5 }}>{t.body}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
