import React, { useEffect, useRef } from "react";

const TAU=Math.PI*2, PI=Math.PI;
const CW=900;

const V={
  bg:"#02030A", gold:"#C8A030", amb:"#FF9933", blue:"#4488FF",
  vio:"#9966FF", green:"#44CC77", rose:"#FF6699", plasma:"#FF4477",
  cyan:"#22DDFF", photon:"#00FFBB", shock:"#FFDD22", fire:"#FF6622",
  dim:"#2A3050", ink:"#B8CCE8", aurora:"#00FFB2",
  mono:"'Space Mono',monospace" as const,
  serif:"'Crimson Pro',serif" as const,
  disp:"'Cinzel',serif" as const,
};

const lerp=(a:number,b:number,t:number)=>a+(b-a)*t;
const clamp=(v:number,lo:number,hi:number)=>Math.max(lo,Math.min(hi,v));

/* seeded RNG factory */
const mkRng=(seed:number)=>{
  let s=seed;
  return ()=>{s=(s*16807)%2147483647;return(s-1)/2147483646;};
};

/* ─────────────────────────────────────────────────────────────────────────
   CANVAS 1 · STELLAR NEURAL CORE
   The brain as a star: convection cells, firing columns, axon prominences
   ───────────────────────────────────────────────────────────────────────── */
