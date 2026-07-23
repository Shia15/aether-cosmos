import { useCallback, useEffect, useRef, useState } from "react";
const imgColorLadder = "/api/storage/public-objects/Gemini_Generated_Image_d7z5bcd7z5bcd7z5_1782737472126.png";
const imgManifold = "/api/storage/public-objects/Gemini_Generated_Image_pcibmopcibmopcib_1782737636346.png";
const imgQuarks = "/api/storage/public-objects/Gemini_Generated_Image_rq3dtzrq3dtzrq3d_(1)_1782737693751.png";
const imgRegDark = "/api/storage/public-objects/Gemini_Generated_Image_73me5d73me5d73me_1782737718413.png";
/* ── palette ──────────────────────────────────────────── */
const G    = "#00ff88";
const DIM  = "rgba(0,255,136,0.4)";
const BRD  = "rgba(0,255,136,0.12)";
const GOLD = "#c9a84c";
const VIO  = "#8b5cf6";
const TEAL = "#1fd4c8";
const GRN  = "#22c55e";
const PINK = "#ec4899";
const BLUE = "#3b82f6";
const ORG  = "#f97316";
const mono: React.CSSProperties = { fontFamily:"'Courier New',monospace" };
const MN   = "'Space Mono',monospace";
const OR   = "'Orbitron',sans-serif";

/* ── farm constants ───────────────────────────────────── */
const PHI        = 1.6180339887;
const GOLDEN_ANG = 2 * Math.PI / (PHI * PHI);
const N_PLANTS   = 89;
const N_ROBOTS   = 4;
const CYCLE_TICKS= 600;

const CROPS = [
  { id:"spirulina",    name:"Spirulina",    col:"#06b6d4", gold:92, kcal:290, benefit:"Complete protein · B12 · Iron · phycocyanin" },
  { id:"moringa",      name:"Moringa",       col:"#22c55e", gold:95, kcal:64,  benefit:"92 nutrients · anti-inflammatory · folate" },
  { id:"turmeric",     name:"Turmeric",      col:"#fbbf24", gold:98, kcal:312, benefit:"Curcumin → NF-κB inhibition · golden anti-ox" },
  { id:"kale",         name:"Kale",          col:"#16a34a", gold:88, kcal:33,  benefit:"Sulforaphane · K1 · lutein · glucosinolates" },
  { id:"beet",         name:"Beet",          col:"#ec4899", gold:84, kcal:43,  benefit:"Nitrates → NO · betaine · detoxification" },
  { id:"sweet_potato", name:"Sweet Potato",  col:"#f97316", gold:86, kcal:86,  benefit:"Beta-carotene · slow glucose · B6" },
  { id:"reishi",       name:"Reishi",        col:"#ef4444", gold:91, kcal:40,  benefit:"Beta-glucan · immune modulation · triterpenes" },
  { id:"hemp",         name:"Hemp",          col:"#84cc16", gold:87, kcal:553, benefit:"Omega-3/6 ratio · CBD precursors · complete AA" },
  { id:"ginger",       name:"Ginger",        col:"#f59e0b", gold:89, kcal:80,  benefit:"Gingerols · anti-nausea · circulation · COX-2" },
  { id:"ashwagandha",  name:"Ashwagandha",   col:"#d97706", gold:93, kcal:245, benefit:"Withanolides · cortisol regulation · adaptogen" },
  { id:"lions_mane",   name:"Lion's Mane",   col:"#e0e7ff", gold:94, kcal:35,  benefit:"Hericenones → NGF synthesis · neuroplasticity" },
  { id:"garlic",       name:"Garlic",        col:"#fef3c7", gold:90, kcal:149, benefit:"Allicin · DATS · cardiovascular · antimicrobial" },
  { id:"carrot",       name:"Carrot",        col:"#fb923c", gold:83, kcal:41,  benefit:"α/β-carotene · falcarinol · lutein · vitamin A" },
  { id:"chlorella",    name:"Chlorella",     col:"#4ade80", gold:88, kcal:379, benefit:"Chlorophyll · heavy-metal detox · B12 boost" },
];

const ROBOTS = [
  { id:"seeder",    name:"SEEDER-φ1",    col:"#60a5fa", glyph:"◉", role:"Fibonacci-angle seeding · golden-spiral placement" },
  { id:"harvester", name:"HARVESTER-φ2", col:"#34d399", glyph:"◆", role:"Coherence-threshold harvest · maturity detection" },
  { id:"solar",     name:"SOLAR-φ3",     col:"#fbbf24", glyph:"✦", role:"Panel azimuth tracking · irradiance optimisation" },
  { id:"nutrient",  name:"NUTRIENT-φ4",  col:"#c084fc", glyph:"⟳", role:"Mineral water loop · closed-circuit nutrition" },
];

type Stage = 0|1|2|3;
interface PlantState { stage: Stage; age: number; cropIdx: number }
interface RobotState { plantTarget: number; x: number; y: number; progress: number; carrying: boolean }

function farmPos(i: number, R: number, cx: number, cy: number) {
  const r   = R * Math.sqrt((i + 1) / N_PLANTS);
  const ang = i * GOLDEN_ANG;
  return { x: cx + r * Math.cos(ang), y: cy + r * Math.sin(ang) };
}

function drawFarm(canvas: HTMLCanvasElement, plants: PlantState[], robots: RobotState[], t: number, psi: number) {
  const ctx = canvas.getContext("2d")!;
  const W = canvas.width, H = canvas.height;
  const cx = W/2, cy = H/2, R = Math.min(W,H)*0.46;
  ctx.fillStyle = "rgb(2,8,18)"; ctx.fillRect(0,0,W,H);
  ctx.beginPath();
  for (let i=0; i<N_PLANTS*2; i++) {
    const a=i*GOLDEN_ANG, rr=R*Math.sqrt((i+1)/(N_PLANTS*2));
    const x=cx+rr*Math.cos(a), y=cy+rr*Math.sin(a);
    i===0?ctx.moveTo(x,y):ctx.lineTo(x,y);
  }
  ctx.strokeStyle="rgba(100,255,150,0.04)"; ctx.lineWidth=1.2; ctx.stroke();
  for (let ring=1; ring<=5; ring++) {
    const rr=R*ring/5, pulse=0.04+0.02*Math.sin(t*0.02+ring*0.8)*psi;
    ctx.beginPath(); ctx.arc(cx,cy,rr,0,Math.PI*2);
    ctx.strokeStyle=`rgba(0,255,136,${pulse})`; ctx.lineWidth=1; ctx.stroke();
  }
  for (const [sx,sy] of [[16,16],[W-48,16]] as [number,number][]) {
    const pb=0.4+0.3*Math.sin(t*0.01);
    ctx.fillStyle=`rgba(251,191,36,${pb*0.4})`; ctx.strokeStyle=`rgba(251,191,36,${pb})`; ctx.lineWidth=0.5;
    for (let pr=0;pr<3;pr++) for (let pc=0;pc<4;pc++) {
      ctx.fillRect(sx+pc*8,sy+pr*5,7,4); ctx.strokeRect(sx+pc*8,sy+pr*5,7,4);
    }
  }
  plants.forEach((p,i)=>{
    const pos=farmPos(i,R,cx,cy), crop=CROPS[p.cropIdx];
    const rBase=3+p.stage*2.5+(p.stage===3?1.5*Math.sin(t*0.05+i):0), alpha=0.3+p.stage*0.23;
    if (p.stage===3) { ctx.beginPath(); ctx.arc(pos.x,pos.y,rBase+3+Math.sin(t*0.05+i)*1.5,0,Math.PI*2); ctx.fillStyle=crop.col+"22"; ctx.fill(); }
    ctx.beginPath(); ctx.arc(pos.x,pos.y,rBase,0,Math.PI*2);
    ctx.fillStyle=crop.col+Math.round(alpha*255).toString(16).padStart(2,"0"); ctx.fill();
    if (p.stage>=2) { ctx.beginPath(); ctx.arc(pos.x,pos.y,rBase,0,Math.PI*2); ctx.strokeStyle=crop.col+"80"; ctx.lineWidth=0.8; ctx.stroke(); }
  });
  robots.forEach((rb,ri)=>{
    const robot=ROBOTS[ri], rSize=6, glow=0.5+0.5*Math.sin(t*0.08+ri*1.5);
    ctx.beginPath(); ctx.arc(rb.x,rb.y,rSize+2,0,Math.PI*2); ctx.fillStyle=robot.col+"30"; ctx.fill();
    ctx.beginPath(); ctx.arc(rb.x,rb.y,rSize,0,Math.PI*2);
    ctx.fillStyle=robot.col+Math.round((0.2+0.3*glow)*255).toString(16).padStart(2,"0"); ctx.fill();
    ctx.strokeStyle=robot.col; ctx.lineWidth=1.5; ctx.stroke();
    ctx.fillStyle=robot.col; ctx.font=`${rSize+2}px monospace`; ctx.textAlign="center"; ctx.textBaseline="middle"; ctx.fillText(robot.glyph,rb.x,rb.y);
    if (rb.carrying) {
      const tp=farmPos(rb.plantTarget,R,cx,cy);
      ctx.beginPath(); ctx.moveTo(rb.x,rb.y); ctx.lineTo(tp.x,tp.y);
      ctx.strokeStyle=robot.col+"40"; ctx.lineWidth=0.8; ctx.setLineDash([3,5]); ctx.stroke(); ctx.setLineDash([]);
    }
  });
  const pulse=4+2*Math.sin(t*0.04);
  ctx.beginPath(); ctx.arc(cx,cy,pulse,0,Math.PI*2); ctx.fillStyle=`rgba(0,255,136,${0.6+0.3*psi})`; ctx.fill();
  ctx.fillStyle="rgba(0,255,136,0.5)"; ctx.font="9px monospace"; ctx.textAlign="center"; ctx.textBaseline="bottom";
  ctx.fillText(`ψ=${psi.toFixed(3)}`,cx,cy-pulse-3);
}

