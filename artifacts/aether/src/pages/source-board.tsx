import { useEffect, useRef, useState } from "react";
import sourceBoardImg from "@assets/image_1782003400689.png";

/* ── Palette ─────────────────────────────────────────── */
const BG   = "#020408";
const TEAL = "#2ef0d8";
const GOLD = "#c9a84c";
const VIO  = "#9966ff";
const AMB  = "#ff9933";
const ROSE = "#ff4477";
const BLUE = "#44aaff";
const GRN  = "#44cc77";
const TEXT = "#c8d8e0";
const DIM  = "#3a5060";
const mono = "'Space Mono', monospace";
const serif= "'Cinzel', serif";
const body = "'Crimson Pro', Georgia, serif";

/* ── Physical constants ──────────────────────────────── */
const h_P = 6.626e-34;
const c_LT = 2.998e8;
const eV  = 1.602e-19;

/* ══════════════════════════════════════════════════════
   CANVAS 1 — SUNLIGHT PHOTON ENGINE
   Sun → photons → chlorophyll → ETC → NADPH + ATP
══════════════════════════════════════════════════════ */
function SunlightCanvas({ efficiency }: { efficiency: number }) {
  const cvRef = useRef<HTMLCanvasElement>(null);
  const rafRef = useRef<number>(0);
  const effRef = useRef(efficiency);
  useEffect(() => { effRef.current = efficiency; }, [efficiency]);

  useEffect(() => {
    const cv = cvRef.current;
    if (!cv) return;
    const W = cv.width, H = cv.height;
    const ctx = cv.getContext("2d")!;

    interface Photon {
      x: number; y: number; vy: number; vx: number;
      hue: number; lam: number; absorbed: boolean; reflected: boolean;
    }
    interface ETCDot { t: number; col: string }
    interface Bubble { x: number; y: number; life: number }
    interface ATPFlash { x: number; y: number; life: number }

    const photons: Photon[] = [];
    const etc: ETCDot[] = [];
    const bubbles: Bubble[] = [];
    const atpFlash: ATPFlash[] = [];

    const chloroX = [W*0.18, W*0.32, W*0.48, W*0.62, W*0.76];
    const THYL_Y = H * 0.57;
    const SUN_CX = W/2, SUN_Y = 52;

    const etcPath = [
      { x:W*0.22, y:THYL_Y+4,  label:"PSII" },
      { x:W*0.34, y:THYL_Y-14, label:"PQ" },
      { x:W*0.46, y:THYL_Y+8,  label:"Cyt b₆f" },
      { x:W*0.58, y:THYL_Y-18, label:"PC" },
      { x:W*0.70, y:THYL_Y+4,  label:"PSI" },
      { x:W*0.82, y:THYL_Y-28, label:"Fd" },
      { x:W*0.91, y:THYL_Y-55, label:"NADPH" },
    ];

    let t = 0;

    const draw = () => {
      t++;
      const EFF = effRef.current;
      ctx.fillStyle = BG; ctx.fillRect(0, 0, W, H);

      /* Sky */
      const sky = ctx.createLinearGradient(0,0,0,H*0.5);
      sky.addColorStop(0,"rgba(20,10,60,0.7)"); sky.addColorStop(1,"rgba(2,4,8,0)");
      ctx.fillStyle = sky; ctx.fillRect(0,0,W,H*0.5);

      /* Sun corona */
      const corona = ctx.createRadialGradient(SUN_CX,SUN_Y,10,SUN_CX,SUN_Y,80);
      corona.addColorStop(0,"rgba(255,240,100,0.35)");
      corona.addColorStop(0.4,"rgba(255,180,0,0.12)");
      corona.addColorStop(1,"rgba(255,120,0,0)");
      ctx.fillStyle = corona;
      ctx.beginPath(); ctx.arc(SUN_CX,SUN_Y,80,0,Math.PI*2); ctx.fill();

      /* Sun disk */
      const sunG = ctx.createRadialGradient(SUN_CX-4,SUN_Y-4,0,SUN_CX,SUN_Y,24);
      sunG.addColorStop(0,"#fffde0"); sunG.addColorStop(0.6,"#ffe050");
      sunG.addColorStop(1,"#ffb020");
      ctx.beginPath(); ctx.arc(SUN_CX,SUN_Y,24,0,Math.PI*2);
      ctx.fillStyle=sunG; ctx.fill();

      /* Spawn photons */
      if (t % 3 === 0) {
        const configs = [
          { lam:450, hue:220, abs:true  },
          { lam:550, hue:100, abs:false },
          { lam:680, hue:0,   abs:true  },
          { lam:700, hue:10,  abs:true  },
        ];
        for (let k = 0; k < 2; k++) {
          const c = configs[Math.floor(Math.random() * configs.length)];
          const spread = (Math.random()-0.5) * W * 0.65;
          photons.push({
            x: SUN_CX + spread * (0.3 + Math.random()*0.4),
            y: SUN_Y + 28,
            vy: 1.8 + Math.random()*1.2,
            vx: (Math.random()-0.5)*0.5,
            hue: c.hue, lam: c.lam,
            absorbed: c.abs && Math.random() < EFF * 0.55,
            reflected: false,
          });
        }
      }

      /* Thylakoid membrane */
      for (let i = 0; i < 3; i++) {
        const my = THYL_Y + i*22;
        ctx.beginPath();
        for (let px = 0; px < W; px += 4) {
          const wave = Math.sin(px*0.08 + t*0.02 + i*1.2) * 5;
          if (px===0) ctx.moveTo(px,my+wave); else ctx.lineTo(px,my+wave);
        }
        ctx.strokeStyle = i===0 ? `${GRN}50` : `${GRN}20`;
        ctx.lineWidth = i===0 ? 2 : 1; ctx.stroke();
      }
      ctx.fillStyle = `${GRN}07`; ctx.fillRect(0,THYL_Y,W,H-THYL_Y);

      /* Chlorophyll sites */
      for (let k = 0; k < chloroX.length; k++) {
        const cx2 = chloroX[k];
        const cy2 = THYL_Y + Math.sin(t*0.04+k)*3;
        const cg = ctx.createRadialGradient(cx2,cy2,0,cx2,cy2,18);
        cg.addColorStop(0,"rgba(68,204,119,0.5)"); cg.addColorStop(1,"rgba(68,204,119,0)");
        ctx.beginPath(); ctx.arc(cx2,cy2,18,0,Math.PI*2);
        ctx.fillStyle=cg; ctx.fill();
        ctx.beginPath(); ctx.arc(cx2,cy2,8,0,Math.PI*2);
        ctx.fillStyle=`${GRN}80`; ctx.fill();
        ctx.font=`6px ${mono}`; ctx.textAlign="center"; ctx.textBaseline="bottom";
        ctx.fillStyle=`${GRN}70`;
        ctx.fillText(k===0||k===3?"Chl-a":k===2?"Mg²⁺":"Chl-b",cx2,cy2-10);
      }

      /* ETC pathway */
      ctx.beginPath();
      for (let k=0; k<etcPath.length; k++) {
        const ep = etcPath[k];
        if (k===0) ctx.moveTo(ep.x,ep.y); else ctx.lineTo(ep.x,ep.y);
      }
      ctx.strokeStyle=`${TEAL}30`; ctx.lineWidth=1.5;
      ctx.setLineDash([3,6]); ctx.stroke(); ctx.setLineDash([]);

      for (const ep of etcPath) {
        ctx.beginPath(); ctx.arc(ep.x,ep.y,5,0,Math.PI*2);
        ctx.fillStyle = ep.label==="PSII"||ep.label==="PSI" ? AMB : `${TEAL}70`;
        ctx.fill();
        ctx.font=`6px ${mono}`; ctx.textAlign="center"; ctx.textBaseline="bottom";
        ctx.fillStyle=`${TEAL}80`; ctx.fillText(ep.label,ep.x,ep.y-6);
      }

      /* Photons */
      for (let i = photons.length-1; i >= 0; i--) {
        const p = photons[i];
        p.y += p.vy; p.x += p.vx;

        let hit = false;
        for (const cx2 of chloroX) {
          if (!p.reflected && p.absorbed && Math.abs(p.x-cx2)<16 && Math.abs(p.y-THYL_Y)<20) {
            bubbles.push({ x:cx2-10+Math.random()*20, y:THYL_Y-5, life:0 });
            atpFlash.push({ x:W*0.86+Math.random()*28, y:THYL_Y-75, life:0 });
            etc.push({ t:0, col:TEAL });
            photons.splice(i,1); hit=true; break;
          }
        }
        if (hit) continue;

        if (!p.reflected && p.y > THYL_Y-22 && p.lam===550) {
          p.reflected=true; p.vy=-p.vy*0.8; p.vx=(Math.random()-0.5)*1.5;
        }
        if (p.y>H+10||p.y<-10||p.x<-10||p.x>W+10) { photons.splice(i,1); continue; }

        ctx.beginPath(); ctx.arc(p.x,p.y,3.5,0,Math.PI*2);
        ctx.fillStyle=`hsla(${p.hue},90%,70%,0.8)`; ctx.fill();
      }

      /* O2 bubbles */
      for (let i=bubbles.length-1; i>=0; i--) {
        const b=bubbles[i]; b.y-=0.7; b.life++;
        if (b.life>60) { bubbles.splice(i,1); continue; }
        const a=1-b.life/60;
        ctx.beginPath(); ctx.arc(b.x,b.y,2,0,Math.PI*2);
        ctx.strokeStyle=`rgba(68,204,119,${a*0.8})`; ctx.lineWidth=1; ctx.stroke();
        if (b.life<8) {
          ctx.font=`6px ${mono}`; ctx.textAlign="center"; ctx.textBaseline="bottom";
          ctx.fillStyle=`rgba(68,204,119,${a*0.7})`; ctx.fillText("O₂",b.x,b.y-4);
        }
      }

      /* ETC electrons */
      for (let i=etc.length-1; i>=0; i--) {
        const e=etc[i]; e.t+=0.012;
        const seg=Math.min(etcPath.length-2, Math.floor(e.t*(etcPath.length-1)));
        const frac=(e.t*(etcPath.length-1))-seg;
        if (seg>=etcPath.length-1) { etc.splice(i,1); continue; }
        const pa=etcPath[seg], pb=etcPath[seg+1];
        const ex=pa.x+(pb.x-pa.x)*frac, ey=pa.y+(pb.y-pa.y)*frac;
        const eg=ctx.createRadialGradient(ex,ey,0,ex,ey,7);
        eg.addColorStop(0,`${TEAL}dd`); eg.addColorStop(1,`${TEAL}00`);
        ctx.beginPath(); ctx.arc(ex,ey,7,0,Math.PI*2);
        ctx.fillStyle=eg; ctx.fill();
        ctx.beginPath(); ctx.arc(ex,ey,2.5,0,Math.PI*2);
        ctx.fillStyle=TEAL; ctx.fill();
      }

      /* ATP flashes */
      for (let i=atpFlash.length-1; i>=0; i--) {
        const a=atpFlash[i]; a.life++;
        if (a.life>40) { atpFlash.splice(i,1); continue; }
        const alpha=Math.sin(Math.PI*a.life/40);
        ctx.font=`9px ${mono}`; ctx.textAlign="center"; ctx.textBaseline="middle";
        ctx.fillStyle=`rgba(201,168,76,${alpha*0.9})`; ctx.fillText("ATP",a.x,a.y);
      }

      /* Labels */
      ctx.font=`7px ${mono}`; ctx.textAlign="left"; ctx.textBaseline="top";
      ctx.fillStyle=`${BLUE}60`;
      ctx.fillText("H₂O → O₂ + H⁺ + e⁻  (water splitting at PSII)",chloroX[0]-18,THYL_Y+38);
      ctx.fillStyle=`${GOLD}60`;
      ctx.fillText("H⁺ gradient → ATP synthase → ATP  (chemiosmosis)",chloroX[0]-18,THYL_Y+52);
      ctx.fillStyle=`${GRN}60`;
      ctx.fillText("NADPH → Calvin cycle → CO₂ fixed → C₆H₁₂O₆",chloroX[0]-18,THYL_Y+66);

      /* Stats */
      ctx.font=`8px ${mono}`; ctx.textAlign="left"; ctx.textBaseline="top";
      ctx.fillStyle=`${GOLD}60`;
      ctx.fillText(`η = ${(EFF*100).toFixed(0)}%  ·  photons: ${photons.length}  ·  e⁻ in ETC: ${etc.length}  ·  O₂: ${bubbles.length}`,8,6);

      /* Wavelength legend */
      const legX=W-148, legY=10;
      const wls=[{l:"450nm BLUE",h:220},{l:"550nm GREEN (reflected)",h:100},{l:"680nm RED",h:0}];
      for (let k=0; k<wls.length; k++) {
        ctx.beginPath(); ctx.arc(legX,legY+k*14,4,0,Math.PI*2);
        ctx.fillStyle=`hsl(${wls[k].h},90%,65%)`; ctx.fill();
        ctx.font=`7px ${mono}`; ctx.textAlign="left"; ctx.textBaseline="middle";
        ctx.fillStyle=`hsl(${wls[k].h},90%,65%)`; ctx.fillText(wls[k].l,legX+8,legY+k*14);
      }

      rafRef.current = requestAnimationFrame(draw);
    };
    draw();
    return () => cancelAnimationFrame(rafRef.current);
  }, []); // eslint-disable-line

  return (
    <canvas ref={cvRef} width={680} height={320}
      style={{ width:"100%", maxWidth:680, borderRadius:12,
        border:`1px solid ${GRN}18`, background:BG,
        boxShadow:"0 0 60px rgba(0,0,0,0.9)" }} />
  );
}

