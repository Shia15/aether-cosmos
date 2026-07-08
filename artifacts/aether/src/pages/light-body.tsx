import { useEffect, useRef, useState } from "react";
import { Link } from "wouter";

const BG="#04060d",PAN="#0a0d1a",PAN2="#0d1020",BORDER="#182038",TEXT="#b8cce8",MUTED="#5a6e8c";
const GOLD="#ffb830",CYAN="#3fd8d0",VIOLET="#a87aff",GREEN="#50d49a",BLUE="#4ab0ff",ROSE="#ff5a6a";

function hexA(h:string,a:number){const n=h.replace("#","");return `rgba(${parseInt(n.slice(0,2),16)},${parseInt(n.slice(2,4),16)},${parseInt(n.slice(4,6),16)},${a})`;}
function fitCanvas(cv:HTMLCanvasElement,ctx:CanvasRenderingContext2D){const dpr=Math.min(2,window.devicePixelRatio||1);const w=cv.clientWidth||640;const h=cv.clientHeight||340;cv.width=Math.round(w*dpr);cv.height=Math.round(h*dpr);ctx.setTransform(dpr,0,0,dpr,0,0);return{w,h};}
function segDist(px:number,py:number,ax:number,ay:number,bx:number,by:number){
  const dx=bx-ax,dy=by-ay; const l2=dx*dx+dy*dy;
  let t=l2>0?((px-ax)*dx+(py-ay)*dy)/l2:0; t=Math.max(0,Math.min(1,t));
  const cx=ax+t*dx,cy=ay+t*dy; return Math.hypot(px-cx,py-cy);
}
function lerp(a:number,b:number,t:number){return a+(b-a)*t;}

const EPOCHS=[
  {t:0.00,name:"Big Bang · t = 0",temp:"10³² K",note:"Pure symmetry — infinite density, zero structure, all potential"},
  {t:0.09,name:"Inflation",temp:"10²⁷ K",note:"Space unfurls; quantum ripples seed every future structure"},
  {t:0.20,name:"Quark–Gluon Plasma",temp:"10¹² K",note:"A blazing fog of free quarks — no bound matter yet"},
  {t:0.32,name:"Nucleosynthesis",temp:"10⁹ K",note:"Protons and neutrons fuse into the first light nuclei"},
  {t:0.45,name:"Recombination · First Light",temp:"3000 K",note:"Atoms form, photons fly free — the cosmic light is released"},
  {t:0.58,name:"First Stars & Galaxies",temp:"—",note:"Gravity gathers matter into burning, coherent cores"},
  {t:0.70,name:"Planets & Chemistry",temp:"—",note:"Star-forged heavy elements seed rocky, watery worlds"},
  {t:0.82,name:"First Cells",temp:"—",note:"Matter learns to hold a boundary and keep a clock"},
  {t:0.92,name:"Conscious Life",temp:"—",note:"Coherence turns self-aware across trillions of cells"},
  {t:1.00,name:"Light Body",temp:"—",note:"Full-scale coherence — the crystallized light-field of a being"},
];

