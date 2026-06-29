import React, { useEffect, useRef } from "react";
import imgGravitropism  from "@assets/Gemini_Generated_Image_hfeys3hfeys3hfey_1782753878224.png";
import imgMeristem      from "@assets/Gemini_Generated_Image_jb7g0ajb7g0ajb7g_1782753900629.png";
import imgRootHair      from "@assets/Gemini_Generated_Image_sjnv2isjnv2isjnv_1782753926093.png";
import imgMossEcology   from "@assets/Gemini_Generated_Image_yz72jyz72jyz72jy_1782753944404.png";
import imgSaffronRoot   from "@assets/image_1782754082763.png";
import imgPoppyRoot     from "@assets/Gemini_Generated_Image_t2acpet2acpet2ac_1782754133064.png";

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
   CANVAS 1 · Root Tips Growing Semi-Independently · Moss · Flower
   ───────────────────────────────────────────────────────────────────────── */
function RootToFlowerCanvas(){
  const ref=useRef<HTMLCanvasElement>(null);
  useEffect(()=>{
    const cv=ref.current; if(!cv) return;
    const CH=520;
    cv.width=CW; cv.height=CH;
    const ctx=cv.getContext("2d")!;

    const SOIL=200, STEMS=170, FLOWER_Y=60;

    /* 3 independent root paths — each a flat [x,y][] stored as number[][] */
    const roots:number[][][]=[
      [[CW*0.26,SOIL]],[[CW*0.50,SOIL]],[[CW*0.74,SOIL]],
    ];
    const rAng=[PI/2, PI/2, PI/2];
    const rSpd=[0.40, 0.55, 0.36];
    const MAX_PTS=200;

    /* Moss tuft positions (deterministic) */
    const mossX:number[]=[];
    for(let i=0;i<40;i++) mossX.push((i*137.5)%CW);

    let t=0, fr=0, raf=0;

    /* Draw one petal */
    const petal=(cx:number,cy:number,ang:number,pr:number,col:string)=>{
      ctx.beginPath();
      ctx.ellipse(cx+Math.cos(ang)*pr*0.55,cy+Math.sin(ang)*pr*0.55,
                  pr*0.36,pr*0.16,ang,0,TAU);
      ctx.fillStyle=col; ctx.fill();
    };

    /* Draw saffron-style flower */
    const drawFlower=(cx:number,cy:number,openFrac:number,col:string,nPetals:number)=>{
      const pr=32*openFrac;
      for(let p=0;p<nPetals;p++) petal(cx,cy,(p/nPetals)*TAU,pr,col);
      ctx.beginPath(); ctx.arc(cx,cy,8,0,TAU);
      ctx.fillStyle=V.shock; ctx.fill();
      /* Saffron stigmas (3 red-orange threads) */
      for(let s=0;s<3;s++){
        const sa=(s/3)*TAU-PI/6;
        ctx.strokeStyle=V.fire; ctx.lineWidth=1.5;
        ctx.beginPath();
        ctx.moveTo(cx,cy);
        ctx.lineTo(cx+Math.cos(sa)*22*openFrac,cy+Math.sin(sa)*22*openFrac-10*openFrac);
        ctx.stroke();
      }
    };

    const draw=()=>{
      ctx.clearRect(0,0,CW,CH);

      /* Sky gradient (top) → soil gradient (bottom) */
      const bgG=ctx.createLinearGradient(0,0,0,CH);
      bgG.addColorStop(0,"#020A14"); bgG.addColorStop(0.34,"#030C10");
      bgG.addColorStop(SOIL/CH,"#1A0E06"); bgG.addColorStop(0.52,"#2A1408");
      bgG.addColorStop(0.7,"#1E0E06"); bgG.addColorStop(1,"#100806");
      ctx.fillStyle=bgG; ctx.fillRect(0,0,CW,CH);

      /* Soil particles */
      for(let p=0;p<120;p++){
        const px=(p*157+23)%CW, py=SOIL+10+(p*71)%(CH-SOIL-15);
        const ps=0.8+(p%3)*0.6;
        ctx.beginPath(); ctx.arc(px,py,ps,0,TAU);
        ctx.fillStyle=`rgba(${100+p%40},${55+p%20},${20+p%15},0.55)`; ctx.fill();
      }

      /* Moisture halo at depth */
      const mG=ctx.createRadialGradient(CW/2,CH,40,CW/2,CH,300);
      mG.addColorStop(0,"rgba(0,60,120,0.18)"); mG.addColorStop(1,"transparent");
      ctx.fillStyle=mG; ctx.fillRect(0,CH-300,CW,300);

      /* ── Root paths ── */
      roots.forEach((path,ri)=>{
        /* Grow tip */
        if(fr%2===0&&path.length<MAX_PTS){
          const last=path[path.length-1];
          rAng[ri]+=(PI/2-rAng[ri])*0.025; /* gravitropism */
          rAng[ri]+=Math.sin(fr*0.055+ri*2.4)*0.035; /* meander */
          const nx=last[0]+Math.cos(rAng[ri])*rSpd[ri];
          const ny=last[1]+Math.sin(rAng[ri])*rSpd[ri];
          if(ny<CH-10&&nx>10&&nx<CW-10) path.push([nx,ny]);
        }

        /* Draw cells */
        path.forEach((pt,pi)=>{
          const age=path.length-pi;
          const mature=age>30;
          const w=Math.min(4+age*0.04,9), h=4;
          const alpha=Math.min(0.9,0.3+age*0.02);
          ctx.fillStyle=mature
            ?`rgba(140,90,40,${alpha})`
            :`rgba(180,220,160,${alpha*0.9})`;
          ctx.fillRect(pt[0]-w/2,pt[1]-h/2,w,h);

          /* Root hairs on mature cells */
          if(mature&&pi%3===0&&age<160){
            const hDir=(pi%6<3)?-1:1;
            const hLen=10+Math.sin(pi*0.5+ri)*6;
            ctx.strokeStyle=`rgba(120,75,30,0.5)`;
            ctx.lineWidth=0.7;
            ctx.beginPath();
            ctx.moveTo(pt[0],pt[1]);
            ctx.lineTo(pt[0]+hDir*hLen,pt[1]+Math.sin(pi*0.4)*hLen*0.3);
            ctx.stroke();
          }
        });

        /* Tip meristem cap */
        if(path.length>0){
          const last=path[path.length-1];
          ctx.beginPath(); ctx.arc(last[0],last[1],5.5,0,TAU);
          ctx.fillStyle=V.aurora+"DD"; ctx.fill();
          ctx.beginPath(); ctx.arc(last[0],last[1],9,0,TAU);
          ctx.strokeStyle=V.aurora+"44"; ctx.lineWidth=1; ctx.stroke();
        }

        /* Stem from soil to flower for centre root */
        if(ri===1){
          const breathe=Math.sin(t*0.6)*2;
          ctx.strokeStyle=V.green+"88"; ctx.lineWidth=3;
          ctx.beginPath();
          ctx.moveTo(CW/2,SOIL);
          ctx.quadraticCurveTo(CW/2+breathe*5,STEMS+20,CW/2,FLOWER_Y+30);
          ctx.stroke();
        }
      });

      /* ── Moss layer ── */
      mossX.forEach((mx,mi)=>{
        const mh=6+Math.sin(mx*0.08+t*0.3)*4;
        ctx.fillStyle=`rgba(${20+mi%20},${80+mi%40},${20+mi%15},0.75)`;
        ctx.beginPath();
        ctx.arc(mx,SOIL-mh,mh*0.55,PI,TAU);
        ctx.fill();
      });
      /* Ground line */
      ctx.strokeStyle=V.gold+"30"; ctx.lineWidth=1;
      ctx.beginPath(); ctx.moveTo(0,SOIL); ctx.lineTo(CW,SOIL); ctx.stroke();

      /* ── Flower at top (saffron/poppy hybrid) ── */
      const openFrac=Math.min(1,fr/120);
      const breathe=0.93+Math.sin(t*0.7)*0.07;
      drawFlower(CW/2,FLOWER_Y,openFrac*breathe,V.vio+"CC",6);
      /* Poppy buds on outer stems */
      [[CW*0.30,STEMS+10],[CW*0.70,STEMS+10]].forEach(([bx,by],bi)=>{
        const bf=Math.max(0,openFrac-0.25-bi*0.1)/0.75;
        drawFlower(bx,by,bf,V.plasma+"BB",4);
      });

      /* Labels */
      ctx.fillStyle=V.ink; ctx.font=`700 10px ${V.mono}`; ctx.textAlign="left";
      ctx.fillText("ROOT TO FLOWER · SEMI-INDEPENDENT ROOT TIP GROWTH · MOSS BRIDGE",10,16);
      ctx.fillStyle=V.aurora; ctx.font=`9px ${V.mono}`; ctx.textAlign="left";
      ctx.fillText("MERISTEM",roots[0]&&roots[0].length>0?roots[0][roots[0].length-1][0]+10:10,
        roots[0]&&roots[0].length>0?roots[0][roots[0].length-1][1]:SOIL+20);
      ctx.fillStyle=V.green+"CC"; ctx.font=`9px ${V.mono}`;
      ctx.fillText("MOSS",14,SOIL-18);
      ctx.fillStyle=V.gold+"CC"; ctx.font=`9px ${V.mono}`;
      ctx.fillText("SOIL HORIZON",14,SOIL+16);

      fr++; t+=0.018; raf=requestAnimationFrame(draw);
    };
    draw();
    return()=>cancelAnimationFrame(raf);
  },[]);
  return <canvas ref={ref} width={CW} height={520} style={{width:"100%",borderRadius:6,display:"block"}}/>;
}

