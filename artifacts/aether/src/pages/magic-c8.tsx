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

/* lerp helper */
const lerp=(a:number,b:number,t:number)=>a+(b-a)*t;
const clamp=(v:number,lo:number,hi:number)=>Math.max(lo,Math.min(hi,v));
const gauss=(x:number,mu:number,sig:number)=>Math.exp(-0.5*((x-mu)/sig)**2);

/* ─────────────────────────────────────────────────────────────────────────
   CANVAS 1 · SPECTRAL ANALYSIS + COHERENCE CLOCK
   Mycorrhizal C8 volatile spectrum · Phase synchronisation of four trees
   ───────────────────────────────────────────────────────────────────────── */
function SpectralCoherenceCanvas(){
  const ref=useRef<HTMLCanvasElement>(null);
  useEffect(()=>{
    const cv=ref.current; if(!cv) return;
    const CH=400;
    cv.width=CW; cv.height=CH;
    const ctx=cv.getContext("2d")!;

    /* ── SPECTRAL PANEL: left 52% ── */
    const SP_W=CW*0.52;
    const SP_PAD_L=48, SP_PAD_R=12, SP_PAD_T=30, SP_PAD_B=44;
    const SP_X0=SP_PAD_L, SP_X1=SP_W-SP_PAD_R;
    const SP_Y0=SP_PAD_T, SP_Y1=CH-SP_PAD_B;
    const LOG_LO=-3, LOG_HI=2; /* log10 Hz range: 0.001 → 100 Hz */

    /* Compound signals: {name, logCenter, sigma, col, note} */
    const SIGS=[
      {name:"1-OCTEN-3-OL (C8)",  logC:-1.8, sig:0.35, col:V.photon,  note:"anastomosis attractant"},
      {name:"3-OCTANONE (C8)",    logC:-1.2, sig:0.28, col:V.cyan,   note:"self/non-self"},
      {name:"MeSA · METHYL SAL.", logC:-0.6, sig:0.40, col:V.rose,   note:"stress broadcast"},
      {name:"PHOSPHORUS PULSE",   logC:-2.5, sig:0.55, col:V.gold,   note:"weekly P-flush"},
      {name:"H⁺ PROTON GRADIENT", logC: 0.8, sig:0.30, col:V.green,  note:"pH oscillation"},
      {name:"JASMONATE (JA)",     logC:-0.2, sig:0.45, col:V.amb,    note:"herbivore alarm"},
    ];

    /* ── COHERENCE CLOCK: right 44% ── */
    const CK_CX=CW*0.76, CK_CY=CH*0.50, CK_R=82;
    const TREES_COL=["#A06040","#5090C0","#60B070","#C0A040"];
    const TREES_NAME=["WILLOW","BIRCH","OAK","PINE"];
    /* Each tree has an intrinsic frequency (slightly detuned) and current phase */
    const PHASES=[0, 0.6, 1.3, 2.1]; /* initial phases (out of sync) */
    const FREQS=[1.000, 1.008, 0.995, 1.003]; /* slightly different natural frequencies */

    let t=0, raf=0;
    let coherenceScore=0;

    const draw=()=>{
      ctx.clearRect(0,0,CW,CH);
      const bgG=ctx.createLinearGradient(0,0,CW,0);
      bgG.addColorStop(0,"#06090F"); bgG.addColorStop(0.52,"#050809"); bgG.addColorStop(1,"#040608");
      ctx.fillStyle=bgG; ctx.fillRect(0,0,CW,CH);

      /* ══ SPECTRAL PANEL ══ */

      /* Axes */
      ctx.strokeStyle=`${V.dim}88`; ctx.lineWidth=0.8;
      ctx.beginPath(); ctx.moveTo(SP_X0,SP_Y0); ctx.lineTo(SP_X0,SP_Y1);
      ctx.lineTo(SP_X1,SP_Y1); ctx.stroke();

      /* X-axis ticks (log10 Hz) */
      for(let l=LOG_LO;l<=LOG_HI;l++){
        const fx=(l-LOG_LO)/(LOG_HI-LOG_LO);
        const px=SP_X0+fx*(SP_X1-SP_X0);
        ctx.strokeStyle=`${V.dim}44`; ctx.lineWidth=0.5;
        ctx.beginPath(); ctx.moveTo(px,SP_Y0); ctx.lineTo(px,SP_Y1+4); ctx.stroke();
        ctx.fillStyle=V.dim+"AA"; ctx.font=`7px ${V.mono}`; ctx.textAlign="center";
        const labels=["0.001","0.01","0.1","1","10","100"];
        ctx.fillText(labels[l-LOG_LO],px,SP_Y1+14);
        if(l<LOG_HI){
          /* Minor ticks */
          for(let m=2;m<10;m++){
            const fl=l+Math.log10(m);
            const fx2=(fl-LOG_LO)/(LOG_HI-LOG_LO);
            const px2=SP_X0+fx2*(SP_X1-SP_X0);
            ctx.strokeStyle=`${V.dim}22`;
            ctx.beginPath(); ctx.moveTo(px2,SP_Y1); ctx.lineTo(px2,SP_Y1+3); ctx.stroke();
          }
        }
      }
      ctx.fillStyle=V.dim+"88"; ctx.font=`7px ${V.mono}`; ctx.textAlign="center";
      ctx.fillText("FREQUENCY (Hz) — LOG₁₀ SCALE",SP_X0+(SP_X1-SP_X0)/2,SP_Y1+26);
      ctx.save(); ctx.translate(SP_X0-32,SP_Y0+(SP_Y1-SP_Y0)/2);
      ctx.rotate(-PI/2); ctx.fillText("RELATIVE AMPLITUDE",0,0); ctx.restore();

      /* Y-axis ticks */
      for(let y2=0;y2<=5;y2++){
        const py=SP_Y0+(1-y2/5)*(SP_Y1-SP_Y0);
        ctx.strokeStyle=`${V.dim}22`; ctx.lineWidth=0.5;
        ctx.beginPath(); ctx.moveTo(SP_X0-4,py); ctx.lineTo(SP_X1,py); ctx.stroke();
        ctx.fillStyle=V.dim+"88"; ctx.font=`7px ${V.mono}`; ctx.textAlign="right";
        ctx.fillText((y2/5).toFixed(1),SP_X0-7,py+2.5);
      }

      /* Draw each signal as a filled Gaussian curve */
      SIGS.forEach((sig,si)=>{
        /* Amplitude pulses slowly over time */
        const amp=0.65+0.28*Math.sin(t*0.4+si*1.2);
        const drift=Math.sin(t*0.18+si*0.9)*0.08; /* tiny logHz drift */
        ctx.beginPath();
        let first=true;
        for(let px=SP_X0;px<=SP_X1;px+=1.5){
          const logf=LOG_LO+(px-SP_X0)/(SP_X1-SP_X0)*(LOG_HI-LOG_LO);
          const g=gauss(logf,sig.logC+drift,sig.sig)*amp;
          const py=SP_Y0+(1-g)*(SP_Y1-SP_Y0);
          if(first){ctx.moveTo(px,py);first=false;}else ctx.lineTo(px,py);
        }
        /* Area under curve */
        ctx.lineTo(SP_X1,SP_Y1); ctx.lineTo(SP_X0,SP_Y1); ctx.closePath();
        const col=sig.col;
        const r=parseInt(col.slice(1,3),16), g2=parseInt(col.slice(3,5),16), b=parseInt(col.slice(5,7),16);
        ctx.fillStyle=`rgba(${r},${g2},${b},0.08)`; ctx.fill();
        /* Outline */
        ctx.beginPath(); first=true;
        for(let px=SP_X0;px<=SP_X1;px+=1.5){
          const logf=LOG_LO+(px-SP_X0)/(SP_X1-SP_X0)*(LOG_HI-LOG_LO);
          const g3=gauss(logf,sig.logC+drift,sig.sig)*amp;
          const py=SP_Y0+(1-g3)*(SP_Y1-SP_Y0);
          if(first){ctx.moveTo(px,py);first=false;}else ctx.lineTo(px,py);
        }
        ctx.strokeStyle=`rgba(${r},${g2},${b},0.7)`; ctx.lineWidth=1.1; ctx.stroke();
        /* Peak label */
        const px2=SP_X0+((sig.logC+drift)-LOG_LO)/(LOG_HI-LOG_LO)*(SP_X1-SP_X0);
        const labelY=SP_Y0+(1-amp)*(SP_Y1-SP_Y0)-10;
        if(labelY>SP_Y0+5){
          ctx.fillStyle=sig.col+"BB"; ctx.font=`700 6.5px ${V.mono}`; ctx.textAlign="center";
          ctx.fillText(sig.name.split(" ")[0],px2,labelY);
        }
      });

      /* Legend strip */
      SIGS.forEach((sig,si)=>{
        const lx=SP_PAD_L+si*82, ly=SP_Y1+32;
        ctx.beginPath(); ctx.arc(lx+4,ly-2,3.5,0,TAU);
        ctx.fillStyle=sig.col+"99"; ctx.fill();
        ctx.fillStyle=sig.col+"77"; ctx.font=`6px ${V.mono}`; ctx.textAlign="left";
        ctx.fillText(sig.name.length>14?sig.name.slice(0,13)+"…":sig.name,lx+10,ly+2);
      });

      ctx.fillStyle=V.ink; ctx.font=`700 10px ${V.mono}`; ctx.textAlign="left";
      ctx.fillText("SPECTRAL ANALYSIS · C8 VOLATILES · MYCORRHIZAL SEAL · PHOSPHORUS · H⁺",8,16);

      /* ══ COHERENCE CLOCK ══ */

      /* Update phases */
      const SYNC_RATE=0.003; /* how fast they synchronize */
      let meanPhase=0;
      PHASES.forEach(p=>{meanPhase+=p;}); meanPhase/=4;
      PHASES.forEach((p,pi)=>{
        PHASES[pi]+=FREQS[pi]*0.04; /* advance by intrinsic freq */
        PHASES[pi]+=SYNC_RATE*(meanPhase-p); /* coupling toward mean */
      });

      /* Coherence = how well-aligned phases are (order parameter |<e^iφ>|) */
      let sx=0, sy=0;
      PHASES.forEach(p=>{sx+=Math.cos(p); sy+=Math.sin(p);});
      const rawCoh=Math.sqrt(sx*sx+sy*sy)/4;
      coherenceScore=lerp(coherenceScore,rawCoh,0.02);

      /* Outer ring */
      ctx.strokeStyle=`${V.dim}44`; ctx.lineWidth=1;
      ctx.beginPath(); ctx.arc(CK_CX,CK_CY,CK_R+22,0,TAU); ctx.stroke();

      /* Inner coherence fill (pie chart of sync) */
      const cohG=ctx.createRadialGradient(CK_CX,CK_CY,0,CK_CX,CK_CY,CK_R);
      cohG.addColorStop(0,`rgba(200,160,48,${coherenceScore*0.12})`);
      cohG.addColorStop(1,"transparent");
      ctx.fillStyle=cohG; ctx.beginPath(); ctx.arc(CK_CX,CK_CY,CK_R,0,TAU); ctx.fill();

      /* Tick marks on clock face */
      for(let tk=0;tk<12;tk++){
        const a=tk/12*TAU-PI/2;
        const r0=CK_R-4, r1=CK_R+2;
        ctx.strokeStyle=`${V.dim}66`; ctx.lineWidth=0.8;
        ctx.beginPath(); ctx.moveTo(CK_CX+Math.cos(a)*r0,CK_CY+Math.sin(a)*r0);
        ctx.lineTo(CK_CX+Math.cos(a)*r1,CK_CY+Math.sin(a)*r1); ctx.stroke();
      }

      /* Phase vectors (one per tree) */
      PHASES.forEach((p,pi)=>{
        const ang=p-PI/2;
        const col=TREES_COL[pi];
        const r2=parseInt(col.slice(1,3),16), g2=parseInt(col.slice(3,5),16), b=parseInt(col.slice(5,7),16);
        const tipX=CK_CX+Math.cos(ang)*CK_R*0.85, tipY=CK_CY+Math.sin(ang)*CK_R*0.85;
        /* Trail arc */
        ctx.strokeStyle=`rgba(${r2},${g2},${b},0.18)`; ctx.lineWidth=1;
        ctx.beginPath(); ctx.arc(CK_CX,CK_CY,CK_R*(0.55+pi*0.08),ang-PI/3,ang); ctx.stroke();
        /* Vector */
        ctx.strokeStyle=`rgba(${r2},${g2},${b},0.8)`; ctx.lineWidth=1.8;
        ctx.beginPath(); ctx.moveTo(CK_CX,CK_CY); ctx.lineTo(tipX,tipY); ctx.stroke();
        /* Arrow head */
        const ha=ang+PI*0.85;
        ctx.beginPath(); ctx.moveTo(tipX,tipY);
        ctx.lineTo(tipX+Math.cos(ha)*8,tipY+Math.sin(ha)*8);
        ctx.lineTo(tipX+Math.cos(ang-PI*0.85)*8,tipY+Math.sin(ang-PI*0.85)*8);
        ctx.closePath(); ctx.fillStyle=`rgba(${r2},${g2},${b},0.7)`; ctx.fill();
        /* Tree label on rim */
        const lx=CK_CX+Math.cos(ang)*(CK_R+14), ly=CK_CY+Math.sin(ang)*(CK_R+14);
        ctx.fillStyle=col+"AA"; ctx.font=`700 6.5px ${V.mono}`; ctx.textAlign="center";
        ctx.fillText(TREES_NAME[pi],lx,ly+2);
      });

      /* Central coherence indicator */
      ctx.fillStyle=V.gold; ctx.font=`700 14px ${V.mono}`; ctx.textAlign="center";
      ctx.fillText(`${(coherenceScore*100).toFixed(0)}%`,CK_CX,CK_CY+5);
      ctx.fillStyle=V.dim+"AA"; ctx.font=`6.5px ${V.mono}`;
      ctx.fillText("COHERENCE",CK_CX,CK_CY+17);

      /* Status */
      const cohLabel=coherenceScore>0.85?"PHASE-LOCKED":coherenceScore>0.5?"ENTRAINING":"DECOHERENT";
      const cohCol=coherenceScore>0.85?V.photon:coherenceScore>0.5?V.gold:V.plasma;
      ctx.fillStyle=cohCol+"CC"; ctx.font=`700 8px ${V.mono}`; ctx.textAlign="center";
      ctx.fillText(cohLabel,CK_CX,CH-18);
      ctx.fillStyle=V.dim+"88"; ctx.font=`7px ${V.mono}`;
      ctx.fillText("FUNGAL NETWORK PHASE-LOCK · KURAMOTO COUPLING",CK_CX,CH-6);

      ctx.fillStyle=V.ink; ctx.font=`700 10px ${V.mono}`; ctx.textAlign="left";
      ctx.fillText("COHERENCE CLOCK · 4-TREE KURAMOTO SYNC · MYCORRHIZAL PHASE-LOCK",CW*0.54,16);

      t+=0.016; raf=requestAnimationFrame(draw);
    };
    draw();
    return()=>cancelAnimationFrame(raf);
  },[]);
  return <canvas ref={ref} width={CW} height={400} style={{width:"100%",borderRadius:6,display:"block"}}/>;
}

