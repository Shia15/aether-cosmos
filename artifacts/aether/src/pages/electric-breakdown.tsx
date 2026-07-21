/*═══════════════════════════════════════════════════════════════
  Electric Field Breakdown Limits
  Dielectric breakdown, plasma ignition thresholds, lightning,
  Paschen curve, streamer physics.

  Physics:
  ── Paschen law:      V_breakdown = f(p·d)  (pressure × gap)
  ── Townsend:        α·d = ln(1 + 1/γ)    (ionization coefficient)
  ── Streamer:        E_critical ≈ 3 MV/m  (air at STP)
  ── Corona:          E_onset ≈ 1 MV/m    (rounded electrode)
  ── E_BD materials:  SiO2 10 MV/m, BaTiO3 20 MV/m, Air 3 MV/m
  ── Power dissipated: P = σ·E²            (in plasma channel)
═══════════════════════════════════════════════════════════════*/
import { useRef, useEffect, useState, useCallback } from "react";
import omniFlow from "@assets/72D555D1-E91E-4B74-A73B-4628B8538AA1_1784561445345.png";
import magStorm from "@assets/A6805E91-9684-4C59-BFC8-482EF421381D_1784561445345.png";
import skyrmion from "@assets/IMG_4534_1784561445345.png";

const P={
  bg:"#0a0500",panel:"#140900",panel2:"#1a0c00",
  ivory:"#fff8ec",dim:"rgba(255,248,236,0.55)",muted:"rgba(255,248,236,0.28)",
  line:"rgba(255,140,0,0.08)",
  gold:"#fbbf24",amber:"#f59e0b",orange:"#f97316",
  red:"#ef4444",rose:"#f472b6",
  cyan:"#22d3ee",blue:"#60a5fa",violet:"#a78bfa",
  green:"#4ade80",white:"#ffffff",
};

function Tag({label,color=P.gold}:{label:string;color?:string}){
  return <div style={{fontSize:9,fontWeight:700,color,letterSpacing:2,textTransform:"uppercase" as const,marginBottom:10}}>{label}</div>;
}
function Divider(){return <div style={{height:1,background:P.line,margin:"44px 0"}}/>;}
function Card({title,body,color=P.gold,sub}:{title:string;body:string;color?:string;sub?:string}){
  return(
    <div style={{padding:"13px 15px",background:P.panel,borderRadius:10,border:`1px solid ${color}18`}}>
      {sub&&<div style={{fontSize:9,color,letterSpacing:1.2,marginBottom:4,textTransform:"uppercase" as const}}>{sub}</div>}
      <div style={{fontSize:11,fontWeight:700,color,letterSpacing:.5,marginBottom:6,textTransform:"uppercase" as const}}>{title}</div>
      <div style={{fontSize:12,color:P.dim,lineHeight:1.85}}>{body}</div>
    </div>
  );
}
function EqBlock({label,eq,note,color=P.gold}:{label:string;eq:string;note?:string;color?:string}){
  return(
    <div style={{padding:"12px 16px",background:P.panel2,borderRadius:9,border:`1px solid ${color}20`,marginBottom:10}}>
      <div style={{fontSize:9,color:P.muted,marginBottom:4,letterSpacing:1}}>{label}</div>
      <pre style={{fontSize:12,fontFamily:"monospace",color,lineHeight:1.9,margin:0,whiteSpace:"pre-wrap"}}>{eq}</pre>
      {note&&<div style={{fontSize:11,color:P.dim,marginTop:6,lineHeight:1.75}}>{note}</div>}
    </div>
  );
}

