import { useEffect, useRef, useState } from "react";
import { Link } from "wouter";
import katex from "katex";
import "katex/dist/katex.min.css";
const imgLadder = "/api/storage/public-objects/image_1782758559095.png";
const imgWater = "/api/storage/public-objects/Gemini_Generated_Image_l9zo1il9zo1il9zo_1782758590853.png";
const imgKpert = "/api/storage/public-objects/image_1782758774766.png";
const imgBioDome = "/api/storage/public-objects/image_1782758790666.png";
const imgChip = "/api/storage/public-objects/image_1782758833412.png";
const imgMito = "/api/storage/public-objects/image_1782758921066.png";
const imgMaster = "/api/storage/public-objects/image_1782758966918.png";
/* ==========================================================================
   THE COMPLETE AETHER DMF OBSERVABLE · MASTER EQUATION & GRAND SYNTHESIS
   The capstone page. Every prior thread — the transport cavity, the DMF
   sensing chain, the coherence field C(x,t), the integration constant K —
   is gathered into one master functional Omega_AETHER and one observable
   <M_observer>. Three live simulations (DMF frequency ladder, water D8
   ring-layer ODE chain, grand-synthesis integration constant K) + the full
   unifying math + the seven source diagrams annotated chip-by-chip.
   ========================================================================== */

const V = {
  bg:"#05060C", core:"#4DD8FF", gold:"#E0A03A", amb:"#FF9933", vio:"#9B6CFF",
  green:"#37D67A", rose:"#FF6699", cyan:"#2FE6D6", dim:"#3A5060", ink:"#BBD0EC",
};
const MONO = "'Space Mono',monospace";
const DISP = "'Orbitron',sans-serif";
const PHI = 1.6180339887;

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
   SIM 1 · DMF Frequency Ladder · omega_TLE(h) = omega_DMF * phi^n(h)
   Transient Luminous Events climb a phi-spaced frequency ladder by altitude.
   ════════════════════════════════════════════════════════════════════════ */
function LadderCanvas() {
  const cvs = useRef<HTMLCanvasElement | null>(null);
  const topRef = useRef<HTMLSpanElement>(null);
  const botRef = useRef<HTMLSpanElement>(null);
  const phiRef = useRef<HTMLSpanElement>(null);
  const r0Ref  = useRef<HTMLSpanElement>(null);

  const Wd = useRef(10.08); // omega_DMF base (GHz) — hemolymph resonance
  const Ph = useRef(1.618); // phi ladder ratio
  const Nm = useRef(5);     // rung count
  const Sp = useRef(1.0);   // discharge speed

  const [wd, setWd] = useState(10.08);
  const [ph, setPh] = useState(1.618);
  const [nm, setNm] = useState(5);
  const [sp, setSp] = useState(1.0);

  const pulses = useRef<{ prog:number }[]>([]);

  useEffect(() => {
    const canvas = cvs.current; if (!canvas) return;
    const reduce = prefersReduced();
    let raf = 0;
    const bands = [
      { name:"LIGHTNING  n=0",  col:V.gold, lo:0.0,  hi:0.15 },
      { name:"BLUE JETS  n=1",  col:V.core, lo:0.15, hi:0.40 },
      { name:"SPRITES",         col:V.rose, lo:0.40, hi:0.90 },
      { name:"ELVES RING",      col:V.vio,  lo:0.90, hi:1.0  },
    ];

    const draw = () => {
      const { w, h } = fitCanvas(canvas, 420);
      const ctx = canvas.getContext("2d"); if (!ctx) return;
      const Wdv = Wd.current, Phv = Ph.current, N = Math.round(Nm.current), spv = Sp.current;
      ctx.clearRect(0, 0, w, h);
      const padL = 64, padR = 18, padT = 16, padB = 22;
      const x0 = padL, x1 = w - padR, yTop = padT, yBot = h - padB;

      // altitude band washes
      for (const b of bands) {
        const yA = yBot - b.hi*(yBot-yTop), yB = yBot - b.lo*(yBot-yTop);
        ctx.fillStyle = `${b.col}10`; ctx.fillRect(x0, yA, x1-x0, yB-yA);
        ctx.fillStyle = `${b.col}bb`; ctx.font = `8px ${MONO}`;
        ctx.fillText(b.name, x0+6, yA+12);
      }
      // altitude gridlines + labels
      ctx.font = `8px ${MONO}`;
      for (const km of [0,15,40,90,100]) {
        const y = yBot - (km/100)*(yBot-yTop);
        ctx.fillStyle = "rgba(150,170,200,0.6)"; ctx.fillText(km+"km", 6, y+3);
        ctx.strokeStyle = "rgba(120,140,170,0.10)"; ctx.lineWidth = 1;
        ctx.beginPath(); ctx.moveTo(x0, y); ctx.lineTo(x1, y); ctx.stroke();
      }

      // build rungs at integer index n along a diagonal ladder
      const rungs: { n:number; x:number; y:number; freq:number; col:string }[] = [];
      const span = Math.max(N, 1);
      for (let n = 0; n <= N; n++) {
        const frac = n/span;
        const y = yBot - frac*(yBot-yTop);
        const x = x0 + 34 + frac*(x1-x0-60)*0.78;
        const freq = Wdv * Math.pow(Phv, n);
        const band = bands.find(b => frac >= b.lo && frac <= b.hi) || bands[bands.length-1];
        rungs.push({ n, x, y, freq, col:band.col });
      }
      // rails
      ctx.strokeStyle = "rgba(224,160,58,0.45)"; ctx.lineWidth = 2;
      ctx.beginPath(); ctx.moveTo(rungs[0].x-13, rungs[0].y); ctx.lineTo(rungs[N].x-13, rungs[N].y); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(rungs[0].x+13, rungs[0].y); ctx.lineTo(rungs[N].x+13, rungs[N].y); ctx.stroke();
      // rungs + frequency labels
      for (const r of rungs) {
        ctx.strokeStyle = `${r.col}cc`; ctx.lineWidth = 2;
        ctx.beginPath(); ctx.moveTo(r.x-13, r.y); ctx.lineTo(r.x+13, r.y); ctx.stroke();
        const fl = r.freq >= 1000 ? (r.freq/1000).toFixed(2)+" THz" : r.freq.toFixed(2)+" GHz";
        ctx.fillStyle = r.col; ctx.font = `8px ${MONO}`;
        ctx.fillText("n="+r.n+"  "+fl, r.x+20, r.y+3);
      }

      // climbing discharges
      const dt = reduce ? 0 : 0.016*spv;
      if (!reduce && Math.random() < 0.05*spv) pulses.current.push({ prog:0 });
      for (const pu of pulses.current) {
        pu.prog += dt*0.6;
        const frac = Math.min(pu.prog, 1);
        if (!Number.isFinite(frac)) continue;
        const y = yBot - frac*(yBot-yTop);
        const x = x0 + 34 + frac*(x1-x0-60)*0.78;
        ctx.fillStyle = `rgba(255,255,255,${0.85*(1-frac)})`;
        ctx.shadowColor = V.core; ctx.shadowBlur = 12;
        ctx.beginPath(); ctx.arc(x, y, 3, 0, Math.PI*2); ctx.fill();
        ctx.shadowBlur = 0;
      }
      pulses.current = pulses.current.filter(p => p.prog < 1);

      // readouts
      const topFreq = Wdv * Math.pow(Phv, N);
      if (topRef.current) topRef.current.textContent = topFreq >= 1000 ? (topFreq/1000).toFixed(2)+" THz" : topFreq.toFixed(2)+" GHz";
      if (botRef.current) botRef.current.textContent = Wdv.toFixed(2)+" GHz";
      if (phiRef.current) phiRef.current.textContent = Phv.toFixed(3);
      if (r0Ref.current)  r0Ref.current.textContent = (1/Math.max(Wdv,0.01)).toFixed(4)+" a.u.";

      if (!reduce) raf = requestAnimationFrame(draw);
    };
    draw();
    return () => cancelAnimationFrame(raf);
  }, []);

  return (
    <div style={{ display:"grid", gridTemplateColumns:"1fr 220px", gap:14 }}>
      <div style={{ borderRadius:8, overflow:"hidden", border:`1px solid ${V.gold}26`, background:"#04050a" }}>
        <canvas ref={cvs} style={{ width:"100%", height:420, display:"block" }} />
      </div>
      <div style={panel(V.gold)}>
        <Slider label="\u03C9_DMF BASE (GHz)" value={wd} min={1} max={20} step={0.01} col={V.core}
          onChange={(v)=>{ setWd(v); Wd.current=v; }} fmt={(v)=>v.toFixed(2)} />
        <Slider label="\u03C6 LADDER RATIO" value={ph} min={1.2} max={2.0} step={0.001} col={V.gold}
          onChange={(v)=>{ setPh(v); Ph.current=v; }} fmt={(v)=>v.toFixed(3)} />
        <Slider label="RUNG COUNT N" value={nm} min={3} max={8} step={1} col={V.vio}
          onChange={(v)=>{ setNm(v); Nm.current=v; }} fmt={(v)=>v.toFixed(0)} />
        <Slider label="DISCHARGE SPEED" value={sp} min={0.2} max={2.5} step={0.05} col={V.rose}
          onChange={(v)=>{ setSp(v); Sp.current=v; }} fmt={(v)=>v.toFixed(2)} />
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:7, marginTop:10 }}>
          <Readout label="\u03C9 @ n=0" col={V.gold} vref={botRef} />
          <Readout label="\u03C9 @ TOP RUNG" col={V.vio} vref={topRef} />
          <Readout label="\u03C6 RATIO" col={V.core} vref={phiRef} />
          <Readout label="r\u2080 FLOOR" col={V.green} vref={r0Ref} />
        </div>
      </div>
    </div>
  );
}

