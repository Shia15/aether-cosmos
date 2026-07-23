import { useEffect, useRef, useState } from "react";
import katex from "katex";
import "katex/dist/katex.min.css";
const emitterCoherence = "/api/storage/public-objects/ChatGPT_Image_Jun_28,_2026,_02_14_27_PM_1782670485215.png";
const emitterSubstrate = "/api/storage/public-objects/ChatGPT_Image_Jun_28,_2026,_02_17_55_PM_1782670690599.png";
const emitterCerulean = "/api/storage/public-objects/ChatGPT_Image_Jun_28,_2026,_02_19_47_PM_1782670795970.png";
const emitterPhiOvertone = "/api/storage/public-objects/ChatGPT_Image_Jun_30,_2026,_11_10_19_AM_1782920506186.png";
const emitterCarmineIR = "/api/storage/public-objects/ChatGPT_Image_Jun_30,_2026,_11_13_30_AM_1782920506187.png";
const emitterPhantomIR = "/api/storage/public-objects/ChatGPT_Image_Jun_30,_2026,_11_33_02_AM_1782920506188.png";
const emitterCoralSWIR = "/api/storage/public-objects/f2d30afa-9b9d-4fff-bc30-52d2d2799891_1782920506190.png";
const bodyPhoton = "/api/storage/public-objects/image_(31)_1782920506189.jpg";
const V = {
  bg:"#04060E",aurora:"#00FFB2",gold:"#C8A030",blue:"#4488FF",
  vio:"#9966FF",amb:"#FF9933",rose:"#FF6699",plasma:"#FF4477",
  green:"#44CC77",dim:"#3A5060",ink:"#B8CCE8",fire:"#FF6622",
};
const MONO="'Space Mono',monospace";
const SERIF="'Crimson Pro',serif";
const DISP="'Cinzel',serif";

function kx(tex:string,dm=false){
  try{return katex.renderToString(tex,{throwOnError:false,output:"html",displayMode:dm});}
  catch{return tex;}
}

// ── Module-level types ────────────────────────────────────────────────────────
interface FloorDef {
  label:string; col:string; winCol:string; bio:boolean;
  coherence:number; material:string; field:string;
}
interface FieldParticle { x:number; y:number; vx:number; vy:number; a:number; col:string; }

// ── Floor catalogue ───────────────────────────────────────────────────────────
const FLOOR_CATALOGUE:FloorDef[]=[
  {label:"Solar Crown",col:V.gold,winCol:"#FFE080",bio:false,coherence:0.98,
    material:"Perovskite PV glass + gold nanorod antenna array",
    field:"Max irradiance capture -- E field aligned to sun vector"},
  {label:"Neural Nexus",col:V.vio,winCol:"#CC99FF",bio:false,coherence:0.95,
    material:"NV-diamond sensor array + graphene neural mesh",
    field:"Distributed sensing -- H field coherence mapping of all floors"},
  {label:"Coherence Array",col:V.aurora,winCol:"#80FFD4",bio:false,coherence:0.97,
    material:"Phononic crystal slab + piezo resonator matrix",
    field:"Standing acoustic + EM field maintenance -- C(x,t) stabiliser"},
  {label:"Living Lab",col:V.green,winCol:"#88FFAA",bio:true,coherence:0.91,
    material:"Mycelium composite + cellulose nanocrystal panel",
    field:"Bioluminescent field emission -- biogenic coherence coupling"},
  {label:"Smart Office",col:V.blue,winCol:"#88BBFF",bio:false,coherence:0.88,
    material:"Electrochromic smart glass + CNT structural panel",
    field:"Occupancy-responsive E field -- dynamic window opacity 0-100%"},
  {label:"Bio-Garden",col:"#66CC44",winCol:"#AAEE66",bio:true,coherence:0.93,
    material:"Aeroponic cavity + photobioreactor wall + soil substrate",
    field:"O2/CO2 chemotaxis field -- moisture gradient control"},
  {label:"Water Cycle",col:"#44AACC",winCol:"#44CCFF",bio:true,coherence:0.86,
    material:"Hydrogel membrane + graphene desalination layer",
    field:"Capillary pressure gradient -- humidity field 60-80% RH"},
  {label:"Mycelium Hub",col:V.amb,winCol:"#FFCC77",bio:true,coherence:0.90,
    material:"Hyphal composite + lignin binder + spore-seed concrete",
    field:"Nutrient gradient field -- chemical signalling between floors"},
];

const DEFAULT_FLOORS=[7,6,5,4,3,2,1,0]; // ground(0)=Mycelium, top(7)=Solar

