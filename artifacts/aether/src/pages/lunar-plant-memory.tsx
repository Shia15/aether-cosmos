import React, { useEffect, useRef } from "react";

const TAU=Math.PI*2, PI=Math.PI;
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

/* ─────────────────────────────────────────────────────────────────────────
   CANVAS 1 · Lunar Terminator · Day/Night Boundary · 13 · Levitation · Microchip
   ───────────────────────────────────────────────────────────────────────── */
function LunarTerminatorCanvas(){
  const ref=useRef<HTMLCanvasElement>(null);
  useEffect(()=>{
    const cv=ref.current; if(!cv) return;
    const CH=440;
    cv.width=CW; cv.height=CH;
    const ctx=cv.getContext("2d")!;

    const MX=CW*0.38, MY=CH*0.50, MR=CH*0.40;

    let t=0, raf=0;

    const draw=()=>{
      ctx.clearRect(0,0,CW,CH);
      ctx.fillStyle=V.bg; ctx.fillRect(0,0,CW,CH);

      /* Stars */
      for(let s=0;s<80;s++){
        const sx=(s*97+13)%CW, sy=(s*53+7)%(CH);
        if(sx>MX-MR-10 && sx<MX+MR+10 && sy>MY-MR-10 && sy<MY+MR+10) continue;
        ctx.beginPath(); ctx.arc(sx,sy,0.6+s%3*0.4,0,TAU);
        ctx.fillStyle=`rgba(200,210,240,${0.3+s%4*0.1})`; ctx.fill();
      }

      /* ── MOON SPHERE ── */
      ctx.save();
      ctx.beginPath(); ctx.arc(MX,MY,MR,0,TAU); ctx.clip();

      /* Moon surface base */
      const moonG=ctx.createRadialGradient(MX+MR*0.3,MY-MR*0.2,4,MX,MY,MR);
      moonG.addColorStop(0,"#E8E2D8"); moonG.addColorStop(0.5,"#C0BAAE");
      moonG.addColorStop(0.8,"#8A8278"); moonG.addColorStop(1,"#5A5450");
      ctx.fillStyle=moonG; ctx.fillRect(MX-MR,MY-MR,MR*2,MR*2);

      /* Surface craters */
      const CRATERS=[
        {fx:-0.2,fy:-0.25,r:0.12},{fx:0.1,fy:0.30,r:0.09},
        {fx:-0.35,fy:0.10,r:0.07},{fx:0.28,fy:-0.15,r:0.06},
        {fx:-0.05,fy:-0.38,r:0.08},{fx:0.22,fy:0.22,r:0.10},
      ];
      CRATERS.forEach(c=>{
        const cx2=MX+c.fx*MR, cy2=MY+c.fy*MR, cr=c.r*MR;
        ctx.beginPath(); ctx.arc(cx2,cy2,cr,0,TAU);
        ctx.fillStyle="rgba(80,75,68,0.35)"; ctx.fill();
        ctx.strokeStyle="rgba(180,170,160,0.3)"; ctx.lineWidth=1; ctx.stroke();
      });

      /* Night shadow — animated terminator position */
      const termXOffset=Math.sin(t*0.04)*MR*0.55; /* oscillates: crescent→half→gibbous */
      const termX=MX+termXOffset;

      /* Hard night fill to the left of terminator */
      ctx.fillStyle="rgba(2,4,14,0.96)";
      ctx.fillRect(MX-MR,MY-MR,termX-MX+MR,MR*2);

      /* Soft terminator gradient (the levitation zone) */
      const termW=42;
      const levG=ctx.createLinearGradient(termX-termW,MY,termX+termW*0.6,MY);
      levG.addColorStop(0,"rgba(2,4,14,0.97)");
      levG.addColorStop(0.35,"rgba(2,4,14,0.70)");
      levG.addColorStop(0.7,"rgba(2,4,14,0.12)");
      levG.addColorStop(1,"rgba(2,4,14,0)");
      ctx.fillStyle=levG; ctx.fillRect(termX-termW,MY-MR,termW*1.6,MR*2);

      ctx.restore();

      /* Moon rim */
      ctx.beginPath(); ctx.arc(MX,MY,MR,0,TAU);
      ctx.strokeStyle="rgba(180,175,165,0.18)"; ctx.lineWidth=1.5; ctx.stroke();

      /* ── LEVITATION ANNOTATION at terminator ── */
      const termXScreen=MX+termXOffset;
      ctx.strokeStyle=V.photon+"55"; ctx.lineWidth=0.8; ctx.setLineDash([3,3]);
      ctx.beginPath(); ctx.moveTo(termXScreen,MY-MR); ctx.lineTo(termXScreen,MY+MR); ctx.stroke();
      ctx.setLineDash([]);
      /* Levitating objects in the terminator zone (long shadows) */
      for(let lev=0;lev<4;lev++){
        const ly=MY-MR*0.6+lev*(MR*0.35);
        const lx=termXScreen+8+Math.sin(t*0.5+lev)*4;
        /* Object (small boulder) */
        ctx.beginPath(); ctx.ellipse(lx,ly,5,4,0,0,TAU);
        ctx.fillStyle="#C8C2B8AA"; ctx.fill();
        /* Long horizontal shadow (characteristic of terminator zones) */
        const shadLen=40+lev*8;
        const shadG=ctx.createLinearGradient(lx-shadLen,ly,lx+5,ly);
        shadG.addColorStop(0,"transparent"); shadG.addColorStop(1,"rgba(0,0,8,0.55)");
        ctx.fillStyle=shadG;
        ctx.fillRect(lx-shadLen,ly+2,shadLen,4);
      }
      ctx.fillStyle=V.photon+"BB"; ctx.font=`700 8px ${V.mono}`; ctx.textAlign="center";
      ctx.fillText("TERMINATOR",termXScreen,MY+MR+14);
      ctx.fillStyle=V.photon+"77"; ctx.font=`7px ${V.mono}`;
      ctx.fillText("DAY / NIGHT · LEVITATION BOUNDARY",termXScreen,MY+MR+25);

      /* ── 13 LUNAR MONTHS RING ── */
      const RING_R=MR+50;
      for(let mi=0;mi<13;mi++){
        const a=(mi/13)*TAU-PI/2;
        const mx=MX+RING_R*Math.cos(a), my=MY+RING_R*Math.sin(a);
        /* Mini phase disc */
        const phFrac=mi/13;
        ctx.beginPath(); ctx.arc(mx,my,7,0,TAU);
        ctx.fillStyle="#1A1814"; ctx.fill();
        ctx.strokeStyle=V.gold+"44"; ctx.lineWidth=0.8; ctx.stroke();
        /* Mini lit side */
        ctx.save(); ctx.beginPath(); ctx.arc(mx,my,6,0,TAU); ctx.clip();
        ctx.fillStyle="#A8A298";
        ctx.fillRect(mx,my-7,7,14); /* right half lit */
        ctx.restore();
        /* Label */
        if(mi===0){
          ctx.fillStyle=V.gold+"CC"; ctx.font=`700 8px ${V.mono}`; ctx.textAlign="center";
          ctx.fillText("13",mx,my-12);
        }
      }
      ctx.strokeStyle=V.gold+"22"; ctx.lineWidth=0.7; ctx.setLineDash([4,5]);
      ctx.beginPath(); ctx.arc(MX,MY,RING_R,0,TAU); ctx.stroke();
      ctx.setLineDash([]);
      ctx.fillStyle=V.gold+"66"; ctx.font=`7px ${V.mono}`; ctx.textAlign="left";
      ctx.fillText("13 LUNAR MONTHS · 13×28=364 DAYS",MX+RING_R+4,MY);

      /* ── GRAVITY MICROCHIP (right panel) ── */
      const CPX=CW*0.82, CPY=CH*0.38, CPW=80, CPH=55;
      /* PCB base */
      ctx.fillStyle="#0C1A0C"; ctx.fillRect(CPX-CPW/2,CPY-CPH/2,CPW,CPH);
      ctx.strokeStyle="#22AA2244"; ctx.lineWidth=1; ctx.strokeRect(CPX-CPW/2,CPY-CPH/2,CPW,CPH);
      /* Die */
      ctx.fillStyle="#1A2A1A"; ctx.fillRect(CPX-20,CPY-16,40,32);
      ctx.strokeStyle="#44CC4444"; ctx.lineWidth=0.6; ctx.strokeRect(CPX-20,CPY-16,40,32);
      /* Grid lines on die (MEMS structure) */
      for(let gx=-2;gx<=2;gx++){
        ctx.strokeStyle="#44CC4422"; ctx.lineWidth=0.5;
        ctx.beginPath(); ctx.moveTo(CPX+gx*8,CPY-14); ctx.lineTo(CPX+gx*8,CPY+14); ctx.stroke();
      }
      for(let gy=-1;gy<=1;gy++){
        ctx.beginPath(); ctx.moveTo(CPX-18,CPY+gy*8); ctx.lineTo(CPX+18,CPY+gy*8); ctx.stroke();
      }
      /* Bond wires */
      [[-1,-1],[1,-1],[1,1],[-1,1]].forEach(([dx,dy])=>{
        ctx.strokeStyle="#CCAA4466"; ctx.lineWidth=0.8;
        ctx.beginPath(); ctx.moveTo(CPX+dx*20,CPY+dy*16);
        ctx.quadraticCurveTo(CPX+dx*30,CPY+dy*26,CPX+dx*(CPW/2-2),CPY+dy*(CPH/2-2));
        ctx.stroke();
      });
      /* Gravity field arrows below chip */
      for(let ga=0;ga<5;ga++){
        const gax=CPX-24+ga*12, gay=CPY+CPH/2+8;
        const spread=(ga-2)*0.06;
        ctx.strokeStyle=V.green+"55"; ctx.lineWidth=1;
        ctx.beginPath(); ctx.moveTo(gax,gay); ctx.lineTo(gax+spread*20,gay+18); ctx.stroke();
        ctx.beginPath(); ctx.arc(gax+spread*20,gay+18,2,0,TAU);
        ctx.fillStyle=V.green+"55"; ctx.fill();
      }
      ctx.fillStyle=V.green+"BB"; ctx.font=`700 8px ${V.mono}`; ctx.textAlign="center";
      ctx.fillText("MEMS GRAVITY CHIP",CPX,CPY-CPH/2-8);
      ctx.fillStyle=V.green+"66"; ctx.font=`7px ${V.mono}`;
      ctx.fillText("g FIELD LINES",CPX,CPY+CPH/2+36);

      /* ── LUNAR HORIZON (right lower panel) ── */
      const HX=CW*0.75, HY=CH*0.70, HW=CW*0.22, HH=CH*0.20;
      ctx.fillStyle="#0A080C"; ctx.fillRect(HX,HY,HW,HH);
      ctx.strokeStyle=V.dim+"33"; ctx.lineWidth=0.7; ctx.strokeRect(HX,HY,HW,HH);
      /* Ground */
      ctx.fillStyle="#2A2420"; ctx.fillRect(HX,HY+HH*0.65,HW,HH*0.35);
      /* Horizon line */
      ctx.strokeStyle="rgba(180,175,165,0.5)"; ctx.lineWidth=1;
      ctx.beginPath(); ctx.moveTo(HX,HY+HH*0.65); ctx.lineTo(HX+HW,HY+HH*0.65); ctx.stroke();
      /* Terminator in the sky (vertical gradient) */
      const horG=ctx.createLinearGradient(HX,HY,HX+HW,HY);
      horG.addColorStop(0,"rgba(2,4,14,0.95)");
      horG.addColorStop(0.40,"rgba(2,4,14,0.50)");
      horG.addColorStop(0.55,"rgba(2,4,14,0)");
      ctx.fillStyle=horG; ctx.fillRect(HX,HY,HW,HH*0.65);
      /* Stars in the dark half */
      for(let hs=0;hs<12;hs++){
        const hsx=HX+(hs*37)%((HW*0.4));
        const hsy=HY+4+(hs*19)%(HH*0.55);
        ctx.beginPath(); ctx.arc(hsx,hsy,0.8,0,TAU);
        ctx.fillStyle="rgba(220,220,240,0.7)"; ctx.fill();
      }
      /* Sun just below horizon */
      const sunG2=ctx.createRadialGradient(HX+HW*0.55,HY+HH*0.65,1,HX+HW*0.55,HY+HH*0.72,18);
      sunG2.addColorStop(0,"rgba(255,240,180,0.6)"); sunG2.addColorStop(1,"transparent");
      ctx.fillStyle=sunG2; ctx.fillRect(HX+HW*0.3,HY+HH*0.55,HW*0.5,HH*0.4);
      ctx.fillStyle=V.ink+"88"; ctx.font=`700 7px ${V.mono}`; ctx.textAlign="center";
      ctx.fillText("NATURAL LUNAR HORIZON",HX+HW*0.5,HY+HH+10);
      ctx.fillStyle=V.photon+"66"; ctx.font=`6.5px ${V.mono}`;
      ctx.fillText("SUN PERMANENTLY AT HORIZON",HX+HW*0.5,HY+HH+20);

      ctx.fillStyle=V.ink; ctx.font=`700 10px ${V.mono}`; ctx.textAlign="left";
      ctx.fillText("LUNAR TERMINATOR · DAY/NIGHT BOUNDARY · LEVITATION · 13 MONTHS · GRAVITY CHIP",10,16);

      t+=0.016; raf=requestAnimationFrame(draw);
    };
    draw();
    return()=>cancelAnimationFrame(raf);
  },[]);
  return <canvas ref={ref} width={CW} height={440} style={{width:"100%",borderRadius:6,display:"block"}}/>;
}

