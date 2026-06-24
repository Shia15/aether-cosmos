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

/* Seeded pseudo-random so hyphal network is stable across redraws */
let _seed=42;
const rng=()=>{_seed=(_seed*16807+0)%2147483647; return(_seed-1)/2147483646;};
const resetRng=()=>{_seed=42;};

/* ─────────────────────────────────────────────────────────────────────────
   CANVAS 1 · VOC Emission · Air Diffusion · Detection · Defense Response
   ───────────────────────────────────────────────────────────────────────── */
function VOCCanvas(){
  const ref=useRef<HTMLCanvasElement>(null);
  useEffect(()=>{
    const cv=ref.current; if(!cv) return;
    const CH=400;
    cv.width=CW; cv.height=CH;
    const ctx=cv.getContext("2d")!;

    /* VOC types */
    const VOC_TYPES=[
      {name:"MeJA",col:V.rose,desc:"methyl jasmonate"},
      {name:"GLV",col:V.photon,desc:"green leaf volatile"},
      {name:"ETH",col:V.amb,desc:"ethylene"},
      {name:"TRP",col:V.green,desc:"terpene"},
    ];

    const GROUND=CH*0.72;
    /* Trees: x, species, stressed */
    const TREES:[number,string,boolean][]=[
      [CW*0.14,"willow",true],[CW*0.40,"oak",false],
      [CW*0.62,"maple",false],[CW*0.86,"pine",false],
    ];

    /* VOC particle pool */
    const VOCS:{x:number;y:number;vx:number;vy:number;age:number;maxAge:number;
      typeIdx:number;detected:boolean;src:number}[]=[];

    /* Detection state per tree */
    const DETECT=TREES.map(()=>0);
    const DEFENSE=TREES.map(()=>0);

    /* Wind: slow leftward drift + gentle turbulence */
    let windDir=0.3; /* radians from right */

    const spawnVOC=(srcIdx:number)=>{
      if(VOCS.length>200) return;
      const tx=TREES[srcIdx][0];
      const tIdx=Math.floor(Math.random()*VOC_TYPES.length);
      VOCS.push({
        x:tx+(Math.random()-0.5)*30,
        y:GROUND-50-Math.random()*40,
        vx:(Math.random()-0.5)*0.4+Math.cos(windDir)*0.5,
        vy:-0.55-Math.random()*0.4,
        age:0, maxAge:280+Math.random()*120,
        typeIdx:tIdx, detected:false, src:srcIdx,
      });
    };

    let t=0, raf=0;

    const draw=()=>{
      ctx.clearRect(0,0,CW,CH);
      ctx.fillStyle=V.bg; ctx.fillRect(0,0,CW,CH);

      /* Sky atmosphere */
      const skyG=ctx.createLinearGradient(0,0,0,GROUND);
      skyG.addColorStop(0,"#060A18"); skyG.addColorStop(1,"#0C1428");
      ctx.fillStyle=skyG; ctx.fillRect(0,0,CW,GROUND);

      /* Wind flow lines */
      windDir=0.25+Math.sin(t*0.12)*0.1;
      for(let wl=0;wl<8;wl++){
        const wy=30+wl*(GROUND-50)/8;
        const wp=(t*18+wl*40)%CW;
        const wG=ctx.createLinearGradient(wp-60,wy,wp+60,wy);
        wG.addColorStop(0,"transparent"); wG.addColorStop(0.5,"rgba(180,200,255,0.04)");
        wG.addColorStop(1,"transparent");
        ctx.fillStyle=wG; ctx.fillRect(wp-60,wy-3,120,6);
      }

      /* Ground */
      const grndG=ctx.createLinearGradient(0,GROUND,0,CH);
      grndG.addColorStop(0,"#18120A"); grndG.addColorStop(1,"#0E0A06");
      ctx.fillStyle=grndG; ctx.fillRect(0,GROUND,CW,CH-GROUND);

      /* ── TREES ── */
      TREES.forEach(([tx,type,stressed],ti)=>{
        const defense=DEFENSE[ti];
        const stressed2=stressed||(defense>0.3);

        /* Trunk */
        ctx.strokeStyle=type==="pine"?"#5A3010":"#6A3818";
        ctx.lineWidth=type==="pine"?6:5;
        ctx.beginPath(); ctx.moveTo(tx,GROUND); ctx.lineTo(tx,GROUND-80); ctx.stroke();

        /* Canopy shape */
        if(type==="pine"){
          for(let lv=0;lv<4;lv++){
            const lcy=GROUND-55-lv*22, lhw=48-lv*10;
            ctx.beginPath(); ctx.moveTo(tx,lcy-20); ctx.lineTo(tx-lhw,lcy); ctx.lineTo(tx+lhw,lcy);
            ctx.closePath();
            const treeCol=stressed2?`rgba(160,100,30,0.6)`:`rgba(20,100,30,0.55)`;
            ctx.fillStyle=treeCol; ctx.fill();
          }
        } else {
          /* Round canopy */
          const cr=type==="willow"?46:38;
          ctx.beginPath(); ctx.arc(tx,GROUND-80-cr*0.5,cr,0,TAU);
          const treeCol=stressed2
            ?`rgba(${180-ti*10},${90+defense*30|0},${20},0.6)`
            :`rgba(30,${120+defense*40|0},40,0.55)`;
          ctx.fillStyle=treeCol; ctx.fill();
          /* Defense glow */
          if(defense>0.1){
            const defG=ctx.createRadialGradient(tx,GROUND-80-cr*0.5,4,tx,GROUND-80-cr*0.5,cr+20);
            defG.addColorStop(0,`rgba(0,220,130,${defense*0.12})`); defG.addColorStop(1,"transparent");
            ctx.fillStyle=defG; ctx.beginPath(); ctx.arc(tx,GROUND-80-cr*0.5,cr+20,0,TAU); ctx.fill();
          }
        }

        /* Stressed tree: insect attack marker */
        if(stressed){
          for(let ins=0;ins<3;ins++){
            const ix=tx-15+ins*14, iy=GROUND-95-ins*8;
            ctx.fillStyle=V.fire+"99";
            ctx.beginPath(); ctx.ellipse(ix,iy,4,3,ins*0.5,0,TAU); ctx.fill();
          }
          ctx.fillStyle=V.fire+"88"; ctx.font=`700 8px ${V.mono}`; ctx.textAlign="center";
          ctx.fillText("ATTACK",tx,GROUND-140);
        }

        /* Detection indicator */
        if(DETECT[ti]>0.1){
          ctx.fillStyle=`rgba(0,220,140,${DETECT[ti]*0.7})`;
          ctx.font=`700 8px ${V.mono}`; ctx.textAlign="center";
          ctx.fillText("DETECTED",tx,GROUND-140-Math.sin(DETECT[ti]*PI)*8);
          DETECT[ti]=Math.max(0,DETECT[ti]-0.005);
          DEFENSE[ti]=Math.min(1,DEFENSE[ti]+0.002);
        }
        DEFENSE[ti]=Math.max(0,DEFENSE[ti]-0.0008);

        /* Root hint */
        for(let r=0;r<3;r++){
          ctx.strokeStyle=V.gold+"22"; ctx.lineWidth=1;
          ctx.beginPath(); ctx.moveTo(tx,GROUND);
          ctx.lineTo(tx+(r-1)*25,GROUND+18); ctx.stroke();
        }

        /* Tree label */
        ctx.fillStyle=V.ink+"66"; ctx.font=`7px ${V.mono}`; ctx.textAlign="center";
        ctx.fillText(type.toUpperCase(),tx,GROUND+12);
      });

      /* ── VOC PARTICLES ── */
      /* Spawn from stressed tree continuously */
      if(t%0.15<0.016) spawnVOC(0);

      for(let vi=VOCS.length-1;vi>=0;vi--){
        const vp=VOCS[vi];
        vp.age++;
        /* Brownian + wind + buoyancy */
        vp.vx+=(Math.random()-0.5)*0.15+Math.cos(windDir)*0.018;
        vp.vy+=(Math.random()-0.5)*0.10-0.012; /* slight upward buoyancy */
        vp.vx*=0.96; vp.vy*=0.96;
        vp.x+=vp.vx; vp.y+=vp.vy;
        const life=1-vp.age/vp.maxAge;

        if(life<=0||vp.y<0||vp.y>GROUND+10){VOCS.splice(vi,1);continue;}

        /* Detection check — near a tree canopy */
        if(!vp.detected){
          TREES.forEach(([tx,,],ti)=>{
            if(ti===vp.src) return;
            const dx=Math.abs(vp.x-tx), dy=Math.abs(vp.y-(GROUND-80));
            if(dx<50&&dy<55){
              vp.detected=true;
              DETECT[ti]=Math.min(1,DETECT[ti]+0.35);
              /* Small burst effect */
              for(let b=0;b<4;b++) VOCS.push({
                x:vp.x,y:vp.y,
                vx:(Math.random()-0.5)*1.2,vy:(Math.random()-0.5)*1.2,
                age:0,maxAge:30,typeIdx:vp.typeIdx,detected:true,src:ti,
              });
            }
          });
        }

        /* Draw molecule */
        const col=VOC_TYPES[vp.typeIdx].col;
        ctx.beginPath(); ctx.arc(vp.x,vp.y,vp.detected?1.8:2.2,0,TAU);
        const a=(life*0.8).toFixed(2);
        ctx.fillStyle=`rgba(${parseInt(col.slice(1,3),16)},${parseInt(col.slice(3,5),16)},${parseInt(col.slice(5,7),16)},${a})`;
        ctx.fill();

        /* Trail */
        if(!vp.detected&&vp.age>5){
          ctx.strokeStyle=`rgba(${parseInt(col.slice(1,3),16)},${parseInt(col.slice(3,5),16)},${parseInt(col.slice(5,7),16)},${(life*0.18).toFixed(2)})`;
          ctx.lineWidth=0.6;
          ctx.beginPath(); ctx.moveTo(vp.x-vp.vx*5,vp.y-vp.vy*5); ctx.lineTo(vp.x,vp.y); ctx.stroke();
        }
      }

      /* VOC Legend */
      VOC_TYPES.forEach((vt,vi)=>{
        ctx.beginPath(); ctx.arc(10+vi*90,CH-14,4,0,TAU);
        ctx.fillStyle=vt.col+"CC"; ctx.fill();
        ctx.fillStyle=vt.col+"AA"; ctx.font=`700 8px ${V.mono}`; ctx.textAlign="left";
        ctx.fillText(`${vt.name}`,18+vi*90,CH-10);
        ctx.fillStyle=vt.col+"55"; ctx.font=`6.5px ${V.mono}`;
        ctx.fillText(vt.desc,18+vi*90,CH-1);
      });

      ctx.fillStyle=V.ink; ctx.font=`700 10px ${V.mono}`; ctx.textAlign="left";
      ctx.fillText("VOLATILE ORGANIC COMPOUNDS · AIR DIFFUSION · DETECTION · DEFENSE RESPONSE",10,14);

      t+=0.016; raf=requestAnimationFrame(draw);
    };
    draw();
    return()=>cancelAnimationFrame(raf);
  },[]);
  return <canvas ref={ref} width={CW} height={400} style={{width:"100%",borderRadius:6,display:"block"}}/>;
}