/* ── badge canvas ─────────────────────────────────────── */
function CircularFarmBadgeCanvas() {
  const ref = useRef<HTMLCanvasElement>(null);
  const rafRef = useRef(0);
  useEffect(()=>{
    const canvas=ref.current; if(!canvas)return;
    const ctx=canvas.getContext("2d")!;
    canvas.width=900; canvas.height=180;
    const W=canvas.width, H=canvas.height, cx=W/2, cy=H/2;
    let t=0;
    const rings=[35,65,90,110];
    const dots: {ang:number;r:number;col:string;speed:number}[]=[];
    rings.forEach((r,i)=>{
      const col=["#44cc77","#c9a84c","#2ef0d8","#9966ff"][i];
      for(let j=0;j<8;j++) dots.push({ang:j*(Math.PI/4),r,col,speed:0.01*(i%2===0?1:-1)});
    });
    const draw=()=>{
      ctx.fillStyle="rgba(2,8,18,0.18)"; ctx.fillRect(0,0,W,H); t++;
      rings.forEach((r,i)=>{
        ctx.beginPath(); ctx.arc(cx,cy,r,0,Math.PI*2);
        ctx.strokeStyle=["#44cc77","#c9a84c","#2ef0d8","#9966ff"][i]+"33"; ctx.lineWidth=1; ctx.stroke();
      });
      dots.forEach(d=>{
        d.ang+=d.speed;
        const x=cx+d.r*Math.cos(d.ang), y=cy+d.r*Math.sin(d.ang);
        ctx.beginPath(); ctx.arc(x,y,3,0,Math.PI*2);
        ctx.fillStyle=d.col; ctx.shadowColor=d.col; ctx.shadowBlur=8; ctx.fill(); ctx.shadowBlur=0;
      });
      ctx.fillStyle="rgba(68,204,119,0.35)"; ctx.font="9px 'Courier New',monospace"; ctx.textAlign="left";
      ctx.fillText("CIRCULAR FARM · φ-GOLDEN SPIRAL · COMPANION PLANTING · SYNTROPIC AGROFORESTRY · AETHER DYNAMIC INTERCHANGE SIMULATION",14,16);
      rafRef.current=requestAnimationFrame(draw);
    };
    draw();
    return ()=>cancelAnimationFrame(rafRef.current);
  },[]);
  return <canvas ref={ref} style={{width:"100%",height:"auto",borderRadius:8,display:"block"}} />;
}

/* ── Entropy & Growth Factor Canvas ─────────────────────
   S(t) = S_max·(1 − e^{−λt})   entropy rises, saturates
   G(t) = G_0·e^{α·S(t)/S_max}  growth factor driven by entropy
─────────────────────────────────────────────────────────── */
function EntropyGrowthSim({ tick }: { tick: number }) {
  const ref  = useRef<HTMLCanvasElement>(null);
  const raf  = useRef(0);
  const tRef = useRef(tick);
  tRef.current = tick;
  const [alpha, setAlpha] = useState(1.4);
  const [lambda, setLambda] = useState(0.004);
  const aRef = useRef(alpha); aRef.current = alpha;
  const lRef = useRef(lambda); lRef.current = lambda;

  useEffect(()=>{
    const cv=ref.current; if(!cv)return;
    cv.width=cv.offsetWidth||340; cv.height=cv.offsetHeight||180;
    const W=cv.width, H=cv.height;
    const pad=28;
    let frame=0;
    const draw=()=>{
      const ctx=cv.getContext("2d")!;
      const a=aRef.current, l=lRef.current;
      ctx.fillStyle="rgb(2,6,14)"; ctx.fillRect(0,0,W,H);
      ctx.strokeStyle="rgba(236,72,153,0.12)"; ctx.lineWidth=1;
      for(let g=0;g<=4;g++){
        const y=pad+(H-2*pad)*(1-g/4);
        ctx.beginPath(); ctx.moveTo(pad,y); ctx.lineTo(W-pad,y); ctx.stroke();
      }
      // draw S curve (normalised)
      ctx.beginPath(); ctx.strokeStyle="#ec489988"; ctx.lineWidth=1.2;
      const steps=100;
      for(let i=0;i<=steps;i++){
        const t=i/steps*2000;
        const S=1-Math.exp(-l*t);
        const x=pad+(W-2*pad)*(i/steps);
        const y=(H-pad)-S*(H-2*pad);
        i===0?ctx.moveTo(x,y):ctx.lineTo(x,y);
      }
      ctx.stroke();
      // draw G curve
      ctx.beginPath(); ctx.strokeStyle="#f9731688"; ctx.lineWidth=1.5;
      for(let i=0;i<=steps;i++){
        const t=i/steps*2000;
        const S=1-Math.exp(-l*t);
        const G=Math.exp(a*S);
        const Gmax=Math.exp(a);
        const x=pad+(W-2*pad)*(i/steps);
        const y=(H-pad)-(G/Gmax)*(H-2*pad);
        i===0?ctx.moveTo(x,y):ctx.lineTo(x,y);
      }
      ctx.stroke();
      // cursor at current tick
      const t_now=tRef.current % 2000;
      const S_now=1-Math.exp(-l*t_now);
      const G_now=Math.exp(a*S_now);
      const Gmax=Math.exp(a);
      const cx=pad+(W-2*pad)*(t_now/2000);
      const cyS=(H-pad)-S_now*(H-2*pad);
      const cyG=(H-pad)-(G_now/Gmax)*(H-2*pad);
      ctx.beginPath(); ctx.arc(cx,cyS,3,0,Math.PI*2); ctx.fillStyle="#ec4899"; ctx.fill();
      ctx.beginPath(); ctx.arc(cx,cyG,3,0,Math.PI*2); ctx.fillStyle="#f97316"; ctx.fill();
      // axis labels
      ctx.fillStyle="rgba(236,72,153,0.6)"; ctx.font="8px monospace"; ctx.textAlign="left";
      ctx.fillText(`S(t)`,pad+2,cyS-5);
      ctx.fillStyle="rgba(249,115,22,0.6)";
      ctx.fillText(`G=${G_now.toFixed(2)}`,pad+2,cyG-5);
      ctx.fillStyle="rgba(255,255,255,0.2)"; ctx.font="7px monospace"; ctx.textAlign="right";
      ctx.fillText(`λ=${l.toFixed(3)} α=${a.toFixed(1)}`,W-pad,H-4);
      frame++; raf.current=requestAnimationFrame(draw);
    };
    draw();
    return()=>cancelAnimationFrame(raf.current);
  },[]);

  return (
    <div style={{display:"flex",flexDirection:"column",gap:5,height:"100%"}}>
      <canvas ref={ref} style={{flex:1,display:"block",width:"100%",borderRadius:4}} />
      <div style={{display:"flex",gap:10,paddingBottom:4,flexWrap:"wrap"}}>
        <label style={{fontSize:7,opacity:0.5,display:"flex",flexDirection:"column",gap:2}}>
          α (expansion rate) = {alpha.toFixed(1)}
          <input type="range" min={0.5} max={3.0} step={0.1} value={alpha} onChange={e=>setAlpha(+e.target.value)} style={{width:90,accentColor:ORG}} />
        </label>
        <label style={{fontSize:7,opacity:0.5,display:"flex",flexDirection:"column",gap:2}}>
          λ (entropy rate) = {lambda.toFixed(3)}
          <input type="range" min={0.001} max={0.012} step={0.001} value={lambda} onChange={e=>setLambda(+e.target.value)} style={{width:90,accentColor:PINK}} />
        </label>
      </div>
      <div style={{fontSize:7,opacity:0.28,lineHeight:1.5,fontFamily:"'Courier New',monospace"}}>
        S(t)=S_max·(1−e^(−λt)) · G(t)=G₀·e^(α·S/S_max)
      </div>
    </div>
  );
}

