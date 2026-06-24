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

/* Tree palette — soft underground hues */
const TCOL=["#A06040","#5090C0","#60B070","#C0A040"];
const TNAME=["WILLOW","BIRCH","OAK","PINE"];

/* ─────────────────────────────────────────────────────────────────────────
   CANVAS 1 · LIVE GROWTH SIMULATION · Hyphae extend from root tips through soil
   ───────────────────────────────────────────────────────────────────────── */
function GrowthCanvas(){
  const ref=useRef<HTMLCanvasElement>(null);
  useEffect(()=>{
    const cv=ref.current; if(!cv) return;
    const CH=580;
    cv.width=CW; cv.height=CH;
    const ctx=cv.getContext("2d")!;

    const SOIL_Y=90;  /* soil surface y */
    const TREE_X=[CW*0.12,CW*0.38,CW*0.62,CW*0.88];

    /* Pre-generate soil texture (painted once onto an offscreen canvas) */
    const soilCv=document.createElement("canvas");
    soilCv.width=CW; soilCv.height=CH-SOIL_Y;
    const sc=soilCv.getContext("2d")!;

    /* Base soil colour - layered */
    const baseG=sc.createLinearGradient(0,0,0,CH-SOIL_Y);
    baseG.addColorStop(0,"#1C1208"); baseG.addColorStop(0.35,"#150E06");
    baseG.addColorStop(0.7,"#100A04"); baseG.addColorStop(1,"#0A0704");
    sc.fillStyle=baseG; sc.fillRect(0,0,CW,CH-SOIL_Y);

    /* Mineral particles */
    for(let p=0;p<1200;p++){
      const px=(p*137+11)%CW, py=(p*97+7)%(CH-SOIL_Y);
      const pr=0.5+p%5*0.4;
      const lum=30+p%50;
      const hue=p%3===0?20:p%3===1?30:10;
      sc.beginPath(); sc.arc(px,py,pr,0,TAU);
      sc.fillStyle=`rgba(${lum+hue},${lum},${lum-10},${0.18+p%6*0.04})`; sc.fill();
    }
    /* Organic matter flecks */
    for(let p=0;p<300;p++){
      const px=(p*67+31)%CW, py=(p*43+17)%(CH-SOIL_Y*0.6);
      sc.beginPath(); sc.arc(px,py,1+p%3*0.5,0,TAU);
      sc.fillStyle=`rgba(${60+p%20},${40+p%15},${10},${0.25})`; sc.fill();
    }
    /* Pore spaces — slightly lighter ellipses */
    for(let p=0;p<80;p++){
      const px=(p*113+17)%CW, py=30+(p*79+9)%(CH-SOIL_Y-60);
      const pr=3+p%8;
      sc.beginPath(); sc.ellipse(px,py,pr,pr*(0.4+p%3*0.2),p*0.3,0,TAU);
      sc.fillStyle=`rgba(40,30,20,${0.35})`; sc.fill();
    }

    /* ── NETWORK STATE ── */
    /* Segments drawn so far */
    const SEGS:{x1:number;y1:number;x2:number;y2:number;tid:number;lv:number;born:number}[]=[];
    /* Active growing tips */
    const TIPS:{x:number;y:number;ang:number;tid:number;lv:number;life:number;maxLife:number}[]=[];
    /* Anastomosis junctions */
    const JUNCT:{x:number;y:number;ta:number;tb:number;glow:number;born:number}[]=[];
    /* Signal packets */
    const PKTS:{x:number;y:number;tx:number;ty:number;col:string;label:string;life:number}[]=[];

    /* Seed initial root tips — each tree has 6-8 initial threads */
    TREE_X.forEach((tx,ti)=>{
      const n=6+ti%2;
      for(let ri=0;ri<n;ri++){
        const ang=PI*0.15+ri*(PI*0.7/n)+ti*0.1; /* downward spread */
        TIPS.push({x:tx+(ri-n/2)*12, y:SOIL_Y+50+ri*8, ang, tid:ti, lv:0, life:0, maxLife:120+ri*30});
      }
    });

    let frame=0, raf=0;

    const draw=()=>{
      /* Draw soil texture */
      ctx.clearRect(0,0,CW,CH);
      ctx.fillStyle=V.bg; ctx.fillRect(0,0,CW,SOIL_Y);
      ctx.drawImage(soilCv,0,SOIL_Y);

      /* Soil horizon lines */
      [0.30,0.58,0.82].forEach((frac,hi)=>{
        const hy=SOIL_Y+(CH-SOIL_Y)*frac;
        ctx.strokeStyle=`rgba(60,50,30,0.18)`; ctx.lineWidth=0.7; ctx.setLineDash([8,12]);
        ctx.beginPath(); ctx.moveTo(0,hy); ctx.lineTo(CW,hy); ctx.stroke();
        const labels=["A-HORIZON · TOPSOIL","B-HORIZON · MINERAL","C-HORIZON · PARENT MATERIAL"];
        ctx.fillStyle=`rgba(120,100,60,0.28)`; ctx.font=`6.5px ${V.mono}`; ctx.textAlign="right"; ctx.setLineDash([]);
        ctx.fillText(labels[hi],CW-8,hy-3);
      });

      /* ── TREE TRUNKS ── */
      TREE_X.forEach((tx,ti)=>{
        /* Above-ground trunk */
        ctx.strokeStyle=ti===3?"#5A3010":"#6A3818"; ctx.lineWidth=7-ti%2;
        ctx.beginPath(); ctx.moveTo(tx,0); ctx.lineTo(tx,SOIL_Y); ctx.stroke();
        ctx.fillStyle=TCOL[ti]+"BB"; ctx.font=`700 9px ${V.mono}`; ctx.textAlign="center";
        ctx.fillText(TNAME[ti],tx,14);

        /* Taproot descending */
        ctx.strokeStyle=TCOL[ti]+"55"; ctx.lineWidth=2.5;
        ctx.beginPath(); ctx.moveTo(tx,SOIL_Y); ctx.lineTo(tx,SOIL_Y+60); ctx.stroke();
        /* Lateral roots */
        for(let lr=0;lr<4;lr++){
          const la=(lr-1.5)*0.35;
          ctx.strokeStyle=TCOL[ti]+"44"; ctx.lineWidth=1.5;
          ctx.beginPath(); ctx.moveTo(tx,SOIL_Y+20+lr*8);
          ctx.lineTo(tx+Math.cos(la)*32,SOIL_Y+20+lr*8+Math.sin(la)*20); ctx.stroke();
          /* Root tip */
          ctx.beginPath(); ctx.arc(tx+Math.cos(la)*32,SOIL_Y+20+lr*8+Math.sin(la)*20,2.5,0,TAU);
          ctx.fillStyle=TCOL[ti]+"55"; ctx.fill();
        }
      });

      /* ── DRAW ACCUMULATED SEGMENTS ── */
      SEGS.forEach(seg=>{
        const age=frame-seg.born;
        const fadeIn=Math.min(1,age/12);
        const col=TCOL[seg.tid];
        const alpha=(seg.lv===0?0.35:seg.lv===1?0.22:seg.lv===2?0.14:0.08)*fadeIn;
        const lw=seg.lv===0?1.4:seg.lv===1?0.9:seg.lv===2?0.55:0.35;
        ctx.strokeStyle=`rgba(${parseInt(col.slice(1,3),16)},${parseInt(col.slice(3,5),16)},${parseInt(col.slice(5,7),16)},${alpha})`;
        ctx.lineWidth=lw;
        ctx.beginPath(); ctx.moveTo(seg.x1,seg.y1); ctx.lineTo(seg.x2,seg.y2); ctx.stroke();
      });

      /* ── GROW TIPS ── */
      if(TIPS.length<300){
        const GROW_RATE=1.6;
        const BRANCH_PROB=0.006;
        const MAX_SEGS=9000;

        for(let ti2=TIPS.length-1;ti2>=0;ti2--){
          const tp=TIPS[ti2];
          tp.life+=1;
          if(tp.life>tp.maxLife||SEGS.length>=MAX_SEGS){TIPS.splice(ti2,1);continue;}

          /* Slight gravitropism (tips lean downward) */
          const gravPull=0.012;
          tp.ang+=(Math.PI/2-tp.ang)*gravPull+(Math.random()-0.5)*0.06;
          /* Confine within canvas */
          if(tp.y>CH-15) tp.ang=PI-tp.ang;
          if(tp.x<5) tp.ang=Math.abs(tp.ang-PI/2)+PI/2;
          if(tp.x>CW-5) tp.ang=PI-Math.abs(tp.ang-PI/2)+PI/2;

          /* Chemotropism: attracted toward tips from other trees */
          let atr=0, ata=0;
          TIPS.forEach(other=>{
            if(other.tid===tp.tid) return;
            const dx=other.x-tp.x, dy=other.y-tp.y;
            const d=Math.sqrt(dx*dx+dy*dy);
            if(d<90&&d>5){atr+=1/d; ata+=Math.atan2(dy,dx);}
          });
          if(atr>0) tp.ang+=(ata-tp.ang)*Math.min(0.08,atr*2);

          /* Extend */
          const nx=tp.x+Math.cos(tp.ang)*GROW_RATE+(Math.random()-0.5)*0.4;
          const ny=tp.y+Math.sin(tp.ang)*GROW_RATE+(Math.random()-0.5)*0.4;
          SEGS.push({x1:tp.x,y1:tp.y,x2:nx,y2:ny,tid:tp.tid,lv:tp.lv,born:frame});
          tp.x=nx; tp.y=ny;

          /* Branching */
          if(Math.random()<BRANCH_PROB&&tp.lv<4&&TIPS.length<280){
            TIPS.push({
              x:tp.x, y:tp.y,
              ang:tp.ang+(Math.random()-0.5)*1.2,
              tid:tp.tid, lv:tp.lv+1,
              life:0, maxLife:tp.maxLife*(0.5+Math.random()*0.3),
            });
          }

          /* Anastomosis check: is this tip near a tip from a different tree? */
          TIPS.forEach(other=>{
            if(other.tid===tp.tid) return;
            const dx=other.x-tp.x, dy=other.y-tp.y;
            const d=Math.sqrt(dx*dx+dy*dy);
            if(d<10){
              /* Create junction */
              const jx=(tp.x+other.x)/2, jy=(tp.y+other.y)/2;
              const alreadyExists=JUNCT.some(j=>Math.hypot(j.x-jx,j.y-jy)<18);
              if(!alreadyExists){
                JUNCT.push({x:jx,y:jy,ta:tp.tid,tb:other.tid,glow:1,born:frame});
                /* Draw a bright connecting segment */
                SEGS.push({x1:tp.x,y1:tp.y,x2:other.x,y2:other.y,tid:tp.tid,lv:0,born:frame});
                /* Spawn a signal packet at this junction */
                if(PKTS.length<60){
                  const destTree=TREE_X[other.tid];
                  PKTS.push({x:jx,y:jy,tx:destTree,ty:SOIL_Y+55,col:TCOL[other.tid],
                    label:Math.random()<0.3?"Ca²⁺":Math.random()<0.5?"SUGAR":"P",life:1});
                }
              }
            }
          });
        }
      }

      /* ── ANASTOMOSIS JUNCTION NODES ── */
      JUNCT.forEach(jn=>{
        const age=frame-jn.born;
        jn.glow=Math.max(0,1-age*0.012);
        const outerR=3+jn.glow*6;
        /* Outer glow */
        const jG=ctx.createRadialGradient(jn.x,jn.y,0,jn.x,jn.y,outerR+8);
        jG.addColorStop(0,`rgba(255,220,80,${jn.glow*0.4+0.05})`);
        jG.addColorStop(1,"transparent");
        ctx.fillStyle=jG; ctx.fillRect(jn.x-outerR-8,jn.y-outerR-8,outerR*2+16,outerR*2+16);
        /* Core dot */
        ctx.beginPath(); ctx.arc(jn.x,jn.y,2.2+jn.glow*2,0,TAU);
        ctx.fillStyle=`rgba(220,190,60,${jn.glow*0.7+0.2})`; ctx.fill();
        /* Flash ring for new junctions */
        if(jn.glow>0.7){
          ctx.beginPath(); ctx.arc(jn.x,jn.y,outerR,0,TAU);
          ctx.strokeStyle=`rgba(255,240,100,${(jn.glow-0.7)*2})`; ctx.lineWidth=1; ctx.stroke();
        }
      });

      /* ── SIGNAL PACKETS ── */
      for(let pi=PKTS.length-1;pi>=0;pi--){
        const pk=PKTS[pi];
        pk.x+=(pk.tx-pk.x)*0.012+(Math.random()-0.5)*0.3;
        pk.y+=(pk.ty-pk.y)*0.012+(Math.random()-0.5)*0.3;
        pk.life-=0.004;
        if(pk.life<=0){PKTS.splice(pi,1);continue;}
        const pG=ctx.createRadialGradient(pk.x,pk.y,0,pk.x,pk.y,6);
        pG.addColorStop(0,pk.col+"BB"); pG.addColorStop(1,"transparent");
        ctx.fillStyle=pG; ctx.fillRect(pk.x-6,pk.y-6,12,12);
        ctx.beginPath(); ctx.arc(pk.x,pk.y,2,0,TAU);
        ctx.fillStyle=pk.col+"DD"; ctx.fill();
        ctx.fillStyle=pk.col+"88"; ctx.font=`700 6px ${V.mono}`; ctx.textAlign="center";
        ctx.fillText(pk.label,pk.x,pk.y-6);
      }

      /* Stats overlay */
      ctx.fillStyle=V.ink+"55"; ctx.font=`7px ${V.mono}`; ctx.textAlign="left";
      ctx.fillText(`SEGMENTS: ${SEGS.length}  TIPS: ${TIPS.length}  JUNCTIONS: ${JUNCT.length}  PACKETS: ${PKTS.length}`,10,SOIL_Y-6);

      ctx.fillStyle=V.ink; ctx.font=`700 10px ${V.mono}`; ctx.textAlign="left";
      ctx.fillText("MYCORRHIZAL HYPHAE · LIVE GROWTH · ANASTOMOSIS · SIGNAL PACKETS",10,14);

      frame++; raf=requestAnimationFrame(draw);
    };
    draw();
    return()=>cancelAnimationFrame(raf);
  },[]);
  return <canvas ref={ref} width={CW} height={580} style={{width:"100%",borderRadius:6,display:"block"}}/>;
}