/* ══════════════════════════════════════════════════════
   CANVAS 2 — F₁F₀ ATP SYNTHASE ROTARY MOTOR
══════════════════════════════════════════════════════ */
function ATPSynthaseCanvas() {
  const cvRef = useRef<HTMLCanvasElement>(null);
  const rafRef = useRef<number>(0);

  useEffect(() => {
    const cv = cvRef.current;
    if (!cv) return;
    const W = cv.width, H = cv.height;
    const ctx = cv.getContext("2d")!;
    const cx = W/2, memY = H*0.52;

    interface Proton { phase: number; speed: number }
    const protons: Proton[] = Array.from({length:16},(_,k)=>({
      phase:(k/16)*Math.PI*2, speed:0.4+Math.random()*0.3,
    }));
    interface ATPOut { x:number; y:number; life:number }
    const atpOut: ATPOut[] = [];

    let angle=0, t=0, atpCount=0;
    const F0_R=32, F1_Y=memY-82;

    const draw = () => {
      t++; angle+=0.015;
      ctx.fillStyle=BG; ctx.fillRect(0,0,W,H);

      /* Region labels */
      ctx.font=`8px ${mono}`; ctx.textAlign="left"; ctx.textBaseline="top";
      ctx.fillStyle=`${BLUE}50`;
      ctx.fillText("THYLAKOID LUMEN  (high [H⁺], low pH ≈ 4.5)",10,memY-52);
      ctx.fillStyle=`${GRN}50`;
      ctx.fillText("STROMA  (low [H⁺], high pH ≈ 8.0)  →  Calvin cycle",10,memY+28);

      /* Membrane */
      const mG=ctx.createLinearGradient(0,memY-8,0,memY+8);
      mG.addColorStop(0,"#0d3020"); mG.addColorStop(0.5,"#1a5538"); mG.addColorStop(1,"#0d3020");
      ctx.fillStyle=mG; ctx.fillRect(0,memY-8,W,16);
      ctx.strokeStyle=`${GRN}40`; ctx.lineWidth=1;
      ctx.strokeRect(0,memY-8,W,16);

      /* Proton gradient drift arrows */
      for (let k=0; k<8; k++) {
        const px=20+k*(W-40)/7;
        ctx.beginPath(); ctx.moveTo(px,memY-48); ctx.lineTo(px,memY-16);
        ctx.strokeStyle=`${BLUE}15`; ctx.lineWidth=0.6;
        ctx.setLineDash([3,6]); ctx.stroke(); ctx.setLineDash([]);
      }

      /* F0 c-ring (10 subunits, rotates in membrane) */
      for (let k=0; k<10; k++) {
        const a=(k/10)*Math.PI*2+angle;
        const rx=cx+F0_R*Math.cos(a), ry=memY+3*Math.sin(a);
        ctx.beginPath(); ctx.ellipse(rx,ry,5,4,a,0,Math.PI*2);
        ctx.fillStyle="#2a6048"; ctx.fill();
        ctx.strokeStyle=`${GRN}40`; ctx.lineWidth=0.5; ctx.stroke();
      }

      /* a-subunit (stator) */
      ctx.fillStyle="#163828";
      ctx.fillRect(cx+F0_R+2,memY-7,14,14);
      ctx.strokeStyle=`${GRN}40`; ctx.lineWidth=0.7;
      ctx.strokeRect(cx+F0_R+2,memY-7,14,14);
      ctx.font=`6px ${mono}`; ctx.textAlign="center"; ctx.textBaseline="middle";
      ctx.fillStyle=`${GRN}60`; ctx.fillText("a",cx+F0_R+9,memY);

      /* Proton channel curve */
      ctx.beginPath();
      ctx.moveTo(cx+F0_R+9,memY-7);
      ctx.bezierCurveTo(cx+F0_R+9,memY-28,cx,memY-28,cx,memY-16);
      ctx.strokeStyle=`${BLUE}30`; ctx.lineWidth=1; ctx.stroke();

      /* γ-stalk (rotates) */
      ctx.save(); ctx.translate(cx,(memY+F1_Y)/2); ctx.rotate(angle);
      ctx.fillStyle=GOLD; ctx.fillRect(-3.5,-(memY-F1_Y)/2,7,memY-F1_Y);
      ctx.restore();

      /* F1 α₃β₃ hexamer */
      for (let k=0; k<6; k++) {
        const a=(k/6)*Math.PI*2;
        const fx=cx+32*Math.cos(a), fy=F1_Y+12*Math.sin(a);
        const isAlpha=k%2===0;
        const diff=Math.abs((angle%(Math.PI*2))-((k/6)*Math.PI*2)%(Math.PI*2));
        const isActive=!isAlpha && diff<Math.PI*0.38;
        ctx.beginPath(); ctx.ellipse(fx,fy,18,14,a,0,Math.PI*2);
        ctx.fillStyle=isActive?`${TEAL}cc`:isAlpha?"#154060":"#0d2840";
        ctx.fill();
        ctx.strokeStyle=isActive?TEAL:`${BLUE}30`; ctx.lineWidth=0.7; ctx.stroke();
        ctx.font=`7px ${mono}`; ctx.textAlign="center"; ctx.textBaseline="middle";
        ctx.fillStyle=isAlpha?`${BLUE}60`:isActive?"#fff":`${TEAL}70`;
        ctx.fillText(isAlpha?"α":"β",fx,fy);
        if (isActive && Math.floor(t*0.15)%20===k) {
          atpOut.push({x:fx,y:fy-22,life:0}); atpCount++;
        }
      }

      /* Proton dots in lumen */
      for (const p of protons) {
        p.phase+=p.speed*0.022;
        const px=cx-68+((p.phase*48)%148)+68;
        const py=memY-24+Math.sin(p.phase*3)*9;
        const pg=ctx.createRadialGradient(px,py,0,px,py,7);
        pg.addColorStop(0,`${BLUE}cc`); pg.addColorStop(1,`${BLUE}00`);
        ctx.beginPath(); ctx.arc(px,py,7,0,Math.PI*2);
        ctx.fillStyle=pg; ctx.fill();
        ctx.beginPath(); ctx.arc(px,py,3,0,Math.PI*2);
        ctx.fillStyle=BLUE; ctx.fill();
        ctx.font=`5px ${mono}`; ctx.textAlign="center"; ctx.textBaseline="middle";
        ctx.fillStyle="#fff"; ctx.fillText("H⁺",px,py);
      }

      /* ATP output */
      for (let i=atpOut.length-1; i>=0; i--) {
        const a=atpOut[i]; a.y-=1.2; a.life++;
        if (a.life>40) { atpOut.splice(i,1); continue; }
        ctx.font=`10px ${mono}`; ctx.textAlign="center"; ctx.textBaseline="middle";
        ctx.fillStyle=`rgba(201,168,76,${1-a.life/40})`; ctx.fillText("ATP",a.x,a.y);
      }

      /* ΔG & stats */
      ctx.font=`8px ${mono}`; ctx.textAlign="left"; ctx.textBaseline="top";
      ctx.fillStyle=`${GOLD}70`;
      ctx.fillText(
        `γ angle: ${((angle*180/Math.PI)%360).toFixed(0)}°  ·  ~3 H⁺/ATP  ·  14 H⁺/rev  ·  ATP out: ${atpCount}`,8,6);

      /* Labels */
      ctx.font=`8px ${mono}`;
      ctx.fillStyle=`${GOLD}60`; ctx.textAlign="right"; ctx.textBaseline="middle";
      ctx.fillText("γ-stalk (rotates)",cx-6,(memY+F1_Y)/2);
      ctx.fillStyle=`${GRN}60`;
      ctx.fillText("c-ring F₀",cx-F0_R-4,memY);
      ctx.fillStyle=`${TEAL}60`; ctx.textAlign="left";
      ctx.fillText("β (catalytic, active = TEAL)",cx+68,F1_Y-18);
      ctx.fillStyle=`${BLUE}60`;
      ctx.fillText("α (structural)",cx-88,F1_Y);

      rafRef.current = requestAnimationFrame(draw);
    };
    draw();
    return () => cancelAnimationFrame(rafRef.current);
  }, []);

  return (
    <canvas ref={cvRef} width={680} height={340}
      style={{ width:"100%", maxWidth:680, borderRadius:12,
        border:`1px solid ${GOLD}18`, background:BG }} />
  );
}

