import { useEffect, useRef, useState } from "react";
import katex from "katex";
import "katex/dist/katex.min.css";

const V = {
  bg:"#04060E",aurora:"#00FFB2",gold:"#C8A030",blue:"#4488FF",
  vio:"#9966FF",amb:"#FF9933",rose:"#FF6699",plasma:"#FF4477",
  green:"#44CC77",dim:"#3A5060",ink:"#B8CCE8",fire:"#FF6622",
};
const DEEP="#010812";
const MONO="'Space Mono',monospace";
const SERIF="'Crimson Pro',serif";
const DISP="'Cinzel',serif";

function kx(tex:string,dm=false){
  try{return katex.renderToString(tex,{throwOnError:false,output:"html",displayMode:dm});}
  catch{return tex;}
}
function SectionHead({n,title,col}:{n:string;title:string;col:string}){
  return(
    <div style={{display:"flex",alignItems:"baseline",gap:14,marginBottom:24}}>
      <span style={{fontFamily:MONO,fontSize:9,color:col,letterSpacing:"0.2em"}}>{n}</span>
      <h2 style={{margin:0,fontFamily:DISP,fontSize:"1.1rem",fontWeight:400,
        color:col,letterSpacing:"0.14em"}}>{title}</h2>
      <div style={{flex:1,height:1,background:`linear-gradient(90deg,${col}55,transparent)`}}/>
    </div>
  );
}
function Chip({col,children}:{col:string;children:string}){
  return(
    <span style={{display:"inline-block",padding:"2px 10px",borderRadius:3,
      background:col+"18",border:`1px solid ${col}44`,fontFamily:MONO,
      fontSize:9,color:col,letterSpacing:"0.12em",marginRight:6,marginBottom:4}}>
      {children}
    </span>
  );
}

// ── Module-level types ────────────────────────────────────────────────────────
interface Bubble{x:number;y:number;r:number;spd:number;a:number;}
interface LacePt{ox:number;oy:number;}
interface VortexRing{x:number;y:number;r:number;a:number;life:number;}
interface MsgPulse{r:number;a:number;col:string;}

