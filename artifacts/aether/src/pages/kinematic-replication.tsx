import { useState, useEffect, useRef } from "react";
import { Link } from "wouter";
import { Play, Pause, RotateCcw, Plus } from "lucide-react";

const BG="#04060d",PAN="#0a0d1a",PAN2="#0d1020",BORDER="#182038",TEXT="#b8cce8",MUTED="#5a6e8c";
const GOLD="#ffb830",CYAN="#3fd8d0",VIOLET="#a87aff",GREEN="#50d49a",BLUE="#4ab0ff";

function hexA(h:string,a:number){const n=h.replace("#","");return `rgba(${parseInt(n.slice(0,2),16)},${parseInt(n.slice(2,4),16)},${parseInt(n.slice(4,6),16)},${a})`;}

type Cell={x:number;y:number;vx:number;vy:number};
type Bot={x:number;y:number;a:number;va:number;captured:number};
type Offspring={x:number;y:number;grow:number};

// ── live kinematic replication chamber ───────────────────────────────────────
function ReplicationSim({
  playing, force, density, parentCount, resetKey, feedKey,
  onStats,
}:{
  playing:boolean; force:number; density:number; parentCount:number;
  resetKey:number; feedKey:number;
  onStats:(s:{gen:number;offspring:number;cells:number})=>void;
}){
  const cvRef=useRef<HTMLCanvasElement|null>(null);
  const playRef=useRef(playing);
  const forceRef=useRef(force);
  const densRef=useRef(density);
  const countRef=useRef(parentCount);
  const cellsRef=useRef<Cell[]>([]);
  const botsRef=useRef<Bot[]>([]);
  const offRef=useRef<Offspring[]>([]);
  const genRef=useRef(1);
  const totalOffRef=useRef(0);
  const feedPrev=useRef(feedKey);
  const reducedRef=useRef(false);
  const lastStatsRef=useRef("");

  useEffect(()=>{playRef.current=playing;},[playing]);
  useEffect(()=>{forceRef.current=force;},[force]);
  useEffect(()=>{densRef.current=density;},[density]);

  const spawnCells=(n:number,w:number,h:number)=>{
    for(let i=0;i<n;i++){
      cellsRef.current.push({x:Math.random()*w,y:Math.random()*h,vx:0,vy:0});
    }
  };

  const initBots=(w:number,h:number)=>{
    const c=countRef.current;
    botsRef.current=[];
    for(let i=0;i<c;i++){
      const a=(i/c)*Math.PI*2;
      botsRef.current.push({
        x:w/2+Math.cos(a)*w*0.22, y:h/2+Math.sin(a)*h*0.22,
        a:Math.random()*Math.PI*2, va:0, captured:0,
      });
    }
  };

  // full reset when count or resetKey changes
  useEffect(()=>{
    countRef.current=parentCount;
    const cv=cvRef.current; if(!cv) return;
    const w=cv.clientWidth||640, h=400;
    cellsRef.current=[];
    offRef.current=[];
    genRef.current=1;
    totalOffRef.current=0;
    spawnCells(Math.round(densRef.current),w,h);
    initBots(w,h);
    onStats({gen:1,offspring:0,cells:cellsRef.current.length});
  },[resetKey,parentCount]);

  // add feedstock
  useEffect(()=>{
    if(feedKey===feedPrev.current) return;
    feedPrev.current=feedKey;
    const cv=cvRef.current; if(!cv) return;
    const w=cv.clientWidth||640, h=400;
    spawnCells(60,w,h);
  },[feedKey]);

  useEffect(()=>{
    const cv=cvRef.current; if(!cv) return;
    const ctx=cv.getContext("2d"); if(!ctx) return;
    reducedRef.current=window.matchMedia&&window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let raf=0, lastW=0, frame=0;

    // seed if empty
    if(cellsRef.current.length===0 && botsRef.current.length===0){
      const w=cv.clientWidth||640, h=400;
      spawnCells(Math.round(densRef.current),w,h);
      initBots(w,h);
    }

    const drawBot=(b:Bot,w:number,h:number)=>{
      ctx.save();
      ctx.translate(b.x,b.y); ctx.rotate(b.a);
      // C-shaped / Pac-Man parent body
      ctx.beginPath();
      ctx.arc(0,0,20,0.6,Math.PI*2-0.6,false);
      ctx.lineTo(0,0);
      ctx.closePath();
      const g=ctx.createRadialGradient(0,0,2,0,0,22);
      g.addColorStop(0,hexA("#ff8a6a",0.95));
      g.addColorStop(1,hexA("#d43a3a",0.9));
      ctx.fillStyle=g; ctx.fill();
      ctx.strokeStyle=hexA(GOLD,0.5); ctx.lineWidth=1.4; ctx.stroke();
      // cilia hairs around rim
      ctx.strokeStyle=hexA("#ffd0b0",0.5); ctx.lineWidth=1;
      for(let k=0;k<18;k++){
        const ca=0.6+(k/17)*(Math.PI*2-1.2);
        const wob=reducedRef.current?0:Math.sin(frame*0.15+k)*2;
        ctx.beginPath();
        ctx.moveTo(Math.cos(ca)*20,Math.sin(ca)*20);
        ctx.lineTo(Math.cos(ca)*(26+wob),Math.sin(ca)*(26+wob));
        ctx.stroke();
      }
      ctx.restore();
      // capture progress ring
      if(b.captured>0){
        ctx.beginPath(); ctx.arc(b.x,b.y,25,0,Math.PI*2*Math.min(1,b.captured/CAPTURE));
        ctx.strokeStyle=hexA(GREEN,0.7); ctx.lineWidth=2.5; ctx.stroke();
      }
    };

    const CAPTURE=14;

    const loop=()=>{
      const dpr=Math.min(2,window.devicePixelRatio||1);
      const w=cv.clientWidth||640, h=400;
      if(w!==lastW){ cv.width=Math.round(w*dpr); cv.height=Math.round(h*dpr); lastW=w; }
      ctx.setTransform(dpr,0,0,dpr,0,0);

      ctx.fillStyle="#02030a"; ctx.fillRect(0,0,w,h);
      // medium tint
      const bg=ctx.createRadialGradient(w/2,h/2,0,w/2,h/2,Math.max(w,h)*0.6);
      bg.addColorStop(0,hexA(BLUE,0.05)); bg.addColorStop(1,"transparent");
      ctx.fillStyle=bg; ctx.fillRect(0,0,w,h);

      const active=playRef.current && !reducedRef.current;
      const F=forceRef.current;

      const cells=cellsRef.current, bots=botsRef.current, offs=offRef.current;

      // ── update bots ──
      if(active){
        for(const b of bots){
          // mouth position (in front of the C opening)
          const mx=b.x+Math.cos(b.a)*10, my=b.y+Math.sin(b.a)*10;
          // find nearest free cell to steer toward
          let best=-1, bd=1e9;
          for(let i=0;i<cells.length;i++){
            const dx=cells[i].x-b.x, dy=cells[i].y-b.y;
            const d=dx*dx+dy*dy;
            if(d<bd){bd=d;best=i;}
          }
          if(best>=0){
            const tgt=cells[best];
            const desired=Math.atan2(tgt.y-b.y,tgt.x-b.x);
            let da=desired-b.a;
            while(da>Math.PI)da-=Math.PI*2; while(da<-Math.PI)da+=Math.PI*2;
            b.va=da*0.06;
          }
          b.a+=b.va;
          const spd=0.4+F*0.9;
          b.x+=Math.cos(b.a)*spd; b.y+=Math.sin(b.a)*spd;
          // wall bounce
          if(b.x<24){b.x=24;b.a=Math.PI-b.a;} if(b.x>w-24){b.x=w-24;b.a=Math.PI-b.a;}
          if(b.y<24){b.y=24;b.a=-b.a;} if(b.y>h-24){b.y=h-24;b.a=-b.a;}

          // sweep/corral nearby cells toward mouth
          let inMouth=0;
          for(let i=cells.length-1;i>=0;i--){
            const c=cells[i];
            const dx=c.x-b.x, dy=c.y-b.y;
            const dist=Math.hypot(dx,dy);
            if(dist<46){
              // cilia drag toward mouth point
              const pull=(0.6+F*1.4)*(1-dist/46);
              c.vx+=(mx-c.x)*0.02*pull;
              c.vy+=(my-c.y)*0.02*pull;
              // count compacted cells near mouth
              if(Math.hypot(c.x-mx,c.y-my)<16) inMouth++;
            }
          }
          if(inMouth>=4){ b.captured+=1; } else { b.captured=Math.max(0,b.captured-0.4); }

          // offspring forms when enough cells compacted long enough
          if(b.captured>=CAPTURE){
            // consume the compacted cells
            let removed=0;
            for(let i=cells.length-1;i>=0 && removed<5;i--){
              if(Math.hypot(cells[i].x-mx,cells[i].y-my)<20){ cells.splice(i,1); removed++; }
            }
            if(removed>=4){
              offs.push({x:mx,y:my,grow:0});
              totalOffRef.current++;
            }
            b.captured=0;
          }
        }
      }

      // ── update loose cells ──
      for(const c of cells){
        c.x+=c.vx; c.y+=c.vy;
        c.vx*=0.86; c.vy*=0.86;
        if(!active){ c.vx*=0.9; c.vy*=0.9; }
        if(c.x<6){c.x=6;c.vx*=-0.5;} if(c.x>w-6){c.x=w-6;c.vx*=-0.5;}
        if(c.y<6){c.y=6;c.vy*=-0.5;} if(c.y>h-6){c.y=h-6;c.vy*=-0.5;}
      }

      // ── grow offspring → become new parent bots ──
      for(let i=offs.length-1;i>=0;i--){
        const o=offs[i];
        if(active) o.grow=Math.min(1,o.grow+0.012);
        // draw offspring
        const r=4+o.grow*10;
        ctx.beginPath(); ctx.arc(o.x,o.y,r+3,0,Math.PI*2);
        ctx.fillStyle=hexA(GREEN,0.2); ctx.fill();
        ctx.beginPath(); ctx.arc(o.x,o.y,r,0,Math.PI*2);
        ctx.fillStyle=hexA(GREEN,0.9); ctx.shadowBlur=10; ctx.shadowColor=GREEN; ctx.fill(); ctx.shadowBlur=0;
        if(o.grow>=1){
          // matured → becomes a new C-shaped parent, generation up
          bots.push({x:o.x,y:o.y,a:Math.random()*Math.PI*2,va:0,captured:0});
          offs.splice(i,1);
          genRef.current=Math.max(genRef.current, Math.min(6, 1+Math.floor(Math.log2(bots.length+1))));
        }
      }

      // ── draw loose stem cells (white spheres) ──
      for(const c of cells){
        ctx.beginPath(); ctx.arc(c.x,c.y,3.6,0,Math.PI*2);
        ctx.fillStyle=hexA("#eef4ff",0.9); ctx.fill();
        ctx.beginPath(); ctx.arc(c.x-1,c.y-1,1.2,0,Math.PI*2);
        ctx.fillStyle=hexA("#ffffff",0.9); ctx.fill();
      }

      // ── draw bots ──
      for(const b of bots) drawBot(b,w,h);

      if(active) frame++;

      // publish stats occasionally, and only when values actually change (avoids
      // per-frame React churn while paused / reduced-motion)
      if(active && frame%12===0){
        const key=genRef.current+"|"+totalOffRef.current+"|"+cells.length;
        if(key!==lastStatsRef.current){
          lastStatsRef.current=key;
          onStats({gen:genRef.current, offspring:totalOffRef.current, cells:cells.length});
        }
      }

      raf=requestAnimationFrame(loop);
    };
    raf=requestAnimationFrame(loop);
    return ()=>cancelAnimationFrame(raf);
  },[]);

  return <canvas ref={cvRef} style={{width:"100%",height:400,display:"block",borderRadius:12,border:`1px solid ${BORDER}`,background:"#02030a"}}/>;
}

