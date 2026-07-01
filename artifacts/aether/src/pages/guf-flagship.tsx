import { useState, useEffect, useRef, useCallback } from "react";

const PHI = 1.6180339887;
const TAU = Math.PI * 2;

// ── PALETTE ───────────────────────────────────────────────────────────────────
const C = {
  bg: "#07091a",
  surface: "#0c1128",
  panel: "#101830",
  border: "#1a2a55",
  d1: "#00e5ff", d2: "#7c4dff", d3: "#69f0ae",
  d4: "#ffd740", d5: "#ff6d00", d6: "#ff4081", d7: "#b2ff59",
  phi: "#ffd740",
  text: "#dce8ff",
  muted: "#5a7aaa",
  accent: "#4fc3f7",
};

const DIM_DATA = [
  { id:"D1", label:"Substrate", color:C.d1, desc:"Zero-point field. Pure potential. φ-ratio encoded in vacuum geometry.", freq:1 },
  { id:"D2", label:"Coherence", color:C.d2, desc:"Vortical harmonics. Phase-locking across adjacent D1 fluctuations.", freq:PHI },
  { id:"D3", label:"Form",      color:C.d3, desc:"Geometric crystallization. Platonic solids emerge from D2 interference.", freq:PHI*PHI },
  { id:"D4", label:"Time",      color:C.d4, desc:"Sequential ordering of D3 state transitions. φ-scheduled event bus.", freq:PHI**3 },
  { id:"D5", label:"Life",      color:C.d5, desc:"Autocatalytic loops. CLA molecular self-assembly lattice.", freq:PHI**4 },
  { id:"D6", label:"Mind",      color:C.d6, desc:"Recursive self-modeling. Holographic compression of D1–D5.", freq:PHI**5 },
  { id:"D7", label:"Unity",     color:C.d7, desc:"Non-local entanglement. All dimensions collapse to a single operator.", freq:PHI**6 },
];

const BUS_DATA = [
  { id:"EB1", label:"Vacuum",    color:C.d1, dims:"D1↔D2", rate:0.8 },
  { id:"EB2", label:"Geometric", color:C.d3, dims:"D2↔D3", rate:0.6 },
  { id:"EB3", label:"Temporal",  color:C.d4, dims:"D3↔D4", rate:0.5 },
  { id:"EB4", label:"Biotic",    color:C.d5, dims:"D4↔D5", rate:0.35 },
  { id:"EB5", label:"Noetic",    color:C.d6, dims:"D5↔D7", rate:0.2 },
];

// ── UTILS ─────────────────────────────────────────────────────────────────────
function lerp(a,b,t){ return a+(b-a)*t; }
function clamp(v,lo,hi){ return Math.max(lo,Math.min(hi,v)); }

