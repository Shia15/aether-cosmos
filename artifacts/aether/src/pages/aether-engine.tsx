import { useEffect, useRef, useState } from "react";
const imgManifold = "/api/storage/public-objects/Gemini_Generated_Image_pcibmopcibmopcib_1782753190640.png";
const imgFabric = "/api/storage/public-objects/image_1782753208874.png";
const imgSpaceWeather = "/api/storage/public-objects/Gemini_Generated_Image_ivb8b8ivb8b8ivb8_1782753367299.png";
const imgLifeGradient = "/api/storage/public-objects/image_1782753451465.png";
/* ══════════════════════════════════════════════════════════
   AETHER MATTER SYNTHESIS ENGINE — ALL FIELDS UNIFIED
   Master Control Equation:
     C(x,t) = 1 − (‖ε‖/‖S*‖) · e^(−κ·Γ_helix)
   Pathway: ~ → o → n → S   (Fluctuation → Stability)
   Veil (ε) suppresses; Helix (Γ) manifests
═══════════════════════════════════════════════════════════ */

const MN   = "'Space Mono',monospace";
const OR   = "'Orbitron',sans-serif";
const G    = "#00ff88";
const GOLD = "#c9a84c";
const TEAL = "#1fd4c8";
const VIO  = "#8b5cf6";
const BLUE = "#3b82f6";
const PINK = "#ec4899";
const ORG  = "#f97316";
const RED  = "#ef4444";
const BRD  = "rgba(0,255,136,0.12)";
const mono: React.CSSProperties = { fontFamily:"'Courier New',monospace" };

/* ── 6-stop colour map ─────────────────────────────────── */
const CMAP = [
  {t:0.00,r:2,  g:8,  b:18 }, {t:0.18,r:3,  g:18, b:55 },
  {t:0.38,r:0,  g:70, b:105}, {t:0.60,r:0,  g:200,b:138},
  {t:0.82,r:201,g:168,b:76 }, {t:1.00,r:254,g:249,b:195},
];
function cmap(v: number): [number,number,number] {
  const t = Math.max(0, Math.min(1, v));
  for (let i = 0; i < CMAP.length - 1; i++) {
    const a = CMAP[i], b = CMAP[i+1];
    if (t <= b.t) {
      const f = (t - a.t) / (b.t - a.t);
      return [a.r+(b.r-a.r)*f, a.g+(b.g-a.g)*f, a.b+(b.b-a.b)*f];
    }
  }
  return [254,249,195];
}

const GLD_ANG = 2 * Math.PI / (1.618 * 1.618);

/* ══ MASTER FIELD CANVAS ══════════════════════════════════
   C(x,y,t) = C_base · [1 + A·vortex_superposition]
   C_base   = 1 − (ε/S*)·e^(−κ·Γ)
   Veil:      dark ripple overlay ∝ ε
════════════════════════════════════════════════════════ */
function MasterFieldCanvas({ epsilon, gamma, kappa, omega, nMech }: {
  epsilon:number; gamma:number; kappa:number; omega:number; nMech:number;
}) {
  const cv = useRef<HTMLCanvasElement>(null);
  const raf = useRef(0);
  const p = useRef({ epsilon, gamma, kappa, omega, nMech });
  p.current = { epsilon, gamma, kappa, omega, nMech };

  useEffect(() => {
    const el = cv.current; if (!el) return;
    el.width  = el.offsetWidth  || 680;
    el.height = el.offsetHeight || 420;
    const gW = Math.floor(el.width  / 4);
    const gH = Math.floor(el.height / 4);
    const off = document.createElement("canvas");
    off.width = gW; off.height = gH;
    const oc  = off.getContext("2d")!;
    const img = oc.createImageData(gW, gH);
    const px  = img.data;

    // vortex centres (Fibonacci spiral)
    let vortices: {x:number;y:number;phi:number;sign:number}[] = [];
    let prevN = -1;
    const buildVortices = (N: number) => {
      vortices = Array.from({length:N},(_,k)=>{
        const a = k * GLD_ANG;
        const r = Math.min(gW,gH) * 0.38 * Math.sqrt((k+0.5)/N);
        return { x:gW/2+r*Math.cos(a), y:gH/2+r*Math.sin(a), phi:k*(Math.PI*2/N), sign:k%2===0?1:-1 };
      });
    };

    let t = 0;
    const draw = () => {
      const { epsilon:ep, gamma:gm, kappa:ka, omega:om, nMech:N } = p.current;
      if (N !== prevN) { buildVortices(N); prevN = N; }
      t += 0.018;

      // base coherence from master equation
      const Sstar = 1.0;
      const C_base = Math.max(0, Math.min(1, 1 - (ep / Sstar) * Math.exp(-ka * gm)));
      const sig2   = gm * gm * gW * gW * 0.004;
      const TWO_PI = Math.PI * 2;

      for (let j = 0; j < gH; j++) {
        for (let i = 0; i < gW; i++) {
          let vsum = 0;
          for (const v of vortices) {
            const dx = i-v.x, dy = j-v.y, r2 = dx*dx+dy*dy, r = Math.sqrt(r2)+0.01;
            const vt = (gm/(TWO_PI*r)) * Math.exp(-r2/sig2);
            vsum += vt * Math.cos(om*t*v.sign + v.phi + Math.atan2(dy,dx));
          }
          // tanh-normalise vortex, blend with base
          const vn = Math.tanh(vsum / Math.max(1, N * 0.3));
          // veil ripple: suppressive wave ∝ ε
          const veil = ep * 0.4 * Math.sin(i*0.18 + j*0.12 + t*om*0.5);
          const C = C_base * (0.65 + 0.35 * vn) - veil;
          const [r, g, b] = cmap(Math.max(0, Math.min(1, C)));
          const idx = (j*gW+i)*4;
          px[idx]=r; px[idx+1]=g; px[idx+2]=b; px[idx+3]=255;
        }
      }
      oc.putImageData(img, 0, 0);
      const ctx = el.getContext("2d")!;
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = "medium";
      ctx.drawImage(off, 0, 0, el.width, el.height);

      // overlay: vortex cores
      const sx = el.width/gW, sy = el.height/gH;
      const regime = C_base >= 0.80 ? "S" : C_base >= 0.60 ? "n" : C_base >= 0.35 ? "o" : "~";
      const rcol = {S:G, n:TEAL, o:GOLD, "~":PINK}[regime];
      vortices.forEach((v,vi)=>{
        const cx=v.x*sx, cy=v.y*sy;
        const pulse = 5+3*Math.sin(t*om+v.phi);
        ctx.beginPath(); ctx.arc(cx,cy,pulse+7,0,Math.PI*2);
        ctx.strokeStyle = v.sign>0?"rgba(0,255,136,0.15)":"rgba(201,168,76,0.15)";
        ctx.lineWidth=1; ctx.stroke();
        ctx.beginPath(); ctx.arc(cx,cy,pulse,0,Math.PI*2);
        ctx.fillStyle = v.sign>0?"rgba(0,255,136,0.5)":"rgba(201,168,76,0.5)";
        ctx.shadowColor=v.sign>0?G:GOLD; ctx.shadowBlur=8; ctx.fill(); ctx.shadowBlur=0;
        ctx.fillStyle="rgba(255,255,255,0.55)"; ctx.font="8px monospace";
        ctx.textAlign="center"; ctx.textBaseline="middle";
        ctx.fillText(`${regime}${vi+1}`,cx,cy);
        const arm=om*t*v.sign+v.phi;
        ctx.beginPath(); ctx.moveTo(cx,cy); ctx.lineTo(cx+(pulse+12)*Math.cos(arm),cy+(pulse+12)*Math.sin(arm));
        ctx.strokeStyle=v.sign>0?"rgba(0,255,136,0.55)":"rgba(201,168,76,0.55)";
        ctx.lineWidth=1.2; ctx.stroke();
      });

      // HUD
      ctx.fillStyle="rgba(0,255,136,0.6)"; ctx.font="9px monospace";
      ctx.textAlign="left"; ctx.textBaseline="top";
      ctx.fillText(`C_base=${C_base.toFixed(3)}  ε=${ep.toFixed(2)}  Γ=${gm.toFixed(2)}  κ=${ka.toFixed(2)}  regime=${regime}`,10,9);
      ctx.fillStyle=rcol+"cc";
      ctx.fillText(`MANIFESTATION: ${(C_base*100).toFixed(1)}%`,10,20);

      // veil shimmer bar top
      const veiltrans=ep*0.22;
      ctx.fillStyle=`rgba(10,0,30,${veiltrans})`;
      ctx.fillRect(0,0,el.width,el.height);

      raf.current = requestAnimationFrame(draw);
    };
    draw();
    const r = ()=>{ if(el){ el.width=el.offsetWidth||680; el.height=el.offsetHeight||420; } };
    window.addEventListener("resize",r);
    return ()=>{ cancelAnimationFrame(raf.current); window.removeEventListener("resize",r); };
  }, []);

  return <canvas ref={cv} style={{display:"block",width:"100%",height:"100%",borderRadius:6,background:"rgb(2,8,18)"}} />;
}