// ── content data ─────────────────────────────────────────────────────────────
const XENO=[
  {t:"Parent Bots",d:"C-shaped / Pac-Man parents (false-colored red or beige) use cilia-driven motility to sweep and compress loose frog stem cells (white spheres) into piles inside their concave “mouth.”"},
  {t:"Self-Organization",d:"Over ~5 days the compressed cell clusters self-organize into functional offspring Xenobots (green spheres), which repeat the cycle whenever more feedstock cells remain available."},
  {t:"AI-Optimized Shape",d:"Evolutionary algorithms optimized the parent morphology for efficiency — enabling 4–5 generations in simulation-validated designs, far better than the original spheroid forms."},
];

const FLOW=[
  {t:"Substrate",c:BLUE,d:"Frog stem cells + physical interactions"},
  {t:"Signals",c:CYAN,d:"Mechanical contact, possible signaling"},
  {t:"Emergent Pattern",c:VIOLET,d:"Piling and self-organization"},
  {t:"New Subsystems",c:GREEN,d:"Functional coherent offspring"},
];

const ANTHRO=[
  {t:"Human Source",d:"Self-constructed from adult human tracheal (lung) cells — a human-compatible, purely biological platform."},
  {t:"Motile Clusters",d:"Spherical or irregular clusters with outward-projecting cilia that move in straight lines, circles, and wiggles."},
  {t:"Wound Healing",d:"Traverse scratched neuron layers in vitro and promote neuronal growth to bridge and close the gaps."},
  {t:"Uneven Cilia",d:"Cilia (yellow) distributed unevenly on the surface correlate with different motility patterns — no replication reported yet."},
];

