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
   CANVAS 1 · Life / Nonlife Gradient Field · Cell Membrane · Organoid
   ───────────────────────────────────────────────────────────────────────── */
function LifeGradientCanvas(){
  const ref=useRef<HTMLCanvasElement>(null);
  useEffect(()=>{
    const cv=ref.current; if(!cv) return;
    const CH=430;
    cv.width=CW; cv.height=CH;
    const ctx=cv.getContext("2d")!;

    const STEP=6;
    const BX=CW*0.42; /* bilayer x-centre */
    const OX=CW*0.74, OY=CH*0.50, OR=CH*0.40; /* organoid */

    let t=0, raf=0;

    const draw=()=>{
      ctx.clearRect(0,0,CW,CH);

      /* ── Gradient field (left=abiotic, right=biotic) ── */
      for(let gx=0;gx<CW;gx+=STEP){
        for(let gy=0;gy<CH;gy+=STEP){
          const bio=Math.max(0,Math.min(1,(gx-CW*0.05)/(CW*0.85)));
          const noise=Math.sin(gx*0.04+t*0.4)*Math.sin(gy*0.04-t*0.3)*0.18;
          const v=Math.max(0,Math.min(1,bio+noise));
          /* Abiotic: dark blue-grey; Biotic: dark green; Boundary: undefined shimmer */
          const r=(v<0.5?8+v*30:38+v*12)|0;
          const g=(v<0.5?10+v*28:38+v*60)|0;
          const b=(v<0.5?22+v*50:22+v*18)|0;
          const alpha=0.32+Math.abs(v-0.5)*0.18;
          ctx.fillStyle=`rgba(${r},${g},${b},${alpha})`;
          ctx.fillRect(gx,gy,STEP,STEP);
        }
      }

      /* ── Crystal lattice (left abiotic zone) ── */
      for(let lx=22;lx<CW*0.35;lx+=20){
        for(let ly=14;ly<CH-14;ly+=18){
          const vib=Math.sin(t*2.2+lx*0.08+ly*0.07)*0.8;
          const alpha=0.38-lx/CW*0.5;
          ctx.strokeStyle=`rgba(80,100,180,${alpha*0.7})`;
          ctx.lineWidth=0.6;
          /* Unit cell bonds */
          if(lx+20<CW*0.35){
            ctx.beginPath(); ctx.moveTo(lx+vib,ly); ctx.lineTo(lx+20+vib,ly); ctx.stroke();
          }
          if(ly+18<CH-14){
            ctx.beginPath(); ctx.moveTo(lx,ly+vib); ctx.lineTo(lx,ly+18+vib); ctx.stroke();
          }
          /* Atom */
          ctx.beginPath(); ctx.arc(lx+vib*0.4,ly+vib*0.3,2.4,0,TAU);
          ctx.fillStyle=`rgba(100,140,210,${alpha})`; ctx.fill();
        }
      }

      /* ── Lipid bilayer at the boundary ── */
      const bFlicker=Math.sin(t*0.55)*0.5+0.5; /* 0=breaking, 1=intact */
      for(let ly=8;ly<CH-8;ly+=26){
        /* Upper leaflet — head (left) + two tails (right) */
        const jit=Math.sin(t*1.2+ly*0.1)*(1-bFlicker)*4;
        /* Head */
        ctx.beginPath(); ctx.arc(BX-14+jit,ly+7,4.5,0,TAU);
        ctx.fillStyle=`rgba(0,200,255,${0.55+bFlicker*0.2})`; ctx.fill();
        /* Tails */
        ctx.strokeStyle=`rgba(50,120,200,${0.40+bFlicker*0.18})`; ctx.lineWidth=1.2;
        ctx.beginPath();
        ctx.moveTo(BX-9+jit,ly+7);
        ctx.quadraticCurveTo(BX-2,ly+12,BX+4,ly+7);
        ctx.quadraticCurveTo(BX+10,ly+2,BX+14,ly+7);
        ctx.stroke();
        /* Lower leaflet — head (right) + tails (left) */
        ctx.beginPath(); ctx.arc(BX+14-jit,ly+18,4.5,0,TAU);
        ctx.fillStyle=`rgba(0,200,255,${0.55+bFlicker*0.2})`; ctx.fill();
        ctx.beginPath();
        ctx.moveTo(BX+9-jit,ly+18);
        ctx.quadraticCurveTo(BX+2,ly+13,BX-4,ly+18);
        ctx.quadraticCurveTo(BX-10,ly+23,BX-14,ly+18);
        ctx.stroke();
      }

      /* Undefined-boundary shimmer */
      const uAlpha=0.45+Math.sin(t*1.8)*0.3;
      ctx.fillStyle=`rgba(160,80,255,${uAlpha*0.25})`;
      ctx.fillRect(BX-30,0,60,CH);

      /* ── Organoid (right biotic zone) ── */
      const NV=20;
      ctx.beginPath();
      for(let vi=0;vi<NV;vi++){
        const a=(vi/NV)*TAU;
        const r=OR*(0.82+Math.sin(t*0.45+vi*1.15)*0.18);
        vi===0?ctx.moveTo(OX+r*Math.cos(a),OY+r*Math.sin(a))
              :ctx.lineTo(OX+r*Math.cos(a),OY+r*Math.sin(a));
      }
      ctx.closePath();
      ctx.fillStyle="rgba(0,255,140,0.05)"; ctx.fill();
      ctx.strokeStyle=V.green+"55"; ctx.lineWidth=1.5; ctx.stroke();

      /* Nucleus */
      ctx.beginPath(); ctx.ellipse(OX-OR*0.15,OY,OR*0.22,OR*0.18,0.3,0,TAU);
      ctx.fillStyle="rgba(80,40,160,0.28)"; ctx.fill();
      ctx.strokeStyle=V.vio+"55"; ctx.lineWidth=1.2; ctx.stroke();
      /* Nuclear pores */
      for(let np=0;np<8;np++){
        const a=(np/8)*TAU+0.3;
        const nr=OR*0.22;
        ctx.beginPath(); ctx.arc(OX-OR*0.15+nr*Math.cos(a)*0.9,OY+nr*0.85*Math.sin(a)*0.85,2.5,0,TAU);
        ctx.fillStyle=V.vio+"66"; ctx.fill();
      }

      /* Chloroplast (plant-specific) */
      ctx.beginPath(); ctx.ellipse(OX+OR*0.18,OY-OR*0.28,OR*0.18,OR*0.10,0.4,0,TAU);
      ctx.fillStyle="rgba(0,180,80,0.38)"; ctx.fill();
      ctx.strokeStyle=V.green+"66"; ctx.lineWidth=1; ctx.stroke();
      /* Thylakoid stacks inside chloroplast */
      for(let ts=0;ts<4;ts++){
        const tx=OX+OR*0.18+(-5+ts*3.5);
        ctx.strokeStyle="rgba(0,220,100,0.5)"; ctx.lineWidth=1.5;
        ctx.beginPath(); ctx.moveTo(tx,OY-OR*0.28-OR*0.07); ctx.lineTo(tx,OY-OR*0.28+OR*0.07); ctx.stroke();
      }

      /* Mitochondria */
      [[OX+OR*0.25,OY+OR*0.22],[OX+OR*0.10,OY+OR*0.35]].forEach(([mx,my])=>{
        ctx.beginPath(); ctx.ellipse(mx,my,OR*0.10,OR*0.06,0.5,0,TAU);
        ctx.fillStyle="rgba(200,80,20,0.28)"; ctx.fill();
        ctx.strokeStyle=V.amb+"55"; ctx.lineWidth=1; ctx.stroke();
        /* Cristae */
        ctx.strokeStyle=V.fire+"44"; ctx.lineWidth=0.7;
        ctx.beginPath(); ctx.moveTo(mx-OR*0.05,my); ctx.lineTo(mx+OR*0.05,my); ctx.stroke();
      });

      /* Plant electrical signal wave propagating */
      const wavePos=(t*0.6)%(OR*2);
      ctx.strokeStyle=V.photon+"BB"; ctx.lineWidth=1.8;
      ctx.beginPath();
      for(let wx=OX-OR*0.85;wx<OX+OR*0.85;wx+=3){
        const d=wx-(OX-OR*0.85+wavePos);
        const wamp=Math.exp(-d*d/(OR*OR*0.15))*Math.sin(d*0.18)*14;
        const wy=OY+OR*0.5+wamp;
        wx===OX-OR*0.85?ctx.moveTo(wx,wy):ctx.lineTo(wx,wy);
      }
      ctx.stroke();

      /* Labels */
      ctx.fillStyle=V.ink; ctx.font=`700 10px ${V.mono}`; ctx.textAlign="left";
      ctx.fillText("LIFE · NONLIFE · GRADIENT FIELD · UNDEFINED BOUNDARY",10,16);
      ctx.fillStyle=V.dim+"AA"; ctx.font=`700 8.5px ${V.mono}`;
      ctx.fillText("ABIOTIC",16,CH-10);
      ctx.fillStyle=V.vio+"CC"; ctx.textAlign="center";
      ctx.fillText("MEMBRANE",BX,CH-10);
      ctx.fillStyle=V.green+"CC"; ctx.textAlign="center";
      ctx.fillText("ORGANOID · PLANT INTELLIGENCE",OX,CH-10);

      t+=0.016; raf=requestAnimationFrame(draw);
    };
    draw();
    return()=>cancelAnimationFrame(raf);
  },[]);
  return <canvas ref={ref} width={CW} height={430} style={{width:"100%",borderRadius:6,display:"block"}}/>;
}

