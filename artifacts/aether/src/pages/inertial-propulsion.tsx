import { useEffect, useRef, useState } from "react";
import { Link } from "wouter";
import katex from "katex";
import "katex/dist/katex.min.css";

/* ==========================================================================
   INERTIAL TUBE DRIVE
   The buildable propulsion layer for the Air Nanotube Transport. Instead of a
   single pressure shot, the pod crawls: an inchworm gait that switches plate
   weight between a magnetically-adhered anchor foot and a hydroplaning glide
   foot. The reaction mass sets how much momentum each stroke delivers, the
   magnetic adhesion sets how hard you can stroke before the anchor slips, and
   so there is a true optimal cadence that maximises speed. The same tube,
   carrying air and harvested energy, doubles as a bioreactor that grows
   material on its inner wall. Three live simulations + the full math.
   ========================================================================== */

const V = {
  bg:"#04060E", core:"#4DD8FF", gold:"#E0A03A", amb:"#FF9933", vio:"#9B6CFF",
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

function SectionHead({ n, title, col }: { n:string; title:string; col:string }) {
  return (
    <div style={{ display:"flex", alignItems:"baseline", gap:12, marginBottom:14 }}>
      <div style={{ fontFamily:DISP, fontSize:"1.05rem", color:col, letterSpacing:"0.16em" }}>{n}</div>
      <div style={{ flex:1, height:1, background:`linear-gradient(90deg,${col}55,transparent)` }} />
      <div style={{ fontFamily:MONO, fontSize:9, color:col, letterSpacing:"0.14em" }}>{title}</div>
    </div>
  );
}

const card = (col:string): React.CSSProperties => ({
  background:"rgba(0,0,0,0.42)", border:`1px solid ${col}22`, borderRadius:6,
  padding:"16px 18px", marginBottom:16,
});
const panel = (col:string): React.CSSProperties => ({
  background:"rgba(255,255,255,0.015)", border:`1px solid ${col}26`, borderRadius:8, padding:"14px 16px",
});

/* ════════════════════════════════════════════════════════════════════════
   SIM 1 · Inertial Mass to Speed optimiser
   F_in = 2*pi^2 * m * L * f^2 ; g = min(1, F_mag/F_in) ; v = L*f*g
   f* = (1/2pi) sqrt(2 F_mag/(m L)) ; v_max = L f*
   ════════════════════════════════════════════════════════════════════════ */
function MassSpeedCanvas() {
  const cvs = useRef<HTMLCanvasElement | null>(null);

  const [m,  setM]  = useState(2.0);   // reaction mass (norm)
  const [L,  setL]  = useState(0.6);   // stride (norm)
  const [fm, setFm] = useState(40);    // magnetic adhesion force (norm)
  const mRef = useRef(m);  useEffect(()=>{mRef.current=m;},[m]);
  const lRef = useRef(L);  useEffect(()=>{lRef.current=L;},[L]);
  const fRef = useRef(fm); useEffect(()=>{fRef.current=fm;},[fm]);

  const fStarRef = useRef<HTMLSpanElement>(null);
  const vMaxRef  = useRef<HTMLSpanElement>(null);
  const vNowRef  = useRef<HTMLSpanElement>(null);
  const regRef   = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const canvas = cvs.current; if (!canvas) return;
    const reduce = prefersReduced();
    let raf = 0; let t = 0;
    const FMAXHZ = 5;

    const speedAt = (f:number, mv:number, Lv:number, Fmagv:number) => {
      if (f <= 0) return 0;
      const Fin = 2*Math.PI*Math.PI*mv*Lv*f*f;
      const g = Math.min(1, Fmagv/Math.max(Fin, 1e-6));
      return Lv*f*g;
    };

    const draw = () => {
      const { w, h } = fitCanvas(canvas, 300);
      const ctx = canvas.getContext("2d"); if (!ctx) return;
      const mv = mRef.current, Lv = lRef.current, Fmagv = fRef.current;
      ctx.clearRect(0,0,w,h);

      const padL = 48, padB = 30, padT = 18, padR = 16;
      const x0 = padL, x1 = w - padR, y0 = h - padB, y1 = padT;

      // optimum
      const fStar = (1/(2*Math.PI))*Math.sqrt(2*Fmagv/Math.max(mv*Lv, 1e-6));
      const vMax  = speedAt(fStar, mv, Lv, Fmagv);
      const vScale = Math.max(vMax*1.25, 0.2);

      // grid + axes
      ctx.strokeStyle = "rgba(120,140,170,0.18)"; ctx.lineWidth = 1;
      for (let i=1;i<=4;i++){ const gy=y0-(i/4)*(y0-y1); ctx.beginPath(); ctx.moveTo(x0,gy); ctx.lineTo(x1,gy); ctx.stroke(); }
      ctx.strokeStyle = "rgba(120,140,170,0.45)";
      ctx.beginPath(); ctx.moveTo(x0,y0); ctx.lineTo(x1,y0); ctx.moveTo(x0,y0); ctx.lineTo(x0,y1); ctx.stroke();
      ctx.fillStyle = "rgba(150,170,200,0.6)"; ctx.font = `8px ${MONO}`;
      ctx.fillText("cadence f \u2192", x1-66, y0+16);
      ctx.save(); ctx.translate(13,(y0+y1)/2); ctx.rotate(-Math.PI/2);
      ctx.fillText("net speed v", -28, 0); ctx.restore();

      // speed curve
      ctx.beginPath();
      for (let i=0;i<=240;i++){
        const f = (i/240)*FMAXHZ;
        const v = speedAt(f, mv, Lv, Fmagv);
        const px = x0 + (f/FMAXHZ)*(x1-x0);
        const py = y0 - Math.min(v/vScale,1)*(y0-y1);
        if (i===0) ctx.moveTo(px,py); else ctx.lineTo(px,py);
      }
      ctx.strokeStyle = V.core; ctx.lineWidth = 2;
      ctx.shadowColor = V.core; ctx.shadowBlur = 10; ctx.stroke(); ctx.shadowBlur = 0;

      // optimum marker
      if (fStar > 0 && fStar < FMAXHZ) {
        const px = x0 + (fStar/FMAXHZ)*(x1-x0);
        const py = y0 - Math.min(vMax/vScale,1)*(y0-y1);
        ctx.strokeStyle = `${V.gold}99`; ctx.setLineDash([4,4]); ctx.lineWidth = 1;
        ctx.beginPath(); ctx.moveTo(px,y0); ctx.lineTo(px,py); ctx.stroke(); ctx.setLineDash([]);
        ctx.fillStyle = V.gold; ctx.beginPath(); ctx.arc(px,py,4,0,Math.PI*2); ctx.fill();
        ctx.fillStyle = V.gold; ctx.font = `8px ${MONO}`; ctx.fillText("f*  best speed", px-8, py-8);
      }

      // sweeping operating cursor
      if (!reduce) t += 0.01;
      const fc = (0.5 + 0.5*Math.sin(t))*FMAXHZ;
      const vc = speedAt(fc, mv, Lv, Fmagv);
      const cpx = x0 + (fc/FMAXHZ)*(x1-x0);
      const cpy = y0 - Math.min(vc/vScale,1)*(y0-y1);
      ctx.strokeStyle = `${V.rose}aa`; ctx.lineWidth = 1;
      ctx.beginPath(); ctx.moveTo(cpx,y0); ctx.lineTo(cpx,y1); ctx.stroke();
      ctx.fillStyle = V.rose; ctx.beginPath(); ctx.arc(cpx,cpy,3.5,0,Math.PI*2); ctx.fill();

      // regime: slipping if cursor past f*
      const slipping = fc > fStar;
      if (fStarRef.current) fStarRef.current.textContent = fStar.toFixed(2);
      if (vMaxRef.current)  vMaxRef.current.textContent  = vMax.toFixed(3);
      if (vNowRef.current)  vNowRef.current.textContent  = vc.toFixed(3);
      if (regRef.current) {
        regRef.current.textContent = slipping ? "ANCHOR SLIPPING" : "FULL GRIP";
        regRef.current.style.color = slipping ? V.rose : V.green;
      }

      raf = requestAnimationFrame(draw);
    };
    draw();
    return () => cancelAnimationFrame(raf);
  }, []);

  return (
    <div style={{ display:"grid", gridTemplateColumns:"1fr 240px", gap:14 }}>
      <div style={{ borderRadius:8, overflow:"hidden", border:`1px solid ${V.core}26`, background:"#04050a" }}>
        <canvas ref={cvs} style={{ width:"100%", height:300, display:"block" }} />
      </div>
      <div style={panel(V.core)}>
        <Slider label="REACTION MASS m" value={m} min={0.4} max={6} step={0.1} col={V.gold}
          onChange={setM} fmt={(v)=>v.toFixed(1)} />
        <Slider label="STRIDE L" value={L} min={0.2} max={1.2} step={0.02} col={V.green}
          onChange={setL} fmt={(v)=>v.toFixed(2)} />
        <Slider label="MAGNETIC ADHESION F_mag" value={fm} min={5} max={120} step={1} col={V.vio}
          onChange={setFm} fmt={(v)=>v.toFixed(0)} />
        <div style={{ display:"grid", gap:7, marginTop:10 }}>
          <Stat label="OPTIMAL CADENCE f*" col={V.gold} vref={fStarRef} />
          <Stat label="MAX SPEED v_max"    col={V.core} vref={vMaxRef} />
          <Stat label="SPEED AT CURSOR"    col={V.rose} vref={vNowRef} />
          <Stat label="ANCHOR REGIME"      col={V.green} vref={regRef} />
        </div>
      </div>
    </div>
  );
}

