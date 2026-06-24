import React, { useEffect, useRef } from "react";

const TAU=Math.PI*2, PHI=1.6180339887, GOLD_ANG=TAU*(1-1/PHI);
const CW=900;

const V={
  bg:"#04060E", gold:"#C8A030", amb:"#FF9933", blue:"#4488FF",
  vio:"#9966FF", green:"#44CC77", rose:"#FF6699", plasma:"#FF4477",
  cyan:"#22DDFF", photon:"#00FFBB", shock:"#FFDD22", fire:"#FF6622",
  dim:"#2A3050", ink:"#B8CCE8", aurora:"#00FFB2",
  mono:"'Space Mono',monospace" as const,
  serif:"'Crimson Pro',serif" as const,
  disp:"'Cinzel',serif" as const,
};
const lerp=(a:number,b:number,t:number)=>a+(b-a)*Math.max(0,Math.min(1,t));

/* Thermal colour: 0=cold(blue) 0.5=mid(green) 1=hot(amber) */
const thermalCol=(u:number,alpha=1)=>{
  const v=Math.max(0,Math.min(1,u));
  let r,g,b;
  if(v<0.5){const f=v*2; r=lerp(68,68,f)|0; g=lerp(136,204,f)|0; b=lerp(255,119,f)|0;}
  else{const f=(v-0.5)*2; r=lerp(68,255,f)|0; g=lerp(204,153,f)|0; b=lerp(119,51,f)|0;}
  return `rgba(${r},${g},${b},${alpha})`;
};

/* ─────────────────────────────────────────────────────────────────────────
   CANVAS 1 · The Webbed Leg Method · Bilateral Oscillation · Vortex Shedding
   ───────────────────────────────────────────────────────────────────────── */