function StellarNeuralCanvas(){
  const ref=useRef<HTMLCanvasElement>(null);
  useEffect(()=>{
    const cv=ref.current; if(!cv) return;
    const CH=450;
    cv.width=CW; cv.height=CH;
    const ctx=cv.getContext("2d")!;
    const rng=mkRng(5551);

    /* ── BRAIN STAR CENTRE ── */
    const BX=CW*0.42, BY=CH*0.50, BR=168;

    /* ── NEURONS (80 nodes placed in rough ellipse) ── */
    const NL=80;
    const NEURONS:{x:number;y:number;charge:number;thresh:number;refrac:number;layer:number}[]=[];
    for(let i=0;i<NL;i++){
      /* Concentric shells: 3 layers */
      const layer=i<20?0:i<50?1:2;
      const rMin=[0,0.38,0.72][layer], rMax=[0.35,0.70,0.98][layer];
      const r=rMin+(rMax-rMin)*Math.sqrt(rng());
      const a=rng()*TAU;
      NEURONS.push({
        x:BX+Math.cos(a)*BR*r,
        y:BY+Math.sin(a)*BR*r*0.85,
        charge:rng()*0.4,
        thresh:0.55+rng()*0.3,
        refrac:0,
        layer,
      });
    }

    /* ── CONNECTIONS (each neuron connects to ~5 nearest in next layer) ── */
    const CONNS:{a:number;b:number;w:number;signal:number;spos:number}[]=[];
    NEURONS.forEach((na,ai)=>{
      const targets=NEURONS
        .map((nb,bi)=>({bi,d:Math.hypot(nb.x-na.x,nb.y-na.y)}))
        .filter(({bi,d})=>bi!==ai&&d<BR*0.38)
        .sort((x,y)=>x.d-y.d)
        .slice(0,Math.floor(3+rng()*4));
      targets.forEach(({bi})=>{
        if(!CONNS.some(c=>(c.a===ai&&c.b===bi)||(c.a===bi&&c.b===ai))){
          CONNS.push({a:ai,b:bi,w:0.3+rng()*0.7,signal:0,spos:0});
        }
      });
    });

    /* ── AXON PROMINENCES (long projections from surface layer) ── */
    const PROMS:{x:number;y:number;ang:number;len:number;particles:{p:number;col:string}[]}[]=[];
    NEURONS.slice(50).forEach(n=>{
      const ang=Math.atan2(n.y-BY,n.x-BX);
      PROMS.push({x:n.x,y:n.y,ang,len:30+rng()*60,particles:[]});
    });

    /* ── FIRING RINGS ── */
    const RINGS:{x:number;y:number;r:number;life:number;col:string}[]=[];

    let t=0, raf=0;

    const firingsThisFrame:{ni:number}[]=[];

    const draw=()=>{
      ctx.clearRect(0,0,CW,CH);
      ctx.fillStyle=V.bg; ctx.fillRect(0,0,CW,CH);

      /* ── STELLAR CORE GLOW ── */
      const coreAmp=0.7+0.3*Math.sin(t*0.6);
      for(let gi=5;gi>=1;gi--){
        const gr=BR*gi*0.35*coreAmp;
        const cG=ctx.createRadialGradient(BX,BY,0,BX,BY,gr);
        const alpha=0.03*(6-gi)*coreAmp;
        cG.addColorStop(0,`rgba(255,220,100,${alpha})`);
        cG.addColorStop(0.4,`rgba(255,140,40,${alpha*0.6})`);
        cG.addColorStop(1,"transparent");
        ctx.fillStyle=cG; ctx.fillRect(BX-gr,BY-gr,gr*2,gr*2);
      }

      /* ── CONVECTION CELL BACKGROUND (photosphere) ── */
      for(let ci=0;ci<28;ci++){
        const a2=ci/28*TAU, cr=BR*(0.65+0.3*Math.sin(ci*1.7));
        const ccx=BX+Math.cos(a2)*cr*0.82, ccy=BY+Math.sin(a2)*cr*0.72;
        const cellPulse=0.5+0.5*Math.sin(t*1.4+ci*0.8);
        const cellR=14+8*cellPulse;
        const cG2=ctx.createRadialGradient(ccx,ccy,0,ccx,ccy,cellR);
        cG2.addColorStop(0,`rgba(255,200,80,${0.12*cellPulse})`);
        cG2.addColorStop(1,"transparent");
        ctx.fillStyle=cG2; ctx.fillRect(ccx-cellR,ccy-cellR,cellR*2,cellR*2);
      }

      /* ── CONNECTIONS ── */
      CONNS.forEach(conn=>{
        const na=NEURONS[conn.a], nb=NEURONS[conn.b];
        const alpha=0.04+conn.w*0.08;
        ctx.strokeStyle=`rgba(100,160,255,${alpha})`; ctx.lineWidth=0.6;
        ctx.beginPath(); ctx.moveTo(na.x,na.y); ctx.lineTo(nb.x,nb.y); ctx.stroke();
        /* Signal particle */
        if(conn.signal>0){
          conn.spos+=0.04;
          if(conn.spos>1){conn.signal=0;conn.spos=0;}else{
            const px=lerp(na.x,nb.x,conn.spos), py=lerp(na.y,nb.y,conn.spos);
            ctx.beginPath(); ctx.arc(px,py,2.5,0,TAU);
            ctx.fillStyle=`rgba(255,220,100,${conn.signal*0.9})`; ctx.fill();
          }
        }
      });

      /* ── NEURON UPDATE & DRAW ── */
      firingsThisFrame.length=0;
      NEURONS.forEach((n,ni)=>{
        /* Recharge */
        if(n.refrac>0){n.refrac--;n.charge=0;}else{
          n.charge+=0.003+0.004*(2-n.layer)+(rng()*0.008);
          /* Spontaneous for core layer */
          if(n.layer===0&&rng()<0.003) n.charge=n.thresh+0.1;
        }
        /* Fire check */
        if(n.charge>=n.thresh){
          firingsThisFrame.push({ni});
          n.charge=0; n.refrac=20+Math.floor(rng()*20);
          /* Propagate to connections */
          CONNS.filter(c=>c.a===ni||c.b===ni).forEach(c=>{
            const targetIdx=c.a===ni?c.b:c.a;
            if(!NEURONS[targetIdx].refrac){
              NEURONS[targetIdx].charge+=c.w*0.35;
            }
            c.signal=c.w; c.spos=0;
          });
          /* Fire ring */
          RINGS.push({x:n.x,y:n.y,r:0,life:1,col:n.layer===0?V.shock:n.layer===1?V.gold:V.amb});
          /* Axon prominence */
          PROMS.filter(p=>Math.hypot(p.x-n.x,p.y-n.y)<20).forEach(p=>{
            p.particles.push({p:0,col:n.layer===0?V.shock:V.gold});
          });
        }
        /* Draw neuron */
        const norm=clamp(n.charge/n.thresh,0,1);
        const nr=n.layer===0?5:n.layer===1?4:3;
        const nG=ctx.createRadialGradient(n.x,n.y,0,n.x,n.y,nr*2.5);
        const fr=n.refrac>0;
        const col=fr?"rgba(30,40,80,0.4)":
          n.layer===0?`rgba(255,220,100,${0.5+norm*0.5})`
          :n.layer===1?`rgba(255,150,50,${0.35+norm*0.5})`
          :`rgba(255,80,30,${0.25+norm*0.45})`;
        nG.addColorStop(0,col); nG.addColorStop(1,"transparent");
        ctx.fillStyle=nG; ctx.beginPath(); ctx.arc(n.x,n.y,nr*2.5,0,TAU); ctx.fill();
        if(!fr){
          ctx.beginPath(); ctx.arc(n.x,n.y,nr*(0.6+norm*0.4),0,TAU);
          ctx.fillStyle=col; ctx.fill();
        }
      });

      /* ── FIRING RINGS ── */
      for(let ri=RINGS.length-1;ri>=0;ri--){
        const ring=RINGS[ri];
        ring.r+=2.5; ring.life-=0.04;
        if(ring.life<=0){RINGS.splice(ri,1);continue;}
        ctx.strokeStyle=ring.col+Math.round(ring.life*160).toString(16).padStart(2,"0");
        ctx.lineWidth=1.2*ring.life;
        ctx.beginPath(); ctx.arc(ring.x,ring.y,ring.r,0,TAU); ctx.stroke();
      }

      /* ── AXON PROMINENCES ── */
      PROMS.forEach(p=>{
        /* Draw prominence line */
        const ex=p.x+Math.cos(p.ang)*p.len, ey=p.y+Math.sin(p.ang)*p.len;
        ctx.strokeStyle="rgba(255,200,80,0.12)"; ctx.lineWidth=0.8;
        ctx.beginPath(); ctx.moveTo(p.x,p.y); ctx.lineTo(ex,ey); ctx.stroke();
        /* Particles */
        for(let pi=p.particles.length-1;pi>=0;pi--){
          const pt=p.particles[pi];
          pt.p+=0.02;
          if(pt.p>1){p.particles.splice(pi,1);continue;}
          const px=lerp(p.x,ex,pt.p), py=lerp(p.y,ey,pt.p);
          ctx.beginPath(); ctx.arc(px,py,1.5,0,TAU);
          ctx.fillStyle=pt.col+"CC"; ctx.fill();
        }
      });

      /* ── RIGHT SIDE PANEL ── */
      const PX=CW*0.73, PY=40;
      const fires=firingsThisFrame.length;
      ctx.fillStyle=V.ink; ctx.font=`700 10px ${V.mono}`; ctx.textAlign="left";
      ctx.fillText("STELLAR NEURAL CORE",PX,PY);
      ctx.fillStyle=V.dim+"88"; ctx.font=`7px ${V.mono}`;
      ctx.fillText("BRAIN-AS-STAR · 80 NEURONS · 3 LAYERS",PX,PY+14);
      ctx.fillStyle=fires>0?V.shock+"BB":V.dim+"66"; ctx.font=`700 8px ${V.mono}`;
      ctx.fillText(`FIRING: ${fires} NEURONS`,PX,PY+34);
      ctx.fillStyle=V.dim+"88"; ctx.font=`7px ${V.mono}`;
      ctx.fillText(`CONNECTIONS: ${CONNS.length}`,PX,PY+48);
      ctx.fillText(`ACTIVE SIGNALS: ${CONNS.filter(c=>c.signal>0).length}`,PX,PY+61);
      ctx.fillText(`REFRACTORY: ${NEURONS.filter(n=>n.refrac>0).length}`,PX,PY+74);

      /* Layer legend */
      const layers=[
        {col:V.shock,  label:"CORE LAYER · γ 40Hz"},
        {col:V.gold,   label:"MANTLE · β 20Hz"},
        {col:V.amb,    label:"CORTEX · α 10Hz"},
      ];
      layers.forEach((l,li)=>{
        ctx.beginPath(); ctx.arc(PX+5,PY+102+li*18,4,0,TAU);
        ctx.fillStyle=l.col+"88"; ctx.fill();
        ctx.fillStyle=l.col+"AA"; ctx.font=`7px ${V.mono}`; ctx.textAlign="left";
        ctx.fillText(l.label,PX+14,PY+106+li*18);
      });

      /* Star equation */
      ctx.fillStyle=V.gold+"44";
      ctx.font=`700 8px ${V.mono}`; ctx.textAlign="left";
      const starLines=["THE BRAIN IS A STAR:","","20 WATTS","100B NEURONS","100T SYNAPSES","2% BODY MASS","20% ENERGY","~86B STARS","IN MILKY WAY","","BOTH:","· GENERATE LIGHT","· HAVE A CORE","· HAVE A SURFACE","· RESPOND TO","  ENVIRONMENT","· SELF-SUSTAINING"];
      ctx.fillStyle=V.dim+"55"; ctx.font=`6.5px ${V.mono}`;
      starLines.forEach((l,li)=>{
        ctx.fillStyle=li===0?V.gold+"88":V.dim+"66";
        ctx.fillText(l,PX,PY+162+li*12);
      });

      /* Title */
      ctx.fillStyle=V.ink; ctx.font=`700 10px ${V.mono}`; ctx.textAlign="left";
      ctx.fillText("STELLAR NEURAL CORE · BRAIN-AS-STAR · CONVECTION COLUMNS · AXON PROMINENCES",8,16);
      ctx.fillStyle=V.dim+"88"; ctx.font=`7px ${V.mono}`;
      ctx.fillText("HOT DENSE SELF-SUSTAINING INTELLIGENCE · FIRING COLUMNS · CORONAL SIGNALS",8,30);

      t+=0.016; raf=requestAnimationFrame(draw);
    };
    draw();
    return()=>cancelAnimationFrame(raf);
  },[]);
  return <canvas ref={ref} width={CW} height={450} style={{width:"100%",borderRadius:6,display:"block"}}/>;
}

/* ─────────────────────────────────────────────────────────────────────────
   CANVAS 2 · SYMBOL ENGINE + SELF-REFLECTION LOOP
   Sensory field → compression → symbol/word → Strange Loop → "I"
   ───────────────────────────────────────────────────────────────────────── */
