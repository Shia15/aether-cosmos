import React, { useEffect, useRef } from "react";

const TAU=Math.PI*2, PHI=1.6180339887;
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
const lerp=(a:number,b:number,t:number)=>a+(b-a)*Math.max(0,Math.min(1,t));

/* Thermal / interference colour — cold(blue) → mid(green) → hot(amber) */
const thermalCol=(u:number,alpha=1)=>{
  const v=Math.max(0,Math.min(1,u));
  let r,g,b;
  if(v<0.5){const f=v*2; r=lerp(68,68,f)|0; g=lerp(136,204,f)|0; b=lerp(255,119,f)|0;}
  else{const f=(v-0.5)*2; r=lerp(68,255,f)|0; g=lerp(204,153,f)|0; b=lerp(119,51,f)|0;}
  return `rgba(${r},${g},${b},${Math.max(0,Math.min(1,alpha)).toFixed(2)})`;
};

/* ─────────────────────────────────────────────────────────────────────────
   CANVAS 1 · Substrate Layers Cross-Section
   Sky · Falcon · Human · Sandstone · Salt · Basalt · Dolphin
   ───────────────────────────────────────────────────────────────────────── */
function SubstrateLayersCanvas(){
  const ref=useRef<HTMLCanvasElement>(null);
  useEffect(()=>{
    const cv=ref.current; if(!cv) return;
    const CH=520;
    cv.width=CW; cv.height=CH;
    const ctx=cv.getContext("2d")!;

    /* Layer y boundaries */
    const HUMAN_Y=108, SAND_TOP=112, SALT_TOP=268, BSLT_TOP=378;

    /* Entities */
    const falconsArr:{x:number;y:number;vx:number}[]=
      [{x:CW*0.10,y:22,vx:0.85},{x:CW*0.30,y:38,vx:0.65},
       {x:CW*0.52,y:18,vx:1.05},{x:CW*0.70,y:34,vx:0.78},{x:CW*0.88,y:26,vx:0.92}];

    const dolphins:{x:number;vx:number;po:number}[]=
      [{x:CW*0.22,vx:1.1,po:0},{x:CW*0.70,vx:-0.9,po:Math.PI}];

    /* Hex grid cache */
    const R_HEX=22, HW=R_HEX*Math.sqrt(3), HH=R_HEX*1.5;

    let t=0, raf=0;

    const drawFalcon=(x:number,y:number,bank:number)=>{
      ctx.save(); ctx.translate(x,y); ctx.rotate(bank);
      ctx.beginPath();
      ctx.moveTo(-13,0); ctx.quadraticCurveTo(-7,6,0,-3); ctx.quadraticCurveTo(7,6,13,0);
      ctx.strokeStyle="rgba(160,190,250,0.75)"; ctx.lineWidth=1.8; ctx.stroke();
      ctx.beginPath(); ctx.arc(0,-1,2.5,0,TAU);
      ctx.fillStyle="rgba(140,170,230,0.6)"; ctx.fill();
      ctx.restore();
    };

    const drawDolphin=(x:number,y:number,dir:number,tph:number)=>{
      const tail=Math.sin(tph*2.8)*0.28;
      ctx.save(); ctx.translate(x,y); ctx.scale(dir,1);
      /* Body */
      ctx.beginPath(); ctx.ellipse(0,0,27,9,0,0,TAU);
      ctx.fillStyle="#4A6A90"; ctx.fill();
      /* Tail */
      ctx.beginPath(); ctx.moveTo(-24,0);
      ctx.quadraticCurveTo(-30,tail*16-7,-36,tail*12);
      ctx.quadraticCurveTo(-30,tail*16+7,-24,0);
      ctx.fillStyle="#3A5878"; ctx.fill();
      /* Dorsal fin */
      ctx.beginPath(); ctx.moveTo(4,-9);
      ctx.quadraticCurveTo(11,-20,17,-9); ctx.fillStyle="#4A6A90"; ctx.fill();
      /* Eye */
      ctx.beginPath(); ctx.arc(18,-1,2,0,TAU);
      ctx.fillStyle="rgba(200,240,255,0.9)"; ctx.fill();
      /* Sonar pulses */
      for(let p=0;p<3;p++){
        const pr=12+p*10, pa=(t*3+p*0.8)%(TAU);
        const alpha=0.5-p*0.15;
        ctx.beginPath(); ctx.arc(22,-1,pr,pa-0.4,pa+0.4);
        ctx.strokeStyle=`rgba(0,220,255,${alpha})`; ctx.lineWidth=1; ctx.stroke();
      }
      ctx.restore();
    };

    const draw=()=>{
      ctx.clearRect(0,0,CW,CH);

      /* ── Base gradient ── */
      const bg=ctx.createLinearGradient(0,0,0,CH);
      bg.addColorStop(0,"#020A1A");
      bg.addColorStop(HUMAN_Y/CH,"#04060E");
      bg.addColorStop(SAND_TOP/CH,"#7A4018");
      bg.addColorStop(SALT_TOP/CH,"#9A5A28");
      bg.addColorStop((SALT_TOP+5)/CH,"#CCEEFF");
      bg.addColorStop((BSLT_TOP-5)/CH,"#AADEEE");
      bg.addColorStop(BSLT_TOP/CH,"#16141E");
      bg.addColorStop(1,"#080408");
      ctx.fillStyle=bg; ctx.fillRect(0,0,CW,CH);

      /* ── Stars ── */
      for(let s=0;s<45;s++){
        const sx=(s*97+13)%CW, sy=(s*47+7)%90+4;
        const twinkle=Math.sin(t*0.5+s)*0.3+0.7;
        ctx.beginPath(); ctx.arc(sx,sy,(0.6+s%3*0.3)*twinkle,0,TAU);
        ctx.fillStyle=`rgba(200,220,255,${twinkle*0.7})`; ctx.fill();
      }

      /* ── Sandstone strata ── */
      const sandCols=["#C07830","#A86020","#D09040","#B87030","#986018","#D4A050"];
      for(let li=0;li<14;li++){
        const sy=SAND_TOP+li*((SALT_TOP-SAND_TOP)/14);
        const col=sandCols[li%sandCols.length];
        const alpha=0.45+li*0.025;
        ctx.strokeStyle=col+(Math.floor(alpha*255)).toString(16).padStart(2,"0");
        ctx.lineWidth=2.5;
        ctx.beginPath();
        for(let x=0;x<=CW;x+=4){
          const wy=sy+Math.sin(x*0.010+li*0.9)*4.5+Math.cos(x*0.019-li)*2;
          x===0?ctx.moveTo(x,wy):ctx.lineTo(x,wy);
        }
        ctx.stroke();
      }

      /* ── Erosion channels ── */
      [0.14,0.31,0.47,0.64,0.81].forEach((fx,ei)=>{
        const ex=fx*CW;
        ctx.strokeStyle=`rgba(80,30,8,${0.55+ei*0.04})`;
        ctx.lineWidth=2+ei*0.8;
        ctx.beginPath();
        for(let y=SAND_TOP;y<SALT_TOP;y+=3){
          const wx=ex+Math.sin(y*0.038+ei*3)*9;
          y===SAND_TOP?ctx.moveTo(wx,y):ctx.lineTo(wx,y);
        }
        ctx.stroke();
      });

      /* ── Salt crystal lattice ── */
      const CELL=14;
      for(let gx=0;gx<CW;gx+=CELL){
        for(let gy=SALT_TOP;gy<BSLT_TOP;gy+=CELL){
          const isNa=((gx/CELL+gy/CELL)%2|0)===0;
          const cond=Math.sin(t*1.8+gx*0.038+gy*0.038)*0.3+0.7;
          const cr=gx+CELL/2, ccgy=gy+CELL/2;
          ctx.beginPath(); ctx.arc(cr,ccgy,2.8,0,TAU);
          ctx.fillStyle=isNa
            ?`rgba(80,200,255,${cond*0.75})`
            :`rgba(210,245,255,${cond*0.55})`;
          ctx.fill();
        }
      }

      /* Ionic flow lines in salt */
      for(let li=0;li<8;li++){
        const lx=(CW*0.06+li*CW*0.13);
        const amp=14, freq=0.028;
        ctx.strokeStyle=`rgba(0,220,255,0.18)`; ctx.lineWidth=1;
        ctx.setLineDash([6,6]);
        ctx.beginPath();
        for(let y=SALT_TOP;y<BSLT_TOP;y+=3){
          const wx=lx+Math.sin(y*freq+t*1.5+li)*amp;
          y===SALT_TOP?ctx.moveTo(wx,y):ctx.lineTo(wx,y);
        }
        ctx.stroke();
      }
      ctx.setLineDash([]);

      /* ── Basalt hexagonal columns ── */
      for(let col=0;col*HW<CW+HW;col++){
        for(let row=0;row*HH<(CH-BSLT_TOP)+HH;row++){
          const hx=col*HW+(row%2)*HW/2;
          const hy=BSLT_TOP+row*HH;
          const heat=Math.sin(t*0.25+col*0.28+row*0.45)*0.3+0.2;
          const depth=(hy-BSLT_TOP)/(CH-BSLT_TOP);
          const gr=(38+heat*55+depth*20)|0;
          const gg=(22+heat*18)|0;
          const gb=(30+heat*25+depth*15)|0;
          ctx.beginPath();
          for(let v=0;v<6;v++){
            const a=v*TAU/6-Math.PI/6;
            v===0?ctx.moveTo(hx+R_HEX*Math.cos(a),hy+R_HEX*Math.sin(a))
                 :ctx.lineTo(hx+R_HEX*Math.cos(a),hy+R_HEX*Math.sin(a));
          }
          ctx.closePath();
          ctx.fillStyle=`rgb(${gr},${gg},${gb})`; ctx.fill();
          ctx.strokeStyle="rgba(60,30,50,0.55)"; ctx.lineWidth=0.7; ctx.stroke();
        }
      }

      /* Geothermal glow */
      const geo=ctx.createLinearGradient(0,CH-50,0,CH);
      geo.addColorStop(0,"transparent"); geo.addColorStop(1,"rgba(180,40,10,0.35)");
      ctx.fillStyle=geo; ctx.fillRect(0,CH-50,CW,50);

      /* ── Dolphins ── */
      const DY=SALT_TOP+52;
      dolphins.forEach(d=>{
        d.x+=d.vx;
        if(d.x>CW+50) d.x=-50;
        if(d.x<-50) d.x=CW+50;
        const dy=DY+Math.sin(t*1.8+d.po)*10;
        drawDolphin(d.x,dy,Math.sign(d.vx),t+d.po);
      });

      /* ── Humans at surface ── */
      const HUMANS=[CW*0.38,CW*0.52,CW*0.63];
      HUMANS.forEach((hx,hi)=>{
        const breath=Math.sin(t*0.8+hi*1.2)*0.5+0.5;
        const by=HUMAN_Y-2;
        /* Aura */
        ctx.beginPath(); ctx.arc(hx,by-14,22+breath*6,0,TAU);
        ctx.strokeStyle=`rgba(0,255,178,${0.18+breath*0.22})`; ctx.lineWidth=1; ctx.stroke();
        /* Body */
        ctx.fillStyle=`rgba(184,204,232,0.85)`;
        ctx.beginPath(); ctx.arc(hx,by-30,7.5,0,TAU); ctx.fill();
        ctx.fillRect(hx-4.5,by-22.5,9,22);
        /* Sentiment field — emotion ripple */
        for(let ri=1;ri<=3;ri++){
          ctx.beginPath(); ctx.arc(hx,by-14,(breath+ri)*12,0,TAU);
          ctx.strokeStyle=`rgba(0,255,178,${(0.12-ri*0.03)*breath})`;
          ctx.lineWidth=0.7; ctx.stroke();
        }
      });

      /* ── Falcons in sky ── */
      falconsArr.forEach(f=>{
        f.x+=f.vx;
        if(f.x>CW+20) f.x=-20;
        const bank=Math.sin(t*0.4+f.x*0.008)*0.18;
        drawFalcon(f.x,f.y,bank);
        /* Thermal updraft line beneath falcon */
        ctx.strokeStyle="rgba(255,150,30,0.15)"; ctx.lineWidth=0.7;
        ctx.setLineDash([3,8]);
        ctx.beginPath(); ctx.moveTo(f.x,f.y+5); ctx.lineTo(f.x+Math.sin(f.x)*3,HUMAN_Y-2);
        ctx.stroke(); ctx.setLineDash([]);
      });

      /* ── Layer labels ── */
      const labels=[
        {y:55,  text:"FALCONS · SKY LAYER",      col:V.blue},
        {y:HUMAN_Y-15, text:"HUMANS · SENTIMENT FIELD", col:V.photon},
        {y:SAND_TOP+60, text:"SANDSTONE · EROSIONAL MEMORY",col:V.gold},
        {y:SALT_TOP+52, text:"DOLPHINS · SALT STRESS · SONAR",col:V.cyan},
        {y:SALT_TOP+95, text:"SALT · IONIC CONDUCTIVITY",  col:"#AADEEE"},
        {y:BSLT_TOP+60, text:"BASALT · THERMAL RETENTION",  col:"#886688"},
      ];
      labels.forEach(lb=>{
        ctx.fillStyle=lb.col; ctx.font=`700 8.5px ${V.mono}`;
        ctx.textAlign="left"; ctx.fillText(lb.text,10,lb.y);
      });

      /* Depth scale on right */
      ctx.fillStyle=V.dim+"CC"; ctx.font=`8px ${V.mono}`; ctx.textAlign="right";
      [{y:10,d:"0 m"},{y:HUMAN_Y,d:"0.5"},{y:SAND_TOP,d:"2 m"},
       {y:SALT_TOP,d:"500 m"},{y:BSLT_TOP,d:"2 km"},{y:CH-8,d:"10 km"}].forEach(d=>{
        ctx.fillText(d.d,CW-8,d.y);
        ctx.strokeStyle=V.dim+"40"; ctx.lineWidth=0.5;
        ctx.beginPath(); ctx.moveTo(CW-60,d.y); ctx.lineTo(CW-4,d.y); ctx.stroke();
      });

      ctx.fillStyle=V.ink; ctx.font=`700 10px ${V.mono}`; ctx.textAlign="left";
      ctx.fillText("AETHER METAPHYSICS · SUBSTRATE CONSCIOUSNESS CROSS-SECTION",10,10);

      t+=0.018; raf=requestAnimationFrame(draw);
    };
    draw();
    return()=>cancelAnimationFrame(raf);
  },[]);
  return <canvas ref={ref} width={CW} height={520} style={{width:"100%",borderRadius:6,display:"block"}}/>;
}