function CosmicEmergenceCanvas(){
  const cvRef=useRef<HTMLCanvasElement|null>(null);
  const speedRef=useRef(1);
  const baseRef=useRef<{bx:number;by:number;sx:number;sy:number;ph:number}[]>([]);
  const [read,setRead]=useState({temp:EPOCHS[0].temp,a:0,C:0});
  useEffect(()=>{
    const cv=cvRef.current; if(!cv)return; const ctx=cv.getContext("2d"); if(!ctx)return;
    const N=260, GA=Math.PI*(3-Math.sqrt(5));
    const arr:{bx:number;by:number;sx:number;sy:number;ph:number}[]=[];
    for(let i=0;i<N;i++){
      const k=i/N; const rad=Math.sqrt(k)*0.9; const ang=i*GA;
      arr.push({bx:(Math.random()*2-1),by:(Math.random()*2-1),sx:Math.cos(ang)*rad,sy:Math.sin(ang)*rad,ph:Math.random()*Math.PI*2});
    }
    baseRef.current=arr;
    let raf=0,t=0;
    const loop=()=>{
      const{w,h}=fitCanvas(cv,ctx);
      t+=0.0016*speedRef.current; if(t>1) t=0;
      const ease=t*t*(3-2*t);
      const g=ctx.createLinearGradient(0,0,0,h); g.addColorStop(0,"#05030a"); g.addColorStop(1,"#0a0714");
      ctx.fillStyle=g; ctx.fillRect(0,0,w,h);
      const cx=w*0.5, cy=h*0.46, sc=Math.min(w,h)*0.42;
      const jitter=(1-ease)*0.12;
      for(let i=0;i<baseRef.current.length;i++){
        const p=baseRef.current[i];
        const jx=Math.cos(p.ph+t*30)*jitter, jy=Math.sin(p.ph+t*30)*jitter;
        const x=lerp(p.bx,p.sx,ease)+jx, y=lerp(p.by,p.sy,ease)+jy;
        const px=cx+x*sc, py=cy+y*sc;
        const hue=lerp(8,46,ease);
        const light=lerp(58,72,ease);
        const size=lerp(1.4,2.4,ease);
        ctx.beginPath(); ctx.arc(px,py,size,0,Math.PI*2);
        ctx.fillStyle=`hsla(${hue.toFixed(0)},${(70+ease*20).toFixed(0)}%,${light.toFixed(0)}%,0.9)`;
        ctx.shadowBlur=8*ease; ctx.shadowColor=`hsl(${hue.toFixed(0)},85%,62%)`;
        ctx.fill(); ctx.shadowBlur=0;
      }
      const cg=ctx.createRadialGradient(cx,cy,0,cx,cy,sc*(0.4+ease*0.7));
      cg.addColorStop(0,hexA(GOLD,0.10+0.22*ease)); cg.addColorStop(1,"rgba(0,0,0,0)");
      ctx.fillStyle=cg; ctx.beginPath(); ctx.arc(cx,cy,sc*(0.4+ease*0.7),0,Math.PI*2); ctx.fill();
      const by=h-26, bx0=20, bx1=w-20;
      ctx.strokeStyle=hexA(BORDER,1); ctx.lineWidth=2; ctx.beginPath(); ctx.moveTo(bx0,by); ctx.lineTo(bx1,by); ctx.stroke();
      let curName=EPOCHS[0].name, curNote=EPOCHS[0].note, curTemp=EPOCHS[0].temp;
      for(let e=0;e<EPOCHS.length;e++){
        const ex=bx0+EPOCHS[e].t*(bx1-bx0); const on=t>=EPOCHS[e].t;
        if(on){ curName=EPOCHS[e].name; curNote=EPOCHS[e].note; curTemp=EPOCHS[e].temp; }
        ctx.beginPath(); ctx.arc(ex,by,on?4:2.5,0,Math.PI*2); ctx.fillStyle=on?GOLD:hexA(MUTED,0.6); ctx.fill();
      }
      const nx=bx0+t*(bx1-bx0);
      ctx.beginPath(); ctx.arc(nx,by,5,0,Math.PI*2); ctx.fillStyle=CYAN; ctx.fill();
      ctx.fillStyle=GOLD; ctx.font="600 14px Inter,sans-serif"; ctx.textAlign="center"; ctx.fillText(curName,cx,28);
      ctx.fillStyle=MUTED; ctx.font="10px monospace"; ctx.fillText(curNote,cx,44); ctx.textAlign="left";
      if(Math.round(t*625)%6===0){
        const aScale=(Math.exp(4*t)-1)/(Math.exp(4)-1);
        setRead({temp:curTemp,a:+aScale.toFixed(3),C:+ease.toFixed(2)});
      }
      raf=requestAnimationFrame(loop);
    };
    raf=requestAnimationFrame(loop);
    return()=>cancelAnimationFrame(raf);
  },[]);
  return(
    <div>
      <canvas ref={cvRef} style={{width:"100%",height:360,display:"block",borderRadius:10,border:`1px solid ${BORDER}`}}/>
      <label style={{fontFamily:"monospace",fontSize:11,color:MUTED,display:"block",marginTop:12}}>
        genesis speed
        <input type="range" min={0.2} max={4} step={0.1} defaultValue={1} onChange={e=>(speedRef.current=parseFloat(e.target.value))} style={{marginLeft:8,accentColor:GOLD,width:160}}/>
      </label>
      <div style={{display:"flex",gap:16,flexWrap:"wrap",marginTop:10,fontFamily:"monospace",fontSize:11.5,color:MUTED}}>
        <div>scale factor a: <span style={{color:BLUE}}>{read.a}</span></div>
        <div>temperature: <span style={{color:ROSE}}>{read.temp}</span></div>
        <div>coherence 𝒞: <span style={{color:GOLD}}>{read.C}</span></div>
      </div>
    </div>
  );
}

