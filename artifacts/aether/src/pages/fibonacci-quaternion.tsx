import { useEffect, useRef } from "react";
import { Link } from "wouter";

const BG="#04060d",PAN="#0a0d1a",PAN2="#0d1020",BORDER="#182038",TEXT="#b8cce8",MUTED="#5a6e8c";
const GOLD="#ffb830",CYAN="#3fd8d0",VIOLET="#a87aff",GREEN="#50d49a",BLUE="#4ab0ff",ROSE="#ff5a6a";

function hexA(h:string,a:number){const n=h.replace("#","");return `rgba(${parseInt(n.slice(0,2),16)},${parseInt(n.slice(2,4),16)},${parseInt(n.slice(4,6),16)},${a})`;}
function fitCanvas(cv:HTMLCanvasElement,ctx:CanvasRenderingContext2D){const dpr=Math.min(2,window.devicePixelRatio||1);const w=cv.clientWidth||640;const h=cv.clientHeight||360;cv.width=Math.round(w*dpr);cv.height=Math.round(h*dpr);ctx.setTransform(dpr,0,0,dpr,0,0);return{w,h};}

/* Live phyllotaxis packing: golden angle 137.5 deg = optimal (no radial gaps) */
function PhyllotaxisCanvas(){
  const cvRef=useRef<HTMLCanvasElement|null>(null);
  const angleRef=useRef(137.5);
  const nRef=useRef(377);
  useEffect(()=>{
    const cv=cvRef.current; if(!cv)return;
    const ctx=cv.getContext("2d"); if(!ctx)return;
    let raf=0,t=0;
    const loop=()=>{
      const{w,h}=fitCanvas(cv,ctx);
      t+=0.01;
      ctx.clearRect(0,0,w,h); ctx.fillStyle=BG; ctx.fillRect(0,0,w,h);
      const cx=w/2, cy=h/2;
      const N=Math.round(nRef.current);
      const div=angleRef.current*Math.PI/180;
      const c=Math.min(w,h)*0.028;
      const rot=t*0.15;
      for(let i=0;i<N;i++){
        const a=i*div+rot;
        const r=c*Math.sqrt(i);
        const x=cx+Math.cos(a)*r, y=cy+Math.sin(a)*r;
        const hue=i/N;
        const col=hue<0.25?GOLD:hue<0.5?CYAN:hue<0.75?GREEN:VIOLET;
        const sz=Math.max(1.2,2.8-r/(Math.min(w,h)*0.55));
        ctx.fillStyle=hexA(col,0.5+0.45*(1-hue));
        ctx.beginPath(); ctx.arc(x,y,sz,0,Math.PI*2); ctx.fill();
      }
      ctx.fillStyle=hexA(MUTED,0.7); ctx.font="10px monospace";
      ctx.fillText("golden angle φ⁻² · 360° = 137.507°",14,h-14);
      raf=requestAnimationFrame(loop);
    };
    raf=requestAnimationFrame(loop);
    return()=>cancelAnimationFrame(raf);
  },[]);
  return(
    <div>
      <canvas ref={cvRef} style={{width:"100%",height:360,display:"block",borderRadius:10,border:`1px solid ${BORDER}`}}/>
      <div style={{display:"flex",gap:20,marginTop:12,flexWrap:"wrap"}}>
        <label style={{fontFamily:"monospace",fontSize:11,color:MUTED}}>
          divergence angle°
          <input type="range" min={130} max={145} step={0.1} defaultValue={137.5}
            onChange={e=>(angleRef.current=parseFloat(e.target.value))}
            style={{marginLeft:8,accentColor:GOLD,width:140}}/>
        </label>
        <label style={{fontFamily:"monospace",fontSize:11,color:MUTED}}>
          nodes
          <input type="range" min={89} max={610} step={1} defaultValue={377}
            onChange={e=>(nRef.current=parseFloat(e.target.value))}
            style={{marginLeft:8,accentColor:CYAN,width:120}}/>
        </label>
      </div>
      <div style={{fontFamily:"monospace",fontSize:11,color:MUTED,marginTop:8}}>
        Drift the angle off 137.5° and radial spokes/gaps appear — φ-spiral routing minimizes hops and heat (phyllotaxis)
      </div>
    </div>
  );
}

