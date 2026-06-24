import React, { useEffect, useRef } from "react";

const V = {
  bg:    "#04060E",
  gold:  "#C8A030",
  amb:   "#FF9933",
  blue:  "#4488FF",
  vio:   "#9966FF",
  green: "#44CC77",
  rose:  "#FF6699",
  plasma:"#FF4477",
  cyan:  "#22DDFF",
  photon:"#00FFBB",
  shock: "#FFDD22",
  fire:  "#FF6622",
  dim:   "#2A3050",
  ink:   "#B8CCE8",
  mono:  "'Space Mono',monospace" as const,
  serif: "'Crimson Pro',serif"    as const,
  disp:  "'Cinzel',serif"         as const,
};
const lerp=(a:number,b:number,t:number)=>a+(b-a)*Math.max(0,Math.min(1,t));
const clamp=(v:number,lo:number,hi:number)=>Math.max(lo,Math.min(hi,v));
const TAU=Math.PI*2;

/* ─────────────────────────────────────────────────────────────────────────
   CANVAS 1 · Hilbert Space · GR Spacetime · String Theory · Holographic Boundary
   ───────────────────────────────────────────────────────────────────────── */
function HilbertGRStringCanvas() {
  const ref=useRef<HTMLCanvasElement>(null);
  useEffect(()=>{
    const cv=ref.current; if(!cv) return;
    const CH=500, PR=window.devicePixelRatio||1;
    const CW=Math.max(cv.offsetWidth,520);
    cv.width=CW*PR; cv.height=CH*PR; cv.style.height=CH+"px";
    const ctx=cv.getContext("2d")!; ctx.scale(PR,PR);
    let frame=0, raf=0;

    /* Bloch sphere state: theta (polar), phi (azimuthal) */
    let theta=Math.PI/3, phi=0;
    /* Hamiltonian: H = ω σ_z → precession around Z with phi += ω·dt */
    const omega=0.025;
    /* Every 300 frames: snap to a new theta */
    const BSX=CW*0.15, BSY=250, BSR=72;

    /* GR grid */
    const GRX=CW*0.42, GRY=CH/2;
    const GCOLS=18, GROWS=18, GSPX=14, GSPY=13;
    const GW=GCOLS*GSPX, GH=GROWS*GSPY;
    /* Gravitational wave phase */
    let gwPhase=0;

    /* String modes: cycle 1→2→3 */
    const STX=CW*0.80, STY=CH/2, STL=70, STN=200;
    let stringMode=1;
    /* Trail for Bloch state */
    const TRAIL:Array<{x:number;y:number;a:number}>=[];

    const draw=()=>{
      ctx.clearRect(0,0,CW,CH);
      const bg=ctx.createLinearGradient(0,0,CW,CH);
      bg.addColorStop(0,"#04060E"); bg.addColorStop(1,"#060810");
      ctx.fillStyle=bg; ctx.fillRect(0,0,CW,CH);

      /* ── BLOCH SPHERE (left) ── */
      ctx.fillStyle=V.dim; ctx.font=`7px ${V.mono}`; ctx.textAlign="center";
      ctx.fillText("HILBERT SPACE · BLOCH SPHERE",BSX,20);
      ctx.fillStyle=V.vio+"11"; ctx.beginPath(); ctx.arc(BSX,BSY,BSR,0,TAU); ctx.fill();
      ctx.strokeStyle=V.vio+"33"; ctx.lineWidth=1;
      ctx.beginPath(); ctx.arc(BSX,BSY,BSR,0,TAU); ctx.stroke();
      /* Equatorial ellipse */
      ctx.strokeStyle=V.dim+"66"; ctx.lineWidth=0.7;
      ctx.beginPath(); ctx.ellipse(BSX,BSY,BSR,BSR*0.3,0,0,TAU); ctx.stroke();
      /* Axes */
      const axes=[
        {dx:0,dy:-BSR,label:"|0⟩",col:V.blue},
        {dx:0,dy:BSR, label:"|1⟩",col:V.rose},
        {dx:BSR,dy:0, label:"|+⟩",col:V.green},
        {dx:-BSR,dy:0,label:"|−⟩",col:V.green},
      ];
      axes.forEach(a=>{
        ctx.strokeStyle=a.col+"44"; ctx.lineWidth=0.8;
        ctx.beginPath(); ctx.moveTo(BSX,BSY); ctx.lineTo(BSX+a.dx,BSY+a.dy); ctx.stroke();
        ctx.fillStyle=a.col; ctx.font=`6.5px ${V.mono}`; ctx.textAlign="center";
        ctx.fillText(a.label,BSX+a.dx*1.18,BSY+a.dy*1.18+3);
      });

      /* State evolution: phi += omega, theta oscillates */
      phi+=omega;
      if(frame%300===0) theta=Math.PI*(0.15+Math.random()*0.7);

      /* 3D → 2D projection (simple orthographic) */
      const sx=BSR*Math.sin(theta)*Math.cos(phi);
      const sy=BSR*Math.cos(theta);
      const sz=BSR*Math.sin(theta)*Math.sin(phi);
      /* project: x = sx + 0.3*sz, y = -sy */
      const px=BSX+sx+0.35*sz, py=BSY-sy;

      /* Trail */
      TRAIL.push({x:px,y:py,a:1});
      if(TRAIL.length>80) TRAIL.shift();
      TRAIL.forEach((t,i)=>{
        ctx.fillStyle=V.vio+Math.floor((i/TRAIL.length)*180).toString(16).padStart(2,"0");
        ctx.beginPath(); ctx.arc(t.x,t.y,1.2,0,TAU); ctx.fill();
      });

      /* State vector line from center to state point */
      ctx.strokeStyle=V.vio+"AA"; ctx.lineWidth=1.5;
      ctx.beginPath(); ctx.moveTo(BSX,BSY); ctx.lineTo(px,py); ctx.stroke();
      /* State point */
      const pGrd=ctx.createRadialGradient(px,py,0,px,py,8);
      pGrd.addColorStop(0,V.vio+"FF"); pGrd.addColorStop(1,V.vio+"00");
      ctx.fillStyle=pGrd; ctx.beginPath(); ctx.arc(px,py,8,0,TAU); ctx.fill();
      ctx.fillStyle=V.vio; ctx.beginPath(); ctx.arc(px,py,3,0,TAU); ctx.fill();

      /* Probability bars */
      const p0=Math.pow(Math.cos(theta/2),2);
      const p1=1-p0;
      const bx=BSX-30, by=BSY+BSR+18;
      ctx.fillStyle=V.blue+"33"; ctx.fillRect(bx,by,60*p0,10);
      ctx.fillStyle=V.rose+"33"; ctx.fillRect(bx+60*p0,by,60*p1,10);
      ctx.strokeStyle=V.dim; ctx.lineWidth=0.5; ctx.strokeRect(bx,by,60,10);
      ctx.fillStyle=V.blue; ctx.font=`5.5px ${V.mono}`; ctx.textAlign="left";
      ctx.fillText(`P|0⟩=${p0.toFixed(2)}`,bx,by+22);
      ctx.fillStyle=V.rose; ctx.textAlign="right";
      ctx.fillText(`P|1⟩=${p1.toFixed(2)}`,bx+60,by+22);

      /* Schrödinger equation label */
      ctx.fillStyle=V.vio; ctx.font=`6px ${V.mono}`; ctx.textAlign="center";
      ctx.fillText("iℏ ∂|ψ⟩/∂t = Ĥ|ψ⟩",BSX,BSY+BSR+45);
      ctx.fillStyle=V.dim; ctx.font=`5.5px ${V.mono}`;
      ctx.fillText("U(t) = e^(−iĤt/ℏ)",BSX,BSY+BSR+57);
      ctx.fillText("ψ(t) = U(t)ψ(0)",BSX,BSY+BSR+68);

      /* Unitary evolution spiral (decorative) */
      ctx.strokeStyle=V.vio+"22"; ctx.lineWidth=0.6;
      ctx.beginPath();
      for(let i=0;i<200;i++){
        const a=i*0.12+frame*0.01;
        const r=8+i*0.15;
        const hx=BSX+Math.cos(a)*r, hy=BSY+BSR+85+i*0.02;
        if(i===0) ctx.moveTo(hx,hy); else ctx.lineTo(hx,hy);
      }
      ctx.stroke();
      ctx.fillStyle=V.dim; ctx.font=`5px ${V.mono}`; ctx.textAlign="center";
      ctx.fillText("unitary evolution",BSX,CH-8);

      /* ── GR SPACETIME FABRIC (center) ── */
      gwPhase+=0.015;
      ctx.fillStyle=V.dim; ctx.font=`7px ${V.mono}`; ctx.textAlign="center";
      ctx.fillText("GENERAL RELATIVITY · SPACETIME CURVATURE",GRX,20);

      const gox=GRX-GW/2, goy=GRY-GH/2;
      const massR2=400; /* influence radius squared in grid units */
      /* Grid lines */
      for(let c=0;c<=GCOLS;c++){
        ctx.beginPath(); ctx.strokeStyle=V.blue+"22"; ctx.lineWidth=0.6;
        for(let r=0;r<=GROWS;r++){
          const gx=(c-GCOLS/2)*GSPX, gy=(r-GROWS/2)*GSPY;
          const dist2=gx*gx+gy*gy;
          const mass=Math.max(0,1-dist2/(massR2*3));
          /* Gravitational well: shift inward */
          const pullFac=mass*30;
          const angle2=Math.atan2(gy,gx);
          const warpX=gox+c*GSPX - Math.cos(angle2)*pullFac;
          const warpY=goy+r*GSPY - Math.sin(angle2)*pullFac;
          /* Gravitational wave ripple */
          const dist=Math.sqrt(dist2);
          const ripple=Math.sin(dist*0.05-gwPhase)*1.5*(1-clamp(dist/200,0,1));
          const wx=warpX+Math.cos(angle2+Math.PI/2)*ripple;
          const wy=warpY+Math.sin(angle2+Math.PI/2)*ripple;
          if(r===0) ctx.moveTo(wx,wy); else ctx.lineTo(wx,wy);
        }
        ctx.stroke();
      }
      for(let r=0;r<=GROWS;r++){
        ctx.beginPath(); ctx.strokeStyle=V.blue+"22"; ctx.lineWidth=0.6;
        for(let c=0;c<=GCOLS;c++){
          const gx=(c-GCOLS/2)*GSPX, gy=(r-GROWS/2)*GSPY;
          const dist2=gx*gx+gy*gy;
          const mass=Math.max(0,1-dist2/(massR2*3));
          const pullFac=mass*30;
          const angle2=Math.atan2(gy,gx);
          const warpX=gox+c*GSPX - Math.cos(angle2)*pullFac;
          const warpY=goy+r*GSPY - Math.sin(angle2)*pullFac;
          const dist=Math.sqrt(dist2);
          const ripple=Math.sin(dist*0.05-gwPhase)*1.5*(1-clamp(dist/200,0,1));
          const wx=warpX+Math.cos(angle2+Math.PI/2)*ripple;
          const wy=warpY+Math.sin(angle2+Math.PI/2)*ripple;
          if(c===0) ctx.moveTo(wx,wy); else ctx.lineTo(wx,wy);
        }
        ctx.stroke();
      }

      /* Central mass */
      const massGrd=ctx.createRadialGradient(GRX,GRY,0,GRX,GRY,22);
      massGrd.addColorStop(0,"#FFE08888"); massGrd.addColorStop(0.5,V.gold+"55"); massGrd.addColorStop(1,"transparent");
      ctx.fillStyle=massGrd; ctx.beginPath(); ctx.arc(GRX,GRY,22,0,TAU); ctx.fill();
      ctx.fillStyle=V.gold; ctx.beginPath(); ctx.arc(GRX,GRY,10,0,TAU); ctx.fill();
      /* Schwarzschild label */
      ctx.fillStyle=V.gold; ctx.font=`6px ${V.mono}`; ctx.textAlign="center";
      ctx.fillText("M",GRX,GRY+4);
      ctx.fillStyle=V.dim; ctx.font=`5.5px ${V.mono}`;
      ctx.fillText("r_s = 2GM/c²",GRX,GRY+34);
      /* Light cone */
      ctx.strokeStyle=V.shock+"44"; ctx.lineWidth=0.8; ctx.setLineDash([2,3]);
      ctx.beginPath(); ctx.moveTo(GRX,GRY+60); ctx.lineTo(GRX-45,GRY-20); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(GRX,GRY+60); ctx.lineTo(GRX+45,GRY-20); ctx.stroke();
      ctx.setLineDash([]);
      ctx.fillStyle=V.shock; ctx.font=`5px ${V.mono}`; ctx.textAlign="center";
      ctx.fillText("LIGHT CONE",GRX,GRY+73);
      /* GW label */
      ctx.fillStyle=V.blue; ctx.font=`6px ${V.mono}`; ctx.textAlign="center";
      ctx.fillText("Gμν + Λgμν = 8πG/c⁴ Tμν",GRX,CH-18);
      ctx.fillStyle=V.dim; ctx.font=`5px ${V.mono}`;
      ctx.fillText("gravitational wave ripple",GRX,CH-8);

      /* ── STRING THEORY (right) ── */
      if(frame%200===0) stringMode=(stringMode%3)+1;
      ctx.fillStyle=V.dim; ctx.font=`7px ${V.mono}`; ctx.textAlign="center";
      ctx.fillText("STRING THEORY · VIBRATIONAL MODES",STX,20);

      /* Open string fixed at two endpoints */
      const s1x=STX-STL, s1y=STY, s2x=STX+STL, s2y=STY;
      const MCOLS=[V.blue,V.green,V.gold];
      ctx.strokeStyle=MCOLS[stringMode-1]; ctx.lineWidth=2;
      ctx.beginPath();
      for(let i=0;i<=STN;i++){
        const t=i/STN;
        const bx2=s1x+t*(s2x-s1x);
        const amp=28*Math.sin(Math.PI*t*stringMode)*Math.sin(frame*0.06);
        const by2=s1y+amp;
        if(i===0) ctx.moveTo(bx2,by2); else ctx.lineTo(bx2,by2);
      }
      ctx.stroke();
      /* Endpoint dots */
      [s1x,s2x].forEach(ex=>{
        ctx.fillStyle=V.plasma; ctx.beginPath(); ctx.arc(ex,STY,4,0,TAU); ctx.fill();
      });
      /* Mode label */
      const mNames=["FUNDAMENTAL (n=1)","SECOND HARMONIC (n=2)","THIRD HARMONIC (n=3)"];
      ctx.fillStyle=MCOLS[stringMode-1]; ctx.font=`6.5px ${V.mono}`; ctx.textAlign="center";
      ctx.fillText(mNames[stringMode-1],STX,STY-52);
      ctx.fillStyle=V.dim; ctx.font=`5.5px ${V.mono}`;
      ctx.fillText("E = ℏc/l_s · (n+α₀-a)",STX,STY-40);
      ctx.fillText(`n = ${stringMode}  ·  mass ∝ n/α'`,STX,STY-29);

      /* Vibrational node dots */
      for(let n=0;n<=stringMode;n++){
        const nx2=s1x+(n/stringMode)*(s2x-s1x);
        ctx.fillStyle=V.plasma+"88"; ctx.beginPath(); ctx.arc(nx2,STY,2.5,0,TAU); ctx.fill();
      }

      /* Compactified extra dimension: small torus */
      const TX=STX, TY=STY+100, TR1=16, TR2=7;
      ctx.strokeStyle=V.vio+"44"; ctx.lineWidth=0.8;
      ctx.beginPath(); ctx.ellipse(TX,TY,TR1+TR2,TR2*0.5,0,0,TAU); ctx.stroke();
      ctx.beginPath(); ctx.ellipse(TX,TY,TR1-TR2,TR2*0.5,0,0,TAU); ctx.stroke();
      /* Animated path around torus */
      const ta=frame*0.04;
      const torX=TX+(TR1+TR2*Math.cos(ta*3))*Math.cos(ta);
      const torY=TY+(TR2*0.5*Math.cos(ta*3))*1;
      ctx.fillStyle=V.vio; ctx.beginPath(); ctx.arc(torX,torY,2.5,0,TAU); ctx.fill();
      ctx.fillStyle=V.vio; ctx.font=`5.5px ${V.mono}`; ctx.textAlign="center";
      ctx.fillText("CALABI-YAU",TX,TY+28);
      ctx.fillText("6 compact dims",TX,TY+39);

      /* Holographic boundary strip (far right) */
      const HX=CW-18, HY=40, HH=CH-80;
      const hGrd=ctx.createLinearGradient(HX-12,0,HX,0);
      hGrd.addColorStop(0,"transparent"); hGrd.addColorStop(1,V.cyan+"33");
      ctx.fillStyle=hGrd; ctx.fillRect(HX-12,HY,12,HH);
      ctx.strokeStyle=V.cyan+"88"; ctx.lineWidth=1;
      ctx.beginPath(); ctx.moveTo(HX,HY); ctx.lineTo(HX,HY+HH); ctx.stroke();
      /* Pixels on boundary */
      for(let hy2=HY;hy2<HY+HH;hy2+=8){
        const bright=0.3+0.7*Math.abs(Math.sin(hy2*0.08+frame*0.02));
        const pixCol=Math.floor(bright*255);
        ctx.fillStyle=`rgba(0,220,255,${bright*0.5})`;
        ctx.fillRect(HX-10,hy2,10,7);
      }
      ctx.save(); ctx.translate(HX+5,HY+HH/2); ctx.rotate(Math.PI/2);
      ctx.fillStyle=V.cyan; ctx.font=`6px ${V.mono}`; ctx.textAlign="center";
      ctx.fillText("HOLOGRAPHIC BOUNDARY · AdS/CFT",0,0);
      ctx.restore();
      /* Dotted lines from GR mass to boundary */
      ctx.strokeStyle=V.cyan+"22"; ctx.lineWidth=0.5; ctx.setLineDash([2,4]);
      for(let hy2=HY+20;hy2<HY+HH;hy2+=40){
        ctx.beginPath(); ctx.moveTo(GRX+40,hy2); ctx.lineTo(HX-12,hy2); ctx.stroke();
      }
      ctx.setLineDash([]);
      ctx.fillStyle=V.cyan; ctx.font=`5.5px ${V.mono}`; ctx.textAlign="center";
      ctx.fillText("S = A/4l_p²",HX-5,HY+HH+14);

      /* Information ascending label (center) */
      ctx.fillStyle=V.dim; ctx.font=`6px ${V.mono}`; ctx.textAlign="center";
      ctx.fillText("INFORMATION HIERARCHY: QUARK → ATOM → BIT → GEOMETRY → HOLOGRAM",CW/2,CH-5);

      frame++; raf=requestAnimationFrame(draw);
    };
    draw();
    return()=>cancelAnimationFrame(raf);
  },[]);
  return <canvas ref={ref} style={{width:"100%",height:"500px",borderRadius:6,display:"block"}}/>;
}