/* ─────────────────────────────────────────────────────────────────────────
   CANVAS 2 · Horologium Florae · Plant Clock · Saffron · Poppy · 24h Cycle
   ───────────────────────────────────────────────────────────────────────── */
function PlantClockCanvas(){
  const ref=useRef<HTMLCanvasElement>(null);
  useEffect(()=>{
    const cv=ref.current; if(!cv) return;
    const CH=440;
    cv.width=CW; cv.height=CH;
    const ctx=cv.getContext("2d")!;

    const CCX=CW*0.5, CCY=CH*0.51, CR=155;

    /* Plants: [hour open, dur hrs, name, colour, nPetals] */
    const PLANTS=[
      {h:5,  dur:3,  name:"POPPY",       col:V.plasma, nP:4},
      {h:6,  dur:10, name:"SAFFRON",     col:V.vio,    nP:6},
      {h:7,  dur:10, name:"DANDELION",   col:V.shock,  nP:12},
      {h:10, dur:6,  name:"MILK PLANT",  col:"#AADDBB", nP:5},
      {h:12, dur:6,  name:"PASSION FL.", col:"#CC88FF", nP:8},
      {h:16, dur:8,  name:"4 O'CLOCK",   col:V.rose,   nP:5},
      {h:18, dur:6,  name:"EVE.PRIMROSE",col:V.amb,    nP:4},
      {h:20, dur:10, name:"MOONFLOWER",  col:V.cyan,   nP:6},
    ];

    let t=0, raf=0;

    const clockAngle=(h:number)=>{
      /* 12 at top, clockwise; h in 0-24 */
      const a=(h/24)*TAU;
      return {x:CCX+Math.sin(a)*(CR+38), y:CCY-Math.cos(a)*(CR+38)};
    };

    const getOpenFrac=(simH:number,hOpen:number,dur:number)=>{
      const delta=(simH-hOpen+24)%24;
      if(delta<0.5) return delta/0.5;
      if(delta<dur-0.5) return 1;
      if(delta<dur) return 1-(delta-(dur-0.5))/0.5;
      return 0;
    };

    const drawFlower=(cx:number,cy:number,of:number,col:string,np:number)=>{
      const pr=18*of;
      if(pr<1) return;
      for(let p=0;p<np;p++){
        const a=(p/np)*TAU;
        ctx.beginPath();
        ctx.ellipse(cx+Math.cos(a)*pr*0.55,cy+Math.sin(a)*pr*0.55,
                    pr*0.38,pr*0.18,a,0,TAU);
        ctx.fillStyle=col; ctx.fill();
      }
      ctx.beginPath(); ctx.arc(cx,cy,6*Math.max(0.15,of),0,TAU);
      ctx.fillStyle=V.shock; ctx.fill();
    };

    const draw=()=>{
      ctx.clearRect(0,0,CW,CH);
      ctx.fillStyle=V.bg; ctx.fillRect(0,0,CW,CH);

      /* Simulated hour — one 24h cycle ~140 seconds */
      const simH=(t*0.038)%(TAU)/(TAU)*24;

      /* Day/night arc on clock face */
      const DAWN=6, DUSK=20;
      /* Night arc: dusk to dawn */
      ctx.beginPath();
      ctx.moveTo(CCX,CCY);
      ctx.arc(CCX,CCY,CR,(DUSK/24*TAU-PI/2),(DAWN/24*TAU+TAU-PI/2));
      ctx.fillStyle="rgba(0,10,30,0.55)"; ctx.fill();
      /* Day arc */
      ctx.beginPath(); ctx.moveTo(CCX,CCY);
      ctx.arc(CCX,CCY,CR,(DAWN/24*TAU-PI/2),(DUSK/24*TAU-PI/2));
      ctx.fillStyle="rgba(255,200,80,0.06)"; ctx.fill();

      /* Clock face ring */
      ctx.beginPath(); ctx.arc(CCX,CCY,CR,0,TAU);
      ctx.strokeStyle=V.dim+"80"; ctx.lineWidth=1.5; ctx.stroke();

      /* 24-hour tick marks */
      for(let h=0;h<24;h++){
        const a=(h/24)*TAU-PI/2;
        const isMajor=h%6===0;
        const r1=CR-(isMajor?14:7), r2=CR;
        ctx.strokeStyle=isMajor?V.gold+"88":V.dim+"60";
        ctx.lineWidth=isMajor?1.5:0.7;
        ctx.beginPath();
        ctx.moveTo(CCX+Math.cos(a)*r1,CCY+Math.sin(a)*r1);
        ctx.lineTo(CCX+Math.cos(a)*r2,CCY+Math.sin(a)*r2);
        ctx.stroke();
        if(isMajor){
          const label=h===0?"24":String(h);
          ctx.fillStyle=V.dim+"CC"; ctx.font=`700 8px ${V.mono}`;
          ctx.textAlign="center";
          ctx.fillText(label+"h",CCX+Math.cos(a)*(CR-22),CCY+Math.sin(a)*(CR-22)+3);
        }
      }

      /* Draw plants on clock rim */
      PLANTS.forEach(pl=>{
        const of=getOpenFrac(simH,pl.h,pl.dur);
        const pos=clockAngle(pl.h);
        drawFlower(pos.x,pos.y,of,pl.col,pl.nP);
        /* Name label */
        const La=(pl.h/24)*TAU;
        const lx=CCX+Math.sin(La)*(CR+75), ly=CCY-Math.cos(La)*(CR+75);
        ctx.fillStyle=of>0.3?pl.col:V.dim+"66";
        ctx.font=`700 7.5px ${V.mono}`; ctx.textAlign="center";
        ctx.fillText(pl.name,lx,ly-5);
        ctx.fillStyle=V.dim+"66"; ctx.font=`7px ${V.mono}`;
        ctx.fillText(`${pl.h}:00`,lx,ly+6);
      });

      /* Hour hand */
      const ha=(simH/24)*TAU-PI/2;
      const hLen=CR*0.7;
      ctx.strokeStyle=V.aurora; ctx.lineWidth=2;
      ctx.beginPath();
      ctx.moveTo(CCX,CCY);
      ctx.lineTo(CCX+Math.cos(ha)*hLen,CCY+Math.sin(ha)*hLen);
      ctx.stroke();
      ctx.beginPath(); ctx.arc(CCX,CCY,5,0,TAU);
      ctx.fillStyle=V.aurora; ctx.fill();

      /* Clock centre labels */
      ctx.fillStyle=V.ink; ctx.font=`700 10px ${V.mono}`; ctx.textAlign="center";
      ctx.fillText("HOROLOGIUM",CCX,CCY-15);
      ctx.fillText("FLORAE",CCX,CCY);
      const hh=Math.floor(simH), mm=Math.floor((simH-hh)*60);
      ctx.fillStyle=V.gold; ctx.font=`9px ${V.mono}`;
      ctx.fillText(`${String(hh).padStart(2,"0")}:${String(mm).padStart(2,"0")}`,CCX,CCY+18);

      /* Status legend (right side) */
      const LSX=CW*0.86, LSY0=48;
      ctx.fillStyle=V.ink; ctx.font=`700 9px ${V.mono}`; ctx.textAlign="left";
      ctx.fillText("OPEN NOW",LSX,LSY0-8);
      PLANTS.forEach((pl,pi)=>{
        const of=getOpenFrac(simH,pl.h,pl.dur);
        const ly=LSY0+pi*22;
        const open=of>0.2;
        ctx.fillStyle=open?pl.col:V.dim+"55";
        ctx.font=`700 7.5px ${V.mono}`; ctx.textAlign="left";
        ctx.fillText((open?"● ":"○ ")+pl.name,LSX,ly);
      });

      /* Day/Night tag (left side) */
      const isDay=simH>=DAWN&&simH<DUSK;
      ctx.fillStyle=isDay?V.shock:V.vio;
      ctx.font=`700 9px ${V.mono}`; ctx.textAlign="left";
      ctx.fillText(isDay?"☀ DAYTIME":"☽ NIGHT",24,CH-10);

      ctx.fillStyle=V.ink; ctx.font=`700 10px ${V.mono}`; ctx.textAlign="left";
      ctx.fillText("PLANT CLOCK · CIRCADIAN OPENING · SAFFRON · POPPY · MILK PLANT · MOONFLOWER",10,16);

      t+=0.018; raf=requestAnimationFrame(draw);
    };
    draw();
    return()=>cancelAnimationFrame(raf);
  },[]);
  return <canvas ref={ref} width={CW} height={440} style={{width:"100%",borderRadius:6,display:"block"}}/>;
}