/* ══════════════════════════════════════════════════════
   CANVAS 3 — CALVIN CYCLE · STRUCTURE CREATION MACHINE
══════════════════════════════════════════════════════ */
function CalvinCanvas() {
  const cvRef = useRef<HTMLCanvasElement>(null);
  const rafRef = useRef<number>(0);

  useEffect(() => {
    const cv = cvRef.current;
    if (!cv) return;
    const W = cv.width, H = cv.height;
    const ctx = cv.getContext("2d")!;
    const cx = W*0.38, cy = H/2;
    const R = 105;

    const nodes = [
      { label:"RuBP\n5C",       angle:-Math.PI/2,              col:VIO  },
      { label:"CO₂\n+fix",      angle:-Math.PI/2+Math.PI*2/5,  col:TEAL },
      { label:"3-PGA\n3C×2",    angle:-Math.PI/2+Math.PI*4/5,  col:BLUE },
      { label:"G3P\n3C×2",      angle:-Math.PI/2+Math.PI*6/5,  col:GRN  },
      { label:"G3P\n→ Build",   angle:-Math.PI/2+Math.PI*8/5,  col:GOLD },
    ];

    interface CycleP { angle:number; speed:number; col:string }
    const cyclePs: CycleP[] = Array.from({length:10},(_,k)=>({
      angle:(k/10)*Math.PI*2-Math.PI/2,
      speed:0.009+Math.random()*0.004,
      col:[VIO,TEAL,BLUE,GRN,GOLD][k%5],
    }));

    interface CO2P { x:number; y:number; life:number }
    interface GlcP { x:number; y:number; vx:number; vy:number; life:number }
    const co2s: CO2P[] = [];
    const glcs: GlcP[] = [];

    const rubX=cx+R*Math.cos(-Math.PI/2+Math.PI*2/5);
    const rubY=cy+R*Math.sin(-Math.PI/2+Math.PI*2/5);
    const g3pX=cx+R*Math.cos(-Math.PI/2+Math.PI*8/5);
    const g3pY=cy+R*Math.sin(-Math.PI/2+Math.PI*8/5);

    let t=0;

    const draw = () => {
      t++;
      ctx.fillStyle=BG; ctx.fillRect(0,0,W,H);

      /* Background glow */
      const bg2=ctx.createRadialGradient(cx,cy,0,cx,cy,R*1.4);
      bg2.addColorStop(0,"rgba(0,40,20,0.3)"); bg2.addColorStop(1,"rgba(0,0,0,0)");
      ctx.fillStyle=bg2; ctx.fillRect(0,0,W,H);

      /* Spawn */
      if (t%55===0) co2s.push({x:rubX-55,y:rubY-38,life:0});
      if (t%110===0) glcs.push({x:g3pX,y:g3pY,vx:(Math.random()-0.5)*1.4,vy:1+Math.random()*0.8,life:0});

      /* Cycle ring */
      ctx.beginPath(); ctx.arc(cx,cy,R,0,Math.PI*2);
      ctx.strokeStyle=`${GRN}25`; ctx.lineWidth=2; ctx.stroke();

      /* Ring tick marks */
      for (let k=0; k<5; k++) {
        const a=(k/5)*Math.PI*2-Math.PI/2;
        const ax=cx+R*Math.cos(a), ay=cy+R*Math.sin(a);
        ctx.beginPath(); ctx.arc(ax,ay,4,0,Math.PI*2);
        ctx.fillStyle=`${GRN}40`; ctx.fill();
      }

      /* Cycle particles */
      for (const p of cyclePs) {
        p.angle+=p.speed;
        const px=cx+R*Math.cos(p.angle), py=cy+R*Math.sin(p.angle);
        const pg=ctx.createRadialGradient(px,py,0,px,py,8);
        pg.addColorStop(0,`${p.col}cc`); pg.addColorStop(1,`${p.col}00`);
        ctx.beginPath(); ctx.arc(px,py,8,0,Math.PI*2); ctx.fillStyle=pg; ctx.fill();
        ctx.beginPath(); ctx.arc(px,py,3,0,Math.PI*2); ctx.fillStyle=p.col; ctx.fill();
      }

      /* Nodes */
      for (const n of nodes) {
        const nx=cx+R*Math.cos(n.angle), ny=cy+R*Math.sin(n.angle);
        const pulse=0.8+0.2*Math.sin(t*0.05+n.angle);
        const ng=ctx.createRadialGradient(nx,ny,0,nx,ny,22*pulse);
        ng.addColorStop(0,`${n.col}50`); ng.addColorStop(1,`${n.col}00`);
        ctx.beginPath(); ctx.arc(nx,ny,22*pulse,0,Math.PI*2);
        ctx.fillStyle=ng; ctx.fill();
        ctx.beginPath(); ctx.arc(nx,ny,13,0,Math.PI*2);
        ctx.fillStyle=`${n.col}20`; ctx.fill();
        ctx.strokeStyle=n.col; ctx.lineWidth=1.5; ctx.stroke();
        const lines=n.label.split("\n");
        ctx.font=`7px ${mono}`; ctx.textAlign="center"; ctx.textBaseline="middle";
        ctx.fillStyle=n.col;
        lines.forEach((ln,li)=>ctx.fillText(ln,nx,ny+(li-(lines.length-1)/2)*9));
      }

      /* CO2 input */
      for (let i=co2s.length-1; i>=0; i--) {
        const c=co2s[i]; c.x+=0.55; c.y+=0.35; c.life++;
        if (c.life>80) { co2s.splice(i,1); continue; }
        const a=Math.min(1,(80-c.life)/20);
        ctx.font=`9px ${mono}`; ctx.textAlign="center"; ctx.textBaseline="middle";
        ctx.fillStyle=`rgba(68,170,255,${a*0.9})`; ctx.fillText("CO₂",c.x,c.y);
        ctx.beginPath(); ctx.moveTo(c.x+18,c.y); ctx.lineTo(rubX-12,rubY);
        ctx.strokeStyle=`rgba(68,170,255,${a*0.25})`; ctx.lineWidth=0.7;
        ctx.setLineDash([2,4]); ctx.stroke(); ctx.setLineDash([]);
      }

      /* Glucose output */
      for (let i=glcs.length-1; i>=0; i--) {
        const g=glcs[i]; g.x+=g.vx; g.y+=g.vy; g.life++;
        if (g.life>80||g.y>H+20) { glcs.splice(i,1); continue; }
        const a=Math.min(1,(80-g.life)/20);
        const gg=ctx.createRadialGradient(g.x,g.y,0,g.x,g.y,14);
        gg.addColorStop(0,`rgba(201,168,76,${a*0.55})`); gg.addColorStop(1,"rgba(201,168,76,0)");
        ctx.beginPath(); ctx.arc(g.x,g.y,14,0,Math.PI*2); ctx.fillStyle=gg; ctx.fill();
        ctx.font=`8px ${mono}`; ctx.textAlign="center"; ctx.textBaseline="middle";
        ctx.fillStyle=`rgba(201,168,76,${a})`; ctx.fillText("C₆H₁₂O₆",g.x,g.y);
      }

      /* RuBisCO label */
      const rg2=ctx.createRadialGradient(rubX,rubY-28,0,rubX,rubY-28,18);
      rg2.addColorStop(0,`${ROSE}30`); rg2.addColorStop(1,`${ROSE}00`);
      ctx.beginPath(); ctx.arc(rubX,rubY-28,18,0,Math.PI*2);
      ctx.fillStyle=rg2; ctx.fill();
      ctx.font=`7px ${mono}`; ctx.textAlign="center"; ctx.textBaseline="middle";
      ctx.fillStyle=`${ROSE}90`; ctx.fillText("RuBisCO",rubX,rubY-28);

      /* Center */
      const cg2=ctx.createRadialGradient(cx,cy,0,cx,cy,38);
      cg2.addColorStop(0,"rgba(68,204,119,0.12)"); cg2.addColorStop(1,"rgba(0,0,0,0)");
      ctx.fillStyle=cg2; ctx.fillRect(cx-45,cy-45,90,90);
      ctx.font=`8px ${mono}`; ctx.textAlign="center"; ctx.textBaseline="middle";
      ctx.fillStyle=`${GRN}60`; ctx.fillText("CALVIN",cx,cy-7);
      ctx.fillStyle=`${GRN}40`; ctx.fillText("CYCLE",cx,cy+7);

      /* Side panel */
      const pX=W*0.62+10, pY=12;
      ctx.font=`7px ${mono}`; ctx.textAlign="left"; ctx.textBaseline="top";
      const lines=[
        [TEAL,  "PER GLUCOSE MADE:"],
        [BLUE,  "  6 CO₂ fixed"],
        [BLUE,  "  12 H₂O consumed"],
        [GOLD,  "  18 ATP consumed"],
        [TEAL,  "  12 NADPH consumed"],
        [DIM,   ""],
        [GRN,   "OUTPUTS:"],
        [GRN,   "  1 × C₆H₁₂O₆"],
        [GRN,   "  6 H₂O released"],
        [VIO,   "  18 ADP + 12 NADP⁺"],
        [DIM,   ""],
        [GOLD,  "ENERGY STORED:"],
        [GOLD,  "  ΔG = 2870 kJ/mol"],
        [AMB,   "  38 ATP equivalents"],
        [DIM,   ""],
        [ROSE,  "RuBisCO is the most"],
        [ROSE,  "abundant protein on Earth"],
        [DIM,   "  700 million tonnes"],
        [DIM,   "  ~3 rxn/s (very slow)"],
      ];
      for (let k=0; k<lines.length; k++) {
        ctx.fillStyle=lines[k][0] as string;
        ctx.fillText(lines[k][1] as string, pX, pY+k*13);
      }

      rafRef.current = requestAnimationFrame(draw);
    };
    draw();
    return () => cancelAnimationFrame(rafRef.current);
  }, []);

  return (
    <canvas ref={cvRef} width={680} height={360}
      style={{ width:"100%", maxWidth:680, borderRadius:12,
        border:`1px solid ${GRN}18`, background:BG }} />
  );
}

