import { useEffect, useRef, useState } from "react";
import { Link } from "wouter";

const BG="#04060d",PAN="#0a0d1a",PAN2="#0d1020",BORDER="#182038",TEXT="#b8cce8",MUTED="#5a6e8c";
const GOLD="#ffb830",CYAN="#3fd8d0",VIOLET="#a87aff",GREEN="#50d49a",BLUE="#4ab0ff",ROSE="#ff5a6a";

function hexA(h:string,a:number){const n=h.replace("#","");return `rgba(${parseInt(n.slice(0,2),16)},${parseInt(n.slice(2,4),16)},${parseInt(n.slice(4,6),16)},${a})`;}
function fitCanvas(cv:HTMLCanvasElement,ctx:CanvasRenderingContext2D){const dpr=Math.min(2,window.devicePixelRatio||1);const w=cv.clientWidth||640;const h=cv.clientHeight||340;cv.width=Math.round(w*dpr);cv.height=Math.round(h*dpr);ctx.setTransform(dpr,0,0,dpr,0,0);return{w,h};}
function lerp(a:number,b:number,t:number){return a+(b-a)*t;}

// Alcubierre warp-metric expansion field: bubble sweeps left→right,
// space contracts ahead (blue) and expands behind (red)
function WarpMetricCanvas(){
  const cvRef=useRef<HTMLCanvasElement|null>(null);
  const vRef=useRef(3.0),RRef=useRef(0.5),SRef=useRef(6.0);
  const [read,setRead]=useState({v:3,theta:0,energy:0});
  useEffect(()=>{
    const cv=cvRef.current; if(!cv)return; const ctx=cv.getContext("2d"); if(!ctx)return;
    let raf=0,t=0;
    function shape(r:number,R:number,s:number){ const tr=Math.tanh(s*R)||1e-6; return (Math.tanh(s*(r+R))-Math.tanh(s*(r-R)))/(2*tr); }
    function dshape(r:number,R:number,s:number){ const tr=Math.tanh(s*R)||1e-6; const a=Math.tanh(s*(r+R)),b=Math.tanh(s*(r-R)); return s*((1-a*a)-(1-b*b))/(2*tr); }
    const loop=()=>{
      const{w,h}=fitCanvas(cv,ctx);
      t+=0.006; const v=vRef.current,R=RRef.current,s=SRef.current;
      const bx=((t%1.0))*(w*1.3)-w*0.15, by=h*0.5;
      const scale=Math.min(w,h)*0.9;
      ctx.fillStyle=BG; ctx.fillRect(0,0,w,h);
      const cols=30,rows=16, cw=w/cols, ch=h/rows; let peak=0;
      for(let i=0;i<cols;i++)for(let j=0;j<rows;j++){
        const px=(i+0.5)*cw, py=(j+0.5)*ch;
        const xs=(px-bx)/scale, ys=(py-by)/scale;
        const rs=Math.hypot(xs,ys)||1e-6;
        const th=v*(xs/rs)*dshape(rs,R,s);
        if(Math.abs(th)>peak)peak=Math.abs(th);
        const mag=Math.max(-1,Math.min(1,th*0.5));
        const col=mag<0?BLUE:ROSE;
        ctx.fillStyle=hexA(col,Math.min(0.6,Math.abs(mag)*0.7));
        ctx.fillRect(i*cw,j*ch,cw+1,ch+1);
      }
      // bubble wall ring
      ctx.beginPath(); ctx.arc(bx,by,R*scale,0,Math.PI*2);
      ctx.strokeStyle=hexA(CYAN,0.7); ctx.lineWidth=2; ctx.stroke();
      // flat interior + payload cloud
      const fg=ctx.createRadialGradient(bx,by,0,bx,by,R*scale);
      fg.addColorStop(0,hexA(GOLD,0.14)); fg.addColorStop(1,"rgba(0,0,0,0)");
      ctx.fillStyle=fg; ctx.beginPath(); ctx.arc(bx,by,R*scale,0,Math.PI*2); ctx.fill();
      for(let k=0;k<14;k++){ const a=k/14*Math.PI*2; const rr=R*scale*0.42*(0.4+0.6*Math.abs(Math.sin(a*3+t*4))); ctx.beginPath(); ctx.arc(bx+Math.cos(a)*rr,by+Math.sin(a)*rr,2,0,Math.PI*2); ctx.fillStyle=hexA(GOLD,0.9); ctx.fill(); }
      // labels
      ctx.font="10px monospace"; ctx.fillStyle=hexA(BLUE,0.9); ctx.fillText("← space contracts ahead",bx+R*scale+8,by-6);
      ctx.fillStyle=hexA(ROSE,0.9); ctx.fillText("space expands behind →",bx-R*scale-150,by+16);
      if(Math.round(t/0.006)%6===0) setRead({v:+v.toFixed(1),theta:+peak.toFixed(2),energy:+(peak*R*s*0.4).toFixed(2)});
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
      <canvas ref={cvRef} style={{width:"100%",height:320,display:"block",borderRadius:10,border:`1px solid ${BORDER}`}}/>
      <div style={{display:"flex",gap:16,flexWrap:"wrap",marginTop:12}}>
        {slider("v_s · warp velocity (×c)",vRef,0.5,8,0.1,GOLD)}
        {slider("R · bubble radius",RRef,0.2,0.9,0.02,CYAN)}
        {slider("σ · wall thickness",SRef,2,14,0.5,VIOLET)}
      </div>
      <div style={{display:"flex",gap:16,flexWrap:"wrap",marginTop:12,fontFamily:"monospace",fontSize:11.5,color:MUTED}}>
        <div>v_s: <span style={{color:GOLD}}>{read.v}×c</span></div>
        <div>peak expansion θ: <span style={{color:ROSE}}>{read.theta}</span></div>
        <div>exotic-energy proxy: <span style={{color:VIOLET}}>{read.energy}</span></div>
      </div>
    </div>
  );
}

const MAXC=90;
// Cloud transit: a coherence bubble carries a particle cloud from the Sun,
// past planetary gravity wells, to the destination port
function CloudTransitCanvas(){
  const cvRef=useRef<HTMLCanvasElement|null>(null);
  const vRef=useRef(2.5),CRef=useRef(0.75),WRef=useRef(0.4);
  const cloudRef=useRef<{x:number;y:number;vx:number;vy:number}[]>([]);
  const starsRef=useRef<{x:number;y:number;r:number}[]>([]);
  const [read,setRead]=useState({prog:0,coh:0,v:2.5});
  useEffect(()=>{
    const cv=cvRef.current; if(!cv)return; const ctx=cv.getContext("2d"); if(!ctx)return;
    for(let i=0;i<MAXC;i++){ const a=Math.random()*Math.PI*2,r=Math.random()*0.9; cloudRef.current.push({x:Math.cos(a)*r,y:Math.sin(a)*r,vx:0,vy:0}); }
    for(let i=0;i<70;i++) starsRef.current.push({x:Math.random(),y:Math.random(),r:Math.random()*1.2+0.3});
    let raf=0,t=0,prog=0;
    const loop=()=>{
      const{w,h}=fitCanvas(cv,ctx);
      const v=vRef.current,C=CRef.current,W=WRef.current;
      prog+=0.0016*v; if(prog>1.05){prog=-0.05; for(const p of cloudRef.current){const a=Math.random()*Math.PI*2,r=Math.random()*0.9; p.x=Math.cos(a)*r; p.y=Math.sin(a)*r; p.vx=0; p.vy=0;}}
      t+=0.02;
      ctx.fillStyle=BG; ctx.fillRect(0,0,w,h);
      for(const st of starsRef.current){ ctx.beginPath(); ctx.arc(st.x*w,st.y*h,st.r,0,Math.PI*2); ctx.fillStyle=hexA(TEXT,0.25); ctx.fill(); }
      // sun
      const sx=w*0.06, sy=h*0.5;
      const sg=ctx.createRadialGradient(sx,sy,0,sx,sy,44); sg.addColorStop(0,hexA(GOLD,0.9)); sg.addColorStop(1,"rgba(0,0,0,0)");
      ctx.fillStyle=sg; ctx.beginPath(); ctx.arc(sx,sy,44,0,Math.PI*2); ctx.fill();
      ctx.fillStyle=MUTED; ctx.font="10px monospace"; ctx.fillText("SOLAR",sx-14,sy+58);
      // planets (gravity wells)
      const planets=[{x:0.36,y:0.34,r:14,c:BLUE},{x:0.58,y:0.66,r:18,c:GREEN},{x:0.78,y:0.4,r:12,c:VIOLET}];
      for(const pl of planets){ ctx.beginPath(); ctx.arc(pl.x*w,pl.y*h,pl.r,0,Math.PI*2); ctx.fillStyle=hexA(pl.c,0.5); ctx.fill(); ctx.strokeStyle=hexA(pl.c,0.8); ctx.stroke(); }
      // destination
      const dx=w*0.95, dy=h*0.5;
      ctx.beginPath(); ctx.arc(dx,dy,10,0,Math.PI*2); ctx.strokeStyle=hexA(CYAN,0.9); ctx.lineWidth=2; ctx.stroke();
      ctx.fillStyle=MUTED; ctx.fillText("PORT",dx-14,dy+26);
      // bubble position along path
      const bx=lerp(w*0.1,w*0.9,Math.max(0,Math.min(1,prog))), by=h*0.5+Math.sin(prog*Math.PI*2)*h*0.06;
      const bR=Math.min(w,h)*0.14, scale=bR;
      // bubble field
      const bg=ctx.createRadialGradient(bx,by,0,bx,by,bR*1.4);
      bg.addColorStop(0,hexA(CYAN,0.12+0.14*C)); bg.addColorStop(1,"rgba(0,0,0,0)");
      ctx.fillStyle=bg; ctx.beginPath(); ctx.arc(bx,by,bR*1.4,0,Math.PI*2); ctx.fill();
      ctx.beginPath(); ctx.arc(bx,by,bR,0,Math.PI*2); ctx.strokeStyle=hexA(CYAN,0.4+0.4*C); ctx.lineWidth=2; ctx.stroke();
      // cloud dynamics
      let inside=0;
      for(const p of cloudRef.current){
        // cohesion pull toward bubble center (normalized coords)
        p.vx+=(-p.x)*0.02*C; p.vy+=(-p.y)*0.02*C;
        // solar wind + decoherence jitter
        p.vx+=(0.004*W)+(Math.random()-0.5)*0.02*(1-C);
        p.vy+=(Math.random()-0.5)*0.02*(1-C);
        p.vx*=0.92; p.vy*=0.92; p.x+=p.vx; p.y+=p.vy;
        const d=Math.hypot(p.x,p.y); const held=d<1.25;
        if(held)inside++;
        const px=bx+p.x*scale, py=by+p.y*scale;
        ctx.beginPath(); ctx.arc(px,py,held?2.2:1.6,0,Math.PI*2);
        ctx.fillStyle=held?hexA(GOLD,0.9):hexA(ROSE,0.5);
        ctx.shadowBlur=held?6*C:0; ctx.shadowColor=GOLD; ctx.fill(); ctx.shadowBlur=0;
      }
      const coh=inside/MAXC;
      if(Math.round(t/0.02)%6===0) setRead({prog:Math.round(Math.max(0,Math.min(1,prog))*100),coh:Math.round(coh*100),v:+v.toFixed(1)});
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
      <canvas ref={cvRef} style={{width:"100%",height:340,display:"block",borderRadius:10,border:`1px solid ${BORDER}`}}/>
      <div style={{display:"flex",gap:16,flexWrap:"wrap",marginTop:12}}>
        {slider("warp velocity",vRef,0.5,6,0.1,GOLD)}
        {slider("bubble coherence 𝒞",CRef,0,1,0.01,CYAN)}
        {slider("solar wind",WRef,0,1,0.02,ROSE)}
      </div>
      <div style={{display:"flex",gap:16,flexWrap:"wrap",marginTop:12,fontFamily:"monospace",fontSize:11.5,color:MUTED}}>
        <div>transit: <span style={{color:GOLD}}>{read.prog}%</span></div>
        <div>cloud coherence: <span style={{color:read.coh>60?GREEN:ROSE}}>{read.coh}%</span></div>
        <div>v: <span style={{color:CYAN}}>{read.v}×c</span></div>
      </div>
    </div>
  );
}

const SCALES=[
  {t:"Solar Transport",c:GOLD,items:["Photons + solar wind carry energy at c","Radiation pressure P = S/c drives sails","The Sun is the source term of the transport field","Limit case: v_s → 1 (light-speed carrier)"]},
  {t:"Planetary Transport",c:GREEN,items:["Gravity wells bend and route trajectories","Hohmann transfers trade time for energy","Orbital resonance is coherence between bodies","Limit case: slow, curvature-guided flow"]},
  {t:"Warp-Cloud Transport",c:CYAN,items:["A coherence bubble carries matter as a cloud","Space contracts ahead, expands behind","Effective v_s > c without local overspeed","Unifies solar + planetary as boundary cases"]},
];

export default function CloudTransportWarpPage(){
  return(
    <div style={{minHeight:"100vh",background:BG,color:TEXT,padding:"40px 20px 80px",fontFamily:"'Inter',system-ui,sans-serif"}}>
      <div style={{maxWidth:980,margin:"0 auto"}}>
        <div style={{fontFamily:"monospace",fontSize:11,color:MUTED,letterSpacing:2,textTransform:"uppercase",marginBottom:8}}>Project AETHER · Transport Synthesis · Elements of Motion</div>
        <h1 style={{fontSize:30,margin:"0 0 6px",fontWeight:700,background:`linear-gradient(90deg,${GOLD},${CYAN},${VIOLET})`,WebkitBackgroundClip:"text",backgroundClip:"text",color:"transparent"}}>
          Cloud Transport System — Warp Drive Mathematical Synthesis
        </h1>
        <p style={{fontSize:14,color:MUTED,lineHeight:1.7,margin:"0 0 24px",maxWidth:800}}>
          One transport law across every scale. Solar transport (photons at c), planetary transport (gravity-guided orbits), and warp-cloud transport (matter carried inside a coherence bubble) are three regimes of the same metric-transport mathematics. Here matter travels as a coherent <strong style={{color:GOLD}}>cloud</strong> held in an Alcubierre-style bubble — space contracts ahead and expands behind, so the cloud never moves locally faster than light yet crosses the gap in warp time. This synthesizes the transport <strong style={{color:CYAN}}>elements</strong> catalogued across the system.
        </p>

        <div style={{background:PAN,border:`1px solid ${BORDER}`,borderRadius:12,padding:18,marginBottom:24}}>
          <div style={{fontFamily:"monospace",fontSize:11,color:CYAN,marginBottom:14,textTransform:"uppercase",letterSpacing:1}}>Live · Warp Metric — Expansion Field θ(x,y)</div>
          <WarpMetricCanvas/>
          <div style={{fontFamily:"monospace",fontSize:11,color:MUTED,marginTop:10,lineHeight:1.6}}>
            The bubble sweeps rightward: blue is contraction ahead, red is expansion behind, gold is the flat interior carrying the payload cloud. Raise σ for a thin wall (less exotic energy but sharper gradients); raise R for a roomier cabin.
          </div>
        </div>

        <div style={{background:PAN,border:`1px solid ${BORDER}`,borderRadius:12,padding:18,marginBottom:24}}>
          <div style={{fontFamily:"monospace",fontSize:11,color:GOLD,marginBottom:14,textTransform:"uppercase",letterSpacing:1}}>Live · Cloud Transit — Sun → Planets → Port</div>
          <CloudTransitCanvas/>
          <div style={{fontFamily:"monospace",fontSize:11,color:MUTED,marginTop:10,lineHeight:1.6}}>
            The coherence bubble carries a particle cloud from the solar source past planetary wells to the destination port. Drop bubble coherence 𝒞 or raise the solar wind and the cloud disperses (gold → rose); high 𝒞 keeps it bound and delivers it intact.
          </div>
        </div>

        <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(280px,1fr))",gap:14,marginBottom:24}}>
          {SCALES.map(s=>(
            <div key={s.t} style={{background:PAN,border:`1px solid ${BORDER}`,borderTop:`3px solid ${s.c}`,borderRadius:12,padding:16}}>
              <div style={{fontSize:14,fontWeight:700,color:s.c,marginBottom:10}}>{s.t}</div>
              <ul style={{margin:0,paddingLeft:16,fontSize:12.5,color:MUTED,lineHeight:1.7}}>
                {s.items.map((it,i)=><li key={i}>{it}</li>)}
              </ul>
            </div>
          ))}
        </div>

        <div style={{background:PAN,border:`1px solid ${BORDER}`,borderRadius:12,padding:18,marginBottom:24}}>
          <div style={{fontFamily:"monospace",fontSize:11,color:VIOLET,marginBottom:12,textTransform:"uppercase",letterSpacing:1}}>The Transport Mathematics</div>
          <div style={{fontFamily:"monospace",fontSize:15,color:GOLD,textAlign:"center",padding:"8px 0"}}>ds² = −c²dt² + (dx − v_s f(r_s) dt)² + dy² + dz²</div>
          <div style={{fontFamily:"monospace",fontSize:15,color:CYAN,textAlign:"center",padding:"8px 0"}}>f(r_s) = [tanh σ(r_s+R) − tanh σ(r_s−R)] / (2 tanh σR)</div>
          <div style={{fontFamily:"monospace",fontSize:15,color:VIOLET,textAlign:"center",padding:"8px 0"}}>θ = v_s (x_s/r_s)(df/dr_s)    ·    t_transit = d / (v_s · c)</div>
          <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(200px,1fr))",gap:8,fontFamily:"monospace",fontSize:11.5,color:MUTED,marginTop:8}}>
            <div><span style={{color:CYAN}}>v_s</span> — warp velocity of the bubble</div>
            <div><span style={{color:CYAN}}>f(r_s)</span> — shape function · bubble profile</div>
            <div><span style={{color:CYAN}}>θ</span> — expansion scalar · York time</div>
            <div><span style={{color:CYAN}}>R, σ</span> — bubble radius & wall sharpness</div>
            <div><span style={{color:CYAN}}>x_s, r_s</span> — offset & radius from center</div>
            <div><span style={{color:CYAN}}>𝒞</span> — cloud coherence · payload integrity</div>
          </div>
        </div>

        <div style={{background:hexA(GREEN,0.05),border:`1px solid ${hexA(GREEN,0.22)}`,borderRadius:12,padding:18,marginBottom:28}}>
          <div style={{fontSize:13,fontWeight:700,color:GREEN,marginBottom:10}}>What This Synthesizes</div>
          <ul style={{margin:0,paddingLeft:18,fontSize:12.5,color:MUTED,lineHeight:1.8}}>
            <li><strong style={{color:TEXT}}>One law, all scales:</strong> solar, planetary, and warp transport are limits of a single metric-transport equation.</li>
            <li><strong style={{color:TEXT}}>Matter as a cloud:</strong> payloads travel as coherent clouds whose integrity is measured by 𝒞.</li>
            <li><strong style={{color:TEXT}}>No local overspeed:</strong> the cloud rides flat interior space while the metric does the moving.</li>
            <li><strong style={{color:TEXT}}>Honest horizon:</strong> the Alcubierre metric is real GR; the exotic-energy budget remains speculative.</li>
          </ul>
        </div>

        <div style={{display:"flex",flexWrap:"wrap",gap:14,paddingTop:20,borderTop:`1px solid ${BORDER}`,fontFamily:"monospace",fontSize:12}}>
          <Link href="/periodic-table" style={{color:GOLD,textDecoration:"none"}}>→ AETHER Periodic Table · Elements</Link>
          <Link href="/warp-bubble-engine" style={{color:CYAN,textDecoration:"none"}}>→ Warp Bubble Engine</Link>
          <Link href="/solar-architecture" style={{color:VIOLET,textDecoration:"none"}}>→ Solar Architecture</Link>
          <Link href="/transport-cavity" style={{color:GREEN,textDecoration:"none"}}>→ Transport Cavity</Link>
          <Link href="/" style={{color:MUTED,textDecoration:"none"}}>→ Knowledge Graph</Link>
        </div>
      </div>
    </div>
  );
}