/* ─────────────────────────────────────────────────────────────────────────
   CANVAS 3 · Slug · Pollen · Malacophily · Pollen Tube Germination
   ───────────────────────────────────────────────────────────────────────── */
function SlugPollenCanvas(){
  const ref=useRef<HTMLCanvasElement>(null);
  useEffect(()=>{
    const cv=ref.current; if(!cv) return;
    const CH=310;
    cv.width=CW; cv.height=CH;
    const ctx=cv.getContext("2d")!;

    /* Falling pollen positions (deterministic pattern) */
    const pollenY:number[]=Array.from({length:18},(_,i)=>(i*57.3)%CH);
    const pollenX:number[]=Array.from({length:18},(_,i)=>CW*0.15+i*CW*0.005+(i%3)*CW*0.15);

    let t=0, raf=0;

    const drawPollen=(cx:number,cy:number,r:number)=>{
      /* Outer exine wall */
      ctx.beginPath(); ctx.arc(cx,cy,r,0,TAU);
      ctx.fillStyle=V.shock+"CC"; ctx.fill();
      ctx.strokeStyle=V.amb; ctx.lineWidth=1.2; ctx.stroke();
      /* Aperture lines (colpi) — 3 grooves */
      for(let ap=0;ap<3;ap++){
        const a=(ap/3)*TAU;
        ctx.strokeStyle=V.fire+"88"; ctx.lineWidth=0.9;
        ctx.beginPath();
        ctx.arc(cx,cy,r,a-0.6,a+0.6); ctx.stroke();
      }
      /* Spines */
      for(let sp=0;sp<12;sp++){
        const sa=(sp/12)*TAU;
        ctx.strokeStyle=V.amb+"77"; ctx.lineWidth=0.7;
        ctx.beginPath();
        ctx.moveTo(cx+Math.cos(sa)*r,cy+Math.sin(sa)*r);
        ctx.lineTo(cx+Math.cos(sa)*(r+3),cy+Math.sin(sa)*(r+3));
        ctx.stroke();
      }
      /* Inner intine + generative cell */
      ctx.beginPath(); ctx.arc(cx,cy,r*0.65,0,TAU);
      ctx.strokeStyle=V.shock+"44"; ctx.lineWidth=0.7; ctx.stroke();
      /* Generative cell */
      ctx.beginPath();
      ctx.ellipse(cx-r*0.15,cy,r*0.28,r*0.18,0.4,0,TAU);
      ctx.fillStyle=V.vio+"66"; ctx.fill();
      /* Tube nucleus */
      ctx.beginPath(); ctx.arc(cx+r*0.18,cy,r*0.12,0,TAU);
      ctx.fillStyle=V.blue+"88"; ctx.fill();
    };

    const drawSlug=(slx:number,sly:number)=>{
      ctx.save(); ctx.translate(slx,sly);
      /* Mucus trail */
      for(let m=0;m<60;m++){
        const mx=-m*2.4, alpha=Math.max(0,0.14-m*0.0022);
        ctx.fillStyle=`rgba(150,210,130,${alpha})`;
        ctx.fillRect(mx-5+Math.sin(m*0.28)*4,-5,11,9);
      }
      /* Body */
      ctx.beginPath();
      ctx.moveTo(-46,0);
      ctx.bezierCurveTo(-46,-14,48,-16,48,0);
      ctx.bezierCurveTo(48,14,-46,14,-46,0);
      ctx.fillStyle="#4A6A38"; ctx.fill();
      ctx.strokeStyle="#2E4A22"; ctx.lineWidth=0.8; ctx.stroke();
      /* Mantle */
      ctx.beginPath(); ctx.ellipse(-4,-4.5,22,11,0,0,TAU);
      ctx.fillStyle="#3A5A28"; ctx.fill();
      /* Pollen grains on body */
      for(let pg=0;pg<9;pg++){
        const px=-36+pg*8.5, py=-7+Math.sin(pg*1.5)*4;
        drawPollen(px,py,3.5);
      }
      /* Upper optical tentacles */
      const wb=Math.sin(t*0.75)*0.08;
      ctx.strokeStyle="#2E4A22"; ctx.lineWidth=1.8; ctx.lineCap="round";
      ctx.beginPath(); ctx.moveTo(38,-5);
      ctx.quadraticCurveTo(42+wb*6,-18,44+wb*10,-22); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(33,-5);
      ctx.quadraticCurveTo(30+wb*4,-16,28+wb*7,-20); ctx.stroke();
      /* Eye tips */
      ctx.beginPath(); ctx.arc(44+wb*10,-22,3,0,TAU);
      ctx.fillStyle="#88BB55"; ctx.fill();
      ctx.beginPath(); ctx.arc(28+wb*7,-20,3,0,TAU);
      ctx.fillStyle="#88BB55"; ctx.fill();
      /* Lower tactile tentacles */
      ctx.strokeStyle="#2E4A22"; ctx.lineWidth=1.2;
      ctx.beginPath(); ctx.moveTo(40,2);
      ctx.quadraticCurveTo(46,10,44,14); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(34,2);
      ctx.quadraticCurveTo(38,8,36,12); ctx.stroke();
      ctx.restore();
    };

    const drawPollenTube=(tx:number,ty:number,tubePct:number)=>{
      /* Stigma (fluffy receptor surface) */
      ctx.fillStyle="#88AA44"; ctx.font=`13px serif`;
      for(let fi=0;fi<8;fi++){
        const fx=tx-18+fi*5, fy=ty-4+Math.sin(fi*1.2+t)*3;
        ctx.beginPath(); ctx.arc(fx,fy,3.5,0,TAU);
        ctx.fillStyle="#88BB44CC"; ctx.fill();
      }
      /* Style column */
      ctx.strokeStyle="#668833"; ctx.lineWidth=4;
      ctx.beginPath(); ctx.moveTo(tx,ty); ctx.lineTo(tx,ty+90); ctx.stroke();
      /* Pollen grain on stigma */
      drawPollen(tx,ty-16,8);
      /* Pollen tube growing down */
      const tubeLen=80*tubePct;
      ctx.strokeStyle=V.shock+"BB"; ctx.lineWidth=2;
      ctx.beginPath();
      ctx.moveTo(tx,ty);
      ctx.lineTo(tx+Math.sin(t*0.4)*4,ty+tubeLen);
      ctx.stroke();
      /* Tube contents */
      if(tubeLen>20){
        ctx.beginPath(); ctx.arc(tx+Math.sin(t*0.4)*4,ty+tubeLen-6,5,0,TAU);
        ctx.fillStyle=V.vio+"99"; ctx.fill();
      }
      /* Ovary */
      ctx.beginPath();
      ctx.ellipse(tx,ty+105,22,14,0,0,TAU);
      ctx.fillStyle="#446622AA"; ctx.fill();
      ctx.strokeStyle="#5A8833"; ctx.lineWidth=1; ctx.stroke();
      ctx.beginPath(); ctx.arc(tx,ty+102,5,0,TAU);
      ctx.fillStyle=V.shock+"66"; ctx.fill();
      /* Labels */
      ctx.fillStyle=V.green+"CC"; ctx.font=`700 8px ${V.mono}`; ctx.textAlign="left";
      ctx.fillText("STIGMA",tx+12,ty-10);
      ctx.fillText("STYLE",tx+12,ty+42);
      ctx.fillStyle=V.shock+"CC"; ctx.fillText("POLLEN TUBE",tx+12,ty+tubeLen);
      ctx.fillStyle="#88BB44CC"; ctx.fillText("OVARY",tx+12,ty+108);
    };

    const draw=()=>{
      ctx.clearRect(0,0,CW,CH);
      ctx.fillStyle=V.bg; ctx.fillRect(0,0,CW,CH);

      /* Panel dividers */
      ctx.strokeStyle=V.dim+"30"; ctx.lineWidth=0.7; ctx.setLineDash([4,4]);
      ctx.beginPath(); ctx.moveTo(CW*0.33,16); ctx.lineTo(CW*0.33,CH-10); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(CW*0.66,16); ctx.lineTo(CW*0.66,CH-10); ctx.stroke();
      ctx.setLineDash([]);

      /* ── Panel 1: Pollen grain anatomy ── */
      const P1X=CW*0.165, P1Y=CH*0.48;
      drawPollen(P1X,P1Y,44);
      ctx.fillStyle=V.shock; ctx.font=`700 10px ${V.mono}`; ctx.textAlign="center";
      ctx.fillText("POLLEN GRAIN",P1X,P1Y-56);
      ctx.fillStyle=V.dim+"CC"; ctx.font=`8.5px ${V.mono}`;
      [{t:"EXINE",y:-52+18},{t:"COLPUS",y:-52+30},{t:"GENERATIVE CELL",y:-52+42},
       {t:"TUBE NUCLEUS",y:-52+54}].forEach(l=>{
        ctx.fillText(l.t,P1X,P1Y+l.y);
      });

      /* ── Panel 2: Slug carrying pollen ── */
      const slugX=CW*0.47+Math.sin(t*0.22)*15, slugY=CH*0.55;
      drawSlug(slugX,slugY);
      /* Airborne pollen drift */
      pollenY.forEach((py,pi)=>{
        const pyd=(py+t*18)%CH;
        const pxd=pollenX[pi]%(CW*0.65);
        if(pxd<CW*0.32||pxd>CW*0.66) return;
        drawPollen(pxd,pyd,4.5);
      });
      ctx.fillStyle=V.ink; ctx.font=`700 10px ${V.mono}`; ctx.textAlign="center";
      ctx.fillText("MALACOPHILY",CW*0.495,CH-28);
      ctx.fillStyle=V.dim+"BB"; ctx.font=`8.5px ${V.mono}`;
      ctx.fillText("SLUG POLLINATION",CW*0.495,CH-16);

      /* ── Panel 3: Pollen tube germination ── */
      const tubePct=Math.min(1,(Math.sin(t*0.4)*0.5+0.5));
      drawPollenTube(CW*0.835,CH*0.12,tubePct);

      /* Header */
      ctx.fillStyle=V.ink; ctx.font=`700 10px ${V.mono}`; ctx.textAlign="left";
      ctx.fillText("POLLEN ANATOMY · SLUG · MALACOPHILY · POLLEN TUBE GERMINATION",10,14);

      t+=0.018; raf=requestAnimationFrame(draw);
    };
    draw();
    return()=>cancelAnimationFrame(raf);
  },[]);
  return <canvas ref={ref} width={CW} height={310} style={{width:"100%",borderRadius:6,display:"block"}}/>;
}

