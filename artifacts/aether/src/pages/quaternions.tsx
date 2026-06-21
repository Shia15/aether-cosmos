import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";

// ── Quaternion math ────────────────────────────────────────────────────────────
interface Q { w:number; x:number; y:number; z:number; }
const qMul = (a:Q,b:Q):Q => ({
  w: a.w*b.w - a.x*b.x - a.y*b.y - a.z*b.z,
  x: a.w*b.x + a.x*b.w + a.y*b.z - a.z*b.y,
  y: a.w*b.y - a.x*b.z + a.y*b.w + a.z*b.x,
  z: a.w*b.z + a.x*b.y - a.y*b.x + a.z*b.w,
});
const qFromAxis = (ax:number,ay:number,az:number,ang:number):Q => {
  const s=Math.sin(ang/2);
  return { w:Math.cos(ang/2), x:ax*s, y:ay*s, z:az*s };
};
const qNorm = (q:Q):Q => {
  const m=Math.sqrt(q.w*q.w+q.x*q.x+q.y*q.y+q.z*q.z)||1;
  return {w:q.w/m,x:q.x/m,y:q.y/m,z:q.z/m};
};
const qConj = (q:Q):Q => ({w:q.w,x:-q.x,y:-q.y,z:-q.z});
const qRotV = (q:Q,v:[number,number,number]):[number,number,number] => {
  const p:Q={w:0,x:v[0],y:v[1],z:v[2]};
  const r=qMul(qMul(q,p),qConj(q));
  return [r.x,r.y,r.z];
};
const qSlerp = (a:Q,b:Q,t:number):Q => {
  let dot=a.w*b.w+a.x*b.x+a.y*b.y+a.z*b.z;
  const b2:Q=dot<0?{w:-b.w,x:-b.x,y:-b.y,z:-b.z}:b;
  dot=Math.abs(dot);
  if(dot>0.9995){
    return qNorm({w:a.w+(b2.w-a.w)*t,x:a.x+(b2.x-a.x)*t,y:a.y+(b2.y-a.y)*t,z:a.z+(b2.z-a.z)*t});
  }
  const theta0=Math.acos(dot),theta=theta0*t;
  const s0=Math.cos(theta)-dot*Math.sin(theta)/Math.sin(theta0);
  const s1=Math.sin(theta)/Math.sin(theta0);
  return qNorm({w:a.w*s0+b2.w*s1,x:a.x*s0+b2.x*s1,y:a.y*s0+b2.y*s1,z:a.z*s0+b2.z*s1});
};
const qIdentity:Q={w:1,x:0,y:0,z:0};

// ── Euler rotation matrix (ZYX = yaw-pitch-roll) ──────────────────────────────
function eulerMat(roll:number,pitch:number,yaw:number):number[][] {
  const cr=Math.cos(roll),sr=Math.sin(roll);
  const cp=Math.cos(pitch),sp=Math.sin(pitch);
  const cy=Math.cos(yaw),sy=Math.sin(yaw);
  return [
    [cy*cp, cy*sp*sr-sy*cr, cy*sp*cr+sy*sr],
    [sy*cp, sy*sp*sr+cy*cr, sy*sp*cr-cy*sr],
    [-sp,   cp*sr,           cp*cr         ],
  ];
}
function matV(m:number[][],v:[number,number,number]):[number,number,number]{
  return [
    m[0][0]*v[0]+m[0][1]*v[1]+m[0][2]*v[2],
    m[1][0]*v[0]+m[1][1]*v[1]+m[1][2]*v[2],
    m[2][0]*v[0]+m[2][1]*v[1]+m[2][2]*v[2],
  ];
}

// ── 3-D projection ────────────────────────────────────────────────────────────
function proj(v:[number,number,number],W:number,H:number,d=4.5):[number,number]{
  const z=v[2]+d;
  if(z<=0.001) return [W/2,H/2];
  const sc=d/z;
  return [v[0]*sc*W*0.22+W/2, -v[1]*sc*H*0.22+H/2];
}

// ── Cube geometry ─────────────────────────────────────────────────────────────
const VERTS:[number,number,number][] = [
  [-1,-1,-1],[1,-1,-1],[1,1,-1],[-1,1,-1],
  [-1,-1, 1],[1,-1, 1],[1,1, 1],[-1,1, 1],
];
const EDGES=[
  [0,1],[1,2],[2,3],[3,0],
  [4,5],[5,6],[6,7],[7,4],
  [0,4],[1,5],[2,6],[3,7],
];

