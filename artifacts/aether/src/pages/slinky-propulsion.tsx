import { useEffect, useRef, useState } from "react";
import { Link } from "wouter";
import imgSlinky from "@assets/F4DC77FE-F441-4262-96DD-2F6141C81AB6_1783105484756.png";

const BG="#04060d",PAN="#0a0d1a",PAN2="#0d1020",BORDER="#182038",TEXT="#b8cce8",MUTED="#5a6e8c";
const GOLD="#ffb830",CYAN="#3fd8d0",VIOLET="#a87aff",GREEN="#50d49a",BLUE="#4ab0ff";
function hexA(h:string,a:number){
  const r=parseInt(h.slice(1,3),16),g=parseInt(h.slice(3,5),16),b=parseInt(h.slice(5,7),16);
  return `rgba(${r},${g},${b},${a})`;
}

// ── Slinky Ring Array simulation ─────────────────────────────────────────────
function SlinkyRingSim(){
  const cvRef=useRef<HTMLCanvasElement>(null);
  const phaseRef=useRef(0);
  const intensRef=useRef(0.6);
  const freqRef=useRef(1.0);
  const playRef=useRef(true);
  const curveSpan=useRef<HTMLSpanElement>(null);
  const dirSpan=useRef<HTMLSpanElement>(null);
  const waveSpan=useRef<HTMLSpanElement>(null);
  const [phase,setPhase]=useState(0);
  const [intens,setIntens]=useState(0.6);
  const [freq,setFreq]=useState(1.0);
  const [playing,setPlaying]=useState(true);
  useEffect(()=>{phaseRef.current=phase;},[phase]);
  useEffect(()=>{intensRef.current=intens;},[intens]);
  useEffect(()=>{freqRef.current=freq;},[freq]);
  useEffect(()=>{playRef.current=playing;},[playing]);

  useEffect(()=>{
    const cv=cvRef.current; if(!cv) return;
    const ctx=cv.getContext("2d"); if(!ctx) return;
    let raf=0,t=0,lastW=0;
    const reduced=window.matchMedia&&window.matchMedia("(prefers-reduced-motion:reduce)").matches;
    const RINGS=10;

    const loop=()=>{
      const dpr=Math.min(2,window.devicePixelRatio||1);
      const W=cv.clientWidth||640,H=400;
      if(W!==lastW){cv.width=Math.round(W*dpr);cv.height=Math.round(H*dpr);lastW=W;}
      ctx.setTransform(dpr,0,0,dpr,0,0);
      if(playRef.current&&!reduced) t+=0.018;

      ctx.fillStyle=BG; ctx.fillRect(0,0,W,H);

      const ph=phaseRef.current*(Math.PI/2);
      const ins=intensRef.current;
      const fq=freqRef.current;
      const cx=W/2;

      // space-time curvature grid (bottom half)
      ctx.strokeStyle=hexA(BLUE,0.12); ctx.lineWidth=1;
      const gridY0=H*0.55, gridYW=H*0.43;
      for(let gx=0;gx<W;gx+=36){
        const dy=ins*24*Math.sin((gx/W)*Math.PI*3+t*0.8+ph)*Math.exp(-Math.pow((gx-cx)/cx,2)*1.2);
        ctx.beginPath(); ctx.moveTo(gx,gridY0); ctx.lineTo(gx,gridY0+gridYW+dy); ctx.stroke();
      }
      for(let gy=0;gy<8;gy++){
        const frac=gy/7;
        const baseY=gridY0+frac*gridYW;
        ctx.beginPath();
        for(let gx=0;gx<=W;gx+=8){
          const dy=ins*20*Math.sin((gx/W)*Math.PI*3+t*0.8+ph)*Math.exp(-Math.pow((gx-cx)/cx,2)*1.2)*(1-frac);
          const y=baseY+dy;
          gx===0?ctx.moveTo(gx,y):ctx.lineTo(gx,y);
        }
        ctx.stroke();
      }

      // ring stack
      const stackTop=H*0.04, stackH=H*0.52;
      for(let i=0;i<RINGS;i++){
        const fi=i/(RINGS-1);
        const ry=stackTop+fi*stackH;
        const ringPhase=ph+i*0.38;
        const radX=W*0.28+ins*12*Math.sin(t*fq+i*0.5);
        const radY=10+ins*6*Math.abs(Math.sin(i*0.4));

        // glow
        const grd=ctx.createRadialGradient(cx,ry,0,cx,ry,radX);
        const gAlpha=0.04+ins*0.06*Math.abs(Math.sin(t*fq+i*0.6));
        grd.addColorStop(0,hexA(CYAN,gAlpha));
        grd.addColorStop(0.6,hexA(GOLD,gAlpha*0.6));
        grd.addColorStop(1,hexA(CYAN,0));
        ctx.fillStyle=grd;
        ctx.beginPath(); ctx.ellipse(cx,ry,radX+20,radY+8,0,0,Math.PI*2); ctx.fill();

        // ring body (3 bands)
        const colors=[GOLD,CYAN,VIOLET];
        const ringWidths=[4,3,2];
        for(let b=0;b<3;b++){
          const pulse=0.5+0.5*Math.sin(t*fq*1.4+i*0.55+b*1.2+ringPhase);
          ctx.strokeStyle=hexA(colors[b],0.4+pulse*0.5);
          ctx.lineWidth=ringWidths[b];
          ctx.beginPath(); ctx.ellipse(cx,ry,radX-b*4,radY-b*1.5,0,0,Math.PI*2); ctx.stroke();
        }

        // plasma sparks on ring
        for(let sp=0;sp<8;sp++){
          const sa=(sp/8)*Math.PI*2+t*fq*0.5+i*0.3;
          const sx=cx+Math.cos(sa)*radX,sy=ry+Math.sin(sa)*radY;
          const spark=0.4+0.6*Math.abs(Math.sin(sa*3+t*2));
          ctx.beginPath(); ctx.arc(sx,sy,2.5*spark,0,Math.PI*2);
          ctx.fillStyle=hexA(GOLD,spark*0.9); ctx.fill();
        }
      }

      // longitudinal standing plasma wave through ring centres
      ctx.strokeStyle=hexA(CYAN,0.5); ctx.lineWidth=2.5;
      ctx.beginPath();
      for(let py=0;py<=RINGS*3;py++){
        const fy=py/(RINGS*3);
        const y=stackTop+fy*stackH;
        const x=cx+ins*32*Math.sin(fy*Math.PI*3*fq+t*1.5+ph);
        py===0?ctx.moveTo(x,y):ctx.lineTo(x,y);
      }
      ctx.stroke();
      // wave glow
      ctx.strokeStyle=hexA(CYAN,0.18); ctx.lineWidth=8;
      ctx.beginPath();
      for(let py=0;py<=RINGS*3;py++){
        const fy=py/(RINGS*3);
        const y=stackTop+fy*stackH;
        const x=cx+ins*32*Math.sin(fy*Math.PI*3*fq+t*1.5+ph);
        py===0?ctx.moveTo(x,y):ctx.lineTo(x,y);
      }
      ctx.stroke();

      // direction indicator arrow
      const arrowAng=ph;
      const arrowLen=36*ins;
      const ax=cx+Math.sin(arrowAng)*arrowLen;
      const ay=H*0.78;
      ctx.strokeStyle=hexA(GOLD,0.8); ctx.lineWidth=2;
      ctx.beginPath(); ctx.moveTo(cx,ay); ctx.lineTo(ax,ay); ctx.stroke();
      ctx.fillStyle=hexA(GOLD,0.8);
      ctx.beginPath(); ctx.moveTo(ax,ay-5); ctx.lineTo(ax+6*Math.sign(Math.sin(arrowAng)),ay); ctx.lineTo(ax,ay+5); ctx.fill();

      // readouts
      const curv=(ins*Math.cos(ph)*100).toFixed(0);
      const dir=ph<-0.05?"LEFT":ph>0.05?"RIGHT":"STRAIGHT";
      const wm=("mode-"+(Math.round(fq*2)+1));
      if(curveSpan.current) curveSpan.current.textContent=curv;
      if(dirSpan.current) dirSpan.current.textContent=dir;
      if(waveSpan.current) waveSpan.current.textContent=wm;

      raf=requestAnimationFrame(loop);
    };
    raf=requestAnimationFrame(loop);
    return ()=>cancelAnimationFrame(raf);
  },[]);

  return (
    <div>
      <canvas ref={cvRef} style={{width:"100%",height:400,borderRadius:8,display:"block"}} />
      <div style={{marginTop:12,display:"flex",gap:18,flexWrap:"wrap",alignItems:"flex-end"}}>
        <label style={{flex:1,minWidth:160,color:TEXT,fontSize:12,fontFamily:"monospace"}}>
          Ring phase offset ({(phase*(90)).toFixed(0)}\u00b0)
          <input type="range" min={-1} max={1} step={0.01} value={phase}
            onChange={e=>{const v=+e.target.value;setPhase(v);phaseRef.current=v;}}
            style={{display:"block",width:"100%",marginTop:4}} />
        </label>
        <label style={{flex:1,minWidth:160,color:TEXT,fontSize:12,fontFamily:"monospace"}}>
          Plasma intensity
          <input type="range" min={0.1} max={1} step={0.01} value={intens}
            onChange={e=>{const v=+e.target.value;setIntens(v);intensRef.current=v;}}
            style={{display:"block",width:"100%",marginTop:4}} />
        </label>
        <label style={{flex:1,minWidth:160,color:TEXT,fontSize:12,fontFamily:"monospace"}}>
          Harmonic frequency
          <input type="range" min={0.3} max={2.5} step={0.1} value={freq}
            onChange={e=>{const v=+e.target.value;setFreq(v);freqRef.current=v;}}
            style={{display:"block",width:"100%",marginTop:4}} />
        </label>
        <button onClick={()=>setPlaying(p=>!p)}
          style={{background:PAN2,border:"1px solid "+BORDER,color:TEXT,
            borderRadius:6,padding:"6px 16px",cursor:"pointer",fontFamily:"monospace",fontSize:12}}>
          {playing?"Pause":"Play"}
        </button>
      </div>
      <div style={{display:"flex",gap:20,flexWrap:"wrap",marginTop:10,fontFamily:"monospace",fontSize:12}}>
        <span style={{color:MUTED}}>Curvature <span ref={curveSpan} style={{color:CYAN}}>0</span></span>
        <span style={{color:MUTED}}>Direction <span ref={dirSpan} style={{color:GOLD}}>STRAIGHT</span></span>
        <span style={{color:MUTED}}>Wave <span ref={waveSpan} style={{color:VIOLET}}>mode-2</span></span>
      </div>
    </div>
  );
}