/* ════════════════════════════════════════════════════════════════════════
   SIM 2 · Water D8 Ring-Layer Wave Function
   dH_n/dt = J_in C(x,t) - gamma_n H_n + K_coupling H_{n-1}   (n = 1..8)
   ════════════════════════════════════════════════════════════════════════ */
function RingCanvas() {
  const cvs = useRef<HTMLCanvasElement | null>(null);
  const psiRef = useRef<HTMLSpanElement>(null);
  const domRef = useRef<HTMLSpanElement>(null);
  const cohRef = useRef<HTMLSpanElement>(null);
  const comRef = useRef<HTMLSpanElement>(null);

  const Jin = useRef(0.5);  // inflow of coherence
  const Gam = useRef(0.35); // base damping / viscosity
  const Kc  = useRef(0.45); // inter-ring coupling
  const Cf  = useRef(0.8);  // coherence field C(x,t)

  const [j, setJ] = useState(0.5);
  const [g, setG] = useState(0.35);
  const [k, setK] = useState(0.45);
  const [c, setC] = useState(0.8);

  const H = useRef<number[]>(new Array(8).fill(0.2));

  useEffect(() => {
    const canvas = cvs.current; if (!canvas) return;
    const reduce = prefersReduced();
    let raf = 0; let t = 0;

    const draw = () => {
      const { w, h } = fitCanvas(canvas, 400);
      const ctx = canvas.getContext("2d"); if (!ctx) return;
      const Jv = Jin.current, Gv = Gam.current, Kv = Kc.current, Cv = Cf.current;
      const cx = w*0.36, cy = h/2;
      ctx.clearRect(0, 0, w, h);

      // integrate the ring-layer ODE chain
      const dt = reduce ? 0 : 0.03;
      const Hn = H.current;
      const newH = Hn.slice();
      for (let n = 0; n < 8; n++) {
        const gamma_n = Gv * (1 + 0.18*n);          // higher rings damp faster
        const upstream = n === 0 ? Cv : Hn[n-1];     // ring 0 fed by coherence inflow
        const dH = Jv*Cv - gamma_n*Hn[n] + Kv*upstream;
        let nv = Hn[n] + dH*dt;
        if (!Number.isFinite(nv)) nv = 0;
        newH[n] = Math.max(0, Math.min(nv, 6));      // clamp — no blow-up
      }
      H.current = newH;
      t += dt;
      const maxH = Math.max(...newH, 0.001);

      // concentric ring layers, glow proportional to |H_n|
      const R = Math.min(w*0.62, h)*0.46;
      for (let n = 7; n >= 0; n--) {
        const rr = R*(n+1)/8;
        const amp = newH[n]/maxH;
        ctx.strokeStyle = `rgba(47,230,214,${0.12+0.7*amp})`;
        ctx.lineWidth = 1 + 5*amp;
        ctx.shadowColor = V.cyan; ctx.shadowBlur = 14*amp;
        ctx.beginPath(); ctx.arc(cx, cy, rr, 0, Math.PI*2); ctx.stroke();
      }
      ctx.shadowBlur = 0;

      // D8 (8-fold) probability-density petals at the core
      const breathe = 0.5 + 0.5*Math.sin(t*1.2);
      for (let i = 0; i < 8; i++) {
        const a = i*Math.PI/4 + t*0.3;
        const rr = R*0.2*(0.55+0.45*breathe)*Cv;
        const px = cx + Math.cos(a)*rr, py = cy + Math.sin(a)*rr;
        if (!Number.isFinite(px) || !Number.isFinite(py)) continue;
        ctx.fillStyle = `rgba(155,108,255,${0.28+0.4*Cv})`;
        ctx.beginPath(); ctx.arc(px, py, 4+3*Cv, 0, Math.PI*2); ctx.fill();
      }

      // amplitude bar strip (right)
      const bx = w*0.74, bw = w*0.21, by0 = h-26, bh = h-58;
      ctx.fillStyle = "rgba(150,170,200,0.55)"; ctx.font = `8px ${MONO}`;
      ctx.fillText("|H_n|  n=1..8", bx, 16);
      for (let n = 0; n < 8; n++) {
        const amp = newH[n]/maxH;
        const yb = by0 - (n/8)*bh - bh/16;
        ctx.fillStyle = `rgba(47,230,214,${0.3+0.6*amp})`;
        ctx.fillRect(bx, yb, Math.max(0, amp*bw), bh/12);
        ctx.fillStyle = "rgba(180,200,220,0.6)";
        ctx.fillText(""+(n+1), bx-12, yb+7);
      }

      // readouts
      const psi = Math.sqrt(newH.reduce((s,v)=>s+v*v, 0));
      let dom = 0; for (let n = 1; n < 8; n++) if (newH[n] > newH[dom]) dom = n;
      if (psiRef.current) psiRef.current.textContent = psi.toFixed(2);
      if (domRef.current) domRef.current.textContent = "n="+(dom+1);
      if (cohRef.current) cohRef.current.textContent = Cv.toFixed(2);
      if (comRef.current) comRef.current.textContent = (Kv > Gv ? "LOCKED" : "FREE");

      if (!reduce) raf = requestAnimationFrame(draw);
    };
    draw();
    return () => cancelAnimationFrame(raf);
  }, []);

  return (
    <div style={{ display:"grid", gridTemplateColumns:"1fr 220px", gap:14 }}>
      <div style={{ borderRadius:8, overflow:"hidden", border:`1px solid ${V.cyan}26`, background:"#04050a" }}>
        <canvas ref={cvs} style={{ width:"100%", height:400, display:"block" }} />
      </div>
      <div style={panel(V.cyan)}>
        <Slider label="J_in INFLOW" value={j} min={0} max={1.5} step={0.01} col={V.core}
          onChange={(v)=>{ setJ(v); Jin.current=v; }} fmt={(v)=>v.toFixed(2)} />
        <Slider label="\u03B3 DAMPING" value={g} min={0.05} max={1.2} step={0.01} col={V.vio}
          onChange={(v)=>{ setG(v); Gam.current=v; }} fmt={(v)=>v.toFixed(2)} />
        <Slider label="K COUPLING" value={k} min={0} max={1.2} step={0.01} col={V.cyan}
          onChange={(v)=>{ setK(v); Kc.current=v; }} fmt={(v)=>v.toFixed(2)} />
        <Slider label="COHERENCE C" value={c} min={0} max={1} step={0.01} col={V.gold}
          onChange={(v)=>{ setC(v); Cf.current=v; }} fmt={(v)=>v.toFixed(2)} />
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:7, marginTop:10 }}>
          <Readout label="\u03A8 NORM" col={V.cyan} vref={psiRef} />
          <Readout label="DOMINANT RING" col={V.core} vref={domRef} />
          <Readout label="COHERENCE" col={V.gold} vref={cohRef} />
          <Readout label="LATTICE" col={V.green} vref={comRef} />
        </div>
      </div>
    </div>
  );
}