function Stat({ label, col, vref }: { label:string; col:string; vref:React.RefObject<HTMLSpanElement | null> }) {
  return (
    <div style={{ padding:"7px 10px", borderRadius:5, background:`${col}0C`, border:`1px solid ${col}30` }}>
      <div style={{ fontFamily:MONO, fontSize:7, color:col, letterSpacing:"0.12em", marginBottom:3 }}>{label}</div>
      <span ref={vref} style={{ fontFamily:MONO, fontSize:"0.9rem", color:col }}>--</span>
    </div>
  );
}

/* ════════════════════════════════════════════════════════════════════════
   SIM 2 · Inchworm gait : plate-weight switching + magnetic adhesion +
   hydroplanation. mu_eff = mu0 / (1 + p_film/p0)
   ════════════════════════════════════════════════════════════════════════ */
function GaitCanvas() {
  const cvs = useRef<HTMLCanvasElement | null>(null);

  const [freq, setFreq] = useState(0.8);   // gait cycles per second
  const [film, setFilm] = useState(0.6);   // hydroplanation film pressure 0..1
  const [adh,  setAdh]  = useState(0.7);   // magnetic adhesion 0..1
  const [depth,setDepth]= useState(0.5);   // regulatory depth 0..1 (sets ambient pressure)
  const fRef = useRef(freq);  useEffect(()=>{fRef.current=freq;},[freq]);
  const flRef= useRef(film);  useEffect(()=>{flRef.current=film;},[film]);
  const aRef = useRef(adh);   useEffect(()=>{aRef.current=adh;},[adh]);
  const dRef = useRef(depth); useEffect(()=>{dRef.current=depth;},[depth]);

  const phaseRef = useRef<HTMLSpanElement>(null);
  const muRef    = useRef<HTMLSpanElement>(null);
  const distRef  = useRef<HTMLSpanElement>(null);
  const gripRef  = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const canvas = cvs.current; if (!canvas) return;
    const reduce = prefersReduced();
    let raf = 0; let u = 0; let worldX = 0;

    const draw = () => {
      const { w, h } = fitCanvas(canvas, 240);
      const ctx = canvas.getContext("2d"); if (!ctx) return;
      const fv = fRef.current, flv = flRef.current, av = aRef.current, dv = dRef.current;
      ctx.clearRect(0,0,w,h);

      const tubeY = h*0.52, tubeR = 46;
      // ambient pressure from depth feeds both film lift and adhesion budget
      const pAmb = 0.3 + 0.7*dv;
      const muEff = 0.4 / (1 + (flv*pAmb)*6);        // hydroplanation friction reduction
      const gripCap = Math.min(1, av*pAmb*1.4);      // adhesion budget vs cadence demand
      const demand = Math.min(1, fv/1.4);            // faster cadence demands more grip
      const grip = Math.max(0, Math.min(1, gripCap - 0.6*Math.max(0, demand-gripCap)));

      const dt = reduce ? 0 : 0.016;
      u += dt*fv; if (u >= 1) u -= 1;
      // advance the world (ribs scroll left) proportional to speed*grip
      const stride = 70;
      worldX += stride*fv*grip*dt;

      // tube walls
      ctx.fillStyle = "rgba(6,12,22,0.9)";
      ctx.fillRect(0, tubeY-tubeR, w, tubeR*2);
      ctx.strokeStyle = `${V.core}44`; ctx.lineWidth = 2;
      ctx.beginPath(); ctx.moveTo(0,tubeY-tubeR); ctx.lineTo(w,tubeY-tubeR);
      ctx.moveTo(0,tubeY+tubeR); ctx.lineTo(w,tubeY+tubeR); ctx.stroke();
      // ribs (scroll to convey forward motion)
      ctx.strokeStyle = `${V.dim}88`; ctx.lineWidth = 1;
      const ribGap = 36;
      for (let rx = -((worldX) % ribGap); rx < w; rx += ribGap) {
        ctx.beginPath(); ctx.moveTo(rx, tubeY-tubeR+4); ctx.lineTo(rx, tubeY-tubeR+12); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(rx, tubeY+tubeR-12); ctx.lineTo(rx, tubeY+tubeR-4); ctx.stroke();
      }

      // worm geometry: extend phase (u<0.5) front slides, contract (u>=0.5) rear slides
      const cx = w*0.5;
      const Lmin = 56, Lmax = 120;
      const ext = u < 0.5 ? (u/0.5) : (1 - (u-0.5)/0.5);   // 0..1..0
      const bodyLen = Lmin + (Lmax-Lmin)*ext;
      const rearX = cx - bodyLen/2;
      const frontX = cx + bodyLen/2;
      const extendPhase = u < 0.5;   // extend: rear anchored & front glides ; contract: front anchored & rear glides
      const footY = tubeY + tubeR - 8;

      // body (actuator)
      ctx.strokeStyle = V.gold; ctx.lineWidth = 10; ctx.lineCap = "round";
      ctx.shadowColor = V.gold; ctx.shadowBlur = 8;
      ctx.beginPath(); ctx.moveTo(rearX, tubeY); ctx.lineTo(frontX, tubeY); ctx.stroke();
      ctx.shadowBlur = 0; ctx.lineCap = "butt";

      const foot = (fx:number, anchored:boolean) => {
        // plate
        ctx.fillStyle = anchored ? V.vio : V.core;
        ctx.fillRect(fx-13, tubeY-9, 26, 18);
        if (anchored) {
          // magnetic adhesion glow + clamp pegs to wall
          ctx.strokeStyle = `${V.vio}cc`; ctx.lineWidth = 2;
          ctx.shadowColor = V.vio; ctx.shadowBlur = 14*av;
          ctx.beginPath(); ctx.moveTo(fx, tubeY+9); ctx.lineTo(fx, footY+6); ctx.stroke();
          ctx.shadowBlur = 0;
          ctx.fillStyle = `${V.vio}aa`; ctx.font = `7px ${MONO}`; ctx.fillText("MAG ON", fx-13, tubeY-13);
        } else {
          // hydroplanation film under the gliding plate
          const fa = 0.25 + 0.6*flv;
          ctx.fillStyle = `rgba(77,216,255,${fa})`;
          ctx.fillRect(fx-15, tubeY+9, 30, 4);
          ctx.fillStyle = `${V.core}aa`; ctx.font = `7px ${MONO}`; ctx.fillText("GLIDE", fx-10, tubeY-13);
        }
      };
      foot(rearX, extendPhase);
      foot(frontX, !extendPhase);

      // SLIP flash on the anchored foot when grip is low
      if (grip < 0.45) {
        const sx = extendPhase ? rearX : frontX;
        ctx.fillStyle = `${V.rose}cc`; ctx.font = `8px ${MONO}`;
        ctx.fillText("SLIP", sx-9, tubeY+30);
      }

      // readouts
      const phaseName = u < 0.5 ? "EXTEND \u00b7 rear anchored" : "CONTRACT \u00b7 front anchored";
      if (phaseRef.current) phaseRef.current.textContent = phaseName;
      if (muRef.current)    muRef.current.textContent    = muEff.toFixed(3);
      if (distRef.current)  distRef.current.textContent  = (worldX/100).toFixed(2);
      if (gripRef.current) {
        gripRef.current.textContent = (grip*100).toFixed(0) + "%";
        gripRef.current.style.color = grip < 0.45 ? V.rose : V.green;
      }

      raf = requestAnimationFrame(draw);
    };
    draw();
    return () => cancelAnimationFrame(raf);
  }, []);

  return (
    <div style={{ display:"grid", gridTemplateColumns:"1fr 240px", gap:14 }}>
      <div style={{ borderRadius:8, overflow:"hidden", border:`1px solid ${V.gold}26`, background:"#04050a" }}>
        <canvas ref={cvs} style={{ width:"100%", height:240, display:"block" }} />
      </div>
      <div style={panel(V.gold)}>
        <Slider label="GAIT CADENCE" value={freq} min={0.2} max={1.6} step={0.02} col={V.gold}
          onChange={setFreq} fmt={(v)=>v.toFixed(2)} />
        <Slider label="HYDROPLANE FILM p_film" value={film} min={0} max={1} step={0.01} col={V.core}
          onChange={setFilm} fmt={(v)=>v.toFixed(2)} />
        <Slider label="MAGNETIC ADHESION" value={adh} min={0} max={1} step={0.01} col={V.vio}
          onChange={setAdh} fmt={(v)=>v.toFixed(2)} />
        <Slider label="REGULATORY DEPTH" value={depth} min={0} max={1} step={0.01} col={V.green}
          onChange={setDepth} fmt={(v)=>v.toFixed(2)} />
        <div style={{ display:"grid", gap:7, marginTop:10 }}>
          <Stat label="GAIT PHASE"      col={V.gold} vref={phaseRef} />
          <Stat label="GLIDE FRICTION mu_eff" col={V.core} vref={muRef} />
          <Stat label="ANCHOR GRIP"     col={V.green} vref={gripRef} />
          <Stat label="DISTANCE (m)"    col={V.vio} vref={distRef} />
        </div>
      </div>
    </div>
  );
}