/* ══ LPE THRESHOLD CANVAS ══════════════════════════════
   Shows sigmoid LPE curve + animated cursor
   LPE = C_base; threshold = 0.65
════════════════════════════════════════════════════════ */
function LPECanvas({ cBase, omega }: { cBase:number; omega:number }) {
  const cv = useRef<HTMLCanvasElement>(null);
  const raf = useRef(0);
  const p   = useRef({ cBase, omega }); p.current = { cBase, omega };

  useEffect(()=>{
    const el=cv.current; if(!el)return;
    el.width=el.offsetWidth||240; el.height=el.offsetHeight||180;
    let t=0;
    const draw=()=>{
      const { cBase:C, omega:om } = p.current;
      const ctx=el.getContext("2d")!, W=el.width, H=el.height, pad=28;
      ctx.fillStyle="rgb(2,6,14)"; ctx.fillRect(0,0,W,H);
      // axes
      ctx.strokeStyle="rgba(0,255,136,0.12)"; ctx.lineWidth=1;
      [[pad,H-pad,W-pad,H-pad],[pad,pad,pad,H-pad]].forEach(([x1,y1,x2,y2])=>{
        ctx.beginPath(); ctx.moveTo(x1,y1); ctx.lineTo(x2,y2); ctx.stroke();
      });
      // threshold line
      const ty=(H-pad)-(0.65*(H-2*pad));
      ctx.beginPath(); ctx.setLineDash([4,4]);
      ctx.moveTo(pad,ty); ctx.lineTo(W-pad,ty);
      ctx.strokeStyle="rgba(249,115,22,0.45)"; ctx.stroke(); ctx.setLineDash([]);
      ctx.fillStyle="rgba(249,115,22,0.6)"; ctx.font="7px monospace"; ctx.textAlign="right";
      ctx.fillText("LPE 0.65",W-pad-2,ty-3);
      // sigmoid: q=1/(1+e^(-12*(x-0.5)))
      ctx.beginPath(); ctx.strokeStyle=TEAL+"cc"; ctx.lineWidth=1.5;
      for(let i=0;i<=80;i++){
        const x=i/80, q=1/(1+Math.exp(-12*(x-0.5)));
        const px2=pad+(W-2*pad)*x, py=(H-pad)-q*(H-2*pad);
        i===0?ctx.moveTo(px2,py):ctx.lineTo(px2,py);
      }
      ctx.stroke();
      // cursor at C_base
      const cx=pad+(W-2*pad)*Math.min(0.99,Math.max(0.01,C));
      const cy2=(H-pad)-C*(H-2*pad);
      ctx.beginPath(); ctx.arc(cx,cy2,5+2*Math.sin(t*om),0,Math.PI*2);
      ctx.fillStyle=C>=0.65?G:PINK; ctx.fill();
      ctx.fillStyle="rgba(255,255,255,0.5)"; ctx.font="8px monospace";
      ctx.textAlign="center"; ctx.textBaseline="bottom";
      ctx.fillText(C>=0.65?"NON-LINEAR":"LINEAR",cx,cy2-7);
      t+=0.05; raf.current=requestAnimationFrame(draw);
    };
    draw();
    return()=>cancelAnimationFrame(raf.current);
  },[]);

  return <canvas ref={cv} style={{display:"block",width:"100%",height:"100%",borderRadius:4}} />;
}