/* ── Hubble Parameter H(a) Canvas ───────────────────────
   H(a) = H₀·√(Ω_r/a⁴ + Ω_m/a³ + Ω_Λ)
   a mapped to farm phase: a = tick / CYCLE_TICKS ∈ [0.01,2]
─────────────────────────────────────────────────────────── */
function HubbleTimelineSim({ tick }: { tick: number }) {
  const ref  = useRef<HTMLCanvasElement>(null);
  const raf  = useRef(0);
  const tRef = useRef(tick); tRef.current = tick;
  const [omegaM, setOmegaM] = useState(0.3);
  const [omegaL, setOmegaL] = useState(0.7);
  const omRef = useRef(omegaM); omRef.current = omegaM;
  const olRef = useRef(omegaL); olRef.current = omegaL;

  useEffect(()=>{
    const cv=ref.current; if(!cv)return;
    cv.width=cv.offsetWidth||340; cv.height=cv.offsetHeight||180;
    const W=cv.width, H=cv.height, pad=28;
    const draw=()=>{
      const ctx=cv.getContext("2d")!;
      const Om=omRef.current, Ol=olRef.current, Or=1-Om-Ol>0?1-Om-Ol:0.0001;
      ctx.fillStyle="rgb(2,6,14)"; ctx.fillRect(0,0,W,H);
      ctx.strokeStyle="rgba(59,130,246,0.12)"; ctx.lineWidth=1;
      for(let g=0;g<=4;g++){
        const y=pad+(H-2*pad)*(1-g/4);
        ctx.beginPath(); ctx.moveTo(pad,y); ctx.lineTo(W-pad,y); ctx.stroke();
      }
      const N=120;
      const aMin=0.05, aMax=2.0;
      // compute H(a) = sqrt(Or/a^4 + Om/a^3 + Ol)
      const Hvals=Array.from({length:N+1},(_,i)=>{
        const a=aMin+(aMax-aMin)*(i/N);
        return Math.sqrt(Or/(a**4)+Om/(a**3)+Ol);
      });
      const Hmax=Math.max(...Hvals)*1.05;
      // draw component curves
      const comps=[
        {fn:(a:number)=>Math.sqrt(Or/(a**4)),col:"#ef444488",lbl:"Ω_r/a⁴"},
        {fn:(a:number)=>Math.sqrt(Om/(a**3)),col:"#3b82f688",lbl:"Ω_m/a³"},
        {fn:(_:number)=>Math.sqrt(Ol),col:"#8b5cf688",lbl:"Ω_Λ"},
      ];
      comps.forEach(c=>{
        ctx.beginPath(); ctx.strokeStyle=c.col; ctx.lineWidth=1;
        for(let i=0;i<=N;i++){
          const a=aMin+(aMax-aMin)*(i/N);
          const h=c.fn(a);
          const x=pad+(W-2*pad)*(i/N);
          const y=(H-pad)-(h/Hmax)*(H-2*pad);
          i===0?ctx.moveTo(x,y):ctx.lineTo(x,y);
        }
        ctx.stroke();
      });
      // total H
      ctx.beginPath(); ctx.strokeStyle=BLUE+"cc"; ctx.lineWidth=2;
      Hvals.forEach((h,i)=>{
        const x=pad+(W-2*pad)*(i/N);
        const y=(H-pad)-(h/Hmax)*(H-2*pad);
        i===0?ctx.moveTo(x,y):ctx.lineTo(x,y);
      });
      ctx.stroke();
      // cursor = farm's current phase
      const a_now=Math.min(aMax,Math.max(aMin,0.05+(tRef.current%CYCLE_TICKS)/CYCLE_TICKS*1.95));
      const h_now=Math.sqrt(Or/(a_now**4)+Om/(a_now**3)+Ol);
      const cx=pad+(W-2*pad)*((a_now-aMin)/(aMax-aMin));
      const cy=(H-pad)-(h_now/Hmax)*(H-2*pad);
      ctx.beginPath(); ctx.arc(cx,cy,4,0,Math.PI*2); ctx.fillStyle=BLUE; ctx.fill();
      ctx.fillStyle="rgba(59,130,246,0.8)"; ctx.font="8px monospace"; ctx.textAlign="left";
      ctx.fillText(`H=${h_now.toFixed(2)}·H₀`,cx+6,cy);
      ctx.fillStyle="rgba(255,255,255,0.2)"; ctx.font="7px monospace"; ctx.textAlign="right";
      ctx.fillText(`a=${a_now.toFixed(2)} Ω_m=${Om.toFixed(1)} Ω_Λ=${Ol.toFixed(1)}`,W-pad,H-4);
      raf.current=requestAnimationFrame(draw);
    };
    draw();
    return()=>cancelAnimationFrame(raf.current);
  },[]);

  return (
    <div style={{display:"flex",flexDirection:"column",gap:5,height:"100%"}}>
      <canvas ref={ref} style={{flex:1,display:"block",width:"100%",borderRadius:4}} />
      <div style={{display:"flex",gap:10,paddingBottom:4,flexWrap:"wrap"}}>
        <label style={{fontSize:7,opacity:0.5,display:"flex",flexDirection:"column",gap:2}}>
          Ω_m = {omegaM.toFixed(1)}
          <input type="range" min={0.1} max={0.6} step={0.05} value={omegaM} onChange={e=>setOmegaM(+e.target.value)} style={{width:90,accentColor:BLUE}} />
        </label>
        <label style={{fontSize:7,opacity:0.5,display:"flex",flexDirection:"column",gap:2}}>
          Ω_Λ = {omegaL.toFixed(1)}
          <input type="range" min={0.1} max={0.8} step={0.05} value={omegaL} onChange={e=>setOmegaL(+e.target.value)} style={{width:90,accentColor:VIO}} />
        </label>
      </div>
      <div style={{fontSize:7,opacity:0.28,lineHeight:1.5,fontFamily:"'Courier New',monospace"}}>
        H(a)=H₀√(Ω_r/a⁴+Ω_m/a³+Ω_Λ) · farm phase → scale factor a
      </div>
    </div>
  );
}

