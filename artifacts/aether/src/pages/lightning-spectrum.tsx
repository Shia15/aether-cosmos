import { useState, useRef, useEffect, useCallback } from "react";

const VOID = "#020810";
const PANEL = "#071220";
const RING1 = "#0a1628";
const RING2 = "#0d1f3c";
const BORDER = "rgba(26,58,107,0.25)";
const BGLOW = "rgba(46,109,164,0.4)";
const TP = "#e8f0fa";
const TS = "#8ba8cc";
const TD = "#4a6080";
const TEAL = "#1fd4c8";
const GOLD = "#c9a84c";
const VIOLET = "#8b5cf6";
const ORANGE = "#f97316";
const GREEN = "#22c55e";
const BLUE = "#4a9fd4";
const ROSE = "#f43f5e";

// Physics constants
const Qe  = 1.6021766e-19;   // C
const Me  = 9.1093837e-31;   // kg
const hbar= 1.0545718e-34;   // J·s
const c   = 2.9979245e8;     // m/s
const kB  = 1.3806503e-23;   // J/K
const b_w = 2.897771955e-3;  // m·K (Wien displacement constant)
const PI2 = 2 * Math.PI;

function calcA(V: number, d: number): number  { return (Qe * V) / (Me * d); }
function calcT(a: number): number              { return (hbar * a) / (PI2 * c * kB); }
function calcLambda(T: number): number         { return b_w / T; }
function sci(n: number, dp=3): string {
  if (n === 0) return "0";
  const exp = Math.floor(Math.log10(Math.abs(n)));
  const coef = (n / Math.pow(10, exp)).toFixed(dp);
  return coef + " x 10^" + exp;
}
function fmtM(m: number): string {
  if (m >= 1e3)  return (m/1e3).toFixed(1) + " km";
  if (m >= 1)    return m.toFixed(2) + " m";
  if (m >= 1e-3) return (m*1e3).toFixed(2) + " mm";
  if (m >= 1e-6) return (m*1e6).toFixed(2) + " um";
  if (m >= 1e-9) return (m*1e9).toFixed(2) + " nm";
  return sci(m) + " m";
}

// EM spectrum ring-band zones (log10(lambda_m) ranges)
type SpecZone = { lo:number; hi:number; label:string; ring:string; color:string; freq:string; };
const ZONES: SpecZone[] = [
  { lo:-12, hi:-9,  label:"Gamma / X-ray",   ring:"R 1-20",   color:"#6366f1", freq:"EHz-THz"  },
  { lo:-9,  hi:-6,  label:"UV / EUV",         ring:"R 21-100", color:"#8b5cf6", freq:"PHz-EHz"  },
  { lo:-6,  hi:-5.4,label:"Ultraviolet",      ring:"R 51-100", color:"#a78bfa", freq:"petaHz"   },
  { lo:-5.4,hi:-4.8,label:"Visible",          ring:"R 101-200",color:"#c9a84c", freq:"430-790THz"},
  { lo:-4.8,hi:-3,  label:"Infrared",         ring:"R 201-300",color:"#f97316", freq:"THz-IR"   },
  { lo:-3,  hi:-1,  label:"Microwave",        ring:"R 301-400",color:"#22c55e", freq:"GHz-THz"  },
  { lo:-1,  hi:3,   label:"Radio / HF",       ring:"R 401-450",color:"#4a9fd4", freq:"MHz-GHz"  },
  { lo:3,   hi:4.2, label:"VLF / LF",         ring:"R 451-500",color:"#1fd4c8", freq:"kHz-100kHz"},
  { lo:4.2, hi:6,   label:"ELF",              ring:"R 501+",   color:"#06b6d4", freq:"1-300 Hz" },
];