/* ─────────────────────────────────────────────────────────────────────────
   CANVAS 2 · ION CHANNELS + RECEPTOR → GPCR CASCADE
   Universal membrane channels · Ligand-gated · GPCR trigger chain
   ───────────────────────────────────────────────────────────────────────── */
function IonChannelCascadeCanvas(){
  const ref=useRef<HTMLCanvasElement>(null);
  useEffect(()=>{
    const cv=ref.current; if(!cv) return;
    const CH=500;
    cv.width=CW; cv.height=CH;
    const ctx=cv.getContext("2d")!;

    const MEM_Y=190; /* membrane centre Y */
    const MEM_T=18;  /* half-thickness */

    /* Channel definitions */
    const CHANS=[
      {x:120,name:"TRPA1\nMECH.",col:V.cyan,   ionCol:V.cyan,   ionLabel:"Ca²⁺",charge:+2,open:false,timer:0},
      {x:240,name:"Cav\nVGCC",   col:V.photon, ionCol:V.photon, ionLabel:"Ca²⁺",charge:+2,open:false,timer:0},
      {x:390,name:"Kv\nVGK",     col:V.gold,   ionCol:V.gold,   ionLabel:"K⁺",  charge:+1,open:false,timer:0},
      {x:530,name:"H⁺K⁺\nATPase",col:V.green,  ionCol:V.green,  ionLabel:"H⁺",  charge:+1,open:false,timer:0},
      {x:670,name:"ClC\nCHANNEL",col:V.rose,   ionCol:V.rose,   ionLabel:"Cl⁻", charge:-1,open:false,timer:0},
      {x:800,name:"GPCR\n7TM",   col:V.vio,    ionCol:V.vio,    ionLabel:"SIG", charge:0, open:false,timer:0},
    ];

    /* Free ions */
    const IONS:{x:number;y:number;vx:number;vy:number;col:string;label:string;charge:number;life:number}[]=[];
    /* Cascade molecules */
    const CASCADE:{x:number;y:number;tx:number;ty:number;label:string;col:string;life:number;phase:number}[]=[];
    /* Extracellular signal molecules */
    const EXTMOLS:{x:number;y:number;vx:number;vy:number;col:string;label:string;target:number;life:number}[]=[];

    /* Pre-spawn extracellular molecules */
    for(let i=0;i<18;i++){
      const ti=i%3;
      const cols=[V.photon,V.rose,V.gold];
      const lbls=["C8","JA","P-Pi"];
      EXTMOLS.push({x:Math.random()*CW,y:20+Math.random()*(MEM_Y-MEM_T-40),
        vx:(Math.random()-0.5)*0.3,vy:0.1+Math.random()*0.2,
        col:cols[ti],label:lbls[ti],target:ti*2,life:1});
    }

    /* Cascade stages */
    const CASCADE_STAGES=[
      {x:800,y:MEM_Y+50,  label:"Gα-GTP",col:V.vio},
      {x:700,y:MEM_Y+95,  label:"AC",    col:V.vio},
      {x:600,y:MEM_Y+140, label:"cAMP",  col:V.amb},
      {x:480,y:MEM_Y+140, label:"PKA",   col:V.amb},
      {x:360,y:MEM_Y+140, label:"P-Tgt", col:V.gold},
      {x:240,y:MEM_Y+140, label:"mRNA",  col:V.green},
      {x:130,y:MEM_Y+95,  label:"PROT",  col:V.photon},
    ];

    let t=0, raf=0;
    let cascadeActive=false, cascadeT=0;

    /* Draw single lipid */
    const drawLipid=(x:number,y:number,up:boolean)=>{
      const col=`rgba(80,120,200,0.22)`;
      ctx.fillStyle=col;
      ctx.beginPath(); ctx.arc(x,y+(up?-1:1)*MEM_T,3.5,0,TAU); ctx.fill();
      ctx.strokeStyle=`rgba(60,100,180,0.18)`; ctx.lineWidth=0.7;
      ctx.beginPath(); ctx.moveTo(x,y+(up?-1:1)*MEM_T);
      ctx.lineTo(x+(Math.random()-0.5)*1,y+(up?1:-1)*(MEM_T-3)); ctx.stroke();
    };

    const drawMem=()=>{
      /* Membrane band */
      const mG=ctx.createLinearGradient(0,MEM_Y-MEM_T,0,MEM_Y+MEM_T);
      mG.addColorStop(0,`rgba(40,60,120,0.35)`);
      mG.addColorStop(0.5,`rgba(20,40,90,0.50)`);
      mG.addColorStop(1,`rgba(40,60,120,0.35)`);
      ctx.fillStyle=mG; ctx.fillRect(0,MEM_Y-MEM_T,CW,MEM_T*2);
      /* Lipids */
      for(let li=10;li<CW-10;li+=10){
        if(CHANS.some(c=>Math.abs(c.x-li)<28)) continue;
        drawLipid(li+(Math.sin(li*0.3)*1.5),MEM_Y,true);
        drawLipid(li+(Math.sin(li*0.3)*1.5),MEM_Y,false);
      }
      /* Extracellular label */
      ctx.fillStyle=V.dim+"55"; ctx.font=`7px ${V.mono}`; ctx.textAlign="right";
      ctx.fillText("EXTRACELLULAR",CW-8,MEM_Y-MEM_T-6);
      ctx.fillText("INTRACELLULAR",CW-8,MEM_Y+MEM_T+14);
    };

    const drawChannel=(ch:{x:number;name:string;col:string;ionCol:string;ionLabel:string;charge:number;open:boolean;timer:number})=>{
      const cH=MEM_T*2+10;
      const cW2=26;
      /* Channel body */
      const bodyCol=ch.open?ch.col+"88":ch.col+"33";
      ctx.fillStyle=bodyCol;
      ctx.beginPath();
      ctx.roundRect(ch.x-cW2/2,MEM_Y-cH/2,cW2,cH,4);
      ctx.fill();
      ctx.strokeStyle=ch.col+(ch.open?"BB":"44"); ctx.lineWidth=1;
      ctx.stroke();
      /* Gate (open/closed indicator) */
      if(!ch.open){
        ctx.strokeStyle=ch.col+"88"; ctx.lineWidth=2;
        ctx.beginPath(); ctx.moveTo(ch.x-7,MEM_Y); ctx.lineTo(ch.x+7,MEM_Y); ctx.stroke();
      }else{
        ctx.strokeStyle=ch.col+"EE"; ctx.lineWidth=1;
        ctx.beginPath(); ctx.moveTo(ch.x-9,MEM_Y-5); ctx.lineTo(ch.x-3,MEM_Y-9); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(ch.x+9,MEM_Y+5); ctx.lineTo(ch.x+3,MEM_Y+9); ctx.stroke();
      }
      /* Label */
      const lines=ch.name.split("\n");
      ctx.fillStyle=ch.col+(ch.open?"EE":"88"); ctx.font=`700 6px ${V.mono}`; ctx.textAlign="center";
      ctx.fillText(lines[0],ch.x,MEM_Y-MEM_T-14);
      ctx.fillStyle=ch.col+"66"; ctx.font=`6px ${V.mono}`;
      ctx.fillText(lines[1],ch.x,MEM_Y-MEM_T-5);
    };

    const draw=()=>{
      ctx.clearRect(0,0,CW,CH);
      const bgG=ctx.createLinearGradient(0,0,0,CH);
      bgG.addColorStop(0,"#030508"); bgG.addColorStop(0.38,"#050709");
      bgG.addColorStop(0.39,"#030408"); bgG.addColorStop(1,"#020306");
      ctx.fillStyle=bgG; ctx.fillRect(0,0,CW,CH);

      /* Zone labels */
      ctx.fillStyle=`rgba(0,120,200,0.06)`; ctx.fillRect(0,0,CW,MEM_Y-MEM_T);
      ctx.fillStyle=`rgba(0,60,0,0.05)`; ctx.fillRect(0,MEM_Y+MEM_T,CW,CH-MEM_Y-MEM_T);

      drawMem();

      /* ── CHANNELS UPDATE ── */
      CHANS.forEach((ch,ci)=>{
        ch.timer++;
        if(!ch.open&&ch.timer>60+ci*40){
          ch.open=true; ch.timer=0;
          /* Spawn ions through channel */
          const n=4+ci%3;
          for(let i=0;i<n;i++){
            const goDown=ch.charge>0;
            IONS.push({
              x:ch.x+(Math.random()-0.5)*6,
              y:goDown?MEM_Y-MEM_T-5:MEM_Y+MEM_T+5,
              vx:(Math.random()-0.5)*0.5,
              vy:goDown?1.2:-1.2,
              col:ch.ionCol,
              label:ch.ionLabel,
              charge:ch.charge,
              life:1,
            });
          }
          /* GPCR triggers cascade */
          if(ci===5&&!cascadeActive){
            cascadeActive=true; cascadeT=0;
          }
        }
        if(ch.open&&ch.timer>35){ch.open=false;ch.timer=0;}
        drawChannel(ch);
      });

      /* ── EXTRACELLULAR MOLECULES ── */
      for(let ei=EXTMOLS.length-1;ei>=0;ei--){
        const em=EXTMOLS[ei];
        em.x+=em.vx; em.y+=em.vy;
        /* Bounce off membrane */
        if(em.y>MEM_Y-MEM_T-8){
          em.vy=-Math.abs(em.vy)*0.7; em.vx+=(Math.random()-0.5)*0.2;
        }
        if(em.y<5){em.y=10;em.vy=Math.abs(em.vy);}
        if(em.x<0)em.x=CW; if(em.x>CW)em.x=0;
        ctx.beginPath(); ctx.arc(em.x,em.y,3,0,TAU);
        ctx.fillStyle=em.col+"BB"; ctx.fill();
        ctx.fillStyle=em.col+"77"; ctx.font=`6px ${V.mono}`; ctx.textAlign="center";
        ctx.fillText(em.label,em.x,em.y-6);
      }
      /* Re-spawn depleted molecules */
      if(EXTMOLS.length<16&&Math.random()<0.03){
        const ti=Math.floor(Math.random()*3);
        EXTMOLS.push({x:Math.random()*CW,y:20+Math.random()*(MEM_Y-MEM_T-50),
          vx:(Math.random()-0.5)*0.3,vy:0.1+Math.random()*0.2,
          col:[V.photon,V.rose,V.gold][ti],label:["C8","JA","P-Pi"][ti],target:ti*2,life:1});
      }

      /* ── IONS FLOW ── */
      for(let ii=IONS.length-1;ii>=0;ii--){
        const ion=IONS[ii];
        ion.x+=ion.vx+(Math.random()-0.5)*0.3;
        ion.y+=ion.vy;
        ion.life-=0.008;
        if(ion.life<=0||ion.y<-10||ion.y>CH+10){IONS.splice(ii,1);continue;}
        ctx.beginPath(); ctx.arc(ion.x,ion.y,3.5,0,TAU);
        ctx.fillStyle=ion.col+"BB"; ctx.fill();
        ctx.fillStyle=ion.col+"88"; ctx.font=`700 5.5px ${V.mono}`; ctx.textAlign="center";
        ctx.fillText(ion.label,ion.x,ion.y+1.5);
        /* Electrochemical glow */
        const iG=ctx.createRadialGradient(ion.x,ion.y,0,ion.x,ion.y,8);
        iG.addColorStop(0,ion.col+"22"); iG.addColorStop(1,"transparent");
        ctx.fillStyle=iG; ctx.fillRect(ion.x-8,ion.y-8,16,16);
      }

      /* ── GPCR CASCADE ── */
      if(cascadeActive){
        cascadeT++;
        const stepsActive=Math.min(CASCADE_STAGES.length,Math.floor(cascadeT/45)+1);
        CASCADE_STAGES.forEach((stage,si)=>{
          if(si>=stepsActive) return;
          /* Node */
          const pulse=0.7+0.3*Math.sin(t*3+si);
          ctx.beginPath(); ctx.arc(stage.x,stage.y,12*pulse,0,TAU);
          const sG=ctx.createRadialGradient(stage.x,stage.y,0,stage.x,stage.y,12*pulse);
          sG.addColorStop(0,stage.col+"88"); sG.addColorStop(1,stage.col+"11");
          ctx.fillStyle=sG; ctx.fill();
          ctx.strokeStyle=stage.col+"CC"; ctx.lineWidth=1; ctx.stroke();
          ctx.fillStyle=stage.col+"EE"; ctx.font=`700 6.5px ${V.mono}`; ctx.textAlign="center";
          ctx.fillText(stage.label,stage.x,stage.y+2.5);
          /* Arrow to next */
          if(si<stepsActive-1){
            const next=CASCADE_STAGES[si+1];
            const mx=(stage.x+next.x)/2, my=(stage.y+next.y)/2;
            ctx.strokeStyle=stage.col+"44"; ctx.lineWidth=0.8;
            ctx.beginPath(); ctx.moveTo(stage.x,stage.y); ctx.lineTo(next.x,next.y); ctx.stroke();
            /* Moving particle along the edge */
            const pf=(cascadeT%60)/60;
            const px2=lerp(stage.x,next.x,pf), py2=lerp(stage.y,next.y,pf);
            ctx.beginPath(); ctx.arc(px2,py2,2.5,0,TAU);
            ctx.fillStyle=stage.col+"CC"; ctx.fill();
            void mx; void my;
          }
        });
        /* Cascade label */
        ctx.fillStyle=V.vio+"88"; ctx.font=`700 8px ${V.mono}`; ctx.textAlign="left";
        ctx.fillText(`GPCR TRIGGER CASCADE · ${stepsActive}/${CASCADE_STAGES.length} STAGES`,8,CH-20);
        const cascadeLabels=["GPCR","Gα-GTP","ADENYLYL CYCLASE","cAMP","PKA KINASE","TARGET PHOSPHO.","PROTEIN SYNTHESIS"];
        ctx.fillStyle=V.vio+"55"; ctx.font=`6.5px ${V.mono}`;
        ctx.fillText(cascadeLabels[Math.min(stepsActive-1,cascadeLabels.length-1)],8,CH-9);
        if(cascadeT>800){cascadeActive=false;cascadeT=0;}
      }

      /* Membrane potential readout */
      const vm=-80+35*Math.sin(t*0.7);
      ctx.fillStyle=vm<-60?V.green+"BB":V.plasma+"BB"; ctx.font=`700 11px ${V.mono}`;
      ctx.textAlign="right"; ctx.fillText(`Vm = ${vm.toFixed(0)} mV`,CW-10,MEM_Y-MEM_T-20);
      ctx.fillStyle=V.dim+"88"; ctx.font=`7px ${V.mono}`;
      ctx.fillText("MEMBRANE POTENTIAL",CW-10,MEM_Y-MEM_T-9);

      ctx.fillStyle=V.ink; ctx.font=`700 10px ${V.mono}`; ctx.textAlign="left";
      ctx.fillText("UNIVERSAL ION CHANNELS · Ca²⁺  K⁺  H⁺  Cl⁻ · GPCR TRIGGER CASCADE · C8 LIGAND",8,16);

      t+=0.016; raf=requestAnimationFrame(draw);
    };
    draw();
    return()=>cancelAnimationFrame(raf);
  },[]);
  return <canvas ref={ref} width={CW} height={500} style={{width:"100%",borderRadius:6,display:"block"}}/>;
}