// ── TAB BAR ───────────────────────────────────────────────────────────────────
function TabBar({ tabs, active, onChange }) {
  return (
    <div style={{ display:"flex", gap:4, flexWrap:"wrap", justifyContent:"center", marginBottom:20 }}>
      {tabs.map(t => (
        <button key={t.id} onClick={()=>onChange(t.id)} style={{
          padding:"7px 14px", borderRadius:8, border:`1px solid ${active===t.id? t.color||C.accent : C.border}`,
          background: active===t.id ? `${t.color||C.accent}22` : "transparent",
          color: active===t.id ? (t.color||C.accent) : C.muted,
          fontWeight: active===t.id ? 700 : 400,
          fontSize:12, cursor:"pointer", transition:"all 0.18s",
          letterSpacing:"0.04em"
        }}>{t.label}</button>
      ))}
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// TAB 1 — D1–D7 DIMENSIONAL NAVIGATOR
// ══════════════════════════════════════════════════════════════════════════════
function DimNavigator() {
  const canvasRef = useRef(null);
  const [active, setActive] = useState(0);
  const tRef = useRef(0);
  const animRef = useRef(null);

  useEffect(()=>{
    const cv = canvasRef.current;
    const ctx = cv.getContext("2d");
    const W=cv.width, H=cv.height;
    const cx=W/2, cy=H/2;

    const draw = t => {
      ctx.clearRect(0,0,W,H);
      // radial grid
      for(let r=30;r<=cx-10;r+=30){
        ctx.beginPath(); ctx.arc(cx,cy,r,0,TAU);
        ctx.strokeStyle=`rgba(30,60,130,0.18)`; ctx.lineWidth=1; ctx.stroke();
      }
      // spokes
      for(let i=0;i<7;i++){
        const a=(i/7)*TAU - TAU/4;
        ctx.beginPath(); ctx.moveTo(cx,cy);
        ctx.lineTo(cx+Math.cos(a)*(cx-10), cy+Math.sin(a)*(cx-10));
        ctx.strokeStyle=`rgba(30,60,130,0.22)`; ctx.lineWidth=1; ctx.stroke();
      }

      // φ-spiral
      ctx.beginPath();
      for(let s=0;s<=TAU*3.5;s+=0.04){
        const r = (cx-20)/(PHI**5) * (PHI**(s/(TAU/1.5)));
        const ax=cx+Math.cos(s-TAU/4)*r;
        const ay=cy+Math.sin(s-TAU/4)*r;
        s===0? ctx.moveTo(ax,ay) : ctx.lineTo(ax,ay);
      }
      ctx.strokeStyle=`rgba(255,215,64,0.25)`; ctx.lineWidth=1.5; ctx.stroke();

      // dimension nodes
      DIM_DATA.forEach((d,i)=>{
        const a = (i/7)*TAU - TAU/4;
        const rr = 40 + i*26;
        const pulse = 0.5+0.5*Math.sin(t*d.freq*0.4+i);
        const nx=cx+Math.cos(a)*rr, ny=cy+Math.sin(a)*rr;

        // connection line
        ctx.beginPath(); ctx.moveTo(cx,cy); ctx.lineTo(nx,ny);
        ctx.strokeStyle=active===i? d.color : `${d.color}44`;
        ctx.lineWidth=active===i? 2 : 1; ctx.stroke();

        // glow
        if(active===i){
          ctx.save(); ctx.globalAlpha=0.2*pulse;
          ctx.beginPath(); ctx.arc(nx,ny,18,0,TAU);
          ctx.fillStyle=d.color; ctx.fill(); ctx.restore();
        }

        // node
        ctx.beginPath(); ctx.arc(nx,ny,8,0,TAU);
        ctx.fillStyle=active===i? d.color : `${d.color}88`;
        ctx.fill();

        // label
        const lx=cx+Math.cos(a)*(rr+22), ly=cy+Math.sin(a)*(rr+22);
        ctx.font=`${active===i?"bold ":""}11px Arial`;
        ctx.fillStyle=active===i? d.color : C.muted;
        ctx.textAlign="center"; ctx.textBaseline="middle";
        ctx.fillText(d.id, lx, ly);
      });

      // center hub
      ctx.beginPath(); ctx.arc(cx,cy,10,0,TAU);
      ctx.fillStyle=C.phi; ctx.fill();
      ctx.font="bold 8px Arial";
      ctx.fillStyle=C.bg; ctx.textAlign="center"; ctx.textBaseline="middle";
      ctx.fillText("φ",cx,cy);

      // φ label ring
      const phiR = 110 + 20*Math.sin(t*0.3);
      for(let i=0;i<6;i++){
        const a=(i/6)*TAU+t*0.08;
        ctx.beginPath(); ctx.arc(cx+Math.cos(a)*phiR, cy+Math.sin(a)*phiR,2,0,TAU);
        ctx.fillStyle=`rgba(255,215,64,${0.2+0.1*Math.sin(t+i)})`; ctx.fill();
      }
    };

    const loop=()=>{ tRef.current+=0.025; draw(tRef.current); animRef.current=requestAnimationFrame(loop); };
    animRef.current=requestAnimationFrame(loop);
    return()=>cancelAnimationFrame(animRef.current);
  },[active]);

  const d = DIM_DATA[active];

  return (
    <div style={{display:"flex",gap:20,flexWrap:"wrap",alignItems:"flex-start"}}>
      <canvas ref={canvasRef} width={320} height={320}
        style={{borderRadius:12,background:C.bg,border:`1px solid ${C.border}`,cursor:"pointer"}}
        onClick={e=>{
          const r=canvasRef.current.getBoundingClientRect();
          const cx2=160,cy2=160;
          const mx=e.clientX-r.left, my=e.clientY-r.top;
          let best=-1, bd=999;
          DIM_DATA.forEach((_,i)=>{
            const a=(i/7)*TAU-TAU/4, rr=40+i*26;
            const nx=cx2+Math.cos(a)*rr, ny=cy2+Math.sin(a)*rr;
            const dist=Math.hypot(mx-nx,my-ny);
            if(dist<bd){bd=dist;best=i;}
          });
          if(bd<24) setActive(best);
        }}
      />
      <div style={{flex:1,minWidth:180}}>
        {/* dimension selector pills */}
        <div style={{display:"flex",flexWrap:"wrap",gap:6,marginBottom:14}}>
          {DIM_DATA.map((d,i)=>(
            <button key={i} onClick={()=>setActive(i)} style={{
              padding:"4px 10px",borderRadius:20,border:`1px solid ${active===i?d.color:C.border}`,
              background:active===i?`${d.color}22`:"transparent",
              color:active===i?d.color:C.muted,
              fontSize:11,cursor:"pointer",fontWeight:active===i?700:400
            }}>{d.id}</button>
          ))}
        </div>
        {/* active dim card */}
        <div style={{background:`${d.color}11`,border:`1px solid ${d.color}44`,borderRadius:10,padding:14,marginBottom:12}}>
          <div style={{color:d.color,fontWeight:700,fontSize:18,marginBottom:4}}>{d.id} — {d.label}</div>
          <div style={{color:C.muted,fontSize:12,lineHeight:1.7,marginBottom:8}}>{d.desc}</div>
          <div style={{display:"flex",gap:16}}>
            <span style={{color:C.muted,fontSize:11}}>φ-freq: <span style={{color:C.phi,fontWeight:700}}>{d.freq.toFixed(4)}</span></span>
            <span style={{color:C.muted,fontSize:11}}>Order: <span style={{color:d.color}}>{active+1}/7</span></span>
          </div>
        </div>
        {/* φ ratio ladder */}
        <div style={{background:C.surface,borderRadius:8,padding:12,border:`1px solid ${C.border}`}}>
          <div style={{color:C.phi,fontWeight:700,fontSize:11,marginBottom:8}}>φ-Scheduling Ladder</div>
          {DIM_DATA.map((dd,i)=>(
            <div key={i} style={{display:"flex",alignItems:"center",gap:8,marginBottom:4}}>
              <div style={{width:20,fontSize:10,color:dd.color,fontWeight:700}}>{dd.id}</div>
              <div style={{flex:1,height:6,background:C.border,borderRadius:3,overflow:"hidden"}}>
                <div style={{
                  height:"100%",borderRadius:3,
                  background:dd.color,
                  width:`${Math.min(100,(dd.freq/PHI**6)*100)}%`,
                  transition:"width 0.3s"
                }}/>
              </div>
              <div style={{width:48,fontSize:10,color:dd.color,textAlign:"right"}}>{dd.freq.toFixed(2)}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// TAB 2 — BUBBLE COLLIDER
// ══════════════════════════════════════════════════════════════════════════════
function BubbleCollider() {
  const cvRef = useRef(null);
  const stateRef = useRef({
    bubbles:[
      {x:110,y:160,r:55,vx:0.9,vy:0,color:C.d1,label:"B1",phase:0},
      {x:330,y:160,r:55,vx:-0.9,vy:0,color:C.d6,label:"B2",phase:2},
    ],
    event:null, t:0, paused:false
  });
  const animRef = useRef(null);
  const [eventLog, setEventLog] = useState([]);
  const [mode, setMode] = useState("collide"); // collide | repel | merge

  const reset = useCallback(()=>{
    const r = mode==="merge"?45:55;
    stateRef.current.bubbles=[
      {x:90, y:160,r,vx: mode==="repel"?0.5:1.0,vy:0,color:C.d1,label:"B1",phase:0},
      {x:350,y:160,r,vx: mode==="repel"?-0.5:-1.0,vy:0,color:C.d6,label:"B2",phase:2},
    ];
    stateRef.current.event=null;
    stateRef.current.t=0;
    setEventLog([]);
  },[mode]);

  useEffect(()=>{ reset(); },[mode]);

  useEffect(()=>{
    const cv=cvRef.current;
    const ctx=cv.getContext("2d");
    const W=cv.width,H=cv.height;

    const draw=()=>{
      const S=stateRef.current;
      if(!S.paused) S.t+=0.025;
      const {bubbles,t}=S;
      ctx.clearRect(0,0,W,H);

      // grid
      ctx.strokeStyle="rgba(26,42,85,0.4)"; ctx.lineWidth=1;
      for(let x=0;x<W;x+=25){ctx.beginPath();ctx.moveTo(x,0);ctx.lineTo(x,H);ctx.stroke();}
      for(let y=0;y<H;y+=25){ctx.beginPath();ctx.moveTo(0,y);ctx.lineTo(W,y);ctx.stroke();}

      if(!S.paused){
        // move
        bubbles.forEach(b=>{ b.x+=b.vx; b.y+=b.vy; b.phase+=0.02; });

        const b0=bubbles[0],b1=bubbles[1];
        const dist=Math.hypot(b0.x-b1.x,b0.y-b1.y);
        const sumR=b0.r+b1.r;

        if(mode==="collide" && dist<sumR && !S.event){
          S.event="collision";
          const nx=(b0.x+b1.x)/2, ny=(b0.y+b1.y)/2;
          S.shockX=nx; S.shockY=ny; S.shockR=0; S.shockMax=120;
          const vrel=b0.vx-b1.vx;
          b0.vx=-b0.vx*0.7; b1.vx=-b1.vx*0.7;
          b0.vy=(Math.random()-0.5)*1.5; b1.vy=(Math.random()-0.5)*1.5;
          const e=dist<sumR*0.5?"Deep merge":"Glancing scatter";
          setEventLog(l=>[{type:"COLLISION",detail:`Δv=${vrel.toFixed(2)} — ${e}`,t:S.t.toFixed(1)},{...l[0]}]);
        }
        if(mode==="repel" && dist<sumR+40){
          const nx=(b0.x-b1.x)/dist, ny=(b0.y-b1.y)/dist;
          b0.vx+=nx*0.08; b0.vy+=ny*0.08;
          b1.vx-=nx*0.08; b1.vy-=ny*0.08;
        }
        if(mode==="merge" && dist<sumR && !S.event){
          S.event="merge";
          setEventLog(l=>[{type:"MERGE",detail:`r_final=${Math.round(Math.sqrt(b0.r**2+b1.r**2))}px`,t:S.t.toFixed(1)},...l.slice(0,2)]);
        }

        // bounce walls
        bubbles.forEach(b=>{
          if(b.x-b.r<0){b.x=b.r;b.vx=Math.abs(b.vx);}
          if(b.x+b.r>W){b.x=W-b.r;b.vx=-Math.abs(b.vx);}
          if(b.y-b.r<0){b.y=b.r;b.vy=Math.abs(b.vy);}
          if(b.y+b.r>H){b.y=H-b.r;b.vy=-Math.abs(b.vy);}
        });

        if(S.shockR!==undefined) S.shockR=Math.min(S.shockR+3,S.shockMax);
      }

      // draw merge blob
      if(mode==="merge" && S.event==="merge"){
        const b0=bubbles[0],b1=bubbles[1];
        const mx=(b0.x+b1.x)/2, my=(b0.y+b1.y)/2;
        const rr=Math.sqrt(b0.r**2+b1.r**2);
        ctx.beginPath(); ctx.arc(mx,my,rr,0,TAU);
        ctx.strokeStyle=C.d3; ctx.lineWidth=2.5;
        ctx.setLineDash([]); ctx.stroke();
        ctx.beginPath(); ctx.arc(mx,my,rr,0,TAU);
        ctx.fillStyle=`rgba(105,240,174,0.07)`; ctx.fill();
        ctx.font="bold 11px Arial"; ctx.fillStyle=C.d3;
        ctx.textAlign="center"; ctx.fillText("MERGED",mx,my+4);
        return;
      }

      // shockwave
      if(S.shockR!==undefined && S.shockR<S.shockMax){
        const alpha=1-S.shockR/S.shockMax;
        ctx.beginPath(); ctx.arc(S.shockX,S.shockY,S.shockR,0,TAU);
        ctx.strokeStyle=`rgba(255,215,64,${alpha*0.7})`; ctx.lineWidth=2; ctx.stroke();
      }

      // interaction beam
      const b0=bubbles[0],b1=bubbles[1];
      const dist2=Math.hypot(b0.x-b1.x,b0.y-b1.y);
      if(dist2<(b0.r+b1.r)*2.5){
        const strength=1-dist2/((b0.r+b1.r)*2.5);
        ctx.save();
        ctx.globalAlpha=strength*0.4;
        ctx.beginPath(); ctx.moveTo(b0.x,b0.y); ctx.lineTo(b1.x,b1.y);
        ctx.strokeStyle=C.phi; ctx.lineWidth=strength*3; ctx.stroke();
        ctx.restore();
      }

      // bubbles
      bubbles.forEach(b=>{
        const nodes=8;
        // boundary
        ctx.beginPath(); ctx.arc(b.x,b.y,b.r,0,TAU);
        ctx.strokeStyle=b.color; ctx.lineWidth=2; ctx.stroke();
        // interior
        ctx.beginPath(); ctx.arc(b.x,b.y,b.r,0,TAU);
        ctx.fillStyle=`${b.color}09`; ctx.fill();
        // nodes on rim
        for(let i=0;i<nodes;i++){
          const a=(i/nodes)*TAU+b.phase;
          const nx=b.x+Math.cos(a)*b.r, ny=b.y+Math.sin(a)*b.r;
          ctx.beginPath(); ctx.arc(nx,ny,3.5,0,TAU);
          ctx.fillStyle=b.color; ctx.fill();
        }
        // label
        ctx.font="bold 11px Arial"; ctx.fillStyle=b.color;
        ctx.textAlign="center"; ctx.fillText(b.label,b.x,b.y+4);
        // velocity arrow
        const speed=Math.hypot(b.vx,b.vy);
        if(speed>0.1){
          const ax=b.x+b.vx/speed*30, ay=b.y+b.vy/speed*30;
          ctx.beginPath(); ctx.moveTo(b.x,b.y); ctx.lineTo(ax,ay);
          ctx.strokeStyle=`${b.color}88`; ctx.lineWidth=1.5; ctx.stroke();
        }
      });

      animRef.current=requestAnimationFrame(draw);
    };
    animRef.current=requestAnimationFrame(draw);
    return()=>cancelAnimationFrame(animRef.current);
  },[mode]);

  return (
    <div>
      <div style={{display:"flex",gap:8,marginBottom:12,flexWrap:"wrap"}}>
        {["collide","repel","merge"].map(m=>(
          <button key={m} onClick={()=>setMode(m)} style={{
            padding:"6px 14px",borderRadius:8,border:`1px solid ${mode===m?C.accent:C.border}`,
            background:mode===m?`${C.accent}22`:"transparent",
            color:mode===m?C.accent:C.muted,fontSize:11,cursor:"pointer",textTransform:"uppercase",letterSpacing:"0.05em"
          }}>{m}</button>
        ))}
        <button onClick={reset} style={{padding:"6px 14px",borderRadius:8,border:`1px solid ${C.d4}`,
          background:`${C.d4}11`,color:C.d4,fontSize:11,cursor:"pointer"}}>↺ Reset</button>
      </div>
      <div style={{display:"flex",gap:16,flexWrap:"wrap",alignItems:"flex-start"}}>
        <canvas ref={cvRef} width={440} height={320}
          style={{borderRadius:12,background:C.bg,border:`1px solid ${C.border}`}}/>
        <div style={{flex:1,minWidth:160}}>
          <div style={{color:C.accent,fontWeight:700,fontSize:12,marginBottom:8}}>EVENT LOG</div>
          {eventLog.length===0 && <div style={{color:C.muted,fontSize:11}}>Awaiting collision…</div>}
          {eventLog.map((e,i)=>(
            <div key={i} style={{background:`${i===0?C.d4:C.border}15`,border:`1px solid ${i===0?C.d4:C.border}44`,
              borderRadius:8,padding:"8px 10px",marginBottom:6}}>
              <div style={{color:i===0?C.d4:C.muted,fontWeight:700,fontSize:11}}>{e?.type||"—"}</div>
              <div style={{color:C.text,fontSize:11,marginTop:2}}>{e?.detail||""}</div>
              <div style={{color:C.muted,fontSize:10,marginTop:2}}>t={e?.t||"—"}</div>
            </div>
          ))}
          <div style={{marginTop:12,padding:"10px 12px",background:C.surface,borderRadius:8,border:`1px solid ${C.border}`}}>
            <div style={{color:C.phi,fontWeight:700,fontSize:11,marginBottom:6}}>GUF Interpretation</div>
            <div style={{color:C.muted,fontSize:11,lineHeight:1.7}}>
              {mode==="collide" && "Bubble collision = D4→D3 dimensional cascade. φ-scheduled shock propagation."}
              {mode==="repel"   && "Repulsion = boundary node consensus rejection. Field gradients prevent merger."}
              {mode==="merge"   && "Merge = coherence collapse → new emergent attractor state. D5 biotic coupling."}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// TAB 3 — FIELD CONSENSUS SIMULATOR
// ══════════════════════════════════════════════════════════════════════════════
function FieldConsensus() {
  const cvRef = useRef(null);
  const animRef = useRef(null);
  const nodesRef = useRef([]);
  const tRef = useRef(0);
  const [running, setRunning] = useState(false);
  const [gen, setGen] = useState(0);
  const [consensus, setConsensus] = useState(0);

  const init = useCallback(()=>{
    const N=24;
    nodesRef.current=Array.from({length:N},(_,i)=>({
      angle:(i/N)*TAU,
      r: 60+Math.random()*80,
      output: Math.random(),
      target: 0.5,
      color:`hsl(${200+i*6},80%,60%)`,
      converged:false,
    }));
    tRef.current=0;
    setGen(0); setConsensus(0);
  },[]);

  useEffect(()=>{ init(); },[]);

  useEffect(()=>{
    const cv=cvRef.current;
    const ctx=cv.getContext("2d");
    const W=cv.width,H=cv.height,cx=W/2,cy=H/2;
    let frameId;
    let localGen=0;

    const draw=()=>{
      tRef.current+=0.02;
      const t=tRef.current;
      ctx.clearRect(0,0,W,H);

      // radial grid
      for(let r=30;r<cx;r+=30){
        ctx.beginPath(); ctx.arc(cx,cy,r,0,TAU);
        ctx.strokeStyle="rgba(26,42,85,0.2)"; ctx.lineWidth=1; ctx.stroke();
      }

      const nodes=nodesRef.current;
      if(running && nodes.length>0){
        // update: each node adjusts toward mean of neighbors
        const N=nodes.length;
        nodes.forEach((n,i)=>{
          const prev=nodes[(i-1+N)%N], next=nodes[(i+1)%N];
          const neighborMean=(prev.output+next.output)/2;
          const gradientPull=(neighborMean-n.output)*0.04;
          const noiseDamp=0.002*(Math.random()-0.5);
          n.output=clamp(n.output+gradientPull+noiseDamp,0,1);
          // radius negotiates toward ideal boundary
          const targetR=80+n.output*60;
          n.r=lerp(n.r,targetR,0.05);
          n.converged=Math.abs(n.output-0.5)<0.08;
        });
        localGen++;
        if(localGen%3===0){
          setGen(g=>g+1);
          const conv=nodes.filter(n=>n.converged).length/nodes.length;
          setConsensus(Math.round(conv*100));
        }
      }

      // gradient field (sample points)
      const samples=120;
      for(let s=0;s<samples;s++){
        const a=(s/samples)*TAU, r=40+s%3*30;
        const px=cx+Math.cos(a)*r, py=cy+Math.sin(a)*r;
        // find nearest node
        let minD=999,nearOut=0.5;
        nodes.forEach(n=>{
          const nx=cx+Math.cos(n.angle)*n.r, ny=cy+Math.sin(n.angle)*n.r;
          const d=Math.hypot(px-nx,py-ny);
          if(d<minD){minD=d;nearOut=n.output;}
        });
        const alpha=Math.abs(nearOut-0.5)*0.6;
        ctx.beginPath(); ctx.arc(px,py,2,0,TAU);
        ctx.fillStyle=nearOut>0.5?`rgba(0,229,255,${alpha})`:`rgba(124,77,255,${alpha})`;
        ctx.fill();
      }

      // boundary polygon
      if(nodes.length>0){
        ctx.beginPath();
        nodes.forEach((n,i)=>{
          const px=cx+Math.cos(n.angle)*n.r, py=cy+Math.sin(n.angle)*n.r;
          i===0? ctx.moveTo(px,py) : ctx.lineTo(px,py);
        });
        ctx.closePath();
        ctx.strokeStyle=C.accent; ctx.lineWidth=2; ctx.stroke();
        ctx.fillStyle="rgba(79,195,247,0.04)"; ctx.fill();
      }

      // nodes
      nodes.forEach(n=>{
        const px=cx+Math.cos(n.angle)*n.r, py=cy+Math.sin(n.angle)*n.r;
        // output bar
        ctx.fillStyle=n.converged?C.d3:`${n.color}cc`;
        ctx.beginPath(); ctx.arc(px,py,5+n.output*4,0,TAU); ctx.fill();
      });

      // center
      ctx.beginPath(); ctx.arc(cx,cy,8,0,TAU);
      ctx.fillStyle=C.phi; ctx.fill();

      frameId=requestAnimationFrame(draw);
    };
    frameId=requestAnimationFrame(draw);
    return()=>cancelAnimationFrame(frameId);
  },[running]);

  return (
    <div>
      <div style={{display:"flex",gap:8,marginBottom:14,flexWrap:"wrap"}}>
        <button onClick={()=>setRunning(r=>!r)} style={{
          padding:"8px 18px",borderRadius:8,border:`1px solid ${running?C.d5:C.d3}`,
          background:`${running?C.d5:C.d3}22`,color:running?C.d5:C.d3,
          fontWeight:700,fontSize:12,cursor:"pointer"
        }}>{running?"⏸ Pause":"▶ Evolve"}</button>
        <button onClick={()=>{init();setRunning(false);}} style={{
          padding:"8px 14px",borderRadius:8,border:`1px solid ${C.border}`,
          background:"transparent",color:C.muted,fontSize:12,cursor:"pointer"
        }}>↺ Reset</button>
      </div>
      <div style={{display:"flex",gap:16,flexWrap:"wrap",alignItems:"flex-start"}}>
        <canvas ref={cvRef} width={340} height={340}
          style={{borderRadius:12,background:C.bg,border:`1px solid ${C.border}`}}/>
        <div style={{flex:1,minWidth:180}}>
          {/* stats */}
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8,marginBottom:14}}>
            {[
              {label:"Generation",value:gen,color:C.accent},
              {label:"Consensus",value:`${consensus}%`,color:C.d3},
              {label:"Nodes",value:nodesRef.current.length,color:C.d2},
              {label:"∇Φ target",value:"0.5",color:C.phi},
            ].map((s,i)=>(
              <div key={i} style={{background:C.surface,borderRadius:8,padding:"10px 12px",
                border:`1px solid ${C.border}`}}>
                <div style={{color:C.muted,fontSize:10,marginBottom:4}}>{s.label}</div>
                <div style={{color:s.color,fontWeight:700,fontSize:18}}>{s.value}</div>
              </div>
            ))}
          </div>
          {/* explanation */}
          <div style={{background:C.surface,borderRadius:8,padding:12,border:`1px solid ${C.border}`,marginBottom:10}}>
            <div style={{color:C.d3,fontWeight:700,fontSize:11,marginBottom:6}}>Emergence Protocol</div>
            {[
              "24 nodes start with random field outputs",
              "Each reads only 2 neighbors — no global knowledge",
              "Gradient averaging nudges outputs toward 0.5",
              "Boundary radius negotiates from local pressure",
              "Consensus = all outputs within ±0.08 of target",
            ].map((s,i)=>(
              <div key={i} style={{display:"flex",gap:8,marginBottom:4}}>
                <span style={{color:C.phi,fontSize:10,fontWeight:700,minWidth:14}}>{i+1}.</span>
                <span style={{color:C.muted,fontSize:11}}>{s}</span>
              </div>
            ))}
          </div>
          <div style={{padding:"10px 12px",background:`${C.d3}11`,borderRadius:8,border:`1px solid ${C.d3}44`}}>
            <div style={{color:C.d3,fontSize:11,lineHeight:1.7}}>
              {consensus>90?"✓ Bubble achieved — boundary fully emerged from local rules only"
               :consensus>50?"Partial consensus — boundary forming, nodes converging"
               :"Initial chaos — nodes negotiating field equilibrium"}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// TAB 4 — EVENT BUS DASHBOARD
// ══════════════════════════════════════════════════════════════════════════════
function EventBusDash() {
  const cvRef = useRef(null);
  const animRef = useRef(null);
  const tRef = useRef(0);
  const packetsRef = useRef([]);
  const [busActive, setBusActive] = useState([true,true,true,true,true]);
  const [fireCount, setFireCount] = useState([0,0,0,0,0]);
  const fcRef = useRef([0,0,0,0,0]);

  useEffect(()=>{
    const cv=cvRef.current;
    const ctx=cv.getContext("2d");
    const W=cv.width,H=cv.height;

    // layout: 7 dim nodes on left spine, 5 bus lanes horizontally
    const dimY = i => 40+i*54;
    const busX  = i => 130+i*68;

    const draw=()=>{
      tRef.current+=0.025;
      const t=tRef.current;
      ctx.clearRect(0,0,W,H);

      // -- dim spine labels
      DIM_DATA.forEach((d,i)=>{
        ctx.beginPath(); ctx.arc(55,dimY(i),10,0,TAU);
        ctx.fillStyle=d.color; ctx.fill();
        ctx.font="bold 10px Arial"; ctx.fillStyle=C.bg;
        ctx.textAlign="center"; ctx.textBaseline="middle";
        ctx.fillText(d.id,55,dimY(i));
        ctx.font="10px Arial"; ctx.fillStyle=d.color;
        ctx.textAlign="left"; ctx.textBaseline="middle";
        ctx.fillText(d.label,70,dimY(i));
      });

      // -- bus lane headers
      BUS_DATA.forEach((b,i)=>{
        const bx=busX(i);
        ctx.font="bold 9px Arial"; ctx.fillStyle=busActive[i]?b.color:C.muted;
        ctx.textAlign="center"; ctx.textBaseline="top";
        ctx.fillText(b.id,bx,8);
        ctx.font="8px Arial"; ctx.fillStyle=C.muted;
        ctx.fillText(b.dims,bx,20);

        // vertical lane line
        const pairs=b.dims.split("↔");
        const d1idx=DIM_DATA.findIndex(d=>d.id===pairs[0].trim());
        const d2idx=DIM_DATA.findIndex(d=>d.id===pairs[1].trim());
        if(d1idx>=0&&d2idx>=0){
          ctx.beginPath();
          ctx.moveTo(bx,dimY(d1idx));
          ctx.lineTo(bx,dimY(d2idx));
          ctx.strokeStyle=busActive[i]?`${b.color}44`:`${C.border}88`;
          ctx.lineWidth=busActive[i]?3:1;
          ctx.setLineDash([]);
          ctx.stroke();
          // endpoints
          [d1idx,d2idx].forEach(di=>{
            ctx.beginPath(); ctx.arc(bx,dimY(di),5,0,TAU);
            ctx.fillStyle=busActive[i]?b.color:`${b.color}44`; ctx.fill();
          });
        }
      });

      // -- spawn packets
      BUS_DATA.forEach((b,i)=>{
        if(!busActive[i]) return;
        if(Math.random()<b.rate*0.04){
          const pairs=b.dims.split("↔");
          const d1i=DIM_DATA.findIndex(d=>d.id===pairs[0].trim());
          const d2i=DIM_DATA.findIndex(d=>d.id===pairs[1].trim());
          if(d1i>=0&&d2i>=0){
            packetsRef.current.push({
              busIdx:i, x:busX(i),
              y0:dimY(d1i), y1:dimY(d2i),
              progress:0, color:b.color,
              dir:Math.random()<0.5?1:-1,
              id:Math.random()
            });
            fcRef.current[i]++;
            setFireCount([...fcRef.current]);
          }
        }
      });

      // -- update & draw packets
      packetsRef.current=packetsRef.current.filter(p=>{
        p.progress+=0.025;
        if(p.progress>1) return false;
        const y=lerp(p.dir>0?p.y0:p.y1, p.dir>0?p.y1:p.y0, p.progress);
        // glow
        ctx.save(); ctx.globalAlpha=0.3*(1-p.progress);
        ctx.beginPath(); ctx.arc(p.x,y,8,0,TAU);
        ctx.fillStyle=p.color; ctx.fill(); ctx.restore();
        // dot
        ctx.beginPath(); ctx.arc(p.x,y,4,0,TAU);
        ctx.fillStyle=p.color; ctx.fill();
        return true;
      });

      // -- fire count bars
      BUS_DATA.forEach((b,i)=>{
        const bx=busX(i);
        const bary=H-30;
        const maxFc=Math.max(...fcRef.current,1);
        const barH=Math.min(40,(fcRef.current[i]/maxFc)*40);
        ctx.fillStyle=busActive[i]?`${b.color}33`:C.border;
        ctx.fillRect(bx-14,bary-barH,28,barH);
        ctx.strokeStyle=busActive[i]?b.color:C.border;
        ctx.lineWidth=1; ctx.strokeRect(bx-14,bary-40,28,40);
        ctx.font="9px Arial"; ctx.fillStyle=busActive[i]?b.color:C.muted;
        ctx.textAlign="center"; ctx.fillText(fcRef.current[i],bx,H-12);
      });

      animRef.current=requestAnimationFrame(draw);
    };
    animRef.current=requestAnimationFrame(draw);
    return()=>cancelAnimationFrame(animRef.current);
  },[busActive]);

  return (
    <div>
      <div style={{display:"flex",gap:8,marginBottom:14,flexWrap:"wrap"}}>
        {BUS_DATA.map((b,i)=>(
          <button key={i} onClick={()=>setBusActive(a=>{const n=[...a];n[i]=!n[i];return n;})} style={{
            padding:"5px 12px",borderRadius:6,
            border:`1px solid ${busActive[i]?b.color:C.border}`,
            background:busActive[i]?`${b.color}22`:"transparent",
            color:busActive[i]?b.color:C.muted,
            fontSize:11,cursor:"pointer"
          }}>{b.id} {busActive[i]?"●":"○"}</button>
        ))}
      </div>
      <div style={{display:"flex",gap:16,flexWrap:"wrap",alignItems:"flex-start"}}>
        <canvas ref={cvRef} width={480} height={420}
          style={{borderRadius:12,background:C.bg,border:`1px solid ${C.border}`}}/>
        <div style={{flex:1,minWidth:160}}>
          <div style={{color:C.accent,fontWeight:700,fontSize:12,marginBottom:10}}>BUS ACTIVITY</div>
          {BUS_DATA.map((b,i)=>(
            <div key={i} style={{
              display:"flex",alignItems:"center",gap:10,marginBottom:8,
              padding:"8px 10px",background:C.surface,borderRadius:8,
              border:`1px solid ${busActive[i]?b.color+"44":C.border}`
            }}>
              <div style={{width:8,height:8,borderRadius:"50%",background:busActive[i]?b.color:C.muted,flexShrink:0}}/>
              <div style={{flex:1}}>
                <div style={{color:busActive[i]?b.color:C.muted,fontWeight:700,fontSize:11}}>{b.label}</div>
                <div style={{color:C.muted,fontSize:10}}>{b.dims}</div>
              </div>
              <div style={{color:busActive[i]?b.color:C.muted,fontWeight:700,fontSize:13}}>{fireCount[i]}</div>
            </div>
          ))}
          <div style={{marginTop:10,padding:"10px 12px",background:C.surface,borderRadius:8,border:`1px solid ${C.border}`}}>
            <div style={{color:C.phi,fontWeight:700,fontSize:11,marginBottom:6}}>φ-Scheduling Rule</div>
            <div style={{color:C.muted,fontSize:11,lineHeight:1.7}}>
              Each bus fires at rate inversely proportional to its dimensional gap.
              EB1 (vacuum, D1↔D2) is fastest. EB5 (noetic, D5↔D7) is slowest.
              Total throughput = φ-weighted harmonic sum.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// MAIN APP
// ══════════════════════════════════════════════════════════════════════════════
const TABS = [
  {id:"dim",  label:"D1–D7 Navigator", color:C.d1},
  {id:"coll", label:"Bubble Collider", color:C.d6},
  {id:"cons", label:"Field Consensus", color:C.d3},
  {id:"bus",  label:"Event Bus", color:C.d4},
];

export default function GufFlagshipPage(){
  const [tab,setTab]=useState("dim");
  return (
    <div style={{minHeight:"100vh",background:C.bg,color:C.text,fontFamily:"Arial,sans-serif",padding:20}}>
      {/* Header */}
      <div style={{textAlign:"center",marginBottom:22}}>
        <div style={{
          display:"inline-block",padding:"4px 16px",borderRadius:20,
          background:`${C.phi}22`,border:`1px solid ${C.phi}66`,
          color:C.phi,fontSize:11,fontWeight:700,letterSpacing:"0.12em",marginBottom:10
        }}>GRAND UNIFIED FRAMEWORK · GUF 2026</div>
        <div style={{fontSize:24,fontWeight:800,letterSpacing:1,
          background:`linear-gradient(90deg,${C.d1},${C.d2},${C.d4},${C.d6})`,
          WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent"}}>
          φ-Dimensional Engine
        </div>
        <div style={{color:C.muted,fontSize:12,marginTop:4}}>
          D1–D7 · Five Event Buses · Emergent Bubble Dynamics · Field Consensus Protocol
        </div>
      </div>

      <TabBar tabs={TABS} active={tab} onChange={setTab}/>

      <div style={{
        background:C.panel,borderRadius:16,
        border:`1px solid ${C.border}`,
        padding:20,maxWidth:960,margin:"0 auto"
      }}>
        {tab==="dim"  && <DimNavigator/>}
        {tab==="coll" && <BubbleCollider/>}
        {tab==="cons" && <FieldConsensus/>}
        {tab==="bus"  && <EventBusDash/>}
      </div>

      <div style={{textAlign:"center",marginTop:18,color:C.muted,fontSize:11}}>
        Shia Miller · GUF Interactive Engine · 2026 &nbsp;·&nbsp; φ = {PHI.toFixed(8)}
      </div>
    </div>
  );
}