function SymbolLoopCanvas(){
  const ref=useRef<HTMLCanvasElement>(null);
  useEffect(()=>{
    const cv=ref.current; if(!cv) return;
    const CH=400;
    cv.width=CW; cv.height=CH;
    const ctx=cv.getContext("2d")!;
    const rng=mkRng(9999);

    /* ── SENSORY FIELD (left panel) ── */
    const SF_W=220, SF_X=20, SF_Y=60;
    /* Random moving dots simulating raw sensory data */
    const DOTS:{x:number;y:number;vx:number;vy:number;col:string;size:number;target:number}[]=[];
    const COLS2=[V.cyan,V.blue,V.green,V.rose,V.amb,V.photon,V.vio];
    for(let i=0;i<70;i++){
      DOTS.push({
        x:SF_X+rng()*SF_W, y:SF_Y+rng()*(CH-SF_Y-60),
        vx:(rng()-0.5)*1.4, vy:(rng()-0.5)*1.4,
        col:COLS2[Math.floor(rng()*COLS2.length)],
        size:1.5+rng()*3, target:0,
      });
    }

    /* ── SYMBOL ATTRACTOR (centre panel) ── */
    const SYM_X=CW*0.40, SYM_Y=CH/2;
    const SYMBOLS=["TREE","FIRE","WATER","STAR","MIND","SELF","LIGHT","WAVE"];
    let symIdx=0, symTimer=0;

    /* Attractor basin: dots spiral toward SYM_X,SYM_Y when compressed */
    let compressionPhase=0; /* 0=free, 1=compressing, 2=compressed, 3=reflecting */

    /* ── SELF-REFLECTION LOOP (right panel) ── */
    /* Nodes in a loop: STIMULUS → PERCEPT → SYMBOL → "I PERCEIVE" → "I" → REFLECT → SYMBOL */
    const LOOP_CX=CW*0.74, LOOP_CY=CH/2, LOOP_R=100;
    const LOOP_NODES=[
      {label:"WORLD",    col:V.cyan,  a:PI*1.5},
      {label:"PERCEPT",  col:V.blue,  a:PI*1.8},
      {label:"SYMBOL",   col:V.gold,  a:PI*0.1},
      {label:"I THINK",  col:V.green, a:PI*0.4},
      {label:"\"I\"",    col:V.photon,a:PI*0.7},
      {label:"REFLECT",  col:V.vio,   a:PI*1.0},
      {label:"LANGUAGE", col:V.rose,  a:PI*1.3},
    ];
    LOOP_NODES.forEach(ln=>{
      ln.a-=PI/2; /* start from top */
    });
    /* Moving signal on loop */
    const LOOP_SIGS:{pos:number;col:string;speed:number}[]=[
      {pos:0,col:V.photon,speed:0.003},
      {pos:0.35,col:V.gold,speed:0.003},
      {pos:0.68,col:V.cyan,speed:0.003},
    ];

    let t=0, raf=0;

    const draw=()=>{
      ctx.clearRect(0,0,CW,CH);
      ctx.fillStyle=V.bg; ctx.fillRect(0,0,CW,CH);

      /* Panel dividers */
      ctx.strokeStyle=V.dim+"22"; ctx.lineWidth=0.6;
      ctx.beginPath(); ctx.moveTo(SF_X+SF_W+20,SF_Y); ctx.lineTo(SF_X+SF_W+20,CH-40); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(LOOP_CX-140,SF_Y); ctx.lineTo(LOOP_CX-140,CH-40); ctx.stroke();

      /* Panel labels */
      ctx.fillStyle=V.dim+"AA"; ctx.font=`700 7px ${V.mono}`; ctx.textAlign="center";
      ctx.fillText("01 · SENSORY FIELD",SF_X+SF_W/2,SF_Y-10);
      ctx.fillText("02 · COMPRESSION",CW*0.40,SF_Y-10);
      ctx.fillText("03 · STRANGE LOOP · SELF",LOOP_CX,SF_Y-10);

      /* ── DRAW SENSORY FIELD ── */
      /* Background noise texture */
      for(let nx=0;nx<8;nx++) for(let ny=0;ny<6;ny++){
        const npulse=Math.sin(t*2.1+nx*1.3+ny*0.9)*0.5+0.5;
        ctx.fillStyle=`rgba(20,40,80,${npulse*0.08})`;
        ctx.fillRect(SF_X+nx*SF_W/8,SF_Y+ny*(CH-SF_Y-60)/6,SF_W/8,(CH-SF_Y-60)/6);
      }
      /* Dots */
      symTimer++;
      if(symTimer>200){ symIdx=(symIdx+1)%SYMBOLS.length; symTimer=0; compressionPhase=1; }
      compressionPhase===1?compressionPhase=1:null;

      DOTS.forEach(d=>{
        if(compressionPhase===1){
          /* Pull toward symbol attractor */
          const dx=SYM_X-d.x, dy=SYM_Y-d.y;
          d.x+=dx*0.018; d.y+=dy*0.018;
          if(Math.hypot(dx,dy)<5) d.target=1;
        }else{
          /* Free drift in sensory field */
          d.x+=d.vx; d.y+=d.vy;
          if(d.x<SF_X||d.x>SF_X+SF_W) d.vx*=-1;
          if(d.y<SF_Y||d.y>CH-60) d.vy*=-1;
        }
        /* Check if dot is within sensory field panel */
        const inPanel=d.x>SF_X-5&&d.x<SF_X+SF_W+5&&d.y>SF_Y-5&&d.y<CH-55;
        if(!inPanel) return;
        ctx.beginPath(); ctx.arc(d.x,d.y,d.size,0,TAU);
        ctx.fillStyle=d.col+"88"; ctx.fill();
      });
      /* If all dots close → release back */
      if(compressionPhase===1&&DOTS.filter(d=>d.target>0).length>50){
        compressionPhase=0;
        DOTS.forEach(d=>{
          d.x=SF_X+rng()*SF_W; d.y=SF_Y+rng()*(CH-SF_Y-60);
          d.vx=(rng()-0.5)*1.4; d.vy=(rng()-0.5)*1.4; d.target=0;
        });
      }

      /* ── DRAW SYMBOL ATTRACTOR ── */
      /* Attractor basin visual: concentric rings spiraling in */
      for(let ar=5;ar>=1;ar--){
        const ar_r=ar*22;
        const ar_alpha=0.06+(6-ar)*0.02;
        ctx.strokeStyle=`rgba(200,160,48,${ar_alpha})`;
        ctx.lineWidth=0.8;
        ctx.beginPath(); ctx.arc(SYM_X,SYM_Y,ar_r,0,TAU); ctx.stroke();
      }
      /* Basin flow lines */
      for(let fl=0;fl<8;fl++){
        const fa=fl/8*TAU+t*0.15;
        const fx1=SYM_X+Math.cos(fa)*100, fy1=SYM_Y+Math.sin(fa)*80;
        const fx2=SYM_X+Math.cos(fa)*12, fy2=SYM_Y+Math.sin(fa)*12;
        ctx.strokeStyle=`rgba(200,160,48,0.15)`; ctx.lineWidth=0.6;
        ctx.beginPath(); ctx.moveTo(fx1,fy1); ctx.lineTo(fx2,fy2); ctx.stroke();
        /* Arrow head at inner end */
        const ha=fa+PI*0.85;
        ctx.strokeStyle=`rgba(200,160,48,0.2)`;
        ctx.beginPath(); ctx.moveTo(fx2,fy2);
        ctx.lineTo(fx2+Math.cos(ha)*6,fy2+Math.sin(ha)*6); ctx.stroke();
      }
      /* Symbol text */
      const symPulse=0.8+0.2*Math.sin(t*1.8);
      ctx.fillStyle=`rgba(200,160,48,${symPulse*0.9})`;
      ctx.font=`700 16px ${V.mono}`; ctx.textAlign="center";
      ctx.fillText(SYMBOLS[symIdx],SYM_X,SYM_Y+6);
      /* "ATTRACTOR" label */
      ctx.fillStyle=V.gold+"44"; ctx.font=`6.5px ${V.mono}`; ctx.textAlign="center";
      ctx.fillText("ATTRACTOR BASIN",SYM_X,SYM_Y+28);
      ctx.fillText("LANGUAGE SYMBOL",SYM_X,SYM_Y+39);
      /* Arrow from sensory field to attractor */
      ctx.strokeStyle=V.gold+"44"; ctx.lineWidth=1;
      ctx.beginPath(); ctx.moveTo(SF_X+SF_W+22,CH/2); ctx.lineTo(SYM_X-30,SYM_Y); ctx.stroke();
      ctx.fillStyle=V.gold+"66"; ctx.font=`6px ${V.mono}`; ctx.textAlign="center";
      ctx.fillText("COMPRESSION",SF_X+SF_W+60,CH/2-10);
      ctx.fillText("N→1",SF_X+SF_W+60,CH/2+2);

      /* Arrow from attractor to loop */
      ctx.strokeStyle=V.photon+"44"; ctx.lineWidth=1;
      const lnx=LOOP_CX-140;
      ctx.beginPath(); ctx.moveTo(SYM_X+38,SYM_Y); ctx.lineTo(lnx-4,LOOP_CY); ctx.stroke();
      ctx.fillStyle=V.photon+"66"; ctx.font=`6px ${V.mono}`; ctx.textAlign="center";
      ctx.fillText("SELF-MODEL",SYM_X+75,LOOP_CY-8);

      /* ── DRAW STRANGE LOOP ── */
      /* Loop path (circle) */
      ctx.strokeStyle=V.dim+"33"; ctx.lineWidth=1.5;
      ctx.beginPath(); ctx.arc(LOOP_CX,LOOP_CY,LOOP_R,0,TAU); ctx.stroke();
      /* Node-to-node arrows */
      LOOP_NODES.forEach((ln,li)=>{
        const next=LOOP_NODES[(li+1)%LOOP_NODES.length];
        const ax=LOOP_CX+Math.cos(ln.a)*LOOP_R, ay=LOOP_CY+Math.sin(ln.a)*LOOP_R;
        const bx=LOOP_CX+Math.cos(next.a)*LOOP_R, by=LOOP_CY+Math.sin(next.a)*LOOP_R;
        ctx.strokeStyle=ln.col+"44"; ctx.lineWidth=1;
        ctx.beginPath(); ctx.moveTo(ax,ay); ctx.lineTo(bx,by); ctx.stroke();
      });
      /* Node circles + labels */
      LOOP_NODES.forEach(ln=>{
        const nx=LOOP_CX+Math.cos(ln.a)*LOOP_R, ny=LOOP_CY+Math.sin(ln.a)*LOOP_R;
        ctx.beginPath(); ctx.arc(nx,ny,10,0,TAU);
        ctx.fillStyle=ln.col+"22"; ctx.fill();
        ctx.strokeStyle=ln.col+"88"; ctx.lineWidth=1; ctx.stroke();
        ctx.fillStyle=ln.col+"CC"; ctx.font=`700 6px ${V.mono}`; ctx.textAlign="center";
        ctx.fillText(ln.label,nx,ny+2.5);
        /* Outer label */
        const lx=LOOP_CX+Math.cos(ln.a)*(LOOP_R+22), ly=LOOP_CY+Math.sin(ln.a)*(LOOP_R+22);
        ctx.fillStyle=ln.col+"66"; ctx.font=`5.5px ${V.mono}`; ctx.textAlign="center";
        const desc=["RAW SENSE","PARSED","CRYSTALLISED","RECURSIVE","SELF MODEL","INTROSPECT","ENCODES"][LOOP_NODES.indexOf(ln)];
        ctx.fillText(desc,lx,ly+1.5);
      });
      /* Moving signals on loop */
      LOOP_SIGS.forEach(sig=>{
        sig.pos=(sig.pos+sig.speed)%1;
        const a2=lerp(0,TAU,sig.pos)-PI/2;
        const sx=LOOP_CX+Math.cos(a2)*LOOP_R, sy=LOOP_CY+Math.sin(a2)*LOOP_R;
        const sG=ctx.createRadialGradient(sx,sy,0,sx,sy,8);
        sG.addColorStop(0,sig.col+"CC"); sG.addColorStop(1,"transparent");
        ctx.fillStyle=sG; ctx.fillRect(sx-8,sy-8,16,16);
        ctx.beginPath(); ctx.arc(sx,sy,3,0,TAU);
        ctx.fillStyle=sig.col+"EE"; ctx.fill();
      });
      /* Centre: "STRANGE LOOP" label */
      ctx.fillStyle=V.photon+"66"; ctx.font=`700 7px ${V.mono}`; ctx.textAlign="center";
      ctx.fillText("STRANGE",LOOP_CX,LOOP_CY-5);
      ctx.fillText("LOOP",LOOP_CX,LOOP_CY+7);

      ctx.fillStyle=V.ink; ctx.font=`700 10px ${V.mono}`; ctx.textAlign="left";
      ctx.fillText("SYMBOL ENGINE · LANGUAGE COMPRESSION · SELF-REFLECTION · STRANGE LOOP",8,16);
      ctx.fillStyle=V.dim+"88"; ctx.font=`7px ${V.mono}`;
      ctx.fillText("SENSORY FIELD → ATTRACTOR BASIN → SYMBOL → SELF MODEL → I → REFLECT → LANGUAGE",8,30);

      t+=0.016; raf=requestAnimationFrame(draw);
    };
    draw();
    return()=>cancelAnimationFrame(raf);
  },[]);
  return <canvas ref={ref} width={CW} height={400} style={{width:"100%",borderRadius:6,display:"block"}}/>;
}