// Canvas: draw EM spectrum + lightning marker
function cvDrawSpectrum(ctx: CanvasRenderingContext2D, W: number, H: number, lambda: number, t: number) {
  ctx.clearRect(0,0,W,H);
  // background
  ctx.fillStyle = "#010810"; ctx.fillRect(0,0,W,H);

  const LMIN = -12, LMAX = 6, SPAN = 18;
  const toX = (log: number) => ((log - LMIN) / SPAN) * (W - 60) + 30;

  // spectrum bar (bottom 70px)
  const barY = H - 75, barH = 44;

  // gradient fill
  const grd = ctx.createLinearGradient(30, 0, W-30, 0);
  grd.addColorStop(0,    "#6366f1ee"); // gamma - indigo
  grd.addColorStop(0.28, "#8b5cf6cc"); // UV - violet
  grd.addColorStop(0.42, "#4444ddaa"); // near UV - blue
  grd.addColorStop(0.47, "#4488ff88"); // violet visible
  grd.addColorStop(0.50, "#00ccff88"); // cyan visible
  grd.addColorStop(0.54, "#00ff8888"); // green visible
  grd.addColorStop(0.58, "#ffff0088"); // yellow visible
  grd.addColorStop(0.62, "#ff880088"); // orange visible
  grd.addColorStop(0.66, "#ff220066"); // red visible
  grd.addColorStop(0.72, "#881100aa"); // near IR - dark red
  grd.addColorStop(0.83, "#22c55e88"); // microwave - green
  grd.addColorStop(0.91, "#4a9fd4aa"); // radio - blue
  grd.addColorStop(0.95, "#1fd4c8cc"); // VLF - teal
  grd.addColorStop(1.0,  "#06b6d4ff"); // ELF - cyan
  ctx.fillStyle = grd;
  ctx.fillRect(30, barY, W-60, barH);
  ctx.strokeStyle = "rgba(255,255,255,0.08)";
  ctx.lineWidth = 1;
  ctx.strokeRect(30, barY, W-60, barH);

  // zone tick marks + labels
  ctx.font = "8px monospace";
  for (let exp = -12; exp <= 6; exp += 2) {
    const x = toX(exp);
    ctx.fillStyle = "rgba(255,255,255,0.25)";
    ctx.fillRect(x, barY - 4, 1, barH + 8);
    ctx.fillStyle = TD;
    const labels: Record<number,string> = {[-12]:"pm",[-10]:"0.1nm",[-8]:"10nm",[-6]:"1um",[-4]:"0.1mm",[-2]:"1cm",[0]:"1m",[2]:"100m",[4]:"10km",[6]:"1Mm"};
    if (labels[exp]) { ctx.fillText(labels[exp], x-10, barY + barH + 14); }
  }

  // zone ring-band labels above bar
  ZONES.forEach(z => {
    const x1 = toX(z.lo), x2 = toX(z.hi), mid = (x1+x2)/2;
    if (x2 - x1 < 20) return;
    ctx.fillStyle = z.color + "22";
    ctx.fillRect(x1, barY - 22, x2-x1, 18);
    ctx.strokeStyle = z.color + "44"; ctx.lineWidth = 0.8;
    ctx.strokeRect(x1, barY - 22, x2-x1, 18);
    ctx.fillStyle = z.color + "cc";
    ctx.font = "7.5px monospace";
    const txt = z.ring;
    const tw = ctx.measureText(txt).width;
    if (tw < x2-x1-4) ctx.fillText(txt, mid - tw/2, barY - 9);
  });

  // lightning peak marker (predicted ~25km)
  const lpLog = Math.log10(lambda);
  const lx = toX(lpLog);
  const pulse = 0.7 + 0.3 * Math.sin(t * 2.5);

  // glow column
  const colGrd = ctx.createLinearGradient(0, 0, 0, H);
  colGrd.addColorStop(0, `rgba(31,212,200,0)`);
  colGrd.addColorStop(0.3, `rgba(31,212,200,${0.06 * pulse})`);
  colGrd.addColorStop(0.7, `rgba(31,212,200,${0.12 * pulse})`);
  colGrd.addColorStop(1, `rgba(31,212,200,${0.2 * pulse})`);
  ctx.fillStyle = colGrd;
  ctx.fillRect(lx - 18, 0, 36, H);

  // marker line
  ctx.beginPath(); ctx.moveTo(lx, 10); ctx.lineTo(lx, barY + barH + 4);
  ctx.strokeStyle = `rgba(31,212,200,${0.6 + 0.4 * pulse})`; ctx.lineWidth = 1.5;
  ctx.setLineDash([4,3]); ctx.stroke(); ctx.setLineDash([]);

  // lightning bolt SVG-style path above spectrum
  const boltTopY = 14, boltBotY = barY - 28;
  const boltH = boltBotY - boltTopY;
  const jag = [0, -12, 8, -8, 12, -4, 6, -10, 10, -6, 4, -3, 7];
  ctx.beginPath();
  ctx.moveTo(lx, boltTopY);
  let cy = boltTopY;
  for (let i = 0; i < jag.length; i++) {
    cy += boltH / jag.length;
    const jx = lx + jag[i] * pulse;
    ctx.lineTo(jx, cy);
  }
  ctx.strokeStyle = `rgba(31,212,200,${0.8 * pulse})`; ctx.lineWidth = 2.5; ctx.stroke();
  // bolt glow
  ctx.shadowBlur = 14 * pulse; ctx.shadowColor = TEAL;
  ctx.strokeStyle = `rgba(255,255,255,${0.4 * pulse})`; ctx.lineWidth = 1; ctx.stroke();
  ctx.shadowBlur = 0;

  // marker label
  ctx.font = "bold 10px monospace";
  const lbl = "PREDICTED ~" + fmtM(lambda);
  const lw = ctx.measureText(lbl).width;
  const lbx = Math.min(lx + 6, W - lw - 6);
  ctx.fillStyle = `rgba(31,212,200,${0.9 * pulse})`;
  ctx.fillText(lbl, lbx, barY - 36);

  // observed range band
  const obs1 = toX(Math.log10(3e4)), obs2 = toX(Math.log10(6e4));
  ctx.fillStyle = "rgba(200,168,76,0.08)";
  ctx.fillRect(obs1, barY - 20, obs2-obs1, barH + 20);
  ctx.strokeStyle = GOLD + "44"; ctx.lineWidth = 1; ctx.setLineDash([3,3]);
  ctx.strokeRect(obs1, barY - 20, obs2-obs1, barH + 20);
  ctx.setLineDash([]);
  ctx.font = "8px monospace"; ctx.fillStyle = GOLD + "88";
  ctx.fillText("OBSERVED 30-60km", obs1 + 2, barY - 24);

  // bottom axis label
  ctx.font = "8px monospace"; ctx.fillStyle = TD;
  ctx.fillText("WAVELENGTH (log scale)  [shorter left --> longer right]", 30, H - 4);

  // title label top-left
  ctx.font = "bold 9px monospace"; ctx.fillStyle = TEAL + "88";
  ctx.fillText("ELECTROMAGNETIC SPECTRUM + AETHER RING BANDS + LIGHTNING UNRUH PEAK", 30, 10);
}