/* ─────────────────────────────────────────────────────────────────────────
   CANVAS 2 · HDD Simulation · Spinning Platter · Magnetic Domains · SMART
   ───────────────────────────────────────────────────────────────────────── */
function HDDCanvas() {
  const ref=useRef<HTMLCanvasElement>(null);
  useEffect(()=>{
    const cv=ref.current; if(!cv) return;
    const CH=480, PR=window.devicePixelRatio||1;
    const CW=Math.max(cv.offsetWidth,520);
    cv.width=CW*PR; cv.height=CH*PR; cv.style.height=CH+"px";
    const ctx=cv.getContext("2d")!; ctx.scale(PR,PR);
    let frame=0, raf=0;

    /* Platter */
    const PCX=CW*0.33, PCY=235, PR_outer=165, PR_inner=28;
    const RPM=7200, TRACKS=8;
    /* Track radii */
    const trackR=Array.from({length:TRACKS},(_,i)=>PR_inner+((PR_outer-PR_inner)*(i+0.5)/TRACKS));
    /* Domains per track: more on outer tracks (higher linear density) */
    const trackDomains=trackR.map(r=>Math.floor(r*1.8));
    /* Domain states: each domain is a bit (N/S polarity) */
    const domains=trackDomains.map(n=>Array.from({length:n},()=>Math.random()>0.5?1:-1));
    /* Head arm angle */
    let headAngle=-Math.PI*0.6;
    let headTarget=-Math.PI*0.3;
    let headVel=0;
    /* Currently reading track */
    let activeTrack=3;
    /* Write burst state */
    let writeBurstT=0;
    const WRITE_BURST_DUR=60;
    /* Rotation angle */
    let plateRotation=0;
    /* Seek events every 400 frames */
    let seekTimer=0;
    /* SMART health */
    let powerOnHours=14328;
    let temperature=34;
    let reallocatedSectors=0;
    let readErrorRate=0;

    const draw=()=>{
      ctx.clearRect(0,0,CW,CH);
      const bg=ctx.createLinearGradient(0,0,0,CH);
      bg.addColorStop(0,"#04060E"); bg.addColorStop(1,"#050810");
      ctx.fillStyle=bg; ctx.fillRect(0,0,CW,CH);

      /* Rotate platter */
      plateRotation+=RPM/60/60*TAU*0.5; /* slowed for visual */

      /* Seek events */
      seekTimer++;
      if(seekTimer>350){
        seekTimer=0;
        activeTrack=Math.floor(Math.random()*TRACKS);
        headTarget=-Math.PI*0.1 - (activeTrack/TRACKS)*Math.PI*0.9;
        writeBurstT=0;
      }
      /* Spring-damper head seek */
      const kSpring=0.08, kDamp=0.18;
      headVel+=(headTarget-headAngle)*kSpring - headVel*kDamp;
      headAngle+=headVel;
      /* Writing */
      if(writeBurstT<WRITE_BURST_DUR){
        writeBurstT++;
        const t=trackR[activeTrack];
        const sectorIdx=Math.floor((plateRotation%(TAU))/TAU*trackDomains[activeTrack]);
        if(sectorIdx<domains[activeTrack].length){
          domains[activeTrack][sectorIdx]=Math.random()>0.5?1:-1;
        }
      }

      /* ── Platter disk ── */
      ctx.save(); ctx.translate(PCX,PCY); ctx.rotate(plateRotation);
      /* Platter surface */
      const platGrd=ctx.createRadialGradient(0,0,PR_inner,0,0,PR_outer);
      platGrd.addColorStop(0,"#101828"); platGrd.addColorStop(0.3,"#1A2840"); platGrd.addColorStop(1,"#0E1824");
      ctx.fillStyle=platGrd; ctx.beginPath(); ctx.arc(0,0,PR_outer,0,TAU); ctx.fill();
      /* Hub */
      ctx.fillStyle="#243040"; ctx.beginPath(); ctx.arc(0,0,PR_inner,0,TAU); ctx.fill();
      ctx.strokeStyle="#3A5060"; ctx.lineWidth=1; ctx.beginPath(); ctx.arc(0,0,PR_inner,0,TAU); ctx.stroke();
      ctx.fillStyle="#1A3050"; ctx.beginPath(); ctx.arc(0,0,10,0,TAU); ctx.fill();
      /* Track rings (thin lines) */
      trackR.forEach((r,ti)=>{
        ctx.strokeStyle=ti===activeTrack?"#2A6080":"#162030";
        ctx.lineWidth=ti===activeTrack?2:0.5;
        ctx.beginPath(); ctx.arc(0,0,r,0,TAU); ctx.stroke();
      });
      /* Magnetic domains */
      domains.forEach((domArr,ti)=>{
        const r=trackR[ti];
        const trackW=(ti<TRACKS-1?trackR[ti+1]-r:14)*0.7;
        domArr.forEach((polarity,di)=>{
          const a1=(di/domArr.length)*TAU;
          const a2=((di+1)/domArr.length)*TAU;
          /* North (1): blue, South (-1): red-purple */
          const isActive=ti===activeTrack;
          ctx.fillStyle=polarity===1
            ?(isActive?"#2244AA":"#1A2A44")
            :(isActive?"#AA2244":"#3A1A2A");
          ctx.beginPath(); ctx.moveTo(0,0);
          ctx.arc(0,0,r+trackW/2,a1,a2);
          ctx.arc(0,0,r-trackW/2,a2,a1,true);
          ctx.closePath(); ctx.fill();
        });
      });
      ctx.restore();

      /* Platter edge ring */
      ctx.strokeStyle="#3A5060"; ctx.lineWidth=2;
      ctx.beginPath(); ctx.arc(PCX,PCY,PR_outer,0,TAU); ctx.stroke();
      /* Disk label */
      ctx.fillStyle=V.dim; ctx.font=`6px ${V.mono}`; ctx.textAlign="center";
      ctx.fillText("7200 RPM · PERPENDICULAR RECORDING",PCX,PCY+PR_outer+18);
      ctx.fillText(`${(RPM/60).toFixed(0)} rev/s · ${(RPM/60*TAU*trackR[0]/TAU*2).toFixed(0)} mm/s (inner)`,PCX,PCY+PR_outer+30);

      /* ── Read/Write Arm ── */
      const armPivotX=PCX+PR_outer-20, armPivotY=PCY+PR_outer-20;
      const headR=trackR[activeTrack];
      const headX=PCX+Math.cos(headAngle)*headR;
      const headY=PCY+Math.sin(headAngle)*headR;
      /* Arm body */
      ctx.strokeStyle="#88AACC"; ctx.lineWidth=4;
      ctx.lineCap="round";
      ctx.beginPath(); ctx.moveTo(armPivotX,armPivotY); ctx.lineTo(headX,headY); ctx.stroke();
      ctx.lineCap="butt";
      /* Arm pivot */
      ctx.fillStyle="#3A5070"; ctx.beginPath(); ctx.arc(armPivotX,armPivotY,8,0,TAU); ctx.fill();
      ctx.strokeStyle="#88AACC"; ctx.lineWidth=1;
      ctx.beginPath(); ctx.arc(armPivotX,armPivotY,8,0,TAU); ctx.stroke();
      /* Read head */
      const headGrd=ctx.createRadialGradient(headX,headY,0,headX,headY,10);
      headGrd.addColorStop(0,writeBurstT<WRITE_BURST_DUR?V.plasma+"CC":V.cyan+"CC");
      headGrd.addColorStop(1,"transparent");
      ctx.fillStyle=headGrd; ctx.beginPath(); ctx.arc(headX,headY,10,0,TAU); ctx.fill();
      ctx.fillStyle=writeBurstT<WRITE_BURST_DUR?V.plasma:V.cyan;
      ctx.beginPath(); ctx.arc(headX,headY,4,0,TAU); ctx.fill();
      /* Head label */
      ctx.fillStyle=writeBurstT<WRITE_BURST_DUR?V.plasma:V.cyan;
      ctx.font=`6px ${V.mono}`; ctx.textAlign="center";
      ctx.fillText(writeBurstT<WRITE_BURST_DUR?"WRITING":"READING",headX,headY-14);
      ctx.fillText(`TRACK ${activeTrack+1}`,headX,headY-5);

      /* GMR sensor label */
      ctx.fillStyle=V.dim; ctx.font=`5.5px ${V.mono}`; ctx.textAlign="center";
      ctx.fillText("GMR MAGNETORESISTIVE SENSOR",headX,headY+20);

      /* ── RIGHT: SMART Dashboard ── */
      const SX=CW*0.64, SY=20;
      ctx.fillStyle=V.dim; ctx.font=`7px ${V.mono}`; ctx.textAlign="left";
      ctx.fillText("S.M.A.R.T. HEALTH MONITOR",SX,SY+10);
      powerOnHours+=0.001;

      const attrs=[
        {id:"01",name:"READ ERROR RATE",val:readErrorRate,max:100,col:V.green,unit:""},
        {id:"03",name:"SPIN-UP TIME",val:400,max:2000,col:V.blue,unit:"ms"},
        {id:"05",name:"REALLOCATED SCTRS",val:reallocatedSectors,max:100,col:reallocatedSectors>0?V.plasma:V.green,unit:""},
        {id:"09",name:"POWER-ON HOURS",val:Math.floor(powerOnHours),max:87600,col:V.amb,unit:"hr"},
        {id:"0A",name:"SPIN RETRY COUNT",val:0,max:100,col:V.green,unit:""},
        {id:"C0",name:"UNSAFE SHUTDOWN",val:3,max:100,col:V.amb,unit:""},
        {id:"C2",name:"TEMPERATURE",val:temperature+Math.sin(frame*0.01)*0.5,max:70,col:temperature>50?V.plasma:V.green,unit:"°C"},
        {id:"C5",name:"CURRENT PENDING",val:0,max:100,col:V.green,unit:""},
        {id:"F1",name:"TOTAL LBA WRITTEN",val:12847,max:99999,col:V.vio,unit:"GB"},
      ];

      attrs.forEach((a,i)=>{
        const ay=SY+28+i*45;
        const frac=clamp(typeof a.val==="number"?a.val/a.max:0,0,1);
        ctx.fillStyle=a.col+"10"; ctx.fillRect(SX,ay-12,CW-SX-8,40);
        ctx.strokeStyle=a.col+"22"; ctx.lineWidth=0.5; ctx.strokeRect(SX,ay-12,CW-SX-8,40);
        /* ID + name */
        ctx.fillStyle="#3A5060"; ctx.font=`5px ${V.mono}`; ctx.textAlign="left";
        ctx.fillText(`0x${a.id}`,SX+4,ay+1);
        ctx.fillStyle=a.col; ctx.font=`6px ${V.mono}`;
        ctx.fillText(a.name,SX+30,ay+1);
        /* Value */
        ctx.fillStyle=V.ink; ctx.font=`bold 8px ${V.mono}`; ctx.textAlign="right";
        ctx.fillText(`${typeof a.val==="number"?a.val.toFixed(a.unit==="°C"?1:0):a.val}${a.unit}`,CW-14,ay+1);
        /* Bar */
        ctx.fillStyle="#1A2030"; ctx.fillRect(SX+4,ay+8,CW-SX-18,8);
        ctx.fillStyle=a.col+"88"; ctx.fillRect(SX+4,ay+8,(CW-SX-18)*frac,8);
        ctx.strokeStyle=a.col+"33"; ctx.lineWidth=0.5; ctx.strokeRect(SX+4,ay+8,CW-SX-18,8);
      });

      /* Health score */
      const healthY=SY+attrs.length*45+30;
      const health=97-reallocatedSectors*5;
      const hGrd=ctx.createLinearGradient(SX,0,CW-8,0);
      hGrd.addColorStop(0,V.plasma); hGrd.addColorStop(0.5,V.amb); hGrd.addColorStop(1,V.green);
      ctx.fillStyle=V.dim; ctx.font=`7px ${V.mono}`; ctx.textAlign="left";
      ctx.fillText("DRIVE HEALTH",SX,healthY);
      ctx.fillStyle="#1A2030"; ctx.fillRect(SX,healthY+8,CW-SX-8,16);
      ctx.fillStyle=hGrd; ctx.fillRect(SX,healthY+8,(CW-SX-8)*(health/100),16);
      ctx.fillStyle=V.ink; ctx.font=`bold 9px ${V.mono}`; ctx.textAlign="center";
      ctx.fillText(`${health}% HEALTHY`,SX+(CW-SX-8)/2,healthY+20);

      /* Estimated life */
      ctx.fillStyle=V.dim; ctx.font=`5.5px ${V.mono}`; ctx.textAlign="left";
      ctx.fillText("Estimated remaining life: 3.8 years · Predicted fail: 2029-11",SX,healthY+38);
      ctx.fillText("Backfield: 420 Oe · Bit density: 1.3 Tb/in² · Heads: GMR",SX,healthY+50);

      frame++; raf=requestAnimationFrame(draw);
    };
    draw();
    return()=>cancelAnimationFrame(raf);
  },[]);
  return <canvas ref={ref} style={{width:"100%",height:"480px",borderRadius:6,display:"block"}}/>;
}