// ── Draw 3-D frame (axes + cube) ──────────────────────────────────────────────
function drawFrame(
  ctx:CanvasRenderingContext2D,
  W:number, H:number,
  rotFn:(v:[number,number,number])=>[number,number,number],
  locked:boolean,
  label:string,
){
  ctx.clearRect(0,0,W,H);
  // BG
  ctx.fillStyle="#03080f";
  ctx.fillRect(0,0,W,H);
  if(locked){
    ctx.fillStyle="rgba(255,80,40,0.04)";
    ctx.fillRect(0,0,W,H);
  }

  // Subtle grid
  ctx.strokeStyle="rgba(0,80,150,0.08)";ctx.lineWidth=0.5;
  for(let x=0;x<W;x+=30){ctx.beginPath();ctx.moveTo(x,0);ctx.lineTo(x,H);ctx.stroke();}
  for(let y=0;y<H;y+=30){ctx.beginPath();ctx.moveTo(0,y);ctx.lineTo(W,y);ctx.stroke();}

  // Cube
  const rotVerts=VERTS.map(v=>rotFn(v));
  const projVerts=rotVerts.map(v=>proj(v,W,H));
  ctx.strokeStyle=locked?"rgba(255,140,40,0.55)":"rgba(100,180,255,0.45)";
  ctx.lineWidth=1.2;
  for(const [a,b] of EDGES){
    ctx.beginPath();
    ctx.moveTo(projVerts[a][0],projVerts[a][1]);
    ctx.lineTo(projVerts[b][0],projVerts[b][1]);
    ctx.stroke();
  }
  // Cube verts
  for(const p of projVerts){
    ctx.beginPath();ctx.arc(p[0],p[1],2,0,Math.PI*2);
    ctx.fillStyle=locked?"rgba(255,140,40,0.6)":"rgba(120,200,255,0.7)";
    ctx.fill();
  }

  // Axes (1.6 units long)
  const O:[number,number,number]=[0,0,0];
  const rO=rotFn(O);
  const pO=proj(rO,W,H);
  const axes:[[[number,number,number],string]][] = [
    [[[1.6,0,0],"#ff5050"]], [[[0,1.6,0],"#50ff80"]], [[[0,0,1.6],"#5090ff"]]
  ] as any;
  const axDefs:[[number,number,number],string][]=[
    [[1.6,0,0],"#ff5050"],[[0,1.6,0],"#50ff80"],[[0,0,1.6],"#5090ff"]
  ];
  const axLabels=["X","Y","Z"];
  for(let i=0;i<3;i++){
    const rv=rotFn(axDefs[i][0]);
    const pv=proj(rv,W,H);
    ctx.beginPath();ctx.moveTo(pO[0],pO[1]);ctx.lineTo(pv[0],pv[1]);
    ctx.strokeStyle=axDefs[i][1];ctx.lineWidth=2;
    ctx.shadowBlur=6;ctx.shadowColor=axDefs[i][1];
    ctx.stroke();ctx.shadowBlur=0;
    // Label
    ctx.fillStyle=axDefs[i][1];ctx.font="bold 9px monospace";ctx.textAlign="center";
    ctx.fillText(axLabels[i],pv[0]+(pv[0]-pO[0])*0.15,pv[1]+(pv[1]-pO[1])*0.15);
  }

  // Label
  ctx.fillStyle=locked?"rgba(255,100,60,0.8)":"rgba(80,200,255,0.6)";
  ctx.font="9px Cinzel,serif";ctx.textAlign="left";
  ctx.fillText(label,8,14);
  if(locked){
    ctx.fillStyle="rgba(255,100,60,0.7)";ctx.font="bold 10px monospace";ctx.textAlign="center";
    ctx.fillText("⚠ GIMBAL LOCK",W/2,H-10);
  }
}

// ── SLERP path canvas ─────────────────────────────────────────────────────────
function drawSlerpCanvas(ctx:CanvasRenderingContext2D,W:number,H:number,t:number){
  ctx.clearRect(0,0,W,H);
  ctx.fillStyle="#03080f";ctx.fillRect(0,0,W,H);
  const cx=W/2,cy=H/2,R=Math.min(W,H)*0.38;
  // Sphere outline
  ctx.beginPath();ctx.arc(cx,cy,R,0,Math.PI*2);
  ctx.strokeStyle="rgba(100,150,255,0.2)";ctx.lineWidth=1;ctx.stroke();
  // Two points on the circle (S¹ projection of S³)
  const ang0=-Math.PI*0.55, ang1=Math.PI*0.25;
  const p0:[number,number]=[cx+R*Math.cos(ang0),cy+R*Math.sin(ang0)];
  const p1:[number,number]=[cx+R*Math.cos(ang1),cy+R*Math.sin(ang1)];
  // LERP path (straight chord, wrong)
  ctx.beginPath();ctx.moveTo(p0[0],p0[1]);ctx.lineTo(p1[0],p1[1]);
  ctx.strokeStyle="rgba(255,100,60,0.35)";ctx.lineWidth=1.5;ctx.setLineDash([4,4]);ctx.stroke();
  ctx.setLineDash([]);
  // SLERP arc (great arc on sphere = arc along circumference)
  const dAng=ang1-ang0;
  ctx.beginPath();
  ctx.arc(cx,cy,R,ang0,ang1,dAng<0);
  ctx.strokeStyle="rgba(100,220,180,0.7)";ctx.lineWidth=2;ctx.stroke();
  // Moving dot
  const angT=ang0+dAng*t;
  const lerp_x=p0[0]+(p1[0]-p0[0])*t, lerp_y=p0[1]+(p1[1]-p0[1])*t;
  const slerp_x=cx+R*Math.cos(angT), slerp_y=cy+R*Math.sin(angT);
  // LERP dot (red, off-sphere)
  ctx.beginPath();ctx.arc(lerp_x,lerp_y,5,0,Math.PI*2);
  ctx.fillStyle="#ff6040";ctx.shadowBlur=8;ctx.shadowColor="#ff6040";ctx.fill();ctx.shadowBlur=0;
  // SLERP dot (teal, on-sphere)
  ctx.beginPath();ctx.arc(slerp_x,slerp_y,6,0,Math.PI*2);
  ctx.fillStyle="#40d8b0";ctx.shadowBlur=10;ctx.shadowColor="#40d8b0";ctx.fill();ctx.shadowBlur=0;
  // Source / dest points
  for(const [px,py,col] of [[p0[0],p0[1],"#c084fc"],[p1[0],p1[1],"#f2bf65"]] as [number,number,string][]){
    ctx.beginPath();ctx.arc(px,py,7,0,Math.PI*2);
    ctx.fillStyle=col;ctx.shadowBlur=12;ctx.shadowColor=col;ctx.fill();ctx.shadowBlur=0;
  }
  // Labels
  ctx.font="9px Cinzel,serif";ctx.textAlign="center";
  ctx.fillStyle="rgba(200,150,255,0.8)";ctx.fillText("q₀",p0[0],p0[1]-12);
  ctx.fillStyle="rgba(240,190,100,0.8)";ctx.fillText("q₁",p1[0],p1[1]-12);
  ctx.fillStyle="rgba(255,100,60,0.7)";ctx.fillText("LERP",lerp_x+14,lerp_y-4);
  ctx.fillStyle="rgba(80,220,180,0.9)";ctx.fillText("SLERP",slerp_x+14,slerp_y-4);
  // Axis indicator
  ctx.fillStyle="rgba(100,150,255,0.3)";ctx.font="8px monospace";ctx.textAlign="left";
  ctx.fillText("S³ → S¹ projection",8,H-8);
}

