import { useEffect, useRef } from "react";
import { Link } from "wouter";

const BG="#04060d",PAN="#0a0d1a",PAN2="#0d1020",BORDER="#182038",TEXT="#b8cce8",MUTED="#5a6e8c";
const GOLD="#ffb830",CYAN="#3fd8d0",VIOLET="#a87aff",GREEN="#50d49a",BLUE="#4ab0ff";

function hexA(h:string,a:number){const n=h.replace("#","");return `rgba(${parseInt(n.slice(0,2),16)},${parseInt(n.slice(2,4),16)},${parseInt(n.slice(4,6),16)},${a})`;}
function fitCanvas(cv:HTMLCanvasElement,ctx:CanvasRenderingContext2D){const dpr=Math.min(2,window.devicePixelRatio||1);const w=cv.clientWidth||640;const h=cv.clientHeight||260;cv.width=Math.round(w*dpr);cv.height=Math.round(h*dpr);ctx.setTransform(dpr,0,0,dpr,0,0);return{w,h};}

/* Live 2-D complex field — Q~AETHER field reservoir simulation */
function QFieldCanvas(){
  const cvRef=useRef<HTMLCanvasElement|null>(null);
  const alphaRef=useRef(0.3);
  const etaRef=useRef(0.05);
  const speedRef=useRef(1.0);

  useEffect(()=>{
    const cv=cvRef.current; if(!cv)return;
    const ctx=cv.getContext("2d"); if(!ctx)return;
    let raf=0,t=0;
    const N=40;
    let A:Float32Array,phi:Float32Array,seeded=false;

    const seed=()=>{
      A=new Float32Array(N*N);
      phi=new Float32Array(N*N);
      for(let i=0;i<N*N;i++){A[i]=Math.random();phi[i]=Math.random()*Math.PI*2;}
      seeded=true;
    };

    const loop=()=>{
      const{w,h}=fitCanvas(cv,ctx);
      if(!seeded)seed();
      t+=0.04*speedRef.current;
      const alpha=alphaRef.current;
      const eta=etaRef.current;
      const cw=w/N, ch=h/N;

      // one step: FFT-like approximation via neighbors + nonlinear + Hebbian
      const mean=A.reduce((s,v)=>s+v,0)/A.length;
      const A2=new Float32Array(A);
      for(let i=0;i<N;i++)for(let j=0;j<N;j++){
        const idx=i*N+j;
        // interference: average of 4 neighbors (simplified FFT propagation)
        const nb=[
          A[((i-1+N)%N)*N+j],A[((i+1)%N)*N+j],
          A[i*N+(j-1+N)%N], A[i*N+(j+1)%N]
        ];
        const propA=(nb[0]+nb[1]+nb[2]+nb[3])/4;
        // nonlinear Kerr-like phase shift
        phi[idx]+=alpha*A[idx]*A[idx]*0.1;
        // Hebbian: reinforce above mean, suppress below
        A2[idx]=A[idx]>mean?A[idx]+eta:A[idx]-eta*0.5;
        A2[idx]=Math.max(0,Math.min(1,A2[idx]*0.92+propA*0.08));
      }
      for(let i=0;i<N*N;i++)A[i]=A2[i];

      // render as colour grid
      ctx.clearRect(0,0,w,h);
      for(let i=0;i<N;i++)for(let j=0;j<N;j++){
        const idx=i*N+j;
        const amp=A[idx];
        const phase=phi[idx];
        // colour: hue from phase, brightness from amplitude
        const r=Math.round(55+amp*100+Math.sin(phase)*60);
        const g=Math.round(180*amp+Math.cos(phase)*40);
        const b=Math.round(200+amp*55);
        ctx.fillStyle=`rgba(${r},${g},${b},${0.7+amp*0.3})`;
        ctx.fillRect(Math.round(j*cw),Math.round(i*ch),Math.ceil(cw)+1,Math.ceil(ch)+1);
      }

      // overlay metric strip
      const energy=A.reduce((s,v)=>s+v*v,0);
      const stable=A.filter(v=>v>mean).length;
      ctx.fillStyle=hexA("#000000",0.55);
      ctx.fillRect(0,h-28,w,28);
      ctx.fillStyle=CYAN; ctx.font="11px monospace";
      ctx.fillText(`energy Σ|A|²=${energy.toFixed(0)}  stable=${stable}/${N*N}  α=${alpha.toFixed(2)}  iter=${Math.floor(t/0.04)}`,8,h-10);

      raf=requestAnimationFrame(loop);
    };
    raf=requestAnimationFrame(loop);
    return()=>cancelAnimationFrame(raf);
  },[]);

  return(
    <div>
      <canvas ref={cvRef} style={{width:"100%",height:260,display:"block",borderRadius:10,border:`1px solid ${BORDER}`}}/>
      <div style={{display:"flex",flexWrap:"wrap",gap:16,marginTop:12}}>
        {[
          {label:"Nonlinear α",ref:alphaRef,min:0,max:1.5,step:0.05,def:0.3,col:CYAN},
          {label:"Learning η",ref:etaRef,min:0.005,max:0.2,step:0.005,def:0.05,col:GOLD},
          {label:"Speed",ref:speedRef,min:0.2,max:3,step:0.1,def:1.0,col:GREEN},
        ].map(s=>(
          <label key={s.label} style={{fontFamily:"monospace",fontSize:11,color:MUTED}}>
            {s.label}
            <input type="range" min={s.min} max={s.max} step={s.step} defaultValue={s.def}
              onChange={e=>(s.ref.current=parseFloat(e.target.value))}
              style={{marginLeft:8,accentColor:s.col,width:90}}/>
          </label>
        ))}
      </div>
      <p style={{fontFamily:"monospace",fontSize:11,color:MUTED,marginTop:6}}>
        2-D complex field reservoir: FFT-like propagation + Kerr phase shift (α) + Hebbian reinforcement (η). Colour encodes amplitude/phase.
      </p>
    </div>
  );
}