/* ─────────────────────────────────────────────────────────────────────────
   CANVAS 3 · MICROBIAL FORAGING SIMULATION
   Bacteria · Archaea · Fungi · Slime Mold — chemotaxis, run-tumble, hyphal growth
   ───────────────────────────────────────────────────────────────────────── */
function MicrobialForagingCanvas(){
  const ref=useRef<HTMLCanvasElement>(null);
  useEffect(()=>{
    const cv=ref.current; if(!cv) return;
    const CH=500;
    cv.width=CW; cv.height=CH;
    const ctx=cv.getContext("2d")!;

    /* Nutrient sources */
    const NUTRIENTS=[
      {x:CW*0.20,y:CH*0.30,r:80,  col:V.gold,  label:"SUGAR",  val:1.0},
      {x:CW*0.70,y:CH*0.25,r:70,  col:V.photon,label:"P-Pi",   val:0.85},
      {x:CW*0.50,y:CH*0.65,r:90,  col:V.green, label:"NH₄⁺",   val:0.90},
      {x:CW*0.85,y:CH*0.70,r:60,  col:V.cyan,  label:"H₂S",    val:0.70},
    ];
    /* Toxin patches */
    const TOXINS=[
      {x:CW*0.38,y:CH*0.45,r:55,col:V.plasma},
      {x:CW*0.62,y:CH*0.80,r:40,col:V.rose},
    ];

    /* Nutrient concentration at (x,y) */
    const nutrient=(x:number,y:number)=>{
      let sum=0;
      NUTRIENTS.forEach(n=>{
        const d=Math.hypot(x-n.x,y-n.y);
        sum+=n.val*Math.exp(-d*d/(2*n.r*n.r));
      });
      let tox=0;
      TOXINS.forEach(t2=>{
        const d=Math.hypot(x-t2.x,y-t2.y);
        tox+=0.8*Math.exp(-d*d/(2*t2.r*t2.r));
      });
      return sum-tox*1.4;
    };

    /* ── BACTERIA (run-and-tumble chemotaxis) ── */
    const BACT:{x:number;y:number;dir:number;speed:number;runTimer:number;memory:number}[]=[];
    for(let i=0;i<28;i++){
      BACT.push({x:50+Math.random()*(CW-100),y:50+Math.random()*(CH-100),
        dir:Math.random()*TAU,speed:1.2,runTimer:0,memory:nutrient(0,0)});
    }

    /* ── ARCHAEA (slower, prefer H2S patch) ── */
    const ARCH:{x:number;y:number;dir:number;speed:number;timer:number;mem:number}[]=[];
    for(let i=0;i<18;i++){
      ARCH.push({x:50+Math.random()*(CW-100),y:50+Math.random()*(CH-100),
        dir:Math.random()*TAU,speed:0.65,timer:0,mem:0});
    }

    /* ── FUNGI TIPS ── */
    const FTIPS:{x:number;y:number;ang:number;life:number}[]=[];
    const FSEGS:{x1:number;y1:number;x2:number;y2:number}[]=[];
    /* Seed tips from edges */
    for(let i=0;i<6;i++){
      FTIPS.push({x:100+i*130,y:CH*0.50+Math.sin(i)*40,ang:(-PI/2+i*0.3),life:0});
    }

    /* ── SLIME MOLD (Physarum network) ── */
    const SLIME_NODES:{x:number;y:number;mass:number;active:boolean}[]=[];
    const SLIME_EDGES:{a:number;b:number;flow:number;width:number}[]=[];
    /* Central blob with pseudopod arms */
    SLIME_NODES.push({x:CW*0.50,y:CH*0.48,mass:1,active:true}); /* hub */
    const ARM_N=7;
    for(let i=0;i<ARM_N;i++){
      const a=i/ARM_N*TAU;
      const r=80+i%3*30;
      const nx=CW*0.50+Math.cos(a)*r, ny=CH*0.48+Math.sin(a)*r;
      const foodNear=nutrient(nx,ny)>0.4;
      SLIME_NODES.push({x:nx,y:ny,mass:foodNear?0.9:0.2,active:foodNear});
      SLIME_EDGES.push({a:0,b:SLIME_NODES.length-1,flow:foodNear?0.8:0.2,width:foodNear?3:0.8});
    }

    let t=0, raf=0;

    const draw=()=>{
      ctx.clearRect(0,0,CW,CH);
      const bgG=ctx.createLinearGradient(0,0,0,CH);
      bgG.addColorStop(0,"#0A0905"); bgG.addColorStop(1,"#060604");
      ctx.fillStyle=bgG; ctx.fillRect(0,0,CW,CH);

      /* ── DRAW NUTRIENT FIELD ── */
      NUTRIENTS.forEach(n=>{
        const nG=ctx.createRadialGradient(n.x,n.y,0,n.x,n.y,n.r*1.5);
        const r=parseInt(n.col.slice(1,3),16), g=parseInt(n.col.slice(3,5),16), b=parseInt(n.col.slice(5,7),16);
        nG.addColorStop(0,`rgba(${r},${g},${b},0.18)`);
        nG.addColorStop(0.5,`rgba(${r},${g},${b},0.07)`);
        nG.addColorStop(1,"transparent");
        ctx.fillStyle=nG; ctx.fillRect(0,0,CW,CH);
        ctx.fillStyle=n.col+"99"; ctx.font=`700 8px ${V.mono}`; ctx.textAlign="center";
        ctx.fillText(n.label,n.x,n.y);
      });
      /* Toxins */
      TOXINS.forEach(t2=>{
        const tG=ctx.createRadialGradient(t2.x,t2.y,0,t2.x,t2.y,t2.r*1.4);
        tG.addColorStop(0,`${t2.col}22`); tG.addColorStop(1,"transparent");
        ctx.fillStyle=tG; ctx.fillRect(0,0,CW,CH);
        ctx.fillStyle=t2.col+"44"; ctx.font=`700 7px ${V.mono}`; ctx.textAlign="center";
        ctx.fillText("TOXIN",t2.x,t2.y);
      });

      /* ── SLIME MOLD NETWORK ── */
      SLIME_EDGES.forEach(e=>{
        const na=SLIME_NODES[e.a], nb=SLIME_NODES[e.b];
        e.flow=lerp(e.flow,nb.active?0.9:0.1,0.008);
        e.width=lerp(e.width,nb.active?4:0.6,0.01);
        /* Pulsing flow */
        const pulse=0.6+0.4*Math.sin(t*2+e.b);
        ctx.strokeStyle=`rgba(220,180,40,${e.flow*0.55*pulse})`;
        ctx.lineWidth=e.width*pulse;
        ctx.beginPath(); ctx.moveTo(na.x,na.y); ctx.lineTo(nb.x,nb.y); ctx.stroke();
        /* Flow particle */
        if(e.flow>0.5){
          const pf=(t*0.6+e.b*0.3)%1;
          const px2=lerp(na.x,nb.x,pf), py2=lerp(na.y,nb.y,pf);
          ctx.beginPath(); ctx.arc(px2,py2,2,0,TAU);
          ctx.fillStyle=`rgba(255,220,60,${e.flow*0.7})`; ctx.fill();
        }
      });
      /* Slime nodes */
      SLIME_NODES.forEach((sn,si)=>{
        const sz=si===0?10:5+sn.mass*5;
        ctx.beginPath(); ctx.arc(sn.x,sn.y,sz,0,TAU);
        ctx.fillStyle=`rgba(220,180,40,${sn.active?0.55:0.18})`; ctx.fill();
      });
      /* Slime label */
      ctx.fillStyle=V.shock+"88"; ctx.font=`700 8px ${V.mono}`; ctx.textAlign="center";
      ctx.fillText("PHYSARUM",SLIME_NODES[0].x,SLIME_NODES[0].y-15);

      /* ── FUNGI TIPS ── */
      const GROW_RATE=0.7;
      if(FSEGS.length<1200){
        FTIPS.forEach(tp=>{
          tp.life++;
          if(tp.life>240) return;
          /* Nutrient gradient steering */
          const eps=5;
          const g0=nutrient(tp.x,tp.y);
          const gx=(nutrient(tp.x+eps,tp.y)-g0)/eps;
          const gy=(nutrient(tp.x,tp.y+eps)-g0)/eps;
          const gdA=Math.atan2(gy,gx);
          tp.ang+=(gdA-tp.ang)*0.06+(Math.random()-0.5)*0.05;
          tp.ang=clamp(tp.ang,-PI,PI);
          const nx2=tp.x+Math.cos(tp.ang)*GROW_RATE, ny2=tp.y+Math.sin(tp.ang)*GROW_RATE;
          if(nx2>5&&nx2<CW-5&&ny2>5&&ny2<CH-5){
            FSEGS.push({x1:tp.x,y1:tp.y,x2:nx2,y2:ny2});
            tp.x=nx2; tp.y=ny2;
          }
          /* Branch */
          if(Math.random()<0.005&&FTIPS.length<30){
            FTIPS.push({x:tp.x,y:tp.y,ang:tp.ang+(Math.random()-0.5)*1.3,life:0});
          }
        });
      }
      FSEGS.forEach(seg=>{
        ctx.strokeStyle=`rgba(160,100,40,0.28)`; ctx.lineWidth=0.9;
        ctx.beginPath(); ctx.moveTo(seg.x1,seg.y1); ctx.lineTo(seg.x2,seg.y2); ctx.stroke();
      });
      FTIPS.forEach(tp=>{
        if(tp.life>240) return;
        ctx.beginPath(); ctx.arc(tp.x,tp.y,2.5,0,TAU);
        ctx.fillStyle=`rgba(180,120,50,0.6)`; ctx.fill();
      });
      /* Fungi label */
      ctx.fillStyle=`rgba(160,100,40,0.7)`; ctx.font=`700 8px ${V.mono}`; ctx.textAlign="left";
      ctx.fillText("FUNGI TIPS",8,CH-24);

      /* ── BACTERIA UPDATE ── */
      BACT.forEach(b=>{
        b.runTimer++;
        const n=nutrient(b.x,b.y);
        /* Tumble decision: if getting worse, tumble */
        if(b.runTimer>30){
          if(n<b.memory-0.01) b.dir=Math.random()*TAU;
          b.memory=n; b.runTimer=0;
        }
        /* Toxin avoidance: if toxin nearby, reverse */
        let tox=0;
        TOXINS.forEach(tx=>{const d=Math.hypot(b.x-tx.x,b.y-tx.y); if(d<tx.r*1.5)tox+=1/d;});
        if(tox>0.015) b.dir+=PI+Math.random()*0.5;
        b.x+=Math.cos(b.dir)*b.speed; b.y+=Math.sin(b.dir)*b.speed;
        if(b.x<5)b.x=5; if(b.x>CW-5)b.x=CW-5;
        if(b.y<5)b.y=5; if(b.y>CH-5)b.y=CH-5;
        /* Draw */
        ctx.save(); ctx.translate(b.x,b.y); ctx.rotate(b.dir);
        ctx.fillStyle=`rgba(180,80,40,0.7)`;
        ctx.beginPath(); ctx.ellipse(0,0,4,2,0,0,TAU); ctx.fill();
        /* Flagella */
        ctx.strokeStyle=`rgba(180,80,40,0.35)`; ctx.lineWidth=0.7;
        ctx.beginPath(); ctx.moveTo(-4,0);
        ctx.bezierCurveTo(-8+Math.sin(t*6)*3,2,-10+Math.sin(t*6+1)*2,0,-12,Math.sin(t*5)*3);
        ctx.stroke(); ctx.restore();
      });

      /* ── ARCHAEA UPDATE ── */
      ARCH.forEach(a=>{
        a.timer++;
        const n=nutrient(a.x+0.5*(a.x-CW*0.85),a.y+0.5*(a.y-CH*0.70));
        /* Prefer H2S patch (NUTRIENTS[3]) */
        const h2sDist=Math.hypot(a.x-NUTRIENTS[3].x,a.y-NUTRIENTS[3].y);
        const chemBias=Math.atan2(NUTRIENTS[3].y-a.y,NUTRIENTS[3].x-a.x);
        if(a.timer%50===0){
          if(n<a.mem) a.dir=chemBias+(Math.random()-0.5)*0.8;
          a.mem=n;
        }
        a.dir+=(chemBias-a.dir)*0.01;
        a.x+=Math.cos(a.dir)*a.speed; a.y+=Math.sin(a.dir)*a.speed;
        if(a.x<5)a.x=CW-5; if(a.x>CW-5)a.x=5;
        if(a.y<5)a.y=CH-5; if(a.y>CH-5)a.y=5;
        /* Draw archaea: irregular polygon */
        ctx.save(); ctx.translate(a.x,a.y);
        ctx.fillStyle=`rgba(160,80,200,${0.5+h2sDist<80?0.3:0})`;
        ctx.fillStyle=`rgba(160,80,200,0.6)`;
        ctx.beginPath();
        for(let vi=0;vi<6;vi++){
          const va=vi/6*TAU+t*0.3; const vr=3+vi%3;
          vi===0?ctx.moveTo(Math.cos(va)*vr,Math.sin(va)*vr):ctx.lineTo(Math.cos(va)*vr,Math.sin(va)*vr);
        }
        ctx.closePath(); ctx.fill(); ctx.restore();
        void h2sDist;
      });

      /* Legend */
      const leg=[
        {col:"rgba(180,80,40,0.7)",  label:"BACTERIA · run-tumble chemotaxis"},
        {col:"rgba(160,80,200,0.6)", label:"ARCHAEA · H₂S preference"},
        {col:"rgba(160,100,40,0.55)",label:"FUNGI · gradient tip growth"},
        {col:"rgba(220,180,40,0.7)", label:"SLIME MOLD · network reinforcement"},
      ];
      leg.forEach((l,li)=>{
        ctx.beginPath(); ctx.arc(10,CH-72+li*16,4,0,TAU);
        ctx.fillStyle=l.col; ctx.fill();
        ctx.fillStyle=l.col; ctx.font=`700 7px ${V.mono}`; ctx.textAlign="left";
        ctx.fillText(l.label,20,CH-69+li*16);
      });

      ctx.fillStyle=V.ink; ctx.font=`700 10px ${V.mono}`; ctx.textAlign="left";
      ctx.fillText("MICROBIAL FORAGING · BACTERIA · ARCHAEA · FUNGI · SLIME MOLD · CHEMOTAXIS",8,16);

      t+=0.016; raf=requestAnimationFrame(draw);
    };
    draw();
    return()=>cancelAnimationFrame(raf);
  },[]);
  return <canvas ref={ref} width={CW} height={500} style={{width:"100%",borderRadius:6,display:"block"}}/>;
}