/* ── UI helpers ──────────────────────────────────────── */
function SH({ n, title, sub, col=TEAL }: { n:string; title:string; sub:string; col?:string }) {
  return (
    <div style={{ marginTop:52, marginBottom:4 }}>
      <div style={{ fontFamily:mono, fontSize:10, color:col, letterSpacing:3 }}>{n}</div>
      <h2 style={{ fontFamily:serif, fontSize:22, color:"#fff", margin:"6px 0 4px" }}>{title}</h2>
      <div style={{ fontFamily:body, fontSize:15, color:DIM, marginBottom:16 }}>{sub}</div>
      <div style={{ height:1, background:`linear-gradient(90deg,${col}50,transparent)`, marginBottom:22 }} />
    </div>
  );
}

/* ══════════════════════════════════════════════════════
   PAGE
══════════════════════════════════════════════════════ */
function SourceBoardHeaderCanvas() {
  const ref = useRef<HTMLCanvasElement>(null);
  const rafRef = useRef(0);
  useEffect(() => {
    const canvas = ref.current; if (!canvas) return;
    const ctx = canvas.getContext("2d")!;
    canvas.width = 900; canvas.height = 145;
    const W = canvas.width, H = canvas.height;
    let t=0;
    const cols=["#2ef0d8","#9966ff","#c9a84c","#ff4477","#44aaff","#44cc77"];
    const cards: {x:number;y:number;w:number;h:number;col:string;phase:number}[]=[];
    for(let i=0;i<12;i++) cards.push({x:Math.random()*(W-80),y:20+Math.random()*(H-50),w:60+Math.random()*40,h:20+Math.random()*20,col:cols[Math.floor(Math.random()*cols.length)],phase:Math.random()*Math.PI*2});
    const draw=()=>{
      ctx.fillStyle="rgba(2,4,8,0.3)"; ctx.fillRect(0,0,W,H);
      cards.forEach(c=>{
        const alpha=0.05+0.05*Math.sin(t*0.03+c.phase);
        ctx.fillStyle=c.col+Math.round(alpha*255).toString(16).padStart(2,"0");ctx.fillRect(c.x,c.y,c.w,c.h);
        ctx.strokeStyle=c.col+"44";ctx.lineWidth=0.5;ctx.strokeRect(c.x,c.y,c.w,c.h);
      });
      ctx.fillStyle="rgba(201,168,76,0.3)"; ctx.font="9px 'DM Mono',monospace";
      ctx.fillText("SOURCE BOARD · KNOWLEDGE CARDS · REFERENCE MATRIX · CURATION · AETHER",14,14);
      t++; rafRef.current=requestAnimationFrame(draw);
    };
    draw();
    return ()=>cancelAnimationFrame(rafRef.current);
  },[]);
  return <canvas ref={ref} style={{width:"100%",height:"auto",borderRadius:8,display:"block"}} />;
}

