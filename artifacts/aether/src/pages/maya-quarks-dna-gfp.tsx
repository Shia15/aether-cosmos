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
const lerp=(a:number,b:number,t:number)=>a+(b-a)*Math.max(0,Math.min(1,t));
const TAU=Math.PI*2;

/* ─────────────────────────────────────────────────────────────────────────
   CANVAS 1 · Maya Seven Systems · Full Moon Purge · Cosmic Pause Points
   ───────────────────────────────────────────────────────────────────────── */
function MayaSevenCanvas() {
  const ref=useRef<HTMLCanvasElement>(null);
  useEffect(()=>{
    const cv=ref.current; if(!cv) return;
    const CH=500, PR=window.devicePixelRatio||1;
    const CW=Math.max(cv.offsetWidth,520);
    cv.width=CW*PR; cv.height=CH*PR; cv.style.height=CH+"px";
    const ctx=cv.getContext("2d")!; ctx.scale(PR,PR);
    let frame=0, raf=0;

    /* Seven Maya-tracked celestial bodies */
    const BODIES=[
      {name:"SUN",       maya:"K'IN",      col:"#FFE044",synodic:365.25,r:18,orb:0,   desc:"Haab 365-day · solstices · zenith passage"},
      {name:"MOON",      maya:"IK'",       col:"#DDEEFF",synodic:29.53, r:9, orb:55,  desc:"405 lunar months = 11,960 days = 46 Tzolk'in"},
      {name:"VENUS",     maya:"CHAK EK'",  col:"#FFFAAA",synodic:583.92,r:11,orb:90,  desc:"584-day synodic · 8yr = 5 Venus rounds"},
      {name:"MARS",      maya:"BULUK CH'AB",col:"#FF6644",synodic:779.94,r:10,orb:130, desc:"780-day synodic · Paris Codex tables"},
      {name:"MERCURY",   maya:"LAHUN CHAN",col:"#FFCC88",synodic:115.88,r:7, orb:165, desc:"116-day synodic · scribes & commerce"},
      {name:"JUPITER",   maya:"XAMAN EK'", col:"#CC8844",synodic:398.88,r:14,orb:205, desc:"399-day synodic · power & storms"},
      {name:"SATURN",    maya:"WAKAH CHAN",col:"#88AACC",synodic:378.09,r:12,orb:245, desc:"378-day synodic · World Tree alignment"},
    ];

    /* Moon phase tracker */
    const moonPhase=(f:number)=>((f/29.53)%1); /* 0=new, 0.5=full */

    /* Cosmic pause points: moments of astronomical alignment */
    const PAUSES=[
      {label:"SOLAR ECLIPSE",col:V.plasma, ang:0.0},
      {label:"VENUS TRANSIT",col:"#FFFAAA",ang:0.24},
      {label:"FULL MOON",    col:"#DDEEFF",ang:0.5},
      {label:"SATURN OPP",   col:"#88AACC",ang:0.73},
    ];

    /* Glyph drawing helpers */
    const drawKin=(ctx:CanvasRenderingContext2D,x:number,y:number,r:number,col:string)=>{
      /* Kin glyph: cross + 4 dots */
      ctx.strokeStyle=col; ctx.lineWidth=1.5;
      ctx.beginPath(); ctx.moveTo(x-r,y); ctx.lineTo(x+r,y); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(x,y-r); ctx.lineTo(x,y+r); ctx.stroke();
      for(let i=0;i<4;i++){
        const a=i/4*TAU+Math.PI/4;
        ctx.fillStyle=col; ctx.beginPath();
        ctx.arc(x+Math.cos(a)*r*0.7,y+Math.sin(a)*r*0.7,r*0.18,0,TAU); ctx.fill();
      }
    };

    const CXMAYA=CW*0.37, CYMAYA=CH*0.48;

    const draw=()=>{
      ctx.clearRect(0,0,CW,CH);
      const bg=ctx.createRadialGradient(CXMAYA,CYMAYA,0,CXMAYA,CYMAYA,300);
      bg.addColorStop(0,"#0A0814"); bg.addColorStop(1,"#04060E");
      ctx.fillStyle=bg; ctx.fillRect(0,0,CW,CH);

      /* Star field */
      if(frame===0){
        ctx.fillStyle="#FFFFFF";
        for(let i=0;i<120;i++){
          const sx=Math.random()*CW, sy=Math.random()*CH;
          ctx.globalAlpha=0.1+Math.random()*0.5;
          ctx.beginPath(); ctx.arc(sx,sy,0.5,0,TAU); ctx.fill();
        }
        ctx.globalAlpha=1;
      }

      /* Orbital rings */
      BODIES.slice(1).forEach(b=>{
        ctx.strokeStyle="#2A3050"; ctx.lineWidth=0.4;
        ctx.beginPath(); ctx.arc(CXMAYA,CYMAYA,b.orb,0,TAU); ctx.stroke();
      });

      /* Tzolk'in glyph border ring */
      const TZ_N=20;
      for(let i=0;i<TZ_N;i++){
        const a=i/TZ_N*TAU;
        const tr=BODIES[6].orb+28;
        ctx.fillStyle=V.gold+(Math.floor((0.3+0.2*Math.sin(frame*0.03+i))*255).toString(16).padStart(2,"0"));
        ctx.font=`6px ${V.mono}`; ctx.textAlign="center";
        ctx.fillText(["●","◆","▲","■","○","◇","△","□"][i%8],
          CXMAYA+Math.cos(a)*tr, CYMAYA+Math.sin(a)*tr+3);
      }
      ctx.fillStyle=V.gold+"33"; ctx.beginPath(); ctx.arc(CXMAYA,CYMAYA,BODIES[6].orb+36,0,TAU); ctx.stroke();
      ctx.strokeStyle=V.gold+"44"; ctx.lineWidth=0.5;
      ctx.beginPath(); ctx.arc(CXMAYA,CYMAYA,BODIES[6].orb+20,0,TAU); ctx.stroke();

      /* Current moon phase */
      const moonPh=moonPhase(frame*0.5);
      const isFullMoon=moonPh>0.45&&moonPh<0.55;

      /* Full moon purge glow */
      if(isFullMoon){
        const mg=ctx.createRadialGradient(CXMAYA,CYMAYA,0,CXMAYA,CYMAYA,300);
        mg.addColorStop(0,"rgba(180,210,255,0.08)"); mg.addColorStop(1,"transparent");
        ctx.fillStyle=mg; ctx.fillRect(0,0,CW,CH);
      }

      /* Cosmic pause point arcs */
      PAUSES.forEach((p,i)=>{
        const pAngle=p.ang*TAU-Math.PI/2;
        ctx.strokeStyle=p.col+"44"; ctx.lineWidth=0.7; ctx.setLineDash([3,5]);
        ctx.beginPath(); ctx.moveTo(CXMAYA,CYMAYA); ctx.lineTo(CXMAYA+Math.cos(pAngle)*270,CYMAYA+Math.sin(pAngle)*270); ctx.stroke();
        ctx.setLineDash([]);
        ctx.fillStyle=p.col; ctx.font=`5.5px ${V.mono}`; ctx.textAlign="center";
        ctx.fillText("◈ "+p.label,CXMAYA+Math.cos(pAngle)*285,CYMAYA+Math.sin(pAngle)*285+3);
      });

      /* Draw each body */
      BODIES.forEach((b,i)=>{
        if(i===0){
          /* Sun at center */
          const sunPulse=0.92+0.08*Math.sin(frame*0.04);
          const sg=ctx.createRadialGradient(CXMAYA,CYMAYA,0,CXMAYA,CYMAYA,b.r*3);
          sg.addColorStop(0,"#FFE88888"); sg.addColorStop(0.4,"#FFE04455"); sg.addColorStop(1,"transparent");
          ctx.fillStyle=sg; ctx.beginPath(); ctx.arc(CXMAYA,CYMAYA,b.r*3*sunPulse,0,TAU); ctx.fill();
          ctx.fillStyle=b.col; ctx.beginPath(); ctx.arc(CXMAYA,CYMAYA,b.r*sunPulse,0,TAU); ctx.fill();
          drawKin(ctx,CXMAYA,CYMAYA,b.r*0.6,"#8A6020");
          ctx.fillStyle=b.col; ctx.font=`6px ${V.mono}`; ctx.textAlign="center";
          ctx.fillText(b.maya,CXMAYA,CYMAYA+b.r+12);
          return;
        }
        /* Angular speed: inversely proportional to synodic period */
        const speed=0.002*(365.25/b.synodic);
        const ang=frame*speed - Math.PI/2;
        const bx=CXMAYA+Math.cos(ang)*b.orb;
        const by=CYMAYA+Math.sin(ang)*b.orb;

        /* Full moon: bright halo */
        if(b.name==="MOON"&&isFullMoon){
          const mhalo=ctx.createRadialGradient(bx,by,0,bx,by,30);
          mhalo.addColorStop(0,"rgba(180,210,255,0.6)"); mhalo.addColorStop(1,"transparent");
          ctx.fillStyle=mhalo; ctx.beginPath(); ctx.arc(bx,by,30,0,TAU); ctx.fill();
          ctx.fillStyle=V.cyan; ctx.font=`6px ${V.mono}`; ctx.textAlign="center";
          ctx.fillText("FULL MOON",bx,by-22);
          ctx.fillText("MATERIAL PURGE",bx,by-13);
        }
        /* Venus: extra bright when evening/morning star */
        const vensPhase=(b.name==="VENUS")?(0.7+0.3*Math.abs(Math.sin(ang))):1;
        const pulse=vensPhase*(0.88+0.12*Math.sin(frame*0.06+i));

        /* Glow */
        const grd=ctx.createRadialGradient(bx,by,0,bx,by,b.r*2.5);
        grd.addColorStop(0,b.col+"AA"); grd.addColorStop(1,b.col+"00");
        ctx.fillStyle=grd; ctx.beginPath(); ctx.arc(bx,by,b.r*2.5*pulse,0,TAU); ctx.fill();
        /* Body */
        ctx.fillStyle=b.col; ctx.beginPath(); ctx.arc(bx,by,b.r*pulse,0,TAU); ctx.fill();
        /* Saturn rings */
        if(b.name==="SATURN"){
          ctx.strokeStyle=b.col+"88"; ctx.lineWidth=2;
          ctx.beginPath(); ctx.ellipse(bx,by,b.r*1.8,b.r*0.5,ang*0.1,0,TAU); ctx.stroke();
        }
        /* Label */
        const lOff=b.r+11;
        ctx.fillStyle=b.col; ctx.font=`5.5px ${V.mono}`; ctx.textAlign="center";
        ctx.fillText(b.maya,bx,by-lOff);
        ctx.fillStyle=V.dim; ctx.font=`5px ${V.mono}`;
        ctx.fillText(b.synodic+"d",bx,by+lOff+7);
      });

      /* Central label */
      ctx.fillStyle=V.gold+"88"; ctx.font=`6px ${V.mono}`; ctx.textAlign="center";
      ctx.fillText("MAYA SEVEN SYSTEMS",CXMAYA,CYMAYA-270);
      ctx.fillStyle=V.dim; ctx.font=`5.5px ${V.mono}`;
      ctx.fillText("TZOLK'IN 260-day · HAAB 365-day · LONG COUNT 5,125-yr",CXMAYA,CYMAYA-258);

      /* ── RIGHT PANEL: Calendar tables ── */
      const RX=CW*0.73, RY=30;
      ctx.fillStyle=V.gold; ctx.font=`7.5px ${V.mono}`; ctx.textAlign="left";
      ctx.fillText("MAYA ASTRONOMICAL",RX,RY);
      ctx.fillText("PRECISION",RX,RY+12);

      const rows=[
        {label:"TZOLK'IN",val:"260 days",col:V.amb,   note:"13 × 20"},
        {label:"HAAB",    val:"365 days",col:V.gold,  note:"18 × 20 + 5"},
        {label:"CALENDAR ROUND",val:"52 yr",col:V.cyan,  note:"LCM(260,365)"},
        {label:"VENUS ROUND",val:"584 days",col:"#FFFAAA",note:"8yr = 5 Venus"},
        {label:"ECLIPSE CYCLE",val:"11,960d",col:V.plasma,note:"405 lunar months"},
        {label:"LONG COUNT",val:"5,125 yr",col:V.vio,   note:"13 bak'tun"},
        {label:"MOON (modern)",val:"29.530589",col:"#DDEEFF",note:"Maya: 29.5302"},
      ];
      rows.forEach((r,i)=>{
        const ry=RY+30+i*46;
        ctx.fillStyle=r.col+"18"; ctx.fillRect(RX,ry-14,CW-RX-8,42);
        ctx.strokeStyle=r.col+"33"; ctx.lineWidth=0.5; ctx.strokeRect(RX,ry-14,CW-RX-8,42);
        ctx.fillStyle=r.col; ctx.lineWidth=2;
        ctx.fillRect(RX,ry-14,3,42);
        ctx.fillStyle=r.col; ctx.font=`6px ${V.mono}`; ctx.textAlign="left";
        ctx.fillText(r.label,RX+7,ry);
        ctx.font=`bold 8px ${V.mono}`; ctx.fillText(r.val,RX+7,ry+13);
        ctx.fillStyle=V.dim; ctx.font=`5.5px ${V.mono}`; ctx.fillText(r.note,RX+7,ry+25);
      });

      /* Full moon purge indicator */
      const mpInd=moonPhase(frame*0.5);
      const mpY=RY+rows.length*46+30;
      ctx.fillStyle=V.dim; ctx.font=`6px ${V.mono}`; ctx.textAlign="left";
      ctx.fillText("MOON PHASE · MATERIAL PURGE CYCLE",RX,mpY);
      ctx.fillStyle="#1A2540"; ctx.fillRect(RX,mpY+8,CW-RX-8,14);
      ctx.fillStyle=isFullMoon?"#DDEEFF88":"#3A5070";
      ctx.fillRect(RX,mpY+8,Math.max(2,(CW-RX-8)*mpInd*2*(mpInd<0.5?1:1-(mpInd-0.5)*2)),14);
      ctx.fillStyle=isFullMoon?V.cyan:V.dim; ctx.font=`5.5px ${V.mono}`; ctx.textAlign="center";
      ctx.fillText(isFullMoon?"⟡ FULL MOON · PURGE":"phase: "+(mpInd*100).toFixed(0)+"%",RX+(CW-RX-8)/2,mpY+18);

      frame++; raf=requestAnimationFrame(draw);
    };
    draw();
    return()=>cancelAnimationFrame(raf);
  },[]);
  return <canvas ref={ref} style={{width:"100%",height:"500px",borderRadius:6,display:"block"}}/>;
}

