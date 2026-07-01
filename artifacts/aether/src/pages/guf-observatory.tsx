import { useState, useEffect, useRef } from "react";

const PHI = 1.6180339887;
const TAU = Math.PI * 2;

const C = {
  bg:"#05071a", surface:"#090d20", panel:"#0c1228", border:"#162048",
  d1:"#00e5ff", d2:"#7c4dff", d3:"#69f0ae", d4:"#ffd740",
  d5:"#ff6d00", d6:"#ff4081", d7:"#b2ff59", phi:"#ffd740",
  text:"#dce8ff", muted:"#4a6890", accent:"#4fc3f7",
};

const DIMS = [
  {id:"D1",label:"Substrate", color:C.d1, freq:1,           desc:"Zero-point vacuum field"},
  {id:"D2",label:"Coherence", color:C.d2, freq:PHI,         desc:"Vortical phase-locking"},
  {id:"D3",label:"Form",      color:C.d3, freq:PHI**2,      desc:"Geometric crystallization"},
  {id:"D4",label:"Time",      color:C.d4, freq:PHI**3,      desc:"φ-scheduled sequencing"},
  {id:"D5",label:"Life",      color:C.d5, freq:PHI**4,      desc:"CLA autocatalytic loops"},
  {id:"D6",label:"Mind",      color:C.d6, freq:PHI**5,      desc:"Holographic self-model"},
  {id:"D7",label:"Unity",     color:C.d7, freq:PHI**6,      desc:"Non-local Ptah operator"},
];

const BUSES = [
  {id:"EB1",label:"Vacuum",    color:C.d1, d0:0,d1:1, rate:0.90},
  {id:"EB2",label:"Geometric", color:C.d3, d0:1,d1:2, rate:0.65},
  {id:"EB3",label:"Temporal",  color:C.d4, d0:2,d1:3, rate:0.45},
  {id:"EB4",label:"Biotic",    color:C.d5, d0:3,d1:4, rate:0.28},
  {id:"EB5",label:"Noetic",    color:C.d6, d0:4,d1:6, rate:0.14},
];

function lerp(a,b,t){return a+(b-a)*t;}
function clamp(v,lo,hi){return Math.max(lo,Math.min(hi,v));}
function fmt(n,d=2){return n.toFixed(d);}

// ── φ CLOCK ──────────────────────────────────────────────────────────────────
function PhiClock({t}){
  const size=90, cx=size/2, cy=size/2, r=38;
  const rings=[{r:38,freq:1},{r:28,freq:PHI},{r:18,freq:PHI**2}];
  return (
    <svg width={size} height={size} style={{display:"block"}}>
      {rings.map((rg,i)=>{
        const a=((t*rg.freq*0.12)%1)*TAU - TAU/4;
        const hx=cx+Math.cos(a)*rg.r, hy=cy+Math.sin(a)*rg.r;
        return (
          <g key={i}>
            <circle cx={cx} cy={cy} r={rg.r} fill="none"
              stroke={[C.d1,C.d2,C.d4][i]} strokeWidth="0.8" strokeOpacity="0.3"/>
            <circle cx={hx} cy={hy} r={4-i*0.8} fill={[C.d1,C.d2,C.d4][i]} opacity={0.9-i*0.1}/>
          </g>
        );
      })}
      <circle cx={cx} cy={cy} r={5} fill={C.phi}/>
      <text x={cx} y={cy+1} textAnchor="middle" dominantBaseline="middle"
        fontSize="5" fontWeight="bold" fill={C.bg}>φ</text>
    </svg>
  );
}