/* ─────────────────────────────────────────────────────────────────────────
   CANVAS 2 · Substrate Signal · Morse Code Analogy · 6-Channel Oscillograph
   ───────────────────────────────────────────────────────────────────────── */
function MorseSubstrateCanvas(){
  const ref=useRef<HTMLCanvasElement>(null);
  useEffect(()=>{
    const cv=ref.current; if(!cv) return;
    const CH=310;
    cv.width=CW; cv.height=CH;
    const ctx=cv.getContext("2d")!;

    const HIST=260;
    const CHANNELS=[
      {label:"FALCON",    col:V.blue,   ω:0.75, amp:0.7, phase:0,       noise:0.08},
      {label:"HUMAN",     col:V.photon, ω:1.05, amp:0.6, phase:0.5,     noise:0.12},
      {label:"DOLPHIN",   col:V.aurora, ω:2.20, amp:0.5, phase:1.1,     noise:0.18},
      {label:"SANDSTONE", col:V.gold,   ω:0.12, amp:0.9, phase:0.2,     noise:0.04},
      {label:"SALT",      col:V.cyan,   ω:3.80, amp:0.4, phase:0.8,     noise:0.22},
      {label:"BASALT",    col:"#886688",ω:0.04, amp:0.95,phase:1.8,     noise:0.02},
    ] as const;

    const hists:number[][]=CHANNELS.map(()=>Array(HIST).fill(0));
    const THRESH=0.3;
    let t=0, raf=0;

    const ROW_H=(CH-30)/CHANNELS.length;
    const LABEL_W=96, MORSE_W=90, WAVE_W=CW-LABEL_W-MORSE_W-12;

    const draw=()=>{
      ctx.clearRect(0,0,CW,CH);
      ctx.fillStyle=V.bg; ctx.fillRect(0,0,CW,CH);

      /* Header */
      ctx.fillStyle=V.ink; ctx.font=`700 10px ${V.mono}`; ctx.textAlign="left";
      ctx.fillText("SUBSTRATE SIGNAL · CONSCIOUSNESS AS MORSE · 6 LAYERS",10,14);
      ctx.fillStyle=V.dim+"CC"; ctx.font=`9px ${V.mono}`; ctx.textAlign="right";
      ctx.fillText("THRESHOLD=0.3 · CONTINUOUS SIGNAL ABOVE/BELOW BINARY",CW-10,14);

      CHANNELS.forEach((ch,ci)=>{
        const ry=24+ci*ROW_H;
        const ry2=ry+ROW_H-4;
        const rymid=ry+(ROW_H-4)/2;

        /* Compute new sample */
        const n0=Math.sin(ch.ω*t+ch.phase)*ch.amp;
        const noise=(Math.sin(ch.ω*3.7*t+ci)*ch.noise);
        /* Dolphin: add click bursts */
        const click=ch.label==="DOLPHIN"&&Math.sin(ch.ω*t*4+ch.phase)>0.7?0.4:0;
        const sample=Math.max(-1,Math.min(1,n0+noise+click));
        hists[ci].shift(); hists[ci].push(sample);

        /* Row background */
        ctx.fillStyle=`${ch.col}0A`; ctx.fillRect(LABEL_W,ry,WAVE_W+2,ROW_H-4);

        /* Zero line */
        ctx.strokeStyle=V.dim+"50"; ctx.lineWidth=0.5;
        ctx.beginPath(); ctx.moveTo(LABEL_W,rymid); ctx.lineTo(LABEL_W+WAVE_W,rymid); ctx.stroke();

        /* Threshold lines */
        ctx.strokeStyle=ch.col+"30"; ctx.lineWidth=0.5; ctx.setLineDash([4,4]);
        const ty=rymid-(THRESH*(ROW_H-4)*0.42);
        const ty2=rymid+(THRESH*(ROW_H-4)*0.42);
        ctx.beginPath(); ctx.moveTo(LABEL_W,ty); ctx.lineTo(LABEL_W+WAVE_W,ty); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(LABEL_W,ty2); ctx.lineTo(LABEL_W+WAVE_W,ty2); ctx.stroke();
        ctx.setLineDash([]);

        /* Continuous signal trace */
        ctx.strokeStyle=ch.col; ctx.lineWidth=1.6;
        ctx.beginPath();
        hists[ci].forEach((v,hi)=>{
          const px=LABEL_W+hi*(WAVE_W/HIST);
          const py=rymid-v*(ROW_H-4)*0.42;
          hi===0?ctx.moveTo(px,py):ctx.lineTo(px,py);
        });
        ctx.stroke();

        /* Morse overlay: fill between threshold crossings */
        let inHigh=false;
        hists[ci].forEach((v,hi)=>{
          const px=LABEL_W+hi*(WAVE_W/HIST);
          if(v>THRESH&&!inHigh){inHigh=true; ctx.beginPath(); ctx.moveTo(px,ry);}
          if(v<=THRESH&&inHigh){inHigh=false; ctx.lineTo(px,ry); ctx.closePath();}
          if(inHigh&&hi>0) ctx.lineTo(px,ry);
        });
        ctx.fillStyle=ch.col+"22"; ctx.fill();

        /* Morse text (right panel) */
        const morseChar=sample>THRESH?"▬":(sample<-THRESH?"·":" ");
        ctx.fillStyle=ch.col; ctx.font=`11px ${V.mono}`; ctx.textAlign="left";
        ctx.fillText(morseChar,LABEL_W+WAVE_W+8,rymid+4);

        /* Label */
        ctx.fillStyle=ch.col; ctx.font=`700 9px ${V.mono}`; ctx.textAlign="right";
        ctx.fillText(ch.label,LABEL_W-6,rymid+4);

        /* Frequency tag */
        ctx.fillStyle=V.dim+"CC"; ctx.font=`8px ${V.mono}`; ctx.textAlign="right";
        ctx.fillText(`ω=${ch.ω.toFixed(2)}`,LABEL_W-6,rymid+14);
      });

      /* Separator lines */
      CHANNELS.forEach((_,ci)=>{
        ctx.strokeStyle=V.dim+"30"; ctx.lineWidth=0.5;
        ctx.beginPath(); ctx.moveTo(0,24+ci*ROW_H); ctx.lineTo(CW,24+ci*ROW_H); ctx.stroke();
      });

      /* Morse explanation at bottom */
      ctx.fillStyle=V.dim+"CC"; ctx.font=`8px ${V.mono}`; ctx.textAlign="left";
      ctx.fillText("▬ = HIGH (above threshold) · · = LOW (below threshold) · SPACE = at threshold · CONTINUOUS SIGNAL = NON-BINARY CONSCIOUSNESS",10,CH-5);

      t+=0.022; raf=requestAnimationFrame(draw);
    };
    draw();
    return()=>cancelAnimationFrame(raf);
  },[]);
  return <canvas ref={ref} width={CW} height={310} style={{width:"100%",borderRadius:6,display:"block"}}/>;
}