function SpecCanvas({ lambda }: { lambda: number }) {
  const ref = useRef<HTMLCanvasElement>(null);
  const stRef = useRef({ t: 0, raf: 0 });
  const lambdaRef = useRef(lambda);
  lambdaRef.current = lambda;

  const frame = useCallback(() => {
    const cv = ref.current; if (!cv) return;
    const ctx = cv.getContext("2d"); if (!ctx) return;
    const st = stRef.current;
    const W = cv.width / (window.devicePixelRatio || 1);
    const H = cv.height / (window.devicePixelRatio || 1);
    cvDrawSpectrum(ctx, W, H, lambdaRef.current, st.t);
    st.t += 0.016;
    st.raf = requestAnimationFrame(frame);
  }, []);

  useEffect(() => {
    const cv = ref.current; if (!cv) return;
    const resize = () => {
      const dpr = window.devicePixelRatio || 1;
      const w = cv.parentElement?.clientWidth || 700;
      cv.width = w * dpr; cv.height = 260 * dpr;
      const ctx = cv.getContext("2d"); if (ctx) ctx.scale(dpr, dpr);
    };
    resize();
    stRef.current.raf = requestAnimationFrame(frame);
    window.addEventListener("resize", resize);
    return () => { cancelAnimationFrame(stRef.current.raf); window.removeEventListener("resize", resize); };
  }, [frame]);

  return <canvas ref={ref} style={{ width:"100%", height:260, display:"block", borderRadius:4, border:`1px solid ${BGLOW}`, cursor:"default" }} />;
}

