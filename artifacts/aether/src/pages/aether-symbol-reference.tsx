import { useEffect, useRef, useState } from "react";
import { Link } from "wouter";

const BG="#04060d",PAN="#0a0d1a",PAN2="#0d1020",BORDER="#182038",TEXT="#b8cce8",MUTED="#5a6e8c";
const GOLD="#ffb830",CYAN="#3fd8d0",VIOLET="#a87aff",GREEN="#50d49a",BLUE="#4ab0ff",ROSE="#ff5a6a";

function hexA(h:string,a:number){const n=h.replace("#","");return `rgba(${parseInt(n.slice(0,2),16)},${parseInt(n.slice(2,4),16)},${parseInt(n.slice(4,6),16)},${a})`;}
function fitCanvas(cv:HTMLCanvasElement,ctx:CanvasRenderingContext2D){const dpr=Math.min(2,window.devicePixelRatio||1);const w=cv.clientWidth||640;const h=cv.clientHeight||340;cv.width=Math.round(w*dpr);cv.height=Math.round(h*dpr);ctx.setTransform(dpr,0,0,dpr,0,0);return{w,h};}

const FIB=[2,3,5,8,13];
/* Live φ-lattice: Fibonacci NV layers, golden-angle Θφ=2π/φ rotation between layers, r_n = r0·φ^n·n·0.3 */
function PhiLatticeCanvas(){
  const cvRef=useRef<HTMLCanvasElement|null>(null);
  const layersRef=useRef(5);
  useEffect(()=>{
    const cv=cvRef.current; if(!cv)return;
    const ctx=cv.getContext("2d"); if(!ctx)return;
    let raf=0,t=0;
    const phi=1.6180339887, golden=2*Math.PI/phi;
    const loop=()=>{
      const{w,h}=fitCanvas(cv,ctx);
      t+=0.006;
      ctx.clearRect(0,0,w,h); ctx.fillStyle=BG; ctx.fillRect(0,0,w,h);
      const cx=w/2, cy=h/2;
      const L=Math.round(layersRef.current);
      const r0=Math.min(w,h)*0.05;
      let total=0;
      for(let n=0;n<L;n++){
        const count=FIB[n]||FIB[FIB.length-1];
        const rn=r0*Math.pow(phi,n*0.55)*(n+1)*0.45;
        const col=[CYAN,GREEN,GOLD,VIOLET,ROSE][n%5];
        ctx.strokeStyle=hexA(col,0.14); ctx.lineWidth=1;
        ctx.beginPath(); ctx.arc(cx,cy,rn,0,Math.PI*2); ctx.stroke();
        for(let k=0;k<count;k++){
          const a=k*golden+n*golden*0.5+t;
          const x=cx+Math.cos(a)*rn, y=cy+Math.sin(a)*rn;
          const glow=0.5+0.5*Math.sin(t*2+k+n);
          ctx.fillStyle=hexA(col,0.4);
          ctx.beginPath(); ctx.arc(x,y,7+glow*3,0,Math.PI*2); ctx.fill();
          ctx.fillStyle=hexA("#ffffff",0.5+glow*0.4);
          ctx.beginPath(); ctx.arc(x,y,2.4,0,Math.PI*2); ctx.fill();
        }
        total+=count;
      }
      ctx.fillStyle=hexA(TEXT,0.85); ctx.font="11px monospace";
      ctx.fillText("Θφ = 2π/φ ≈ 222.5° golden angle",14,20);
      ctx.fillStyle=hexA(GOLD,0.9); ctx.font="12px monospace";
      ctx.fillText("Σ atoms = "+total,14,h-14);
      raf=requestAnimationFrame(loop);
    };
    raf=requestAnimationFrame(loop);
    return()=>cancelAnimationFrame(raf);
  },[]);
  return(
    <div>
      <canvas ref={cvRef} style={{width:"100%",height:340,display:"block",borderRadius:10,border:`1px solid ${BORDER}`}}/>
      <label style={{fontFamily:"monospace",fontSize:11,color:MUTED,display:"block",marginTop:12}}>
        Fibonacci layers (n)
        <input type="range" min={1} max={5} step={1} defaultValue={5}
          onChange={e=>(layersRef.current=parseInt(e.target.value))}
          style={{marginLeft:8,accentColor:GOLD,width:140}}/>
      </label>
      <div style={{fontFamily:"monospace",fontSize:11,color:MUTED,marginTop:8}}>
        r_n = r₀·φⁿ·n·0.3 · layer atom counts {"{2,3,5,8,13}"} → Σ = 31 · golden-angle implantation minimizes decoherence Γ
      </div>
    </div>
  );
}