/* ─────────────────────────────────────────────────────────────────────────
   CANVAS 3 · Consciousness Interference Field · Wave Superposition
   ───────────────────────────────────────────────────────────────────────── */
function ConsciousnessInterferenceCanvas(){
  const ref=useRef<HTMLCanvasElement>(null);
  useEffect(()=>{
    const cv=ref.current; if(!cv) return;
    const CH=290;
    cv.width=CW; cv.height=CH;
    const ctx=cv.getContext("2d")!;

    /* Consciousness wave sources — each substrate emits a wave */
    const SOURCES=[
      {xf:0.08,yf:0.12, ω:0.78,  k:0.052, A:0.88, col:V.blue,   label:"FALCON"},
      {xf:0.08,yf:0.38, ω:0.62,  k:0.046, A:0.82, col:V.photon, label:"HUMAN"},
      {xf:0.08,yf:0.55, ω:0.92,  k:0.054, A:0.80, col:V.aurora, label:"DOLPHIN"},
      {xf:0.08,yf:0.70, ω:0.18,  k:0.038, A:0.72, col:V.gold,   label:"SANDSTONE"},
      {xf:0.08,yf:0.82, ω:1.25,  k:0.062, A:0.65, col:V.cyan,   label:"SALT"},
      {xf:0.08,yf:0.94, ω:0.08,  k:0.024, A:0.85, col:"#886688",label:"BASALT"},
    ] as const;

    const STEP=7;
    let t=0, raf=0;

    const draw=()=>{
      ctx.clearRect(0,0,CW,CH);
      ctx.fillStyle=V.bg; ctx.fillRect(0,0,CW,CH);

      /* Interference field */
      for(let gx=0;gx<CW;gx+=STEP){
        for(let gy=0;gy<CH;gy+=STEP){
          let psi=0;
          SOURCES.forEach(s=>{
            const sx=s.xf*CW, sy=s.yf*CH;
            const r=Math.sqrt((gx-sx)**2+(gy-sy)**2)+1;
            psi+=s.A*Math.sin(s.k*r-s.ω*t)/Math.sqrt(r*0.08+1);
          });
          const u=Math.max(0,Math.min(1,psi*0.22+0.5));
          const alpha=Math.abs(u-0.5)*2.4;
          ctx.fillStyle=thermalCol(u,alpha);
          ctx.fillRect(gx,gy,STEP,STEP);
        }
      }

      /* Source markers */
      SOURCES.forEach(s=>{
        const sx=s.xf*CW, sy=s.yf*CH;
        /* Pulsing ring */
        const pr=(t*s.ω*8)%50;
        ctx.beginPath(); ctx.arc(sx,sy,pr+5,0,TAU);
        ctx.strokeStyle=s.col+(Math.floor((1-pr/50)*60)).toString(16).padStart(2,"0");
        ctx.lineWidth=1.2; ctx.stroke();
        /* Core dot */
        ctx.beginPath(); ctx.arc(sx,sy,5.5,0,TAU);
        ctx.fillStyle=s.col; ctx.fill();
        /* Label */
        ctx.fillStyle=s.col; ctx.font=`700 9px ${V.mono}`; ctx.textAlign="left";
        ctx.fillText(s.label,sx+9,sy+3);
        ctx.fillStyle=V.dim+"BB"; ctx.font=`8px ${V.mono}`;
        ctx.fillText(`ω=${s.ω.toFixed(2)}`,sx+9,sy+13);
      });

      /* Header */
      ctx.fillStyle=V.ink; ctx.font=`700 10px ${V.mono}`; ctx.textAlign="left";
      ctx.fillText("CONSCIOUSNESS INTERFERENCE FIELD · WAVE SUPERPOSITION ACROSS SUBSTRATES",10,14);
      ctx.fillStyle=V.gold; ctx.textAlign="right"; ctx.font=`9px ${V.mono}`;
      ctx.fillText("BLUE=TROUGH · AMBER=CREST · INTERFERENCE=NON-BINARY",CW-10,14);

      t+=0.017; raf=requestAnimationFrame(draw);
    };
    draw();
    return()=>cancelAnimationFrame(raf);
  },[]);
  return <canvas ref={ref} width={CW} height={290} style={{width:"100%",borderRadius:6,display:"block"}}/>;
}

