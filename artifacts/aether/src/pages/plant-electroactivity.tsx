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
   CANVAS 1 · Plant Membrane Potential · Ca²⁺ Channels · Traveling AP Wave
   ───────────────────────────────────────────────────────────────────────── */
function PlantMembraneCanvas(){
  const ref=useRef<HTMLCanvasElement>(null);
  useEffect(()=>{
    const cv=ref.current; if(!cv) return;
    const CH=440;
    cv.width=CW; cv.height=CH;
    const ctx=cv.getContext("2d")!;

    const MEMBY=CH*0.48; /* membrane y position */
    const MЕМH=14;        /* membrane thickness */

    /* Channel positions — fixed spacing */
    const N_CH=10;
    const CHANNELS=Array.from({length:N_CH},(_,i)=>({
      x:((i+0.5)/N_CH)*CW,
      type:i%3===0?"Ca":i%3===1?"K":"H",
    }));

    /* Membrane potential profile: resting=-150, peak=+40, undershoot=-170 */
    const vm_at=(phase:number)=>{
      /* phase 0..1: fraction of wavelength behind the wave front */
      if(phase<0.04) return -150+190*Math.sin(phase/0.04*PI);     /* depol ramp */
      if(phase<0.08) return +40-210*((phase-0.04)/0.04);          /* repol */
      if(phase<0.12) return -170+20*((phase-0.08)/0.04);           /* undershoot */
      return -150;                                                    /* resting */
    };

    /* Vm trace history for scope */
    const SCOPE_W=180, SCOPE_H=70;
    const vmTrace:number[]=new Array(SCOPE_W).fill(-150);

    let t=0, raf=0;

    const draw=()=>{
      ctx.clearRect(0,0,CW,CH);
      ctx.fillStyle=V.bg; ctx.fillRect(0,0,CW,CH);

      /* Extracellular background (top — slightly lighter) */
      ctx.fillStyle="rgba(20,30,55,0.5)";
      ctx.fillRect(0,0,CW,MEMBY-MЕМH/2);

      /* Intracellular background (bottom — darker) */
      ctx.fillStyle="rgba(4,10,28,0.7)";
      ctx.fillRect(0,MEMBY+MЕМH/2,CW,CH-MEMBY-MЕМH/2);

      /* Zone labels */
      ctx.fillStyle=V.ink+"55"; ctx.font=`700 9px ${V.mono}`; ctx.textAlign="left";
      ctx.fillText("EXTRACELLULAR  (+)",10,22);
      ctx.fillText("INTRACELLULAR  (−)  Vm ≈ −150 mV",10,MEMBY+MЕМH/2+22);

      /* Charge clouds — static positive (+) outside, negative (−) inside */
      for(let ci=0;ci<40;ci++){
        const cx2=(ci*137+7)%CW, cy2=20+(ci*53)%(MEMBY-MЕМH/2-30);
        ctx.fillStyle="rgba(80,150,220,0.35)"; ctx.font=`8px ${V.mono}`;
        ctx.textAlign="center"; ctx.fillText("+",cx2,cy2);
      }
      for(let ci=0;ci<40;ci++){
        const cx2=(ci*97+23)%CW, cy2=MEMBY+MЕМH/2+14+(ci*41)%(CH-MEMBY-MЕМH/2-40);
        ctx.fillStyle="rgba(220,80,80,0.35)"; ctx.font=`8px ${V.mono}`;
        ctx.textAlign="center"; ctx.fillText("−",cx2,cy2);
      }

      /* Wave front position (cycles across the canvas) */
      const wFront=((t*CW*0.07)%CW);

      /* ── Vm colorized membrane strip ── */
      const SEG=6;
      for(let sx=0;sx<CW;sx+=SEG){
        let phase=((wFront-sx+CW)%CW)/CW;
        const vm=vm_at(phase);
        /* Color: deep blue=-150, green=0, red=+40 */
        const norm=(vm+150)/200; /* 0=resting, 1=peak */
        const r=(norm*220)|0, g=(norm<0.5?norm*2*200:200-norm*200)|0, b=((1-norm)*120)|0;
        ctx.fillStyle=`rgb(${r},${g},${b})`;
        ctx.fillRect(sx,MEMBY-MЕМH/2,SEG+1,MЕМH);
      }

      /* ── Ion channels ── */
      CHANNELS.forEach(ch=>{
        let phase=((wFront-ch.x+CW)%CW)/CW;
        const firing=phase<0.12;
        const caOpen=ch.type==="Ca"&&phase>0&&phase<0.06;
        const kOpen=ch.type==="K"&&phase>0.04&&phase<0.12;
        const hPump=ch.type==="H";

        /* Channel barrel */
        ctx.fillStyle=firing?(ch.type==="Ca"?V.cyan:ch.type==="K"?V.green:V.shock)+"BB":V.dim+"55";
        ctx.fillRect(ch.x-4,MEMBY-MЕМH/2-4,8,MЕМH+8);
        ctx.strokeStyle=firing?V.photon+"88":V.dim+"33"; ctx.lineWidth=0.8;
        ctx.strokeRect(ch.x-4,MEMBY-MЕМH/2-4,8,MЕМH+8);

        /* Ion flow particles */
        if(caOpen){
          /* Ca2+ rushing IN (downward) */
          const frac=(phase/0.06);
          const py=MEMBY-MЕМH/2-20+frac*40;
          ctx.beginPath(); ctx.arc(ch.x,py,3.5,0,TAU);
          ctx.fillStyle=V.cyan+"CC"; ctx.fill();
          ctx.fillStyle=V.cyan+"AA"; ctx.font=`700 7px ${V.mono}`; ctx.textAlign="center";
          ctx.fillText("Ca²⁺",ch.x,py-8);
        }
        if(kOpen){
          /* K+ rushing OUT (upward) */
          const frac=((phase-0.04)/0.08);
          const py=MEMBY+MЕМH/2+20-frac*40;
          ctx.beginPath(); ctx.arc(ch.x,py,3.5,0,TAU);
          ctx.fillStyle=V.green+"CC"; ctx.fill();
          ctx.fillStyle=V.green+"AA"; ctx.font=`700 7px ${V.mono}`; ctx.textAlign="center";
          ctx.fillText("K⁺",ch.x,py+14);
        }
        if(hPump){
          /* H⁺-ATPase constantly pumping H+ out, restoring gradient */
          const bounce=Math.sin(t*3+ch.x*0.01)*6;
          const py=MEMBY-MЕМH/2-12+bounce;
          ctx.beginPath(); ctx.arc(ch.x,py,2.5,0,TAU);
          ctx.fillStyle=V.shock+"66"; ctx.fill();
          ctx.fillStyle=V.shock+"55"; ctx.font=`6.5px ${V.mono}`; ctx.textAlign="center";
          ctx.fillText("H⁺",ch.x,py-8);
        }

        /* Channel label */
        ctx.fillStyle=(ch.type==="Ca"?V.cyan:ch.type==="K"?V.green:V.shock)+"88";
        ctx.font=`700 7px ${V.mono}`; ctx.textAlign="center";
        ctx.fillText(ch.type==="Ca"?"Ca²⁺":ch.type==="K"?"K⁺":"H⁺ATPase",ch.x,MEMBY+MЕМH/2+36+(hPump?10:0));
      });

      /* ── Vm SCOPE (top right) ── */
      const scopeX=CW-SCOPE_W-12, scopeY=12;
      ctx.fillStyle="#050C14"; ctx.fillRect(scopeX,scopeY,SCOPE_W,SCOPE_H);
      ctx.strokeStyle=V.dim+"44"; ctx.lineWidth=0.7; ctx.strokeRect(scopeX,scopeY,SCOPE_W,SCOPE_H);
      /* Zero line */
      const zeroY=scopeY+SCOPE_H*0.65;
      ctx.strokeStyle=V.dim+"33"; ctx.lineWidth=0.5;
      ctx.beginPath(); ctx.moveTo(scopeX,zeroY); ctx.lineTo(scopeX+SCOPE_W,zeroY); ctx.stroke();

      /* Push current Vm sample */
      let frontPhase=0;
      const vm_now=vm_at(frontPhase);
      vmTrace.shift(); vmTrace.push(vm_now);

      ctx.strokeStyle=V.photon+"AA"; ctx.lineWidth=1.2;
      ctx.beginPath();
      vmTrace.forEach((vm,vi)=>{
        const tx=scopeX+vi, ty=zeroY-((vm+20)/240)*SCOPE_H*0.9;
        vi===0?ctx.moveTo(tx,ty):ctx.lineTo(tx,ty);
      });
      ctx.stroke();

      /* Vm labels */
      ctx.fillStyle=V.photon+"88"; ctx.font=`700 7px ${V.mono}`; ctx.textAlign="left";
      ctx.fillText("+40 mV",scopeX+2,scopeY+9);
      ctx.fillText("−150 mV",scopeX+2,scopeY+SCOPE_H-3);
      ctx.fillStyle=V.photon+"CC"; ctx.font=`700 8px ${V.mono}`; ctx.textAlign="right";
      ctx.fillText("Vm SCOPE",scopeX+SCOPE_W-2,scopeY+8);

      /* Legend */
      ctx.fillStyle=V.cyan+"BB"; ctx.font=`700 8px ${V.mono}`; ctx.textAlign="left";
      ctx.fillText("● Ca²⁺ in  (depolarise)",10,CH-36);
      ctx.fillStyle=V.green+"BB"; ctx.fillText("● K⁺ out  (repolarise)",10,CH-24);
      ctx.fillStyle=V.shock+"BB"; ctx.fillText("● H⁺-ATPase pump (restore gradient)",10,CH-12);

      ctx.fillStyle=V.ink; ctx.font=`700 10px ${V.mono}`; ctx.textAlign="left";
      ctx.fillText("PLANT MEMBRANE POTENTIAL · Ca²⁺ CHANNELS · K⁺ REPOLARISATION · H⁺-ATPase PUMP",10,14);

      /* Update scope continuously */
      vmTrace.shift();
      const wfPhase=0;
      vmTrace.push(vm_at(wfPhase));

      t+=0.016; raf=requestAnimationFrame(draw);
    };
    draw();
    return()=>cancelAnimationFrame(raf);
  },[]);
  return <canvas ref={ref} width={CW} height={440} style={{width:"100%",borderRadius:6,display:"block"}}/>;
}