// ── Main bubble carriage canvas ───────────────────────────────────────────────
function BubbleCarriageCanvas(){
  const ref=useRef<HTMLCanvasElement>(null);
  const rafRef=useRef<number>(0);
  const tRef=useRef(0);

  useEffect(()=>{
    const canvas=ref.current;
    if(!canvas) return;
    const ctx=canvas.getContext("2d");
    if(!ctx) return;
    const W=canvas.width,H=canvas.height;

    // Seeded RNG
    let seed=123;
    const rand=()=>{seed=(seed*16807)%2147483647;return(seed-1)/2147483646;};

    // Rising water bubbles
    const bubbles:Bubble[]=[];
    for(let i=0;i<80;i++) bubbles.push({
      x:rand()*W, y:rand()*H,
      r:0.8+rand()*3.5, spd:0.3+rand()*1.1, a:0.1+rand()*0.45,
    });

    // Lace network — points on carriage surface (pre-built)
    const lacePts:LacePt[]=[];
    const NL=28;
    for(let i=0;i<NL;i++){
      const a=(i/NL)*Math.PI*2+rand()*0.3;
      const rx=92+rand()*14, ry=58+rand()*10;
      lacePts.push({ox:Math.cos(a)*rx, oy:Math.sin(a)*ry});
    }

    // Vortex rings emitted from back
    const vortices:VortexRing[]=[];
    let vortexTimer=0;

    // Message pulses (bioluminescent)
    const msgPulses:MsgPulse[]=[];
    let msgTimer=0;
    const MSG_COLS=[V.aurora,V.vio,V.rose,V.gold,V.blue];

    function tick(){
      tRef.current+=0.016;
      const t=tRef.current;

      // Carriage follows a gentle figure-8
      const cx=W/2+Math.sin(t*0.4)*80;
      const cy=H/2+Math.sin(t*0.8)*30;
      const spin=t*0.6; // body spin angle
      const heading=Math.atan2(Math.cos(t*0.8)*30*0.8,Math.cos(t*0.4)*80*0.4);

      // Spawn vortex rings from back every ~60 frames
      vortexTimer++;
      if(vortexTimer%55===0){
        const bx=cx-Math.cos(heading)*110;
        const by=cy-Math.sin(heading)*110;
        vortices.push({x:bx,y:by,r:20,a:0.6,life:0});
      }

      // Spawn message pulses every ~140 frames
      msgTimer++;
      if(msgTimer%140===0){
        msgPulses.push({r:10,a:0.8,col:MSG_COLS[Math.floor(rand()*MSG_COLS.length)]});
      }

      // ── Background ──────────────────────────────────────────────────────
      if(isFinite(W)&&isFinite(H)){
        const bg=ctx.createLinearGradient(0,0,0,H);
        bg.addColorStop(0,"#000A1A");
        bg.addColorStop(1,"#000510");
        ctx.fillStyle=bg;
        ctx.fillRect(0,0,W,H);
      }

      // Caustic light patterns (ripple on water floor)
      for(let i=0;i<6;i++){
        const lx=100+i*80,ly=H-40+Math.sin(t*1.2+i)*12;
        if(isFinite(lx)&&isFinite(ly)){
          const g=ctx.createRadialGradient(lx,ly,0,lx,ly,40);
          g.addColorStop(0,"rgba(0,180,255,0.04)");
          g.addColorStop(1,"transparent");
          ctx.beginPath();
          ctx.ellipse(lx,ly,60,15,0,0,Math.PI*2);
          ctx.fillStyle=g;
          ctx.fill();
        }
      }

      // ── Vortex rings ────────────────────────────────────────────────────
      for(let i=vortices.length-1;i>=0;i--){
        const v=vortices[i];
        v.r+=1.4; v.a-=0.012; v.life++;
        if(v.a<=0){vortices.splice(i,1);continue;}
        ctx.beginPath();
        ctx.arc(v.x,v.y,v.r,0,Math.PI*2);
        ctx.strokeStyle=`rgba(0,255,178,${v.a*0.4})`;
        ctx.lineWidth=2;
        ctx.stroke();
        ctx.beginPath();
        ctx.arc(v.x,v.y,v.r*0.6,0,Math.PI*2);
        ctx.strokeStyle=`rgba(68,136,255,${v.a*0.25})`;
        ctx.lineWidth=1;
        ctx.stroke();
      }

      // ── Blast bubble field ──────────────────────────────────────────────
      const bubR=120+Math.sin(t*2.8)*8+Math.sin(t*5.1)*3;
      if(isFinite(cx)&&isFinite(cy)){
        // Outer pressure gradient
        const og=ctx.createRadialGradient(cx,cy,bubR*0.55,cx,cy,bubR*1.3);
        og.addColorStop(0,"rgba(0,255,178,0.06)");
        og.addColorStop(0.5,"rgba(68,136,255,0.04)");
        og.addColorStop(1,"transparent");
        ctx.beginPath();
        ctx.arc(cx,cy,bubR*1.3,0,Math.PI*2);
        ctx.fillStyle=og;
        ctx.fill();

        // Inner bubble wall (silk-like sheen)
        const ig=ctx.createRadialGradient(cx,cy,0,cx,cy,bubR);
        ig.addColorStop(0,"rgba(0,20,40,0.0)");
        ig.addColorStop(0.7,"rgba(0,180,255,0.04)");
        ig.addColorStop(0.9,"rgba(0,255,178,0.12)");
        ig.addColorStop(1,"rgba(0,255,178,0.05)");
        ctx.beginPath();
        ctx.arc(cx,cy,bubR,0,Math.PI*2);
        ctx.fillStyle=ig;
        ctx.fill();

        // Bubble wall stroke (shimmering)
        const shimA=0.35+Math.sin(t*3)*0.12;
        ctx.beginPath();
        ctx.arc(cx,cy,bubR,0,Math.PI*2);
        ctx.strokeStyle=`rgba(0,255,178,${shimA})`;
        ctx.lineWidth=1.5;
        ctx.stroke();

        // Second inner ring (pressure wave)
        const ir2=bubR*0.82+Math.sin(t*4.1)*5;
        ctx.beginPath();
        ctx.arc(cx,cy,ir2,0,Math.PI*2);
        ctx.strokeStyle=`rgba(153,102,255,${0.15+Math.sin(t*2)*0.08})`;
        ctx.lineWidth=1;
        ctx.stroke();
      }

      // ── Carriage body ───────────────────────────────────────────────────
      ctx.save();
      ctx.translate(cx,cy);
      ctx.rotate(spin);

      const RX=88,RY=55;

      // Silk sheen layers (concentric, slightly rotated)
      for(let i=6;i>=0;i--){
        const scl=1-i*0.08;
        const silkA=0.06+i*0.04;
        ctx.beginPath();
        ctx.ellipse(0,0,RX*scl,RY*scl,i*0.06,0,Math.PI*2);
        const t2=i/6;
        const r=Math.round(0+t2*20),g=Math.round(40+t2*60),b=Math.round(80+t2*120);
        ctx.fillStyle=`rgba(${r},${g},${b},${silkA})`;
        ctx.fill();
      }

      // Main body outline (silk iridescence)
      ctx.beginPath();
      ctx.ellipse(0,0,RX,RY,0,0,Math.PI*2);
      ctx.strokeStyle="rgba(180,220,255,0.5)";
      ctx.lineWidth=2;
      ctx.stroke();

      // Embroidery stitches — parametric curves over surface
      const embColors=["rgba(200,160,48,0.55)","rgba(255,102,153,0.5)","rgba(0,255,178,0.4)","rgba(153,102,255,0.45)"];
      for(let e=0;e<4;e++){
        const phase=e*Math.PI/2;
        ctx.beginPath();
        for(let k=0;k<=60;k++){
          const a=(k/60)*Math.PI*2;
          const er=1+0.14*Math.cos(a*5+phase+t*0.5);
          const px=Math.cos(a)*RX*er;
          const py=Math.sin(a)*RY*er;
          k===0?ctx.moveTo(px,py):ctx.lineTo(px,py);
        }
        ctx.strokeStyle=embColors[e];
        ctx.lineWidth=1.2;
        ctx.stroke();
      }

      // Velvet pile — short normals on outer surface
      for(let i=0;i<36;i++){
        const a=(i/36)*Math.PI*2;
        const nx=Math.cos(a),ny=Math.sin(a)*(RY/RX);
        const mag=Math.sqrt(nx*nx+ny*ny);
        const px=Math.cos(a)*RX, py=Math.sin(a)*RY;
        const pileLen=4+Math.sin(t*2+i)*1.5;
        ctx.beginPath();
        ctx.moveTo(px,py);
        ctx.lineTo(px+nx/mag*pileLen,py+ny/mag*pileLen);
        ctx.strokeStyle=`rgba(140,80,220,${0.35+Math.sin(t+i*0.3)*0.15})`;
        ctx.lineWidth=1;
        ctx.stroke();
      }

      // Lace network — connect nearby surface points
      for(let i=0;i<lacePts.length;i++){
        for(let j=i+1;j<lacePts.length;j++){
          const pi=lacePts[i],pj=lacePts[j];
          const dx=pi.ox-pj.ox,dy=pi.oy-pj.oy;
          const dist=Math.sqrt(dx*dx+dy*dy);
          if(dist>70||dist<18) continue;
          ctx.beginPath();
          // Lace thread with midpoint bow
          const mx=(pi.ox+pj.ox)/2,my=(pi.oy+pj.oy)/2;
          const bow=4*Math.sin(t*0.8+i*0.5);
          ctx.moveTo(pi.ox,pi.oy);
          ctx.quadraticCurveTo(mx+bow,my+bow,pj.ox,pj.oy);
          ctx.strokeStyle=`rgba(200,220,255,${0.15*(1-dist/70)})`;
          ctx.lineWidth=0.7;
          ctx.stroke();
        }
      }

      // Lace nodes
      for(const p of lacePts){
        ctx.beginPath();
        ctx.arc(p.ox,p.oy,1.5,0,Math.PI*2);
        ctx.fillStyle="rgba(200,220,255,0.4)";
        ctx.fill();
      }

      // Bioluminescent interior glow
      if(isFinite(0)){
        const bg2=ctx.createRadialGradient(0,0,0,0,0,RX*0.6);
        bg2.addColorStop(0,"rgba(0,255,178,0.12)");
        bg2.addColorStop(0.5,"rgba(68,136,255,0.06)");
        bg2.addColorStop(1,"transparent");
        ctx.beginPath();
        ctx.ellipse(0,0,RX*0.7,RY*0.7,0,0,Math.PI*2);
        ctx.fillStyle=bg2;
        ctx.fill();
      }

      // Spinning drive rings (propulsion mechanism)
      for(let r=1;r<=3;r++){
        ctx.beginPath();
        ctx.ellipse(0,0,RX*0.28*r,RY*0.28*r,spin*(4-r),0,Math.PI*2);
        ctx.strokeStyle=`rgba(0,255,178,${0.25-r*0.05})`;
        ctx.lineWidth=0.8;
        ctx.setLineDash([4,4]);
        ctx.stroke();
        ctx.setLineDash([]);
      }

      // Message light nodes (bioluminescence)
      for(let i=0;i<5;i++){
        const ma=(i/5)*Math.PI*2+t*2;
        const ml=RX*0.65;
        const mx2=Math.cos(ma)*ml, my2=Math.sin(ma)*(RY/RX)*ml;
        const pulse=Math.sin(t*4+i*1.2)*0.5+0.5;
        ctx.beginPath();
        ctx.arc(mx2,my2,2.5+pulse*1.5,0,Math.PI*2);
        const lc=["rgba(0,255,178,","rgba(255,102,153,","rgba(153,102,255,","rgba(255,153,51,","rgba(68,136,255,"][i];
        ctx.fillStyle=`${lc}${0.6+pulse*0.4})`;
        ctx.fill();
        if(isFinite(mx2)&&isFinite(my2)){
          const lg=ctx.createRadialGradient(mx2,my2,0,mx2,my2,10);
          lg.addColorStop(0,`${lc}0.3)`);
          lg.addColorStop(1,"transparent");
          ctx.beginPath();
          ctx.arc(mx2,my2,10,0,Math.PI*2);
          ctx.fillStyle=lg;
          ctx.fill();
        }
      }

      ctx.restore();

      // ── Message pulses (emanate from carriage) ──────────────────────────
      for(let i=msgPulses.length-1;i>=0;i--){
        const p=msgPulses[i];
        p.r+=1.8; p.a-=0.009;
        if(p.a<=0){msgPulses.splice(i,1);continue;}
        const col=p.col;
        ctx.beginPath();
        ctx.arc(cx,cy,p.r,0,Math.PI*2);
        ctx.strokeStyle=col+Math.round(p.a*255).toString(16).padStart(2,"0");
        ctx.lineWidth=1.2;
        ctx.stroke();
        // Morse-like dot pattern on ring
        for(let d=0;d<8;d++){
          const da=(d/8)*Math.PI*2;
          ctx.beginPath();
          ctx.arc(cx+Math.cos(da)*p.r,cy+Math.sin(da)*p.r,2,0,Math.PI*2);
          ctx.fillStyle=col+Math.round(p.a*180).toString(16).padStart(2,"0");
          ctx.fill();
        }
      }

      // ── Rising water bubbles ────────────────────────────────────────────
      for(const b of bubbles){
        b.y-=b.spd;
        b.x+=Math.sin(t*0.5+b.r)*0.3;
        if(b.y<-10) b.y=H+5;
        ctx.beginPath();
        ctx.arc(b.x,b.y,b.r,0,Math.PI*2);
        ctx.strokeStyle=`rgba(100,180,255,${b.a*0.6})`;
        ctx.lineWidth=0.7;
        ctx.stroke();
        ctx.fillStyle=`rgba(150,220,255,${b.a*0.15})`;
        ctx.fill();
      }

      // ── Depth label ─────────────────────────────────────────────────────
      ctx.fillStyle="rgba(0,255,178,0.3)";
      ctx.font=`8px ${MONO}`;
      ctx.fillText("DEPTH PRESSURE FIELD ACTIVE",8,14);
      ctx.fillStyle="rgba(184,204,232,0.25)";
      ctx.fillText(`C(x,t): ${(0.93+Math.sin(t*0.7)*0.03).toFixed(3)}`,8,26);
      ctx.fillText(`BUBBLE R: ${(120+Math.sin(t*2.8)*8).toFixed(1)} cm`,8,38);

      rafRef.current=requestAnimationFrame(tick);
    }
    rafRef.current=requestAnimationFrame(tick);
    return()=>cancelAnimationFrame(rafRef.current);
  },[]);

  return(
    <canvas ref={ref} width={540} height={360}
      style={{width:"100%",borderRadius:10,
        border:`1px solid rgba(0,255,178,0.2)`,display:"block"}}/>
  );
}

