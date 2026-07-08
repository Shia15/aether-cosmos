import { useEffect, useRef } from "react";
import { Link } from "wouter";

const BG="#04060d",PAN="#0a0d1a",PAN2="#0d1020",BORDER="#182038",TEXT="#b8cce8",MUTED="#5a6e8c";
const GOLD="#ffb830",CYAN="#3fd8d0",VIOLET="#a87aff",GREEN="#50d49a",BLUE="#4ab0ff",ROSE="#ff5a6a";

function hexA(h:string,a:number){const n=h.replace("#","");return `rgba(${parseInt(n.slice(0,2),16)},${parseInt(n.slice(2,4),16)},${parseInt(n.slice(4,6),16)},${a})`;}
function fitCanvas(cv:HTMLCanvasElement,ctx:CanvasRenderingContext2D){const dpr=Math.min(2,window.devicePixelRatio||1);const w=cv.clientWidth||640;const h=cv.clientHeight||320;cv.width=Math.round(w*dpr);cv.height=Math.round(h*dpr);ctx.setTransform(dpr,0,0,dpr,0,0);return{w,h};}

const PHASE_COLS=[CYAN,GREEN,GOLD,VIOLET,BLUE];
const PHASE_LABELS=["Σ Sense","Λ Deliver","α Activate","Φ Feedback","Θ Learn"];

/* Live five-phase recursive loop: a signal packet circulates through 5 nodes */
function FivePhaseCanvas(){
  const cvRef=useRef<HTMLCanvasElement|null>(null);
  const speedRef=useRef(1.0);
  useEffect(()=>{
    const cv=cvRef.current; if(!cv)return;
    const ctx=cv.getContext("2d"); if(!ctx)return;
    let raf=0,t=0;
    const loop=()=>{
      const{w,h}=fitCanvas(cv,ctx);
      t+=0.01*speedRef.current;
      ctx.clearRect(0,0,w,h); ctx.fillStyle=BG; ctx.fillRect(0,0,w,h);
      const cx=w/2, cy=h/2, R=Math.min(w,h)*0.32;
      const nodes:[number,number][]=[];
      for(let i=0;i<5;i++){
        const ang=-Math.PI/2+i*(Math.PI*2/5);
        nodes.push([cx+Math.cos(ang)*R,cy+Math.sin(ang)*R]);
      }
      // ring
      ctx.strokeStyle=hexA(MUTED,0.25); ctx.lineWidth=1;
      ctx.beginPath(); ctx.arc(cx,cy,R,0,Math.PI*2); ctx.stroke();
      // connecting arrows
      for(let i=0;i<5;i++){
        const a=nodes[i], b=nodes[(i+1)%5];
        ctx.strokeStyle=hexA(PHASE_COLS[i],0.4); ctx.lineWidth=2;
        ctx.beginPath(); ctx.moveTo(a[0],a[1]); ctx.lineTo(b[0],b[1]); ctx.stroke();
      }
      // nodes
      nodes.forEach((p,i)=>{
        const pulse=0.5+0.5*Math.sin(t*3-i*(Math.PI*2/5));
        ctx.fillStyle=hexA(PHASE_COLS[i],0.15+pulse*0.35);
        ctx.beginPath(); ctx.arc(p[0],p[1],22+pulse*4,0,Math.PI*2); ctx.fill();
        ctx.fillStyle=PHASE_COLS[i];
        ctx.beginPath(); ctx.arc(p[0],p[1],10,0,Math.PI*2); ctx.fill();
        ctx.fillStyle=hexA(PHASE_COLS[i],0.95); ctx.font="11px monospace"; ctx.textAlign="center";
        const lx=p[0]+(p[0]-cx)*0.28, ly=p[1]+(p[1]-cy)*0.28;
        ctx.fillText(PHASE_LABELS[i],lx,ly+3);
      });
      ctx.textAlign="left";
      // circulating packet
      const prog=(t*0.4)%1;
      const seg=Math.floor(prog*5), f=(prog*5)%1;
      const a=nodes[seg], b=nodes[(seg+1)%5];
      const px=a[0]+(b[0]-a[0])*f, py=a[1]+(b[1]-a[1])*f;
      ctx.fillStyle=GOLD; ctx.shadowColor=GOLD; ctx.shadowBlur=12;
      ctx.beginPath(); ctx.arc(px,py,6,0,Math.PI*2); ctx.fill(); ctx.shadowBlur=0;
      // center label
      ctx.fillStyle=hexA(TEXT,0.5); ctx.font="10px monospace"; ctx.textAlign="center";
      ctx.fillText("φ attractor", cx, cy-4);
      ctx.fillText("of the loop", cx, cy+10);
      ctx.textAlign="left";
      raf=requestAnimationFrame(loop);
    };
    raf=requestAnimationFrame(loop);
    return()=>cancelAnimationFrame(raf);
  },[]);
  return(
    <div>
      <canvas ref={cvRef} style={{width:"100%",height:320,display:"block",borderRadius:10,border:`1px solid ${BORDER}`}}/>
      <div style={{display:"flex",gap:20,marginTop:12,flexWrap:"wrap"}}>
        <label style={{fontFamily:"monospace",fontSize:11,color:MUTED}}>
          loop speed
          <input type="range" min={0.2} max={2.5} step={0.1} defaultValue={1.0}
            onChange={e=>(speedRef.current=parseFloat(e.target.value))}
            style={{marginLeft:8,accentColor:GOLD,width:120}}/>
        </label>
      </div>
      <div style={{fontFamily:"monospace",fontSize:11,color:MUTED,marginTop:8}}>
        Sense → Deliver → Activate → Feedback → Learn · any system that persists against entropy must instantiate all five phases
      </div>
    </div>
  );
}