/* ─────────────────────────────────────────────────────────────────────────
   CANVAS 3 · PLUTOMATE · DEEP BRAIN SYSTEMS
   Brainstem · Limbic · Basal Ganglia · Thalamus · Cortex
   Automatic unconscious processing running below conscious access
   ───────────────────────────────────────────────────────────────────────── */
function PlutomateCanvas(){
  const ref=useRef<HTMLCanvasElement>(null);
  useEffect(()=>{
    const cv=ref.current; if(!cv) return;
    const CH=480;
    cv.width=CW; cv.height=CH;
    const ctx=cv.getContext("2d")!;

    /* ── BRAIN STRUCTURE (sagittal cross-section, stylized) ── */
    const BCX=CW*0.40, BCY=CH*0.54;

    /* Brain regions: {name, cx, cy, rx, ry, col, freq, label, desc} */
    const REGIONS=[
      {name:"BRAINSTEM",   cx:BCX+0,   cy:BCY+148, rx:35, ry:28, col:V.plasma,
        freq:0.27, label:"BRAINSTEM",   desc:"AUTONOMIC · 0.27Hz"},
      {name:"CEREBELLUM",  cx:BCX+90,  cy:BCY+110, rx:55, ry:40, col:V.blue,
        freq:10.0, label:"CEREBELLUM",  desc:"MOTOR TIMING · 10Hz"},
      {name:"HIPPOCAMPUS", cx:BCX-30,  cy:BCY+50,  rx:48, ry:28, col:V.cyan,
        freq:6.0,  label:"HIPPOCAMPUS", desc:"MEMORY · θ 6Hz"},
      {name:"AMYGDALA",    cx:BCX-60,  cy:BCY+30,  rx:30, ry:22, col:V.fire,
        freq:3.5,  label:"AMYGDALA",    desc:"THREAT · 3.5Hz"},
      {name:"BASAL GANGLIA",cx:BCX+10, cy:BCY+10,  rx:55, ry:38, col:V.gold,
        freq:20.0, label:"BASAL GANG.", desc:"HABIT · β 20Hz"},
      {name:"THALAMUS",    cx:BCX+5,   cy:BCY-25,  rx:38, ry:28, col:V.photon,
        freq:10.0, label:"THALAMUS",    desc:"RELAY · α 10Hz"},
      {name:"CORTEX",      cx:BCX,     cy:BCY-95,  rx:135,ry:65, col:V.vio,
        freq:40.0, label:"CORTEX",      desc:"CONSCIOUS · γ 40Hz"},
    ];

    /* Ascending signals between regions */
    const ASCEND:[number,number][]=[
      [0,2],[0,4],[1,4],[2,5],[3,5],[4,5],[5,6],
    ];
    const ASCEND_PARTS:{a:number;b:number;prog:number;col:string}[]=[];

    let t=0, raf=0;

    const draw=()=>{
      ctx.clearRect(0,0,CW,CH);
      ctx.fillStyle=V.bg; ctx.fillRect(0,0,CW,CH);

      /* ── PLUTO SYMBOL BACKGROUND ── */
      ctx.save();
      ctx.globalAlpha=0.04;
      ctx.fillStyle=V.vio;
      ctx.font=`200px serif`; ctx.textAlign="center";
      ctx.fillText("♇",BCX+50,BCY+80);
      ctx.globalAlpha=1; ctx.restore();

      /* ── CORTEX OUTER GLOW (dim — it is the least active in Plutomation) ── */
      const cortex=REGIONS[6];
      const cG=ctx.createRadialGradient(cortex.cx,cortex.cy,0,cortex.cx,cortex.cy,cortex.rx*1.8);
      const cPulse=0.3+0.1*Math.sin(t*cortex.freq*0.08);
      cG.addColorStop(0,`rgba(150,100,255,${cPulse*0.06})`);
      cG.addColorStop(1,"transparent");
      ctx.fillStyle=cG; ctx.fillRect(BCX-320,BCY-200,640,280);

      /* ── ASCENDING SIGNAL PATHS ── */
      ASCEND.forEach(([ai,bi])=>{
        const ra=REGIONS[ai], rb=REGIONS[bi];
        ctx.strokeStyle=`rgba(100,130,200,0.1)`; ctx.lineWidth=0.8;
        ctx.beginPath(); ctx.moveTo(ra.cx,ra.cy); ctx.lineTo(rb.cx,rb.cy); ctx.stroke();
      });

      /* ── ASCENDING SIGNAL PARTICLES ── */
      if(t%0.08<0.016){
        const pair=ASCEND[Math.floor(Math.random()*ASCEND.length)];
        const ra=REGIONS[pair[0]];
        ASCEND_PARTS.push({a:pair[0],b:pair[1],prog:0,col:ra.col});
      }
      for(let pi=ASCEND_PARTS.length-1;pi>=0;pi--){
        const p=ASCEND_PARTS[pi];
        p.prog+=0.012;
        if(p.prog>1){ASCEND_PARTS.splice(pi,1);continue;}
        const ra=REGIONS[p.a], rb=REGIONS[p.b];
        const px=lerp(ra.cx,rb.cx,p.prog), py=lerp(ra.cy,rb.cy,p.prog);
        ctx.beginPath(); ctx.arc(px,py,2,0,TAU);
        ctx.fillStyle=p.col+"AA"; ctx.fill();
      }

      /* ── DRAW REGIONS ── */
      REGIONS.forEach((reg,ri)=>{
        const pulse=0.5+0.5*Math.sin(t*reg.freq*TAU*0.008);
        /* Glow */
        const rG=ctx.createRadialGradient(reg.cx,reg.cy,0,reg.cx,reg.cy,reg.rx*1.6);
        const rr2=parseInt(reg.col.slice(1,3),16), rg=parseInt(reg.col.slice(3,5),16), rb=parseInt(reg.col.slice(5,7),16);
        rG.addColorStop(0,`rgba(${rr2},${rg},${rb},${pulse*0.25})`);
        rG.addColorStop(0.5,`rgba(${rr2},${rg},${rb},${pulse*0.08})`);
        rG.addColorStop(1,"transparent");
        ctx.fillStyle=rG; ctx.beginPath(); ctx.ellipse(reg.cx,reg.cy,reg.rx*1.6,reg.ry*1.6,0,0,TAU); ctx.fill();
        /* Main body */
        ctx.beginPath(); ctx.ellipse(reg.cx,reg.cy,reg.rx,reg.ry,0,0,TAU);
        ctx.fillStyle=`rgba(${rr2},${rg},${rb},${0.10+pulse*0.12})`; ctx.fill();
        ctx.strokeStyle=`rgba(${rr2},${rg},${rb},${0.35+pulse*0.35})`; ctx.lineWidth=1.2; ctx.stroke();
        /* Label */
        ctx.fillStyle=reg.col+"DD"; ctx.font=`700 7px ${V.mono}`; ctx.textAlign="center";
        ctx.fillText(reg.label,reg.cx,reg.cy-2);
        ctx.fillStyle=reg.col+"77"; ctx.font=`5.5px ${V.mono}`;
        ctx.fillText(reg.desc,reg.cx,reg.cy+9);
        /* Oscillation indicator (small vertical wave) */
        const wX=reg.cx+reg.rx+8, wY=reg.cy;
        const wpts=8;
        ctx.strokeStyle=reg.col+"55"; ctx.lineWidth=0.7;
        ctx.beginPath();
        for(let wi=0;wi<wpts;wi++){
          const wx=wX+wi*4;
          const wy=wY+Math.sin(t*reg.freq*0.12+wi*0.8)*6;
          wi===0?ctx.moveTo(wx,wy):ctx.lineTo(wx,wy);
        }
        ctx.stroke();
        void ri;
      });

      /* ── RIGHT PANEL: PLUTOMATION ── */
      const PX=CW*0.72, PY=44;
      ctx.fillStyle=V.vio+"CC"; ctx.font=`700 10px ${V.mono}`; ctx.textAlign="left";
      ctx.fillText("PLUTOMATION",PX,PY);
      ctx.fillStyle=V.dim+"88"; ctx.font=`7px ${V.mono}`;
      ctx.fillText("AUTOMATIC DEEP PROCESSING",PX,PY+14);
      ctx.fillText("BELOW CONSCIOUS ACCESS",PX,PY+26);

      ctx.strokeStyle=V.vio+"33"; ctx.lineWidth=0.5;
      ctx.beginPath(); ctx.moveTo(PX,PY+34); ctx.lineTo(PX+190,PY+34); ctx.stroke();

      const plutoLines=[
        "♇ PLUTO: DEEP · TRANSFORMATIVE",
        "   OPERATING IN DARKNESS",
        "   FAR FROM THE SOLAR CORTEX",
        "",
        "WHAT RUNS PLUTOMATICALLY:",
        "· BREATHING (brainstem)",
        "· HEARTBEAT (brainstem)",
        "· BALANCE (cerebellum)",
        "· THREAT SCAN (amygdala)",
        "· MEMORY WRITE (hippocampus)",
        "· HABIT EXECUTION (basal gang.)",
        "· SENSORY GATING (thalamus)",
        "",
        "WHAT RUNS CONSCIOUSLY:",
        "· VOLUNTARY ATTENTION",
        "· NOVEL PROBLEM SOLVING",
        "· LANGUAGE GENERATION",
        "· DELIBERATE CHOICE",
        "",
        "RATIO: ~95% PLUTOMATIC",
        "       ~5% CONSCIOUS",
        "",
        "SYSTEM 1 vs SYSTEM 2",
        "(Kahneman)",
        "",
        "THE CORTEX DOES NOT DRIVE",
        "THE BRAIN.",
        "IT READS THE OUTPUTS OF",
        "SYSTEMS THAT ALREADY DECIDED.",
      ];
      plutoLines.forEach((l,li)=>{
        if(l.startsWith("♇")||l.startsWith("WHAT")||l.startsWith("RATIO")||l.startsWith("SYSTEM 1")||l.startsWith("THE CORTEX")||l.startsWith("IT READS")){
          ctx.fillStyle=li<4?V.vio+"AA":li<16?V.photon+"88":li<21?V.gold+"88":V.fire+"88";
          ctx.font=`700 6.5px ${V.mono}`;
        }else{
          ctx.fillStyle=V.dim+"77"; ctx.font=`6.5px ${V.mono}`;
        }
        ctx.textAlign="left";
        ctx.fillText(l,PX,PY+46+li*11.5);
      });

      /* Title */
      ctx.fillStyle=V.ink; ctx.font=`700 10px ${V.mono}`; ctx.textAlign="left";
      ctx.fillText("PLUTOMATE · DEEP BRAIN SYSTEMS · AUTOMATIC UNCONSCIOUS PROCESSING",8,16);
      ctx.fillStyle=V.dim+"88"; ctx.font=`7px ${V.mono}`;
      ctx.fillText("BRAINSTEM · CEREBELLUM · HIPPOCAMPUS · AMYGDALA · BASAL GANGLIA · THALAMUS · CORTEX",8,30);
      ctx.fillStyle=V.vio+"44"; ctx.textAlign="right"; ctx.font=`20px serif`;
      ctx.fillText("♇",CW-16,32);

      t+=0.016; raf=requestAnimationFrame(draw);
    };
    draw();
    return()=>cancelAnimationFrame(raf);
  },[]);
  return <canvas ref={ref} width={CW} height={480} style={{width:"100%",borderRadius:6,display:"block"}}/>;
}

