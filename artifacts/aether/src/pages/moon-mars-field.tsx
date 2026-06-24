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
   CANVAS 1 · Moon Mourners · Wishbone Landing · Watersplash Mine · Dust
   ───────────────────────────────────────────────────────────────────────── */
function MoonLandingCanvas(){
  const ref=useRef<HTMLCanvasElement>(null);
  useEffect(()=>{
    const cv=ref.current; if(!cv) return;
    const CH=450;
    cv.width=CW; cv.height=CH;
    const ctx=cv.getContext("2d")!;

    const SURF=CH*0.70;

    let t=0, raf=0;

    const drawMourner=(x:number, bowed:boolean, phase:number)=>{
      const sway=Math.sin(t*0.35+phase)*1.2;
      ctx.fillStyle="rgba(10,8,6,0.92)";
      if(bowed){
        /* bowed figure: round head, hunched body */
        ctx.beginPath(); ctx.ellipse(x+sway,SURF-14,6,5,0.5,0,TAU); ctx.fill();
        ctx.beginPath();
        ctx.moveTo(x,SURF-10);
        ctx.bezierCurveTo(x-12,SURF-4,x-10,SURF+10,x-4,SURF+14);
        ctx.bezierCurveTo(x+6,SURF+15,x+12,SURF+9,x+8,SURF);
        ctx.bezierCurveTo(x+4,SURF-5,x,SURF-8,x,SURF-10);
        ctx.fill();
      } else {
        /* standing figure, arms raised */
        ctx.beginPath(); ctx.arc(x+sway*0.3,SURF-32,6,0,TAU); ctx.fill();
        ctx.fillRect(x-3+sway*0.2,SURF-26,6,22);
        ctx.strokeStyle="rgba(10,8,6,0.92)"; ctx.lineWidth=3;
        ctx.beginPath(); ctx.moveTo(x-2,SURF-18);
        ctx.lineTo(x-14,SURF-30+sway); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(x+2,SURF-18);
        ctx.lineTo(x+14,SURF-32-sway); ctx.stroke();
      }
    };

    const draw=()=>{
      ctx.clearRect(0,0,CW,CH);

      /* Space background */
      const spG=ctx.createLinearGradient(0,0,0,SURF);
      spG.addColorStop(0,"#000106"); spG.addColorStop(1,"#0A060C");
      ctx.fillStyle=spG; ctx.fillRect(0,0,CW,SURF);

      /* Stars */
      for(let s=0;s<140;s++){
        const sx=(s*97+s*13)%CW, sy=(s*53+s*7)%(SURF*0.95);
        const tw=Math.sin(t*1.1+s*0.9)*0.25+0.75;
        ctx.beginPath(); ctx.arc(sx,sy,0.6+s%3*0.4,0,TAU);
        ctx.fillStyle=`rgba(220,224,242,${tw*0.55})`; ctx.fill();
      }

      /* Earth (upper right) */
      const EX=CW*0.85, EY=CH*0.12, ER=30;
      const eG=ctx.createRadialGradient(EX-7,EY-7,2,EX,EY,ER);
      eG.addColorStop(0,"#88CCFF"); eG.addColorStop(0.45,"#2266BB");
      eG.addColorStop(0.72,"#1A4488"); eG.addColorStop(1,"#223322");
      ctx.beginPath(); ctx.arc(EX,EY,ER,0,TAU);
      ctx.fillStyle=eG; ctx.fill();
      ctx.strokeStyle="rgba(180,220,255,0.12)"; ctx.lineWidth=4; ctx.stroke();
      ctx.strokeStyle="rgba(255,255,255,0.22)"; ctx.lineWidth=2.5;
      ctx.beginPath(); ctx.arc(EX+4,EY-9,11,0.5,1.9); ctx.stroke();
      ctx.beginPath(); ctx.arc(EX-5,EY+6,8,-0.3,1.3); ctx.stroke();

      /* Moon surface */
      const mSurf=ctx.createLinearGradient(0,SURF,0,CH);
      mSurf.addColorStop(0,"#3C3830"); mSurf.addColorStop(1,"#1C1A16");
      ctx.fillStyle=mSurf; ctx.fillRect(0,SURF,CW,CH-SURF);

      /* Surface craters */
      [[CW*0.42,SURF+6,24],[CW*0.73,SURF+3,14],[CW*0.12,SURF+5,11]].forEach(([cx,cy,cr])=>{
        ctx.beginPath(); ctx.ellipse(cx,cy,cr,cr*0.32,0,0,TAU);
        ctx.strokeStyle="rgba(18,15,11,0.55)"; ctx.lineWidth=1.5; ctx.stroke();
      });

      /* ── WATERSPLASH MINE (left) ── */
      const WX=CW*0.20, WY=SURF+2, WR=40;
      ctx.beginPath(); ctx.ellipse(WX,WY,WR,WR*0.38,0,0,TAU);
      ctx.fillStyle="#070E18"; ctx.fill();
      ctx.strokeStyle="#10202C"; ctx.lineWidth=1.8; ctx.stroke();
      /* Ice water ripples */
      for(let ri=1;ri<=5;ri++){
        const rr=WR*(ri/6.2)*(0.88+Math.sin(t*1.6+ri)*0.1);
        ctx.beginPath(); ctx.ellipse(WX,WY,rr,rr*0.32,0,0,TAU);
        ctx.strokeStyle=`rgba(0,110,190,${0.5-ri*0.07})`; ctx.lineWidth=0.9; ctx.stroke();
      }
      ctx.fillStyle=V.cyan+"99"; ctx.font=`700 7.5px ${V.mono}`; ctx.textAlign="center";
      ctx.fillText("LCROSS",WX,WY+WR*0.4+11);
      ctx.fillText("WATERSPLASH MINE",WX,WY+WR*0.4+22);

      /* ── LUNAR MODULE (centre) ── */
      const LX=CW*0.55, LY=SURF;

      /* Four wishbone landing legs */
      const LEGS=[
        {ax:LX-24,ay:LY-54,ox:LX-60,oy:LY,bx:LX-16,by:LY-34},
        {ax:LX-14,ay:LY-54,ox:LX-50,oy:LY,bx:LX-8,by:LY-34},
        {ax:LX+14,ay:LY-54,ox:LX+50,oy:LY,bx:LX+8,by:LY-34},
        {ax:LX+24,ay:LY-54,ox:LX+60,oy:LY,bx:LX+16,by:LY-34},
      ];
      LEGS.forEach(lg=>{
        /* Primary strut */
        ctx.strokeStyle="#CCAA5577"; ctx.lineWidth=2.2;
        ctx.beginPath(); ctx.moveTo(lg.ax,lg.ay); ctx.lineTo(lg.ox,lg.oy); ctx.stroke();
        /* Secondary brace (makes the Y / wishbone) */
        ctx.strokeStyle="#BBAA4455"; ctx.lineWidth=1.5;
        ctx.beginPath(); ctx.moveTo(lg.bx,lg.by); ctx.lineTo(lg.ox,lg.oy); ctx.stroke();
        /* Footpad */
        ctx.beginPath(); ctx.ellipse(lg.ox,lg.oy,9,3.5,0,0,TAU);
        ctx.fillStyle="#CCAA5588"; ctx.fill();
      });

      /* Wishbone Y-label */
      ctx.fillStyle=V.gold+"CC"; ctx.font=`700 8px ${V.mono}`; ctx.textAlign="left";
      ctx.fillText("← WISHBONE",LX+62,LY-22);
      ctx.fillText("Y-STRUT",LX+62,LY-12);

      /* Descent stage */
      ctx.beginPath(); ctx.rect(LX-28,LY-96,56,42);
      ctx.fillStyle="#221E18"; ctx.fill();
      ctx.strokeStyle="#BBAA5544"; ctx.lineWidth=1; ctx.stroke();
      /* Thermal foil strips */
      for(let tf=0;tf<4;tf++){
        ctx.strokeStyle=`rgba(180,160,60,0.10)`; ctx.lineWidth=1;
        ctx.beginPath(); ctx.moveTo(LX-28+tf*14,LY-96); ctx.lineTo(LX-28+tf*14,LY-54); ctx.stroke();
      }

      /* Ascent stage */
      ctx.beginPath(); ctx.rect(LX-20,LY-136,40,40);
      ctx.fillStyle="#181620"; ctx.fill();
      ctx.strokeStyle="#9988AA44"; ctx.lineWidth=1; ctx.stroke();
      /* Rendezvous window */
      ctx.beginPath(); ctx.rect(LX-5,LY-128,10,9);
      ctx.fillStyle=V.blue+"44"; ctx.fill();
      ctx.strokeStyle=V.blue+"66"; ctx.lineWidth=1; ctx.stroke();

      /* Descent engine nozzle (ENGINE OFF — no glow) */
      ctx.beginPath();
      ctx.moveTo(LX-8,LY-54); ctx.lineTo(LX-5,LY-10);
      ctx.lineTo(LX+5,LY-10); ctx.lineTo(LX+8,LY-54);
      ctx.fillStyle="#1A1610"; ctx.fill();
      ctx.strokeStyle="#55441166"; ctx.lineWidth=0.7; ctx.stroke();

      /* Undisturbed dust boundary */
      ctx.strokeStyle=V.photon+"44"; ctx.lineWidth=0.8; ctx.setLineDash([5,4]);
      ctx.beginPath(); ctx.moveTo(LX-62,LY); ctx.lineTo(LX+62,LY); ctx.stroke();
      ctx.setLineDash([]);
      ctx.fillStyle=V.photon+"AA"; ctx.font=`700 7.5px ${V.mono}`; ctx.textAlign="center";
      ctx.fillText("ENGINE OFF · DUST UNMOVING",LX,LY+15);

      /* ── MOON MOURNERS ── */
      drawMourner(CW*0.08,true,0);
      drawMourner(CW*0.17,false,1.2);
      drawMourner(CW*0.26,true,2.5);
      drawMourner(CW*0.80,false,0.8);
      drawMourner(CW*0.87,true,3.1);
      drawMourner(CW*0.93,false,1.7);

      ctx.fillStyle=V.ink; ctx.font=`700 10px ${V.mono}`; ctx.textAlign="left";
      ctx.fillText("MOON MOURNERS · WISHBONE LANDING STRUTS · WATERSPLASH ICE MINE · DUST UNMOVING",10,16);

      t+=0.016; raf=requestAnimationFrame(draw);
    };
    draw();
    return()=>cancelAnimationFrame(raf);
  },[]);
  return <canvas ref={ref} width={CW} height={450} style={{width:"100%",borderRadius:6,display:"block"}}/>;
}