/* ─────────────────────────────────────────────────────────────────────────
   PAGE
   ───────────────────────────────────────────────────────────────────────── */
export default function PollenClockRootsPage(){
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
        {[badge("LIVE SIMULATION"),badge("BOTANY",V.green),badge("ROOT TIPS",V.gold),
          badge("MOSS",V.green),badge("SAFFRON",V.vio),badge("POPPY",V.plasma),
          badge("PLANT CLOCK",V.shock),badge("SLUG",V.green),badge("POLLEN",V.shock),
          badge("MALACOPHILY",V.rose),badge("CIRCADIAN",V.cyan),badge("ROOT TO FLOWER",V.gold)]}
        <h1 style={{fontFamily:V.disp,fontSize:"clamp(1.3rem,3.6vw,2.4rem)",color:V.ink,
          margin:"22px 0 8px",letterSpacing:"0.06em",fontWeight:400,lineHeight:1.18}}>
          POLLEN · SLUG · PLANT CLOCK · ROOT TIPS GROWING SEMI-INDEPENDENTLY
        </h1>
        <p style={{fontFamily:V.mono,fontSize:"0.58rem",color:V.dim,letterSpacing:3,margin:"0 0 22px"}}>
          FROM ROOT TO MOSS TO FLOWER · SAFFRON · POPPY · MILK PLANT · HOROLOGIUM FLORAE · MALACOPHILY
        </p>
        {P("From a single root tip, life ascends. Root tips grow semi-independently: each tip has its own meristematic clock, its own gravitropic sensor, its own water-seeking algorithm. Two tips from the same plant may grow in opposite directions. Together they map the soil's chemical landscape as a distributed computing problem solved by geometry and tropism.")}
        {P("Moss is the bridge substrate — living between root and flower. Anchored to the ground, without a vascular system, without true roots, yet photosynthesising and reproducing with spores. Moss is the evolutionary ancestor of all land plants, the first organism to leave the ocean, the substrate on which all subsequent plant complexity is built.")}
        {P("The slug carries pollen on its mucus trail. This is malacophily — mollusk pollination — a rare but documented phenomenon. The slug's mucus is a non-Newtonian fluid: thick at rest, thin under shear. Pollen grains adhere to the mucus surface, remain viable for hours, and transfer to flower stigmas when the slug moves between plants.")}
      </div>

      {sec("01","From Root to Moss to Flower · Semi-Independent Root Tip Growth",V.green,<>
        {P("The root tip is a meristem — a region of perpetual cell division. The apical meristem sits behind the root cap (calyptra), which protects it as it pushes through soil. Cells in the meristematic zone divide every 12-36 hours (faster in the centre, slower at the periphery). Daughter cells pushed backward enter the elongation zone, stretching 10x their original length, driving root growth.")}
        {P("Each root tip is semi-independent: it responds locally to gravity (gravitropism: starch-filled amyloplasts settle downward, triggering auxin redistribution), water gradient (hydrotropism), touch (thigmotropism), and chemical gradients (chemotropism toward phosphate, nitrate). Two tips from the same plant may sense different gradients and grow in completely different directions — distributed soil mapping.")}
        {P("Moss emerges at the ground surface as the bridge layer. Bryophytes (mosses, liverworts, hornworts) were the first plants to colonise land (470 million years ago). They have no vascular system (no xylem or phloem), so they are limited to a few centimetres in height. But they create the microclimate for vascular plants: retaining moisture, moderating temperature, and accumulating nutrients.")}
        <div style={{border:`1px solid ${V.green}22`,borderRadius:8,padding:2,marginBottom:14}}>
          <RootToFlowerCanvas/>
        </div>
        {cards([
          {h:"MERISTEMATIC ZONE",col:V.aurora,d:"The apical meristem contains stem cells (initial cells) that divide asymmetrically: one daughter remains as an initial (self-renewal), one becomes a transit-amplifying cell that divides further and differentiates. Meristem size: ~0.5-2 mm. Cell cycle time: 12-36 hours. Division rate: ~2 mm/day tip elongation in Arabidopsis. Meristem maintains pluripotency through hormone gradients: high auxin at tip, high cytokinin above."},
          {h:"GRAVITROPISM",col:V.gold,d:"Gravity sensing: starch-filled plastids (amyloplasts) sediment to the bottom of statocyte cells in the root cap columella. Sedimentation triggers asymmetric redistribution of auxin (IAA) via PIN auxin transporters. Higher auxin on the lower side of the root inhibits elongation (at root-effective concentrations), causing the tip to bend downward. Response time: 10-30 minutes for initial curvature, 1-3 hours for complete reorientation."},
          {h:"ROOT HAIR FUNCTION",col:V.green,d:"Root hairs are single-cell elongations of epidermal cells (trichoblasts). Length: 0.1-1 cm. Lifetime: 2-3 weeks. Function: dramatically increase surface area (up to 70x) for water and nutrient uptake. Root hair density: 10-40 per mm of root. Hair tip growth: Ca2+ gradient maintained by inositol-IP3 signalling, cytoskeleton remodelling, and targeted exocytosis of cell wall material at the growing tip."},
          {h:"MOSS ECOLOGY",col:V.green,d:"Moss life cycle: gametophyte (haploid, the green carpet) dominates; sporophyte (diploid, the stalk) is short-lived and dependent on gametophyte. Reproduction: spores (haploid) germinate on wet surfaces, grow into protonemata (filamentous), then into leafy gametophores. Sphagnum (peat moss): can hold 20x its weight in water. Peat bogs store 550 Gt of carbon — more than all forests combined."},
          {h:"SAFFRON ROOT",col:V.vio,d:"Crocus sativus: the saffron crocus grows from a corm (swollen stem, not a bulb). Corm diameter: 3-5 cm. Roots emerge from the corm base, growing to 15-30 cm. Root system is shallow, fibrous, and highly branched — adapted for the rocky, well-drained soils of Iran, Spain, and Kashmir. Corm produces daughter corms (cormlets) annually — clonal propagation, since C.sativus is a triploid sterile hybrid, propagated vegetatively for 3,500+ years."},
          {h:"POPPY ROOT",col:V.plasma,d:"Papaver somniferum: taproot system reaching 60 cm depth. Lateral root branching: first-order laterals every 5-10 mm. Latex canals (laticiferous cells) run through roots, stems, and leaves — forming a connected network. When damaged, latex pressure drives milky fluid to the wound site (coagulating to seal it). Alkaloid content in roots: morphine, codeine, noscapine — though highest concentration in the seed capsule latex."},
        ])}
      </>)}

      {sec("02","The Horologium Florae · Plant Clock · Saffron · Poppy · Milk Plant · Circadian Timing",V.shock,<>
        {P("Linnaeus's Flower Clock (Horologium Florae, 1748) noted that different plant species open and close their flowers at predictable times of day. This is driven by the plant's circadian clock — an endogenous ~24-hour oscillator based on a transcriptional-translational feedback loop involving CCA1, LHY, TOC1, and PRR proteins. The clock runs even in constant darkness or constant light.")}
        {P("Saffron (Crocus sativus) opens between 6-8 AM, triggered by the combination of morning temperature rise and light intensity crossing a photoreceptor threshold (phytochrome B activated by red light; cryptochrome 1 activated by blue light). The three red stigmas — the saffron spice — are only receptive during this brief opening window. Harvesting must occur by 10 AM before the flower closes.")}
        {P("The milk plant (Euphorbia family) regulates latex flow on a daily clock: latex pressure in the laticiferous canal system peaks at midday (driven by osmotic pressure changes) and drops at night. The 'milk' of Euphorbia is a complex emulsion of alkaloids, terpenoids, and rubber precursors — not true milk, but functionally analogous as a wound-sealing fluid under pressure.")}
        <div style={{border:`1px solid ${V.shock}22`,borderRadius:8,padding:2,marginBottom:14}}>
          <PlantClockCanvas/>
        </div>
        {cards([
          {h:"CIRCADIAN CLOCK",col:V.shock,d:"Plant circadian oscillator: CCA1/LHY (morning genes) activate PRR9/PRR7 repressors; PRR5/TOC1 (evening genes) repress CCA1/LHY; evening complex (EC = LUX/ELF3/ELF4) gates TOC1. Three interlocked loops produce a 24.5h free-running period. Temperature compensation: the clock runs at the same speed from 15-30°C (Q10 ≈ 1.1, vs. most biochemical reactions Q10 ≈ 2). Entrainment by light and temperature resets the clock daily."},
          {h:"SAFFRON TIMING",col:V.vio,d:"Crocus sativus flower opening triggered by: phytochrome Pfr/Pr ratio (red:far-red light); cryptochrome 1 blue-light response; and a temperature threshold (>12°C). Stigma (style tip) receptive 6-10 AM only. Pollen viable for 4-6 hours after anther dehiscence. The 3 stigmas per flower must be harvested by hand in this narrow window — why saffron costs $3,000-$10,000/kg. 75,000 flowers = 450g saffron."},
          {h:"POPPY CLOCK",col:V.plasma,d:"Papaver rhoeas (field poppy): flowers open 5-7 AM (earliest in the clock), petals fall within 48 hours. Opening triggered by turgor-driven expansion of petal cells (K+ influx via light-activated H+/K+-ATPase pumps). Poppy petals are among the most fragile — no structural support, only turgor pressure holds them open. Closing by sunset: osmotic loss reversal. P.somniferum (opium poppy): alkaloid synthesis peaks at 4-6 PM."},
          {h:"MILK PLANT",col:V.green,d:"Euphorbiaceae (spurges, milk plants): laticiferous canals form a continuous network throughout the plant, under positive osmotic pressure (0.5-3 atm). Daily cycle: latex pressure peaks midday (driven by root water uptake + photosynthetic osmolyte production). The 'milk' contains: rubber (cis-polyisoprene), alkaloids, terpenoids, enzymes (proteases, lipases). Euphorbia tirucalli (pencil tree) latex used as biofuel feedstock — 10-20 barrels/hectare/year."},
          {h:"FOUR O'CLOCK",col:V.rose,d:"Mirabilis jalapa: flowers open at exactly 4 PM local solar time (16:00) — one of the most precise plant clocks. Mechanism: light-driven K+ efflux from guard cells of the petal epidermis causes turgor loss and flower opening. The opening signal is actually DECREASING light (afternoon decline), not morning increase — the plant is tracking the light gradient, not the absolute intensity. Fragrance emission also timed: peak at 6-9 PM for moth pollination."},
          {h:"MOONFLOWER CLOCK",col:V.cyan,d:"Ipomoea alba (moonflower): opens at dusk (20:00-21:00), closes by dawn. Pollinated by hawk moths (Sphingidae) that fly at night, attracted by white colour (highly reflective in low light) and sweet night fragrance (benzyl benzoate, linalool). Opening mechanism: temperature drop triggers corolla expansion — opposite to day-opening flowers. Moonflower pollen remains viable overnight (8-12 hours) — adapted to the slower nocturnal pollinator activity pace."},
        ])}
      </>)}

      {sec("03","Slug · Pollen · Malacophily · The Unlikely Pollinator · Tube Germination",V.rose,<>
        {P("Malacophily is pollination by mollusks — slugs and snails. It is the rarest pollination syndrome, documented in only a handful of plant species. Slugs carry pollen in their mucus, which acts as a viscous adhesive. The mucus is non-Newtonian: at rest (slug stationary) it is gel-like and holds pollen in place; under shear (slug moving) it thins and spreads pollen across the flower surface.")}
        {P("A pollen grain is a marvel of engineering. The exine (outer wall) is made of sporopollenin, one of the most chemically resistant biological polymers — preserved in sediments for millions of years (pollen is the basis of palynology). Inside: the intine (cellulose), the vegetative cell (the tube nucleus directing pollen tube growth), and the generative cell (which divides to produce two sperm cells).")}
        {P("Pollen tube germination: when a compatible pollen grain lands on the stigma, the pollen tube ruptures through one of the apertures (colpi or pores in the exine) and grows down the style guided by chemical attractants (gamma-aminobutyric acid, lipid signals, Ca2+ gradients). Growth rate: 1-5 mm/hour. The tube must travel the length of the style before the flower is pollinated.")}
        <div style={{border:`1px solid ${V.rose}22`,borderRadius:8,padding:2,marginBottom:14}}>
          <SlugPollenCanvas/>
        </div>
        {cards([
          {h:"POLLEN GRAIN ANATOMY",col:V.shock,d:"Exine: sporopollenin polymer (phenylpropanoid + fatty acid condensate). Chemically inert — survives acid digestion, pressure, and 100 million years in sediment. Colpi: apertures (grooves or pores) through which pollen tube emerges. Aperture number taxonomically diagnostic: monolete (1), tricolpate (3 colpi, most angiosperms), polycolpate (many). Intine: cellulose + pectin inner wall. Cytoplasm: vegetative nucleus (tube direction) + generative nucleus (becomes 2 sperm)."},
          {h:"SPOROPOLLENIN",col:V.gold,d:"Sporopollenin is the most resistant biological polymer known. Chemical formula disputed (phenylpropanoid + fatty acid cross-polymer). Survives: 15 M sulfuric acid, 500°C dry heat, 100 MPa pressure. Found intact in 270 million year old Permian pollen (Vittatina, preserved in coal). Plant evolutionary innovation: allowed pollen to survive airborne transport, physical abrasion, UV radiation. No synthetic equivalent has matched its durability."},
          {h:"MALACOPHILY",col:V.rose,d:"Documented in: Clarkia amoena (farewell-to-spring), Mimulus (monkeyflower), some orchids. Slug (Arion rufus, Deroceras reticulatum) collects pollen on foot mucus while feeding on petals. Pollen viability in slug mucus: 30-180 minutes. Effective transfer distance: <1 m (slug range). Contrast with wind (km) or bee (km) pollination. Advantage: reliable wet-surface contact, no flight energy cost, operates in rainy conditions when bees shelter."},
          {h:"POLLEN TUBE GROWTH",col:V.green,d:"Pollen tube tip growth: exclusively at the very apex. Mechanism: Ca2+ gradient (highest at tip, ~10 uM), regulated by NADPH oxidase generating ROS, which activates Ca2+ channels. Vesicle fusion at tip delivers cell wall material (pectin, callose). Cytoplasm streams rearward (reverse fountain streaming) — Golgi vesicles move to tip, organelles flow back. Speed: 1-5 mm/h in vivo, up to 1 cm/h in vitro (lily). Pollen tube length in corn: 30 cm (silk length)."},
          {h:"SLUG MUCUS",col:V.green,d:"Slug mucus: glycoprotein + water hydrogel. Concentration: 1-4% polymer (96-99% water). Viscosity: 10,000 cP at rest, 10 cP under shear (non-Newtonian: shear-thinning). Adhesion force: Denny (1980) measured 0.2 N on glass. Slug uses mucus as lubricant, adhesive, and communication medium simultaneously. Trail following: slugs can track mucus trails of conspecifics (mate-finding). Mucus also repels desiccation and copper ions (hence copper rings around gardens)."},
          {h:"SAFFRON STIGMA",col:V.vio,d:"Saffron stigma (Crocus sativus): 3 thread-like stigma branches, brilliant red-orange, 25-30 mm long. Colour from crocin (a carotenoid glycoside — also found in Gardenia). Flavour from safranal (from picrocrocin degradation). Weight per flower: 30 mg fresh, 7 mg dry. Contains: antioxidant crocin (anti-tumour, anti-depressant properties), safranal (aroma), picrocrocin (bitter taste). Iran produces 90% of world supply. The stigma IS the spice — dried style tips, hand-harvested."},
        ])}
      </>)}

      {sec("04","Root · Moss · Flower · The Vertical Axis of Plant Intelligence",V.vio,<>
        {P("The axis from root to flower is the fundamental axis of plant information processing. The root reads: gravity vector, water potential gradient, oxygen concentration, ion concentrations, mycorrhizal chemical signals, touch from soil particles, and pathogen chemical signatures. This information travels upward as electrical signals (action potentials at 1-10 cm/s) and chemical signals (auxin, cytokinin, ABA, ethylene at mm/h).")}
        {P("Moss occupies the transition zone: it is simultaneously substrate and bridge. As a substrate, it retains water (up to 20x its dry weight), moderates temperature fluctuations, and provides physical structure for seedling establishment. As a bridge, it connects the mineral soil substrate (populated by bacteria and fungi) with the aerial environment (populated by insects and light).")}
        {P("The flower is the plant's information compression and transmission organ. It compresses the plant's genetic information (pollen) into a durable, mobile packet. It transmits this packet using pollinators (bees, butterflies, birds, bats, slugs) as carrier waves. The flower's timing, colour, shape, and fragrance are all encoded messages optimised for specific carrier frequencies — plant language written in the interface between chemistry and physics.")}
        {(()=>{
          const Pl=(src:string,label:string,cap:string,col:string)=>(
            <figure key={label} style={{margin:"0 0 28px",borderRadius:8,overflow:"hidden",border:`1px solid ${col}44`,background:"rgba(0,0,0,0.45)"}}>
              <img src={src} alt={label} loading="lazy" style={{width:"100%",display:"block"}} />
              <figcaption style={{padding:"10px 15px",borderTop:`1px solid ${col}22`}}>
                <div style={{fontFamily:V.mono,fontSize:"0.52rem",color:col,letterSpacing:"0.15em",marginBottom:6}}>{label}</div>
                <div style={{fontFamily:V.serif,fontSize:"0.82rem",color:V.ink,opacity:0.7,lineHeight:1.65}}>{cap}</div>
              </figcaption>
            </figure>
          );
          return (<>
            {Pl(imgGravitropism,"GRAVITROPISM · AMYLOPLAST SEDIMENTATION · AUXIN SIGNALLING · DIFFERENTIAL ELONGATION",
              "Gravity sensing: starch-filled plastids (amyloplasts) sediment to the bottom of statocyte cells in the root cap columella. Sedimentation triggers asymmetric redistribution of auxin (IAA) via PIN auxin transporters — higher auxin accumulates on the lower side. At root-effective concentrations, high IAA inhibits elongation, so the lower side grows slower than the upper side, bending the root tip downward. Macro-scale curvature response time: 10–30 min for initial curvature, 1–3 hours for complete reorientation.",col:V.gold)}
            {Pl(imgMeristem,"MERISTEMATIC ZONE · APICAL MERISTEM STRUCTURE · CELLULAR DYNAMICS · HORMONE GRADIENTS",
              "Root Apical Meristem (RAM): Quiescent Centre (QC) surrounded by initial cells (stem cells) that divide asymmetrically — one daughter self-renews, one becomes a transit-amplifying (TA) cell that divides further and differentiates. Meristem size: ~0.5–2 mm. Tip elongation: ~2 mm/day (Arabidopsis). Hormone gradients maintain pluripotency: high Auxin (IAA) at tip suppresses differentiation; high Cytokinin above tip promotes cell division. Three zones: Meristematic (blue) → Elongation (purple) → Maturation (green).",col:V.aurora)}
            {Pl(imgRootHair,"ROOT HAIR FUNCTION · SINGLE-CELL ELONGATION · TIP GROWTH · CALCIUM SIGNALLING · NUTRIENT UPTAKE",
              "Root hairs are single-cell elongations of trichoblast epidermal cells. Length: 0.1–1 cm. Lifetime: 2–3 weeks. Density: 10–40 per mm of root. Surface area increase: up to 70×, dramatically increasing water and nutrient uptake capacity. Tip growth is driven by a focused Ca²⁺ gradient maintained by inositol-IP₃ signalling, Ca²⁺ influx through hyperpolarisation-activated channels, cytoskeleton remodelling, and targeted exocytosis of cell wall material at the growing tip. Nutrient pathways: apoplastic (around cells) and symplastic (through plasmodesmata).",col:V.green)}
            {Pl(imgMossEcology,"MOSS ECOLOGY · LIFE CYCLE · SPHAGNUM WATER RETENTION · PEAT BOG CARBON SINK",
              "Moss life cycle: haploid gametophyte (the green carpet) dominates; diploid sporophyte (stalk + capsule) is short-lived and dependent. Spores germinate on wet surfaces → filamentous protonemata → leafy gametophores → sporophytes → spore release. Sphagnum (peat moss): hyaline cells (large, porous, dead) absorb and hold 20× dry weight in water. Peat bogs store 550 Gt of carbon — more than all forests combined (~280–450 Gt C). Anoxic, waterlogged conditions slow decomposition, locking organic carbon in partially decomposed peat and permafrost.",col:V.photon)}
            {Pl(imgSaffronRoot,"SAFFRON ROOT · CROCUS SATIVUS CORM ANATOMY · CLONAL PROPAGATION · FIBROUS ROOT SYSTEM",
              "Crocus sativus grows from a corm (swollen stem tissue, not a bulb). Corm diameter: 3–5 cm. Anatomy: tunica (protective scale leaves), apical bud (shoot meristem), axillary buds (cormlet initiation), vascular tissue, corm base. Annual cycle: corm → seasonal growth (stigma/style production) → senescence → daughter corm + cormlets. Root system: adventitious roots from corm base, shallow, fibrous, highly branched. Root depth: ~20 cm. Root length: 15–30 cm. Adapted for rocky, well-drained soils (Iran, Spain, Kashmir). C. sativus is a triploid sterile hybrid — propagated vegetatively for 3,500+ years, no viable seeds produced.",col:V.vio)}
            {Pl(imgPoppyRoot,"POPPY ROOT · PAPAVER SOMNIFERUM TAPROOT · LATICIFEROUS SYSTEM · ALKALOID DISTRIBUTION",
              "Papaver somniferum: taproot system reaching 60 cm depth. Lateral root branching: first-order laterals every 5–10 mm (high density). Laticiferous system: latex canals (laticiferous cells) form a connected network through roots, stems, leaves, and seed capsule. Damage mechanism: root damage → latex pressure → latex exudation → coagulation → wound seal. Alkaloid distribution: morphine, codeine, and noscapine present throughout the plant; highest concentration in seed capsule latex. Root latex: lower alkaloid vesicle count than seed capsule. Annual cycle: germination → growth → flowering → seed capsule production → senescence.",col:V.plasma)}
          </>);
        })()}
        {cards([
          {h:"ROOT INTELLIGENCE",col:V.gold,d:"Plants solve distributed optimisation problems with no nervous system. Root foraging: when nutrient patches are found (localised nitrate, phosphate), root proliferation increases 10-fold in that patch (precision foraging). When nutrient patches are depleted, root growth shifts elsewhere. This is the 'economic root growth' model — cost-benefit analysis of carbon invested in roots vs. nutrient return, optimised by auxin/cytokinin signalling."},
          {h:"MYCORRHIZAL NETWORK",col:V.green,d:"90% of land plant species form mycorrhizal partnerships. Arbuscular mycorrhizal fungi (AMF) extend root reach by up to 100x (hyphae: 1-10 um diameter, roots: 0.1-3 mm). Exchange: plant provides 20-30% of photosynthate as carbon; fungus provides phosphate, nitrate, water. The 'Wood Wide Web': common mycorrhizal networks connect multiple plants. Carbon transfer between trees documented. Signals (strigolactones from plant, LCOs from fungi) initiate partnership."},
          {h:"ELECTRICAL SIGNALLING",col:V.cyan,d:"Plants generate action potentials (APs): stimulus (touch, temperature, wounding) triggers membrane depolarisation, propagating at 1-10 cm/s. Different signals from nerves: no voltage-gated Na+ channels; plant APs use Cl-, Ca2+, and K+ channels. Wounded plant: glutamate-like receptors (GLRs) sense glutamate released by damaged cells, trigger Ca2+ wave that travels to distal leaves, inducing jasmonic acid synthesis and defensive gene expression."},
          {h:"POLLEN AS PACKET",col:V.shock,d:"Pollen grain as information packet: 2n genome compressed into ~10-50 um particle. Energy stored: lipid reserves for pollen tube growth (enough for several cm of tube). Surface decoration: species-specific sculptural patterns (exine ornamentation) — the plant's 'QR code' that pollinators and palynologists read. Allergenic proteins on exine surface: plant-pollinator recognition codes that trigger immune responses when misread by mammalian immune systems."},
          {h:"AETHER · ROOT GRAPH",col:V.vio,d:"The AETHER Knowledge Graph has a 'root structure' — foundational nodes (axioms, physical constants, mathematical theorems) that anchor the network, growing semi-independently like root tips. New knowledge nodes grow from these foundations following gradient descent in a knowledge potential field (analogous to gravitropism). The moss layer is the AETHER bridge substrate: the indexing and cross-referencing layer that connects deep foundations to surface expressions."},
          {h:"CIRCADIAN COHERENCE",col:V.aurora,d:"All organisms with circadian clocks (plants, fungi, cyanobacteria, animals) synchronise to the same 24-hour external cycle but via completely different molecular mechanisms (convergent evolution). AETHER proposes: the 24-hour clock is an attractor in the information-processing landscape — the most coherent period given the Earth's rotation, solar energy availability, and predator-prey timing relationships. All life phases to the same drum because the drum is planetary."},
        ])}
      </>)}
    </div>
  );
}