const SCALES=[
  {n:1,name:"NV Quantum",sub:"Nitrogen-vacancy diamond lattice",metric:"T₂ coherence time (μs)",col:VIOLET},
  {n:2,name:"Cellular",sub:"Aqua CXE biosensor · hemoglobin · mitochondria",metric:"SpO₂, HRV, glucose",col:CYAN},
  {n:3,name:"Biological",sub:"Thyroid · T3/T4 · selenium deiodinase",metric:"fT3/rT3 ratio",col:GREEN},
  {n:4,name:"Family",sub:"Human network nodes; social coherence field",metric:"SUNRISE score",col:GOLD},
  {n:5,name:"Atmospheric",sub:"Global Electric Circuit; Schumann resonance",metric:"V/m field strength",col:BLUE},
  {n:6,name:"Plasma",sub:"Ionospheric plasma; Coulomb coupling",metric:"Plasma crystal %",col:"#e07aff"},
  {n:7,name:"Earth",sub:"Seismic field; soil conductivity; ocean circulation",metric:"EM gradient (μT)",col:"#4ad0ff"},
  {n:8,name:"Orbital",sub:"Satellite constellations; GPS timing; Golden Dome",metric:"Active satellite count",col:"#ffd060"},
  {n:9,name:"Cosmic",sub:"Solar F10.7 flux; sunspot cycle; galactic rays",metric:"F10.7 flux (SFU)",col:ROSE},
];

const CASCADE=[
  {icon:"☀",t:"Solar Activity",d:"F10.7 flux, Schwabe ~11-yr cycle → UV/EUV modulates stratospheric ozone → surface winds → ocean circulation",col:GOLD},
  {icon:"🌊",t:"Ocean Mixing & Upwelling",d:"Thermohaline circulation, iodate-rich deep water → phytoplankton haloperoxidase converts IO₃⁻ → bioavailable I⁻",col:BLUE},
  {icon:"🌿",t:"Marine Bioaccumulation",d:"Kelp concentrates 100–10,000× seawater iodine → volatile I₂, HOI, CH₃I deposit inland",col:GREEN},
  {icon:"⚗",t:"Thyroid T3/T4 Synthesis",d:"NIS symporter transport; DIO1/DIO2 selenium-dependent T4→T3 conversion — iodine is the system clock substrate",col:CYAN},
  {icon:"⚡",t:"Mitochondrial Biogenesis",d:"T3 binds TRα/TRβ, upregulates PGC-1α → OXPHOS efficiency → ATP output powers neural membrane potentials",col:VIOLET},
  {icon:"🧠",t:"Neural Coherence → Cognition",d:"ATP sets synaptic firing rate → neural coherence → cognition → behavior",col:ROSE},
];

const GRANGER=[
  {path:"Solar F10.7 → Iodine UIE",r:"F=20.34 (p<0.001) ✓",sig:"Significant · lags 1–4",col:GREEN},
  {path:"Iodine UIE → Obesity",r:"F=6.05 (p=0.020) ✓",sig:"Significant · lags 1–4",col:GREEN},
  {path:"Iodine UIE → Neurodegeneration",r:"F=12.41 (p<0.001) ✓",sig:"Significant · lags 1–4",col:GREEN},
  {path:"Solar F10.7 → Obesity (direct)",r:"F=2.12 (p=0.156) ✗",sig:"NOT significant — mediation confirmed",col:ROSE},
];

const PETRI=[
  {phase:"1 · Disruption",eq:"dS/dt = −k(chaos) × fluid channels",col:ROSE,txt:"Fluid networks overload; organic channels erode. Synaptic overload · market volatility · orbital debris."},
  {phase:"2 · Infiltration",eq:"dS/dt = m(minerals)",col:GOLD,txt:"Minerals replace organics atom-by-atom; entropy maximized. Vascular calcification · credit rigidity · Starlink locking."},
  {phase:"3 · Locking",eq:"S(t) = k + m + β = 0",col:VIOLET,txt:"System stabilizes in brittleness; shocks trigger Zipf-distributed cascades. FOP · market crash · Kessler syndrome."},
];