/* ─────────────────────────────────────────────────────────────────────────
   CANVAS 2 · Star Blackbox · 5-Fold Infinite · The Plane · 13 Fibonacci
   ───────────────────────────────────────────────────────────────────────── */
function StarBlackboxCanvas(){
  const ref=useRef<HTMLCanvasElement>(null);
  useEffect(()=>{
    const cv=ref.current; if(!cv) return;
    const CH=380;
    cv.width=CW; cv.height=CH;
    const ctx=cv.getContext("2d")!;

    /* Fibonacci sequence including 13 */
    const FIB=[1,1,2,3,5,8,13,21,34,55];
    /* 5-fold vertices */
    const pentVerts=(cx:number,cy:number,r:number,rot:number)=>{
      const pts:{x:number;y:number}[]=[];
      for(let i=0;i<5;i++){
        const a=(i/5)*TAU+rot;
        pts.push({x:cx+r*Math.cos(a),y:cy+r*Math.sin(a)});
      }
      return pts;
    };

    let t=0, raf=0;

    const draw=()=>{
      ctx.clearRect(0,0,CW,CH);
      ctx.fillStyle=V.bg; ctx.fillRect(0,0,CW,CH);

      /* ── STAR BLACKBOX (left) ── */
      const SX=CW*0.25, SY=CH*0.48;

      /* Star corona */
      const coronaR=90;
      const coG=ctx.createRadialGradient(SX,SY,8,SX,SY,coronaR);
      coG.addColorStop(0,"rgba(255,240,150,0.0)");
      coG.addColorStop(0.3,"rgba(255,200,60,0.08)");
      coG.addColorStop(0.7,"rgba(255,120,20,0.04)");
      coG.addColorStop(1,"transparent");
      ctx.fillStyle=coG; ctx.fillRect(SX-coronaR,SY-coronaR,coronaR*2,coronaR*2);

      /* Opaque star blackbox core — YOU CANNOT SEE INSIDE */
      const coreR=42;
      ctx.beginPath(); ctx.arc(SX,SY,coreR,0,TAU);
      ctx.fillStyle="#0A0806"; ctx.fill();
      ctx.strokeStyle=V.gold+"55"; ctx.lineWidth=1.5; ctx.stroke();
      /* Blackbox label */
      ctx.fillStyle=V.gold+"99"; ctx.font=`700 8px ${V.mono}`; ctx.textAlign="center";
      ctx.fillText("BLACK",SX,SY-4);
      ctx.fillText("BOX",SX,SY+8);
      ctx.fillStyle=V.gold+"44"; ctx.font=`6.5px ${V.mono}`;
      ctx.fillText("STAR",SX,SY+18);

      /* Input arrows (hydrogen flowing in from left) */
      for(let hi=0;hi<4;hi++){
        const hy=SY-30+hi*20;
        const hx_start=SX-coreR-60, hx_end=SX-coreR-4;
        const pulse=(t*0.8+hi*0.5)%1;
        ctx.strokeStyle=V.shock+"66"; ctx.lineWidth=1.5;
        ctx.beginPath(); ctx.moveTo(hx_start,hy); ctx.lineTo(hx_end,hy); ctx.stroke();
        /* Arrowhead */
        ctx.fillStyle=V.shock+"66";
        ctx.beginPath(); ctx.moveTo(hx_end,hy); ctx.lineTo(hx_end-7,hy-4); ctx.lineTo(hx_end-7,hy+4); ctx.closePath(); ctx.fill();
        /* Particle flow dot */
        const pdot=hx_start+(hx_end-hx_start)*pulse;
        ctx.beginPath(); ctx.arc(pdot,hy,2.5,0,TAU);
        ctx.fillStyle=V.shock+"AA"; ctx.fill();
        ctx.fillStyle=V.shock+"66"; ctx.font=`7px ${V.mono}`; ctx.textAlign="right";
        ctx.fillText("H",hx_start-4,hy+3);
      }
      ctx.fillStyle=V.shock+"88"; ctx.font=`700 8px ${V.mono}`; ctx.textAlign="center";
      ctx.fillText("HYDROGEN",SX-coreR-38,SY-42);

      /* Output arrows (elements/photons flowing out from right) */
      const OUTPUTS=[
        {label:"PHOTONS",col:V.shock,dy:-30},
        {label:"He / C",col:V.photon,dy:-10},
        {label:"O / N",col:V.green,dy:10},
        {label:"Fe / Ca",col:V.fire,dy:30},
      ];
      OUTPUTS.forEach(o=>{
        const ox_start=SX+coreR+5, ox_end=SX+coreR+70;
        const pulse=(t*0.8+o.dy*0.02)%1;
        ctx.strokeStyle=o.col+"66"; ctx.lineWidth=1.5;
        ctx.beginPath(); ctx.moveTo(ox_start,SY+o.dy); ctx.lineTo(ox_end,SY+o.dy); ctx.stroke();
        ctx.beginPath(); ctx.arc(ox_start+(ox_end-ox_start)*pulse,SY+o.dy,2.5,0,TAU);
        ctx.fillStyle=o.col+"AA"; ctx.fill();
        ctx.fillStyle=o.col; ctx.font=`700 7.5px ${V.mono}`; ctx.textAlign="left";
        ctx.fillText(o.label,ox_end+4,SY+o.dy+3);
      });
      ctx.fillStyle=V.photon+"88"; ctx.font=`700 8px ${V.mono}`; ctx.textAlign="center";
      ctx.fillText("OUTPUTS",SX+coreR+42,SY-42);
      ctx.fillStyle=V.dim+"88"; ctx.font=`7px ${V.mono}`;
      ctx.fillText("INTERNAL PROCESS — UNOBSERVABLE",SX,SY+coreR+14);

      /* ── 5-FOLD INFINITY (centre-right) ── */
      const PX=CW*0.68, PY=CH*0.48;
      /* Nested pentagons — 4 levels radiating outward */
      [68,47,32,20].forEach((r,level)=>{
        const alpha=0.55-level*0.1;
        const rot2=t*0.06*(level%2===0?1:-1)-PI/2;
        const pts=pentVerts(PX,PY,r*(0.96+Math.sin(t*0.3+level)*0.04),rot2);
        ctx.beginPath();
        pts.forEach((p,i)=>i===0?ctx.moveTo(p.x,p.y):ctx.lineTo(p.x,p.y));
        ctx.closePath();
        const col=level===0?V.gold:level===1?V.green:level===2?V.cyan:V.vio;
        ctx.strokeStyle=col+`${(alpha*255)|0}`.padStart(2,"0").replace(/[^a-f0-9]/gi,"AA").slice(0,2);
        ctx.strokeStyle=`rgba(${parseInt(col.slice(1,3),16)},${parseInt(col.slice(3,5),16)},${parseInt(col.slice(5,7),16)},${alpha})`;
        ctx.lineWidth=1.5-level*0.2;
        ctx.stroke();
        /* Fill each vertex with a micro-circle */
        pts.forEach(p=>{
          ctx.beginPath(); ctx.arc(p.x,p.y,2.5-level*0.4,0,TAU);
          ctx.fillStyle=col+(level===0?"CC":"77"); ctx.fill();
        });
      });
      /* Radiating lines from pentagon into infinity */
      const outerPts=pentVerts(PX,PY,90,-PI/2);
      outerPts.forEach(p=>{
        const lineG=ctx.createLinearGradient(PX,PY,p.x,p.y);
        lineG.addColorStop(0,"transparent"); lineG.addColorStop(0.5,V.gold+"22"); lineG.addColorStop(1,"transparent");
        ctx.strokeStyle=lineG; ctx.lineWidth=0.8;
        ctx.beginPath(); ctx.moveTo(PX,PY); ctx.lineTo(p.x,p.y); ctx.stroke();
      });
      ctx.fillStyle=V.gold+"CC"; ctx.font=`700 9px ${V.mono}`; ctx.textAlign="center";
      ctx.fillText("5 FULL OF NATURE",PX,PY+90);
      ctx.fillStyle=V.gold+"77"; ctx.font=`8px ${V.mono}`;
      ctx.fillText("UNLOCKS THE INFINITE",PX,PY+102);

      /* ── 13 FIBONACCI BAR ── */
      const FY=CH*0.88;
      FIB.forEach((fv,fi)=>{
        const fx=fi*(CW/FIB.length)+8;
        const fw=CW/FIB.length-4;
        const ht=Math.log(fv+1)/Math.log(56)*CH*0.12;
        const col=fv===13?V.gold:fv===5?V.green:V.dim;
        ctx.fillStyle=col+(fv===13||fv===5?"AA":"44");
        ctx.fillRect(fx,FY-ht,fw,ht);
        ctx.fillStyle=col+(fv===13||fv===5?"CC":"55");
        ctx.font=`700 7.5px ${V.mono}`; ctx.textAlign="center";
        ctx.fillText(`${fv}`,fx+fw/2,FY+10);
      });
      ctx.fillStyle=V.gold+"CC"; ctx.font=`700 8px ${V.mono}`; ctx.textAlign="left";
      ctx.fillText("FIBONACCI · 13 (LUNAR MONTHS) · 5 (NATURE SYMMETRY)",8,CH-4);

      /* ── COMPUTATIONAL PLANE ── */
      const PLX=CW*0.78, PLY=CH*0.16;
      ctx.fillStyle="#06120A"; ctx.fillRect(PLX,PLY,CW*0.20,CH*0.22);
      ctx.strokeStyle=V.green+"33"; ctx.lineWidth=0.7; ctx.strokeRect(PLX,PLY,CW*0.20,CH*0.22);
      const code=[
        {s:"# GRAVITY PLANE",c:V.dim},
        {s:`plane = np.zeros(`,c:V.green},
        {s:`  (N, N), dtype=float)`,c:V.green},
        {s:`g = 9.81  # m/s²`,c:V.photon},
        {s:`for i in range(N):`,c:V.cyan},
        {s:`  plane[i] = g*mass`,c:V.aurora},
      ];
      code.forEach((line,li)=>{
        ctx.fillStyle=line.c+"CC"; ctx.font=`7.5px ${V.mono}`; ctx.textAlign="left";
        ctx.fillText(line.s,PLX+5,PLY+12+li*13);
      });
      ctx.fillStyle=V.green+"77"; ctx.font=`7px ${V.mono}`; ctx.textAlign="left";
      ctx.fillText("GRAVITY PLANE (PYTHON)",PLX+5,PLY-5);

      ctx.fillStyle=V.ink; ctx.font=`700 10px ${V.mono}`; ctx.textAlign="left";
      ctx.fillText("STAR BLACKBOX · 5-FOLD INFINITY · 13 FIBONACCI · GRAVITY PLANE",10,16);

      t+=0.016; raf=requestAnimationFrame(draw);
    };
    draw();
    return()=>cancelAnimationFrame(raf);
  },[]);
  return <canvas ref={ref} width={CW} height={380} style={{width:"100%",borderRadius:6,display:"block"}}/>;
}