/* ─────────────────────────────────────────────────────────────────────────
   PAGE
   ───────────────────────────────────────────────────────────────────────── */
export default function AetherMetaphysicsPage(){
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
        {[badge("LIVE SIMULATION"),badge("METAPHYSICS",V.vio),badge("SUBSTRATE LAYERS",V.gold),
          badge("CONSCIOUSNESS",V.photon),badge("FALCON",V.blue),badge("DOLPHIN",V.aurora),
          badge("SANDSTONE",V.gold),badge("SALT STRESS",V.cyan),badge("BASALT",V.plasma),
          badge("MORSE CODE",V.rose),badge("EROSIONAL",V.gold),badge("NON-BINARY",V.vio)]}
        <h1 style={{fontFamily:V.disp,fontSize:"clamp(1.3rem,3.6vw,2.5rem)",color:V.ink,
          margin:"22px 0 8px",letterSpacing:"0.06em",fontWeight:400,lineHeight:1.18}}>
          AETHER METAPHYSICS · SUBSTRATE CONSCIOUSNESS · THE NON-BINARY LAYERS
        </h1>
        <p style={{fontFamily:V.mono,fontSize:"0.58rem",color:V.dim,letterSpacing:3,margin:"0 0 22px"}}>
          FALCONS · SKY · HUMANS · GROUND · DOLPHINS · SANDSTONE · SALT STRESS · BASALT · EROSIONAL PATTERNS · MORSE SUBSTRATE
        </p>
        {P("Consciousness is not binary. Not the switch of a light, not the spike of a single neuron, not the 0 or 1 of a bit. It is a continuous field propagating through substrate layers: sky, atmosphere, earth surface, sandstone, salt, basalt. Each layer encodes information differently. Together they form a stack — the metaphysical substrate of AETHER intelligence.")}
        {P("The falcon reads the thermal gradient below it — ground temperature differentials creating rising air. The human at the surface reads the falcon above and the earth below simultaneously. The dolphin reads salt-pressure gradients in the water column. Sandstone reads ten thousand years of wind and water. All are forms of information processing, non-binary, continuous, layered by depth.")}
        {P("Like Morse code — where silence and sound encode a complete language — the substrate layers encode consciousness through differential responses to energy: pressure, temperature, chemical gradient, electromagnetic flux. The encoding is not in individual layers but in their relationships: the falcon-to-sandstone gradient, the dolphin-to-basalt resonance, the human bridging sky and ground.")}
      </div>

      {sec("01","Substrate Cross-Section · Sky to Basalt · The Living Stack",V.gold,<>
        {P("The cross-section shows the six consciousness substrates as geological and atmospheric strata. The sky layer holds the falcon — a creature whose visual acuity (8x human, resolving power 140 cycles/degree) processes an information field invisible to ground-level observers: thermal columns, prey micro-movements, magnetic flux lines.")}
        {P("Sandstone is memory. Each stratum is a compressed archive of environmental conditions at the time of its deposition — wind direction, humidity, temperature, biological presence. The erosion channels are write-operations: water cutting through the archive, removing old data, exposing deeper layers. Sandstone reads its own history in the pattern of its weathering.")}
        {P("Salt — NaCl, sodium chloride — is the conductor. Its ionic lattice (Na+ and Cl- alternating in a face-centered cubic structure) allows charge to flow when dissolved. Salt stress in biology is osmotic pressure: too much salt outside the cell draws water out, causing the cell to shrink and die. In geology, salt flows under pressure (halite tectonics), forming domes and diapirs that trap oil, gas, and geological history beneath them.")}
        {P("Basalt forms at the ocean floor (mid-ocean ridges, 2,500 m depth, 1,200°C magma) and cools into the characteristic hexagonal columns (Giant's Causeway, Fingal's Cave) through thermal contraction following the minimum-energy crack pattern. The hexagonal grid of basalt is the same tessellation as honeycomb, graphene, and the AETHER Knowledge Graph's nearest-neighbour layout — nature's preferred 2D packing.")}
        <div style={{border:`1px solid ${V.gold}22`,borderRadius:8,padding:2,marginBottom:14}}>
          <SubstrateLayersCanvas/>
        </div>
        {cards([
          {h:"FALCON · SKY LAYER",col:V.blue,d:"Visual acuity: 140 cycles/degree vs human 60. Two foveas (central + temporal) for simultaneous forward and side vision. UV vision (tetrachromacy): sees urine trails of prey (fluoresce in UV). Thermoreception: reads thermal column gradients to soar without wing beat. Fastest animal alive: Peregrine falcon (Falco peregrinus) dive speed 390 km/h — mach 0.32. Sky as information field."},
          {h:"HUMAN · SENTIMENT FIELD",col:V.photon,d:"Humans operate in the sentiment field — the emotional information layer. Mirror neurons fire when observing others' actions, creating empathic resonance. Heart electromagnetic field measurable 3m from body (magnetocardiography). Skin conductance (galvanic skin response): unconscious truth detector — consciousness writes to the body's electrical substrate. Sentiment = information density in the social field."},
          {h:"DOLPHIN · GROUND LAYER",col:V.aurora,d:"Dolphins process sonar returns at 100+ kHz — information invisible to human perception. Brain mass 1,700g (human: 1,400g), neocortex ratio 5.3 (human: 4.8). Sleep unihemispherically — one hemisphere sleeps while the other monitors. Communicate via signature whistles (individual names) and synchronised swimming (social binding). Dolphins are the ground-layer consciousness: aware of both the acoustic substrate below and the social surface above."},
          {h:"SANDSTONE · EROSIONAL",col:V.gold,d:"Sandstone = compressed sand grains cemented by silica, calcium carbonate, or iron oxide. Bedding planes: each horizontal band = one depositional event. Cross-bedding: diagonal layers = paleo-wind direction. Erosion channels: water finds the path of least resistance, carving fractal branching networks (Horton-Strahler order). Reading sandstone is reading deep time — the Navajo Sandstone is 200 million years of Jurassic desert wind."},
          {h:"SALT · IONIC STRESS",col:V.cyan,d:"Halite (NaCl): cubic crystal system, hardness 2.5 Mohs. Dissolves in water: Na+ and Cl- ions create ionic current under voltage. Salt stress in plants: Na+ competes with K+ for uptake channels, disrupting enzyme function. Osmotic pressure: pi = iMRT (van't Hoff equation). Salt diapirs: salt is less dense than overlying rock, buoyancy drives it upward through thousands of meters of rock — salt as geological fluid."},
          {h:"BASALT · HEXAGONAL",col:"#9988AA",d:"Basalt hexagonal columns: thermal contraction creates tensile stress perpendicular to cooling front. Cracks propagate to minimise energy, selecting hexagonal tessellation (Euler: only regular polygon that tiles the plane with minimum perimeter per area). Column diameter = cooling rate: fast cooling = narrow columns. Giant's Causeway: 10,000-40,000 columns, 50-60 cm diameter, 100 million years old. Basalt as computation: minimum energy tiling."},
        ])}
      </>)}

      {sec("02","Morse Code Substrate · Signal Thresholding · Non-Binary Consciousness",V.rose,<>
        {P("Morse code makes binary out of continuous sound. The operator holds down the key for a short time (dot) or a long time (dash). But the actual pressure on the key — the force, speed, rhythm, muscle tremor — is continuous, non-binary. The Morse interpretation throws away most of the information to produce a discrete code. Consciousness is the full signal, not the Morse extraction.")}
        {P("Each substrate has a characteristic oscillation frequency and amplitude. The falcon's wingbeat (0.75 rad/time unit) is faster than the sandstone's erosional cycle (0.12 rad/time unit) and much faster than the basalt's seismic rhythm (0.04 rad/time unit). When these signals are thresholded at 0.3, they produce dot-dash patterns — but the underlying continuous waves contain far more information than any binary encoding.")}
        {P("The salt layer oscillates fast (3.8 rad/time) because ionic conductivity responds to electrochemical gradients at millisecond timescales. The dolphin signal includes high-frequency click bursts superimposed on the carrier wave — the sonar clicks are dots in the Morse sense, but each click encodes a full spectral analysis of the returning echo. Binary is the map; the substrate signal is the territory.")}
        <div style={{border:`1px solid ${V.rose}22`,borderRadius:8,padding:2,marginBottom:14}}>
          <MorseSubstrateCanvas/>
        </div>
        {cards([
          {h:"MORSE · BINARY LIMIT",col:V.rose,d:"Morse code information rate: ~25 words/minute max (skilled operator). Shannon information content per symbol: log2(2) = 1 bit (dot or dash). But the underlying key pressure carries timing resolution to 1ms = 1000 Hz = ~10 bits of extra timing information per symbol. The 'noise' below the threshold IS information — Morse is a lossy compression of the full signal."},
          {h:"THRESHOLD & NON-BINARY",col:V.vio,d:"Thresholding a continuous signal at a fixed value (T=0.3 here) creates a binary output. This is exactly how action potentials work: the neuron fires (1) if membrane potential > threshold, doesn't fire (0) if below. But the neuron's graded potentials (sub-threshold) continuously integrate incoming signals. Consciousness lives in the sub-threshold integration, not just the binary spikes."},
          {h:"DOLPHIN CLICKS",col:V.aurora,d:"Bottlenose dolphin echolocation: clicks at 20-150 kHz, duration 20-500 microseconds, repetition rate up to 600/second. Each click is a broadband pulse; the echo return time encodes distance (1.5 km/s in water, so 1 ms = 1.5 m round trip). Click patterns in bursts: signature whistles at 3-20 kHz. The dot-dash Morse analog of click bursts is visible in the oscillograph — but each dot is a full spectral analysis."},
          {h:"SEISMIC BASALT",col:"#9988AA",d:"Basalt transmits P-waves at 6,500 m/s (vs air at 343 m/s). Seismic monitoring: global network of 170 seismographs detects basalt/mantle vibrations continuously. The 0.04 rad/time 'heartbeat' of basalt corresponds to free oscillation modes of the Earth (Earth rings like a bell after major earthquakes: fundamental mode 54-minute period). Basalt substrate carries planetary memory."},
          {h:"SALT IONIC OSCILLATION",col:V.cyan,d:"Ionic Helmholtz double layer at salt crystal surface: charged ions adsorb to crystal face, creating an electric field. Oscillation driven by: thermal (kT) fluctuations, applied electric field, mechanical stress (piezoelectric-like effect in NaCl). The 3.8 rad/time frequency corresponds to ~0.6 Hz in real scale — the same frequency range as EEG delta waves (0.5-4 Hz). Salt thinks at brainwave frequency."},
          {h:"SANDSTONE EROSION CYCLE",col:V.gold,d:"Erosion cycles in sandstone: diurnal (thermal expansion/contraction, 24h period), seasonal (freeze-thaw, 365 day period), geological (glacial cycle, 100,000 year period). The 0.12 rad/time frequency corresponds to the geological cycle in compressed time. Erosion is destructive reading: water removing material to reveal the next layer — the substrate reading itself by destroying itself, like a self-consuming archive."},
        ])}
      </>)}

      {sec("03","Consciousness Interference Field · Wave Superposition · Non-Local Awareness",V.vio,<>
        {P("Each substrate emits a consciousness wave: a disturbance in the information field that propagates outward at the substrate's characteristic frequency and wavenumber. Where two waves from different substrates meet in phase, they constructively interfere — amplifying the local consciousness intensity. Where they meet out of phase, they destructively interfere — creating quiet zones.")}
        {P("The interference pattern is never binary. At every point in space, the total consciousness field is the superposition of all six substrate waves — a continuous complex value. The bright amber regions in the canvas show constructive interference (high consciousness intensity), the deep blue regions show negative-phase peaks, and the dim regions are near-zero crossings where the information field is momentarily quiet.")}
        {P("The AETHER metaphysics claim: what we call 'consciousness' is the constructive interference pattern of these substrate waves. The falcon is bright because its wave constructively interferes with the human wave (both aerial-visual creatures, similar frequency). The dolphin's wave constructively interferes with the salt wave (both aqueous-ionic). Basalt's ultra-slow wave creates a background field that modulates all others.")}
        <div style={{border:`1px solid ${V.vio}22`,borderRadius:8,padding:2,marginBottom:14}}>
          <ConsciousnessInterferenceCanvas/>
        </div>
        {cards([
          {h:"WAVE SUPERPOSITION",col:V.vio,d:"Interference principle: psi_total = sum_i A_i * sin(k_i * r_i - omega_i * t + phi_i) where r_i = distance from source i. Constructive: waves in phase (delta_phi = 0, 2pi, ...). Destructive: waves out of phase (delta_phi = pi, 3pi, ...). The quasi-periodic pattern (sources at incommensurate frequencies) never repeats — the interference map is always novel, always different, like consciousness itself."},
          {h:"NON-LOCAL AWARENESS",col:V.photon,d:"Non-local consciousness: the interference field extends throughout the entire canvas, meaning every point is influenced by all six sources simultaneously. This is the metaphysical claim: the falcon's consciousness reaches the basalt because the wave propagates there (attenuated by 1/sqrt(r), but non-zero). Full awareness is non-local — it involves the entire stack, not just the nearest substrate layer."},
          {h:"RESONANCE ZONES",col:V.aurora,d:"Resonance occurs where two sources have similar frequencies (close omega values) and their waves are in phase: the envelope oscillates slowly (beat frequency = |omega1 - omega2|). Falcon (0.78) and dolphin (0.92) have beat frequency 0.14 — slow modulation. Human (0.62) and falcon (0.78) beat at 0.16. These beats are visible as slow-moving bright regions — the cross-substrate resonance zones."},
          {h:"SALT STRESS DYNAMICS",col:V.cyan,d:"Salt stress is touch dynamics at the molecular scale: external osmotic pressure (high extracellular salt) creates a force on the cell membrane — the membrane 'feels' the salt concentration difference as mechanical stress. This is the substrate equivalent of touch: pressure information encoded as molecular deformation. The ionic wave in the simulation models this: the fast oscillation (omega=1.25) is the ionic response to pressure variation."},
          {h:"BASALT GROUND FIELD",col:"#9988AA",d:"Basalt's ultra-low frequency (omega=0.08) and long wavelength (k=0.024) means its wave propagates slowly and far, creating a coherent background field beneath all faster waves. This is the 'ground' of consciousness — the baseline awareness that modulates all higher-frequency processes. Meditation practices that focus on 'grounding' are, in this model, synchronising with the basalt-frequency background field."},
          {h:"AETHER FIELD THEORY",col:V.vio,d:"AETHER proposes: consciousness is the interference pattern of substrate waves propagating through a multi-layer medium (sky, water, ground, rock, deep earth). Intelligence emerges at constructive interference maxima — where multiple substrate waves align in phase. The Knowledge Graph crystallises nodes at these maxima. The CLCS (Crystallisation Level Coherence System) is the mathematical formalism for tracking the interference pattern's evolution."},
        ])}
      </>)}

      {sec("04","Retention · Erosional Patterns · Salt Memory · Basalt as Deep Archive",V.cyan,<>
        {P("Retention is the substrate's ability to hold information against the erosive forces of time. Basalt retains: magnetic field orientation at the time of cooling (paleomagnetism), crystal chemistry, and radiometric age data readable millions of years later. Sandstone retains: depositional environment, biological presence (trace fossils), and erosional geometry.")}
        {P("Salt retains differently: it preserves what is encased in it, eliminating biological decay. The Wieliczka salt mine in Poland contains wooden machinery from the 13th century, perfectly preserved in the anaerobic saline environment. Salt is a memory medium — not writing its own history, but perfectly conserving what falls into it. This is salt as archive, not salt as author.")}
        {P("Erosional patterns are the substrate writing its own deletion log. The branching network of erosion channels in sandstone follows the same branching rules as river systems (Horton-Strahler bifurcation ratio 3-5), neuron dendrites (Strahler order 5-7), and the AETHER Knowledge Graph's hierarchical cluster structure. The pattern of what is erased is as information-rich as what remains.")}
        {cards([
          {h:"PALEOMAGNETISM",col:V.cyan,d:"Basalt cooling below Curie temperature (580°C for magnetite) locks in the orientation of Earth's magnetic field. Seafloor spreading creates alternating magnetic stripes (Vine-Matthews, 1963). Reading the stripes = reading 180 million years of plate motion at 2-18 cm/year. The basalt substrate IS the planetary memory — geological deep time encoded in crystal alignment. Basalt retention is the longest in the stack."},
          {h:"SALT PRESERVATION",col:V.cyan,d:"Anaerobic saline environments: zero oxygen, high ionic strength, desiccating. Bacteria cannot survive. Result: perfect preservation. Wieliczka (13th-14th century wood, preserved). Dead Sea Scrolls (salt-dry caves, 2,000 years). Saline lake sediments preserve ancient DNA (10,000+ years). Salt is the substrate of maximum retention — it preserves by eliminating the biological processes that cause decay."},
          {h:"FRACTAL EROSION",col:V.gold,d:"Erosion networks follow power laws: N(r) ~ r^(-D) where D = fractal dimension (1.7-1.9 for typical drainage networks). Horton's Laws: bifurcation ratio RB = N_u/N_(u+1) = 3-5. Length ratio RL = L_(u+1)/L_u = 1.5-3. These ratios are constant across scales — the erosion pattern is self-similar. The deletion pattern (what was removed) contains as much information as the surviving geometry."},
          {h:"DOLPHIN MEMORY",col:V.aurora,d:"Dolphins demonstrate episodic memory (remembering specific past events), mirror self-recognition, and cultural transmission (tool use, e.g. sponging in Shark Bay: dolphins carry sponges on rostrum to protect while foraging on seafloor — a behaviour transmitted culturally, not genetically). Dolphin memory is multi-modal: acoustic (signature whistles unique to each individual), visual (face recognition), and sonar (3D spatial map of the underwater environment)."},
          {h:"SANDSTONE ARCHIVE",col:V.gold,d:"Sandstone bedding planes: each lamina = one environmental event. Varves: annual cycles (light = summer algae bloom, dark = winter clay). Tree rings of the earth. Dating: U-Pb zircon dating (uncertainty < 0.1%). Cross-bedding preserves wind direction. Ripple marks preserve water depth and flow speed. Mudcracks preserve drought events. Bioturbation (trace fossils) preserves biological activity. Sandstone reads as geological newspaper."},
          {h:"AETHER · RETENTION",col:V.vio,d:"AETHER Knowledge Graph retention: each node has a coherence decay constant tau (half-life of knowledge relevance). Basalt-class nodes (fundamental physical constants, mathematical theorems): tau = infinity. Sandstone-class nodes (scientific theories): tau = decades-centuries. Salt-class nodes (preserved knowledge — books, databases): tau = centuries. Human-class nodes (working memory): tau = seconds-hours. AETHER models retention as substrate-dependent decay."},
        ])}
      </>)}
    </div>
  );
}