/* ── CANVAS 1: Paschen curve + interactive breakdown voltage ── */
function PaschenCanvas(){
  const ref=useRef<HTMLCanvasElement>(null);
  const pdRef=useRef(1.0);
  const [pd,setPd]=useState(1.0);
  useEffect(()=>{pdRef.current=pd;},[pd]);

  useEffect(()=>{
    const cv=ref.current;if(!cv)return;
    const ctx=cv.getContext("2d")!;
    let raf=0,t=0;
    const ro=new ResizeObserver(()=>{cv.width=cv.offsetWidth;cv.height=cv.offsetHeight;});
    ro.observe(cv);cv.width=cv.offsetWidth;cv.height=cv.offsetHeight;

    // Paschen curve for air: V_b(pd) (approximate empirical fit)
    function paschenAir(pd_val:number){
      // pd in Pa·m, V in volts
      // Paschen minimum at pd ≈ 0.76 Pa·m, V_min ≈ 327 V
      const A=112.5,B=2737.5,gamma=0.01;
      const lnarg=1+1/gamma;
      if(pd_val<=0)return Infinity;
      const denom=Math.log(A*pd_val)-Math.log(Math.log(lnarg));
      return denom>0?B*pd_val/denom:Infinity;
    }

    function draw(){
      const W=cv.width,H=cv.height;
      ctx.clearRect(0,0,W,H);ctx.fillStyle=P.bg;ctx.fillRect(0,0,W,H);

      const padX=56,padY=28,plotW=W-padX-28,plotH=H-padY-36;

      // Log-scale pd axis: 0.01 to 100 Pa·m
      const logMin=-2,logMax=2; // log10 range
      function pdToX(pd_val:number){return padX+(Math.log10(pd_val)-logMin)/(logMax-logMin)*plotW;}
      function vToY(v:number){
        const vMax=10000,vMin=200;
        return padY+plotH-(Math.min(v,vMax)-vMin)/(vMax-vMin)*plotH;
      }

      // Grid
      ctx.strokeStyle="rgba(255,140,0,0.07)";ctx.lineWidth=0.5;
      [-2,-1,0,1,2].forEach(logV=>{
        const x=padX+(logV-logMin)/(logMax-logMin)*plotW;
        ctx.beginPath();ctx.moveTo(x,padY);ctx.lineTo(x,padY+plotH);ctx.stroke();
        ctx.fillStyle=P.muted;ctx.font="7px monospace";ctx.textAlign="center";
        ctx.fillText(`10^${logV}`,x,padY+plotH+12);
      });
      [500,1000,2000,5000,10000].forEach(v=>{
        const y=vToY(v);if(y<padY||y>padY+plotH)return;
        ctx.beginPath();ctx.moveTo(padX,y);ctx.lineTo(padX+plotW,y);ctx.stroke();
        ctx.fillStyle=P.muted;ctx.font="7px monospace";ctx.textAlign="right";
        ctx.fillText(`${v}V`,padX-4,y+3);
      });

      // Paschen curves (air + SF6 + He)
      const GASES=[
        {label:"Air",col:P.gold,fn:(x:number)=>paschenAir(x)},
        {label:"SF6",col:P.orange,fn:(x:number)=>paschenAir(x)*2.5}, // SF6 ~2.5× higher BD
        {label:"He",col:P.cyan,fn:(x:number)=>paschenAir(x*0.3)*1.2},
      ];
      GASES.forEach(gas=>{
        ctx.strokeStyle=gas.col;ctx.lineWidth=2;ctx.beginPath();
        let first=true;
        for(let logX=logMin;logX<=logMax;logX+=0.02){
          const pdv=10**logX;
          const v=gas.fn(pdv);
          if(!isFinite(v)||v>10500)continue;
          const sx=pdToX(pdv),sy=vToY(v);
          if(sy<padY||sy>padY+plotH){first=true;continue;}
          first?ctx.moveTo(sx,sy):ctx.lineTo(sx,sy);first=false;
        }
        ctx.stroke();
        // Label at right
        const v=gas.fn(80);
        if(isFinite(v)&&v<10000){
          ctx.fillStyle=gas.col;ctx.font="bold 8px monospace";ctx.textAlign="left";
          ctx.fillText(gas.label,pdToX(80)+4,vToY(v)+3);
        }
      });

      // Selected pd cursor
      const selX=pdToX(pdRef.current);
      const selV=paschenAir(pdRef.current);
      ctx.strokeStyle=P.white+"88";ctx.lineWidth=1.5;ctx.setLineDash([4,4]);
      ctx.beginPath();ctx.moveTo(selX,padY);ctx.lineTo(selX,padY+plotH);ctx.stroke();ctx.setLineDash([]);
      if(isFinite(selV)&&selV<10500){
        const selY=vToY(selV);
        const flash=0.7+0.3*Math.sin(t*0.08);
        ctx.fillStyle=`rgba(255,200,0,${flash})`;ctx.beginPath();ctx.arc(selX,selY,7,0,Math.PI*2);ctx.fill();
        ctx.fillStyle=P.white;ctx.font="bold 8px monospace";ctx.textAlign="left";
        ctx.fillText(`V_BD = ${Math.round(selV)} V`,selX+10,selY-6);
        ctx.fillStyle=P.dim;ctx.font="7px monospace";
        ctx.fillText(`pd = ${pdRef.current.toFixed(2)} Pa·m`,selX+10,selY+6);
        // Breakdown indicator
        const isBreakdown=selV<800;
        if(isBreakdown){
          const lightning=flash;
          ctx.strokeStyle=`rgba(255,240,100,${lightning*0.8})`;ctx.lineWidth=3;
          ctx.beginPath();
          let lx=selX,ly=padY;
          while(ly<padY+plotH){ctx.lineTo(lx+(Math.random()-0.5)*16,ly);ly+=12;}
          ctx.stroke();
        }
      }

      // Paschen minimum marker
      const minX=pdToX(0.76),minY=vToY(327);
      ctx.fillStyle=P.rose+"cc";ctx.beginPath();ctx.arc(minX,minY,6,0,Math.PI*2);ctx.fill();
      ctx.fillStyle=P.rose;ctx.font="bold 7px monospace";ctx.textAlign="center";
      ctx.fillText("PASCHEN MIN",minX,minY-10);
      ctx.fillText("327V @ 0.76 Pa·m",minX,minY+18);

      // Axis labels
      ctx.fillStyle=P.gold;ctx.font="bold 8px monospace";ctx.textAlign="center";
      ctx.fillText("p·d (pressure × gap, Pa·m)",padX+plotW/2,H-4);
      ctx.save();ctx.translate(12,padY+plotH/2);ctx.rotate(-Math.PI/2);
      ctx.fillText("Breakdown voltage V_BD",0,0);ctx.restore();

      ctx.fillStyle=P.gold;ctx.font="bold 8px monospace";ctx.textAlign="left";
      ctx.fillText("PASCHEN CURVE · BREAKDOWN VOLTAGE vs pd · AIR / SF6 / He",8,14);
      ctx.fillStyle=P.muted;ctx.font="7px monospace";
      ctx.fillText("Paschen minimum: lowest voltage needed for breakdown. Too low pd or too high pd → higher voltage required.",8,H-18);

      t++;raf=requestAnimationFrame(draw);
    }
    draw();
    return()=>{cancelAnimationFrame(raf);ro.disconnect();};
  },[]);

  return(
    <div style={{border:`1px solid ${P.line}`,borderRadius:12,overflow:"hidden",marginBottom:28}}>
      <canvas ref={ref} style={{width:"100%",height:400,display:"block"}}/>
      <div style={{padding:"10px 16px",background:P.panel,display:"flex",gap:20,flexWrap:"wrap",alignItems:"center"}}>
        <div>
          <div style={{fontSize:10,color:P.gold,marginBottom:3}}>p·d (Pa·m) · {pd.toFixed(2)}</div>
          <input type="range" min={0.02} max={20} step={0.02} value={pd} onChange={e=>setPd(+e.target.value)} style={{width:200}}/>
        </div>
        <div style={{fontSize:11,color:P.dim,lineHeight:1.85,maxWidth:500}}>
          Drag to scan p·d. The Paschen minimum (327 V, gold dot) is where breakdown requires the least voltage — at lower p·d, electrons travel between collisions without enough ionisation events; at higher p·d, too many collisions drain energy before electrons reach ionisation.
        </div>
      </div>
    </div>
  );
}