function MathCard({ step, title, formula, desc, result, color }: { step:string; title:string; formula:string; desc:string; result:string; color:string }) {
  return (
    <div style={{ background:PANEL, border:`1px solid ${color}44`, borderRadius:6, padding:"20px 22px", position:"relative", overflow:"hidden" }}>
      <div style={{ position:"absolute", top:0, left:0, width:3, height:"100%", background:color, opacity:0.8 }} />
      <div style={{ fontFamily:"monospace", fontSize:9, letterSpacing:3, color, textTransform:"uppercase", marginBottom:6 }}>Step {step}</div>
      <div style={{ fontFamily:"'Orbitron',sans-serif", fontSize:14, fontWeight:700, color:TP, marginBottom:10 }}>{title}</div>
      <div style={{ background:RING1, border:`1px solid ${color}33`, borderRadius:3, padding:"12px 16px", fontFamily:"monospace", fontSize:14, color, letterSpacing:1, textAlign:"center", marginBottom:12 }}>{formula}</div>
      <div style={{ fontSize:13, lineHeight:1.7, color:TS, marginBottom:10 }}>{desc}</div>
      <div style={{ fontFamily:"monospace", fontSize:12, color:TP, padding:"8px 14px", background:`${color}11`, borderRadius:3, border:`1px solid ${color}22` }}>= {result}</div>
    </div>
  );
}

