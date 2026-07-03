import { useEffect, useRef, useState } from "react";
import { Link } from "wouter";

const BG="#04060d",PAN="#0a0d1a",PAN2="#0d1020",BORDER="#182038",TEXT="#b8cce8",MUTED="#5a6e8c";
const GOLD="#ffb830",CYAN="#3fd8d0",VIOLET="#a87aff",GREEN="#50d49a",BLUE="#4ab0ff",ROSE="#ff5a6a";

function hexA(h:string,a:number){const n=h.replace("#","");return `rgba(${parseInt(n.slice(0,2),16)},${parseInt(n.slice(2,4),16)},${parseInt(n.slice(4,6),16)},${a})`;}
function fitCanvas(cv:HTMLCanvasElement,ctx:CanvasRenderingContext2D){const dpr=Math.min(2,window.devicePixelRatio||1);const w=cv.clientWidth||640;const h=cv.clientHeight||340;cv.width=Math.round(w*dpr);cv.height=Math.round(h*dpr);ctx.setTransform(dpr,0,0,dpr,0,0);return{w,h};}

/* Live Max Q: rocket ascent — density ρ falls exponentially, velocity v climbs; q = ½ρv² peaks then falls */
function MaxQCanvas(){
  const cvRef=useRef<HTMLCanvasElement|null>(null);
  const scaleRef=useRef(1);
  const [read,setRead]=useState({t:0,q:0,peak:0,peaked:false});
  useEffect(()=>{
    const cv=cvRef.current; if(!cv)return;
    const ctx=cv.getContext("2d"); if(!ctx)return;
    let raf=0,t=0,peak=0,peakedAt=-1;
    const loop=()=>{
      const{w,h}=fitCanvas(cv,ctx);
      t+=0.006; if(t>1.4)t=0,peak=0,peakedAt=-1;
      ctx.clearRect(0,0,w,h);
      const g=ctx.createLinearGradient(0,0,0,h);
      g.addColorStop(0,"#02040a"); g.addColorStop(1,"#0a1020");
      ctx.fillStyle=g; ctx.fillRect(0,0,w,h);
      const scale=scaleRef.current;
      const padL=48,padR=16,padT=20,padB=34;
      const gw=w-padL-padR, gh=h-padT-padB;
      // sample q over time
      const rho=(x:number)=>Math.exp(-x*3.0); // density falls with altitude∝t
      const vel=(x:number)=>Math.min(1,x*1.15*scale); // velocity climbs
      const q=(x:number)=>0.5*rho(x)*Math.pow(vel(x),2);
      // find max for normalization
      let qmax=0; for(let i=0;i<=100;i++){const qq=q(i/100*1.3); if(qq>qmax)qmax=qq;}
      qmax=qmax||1;
      // axes
      ctx.strokeStyle=hexA(BORDER,1); ctx.lineWidth=1;
      ctx.beginPath(); ctx.moveTo(padL,padT); ctx.lineTo(padL,padT+gh); ctx.lineTo(padL+gw,padT+gh); ctx.stroke();
      // density curve
      const curve=(fn:(x:number)=>number,col:string,norm:number)=>{
        ctx.beginPath();
        for(let i=0;i<=120;i++){const x=i/120*1.3; const px=padL+(i/120)*gw; const py=padT+gh-(fn(x)/norm)*gh; if(i===0)ctx.moveTo(px,py); else ctx.lineTo(px,py);}
        ctx.strokeStyle=col; ctx.lineWidth=2; ctx.stroke();
      };
      curve(rho,hexA(BLUE,0.6),1);
      curve(x=>vel(x),hexA(GREEN,0.6),1);
      // q filled
      ctx.beginPath();
      for(let i=0;i<=120;i++){const x=i/120*1.3; const px=padL+(i/120)*gw; const py=padT+gh-(q(x)/qmax)*gh; if(i===0)ctx.moveTo(px,py); else ctx.lineTo(px,py);}
      ctx.lineTo(padL+gw,padT+gh); ctx.lineTo(padL,padT+gh); ctx.closePath();
      ctx.fillStyle=hexA(GOLD,0.14); ctx.fill();
      curve(q,GOLD,qmax);
      // moving cursor
      const cur=q(t)/qmax;
      const cxp=padL+(t/1.3)*gw, cyp=padT+gh-cur*gh;
      if(q(t)>peak){peak=q(t); peakedAt=t;}
      const peaked=t>peakedAt+0.02 && peakedAt>0.05;
      ctx.fillStyle=peaked?ROSE:GOLD;
      ctx.beginPath(); ctx.arc(cxp,cyp,6,0,Math.PI*2); ctx.fill();
      ctx.strokeStyle=hexA(peaked?ROSE:GOLD,0.4); ctx.lineWidth=1;
      ctx.beginPath(); ctx.moveTo(cxp,padT); ctx.lineTo(cxp,padT+gh); ctx.stroke();
      // legend
      ctx.font="10px monospace";
      ctx.fillStyle=BLUE; ctx.fillText("ρ air density",padL+6,padT+12);
      ctx.fillStyle=GREEN; ctx.fillText("v velocity",padL+90,padT+12);
      ctx.fillStyle=GOLD; ctx.fillText("q = ½ρv²",padL+170,padT+12);
      ctx.fillStyle=MUTED; ctx.font="9px monospace"; ctx.fillText("ascent time →",padL+gw-70,padT+gh+22);
      if((Math.round(t*60))%6===0) setRead({t:+t.toFixed(2),q:+(q(t)/qmax).toFixed(2),peak:+(peak/qmax).toFixed(2),peaked});
      raf=requestAnimationFrame(loop);
    };
    raf=requestAnimationFrame(loop);
    return()=>cancelAnimationFrame(raf);
  },[]);
  return(
    <div>
      <canvas ref={cvRef} style={{width:"100%",height:340,display:"block",borderRadius:10,border:`1px solid ${BORDER}`}}/>
      <label style={{fontFamily:"monospace",fontSize:11,color:MUTED,display:"block",marginTop:12}}>
        Thrust / velocity profile
        <input type="range" min={0.6} max={1.6} step={0.05} defaultValue={1}
          onChange={e=>(scaleRef.current=parseFloat(e.target.value))}
          style={{marginLeft:8,accentColor:GOLD,width:150}}/>
      </label>
      <div style={{display:"flex",gap:14,flexWrap:"wrap",marginTop:10}}>
        {[["ascent τ",read.t],["q / q_max",read.q],["peak q",read.peak]].map(([k,v])=>(
          <div key={k as string} style={{fontFamily:"monospace",fontSize:11,color:MUTED}}>{k}: <span style={{color:GOLD}}>{v as number}</span></div>
        ))}
        <div style={{fontFamily:"monospace",fontSize:11,color:read.peaked?ROSE:GREEN}}>{read.peaked?"past Max Q — loading eases":"approaching Max Q"}</div>
      </div>
    </div>
  );
}