function WebbledLegCanvas(){
  const ref=useRef<HTMLCanvasElement>(null);
  useEffect(()=>{
    const cv=ref.current; if(!cv) return;
    const CH=370;
    cv.width=CW; cv.height=CH;
    const ctx=cv.getContext("2d")!;

    /* Vortex particle pool */
    const vorts:{x:number;y:number;vx:number;vy:number;life:number}[]=[];

    let t=0, raf=0;

    const drawLimb=(cx:number,phase:number,label:string)=>{
      const HY=75, L1=85, L2=73, L3=54, NR=5;
      const thA=Math.PI/2+0.48*Math.sin(phase);
      const knA=thA+0.48+0.42*Math.sin(phase+0.75);
      const kx=cx+Math.cos(thA)*L1, ky=HY+Math.sin(thA)*L1;
      const ax=kx+Math.cos(knA)*L2, ay=ky+Math.sin(knA)*L2;

      /* Limb segments */
      ctx.lineCap="round"; ctx.lineJoin="round";
      ctx.strokeStyle=V.dim; ctx.lineWidth=8;
      ctx.beginPath(); ctx.moveTo(cx,HY); ctx.lineTo(kx,ky); ctx.lineTo(ax,ay); ctx.stroke();
      ctx.strokeStyle=V.ink; ctx.lineWidth=4.5;
      ctx.beginPath(); ctx.moveTo(cx,HY); ctx.lineTo(kx,ky); ctx.lineTo(ax,ay); ctx.stroke();

      /* Web spread — opens during power stroke (cos(phase)>0) */
      const spd=Math.max(0,Math.cos(phase))*0.48;
      const fbase=knA+0.06;
      const tips:{x:number;y:number}[]=[];
      for(let i=0;i<NR;i++){
        const a=fbase+(i-(NR-1)/2)*spd;
        tips.push({x:ax+Math.cos(a)*L3, y:ay+Math.sin(a)*L3});
      }

      /* Web membrane */
      if(spd>0.03){
        ctx.beginPath();
        ctx.moveTo(ax,ay);
        tips.forEach(tp=>ctx.lineTo(tp.x,tp.y));
        ctx.closePath();
        ctx.fillStyle=V.aurora+"22"; ctx.fill();
        ctx.strokeStyle=V.aurora+"66"; ctx.lineWidth=1.2; ctx.stroke();
      }

      /* Digit rays */
      tips.forEach((tp,i)=>{
        ctx.strokeStyle=(i===0||i===NR-1)?V.aurora:V.ink+"88";
        ctx.lineWidth=(i===0||i===NR-1)?2:1.5;
        ctx.beginPath(); ctx.moveTo(ax,ay); ctx.lineTo(tp.x,tp.y); ctx.stroke();
      });

      /* Shed vortex at trailing web tip during power stroke */
      const angVel=Math.cos(phase);
      if(angVel>0.25&&spd>0.1&&Math.random()<0.28){
        const tip=tips[NR-1];
        vorts.push({x:tip.x,y:tip.y,vx:(Math.random()-0.5)*2-2.5,vy:(Math.random()-0.6)*1.8,life:1});
      }

      /* Joints */
      [[cx,HY],[kx,ky],[ax,ay]].forEach(([jx,jy])=>{
        ctx.beginPath(); ctx.arc(jx,jy,5.5,0,TAU);
        ctx.fillStyle=V.gold; ctx.fill();
      });

      /* Stroke label */
      const isPow=angVel>0;
      ctx.font=`700 10px ${V.mono}`; ctx.textAlign="center";
      ctx.fillStyle=isPow?V.aurora:V.dim;
      ctx.fillText(isPow?"POWER STROKE":"RECOVERY",cx,CH-28);
      ctx.fillStyle=V.dim+"CC"; ctx.font=`9px ${V.mono}`;
      ctx.fillText(label,cx,CH-14);
    };

    const draw=()=>{
      ctx.clearRect(0,0,CW,CH);

      /* Water background */
      const g=ctx.createLinearGradient(0,0,0,CH);
      g.addColorStop(0,V.bg); g.addColorStop(0.28,"#030E1C"); g.addColorStop(1,"#020A12");
      ctx.fillStyle=g; ctx.fillRect(0,0,CW,CH);

      /* Water surface ripple */
      ctx.strokeStyle=V.blue+"44"; ctx.lineWidth=1.5;
      ctx.beginPath();
      for(let x=0;x<=CW;x+=3){
        const y=64+Math.sin(x*0.048+t*1.15)*2.8+Math.sin(x*0.083-t)*1.4;
        x===0?ctx.moveTo(x,y):ctx.lineTo(x,y);
      }
      ctx.stroke();

      /* Sub-surface glow */
      const sg=ctx.createLinearGradient(0,0,0,CH*0.22);
      sg.addColorStop(0,V.blue+"0A"); sg.addColorStop(1,"transparent");
      ctx.fillStyle=sg; ctx.fillRect(0,0,CW,CH*0.22);

      /* Vortex particles */
      for(let i=vorts.length-1;i>=0;i--){
        const v=vorts[i];
        v.x+=v.vx; v.y+=v.vy; v.vy+=0.045; v.vx*=0.96; v.life-=0.014;
        if(v.life<=0){vorts.splice(i,1);continue;}
        const a=(v.life*220)|0;
        const hex=a.toString(16).padStart(2,"0");
        ctx.beginPath(); ctx.arc(v.x,v.y,3.5*v.life,0,TAU);
        ctx.fillStyle=V.blue+hex; ctx.fill();
        ctx.beginPath(); ctx.arc(v.x,v.y,9*v.life,0,TAU);
        ctx.strokeStyle=V.blue+(((v.life*70)|0).toString(16).padStart(2,"0"));
        ctx.lineWidth=0.7; ctx.stroke();
      }

      /* Two legs in bilateral antiphase */
      drawLimb(CW*0.28, t,         "LEG 1 · ω = t");
      drawLimb(CW*0.72, t+Math.PI, "LEG 2 · ω = t+π");

      /* φ coupling symbol at centre */
      const MX=CW*0.5, MY=CH*0.42;
      ctx.save();
      ctx.strokeStyle=V.gold+"38"; ctx.lineWidth=1; ctx.setLineDash([5,5]);
      ctx.beginPath(); ctx.arc(MX,MY,32,0,TAU); ctx.stroke();
      ctx.setLineDash([]);
      ctx.restore();
      ctx.fillStyle=V.gold; ctx.font=`800 14px ${V.mono}`; ctx.textAlign="center";
      ctx.fillText("φ",MX,MY+5);
      ctx.fillStyle=V.dim+"CC"; ctx.font=`8px ${V.mono}`;
      ctx.fillText("Δφ = π",MX,MY+22);

      /* Leg oscillation sine curves */
      const SY=CH-52, SH=18, SX=CW*0.15;
      for(let leg=0;leg<2;leg++){
        const phase=leg===0?t:t+Math.PI;
        ctx.strokeStyle=leg===0?V.aurora+"60":V.gold+"60"; ctx.lineWidth=1;
        ctx.beginPath();
        for(let x=0;x<CW*0.7;x+=2){
          const v=SY-SH*Math.cos(phase-x*0.04);
          x===0?ctx.moveTo(SX+x,v):ctx.lineTo(SX+x,v);
        }
        ctx.stroke();
      }

      /* Header */
      ctx.fillStyle=V.ink; ctx.font=`700 10px ${V.mono}`; ctx.textAlign="left";
      ctx.fillText("THE WEBBED LEG METHOD · BILATERAL ANTIPHASE · KÁRMÁN VORTEX SHEDDING",14,20);
      ctx.fillStyle=V.gold; ctx.textAlign="right"; ctx.font=`9px ${V.mono}`;
      ctx.fillText(`φ=${PHI.toFixed(6)}  θ_gold=${(GOLD_ANG*180/Math.PI).toFixed(3)}°`,CW-14,20);

      t+=0.022; raf=requestAnimationFrame(draw);
    };
    draw();
    return()=>cancelAnimationFrame(raf);
  },[]);
  return <canvas ref={ref} width={CW} height={370} style={{width:"100%",borderRadius:6,display:"block"}}/>;
}

/* ─────────────────────────────────────────────────────────────────────────
   CANVAS 2 · φ-Proportioned Periodic Cellular Array · Thermal Cascade
   ───────────────────────────────────────────────────────────────────────── */