// ── Building canvas ───────────────────────────────────────────────────────────
function BuildingCanvas({
  floorIndices, selectedFloor, onSelectFloor,
}:{
  floorIndices:number[]; selectedFloor:number; onSelectFloor:(i:number)=>void;
}){
  const ref=useRef<HTMLCanvasElement>(null);
  const rafRef=useRef<number>(0);
  const tRef=useRef(0);
  const floorRef=useRef(floorIndices);
  const selRef=useRef(selectedFloor);
  floorRef.current=floorIndices;
  selRef.current=selectedFloor;

  function handleClick(e:React.MouseEvent<HTMLCanvasElement>){
    const rect=ref.current!.getBoundingClientRect();
    const sx=ref.current!.width/rect.width, sy=ref.current!.height/rect.height;
    const cx=(e.clientX-rect.left)*sx, cy=(e.clientY-rect.top)*sy;
    const BX=155,BW=210,FH=36,GROUND=370;
    if(cx<BX||cx>BX+BW) return;
    const relY=GROUND-cy;
    if(relY<0||relY>FH*8) return;
    const fi=Math.floor(relY/FH);
    if(fi>=0&&fi<8) onSelectFloor(fi);
  }

  useEffect(()=>{
    const canvas=ref.current; if(!canvas) return;
    const ctx=canvas.getContext("2d"); if(!ctx) return;
    const W=canvas.width, H=canvas.height;
    const BX=155,BW=210,FH=36,GROUND=370;
    const BY=GROUND-FH*8; // top of building = 370 - 288 = 82

    let seed=77;
    const rand=()=>{ seed=(seed*16807)%2147483647; return(seed-1)/2147483646; };

    // Mycelium network underground
    const myco:{x:number;y:number;len:number;ang:number}[]=[];
    for(let i=0;i<35;i++) myco.push({
      x:BX-40+rand()*(BW+80), y:GROUND+15+rand()*65,
      len:12+rand()*45, ang:-Math.PI/2+(rand()-0.5)*Math.PI*0.9,
    });

    // Field particles (around building)
    const particles:FieldParticle[]=[];
    const pcols=[V.aurora,V.gold,V.vio,V.blue,V.green,"#44AACC"];
    for(let i=0;i<48;i++){
      const side=rand()>0.5?1:-1;
      particles.push({
        x:BX+BW/2+side*(80+rand()*120),
        y:BY+rand()*(GROUND-BY),
        vx:side*(0.08+rand()*0.25),
        vy:(rand()-0.5)*0.35,
        a:0.08+rand()*0.45,
        col:pcols[Math.floor(rand()*pcols.length)],
      });
    }

    function drawSky(t:number){
      const phase=(Math.sin(t*0.018)+1)/2;
      if(!isFinite(W)) return;
      const sky=ctx.createLinearGradient(0,0,0,GROUND);
      const b1=Math.round(2+phase*14);
      const g1=Math.round(3+phase*10);
      const r1=Math.round(1+phase*8);
      sky.addColorStop(0,`rgb(${r1},${g1},${b1+18})`);
      sky.addColorStop(1,`rgb(${r1+2},${g1+3},${b1+6})`);
      ctx.fillStyle=sky; ctx.fillRect(0,0,W,GROUND);
      ctx.fillStyle="#010810"; ctx.fillRect(0,GROUND,W,H-GROUND);
    }

    function drawFieldLines(t:number){
      const floors=floorRef.current;
      for(let s=-1;s<=1;s+=2){
        for(let i=0;i<8;i++){
          const fi=floors[i];
          const fc=FLOOR_CATALOGUE[fi];
          const startX=s<0?BX:BX+BW;
          const startY=GROUND-FH*i-FH/2;
          const arc=55+i*10;
          ctx.beginPath();
          ctx.moveTo(startX,startY);
          const cp1x=startX+s*(arc+Math.sin(t*0.35+i)*7);
          const cp1y=startY-arc*0.25;
          const cp2x=startX+s*(arc*1.3+Math.cos(t*0.28+i)*5);
          const cp2y=startY+arc*0.4;
          ctx.bezierCurveTo(cp1x,cp1y,cp2x,cp2y,startX+s*arc*0.75,startY+arc*0.15);
          const a=0.07+Math.sin(t*1.6+i*0.6)*0.04;
          ctx.strokeStyle=fc.col+Math.round(Math.abs(a)*255).toString(16).padStart(2,"0");
          ctx.lineWidth=1; ctx.stroke();
        }
      }
    }

    function drawMycelium(t:number){
      ctx.save(); ctx.beginPath();
      ctx.rect(0,GROUND,W,H-GROUND); ctx.clip();
      for(const m of myco){
        const sw=Math.sin(t*0.45+m.x*0.02)*7;
        const ex=m.x+Math.cos(m.ang)*m.len+sw;
        const ey=m.y+Math.sin(m.ang)*m.len;
        ctx.beginPath(); ctx.moveTo(m.x,m.y); ctx.lineTo(ex,ey);
        ctx.strokeStyle=`rgba(200,160,48,${0.12+Math.sin(t*0.7+m.x*0.01)*0.06})`;
        ctx.lineWidth=0.9; ctx.stroke();
        // Branch
        const mid={x:(m.x+ex)/2,y:(m.y+ey)/2};
        ctx.beginPath(); ctx.moveTo(mid.x,mid.y);
        ctx.lineTo(mid.x+Math.cos(m.ang+0.7)*m.len*0.4,mid.y+Math.sin(m.ang+0.7)*m.len*0.4);
        ctx.strokeStyle="rgba(200,160,48,0.06)"; ctx.stroke();
      }
      ctx.restore();
    }

    function drawPulseRings(t:number){
      const cx=BX+BW/2, cy=(BY+GROUND)/2;
      for(let p=0;p<4;p++){
        const phase=((t*0.45+p*0.25)%1);
        const r=70+phase*200;
        const a=0.14*(1-phase);
        ctx.beginPath(); ctx.arc(cx,cy,r,0,Math.PI*2);
        ctx.strokeStyle=`rgba(0,255,178,${a})`; ctx.lineWidth=1; ctx.stroke();
      }
    }

    function drawBuilding(t:number){
      const floors=floorRef.current;
      const sel=selRef.current;

      // Foundation slab
      ctx.fillStyle="rgba(22,36,58,0.95)";
      ctx.fillRect(BX-10,GROUND,BW+20,16);
      ctx.fillStyle="rgba(0,255,178,0.06)";
      ctx.fillRect(BX-10,GROUND,BW+20,16);

      for(let i=0;i<8;i++){
        const fi=floors[i];
        const fc=FLOOR_CATALOGUE[fi];
        const fy=GROUND-FH*(i+1);
        const isSelected=sel===i;

        // Floor body
        ctx.fillStyle=isSelected?fc.col+"1C":fc.col+"0A";
        ctx.fillRect(BX,fy,BW,FH);

        // Bio organic texture
        if(fc.bio){
          for(let b=0;b<4;b++){
            const bx=BX+18+b*46;
            const ba=0.10+Math.sin(t*0.7+b+i*0.5)*0.04;
            ctx.fillStyle=`rgba(50,140,50,${ba})`;
            ctx.fillRect(bx,fy+3,28,FH-6);
          }
        }

        // Structural columns (left/right edge)
        ctx.fillStyle="rgba(14,24,44,0.85)";
        ctx.fillRect(BX,fy,14,FH);
        ctx.fillRect(BX+BW-14,fy,14,FH);

        // Floor separator
        ctx.fillStyle=isSelected?fc.col+"44":"rgba(58,80,96,0.4)";
        ctx.fillRect(BX,fy+FH-1,BW,1);

        // Windows: 3 left + 3 right (skip columns)
        const WIN_W=22, WIN_H=20;
        const winY=fy+(FH-WIN_H)/2;
        const pulse=Math.sin(t*1.3+i*0.55)*0.5+0.5;
        const baseA=isSelected?0.72:0.42;
        const winA=baseA+pulse*0.28;
        const glowR=isSelected?14:8;

        const leftStarts=[BX+18, BX+18+28, BX+18+56];
        const rightStarts=[BX+BW-18-WIN_W-56, BX+BW-18-WIN_W-28, BX+BW-18-WIN_W];

        for(const wx of [...leftStarts,...rightStarts]){
          if(isFinite(wx+WIN_W/2)){
            const g=ctx.createRadialGradient(wx+WIN_W/2,winY+WIN_H/2,0,wx+WIN_W/2,winY+WIN_H/2,glowR);
            g.addColorStop(0,fc.winCol+Math.round(winA*210).toString(16).padStart(2,"0"));
            g.addColorStop(1,"transparent");
            ctx.fillStyle=g;
            ctx.fillRect(wx-glowR,winY-glowR,WIN_W+glowR*2,WIN_H+glowR*2);
          }
          ctx.fillStyle=fc.winCol+Math.round(winA*190).toString(16).padStart(2,"0");
          ctx.fillRect(wx,winY,WIN_W,WIN_H);
          ctx.fillStyle="rgba(0,0,0,0.25)";
          ctx.fillRect(wx+WIN_W/2-0.5,winY,1,WIN_H);
          ctx.fillRect(wx,winY+WIN_H/2-0.5,WIN_W,1);
        }

        // Floor label left gutter
        ctx.fillStyle=isSelected?fc.col+"CC":"rgba(58,80,96,0.55)";
        ctx.font=`7px ${MONO}`;
        ctx.textAlign="right";
        ctx.fillText(`F${i+1}`,BX-6,fy+FH/2+3);
        ctx.textAlign="left";
      }

      // Building outline
      ctx.beginPath(); ctx.rect(BX,BY,BW,GROUND-BY);
      ctx.strokeStyle="rgba(58,80,96,0.55)"; ctx.lineWidth=1; ctx.stroke();

      // Selected floor callout
      if(sel>=0&&sel<8){
        const fi=floors[sel], fc=FLOOR_CATALOGUE[fi];
        const fy=GROUND-FH*(sel+1);
        ctx.beginPath(); ctx.rect(BX-3,fy-1,BW+6,FH+2);
        ctx.strokeStyle=fc.col+"99"; ctx.lineWidth=1.5; ctx.stroke();
        ctx.fillStyle=fc.col;
        ctx.font=`8px ${MONO}`;
        ctx.textAlign="left";
        ctx.fillText(fc.label.toUpperCase(),BX+BW+10,fy+FH/2+3);
        ctx.textAlign="left";
      }
    }

    function drawRoof(t:number){
      const ry=BY;
      // Parapet
      ctx.fillStyle="rgba(18,30,52,0.95)";
      ctx.fillRect(BX-4,ry-22,BW+8,22);
      // Solar panel grid
      for(let px=0;px<8;px++){
        for(let py=0;py<2;py++){
          const gx=BX+6+px*24, gy=ry-20+py*9;
          const ga=0.22+Math.sin(t*0.5+px*0.35)*0.10;
          ctx.fillStyle=`rgba(200,160,48,${ga})`;
          ctx.fillRect(gx,gy,19,7);
          ctx.strokeStyle="rgba(200,160,48,0.18)";
          ctx.lineWidth=0.5; ctx.strokeRect(gx,gy,19,7);
        }
      }
      // Crown glow
      const gcx=BX+BW/2;
      if(isFinite(gcx)){
        const cg=ctx.createRadialGradient(gcx,ry-11,0,gcx,ry-11,65);
        const ca=0.16+Math.sin(t*1.1)*0.07;
        cg.addColorStop(0,`rgba(200,160,48,${ca})`);
        cg.addColorStop(1,"transparent");
        ctx.fillStyle=cg;
        ctx.beginPath(); ctx.arc(gcx,ry-11,65,0,Math.PI*2); ctx.fill();
      }
      // Antenna
      ctx.beginPath();
      ctx.moveTo(BX+BW/2,ry-22); ctx.lineTo(BX+BW/2,ry-54);
      ctx.strokeStyle=`rgba(200,160,48,${0.55+Math.sin(t*1.8)*0.25})`;
      ctx.lineWidth=2; ctx.stroke();
      ctx.beginPath(); ctx.arc(BX+BW/2,ry-54,5,0,Math.PI*2);
      ctx.fillStyle=V.gold; ctx.fill();
      // Pulse at antenna tip
      const ar=8+Math.sin(t*3)*3;
      ctx.beginPath(); ctx.arc(BX+BW/2,ry-54,ar,0,Math.PI*2);
      ctx.strokeStyle=`rgba(200,160,48,${0.4-ar/40})`;
      ctx.lineWidth=1; ctx.stroke();
    }

    function tick(){
      tRef.current+=0.015;
      const t=tRef.current;
      ctx.clearRect(0,0,W,H);
      drawSky(t);
      drawFieldLines(t);
      drawMycelium(t);
      drawPulseRings(t);
      drawBuilding(t);
      drawRoof(t);

      // Particles
      for(const p of particles){
        p.x+=p.vx; p.y+=p.vy;
        if(p.x<20||p.x>W-20) p.vx*=-1;
        if(p.y<20||p.y>GROUND-10) p.vy*=-1;
        if(p.x>BX-10&&p.x<BX+BW+10&&p.y>BY&&p.y<GROUND) p.vx*=-1;
        const da=Math.round(p.a*160+Math.sin(t*2+p.x*0.05)*40);
        ctx.beginPath(); ctx.arc(p.x,p.y,1.8,0,Math.PI*2);
        ctx.fillStyle=p.col+Math.max(0,Math.min(255,da)).toString(16).padStart(2,"0");
        ctx.fill();
      }

      // HUD
      ctx.fillStyle="rgba(0,255,178,0.22)";
      ctx.font=`7px ${MONO}`; ctx.textAlign="left";
      ctx.fillText("SOI BUILDING -- AETHER SMART FIELD",8,14);
      ctx.fillText(`C(x,t): ${(0.93+Math.sin(t*0.55)*0.04).toFixed(3)}`,8,26);
      ctx.fillText(`FIELD R: ${(215+Math.sin(t*0.7)*18).toFixed(0)} m`,8,38);
      ctx.fillStyle="rgba(184,204,232,0.18)";
      ctx.textAlign="right";
      ctx.fillText("CLICK FLOOR TO SELECT",W-8,14);
      ctx.textAlign="left";

      rafRef.current=requestAnimationFrame(tick);
    }
    rafRef.current=requestAnimationFrame(tick);
    return()=>cancelAnimationFrame(rafRef.current);
  },[]);

  return(
    <canvas ref={ref} width={520} height={470}
      onClick={handleClick}
      style={{width:"100%",borderRadius:10,display:"block",cursor:"pointer",
        border:"1px solid rgba(0,255,178,0.16)"}}/>
  );
}