// ── DIMENSIONAL SPINE CANVAS ─────────────────────────────────────────────────
function DimSpine({t, health}){
  const cvRef=useRef(null);
  useEffect(()=>{
    const cv=cvRef.current; if(!cv) return;
    const ctx=cv.getContext("2d");
    const W=cv.width,H=cv.height;
    ctx.clearRect(0,0,W,H);
    const nodeY=i=>30+i*(H-60)/6;

    // spine line
    const grad=ctx.createLinearGradient(W/2,0,W/2,H);
    DIMS.forEach((d,i)=>grad.addColorStop(i/6,d.color));
    ctx.beginPath();
    ctx.moveTo(W/2,nodeY(0));
    ctx.lineTo(W/2,nodeY(6));
    ctx.strokeStyle=grad; ctx.lineWidth=2; ctx.stroke();

    // bus connectors
    BUSES.forEach(b=>{
      const y0=nodeY(b.d0), y1=nodeY(b.d1), my=(y0+y1)/2;
      ctx.beginPath();
      ctx.moveTo(W/2,y0); ctx.bezierCurveTo(W/2+18,y0,W/2+18,y1,W/2,y1);
      ctx.strokeStyle=`${b.color}55`; ctx.lineWidth=1.5; ctx.stroke();
      // packet
      const prog=((t*b.rate*0.3)%1);
      const py=lerp(y0,y1,prog);
      ctx.beginPath(); ctx.arc(W/2+10,py,3,0,TAU);
      ctx.fillStyle=b.color; ctx.fill();
    });

    // nodes
    DIMS.forEach((d,i)=>{
      const ny=nodeY(i);
      const h=health[i];
      const pulse=0.7+0.3*Math.sin(t*d.freq*0.4+i);
      // glow
      ctx.save(); ctx.globalAlpha=0.18*pulse*h;
      ctx.beginPath(); ctx.arc(W/2,ny,14,0,TAU);
      ctx.fillStyle=d.color; ctx.fill(); ctx.restore();
      // ring
      ctx.beginPath(); ctx.arc(W/2,ny,9,0,TAU);
      ctx.strokeStyle=d.color; ctx.lineWidth=1.5*h; ctx.stroke();
      // fill
      ctx.beginPath(); ctx.arc(W/2,ny,6,0,TAU);
      ctx.fillStyle=`${d.color}${Math.round(h*200).toString(16).padStart(2,'0')}`; ctx.fill();
      // label
      ctx.font="bold 9px Arial"; ctx.fillStyle=d.color;
      ctx.textAlign="right"; ctx.textBaseline="middle";
      ctx.fillText(d.id, W/2-14, ny);
    });
  },[t,health]);
  return <canvas ref={cvRef} width={70} height={260}
    style={{display:"block",background:"transparent"}}/>;
}

// ── HLV VACUUM WAVE CANVAS ───────────────────────────────────────────────────
function HLVWave({t, amplitude}){
  const cvRef=useRef(null);
  useEffect(()=>{
    const cv=cvRef.current; if(!cv) return;
    const ctx=cv.getContext("2d");
    const W=cv.width,H=cv.height,cy=H/2;
    ctx.clearRect(0,0,W,H);
    // grid
    ctx.strokeStyle="rgba(22,32,72,0.6)"; ctx.lineWidth=1;
    for(let x=0;x<W;x+=20){ctx.beginPath();ctx.moveTo(x,0);ctx.lineTo(x,H);ctx.stroke();}
    ctx.beginPath();ctx.moveTo(0,cy);ctx.lineTo(W,cy);ctx.stroke();

    // HLV modes (Helical Lattice Vacuum)
    const modes=[
      {freq:1,    amp:0.35, color:C.d1, dash:[]},
      {freq:PHI,  amp:0.22, color:C.d2, dash:[4,4]},
      {freq:PHI**2,amp:0.15,color:C.d4, dash:[2,6]},
    ];
    modes.forEach(m=>{
      ctx.beginPath();
      ctx.setLineDash(m.dash);
      for(let x=0;x<=W;x+=2){
        const phase=(x/W)*TAU*m.freq*3 - t*m.freq*0.8;
        const y=cy + Math.sin(phase)*m.amp*H*amplitude;
        x===0? ctx.moveTo(x,y):ctx.lineTo(x,y);
      }
      ctx.strokeStyle=m.color; ctx.lineWidth=1.5; ctx.stroke();
      ctx.setLineDash([]);
    });

    // Kelvin vortex markers
    for(let i=0;i<5;i++){
      const vx=((t*0.3+i*0.2)%1)*W;
      const vy=cy+Math.sin(i*1.3)*18;
      ctx.save(); ctx.globalAlpha=0.5;
      ctx.beginPath(); ctx.arc(vx,vy,6,0,TAU);
      ctx.strokeStyle=C.d3; ctx.lineWidth=1; ctx.stroke();
      ctx.beginPath(); ctx.arc(vx,vy,2,0,TAU);
      ctx.fillStyle=C.d3; ctx.fill();
      ctx.restore();
    }

    // Ptah operator label
    ctx.font="bold 9px Arial"; ctx.fillStyle=C.d4;
    ctx.textAlign="left"; ctx.textBaseline="top";
    ctx.fillText(`Ψ_HLV · Kelvin∮ · φ-mod=${fmt(amplitude*PHI,3)}`,4,4);
  },[t,amplitude]);
  return <canvas ref={cvRef} width={300} height={90}
    style={{borderRadius:8,background:C.bg,border:`1px solid ${C.border}`,display:"block"}}/>;
}