function inHuman(x:number,y:number){
  if(Math.hypot(x,y+0.78)<0.17) return true;
  if(segDist(x,y,0,-0.55,0,0.12)<0.2) return true;
  if(segDist(x,y,0,-0.4,-0.34,0.06)<0.08) return true;
  if(segDist(x,y,0,-0.4,0.34,0.06)<0.08) return true;
  if(segDist(x,y,0,0.12,-0.15,0.8)<0.1) return true;
  if(segDist(x,y,0,0.12,0.15,0.8)<0.1) return true;
  return false;
}
function inAnimal(x:number,y:number){
  if(segDist(x,y,-0.4,0.0,0.35,0.0)<0.2) return true;
  if(Math.hypot(x-0.52,y+0.08)<0.14) return true;
  if(segDist(x,y,-0.28,0.15,-0.28,0.62)<0.055) return true;
  if(segDist(x,y,-0.05,0.15,-0.05,0.62)<0.055) return true;
  if(segDist(x,y,0.12,0.15,0.12,0.62)<0.055) return true;
  if(segDist(x,y,0.3,0.15,0.3,0.62)<0.055) return true;
  if(segDist(x,y,-0.4,0.0,-0.62,-0.22)<0.045) return true;
  return false;
}
function inTree(x:number,y:number){
  if(segDist(x,y,0,0.9,0,0.05)<0.07) return true;
  if(Math.hypot(x,y+0.3)<0.44) return true;
  return false;
}
const NPTS=200;
function genForm(mask:(x:number,y:number)=>boolean){
  const pts:{x:number;y:number}[]=[]; let g=0;
  while(pts.length<NPTS && g<40000){ g++; const x=Math.random()*2-1; const y=Math.random()*2-1; if(mask(x,y)) pts.push({x,y}); }
  while(pts.length<NPTS) pts.push({x:0,y:0});
  return pts;
}