/* ─────────────────────────────────────────────────────────────────────────
   CANVAS 2 · ANASTOMOSIS CLOSE-UP · Hyphal fusion in molecular detail
   ───────────────────────────────────────────────────────────────────────── */
function AnastomosisCanvas(){
  const ref=useRef<HTMLCanvasElement>(null);
  useEffect(()=>{
    const cv=ref.current; if(!cv) return;
    const CH=320;
    cv.width=CW; cv.height=CH;
    const ctx=cv.getContext("2d")!;

    /* State machine */
    /* Phases: 0=approach, 1=contact, 2=fusion, 3=flow, then reset */
    let phase=0;
    let phaseT=0;

    /* Two approaching tips */
    const tipA={x:CW*0.20, y:CH*0.50, ang:0.15}; /* grows rightward */
    const tipB={x:CW*0.80, y:CH*0.50, ang:PI-0.15}; /* grows leftward */
    /* Segment trails */
    const trailA:{x:number;y:number}[]=[{x:CW*0.05,y:CH*0.50}];
    const trailB:{x:number;y:number}[]=[{x:CW*0.95,y:CH*0.50}];
    /* Post-fusion signal packets */
    const FLIT:{x:number;y:number;dir:number;life:number;col:string}[]=[];

    /* Chemical gradient particles */
    const CHEM:{x:number;y:number;vx:number;vy:number;life:number;src:number}[]=[];

    let t=0, raf=0;

    const resetSim=()=>{
      phase=0; phaseT=0;
      tipA.x=CW*0.20; tipA.y=CH*0.50+Math.sin(t)*10; tipA.ang=0.10+(Math.random()-0.5)*0.06;
      tipB.x=CW*0.80; tipB.y=CH*0.50+Math.sin(t)*10; tipB.ang=PI-0.10+(Math.random()-0.5)*0.06;
      trailA.length=0; trailA.push({x:CW*0.05,y:tipA.y});
      trailB.length=0; trailB.push({x:CW*0.95,y:tipB.y});
      FLIT.length=0; CHEM.length=0;
    };

    const drawTrail=(trail:{x:number;y:number}[],col:string,lv:number)=>{
      if(trail.length<2) return;
      ctx.strokeStyle=col+`${(0.55*255)|0}`.padStart(2,"0").slice(0,2);
      ctx.strokeStyle=`rgba(${parseInt(col.slice(1,3),16)},${parseInt(col.slice(3,5),16)},${parseInt(col.slice(5,7),16)},0.55)`;
      ctx.lineWidth=lv===0?2.5:1.2;
      ctx.beginPath(); ctx.moveTo(trail[0].x,trail[0].y);
      trail.forEach(p=>ctx.lineTo(p.x,p.y));
      ctx.stroke();
      /* Main cable glow */
      if(lv===0){
        ctx.strokeStyle=`rgba(${parseInt(col.slice(1,3),16)},${parseInt(col.slice(3,5),16)},${parseInt(col.slice(5,7),16)},0.12)`;
        ctx.lineWidth=8;
        ctx.beginPath(); ctx.moveTo(trail[0].x,trail[0].y);
        trail.forEach(p=>ctx.lineTo(p.x,p.y));
        ctx.stroke();
      }
    };

    const draw=()=>{
      ctx.clearRect(0,0,CW,CH);
      /* Soil bg */
      const bgG=ctx.createLinearGradient(0,0,0,CH);
      bgG.addColorStop(0,"#120E08"); bgG.addColorStop(1,"#0A0804");
      ctx.fillStyle=bgG; ctx.fillRect(0,0,CW,CH);
      /* Soil particles */
      for(let p=0;p<200;p++){
        const px=(p*97+37)%CW, py=(p*53+11)%CH;
        ctx.beginPath(); ctx.arc(px,py,0.6+p%3*0.3,0,TAU);
        ctx.fillStyle=`rgba(80,60,30,${0.12+p%4*0.04})`; ctx.fill();
      }

      phaseT++;

      /* ── PHASE 0: APPROACH ── */
      if(phase===0){
        /* Tips grow toward each other */
        const dist2=Math.hypot(tipB.x-tipA.x,tipB.y-tipA.y);
        const growRate=dist2>80?1.4:0.6; /* slow down near contact */

        /* Slight angle nudge toward each other */
        const toB=Math.atan2(tipB.y-tipA.y,tipB.x-tipA.x);
        tipA.ang+=(toB-tipA.ang)*0.04+(Math.random()-0.5)*0.03;
        tipA.x+=Math.cos(tipA.ang)*growRate;
        tipA.y+=Math.sin(tipA.ang)*growRate;
        trailA.push({x:tipA.x,y:tipA.y});

        const toA=Math.atan2(tipA.y-tipB.y,tipA.x-tipB.x);
        tipB.ang+=(toA-tipB.ang)*0.04+(Math.random()-0.5)*0.03;
        tipB.x+=Math.cos(tipB.ang)*growRate;
        tipB.y+=Math.sin(tipB.ang)*growRate;
        trailB.push({x:tipB.x,y:tipB.y});

        /* Spawn chemical gradient particles from tips */
        if(phaseT%8===0){
          for(let c=0;c<2;c++){
            CHEM.push({x:tipA.x+(Math.random()-0.5)*8,y:tipA.y+(Math.random()-0.5)*8,
              vx:(Math.random()-0.5)*0.5+0.15,vy:(Math.random()-0.5)*0.5,life:1,src:0});
            CHEM.push({x:tipB.x+(Math.random()-0.5)*8,y:tipB.y+(Math.random()-0.5)*8,
              vx:(Math.random()-0.5)*0.5-0.15,vy:(Math.random()-0.5)*0.5,life:1,src:1});
          }
        }

        if(dist2<16) phase=1;
        /* Safety: if tips go off screen, reset */
        if(tipA.x>CW*0.75||tipB.x<CW*0.25) resetSim();
      }

      /* ── PHASE 1: CONTACT / WALL DISSOLUTION ── */
      else if(phase===1){
        if(phaseT===1){
          /* Spawn many chemical particles for the fusion event */
          for(let c=0;c<30;c++){
            CHEM.push({
              x:(tipA.x+tipB.x)/2+(Math.random()-0.5)*20,
              y:(tipA.y+tipB.y)/2+(Math.random()-0.5)*20,
              vx:(Math.random()-0.5)*1.2,vy:(Math.random()-0.5)*1.2,life:1,src:2,
            });
          }
        }
        if(phaseT>40) phase=2;
      }

      /* ── PHASE 2: FUSION FLASH ── */
      else if(phase===2){
        if(phaseT===1){
          /* Burst */
          for(let f=0;f<24;f++){
            FLIT.push({
              x:(tipA.x+tipB.x)/2,y:(tipA.y+tipB.y)/2,
              dir:f/24*TAU,life:1,
              col:f%2===0?TCOL[0]:TCOL[1],
            });
          }
        }
        if(phaseT>30) phase=3;
      }

      /* ── PHASE 3: SIGNAL FLOW ── */
      else if(phase===3){
        /* Packets flow both ways along the now-connected thread */
        if(phaseT%25===0&&FLIT.length<40){
          const goRight=Math.random()<0.5;
          FLIT.push({
            x:goRight?trailA[0].x:trailB[0].x,
            y:goRight?trailA[0].y:trailB[0].y,
            dir:goRight?0:PI,life:1,col:goRight?TCOL[0]:TCOL[1],
          });
        }
        if(phaseT>320) resetSim();
      }

      /* ── DRAW CHEMICALS ── */
      for(let ci=CHEM.length-1;ci>=0;ci--){
        const cp=CHEM[ci];
        cp.x+=cp.vx; cp.y+=cp.vy; cp.life-=0.018;
        if(cp.life<=0){CHEM.splice(ci,1);continue;}
        const chemCol=cp.src===2?"rgba(255,240,80":"rgba(0,200,200";
        ctx.beginPath(); ctx.arc(cp.x,cp.y,1.5,0,TAU);
        ctx.fillStyle=`${chemCol},${cp.life*0.55})`; ctx.fill();
      }

      /* ── DRAW TRAILS ── */
      drawTrail(trailA,TCOL[0],0);
      drawTrail(trailB,TCOL[1],0);

      /* Tip glow */
      if(phase===0||phase===1){
        [tipA,tipB].forEach((tp,ti)=>{
          const tG=ctx.createRadialGradient(tp.x,tp.y,0,tp.x,tp.y,12);
          tG.addColorStop(0,TCOL[ti]+"88"); tG.addColorStop(1,"transparent");
          ctx.fillStyle=tG; ctx.fillRect(tp.x-12,tp.y-12,24,24);
          ctx.beginPath(); ctx.arc(tp.x,tp.y,3,0,TAU);
          ctx.fillStyle=TCOL[ti]+"CC"; ctx.fill();
          /* TIP label */
          ctx.fillStyle=TCOL[ti]+"99"; ctx.font=`700 7px ${V.mono}`; ctx.textAlign="center";
          ctx.fillText(`TIP ${TNAME[ti]}`,tp.x,tp.y-(ti===0?14:14));
        });
      }

      /* ── DRAW FLIT PARTICLES (burst/flow) ── */
      for(let fi=FLIT.length-1;fi>=0;fi--){
        const fp=FLIT[fi];
        fp.life-=phase===3?0.004:0.025;
        if(fp.life<=0){FLIT.splice(fi,1);continue;}
        const spd=phase===3?1.8:3;
        fp.x+=Math.cos(fp.dir)*spd; fp.y+=Math.sin(fp.dir)*spd;
        ctx.beginPath(); ctx.arc(fp.x,fp.y,2+fp.life*2,0,TAU);
        const col=fp.col;
        ctx.fillStyle=`rgba(${parseInt(col.slice(1,3),16)},${parseInt(col.slice(3,5),16)},${parseInt(col.slice(5,7),16)},${fp.life*0.8})`;
        ctx.fill();
      }

      /* Fusion flash */
      if(phase===2&&phaseT<15){
        const frac=1-phaseT/15;
        const mx=(tipA.x+tipB.x)/2, my=(tipA.y+tipB.y)/2;
        const flashG=ctx.createRadialGradient(mx,my,0,mx,my,50*frac);
        flashG.addColorStop(0,`rgba(255,240,120,${frac*0.8})`);
        flashG.addColorStop(0.5,`rgba(255,200,60,${frac*0.3})`);
        flashG.addColorStop(1,"transparent");
        ctx.fillStyle=flashG; ctx.fillRect(mx-55,my-55,110,110);
        ctx.fillStyle=`rgba(255,240,100,${frac*0.9})`; ctx.font=`700 9px ${V.mono}`;
        ctx.textAlign="center"; ctx.fillText("ANASTOMOSIS",mx,my-32);
      }

      /* Phase label */
      const pLabels=["CHEMOTROPIC APPROACH","CELL WALL CONTACT","FUSION — CYTOPLASM MERGING","SIGNAL FLOW ESTABLISHED"];
      const pCols=[TCOL[0],V.shock,V.photon,V.green];
      ctx.fillStyle=pCols[phase]+"CC"; ctx.font=`700 9px ${V.mono}`; ctx.textAlign="center";
      ctx.fillText(pLabels[phase],CW/2,CH-24);
      ctx.fillStyle=V.dim+"88"; ctx.font=`7px ${V.mono}`;
      ctx.fillText("LOOP: WILLOW (LEFT) + BIRCH (RIGHT) HYPHAL TIPS",CW/2,CH-12);

      ctx.fillStyle=V.ink; ctx.font=`700 10px ${V.mono}`; ctx.textAlign="left";
      ctx.fillText("ANASTOMOSIS · HYPHAL FUSION IN DETAIL · CHEMOTROPISM → CONTACT → MERGE → FLOW",10,14);

      t+=0.016; raf=requestAnimationFrame(draw);
    };
    draw();
    return()=>cancelAnimationFrame(raf);
  },[]);
  return <canvas ref={ref} width={CW} height={320} style={{width:"100%",borderRadius:6,display:"block"}}/>;
}

