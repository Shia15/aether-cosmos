import React, { useEffect, useRef } from "react";

const V = {
  bg:    "#04060E",
  gold:  "#C8A030",
  honey: "#D48A08",
  amb:   "#FF9933",
  blue:  "#4488FF",
  vio:   "#9966FF",
  green: "#44CC77",
  rose:  "#FF6699",
  plasma:"#FF4477",
  cyan:  "#22DDFF",
  rust:  "#C1440E",
  photon:"#00FFBB",
  shock: "#FFDD22",
  fire:  "#FF6622",
  safe:  "#44CC77",
  dim:   "#2A3050",
  ink:   "#B8CCE8",
  mono:  "'Space Mono',monospace" as const,
  serif: "'Crimson Pro',serif"    as const,
  disp:  "'Cinzel',serif"         as const,
};
const lerp = (a:number,b:number,t:number)=>a+(b-a)*Math.max(0,Math.min(1,t));
const clamp = (v:number,lo:number,hi:number)=>Math.max(lo,Math.min(hi,v));

/* ─────────────────────────────────────────────────────────────────────────
   CANVAS 1 · Cryptobiosis · Pressing Pause on Life · Suspended Animation
   ───────────────────────────────────────────────────────────────────────── */
function CryptobiosisCanvas() {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(()=>{
    const cv=ref.current; if(!cv) return;
    const CH=480, PR=window.devicePixelRatio||1;
    const CW=Math.max(cv.offsetWidth,520);
    cv.width=CW*PR; cv.height=CH*PR; cv.style.height=CH+"px";
    const ctx=cv.getContext("2d")!; ctx.scale(PR,PR);
    let frame=0, raf=0;

    /* Organisms */
    const ORGS=[
      {name:"TARDIGRADE",   col:V.green,  revival:"30 yr",trigger:"Desiccation",  maxPause:30,   record:"Ramazzottius varieornatus — revived after 30 years in dry state"},
      {name:"BDELLOID ROTIFER",col:V.cyan,revival:"10 yr",trigger:"Desiccation",  maxPause:10,   record:"Philodina roseola — survives multiple desiccation-rehydration cycles"},
      {name:"BRINE SHRIMP", col:V.amb,    revival:"25 yr",trigger:"Anoxia/dry",   maxPause:25,   record:"Artemia cysts — 25-yr-old cysts hatched; Dead Sea diapause studies"},
      {name:"LOTUS SEED",   col:V.photon, revival:"2000 yr",trigger:"Seed coat",  maxPause:2000, record:"Sacred lotus (Nelumbo nucifera) — 2000-yr seeds germinated, Liaoning"},
      {name:"YEAST SPORE",  col:V.vio,    revival:"1 yr",  trigger:"Sporulation", maxPause:1,    record:"Saccharomyces cerevisiae — spores viable decades in amber"},
    ];

    /* Phase cycle: 0=ACTIVE, 1=ENTERING, 2=CRYPTOBIOSIS, 3=REVIVAL */
    const PHASE_DUR=[100, 80, 200, 120];
    const TOTAL=PHASE_DUR.reduce((a,b)=>a+b,0);

    /* Simulated years elapsed during cryptobiosis (just for display) */
    let yearsElapsed=0;

    const draw=()=>{
      ctx.clearRect(0,0,CW,CH);
      const bg=ctx.createLinearGradient(0,0,0,CH);
      bg.addColorStop(0,"#04060E"); bg.addColorStop(1,"#060A12");
      ctx.fillStyle=bg; ctx.fillRect(0,0,CW,CH);

      const t=frame%TOTAL;
      let phase=0, pt=0, acc=0;
      for(let i=0;i<PHASE_DUR.length;i++){
        if(t<acc+PHASE_DUR[i]){ phase=i; pt=(t-acc)/PHASE_DUR[i]; break; }
        acc+=PHASE_DUR[i];
      }

      /* Metabolism factor: 1=active, 0=cryptobiotic */
      const metabol=phase===0?1:phase===1?lerp(1,0.001,pt):phase===2?0.001:lerp(0.001,1,pt);
      if(phase===2) yearsElapsed=Math.floor(pt*42);
      if(phase===0||phase===1) yearsElapsed=0;

      const PHASE_NAMES=["ACTIVE · METABOLISING","ENTERING CRYPTOBIOSIS","CRYPTOBIOSIS · PAUSED","REVIVAL · REHYDRATING"];
      const PHASE_COLS=[V.green,V.amb,V.cyan,V.photon];

      /* Title */
      ctx.fillStyle=PHASE_COLS[phase]; ctx.font=`9px ${V.mono}`; ctx.textAlign="center";
      ctx.fillText(PHASE_NAMES[phase],CW*0.5,28);

      /* ── LEFT: Organism list with metabolism bars ── */
      const LX=28, OW=CW*0.52;
      ctx.fillStyle=V.dim; ctx.font=`6.5px ${V.mono}`; ctx.textAlign="left";
      ctx.fillText("ORGANISM · CRYPTOBIOSIS MODE · REVIVAL RECORD",LX,48);

      ORGS.forEach((org,i)=>{
        const oy=70+i*80;
        const orgMetabol=metabol*(0.85+0.15*Math.sin(frame*0.04+i*1.3));
        /* Organism name */
        ctx.fillStyle=org.col; ctx.font=`7.5px ${V.mono}`; ctx.textAlign="left";
        ctx.fillText(org.name,LX,oy);
        ctx.fillStyle=V.dim; ctx.font=`5.5px ${V.mono}`;
        ctx.fillText(`${org.trigger} → ${org.revival} revival`,LX,oy+12);

        /* Metabolism bar */
        const bx=LX, by=oy+18, bw=OW-60, bh=12;
        ctx.fillStyle="#1A2030"; ctx.fillRect(bx,by,bw,bh);
        /* Color gradient: green=high, amber=low, plasma=near-zero */
        const mCol=orgMetabol>0.5?V.green:orgMetabol>0.05?V.amb:V.plasma;
        ctx.fillStyle=mCol+"CC"; ctx.fillRect(bx,by,Math.max(1,bw*orgMetabol),bh);
        ctx.strokeStyle=org.col+"33"; ctx.lineWidth=0.5; ctx.strokeRect(bx,by,bw,bh);
        ctx.fillStyle=mCol; ctx.font=`5.5px ${V.mono}`; ctx.textAlign="right";
        ctx.fillText(`${(orgMetabol*100).toFixed(orgMetabol<0.01?3:1)}%`,bx+bw-2,by+9);
        ctx.textAlign="left"; ctx.fillStyle=V.dim;
        ctx.fillText("METABOLISM",bx+2,by+9);

        /* Small organism icon */
        const ix=OW-18, iy2=oy+12;
        const sz=lerp(1,0.45,1-metabol);
        if(org.name==="TARDIGRADE"||org.name.includes("ROTIFER")||org.name.includes("BRINE")){
          /* Microscopic animal: oval + legs or cysts */
          ctx.fillStyle=org.col+(metabol>0.1?"88":"44");
          ctx.beginPath(); ctx.ellipse(ix,iy2,12*sz,8*sz,0,0,Math.PI*2); ctx.fill();
          if(metabol>0.1){
            /* legs wiggling */
            for(let L=0;L<4;L++){
              const lx=ix-8*sz+L*5*sz, ly=iy2+8*sz;
              ctx.strokeStyle=org.col+"88"; ctx.lineWidth=0.8;
              ctx.beginPath(); ctx.moveTo(lx,iy2+4*sz);
              ctx.lineTo(lx+(Math.random()-0.5)*2,ly+4+Math.sin(frame*0.12+L)*3);
              ctx.stroke();
            }
          } else {
            /* desiccation rings in tun */
            ctx.strokeStyle=org.col+"44"; ctx.lineWidth=0.5;
            ctx.beginPath(); ctx.ellipse(ix,iy2,9*sz,6*sz,0,0,Math.PI*2); ctx.stroke();
          }
        } else if(org.name.includes("SEED")){
          /* Seed: teardrop */
          ctx.fillStyle=org.col+(metabol>0.1?"66":"33");
          ctx.beginPath(); ctx.arc(ix,iy2,8*sz,0,Math.PI*2); ctx.fill();
          ctx.fillStyle=org.col+(metabol>0.1?"CC":"66");
          ctx.beginPath(); ctx.arc(ix,iy2-5*sz,4*sz,0,Math.PI*2); ctx.fill();
          if(metabol>0.3){
            /* sprouting root */
            ctx.strokeStyle=V.green+"88"; ctx.lineWidth=1;
            ctx.beginPath(); ctx.moveTo(ix,iy2+8*sz); ctx.lineTo(ix,iy2+14*sz+metabol*6); ctx.stroke();
          }
        } else {
          /* Yeast: budding cell */
          ctx.fillStyle=org.col+(metabol>0.1?"88":"44");
          ctx.beginPath(); ctx.arc(ix,iy2,8*sz,0,Math.PI*2); ctx.fill();
          if(metabol>0.5){
            ctx.beginPath(); ctx.arc(ix+8*sz,iy2-4*sz,5*sz,0,Math.PI*2); ctx.fill();
          }
        }
      });

      /* ── RIGHT: Pause/Play UI + Time Counter ── */
      const RX=CW*0.58, RY=55;
      /* Pause symbol */
      const pcx=RX+55, pcy=RY+60;
      const pauseR=38;
      const pauseGrd=ctx.createRadialGradient(pcx,pcy,0,pcx,pcy,pauseR);
      pauseGrd.addColorStop(0,PHASE_COLS[phase]+"22");
      pauseGrd.addColorStop(1,PHASE_COLS[phase]+"05");
      ctx.fillStyle=pauseGrd; ctx.beginPath(); ctx.arc(pcx,pcy,pauseR,0,Math.PI*2); ctx.fill();
      ctx.strokeStyle=PHASE_COLS[phase]; ctx.lineWidth=1.5;
      ctx.beginPath(); ctx.arc(pcx,pcy,pauseR,-Math.PI/2,-Math.PI/2+Math.PI*2*metabol,false); ctx.stroke();
      /* Pause bars or play triangle */
      if(metabol<0.05){
        /* Pause bars */
        ctx.fillStyle=PHASE_COLS[phase]; ctx.globalAlpha=0.9;
        ctx.fillRect(pcx-12,pcy-14,9,28);
        ctx.fillRect(pcx+3,pcy-14,9,28);
        ctx.globalAlpha=1;
        ctx.fillStyle=PHASE_COLS[phase]; ctx.font=`7px ${V.mono}`; ctx.textAlign="center";
        ctx.fillText("PAUSED",pcx,pcy+52);
      } else {
        /* Play arrow */
        ctx.fillStyle=V.green; ctx.globalAlpha=metabol;
        ctx.beginPath(); ctx.moveTo(pcx-10,pcy-14); ctx.lineTo(pcx+14,pcy); ctx.lineTo(pcx-10,pcy+14); ctx.closePath(); ctx.fill();
        ctx.globalAlpha=1;
        ctx.fillStyle=V.green; ctx.font=`7px ${V.mono}`; ctx.textAlign="center";
        ctx.fillText("ACTIVE",pcx,pcy+52);
      }
      /* Heartbeat line */
      const hx=RX, hy=pcy+70, hw=CW-RX-14;
      ctx.strokeStyle=PHASE_COLS[phase]+"44"; ctx.lineWidth=1;
      ctx.beginPath(); ctx.moveTo(hx,hy);
      for(let x=0;x<hw;x++){
        const px2=hx+x, t2=x/hw;
        if(metabol>0.05){
          /* ECG-like spike */
          let y=hy;
          const pos=((frame*2+x*3)%120)/120;
          if(pos>0.3&&pos<0.35) y=hy-30*metabol;
          else if(pos>0.35&&pos<0.38) y=hy+15*metabol;
          else if(pos>0.38&&pos<0.43) y=hy-20*metabol;
          else y=hy+Math.sin(t2*Math.PI*2)*2*metabol;
          ctx.lineTo(px2,y);
        } else {
          ctx.lineTo(px2,hy+Math.sin(t2*Math.PI*40)*0.5); /* flat line */
        }
      }
      ctx.stroke();
      ctx.fillStyle=PHASE_COLS[phase]; ctx.font=`5.5px ${V.mono}`; ctx.textAlign="left";
      ctx.fillText(metabol>0.05?"HEARTBEAT / METABOLIC PULSE":"FLATLINE · ZERO METABOLIC ACTIVITY",hx,hy-6);

      /* Time counter */
      const TCY=pcy+130;
      ctx.fillStyle=V.dim; ctx.font=`6.5px ${V.mono}`; ctx.textAlign="center";
      ctx.fillText("TIME ELAPSED IN CRYPTOBIOSIS",RX+70,TCY-14);
      ctx.fillStyle=phase===2?V.shock:V.dim;
      ctx.font=phase===2?`bold 24px ${V.mono}`:`18px ${V.mono}`;
      ctx.fillText(phase===2?`${yearsElapsed} YEARS`:"— yr —",RX+70,TCY+14);
      if(phase===2){
        ctx.fillStyle=V.cyan; ctx.font=`6.5px ${V.mono}`;
        ctx.fillText("ORGANISM UNCHANGED · AGING STOPPED",RX+70,TCY+30);
        ctx.fillText("DNA INTACT · TELOMERES PRESERVED",RX+70,TCY+43);
      }

      /* Cryptobiosis mechanisms legend */
      const ML=RX, MY=CH-145;
      ctx.fillStyle=V.dim; ctx.font=`6.5px ${V.mono}`; ctx.textAlign="left";
      ctx.fillText("ENTRY TRIGGERS",ML,MY);
      const triggers=[
        {t:"ANHYDROBIOSIS",c:V.green, d:"water loss > 97%"},
        {t:"CRYOBIOSIS",    c:V.blue,  d:"ice crystal formation"},
        {t:"ANOXYBIOSIS",  c:V.plasma,d:"oxygen removal"},
        {t:"OSMOBIOSIS",   c:V.amb,   d:"high salt / solutes"},
      ];
      triggers.forEach((tr,i)=>{
        const tx=ML+(i%2)*(CW-RX)/2, ty=MY+16+Math.floor(i/2)*22;
        ctx.fillStyle=tr.c; ctx.beginPath(); ctx.arc(tx+4,ty-4,3,0,Math.PI*2); ctx.fill();
        ctx.fillStyle=tr.c; ctx.font=`6px ${V.mono}`; ctx.textAlign="left";
        ctx.fillText(tr.t,tx+10,ty);
        ctx.fillStyle=V.dim; ctx.font=`5.5px ${V.mono}`;
        ctx.fillText(tr.d,tx+10,ty+11);
      });

      frame++; raf=requestAnimationFrame(draw);
    };
    draw();
    return()=>cancelAnimationFrame(raf);
  },[]);
  return <canvas ref={ref} style={{width:"100%",height:"480px",borderRadius:6,display:"block"}}/>;
}

