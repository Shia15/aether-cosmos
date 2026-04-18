import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";

// ── Palette ────────────────────────────────────────────────────────────────────
const FISH_PALETTE: [number,number,number][] = [
  [255, 140, 50],   // amber
  [80,  200, 255],  // sky
  [200, 130, 255],  // violet
  [50,  220, 160],  // mint
  [255, 100, 130],  // coral-pink
  [240, 200, 60],   // gold
  [100, 180, 255],  // periwinkle
  [255, 170, 80],   // orange-warm
];

// ── Types ─────────────────────────────────────────────────────────────────────
interface FishEnt {
  id: number; x: number; y: number;
  vx: number; vy: number;
  angle: number;
  mode: "wander"|"seek"|"deposit"|"transform"|"flee";
  modeTimer: number;
  targetId: number;
  targetType: "coral"|"vent"|"none";
  charge: number;
  col: [number,number,number];
  trail: {x:number;y:number;a:number}[];
  size: number; speed: number;
}
interface CoralNode {
  id:number; fx:number; fy:number;
  charge:number; label:string; type:string; pulseT:number;
}
interface Vent {
  id:number; fx:number; fy:number;
  particles:{x:number;y:number;vx:number;vy:number;life:number}[];
  label:string;
}
interface BioPulse {
  id:number; x:number; y:number; r:number; maxR:number; life:number; col:string;
}
interface Packet {
  id:number; fromX:number; fromY:number; toX:number; toY:number;
  cx:number; cy:number; t:number; col:string;
  trail:{x:number;y:number}[];
}
interface LogEntry { id:number; text:string; col:string; }

interface SimState {
  fish: FishEnt[]; corals: CoralNode[]; vents: Vent[];
  pulses: BioPulse[]; packets: Packet[]; logs: LogEntry[];
  nid: number; t: number; speed: number;
  showLabels: boolean; showLines: boolean;
  W: number; H: number;
}

// ── Node layout (fractions of canvas W/H) ────────────────────────────────────
const CORAL_DEF = [
  { fx:0.22, fy:0.62, label:"STM-α",  type:"short",   col:"#ff8040" },
  { fx:0.50, fy:0.35, label:"PTRN-β", type:"pattern", col:"#a060ff" },
  { fx:0.78, fy:0.62, label:"LTM-γ",  type:"long",    col:"#40d8b0" },
  { fx:0.36, fy:0.82, label:"WORK-δ", type:"work",    col:"#f0c040" },
  { fx:0.64, fy:0.82, label:"ARCH-ε", type:"arch",    col:"#60b8ff" },
];
const VENT_DEF = [
  { fx:0.12, fy:0.92, label:"VENT-Ω" },
  { fx:0.68, fy:0.90, label:"VENT-Σ" },
];

// ── Math helpers ──────────────────────────────────────────────────────────────
const lerp = (a:number,b:number,t:number) => a+(b-a)*t;
const dist  = (ax:number,ay:number,bx:number,by:number) => Math.sqrt((bx-ax)**2+(by-ay)**2);
const rnd   = (lo:number,hi:number) => lo+Math.random()*(hi-lo);
const rint  = (lo:number,hi:number) => Math.floor(rnd(lo,hi+1));
const rgba  = (c:[number,number,number],a:number) => `rgba(${c[0]},${c[1]},${c[2]},${a})`;
function bezierPt(t:number,x0:number,y0:number,cx:number,cy:number,x1:number,y1:number){
  const u=1-t;
  return { x:u*u*x0+2*u*t*cx+t*t*x1, y:u*u*y0+2*u*t*cy+t*t*y1 };
}

// ── Init sim state ────────────────────────────────────────────────────────────
function initSim(W:number,H:number): SimState {
  const corals: CoralNode[] = CORAL_DEF.map((d,i)=>({
    id:i, fx:d.fx, fy:d.fy, charge:rnd(0.1,0.5), label:d.label, type:d.type, pulseT:0
  }));
  const vents: Vent[] = VENT_DEF.map((d,i)=>({ id:i, fx:d.fx, fy:d.fy, particles:[], label:d.label }));
  const fish: FishEnt[] = Array.from({length:8},(_,i)=>({
    id:i, x:rnd(W*0.1,W*0.9), y:rnd(H*0.2,H*0.8),
    vx:rnd(-1,1), vy:rnd(-0.5,0.5),
    angle:0, mode:"wander", modeTimer:rnd(60,180), targetId:0, targetType:"none",
    charge:rnd(0,0.6), col:FISH_PALETTE[i%FISH_PALETTE.length],
    trail:[], size:rnd(5,8), speed:rnd(1.2,2.4)
  }));
  return { fish, corals, vents, pulses:[], packets:[], logs:[], nid:100, t:0,
           speed:1, showLabels:true, showLines:true, W, H };
}