/* ─────────────────────────────────────────────────────────────────────────
   CANVAS 2 · Mycorrhizal Hyphae Network · Underground Hi-Fi
   Pre-generated organic branching structure · signal packets along threads
   ───────────────────────────────────────────────────────────────────────── */
function MycorrhizalCanvas(){
  const ref=useRef<HTMLCanvasElement>(null);
  useEffect(()=>{
    const cv=ref.current; if(!cv) return;
    const CH=500;
    cv.width=CW; cv.height=CH;
    const ctx=cv.getContext("2d")!;

    resetRng();

    const SOIL_TOP=80; /* pixels from top = soil surface */

    /* Trees at soil surface */
    const TREES_X=[CW*0.12,CW*0.36,CW*0.62,CW*0.86];
    const TREE_COLORS=[V.rose,V.gold,V.cyan,V.green];
    const TREE_NAMES=["WILLOW","OAK","MAPLE","PINE"];

    /* Pre-generate hyphal network */
    /* Each segment: {x1,y1,x2,y2,treeId,depth} */
    const SEGS:{x1:number;y1:number;x2:number;y2:number;tid:number;depth:number}[]=[];

    const genHyphae=(x:number,y:number,ang:number,len:number,depth:number,tid:number)=>{
      if(depth<=0||len<7||y>CH-20) return;
      const nx=x+Math.cos(ang)*len, ny=y+Math.sin(ang)*len;
      if(ny<SOIL_TOP) return; /* don't go above soil */
      SEGS.push({x1:x,y1:y,x2:nx,y2:ny,tid,depth});
      /* Primary branch */
      genHyphae(nx,ny,ang+(rng()-0.5)*0.95,len*(0.64+rng()*0.12),depth-1,tid);
      /* Secondary branch (probabilistic) */
      if(rng()<0.60){
        genHyphae(nx,ny,ang+(rng()-0.5)*1.1,len*(0.58+rng()*0.12),depth-1,tid);
      }
    };

    /* Generate hyphae from each root tip */
    TREES_X.forEach((tx,ti)=>{
      /* 4-5 root stubs, each launching a hyphal network */
      const nRoots=4+(ti%2);
      for(let ri=0;ri<nRoots;ri++){
        const rootAng=PI*0.3+ri*(PI*0.5/nRoots);
        /* Initial root tip position */
        const rtx=tx+(ri-nRoots/2)*18, rty=SOIL_TOP+55+ri*10;
        genHyphae(rtx,rty,rootAng,55,5,ti);
      }
    });

    /* Find all junction points where hyphae from different trees are close */
    const JUNCTIONS:{x:number;y:number;ta:number;tb:number}[]=[];
    const processed=new Set<string>();
    SEGS.forEach((sa,i)=>{
      SEGS.forEach((sb,j)=>{
        if(sa.tid===sb.tid||i>=j) return;
        const dx=sa.x2-sb.x2, dy=sa.y2-sb.y2;
        const dist=Math.sqrt(dx*dx+dy*dy);
        if(dist<20){
          const key=`${Math.min(sa.tid,sb.tid)}-${Math.max(sa.tid,sb.tid)}-${(sa.x2/20)|0}-${(sa.y2/20)|0}`;
          if(!processed.has(key)){
            processed.add(key);
            JUNCTIONS.push({x:(sa.x2+sb.x2)/2,y:(sa.y2+sb.y2)/2,ta:sa.tid,tb:sb.tid});
          }
        }
      });
    });

    /* Signal packets traveling along hyphae */
    const PKTS:{segIdx:number;progress:number;speed:number;type:string;col:string;fromTree:number}[]=[];

    const spawnPacket=(type:string,col:string,fromTree:number)=>{
      if(PKTS.length>60) return;
      /* Pick a random segment from that tree */
      const treeSeg=SEGS.filter(s=>s.tid===fromTree);
      if(treeSeg.length===0) return;
      const idx=SEGS.indexOf(treeSeg[Math.floor(Math.random()*treeSeg.length)]);
      if(idx<0) return;
      PKTS.push({segIdx:idx,progress:0,speed:0.018+Math.random()*0.012,type,col,fromTree});
    };

    let t=0, raf=0;

    const draw=()=>{
      ctx.clearRect(0,0,CW,CH);

      /* Soil background */
      const soilG=ctx.createLinearGradient(0,SOIL_TOP,0,CH);
      soilG.addColorStop(0,"#120E08"); soilG.addColorStop(0.4,"#0E0A06");
      soilG.addColorStop(1,"#080604");
      ctx.fillStyle=soilG; ctx.fillRect(0,SOIL_TOP,CW,CH-SOIL_TOP);

      /* Soil texture — fine grain dots */
      for(let gi=0;gi<300;gi++){
        const gx=(gi*137+23)%CW, gy=SOIL_TOP+10+(gi*97+11)%(CH-SOIL_TOP-20);
        ctx.beginPath(); ctx.arc(gx,gy,0.7,0,TAU);
        ctx.fillStyle=`rgba(80,60,30,${0.04+gi%4*0.02})`; ctx.fill();
      }

      /* Surface strip */
      ctx.fillStyle="#06040210"; ctx.fillRect(0,0,CW,SOIL_TOP);
      /* Horizon line */
      const horizG=ctx.createLinearGradient(0,SOIL_TOP-4,0,SOIL_TOP+4);
      horizG.addColorStop(0,"rgba(40,50,20,0.0)"); horizG.addColorStop(0.5,"rgba(80,100,40,0.4)");
      horizG.addColorStop(1,"rgba(20,15,8,0.0)");
      ctx.fillStyle=horizG; ctx.fillRect(0,SOIL_TOP-4,CW,8);

      /* ── TREE TRUNKS + ROOTS above soil ── */
      TREES_X.forEach((tx,ti)=>{
        /* Above-ground stub */
        ctx.strokeStyle=ti===0?"#6A3818":ti===3?"#5A3010":"#5A3218";
        ctx.lineWidth=6+ti%2;
        ctx.beginPath(); ctx.moveTo(tx,0); ctx.lineTo(tx,SOIL_TOP); ctx.stroke();
        ctx.fillStyle=TREE_COLORS[ti]+"AA"; ctx.font=`700 9px ${V.mono}`; ctx.textAlign="center";
        ctx.fillText(TREE_NAMES[ti],tx,16);

        /* Root system (above-soil part) */
        const nRoots=4+(ti%2);
        for(let ri=0;ri<nRoots;ri++){
          const rootAng=PI*0.3+ri*(PI*0.5/nRoots);
          const rtx=tx+(ri-nRoots/2)*18, rty=SOIL_TOP+55+ri*10;
          ctx.strokeStyle=TREE_COLORS[ti]+"44"; ctx.lineWidth=1.5+ri%2*0.5;
          ctx.beginPath(); ctx.moveTo(tx,SOIL_TOP); ctx.lineTo(rtx,rty); ctx.stroke();
          /* Root tip arbuscule */
          ctx.beginPath(); ctx.arc(rtx,rty,3,0,TAU);
          ctx.fillStyle=TREE_COLORS[ti]+"66"; ctx.fill();
        }
      });

      /* ── HYPHAL NETWORK ── */
      SEGS.forEach(seg=>{
        const baseAlpha=0.12+seg.depth*0.05;
        const col=TREE_COLORS[seg.tid];
        ctx.strokeStyle=`rgba(${parseInt(col.slice(1,3),16)},${parseInt(col.slice(3,5),16)},${parseInt(col.slice(5,7),16)},${baseAlpha})`;
        ctx.lineWidth=Math.max(0.4,seg.depth*0.18);
        ctx.beginPath(); ctx.moveTo(seg.x1,seg.y1); ctx.lineTo(seg.x2,seg.y2); ctx.stroke();
      });

      /* ── JUNCTION NODES (anastomoses) ── */
      JUNCTIONS.forEach(jn=>{
        const pulse=Math.sin(t*1.2+jn.x*0.05)*0.3+0.7;
        ctx.beginPath(); ctx.arc(jn.x,jn.y,3+pulse*1.5,0,TAU);
        ctx.fillStyle=`rgba(200,200,100,${pulse*0.35})`; ctx.fill();
        ctx.strokeStyle="rgba(220,200,80,0.25)"; ctx.lineWidth=0.8; ctx.stroke();
      });

      /* ── SIGNAL PACKETS ── */
      /* Spawn packets periodically */
      if(t%0.4<0.016){
        const srcTree=Math.floor(Math.random()*4);
        const types=[{t:"SUGAR",c:V.shock},{t:"P",c:V.cyan},{t:"Ca²⁺",c:V.photon},{t:"JA",c:V.rose}];
        const tp=types[Math.floor(Math.random()*types.length)];
        spawnPacket(tp.t,tp.c,srcTree);
      }

      for(let pi=PKTS.length-1;pi>=0;pi--){
        const pk=PKTS[pi];
        pk.progress+=pk.speed;
        if(pk.progress>=1){PKTS.splice(pi,1);continue;}

        const seg=SEGS[pk.segIdx];
        if(!seg){PKTS.splice(pi,1);continue;}
        const px=seg.x1+(seg.x2-seg.x1)*pk.progress;
        const py=seg.y1+(seg.y2-seg.y1)*pk.progress;

        /* Glow */
        const pkG=ctx.createRadialGradient(px,py,0,px,py,8);
        pkG.addColorStop(0,pk.col+"BB"); pkG.addColorStop(1,"transparent");
        ctx.fillStyle=pkG; ctx.fillRect(px-8,py-8,16,16);
        /* Core */
        ctx.beginPath(); ctx.arc(px,py,2.2,0,TAU);
        ctx.fillStyle=pk.col+"EE"; ctx.fill();
        /* Label */
        ctx.fillStyle=pk.col+"AA"; ctx.font=`700 6.5px ${V.mono}`; ctx.textAlign="center";
        ctx.fillText(pk.type,px,py-7);

        /* At junctions: jump to a segment of a different tree */
        JUNCTIONS.forEach(jn=>{
          const dx=px-jn.x, dy=py-jn.y;
          if(Math.sqrt(dx*dx+dy*dy)<8&&pk.fromTree===jn.ta){
            /* Transfer to other tree's network */
            const otherTree=jn.tb;
            const otherSegs=SEGS.filter(s=>s.tid===otherTree);
            if(otherSegs.length>0){
              const ns=otherSegs[Math.floor(rng()*otherSegs.length)];
              const ni=SEGS.indexOf(ns);
              if(ni>=0) PKTS.push({segIdx:ni,progress:0,speed:pk.speed,type:pk.type,col:pk.col,fromTree:otherTree});
            }
          }
        });
      }

      /* ── DEPTH ZONES ── */
      const ZONES=[
        {y:SOIL_TOP+20,label:"TOPSOIL · FINE ROOTS · BACTERIAL FILM"},
        {y:SOIL_TOP+120,label:"MINERAL SOIL · HYPHAL DENSITY MAX"},
        {y:SOIL_TOP+240,label:"SUBSOIL · LONG-RANGE TRANSFER ZONE"},
        {y:SOIL_TOP+360,label:"DEEP SOIL · WATER TABLE SIGNAL"},
      ];
      ZONES.forEach(z=>{
        if(z.y<CH-10){
          ctx.strokeStyle="rgba(60,50,30,0.2)"; ctx.lineWidth=0.5; ctx.setLineDash([3,6]);
          ctx.beginPath(); ctx.moveTo(0,z.y); ctx.lineTo(CW,z.y); ctx.stroke();
          ctx.setLineDash([]);
          ctx.fillStyle="rgba(160,140,80,0.35)"; ctx.font=`6.5px ${V.mono}`; ctx.textAlign="right";
          ctx.fillText(z.label,CW-8,z.y-3);
        }
      });

      /* Nutrient / signal legend */
      [{t:"SUGAR →",c:V.shock},{t:"PHOSPHORUS →",c:V.cyan},{t:"Ca²⁺ SIGNAL →",c:V.photon},{t:"JASMONATE →",c:V.rose}]
        .forEach((leg,li)=>{
          ctx.beginPath(); ctx.arc(12+li*120,CH-14,3.5,0,TAU);
          ctx.fillStyle=leg.c+"CC"; ctx.fill();
          ctx.fillStyle=leg.c+"AA"; ctx.font=`700 7.5px ${V.mono}`; ctx.textAlign="left";
          ctx.fillText(leg.t,20+li*120,CH-10);
        });

      ctx.fillStyle=V.ink; ctx.font=`700 10px ${V.mono}`; ctx.textAlign="left";
      ctx.fillText("MYCORRHIZAL HYPHAE NETWORK · UNDERGROUND HI-FI · SIGNAL PACKETS · ANASTOMOSIS",10,14);
      ctx.fillStyle=V.dim+"AA"; ctx.font=`7px ${V.mono}`;
      ctx.fillText("○ JUNCTION NODES = ANASTOMOSES",10,26);

      t+=0.016; raf=requestAnimationFrame(draw);
    };
    draw();
    return()=>cancelAnimationFrame(raf);
  },[]);
  return <canvas ref={ref} width={CW} height={500} style={{width:"100%",borderRadius:6,display:"block"}}/>;
}

