/*═══════════════════════════════════════════════════════════════
  Cavitation and Plasmoid Harvesting
  Bubble collapse → sonoluminescence → plasma → energy extraction.

  Physics:
  ── Rayleigh collapse:  t_c = 0.915·R₀·√(ρ/P∞)
  ── Pressure at collapse: P_collapse ≈ P∞·(R₀/R_min)^3γ
  ── Temperature:         T_collapse ~ T∞·(R₀/R_min)^(3(γ-1))
  ── Sonoluminescence:    Photons from plasma at T > 20,000 K
  ── Plasmoid:            Self-contained plasma structure, ∇×B ≠ 0
  ── Magnetic moment:     μ = I·A  (current loop in plasmoid)
  ── Energy harvest:      E = ½·L·I²  (inductive coupling)
═══════════════════════════════════════════════════════════════*/
import { useRef, useEffect, useState, useCallback } from "react";
import omniFlow from "@assets/72D555D1-E91E-4B74-A73B-4628B8538AA1_1784561445345.png";
import magStorm from "@assets/A6805E91-9684-4C59-BFC8-482EF421381D_1784561445345.png";
import skyrmion from "@assets/IMG_4534_1784561445345.png";

const P={
  bg:"#000a12",panel:"#000f1a",panel2:"#001220",
  ivory:"#e0f8ff",dim:"rgba(224,248,255,0.55)",muted:"rgba(224,248,255,0.28)",
  line:"rgba(0,200,255,0.08)",
  cyan:"#22d3ee",teal:"#2dd4bf",blue:"#60a5fa",
  violet:"#a78bfa",gold:"#fbbf24",orange:"#f97316",
  rose:"#f472b6",green:"#4ade80",white:"#ffffff",
};

function Tag({label,color=P.cyan}:{label:string;color?:string}){
  return <div style={{fontSize:9,fontWeight:700,color,letterSpacing:2,textTransform:"uppercase" as const,marginBottom:10}}>{label}</div>;
}
function Divider(){return <div style={{height:1,background:P.line,margin:"44px 0"}}/>;}
function Card({title,body,color=P.cyan,sub}:{title:string;body:string;color?:string;sub?:string}){
  return(
    <div style={{padding:"13px 15px",background:P.panel,borderRadius:10,border:`1px solid ${color}18`}}>
      {sub&&<div style={{fontSize:9,color,letterSpacing:1.2,marginBottom:4,textTransform:"uppercase" as const}}>{sub}</div>}
      <div style={{fontSize:11,fontWeight:700,color,letterSpacing:.5,marginBottom:6,textTransform:"uppercase" as const}}>{title}</div>
      <div style={{fontSize:12,color:P.dim,lineHeight:1.85}}>{body}</div>
    </div>
  );
}
function EqBlock({label,eq,note,color=P.cyan}:{label:string;eq:string;note?:string;color?:string}){
  return(
    <div style={{padding:"12px 16px",background:P.panel2,borderRadius:9,border:`1px solid ${color}20`,marginBottom:10}}>
      <div style={{fontSize:9,color:P.muted,marginBottom:4,letterSpacing:1}}>{label}</div>
      <pre style={{fontSize:12,fontFamily:"monospace",color,lineHeight:1.9,margin:0,whiteSpace:"pre-wrap"}}>{eq}</pre>
      {note&&<div style={{fontSize:11,color:P.dim,marginTop:6,lineHeight:1.75}}>{note}</div>}
    </div>
  );
}