function PhiCellThermalCanvas(){
  const ref=useRef<HTMLCanvasElement>(null);
  useEffect(()=>{
    const cv=ref.current; if(!cv) return;
    const CH=430;
    cv.width=CW; cv.height=CH;
    const ctx=cv.getContext("2d")!;

    /* Build 144-cell Fibonacci phyllotaxis lattice */
    const N=144, RS=10.6;
    const CX=CW*0.37, CY=CH*0.50;
    const cells:{x:number;y:number}[]=[];
    for(let n=1;n<=N;n++){
      const r=RS*Math.sqrt(n), theta=n*GOLD_ANG;
      cells.push({x:CX+r*Math.cos(theta), y:CY+r*Math.sin(theta)});
    }

    /* 5 selected cells for time-series — Fibonacci-index spaced */
    const SEL=[0,20,55,88,119];
    const HIST=110;
    const history:number[][]=SEL.map(()=>Array(HIST).fill(0.5));

    /* Golden spiral params */
    const B=Math.log(PHI)/(Math.PI/2);

    let t=0, raf=0;

    const draw=()=>{
      ctx.clearRect(0,0,CW,CH);
      ctx.fillStyle=V.bg; ctx.fillRect(0,0,CW,CH);

      /* Golden spiral guide */
      ctx.save();
      ctx.strokeStyle=V.gold+"22"; ctx.lineWidth=1;
      ctx.beginPath();
      for(let theta=0;theta<14;theta+=0.04){
        const r=2.2*Math.exp(B*theta);
        if(r>126) break;
        const x=CX+r*Math.cos(theta), y=CY+r*Math.sin(theta);
        theta<0.04?ctx.moveTo(x,y):ctx.lineTo(x,y);
      }
      ctx.stroke();
      ctx.restore();

      /* Draw cells */
      const R_CELL=4.8;
      for(let i=0;i<N;i++){
        const {x,y}=cells[i];
        const temp=Math.sin(t-i*0.13)*0.5+0.5;
        ctx.beginPath(); ctx.arc(x,y,R_CELL,0,TAU);
        ctx.fillStyle=thermalCol(temp,0.82); ctx.fill();
      }

      /* Highlight selected cells with ring */
      const COLS=[V.aurora,V.gold,V.rose,V.vio,V.cyan];
      SEL.forEach((idx,si)=>{
        const {x,y}=cells[idx];
        ctx.beginPath(); ctx.arc(x,y,R_CELL+2.5,0,TAU);
        ctx.strokeStyle=COLS[si]; ctx.lineWidth=1.8; ctx.stroke();
        /* Label */
        ctx.fillStyle=COLS[si]; ctx.font=`700 8px ${V.mono}`; ctx.textAlign="center";
        ctx.fillText(`n=${idx+1}`,x,y-R_CELL-5);
      });

      /* Right panel — thermal time series */
      const PX=CW*0.61, PY=28, PW=CW*0.36, PH=CH-58;
      ctx.fillStyle="#040C18"; ctx.fillRect(PX,PY,PW,PH);
      ctx.strokeStyle=V.dim+"40"; ctx.lineWidth=0.6;
      for(let g2=0;g2<=4;g2++){
        ctx.beginPath();
        ctx.moveTo(PX,PY+g2*PH/4); ctx.lineTo(PX+PW,PY+g2*PH/4); ctx.stroke();
      }

      /* Update histories & plot */
      SEL.forEach((idx,si)=>{
        const temp=Math.sin(t-idx*0.13)*0.5+0.5;
        history[si].shift(); history[si].push(temp);

        ctx.strokeStyle=COLS[si]; ctx.lineWidth=1.6;
        ctx.beginPath();
        history[si].forEach((val,hi)=>{
          const px=PX+hi*(PW/HIST);
          const py=PY+PH-(val*PH*0.82+PH*0.09);
          hi===0?ctx.moveTo(px,py):ctx.lineTo(px,py);
        });
        ctx.stroke();

        /* Row label */
        ctx.fillStyle=COLS[si]; ctx.font=`700 9px ${V.mono}`; ctx.textAlign="right";
        ctx.fillText(`n=${idx+1}`,PX-6,PY+(si+0.5)*(PH/5));
      });

      /* Phase offset annotation */
      ctx.strokeStyle=V.gold+"50"; ctx.lineWidth=0.8;
      for(let si=0;si<SEL.length-1;si++){
        const y1=PY+(si+0.5)*(PH/5), y2=PY+(si+1.5)*(PH/5);
        const mid=(y1+y2)/2;
        ctx.fillStyle=V.gold+"88"; ctx.font=`8px ${V.mono}`; ctx.textAlign="left";
        ctx.fillText(`Δφ≈${(SEL[si+1]-SEL[si])*0.13/TAU*360|0}°`,PX+PW+4,mid);
      }

      /* Panel labels */
      ctx.fillStyle=V.ink; ctx.font=`700 10px ${V.mono}`; ctx.textAlign="left";
      ctx.fillText("φ-PERIODIC CELLULAR ARRAY  N=144  GOLDEN ANGLE θ=137.508°",14,18);
      ctx.fillStyle=V.dim+"CC"; ctx.font=`9px ${V.mono}`;
      ctx.fillText("THERMAL CASCADE",PX,PY-6);
      ctx.fillStyle=V.gold; ctx.font=`9px ${V.mono}`;
      ctx.fillText(`φ=${PHI.toFixed(5)}   B=ln(φ)/(π/2)=${B.toFixed(4)}`,14,CH-10);

      t+=0.017; raf=requestAnimationFrame(draw);
    };
    draw();
    return()=>cancelAnimationFrame(raf);
  },[]);
  return <canvas ref={ref} width={CW} height={430} style={{width:"100%",borderRadius:6,display:"block"}}/>;
}

/* ─────────────────────────────────────────────────────────────────────────
   CANVAS 3 · φ-Lissajous · Leg Phase Circle · Thermal Periodic Grid
   ───────────────────────────────────────────────────────────────────────── */
