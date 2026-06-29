import { useEffect, useRef, useState } from "react";
import katex from "katex";
import "katex/dist/katex.min.css";
import imgVortex     from "@assets/Gemini_Generated_Image_ot7ybpot7ybpot7y_1782757858911.png";
import imgFramework  from "@assets/Gemini_Generated_Image_fwivy7fwivy7fwiv_1782757938529.png";
import imgNavier     from "@assets/image_1782758044567.png";
import imgSpectral   from "@assets/Gemini_Generated_Image_w1iv0w1iv0w1iv0w_1782758115977.png";

/* ==========================================================================
   DMF SPACE-FILLED TRANSPORT CAVITY
   A coherence-modulated Rankine-vortex conduit that carries objects up, down,
   and through space. Built directly from the four attached source diagrams:
   the DMF-extended Navier-Stokes term F_DMF, the coherence-extended vortex
   lifetime, the coupled object-transport equation, and the coherence sheath.
   Two live simulations + the full math framework + annotated source plates.
   ========================================================================== */

const V = {
  bg:"#05060C", core:"#4DD8FF", gold:"#E0A03A", amb:"#FF9933", vio:"#9B6CFF",
  green:"#37D67A", rose:"#FF6699", cyan:"#2FE6D6", dim:"#3A5060", ink:"#BBD0EC",
};
const MONO = "'Space Mono',monospace";
const DISP = "'Orbitron',sans-serif";

function kx(tex: string, dm = false) {
  try { return katex.renderToString(tex, { throwOnError:false, output:"html", displayMode:dm }); }
  catch { return tex; }
}

function fitCanvas(canvas: HTMLCanvasElement, h: number) {
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  const w = canvas.clientWidth || 640;
  canvas.width = Math.round(w * dpr);
  canvas.height = Math.round(h * dpr);
  const ctx = canvas.getContext("2d");
  if (ctx) ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  return { w, h };
}

const prefersReduced = () =>
  typeof window !== "undefined" &&
  window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

/* ── shared UI bits ─────────────────────────────── */
function Slider({ label, value, min, max, step, col, onChange, fmt }: {
  label:string; value:number; min:number; max:number; step:number; col:string;
  onChange:(v:number)=>void; fmt:(v:number)=>string;
}) {
  return (
    <label style={{ display:"block", marginBottom:9 }}>
      <div style={{ display:"flex", justifyContent:"space-between", fontFamily:MONO,
        fontSize:8, color:V.dim, letterSpacing:"0.1em", marginBottom:3 }}>
        <span>{label}</span><span style={{ color:col }}>{fmt(value)}</span>
      </div>
      <input type="range" min={min} max={max} step={step} value={value}
        onChange={(e)=>onChange(parseFloat(e.target.value))}
        style={{ width:"100%", accentColor:col, height:3 }} />
    </label>
  );
}

function Readout({ label, col, vref }: { label:string; col:string; vref:React.RefObject<HTMLSpanElement | null> }) {
  return (
    <div style={{ padding:"8px 10px", borderRadius:5, background:`${col}0C`, border:`1px solid ${col}30` }}>
      <div style={{ fontFamily:MONO, fontSize:7, color:col, letterSpacing:"0.12em", marginBottom:3 }}>{label}</div>
      <span ref={vref} style={{ fontFamily:MONO, fontSize:"0.92rem", color:col }}>--</span>
    </div>
  );
}

function SectionHead({ n, title, col }: { n:string; title:string; col:string }) {
  return (
    <div style={{ display:"flex", alignItems:"baseline", gap:12, marginBottom:14 }}>
      <div style={{ fontFamily:DISP, fontSize:"1.05rem", color:col, letterSpacing:"0.16em" }}>{n}</div>
      <div style={{ flex:1, height:1, background:`linear-gradient(90deg,${col}55,transparent)` }} />
      <div style={{ fontFamily:MONO, fontSize:9, color:col, letterSpacing:"0.14em" }}>{title}</div>
    </div>
  );
}

function Plate({ src, alt, col, label, caption }:
  { src:string; alt:string; col:string; label:string; caption:string }) {
  return (
    <figure style={{ margin:0, borderRadius:7, overflow:"hidden",
      border:`1px solid ${col}55`, background:"#05070b",
      boxShadow:`0 0 30px ${col}1e, inset 0 0 0 1px ${col}11` }}>
      <img src={src} alt={alt} loading="lazy" style={{ width:"100%", display:"block" }} />
      <figcaption style={{ padding:"10px 14px", borderTop:`1px solid ${col}26`,
        background:`linear-gradient(180deg, ${col}0a, transparent)` }}>
        <div style={{ fontFamily:MONO, fontSize:8, color:col, letterSpacing:"0.14em", marginBottom:5 }}>{label}</div>
        <div style={{ fontSize:10.5, color:"rgba(200,210,228,0.68)", lineHeight:1.6 }}>{caption}</div>
      </figcaption>
    </figure>
  );
}

function Anno({ col, k, v }: { col:string; k:string; v:string }) {
  return (
    <div style={{ background:`${col}0d`, border:`1px solid ${col}33`, borderRadius:4, padding:"8px 11px" }}>
      <div style={{ fontFamily:MONO, fontSize:8.5, color:col, fontWeight:700, marginBottom:3 }}>{k}</div>
      <div style={{ fontSize:10, color:"rgba(190,205,225,0.66)", lineHeight:1.55 }}>{v}</div>
    </div>
  );
}

const annoGrid: React.CSSProperties = {
  display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(178px,1fr))", gap:8, marginTop:12,
};
const card = (col:string): React.CSSProperties => ({
  background:"rgba(0,0,0,0.42)", border:`1px solid ${col}22`, borderRadius:6,
  padding:"16px 18px", marginBottom:16,
});
const panel = (col:string): React.CSSProperties => ({
  background:"rgba(255,255,255,0.015)", border:`1px solid ${col}26`, borderRadius:8, padding:"14px 16px",
});