/* ── CANVAS 1: Bubble lifecycle — growth, collapse, flash ── */
function BubbleCanvas(){
  const ref=useRef<HTMLCanvasElement>(null);
  const freqRef=useRef(1.0);
  const ampRef=useRef(1.0);
  const clickRef=useRef<{x:number;y:number}|null>(null);
  const [freq,setFreq]=useState(1.0);
  const [amp,setAmp]=useState(1.0);
  useEffect(()=>{freqRef.current=freq;},[freq]);
  useEffect(()=>{ampRef.current=amp;},[amp]);

  const handleClick=useCallback((e:React.MouseEvent<HTMLCanvasElement>)=>{
    const cv=ref.current;if(!cv)return;
    const r=cv.getBoundingClientRect();
    clickRef.current={x:e.clientX-r.left,y:e.clientY-r.top};
  },[]);

  useEffect(()=>{
    const cv=ref.current;if(!cv)return;
    const ctx=cv.getContext("2d")!;
    let raf=0,t=0;
    const ro=new ResizeObserver(()=>{cv.width=cv.offsetWidth;cv.height=cv.offsetHeight;});
    ro.observe(cv);cv.width=cv.offsetWidth;cv.height=cv.offsetHeight;

    // Active bubbles
    type Bubble={x:number;y:number;R:number;R0:number;phase:number;age:number;collapsed:boolean;flashLife:number;plasmoid:boolean};
    const bubbles:Bubble[]=[];

    function spawnBubble(x:number,y:number){
      const R0=(20+Math.random()*30)*ampRef.current;
      bubbles.push({x,y,R:R0,R0,phase:0,age:0,collapsed:false,flashLife:0,plasmoid:Math.random()<0.3});
    }

    // Pre-spawn some
    function initBubbles(W:number,H:number){
      for(let i=0;i<6;i++)spawnBubble(W*0.2+Math.random()*W*0.6,H*0.25+Math.random()*H*0.5);
    }

    let W2=cv.width,H2=cv.height;
    initBubbles(W2,H2);

    function draw(){
      W2=cv.width;H2=cv.height;
      ctx.clearRect(0,0,W2,H2);

      // Water background gradient
      const bgGrd=ctx.createLinearGradient(0,0,0,H2);
      bgGrd.addColorStop(0,"#000a12");bgGrd.addColorStop(1,"#001830");
      ctx.fillStyle=bgGrd;ctx.fillRect(0,0,W2,H2);

      // Acoustic pressure wave visualization
      const fv=freqRef.current;
      for(let y=0;y<H2;y+=2){
        const pressure=Math.sin(y*0.05+t*0.06*fv)*0.5+0.5;
        ctx.fillStyle=`rgba(0,100,200,${pressure*0.04})`;
        ctx.fillRect(0,y,W2,2);
      }

      // Spawn from click
      if(clickRef.current){
        spawnBubble(clickRef.current.x,clickRef.current.y);
        clickRef.current=null;
      }

      // Auto-spawn
      if(t%Math.round(40/fv)===0&&bubbles.length<20){
        spawnBubble(W2*0.15+Math.random()*W2*0.7,H2*0.2+Math.random()*H2*0.6);
      }

      // Update and draw bubbles
      for(let i=bubbles.length-1;i>=0;i--){
        const b=bubbles[i];
        b.age+=0.016*fv;

        if(!b.collapsed){
          // Rayleigh-Plesset simplified: sinusoidal collapse
          const phase=b.age%(2/fv);
          const normPhase=phase/(2/fv);
          // Growth: 0→0.4, stable: 0.4→0.7, collapse: 0.7→1
          if(normPhase<0.4)b.R=b.R0*(0.3+normPhase*1.75);
          else if(normPhase<0.7)b.R=b.R0*1.0;
          else {
            const t3=(normPhase-0.7)/0.3;
            b.R=b.R0*(1-t3**0.5*0.95);
            if(b.R<b.R0*0.05){b.collapsed=true;b.flashLife=1;b.R=0;}
          }
        }

        if(b.collapsed){
          b.flashLife-=0.05;
          if(b.flashLife<=0){bubbles.splice(i,1);continue;}
          // Flash
          const fl=b.flashLife;
          const T_norm=fl; // temperature proxy
          // Sonoluminescence colour: blue-white at peak (T~20000K → blue)
          const r2=Math.round(100+fl*155),g2=Math.round(180+fl*75),bv=255;
          const grd=ctx.createRadialGradient(b.x,b.y,0,b.x,b.y,b.R0*2*fl);
          grd.addColorStop(0,`rgba(${r2},${g2},${bv},${fl*0.95})`);
          grd.addColorStop(0.4,`rgba(${r2},${g2},${bv},${fl*0.4})`);
          grd.addColorStop(1,`rgba(${r2},${g2},${bv},0)`);
          ctx.fillStyle=grd;ctx.beginPath();ctx.arc(b.x,b.y,b.R0*2*fl,0,Math.PI*2);ctx.fill();
          // Plasmoid ring (if flagged)
          if(b.plasmoid&&fl>0.3){
            const ringR=b.R0*(1.5+fl);
            ctx.strokeStyle=`rgba(160,200,255,${(fl-0.3)*0.8})`;ctx.lineWidth=2;
            ctx.beginPath();ctx.arc(b.x,b.y,ringR,0,Math.PI*2);ctx.stroke();
            ctx.fillStyle=`rgba(160,200,255,${(fl-0.3)*0.5})`;ctx.font="bold 7px monospace";ctx.textAlign="center";
            ctx.fillText("PLASMOID",b.x,b.y-ringR-6);
          }
          // Shockwave ring
          const swr=b.R0*(2+2*(1-fl));
          ctx.strokeStyle=`rgba(0,200,255,${fl*0.4})`;ctx.lineWidth=1;
          ctx.beginPath();ctx.arc(b.x,b.y,swr,0,Math.PI*2);ctx.stroke();
          continue;
        }

        if(b.R<=0)continue;

        // Draw bubble
        const grd=ctx.createRadialGradient(b.x-b.R*0.3,b.y-b.R*0.3,0,b.x,b.y,b.R);
        grd.addColorStop(0,"rgba(200,240,255,0.15)");
        grd.addColorStop(0.6,"rgba(0,150,200,0.08)");
        grd.addColorStop(0.9,"rgba(0,120,180,0.25)");
        grd.addColorStop(1,"rgba(0,80,150,0.4)");
        ctx.fillStyle=grd;ctx.beginPath();ctx.arc(b.x,b.y,b.R,0,Math.PI*2);ctx.fill();
        ctx.strokeStyle="rgba(100,220,255,0.5)";ctx.lineWidth=1;
        ctx.beginPath();ctx.arc(b.x,b.y,b.R,0,Math.PI*2);ctx.stroke();
        // Bubble shine
        ctx.fillStyle="rgba(255,255,255,0.25)";ctx.beginPath();
        ctx.ellipse(b.x-b.R*0.35,b.y-b.R*0.35,b.R*0.25,b.R*0.15,-0.4,0,Math.PI*2);ctx.fill();

        // R/R0 readout on large bubbles
        if(b.R>12){
          ctx.fillStyle=P.cyan+"88";ctx.font="6px monospace";ctx.textAlign="center";
          ctx.fillText(`R/R0=${(b.R/b.R0).toFixed(2)}`,b.x,b.y+b.R+12);
        }
      }

      // Energy harvest panel (right side)
      const hX=W2*0.82,hY=30,hW=W2*0.16,hH=H2-60;
      ctx.fillStyle=P.panel2+"cc";ctx.fillRect(hX,hY,hW,hH);
      ctx.strokeStyle=P.cyan+"30";ctx.lineWidth=0.8;ctx.strokeRect(hX,hY,hW,hH);
      const flashCount=bubbles.filter(b=>b.collapsed&&b.flashLife>0.5).length;
      const energyProxy=Math.min(1,flashCount/3);
      ctx.fillStyle=P.cyan+"44";ctx.fillRect(hX+8,hY+hH*0.3,hW-16,hH*0.55);
      ctx.fillStyle=P.gold;ctx.fillRect(hX+8,hY+hH*0.3+hH*0.55*(1-energyProxy),hW-16,hH*0.55*energyProxy);
      ctx.fillStyle=P.cyan;ctx.font="bold 7px monospace";ctx.textAlign="center";
      ctx.fillText("HARVEST",hX+hW/2,hY+16);ctx.fillText("ENERGY",hX+hW/2,hY+26);
      ctx.fillStyle=P.gold;ctx.font="bold 9px monospace";
      ctx.fillText((energyProxy*100).toFixed(0)+"%",hX+hW/2,hY+hH*0.9);
      ctx.fillStyle=P.muted;ctx.font="6.5px monospace";
      ctx.fillText(`${flashCount} flash`,hX+hW/2,hY+hH*0.9+12);

      ctx.fillStyle=P.cyan;ctx.font="bold 8px monospace";ctx.textAlign="left";
      ctx.fillText("CAVITATION · BUBBLE COLLAPSE · SONOLUMINESCENCE · PLASMOID · CLICK TO SPAWN",8,14);
      ctx.fillStyle=P.muted;ctx.font="7px monospace";
      ctx.fillText(`${bubbles.length} bubbles · blue-white flash = sonoluminescence (T > 20,000K) · ring = plasmoid · shock ring = shockwave`,8,H2-6);

      t++;raf=requestAnimationFrame(draw);
    }
    draw();
    return()=>{cancelAnimationFrame(raf);ro.disconnect();};
  },[]);

  return(
    <div style={{border:`1px solid ${P.line}`,borderRadius:12,overflow:"hidden",marginBottom:28}}>
      <canvas ref={ref} onClick={handleClick} style={{width:"100%",height:440,display:"block",cursor:"crosshair"}}/>
      <div style={{padding:"10px 16px",background:P.panel,display:"flex",gap:20,flexWrap:"wrap",alignItems:"center"}}>
        <div>
          <div style={{fontSize:10,color:P.cyan,marginBottom:3}}>Frequency · {freq.toFixed(1)} kHz</div>
          <input type="range" min={0.2} max={4} step={0.1} value={freq} onChange={e=>setFreq(+e.target.value)} style={{width:130}}/>
        </div>
        <div>
          <div style={{fontSize:10,color:P.cyan,marginBottom:3}}>Amplitude · {amp.toFixed(1)}×</div>
          <input type="range" min={0.3} max={3} step={0.1} value={amp} onChange={e=>setAmp(+e.target.value)} style={{width:130}}/>
        </div>
        <div style={{fontSize:11,color:P.dim,lineHeight:1.85,maxWidth:450}}>
          <strong style={{color:P.cyan}}>Click</strong> to spawn a bubble. Blue-white flash = sonoluminescence at collapse (T ~ 20,000K). Glowing ring = plasmoid formation (self-contained magnetic plasma). Shockwave ring = radiated pressure pulse. Increase frequency for faster collapse cycles. Energy harvest bar shows yield from simultaneous flashes.
        </div>
      </div>
    </div>
  );
}