/* ── CANVAS 2: Streamer discharge simulation ── */
function StreamerCanvas(){
  const ref=useRef<HTMLCanvasElement>(null);
  const EfieldRef=useRef(1.0);
  const [Efield,setEfield]=useState(1.0);
  useEffect(()=>{EfieldRef.current=Efield;},[Efield]);
  const clickRef=useRef<{x:number;y:number}|null>(null);

  const handleClick=useCallback((e:React.MouseEvent<HTMLCanvasElement>)=>{
    const cv=ref.current;if(!cv)return;
    const rect=cv.getBoundingClientRect();
    clickRef.current={x:e.clientX-rect.left,y:e.clientY-rect.top};
  },[]);

  useEffect(()=>{
    const cv=ref.current;if(!cv)return;
    const ctx=cv.getContext("2d")!;
    let raf=0,t=0;
    const ro=new ResizeObserver(()=>{cv.width=cv.offsetWidth;cv.height=cv.offsetHeight;});
    ro.observe(cv);cv.width=cv.offsetWidth;cv.height=cv.offsetHeight;

    // Streamer channels
    type Channel={x:number;y:number;life:number;branches:number;col:string;bright:number};
    const channels:Channel[]=[];
    let globalE=1.0;

    function spawnStreamer(sx:number,sy:number,E:number){
      const brightness=Math.min(1,E*0.5);
      function branch(x:number,y:number,dir:number,depth:number,life:number){
        if(depth>8||life<=0||x<0||x>cv.width||y<0||y>cv.height)return;
        channels.push({x,y,life,branches:depth,col:E>2?P.white:P.gold,bright:brightness});
        const spread=(Math.PI*0.35)/Math.max(1,depth);
        const numBranches=depth<2?3:depth<4?2:Math.random()<0.3?2:1;
        for(let i=0;i<numBranches;i++){
          const newDir=dir+(Math.random()-0.5)*spread*2;
          const speed=(8+E*4)*Math.random()+4;
          setTimeout(()=>branch(x+Math.cos(newDir)*speed,y+Math.sin(newDir)*speed,newDir,depth+1,life-0.15),i*15);
        }
      }
      branch(sx,sy,Math.PI/2,0,1);
    }

    function draw(){
      const W=cv.width,H=cv.height;
      globalE=EfieldRef.current;

      // Fade background
      ctx.fillStyle=`rgba(10,5,0,${0.85})`;ctx.fillRect(0,0,W,H);

      // Auto-spawn at top electrode
      if(t%Math.max(2,Math.round(20/globalE))===0&&globalE>0.5){
        const ex=W*0.1+Math.random()*W*0.8;
        spawnStreamer(ex,8,globalE);
      }

      // Spawn on click
      if(clickRef.current){
        spawnStreamer(clickRef.current.x,clickRef.current.y,globalE+1);
        clickRef.current=null;
      }

      // Draw channels
      for(let i=channels.length-1;i>=0;i--){
        const ch=channels[i];
        ch.life-=0.04;
        if(ch.life<=0){channels.splice(i,1);continue;}
        const alpha=ch.life*ch.bright;
        const r=ch.col===P.white?255:251;
        const g=ch.col===P.white?255:191;
        const b=ch.col===P.white?255:36;
        const glow=ctx.createRadialGradient(ch.x,ch.y,0,ch.x,ch.y,12-ch.branches);
        glow.addColorStop(0,`rgba(${r},${g},${b},${alpha*0.9})`);
        glow.addColorStop(1,`rgba(${r},${g},${b},0)`);
        ctx.fillStyle=glow;ctx.beginPath();ctx.arc(ch.x,ch.y,12-ch.branches,0,Math.PI*2);ctx.fill();
      }

      // Electrodes
      ctx.fillStyle="rgba(60,60,100,0.9)";
      ctx.fillRect(0,0,W,6); // cathode top
      ctx.fillRect(0,H-6,W,6); // anode bottom
      ctx.fillStyle=P.gold;ctx.font="bold 7px monospace";ctx.textAlign="left";
      ctx.fillText("CATHODE (−)",6,14);ctx.textAlign="right";ctx.fillText("ANODE (+)",W-6,H-10);

      // Field strength indicator
      const Ev=globalE;
      const Emat=Ev>=3?"AIR BREAKDOWN":Ev>=2?"CORONA":Ev>=1?"STRONG FIELD":"SUB-BREAKDOWN";
      const Ecol=Ev>=3?P.white:Ev>=2?P.orange:Ev>=1?P.gold:P.dim;
      ctx.fillStyle=Ecol;ctx.font="bold 9px monospace";ctx.textAlign="center";
      ctx.fillText(`E = ${Ev.toFixed(1)} MV/m · ${Emat}`,W/2,H-20);

      // Channel count
      ctx.fillStyle=P.gold;ctx.font="bold 8px monospace";ctx.textAlign="left";
      ctx.fillText("STREAMER DISCHARGE · CLICK TO TRIGGER · TOWNSEND AVALANCHE → LEADER → RETURN STROKE",8,14);
      ctx.fillStyle=P.muted;ctx.font="7px monospace";
      ctx.fillText(`Active channels: ${channels.length} · α (ionisation coeff) ∝ E`,8,H-6);

      t++;raf=requestAnimationFrame(draw);
    }
    draw();
    return()=>{cancelAnimationFrame(raf);ro.disconnect();};
  },[]);

  return(
    <div style={{border:`1px solid ${P.line}`,borderRadius:12,overflow:"hidden",marginBottom:28}}>
      <canvas ref={ref} onClick={handleClick} style={{width:"100%",height:420,display:"block",cursor:"crosshair"}}/>
      <div style={{padding:"10px 16px",background:P.panel,display:"flex",gap:20,flexWrap:"wrap",alignItems:"center"}}>
        <div>
          <div style={{fontSize:10,color:P.gold,marginBottom:3}}>E field · {Efield.toFixed(1)} MV/m</div>
          <input type="range" min={0.1} max={5} step={0.05} value={Efield} onChange={e=>setEfield(+e.target.value)} style={{width:160}}/>
        </div>
        <div style={{fontSize:11,color:P.dim,lineHeight:1.85,maxWidth:500}}>
          <strong style={{color:P.gold}}>Click</strong> to trigger a streamer anywhere. Increase E above 3 MV/m for air breakdown — streamers branch more aggressively and glow white-hot (return stroke analogue). Below 1 MV/m, the channel is too weak to propagate far.
        </div>
      </div>
    </div>
  );
}