// ── CGL FIELD CANVAS ─────────────────────────────────────────────────────────
function CGLField({t}){
  const cvRef=useRef(null);
  const fieldRef=useRef(null);
  useEffect(()=>{
    const N=48;
    if(!fieldRef.current){
      fieldRef.current=Array.from({length:N},()=>Array.from({length:N},()=>({
        re:Math.random()*2-1, im:Math.random()*2-1
      })));
    }
  },[]);

  useEffect(()=>{
    const cv=cvRef.current; if(!cv||!fieldRef.current) return;
    const ctx=cv.getContext("2d");
    const W=cv.width,H=cv.height;
    const N=48, cs=W/N;
    // CGL step (simplified)
    const f=fieldRef.current;
    const alpha=0.5+0.3*Math.sin(t*0.2);
    const beta=0.5+0.3*Math.cos(t*0.17);
    for(let i=0;i<N;i++) for(let j=0;j<N;j++){
      const nb=[[-1,0],[1,0],[0,-1],[0,1]].map(([di,dj])=>
        f[(i+di+N)%N][(j+dj+N)%N]);
      const lapRe=nb.reduce((s,n)=>s+n.re,0)-4*f[i][j].re;
      const lapIm=nb.reduce((s,n)=>s+n.im,0)-4*f[i][j].im;
      const mod2=f[i][j].re**2+f[i][j].im**2;
      f[i][j].re+=0.12*(lapRe - alpha*f[i][j].re + beta*f[i][j].im - mod2*f[i][j].re)*0.18;
      f[i][j].im+=0.12*(lapIm - alpha*f[i][j].im - beta*f[i][j].re - mod2*f[i][j].im)*0.18;
    }
    // draw
    for(let i=0;i<N;i++) for(let j=0;j<N;j++){
      const mod=Math.sqrt(f[i][j].re**2+f[i][j].im**2);
      const phase=(Math.atan2(f[i][j].im,f[i][j].re)+Math.PI)/TAU;
      const hue=Math.round(phase*360);
      const light=Math.round(20+clamp(mod,0,1.5)*35);
      ctx.fillStyle=`hsl(${hue},80%,${light}%)`;
      ctx.fillRect(j*cs,i*cs,cs+0.5,cs+0.5);
    }
    // label
    ctx.font="bold 8px Arial"; ctx.fillStyle="rgba(255,255,255,0.6)";
    ctx.textAlign="left"; ctx.textBaseline="top";
    ctx.fillText(`CGL · α=${fmt(alpha)} β=${fmt(beta)}`,3,3);
  },[t]);
  return <canvas ref={cvRef} width={144} height={144}
    style={{borderRadius:8,border:`1px solid ${C.border}`,display:"block",imageRendering:"pixelated"}}/>;
}