/* ─────────────────────────────────────────────────────────────────────────
   CANVAS 2 · Quarks · Double Helix · Cut & Paste Enzymes
   ───────────────────────────────────────────────────────────────────────── */
function QuarkDNACanvas() {
  const ref=useRef<HTMLCanvasElement>(null);
  useEffect(()=>{
    const cv=ref.current; if(!cv) return;
    const CH=480, PR=window.devicePixelRatio||1;
    const CW=Math.max(cv.offsetWidth,520);
    cv.width=CW*PR; cv.height=CH*PR; cv.style.height=CH+"px";
    const ctx=cv.getContext("2d")!; ctx.scale(PR,PR);
    let frame=0, raf=0;

    /* Quark color charge */
    const QCOLS:{[k:string]:string}={"r":"#FF4444","g":"#44FF88","b":"#4488FF"};
    /* Gluon particles between quarks */
    const GLUONS:Array<{from:number;to:number;t:number;col:string}>=[];
    for(let i=0;i<12;i++){
      GLUONS.push({from:Math.floor(Math.random()*3),to:(Math.floor(Math.random()*3)+1)%3,
        t:Math.random(),col:Object.values(QCOLS)[Math.floor(Math.random()*3)]});
    }

    /* DNA strand parameters */
    const DNA_X=CW*0.52, DNA_TOP=30, DNA_H=CH-80;
    const DNA_W=50, RUNGS=22;
    /* Bases for display: simplified to A/T/G/C */
    const BASES:Array<[string,string,string,string]>=[
      ["G","G","A","A"],["A","A","T","T"],["A","A","T","T"],["T","T","A","A"],
      ["T","T","A","A"],["C","C","G","G"],["G","G","C","C"],["A","A","T","T"],
      ["A","A","T","T"],["T","T","A","A"],["C","C","G","G"],["G","G","C","C"],
    ];
    const BASE_COLS:{[k:string]:string}={"A":V.amb,"T":V.rose,"G":V.green,"C":V.cyan};

    /* Restriction enzyme cut site: EcoRI recognises G^AATTC */
    const CUT_RUNG=8;
    const BASE_PAIR_COLS:{[k:string]:string}={"AT":V.rose,"TA":V.rose,"GC":V.green,"CG":V.green};

    /* Enzyme state */
    let enzymePhase=0; /* 0=approach, 1=bind, 2=cut, 3=ligate, 4=reset */
    const EP_DUR=[80,60,100,80,80];

    const drawQuark=(cx:number,cy:number,r:number,label:string,charge:string,qcol:string,ccol:string)=>{
      const pulse=0.9+0.1*Math.sin(frame*0.08+cx*0.01);
      const grd=ctx.createRadialGradient(cx,cy,0,cx,cy,r*2);
      grd.addColorStop(0,qcol+"CC"); grd.addColorStop(0.5,qcol+"55"); grd.addColorStop(1,qcol+"00");
      ctx.fillStyle=grd; ctx.beginPath(); ctx.arc(cx,cy,r*2*pulse,0,TAU); ctx.fill();
      /* Quark body */
      ctx.fillStyle=qcol; ctx.beginPath(); ctx.arc(cx,cy,r*pulse,0,TAU); ctx.fill();
      /* Color charge dot */
      ctx.fillStyle=ccol; ctx.beginPath(); ctx.arc(cx+r*0.5,cy-r*0.5,r*0.28,0,TAU); ctx.fill();
      /* Labels */
      ctx.fillStyle=qcol; ctx.font=`bold 9px ${V.mono}`; ctx.textAlign="center";
      ctx.fillText(label,cx,cy+3);
      ctx.fillStyle=V.ink+"CC"; ctx.font=`7px ${V.mono}`;
      ctx.fillText(charge,cx,cy+r+13);
    };

    const draw=()=>{
      ctx.clearRect(0,0,CW,CH);
      const bg=ctx.createLinearGradient(0,0,CW,CH);
      bg.addColorStop(0,"#04060E"); bg.addColorStop(1,"#070A12");
      ctx.fillStyle=bg; ctx.fillRect(0,0,CW,CH);

      /* Enzyme phase management */
      const ep=Math.floor(frame/EP_DUR.reduce((a,b)=>a+b,0)*EP_DUR.reduce((a,b)=>a+b,0));
      const ef=frame%EP_DUR.reduce((a,b)=>a+b,0);
      let epPhase=0, acc2=0;
      for(let i=0;i<EP_DUR.length;i++){
        if(ef<acc2+EP_DUR[i]){ epPhase=i; break; }
        acc2+=EP_DUR[i];
      }
      enzymePhase=epPhase;

      /* ── LEFT: Quark Panel ── */
      const QCX=CW*0.19, QCY=210;
      /* Toggle proton/neutron */
      const isProton=Math.floor(frame/300)%2===0;
      const Q1={label:"u",charge:"+⅔",col:V.blue,   cc:QCOLS["r"]};
      const Q2={label:isProton?"u":"d",charge:isProton?"+⅔":"−⅓",col:isProton?V.blue:V.rose,cc:QCOLS["g"]};
      const Q3={label:"d",charge:"−⅓",col:V.rose,   cc:QCOLS["b"]};
      const quarks=[Q1,Q2,Q3];
      const qAngle=[(-Math.PI/2),(Math.PI/6),(5*Math.PI/6)];
      const QR=58;

      /* Confinement circle */
      const cong=ctx.createRadialGradient(QCX,QCY,0,QCX,QCY,QR+18);
      cong.addColorStop(0,"rgba(80,100,180,0.08)"); cong.addColorStop(1,"transparent");
      ctx.fillStyle=cong; ctx.beginPath(); ctx.arc(QCX,QCY,QR+18,0,TAU); ctx.fill();
      ctx.strokeStyle=V.dim+"66"; ctx.lineWidth=1; ctx.setLineDash([3,4]);
      ctx.beginPath(); ctx.arc(QCX,QCY,QR+18,0,TAU); ctx.stroke(); ctx.setLineDash([]);

      /* Gluon exchange lines */
      const qPos=quarks.map((_,i)=>({x:QCX+Math.cos(qAngle[i])*QR, y:QCY+Math.sin(qAngle[i])*QR}));
      GLUONS.forEach(g=>{
        g.t=(g.t+0.012)%1;
        const px=lerp(qPos[g.from].x,qPos[g.to].x,g.t)+Math.sin(g.t*Math.PI*3)*8;
        const py=lerp(qPos[g.from].y,qPos[g.to].y,g.t)+Math.cos(g.t*Math.PI*3)*8;
        ctx.fillStyle=g.col+"CC"; ctx.beginPath(); ctx.arc(px,py,2.2,0,TAU); ctx.fill();
        if(g.t<0.05||g.t>0.95){
          const ncol=Object.values(QCOLS)[Math.floor(Math.random()*3)];
          g.col=ncol; g.to=(g.from+1+Math.floor(Math.random()*2))%3;
        }
      });
      /* Gluon label */
      ctx.fillStyle=V.dim; ctx.font=`5.5px ${V.mono}`; ctx.textAlign="center";
      ctx.fillText("gluon exchange · color charge",QCX,QCY+QR+30);

      /* Draw quarks */
      quarks.forEach((q,i)=>{
        drawQuark(qPos[i].x,qPos[i].y,20,q.label,q.charge,q.col,q.cc);
      });

      /* Particle label */
      const totalCharge=isProton?"+1 (PROTON)":"0 (NEUTRON)";
      ctx.fillStyle=isProton?V.blue:V.cyan;
      ctx.font=`bold 8px ${V.mono}`; ctx.textAlign="center";
      ctx.fillText(totalCharge,QCX,QCY-QR-28);
      ctx.fillStyle=V.dim; ctx.font=`6.5px ${V.mono}`;
      ctx.fillText(isProton?"u + u + d":"u + d + d",QCX,QCY-QR-16);
      ctx.fillText(isProton?"+⅔ + ⅔ + (−⅓) = +1":"⅔ + (−⅓) + (−⅓) = 0",QCX,QCY-QR-5);

      /* Charge legend */
      const clY=QCY+QR+48;
      ctx.fillStyle=V.dim; ctx.font=`6px ${V.mono}`; ctx.textAlign="center";
      ctx.fillText("UP QUARK    +⅔    |    DOWN QUARK    −⅓",QCX,clY);
      ctx.fillStyle=V.blue; ctx.fillText("UP",QCX-58,clY);
      ctx.fillStyle=V.rose; ctx.fillText("DOWN",QCX+48,clY);

      /* Color charge legend */
      const ccY=clY+18;
      [["r","RED"],["g","GREEN"],["b","BLUE"]].forEach(([k,n],i)=>{
        ctx.fillStyle=QCOLS[k]; ctx.beginPath(); ctx.arc(QCX-44+i*42,ccY,5,0,TAU); ctx.fill();
        ctx.fillStyle=QCOLS[k]; ctx.font=`5.5px ${V.mono}`; ctx.textAlign="center";
        ctx.fillText(n,QCX-44+i*42,ccY+14);
      });
      ctx.fillStyle=V.dim; ctx.font=`5.5px ${V.mono}`; ctx.textAlign="center";
      ctx.fillText("CONFINEMENT: quarks never free · strong force",QCX,ccY+27);

      /* Nucleon size label */
      ctx.fillStyle=V.dim; ctx.font=`5px ${V.mono}`; ctx.textAlign="center";
      ctx.fillText("proton radius: 0.87 fm · 10⁻¹⁵ m",QCX,CH-14);

      /* ── RIGHT: DNA Double Helix ── */
      ctx.fillStyle=V.dim; ctx.font=`7px ${V.mono}`; ctx.textAlign="left";
      ctx.fillText("DNA DOUBLE HELIX · CUT & PASTE ENZYMES",DNA_X-8,18);

      const helixOff=frame*0.04;
      for(let ri=0;ri<RUNGS;ri++){
        const fy=DNA_TOP+10+(ri/(RUNGS-1))*(DNA_H);
        const ang=ri/RUNGS*TAU*2+helixOff;
        const lx=DNA_X+Math.cos(ang)*DNA_W;
        const rx=DNA_X+Math.cos(ang+Math.PI)*DNA_W;
        const isInFront=Math.cos(ang)>0;

        /* Backbone strands */
        const strandCol=isInFront?"#3A8888":"#224444";
        ctx.strokeStyle=strandCol; ctx.lineWidth=3;
        if(ri>0){
          const pfy=DNA_TOP+10+((ri-1)/(RUNGS-1))*DNA_H;
          const pang=(ri-1)/RUNGS*TAU*2+helixOff;
          ctx.beginPath();
          ctx.moveTo(DNA_X+Math.cos(pang)*DNA_W,pfy);
          ctx.lineTo(lx,fy); ctx.stroke();
          ctx.strokeStyle=isInFront?"#885588":"#443344";
          ctx.beginPath();
          ctx.moveTo(DNA_X+Math.cos(pang+Math.PI)*DNA_W,pfy);
          ctx.lineTo(rx,fy); ctx.stroke();
        }

        /* Base pair rung */
        const bIdx=ri%BASES.length;
        const b1=BASES[bIdx][0], b2=BASES[bIdx][2];
        const bCol=BASE_COLS[b1]||V.dim;

        /* Highlight cut site */
        const isCutSite=(ri===CUT_RUNG||ri===CUT_RUNG+1);
        const cutActive=enzymePhase>=1&&enzymePhase<=2;

        ctx.strokeStyle=isCutSite&&cutActive?V.shock+"AA":bCol+"66";
        ctx.lineWidth=isCutSite&&cutActive?2:1;
        /* Draw rung as two half-bars + bond */
        const rungMid=DNA_X;
        ctx.strokeStyle=bCol+(isCutSite&&cutActive?"FF":"55");
        ctx.lineWidth=isCutSite&&cutActive?2.5:1;
        ctx.beginPath(); ctx.moveTo(lx,fy); ctx.lineTo(rungMid-6,fy); ctx.stroke();
        ctx.strokeStyle=BASE_COLS[b2]+(isCutSite&&cutActive?"FF":"55");
        ctx.beginPath(); ctx.moveTo(rungMid+6,fy); ctx.lineTo(rx,fy); ctx.stroke();
        /* H-bond dots */
        const nBonds=(b1==="A"||b1==="T")?2:3;
        for(let h=0;h<nBonds;h++){
          const hx=rungMid-4+h*4;
          ctx.fillStyle=(isCutSite&&cutActive?V.shock:bCol)+"88";
          ctx.beginPath(); ctx.arc(hx,fy,1.2,0,TAU); ctx.fill();
        }
        /* Base labels */
        ctx.fillStyle=BASE_COLS[b1]; ctx.font=`6.5px ${V.mono}`; ctx.textAlign="center";
        ctx.fillText(b1,lx>rungMid?lx-10:lx+10,fy+3);
        ctx.fillStyle=BASE_COLS[b2];
        ctx.fillText(b2,rx>rungMid?rx-10:rx+10,fy+3);

        /* Deoxyribose sugar circles on backbone */
        ctx.fillStyle=strandCol; ctx.beginPath(); ctx.arc(lx,fy,3,0,TAU); ctx.fill();
        ctx.fillStyle="#885588"; ctx.beginPath(); ctx.arc(rx,fy,3,0,TAU); ctx.fill();
      }

      /* ── Restriction Enzyme (EcoRI) ── */
      const enzY=DNA_TOP+10+(CUT_RUNG/(RUNGS-1))*DNA_H;
      const enzX=DNA_X+DNA_W+28;

      /* Enzyme body */
      const enzApproach=enzymePhase===0?0.5+0.5*Math.sin(frame*0.04):1.0;
      const enzDist=enzymePhase===0?50-30*enzApproach:enzymePhase>=2?50+30*(enzymePhase-2)/2:0;

      ctx.fillStyle=V.shock+"22"; ctx.beginPath();
      ctx.ellipse(enzX+enzDist,enzY,22,14,0,0,TAU); ctx.fill();
      ctx.strokeStyle=V.shock+(enzymePhase===2?"FF":"88"); ctx.lineWidth=1.2;
      ctx.beginPath(); ctx.ellipse(enzX+enzDist,enzY,22,14,0,0,TAU); ctx.stroke();
      ctx.fillStyle=V.shock; ctx.font=`6px ${V.mono}`; ctx.textAlign="center";
      ctx.fillText("EcoRI",enzX+enzDist,enzY-3);
      ctx.fillText("G^AATTC",enzX+enzDist,enzY+8);

      /* Cut line (scissors) when phase=2 */
      if(enzymePhase===2){
        ctx.strokeStyle=V.shock; ctx.lineWidth=1.5;
        const cutY=DNA_TOP+10+(CUT_RUNG/(RUNGS-1))*DNA_H+8;
        ctx.setLineDash([2,2]);
        ctx.beginPath(); ctx.moveTo(DNA_X-DNA_W-20,cutY); ctx.lineTo(DNA_X+DNA_W+20,cutY); ctx.stroke();
        ctx.setLineDash([]);
        ctx.fillStyle=V.shock; ctx.font=`7px ${V.mono}`; ctx.textAlign="center";
        ctx.fillText("✂  RESTRICTION CUT",DNA_X,cutY-8);
        ctx.font=`5.5px ${V.mono}`;
        ctx.fillText("STICKY ENDS: 5′–AATT–3′",DNA_X,cutY+12);
      }

      /* Ligase (phase=3) */
      if(enzymePhase===3){
        const ligX=DNA_X-DNA_W-35;
        ctx.fillStyle=V.photon+"22"; ctx.beginPath();
        ctx.ellipse(ligX,enzY+15,18,12,0,0,TAU); ctx.fill();
        ctx.strokeStyle=V.photon; ctx.lineWidth=1;
        ctx.beginPath(); ctx.ellipse(ligX,enzY+15,18,12,0,0,TAU); ctx.stroke();
        ctx.fillStyle=V.photon; ctx.font=`6px ${V.mono}`; ctx.textAlign="center";
        ctx.fillText("LIGASE",ligX,enzY+15-3);
        ctx.fillText("ATP→AMP",ligX,enzY+15+8);
        ctx.fillStyle=V.photon; ctx.font=`5.5px ${V.mono}`;
        ctx.fillText("SEALING NICK",ligX,enzY+34);
      }

      /* Phase label */
      const phases=["APPROACH","BIND","RESTRICTION CUT","LIGATE","RELEASE"];
      const pCols=[V.dim,V.amb,V.shock,V.photon,V.green];
      ctx.fillStyle=pCols[enzymePhase]; ctx.font=`6.5px ${V.mono}`; ctx.textAlign="center";
      ctx.fillText("ENZYME STATE: "+phases[enzymePhase],DNA_X+30,CH-20);

      /* Nucleotide legend */
      const NLEG=[["A","ADENINE",V.amb],["T","THYMINE",V.rose],["G","GUANINE",V.green],["C","CYTOSINE",V.cyan]];
      NLEG.forEach(([b,n,c],i)=>{
        const nx=DNA_X-DNA_W-50+(i%2)*90, ny=(CH-75)+(Math.floor(i/2)*22);
        ctx.fillStyle=c as string; ctx.beginPath(); ctx.arc(nx,ny,5,0,TAU); ctx.fill();
        ctx.fillStyle=c as string; ctx.font=`5.5px ${V.mono}`; ctx.textAlign="left";
        ctx.fillText(`${b} = ${n}`,nx+8,ny+4);
      });

      frame++; raf=requestAnimationFrame(draw);
    };
    draw();
    return()=>cancelAnimationFrame(raf);
  },[]);
  return <canvas ref={ref} style={{width:"100%",height:"480px",borderRadius:6,display:"block"}}/>;
}

