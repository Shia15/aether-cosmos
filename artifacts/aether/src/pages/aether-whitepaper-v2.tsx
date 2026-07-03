import { useEffect, useRef, useState } from "react";
import { Link } from "wouter";

const BG="#04060d",PAN="#0a0d1a",PAN2="#0d1020",BORDER="#182038",TEXT="#b8cce8",MUTED="#5a6e8c";
const GOLD="#ffb830",CYAN="#3fd8d0",VIOLET="#a87aff",GREEN="#50d49a",BLUE="#4ab0ff",ROSE="#ff5a6a";

function hexA(h:string,a:number){const n=h.replace("#","");return `rgba(${parseInt(n.slice(0,2),16)},${parseInt(n.slice(2,4),16)},${parseInt(n.slice(4,6),16)},${a})`;}
function fitCanvas(cv:HTMLCanvasElement,ctx:CanvasRenderingContext2D){const dpr=Math.min(2,window.devicePixelRatio||1);const w=cv.clientWidth||640;const h=cv.clientHeight||360;cv.width=Math.round(w*dpr);cv.height=Math.round(h*dpr);ctx.setTransform(dpr,0,0,dpr,0,0);return{w,h};}

const LOOP=[
  {n:"Sense",c:CYAN,d:"map the environment"},
  {n:"Deliver",c:GREEN,d:"transport signal to target"},
  {n:"Activate",c:GOLD,d:"trigger state change"},
  {n:"Feedback",c:BLUE,d:"process outcome"},
  {n:"Learn",c:VIOLET,d:"reduce entropy next cycle"},
];

/* Live five-phase loop ring — pulse orbits Sense→Deliver→Activate→Feedback→Learn; feedback toggle collapses to entropy */
function LoopCanvas(){
  const cvRef=useRef<HTMLCanvasElement|null>(null);
  const fbRef=useRef(1);
  useEffect(()=>{
    const cv=cvRef.current; if(!cv)return;
    const ctx=cv.getContext("2d"); if(!ctx)return;
    let raf=0,t=0;
    const loop=()=>{
      const{w,h}=fitCanvas(cv,ctx);
      t+=0.008;
      ctx.clearRect(0,0,w,h); ctx.fillStyle=BG; ctx.fillRect(0,0,w,h);
      const cx=w/2, cy=h/2, R=Math.min(w,h)*0.32;
      const fb=fbRef.current; // 1 = feedback enabled (coherence), 0 = blocked (entropy)
      const N=LOOP.length;
      // ring
      ctx.strokeStyle=hexA(fb>0.5?GOLD:ROSE,0.2); ctx.lineWidth=2;
      ctx.beginPath(); ctx.arc(cx,cy,R,0,Math.PI*2*(fb>0.5?1:0.8)); ctx.stroke();
      // nodes
      const pos:{x:number;y:number;c:string;n:string}[]=[];
      for(let i=0;i<N;i++){
        const a=-Math.PI/2+i*Math.PI*2/N;
        const x=cx+Math.cos(a)*R, y=cy+Math.sin(a)*R;
        pos.push({x,y,c:LOOP[i].c,n:LOOP[i].n});
      }
      // arrows between nodes
      for(let i=0;i<N;i++){
        if(i===N-1 && fb<0.5) break; // break the feedback arc → entropy
        const p=pos[i], q=pos[(i+1)%N];
        ctx.strokeStyle=hexA(p.c,0.4); ctx.lineWidth=2;
        ctx.beginPath(); ctx.moveTo(p.x,p.y); ctx.lineTo(q.x,q.y); ctx.stroke();
      }
      // orbiting pulse
      const prog=(t%1)*N;
      const idx=Math.floor(prog), frac=prog-idx;
      const p=pos[idx], q=pos[(idx+1)%N];
      let px=p.x+(q.x-p.x)*frac, py=p.y+(q.y-p.y)*frac;
      if(idx===N-1 && fb<0.5){ // pulse flies off outward = entropy escape
        const a=-Math.PI/2+idx*Math.PI*2/N;
        px=cx+Math.cos(a)*(R+frac*R*0.9); py=cy+Math.sin(a)*(R+frac*R*0.9);
      }
      ctx.fillStyle=fb>0.5?GOLD:ROSE;
      ctx.beginPath(); ctx.arc(px,py,7,0,Math.PI*2); ctx.fill();
      ctx.strokeStyle=hexA(fb>0.5?GOLD:ROSE,0.4); ctx.lineWidth=1;
      ctx.beginPath(); ctx.arc(px,py,14,0,Math.PI*2); ctx.stroke();
      // node dots + labels
      pos.forEach((n,i)=>{
        ctx.fillStyle=hexA(n.c,0.9);
        ctx.beginPath(); ctx.arc(n.x,n.y,9,0,Math.PI*2); ctx.fill();
        ctx.fillStyle=TEXT; ctx.font="600 12px sans-serif"; ctx.textAlign="center";
        const off=n.y<cy?-18:20;
        ctx.fillText(`${i+1}·${n.n}`,n.x,n.y+off);
      });
      ctx.textAlign="center";
      ctx.fillStyle=hexA(fb>0.5?GREEN:ROSE,0.95); ctx.font="600 14px sans-serif";
      ctx.fillText(fb>0.5?"COHERENCE":"ENTROPY",cx,cy-4);
      ctx.fillStyle=MUTED; ctx.font="10px monospace";
      ctx.fillText(fb>0.5?"feedback closed":"feedback blocked",cx,cy+14);
      ctx.textAlign="left";
      raf=requestAnimationFrame(loop);
    };
    raf=requestAnimationFrame(loop);
    return()=>cancelAnimationFrame(raf);
  },[]);
  return(
    <div>
      <canvas ref={cvRef} style={{width:"100%",height:360,display:"block",borderRadius:10,border:`1px solid ${BORDER}`}}/>
      <label style={{fontFamily:"monospace",fontSize:11,color:MUTED,display:"block",marginTop:12}}>
        Feedback arc
        <input type="range" min={0} max={1} step={0.01} defaultValue={1}
          onChange={e=>(fbRef.current=parseFloat(e.target.value))}
          style={{marginLeft:8,accentColor:GOLD,width:150}}/>
        <span style={{marginLeft:8}}>slide to 0 to break the loop → entropy</span>
      </label>
    </div>
  );
}