/* ════════════════════════════════════════════════════════════════════════
   SIM 1 · Coherence-Extended Rankine Vortex (top-down cross-section)
   ════════════════════════════════════════════════════════════════════════ */
type Particle = { r:number; ang:number; sz:number };

function VortexCanvas() {
  const cvs = useRef<HTMLCanvasElement | null>(null);
  const tau0Ref = useRef<HTMLSpanElement>(null);
  const tauVRef = useRef<HTMLSpanElement>(null);
  const kcutRef = useRef<HTMLSpanElement>(null);
  const gainRef = useRef<HTMLSpanElement>(null);

  const C   = useRef(0.85);  // coherence 0..1
  const Rc  = useRef(0.34);  // core radius (fraction of canvas)
  const Gam = useRef(1.2);   // circulation
  const Nu  = useRef(0.45);  // kinematic viscosity

  const [c, setC]   = useState(0.85);
  const [rc, setRc] = useState(0.34);
  const [g, setG]   = useState(1.2);
  const [nu, setNu] = useState(0.45);

  const parts = useRef<Particle[]>([]);

  useEffect(() => {
    const canvas = cvs.current; if (!canvas) return;
    if (parts.current.length === 0) {
      for (let i = 0; i < 240; i++) {
        parts.current.push({ r: Math.random(), ang: Math.random()*Math.PI*2, sz: 0.6 + Math.random()*1.6 });
      }
    }
    const reduce = prefersReduced();
    let raf = 0;

    const draw = () => {
      const { w, h } = fitCanvas(canvas, 360);
      const ctx = canvas.getContext("2d"); if (!ctx) return;
      const cx = w/2, cy = h/2;
      const R = Math.min(w, h)*0.46;
      const Cv = C.current, RcF = Rc.current, Gv = Gam.current, nuv = Nu.current;
      const RcPx = RcF * R;

      ctx.clearRect(0,0,w,h);
      // background radial wash
      const bg = ctx.createRadialGradient(cx,cy,0,cx,cy,R);
      bg.addColorStop(0, `rgba(77,216,255,${0.10+0.14*Cv})`);
      bg.addColorStop(0.5, "rgba(20,30,60,0.20)");
      bg.addColorStop(1, "rgba(5,6,12,0)");
      ctx.fillStyle = bg; ctx.beginPath(); ctx.arc(cx,cy,R,0,Math.PI*2); ctx.fill();

      // coherence boundary layer (sheath) at R_c
      ctx.strokeStyle = `rgba(224,160,58,${0.30+0.5*Cv})`;
      ctx.lineWidth = 1.5 + 2.5*Cv;
      ctx.shadowColor = V.gold; ctx.shadowBlur = 14*Cv;
      ctx.beginPath(); ctx.arc(cx,cy,RcPx,0,Math.PI*2); ctx.stroke();
      ctx.shadowBlur = 0;

      // solid-body core fill
      const coreG = ctx.createRadialGradient(cx,cy,0,cx,cy,RcPx);
      coreG.addColorStop(0, `rgba(47,230,214,${0.22+0.3*Cv})`);
      coreG.addColorStop(1, "rgba(47,230,214,0.02)");
      ctx.fillStyle = coreG; ctx.beginPath(); ctx.arc(cx,cy,RcPx,0,Math.PI*2); ctx.fill();

      // angular velocity (Rankine): inside solid-body const, outside ~1/r^2
      const omegaCore = Gv / (2*Math.PI*Math.max(RcF,0.05)*Math.max(RcF,0.05));
      const dt = reduce ? 0 : 0.016;
      const jitter = (1 - Cv) * 0.9; // low coherence -> turbulent scatter

      for (const p of parts.current) {
        const rNorm = p.r;
        let omega: number;
        if (rNorm < RcF) omega = omegaCore;
        else omega = Gv / (2*Math.PI*Math.max(rNorm,0.04)*Math.max(rNorm,0.04));
        p.ang += omega * dt;
        // turbulent radial diffusion when coherence low; inward pull when high
        if (!reduce) {
          p.r += (Math.random()-0.5) * jitter * 0.02;
          p.r += (RcF - p.r) * 0.004 * Cv; // coherence gathers flow toward sheath
          if (p.r < 0.02) p.r = 0.02 + Math.random()*0.05;
          if (p.r > 1)    p.r = 1;
        }
        const px = cx + Math.cos(p.ang) * p.r * R;
        const py = cy + Math.sin(p.ang) * p.r * R;
        if (!Number.isFinite(px) || !Number.isFinite(py)) continue;
        const inside = rNorm < RcF;
        const col = inside ? V.cyan : V.core;
        const a = inside ? (0.5+0.45*Cv) : (0.25+0.45*Cv);
        ctx.fillStyle = `rgba(${inside?"47,230,214":"77,216,255"},${a})`;
        ctx.beginPath(); ctx.arc(px,py, p.sz*(0.7+0.6*Cv), 0, Math.PI*2); ctx.fill();
      }

      // vernal swirl streamlines
      ctx.strokeStyle = `rgba(155,108,255,${0.10+0.18*Cv})`;
      ctx.lineWidth = 1;
      for (let s = 0; s < 5; s++) {
        ctx.beginPath();
        for (let t = 0; t <= 1; t += 0.02) {
          const rr = 0.06 + t*0.94;
          const aa = s*(Math.PI*2/5) + t*6*Cv;
          const px = cx + Math.cos(aa)*rr*R;
          const py = cy + Math.sin(aa)*rr*R;
          if (t===0) ctx.moveTo(px,py); else ctx.lineTo(px,py);
        }
        ctx.stroke();
      }

      // vθ(r) profile inset (bottom-left)
      const ix = 14, iy = h-14, iw = 120, ih = 64;
      ctx.strokeStyle = "rgba(120,140,170,0.4)"; ctx.lineWidth = 1;
      ctx.beginPath(); ctx.moveTo(ix, iy); ctx.lineTo(ix, iy-ih); ctx.moveTo(ix, iy); ctx.lineTo(ix+iw, iy); ctx.stroke();
      ctx.strokeStyle = V.gold; ctx.lineWidth = 1.6; ctx.beginPath();
      for (let i = 0; i <= iw; i++) {
        const rN = i/iw;
        let vth: number;
        if (rN < RcF) vth = Gv * rN / (2*Math.PI*Math.max(RcF,0.05)*Math.max(RcF,0.05));
        else vth = Gv / (2*Math.PI*Math.max(rN,0.04));
        const vN = Math.min(vth/ (Gv/(2*Math.PI*Math.max(RcF,0.05))), 1);
        const px = ix + i, py = iy - vN*ih;
        if (i===0) ctx.moveTo(px,py); else ctx.lineTo(px,py);
      }
      ctx.stroke();
      ctx.fillStyle = "rgba(180,200,225,0.6)"; ctx.font = `8px ${MONO}`;
      ctx.fillText("v\u03B8(r)  peak @ R_c", ix, iy-ih-4);

      // readouts: lifetime model
      const tau0 = (RcF*RcF) / Math.max(nuv, 0.02);
      const kcut = Math.sqrt(Math.max(Cv,0.001)) * Math.sqrt(1 / Math.max(nuv*nuv, 0.0004)) * 0.25;
      const tauV = tau0 * (1 + (Cv * 1.0 * 1.0) / (Math.PI * 1.0 * Math.max(nuv*nuv,0.0004) * Math.max(kcut,0.05)));
      if (tau0Ref.current) tau0Ref.current.textContent = tau0.toFixed(2) + " s";
      if (tauVRef.current) tauVRef.current.textContent = tauV.toFixed(2) + " s";
      if (kcutRef.current) kcutRef.current.textContent = kcut.toFixed(2);
      if (gainRef.current) gainRef.current.textContent = (tauV/Math.max(tau0,0.01)).toFixed(2) + "\u00D7";

      if (!reduce) raf = requestAnimationFrame(draw);
    };
    draw();
    return () => cancelAnimationFrame(raf);
  }, []);

  return (
    <div style={{ display:"grid", gridTemplateColumns:"1fr 220px", gap:14 }}>
      <div style={{ borderRadius:8, overflow:"hidden", border:`1px solid ${V.core}26`, background:"#04050a" }}>
        <canvas ref={cvs} style={{ width:"100%", height:360, display:"block" }} />
      </div>
      <div style={panel(V.core)}>
        <Slider label="COHERENCE C" value={c} min={0} max={1} step={0.01} col={V.core}
          onChange={(v)=>{ setC(v); C.current=v; }} fmt={(v)=>v.toFixed(2)} />
        <Slider label="CORE RADIUS R_c" value={rc} min={0.12} max={0.6} step={0.01} col={V.cyan}
          onChange={(v)=>{ setRc(v); Rc.current=v; }} fmt={(v)=>v.toFixed(2)} />
        <Slider label="CIRCULATION \u0393" value={g} min={0.3} max={3} step={0.05} col={V.gold}
          onChange={(v)=>{ setG(v); Gam.current=v; }} fmt={(v)=>v.toFixed(2)} />
        <Slider label="VISCOSITY \u03BD" value={nu} min={0.05} max={1} step={0.01} col={V.vio}
          onChange={(v)=>{ setNu(v); Nu.current=v; }} fmt={(v)=>v.toFixed(2)} />
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:7, marginTop:10 }}>
          <Readout label="\u03C4\u2080 BASE" col={V.dim} vref={tau0Ref} />
          <Readout label="\u03C4 VORTEX" col={V.core} vref={tauVRef} />
          <Readout label="k_cutoff" col={V.gold} vref={kcutRef} />
          <Readout label="LIFETIME GAIN" col={V.green} vref={gainRef} />
        </div>
      </div>
    </div>
  );
}