// ── Pressure fragments canvas ─────────────────────────────────────────────────
function FragmentCanvas(){
  const ref=useRef<HTMLCanvasElement>(null);
  const rafRef=useRef<number>(0);
  const tRef=useRef(0);

  useEffect(()=>{
    const canvas=ref.current;
    if(!canvas) return;
    const ctx=canvas.getContext("2d");
    if(!ctx) return;
    const W=canvas.width,H=canvas.height;

    const frags=[
      {cx:70,cy:H/2,label:"GYROID CELL",sub:"Triply periodic\nminimal surface",col:V.aurora,crush:"11,000 atm",draw:(t:number,fcx:number,fcy:number,col:string)=>{
        // Hexagonal gyroid cross section
        ctx.save(); ctx.translate(fcx,fcy);
        for(let i=0;i<6;i++){
          const a=i*Math.PI/3+t*0.1;
          ctx.beginPath();
          ctx.moveTo(0,0);
          ctx.bezierCurveTo(
            Math.cos(a)*22,Math.sin(a)*22,
            Math.cos(a+Math.PI/3)*22,Math.sin(a+Math.PI/3)*22,
            Math.cos(a+Math.PI/3)*28,Math.sin(a+Math.PI/3)*28
          );
          ctx.strokeStyle=col+"AA"; ctx.lineWidth=1.5; ctx.stroke();
        }
        ctx.beginPath(); ctx.arc(0,0,8,0,Math.PI*2);
        ctx.fillStyle=col+"33"; ctx.fill();
        ctx.strokeStyle=col; ctx.lineWidth=1; ctx.stroke();
        ctx.restore();
      }},
      {cx:190,cy:H/2,label:"NACRE SPHERE",sub:"Aragonite platelets\nconcentric layers",col:V.gold,crush:"6,500 atm",draw:(t:number,fcx:number,fcy:number,col:string)=>{
        ctx.save(); ctx.translate(fcx,fcy);
        for(let i=4;i>=1;i--){
          const r=i*7;
          ctx.beginPath(); ctx.arc(0,0,r,0,Math.PI*2);
          ctx.strokeStyle=col+Math.round(50+i*40).toString(16);
          ctx.lineWidth=2; ctx.stroke();
        }
        // Platelet lines
        for(let i=0;i<8;i++){
          const a=i*Math.PI/4+t*0.05;
          const r=22;
          ctx.beginPath();
          ctx.moveTo(Math.cos(a-0.25)*12,Math.sin(a-0.25)*12);
          ctx.lineTo(Math.cos(a)*r,Math.sin(a)*r);
          ctx.strokeStyle=col+"66"; ctx.lineWidth=1; ctx.stroke();
        }
        ctx.restore();
      }},
      {cx:310,cy:H/2,label:"TENSEGRITY",sub:"Continuous tension\ndiscontinuous compression",col:V.vio,crush:"4,200 atm",draw:(t:number,fcx:number,fcy:number,col:string)=>{
        ctx.save(); ctx.translate(fcx,fcy);
        const pts=6;
        const r=26;
        const pts2:number[][]=[];
        for(let i=0;i<pts;i++){
          const a=i*(Math.PI*2/pts)+t*0.08;
          pts2.push([Math.cos(a)*r,Math.sin(a)*r]);
        }
        // Tension cables
        for(let i=0;i<pts;i++){
          const j=(i+2)%pts;
          ctx.beginPath();
          ctx.moveTo(pts2[i][0],pts2[i][1]);
          ctx.lineTo(pts2[j][0],pts2[j][1]);
          ctx.strokeStyle=col+"66"; ctx.lineWidth=0.8; ctx.stroke();
        }
        // Compression struts
        for(let i=0;i<pts;i++){
          const j=(i+1)%pts;
          ctx.beginPath();
          ctx.moveTo(pts2[i][0]*0.5,pts2[i][1]*0.5);
          ctx.lineTo(pts2[j][0],pts2[j][1]);
          ctx.strokeStyle=col+"BB"; ctx.lineWidth=2; ctx.stroke();
        }
        for(const p of pts2){
          ctx.beginPath(); ctx.arc(p[0],p[1],3,0,Math.PI*2);
          ctx.fillStyle=col; ctx.fill();
        }
        ctx.restore();
      }},
      {cx:430,cy:H/2,label:"COHERENCE BUBBLE",sub:"C(x,t) internal field\npressure self-balance",col:V.plasma,crush:"SPECULATIVE",draw:(t:number,fcx:number,fcy:number,col:string)=>{
        ctx.save(); ctx.translate(fcx,fcy);
        const p=Math.sin(t*2.5)*0.5+0.5;
        // Pulsing field
        if(isFinite(fcx)||true){
          const g=ctx.createRadialGradient(0,0,0,0,0,28);
          g.addColorStop(0,col+"44");
          g.addColorStop(0.6,col+"18");
          g.addColorStop(1,"transparent");
          ctx.beginPath(); ctx.arc(0,0,28,0,Math.PI*2);
          ctx.fillStyle=g; ctx.fill();
        }
        // Three concentric rings
        for(let i=1;i<=3;i++){
          ctx.beginPath();
          ctx.arc(0,0,10+i*6+p*2,0,Math.PI*2);
          ctx.strokeStyle=col+Math.round(60+i*50).toString(16);
          ctx.lineWidth=1; ctx.stroke();
        }
        // Field arrows (inward pressure being deflected)
        for(let i=0;i<8;i++){
          const a=i*Math.PI/4;
          const ox=Math.cos(a)*36,oy=Math.sin(a)*36;
          ctx.beginPath();
          ctx.moveTo(ox,oy);
          ctx.lineTo(Math.cos(a)*28,Math.sin(a)*28);
          ctx.strokeStyle=col+"77"; ctx.lineWidth=1; ctx.stroke();
        }
        ctx.restore();
      }},
    ];

    function tick(){
      tRef.current+=0.018;
      const t=tRef.current;
      ctx.fillStyle=DEEP;
      ctx.fillRect(0,0,W,H);

      // Depth pressure animation (bars crushing from top)
      const pressH=20+Math.sin(t*0.5)*4;
      const pressg=ctx.createLinearGradient(0,0,0,pressH);
      pressg.addColorStop(0,"rgba(0,100,200,0.3)");
      pressg.addColorStop(1,"transparent");
      ctx.fillStyle=pressg;
      ctx.fillRect(0,0,W,pressH);

      ctx.fillStyle="rgba(68,136,255,0.3)";
      ctx.font=`7px ${MONO}`;
      ctx.textAlign="center";
      ctx.fillText("DEEP EARTH / OCEAN PRESSURE",W/2,13);
      ctx.textAlign="left";

      for(const f of frags){
        // Pressure indicator (bar squeezing from above)
        const sqz=Math.sin(t*0.7+frags.indexOf(f))*3;
        ctx.fillStyle=f.col+"11";
        ctx.fillRect(f.cx-40,30+sqz,80,H-70-sqz*2);
        ctx.strokeStyle=f.col+"33";
        ctx.lineWidth=1;
        ctx.strokeRect(f.cx-40,30+sqz,80,H-70-sqz*2);

        f.draw(t,f.cx,f.cy,f.col);

        // Labels
        ctx.fillStyle=f.col;
        ctx.font=`7px ${MONO}`;
        ctx.textAlign="center";
        ctx.fillText(f.label,f.cx,H-52);
        ctx.fillStyle="rgba(184,204,232,0.5)";
        ctx.font=`7px ${MONO}`;
        const lines=f.sub.split("\n");
        lines.forEach((l,i)=>ctx.fillText(l,f.cx,H-40+i*9));
        ctx.fillStyle=f.col+"CC";
        ctx.font=`8px ${MONO}`;
        ctx.fillText(f.crush,f.cx,H-14);
        ctx.textAlign="left";
      }

      rafRef.current=requestAnimationFrame(tick);
    }
    rafRef.current=requestAnimationFrame(tick);
    return()=>cancelAnimationFrame(rafRef.current);
  },[]);

  return(
    <canvas ref={ref} width={500} height={240}
      style={{width:"100%",borderRadius:8,
        border:"1px solid rgba(0,255,178,0.14)",display:"block"}}/>
  );
}