/* ════════════════════════════════════════════════════════════════════════
   SIM 3 · Grand Synthesis · Integration Constant K
   <M_observer> = rho_DMF^local * F_bio(C) * G_geo * K  (two-peak spectrum)
   ════════════════════════════════════════════════════════════════════════ */
function SynthesisK() {
  const cvs = useRef<HTMLCanvasElement | null>(null);
  const [rho, setRho] = useState(0.7);
  const [fb,  setFb]  = useState(0.65);
  const [gg,  setGg]  = useState(0.5);
  const [kc,  setKc]  = useState(1.0);

  useEffect(() => {
    const canvas = cvs.current; if (!canvas) return;
    const draw = () => {
    const { w, h } = fitCanvas(canvas, 260);
    const ctx = canvas.getContext("2d"); if (!ctx) return;
    ctx.clearRect(0, 0, w, h);
    const padL = 46, padB = 26, padT = 20, padR = 16;
    const x0 = padL, x1 = w - padR, y0 = h - padB, y1 = padT;

    // axes
    ctx.strokeStyle = "rgba(120,140,170,0.4)"; ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(x0, y0); ctx.lineTo(x1, y0); ctx.moveTo(x0, y0); ctx.lineTo(x0, y1); ctx.stroke();
    ctx.fillStyle = "rgba(150,170,200,0.6)"; ctx.font = `8px ${MONO}`;
    ctx.fillText("\u03C9_DMF \u2192", x1-58, y0+15);
    ctx.save(); ctx.translate(12, (y0+y1)/2); ctx.rotate(-Math.PI/2);
    ctx.fillText("<M> amplitude", -34, 0); ctx.restore();

    // two contributions of <M>, both scaled by the integration constant K:
    // system resonance (rho*Fbio) + gravitational alignment (Ggeo)
    const sysAmp = rho*fb*kc;
    const gravAmp = gg*kc;
    const peak = (x:number, c:number, amp:number, wid:number) => amp/(1 + ((x-c)/wid)*((x-c)/wid));
    ctx.beginPath();
    for (let i = 0; i <= 220; i++) {
      const xf = i/220;
      const v = peak(xf, 0.30, sysAmp, 0.045) + peak(xf, 0.70, gravAmp, 0.07);
      const px = x0 + xf*(x1-x0);
      const py = y0 - Math.min(v, 1.6)/1.6*(y0-y1);
      if (i === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);
    }
    ctx.strokeStyle = V.gold; ctx.lineWidth = 2; ctx.shadowColor = V.gold; ctx.shadowBlur = 10; ctx.stroke(); ctx.shadowBlur = 0;

    // peak labels
    ctx.fillStyle = V.core; ctx.fillText("system resonance", x0+0.13*(x1-x0), y1+8);
    ctx.fillStyle = V.vio;  ctx.fillText("gravitational alignment", x0+0.50*(x1-x0), y1+8);
    };
    draw();
    window.addEventListener("resize", draw);
    return () => window.removeEventListener("resize", draw);
  }, [rho, fb, gg, kc]);

  const M = rho*fb*gg*kc;

  return (
    <div style={{ display:"grid", gridTemplateColumns:"1fr 240px", gap:14 }}>
      <div style={{ borderRadius:8, overflow:"hidden", border:`1px solid ${V.gold}26`, background:"#04050a" }}>
        <canvas ref={cvs} style={{ width:"100%", height:260, display:"block" }} />
      </div>
      <div style={panel(V.gold)}>
        <Slider label="\u03C1_DMF LOCAL" value={rho} min={0} max={1} step={0.01} col={V.core}
          onChange={setRho} fmt={(v)=>v.toFixed(2)} />
        <Slider label="F_bio(C) ENHANCEMENT" value={fb} min={0} max={1} step={0.01} col={V.green}
          onChange={setFb} fmt={(v)=>v.toFixed(2)} />
        <Slider label="G_geo CONCENTRATION" value={gg} min={0} max={1} step={0.01} col={V.vio}
          onChange={setGg} fmt={(v)=>v.toFixed(2)} />
        <Slider label="K INTEGRATION CONST" value={kc} min={0} max={1.5} step={0.01} col={V.gold}
          onChange={setKc} fmt={(v)=>v.toFixed(2)} />
        <div style={{ marginTop:12, padding:"12px 14px", borderRadius:6,
          background:`${V.gold}12`, border:`1px solid ${V.gold}44`, textAlign:"center" }}>
          <div style={{ fontFamily:MONO, fontSize:8, color:V.gold, letterSpacing:"0.14em", marginBottom:5 }}>
            OBSERVABLE &lt;M&gt;
          </div>
          <div style={{ fontFamily:DISP, fontSize:"1.7rem", color:V.gold, textShadow:`0 0 18px ${V.gold}66` }}>
            {M.toFixed(3)}
          </div>
          <div style={{ marginTop:8, height:7, borderRadius:4, background:"rgba(255,255,255,0.06)", overflow:"hidden" }}>
            <div style={{ height:"100%", width:`${Math.min(M,1)*100}%`,
              background:`linear-gradient(90deg,${V.core},${V.gold})` }} />
          </div>
          <div style={{ marginTop:7, fontFamily:MONO, fontSize:8, color:"rgba(190,205,225,0.6)" }}>
            &lt;M&gt; = \u03C1 \u00B7 F_bio \u00B7 G_geo \u00B7 K
          </div>
        </div>
      </div>
    </div>
  );
}