export default function LightningSpectrumPage() {
  const [voltage, setVoltage] = useState(100000);
  const [distance, setDistance] = useState(600);

  const a      = calcA(voltage, distance);
  const T      = calcT(a);
  const lambda = calcLambda(T);

  const sliderStyle: React.CSSProperties = { width:"100%", accentColor:TEAL, cursor:"pointer" };
  const labelStyle: React.CSSProperties  = { fontFamily:"monospace", fontSize:10, color:TD, letterSpacing:2, display:"block", marginBottom:4 };

  return (
    <div style={{ background:VOID, minHeight:"100vh", color:TP, fontFamily:"'Rajdhani',sans-serif", overflowX:"hidden" }}>
      <style>{`@keyframes boltFlash{0%,95%,100%{opacity:0}96%,99%{opacity:1}}`}</style>

      {/* decorative corner lightning */}
      <div style={{ position:"fixed", top:0, right:0, width:320, height:320, pointerEvents:"none", zIndex:0, opacity:0.04, background:"radial-gradient(circle at 100% 0%, #1fd4c8 0%, transparent 70%)" }} />
      <div style={{ position:"fixed", bottom:0, left:0, width:280, height:280, pointerEvents:"none", zIndex:0, opacity:0.03, background:"radial-gradient(circle at 0% 100%, #8b5cf6 0%, transparent 70%)" }} />

      {/* HEADER */}
      <header style={{ position:"relative", zIndex:10, borderBottom:`1px solid ${BGLOW}`, background:`linear-gradient(180deg,#030e1e 0%,transparent 100%)`, padding:"32px 40px 26px" }}>
        <div style={{ maxWidth:1100, margin:"0 auto" }}>
          <div style={{ fontFamily:"monospace", fontSize:11, color:TEAL, letterSpacing:4, textTransform:"uppercase", marginBottom:8, opacity:0.8 }}>Unruh Radiation -- McCulloch Derivation -- AETHER Spectrum Integration</div>
          <div style={{ fontFamily:"'Orbitron',sans-serif", fontSize:"clamp(20px,4vw,36px)", fontWeight:700, letterSpacing:2, background:`linear-gradient(135deg,#e8f0fa 0%,${TEAL} 40%,${VIOLET} 100%)`, WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent", backgroundClip:"text", lineHeight:1.1 }}>PEAK LIGHTNING EQUATION</div>
          <div style={{ fontFamily:"'Crimson Pro',serif", fontSize:16, fontStyle:"italic", color:TS, marginTop:6 }}>Lightning flashes as Unruh radiation -- accelerating electrons experiencing the quantum vacuum as a thermal bath</div>
          <div style={{ marginTop:14, display:"flex", gap:10, flexWrap:"wrap" }}>
            {["Unruh Radiation","Wien Displacement","Electron Acceleration","VLF Peak ~25km","AETHER Ring 451-500"].map(tag=>(
              <span key={tag} style={{ fontFamily:"monospace", fontSize:10, padding:"3px 10px", borderRadius:2, background:RING2, color:TEAL, border:`1px solid ${TEAL}33`, letterSpacing:1 }}>{tag}</span>
            ))}
          </div>
        </div>
      </header>

      <div style={{ maxWidth:1100, margin:"0 auto", padding:"40px 40px 80px", position:"relative", zIndex:5 }}>

        {/* FRAMING */}
        <blockquote style={{ borderLeft:`3px solid ${TEAL}`, padding:"12px 22px", margin:"0 0 36px", background:`rgba(31,212,200,0.05)`, borderRadius:"0 4px 4px 0", fontFamily:"'Crimson Pro',serif", fontSize:17, fontStyle:"italic", color:TP, lineHeight:1.7 }}>
          "If electrons in a lightning bolt accelerate at ~3 x 10^13 m/s^2, they experience the quantum vacuum as a thermal bath with temperature T ~10^-7 K -- whose peak wavelength via Wien's law lands at ~25 km, matching observed lightning VLF emission at 30-60 km."
          <footer style={{ fontFamily:"monospace", fontSize:10, color:TD, marginTop:8, letterSpacing:2, fontStyle:"normal" }}>-- McCulloch (Quantised Inertia / MiHsC framework)</footer>
        </blockquote>

        {/* THREE-STEP DERIVATION */}
        <div style={{ fontFamily:"monospace", fontSize:10, letterSpacing:4, color:TEAL, textTransform:"uppercase", marginBottom:18, opacity:0.8 }}>Three-Step Mathematical Derivation</div>
        <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(300px,1fr))", gap:20, marginBottom:40 }}>
          <MathCard
            step="01" color={BLUE}
            title="Electron Acceleration"
            formula="a = (Qe x V) / (Me x d)"
            desc="The electric field across the lightning channel accelerates electrons. Qe = electron charge (1.602e-19 C), V = voltage difference, Me = electron mass (9.109e-31 kg), d = vertical channel length."
            result={sci(a) + " m/s^2"}
          />
          <MathCard
            step="02" color={VIOLET}
            title="Unruh Temperature"
            formula="T = (hbar x a) / (2 x pi x c x kB)"
            desc="An accelerating observer experiences the quantum vacuum as a thermal bath at temperature T. hbar = reduced Planck constant, c = speed of light, kB = Boltzmann constant. This is the Fulling-Davies-Unruh effect."
            result={sci(T) + " K"}
          />
          <MathCard
            step="03" color={TEAL}
            title="Peak Wavelength (Wien)"
            formula="lambda = b / T     (b = 2.898e-3 m·K)"
            desc="Wien's displacement law predicts the wavelength at which the thermal spectrum peaks. At T ~10^-7 K, the peak falls in the VLF radio band -- corresponding to wavelengths of tens of kilometers."
            result={fmtM(lambda) + " (predicted)"}
          />
        </div>

        {/* INTERACTIVE CALCULATOR */}
        <div style={{ background:PANEL, border:`1px solid ${BGLOW}`, borderRadius:6, padding:"24px 28px", marginBottom:40 }}>
          <div style={{ fontFamily:"monospace", fontSize:10, letterSpacing:4, color:TEAL, textTransform:"uppercase", marginBottom:18 }}>Interactive Calculator -- Adjust Parameters</div>
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:28 }}>
            <div>
              <label style={labelStyle}>VOLTAGE DIFFERENCE  V = {voltage.toLocaleString()} V</label>
              <input type="range" min={10000} max={500000} step={5000} value={voltage} onChange={e=>setVoltage(+e.target.value)} style={sliderStyle} />
              <div style={{ display:"flex", justifyContent:"space-between", fontFamily:"monospace", fontSize:9, color:TD, marginTop:4 }}>
                <span>10 kV</span><span>500 kV</span>
              </div>
            </div>
            <div>
              <label style={labelStyle}>VERTICAL DISTANCE  d = {distance} m</label>
              <input type="range" min={100} max={5000} step={50} value={distance} onChange={e=>setDistance(+e.target.value)} style={sliderStyle} />
              <div style={{ display:"flex", justifyContent:"space-between", fontFamily:"monospace", fontSize:9, color:TD, marginTop:4 }}>
                <span>100 m</span><span>5 km</span>
              </div>
            </div>
          </div>
          <div style={{ marginTop:22, display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(180px,1fr))", gap:14 }}>
            {[
              { label:"Acceleration",  val:sci(a,2) + " m/s^2", color:BLUE   },
              { label:"Unruh Temp",    val:sci(T,3) + " K",     color:VIOLET },
              { label:"Peak Lambda",   val:fmtM(lambda),         color:TEAL   },
              { label:"vs Observed",   val:"30 - 60 km",         color:GOLD   },
            ].map(r=>(
              <div key={r.label} style={{ padding:"12px 16px", background:RING1, borderRadius:4, border:`1px solid ${r.color}22` }}>
                <div style={{ fontFamily:"monospace", fontSize:9, color:r.color, letterSpacing:2, marginBottom:4 }}>{r.label.toUpperCase()}</div>
                <div style={{ fontFamily:"monospace", fontSize:13, color:TP, fontWeight:700, wordBreak:"break-all" }}>{r.val}</div>
              </div>
            ))}
          </div>
        </div>

        {/* SPECTRUM CANVAS */}
        <div style={{ fontFamily:"monospace", fontSize:10, letterSpacing:4, color:TEAL, textTransform:"uppercase", marginBottom:12, opacity:0.8 }}>Lightning Spectrum -- EM + AETHER Ring Band Overlay</div>
        <SpecCanvas lambda={lambda} />
        <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(120px,1fr))", gap:8, marginTop:12 }}>
          {ZONES.map(z=>(
            <div key={z.label} style={{ display:"flex", alignItems:"center", gap:6, padding:"5px 8px", borderRadius:3, background:`${z.color}0d`, border:`1px solid ${z.color}22` }}>
              <span style={{ width:8, height:8, borderRadius:"50%", background:z.color, display:"inline-block", flexShrink:0 }} />
              <span style={{ fontFamily:"monospace", fontSize:8, color:z.color, letterSpacing:1, lineHeight:1.4 }}>{z.ring}<br />{z.label}</span>
            </div>
          ))}
        </div>

        {/* AETHER INTEGRATION */}
        <div style={{ marginTop:44 }}>
          <div style={{ fontFamily:"monospace", fontSize:10, letterSpacing:4, color:TEAL, textTransform:"uppercase", marginBottom:18, opacity:0.8 }}>AETHER Ring-Layer Integration</div>
          <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(280px,1fr))", gap:20 }}>
            {[
              { color:TEAL,   title:"Lightning Lands in Ring 451-500",     body:"The VLF peak at ~25 km corresponds to a frequency of ~12 kHz. In the Stacked Rings model, the 401-500 band is the Information / Consciousness Field. Lightning's Unruh peak falls precisely in this consciousness-adjacent ring zone -- not random." },
              { color:VIOLET, title:"Acceleration as Ring-Crossing Rate",  body:"In Pixelated Gravity, acceleration = traversing rho_info gradient steepness. An electron at 3 x 10^13 m/s^2 is crossing ring boundaries at an extreme rate. The Unruh temperature is the thermal cost of that traversal -- the energy emitted as the vortex jumps layers." },
              { color:GOLD,   title:"The 30-60 km Discrepancy",            body:"McCulloch predicts 25 km; observed lightning peaks at 30-60 km. In ring-layer terms: the observer (on the ground) is not co-accelerating. The rho_info gradient between the lightning channel's reference frame and the ground-level observer adds a Doppler-like wavelength stretch across ring boundaries." },
              { color:ORANGE, title:"Unruh as Phase Transition Signature", body:"Unruh radiation is what a vortex emits when crossing a ring barrier. The lightning flash is a momentary high-energy vortex injection across the 401-500 consciousness ring band -- which is why it radiates at the boundary frequency of that zone. The flash IS the ring crossing event." },
            ].map(card=>(
              <div key={card.title} style={{ background:PANEL, border:`1px solid ${card.color}33`, borderRadius:6, padding:"18px 20px", position:"relative", overflow:"hidden" }}>
                <div style={{ position:"absolute", top:0, left:0, width:3, height:"100%", background:card.color, opacity:0.7 }} />
                <div style={{ fontFamily:"'Orbitron',sans-serif", fontSize:13, fontWeight:600, color:card.color, marginBottom:10, lineHeight:1.3 }}>{card.title}</div>
                <div style={{ fontSize:13, lineHeight:1.72, color:TS }}>{card.body}</div>
              </div>
            ))}
          </div>
        </div>

        {/* SUMMARY TABLE */}
        <div style={{ marginTop:40, background:PANEL, border:`1px solid ${BGLOW}`, borderRadius:6, overflow:"hidden" }}>
          <div style={{ fontFamily:"monospace", fontSize:10, letterSpacing:4, color:TEAL, textTransform:"uppercase", padding:"16px 22px 10px", borderBottom:`1px solid ${BORDER}` }}>Complete Constants Reference</div>
          <table style={{ width:"100%", borderCollapse:"collapse", fontSize:13 }}>
            <tbody>
              {[
                ["Electron charge (Qe)","1.602 x 10^-19 C","elementary charge unit"],
                ["Electron mass (Me)","9.109 x 10^-31 kg","rest mass of electron"],
                ["Reduced Planck (hbar)","1.055 x 10^-34 J·s","quantum of action / 2pi"],
                ["Speed of light (c)","2.998 x 10^8 m/s","vacuum speed"],
                ["Boltzmann (kB)","1.381 x 10^-23 J/K","entropy-energy bridge"],
                ["Wien constant (b)","2.898 x 10^-3 m·K","peak wavelength x temperature"],
                ["Default voltage (V)","100,000 V","typical lightning channel potential difference"],
                ["Default distance (d)","600 m","vertical lightning channel length"],
                ["Predicted lambda","~25 km","Unruh peak from default parameters"],
                ["Observed peak","30 - 60 km","measured VLF emission in lightning events"],
              ].map(([k,v,note])=>(
                <tr key={k}>
                  <td style={{ fontFamily:"monospace", color:TEAL, fontSize:12, padding:"8px 22px", borderBottom:`1px solid ${BORDER}`, whiteSpace:"nowrap" }}>{k}</td>
                  <td style={{ fontFamily:"monospace", color:TP, fontSize:12, padding:"8px 14px", borderBottom:`1px solid ${BORDER}` }}>{v}</td>
                  <td style={{ color:TS, fontSize:12, padding:"8px 14px 8px 0", borderBottom:`1px solid ${BORDER}` }}>{note}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

      </div>
    </div>
  );
}