/* ── CANVAS 3: Material breakdown thresholds comparison bar chart ── */
function MaterialBDCanvas(){
  const ref=useRef<HTMLCanvasElement>(null);
  useEffect(()=>{
    const cv=ref.current;if(!cv)return;
    const ctx=cv.getContext("2d")!;
    let raf=0,t=0;
    const ro=new ResizeObserver(()=>{cv.width=cv.offsetWidth;cv.height=cv.offsetHeight;});
    ro.observe(cv);cv.width=cv.offsetWidth;cv.height=cv.offsetHeight;

    const MATS=[
      {name:"Vacuum",E:Infinity,note:"No breakdown (no charge carriers)",col:P.cyan},
      {name:"Air (STP)",E:3,note:"Corona @ 1 MV/m, spark @ 3 MV/m",col:P.gold},
      {name:"SF6 gas",E:7.5,note:"Superior insulator, used in HV switchgear",col:P.orange},
      {name:"Transformer oil",E:12,note:"Liquid dielectric, cools and insulates",col:P.amber},
      {name:"Mica",E:160,note:"Best solid mineral insulator",col:P.green},
      {name:"Polyimide (Kapton)",E:280,note:"Aerospace flexible circuit insulator",col:P.blue},
      {name:"SiO2 (gate oxide)",E:1000,note:"CMOS transistor gate, nm thickness",col:P.violet},
      {name:"BaTiO3",E:20,note:"Ferroelectric, high-k capacitor",col:P.rose},
      {name:"Diamond",E:2000,note:"Highest BD strength of any natural material",col:"#e0f2fe"},
    ];
    const MAX_E=200; // cap for bar display (SiO2 and diamond off-scale noted)

    function draw(){
      const W=cv.width,H=cv.height;
      ctx.clearRect(0,0,W,H);ctx.fillStyle=P.bg;ctx.fillRect(0,0,W,H);

      const barH=Math.min(38,(H-50)/MATS.length-4);
      const padL=160,padR=28,barMaxW=W-padL-padR;

      MATS.forEach((mat,i)=>{
        const y=30+i*(barH+5);
        const E_disp=Math.min(mat.E,MAX_E);
        const barW=isFinite(mat.E)?E_disp/MAX_E*barMaxW:barMaxW;
        const pulse=0.8+0.2*Math.sin(t*0.03+i*0.7);

        // Background track
        ctx.fillStyle=mat.col+"15";ctx.fillRect(padL,y,barMaxW,barH);
        // Bar
        const grd=ctx.createLinearGradient(padL,y,padL+barW,y+barH);
        grd.addColorStop(0,mat.col+(Math.round(pulse*180).toString(16).padStart(2,"0")));
        grd.addColorStop(1,mat.col+"55");
        ctx.fillStyle=grd;ctx.fillRect(padL,y,barW,barH);

        // Overflow arrow for very high BD
        if(!isFinite(mat.E)||mat.E>MAX_E){
          ctx.fillStyle=mat.col;ctx.font="bold 10px monospace";ctx.textAlign="left";
          ctx.fillText(isFinite(mat.E)?`→ ${mat.E} MV/m`:"→ ∞",padL+barMaxW+4,y+barH*0.65);
        }

        // Label
        ctx.fillStyle=mat.col;ctx.font="bold 8px monospace";ctx.textAlign="right";
        ctx.fillText(mat.name,padL-6,y+barH*0.65);
        // Value
        ctx.fillStyle=P.ivory;ctx.font="bold 7px monospace";ctx.textAlign="left";
        ctx.fillText(isFinite(mat.E)?`${mat.E} MV/m`:"∞",padL+barW+4,y+barH*0.5);
        // Note
        ctx.fillStyle=P.muted;ctx.font="6.5px monospace";
        if(isFinite(mat.E))ctx.fillText(mat.note,padL+2,y+barH*0.9);
        else ctx.fillText(mat.note,padL+2,y+barH*0.9);
      });

      // Reference line: air STP
      const airX=padL+(3/MAX_E)*barMaxW;
      ctx.strokeStyle=P.gold+"60";ctx.lineWidth=1;ctx.setLineDash([4,4]);
      ctx.beginPath();ctx.moveTo(airX,24);ctx.lineTo(airX,H-14);ctx.stroke();ctx.setLineDash([]);
      ctx.fillStyle=P.gold;ctx.font="7px monospace";ctx.textAlign="center";
      ctx.fillText("Air 3 MV/m",airX,20);

      ctx.fillStyle=P.gold;ctx.font="bold 8px monospace";ctx.textAlign="left";
      ctx.fillText("DIELECTRIC BREAKDOWN STRENGTH · MATERIAL COMPARISON · MV/m",8,14);
      ctx.fillStyle=P.muted;ctx.font="7px monospace";
      ctx.fillText("Diamond and SiO2 gate oxide far exceed scale — shown with → arrow",8,H-6);

      t++;raf=requestAnimationFrame(draw);
    }
    draw();
    return()=>{cancelAnimationFrame(raf);ro.disconnect();};
  },[]);
  return(
    <div style={{border:`1px solid ${P.line}`,borderRadius:12,overflow:"hidden",marginBottom:28}}>
      <canvas ref={ref} style={{width:"100%",height:420,display:"block"}}/>
    </div>
  );
}