// ── Tick ──────────────────────────────────────────────────────────────────────
function tick(s:SimState, addLog:(t:string,c:string)=>void): SimState {
  const { W, H } = s;
  const spd = s.speed;
  const DT = spd;
  s.t += DT;

  // ── Vents: spawn particles
  for(const v of s.vents){
    const vx=v.fx*W, vy=v.fy*H;
    if(Math.random()<0.35*spd){
      v.particles.push({x:vx+rnd(-6,6), y:vy, vx:rnd(-0.4,0.4), vy:rnd(-1.2,-0.4), life:1});
    }
    for(const p of v.particles){
      p.x+=p.vx*spd; p.y+=p.vy*spd;
      p.vx+=rnd(-0.05,0.05);
      p.life-=0.012*spd;
    }
    v.particles=v.particles.filter(p=>p.life>0);
  }

  // ── Fish update
  for(const f of s.fish){
    f.modeTimer-=DT;

    if(f.mode==="wander" && f.modeTimer<=0){
      // Pick a new target
      const r=Math.random();
      if(r<0.60){
        f.targetId=rint(0,s.corals.length-1);
        f.targetType="coral";
        f.mode="seek";
        f.modeTimer=rnd(180,360);
      } else {
        f.targetId=rint(0,s.vents.length-1);
        f.targetType="vent";
        f.mode="seek";
        f.modeTimer=rnd(120,280);
      }
    }

    if(f.mode==="seek"){
      const tx=f.targetType==="coral"
        ? s.corals[f.targetId]?.fx*W ?? f.x
        : s.vents[f.targetId]?.fx*W ?? f.x;
      const ty=f.targetType==="coral"
        ? s.corals[f.targetId]?.fy*H ?? f.y
        : s.vents[f.targetId]?.fy*H ?? f.y;
      const d=dist(f.x,f.y,tx,ty);
      if(d<18){
        if(f.targetType==="coral"){
          f.mode="deposit"; f.modeTimer=rnd(40,90);
        } else {
          f.mode="transform"; f.modeTimer=rnd(30,60);
        }
      } else {
        const nx=(tx-f.x)/d, ny=(ty-f.y)/d;
        f.vx=lerp(f.vx,nx*f.speed,0.06);
        f.vy=lerp(f.vy,ny*f.speed,0.06);
      }
    }

    if(f.mode==="deposit" && f.modeTimer<=0){
      const c=s.corals[f.targetId];
      if(c){
        const gain=Math.min(f.charge*0.7+rnd(0.05,0.15), 1-c.charge);
        c.charge=Math.min(1,c.charge+gain);
        c.pulseT=1;
        addLog(`${f.id<4?"🐠":"🐟"} Fish-${f.id} → ${c.label} (+${(gain*100).toFixed(0)}% charge)`, CORAL_DEF[f.targetId]?.col ?? "#fff");
        // Spawn biopulse at coral
        s.pulses.push({id:s.nid++, x:c.fx*W, y:c.fy*H, r:8, maxR:60, life:1,
          col:CORAL_DEF[f.targetId]?.col ?? "#c0a0ff"});
        // If coral full, send packet to another coral
        if(c.charge>0.85){
          const dest=s.corals[rint(0,s.corals.length-1)];
          if(dest.id!==c.id){
            const sx=c.fx*W, sy=c.fy*H, ex=dest.fx*W, ey=dest.fy*H;
            s.packets.push({id:s.nid++, fromX:sx, fromY:sy, toX:ex, toY:ey,
              cx:(sx+ex)/2+rnd(-60,60), cy:(sy+ey)/2-rnd(30,80),
              t:0, col:CORAL_DEF[f.targetId]?.col ?? "#c084fc", trail:[]});
            c.charge=0.1;
            addLog(`💜 ${c.label} → ${dest.label} DATA PACKET`, "#c084fc");
          }
        }
        f.charge=Math.max(0,f.charge-0.5);
      }
      f.mode="wander"; f.modeTimer=rnd(60,140);
    }

    if(f.mode==="transform" && f.modeTimer<=0){
      const v=s.vents[f.targetId];
      if(v){
        const newCol=FISH_PALETTE[rint(0,FISH_PALETTE.length-1)];
        f.col=newCol;
        f.charge=Math.min(1,f.charge+rnd(0.3,0.6));
        s.pulses.push({id:s.nid++, x:v.fx*W, y:v.fy*H, r:6, maxR:80, life:1, col:"#ff6030"});
        addLog(`🌋 ${v.label} TRANSFORM → Fish-${f.id} signal mutated`, "#ff9040");
      }
      f.mode="wander"; f.modeTimer=rnd(80,160);
    }

    if(f.mode==="wander"){
      f.vx+=rnd(-0.08,0.08);
      f.vy+=rnd(-0.06,0.06);
      // Kelp slow-down zones
      for(const kfx of [0.08,0.50,0.92]){
        const kx=kfx*W;
        if(Math.abs(f.x-kx)<30) { f.vx*=0.94; f.vy*=0.96; }
      }
    }

    // Clamp speed
    const spd2=Math.sqrt(f.vx**2+f.vy**2);
    if(spd2>f.speed){ f.vx=f.vx/spd2*f.speed; f.vy=f.vy/spd2*f.speed; }

    // Update angle
    if(spd2>0.05) f.angle=Math.atan2(f.vy,f.vx);

    // Move
    f.x+=f.vx*spd; f.y+=f.vy*spd;

    // Bounce off walls
    if(f.x<20){ f.x=20; f.vx=Math.abs(f.vx); }
    if(f.x>W-20){ f.x=W-20; f.vx=-Math.abs(f.vx); }
    if(f.y<20){ f.y=20; f.vy=Math.abs(f.vy); }
    if(f.y>H-20){ f.y=H-20; f.vy=-Math.abs(f.vy); }

    // Trail
    f.trail.unshift({x:f.x,y:f.y,a:1});
    if(f.trail.length>20) f.trail.pop();
    for(const tr of f.trail) tr.a-=0.04;
  }

  // ── Coral decay
  for(const c of s.corals){
    c.charge=Math.max(0,c.charge-0.0001*spd);
    c.pulseT=Math.max(0,c.pulseT-0.04*spd);
  }

  // ── Bio pulses
  for(const p of s.pulses){
    p.r+=2.5*spd;
    p.life-=0.025*spd;
  }
  s.pulses=s.pulses.filter(p=>p.life>0&&p.r<p.maxR);

  // ── Packets
  for(const pk of s.packets){
    pk.t+=0.012*spd;
    const pt=bezierPt(pk.t,pk.fromX,pk.fromY,pk.cx,pk.cy,pk.toX,pk.toY);
    pk.trail.unshift({x:pt.x,y:pt.y});
    if(pk.trail.length>24) pk.trail.pop();
  }
  s.packets=s.packets.filter(pk=>pk.t<1);

  // ── Random bioluminescence
  if(Math.random()<0.015*spd){
    s.pulses.push({id:s.nid++,
      x:rnd(W*0.05,W*0.95), y:rnd(H*0.05,H*0.85),
      r:2, maxR:rnd(20,40), life:0.6, col:"rgba(100,200,255,0.3)"});
  }

  return {...s};
}