const LADDER=[
  {alg:"ℝ · reals",dim:"1",lost:"—",role:"Scalar observables",col:GREEN},
  {alg:"ℂ · complex",dim:"2",lost:"—",role:"Waves, 2D rotations, basic quantum states",col:CYAN},
  {alg:"ℍ · quaternions",dim:"4",lost:"Commutativity",role:"3D rotation, spinors, quaternion mirrors",col:VIOLET},
  {alg:"𝕆 · octonions",dim:"8",lost:"Associativity",role:"Exceptional symmetries, Fano coherence",col:GOLD},
];

const PILLARS=[
  {n:"1 · Hypercomplex AETHER",col:VIOLET,txt:"GR-informed expansion into quaternions and octonions, structured by triangular geometries and Fano coherence. The energy-momentum-mass triangle E² = (pc)² + (mc²)² is the first triangular structure; it generalizes to the Fano plane — a 7-point projective plane encoding octonion multiplication that permits controlled non-linearity without algebraic chaos."},
  {n:"2 · Fibonacci Quantization (FQP)",col:GOLD,txt:"φ-based quantization discretizes energy, bandwidth, and perturbations into Fibonacci levels {1,2,3,5,8,13,21,34,55,89}. SOC thresholds are β-scaled Fibonacci functions; β controls how close the system sits to the critical frontier. Simulated FQP networks show power-law tails compressed and a modeled 25% gain in systemic energy efficiency."},
  {n:"3 · Petrification & Reversal",col:ROSE,txt:"A systemic entropy model where mineralization, power-law fragility, and orbital congestion are reversed via coherence injection, β-tuned SOC thresholds, and topological substrates. dS/dt = −k(chaos) + m(minerals); reversal requires β·C(x,t) to exceed net decay before the locked, Zipf-fragile state sets in."},
];

const QUATERNION=[
  {title:"Quaternion Mirrors",col:VIOLET,txt:"Quaternions act as 4D reflection engines: a state v is rotated via v' = q v q⁻¹ with q a unit quaternion. Non-commutative multiplication models order-dependent processes — quantum spin, light polarization — via the SU(2)↔quaternion isomorphism. In AFQ they represent particle states in collectors and mirrored transformations of light/matter near light speed."},
  {title:"Fibonacci Anyons",col:CYAN,txt:"Non-Abelian anyons whose braiding implements topologically protected operations. Worldlines braided in time accumulate topological phases (e.g. e^{4πi/5}) insensitive to local noise. AFQ interprets braiding as quantum-level coherence injection — SOC threshold reconfiguration at the quantum information layer. A candidate hardware substrate for petrification reversal."},
  {title:"Photonic Reservoirs",col:GREEN,txt:"Multi-mode waveguides with rich intensity and phase dynamics form high-dimensional (~500-D) readout spaces for reservoir computing. They physically instantiate the Sense→Deliver→Activate→Feedback→Learn loop, with Fibonacci-phase and amplitude quantization providing fine-grained control."},
  {title:"Golden Dome",col:GOLD,txt:"A planetary-scale scalar resonator harmonizing beams across frequencies and dispersing threats into stable mineral by-products (limestone-analog mineralization). Incident energy is mapped through a dome operator into a mineralization channel constrained by φ-optimized resonance and Fibonacci harmonics."},
];