// ── Per-floor coherence field canvas ─────────────────────────────────────────
function CoherenceFieldCanvas({fd}:{fd:FloorDef}){
  const ref=useRef<HTMLCanvasElement>(null);
  const rafRef=useRef<number>(0);
  const tRef=useRef(0);
  const fdRef=useRef(fd); fdRef.current=fd;

  useEffect(()=>{
    const canvas=ref.current; if(!canvas) return;
    const ctx=canvas.getContext("2d"); if(!ctx) return;
    const W=canvas.width, H=canvas.height;
    const CX=W/2, CY=H/2;

    function tick(){
      tRef.current+=0.018;
      const t=tRef.current;
      const f=fdRef.current;
      ctx.fillStyle="#010810"; ctx.fillRect(0,0,W,H);

      // Field dots
      for(let i=0;i<16;i++){
        const ang=(i/16)*Math.PI*2+t*0.07;
        for(let r=18;r<CX-8;r+=9){
          const px=CX+Math.cos(ang)*r, py=CY+Math.sin(ang)*r;
          const fa=(0.06+0.14*f.coherence)*Math.sin(t*2.1+r*0.09+i*0.4);
          if(fa<=0) continue;
          ctx.beginPath(); ctx.arc(px,py,1.3,0,Math.PI*2);
          ctx.fillStyle=f.col+Math.round(Math.abs(fa)*255).toString(16).padStart(2,"0");
          ctx.fill();
        }
      }

      // Central glow
      if(isFinite(CX)){
        const g=ctx.createRadialGradient(CX,CY,0,CX,CY,30);
        g.addColorStop(0,f.col+"77"); g.addColorStop(1,"transparent");
        ctx.fillStyle=g; ctx.beginPath(); ctx.arc(CX,CY,30,0,Math.PI*2); ctx.fill();
      }

      // Pulsing core
      const pr=9+Math.sin(t*2.4)*3;
      ctx.beginPath(); ctx.arc(CX,CY,pr,0,Math.PI*2);
      ctx.fillStyle=f.winCol+"CC"; ctx.fill();

      // Concentric rings
      for(let k=1;k<=4;k++){
        const rk=18+k*16+Math.sin(t*1.4+k)*4;
        ctx.beginPath(); ctx.arc(CX,CY,rk,0,Math.PI*2);
        ctx.strokeStyle=f.col+Math.round(25+k*22).toString(16);
        ctx.lineWidth=1; ctx.stroke();
      }

      ctx.fillStyle=f.col+"CC";
      ctx.font=`9px ${MONO}`; ctx.textAlign="center";
      ctx.fillText(`C = ${f.coherence.toFixed(2)}`,CX,H-14);
      ctx.textAlign="left";
      rafRef.current=requestAnimationFrame(tick);
    }
    rafRef.current=requestAnimationFrame(tick);
    return()=>cancelAnimationFrame(rafRef.current);
  },[]);

  return(
    <canvas ref={ref} width={180} height={180}
      style={{width:"100%",borderRadius:8,display:"block",
        border:`1px solid ${fd.col}28`}}/>
  );
}