/* ════════════════════════════════════════════════════════════════════════
   SIM 2 · Axial Object Transport (side view, up / down through the cavity)
   ════════════════════════════════════════════════════════════════════════ */
function TransportCanvas() {
  const cvs = useRef<HTMLCanvasElement | null>(null);
  const hRef = useRef<HTMLSpanElement>(null);
  const vRef = useRef<HTMLSpanElement>(null);
  const aRef = useRef<HTMLSpanElement>(null);
  const latRef = useRef<HTMLSpanElement>(null);
  const phRef = useRef<HTMLSpanElement>(null);

  const Cf  = useRef(0.85);  // coherence
  const Kf  = useRef(0.6);   // guidance gain
  const Gf  = useRef(0.35);  // gravity drag
  const A0f = useRef(1.0);   // accel pulse amplitude

  const [c, setC]   = useState(0.85);
  const [k, setK]   = useState(0.6);
  const [gr, setGr] = useState(0.35);
  const [a0, setA0] = useState(1.0);

  // persistent sim state (p = progress along leg, t = leg time, vz = axial velocity)
  const st = useRef({ p:0, t:0, vz:0, dir:1, x:0, trail:[] as {x:number;y:number}[] });

  useEffect(() => {
    const canvas = cvs.current; if (!canvas) return;
    const reduce = prefersReduced();
    let raf = 0;

    const draw = () => {
      const { w, h } = fitCanvas(canvas, 380);
      const ctx = canvas.getContext("2d"); if (!ctx) return;
      const cx = w/2;
      const top = 34, bot = h-34;
      const Cv = Cf.current, Kv = Kf.current, Gv = Gf.current, A0 = A0f.current;
      const S = st.current;

      ctx.clearRect(0,0,w,h);

      // cavity lens
      const half = Math.min(w*0.32, 150);
      const lg = ctx.createLinearGradient(cx-half,0,cx+half,0);
      lg.addColorStop(0, "rgba(77,216,255,0.02)");
      lg.addColorStop(0.5, `rgba(77,216,255,${0.05+0.10*Cv})`);
      lg.addColorStop(1, "rgba(77,216,255,0.02)");
      ctx.fillStyle = lg;
      ctx.beginPath();
      ctx.ellipse(cx,(top+bot)/2, half, (bot-top)/2, 0, 0, Math.PI*2);
      ctx.fill();
      ctx.strokeStyle = `rgba(77,216,255,${0.25+0.3*Cv})`; ctx.lineWidth=1.4; ctx.stroke();

      // central solid-body transport core column + coherence sheath
      const coreW = 26 + 16*Cv;
      const sg = ctx.createLinearGradient(cx-coreW,0,cx+coreW,0);
      sg.addColorStop(0, "rgba(224,160,58,0)");
      sg.addColorStop(0.5, `rgba(47,230,214,${0.12+0.22*Cv})`);
      sg.addColorStop(1, "rgba(224,160,58,0)");
      ctx.fillStyle = sg;
      ctx.fillRect(cx-coreW, top, coreW*2, bot-top);
      // sheath edges
      ctx.strokeStyle = `rgba(224,160,58,${0.25+0.45*Cv})`; ctx.lineWidth = 1+1.5*Cv;
      ctx.shadowColor=V.gold; ctx.shadowBlur=10*Cv;
      ctx.beginPath(); ctx.moveTo(cx-coreW,top); ctx.lineTo(cx-coreW,bot);
      ctx.moveTo(cx+coreW,top); ctx.lineTo(cx+coreW,bot); ctx.stroke();
      ctx.shadowBlur=0;

      // ribs
      ctx.strokeStyle = "rgba(120,150,185,0.16)"; ctx.lineWidth=1;
      for (let y=top+12; y<bot; y+=22){ ctx.beginPath(); ctx.moveTo(cx-coreW,y); ctx.lineTo(cx+coreW,y); ctx.stroke(); }

      // ports
      for (const py of [top, bot]) {
        ctx.fillStyle = `rgba(155,108,255,0.5)`;
        ctx.beginPath(); ctx.ellipse(cx,py,coreW,7,0,0,Math.PI*2); ctx.fill();
      }

      // ── physics: integrate the TRUE Gaussian axial pulse a_z(t) ──
      // a_z(t) = a0 exp(-(t-t0)^2 / 2sigma^2). Launch pulse (+) then brake pulse (-),
      // plus the coherence-gradient guidance term K*grad(C). v_z = integral a_z dt.
      const dt = reduce ? 0 : 0.012;
      const sig = 0.12;
      const gauss = (tt:number, c0:number) => Math.exp(-((tt-c0)*(tt-c0)) / (2*sig*sig));
      S.t += dt;
      const aLaunch = A0 * gauss(S.t, 0.30);
      const aBrake  = A0 * 0.75 * gauss(S.t, 1.05);
      let az = aLaunch - aBrake;
      if (S.dir > 0) az -= Gv * 0.25;          // gravity opposes the climb on up-legs
      const aGuide = Kv * Cv * 0.55;           // K * grad(C) axial coherence guidance
      S.vz = Math.max(0, S.vz + (az + aGuide) * dt);   // integrate velocity
      S.p  += S.vz * dt * 1.4;                          // integrate position (progress)
      if (S.p >= 1) { S.p = 0; S.t = 0; S.vz = 0; S.dir *= -1; }  // arrive -> reverse
      const p = S.p;
      const zPos = S.dir > 0 ? p : 1 - p;      // dir=1 -> bottom to top
      const oy = bot - zPos*(bot-top);

      // lateral: guidance pulls to centerline ∝ K*C; turbulence ∝ (1-C)
      if (!reduce) {
        S.x += (Math.random()-0.5) * (1-Cv) * 6;
        S.x += (0 - S.x) * Math.min(Kv*Cv*0.12, 0.6);
      }
      const ox = cx + S.x;

      // trail
      if (!reduce) {
        S.trail.push({ x:ox, y:oy });
        if (S.trail.length > 46) S.trail.shift();
      }
      ctx.strokeStyle = `rgba(55,214,122,0.5)`; ctx.lineWidth=2;
      ctx.beginPath();
      S.trail.forEach((p,i)=>{ if(i===0)ctx.moveTo(p.x,p.y); else ctx.lineTo(p.x,p.y); });
      ctx.stroke();

      // object payload (cube)
      const sz = 13;
      ctx.save();
      ctx.translate(ox, oy);
      ctx.shadowColor = V.green; ctx.shadowBlur = 16;
      ctx.fillStyle = `rgba(55,214,122,0.9)`;
      ctx.fillRect(-sz/2,-sz/2,sz,sz);
      ctx.strokeStyle = "#cffce0"; ctx.lineWidth=1.2; ctx.strokeRect(-sz/2,-sz/2,sz,sz);
      ctx.restore();

      // direction arrows
      ctx.fillStyle = "rgba(155,108,255,0.7)"; ctx.font = `13px ${MONO}`;
      ctx.fillText(S.dir>0 ? "\u2191 UP" : "\u2193 DOWN", cx+half-40, (top+bot)/2);

      // readouts
      const vtrans = S.vz * (S.dir>0?1:-1);
      const azOut = (az + aGuide) * (S.dir>0?1:-1);
      let phase: string;
      if (p < 0.18) phase = "AXIAL INJECTION";
      else if (p < 0.42) phase = "ACCELERATION";
      else if (p < 0.62) phase = "STABLE TRANSIT";
      else if (p < 0.85) phase = "DECELERATION";
      else phase = "ARRIVAL";
      if (hRef.current)   hRef.current.textContent = (zPos*100).toFixed(0) + " %";
      if (vRef.current)   vRef.current.textContent = vtrans.toFixed(2);
      if (aRef.current)   aRef.current.textContent = azOut.toFixed(2);
      if (latRef.current) latRef.current.textContent = Math.abs(S.x).toFixed(0) + " px";
      if (phRef.current)  phRef.current.textContent = phase;

      if (!reduce) raf = requestAnimationFrame(draw);
    };
    draw();
    return () => cancelAnimationFrame(raf);
  }, []);

  return (
    <div style={{ display:"grid", gridTemplateColumns:"1fr 220px", gap:14 }}>
      <div style={{ borderRadius:8, overflow:"hidden", border:`1px solid ${V.green}26`, background:"#04050a" }}>
        <canvas ref={cvs} style={{ width:"100%", height:380, display:"block" }} />
      </div>
      <div style={panel(V.green)}>
        <Slider label="COHERENCE C" value={c} min={0} max={1} step={0.01} col={V.core}
          onChange={(v)=>{ setC(v); Cf.current=v; }} fmt={(v)=>v.toFixed(2)} />
        <Slider label="GUIDANCE GAIN K" value={k} min={0} max={1.5} step={0.01} col={V.green}
          onChange={(v)=>{ setK(v); Kf.current=v; }} fmt={(v)=>v.toFixed(2)} />
        <Slider label="GRAVITY DRAG G" value={gr} min={0} max={1} step={0.01} col={V.vio}
          onChange={(v)=>{ setGr(v); Gf.current=v; }} fmt={(v)=>v.toFixed(2)} />
        <Slider label="ACCEL PULSE a\u2080" value={a0} min={0.2} max={2} step={0.05} col={V.amb}
          onChange={(v)=>{ setA0(v); A0f.current=v; }} fmt={(v)=>v.toFixed(2)} />
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:7, marginTop:10 }}>
          <Readout label="HEIGHT z" col={V.core} vref={hRef} />
          <Readout label="v_trans" col={V.green} vref={vRef} />
          <Readout label="a_z(t)" col={V.amb} vref={aRef} />
          <Readout label="LATERAL" col={V.rose} vref={latRef} />
        </div>
        <div style={{ marginTop:7 }}><Readout label="PHASE" col={V.vio} vref={phRef} /></div>
      </div>
    </div>
  );
}