/* ─────────────────────────────────────────────────────────────────────────
   PAGE
   ───────────────────────────────────────────────────────────────────────── */
export default function StellarBrainPage(){
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
        {n} {"\u2500".repeat(18)}
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
        <div key={c.h} style={{background:`${c.col}0A`,border:`1px solid ${c.col}28`,
          borderRadius:6,padding:"10px 12px"}}>
          <div style={{fontFamily:V.mono,fontSize:"0.58rem",color:c.col,
            letterSpacing:1.5,marginBottom:5}}>{c.h}</div>
          <div style={{fontFamily:V.serif,fontSize:"0.82rem",color:V.ink,lineHeight:1.5}}>{c.d}</div>
        </div>
      ))}
    </div>
  );

  return (
    <div style={S}>
      <div style={{marginBottom:42}}>
        {[badge("STELLAR BRAIN",V.shock),badge("STAR INTELLIGENCE",V.gold),
          badge("NEURAL CORE",V.fire),badge("SYMBOL ENGINE",V.gold),
          badge("SELF-REFLECTION",V.photon),badge("STRANGE LOOP",V.green),
          badge("PLUTOMATE ♇",V.vio),badge("DEEP SYSTEMS",V.vio),
          badge("BRAINSTEM",V.plasma),badge("AMYGDALA",V.fire),
          badge("HIPPOCAMPUS",V.cyan),badge("BASAL GANGLIA",V.gold),
          badge("CONSCIOUS 5%",V.dim),badge("AUTOMATIC 95%",V.vio)]}
        <h1 style={{fontFamily:V.disp,fontSize:"clamp(1.4rem,4vw,2.8rem)",color:V.shock,
          margin:"22px 0 4px",letterSpacing:"0.08em",fontWeight:400,lineHeight:1.1}}>
          STELLAR BRAIN
        </h1>
        <p style={{fontFamily:V.mono,fontSize:"0.58rem",color:V.dim,letterSpacing:4,
          margin:"0 0 6px"}}>
          CONCENTRATED INTELLIGENCE · BRAIN AS STAR · PLUTOMATE ♇
        </p>
        <p style={{fontFamily:V.mono,fontSize:"0.52rem",color:V.dim+"88",letterSpacing:3,
          margin:"0 0 22px"}}>
          SYMBOL · LANGUAGE · SELF-REFLECTION · DEEP SYSTEMS · AUTOMATIC PROCESSING
        </p>
        {P("The brain is a star. Not as metaphor — as structure. Both are dense, self-sustaining energy-generating systems with a hot core and a responsive outer surface. Both generate their own light. Both sense their environment and respond. Both have an inner life invisible from outside. The sun knows you are there — your planet's magnetic field perturbs its own. The brain knows you are here — every sensation creates a perturbation that propagates inward, generates a response, and propagates back outward as behaviour.")}
        {P("The sun generates 3.8 × 10²⁶ watts. The brain generates 20 watts. The sun has ~10⁵⁷ particles. The brain has 10¹¹ neurons and 10¹⁴ synapses. The sun has a photosphere, a chromosphere, a corona. The brain has a brainstem, a limbic system, a cortex. The sun has helioseismology — pressure waves that propagate through its interior and reveal its structure. The brain has EEG oscillations — electrical waves at delta, theta, alpha, beta, gamma frequencies — that propagate through its structure and reveal its state.")}
        {P("The sun senses its environment: the Alfvén waves of the solar wind carry information about the interplanetary magnetic field back to the corona. The brain senses its environment: 11 million bits per second arrive through the senses; 50 bits per second reach consciousness. The rest is processed elsewhere — in the deep, automatic, plutomative systems.")}
      </div>

      {sec("01","Stellar Neural Core · Brain-as-Star · 100 Billion Neurons Firing",V.shock,<>
        {P("The cortex is organized in columns — vertical cylinders of ~80-100 neurons that fire together. They are the brain's convection cells: zones of organized co-activation separated by inhibitory boundaries, exactly as the sun's photospheric granules are zones of rising plasma separated by cool sinking plasma at the edges. In the cortex, the lateral inhibition (mediated by inhibitory interneurons) creates the boundary; in the photosphere, cooling creates the boundary. The spatial scale differs by a factor of 10⁵ (cortical column: 0.3mm; solar granule: 1,000km). The organizing principle is identical.")}
        {P("The brain fires at ~40 times per second in its most active regions (gamma band: 30-80 Hz). Each neuron fires at 0.1-100 Hz on average. With 100 billion neurons, the total firing rate is 10¹⁰ events per second — a constant electromagnetic storm, self-sustaining, generating its own internal order from the inside out.")}
        <div style={{border:`1px solid ${V.shock}22`,borderRadius:8,padding:2,marginBottom:14}}>
          <StellarNeuralCanvas/>
        </div>
        {cards([
          {h:"BRAIN ENERGY",col:V.shock,d:"The brain consumes 20W continuously — as much as a dim light bulb. 2% of body mass, 20% of energy budget. The energy is almost entirely used to maintain ion gradients across neuronal membranes: the Na+/K+ ATPase pump (covered in MAGIC C8) runs constantly, pumping Na+ out and K+ in after each action potential. This is why the brain has such high metabolic demand per gram — it is continuously resetting its electrochemical state. The sun maintains its temperature by gravitational compression at the core → nuclear fusion → outward radiation pressure. The brain maintains its activity by metabolic compression (glucose + O2 → ATP) → electrochemical firing → outward signalling."},
          {h:"HELIOSEISMOLOGY",col:V.gold,d:"Helioseismology: the study of pressure waves that propagate through the sun's interior. The waves (p-modes, g-modes, f-modes) are excited by convection at the surface, propagate inward, refract off the changing density gradient, and return to the surface where they create detectable oscillations. By measuring the frequency spectrum of these oscillations, astronomers can image the sun's interior — exactly as seismologists image the Earth. EEG does the same for the brain: electrodes on the skull measure oscillations that propagate through the neural tissue, revealing the brain's interior state. The analogy is exact: both use wave propagation to measure internal structure."},
          {h:"CORTICAL COLUMNS",col:V.vio,d:"The cortical column is the brain's fundamental computational unit. First described by Vernon Mountcastle (1957): neurons in a vertical column through the cortex share similar response properties (they all respond to the same orientation of edge, or the same finger, or the same frequency of sound). Columns are ~300μm wide, ~2mm tall, contain 80-100 neurons. They are separated by inhibitory interneurons that create lateral inhibition — the same spatial organization as solar convection cells. The human cortex has ~1.5 million columns. Each column is a specialist detector of one feature of the world."},
          {h:"ACTION POTENTIAL",col:V.fire,d:"The action potential: the neuron's fundamental output signal. Duration: ~1ms. Peak amplitude: +40mV (from resting -70mV). Propagation speed: 0.5-120 m/s (unmyelinated to heavily myelinated axons). Mechanism: (1) Depolarisation reaches threshold (-55mV) → Nav channels open → Na+ floods in → membrane reaches +40mV. (2) Nav channels inactivate → Kv channels open → K+ flows out → repolarisation. (3) Brief hyperpolarisation (refractory period: 1-5ms). The signal is all-or-none (binary): either the threshold is crossed or it is not. Information is encoded in the timing and rate of these binary events — just as digital computers encode information in 1s and 0s."},
          {h:"SOLAR PROMINENCE",col:V.amb,d:"Solar prominences: large, bright loops of plasma that extend from the photosphere into the corona, following magnetic field lines. They can extend 300,000km into space and last weeks to months. When they destabilize: coronal mass ejection — billions of tonnes of plasma launched into the solar system at up to 3,000 km/s. The brain analog: axon projections extending from the cortical surface (motor axons descending the spinal cord, up to 1m long in humans) are the prominences. Strong memory consolidation or motor commands are the mass ejections — rapid, large-amplitude signals that propagate far from the site of origin. The hippocampus to cortex memory transfer during sleep is the brain's coronal mass ejection."},
          {h:"STAR INTELLIGENCE",col:V.photon,d:"The sun senses and responds: (1) Planetary orbits perturb the sun's center of mass (the barycenter shifts — measurable). (2) Solar wind speed responds to sunspot activity (solar maximum → stronger wind). (3) Coronal heating is coupled to magnetic field complexity — the corona 'knows' about the surface magnetic topology. (4) Alfvén waves carry information from the outer heliosphere back to the corona. The sun is not a simple heat engine — it is a dynamic, responsive system with feedback loops operating across 10 million km. The brain is the same: its state responds to the body's state (via interoception), to the environment (via sensation), and to its own previous state (via memory). Both systems: concentrate energy, generate information, and respond."},
        ])}
      </>)}

      {sec("02","Symbol Engine · Language · Self-Reflection · Strange Loop",V.gold,<>
        {P("Language is a compression algorithm. The word TREE compresses: a specific visual pattern (branching structure, green above, brown below), a specific tactile experience (rough bark, smooth leaves), a specific auditory experience (rustling), a specific ecological function (shade, oxygen, shelter), and 10,000 years of cultural association (Yggdrasil, the Tree of Life, the family tree, the decision tree). All of this compresses into four letters, five phonemes, one concept. The compression ratio is approximately infinite — the denotation contains bounded information but the connotation is unbounded.")}
        {P("Self-reflection is the Strange Loop. Hofstadter's term for the moment when a system's description reaches up a level and includes itself. The brain describing the brain. The 'I' that is thinking about the 'I' that is thinking. This is not a paradox but a feature: the self-model is the brain's most important model. Without a model of itself, the brain cannot predict its own actions, cannot feel embarrassment or pride, cannot plan five years ahead, cannot die knowing it will die.")}
        {P("The self-model is built from the inside out: the brainstem models the body's physiological state (am I hot, cold, full, empty, in pain?). The limbic system adds emotional valence (is this good or bad?). The cortex adds narrative (what is the story of why I am this way?). The prefrontal cortex runs the metacognition (what am I thinking about?). Each level is a model of the level below, plus additional information.")}
        <div style={{border:`1px solid ${V.gold}22`,borderRadius:8,padding:2,marginBottom:14}}>
          <SymbolLoopCanvas/>
        </div>
        {cards([
          {h:"LANGUAGE ATTRACTOR",col:V.gold,d:"In dynamical systems terms: a concept or word is an attractor in the brain's state space. The high-dimensional state space of neural activity has attractor basins — regions where the system flows toward a stable state regardless of where it starts within the basin. The attractor for 'TREE' includes all neural states that are equivalent to the concept of tree: seeing a tree, imagining a tree, reading the word tree, smelling pine resin, hearing the word spoken in any accent. All of these flow toward the same attractor. Language works because attractors are shared — your 'TREE' attractor and my 'TREE' attractor were trained on similar inputs and overlap significantly."},
          {h:"HOFSTADTER STRANGE LOOP",col:V.photon,d:"Hofstadter (Gödel Escher Bach, 1979): a Strange Loop occurs when following a hierarchical system upward through its levels brings you back to where you started. Gödel's incompleteness theorem is a Strange Loop: a formal system contains a statement that says 'this statement is unprovable in this system' — which, if the system is consistent, must be true, but unprovable. Consciousness is a Strange Loop: the brain produces a model of the brain producing a model of the brain. The 'I' is the fixed point of this recursion — the symbol that refers to the system that produces the symbol. Hofstadter: the soul is a pattern that perceives itself."},
          {h:"SYMBOL GROUNDING",col:V.cyan,d:"The symbol grounding problem (Harnad, 1990): how do symbols in a formal system acquire meaning? In pure symbolic AI: symbols manipulate other symbols with no connection to the world. In the brain: symbols are grounded because they are attractor states created by direct sensorimotor interaction with the world. The word 'RED' is meaningful because it is the attractor state associated with the neural activity pattern generated by 700nm photons hitting your retina. The symbol is grounded in sensation. This is why language emerges in embodied organisms and has proven difficult to extract from embodiment: the meaning lives in the body, not in the symbol."},
          {h:"SELF-REFERENTIAL LANGUAGE",col:V.green,d:"Self-referential language — language about language — is uniquely human. 'This sentence is false.' 'The set of all sets that do not contain themselves.' 'I am thinking about thinking.' These constructions require a cognitive system that can model itself as an object, not just as a subject. The capacity emerged with the prefrontal cortex expansion in Homo sapiens: the dorsomedial prefrontal cortex is specifically active during self-referential cognition. Patients with damage to this region lose the ability to think about themselves in the third person — they cannot model themselves as others see them."},
          {h:"COMPRESSION & ART",col:V.rose,d:"Art is the Strange Loop of compression. A great poem compresses an entire emotional-conceptual landscape into 14 lines. A great painting compresses a scene, a mood, an era, a philosophy into 1m². Music compresses an emotional arc into 3 minutes. The brain that created the art and the brain that receives it converge on the same attractor states — the same neural patterns are activated by the same symbols. This is why art travels across cultures and centuries: attractors are universal when they are grounded in universal human experience (love, death, fear, wonder). The brain-as-star generates culture as the sun generates light: as a byproduct of its internal compression."},
          {h:"LANGUAGE ORIGIN",col:V.amb,d:"Language origin: Homo sapiens, ~70,000-100,000 years ago (genetic evidence: the FOXP2 gene, expressed in Broca's area — speech production — shows a human-specific mutation ~500,000 years ago; full language probably ~100,000 years ago). The key innovation: recursion — the ability to embed phrases within phrases ('The man [who saw the woman [who had the book]] left'). This allows infinite sentences from finite vocabulary. Chomsky: recursion is the core of human language and the root of the Strange Loop. Once a system can embed itself in itself, self-reference becomes possible. Consciousness may have followed from language, not preceded it."},
        ])}
      </>)}

      {sec("03","Plutomate ♇ · Deep Brain · Automatic Unconscious Processing · 95%",V.vio,<>
        {P("Plutomate. A new word for an old reality: the automatic processing that runs beneath conscious access, named for Pluto — deep, slow, transformative, operating in darkness far from the solar cortex. The cortex is the sun of the brain: bright, hot, the seat of language and voluntary attention and the Strange Loop. But the cortex is thin (2-4mm), relatively recent (mammalian), and accounts for perhaps 5% of what the brain actually does every second.")}
        {P("The brainstem never stops. It has been running since before you were born — managing breathing, heart rate, blood pressure, swallowing, the sleep-wake cycle. It runs at 0.27 Hz (one breath per ~3.7 seconds) and never needs a decision. The amygdala runs a continuous threat-scan: every stimulus is checked against threat templates before it reaches consciousness. The hippocampus writes memory continuously, transferring experience to long-term storage during sleep without any conscious participation. The basal ganglia execute habitual behaviours — walking, driving familiar routes, playing a practiced instrument — so smoothly that the cortex is free to think about something else.")}
        {P("Pluto in astrology rules transformation, power, the underworld, what is hidden. The plutomative brain systems are underworld systems: they do the foundational work that makes life possible, they process threats and rewards with ancient precision, and they operate without needing to tell you about it. You breathe without deciding to. You recognize a face before you know you have seen it. You feel fear before you understand what frightened you. This is not a failure of consciousness — it is its most important feature.")}
        <div style={{border:`1px solid ${V.vio}22`,borderRadius:8,padding:2,marginBottom:14}}>
          <PlutomateCanvas/>
        </div>
        {cards([
          {h:"BRAINSTEM · AUTONOMIC",col:V.plasma,d:"The brainstem (medulla, pons, midbrain) is the oldest part of the vertebrate brain — present in fish, reptiles, birds, and mammals. It controls: respiratory rhythm (pre-Bötzinger complex: pacemaker neurons that generate the breathing rhythm without input from above), heart rate (vagus nerve: parasympathetic slowing), blood pressure (vasomotor centre), vomiting reflex, swallowing, pupil dilation, the sleep-wake cycle. It is operating right now — you did not decide to breathe, you are not sustaining your heart rate by decision, you cannot stop these functions by choice. This is Plutomatic processing: it runs without your knowledge, below your access, and it is keeping you alive."},
          {h:"AMYGDALA · THREAT SCAN",col:V.fire,d:"The amygdala (almond-shaped, bilateral, in the medial temporal lobe) processes emotionally significant stimuli — particularly threats — faster than consciousness. The low-road: sensory thalamus → amygdala (direct, 12ms). The high-road: sensory thalamus → cortex → amygdala (indirect, 100ms). The amygdala receives the threat signal 88ms before the cortex processes it. This is why you flinch from a moving shadow before you know what it is. The amygdala activates the HPA axis (cortisol) and the sympathetic nervous system (adrenaline) before consciousness has time to evaluate the threat. Fear is a Plutomatic output — it does not wait for permission."},
          {h:"HIPPOCAMPUS · MEMORY",col:V.cyan,d:"The hippocampus writes episodic memory: the specific events of your life (what happened, when, where). It does not write during encoding — it writes during sleep. Each night, during slow-wave sleep, the hippocampus replays the day's experiences at accelerated speed (Sharp-Wave Ripples: 80-100ms bursts of 200Hz oscillation). The cortex 'listens' to these replays and gradually incorporates them into long-term cortical memory. This process — hippocampal-to-cortical memory consolidation — takes years. You are not conscious of it. You cannot force it. You cannot watch it happen. It is Plutomatic: transformative, operating in darkness (literally — during sleep), irreversible."},
          {h:"BASAL GANGLIA · HABIT",col:V.gold,d:"The basal ganglia implement habit: behavioural sequences that have been so thoroughly practiced that they no longer require conscious attention. Driving a familiar route, typing on a keyboard, playing scales on a piano. Once a habit is formed, the cortex is largely excluded from its execution: the sequence runs from basal ganglia → thalamus → motor cortex → body, bypassing the prefrontal (deliberate) cortex. This is why habits are so hard to change — they are not in the cortex where you can inspect and edit them. They are in subcortical loops that run independently of your intentions. The basal ganglia is the robot brain that the conscious cortex delegates routine tasks to."},
          {h:"DEFAULT MODE NETWORK",col:V.vio,d:"The default mode network (DMN): a set of cortical regions (medial prefrontal cortex, posterior cingulate, lateral temporal cortex, inferior parietal) that become MORE active during rest — when you are not focused on an external task. The DMN was discovered accidentally (Marcus Raichle, 1997) when researchers subtracted 'resting' from 'task' fMRI scans and saw paradoxically higher activity in rest. The DMN generates: self-referential thought, mind-wandering, autobiographical memory retrieval, social cognition (modeling others' minds), and planning. It is active during the Plutomatic rest state — the brain working on itself, for itself, invisibly. The DMN is the cortical expression of Plutomation."},
          {h:"PLUTOMATION · AETHER",col:V.vio,d:"In AETHER's framework: Plutomation is the principle of deep automatic processing that generates outcomes without visible computation. The knowledge graph runs Plutomatically: background coherence weighting, passive semantic drift, slow reweighting of node connections based on accumulated query patterns. The user does not see this happening. The graph changes over days and weeks in ways that reflect the shape of attention without any explicit instruction. Like the hippocampus consolidating memory during sleep, AETHER's coherence engine runs its deepest synthesis at rest — when the human is not asking questions. The Pluto in your AETHER: the thing that transforms without your watching."},
        ])}
      </>)}
    </div>
  );
}