/* ─────────────────────────────────────────────────────────────────────────
   CANVAS 2 · Venus Flytrap · Mimosa Fold · Sea Slug · Local Decisions
   ───────────────────────────────────────────────────────────────────────── */
function VenusMimosaCanvas(){
  const ref=useRef<HTMLCanvasElement>(null);
  useEffect(()=>{
    const cv=ref.current; if(!cv) return;
    const CH=460;
    cv.width=CW; cv.height=CH;
    const ctx=cv.getContext("2d")!;

    /* Venus flytrap state */
    const VFT={open:1, triggered:false, hair1t:0, hair2t:0, signalX:-1, closeProg:0};
    /* Mimosa fold state — 5 pinnae, each has foldAmt 0..1 */
    const MIMOSA={pinna:new Array(5).fill(0) as number[], wavePos:-1, waving:false, resetTimer:0};
    /* Aplysia state */
    const APLYSIA={touch:false, gRet:0, touchTimer:0, ganglia:[] as {x:number;y:number;fire:number}[]};
    /* Init ganglia */
    for(let g=0;g<5;g++) APLYSIA.ganglia.push({x:CW*0.80+g*12,y:CH*0.44,fire:0});

    /* Signal particles */
    const SIGS:{x:number;y:number;vx:number;vy:number;life:number;col:string}[]=[];

    let t=0, raf=0;

    const draw=()=>{
      ctx.clearRect(0,0,CW,CH);
      ctx.fillStyle=V.bg; ctx.fillRect(0,0,CW,CH);

      /* Ground */
      ctx.fillStyle="#0A0E08"; ctx.fillRect(0,CH*0.78,CW,CH*0.22);

      /* ╔════════════════════════ VENUS FLYTRAP ════════════════════════╗ */
      const VX=CW*0.18, VY=CH*0.58;

      /* Stem */
      ctx.strokeStyle=V.green+"66"; ctx.lineWidth=3;
      ctx.beginPath(); ctx.moveTo(VX,CH*0.78); ctx.lineTo(VX,VY+30); ctx.stroke();

      /* Opening animation */
      VFT.closeProg=Math.max(0,VFT.closeProg-0.005);
      const openAng=(1-VFT.closeProg)*PI*0.28;

      /* Upper lobe */
      ctx.save(); ctx.translate(VX,VY);
      ctx.rotate(-openAng);
      ctx.beginPath(); ctx.moveTo(0,0);
      ctx.bezierCurveTo(-28,-8,-40,-30,-36,-55);
      ctx.bezierCurveTo(-20,-62,20,-62,36,-55);
      ctx.bezierCurveTo(40,-30,28,-8,0,0);
      ctx.fillStyle=VFT.closeProg>0.3?"rgba(80,160,60,0.7)":"rgba(50,140,40,0.65)";
      ctx.fill();
      ctx.strokeStyle=V.green+"55"; ctx.lineWidth=0.8; ctx.stroke();
      /* Trigger hairs upper */
      [[-18,-30],[0,-38],[18,-30]].forEach(([hx,hy])=>{
        ctx.strokeStyle=VFT.hair1t>0?V.shock+"CC":V.green+"44"; ctx.lineWidth=1;
        ctx.beginPath(); ctx.moveTo(hx,hy); ctx.lineTo(hx,hy-14); ctx.stroke();
      });
      ctx.restore();

      /* Lower lobe */
      ctx.save(); ctx.translate(VX,VY);
      ctx.rotate(openAng);
      ctx.beginPath(); ctx.moveTo(0,0);
      ctx.bezierCurveTo(-28,8,-40,30,-36,55);
      ctx.bezierCurveTo(-20,62,20,62,36,55);
      ctx.bezierCurveTo(40,30,28,8,0,0);
      ctx.fillStyle="rgba(50,140,40,0.65)"; ctx.fill();
      ctx.strokeStyle=V.green+"55"; ctx.lineWidth=0.8; ctx.stroke();
      /* Trigger hairs lower */
      [[-18,30],[0,38],[18,30]].forEach(([hx,hy])=>{
        ctx.strokeStyle=VFT.hair2t>0?V.shock+"CC":V.green+"44"; ctx.lineWidth=1;
        ctx.beginPath(); ctx.moveTo(hx,hy); ctx.lineTo(hx,hy+14); ctx.stroke();
      });
      ctx.restore();

      /* Trigger sequence */
      VFT.hair1t=Math.max(0,VFT.hair1t-0.015);
      VFT.hair2t=Math.max(0,VFT.hair2t-0.015);
      if(Math.floor(t*0.4)%6===0&&VFT.hair1t<0.01){VFT.hair1t=1;VFT.signalX=VX;}
      if(VFT.hair1t>0&&VFT.hair1t<0.3&&VFT.hair2t<0.01){VFT.hair2t=1;}
      if(VFT.hair2t>0&&VFT.hair2t<0.3){VFT.closeProg=Math.min(1,VFT.closeProg+0.08);}

      /* AP signal flash */
      if(VFT.signalX>=0){
        ctx.beginPath(); ctx.arc(VX,VY,VFT.hair1t*55,0,TAU);
        ctx.strokeStyle=V.shock+`${(VFT.hair1t*200)|0}`.padStart(2,"0");
        ctx.strokeStyle=`rgba(255,220,30,${VFT.hair1t*0.6})`; ctx.lineWidth=2; ctx.stroke();
      }

      ctx.fillStyle=V.green+"CC"; ctx.font=`700 9px ${V.mono}`; ctx.textAlign="center";
      ctx.fillText("VENUS FLYTRAP",VX,CH*0.78+14);
      ctx.fillStyle=V.shock+"88"; ctx.font=`7px ${V.mono}`;
      ctx.fillText("AP 10-14 m/s · TWO TOUCHES",VX,CH*0.78+24);

      /* ╔════════════════════════ MIMOSA PUDICA ════════════════════════╗ */
      const MX=CW*0.50, MY=CH*0.60;
      ctx.strokeStyle=V.green+"55"; ctx.lineWidth=2.5;
      ctx.beginPath(); ctx.moveTo(MX,CH*0.78); ctx.lineTo(MX,MY); ctx.stroke();

      /* Wave simulation */
      if(!MIMOSA.waving&&Math.floor(t*0.25)%5===0){
        MIMOSA.waving=true; MIMOSA.wavePos=0;
        for(let p=0;p<5;p++) MIMOSA.pinna[p]=0;
      }
      if(MIMOSA.waving){
        MIMOSA.wavePos+=0.012; /* slow propagation */
        for(let p=0;p<5;p++){
          if(MIMOSA.wavePos>p*0.18) MIMOSA.pinna[p]=Math.min(1,MIMOSA.pinna[p]+0.025);
        }
        if(MIMOSA.wavePos>5*0.18+0.5){
          MIMOSA.waving=false;
          MIMOSA.resetTimer=200;
        }
      }
      if(MIMOSA.resetTimer>0){
        MIMOSA.resetTimer--;
        for(let p=0;p<5;p++) MIMOSA.pinna[p]=Math.max(0,MIMOSA.pinna[p]-0.006);
      }

      /* Draw 5 pinnae along the stem */
      const pinnaDirs=[{dx:-1,dy:-0.8},{dx:1,dy:-0.6},{dx:-1,dy:-0.4},{dx:1,dy:-0.2},{dx:-1,dy:0}];
      pinnaDirs.forEach((pd,pi)=>{
        const px=MX+pd.dx*18, py=MY+pd.dy*80;
        const fold=MIMOSA.pinna[pi]; /* 0=open, 1=folded */
        /* Petiole */
        ctx.strokeStyle=V.green+"66"; ctx.lineWidth=1.5;
        ctx.beginPath(); ctx.moveTo(MX,py); ctx.lineTo(px,py); ctx.stroke();
        /* 4 leaflets on each pinna */
        for(let li=0;li<4;li++){
          const lx=px+pd.dx*(li+1)*10, ly=py;
          const leafOpen=PI*0.3*(1-fold);
          /* Upper leaflet */
          ctx.save(); ctx.translate(lx,ly);
          ctx.rotate(-leafOpen+fold*PI*0.1);
          ctx.beginPath(); ctx.ellipse(0,-10,4,10,0,0,TAU);
          ctx.fillStyle=`rgba(${(40+fold*40)|0},${(140-fold*40)|0},${(50)|0},0.65)`;
          ctx.fill(); ctx.restore();
          /* Lower leaflet */
          ctx.save(); ctx.translate(lx,ly);
          ctx.rotate(leafOpen-fold*PI*0.1);
          ctx.beginPath(); ctx.ellipse(0,10,4,10,0,0,TAU);
          ctx.fillStyle=`rgba(${(40+fold*40)|0},${(140-fold*40)|0},${(50)|0},0.65)`;
          ctx.fill(); ctx.restore();
        }
        /* Fold signal flash */
        if(MIMOSA.waving&&MIMOSA.wavePos>pi*0.18&&MIMOSA.wavePos<pi*0.18+0.15){
          ctx.beginPath(); ctx.arc(px,py,8,0,TAU);
          ctx.fillStyle=`rgba(0,220,180,${0.6-(MIMOSA.wavePos-pi*0.18)/0.15*0.5})`; ctx.fill();
        }
      });

      ctx.fillStyle=V.aurora+"CC"; ctx.font=`700 9px ${V.mono}`; ctx.textAlign="center";
      ctx.fillText("MIMOSA PUDICA",MX,CH*0.78+14);
      ctx.fillStyle=V.aurora+"77"; ctx.font=`7px ${V.mono}`;
      ctx.fillText("HYDRAULIC+AP · 1-3 cm/s",MX,CH*0.78+24);

      /* ╔════════════════════════ APLYSIA SEA SLUG ════════════════════╗ */
      const AX=CW*0.80, AY=CH*0.50;

      /* Touch trigger */
      APLYSIA.touchTimer++;
      if(APLYSIA.touchTimer%220===0){APLYSIA.touch=true;APLYSIA.ganglia.forEach(g=>g.fire=1);}
      if(APLYSIA.touch){
        APLYSIA.gRet=Math.min(1,APLYSIA.gRet+0.04);
        APLYSIA.touch=false;
      }
      APLYSIA.gRet=Math.max(0,APLYSIA.gRet-0.008);
      APLYSIA.ganglia.forEach(g=>g.fire=Math.max(0,g.fire-0.03));

      /* Body */
      ctx.beginPath();
      ctx.ellipse(AX,AY,48,22,0.2,0,TAU);
      ctx.fillStyle="rgba(140,100,60,0.55)"; ctx.fill();
      ctx.strokeStyle=V.amb+"44"; ctx.lineWidth=1; ctx.stroke();

      /* Mantle */
      ctx.beginPath();
      ctx.ellipse(AX+10,AY-5,22,14,0.3,0,TAU);
      ctx.fillStyle="rgba(160,110,50,0.5)"; ctx.fill();

      /* Gill — retracts when stimulated */
      const gillRet=1-APLYSIA.gRet;
      ctx.beginPath();
      ctx.ellipse(AX+18,AY+4+APLYSIA.gRet*10,10*gillRet,6*gillRet,0,0,TAU);
      ctx.fillStyle="rgba(200,140,60,0.6)"; ctx.fill();
      ctx.strokeStyle=V.gold+"44"; ctx.lineWidth=0.8; ctx.stroke();

      /* Neural ganglia */
      APLYSIA.ganglia.forEach((g,gi)=>{
        const pulse=Math.sin(t*4+gi*0.8)*0.5+0.5;
        const a=g.fire>0?g.fire:pulse*0.2;
        ctx.beginPath(); ctx.arc(g.x,g.y,4,0,TAU);
        ctx.fillStyle=`rgba(0,220,180,${a*0.8+0.1})`; ctx.fill();
        /* Axon connection */
        if(gi<APLYSIA.ganglia.length-1){
          const n=APLYSIA.ganglia[gi+1];
          ctx.strokeStyle=`rgba(0,200,160,${a*0.5+0.1})`; ctx.lineWidth=1;
          ctx.beginPath(); ctx.moveTo(g.x,g.y); ctx.lineTo(n.x,n.y); ctx.stroke();
        }
      });

      ctx.fillStyle=V.gold+"CC"; ctx.font=`700 9px ${V.mono}`; ctx.textAlign="center";
      ctx.fillText("APLYSIA SEA SLUG",AX,CH*0.78+14);
      ctx.fillStyle=V.gold+"77"; ctx.font=`7px ${V.mono}`;
      ctx.fillText("~20K NEURONS · GILL WITHDRAWAL",AX,CH*0.78+24);

      /* LOCAL DECISIONS annotation */
      ctx.fillStyle=V.vio+"AA"; ctx.font=`700 8px ${V.mono}`; ctx.textAlign="left";
      ctx.fillText("EACH PINNA = LOCAL DECISION",CW*0.36,CH*0.20);
      ctx.fillStyle=V.vio+"55"; ctx.font=`7px ${V.mono}`;
      ctx.fillText("NO CENTRAL NERVOUS SYSTEM",CW*0.36,CH*0.20+12);
      ctx.fillText("SIGNAL: CHEMICAL + ELECTRICAL + HYDRAULIC",CW*0.36,CH*0.20+22);

      ctx.fillStyle=V.ink; ctx.font=`700 10px ${V.mono}`; ctx.textAlign="left";
      ctx.fillText("VENUS FLYTRAP · MIMOSA FOLD · SEA SLUG · LOCAL DECISIONS · NO NERVOUS SYSTEM",10,14);

      /* Signal particles */
      for(let si=SIGS.length-1;si>=0;si--){
        const sp=SIGS[si];
        sp.x+=sp.vx; sp.y+=sp.vy; sp.life-=0.018;
        if(sp.life<=0){SIGS.splice(si,1);continue;}
        ctx.beginPath(); ctx.arc(sp.x,sp.y,2,0,TAU);
        ctx.fillStyle=sp.col.replace(")",`,${sp.life})`); ctx.fill();
      }

      t+=0.016; raf=requestAnimationFrame(draw);
    };
    draw();
    return()=>cancelAnimationFrame(raf);
  },[]);
  return <canvas ref={ref} width={CW} height={460} style={{width:"100%",borderRadius:6,display:"block"}}/>;
}