/* ── equation list ──────────────────────────────── */
const EQS: { col:string; tex:string; note:string }[] = [
  { col:V.core, note:"DMF-extended Navier-Stokes: a coherence force is added to the momentum balance.",
    tex:"\\rho\\left(\\partial_t \\mathbf{u} + \\mathbf{u}\\cdot\\nabla\\mathbf{u}\\right) = -\\nabla P + \\eta\\nabla^2\\mathbf{u} + \\mathbf{F}_{\\mathrm{DMF}}" },
  { col:V.core, note:"The DMF force itself, scaled by the local coherence field C(x,t).",
    tex:"\\mathbf{F}_{\\mathrm{DMF}} = -\\,\\alpha\\,\\rho_{\\mathrm{DMF}}\\;r\\,\\rho_{\\mathrm{DMF}}\\;\\nabla\\Phi_{\\mathrm{DMF}}\\;C(\\mathbf{x},t)" },
  { col:V.cyan, note:"Rankine velocity profile: solid-body rotation inside R_c, free 1/r flow outside.",
    tex:"v_\\theta(r)=\\begin{cases}\\dfrac{\\Gamma r}{2\\pi R_c^{2}}, & r<R_c\\\\[8pt]\\dfrac{\\Gamma}{2\\pi r}, & r\\ge R_c\\end{cases}" },
  { col:V.dim, note:"Standard Rankine vortex decay time (no coherence support).",
    tex:"\\tau_0=\\dfrac{R_{\\mathrm{core}}^{2}}{\\nu}" },
  { col:V.gold, note:"Coherence-extended vortex lifetime: the conduit survives far longer when C is high.",
    tex:"\\tau_{\\mathrm{vortex}}=\\tau_0\\left(1+\\dfrac{C(\\mathbf{x},t)\\,g_{\\mathrm{DMF}}\\,\\rho_{\\mathrm{DMF}}}{\\pi\\,\\rho_{\\mathrm{fluid}}\\,\\nu^{2}\\,k_{\\mathrm{cutoff}}}\\right)" },
  { col:V.gold, note:"The DMF enhancement cut-off wavenumber sets the lifetime-extension band.",
    tex:"k_{\\mathrm{cutoff}}=\\sqrt{\\dfrac{\\alpha_{\\mathrm{DMF}}\\,\\rho_{\\mathrm{DMF}}}{\\rho_{\\mathrm{fluid}}\\,\\nu^{2}}}\\;C(\\mathbf{x},t)^{1/2}" },
  { col:V.vio, note:"Generalized DMF space-time stress transport equation for the cavity field.",
    tex:"\\partial_t \\mathbf{T}_{\\mathrm{DMF}} + (\\mathbf{v}_{\\mathrm{DMF}}\\cdot\\nabla)\\mathbf{T}_{\\mathrm{DMF}} = -G\\nabla\\phi + \\nu_{\\mathrm{eff}}(C)\\,\\nabla^2\\mathbf{T}_{\\mathrm{DMF}}" },
  { col:V.green, note:"Coupled object-transport equation: gravity plus the coherence guidance force.",
    tex:"m_{\\mathrm{obj}}\\,\\dfrac{d^2\\mathbf{x}}{dt^{2}} = \\mathbf{F}_G + \\mathbf{F}_{\\mathrm{DMF}}(\\mathbf{u},C,\\nabla C)" },
  { col:V.amb, note:"DMF-modulated axial acceleration. The sim applies it as a launch pulse minus a later brake pulse (two Gaussians) to inject then arrest the payload.",
    tex:"a_z(t)=a_0\\,\\exp\\!\\left(-\\dfrac{(t-t_0)^2}{2\\sigma^2}\\right)" },
  { col:V.green, note:"Transport velocity modulation: base velocity steered by the coherence gradient.",
    tex:"\\mathbf{v}_{\\mathrm{trans}}=\\int a_z(t)\\,dt \\;\\approx\\; \\mathbf{v}_0 + K\\,\\nabla C_{\\mathrm{guided}}" },
  { col:V.rose, note:"Local coherence field: a sheath peaking at the core boundary R_c.",
    tex:"C(r,z)=C_{\\max}\\,\\exp\\!\\left(-\\dfrac{(r-R_c)^2}{2w^2}\\right)\\,h(z)" },
  { col:V.vio, note:"Coherence-modulated effective viscosity: turbulence suppression inside the core.",
    tex:"\\nu_{\\mathrm{eff}}(C)=\\nu_0\\,(1-\\lambda\\,C),\\qquad 0\\le\\lambda C<1" },
];