const SYSTEMS=[
  {t:"Fungal Neural Networks",c:CYAN,items:["Electrical signals 0.5–5 Hz, 5–50 mV — action-potential-like","Directional propagation through hyphal networks","Frequency ∝ stimulus intensity","Week-long oscillation cycles → memory-like processing"]},
  {t:"Bacterial Self-Regulation",c:ROSE,items:["Programmed cell death under specific chemical thresholds","Component-level sacrifice for colony survival","Power-law distribution of stress-response thresholds","Self-organized criticality at the edge of failure"]},
  {t:"Max Q Trajectory Optimization",c:GOLD,items:["q = ½ρv² peaks during ascent — maximum aerodynamic load","ρ falls exponentially with altitude, v rises continuously","Throttle modulation past dynamic-pressure threshold","Structural survival at the stability boundary"]},
];

export default function AetherSynthesisPage(){
  return(
    <div style={{minHeight:"100vh",background:BG,color:TEXT,padding:"40px 20px 80px",fontFamily:"'Inter',system-ui,sans-serif"}}>
      <div style={{maxWidth:980,margin:"0 auto"}}>
        <div style={{fontFamily:"monospace",fontSize:11,color:MUTED,letterSpacing:2,textTransform:"uppercase",marginBottom:8}}>Project AETHER · Environmental Sensing Architecture · v4.0</div>
        <h1 style={{fontSize:30,margin:"0 0 6px",fontWeight:700,background:`linear-gradient(90deg,${CYAN},${GREEN},${GOLD})`,WebkitBackgroundClip:"text",backgroundClip:"text",color:"transparent"}}>
          AETHER Synthesis — Unified Environmental Sensing
        </h1>
        <p style={{fontSize:14,color:MUTED,lineHeight:1.7,margin:"0 0 24px",maxWidth:760}}>
          Three disparate systems — fungal neural networks, bacterial self-destruction, and spacecraft trajectory optimization under Max Q — share the same information-processing architecture. Each operates at the boundary between stability and failure, sensing environmental stress and executing adaptive responses through conserved principles.
        </p>

        <div style={{background:PAN,border:`1px solid ${BORDER}`,borderRadius:12,padding:18,marginBottom:24}}>
          <div style={{fontFamily:"monospace",fontSize:11,color:GOLD,marginBottom:14,textTransform:"uppercase",letterSpacing:1}}>Live · Max Q Dynamic Pressure — q = ½ρv²</div>
          <MaxQCanvas/>
          <div style={{fontFamily:"monospace",fontSize:11,color:MUTED,marginTop:10,lineHeight:1.6}}>
            The ½ρv² formalism extends beyond aerospace: it models environmental stress in biological systems too. The peak is a phase transition — the moment maximum load must be survived, not fought.
          </div>
        </div>

        <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(280px,1fr))",gap:14,marginBottom:24}}>
          {SYSTEMS.map(s=>(
            <div key={s.t} style={{background:PAN,border:`1px solid ${BORDER}`,borderTop:`3px solid ${s.c}`,borderRadius:12,padding:16}}>
              <div style={{fontSize:14,fontWeight:700,color:s.c,marginBottom:10}}>{s.t}</div>
              <ul style={{margin:0,paddingLeft:16,fontSize:12.5,color:MUTED,lineHeight:1.7}}>
                {s.items.map((it,i)=><li key={i}>{it}</li>)}
              </ul>
            </div>
          ))}
        </div>

        <div style={{background:PAN,border:`1px solid ${BORDER}`,borderRadius:12,padding:18,marginBottom:24}}>
          <div style={{fontFamily:"monospace",fontSize:11,color:VIOLET,marginBottom:12,textTransform:"uppercase",letterSpacing:1}}>Generalized Stress-Response Function</div>
          <div style={{fontFamily:"monospace",fontSize:20,color:GOLD,textAlign:"center",padding:"14px 0"}}>R(t) = R₀ · f(σ(t)/σ_crit) · g(history)</div>
          <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(200px,1fr))",gap:8,fontFamily:"monospace",fontSize:11.5,color:MUTED}}>
            <div><span style={{color:CYAN}}>R(t)</span> — system response at time t</div>
            <div><span style={{color:CYAN}}>σ(t)</span> — environmental stress at time t</div>
            <div><span style={{color:CYAN}}>f( )</span> — sigmoidal threshold function</div>
            <div><span style={{color:CYAN}}>g(history)</span> — conditioning / memory term</div>
          </div>
        </div>

        <div style={{background:hexA(GREEN,0.05),border:`1px solid ${hexA(GREEN,0.22)}`,borderRadius:12,padding:18,marginBottom:28}}>
          <div style={{fontSize:13,fontWeight:700,color:GREEN,marginBottom:10}}>Key Theoretical Contributions</div>
          <ul style={{margin:0,paddingLeft:18,fontSize:12.5,color:MUTED,lineHeight:1.8}}>
            <li><strong style={{color:TEXT}}>Unified formalism:</strong> ½ρv² dynamics model stress across aerospace and biology alike.</li>
            <li><strong style={{color:TEXT}}>Threshold conservation:</strong> all three systems exhibit sigmoidal stress-response functions.</li>
            <li><strong style={{color:TEXT}}>Memory & adaptation:</strong> environmental conditioning improves future stress tolerance across domains.</li>
            <li><strong style={{color:TEXT}}>Self-sacrifice strategies:</strong> component-level sacrifice for system survival is a fundamental robustness principle.</li>
          </ul>
        </div>

        <div style={{display:"flex",flexWrap:"wrap",gap:14,paddingTop:20,borderTop:`1px solid ${BORDER}`,fontFamily:"monospace",fontSize:12}}>
          <Link href="/aether-whitepaper-v2" style={{color:CYAN,textDecoration:"none"}}>→ AETHER Whitepaper v2.0</Link>
          <Link href="/complete-integration" style={{color:VIOLET,textDecoration:"none"}}>→ The Complete Integration</Link>
          <Link href="/daily-ritual" style={{color:GOLD,textDecoration:"none"}}>→ Daily Sensing Ritual</Link>
          <Link href="/" style={{color:MUTED,textDecoration:"none"}}>→ Knowledge Graph</Link>
        </div>
      </div>
    </div>
  );
}