const WHY=[
  ["Oncology","Saturation chemotherapy","Mycelium-guided ferrofluid targeting","Precision over toxicity; closed feedback loop"],
  ["Computing","Dense multiplication (GPU/CPU)","Fibonacci sparse encoding (FQP ASIC)","10× energy efficiency; <10mW edge AI"],
  ["Photonic AI","Digital neural networks","Field-based analog reservoir (Q∼AETHER)","Physics performs computation; geometry is program"],
  ["Organization","Centralized control","Distributed sparse local interaction","Coherence without central authority"],
  ["IoT / Edge","Cloud-dependent inference","On-device Fibonacci-quantized AI","$1 chip; solar+vibration self-powered"],
];

const QLAYERS=[
  ["1 · Quantum Core","Ψ(i,j) = A·exp(iφ)","Sense",VIOLET],
  ["2 · Photonic Interference","Ψ′ = FFT2D(Ψ)","Deliver",BLUE],
  ["3 · Nonlinear Optical","φ′ = φ + α·|A|²","Activate",GOLD],
  ["4 · Fluidic Control","A′ = A·M(i,j)","Deliver",CYAN],
  ["5 · Bio-Adaptive","Hebbian reinforcement","Feedback + Learn",GREEN],
];

const PARTS=[
  {t:"Part I · The AETHER Framework",c:CYAN,b:"Scale-invariant coherence. Biological systems survive not by injecting force but through continuous feedback, sparse signaling, and local rules that produce global coherence. The loop is not a metaphor — it is the same operation at different resolutions of physical reality."},
  {t:"Part II · FQP-Edge-1 ASIC",c:GOLD,b:"Fibonacci Quantization Processor. TSMC 28nm → GF 22FDX · 4mm² die · <10mW @ 100MHz · 50–100 GOPS · 1000–2000 GOPS/W · <$1 @ 1M units · NRE $1.86M. Zeckendorf decomposition replaces multipliers with adder trees — an 8×8 systolic array at ~4mW."},
  {t:"Part III · Q∼AETHER Field Reservoir",c:VIOLET,b:"Photonic analog reservoir — geometry is the program, interference is the computation, adaptation is structural. Five layers; all necessary. Prototype ran 3 configs × 30 iterations to convergent field dynamics (779.6 / 462.2 / 534.7 AU)."},
  {t:"Part IV · Statistical Dynamics",c:GREEN,b:"Edge-of-chaos criticality. Power-law avalanches (exponents ~1.5–2.5). Zeckendorf sparsity mirrors neural firing. Firm growth follows the same heavy-tailed scaling (Hurst ~0.5–0.7). One mechanism: sparse local interaction → global coherence."},
  {t:"Part V · Unified Architecture",c:BLUE,b:"Six zoom levels on one dynamic system — Physical, Silicon, Photonic, Symbolic, Experiential, Resonant. A more precise ferrofluid makes the Emotion AI feedback more accurate. Not synergy — the structural consequence of a single closed loop."},
];