export default function SourceBoardPage() {
  const [efficiency, setEfficiency] = useState(0.06);

  return (
    <div style={{ background:BG, minHeight:"100vh", color:TEXT }}>
      <div style={{flexShrink:0,padding:"8px 12px 0"}}>
        <div style={{display:"inline-block",border:"1px solid #c9a84c",padding:"4px 12px",fontSize:10,letterSpacing:"0.2em",color:"#c9a84c",fontFamily:"'DM Mono',monospace",marginBottom:12}}>LIVE SIMULATION</div>
        <div style={{background:"rgba(2,4,8,0.8)",borderLeft:"3px solid #c9a84c",borderRadius:4,overflow:"hidden",marginBottom:20}}>
          <div style={{padding:"12px 16px 8px"}}><h2 style={{margin:0,fontSize:13,color:"#c9a84c",fontFamily:"'DM Mono',monospace",letterSpacing:"0.15em",fontWeight:400}}>SOURCE BOARD · KNOWLEDGE CARDS · REFERENCE MATRIX · CURATION · AETHER</h2><p style={{margin:"4px 0 8px",fontSize:10,color:"rgba(201,168,76,0.5)",fontFamily:"'DM Mono',monospace",letterSpacing:"0.1em"}}>12 floating knowledge cards — the live AETHER source board simulation.</p></div>
          <SourceBoardHeaderCanvas />
        </div>
      </div>
      {/* Hero */}
      <div style={{ textAlign:"center", padding:"52px 24px 28px",
        background:`radial-gradient(ellipse 70% 50% at 50% 0%, ${GRN}07, ${GOLD}04, transparent)` }}>
        <div style={{ fontFamily:mono, fontSize:10, color:`${GRN}80`, letterSpacing:4, marginBottom:10 }}>
          AETHER · SOURCE BOARD · SUNLIGHT ENGINE · FOUNDATIONAL FACTORY · STRUCTURE CREATION MACHINE
        </div>
        <h1 style={{ fontFamily:serif, fontSize:"clamp(20px,4.2vw,48px)",
          color:"#fff", margin:"0 0 8px", letterSpacing:1.5, lineHeight:1.2 }}>
          THE<span style={{ color:GOLD }}>·</span>SOURCE
          <span style={{ color:`${GRN}60` }}> ♾ </span>
          SUNLIGHT<span style={{ color:GRN }}>·</span>ENGINE
        </h1>
        <div style={{ fontFamily:serif, fontSize:13, color:`${GRN}70`, letterSpacing:3, marginBottom:18 }}>
          Photosynthesis · ATP Synthase · Calvin Cycle · E=hf → C₆H₁₂O₆ · Organic Structure Creation
        </div>
        <div style={{ fontFamily:body, fontSize:16, color:DIM,
          maxWidth:800, margin:"0 auto", lineHeight:2.0 }}>
          Sunlight is not merely energy — it is a
          <span style={{ color:GOLD }}> computational substrate</span>.
          Each photon (E = hf, λ = 680 nm, E = 1.83 eV) enters the chloroplast and is transduced
          through a three-stage factory:
          <span style={{ color:BLUE }}> quantum light harvesting </span>→
          <span style={{ color:GOLD }}> rotary mechanical ATP synthesis </span>→
          <span style={{ color:GRN }}> organic carbon assembly (C₆H₁₂O₆)</span>.
          Light becomes structure. Photons become matter. The sun computes the biosphere.
        </div>
      </div>

      <div style={{ maxWidth:1100, margin:"0 auto", padding:"0 24px 80px" }}>

        {/* Reference image */}
        <SH n="REF" title="Source Equation Reference" col={GOLD}
          sub="The foundational equation driving this simulation — hν → electron → chemical bond → organic structure" />
        <div style={{ borderRadius:10, overflow:"hidden", border:`1px solid ${GOLD}20`, marginBottom:10 }}>
          <img src={sourceBoardImg} alt="Source board equation"
            style={{ width:"100%", display:"block", opacity:0.92,
              filter:"brightness(1.4) contrast(1.2)" }} />
        </div>
        <div style={{ fontFamily:mono, fontSize:8, color:DIM, marginBottom:8, lineHeight:1.9 }}>
          MASTER EQUATION: 6CO₂ + 6H₂O + 48hν → C₆H₁₂O₆ + 6O₂  ·  ΔG = +2870 kJ/mol stored in glucose  ·
          8 photons minimum per CO₂ fixed (theoretical, Emerson 1958)  ·
          η_max ≈ 11% (thermodynamic limit)  ·  η_real ≈ 3–6% for most plants  ·
          energy input: 48 × 1.83 eV = 87.8 eV  ·  energy stored: 2870 kJ/mol = 29.7 eV per glucose  ·
          the difference (58 eV) is entropy production — the universe's cost for building order from chaos
        </div>

        {/* Section I */}
        <SH n="I" title="Sunlight Photon Engine · Quantum Light Harvesting"
          sub="hν → chlorophyll antenna → exciton → charge separation → electron transport → NADPH + ATP"
          col={GRN} />
        <div style={{ display:"flex", gap:18, flexWrap:"wrap", alignItems:"flex-start" }}>
          <div style={{ flex:"1 1 560px" }}>
            <SunlightCanvas efficiency={efficiency} />
            <div style={{ fontFamily:mono, fontSize:8, color:DIM, marginTop:6, lineHeight:1.9 }}>
              BLUE (450nm) + RED (680/700nm) = absorbed · GREEN (550nm) = reflected (why leaves are green) ·
              GREEN DOTS = chlorophyll Chl-a/Chl-b/Mg²⁺ on thylakoid membrane · TEAL DOTS = electrons
              flowing PSII → PQ → Cyt b₆f → PC → PSI → Fd → NADPH · GREEN BUBBLES = O₂ from water
              splitting · GOLD = ATP synthesized via chemiosmosis · WAVY LINES = thylakoid membrane
            </div>
          </div>
          <div style={{ flex:"0 0 250px", display:"flex", flexDirection:"column", gap:12 }}>
            <div style={{ background:`${GRN}07`, border:`1px solid ${GRN}22`,
              borderRadius:8, padding:"12px 14px" }}>
              <div style={{ fontFamily:mono, fontSize:9, color:GRN, letterSpacing:1, marginBottom:10 }}>
                SYSTEM EFFICIENCY
              </div>
              <div style={{ display:"flex", justifyContent:"space-between",
                fontFamily:mono, fontSize:9, color:GRN, marginBottom:3 }}>
                <span>η PHOTOSYNTHETIC</span>
                <span>{(efficiency*100).toFixed(0)}%</span>
              </div>
              <input type="range" min={0.01} max={0.11} step={0.005} value={efficiency}
                onChange={e=>setEfficiency(parseFloat(e.target.value))}
                style={{ width:"100%", accentColor:GRN }} />
              <div style={{ fontFamily:body, fontSize:12, color:DIM, marginTop:6, lineHeight:1.7 }}>
                {efficiency<0.03&&"Stressed plants (drought, heat, nutrient deficiency)"}
                {efficiency>=0.03&&efficiency<0.05&&"C3 plants in real conditions (wheat, rice, soy)"}
                {efficiency>=0.05&&efficiency<0.08&&"C4 plants in full sun (maize, sugarcane)"}
                {efficiency>=0.08&&"Near theoretical max — laboratory engineered strains"}
              </div>
            </div>
            <div style={{ background:`${BLUE}07`, border:`1px solid ${BLUE}20`,
              borderRadius:8, padding:"12px 14px" }}>
              <div style={{ fontFamily:mono, fontSize:8, color:BLUE, letterSpacing:1, marginBottom:6 }}>
                PHOTON ENERGY BY λ
              </div>
              {[
                { lam:450, use:"PSII antenna Chl-b" },
                { lam:550, use:"REFLECTED — low absorption" },
                { lam:680, use:"PSII P680 reaction center" },
                { lam:700, use:"PSI P700 reaction center" },
              ].map(r=>(
                <div key={r.lam} style={{ marginBottom:7 }}>
                  <div style={{ fontFamily:mono, fontSize:8, color:BLUE }}>
                    λ={r.lam}nm  E={(h_P*c_LT/(r.lam*1e-9)/eV).toFixed(2)} eV
                  </div>
                  <div style={{ fontFamily:body, fontSize:11, color:DIM }}>{r.use}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Section II */}
        <SH n="II" title="F₁F₀ ATP Synthase · Rotary Molecular Motor"
          sub="H⁺ gradient → c-ring rotation → γ-stalk turns → α₃β₃ hexamer catalyzes ADP+Pᵢ → ATP  ·  ~3 H⁺ per ATP  ·  torque 40 pN·nm"
          col={GOLD} />
        <div style={{ display:"flex", gap:18, flexWrap:"wrap", alignItems:"flex-start" }}>
          <div style={{ flex:"1 1 560px" }}>
            <ATPSynthaseCanvas />
            <div style={{ fontFamily:mono, fontSize:8, color:DIM, marginTop:6, lineHeight:1.9 }}>
              BLUE DOTS = H⁺ (protons) in thylakoid lumen flowing down concentration gradient ·
              GREEN c-RING = F₀ rotor (10 c-subunits in membrane, rotates as H⁺ flows through) ·
              GOLD STALK = γ-subunit (connects F₀ rotor to F₁ hexamer, rotates ~120°/ATP) ·
              LIGHT BLUE α = structural subunits · TEAL-ACTIVE β = catalytic subunits (ADP+Pᵢ→ATP) ·
              GOLD TEXT = ATP molecules released into stroma · MEMBRANE = thylakoid lipid bilayer
            </div>
          </div>
          <div style={{ flex:"0 0 250px", background:`${GOLD}07`,
            border:`1px solid ${GOLD}20`, borderRadius:10, padding:"14px 16px" }}>
            <div style={{ fontFamily:mono, fontSize:9, color:GOLD, letterSpacing:1, marginBottom:10 }}>
              MOTOR MECHANICS
            </div>
            {[
              { eq:"ΔG_ATP = +30.5 kJ/mol", desc:"Energy cost of synthesizing ATP from ADP + Pᵢ at standard conditions" },
              { eq:"PMF ≈ −0.25 V (ΔpH + Δψ)", desc:"Proton motive force across thylakoid membrane drives F₀ rotation. Mitchell's chemiosmosis (Nobel 1978)" },
              { eq:"~3 H⁺ per ATP", desc:"10 c-subunits per c-ring → 10 H⁺/revolution → 3 ATP/revolution (120° each)" },
              { eq:"Torque = 40 pN·nm", desc:"One of the most efficient molecular motors: ~90% thermodynamic efficiency (Boyer, Nobel 1997)" },
              { eq:"~100 ATP/s per synthase", desc:"1 chloroplast: ~600 synthase complexes → ~60,000 ATP/s per chloroplast" },
            ].map(e=>(
              <div key={e.eq} style={{ marginBottom:9, borderBottom:`1px solid ${GOLD}12`, paddingBottom:7 }}>
                <div style={{ fontFamily:mono, fontSize:8, color:GOLD }}>{e.eq}</div>
                <div style={{ fontFamily:body, fontSize:12, color:DIM, lineHeight:1.65 }}>{e.desc}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Section III */}
        <SH n="III" title="Calvin Cycle · Organic Structure Creation Machine"
          sub="CO₂ + RuBP → 3-PGA → G3P → glucose → every organic molecule — the factory never stops"
          col={GRN} />
        <div style={{ display:"flex", gap:18, flexWrap:"wrap", alignItems:"flex-start" }}>
          <div style={{ flex:"1 1 560px" }}>
            <CalvinCanvas />
            <div style={{ fontFamily:mono, fontSize:8, color:DIM, marginTop:6, lineHeight:1.9 }}>
              VIOLET = RuBP (5-carbon acceptor) · TEAL = CO₂ fixation step · BLUE = 3-PGA (3-phosphoglycerate) ·
              GREEN = G3P (glyceraldehyde-3-phosphate, the universal organic building block) ·
              GOLD = G3P → glucose assembly · ROSE HALO = RuBisCO enzyme (most abundant protein on Earth) ·
              BLUE ARROWS = CO₂ input (6 per glucose) · GOLD DRIFTING = C₆H₁₂O₆ glucose output
            </div>
          </div>
          <div style={{ flex:"0 0 250px", background:`${GRN}07`,
            border:`1px solid ${GRN}20`, borderRadius:10, padding:"14px 16px" }}>
            <div style={{ fontFamily:mono, fontSize:9, color:GRN, letterSpacing:1, marginBottom:10 }}>
              FROM G3P → ALL LIFE
            </div>
            {[
              ["Glucose C₆H₁₂O₆", "2 G3P → 1 glucose (gluconeogenesis)"],
              ["Starch/Glycogen", "Glucose polymer → energy storage in plants/animals"],
              ["Cellulose", "β(1→4) glucose polymer → wood, cotton, plant walls (most abundant organic molecule on Earth)"],
              ["Lipids/Fats", "Acetyl-CoA from G3P → fatty acids → all membranes"],
              ["Amino acids", "G3P → pyruvate → Krebs intermediates → 20 amino acids → proteins"],
              ["DNA/RNA", "Ribose from G3P → A,T,G,C,U → all genetic information"],
              ["Chlorophyll", "Glycine (G3P-derived) → tetrapyrrole → Mg chelation → the antenna itself"],
            ].map(([name,desc])=>(
              <div key={name} style={{ marginBottom:8, borderBottom:`1px solid ${GRN}15`, paddingBottom:6 }}>
                <div style={{ fontFamily:mono, fontSize:8, color:GRN }}>{name}</div>
                <div style={{ fontFamily:body, fontSize:11.5, color:DIM, lineHeight:1.6 }}>{desc}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Section IV */}
        <SH n="IV" title="Complete Mathematical Framework"
          sub="Photon physics → Z-scheme → chemiosmosis → Calvin cycle → thermodynamics of life"
          col={BLUE} />
        <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(280px,1fr))", gap:14, marginBottom:28 }}>
          {[
            { title:"PHOTON ENERGY INPUT", col:GOLD, eqs:[
              "E_photon = hf = hc/λ",
              "λ_PSII = 680 nm → E = 1.83 eV",
              "λ_PSI  = 700 nm → E = 1.77 eV",
              "λ_blue = 450 nm → E = 2.76 eV",
              "48 photons per glucose (8 per CO₂)",
              "Total input: 48 × 1.83 eV ≈ 87.8 eV ≈ 8300 kJ/mol",
            ], note:"Of 87.8 eV input, only 29.7 eV (2870 kJ/mol) is stored in glucose bonds. The rest (58 eV) is entropy production — heat, fluorescence losses, Stokes shifts. This ratio gives η_max ≈ 34% for the light reactions alone; the dark reactions lose a further factor → 11% system max." },
            { title:"Z-SCHEME LIGHT REACTIONS", col:TEAL, eqs:[
              "2H₂O → O₂ + 4H⁺ + 4e⁻  (PSII)",
              "P680 + hν → P680*  (E = +0.82 V → −0.32 V)",
              "e⁻: PSII → PQ → Cyt b₆f → PC → PSI",
              "P700 + hν → P700*  (E = +0.37 V → −0.73 V)",
              "Fd + NADP⁺ + H⁺ → NADPH  (PSI output)",
              "Net: 2H₂O + 2NADP⁺ + 3ADP → O₂ + 2NADPH + 3ATP",
            ], note:"The Z-scheme raises electrons through two sequential quantum boosts separated by the electron transport chain. Quantum efficiency of exciton transfer in LHC: 95–99%. Recent experiments show quantum coherence (superposition over multiple pigments) persists ~300 femtoseconds at room temperature — the chloroplast is a quantum computer." },
            { title:"CHEMIOSMOSIS (ATP SYNTHESIS)", col:AMB, eqs:[
              "PMF = ΔΨ + (RT/F)·ln([H⁺]_lumen/[H⁺]_stroma)",
              "≈ −0.12 V + (−0.12 V) = −0.25 V total",
              "ΔG_proton = −F·PMF ≈ +24 kJ/mol",
              "ΔG_ATP = +30.5 kJ/mol per ATP",
              "H⁺ per ATP: 30.5/24 ≈ 1.27 (theoretical min)",
              "Actual c-ring: 10 c-subunits → 3.33 H⁺/ATP",
            ], note:"Peter Mitchell's chemiosmotic hypothesis (Nobel Prize 1978) showed that the proton gradient — not a direct chemical intermediate — is the universal energy currency linking photon capture to ATP synthesis. Paul Boyer (Nobel 1997) proved the F₁ head is a rotary motor by showing γ-stalk rotation." },
            { title:"CALVIN CYCLE (DARK REACTIONS)", col:GRN, eqs:[
              "CO₂ + RuBP → 2×3-PGA  (RuBisCO carboxylation)",
              "3-PGA + ATP + NADPH → G3P + ADP + NADP⁺",
              "5 G3P + 3 ATP → 3 RuBP  (regeneration)",
              "Net/turn: 3 CO₂ → 1 G3P  (+9 ATP, 6 NADPH)",
              "6 turns → 1 glucose (C₆H₁₂O₆) + 6 H₂O",
              "ΔG stored = +2870 kJ/mol",
            ], note:"RuBisCO is the most abundant enzyme on Earth (700 million tonnes) yet operates at only ~3 reactions/second — 100–1000× slower than most enzymes. This is why plants have so much of it. Its dual carboxylase/oxygenase activity (photorespiration) causes 25–30% efficiency loss in C3 plants — C4 plants suppress this with a CO₂ concentrating mechanism." },
            { title:"OVERALL THERMODYNAMICS", col:VIO, eqs:[
              "η_max = ΔG_glucose / E_total_photons",
              "= 2870 / 8300 = 34.5% (light reactions only)",
              "System max (light + dark rxns): ~11%",
              "C3 plants (wheat, rice): η ≈ 2.4–3.7%",
              "C4 plants (maize, sugarcane): η ≈ 3.7–6%",
              "Best lab result (engineered): ~9.6%",
            ], note:"Photosynthesis is 'inefficient' by engineering standards but the only self-replicating, self-repairing solar energy system ever built. Earth's biosphere fixes ~120 Gt of carbon per year, producing ~450 Gt of oxygen — all powered entirely by 1.74×10¹⁷ W of sunlight reaching the surface." },
            { title:"SUNLIGHT AS COMPUTER", col:ROSE, eqs:[
              "Input: photon stream (E, λ, polarization state)",
              "Register: exciton coherence over N pigments",
              "Gate: FRET (Förster resonance energy transfer)",
              "Clock: τ_coherence ≈ 300 fs (room temperature!)",
              "Output: charge separation → NADPH → G3P",
              "Program: Z-scheme energy landscape (hardwired)",
            ], note:"The light-harvesting complex explores all energy transfer pathways simultaneously via quantum superposition — then collapses to the most efficient one. This was demonstrated in 2007 by Fleming et al. using 2D electronic spectroscopy. It is the best evidence of functional quantum computation in a biological system at physiological temperature." },
          ].map(c=>(
            <div key={c.title} style={{ background:`${c.col}07`,
              border:`1px solid ${c.col}20`, borderRadius:10, padding:"14px 16px" }}>
              <div style={{ fontFamily:mono, fontSize:8, color:c.col, marginBottom:8 }}>{c.title}</div>
              <div style={{ background:`${c.col}08`, borderRadius:5, padding:"8px 10px", marginBottom:10 }}>
                {c.eqs.map(eq=>(
                  <div key={eq} style={{ fontFamily:mono, fontSize:8.5, color:`${c.col}90`, lineHeight:2.0 }}>{eq}</div>
                ))}
              </div>
              <div style={{ fontFamily:body, fontSize:12.5, color:DIM, lineHeight:1.75 }}>{c.note}</div>
            </div>
          ))}
        </div>

        {/* AETHER synthesis */}
        <SH n="V" title="AETHER Cross-System Synthesis"
          sub="The sunlight engine as the foundational substrate connecting every simulation in AETHER"
          col={VIO} />
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:14, marginBottom:32 }}>
          {[
            { title:"↔ PHOTON EMISSION  (/photon-emission)", col:GOLD,
              text:"The food you eat is the stored chemical energy of solar photons that hit a leaf. Your body's 499 W emission (λ_peak = 9.35 μm, E = 0.133 eV) is sunlight degraded through the metabolic chain: hν (1.83 eV, 680 nm) → glucose → ATP → muscle/heat → IR photons (0.133 eV, 9.35 μm). The 1.83 eV photon that fixed CO₂ returns from your body as ~14 IR photons at 0.133 eV each — thermodynamically degraded, but no information destroyed. The source always returns." },
            { title:"↔ EVENT HORIZON  (/event-horizon)", col:TEAL,
              text:"The LHC exciton (coherence C ≈ 0.99, τ = 300 fs) is the maximum coherence state — the exact opposite of the event horizon (C = 0, S_BH = maximum). The Calvin cycle, by contrast, is the 'golden crystallization': CO₂ (decoherent, disordered carbon) → glucose (ordered, coherent structure). The Fibonacci phyllotaxis of sunflower seeds and leaf spirals — which maximizes sunlight capture per plant — uses the same φ-lattice as the golden crystallization canvas. φ organizes both the macroscopic structure (plant growth) and the quantum energy landscape (Z-scheme redox tower spacing)." },
            { title:"↔ CAVITY COMPUTER  (/cavity-computer)", col:AMB,
              text:"The thylakoid lumen is a lid-driven cavity: the light-driven proton pump = moving lid, the lumen fluid = enclosed volume, the PMF-driven proton flow = vortex current, the ATP synthase c-ring = Poincaré return map measuring loop completions. The Calvin cycle IS the logistic map: CO₂ + 9 ATP per cycle, with the fixed-point at G3P/RuBP ratio x* = 1 − 1/R where R = ATP/ADP, analogous to R in the logistic map. At R > 3.57, the Calvin cycle enters chaos — the cell's signal to upregulate or downregulate enzymes." },
            { title:"↔ UNDERSTANDING STRAND  (/understanding-strand)", col:ROSE,
              text:"Each CO₂ molecule entering the Calvin cycle is a distinguishable event on the Understanding Strand — a prime-burst of information, a new branch point. RuBisCO is the measurement operator: it collapses the CO₂ + RuBP quantum superposition to a definite 3-PGA product, irreversibly. The G3P outputs branch into glucose, lipids, amino acids, nucleotides — the full possibility tree of organic chemistry opened from one fixing event. The strand model of D = emissivity, U = glucose accumulation, and the branching at RuBisCO = prime-burst events per second = RuBisCO turnover rate." },
          ].map(c=>(
            <div key={c.title} style={{ background:`${c.col}07`,
              border:`1px solid ${c.col}20`, borderRadius:10, padding:"14px 18px" }}>
              <div style={{ fontFamily:mono, fontSize:8, color:c.col, marginBottom:8 }}>{c.title}</div>
              <div style={{ fontFamily:body, fontSize:13.5, color:DIM, lineHeight:1.85 }}>{c.text}</div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div style={{ textAlign:"center", padding:"28px",
          background:"#ffffff03", border:`1px solid ${GRN}14`, borderRadius:12 }}>
          <div style={{ fontFamily:serif, fontSize:17, color:GRN, marginBottom:10 }}>
            6CO₂ + 6H₂O + 48hν → C₆H₁₂O₆ + 6O₂ · THE UNIVERSE BUILDS ITSELF FROM LIGHT
          </div>
          <div style={{ fontFamily:mono, fontSize:10, color:DIM, lineHeight:2.6 }}>
            {"E=hf=1.83eV  ·  η≈6%  ·  ΔG=2870kJ/mol  ·  RuBisCO:700Mt on Earth  ·  ATP:40pN·nm torque  ·  τ_coherence≈300fs"}
          </div>
          <div style={{ fontFamily:body, fontSize:15, color:DIM, lineHeight:2.0,
            maxWidth:680, margin:"14px auto 0" }}>
            Every carbon atom in your body was once CO₂ in the air, captured by RuBisCO using
            energy from a photon that traveled 93 million miles from the sun.
            The chloroplast is not a passive receiver — it is an active quantum computer
            running the Z-scheme as its program, synthesizing structure from chaos
            at femtosecond timescales. Sunlight is the source. Structure is the output.
            The factory has been running for 3.5 billion years without interruption.
          </div>
        </div>
      </div>
    </div>
  );
}