export default function SlinkyPropulsionPage(){
  const sec:React.CSSProperties={background:PAN,border:"1px solid "+BORDER,borderRadius:12,padding:20,marginBottom:22};
  const secLabel:React.CSSProperties={fontFamily:"monospace",fontSize:10,letterSpacing:2,color:MUTED,textTransform:"uppercase",marginBottom:12};
  const card:React.CSSProperties={background:PAN2,border:"1px solid "+BORDER,borderRadius:8,padding:14};

  const rings=[
    {n:1,label:"Stabilization Ring",col:hexA(GOLD,0.9),desc:"Maintains structural integrity and field symmetry across the entire array"},
    {n:2,label:"Magneto-Inertial Ring",col:CYAN,desc:"Shapes and contains the plasma flux within the toroidal harmonic boundary"},
    {n:3,label:"Fusion Reactor Ring",col:VIOLET,desc:"Generates high-energy plasma via Deuterium-Helium-3 fusion reaction"},
    {n:4,label:"Harmonic Coupling Ring",col:GREEN,desc:"Synchronizes phase between adjacent Slinky coils for coherent wave propagation"},
    {n:5,label:"Field Shaping Ring",col:BLUE,desc:"Focuses the curvature gradient for directed propulsion — steers the space-time surf"},
    {n:6,label:"Base Thruster Array",col:hexA(GOLD,0.7),desc:"Vector control and attitude adjustment for precision maneuvering"},
  ];

  const steps=[
    {n:"01",txt:"Plasma fusion sustains stable, high-energy density within the toroidal core"},
    {n:"02",txt:"Energy is injected into the Slinky ring array, exciting the harmonic cascade"},
    {n:"03",txt:"Rings create a standing plasma wave — the longitudinal Slinky bending mode"},
    {n:"04",txt:"The wave modulates local space-time curvature along the vehicle axis"},
    {n:"05",txt:"Vehicle is carried along the curvature gradient — riding the shape of space-time"},
  ];

  const specs=[
    {label:"Height",val:"220 m"},{label:"Diameter",val:"160 m"},
    {label:"Mass",val:"75,000 t"},{label:"Fusion Output",val:"9.2 TW"},
    {label:"Max Velocity",val:"0.25c"},{label:"Range",val:"Unlimited*"},
    {label:"Crew",val:"12\u201350"},{label:"Power Plant",val:"D-\u00b3He Fusion"},
  ];

  const beyond=[
    "Instantaneous orbital insertion",
    "Gravity well manipulation",
    "Wormhole stabilization",
    "Interstellar gates",
    "Megastructure construction",
  ];

  return (
    <div style={{minHeight:"100vh",background:BG,color:TEXT,padding:"40px 20px 80px",fontFamily:"'Inter',system-ui,sans-serif"}}>
      <div style={{maxWidth:1040,margin:"0 auto"}}>

        <p style={{fontFamily:"monospace",fontSize:11,letterSpacing:2,color:MUTED,textTransform:"uppercase",marginBottom:8}}>
          AETHER · Space-Time Propulsion
        </p>
        <h1 style={{fontSize:"clamp(22px,4vw,34px)",fontWeight:700,
          background:"linear-gradient(90deg,"+GOLD+","+CYAN+","+VIOLET+")",
          WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent",marginBottom:8}}>
          Slinky Propulsion · Plasma Fusion Space Race Rings
        </h1>
        <p style={{color:MUTED,fontFamily:"monospace",fontSize:13,marginBottom:6}}>
          Floating in Space-Time · Toroidal Harmonic Generators · Curvature-Riding Propulsion
        </p>
        <p style={{color:hexA(GOLD,0.7),fontFamily:"monospace",fontSize:12,marginBottom:32,fontStyle:"italic"}}>
          "The future doesn't just move forward. It rides the shape of space-time."
        </p>

        {/* Blueprint image */}
        <div style={sec}>
          <p style={secLabel}>01 · System Blueprint · Slinky Ring Array</p>
          <img src={imgSlinky} alt="Slinky Propulsion blueprint — Plasma Fusion Space Race Rings"
            style={{width:"100%",borderRadius:8,display:"block",maxHeight:560,objectFit:"contain",background:PAN2,marginBottom:16}} />
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
            <div style={card}>
              <p style={{color:CYAN,fontFamily:"monospace",fontSize:11,letterSpacing:1,textTransform:"uppercase",marginBottom:8}}>Core Principle</p>
              <p style={{color:TEXT,fontSize:13,lineHeight:1.7}}>
                Slinky rings generate standing fusion plasma waves that create controlled space-time gradients. By modulating ring phase, we "ride the wave" of curvature — enabling ultra-fast, inertialess propulsion.
              </p>
            </div>
            <div style={card}>
              <p style={{color:GOLD,fontFamily:"monospace",fontSize:11,letterSpacing:1,textTransform:"uppercase",marginBottom:8}}>The Slinky Effect</p>
              <p style={{color:TEXT,fontSize:13,lineHeight:1.7}}>
                A harmonic cascade through ring-coupled plasma creates a longitudinal wave that propagates bending energy through space-time — analogous to a mechanical Slinky, but in the fabric of spacetime itself.
              </p>
            </div>
          </div>
        </div>

        {/* Live sim */}
        <div style={sec}>
          <p style={secLabel}>02 · Live Ring Array Simulation · Standing Plasma Wave</p>
          <SlinkyRingSim />
          <p style={{color:MUTED,fontSize:12,marginTop:10,fontFamily:"monospace",lineHeight:1.6}}>
            Phase offset \u2212 steer left/right · Intensity = curvature gradient magnitude · Frequency = harmonic mode of standing wave · Grid below = space-time curvature distortion
          </p>
        </div>

        {/* Ring components */}
        <div style={sec}>
          <p style={secLabel}>03 · Ring System Components</p>
          <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(240px,1fr))",gap:12}}>
            {rings.map(r=>(
              <div key={r.n} style={{...card,borderColor:hexA(r.col,0.35)}}>
                <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:8}}>
                  <span style={{color:r.col,fontFamily:"monospace",fontSize:13,fontWeight:700}}>{r.n}.</span>
                  <span style={{color:r.col,fontSize:13,fontWeight:600}}>{r.label}</span>
                </div>
                <p style={{color:MUTED,fontSize:12,lineHeight:1.6}}>{r.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* How it works */}
        <div style={sec}>
          <p style={secLabel}>04 · How It Works · 5-Step Propulsion Sequence</p>
          <div style={{display:"flex",flexDirection:"column",gap:10}}>
            {steps.map(s=>(
              <div key={s.n} style={{...card,display:"flex",alignItems:"flex-start",gap:16}}>
                <span style={{color:GOLD,fontFamily:"monospace",fontSize:16,fontWeight:700,minWidth:28}}>{s.n}</span>
                <p style={{color:TEXT,fontSize:13,lineHeight:1.6,margin:0}}>{s.txt}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Specs + Beyond */}
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:16,marginBottom:22}}>
          <div style={sec}>
            <p style={secLabel}>05A · Specifications (Typical)</p>
            <table style={{width:"100%",borderCollapse:"collapse",fontSize:13}}>
              <tbody>
                {specs.map(s=>(
                  <tr key={s.label}>
                    <td style={{color:MUTED,fontFamily:"monospace",fontSize:12,padding:"6px 0",borderBottom:"1px solid "+hexA(BORDER,0.5)}}>{s.label}</td>
                    <td style={{color:GOLD,fontFamily:"monospace",fontSize:12,textAlign:"right",padding:"6px 0",borderBottom:"1px solid "+hexA(BORDER,0.5)}}>{s.val}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <p style={{color:hexA(MUTED,0.6),fontSize:11,fontFamily:"monospace",marginTop:8}}>* Limited only by system integrity and fuel availability</p>
          </div>
          <div style={sec}>
            <p style={secLabel}>05B · Beyond Propulsion</p>
            <div style={{display:"flex",flexDirection:"column",gap:10}}>
              {beyond.map(b=>(
                <div key={b} style={{...card,display:"flex",alignItems:"center",gap:12}}>
                  <span style={{color:CYAN,fontFamily:"monospace",fontSize:14}}>+</span>
                  <span style={{color:TEXT,fontSize:13}}>{b}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Space-time curvature concept */}
        <div style={sec}>
          <p style={secLabel}>06 · Space-Time Curvature Riding · The Navigation Principle</p>
          <p style={{color:TEXT,fontSize:14,lineHeight:1.7,marginBottom:16}}>
            Instead of pushing against space, Slinky Propulsion surfs the crests of engineered curvature waves. Ring phase control (-90\u00b0 to +90\u00b0) steers the curvature gradient: phase left \u2192 LEFT turn, phase right \u2192 RIGHT turn, neutral \u2192 STRAIGHT. The vehicle itself is inertialess relative to the local space-time frame it is riding.
          </p>
          <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:12}}>
            {[
              {label:"\u221290\u00b0 LEFT",col:CYAN,note:"Leading curvature shifts left — vehicle turns port"},
              {label:"0\u00b0 STRAIGHT",col:GOLD,note:"Symmetric curvature — straight-line acceleration"},
              {label:"+90\u00b0 RIGHT",col:VIOLET,note:"Leading curvature shifts right — vehicle turns starboard"},
            ].map(d=>(
              <div key={d.label} style={{...card,textAlign:"center",borderColor:hexA(d.col,0.3)}}>
                <p style={{color:d.col,fontFamily:"monospace",fontSize:16,fontWeight:700,marginBottom:6}}>{d.label}</p>
                <p style={{color:MUTED,fontSize:12}}>{d.note}</p>
              </div>
            ))}
          </div>
        </div>

        <div style={{marginTop:36,paddingTop:20,borderTop:"1px solid "+BORDER,
          fontFamily:"monospace",fontSize:12,color:MUTED,display:"flex",gap:24,flexWrap:"wrap"}}>
          <Link href="/synaptic-entropy" style={{color:CYAN,textDecoration:"none"}}>\u2192 Synaptic Entropy Engine</Link>
          <Link href="/compact-fusion" style={{color:CYAN,textDecoration:"none"}}>\u2192 Compact Fusion Reactor</Link>
          <Link href="/warp-bubble-engine" style={{color:CYAN,textDecoration:"none"}}>\u2192 Warp Bubble Engine</Link>
          <Link href="/" style={{color:MUTED,textDecoration:"none"}}>\u2192 Knowledge Graph</Link>
        </div>
      </div>
    </div>
  );
}