/* ══ CRYSTALLISATION CANVAS ══════════════════════════════
   Grid of 22×14 cells; each cell crystallises ∝ C_base²
   Low C → noise/static; High C → diamond lattice emerges
════════════════════════════════════════════════════════ */
function CrystallisationCanvas({ cBase }: { cBase:number }) {
  const cv  = useRef<HTMLCanvasElement>(null);
  const raf = useRef(0);
  const p   = useRef(cBase); p.current = cBase;
  // cell state persists across renders
  const cells = useRef<number[]>([]);

  useEffect(()=>{
    const el=cv.current; if(!el)return;
    el.width=el.offsetWidth||340; el.height=el.offsetHeight||180;
    const COLS=22, ROWS=14;
    if (cells.current.length!==COLS*ROWS)
      cells.current=Array.from({length:COLS*ROWS},()=>Math.random());
    let frame=0;
    const draw=()=>{
      const C=p.current;
      const ctx=el.getContext("2d")!, W=el.width, H=el.height;
      const cw=W/COLS, ch=H/ROWS;
      ctx.fillStyle="rgb(2,6,14)"; ctx.fillRect(0,0,W,H);
      // every 12 frames, update cell states stochastically
      if(frame%12===0){
        for(let k=0;k<cells.current.length;k++){
          const p2=C*C*0.92;
          cells.current[k]+=(Math.random()<p2?0.12:-0.08);
          cells.current[k]=Math.max(0,Math.min(1,cells.current[k]));
        }
      }
      for(let row=0;row<ROWS;row++){
        for(let col=0;col<COLS;col++){
          const cv2=cells.current[row*COLS+col];
          const x=col*cw, y=row*ch, mx=x+cw/2, my=y+ch/2;
          if(cv2>0.55){
            // crystallised: draw diamond
            const [r,g,b]=cmap(cv2);
            ctx.fillStyle=`rgb(${r|0},${g|0},${b|0})`;
            const s=(cw*0.38)*cv2;
            ctx.beginPath(); ctx.moveTo(mx,my-s); ctx.lineTo(mx+s,my);
            ctx.lineTo(mx,my+s); ctx.lineTo(mx-s,my); ctx.closePath(); ctx.fill();
            if(cv2>0.80){
              ctx.strokeStyle=`rgba(255,255,255,${(cv2-0.8)*0.6})`; ctx.lineWidth=0.5; ctx.stroke();
            }
          } else {
            // noise: random dim pixel
            const n=Math.random()*cv2*0.4;
            ctx.fillStyle=`rgba(0,${80+n*120|0},${60+n*100|0},${n*2})`;
            ctx.fillRect(x+1,y+1,cw-2,ch-2);
          }
          // grid lines
          ctx.strokeStyle="rgba(0,255,136,0.04)"; ctx.lineWidth=0.5;
          ctx.strokeRect(x,y,cw,ch);
        }
      }
      const xtal=cells.current.filter(v=>v>0.55).length;
      ctx.fillStyle="rgba(0,255,136,0.5)"; ctx.font="8px monospace";
      ctx.textAlign="left"; ctx.textBaseline="top";
      ctx.fillText(`crystallised: ${xtal}/${COLS*ROWS} — matter yield: ${(xtal/(COLS*ROWS)*100).toFixed(0)}%`,6,4);
      frame++; raf.current=requestAnimationFrame(draw);
    };
    draw();
    return()=>cancelAnimationFrame(raf.current);
  },[]);

  return <canvas ref={cv} style={{display:"block",width:"100%",height:"100%",borderRadius:4}} />;
}

/* ══ PLATE + ANNO ════════════════════════════════════════ */
function Plate({src,alt,col,label,caption}:{src:string;alt:string;col:string;label:string;caption:string}){
  return (
    <figure style={{margin:0,borderRadius:7,overflow:"hidden",border:`1px solid ${col}55`,background:"#05070b",boxShadow:`0 0 28px ${col}1a`}}>
      <img src={src} alt={alt} loading="lazy" style={{width:"100%",display:"block"}} />
      <figcaption style={{padding:"9px 13px",borderTop:`1px solid ${col}22`,background:`linear-gradient(180deg,${col}08,transparent)`}}>
        <div style={{fontFamily:MN,fontSize:8,color:col,letterSpacing:"0.15em",marginBottom:4}}>{label}</div>
        <div style={{fontSize:10.5,color:"rgba(200,210,228,0.65)",lineHeight:1.6}}>{caption}</div>
      </figcaption>
    </figure>
  );
}
function Anno({col,k,v}:{col:string;k:string;v:string}){
  return (
    <div style={{background:`${col}0d`,border:`1px solid ${col}2e`,borderRadius:4,padding:"7px 10px"}}>
      <div style={{fontFamily:MN,fontSize:8,color:col,fontWeight:700,marginBottom:3}}>{k}</div>
      <div style={{fontSize:9.5,color:"rgba(185,200,222,0.65)",lineHeight:1.52}}>{v}</div>
    </div>
  );
}