/* ─────────────────────────────────────────────────────────────────────────
   CANVAS 2 · Mars Hit By Venus · Grand Canyon · Moon Glass Towers · Solar Wind
   ───────────────────────────────────────────────────────────────────────── */
function PlanetaryCanvas(){
  const ref=useRef<HTMLCanvasElement>(null);
  useEffect(()=>{
    const cv=ref.current; if(!cv) return;
    const CH=480;
    cv.width=CW; cv.height=CH;
    const ctx=cv.getContext("2d")!;

    /* Solar wind particle pool */
    const swParts:{x:number;y:number;vx:number;vy:number}[]=Array.from({length:30},(_,i)=>({
      x:(i*137)%CW, y:CH*0.55+(i*47)%(CH*0.45), vx:2.2+i*0.08, vy:(i%5-2)*0.4,
    }));

    let t=0, raf=0;

    const draw=()=>{
      ctx.clearRect(0,0,CW,CH);
      ctx.fillStyle=V.bg; ctx.fillRect(0,0,CW,CH);

      /* ══ TOP HALF: Inner solar system ══ */
      const SX=CW*0.12, SY=CH*0.22;
      /* Stars */
      for(let s=0;s<60;s++){
        const sx=(s*97+11)%CW, sy=(s*53+7)%(CH*0.48);
        ctx.beginPath(); ctx.arc(sx,sy,0.7+s%2*0.5,0,TAU);
        ctx.fillStyle=`rgba(200,210,240,${0.3+s%3*0.15})`; ctx.fill();
      }

      /* Sun */
      const sunG=ctx.createRadialGradient(SX,SY,2,SX,SY,28);
      sunG.addColorStop(0,"#FFEE88"); sunG.addColorStop(0.5,"#FF9900"); sunG.addColorStop(1,"transparent");
      ctx.fillStyle=sunG; ctx.fillRect(SX-30,SY-30,60,60);

      /* Orbits */
      const ORB=[{r:52,col:"#FF8844",spd:1.62,name:"VENUS"},
                 {r:78,col:V.blue,   spd:1.00,name:"EARTH"},
                 {r:115,col:"#FF6633",spd:0.53,name:"MARS"}];
      ORB.forEach(o=>{
        ctx.beginPath(); ctx.ellipse(SX,SY,o.r,o.r*0.88,0,0,TAU);
        ctx.strokeStyle=o.col+"33"; ctx.lineWidth=0.8; ctx.stroke();
        const a=(t*0.12)*o.spd;
        const px=SX+o.r*Math.cos(a), py=SY+o.r*0.88*Math.sin(a);
        ctx.beginPath(); ctx.arc(px,py,5,0,TAU);
        ctx.fillStyle=o.col; ctx.fill();
        ctx.fillStyle=o.col; ctx.font=`700 8px ${V.mono}`; ctx.textAlign="left";
        ctx.fillText(o.name,px+7,py+3);
      });

      /* Impact trajectory — Venus to Mars region */
      ctx.strokeStyle=V.plasma+"66"; ctx.lineWidth=2; ctx.setLineDash([7,5]);
      ctx.beginPath();
      ctx.moveTo(SX+52,SY+15);
      ctx.bezierCurveTo(SX+82,SY-60,SX+105,SY+30,SX+115,SY-20);
      ctx.stroke(); ctx.setLineDash([]);
      /* Impact annotation */
      ctx.fillStyle=V.plasma+"CC"; ctx.font=`700 8px ${V.mono}`; ctx.textAlign="center";
      ctx.fillText("VENUS → MARS",SX+88,SY-68);
      ctx.fillText("IMPACT TRAJECTORY",SX+88,SY-58);

      /* Divider */
      ctx.strokeStyle=V.dim+"40"; ctx.lineWidth=0.7;
      ctx.beginPath(); ctx.moveTo(0,CH*0.47); ctx.lineTo(CW,CH*0.47); ctx.stroke();

      /* ══ BOTTOM LEFT: Moon surface + glass spires ══ */
      const ML=8, MR=CW*0.52, MY=CH*0.52;
      const moonSoilG=ctx.createLinearGradient(ML,MY,ML,CH);
      moonSoilG.addColorStop(0,"#1E1A24"); moonSoilG.addColorStop(1,"#0E0A10");
      ctx.fillStyle=moonSoilG; ctx.fillRect(ML,MY,MR-ML,CH-MY);

      /* Glass micrometeorite spires */
      const SPIRES=[
        {fx:0.06,h:110,w:4},{fx:0.11,h:72,w:3},{fx:0.15,h:155,w:5},
        {fx:0.20,h:50,w:2.5},{fx:0.25,h:128,w:4},{fx:0.29,h:88,w:3.5},
        {fx:0.34,h:46,w:2},{fx:0.38,h:105,w:4},{fx:0.42,h:67,w:3},
        {fx:0.46,h:140,w:5},{fx:0.50,h:38,w:2},
      ];
      SPIRES.forEach(sp=>{
        const sx=ML+(MR-ML)*sp.fx, sy=MY-sp.h;
        const shine=Math.sin(t*0.5+sp.fx*10)*0.1+0.15;
        ctx.beginPath();
        ctx.moveTo(sx-sp.w,MY); ctx.lineTo(sx-sp.w*0.3,sy);
        ctx.lineTo(sx+sp.w*0.3,sy); ctx.lineTo(sx+sp.w,MY);
        ctx.fillStyle=`rgba(170,215,255,${shine})`; ctx.fill();
        ctx.strokeStyle=`rgba(210,240,255,${shine*2.5})`; ctx.lineWidth=0.7; ctx.stroke();
        /* Specular highlight */
        ctx.strokeStyle=`rgba(255,255,255,0.20)`; ctx.lineWidth=0.5;
        ctx.beginPath(); ctx.moveTo(sx-sp.w*0.5,MY); ctx.lineTo(sx-sp.w*0.1,sy); ctx.stroke();
      });

      /* Glass beads in regolith */
      for(let b=0;b<35;b++){
        const bx=ML+(b*119+7)%(MR-ML-ML), by=MY+6+(b*37)%12;
        ctx.beginPath(); ctx.arc(bx,by,1.5,0,TAU);
        ctx.fillStyle=`rgba(180,220,255,${0.4+b%3*0.12})`; ctx.fill();
      }

      /* Scale bar (skyscraper height) */
      const SBX=ML+14, SBY1=MY-155, SBY2=MY;
      ctx.strokeStyle=V.ink+"55"; ctx.lineWidth=1;
      ctx.beginPath(); ctx.moveTo(SBX,SBY1); ctx.lineTo(SBX,SBY2); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(SBX-4,SBY1); ctx.lineTo(SBX+4,SBY1); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(SBX-4,SBY2); ctx.lineTo(SBX+4,SBY2); ctx.stroke();
      ctx.fillStyle=V.ink+"AA"; ctx.font=`700 8px ${V.mono}`; ctx.textAlign="left";
      ctx.fillText("≈500m",SBX+6,SBY1+16);
      ctx.fillText("SKYSCRAPER",SBX+6,SBY1+26);
      ctx.fillText("SCALE",SBX+6,SBY1+36);

      /* Solar wind particles hitting Moon surface */
      ctx.fillStyle=V.shock+"AA"; ctx.font=`700 8px ${V.mono}`; ctx.textAlign="left";
      ctx.fillText("☀ SOLAR WIND →",ML,MY-170);
      for(let p=0;p<15;p++){
        const px=(p*83+t*60)%((MR-ML)*0.55)+ML;
        const py=MY-170+p*8;
        if(py<MY-5){
          ctx.beginPath(); ctx.arc(px,py,1.5,0,TAU);
          ctx.fillStyle=V.shock+"88"; ctx.fill();
          /* Impact at surface */
          if(py>MY-14){
            ctx.beginPath(); ctx.arc(px,MY-4,4,PI,TAU);
            ctx.strokeStyle=V.shock+"44"; ctx.lineWidth=1; ctx.stroke();
          }
        }
      }

      ctx.fillStyle=V.cyan+"CC"; ctx.font=`700 9px ${V.mono}`; ctx.textAlign="center";
      ctx.fillText("MOON · GLASS MICROMETEORITE SPIRES",ML+(MR-ML)*0.5,CH-8);

      /* ══ BOTTOM RIGHT: Grand Canyon strata ══ */
      const GL=CW*0.55, GR=CW-8, GY=CH*0.50;
      const STRATA=[
        {col:"#D4A060",h:18,name:"KAIBAB LIMESTONE"},
        {col:"#B87038",h:14,name:"TOROWEAP"},
        {col:"#E8C080",h:22,name:"COCONINO SANDSTONE"},
        {col:"#C06028",h:12,name:"HERMIT SHALE"},
        {col:"#D4A060",h:16,name:"SUPAI GROUP"},
        {col:"#885038",h:10,name:"REDWALL LIMESTONE"},
        {col:"#907050",h:14,name:"MUAV LIMESTONE"},
        {col:"#707868",h:12,name:"BRIGHT ANGEL SHALE"},
        {col:"#486040",h:20,name:"TAPEATS SANDSTONE"},
        {col:"#303228",h:30,name:"VISHNU SCHIST · BASEMENT"},
      ];
      let sy=GY;
      STRATA.forEach(st=>{
        ctx.fillStyle=st.col+"CC"; ctx.fillRect(GL,sy,GR-GL,st.h);
        ctx.fillStyle="rgba(0,0,0,0.2)"; ctx.fillRect(GL,sy+st.h-1,GR-GL,1);
        ctx.fillStyle=V.bg+"CC"; ctx.font=`7.5px ${V.mono}`; ctx.textAlign="left";
        ctx.fillText(st.name,GL+4,sy+st.h-4);
        sy+=st.h;
      });

      /* Canyon cut */
      const CCW=50;
      ctx.clearRect(GL+(GR-GL)*0.5-CCW/2,GY,CCW,sy-GY);
      ctx.fillStyle="#070408";
      ctx.fillRect(GL+(GR-GL)*0.5-CCW/2,GY,CCW,sy-GY);
      /* River at bottom */
      ctx.fillStyle=V.blue+"88";
      ctx.fillRect(GL+(GR-GL)*0.5-CCW/2,sy-8,CCW,8);

      /* Impact ejecta annotation */
      ctx.fillStyle=V.plasma+"BB"; ctx.font=`700 7.5px ${V.mono}`; ctx.textAlign="left";
      ctx.fillText("? IMPACT EJECTA",GL+4,GY+8);
      ctx.fillStyle=V.cyan+"CC"; ctx.font=`700 9px ${V.mono}`; ctx.textAlign="center";
      ctx.fillText("GRAND CANYON · STRATA",GL+(GR-GL)*0.5,CH-8);

      ctx.fillStyle=V.ink; ctx.font=`700 10px ${V.mono}`; ctx.textAlign="left";
      ctx.fillText("PLANETARY COLLISION · MOON GLASS SPIRES · GRAND CANYON STRATA · SOLAR WIND",10,16);

      t+=0.018; raf=requestAnimationFrame(draw);
    };
    draw();
    return()=>cancelAnimationFrame(raf);
  },[]);
  return <canvas ref={ref} width={CW} height={480} style={{width:"100%",borderRadius:6,display:"block"}}/>;
}