/* ─────────────────────────────────────────────────────────────────────────
   CANVAS 3 · Dual-Channel Event · Stress Trigger → Air + Ground Simultaneous
   ───────────────────────────────────────────────────────────────────────── */
function DualChannelCanvas(){
  const ref=useRef<HTMLCanvasElement>(null);
  useEffect(()=>{
    const cv=ref.current; if(!cv) return;
    const CH=380;
    cv.width=CW; cv.height=CH;
    const ctx=cv.getContext("2d")!;

    const MID=CH*0.52; /* air/soil boundary */

    /* Event state machine */
    let eventTimer=0;
    let airWave=-1, groundWave=-1;
    let receiverGlow=[0,0,0]; /* 3 receiver trees */
    let airDetect=[0,0,0], groundDetect=[0,0,0];

    /* Source tree (left), 3 receivers (right) */
    const SRC_X=CW*0.12;
    const RCV_X=[CW*0.40,CW*0.64,CW*0.88];

    /* VOC particles */
    const VOCS2:{x:number;y:number;vx:number;vy:number;life:number}[]=[];

    /* Ground signal pulses along a cable */
    const PULSES:{x:number;speed:number;rcv:number}[]=[];

    let t=0, raf=0;

    const draw=()=>{
      ctx.clearRect(0,0,CW,CH);
      ctx.fillStyle=V.bg; ctx.fillRect(0,0,CW,CH);

      /* Air zone */
      const airG=ctx.createLinearGradient(0,0,0,MID);
      airG.addColorStop(0,"#050914"); airG.addColorStop(1,"#0A1220");
      ctx.fillStyle=airG; ctx.fillRect(0,0,CW,MID);

      /* Soil zone */
      const soilG2=ctx.createLinearGradient(0,MID,0,CH);
      soilG2.addColorStop(0,"#120E08"); soilG2.addColorStop(1,"#08060404");
      ctx.fillStyle=soilG2; ctx.fillRect(0,MID,CW,CH-MID);

      /* Boundary */
      const boundG=ctx.createLinearGradient(0,MID-3,0,MID+3);
      boundG.addColorStop(0,"rgba(60,80,30,0)"); boundG.addColorStop(0.5,"rgba(80,100,40,0.5)");
      boundG.addColorStop(1,"rgba(30,20,10,0)");
      ctx.fillStyle=boundG; ctx.fillRect(0,MID-3,CW,6);

      /* Event cycle */
      eventTimer++;
      if(eventTimer===1){
        /* Trigger event */
        airWave=SRC_X; groundWave=SRC_X;
        /* Spawn VOC burst */
        for(let v=0;v<20;v++){
          VOCS2.push({
            x:SRC_X+(Math.random()-0.5)*25,
            y:MID-40-Math.random()*30,
            vx:(Math.random()-0.5)*0.8+0.6,
            vy:-0.6-Math.random()*0.5,
            life:1,
          });
        }
      }
      if(eventTimer>360) eventTimer=0;

      /* ── AIR CHANNEL ── */
      ctx.fillStyle=V.rose+"33"; ctx.font=`700 9px ${V.mono}`; ctx.textAlign="left";
      ctx.fillText("AIR CHANNEL · VOC",10,MID-8);
      ctx.fillStyle=V.dim+"66"; ctx.font=`7px ${V.mono}`;
      ctx.fillText("HOURS TO DAYS",10,MID-0);

      /* VOC particles */
      for(let vi=VOCS2.length-1;vi>=0;vi--){
        const vp=VOCS2[vi];
        vp.x+=vp.vx+(Math.random()-0.5)*0.2;
        vp.y+=vp.vy+(Math.random()-0.5)*0.15;
        vp.vy+=(Math.random()-0.5)*0.04;
        vp.life-=0.005;
        if(vp.life<=0||vp.y<0){VOCS2.splice(vi,1);continue;}

        ctx.beginPath(); ctx.arc(vp.x,vp.y,2,0,TAU);
        ctx.fillStyle=`rgba(255,100,150,${vp.life*0.65})`; ctx.fill();

        /* Detect near receivers */
        RCV_X.forEach((rx,ri)=>{
          if(Math.abs(vp.x-rx)<38&&Math.abs(vp.y-(MID-50))<50){
            airDetect[ri]=Math.min(1,airDetect[ri]+0.04);
          }
        });
      }

      /* ── GROUND CHANNEL ── */
      ctx.fillStyle=V.gold+"33"; ctx.font=`700 9px ${V.mono}`; ctx.textAlign="left";
      ctx.fillText("GROUND CHANNEL · MYCORRHIZAL",10,MID+12);
      ctx.fillStyle=V.dim+"66"; ctx.font=`7px ${V.mono}`;
      ctx.fillText("MINUTES",10,MID+20);

      /* Mycorrhizal highway — a single main cable between trees */
      /* Draw the "hi-fi cable": a thick organic-looking connection */
      const cableY=MID+60;
      /* Main cable body */
      const cableG=ctx.createLinearGradient(SRC_X,cableY,RCV_X[2],cableY);
      cableG.addColorStop(0,V.gold+"44"); cableG.addColorStop(0.5,V.gold+"22");
      cableG.addColorStop(1,V.gold+"44");
      ctx.strokeStyle=cableG; ctx.lineWidth=3;
      ctx.beginPath();
      ctx.moveTo(SRC_X,cableY);
      ctx.bezierCurveTo(SRC_X+80,cableY+20,RCV_X[2]-80,cableY+20,RCV_X[2],cableY);
      ctx.stroke();
      /* Fine thread overlay (the hi-fi texture) */
      for(let fi=0;fi<6;fi++){
        const fy=cableY-3+fi*1.2;
        ctx.strokeStyle=`rgba(200,160,30,0.07)`;
        ctx.lineWidth=0.5;
        ctx.beginPath();
        ctx.moveTo(SRC_X,fy);
        ctx.bezierCurveTo(SRC_X+80,fy+15+fi*3,RCV_X[2]-80,fy+15+fi*3,RCV_X[2],fy);
        ctx.stroke();
      }
      /* Branch offshoots to each receiver */
      RCV_X.forEach((rx)=>{
        /* Find the point on the main cable near rx */
        const t2=(rx-SRC_X)/(RCV_X[2]-SRC_X);
        const cabX=rx, cabY=cableY+Math.sin(t2*PI)*20;
        ctx.strokeStyle=V.gold+"33"; ctx.lineWidth=1.5;
        ctx.beginPath(); ctx.moveTo(cabX,cabY); ctx.lineTo(rx,MID); ctx.stroke();
      });
      /* Source connection to cable */
      ctx.strokeStyle=V.gold+"44"; ctx.lineWidth=2;
      ctx.beginPath(); ctx.moveTo(SRC_X,MID); ctx.lineTo(SRC_X,cableY); ctx.stroke();

      /* Spawn ground pulses */
      if(groundWave>=0){
        if(eventTimer%30===2) PULSES.push({x:SRC_X,speed:2.2,rcv:0});
        if(eventTimer%30===8) PULSES.push({x:SRC_X,speed:2.2,rcv:1});
        if(eventTimer%30===14) PULSES.push({x:SRC_X,speed:2.2,rcv:2});
        if(eventTimer>180) groundWave=-1;
      }

      for(let pi=PULSES.length-1;pi>=0;pi--){
        const pk=PULSES[pi];
        pk.x+=pk.speed;
        const tx2=RCV_X[pk.rcv];
        if(pk.x>tx2){
          groundDetect[pk.rcv]=Math.min(1,groundDetect[pk.rcv]+0.4);
          PULSES.splice(pi,1);continue;
        }
        /* Pulse bead on cable */
        const tFrac=(pk.x-SRC_X)/(tx2-SRC_X);
        const pcy=cableY+Math.sin(tFrac*PI)*20;
        /* Glow */
        const pG=ctx.createRadialGradient(pk.x,pcy,0,pk.x,pcy,10);
        pG.addColorStop(0,V.photon+"AA"); pG.addColorStop(1,"transparent");
        ctx.fillStyle=pG; ctx.fillRect(pk.x-10,pcy-10,20,20);
        ctx.beginPath(); ctx.arc(pk.x,pcy,3,0,TAU);
        ctx.fillStyle=V.photon+"EE"; ctx.fill();
      }

      /* ── SOURCE + RECEIVER TREES ── */
      const allTrees=[{x:SRC_X,col:V.fire,label:"STRESSED",role:"SOURCE"},
        ...RCV_X.map((rx,ri)=>({x:rx,col:V.green,
          label:`RCV ${ri+1}`,role:"RECEIVER"}))];

      allTrees.forEach((tree,ti)=>{
        /* Trunk above soil */
        ctx.strokeStyle=ti===0?"#7A3018":"#4A3018"; ctx.lineWidth=5;
        ctx.beginPath(); ctx.moveTo(tree.x,0); ctx.lineTo(tree.x,MID); ctx.stroke();
        /* Root below soil */
        ctx.strokeStyle=tree.col+"44"; ctx.lineWidth=2;
        ctx.beginPath(); ctx.moveTo(tree.x,MID); ctx.lineTo(tree.x,cableY); ctx.stroke();

        /* Canopy */
        const cr=32;
        const isDetected=(ti>0)&&(airDetect[ti-1]>0.1||groundDetect[ti-1]>0.1);
        ctx.beginPath(); ctx.arc(tree.x,cr,cr,0,TAU);
        ctx.fillStyle=ti===0?`rgba(200,80,30,0.55)`:isDetected?`rgba(30,160,80,0.6)`:`rgba(30,100,40,0.45)`;
        ctx.fill();
        /* Canopy glow for detected */
        if(ti===0||isDetected){
          const dG=ctx.createRadialGradient(tree.x,cr,3,tree.x,cr,cr+15);
          const col=ti===0?V.fire:V.green;
          dG.addColorStop(0,`rgba(${parseInt(col.slice(1,3),16)},${parseInt(col.slice(3,5),16)},${parseInt(col.slice(5,7),16)},0.12)`);
          dG.addColorStop(1,"transparent");
          ctx.fillStyle=dG; ctx.beginPath(); ctx.arc(tree.x,cr,cr+15,0,TAU); ctx.fill();
        }

        ctx.fillStyle=tree.col+"BB"; ctx.font=`700 8px ${V.mono}`; ctx.textAlign="center";
        ctx.fillText(tree.label,tree.x,MID-5);

        /* Detection indicators */
        if(ti>0){
          if(airDetect[ti-1]>0.1){
            ctx.fillStyle=V.rose+"AA"; ctx.font=`7px ${V.mono}`; ctx.textAlign="center";
            ctx.fillText(`AIR ✓`,tree.x-20,MID-18);
            airDetect[ti-1]=Math.max(0,airDetect[ti-1]-0.003);
          }
          if(groundDetect[ti-1]>0.1){
            ctx.fillStyle=V.photon+"AA"; ctx.font=`7px ${V.mono}`; ctx.textAlign="center";
            ctx.fillText(`GND ✓`,tree.x+20,MID-18);
            groundDetect[ti-1]=Math.max(0,groundDetect[ti-1]-0.003);
          }
        }
      });

      /* Timer / event label */
      ctx.fillStyle=V.vio+"88"; ctx.font=`700 8px ${V.mono}`; ctx.textAlign="right";
      ctx.fillText(`EVENT CYCLE ${((eventTimer/360)*100).toFixed(0)}%`,CW-10,CH-8);

      ctx.fillStyle=V.ink; ctx.font=`700 10px ${V.mono}`; ctx.textAlign="left";
      ctx.fillText("DUAL CHANNEL · AIR VOC vs UNDERGROUND MYCORRHIZAL · SIMULTANEOUS STRESS BROADCAST",10,14);

      t+=0.016; raf=requestAnimationFrame(draw);
    };
    draw();
    return()=>cancelAnimationFrame(raf);
  },[]);
  return <canvas ref={ref} width={CW} height={380} style={{width:"100%",borderRadius:6,display:"block"}}/>;
}