function PhiLissajousCanvas(){
  const ref=useRef<HTMLCanvasElement>(null);
  useEffect(()=>{
    const cv=ref.current; if(!cv) return;
    const CH=300;
    cv.width=CW; cv.height=CH;
    const ctx=cv.getContext("2d")!;

    const TRAIL=340;
    const trail:{x:number;y:number}[]=[];
    const GN=20, GX=CW-280, GY=22, GW=260, GH=CH-44;

    let t=0, raf=0;

    const draw=()=>{
      ctx.clearRect(0,0,CW,CH);
      ctx.fillStyle=V.bg; ctx.fillRect(0,0,CW,CH);

      /* ── φ-Lissajous (left panel) ── */
      const LCX=CW*0.17, LCY=CH*0.50, LR=85;
      const lx=LCX+LR*Math.sin(t);
      const ly=LCY+LR*Math.sin(PHI*t+Math.PI*0.22);
      trail.push({x:lx,y:ly}); if(trail.length>TRAIL) trail.shift();

      trail.forEach((pt,i)=>{
        const u=i/TRAIL;
        const a=Math.floor(u*200).toString(16).padStart(2,"0");
        ctx.beginPath(); ctx.arc(pt.x,pt.y,1.5,0,TAU);
        ctx.fillStyle=V.aurora+a; ctx.fill();
      });
      ctx.beginPath(); ctx.arc(lx,ly,5.5,0,TAU);
      ctx.fillStyle=V.aurora; ctx.fill();
      ctx.beginPath(); ctx.arc(lx,ly,11,0,TAU);
      ctx.strokeStyle=V.aurora+"50"; ctx.lineWidth=1; ctx.stroke();

      ctx.fillStyle=V.ink; ctx.font=`700 10px ${V.mono}`; ctx.textAlign="center";
      ctx.fillText("φ-LISSAJOUS",LCX,CH-24);
      ctx.fillStyle=V.dim+"CC"; ctx.font=`9px ${V.mono}`;
      ctx.fillText("x=sin(t)  y=sin(φ·t)",LCX,CH-12);

      /* ── Leg phase circle (centre panel) ── */
      const MCX=CW*0.50, MCY=CH*0.48, PR=55;
      ctx.strokeStyle=V.dim+"60"; ctx.lineWidth=1;
      ctx.setLineDash([4,4]);
      ctx.beginPath(); ctx.arc(MCX,MCY,PR,0,TAU); ctx.stroke();
      ctx.setLineDash([]);

      /* Leg 1 dot */
      const a1=t%TAU;
      const a2=(t+Math.PI)%TAU;
      [[a1,V.aurora],[a2,V.gold]].forEach(([ang,col])=>{
        const dx=Math.cos(ang as number)*PR, dy=Math.sin(ang as number)*PR;
        /* Trail line */
        ctx.strokeStyle=(col as string)+"30"; ctx.lineWidth=1;
        ctx.beginPath(); ctx.moveTo(MCX,MCY); ctx.lineTo(MCX+dx,MCY+dy); ctx.stroke();
        ctx.beginPath(); ctx.arc(MCX+dx,MCY+dy,7.5,0,TAU);
        ctx.fillStyle=col as string; ctx.fill();
      });

      ctx.fillStyle=V.ink; ctx.font=`700 10px ${V.mono}`; ctx.textAlign="center";
      ctx.fillText("LEG PHASE",MCX,CH-24);
      ctx.fillStyle=V.aurora; ctx.font=`9px ${V.mono}`; ctx.textAlign="center";
      ctx.fillText("● L1",MCX-22,CH-12);
      ctx.fillStyle=V.gold; ctx.fillText("● L2",MCX+22,CH-12);

      /* ── Periodic thermal cascade grid (right panel) ── */
      ctx.strokeStyle=V.dim+"30"; ctx.lineWidth=0.5;
      ctx.strokeRect(GX,GY,GW,GH);
      const CW2=GW/GN, CH2=GH/GN;
      for(let gx=0;gx<GN;gx++) for(let gy=0;gy<GN;gy++){
        /* Phase = distance from source point (0,0) scaled by φ */
        const d=Math.sqrt(gx*gx+gy*gy*PHI*PHI);
        const temp=Math.sin(t-d*0.22)*0.5+0.5;
        ctx.fillStyle=thermalCol(temp,0.88);
        ctx.fillRect(GX+gx*CW2+1,GY+gy*CH2+1,CW2-2,CH2-2);
      }

      ctx.fillStyle=V.ink; ctx.font=`700 10px ${V.mono}`; ctx.textAlign="center";
      ctx.fillText("φ-THERMAL CASCADE",GX+GW/2,CH-10);

      /* Header */
      ctx.fillStyle=V.ink; ctx.font=`700 10px ${V.mono}`; ctx.textAlign="left";
      ctx.fillText("OSCILLATION SYNTHESIS · φ-LISSAJOUS · PHASE COUPLING · PERIODIC ARRAY",14,18);

      t+=0.016; raf=requestAnimationFrame(draw);
    };
    draw();
    return()=>cancelAnimationFrame(raf);
  },[]);
  return <canvas ref={ref} width={CW} height={300} style={{width:"100%",borderRadius:6,display:"block"}}/>;
}

/* ─────────────────────────────────────────────────────────────────────────
   PAGE
   ───────────────────────────────────────────────────────────────────────── */