/* ─────────────────────────────────────────────────────────────────────────
   CANVAS 3 · Plant Memory · Phototropism · Shadow · 13 Leaves · Prediction
   ───────────────────────────────────────────────────────────────────────── */
function PlantMemoryCanvas(){
  const ref=useRef<HTMLCanvasElement>(null);
  useEffect(()=>{
    const cv=ref.current; if(!cv) return;
    const CH=470;
    cv.width=CW; cv.height=CH;
    const ctx=cv.getContext("2d")!;

    const GROUND=CH*0.72;
    const STEM_X=CW*0.46;
    const PHI=1.6180339887;
    const GOLDEN_ANGLE=2*PI/PHI/PHI; /* 137.5 degrees */

    /* Auxin particles */
    const AUXIN:{x:number;y:number;vx:number;vy:number;life:number}[]=[];
    const spawnAuxin=()=>{
      /* Auxin moves from lit (right) side to shadow (left) side of stem */
      if(AUXIN.length<30){
        AUXIN.push({
          x:STEM_X+8+Math.random()*18,
          y:GROUND-CH*0.15-Math.random()*CH*0.18,
          vx:-0.4-Math.random()*0.3,
          vy:0.3+Math.random()*0.2,
          life:1,
        });
      }
    };

    let t=0, raf=0;

    const draw=()=>{
      ctx.clearRect(0,0,CW,CH);
      ctx.fillStyle=V.bg; ctx.fillRect(0,0,CW,CH);

      /* ── SHADOW ZONE (left) and LIGHT ZONE (right) ── */
      const lightG=ctx.createLinearGradient(0,0,CW,0);
      lightG.addColorStop(0,"rgba(0,0,14,0.85)");
      lightG.addColorStop(0.30,"rgba(0,0,14,0.30)");
      lightG.addColorStop(0.52,"rgba(0,0,14,0)");
      lightG.addColorStop(1,"rgba(255,240,160,0.06)");
      ctx.fillStyle=lightG; ctx.fillRect(0,0,CW,GROUND);

      /* Sun (right) */
      const sunG=ctx.createRadialGradient(CW-30,CH*0.10,5,CW-30,CH*0.10,70);
      sunG.addColorStop(0,"rgba(255,240,160,0.8)");
      sunG.addColorStop(0.4,"rgba(255,200,60,0.3)");
      sunG.addColorStop(1,"transparent");
      ctx.fillStyle=sunG; ctx.fillRect(CW-110,0,110,CH*0.25);

      /* Shadow label */
      ctx.fillStyle=V.dim+"88"; ctx.font=`700 9px ${V.mono}`; ctx.textAlign="left";
      ctx.fillText("SHADOW",10,CH*0.08);
      ctx.fillStyle=V.shock+"88"; ctx.textAlign="right";
      ctx.fillText("LIGHT SOURCE",CW-10,CH*0.08);

      /* ── GROUND ── */
      const grdG=ctx.createLinearGradient(0,GROUND,0,CH);
      grdG.addColorStop(0,"#1A100A"); grdG.addColorStop(1,"#0C0806");
      ctx.fillStyle=grdG; ctx.fillRect(0,GROUND,CW,CH-GROUND);

      /* ── ROOT SYSTEM ── */
      const rootBase=GROUND;
      /* Primary taproot */
      ctx.strokeStyle=V.gold+"55"; ctx.lineWidth=3;
      ctx.beginPath(); ctx.moveTo(STEM_X,rootBase);
      ctx.lineTo(STEM_X+6,rootBase+CH*0.08);
      ctx.lineTo(STEM_X+2,rootBase+CH*0.18); ctx.stroke();
      /* Lateral roots */
      [[rootBase+CH*0.04,-32,CH*0.07],[rootBase+CH*0.08,28,CH*0.06],
       [rootBase+CH*0.12,-24,CH*0.05],[rootBase+CH*0.06,16,CH*0.08]].forEach(([ry,rx_off,rl])=>{
        ctx.strokeStyle=V.gold+"44"; ctx.lineWidth=1.5;
        ctx.beginPath(); ctx.moveTo(STEM_X+4,ry);
        ctx.quadraticCurveTo(STEM_X+4+rx_off*0.5,ry+rl*0.4,STEM_X+4+rx_off,ry+rl);
        ctx.stroke();
        /* Root tip */
        ctx.beginPath(); ctx.arc(STEM_X+4+rx_off,ry+rl,3.5,0,TAU);
        ctx.fillStyle=V.gold+"66"; ctx.fill();
        /* Root hairs */
        for(let rh=0;rh<3;rh++){
          const rhy=ry+rl*0.5+rh*(rl*0.15);
          ctx.strokeStyle=V.gold+"30"; ctx.lineWidth=0.7;
          ctx.beginPath(); ctx.moveTo(STEM_X+4+rx_off*0.5,rhy);
          ctx.lineTo(STEM_X+4+rx_off*0.5+(rx_off>0?8:-8),rhy+3); ctx.stroke();
        }
      });
      ctx.fillStyle=V.gold+"88"; ctx.font=`700 8px ${V.mono}`; ctx.textAlign="center";
      ctx.fillText("ROOT",STEM_X-40,rootBase+CH*0.16);

      /* ── STEM (bending toward light on right) ── */
      /* Bend angle is auxin-driven — shadow side grows faster */
      const bend=Math.sin(t*0.15)*0.04+0.12; /* subtle, slow tropism */
      const stemH=CH*0.52;
      const STEM_TOP_X=STEM_X+bend*stemH*1.8;
      const STEM_TOP_Y=GROUND-stemH;

      ctx.strokeStyle=V.green+"AA"; ctx.lineWidth=5;
      ctx.beginPath();
      ctx.moveTo(STEM_X,GROUND);
      ctx.bezierCurveTo(STEM_X-10,GROUND-stemH*0.3,
                        STEM_TOP_X-8,GROUND-stemH*0.7,
                        STEM_TOP_X,STEM_TOP_Y);
      ctx.stroke();

      /* ── 13 LEAVES in Fibonacci spiral ── */
      for(let li=0;li<13;li++){
        const a=li*GOLDEN_ANGLE;
        const lFrac=li/13;
        const stemPt={
          x:STEM_X+(STEM_TOP_X-STEM_X)*lFrac + bend*(lFrac*stemH*0.8),
          y:GROUND-stemH*lFrac,
        };
        const leafLen=30+li*2.5;
        const lx2=stemPt.x+leafLen*Math.cos(a);
        const ly2=stemPt.y+leafLen*Math.sin(a)*0.5;

        /* Leaf shape */
        ctx.beginPath();
        ctx.moveTo(stemPt.x,stemPt.y);
        ctx.quadraticCurveTo(stemPt.x+(lx2-stemPt.x)*0.5,stemPt.y+(ly2-stemPt.y)*0.5-12,lx2,ly2);
        ctx.quadraticCurveTo(stemPt.x+(lx2-stemPt.x)*0.5,stemPt.y+(ly2-stemPt.y)*0.5+10,stemPt.x,stemPt.y);
        /* Light/shadow tinting of leaf */
        const litSide=lx2>STEM_X;
        ctx.fillStyle=litSide?"rgba(50,160,60,0.65)":"rgba(20,80,30,0.55)";
        ctx.fill();
        ctx.strokeStyle=litSide?V.green+"66":V.green+"33"; ctx.lineWidth=0.7; ctx.stroke();
        /* Leaf midrib */
        ctx.strokeStyle=litSide?V.green+"AA":V.green+"44"; ctx.lineWidth=0.6;
        ctx.beginPath(); ctx.moveTo(stemPt.x,stemPt.y);
        ctx.lineTo(lx2+(stemPt.x-lx2)*0.15,ly2+(stemPt.y-ly2)*0.15); ctx.stroke();
      }
      /* "13 LEAVES" annotation */
      ctx.fillStyle=V.green+"BB"; ctx.font=`700 8px ${V.mono}`; ctx.textAlign="left";
      ctx.fillText("13 · FIBONACCI PHYLLOTAXIS",8,STEM_TOP_Y+30);
      ctx.fillStyle=V.green+"55"; ctx.font=`7px ${V.mono}`;
      ctx.fillText("GOLDEN ANGLE 137.5°",8,STEM_TOP_Y+42);

      /* ── FLOWER (5 petals) at top ── */
      const FLX=STEM_TOP_X, FLY=STEM_TOP_Y-16;
      for(let pi=0;pi<5;pi++){
        const pa=(pi/5)*TAU-PI/2+t*0.04;
        const px=FLX+22*Math.cos(pa), py=FLY+14*Math.sin(pa);
        ctx.beginPath(); ctx.ellipse(px,py,10,7,pa,0,TAU);
        ctx.fillStyle="rgba(220,180,50,0.65)"; ctx.fill();
        ctx.strokeStyle=V.gold+"55"; ctx.lineWidth=0.8; ctx.stroke();
      }
      ctx.beginPath(); ctx.arc(FLX,FLY,8,0,TAU);
      ctx.fillStyle=V.amb; ctx.fill();
      ctx.fillStyle=V.shock+"BB"; ctx.font=`700 8px ${V.mono}`; ctx.textAlign="center";
      ctx.fillText("5 PETALS",FLX,FLY-26);

      /* ── AUXIN REDISTRIBUTION (particles drifting toward shadow side) ── */
      if(t%0.25<0.016) spawnAuxin();
      for(let ai=AUXIN.length-1;ai>=0;ai--){
        const ap=AUXIN[ai];
        ap.x+=ap.vx; ap.y+=ap.vy; ap.life-=0.006;
        if(ap.life<=0||ap.x<STEM_X-50||ap.y>GROUND){AUXIN.splice(ai,1);continue;}
        ctx.beginPath(); ctx.arc(ap.x,ap.y,2.5,0,TAU);
        ctx.fillStyle=`rgba(0,220,120,${ap.life*0.7})`; ctx.fill();
      }
      /* Auxin label */
      ctx.fillStyle=V.aurora+"AA"; ctx.font=`700 8px ${V.mono}`; ctx.textAlign="right";
      ctx.fillText("AUXIN ←",STEM_X-4,GROUND-CH*0.22);
      ctx.fillStyle=V.aurora+"55"; ctx.font=`7px ${V.mono}`;
      ctx.fillText("SHADOW SIDE GROWS FASTER",STEM_X-4,GROUND-CH*0.22+12);

      /* ── CIRCADIAN CLOCK inside one leaf ── */
      const clkLeafIdx=8;
      const clkA=clkLeafIdx*GOLDEN_ANGLE;
      const clkFrac=clkLeafIdx/13;
      const clkStemX=STEM_X+(STEM_TOP_X-STEM_X)*clkFrac;
      const clkStemY=GROUND-stemH*clkFrac;
      const CLX=clkStemX+35*Math.cos(clkA), CLY=clkStemY+20*Math.sin(clkA)*0.5;
      ctx.beginPath(); ctx.arc(CLX,CLY,11,0,TAU);
      ctx.fillStyle="#0A120A99"; ctx.fill();
      ctx.strokeStyle=V.green+"55"; ctx.lineWidth=0.8; ctx.stroke();
      /* Clock hand */
      const clkHand=t*0.04;
      ctx.strokeStyle=V.photon+"AA"; ctx.lineWidth=1.2;
      ctx.beginPath(); ctx.moveTo(CLX,CLY);
      ctx.lineTo(CLX+8*Math.cos(clkHand),CLY+8*Math.sin(clkHand)); ctx.stroke();
      ctx.fillStyle=V.photon+"55"; ctx.font=`6px ${V.mono}`; ctx.textAlign="center";
      ctx.fillText("24h",CLX,CLY+18);

      /* ── MEMORY TIMELINE (bottom) ── */
      const TY=CH*0.88, TX=10, TW=CW-20;
      /* Past */
      ctx.fillStyle=V.dim+"55"; ctx.fillRect(TX,TY,TW*0.33,18);
      ctx.fillStyle=V.gold+"77"; ctx.font=`700 8px ${V.mono}`; ctx.textAlign="center";
      ctx.fillText("YESTERDAY · SUN POSITION REMEMBERED",TX+TW*0.165,TY+12);
      /* Present */
      ctx.fillStyle=V.green+"22"; ctx.fillRect(TX+TW*0.33,TY,TW*0.22,18);
      ctx.fillStyle=V.green+"CC"; ctx.font=`700 8px ${V.mono}`;
      ctx.fillText("NOW · TRACKING",TX+TW*0.44,TY+12);
      /* Prediction */
      ctx.fillStyle=V.cyan+"11"; ctx.fillRect(TX+TW*0.55,TY,TW*0.45,18);
      ctx.fillStyle=V.cyan+"AA"; ctx.font=`700 8px ${V.mono}`;
      ctx.fillText("PREDICTED SUNRISE · PLANT PREPARING",TX+TW*0.775,TY+12);
      /* Vertical now-line */
      ctx.strokeStyle=V.green+"AA"; ctx.lineWidth=1;
      ctx.beginPath(); ctx.moveTo(TX+TW*0.55,TY-4); ctx.lineTo(TX+TW*0.55,TY+22); ctx.stroke();
      /* Prediction curve */
      ctx.strokeStyle=V.cyan+"44"; ctx.lineWidth=1.2; ctx.setLineDash([4,3]);
      ctx.beginPath(); ctx.moveTo(TX+TW*0.55,TY-2);
      ctx.bezierCurveTo(TX+TW*0.65,TY-18,TX+TW*0.75,TY-22,TX+TW*0.85,TY-8); ctx.stroke();
      ctx.setLineDash([]);
      ctx.fillStyle=V.ink; ctx.font=`700 8.5px ${V.mono}`; ctx.textAlign="left";
      ctx.fillText("PLANT MEMORY · PHOTOTROPISM PREDICTION · NOT WIND · NOT MOMENTUM",TX,TY-8);

      ctx.fillStyle=V.ink; ctx.font=`700 10px ${V.mono}`; ctx.textAlign="left";
      ctx.fillText("PLANT MEMORY · PHOTOTROPISM · SHADOW · 13 LEAVES · 5 PETALS · AUXIN · PREDICTION",10,16);

      t+=0.016; raf=requestAnimationFrame(draw);
    };
    draw();
    return()=>cancelAnimationFrame(raf);
  },[]);
  return <canvas ref={ref} width={CW} height={470} style={{width:"100%",borderRadius:6,display:"block"}}/>;
}