const CUCA=[
  {t:"Bottom-Up Generation",c:GREEN,d:"Cellular substrate + kinematics generate replication and healing without any top-down genetic “blueprint” for the behavior."},
  {t:"Top-Down Stabilization",c:GOLD,d:"AI-designed morphology or future synthetic genetic circuits impose coherence goals (efficient replication, safe containment, therapeutic alignment), minimizing error E(t) relative to desired relational stability X*(t)."},
  {t:"Self-Replication Meta-Layer",c:VIOLET,d:"The kinematic process acts as the generative function G, autonomously creating new nodes and connections in the coherence network."},
  {t:"Controlled Breakdown",c:CYAN,d:"A natural ~10-day lifespan (energy depletion) or engineered kill-switches provide safe self-limitation — no uncontrolled persistence."},
];

export default function KinematicReplicationPage(){
  const [playing,setPlaying]=useState(true);
  const [force,setForce]=useState(0.6);
  const [density,setDensity]=useState(160);
  const [parents,setParents]=useState(4);
  const [resetKey,setResetKey]=useState(0);
  const [feedKey,setFeedKey]=useState(0);
  const [stats,setStats]=useState({gen:1,offspring:0,cells:160});

  const slider=(label:string,val:string,el:React.ReactNode)=>(
    <div style={{marginBottom:14}}>
      <div style={{display:"flex",justifyContent:"space-between",fontFamily:"monospace",fontSize:11,color:MUTED,marginBottom:6}}>
        <span style={{textTransform:"uppercase",letterSpacing:1}}>{label}</span><span style={{color:TEXT}}>{val}</span>
      </div>
      {el}
    </div>
  );

  const readout=(label:string,val:string|number,col:string)=>(
    <div style={{background:PAN2,border:`1px solid ${BORDER}`,borderRadius:10,padding:"10px 12px",textAlign:"center"}}>
      <div style={{fontSize:24,fontWeight:700,color:col}}>{val}</div>
      <div style={{fontFamily:"monospace",fontSize:10,color:MUTED,textTransform:"uppercase",letterSpacing:1,marginTop:2}}>{label}</div>
    </div>
  );

  return(
    <div style={{minHeight:"100vh",background:BG,color:TEXT,padding:"40px 20px 80px",fontFamily:"'Inter',system-ui,sans-serif"}}>
      <div style={{maxWidth:1040,margin:"0 auto"}}>
        <div style={{fontFamily:"monospace",fontSize:11,color:MUTED,letterSpacing:2,textTransform:"uppercase",marginBottom:8}}>AETHER · Biological Self-Replication</div>
        <h1 style={{fontSize:30,margin:"0 0 6px",fontWeight:700,background:`linear-gradient(90deg,${VIOLET},${CYAN},${BLUE})`,WebkitBackgroundClip:"text",backgroundClip:"text",color:"transparent"}}>
          Kinematic Self-Replication · Xenobots & Anthrobots
        </h1>
        <p style={{fontFamily:"monospace",fontSize:12,color:MUTED,margin:"0 0 24px",maxWidth:780,lineHeight:1.6}}>
          Living machines that reproduce without growing — sweeping loose stem cells into piles that self-organize into new coherent subsystems. The closest real-world purely-biological Closed Loop Coherence System.
        </p>

        {/* ── LIVE SIM ── */}
        <div style={{background:PAN,border:`1px solid ${BORDER}`,borderRadius:12,padding:18,marginBottom:24}}>
          <div style={{fontFamily:"monospace",fontSize:11,color:CYAN,marginBottom:14,textTransform:"uppercase",letterSpacing:1}}>Live Simulation · Kinematic Replication Chamber</div>
          <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(300px,1fr))",gap:16}}>
            <div>
              <ReplicationSim
                playing={playing} force={force} density={density} parentCount={parents}
                resetKey={resetKey} feedKey={feedKey} onStats={setStats}
              />
              <div style={{display:"flex",gap:14,marginTop:10,flexWrap:"wrap",fontFamily:"monospace",fontSize:11,color:MUTED}}>
                <span style={{display:"flex",alignItems:"center",gap:6}}><span style={{width:10,height:10,borderRadius:"50%",background:"#eef4ff"}}/>stem cell</span>
                <span style={{display:"flex",alignItems:"center",gap:6}}><span style={{width:10,height:10,borderRadius:"50%",background:"#d43a3a"}}/>parent bot</span>
                <span style={{display:"flex",alignItems:"center",gap:6}}><span style={{width:10,height:10,borderRadius:"50%",background:GREEN}}/>offspring</span>
              </div>
              <div style={{display:"flex",justifyContent:"center",gap:12,marginTop:14,flexWrap:"wrap"}}>
                <button onClick={()=>setPlaying(!playing)}
                  style={{display:"flex",alignItems:"center",gap:8,padding:"9px 18px",background:hexA(VIOLET,0.18),color:VIOLET,border:`1px solid ${hexA(VIOLET,0.4)}`,borderRadius:8,cursor:"pointer",fontFamily:"monospace",fontSize:12}}>
                  {playing?<Pause size={16}/>:<Play size={16}/>}{playing?"Pause":"Play"}
                </button>
                <button onClick={()=>setFeedKey(k=>k+1)}
                  style={{display:"flex",alignItems:"center",gap:8,padding:"9px 18px",background:hexA(BLUE,0.16),color:BLUE,border:`1px solid ${hexA(BLUE,0.4)}`,borderRadius:8,cursor:"pointer",fontFamily:"monospace",fontSize:12}}>
                  <Plus size={16}/> Add Feedstock
                </button>
                <button onClick={()=>setResetKey(k=>k+1)}
                  style={{display:"flex",alignItems:"center",gap:8,padding:"9px 18px",background:PAN2,color:TEXT,border:`1px solid ${BORDER}`,borderRadius:8,cursor:"pointer",fontFamily:"monospace",fontSize:12}}>
                  <RotateCcw size={16}/> Reset
                </button>
              </div>
            </div>

            <div style={{display:"flex",flexDirection:"column",gap:14}}>
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:10}}>
                {readout("Generation",stats.gen,GREEN)}
                {readout("Offspring",stats.offspring,VIOLET)}
                {readout("Cells Left",stats.cells,CYAN)}
              </div>
              <div style={{background:PAN2,border:`1px solid ${BORDER}`,borderRadius:12,padding:16}}>
                <div style={{fontFamily:"monospace",fontSize:11,color:GOLD,textTransform:"uppercase",letterSpacing:1,marginBottom:14}}>Controls</div>
                {slider("Cilia Force / Speed",force.toFixed(2),
                  <input type="range" min={0.1} max={1.5} step={0.05} value={force} onChange={e=>setForce(+e.target.value)} style={{width:"100%",accentColor:GREEN}}/>)}
                {slider("Feedstock Density",String(density),
                  <input type="range" min={40} max={320} step={10} value={density} onChange={e=>setDensity(+e.target.value)} style={{width:"100%",accentColor:BLUE}}/>)}
                {slider("Parent Bots",String(parents),
                  <input type="range" min={1} max={10} step={1} value={parents} onChange={e=>setParents(+e.target.value)} style={{width:"100%",accentColor:GOLD}}/>)}
                <p style={{margin:"6px 0 0",fontSize:11,color:MUTED,lineHeight:1.55}}>
                  Adjusting density or parent count reseeds the chamber. Matured offspring become new parents — driving the generation counter upward while feedstock lasts.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* ── Xenobot replication ── */}
        <div style={{background:PAN,border:`1px solid ${BORDER}`,borderRadius:12,padding:18,marginBottom:24}}>
          <div style={{fontFamily:"monospace",fontSize:11,color:GREEN,marginBottom:6,textTransform:"uppercase",letterSpacing:1}}>Xenobot Replication · Kriegman et al., 2021 PNAS</div>
          <p style={{margin:"0 0 14px",fontSize:13,color:TEXT,lineHeight:1.7}}>
            The first organisms that reproduce kinematically — not by growing, but by physically gathering material. Loose frog stem cells are corralled and compacted until they cross a threshold and self-assemble into an independent copy.
          </p>
          <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(240px,1fr))",gap:12}}>
            {XENO.map(x=>(
              <div key={x.t} style={{background:PAN2,border:`1px solid ${BORDER}`,borderRadius:10,padding:"12px 14px"}}>
                <div style={{fontSize:13,color:GREEN,fontWeight:600,marginBottom:6}}>{x.t}</div>
                <p style={{margin:0,fontSize:12,color:MUTED,lineHeight:1.6}}>{x.d}</p>
              </div>
            ))}
          </div>
        </div>

        {/* ── Bottom-up flow ── */}
        <div style={{background:PAN,border:`1px solid ${BORDER}`,borderRadius:12,padding:18,marginBottom:24}}>
          <div style={{fontFamily:"monospace",fontSize:11,color:CYAN,marginBottom:14,textTransform:"uppercase",letterSpacing:1}}>Bottom-Up Reality Flow</div>
          <div style={{display:"flex",alignItems:"stretch",gap:8,flexWrap:"wrap"}}>
            {FLOW.map((f,i)=>(
              <div key={f.t} style={{display:"flex",alignItems:"center",gap:8,flex:"1 1 200px"}}>
                <div style={{flex:1,background:PAN2,border:`1px solid ${hexA(f.c,0.35)}`,borderRadius:10,padding:"12px 14px"}}>
                  <div style={{fontSize:13,color:f.c,fontWeight:600,marginBottom:4}}>{f.t}</div>
                  <p style={{margin:0,fontSize:11.5,color:MUTED,lineHeight:1.55}}>{f.d}</p>
                </div>
                {i<FLOW.length-1&&<span style={{color:MUTED,fontSize:20}}>→</span>}
              </div>
            ))}
          </div>
        </div>

        {/* ── Anthrobots ── */}
        <div style={{background:PAN,border:`1px solid ${BORDER}`,borderRadius:12,padding:18,marginBottom:24}}>
          <div style={{fontFamily:"monospace",fontSize:11,color:GOLD,marginBottom:6,textTransform:"uppercase",letterSpacing:1}}>Anthrobots · Human-Cell Version</div>
          <p style={{margin:"0 0 14px",fontSize:13,color:TEXT,lineHeight:1.7}}>
            The human-compatible counterpart, bringing the system closer to in-vivo therapeutic applications while remaining purely biological.
          </p>
          <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(230px,1fr))",gap:12}}>
            {ANTHRO.map(a=>(
              <div key={a.t} style={{background:PAN2,border:`1px solid ${BORDER}`,borderRadius:10,padding:"12px 14px"}}>
                <div style={{fontSize:13,color:GOLD,fontWeight:600,marginBottom:6}}>{a.t}</div>
                <p style={{margin:0,fontSize:12,color:MUTED,lineHeight:1.6}}>{a.d}</p>
              </div>
            ))}
          </div>
        </div>

        {/* ── CUCA bidirectional loop ── */}
        <div style={{background:PAN,border:`1px solid ${BORDER}`,borderRadius:12,padding:18,marginBottom:24}}>
          <div style={{fontFamily:"monospace",fontSize:11,color:VIOLET,marginBottom:14,textTransform:"uppercase",letterSpacing:1}}>CUCA Integration · Bidirectional Loop</div>
          <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(260px,1fr))",gap:16,marginBottom:16}}>
            {/* bottom-up column */}
            <div style={{background:PAN2,border:`1px solid ${hexA(GREEN,0.3)}`,borderRadius:10,padding:14}}>
              <div style={{fontFamily:"monospace",fontSize:11,color:GREEN,textTransform:"uppercase",letterSpacing:1,marginBottom:10}}>↑ Bottom-Up</div>
              {["Cellular substrate","Kinematic contact / signals","Piling → self-organization","Coherent offspring subsystems"].map((s,i)=>(
                <div key={s} style={{display:"flex",alignItems:"center",gap:8,marginBottom:i<3?8:0}}>
                  <span style={{width:8,height:8,borderRadius:"50%",background:GREEN,flexShrink:0}}/>
                  <span style={{fontSize:12,color:TEXT}}>{s}</span>
                </div>
              ))}
            </div>
            {/* top-down column */}
            <div style={{background:PAN2,border:`1px solid ${hexA(GOLD,0.3)}`,borderRadius:10,padding:14}}>
              <div style={{fontFamily:"monospace",fontSize:11,color:GOLD,textTransform:"uppercase",letterSpacing:1,marginBottom:10}}>↓ Top-Down Stabilization</div>
              {["Coherence goal (X*)","Minimize error E(t)","Converge toward X*(t)","Safe containment / alignment"].map((s,i)=>(
                <div key={s} style={{display:"flex",alignItems:"center",gap:8,marginBottom:i<3?8:0}}>
                  <span style={{width:8,height:8,borderRadius:"50%",background:GOLD,flexShrink:0}}/>
                  <span style={{fontSize:12,color:TEXT}}>{s}</span>
                </div>
              ))}
            </div>
          </div>
          <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(240px,1fr))",gap:12}}>
            {CUCA.map(c=>(
              <div key={c.t} style={{background:PAN2,border:`1px solid ${BORDER}`,borderRadius:10,padding:"12px 14px"}}>
                <div style={{fontSize:13,color:c.c,fontWeight:600,marginBottom:6}}>{c.t}</div>
                <p style={{margin:0,fontSize:12,color:MUTED,lineHeight:1.6}}>{c.d}</p>
              </div>
            ))}
          </div>
        </div>

        {/* ── application + status ── */}
        <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(280px,1fr))",gap:16,marginBottom:24}}>
          <div style={{background:PAN,border:`1px solid ${BORDER}`,borderRadius:12,padding:18}}>
            <div style={{fontFamily:"monospace",fontSize:11,color:CYAN,marginBottom:10,textTransform:"uppercase",letterSpacing:1}}>Cancer Research Framing</div>
            <p style={{margin:0,fontSize:12.5,color:MUTED,lineHeight:1.7}}>
              Imagine engineered human-cell biobots maintaining tumor-microenvironment coherence: gathering dysfunctional cells, promoting repair and immune modulation, replicating locally if needed, then degrading via built-in timers for safe, self-limiting therapy.
            </p>
          </div>
          <div style={{background:PAN,border:`1px solid ${BORDER}`,borderRadius:12,padding:18}}>
            <div style={{fontFamily:"monospace",fontSize:11,color:GOLD,marginBottom:10,textTransform:"uppercase",letterSpacing:1}}>Controlled Breakdown / Kill-Switch</div>
            <p style={{margin:0,fontSize:12.5,color:MUTED,lineHeight:1.7}}>
              Natural ~10-day lifespan from energy depletion, or engineered kill-switches, provide safe self-limitation. No uncontrolled persistence — degradation is a designed feature of the coherence loop, not a failure mode.
            </p>
          </div>
        </div>

        <div style={{background:PAN,border:`1px solid ${hexA(BLUE,0.3)}`,borderRadius:12,padding:18,marginBottom:24}}>
          <div style={{fontFamily:"monospace",fontSize:11,color:BLUE,marginBottom:10,textTransform:"uppercase",letterSpacing:1}}>Current Status · March 2026</div>
          <p style={{margin:"0 0 10px",fontSize:12.5,color:MUTED,lineHeight:1.7}}>
            Kinematic self-replication remains grounded in the 2021 discovery — no fundamentally new mechanisms have been reported. The Synthetic Human Genome (SynHG) project (launched 2025) is advancing foundational chromosome-synthesis tools, with early first-phase successes in stable maintenance and partial replacement in stem cells. Full synthetic organisms are still far off.
          </p>
          <p style={{margin:0,fontSize:12.5,color:TEXT,lineHeight:1.7}}>
            These living systems are the closest real-world embodiment of a purely biological Closed Loop Coherence System: no metal, no silicon — only substrate-driven intelligence stabilized by relational alignment and continuous correction.
          </p>
        </div>

        <div style={{display:"flex",flexWrap:"wrap",gap:14,paddingTop:20,borderTop:`1px solid ${BORDER}`,fontFamily:"monospace",fontSize:12}}>
          <Link href="/cuca-bioengine" style={{color:GREEN,textDecoration:"none"}}>→ CUCA Bio-Engine</Link>
          <Link href="/cuca-white-paper" style={{color:VIOLET,textDecoration:"none"}}>→ CUCA White Paper</Link>
          <Link href="/stromatolite-field" style={{color:CYAN,textDecoration:"none"}}>→ Stromatolite Field</Link>
          <Link href="/graph-map" style={{color:MUTED,textDecoration:"none"}}>→ Knowledge Graph</Link>
        </div>
      </div>
    </div>
  );
}