/* ─────────────────────────────────────────────────────────────────────────
   CANVAS 3 · Kin Recognition · VOC Air Network · Willow · Redwood · Ca²⁺ Wave
   ───────────────────────────────────────────────────────────────────────── */
function KinVOCCanvas(){
  const ref=useRef<HTMLCanvasElement>(null);
  useEffect(()=>{
    const cv=ref.current; if(!cv) return;
    const CH=420;
    cv.width=CW; cv.height=CH;
    const ctx=cv.getContext("2d")!;

    /* VOC particle pools — airborne signals */
    const VOCS:{x:number;y:number;vx:number;vy:number;life:number;col:string;src:number}[]=[];

    /* Trees: [x, type, kinGroup] */
    const TREES:[number,string,number][]=[
      [CW*0.10,"willow",0],[CW*0.28,"willow",0],[CW*0.48,"mimosa",1],
      [CW*0.65,"redwood",0],[CW*0.82,"redwood",0],[CW*0.94,"redwood",1],
    ];

    /* Mycorrhizal network nodes (subset of tree root positions) */
    const MYCO_EDGES:[number,number,number][]=[
      [0,1,0],[1,3,0],[3,4,0],[0,3,0],[1,4,0],
    ]; /* [treeA, treeB, kinMatch] */

    /* Ca2+ wave position in roots */
    let caWavePos=0;
    let caWaveSrc=0;

    const GROUND=CH*0.62;

    const spawnVoc=(src:number)=>{
      if(VOCS.length>60) return;
      const tx=TREES[src][0];
      for(let v=0;v<3;v++){
        VOCS.push({
          x:tx+(Math.random()-0.5)*30,
          y:GROUND-60-Math.random()*30,
          vx:(Math.random()-0.5)*0.6,
          vy:-0.4-Math.random()*0.4,
          life:1, col:TREES[src][2]===0?V.green:V.rose,
          src,
        });
      }
    };

    let t=0, raf=0;

    const drawWillow=(tx:number,kinGrp:number)=>{
      /* Trunk */
      ctx.strokeStyle=kinGrp===0?"#5A3820":"#4A2818"; ctx.lineWidth=5;
      ctx.beginPath(); ctx.moveTo(tx,GROUND); ctx.lineTo(tx,GROUND-70); ctx.stroke();
      /* Weeping branches */
      for(let b=0;b<7;b++){
        const ba=(b-3)*0.25;
        const bx=tx+Math.cos(ba)*40, by=GROUND-60+Math.sin(ba)*15;
        ctx.strokeStyle=kinGrp===0?"#3A8828":"#3A8828"; ctx.lineWidth=1;
        ctx.beginPath(); ctx.moveTo(tx,GROUND-55);
        ctx.bezierCurveTo(bx,by-30,bx+Math.cos(ba)*20,by,bx+Math.cos(ba)*14,by+30);
        ctx.stroke();
      }
    };

    const drawRedwood=(tx:number,kinGrp:number)=>{
      /* Trunk */
      ctx.strokeStyle=kinGrp===0?"#6A2E10":"#8A3E18"; ctx.lineWidth=7;
      ctx.beginPath(); ctx.moveTo(tx,GROUND); ctx.lineTo(tx,GROUND-120); ctx.stroke();
      /* Triangular canopy */
      for(let lv=0;lv<4;lv++){
        const ly=GROUND-60-lv*24, lw=45-lv*10;
        ctx.beginPath();
        ctx.moveTo(tx,ly-20); ctx.lineTo(tx-lw,ly); ctx.lineTo(tx+lw,ly); ctx.closePath();
        ctx.fillStyle=kinGrp===0?"rgba(20,100,30,0.55)":"rgba(60,60,20,0.5)"; ctx.fill();
        ctx.strokeStyle=V.green+"22"; ctx.lineWidth=0.5; ctx.stroke();
      }
    };

    const drawMimosa=(tx:number)=>{
      ctx.strokeStyle="#2A5018"; ctx.lineWidth=3;
      ctx.beginPath(); ctx.moveTo(tx,GROUND); ctx.lineTo(tx,GROUND-60); ctx.stroke();
      /* Fern-like pinnae */
      for(let p=0;p<4;p++){
        const pa=(p-1.5)*0.45;
        ctx.strokeStyle="rgba(50,140,50,0.55)"; ctx.lineWidth=1;
        ctx.beginPath(); ctx.moveTo(tx,GROUND-20-p*12);
        ctx.lineTo(tx+Math.cos(pa)*38,GROUND-20-p*12+Math.sin(pa)*12);
        ctx.stroke();
      }
    };

    const draw=()=>{
      ctx.clearRect(0,0,CW,CH);
      ctx.fillStyle=V.bg; ctx.fillRect(0,0,CW,CH);

      /* Sky */
      const skyG=ctx.createLinearGradient(0,0,0,GROUND);
      skyG.addColorStop(0,"#040810"); skyG.addColorStop(1,"#0A1020");
      ctx.fillStyle=skyG; ctx.fillRect(0,0,CW,GROUND);

      /* Soil */
      const soilG=ctx.createLinearGradient(0,GROUND,0,CH);
      soilG.addColorStop(0,"#14100A"); soilG.addColorStop(1,"#0A0806");
      ctx.fillStyle=soilG; ctx.fillRect(0,GROUND,CW,CH-GROUND);

      /* ── MYCORRHIZAL NETWORK (underground) ── */
      MYCO_EDGES.forEach(([a,b,km])=>{
        const ax=TREES[a][0], bx=TREES[b][0];
        const pulse=Math.sin(t*0.8+a*0.5)*0.5+0.5;
        const col=km===0?V.gold:V.rose;
        /* Main fungal thread */
        ctx.strokeStyle=col+(km===0?"30":"22");
        ctx.lineWidth=1+pulse*0.8;
        ctx.beginPath();
        ctx.moveTo(ax,GROUND+22);
        ctx.bezierCurveTo(ax,GROUND+60,bx,GROUND+60,bx,GROUND+22);
        ctx.stroke();
        /* Ca2+ wave along the thread */
        if(a===caWaveSrc||b===caWaveSrc){
          const wp=caWavePos;
          const cwx=ax+(bx-ax)*wp, cwy=GROUND+60-Math.sin(wp*PI)*38+22;
          ctx.beginPath(); ctx.arc(cwx,cwy,4,0,TAU);
          ctx.fillStyle=V.cyan+"CC"; ctx.fill();
        }
      });
      /* Advance Ca2+ wave */
      caWavePos+=0.005;
      if(caWavePos>1){caWavePos=0; caWaveSrc=(caWaveSrc+1)%TREES.length;}
      ctx.fillStyle=V.gold+"66"; ctx.font=`700 8px ${V.mono}`; ctx.textAlign="center";
      ctx.fillText("MYCORRHIZAL NETWORK · Ca²⁺ WAVE",CW*0.50,CH-8);

      /* ── TREES ── */
      TREES.forEach(([tx,type,kg])=>{
        if(type==="willow") drawWillow(tx,kg);
        else if(type==="redwood") drawRedwood(tx,kg);
        else drawMimosa(tx);

        /* Root system */
        ctx.strokeStyle=kg===0?V.gold+"22":V.rose+"22"; ctx.lineWidth=1;
        for(let r=0;r<4;r++){
          const ra=(r-1.5)*0.4;
          ctx.beginPath(); ctx.moveTo(tx,GROUND);
          ctx.lineTo(tx+Math.cos(ra)*35,GROUND+28+r*4); ctx.stroke();
        }

        /* Kin aura */
        const kinAura=ctx.createRadialGradient(tx,GROUND-40,5,tx,GROUND-40,55);
        const aCol=kg===0?`rgba(0,220,120,`:`rgba(255,100,150,`;
        kinAura.addColorStop(0,aCol+"0.07)"); kinAura.addColorStop(1,aCol+"0)");
        ctx.fillStyle=kinAura; ctx.fillRect(tx-60,GROUND-100,120,CH-GROUND+100);
        /* Kin badge */
        ctx.fillStyle=kg===0?V.green+"AA":V.rose+"AA";
        ctx.font=`700 7px ${V.mono}`; ctx.textAlign="center";
        ctx.fillText(`KIN ${kg+1}`,tx,GROUND+8);
      });

      /* ── VOC PARTICLES (air signals) ── */
      if(t%0.8<0.016){
        const src=Math.floor(Math.random()*TREES.length);
        spawnVoc(src);
      }
      for(let vi=VOCS.length-1;vi>=0;vi--){
        const vp=VOCS[vi];
        vp.x+=vp.vx+(Math.sin(t*0.5+vi)*0.12);
        vp.y+=vp.vy;
        vp.life-=0.004;
        if(vp.life<=0||vp.y<10){VOCS.splice(vi,1);continue;}
        ctx.beginPath(); ctx.arc(vp.x,vp.y,2,0,TAU);
        ctx.fillStyle=vp.col+`${(vp.life*180)|0}`.padStart(2,"0");
        ctx.fillStyle=`rgba(${vp.col===V.green?'0,220,120':'255,100,150'},${vp.life*0.6})`;
        ctx.fill();

        /* VOC reception: if a particle from a different kin drifts near a kin-0 tree */
        TREES.forEach(([tx,,kg])=>{
          const dx=vp.x-tx;
          if(Math.abs(dx)<24 && vp.src!==TREES.indexOf([tx,"",kg])){
            /* recognition response — small flash */
            ctx.beginPath(); ctx.arc(tx,GROUND-44,4,0,TAU);
            ctx.fillStyle=`rgba(200,220,80,${vp.life*0.4})`; ctx.fill();
          }
        });
      }

      /* VOC labels */
      ctx.fillStyle=V.green+"AA"; ctx.font=`700 8px ${V.mono}`; ctx.textAlign="center";
      ctx.fillText("↑ VOC SIGNALS: JASMONATES · TERPENES · ETHYLENE",CW*0.50,CH*0.08);
      ctx.fillStyle=V.dim+"AA"; ctx.font=`7px ${V.mono}`;
      ctx.fillText("WILLOW · REDWOOD · TALKING THROUGH THE AIR",CW*0.50,CH*0.08+12);

      /* ── PLASMA MATTER FIELD (kin connection) ── */
      /* Bright shimmer between KIN GROUP 0 trees */
      const kin0=[TREES[0][0],TREES[1][0],TREES[3][0],TREES[4][0]];
      for(let ki=0;ki<kin0.length;ki++){
        for(let kj=ki+1;kj<kin0.length;kj++){
          const kax=kin0[ki], kbx=kin0[kj];
          const pulse=Math.sin(t*0.5+ki+kj)*0.3+0.7;
          const fieldG=ctx.createLinearGradient(kax,GROUND-60,kbx,GROUND-60);
          fieldG.addColorStop(0,"transparent");
          fieldG.addColorStop(0.5,`rgba(0,200,120,${pulse*0.04})`);
          fieldG.addColorStop(1,"transparent");
          ctx.fillStyle=fieldG; ctx.fillRect(Math.min(kax,kbx),GROUND-120,Math.abs(kbx-kax),100);
        }
      }
      ctx.fillStyle=V.photon+"55"; ctx.font=`700 8px ${V.mono}`; ctx.textAlign="center";
      ctx.fillText("PLASMA MATTER · KIN FIELD CONNECTION",CW*0.37,GROUND-12);

      ctx.fillStyle=V.ink; ctx.font=`700 10px ${V.mono}`; ctx.textAlign="left";
      ctx.fillText("KIN RECOGNITION · VOC AIR NETWORK · WILLOW · REDWOOD · MYCORRHIZAL Ca²⁺",10,14);

      t+=0.016; raf=requestAnimationFrame(draw);
    };
    draw();
    return()=>cancelAnimationFrame(raf);
  },[]);
  return <canvas ref={ref} width={CW} height={420} style={{width:"100%",borderRadius:6,display:"block"}}/>;
}