/* ─────────────────────────────────────────────────────────────────────────
   CANVAS 3 · HI-FI CABLE VIEW · Signal propagation along established network
   ───────────────────────────────────────────────────────────────────────── */
function HiFiCableCanvas(){
  const ref=useRef<HTMLCanvasElement>(null);
  useEffect(()=>{
    const cv=ref.current; if(!cv) return;
    const CH=360;
    cv.width=CW; cv.height=CH;
    const ctx=cv.getContext("2d")!;

    const TREES_X=[CW*0.09,CW*0.33,CW*0.60,CW*0.85];
    const CABLE_Y=CH*0.50;

    /* Signal types */
    const SIG_TYPES=[
      {label:"SUGAR (C₁₂H₂₂O₁₁)",col:V.shock,speed:0.8},
      {label:"PHOSPHORUS (PO₄³⁻)",col:V.cyan,speed:1.1},
      {label:"Ca²⁺ SIGNAL",col:V.photon,speed:2.4},
      {label:"JASMONATE",col:V.rose,speed:0.9},
      {label:"WATER",col:V.blue,speed:1.6},
    ];

    /* Active signal beads */
    const BEADS:{x:number;y:number;tx:number;ty:number;speed:number;col:string;label:string;
      progress:number;pathLen:number;fromT:number;toT:number}[]=[];

    let frame=0, raf=0;
    let stressTree=0, stressTimer=0;

    const cableY=(t2:number)=>{
      const frac=(t2-TREES_X[0])/(TREES_X[TREES_X.length-1]-TREES_X[0]);
      return CABLE_Y+Math.sin(frac*PI)*35;
    };

    const spawnSignal=(from:number,to:number,type:number)=>{
      const st=SIG_TYPES[type];
      const dist=Math.abs(TREES_X[to]-TREES_X[from]);
      BEADS.push({
        x:TREES_X[from], y:cableY(TREES_X[from]),
        tx:TREES_X[to], ty:cableY(TREES_X[to]),
        speed:st.speed, col:st.col, label:st.label,
        progress:0, pathLen:dist, fromT:from, toT:to,
      });
    };

    const draw=()=>{
      ctx.clearRect(0,0,CW,CH);
      const bgG=ctx.createLinearGradient(0,0,0,CH);
      bgG.addColorStop(0,"#08060412"); bgG.addColorStop(1,"#100E0A");
      ctx.fillStyle=bgG; ctx.fillRect(0,0,CW,CH);

      /* ── MAIN HYPHAL CABLE ── */
      /* Multi-strand cable texture */
      for(let strand=0;strand<8;strand++){
        const sOff=(strand-3.5)*2.2;
        const sAmp=6+strand*1.2;
        const sPhase=strand*0.7;
        ctx.beginPath();
        for(let sx=TREES_X[0];sx<=TREES_X[TREES_X.length-1];sx+=3){
          const sy=cableY(sx)+sOff+Math.sin(sx*0.04+sPhase+frame*0.005)*sAmp*0.25;
          sx===TREES_X[0]?ctx.moveTo(sx,sy):ctx.lineTo(sx,sy);
        }
        const a=strand===0||strand===7?0.25:strand<2||strand>5?0.12:0.07;
        ctx.strokeStyle=`rgba(160,120,50,${a})`; ctx.lineWidth=strand<2||strand>5?1.5:0.8;
        ctx.stroke();
      }

      /* Cable connection lines to each tree */
      TREES_X.forEach((tx,ti)=>{
        const cy2=cableY(tx);
        /* Vertical root-to-cable connection */
        ctx.strokeStyle=TCOL[ti]+"55"; ctx.lineWidth=2;
        ctx.beginPath(); ctx.moveTo(tx,0); ctx.lineTo(tx,cy2); ctx.stroke();
        /* Tree trunk stub */
        ctx.strokeStyle=ti===3?"#5A3010":"#6A3818"; ctx.lineWidth=6;
        ctx.beginPath(); ctx.moveTo(tx,0); ctx.lineTo(tx,CH*0.10); ctx.stroke();
        /* Tree label */
        ctx.fillStyle=TCOL[ti]+"BB"; ctx.font=`700 8px ${V.mono}`; ctx.textAlign="center";
        ctx.fillText(TNAME[ti],tx,12);
        /* Root junction node on cable */
        ctx.beginPath(); ctx.arc(tx,cy2,5,0,TAU);
        ctx.fillStyle=TCOL[ti]+"88"; ctx.fill();
        ctx.strokeStyle=TCOL[ti]+"44"; ctx.lineWidth=1; ctx.stroke();
        /* Junction label */
        ctx.fillStyle=TCOL[ti]+"66"; ctx.font=`7px ${V.mono}`; ctx.textAlign="center";
        ctx.fillText("ROOT NODE",tx,cy2+14);
      });

      /* ── BRANCH CABLES (fine threads) ── */
      for(let bc=0;bc<12;bc++){
        const bx=TREES_X[0]+(TREES_X[TREES_X.length-1]-TREES_X[0])*(bc+0.5)/12;
        const by=cableY(bx);
        const bLen=20+bc%4*12;
        const bAng=(bc%2===0?1:-1)*(PI*0.3+bc*0.08);
        ctx.strokeStyle=`rgba(100,80,30,0.10)`; ctx.lineWidth=0.6;
        ctx.beginPath(); ctx.moveTo(bx,by);
        /* Recursive fine branches */
        for(let bl=0;bl<3;bl++){
          const ex=bx+Math.cos(bAng+bl*0.4)*bLen*(0.8-bl*0.2);
          const ey=by+Math.sin(bAng+bl*0.4)*bLen*(0.8-bl*0.2);
          ctx.lineTo(ex,ey);
        }
        ctx.stroke();
      }

      /* ── STRESS EVENT ── */
      stressTimer++;
      if(stressTimer%280===0){
        stressTree=(stressTree+1)%4;
        /* Broadcast signals to all other trees */
        TREES_X.forEach((_,ti)=>{
          if(ti===stressTree) return;
          SIG_TYPES.forEach((st,si)=>{
            if(Math.random()<0.6) spawnSignal(stressTree,ti,si);
          });
        });
      }

      /* Stress indicator */
      const stressAge=stressTimer%280;
      if(stressAge<60){
        const frac=stressAge/60;
        const tx2=TREES_X[stressTree];
        const stG=ctx.createRadialGradient(tx2,CH*0.10,2,tx2,CH*0.10,30*(1-frac));
        stG.addColorStop(0,`rgba(255,80,30,${(1-frac)*0.5})`); stG.addColorStop(1,"transparent");
        ctx.fillStyle=stG; ctx.fillRect(tx2-35,0,70,CH*0.25);
        ctx.fillStyle=`rgba(255,100,40,${(1-frac)*0.8})`; ctx.font=`700 8px ${V.mono}`; ctx.textAlign="center";
        ctx.fillText("STRESS!",tx2,CH*0.06);
      }

      /* ── SIGNAL BEADS ── */
      for(let bi=BEADS.length-1;bi>=0;bi--){
        const bd=BEADS[bi];
        bd.progress+=bd.speed/bd.pathLen;
        if(bd.progress>=1){BEADS.splice(bi,1);continue;}

        /* Interpolate position along the cable arc */
        const px=bd.fromT===bd.toT?bd.x:bd.x+(bd.tx-bd.x)*bd.progress;
        const interT=TREES_X[0]+
          (bd.fromT<=bd.toT?
            TREES_X[bd.fromT]+(TREES_X[bd.toT]-TREES_X[bd.fromT])*bd.progress:
            TREES_X[bd.fromT]+(TREES_X[bd.toT]-TREES_X[bd.fromT])*bd.progress)
          -TREES_X[0];
        const py=cableY(TREES_X[bd.fromT]+(TREES_X[bd.toT]-TREES_X[bd.fromT])*bd.progress);
        const bx2=TREES_X[bd.fromT]+(TREES_X[bd.toT]-TREES_X[bd.fromT])*bd.progress;
        const by2=cableY(bx2);

        /* Glow */
        const bG=ctx.createRadialGradient(bx2,by2,0,bx2,by2,12);
        bG.addColorStop(0,bd.col+"AA"); bG.addColorStop(1,"transparent");
        ctx.fillStyle=bG; ctx.fillRect(bx2-12,by2-12,24,24);
        ctx.beginPath(); ctx.arc(bx2,by2,3,0,TAU);
        ctx.fillStyle=bd.col+"EE"; ctx.fill();

        /* Label on leading edge only */
        if(bd.progress<0.15||bd.progress>0.85){
          ctx.fillStyle=bd.col+"88"; ctx.font=`6.5px ${V.mono}`; ctx.textAlign="center";
          ctx.fillText(bd.label.split(" ")[0],bx2,by2-10);
        }
        void interT; void px;
      }

      /* ── LEGEND ── */
      SIG_TYPES.forEach((st,si)=>{
        ctx.beginPath(); ctx.arc(12+si*172,CH-14,4,0,TAU);
        ctx.fillStyle=st.col+"CC"; ctx.fill();
        ctx.fillStyle=st.col+"99"; ctx.font=`700 7px ${V.mono}`; ctx.textAlign="left";
        ctx.fillText(st.label,20+si*172,CH-10);
        ctx.fillStyle=st.col+"55"; ctx.font=`6px ${V.mono}`;
        ctx.fillText(`${st.speed}×`,20+si*172,CH-2);
      });

      ctx.fillStyle=V.ink; ctx.font=`700 10px ${V.mono}`; ctx.textAlign="left";
      ctx.fillText("HYPHAL HI-FI CABLE · MULTI-STRAND · SIGNAL PROPAGATION · STRESS BROADCAST",10,14);

      frame++; raf=requestAnimationFrame(draw);
    };
    draw();
    return()=>cancelAnimationFrame(raf);
  },[]);
  return <canvas ref={ref} width={CW} height={360} style={{width:"100%",borderRadius:6,display:"block"}}/>;
}