export default function AetherUnifiedFrameworkPage(){
  return(
    <div style={{minHeight:"100vh",background:BG,color:TEXT,padding:"40px 20px 80px",fontFamily:"'Inter',system-ui,sans-serif"}}>
      <div style={{maxWidth:980,margin:"0 auto"}}>
        <div style={{fontFamily:"monospace",fontSize:11,color:MUTED,letterSpacing:2,textTransform:"uppercase",marginBottom:8}}>AETHER Unified System Framework · v1.0 · March 2026</div>
        <h1 style={{fontSize:30,margin:"0 0 6px",fontWeight:700,background:`linear-gradient(90deg,${CYAN},${GOLD},${VIOLET})`,WebkitBackgroundClip:"text",backgroundClip:"text",color:"transparent"}}>
          Adaptive Emergent Topology
        </h1>
        <p style={{fontFamily:"monospace",fontSize:12,color:MUTED,margin:"0 0 4px"}}>Hierarchical Evolutionary Resonance · Quantum · Cellular · Biological · Family · Atmospheric · Earth · Cosmic</p>
        <p style={{fontFamily:"monospace",fontSize:11,color:hexA(MUTED,0.7),margin:"0 0 24px"}}>Shia Miller · Independent Researcher · @StrategicProce · AetherLife.co</p>

        <div style={{background:hexA(CYAN,0.04),border:`1px solid ${hexA(CYAN,0.2)}`,borderRadius:10,padding:"12px 16px",marginBottom:24,fontSize:13,color:MUTED,lineHeight:1.7}}>
          <strong style={{color:TEXT}}>Abstract:</strong> A single five-phase recursive loop — Sense, Deliver, Activate, Feedback, Learn — governs dynamics identically across every scale, from NV quantum diamond coherence to planetary iodine cycling to neural cognition to orbital constellations. The golden ratio φ ≈ 1.618 emerges as the universal attractor signature of systems that persist against entropy.
        </div>

        <div style={{background:PAN,border:`1px solid ${BORDER}`,borderRadius:12,padding:18,marginBottom:24}}>
          <div style={{fontFamily:"monospace",fontSize:11,color:CYAN,marginBottom:14,textTransform:"uppercase",letterSpacing:1}}>Live · The Scale-Invariant Five-Phase Loop</div>
          <FivePhaseCanvas/>
        </div>

        <div style={{background:PAN,border:`1px solid ${BORDER}`,borderRadius:12,padding:18,marginBottom:24}}>
          <div style={{fontFamily:"monospace",fontSize:11,color:VIOLET,marginBottom:14,textTransform:"uppercase",letterSpacing:1}}>The Nine AETHER Scales</div>
          <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(280px,1fr))",gap:8}}>
            {SCALES.map(s=>(
              <div key={s.n} style={{background:PAN2,border:`1px solid ${BORDER}`,borderLeft:`3px solid ${s.col}`,borderRadius:8,padding:"10px 14px"}}>
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"baseline",marginBottom:2}}>
                  <span style={{fontFamily:"monospace",fontSize:12.5,color:s.col,fontWeight:700}}>{s.n} · {s.name}</span>
                  <span style={{fontFamily:"monospace",fontSize:10,color:GOLD}}>{s.metric}</span>
                </div>
                <div style={{fontSize:12,color:MUTED,lineHeight:1.5}}>{s.sub}</div>
              </div>
            ))}
          </div>
        </div>

        <div style={{background:PAN,border:`1px solid ${BORDER}`,borderRadius:12,padding:18,marginBottom:24}}>
          <div style={{fontFamily:"monospace",fontSize:11,color:GOLD,marginBottom:6,textTransform:"uppercase",letterSpacing:1}}>Brain-First Metabolism · The Planetary-to-Neural Mineral Cascade</div>
          <p style={{margin:"0 0 14px",fontSize:13,color:TEXT,lineHeight:1.7}}>Obesity and Alzheimer's are convergent downstream symptoms of one upstream failure: degraded metabolic signal fidelity originating at the planetary mineral provisioning layer. Iodine deficiency is not "low nutrient X" — it is dropping voltage on the system clock and power supply simultaneously.</p>
          <div style={{display:"grid",gap:8}}>
            {CASCADE.map((c,i)=>(
              <div key={c.t} style={{display:"flex",gap:12,alignItems:"flex-start",background:PAN2,border:`1px solid ${BORDER}`,borderRadius:8,padding:"10px 14px"}}>
                <div style={{fontSize:20,lineHeight:1}}>{c.icon}</div>
                <div>
                  <div style={{fontSize:12.5,color:c.col,fontWeight:600,marginBottom:2}}>{i+1}. {c.t}</div>
                  <div style={{fontSize:12,color:MUTED,lineHeight:1.55}}>{c.d}</div>
                </div>
              </div>
            ))}
          </div>
          <div style={{background:hexA(ROSE,0.06),border:`1px solid ${hexA(ROSE,0.25)}`,borderRadius:8,padding:"10px 14px",marginTop:12,fontSize:12,color:MUTED,lineHeight:1.6}}>
            <strong style={{color:ROSE}}>Failure mode:</strong> Iodine/selenium co-insufficiency → T3 deficit → mitochondrial hypofunction → ATP shortfall → BOTH obesity AND neurodegeneration independently. Coherence invariant: fT3/rT3 ratio as proxy for net metabolic signal quality.
          </div>
        </div>

        <div style={{background:PAN,border:`1px solid ${BORDER}`,borderRadius:12,padding:18,marginBottom:24}}>
          <div style={{fontFamily:"monospace",fontSize:11,color:GREEN,marginBottom:14,textTransform:"uppercase",letterSpacing:1}}>Pipeline Results · Granger Causality (1990–2022)</div>
          <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(260px,1fr))",gap:10}}>
            {GRANGER.map(g=>(
              <div key={g.path} style={{background:PAN2,border:`1px solid ${BORDER}`,borderRadius:8,padding:"10px 14px"}}>
                <div style={{fontSize:12.5,color:TEXT,fontWeight:600,marginBottom:4}}>{g.path}</div>
                <div style={{fontFamily:"monospace",fontSize:11.5,color:g.col,marginBottom:2}}>{g.r}</div>
                <div style={{fontFamily:"monospace",fontSize:10.5,color:MUTED}}>{g.sig}</div>
              </div>
            ))}
          </div>
          <p style={{margin:"12px 0 0",fontSize:12,color:MUTED,lineHeight:1.6}}>The direct solar→obesity pathway is NOT significant — the expected signature of a mediated cascade: solar predicts iodine, iodine predicts disease, but solar does not predict disease directly.</p>
        </div>

        <div style={{background:PAN,border:`1px solid ${BORDER}`,borderRadius:12,padding:18,marginBottom:24}}>
          <div style={{fontFamily:"monospace",fontSize:11,color:ROSE,marginBottom:14,textTransform:"uppercase",letterSpacing:1}}>The Petrification Arc · Universal Failure Mode</div>
          <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(260px,1fr))",gap:12}}>
            {PETRI.map(p=>(
              <div key={p.phase} style={{background:PAN2,border:`1px solid ${BORDER}`,borderRadius:10,padding:"12px 14px"}}>
                <div style={{fontFamily:"monospace",fontSize:13,color:p.col,fontWeight:700,marginBottom:4}}>{p.phase}</div>
                <div style={{fontFamily:"monospace",fontSize:11,color:hexA(p.col,0.75),marginBottom:8,padding:"4px 8px",background:hexA(p.col,0.06),borderRadius:4}}>{p.eq}</div>
                <p style={{margin:0,fontSize:12,color:MUTED,lineHeight:1.6}}>{p.txt}</p>
              </div>
            ))}
          </div>
        </div>

        <div style={{background:hexA(GOLD,0.04),border:`1px solid ${hexA(GOLD,0.2)}`,borderRadius:10,padding:"12px 16px",marginBottom:28,fontSize:13,color:MUTED,lineHeight:1.7}}>
          <strong style={{color:TEXT}}>The Resonant Cell:</strong> a 10-acre living laboratory ($195–330K, 18 months to operational) where all nine scales are demonstrated simultaneously — DC-native solar aligned to Earth's Global Electric Circuit. Roadmap: The Resonant Cell (Yr 1–2) → The Corridor (Yr 3–5) → Planetary Symphony (Yr 6–10), an Internet of Living Things acting as Earth's nervous system.
        </div>

        <div style={{display:"flex",flexWrap:"wrap",gap:14,paddingTop:20,borderTop:`1px solid ${BORDER}`,fontFamily:"monospace",fontSize:12}}>
          <Link href="/cuca-white-paper" style={{color:CYAN,textDecoration:"none"}}>→ CUCA White Paper</Link>
          <Link href="/aether-patent" style={{color:GOLD,textDecoration:"none"}}>→ AETHER Patent Specification</Link>
          <Link href="/petrification-transformation" style={{color:ROSE,textDecoration:"none"}}>→ Petrification Transformation</Link>
          <Link href="/graph-map" style={{color:MUTED,textDecoration:"none"}}>→ Knowledge Graph</Link>
        </div>
      </div>
    </div>
  );
}