/* ─────────────────────────────────────────────────────────────────────────
   CANVAS 3 · Green Fluorescent Protein · Jellyfish · DNA Replication
   ───────────────────────────────────────────────────────────────────────── */
function GFPCanvas() {
  const ref=useRef<HTMLCanvasElement>(null);
  useEffect(()=>{
    const cv=ref.current; if(!cv) return;
    const CH=480, PR=window.devicePixelRatio||1;
    const CW=Math.max(cv.offsetWidth,520);
    cv.width=CW*PR; cv.height=CH*PR; cv.style.height=CH+"px";
    const ctx=cv.getContext("2d")!; ctx.scale(PR,PR);
    let frame=0, raf=0;

    /* GFP cells */
    type GCell={x:number;y:number;r:number;phase:number;brightness:number;dividing:boolean;divT:number};
    const CELLS:GCell[]=[{x:CW*0.77,y:200,r:18,phase:0,brightness:1,dividing:false,divT:0}];
    let lastCellDiv=0;

    /* Photon particles (UV excitation → green emission) */
    const PHOTONS:Array<{x:number;y:number;vx:number;vy:number;type:"in"|"out";age:number}>=[];
    const spawnPhotons=(cx:number,cy:number)=>{
      /* UV in: from left */
      for(let i=0;i<3;i++){
        PHOTONS.push({x:cx-80,y:cy+Math.random()*30-15,vx:3+Math.random(),vy:(Math.random()-0.5)*0.5,type:"in",age:0});
      }
    };

    /* Emission spectrum bars */
    const SPECTRUM=[
      {wl:395,label:"UV excite",col:"#9933FF",height:0.9},
      {wl:440,label:"minor",   col:"#4488FF",height:0.6},
      {wl:475,label:"blue exc",col:"#22CCFF",height:0.55},
      {wl:509,label:"peak emit",col:"#44FF88",height:1.0},
      {wl:540,label:"shoulder", col:"#88FF44",height:0.3},
    ];

    /* Beta-barrel strands (11 strands) */
    const BARREL_STRANDS=11;
    const BX=CW*0.30, BY=220, BR=38;

    const draw=()=>{
      ctx.clearRect(0,0,CW,CH);
      const bg=ctx.createLinearGradient(0,0,0,CH);
      bg.addColorStop(0,"#04060E"); bg.addColorStop(1,"#030810");
      ctx.fillStyle=bg; ctx.fillRect(0,0,CW,CH);

      /* ── LEFT: Aequorea victoria jellyfish ── */
      const JX=CW*0.11, JY=170;
      /* Bell body */
      const biolum=0.6+0.4*Math.abs(Math.sin(frame*0.04));
      const jGrd=ctx.createRadialGradient(JX,JY-20,0,JX,JY+10,75);
      jGrd.addColorStop(0,"rgba(180,255,220,0.08)");
      jGrd.addColorStop(0.6,"rgba(100,200,160,0.05)");
      jGrd.addColorStop(1,"rgba(0,180,120,0)");
      ctx.fillStyle=jGrd; ctx.beginPath(); ctx.arc(JX,JY,70,0,TAU); ctx.fill();
      /* Bell outline */
      ctx.strokeStyle=`rgba(80,200,160,${0.5+0.3*biolum})`; ctx.lineWidth=1.5;
      ctx.beginPath();
      ctx.moveTo(JX-50,JY+20);
      ctx.bezierCurveTo(JX-50,JY-60, JX+50,JY-60, JX+50,JY+20);
      ctx.bezierCurveTo(JX+40,JY+35, JX-40,JY+35, JX-50,JY+20);
      ctx.stroke();
      /* GFP-bearing rim (bioluminescent ring) */
      const rimGrd=ctx.createLinearGradient(JX-50,JY+20,JX+50,JY+20);
      rimGrd.addColorStop(0,"rgba(0,255,136,0)");
      rimGrd.addColorStop(0.3,`rgba(0,255,136,${biolum*0.9})`);
      rimGrd.addColorStop(0.7,`rgba(0,255,136,${biolum*0.9})`);
      rimGrd.addColorStop(1,"rgba(0,255,136,0)");
      ctx.strokeStyle=rimGrd; ctx.lineWidth=3;
      ctx.beginPath();
      ctx.moveTo(JX-50,JY+20);
      ctx.bezierCurveTo(JX-40,JY+35, JX+40,JY+35, JX+50,JY+20);
      ctx.stroke();
      /* Tentacles */
      for(let t=-3;t<=3;t++){
        const tx=JX+t*14;
        ctx.strokeStyle=`rgba(0,200,120,${0.3+0.2*Math.abs(Math.sin(frame*0.03+t))})`; ctx.lineWidth=0.8;
        ctx.beginPath(); ctx.moveTo(tx,JY+34);
        for(let y=0;y<60;y++){
          ctx.lineTo(tx+Math.sin(y*0.2+frame*0.04+t*1.2)*6,JY+34+y);
        }
        ctx.stroke();
      }
      /* Body details */
      ctx.fillStyle="rgba(0,255,136,0.3)"; ctx.beginPath(); ctx.arc(JX,JY-5,8,0,TAU); ctx.fill();
      ctx.strokeStyle="rgba(0,255,136,0.5)"; ctx.lineWidth=0.6;
      for(let r=1;r<=3;r++){
        ctx.beginPath(); ctx.arc(JX,JY,r*14,0,Math.PI); ctx.stroke();
      }
      ctx.fillStyle=V.photon; ctx.font=`6.5px ${V.mono}`; ctx.textAlign="center";
      ctx.fillText("Aequorea victoria",JX,JY+68);
      ctx.fillStyle=V.dim; ctx.font=`5.5px ${V.mono}`;
      ctx.fillText("Pacific jellyfish · GFP source",JX,JY+80);
      ctx.fillText("Nobel Prize 2008",JX,JY+91);
      ctx.fillText("Shimomura · Chalfie · Tsien",JX,JY+102);

      /* Photon emission from jellyfish rim → GFP barrel */
      if(frame%60===0) spawnPhotons(BX-BR-20,BY);

      /* ── CENTER: GFP Beta-Barrel Structure ── */
      ctx.fillStyle=V.dim; ctx.font=`7px ${V.mono}`; ctx.textAlign="center";
      ctx.fillText("GFP β-BARREL · 11 STRANDS · CHROMOPHORE CORE",BX,BY-BR-30);

      /* Draw 11-strand beta-barrel */
      for(let s=0;s<BARREL_STRANDS;s++){
        const a1=s/BARREL_STRANDS*TAU, a2=(s+0.6)/BARREL_STRANDS*TAU;
        const stripe=s%2===0?"#1A4030":"#0E2820";
        ctx.fillStyle=stripe;
        ctx.beginPath();
        ctx.moveTo(BX+Math.cos(a1)*BR,BY-35);
        ctx.lineTo(BX+Math.cos(a1)*BR,BY+35);
        ctx.lineTo(BX+Math.cos(a2)*BR,BY+35);
        ctx.lineTo(BX+Math.cos(a2)*BR,BY-35);
        ctx.closePath(); ctx.fill();
        /* Beta-strand arrow lines */
        ctx.strokeStyle=V.photon+"44"; ctx.lineWidth=0.6;
        ctx.beginPath();
        ctx.moveTo(BX+Math.cos((a1+a2)/2)*BR,BY-30);
        ctx.lineTo(BX+Math.cos((a1+a2)/2)*BR,BY+30);
        ctx.stroke();
      }
      /* Outer barrel ring */
      ctx.strokeStyle=V.photon+"88"; ctx.lineWidth=1.5;
      ctx.beginPath(); ctx.arc(BX,BY,BR,0,TAU); ctx.stroke();
      ctx.strokeStyle=V.photon+"33"; ctx.lineWidth=0.5;
      ctx.beginPath(); ctx.arc(BX,BY,BR-6,0,TAU); ctx.stroke();

      /* Central alpha-helix (vertical) */
      ctx.strokeStyle=V.photon+"55"; ctx.lineWidth=2;
      ctx.beginPath();
      for(let y=-28;y<=28;y+=2){
        const hx=BX+Math.sin(y*0.5)*4;
        if(y===-28) ctx.moveTo(hx,BY+y); else ctx.lineTo(hx,BY+y);
      }
      ctx.stroke();

      /* Chromophore (Ser65-Tyr66-Gly67) */
      const chromPhase=(frame*0.06)%TAU;
      const chromBright=0.6+0.4*Math.sin(chromPhase);
      const cg=ctx.createRadialGradient(BX,BY,0,BX,BY,16);
      cg.addColorStop(0,`rgba(0,255,136,${chromBright})`);
      cg.addColorStop(0.5,`rgba(0,255,136,${chromBright*0.5})`);
      cg.addColorStop(1,"transparent");
      ctx.fillStyle=cg; ctx.beginPath(); ctx.arc(BX,BY,16,0,TAU); ctx.fill();
      ctx.fillStyle=V.photon; ctx.beginPath(); ctx.arc(BX,BY,5,0,TAU); ctx.fill();
      ctx.fillStyle=V.photon; ctx.font=`5.5px ${V.mono}`; ctx.textAlign="center";
      ctx.fillText("Ser65-Tyr66-Gly67",BX,BY+BR+14);
      ctx.fillText("CHROMOPHORE",BX,BY+BR+25);

      /* Photon particles */
      PHOTONS.forEach((p,i)=>{
        p.x+=p.vx; p.y+=p.vy; p.age++;
        /* UV photon hits barrel: convert to green emission */
        if(p.type==="in"&&Math.abs(p.x-BX)<BR&&Math.abs(p.y-BY)<36){
          p.type="out"; p.vx=-p.vx*0.8; p.vy=-0.5-Math.random(); p.age=0;
        }
        if(p.age>120||(p.type==="out"&&p.y<-20)){ PHOTONS.splice(i,1); return; }
        ctx.fillStyle=p.type==="in"?"#9933FF":"#00FF88";
        ctx.beginPath(); ctx.arc(p.x,p.y,2.5,0,TAU); ctx.fill();
        if(p.type==="out"){
          ctx.strokeStyle="#00FF8844"; ctx.lineWidth=0.8;
          ctx.beginPath(); ctx.arc(p.x,p.y,5+p.age*0.1,0,TAU); ctx.stroke();
        }
      });

      /* Arrow labels */
      ctx.fillStyle="#9933FF"; ctx.font=`5.5px ${V.mono}`; ctx.textAlign="center";
      ctx.fillText("→ UV excitation",BX-BR-25,BY-15);
      ctx.fillText("395 / 475 nm",BX-BR-25,BY-5);
      ctx.fillStyle=V.photon;
      ctx.fillText("↑ GREEN emission",BX+BR+28,BY-30);
      ctx.fillText("509 nm",BX+BR+28,BY-20);

      /* ── RIGHT: Emission Spectrum + GFP Cells ── */
      const SX=CW*0.56, SY=30, SW=CW*0.16, SH=130;
      ctx.fillStyle=V.dim; ctx.font=`7px ${V.mono}`; ctx.textAlign="left";
      ctx.fillText("EXCITATION / EMISSION",SX,SY);
      ctx.fillText("SPECTRUM",SX,SY+11);

      SPECTRUM.forEach((s,i)=>{
        const bx=SX+i*(SW/SPECTRUM.length+3), bh=SH*s.height;
        const sg=ctx.createLinearGradient(0,SY+30+SH,0,SY+30+SH-bh);
        sg.addColorStop(0,s.col+"88"); sg.addColorStop(1,s.col+"CC");
        ctx.fillStyle=sg; ctx.fillRect(bx,SY+30+SH-bh,(SW/SPECTRUM.length),bh);
        ctx.strokeStyle=s.col+"44"; ctx.lineWidth=0.5; ctx.strokeRect(bx,SY+30+SH-bh,(SW/SPECTRUM.length),bh);
        ctx.fillStyle=s.col; ctx.font=`5px ${V.mono}`; ctx.textAlign="center";
        ctx.fillText(s.wl+"nm",bx+(SW/SPECTRUM.length)/2,SY+30+SH+10);
        if(s.wl===509){
          ctx.fillStyle=V.photon; ctx.fillText("★ PEAK",bx+(SW/SPECTRUM.length)/2,SY+30+SH-bh-6);
        }
      });

      /* DNA Replication panel */
      const DRY=SY+SH+55;
      ctx.fillStyle=V.dim; ctx.font=`7px ${V.mono}`; ctx.textAlign="left";
      ctx.fillText("DNA REPLICATION · REPLACE & DIVIDE",SX,DRY);

      const steps=[
        {label:"HELICASE unwinds",col:V.amb,   icon:"⊕"},
        {label:"PRIMASE: RNA primer",col:V.vio,   icon:"→"},
        {label:"DNA POL III synth",col:V.blue,  icon:"⬡"},
        {label:"LIGASE seals nicks",col:V.photon,icon:"○"},
        {label:"2× identical copies",col:V.green,icon:"✓"},
      ];
      steps.forEach((s,i)=>{
        const sy2=DRY+18+i*34;
        const phaseActive=Math.floor(frame/55)%steps.length===i;
        ctx.fillStyle=s.col+(phaseActive?"22":"0A"); ctx.fillRect(SX,sy2-12,CW-SX-8,30);
        ctx.strokeStyle=s.col+(phaseActive?"88":"22"); ctx.lineWidth=0.5;
        ctx.strokeRect(SX,sy2-12,CW-SX-8,30);
        ctx.fillStyle=s.col; ctx.font=`${phaseActive?7:6}px ${V.mono}`; ctx.textAlign="left";
        ctx.fillText(s.icon+" "+s.label,SX+5,sy2+4);
        if(phaseActive){
          ctx.fillStyle=s.col+"44";
          ctx.beginPath(); ctx.arc(CW-20,sy2-2,5,0,TAU); ctx.fill();
        }
      });

      /* Nucleotide components diagram */
      const NCY=DRY+steps.length*34+28;
      ctx.fillStyle=V.dim; ctx.font=`6.5px ${V.mono}`; ctx.textAlign="left";
      ctx.fillText("NUCLEOTIDE = PHOSPHATE + DEOXYRIBOSE + BASE",SX,NCY);
      const parts=[
        {label:"PO₄³⁻",col:V.plasma,x:SX+20,note:"phosphate"},
        {label:"C₅H₁₀O₃",col:V.amb,  x:SX+80, note:"deoxyribose"},
        {label:"A/T/G/C",col:V.green,x:SX+155,note:"nitrogenous base"},
      ];
      parts.forEach(p=>{
        const py=NCY+16;
        ctx.fillStyle=p.col+"22"; ctx.fillRect(p.x-14,py-10,52,28);
        ctx.strokeStyle=p.col+"44"; ctx.lineWidth=0.5; ctx.strokeRect(p.x-14,py-10,52,28);
        ctx.fillStyle=p.col; ctx.font=`6px ${V.mono}`; ctx.textAlign="center";
        ctx.fillText(p.label,p.x+12,py+2);
        ctx.fillStyle=V.dim; ctx.font=`5px ${V.mono}`;
        ctx.fillText(p.note,p.x+12,py+13);
        if(p.x<SX+155) { ctx.fillStyle=V.dim; ctx.font=`7px ${V.mono}`; ctx.fillText("+",p.x+40,py+2); }
      });

      /* GFP Cells */
      const GCY=NCY+58;
      ctx.fillStyle=V.dim; ctx.font=`7px ${V.mono}`; ctx.textAlign="left";
      ctx.fillText("GFP-TAGGED CELLS UNDER UV",SX,GCY);

      if(frame-lastCellDiv>120&&CELLS.length<8){
        const parent=CELLS[Math.floor(Math.random()*CELLS.length)];
        const a=Math.random()*TAU;
        CELLS.push({x:parent.x+Math.cos(a)*26,y:parent.y+Math.sin(a)*26,
          r:12,phase:0,brightness:Math.random()*0.4+0.6,dividing:false,divT:0});
        lastCellDiv=frame;
      }
      CELLS.forEach(cell=>{
        cell.phase=(cell.phase+2)%360;
        const b=cell.brightness*(0.8+0.2*Math.sin(cell.phase*0.06));
        const cellX=Math.max(SX+20,Math.min(CW-20,cell.x));
        const cellY=Math.max(GCY+10,Math.min(CH-20,cell.y));
        /* GFP glow */
        const glow=ctx.createRadialGradient(cellX,cellY,0,cellX,cellY,cell.r*2.5);
        glow.addColorStop(0,`rgba(0,255,136,${b*0.7})`);
        glow.addColorStop(1,"transparent");
        ctx.fillStyle=glow; ctx.beginPath(); ctx.arc(cellX,cellY,cell.r*2.5,0,TAU); ctx.fill();
        /* Cell body */
        ctx.fillStyle=`rgba(0,${Math.floor(160+b*95)},${Math.floor(80+b*56)},0.7)`;
        ctx.beginPath(); ctx.arc(cellX,cellY,cell.r,0,TAU); ctx.fill();
        /* Nucleus (GFP-tagged) */
        ctx.fillStyle=`rgba(0,255,136,${b*0.9})`;
        ctx.beginPath(); ctx.arc(cellX,cellY,cell.r*0.45,0,TAU); ctx.fill();
        /* Cell membrane */
        ctx.strokeStyle=`rgba(0,255,136,${b*0.6})`; ctx.lineWidth=0.8;
        ctx.beginPath(); ctx.arc(cellX,cellY,cell.r,0,TAU); ctx.stroke();
      });

      frame++; raf=requestAnimationFrame(draw);
    };
    draw();
    return()=>cancelAnimationFrame(raf);
  },[]);
  return <canvas ref={ref} style={{width:"100%",height:"480px",borderRadius:6,display:"block"}}/>;
}