/* ── CANVAS 2: Plasmoid structure and magnetic self-confinement ── */
function PlasmoidCanvas(){
  const ref=useRef<HTMLCanvasElement>(null);
  const currentRef=useRef(1.0);
  const [current,setCurrent]=useState(1.0);
  useEffect(()=>{currentRef.current=current;},[current]);

  useEffect(()=>{
    const cv=ref.current;if(!cv)return;
    const ctx=cv.getContext("2d")!;
    let raf=0,t=0;
    const ro=new ResizeObserver(()=>{cv.width=cv.offsetWidth;cv.height=cv.offsetHeight;});
    ro.observe(cv);cv.width=cv.offsetWidth;cv.height=cv.offsetHeight;

    function draw(){
      const W=cv.width,H=cv.height;
      ctx.clearRect(0,0,W,H);ctx.fillStyle=P.bg;ctx.fillRect(0,0,W,H);

      const I=currentRef.current;
      const cx=W/2,cy=H/2;
      const R=Math.min(W,H)*0.22;

      // ── Magnetic field lines (poloidal) ───────────────────
      // B_tor: toroidal field lines circling inside the plasmoid
      for(let fi=0;fi<12;fi++){
        const frac=fi/12;
        const ang=frac*Math.PI*2;
        const r2=R*(0.5+frac*0.5);
        const col=`hsl(${200+frac*80},80%,${50+frac*20}%)`;
        ctx.strokeStyle=col+Math.round(60+frac*120).toString(16).padStart(2,"0");ctx.lineWidth=1.5;
        ctx.beginPath();
        ctx.ellipse(cx,cy,r2,r2*0.35,ang+t*0.015,0,Math.PI*2);ctx.stroke();
      }

      // ── Plasmoid torus body ───────────────────────────────
      const plasmoidGrd=ctx.createRadialGradient(cx,cy,0,cx,cy,R);
      plasmoidGrd.addColorStop(0,"rgba(0,180,255,0.0)");
      plasmoidGrd.addColorStop(0.5,"rgba(0,150,255,0.06)");
      plasmoidGrd.addColorStop(0.8,"rgba(80,200,255,0.15)");
      plasmoidGrd.addColorStop(1,"rgba(100,220,255,0.0)");
      ctx.fillStyle=plasmoidGrd;ctx.beginPath();ctx.arc(cx,cy,R,0,Math.PI*2);ctx.fill();

      // ── Toroidal current loop ─────────────────────────────
      const numSeg=48;
      for(let si=0;si<numSeg;si++){
        const a1=(si/numSeg)*Math.PI*2,a2=((si+1)/numSeg)*Math.PI*2;
        const ax=cx+R*Math.cos(a1),ay=cy+R*Math.sin(a1)*0.4;
        const bx=cx+R*Math.cos(a2),by=cy+R*Math.sin(a2)*0.4;
        const pulse=0.7+0.3*Math.sin(t*0.06+si*0.3);
        ctx.strokeStyle=`rgba(255,${Math.round(140+I*20)},0,${pulse*I*0.6})`;ctx.lineWidth=3*I*pulse;
        ctx.beginPath();ctx.moveTo(ax,ay);ctx.lineTo(bx,by);ctx.stroke();
        // Current flow dots
        if(si%4===0){
          const dotPos=(t*0.02*I+si/numSeg)%1;
          const dx=cx+R*Math.cos(dotPos*Math.PI*2),dy=cy+R*Math.sin(dotPos*Math.PI*2)*0.4;
          ctx.fillStyle=P.gold;ctx.beginPath();ctx.arc(dx,dy,3,0,Math.PI*2);ctx.fill();
        }
      }

      // ── Magnetic moment arrow (vertical, into page / out) ──
      const muArrowLen=R*0.7;
      ctx.strokeStyle=P.violet;ctx.lineWidth=2;
      ctx.beginPath();ctx.moveTo(cx,cy+muArrowLen);ctx.lineTo(cx,cy-muArrowLen);ctx.stroke();
      ctx.fillStyle=P.violet;
      ctx.beginPath();ctx.moveTo(cx,cy-muArrowLen);ctx.lineTo(cx-7,cy-muArrowLen+12);ctx.lineTo(cx+7,cy-muArrowLen+12);ctx.closePath();ctx.fill();
      ctx.fillStyle=P.violet;ctx.font="bold 8px monospace";ctx.textAlign="center";
      ctx.fillText("μ = I·A",cx,cy-muArrowLen-8);

      // ── Energy readout ────────────────────────────────────
      const L=1e-6; // 1 μH inductance
      const Iamp=I*1000; // Amps
      const E_stored=0.5*L*Iamp**2;
      ctx.fillStyle=P.panel2;ctx.fillRect(W-180,20,170,110);
      ctx.strokeStyle=P.cyan+"30";ctx.lineWidth=0.8;ctx.strokeRect(W-180,20,170,110);
      ctx.fillStyle=P.cyan;ctx.font="bold 8px monospace";ctx.textAlign="left";
      ctx.fillText("PLASMOID STATE",W-175,36);
      [[`I = ${(Iamp).toFixed(0)} A`,P.gold],[`μ = ${(I*Math.PI*R**2*1e-4).toFixed(2)} A·m²`,P.violet],[`E = ½LI² = ${E_stored.toFixed(1)} mJ`,P.green],[`B_tor ∝ I/R`,P.cyan],[`Self-confined: yes`,P.teal]].forEach(([l,c],i)=>{
        ctx.fillStyle=c as string;ctx.font="7px monospace";ctx.fillText(l as string,W-175,52+i*11);
      });

      // ── Field strength heat map ───────────────────────────
      // Poloidal field magnitude as colour haze
      for(let angle=0;angle<Math.PI*2;angle+=0.08){
        const BField=I*(R/Math.max(1,R*0.3))*0.5;
        const fx=cx+R*1.2*Math.cos(angle),fy=cy+R*0.5*Math.sin(angle);
        const strength=BField/(1+((fx-cx)**2+(fy-cy)**2)/(R*R));
        ctx.fillStyle=`rgba(0,180,255,${Math.min(0.15,strength*0.08)})`;
        ctx.beginPath();ctx.arc(fx,fy,8,0,Math.PI*2);ctx.fill();
      }

      // Labels
      ctx.fillStyle=P.cyan;ctx.font="bold 8px monospace";ctx.textAlign="left";
      ctx.fillText("PLASMOID · SELF-CONFINED MAGNETIC TORUS · ∇×B ≠ 0 · TOROIDAL CURRENT",8,14);
      ctx.fillStyle=P.muted;ctx.font="7px monospace";
      ctx.fillText("Gold ring = toroidal current I · Field lines = poloidal B · Violet arrow = magnetic moment μ",8,H-6);

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
          <div style={{fontSize:10,color:P.gold,marginBottom:3}}>Current I · {current.toFixed(1)} kA</div>
          <input type="range" min={0.1} max={5} step={0.1} value={current} onChange={e=>setCurrent(+e.target.value)} style={{width:140}}/>
        </div>
        <div style={{fontSize:11,color:P.dim,lineHeight:1.85,maxWidth:500}}>
          A plasmoid is a plasma torus with its own self-sustaining magnetic field. The toroidal current (gold ring) creates a poloidal field that pinches the plasma inward (z-pinch effect), balancing the outward plasma pressure. Stored energy E = ½LI². Magnetic moment μ = I·A acts as an antenna for inductive energy harvesting.
        </div>
      </div>
    </div>
  );
}

/* ── CANVAS 3: Energy harvest schematic ── */
function HarvestCanvas(){
  const ref=useRef<HTMLCanvasElement>(null);
  useEffect(()=>{
    const cv=ref.current;if(!cv)return;
    const ctx=cv.getContext("2d")!;
    let raf=0,t=0;
    const ro=new ResizeObserver(()=>{cv.width=cv.offsetWidth;cv.height=cv.offsetHeight;});
    ro.observe(cv);cv.width=cv.offsetWidth;cv.height=cv.offsetHeight;

    // Harvest stages
    const STAGES=[
      {label:"Acoustic Driver",col:P.blue,icon:"))))",x:0.08},
      {label:"Bubble Growth",col:P.teal,icon:"○",x:0.24},
      {label:"Collapse / Flash",col:P.white,icon:"✦",x:0.42},
      {label:"Plasmoid Form",col:P.violet,icon:"⊕",x:0.60},
      {label:"Inductive Coil",col:P.gold,icon:"⊗",x:0.76},
      {label:"DC Output",col:P.green,icon:"⚡",x:0.92},
    ];

    function draw(){
      const W=cv.width,H=cv.height;
      ctx.clearRect(0,0,W,H);ctx.fillStyle=P.bg;ctx.fillRect(0,0,W,H);

      // Flow line
      ctx.strokeStyle=P.cyan+"33";ctx.lineWidth=2;ctx.setLineDash([6,4]);
      ctx.beginPath();ctx.moveTo(W*0.08,H/2);ctx.lineTo(W*0.92,H/2);ctx.stroke();ctx.setLineDash([]);

      // Stage nodes
      STAGES.forEach((s,i)=>{
        const x=s.x*W,y=H/2;
        const pulse=0.8+0.2*Math.sin(t*0.04+i*1.0);
        const grd=ctx.createRadialGradient(x,y,0,x,y,28*pulse);
        grd.addColorStop(0,s.col+"99");grd.addColorStop(1,s.col+"00");
        ctx.fillStyle=grd;ctx.beginPath();ctx.arc(x,y,28*pulse,0,Math.PI*2);ctx.fill();
        ctx.fillStyle=s.col;ctx.beginPath();ctx.arc(x,y,18,0,Math.PI*2);ctx.fill();
        ctx.fillStyle="#fff";ctx.font="12px monospace";ctx.textAlign="center";ctx.fillText(s.icon,x,y+5);

        // Flow dot to next
        if(i<STAGES.length-1){
          const nx=STAGES[i+1].x*W;
          const prog=(t*0.025+i*0.18)%1;
          const dx=x+(nx-x)*prog,dy=y;
          ctx.fillStyle=s.col;ctx.beginPath();ctx.arc(dx,dy,4,0,Math.PI*2);ctx.fill();
        }

        // Label
        ctx.fillStyle=s.col;ctx.font="bold 7px monospace";ctx.textAlign="center";
        ctx.fillText(s.label,x,y+(i%2===0?-32:36));

        // Efficiency readout
        const effs=[0.85,0.7,0.6,0.9,0.8,1.0];
        const cumulativeEff=effs.slice(0,i+1).reduce((a,b)=>a*b,1);
        ctx.fillStyle=P.dim;ctx.font="6.5px monospace";
        ctx.fillText(`η = ${(cumulativeEff*100).toFixed(0)}%`,x,y+(i%2===0?-44:48));
      });

      // Energy bar below
      const barY=H*0.82,barW=W-80;
      const overallEff=0.85*0.7*0.6*0.9*0.8;
      ctx.fillStyle=P.panel2;ctx.fillRect(40,barY,barW,14);
      const grad=ctx.createLinearGradient(40,barY,40+barW*overallEff,barY+14);
      grad.addColorStop(0,P.blue);grad.addColorStop(0.4,P.cyan);grad.addColorStop(1,P.green);
      ctx.fillStyle=grad;ctx.fillRect(40,barY,barW*overallEff,14);
      ctx.fillStyle=P.ivory;ctx.font="bold 8px monospace";ctx.textAlign="center";
      ctx.fillText(`OVERALL EFFICIENCY: ${(overallEff*100).toFixed(1)}%  — acoustic→bubble→flash→plasmoid→coil→DC`,W/2,barY-5);

      // Physics annotations
      const anns=[
        {x:0.24,txt:"R max → R_min in\n91.5ms/kHz",col:P.teal},
        {x:0.42,txt:"T → 20000K\nhν emitted",col:P.white},
        {x:0.60,txt:"∇×B ≠ 0\nself-confined",col:P.violet},
        {x:0.76,txt:"ε = −dΦ/dt\ninductive EMF",col:P.gold},
      ];
      anns.forEach(a=>{
        ctx.fillStyle=a.col;ctx.font="6.5px monospace";ctx.textAlign="center";
        a.txt.split("\n").forEach((line,li)=>ctx.fillText(line,a.x*W,H*0.62+li*9));
      });

      ctx.fillStyle=P.cyan;ctx.font="bold 8px monospace";ctx.textAlign="left";
      ctx.fillText("CAVITATION ENERGY HARVEST CHAIN · ACOUSTIC DRIVER → DC OUTPUT",8,14);

      t++;raf=requestAnimationFrame(draw);
    }
    draw();
    return()=>{cancelAnimationFrame(raf);ro.disconnect();};
  },[]);
  return(
    <div style={{border:`1px solid ${P.line}`,borderRadius:12,overflow:"hidden",marginBottom:28}}>
      <canvas ref={ref} style={{width:"100%",height:330,display:"block"}}/>
    </div>
  );
}

export default function CavitationPlasmoidPage(){
  const [imgX,setImgX]=useState<number|null>(null);
  const imgs=[
    {src:omniFlow,caption:"Omni-Flow Array · Acoustic Field Uniformity",
     anno:"Efficient cavitation energy harvesting requires uniform bubble size and synchronized collapse — maximising the simultaneous flash yield. The omni-flow rhombic array is the acoustic equivalent of a phased array transducer: each rhombus cell is one transducer element, driven at the resonant frequency of the target bubble radius R₀. By controlling the phase of each element (0–2π), the array creates constructive interference at chosen points in the fluid volume, nucleating bubbles at precise locations and achieving synchronised collapse — the acoustic equivalent of a LASER (coherent emission). Disordered arrays produce spatially random cavitation, wasting most of the acoustic energy in spurious bubbles that collapse out of phase.",
     chips:["Phased Array","Constructive Interference","Coherent Collapse","Synchronised Flash","Transducer Array","Bubble Nucleation"]},
    {src:skyrmion,caption:"Plasmoid Topological Structure · Magnetic Helicity",
     anno:"A plasmoid is a topologically non-trivial magnetic structure: its field lines are linked and knotted in a way that cannot be undone without reconnection. The magnetic helicity H = ∫A·B dV is a conserved quantity — it measures the knottedness of the field. A skyrmion has the same property: topological charge Q counts the winding of the spin field. When a cavitation bubble collapses and a plasmoid forms, the magnetic helicity of the plasma is set by the vorticity of the collapse — a clockwise collapsing bubble generates positive-helicity plasmoids; counter-clockwise generates negative-helicity. Controlling the bubble spin (by rotating acoustic drivers or adding angular momentum to the fluid) allows selection of plasmoid chirality — left-handed or right-handed magnetic structures. This chirality determines which way the plasmoid drifts in an external field and thus how it couples to the harvest coil.",
     chips:["Magnetic Helicity","Topological Charge","Skyrmion Analogy","Plasmoid Chirality","Angular Momentum","Reconnection"]},
    {src:magStorm,caption:"Solar Flare · Plasmoid Ejection at Stellar Scale",
     anno:"Solar flares produce plasmoids spontaneously during magnetic reconnection: when current sheets thin to the resistive scale, the tearing instability fragments them into a chain of plasmoids, each carrying a packet of magnetic helicity and kinetic energy. The largest plasmoids escape (CMEs); the smaller ones are absorbed into the reconnection exhaust, heating the corona. The energy release rate during a solar flare (10²⁵ J in minutes) is the stellar version of cavitation energy harvest — stored magnetic energy converted to kinetic energy (plasmoid ejection), thermal energy (corona heating), and radiated energy (X-ray, UV burst). The same chain — stored energy → unstable → plasmoid formation → energy release — operates from the cavitation bubble (mm, ms) to the CME (Gm, hours).",
     chips:["Tearing Instability","Plasmoid Chain","Magnetic Reconnection","CME","Corona Heating","Energy Release Rate"]},
  ];
  return(
    <div style={{background:P.bg,color:P.ivory,minHeight:"100vh",fontFamily:"inherit"}}>
      <div style={{maxWidth:1060,margin:"0 auto",padding:"52px 32px 36px"}}>
        <Tag label="Cavitation · Plasmoid Harvesting · Sonoluminescence · Rayleigh Collapse · Magnetic Self-Confinement · Inductive Energy Extraction"/>
        <h1 style={{fontSize:34,fontWeight:800,lineHeight:1.1,margin:"8px 0 14px",letterSpacing:-0.5}}>
          <span style={{color:P.cyan}}>Bubble Collapse</span><br/>
          <span style={{color:P.violet}}>Plasma Formation</span> <span style={{color:P.gold}}>Energy Harvest</span>
        </h1>
        <h2 style={{fontSize:18,fontWeight:400,color:"#bae6fd",margin:"0 0 18px",lineHeight:1.5}}>
          Cavitation bubbles collapse to temperatures hotter than the sun's surface · the plasma flash forms a self-confined plasmoid · inductive coils harvest the magnetic energy
        </h2>
        <p style={{fontSize:14,color:P.dim,lineHeight:1.9,maxWidth:780,marginBottom:20}}>
          When a cavitation bubble collapses, the inertia of the surrounding water drives the wall inward at several hundred metres per second. The gas inside compresses adiabatically — pressure rises to thousands of atmospheres, temperature peaks above 20,000 K. At that temperature the gas fully ionises, emitting a picosecond flash of blue-white light (sonoluminescence). If the collapse is asymmetric (near a surface, or with angular momentum), the plasma can form a self-confined toroidal structure — a plasmoid — carrying its own magnetic moment. This plasmoid can be harvested inductively: as it decays, its changing flux induces an EMF in a surrounding coil.
        </p>
      </div>
      <Divider/>
      <div style={{maxWidth:1060,margin:"0 auto",padding:"0 32px 48px"}}>
        <Tag label="Section I · Bubble Lifecycle · Growth → Collapse → Flash → Plasmoid · Click to Spawn" color={P.cyan}/>
        <h2 style={{fontSize:22,fontWeight:700,color:P.cyan,margin:"0 0 12px"}}>Live Cavitation Field · Rayleigh Collapse · Sonoluminescence</h2>
        <BubbleCanvas/>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:14}}>
          <EqBlock label="RAYLEIGH COLLAPSE" color={P.cyan}
            eq={"Collapse time: t_c = 0.915·R₀·√(ρ/P∞)\n\nFor R₀=50μm, P∞=1atm, ρ=1000 kg/m³:\nt_c ≈ 4.6 μs\n\nPressure at collapse:\nP_max = P∞·(R₀/R_min)^{3γ}\n\nFor R₀/R_min = 10, γ=1.4:\nP_max ≈ 5.6 × 10³ atm\n\nTemperature:\nT_max = T∞·(R₀/R_min)^{3(γ-1)}\n≈ 50,000 K (above solar surface)"}
            note="The adiabatic compression of the bubble contents during Rayleigh collapse concentrates energy by a factor of (R₀/R_min)³. At R_min/R₀ = 0.05 (measured experimentally), this is a factor of ~8000."/>
          <EqBlock label="SONOLUMINESCENCE" color={P.violet}
            eq={"Flash duration: τ ≈ 50–300 ps (picoseconds)\nPeak T: 6,000–25,000 K (estimates vary)\nPhoton emission: hν = kT (Planck spectrum)\n\nFor T=20000K: peak λ = 144 nm (UV)\nVisible light from blue tail of blackbody.\n\nPower: P ≈ 10 mW (single bubble, steady)\nCorresponding T: ~6000K (conservative)\n\nPhoton count per flash:\nN ≈ 10⁷ photons (estimated)\nEnergy per flash: E ≈ 10 pJ"}
            note="Sonoluminescence remains partially unexplained. The flash is too short (picoseconds) and too bright for thermal radiation at any reasonable temperature — some researchers propose quantum vacuum (Casimir) effects contribute. The blue colour is consistent with ≥5000K blackbody radiation."/>
        </div>
      </div>
      <Divider/>
      <div style={{maxWidth:1060,margin:"0 auto",padding:"0 32px 48px"}}>
        <Tag label="Section II · Plasmoid Structure · Toroidal Current · Magnetic Self-Confinement · ∇×B ≠ 0" color={P.violet}/>
        <h2 style={{fontSize:22,fontWeight:700,color:P.violet,margin:"0 0 12px"}}>Self-Confined Magnetic Plasma Torus</h2>
        <PlasmoidCanvas/>
        <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(185px,1fr))",gap:12}}>
          <Card title="Toroidal Current" sub="j × B pinch" color={P.gold} body="Current flowing in a ring generates a poloidal magnetic field (like a solenoid bent into a torus). The j×B force on the current is directed inward (the z-pinch or θ-pinch), compressing the plasma against its own thermal pressure. Self-confinement requires the pinch force to balance: B²/2μ₀ = nkT."/>
          <Card title="Magnetic Helicity" sub="H = ∫A·B dV" color={P.violet} body="Plasmoids carry net magnetic helicity — a measure of how the field lines are knotted. Helicity is conserved even during reconnection (Taylor relaxation). A plasmoid that escapes a reconnection site carries its helicity with it and injects it into the surrounding medium — helicity injection is how the solar corona is heated."/>
          <Card title="Inductive Harvest" sub="ε = −dΦ/dt" color={P.cyan} body="As the plasmoid decays (resistive dissipation), its toroidal flux Φ decreases. A surrounding inductive coil sees dΦ/dt and generates an EMF ε = −dΦ/dt. The harvested energy is E = ½LI² where L is the plasmoid self-inductance and I is the peak current. A 1 kA plasmoid at 1 μH contains 0.5 J."/>
          <Card title="Sonofusion Claim" sub="disputed" color={P.rose} body="In 2002, Taleyarkhan et al. claimed neutron production during acoustic cavitation of deuterated acetone — implying nuclear fusion in the collapsed bubble. The claim has not been independently reproduced and is widely considered an artefact. The temperature during Rayleigh collapse is insufficient for D-D fusion (requires >10⁸ K)."/>
        </div>
      </div>
      <Divider/>
      <div style={{maxWidth:1060,margin:"0 auto",padding:"0 32px 48px"}}>
        <Tag label="Section III · Energy Harvest Chain · Acoustic Driver → DC Output" color={P.gold}/>
        <h2 style={{fontSize:22,fontWeight:700,color:P.gold,margin:"0 0 12px"}}>Complete Harvest Architecture</h2>
        <HarvestCanvas/>
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
        <div style={{padding:"20px 24px",background:P.panel2,borderRadius:14,border:`1px solid ${P.cyan}15`,marginBottom:24}}>
          <div style={{fontSize:14,color:P.ivory,lineHeight:2.0}}>
            The cavitation bubble is a <em style={{color:P.cyan}}>coherence engine</em>: it concentrates disorder (random acoustic energy in water) into a single ultra-brief, ultra-intense ordered event (the collapse flash and plasmoid). The energy density at collapse exceeds anything achievable in macroscopic machines — not because of exotic physics, but because of geometry: all inertia of the water converges to a point. In AETHER, this is the LPE threshold event: the coherence field C(x,t) rises to 1 at the collapse point, then the system transitions into a new phase (the plasmoid). The plasmoid is not the energy source — it is the <em style={{color:P.gold}}>memory</em> of the transition, carrying the topology and helicity of the collapse event as a stable magnetic structure that can be read out inductively.
          </div>
        </div>
        <div style={{display:"flex",gap:8,flexWrap:"wrap"}}>
          {["/ionization-plasma","/electric-breakdown","/aether-engine","/electron-field","/gobekli-plasma","/quantum-ammeter","/plasma-confinement"].map(href=>(
            <a key={href} href={href} style={{padding:"6px 12px",borderRadius:8,border:`1px solid ${P.line}`,color:P.dim,fontSize:11,textDecoration:"none"}}>{href.replace("/","").replace(/-/g," ")} →</a>
          ))}
        </div>
      </div>
    </div>
  );
}