export default function AetherWhitepaperV2Page(){
  return(
    <div style={{minHeight:"100vh",background:BG,color:TEXT,padding:"40px 20px 80px",fontFamily:"'Inter',system-ui,sans-serif"}}>
      <div style={{maxWidth:980,margin:"0 auto"}}>
        <div style={{fontFamily:"monospace",fontSize:11,color:MUTED,letterSpacing:2,textTransform:"uppercase",marginBottom:8}}>AetherLife.co · Unified Research Whitepaper · v2.0</div>
        <h1 style={{fontSize:30,margin:"0 0 6px",fontWeight:700,background:`linear-gradient(90deg,${CYAN},${VIOLET},${GOLD})`,WebkitBackgroundClip:"text",backgroundClip:"text",color:"transparent"}}>
          AETHER — A Unified Framework for Emergent Intelligence
        </h1>
        <p style={{fontSize:14,color:MUTED,lineHeight:1.7,margin:"0 0 8px",maxWidth:780}}>
          Scale-Invariant Computation · Fibonacci Hardware · Resonant Systems · Bio-Adaptive AI. Four previously separate bodies of work describe the same underlying pattern operating at different scales of physical resolution.
        </p>
        <p style={{fontSize:14,fontStyle:"italic",color:CYAN,margin:"0 0 24px"}}>Resonance replaces fragmentation.</p>

        <div style={{background:PAN,border:`1px solid ${BORDER}`,borderRadius:12,padding:18,marginBottom:24}}>
          <div style={{fontFamily:"monospace",fontSize:11,color:GOLD,marginBottom:6,textTransform:"uppercase",letterSpacing:1}}>Live · The AETHER Loop</div>
          <div style={{fontSize:13,color:MUTED,marginBottom:14}}>Sense → Deliver → Activate → Feedback → Learn — one recursive loop across mycelium oncology, photonic computation, Fibonacci silicon, emotional AI, and wave physics.</div>
          <LoopCanvas/>
          <div style={{display:"flex",flexWrap:"wrap",gap:8,marginTop:12}}>
            {LOOP.map(l=>(
              <div key={l.n} style={{background:PAN2,border:`1px solid ${BORDER}`,borderLeft:`3px solid ${l.c}`,borderRadius:6,padding:"6px 10px",fontSize:11}}>
                <span style={{color:l.c,fontWeight:700}}>{l.n}</span> <span style={{color:MUTED}}>— {l.d}</span>
              </div>
            ))}
          </div>
        </div>

        <div style={{background:PAN,border:`1px solid ${BORDER}`,borderRadius:12,padding:18,marginBottom:24,overflowX:"auto"}}>
          <div style={{fontFamily:"monospace",fontSize:11,color:CYAN,marginBottom:14,textTransform:"uppercase",letterSpacing:1}}>Why It Matters — Current Paradigm vs AETHER</div>
          <div style={{display:"grid",gap:6}}>
            {WHY.map(([dom,cur,ae,adv])=>(
              <div key={dom} style={{display:"grid",gridTemplateColumns:"1fr 1.3fr 1.3fr 1.4fr",gap:10,background:PAN2,border:`1px solid ${BORDER}`,borderRadius:8,padding:"9px 12px",fontSize:11.5,minWidth:640}}>
                <span style={{color:GOLD,fontWeight:600}}>{dom}</span>
                <span style={{color:MUTED}}>{cur}</span>
                <span style={{color:GREEN}}>{ae}</span>
                <span style={{color:TEXT}}>{adv}</span>
              </div>
            ))}
          </div>
        </div>

        <div style={{display:"grid",gap:10,marginBottom:24}}>
          {PARTS.map(p=>(
            <div key={p.t} style={{background:PAN,border:`1px solid ${BORDER}`,borderLeft:`3px solid ${p.c}`,borderRadius:10,padding:16}}>
              <div style={{fontSize:14,fontWeight:700,color:p.c,marginBottom:6}}>{p.t}</div>
              <div style={{fontSize:12.5,color:MUTED,lineHeight:1.7}}>{p.b}</div>
            </div>
          ))}
        </div>

        <div style={{background:PAN,border:`1px solid ${BORDER}`,borderRadius:12,padding:18,marginBottom:24}}>
          <div style={{fontFamily:"monospace",fontSize:11,color:VIOLET,marginBottom:14,textTransform:"uppercase",letterSpacing:1}}>Q∼AETHER · Five-Layer Architecture</div>
          <div style={{display:"grid",gap:6}}>
            {QLAYERS.map(([name,op,phase,col])=>(
              <div key={name} style={{display:"flex",gap:12,alignItems:"center",background:PAN2,border:`1px solid ${BORDER}`,borderRadius:8,padding:"8px 12px",flexWrap:"wrap"}}>
                <span style={{fontSize:12.5,color:col as string,fontWeight:600,minWidth:190}}>{name}</span>
                <span style={{fontFamily:"monospace",fontSize:11.5,color:GOLD,flex:1,minWidth:150}}>{op}</span>
                <span style={{fontFamily:"monospace",fontSize:10.5,color:MUTED,minWidth:120}}>{phase}</span>
              </div>
            ))}
          </div>
        </div>

        <div style={{background:hexA(GOLD,0.05),border:`1px solid ${hexA(GOLD,0.22)}`,borderRadius:12,padding:20,marginBottom:28}}>
          <div style={{fontSize:13,fontWeight:700,color:GOLD,marginBottom:8}}>Conclusion</div>
          <p style={{fontSize:13,color:MUTED,lineHeight:1.8,margin:0}}>
            AETHER is not a technology — it is a recognition: that the pattern through which living systems maintain themselves against entropy is scale-invariant, physically real, and reproducible across domains previously treated as unrelated. From computation as abstraction to computation as ecology; from hidden logic to visible intelligence; from entropy to resonance; from fragmentation to coherence. The prototypes exist. The loop is running. The silicon is specced. The physics is simulated.
          </p>
        </div>

        <div style={{display:"flex",flexWrap:"wrap",gap:14,paddingTop:20,borderTop:`1px solid ${BORDER}`,fontFamily:"monospace",fontSize:12}}>
          <Link href="/complete-integration" style={{color:VIOLET,textDecoration:"none"}}>→ The Complete Integration</Link>
          <Link href="/aether-symbol-reference" style={{color:CYAN,textDecoration:"none"}}>→ Symbol Reference</Link>
          <Link href="/aether-synthesis" style={{color:GREEN,textDecoration:"none"}}>→ AETHER Synthesis</Link>
          <Link href="/aether-unified-framework" style={{color:GOLD,textDecoration:"none"}}>→ Unified Framework</Link>
          <Link href="/" style={{color:MUTED,textDecoration:"none"}}>→ Knowledge Graph</Link>
        </div>
      </div>
    </div>
  );
}