// ── EUGACYCLE RING ────────────────────────────────────────────────────────────
function EugaCycle({t}){
  const size=144, cx=72, cy=72;
  const cycles=[
    {r:60,n:7, speed:0.05, color:C.d4,label:"Eugacycle"},
    {r:44,n:5, speed:0.08, color:C.d2,label:"Precession"},
    {r:28,n:3, speed:0.13, color:C.d1,label:"HLV"},
  ];
  return (
    <svg width={size} height={size} style={{display:"block",borderRadius:8,border:`1px solid ${C.border}`,background:C.bg}}>
      {cycles.map((cy2,ci)=>(
        <g key={ci}>
          <circle cx={cx} cy={cy} r={cy2.r} fill="none"
            stroke={cy2.color} strokeWidth="0.5" strokeOpacity="0.25"/>
          {Array.from({length:cy2.n},(_,i)=>{
            const a=(i/cy2.n)*TAU + t*cy2.speed;
            const nx=cx+Math.cos(a)*cy2.r, ny2=cy+Math.sin(a)*cy2.r;
            return (
              <g key={i}>
                <circle cx={nx} cy={ny2} r={3.5-ci*0.7} fill={cy2.color}
                  opacity={0.7+0.3*Math.sin(t*cy2.speed*PHI+i)}/>
              </g>
            );
          })}
        </g>
      ))}
      <circle cx={cx} cy={cy} r={6} fill={C.phi}/>
      <text x={cx} y={cy+1} textAnchor="middle" dominantBaseline="middle"
        fontSize="6" fontWeight="bold" fill={C.bg}>φ</text>
      <text x={cx} y={size-5} textAnchor="middle" fontSize="7" fill={C.muted}>Eugacycle</text>
    </svg>
  );
}

// ── COHERENCE METER ───────────────────────────────────────────────────────────
function CoherenceMeter({value, color, label}){
  const pct=clamp(value,0,1);
  const r=22, circ=TAU*r;
  const dash=circ*pct;
  return (
    <div style={{display:"flex",flexDirection:"column",alignItems:"center",gap:3}}>
      <svg width={56} height={56}>
        <circle cx={28} cy={28} r={r} fill="none" stroke={C.border} strokeWidth="3"/>
        <circle cx={28} cy={28} r={r} fill="none" stroke={color} strokeWidth="3"
          strokeDasharray={`${dash} ${circ}`}
          strokeDashoffset={circ/4}
          strokeLinecap="round"/>
        <text x={28} y={29} textAnchor="middle" dominantBaseline="middle"
          fontSize="9" fontWeight="bold" fill={color}>{Math.round(pct*100)}</text>
      </svg>
      <div style={{color:C.muted,fontSize:9,textAlign:"center"}}>{label}</div>
    </div>
  );
}