// ── Message architecture canvas ───────────────────────────────────────────────
function MessageCanvas(){
  const ref=useRef<HTMLCanvasElement>(null);
  const rafRef=useRef<number>(0);
  const tRef=useRef(0);

  useEffect(()=>{
    const canvas=ref.current;
    if(!canvas) return;
    const ctx=canvas.getContext("2d");
    if(!ctx) return;
    const W=canvas.width,H=canvas.height;

    // Mock morse-like sequence for "AETHER"
    const code=[1,0,1,1,0,1,0,1,0,0,1,1,0,1,1,0,0,1,0,1,1,1,0,1];
    let codeIdx=0;
    let codeTimer=0;
    const pulses:MsgPulse[]=[];
    const nodes=[
      {x:80,y:H/2,label:"CARRIAGE A",col:V.aurora},
      {x:W/2,y:H/2-30,label:"RELAY",col:V.vio},
      {x:W-80,y:H/2,label:"CARRIAGE B",col:V.gold},
    ];

    function tick(){
      tRef.current+=0.016;
      const t=tRef.current;

      ctx.fillStyle=DEEP;
      ctx.fillRect(0,0,W,H);

      // Underwater medium (subtle)
      for(let i=0;i<4;i++){
        const lx=W/4+(i*W/4);
        if(isFinite(lx)){
          const g=ctx.createRadialGradient(lx,H*0.7,0,lx,H*0.7,60);
          g.addColorStop(0,"rgba(0,100,200,0.04)");
          g.addColorStop(1,"transparent");
          ctx.fillStyle=g;
          ctx.beginPath(); ctx.arc(lx,H*0.7,60,0,Math.PI*2);
          ctx.fill();
        }
      }

      // Connection lines (acoustic channel)
      for(let i=0;i<nodes.length-1;i++){
        ctx.beginPath();
        ctx.moveTo(nodes[i].x,nodes[i].y);
        ctx.lineTo(nodes[i+1].x,nodes[i+1].y);
        ctx.strokeStyle="rgba(0,255,178,0.08)";
        ctx.lineWidth=1;
        ctx.setLineDash([4,8]);
        ctx.stroke();
        ctx.setLineDash([]);
      }

      // Emit code pulse periodically
      codeTimer++;
      if(codeTimer%30===0){
        const bit=code[codeIdx%code.length];
        codeIdx++;
        if(bit===1){
          pulses.push({r:12,a:0.9,col:V.aurora});
        }
      }

      // Update + draw pulses travelling node to node
      for(let i=pulses.length-1;i>=0;i--){
        const p=pulses[i];
        p.r+=2.2; p.a-=0.014;
        if(p.a<=0){pulses.splice(i,1);continue;}
        // Draw at sending node (carriage A)
        ctx.beginPath();
        ctx.arc(nodes[0].x,nodes[0].y,p.r,0,Math.PI*2);
        ctx.strokeStyle=p.col+Math.round(p.a*255).toString(16).padStart(2,"0");
        ctx.lineWidth=1.5; ctx.stroke();
      }

      // Draw nodes (carriages)
      for(const n of nodes){
        // Glow
        if(isFinite(n.x)){
          const g=ctx.createRadialGradient(n.x,n.y,0,n.x,n.y,30);
          g.addColorStop(0,n.col+"33");
          g.addColorStop(1,"transparent");
          ctx.beginPath(); ctx.arc(n.x,n.y,30,0,Math.PI*2);
          ctx.fillStyle=g; ctx.fill();
        }
        // Body
        ctx.beginPath(); ctx.ellipse(n.x,n.y,22,14,0,0,Math.PI*2);
        ctx.fillStyle=n.col+"18"; ctx.fill();
        ctx.strokeStyle=n.col+"88"; ctx.lineWidth=1.5; ctx.stroke();
        // Lace pattern
        for(let i=0;i<6;i++){
          const a=(i/6)*Math.PI*2+t*0.4;
          ctx.beginPath();
          ctx.moveTo(n.x,n.y);
          ctx.lineTo(n.x+Math.cos(a)*18,n.y+Math.sin(a)*11);
          ctx.strokeStyle=n.col+"30"; ctx.lineWidth=0.8; ctx.stroke();
        }
        // Label
        ctx.fillStyle=n.col+"CC";
        ctx.font=`7px ${MONO}`;
        ctx.textAlign="center";
        ctx.fillText(n.label,n.x,n.y+28);
        ctx.textAlign="left";
      }

      // Code display
      const startX=60;
      for(let i=0;i<code.length;i++){
        const bit=code[i];
        const x=startX+i*16,y=H-20;
        ctx.beginPath();
        if(bit===1){
          ctx.rect(x,y-8,10,10);
          ctx.fillStyle=i<codeIdx%code.length?V.aurora+"BB":V.aurora+"33";
        } else {
          ctx.arc(x+5,y-3,3,0,Math.PI*2);
          ctx.fillStyle=i<codeIdx%code.length?V.vio+"BB":V.vio+"33";
        }
        ctx.fill();
      }
      ctx.fillStyle="rgba(184,204,232,0.3)";
      ctx.font=`7px ${MONO}`;
      ctx.fillText("ACOUSTIC MESSAGE ENCODING -- AETHER BIOLUMINESCENT PROTOCOL",8,H-30);

      rafRef.current=requestAnimationFrame(tick);
    }
    rafRef.current=requestAnimationFrame(tick);
    return()=>cancelAnimationFrame(rafRef.current);
  },[]);

  return(
    <canvas ref={ref} width={480} height={180}
      style={{width:"100%",borderRadius:8,
        border:"1px solid rgba(153,102,255,0.18)",display:"block"}}/>
  );
}