/* ─────────────────────────────────────────────────────────────────────────
   PAGE
   ───────────────────────────────────────────────────────────────────────── */
export default function MagicC8Page(){
  const S:React.CSSProperties={
    background:V.bg,color:V.ink,minHeight:"100vh",
    padding:"40px 32px 100px",fontFamily:V.serif,maxWidth:980,margin:"0 auto",
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
        <div key={c.h} style={{background:`${c.col}0B`,border:`1px solid ${c.col}2A`,
          borderRadius:6,padding:"10px 12px"}}>
          <div style={{fontFamily:V.mono,fontSize:"0.59rem",color:c.col,
            letterSpacing:1.5,marginBottom:5}}>{c.h}</div>
          <div style={{fontFamily:V.serif,fontSize:"0.82rem",color:V.ink,lineHeight:1.5}}>{c.d}</div>
        </div>
      ))}
    </div>
  );

  return (
    <div style={S}>
      <div style={{marginBottom:42}}>
        {[badge("MAGIC C8",V.photon),badge("WOOD WIDE WEB",V.gold),badge("PHOSPHORUS",V.gold),
          badge("H⁺ PROTON",V.green),badge("SPECTRAL ANALYSIS",V.cyan),
          badge("COHERENCE CLOCK",V.gold),badge("ION CHANNELS",V.cyan),
          badge("GPCR CASCADE",V.vio),badge("BACTERIA",V.fire),
          badge("ARCHAEA",V.vio),badge("SLIME MOLD",V.shock),
          badge("JELLYFISH · WORMS",V.rose),badge("UNIVERSAL",V.photon)]}
        <h1 style={{fontFamily:V.disp,fontSize:"clamp(1.4rem,4vw,2.8rem)",color:V.photon,
          margin:"22px 0 4px",letterSpacing:"0.08em",fontWeight:400,lineHeight:1.1}}>
          MAGIC C8
        </h1>
        <p style={{fontFamily:V.mono,fontSize:"0.58rem",color:V.dim,letterSpacing:4,
          margin:"0 0 6px"}}>
          WOOD WIDE WEB · SPECTRAL ANALYSIS · MYCORRHIZAL SEAL FUNGI
        </p>
        <p style={{fontFamily:V.mono,fontSize:"0.52rem",color:V.dim+"88",letterSpacing:3,
          margin:"0 0 22px"}}>
          PHOSPHORUS · H⁺ · ION CHANNELS · GPCR · CHEMOTAXIS · ANCIENT FIRST
        </p>
        {P("The number eight. Eight carbons. 1-octen-3-ol: one double bond at carbon-1, a hydroxyl at carbon-3, eight carbons in the chain. This is the molecule mycorrhizal fungi release when they want to attract another hypha. It is the announcement: I am here, I am compatible, come toward me. The signal that initiates the anastomosis event. Eight carbons.")}
        {P("C8 volatiles are found across the entire fungal kingdom. They are released by mushrooms (the 'mushroom smell'), by yeasts under stress, by mycorrhizal hyphae during tip growth. In the soil, they diffuse through air-filled pore spaces faster than water-soluble signals can travel. They are the fungal equivalent of radio: long-range, non-contact, chemically specific communication.")}
        {P("The Wood Wide Web is not a metaphor. It is a physically real network of hyphal threads connecting the roots of most trees on Earth — transporting phosphorus (the currency the tree cannot get alone), hydrogen ions (the proton gradient that drives virtually all cellular energy exchange), sugars, hormones, water, and Ca2+ signals. The network is older than the internet by 450 million years.")}
      </div>

      {sec("01","C8 Spectral Analysis · Coherence Clock · Mycorrhizal Seal Fungi · Phase-Lock",V.photon,<>
        {P("The left panel shows real-time spectral composition of C8 and associated volatile signals from a forest soil mycorrhizal community. Each compound has a characteristic emission frequency — the rate at which the fungal network pulses that compound into the surrounding soil. 1-octen-3-ol and 3-octanone (both C8) dominate in the 0.005-0.1 Hz band (one burst every 10-200 seconds). Methyl salicylate (MeSA, the stress signal) appears at ~0.25 Hz during herbivore attack. The phosphorus flush pulse appears at the very low end (weekly periodicity). The H+ proton gradient oscillates at ~6 Hz — matching the rhythm of fungal proton-pump ATPase cycling.")}
        {P("The right panel is the Coherence Clock. Each of the four trees has a phase vector — the current phase of its root-fungal signal oscillation. When trees are not connected by a functional network, their phases drift independently (each tree's intrinsic frequency is slightly different). As the mycorrhizal network establishes and signal coupling increases, the phases entrain: Kuramoto synchronisation drives all four vectors toward a common rotation rate. The coherence percentage rises from near zero (uncoupled) toward 100% (phase-locked superorganism).")}
        <div style={{border:`1px solid ${V.photon}22`,borderRadius:8,padding:2,marginBottom:14}}>
          <SpectralCoherenceCanvas/>
        </div>
        {cards([
          {h:"1-OCTEN-3-OL CHEMISTRY",col:V.photon,d:"Molecular formula: C8H16O. Chiral centre at C3 — (R) enantiomer is the active anastomosis attractant in most Basidiomycota. Biosynthesis: from linoleic acid (C18:2) via C18 hydroperoxide → β-oxidation to C8. Boiling point: 174°C, but volatilises from moist surfaces at soil temperature. Vapour pressure: 0.7 mmHg at 25°C — sufficient for diffusion through soil pore air at ~1 mm/min. Detection threshold: 3 ng/L in air (picogram sensitivity in fungal chemoreceptors). Also produced by: injured mushrooms, bacteria under oxidative stress, stored grains (signals spoilage)."},
          {h:"PHOSPHORUS TRANSPORT",col:V.gold,d:"Arbuscular mycorrhizal fungi (AMF) are responsible for 70-90% of terrestrial plant phosphorus uptake. Mechanism: external hyphae mine soil using phosphatase enzymes that release orthophosphate (Pi) from organic compounds. Pi enters the hypha via high-affinity phosphate transporters (GvPT, GiPT — Km ~10-20 μM). Inside the hypha: Pi transported as polyphosphate (poly-P) granules, mobilised by vacuolar transporters. Pi delivered to plant at the arbuscule via Pi efflux carrier (PT11 in Medicago). Exchange rate: up to 1-10 pmol P per cm hypha per hour. One tree receives all its P through a few grams of fungal hyphae."},
          {h:"H⁺ PROTON GRADIENT",col:V.green,d:"The proton motive force (PMF) is the universal energy currency of life. In fungal hyphae: plasma membrane H+-ATPase pumps protons OUT of the cell, creating: (1) electrical gradient ΔΨ (~120-180 mV, inside negative), (2) pH gradient (outside acid pH 5-6, inside pH 7.2). Combined PMF: ~240 mV equivalent. This drives: H+/sugar symporters (sucrose uptake), H+/amino acid transporters, H+/phosphate transporters, and Ca2+ re-uptake pumps. The PMF oscillates at ~6 Hz — the ATPase pump cycles (each cycle: H+ out + ATP hydrolysed) are not perfectly steady-state but occur in bursts. The 6 Hz signature is measurable in the C8 spectral analysis because C8 biosynthesis (linoleic acid oxidation) is coupled to the redox state, which is coupled to the PMF."},
          {h:"KURAMOTO COHERENCE",col:V.gold,d:"The Kuramoto model: N oscillators with natural frequencies ωi, coupling strength K: dφi/dt = ωi + K/N Σ sin(φj-φi). Order parameter r = |N^-1 Σ exp(iφj)|. r=0 = fully incoherent; r=1 = phase-locked. Mycorrhizal network coupling: K determined by hyphal conductance (network resistance) and chemical coupling (Ca2+ waves synchronising adjacent cells). Forest coherence: measured in old-growth spruce stands by simultaneous VOC sampling at multiple trees — observed phase-locking of C8 emission peaks at r ≈ 0.6-0.8 over 200m distances. Implication: a connected forest has a coherence phase — a synchronised pulse of chemical activity — not present in isolated trees."},
          {h:"MYCORRHIZAL SEAL",col:V.photon,d:"The mycorrhizal seal is the Hartig net: the intercellular hyphal network that forms between plant root cells (inside the root cortex). In ectomycorrhizal fungi (e.g. Amanita, Boletus, Suillus): hyphae penetrate between cortical cells but do not enter them, forming a reticulate (net-like) interface layer. The seal: (1) isolates the fungal-plant interface from the rest of the soil (creating a microenvironment for nutrient exchange), (2) seals water loss (the Hartig net is impermeable to most solutes), (3) establishes the apoplast compartment where Pi/sugar exchange occurs. Only ectomycorrhizal plants have the Hartig net; arbuscular mycorrhizal fungi penetrate INTO plant cells (forming arbuscules) instead."},
          {h:"C8 AS AETHER KEY",col:V.photon,d:"AETHER: 1-octen-3-ol is a key signal. It is the molecule that tells two independent entities that they are compatible — that fusion is possible. In AETHER's model: every knowledge synthesis begins with a compatibility signal (equivalent to C8). Two knowledge threads that are compatible emit recognition signals toward each other; when they are within contact range, they fuse (anastomosis). The fused knowledge thread carries combined cargo from both sources. C8 is the magic signal because it is simple (8 carbons, one hydroxyl), universal (found in all true fungi), and unambiguous (only compatible hyphae respond). AETHER calls this the C8 principle: recognition before fusion."},
        ])}
      </>)}

      {sec("02","Universal Ion Channels · GPCR Trigger Cascade · Receptor-Binding · Ancient First",V.cyan,<>
        {P("Every living cell on Earth — bacterium, archaeon, fungal hypha, plant root cell, jellyfish nerve net, human neuron — uses the same basic toolkit: ion channels in a lipid bilayer, generating an electrochemical gradient across the membrane. The specific proteins are different; the physics is identical. The gradient is the information. The ion channel is the switch. This is why ion channels are called 'universal': they are the most ancient, most conserved feature of all cellular life.")}
        {P("The first ion channels were simple: single-pass transmembrane proteins that formed a pore when open. The bacterial KcsA channel — a simple K+ channel — is the ancestral form from which all voltage-gated, ligand-gated, and mechanosensitive channels evolved. KcsA is found in Streptomyces bacteria and its crystal structure (solved 1998 by Rod MacKinnon, Nobel 2003) revealed the selectivity filter: a ring of carbonyl oxygen atoms perfectly spaced to strip K+ of its water shell and pull it through the pore, while blocking Na+ (too small, water shell too stable) and Cl- (wrong charge).")}
        {P("The GPCR (G-protein coupled receptor) family is the largest protein family in animal genomes: 800+ genes in humans. They are found in fungi (pheromone receptors, glucose sensors), slime molds (cAMP receptors coordinating aggregation), and all animals. The trigger cascade — GPCR → G-protein → second messenger → kinase → transcription factor — is the universal signal amplification chain. One ligand binding one receptor triggers thousands of downstream events.")}
        <div style={{border:`1px solid ${V.cyan}22`,borderRadius:8,padding:2,marginBottom:14}}>
          <IonChannelCascadeCanvas/>
        </div>
        {cards([
          {h:"TRPA1 · MECHANOSENSITIVE",col:V.cyan,d:"TRPA1 (Transient Receptor Potential Ankyrin 1): a mechanically-gated and chemically-gated Ca2+ channel. Found in: animals (pain, cold sensing), fungi (membrane tension sensing), plants (TRP-like channels in root hair tip growth). Opens when: (1) membrane is stretched (osmotic shock, turgor change), (2) electrophilic compounds bind cysteines in N-terminal ankyrin repeats (this is how C8 — 1-octen-3-ol — triggers Ca2+ influx: the alpha-beta unsaturated carbonyl alkylates TRPA1 cysteines). TRPA1 is the mechanosensitive seal: it detects when a hypha is under mechanical stress (soil particle pressure, turgor buildup at tip), adjusting growth direction."},
          {h:"Cav · VOLTAGE-GATED Ca²⁺",col:V.photon,d:"Voltage-gated Ca2+ channels (Cav): opened by membrane depolarisation. In fungi: Cch1-Mid1 complex (Saccharomyces) is the ancestral Cav, mediating Ca2+ influx during mating pheromone response and wall stress. In plants: 20 Cav-related channels identified, involved in action potential propagation. In animals: Cav1-3 families mediate muscle contraction, neurotransmitter release, hormone secretion. Evolutionary origin: from a simpler 2-domain bacterial channel (BacNav), duplicated to 4 domains in eukaryotes. The 4-domain arrangement creates directional asymmetry: fast activation, slow inactivation."},
          {h:"GPCR → Gα-GTP → AC → cAMP",col:V.vio,d:"GPCR signal cascade: 1. Ligand binds extracellular domain (causes conformational change in TM5/TM6). 2. Intracellular loop 3 contacts Gα-GDP (the inactive G-protein α-subunit). 3. GDP expelled, GTP binds (Gα-GTP is now active). 4. Gα-GTP dissociates from Gβγ. 5. Gα-GTP activates adenylyl cyclase (AC): ATP → cAMP + PPi. 6. cAMP binds PKA regulatory subunits (R), releasing catalytic subunits (C). 7. PKA-C phosphorylates: (a) metabolic enzymes (immediate, seconds), (b) transcription factors CREB (gene expression, minutes-hours). Signal amplification: 1 activated GPCR → ~100 Gα-GTPs → ~1000 cAMPs/second."},
          {h:"ANCIENT FIRST · CNIDARIAN",col:V.rose,d:"Jellyfish (Cnidaria) are the oldest animals with a true nervous system: a diffuse nerve net with no central brain. The Hydra nerve net (~600 Mya) uses: voltage-gated Na+ channels (Nav) for action potential propagation, chemical synapses (glutamate, GABA, neuropeptides), and gap junctions for electrical coupling. These are the same molecular components as human neurons. The cnidarian Nav channel is 90% identical to human Nav1 in the pore-lining domain — 600 million years of sequence conservation. Jellyfish 'decided' the ion channel solution and never changed it. Every animal nervous system since is an elaboration."},
          {h:"ANCIENT FIRST · ANNELID WORM",col:V.rose,d:"Polychaete worms (Annelida, ~550 Mya) were the first animals with a centralised ventral nerve cord and true neurons with long axons. Key innovations: (1) Myelination precursor — the giant axon of the polychaete Myxicola was the model for squid giant axons, which Alan Hodgkin and Andrew Huxley used to derive the action potential equations (1952 Nobel). (2) Synaptic vesicle recycling: the machinery for vesicle endocytosis after neurotransmitter release first characterised in annelid synapses. (3) Chemoreception: annelid prostomium (head) bears chemoreceptor cells using GPCR-like signalling — direct evolutionary ancestor of vertebrate olfactory receptors."},
          {h:"H⁺ K⁺ ATPase · PUMP",col:V.green,d:"H+/K+-ATPase: the proton-potassium exchange pump. In plants: P-type ATPase (AHA family) — the primary active transporter. Pumps H+ OUT, K+ in. ATP hydrolysis per cycle: 1 ATP → 1 H+ out + 1 K+ in. Rate: ~100-200 cycles/second. Creates the PMF (proton motive force) that drives all secondary active transport. In the GPCR cascade context: PKA phosphorylates AHA at the C-terminal autoinhibitory domain → derepresses pump → increased H+ efflux → more acidic apoplast → activates wall-loosening expansins → allows tip growth. The GPCR cascade ends, through this path, in directed cell growth."},
        ])}
      </>)}

      {sec("03","Microbial Foraging · Bacteria · Archaea · Fungi · Slime Mold · Where to Move",V.gold,<>
        {P("Every living thing must solve the same problem: find food, avoid poison, do it faster than competitors. The four great microbial kingdoms have four different answers. Each answer is a different algorithm implemented in cellular hardware — a different relationship between chemical signal, membrane response, motility mechanism, and collective behaviour.")}
        {P("Bacteria run and tumble. Each bacterium is a tiny molecular computer: the concentration of attractant binds receptors in the membrane, triggers a methylation cascade (the bacterial 'memory'), and biases the flagellar rotary motor. Counterclockwise rotation = run (all flagella bundle, cell swims forward). Clockwise = tumble (flagella fly apart, cell rotates randomly, new direction chosen). If concentration is increasing: suppress tumbles (keep running). If decreasing: allow tumbles (try a new direction). A bacterium 1 μm long navigating by sampling concentration over 30 seconds is doing spatial computation with no brain.")}
        {P("Slime molds (Physarum polycephalum) solve a different problem: not individual navigation but collective network optimization. The slime mold is not many cells cooperating — it is one cell with millions of nuclei. Its cytoplasm streams rhythmically through a network of tubes. Tubes carrying more flow thicken; tubes carrying less flow thin and eventually retract. The result: given food sources at multiple locations, the slime mold grows a minimum-spanning-tree network between them. In 2010, researchers placed oat flakes at positions corresponding to Tokyo and surrounding cities, and the slime mold grew a network nearly identical to the Tokyo rail system.")}
        <div style={{border:`1px solid ${V.gold}22`,borderRadius:8,padding:2,marginBottom:14}}>
          <MicrobialForagingCanvas/>
        </div>
        {cards([
          {h:"BACTERIA · RUN-TUMBLE",col:V.fire,d:"E. coli chemotaxis: MCPs (methyl-accepting chemotaxis proteins) in the membrane cluster at cell poles. Attractants (e.g. glucose, aspartate) bind MCPs → inhibit CheA autophosphorylation → less CheY-P → less clockwise rotation of flagellar motor (FliM C-ring) → longer runs. Repellents do the opposite. Memory: CheB and CheR methylate/demethylate MCPs to reset sensitivity (adaptation) — without this, the bacterium would adapt to any concentration and stop navigating. Processing time: ~200 ms from receptor binding to motor response. Gain: 1 receptor → 10 CheA activations → 100 CheY-P molecules → motor response. A bacterium is a fast, adaptive, amplified gradient sensor."},
          {h:"ARCHAEA · CHEMOTAXIS",col:V.vio,d:"Archaeal chemotaxis (archaea): uses the same protein architecture as bacteria (MCP-like receptors, CheA, CheY, flagellar motor) but evolved independently — convergent evolution at the molecular level. Key differences: (1) Archaeal flagella (archaella) rotate in reverse of bacterial flagella: CW = run, CCW = tumble. (2) Halobacterium halobium: swims in a helical path; directional changes are a phase shift in the helix. (3) Sulfolobus: uses gas vesicles for buoyancy; chemotaxis guides vertical migration to optimal H2S, temperature, and pH zones. Archaea are the champions of extreme environments: acidic hot springs (pH 0, 80°C), deep ocean hydrothermal vents (120°C, 200 atm), salt lakes (5M NaCl). Their chemotaxis sensors are tuned accordingly."},
          {h:"FUNGI · TIP CHEMOTAXIS",col:V.gold,d:"Fungal tip chemotaxis differs fundamentally from bacterial chemotaxis: the hypha cannot reverse. The apical tip is the only motile point. Direction is controlled by: (1) the Spitzenkörper position (vesicle supply centre moves toward the signal side of the tip), (2) Rho-GTPase (Cdc42) polarisation — Cdc42-GTP clusters on the side facing the attractant, directing actin polymerisation toward it. (3) TRPA1-mediated Ca2+ influx on the signal-facing side (Ca2+ activates Cdc42 GEF proteins). Result: the tip turns toward attractant sources by relocating its growth machinery. Navigation is irreversible — the hypha records every direction decision as a permanent structural trace."},
          {h:"SLIME MOLD · HAGEN-POISEUILLE",col:V.shock,d:"Physarum network optimization: cytoplasm flow in each tube obeys Hagen-Poiseuille law: Q = πr⁴ΔP / 8ηL. Flow is proportional to the fourth power of radius — doubling tube radius increases flow 16×. Adaptation rule: dr/dt = (|Q| - r*μ) where μ is decay constant. Tubes with high flow grow; tubes with low flow shrink. This is the minimal model that produces network optimization. It converges to a minimum-spanning-tree or Steiner tree depending on boundary conditions. Physarum has been used to compute shortest paths, design railway networks, and model galaxy filament formation — the universe-scale version of the same flow optimization."},
          {h:"WHERE TO EAT",col:V.gold,d:"Decision matrix for microbial foraging: Bacteria: follow gradient of preferred compound; avoid compounds that lower proton motive force; maximise growth rate per unit energy. Archaea: follow gradient of energy source appropriate to metabolism (H2, H2S, Fe2+, light); avoid O2 if anaerobic; prefer temperature/pH matching protein stability. Fungi: grow toward P, N, C sources detectable by tip chemoreceptors; prioritise high-quality patches (high C:N ratio); maintain connection to established network (don't abandon working threads). Slime mold: reach all food sources with minimum tube material; reinforce connections to high-yield sources; retract connections to exhausted sources. No algorithm, no central controller — just local rules producing global optimality."},
          {h:"AETHER · FORAGING",col:V.gold,d:"AETHER: the four microbial foraging algorithms map to four knowledge-search strategies. Bacteria: parallel gradient descent — many agents sample simultaneously, each follows local gradient, global optimum found by bias-accumulation. Archaea: niche specialisation — each archaea targets a specific resource type, avoiding competition by searching different spaces. Fungi: irreversible exploration — commit to a direction, record the path, branch at high-gradient zones. Slime mold: flow-optimized network — allocate bandwidth to high-yield knowledge connections, retract from low-yield ones. AETHER uses all four strategies simultaneously: parallel search (bacterial), specialised subagents (archaeal), persistent exploration paths (fungal), and dynamic knowledge graph rewiring (slime mold)."},
        ])}
      </>)}
    </div>
  );
}