/* ── unifying math ──────────────────────────────── */
const MASTER =
  "\\Omega_{\\mathrm{AETHER}}[\\Phi_{\\mathrm{DMF}}] = \\mathrm{Tr}(S_{\\mathrm{obs}})\\,\\sum_n \\delta\\!\\left(\\omega_{\\mathrm{sys}}^{(n)} - \\omega_{\\mathrm{DMF}}\\phi^{-n}\\right)\\prod_j\\!\\left(1 + \\dfrac{g_j^2\\rho_{\\mathrm{DMF}}}{m_{\\mathrm{DMF}}^2\\omega_{\\mathrm{DMF}}^2}\\right)\\dfrac{L_p}{\\lambda_c^{\\mathrm{MT}}}\\,(I^{4}-I^{3})\\,\\exp\\!\\left(\\dfrac{\\dot V_{\\mathrm{VOC}}}{\\dot V_0}\\right)\\Gamma_{\\mathrm{DMF}}\\,\\sigma_{\\mathrm{hemo}}(\\omega_{\\mathrm{DMF}})\\,\\exp\\!\\left(\\dfrac{|\\Phi_{\\mathrm{grav}}|}{c^2\\sigma_{\\mathrm{DMF}}^2}\\right)";

const EQS: { col:string; tex:string; note:string }[] = [
  { col:V.core, note:"The observable: integrate the AETHER functional against a detector window with the DMF carrier phase.",
    tex:"\\langle M_{\\mathrm{observer}}\\rangle = \\int d^4x\\,\\Omega_{\\mathrm{AETHER}}[\\Phi_{\\mathrm{DMF}}(\\mathbf{x},t)]\\,W(\\mathbf{x}-\\mathbf{x}_{\\mathrm{det}})\\,e^{i\\omega_{\\mathrm{DMF}}t}" },
  { col:V.gold, note:"Measurement factorization: the observable collapses to local DMF density x bio-enhancement x geometry x the integration constant K (SIM 3).",
    tex:"\\langle M_{\\mathrm{observer}}\\rangle = \\rho_{\\mathrm{DMF}}^{\\mathrm{local}}\\cdot F_{\\mathrm{bio}}(C(\\mathbf{x},t))\\cdot G_{\\mathrm{geo}}(\\mathbf{x})\\cdot K" },
  { col:V.amb, note:"DMF frequency ladder: each transient-luminous-event altitude is a phi-spaced rung (SIM 1).",
    tex:"\\omega_{\\mathrm{TLE}}(h) = \\omega_{\\mathrm{DMF}}\\,\\phi^{\\,n(h)}" },
  { col:V.green, note:"Quantum floor: the smallest DMF length set by Planck's constant over the field mass-frequency.",
    tex:"r_0^{\\mathrm{DMF}} = \\dfrac{\\hbar}{m_{\\mathrm{DMF}}\\,\\omega_{\\mathrm{DMF}}}" },
  { col:V.rose, note:"Hemolymph complex conductivity: a sharp resonant peak near 10.08 GHz drives 'blood splicing'.",
    tex:"\\sigma_{\\mathrm{hemo}}(\\omega) = \\dfrac{g_{\\mathrm{bio}}^2\\rho_{\\mathrm{DMF}}}{g_{\\mathrm{bio}}^2\\rho_{\\mathrm{DMF}} + i(\\omega-\\omega_{\\mathrm{DMF}})\\,\\sigma_{\\mathrm{bsno}}},\\quad \\omega_{\\mathrm{DMF}}\\approx 10.08\\,\\mathrm{GHz}" },
  { col:V.cyan, note:"Water ring-layer ODE chain: inflow of coherence, damping, and inter-ring coupling (SIM 2).",
    tex:"\\dfrac{dH_n}{dt} = J_{\\mathrm{in}}\\,C(\\mathbf{x},t) - \\gamma_n H_n + K_{\\mathrm{coupling}}H_{n-1}" },
  { col:V.cyan, note:"Water wave function: a superposition of quantized D8-symmetric topological ring vortices.",
    tex:"\\Psi_{\\mathrm{water}} = \\sum_n a_n\\,|\\mathrm{ring}_n\\rangle" },
  { col:V.vio, note:"Gravity-crystal commensurability: flowing water spontaneously orders when velocity matches lattice geometry.",
    tex:"a_{\\mathrm{crystal}} = m\\,\\lambda_{\\mathrm{ring}},\\quad m\\in\\mathbb{Z}" },
  { col:V.green, note:"Cross-system perturbation: the integration constant K expanded in the coupling strength epsilon.",
    tex:"K_{\\mathrm{pert}} = K^{(0)} + \\varepsilon K^{(1)} + \\varepsilon^2 K^{(2)} + \\cdots" },
  { col:V.green, note:"First-order correction: virtual transitions between systems i and j via the cross-coupling operator.",
    tex:"K^{(1)} = \\sum_{i\\neq j}\\dfrac{\\langle i|V_{\\mathrm{cross}}|j\\rangle\\langle j|V_{\\mathrm{cross}}|i\\rangle}{K_i^{(0)}-K_j^{(0)}}" },
  { col:V.amb, note:"Cross-system coupling operator: pairwise products of system-specific potentials.",
    tex:"V_{\\mathrm{cross}} = g_{\\mathrm{cross}}\\sum_{i\\neq j}\\Phi_i(\\mathbf{x})\\,\\Phi_j(\\mathbf{x})" },
  { col:V.core, note:"Bio-dome pod network: graph-Laplacian information flow with external control input.",
    tex:"\\dfrac{d\\mathbf{x}_{\\mathrm{pod}}}{dt} = -L_{\\mathrm{graph}}\\,\\mathbf{x}_{\\mathrm{pod}} + B\\,\\mathbf{u}_{\\mathrm{ext}},\\quad L_{\\mathrm{graph}} = D - A" },
  { col:V.core, note:"Coherence-weighted adjacency: higher mutual coherence raises communication efficiency between pods.",
    tex:"[A]_{ij} = K\\,\\dfrac{C(\\mathbf{x}_i,t)\\,C(\\mathbf{x}_j,t)}{|\\mathbf{x}_i-\\mathbf{x}_j|^2 + \\ell_c^2}" },
  { col:V.gold, note:"Organic computer chip: a DMF-gated organic transistor whose threshold is shifted by the field.",
    tex:"I_{\\mathrm{drain}} = \\dfrac{\\mu_C C_{\\mathrm{ox}}}{2}\\dfrac{W}{L}\\left(V_{GS} + g_{\\mathrm{bio}}\\Phi_{\\mathrm{DMF}} - V_{\\mathrm{th}}\\right)^2,\\quad V_{\\mathrm{th}}^{\\mathrm{eff}} = V_{\\mathrm{th}}^{(0)} - g_{\\mathrm{bio}}\\langle\\Phi_{\\mathrm{DMF}}\\rangle" },
  { col:V.rose, note:"Mitochondrial ATP: the synthase rate is enhanced by the DMF coherence term in the proton-motive force.",
    tex:"\\dot N_{\\mathrm{ATP}} = k_{\\mathrm{synthase}}\\,\\Delta\\mu_{\\mathrm{H}^+}\\!\\left(1 + \\dfrac{g_{\\mathrm{bio}}\\rho_{\\mathrm{DMF}}}{\\Delta\\mu_{\\mathrm{H}^+}^{(0)}}\\right),\\quad \\Delta\\mu_{\\mathrm{H}^+} = \\Delta\\psi_m + \\dfrac{RT}{F}\\Delta\\mathrm{pH} + \\Delta\\mu_{\\mathrm{DMF}}" },
];