// ── BUBBLE MINI ───────────────────────────────────────────────────────────────
function BubbleMini({t}){
  const cvRef=useRef(null);
  const bRef=useRef({
    bubbles:[
      {x:60,y:60,r:30,vx:0.6,vy:0.3,phase:0,color:C.d1},
      {x:180,y:70,r:26,vx:-0.5,vy:0.4,phase:1,color:C.d6},
      {x:120,y:110,r:22,vx:0.3,vy:-0.6,phase:2,color:C.d3},
    ]
  });
  useEffect(()=>{
    const cv=cvRef.current; if(!cv) return;
    const ctx=cv.getContext("2d");
    const W=cv.width,H=cv.height;
    ctx.clearRect(0,0,W,H);
    const bs=bRef.current.bubbles;
    bs.forEach(b=>{
      b.x+=b.vx; b.y+=b.vy; b.phase+=0.03;
      if(b.x-b.r<0||b.x+b.r>W) b.vx*=-1;
      if(b.y-b.r<0||b.y+b.r>H) b.vy*=-1;
    });
    // interaction lines
    for(let i=0;i<bs.length;i++) for(let j=i+1;j<bs.length;j++){
      const d=Math.hypot(bs[i].x-bs[j].x,bs[i].y-bs[j].y);
      const sum=bs[i].r+bs[j].r;
      if(d<sum*2){
        const str=1-d/(sum*2);
        ctx.beginPath(); ctx.moveTo(bs[i].x,bs[i].y); ctx.lineTo(bs[j].x,bs[j].y);
        ctx.strokeStyle=`rgba(255,215,64,${str*0.4})`; ctx.lineWidth=str*2; ctx.stroke();
      }
    }
    bs.forEach(b=>{
      const nodes=6;
      ctx.beginPath(); ctx.arc(b.x,b.y,b.r,0,TAU);
      ctx.strokeStyle=b.color; ctx.lineWidth=1.5; ctx.stroke();
      ctx.beginPath(); ctx.arc(b.x,b.y,b.r,0,TAU);
      ctx.fillStyle=`${b.color}08`; ctx.fill();
      for(let i=0;i<nodes;i++){
        const a=(i/nodes)*TAU+b.phase;
        ctx.beginPath(); ctx.arc(b.x+Math.cos(a)*b.r, b.y+Math.sin(a)*b.r, 2.5,0,TAU);
        ctx.fillStyle=b.color; ctx.fill();
      }
    });
  },[t]);
  return <canvas ref={cvRef} width={250} height={150}
    style={{borderRadius:8,background:C.bg,border:`1px solid ${C.border}`,display:"block"}}/>;
}

// ── EVENT TICKER ──────────────────────────────────────────────────────────────
const EVENT_TYPES=[
  {bus:"EB1",msg:"Vacuum fluctuation detected on D1→D2",color:C.d1},
  {bus:"EB2",msg:"Geometric resonance lock D2↔D3",color:C.d3},
  {bus:"EB3",msg:"Temporal φ-gate opened D3→D4",color:C.d4},
  {bus:"EB4",msg:"CLA autocatalytic burst D4↔D5",color:C.d5},
  {bus:"EB5",msg:"Noetic echo collapse D5→D7",color:C.d6},
  {bus:"EB1",msg:"HLV mode-3 harmonic excited",color:C.d1},
  {bus:"EB3",msg:"Eugacycle precession tick τ=φ³",color:C.d4},
  {bus:"EB2",msg:"Platonic phase boundary formed",color:C.d3},
  {bus:"EB5",msg:"Ptah operator Ψ inverted",color:C.d7},
  {bus:"EB4",msg:"Bubble boundary consensus 94%",color:C.d5},
];