/* ─────────────────────────────────────────────────────────────────────────
   CANVAS 2 · Coherent Field Straps (Earth) · Decoherence Fabric Array (Mars)
   ───────────────────────────────────────────────────────────────────────── */
function FieldStrapsCanvas(){
  const ref=useRef<HTMLCanvasElement>(null);
  useEffect(()=>{
    const cv=ref.current; if(!cv) return;
    const CH=400;
    cv.width=CW; cv.height=CH;
    const ctx=cv.getContext("2d")!;

    /* Mars fabric stripe definition — alternating N/S polarity */
    const STRIPES:{h:number;pol:number}[]=[
      {h:22,pol:1},{h:18,pol:-1},{h:28,pol:1},{h:14,pol:-1},{h:32,pol:1},
      {h:20,pol:-1},{h:16,pol:1},{h:24,pol:-1},{h:30,pol:1},{h:18,pol:-1},
      {h:26,pol:1},{h:12,pol:-1},{h:22,pol:1},{h:28,pol:-1},{h:20,pol:1},
      {h:18,pol:-1},{h:36,pol:1},{h:14,pol:-1},
    ];

    let t=0, raf=0;

    const draw=()=>{
      ctx.clearRect(0,0,CW,CH);

      const MID=CW*0.50;
      /* Left: Earth field (dark blue space) */
      const lBg=ctx.createLinearGradient(0,0,MID,0);
      lBg.addColorStop(0,"#020610"); lBg.addColorStop(1,"#060A18");
      ctx.fillStyle=lBg; ctx.fillRect(0,0,MID,CH);

      /* Right: Mars crustal field (dark ochre) */
      const rBg=ctx.createLinearGradient(MID,0,CW,0);
      rBg.addColorStop(0,"#120806"); rBg.addColorStop(1,"#1A0E04");
      ctx.fillStyle=rBg; ctx.fillRect(MID,0,CW-MID,CH);

      /* ── EARTH: Coherent field straps ── */
      const NP={x:MID*0.5,y:CH*0.06};
      const SP={x:MID*0.5,y:CH*0.94};
      const N_STRAPS=6;
      for(let li=1;li<=N_STRAPS;li++){
        const spread=li*(MID*0.42/N_STRAPS);
        const alpha=0.40-li*0.04;
        const lw=9-li*0.9;
        const pulse=Math.sin(t*0.6+li*0.5)*0.06+0.94;
        const col=`rgba(30,${(70+li*20)|0},${(180+li*12)|0},${alpha*pulse})`;

        ctx.lineWidth=lw; ctx.strokeStyle=col; ctx.lineCap="round";
        /* Left arc of strap */
        ctx.beginPath(); ctx.moveTo(NP.x,NP.y);
        ctx.bezierCurveTo(NP.x-spread*2.2,CH*0.28,SP.x-spread*2.2,CH*0.72,SP.x,SP.y);
        ctx.stroke();
        /* Right arc of strap */
        ctx.beginPath(); ctx.moveTo(NP.x,NP.y);
        ctx.bezierCurveTo(NP.x+spread*2.2,CH*0.28,SP.x+spread*2.2,CH*0.72,SP.x,SP.y);
        ctx.stroke();
      }

      /* Aurora glow at poles */
      [[NP.x,NP.y,"#00FFB222"],[SP.x,SP.y,"#00FFB222"]].forEach(([px,py,col])=>{
        const aR=ctx.createRadialGradient(px as number,py as number,2,px as number,py as number,36);
        aR.addColorStop(0,col as string); aR.addColorStop(1,"transparent");
        ctx.fillStyle=aR; ctx.fillRect((px as number)-38,(py as number)-38,76,76);
      });

      /* Pole labels */
      ctx.fillStyle=V.aurora+"AA"; ctx.font=`700 8px ${V.mono}`; ctx.textAlign="center";
      ctx.fillText("N",NP.x,NP.y-8);
      ctx.fillText("S",SP.x,SP.y+14);
      ctx.fillStyle=V.blue+"CC"; ctx.font=`700 9px ${V.mono}`;
      ctx.fillText("COHERENT FIELD LINES",MID*0.5,CH*0.5-4);
      ctx.fillStyle=V.blue+"77"; ctx.font=`8px ${V.mono}`;
      ctx.fillText("THE STRAPS OF THE MAGNETOSPHERE",MID*0.5,CH*0.5+10);

      /* Field direction arrows on outermost strap (equatorial) */
      const eqY=CH*0.50;
      const eqXL=MID*0.5-N_STRAPS*(MID*0.42/N_STRAPS)*2.2*0.85;
      const eqXR=MID*0.5+N_STRAPS*(MID*0.42/N_STRAPS)*2.2*0.85;
      ctx.fillStyle=V.cyan+"88"; ctx.font=`11px ${V.mono}`;
      ctx.fillText("→",Math.max(8,eqXL-10),eqY+4);
      ctx.fillText("←",Math.min(MID-18,eqXR+2),eqY+4);

      /* ── MARS: Decoherent fabric array ── */
      let sy=0;
      STRIPES.forEach(stripe=>{
        const jit=Math.sin(sy*0.09+2)*18;
        const pulse=Math.sin(t*0.3+sy*0.04)*0.08;
        const isN=stripe.pol===1;
        const baseCol=isN?"#CC3322":"#2233BB";
        ctx.fillStyle=baseCol+(isN?"30":"28");
        ctx.fillRect(MID+jit,sy,CW-MID-jit,stripe.h);
        /* Polarity arrows */
        for(let ax=MID+jit+20;ax<CW-16;ax+=50){
          const aAlpha=0.5+pulse*2;
          ctx.fillStyle=isN?`rgba(220,80,50,${aAlpha})`:`rgba(50,80,210,${aAlpha})`;
          ctx.font=`700 11px ${V.mono}`; ctx.textAlign="center";
          ctx.fillText(isN?"↑":"↓",ax,sy+stripe.h*0.68);
        }
        /* Stripe boundary */
        ctx.strokeStyle="rgba(0,0,0,0.20)"; ctx.lineWidth=0.5;
        ctx.beginPath(); ctx.moveTo(MID+jit,sy+stripe.h); ctx.lineTo(CW,sy+stripe.h); ctx.stroke();
        sy+=stripe.h;
      });

      /* Decoherence overlay */
      const decG=ctx.createLinearGradient(MID,0,CW,0);
      decG.addColorStop(0,"rgba(180,60,20,0.06)"); decG.addColorStop(1,"rgba(100,30,10,0.12)");
      ctx.fillStyle=decG; ctx.fillRect(MID,0,CW-MID,CH);

      ctx.fillStyle=V.fire+"CC"; ctx.font=`700 9px ${V.mono}`; ctx.textAlign="center";
      ctx.fillText("MARS · DECOHERENCE",MID+(CW-MID)*0.5,CH*0.5-6);
      ctx.fillStyle=V.amb+"77"; ctx.font=`8px ${V.mono}`;
      ctx.fillText("CRUSTAL MAGNETIC FABRIC ARRAY",MID+(CW-MID)*0.5,CH*0.5+10);

      /* Divider */
      const divPulse=Math.sin(t*0.8)*0.08+0.22;
      ctx.strokeStyle=`rgba(200,200,200,${divPulse})`; ctx.lineWidth=1;
      ctx.setLineDash([6,4]);
      ctx.beginPath(); ctx.moveTo(MID,0); ctx.lineTo(MID,CH); ctx.stroke();
      ctx.setLineDash([]);
      ctx.fillStyle=V.ink+"99"; ctx.font=`700 8px ${V.mono}`; ctx.textAlign="center";
      ctx.fillText("COHERENCE→DECOHERENCE",MID,12);

      ctx.fillStyle=V.ink; ctx.font=`700 10px ${V.mono}`; ctx.textAlign="left";
      ctx.fillText("COHERENT FIELD STRAPS · MARS DECOHERENCE · CRUSTAL FABRIC ARRAY",10,16);

      t+=0.017; raf=requestAnimationFrame(draw);
    };
    draw();
    return()=>cancelAnimationFrame(raf);
  },[]);
  return <canvas ref={ref} width={CW} height={400} style={{width:"100%",borderRadius:6,display:"block"}}/>;
}