function LightBodyCanvas(){
  const cvRef=useRef<HTMLCanvasElement|null>(null);
  const CRef=useRef(0.6), formRef=useRef(0);
  const formsRef=useRef([genForm(inHuman),genForm(inAnimal),genForm(inTree)]);
  const scatterRef=useRef(Array.from({length:NPTS},()=>({x:Math.random()*2-1,y:Math.random()*2-1})));
  const curRef=useRef(0.6);
  const [read,setRead]=useState({C:60,reg:"forming"});
  const [form,setForm]=useState(0);
  const FORMS=["Human","Animal","Tree of Life"];
  useEffect(()=>{
    const cv=cvRef.current; if(!cv)return; const ctx=cv.getContext("2d"); if(!ctx)return;
    let raf=0,t=0;
    const GA=Math.PI*(3-Math.sqrt(5));
    const loop=()=>{
      const{w,h}=fitCanvas(cv,ctx);
      t+=0.02;
      curRef.current+=(CRef.current-curRef.current)*0.05;
      const C=Math.max(0,Math.min(1,curRef.current));
      const g=ctx.createRadialGradient(w*0.5,h*0.5,0,w*0.5,h*0.5,Math.max(w,h)*0.6);
      g.addColorStop(0,"#0a0812"); g.addColorStop(1,BG);
      ctx.fillStyle=g; ctx.fillRect(0,0,w,h);
      const cx=w*0.5, cy=h*0.5, sz=Math.min(w*0.34,h*0.42);
      const breathe=1+0.04*Math.sin(t*1.4);
      const hg=ctx.createRadialGradient(cx,cy,0,cx,cy,sz*1.6*breathe);
      hg.addColorStop(0,hexA(GOLD,0.05+0.28*C)); hg.addColorStop(0.6,hexA(GOLD,0.03+0.08*C)); hg.addColorStop(1,"rgba(0,0,0,0)");
      ctx.fillStyle=hg; ctx.beginPath(); ctx.arc(cx,cy,sz*1.6*breathe,0,Math.PI*2); ctx.fill();
      const shape=formsRef.current[formRef.current];
      const sct=scatterRef.current;
      for(let i=0;i<NPTS;i++){
        const tgt=shape[i], s=sct[i];
        const x=lerp(s.x,tgt.x,C), y=lerp(s.y,tgt.y,C);
        const px=cx+x*sz, py=cy+y*sz;
        const hue=lerp(205,46,C);
        const light=lerp(45,72,C);
        ctx.beginPath(); ctx.arc(px,py,lerp(1.3,2.4,C),0,Math.PI*2);
        ctx.fillStyle=`hsla(${hue.toFixed(0)},${(60+C*30).toFixed(0)}%,${light.toFixed(0)}%,${(0.55+0.4*C).toFixed(2)})`;
        ctx.shadowBlur=9*C; ctx.shadowColor=`hsl(${hue.toFixed(0)},85%,62%)`;
        ctx.fill(); ctx.shadowBlur=0;
      }
      if(C>0.4){
        const nSpiral=Math.round((C-0.4)/0.6*80);
        for(let i=0;i<nSpiral;i++){
          const k=i/80; const rad=Math.sqrt(k)*sz*1.2; const ang=i*GA+t*0.2;
          const px=cx+Math.cos(ang)*rad, py=cy+Math.sin(ang)*rad;
          ctx.beginPath(); ctx.arc(px,py,1.3,0,Math.PI*2);
          ctx.fillStyle=hexA(GOLD,0.35*(C-0.4)/0.6); ctx.fill();
        }
      }
      if(Math.round(t/0.02)%6===0){
        const reg=C>0.9?"LIGHT BODY · CRYSTALLIZED":C>0.65?"COHERENT":C>0.35?"FORMING":"SCATTERED MATTER";
        setRead({C:Math.round(C*100),reg});
      }
      raf=requestAnimationFrame(loop);
    };
    raf=requestAnimationFrame(loop);
    return()=>cancelAnimationFrame(raf);
  },[]);
  return(
    <div>
      <canvas ref={cvRef} style={{width:"100%",height:380,display:"block",borderRadius:10,border:`1px solid ${BORDER}`}}/>
      <div style={{display:"flex",gap:8,flexWrap:"wrap",marginTop:12}}>
        {FORMS.map((f,i)=>(
          <button key={f} onClick={()=>{formRef.current=i; setForm(i);}} style={{fontFamily:"monospace",fontSize:11,padding:"6px 12px",borderRadius:6,cursor:"pointer",background:form===i?hexA(GOLD,0.18):PAN2,color:form===i?GOLD:MUTED,border:`1px solid ${form===i?hexA(GOLD,0.5):BORDER}`}}>{f}</button>
        ))}
      </div>
      <label style={{fontFamily:"monospace",fontSize:11,color:MUTED,display:"block",marginTop:12}}>
        coherence 𝒞 — matter → light body
        <input type="range" min={0} max={1} step={0.01} defaultValue={0.6} onChange={e=>(CRef.current=parseFloat(e.target.value))} style={{marginLeft:8,accentColor:GOLD,width:180}}/>
      </label>
      <div style={{display:"flex",gap:16,flexWrap:"wrap",marginTop:10,fontFamily:"monospace",fontSize:11.5,color:MUTED}}>
        <div>form: <span style={{color:CYAN}}>{FORMS[form]}</span></div>
        <div>coherence: <span style={{color:GOLD}}>{read.C}%</span></div>
        <div style={{color:read.C>65?GREEN:MUTED}}>state: {read.reg}</div>
      </div>
    </div>
  );
}

