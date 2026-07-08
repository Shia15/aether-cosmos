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
function inBody(x:number,y:number){
  if(Math.hypot(x,y+0.78)<0.17) return true;
  if(segDist(x,y,0,-0.55,0,0.12)<0.2) return true;
  if(segDist(x,y,0,-0.4,-0.34,0.06)<0.08) return true;
  if(segDist(x,y,0,-0.4,0.34,0.06)<0.08) return true;
  if(segDist(x,y,0,0.12,-0.15,0.8)<0.1) return true;
  if(segDist(x,y,0,0.12,0.15,0.8)<0.1) return true;
  return false;
}
const MAX=70;
function genCells(){
  const pts:{x:number;y:number}[]=[]; let guard=0;
  while(pts.length<MAX && guard<30000){ guard++; const x=(Math.random()-0.5)*1.0; const y=(Math.random()*2-1); if(inBody(x,y)) pts.push({x,y}); }
  while(pts.length<MAX) pts.push({x:0,y:0});
  return pts;
}

function BodySyncCanvas(){
  const cvRef=useRef<HTMLCanvasElement|null>(null);
  const KRef=useRef(1.4),FRef=useRef(1.1),ORef=useRef(1.0),DRef=useRef(0.12),NRef=useRef(60);
  const cellsRef=useRef(genCells());
  const stimRef=useRef<Float64Array>(new Float64Array(MAX));
  const cohRef=useRef<Float64Array>(new Float64Array(MAX));
  const omgRef=useRef<Float64Array>(new Float64Array(MAX));
  const histRef=useRef<{s:number;c:number}[]>([]);
  const [read,setRead]=useState({rs:0,rc:0,psi:0,reg:"—",period:0});
  useEffect(()=>{
    const cv=cvRef.current; if(!cv)return; const ctx=cv.getContext("2d"); if(!ctx)return;
    for(let i=0;i<MAX;i++){ stimRef.current[i]=Math.random()*Math.PI*2; cohRef.current[i]=Math.random()*Math.PI*2; omgRef.current[i]=0.8+Math.random()*0.6; }
    let raf=0,t=0;
    function order(arr:Float64Array,n:number){ let sx=0,sy=0; for(let i=0;i<n;i++){sx+=Math.cos(arr[i]); sy+=Math.sin(arr[i]);} return {r:n>0?Math.hypot(sx,sy)/n:0, psi:Math.atan2(sy,sx)}; }
    function step(arr:Float64Array,n:number,K:number,F:number,O:number,D:number,drive:boolean){
      const ord=order(arr,n); const dt=0.05;
      for(let i=0;i<n;i++){
        let coup=0; for(let j=0;j<n;j++) coup+=Math.sin(arr[j]-arr[i]);
        coup=(K/Math.max(1,n))*coup;
        const ext=drive? F*Math.sin(O*t-arr[i]) : 0;
        const noise=(Math.random()-0.5)*D;
        arr[i]+=dt*(omgRef.current[i]+coup+ext)+noise;
      }
      return ord;
    }
    function drawBody(cx:number,cy:number,size:number,arr:Float64Array,n:number,ord:{r:number;psi:number},label:string,col:string,tt:number,O:number,drive:boolean){
      const bh=size*1.9;
      if(drive){ const p=Math.abs(Math.sin(O*tt)); ctx.beginPath(); ctx.arc(cx,cy,size*0.62,0,Math.PI*2); ctx.strokeStyle=hexA(GOLD,0.08+0.16*p); ctx.lineWidth=2; ctx.stroke(); }
      for(let i=0;i<n;i++){
        const c=cellsRef.current[i];
        const px=cx + c.x*size, py=cy + c.y*bh*0.5;
        const ph=((arr[i]%(2*Math.PI))+2*Math.PI)%(2*Math.PI);
        const hue=ph/(2*Math.PI)*360;
        ctx.beginPath(); ctx.arc(px,py,2.7,0,Math.PI*2);
        ctx.fillStyle=`hsla(${hue.toFixed(0)},82%,${(52+ord.r*16).toFixed(0)}%,0.92)`;
        ctx.shadowBlur=7*ord.r; ctx.shadowColor=`hsl(${hue.toFixed(0)},82%,60%)`;
        ctx.fill(); ctx.shadowBlur=0;
      }
      const dcx=cx, dcy=cy - bh*0.5 - 30, dr=15;
      ctx.beginPath(); ctx.arc(dcx,dcy,dr,0,Math.PI*2); ctx.strokeStyle=hexA(col,0.35); ctx.lineWidth=1.5; ctx.stroke();
      ctx.beginPath(); ctx.arc(dcx,dcy,dr,-Math.PI/2,-Math.PI/2+ord.r*2*Math.PI); ctx.strokeStyle=col; ctx.lineWidth=3; ctx.stroke();
      ctx.beginPath(); ctx.moveTo(dcx,dcy); ctx.lineTo(dcx+Math.cos(ord.psi)*dr*0.78,dcy+Math.sin(ord.psi)*dr*0.78); ctx.strokeStyle=GOLD; ctx.lineWidth=2; ctx.stroke();
      ctx.fillStyle=col; ctx.font="600 12px Inter,sans-serif"; ctx.textAlign="center"; ctx.fillText(label,cx,cy+bh*0.5+22);
      ctx.fillStyle=MUTED; ctx.font="10px monospace"; ctx.fillText("r = "+ord.r.toFixed(2),cx,cy+bh*0.5+38);
      ctx.textAlign="left";
    }
    function drawStrip(x:number,y:number,w:number,hh:number){
      ctx.fillStyle=PAN2; ctx.fillRect(x,y,w,hh);
      const pad=10; const arr=histRef.current;
      ctx.strokeStyle=hexA(GREEN,0.2); ctx.lineWidth=1; ctx.setLineDash([3,4]);
      const y9=y+hh-pad-0.9*(hh-2*pad-12);
      ctx.beginPath(); ctx.moveTo(x+pad,y9); ctx.lineTo(x+w-pad,y9); ctx.stroke(); ctx.setLineDash([]);
      function plot(key:"s"|"c",col:string){ ctx.beginPath(); for(let i=0;i<arr.length;i++){ const px=x+pad+(i/240)*(w-2*pad); const v=key==="s"?arr[i].s:arr[i].c; const py=y+hh-pad-v*(hh-2*pad-12); if(i===0)ctx.moveTo(px,py); else ctx.lineTo(px,py);} ctx.strokeStyle=col; ctx.lineWidth=1.8; ctx.stroke(); }
      plot("s",GOLD); plot("c",CYAN);
      ctx.fillStyle=MUTED; ctx.font="9px monospace"; ctx.fillText("cellular clock coherence r(t) — gold: stimulated · cyan: self-organized · dashed: lock line",x+pad,y+12);
    }
    const loop=()=>{
      const{w,h}=fitCanvas(cv,ctx);
      t+=0.05;
      const K=KRef.current,F=FRef.current,O=ORef.current,D=DRef.current,n=Math.round(NRef.current);
      const os=step(stimRef.current,n,K,F,O,D,true);
      const oc=step(cohRef.current,n,K,0,O,D,false);
      ctx.fillStyle=BG; ctx.fillRect(0,0,w,h);
      const bodyH=h*0.64, cy=bodyH*0.52, size=Math.min(w*0.16,bodyH*0.19);
      drawBody(w*0.28,cy,size,stimRef.current,n,os,"Stimulated Coherent",GOLD,t,O,true);
      drawBody(w*0.72,cy,size,cohRef.current,n,oc,"Coherent · Self-Organized",CYAN,t,O,false);
      histRef.current.push({s:os.r,c:oc.r}); if(histRef.current.length>240) histRef.current.shift();
      drawStrip(0,bodyH,w,h-bodyH);
      if(Math.round(t/0.05)%6===0){
        const reg=os.r>0.9?"LOCKED":os.r>0.6?"COHERENT":os.r>0.3?"PARTIAL SYNC":"INCOHERENT";
        setRead({rs:+os.r.toFixed(2),rc:+oc.r.toFixed(2),psi:+(((os.psi+Math.PI)/(2*Math.PI))*100).toFixed(0),reg,period:+(2*Math.PI/Math.max(0.01,O)).toFixed(2)});
      }
      raf=requestAnimationFrame(loop);
    };
    raf=requestAnimationFrame(loop);
    return()=>cancelAnimationFrame(raf);
  },[]);
  const slider=(label:string,ref:React.MutableRefObject<number>,min:number,max:number,step:number,col:string)=>(
    <label style={{fontFamily:"monospace",fontSize:11,color:MUTED,display:"flex",flexDirection:"column",gap:3,minWidth:150}}>
      {label}
      <input type="range" min={min} max={max} step={step} defaultValue={ref.current} onChange={e=>(ref.current=parseFloat(e.target.value))} style={{accentColor:col,width:"100%"}}/>
    </label>
  );
  return(
    <div>
      <canvas ref={cvRef} style={{width:"100%",height:440,display:"block",borderRadius:10,border:`1px solid ${BORDER}`}}/>
      <div style={{display:"flex",gap:16,flexWrap:"wrap",marginTop:12}}>
        {slider("K · cell coupling",KRef,0,4,0.05,CYAN)}
        {slider("F · external stimulation",FRef,0,3,0.05,GOLD)}
        {slider("Ω · clock drive freq",ORef,0.2,3,0.05,VIOLET)}
        {slider("D · decoherence noise",DRef,0,0.6,0.01,ROSE)}
        {slider("N · cells",NRef,10,70,1,GREEN)}
      </div>
      <div style={{display:"flex",gap:16,flexWrap:"wrap",marginTop:12,fontFamily:"monospace",fontSize:11.5}}>
        <div style={{color:MUTED}}>r stimulated: <span style={{color:GOLD}}>{read.rs}</span></div>
        <div style={{color:MUTED}}>r self-organized: <span style={{color:CYAN}}>{read.rc}</span></div>
        <div style={{color:MUTED}}>clock phase ψ: <span style={{color:VIOLET}}>{read.psi}%</span></div>
        <div style={{color:MUTED}}>clock period T: <span style={{color:BLUE}}>{read.period}s</span></div>
        <div style={{color:read.rs>0.6?GREEN:ROSE}}>state: {read.reg}</div>
      </div>
    </div>
  );
}