/* ─────────────────────────────────────────────────────────────────────────
   CANVAS 2 · ASU · Air Separation Units · Cryogenic Distillation
   ───────────────────────────────────────────────────────────────────────── */
function ASUCanvas() {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(()=>{
    const cv=ref.current; if(!cv) return;
    const CH=480, PR=window.devicePixelRatio||1;
    const CW=Math.max(cv.offsetWidth,520);
    cv.width=CW*PR; cv.height=CH*PR; cv.style.height=CH+"px";
    const ctx=cv.getContext("2d")!; ctx.scale(PR,PR);
    let frame=0, raf=0;

    /* Gas molecules */
    type Molecule={x:number;y:number;vx:number;vy:number;type:"N2"|"O2"|"Ar"|"CO2";stage:number};
    const MOLS:Molecule[]=[];
    const MOL_COLS:{[k:string]:string}={"N2":V.blue,"O2":"#FF4422","Ar":"#AAAAAA","CO2":"#886622"};
    const MOL_BP:{[k:string]:number}={"N2":-196,"O2":-183,"Ar":-186,"CO2":-78.5};
    /* Atmospheric proportions */
    const ATM_DIST=["N2","N2","N2","N2","N2","N2","N2","N2","O2","O2","Ar","CO2"] as const;
    for(let i=0;i<80;i++){
      const type=ATM_DIST[Math.floor(Math.random()*ATM_DIST.length)] as "N2"|"O2"|"Ar"|"CO2";
      MOLS.push({x:Math.random()*60,y:60+Math.random()*CH,vx:(Math.random()-0.5)*0.4,vy:-0.6-Math.random()*0.8,type,stage:0});
    }

    /* Column geometry */
    const COL_X=CW*0.38, COL_W=70, COL_TOP=30, COL_BOT=CH-90;
    const COL_H=COL_BOT-COL_TOP;
    const PLATES=8; /* distillation trays */

    /* Applications (right panel) */
    const APPS=[
      {label:"MEDICAL O₂",      col:"#FF4422",y:80,  desc:"Hospitals, ICUs, home oxygen. 99.5% purity. Global: 900K tonnes/day"},
      {label:"INDUSTRIAL N₂",   col:V.blue,   y:150, desc:"Food packaging (MAP), electronics fab, inerting. 78% of atmosphere"},
      {label:"LIQUID N₂ CRYO",  col:V.cyan,   y:220, desc:"−196°C cryopreservation. Sperm/egg/embryo banks. Connects to cryptobiosis"},
      {label:"ARGON WELDING",   col:"#AAAAAA",y:290, desc:"TIG/MIG shielding gas. Semiconductor wafer fab. 40Ar stable isotope"},
      {label:"LIQUID O₂ ROCKET",col:V.fire,   y:360, desc:"SpaceX Falcon 9 / Starship LOX. Atlas, Ariane. 1.35 tonnes LOX per tonne kerosene"},
    ];

    const draw=()=>{
      ctx.clearRect(0,0,CW,CH);
      const bg=ctx.createLinearGradient(0,0,0,CH);
      bg.addColorStop(0,"#04060E"); bg.addColorStop(1,"#060C10");
      ctx.fillStyle=bg; ctx.fillRect(0,0,CW,CH);

      /* ── LEFT: Atmosphere intake ── */
      const LX=8;
      ctx.fillStyle=V.dim; ctx.font=`7px ${V.mono}`; ctx.textAlign="center";
      ctx.fillText("ATMOSPHERE",LX+30,26);
      ctx.fillText("INTAKE",LX+30,38);

      /* Composition pie-like bar */
      const gasComp=[
        {type:"N₂",pct:78.09,col:V.blue},{type:"O₂",pct:20.95,col:"#FF4422"},
        {type:"Ar",pct:0.93,col:"#AAAAAA"},{type:"CO₂",pct:0.03,col:"#886622"},
      ];
      let cx2=LX;
      const barW=55, barH=CH-100;
      gasComp.forEach(g=>{
        const h=(g.pct/100)*barH;
        const y2=CH-90-h;
        ctx.fillStyle=g.col+"88"; ctx.fillRect(cx2,y2,barW,h);
        ctx.strokeStyle=g.col+"55"; ctx.lineWidth=0.5; ctx.strokeRect(cx2,y2,barW,h);
        if(g.pct>0.5){
          ctx.fillStyle=g.col; ctx.font=`6.5px ${V.mono}`; ctx.textAlign="center";
          ctx.fillText(g.type,cx2+barW/2,y2+12);
          ctx.fillText(g.pct+"%",cx2+barW/2,y2+24);
        }
      });
      /* Arrow from intake to column */
      ctx.strokeStyle=V.dim+"88"; ctx.lineWidth=2; ctx.setLineDash([4,4]);
      ctx.beginPath(); ctx.moveTo(LX+barW,CH/2); ctx.lineTo(COL_X,CH/2); ctx.stroke();
      ctx.setLineDash([]);
      ctx.fillStyle=V.dim; ctx.font=`5.5px ${V.mono}`; ctx.textAlign="center";
      ctx.fillText("COMPRESSOR",LX+barW+30,CH/2-10);
      ctx.fillText("↓ LIQUEFACTION",LX+barW+30,CH/2+8);
      ctx.fillText("−170°C / 6 bar",LX+barW+30,CH/2+20);

      /* ── CENTER: Cryogenic Distillation Column ── */
      /* Column body */
      const colGrd=ctx.createLinearGradient(COL_X,0,COL_X+COL_W,0);
      colGrd.addColorStop(0,"#1A2840"); colGrd.addColorStop(0.3,"#243550"); colGrd.addColorStop(1,"#1A2840");
      ctx.fillStyle=colGrd; ctx.fillRect(COL_X,COL_TOP,COL_W,COL_H);
      ctx.strokeStyle="#3A6090"; ctx.lineWidth=1; ctx.strokeRect(COL_X,COL_TOP,COL_W,COL_H);
      ctx.fillStyle=V.dim; ctx.font=`7px ${V.mono}`; ctx.textAlign="center";
      ctx.fillText("CRYOGENIC DISTILLATION COLUMN",COL_X+COL_W/2,COL_TOP-8);

      /* Distillation trays */
      for(let p=0;p<PLATES;p++){
        const py=COL_TOP+10+(COL_H-20)*p/(PLATES-1);
        ctx.strokeStyle="#3A6090AA"; ctx.lineWidth=0.8;
        ctx.beginPath(); ctx.moveTo(COL_X+5,py); ctx.lineTo(COL_X+COL_W-5,py); ctx.stroke();
        /* Liquid pool on tray */
        const fraction=p/PLATES;
        const liquidCol=fraction<0.3?V.blue:fraction<0.6?"#8888AA":"#FF4422";
        ctx.fillStyle=liquidCol+"22"; ctx.fillRect(COL_X+5,py,COL_W-10,6);
        /* Boiling point label */
        const bpTemp=lerp(-196,-183,fraction);
        ctx.fillStyle=V.dim; ctx.font=`5px ${V.mono}`; ctx.textAlign="left";
        ctx.fillText(`${bpTemp.toFixed(0)}°C`,COL_X+COL_W+3,py+4);
      }

      /* Temperature gradient arrow */
      const tgx=COL_X+COL_W+30;
      const tgg=ctx.createLinearGradient(0,COL_TOP,0,COL_BOT);
      tgg.addColorStop(0,V.blue+"CC"); tgg.addColorStop(1,"#FF4422CC");
      ctx.fillStyle=tgg; ctx.fillRect(tgx,COL_TOP,8,COL_H);
      ctx.fillStyle=V.blue; ctx.font=`5.5px ${V.mono}`; ctx.textAlign="left";
      ctx.fillText("N₂ −196°C",tgx+12,COL_TOP+10);
      ctx.fillStyle="#AAAAAA";
      ctx.fillText("Ar −186°C",tgx+12,COL_TOP+COL_H/2);
      ctx.fillStyle="#FF4422";
      ctx.fillText("O₂ −183°C",tgx+12,COL_BOT-8);

      /* ── Molecules animated ── */
      MOLS.forEach((m)=>{
        /* Spawn from left intake */
        if(m.x<0||m.y<COL_TOP-20){
          m.x=Math.random()*60; m.y=CH/2+Math.random()*100;
          m.vx=0.4+Math.random()*0.3; m.vy=(Math.random()-0.5)*0.4; m.stage=0;
        }
        /* Move toward column input */
        if(m.stage===0){
          m.x+=m.vx; m.y+=m.vy;
          if(m.x>COL_X){ m.stage=1; m.vx=0; m.vy=-0.5-Math.random()*0.5; }
        }
        /* Inside column: rise/fall based on boiling point */
        if(m.stage===1){
          const bp=MOL_BP[m.type];
          /* N2 = -196 lightest, rises; O2 = -183, sinks */
          const rise=(bp-(-183))/((-196)-(-183)); /* 0=O2, 1=N2 */
          m.vy=lerp(0.3,-0.8,rise)+Math.sin(frame*0.05+m.x)*0.05;
          m.vx=(Math.random()-0.5)*0.15;
          m.x=clamp(m.x+m.vx,COL_X+4,COL_X+COL_W-4);
          m.y+=m.vy;
          /* Escape from top (N2) or bottom (O2) */
          if(m.y<COL_TOP){ m.stage=2; m.vy=-1; m.vx=m.type==="N2"?-0.8:0.5; }
          if(m.y>COL_BOT){ m.stage=3; m.vy=0.5; m.vx=0.6; }
        }
        /* Escaped molecules */
        if(m.stage>=2){ m.x+=m.vx; m.y+=m.vy; }

        /* Draw */
        ctx.fillStyle=MOL_COLS[m.type]+(m.stage===1?"CC":"88");
        ctx.beginPath(); ctx.arc(m.x,m.y,m.stage===1?2.5:2,0,Math.PI*2); ctx.fill();
        if(m.stage===1&&Math.random()<0.1){
          ctx.strokeStyle=MOL_COLS[m.type]+"33"; ctx.lineWidth=0.5;
          ctx.beginPath(); ctx.arc(m.x,m.y,4,0,Math.PI*2); ctx.stroke();
        }
      });

      /* Output labels */
      ctx.fillStyle=V.blue; ctx.font=`7px ${V.mono}`; ctx.textAlign="center";
      ctx.fillText("N₂",COL_X-25,COL_TOP+20);
      ctx.fillText("GAS",COL_X-25,COL_TOP+30);
      ctx.fillStyle="#FF4422";
      ctx.fillText("O₂",COL_X-25,COL_BOT-10);
      ctx.fillText("LIQUID",COL_X-25,COL_BOT);

      /* ── RIGHT: Applications ── */
      const RX=CW*0.65;
      ctx.fillStyle=V.dim; ctx.font=`7px ${V.mono}`; ctx.textAlign="left";
      ctx.fillText("ASU OUTPUTS · APPLICATIONS",RX,26);

      APPS.forEach((app)=>{
        const pulse=0.88+0.12*Math.sin(frame*0.04+app.y*0.03);
        ctx.fillStyle=app.col+"15"; ctx.fillRect(RX,app.y-14,CW-RX-8,56);
        ctx.strokeStyle=app.col+"33"; ctx.lineWidth=0.5; ctx.strokeRect(RX,app.y-14,CW-RX-8,56);
        /* Icon bar */
        ctx.fillStyle=app.col; ctx.fillRect(RX,app.y-14,3,56);
        ctx.fillStyle=app.col; ctx.font=`bold 7px ${V.mono}`; ctx.textAlign="left";
        ctx.fillText(app.label,RX+8,app.y);
        ctx.fillStyle=V.ink+"BB"; ctx.font=`5.5px ${V.mono}`;
        const words=app.desc.split(" ");
        let line="", ly=app.y+13;
        words.forEach(w=>{
          if((line+w).length>32){ ctx.fillText(line,RX+8,ly); line=w+" "; ly+=10; }
          else line+=w+" ";
        });
        ctx.fillText(line,RX+8,ly);
        /* Animated flow indicator */
        const flowX=RX+CW-RX-20, flowY=app.y+18;
        ctx.fillStyle=app.col+Math.floor(pulse*180).toString(16).padStart(2,"0");
        ctx.beginPath(); ctx.arc(flowX,flowY,4,0,Math.PI*2); ctx.fill();
      });

      /* ── BOTTOM: Temperature scale ── */
      const BS=12, BY=CH-70, BW=CW-24;
      ctx.fillStyle=V.dim; ctx.font=`6.5px ${V.mono}`; ctx.textAlign="left";
      ctx.fillText("BOILING POINT SEPARATION · CRYOGENIC SCALE",BS,BY-10);
      const tempScale=ctx.createLinearGradient(BS,0,BS+BW,0);
      tempScale.addColorStop(0,"#001040"); tempScale.addColorStop(0.4,V.blue+"88");
      tempScale.addColorStop(0.7,"#4488AA88"); tempScale.addColorStop(1,"#FF442288");
      ctx.fillStyle=tempScale; ctx.fillRect(BS,BY,BW,24);

      const points=[
        {T:-273.15,label:"ABS ZERO",col:"#888888"},{T:-210,label:"N₂ liq",col:V.blue},
        {T:-196,label:"N₂ bp\n−196°",col:V.cyan},{T:-186,label:"Ar bp\n−186°",col:"#AAAAAA"},
        {T:-183,label:"O₂ bp\n−183°",col:"#FF4422"},{T:-78.5,label:"CO₂ sub",col:"#886622"},
        {T:-40,label:"Cold\n−40°",col:"#88AACC"},{T:0,label:"H₂O\nfreeze",col:"#44AAFF"},
      ];
      points.forEach(p=>{
        const fx=(p.T+273.15)/(273.15-(-273.15));
        const px=BS+fx*BW;
        ctx.strokeStyle=p.col; ctx.lineWidth=0.8;
        ctx.beginPath(); ctx.moveTo(px,BY); ctx.lineTo(px,BY+24); ctx.stroke();
        ctx.fillStyle=p.col; ctx.font=`5px ${V.mono}`; ctx.textAlign="center";
        p.label.split("\n").forEach((l,li)=>ctx.fillText(l,px,BY+38+li*10));
      });

      frame++; raf=requestAnimationFrame(draw);
    };
    draw();
    return()=>cancelAnimationFrame(raf);
  },[]);
  return <canvas ref={ref} style={{width:"100%",height:"480px",borderRadius:6,display:"block"}}/>;
}