/* ════════════════════════════════════════════════════════════════════════
   SIM 3 · In-tube bioreactor : dB/dt = r B (1 - B/K) min(a,e)
   ════════════════════════════════════════════════════════════════════════ */
function BioreactorCanvas() {
  const cvs = useRef<HTMLCanvasElement | null>(null);

  const [r,   setR]   = useState(0.9);  // growth rate
  const [air, setAir] = useState(0.7);  // air feedstock supply 0..1
  const [eng, setEng] = useState(0.6);  // harvested energy supply 0..1
  const rRef = useRef(r);   useEffect(()=>{rRef.current=r;},[r]);
  const aRef = useRef(air); useEffect(()=>{aRef.current=air;},[air]);
  const eRef = useRef(eng); useEffect(()=>{eRef.current=eng;},[eng]);

  const bioRef   = useRef<HTMLSpanElement>(null);
  const limitRef = useRef<HTMLSpanElement>(null);
  const dblRef   = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const canvas = cvs.current; if (!canvas) return;
    const reduce = prefersReduced();
    let raf = 0;
    const K = 1.0;
    let B = 0.04;
    const hist: number[] = [];

    const draw = () => {
      const { w, h } = fitCanvas(canvas, 260);
      const ctx = canvas.getContext("2d"); if (!ctx) return;
      const rv = rRef.current, av = aRef.current, ev = eRef.current;
      ctx.clearRect(0,0,w,h);

      const limit = Math.min(av, ev);
      const dt = reduce ? 0 : 0.03;
      B += rv*B*(1 - B/K)*limit*dt;
      if (B > 0.985*K) B = 0.04;     // loop the demo
      if (!Number.isFinite(B) || B < 0.001) B = 0.04;
      hist.push(B); if (hist.length > 200) hist.shift();

      // left: growth curve
      const splitX = w*0.6;
      const padL = 44, padB = 26, padT = 16;
      const x0 = padL, x1 = splitX - 14, y0 = h - padB, y1 = padT;
      ctx.strokeStyle = "rgba(120,140,170,0.4)"; ctx.lineWidth = 1;
      ctx.beginPath(); ctx.moveTo(x0,y0); ctx.lineTo(x1,y0); ctx.moveTo(x0,y0); ctx.lineTo(x0,y1); ctx.stroke();
      ctx.fillStyle = "rgba(150,170,200,0.6)"; ctx.font = `8px ${MONO}`;
      ctx.fillText("time \u2192", x1-40, y0+15);
      ctx.save(); ctx.translate(12,(y0+y1)/2); ctx.rotate(-Math.PI/2);
      ctx.fillText("biomass B", -28, 0); ctx.restore();
      // capacity line
      ctx.strokeStyle = `${V.gold}66`; ctx.setLineDash([4,4]);
      ctx.beginPath(); ctx.moveTo(x0, y1); ctx.lineTo(x1, y1); ctx.stroke(); ctx.setLineDash([]);
      ctx.fillStyle = `${V.gold}99`; ctx.fillText("K capacity", x0+4, y1-3);
      // curve
      ctx.beginPath();
      for (let i=0;i<hist.length;i++){
        const px = x0 + (i/199)*(x1-x0);
        const py = y0 - (hist[i]/K)*(y0-y1);
        if (i===0) ctx.moveTo(px,py); else ctx.lineTo(px,py);
      }
      ctx.strokeStyle = V.green; ctx.lineWidth = 2;
      ctx.shadowColor = V.green; ctx.shadowBlur = 8; ctx.stroke(); ctx.shadowBlur = 0;

      // right: tube cross-section accreting material on the wall
      const ccx = (splitX + w)/2, ccy = h/2, Rout = Math.min((w-splitX), h)*0.36;
      ctx.strokeStyle = `${V.core}66`; ctx.lineWidth = 2;
      ctx.beginPath(); ctx.arc(ccx,ccy,Rout,0,Math.PI*2); ctx.stroke();
      // grown layer thickness proportional to B
      const grad = ctx.createRadialGradient(ccx,ccy,Rout*(1-0.7*B/K),ccx,ccy,Rout);
      grad.addColorStop(0, "rgba(55,214,122,0)");
      grad.addColorStop(1, `rgba(55,214,122,${0.25+0.5*B/K})`);
      ctx.fillStyle = grad; ctx.beginPath(); ctx.arc(ccx,ccy,Rout,0,Math.PI*2); ctx.fill();
      // inner open bore
      ctx.fillStyle = "#04060e";
      ctx.beginPath(); ctx.arc(ccx,ccy,Rout*(1-0.7*B/K),0,Math.PI*2); ctx.fill();
      // air inflow arrows
      ctx.strokeStyle = `${V.core}aa`; ctx.lineWidth = 1.5;
      for (let k=0;k<6;k++){
        const ang = (k/6)*Math.PI*2 + (reduce?0:performance.now()*0.0006);
        const ar = Rout*1.28, br = Rout*1.02;
        ctx.beginPath();
        ctx.moveTo(ccx+Math.cos(ang)*ar, ccy+Math.sin(ang)*ar);
        ctx.lineTo(ccx+Math.cos(ang)*br, ccy+Math.sin(ang)*br);
        ctx.stroke();
      }
      ctx.fillStyle = "rgba(150,170,200,0.6)"; ctx.font = `8px ${MONO}`;
      ctx.fillText("air + energy \u2192 wall growth", splitX+6, h-8);

      // doubling time t2 = ln2/(r*min(a,e))
      const t2 = (rv*limit > 1e-4) ? Math.log(2)/(rv*limit) : Infinity;
      if (bioRef.current)   bioRef.current.textContent   = (B/K*100).toFixed(1) + "%";
      if (dblRef.current)   dblRef.current.textContent   = Number.isFinite(t2) ? t2.toFixed(2) : "\u221e";
      if (limitRef.current) {
        const isAir = av <= ev;
        limitRef.current.textContent = isAir ? "AIR-LIMITED" : "ENERGY-LIMITED";
        limitRef.current.style.color = isAir ? V.core : V.amb;
      }

      raf = requestAnimationFrame(draw);
    };
    draw();
    return () => cancelAnimationFrame(raf);
  }, []);

  return (
    <div style={{ display:"grid", gridTemplateColumns:"1fr 240px", gap:14 }}>
      <div style={{ borderRadius:8, overflow:"hidden", border:`1px solid ${V.green}26`, background:"#04050a" }}>
        <canvas ref={cvs} style={{ width:"100%", height:260, display:"block" }} />
      </div>
      <div style={panel(V.green)}>
        <Slider label="GROWTH RATE r" value={r} min={0.1} max={2} step={0.05} col={V.green}
          onChange={setR} fmt={(v)=>v.toFixed(2)} />
        <Slider label="AIR FEEDSTOCK a" value={air} min={0} max={1} step={0.01} col={V.core}
          onChange={setAir} fmt={(v)=>v.toFixed(2)} />
        <Slider label="HARVESTED ENERGY e" value={eng} min={0} max={1} step={0.01} col={V.amb}
          onChange={setEng} fmt={(v)=>v.toFixed(2)} />
        <div style={{ display:"grid", gap:7, marginTop:10 }}>
          <Stat label="BIOMASS B/K"     col={V.green} vref={bioRef} />
          <Stat label="LIMITING FACTOR" col={V.core} vref={limitRef} />
          <Stat label="DOUBLING TIME t2" col={V.amb} vref={dblRef} />
        </div>
      </div>
    </div>
  );
}