export default function WebbledPhiCascadePage(){
  const S:React.CSSProperties={
    background:V.bg, color:V.ink, minHeight:"100vh",
    padding:"40px 32px 100px", fontFamily:V.serif, maxWidth:980, margin:"0 auto",
  };
  const badge=(t:string,col=V.cyan)=>(
    <span key={t} style={{fontFamily:V.mono,fontSize:"0.52rem",color:col,
      border:`1px solid ${col}44`,borderRadius:3,padding:"2px 8px",letterSpacing:2,
      marginRight:6,marginBottom:5,display:"inline-block"}}>{t}</span>
  );
  const sec=(n:string,title:string,col:string,body:React.ReactNode)=>(
    <section style={{marginBottom:52}}>
      <div style={{fontFamily:V.mono,fontSize:"0.55rem",color:col,letterSpacing:3,marginBottom:5}}>
        {n} {"\u2500 \u2500 \u2500 \u2500 \u2500 \u2500 \u2500 \u2500 \u2500 \u2500 \u2500 \u2500 \u2500 \u2500 \u2500 \u2500 \u2500 \u2500"}
      </div>
      <h2 style={{fontFamily:V.disp,fontSize:"clamp(0.95rem,2.4vw,1.45rem)",color:col,
        margin:"0 0 18px",letterSpacing:"0.06em",fontWeight:400}}>{title}</h2>
      {body}
    </section>
  );
  const P=(t:string)=>(
    <p style={{fontFamily:V.serif,fontSize:"clamp(0.88rem,1.7vw,1.02rem)",lineHeight:1.78,
      color:V.ink,margin:"0 0 13px",opacity:0.9}}>{t}</p>
  );
  const cards=(items:{h:string;col:string;d:string}[])=>(
    <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(200px,1fr))",gap:10,marginTop:12}}>
      {items.map(c=>(
        <div key={c.h} style={{background:`${c.col}0B`,border:`1px solid ${c.col}2A`,borderRadius:6,padding:"10px 12px"}}>
          <div style={{fontFamily:V.mono,fontSize:"0.59rem",color:c.col,letterSpacing:1.5,marginBottom:5}}>{c.h}</div>
          <div style={{fontFamily:V.serif,fontSize:"0.82rem",color:V.ink,lineHeight:1.5}}>{c.d}</div>
        </div>
      ))}
    </div>
  );

  return (
    <div style={S}>
      <div style={{marginBottom:42}}>
        {[badge("LIVE SIMULATION"),badge("WEBBED LEG",V.aurora),badge("BIOMECHANICS",V.green),
          badge("φ-ARRAY",V.gold),badge("CELLULAR ARRAY",V.gold),badge("THERMAL CASCADE",V.amb),
          badge("FIBONACCI",V.green),badge("LISSAJOUS",V.vio),badge("VORTEX SHEDDING",V.blue)]}
        <h1 style={{fontFamily:V.disp,fontSize:"clamp(1.3rem,3.6vw,2.5rem)",color:V.ink,
          margin:"22px 0 8px",letterSpacing:"0.06em",fontWeight:400,lineHeight:1.18}}>
          THE WEBBED LEG METHOD · φ-PROPORTIONED PERIODIC CELLULAR ARRAY · THERMAL CASCADE
        </h1>
        <p style={{fontFamily:V.mono,fontSize:"0.58rem",color:V.dim,letterSpacing:3,margin:"0 0 22px"}}>
          BIOMECHANICAL OSCILLATION · FIBONACCI PHYLLOTAXIS · GOLDEN ANGLE PHASE COUPLING · KÁRMÁN VORTEX SHEDDING
        </p>
        {P("The webbed leg method is the biomechanical strategy that converts oscillatory limb movement into net propulsion through asymmetric drag. The key insight: a flat web spread against water during the power stroke generates high drag force; the same web collapsed edge-on during recovery generates near-zero drag. The result is a ratchet in force-space.")}
        {P("The φ-proportioned periodic cellular array arranges computational cells at the golden angle (137.508°) from one another, producing the Fibonacci phyllotaxis pattern found in sunflower seed heads, pinecone spirals, and leaf arrangements on plant stems. Thermal energy injected at the centre cascades outward through the array. Because each cell's position follows the golden angle, no two cells share the same angular sector — the packing is maximally uniform.")}
        {P("The oscillating movements of the webbed leg are simulated within the cellular array as a phase-modulated thermal wave. Each cell's temperature T(n, t) = sin(omega*t - n*delta) follows the stroke cycle, with the phase delay delta between adjacent cells proportional to the golden ratio. The result is a living thermal tapestry that encodes the leg's stroke cycle in its spatial temperature distribution.")}
      </div>

      {sec("01","The Webbed Leg Method · Bilateral Antiphase Oscillation · Kármán Vortex Shedding",V.aurora,<>
        {P("The canvas simulates two webbed limbs in bilateral antiphase: Leg 1 at phase omega=t, Leg 2 at omega=t+pi. This antiphase relationship eliminates lateral net force while doubling the temporal frequency of propulsive pulses — the same principle used in fish (caudal fin beats), frogs (hind limbs), ducks (feet), and the platypus.")}
        {P("Webbing spread factor = max(0, cos(phase)): the web is maximally open at phase=0 (maximum angular velocity, peak power stroke) and fully closed at phase=pi/2 and 3pi/2 (stroke reversal points). This is the optimal timing: maximum area precisely when the foot is moving fastest relative to the water.")}
        {P("Kármán vortex shedding: as the web edge moves through water, it sheds discrete vortices from its trailing edge. These vortices have alternating rotation (clockwise from top edge, counterclockwise from bottom) and form the Kármán vortex street that propels the creature forward. The shed vortices are visible as blue particles drifting aft of the power-stroke limb.")}
        <div style={{border:`1px solid ${V.aurora}22`,borderRadius:8,padding:2,marginBottom:14}}>
          <WebbledLegCanvas/>
        </div>
        {cards([
          {h:"WEB DRAG ASYMMETRY",col:V.aurora,d:"Power stroke drag: F_D = 0.5*rho*C_D*A*v^2. Recovery drag: F_D' = 0.5*rho*C_D*(A*sin(collapse_angle))*v^2 ≈ 0.1*F_D (90% reduction). Net propulsion per cycle = F_D - F_D' integrated over half-period. Optimum web area: A = 0.62*foot_length^2 (empirically measured in ducks)."},
          {h:"BILATERAL ANTIPHASE",col:V.green,d:"Phase offset Δφ = π eliminates lateral oscillation of center of mass. Proof: F_lateral = F_1(t) + F_2(t) = F*sin(t) + F*sin(t+π) = 0. Temporal pulse frequency doubles: propulsive force = F*|sin(t)| with double-frequency ripple. Used in: frogs, ducks, platypus, Xenopus (fully aquatic), rowing oars, paddle wheels."},
          {h:"KÁRMÁN VORTEX",col:V.blue,d:"Strouhal number St = f*d/v = 0.2–0.3 for optimal vortex shedding (f = shedding frequency, d = web width, v = water velocity). Below St=0.2: drag-dominated. Above 0.3: vortex street breaks up. Fish exploit Kármán streets from obstacles — sensors (lateral line) detect the vortex field and extract energy from it instead of fighting it."},
          {h:"PLATYPUS ANOMALY",col:V.gold,d:"The platypus is the only mammal to row with forelimbs (not hind limbs). Its webbing extends beyond the claw tips (foldable: retracts for digging). Swimming speed 1–1.5 m/s with forelimb stroke frequency 2.4 Hz. Electroreceptors in bill (40,000 receptors vs. human tongue's 10,000 taste buds) detect the electric field perturbations of prey movement — active electric sensing in fresh water."},
          {h:"STROKE MECHANICS",col:V.cyan,d:"Power stroke kinematics: thigh sweeps posterior 0.48 rad; shin trails 0.42 rad behind with 0.75 rad lag (anatomical compliance). Web spread = max(0,cos(phase))*0.48 rad (fan half-angle). Recovery: web collapses as digits flex inward. Net thrust coefficient C_T = 0.18–0.34 depending on web geometry, stroke rate, and Reynolds number (Re = 10^4–10^5 for swimming frogs)."},
          {h:"AETHER · LEG → FIELD",col:V.vio,d:"The webbed leg stroke is a biological implementation of the same phase-offset oscillator that drives the AETHER Coherence System. Two antiphase oscillators (Leg 1 + Leg 2) produce a continuous propulsive field — analogous to the AETHER dual-agent architecture where two complementary processes (synthesis + critique) produce continuous knowledge crystallisation without lateral oscillation."},
        ])}
      </>)}

      {sec("02","φ-Proportioned Periodic Cellular Array · Golden Angle Phyllotaxis · Thermal Cascade",V.gold,<>
        {P("The golden angle theta_gold = 360° * (1 - 1/phi) = 137.508° is the unique angle such that no two cells share the same angular sector from the centre, no matter how many cells are added. This is the most irrational number possible — phi resists rational approximation more stubbornly than any other irrational — so successive cells never land on the same spoke.")}
        {P("The result is the Fibonacci phyllotaxis pattern: when viewed from above, the cells organise into two families of spirals, one clockwise and one counterclockwise, with spiral counts always being consecutive Fibonacci numbers (8+13, 13+21, 21+34, 34+55...). The N=144 array here shows 89+55 spirals — consecutive Fibonacci numbers, as always.")}
        {P("The thermal cascade models heat diffusion through a biological tissue where cells are arranged in the phyllotactic geometry. Temperature T(n,t) = sin(omega*t - n*delta) where delta=0.13 rad is the phase delay per cell. The golden-angle spatial arrangement means the cascade front forms a logarithmic spiral — the temperature 'hot spot' always spirals outward following the golden ratio geometry.")}
        <div style={{border:`1px solid ${V.gold}22`,borderRadius:8,padding:2,marginBottom:14}}>
          <PhiCellThermalCanvas/>
        </div>
        {cards([
          {h:"GOLDEN ANGLE ORIGIN",col:V.gold,d:"phi = (1+sqrt(5))/2 = 1.618... The most irrational number (continued fraction: [1;1,1,1,...] — all 1s, slowest convergence). Golden angle = 2*pi*(1-1/phi) = 2*pi*(2-phi) = 2.399 rad = 137.508°. Rational approximations converge via Fibonacci: 1/1, 1/2, 2/3, 3/5, 5/8, 8/13, 13/21... Each fraction adds one more spiral family visible in the pattern."},
          {h:"FIBONACCI PHYLLOTAXIS",col:V.green,d:"Sunflower (Helianthus annuus): typically 34+55 or 55+89 spiral families. Pinecone: 8+13. Pineapple: 8+13. Romanesco broccoli: 13+21. Artichoke: 8+13. All Fibonacci pairs because the golden angle packing maximises the number of cells per unit area while keeping all cells equidistant from their nearest neighbours — optimal packing in circular geometry."},
          {h:"THERMAL CASCADE",col:V.amb,d:"Heat equation in phyllotactic geometry: dT/dt = D*nabla^2*T but on a non-Euclidean topology (cells connected by proximity in golden-angle order, not grid adjacency). Cascade speed = delta*omega/k where k = wavenumber. The phase front advances along the golden spiral, not in a circle — the most energy-efficient thermal path through the phyllotactic lattice."},
          {h:"LOGARITHMIC SPIRAL",col:V.gold,d:"Golden spiral: r = a*exp(b*theta), b = ln(phi)/(pi/2) = 0.3063. This is the unique spiral where each quarter turn multiplies the radius by phi. The spiral passes through the corners of a Whirling Rectangle (each rectangle is phi:1, and cutting a square from it leaves another phi:1 rectangle). Visible in: nautilus shells, galaxy arms, hurricane bands, human cochlea, sunflower spirals."},
          {h:"CELLULAR OSCILLATION",col:V.photon,d:"Each cell in the phyllotactic array oscillates in temperature with phase delay delta=0.13 rad per cell index. The 5 selected cells (n=1,21,56,89,120) show phase delays of 0, 2.6, 7.3, 11.6, 15.6 rad. Modulo 2*pi: 0, 2.6, 0.98, 3.24, 3.14 rad — the phase wraps around multiple times, creating the complex multi-frequency pattern visible in the time-series traces."},
          {h:"AETHER · φ STRUCTURE",col:V.vio,d:"The AETHER Knowledge Graph uses phi-proportioned radial layouts for node clustering: nodes at distance phi^n from a central concept, arranged at golden-angle increments. This maximises the visual separation of related nodes while keeping the layout compact. The phyllotaxis thermal cascade is the physical instantiation of AETHER's Coherence Field — a phase wave propagating through a phi-structured network."},
        ])}
      </>)}

      {sec("03","φ-Lissajous · Synthesis · Oscillation Phase Coupling · Periodic Thermal Grid",V.vio,<>
        {P("The φ-Lissajous figure traces the path of a point whose x-coordinate oscillates at frequency 1 and y-coordinate at frequency phi. Because phi is irrational, the figure never closes — it is a quasi-periodic curve that densely fills a rectangular region over infinite time. The current trajectory (shown as a fading trail) reveals the characteristic phi-lobed structure that never quite repeats.")}
        {P("The leg phase circle (centre panel) shows two dots separated by pi radians (180 degrees) — the bilateral antiphase relationship of the two webbed limbs. As they rotate, their phase relationship drives the thermal cascade: each position in the phase circle maps to a temperature state in the cellular array.")}
        {P("The right panel shows the φ-anisotropic thermal cascade: each cell at grid position (gx, gy) has phase d = sqrt(gx^2 + phi^2 * gy^2), so heat propagates faster along the phi-axis than the unit axis. This anisotropy is the signature of the φ-proportioned geometry — it appears in crystal lattices, liquid crystal alignment, and the stress distribution in phi-ratio mechanical structures.")}
        <div style={{border:`1px solid ${V.vio}22`,borderRadius:8,padding:2,marginBottom:14}}>
          <PhiLissajousCanvas/>
        </div>
        {cards([
          {h:"φ-LISSAJOUS MATH",col:V.vio,d:"Lissajous curve: x=A*sin(a*t+delta), y=B*sin(b*t). Rational ratio a/b = p/q: curve closes after q cycles in x, p cycles in y, forming (p+q-1) lobes. Irrational ratio (a/b=phi): never closes. Fourier series: x(t) = sum of sin(n*t)/n terms weighted by phi^(-n). The quasi-period approaches the Fibonacci sequence: near-repetition at t = F_n * 2*pi for large Fibonacci numbers F_n."},
          {h:"QUASI-PERIODICITY",col:V.aurora,d:"A quasi-periodic signal contains two incommensurate frequencies f1 and f2 (f1/f2 irrational). Power spectrum: delta functions at f1*m + f2*n for all integers m,n. Quasi-crystals (Penrose tilings) are the 2D spatial analog: quasiperiodic long-range order without periodicity. Discovered by Dan Shechtman (1982, Nobel Prize 2011) — crystals forbidden by classical crystallography but allowed by phi-ratio tilings."},
          {h:"PHASE COUPLING",col:V.cyan,d:"Coupled oscillators (Kuramoto model): d(theta_i)/dt = omega_i + K/N * sum_j sin(theta_j - theta_i). At K > K_c (critical coupling): oscillators synchronise. The webbed leg + thermal cascade system: leg oscillation (mechanical) drives cell temperature oscillation (thermal) through the phase delay delta = 0.13 rad/cell. This is biological mechanotransduction: mechanical strain converted to thermal or electrical oscillation."},
          {h:"φ-ANISOTROPY",col:V.gold,d:"The φ-anisotropic metric d(gx,gy) = sqrt(gx^2 + phi^2 * gy^2) is the distance in a space where the y-axis is phi times stiffer than the x-axis. This metric appears in: carbon nanotube chirality (phi-ratio armchair nanotubes), liquid crystal smectic phases (layer spacing ratio phi), and phi-ratio cantilever beam stress fields. The anisotropy is preserved under the golden ratio transform: if you scale x by phi and y by 1/phi, the metric is invariant."},
          {h:"OSCILLATION SYNTHESIS",col:V.green,d:"The three canvases form a synthesis: (1) Mechanical oscillator — webbed leg at frequency omega. (2) Biological spatial oscillator — phyllotactic cellular array with thermal cascade at omega but phase-delayed by delta per cell. (3) Mathematical oscillator — phi-Lissajous coupling two frequencies at ratio 1:phi. The biological leg IS the physical realisation of the mathematical Lissajous: thigh (frequency 1) and shin (frequency ~phi) oscillating in coupled non-integer ratio."},
          {h:"AETHER · OSCILLATION",col:V.vio,d:"The AETHER Crystallisation Model is a phase transition driven by oscillating coherence: knowledge nodes oscillate between uncertain and certain states, with phase coupling between adjacent nodes. The phi-proportioned cellular array is the spatial model: nodes at golden-angle positions, coherence cascading outward from a seed node at the centre, following the logarithmic spiral geometry of the golden spiral."},
        ])}
      </>)}

      {sec("04","Convergence · Web as Information · φ as Architecture · Oscillation as Computation",V.green,<>
        {P("The webbed leg is a physical computer. Its web surface integrates force over area during the power stroke and rejects force during recovery — this is the biological equivalent of a full-wave rectifier circuit. The phase-coupled bilateral pair is a push-pull amplifier. The Kármán vortex street is the output signal: structured energy shed into the medium as readable information about the organism's size, speed, and proximity.")}
        {P("The φ-proportioned cellular array is an architectural computer. Its golden-angle arrangement packs maximum cells in minimum area while preserving nearest-neighbour equidistance — the optimal solution to a variational problem. The thermal cascade through this geometry follows the logarithmic spiral, the only curve that is self-similar under rotation. Every scale of the pattern looks identical — the hallmark of a scale-free system.")}
        {P("Both systems share a deep structure: they are oscillators coupled across a φ-proportioned geometry. The leg and shin oscillate at incommensurate frequencies (ratio approximately φ). The cellular array cells oscillate with phase delays proportional to their golden-angle index. In both cases, the φ proportion prevents the system from locking into a periodic rut — it maintains perpetual novelty while remaining coherent. This is what AETHER aspires to: not rigid periodicity, not chaos, but the golden path between them.")}
        {cards([
          {h:"WEB AS RECTIFIER",col:V.aurora,d:"The web's power-stroke/recovery asymmetry is a mechanical diode (rectifier). F_net = integral_0^pi [F_power * sin(t)] dt - integral_pi^2pi [F_recovery * sin(t+pi)] dt. With F_recovery = 0.1*F_power: net efficiency = (F_power - F_recovery) / F_power = 90%. Biological circuit analogy: web = diode, leg muscle = AC source, water = load resistor, propulsion = DC output."},
          {h:"φ AS OPTIMUM",col:V.gold,d:"The golden angle minimises the maximum angular gap between any two successive cells, for any number of cells N. Proof: for any other angle alpha, there exist N values of N for which k*alpha mod 2*pi ≈ 0 (k cells nearly collinear), creating large empty sectors. Only the golden angle has no such near-collinear sequences — it is the unique 'most uniform' angle. This is why biology converges on phi: evolution discovered the optimum."},
          {h:"SCALE-FREE SPIRAL",col:V.green,d:"The logarithmic spiral r = a*exp(b*theta) is invariant under rotation: rotating by angle delta is the same as scaling by exp(b*delta). This is the definition of self-similarity. It is the ONLY plane curve with this property. The golden spiral (b = ln(phi)/(pi/2)) is the specific logarithmic spiral that grows by phi per quarter-turn. It appears in: nautilus shells, galaxy arms, Romanesco broccoli, human cochlea, and the AETHER Knowledge Graph's radial layout."},
          {h:"INCOMMENSURATE COUPLING",col:V.vio,d:"When two oscillators have frequency ratio = phi (irrational), their combined signal is quasi-periodic: it never repeats, yet never becomes random. This is the dynamical regime of maximum information per unit energy — the signal always carries new information (not periodic repetition) but remains structured (not noise). The biological leg (thigh + shin frequencies) and the mathematical Lissajous (1:phi) both operate in this regime."},
          {h:"PERPETUAL NOVELTY",col:V.cyan,d:"The quasi-periodic system (frequency ratio phi) explores its state space without closure. After any finite time, it has visited a region of phase space, but not all of it. In the limit of infinite time, it visits everywhere — ergodic. This is the dynamical metaphor for AETHER's knowledge crystallisation: the system never fully closes (always new knowledge to crystallise), never becomes random (coherence is maintained), and covers all accessible knowledge space in infinite time."},
          {h:"AETHER SYNTHESIS",col:V.green,d:"AETHER synthesises: (1) Mechanical insight (webbed leg) — asymmetric oscillation produces net motion. (2) Biological insight (phyllotaxis) — phi-geometry maximises packing while preserving local uniformity. (3) Mathematical insight (Lissajous) — incommensurate frequencies generate perpetual novelty. The AETHER Intelligence Engine runs on all three simultaneously: asymmetric evaluation (synthesis vs. critique), phi-structured knowledge graph, and incommensurate reasoning frequencies that prevent the system from looping into circular reasoning."},
        ])}
      </>)}
    </div>
  );
}