/* ─────────────────────────────────────────────────────────────────────────
   CANVAS 3 · SSD Simulation · NAND Flash · Wear Leveling · Magnetic Hysteresis
   ───────────────────────────────────────────────────────────────────────── */
function SSDMagneticCanvas() {
  const ref=useRef<HTMLCanvasElement>(null);
  useEffect(()=>{
    const cv=ref.current; if(!cv) return;
    const CH=480, PR=window.devicePixelRatio||1;
    const CW=Math.max(cv.offsetWidth,520);
    cv.width=CW*PR; cv.height=CH*PR; cv.style.height=CH+"px";
    const ctx=cv.getContext("2d")!; ctx.scale(PR,PR);
    let frame=0, raf=0;

    /* NAND flash cell grid: 16×8 = 128 cells */
    const COLS=16, ROWS=8;
    const CELL_W=14, CELL_H=16, CELL_GAP=3;
    const GRID_X=12, GRID_Y=30;
    /* P/E cycle count per cell (0 = fresh, 3000 = worn) */
    const peCycles=Array.from({length:ROWS},()=>Array.from({length:COLS},()=>Math.floor(Math.random()*1200)));
    /* Cell data (0=erased, 1-7 = multi-level charge) */
    const cellData=Array.from({length:ROWS},()=>Array.from({length:COLS},()=>Math.floor(Math.random()*8)));
    /* Write pointer (wear leveling: round-robin across columns) */
    let writeCol=0, writeRow=0;
    let writeTimer=0;
    /* Wear leveling events */
    const WL_THRESHOLD=2000;

    /* Magnetic hysteresis state */
    let hField=-1.5; /* applied field H */
    let hDir=1; /* direction: sweeping H */
    let bMag=0; /* magnetic flux density B */

    const draw=()=>{
      ctx.clearRect(0,0,CW,CH);
      const bg=ctx.createLinearGradient(0,0,0,CH);
      bg.addColorStop(0,"#04060E"); bg.addColorStop(1,"#060810");
      ctx.fillStyle=bg; ctx.fillRect(0,0,CW,CH);

      /* ── LEFT: NAND Flash Grid ── */
      ctx.fillStyle=V.dim; ctx.font=`7px ${V.mono}`; ctx.textAlign="left";
      ctx.fillText("TLC NAND FLASH · WEAR-LEVELING CONTROLLER",GRID_X,18);

      /* Write a new cell every 12 frames using wear leveling */
      writeTimer++;
      if(writeTimer>12){
        writeTimer=0;
        /* Find least-worn column (wear leveling algorithm) */
        const colWear=Array.from({length:COLS},(_,c)=>
          peCycles.reduce((s,row)=>s+row[c],0));
        const minWear=Math.min(...colWear);
        const candidates=colWear.map((w,i)=>w<=minWear+200?i:-1).filter(i=>i>=0);
        writeCol=candidates[Math.floor(Math.random()*candidates.length)];
        writeRow=Math.floor(Math.random()*ROWS);
        peCycles[writeRow][writeCol]=Math.min(3000,peCycles[writeRow][writeCol]+1);
        cellData[writeRow][writeCol]=Math.floor(Math.random()*8);
      }

      /* Draw cells */
      for(let r=0;r<ROWS;r++){
        for(let c=0;c<COLS;c++){
          const cx2=GRID_X+c*(CELL_W+CELL_GAP);
          const cy2=GRID_Y+r*(CELL_H+CELL_GAP);
          const pe=peCycles[r][c];
          const worn=pe/3000; /* 0=fresh, 1=worn */
          const charge=cellData[r][c]/7; /* 0=erased, 1=full */
          const isActive=r===writeRow&&c===writeCol;

          /* Cell background: worn cells shift toward red */
          const rr=Math.floor(lerp(30,180,worn));
          const gg=Math.floor(lerp(50,30,worn));
          const bb=Math.floor(lerp(80,30,worn));
          ctx.fillStyle=isActive?V.shock+`33`:`rgb(${rr},${gg},${bb})`;
          ctx.fillRect(cx2,cy2,CELL_W,CELL_H);

          /* Charge level (blue fill height) */
          if(!isActive){
            const chargeH=Math.floor(CELL_H*charge);
            const chargeGrd=ctx.createLinearGradient(0,cy2+CELL_H-chargeH,0,cy2+CELL_H);
            chargeGrd.addColorStop(0,V.blue+"CC"); chargeGrd.addColorStop(1,V.vio+"88");
            ctx.fillStyle=chargeGrd;
            ctx.fillRect(cx2+1,cy2+CELL_H-chargeH,CELL_W-2,chargeH);
          }
          /* Active cell flash */
          if(isActive){
            ctx.fillStyle=V.shock;
            ctx.fillRect(cx2,cy2,CELL_W,CELL_H);
            ctx.fillStyle="#0A0A0A"; ctx.font=`5px ${V.mono}`; ctx.textAlign="center";
            ctx.fillText("W",cx2+CELL_W/2,cy2+CELL_H/2+2);
          }
          /* Worn warning */
          if(worn>0.85&&!isActive){
            ctx.strokeStyle=V.plasma; ctx.lineWidth=1;
            ctx.strokeRect(cx2,cy2,CELL_W,CELL_H);
          }
          /* Cell border */
          ctx.strokeStyle="#1A2540"; ctx.lineWidth=0.5;
          ctx.strokeRect(cx2,cy2,CELL_W,CELL_H);
        }
      }

      /* Wear-level color legend */
      const legX=GRID_X, legY=GRID_Y+ROWS*(CELL_H+CELL_GAP)+10;
      const legW=COLS*(CELL_W+CELL_GAP)-CELL_GAP;
      const legGrd=ctx.createLinearGradient(legX,0,legX+legW,0);
      legGrd.addColorStop(0,"#1E3250"); legGrd.addColorStop(0.5,"#8A6020"); legGrd.addColorStop(1,"#B41E2A");
      ctx.fillStyle=legGrd; ctx.fillRect(legX,legY,legW,8);
      ctx.fillStyle=V.dim; ctx.font=`5.5px ${V.mono}`; ctx.textAlign="left";
      ctx.fillText("FRESH (0 P/E)",legX,legY+20);
      ctx.textAlign="right"; ctx.fillText("WORN (3,000 P/E)",legX+legW,legY+20);

      /* Wear leveling stats */
      const totalPE=peCycles.flat().reduce((a,b)=>a+b,0);
      const avgPE=(totalPE/(ROWS*COLS)).toFixed(0);
      const maxPE=Math.max(...peCycles.flat());
      ctx.textAlign="left";
      ctx.fillStyle=V.dim; ctx.font=`6px ${V.mono}`;
      ctx.fillText(`AVG P/E: ${avgPE}  |  MAX: ${maxPE}  |  WRITE: col ${writeCol+1} row ${writeRow+1}`,legX,legY+34);
      ctx.fillStyle=V.cyan; ctx.font=`6.5px ${V.mono}`;
      ctx.fillText("WEAR LEVELING: DYNAMIC + STATIC · TRIM ACTIVE",legX,legY+46);

      /* Controller block below */
      const CBX=GRID_X, CBY=legY+60, CBW=COLS*(CELL_W+CELL_GAP)-CELL_GAP, CBH=70;
      ctx.fillStyle=V.blue+"0A"; ctx.fillRect(CBX,CBY,CBW,CBH);
      ctx.strokeStyle=V.blue+"33"; ctx.lineWidth=0.8; ctx.strokeRect(CBX,CBY,CBW,CBH);
      ctx.fillStyle=V.blue; ctx.font=`6px ${V.mono}`; ctx.textAlign="left";
      ctx.fillText("NVMe CONTROLLER · PCIe 4.0 × 4",CBX+5,CBY+14);
      const ctrlAttrs=[
        "• ECC: LDPC (Low Density Parity Check) — corrects multi-bit errors",
        "• TRIM: OS notifies SSD of freed blocks — erase before write",
        "• Over-provisioning: 7% reserved — wear buffer + bad block replacement",
        "• DRAM cache: 1 GB LPDDR4 — hot data + map table acceleration",
        "• Thermal throttle: 70°C → 50% speed · 80°C → 20% · 85°C → halt",
      ];
      ctrlAttrs.forEach((a,i)=>{
        ctx.fillStyle=V.ink+"AA"; ctx.font=`5.5px ${V.mono}`;
        ctx.fillText(a,CBX+5,CBY+26+i*9);
      });

      /* ── CENTER: Magnetic Hysteresis Loop ── */
      const HX=CW*0.47, HY=CH*0.22, HW=90, HH=90;
      ctx.fillStyle=V.dim; ctx.font=`7px ${V.mono}`; ctx.textAlign="center";
      ctx.fillText("MAGNETIC HYSTERESIS · B-H LOOP",HX,HY-HH-22);

      /* Axes */
      ctx.strokeStyle="#2A3050"; ctx.lineWidth=0.8;
      ctx.beginPath(); ctx.moveTo(HX-HW,HY); ctx.lineTo(HX+HW,HY); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(HX,HY-HH); ctx.lineTo(HX,HY+HH); ctx.stroke();
      ctx.fillStyle=V.dim; ctx.font=`6px ${V.mono}`; ctx.textAlign="center";
      ctx.fillText("H (field)",HX+HW+5,HY+3);
      ctx.fillText("B",HX+3,HY-HH-5);
      /* Saturation labels */
      ctx.fillStyle=V.dim; ctx.font=`5px ${V.mono}`;
      ctx.fillText("Bs",HX+4,HY-HH+8); ctx.fillText("-Bs",HX+4,HY+HH-4);
      ctx.fillText("Hc",HX-32,HY-8); ctx.fillText("-Hc",HX+28,HY-8);
      ctx.fillText("Br",HX+4,HY-40);

      /* Hysteresis loop path */
      const loopPoints:Array<[number,number]>=[];
      const Hc=0.35, Br=0.7, Bs=1.0, Hs=1.5;
      const loopH=(hVal:number,upper:boolean):number=>{
        const h=hVal/Hs;
        if(upper){
          if(h>0.5) return lerp(Br,Bs,(h-0.5)/0.5);
          if(h>-0.5) return lerp(-Bs*0.1,Br,(h+0.5)/1.0);
          return lerp(-Bs,-Bs*0.1,(h+1.5)/1.0);
        } else {
          if(h<-0.5) return lerp(-Br,-Bs,(-h-0.5)/0.5);
          if(h<0.5) return lerp(Bs*0.1,-Br,(-h+0.5)/1.0);
          return lerp(Bs,Bs*0.1,(-h+1.5)/1.0);
        }
      };
      /* Upper loop */
      for(let i=0;i<=80;i++){
        const h=lerp(-Hs,Hs,i/80);
        const b=loopH(h,true);
        loopPoints.push([HX+h/Hs*HW, HY-b*HH]);
      }
      /* Lower loop */
      for(let i=0;i<=80;i++){
        const h=lerp(Hs,-Hs,i/80);
        const b=loopH(h,false);
        loopPoints.push([HX+h/Hs*HW, HY-b*HH]);
      }
      /* Draw loop */
      const loopGrd=ctx.createLinearGradient(HX-HW,0,HX+HW,0);
      loopGrd.addColorStop(0,V.rose+"CC"); loopGrd.addColorStop(0.5,V.vio+"CC"); loopGrd.addColorStop(1,V.blue+"CC");
      ctx.strokeStyle=loopGrd; ctx.lineWidth=2;
      ctx.beginPath(); loopPoints.forEach(([x,y],i)=>i===0?ctx.moveTo(x,y):ctx.lineTo(x,y));
      ctx.closePath(); ctx.stroke();
      /* Fill loop interior */
      ctx.fillStyle=V.vio+"08";
      ctx.beginPath(); loopPoints.forEach(([x,y],i)=>i===0?ctx.moveTo(x,y):ctx.lineTo(x,y));
      ctx.closePath(); ctx.fill();

      /* Animate operating point */
      hField+=hDir*0.018;
      if(hField>1.5){ hDir=-1; }
      if(hField<-1.5){ hDir=1; }
      /* Interpolate B */
      const isUpper=hDir>0;
      bMag=loopH(hField,isUpper);
      const opX=HX+hField/Hs*HW, opY=HY-bMag*HH;
      ctx.fillStyle=V.shock; ctx.beginPath(); ctx.arc(opX,opY,4,0,TAU); ctx.fill();
      /* Domain region label */
      const region=bMag>0.3?"NORTH ↑":bMag<-0.3?"SOUTH ↓":"COERCIVE ZONE";
      ctx.fillStyle=V.shock; ctx.font=`5.5px ${V.mono}`; ctx.textAlign="center";
      ctx.fillText(region,HX,HY+HH+14);
      ctx.fillText(`H = ${hField.toFixed(2)} Oe  ·  B = ${bMag.toFixed(2)} T`,HX,HY+HH+26);

      /* Domain visualisation (small arrows showing magnetic alignment) */
      const DMX=HX-45, DMY=HY+HH+45, DMW=90, DMH=36;
      ctx.fillStyle="#1A2030"; ctx.fillRect(DMX,DMY,DMW,DMH);
      ctx.strokeStyle=V.dim; ctx.lineWidth=0.5; ctx.strokeRect(DMX,DMY,DMW,DMH);
      ctx.fillStyle=V.dim; ctx.font=`5px ${V.mono}`; ctx.textAlign="center";
      ctx.fillText("MAGNETIC DOMAINS",HX,DMY-6);
      const DCOLS=12, DROWS=3;
      for(let dr=0;dr<DROWS;dr++){
        for(let dc=0;dc<DCOLS;dc++){
          const dx=DMX+4+dc*(DMW/DCOLS), dy2=DMY+4+dr*(DMH/DROWS);
          const domAngle=bMag>0.2?0:bMag<-0.2?Math.PI:(Math.random()*TAU);
          /* Arrow direction */
          const ax=Math.cos(domAngle)*4, ay2=Math.sin(domAngle)*3;
          ctx.strokeStyle=bMag>0.2?V.blue+"CC":bMag<-0.2?V.rose+"CC":V.dim+"CC";
          ctx.lineWidth=1;
          ctx.beginPath(); ctx.moveTo(dx-ax,dy2-ay2); ctx.lineTo(dx+ax,dy2+ay2); ctx.stroke();
          /* Arrowhead */
          ctx.fillStyle=bMag>0.2?V.blue:bMag<-0.2?V.rose:V.dim;
          ctx.beginPath(); ctx.arc(dx+ax,dy2+ay2,1.5,0,TAU); ctx.fill();
        }
      }

      /* ── RIGHT: Performance comparison ── */
      const PX=CW*0.65, PY=18;
      ctx.fillStyle=V.dim; ctx.font=`7px ${V.mono}`; ctx.textAlign="left";
      ctx.fillText("STORAGE PERFORMANCE COMPARISON",PX,PY+10);

      const metrics=[
        {name:"SEQ READ",     hdd:210,ssd:7100,unit:"MB/s",max:7200},
        {name:"SEQ WRITE",    hdd:185,ssd:6500,unit:"MB/s",max:7200},
        {name:"RAND 4K READ", hdd:0.5,ssd:820, unit:"MB/s",max:850},
        {name:"LATENCY",      hdd:5.0,ssd:0.05,unit:"ms",  max:5.5,invert:true},
        {name:"RAND IOPS",    hdd:150,ssd:1000000,unit:"",max:1000000},
        {name:"POWER (idle)", hdd:4.5,ssd:0.05,unit:"W",  max:5,invert:false},
        {name:"ENDURANCE",    hdd:999,ssd:600,  unit:"TB",max:999},
        {name:"ACCESS NOISE", hdd:38, ssd:0,   unit:"dB",max:40},
      ];
      metrics.forEach((m,i)=>{
        const my=PY+28+i*50;
        ctx.fillStyle="#1A2030"; ctx.fillRect(PX,my-12,CW-PX-8,45);
        ctx.strokeStyle=V.dim+"22"; ctx.lineWidth=0.5; ctx.strokeRect(PX,my-12,CW-PX-8,45);
        ctx.fillStyle=V.dim; ctx.font=`6px ${V.mono}`; ctx.textAlign="left";
        ctx.fillText(m.name+` (${m.unit})`,PX+4,my+1);
        /* HDD bar */
        const BX2=PX+4, BW=CW-PX-18;
        const hddFrac=clamp(m.hdd/m.max,0,1);
        const ssdFrac=clamp(m.ssd/m.max,0,1);
        ctx.fillStyle="#1A2540"; ctx.fillRect(BX2,my+8,BW,9);
        ctx.fillStyle=V.rose+"88"; ctx.fillRect(BX2,my+8,BW*hddFrac,9);
        ctx.fillStyle="#1A2540"; ctx.fillRect(BX2,my+19,BW,9);
        ctx.fillStyle=V.green+"88"; ctx.fillRect(BX2,my+19,BW*ssdFrac,9);
        /* Values */
        const fmtVal=(v:number,u:string)=>v>=1000000?`${(v/1000000).toFixed(1)}M`:v>=1000?`${(v/1000).toFixed(0)}K`:v<1?v.toFixed(2):v.toString();
        ctx.fillStyle=V.rose; ctx.font=`5.5px ${V.mono}`; ctx.textAlign="right";
        ctx.fillText(`HDD ${fmtVal(m.hdd,m.unit)}`,CW-14,my+16);
        ctx.fillStyle=V.green; ctx.fillText(`SSD ${fmtVal(m.ssd,m.unit)}`,CW-14,my+27);
      });

      /* Legend */
      ctx.fillStyle=V.rose; ctx.beginPath(); ctx.arc(PX+8,PY+metrics.length*50+38,4,0,TAU); ctx.fill();
      ctx.fillStyle=V.rose; ctx.font=`6px ${V.mono}`; ctx.textAlign="left"; ctx.fillText("HDD (7200rpm)",PX+16,PY+metrics.length*50+42);
      ctx.fillStyle=V.green; ctx.beginPath(); ctx.arc(PX+110,PY+metrics.length*50+38,4,0,TAU); ctx.fill();
      ctx.fillStyle=V.green; ctx.fillText("NVMe SSD (Gen4)",PX+118,PY+metrics.length*50+42);

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
export default function HilbertStoragePage() {
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
        {[badge("LIVE SIMULATION"),badge("HILBERT SPACE",V.vio),badge("SCHRÖDINGER",V.vio),
          badge("GENERAL RELATIVITY",V.gold),badge("STRING THEORY",V.green),badge("HOLOGRAPHIC BOUNDARY",V.cyan),
          badge("HDD SIMULATION",V.rose),badge("SSD SIMULATION",V.photon),badge("MAGNETISM",V.blue),
          badge("SMART HEALTH",V.amb)]}
        <h1 style={{fontFamily:V.disp,fontSize:"clamp(1.4rem,4vw,2.6rem)",color:V.ink,
          margin:"22px 0 8px",letterSpacing:"0.06em",fontWeight:400,lineHeight:1.2}}>
          HILBERT SPACE · GENERAL RELATIVITY · STRING THEORY · HDD · SSD
        </h1>
        <p style={{fontFamily:V.mono,fontSize:"0.58rem",color:V.dim,letterSpacing:3,margin:"0 0 22px"}}>
          QUANTUM EVOLUTION · MORPHOUS BOUNDARY · MAGNETIC DOMAINS · NAND WEAR LEVELING · STORAGE RELIABILITY
        </p>
        {P("Hilbert space is the mathematical arena in which quantum states live and evolve. It is an abstract vector space — potentially infinite-dimensional — equipped with an inner product, in which every possible state of a quantum system is a unit vector, and time evolution is a continuous rotation of that vector driven by the Hamiltonian operator: iℏ ∂|ψ⟩/∂t = Ĥ|ψ⟩. This rotation is always unitary — it preserves the norm of the state vector and therefore preserves information. This unitarity is the deepest reason that quantum mechanics is believed to be fundamentally information-conserving: no physical process can destroy information encoded in a quantum state, it can only scramble it. The question of how information 'ascends to a higher level' — from a qubit in Hilbert space to a physical bit in a storage medium, to a classical computation, to a macroscopic observation — is the measurement problem, still unresolved after 100 years. The decoherence programme (Zurek, Joos, Zeh) describes how quantum superpositions become classical mixtures when a system entangles with its environment: the environment acts as a 'measurement apparatus' with 10²³ degrees of freedom, collapsing the apparent wavefunction without any discontinuous jump.")}
        {P("General Relativity (GR) promotes information to a geometric level: mass-energy curves spacetime, and geodesics through curved spacetime are how information (encoded in the worldlines of particles and fields) propagates. String theory attempts the next elevation — replacing point particles with 1-dimensional vibrating strings whose harmonic modes generate the entire particle zoo (mode n=1 = massless photon/graviton, higher modes = massive particles with mass ∝ √n/α'). The holographic principle (Bekenstein, Hawking, 't Hooft, Susskind) makes the most radical claim: all the information content of a bulk 3D spacetime is fully encoded in a 2D boundary, with one bit per Planck area (l_p² ≈ 10⁻⁷⁰ m²). The AdS/CFT correspondence (Maldacena 1997) makes this precise: a quantum gravity theory in Anti-de Sitter space is exactly dual to a conformal field theory on its boundary — no information is lost, the bulk and the boundary are two descriptions of one system. Storage technology — hard disk drives using perpendicular magnetic recording, and solid-state drives using TLC NAND flash — is the engineering application of the same physics of information: how to write, preserve, and read information reliably against entropy (thermal fluctuations, oxidation, cosmic ray bit-flips, wear).")}
      </div>

      {sec("01","Hilbert Space · Quantum State Evolution · Morphous Boundary · Information Hierarchy",V.vio,<>
        {P("A qubit lives in a 2-dimensional Hilbert space ℋ₂ = ℂ². Its state is a unit vector |ψ⟩ = α|0⟩ + β|1⟩ where |α|² + |β|² = 1. The Bloch sphere is the geometric representation: every pure qubit state maps to a point on the unit sphere (θ,φ). Time evolution under a Hamiltonian H = ωσ_z/2 (where σ_z is the Pauli-Z matrix) precesses the state around the Z-axis: |ψ(t)⟩ = e^(−iωt/2)|ψ(0)⟩, tracing a circle at fixed latitude θ. For a general Hamiltonian, the evolution operator U(t) = e^(−iĤt/ℏ) is a unitary matrix (U†U = 1) — the quantum version of a rotation matrix, preserving all inner products and therefore all information. The morphous boundary — the boundary between quantum and classical, between unitary evolution and apparent collapse — is where the measurement problem lives. Decoherence theory locates this boundary at the scale where quantum coherence is lost to environmental entanglement: for a molecule at room temperature in air, the coherence time is ~10⁻¹³ seconds. For a superconducting qubit at 10 mK, it can reach 100 microseconds. The boundary is not fixed — it is determined by the coupling strength between system and environment.")}
        {P("The information hierarchy that connects Hilbert space to a storage medium has five levels. Level 1 (quantum): information encoded in superposition states, governed by Schrödinger's equation, coherent. Level 2 (decoherence boundary): entanglement with environment destroys coherence, pointer states (classical-like states preferred by the environment) emerge. Level 3 (classical bit): 0 or 1, stored in a magnetic domain (HDD) or a charge level (SSD). Level 4 (logical storage): error correction, wear leveling, RAID arrays — redundancy algorithms that fight entropy at the engineering level. Level 5 (semantic): the information has meaning in a context — a file, an image, a genome sequence, a model of reality. Each level is a morphous boundary: a phase transition in the structure of information. General Relativity operates at a sixth level — spacetime geometry itself as information carrier: the curvature tensor Gμν encodes mass-energy distribution Tμν via Einstein's field equations, and gravitational waves carry energy and information at the speed of light from merging black holes to our LIGO detectors.")}
        <div style={{border:`1px solid ${V.dim}44`,borderRadius:8,padding:2,marginBottom:14}}>
          <HilbertGRStringCanvas/>
        </div>
        {cards([
          {h:"BLOCH SPHERE",         col:V.vio,  d:"|ψ⟩ = cos(θ/2)|0⟩ + e^(iφ)sin(θ/2)|1⟩. θ ∈ [0,π], φ ∈ [0,2π). North pole = |0⟩, South = |1⟩. Equator = equal superposition. Rotation axis determined by Hamiltonian. Single qubit gate = rotation of Bloch sphere. Two-qubit entanglement: pure state maps to 4D complex unit vector, no Bloch sphere representation — Hilbert space is 4D."},
          {h:"UNITARY EVOLUTION",    col:V.blue, d:"U(t) = e^(−iĤt/ℏ). Properties: U†U = UU† = 1 (unitary). det(U) = e^(iφ) (unit modulus). Preserves inner products: ⟨ψ'|φ'⟩ = ⟨ψ|φ⟩. Consequence: no information can be created or destroyed — it can only be moved, scrambled, or transformed. Hawking radiation (1974) appeared to violate this — the 'black hole information paradox.' Current consensus (2019 island formula): information is preserved."},
          {h:"EINSTEIN FIELD EQNS",  col:V.gold, d:"Gμν + Λgμν = 8πG/c⁴ Tμν. Left: Einstein tensor (spacetime curvature, 10 independent components). Right: stress-energy tensor (mass, energy, momentum, pressure). Λ: cosmological constant (dark energy, Λ = 1.1×10⁻⁵² m⁻²). Schwarzschild radius: r_s = 2GM/c². Earth: r_s = 9mm. Sun: r_s = 3km. Black hole: r_s > actual radius. GW150914 (2015): first LIGO detection, binary BH merger, h ~ 10⁻²¹."},
          {h:"STRING THEORY MODES",  col:V.green,d:"Open string: endpoints free or fixed (Neumann/Dirichlet BCs). Closed string: periodic. Mode expansion: X^μ(σ,τ) = x^μ + p^μτ/πT + i/√(2T) Σ(aₙ/n)e^(−inτ)cos(nσ). Mass: M² = 2T(N−a) where N = oscillator level, a = normal-ordering constant. n=1 modes → massless particles (photon if open, graviton if closed). Higher modes: M ∝ √N × M_Planck = √N × 10¹⁹ GeV."},
          {h:"HOLOGRAPHIC PRINCIPLE", col:V.cyan, d:"Bekenstein-Hawking entropy: S = kA/4l_p² where A = horizon area, l_p = √(ℏG/c³) = 1.6×10⁻³⁵ m. For a 1 solar mass BH: S ~ 10⁷⁷ bits. AdS/CFT (Maldacena 1997): type IIB string theory in AdS₅×S⁵ ≡ 𝒩=4 SYM gauge theory on 4D boundary. Exact duality. Implication: 3+1D quantum gravity has a complete description in 2+1D without gravity. The hologram contains all information."},
          {h:"DECOHERENCE BOUNDARY",  col:V.amb,  d:"Decoherence time τ_d ∝ (ℏ/kT)(λ_th/Δx)². Thermal de Broglie wavelength λ_th = ℏ/√(2mkT). For a dust grain (m=10⁻¹⁵ kg, Δx=10⁻⁵ m) at T=300K: τ_d ~ 10⁻²³ s — essentially instantaneous. For electrons in a superconducting qubit at T=10mK: τ_d ~ 100μs. The morphous boundary is not a fixed line — it is a crossover region defined by the ratio of system-environment coupling to system energy spacing."},
        ])}
      </>)}

      {sec("02","Hard Disk Drive · Perpendicular Magnetic Recording · GMR · SMART Reliability",V.rose,<>
        {P("The hard disk drive (HDD) stores information as magnetic domains — nanoscale regions of a ferromagnetic thin film whose magnetic moments are aligned either 'up' (north polarity = bit 1) or 'down' (south polarity = bit 0). Modern HDDs use perpendicular magnetic recording (PMR), introduced commercially in 2005: the magnetic domains are oriented perpendicular to the disk surface (rather than the older longitudinal recording where domains lay in the plane of the disk). This allows higher areal density because the demagnetising field between adjacent perpendicular domains is weaker — bits can be packed more closely without spontaneous domain reversal. The theoretical limit of PMR is the 'superparamagnetic limit': as grain sizes shrink below ~8–10 nm, thermal energy (kT) exceeds the energy barrier for domain reversal (KuV where Ku is the magnetocrystalline anisotropy energy density and V is grain volume), and stored bits can spontaneously flip. Current hard disk media use FePt (iron platinum) alloy with very high Ku (~7 MJ/m³) specifically to push this limit to smaller grain sizes.")}
        {P("The read head uses the Giant Magnetoresistance (GMR) effect — discovered by Fert and Grünberg in 1988 (Nobel Prize 2007): electrical resistance of a ferromagnet/non-magnet/ferromagnet sandwich changes by ~10–80% depending on the relative orientation of the two magnetic layers. The bit's magnetic field rotates the free layer of the GMR stack, changing its resistance, and the current change is detected as the bit value. SMART (Self-Monitoring, Analysis and Reporting Technology) is the HDD's internal health monitoring system: dozens of attributes (read error rate, reallocated sector count, spin-up time, temperature, power-on hours, uncorrectable error count) are tracked by the drive firmware and reported to the OS. Studies of 25,000+ drives (Backblaze 2014–2024) show that: temperature between 25–40°C has little effect on failure rate; reallocated sector count > 0 doubles annual failure rate; drives older than 3 years show sharply increasing failure rates. The simulated drive above shows a 7200 RPM platter with 8 tracks, active seek events, real-time domain writing, and a live SMART dashboard.")}
        <div style={{border:`1px solid ${V.dim}44`,borderRadius:8,padding:2,marginBottom:14}}>
          <HDDCanvas/>
        </div>
        {cards([
          {h:"PERPENDICULAR RECORDING",col:V.rose, d:"Domains oriented ⊥ to disk surface. Advantages vs longitudinal: 3–5× higher areal density possible. Transition length (bit boundary width): ~10 nm. Areal density: current HDD ~1–2 Tb/in². HAMR (Heat-Assisted Magnetic Recording, Seagate 2023): laser heats media to Curie temperature during write → lower Ku → writable → cools to retain high Ku → stable. HAMR target: 5–10 Tb/in²."},
          {h:"GMR EFFECT · READ HEAD",  col:V.blue, d:"Giant Magnetoresistance: ΔR/R = (R_AP − R_P)/R_P, up to 80% in multilayers. Nobel Prize 2007 (Fert, Grünberg). Modern read head: TMR (Tunnel Magnetoresistance) based on MgO tunnel barrier. TMR ratio: 200–600%. Bit detection: head flies 3–5 nm above platter surface on air bearing. Contact start-stop (CSS) drives vs. load/unload (ramp parking in modern drives)."},
          {h:"AREAL DENSITY HISTORY",   col:V.amb,  d:"1956 (IBM 350 RAMAC): 2 kbit/in². 1980: 1 Mbit/in². 1997 (GMR introduction): 1 Gbit/in². 2000: 10 Gbit/in². 2006 (PMR adoption): 100 Gbit/in². 2023: 2 Tbit/in² (Seagate HAMR). Growth rate: ~40% per year 1990–2010, slowing to ~15% with PMR plateau. Kryder's Law (HDD equivalent of Moore's Law) has slowed — HAMR + MAMR (Microwave-Assisted MR) required to continue scaling."},
          {h:"SMART RELIABILITY",       col:V.gold, d:"Backblaze Q4 2023: 272,686 drives monitored. Annual failure rate (AFR): 1.7% for 3-year drives, 5.4% for 5-year drives. High-failure predictors: SMART 05 (reallocated sectors) > 0: 3× AFR. SMART 187 (uncorrectable errors): immediate concern. SMART 188 (command timeout): elevated AFR. SMART 197/198 (pending/uncorrectable sectors): imminent failure. Failure is NOT correlated with temperature in 25–40°C range (Backblaze)."},
          {h:"SUPERPARAMAGNETIC LIMIT",  col:V.plasma,d:"Thermal stability ratio: KuV/kT > 60 required for 10-year retention. Ku (FePt): 6.6 MJ/m³. Minimum grain volume at 60kT: V > 60kT/Ku. At T=300K: V_min ~ 4×10⁻²⁵ m³ → grain diameter ~8 nm. At 10 nm grain: stable. At 5 nm grain: superparamagnetic (unstable, randomly flips). HAMR enables smaller grains by temporarily reducing effective Ku during write via laser heating."},
          {h:"VIBRATION · SHOCK",       col:V.dim,  d:"HDD susceptibility: head flies 3–5 nm above platter. Rotational shock: 2–5G during operation can cause head-disk contact (head crash). Linear vibration: 0.5G at 10–500 Hz causes tracking errors. Enterprise drives: rotational vibration sensors, dual-stage actuators. MTBF (Mean Time Between Failures): 1.0–1.2 million hours (manufacturer spec). Actual failure rate: 3–5% per year in real data centers. Recommended: RAID 6 or ZFS mirror for any HDD array."},
        ])}
      </>)}

      {sec("03","Solid-State Drive · NAND Flash · Wear Leveling · Magnetic Hysteresis · Storage Physics",V.photon,<>
        {P("Solid-state drives store information in NAND flash memory cells — floating gate transistors where charge trapped on an electrically isolated gate (the 'floating gate') shifts the threshold voltage of the transistor. Reading a cell means measuring whether the transistor conducts at a specific gate voltage — if it does, the threshold is below the test voltage (erased, low charge = '1'); if it does not, the threshold is above (programmed, high charge = '0'). Single-Level Cell (SLC) NAND stores one bit per cell (threshold either high or low), Triple-Level Cell (TLC) stores 3 bits per cell by distinguishing 8 threshold voltage levels, and Quad-Level Cell (QLC) stores 4 bits with 16 levels. The physics tradeoff is fundamental: more voltage levels → more bits per cell → higher density and lower cost per bit → but also lower noise margin between levels → higher bit error rate → shorter endurance. SLC NAND endures ~100,000 program/erase (P/E) cycles. TLC: ~1,000–3,000 P/E. QLC: ~100–1,000 P/E. Enterprise SSD controllers compensate with Error-Correcting Code — modern SSDs use LDPC (Low-Density Parity Check) codes that can correct dozens of bit errors per codeword.")}
        {P("Wear leveling is the SSD controller's core reliability algorithm: because each flash cell has a finite P/E cycle endurance, writing always to the same cells would quickly wear them out while leaving others fresh. Dynamic wear leveling redistributes writes across all available cells (including over-provisioned cells — typically 7–28% of raw capacity reserved for the controller). Static wear leveling additionally moves cold data (data that hasn't been written recently) from less-worn to more-worn cells, forcing a redistribution of write wear across the entire drive. The magnetic hysteresis loop shown in the canvas describes the physics of the HDD platter: as the applied magnetic field H is cycled from −Hs to +Hs and back, the magnetic flux density B traces a characteristic S-curve loop. The coercive field Hc is the field required to bring B to zero from saturation — a measure of how 'hard' the magnetic material is. Remanence Br is the B value when H returns to zero — the strength of the stored bit. High Hc (hard magnetic material) means the stored bit is stable against stray fields; low Hc (soft magnetic material) means the read head can easily sense it. PMR media uses a high-Hc recording layer (CoCrPt alloy, Hc ~4,000 Oe) and a soft magnetic underlayer (SUL) that concentrates the write field.")}
        <div style={{border:`1px solid ${V.dim}44`,borderRadius:8,padding:2,marginBottom:14}}>
          <SSDMagneticCanvas/>
        </div>
        {cards([
          {h:"NAND FLASH PHYSICS",    col:V.photon,d:"Floating gate NAND: SiO₂ tunnel oxide (8–10 nm). Program: Fowler-Nordheim tunneling — electrons tunnel through SiO₂ from channel to floating gate when V_control > 18V. Erase: electrons tunnel back at −20V on source (band-to-band tunneling). Read: sense current at V_read between threshold levels. 3D NAND (Samsung V-NAND, Micron 232-layer): cells stacked vertically — 232 layers in ~50 μm. Reduces cost/bit by ~50% vs 2D NAND."},
          {h:"WEAR LEVELING ALGORITHM",col:V.green, d:"Dynamic: new writes always go to the least-written available block. Static: cold blocks (not recently written) are periodically relocated to worn blocks. Over-provisioning: 7% (consumer) to 28% (enterprise) of raw NAND is reserved — invisible to OS. Bad block management: factory-bad blocks and runtime-bad blocks are remapped to reserve blocks. Write amplification factor (WAF): ratio of NAND writes to host writes; well-tuned WL: WAF < 1.5."},
          {h:"LDPC ERROR CORRECTION",  col:V.blue,  d:"Low-Density Parity Check codes (Gallager 1960, rediscovered 1990s): sparse parity check matrix H (n×k). Message: k bits. Codeword: n bits. Correction capability: t = d_min/2 − 1 where d_min = minimum Hamming distance. Modern TLC SSD LDPC: correct 40–120 bit errors per 1 KB codeword. Soft-decision LDPC (reads cell at multiple voltage levels): 2–3 dB better than hard-decision. LDPC enables QLC viability."},
          {h:"B-H HYSTERESIS LOOP",   col:V.vio,   d:"Coercive field Hc: field to demagnetise from saturation. Hard media (PMR): Hc ~4,000 Oe (FeCoPt). Soft media (read head): Hc ~2 Oe (NiFe permalloy). Remanence Br: retained magnetisation at H=0. Saturation Bs: maximum B. Loop area = energy dissipated per cycle (hysteresis loss) = heat. Transformers use low-Hc (soft) cores to minimise heat. Data storage uses high-Hc (hard) media to maximise bit stability. CoCrPt PMR layer: Ku = 0.2 MJ/m³, Hc = 4,000 Oe."},
          {h:"SSD RELIABILITY",       col:V.amb,   d:"JEDEC standard (JESD218): SSD must retain data for 1 year at 40°C after endurance test. Consumer TLC drive: 600 TBW (terabytes written) spec → 600 TB × 1 WAF / (128 GB × 1000 cycles) = well within. UBER (Uncorrectable Bit Error Rate): enterprise SSD ≤ 10⁻¹⁷ (1 uncorrectable error per 10¹⁷ bits read). NVMe PCIe 4.0 × 4: 7 GB/s sequential read. Latency: 50–100 μs (vs 5–10 ms HDD) — 100× faster."},
          {h:"STORAGE HIERARCHY",     col:V.gold,  d:"L1 cache: 1–4 MB, 0.5 ns. L2 cache: 4–64 MB, 2 ns. DRAM: 8–128 GB, 60 ns. SSD (NVMe): 1–8 TB, 80 μs. SSD (SATA): 1–4 TB, 120 μs. HDD (7200rpm): 1–20 TB, 8 ms. Tape (LTO-9): 18 TB/cartridge, ~1 min. For AETHER Knowledge System: DRAM for active graph (hot data) + NVMe SSD for full KG + HDD RAID for cold archive. Expected reliable operation: SSD 5+ yr, HDD 3–5 yr with SMART monitoring."},
        ])}
      </>)}

      {sec("04","Information Applied Upward · From Qubit to Geometry to Storage to Meaning",V.gold,<>
        {P("The journey of a single bit of information through the AETHER framework traces an arc from the quantum to the geometric to the engineering to the semantic. At the quantum level: a qubit in Hilbert space is a unit vector in ℂ² rotating under a Hamiltonian. Its 'information content' is at most 1 bit (Shannon) but its quantum state space is continuous and infinite (in principle). The morphous boundary — decoherence — collapses this to a classical bit via entanglement with the environment. At the GR level: the bit's physical carrier (a charged particle, a magnetic domain, a photon) exists in curved spacetime, whose curvature is governed by all other mass-energy in the universe. A bit stored in a magnetic domain on a hard disk platter is subject to the same spacetime curvature as the rest of the Earth — utterly negligible in practice, but in principle GR is always operating. At the string theory level: the particles mediating the read/write process (electrons, photons, gluons holding the iron atoms of the platter together) are excitation modes of fundamental strings vibrating in 10 or 11 dimensions. The holographic boundary completes the picture: all the information encoded in the bulk volume of the disk array — petabytes — is, in principle, fully encoded in the 2D boundary surface of the spacetime region containing it, at one bit per Planck area.")}
        {P("Applied to AETHER's practical architecture: the Knowledge Graph lives in a DRAM-cached, NVMe-SSD-persisted, HDD-archived storage hierarchy. The active reasoning process (graph traversal, coherence scoring, embedding computation) operates at DRAM speeds (60 ns). Cold knowledge (ingested documents, historical nodes) is paged to NVMe SSD at 80 μs latency. Archive snapshots are pushed to HDD RAID arrays at 8 ms latency. The reliability architecture is: SMART monitoring with automated alert on any reallocated sector event; SSD wear monitoring with 15% remaining endurance trigger for replacement; RAID 6 for HDD arrays (tolerates 2 simultaneous disk failures); quarterly S3-compatible off-site backup of the full knowledge graph. The expected operational life with this architecture: 5+ years for SSDs (with wear replacement at endurance threshold), 3–5 years per HDD unit (with proactive replacement at 3 years or first SMART warning, whichever comes first). The Hilbert space evolving through time, the spacetime curvature bending light around every mass in the universe, the string vibrating in its compactified extra dimensions, the magnetic domain aligned north on a spinning platter — they are all one physical reality. AETHER reads them all.")}
        {cards([
          {h:"INFORMATION CONSERVATION",col:V.vio, d:"Unitarity (quantum) + general covariance (GR) + holographic principle together imply: information is globally conserved. Black hole evaporation (Hawking 1974): appeared to destroy information. Page curve (Almheiri et al. 2019): island formula shows information is recovered in Hawking radiation. Proof: entanglement entropy of radiation follows Page curve, returns to zero after Page time. Black hole information paradox: resolved in principle, not in computational detail."},
          {h:"PRACTICAL RELIABILITY",  col:V.green,d:"AETHER storage recommendation: NVMe SSD (primary KG) + HDD RAID 6 (archive) + off-site backup. SSD replacement trigger: endurance <15% or first uncorrectable error. HDD replacement: >3yr OR any SMART 05/187/197 alert. Monitoring: smartmontools (Linux) or CrystalDiskInfo (Windows) with email alerts. Expected reliable operation: 5+ years (SSD), 3+ years per HDD. Annual backup verification (restore test) mandatory."},
          {h:"STRING THEORY + STORAGE",col:V.gold, d:"The iron (Fe) atom in a PMR platter is bound by gluons (mode-1 closed string excitations). Its 3d electrons (responsible for ferromagnetism) are excitations of open strings ending on D-branes in the compactified dimensions. The magnetic bit is a classical result of quantum field theory applied to solid-state physics. String theory does not change the engineering — but it is the complete picture of what the bit physically is at the deepest level."},
          {h:"MORPHOUS BOUNDARY TYPES",col:V.cyan, d:"5 morphous boundaries in storage: (1) Quantum → classical (decoherence of electron spin). (2) Spin → domain (ferromagnetic exchange coupling J, J > kT: ordered domain forms). (3) Domain → bit (read head: continuous B field → discrete 0/1 detection). (4) Bit → byte → file (logical encoding layer). (5) File → meaning (semantic layer: AETHER knowledge graph). Each boundary involves information compression and loss of quantum detail, but information is conserved at the physical level."},
          {h:"HOLOGRAM + HARD DISK",   col:V.photon,d:"A 1 TB hard drive contains ~8×10¹² bits. Bekenstein bound for the same volume (r~10 cm sphere): S_max = 2πkERc/ℏ ≈ 10⁴² bits. The hard disk stores 10¹² bits in a region that could in principle hold 10⁴² bits. We are using 10⁻³⁰ of available Bekenstein capacity. Physical maximum information density: 1 bit per Planck area on the surface (holographic). AETHER aspiration: approach the semantic density limit, not the physical limit."},
          {h:"AETHER FULL THREAD",     col:V.gold,  d:"Quarks (confined by gluons = string excitations) → protons → iron atoms → ferromagnetic domain → perpendicular bit → NAND charge level → SSD block → NVMe packet → PCIe bus → DRAM → AETHER KG node → coherence score → AI insight → human knowledge. This is the path information takes from the Planck scale to meaning. Every step is a morphous boundary. AETHER spans them all."},
        ])}
      </>)}
    </div>
  );
}