// ═══════════════════════════════════════════════════════════════════════════════
function QuaternionsHeaderCanvas() {
  const ref = useRef<HTMLCanvasElement>(null);
  const rafRef = useRef(0);
  useEffect(() => {
    const canvas = ref.current; if (!canvas) return;
    const ctx = canvas.getContext("2d")!;
    canvas.width = 900; canvas.height = 145;
    const W = canvas.width, H = canvas.height;
    const cx=W/2,cy=H/2;
    let t=0;
    const axes=[{col:"#ff4477",label:"i"},{col:"#2ef0d8",label:"j"},{col:"#c9a84c",label:"k"}];
    const draw=()=>{
      ctx.fillStyle="rgba(2,4,8,0.3)"; ctx.fillRect(0,0,W,H);
      axes.forEach((ax,i)=>{
        const angle=i/3*Math.PI*2+t*0.02;
        const r=55;
        const x=cx+Math.cos(angle)*r,y=cy+Math.sin(angle)*r*0.5;
        ctx.beginPath();ctx.moveTo(cx,cy);ctx.lineTo(x,y);ctx.strokeStyle=ax.col+"88";ctx.lineWidth=1.5;ctx.stroke();
        ctx.beginPath();ctx.arc(x,y,6,0,Math.PI*2);ctx.fillStyle=ax.col+"33";ctx.fill();ctx.strokeStyle=ax.col+"aa";ctx.lineWidth=0.8;ctx.stroke();
        ctx.fillStyle=ax.col;ctx.font="bold 9px 'DM Mono',monospace";ctx.textAlign="center";ctx.fillText(ax.label,x,y+3);ctx.textAlign="left";
      });
      for(let ring=1;ring<=3;ring++){
        ctx.beginPath();ctx.arc(cx,cy,ring*18,0,Math.PI*2);ctx.strokeStyle=`rgba(153,102,255,${0.04+ring*0.03})`;ctx.lineWidth=0.5;ctx.stroke();
      }
      ctx.fillStyle="rgba(153,102,255,0.3)"; ctx.font="9px 'DM Mono',monospace";
      ctx.fillText("QUATERNIONS · i · j · k · 4D ROTATION · AETHER",14,14);
      t++; rafRef.current=requestAnimationFrame(draw);
    };
    draw();
    return ()=>cancelAnimationFrame(rafRef.current);
  },[]);
  return <canvas ref={ref} style={{width:"100%",height:"auto",borderRadius:8,display:"block"}} />;
}