/* ════════════════════════════════════════════════════════════════════════
   EQUATIONS
   ════════════════════════════════════════════════════════════════════════ */
const EQS: { t:string; d:string }[] = [
  { t:"F_{\\text{in}} = m\\,A\\,\\omega^2 = 2\\pi^2\\, m\\, L\\, f^2",
    d:"Peak inertial force of the reaction mass (amplitude A = L/2, \u03c9 = 2\u03c0f)." },
  { t:"F_{\\text{mag}} = \\dfrac{B^2\\,A_{\\text{plate}}}{2\\mu_0}",
    d:"Magnetic adhesion: Maxwell stress clamping a plate to the tube wall." },
  { t:"g = \\min\\!\\left(1,\\; \\dfrac{F_{\\text{mag}}}{F_{\\text{in}}}\\right)",
    d:"Grip fraction. Below 1 the anchored plate slips and stride is lost." },
  { t:"v = L\\,f\\,g",
    d:"Net crawl speed = stride \u00d7 cadence \u00d7 grip." },
  { t:"f^{*} = \\dfrac{1}{2\\pi}\\sqrt{\\dfrac{2\\,F_{\\text{mag}}}{m\\,L}}",
    d:"Optimal cadence: inertial force just equals adhesion. Push past it and you slip." },
  { t:"v_{\\max} = L\\,f^{*}",
    d:"Best achievable speed for the chosen mass, stride and adhesion." },
  { t:"\\mu_{\\text{eff}} = \\dfrac{\\mu_0}{1 + p_{\\text{film}}/p_0}",
    d:"Hydroplanation: a pressurised film lifts the gliding plate, cutting friction." },
  { t:"P(d) = \\rho\\,g\\,d",
    d:"Regulatory depth sets ambient pressure, the budget for both film and adhesion." },
  { t:"\\dfrac{dB}{dt} = r\\,B\\left(1-\\dfrac{B}{K}\\right)\\min(a,e)",
    d:"In-tube bioreactor: logistic growth gated by the scarcer of air a and energy e." },
  { t:"t_{2} = \\dfrac{\\ln 2}{r\\,\\min(a,e)}",
    d:"Biomass doubling time under the limiting resource." },
];