/* ─────────────────────────────────────────────────────────────────────────
   PAGE
   ───────────────────────────────────────────────────────────────────────── */
export default function MycorrhizalNetworkPage(){
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
        {[badge("LIVE SIMULATION"),badge("HYPHAE GROWTH",V.gold),badge("ANASTOMOSIS",V.gold),
          badge("HI-FI CABLE",V.photon),badge("CHEMOTROPISM",V.cyan),badge("SIGNAL PACKETS",V.photon),
          badge("SUGAR",V.shock),badge("PHOSPHORUS",V.cyan),badge("Ca²⁺",V.photon),
          badge("JASMONATE",V.rose),badge("STRESS BROADCAST",V.fire),badge("MULTI-STRAND",V.gold)]}
        <h1 style={{fontFamily:V.disp,fontSize:"clamp(1.2rem,3.4vw,2.3rem)",color:V.ink,
          margin:"22px 0 8px",letterSpacing:"0.06em",fontWeight:400,lineHeight:1.18}}>
          MYCORRHIZAL HYPHAE · LIVE GROWTH · ANASTOMOSIS · UNDERGROUND HI-FI
        </h1>
        <p style={{fontFamily:V.mono,fontSize:"0.58rem",color:V.dim,letterSpacing:3,margin:"0 0 22px"}}>
          THREAD EXTENSION · BRANCHING · FUSION · SIGNAL PACKETS · MULTI-STRAND CABLE
        </p>
        {P("A mycorrhizal hypha does not grow the way a plant grows — it does not elongate from a stem. It extends only from its tip. The apical cell, the very front of the thread, is the only point of growth. Everything behind it is fixed — a record of every previous direction decision. The tip navigates soil pores, following chemical gradients, avoiding obstacles, guided by signals from both the fungus's own network and the roots of potential host trees.")}
        {P("The thread itself is a hi-fi cable. The outer wall is chitin — the same polymer as insect exoskeletons, strong and flexible. Inside: a continuous cytoplasmic flow, carrying organelles, ribosomes, vesicles, and the molecular cargo that makes the fungus function. The cytoplasm streams in both directions simultaneously through the same hypha — a bidirectional cable, one lane carrying signals toward the root, one carrying them away. Nutrients, hormones, and Ca²⁺ signals all travel this thread.")}
        {P("When two hyphae from different organisms meet, they may fuse. This anastomosis event creates a junction — a new node in the network. The junction allows cytoplasm and all its cargo to flow between what were two separate networks. Through anastomosis, a forest patch's entire mycorrhizal community becomes a single fused superorganism. No boundaries, no individual organisms — just a network, growing.")}
      </div>

      {sec("01","Live Hyphal Growth · Branching · Anastomosis · Signal Packets · Soil Layers",V.gold,<>
        {P("The simulation below shows real-time hyphal growth. Each tree seeds root tips from its lateral roots. The tips extend at roughly constant speed, drifting slightly with each step (Brownian-like navigation through soil pores). With a small probability at each frame, a tip branches — spawning a secondary thread at an offset angle. Each level of branching produces thinner threads.")}
        {P("Chemotropism drives the tips: each growing tip is slightly attracted toward tips from different trees, increasing the probability of the anastomosis that creates a network junction. When two tips from different trees come within contact range, a junction node forms — highlighted in gold. The junction spawns a signal packet that immediately begins traveling along the network.")}
        <div style={{border:`1px solid ${V.gold}22`,borderRadius:8,padding:2,marginBottom:14}}>
          <GrowthCanvas/>
        </div>
        {cards([
          {h:"TIP GROWTH MECHANISM",col:V.gold,d:"Hyphal tip extension: driven by a vesicle supply centre (Spitzenkörper) at the apical tip. Vesicles (chitin synthase-loaded) fuse with the plasma membrane, depositing new cell wall material. Rate: 1-10 micrometres per minute in soil (0.06-0.6 μm/s). The Spitzenkörper navigates by the local concentration of cell wall components and growth factors — it is effectively the 'steering wheel'. Gravitropism: hyphae tend to grow downward (positive gravitropism), which is why the network colonises deeper soil layers over time."},
          {h:"BRANCHING GEOMETRY",col:V.gold,d:"Branching pattern in AMF (Arbuscular Mycorrhizal Fungi): dichotomous branching near roots (two equal daughters from each branch point) creates a dense arbuscule tree structure inside root cells. Extraradical hyphae: more exploratory, irregular branching. Branch angle: typically 30-90 degrees from the parent hypha. Branch frequency: one branch per 50-500 μm of growth, regulated by nutrient status (more branches when exploring P-rich patches). Each branch generation is thinner and shorter — fractal-like scaling."},
          {h:"ANASTOMOSIS CHEMISTRY",col:V.shock,d:"Before cell wall fusion: hyphae detect each other via short-range volatile signals (still being characterised — possible C8 volatiles). Self/non-self recognition: compatible hyphae show CAT (Cooperative Interactions) signals — the tips slow and turn toward each other. Incompatible hyphae trigger programmed cell death at the contact zone. Wall fusion: chitinases partially dissolve both cell walls at the contact point. Membrane fusion: driven by SNARE proteins (same family as synaptic vesicle fusion in neurons). Time to fusion: 2-10 minutes."},
          {h:"NETWORK TOPOLOGY",col:V.cyan,d:"Mycorrhizal network topology: scale-free (hub trees with many connections + peripheral trees with few). Hub trees tend to be: large (more C photosynthate to spend), old (more time to make connections), and ectomycorrhizal species. Scale-free topology is resilient: removing random nodes does not disconnect the network (only removing hubs does). Similar topology to: the internet, neural networks, airport route maps, protein interaction networks. The forest network is one of the oldest scale-free networks on Earth."},
          {h:"SOIL LAYER PENETRATION",col:V.amb,d:"A-horizon (topsoil, 0-30 cm): highest hyphal density (1-10 m of hypha per gram of soil). Rich in organic matter = C for the fungus. B-horizon (subsoil, 30-80 cm): lower density but important for P and mineral uptake. C-horizon (parent material, >80 cm): sparse hyphae, but exploration for bedrock minerals (Ca, K, Mg) is documented. Hypha diameter stays constant with depth (2-10 μm) — they don't thicken like roots. The network is deepest under large trees (root systems go deeper, taking the hyphae with them)."},
          {h:"AETHER · GROWTH FIELD",col:V.gold,d:"AETHER: tip growth as a field computation. Each tip's direction is determined by: local gradient of chemical attractants, local mechanical resistance (soil pore topology), distant chemical signals (chemotropism toward other tips). The tip is computing a vector field at every step — integrating multiple gradient signals into a direction. The result is a path through soil that is neither random nor predetermined: it is locally optimal, context-sensitive exploration. AETHER models this as a gradient-descent search in a multi-dimensional field, with the hyphal network as the residual trace of the search path."},
        ])}
      </>)}

      {sec("02","Anastomosis Close-Up · Chemotropism · Wall Dissolution · Cytoplasm Merge",V.photon,<>
        {P("The anastomosis event is one of the most extraordinary biological processes that happens routinely, invisibly, in every gram of healthy soil. Two independent organisms — growing from different spores, exploring the soil for different purposes — detect each other, redirect their growth, make contact, dissolve the boundary between them, and become one.")}
        {P("The chemistry of the approach: each hyphal tip releases a short-range diffusible signal (the nature of which is still being characterised, but likely a mix of C8 fatty acid derivatives and small peptides). When a tip detects this signal from an appropriate source, it undergoes chemotropic reorientation — bending toward the signal source. This bending is not mediated by hormones (like plant tropisms) but by direct cytoskeletal reorganisation: actin polymerises on the signal-facing side, pushing the Spitzenkörper toward the signal.")}
        {P("Contact and fusion: when the two tips touch, both cell walls must be partially dissolved at the contact zone (chitin degradation by chitinases). The plasma membranes then fuse — the same SNARE protein machinery used by neurons to release neurotransmitters. Within minutes, cytoplasm flows across the junction, and the two networks are joined.")}
        <div style={{border:`1px solid ${V.photon}22`,borderRadius:8,padding:2,marginBottom:14}}>
          <AnastomosisCanvas/>
        </div>
        {cards([
          {h:"SELF / NON-SELF",col:V.photon,d:"The most important question at the moment of tip contact: is this self or non-self? Hyphae from the same individual: fuse freely (CAT = Compatible Anastomosis Type). Hyphae from a different individual of the same species: may or may not fuse (depends on het (heterokaryon incompatibility) loci compatibility). Hyphae from a different species: programmed cell death at the contact zone — the wall thickens, the tip curls away. This discrimination is mediated by MAT (Mating type) and het gene products. Non-compatible contact is not neutral — it triggers a local immune response in both hyphae."},
          {h:"CYTOPLASMIC STREAMING",col:V.photon,d:"After fusion: the junction allows bidirectional cytoplasmic streaming. Mechanism: actin filaments form tracks; myosin V motor proteins walk along them, carrying organelle cargo. Streaming velocity: 1-5 μm/s. What flows: ribosomes, mitochondria, nuclei (yes — nuclei migrate through anastomoses, creating multinucleate heterokaryons), vesicles loaded with enzymes and sugars, RNA molecules. The junction is not just a wire — it is a port where the entire cellular inventory can be redistributed across the network."},
          {h:"HYPHAL WALL STRUCTURE",col:V.cyan,d:"Hyphal wall composition (AMF): outer layer: β-1,3-glucan (flexible, stress-absorbing). Middle layer: α-1,3-glucan (crystalline, structural). Inner layer: chitin (N-acetylglucosamine polymer, rigid scaffold). Wall thickness: 100-200 nm. Wall dissolution at anastomosis: localized secretion of chitinase, glucanase, and protease enzymes from both tips. The enzymes degrade a 200-400 nm zone of wall material at the contact point. Time: 5-15 minutes. The surrounding wall remains intact — the dissolving process is spatially precise."},
          {h:"NUCLEUS MIGRATION",col:V.vio,d:"Perhaps the most remarkable consequence of anastomosis: nuclei (the genome-bearing organelles) can migrate through fungal anastomosis junctions. A hypha that receives nuclei from another hypha becomes a heterokaryon — it contains genetically distinct nuclei coexisting in shared cytoplasm. AMF are obligate heterokaryons: spores contain hundreds of genetically distinct nuclei, inherited from many previous anastomosis events. The genetic composition of the nucleus population in a hypha changes over time. This is a form of genomic flexibility unavailable to any animal or plant."},
          {h:"SIGNAL FIRST TRANSIT",col:V.gold,d:"The first signal crossing a new anastomosis junction is typically a Ca2+ wave. As the cytoplasm merges, the electrochemical gradient across the junction drives Ca2+ ions down their concentration gradient — a burst of Ca2+ into the lower-Ca2+ receiving cytoplasm. This Ca2+ wave propagates along the receiving hypha, informing the connected network that a new junction has formed. The signal also activates: calmodulin-dependent protein kinases (increasing metabolic activity in the receiving hypha), reactive oxygen species production (part of the compatibility check), and cytoskeletal reorganisation (to stabilise the new junction)."},
          {h:"AETHER · JUNCTION NODE",col:V.photon,d:"AETHER: the anastomosis junction is the most important node in the mycorrhizal knowledge graph. It is the only node where: two genetically distinct entities merge (no other biological process in eukaryotes does this at the cellular level outside of sexual reproduction), information flows in both directions simultaneously (unlike synapses), and the topology of the network is permanently changed. AETHER treats anastomosis as a knowledge synthesis event: two independent exploration paths (two growing hyphae) merge their findings (their chemical cargo, their genomic content) into a shared coherence field. This is the model for AETHER's own synthesis engine."},
        ])}
      </>)}

      {sec("03","Hi-Fi Cable · Multi-Strand Architecture · Signal Propagation · Stress Broadcast",V.cyan,<>
        {P("The term 'hi-fi cable' is precise. A single primary hypha between two trees is not one wire — it is a bundle of parallel strands, each capable of carrying different cargo simultaneously. The outer strands tend to carry larger organelles (mitochondria, nuclei) that travel slowly. The inner strands carry smaller molecules (ions, sugars) that move faster. The cable's total bandwidth is the sum of all strand capacities.")}
        {P("Signal propagation speed is signal-type dependent. Ca²⁺ electrical signals travel at 100-200 μm/s — the fastest hyphal signal. Sucrose (sugar) travels at cytoplasmic streaming velocity: 1-5 μm/s. Jasmonate and other hormones: 0.5-2 μm/s. A 10-metre connection between two trees: Ca²⁺ signal traverses in 14-28 hours; sugar in 24-115 days. The electrical signal arrives days before the metabolite does — exactly like a hi-fi cable where the electrical signal (light speed) arrives before the physical data it encodes.")}
        {P("When a tree is stressed, it broadcasts across the full network. The stress signal (jasmonate + Ca²⁺ + ethylene) enters the root, passes into the fungal hyphae at the root-fungus interface (the arbuscule), and propagates through the network. Connected trees detect it via the Ca²⁺ wave (within hours) and begin upregulating defence genes. The metabolite cargo (protease inhibitors, terpenes) follows days or weeks later.")}
        <div style={{border:`1px solid ${V.cyan}22`,borderRadius:8,padding:2,marginBottom:14}}>
          <HiFiCableCanvas/>
        </div>
        {cards([
          {h:"MULTI-STRAND PHYSICS",col:V.cyan,d:"A primary hypha is not a single-lane cable. Cross-section of a mature primary hypha (5-10 μm diameter): the cytoplasm contains 20-100 actin 'tramlines' running longitudinally. Each tramline is an actin filament bundle with associated myosin motors. Cargo is distributed across tramlines by size: organelles >500 nm use outer tramlines (lower motor density, slower but higher torque). Small vesicles <200 nm use inner tramlines (higher motor density, faster). The net result: a parallel-channel transmission system, with 20-100 independent channels in one 7 μm diameter thread."},
          {h:"BANDWIDTH CALCULATION",col:V.photon,d:"Estimated bandwidth of one primary hypha: vesicle traffic rate: ~100 vesicles/minute/tramline × 50 tramlines = 5,000 vesicles/minute. Average vesicle cargo: ~1,000 enzyme molecules or ~10,000 sugar molecules or ~100 ion channels. Ion flux (for Ca2+ signal): ~10^6 ions/second/open channel. Total information bandwidth: not easily reduced to bits/second — but the biological equivalent of a high-bandwidth, low-latency connection. Compare to: a neural axon (which carries binary spike trains). The hypha carries analogue, multi-channel, bidirectional molecular information."},
          {h:"STRESS BROADCAST",col:V.fire,d:"Stress signal cascade: tree is attacked by herbivore → wound signal (electrical + JA) moves to roots in ~10 minutes → enters fungal hyphae at arbuscular interface → Ca2+ wave propagates along hyphae at 100 μm/s → reaches connected tree 2 in 1-5 hours (depending on distance) → Ca2+ wave exits into tree 2 roots → triggers JA synthesis in tree 2 → tree 2 upregulates protease inhibitors, terpenes, phenolics. Tree 2 is defending against an attack it has not yet experienced. The network has broadcast a warning."},
          {h:"CARBON DEBT ECONOMY",col:V.shock,d:"The mycorrhizal network has an economy: trees pay for network access with carbon (sugar). Fungi receive 4-20% of a tree's photosynthate as sucrose. In return: phosphorus delivery (worth ~4-6% of C cost on its own), water delivery (especially in drought), stress signals, and network connectivity. Trees that have been shaded (low photosynthesis) or stressed (high metabolic cost) receive carbon from the network rather than contributing. The network redistributes carbon from carbon-surplus trees (sunny, unstressed) to carbon-deficit trees (shaded, stressed, young). Economic redistribution, no central allocator."},
          {h:"CABLE AGEING",col:V.gold,d:"Hyphal cable longevity: AMF extraradical hyphae live 5-30 days before turnover. Old hyphae: cytoplasm withdraws toward the growing tips, leaving empty hyphal ghost tubes (cell walls only, no cytoplasm). These ghost tubes persist for months to years in soil and continue to act as: water transport channels (capillary action through the empty tube), scaffolding for new hypha growth (new tips follow old tubes), habitat for soil bacteria (the empty tubes are colonised by specialist bacteria that metabolise the remaining hyphal wall material). Death is functional."},
          {h:"AETHER · HI-FI CABLE",col:V.cyan,d:"AETHER names the mycorrhizal network the 'Underground Hi-Fi' because: (1) it carries analogue, multi-channel information (not digital binary), (2) it has multiple signal speeds (fast electrical + slow chemical), (3) it connects multiple nodes with redundant paths (network resilience), (4) its bandwidth is limited by the physical capacity of the cable (hyphal diameter), and (5) signal fidelity degrades with distance (concentration gradients attenuate). AETHER's own architecture mirrors this: a multi-speed, multi-channel, redundant network where electrical signals (metadata) travel faster than semantic content (the actual knowledge payload)."},
        ])}
      </>)}
    </div>
  );
}