/* ─────────────────────────────────────────────────────────────────────────
   PAGE
   ───────────────────────────────────────────────────────────────────────── */
export default function PlantElectroactivityPage(){
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
        {[badge("LIVE SIMULATION"),badge("PLANT AP",V.cyan),badge("Ca²⁺",V.cyan),
          badge("K⁺",V.green),badge("H⁺ PUMP",V.shock),badge("VENUS FLYTRAP",V.green),
          badge("MIMOSA",V.aurora),badge("SEA SLUG",V.gold),badge("KIN RECOGNITION",V.photon),
          badge("VOC NETWORK",V.green),badge("WILLOW",V.green),badge("REDWOOD",V.green),
          badge("MYCORRHIZAL",V.gold),badge("LOCAL DECISIONS",V.vio)]}
        <h1 style={{fontFamily:V.disp,fontSize:"clamp(1.2rem,3.4vw,2.3rem)",color:V.ink,
          margin:"22px 0 8px",letterSpacing:"0.06em",fontWeight:400,lineHeight:1.18}}>
          PLANT ELECTROACTIVITY · Ca²⁺ WAVES · VENUS FLYTRAP · MIMOSA · KIN RECOGNITION · VOC AIR NETWORK
        </h1>
        <p style={{fontFamily:V.mono,fontSize:"0.58rem",color:V.dim,letterSpacing:3,margin:"0 0 22px"}}>
          MEMBRANE POTENTIAL · LOCAL DECISIONS · SEA SLUG · WILLOW · REDWOOD · MYCORRHIZAL · TALKING THROUGH AIR
        </p>
        {P("The plant cell membrane sits at -150 mV — more negative than a neuron, held there by the H+-ATPase proton pump that constantly expels hydrogen ions. Calcium (Ca2+) and potassium (K+) channels are the instruments of action: Ca2+ rushing inward depolarises the membrane, acting as an attractor that triggers cascading responses. K+ flowing outward repolarises it. No nervous system. No brain. Only the membrane, the ions, and the gradient.")}
        {P("The Venus flytrap needs two touches on its trigger hairs within 30 seconds. One touch primes the trap — it sends an action potential that sets the Ca2+ concentration just below threshold. The second touch crosses the threshold. The trap closes in 100 milliseconds, driven not by muscles but by a sudden change in turgor pressure as cells at the hinge rapidly absorb water. The signal travels at 10-14 m/s — faster than you can blink.")}
        {P("Plants are not a single organism with a central brain. Each region is a local processor — making decisions based on local chemical and electrical state. Speed and movement below our perceptual threshold hide enormous activity. Willow trees and redwoods broadcast volatile organic compounds into the air, and neighbouring trees respond — upregulating defences, changing metabolite profiles, acknowledging the signal. Kin-specific recognition changes the response. The forest is not silent.")}
      </div>

      {sec("01","Plant Membrane Potential · Ca²⁺ In · K⁺ Out · H⁺-ATPase · Traveling Wave",V.cyan,<>
        {P("The plant resting membrane potential (-120 to -200 mV) is maintained by the H+-ATPase pump, which exports one proton per ATP molecule, generating an electrochemical gradient across the plasma membrane. This pump is the engine of plant electrical life — more powerful and more electrogenic than the Na+/K+ ATPase in animal cells. The inside is a deep negative well.")}
        {P("When a stimulus arrives (touch, wounding, light, osmotic change), mechanosensitive or ligand-gated calcium channels open. Ca2+ floods in from the extracellular space (where Ca2+ concentration is 10,000× higher than inside the cell). The membrane potential rapidly depolarises from -150 mV to +40 mV — a swing of nearly 200 mV in milliseconds. Calcium is the attractor: once the threshold is crossed, the Ca2+ influx is self-amplifying.")}
        {P("Repolarisation: voltage-gated K+ channels open as Ca2+ channels close. K+ flows outward (K+ is concentrated inside plant cells), returning the membrane to negative. A brief undershoot (-170 mV) follows — the refractory period during which the membrane cannot fire again. The H+-ATPase then restores the full resting potential over the following seconds.")}
        <div style={{border:`1px solid ${V.cyan}22`,borderRadius:8,padding:2,marginBottom:14}}>
          <PlantMembraneCanvas/>
        </div>
        {cards([
          {h:"RESTING POTENTIAL",col:V.cyan,d:"Plant resting Vm: -120 to -200 mV (vs. neuron -70 mV). Why more negative? H+-ATPase pump is more electrogenic: it exports H+ without co-importing any cation, creating a larger charge separation. H+-ATPase generates a proton motive force (PMF): electrical component (Vm) + chemical component (pH gradient, inside alkaline). PMF drives: nutrient uptake, auxin transport, stomatal movement, phloem loading. The H+-ATPase is regulated by 14-3-3 proteins that are activated by blue light (phototropin signalling) and hormones."},
          {h:"Ca²⁺ AS ATTRACTOR",col:V.cyan,d:"Ca2+ concentration inside plant cells: 50-200 nM (resting). Extracellular: 1-10 mM. Ratio: 10,000-50,000x. Electrochemical driving force: massive. When channels open, Ca2+ enters down its gradient at ~10^6 ions/s per channel. Ca2+ binds calmodulin (CaM) — a Ca2+-sensor protein with 4 binding sites. Ca2+-CaM activates: CaM-dependent kinases (CDPKs), calcium-dependent protein kinases (CDPKs), and transcription factors. The Ca2+ signal is both the trigger and the information carrier — amplitude, duration, and spatial pattern all encode different signals."},
          {h:"K⁺ REPOLARISATION",col:V.green,d:"K+ inside plant cells: 100-200 mM (vs. extracellular 1-10 mM). When voltage-gated outward K+ channels (GORK family) open during depolarisation, K+ exits rapidly. This restores the negative membrane potential. K+ channels in plants: more than 15 gene families, including inward rectifiers (KAT1, AKT1 — open at hyperpolarised Vm for K+ uptake), outward rectifiers (GORK — open at depolarised Vm for repolarisation), and K+ two-pore channels (TPK family, in vacuole membrane)."},
          {h:"TRAVELING WAVE",col:V.photon,d:"Plant action potential propagation: through symplasm (cytoplasm connected via plasmodesmata) and apopleasm (cell walls). Speed in phloem: 1-40 m/s. Speed in parenchyma: 0.1-1 cm/s. Mechanism: Ca2+ influx in one cell raises Ca2+ slightly in neighbouring cells (via gap junctions in plasmodesmata), triggering their channels — a wave of depolarisation. Evidence: simultaneous electrical recording from widely separated plant tissues shows correlated oscillations. Long-distance electrical signals in Arabidopsis travel from roots to shoots in under 2 minutes."},
          {h:"SODIUM IN PLANTS",col:V.blue,d:"Plants and sodium: unlike animals, plants do NOT use Na+ gradients as the primary electrical currency. Na+ is mostly excluded from plant cytoplasm — it is a stressor (salt stress). The SOS (Salt Overly Sensitive) pathway: NHX1 antiporter pumps Na+ into vacuoles; SOS1 exporter pumps Na+ out of the cell. Na+ and Ca2+ are completely separate channels. Na+ channels in plants (NSCCs, non-selective cation channels) exist but are not voltage-gated in the same way as animal Na+ channels. The primary cations are K+ (inside) and Ca2+ (signalling messenger)."},
          {h:"AETHER · MEMBRANE FIELD",col:V.cyan,d:"AETHER model: the plant membrane is a coherence interface. The H+-ATPase maintains coherence by constantly expelling disorder (entropy, protons). The resting state is actively maintained — it is not equilibrium, it is steady-state coherence. A disturbance (Ca2+ influx) is a local decoherence event that propagates through the field. The Ca2+ wave is the decoherence wave, and the K+ repolarisation is the return to coherence. AETHER frames this as: excitable media have a ground state (rest) and a coherence threshold (firing). The Ca2+ attractor is exactly that threshold."},
        ])}
      </>)}

      {sec("02","Venus Flytrap · Mimosa · Sea Slug Aplysia · Local Decisions · No CNS",V.green,<>
        {P("The Venus flytrap (Dionaea muscipula) has 6 trigger hairs, 3 per lobe. Each hair stimulation sends one action potential to the midrib of the leaf. The Ca2+ signal from the first touch initiates expression of a counter gene (FT, FLOWERING LOCUS T). If a second touch arrives within 30 seconds, Ca2+ crosses a threshold, activating motor cells. These cells rapidly change turgor pressure — cell walls relax and expand on the outer surface, snapping the lobe shut. Not a muscle. A hydraulic actuator controlled by electrical signal.")}
        {P("Mimosa pudica (the sensitive plant) folds its leaves by a different mechanism: the signal is partly electrical (action potentials at ~1-3 cm/s) and partly hydraulic (turgor changes propagate through the vascular system). At each pulvinus (the joint of each pinna), water exits the motor cells on one side, causing asymmetric collapse. The cascade of folding propagates from the touched pinna down the branch to neighbouring pinnae. Each pulvinus makes a local decision based on the signal it receives.")}
        {P("Aplysia californica has only 20,000 neurons — one of the simplest nervous systems studied. Its gill withdrawal reflex is mediated by a monosynaptic circuit. Kandel showed that repeated gentle touch causes habituation (decreased response — synaptic depression) while a strong shock causes sensitisation (increased response to subsequent touches — synaptic facilitation). The comparison: Aplysia's simplicity reveals what a nervous system adds. Plants do the same without synapses — using chemical memory and epigenetic modification instead.")}
        <div style={{border:`1px solid ${V.green}22`,borderRadius:8,padding:2,marginBottom:14}}>
          <VenusMimosaCanvas/>
        </div>
        {cards([
          {h:"FLYTRAP TWO-TOUCH",col:V.green,d:"Venus flytrap counter mechanism: first touch triggers expression of CaM (calmodulin) gene and accumulates Ca2+ in motor cells. The Ca2+ does not reach the threshold for closure on the first touch. If a second touch occurs within 30 seconds, the Ca2+ addition crosses the closure threshold (threshold is ~1 micromolar free Ca2+). Below threshold: no action. Above threshold: motor cells collapse, hydraulic asymmetry drives rapid closure at ~150 mm/s. The counting is performed in Ca2+ concentration — a molecular integer memory."},
          {h:"MIMOSA HYDRAULIC",col:V.aurora,d:"Mimosa pudica pulvinus: specialised motor organ at the base of each leaflet and pinna. Contains: motor cells (highly vacuolated, sensitive to turgor change), phloem tissue (for signal transport), actin cytoskeleton (for rapid shape change). Signal: action potential + hydraulic pressure wave. Hydraulic wave speed: 10-50 cm/s (faster than AP in parenchyma). Motor cell response: K+ and Cl- exit cells, osmotic potential drops, water exits via osmosis, cell collapses. Entire pinna folds in 1-3 seconds. Recovery (leaves open again): 10-30 minutes (pumping ions back in)."},
          {h:"SEA SLUG LEARNING",col:V.gold,d:"Aplysia californica (sea hare): 20,000 neurons, 1 kg animal. Kandel Nobel Prize (2000) for habituation and sensitisation studies. Gill withdrawal reflex: siphon touch → sensory neuron → motor neuron → gill withdrawal. Habituation: repeated gentle touch → presynaptic Ca2+ depletion → decreased transmitter release → smaller gill withdrawal. Sensitisation: electric shock to tail → 5-HT release from facilitating interneuron → cAMP → PKA → phosphorylation of K+ channels → more Ca2+ entry → larger AP → more transmitter → larger reflex. Two forms of learning, no cortex required."},
          {h:"LOCAL DECISIONS",col:V.vio,d:"Plants as distributed processors: no central brain. Each cell responds to its local chemical and electrical environment. Each stomatal guard cell independently decides whether to open or close (based on local CO2, ABA, light, humidity). Each root tip navigates soil independently (gravitropism, hydrotropism, thigmotropism, chemotropism). Each leaf independently regulates its photosynthetic rate. Yet they all coordinate — through electrical signals, hormones, and VOCs. The result is coherent whole-plant behaviour from entirely local computations. Identical to distributed computing: no master node, emergent coordination."},
          {h:"SPEED + MOVEMENT",col:V.cyan,d:"Our brain sees movement above ~1-2 mm/s and below ~5 m/s. Plants operate at the edges: Venus flytrap closes at 150 mm/s (borderline visible). Mimosa folding: 10-30 mm/s (just barely perceptible). Ca2+ wave in phloem: 40 m/s (invisible — too fast). Root growth: 1-10 mm/day (too slow). Circumnutation (stem spiral growth): 1-3 hours per full rotation (too slow). Thigmonastic leaf movements: seconds (visible). The plant is always moving, always signalling. Our visual system was not built to perceive it."},
          {h:"AETHER · LOCAL FIELD",col:V.green,d:"AETHER: plants as local field processors. The whole plant is a coherence field with no central attractor. Each cell is a local coherence node. Long-range coordination occurs through the field (electrical potential), not through a central processor. AETHER's architecture reflects this: no master agent, distributed coherence nodes communicating through the knowledge graph. The knowledge graph is the mycorrhizal network of information: each node is a plant cell, each edge is a plasmodesma, the Ca2+ wave is the signal propagating through the graph."},
        ])}
      </>)}

      {sec("03","Kin Recognition · Plasma Field · Willow · Redwood · VOC Air · Mycorrhizal Ca²⁺",V.photon,<>
        {P("Willow trees attacked by insects release methyl jasmonate into the air. Neighbouring willows, not touching and not root-connected, detect this volatile and upregulate protease inhibitors in their own leaves before any insect arrives. The signal is the VOC. The response is preemptive defence. This is not a metaphor for communication — it is communication, without any nervous system, using chemistry and air.")}
        {P("Kin recognition in plants: Arabidopsis thaliana can distinguish its own seedling from an unrelated seedling by chemical signals released from roots (root exudates). When grown with kin, the plant reduces competitive root growth and invests more in shared mycorrhizal connections. When grown with strangers, it increases competitive root growth and produces allelopathic compounds that suppress the stranger's growth. The recognition mechanism uses strigolactones and other root exudates as molecular identity signals.")}
        {P("The plasma matter connection is the mycorrhizal network — a continuous mycelium thread connecting the root systems of multiple trees, sometimes of different species. Through this network, carbon (as sugar), water, phosphorus, nitrogen, and chemical signals (including Ca2+ waves) move between trees. A stressed tree receives carbon from unstressed trees. A dying tree transfers its remaining carbon to its neighbours. Old-growth redwoods are connected to hundreds of neighbouring trees through a single mycorrhizal network spanning hectares.")}
        <div style={{border:`1px solid ${V.photon}22`,borderRadius:8,padding:2,marginBottom:14}}>
          <KinVOCCanvas/>
        </div>
        {cards([
          {h:"VOLATILE SIGNALS",col:V.green,d:"Plant VOCs (volatile organic compounds): >1,700 identified compounds across all plant species. Classes: terpenes (isoprene, monoterpenes, sesquiterpenes — defence, pollinator attraction, allelopathy), jasmonates (methyl jasmonate — wound signal), ethylene (ripening, senescence, stress), green leaf volatiles (GLV, from lipoxygenase pathway — released within seconds of wounding, attract predators of herbivores). Willow VOC example: Salix spp. release cis-3-hexenal, trans-2-hexenal, methyl salicylate within seconds of caterpillar attack. Neighbouring willows respond within hours."},
          {h:"KIN RECOGNITION",col:V.photon,d:"Plant kin recognition (Dudley & File, 2007; Murphy et al. 2012): Cakile edentula sea rocket reduced competitive root allocation when neighbours were half-siblings vs. unrelated individuals. Mechanism: root exudate volatiles (strigolactones, sesquiterpenes) carry species and genotype information. 2023 update: Arabidopsis recognises kin by detecting volatile cues from leaves, not just roots. Kin-directed behaviour: increased resource sharing via mycorrhizal connections, reduced allelopathic compound production, altered hormonal balance (more cytokinin, less ethylene — pro-growth rather than competitive signals)."},
          {h:"MYCORRHIZAL NETWORK",col:V.gold,d:"Arbuscular mycorrhizal fungi (AMF) form symbioses with >80% of land plant species. Hyphal network connects multiple plants of the same or different species. Transfer rates: carbon (as sucrose/glucose): up to 10% of tree photosynthate flows into the network. Phosphorus: fungi deliver P in exchange for C, increasing plant P uptake 10-100x. Signalling: when one tree is stressed, systemic signals (jasmonates, ABA, Ca2+ pulses) travel through the hyphae and elicit defensive responses in connected trees. Network extent: a single network can span >30 hectares. One Armillaria mycelium in Oregon covers 9 km2."},
          {h:"REDWOOD NETWORK",col:V.green,d:"Coastal redwoods (Sequoia sempervirens): documented to share carbon through mycorrhizal networks with understory plants (Suzanne Simard's work on Douglas fir applies to similar systems). Redwood clonal clusters (from root sprouting) maintain genetic continuity and share carbon/water through fused root systems. Redwood root systems: shallow but wide (15-30m radius), overlapping with multiple neighbours. 'Mother trees' — large old trees — are hubs in the network, receiving more fungal connections and distributing more carbon to smaller trees. Redwood 'talking' also occurs through ethylene release during drought stress."},
          {h:"PLASMA FIELD CONCEPT",col:V.cyan,d:"The plasma matter connection: a proposed interpretation of the mycorrhizal+VOC network as a quasi-electromagnetic field. The extracellular matrix of the mycorrhizal network contains charged particles, water, mineral ions — a dilute plasma. As ions move through this network (Ca2+, K+, H+), they create local electrical fields detectable by neighbouring cells. The network is not a wire (discrete signal) but a field (continuous, distributed). Plants connected by this network exist in a shared ionic field — a plasma matter coupling that allows instantaneous state sharing across the network."},
          {h:"AETHER · VOC FIELD",col:V.photon,d:"AETHER: the VOC air network is a broadcast layer. The mycorrhizal network is a point-to-point layer. The electrical gradient field is the lowest layer. Three communication layers, no protocol stack, no router — just physics and chemistry. AETHER models this as the AETHER Communication Stack: Layer 0 (membrane potential, local), Layer 1 (Ca2+ wave, symplastic), Layer 2 (phloem electrical, vascular), Layer 3 (VOC broadcast, atmospheric). Each layer has different speed, range, and information density. The forest computes across all four simultaneously."},
        ])}
      </>)}
    </div>
  );
}