const LAYERS=[
  {n:1,name:"Quantum Core",phys:"Qubit arrays, superposition states",role:"Probabilistic state initialization",col:VIOLET,detail:"Three initialization modes: Random (max-entropy), Coherent (Gaussian state), Multimode (K-qubit superposition). The complex field Ψ(i,j) = A(i,j)·exp(iφ(i,j)) is prepared once at the start of each run."},
  {n:2,name:"Photonic Interference Field",phys:"Coherent light, beam splitters, phase plates",role:"FFT-based wave propagation & interference",col:CYAN,detail:"Ψ′ = F[Ψ] — 2D FFT with frequency shift. Equivalent to free-space optical propagation in the Fraunhofer far-field regime. The FFT runs at the speed of light in hardware; O(N² log N) in simulation."},
  {n:3,name:"Nonlinear Optical Medium",phys:"Self-organizing gratings, Kerr media",role:"Intensity-dependent phase modulation",col:GOLD,detail:"φ′(i,j) = φ(i,j) + α·|A(i,j)|². The Kerr nonlinearity breaks linear symmetry, enabling structured non-uniform interference patterns. This is the mechanism of self-phase modulation."},
  {n:4,name:"Fluidic Control Layer",phys:"Microfluidic geometry, reconfigurable channels",role:"Spatial masking & pathway routing",col:GREEN,detail:"A′(i,j) = A(i,j)·M(i,j). Geometry modes: Gaussian, Ring, Vortex, Channels. A time-varying dynamic mask allows the geometry to evolve continuously during operation."},
  {n:5,name:"Bio-Adaptive Layer",phys:"Mycelial networks, morphological adaptation",role:"Hebbian reinforcement of stable nodes",col:BLUE,detail:"Stable nodes (A > mean + σ) are reinforced by η; losers suppressed by η/2; renormalized to prevent divergence. Implements spatial competitive learning — the field's own interference patterns select which nodes survive."},
];