/* ─────────────────────────────────────────────────────────────────────────
   CANVAS 3 · Solar Wind Erosion · Concretions · Fascia Network · Salt/Fresh Era
   ───────────────────────────────────────────────────────────────────────── */
function ErosionFasciaCanvas(){
  const ref=useRef<HTMLCanvasElement>(null);
  useEffect(()=>{
    const cv=ref.current; if(!cv) return;
    const CH=420;
    cv.width=CW; cv.height=CH;
    const ctx=cv.getContext("2d")!;

    /* Fascia network nodes — fluid-filled channel junctions */
    const FN=28;
    const fnodes:{x:number;y:number;r:number}[]=Array.from({length:FN},(_,i)=>({
      x:CW*0.35+((i*137.5)%1)*(CW*0.58),
      y:CH*0.35+((i*73.1)%1)*(CH*0.45),
      r:3+i%4,
    }));
    /* Connect nearby nodes */
    const fedges:{a:number;b:number}[]=[];
    for(let a=0;a<FN;a++) for(let b=a+1;b<FN;b++){
      const dx=fnodes[a].x-fnodes[b].x, dy=fnodes[a].y-fnodes[b].y;
      if(dx*dx+dy*dy<(CW*0.10)*(CW*0.10)) fedges.push({a,b});
    }

    /* Concretion positions */
    const concretions:{x:number;y:number;r:number;age:number}[]=[];

    /* Solar wind particle source */
    const swp:{x:number;y:number}[]=Array.from({length:20},(_,i)=>({
      x:(i*117)%(CW*0.32),y:8+(i*43)%(CH*0.32-20),
    }));

    let t=0, raf=0;

    const draw=()=>{
      ctx.clearRect(0,0,CW,CH);
      ctx.fillStyle=V.bg; ctx.fillRect(0,0,CW,CH);

      /* ══ LEFT PANEL: Solar wind erosion + concretions ══ */
      const LW=CW*0.32;

      /* Surface: rocky terrain */
      ctx.fillStyle="#1A1208"; ctx.fillRect(0,CH*0.35,LW,CH-CH*0.35);
      /* Surface texture / Pinnacle Peak silhouette */
      ctx.fillStyle="#2A1A0C"; ctx.beginPath();
      ctx.moveTo(0,CH*0.35);
      for(let x=0;x<LW;x+=4){
        const peak=Math.max(0,(Math.sin(x*0.014)*28+Math.cos(x*0.025)*18+Math.sin(x*0.05)*10)*0.5);
        ctx.lineTo(x,CH*0.35-peak);
      }
      ctx.lineTo(LW,CH*0.35); ctx.closePath(); ctx.fill();

      /* Plate tectonic compression arrows */
      [[0.15*LW,"←"],[0.85*LW,"→"]].forEach(([bx,arr])=>{
        ctx.fillStyle=V.gold+"88"; ctx.font=`700 14px ${V.mono}`;
        ctx.textAlign="center";
        ctx.fillText(arr as string,bx as number,CH*0.42);
      });
      ctx.fillStyle=V.gold+"55"; ctx.font=`8px ${V.mono}`; ctx.textAlign="center";
      ctx.fillText("PLATE COMPRESSION",LW*0.5,CH*0.45);

      /* Solar wind particles from above */
      swp.forEach((p,pi)=>{
        const px=(p.x+t*55+pi*3)%LW;
        const py=p.y+(t*22+pi*7)%(CH*0.33);
        ctx.beginPath(); ctx.arc(px,py,1.8,0,TAU);
        ctx.fillStyle=V.shock+"99"; ctx.fill();
        /* Impact sputtering at surface */
        const surfH=CH*0.35-Math.max(0,(Math.sin(px*0.014)*28+Math.cos(px*0.025)*18)*0.5);
        if(py>surfH-6){
          /* Spawn concretion? */
          if(Math.random()<0.0005){
            concretions.push({x:px,y:surfH+4+(Math.random()*12|0),r:2+Math.random()*3,age:0});
          }
          /* Sputter */
          for(let sp=0;sp<3;sp++){
            const sa=(-PI*0.7+sp*0.5);
            ctx.strokeStyle=V.amb+"44"; ctx.lineWidth=0.7;
            ctx.beginPath(); ctx.moveTo(px,surfH);
            ctx.lineTo(px+Math.cos(sa)*6,surfH+Math.sin(sa)*6); ctx.stroke();
          }
        }
      });

      /* Concretions — condensed mineral nodules */
      for(let ci=concretions.length-1;ci>=0;ci--){
        const cc=concretions[ci];
        cc.age++;
        if(cc.age>350){concretions.splice(ci,1);continue;}
        const alpha=Math.min(1,cc.age/40);
        ctx.beginPath(); ctx.arc(cc.x,cc.y,cc.r,0,TAU);
        ctx.fillStyle=`rgba(180,130,40,${alpha*0.8})`; ctx.fill();
        ctx.strokeStyle=`rgba(210,160,60,${alpha*0.6})`; ctx.lineWidth=0.8; ctx.stroke();
      }
      /* Some fixed hematite concretions ("Blueberries") */
      [[LW*0.2,CH*0.38],[LW*0.45,CH*0.40],[LW*0.6,CH*0.37],[LW*0.7,CH*0.39],
       [LW*0.3,CH*0.42],[LW*0.8,CH*0.41]].forEach(([cx,cy])=>{
        ctx.beginPath(); ctx.arc(cx,cy,3.5,0,TAU);
        ctx.fillStyle="#884422BB"; ctx.fill();
        ctx.strokeStyle="#AA6633CC"; ctx.lineWidth=0.8; ctx.stroke();
      });

      /* Labels */
      ctx.fillStyle=V.shock+"CC"; ctx.font=`700 9px ${V.mono}`; ctx.textAlign="left";
      ctx.fillText("☀ SOLAR WIND",8,18);
      ctx.fillStyle=V.amb+"CC"; ctx.fillText("● CONCRETIONS",8,30);
      ctx.fillStyle=V.gold+"CC"; ctx.fillText("◀▶ PLATE TECTONICS",8,42);
      ctx.fillStyle=V.ink+"88"; ctx.font=`8px ${V.mono}`; ctx.fillText("PINNACLE PEAK",8,CH*0.33);

      /* Divider */
      ctx.strokeStyle=V.dim+"40"; ctx.lineWidth=0.7;
      ctx.beginPath(); ctx.moveTo(LW,0); ctx.lineTo(LW,CH*0.85); ctx.stroke();

      /* ══ CENTRE-RIGHT: Erosion Fascia Network ══ */
      ctx.fillStyle=V.gold+"CC"; ctx.font=`700 9px ${V.mono}`; ctx.textAlign="left";
      ctx.fillText("EROSION FASCIA · FLUID-FILLED CHANNEL NETWORK",CW*0.34,18);

      /* Draw fascia edges (fluid channels) */
      fedges.forEach(e=>{
        const na=fnodes[e.a], nb=fnodes[e.b];
        const flow=Math.sin(t*1.2+e.a*0.4+e.b*0.3)*0.5+0.5;
        ctx.strokeStyle=`rgba(${(200*flow)|0},${(180*flow)|0},${(40+flow*30)|0},${0.35+flow*0.25})`;
        ctx.lineWidth=1.5+flow*1.5;
        ctx.beginPath(); ctx.moveTo(na.x,na.y); ctx.lineTo(nb.x,nb.y); ctx.stroke();
        /* Fluid flow particles along edges */
        const pt=((t*0.6+e.a*0.15)%1);
        const fx=na.x+(nb.x-na.x)*pt, fy=na.y+(nb.y-na.y)*pt;
        ctx.beginPath(); ctx.arc(fx,fy,2.5,0,TAU);
        ctx.fillStyle=`rgba(220,200,80,${flow*0.8})`; ctx.fill();
      });

      /* Draw fascia nodes (junction points, fluid reservoirs) */
      fnodes.forEach((fn,fi)=>{
        const pulse=Math.sin(t*1.5+fi*0.7)*0.5+0.5;
        ctx.beginPath(); ctx.arc(fn.x,fn.y,fn.r+pulse*2,0,TAU);
        ctx.fillStyle=`rgba(200,170,50,${0.5+pulse*0.3})`; ctx.fill();
        ctx.strokeStyle=V.gold+"55"; ctx.lineWidth=0.7; ctx.stroke();
      });

      /* Biological fascia annotation */
      ctx.fillStyle=V.dim+"CC"; ctx.font=`8px ${V.mono}`; ctx.textAlign="left";
      ctx.fillText("● FLUID RESERVOIR (NODE)",CW*0.34,CH*0.86+4);
      ctx.fillText("— FLUID CHANNEL (EDGE)",CW*0.34,CH*0.86+16);
      ctx.fillText("· FLOW FRONT",CW*0.34,CH*0.86+28);

      /* ══ BOTTOM: Salt water → Fresh water era timeline ══ */
      const TY=CH*0.88, TX=10, TW=CW-20, TH=24;
      const ERAS=[
        {label:"NOACHIAN  4.1→3.7 Ga", col:"#2244BB", frac:0.28, note:"GLOBAL OCEAN · HIGH SALT"},
        {label:"HESPERIAN 3.7→3.0 Ga", col:"#3366AA", frac:0.24, note:"ACIDIC BRINE · SULFATE"},
        {label:"AMAZONIAN 3.0 Ga→NOW", col:"#4488DD", frac:0.34, note:"ICE+BRINE POCKETS"},
        {label:"SALT ERA",             col:"#AABBCC", frac:0.08, note:"EVAPORITES"},
        {label:"FRESHWATER",           col:V.blue,    frac:0.06, note:"ISOLATED LAKES"},
      ];
      let tx=TX;
      ERAS.forEach(era=>{
        const ew=TW*era.frac;
        ctx.fillStyle=era.col+"BB"; ctx.fillRect(tx,TY,ew,TH);
        ctx.strokeStyle="rgba(0,0,0,0.3)"; ctx.lineWidth=1;
        ctx.strokeRect(tx,TY,ew,TH);
        ctx.fillStyle=V.ink+"CC"; ctx.font=`700 7px ${V.mono}`; ctx.textAlign="left";
        ctx.fillText(era.label,tx+3,TY+10);
        ctx.fillStyle=V.dim+"AA"; ctx.font=`6.5px ${V.mono}`;
        ctx.fillText(era.note,tx+3,TY+21);
        tx+=ew;
      });
      ctx.fillStyle=V.ink; ctx.font=`700 9px ${V.mono}`; ctx.textAlign="left";
      ctx.fillText("SALT WATER → FRESHWATER ERA · MARS GEOLOGICAL TIME",TX,TY-6);

      ctx.fillStyle=V.ink; ctx.font=`700 10px ${V.mono}`; ctx.textAlign="left";
      ctx.fillText("SOLAR WIND EROSION · CONCRETIONS · FASCIA NETWORK · PLATE TECTONICS · SALT ERA",10,8);

      t+=0.018; raf=requestAnimationFrame(draw);
    };
    draw();
    return()=>cancelAnimationFrame(raf);
  },[]);
  return <canvas ref={ref} width={CW} height={420} style={{width:"100%",borderRadius:6,display:"block"}}/>;
}