/* ── Energy Density ρ(a) Canvas ─────────────────────────
   ρ_m ∝ a^-3  (matter)
   ρ_r ∝ a^-4  (radiation)
   ρ_Λ = const (dark energy)
   farm nutrient density maps to ρ_m
─────────────────────────────────────────────────────────── */
function EnergyDensitySim({ farmScale, psi }: { farmScale: number; psi: number }) {
  const ref  = useRef<HTMLCanvasElement>(null);
  const raf  = useRef(0);
  const scRef = useRef(farmScale); scRef.current = farmScale;
  const psRef = useRef(psi); psRef.current = psi;

  useEffect(()=>{
    const cv=ref.current; if(!cv)return;
    cv.width=cv.offsetWidth||340; cv.height=cv.offsetHeight||180;
    const W=cv.width, H=cv.height, pad=28;
    const draw=()=>{
      const ctx=cv.getContext("2d")!;
      ctx.fillStyle="rgb(2,6,14)"; ctx.fillRect(0,0,W,H);
      ctx.strokeStyle="rgba(201,168,76,0.12)"; ctx.lineWidth=1;
      for(let g=0;g<=4;g++){
        const y=pad+(H-2*pad)*(1-g/4);
        ctx.beginPath(); ctx.moveTo(pad,y); ctx.lineTo(W-pad,y); ctx.stroke();
      }
      const N=100, aMin=0.05, aMax=3.0;
      const rhoM=(a:number)=>1/(a**3);
      const rhoR=(a:number)=>1/(a**4);
      const rhoL=(_:number)=>0.7;
      // log-log: y = log(rho), x = log(a)
      const logA=(a:number)=>Math.log10(a);
      const logAmin=Math.log10(aMin), logAmax=Math.log10(aMax);
      const logRmax=4; // log10(rhoR at aMin) = log10(1/0.05^4) ≈ 5.2, clamp to 4
      const px=(a:number)=>pad+(W-2*pad)*((logA(a)-logAmin)/(logAmax-logAmin));
      const py=(rho:number)=>{
        const lr=Math.max(-1,Math.min(logRmax,Math.log10(Math.max(1e-4,rho))));
        return (H-pad)-(lr-(-1))/(logRmax-(-1))*(H-2*pad);
      };
      // draw three curves
      [
        {fn:rhoM,col:"#22c55eaa",lbl:"ρ_m ∝ a⁻³"},
        {fn:rhoR,col:"#ef4444aa",lbl:"ρ_r ∝ a⁻⁴"},
        {fn:rhoL,col:"#8b5cf6aa",lbl:"ρ_Λ = const"},
      ].forEach(c=>{
        ctx.beginPath(); ctx.strokeStyle=c.col; ctx.lineWidth=1.5;
        for(let i=0;i<=N;i++){
          const a=aMin*(aMax/aMin)**(i/N);
          const x=px(a), y=py(c.fn(a));
          i===0?ctx.moveTo(x,y):ctx.lineTo(x,y);
        }
        ctx.stroke();
        // label at right
        const aEnd=aMax*0.95, y_end=py(c.fn(aEnd));
        ctx.fillStyle=c.col; ctx.font="7px monospace"; ctx.textAlign="right";
        ctx.fillText(c.lbl,W-pad-2,y_end-3);
      });
      // farm cursor: a = farmScale (1×scale → a=1)
      const a_farm=Math.max(aMin,Math.min(aMax,scRef.current));
      const rho_farm=rhoM(a_farm)*psRef.current*1.2;
      const fx=px(a_farm), fy=py(rho_farm);
      ctx.beginPath(); ctx.arc(fx,fy,5,0,Math.PI*2); ctx.fillStyle=GOLD; ctx.fill();
      ctx.fillStyle="rgba(201,168,76,0.8)"; ctx.font="8px monospace"; ctx.textAlign="left";
      ctx.fillText(`farm ρ=${rho_farm.toFixed(2)}`,fx+7,fy);
      ctx.fillStyle="rgba(255,255,255,0.2)"; ctx.font="7px monospace"; ctx.textAlign="right";
      ctx.fillText(`a=${a_farm.toFixed(1)} ψ=${psRef.current.toFixed(3)}`,W-pad,H-4);
      raf.current=requestAnimationFrame(draw);
    };
    draw();
    return()=>cancelAnimationFrame(raf.current);
  },[]);

  return (
    <div style={{display:"flex",flexDirection:"column",gap:5,height:"100%"}}>
      <canvas ref={ref} style={{flex:1,display:"block",width:"100%",borderRadius:4}} />
      <div style={{fontSize:7,opacity:0.5,lineHeight:1.5,fontFamily:"'Courier New',monospace"}}>
        Log-log plot · farm scale a maps to matter density · gold dot = farm nutrient density · ψ-weighted
      </div>
      <div style={{fontSize:7,opacity:0.28,fontFamily:"'Courier New',monospace"}}>
        ρ_total(a)=ρ_m/a³+ρ_r/a⁴+ρ_Λ · equality at a_eq ~0.0003
      </div>
    </div>
  );
}

/* ── Plate + Anno ─────────────────────────────────────── */
function Plate({ src, alt, col, label, caption }:
  { src:string; alt:string; col:string; label:string; caption:string }) {
  return (
    <figure style={{margin:0,borderRadius:7,overflow:"hidden",
      border:`1px solid ${col}55`,background:"#05070b",
      boxShadow:`0 0 28px ${col}1a`}}>
      <img src={src} alt={alt} loading="lazy" style={{width:"100%",display:"block"}} />
      <figcaption style={{padding:"9px 13px",borderTop:`1px solid ${col}22`,
        background:`linear-gradient(180deg,${col}08,transparent)`}}>
        <div style={{fontFamily:MN,fontSize:8,color:col,letterSpacing:"0.15em",marginBottom:4}}>{label}</div>
        <div style={{fontSize:10.5,color:"rgba(200,210,228,0.65)",lineHeight:1.6}}>{caption}</div>
      </figcaption>
    </figure>
  );
}

function Anno({ col, k, v }: { col:string; k:string; v:string }) {
  return (
    <div style={{background:`${col}0d`,border:`1px solid ${col}2e`,borderRadius:4,padding:"7px 10px"}}>
      <div style={{fontFamily:MN,fontSize:8,color:col,fontWeight:700,marginBottom:3}}>{k}</div>
      <div style={{fontSize:9.5,color:"rgba(185,200,222,0.65)",lineHeight:1.52}}>{v}</div>
    </div>
  );
}