/* ─────────────────────────────────────────────────────────────────────────
   CANVAS 3 · Mars Crab · Sarcophagi · Dust · Blood · Iron
   ───────────────────────────────────────────────────────────────────────── */
function MarsCrabCanvas(){
  const ref=useRef<HTMLCanvasElement>(null);
  useEffect(()=>{
    const cv=ref.current; if(!cv) return;
    const CH=420;
    cv.width=CW; cv.height=CH;
    const ctx=cv.getContext("2d")!;

    /* Dust particles */
    const DUST:{x:number;y:number;vx:number;vy:number;r:number}[]=
      Array.from({length:55},(_,i)=>({
        x:(i*137)%CW, y:10+(i*53)%(CH*0.65),
        vx:0.3+(i%5)*0.12, vy:(i%7-3)*0.04,
        r:0.8+i%3*0.5,
      }));

    let t=0, raf=0;

    const draw=()=>{
      ctx.clearRect(0,0,CW,CH);

      /* Mars sky gradient */
      const skyG=ctx.createLinearGradient(0,0,0,CH*0.55);
      skyG.addColorStop(0,"#1A0C04"); skyG.addColorStop(0.5,"#4A1A08");
      skyG.addColorStop(1,"#8A3012");
      ctx.fillStyle=skyG; ctx.fillRect(0,0,CW,CH*0.55);

      /* Mars surface */
      const surfY=CH*0.55;
      const marsSurf=ctx.createLinearGradient(0,surfY,0,CH);
      marsSurf.addColorStop(0,"#7A2C10"); marsSurf.addColorStop(0.4,"#5A1E08");
      marsSurf.addColorStop(1,"#3A1006");
      ctx.fillStyle=marsSurf; ctx.fillRect(0,surfY,CW,CH-surfY);

      /* Haze at horizon */
      const hazeG=ctx.createLinearGradient(0,surfY-30,0,surfY+20);
      hazeG.addColorStop(0,"transparent"); hazeG.addColorStop(0.5,"rgba(150,60,20,0.25)");
      hazeG.addColorStop(1,"transparent");
      ctx.fillStyle=hazeG; ctx.fillRect(0,surfY-30,CW,50);

      /* Dust devil (background left) */
      const DDX=CW*0.12;
      for(let dl=0;dl<22;dl++){
        const ddy=surfY-dl*12;
        const ddw=3+dl*0.8+Math.sin(t*1.2+dl*0.4)*2;
        const rot=Math.sin(t*0.4+dl*0.15)*ddw*0.7;
        ctx.beginPath(); ctx.ellipse(DDX+rot,ddy,ddw,4,0,0,TAU);
        ctx.fillStyle=`rgba(180,80,30,${0.12-dl*0.005})`; ctx.fill();
      }
      ctx.fillStyle=V.amb+"55"; ctx.font=`7px ${V.mono}`; ctx.textAlign="center";
      ctx.fillText("DUST DEVIL",DDX,surfY-270);

      /* Dust particles drifting */
      DUST.forEach(dp=>{
        dp.x=(dp.x+dp.vx)%CW;
        dp.y=Math.max(8,Math.min(CH*0.62,dp.y+dp.vy+Math.sin(t*0.5+dp.x*0.01)*0.08));
        ctx.beginPath(); ctx.arc(dp.x,dp.y,dp.r,0,TAU);
        ctx.fillStyle=`rgba(210,110,60,0.45)`; ctx.fill();
      });

      /* ── SARCOPHAGI MESAS (left and centre-left) ── */
      const SARCS=[{x:CW*0.08,w:70,h:80},{x:CW*0.25,w:50,h:60},{x:CW*0.38,w:90,h:95}];
      SARCS.forEach(s=>{
        const sx=s.x-s.w/2, sy=surfY-s.h;
        /* Shadow */
        ctx.fillStyle="rgba(0,0,0,0.28)";
        ctx.beginPath(); ctx.ellipse(s.x+10,surfY,s.w*0.6,8,0,0,TAU); ctx.fill();
        /* Mesa body */
        ctx.fillStyle="#6A2010"; ctx.fillRect(sx,sy,s.w,s.h);
        /* Flat top (lid) */
        ctx.fillStyle="#8A3018"; ctx.fillRect(sx-4,sy-6,s.w+8,10);
        /* Strata lines */
        for(let sl=0;sl<4;sl++){
          ctx.strokeStyle=`rgba(120,60,20,${0.35+sl*0.08})`; ctx.lineWidth=1;
          ctx.beginPath(); ctx.moveTo(sx,sy+s.h*(0.25+sl*0.18));
          ctx.lineTo(sx+s.w,sy+s.h*(0.25+sl*0.18)); ctx.stroke();
        }
        /* Cracks */
        ctx.strokeStyle="rgba(0,0,0,0.4)"; ctx.lineWidth=0.8;
        ctx.beginPath(); ctx.moveTo(s.x,sy); ctx.lineTo(s.x+8,sy+s.h*0.6);
        ctx.lineTo(s.x+4,sy+s.h); ctx.stroke();
      });
      ctx.fillStyle=V.amb+"AA"; ctx.font=`700 8px ${V.mono}`; ctx.textAlign="center";
      ctx.fillText("SARCOPHAGI MESAS",CW*0.25,surfY+16);

      /* ── MARS CRAB (embedded in rock face, right side) ── */
      const CX=CW*0.72, CY=CH*0.50, rockFaceY=CH*0.28;
      /* Rock face */
      ctx.fillStyle="#4A1808";
      ctx.beginPath();
      ctx.moveTo(CX-70,surfY); ctx.lineTo(CX-65,rockFaceY);
      ctx.lineTo(CX+65,rockFaceY); ctx.lineTo(CX+68,surfY); ctx.fill();
      ctx.strokeStyle="#6A2510"; ctx.lineWidth=0.8; ctx.stroke();

      /* Crab body embedded in rock */
      ctx.beginPath(); ctx.ellipse(CX,CY,22,14,0.1,0,TAU);
      ctx.fillStyle="#3A1208AA"; ctx.fill();
      ctx.strokeStyle="#8A4020CC"; ctx.lineWidth=1.5; ctx.stroke();

      /* Crab legs / appendages */
      const LEGS=[
        {dx:-30,dy:-8,cx:-20,cy:-18},{dx:-35,dy:0,cx:-22,cy:8},
        {dx:-28,dy:12,cx:-18,cy:20},{dx:30,dy:-8,cx:20,cy:-18},
        {dx:35,dy:0,cx:22,cy:8},{dx:28,dy:12,cx:18,cy:20},
      ];
      LEGS.forEach(lg=>{
        ctx.strokeStyle="#7A3018BB"; ctx.lineWidth=2;
        ctx.beginPath();
        ctx.moveTo(CX+lg.cx*0.4,CY+lg.dy*0.4);
        ctx.quadraticCurveTo(CX+lg.cx*0.75,CY+lg.dy*0.8,CX+lg.dx,CY+lg.dy);
        ctx.stroke();
        /* Claw tip */
        ctx.beginPath(); ctx.arc(CX+lg.dx,CY+lg.dy,2.5,0,TAU);
        ctx.fillStyle="#AA4422AA"; ctx.fill();
      });
      /* Eye spots */
      [-7,7].forEach(ex=>{
        ctx.beginPath(); ctx.arc(CX+ex,CY-6,3.5,0,TAU);
        ctx.fillStyle="#CC4422AA"; ctx.fill();
        ctx.beginPath(); ctx.arc(CX+ex,CY-6,1.5,0,TAU);
        ctx.fillStyle="#FF8844AA"; ctx.fill();
      });
      /* Rostrum (front point) */
      ctx.beginPath(); ctx.moveTo(CX-3,CY); ctx.lineTo(CX,CY-20); ctx.lineTo(CX+3,CY);
      ctx.fillStyle="#6A2810AA"; ctx.fill();

      ctx.fillStyle=V.fire+"CC"; ctx.font=`700 8px ${V.mono}`; ctx.textAlign="center";
      ctx.fillText("MARS CRAB · PAREIDOLIA / FORMATION?",CX,rockFaceY-10);
      ctx.fillStyle=V.fire+"66"; ctx.font=`7px ${V.mono}`;
      ctx.fillText("CURIOSITY NAV-CAM · 2015",CX,rockFaceY-1);

      /* Hematite concretions */
      [[CW*0.32,surfY+8],[CW*0.48,surfY+5],[CW*0.55,surfY+9],[CW*0.62,surfY+6]].forEach(([bx,by])=>{
        ctx.beginPath(); ctx.arc(bx,by,4,0,TAU);
        ctx.fillStyle="#7A3022CC"; ctx.fill();
        ctx.strokeStyle="#AA5033BB"; ctx.lineWidth=0.8; ctx.stroke();
      });

      /* ── Iron / Blood / Stars annotation (bottom) ── */
      const AY=CH-40;
      ctx.fillStyle="rgba(80,20,10,0.7)"; ctx.fillRect(0,AY-8,CW,50);
      const items=[
        {col:"#CC3322",label:"MARS DUST",sub:"Fe₂O₃ · hematite · 1-3 μm"},
        {col:"#AA2222",label:"BLOOD",sub:"haemoglobin · Fe²⁺ · porphyrin"},
        {col:"#FF6622",label:"IRON CORE",sub:"synthesised in stellar nucleosynthesis"},
        {col:V.gold,   label:"SUPERNOVA",sub:"iron seeded solar system 4.6 Ga"},
        {col:V.shock,  label:"YOUR BLOOD",sub:"same iron · same star"},
      ];
      items.forEach((it,i)=>{
        const ix=i*(CW/items.length)+14;
        ctx.beginPath(); ctx.arc(ix+6,AY+4,5,0,TAU);
        ctx.fillStyle=it.col; ctx.fill();
        ctx.fillStyle=it.col; ctx.font=`700 8px ${V.mono}`; ctx.textAlign="left";
        ctx.fillText(it.label,ix+14,AY+6);
        ctx.fillStyle=V.ink+"88"; ctx.font=`7px ${V.mono}`;
        ctx.fillText(it.sub,ix+14,AY+18);
      });

      ctx.fillStyle=V.ink; ctx.font=`700 10px ${V.mono}`; ctx.textAlign="left";
      ctx.fillText("MARS CRAB · SARCOPHAGI MESAS · DUST · BLOOD · IRON · CONCRETIONS · DUST DEVILS",10,16);

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
export default function MoonMarsFieldPage(){
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
        {[badge("LIVE SIMULATION"),badge("MOON MOURNERS",V.photon),badge("WISHBONE LANDING",V.gold),
          badge("WATERSPLASH MINE",V.cyan),badge("FIELD STRAPS",V.blue),badge("DECOHERENCE",V.fire),
          badge("MARS CRAB",V.fire),badge("SARCOPHAGI",V.amb),badge("IRON · BLOOD",V.rose),
          badge("DUST",V.amb),badge("FABRIC ARRAY",V.vio)]}
        <h1 style={{fontFamily:V.disp,fontSize:"clamp(1.2rem,3.4vw,2.3rem)",color:V.ink,
          margin:"22px 0 8px",letterSpacing:"0.06em",fontWeight:400,lineHeight:1.18}}>
          MOON MOURNERS · WISHBONE LANDING · COHERENT FIELD STRAPS · MARS DECOHERENCE · CRAB · SARCOPHAGI
        </h1>
        <p style={{fontFamily:V.mono,fontSize:"0.58rem",color:V.dim,letterSpacing:3,margin:"0 0 22px"}}>
          WATERSPLASH ICE MINE · DUST UNMOVING · FABRIC ARRAY · IRON · BLOOD · STARS · DUST DEVIL
        </p>
        {P("The Moon landing was not only a technical event. It was a moment that broke something open in the humans who witnessed it — a grief without name, a wonder that felt like mourning. Edgar Mitchell described it as a flash of cosmic unity; Buzz Aldrin called the surface 'magnificent desolation.' These are the Moon mourners: humans confronted with the void and finding it beautiful.")}
        {P("Earth's magnetosphere is held by coherent field lines arching from pole to pole — the straps of the magnetosphere. Mars lost its global field 4.1 billion years ago. What remains is a fabric array: alternating stripes of ancient magnetised crust across the southern highlands, field lines frozen into rock, coherence turned to texture.")}
        {P("Mars dust is the same iron as blood. Hematite (Fe2O3), coating every grain of the Martian surface, was forged in the same supernova as the iron in hemoglobin. Mars is red for the same reason blood is red: iron, synthesised in a dying star before our solar system existed.")}
      </div>

      {sec("01","Moon Mourners · Wishbone Landing Struts · Watersplash Ice Mine · Dust Unmoving",V.photon,<>
        {P("The Apollo Lunar Module's landing gear had a wishbone geometry: four legs, each with a primary compression strut running from the descent stage to the foot pad, braced by two secondary outrigger struts meeting at a Y-junction. The whole structure folded for launch and unfolded in lunar orbit. Each footpad was 92 cm across — wide enough to distribute load on loose regolith.")}
        {P("At engine cutoff, approximately 1-2 metres above the surface, the descent engine (4,000 lbf Rocketdyne) went silent. The LM fell the last metre under Moon gravity (1.62 m/s^2). The regolith was not blasted at touchdown because the engine was already off. The dust that had been scattered during descent had settled. At the moment of contact: stillness. Dust unmoving.")}
        {P("LCROSS (Lunar CRater Observation and Sensing Satellite, 2009): a Centaur rocket stage was crashed into Cabeus crater near the lunar south pole at 9,000 km/h. The plume contained 155 kg of water vapour and ice. The watersplash mine: a confirmed water resource, permanently shadowed, at -230 C. Future lunar habitats will mine this ice for water, oxygen, and hydrogen propellant.")}
        <div style={{border:`1px solid ${V.photon}22`,borderRadius:8,padding:2,marginBottom:14}}>
          <MoonLandingCanvas/>
        </div>
        {cards([
          {h:"WISHBONE STRUTS",col:V.photon,d:"LM landing gear: primary strut (titanium tube, 3.5 cm diameter) carries 70% of impact load. Secondary struts (two per leg) carry lateral loads and prevent the leg buckling sideways. At the Y-junction, the geometry creates a force triangle — any landing vector is resolved into three strut loads. The foot pad contains a honeycomb energy absorber: 4 cm crush stroke, absorbing 75 J per footpad. Total system mass: 180 kg for all four legs."},
          {h:"DUST UNMOVING",col:V.gold,d:"Apollo 11 film shows regolith disturbed during final descent (dust streaking outward from the engine plume). But at cutoff the dust settled in seconds — there is no air to keep it suspended. At the moment of touchdown, the surface was undisturbed. Footprints preserved in lunar regolith since 1969 with zero erosion — no wind, no water, no frost. They will remain for millions of years unless disturbed by a micrometeorite impact."},
          {h:"LCROSS WATER",col:V.cyan,d:"Cabeus crater: 98 km wide, permanently shadowed, temperature -230 C. Ice deposited over billions of years from comet and asteroid impacts. LCROSS spectrometer identified: H2O (water ice), OH (hydroxyl), CO, CO2, SO2, H2S, NH3, C2H4. Total water in crater: estimated 600 million metric tonnes. LCROSS proved the Moon is not dry — the poles contain a resource base for permanent human settlement."},
          {h:"MOON MOURNERS",col:V.vio,d:"Buzz Aldrin: 'Magnificent desolation.' Edgar Mitchell: 'Instant global consciousness' (triggered by looking at Earth from the Moon). Michael Collins: 'I am alone now, truly alone and absolutely isolated... Awareness. Desolation.' The moon mourners are the people who looked at the Moon after Apollo and felt a grief they could not name — the mystery was gone. And also: the people who looked up from Earth and felt the weight of the infinite bear down on them for the first time."},
          {h:"WATERSPLASH DYNAMICS",col:V.cyan,d:"LCROSS impact velocity: 9,000 km/h. Crater depth excavated: 20 m. Plume height: 1.5 km. Water ice fraction of ejecta: 5.6% by mass (confirmed by Lunar Reconnaissance Orbiter photometry). The plume dynamics in vacuum: no atmosphere means no shock wave — ejecta spreads ballistically in a cone. The 'watersplash' is purely mechanical: ice grains, vapour, and excavated regolith arcing outward in silence."},
          {h:"AETHER · MOURNING",col:V.photon,d:"AETHER: mourning as a coherence state. When a known system changes irreversibly, the field of meaning around it — the accumulated associations, expectations, and memories — loses its anchor. This produces a decoherence in the internal model. Mourning is the slow rebuilding of coherence around the new fact. The Moon mourners experienced this: the Moon as pure symbol was lost. The Moon as real place — with craters and watersplash mines and wishbone footprints — replaced it. Both are true. The grief is the transition."},
        ])}
      </>)}

      {sec("02","Coherent Field Straps · Decoherence · Mars Fabric Array · MAVEN",V.blue,<>
        {P("Earth's magnetic field is a dipole, generated by convective currents in the liquid outer iron core. Field lines arc from the South Magnetic Pole through space to the North Magnetic Pole, forming the magnetosphere — a bubble of protected space extending 60,000 km toward the Sun and 600,000 km away from it. These are the straps: coherent field lines that hold charged particles in place, trap cosmic radiation in the Van Allen belts, and deflect the solar wind around the planet.")}
        {P("Mars's magnetosphere collapsed 4.1 billion years ago. The iron core cooled, the convective dynamo ceased, the field died. But not entirely. The ancient igneous rocks in the southern highlands had cooled below the Curie temperature (the temperature above which a material loses its permanent magnetism) while the field was still active. The field lines were frozen into the rock.")}
        {P("What the Mars Global Surveyor magnetometer found in 1997 was a fabric: alternating stripes of positive and negative crustal magnetic anomalies running across the ancient terrain. The stripes are analogous to Earth's oceanic magnetic stripes, but formed by a different mechanism. Decoherence: the global field is gone, replaced by a local, irregular, patchwork field. The fabric array is the remnant — coherence fossilised into crust.")}
        <div style={{border:`1px solid ${V.blue}22`,borderRadius:8,padding:2,marginBottom:14}}>
          <FieldStrapsCanvas/>
        </div>
        {cards([
          {h:"FIELD STRAP GEOMETRY",col:V.blue,d:"Dipole field line equation: r = L cos^2(lambda) where L is the equatorial crossing distance in Earth radii and lambda is the magnetic latitude. Field lines near the equator are wide loops extending far into space; high-latitude field lines return close to Earth. The Van Allen belts sit on field lines at L=1.5-2 (inner belt) and L=4-6 (outer belt). Charged particles spiral along these field straps — trapped, bouncing between mirror points near the poles."},
          {h:"MARS CORE DEATH",col:V.fire,d:"Mars core crystallisation: the planet's small size (10% of Earth's mass) caused faster cooling. The inner core solidified ~4.1 Ga, stopping the convective dynamo. Evidence: Mars's iron core (radius ~1,830 km) detected by InSight seismology (2021). Core density suggests a liquid iron-sulfide outer region still exists, but too thin and low-conducting to sustain a dynamo. The field death exposed the surface to direct solar wind bombardment."},
          {h:"CRUSTAL FABRIC ARRAY",col:V.vio,d:"Mars southern highlands magnetic stripes: discovered MGS MAG/ER instrument 1997-2006. Stripes are 100-200 km wide, alternating N/S polarity. They do NOT follow the same seafloor-spreading mechanism as Earth's oceanic stripes — Mars has no confirmed plate tectonics. Alternative: rotating or oscillating magnetic field during the dynamo period, preserving alternating polarity reversals. The fabric covers most of the ancient Noachian terrain (south of 30 S latitude)."},
          {h:"MAVEN + ATMOSPHERE LOSS",col:V.cyan,d:"MAVEN (Mars Atmosphere and Volatile EvolutioN) mission: 2014-ongoing. Key finding: Mars loses ~100 grams of upper atmosphere per second to solar wind stripping (ionisation + electric acceleration). Without the magnetic strap, solar wind directly ionises CO2, O, H, N in the upper ionosphere. Over 4 Ga: Mars lost ~0.8 bar of atmosphere (most of its original atmosphere). The strap was the shield — without it, Mars was stripped bare."},
          {h:"DECOHERENCE AS FABRIC",col:V.gold,d:"Quantum decoherence: a quantum system loses its superposition (coherence) by interacting with its environment. The off-diagonal elements of the density matrix decay. The system transitions from quantum to classical. Mars's magnetic decoherence is the classical macroscopic analog: the global coherent field (dipole, ordered) decayed into a classical patchwork (local patches, disordered but locally structured). The fabric array is a decoherent magnetic state — not random, but no longer globally ordered."},
          {h:"AETHER · STRAP FIELD",col:V.blue,d:"AETHER models coherence fields as structures that hold information in place. A coherent field line is a strap: it constrains, guides, and protects. A magnetic strap holds charged particles. A conceptual strap holds an idea. AETHER's coherence engine maps the topology of knowledge fields — where are the straps? Where is decoherence occurring? The Mars fabric array is AETHER's model for a field in transition: not random noise, but structured decoherence — the ghost of a former order woven into the substrate."},
        ])}
      </>)}

      {sec("03","Mars Crab · Sarcophagi Mesas · Dust · Blood · Iron · Stars",V.fire,<>
        {P("Mars dust: iron oxide (Fe2O3, hematite) grains 1-3 micrometres across, smaller than the lower limit for human lung clearance (10 micrometres). If you stood on Mars without a suit, the dust would coat every surface within seconds. A global dust storm (every 3-5 Martian years) covers the entire planet, reducing sunlight to 1-2% of normal. The Opportunity rover survived four dust storms; the fifth, in 2018, ended the mission by coating the solar panels.")}
        {P("The Mars crab: in August 2015, Curiosity's left navigation camera captured an image of a rock formation in Hidden Valley that, in the raw image, appeared to have protruding appendage-like structures suggesting a crustacean. NASA identified it as a rock. It was a demonstration of pareidolia: the human pattern-recognition system, calibrated for millions of years of face-finding and organism-detection, imposes form on random geometry. But the geometry is real, and it raises the question the images always raise.")}
        {P("The sarcophagi: across the Martian southern highlands and the Arabia Terra region, wind erosion has carved rectangular buttes — flat-topped, steep-sided, often elongated in the direction of prevailing winds. They resemble sarcophagi. They are the yardangs of Mars: soft rock stripped from around a resistant core, leaving a preserved form. Inside each yardang is a geochemical time capsule — 4 billion years of Mars, compressed into stratigraphy.")}
        <div style={{border:`1px solid ${V.fire}22`,borderRadius:8,padding:2,marginBottom:14}}>
          <MarsCrabCanvas/>
        </div>
        {cards([
          {h:"MARS DUST CHEMISTRY",col:V.fire,d:"Mars dust composition: Fe2O3 (hematite) 14%, basaltic glass 40%, plagioclase feldspar 20%, pyroxene 16%, perchlorate salts 0.5-1%. The perchlorate (ClO4-) is produced by UV photolysis of chlorine compounds and would be toxic to humans. Grain size: median 2.1 micrometres. Electrostatic charge: Martian dust is highly electrostatically charged by triboelectric contact during dust storms — it adheres to everything, including solar panels, windows, and suits."},
          {h:"PAREIDOLIA + COGNITION",col:V.amb,d:"Pareidolia: seeing faces and organisms in random patterns. Neural basis: the fusiform face area (FFA) in the inferior temporal gyrus responds to faces, and its threshold is low enough to fire on partial or ambiguous face-like stimuli. This is adaptive: better to incorrectly identify a face (false positive) than to miss a real face (false negative). The Mars crab is the FFA doing its job. The question it raises — is this real? — is the same question driving astrobiology."},
          {h:"IRON · BLOOD · STARS",col:V.rose,d:"Iron (Fe) is the most stable nucleus — it sits at the energy minimum of nuclear binding. Stars fuse hydrogen to helium to carbon to neon to silicon to iron. At iron, fusion stops releasing energy. The star's core collapses; the outer layers explode as a supernova, seeding space with iron. The iron in human haemoglobin and the iron in Martian hematite are the same element, made in the same process, from a supernova 5-6 billion years ago. Both are red for the same reason."},
          {h:"SARCOPHAGI YARDANGS",col:V.gold,d:"Yardang: erosional ridge formed when wind removes soft surrounding rock but cannot remove the harder core. Typical Martian yardangs: 1-25 km long, 100-500 m high, elongated in the prevailing wind direction. Largest known yardang field: Medusae Fossae Formation, Mars — 5,000 km long. The flat top is the original surface, preserved. The vertical sides are fresh erosional faces. The interior is undisturbed stratigraphy. Geochemically: the best place on Mars to sample an ancient, unexposed geological record."},
          {h:"DUST DEVILS",col:V.shock,d:"Mars dust devils: convective vortices formed when heated surface air rises rapidly. Heights up to 8 km (10x taller than Earth dust devils because of the thin atmosphere and strong convection). Width: 10-300 m. Surface pressure drop at centre: 1-4 Pa (in 600 Pa total atmosphere). Spirit rover survived 4 dust devils that cleaned its solar panels (power went from 60% to 95% after each clean). They are not dangerous but are electrically active — lightning in dust? Unconfirmed on Mars."},
          {h:"AETHER · IRON THREAD",col:V.fire,d:"AETHER: the iron thread. Iron is the element that connects stellar death to biological life. It is the thread running from a supernova 5 billion years ago through the Martian surface through your blood through the rust on an old tool through the Earth's core. AETHER's substrate synthesis model uses iron as a tracer: wherever iron appears in a system, trace it backward through nucleosynthesis to its stellar origin. The Mars crab is made of the same iron as you. The sarcophagus mesas contain the same iron as your haemoglobin. The dust is the dust of stars."},
        ])}
      </>)}
    </div>
  );
}