/* ─────────────────────────────────────────────────────────────────────────
   PAGE
   ───────────────────────────────────────────────────────────────────────── */
export default function LifeGradientPlanetaryPage(){
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
        {[badge("LIVE SIMULATION"),badge("LIFE GRADIENT",V.photon),badge("CELL MEMBRANE",V.cyan),
          badge("ORGANOIDS",V.green),badge("MARS IMPACT",V.plasma),badge("MOON GLASS",V.cyan),
          badge("GRAND CANYON",V.gold),badge("SOLAR WIND",V.shock),badge("CONCRETIONS",V.amb),
          badge("EROSION FASCIA",V.gold),badge("PLATE TECTONICS",V.vio),badge("SALT ERA",V.blue)]}
        <h1 style={{fontFamily:V.disp,fontSize:"clamp(1.2rem,3.4vw,2.3rem)",color:V.ink,
          margin:"22px 0 8px",letterSpacing:"0.06em",fontWeight:400,lineHeight:1.18}}>
          LIFE · NONLIFE GRADIENT · CELL MEMBRANE · PLANETARY COLLISION · EROSION FASCIA · SALT ERA
        </h1>
        <p style={{fontFamily:V.mono,fontSize:"0.58rem",color:V.dim,letterSpacing:3,margin:"0 0 22px"}}>
          ORGANOIDS · MARS HIT BY VENUS · MOON GLASS SPIRES · SOLAR WIND EROSION · CONCRETIONS · FRESHWATER ERA
        </p>
        {P("Life and nonlife are not separated by a wall. They are separated by a gradient field — a continuous spectrum from the strictly abiotic (mineral, crystalline, no self-replication) through the ambiguous (prions, viruses, protocells, organoids) to the unambiguously living. The boundary is undefined: we cannot draw a line because no line exists.")}
        {P("Mars was likely struck by a large impactor early in solar system history. The Borealis Basin — 10,600 km across, covering 40% of Mars's northern hemisphere — is the largest confirmed impact structure in the solar system. Some researchers propose a Venus-mass body in a destabilised orbit struck Mars, reshaping its geological history and explaining the planet's asymmetric hemispheres.")}
        {P("On the airless surfaces of the Moon and Mars, erosion follows completely different rules. No wind, no rain, no frost-heave. Only solar wind sputtering (charged particles knocking surface atoms loose), micrometeorite impacts, and thermal cycling. The glass structures formed by micrometeorite impacts on the Moon have no erosion agent — they can persist for billions of years, growing taller than skyscrapers relative to their base.")}
      </div>

      {sec("01","Life · Nonlife · Gradient Field · Cell Membrane · Plant Intelligence in Organoids",V.photon,<>
        {P("The gradient from nonlife to life passes through several undefined zones. A crystal grows, but we do not call it alive. A virus replicates, but only inside a living cell. A prion misfolds proteins and causes others to misfold — self-propagating information in pure chemistry. RNA molecules can self-replicate. Where does chemistry end and life begin? The answer is: it does not end cleanly.")}
        {P("The cell membrane is the defining structure of cellular life — the lipid bilayer. Two sheets of phospholipid molecules, heads outward (hydrophilic, water-compatible), tails inward (hydrophobic, water-rejecting). This bilayer self-assembles spontaneously in water from fatty acids — no blueprint required, just thermodynamics. The bilayer is the life/nonlife boundary because it creates an inside distinct from an outside.")}
        {P("Plant organoids are lab-grown clumps of plant cells that self-organize into structures resembling plant meristems or root tips. They show collective electrical behaviour: action potentials propagating across the organoid, coordinated growth responses, and memory-like adaptation to repeated stimuli. Plant intelligence is not metaphorical — it is electrical, chemical, and spatially distributed.")}
        <div style={{border:`1px solid ${V.photon}22`,borderRadius:8,padding:2,marginBottom:14}}>
          <LifeGradientCanvas/>
        </div>
        {cards([
          {h:"LIFE/NONLIFE BOUNDARY",col:V.photon,d:"Proposed life criteria: (1) self-replication; (2) metabolism (energy transformation); (3) homeostasis (internal regulation); (4) response to stimuli; (5) evolution by natural selection. No single criterion works: fire replicates (spreads) and metabolises (burns), but is not alive. Viruses evolve but don't metabolise. Prions replicate but don't evolve. The gradient field acknowledges that 'life' is a human category imposed on a continuous chemical spectrum."},
          {h:"LIPID BILAYER",col:V.cyan,d:"Self-assembly: phospholipid CMC (critical micelle concentration) = 10^-10 M. Below CMC: individual molecules. Above CMC: spontaneous bilayer formation in ~microseconds. Bilayer thickness: 3-5 nm. Fluidity: lipids diffuse laterally at ~1 um^2/s (membrane is a 2D liquid). Membrane potential: -40 to -90 mV in living cells. Spontaneous vesicle formation: the origin of the protocell — no enzyme required, just fatty acids and water."},
          {h:"ORGANOIDS",col:V.green,d:"Plant organoids: stem cells (meristematic cells or callus cells) aggregated in 3D culture. Self-organize into root-like structures without a body plan signal. Show: cell polarity (defined up/down orientation), hormone gradients (auxin accumulation at root-like tip), differential gene expression. Electrical activity: action potentials at 100-200 mV amplitude, propagating at 2-5 cm/s. Memory: repeated touch stimulus → progressive response reduction (habituation) without a nervous system."},
          {h:"PLANT ELECTRICAL SIGNALS",col:V.aurora,d:"Plants have three types of electrical signals: (1) Action Potential (AP): all-or-nothing, -150 mV amplitude, 0.01-0.1 cm/s propagation. (2) Variation Potential (VP): variable amplitude, response to local hydraulic pressure. (3) System Potential (SP): long-distance signal via xylem, triggered by wounding. Receptors: glutamate-like receptors (GLRs) act like ionotropic receptors — similar to animal NMDA receptors. Plants have molecular homologs of many 'brain' proteins."},
          {h:"PROTOCELL ORIGIN",col:V.vio,d:"Fatty acid vesicle protocells: non-enzymatic RNA replication documented inside fatty acid vesicles (Szostak lab, 2001-2024). RNA template copies inside vesicle without enzymes. Vesicles grow by incorporating fatty acids from other vesicles — competitive growth. Division: osmotic stress causes elongation and division into daughter vesicles. The protocell is a spontaneous lipid boundary + self-replicating chemistry — both abiotic processes, life emerging from their combination."},
          {h:"AETHER · GRADIENT",col:V.photon,d:"AETHER models the life/nonlife gradient as a coherence field. A system gains coherence (moves toward life) as its internal information processing becomes self-referential — when the system models itself and adjusts its behaviour based on that model. A crystal has no self-model. A cell does. An organoid has a collective self-model distributed across its electrical field. This is the AETHER definition of life: self-referential coherence above a threshold."},
        ])}
      </>)}

      {sec("02","Mars Hit by Venus · Grand Canyon · Moon Glass Spires · Solar Wind",V.plasma,<>
        {P("The Borealis Basin covers 40% of Mars's northern hemisphere at depths of 4-8 km below the mean surface. It is the largest impact structure in the solar system. The impactor that created it — estimated at 1,600-2,700 km diameter — may have excavated Mars's northern crust entirely. Some models suggest this impact also tilted Mars's rotation axis and contributed to the loss of its magnetic field by disrupting the core dynamo.")}
        {P("Glass micrometeorite structures on the Moon: each micrometeorite impact (particle 0.01-1 mm, velocity 10-72 km/s) vaporises and melts the surrounding regolith, creating glass beads (agglutinates). Some impacts produce glass tubes and spires when the melt is ejected upward and cools rapidly in vacuum. Without atmospheric erosion, these structures persist indefinitely — the oldest glass beads are 4 billion years old.")}
        {P("Solar wind erosion on airless bodies: protons and alpha particles at 400-800 km/s sputter surface atoms loose through elastic collisions. Rate: 0.1-1 mm/billion years on the lunar surface. This is 10 million times slower than terrestrial wind erosion. On Mars with its thin atmosphere, solar wind interacts with the upper atmosphere (the magnetosphere is gone), stripping ~100 grams of atmosphere per second.")}
        <div style={{border:`1px solid ${V.plasma}22`,borderRadius:8,padding:2,marginBottom:14}}>
          <PlanetaryCanvas/>
        </div>
        {cards([
          {h:"BOREALIS BASIN",col:V.plasma,d:"Mars northern lowlands: smooth, low elevation, thin crust (32 km vs. southern 58 km). Borealis Basin diameter: 10,600 km × 8,500 km ellipse. Depth: 4-8 km below mean datum. Impact ejecta: found in Hellas, Argyre, and Isidis basins (secondary impact structures). Age: 4.5 Ga — one of the first geological events on Mars. The impactor (Planet X hypothesis): a Pluto-to-Ceres-sized body from the outer solar system perturbed inward."},
          {h:"GRAND CANYON ORIGIN",col:V.gold,d:"Grand Canyon mainstream geology: carved by the Colorado River over 5-6 million years. But: the canyon is 1,800 m deep, 16 km wide, 446 km long. Alternative hypotheses: (1) Catastrophic flood drainage of an ancient inland sea (Lake Bidahochi or Lake Hopi). (2) Ancient impact structure subsequently carved by water. Evidence for impact: the canyon's western end aligns with magnetic anomalies consistent with impact melt. Sediment volume removed: ~4,750 km^3 — one of the deepest erosional features on Earth."},
          {h:"MOON GLASS TOWERS",col:V.cyan,d:"Lunar glass (agglutinates): 25-50% of lunar regolith by volume is glass, formed by micrometeorite impacts. Glass bead sizes: 10-100 micrometres. Apollo 17 orange soil: pyroclastic glass beads, 3.5 Ga old. Lunar Reconnaissance Orbiter identified glass-rich regions. Glass spire hypothetical heights: without atmosphere, surface tension of molten glass can produce thin structures. Lunar lava tubes: confirmed empty tubes up to 500 m wide (Marius Hills pit). No erosion means pristine structures from 4 Ga remain."},
          {h:"SOLAR WIND SPUTTERING",col:V.shock,d:"Solar wind composition: 96% protons (H+), 4% alpha particles (He2+), trace heavier ions. Energy: 0.5-10 keV/nucleon. Sputtering yield: 0.01-0.1 atoms removed per incident ion (depends on surface material, angle). On Moon: surface darkening (space weathering) from solar wind implantation of H and He. On Mars: solar wind interaction with the ionosphere creates a draped magnetosheath. Mars lost ~90% of its early thick atmosphere to solar wind stripping over 4 Ga."},
          {h:"PINNACLE PEAK GEOLOGY",col:V.vio,d:"Pinnacle formations (geological): erosional remnants where surrounding rock has been removed, leaving resistant towers. Pinnacle Peak (Arizona): Precambrian granite intrusion standing 500 m above surrounding desert — differential erosion (granite resistant to weathering vs. surrounding sedimentary rock). Similar formations: Monument Valley mesas, Bungle Bungle Range (Australia), the Pinnacles (Nambung, Australia). Plate tectonic context: continental collision compresses and uplifts; subsequent erosion removes soft rock, exposing resistant cores as pinnacles."},
          {h:"VENUS COLLISION MODEL",col:V.rose,d:"Venus retrograde rotation (243-day period, opposite to all other planets) requires explanation. Proposed mechanism: giant impact early in solar system (4.5-4.2 Ga) reversed Venus's spin. The impactor mass: ~10^24 kg (Earth-mass object). Connection to Mars: if Venus's impactor was deflected by Jupiter's early migration (Grand Tack model), its trajectory could have intersected the inner solar system and impacted Mars after the Venus event. This would explain both Venus's retrograde rotation and Mars's Borealis Basin."},
        ])}
      </>)}

      {sec("03","Erosion Fascia · Fluid-Filled Networks · Solar Wind Concretions · Salt Water Era",V.gold,<>
        {P("The erosion zone of a geological formation — the network of gullies, rills, ravines, and drainage channels — is structurally analogous to biological fascia. Fascia is the body's fluid-filled connective tissue network: collagen sheets wrapped around every organ, muscle, and bone, filled with interstitial fluid, transmitting mechanical signals instantly across the body. The erosion network transmits water pressure, sediment load, and chemical signals across the landscape in exactly the same way.")}
        {P("Solar wind condensation to concretions: when solar wind protons (H+) strike iron oxide surfaces, they can reduce Fe3+ to Fe2+, producing magnetite and other reduced iron minerals. On Mars, the hematite concretions found by the Opportunity rover (nicknamed 'Blueberries') are thought to have formed by iron-rich groundwater precipitating hematite in permeable sandstone — but solar wind reduction may have contributed to their formation by modifying surface iron chemistry.")}
        {P("The salt water to freshwater era transition on Mars and early Earth marks a fundamental shift in the chemistry available for life. Saline environments (high ionic strength) stabilise certain organic polymers (RNA is more stable in Mg2+ and Na+ rich solutions) but destabilise others (proteins unfold at high salt). The transition to freshwater creates osmotic gradients that can power early membrane pumps — suggesting life may have originated at the salt/fresh boundary.")}
        <div style={{border:`1px solid ${V.gold}22`,borderRadius:8,padding:2,marginBottom:14}}>
          <ErosionFasciaCanvas/>
        </div>
        {cards([
          {h:"FASCIA NETWORK",col:V.gold,d:"Biological fascia: a continuous collagen-hyaluronic acid network pervading the entire body. Fluid volume: ~10 litres of interstitial fluid. Pressure: slightly negative (-3 to -1 mmHg) relative to blood pressure. Function: mechanotransmission (force propagation faster than nerve signals in some contexts), immune cell trafficking, stem cell niche. Erosion fascia analogy: gully network carries water, sediment, and chemicals; pressure equalises through the network; branching follows Horton's Laws (bifurcation ratio 3-5, same as fascia branching)."},
          {h:"HEMATITE CONCRETIONS",col:V.amb,d:"Mars 'Blueberries' (Opportunity, Meridiani Planum, 2004): spherical hematite concretions, 1-6 mm diameter, embedded in jarosite-rich sulfate sandstone. Formation: iron-rich groundwater percolated through porous sandstone; iron precipitated as hematite spheres in an ancient saline lake environment (3.5 Ga). Earth analogs: Moqui marbles (Utah, USA) — same formation mechanism, same geology. Concretions form at chemical gradient boundaries where reducing meets oxidising groundwater."},
          {h:"SALT WATER ERA",col:V.blue,d:"Mars Noachian ocean chemistry (estimated): pH 6-8, salinity 100-200 g/L (vs. Earth ocean 35 g/L), dominated by Mg2+, SO4^2-, Na+, Cl-. Evidence: jarosite (forms only in acidic sulfate-rich water), kieserite (magnesium sulfate), gypsum (calcium sulfate) identified by OMEGA spectrometer on Mars Express. Sulfate minerals cover ~3% of Mars's surface — evaporite residue of the ancient ocean. The salt era records the most hospitable period for Martian life (if it ever existed)."},
          {h:"FRESHWATER TRANSITION",col:V.cyan,d:"Mars freshwater period (late Hesperian/early Amazonian, ~3.0 Ga): hydrated silicate minerals (phyllosilicates: smectites, chlorites) formed in pH-neutral freshwater. Phyllosilicates are older than sulfates on Mars — suggests: (1) early neutral freshwater (4.1-3.7 Ga), (2) then acidic sulfate-rich water (3.7-3.0 Ga), (3) then isolated freshwater pockets. On Earth: the Archean ocean was likely more saline than today; freshwater rivers and lakes appeared as continents emerged above sea level."},
          {h:"SOLAR WIND + IRON",col:V.shock,d:"Solar wind H+ implantation in iron-oxide minerals on airless surfaces (Moon, Mars with thin atm.): reduces Fe3+ to Fe2+ at the surface, darkening the material (space weathering). Reaction: Fe2O3 + 2H+ → 2FeO + H2O (at surfaces, with H+ from solar wind). On the Moon: this produces a thin amorphous iron (Fe0) layer on grain surfaces — responsible for the optical maturation of the lunar regolith. On Mars: may contribute to the formation of magnetite (Fe3O4) in the soil, detectable by magnetic sensors."},
          {h:"AETHER · FIELD DEFINED",col:V.photon,d:"AETHER metaphysical claim: the life/nonlife gradient, the salt/freshwater boundary, and the erosion fascia network are all expressions of the same phenomenon — a field defined by the gradient between two states. Life exists where chemistry crosses a complexity threshold. Salt water transitions where ion concentration crosses a threshold. Erosion fascia forms where soft and hard rock interface. AETHER models knowledge itself as a gradient field: certainty and uncertainty as poles, with crystallised knowledge at one end and undefined potential at the other."},
        ])}
      </>)}
    </div>
  );
}