const EQUATIONS=[
  {eq:"E² = (pc)² + (mc²)²",note:"The energy-momentum-mass triangle — first triangular structure, ancestor of Fano coherence and Fibonacci quantization."},
  {eq:"q v q⁻¹ · ij = −ji",note:"Quaternion mirror rotation with non-commutative multiplication modeling order-dependent spin and polarization."},
  {eq:"δ ∈ {Fₙ} = {1,2,3,5,8,13,21,34,55,89}",note:"Fibonacci Quantized Perturbation: continuous loads snap to nearest Fibonacci level (FQP)."},
  {eq:"threshold = β · φⁿ",note:"β-scaled SOC threshold — increasing β moves the system off criticality, breaking power-law fragility."},
  {eq:"τ_braiding → e^{4πi/5}",note:"Fibonacci anyon braiding accumulates a noise-insensitive topological phase — fault-tolerant coherence reset."},
  {eq:"x = 1 + 1/x → φ = 1.618…",note:"Banach fixed point: any bounded self-referential map converges to φ, the AFQ attractor."},
];

export default function FibonacciQuaternionPage(){
  return(
    <div style={{minHeight:"100vh",background:BG,color:TEXT,padding:"40px 20px 80px",fontFamily:"'Inter',system-ui,sans-serif"}}>
      <div style={{maxWidth:980,margin:"0 auto"}}>
        <div style={{fontFamily:"monospace",fontSize:11,color:MUTED,letterSpacing:2,textTransform:"uppercase",marginBottom:8}}>AFQ · Unified Computational Framework · 2026</div>
        <h1 style={{fontSize:30,margin:"0 0 6px",fontWeight:700,background:`linear-gradient(90deg,${GOLD},${VIOLET},${CYAN})`,WebkitBackgroundClip:"text",backgroundClip:"text",color:"transparent"}}>
          Fibonacci–Quaternion AETHER
        </h1>
        <p style={{fontFamily:"monospace",fontSize:12,color:MUTED,margin:"0 0 4px"}}>A unified framework for petrification, coherence, and sustainable critical systems</p>
        <p style={{fontFamily:"monospace",fontSize:11,color:hexA(MUTED,0.7),margin:"0 0 24px"}}>Shia Miller · @StrategicProce · Hypercomplex algebras · φ-quantization · SOC reversal</p>

        <div style={{background:PAN,border:`1px solid ${BORDER}`,borderRadius:12,padding:18,marginBottom:24}}>
          <div style={{fontFamily:"monospace",fontSize:11,color:CYAN,marginBottom:14,textTransform:"uppercase",letterSpacing:1}}>Live · φ-Spiral Packing (Golden-Angle Phyllotaxis)</div>
          <PhyllotaxisCanvas/>
        </div>

        <div style={{background:PAN,border:`1px solid ${BORDER}`,borderRadius:12,padding:18,marginBottom:24}}>
          <div style={{fontFamily:"monospace",fontSize:11,color:GOLD,marginBottom:14,textTransform:"uppercase",letterSpacing:1}}>Three Synthesized Breakthroughs</div>
          {PILLARS.map(p=>(
            <div key={p.n} style={{background:PAN2,border:`1px solid ${BORDER}`,borderLeft:`3px solid ${p.col}`,borderRadius:8,padding:"12px 14px",marginBottom:10}}>
              <div style={{fontFamily:"monospace",fontSize:12.5,color:p.col,fontWeight:700,marginBottom:6}}>{p.n}</div>
              <p style={{margin:0,fontSize:13,color:TEXT,lineHeight:1.7}}>{p.txt}</p>
            </div>
          ))}
        </div>

        <div style={{background:PAN,border:`1px solid ${BORDER}`,borderRadius:12,padding:18,marginBottom:24}}>
          <div style={{fontFamily:"monospace",fontSize:11,color:VIOLET,marginBottom:14,textTransform:"uppercase",letterSpacing:1}}>The Hypercomplex Ladder · Cayley–Dickson Construction</div>
          <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(220px,1fr))",gap:10}}>
            {LADDER.map(l=>(
              <div key={l.alg} style={{background:PAN2,border:`1px solid ${BORDER}`,borderRadius:10,padding:"12px 14px"}}>
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"baseline",marginBottom:4}}>
                  <span style={{fontFamily:"monospace",fontSize:13,color:l.col,fontWeight:700}}>{l.alg}</span>
                  <span style={{fontFamily:"monospace",fontSize:11,color:GOLD}}>dim {l.dim}</span>
                </div>
                <div style={{fontFamily:"monospace",fontSize:10.5,color:ROSE,marginBottom:6}}>lost: {l.lost}</div>
                <div style={{fontSize:12,color:MUTED,lineHeight:1.5}}>{l.role}</div>
              </div>
            ))}
          </div>
          <p style={{margin:"12px 0 0",fontSize:12.5,color:MUTED,lineHeight:1.7}}>Each rung sacrifices an algebraic property (commutativity, then associativity) but stays normed. Octonion multiplication is encoded by the Fano plane — a triangular 7-point projective geometry that defines consistent but non-associative rules. This <strong style={{color:GOLD}}>Fano coherence</strong> is the principle that permits controlled non-linearity.</p>
        </div>

        <div style={{background:PAN,border:`1px solid ${BORDER}`,borderRadius:12,padding:18,marginBottom:24}}>
          <div style={{fontFamily:"monospace",fontSize:11,color:GREEN,marginBottom:14,textTransform:"uppercase",letterSpacing:1}}>Quaternion Mirrors · Anyons · Reservoirs · Golden Dome</div>
          <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(260px,1fr))",gap:12}}>
            {QUATERNION.map(q=>(
              <div key={q.title} style={{background:PAN2,border:`1px solid ${BORDER}`,borderRadius:10,padding:"12px 14px"}}>
                <div style={{fontSize:13,color:q.col,fontWeight:600,marginBottom:6}}>{q.title}</div>
                <p style={{margin:0,fontSize:12,color:MUTED,lineHeight:1.6}}>{q.txt}</p>
              </div>
            ))}
          </div>
        </div>

        <div style={{background:PAN,border:`1px solid ${BORDER}`,borderRadius:12,padding:18,marginBottom:24}}>
          <div style={{fontFamily:"monospace",fontSize:11,color:GOLD,marginBottom:14,textTransform:"uppercase",letterSpacing:1}}>Key Equations</div>
          <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(280px,1fr))",gap:10}}>
            {EQUATIONS.map(eq=>(
              <div key={eq.eq} style={{background:PAN2,border:`1px solid ${BORDER}`,borderRadius:8,padding:"10px 12px"}}>
                <div style={{fontFamily:"monospace",fontSize:12.5,color:GOLD,marginBottom:6}}>{eq.eq}</div>
                <div style={{fontSize:12,color:MUTED,lineHeight:1.6}}>{eq.note}</div>
              </div>
            ))}
          </div>
        </div>

        <div style={{background:hexA(GOLD,0.04),border:`1px solid ${hexA(GOLD,0.2)}`,borderRadius:10,padding:"12px 16px",marginBottom:28,fontSize:13,color:MUTED,lineHeight:1.7}}>
          <strong style={{color:TEXT}}>Conclusion:</strong> Across biology, economics, orbital logistics, and edge computing, systems drift toward SOC and petrification unless tuned. By quantizing perturbations and thresholds in Fibonacci levels, modeling dynamics with quaternionic mirrors, and embedding everything in AETHER's five-phase loop, AFQ offers a mathematically coherent route to structured, sustainable criticality rather than collapse.
        </div>

        <div style={{display:"flex",flexWrap:"wrap",gap:14,paddingTop:20,borderTop:`1px solid ${BORDER}`,fontFamily:"monospace",fontSize:12}}>
          <Link href="/petrification-transformation" style={{color:ROSE,textDecoration:"none"}}>→ Petrification Transformation</Link>
          <Link href="/aether-theory-deck" style={{color:GOLD,textDecoration:"none"}}>→ AETHER Theory Deck</Link>
          <Link href="/aether-patent" style={{color:CYAN,textDecoration:"none"}}>→ AETHER Patent Specification</Link>
          <Link href="/" style={{color:MUTED,textDecoration:"none"}}>→ Knowledge Graph</Link>
        </div>
      </div>
    </div>
  );
}