/* ── main page ────────────────────────────────────────── */
export default function CircularFarmPage() {
  const canvasRef  = useRef<HTMLCanvasElement>(null);
  const tRef       = useRef(0);
  const animRef    = useRef(0);
  const plantsRef  = useRef<PlantState[]>(
    Array.from({length:N_PLANTS},(_,i)=>({stage:Math.floor(Math.random()*4) as Stage,age:Math.floor(Math.random()*CYCLE_TICKS),cropIdx:i%CROPS.length}))
  );
  const robotsRef  = useRef<RobotState[]>(
    Array.from({length:N_ROBOTS},(_,ri)=>{const target=Math.floor((ri/N_ROBOTS)*N_PLANTS);return{plantTarget:target,x:0,y:0,progress:ri/N_ROBOTS,carrying:false};})
  );
  const [stats,setStats]=useState({psi:0.618,harvested:0,tick:0,powerKW:0,goldScore:0,activeRobots:4,cropCounts:CROPS.map(()=>0)});
  const [solarEff,setSolarEff]=useState(0.22);
  const [farmScale,setFarmScale]=useState(1.0);
  const [paused,setPaused]=useState(false);
  const pausedRef=useRef(false); pausedRef.current=paused;

  const tickFarm=useCallback(()=>{
    const plants=plantsRef.current, robots=robotsRef.current, t=tRef.current;
    if (!pausedRef.current) {
      tRef.current++;
      for (let i=0;i<N_PLANTS;i++) {
        plants[i].age++;
        const growTime=(CYCLE_TICKS/4)*(1+0.3*Math.sin(i*PHI));
        if (plants[i].age>growTime && plants[i].stage<3) plants[i].stage=(plants[i].stage+1) as Stage;
        if (plants[i].stage===3 && plants[i].age>CYCLE_TICKS) { plants[i].stage=0; plants[i].age=0; }
      }
      const canvas=canvasRef.current;
      if (canvas) {
        const W=canvas.width,H=canvas.height,cx=W/2,cy=H/2,R=Math.min(W,H)*0.46;
        for (let ri=0;ri<N_ROBOTS;ri++) {
          const rb=robots[ri],robot=ROBOTS[ri];
          const tp=farmPos(rb.plantTarget,R,cx,cy);
          const dx=tp.x-rb.x,dy=tp.y-rb.y,dist=Math.sqrt(dx*dx+dy*dy);
          const speed=1.5+ri*0.3;
          if (dist<speed+2) {
            if (robot.id==="harvester"&&plants[rb.plantTarget].stage===3){plants[rb.plantTarget].stage=0;plants[rb.plantTarget].age=0;rb.carrying=false;}
            let next=(rb.plantTarget+Math.round(N_PLANTS/N_ROBOTS))%N_PLANTS;
            if (robot.id==="harvester"){const h=plants.findIndex((p,j)=>j!==rb.plantTarget&&p.stage===3);if(h!==-1)next=h;}
            else if (robot.id==="seeder"){const s=plants.findIndex((p,j)=>j!==rb.plantTarget&&p.stage===0);if(s!==-1)next=s;}
            else {next=(rb.plantTarget+Math.ceil(N_PLANTS/12))%N_PLANTS;}
            rb.plantTarget=next; rb.carrying=robot.id==="harvester"&&plants[next]?.stage===3;
          } else { rb.x+=(dx/dist)*speed; rb.y+=(dy/dist)*speed; }
        }
      }
    }
    let sumR=0,sumI=0;
    for (let k=0;k<N_PLANTS;k++) {
      const theta=k*GOLDEN_ANG+t*0.001, phase_k=plants[k].stage/3;
      sumR+=Math.cos(theta)*(0.5+0.5*phase_k); sumI+=Math.sin(theta)*(0.5+0.5*phase_k);
    }
    const psi=Math.sqrt(sumR*sumR+sumI*sumI)/N_PLANTS;
    const G_s=900, A_fib=N_PLANTS*PHI*PHI*farmScale*0.01, powerW=solarEff*G_s*A_fib;
    const harvestedIdx=plants.filter(p=>p.stage===3).map(p=>p.cropIdx);
    const goldScore=harvestedIdx.length>0?harvestedIdx.reduce((s,ci)=>s+CROPS[ci].gold,0)/harvestedIdx.length:0;
    const cropCounts=CROPS.map((_,ci)=>plants.filter(p=>p.cropIdx===ci&&p.stage>=2).length);
    if (t%6===0) setStats({psi,harvested:plants.filter(p=>p.stage===0).length,tick:t,powerKW:powerW/1000,goldScore,activeRobots:4,cropCounts});
    if (canvasRef.current) drawFarm(canvasRef.current,plants,robots,t,psi);
    animRef.current=requestAnimationFrame(tickFarm);
  },[solarEff,farmScale]);

  useEffect(()=>{
    const canvas=canvasRef.current;
    if (canvas) {
      canvas.width=canvas.offsetWidth||480; canvas.height=canvas.offsetHeight||480;
      const W=canvas.width,H=canvas.height,cx=W/2,cy=H/2,R=Math.min(W,H)*0.46;
      robotsRef.current.forEach((rb,ri)=>{const pos=farmPos(ri*Math.floor(N_PLANTS/N_ROBOTS),R,cx,cy);rb.x=pos.x;rb.y=pos.y;});
    }
    const resize=()=>{if(canvasRef.current){canvasRef.current.width=canvasRef.current.offsetWidth||480;canvasRef.current.height=canvasRef.current.offsetHeight||480;}};
    window.addEventListener("resize",resize);
    animRef.current=requestAnimationFrame(tickFarm);
    return()=>{cancelAnimationFrame(animRef.current);window.removeEventListener("resize",resize);};
  },[tickFarm]);

  const psiPct=(stats.psi*100).toFixed(1);
  const psiBar=Math.min(100,stats.psi*161.8);
  const annoGrid: React.CSSProperties = {display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(160px,1fr))",gap:7,marginTop:9};

  return (
    <div style={{minHeight:"100%",display:"flex",flexDirection:"column",background:"rgb(2,8,18)",color:G,...mono,fontSize:11}}>

      {/* ── page header ── */}
      <div style={{padding:"12px 16px 0",flexShrink:0}}>
        <div style={{display:"inline-block",background:"rgba(68,204,119,0.07)",border:"1px solid rgba(68,204,119,0.22)",
          borderRadius:8,padding:"0.3rem 1rem",fontSize:"0.7rem",letterSpacing:"0.2em",color:"#44cc77",textTransform:"uppercase",marginBottom:10}}>
          Dynamic Interchange Simulation · Live
        </div>
        <div style={{background:"rgba(2,8,18,0.9)",border:"1px solid rgba(68,204,119,0.12)",
          borderLeft:"3px solid #44cc77",borderRadius:10,padding:16,marginBottom:12}}>
          <h2 style={{fontSize:16,color:"#a0f8d0",margin:"0 0 5px"}}>
            AETHER Dynamic Interchange · Circular AI Farm · Cosmological Growth Simulation
          </h2>
          <p style={{fontSize:11,color:"rgba(68,204,119,0.35)",margin:"0 0 12px",lineHeight:1.6}}>
            φ-spiral farm simulation unified with entropy/growth factor expansion, Hubble parameter H(a) timeline, and energy density ρ(a) cosmological scaling — plus four annotated knowledge images connecting quantum colour charge, SU(3) scale-invariant geometry, phase-conjugate burst dynamics, and regulatory dark matter to the AETHER coherence field.
          </p>
          <CircularFarmBadgeCanvas />
        </div>
      </div>

      {/* ── farm header bar ── */}
      <div style={{padding:"8px 16px",borderBottom:`1px solid ${BRD}`,flexShrink:0}}>
        <div style={{display:"flex",alignItems:"center",gap:20,flexWrap:"wrap"}}>
          <span style={{fontSize:12,letterSpacing:4,fontWeight:700}}>CIRCULAR AI FARM · φ-COHERENCE ENGINE</span>
          <div style={{marginLeft:"auto",display:"flex",gap:20,fontSize:10,flexWrap:"wrap"}}>
            <span style={{color:"#60a5fa"}}><span style={{opacity:0.5}}>ψ: </span>{psiPct}%</span>
            <span style={{color:"#fbbf24"}}><span style={{opacity:0.5}}>⚡ </span>{stats.powerKW.toFixed(2)} kW</span>
            <span style={{color:"#fbbf24"}}><span style={{opacity:0.5}}>GOLD: </span>{stats.goldScore.toFixed(1)}%</span>
            <span><span style={{opacity:0.4}}>TICK: </span>{stats.tick}</span>
            <button onClick={()=>setPaused(p=>!p)}
              style={{background:"rgba(0,255,136,0.08)",border:`1px solid ${DIM}`,color:G,borderRadius:4,padding:"2px 10px",cursor:"pointer",fontSize:9}}>
              {paused?"▶ RUN":"⏸ PAUSE"}
            </button>
          </div>
        </div>
      </div>

      {/* ── pipeline ── */}
      <div style={{display:"flex",padding:"5px 16px",borderBottom:`1px solid ${BRD}`,gap:0,flexShrink:0}}>
        {[{label:"φ-PLACEMENT",sub:"golden angle 137.508°"},{label:"COHERENT GROWTH",sub:"Kuramoto ψ gate"},{label:"ROBOT HARVEST",sub:"maturity threshold"},{label:"SOLAR LOOP",sub:"η·G_s·A_φ"},{label:"GOLD OUTPUT",sub:"purity score"}].map((s,i)=>(
          <div key={s.label} style={{display:"flex",alignItems:"center",flex:1}}>
            <div style={{flex:1,textAlign:"center"}}>
              <div style={{fontSize:8,letterSpacing:2,color:G,opacity:0.8}}>{s.label}</div>
              <div style={{fontSize:7,opacity:0.3}}>{s.sub}</div>
            </div>
            {i<4&&<div style={{color:DIM,fontSize:11}}>→</div>}
          </div>
        ))}
      </div>

      {/* ── main 3-panel ── */}
      <div style={{flex:"0 0 auto",display:"grid",gridTemplateColumns:"1.6fr 1fr 1fr",gap:8,padding:8,minHeight:340}}>
        {/* farm canvas */}
        <div style={{border:"1px solid rgba(0,255,136,0.2)",borderRadius:6,display:"flex",flexDirection:"column",overflow:"hidden"}}>
          <div style={{padding:"5px 10px",fontSize:8,letterSpacing:3,color:G,opacity:0.7,borderBottom:`1px solid ${BRD}`,display:"flex",justifyContent:"space-between"}}>
            <span>⬡ FIBONACCI SPIRAL FARM · φ = {PHI.toFixed(7)}</span>
            <span style={{opacity:0.5}}>∠ = 137.508° · N={N_PLANTS}</span>
          </div>
          <canvas ref={canvasRef} style={{flex:1,display:"block",width:"100%",height:"100%"}} />
          <div style={{padding:"5px 10px",borderTop:`1px solid ${BRD}`}}>
            <div style={{display:"flex",justifyContent:"space-between",fontSize:8,opacity:0.5,marginBottom:3}}>
              <span>Kuramoto ψ</span><span>{psiPct}% / target: 61.8% (1/φ)</span>
            </div>
            <div style={{height:4,background:"rgba(0,255,136,0.08)",borderRadius:2}}>
              <div style={{height:"100%",width:`${psiBar}%`,background:"linear-gradient(90deg,#0ea5e9,#00ff88)",borderRadius:2,transition:"width 0.3s"}} />
            </div>
          </div>
        </div>
        {/* robot + equations */}
        <div style={{display:"flex",flexDirection:"column",gap:8}}>
          <div style={{border:"1px solid rgba(96,165,250,0.25)",borderRadius:6,flexShrink:0}}>
            <div style={{padding:"5px 10px",fontSize:8,letterSpacing:3,color:"#60a5fa",opacity:0.8,borderBottom:"1px solid rgba(96,165,250,0.12)"}}>◉ ROBOT FLEET · {stats.activeRobots} ACTIVE</div>
            {ROBOTS.map((r,ri)=>(
              <div key={r.id} style={{padding:"5px 10px",borderBottom:ri<3?"1px solid rgba(96,165,250,0.06)":"none"}}>
                <div style={{display:"flex",alignItems:"center",gap:6,marginBottom:2}}>
                  <span style={{color:r.col,fontSize:12}}>{r.glyph}</span>
                  <span style={{color:r.col,fontSize:8,letterSpacing:2,fontWeight:700}}>{r.name}</span>
                  <span style={{marginLeft:"auto",fontSize:7,color:"#22c55e",opacity:0.7}}>● ACTIVE</span>
                </div>
                <div style={{fontSize:7,opacity:0.35,lineHeight:1.4}}>{r.role}</div>
              </div>
            ))}
          </div>
          <div style={{border:"1px solid rgba(251,191,36,0.2)",borderRadius:6,flex:1,overflow:"auto"}}>
            <div style={{padding:"5px 10px",fontSize:8,letterSpacing:3,color:"rgba(251,191,36,0.8)",borderBottom:"1px solid rgba(251,191,36,0.1)"}}>∑ AETHER EQUATIONS</div>
            <div style={{padding:"8px 10px",display:"flex",flexDirection:"column",gap:8}}>
              {[
                {label:"φ-Spiral",eq:"r_n = R·√(n/N)",sub:"θ_n = n·137.508°",col:"#06b6d4"},
                {label:"Kuramoto ψ",eq:"ψ = (1/N)|Σ eⁱθₖ|",sub:"ψ_φ → 1/φ ≈ 0.618",col:"#00ff88"},
                {label:"Solar P",eq:"P = η·G_s·A_φ·cos(δ)",sub:"A_φ = N·φ²·scale",col:"#fbbf24"},
                {label:"Entropy S",eq:"S(t)=S_max(1−e^{−λt})",sub:"rises, saturates",col:"#ec4899"},
                {label:"Growth G",eq:"G(t)=G₀·e^{α·S/S_max}",sub:"exponential expansion",col:"#f97316"},
                {label:"Hubble H",eq:"H=H₀√(Ω_r/a⁴+Ω_m/a³+Ω_Λ)",sub:"farm phase → scale a",col:"#3b82f6"},
                {label:"Energy ρ",eq:"ρ_m∝a⁻³ ρ_r∝a⁻⁴ ρ_Λ=const",sub:"nutrient density ↔ ρ_m",col:GOLD},
              ].map(e=>(
                <div key={e.label} style={{borderLeft:`2px solid ${e.col}40`,paddingLeft:8}}>
                  <div style={{fontSize:7,color:e.col,opacity:0.6,letterSpacing:1,marginBottom:1}}>{e.label}</div>
                  <div style={{fontSize:9,color:e.col,fontWeight:700}}>{e.eq}</div>
                  <div style={{fontSize:6.5,opacity:0.35}}>{e.sub}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
        {/* power + nutrition */}
        <div style={{display:"flex",flexDirection:"column",gap:8}}>
          <div style={{border:"1px solid rgba(251,191,36,0.3)",borderRadius:6,flexShrink:0}}>
            <div style={{padding:"5px 10px",fontSize:8,letterSpacing:3,color:"rgba(251,191,36,0.8)",borderBottom:"1px solid rgba(251,191,36,0.15)"}}>⚡ FREE SOLAR POWER</div>
            <div style={{padding:"8px 10px",display:"flex",flexDirection:"column",gap:5}}>
              {[
                {label:"G_s irradiance",val:"900 W/m²",col:"#fbbf24"},
                {label:"η efficiency",val:`${(solarEff*100).toFixed(0)}%`,col:"#fbbf24"},
                {label:"A_φ area",val:`${(N_PLANTS*PHI*PHI*farmScale*0.01).toFixed(1)} m²`,col:"#60a5fa"},
                {label:"Output P",val:`${stats.powerKW.toFixed(2)} kW`,col:"#00ff88"},
                {label:"Daily kWh",val:`${(stats.powerKW*7).toFixed(1)} kWh`,col:"#22c55e"},
              ].map(row=>(
                <div key={row.label} style={{display:"flex",justifyContent:"space-between",fontSize:8}}>
                  <span style={{opacity:0.45}}>{row.label}</span>
                  <span style={{color:row.col,fontWeight:700}}>{row.val}</span>
                </div>
              ))}
            </div>
          </div>
          <div style={{border:"1px solid rgba(251,191,36,0.4)",borderRadius:6,flex:1,overflow:"auto"}}>
            <div style={{padding:"5px 10px",fontSize:8,letterSpacing:3,color:"#fbbf24",borderBottom:"1px solid rgba(251,191,36,0.15)"}}>✦ GOLD NUTRITION SCORE</div>
            <div style={{padding:"8px 10px"}}>
              <div style={{textAlign:"center",marginBottom:8}}>
                <div style={{fontSize:28,fontWeight:700,color:"#fbbf24",lineHeight:1}}>{stats.goldScore>0?stats.goldScore.toFixed(1):"--"}</div>
                <div style={{fontSize:7,opacity:0.4,letterSpacing:2}}>PURITY INDEX · /100</div>
                <div style={{height:3,background:"rgba(251,191,36,0.1)",borderRadius:2,marginTop:6}}>
                  <div style={{height:"100%",width:`${stats.goldScore}%`,background:"linear-gradient(90deg,#f97316,#fbbf24,#fef9c3)",borderRadius:2,transition:"width 0.5s"}} />
                </div>
              </div>
              <div style={{display:"flex",flexDirection:"column",gap:3,maxHeight:160,overflow:"auto"}}>
                {CROPS.map((c,ci)=>(
                  <div key={c.id} style={{display:"flex",alignItems:"center",gap:5,fontSize:7}}>
                    <div style={{width:6,height:6,borderRadius:"50%",background:c.col,flexShrink:0}} />
                    <span style={{color:c.col,minWidth:70}}>{c.name}</span>
                    <div style={{flex:1,height:2,background:"rgba(255,255,255,0.05)",borderRadius:1}}>
                      <div style={{height:"100%",width:`${c.gold}%`,background:c.col,borderRadius:1,opacity:stats.cropCounts[ci]>0?1:0.2}} />
                    </div>
                    <span style={{color:"#ffffff40",minWidth:22,textAlign:"right"}}>{c.gold}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── controls ── */}
      <div style={{padding:"6px 16px",borderTop:`1px solid ${BRD}`,display:"flex",gap:20,alignItems:"center",flexShrink:0,flexWrap:"wrap"}}>
        <div style={{fontSize:8,opacity:0.4,flex:"0 0 auto",maxWidth:200,lineHeight:1.5}}>
          φ-spiral: every seed at 137.5° — the only angle that never repeats — guaranteeing equal light, water, and robot access.
        </div>
        <div style={{display:"flex",gap:20,flex:1,flexWrap:"wrap",alignItems:"center"}}>
          <label style={{width:160,display:"flex",flexDirection:"column",gap:2}}>
            <div style={{display:"flex",justifyContent:"space-between",fontSize:8,opacity:0.5}}>
              <span>Solar η = {(solarEff*100).toFixed(0)}%</span><span>efficiency</span>
            </div>
            <input type="range" min={0.10} max={0.40} step={0.01} value={solarEff}
              onChange={e=>setSolarEff(parseFloat(e.target.value))} style={{width:"100%",accentColor:"#fbbf24"}} />
          </label>
          <label style={{width:160,display:"flex",flexDirection:"column",gap:2}}>
            <div style={{display:"flex",justifyContent:"space-between",fontSize:8,opacity:0.5}}>
              <span>Farm scale = {farmScale.toFixed(1)}×</span><span>area / scale-a</span>
            </div>
            <input type="range" min={0.5} max={3.0} step={0.1} value={farmScale}
              onChange={e=>setFarmScale(parseFloat(e.target.value))} style={{width:"100%",accentColor:G}} />
          </label>
        </div>
      </div>

      {/* ── cosmological simulations ── */}
      <div style={{padding:"8px 8px 0",flexShrink:0}}>
        <div style={{fontFamily:OR,fontSize:9,color:GOLD,letterSpacing:2,marginBottom:8,paddingLeft:4}}>
          COSMOLOGICAL INTERCHANGE SIMULATIONS
        </div>
        <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:8}}>
          {/* entropy / growth */}
          <div style={{border:`1px solid ${PINK}33`,borderRadius:6,padding:"8px 10px",minHeight:230}}>
            <div style={{fontFamily:MN,fontSize:8,color:PINK,letterSpacing:"0.15em",marginBottom:6}}>
              ENTROPY & EXPANSION OF GROWTH FACTOR
            </div>
            <div style={{fontSize:7,color:`${PINK}66`,marginBottom:8,lineHeight:1.5}}>
              S(t) rises as farm ages · G(t) expands exponentially with entropy · maps growth factor to thermodynamic arrow of time
            </div>
            <div style={{height:160}}>
              <EntropyGrowthSim tick={stats.tick} />
            </div>
          </div>
          {/* hubble */}
          <div style={{border:`1px solid ${BLUE}33`,borderRadius:6,padding:"8px 10px",minHeight:230}}>
            <div style={{fontFamily:MN,fontSize:8,color:BLUE,letterSpacing:"0.15em",marginBottom:6}}>
              HUBBLE PARAMETER H(a) & TIME
            </div>
            <div style={{fontSize:7,color:`${BLUE}66`,marginBottom:8,lineHeight:1.5}}>
              Farm growth phase → scale factor a · H(a) shows radiation-matter-Lambda transition · cursor tracks farm cycle
            </div>
            <div style={{height:160}}>
              <HubbleTimelineSim tick={stats.tick} />
            </div>
          </div>
          {/* energy density */}
          <div style={{border:`1px solid ${GOLD}33`,borderRadius:6,padding:"8px 10px",minHeight:230}}>
            <div style={{fontFamily:MN,fontSize:8,color:GOLD,letterSpacing:"0.15em",marginBottom:6}}>
              ENERGY DENSITY ρ(a) & SCALE
            </div>
            <div style={{fontSize:7,color:`${GOLD}66`,marginBottom:8,lineHeight:1.5}}>
              Log-log ρ vs scale factor · ρ_m∝a⁻³ (matter), ρ_r∝a⁻⁴ (radiation), ρ_Λ=const · farm nutrient density = gold dot
            </div>
            <div style={{height:160}}>
              <EnergyDensitySim farmScale={farmScale} psi={stats.psi} />
            </div>
          </div>
        </div>
      </div>

      {/* ── knowledge image plates ── */}
      <div style={{padding:"12px 8px 0",flexShrink:0}}>
        <div style={{fontFamily:OR,fontSize:9,color:TEAL,letterSpacing:2,marginBottom:10,paddingLeft:4}}>
          KNOWLEDGE INTERCHANGE · ANNOTATED INFOGRAPHICS
        </div>

        {/* Color Ladder SU3 */}
        <div style={{background:"rgba(0,0,0,0.4)",border:`1px solid ${GOLD}22`,borderRadius:6,padding:"12px 14px",marginBottom:10}}>
          <Plate src={imgColorLadder} col={GOLD}
            alt="The Color Ladder: Quark to Cosmological SU(3) scale-invariant coherence geometry, AETHER/CUCA mapping"
            label="THE COLOR LADDER · SU(3) SCALE-INVARIANT COHERENCE GEOMETRY · QUARK TO COSMOLOGICAL"
            caption="Eight scale rows — Quark, Hadron, Cell, Tissue, Organ, Organism, Ecosystem, Cosmological — each mapped to its SU(3) analog, physical state, and AETHER/CUCA interpretation. Colour neutrality (R+G+B) = stability = coherence. Broken SU(3) symmetry = tumour state = decoherence = malignancy. The L1-L6 CLCS stack maps directly onto the colour ladder: L1 substrate (atomic orbital binding) → L6 cosmological (QCD vacuum substrate, AETHER Fabric)." />
          <div style={annoGrid}>
            <Anno col={GOLD} k="Quark Scale (L1)"
              v="Literal colour charge R/G/B on u, d, s quarks. L1 substrate: electron transport, atomic orbital binding — the hardware layer." />
            <Anno col={GOLD} k="Hadron Scale (L2)"
              v="R+G+B → colourless singlet = proton, neutron, baryon. L2 BNAQT: coherent quantum tunnelling, atomic colourless singlet." />
            <Anno col={GRN}  k="Cell Scale (L3)"
              v="3-quark baryon = coherent triad. 3-oscillator Kuramoto lock at L3: three-oscillator phase lock = cellular coherence." />
            <Anno col={GRN}  k="Tissue Scale (L4)"
              v="SU(3) gauge field mediates inter-quark force. ECM signalling at L4/L5: CLCS control field C(x,t) as gauge potential." />
            <Anno col={ORG}  k="Organ/Organism Scale (L5)"
              v="Confinement — quarks never isolated. L5 coherence confinement: no subsystem decouples from the whole." />
            <Anno col={GOLD} k="Tumour State"
              v="Broken SU(3) symmetry = unbalanced colour charge. C(x,t) → 0: decoherence = malignancy. Cancer is a coherence failure." />
            <Anno col={TEAL} k="Ecosystem Scale (L6)"
              v="Gluon field binding = network topology. Biosphere coupling: L6 CUCA meta-learning, binding force between nodes." />
            <Anno col={VIO}  k="Cosmological Scale"
              v="QCD vacuum energy, gluon condensate, quantum vacuum substrate. AETHER Fabric = geophysical EM substrate = Layer 0." />
          </div>
        </div>

        {/* Active Non-Associative Manifold */}
        <div style={{background:"rgba(0,0,0,0.4)",border:`1px solid ${VIO}22`,borderRadius:6,padding:"12px 14px",marginBottom:10}}>
          <Plate src={imgManifold} col={VIO}
            alt="Active Non-Associative Manifold and Phase Conjugate Burst Model: quaternions, 8D Fano plane, LPE threshold, spatiotemporal burst, BaTiO3 phase conjugate, entropy nullification, ~ to o to n to S pathway"
            label="ACTIVE NON-ASSOCIATIVE MANIFOLD · PHASE CONJUGATE BURST MODEL · QUATERNIONIC BASIS · FANO PLANE · ENTROPY NULLIFICATION"
            caption="A nine-panel control system for phase-coherent computation. Top row: Quaternionic Basis q (Hamilton relations, non-commutative), 8D Non-associative Fano Plane (e1-e7 basis), Phase Conjugate BaTiO3 Crystal (VHF 30-300 MHz, domains). Middle: LPE Threshold Transition (0.65 gate), Spatiotemporal Burst Event dC_burst = A·delta3(x-xb)·e^(-t/tau), System Wavefunction Deviation dPsi (local entropy map). Bottom: Restab q* conjugate calculation, Active Entropy Nullification (BaTiO3 response + system distortion -> dPsi→0), ~ to o to n to S stability pathway." />
          <div style={annoGrid}>
            <Anno col={VIO}  k="Quaternionic Basis q"
              v="q = a+bi+cj+dk with Hamilton relations i²=j²=k²=ijk=-1. Non-commutative: ij ≠ ji — the algebra of 3D rotations and spin." />
            <Anno col={VIO}  k="8D Non-associative Fano Plane"
              v="7 imaginary units e1-e7 spanning the octonions (8D) — non-associative: (ei·ej)·ek ≠ ei·(ej·ek). Foundation of G2 symmetry and M-theory." />
            <Anno col={BLUE} k="LPE Threshold 0.65"
              v="System state |q|² < 0.65: linear regime. Above 0.65: non-linear burst detected. The threshold gates phase-conjugate activation." />
            <Anno col={PINK} k="Spatiotemporal Burst dC_burst"
              v="dC_burst = A·delta3(x-xb)·e^(-t/tau) — a Dirac-delta-localised burst in space decaying exponentially in time. Shear + EM components." />
            <Anno col={PINK} k="System Wavefunction Deviation dPsi"
              v="Map of local entropy/disorder. dPsi > 0: system has deviated from coherence. BaTiO3 phase conjugate response drives dPsi → 0." />
            <Anno col={GRN}  k="~ → o → n → S Pathway"
              v="Fluctuation (~) → Octonionic (o) → Non-associative (n) → Stability (S). Active entropy nullification restores the coherence manifold." />
          </div>
        </div>

        {/* Quarks */}
        <div style={{background:"rgba(0,0,0,0.4)",border:`1px solid ${TEAL}22`,borderRadius:6,padding:"12px 14px",marginBottom:10}}>
          <Plate src={imgQuarks} col={TEAL}
            alt="Quarks: Colour Charge, Confinement, Always Bound — six quarks, colour force, strong force, asymptotic freedom, baryons and mesons"
            label="QUARKS · COLOUR CHARGE · CONFINEMENT · ALWAYS BOUND · 6 FLAVOURS · STRONG FORCE"
            caption="Four panels: (1) Six quark flavours — up (2.2 MeV, +2/3), down (4.7 MeV, -1/3), strange (96 MeV), charm (1.28 GeV), bottom (4.18 GeV), top (173.1 GeV). (2) Colour confinement and hadronization: colour force potential rises with separation, eventually producing new quark-antiquark pairs; proton (uud RGB baryon), neutron (udd), pion (quark-antiquark meson). (3) Strong force via gluon exchange: asymptotic freedom (weak at short range, strong at long range), strong force wins over EM repulsion in nuclei. (4) Mass and abundance: top quark is ~78,000x heavier than up quark; up/down dominate cosmic abundance." />
          <div style={annoGrid}>
            <Anno col={TEAL} k="6 Quark Flavours"
              v="Up (+2/3, 2.2 MeV), Down (-1/3, 4.7 MeV), Strange (-1/3, 96 MeV), Charm (+2/3, 1.28 GeV), Bottom (-1/3, 4.18 GeV), Top (+2/3, 173.1 GeV)." />
            <Anno col={TEAL} k="Colour Charge (R/G/B)"
              v="All quarks carry one of three colour charges. No free quarks observed — always confined in colour-neutral hadrons (R+G+B or colour-anticolour)." />
            <Anno col={GRN}  k="Colour Force Potential"
              v="Unlike gravity/EM, the colour force does not decrease with distance — it rises linearly. Quark isolation would require infinite energy (hadronization occurs first)." />
            <Anno col={GRN}  k="Asymptotic Freedom"
              v="The strong coupling constant decreases at high energy / short distance — quarks are nearly free inside the proton. Gross, Politzer, Wilczek 2004 Nobel Prize." />
            <Anno col={BLUE} k="Baryons vs Mesons"
              v="Baryons: 3 quarks (R+G+B = colourless). Proton = uud, Neutron = udd. Mesons: quark-antiquark pair (colour + anticolour). Pion = pi- (d-ubar), short-lived." />
            <Anno col={VIO}  k="Quark-Gluon Plasma"
              v="At extreme density/temperature (early universe, LHC heavy-ion collisions), quarks deconfine into QGP — the state of matter 10 microseconds after the Big Bang." />
          </div>
        </div>

        {/* Regulatory Dark Matter ncRNA */}
        <div style={{background:"rgba(0,0,0,0.4)",border:`1px solid ${GRN}22`,borderRadius:6,padding:"12px 14px",marginBottom:10}}>
          <Plate src={imgRegDark} col={GRN}
            alt="The Regulatory Dark Matter: Non-Coding RNA and Distributed Biological Coherence — four panels: ncRNA depth, splicing and epigenomic memory, cross-system feedback, distributed coherence and the prism principle"
            label="REGULATORY DARK MATTER · NON-CODING RNA · DISTRIBUTED BIOLOGICAL COHERENCE · 4 PANELS"
            caption="Four panels: (1) ncRNA Regulatory Depth — 98% of transcribed RNA is non-coding (miRNA 22nt, lncRNA >200nt, siRNA/piRNA). (2) Alternative Splicing as Compositional Intelligence — DSCAM 38,000 isoforms; Epigenome as Writable Memory (Mnesis) — Ac/Me/diet/light/stress modify accessibility without changing sequence. (3) Cross-System Feedback Loops — intuition as multi-system inference: immune (IL-6/TNF-alpha) -> neural (microglia synaptic pruning) -> hormonal (CRH/ACTH/cortisol) -> metabolic (insulin/glucagon, gut GABA/serotonin); gut feeling = metabolic-neural feedback at anterior insula. (4) Distributed Coherence — regulatory depth as prism applied to biology: white light (genome) decomposed into complexity (epigenetics, ncRNA, splicing) by the prism; the code is fixed, the regulatory apparatus is alive." />
          <div style={annoGrid}>
            <Anno col={GRN}  k="98% Non-Coding RNA"
              v="Only ~2% of transcribed RNA becomes protein. The other 98% (miRNA, lncRNA, siRNA, piRNA) forms a vast regulatory architecture — the biological dark matter." />
            <Anno col={GRN}  k="miRNA (microRNA, ~22nt)"
              v="miR-21 (cancer-related), miR-122 (liver-specific). Binds 3'UTR of target mRNAs via RISC complex, blocks translation or triggers degradation. One miRNA silences hundreds." />
            <Anno col={TEAL} k="lncRNA (>200 nucleotides)"
              v="XIST silences the entire X chromosome. HOTAIR drives H3K27 methylation. Chromatin remodelling, splicing regulation, transcription decoy — molecular scaffolding." />
            <Anno col={GOLD} k="Alternative Splicing (Mnesis)"
              v="DSCAM produces 38,000 isoforms. One structure, many outputs. Epigenome as writable memory: Ac/Me/diet/light/stress modify gene accessibility without changing sequence." />
            <Anno col={PINK} k="Cross-System Feedback (Intuition)"
              v="Intuition = multi-system inference: immune cytokines alter synaptic pruning; CRH-ACTH-cortisol stress cascade; gut GABA/serotonin -> gut-brain axis; gut feeling = metabolic-neural feedback at anterior insula and prefrontal cortex." />
            <Anno col={GRN}  k="Distributed Coherence (Prism)"
              v="White light (genome) appears simple. Prism (regulatory depth) decomposes it: epigenetics + ncRNA + splicing = decomposed complexity. The code is fixed; the regulatory apparatus is alive." />
          </div>
        </div>
      </div>

      {/* ── theory strip ── */}
      <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",borderTop:`1px solid ${BRD}`,flexShrink:0,marginTop:8}}>
        {[
          {title:"φ-SPIRAL PLACEMENT",col:"#06b6d4",body:"Each crop at θ_n=n×137.508°, r_n=R√(n/N). The irrational golden angle ensures no two plants share a ray — maximum light exposure, zero geometric interference. Nature's most efficient packing algorithm."},
          {title:"ENTROPY → GROWTH",col:PINK,body:"S(t)=S_max(1−e^{−λt}) saturates as the farm matures. G(t)=G₀·e^{α·S/S_max} maps the thermodynamic arrow of time directly to biological expansion. Higher entropy → higher growth factor — the farm runs on disorder."},
          {title:"HUBBLE H(a) SCALING",col:BLUE,body:"Farm phase → scale factor a. H(a)=H₀√(Ω_r/a⁴+Ω_m/a³+Ω_Λ). Early farm (small a): radiation-dominated, H falls fast. Mature farm (a~1): matter-dominated. Expanded farm (a>1): Lambda-driven slow decay."},
          {title:"ENERGY DENSITY ρ(a)",col:GOLD,body:"ρ_m∝a⁻³, ρ_r∝a⁻⁴, ρ_Λ=const. Farm nutrient density maps to ρ_m: as the farm scales (a grows), nutrient density per unit area drops with the cube — requiring coherent concentration (ψ weighting) to maintain quality."},
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