// ── UI helpers ────────────────────────────────────────────────────────────────
function SectionHead({n,title,col}:{n:string;title:string;col:string}){
  return(
    <div style={{display:"flex",alignItems:"baseline",gap:14,marginBottom:20}}>
      <span style={{fontFamily:MONO,fontSize:9,color:col,letterSpacing:"0.2em"}}>{n}</span>
      <h2 style={{margin:0,fontFamily:DISP,fontSize:"1.05rem",fontWeight:400,
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

// ── Main page ─────────────────────────────────────────────────────────────────
export default function SoiBuilding(){
  const [floorAssign,setFloorAssign]=useState<number[]>([...DEFAULT_FLOORS]);
  const [selectedFloor,setSelectedFloor]=useState(0);
  const [pickingFor,setPickingFor]=useState<number|null>(null);
  const [ww,setWw]=useState(()=>window.innerWidth);

  useEffect(()=>{
    const h=()=>setWw(window.innerWidth);
    window.addEventListener("resize",h);
    return()=>window.removeEventListener("resize",h);
  },[]);

  const selFloorDef=FLOOR_CATALOGUE[floorAssign[selectedFloor]];
  const totalC=(floorAssign.reduce((s,fi)=>s+FLOOR_CATALOGUE[fi].coherence,0)/8).toFixed(3);
  const bioCount=floorAssign.filter(fi=>FLOOR_CATALOGUE[fi].bio).length;

  function assignFloor(floorIdx:number,catIdx:number){
    const next=[...floorAssign]; next[floorIdx]=catIdx; setFloorAssign(next);
    setPickingFor(null);
  }

  return(
    <div style={{minHeight:"100vh",background:V.bg,
      padding:"48px 24px 100px",maxWidth:920,margin:"0 auto"}}>

      {/* Header */}
      <div style={{marginBottom:36}}>
        <div style={{fontFamily:MONO,fontSize:8,color:V.aurora+"88",
          letterSpacing:"0.25em",marginBottom:10}}>
          AETHER -- SUBSTRATE-ORGANISED INTELLIGENCE BUILDING
        </div>
        <h1 style={{margin:"0 0 8px",fontFamily:DISP,
          fontSize:"clamp(1.2rem,4vw,1.9rem)",fontWeight:400,
          color:V.aurora,letterSpacing:"0.15em",lineHeight:1.2}}>
          SOI BUILDING
        </h1>
        <div style={{fontFamily:SERIF,fontSize:"1.05rem",
          color:"rgba(184,204,232,0.75)",marginBottom:14}}>
          Living Architecture -- Bio-Structural Intelligence -- Smart Field --
          8-Floor Pulsing Coherence System
        </div>
        <div style={{display:"flex",flexWrap:"wrap" as const,gap:5,marginBottom:18}}>
          <Chip col={V.aurora}>Pulsing Smart Windows</Chip>
          <Chip col={V.gold}>Solar Crown Array</Chip>
          <Chip col={V.green}>Living Walls</Chip>
          <Chip col={V.vio}>Neural Sensor Mesh</Chip>
          <Chip col={V.amb}>Mycelium Foundation</Chip>
          <Chip col={V.blue}>Electrochromic Glass</Chip>
          <Chip col={V.plasma}>SOI Coherence Field</Chip>
        </div>
        {/* Stats row */}
        <div style={{display:"flex",gap:12,flexWrap:"wrap" as const,marginBottom:18}}>
          {[
            {label:"Building Coherence",val:totalC,col:V.aurora},
            {label:"Bio Floors",val:`${bioCount} / 8`,col:V.green},
            {label:"Smart Windows",val:"48",col:V.blue},
            {label:"Field Radius",val:"~220 m",col:V.vio},
          ].map(s=>(
            <div key={s.label} style={{padding:"8px 14px",borderRadius:5,
              background:`${s.col}0C`,border:`1px solid ${s.col}30`}}>
              <div style={{fontFamily:MONO,fontSize:7,color:s.col,
                letterSpacing:"0.14em",marginBottom:3}}>{s.label.toUpperCase()}</div>
              <div style={{fontFamily:MONO,fontSize:"0.95rem",color:s.col}}>{s.val}</div>
            </div>
          ))}
        </div>
        <div style={{height:1,background:`linear-gradient(90deg,${V.aurora}44,transparent)`}}/>
      </div>

      {/* I — Live simulation */}
      <div style={{marginBottom:40}}>
        <SectionHead n="I" title="LIVE SOI BUILDING -- SMART FIELD ACTIVE" col={V.aurora}/>
        <BuildingCanvas
          floorIndices={floorAssign}
          selectedFloor={selectedFloor}
          onSelectFloor={setSelectedFloor}
        />
        <div style={{display:"grid",gridTemplateColumns:ww<600?"1fr":"1fr 1fr 1fr",gap:10,marginTop:12}}>
          {[
            {label:"Smart windows",col:V.blue,
              body:"Each of the 48 windows is a tunable electrochromic cell. The live coherence field value drives opacity -- high C(x,t) opens the window fully to maximise photon and field coupling with the exterior environment."},
            {label:"Living walls",col:V.green,
              body:"Mycelium composite panels host bioluminescent organisms emitting light at field-coupled frequencies. The facade breathes -- oxygen out, CO2 in, moisture regulated by a hydrogel boundary layer."},
            {label:"SOI field",col:V.vio,
              body:"The building emits a coherent EM + acoustic field extending ~220m radius. Each floor contributes its own frequency band. Together they form a standing wave envelope -- the Substrate-Organised Intelligence field."},
          ].map(c=>(
            <div key={c.label} style={{padding:"12px 14px",borderRadius:6,
              background:`${c.col}08`,border:`1px solid ${c.col}28`}}>
              <div style={{fontFamily:MONO,fontSize:8,color:c.col,
                letterSpacing:"0.12em",marginBottom:6}}>{c.label.toUpperCase()}</div>
              <div style={{fontFamily:SERIF,fontSize:"0.82rem",
                color:"rgba(184,204,232,0.65)",lineHeight:1.5}}>{c.body}</div>
            </div>
          ))}
        </div>
      </div>

      {/* II — Floor design mechanism */}
      <div style={{marginBottom:40}}>
        <SectionHead n="II" title="FLOOR DESIGN MECHANISM -- CONFIGURE EACH LEVEL" col={V.gold}/>

        <div style={{display:"grid",gridTemplateColumns:ww<600?"1fr":"1fr 210px",gap:20,alignItems:"start"}}>
          {/* Floor list (rendered top→bottom for intuition) */}
          <div>
            <div style={{display:"grid",gridTemplateColumns:"36px 1fr 52px 36px",
              gap:"0 8px",padding:"5px 10px",marginBottom:4,
              fontFamily:MONO,fontSize:7,color:V.dim,letterSpacing:"0.14em"}}>
              <span>FL</span><span>TYPE</span><span>C(x,t)</span><span>BIO</span>
            </div>

            {[7,6,5,4,3,2,1,0].map(fi=>{
              const catIdx=floorAssign[fi];
              const fc=FLOOR_CATALOGUE[catIdx];
              const isSel=selectedFloor===fi;
              return(
                <div key={fi}>
                  <div onClick={()=>{ setSelectedFloor(fi); setPickingFor(null); }}
                    style={{display:"grid",gridTemplateColumns:"36px 1fr 52px 36px",
                      gap:"0 8px",padding:"8px 10px",borderRadius:5,marginBottom:3,
                      cursor:"pointer",transition:"all 0.18s",
                      background:isSel?`${fc.col}14`:`${fc.col}05`,
                      border:`1px solid ${isSel?fc.col:fc.col+"25"}`}}>
                    <span style={{fontFamily:MONO,fontSize:8,color:fc.col}}>F{fi+1}</span>
                    <span style={{fontFamily:MONO,fontSize:8,
                      color:isSel?fc.col:V.ink,letterSpacing:"0.07em"}}>{fc.label}</span>
                    <span style={{fontFamily:MONO,fontSize:8,color:fc.col+"AA"}}>
                      {fc.coherence.toFixed(2)}
                    </span>
                    <span style={{fontFamily:MONO,fontSize:8,
                      color:fc.bio?V.green:V.dim}}>
                      {fc.bio?"BIO":"---"}
                    </span>
                  </div>

                  {/* Inline type picker */}
                  {isSel&&pickingFor===fi&&(
                    <div style={{padding:"10px",marginBottom:4,borderRadius:5,
                      background:"rgba(4,6,18,0.95)",
                      border:`1px solid ${V.gold}33`}}>
                      <div style={{fontFamily:MONO,fontSize:7,color:V.gold,
                        letterSpacing:"0.14em",marginBottom:7}}>SELECT FLOOR TYPE</div>
                      <div style={{display:"flex",flexDirection:"column" as const,gap:3}}>
                        {FLOOR_CATALOGUE.map((cat,ci)=>(
                          <div key={ci}
                            onClick={(e)=>{ e.stopPropagation(); assignFloor(fi,ci); }}
                            style={{padding:"5px 10px",borderRadius:3,cursor:"pointer",
                              transition:"all 0.15s",
                              background:ci===floorAssign[fi]?`${cat.col}22`:`${cat.col}08`,
                              border:`1px solid ${ci===floorAssign[fi]?cat.col:cat.col+"28"}`,
                              fontFamily:MONO,fontSize:8,color:cat.col,letterSpacing:"0.07em"}}>
                            {cat.label}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {isSel&&pickingFor!==fi&&(
                    <div style={{padding:"2px 10px 6px"}}>
                      <button
                        onClick={(e)=>{ e.stopPropagation(); setPickingFor(fi); }}
                        style={{fontFamily:MONO,fontSize:7,color:V.gold,cursor:"pointer",
                          background:"transparent",border:`1px solid ${V.gold}44`,
                          borderRadius:3,padding:"3px 12px",letterSpacing:"0.14em"}}>
                        CHANGE TYPE
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Right: selected floor detail + coherence field */}
          <div style={{display:"flex",flexDirection:"column" as const,gap:10}}>
            <CoherenceFieldCanvas fd={selFloorDef}/>
            <div style={{padding:"12px",borderRadius:6,
              background:`${selFloorDef.col}08`,
              border:`1px solid ${selFloorDef.col}28`}}>
              <div style={{fontFamily:DISP,fontSize:"0.88rem",
                color:selFloorDef.col,letterSpacing:"0.12em",marginBottom:8}}>
                F{selectedFloor+1} -- {selFloorDef.label}
              </div>
              <div style={{fontFamily:MONO,fontSize:7,color:V.dim,
                letterSpacing:"0.1em",marginBottom:4}}>MATERIAL</div>
              <div style={{fontFamily:SERIF,fontSize:"0.8rem",
                color:"rgba(184,204,232,0.65)",lineHeight:1.5,marginBottom:10}}>
                {selFloorDef.material}
              </div>
              <div style={{fontFamily:MONO,fontSize:7,color:V.dim,
                letterSpacing:"0.1em",marginBottom:4}}>SMART FIELD</div>
              <div style={{fontFamily:SERIF,fontSize:"0.8rem",
                color:"rgba(184,204,232,0.65)",lineHeight:1.5,marginBottom:10}}>
                {selFloorDef.field}
              </div>
              {/* Coherence bar */}
              <div style={{display:"flex",gap:6,alignItems:"center"}}>
                <div style={{fontFamily:MONO,fontSize:7,color:V.dim}}>C</div>
                <div style={{flex:1,height:4,borderRadius:2,
                  background:"rgba(58,80,96,0.3)"}}>
                  <div style={{height:"100%",borderRadius:2,
                    background:selFloorDef.col,
                    width:`${selFloorDef.coherence*100}%`,
                    transition:"width 0.4s"}}/>
                </div>
                <div style={{fontFamily:MONO,fontSize:8,color:selFloorDef.col}}>
                  {selFloorDef.coherence.toFixed(2)}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* III — Mathematics */}
      <div style={{marginBottom:40}}>
        <SectionHead n="III" title="SOI MATHEMATICAL FRAMEWORK" col={V.blue}/>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
          {[
            {label:"Building coherence field",
              tex:"C_{\\text{bldg}}(t) = \\frac{1}{N}\\sum_{i=1}^{N} C_i(x,t)\\,e^{-\\kappa_i d_i}",
              col:V.aurora,
              note:"Floor coherence weighted by coupling constant kappa_i and distance d_i from centroid."},
            {label:"Smart window transmittance",
              tex:"\\tau_w = \\tau_{\\min} + (\\tau_{\\max}-\\tau_{\\min})\\cdot C(x,t)^2",
              col:V.blue,
              note:"Electrochromic opacity driven by local coherence squared -- full clarity only at peak coherence."},
            {label:"Mycelium network conductance",
              tex:"G_{\\text{myc}} = G_0\\,\\sinh\\!\\left(\\frac{V_{\\text{field}}}{V_T}\\right)",
              col:V.amb,
              note:"Hyphal conductance follows sinh response to field potential -- non-linear amplification at field peaks."},
            {label:"SOI composite resonance",
              tex:"f_{\\text{SOI}} = \\frac{1}{2\\pi}\\sqrt{\\sum_{i=1}^{8}\\frac{k_i}{m_i C_i}}",
              col:V.vio,
              note:"Building resonates at one composite frequency across all floors. One structure -- one frequency."},
          ].map(m=>(
            <div key={m.label} style={{padding:"14px",borderRadius:6,
              background:`${m.col}08`,border:`1px solid ${m.col}22`}}>
              <div style={{fontFamily:MONO,fontSize:7,color:m.col,
                letterSpacing:"0.13em",marginBottom:8}}>{m.label.toUpperCase()}</div>
              <div dangerouslySetInnerHTML={{__html:kx(m.tex,true)}} style={{color:m.col,marginBottom:8}}/>
              <div style={{fontFamily:SERIF,fontSize:"0.8rem",color:V.dim,lineHeight:1.45}}>
                {m.note}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* IV — Material stack table */}
      <div style={{marginBottom:40}}>
        <SectionHead n="IV" title="MATERIAL STACK -- ALL 8 FLOORS" col={V.green}/>
        <div style={{overflowX:"auto" as const}}>
          <table style={{width:"100%",borderCollapse:"collapse" as const,fontFamily:MONO,fontSize:8}}>
            <thead>
              <tr>
                {["FL","Type","C(x,t)","Bio","Field Mode","Primary Material"].map(h=>(
                  <th key={h} style={{padding:"7px 10px",textAlign:"left" as const,
                    borderBottom:`1px solid ${V.dim}44`,color:V.dim,
                    fontWeight:400,letterSpacing:"0.1em",whiteSpace:"nowrap" as const}}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {[7,6,5,4,3,2,1,0].map(fi=>{
                const fc=FLOOR_CATALOGUE[floorAssign[fi]];
                const isSel=selectedFloor===fi;
                return(
                  <tr key={fi} onClick={()=>setSelectedFloor(fi)}
                    style={{cursor:"pointer",transition:"background 0.18s",
                      background:isSel?`${fc.col}0D`:"transparent"}}>
                    <td style={{padding:"7px 10px",color:fc.col,borderBottom:`1px solid ${V.dim}1A`}}>F{fi+1}</td>
                    <td style={{padding:"7px 10px",color:isSel?fc.col:V.ink,borderBottom:`1px solid ${V.dim}1A`}}>{fc.label}</td>
                    <td style={{padding:"7px 10px",color:fc.col,borderBottom:`1px solid ${V.dim}1A`}}>{fc.coherence.toFixed(2)}</td>
                    <td style={{padding:"7px 10px",color:fc.bio?V.green:V.dim,borderBottom:`1px solid ${V.dim}1A`}}>{fc.bio?"YES":"no"}</td>
                    <td style={{padding:"7px 10px",color:"rgba(184,204,232,0.5)",
                      borderBottom:`1px solid ${V.dim}1A`,maxWidth:170,
                      whiteSpace:"nowrap" as const,overflow:"hidden" as const,textOverflow:"ellipsis" as const}}>
                      {fc.field.split("--")[0].trim()}
                    </td>
                    <td style={{padding:"7px 10px",color:"rgba(184,204,232,0.45)",
                      borderBottom:`1px solid ${V.dim}1A`,maxWidth:200,
                      whiteSpace:"nowrap" as const,overflow:"hidden" as const,textOverflow:"ellipsis" as const}}>
                      {fc.material.split("+")[0].trim()}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* V — Bio-Photonic Emitters */}
      <div style={{marginBottom:40}}>
        <SectionHead n="V" title="BIO-PHOTONIC EMITTERS -- BIOLUMINESCENT CHANNELS" col={V.vio}/>
        <div style={{fontFamily:SERIF,fontSize:"0.9rem",color:"rgba(184,204,232,0.7)",
          lineHeight:1.55,marginBottom:14,maxWidth:760}}>
          The living walls and bio floors emit light through coherence-gated luciferase
          systems. Each channel is a luciferin -- luciferase pair tuned to a distinct
          emission window, from visible sea-milk Cerulean to telecom-band Substrate-Dark.
          Emission intensifies as local coherence C(x,t) rises -- the building reports its
          own field state as light.
        </div>
        <div style={{display:"grid",gridTemplateColumns:ww<700?"1fr":"repeat(3,1fr)",gap:14}}>
          {[
            {img:emitterCerulean,name:"Cerulean",band:"476 nm -- visible",col:V.blue,
              eta:"eta_Q 0.09",half:"half-life 3 min",sub:"lambda-Carrageenan fluid gel",
              body:"Symbiodinium dinoflagellate -- the original AETHER sea-milk emitter. Brightest channel, drives plankton-bloom luminescence."},
            {img:emitterCoherence,name:"Coherence-Node",band:"940 nm -- near-IR",col:V.vio,
              eta:"eta_Q ~0.01",half:"variable with C(x,t)",sub:"DNA hydrogel + field antenna",
              body:"Synthetic photoprobe. Quantum yield spikes 0.001 to 0.01 when C(x,t) crosses phi-inverse -- the tissue glows at its equilibrium point."},
            {img:emitterSubstrate,name:"Substrate-Dark",band:"1550 nm -- SWIR",col:V.plasma,
              eta:"eta_Q ~0.002",half:"half-life <1 min",sub:"silica nanoporous matrix",
              body:"Deep-SWIR coral-luciferase hybrid at the telecom C-band -- lets living tissue inject signal directly into photonic fibre."},
            {img:emitterPhiOvertone,name:"Phi-Squared Overtone",band:"1377 nm -- SWIR",col:V.fire,
              eta:"eta_Q ~0.003",half:"half-life <1 min",sub:"kappa-carrageenan + silica",
              body:"A phi-squared-Luc luciferase tuned along a torsion-helix to toroid harmonic -- the overtone channel that folds the golden ratio directly into its emission window."},
            {img:emitterCarmineIR,name:"Carmine-IR",band:"690 nm -- deep red",col:V.rose,
              eta:"eta_Q 0.06",half:"half-life 10 min",sub:"mycelium substrate",
              body:"A BphS1-NLuc bacteriophytochrome fusion on a biliverdin luciferin -- the longest-lived channel, imaging bacteria straight through the photosynthesis zone."},
            {img:emitterPhantomIR,name:"Phantom-IR",band:"760 nm -- NIR-I",col:V.amb,
              eta:"eta_Q 0.03",half:"half-life 6 min",sub:"gyroid photonic crystal",
              body:"An OplIR luciferase with a furimazine-IR analog -- a clean phantom-imaging channel that clears GFP, RFP and BFP background inside living tissue."},
            {img:emitterCoralSWIR,name:"CoralLuc-SWIR",band:"1550 nm -- C-band",col:V.gold,
              eta:"eta_Q ~0.002",half:"half-life <1 min",sub:"silica nanoporous coral",
              body:"A coral-luciferase hybrid rendered as living reef -- injects bio-signal straight into telecom C-band fibre across 1530 to 1565 nm."},
          ].map(e=>(
            <figure key={e.name} style={{margin:0,borderRadius:8,overflow:"hidden" as const,
              background:`${e.col}08`,border:`1px solid ${e.col}30`}}>
              <a href={e.img} target="_blank" rel="noopener noreferrer"
                style={{display:"block",lineHeight:0}}>
                <img src={e.img} alt={`${e.name} bioluminescent emitter infographic`}
                  loading="lazy"
                  style={{width:"100%",height:"auto",display:"block"}}/>
              </a>
              <figcaption style={{padding:"12px 14px"}}>
                <div style={{display:"flex",justifyContent:"space-between",
                  alignItems:"baseline",gap:8,flexWrap:"wrap" as const}}>
                  <div style={{fontFamily:DISP,fontSize:"1rem",color:e.col,
                    letterSpacing:"0.08em"}}>{e.name}</div>
                  <div style={{fontFamily:MONO,fontSize:8,color:e.col}}>{e.band}</div>
                </div>
                <div style={{display:"flex",gap:6,flexWrap:"wrap" as const,margin:"7px 0"}}>
                  {[e.eta,e.half,e.sub].map(t=>(
                    <span key={t} style={{fontFamily:MONO,fontSize:7,color:V.dim,
                      border:`1px solid ${V.dim}55`,borderRadius:3,padding:"2px 6px"}}>{t}</span>
                  ))}
                </div>
                <div style={{fontFamily:SERIF,fontSize:"0.82rem",
                  color:"rgba(184,204,232,0.65)",lineHeight:1.45}}>{e.body}</div>
              </figcaption>
            </figure>
          ))}
        </div>
        <figure style={{margin:"18px 0 0",borderRadius:8,overflow:"hidden" as const,
          border:`1px solid ${V.fire}33`,background:`${V.fire}08`}}>
          <a href={bodyPhoton} target="_blank" rel="noopener noreferrer"
            style={{display:"block",lineHeight:0}}>
            <img src={bodyPhoton} alt="Human body blackbody photon emission infographic"
              loading="lazy" style={{width:"100%",height:"auto",display:"block"}}/>
          </a>
          <figcaption style={{padding:"12px 14px"}}>
            <div style={{fontFamily:DISP,fontSize:"1rem",color:V.fire,letterSpacing:"0.08em"}}>
              THE BODY ALREADY EMITS
            </div>
            <div style={{fontFamily:SERIF,fontSize:"0.82rem",color:"rgba(184,204,232,0.65)",
              lineHeight:1.45,marginTop:6}}>
              Before any engineered channel, human skin radiates as a blackbody -- P = pi A T^4,
              roughly 872 W emitted with 176 W net loss, about 41.1x10^21 photons every second at
              ~33 C skin against a ~16 C room. The living emitter is the baseline every luciferase
              channel above is tuned to exceed.
            </div>
          </figcaption>
        </figure>
      </div>

      {/* VI — AETHER Build Framing */}
      <div style={{marginBottom:40}}>
        <SectionHead n="VI" title="AETHER BUILD FRAMING -- ARCHITECTURALLY SOUND" col={V.gold}/>
        <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:8}}>
          {[
            {layer:"Structural Core",mat:"Mycelium composite column + lignin beam",col:V.amb,status:"Buildable"},
            {layer:"Facade",mat:"Electrochromic glass + CNT panel",col:V.blue,status:"Buildable"},
            {layer:"Living Walls",mat:"Hydrogel membrane + photobioreactor",col:V.green,status:"Buildable"},
            {layer:"Neural Mesh",mat:"Graphene sensor + NV-diamond node",col:V.vio,status:"Near-term"},
            {layer:"Phononic Layer",mat:"Phononic crystal + piezo resonator",col:V.aurora,status:"Near-term"},
            {layer:"SOI Field",mat:"Distributed EM + acoustic standing wave",col:V.plasma,status:"SPECULATIVE"},
          ].map(b=>(
            <div key={b.layer} style={{padding:"12px",borderRadius:6,
              background:`${b.col}07`,border:`1px solid ${b.col}28`}}>
              <div style={{fontFamily:MONO,fontSize:7,color:b.col,
                letterSpacing:"0.13em",marginBottom:5}}>{b.layer.toUpperCase()}</div>
              <div style={{fontFamily:SERIF,fontSize:"0.82rem",
                color:"rgba(184,204,232,0.65)",lineHeight:1.4,marginBottom:6}}>{b.mat}</div>
              <div style={{fontFamily:MONO,fontSize:7,
                color:b.status==="Buildable"?V.green:b.status==="Near-term"?V.gold:V.plasma}}>
                {b.status}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Footer */}
      <div style={{borderTop:`1px solid ${V.dim}44`,paddingTop:24,
        display:"flex",justifyContent:"space-between",flexWrap:"wrap" as const,gap:12}}>
        <div style={{fontFamily:MONO,fontSize:8,color:V.dim}}>
          AETHER KNOWLEDGE SYSTEM -- SOI BUILDING
        </div>
        <div style={{fontFamily:MONO,fontSize:8,color:V.dim,textAlign:"right" as const}}>
          <div>Substrate-Organised Intelligence -- Living Architecture</div>
          <div>Smart Field -- Pulsing Coherence Windows -- 8 Floors</div>
        </div>
      </div>
    </div>
  );
}