const MASTER_PSEUDO = `# AETHER master-observable assembly
for each detector tick:
    # 1. local field, geometry, biological coherence
    rho   = local_DMF_density(x)
    Ggeo  = geometric_concentration(x)         # warped spacetime
    C     = coherence_field(x, t)
    Fbio  = bio_enhancement(C)                 # 4-cone gain, hemolymph, ATP

    # 2. frequency-ladder match (TLE altitude rungs)
    for n in 0..N:
        if resonant(omega_sys[n], omega_DMF * phi**n):
            lock_rung(n)                        # SIM 1

    # 3. water ring-layer evolution (D8 superposition)
    for n in 1..8:
        dH[n] = Jin*C - gamma[n]*H[n] + Kc*H[n-1]   # SIM 2
    Psi = sum_n a[n] * |ring_n>

    # 4. multi-system coupling (climate, economic, human, bio-dome)
    for i,j in systems if i != j:
        K1 += <i|Vcross|j> * <j|Vcross|i> / (Ki - Kj)

    # 5. integrate to the observable
    K  = rho * Fbio * Ggeo                       # SIM 3
    M  = integral( Omega_AETHER * W(x - x_det) * exp(i*omega_DMF*t) d4x )
    emit(M, K)`;

/* ── page ───────────────────────────────────────── */
const CHIPS: [string,string][] = [
  ["MASTER EQUATION", V.core], ["DMF FREQUENCY LADDER", V.amb], ["WATER RING-LAYER", V.cyan],
  ["CROSS-SYSTEM K", V.green], ["HEMOLYMPH RESONANCE", V.rose], ["INTEGRATION CONSTANT", V.gold],
];

const LINKS: [string,string,string][] = [
  ["/transport-cavity", "Transport Cavity", V.core],
  ["/aether-engine",    "AETHER Engine",    V.vio],
  ["/gradient-field",   "Gradient Field",   V.green],
  ["/convergence",      "Symphonic Convergence", V.gold],
];