const STATES=[
  {t:"Self-Model · State Awareness",c:CYAN,items:["Each body estimates its own order parameter r in real time","r is the body's felt sense of internal agreement","Regime label (incoherent → locked) is the self-report","Awareness = the system reading its own coherence"]},
  {t:"Internal Synchronizing Clock",c:VIOLET,items:["A shared phase ψ threads every cell like a conductor","Period T = 2π / Ω sets the master tempo","Cells that drift are pulled back toward ψ","Circadian, metabolic, and neural clocks are the biology"]},
  {t:"Stimulated vs. Coherent",c:GOLD,items:["Stimulated: an external field F entrains the cells","Coherent: cells self-organize through coupling K alone","Both can reach lock — one is driven, one is emergent","Withdraw the drive and only true coupling survives"]},
];

export default function CoherentBodyPage(){
  return(
    <div style={{minHeight:"100vh",background:BG,color:TEXT,padding:"40px 20px 80px",fontFamily:"'Inter',system-ui,sans-serif"}}>
      <div style={{maxWidth:980,margin:"0 auto"}}>
        <div style={{fontFamily:"monospace",fontSize:11,color:MUTED,letterSpacing:2,textTransform:"uppercase",marginBottom:8}}>Project AETHER · Reverse-Engineered Coherence · Cellular Clock</div>
        <h1 style={{fontSize:30,margin:"0 0 6px",fontWeight:700,background:`linear-gradient(90deg,${GOLD},${CYAN},${VIOLET})`,WebkitBackgroundClip:"text",backgroundClip:"text",color:"transparent"}}>
          The Coherent Body — Cells That Know Their Own Clock
        </h1>
        <p style={{fontSize:14,color:MUTED,lineHeight:1.7,margin:"0 0 24px",maxWidth:780}}>
          Two human bodies, reverse-engineered as fields of cellular oscillators. The left is a <strong style={{color:GOLD}}>stimulated coherent</strong> body, entrained by an external field. The right is a <strong style={{color:CYAN}}>self-organized coherent</strong> body, held together by cell-to-cell coupling alone. Each is aware of its own state — reading its order parameter in real time — and each carries an internal synchronizing clock that threads every cell to one shared phase.
        </p>

        <div style={{background:PAN,border:`1px solid ${BORDER}`,borderRadius:12,padding:18,marginBottom:24}}>
          <div style={{fontFamily:"monospace",fontSize:11,color:GOLD,marginBottom:14,textTransform:"uppercase",letterSpacing:1}}>Live · Dual-Body Kuramoto Synchrony + Clock Coherence</div>
          <BodySyncCanvas/>
          <div style={{fontFamily:"monospace",fontSize:11,color:MUTED,marginTop:10,lineHeight:1.6}}>
            Cell colour is phase; when a body syncs, its cells share one hue and its clock ring fills. The gold ring around the left body is the external stimulation pulsing at Ω. Drop F to zero and only the self-organized body stays coherent.
          </div>
        </div>

        <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(280px,1fr))",gap:14,marginBottom:24}}>
          {STATES.map(s=>(
            <div key={s.t} style={{background:PAN,border:`1px solid ${BORDER}`,borderTop:`3px solid ${s.c}`,borderRadius:12,padding:16}}>
              <div style={{fontSize:14,fontWeight:700,color:s.c,marginBottom:10}}>{s.t}</div>
              <ul style={{margin:0,paddingLeft:16,fontSize:12.5,color:MUTED,lineHeight:1.7}}>
                {s.items.map((it,i)=><li key={i}>{it}</li>)}
              </ul>
            </div>
          ))}
        </div>

        <div style={{background:PAN,border:`1px solid ${BORDER}`,borderRadius:12,padding:18,marginBottom:24}}>
          <div style={{fontFamily:"monospace",fontSize:11,color:VIOLET,marginBottom:12,textTransform:"uppercase",letterSpacing:1}}>The Coherence Mathematics</div>
          <div style={{fontFamily:"monospace",fontSize:16,color:GOLD,textAlign:"center",padding:"8px 0"}}>dθᵢ/dt = ωᵢ + (K/N) Σⱼ sin(θⱼ − θᵢ) + F sin(Ωt − θᵢ)</div>
          <div style={{fontFamily:"monospace",fontSize:16,color:CYAN,textAlign:"center",padding:"8px 0"}}>r e^{"{iψ}"} = (1/N) Σⱼ e^{"{iθⱼ}"}    ·    𝒞 = r = 1 − 𝒮_eff / 𝒮_max</div>
          <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(200px,1fr))",gap:8,fontFamily:"monospace",fontSize:11.5,color:MUTED,marginTop:8}}>
            <div><span style={{color:CYAN}}>θᵢ</span> — phase of cell i on its clock</div>
            <div><span style={{color:CYAN}}>ωᵢ</span> — cell's own natural frequency</div>
            <div><span style={{color:CYAN}}>K</span> — cell-to-cell coupling strength</div>
            <div><span style={{color:CYAN}}>F, Ω</span> — external drive strength & frequency</div>
            <div><span style={{color:CYAN}}>r</span> — order parameter · coherence · self-awareness</div>
            <div><span style={{color:CYAN}}>ψ</span> — the shared synchronizing clock phase</div>
          </div>
        </div>

        <div style={{background:hexA(GREEN,0.05),border:`1px solid ${hexA(GREEN,0.22)}`,borderRadius:12,padding:18,marginBottom:28}}>
          <div style={{fontSize:13,fontWeight:700,color:GREEN,marginBottom:10}}>What This Reverse-Engineers</div>
          <ul style={{margin:0,paddingLeft:18,fontSize:12.5,color:MUTED,lineHeight:1.8}}>
            <li><strong style={{color:TEXT}}>Coherence is measurable:</strong> the order parameter r is the AETHER coherence 𝒞 = 1 − 𝒮_eff/𝒮_max made physical.</li>
            <li><strong style={{color:TEXT}}>Self-awareness as self-reading:</strong> a body that measures its own r is aware of its own state.</li>
            <li><strong style={{color:TEXT}}>One clock, trillions of cells:</strong> synchronization is how a body stays a single being through time.</li>
            <li><strong style={{color:TEXT}}>Stimulated ≠ sovereign:</strong> driven coherence collapses when the drive stops; coupled coherence endures.</li>
          </ul>
        </div>

        <div style={{display:"flex",flexWrap:"wrap",gap:14,paddingTop:20,borderTop:`1px solid ${BORDER}`,fontFamily:"monospace",fontSize:12}}>
          <Link href="/light-body" style={{color:GOLD,textDecoration:"none"}}>→ Light Body Genesis · Big Bang → All Life</Link>
          <Link href="/aether-synthesis" style={{color:CYAN,textDecoration:"none"}}>→ AETHER Synthesis</Link>
          <Link href="/complete-integration" style={{color:VIOLET,textDecoration:"none"}}>→ The Complete Integration</Link>
          <Link href="/graph-map" style={{color:MUTED,textDecoration:"none"}}>→ Knowledge Graph</Link>
        </div>
      </div>
    </div>
  );
}