// ── Canvas renderer ────────────────────────────────────────────────────────────
function renderFrame(ctx:CanvasRenderingContext2D, s:SimState){
  const {W,H} = s;
  // Background
  const bg=ctx.createLinearGradient(0,0,0,H);
  bg.addColorStop(0,"#020c18"); bg.addColorStop(1,"#010810");
  ctx.fillStyle=bg; ctx.fillRect(0,0,W,H);

  // Subtle hex grid
  ctx.strokeStyle="rgba(0,80,180,0.04)"; ctx.lineWidth=0.5;
  const GRID=50;
  for(let x=0;x<W;x+=GRID){ctx.beginPath();ctx.moveTo(x,0);ctx.lineTo(x,H);ctx.stroke();}
  for(let y=0;y<H;y+=GRID){ctx.beginPath();ctx.moveTo(0,y);ctx.lineTo(W,y);ctx.stroke();}

  // ── Bio pulses (behind everything)
  for(const p of s.pulses){
    const g=ctx.createRadialGradient(p.x,p.y,0,p.x,p.y,p.r);
    g.addColorStop(0,p.col.startsWith("rgba")?p.col:"rgba(200,160,255,0.25)");
    g.addColorStop(1,"transparent");
    ctx.beginPath(); ctx.arc(p.x,p.y,p.r,0,Math.PI*2);
    ctx.fillStyle=g; ctx.fill();
  }

  // ── Connection lines
  if(s.showLines){
    for(let i=0;i<s.corals.length;i++){
      for(let j=i+1;j<s.corals.length;j++){
        const a=s.corals[i], b=s.corals[j];
        const d=dist(a.fx*W,a.fy*H,b.fx*W,b.fy*H);
        if(d<W*0.4){
          const str=(a.charge+b.charge)*0.08;
          ctx.beginPath();
          ctx.moveTo(a.fx*W,a.fy*H); ctx.lineTo(b.fx*W,b.fy*H);
          ctx.strokeStyle=`rgba(100,150,255,${str})`;
          ctx.lineWidth=0.5; ctx.stroke();
        }
      }
    }
  }

  // ── Kelp
  const kelpColors=["rgba(40,160,80,0.5)","rgba(30,200,100,0.4)","rgba(60,180,120,0.45)"];
  for(let ki=0;ki<3;ki++){
    const kfx=[0.08,0.50,0.92][ki];
    const kx=kfx*W, ky=H;
    const sway=Math.sin(s.t*0.025+ki*2.1)*18;
    const sway2=Math.sin(s.t*0.018+ki*1.4)*10;
    ctx.beginPath();
    ctx.moveTo(kx,ky);
    ctx.bezierCurveTo(kx+sway,ky-H*0.25, kx+sway2,ky-H*0.5, kx+sway*0.4,ky-H*0.72);
    ctx.strokeStyle=kelpColors[ki]; ctx.lineWidth=3; ctx.lineCap="round";
    ctx.stroke();
    // second strand
    ctx.beginPath();
    ctx.moveTo(kx+5,ky);
    ctx.bezierCurveTo(kx+sway*0.8+5,ky-H*0.2,kx+sway2*1.2,ky-H*0.4,kx+sway*0.6,ky-H*0.58);
    ctx.strokeStyle=kelpColors[ki].replace("0.4","0.25"); ctx.lineWidth=2; ctx.stroke();
  }

  // ── Thermal vents
  for(const v of s.vents){
    const vx=v.fx*W, vy=v.fy*H;
    // Base ring
    ctx.beginPath(); ctx.arc(vx,vy,12,0,Math.PI*2);
    ctx.fillStyle="rgba(255,80,20,0.3)"; ctx.fill();
    ctx.strokeStyle="rgba(255,120,40,0.8)"; ctx.lineWidth=1.5; ctx.stroke();
    // Particles
    for(const p of v.particles){
      ctx.beginPath(); ctx.arc(p.x,p.y,2.5*p.life,0,Math.PI*2);
      ctx.fillStyle=`rgba(255,${100+Math.floor(p.life*100)},40,${p.life*0.8})`;
      ctx.fill();
    }
    // Label
    if(s.showLabels){
      ctx.fillStyle="rgba(255,140,60,0.7)"; ctx.font="8px Cinzel,serif";
      ctx.textAlign="center"; ctx.fillText(v.label,vx,vy+22);
    }
  }

  // ── Coral nodes
  for(let i=0;i<s.corals.length;i++){
    const c=s.corals[i];
    const cx2=c.fx*W, cy2=c.fy*H;
    const def=CORAL_DEF[i];
    const col=def.col;
    const charge=c.charge;
    const pulse=c.pulseT;
    // Outer glow (charge-based)
    const glow=ctx.createRadialGradient(cx2,cy2,0,cx2,cy2,30+charge*20);
    glow.addColorStop(0,col+"50"); glow.addColorStop(1,"transparent");
    ctx.beginPath(); ctx.arc(cx2,cy2,30+charge*20,0,Math.PI*2);
    ctx.fillStyle=glow; ctx.fill();
    // Pulse ring
    if(pulse>0){
      ctx.beginPath(); ctx.arc(cx2,cy2,20+pulse*25,0,Math.PI*2);
      ctx.strokeStyle=col+Math.floor(pulse*200).toString(16).padStart(2,"0");
      ctx.lineWidth=2; ctx.stroke();
    }
    // Branches
    for(let b=0;b<5;b++){
      const ang=b*Math.PI*2/5 + s.t*0.004;
      const len=14+charge*12;
      ctx.beginPath();
      ctx.moveTo(cx2,cy2);
      ctx.lineTo(cx2+Math.cos(ang)*len, cy2+Math.sin(ang)*len);
      ctx.strokeStyle=col+"80"; ctx.lineWidth=1.5; ctx.stroke();
    }
    // Core
    ctx.beginPath(); ctx.arc(cx2,cy2,8+charge*6,0,Math.PI*2);
    ctx.fillStyle=col; ctx.shadowBlur=12+charge*20;
    ctx.shadowColor=col; ctx.fill(); ctx.shadowBlur=0;
    // Charge arc
    ctx.beginPath();
    ctx.arc(cx2,cy2,14,-(Math.PI/2),-(Math.PI/2)+charge*Math.PI*2);
    ctx.strokeStyle=col+"cc"; ctx.lineWidth=2; ctx.stroke();
    // Label
    if(s.showLabels){
      ctx.fillStyle="rgba(255,255,255,0.6)"; ctx.font="8px Cinzel,serif";
      ctx.textAlign="center"; ctx.shadowBlur=0;
      ctx.fillText(c.label,cx2,cy2-22);
      ctx.fillStyle=col+"99"; ctx.font="7px monospace";
      ctx.fillText(`${(charge*100).toFixed(0)}%`,cx2,cy2+28);
    }
  }

  // ── Data packets
  for(const pk of s.packets){
    const pt=bezierPt(pk.t,pk.fromX,pk.fromY,pk.cx,pk.cy,pk.toX,pk.toY);
    // Trail
    for(let ti=0;ti<pk.trail.length;ti++){
      const a=(1-ti/pk.trail.length)*0.6;
      const r=5*(1-ti/pk.trail.length);
      ctx.beginPath(); ctx.arc(pk.trail[ti].x,pk.trail[ti].y,r,0,Math.PI*2);
      const hex=pk.col;
      ctx.fillStyle=hex+(Math.floor(a*255)).toString(16).padStart(2,"0");
      ctx.fill();
    }
    // Head
    ctx.beginPath(); ctx.arc(pt.x,pt.y,6,0,Math.PI*2);
    ctx.fillStyle=pk.col; ctx.shadowBlur=14; ctx.shadowColor=pk.col; ctx.fill();
    ctx.shadowBlur=0;
  }

  // ── Fish
  for(const f of s.fish){
    const {x,y,angle,col,trail,charge,size,mode} = f;
    // Trail
    for(let ti=0;ti<trail.length;ti++){
      const pt=trail[ti];
      const a=Math.max(0,pt.a)*0.35;
      const r=size*0.5*(1-ti/trail.length);
      if(r<0.3) continue;
      ctx.beginPath(); ctx.arc(pt.x,pt.y,r,0,Math.PI*2);
      ctx.fillStyle=rgba(col,a); ctx.fill();
    }
    ctx.save(); ctx.translate(x,y); ctx.rotate(angle);
    // Glow if carrying charge
    if(charge>0.2){
      ctx.shadowBlur=12*charge; ctx.shadowColor=rgba(col,0.9);
    }
    // Body
    ctx.beginPath(); ctx.ellipse(0,0,size*1.4,size*0.65,0,0,Math.PI*2);
    ctx.fillStyle=rgba(col,0.9); ctx.fill();
    // Tail
    ctx.beginPath();
    ctx.moveTo(-size*1.1,0);
    ctx.lineTo(-size*2.0,-size*0.7);
    ctx.lineTo(-size*2.0, size*0.7);
    ctx.closePath(); ctx.fill();
    // Fin
    ctx.beginPath();
    ctx.moveTo(-size*0.3,-size*0.65);
    ctx.quadraticCurveTo(0,-size*1.2,size*0.4,-size*0.5);
    ctx.fillStyle=rgba(col,0.5); ctx.fill();
    // Eye
    ctx.beginPath(); ctx.arc(size*0.7,-size*0.15,size*0.22,0,Math.PI*2);
    ctx.fillStyle="rgba(255,255,255,0.9)"; ctx.fill();
    ctx.beginPath(); ctx.arc(size*0.72,-size*0.15,size*0.12,0,Math.PI*2);
    ctx.fillStyle="#111"; ctx.fill();
    // Data charge indicator
    if(charge>0.1){
      ctx.beginPath(); ctx.arc(0,-size*0.5,size*0.4,0,0,true);
      ctx.arc(0,-size*0.5,size*0.4,0,charge*Math.PI*2,false);
      ctx.fillStyle=rgba(col,0.7); ctx.fill();
    }
    ctx.shadowBlur=0; ctx.restore();
    // Mode indicator
    if(s.showLabels && mode==="deposit"){
      ctx.fillStyle="rgba(255,255,200,0.8)"; ctx.font="8px monospace";
      ctx.textAlign="center"; ctx.fillText("↓",x,y-size-5);
    }
    if(s.showLabels && mode==="transform"){
      ctx.fillStyle="rgba(255,180,80,0.9)"; ctx.font="8px monospace";
      ctx.textAlign="center"; ctx.fillText("⟳",x,y-size-5);
    }
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
export default function AquariumChipPage() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const simRef = useRef<SimState|null>(null);
  const rafRef = useRef(0);

  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [paused, setPaused] = useState(false);
  const [speed, setSpeed] = useState(1);
  const [showLabels, setShowLabels] = useState(true);
  const [showLines, setShowLines] = useState(true);
  const [charges, setCharges] = useState<number[]>([]);
  const pausedRef = useRef(false);
  const logIdRef = useRef(200);

  const addLog = useCallback((text:string, col:string) => {
    const entry: LogEntry = { id: logIdRef.current++, text, col };
    setLogs(prev => [entry,...prev].slice(0,12));
    if(simRef.current) simRef.current.logs=[entry,...simRef.current.logs].slice(0,12);
  },[]);

  // Init
  useEffect(()=>{
    const el=containerRef.current;
    if(!el) return;
    const W=el.clientWidth||900, H=380;
    simRef.current=initSim(W,H);
    const canvas=canvasRef.current;
    if(canvas){ canvas.width=W; canvas.height=H; }
  },[]);

  // RAF loop
  useEffect(()=>{
    pausedRef.current=paused;
  },[paused]);
  useEffect(()=>{
    if(simRef.current) simRef.current.speed=speed;
  },[speed]);
  useEffect(()=>{
    if(simRef.current){ simRef.current.showLabels=showLabels; simRef.current.showLines=showLines; }
  },[showLabels,showLines]);

  useEffect(()=>{
    const loop=()=>{
      if(!pausedRef.current && simRef.current){
        const next=tick(simRef.current,addLog);
        simRef.current=next;
        const canvas=canvasRef.current;
        if(canvas){
          const ctx=canvas.getContext("2d");
          if(ctx) renderFrame(ctx,next);
        }
        // Update charge display every 15 frames
        if(Math.round(next.t)%15===0){
          setCharges(next.corals.map(c=>c.charge));
        }
      }
      rafRef.current=requestAnimationFrame(loop);
    };
    rafRef.current=requestAnimationFrame(loop);
    return ()=>cancelAnimationFrame(rafRef.current);
  },[addLog]);

  // Click to inject data pulse
  const handleCanvasClick=(e:React.MouseEvent<HTMLCanvasElement>)=>{
    const rect=canvasRef.current?.getBoundingClientRect();
    if(!rect||!simRef.current) return;
    const x=e.clientX-rect.left, y=e.clientY-rect.top;
    simRef.current.pulses.push({id:simRef.current.nid++,x,y,r:6,maxR:90,life:1,col:"rgba(200,160,255,0.5)"});
    addLog(`✨ Manual pulse injected at (${x.toFixed(0)}, ${y.toFixed(0)})`,"#c084fc");
    // Nudge nearby fish
    for(const f of simRef.current.fish){
      if(dist(f.x,f.y,x,y)<120){
        f.vx+=(f.x-x)*0.02; f.vy+=(f.y-y)*0.02;
        f.charge=Math.min(1,f.charge+0.2);
      }
    }
  };

  const CORAL_LABELS = CORAL_DEF.map(d=>d.label);

  return (
    <div className="min-h-screen text-white font-['Raleway',sans-serif] pb-10" style={{background:"#020b18"}}>

      {/* Header */}
      <div className="border-b border-cyan-900/30 px-6 py-4 sticky top-0 z-20" style={{background:"#010810ee"}}>
        <p className="text-[10px] tracking-[0.3em] text-cyan-400/50 font-['Cinzel',serif] mb-0.5">
          SYSTEM · HARDWARE · VISIBLE INTELLIGENCE
        </p>
        <h1 className="text-2xl font-['Cinzel',serif] tracking-widest text-cyan-100">
          THE AQUARIUM CHIP
        </h1>
        <p className="text-xs text-cyan-300/40 mt-0.5">
          Glass-Box Computing · Ecosystemic Architecture · The Symphonic Protocol
        </p>
        <div className="flex gap-4 mt-2 flex-wrap text-[9px] font-['Cinzel',serif]">
          {[
            ["🐠","FISH","Fast-Logic Nodes","#f28040"],
            ["🪸","CORAL","Memory Substrate","#a060ff"],
            ["🌿","KELP","Regulatory Filters","#40c870"],
            ["🌋","VENT","Transform Gates","#ff6030"],
            ["💜","BIO","Intuition Signals","#c084fc"],
          ].map(([icon,key,desc,col])=>(
            <div key={key} className="flex items-center gap-1.5">
              <span>{icon}</span>
              <span style={{color:col}} className="tracking-widest">{key}</span>
              <span className="text-cyan-600/40">{desc}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Canvas */}
      <div ref={containerRef} className="relative w-full border-b border-cyan-900/20"
        style={{background:"#010810"}}>
        <canvas ref={canvasRef}
          onClick={handleCanvasClick}
          className="w-full cursor-crosshair block"
          style={{height:380}}
        />
        {/* Glassmorphic overlay frame */}
        <div className="absolute inset-0 pointer-events-none border-2 rounded-none"
          style={{borderColor:"rgba(0,200,255,0.06)"}} />
        {/* Corner labels */}
        <div className="absolute top-2 left-3 text-[8px] font-['Cinzel',serif] text-cyan-400/30 tracking-widest">
          AQUARIUM CHIP v0.1 · LIVE
        </div>
        <div className="absolute top-2 right-3 text-[8px] font-mono text-cyan-400/30">
          CLICK TO INJECT PULSE
        </div>
        {/* Coral charge HUD */}
        <div className="absolute bottom-2 right-3 flex gap-2">
          {CORAL_LABELS.map((lbl,i)=>(
            <div key={lbl} className="text-center">
              <div className="text-[7px] font-['Cinzel',serif] mb-0.5"
                style={{color:CORAL_DEF[i].col+"99"}}>{lbl}</div>
              <div className="w-1.5 rounded-full overflow-hidden" style={{height:24,background:"rgba(255,255,255,0.05)"}}>
                <div className="w-full rounded-full transition-all duration-500"
                  style={{height:`${(charges[i]||0)*24}px`,background:CORAL_DEF[i].col,marginTop:"auto"}} />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Controls */}
      <div className="px-5 py-2 flex items-center gap-4 border-b border-cyan-900/20 flex-wrap"
        style={{background:"#010d1c99"}}>
        <button onClick={()=>setPaused(p=>!p)}
          className={`px-4 py-1.5 rounded-lg text-[10px] font-['Cinzel',serif] tracking-widest border transition-all ${
            paused?"border-yellow-500/50 text-yellow-400":"border-cyan-500/40 text-cyan-400"}`}>
          {paused?"▶ RUN":"⏸ PAUSE"}
        </button>
        <div className="flex items-center gap-2">
          <span className="text-[9px] text-cyan-600/50 font-['Cinzel',serif]">SPEED</span>
          <input type="range" min={0.3} max={3} step={0.1} value={speed}
            onChange={e=>setSpeed(+e.target.value)}
            className="w-20 h-1 accent-cyan-400" />
          <span className="text-[9px] text-cyan-300/60 w-6">{speed.toFixed(1)}×</span>
        </div>
        <button onClick={()=>setShowLabels(b=>!b)}
          className={`px-3 py-1 rounded text-[9px] font-['Cinzel',serif] border transition-all ${showLabels?"border-cyan-600/40 text-cyan-400":"border-cyan-900/30 text-cyan-700/40"}`}>
          LABELS
        </button>
        <button onClick={()=>setShowLines(b=>!b)}
          className={`px-3 py-1 rounded text-[9px] font-['Cinzel',serif] border transition-all ${showLines?"border-cyan-600/40 text-cyan-400":"border-cyan-900/30 text-cyan-700/40"}`}>
          CONNECTIONS
        </button>
        <span className="text-[8px] text-cyan-700/30 ml-auto font-['Cinzel',serif]">
          THE SYMPHONIC PROTOCOL · AETHER OS
        </span>
      </div>

      {/* Event log */}
      <div className="px-5 py-2 border-b border-cyan-900/20 overflow-hidden" style={{background:"#010810cc",minHeight:40}}>
        <div className="flex gap-3 overflow-x-auto scrollbar-thin">
          <AnimatePresence initial={false}>
            {logs.slice(0,8).map(l=>(
              <motion.div key={l.id}
                initial={{opacity:0,y:-8}} animate={{opacity:1,y:0}} exit={{opacity:0}}
                className="shrink-0 text-[9px] font-mono px-2 py-1 rounded border whitespace-nowrap"
                style={{borderColor:l.col+"30",color:l.col+"cc",background:l.col+"0a"}}>
                {l.text}
              </motion.div>
            ))}
          </AnimatePresence>
          {logs.length===0&&<span className="text-[9px] text-cyan-800/40 font-['Cinzel',serif]">Simulation initialising…</span>}
        </div>
      </div>

      {/* Bottom info section */}
      <div className="p-5 grid grid-cols-3 gap-5">

        {/* Ecosystem key */}
        <div className="flex flex-col gap-3">
          <p className="text-[9px] tracking-widest font-['Cinzel',serif] text-cyan-400/50 mb-1">ECOSYSTEM COMPONENTS</p>
          {[
            {icon:"🐠",name:"FAST-LOGIC FISH",col:"#f28040",desc:"Mobile signal carriers. Reactive, real-time. Each fish carries a data charge and seeks coral or vents. Visible trail = signal pathway. The speed and direction of movement encodes computational priority."},
            {icon:"🪸",name:"MEMORY CORAL",col:"#a060ff",desc:"Anchored accumulator nodes. Each coral type handles different memory timescale: STM (short-term), LTM (long-term), PTRN (pattern recognition), WORK (working buffer), ARCH (archive). Charge % visible in real time. When full, fires a packet to the network."},
            {icon:"🌿",name:"KELP FILTERS",col:"#40c870",desc:"Regulatory damping structures. Fish slow within kelp zones — natural frequency filtering. Kelp sway encodes ambient network state. Dense kelp = throttled throughput. Minimal kelp = high-speed pass-through."},
            {icon:"🌋",name:"THERMAL VENTS",col:"#ff6030",desc:"State-transform gates. When a fish enters a vent, its signal type mutates — colour shift marks the transformation. Analogous to a nonlinear activation function in a neural network, or a phase transition in the φ-framework."},
            {icon:"💜",name:"BIOLUMINESCENCE",col:"#c084fc",desc:"Soft emergence signals. Not hardwired — triggered by activity density. A fish depositing data, a coral firing, a manual pulse. Bioluminescence is the system's intuition layer: pattern recognition that didn't come from explicit computation."},
          ].map(c=>(
            <div key={c.name} className="border rounded-xl p-3 flex gap-2.5"
              style={{borderColor:c.col+"25",background:c.col+"07"}}>
              <span className="text-xl mt-0.5">{c.icon}</span>
              <div>
                <p className="text-[9px] font-['Cinzel',serif] tracking-wider mb-1" style={{color:c.col}}>{c.name}</p>
                <p className="text-[9px] text-cyan-300/50 leading-4">{c.desc}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Symphonic Protocol */}
        <div className="flex flex-col gap-3">
          <p className="text-[9px] tracking-widest font-['Cinzel',serif] text-cyan-400/50 mb-1">THE SYMPHONIC PROTOCOL</p>
          <div className="rounded-xl overflow-hidden border border-cyan-900/30">
            <img src="/symphonic-protocol.jpeg" alt="Symphonic Protocol Architecture"
              className="w-full object-cover" style={{maxHeight:220}} />
          </div>
          <div className="border border-cyan-900/30 rounded-xl p-4" style={{background:"#010d1c"}}>
            <p className="text-[9px] font-['Cinzel',serif] text-cyan-300/60 mb-2 tracking-wider">THREE-LAYER ARCHITECTURE</p>
            {[
              {n:"1.",label:"Mycelial-Silicon Substrate",col:"#40c8ff",desc:"The base computation fabric — neural network topology grown onto silicon, mimicking fungal mycelium. Parallel, fault-tolerant, self-routing."},
              {n:"2.",label:"Circulatory Engine Layer",col:"#f0c040",desc:"Data flows like blood: pressure-driven, bidirectional, with pumping nodes (vents) that prevent stagnation and enforce freshness."},
              {n:"3.",label:"Resonant Medicine Field",col:"#80ff80",desc:"The emergence layer — DNA-helix signal structures that encode systemic health, coherence, and long-range correlation across the substrate."},
            ].map(l=>(
              <div key={l.n} className="flex gap-2 mb-2.5">
                <span className="text-[10px] font-['Cinzel',serif] shrink-0 mt-0.5" style={{color:l.col}}>{l.n}</span>
                <div>
                  <p className="text-[9px] font-['Cinzel',serif]" style={{color:l.col+"cc"}}>{l.label}</p>
                  <p className="text-[9px] text-cyan-600/50 leading-4 mt-0.5">{l.desc}</p>
                </div>
              </div>
            ))}
          </div>
          <div className="border border-purple-900/30 rounded-xl p-4" style={{background:"#07021a80"}}>
            <p className="text-[9px] font-['Cinzel',serif] text-purple-400/60 mb-2 tracking-wider">AETHER MAPPING</p>
            <p className="text-[9px] text-purple-300/50 leading-4">
              Fish → M.A.R.I. agents (reactive inference layer)<br/>
              Coral → Mnēsis accumulator nodes<br/>
              Kelp → Coherence Bus flow dampers<br/>
              Vents → Aletheia transform gates<br/>
              Bioluminescence → Reverie emergence signals<br/>
              Packets → CGLE lattice update propagation
            </p>
          </div>
        </div>

        {/* Crystallization substrate */}
        <div className="flex flex-col gap-3">
          <p className="text-[9px] tracking-widest font-['Cinzel',serif] text-cyan-400/50 mb-1">CRYSTALLIZATION SUBSTRATE</p>
          <div className="grid grid-cols-2 gap-2">
            <div className="rounded-xl overflow-hidden border border-blue-900/30">
              <img src="/sapphire-formation.jpeg" alt="Sapphire Formation" className="w-full object-cover h-36" />
            </div>
            <div className="rounded-xl overflow-hidden border border-purple-900/30">
              <img src="/sapphire-trace.jpeg" alt="Trace Elements" className="w-full object-cover h-36" />
            </div>
          </div>
          <div className="border border-blue-900/30 rounded-xl p-4" style={{background:"#010d1c"}}>
            <p className="text-[9px] font-['Cinzel',serif] text-blue-300/60 mb-2 tracking-wider">Al₂O₃ AS COMPUTING METAPHOR</p>
            <p className="text-[9px] text-blue-300/50 leading-4">
              Pure sapphire (Al₂O₃) forms under extreme pressure and energy compression — raw atoms forced into crystalline order. The Aquarium Chip is the opposite: intelligence that <em>grows</em> rather than is compressed into it.
            </p>
            <div className="mt-3 pt-3 border-t border-blue-900/20 text-[9px] text-blue-600/40 leading-4">
              But the trace element principle holds: Ti, Fe, Ni, Cr introduced to Al₂O₃ create different sapphire colors — different capabilities from the same substrate. In the Aquarium Chip, fish type (color) encodes signal class. Same architecture. Different trace logic.
            </div>
          </div>
          <div className="border border-cyan-900/30 rounded-xl p-4" style={{background:"#010d1c80"}}>
            <p className="text-[9px] font-['Cinzel',serif] text-cyan-400/50 mb-2 tracking-wider">THE GLASS BOX PRINCIPLE</p>
            <p className="text-[9px] text-cyan-300/50 leading-4">
              We are not building bigger black boxes. We are building glass ones.
            </p>
            <p className="text-[9px] text-cyan-600/35 leading-4 mt-2">
              Every signal visible. Every node with a role. Every computation leaving a trace. The Aquarium Chip is a prototype for a civilizational operating system that treats computation the way nature treats ecosystems: distributed, self-healing, and <strong className="text-cyan-400/50">observable</strong>.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