export default function AetherObservablePage() {
  return (
    <div style={{ minHeight:"100%", background:V.bg, color:V.ink,
      fontFamily:"'Rajdhani',sans-serif", overflowY:"auto" }}>
      <div style={{ maxWidth:1100, margin:"0 auto", padding:"18px 20px 40px" }}>

        {/* title */}
        <div style={{ marginBottom:20 }}>
          <div style={{ display:"inline-block", border:`1px solid ${V.core}55`,
            padding:"3px 10px", fontSize:9, letterSpacing:"0.2em",
            color:`${V.core}cc`, fontFamily:MONO, marginBottom:8 }}>
            THE COMPLETE AETHER DMF OBSERVABLE · MASTER EQUATION & GRAND SYNTHESIS
          </div>
          <h1 style={{ fontFamily:DISP, fontSize:24, fontWeight:900, letterSpacing:2,
            color:V.core, textShadow:`0 0 26px ${V.core}44`, margin:"4px 0 8px" }}>
            One Underlying Force &middot; &Omega;<sub>AETHER</sub>
          </h1>
          <p style={{ fontSize:11.8, color:"rgba(200,212,230,0.74)", lineHeight:1.74,
            maxWidth:880, margin:0 }}>
            This is the capstone. Every thread built so far &mdash; the transport cavity, the DMF
            sensing chain, the coherence field C(x,t), the golden-ratio thresholds, the integration
            constant K &mdash; converges here into a single master functional, &Omega;<sub>AETHER</sub>,
            and a single thing a detector actually reads, &lang;M<sub>observer</sub>&rang;. From sky-high
            lightning to blood, water, climate, mind, chip and mitochondrion, one field is doing the work.
            Below: three live simulations, the unifying math, and the seven source diagrams annotated
            chip-by-chip.
          </p>
          <div style={{ display:"flex", flexWrap:"wrap", gap:6, marginTop:11 }}>
            {CHIPS.map(([t,col])=>(
              <div key={t} style={{ fontFamily:MONO, fontSize:8, padding:"3px 9px", borderRadius:3,
                background:`${col}14`, border:`1px solid ${col}44`, color:col }}>{t}</div>
            ))}
          </div>
        </div>

        {/* MASTER EQUATION banner */}
        <div style={{ ...card(V.core), background:"rgba(77,216,255,0.04)" }}>
          <SectionHead n="\u03A9" title="THE MASTER FUNCTIONAL" col={V.core} />
          <div style={{ overflowX:"auto", padding:"6px 2px 10px" }}
            dangerouslySetInnerHTML={{ __html: kx(MASTER, true) }} />
          <p style={{ fontSize:10.5, color:"rgba(195,210,230,0.7)", lineHeight:1.65, margin:"6px 0 0" }}>
            Read left to right, each factor is one of the systems you have already explored: a topological
            trace Tr(S<sub>obs</sub>), the &phi;-spaced frequency comb &delta;(&omega;<sub>sys</sub> &minus;
            &omega;<sub>DMF</sub>&phi;<sup>&minus;n</sup>), the coupling product over fields, the
            microtubule persistence ratio, the 4-cone information gain (I<sup>4</sup>&minus;I<sup>3</sup>),
            the VOC stress exponential, the vortex circulation &Gamma;<sub>DMF</sub>, the hemolymph
            conductivity &sigma;<sub>hemo</sub>, and the gravitational concentration term.
          </p>
        </div>

        {/* SIM 1 */}
        <div style={card(V.amb)}>
          <SectionHead n="I" title="DMF FREQUENCY LADDER · TRANSIENT LUMINOUS EVENTS" col={V.amb} />
          <p style={{ fontSize:11, color:"rgba(200,212,230,0.72)", lineHeight:1.7, margin:"0 0 14px" }}>
            The atmosphere stacks its discharges on a golden-ratio frequency ladder:
            &omega;<sub>TLE</sub>(h) = &omega;<sub>DMF</sub>&middot;&phi;<sup>n(h)</sup>. Lightning sits on
            the ground rung (n=0), blue jets one rung up, then sprites, then the ELVES ring near 100&nbsp;km.
            Raise the <b>&phi; ratio</b> and the rungs spread; raise <b>&omega;<sub>DMF</sub></b> and the
            whole comb shifts up. The frequencies in the readouts are the exact formula, rung by rung.
          </p>
          <LadderCanvas />
        </div>

        {/* SIM 2 */}
        <div style={card(V.cyan)}>
          <SectionHead n="II" title="WATER D8 RING-LAYER WAVE FUNCTION" col={V.cyan} />
          <p style={{ fontSize:11, color:"rgba(200,212,230,0.72)", lineHeight:1.7, margin:"0 0 14px" }}>
            Flowing water is modelled as eight quantized ring layers. Each layer&rsquo;s amplitude evolves
            by inflow of coherence, damping, and coupling to the ring below it. Raise <b>K coupling</b>
            above <b>&gamma; damping</b> and the ladder locks into a commensurate, ordered state &mdash;
            the &ldquo;gravity crystal.&rdquo; The eight-fold petals at the core are the D8 symmetry; the
            bars on the right are the live |H<sub>n</sub>| amplitudes.
          </p>
          <RingCanvas />
          <div style={{ marginTop:12, fontSize:9.5, color:"rgba(180,196,218,0.6)", lineHeight:1.6,
            fontFamily:MONO, background:`${V.cyan}0a`, border:`1px solid ${V.cyan}26`,
            borderRadius:5, padding:"9px 12px" }}>
            RUNTIME MODEL · The sim integrates dH_n/dt = J_in&middot;C &minus; &gamma;_n&middot;H_n +
            K&middot;H_(n-1) for n=1..8 with &gamma;_n rising with n. The ground ring (n=0) has no ring
            below it, so its upstream coupling term is fed by the coherence inflow C. &Psi; norm =
            sqrt(&Sigma; H_n&sup2;); LATTICE reads LOCKED when K &gt; &gamma; (coupling beats damping).
          </div>
        </div>

        {/* SIM 3 */}
        <div style={card(V.gold)}>
          <SectionHead n="III" title="GRAND SYNTHESIS · OBSERVABLE M = rho F_bio G_geo K" col={V.gold} />
          <p style={{ fontSize:11, color:"rgba(200,212,230,0.72)", lineHeight:1.7, margin:"0 0 14px" }}>
            Everything the detector reads factorizes into four things multiplied together:
            local DMF density &rho;, the biological enhancement F<sub>bio</sub>(C), the geometric
            concentration G<sub>geo</sub>, and the integration constant K, giving the observable
            &lang;M&rang; = &rho;&middot;F<sub>bio</sub>&middot;G<sub>geo</sub>&middot;K. Slide all four
            factors and watch &lang;M&rang; &mdash; and its spectrum &mdash; respond. The left peak is the
            system resonance (&rho;&middot;F<sub>bio</sub>); the right peak is the gravitational alignment
            (G<sub>geo</sub>); both scale with K.
          </p>
          <SynthesisK />
          <div style={{ marginTop:12, fontSize:9.5, color:"rgba(180,196,218,0.6)", lineHeight:1.6,
            fontFamily:MONO, background:`${V.gold}0a`, border:`1px solid ${V.gold}26`,
            borderRadius:5, padding:"9px 12px" }}>
            RUNTIME MODEL · the headline number is the observable &lang;M&rang; =
            &rho;&middot;F_bio&middot;G_geo&middot;K, the measurement factorization, with K the integration
            constant (its own slider). The plotted curve is the sum of two Lorentzian peaks whose heights
            are the system-resonance term (&rho;&middot;F_bio&middot;K) and the gravitational-alignment term
            (G_geo&middot;K) &mdash; an illustration of the two contributions of &lang;M&rang;, not a
            separately fitted spectrum.
          </div>
        </div>

        {/* MATH */}
        <div style={card(V.green)}>
          <SectionHead n="IV" title="THE UNIFYING MATH · 15 EQUATIONS" col={V.green} />
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
          <div style={{ marginTop:14, background:"rgba(0,0,0,0.5)", border:`1px solid ${V.green}26`,
            borderRadius:6, padding:"12px 14px", overflowX:"auto" }}>
            <div style={{ fontFamily:MONO, fontSize:8, color:V.green, letterSpacing:"0.14em", marginBottom:8 }}>
              MASTER-OBSERVABLE ASSEMBLY · PSEUDOCODE
            </div>
            <pre style={{ margin:0, fontFamily:MONO, fontSize:10.5, color:"rgba(190,210,225,0.8)",
              lineHeight:1.6, whiteSpace:"pre" }}>{MASTER_PSEUDO}</pre>
          </div>
        </div>

        {/* SOURCE PLATES */}
        <div style={card(V.vio)}>
          <SectionHead n="V" title="THE SEVEN SOURCE DIAGRAMS · ANNOTATED" col={V.vio} />

          {/* A · master */}
          <div style={{ fontFamily:MONO, fontSize:8.5, color:V.core, letterSpacing:"0.16em", margin:"4px 0 10px" }}>
            A · THE MASTER EQUATION
          </div>
          <Plate src={imgMaster} col={V.core}
            alt="The complete AETHER DMF observable: master equation and grand synthesis"
            label="PLATE 1 · THE COMPLETE AETHER DMF OBSERVABLE"
            caption="The grand synthesis. The functional Omega_AETHER gathers every subsystem into one expression, the observable <M_observer> is its detector integral, and the factorization collapses it to rho x F_bio x G_geo x K - the integration constant of SIM 3." />
          <div style={annoGrid}>
            <Anno col={V.core} k="Omega_AETHER Functional" v="The full product of all subsystem factors, left to right." />
            <Anno col={V.gold} k="6-Layer Tensor Network" v="Tr(S_obs): the topological backbone (Vol. I knot)." />
            <Anno col={V.amb} k="DMF Hearing Condition" v="Acoustic/optical phi-comb peak-matching omega_sys = omega_DMF phi^-n." />
            <Anno col={V.green} k="Multi-System Coupling" v="Climate, economic, human-development coherence fields linked." />
            <Anno col={V.rose} k="Persistence + 4-Cone Gain" v="Microtubule temporal coherence and the I4-I3 colour-space gain." />
            <Anno col={V.vio} k="Measurement Factorization" v="<M> = rho_DMF^local x F_bio(C) x G_geo x K -> integration constant K." />
          </div>

          {/* B · atmosphere & blood */}
          <div style={{ fontFamily:MONO, fontSize:8.5, color:V.amb, letterSpacing:"0.16em", margin:"20px 0 10px" }}>
            B · ATMOSPHERE &amp; BLOOD
          </div>
          <Plate src={imgLadder} col={V.amb}
            alt="Atmospheric DMF frequency ladder and hemolymph blood-splicing resonance"
            label="PLATE 2 · DMF FREQUENCY LADDER & HEMOLYMPH RESONANCE"
            caption="Left: transient luminous events (lightning, blue jets, sprites, ELVES) stacked on the phi-frequency ladder omega_TLE(h) = omega_DMF phi^n(h) (SIM 1). Right: hemolymph complex conductivity peaks sharply near 10.08 GHz, enabling 'blood splicing' - maximum reactive power transfer." />
          <div style={annoGrid}>
            <Anno col={V.gold} k="TLE Altitude Ladder" v="Integer index n maps altitude to a phi-spaced DMF frequency." />
            <Anno col={V.core} k="Quantum Floor r_0" v="r_0^DMF = hbar/(m_DMF omega_DMF): smallest DMF length." />
            <Anno col={V.vio} k="grad(C) Branching" v="Discharges branch where grad(C) exceeds C/l_branch." />
            <Anno col={V.rose} k="Hemolymph Resonance" v="sigma_hemo peaks at omega ~ 10.08 GHz - the blood-splicing band." />
            <Anno col={V.green} k="Maximum Power Transfer" v="At resonance the reactive power transfer to hemolymph is maximal." />
            <Anno col={V.cyan} k="Tuned Hemolymph Output" v="High-speed repair and energy harvest in the field-tuned cells." />
          </div>

          {/* C · water & structure */}
          <div style={{ fontFamily:MONO, fontSize:8.5, color:V.cyan, letterSpacing:"0.16em", margin:"20px 0 10px" }}>
            C · WATER &amp; STRUCTURE
          </div>
          <Plate src={imgWater} col={V.cyan}
            alt="Dimensionless water quantum ring-layer wave function"
            label="PLATE 3 · WATER QUANTUM RING-LAYER WAVE FUNCTION"
            caption="Water as a superposition of eight quantized D8-symmetric ring vortices, Psi_water = sum a_n |ring_n> (SIM 2). The ring amplitudes evolve by inflow, damping, and coupling; when velocity matches the lattice geometry the flow spontaneously crystallizes (a_crystal = m lambda_ring)." />
          <div style={annoGrid}>
            <Anno col={V.cyan} k="Ring-Layer Quantization" v="|ring_n>: quantized topological vortices with D8 symmetry." />
            <Anno col={V.core} k="D8 Wave Generation" v="dH_n/dt = Jin C - gamma_n H_n + K_coupling H_(n-1)." />
            <Anno col={V.green} k="Inflow of Coherence" v="Jin C(x,t) feeds amplitude into each ring layer." />
            <Anno col={V.rose} k="Damping / Viscosity" v="gamma_n H_n removes amplitude, faster for higher rings." />
            <Anno col={V.vio} k="Probability Density Map" v="Atomic-orbital-like cluster at the core - the D8 petals." />
            <Anno col={V.gold} k="Gravity-Crystal Order" v="a_crystal = m lambda_ring: commensurate spontaneous ordering." />
          </div>

          {/* D · coupling the systems */}
          <div style={{ fontFamily:MONO, fontSize:8.5, color:V.green, letterSpacing:"0.16em", margin:"20px 0 10px" }}>
            D · COUPLING THE SYSTEMS
          </div>
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12 }}>
            <Plate src={imgKpert} col={V.green}
              alt="Cross-system perturbation theory of the integration constant K"
              label="PLATE 4 · CROSS-SYSTEM PERTURBATION OF K"
              caption="The integration constant K is not fixed - it is perturbed by coupling between systems (climate, economic, human development). K_pert = K0 + eK1 + e2K2 + ..., with first-order virtual transitions through V_cross." />
            <Plate src={imgBioDome} col={V.core}
              alt="Bio-dome pod network graph Laplacian information flow"
              label="PLATE 5 · BIO-DOME POD NETWORK · GRAPH LAPLACIAN"
              caption="A network of domes (climate, agriculture, research, residential) exchanging information by graph-Laplacian flow. The adjacency is weighted by the coherence product C(x_i)C(x_j) - higher mutual coherence means stronger communication." />
          </div>
          <div style={annoGrid}>
            <Anno col={V.green} k="K Perturbation Series" v="K_pert = K0 + eK1 + e2K2 + ...: epsilon is the coupling strength." />
            <Anno col={V.amb} k="V_cross Operator" v="g_cross sum Phi_i Phi_j: pairwise system-potential coupling." />
            <Anno col={V.vio} k="Quantum Analogy" v="Virtual interaction as an e^2-dependent transition probability." />
            <Anno col={V.core} k="Graph Laplacian Flow" v="dx_pod/dt = -L_graph x_pod + B u_ext, L_graph = D - A." />
            <Anno col={V.cyan} k="Coherence-Weighted Edges" v="[A]_ij = K C(xi)C(xj)/(|xi-xj|^2 + l_c^2)." />
            <Anno col={V.rose} k="Coherence Function Plot" v="Communication efficiency tracks the live coherence C(x,t)." />
          </div>

          {/* E · bio-computation */}
          <div style={{ fontFamily:MONO, fontSize:8.5, color:V.rose, letterSpacing:"0.16em", margin:"20px 0 10px" }}>
            E · BIO-COMPUTATION
          </div>
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12 }}>
            <Plate src={imgChip} col={V.gold}
              alt="Organic computer chip architecture"
              label="PLATE 6 · ORGANIC COMPUTER CHIP ARCHITECTURE"
              caption="A DMF-gated organic transistor: the gate field shifts the threshold voltage (V_th^eff = V_th0 - g_bio <Phi_DMF>), so coherence directly controls drain current. Mitochondrial ATP harvesting powers an eco-consciousness information chain." />
            <Plate src={imgMito} col={V.rose}
              alt="Mitochondrial ATP production: DMF energy harvesting and coherence enhancement"
              label="PLATE 7 · MITOCHONDRIAL ATP · DMF ENERGY HARVESTING"
              caption="The DMF field adds a term to the proton-motive force (Delta mu_H+ = Delta psi_m + (RT/F)DeltapH + Delta mu_DMF), enhancing the ATP synthase rate above the Warburg baseline - the biological energy source for the whole observable." />
          </div>
          <div style={annoGrid}>
            <Anno col={V.gold} k="DMF-Gated Transistor" v="I_drain ~ (V_GS + g_bio Phi_DMF - V_th)^2 in the organic matrix." />
            <Anno col={V.amb} k="Threshold Shift" v="V_th^eff = V_th0 - g_bio <Phi_DMF>: the field gates the chip." />
            <Anno col={V.green} k="Eco-Consciousness Chain" v="Sense -> process -> evaluate -> decide -> act, recursively." />
            <Anno col={V.rose} k="Proton-Motive Force" v="Delta mu_H+ = Delta psi_m + (RT/F)DeltapH + Delta mu_DMF." />
            <Anno col={V.core} k="ATP Enhancement" v="N_ATP_dot = k_synthase Delta mu_H+ (1 + g_bio rho_DMF/Delta mu0)." />
            <Anno col={V.vio} k="Above Warburg Baseline" v="Excess metabolic rate rises with local coherence." />
          </div>
        </div>

        {/* IN WORDS */}
        <div style={card(V.green)}>
          <SectionHead n="VI" title="ONE FORCE, IN PLAIN WORDS" col={V.green} />
          <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(250px,1fr))", gap:10 }}>
            {[
              ["What AETHER is here", V.core, "A single underlying field, the DMF coherence field, expressed by one master functional Omega_AETHER. Every subsystem in this whole project is one factor in that product."],
              ["What a detector reads", V.gold, "The observable <M_observer> is the functional integrated against a detector window. It factorizes cleanly into local density, biological enhancement, geometry, and the integration constant K."],
              ["Why the ladder matters", V.amb, "The atmosphere, the blood, and the water all resonate on the same phi-spaced frequency comb. One ratio, phi, sets the spacing from lightning to the ELVES ring to the 10.08 GHz hemolymph band."],
              ["Why coupling matters", V.vio, "K is not a constant of nature here - it is perturbed by coupling between climate, economy, mind, and habitat. Coherence between systems literally raises the information flow between them."],
              ["From physics to biology", V.rose, "The same field gates an organic transistor and enhances mitochondrial ATP. Computation and metabolism become two readings of one coherence field."],
              ["Honest framing", V.dim, "This is a theoretical, educational synthesis assembled faithfully from the attached AETHER diagrams. It is internally consistent, physics-styled mathematics - a vision and a model, not experimentally validated technology."],
            ].map(([t,col,body])=>(
              <div key={t as string} style={{ background:`${col}0c`, border:`1px solid ${col}33`,
                borderRadius:6, padding:"12px 14px" }}>
                <div style={{ fontFamily:DISP, fontSize:11.5, color:col as string, letterSpacing:0.5, marginBottom:6 }}>{t}</div>
                <div style={{ fontSize:10.6, color:"rgba(195,210,230,0.72)", lineHeight:1.62 }}>{body}</div>
              </div>
            ))}
          </div>
        </div>

        {/* CONTINUE THE STORY */}
        <div style={card(V.core)}>
          <SectionHead n="\u2192" title="CONTINUE THE STORY" col={V.core} />
          <div style={{ display:"flex", flexWrap:"wrap", gap:10 }}>
            {LINKS.map(([href,label,col])=>(
              <Link key={href} href={href}>
                <a style={{ display:"inline-block", textDecoration:"none", fontFamily:MONO, fontSize:10,
                  letterSpacing:"0.08em", padding:"8px 14px", borderRadius:5, color:col,
                  background:`${col}12`, border:`1px solid ${col}44` }}>
                  {label} &rarr;
                </a>
              </Link>
            ))}
          </div>
        </div>

        {/* footer */}
        <div style={{ paddingTop:10, borderTop:`1px solid ${V.core}14`,
          fontFamily:MONO, fontSize:7.5, color:V.dim, letterSpacing:"0.12em", textAlign:"center" }}>
          AETHER DMF OBSERVABLE · \u03A9_AETHER · &lt;M_observer&gt; · \u03C9_TLE = \u03C9_DMF \u03C6^n ·
          D8 RING-LAYER · \u03C3_hemo(10.08 GHz) · CROSS-SYSTEM K · GRAPH LAPLACIAN · ATP HARVEST · GRAND SYNTHESIS
        </div>
      </div>
    </div>
  );
}