// ── MAIN OBSERVATORY ──────────────────────────────────────────────────────────
export default function GufObservatoryPage(){
  const tRef=useRef(0);
  const animRef=useRef(null);
  const [tick,setTick]=useState(0);
  const [health,setHealth]=useState(DIMS.map(()=>1));
  const [coherence,setCoherence]=useState(DIMS.map(d=>0.5+Math.random()*0.4));
  const [amplitude,setAmplitude]=useState(0.6);
  const [events,setEvents]=useState([]);
  const [totalFire,setTotalFire]=useState(0);
  const [phiCoherence,setPhiCoherence]=useState(0.78);
  const nextEvtRef=useRef(0);
  const fireRef=useRef(0);

  useEffect(()=>{
    const loop=()=>{
      tRef.current+=0.018;
      const t=tRef.current;

      // drift health & coherence
      if(Math.floor(t*10)!==Math.floor((t-0.018)*10)){
        setHealth(h=>h.map((v,i)=>clamp(v+0.003*Math.sin(t*DIMS[i].freq*0.3+i)-0.001,0.4,1)));
        setCoherence(c=>c.map((v,i)=>clamp(v+0.004*Math.sin(t*DIMS[i].freq*0.2+i*1.3),0.3,1)));
        setPhiCoherence(p=>clamp(p+0.002*Math.sin(t*0.15),0.6,0.98));
      }

      // spawn events
      if(t>nextEvtRef.current){
        nextEvtRef.current=t+0.8+Math.random()*1.2;
        const ev=EVENT_TYPES[Math.floor(Math.random()*EVENT_TYPES.length)];
        fireRef.current+=1;
        setTotalFire(fireRef.current);
        setEvents(es=>[{...ev,t:t.toFixed(1),id:Math.random()},...es].slice(0,12));
      }
      setTick(n=>n+1);
      animRef.current=requestAnimationFrame(loop);
    };
    animRef.current=requestAnimationFrame(loop);
    return()=>cancelAnimationFrame(animRef.current);
  },[]);

  const t=tRef.current;
  const avgCoherence=coherence.reduce((a,b)=>a+b,0)/7;

  return (
    <div style={{background:C.bg,color:C.text,fontFamily:"Arial,sans-serif",
      minHeight:"100vh",padding:14,boxSizing:"border-box"}}>

      {/* ── TOP BAR ── */}
      <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",
        marginBottom:14,flexWrap:"wrap",gap:10}}>
        <div>
          <div style={{fontSize:18,fontWeight:800,letterSpacing:1,
            background:`linear-gradient(90deg,${C.d1},${C.d2},${C.d4},${C.d6})`,
            WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent"}}>
            GUF OBSERVATORY
          </div>
          <div style={{color:C.muted,fontSize:10,marginTop:2}}>
            Grand Unified Framework · Live Monitoring · 2026
          </div>
        </div>
        <div style={{display:"flex",alignItems:"center",gap:14}}>
          <PhiClock t={t}/>
          <div>
            <div style={{color:C.phi,fontWeight:700,fontSize:11}}>φ-CLOCK</div>
            <div style={{color:C.muted,fontSize:10}}>t = {fmt(t,2)}</div>
            <div style={{color:C.d3,fontSize:10}}>FIRE #{totalFire}</div>
          </div>
          <div style={{padding:"6px 14px",borderRadius:8,background:`${C.d3}18`,
            border:`1px solid ${C.d3}55`}}>
            <div style={{color:C.muted,fontSize:9}}>SYSTEM</div>
            <div style={{color:C.d3,fontWeight:700,fontSize:13}}>LIVE</div>
          </div>
        </div>
      </div>

      {/* ── MAIN GRID ── */}
      <div style={{display:"grid",gridTemplateColumns:"70px 1fr",gap:12,marginBottom:12}}>

        {/* dim spine */}
        <div style={{background:C.panel,borderRadius:10,border:`1px solid ${C.border}`,
          padding:"8px 0",display:"flex",justifyContent:"center"}}>
          <DimSpine t={t} health={health}/>
        </div>

        {/* right column */}
        <div style={{display:"flex",flexDirection:"column",gap:10}}>

          {/* coherence meters row */}
          <div style={{background:C.panel,borderRadius:10,border:`1px solid ${C.border}`,padding:12}}>
            <div style={{color:C.muted,fontSize:10,fontWeight:700,letterSpacing:"0.1em",marginBottom:10}}>
              DIMENSIONAL COHERENCE
            </div>
            <div style={{display:"flex",gap:10,flexWrap:"wrap"}}>
              {DIMS.map((d,i)=>(
                <CoherenceMeter key={i} value={coherence[i]} color={d.color} label={d.id}/>
              ))}
              <div style={{display:"flex",flexDirection:"column",justifyContent:"center",
                borderLeft:`1px solid ${C.border}`,paddingLeft:14,marginLeft:4}}>
                <div style={{color:C.phi,fontWeight:700,fontSize:20}}>{fmt(phiCoherence*100,1)}%</div>
                <div style={{color:C.muted,fontSize:9}}>φ-Global</div>
                <div style={{color:C.muted,fontSize:9}}>coherence</div>
              </div>
            </div>
          </div>

          {/* health bars */}
          <div style={{background:C.panel,borderRadius:10,border:`1px solid ${C.border}`,padding:12}}>
            <div style={{color:C.muted,fontSize:10,fontWeight:700,letterSpacing:"0.1em",marginBottom:8}}>
              DIMENSIONAL HEALTH MONITOR
            </div>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"4px 20px"}}>
              {DIMS.map((d,i)=>(
                <div key={i} style={{display:"flex",alignItems:"center",gap:8}}>
                  <div style={{width:20,fontSize:9,color:d.color,fontWeight:700}}>{d.id}</div>
                  <div style={{flex:1,height:5,background:C.border,borderRadius:3,overflow:"hidden"}}>
                    <div style={{
                      height:"100%",borderRadius:3,background:d.color,
                      width:`${health[i]*100}%`,transition:"width 0.4s"
                    }}/>
                  </div>
                  <div style={{width:28,fontSize:9,color:d.color,textAlign:"right"}}>
                    {fmt(health[i]*100,0)}%
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ── MIDDLE ROW ── */}
      <div style={{display:"grid",gridTemplateColumns:"1fr auto auto",gap:12,marginBottom:12,alignItems:"start"}}>

        {/* HLV wave + controls */}
        <div style={{background:C.panel,borderRadius:10,border:`1px solid ${C.border}`,padding:12}}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:8}}>
            <div style={{color:C.muted,fontSize:10,fontWeight:700,letterSpacing:"0.1em"}}>
              HLV VACUUM WAVE · KELVIN VORTEX FIELD
            </div>
            <div style={{color:C.d4,fontSize:10}}>Ψ={fmt(amplitude*PHI,3)}</div>
          </div>
          <HLVWave t={t} amplitude={amplitude}/>
          <div style={{display:"flex",alignItems:"center",gap:10,marginTop:8}}>
            <span style={{color:C.muted,fontSize:10}}>Amplitude</span>
            <input type="range" min={0.1} max={1} step={0.01} value={amplitude}
              onChange={e=>setAmplitude(parseFloat(e.target.value))}
              style={{flex:1,accentColor:C.d1}}/>
            <span style={{color:C.d1,fontSize:10,minWidth:28}}>{fmt(amplitude,2)}</span>
          </div>
          <div style={{display:"flex",gap:12,marginTop:8}}>
            {[{color:C.d1,label:"Mode-1 (f=1)"},{color:C.d2,label:`Mode-φ (f=${fmt(PHI,3)})`},{color:C.d4,label:`Mode-φ² (f=${fmt(PHI**2,3)})`}].map((m,i)=>(
              <div key={i} style={{display:"flex",alignItems:"center",gap:4}}>
                <div style={{width:16,height:2,background:m.color}}/>
                <span style={{color:C.muted,fontSize:9}}>{m.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* CGL field */}
        <div style={{background:C.panel,borderRadius:10,border:`1px solid ${C.border}`,padding:12}}>
          <div style={{color:C.muted,fontSize:10,fontWeight:700,letterSpacing:"0.1em",marginBottom:8}}>
            CGL LATTICE
          </div>
          <CGLField t={t}/>
          <div style={{color:C.muted,fontSize:9,marginTop:6,textAlign:"center"}}>
            Complex Ginzburg–Landau
          </div>
        </div>

        {/* Eugacycle */}
        <div style={{background:C.panel,borderRadius:10,border:`1px solid ${C.border}`,padding:12}}>
          <div style={{color:C.muted,fontSize:10,fontWeight:700,letterSpacing:"0.1em",marginBottom:8}}>
            EUGACYCLE
          </div>
          <EugaCycle t={t}/>
          <div style={{color:C.muted,fontSize:9,marginTop:6,textAlign:"center"}}>
            Nested precessional timing
          </div>
        </div>
      </div>

      {/* ── BOTTOM ROW ── */}
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>

        {/* bubble field */}
        <div style={{background:C.panel,borderRadius:10,border:`1px solid ${C.border}`,padding:12}}>
          <div style={{color:C.muted,fontSize:10,fontWeight:700,letterSpacing:"0.1em",marginBottom:8}}>
            EMERGENT BUBBLE FIELD
          </div>
          <BubbleMini t={t}/>
          <div style={{display:"flex",gap:16,marginTop:8}}>
            {[{color:C.d1,label:"B1 · D1-substrate"},{color:C.d6,label:"B2 · D6-mind"},{color:C.d3,label:"B3 · D3-form"}].map((b,i)=>(
              <div key={i} style={{display:"flex",alignItems:"center",gap:5}}>
                <div style={{width:7,height:7,borderRadius:"50%",background:b.color}}/>
                <span style={{color:C.muted,fontSize:9}}>{b.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* event ticker */}
        <div style={{background:C.panel,borderRadius:10,border:`1px solid ${C.border}`,padding:12}}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:8}}>
            <div style={{color:C.muted,fontSize:10,fontWeight:700,letterSpacing:"0.1em"}}>LIVE EVENT BUS TICKER</div>
            <div style={{padding:"2px 8px",borderRadius:4,background:`${C.d3}22`,
              border:`1px solid ${C.d3}55`,color:C.d3,fontSize:9,fontWeight:700}}>
              {totalFire} events
            </div>
          </div>
          <div style={{maxHeight:180,overflowY:"auto",display:"flex",flexDirection:"column",gap:4}}>
            {events.map((e,i)=>(
              <div key={e.id} style={{
                display:"flex",alignItems:"center",gap:8,
                padding:"5px 8px",borderRadius:6,
                background:i===0?`${e.color}14`:"transparent",
                border:`1px solid ${i===0?e.color+"44":C.border+"44"}`,
                transition:"all 0.3s"
              }}>
                <div style={{width:5,height:5,borderRadius:"50%",background:e.color,flexShrink:0}}/>
                <div style={{color:C.muted,fontSize:9,minWidth:24}}>{e.bus}</div>
                <div style={{color:i===0?C.text:C.muted,fontSize:10,flex:1}}>{e.msg}</div>
                <div style={{color:C.muted,fontSize:9,flexShrink:0}}>t={e.t}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── FOOTER METRICS ── */}
      <div style={{display:"flex",gap:8,marginTop:12,flexWrap:"wrap"}}>
        {[
          {label:"Avg Coherence", value:`${fmt(avgCoherence*100,1)}%`,  color:C.accent},
          {label:"φ-Clock",       value:fmt(t,3),                        color:C.phi},
          {label:"D7 Health",     value:`${fmt(health[6]*100,0)}%`,      color:C.d7},
          {label:"HLV Ψ",         value:fmt(amplitude*PHI,4),            color:C.d1},
          {label:"EB5 Rate",      value:`${fmt(BUSES[4].rate*100,0)}%`,  color:C.d6},
          {label:"φ Global",      value:`${fmt(phiCoherence*100,1)}%`,  color:C.phi},
        ].map((m,i)=>(
          <div key={i} style={{flex:"1 1 80px",background:C.surface,borderRadius:8,
            padding:"8px 10px",border:`1px solid ${C.border}`}}>
            <div style={{color:C.muted,fontSize:9,marginBottom:3}}>{m.label}</div>
            <div style={{color:m.color,fontWeight:700,fontSize:15}}>{m.value}</div>
          </div>
        ))}
      </div>

      <div style={{textAlign:"center",marginTop:12,color:C.muted,fontSize:9}}>
        Shia Miller · GUF Observatory · 2026 &nbsp;·&nbsp; φ={PHI.toFixed(8)} &nbsp;·&nbsp; All systems nominal
      </div>
    </div>
  );
}