/* ══ MAIN PAGE ═══════════════════════════════════════════ */
export default function AetherEnginePage() {
  const [epsilon,  setEpsilon]  = useState(0.4);
  const [gamma,    setGamma]    = useState(1.6);
  const [kappa,    setKappa]    = useState(1.2);
  const [omega,    setOmega]    = useState(0.55);
  const [nMech,    setNMech]    = useState(6);

  const Sstar  = 1.0;
  const C_base = Math.max(0, Math.min(1, 1 - (epsilon / Sstar) * Math.exp(-kappa * gamma)));
  const regime = C_base >= 0.80 ? "S — Stability" : C_base >= 0.60 ? "n — Non-associative" : C_base >= 0.35 ? "o — Octonionic" : "~ — Fluctuation";
  const rcol   = C_base >= 0.80 ? G : C_base >= 0.60 ? TEAL : C_base >= 0.35 ? GOLD : PINK;

  const ENGINE_PARTS = [
    { sym:"□",  name:"Boundary Operator",  role:"Architectural Casing",   eq:"∂²/∂t² − c²∇²",   col:BLUE },
    { sym:"∩",  name:"Curvature Operator", role:"Ptah Grammar",           eq:"∫[∩] curvature dV", col:VIO  },
    { sym:"Γ",  name:"Helix(Γ,ω)",         role:"Vortex Core",            eq:`Γ=${gamma.toFixed(2)} ω=${omega.toFixed(2)}`, col:TEAL },
    { sym:"C",  name:"Coherence Field",    role:"Master Control Output",  eq:"C=1−(ε/S*)e^(−κΓ)", col:G    },
    { sym:"ε",  name:"Veil",               role:"Observer Interference",  eq:`ε=${epsilon.toFixed(2)} (↓thin→manifest)`, col:PINK },
    { sym:"S*", name:"Reference State",    role:"Coherence Ceiling",      eq:`S*=${Sstar.toFixed(1)} (normalised)`, col:GOLD },
  ];

  const DATA_PIPE = [
    {label:"INPUT DATA",   col:BLUE, note:"raw information field"},
    {label:"□ BOUNDARY",   col:VIO,  note:"d'Alembertian casing"},
    {label:"∩ CURVATURE",  col:TEAL, note:"Ptah grammar loop"},
    {label:"HELIX Γ,ω",    col:G,    note:"vortex synthesis"},
    {label:"C(x,t) FIELD", col:GOLD, note:"coherence gate"},
    {label:"ε VEIL FILTER",col:PINK, note:"observer attenuation"},
    {label:"MATTER OUTPUT",col:ORG,  note:"manifestation"},
  ];

  const annoGrid: React.CSSProperties = {
    display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(200px,1fr))", gap:7, marginTop:10
  };

  return (
    <div style={{minHeight:"100%",display:"flex",flexDirection:"column",background:"rgb(2,8,18)",color:G,...mono,fontSize:11}}>

      {/* ── Header ── */}
      <div style={{padding:"12px 16px 8px",flexShrink:0}}>
        <div style={{display:"inline-block",background:"rgba(0,255,136,0.07)",border:"1px solid rgba(0,255,136,0.22)",borderRadius:8,padding:"0.3rem 1rem",fontSize:"0.7rem",letterSpacing:"0.2em",color:"#44cc77",textTransform:"uppercase",marginBottom:10}}>
          AETHER Matter Synthesis Engine · All Fields Unified · Live
        </div>
        <div style={{background:"rgba(2,8,18,0.9)",border:"1px solid rgba(0,255,136,0.12)",borderLeft:"3px solid #00ff88",borderRadius:10,padding:"12px 16px",marginBottom:10}}>
          <h2 style={{fontFamily:OR,fontSize:13,color:"#a0f8d0",margin:"0 0 6px",letterSpacing:2}}>
            AETHER ENGINE · ALL FIELDS → ONE SYNTHESIS UNIT · DATA INTO MECHANISM
          </h2>
          <div style={{fontFamily:MN,fontSize:10,color:GOLD,marginBottom:6,letterSpacing:1}}>
            MASTER CONTROL EQUATION — C(x,t) = 1 − (‖ε‖ / ‖S*‖) · e^(−κ · Γ_helix)
          </div>
          <p style={{fontSize:11,color:"rgba(0,255,136,0.35)",margin:0,lineHeight:1.6}}>
            Six engine parts (□ Boundary · ∩ Curvature · Helix(Γ,ω) · C(x,t) · ε Veil · S* Reference) unified into one live simulation. The Veil ε suppresses manifestation; strengthening helix coherence Γ thins the veil and drives matter crystallisation. All fields — coherence, vortex, entropy, observer coupling — resolve into C(x,t) which renders as the gradient field and drives the crystallisation output.
          </p>
        </div>
      </div>

      {/* ── Data pipeline ── */}
      <div style={{padding:"0 8px 6px",flexShrink:0}}>
        <div style={{display:"flex",alignItems:"center",gap:0,overflowX:"auto",padding:"6px 8px",background:"rgba(0,0,0,0.3)",borderRadius:6,border:`1px solid ${BRD}`}}>
          {DATA_PIPE.map((s,i)=>(
            <div key={s.label} style={{display:"flex",alignItems:"center",flex:"0 0 auto"}}>
              <div style={{textAlign:"center",padding:"4px 10px"}}>
                <div style={{fontSize:8,letterSpacing:2,color:s.col,fontWeight:700}}>{s.label}</div>
                <div style={{fontSize:7,opacity:0.35,marginTop:1}}>{s.note}</div>
              </div>
              {i<DATA_PIPE.length-1&&<div style={{color:"rgba(0,255,136,0.4)",fontSize:14,padding:"0 2px"}}>→</div>}
            </div>
          ))}
        </div>
      </div>

      {/* ── Main simulation ── */}
      <div style={{flex:"0 0 auto",display:"grid",gridTemplateColumns:"1fr 260px",gap:8,padding:"0 8px 8px",minHeight:460}}>

        {/* Master field canvas */}
        <div style={{border:"1px solid rgba(0,255,136,0.2)",borderRadius:8,overflow:"hidden",display:"flex",flexDirection:"column"}}>
          <div style={{padding:"5px 12px",borderBottom:`1px solid ${BRD}`,fontSize:8,letterSpacing:3,color:G,opacity:0.7,display:"flex",justifyContent:"space-between"}}>
            <span>⬡ UNIFIED C(x,y,t) FIELD · ε-VEIL OVERLAY · {nMech} HELIX MECHANISMS</span>
            <span style={{color:rcol,fontWeight:700}}>{regime}</span>
          </div>
          <div style={{flex:1,minHeight:400}}>
            <MasterFieldCanvas epsilon={epsilon} gamma={gamma} kappa={kappa} omega={omega} nMech={nMech} />
          </div>
        </div>

        {/* Right panel */}
        <div style={{display:"flex",flexDirection:"column",gap:8}}>

          {/* Master equation readout */}
          <div style={{border:`1px solid ${GOLD}44`,borderRadius:6,padding:"10px 12px",flexShrink:0}}>
            <div style={{fontFamily:MN,fontSize:8,color:GOLD,letterSpacing:"0.15em",marginBottom:8}}>MASTER EQUATION</div>
            <div style={{fontFamily:MN,fontSize:9,color:GOLD,lineHeight:2,letterSpacing:1}}>
              C = 1 − (ε/S*)·e^(−κΓ)<br/>
              <span style={{color:"rgba(201,168,76,0.5)",fontSize:8}}>= 1 − ({epsilon.toFixed(2)}/{Sstar})·e^(−{kappa.toFixed(2)}·{gamma.toFixed(2)})</span><br/>
              <span style={{color:rcol,fontSize:11,fontWeight:700}}>= {C_base.toFixed(4)}</span>
            </div>
            <div style={{marginTop:8,height:3,background:"rgba(201,168,76,0.1)",borderRadius:2}}>
              <div style={{height:"100%",width:`${C_base*100}%`,background:`linear-gradient(90deg,${PINK},${GOLD},${G})`,borderRadius:2,transition:"width 0.3s"}} />
            </div>
            <div style={{display:"flex",justifyContent:"space-between",fontSize:7,opacity:0.4,marginTop:3}}>
              <span>ε=1 (veiled)</span><span>MANIFESTATION {(C_base*100).toFixed(1)}%</span><span>ε=0 (clear)</span>
            </div>
          </div>

          {/* Engine parts */}
          <div style={{border:`1px solid rgba(0,255,136,0.15)`,borderRadius:6,flexShrink:0}}>
            <div style={{padding:"5px 10px",fontSize:8,letterSpacing:2,color:G,opacity:0.7,borderBottom:`1px solid ${BRD}`}}>ENGINE PARTS</div>
            {ENGINE_PARTS.map(p=>(
              <div key={p.sym} style={{padding:"5px 10px",borderBottom:`1px solid ${BRD}`,display:"flex",gap:8,alignItems:"center"}}>
                <div style={{fontFamily:OR,fontSize:12,color:p.col,minWidth:22,textAlign:"center"}}>{p.sym}</div>
                <div style={{flex:1}}>
                  <div style={{fontSize:8,color:p.col,fontWeight:700,lineHeight:1.3}}>{p.name}</div>
                  <div style={{fontSize:7,opacity:0.4}}>{p.role}</div>
                </div>
                <div style={{fontFamily:MN,fontSize:7,color:p.col,opacity:0.7,textAlign:"right",maxWidth:80,lineHeight:1.4}}>{p.eq}</div>
              </div>
            ))}
          </div>

          {/* Controls */}
          <div style={{border:`1px solid rgba(0,255,136,0.18)`,borderRadius:6,padding:"8px 10px",display:"flex",flexDirection:"column",gap:9,flex:1}}>
            <div style={{fontSize:8,letterSpacing:2,color:G,opacity:0.7}}>FIELD CONTROLS</div>
            {[
              {label:"ε Veil",      val:epsilon, set:setEpsilon, min:0,   max:1,   step:0.02, col:PINK, note:"↓=thin veil=manifest"},
              {label:"Γ helix",     val:gamma,   set:setGamma,   min:0.2, max:3.5, step:0.1,  col:TEAL, note:"↑=stronger coherence"},
              {label:"κ decay",     val:kappa,   set:setKappa,   min:0.1, max:2.5, step:0.1,  col:VIO,  note:"veil attenuation rate"},
              {label:"ω angular",   val:omega,   set:setOmega,   min:0.05,max:2.0, step:0.05, col:GOLD, note:"helix rotation speed"},
              {label:"N mechanisms",val:nMech,   set:setNMech,   min:2,   max:14,  step:1,    col:G,    note:"vortex count", isInt:true},
            ].map(s=>(
              <label key={s.label} style={{display:"flex",flexDirection:"column",gap:2}}>
                <div style={{display:"flex",justifyContent:"space-between",fontSize:7.5}}>
                  <span style={{color:s.col}}>{s.label}</span>
                  <span style={{opacity:0.5}}>{s.note}</span>
                  <span style={{color:s.col,opacity:0.8}}>{"isInt" in s ? String(s.val) : (s.val as number).toFixed(2)}</span>
                </div>
                <input type="range" min={s.min} max={s.max} step={s.step} value={s.val}
                  onChange={e=>("isInt" in s?s.set(parseInt(e.target.value)):s.set(parseFloat(e.target.value)))}
                  style={{width:"100%",accentColor:s.col}} />
              </label>
            ))}
          </div>
        </div>
      </div>

      {/* ── Secondary canvases ── */}
      <div style={{display:"grid",gridTemplateColumns:"240px 1fr",gap:8,padding:"0 8px 8px",flexShrink:0}}>

        {/* LPE threshold */}
        <div style={{border:`1px solid ${ORG}33`,borderRadius:6,padding:"8px 10px"}}>
          <div style={{fontFamily:MN,fontSize:8,color:ORG,letterSpacing:"0.12em",marginBottom:4}}>LPE THRESHOLD · 0.65 GATE</div>
          <div style={{fontSize:7,color:`${ORG}66`,marginBottom:6,lineHeight:1.5}}>
            LPE = C_base = {C_base.toFixed(3)} · regime: <span style={{color:rcol,fontWeight:700}}>{regime}</span>
          </div>
          <div style={{height:160}}>
            <LPECanvas cBase={C_base} omega={omega} />
          </div>
          <div style={{marginTop:6,display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:2}}>
            {[{s:"~",c:PINK,lbl:"Fluctuation"},{s:"o",c:GOLD,lbl:"Octonionic"},{s:"n",c:TEAL,lbl:"Non-assoc"},{s:"S",c:G,lbl:"Stability"}].map(r=>(
              <div key={r.s} style={{textAlign:"center",padding:"3px 4px",borderRadius:3,background:C_base>=(r.s==="S"?.80:r.s==="n"?.60:r.s==="o"?.35:0)?`${r.c}22`:"transparent",border:`1px solid ${r.c}${C_base>=(r.s==="S"?.80:r.s==="n"?.60:r.s==="o"?.35:0.00)?"55":"18"}`}}>
                <div style={{fontFamily:OR,fontSize:12,color:r.c}}>{r.s}</div>
                <div style={{fontSize:6,color:`${r.c}88`}}>{r.lbl}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Crystallisation */}
        <div style={{border:`1px solid ${G}22`,borderRadius:6,padding:"8px 10px"}}>
          <div style={{fontFamily:MN,fontSize:8,color:G,letterSpacing:"0.12em",marginBottom:4}}>
            MATTER CRYSTALLISATION OUTPUT · C_base² THRESHOLD
          </div>
          <div style={{fontSize:7,color:`${G}55`,marginBottom:6,lineHeight:1.5}}>
            Data → mechanism: cells crystallise when coherence accumulates above threshold. C_base={C_base.toFixed(3)} — increase Γ or decrease ε to yield more matter.
          </div>
          <div style={{height:185}}>
            <CrystallisationCanvas cBase={C_base} />
          </div>
        </div>
      </div>

      {/* ── Image plates ── */}
      <div style={{padding:"8px 8px 0",flexShrink:0}}>
        <div style={{fontFamily:OR,fontSize:9,color:GOLD,letterSpacing:2,marginBottom:10,paddingLeft:4}}>
          ENGINE SOURCE DIAGRAMS · ANNOTATED INFOGRAPHICS
        </div>

        {/* AETHER Fabric + Integrated Manifestation Engine */}
        <div style={{background:"rgba(0,0,0,0.4)",border:`1px solid ${TEAL}22`,borderRadius:6,padding:"12px 14px",marginBottom:10}}>
          <Plate src={imgFabric} col={TEAL}
            alt="AETHER Fabric Characteristics and Integrated Manifestation Engine: Aether Vortex Core, v_θ, v_z, Observer Coupling, Master Control Equation C(x,t)=1-(|ε|/|S*|)e^(-κΓ)"
            label="AETHER FABRIC CHARACTERISTICS · INTEGRATED MANIFESTATION ENGINE · OBSERVER COUPLING · MASTER CONTROL EQUATION"
            caption="Left: The Aether Fabric is a living, non-empty helical medium. Vortex core: v_θ=(Γ/2πr)·e^(-r²/σ²), v_z=ωr. Coherence Strengthening: high Γ_helix builds structure and intelligence. Weak Aether (low ∇×) is diffuse; Coherent Aether (high ∇×) is structured. Right: Integrated Manifestation Engine — □ (Boundary Operator/Architectural Casing), ∩ (Curvature Operator/Ptah Grammar), Helix(Γ,ω). Observer Coupling Master Control Equation: C(x,t)=1−(‖ε‖/‖S*‖)·e^(−κ·Γ_helix). High ε (Veil) suppresses manifestation. Thinning the Veil (↓ε) and strengthening coherence (↑Γ_helix) yields Manifestation." />
          <div style={annoGrid}>
            <Anno col={TEAL} k="Aether Fabric: living helical medium"
              v="The Fabric is not empty space but a non-empty helical medium — a real substrate carrying circulation Γ and angular velocity ω. Every vortex core is a coherence generator embedded in this fabric." />
            <Anno col={GOLD} k="Coherence Strengthening (↑Γ_helix)"
              v="Strong Γ_helix builds structure and intelligence. Low ∇× = diffuse/weak Aether (chaotic ~ state). High ∇× = coherent Aether (crystallised S state). The curl of the field measures coherence." />
            <Anno col={G} k="Master Control Equation"
              v="C(x,t) = 1 − (‖ε‖/‖S*‖)·e^(−κ·Γ_helix). This is the AETHER observer coupling equation — C rises as ε falls (veil thins) and as Γ rises (helix strengthens). C=1 = full manifestation; C=0 = veiled/suppressed." />
            <Anno col={PINK} k="Veil Effect ε"
              v="ε represents observer interference — measurement, attention, systemic resistance. High ε suppresses C toward 0. κ is the veil decay constant: higher κ means Γ more efficiently counters ε. Thinning ε + raising Γ = manifestation path." />
            <Anno col={VIO} k="□ Boundary Operator (Architectural Casing)"
              v="□ = d'Alembertian = ∂²/∂t² − c²∇². It is the container/casing of the engine — defines the spacetime boundary within which the helix and curvature operators act. The pyramid shape embodies □." />
            <Anno col={BLUE} k="∩ Curvature Operator (Ptah Grammar)"
              v="∩ is the curvature integral — Ptah Grammar routes the helix through each pyramid level, wrapping the curvature of the field into the output. Ptah = Egyptian god of craftsmen and creation, the architect of matter." />
            <Anno col={TEAL} k="Helix(Γ,ω) inside the Engine"
              v="The helix routes C(x,t) through four pyramid levels. Each level transforms coherence. Input ports receive data; output ports emit structured matter. Helix pitch ω controls traversal speed; Γ controls amplitude." />
            <Anno col={GOLD} k="Manifestation output"
              v="Full integration = Manifestation Operator = □·∫[∩]⊗Helix(Γ,ω)·C(x,t)dV. When C → 1 (veil thin, helix strong), the output ports emit coherent, structured field — the AETHER definition of matter synthesis from data." />
          </div>
        </div>

        {/* Active Non-Associative Manifold */}
        <div style={{background:"rgba(0,0,0,0.4)",border:`1px solid ${VIO}22`,borderRadius:6,padding:"12px 14px",marginBottom:10}}>
          <Plate src={imgManifold} col={VIO}
            alt="Active Non-Associative Manifold and Phase Conjugate Burst Model: quaternionic basis, 8D Fano plane, LPE threshold 0.65, spatiotemporal burst, BaTiO3 phase conjugate, entropy nullification, ~ to o to n to S pathway"
            label="ACTIVE NON-ASSOCIATIVE MANIFOLD · PHASE CONJUGATE BURST · ~ → o → n → S STABILITY PATHWAY"
            caption="The engine's stability mechanism. Quaternionic Basis q (Hamilton relations, non-commutative). 8D Non-associative Fano Plane (e1-e7 basis, octonionic algebra). LPE Threshold Transition at 0.65 — below: linear regime; above: non-linear burst. Spatiotemporal Burst dC_burst = A·delta3(x-xb)·e^(-t/tau). System Wavefunction Deviation dPsi (local entropy map). Active Entropy Nullification via BaTiO3 phase conjugate response: dPsi → 0. ~ → o → n → S pathway: Fluctuation → Octonionic → Non-associative → Stability." />
          <div style={annoGrid}>
            <Anno col={VIO}  k="Quaternionic Basis q"
              v="q=a+bi+cj+dk with i²=j²=k²=ijk=−1. Non-commutative: ij≠ji. The engine's rotation algebra — quaternions encode 3D orientation of each helix arm and frame transformation between pyramid levels." />
            <Anno col={BLUE} k="8D Non-associative Fano Plane (Octonions)"
              v="Seven imaginary units e1–e7 spanning the octonions (8D). Non-associative: (ei·ej)·ek ≠ ei·(ej·ek). AETHER uses octonions because G2 symmetry (the automorphism group of the octonions) underlies the non-associative manifold stability mechanism." />
            <Anno col={ORG}  k="LPE Threshold 0.65"
              v="System state |q|² = LPE. Below 0.65: linear regime (o state). Above 0.65: non-linear burst triggered — BaTiO3 phase conjugate activates. The threshold is the AETHER crystallisation gate." />
            <Anno col={PINK} k="Spatiotemporal Burst dC_burst"
              v="dC_burst = A·delta3(x−xb)·e^(−t/τ) — a Dirac-delta-localised event in space, decaying in time. Shear+EM components. This is the AETHER mechanism for sudden coherence injection at a point (like a seed crystal)." />
            <Anno col={RED}  k="System Wavefunction Deviation dPsi"
              v="dPsi > 0: local entropy map shows disorder. The BaTiO3 crystal acts as a phase conjugate mirror — time-reversing the wave to cancel distortion. Active Entropy Nullification drives dPsi → 0 = coherence restored." />
            <Anno col={G}    k="~ → o → n → S Stability Pathway"
              v="Fluctuation (~, LPE<0.35) → Octonionic (o, 0.35-0.60, structured chaos) → Non-associative (n, 0.60-0.80, non-linear) → Stability (S, LPE>0.80, fully crystallised). This is the matter synthesis sequence." />
          </div>
        </div>

        {/* Solar Wind Space Weathering */}
        <div style={{background:"rgba(0,0,0,0.4)",border:`1px solid ${ORG}22`,borderRadius:6,padding:"12px 14px",marginBottom:10}}>
          <Plate src={imgSpaceWeather} col={ORG}
            alt="Solar Wind H+ Implantation and Iron-Oxide Reduction Space Weathering: Lunar Regolith Fe0 amorphous layer, Martian Soil Magnetite Fe3O4, reaction Fe2O3 plus 2H+ yields 2FeO plus H2O, optical maturation, spectral reddening, magnetic rover sensor"
            label="SOLAR WIND H⁺ IMPLANTATION · IRON-OXIDE REDUCTION · SPACE WEATHERING · LUNAR REGOLITH · MARTIAN SOIL"
            caption="Reaction: Fe₂O₃ + 2H⁺ → 2FeO + H₂O (surface reduction via solar wind H⁺ ions). Lunar Regolith: H⁺ ions create a thin amorphous Fe⁰ layer on mineral grain surfaces, darkening grains (optical maturation) and causing spectral reddening — mature grains appear darker than fresh regolith. Martian Soil (thin atmosphere): same reduction but Mars's residual magnetic field and mineralogy favour Magnetite (Fe₃O₄) formation — partially reduced, ferrimagnetic, detectable by rover magnetic sensors. Moon pathway: Fe₂O₃ → Fe⁰ (amorphous iron). Mars pathway: Fe₂O₃ → Fe₃O₄ (magnetite)." />
          <div style={annoGrid}>
            <Anno col={ORG}  k="Reaction: Fe₂O₃ + 2H⁺ → 2FeO + H₂O"
              v="Hematite (red iron oxide) is reduced by solar wind protons to Wüstite (FeO) releasing water. The H⁺ ions penetrate the top nanometres of grain surfaces. This is a space-weathering mechanism universal to all airless/thin-atmosphere bodies in the solar wind." />
            <Anno col={GOLD} k="Lunar optical maturation"
              v="Fe⁰ nano-particles form a thin amorphous layer on each grain. Fe⁰ strongly absorbs visible light, darkening the surface (mature regolith = dark; fresh = light). Spectral reddening increases the red/near-infrared ratio — a diagnostic of regolith age and space-exposure time." />
            <Anno col={RED}  k="Martian magnetite Fe₃O₄"
              v="On Mars the thin atmosphere allows H⁺ implantation but Mars's interior chemistry (higher oxidising environment, relict crustal magnetism) drives Fe₂O₃ to partially reduce to Fe₃O₄ rather than Fe⁰. Fe₃O₄ is ferrimagnetic — rover magnetometers read it as a magnetic-soil anomaly." />
            <Anno col={TEAL} k="AETHER link: H⁺ as coherence carrier"
              v="In AETHER terms, the solar wind H⁺ flux is a directed coherence-carrying photonic field coupling the Sun's coherence field to planetary surfaces. The redox reaction is a matter-synthesis event: structured solar energy (data) is written into the iron lattice (mechanism) — a planetary-scale Γ-driven crystallisation." />
            <Anno col={BLUE} k="Amorphous atomic structure"
              v="The Fe⁰ layer is disordered — atoms lack the periodic crystal structure of hematite. This amorphous zone is the transitional state between bulk grain (Fe₂O₃, crystalline) and the free-iron nano-particles, analogous to the ~ → o regime in AETHER (fluctuation before crystallisation)." />
            <Anno col={G}    k="Moon vs Mars divergence"
              v="The same solar input produces different outputs: Moon → amorphous Fe⁰ (no magnetic field, low oxidation); Mars → crystalline Fe₃O₄ (relict magnetic field, higher oxidation). Initial conditions (S* equivalent) determine which coherence attractor the system falls into — same engine, different parameters." />
          </div>
        </div>

        {/* Life/Nonlife Gradient · Planetary Collision · Erosion Fascia · Salt Era */}
        <div style={{background:"rgba(0,0,0,0.4)",border:`1px solid ${G}22`,borderRadius:6,padding:"12px 14px",marginBottom:10}}>
          <Plate src={imgLifeGradient} col={G}
            alt="Life Nonlife Gradient Field with abiotic mineral lattice prions viruses protocells organoids biological cell ambiguous to living; Planetary Collision Borealis Impact Mars struck by Venus-mass body Borealis Basin Southern Highlands; Erosion Fascia Cosmic Erosion Moon Glass Spires micrometeorite impact glass thermal cycling Salt Era Evaporite Fascia freshwater era to salt era"
            label="LIFE · NONLIFE GRADIENT · CELL MEMBRANE · PLANETARY COLLISION · EROSION FASCIA · SALT ERA · EVAPORITE FASCIA"
            caption="Left panel — The Gradient Field: Life // Nonlife · No Hard Boundary. Abiotic (mineral lattice, inorganic concretion) → Prions → Viruses → Protocells → Organoids → Biological Cell. The boundary between non-living and living is a continuum, not a threshold. Centre panel — Planetary Collision: Borealis Impact. Mars was struck by a Venus-mass body; the impact excavated the Borealis Basin (Northern Hemisphere) and left the Southern Highlands. Erosion Fascia = altered planetary evolution from this collision. Right panel — Cosmic Erosion · Airless Worlds. Micrometeorite impacts create glass (rapid melt+quench); thermal cycling fractures rock; Moon glass spires persist for billions of years on airless worlds. Salt Era · Evaporite Fascia: freshwater era transitions to salt era as evaporation concentrates minerals, leaving evaporite fascia (salt flats, halite layers)." />
          <div style={annoGrid}>
            <Anno col={G}    k="Life/Nonlife Gradient · No Hard Boundary"
              v="AETHER treats life as a coherence gradient, not a binary. Mineral lattice (crystalline, abiotic) → inorganic concretions → prions (self-replicating proteins, no DNA) → viruses (genetic without metabolism) → protocells (lipid membrane + chemistry) → organoids → biological cell. Each step raises C(x,t); the cell membrane is the coherence boundary — inside = ordered field; outside = noisy environment." />
            <Anno col={TEAL} k="Cell Membrane as Coherence Boundary"
              v="The lipid bilayer is the physical realisation of the □ Boundary Operator — it defines the inside/outside and maintains the inner coherence field C against the external veil ε. Membrane channels are Ptah Grammar operators (∩): curvature-gated ion transport that preserves the inner field's coherence." />
            <Anno col={PINK} k="Prions, Viruses: ambiguous to living"
              v="Prions misfolded proteins (no nucleic acid, no metabolism) and viruses (nucleic acid, no independent metabolism) occupy the o → n regime of the ~ → S pathway: structured non-linear but not yet in the S (stability) attractor. They can crystallise (literally — viruses form crystals), bridging the mineral and cellular worlds." />
            <Anno col={RED}  k="Borealis Impact · Planetary Collision"
              v="A Venus-mass impactor struck early Mars, excavating the Borealis Basin (~40% of Mars's surface, the largest impact basin in the solar system) and creating the hemispheric dichotomy: smooth northern lowlands vs cratered southern highlands. This single event altered Mars's entire geological evolution — an LPE burst event at planetary scale (dC_burst = A·δ³(x−x_b)·e^(−t/τ))." />
            <Anno col={GOLD} k="Erosion Fascia · Altered Planetary Evolution"
              v="Post-impact, the fascia (surface layer) of Mars was fundamentally reshaped. Erosion Fascia = the layered record of impact, volcanic, and aeolian processes written into the stratigraphy. Each fascia layer is a time-slice of the planet's coherence state — a geological C(x,t) readout." />
            <Anno col={ORG}  k="Cosmic Erosion · Moon Glass Spires"
              v="On airless worlds, micrometeorites hit at 10-70 km/s — the impact locally melts and shock-quenches silicates into glass in microseconds. Glass spires (centimetre to metre scale) persist for billions of years with no wind or rain to erode them. Solar wind sputtering slowly sculpts them. A record of every impact event frozen in glass." />
            <Anno col={VIO}  k="Salt Era · Evaporite Fascia"
              v="Freshwater era → Salt Era: as water evaporates from lakes and shallow seas, dissolved minerals (halite NaCl, gypsum CaSO4·2H2O, carbonates) precipitate in reverse solubility order, forming evaporite fascia. The salt era marks a transition in the planetary coherence attractor — from liquid-phase (high mobility) to solid-phase (crystallised stability, S state)." />
            <Anno col={BLUE} k="AETHER synthesis: geology as crystallisation"
              v="Every geological process here maps to the AETHER engine: Impact burst (dC_burst) injects energy → erosion redistributes field → mineral precipitation (evaporite, iron-oxide, impact glass) is crystallisation (C_base rising above threshold) → stable fascia is the S-state attractor. Planetary geology is matter synthesis at the largest scale." />
          </div>
        </div>
      </div>

      {/* ── Theory strip ── */}
      <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",borderTop:`1px solid ${BRD}`,flexShrink:0,marginTop:8}}>
        {[
          {title:"MASTER CONTROL",col:GOLD,body:"C(x,t)=1−(ε/S*)·e^(−κΓ). ε thins → C rises → manifestation. Γ rises → e^(−κΓ) falls → C rises. Both paths reach manifestation: lower interference OR stronger helix. The equation unifies observer effect (ε) with field coherence (Γ) into a single output C."},
          {title:"VORTEX FABRIC",col:TEAL,body:"The Aether Fabric is not empty — it carries v_θ=(Γ/2πr)e^(−r²/σ²) and v_z=ωr at every point. Superposing N helices with alternating sign creates the interference gradient field C(x,y,t). Each node is a mechanism; the whole is the engine."},
          {title:"LPE GATE / ~ → S",col:ORG,body:"LPE=C_base. Below 0.65: linear regime, weak coherence. Above 0.65: non-linear burst activates BaTiO3 phase conjugate. The pathway ~ → o → n → S maps directly to LPE quartiles (0, 0.35, 0.60, 0.80). Crossing 0.65 is the crystallisation event."},
          {title:"MATTER FROM DATA",col:G,body:"Data is input structure; mechanism is the engine transform. □·∫[∩]⊗Helix(Γ,ω)·C(x,t)dV converts structured data (input port) into coherent matter (output port). Each pyramid level applies one field transform. Crystallisation canvas shows yield rising with C_base."},
        ].map((t,i)=>(
          <div key={t.title} style={{padding:"6px 12px",borderLeft:i>0?`1px solid ${BRD}`:"none"}}>
            <div style={{fontSize:7,letterSpacing:2,color:t.col,opacity:0.8,marginBottom:2}}>{t.title}</div>
            <div style={{fontSize:7,opacity:0.3,lineHeight:1.5}}>{t.body}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