const CONFIGS=[
  {name:"Config A",mode:"Random / Gaussian / Standard",energy:"779.6 AU",detail:"Maximum-entropy initialization with symmetric geometry and basic Hebbian adaptation. Energy stabilizes within 20 iterations."},
  {name:"Config B",mode:"Coherent / Ring / Competitive",energy:"462.2 AU",detail:"Structured coherent input with annular geometry and winner-take-more adaptation. Ring geometry focuses field into standing modes."},
  {name:"Config C",mode:"Multimode / Vortex / Weighted",energy:"534.7 AU",detail:"Four-mode superposition with azimuthal geometry and weight-accumulating adaptation. Vortex produces azimuthally modulated interference."},
];

const EQUATIONS=[
  {eq:"Ψ(i,j) = A(i,j)·exp(iφ(i,j))",note:"Complex field state at node (i,j). A is amplitude; φ is phase. This is the fundamental data structure — directly analogous to the complex envelope of an optical field."},
  {eq:"Ψ′ = F[Ψ]  (2-D FFT + freq shift)",note:"Layer 2 propagation. Equivalent to free-space optical propagation in the Fraunhofer far-field regime. The computation occurs at the speed of light in the physical device."},
  {eq:"φ′(i,j) = φ(i,j) + α·|A(i,j)|²",note:"Layer 3 Kerr nonlinearity. High-intensity nodes accumulate extra phase shift, breaking linear symmetry and enabling adaptive structured interference."},
  {eq:"A′(i,j) = A(i,j)·M(i,j)",note:"Layer 4 fluidic mask. The microfluidic geometry controls which spatial modes are transmitted — geometry is the program."},
];