export default function ElectricBreakdownPage(){
  const [imgX,setImgX]=useState<number|null>(null);
  const imgs=[
    {src:magStorm,caption:"Solar Plasma · Coronal Mass Ejection · Breakdown at Stellar Scale",
     anno:"A coronal mass ejection is a breakdown event — the coronal magnetic field stores energy until the current sheet between opposing polarities becomes too thin (d → 0), and the local E field exceeds the plasma breakdown threshold. Reconnection (the plasma analog of dielectric breakdown) releases stored magnetic energy as kinetic energy of the ejected plasma. The threshold is not a fixed E field but depends on the local Alfvén speed, the current sheet thickness d, and the resistivity η: E_reconnect ~ η·j_crit where j_crit is the critical current density above which ions are heated faster than they can cool. This is the cosmic Paschen curve: breakdown voltage is a function of the local plasma parameters (η·j_crit ~ V_A·d), not a universal constant.",
     chips:["CME","Magnetic Reconnection","Current Sheet Breakdown","Alfvén Speed","Resistivity η","Plasma Paschen"]},
    {src:skyrmion,caption:"Topological Defects · Breakdown Nucleation Sites",
     anno:"Dielectric breakdown almost never happens uniformly — it nucleates at the point of maximum field enhancement. In real materials, this is a topological defect: a dislocation, a grain boundary, a void, a surface scratch. The skyrmion texture shown here is a benign example of a topological defect in a spin field — but in a dielectric, the equivalent (a point defect, a dislocation core, a twin boundary) is the nucleation site for the ionisation avalanche. The Townsend coefficient α is locally enhanced by orders of magnitude at these sites, because the effective gap d is reduced (grain boundary thickness << bulk thickness) and the local field E is enhanced by the geometric factor of the defect. This is why ultra-thin SiO2 gate oxides fail catastrophically at their first pinhole — the pinhole is a skyrmion-equivalent: a topological singularity in the material that the local field cannot smooth over.",
     chips:["Defect Nucleation","Field Enhancement","Grain Boundary","Gate Oxide Failure","Townsend Coefficient","Topological Singularity"]},
    {src:omniFlow,caption:"Omni-Flow Array · Field Uniformity for Breakdown Prevention",
     anno:"The primary engineering goal in high-voltage insulation is field uniformity — making the electric field as uniform as possible so that no single point exceeds the local breakdown threshold. The omni-flow rhombic array achieves exactly this: the rhombic cell geometry distributes stress evenly across all junctions, with no sharp corners that would enhance the field geometrically (E_tip ≈ E_0·(r_sphere/r_tip)² for a sphere-tip electrode pair). In AETHER terms: the omni-flow pattern is a high-voltage insulation layout — the same geometry that prevents dielectric breakdown in a capacitor is the same geometry that distributes plasma most evenly in a fusion reactor first wall, and the same geometry that slime mould finds when optimising a transport network. Uniform stress, uniform flow, uniform growth — the rhombus is nature's solution to the distribution problem.",
     chips:["Field Uniformity","Stress Distribution","Rhombic Geometry","Fusion First Wall","Capacitor Design","No Sharp Corners"]},
  ];
  return(
    <div style={{background:P.bg,color:P.ivory,minHeight:"100vh",fontFamily:"inherit"}}>
      <div style={{maxWidth:1060,margin:"0 auto",padding:"52px 32px 36px"}}>
        <Tag label="Electric Field Breakdown · Paschen Curve · Streamer Physics · Townsend Avalanche · Material Thresholds · Dielectric · Plasma Ignition"/>
        <h1 style={{fontSize:34,fontWeight:800,lineHeight:1.1,margin:"8px 0 14px",letterSpacing:-0.5}}>
          <span style={{color:P.gold}}>When the Field</span> Exceeds<br/>
          <span style={{color:P.orange}}>the Material's</span> <span style={{color:P.red}}>Limit</span>
        </h1>
        <h2 style={{fontSize:18,fontWeight:400,color:"#fed7aa",margin:"0 0 18px",lineHeight:1.5}}>
          Dielectric breakdown · Paschen minimum · streamer-to-leader transition · lightning · plasma ignition threshold
        </h2>
        <p style={{fontSize:14,color:P.dim,lineHeight:1.9,maxWidth:780,marginBottom:20}}>
          Every material has a breakdown field — a threshold electric field E_BD above which it stops being an insulator and becomes a conductor. For air at standard conditions this is ≈3 MV/m. For diamond it is ≈2000 MV/m. Below E_BD: charge carriers are rare, field is maintained, no current flows. Above E_BD: a single electron produces an ionisation avalanche (Townsend process), tip-to-tail streamers form, the channel conducts, and the stored energy discharges. This transition is the same physics at every scale — from a transistor gate oxide to a lightning bolt to a coronal mass ejection.
        </p>
        <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:10,maxWidth:720,marginBottom:16}}>
          {[
            {label:"Air STP",val:"3 MV/m",col:P.gold},
            {label:"SF6",val:"7.5 MV/m",col:P.orange},
            {label:"Diamond",val:"2000 MV/m",col:"#e0f2fe"},
          ].map(m=>(
            <div key={m.label} style={{padding:"10px 14px",background:P.panel2,borderRadius:9,border:`1px solid ${m.col}20`,textAlign:"center"}}>
              <div style={{fontSize:10,color:m.col,fontWeight:700}}>{m.label}</div>
              <div style={{fontSize:16,fontWeight:800,color:m.col,margin:"4px 0"}}>{m.val}</div>
              <div style={{fontSize:10,color:P.muted}}>breakdown field</div>
            </div>
          ))}
        </div>
      </div>
      <Divider/>
      <div style={{maxWidth:1060,margin:"0 auto",padding:"0 32px 48px"}}>
        <Tag label="Section I · Paschen Curve · Breakdown Voltage vs p·d · Air / SF6 / He" color={P.gold}/>
        <h2 style={{fontSize:22,fontWeight:700,color:P.gold,margin:"0 0 12px"}}>Paschen Minimum · The Sweet Spot of Breakdown</h2>
        <p style={{fontSize:14,color:P.dim,lineHeight:1.9,maxWidth:780,marginBottom:20}}>
          The Paschen curve shows breakdown voltage as a function of p·d (pressure × electrode gap). It has a minimum — the Paschen minimum — where breakdown requires the least voltage. This is where mean free path equals gap spacing: each electron ionises exactly once per gap crossing. At lower p·d, electrons travel without enough collisions. At higher p·d, electrons lose energy in too many collisions before reaching ionisation.
        </p>
        <PaschenCanvas/>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:14}}>
          <EqBlock label="TOWNSEND IONISATION" color={P.gold}
            eq={"First Townsend coefficient:\nα = A·p·exp(−B·p/E)\n\nFor air: A=112.5 m⁻¹Pa⁻¹, B=2737.5 V·m⁻¹Pa⁻¹\n\nBreakdown condition:\nα·d = ln(1 + 1/γ)\n\nγ = secondary emission coefficient (≈0.01 for Cu)\n\nPaschen law: V_BD = B·pd / (ln(A·pd) − ln(ln(1+1/γ)))\nMinimum at: (pd)_min = e·ln(1+1/γ)/A"}
            note="Each electron released by the cathode creates an ionisation cascade — 'Townsend avalanche'. The process is self-sustaining when α·d equals the log term — this is the Paschen condition."/>
          <EqBlock label="STREAMER CRITERION" color={P.orange}
            eq={"Raether criterion: α·x_crit = 20\n(~10⁸ electrons in a single avalanche)\n\nStreamer electric field:\nE_s ≈ E_0 + E_space-charge\n\nSpace charge field at avalanche tip:\nE_sc ∝ exp(α·x) / r²\n\nWhen E_sc ≈ E_0: streamer self-propagates\nLeader channel: T > 6000 K, σ > 0.1 S/m\nReturn stroke: v ≈ 10⁸ m/s, I ≈ 20 kA"}
            note="Above ~10⁸ electrons in one avalanche, the space-charge field from the electrons themselves equals the applied field — the streamer becomes self-sustaining and propagates without the applied field driving every step."/>
        </div>
      </div>
      <Divider/>
      <div style={{maxWidth:1060,margin:"0 auto",padding:"0 32px 48px"}}>
        <Tag label="Section II · Streamer Discharge · Click to Trigger · Townsend → Leader → Return Stroke" color={P.orange}/>
        <h2 style={{fontSize:22,fontWeight:700,color:P.orange,margin:"0 0 12px"}}>Live Streamer Simulation · Field-Driven Branching Discharge</h2>
        <StreamerCanvas/>
        <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(185px,1fr))",gap:12}}>
          <Card title="Townsend Avalanche" sub="phase 1" color={P.gold} body="Single free electron accelerates in E field, ionises a neutral atom, releasing another electron. That electron ionises another. Exponential multiplication: n = exp(α·d). Process is microscopic, no light visible, no current detectable externally."/>
          <Card title="Streamer Formation" sub="phase 2" color={P.orange} body="When the avalanche reaches 10⁸ electrons, the space-charge field distorts the applied field enough to attract photons from recombination. These photons photo-ionise fresh neutrals ahead of the tip — the streamer propagates faster than ions can move. Branching occurs where photon density is highest."/>
          <Card title="Leader Channel" sub="phase 3" color={P.red} body="Sustained leader: a hot (6000 K), conducting plasma filament grows from electrode tip to tip. Resistance drops dramatically. The leader carries current sufficient to heat the channel above thermal ionisation threshold, maintaining conductivity independently of the applied field."/>
          <Card title="Return Stroke" sub="phase 4" color={P.white} body="When the leader bridges the gap, a massive current pulse propagates back along the channel at ~10⁸ m/s. The channel temperature spikes to 30,000 K (hotter than the sun's surface). This is the lightning bolt visible to the eye. The peak current of a typical stroke is 20 kA."/>
        </div>
      </div>
      <Divider/>
      <div style={{maxWidth:1060,margin:"0 auto",padding:"0 32px 48px"}}>
        <Tag label="Section III · Material Breakdown Thresholds · Air → Diamond → SiO2 Gate Oxide" color={P.amber}/>
        <h2 style={{fontSize:22,fontWeight:700,color:P.amber,margin:"0 0 12px"}}>From Air (3 MV/m) to Diamond (2000 MV/m)</h2>
        <MaterialBDCanvas/>
      </div>
      <Divider/>
      <div style={{maxWidth:1060,margin:"0 auto",padding:"0 32px 48px"}}>
        <Tag label="Section IV · Source Plates" color={P.gold}/>
        <div style={{display:"flex",flexDirection:"column" as const,gap:22}}>
          {imgs.map((img,i)=>(
            <div key={i} style={{border:`1px solid ${P.line}`,borderRadius:12,overflow:"hidden"}}>
              <img src={img.src} alt={img.caption} onClick={()=>setImgX(imgX===i?null:i)}
                style={{width:"100%",display:"block",cursor:"zoom-in",maxHeight:imgX===i?"none":240,objectFit:"cover" as const,objectPosition:"top"}}/>
              <div style={{padding:"14px 18px",background:P.panel}}>
                <div style={{fontSize:11,fontWeight:700,color:P.gold,marginBottom:8}}>{img.caption}</div>
                <div style={{display:"flex",gap:5,flexWrap:"wrap",marginBottom:10}}>
                  {img.chips.map((ch,ci)=><span key={ci} style={{fontSize:10,padding:"2px 8px",borderRadius:12,border:`1px solid ${P.gold}33`,color:P.gold,background:P.gold+"0f"}}>{ch}</span>)}
                </div>
                <div style={{fontSize:12,color:P.dim,lineHeight:1.85}}>{img.anno}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
      <Divider/>
      <div style={{maxWidth:1060,margin:"0 auto",padding:"0 32px 52px"}}>
        <Tag label="AETHER Reading"/>
        <div style={{padding:"20px 24px",background:P.panel2,borderRadius:14,border:`1px solid ${P.gold}15`,marginBottom:24}}>
          <div style={{fontSize:14,color:P.ivory,lineHeight:2.0}}>
            Breakdown is not destruction — it is <em style={{color:P.gold}}>phase transition</em>. The material below breakdown threshold is in the insulating phase: charges are bound, field is maintained, energy is stored. Above threshold, it flips to the conducting phase: charges liberate exponentially, field collapses, energy releases in microseconds. Every system has its breakdown threshold — the field value above which the current state cannot be sustained. In AETHER: the coherence field C(x,t) has its own "breakdown" — the LPE (Linear Phase-locked Eigenstates) threshold at C=0.65. Below 0.65, the field is in the disordered (insulating) phase. Above 0.65, coherent structures spontaneously organise — the "conducting" phase of information. The Paschen minimum is the optimal point: maximum susceptibility to phase transition at minimum energy cost.
          </div>
        </div>
        <div style={{display:"flex",gap:8,flexWrap:"wrap"}}>
          {["/electron-field","/aether-engine","/ionization-plasma","/cavitation-plasmoid","/gradient-field","/gobekli-plasma","/quantum-ammeter"].map(href=>(
            <a key={href} href={href} style={{padding:"6px 12px",borderRadius:8,border:`1px solid ${P.line}`,color:P.dim,fontSize:11,textDecoration:"none"}}>{href.replace("/","").replace(/-/g," ")} →</a>
          ))}
        </div>
      </div>
    </div>
  );
}