/* ─────────────────────────────────────────────────────────────────────────
   CANVAS 3 · Telomeres · Cell Division Clock · Cancer & Telomerase
   ───────────────────────────────────────────────────────────────────────── */
function TelomereCanvas() {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(()=>{
    const cv=ref.current; if(!cv) return;
    const CH=500, PR=window.devicePixelRatio||1;
    const CW=Math.max(cv.offsetWidth,520);
    cv.width=CW*PR; cv.height=CH*PR; cv.style.height=CH+"px";
    const ctx=cv.getContext("2d")!; ctx.scale(PR,PR);
    let frame=0, raf=0;

    /* TTAGGG repeat sequence animation */
    const REPEAT="TTAGGG";
    const HAYFLICK=50; /* max normal cell divisions */

    /* Cancer cell mitosis: cells list */
    type CancerCell={x:number;y:number;r:number;phase:number;dividing:boolean};
    const CANCER_CELLS:CancerCell[]=[{x:CW*0.77,y:200,r:14,phase:0,dividing:false}];
    let lastDiv=0;

    const draw=()=>{
      ctx.clearRect(0,0,CW,CH);
      const bg=ctx.createLinearGradient(0,0,0,CH);
      bg.addColorStop(0,"#04060E"); bg.addColorStop(1,"#06080E");
      ctx.fillStyle=bg; ctx.fillRect(0,0,CW,CH);

      /* ── TOP CENTER: Telomere length comparison ── */
      const divisions=Math.floor((frame%480)/480*HAYFLICK);
      const normalTelLen=Math.max(0,1-(divisions/HAYFLICK));
      const cancerTelLen=1.0; /* telomerase maintains length */

      ctx.fillStyle=V.dim; ctx.font=`7px ${V.mono}`; ctx.textAlign="center";
      ctx.fillText("TELOMERE LENGTH vs CELL DIVISION NUMBER",CW*0.5,22);

      /* Chromosome pair — Normal cell */
      const drawChromosome=(cx:number,cy:number,telLen:number,col:string,label:string,isCancer:boolean)=>{
        /* Chromosome body: two chromatids */
        for(let arm=0;arm<2;arm++){
          const ax=cx-10+arm*20;
          ctx.fillStyle="#3A5060";
          ctx.beginPath();
          ctx.roundRect?ctx.roundRect(ax-5,cy-40,10,80,4):ctx.rect(ax-5,cy-40,10,80);
          ctx.fill();
          /* Centromere */
          ctx.fillStyle="#2A4050"; ctx.beginPath(); ctx.arc(ax,cy,5,0,Math.PI*2); ctx.fill();
          /* Telomere caps — length proportional */
          const telH=Math.max(3,telLen*28);
          ctx.fillStyle=isCancer?V.photon:col;
          ctx.beginPath(); ctx.roundRect?ctx.roundRect(ax-5,cy-40-telH,10,telH,3):ctx.rect(ax-5,cy-40-telH,10,telH);
          ctx.fill();
          ctx.beginPath(); ctx.roundRect?ctx.roundRect(ax-5,cy+40,10,telH,3):ctx.rect(ax-5,cy+40,10,telH);
          ctx.fill();
          /* Glow on telomere */
          const tg=ctx.createRadialGradient(ax,cy-40-telH/2,0,ax,cy-40-telH/2,14);
          tg.addColorStop(0,(isCancer?V.photon:col)+"44"); tg.addColorStop(1,"transparent");
          ctx.fillStyle=tg; ctx.beginPath(); ctx.arc(ax,cy-40-telH/2,14,0,Math.PI*2); ctx.fill();
        }
        /* Label */
        ctx.fillStyle=isCancer?V.photon:col; ctx.font=`6.5px ${V.mono}`; ctx.textAlign="center";
        ctx.fillText(label,cx,cy+80);
        ctx.fillStyle=V.dim; ctx.font=`5.5px ${V.mono}`;
        ctx.fillText(isCancer?"TERT ON · NO SHORTENING":`${(telLen*100).toFixed(0)}% REMAINING`,cx,cy+92);
      };

      /* Normal cell chromosome */
      const NCX=CW*0.18, NCY=145;
      drawChromosome(NCX,NCY,normalTelLen,V.rose,"NORMAL CELL (Div "+divisions+")",false);
      /* Senescence marker */
      if(normalTelLen<0.15){
        ctx.strokeStyle=V.plasma+"AA"; ctx.lineWidth=1.5; ctx.setLineDash([3,3]);
        ctx.strokeRect(NCX-35,NCY-90,70,180); ctx.setLineDash([]);
        ctx.fillStyle=V.plasma; ctx.font=`6px ${V.mono}`; ctx.textAlign="center";
        ctx.fillText("⚠ SENESCENCE",NCX,NCY+105);
        ctx.fillText("p53 / p21 ACTIVE",NCX,NCY+116);
      }

      /* Cancer cell chromosome */
      const CCX=CW*0.40, CCY=145;
      drawChromosome(CCX,CCY,cancerTelLen,V.photon,"CANCER CELL",true);
      /* Telomerase enzyme above */
      const tey=CCY-135;
      const teGrd=ctx.createRadialGradient(CCX,tey,0,CCX,tey,22);
      teGrd.addColorStop(0,V.photon+"55"); teGrd.addColorStop(1,V.photon+"08");
      ctx.fillStyle=teGrd; ctx.beginPath(); ctx.arc(CCX,tey,22,0,Math.PI*2); ctx.fill();
      ctx.strokeStyle=V.photon; ctx.lineWidth=1;
      ctx.beginPath(); ctx.arc(CCX,tey,22,0,Math.PI*2); ctx.stroke();
      ctx.fillStyle=V.photon; ctx.font=`5.5px ${V.mono}`; ctx.textAlign="center";
      ctx.fillText("TERT",CCX,tey-4);
      ctx.fillText("TELOMERASE",CCX,tey+6);
      /* Animated repeat addition */
      const repIdx=Math.floor(frame*0.1)%REPEAT.length;
      ctx.fillStyle=V.shock; ctx.font=`6px ${V.mono}`;
      ctx.fillText("+ "+REPEAT.slice(0,repIdx+1),CCX,CCY-80);
      /* Arrow from enzyme to chromosome tip */
      ctx.strokeStyle=V.photon+"66"; ctx.lineWidth=1;
      ctx.beginPath(); ctx.moveTo(CCX,tey+22); ctx.lineTo(CCX,CCY-80); ctx.stroke();

      /* ── RIGHT: TTAGGG Repeat Sequence Display ── */
      const RX=CW*0.56, RY=30;
      ctx.fillStyle=V.dim; ctx.font=`7px ${V.mono}`; ctx.textAlign="left";
      ctx.fillText("TELOMERE SEQUENCE · HUMAN",RX,RY+10);
      ctx.fillStyle=V.gold; ctx.font=`6px ${V.mono}`;
      ctx.fillText("5′–TTAGGG–TTAGGG–TTAGGG–...–3′",RX,RY+24);
      ctx.fillStyle=V.rose; ctx.font=`5.5px ${V.mono}`;
      ctx.fillText("3′–AATCCC–AATCCC–AATCCC–...–5′",RX,RY+35);
      /* Animated: show repeats being consumed in normal cell */
      const totalRepeats=2500; /* normal human: ~2500 TTAGGG repeats */
      const remainingRepeats=Math.max(0,Math.floor(totalRepeats*(normalTelLen)));
      ctx.fillStyle=V.dim; ctx.font=`6px ${V.mono}`; ctx.textAlign="left";
      ctx.fillText("NORMAL CELL REPEATS REMAINING:",RX,RY+52);
      ctx.fillStyle=normalTelLen>0.5?V.green:normalTelLen>0.2?V.amb:V.plasma;
      ctx.font=`bold 10px ${V.mono}`;
      ctx.fillText(`${remainingRepeats.toLocaleString()} TTAGGG`,RX,RY+66);
      ctx.fillStyle=V.dim; ctx.font=`5.5px ${V.mono}`;
      ctx.fillText("(−50 to −200 bp per division)",RX,RY+78);
      ctx.fillText("Hayflick Limit: ~50 divisions",RX,RY+89);

      /* ── Telomerase RNA template ── */
      const TRY=RY+108;
      ctx.fillStyle=V.dim; ctx.font=`7px ${V.mono}`; ctx.textAlign="left";
      ctx.fillText("TELOMERASE hTR RNA TEMPLATE",RX,TRY);
      ctx.fillStyle=V.photon; ctx.font=`7.5px ${V.mono}`;
      ctx.fillText("3′–AAUCCC–AAUCCC–5′ (RNA template)",RX,TRY+15);
      /* Animated base-pairing */
      const bases=[["A","T",V.rose,V.gold],["A","T",V.rose,V.gold],["U","A",V.cyan,V.rose],
                   ["C","G",V.vio,V.green],["C","G",V.vio,V.green],["C","G",V.vio,V.green]];
      bases.forEach((b,i)=>{
        const bx=RX+i*22, by=TRY+35;
        const active=(Math.floor(frame*0.08)%bases.length)===i;
        const sz=active?1.3:1;
        /* RNA base (top) */
        ctx.fillStyle=b[2]; ctx.font=`${7*sz}px ${V.mono}`;
        ctx.textAlign="center"; ctx.fillText(b[0],bx+8,by);
        /* Bond */
        ctx.strokeStyle=active?V.shock+"CC":"#3A5060"; ctx.lineWidth=active?1.5:0.8;
        ctx.beginPath(); ctx.moveTo(bx+8,by+2); ctx.lineTo(bx+8,by+12); ctx.stroke();
        /* DNA base (bottom) */
        ctx.fillStyle=b[3]; ctx.font=`${7*sz}px ${V.mono}`;
        ctx.fillText(b[1],bx+8,by+18);
        if(active){
          ctx.strokeStyle=V.shock+"55"; ctx.lineWidth=6;
          ctx.beginPath(); ctx.arc(bx+8,by+9,10,0,Math.PI*2); ctx.stroke();
        }
      });
      ctx.fillStyle=V.dim; ctx.font=`5.5px ${V.mono}`; ctx.textAlign="left";
      ctx.fillText("RNA template pairing with DNA 3′ overhang",RX,TRY+65);

      /* ── Cancer: TERT expression + drug target ── */
      const DRGY=TRY+88;
      ctx.fillStyle=V.plasma; ctx.font=`7px ${V.mono}`; ctx.textAlign="left";
      ctx.fillText("CANCER: TELOMERASE REACTIVATION",RX,DRGY);
      ctx.fillStyle=V.ink; ctx.font=`5.5px ${V.mono}`;
      ctx.fillText("TERT gene: silenced in normal cells (promoter methylated)",RX,DRGY+14);
      ctx.fillText("Cancer TERT: promoter mutation C228T / C250T → active",RX,DRGY+24);
      ctx.fillText("85–90% of human cancers show telomerase reactivation",RX,DRGY+34);
      /* Drug inhibitor */
      ctx.fillStyle=V.shock; ctx.font=`6.5px ${V.mono}`;
      ctx.fillText("▶ DRUG TARGET: BIBR1532",RX,DRGY+50);
      ctx.fillStyle=V.ink; ctx.font=`5.5px ${V.mono}`;
      ctx.fillText("Non-competitive telomerase inhibitor. IC50 = 93 nM.",RX,DRGY+62);
      ctx.fillText("Blocks telomere extension → senescence → apoptosis.",RX,DRGY+72);
      ctx.fillText("Imetelstat (GRN163L): oligonucleotide TERT inhibitor,",RX,DRGY+82);
      ctx.fillText("FDA Breakthrough (2024) for myelofibrosis.",RX,DRGY+92);
      /* Drug blocking indicator */
      const drugPulse=0.5+0.5*Math.sin(frame*0.08);
      ctx.strokeStyle=`rgba(255,220,30,${drugPulse})`; ctx.lineWidth=1.5;
      ctx.strokeRect(RX-2,DRGY+45,CW-RX-6,54);

      /* ── LEFT BOTTOM: Telomere length chart ── */
      const CHX=12, CHY=CH-155, CHW=CW*0.52, CHH=100;
      ctx.fillStyle=V.dim; ctx.font=`6.5px ${V.mono}`; ctx.textAlign="left";
      ctx.fillText("TELOMERE LENGTH vs CELL DIVISIONS — NORMAL vs CANCER",CHX,CHY-10);
      /* Chart axes */
      ctx.strokeStyle="#2A3050"; ctx.lineWidth=0.8;
      ctx.beginPath(); ctx.moveTo(CHX,CHY); ctx.lineTo(CHX,CHY+CHH); ctx.lineTo(CHX+CHW,CHY+CHH); ctx.stroke();
      ctx.fillStyle=V.dim; ctx.font=`5.5px ${V.mono}`; ctx.textAlign="center";
      ctx.fillText("CELL DIVISIONS",CHX+CHW/2,CHY+CHH+14);
      ctx.save(); ctx.translate(CHX-8,CHY+CHH/2); ctx.rotate(-Math.PI/2);
      ctx.fillText("LENGTH (kb)",0,0); ctx.restore();

      /* Normal cell curve: linear decline */
      ctx.strokeStyle=V.rose; ctx.lineWidth=1.5;
      ctx.beginPath();
      for(let d=0;d<=HAYFLICK;d++){
        const px=CHX+8+(d/HAYFLICK)*(CHW-12);
        const py=CHY+CHH-8-(Math.max(0,1-d/HAYFLICK)*0.85*(CHH-10));
        if(d===0)ctx.moveTo(px,py); else ctx.lineTo(px,py);
      }
      ctx.stroke();
      ctx.fillStyle=V.rose; ctx.font=`5.5px ${V.mono}`; ctx.textAlign="left";
      ctx.fillText("■ Normal",CHX+CHW-45,CHY+12);

      /* Cancer cell curve: flat */
      ctx.strokeStyle=V.photon; ctx.lineWidth=1.5; ctx.setLineDash([4,3]);
      ctx.beginPath(); ctx.moveTo(CHX+8,CHY+CHH-8-(0.85*(CHH-10)));
      ctx.lineTo(CHX+CHW,CHY+CHH-8-(0.85*(CHH-10)));
      ctx.stroke(); ctx.setLineDash([]);
      ctx.fillStyle=V.photon; ctx.font=`5.5px ${V.mono}`; ctx.textAlign="left";
      ctx.fillText("- Cancer (telomerase active)",CHX+CHW-120,CHY+22);

      /* Senescence line */
      const seneY=CHY+CHH-8-(0.15*(CHH-10));
      ctx.strokeStyle=V.plasma+"66"; ctx.lineWidth=0.8; ctx.setLineDash([2,3]);
      ctx.beginPath(); ctx.moveTo(CHX,seneY); ctx.lineTo(CHX+CHW,seneY); ctx.stroke();
      ctx.setLineDash([]);
      ctx.fillStyle=V.plasma; ctx.font=`5.5px ${V.mono}`; ctx.textAlign="right";
      ctx.fillText("crisis / senescence threshold",CHX+CHW,seneY-3);

      /* Current position dot */
      const curDiv=divisions;
      const curPx=CHX+8+(curDiv/HAYFLICK)*(CHW-12);
      const curPy=CHY+CHH-8-(Math.max(0,1-curDiv/HAYFLICK)*0.85*(CHH-10));
      ctx.fillStyle=V.shock; ctx.beginPath(); ctx.arc(curPx,curPy,4,0,Math.PI*2); ctx.fill();
      ctx.fillStyle=V.shock; ctx.font=`5.5px ${V.mono}`; ctx.textAlign="center";
      ctx.fillText(`Div ${curDiv}`,curPx,curPy-8);

      /* ── Cancer cell mitosis animation ── */
      const MCX=CW*0.75, MCY=330;
      ctx.fillStyle=V.dim; ctx.font=`6.5px ${V.mono}`; ctx.textAlign="center";
      ctx.fillText("CANCER · UNLIMITED MITOSIS",MCX,MCY-60);

      /* Spawn new cancer cells */
      if(frame-lastDiv>80&&CANCER_CELLS.length<12){
        const parent=CANCER_CELLS[Math.floor(Math.random()*CANCER_CELLS.length)];
        const angle=Math.random()*Math.PI*2;
        CANCER_CELLS.push({x:parent.x+Math.cos(angle)*22,y:parent.y+Math.sin(angle)*22,r:8,phase:0,dividing:false});
        lastDiv=frame;
      }

      CANCER_CELLS.forEach((cell)=>{
        cell.phase=(cell.phase+1)%360;
        const pulse=0.92+0.08*Math.sin(cell.phase*0.07);
        /* Cell body */
        const cg=ctx.createRadialGradient(cell.x,cell.y,0,cell.x,cell.y,cell.r*pulse);
        cg.addColorStop(0,V.plasma+"88"); cg.addColorStop(0.6,V.rose+"44"); cg.addColorStop(1,V.plasma+"11");
        ctx.fillStyle=cg; ctx.beginPath(); ctx.arc(cell.x,cell.y,cell.r*pulse,0,Math.PI*2); ctx.fill();
        ctx.strokeStyle=V.plasma+"88"; ctx.lineWidth=0.8;
        ctx.beginPath(); ctx.arc(cell.x,cell.y,cell.r*pulse,0,Math.PI*2); ctx.stroke();
        /* Nucleus */
        ctx.fillStyle=V.photon+"55"; ctx.beginPath(); ctx.arc(cell.x,cell.y,cell.r*0.4*pulse,0,Math.PI*2); ctx.fill();
        /* Telomere glow in nucleus */
        const tglow=0.5+0.5*Math.sin(cell.phase*0.1);
        ctx.strokeStyle=`rgba(0,255,187,${tglow*0.6})`; ctx.lineWidth=0.8;
        ctx.beginPath(); ctx.arc(cell.x,cell.y,cell.r*0.4*pulse,0,Math.PI*2); ctx.stroke();
      });
      ctx.fillStyle=V.plasma; ctx.font=`6px ${V.mono}`; ctx.textAlign="center";
      ctx.fillText(`${CANCER_CELLS.length} cells · TERT active`,MCX,MCY+50);
      ctx.fillStyle=V.dim; ctx.font=`5.5px ${V.mono}`;
      ctx.fillText("Normal limit: 50 divisions  |  Cancer: unlimited",MCX,MCY+63);

      frame++; raf=requestAnimationFrame(draw);
    };
    draw();
    return()=>cancelAnimationFrame(raf);
  },[]);
  return <canvas ref={ref} style={{width:"100%",height:"500px",borderRadius:6,display:"block"}}/>;
}