// ── Textile structure table ───────────────────────────────────────────────────
const TEXTILES=[
  {name:"Silk",col:V.gold,
    surface:"Sericin protein triple helix, beta-sheet crystallites, 12-15% crystallinity",
    aether:"Carriage outer membrane: graded elastic modulus (stiff at 0.3% strain, yielding at 40% -- never brittle). DSSC gold nanoparticles embed in beta-sheet layers for plasmonic solar collection. Iridescent sheen from thin-film interference (film thickness 100-200nm).",
    underwater:"Silk fibroin is hydrophobic at surface, hydrophilic inside -- creates water-repelling outer layer that reduces drag. Pressure-stable to ~2000 atm before crystalline collapse."},
  {name:"Velvet",col:V.vio,
    surface:"Cut pile, 600-1200 g/m2, pile height 2-5mm, backing weave below",
    aether:"Acoustic damping layer: each pile fiber is a tuned mass damper at its own frequency. Combined effect absorbs broadband underwater noise. Pile fibers also act as tactile sensors -- pressure differential across pile detects external flow field, feeding C(x,t) calculation.",
    underwater:"Dense pile traps microbubble layer at surface -- reduces frictional drag by 15-25%. Acts as hydrodynamic boundary layer control (biomimetic shark skin effect at macro scale)."},
  {name:"Lace",col:V.aurora,
    surface:"Open-cell knotted network, 20-40% open area, stress-distributing node geometry",
    aether:"AETHER structural analog of gyroid lattice (P3): open-cell geometry transmits pressure equally in all directions while allowing flow-through. Lace surface IS the blast bubble boundary -- the open cells are tuned resonators that amplify the standing acoustic field.",
    underwater:"Open-cell geometry allows water permeation, creating controlled pressure zones inside the bubble boundary. Lace nodes act as vortex generators -- shed small vortices that reduce pressure drag."},
  {name:"Embroidery",col:V.rose,
    surface:"Stitched parametric curves, multi-thread density, localised pattern on substrate",
    aether:"Communication layer: embroidery threads are conductive fibers (silver-coated). The stitched patterns are antenna geometries tuned to specific acoustic frequencies. Different embroidery patterns encode different message types (location, depth, speed). The stitched loop patterns are the AETHER messages written onto the carriage body.",
    underwater:"Acoustic antenna: stitched loop geometries resonate at specific frequencies matching the blast bubble standing wave modes. Tuned loops emit coherent acoustic signals through water -- the carriage broadcasts as it moves."},
];