export default function QAetherResearchPage(){
  return(
    <div style={{minHeight:"100vh",background:BG,color:TEXT,padding:"40px 20px 80px",fontFamily:"'Inter',system-ui,sans-serif"}}>
      <div style={{maxWidth:980,margin:"0 auto"}}>
        <div style={{fontFamily:"monospace",fontSize:11,color:MUTED,letterSpacing:2,textTransform:"uppercase",marginBottom:8}}>Q~AETHER® · Version 0.3.1 · February 2026 · Research Prototype</div>
        <h1 style={{fontSize:30,margin:"0 0 8px",fontWeight:700,background:`linear-gradient(90deg,${CYAN},${VIOLET})`,WebkitBackgroundClip:"text",backgroundClip:"text",color:"transparent"}}>
          Q~AETHER · Emergent Quantum-Photonic Analog Field Reservoir
        </h1>
        <p style={{fontFamily:"monospace",fontSize:11,color:hexA(VIOLET,0.7),margin:"0 0 6px"}}>Architecture, Simulation Prototype & Research Roadmap</p>
        <p style={{color:MUTED,fontSize:13.5,lineHeight:1.75,maxWidth:760,margin:"0 0 24px"}}>
          Q~AETHER is a structured analog field reservoir in which geometry and physical interference are the primary computational substrate. Unlike classical computers (discrete instructions) and quantum computers (probability amplitudes over qubits), Q~AETHER belongs to a third class: a machine that lets physical reality perform computation through structure. Information flows as light; structure shapes interference; nonlinearity enables adaptation; geometry becomes computation.
        </p>

        <div style={{background:PAN,border:`1px solid ${BORDER}`,borderRadius:12,padding:18,marginBottom:24}}>
          <div style={{fontFamily:"monospace",fontSize:11,color:CYAN,marginBottom:10,textTransform:"uppercase",letterSpacing:1}}>Live Field Reservoir Simulation</div>
          <QFieldCanvas/>
        </div>

        <div style={{background:PAN,border:`1px solid ${BORDER}`,borderRadius:12,padding:18,marginBottom:24}}>
          <div style={{fontFamily:"monospace",fontSize:11,color:GOLD,marginBottom:14,textTransform:"uppercase",letterSpacing:1}}>Five-Layer Architecture</div>
          <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(260px,1fr))",gap:12}}>
            {LAYERS.map(l=>(
              <div key={l.n} style={{background:PAN2,border:`1px solid ${BORDER}`,borderRadius:10,padding:"12px 14px"}}>
                <div style={{display:"flex",gap:10,alignItems:"baseline",marginBottom:6}}>
                  <span style={{fontFamily:"monospace",fontSize:11,color:l.col}}>Layer {l.n}</span>
                  <span style={{fontSize:13.5,color:TEXT,fontWeight:600}}>{l.name}</span>
                </div>
                <div style={{fontFamily:"monospace",fontSize:10,color:hexA(l.col,0.7),marginBottom:6,padding:"3px 6px",background:hexA(l.col,0.06),borderRadius:4}}>{l.phys}</div>
                <div style={{fontSize:11,color:MUTED,fontStyle:"italic",marginBottom:6}}>{l.role}</div>
                <div style={{fontSize:12,color:MUTED,lineHeight:1.6}}>{l.detail}</div>
              </div>
            ))}
          </div>
        </div>

        <div style={{background:PAN,border:`1px solid ${BORDER}`,borderRadius:12,padding:18,marginBottom:24}}>
          <div style={{fontFamily:"monospace",fontSize:11,color:VIOLET,marginBottom:14,textTransform:"uppercase",letterSpacing:1}}>Mathematical Formulation</div>
          <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(280px,1fr))",gap:10}}>
            {EQUATIONS.map(eq=>(
              <div key={eq.eq} style={{background:PAN2,border:`1px solid ${BORDER}`,borderRadius:8,padding:"10px 12px"}}>
                <div style={{fontFamily:"monospace",fontSize:12,color:GOLD,marginBottom:6}}>{eq.eq}</div>
                <div style={{fontSize:12,color:MUTED,lineHeight:1.6}}>{eq.note}</div>
              </div>
            ))}
          </div>
        </div>

        <div style={{background:PAN,border:`1px solid ${BORDER}`,borderRadius:12,padding:18,marginBottom:24}}>
          <div style={{fontFamily:"monospace",fontSize:11,color:GREEN,marginBottom:14,textTransform:"uppercase",letterSpacing:1}}>Prototype Results · Configuration Matrix</div>
          <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(240px,1fr))",gap:12}}>
            {CONFIGS.map(c=>(
              <div key={c.name} style={{background:PAN2,border:`1px solid ${BORDER}`,borderRadius:10,padding:"12px 14px"}}>
                <div style={{fontFamily:"monospace",fontSize:13,color:CYAN,fontWeight:700,marginBottom:4}}>{c.name}</div>
                <div style={{fontFamily:"monospace",fontSize:11,color:MUTED,marginBottom:6}}>{c.mode}</div>
                <div style={{fontFamily:"monospace",fontSize:18,color:GOLD,marginBottom:8}}>E = {c.energy}</div>
                <div style={{fontSize:12,color:MUTED,lineHeight:1.5}}>{c.detail}</div>
              </div>
            ))}
          </div>
          <div style={{marginTop:12,padding:"10px 14px",background:hexA(CYAN,0.04),border:`1px solid ${hexA(CYAN,0.15)}`,borderRadius:8}}>
            <div style={{fontSize:12.5,color:TEXT,lineHeight:1.7}}>All three configurations exhibit <strong>convergent field dynamics</strong>: energy Σ|A|² stabilizes within 15–25 iterations and subsequently fluctuates around a configuration-specific equilibrium. The coupled FFT-nonlinear-adaptive loop is bounded and does not exhibit runaway instability under the tested parameter ranges.</div>
          </div>
        </div>

        <div style={{display:"flex",flexWrap:"wrap",gap:14,paddingTop:20,borderTop:`1px solid ${BORDER}`,fontFamily:"monospace",fontSize:12}}>
          <Link href="/q-aether" style={{color:CYAN,textDecoration:"none"}}>→ Q~AETHER Stack</Link>
          <Link href="/substrate-computing" style={{color:GREEN,textDecoration:"none"}}>→ Substrate Computing</Link>
          <Link href="/analog-reservoir" style={{color:VIOLET,textDecoration:"none"}}>→ Analog Reservoir</Link>
          <Link href="/" style={{color:MUTED,textDecoration:"none"}}>→ Knowledge Graph</Link>
        </div>
      </div>
    </div>
  );
}