/* ─────────────────────────────────────────────────────────────────────────
   PAGE
   ───────────────────────────────────────────────────────────────────────── */
export default function LunarPlantMemoryPage(){
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
        {[badge("LIVE SIMULATION"),badge("LUNAR TERMINATOR",V.photon),badge("LEVITATION",V.photon),
          badge("13",V.gold),badge("STAR BLACKBOX",V.shock),badge("5-FOLD",V.green),
          badge("PLANT MEMORY",V.green),badge("PHOTOTROPISM",V.aurora),badge("AUXIN",V.aurora),
          badge("PREDICTION",V.cyan),badge("SHADOW",V.vio),badge("GRAVITY CHIP",V.green)]}
        <h1 style={{fontFamily:V.disp,fontSize:"clamp(1.2rem,3.4vw,2.3rem)",color:V.ink,
          margin:"22px 0 8px",letterSpacing:"0.06em",fontWeight:400,lineHeight:1.18}}>
          LUNAR TERMINATOR · LEVITATION · 13 · STAR BLACKBOX · 5 FULL OF NATURE · PLANT MEMORY
        </h1>
        <p style={{fontFamily:V.mono,fontSize:"0.58rem",color:V.dim,letterSpacing:3,margin:"0 0 22px"}}>
          DAY/NIGHT BOUNDARY · GRAVITY MICROCHIP · FIBONACCI · SHADOW · AUXIN · PHOTOTROPISM · PREDICTION
        </p>
        {P("The Moon is the boundary of day and night — but not for us. For the Moon itself. The terminator line — the boundary between the lit hemisphere and the dark — runs across the lunar surface at a right angle to the Sun. At the terminator, the Sun is perpetually on the horizon. Shadows are infinitely long. Objects appear to float. This is the natural lunar horizon: a levitation zone where geometry and light conspire to suspend the landscape.")}
        {P("A star is a blackbox. You can measure what goes in (hydrogen, helium) and what comes out (light, radiation, elements, solar wind), but you cannot see inside. The nuclear furnace at the core — 15 million degrees, 250 billion atmospheres of pressure — is permanently hidden behind the photosphere. Stellar physics is inference. We simulate what we cannot observe, then check the outputs.")}
        {P("A plant is not responding to wind or momentum when it bends toward the Sun. It is redistribuiting auxin — a growth hormone — away from the lit side and toward the shadow side. The shadow side, flooded with auxin, elongates faster, bending the stem toward the light. This is not physics acting on the plant. This is the plant computing its environment, remembering yesterday's Sun position, and predicting where the Sun will be.")}
      </div>

      {sec("01","Lunar Terminator · Levitation · Natural Horizon · 13 Months · Gravity Microchip",V.photon,<>
        {P("The terminator is not a line — it is a zone. The transition from full sunlight to full shadow on the Moon takes about 2 km across the surface. In that zone, the Sun hangs exactly at the horizon. Shadows are not cast downward but horizontally, stretching for hundreds of metres from every rock and boulder. The visual effect is that objects appear to hover above the ground — the shadow reveals no connection to the surface below them.")}
        {P("The Moon makes 13 orbits of the Earth per year (13 × 28 = 364 days, just short of the solar year). This is why the lunar calendar drifts against the solar calendar — the 11-day gap accumulates into a full month shift every 2.7 years. Ancient calendars tracked 13 moons. The number 13 in many traditions was not unlucky but lunar — feminine, cyclical, and precisely tied to the Moon's own rhythm.")}
        {P("A MEMS (Micro-Electro-Mechanical Systems) accelerometer is a microchip that measures gravity. Inside the chip, a tiny mass (1-10 micrograms) is suspended on microscale springs. Gravity pulls the mass, deflecting the springs, changing a capacitance that is read as voltage. This is a gravity device: a silicon microchip that weighs the planet. MEMS chips are in every smartphone, every self-driving car, every satellite. Gravity, encoded as a number, stored in Python or Java as a float in a two-dimensional plane array.")}
        <div style={{border:`1px solid ${V.photon}22`,borderRadius:8,padding:2,marginBottom:14}}>
          <LunarTerminatorCanvas/>
        </div>
        {cards([
          {h:"TERMINATOR LEVITATION",col:V.photon,d:"Terminator zone physics: solar elevation = 0 degrees (Sun on horizon). Shadow length = object height / tan(solar elevation). As solar elevation approaches 0, shadow length approaches infinity. At the terminator, a 1m boulder casts a shadow hundreds of metres long. The shadow is cast horizontally across the regolith, disconnected from the boulder visually. This creates the optical illusion of levitation. Lunar explorers would use the terminator zone to navigate by the extremely sharp contrast between long shadows and lit surfaces."},
          {h:"13 LUNAR MONTHS",col:V.gold,d:"Synodic month: 29.53 days (new Moon to new Moon). Tropical year: 365.24 days. 365.24 / 29.53 = 12.37 synodic months per year. But: 13 sidereal months per year (Moon completes 13 full orbits relative to the stars). 13 appears in: Mayan Tzolkin calendar (13×20=260 days), Mesoamerican Long Count (13 baktun = one Great Cycle), ancient Hebrew, Celtic, and Chinese lunar calendars. The Metonic cycle: 19 solar years = 235 lunar months (precision: 2 hours in 19 years)."},
          {h:"MEMS GRAVITY CHIP",col:V.green,d:"MEMS accelerometer: silicon wafer with 1-micron features etched by photolithography. Mass: polysilicon beam suspended between comb electrodes. Spring constant: 0.001 N/m. Resonant frequency: 5-10 kHz. Resolution: 1 microgram (10^-6 g). ADXL345 chip: 3-axis, 13-bit resolution, 3.3V, 40 microamps. Used in: phones (screen rotation, step counting), drones (stabilisation), seismometers, gravimeters for oil exploration. The gravity plane in Python: a 2D NumPy array where each cell stores the local gravitational field vector."},
          {h:"NATURAL LUNAR HORIZON",col:V.cyan,d:"The Moon is much smaller than Earth (1,737 km radius vs 6,371 km). Standing on the Moon at eye height (1.7m): horizon is 2.4 km away (vs 4.7 km on Earth). The horizon appears sharp and close. No atmosphere means no haze — the horizon is a razor edge of grey rock against black space. Apollo astronauts described the horizon as 'the most alien thing' — so close, so sharp, so absolutely final. The sky is not blue. It is black, even in full daylight."},
          {h:"LEVITATION AS CONCEPT",col:V.vio,d:"Levitation (physics): suspension of an object against gravity by a force other than a surface reaction. Methods: magnetic levitation (Meissner effect in superconductors), acoustic levitation (standing acoustic waves), aerodynamic (airflow), optical (laser pressure, piconewton force). The terminator 'levitation' is perceptual — not physical. But the concept is real: the Moon is in a permanent state of gravitational levitation around Earth. The Moon is falling toward Earth at exactly the rate Earth's surface curves away from it. Free fall forever."},
          {h:"AETHER · BOUNDARY NODE",col:V.photon,d:"AETHER: the terminator as a coherence boundary. Every field has a boundary node — a location where two states meet and neither fully applies. The terminator is the boundary node of the light field: neither day (full coherence, high photon flux) nor night (full decoherence, zero photon flux). Boundary nodes are where the most interesting physics happens: plasma sheaths, cell membranes, phase transitions, the terminator line. AETHER's coherence engine specifically models these boundary nodes as sites of maximum information content."},
        ])}
      </>)}

      {sec("02","Star Blackbox · 5-Fold Symmetry · Fibonacci 13 · The Computational Plane",V.shock,<>
        {P("A star is the ultimate blackbox. Its photosphere (the visible surface) is completely opaque — photons generated in the core take 100,000 years to random-walk their way to the surface. By the time a photon reaches you, it has scattered so many times that it carries no directional information about where it was made. You cannot image a star's core. You can only infer it: from its spectrum, its luminosity, its age, its oscillation modes (helioseismology). The blackbox model says: given inputs, predict outputs. Check against observation.")}
        {P("Five-fold symmetry is the symmetry of life. Pentagons, pentamers, five-petaled flowers, starfish arms, the five appendages of vertebrates, the five Platonic constraints that define a regular solid — and one that doesn't exist in crystals (quasicrystals, discovered by Shechtman in 1984, show five-fold symmetry, which was deemed impossible and cost him friends). The pentagonal structure encodes phi (the golden ratio) in its diagonals: diagonal/side = phi = 1.618. Every pentagon is a phi machine.")}
        {P("The number 13 is the seventh Fibonacci number. The sequence 1, 1, 2, 3, 5, 8, 13, 21 encodes phi — consecutive ratios converge to phi. 13 lunar months in a year. 13 semitones in a chromatic octave. 13 as the first 'teenager' prime. In nature: 13 spirals in one direction on a sunflower head (with 8 in the other, 5 below). The plane in Python is the continuous extension — a 2D array of floating-point values simulating a gravitational field, where each cell is a tiny patch of the landscape receiving a pull.")}
        <div style={{border:`1px solid ${V.shock}22`,borderRadius:8,padding:2,marginBottom:14}}>
          <StarBlackboxCanvas/>
        </div>
        {cards([
          {h:"STELLAR BLACKBOX",col:V.shock,d:"Stellar interior inaccessible to photons — but not to neutrinos. Solar neutrino detectors (Super-Kamiokande, SNO) see the core directly: ~65 billion solar neutrinos per cm^2 per second pass through you right now. The solar blackbox has a hole: neutrinos escape instantly. But they barely interact — detection requires a 50,000-tonne water tank and we catch ~15 per day. Helioseismology is the other window: the Sun rings like a bell. Pressure waves on the surface reveal interior sound speed (and therefore temperature/composition) to 1% accuracy."},
          {h:"5-FOLD IN NATURE",col:V.green,d:"Five-fold symmetry examples: flowers (most dicots have 4 or 5 petals; most monocots have 3 or 6). Echinoderms: sea urchins, starfish, sea cucumbers all have pentaradial symmetry (5 radial sections). Vertebrate limbs: 5 fingers, 5 toes — the pentadactyl limb (common ancestor 380 Ma). Phi in architecture: nautilus shell (not exactly phi, but a logarithmic spiral), Parthenon proportions (much debated). Penrose tiling: two rhombus shapes tile the plane with five-fold symmetry — aperiodic tiling, the mathematical analog of quasicrystals."},
          {h:"FIBONACCI · PHI",col:V.gold,d:"Fibonacci sequence: Fn = Fn-1 + Fn-2. Ratio Fn/Fn-1 converges to phi = (1+sqrt(5))/2 = 1.6180339887... Phi is algebraically: phi^2 = phi + 1. Golden angle: 360/phi^2 = 137.5077 degrees. Plant leaf arrangement (phyllotaxis): leaves emerge at the golden angle to maximise sunlight exposure on lower leaves. Result: looking down a plant stem, leaves form Fibonacci spirals. The number of spirals in each direction: always two consecutive Fibonacci numbers (5 and 8, or 8 and 13, or 13 and 21)."},
          {h:"COMPUTATIONAL PLANE",col:V.cyan,d:"A gravity simulation plane (Python/Java): a 2D array where each cell (i,j) stores g(i,j) = GM/r^2 for a point mass at the origin. NumPy implementation: g = G*M / (X^2 + Y^2) where X,Y are meshgrid arrays. This plane is used in: N-body simulations (each particle at a grid point), fluid dynamics (gravitational forcing term), geophysical modelling (Bouguer anomaly maps). In Java: a double[][] array. In Python: numpy.ndarray, dtype=float64. The '$' in a language context marks a variable — the plane itself is a variable: a named container for the field."},
          {h:"QUASICRYSTALS",col:V.vio,d:"Five-fold symmetry in crystals was impossible by crystallographic theorem: only 2, 3, 4, 6-fold symmetry are compatible with translational periodicity. Quasicrystals (Shechtman, 1984): ordered but aperiodic. Show 5-fold diffraction patterns. First natural quasicrystal found in a Siberian meteorite (2009), then in a nuclear test site (2021, from the first nuclear detonation Trinity, 1945). The infinite: quasicrystals fill space without repeating. Five-fold symmetry + aperiodicity = infinite non-repeating pattern. 5 full of nature unlocks the infinite."},
          {h:"AETHER · BLACKBOX",col:V.shock,d:"AETHER's blackbox principle: every sufficiently complex system has an opaque interior. The star's core is opaque. The brain's neural computation is opaque (we observe inputs and outputs, not each thought). A market is opaque. A genome's regulatory network is opaque. AETHER does not demand transparency — it demands coherence at the boundary. The blackbox model: measure inputs (H, He, mass), measure outputs (luminosity, spectrum, elements), model the boundary. The interior is a coherence field — it can be characterised by its topology even when invisible."},
        ])}
      </>)}

      {sec("03","Plant Memory · Phototropism · Auxin · Shadow · 13 Leaves · Prediction",V.green,<>
        {P("A plant bends toward light not because light pushes it, not because wind moves it, but because it actively redistributes a growth hormone in response to the light gradient. Phototropin receptors (LOV domain proteins) in the stem detect blue light. When light hits the right side of the stem, phototropins activate, triggering the redistribution of auxin (indole-3-acetic acid) from the lit side to the shadow side. The shadow side, rich in auxin, elongates faster. The stem curves.")}
        {P("This is computation, not mechanics. The plant measures a gradient, makes a directional decision, and executes a targeted hormonal redistribution. The shadow side is not pushed — it is grown into. The light side is not compressed — it is grown out of. The entire process is internal, chemical, and information-driven. Wind does nothing to phototropism. Momentum does nothing. Only the light gradient, sensed by phototropins, matters.")}
        {P("The Venus flytrap counts mechanical triggers: one touch primes it, a second touch within 30 seconds fires it. This is a short-term integer memory in a plant — no brain, no synapses, no calcium signals that look like action potentials. Arabidopsis thaliana has been shown to habituate to repeated stimuli: repeated salinity stress changes the plant's epigenetic state so it responds less severely next time. The plant does not forget — it accumulates a record.")}
        <div style={{border:`1px solid ${V.green}22`,borderRadius:8,padding:2,marginBottom:14}}>
          <PlantMemoryCanvas/>
        </div>
        {cards([
          {h:"PHOTOTROPISM MECHANISM",col:V.green,d:"Phototropin proteins (phot1, phot2) are blue-light receptors with LOV (Light-Oxygen-Voltage) domains that bind flavin mononucleotide (FMN). Blue light (450 nm) causes FMN to form a covalent bond with a cysteine residue — this changes the protein's conformation within microseconds. The conformational change activates the protein's kinase domain, initiating a phosphorylation cascade. End result: PIN-formed (PIN) auxin transporter proteins are relocated from the lit side to the shadow side of cells, redirecting auxin flow."},
          {h:"AUXIN REDISTRIBUTION",col:V.aurora,d:"Auxin (IAA, indole-3-acetic acid): the primary plant growth hormone. Effect: at low concentrations, promotes cell elongation (by acidifying the cell wall, loosening cellulose cross-links). At high concentrations, inhibits growth. Phototropism: auxin concentration on shadow side increases 20-40% compared to lit side. Shadow-side cells elongate 15-30% more than lit-side cells. The differential growth causes curvature. Rate: Arabidopsis stem bends 30 degrees in 45 minutes. No momentum, no wind — only chemistry."},
          {h:"PLANT MEMORY",col:V.cyan,d:"Venus flytrap counting: touch receptor hairs generate action potentials (Ca2+ influx). Each touch raises cytoplasmic Ca2+ concentration by a discrete step. Second touch within 30s exceeds threshold — trap fires. The Ca2+ level is the memory: it decays slowly (30s half-life), and the count is lost. Arabidopsis epigenetic memory: drought stress methylates specific gene promoters (histone H3K4me3 marks). The plant re-exposed to drought responds 40% faster. This epigenetic memory persists for weeks and can be inherited by offspring (transgenerational epigenetic memory)."},
          {h:"PREDICTION MECHANISM",col:V.photon,d:"Circadian clock (plants): a 24-hour molecular oscillator. Core loop: TIMING OF CAB EXPRESSION 1 (TOC1) and LATE ELONGATED HYPOCOTYL (LHY) proteins form a negative feedback loop with ~24h period. The clock anticipates dawn: TOC1 rises before sunrise, pre-loading the photosynthetic machinery. The plant is not reacting — it is predicting. Evidence: plants kept in constant darkness still show 24h rhythms in leaf position, stomatal opening, and growth rate. The clock is endogenous, not driven by light — light only entrains (synchronises) it."},
          {h:"13 LEAVES · PHYLLOTAXIS",col:V.gold,d:"Golden angle (137.5077 degrees): leaves emerge one at a time, each rotated 137.5 degrees from the previous. This angle is irrational (phi^2 proportional) — no two leaves ever align exactly. Looking down the stem: leaves form two sets of Fibonacci spirals (5 clockwise, 8 anticlockwise, or 8 and 13, depending on species). Mathematical proof: the golden angle minimises overlap between leaves, maximising light capture. Sunflower heads have 34/55 or 55/89 Fibonacci spiral pairs. 13 in phyllotaxis: species like Aloe vera, Opuntia cacti, and some palms show 13-spiral patterns."},
          {h:"AETHER · PLANT FIELD",col:V.green,d:"AETHER: the plant as a distributed coherence field. No central processor, no spine, no brain — yet the plant computes, remembers, and predicts. AETHER models this as a distributed field coherence: every cell participates in the global computation via chemical gradients (auxin, cytokinin, ethylene, ABA). The shadow is not absence — it is information. The shadow defines the gradient that the plant reads and responds to. AETHER's shadow model: decoherence on one side of the field creates a gradient toward the coherent side. The field self-organises to move toward light."},
        ])}
      </>)}
    </div>
  );
}