const GREEK_LOWER=[
  ["α","alpha","decay rate; fine-structure α ≈ 1/137"],
  ["β","beta","velocity ratio v/c; thermodynamic beta; SOC scale"],
  ["γ","gamma","Lorentz factor; photon"],
  ["δ","delta","infinitesimal change; Dirac delta δ(x)"],
  ["ε","epsilon","small perturbation; permittivity; veil term"],
  ["ζ","zeta","Riemann zeta ζ(s)"],
  ["η","eta","efficiency; viscosity"],
  ["θ","theta","angle; polar coordinate; heel"],
  ["κ","kappa","thermal conductivity; curvature; coupling"],
  ["λ","lambda","wavelength; Lagrange multiplier; decay const"],
  ["μ","mu","micro (10⁻⁶); magnetic moment; mean"],
  ["ν","nu","frequency ν (Hz); kinematic viscosity"],
  ["ξ","xi","correlation length; random variable"],
  ["π","pi","3.14159…; canonical momentum"],
  ["ρ","rho","density; resistivity; density matrix ρ̂"],
  ["σ","sigma","cross-section; std dev; Pauli σᵢ"],
  ["τ","tau","proper/relaxation time T₂ → τ"],
  ["φ","phi","golden ratio 1.618…; azimuthal angle; phase"],
  ["χ","chi","susceptibility; chi distribution"],
  ["ψ","psi","wave function ψ(x,t)"],
  ["ω","omega","angular frequency ω = 2πν"],
];

const NOTATION=[
  ["φ","Core integration constant","φ = (1+√5)/2 ≈ 1.618 — primary scaling factor across all AETHER layers",GOLD],
  ["φ²","Layer scaling exponent","φ² = φ+1 ≈ 2.618 — inter-layer radius growth in the NV Fibonacci lattice",GOLD],
  ["Ψ","Wave function / state","|Ψ⟩ — quantum state vector; AETHER coherence state representation",VIOLET],
  ["ρ̂","Density matrix","mixed-state representation for NV spin ensemble; tracks T₂ decay",CYAN],
  ["τ","Relaxation time","τ = T₂ — NV coherence time; φ-enhanced τ_φ = φ·τ_base ≈ 1.618×",GREEN],
  ["Ω","Angular frequency","Ω_ZFS = 2π × 2.87 GHz — NV zero-field splitting; quantum-clock reference",BLUE],
  ["Γ","Decoherence rate","Γ = 1/T₂ — φ-packing target: minimize Γ by suppressing S(ω_NV)",ROSE],
  ["Θ","Rotation / gate angle","Θ_φ = 2π/φ ≈ 222.5° golden angle; implantation rotation between layers",GOLD],
  ["∇","Gradient operator","∇B — magnetic field gradient sensed by NV array; ∇²ψ Laplacian",CYAN],
  ["ℏ","Reduced Planck const.","ℏ = h/2π ≈ 1.055×10⁻³⁴ J·s — fundamental quantum of action",VIOLET],
];

const PHASES=[
  ["1 · Sense","Σ_s","⟨S_u⟩ = Tr(ρ̂ · S_u)","NV spin readout; field measurement",CYAN],
  ["2 · Deliver","Λ_d","x(t) → x′(t+δt)","Signal transduction; photon routing",GREEN],
  ["3 · Activate","α_a","A = f(Σ_s, Λ_d)","Threshold decision; gate activation",GOLD],
  ["4 · Feedback","Φ_f","ΔB = Φ_f · A","Strain/field correction; weight update",BLUE],
  ["5 · Learn","Θ_l","W ← W + η·Σ_s·A","Hebbian consolidation; φ-indexed schedule",VIOLET],
];

const CYRILLIC=[
  ["Φ ф","Φ φ (Phi)","also encodes the Golden Ratio — shared glyph, deep historical-mathematical link"],
  ["Г г","Γ γ (Gamma)","direct from Greek — identical shape"],
  ["П п","Π π (Pi)","arch form of Greek Pi"],
  ["Д д","Δ δ (Delta)","rotated/extended Greek Delta"],
  ["Л л","Λ λ (Lambda)","from Greek Lambda"],
  ["С с","Σ σ (Sigma)","lunate form of Greek Sigma"],
];

const CHINESE=[
  ["道","Dào","Path / Way","Logos; the governing framework"],
  ["和","Hé","Harmony","Coherence; resonance; φ-packing goal"],
  ["气","Qì","Life force","Field; decoherence environment; spin bath"],
  ["变","Biàn","Change","Unitary evolution Ψ(t) = U(t)Ψ(0)"],
  ["数","Shù","Number","Quantization; Fibonacci sequence"],
  ["充","Chōng","Coherent / Full","Coherence state; maximally entangled"],
];