/* ─────────────────────────────────────────────────────────────────────────
   PAGE
   ───────────────────────────────────────────────────────────────────────── */
export default function CryptobiosisAsuTelomeresPage() {
  const S:React.CSSProperties={
    background:V.bg, color:V.ink, minHeight:"100vh",
    padding:"40px 32px 100px", fontFamily:V.serif, maxWidth:980, margin:"0 auto",
  };
  const badge=(t:string,col=V.cyan)=>(
    <span key={t} style={{fontFamily:V.mono,fontSize:"0.52rem",color:col,border:`1px solid ${col}44`,
      borderRadius:3,padding:"2px 8px",letterSpacing:2,marginRight:6,marginBottom:5,display:"inline-block"}}>{t}</span>
  );
  const sec=(n:string,title:string,col:string,body:React.ReactNode)=>(
    <section style={{marginBottom:52}}>
      <div style={{fontFamily:V.mono,fontSize:"0.55rem",color:col,letterSpacing:3,marginBottom:5}}>
        {n} ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─
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
        {[badge("LIVE SIMULATION"),badge("CRYPTOBIOSIS",V.green),badge("SUSPENDED ANIMATION",V.cyan),
          badge("ASU",V.blue),badge("70% NITROGEN",V.blue),badge("TELOMERES",V.rose),
          badge("TELOMERASE",V.photon),badge("CANCER",V.plasma),badge("HAYFLICK LIMIT",V.amb)]}
        <h1 style={{fontFamily:V.disp,fontSize:"clamp(1.4rem,4vw,2.6rem)",color:V.ink,
          margin:"22px 0 8px",letterSpacing:"0.06em",fontWeight:400,lineHeight:1.2}}>
          CRYPTOBIOSIS · AIR SEPARATION · TELOMERES
        </h1>
        <p style={{fontFamily:V.mono,fontSize:"0.58rem",color:V.dim,letterSpacing:3,margin:"0 0 22px"}}>
          PRESSING PAUSE ON LIFE · ATMOSPHERE 70% N₂ · BIOLOGICAL CLOCK · CANCER IMMORTALITY
        </p>
        {P("Cryptobiosis is nature's solution to a problem engineers have only recently begun to solve: how to preserve a complex, precisely organised system across time without any energy input. The word comes from the Greek kryptos (hidden) and bios (life) — coined by Rahm in 1949 to describe the state of tardigrades, rotifers, and nematodes that cease all measurable biological activity while remaining alive. The mechanism is biochemical: desiccation triggers the replacement of water in cell membranes, proteins, and nucleic acids with trehalose (in animals) or sucrose (in plants) — sugars that form a glassy solid (amorphous vitrification) at room temperature, physically locking every molecule in place. In this state, molecular diffusion ceases, enzymatic reactions halt, oxidative damage cannot propagate, and — critically — the telomere shortening that drives cellular aging stops entirely. The lotus seed germinated after 2,000 years in a Chinese peat bog; the Artemia brine shrimp cyst hatched after 25 years; the tardigrade was revived after 30 years in a dry state — each one biologically the same age it was when it paused.")}
        {P("The connection to human technology is industrial-scale air separation and the biology of aging. Air Separation Units (ASUs) are the industrial machines that take in the same atmosphere that cryptobiotic organisms survive in — 78% nitrogen, 21% oxygen, 0.93% argon — and fractionate it cryogenically into pure streams. The liquid nitrogen produced at −196°C is the same temperature at which sperm, eggs, embryos, and even some organisms can be stored indefinitely: an engineered cryptobiosis. The biological clock that cryptobiosis pauses is encoded in telomeres — protective TTAGGG repeat sequences at chromosome ends that shorten by 50–200 base pairs with every cell division. Cancer cells bypass this clock by reactivating telomerase (TERT/TERC enzyme), allowing unlimited division. The overlap between these three systems — cryptobiosis (pause), ASU nitrogen (industrial cryopreservation), and telomeres (biological clock) — defines the boundary of what life can and cannot do across time.")}
      </div>

      {sec("01","Cryptobiosis · Pressing Pause on Life · Suspended Animation Across Species",V.green,<>
        {P("Cryptobiosis is not death — it is the most precise biological distinction between the two states ever observed. In death, proteins unfold irreversibly, membranes rupture, DNA fragments, and metabolic information is lost. In cryptobiosis, all of these processes are suspended but preserved: proteins maintain their structure in the trehalose glass, membranes are stabilised by direct sugar-headgroup hydrogen bonding (the 'water replacement hypothesis'), DNA remains intact in a glass matrix that prevents both enzymatic and free-radical degradation, and the metabolic wiring — the gene expression state, the protein phosphorylation pattern, the ionic gradients — is frozen at the moment of entry. When water returns, the glass melts, molecules resume motion, enzymatic networks reboot in the same state they paused, and the organism continues its life from the exact molecular moment it stopped. The revival of a 30-year-dormant tardigrade does not require re-learning its own biochemistry — it was never forgotten.")}
        {P("Five modes of cryptobiosis are documented, each with a different trigger and a different protective strategy at the molecular level. Anhydrobiosis (desiccation) is the most studied and the most extreme: organisms lose >97% of body water, shrink to the tun barrel shape, and accumulate trehalose to 20% of dry weight (tardigrades additionally accumulate CAHS-D glass proteins). Cryobiosis (freezing) requires ice-exclusion proteins that prevent intracellular ice crystal nucleation while allowing extracellular ice — the organism dehydrates into its cells and survives in the unfrozen fraction. Anoxybiosis (oxygen deprivation) is the least understood: the organism switches to a highly reduced metabolic state but avoids the reductive stress of complete anoxia by mechanisms that include hydrogen sulfide sensing and mitochondrial uncoupling. Osmobiosis (high salt) parallels anhydrobiosis because high salt draws water out osmotically. The 'pause button' metaphor, while imprecise, captures the thermodynamic essence: the system's Gibbs free energy landscape is frozen at a metastable minimum rather than descending to the global minimum (death/disorder) that thermodynamics would otherwise drive it toward.")}
        <div style={{border:`1px solid ${V.dim}44`,borderRadius:8,padding:2,marginBottom:14}}>
          <CryptobiosisCanvas/>
        </div>
        {cards([
          {h:"ANHYDROBIOSIS",     col:V.green, d:"Desiccation trigger. Water replaced by trehalose/sucrose glass. Tg ~60°C above ambient. Molecular motion ceases. Organisms: tardigrades, bdelloid rotifers, brine shrimp cysts, plant seeds, nematodes, yeast spores. Survival: 30 yr (tardigrade), 25 yr (Artemia cysts), 2,000 yr (lotus seed)."},
          {h:"TREHALOSE GLASS",   col:V.cyan,  d:"α,α-trehalose: disaccharide. Glass-forming agent (Tg = 115°C dry, ~30°C in tissue). Water replacement hypothesis: OH groups H-bond directly to phospholipid headgroups, maintaining membrane bilayer spacing without water. Vitrification hypothesis: glass matrix immobilises proteins in native conformation. Both mechanisms likely operate simultaneously."},
          {h:"CAHS-D VITRIFICATION",col:V.photon,d:"Tardigrade-specific: Cytoplasmic Abundant Heat Soluble-D proteins. Intrinsically disordered (IDP) — no structure in solution. Phase-transition to cross-linked gel/glass on desiccation. Synthetic CAHS-D is now used to dry-preserve vaccines at room temperature without cold chain (Nature 2023). 1 billion doses/year cold chain cost: ~$400M."},
          {h:"AGING PAUSE",       col:V.gold,  d:"During cryptobiosis: telomeres do not shorten (no cell division, no replication). Oxidative damage (the main driver of aging) does not propagate (no molecular motion, no free radicals). mtDNA mutation rate = 0. Protein carbonylation = 0. When the tardigrade wakes from 30 yr: biologically zero years older. This is the only known mechanism that fully pauses aging in a metazoan."},
          {h:"LOTUS SEED RECORD", col:V.amb,   d:"Nelumbo nucifera seeds excavated from a dry lake bed in Liaoning, China. Radiocarbon dated: 1,288 ± 271 years BP (±1σ). Seeds germinated in laboratory at 100% germination rate. Embryo viability maintained by: hard seed coat (prevents water uptake), low moisture interior (~7%), stable sucrose glass, antioxidant phenolics in coat, and complete mitotic arrest."},
          {h:"SPACE CRYPTOBIOSIS",col:V.vio,   d:"Foton-M3 BIOPAN-6 (2007): tardigrades exposed to direct space vacuum + UV for 10 days. Anhydrobiotic (pre-desiccated) tardigrades survived at ~68% revival rate after re-hydration. Active tardigrades: 0% survival (no time to enter cryptobiosis). Key: cryptobiosis entry must be pre-triggered, not reactive to vacuum. ALCC loop time ~6–18 hr vs vacuum lethality <1 min."},
        ])}
      </>)}

      {sec("02","ASU · Air Separation Units · Cryogenic Distillation · 70% Nitrogen Atmosphere",V.blue,<>
        {P("The atmosphere we breathe is 78.09% molecular nitrogen (N₂), 20.95% oxygen (O₂), 0.93% argon (Ar), 0.04% CO₂, and trace noble gases. Air Separation Units are the industrial machines that exploit the tiny differences in boiling points of these gases — N₂ at −196°C, Ar at −186°C, O₂ at −183°C — to separate them by fractional distillation at cryogenic temperatures. The process begins with air compression (to ~6 bar), cooling through a series of heat exchangers to remove moisture and CO₂ (which would freeze and block the equipment), and then liquefaction using the Linde-Hampson cycle: compressed gas expands through a throttle valve (Joule-Thomson expansion), drops in temperature, and partially liquefies. The liquid air enters a two-column distillation system — the lower pressure column (operating at ~5.4 bar) performs the first coarse separation, feeding enriched streams into the upper column (at ~1.4 bar) for higher-purity separation. Because N₂ is more volatile (lower boiling point), it preferentially moves up the column as vapour; O₂, less volatile, concentrates as liquid at the bottom.")}
        {P("The global ASU industry produces approximately 900 million tonnes of industrial gases annually — making it one of the largest energy-consuming industrial processes on Earth (ASUs account for ~0.5% of global electricity consumption). The nitrogen stream, at 78% of the input, becomes the workhorse gas of modern industry: food packaging (modified atmosphere packaging removes O₂ to prevent oxidation — nitrogen keeps bread, chips, and salads shelf-stable for weeks), electronics manufacturing (nitrogen inerting prevents solder oxidation), steel production (nitrogen purging of blast furnaces), and pharmaceuticals (nitrogen blanketing of sterile processes). But the most direct connection to cryptobiosis is liquid nitrogen at −196°C: it is the industrial equivalent of the biological glass state. At −196°C, all enzymatic reactions stop, free radical propagation ceases, and DNA damage is negligible — sperm banks, egg freezing clinics, biobanks, and seed vaults all rely on liquid nitrogen as their cryptobiosis machine. The human fertility industry stores ~1 million embryos in liquid nitrogen globally, each of them biologically paused.")}
        <div style={{border:`1px solid ${V.dim}44`,borderRadius:8,padding:2,marginBottom:14}}>
          <ASUCanvas/>
        </div>
        {cards([
          {h:"FRACTIONAL DISTILLATION",col:V.blue, d:"Linde double-column ASU: lower column (5.4 bar) produces N₂-enriched vapour + O₂-enriched liquid. Upper column (1.4 bar): rectification to >99.5% purity. N₂ bp = −196°C. O₂ bp = −183°C. ΔT = 13°C — large enough for sharp separation. Argon intermediate (−186°C): side draw from upper column → third argon column for 99.99% Ar."},
          {h:"ATMOSPHERE COMPOSITION",col:V.cyan,  d:"N₂: 78.09% (dominant — inert, critical for protein synthesis via Haber process). O₂: 20.95% (metabolic terminal acceptor). Ar: 0.93% (chemically inert, welding shield). CO₂: 0.04% (greenhouse gas, photosynthesis substrate). Ne, He, Kr, Xe: trace. Note: pre-industrial O₂ was same as today — O₂ is not decreasing measurably from fossil fuels."},
          {h:"LIQUID N₂ · CRYO LINK",  col:V.photon,d:"−196°C = Leidenfrost point for N₂. At −196°C: all biological processes halt (same as cryptobiosis). Sperm cryopreservation: −196°C, glycerol + DMSO cryoprotectant, 50-yr-old sample fertile. Embryo vitrification (IVF): ultra-rapid cooling (>20,000°C/min) to avoid ice crystal formation. Global LN₂ production: ~5 million tonnes/year. Cost: ~$0.15/litre."},
          {h:"INDUSTRIAL N₂ USES",     col:V.blue,  d:"MAP (Modified Atmosphere Packaging): 70% N₂ + 30% CO₂ for fresh produce. Metals: nitrogen purging prevents oxidation during heat treatment. Electronics: N₂ reflow soldering (prevents tin whiskers). Pharmaceuticals: nitrogen blanketing of APIs. Oil & gas: N₂ pressure maintenance in pipelines. Tyres: N₂ inflation (less pressure loss vs air — water vapour condenses in air)."},
          {h:"O₂ MEDICAL USES",        col:"#FF4422",d:"Medical O₂: >93% purity (NFPA 99). ICU ventilators, COPD home therapy, surgical anesthesia, hyperbaric O₂ therapy (HBO2). Global consumption: 900K+ tonnes/day (COVID-19 peak: 3× normal demand — ASU capacity became a public health bottleneck in India/Brazil 2021). On-site PSA (pressure swing adsorption) generators supplement piped O₂."},
          {h:"ARGON APPLICATIONS",     col:"#AAAAAA",d:"TIG/MIG welding: Ar shielding displaces O₂/N₂ that would oxidise molten metal. Semiconductor fab: Ar sputtering for thin-film deposition. Light bulbs / incandescent: Ar fill prevents tungsten evaporation. Window insulation: Ar between panes (lower thermal conductivity than air). ⁴⁰Ar/³⁶Ar ratio: used in argon–argon radiometric dating of volcanic rocks."},
        ])}
      </>)}

      {sec("03","Telomeres · Biological Clock · Hayflick Limit · Cancer and Telomerase",V.rose,<>
        {P("Telomeres are the non-coding repetitive DNA sequences — TTAGGG repeated 2,500–3,000 times in humans — that cap the ends of every linear chromosome. They are the solution to the 'end-replication problem': because DNA polymerase can only synthesise DNA in the 5′→3′ direction and requires an RNA primer that is subsequently removed, each round of DNA replication leaves the 3′ end of the lagging strand shortened by 50–200 base pairs. Without telomeres, functional genes at chromosome ends would be progressively lost with each division. With telomeres, only the non-coding cap shortens, protecting the genome for a finite number of divisions. Leonard Hayflick discovered in 1961 that normal human somatic cells divide approximately 50 times before entering permanent cell cycle arrest — the Hayflick Limit. Subsequent work identified telomere length as the molecular counter: cells with longer telomeres divide more times; cells from older donors have shorter telomeres; cells in culture show progressive telomere shortening with each passage. The 2009 Nobel Prize in Physiology or Medicine was awarded to Blackburn, Greider, and Szostak for discovering telomeres and telomerase.")}
        {P("Cancer's relationship with telomeres is paradoxical and clinically transformative. In the earliest stages of cancer development, cells experience replication stress that accelerates telomere shortening — this actually acts as a tumour-suppression mechanism, triggering senescence or apoptosis before transformation is complete. But in the subset of cells that escape this barrier (typically through p53 and RB pathway mutations), telomere crisis can generate the chromosomal instability — fusions, breaks, rearrangements — that fuels cancer genome evolution. The subset of surviving cells then faces a second crisis: their telomeres are critically short and threaten cell viability. The ~85–90% of cancers that become immortal solve this by reactivating telomerase — specifically via promoter mutations in the TERT gene (most commonly C228T and C250T), which remove the methylation silencing that keeps TERT off in normal somatic cells. The result: telomerase adds TTAGGG repeats after every replication cycle, maintaining telomere length indefinitely. This is why cancer cells are 'immortal' — they have hacked the biological clock. The remaining 10–15% of cancers use an alternative mechanism (ALT: Alternative Lengthening of Telomeres) that involves recombination between telomere sequences. Both TERT reactivation and ALT are now validated drug targets: imetelstat (GRN163L), an oligonucleotide that blocks TERT's RNA template, received FDA Breakthrough Therapy designation in 2024 for myelofibrosis.")}
        <div style={{border:`1px solid ${V.dim}44`,borderRadius:8,padding:2,marginBottom:14}}>
          <TelomereCanvas/>
        </div>
        {cards([
          {h:"TELOMERE STRUCTURE",    col:V.rose,  d:"Sequence: 5′–(TTAGGG)ₙ–3′. Length: 5–15 kb in newborns; ~5 kb at senescence threshold. 3′ single-strand overhang (150–200 nt) folds into T-loop + D-loop structure, shielded by shelterin protein complex (TRF1, TRF2, POT1, RAP1, TIN2, TPP1). Shelterin prevents DDR (DNA damage response) at telomere ends — without shelterin, telomeres trigger ATM/ATR kinase cascades."},
          {h:"HAYFLICK LIMIT",        col:V.amb,   d:"~50 divisions for normal human somatic cells. Each division: −50 to −200 bp. Starting length: ~10,000 bp. Threshold for crisis: ~5,000 bp (~25 divisions remaining). Hayflick 1961 (WI-38 fetal lung fibroblasts). Exceptions: germline cells (telomerase active), stem cells (low-level telomerase), immune cells (telomerase inducible by antigen stimulation). Neurons: rarely divide — retain long telomeres."},
          {h:"TELOMERASE MECHANISM",  col:V.photon,d:"Ribonucleoprotein (RNP): TERT (catalytic reverse transcriptase) + TR/hTERC (RNA template). RNA template: 3′–AAUCCCAAUC–5′. Mechanism: template aligns with 3′ overhang → TERT adds TTAGGG → RNA template translocates → repeat. Adds 6 nt/cycle. Processivity: ~12 repeats per binding event. Fills gap left by lagging-strand end-replication problem."},
          {h:"CANCER TERT MUTATION",  col:V.plasma,d:"TERT promoter mutations C228T and C250T: create new E-twenty six (ETS) transcription factor binding sites → TERT upregulated 2–4×. Found in: glioblastoma (83%), melanoma (74%), bladder cancer (59%), hepatocellular carcinoma (44%). Rare in: colorectal, breast, pancreatic cancers (use ALT or p53-driven ALT). TERT amplification also occurs in neuroblastoma (MYCN-driven TERT expression)."},
          {h:"IMETELSTAT · BIBR1532",  col:V.shock, d:"Imetelstat (GRN163L): 13-mer thiophosphoramidate oligonucleotide complementary to hTR template region. Competitive inhibitor (Ki = 0.5 nM). FDA Breakthrough Therapy 2024 (myelofibrosis). BIBR1532: non-nucleoside, non-competitive inhibitor of TERT (IC50 = 93 nM). Binds to allosteric site on TERT, blocks elongation. Neither agent affects normal somatic cells (TERT off) — therapeutic window."},
          {h:"CRYPTOBIOSIS · AGING",  col:V.cyan,  d:"During cryptobiosis: zero cell divisions → zero telomere shortening. Zero molecular motion → zero oxidative damage to telomeres. Zero enzymatic activity → zero telomerase demand. This is the only natural process that completely halts the aging clock in a multicellular animal. Implication: if a human could enter cryptobiosis for 100 years and revive, their telomeres would be 100-year-divisions shorter on revival — but every moment during cryptobiosis: unchanged. Age at exit = age at entry."},
        ])}
      </>)}

      {sec("04","The Convergence · Cryopreservation · Industrial Life Pause · Biological Clock Control",V.photon,<>
        {P("The three systems on this page define a single boundary: the edge of biological time. Cryptobiosis is the evolved version — organisms that cross this boundary do so biochemically, using trehalose and CAHS-D proteins to enter a glass state where time stops. ASU-derived liquid nitrogen is the industrial version — we cool biological material to −196°C and achieve the same thermodynamic result: zero molecular motion, zero enzymatic activity, zero aging. Telomeres are the clock that both systems pause — and that cancer bypasses by a third mechanism: reactivating the enzyme that adds back what time takes away. The three together constitute a complete picture of biological time: how it is measured (telomere length), how it is stopped (cryptobiosis and cryopreservation), and how it is cheated (telomerase reactivation in cancer).")}
        {P("The AETHER framework connects all three back to the core cryptobiosis canvas: the tardigrade that enters tun state is performing a biological cryopreservation without any external equipment, at any temperature, in any environment — from Antarctic ice to Saharan sand. The lotus seed that germinates after 2,000 years has preserved its genome with greater fidelity than any biobank freezer (power outages, equipment failures, cryoprotectant toxicity, thermal cycling during storage all damage cryopreserved material). The cancer cell that activates TERT is making the same biological bet as the organism that evolved telomerase in the germline: sacrifice the tumor-suppression benefit of Hayflick's limit in exchange for unlimited replicative potential. Understanding how cryptobiosis manages to pause all three simultaneously — replication (no division = no telomere shortening), oxidative damage (no molecular motion = no free radicals), and enzymatic activity (glass state = no catalysis) — is the blueprint for the next generation of cryopreservation, anti-aging medicine, and anti-cancer telomerase inhibitors.")}
        {cards([
          {h:"LIQUID N₂ + BIOLOGY",   col:V.blue,  d:"IVF success rates with vitrified embryos: 65–70% (vs 40–45% slow-freeze). Mechanism: ultra-rapid cooling (>20,000°C/min) via Cryotop device → no ice crystals → cell structure preserved. Warming rate: equally fast (≥20,000°C/min). After warming: full embryo development. Proof that biological cryopreservation = engineered cryptobiosis. The ASU made IVF industry possible."},
          {h:"SEED BANKS AS CRYO",    col:V.green, d:"Svalbard Global Seed Vault (Norway, −18°C): 1.3 million seed varieties. Not liquid N₂ — permafrost + refrigeration. Viability: 100–10,000 yr depending on species (orthodox seeds). Recalcitrant seeds (avocado, mango, oak): cannot be dried → cannot be preserved at −18°C → must be grown in living collections. Orthodox seed cryptobiosis: natural anhydrobiosis + low temperature = multi-century storage."},
          {h:"TELOMERE LENGTH TEST",  col:V.rose,  d:"Clinical telomere length testing: FISH (fluorescence in situ hybridisation), qPCR (quantitative PCR relative to reference gene), or STELA (single telomere length analysis). Reference ranges: 20-year-old ~10 kb; 80-year-old ~5 kb; loss rate ~50 bp/yr. Progeria (HGPS): patients age 10× faster, shorter telomeres. Werner syndrome (WRN helicase mutation): premature aging, accelerated telomere loss."},
          {h:"ANTI-AGING TELOMERASE", col:V.photon,d:"TA-65 (astragalus extract): weak TERT activator. Limited human data. Concern: if systemic TERT activation promotes cancer. TransMedics: ex-vivo organ perfusion at 37°C (normothermic machine perfusion) vs cold storage → better outcomes. Implication: the future of organ preservation is warm perfusion (metabolically active) not cold storage (cryptobiotic). Different organs need different strategies."},
          {h:"N₂ ATMOSPHERE SAFETY",  col:V.amb,   d:"Nitrogen asphyxiation: silent, odourless, lethal. O₂ level <16%: impaired judgment. <10%: unconscious in seconds. <6%: death in minutes. ASU facilities: O₂ monitors everywhere. Industrial incidents: several nitrogen asphyxiation deaths annually globally (often confined spaces). The same property that makes N₂ safe for food packaging (inert, displaces O₂) makes it a silent safety hazard in confined spaces."},
          {h:"FULL AETHER THREAD",    col:V.gold,  d:"Solar photons → FMO quantum coherence → plant glucose → flowers → bees → ecosystem → tardigrades (MSDD survivors) → cryptobiosis (pause) → telomeres (the paused clock) → ASU nitrogen (industrial pause) → cancer (hacked clock via TERT) → ALCC (automated restart protocol). The full AETHER thread now includes the biological clock, its pause mechanism, and its pathological bypass."},
        ])}
      </>)}
    </div>
  );
}