// ── Main page ─────────────────────────────────────────────────────────────────
export default function BlastBubbleCarriage(){
  const [openTextile,setOpenTextile]=useState<number|null>(null);
  const [openFrag,setOpenFrag]=useState<number|null>(null);

  const frags=[
    {name:"Gyroid Cell Fragment",col:V.aurora,
      crush:"~11,000 atm (theoretical)",
      why:"Triply periodic minimal surface -- equal curvature in all directions means no preferred collapse axis. Pressure distributes into surface tension uniformly. Cannot be 'aimed' to crush."},
    {name:"Nacre-Layered Sphere",col:V.gold,
      crush:"~6,500 atm (tested in abalone analog)",
      why:"Aragonite platelets staggered like brick-and-mortar. Any crack must navigate 3000+ platelet boundaries, each requiring 10x more energy than propagating through a uniform material. 3000x tougher than chalk (same composition)."},
    {name:"Tensegrity Icosahedron",col:V.vio,
      crush:"~4,200 atm (model-dependent)",
      why:"Compression members float in a continuous tension network. External pressure increases the pre-tension rather than collapsing structure. Load path goes to all struts simultaneously -- no single failure initiates cascade."},
    {name:"Bouligand Fiber Cylinder",col:V.amb,
      crush:"~8,000 atm (helicoidal aramid fiber)",
      why:"Each fiber layer rotated by fixed angle. Hoop stress from any direction is redistributed to the next rotated layer. Equivalent to having a structure with infinite rotational symmetry under pressure load."},
    {name:"Coherence Bubble Field",col:V.plasma,
      crush:"SPECULATIVE -- C(x,t) > 0.95 required",
      why:"If the coherence field hypothesis holds: high C(x,t) inside the fragment creates a self-referencing pressure equilibrium. External pressure increases E(t), which decreases C(x,t), which emits a corrective field. Pressure is converted to signal, not deformation."},
  ];

  return(
    <div style={{minHeight:"100vh",background:V.bg,
      padding:"48px 24px 100px",maxWidth:900,margin:"0 auto"}}>

      {/* Header */}
      <div style={{marginBottom:44}}>
        <div style={{fontFamily:MONO,fontSize:8,color:V.aurora+"88",
          letterSpacing:"0.25em",marginBottom:10}}>
          AETHER TRANSPORT SYNTHESIS -- UNDERWATER PRESSURE VARIANT
        </div>
        <h1 style={{margin:"0 0 10px",fontFamily:DISP,
          fontSize:"clamp(1.3rem,4vw,2rem)",fontWeight:400,
          color:V.aurora,letterSpacing:"0.15em",lineHeight:1.2}}>
          BLAST BUBBLE CARRIAGE
        </h1>
        <div style={{fontFamily:SERIF,fontSize:"1.05rem",
          color:"rgba(184,204,232,0.75)",letterSpacing:"0.04em",marginBottom:18}}>
          Silk -- Velvet -- Lace -- Embroidery -- Pressure-Resistant Fragments --
          Acoustic Blast Bubble -- Bioluminescent Message Architecture
        </div>
        <div style={{display:"flex",flexWrap:"wrap" as const,gap:5,marginBottom:20}}>
          <Chip col={V.aurora}>Blast Bubble Propulsion</Chip>
          <Chip col={V.gold}>Silk Iridescent Shell</Chip>
          <Chip col={V.vio}>Velvet Acoustic Skin</Chip>
          <Chip col={V.rose}>Lace Pressure Network</Chip>
          <Chip col={V.plasma}>Embroidery Antenna</Chip>
          <Chip col={V.blue}>Message Architecture</Chip>
        </div>
        <div style={{height:1,background:`linear-gradient(90deg,${V.aurora}44,transparent)`}}/>
      </div>

      {/* Main simulation */}
      <div style={{marginBottom:44}}>
        <SectionHead n="I" title="BLAST BUBBLE CARRIAGE -- LIVE SIMULATION" col={V.aurora}/>
        <BubbleCarriageCanvas/>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:10,marginTop:12}}>
          {[
            {label:"Blast bubble",col:V.aurora,desc:"Standing acoustic pressure wave holds a stable pressure-neutral zone around the carriage. External ocean pressure cannot penetrate the coherent field boundary."},
            {label:"Spinning acceleration",col:V.vio,desc:"Gyroscopic spin creates lateral pressure differential (Magnus effect). Controlled spin rate adjusts trajectory and depth. Vortex rings are the exhaust of the spin engine."},
            {label:"Bioluminescent signals",col:V.rose,desc:"Five colour-coded light nodes orbit inside the carriage. Pulsing patterns encode position, depth, speed, and messages. The bubble wall acts as a signal lens."},
          ].map(c=>(
            <div key={c.label} style={{padding:"12px 14px",borderRadius:6,
              background:`${c.col}08`,border:`1px solid ${c.col}28`}}>
              <div style={{fontFamily:MONO,fontSize:8,color:c.col,
                letterSpacing:"0.12em",marginBottom:6}}>{c.label.toUpperCase()}</div>
              <div style={{fontFamily:SERIF,fontSize:"0.82rem",
                color:"rgba(184,204,232,0.65)",lineHeight:1.5}}>{c.desc}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Pressure fragments */}
      <div style={{marginBottom:44}}>
        <SectionHead n="II" title="AETHER FRAGMENTS -- UNCRUSHABLE UNDER PRESSURE" col={V.green}/>
        <FragmentCanvas/>
        <div style={{marginTop:14,display:"flex",flexDirection:"column" as const,gap:6}}>
          {frags.map((f,i)=>{
            const open=openFrag===i;
            return(
              <div key={f.name} onClick={()=>setOpenFrag(open?null:i)}
                style={{padding:"11px 16px",borderRadius:6,cursor:"pointer",
                  transition:"all 0.22s",
                  background:open?`${f.col}0C`:`${f.col}05`,
                  border:`1px solid ${open?f.col:f.col+"33"}`}}>
                <div style={{display:"grid",gridTemplateColumns:"1fr auto",gap:12}}>
                  <div style={{fontFamily:MONO,fontSize:8,color:f.col,letterSpacing:"0.1em"}}>{f.name}</div>
                  <div style={{fontFamily:MONO,fontSize:8,color:f.col+"AA"}}>{f.crush}</div>
                </div>
                {open&&<div style={{marginTop:10,fontFamily:SERIF,fontSize:"0.86rem",
                  color:"rgba(184,204,232,0.72)",lineHeight:1.7}}>{f.why}</div>}
              </div>
            );
          })}
        </div>
      </div>

      {/* Textile geometry */}
      <div style={{marginBottom:44}}>
        <SectionHead n="III" title="TEXTILE GEOMETRY -- SURFACE TO STRUCTURE" col={V.rose}/>
        <div style={{display:"flex",flexDirection:"column" as const,gap:8}}>
          {TEXTILES.map((tx,i)=>{
            const open=openTextile===i;
            return(
              <div key={tx.name} onClick={()=>setOpenTextile(open?null:i)}
                style={{borderRadius:8,overflow:"hidden",cursor:"pointer",
                  border:`1px solid ${open?tx.col:tx.col+"33"}`,
                  background:open?`${tx.col}0A`:`${tx.col}05`,
                  transition:"all 0.22s"}}>
                <div style={{padding:"14px 18px",display:"grid",
                  gridTemplateColumns:"80px 1fr",gap:14,alignItems:"center"}}>
                  <div style={{fontFamily:DISP,fontSize:"1.1rem",color:tx.col,
                    letterSpacing:"0.14em"}}>{tx.name}</div>
                  <div style={{fontFamily:MONO,fontSize:7,color:"rgba(184,204,232,0.5)",
                    lineHeight:1.5}}>{tx.surface}</div>
                </div>
                {open&&(
                  <div style={{padding:"0 18px 16px",
                    display:"grid",gridTemplateColumns:"1fr 1fr",gap:16}}>
                    <div>
                      <div style={{fontFamily:MONO,fontSize:7,color:tx.col,
                        letterSpacing:"0.15em",marginBottom:8}}>AETHER MECHANISM</div>
                      <div style={{fontFamily:SERIF,fontSize:"0.86rem",
                        color:"rgba(184,204,232,0.72)",lineHeight:1.7}}>{tx.aether}</div>
                    </div>
                    <div>
                      <div style={{fontFamily:MONO,fontSize:7,color:tx.col,
                        letterSpacing:"0.15em",marginBottom:8}}>UNDERWATER FUNCTION</div>
                      <div style={{fontFamily:SERIF,fontSize:"0.86rem",
                        color:"rgba(184,204,232,0.72)",lineHeight:1.7}}>{tx.underwater}</div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Message architecture */}
      <div style={{marginBottom:44}}>
        <SectionHead n="IV" title="MESSAGE ARCHITECTURE -- CARRIAGES THAT COMMUNICATE" col={V.vio}/>
        <MessageCanvas/>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12,marginTop:14}}>
          {[
            {title:"Acoustic telegraphy",col:V.vio,
              body:"The blast bubble is a tuned acoustic resonator. Modulating the bubble boundary radius at specific frequencies generates acoustic pulses that propagate through water for kilometres. The carriage is the antenna -- the bubble is the signal."},
            {title:"Bioluminescent visual",col:V.aurora,
              body:"Five light nodes inside the carriage pulse in patterns encoding: vessel ID, GPS-equivalent depth/position vector, speed, payload type. Short range (line-of-sight through the blast bubble window). High bandwidth."},
            {title:"Embroidery antenna array",col:V.rose,
              body:"Conductive silver-thread stitched loops on the carriage surface resonate at specific kHz frequencies. Each loop size = one channel. Multi-frequency simultaneous transmission across the full textile surface."},
            {title:"AETHER email framing",col:V.gold,
              body:"Each message is a structured packet: header (sender carriage ID, depth, C field), payload (content), checksum (acoustic hash). Relay carriages forward packets between sender and recipient -- a distributed underwater mesh network. No satellites. No cables. No metal."},
          ].map(c=>(
            <div key={c.title} style={{padding:"14px 16px",borderRadius:6,
              background:`${c.col}08`,border:`1px solid ${c.col}28`}}>
              <div style={{fontFamily:DISP,fontSize:"0.88rem",color:c.col,
                letterSpacing:"0.1em",marginBottom:8}}>{c.title}</div>
              <div style={{fontFamily:SERIF,fontSize:"0.86rem",
                color:"rgba(184,204,232,0.7)",lineHeight:1.7}}>{c.body}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Math */}
      <div style={{marginBottom:44}}>
        <SectionHead n="V" title="AETHER MATHEMATICS OF THE BLAST BUBBLE" col={V.blue}/>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
          {[
            {label:"Acoustic standing wave condition",
              tex:"f_n = \\dfrac{nc}{2R} \\quad n = 1,2,3\\ldots",
              col:V.aurora,
              note:"c = speed of sound in water (~1480 m/s). R = bubble radius. The blast bubble radius is tuned so f_1 matches the carriage body resonant frequency."},
            {label:"Pressure resistance -- coherence field",
              tex:"P_{\\text{resist}} = P_0 + \\alpha\\,C(x,t)^2\\,\\rho c^2",
              col:V.green,
              note:"Coherent internal field adds a pressure term proportional to C2. High coherence = pressure-neutral interior. Speculative but dimensionally consistent."},
            {label:"Textile drag reduction",
              tex:"C_D^{\\text{pile}} = C_D^0\\left(1 - \\eta_{\\text{pile}}\\,\\delta^*\\right)",
              col:V.rose,
              note:"delta* = boundary layer displacement thickness. Velvet pile traps microbubbles, effectively reducing delta* and drag coefficient by 15-25%."},
            {label:"Embroidery antenna resonance",
              tex:"\\lambda_{\\text{loop}} = 2\\pi\\,a_{\\text{stitch}}\\sqrt{\\mu_r\\,\\varepsilon_r}",
              col:V.vio,
              note:"a_stitch = loop radius of embroidery stitch. mu_r, epsilon_r = permeability/permittivity of water. Stitch size is tuned to target acoustic or EM frequency."},
          ].map(m=>(
            <div key={m.label} style={{padding:"14px",borderRadius:6,
              background:`${m.col}08`,border:`1px solid ${m.col}22`}}>
              <div style={{fontFamily:MONO,fontSize:7,color:m.col,
                letterSpacing:"0.13em",marginBottom:8}}>{m.label.toUpperCase()}</div>
              <div dangerouslySetInnerHTML={{__html:kx(m.tex,true)}}
                style={{color:m.col,marginBottom:8}}/>
              <div style={{fontFamily:SERIF,fontSize:"0.8rem",
                color:V.dim,lineHeight:1.45}}>{m.note}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Build framing */}
      <div style={{marginBottom:40}}>
        <SectionHead n="VI" title="AETHER BUILD FRAMING -- ARCHITECTURALLY SOUND" col={V.gold}/>
        <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:8,marginBottom:16}}>
          {[
            {layer:"STRUCTURAL CORE",mat:"Nacre-composite sphere + Bouligand fiber wrap",col:V.gold,
              status:"Buildable (2026 materials)"},
            {layer:"BUBBLE MEMBRANE",mat:"Lace lattice gyroid + silk fibroin film",col:V.aurora,
              status:"Buildable (biofab required)"},
            {layer:"SURFACE SKIN",mat:"Velvet acoustic damper + embroidery antenna",col:V.vio,
              status:"Buildable (e-textile)"},
            {layer:"BLAST BUBBLE",mat:"Piezoelectric driver array + resonant cavity",col:V.blue,
              status:"Buildable (existing tech)"},
            {layer:"PROPULSION",mat:"Magnus spin + vortex ring emission",col:V.green,
              status:"Buildable (hydrodynamics)"},
            {layer:"COHERENCE FIELD",mat:"NV-diamond array + ELF coupling",col:V.plasma,
              status:"SPECULATIVE"},
          ].map(b=>(
            <div key={b.layer} style={{padding:"12px",borderRadius:6,
              background:`${b.col}07`,border:`1px solid ${b.col}28`}}>
              <div style={{fontFamily:MONO,fontSize:7,color:b.col,
                letterSpacing:"0.13em",marginBottom:5}}>{b.layer}</div>
              <div style={{fontFamily:SERIF,fontSize:"0.82rem",
                color:"rgba(184,204,232,0.65)",lineHeight:1.4,marginBottom:6}}>{b.mat}</div>
              <div style={{fontFamily:MONO,fontSize:7,
                color:b.status.startsWith("SPEC")?V.plasma:V.green+"CC"}}>{b.status}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Footer */}
      <div style={{borderTop:`1px solid ${V.dim}44`,paddingTop:24,
        display:"flex",justifyContent:"space-between",flexWrap:"wrap" as const,gap:12}}>
        <div style={{fontFamily:MONO,fontSize:8,color:V.dim}}>
          AETHER KNOWLEDGE SYSTEM -- BLAST BUBBLE CARRIAGE
        </div>
        <div style={{fontFamily:MONO,fontSize:8,color:V.dim,textAlign:"right" as const}}>
          <div>Silk -- Velvet -- Lace -- Embroidery -- Pressure Geometry</div>
          <div>Acoustic Blast Bubble -- Bioluminescent Message Architecture</div>
        </div>
      </div>
    </div>
  );
}