const PSEUDO = `# DMF transport-cavity control loop
for each timestep dt:
    C   = coherence_field(r, z)              # sheath peaks at R_c
    nu  = nu0 * (1 - lambda * C)             # turbulence suppression
    k   = sqrt(alpha*rho_DMF/(rho*nu^2)) * sqrt(C)
    tau = tau0 * (1 + C*g*rho_DMF/(pi*rho*nu^2*k))   # extend vortex lifetime
    if tau < tau_min: fire_generator_array()  # re-seed coherence

    # object dynamics
    F = F_gravity + K * grad(C)              # guidance toward core
    a_z = a0 * exp(-((t-t0)^2)/(2*sigma^2))  # launch / brake pulse
    v  += (F/m + a_z * axis) * dt
    x  += v * dt
    if reached(port): t0 = t; reverse(axis)  # up <-> down`;

/* ── page ───────────────────────────────────────── */
export default function TransportCavityPage() {
  return (
    <div style={{ minHeight:"100%", background:V.bg, color:V.ink,
      fontFamily:"'Rajdhani',sans-serif", overflowY:"auto" }}>
      <div style={{ maxWidth:1100, margin:"0 auto", padding:"18px 20px 40px" }}>

        {/* title */}
        <div style={{ marginBottom:20 }}>
          <div style={{ display:"inline-block", border:`1px solid ${V.core}55`,
            padding:"3px 10px", fontSize:9, letterSpacing:"0.2em",
            color:`${V.core}cc`, fontFamily:MONO, marginBottom:8 }}>
            DMF SPACE-FILLED TRANSPORT CAVITY · COHERENCE-MODULATED RANKINE CONDUIT
          </div>
          <h1 style={{ fontFamily:DISP, fontSize:23, fontWeight:900, letterSpacing:2,
            color:V.core, textShadow:`0 0 26px ${V.core}44`, margin:"4px 0 8px" }}>
            Space-Filled Transport Cavity
          </h1>
          <p style={{ fontSize:11.8, color:"rgba(200,212,230,0.74)", lineHeight:1.74,
            maxWidth:870, margin:0 }}>
            A coherence-modulated vortex can be sculpted into a stable, space-filling cavity &mdash; a
            living conduit that carries objects up, down, and through space without mechanical
            contact. The trick is the DMF term added to Navier-Stokes: it injects a coherence force
            that suppresses turbulent diffusion, extends the vortex lifetime, and turns a decaying
            Rankine swirl into a durable transport core. Below: two live simulations, the complete
            governing math, and the four source diagrams annotated chip-by-chip.
          </p>
          <div style={{ display:"flex", flexWrap:"wrap", gap:6, marginTop:11 }}>
            {[["VORTEX CORE",V.cyan],["COHERENCE SHEATH",V.gold],["AXIAL TRANSPORT",V.green],
              ["LIFETIME EXTENSION",V.core],["UV COHERENCE SENSE",V.vio]].map(([t,col])=>(
              <div key={t} style={{ fontFamily:MONO, fontSize:8, padding:"3px 9px", borderRadius:3,
                background:`${col}14`, border:`1px solid ${col}44`, color:col }}>{t}</div>
            ))}
          </div>
        </div>

        {/* SIM 1 */}
        <div style={card(V.core)}>
          <SectionHead n="I" title="COHERENCE-EXTENDED RANKINE VORTEX" col={V.core} />
          <p style={{ fontSize:11, color:"rgba(200,212,230,0.72)", lineHeight:1.7, margin:"0 0 14px" }}>
            Top-down cross-section. Inside the core radius R_c the flow rotates as a solid body;
            outside it falls off as 1/r (the Rankine profile, gold curve). Raise <b>Coherence</b> and
            the gold boundary layer sharpens, particles gather to the sheath, and the modelled vortex
            lifetime <b>&tau;<sub>vortex</sub></b> climbs far above the bare decay time &tau;<sub>0</sub>.
            Drop coherence and turbulence infiltrates &mdash; the conduit blurs and dies.
          </p>
          <VortexCanvas />
        </div>

        {/* SIM 2 */}
        <div style={card(V.green)}>
          <SectionHead n="II" title="AXIAL OBJECT TRANSPORT · UP / DOWN" col={V.green} />
          <p style={{ fontSize:11, color:"rgba(200,212,230,0.72)", lineHeight:1.7, margin:"0 0 14px" }}>
            Side view. A payload is injected at a port and ferried along the core by a Gaussian
            acceleration pulse a<sub>z</sub>(t) &mdash; accelerate, stable transit, decelerate, arrive,
            then reverse. The <b>Guidance Gain</b> times coherence pulls the object onto the
            centerline; low coherence lets turbulence push it off-axis. <b>Gravity Drag</b> slows the
            climb. Watch the phase readout cycle through the four transport stages.
          </p>
          <TransportCanvas />
          <div style={{ marginTop:12, fontSize:9.5, color:"rgba(180,196,218,0.6)", lineHeight:1.6,
            fontFamily:MONO, background:`${V.amb}0a`, border:`1px solid ${V.amb}26`,
            borderRadius:5, padding:"9px 12px" }}>
            RUNTIME MODEL · The sim integrates the true Gaussian pulse a_z(t)=a0&middot;exp(-(t-t0)&sup2;/2&sigma;&sup2;)
            as a launch pulse (+) followed by a brake pulse (-), then v_z = &int;a_z dt and z = &int;v_z dt.
            Guidance Gain K and Coherence C add the axial term K&middot;&nabla;C to the velocity (eqns 9-10),
            so both sliders steer real transport, not just lateral centering.
          </div>
        </div>

        {/* MATH */}
        <div style={card(V.gold)}>
          <SectionHead n="III" title="THE GOVERNING MATH · 12 EQUATIONS" col={V.gold} />
          <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(330px,1fr))", gap:12 }}>
            {EQS.map((e,i)=>(
              <div key={i} style={{ background:`${e.col}09`, border:`1px solid ${e.col}2e`,
                borderRadius:6, padding:"12px 14px" }}>
                <div style={{ overflowX:"auto", padding:"4px 0 8px" }}
                  dangerouslySetInnerHTML={{ __html: kx(e.tex, true) }} />
                <div style={{ fontSize:10, color:"rgba(190,205,225,0.66)", lineHeight:1.55,
                  borderTop:`1px solid ${e.col}22`, paddingTop:7 }}>{e.note}</div>
              </div>
            ))}
          </div>
          {/* pseudocode */}
          <div style={{ marginTop:14, background:"rgba(0,0,0,0.5)", border:`1px solid ${V.gold}26`,
            borderRadius:6, padding:"12px 14px", overflowX:"auto" }}>
            <div style={{ fontFamily:MONO, fontSize:8, color:V.gold, letterSpacing:"0.14em", marginBottom:8 }}>
              TRANSPORT CONTROL LOOP · PSEUDOCODE
            </div>
            <pre style={{ margin:0, fontFamily:MONO, fontSize:10.5, color:"rgba(190,210,225,0.8)",
              lineHeight:1.6, whiteSpace:"pre" }}>{PSEUDO}</pre>
          </div>
        </div>

        {/* SOURCE PLATES */}
        <div style={card(V.vio)}>
          <SectionHead n="IV" title="SOURCE DIAGRAMS · ANNOTATED" col={V.vio} />

          <Plate src={imgVortex} col={V.core}
            alt="DMF-Rankine vortex: coherence-extended lifetime"
            label="PLATE A · DMF-RANKINE VORTEX · COHERENCE-EXTENDED LIFETIME"
            caption="A turbulent vortex with a solid-body core (r < R_c) wrapped in a free outer flow. High coherence extends the lifetime tau; low coherence lets turbulence infiltrate and the vortex blurs and decays." />
          <div style={annoGrid}>
            <Anno col={V.cyan} k="Solid-Body Core (r < R_c)" v="Rotates as a rigid disk; the stable transport channel where objects ride." />
            <Anno col={V.core} k="Free Outer Flow" v="Velocity falls off as 1/r outside the core - the classic Rankine tail." />
            <Anno col={V.gold} k="Coherence Boundary Layer (C ~ 1)" v="The DMF sheath that pins the core edge and resists diffusion." />
            <Anno col={V.vio} k="Effective Viscosity Modulation" v="Coherence lowers effective viscosity inside the core, suppressing decay." />
            <Anno col={V.green} k="High Coherence -> tau grows" v="DMF-extended Navier-Stokes keeps particle paths laminar and stable." />
            <Anno col={V.rose} k="Low Coherence -> turbulence" v="Below the coincidence scale the vortex disrupts and diffuses away." />
          </div>

          <div style={{ height:14 }} />
          <Plate src={imgFramework} col={V.gold}
            alt="DMF-modulated space-filled transport cavity: mathematical framework"
            label="PLATE B · SPACE-FILLED TRANSPORT CAVITY · MATHEMATICAL FRAMEWORK"
            caption="The full cavity: a DMF-Rankine generator array sculpts a solid-body transport core inside a coherence sheath. Test masses and quantum payloads ride guided up/down trajectories through stable laminar flow." />
          <div style={annoGrid}>
            <Anno col={V.core} k="Generalized DMF-Extended N-S" v="Space-time stress transport with coherence-modulated viscosity nu_eff(C)." />
            <Anno col={V.green} k="Coupled Object-Transport" v="m d2x/dt2 = F_G + F_DMF(u, C, grad C) - gravity plus guidance force." />
            <Anno col={V.rose} k="Local Coherence Field C(r,z)" v="Peaks at R_cavity; the stabilized boundary that defines the conduit." />
            <Anno col={V.amb} k="Axial Acceleration a_z(t)" v="DMF-modulated Gaussian pulse: inject, accelerate, transit, decelerate." />
            <Anno col={V.gold} k="Transport Velocity Modulation" v="v_trans = integral a_z dt approx v0 + K grad C_guided." />
            <Anno col={V.vio} k="DMF-Rankine Generator Array" v="Emitter ring that continuously re-seeds the coherence field." />
          </div>

          <div style={{ height:14 }} />
          <Plate src={imgNavier} col={V.cyan}
            alt="DMF-extended Navier-Stokes: enhanced vorticity and lifetime"
            label="PLATE C · DMF-EXTENDED NAVIER-STOKES · ENHANCED VORTICITY"
            caption="Standard Rankine decay (left) versus DMF coherence enhancement (right). The added F_DMF term opens a 'DMF enhancement zone' in the coherence-vs-wavenumber spectrum, extending vortex lifetime well past tau_0." />
          <div style={annoGrid}>
            <Anno col={V.dim} k="Standard Decay tau0 = R^2/nu" v="Bare vortex spins down on the viscous timescale." />
            <Anno col={V.core} k="F_DMF Term" v="-alpha rho_DMF r rho_DMF grad(Phi_DMF) C(x,t) added to momentum." />
            <Anno col={V.gold} k="tau_vortex Formula" v="Lifetime multiplied by a coherence-dependent factor > 1." />
            <Anno col={V.green} k="DMF Enhancement Zone" v="Band in k-space where coherence actively feeds the vortex." />
            <Anno col={V.rose} k="k_cutoff" v="Upper wavenumber of the enhancement band, scales with sqrt(C)." />
            <Anno col={V.vio} k="Coherence Field C(x,t)" v="The streamline map that decides where flow stays organized." />
          </div>

          <div style={{ height:14 }} />
          <Plate src={imgSpectral} col={V.vio}
            alt="Spectral color-space transforms: DMF-assisted 3-cone to 4-cone projection"
            label="PLATE D · SPECTRAL DETECTION · 3-CONE TO 4-CONE COHERENCE SENSE"
            caption="The sensing subsystem. A DMF-assisted projection adds a UV channel tuned to coherence-dependent signals, so the cavity can READ the coherence field C(x,t) it is shaping - closing the detect/feedback loop that keeps transport stable." />
          <div style={annoGrid}>
            <Anno col={V.vio} k="Spectral Mapping (UV 365nm)" v="A fourth, bee-like UV cone extends trichromatic sensing to tetrachromatic." />
            <Anno col={V.core} k="Projection Matrix P(3->4)" v="c4 = P*c3 + delta c_UV lifts ordinary color into the coherence channel." />
            <Anno col={V.green} k="UV Information Gain" v="UV channel specifically tuned to organized, coherence-bearing structure." />
            <Anno col={V.gold} k="delta c_UV" v="g_bio * Phi_DMF / (sigma_UV / Energy) - the DMF read-out term." />
            <Anno col={V.rose} k="Coherence Pattern C(x,t)" v="The signal the sensor extracts to feed the transport controller." />
            <Anno col={V.amb} k="Detect / Feedback Loop" v="Phi_DMF potential field updates the generator array in real time." />
          </div>
        </div>

        {/* IN WORDS */}
        <div style={card(V.green)}>
          <SectionHead n="V" title="THE THEORY IN PLAIN WORDS" col={V.green} />
          <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(250px,1fr))", gap:10 }}>
            {[
              ["What the cavity is", V.core, "A Rankine vortex whose core is held open by a coherence sheath. The sheath turns a transient swirl into a standing, space-filling conduit that objects can ride through."],
              ["Why coherence matters", V.gold, "The DMF force suppresses the turbulent diffusion that normally kills a vortex. Higher coherence means a higher cut-off wavenumber and a much longer lifetime - the conduit stays open."],
              ["How objects move up/down", V.green, "A Gaussian axial-acceleration pulse launches and brakes the payload, while the coherence gradient supplies a sideways guidance force that keeps it on the centerline."],
              ["Turbulence suppression", V.vio, "Effective viscosity is lowered inside the core, nu_eff = nu0(1 - lambda C). Laminar guidance replaces chaotic flow, so transit is smooth and predictable."],
              ["The generator array", V.amb, "A ring of DMF-Rankine emitters continuously re-seeds the coherence field, refreshing the sheath before its lifetime runs out."],
              ["Honest framing", V.rose, "This is a theoretical, educational model assembled faithfully from the attached DMF framework. It is internally consistent physics-styled math, not experimentally validated technology."],
            ].map(([t,col,body])=>(
              <div key={t as string} style={{ background:`${col}0c`, border:`1px solid ${col}33`,
                borderRadius:6, padding:"12px 14px" }}>
                <div style={{ fontFamily:DISP, fontSize:11.5, color:col as string, letterSpacing:0.5, marginBottom:6 }}>{t}</div>
                <div style={{ fontSize:10.6, color:"rgba(195,210,230,0.72)", lineHeight:1.62 }}>{body}</div>
              </div>
            ))}
          </div>
        </div>

        {/* footer */}
        <div style={{ paddingTop:10, borderTop:`1px solid ${V.core}14`,
          fontFamily:MONO, fontSize:7.5, color:V.dim, letterSpacing:"0.12em", textAlign:"center" }}>
          DMF SPACE-FILLED TRANSPORT CAVITY · RANKINE CORE · COHERENCE SHEATH · F_DMF · tau_vortex · k_cutoff ·
          AXIAL a_z(t) · GUIDANCE GRADIENT · nu_eff(C) · GENERATOR ARRAY · UV COHERENCE SENSE
        </div>
      </div>
    </div>
  );
}