/* ─────────────────────────────────────────────────────────────────────────
   PAGE
   ───────────────────────────────────────────────────────────────────────── */
export default function MayaQuarksDnaGfpPage() {
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
        {[badge("LIVE SIMULATION"),badge("MAYA ASTRONOMY",V.gold),badge("SEVEN SYSTEMS",V.amb),
          badge("FULL MOON PURGE",V.cyan),badge("COSMIC PAUSE",V.vio),badge("QUARKS",V.blue),
          badge("DOUBLE HELIX",V.green),badge("CUT & PASTE ENZYMES",V.rose),badge("GFP",V.photon)]}
        <h1 style={{fontFamily:V.disp,fontSize:"clamp(1.4rem,4vw,2.6rem)",color:V.ink,
          margin:"22px 0 8px",letterSpacing:"0.06em",fontWeight:400,lineHeight:1.2}}>
          MAYA SEVEN SYSTEMS · QUARKS · DNA · GREEN FLUORESCENT PROTEIN
        </h1>
        <p style={{fontFamily:V.mono,fontSize:"0.58rem",color:V.dim,letterSpacing:3,margin:"0 0 22px"}}>
          COSMIC PAUSE POINTS · UP/DOWN QUARK CHARGE · RESTRICTION ENZYMES · NUCLEOTIDE REPLACEMENT · JELLYFISH GFP
        </p>
        {P("The Maya did not separate astronomy from biology from sacred time — they were one system. Their seven tracked celestial bodies (Sun, Moon, Venus, Mars, Mercury, Jupiter, Saturn) each governed a layer of reality: the solar cycle seeded the agricultural calendar, the lunar cycle governed menstrual and tidal rhythms, Venus determined the timing of warfare and ceremony, Saturn's conjunction with the World Tree (Wakah Chan) marked moments of cosmic axis alignment. These 'cosmic pause points' — solar eclipses, Venus transits, full moon purge ceremonies, Saturn oppositions — were understood as moments when the veil between worlds thinned and material reality could be purged or reset. The full moon, specifically, triggered elaborate bloodletting and fasting rituals among Maya nobility, understood as a physical purge of material impurities aligned with the moon's gravitational pull on body fluids. The Dresden Codex lunar table achieves a precision of 29.5302 days against the modern value of 29.530589 days — an error of 0.00039 days over 405 lunar months, accumulated over centuries of naked-eye observation.")}
        {P("The scale shift from Maya celestial observation to the quark is 10⁴⁰ — from the galactic to the subatomic. Yet the mathematics is the same: charge arithmetic, cyclic periods, conservation laws. The proton (two up quarks + one down quark: +⅔ + ⅔ − ⅓ = +1) and neutron (one up + two down: +⅔ − ⅓ − ⅓ = 0) are bound by the same strong force that confines color charge — red + green + blue = white/colorless, always. The DNA double helix that carries the Maya descendants' genetic information is cut and pasted by restriction enzymes using the same logic: recognition sequences (GAATTC for EcoRI), precise cut sites, sticky-end complementarity, and ligation by ATP-powered ligase. Green Fluorescent Protein from Aequorea victoria, the Pacific jellyfish, gave biologists their first molecular flashlight — the ability to tag any protein with a glowing beacon and watch it move through living cells in real time. The thread from Maya celestial observation to quark charge to DNA restriction enzymes to GFP-tagged protein localisation is the thread of human knowledge across scale.")}
      </div>

      {sec("01","Maya Seven Systems · Full Moon Material Purge · Cosmic Pause Points",V.gold,<>
        {P("The seven celestial bodies that the Maya tracked — K'in (Sun), Ik' (Moon), Chak Ek' (Venus, the Great Star), Buluk Ch'ab (Mars), Lahun Chan (Mercury), Xaman Ek' (Jupiter), and Wakah Chan (Saturn, also the World Tree) — each had a Dresden Codex table, a sequence of synodic period corrections, and a corresponding deity governing specific realms of earthly life. The Dresden Codex Venus table, arguably the most sophisticated astronomical computation preserved from any pre-Columbian civilization, gives the synodic period of Venus as 584 days — compared to the modern value of 583.92 days — and correctly predicts the great Venus cycle: 8 solar years = 5 Venus synodic periods = 2,920 days, after which Venus returns to exactly the same position against the sun on the same date of the solar calendar. The Maya used this to schedule major political events, warfare, and human sacrifice: inferior conjunction of Venus (when Venus is between Earth and Sun, briefly invisible) was a 'death' moment that required bloodletting to sustain Venus's rebirth as morning star.")}
        {P("The full moon material purge was the most physically enacted of the Maya cosmic pause points. K'awil (the lightning deity) and Ix Chel (the moon goddess) were invoked during full moon rituals in which rulers performed auto-sacrifice — drawing blood from the tongue, earlobes, or genitals using obsidian blades or stingray spines — and cast the blood-soaked paper into fire, sending material offerings (blood = most precious material = life-force = ch'ulel/soul substance) into the spirit realm at the moment of maximum lunar gravity. Modern biology confirms the material reality underneath the ceremonial layer: the full moon does exert measurable gravitational tidal effects on interstitial fluid and possibly on cellular membrane tension, though evidence for behavioural effects in humans remains contested. The Moon's gravitational pull drives Earth's tides — a differential of ~0.05 mm/s² between the near and far sides of the Earth. Cosmic pause points — eclipses, transits, planetary conjunctions — were the moments when multiple celestial periods aligned, compressing multiple governance domains into a single astronomical event. The Maya Long Count calendar (5,125-year Great Cycle) is itself a cosmic pause point: the transition from one creation cycle to another on 21 December 2012 (13.0.0.0.0 in Long Count).")}
        <div style={{border:`1px solid ${V.dim}44`,borderRadius:8,padding:2,marginBottom:14}}>
          <MayaSevenCanvas/>
        </div>
        {cards([
          {h:"DRESDEN CODEX",       col:V.gold,  d:"Oldest surviving Maya book (pre-Columbian). Contains: Venus table (584-day synodic cycle), lunar eclipse table (405 months = 11,960 days), multiplication table of 2–13 in 78, flood prophecy. Stored in Dresden State Library since 1739. Written ~1200–1250 CE but based on astronomical records dating to ~900 CE. 74 pages of bark paper coated in lime."},
          {h:"VENUS TABLE PRECISION",col:"#FFFAAA",d:"584.0000 days (Maya) vs 583.92 days (modern). Error: 0.08d over one cycle. Correction factor built in: every 301 Venus cycles, Maya subtracted 4 days to resynchronise with actual Venus. Over 384 years, the accumulated error = 4 days — corrected in one ceremonial 'day-drop.' Equivalent to our leap year system but for a 584-day planet."},
          {h:"TZOLK'IN 260-DAY",    col:V.amb,   d:"Sacred calendar: 13 numbers × 20 named days. No known astronomical basis — may encode human gestation (~266 days), maize growing season, or both. Combined with 365-day Haab: Calendar Round = 52 years before any given date repeats. No zero-date — cycles repeat, never end. Tzolk'in days still used by Quiché Maya daykeepers (Aj Q'ij) for divination today."},
          {h:"FULL MOON PHYSIOLOGY",col:V.cyan,  d:"Lunar gravitational differential across Earth: 1.12 × 10⁻⁶ g. Tidal effect on body fluids: 0.0001 mm displacement (undetectable). Moon historically linked to: menstrual cycle (29.5d period ≈ lunar month), sleep patterns (meta-analysis 2021: 30 min less deep sleep at full moon), coral spawning (mass synchronised release within hours of full moon). Maya material purge: culturally amplified response to subtle biological signal."},
          {h:"SATURN · WORLD TREE",  col:"#88AACC",d:"Wakah Chan ('six-sky' / World Tree): cosmic axis connecting underworld, earth, and sky. Saturn at opposition (closest, brightest) = World Tree fully erected = cosmic access point open. Milky Way = World Tree made visible. Maya sacrificial rituals timed to Saturn opposition dates for maximum 'cosmic aperture.' Saturn's 29.46-year orbital period = generational marker — roughly one human generation."},
          {h:"ECLIPSE PREDICTION",   col:V.plasma,d:"Saros cycle: 18yr 11d 8hr — after which Earth-Moon-Sun geometry repeats. Maya equivalent: 405 lunations = 11,960 days = 46 Tzolk'in × 260. After 11,960 days, both the Tzolk'in sacred count and the lunar cycle return to the same position. Eclipse table in Dresden Codex predicts eclipses by identifying dangerous moon-at-node positions. Error vs modern: <1 day over 33 years."},
        ])}
      </>)}

      {sec("02","Up Quark +⅔ · Down Quark −⅓ · Double Helix · Cut & Paste Restriction Enzymes",V.blue,<>
        {P("Quarks are the elementary constituents of protons and neutrons, bound by the strong nuclear force mediated by gluons. There are six quark flavours — up, down, charm, strange, top, bottom — but ordinary matter consists exclusively of up quarks (charge +2/3 of the elementary charge e) and down quarks (charge −1/3 e). The proton contains two up quarks and one down quark: total charge = +2/3 + 2/3 − 1/3 = +1e. The neutron contains one up quark and two down quarks: total charge = +2/3 − 1/3 − 1/3 = 0. This asymmetry — the neutron having zero charge despite being made of charged quarks — is the reason neutrons can penetrate matter without electromagnetic deflection, making neutron scattering one of the most powerful tools for probing crystal and molecular structure. Quarks also carry 'color charge' (named by analogy, not actual colour) — red, green, or blue — and the confinement principle of quantum chromodynamics (QCD) requires that all observable particles be 'colorless' (white): baryons like the proton combine red + green + blue quarks; mesons combine a colored quark with its anticolor. No free quark has ever been observed — attempting to separate quarks generates enough energy to create new quark-antiquark pairs from the vacuum before the quarks can be isolated.")}
        {P("The DNA double helix carries the genetic information of every organism that has ever lived on Earth, including the Maya astronomers who compiled the Dresden Codex. Its structure — discovered by Watson and Crick in 1953 using Franklin and Wilkins' X-ray crystallography data — is a right-handed anti-parallel double helix with a major groove (width 22 Å, depth 8.5 Å) and a minor groove (width 12 Å, depth 7.5 Å). The base pairing rules (A-T via 2 hydrogen bonds, G-C via 3 hydrogen bonds) are the information-storage mechanism: each strand is the complement of the other, enabling semi-conservative replication. Restriction enzymes are the cell's own 'cut and paste' tools: type II restriction endonucleases (the most useful for molecular biology) recognise specific palindromic sequences (EcoRI: GAATTC, BamHI: GGATCC, HindIII: AAGCTT) and cut both strands at defined positions. EcoRI cuts between G and AATTC on each strand, leaving 4-nucleotide 5′-AATT single-stranded overhangs ('sticky ends') that are complementary — they spontaneously base-pair with any other EcoRI-cut fragment, and DNA ligase seals the nick using ATP hydrolysis. This 'cut and paste' system is the basis of all recombinant DNA technology: restriction enzyme + gel electrophoresis + ligation = the ability to insert any gene into any genome.")}
        <div style={{border:`1px solid ${V.dim}44`,borderRadius:8,padding:2,marginBottom:14}}>
          <QuarkDNACanvas/>
        </div>
        {cards([
          {h:"QUARK CONFINEMENT",    col:V.blue,  d:"QCD (quantum chromodynamics) confinement: the strong force does not weaken with distance (unlike gravity and electromagnetism). Energy in the color field between separating quarks grows linearly with distance (~1 GeV/fm). At ~1 fm, the field energy exceeds the rest mass energy of a quark-antiquark pair → pair production. Result: quarks are permanently confined. Only observed in quark-gluon plasma above T > 10¹² K."},
          {h:"PROTON NEUTRON MASS",  col:V.cyan,  d:"Proton: 938.272 MeV/c². Neutron: 939.565 MeV/c². Neutron heavier by 1.293 MeV — enough that free neutrons decay: n → p + e⁻ + ν̄_e (half-life 611 seconds). Quark masses: u = 2.3 MeV/c², d = 4.8 MeV/c². But proton mass = 938 MeV: >99% of mass comes from gluon field energy (E=mc²), not quark rest mass. Ordinary matter is mostly gluon field."},
          {h:"WATSON-CRICK 1953",    col:V.green, d:"Nature, 25 April 1953, 171:737-738. 900 words. 'It has not escaped our notice that the specific pairing we have postulated immediately suggests a possible copying mechanism for the genetic material.' Based on: Rosalind Franklin's Photo 51 (B-form DNA, 3.4 Å rise/base pair, 34 Å helix pitch) and Chargaff's rules (A=T, G=C in any DNA sample). Nobel 1962: Watson, Crick, Wilkins. Franklin died 1958 — Nobel not awarded posthumously."},
          {h:"ECORI MECHANISM",      col:V.rose,  d:"EcoRI: Type II restriction endonuclease from E. coli RY13. Recognition: 5′–GAATTC–3′. Cut: between G and A on each strand → 5′-AATT overhang (4-nt sticky end). Cuts both strands simultaneously (no 'nick' intermediate). Requires Mg²⁺ cofactor. Km for recognition: ~10⁻⁹ M. Discrimination against non-target sequences: 10⁶-fold. Protects host DNA via methylation of GAATTC (EcoRI methylase adds CH₃ to A in GAATTC)."},
          {h:"DNA LIGASE · ATP",     col:V.photon,d:"T4 DNA ligase (most common laboratory use): seals 3′-OH to 5′-phosphate nicks. Mechanism: Lys residue + ATP → ligase-AMP intermediate → attack on 5′-phosphate → adenylated nick → AMP released + phosphodiester bond formed. Requires: nicked/gapped DNA, ATP (eukaryotes/T4) or NAD⁺ (bacteria). Fails on blunt ends unless PEG or high concentration. Fidelity: catalyses only complementary strand sealing."},
          {h:"SEMI-CONSERVATIVE REP",col:V.amb,   d:"Meselson-Stahl experiment 1958 (E. coli grown in ¹⁵N then shifted to ¹⁴N): proved semi-conservative replication. Each daughter cell gets one parental strand + one new strand. Rate: E. coli replicates 4.6 Mb genome in 40 min → ~2,300 bp/sec per replication fork. Human: 6 Gb replicated in 8 hr from ~50,000 origins of replication simultaneously. DNA Pol III error rate: 1 in 10¹⁰ (including proofreading)."},
        ])}
      </>)}

      {sec("03","Green Fluorescent Protein · Aequorea victoria · Jellyfish Bioluminescence · Nucleotide Replacement",V.photon,<>
        {P("Green Fluorescent Protein (GFP) was discovered in the bioluminescent jellyfish Aequorea victoria by Osamu Shimomura in 1962, who isolated it while studying the separate bioluminescent protein aequorin. Shimomura noticed that while aequorin emitted blue light (470 nm) when calcium bound, the intact jellyfish produced green light (509 nm) — implying a second protein absorbing the blue and re-emitting green. This energy transfer protein (GFP) proved to be a standalone fluorophore: it could absorb ultraviolet light (excitation peak at 395 nm, secondary peak at 475 nm) and emit green (emission peak 509 nm) without any cofactors, substrates, or additional proteins from the jellyfish. The chromophore — the light-absorbing structure — forms spontaneously from three amino acids in the middle of the GFP polypeptide chain: Serine-65, Tyrosine-66, and Glycine-67 undergo an autocatalytic cyclization and oxidation reaction requiring only molecular oxygen. The resulting imidazolinone ring with the Tyr66 phenol is the chromophore, encased in an 11-strand beta-barrel that protects it from the aqueous environment and tunes its spectral properties. The barrel is the key: GFP from a denatured (unfolded) protein does not fluoresce — the beta-barrel scaffold is essential for chromophore maturation and spectral tuning.")}
        {P("Martin Chalfie's 1994 paper demonstrated what made GFP revolutionary: the GFP gene could be fused to any other gene, expressed in any organism, and would produce a glowing tag on any protein — no addition of substrate, no injection of dye, no fixation required — just shine UV light and watch the green glow. Roger Tsien extended GFP into a family of colours by engineering the chromophore environment: ECFP (cyan, 476 nm emission), EYFP (yellow, 527 nm), mCherry (red, 610 nm, derived from coral DsRed), mKate (far-red, 633 nm). This palette enabled FRET (Förster Resonance Energy Transfer): when two proteins labelled with donor/acceptor GFP variants come within ~10 nm of each other, energy transfers from donor to acceptor, changing the emission colour — a direct molecular ruler for protein-protein interactions inside living cells. The GFP revolution is inseparable from the DNA replication machinery that allows the gfp gene to be replicated and expressed in heterologous hosts: helicase unwinds the double helix at the replication fork, primase lays RNA primers, DNA Polymerase III synthesises the new strand by adding complementary nucleotides (A pairs with T, G pairs with C) in the 5′→3′ direction, ligase seals the Okazaki fragment nicks on the lagging strand, and the result is two identical copies of the gfp gene, expressed in every daughter cell.")}
        <div style={{border:`1px solid ${V.dim}44`,borderRadius:8,padding:2,marginBottom:14}}>
          <GFPCanvas/>
        </div>
        {cards([
          {h:"GFP BETA-BARREL",      col:V.photon,d:"11 antiparallel beta-strands forming a barrel (diameter ~24 Å, height ~42 Å). Central alpha-helix carries the chromophore Ser65-Tyr66-Gly67. Chromophore formation: peptide bond cyclisation → dehydration → oxidation (O₂ required, takes 1–4 hr at 37°C). Once formed, chromophore is rigidly held by barrel — minimises vibrational quenching. Quantum yield: 0.79 (wild-type GFP = ~80% of absorbed photons re-emitted)."},
          {h:"SHIMOMURA 1962",        col:V.green, d:"Osamu Shimomura isolated GFP from 10,000 jellyfish in Puget Sound, WA. Published 1962 in Journal of Cellular and Comparative Physiology. Note: 'We discovered… a protein that gives a bright greenish fluorescence when exposed to ultraviolet light.' No interest from scientific community for 30 years. Chalfie expressed gfp in C. elegans (1994): 10,000 citations. Nobel Chemistry 2008: Shimomura, Chalfie, Tsien."},
          {h:"GFP COLOUR VARIANTS",   col:V.cyan,  d:"EBFP: blue, 440 nm. ECFP: cyan, 476 nm. EGFP: enhanced green, 509 nm (F64L/S65T mutations: 35× brighter than wtGFP). EYFP: yellow, 527 nm. mOrange: 562 nm. mCherry: 610 nm (from Discosoma sp. DsRed, engineered by Tsien). iRFP: near-infrared 713 nm (from bacterial phytochrome). Enables multicolour imaging: 3–5 proteins tracked simultaneously in one living cell."},
          {h:"FRET MOLECULAR RULER",  col:V.gold,  d:"Förster Resonance Energy Transfer: non-radiative dipole-dipole energy transfer from donor to acceptor fluorophore. Rate ∝ 1/r⁶ (r = distance). R₀ (Förster radius, 50% transfer efficiency): ~5–10 nm for GFP pairs. Used to measure: protein-protein interactions, conformational changes, enzyme activity (FRET decrease = cleavage), ligand binding. Resolution 1–10 nm — far below optical diffraction limit."},
          {h:"DNA POLYMERASE III",    col:V.blue,  d:"E. coli Pol III: 900 kDa complex, 10 subunits. Speed: 1,000 nt/sec. Fidelity: 1 error per 10⁷ nt (pre-proofreading) → 1 per 10¹⁰ (post-proofreading via 3′→5′ exonuclease). Human Pol ε (leading strand): 100 nt/sec. Nucleotide selection: correct dNTP binds ~1,000× faster than incorrect; correct triggers conformational change that positions catalytic Mg²⁺; incorrect dNTP dissociates before chemistry occurs."},
          {h:"GFP IN MEDICINE",       col:V.rose,  d:"Applications: cancer cell tracking (GFP-tagged tumour cells in mouse models), viral replication (GFP-tagged HIV shows budding in real time), stem cell differentiation (Oct4-GFP reporter = pluripotency indicator), CRISPR visualisation (dCas9-GFP shows genome editing in living cells), neuroscience (Brainbow: 90+ neurons simultaneously tagged with different GFP variants via Cre-mediated stochastic recombination)."},
        ])}
      </>)}

      {sec("04","Convergence · From Cosmos to Chromophore · One Scale",V.vio,<>
        {P("The Maya astronomer watching Venus rise as morning star after inferior conjunction is observing the same universe as the structural biologist watching GFP fluoresce under UV in a living cancer cell — both are tracking transformations across cycles, both are reading information encoded in geometric relationships (orbital resonance vs molecular orbital), both are using the observation to time interventions (ritual purge vs drug administration). The quark arithmetic (+⅔ + ⅔ − ⅓ = +1) that governs the charge of the proton in every atom of the Maya's obsidian sacrifice blade is the same arithmetic that governs the charge of the phosphate backbone of the DNA double helix being cut by EcoRI in a molecular biology laboratory. The GFP chromophore that glows in the Pacific jellyfish was discovered because Shimomura was curious about a protein that evolution had spent 100 million years perfecting — and that curiosity gave every biologist alive today the ability to see proteins move inside living cells without disturbing them. This is the AETHER coherence: knowledge is one system.")}
        {P("The AETHER thread now extends to the very structure of matter itself. Quarks → protons/neutrons → atoms → molecules → DNA → genes (gfp) → proteins (GFP) → cells (GFP-tagged) → organisms (Aequorea victoria) → ecosystems (Pacific coast jellyfish populations) → Maya astronomical observation (coastal civilisations tracking Venus from Pacific coasts) → Long Count calendar → cosmic pause points. Every scale is present. The restriction enzyme that cuts DNA is also the metaphor for the cosmic pause point: a recognition sequence is found, cutting happens at a defined moment, sticky ends are left that can only bind complementary sequences, and ligase closes the new configuration. Every system in AETHER cuts at a recognition sequence and ligates a new configuration.")}
        {cards([
          {h:"SCALE BRIDGE",         col:V.gold,  d:"Quark: 10⁻¹⁸ m. Proton: 10⁻¹⁵ m. DNA base pair: 3.4 × 10⁻¹⁰ m. GFP barrel: 2.4 × 10⁻⁹ m. Cell: 10⁻⁵ m. Jellyfish: 10⁻¹ m. Earth: 10⁷ m. Moon orbit: 3.8 × 10⁸ m. Venus orbit: 1.1 × 10¹¹ m. Solar system: 10¹³ m. Total AETHER scale range: 10³¹. One coherent system."},
          {h:"MAYA + DNA",           col:V.amb,   d:"Maya civilisation DNA: Modern Maya carry ~80–100% Indigenous American ancestry (Nahua/Maya admixture varies by region). gfp-tagged studies of Maya genetic markers: specific HLA haplotypes surviving 500yr of post-Columbian disease pressure. The Dresden Codex survives — the DNA of Maya astronomical knowledge. Both encoded in linear sequences (codex pages / nucleotide bases) with error-correction (astronomical corrections / DNA proofreading)."},
          {h:"QUARK + CONSCIOUSNESS",col:V.vio,   d:"Proton: 3 quarks. Human brain: ~10²⁷ protons. Maya Long Count cycle: 5,125 years = 1.62 × 10¹¹ seconds. Human neural firing: ~10¹⁵ electrical events per second in the brain during waking. The quark is the foundation of every thought ever had about the quark — a recursion that QCD cannot resolve. Consciousness observing matter made of quarks observing consciousness: the AETHER loop."},
          {h:"GFP + COSMOS",         col:V.photon,d:"Aequorea victoria uses GFP for what purpose? Unknown — probably not signalling. Possibly accidental (chromophore forms from a structural protein). But photons absorbed at 395 nm (near-UV from sun) and re-emitted at 509 nm (green, peak photosynthesis response) — the jellyfish is passively converting solar UV into the wavelength that drives photosynthesis. An accidental solar panel, discovered 600 million years after the jellyfish evolved it."},
          {h:"FULL MOON + DNA",      col:V.cyan,  d:"Coral spawning: mass synchronised gamete release within 30–60 min of full moon after November water temperature reaches 26°C. Trigger: combination of moonlight intensity change (not gravity — moonlight decreases faster than its gravity changes), temperature, and circadian clocks. Cry1a gene (cryptochrome, the light-sensitive clock gene) responds to moonlight. Cryptochrome is the same protein class that gives birds magnetic navigation. Maya full moon ritual = culturally encoded cryptochrome response."},
          {h:"AETHER THREAD",        col:V.photon,d:"Quarks → protons → atoms → DNA → GFP gene → GFP protein → jellyfish → Pacific Ocean → solar photons → FMO quantum coherence → plant glucose → flowers → bees → soil tardigrades (MSDD survivors) → cryptobiosis → telomeres → Maya astronomy → 7 celestial bodies → Venus calendar → Dresden Codex → Long Count → cosmic pause. One thread. All pages. One system."},
        ])}
      </>)}
    </div>
  );
}