const STAGES=[
  {t:"From Big Bang to Boundary",c:VIOLET,items:["The universe begins as maximum entropy, zero coherence","Cooling lets structure crystallize out of the plasma","Every scale inherits the same coherence law","Life is the universe folding coherence into a boundary"]},
  {t:"The Light Body Defined",c:GOLD,items:["A light body is full-scale coherence held by one being","Cells align to a single phase and glow as one field","𝒞 → 1 : scattered matter becomes crystallized light","Humans, animals, and plants share the same path"]},
  {t:"One Law, All of Life",c:CYAN,items:["Photon → atom → cell → organism → light body","The φ-spiral is how coherence packs at every scale","Same equation from the first light to a living being","Creation is coherence accumulating without end"]},
];

export default function LightBodyPage(){
  return(
    <div style={{minHeight:"100vh",background:BG,color:TEXT,padding:"40px 20px 80px",fontFamily:"'Inter',system-ui,sans-serif"}}>
      <div style={{maxWidth:980,margin:"0 auto"}}>
        <div style={{fontFamily:"monospace",fontSize:11,color:MUTED,letterSpacing:2,textTransform:"uppercase",marginBottom:8}}>Project AETHER · Light Body Genesis · Coherence Cosmology</div>
        <h1 style={{fontSize:30,margin:"0 0 6px",fontWeight:700,background:`linear-gradient(90deg,${VIOLET},${GOLD},${CYAN})`,WebkitBackgroundClip:"text",backgroundClip:"text",color:"transparent"}}>
          Light Body Genesis — From the Big Bang to a Living Field
        </h1>
        <p style={{fontSize:14,color:MUTED,lineHeight:1.7,margin:"0 0 24px",maxWidth:800}}>
          Creation reverse-engineered as one process: coherence accumulating out of chaos. Run the timeline from the Big Bang forward and watch scattered plasma cool, condense, and crystallize into structure — atoms, stars, cells, and finally a self-aware <strong style={{color:GOLD}}>light body</strong>. The same coherence law that ordered the first light also assembles a human, an animal, or a tree. This is the beginning of a full simulation of light-body creation for all of life.
        </p>

        <div style={{background:PAN,border:`1px solid ${BORDER}`,borderRadius:12,padding:18,marginBottom:24}}>
          <div style={{fontFamily:"monospace",fontSize:11,color:VIOLET,marginBottom:14,textTransform:"uppercase",letterSpacing:1}}>Live · Cosmic Emergence — Big Bang → Light Body</div>
          <CosmicEmergenceCanvas/>
          <div style={{fontFamily:"monospace",fontSize:11,color:MUTED,marginTop:10,lineHeight:1.6}}>
            Particles begin as a hot, disordered plasma and drift into a golden φ-spiral as coherence rises. The timeline at the base marks ten epochs from t = 0 to the crystallized light body at 𝒞 = 1.
          </div>
        </div>

        <div style={{background:PAN,border:`1px solid ${BORDER}`,borderRadius:12,padding:18,marginBottom:24}}>
          <div style={{fontFamily:"monospace",fontSize:11,color:GOLD,marginBottom:14,textTransform:"uppercase",letterSpacing:1}}>Live · Light Body Crystallization — Human · Animal · Tree</div>
          <LightBodyCanvas/>
          <div style={{fontFamily:"monospace",fontSize:11,color:MUTED,marginTop:10,lineHeight:1.6}}>
            Drag coherence 𝒞 from 0 to 1: scattered matter (cool blue) gathers into the chosen living form and ignites into a golden light body. Every form follows the same law — only the target geometry differs.
          </div>
        </div>

        <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(280px,1fr))",gap:14,marginBottom:24}}>
          {STAGES.map(s=>(
            <div key={s.t} style={{background:PAN,border:`1px solid ${BORDER}`,borderTop:`3px solid ${s.c}`,borderRadius:12,padding:16}}>
              <div style={{fontSize:14,fontWeight:700,color:s.c,marginBottom:10}}>{s.t}</div>
              <ul style={{margin:0,paddingLeft:16,fontSize:12.5,color:MUTED,lineHeight:1.7}}>
                {s.items.map((it,i)=><li key={i}>{it}</li>)}
              </ul>
            </div>
          ))}
        </div>

        <div style={{background:PAN,border:`1px solid ${BORDER}`,borderRadius:12,padding:18,marginBottom:24}}>
          <div style={{fontFamily:"monospace",fontSize:11,color:CYAN,marginBottom:12,textTransform:"uppercase",letterSpacing:1}}>The Genesis Mathematics</div>
          <div style={{fontFamily:"monospace",fontSize:16,color:GOLD,textAlign:"center",padding:"8px 0"}}>𝒞(t) = 1 − e^{"{−κ ∫₀ᵗ Φ(τ) dτ}"}    ·    a(t) ∝ e^{"{H t}"}    ·    T ∝ 1/a</div>
          <div style={{fontFamily:"monospace",fontSize:16,color:VIOLET,textAlign:"center",padding:"8px 0"}}>θ_spiral = i · 2π/φ    ·    r = √(i/N)    ·    𝒞 + 𝒮_eff/𝒮_max = 1</div>
          <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(200px,1fr))",gap:8,fontFamily:"monospace",fontSize:11.5,color:MUTED,marginTop:8}}>
            <div><span style={{color:CYAN}}>𝒞(t)</span> — accumulated coherence over cosmic time</div>
            <div><span style={{color:CYAN}}>Φ(τ)</span> — coherence-forming flux at each epoch</div>
            <div><span style={{color:CYAN}}>a(t)</span> — scale factor · cosmic expansion</div>
            <div><span style={{color:CYAN}}>T</span> — temperature, falling as space expands</div>
            <div><span style={{color:CYAN}}>φ</span> — golden ratio · optimal coherence packing</div>
            <div><span style={{color:CYAN}}>𝒮_eff</span> — effective entropy, the mirror of coherence</div>
          </div>
        </div>

        <div style={{background:hexA(GOLD,0.05),border:`1px solid ${hexA(GOLD,0.22)}`,borderRadius:12,padding:18,marginBottom:28}}>
          <div style={{fontSize:13,fontWeight:700,color:GOLD,marginBottom:10}}>The Simulation Ahead</div>
          <ul style={{margin:0,paddingLeft:18,fontSize:12.5,color:MUTED,lineHeight:1.8}}>
            <li><strong style={{color:TEXT}}>Unified origin:</strong> one coherence law runs from the Big Bang to a living light body.</li>
            <li><strong style={{color:TEXT}}>All of life:</strong> humans, animals, and plants are the same process at different geometries.</li>
            <li><strong style={{color:TEXT}}>Entropy is the mirror:</strong> every gain in coherence is a fall in effective entropy.</li>
            <li><strong style={{color:TEXT}}>Next steps:</strong> couple this genesis field to the coherent-body cellular clock for a full life-cycle model.</li>
          </ul>
        </div>

        <div style={{display:"flex",flexWrap:"wrap",gap:14,paddingTop:20,borderTop:`1px solid ${BORDER}`,fontFamily:"monospace",fontSize:12}}>
          <Link href="/coherent-body" style={{color:CYAN,textDecoration:"none"}}>→ The Coherent Body · Cellular Clock</Link>
          <Link href="/aether-symbol-reference" style={{color:VIOLET,textDecoration:"none"}}>→ AETHER Symbol Reference</Link>
          <Link href="/complete-integration" style={{color:GOLD,textDecoration:"none"}}>→ The Complete Integration</Link>
          <Link href="/graph-map" style={{color:MUTED,textDecoration:"none"}}>→ Knowledge Graph</Link>
        </div>
      </div>
    </div>
  );
}