export default function QuaternionsPage() {
  const [tab, setTab] = useState<"burst"|"gimbal"|"algebra"|"slerp">("burst");

  // ── Gimbal state ─────────────────────────────────────────────────────────────
  const [roll,  setRoll]  = useState(0.3);
  const [pitch, setPitch] = useState(0.0);
  const [yaw,   setYaw]   = useState(0.4);
  const [autoSpin, setAutoSpin] = useState(false);
  const autoRef = useRef(false);
  const tRef = useRef(0);
  const eulerRef  = useRef<HTMLCanvasElement>(null);
  const quatRef   = useRef<HTMLCanvasElement>(null);
  const slerpRef  = useRef<HTMLCanvasElement>(null);
  const slerpRafRef = useRef(0);
  const gimbalRafRef = useRef(0);

  // ── SLERP animation ───────────────────────────────────────────────────────
  const [slerpT, setSlerpT] = useState(0.5);
  const slerpAutoRef = useRef(false);
  const [slerpAuto, setSlerpAuto] = useState(false);

  useEffect(()=>{slerpAutoRef.current=slerpAuto;},[slerpAuto]);

  useEffect(()=>{
    const canvas=slerpRef.current;
    if(!canvas) return;
    const ctx=canvas.getContext("2d");
    if(!ctx) return;
    drawSlerpCanvas(ctx,canvas.width,canvas.height,slerpT);
  },[slerpT]);

  useEffect(()=>{
    if(!slerpAuto) return;
    let t=slerpT;
    let dir=1;
    const loop=()=>{
      if(!slerpAutoRef.current) return;
      t+=0.004*dir;
      if(t>=1){t=1;dir=-1;}
      if(t<=0){t=0;dir=1;}
      setSlerpT(t);
      slerpRafRef.current=requestAnimationFrame(loop);
    };
    slerpRafRef.current=requestAnimationFrame(loop);
    return ()=>cancelAnimationFrame(slerpRafRef.current);
  },[slerpAuto]);

  // ── Gimbal draw loop ──────────────────────────────────────────────────────
  const drawGimbal = useCallback(()=>{
    const locked = Math.abs(pitch - Math.PI/2) < 0.08;
    // Euler rotation
    const euler=eulerRef.current;
    if(euler){
      const ctx=euler.getContext("2d");
      if(ctx){
        const m=eulerMat(roll,pitch,yaw);
        drawFrame(ctx,euler.width,euler.height,v=>matV(m,v),locked,"EULER (ZYX)");
      }
    }
    // Quaternion rotation
    const qcanv=quatRef.current;
    if(qcanv){
      const ctx=qcanv.getContext("2d");
      if(ctx){
        const qR=qFromAxis(1,0,0,roll);
        const qP=qFromAxis(0,1,0,pitch);
        const qY=qFromAxis(0,0,1,yaw);
        const q=qNorm(qMul(qMul(qY,qP),qR));
        drawFrame(ctx,qcanv.width,qcanv.height,v=>qRotV(q,v),false,"QUATERNION (SLERP-ready)");
      }
    }
  },[roll,pitch,yaw]);

  useEffect(()=>{ drawGimbal(); },[drawGimbal]);

  useEffect(()=>{
    autoRef.current=autoSpin;
    if(!autoSpin) return;
    const loop=()=>{
      if(!autoRef.current) return;
      tRef.current+=0.02;
      const p=Math.sin(tRef.current*0.7)*(Math.PI/2)*0.99;
      const y=tRef.current*0.5;
      const r=Math.sin(tRef.current*0.4)*0.8;
      setPitch(p); setYaw(y); setRoll(r);
      gimbalRafRef.current=requestAnimationFrame(loop);
    };
    gimbalRafRef.current=requestAnimationFrame(loop);
    return ()=>cancelAnimationFrame(gimbalRafRef.current);
  },[autoSpin]);

  // ── Algebra tab ──────────────────────────────────────────────────────────
  const UNITS = ["1","i","j","k"];
  const multTable: (string|number)[][] = [
    ["1","1","i","j","k"],
    ["i","i","-1","k","-j"],
    ["j","j","-k","-1","i"],
    ["k","k","j","-i","-1"],
  ];
  const [selA,setSelA]=useState(1);
  const [selB,setSelB]=useState(2);
  const productCell = multTable[selA-1]?.[selB] ?? "?";
  const productExplain: Record<string,string> = {
    "i":"i", "-1":"−1 (imaginary² = negative reality)",
    "k":"k", "-j":"−j", "j":"j", "-k":"−k",
    "-i":"−i", "1":"1 (identity)", "-1":"−1"
  };

  return (
    <div className="min-h-screen text-white font-['Raleway',sans-serif] pb-10" style={{background:"#030514"}}>
      <div style={{flexShrink:0}}>
        <div style={{padding:"8px 12px"}}><div style={{display:"inline-block",border:"1px solid #9966ff",padding:"4px 12px",fontSize:10,letterSpacing:"0.2em",color:"#9966ff",fontFamily:"'DM Mono',monospace",marginBottom:16}}>LIVE SIMULATION</div></div>
        <div style={{margin:"0 12px 20px",background:"rgba(2,4,8,0.8)",borderLeft:"3px solid #9966ff",borderRadius:4,overflow:"hidden"}}>
          <div style={{padding:"12px 16px 8px"}}><h2 style={{margin:0,fontSize:13,color:"#9966ff",fontFamily:"'DM Mono',monospace",letterSpacing:"0.15em",fontWeight:400}}>QUATERNIONS · i · j · k · 4D ROTATION · AETHER</h2><p style={{margin:"4px 0 8px",fontSize:10,color:"rgba(153,102,255,0.5)",fontFamily:"'DM Mono',monospace",letterSpacing:"0.1em"}}>3 rotating quaternion axes — the live AETHER quaternion simulation.</p></div>
          <QuaternionsHeaderCanvas />
        </div>
      </div>
      {/* Header */}
      <div className="border-b border-purple-900/40 px-6 py-4 sticky top-0 z-20" style={{background:"#030514ee"}}>
        <p className="text-[10px] tracking-[0.3em] text-purple-400/50 font-['Cinzel',serif] mb-0.5">
          SYSTEM · MATHEMATICS · DIMENSIONAL ALGEBRA
        </p>
        <h1 className="text-2xl font-['Cinzel',serif] tracking-widest text-purple-100">
          QUATERNION BURST · 4-DIMENSIONAL NUMBER ALGEBRA
        </h1>
        <p className="text-xs text-purple-300/40 mt-0.5">
          Why numbers explode beyond 1D and 2D · Gimbal Lock Solved · Hamilton's Discovery
        </p>
        <div className="flex gap-5 mt-2 flex-wrap">
          {[
            {label:"ℝ REAL",   value:"1D", sub:"scalar only",       col:"#60a5fa"},
            {label:"ℂ COMPLEX",value:"2D", sub:"+ imaginary axis",  col:"#a78bfa"},
            {label:"ℍ HAMILTON",value:"4D",sub:"+ j, k axes (BURST)",col:"#f2bf65"},
            {label:"i²=j²=k²",value:"−1", sub:"= ijk (fundamental)",col:"#2dd4bf"},
            {label:"NO GIMBAL",value:"✓",  sub:"locked → solved",    col:"#4ade80"},
          ].map(m=>(
            <div key={m.label} className="flex items-center gap-1.5">
              <div className="w-1.5 h-1.5 rounded-full" style={{background:m.col}}/>
              <span className="text-[9px] text-purple-400/50">{m.label}</span>
              <span className="text-[10px] font-['Cinzel',serif]" style={{color:m.col}}>{m.value}</span>
              <span className="text-[8px] text-purple-600/40">{m.sub}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-purple-900/30 px-6" style={{background:"#07021a99"}}>
        {([
          ["burst","THE BURST"],["gimbal","GIMBAL LOCK"],["algebra","ALGEBRA"],["slerp","SLERP"]
        ] as const).map(([key,label])=>(
          <button key={key} onClick={()=>setTab(key)}
            className={`px-5 py-2.5 text-[11px] tracking-widest font-['Cinzel',serif] border-b-2 transition-all ${
              tab===key?"border-purple-500 text-purple-300":"border-transparent text-purple-600/50 hover:text-purple-400"}`}>
            {label}
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait">

        {/* ════ THE BURST ════ */}
        {tab==="burst" && (
          <motion.div key="burst" initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} className="p-5 flex gap-5">
            {/* Number tower */}
            <div className="flex flex-col gap-4 w-80 shrink-0">
              {[
                {
                  sys:"ℝ  REAL", dim:"1D", comp:"a", ex:"3.14159…",
                  col:"#60a5fa", note:"A point on a number line. Addition: slide left/right. Multiplication: scale. One degree of freedom.",
                  ops:"a + b · c − d ÷",
                  svg: (
                    <svg viewBox="0 0 180 40" className="w-full">
                      <line x1={10} y1={20} x2={170} y2={20} stroke="#60a5fa" strokeWidth={1.5} opacity={0.4}/>
                      {[0.2,0.4,0.6,0.8].map((t,i)=>(
                        <line key={i} x1={10+t*160} y1={14} x2={10+t*160} y2={26} stroke="#60a5fa" strokeWidth={1} opacity={0.3}/>
                      ))}
                      <circle cx={112} cy={20} r={5} fill="#60a5fa" className="filter drop-shadow"/>
                      <text x={112} y={36} textAnchor="middle" fontSize={8} fill="#60a5fa" opacity={0.7}>a</text>
                    </svg>
                  )
                },
                {
                  sys:"ℂ  COMPLEX", dim:"2D", comp:"a + bi", ex:"3 + 4i",
                  col:"#a78bfa", note:"A point on a plane. Multiplication = rotation + scaling in 2D. One imaginary axis i where i² = −1. Handles 2D rotations natively.",
                  ops:"(a+bi)(c+di) = (ac−bd) + (ad+bc)i",
                  svg: (
                    <svg viewBox="0 0 180 80" className="w-full">
                      <line x1={10} y1={40} x2={170} y2={40} stroke="#a78bfa" strokeWidth={1} opacity={0.3}/>
                      <line x1={90} y1={5}  x2={90}  y2={75} stroke="#a78bfa" strokeWidth={1} opacity={0.3}/>
                      <text x={168} y={44} fontSize={7} fill="#a78bfa" opacity={0.5}>ℝ</text>
                      <text x={92}  y={10} fontSize={7} fill="#a78bfa" opacity={0.5}>ℑ</text>
                      <line x1={90} y1={40} x2={140} y2={18} stroke="#a78bfa" strokeWidth={1.5} opacity={0.7}/>
                      <circle cx={140} cy={18} r={5} fill="#a78bfa"/>
                      <text x={146} y={16} fontSize={7} fill="#a78bfa" opacity={0.8}>a+bi</text>
                    </svg>
                  )
                },
                {
                  sys:"ℍ  QUATERNION", dim:"4D ⚡", comp:"w + xi + yj + zk", ex:"0 + 0i + 0j + 1k",
                  col:"#f2bf65", note:"A point in 4-dimensional hyperspace. Three imaginary axes: i, j, k. Multiplication = rotation in 3D. No gimbal lock. Used in spacecraft, robotics, 3D engines.",
                  ops:"i²=j²=k²=ijk=−1",
                  svg: (
                    <svg viewBox="0 0 180 90" className="w-full">
                      {/* Tesseract projection hint */}
                      {[[[30,45],[150,45]],[[90,10],[90,80]],[[50,20],[130,70]],[[130,20],[50,70]]].map(([[x1,y1],[x2,y2]],i)=>(
                        <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke="#f2bf65" strokeWidth={0.7} opacity={0.18}/>
                      ))}
                      {[[90,45],[140,22],[60,68],[140,68],[40,22]].map(([cx,cy],i)=>(
                        <circle key={i} cx={cx} cy={cy} r={i===0?7:3.5} fill="#f2bf65" opacity={i===0?0.9:0.4}/>
                      ))}
                      <text x={90} y={49} textAnchor="middle" fontSize={7} fill="#030514" fontWeight="bold">w</text>
                      {[["i",140,18],["j",60,64],["k",142,72],["w₀",36,19]].map(([l,x,y])=>(
                        <text key={String(l)} x={Number(x)} y={Number(y)} textAnchor="middle" fontSize={7} fill="#f2bf65" opacity={0.65}>{l}</text>
                      ))}
                    </svg>
                  )
                },
              ].map((item,idx)=>(
                <motion.div key={item.sys}
                  initial={{opacity:0,x:-20}} animate={{opacity:1,x:0}} transition={{delay:idx*0.1}}
                  className="border rounded-xl p-4 flex flex-col gap-2"
                  style={{borderColor:item.col+"35",background:item.col+"08"}}>
                  <div className="flex items-baseline justify-between">
                    <span className="text-sm font-['Cinzel',serif]" style={{color:item.col}}>{item.sys}</span>
                    <span className="text-xs font-['Cinzel',serif]" style={{color:item.col+"99"}}>{item.dim}</span>
                  </div>
                  {item.svg}
                  <div className="text-[10px] font-mono mt-1" style={{color:item.col+"cc"}}>
                    q = {item.comp}
                  </div>
                  <div className="text-[9px] text-purple-400/50 leading-4">{item.note}</div>
                  <div className="text-[9px] font-mono text-purple-600/40 leading-4 border-t border-purple-900/20 pt-1 mt-0.5">{item.ops}</div>
                </motion.div>
              ))}
            </div>

            {/* Right: the burst explanation */}
            <div className="flex-1 flex flex-col gap-4">
              <div className="border border-yellow-900/30 rounded-xl p-5" style={{background:"#07021a80"}}>
                <p className="text-[10px] tracking-widest font-['Cinzel',serif] text-yellow-400/60 mb-3">THE BURST</p>
                <p className="text-sm text-yellow-100/80 leading-6">
                  In standard real or complex equations, numbers are limited to 1D or 2D spaces. Quaternions <strong className="text-yellow-300">burst</strong> this by embedding 4D structure directly into the algebra — each "number" in an equation carries multidimensional information.
                </p>
                <p className="text-xs text-yellow-300/50 leading-5 mt-3">
                  Real numbers describe a line. Complex numbers describe a plane — the second dimension is created by declaring i² = −1, an axis that squares to negative one, impossible on the real line but algebraically consistent.
                </p>
                <p className="text-xs text-yellow-300/50 leading-5 mt-2">
                  Quaternions do this again, twice over. Hamilton introduces j and k — two more square roots of −1, each orthogonal to i and to each other in a 4D space. The constraint ijk = −1 binds them into a single coherent algebra.
                </p>
                <div className="mt-4 p-3 rounded-lg border border-yellow-900/30" style={{background:"#0a0610"}}>
                  <p className="text-[9px] text-yellow-600/50 mb-1 font-['Cinzel',serif]">HAMILTON'S CARVING · BROOME BRIDGE, DUBLIN · 1843</p>
                  <p className="text-base font-mono text-yellow-300/80 tracking-wider text-center py-2">
                    i² = j² = k² = ijk = −1
                  </p>
                  <p className="text-[9px] text-yellow-700/40 text-center">Sir William Rowan Hamilton, October 16, 1843</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                {[
                  {title:"WHY 4D AND NOT 3D?",col:"#a78bfa",text:"Mathematicians proved (Frobenius theorem, 1877) that the only normed division algebras over ℝ are: ℝ (1D), ℂ (2D), ℍ (4D), and 𝕆 octonions (8D). You cannot build a consistent multiplication algebra in 3D. The jump from 2D to 4D is not arbitrary — it is a mathematical necessity."},
                  {title:"UNIT QUATERNION = ROTATION",col:"#2dd4bf",text:"Every unit quaternion (|q|=1) encodes a 3D rotation: the vector part (xi+yj+zk) is the rotation axis, the scalar part w = cos(θ/2) encodes half the rotation angle. Two quaternions compose rotations by multiplication — in one operation, no trigonometry required."},
                  {title:"DOUBLE COVER OF SO(3)",col:"#f2bf65",text:"q and −q represent the same 3D rotation. The quaternion sphere S³ is a double cover of rotation space SO(3). This means every rotation corresponds to exactly two antipodal quaternions — a feature that SLERP exploits to always find the shorter path between orientations."},
                  {title:"AETHER CONNECTION",col:"#c084fc",text:"The 4-layer AETHER architecture (Mnēsis/Infernia/Aletheia/Reverie) is structurally isomorphic to quaternion space: each layer is an independent basis vector (1, i, j, k). The Coherence Bus scalar Ψ is the w-component — the real part that binds the imaginary dimensions into a single coherent number."},
                ].map(c=>(
                  <div key={c.title} className="border rounded-xl p-4" style={{borderColor:c.col+"25",background:c.col+"07"}}>
                    <p className="text-[9px] font-['Cinzel',serif] tracking-wider mb-2" style={{color:c.col}}>{c.title}</p>
                    <p className="text-[9px] text-purple-300/55 leading-4">{c.text}</p>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        )}

        {/* ════ GIMBAL LOCK ════ */}
        {tab==="gimbal" && (
          <motion.div key="gimbal" initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} className="p-5 flex gap-5">

            {/* Controls */}
            <div className="w-60 shrink-0 flex flex-col gap-3">
              <div className="border border-purple-900/40 rounded-xl p-4" style={{background:"#07021a80"}}>
                <p className="text-[9px] tracking-widest font-['Cinzel',serif] text-purple-400/60 mb-3">ROTATION CONTROLS</p>
                {[
                  {label:"PITCH (Y)", val:pitch, set:setPitch, col:"#50ff80"},
                  {label:"YAW (Z)",   val:yaw,   set:setYaw,   col:"#ff5050"},
                  {label:"ROLL (X)",  val:roll,  set:setRoll,  col:"#5090ff"},
                ].map(s=>(
                  <div key={s.label} className="mb-3">
                    <div className="flex justify-between mb-1">
                      <span className="text-[9px]" style={{color:s.col+"99"}}>{s.label}</span>
                      <span className="text-[9px] font-mono" style={{color:s.col}}>
                        {(s.val*180/Math.PI).toFixed(1)}°
                      </span>
                    </div>
                    <input type="range" min={-Math.PI} max={Math.PI} step={0.02} value={s.val}
                      onChange={e=>s.set(+e.target.value)}
                      className="w-full h-1" style={{accentColor:s.col}}/>
                  </div>
                ))}
                <button onClick={()=>setPitch(Math.PI/2-0.02)}
                  className="w-full py-1.5 text-[9px] font-['Cinzel',serif] rounded border border-red-700/40 text-red-400/70 hover:text-red-300 mb-1">
                  SET PITCH = 90° (LOCK)
                </button>
                <button onClick={()=>{setPitch(0);setYaw(0);setRoll(0);}}
                  className="w-full py-1.5 text-[9px] font-['Cinzel',serif] rounded border border-purple-900/30 text-purple-600/50 hover:text-purple-400">
                  RESET
                </button>
              </div>
              <button onClick={()=>setAutoSpin(b=>!b)}
                className={`py-2 rounded-xl text-[9px] font-['Cinzel',serif] tracking-widest border transition-all ${
                  autoSpin?"border-yellow-500/50 text-yellow-400":"border-purple-900/40 text-purple-600/50"}`}>
                {autoSpin?"⏸ STOP ANIMATION":"▶ ANIMATE (SHOW LOCK)"}
              </button>
              <div className={`border rounded-xl p-3 text-[9px] leading-4 transition-all ${
                Math.abs(pitch-Math.PI/2)<0.08?"border-red-700/40 text-red-300/70 bg-red-900/10":"border-purple-900/30 text-purple-500/40"}`}>
                {Math.abs(pitch-Math.PI/2)<0.08
                  ? "⚠ GIMBAL LOCK ACTIVE\n\nRoll and Yaw now share the same axis of freedom. One degree of rotation is lost.\n\nNotice the Euler cube's axes (red/green) collapse into the same plane."
                  : "Set pitch to 90° to trigger gimbal lock. Watch the Euler representation lose an axis — then compare with the quaternion side (right)."}
              </div>
              <div className="border border-teal-900/30 rounded-xl p-3" style={{background:"#07021a60"}}>
                <p className="text-[9px] font-['Cinzel',serif] text-teal-400/60 mb-1.5">QUATERNION SOLUTION</p>
                <p className="text-[9px] text-teal-300/50 leading-4">
                  A unit quaternion stores orientation as a point on S³ (the 4D hypersphere). S³ has no poles — every orientation is equally representable. No configuration is singular.
                </p>
              </div>
            </div>

            {/* Canvases */}
            <div className="flex-1 flex flex-col gap-3">
              <div className="grid grid-cols-2 gap-4">
                <div className="border border-purple-900/30 rounded-xl overflow-hidden">
                  <canvas ref={eulerRef} width={340} height={260} className="w-full"/>
                </div>
                <div className="border border-teal-900/30 rounded-xl overflow-hidden">
                  <canvas ref={quatRef} width={340} height={260} className="w-full"/>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="border border-red-900/30 rounded-xl p-4" style={{background:"#0a020280"}}>
                  <p className="text-[9px] font-['Cinzel',serif] text-red-400/60 mb-1.5">EULER ANGLES (ZYX)</p>
                  <p className="text-[9px] text-red-300/50 leading-4">
                    Three sequential rotations: Rz·Ry·Rx. When Ry = ±90°, the first and third rotation axes become parallel — one degree of freedom collapses. The system can no longer independently control all three orientations.
                  </p>
                  <div className="mt-2 font-mono text-[9px] text-red-600/40">
                    R = Rz(ψ) · Ry(θ) · Rx(φ)
                  </div>
                </div>
                <div className="border border-teal-900/30 rounded-xl p-4" style={{background:"#00100a80"}}>
                  <p className="text-[9px] font-['Cinzel',serif] text-teal-400/60 mb-1.5">QUATERNION ROTATION</p>
                  <p className="text-[9px] text-teal-300/50 leading-4">
                    q = qY · qP · qR. All three axes remain linearly independent at every orientation — including pitch = 90°. No configuration is degenerate because 4D algebra has no poles.
                  </p>
                  <div className="mt-2 font-mono text-[9px] text-teal-600/40">
                    v' = q · v · q⁻¹  (sandwich product)
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* ════ ALGEBRA ════ */}
        {tab==="algebra" && (
          <motion.div key="algebra" initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} className="p-5 flex gap-5">

            {/* Multiplication table */}
            <div className="flex flex-col gap-4 w-80 shrink-0">
              <div className="border border-purple-900/40 rounded-xl p-5" style={{background:"#07021a80"}}>
                <p className="text-[9px] tracking-widest font-['Cinzel',serif] text-purple-400/60 mb-3">MULTIPLICATION TABLE</p>
                <table className="w-full text-center">
                  <thead>
                    <tr>
                      <th className="w-8 h-8 text-[9px] text-purple-600/40 font-['Cinzel',serif]">×</th>
                      {UNITS.map(u=>(
                        <th key={u} className="w-12 h-8 text-[10px] font-['Cinzel',serif] text-purple-300/70">{u}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {UNITS.map((row,ri)=>(
                      <tr key={row}>
                        <td className="text-[10px] font-['Cinzel',serif] text-purple-300/70">{row}</td>
                        {UNITS.map((_,ci)=>{
                          const val=multTable[ri]?.[ci+1] ?? "?";
                          const isSelected=(ri===selA-1&&ci===selB-1)||(ri===selB-1&&ci===selA-1);
                          const isDiag=ri===ci;
                          return (
                            <td key={ci}
                              onClick={()=>{setSelA(ri+1);setSelB(ci+1);}}
                              className={`h-10 text-[11px] font-['Cinzel',serif] cursor-pointer rounded transition-all ${
                                isSelected?"bg-yellow-900/30":"hover:bg-purple-900/20"
                              } ${isDiag?"text-red-400/80":val==="1"?"text-teal-400/80":"text-purple-300/80"}`}>
                              {String(val)}
                            </td>
                          );
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
                <p className="text-[8px] text-purple-600/30 mt-2">click cells to inspect</p>
              </div>

              {/* Selected product */}
              <div className="border border-yellow-900/30 rounded-xl p-4" style={{background:"#0a060080"}}>
                <p className="text-[9px] text-yellow-600/50 font-['Cinzel',serif] mb-1.5">SELECTED PRODUCT</p>
                <div className="text-xl font-['Cinzel',serif] text-yellow-300 text-center py-2">
                  {UNITS[selA-1]} · {UNITS[selB-1]} = {String(multTable[selA-1]?.[selB] ?? "?")}
                </div>
                <p className="text-[9px] text-yellow-700/50 text-center leading-4">
                  {productExplain[String(multTable[selA-1]?.[selB] ?? "?")]||String(multTable[selA-1]?.[selB] ?? "?")}
                </p>
              </div>

              {/* Core identity */}
              <div className="border border-teal-900/30 rounded-xl p-4" style={{background:"#001a1480"}}>
                <p className="text-[9px] font-['Cinzel',serif] text-teal-400/60 mb-2">FUNDAMENTAL IDENTITY</p>
                <p className="text-base font-mono text-teal-200/80 text-center py-1">i² = j² = k²</p>
                <p className="text-base font-mono text-teal-200/80 text-center py-1">= ijk = −1</p>
                <p className="text-[9px] text-teal-600/40 text-center mt-1 leading-4">
                  Anti-commutative: ij = k but ji = −k<br/>
                  The order of multiplication matters.
                </p>
              </div>
            </div>

            {/* Right: component view + addition/multiplication */}
            <div className="flex-1 flex flex-col gap-4">
              <div className="border border-purple-900/40 rounded-xl p-5" style={{background:"#07021a80"}}>
                <p className="text-[9px] tracking-widest font-['Cinzel',serif] text-purple-400/60 mb-3">COMPONENT BREAKDOWN</p>
                <div className="grid grid-cols-4 gap-3">
                  {[
                    {comp:"w",desc:"Scalar / Real",col:"#60a5fa",note:"cos(θ/2) for a rotation quaternion. The 'amount of identity.'"},
                    {comp:"x·i",desc:"First imaginary",col:"#a78bfa",note:"i² = −1. Encodes rotation component around X axis."},
                    {comp:"y·j",desc:"Second imaginary",col:"#f2bf65",note:"j² = −1. Encodes rotation component around Y axis. ij=k, ji=−k."},
                    {comp:"z·k",desc:"Third imaginary",col:"#2dd4bf",note:"k² = −1. Encodes rotation component around Z axis. jk=i, kj=−i."},
                  ].map(c=>(
                    <div key={c.comp} className="border rounded-xl p-3 text-center" style={{borderColor:c.col+"30",background:c.col+"07"}}>
                      <div className="text-2xl font-['Cinzel',serif] mb-1" style={{color:c.col}}>{c.comp}</div>
                      <div className="text-[9px] font-['Cinzel',serif] mb-1" style={{color:c.col+"99"}}>{c.desc}</div>
                      <div className="text-[8px] text-purple-500/40 leading-3">{c.note}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Worked example: rotation */}
              <div className="border border-yellow-900/30 rounded-xl p-5" style={{background:"#07060080"}}>
                <p className="text-[9px] tracking-widest font-['Cinzel',serif] text-yellow-400/60 mb-3">WORKED EXAMPLE: 90° ROTATION AROUND Y-AXIS</p>
                <div className="grid grid-cols-3 gap-4 text-[10px] font-mono">
                  <div className="border border-yellow-900/20 rounded-lg p-3">
                    <p className="text-[8px] text-yellow-600/50 mb-2">1. BUILD QUATERNION</p>
                    <p className="text-yellow-300/70 leading-5">
                      axis = (0, 1, 0)<br/>
                      θ = 90° = π/2<br/>
                      <br/>
                      w = cos(π/4) = √2/2<br/>
                      x = 0 · sin(π/4) = 0<br/>
                      y = 1 · sin(π/4) = √2/2<br/>
                      z = 0 · sin(π/4) = 0
                    </p>
                  </div>
                  <div className="border border-yellow-900/20 rounded-lg p-3">
                    <p className="text-[8px] text-yellow-600/50 mb-2">2. QUATERNION</p>
                    <p className="text-yellow-300/70 leading-5">
                      q = √2/2 + 0i<br/>
                      &nbsp;&nbsp;&nbsp;+ (√2/2)j + 0k<br/>
                      <br/>
                      Pure unit vector:<br/>
                      p = 0 + 1·i<br/>
                      &nbsp;&nbsp;&nbsp;+ 0·j + 0·k<br/>
                      (point [1,0,0])
                    </p>
                  </div>
                  <div className="border border-yellow-900/20 rounded-lg p-3">
                    <p className="text-[8px] text-yellow-600/50 mb-2">3. RESULT</p>
                    <p className="text-yellow-300/70 leading-5">
                      p' = q · p · q*<br/>
                      <br/>
                      = 0 + 0·i<br/>
                      &nbsp;&nbsp;&nbsp;+ 0·j + (−1)·k<br/>
                      <br/>
                      → point [0, 0, −1] ✓<br/>
                      (90° Y rotation)
                    </p>
                  </div>
                </div>
              </div>

              {/* Anti-commutativity */}
              <div className="border border-red-900/30 rounded-xl p-4" style={{background:"#07000280"}}>
                <p className="text-[9px] tracking-widest font-['Cinzel',serif] text-red-400/60 mb-2">ANTI-COMMUTATIVITY: ORDER MATTERS</p>
                <div className="flex gap-6 text-[10px] font-mono">
                  <div>
                    <span className="text-red-300/70">i · j = k</span>
                    <span className="text-purple-600/30 mx-2">but</span>
                    <span className="text-red-300/70">j · i = −k</span>
                  </div>
                  <div>
                    <span className="text-red-300/70">j · k = i</span>
                    <span className="text-purple-600/30 mx-2">but</span>
                    <span className="text-red-300/70">k · j = −i</span>
                  </div>
                </div>
                <p className="text-[9px] text-red-600/40 mt-2 leading-4">
                  Rotating X then Y ≠ rotating Y then X. This is the algebraic reflection of physical reality: rotations in 3D space do not commute.
                </p>
              </div>
            </div>
          </motion.div>
        )}

        {/* ════ SLERP ════ */}
        {tab==="slerp" && (
          <motion.div key="slerp" initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} className="p-5 flex gap-5">

            <div className="w-60 shrink-0 flex flex-col gap-3">
              <div className="border border-purple-900/40 rounded-xl p-4" style={{background:"#07021a80"}}>
                <p className="text-[9px] tracking-widest font-['Cinzel',serif] text-purple-400/60 mb-2">SLERP — SPHERICAL LINEAR INTERPOLATION</p>
                <p className="text-[9px] text-purple-300/60 leading-4">
                  Standard linear interpolation (LERP) between two quaternions drifts off the unit sphere S³ — the result is no longer a valid rotation.
                </p>
                <p className="text-[9px] text-teal-300/50 leading-4 mt-2">
                  SLERP travels along the great arc of S³ — always staying on the sphere, always producing a valid rotation, always following the shortest angular path.
                </p>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[9px] text-purple-400/50 font-['Cinzel',serif]">t</span>
                <input type="range" min={0} max={1} step={0.01} value={slerpT}
                  onChange={e=>{setSlerpT(+e.target.value);setSlerpAuto(false);}}
                  className="flex-1 h-1 accent-teal-400"/>
                <span className="text-[9px] font-mono text-teal-300/60 w-8">{slerpT.toFixed(2)}</span>
              </div>
              <button onClick={()=>setSlerpAuto(b=>!b)}
                className={`py-2 rounded-xl text-[9px] font-['Cinzel',serif] border transition-all ${
                  slerpAuto?"border-teal-500/50 text-teal-400":"border-purple-900/30 text-purple-600/50"}`}>
                {slerpAuto?"⏸ PAUSE":"▶ ANIMATE"}
              </button>
              <div className="border border-red-900/30 rounded-xl p-3" style={{background:"#07000280"}}>
                <div className="flex items-center gap-2 mb-1">
                  <div className="w-3 h-0.5 bg-red-500/60" style={{borderTop:"1px dashed"}}/>
                  <span className="text-[9px] text-red-400/60 font-['Cinzel',serif]">LERP (straight line)</span>
                </div>
                <p className="text-[9px] text-red-600/40 leading-3">Leaves S³. Not a valid rotation during transit. Distorts speed (non-constant angular velocity).</p>
              </div>
              <div className="border border-teal-900/30 rounded-xl p-3" style={{background:"#001a1480"}}>
                <div className="flex items-center gap-2 mb-1">
                  <div className="w-3 h-0.5 bg-teal-400/60"/>
                  <span className="text-[9px] text-teal-400/60 font-['Cinzel',serif]">SLERP (great arc)</span>
                </div>
                <p className="text-[9px] text-teal-600/40 leading-3">Stays on S³. Always valid. Constant angular velocity. Natural-looking motion.</p>
              </div>
              <div className="border border-purple-900/30 rounded-xl p-3 text-[9px] text-purple-500/40 leading-4 font-mono" style={{background:"#07021a60"}}>
                SLERP(q₀,q₁,t) =<br/>
                &nbsp;sin((1−t)Ω)/sin(Ω) · q₀<br/>
                &nbsp;+ sin(t·Ω)/sin(Ω) · q₁<br/>
                <br/>
                Ω = arccos(q₀·q₁)
              </div>
            </div>

            <div className="flex-1 flex flex-col gap-4">
              <div className="border border-purple-900/40 rounded-xl p-5" style={{background:"#07021a80"}}>
                <p className="text-[9px] tracking-widest font-['Cinzel',serif] text-purple-400/60 mb-3">
                  SLERP vs LERP — S³ PROJECTION
                </p>
                <canvas ref={slerpRef} width={520} height={300} className="w-full rounded-xl"
                  style={{background:"#03080f"}}/>
              </div>
              <div className="grid grid-cols-3 gap-3">
                {[
                  {t:"ANIMATION",col:"#c084fc",txt:"SLERP produces constant-speed rotation between poses. Animation systems use it to blend keyframes smoothly — no speed spikes, no distortion."},
                  {t:"ROBOTICS",col:"#2dd4bf",txt:"Robot arms interpolate joint orientations. SLERP guarantees the arm never passes through an invalid configuration between waypoints."},
                  {t:"SPACECRAFT",col:"#f2bf65",txt:"Attitude control systems (Apollo, Voyager, modern CubeSats) use quaternion SLERP to compute minimum-rotation manoeuvres and avoid gimbal lock in critical moments."},
                ].map(c=>(
                  <div key={c.t} className="border rounded-xl p-3" style={{borderColor:c.col+"25",background:c.col+"07"}}>
                    <p className="text-[9px] font-['Cinzel',serif] mb-1.5" style={{color:c.col}}>{c.t}</p>
                    <p className="text-[9px] text-purple-400/50 leading-4">{c.txt}</p>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