export default function AetherSymbolReferencePage(){
  const [tab,setTab]=useState<"notation"|"greek"|"cross">("notation");
  return(
    <div style={{minHeight:"100vh",background:BG,color:TEXT,padding:"40px 20px 80px",fontFamily:"'Inter',system-ui,sans-serif"}}>
      <div style={{maxWidth:980,margin:"0 auto"}}>
        <div style={{fontFamily:"monospace",fontSize:11,color:MUTED,letterSpacing:2,textTransform:"uppercase",marginBottom:8}}>AETHER Framework Documentation · v1.0</div>
        <h1 style={{fontSize:30,margin:"0 0 6px",fontWeight:700,background:`linear-gradient(90deg,${GOLD},${CYAN},${VIOLET})`,WebkitBackgroundClip:"text",backgroundClip:"text",color:"transparent"}}>
          Universal Symbol Reference
        </h1>
        <p style={{fontFamily:"monospace",fontSize:12,color:MUTED,margin:"0 0 24px"}}>Greek · Cyrillic · Mathematical · Cross-Script Derivations · AETHER Notation Standard</p>

        <div style={{background:PAN,border:`1px solid ${BORDER}`,borderRadius:12,padding:18,marginBottom:24}}>
          <div style={{fontFamily:"monospace",fontSize:11,color:GOLD,marginBottom:14,textTransform:"uppercase",letterSpacing:1}}>Live · φ-Lattice (Golden-Angle NV Layers)</div>
          <PhiLatticeCanvas/>
        </div>

        <div style={{display:"flex",gap:8,marginBottom:18,flexWrap:"wrap"}}>
          {([["notation","AETHER Notation Standard"],["greek","Greek Lowercase"],["cross","Cross-Script & Symbols"]] as const).map(([k,label])=>(
            <button key={k} onClick={()=>setTab(k)} style={{
              fontFamily:"monospace",fontSize:11,padding:"8px 14px",borderRadius:8,cursor:"pointer",
              border:`1px solid ${tab===k?GOLD:BORDER}`,background:tab===k?hexA(GOLD,0.12):PAN2,color:tab===k?GOLD:MUTED}}>{label}</button>
          ))}
        </div>

        {tab==="notation"&&(
          <>
            <div style={{background:PAN,border:`1px solid ${BORDER}`,borderRadius:12,padding:18,marginBottom:24}}>
              <div style={{fontFamily:"monospace",fontSize:11,color:VIOLET,marginBottom:14,textTransform:"uppercase",letterSpacing:1}}>Canonical Notation · these definitions supersede informal usage</div>
              <div style={{display:"grid",gap:7}}>
                {NOTATION.map(([sym,role,def,col])=>(
                  <div key={sym} style={{background:PAN2,border:`1px solid ${BORDER}`,borderLeft:`3px solid ${col}`,borderRadius:8,padding:"9px 14px",display:"flex",gap:12,alignItems:"baseline",flexWrap:"wrap"}}>
                    <span style={{fontFamily:"monospace",fontSize:20,color:col as string,minWidth:40}}>{sym}</span>
                    <span style={{fontSize:12.5,color:TEXT,fontWeight:600,minWidth:150}}>{role}</span>
                    <span style={{fontFamily:"monospace",fontSize:11,color:MUTED,flex:1,minWidth:220}}>{def}</span>
                  </div>
                ))}
              </div>
            </div>
            <div style={{background:PAN,border:`1px solid ${BORDER}`,borderRadius:12,padding:18,marginBottom:24}}>
              <div style={{fontFamily:"monospace",fontSize:11,color:CYAN,marginBottom:14,textTransform:"uppercase",letterSpacing:1}}>Five-Phase Loop Notation</div>
              <div style={{display:"grid",gap:6}}>
                {PHASES.map(([ph,sym,op,corr,col])=>(
                  <div key={ph} style={{display:"flex",gap:12,alignItems:"center",background:PAN2,border:`1px solid ${BORDER}`,borderRadius:8,padding:"8px 12px",flexWrap:"wrap"}}>
                    <span style={{fontSize:12.5,color:col as string,fontWeight:600,minWidth:90}}>{ph}</span>
                    <span style={{fontFamily:"monospace",fontSize:13,color:GOLD,minWidth:40}}>{sym}</span>
                    <span style={{fontFamily:"monospace",fontSize:11.5,color:TEXT,flex:1,minWidth:170}}>{op}</span>
                    <span style={{fontFamily:"monospace",fontSize:10.5,color:MUTED,flex:1,minWidth:170}}>{corr}</span>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}

        {tab==="greek"&&(
          <div style={{background:PAN,border:`1px solid ${BORDER}`,borderRadius:12,padding:18,marginBottom:24}}>
            <div style={{fontFamily:"monospace",fontSize:11,color:GREEN,marginBottom:14,textTransform:"uppercase",letterSpacing:1}}>Greek Lowercase · Physics Workhorses</div>
            <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(280px,1fr))",gap:7}}>
              {GREEK_LOWER.map(([g,name,use])=>(
                <div key={g} style={{background:PAN2,border:`1px solid ${BORDER}`,borderRadius:8,padding:"8px 12px",display:"flex",gap:10,alignItems:"baseline"}}>
                  <span style={{fontFamily:"monospace",fontSize:20,color:GOLD,minWidth:26}}>{g}</span>
                  <div>
                    <span style={{fontSize:12,color:CYAN,fontWeight:600}}>{name}</span>
                    <div style={{fontSize:11.5,color:MUTED,lineHeight:1.5}}>{use}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {tab==="cross"&&(
          <>
            <div style={{background:PAN,border:`1px solid ${BORDER}`,borderRadius:12,padding:18,marginBottom:24}}>
              <div style={{fontFamily:"monospace",fontSize:11,color:CYAN,marginBottom:8,textTransform:"uppercase",letterSpacing:1}}>Greek → Cyrillic Derivation (~80% derive from Greek uncial)</div>
              <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(280px,1fr))",gap:7}}>
                {CYRILLIC.map(([cy,gr,note])=>(
                  <div key={cy} style={{background:PAN2,border:`1px solid ${BORDER}`,borderRadius:8,padding:"9px 12px"}}>
                    <div style={{display:"flex",gap:10,alignItems:"baseline",marginBottom:3}}>
                      <span style={{fontFamily:"monospace",fontSize:16,color:VIOLET}}>{cy}</span>
                      <span style={{fontFamily:"monospace",fontSize:13,color:GOLD}}>← {gr}</span>
                    </div>
                    <div style={{fontSize:11.5,color:MUTED,lineHeight:1.5}}>{note}</div>
                  </div>
                ))}
              </div>
            </div>
            <div style={{background:PAN,border:`1px solid ${BORDER}`,borderRadius:12,padding:18,marginBottom:24}}>
              <div style={{fontFamily:"monospace",fontSize:11,color:GOLD,marginBottom:8,textTransform:"uppercase",letterSpacing:1}}>Chinese Logographs · Conceptual Parallels</div>
              <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(240px,1fr))",gap:7}}>
                {CHINESE.map(([ch,pin,mean,par])=>(
                  <div key={ch} style={{background:PAN2,border:`1px solid ${BORDER}`,borderRadius:8,padding:"9px 12px",display:"flex",gap:10,alignItems:"baseline"}}>
                    <span style={{fontSize:26,color:ROSE,minWidth:34}}>{ch}</span>
                    <div>
                      <span style={{fontSize:12,color:CYAN,fontWeight:600}}>{pin}</span>
                      <span style={{fontSize:11,color:MUTED}}> · {mean}</span>
                      <div style={{fontSize:11,color:MUTED,lineHeight:1.5}}>{par}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}

        <div style={{background:hexA(GOLD,0.04),border:`1px solid ${hexA(GOLD,0.2)}`,borderRadius:10,padding:"12px 16px",marginBottom:28,fontSize:12.5,color:MUTED,lineHeight:1.7}}>
          <strong style={{color:GOLD}}>Convention:</strong> when φ appears in an exponent (φ²) it always refers to the golden-ratio power, never a phase. Angular phases are written θ or Φ (uppercase) to avoid ambiguity. Scalars: lowercase italic. Vectors: bold lowercase. Operators: uppercase bold or hat notation (Ĥ, ρ̂, Û).
        </div>

        <div style={{display:"flex",flexWrap:"wrap",gap:14,paddingTop:20,borderTop:`1px solid ${BORDER}`,fontFamily:"monospace",fontSize:12}}>
          <Link href="/aether-whitepaper-v2" style={{color:CYAN,textDecoration:"none"}}>→ AETHER Whitepaper v2.0</Link>
          <Link href="/petrification-transformation" style={{color:ROSE,textDecoration:"none"}}>→ Petrification Transformation</Link>
          <Link href="/fibonacci-quaternion" style={{color:GOLD,textDecoration:"none"}}>→ Fibonacci–Quaternion</Link>
          <Link href="/" style={{color:MUTED,textDecoration:"none"}}>→ Knowledge Graph</Link>
        </div>
      </div>
    </div>
  );
}