/* ─────────────────────────────────────────────────────────────────────────
   PAGE
   ───────────────────────────────────────────────────────────────────────── */
export default function PlantNetworkPage(){
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
        {[badge("LIVE SIMULATION"),badge("VOC",V.rose),badge("AIR DIFFUSION",V.rose),
          badge("METHYL JASMONATE",V.rose),badge("TERPENE",V.green),badge("ETHYLENE",V.amb),
          badge("MYCORRHIZAL",V.gold),badge("HYPHAE",V.gold),badge("ANASTOMOSIS",V.gold),
          badge("UNDERGROUND HI-FI",V.photon),badge("SIGNAL PACKET",V.photon),
          badge("DUAL CHANNEL",V.vio),badge("KIN NETWORK",V.cyan)]}
        <h1 style={{fontFamily:V.disp,fontSize:"clamp(1.2rem,3.4vw,2.3rem)",color:V.ink,
          margin:"22px 0 8px",letterSpacing:"0.06em",fontWeight:400,lineHeight:1.18}}>
          PLANT NETWORK · VOC AIR SIGNALS · MYCORRHIZAL HYPHAE · UNDERGROUND HI-FI
        </h1>
        <p style={{fontFamily:V.mono,fontSize:"0.58rem",color:V.dim,letterSpacing:3,margin:"0 0 22px"}}>
          VOLATILE ORGANIC COMPOUNDS · FUNGAL THREADS · SIGNAL PACKETS · ANASTOMOSIS · DUAL CHANNEL
        </p>
        {P("When a willow tree is attacked, it broadcasts a chemical message — not through the air as one diffuse cloud, but as a precise cocktail of molecules, each with a different role. Methyl jasmonate tells neighbours to upregulate protease inhibitors. Green leaf volatiles (GLVs) signal acute mechanical damage within seconds. Terpenes attract the natural predators of the insects causing the damage. The message is compositionally specific. Neighbours read it and respond accordingly.")}
        {P("Below the soil — where no eye has ever seen in real time — a more profound network operates. Mycorrhizal fungal hyphae extend from the roots of one tree like threads of an extraordinarily fine cable: 1-10 micrometres in diameter, branching and branching again until a single gram of forest soil contains several kilometres of hyphal thread. Where hyphae from different trees meet, they fuse (anastomose), creating junctions that allow signal and nutrient transfer. The forest floor is a living circuit board.")}
        {P("The two channels — air and underground — operate simultaneously and redundantly. A stress event (herbivore attack, drought, fungal infection) triggers both a VOC broadcast upward into the air and a chemical/electrical signal downward into the mycorrhizal network. The air signal moves with wind at ambient diffusion rates — hours to days. The underground signal moves with the speed of ion transport through liquid-filled hyphae — minutes. Neighbours receive both and triangulate the message.")}
      </div>

      {sec("01","Volatile Organic Compounds · Air Diffusion · Detection · Defense Response",V.rose,<>
        {P("A VOC molecule evaporating from a damaged leaf must travel from the emitting stomata upward through the leaf boundary layer, then diffuse through the air to a neighbouring plant's leaf surface, enter through that plant's stomata, dissolve in the apoplastic fluid, and bind to a receptor protein. This entire journey can take seconds for nearby leaves on the same plant, or hours for trees 10 metres apart.")}
        {P("The receiver plant does not passively receive the message. Specific receptors on guard cells and mesophyll cells detect the VOC and trigger intracellular signalling cascades. Methyl jasmonate directly activates the jasmonate signalling pathway (COI1 receptor → JAZ protein degradation → MYC2 transcription factor → defence gene expression). The response is transcriptional — the plant reprograms its gene expression based on a chemical signal that arrived through the air.")}
        {P("Wind determines the reach and direction of the VOC signal. Downwind neighbours receive it first and most strongly. Upwind neighbours may not receive it at all. This is not a broadcast equally to all — it is a directional, gradient-encoded message. The concentration of the VOC decreases with distance squared, and the receiver's sensitivity determines its effective detection radius.")}
        <div style={{border:`1px solid ${V.rose}22`,borderRadius:8,padding:2,marginBottom:14}}>
          <VOCCanvas/>
        </div>
        {cards([
          {h:"METHYL JASMONATE",col:V.rose,d:"MeJA: the wound hormone made volatile. In plants, jasmonic acid (JA) is the primary wound signal — synthesised from alpha-linolenic acid via the octadecanoid pathway within minutes of tissue damage. JA is not volatile, but methylation (by JMT enzyme) creates methyl jasmonate, which is volatile (vapour pressure: 0.01-0.1 Pa at 20°C). MeJA enters neighbouring plant leaves through stomata, is demethylated back to JA by MJE enzyme, and activates the full JA defence pathway. Effective range: 10-50 cm in still air; up to 10 m in wind."},
          {h:"GREEN LEAF VOLATILES",col:V.photon,d:"GLVs: the smell of cut grass. Released within seconds of mechanical damage. Source: rupture of plant cells releases alpha-linolenic acid from membrane phospholipids → lipoxygenase (LOX) pathway → C6 aldehydes (hexanal, cis-3-hexenal) and alcohols. Functions: attract parasitoid wasps (eat the herbivores), prime neighbouring plants (30-minute priming response), direct antifungal effect on pathogens. GLVs are the fastest VOC signal — no enzymatic synthesis needed, just membrane rupture. Detection threshold: parts per billion."},
          {h:"ETHYLENE",col:V.amb,d:"Ethylene (C2H4): the simplest plant hormone, a gas at room temperature. Synthesised from SAM (S-adenosylmethionine) via ACC synthase + ACC oxidase. Roles: fruit ripening (binds ETR1 receptor → climacteric ripening cascade), senescence (leaf yellowing), stress response (flooding, pathogen, wounding). The 'ripe apple in a bowl' effect: one ripe apple emitting ethylene ripens neighbouring fruit faster. Ethylene is a true gaseous hormone — secreted, diffuses through air, and received by neighbouring organisms. Detection range: metres."},
          {h:"TERPENE INDIRECT DEFENCE",col:V.green,d:"Herbivore-induced plant volatiles (HIPVs): a two-step defence. Step 1: plant under attack emits a blend of (E)-beta-ocimene, DMNT, TMTT (homoterpenes), and sesquiterpenes. Step 2: parasitoid wasps (Cotesia glomerata) use this blend as a 'dinner bell' — they are attracted to the plant, find the herbivore larvae, parasitise them. Tritrophic indirect defence: plant → volatile → natural enemy of herbivore. The blend is herbivore-specific (different VOC cocktail for caterpillars vs. aphids vs. spider mites), allowing wasps to seek the right prey."},
          {h:"RECEIVER PRIMING",col:V.cyan,d:"Priming: a receiver plant exposed to VOCs from a stressed neighbour does not immediately activate defences (too costly). Instead, it enters a primed state: transcription factors pre-positioned at gene promoters, signalling components pre-synthesised, kinases partially activated. When the primed plant is actually attacked, its defence response is 2-5x faster and 2-3x stronger than an unprimed plant. Priming is an epigenetic state change — methylation patterns at defence gene promoters are altered by the VOC signal, persisting for weeks."},
          {h:"AETHER · VOC FIELD",col:V.rose,d:"AETHER: the VOC cloud is a chemical field — a concentration gradient in 3D space. Each molecule carries a chemical signature; the field is the superposition of all emitters. AETHER models this as a coherence broadcast layer: the emitting plant is the source node; the VOC concentration field is the carrier; each receiver is a detection node with a threshold function. The field decays with distance and time (diffusion + photodegradation). AETHER's field model: information degrades with distance from the source, but priming persists in the receiver as a local memory."},
        ])}
      </>)}

      {sec("02","Mycorrhizal Hyphae · Underground Hi-Fi · Anastomosis · Signal Packets",V.gold,<>
        {P("The mycelium of an arbuscular mycorrhizal fungus (AMF) extends from a plant's root cell as a single germinated spore, then branches and branches again, never losing the cytoplasmic continuity of a single cellular organism. The hyphae are not cells in a row — they are one continuous cell, multi-nucleate, extending for metres through the soil without a single cell wall interrupting the cytoplasm. This is the hi-fi cable: a continuous cytoplasmic wire.")}
        {P("When hyphae from different individual fungi meet in the soil, they can fuse — a process called anastomosis. The fusion creates a junction point where cytoplasm, nuclei, and chemical signals can cross between what were previously separate mycelial networks. A single anastomosis event connects two previously independent networks into one. Over time, the mycorrhizal network in a forest patch becomes a single fused superorganism with no clearly defined individual boundary.")}
        {P("Signal transport along hyphae: several mechanisms operate simultaneously. Ion currents (K+, Ca2+) propagate as electrical signals at the speed of electrodiffusion. Cytoplasmic streaming (actin-myosin-driven) carries larger molecules (sugars, amino acids, proteins) at 1-5 micrometres per second. The combination means an electrical signal (Ca2+ wave) can travel the length of a 10-metre hyphal connection in minutes, while the metabolite cargo follows hours later — exactly like a hi-fi cable sending the signal ahead while the physical packets catch up.")}
        <div style={{border:`1px solid ${V.gold}22`,borderRadius:8,padding:2,marginBottom:14}}>
          <MycorrhizalCanvas/>
        </div>
        {cards([
          {h:"HYPHAL STRUCTURE",col:V.gold,d:"Arbuscular mycorrhizal fungi (Glomeromycota): coenocytic hyphae (no cross walls, continuous cytoplasm). Diameter: 2-10 micrometres (for comparison: human hair = 70 micrometres). Wall composition: chitin (N-acetylglucosamine polymer) reinforced with glucan. Branching pattern: dichotomous and lateral, fractal-like with self-similar geometry at multiple scales. Hyphal tip growth: stretches at 1-5 micrometres per minute, directed by a vesicle supply centre (Spitzenkörper) — a membrane-bounded organelle cluster at the tip that navigates soil pores."},
          {h:"ANASTOMOSIS",col:V.gold,d:"Anastomosis: hyphal fusion creating network connectivity. Process: two hyphae grow toward each other (chemotropism), touch, fuse plasma membranes, merge cytoplasm within minutes. Selectivity: AMF only fuse with hyphae from the same or closely related genotype — a self/non-self recognition system (similar to kin recognition). Non-self hyphae that touch do not fuse (programmed cell death at the contact zone instead). This selectivity means each fungal network maintains some individuality even in the connected forest network."},
          {h:"CARBON TRANSFER",col:V.shock,d:"Carbon (sugar) flows from plant to fungus in exchange for phosphorus. The plant exports sucrose via MST transporters (Monosaccharide Transporters) in root cells → converted to glucose/fructose → taken up by fungal hexose transporters. Quantity: 4-20% of a tree's total photosynthate flows to the mycorrhizal network. The fungus stores carbon as glycogen and trehalose (fungal-specific sugars) and transports it through the network via cytoplasmic streaming. Carbon from a sunlit tree can appear in a shaded tree within 48 hours."},
          {h:"PHOSPHORUS TRANSFER",col:V.cyan,d:"Phosphorus moves from fungus to plant. Mechanism: fungi mine mineral phosphorus (apatite dissolution, organic P mineralisation), transport polyphosphate granules along hyphae to the arbuscular interface, hydrolyse to Pi (orthophosphate), export via fungal PHO transporters, taken up by plant PHT1 phosphate transporters in periarbuscular membrane. Rate: AMF can increase plant P uptake 2-10x vs non-mycorrhizal roots. Without AMF, most forest trees would starve for phosphorus in the organic-rich, mineral-poor forest soils."},
          {h:"Ca²⁺ SIGNAL WAVE",col:V.photon,d:"Calcium signalling in mycorrhizal networks: Ca2+ oscillations in plant root cells are the first known indicator of successful AMF colonisation. The fungus sends a 'Myc factor' (lipochitooligosaccharide) → plant perceives it via LysM-RLK receptors → nuclear Ca2+ oscillations (1 spike per 3-5 minutes) → CYCLOPS transcription factor → symbiosis gene activation. Long-distance Ca2+ signals in hyphae: Ca2+ waves propagate from the plant-fungal interface along the hyphal network, alerting distant parts of the fungus to the availability of a new carbon source."},
          {h:"AETHER · HYPHAL HI-FI",col:V.gold,d:"AETHER: the mycorrhizal network is the most profound non-neural information network on Earth. It has: topology (branching, anastomosis, hub trees); signal types (electrical, chemical, nutrient); directionality (source → sink determined by concentration gradients); memory (hyphal architecture encodes past growth decisions); redundancy (multiple paths between any two trees). AETHER maps this onto the knowledge graph: each tree is a node, each hyphal connection is a weighted edge, signal packets are data payloads. The forest knows itself."},
        ])}
      </>)}

      {sec("03","Dual Channel · Air and Ground Simultaneously · Speed Differential",V.vio,<>
        {P("When a stress event triggers a tree to broadcast, it does not choose between channels. Both channels activate simultaneously. The VOC burst is immediate — methyl jasmonate and GLVs begin evaporating within seconds. The mycorrhizal signal also begins immediately — wound-induced jasmonate triggers the synthesis of mycorrhizal signal molecules that enter the root and travel down into the fungal network. The two channels deliver the same fundamental message: stress is present, defence is needed.")}
        {P("The speed differential between channels is meaningful. The underground signal arrives at connected trees in minutes — long before any herbivore could walk there, long before the VOC cloud has diffused far enough to detect. The mycorrhizal channel is the fast channel for connected trees. The VOC channel reaches unconnected trees, trees of different species (not always in the same mycorrhizal network), and provides directional information (upwind vs. downwind placement) that the underground channel cannot.")}
        {P("Kin trees — trees of the same species and genotype — are preferentially connected in the mycorrhizal network. They share more carbon, more signal, and more coordinated defence. A mother tree (a large, old tree that has been in the network for decades) has the most connections and acts as a redistribution hub. When a mother tree is logged or dies, the signal network in that patch degrades significantly — the hub is gone, and many connections it sustained through its carbon contribution collapse.")}
        <div style={{border:`1px solid ${V.vio}22`,borderRadius:8,padding:2,marginBottom:14}}>
          <DualChannelCanvas/>
        </div>
        {cards([
          {h:"TIMING COMPARISON",col:V.vio,d:"Air VOC: methyl jasmonate first emitted within 30-60 seconds of wounding; neighbour plant detects at 10m distance in ~2-6 hours (wind-dependent). Mycorrhizal signal: JA-triggered root signal reaches hyphal junction in ~5-30 minutes (depending on hyphal length); partner tree detects and begins transcriptional response in 30-60 minutes. Ion current (electrical): Ca2+ wave propagates at 100-200 micrometres per second in hyphae — a 10-metre connection traversed in ~1-2 hours. Hydraulic signal: pressure waves in xylem travel at 100-400 m/s (near-instantaneous within the tree, but not transmitted inter-tree)."},
          {h:"SPECIES SPECIFICITY",col:V.cyan,d:"Mycorrhizal networks are not indiscriminate. AMF species have host preferences — Rhizophagus irregularis is more generalist; Glomus species are more specialist. Ectomycorrhizal fungi (ECM, associated with oaks, beeches, pines) are largely host-specific — a pine ECM fungus will not colonise an oak. This creates partitioned underground networks: the pine-ECM network and the oak-ECM network coexist in the same soil but do not interconnect. Cross-species signal transfer happens primarily through: shared generalist AMF species, root-to-root chemical exudate diffusion, and the VOC air channel."},
          {h:"MOTHER TREE",col:V.gold,d:"Mother tree concept (Suzanne Simard): old-growth trees, particularly Douglas firs in Pacific Northwest forests, are network hubs. They have more ECM fungal partners, more hyphal connections, and more carbon budget to share than young trees. Measurements: mother tree seedlings receive 4x more carbon from the network than stranger seedlings growing nearby. Mother tree preferentially allocates to kin (same genotype) seedlings. When mother trees are removed (clear-cut logging), seedling survival rates drop by 30-50% — not because of direct competition removal, but because the network hub and its carbon subsidy are gone."},
          {h:"WILLOW COMMUNICATION",col:V.green,d:"Willow (Salix spp.) documented communication: Rhoades (1983) first observation — tent caterpillar-damaged willows caused browsed condition in undamaged neighbours without contact. Mechanism: VOC blend including salicylaldehyde, phenylacetaldehyde, hexanal. Receiver willows upregulate: tannins (make leaves less digestible), protease inhibitors (disable herbivore digestive enzymes), phenolic compounds (toxic to many insects). The response is systemic — not just near the attack site but throughout the whole plant. Priming duration: 1-3 weeks after VOC exposure ends."},
          {h:"REDWOOD ROOTS",col:V.green,d:"Coastal redwood (Sequoia sempervirens) communication: redwood clonal clusters share a root system (root grafting between genetically identical trees). Root grafts allow direct vascular connection — hydraulic signals, nutrients, and even some electrical signals pass between clonal trees instantly via the shared xylem/phloem. The individual tree is not the unit of the organism — the clone cluster is. A redwood trunk that is completely girdled (bark removed in a ring, cutting off phloem) can survive for years by receiving photosynthate from its root-connected clone partners. The clone is the organism; the individual trunk is an organ."},
          {h:"AETHER · DUAL CHANNEL",col:V.vio,d:"AETHER: two communication channels with different characteristics is a higher-bandwidth system than one. The air channel: high range, low speed, compositionally rich (many VOC types), attenuates with distance, affected by weather. The underground channel: short range (connected trees only), high speed, nutrient-transfer coupled, persistent, reliable. AETHER models this as a two-layer coherence network: a broadcast layer (VOC) and a point-to-point layer (mycorrhizal). The system has no single point of failure. The forest is not dependent on any single tree, any single channel, or any single molecule. Resilient distributed intelligence."},
        ])}
      </>)}
    </div>
  );
}