function VerbalCard({ col, title, body }: { col:string; title:string; body:string }) {
  return (
    <div style={{ background:`${col}0b`, border:`1px solid ${col}2e`, borderRadius:6, padding:"13px 15px" }}>
      <div style={{ fontFamily:MONO, fontSize:9, color:col, letterSpacing:"0.12em", marginBottom:6 }}>{title}</div>
      <div style={{ fontSize:11.5, color:"rgba(200,212,230,0.72)", lineHeight:1.7 }}>{body}</div>
    </div>
  );
}

/* ════════════════════════════════════════════════════════════════════════
   PAGE
   ════════════════════════════════════════════════════════════════════════ */
export default function InertialPropulsionPage() {
  return (
    <div style={{ background:V.bg, minHeight:"100vh", color:V.ink,
      fontFamily:"'Inter',system-ui,sans-serif", padding:"clamp(18px,3vw,40px)" }}>
      <div style={{ maxWidth:1080, margin:"0 auto" }}>

        {/* HERO */}
        <header style={{ marginBottom:26 }}>
          <div style={{ fontFamily:MONO, fontSize:9, color:V.core, letterSpacing:"0.34em", marginBottom:10 }}>
            AETHER \u00b7 TRANSPORT LAYER \u00b7 BUILDABLE PROPULSION
          </div>
          <h1 style={{ fontFamily:DISP, fontSize:"clamp(1.7rem,4vw,2.9rem)", margin:"0 0 14px",
            background:`linear-gradient(90deg,${V.core},${V.gold},${V.green})`,
            WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent", letterSpacing:"0.04em" }}>
            Inertial Tube Drive
          </h1>
          <p style={{ fontSize:13, color:"rgba(200,212,230,0.74)", lineHeight:1.8, maxWidth:780, margin:0 }}>
            The Air Nanotube does not have to fire one big pressure shot. It can <strong>crawl</strong>.
            An inchworm gait switches the pod&rsquo;s weight between a foot that grips the wall with
            magnetic adhesion and a foot that glides on a thin pressurised film &mdash; hydroplanation.
            The reaction mass decides how much momentum each stroke delivers; the adhesion decides how
            hard you can stroke before the anchor slips. Between those two limits there is a single
            <em> best cadence</em> that maximises speed &mdash; and that is exactly what we can calculate.
            The same tube, fed by air and harvested energy, becomes a bioreactor that grows material on
            its own inner wall.
          </p>
        </header>

        {/* SIM 1 */}
        <div style={card(V.core)}>
          <SectionHead n="I" title="INERTIAL MASS \u2192 SPEED \u00b7 THE BEST CADENCE" col={V.core} />
          <p style={{ fontSize:11, color:"rgba(200,212,230,0.72)", lineHeight:1.7, margin:"0 0 14px" }}>
            Each stroke throws the reaction mass forward and the gait rectifies that oscillation into
            crawl. The peak inertial force grows as F<sub>in</sub> = 2&pi;&sup2;&middot;m&middot;L&middot;f&sup2;.
            While that stays below the magnetic adhesion the anchor holds and speed climbs as v = L&middot;f.
            The instant F<sub>in</sub> exceeds F<sub>mag</sub> the anchor slips and speed collapses &mdash;
            so the curve peaks at the cadence f* where the two forces balance. Heavier mass moves the peak
            to a lower cadence; stronger adhesion pushes it higher.
          </p>
          <MassSpeedCanvas />
          <div style={{ marginTop:12, fontSize:9.5, color:"rgba(180,196,218,0.6)", lineHeight:1.6,
            fontFamily:MONO, background:`${V.core}0a`, border:`1px solid ${V.core}26`,
            borderRadius:5, padding:"9px 12px" }}>
            RUNTIME MODEL \u00b7 normalized units. v(f) = L&middot;f&middot;min(1, F_mag / (2&pi;&sup2; m L f&sup2;));
            the gold marker is f* = (1/2&pi;)&radic;(2 F_mag / m L) and v_max = L&middot;f*; the rose cursor
            sweeps cadence so you can watch grip turn to slip past the optimum.
          </div>
        </div>

        {/* SIM 2 */}
        <div style={card(V.gold)}>
          <SectionHead n="II" title="INCHWORM GAIT \u00b7 ADHESION \u00b7 HYDROPLANATION" col={V.gold} />
          <p style={{ fontSize:11, color:"rgba(200,212,230,0.72)", lineHeight:1.7, margin:"0 0 14px" }}>
            One full cycle has two strokes. <strong>Extend</strong>: the rear foot clamps (magnet on,
            violet glow) while the front foot floats forward on its hydroplanation film.
            <strong> Contract</strong>: the front foot clamps and the rear foot glides up to meet it.
            Weight switches to whichever foot is anchored; the gliding foot is nearly frictionless because
            the film lifts it, &mu;<sub>eff</sub> = &mu;<sub>0</sub>/(1 + p<sub>film</sub>/p<sub>0</sub>).
            Regulatory depth sets the ambient pressure that pays for both the film and the adhesion &mdash;
            drop the adhesion or over-drive the cadence and the anchor flashes SLIP.
          </p>
          <GaitCanvas />
          <div style={{ marginTop:12, fontSize:9.5, color:"rgba(180,196,218,0.6)", lineHeight:1.6,
            fontFamily:MONO, background:`${V.gold}0a`, border:`1px solid ${V.gold}26`,
            borderRadius:5, padding:"9px 12px" }}>
            RUNTIME MODEL \u00b7 the body extends and contracts on a triangular phase u(t); ribs scroll at
            speed &prop; cadence&middot;grip to show net travel; the anchored foot shows a magnetic clamp,
            the gliding foot a pressure film whose brightness tracks p_film. Grip falls when depth&middot;
            adhesion cannot meet the cadence demand, flashing SLIP.
          </div>
        </div>

        {/* SIM 3 */}
        <div style={card(V.green)}>
          <SectionHead n="III" title="IN-TUBE BIOREACTOR \u00b7 GROW MATERIAL FROM AIR + ENERGY" col={V.green} />
          <p style={{ fontSize:11, color:"rgba(200,212,230,0.72)", lineHeight:1.7, margin:"0 0 14px" }}>
            The transport tube is also a growth chamber. Air carries the feedstock; harvested energy drives
            synthesis; material accretes on the inner wall. Growth is logistic &mdash; fast while there is
            room, slowing as the bore fills &mdash; but it is gated by Liebig&rsquo;s law of the minimum:
            only the <em>scarcer</em> of air and energy sets the pace. Starve either one and growth stalls
            no matter how generous the other is. The readout names the limiting factor so you know which
            knob to turn.
          </p>
          <BioreactorCanvas />
          <div style={{ marginTop:12, fontSize:9.5, color:"rgba(180,196,218,0.6)", lineHeight:1.6,
            fontFamily:MONO, background:`${V.green}0a`, border:`1px solid ${V.green}26`,
            borderRadius:5, padding:"9px 12px" }}>
            RUNTIME MODEL \u00b7 dB/dt = r&middot;B&middot;(1 - B/K)&middot;min(a,e), integrated each frame and
            looped at capacity; the ring on the right is the tube cross-section, its green wall layer
            thickening with B while the open bore shrinks; doubling time t2 = ln2 / (r&middot;min(a,e)).
          </div>
        </div>

        {/* MATH */}
        <div style={card(V.vio)}>
          <SectionHead n="IV" title="THE COMPLETE MODEL" col={V.vio} />
          <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(280px,1fr))", gap:12 }}>
            {EQS.map((e, i) => (
              <div key={i} style={{ background:"rgba(255,255,255,0.015)", border:`1px solid ${V.vio}26`,
                borderRadius:6, padding:"13px 15px" }}>
                <div style={{ overflowX:"auto", marginBottom:7 }}
                  dangerouslySetInnerHTML={{ __html: kx(e.t, true) }} />
                <div style={{ fontSize:10.5, color:"rgba(190,205,225,0.66)", lineHeight:1.55 }}>{e.d}</div>
              </div>
            ))}
          </div>
        </div>

        {/* WHY IT WORKS */}
        <div style={card(V.amb)}>
          <SectionHead n="V" title="WHY THIS BEATS A SINGLE PRESSURE SHOT" col={V.amb} />
          <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(248px,1fr))", gap:10 }}>
            <VerbalCard col={V.core} title="GENTLE ON CARGO"
              body="A crawl spreads acceleration over many small strokes instead of one violent launch. Fragile or living cargo never sees a damaging g-spike." />
            <VerbalCard col={V.gold} title="GRIP, NEVER COAST"
              body="Magnetic adhesion means the pod is always attached to the wall. It can stop, hold, reverse, and climb vertically without a catch net or braking chamber." />
            <VerbalCard col={V.vio} title="TUNE MASS TO SPEED"
              body="Because the optimum f* depends on reaction mass and adhesion, you size the drive to the route: heavy steady freight at low cadence, light parcels at high cadence." />
            <VerbalCard col={V.green} title="FAIL-SAFE BY DESIGN"
              body="Hydroplanation is air, not water. A film failure just raises friction and slows the pod; it cannot flood the tube the way a water-pressure system can." />
            <VerbalCard col={V.rose} title="THE TUBE EARNS ITS KEEP"
              body="Idle tube volume grows material from air and harvested energy. Transport infrastructure becomes manufacturing infrastructure for free." />
            <VerbalCard col={V.cyan} title="DEPTH AS A DIAL"
              body="Regulatory depth sets the ambient pressure budget. The same hardware behaves differently shallow vs deep, so one design serves many environments." />
          </div>
        </div>

        {/* FOOTER LINKS */}
        <div style={{ display:"flex", flexWrap:"wrap", gap:12, marginTop:8 }}>
          <Link href="/air-nanotube" style={{ flex:"1 1 220px", textDecoration:"none" }}>
            <div style={{ ...panel(V.core), cursor:"pointer" }}>
              <div style={{ fontFamily:MONO, fontSize:8, color:V.core, letterSpacing:"0.12em", marginBottom:4 }}>&larr; PARENT CONCEPT</div>
              <div style={{ fontFamily:DISP, fontSize:"0.95rem", color:V.ink }}>Air Nanotube Transport</div>
            </div>
          </Link>
          <Link href="/resonant-tunnel" style={{ flex:"1 1 220px", textDecoration:"none" }}>
            <div style={{ ...panel(V.gold), cursor:"pointer" }}>
              <div style={{ fontFamily:MONO, fontSize:8, color:V.gold, letterSpacing:"0.12em", marginBottom:4 }}>SIBLING</div>
              <div style={{ fontFamily:DISP, fontSize:"0.95rem", color:V.ink }}>Living Resonant Tunnel</div>
            </div>
          </Link>
          <Link href="/regulatory-depth" style={{ flex:"1 1 220px", textDecoration:"none" }}>
            <div style={{ ...panel(V.green), cursor:"pointer" }}>
              <div style={{ fontFamily:MONO, fontSize:8, color:V.green, letterSpacing:"0.12em", marginBottom:4 }}>FOUNDATION</div>
              <div style={{ fontFamily:DISP, fontSize:"0.95rem", color:V.ink }}>Regulatory Depth</div>
            </div>
          </Link>
        </div>

      </div>
    </div>
  );
}
