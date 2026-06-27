import { useEffect, useRef, useState } from "react";
import katex from "katex";
import "katex/dist/katex.min.css";

const V = {
  bg:"#04060E",aurora:"#00FFB2",gold:"#C8A030",blue:"#4488FF",
  vio:"#9966FF",amb:"#FF9933",rose:"#FF6699",plasma:"#FF4477",
  green:"#44CC77",dim:"#3A5060",ink:"#B8CCE8",fire:"#FF6622",
};
const MONO="'Space Mono',monospace";
const SERIF="'Crimson Pro',serif";
const DISP="'Cinzel',serif";

function kx(tex: string, dm = false): string {
  try { return katex.renderToString(tex,{throwOnError:false,output:"html",displayMode:dm}); }
  catch { return tex; }
}

const GW = 96, GH = 54;

interface CoherenceCell { c: number; }

function hexRgb(h: string): [number,number,number] {
  return [parseInt(h.slice(1,3),16), parseInt(h.slice(3,5),16), parseInt(h.slice(5,7),16)];
}
function lerpN(a:number,b:number,t:number){return a+(b-a)*t;}

const cLo = hexRgb(V.plasma);
const cMd = hexRgb(V.blue);
const cHi = hexRgb(V.aurora);

function cellColor(c: number): string {
  let r,g,b;
  if (c < 0.5) {
    const t = c*2;
    r=Math.round(lerpN(cLo[0],cMd[0],t));
    g=Math.round(lerpN(cLo[1],cMd[1],t));
    b=Math.round(lerpN(cLo[2],cMd[2],t));
  } else {
    const t=(c-0.5)*2;
    r=Math.round(lerpN(cMd[0],cHi[0],t));
    g=Math.round(lerpN(cMd[1],cHi[1],t));
    b=Math.round(lerpN(cMd[2],cHi[2],t));
  }
  return `rgb(${r},${g},${b})`;
}

function EQ({tex,dm,label}:{tex:string;dm?:boolean;label?:string}){
  return (
    <div style={{margin:"18px 0",textAlign:"center",position:"relative"}}>
      {label && <div style={{fontFamily:MONO,fontSize:9,color:V.dim,letterSpacing:"0.15em",marginBottom:8}}>{label}</div>}
      <div
        style={{display:"inline-block",padding:"12px 24px",
          background:"rgba(0,255,178,0.04)",border:"1px solid rgba(0,255,178,0.12)",
          borderRadius:6,color:V.ink}}
        dangerouslySetInnerHTML={{__html:kx(tex,dm)}}
      />
    </div>
  );
}

function Chip({col,children}:{col:string;children:string}){
  return (
    <span style={{display:"inline-block",padding:"2px 10px",borderRadius:3,
      background:col+"18",border:`1px solid ${col}44`,
      fontFamily:MONO,fontSize:9,color:col,letterSpacing:"0.12em",marginRight:6,marginBottom:4}}>
      {children}
    </span>
  );
}

function Sec({n,title,col,children}:{n:string;title:string;col:string;children:React.ReactNode}){
  return (
    <div style={{marginBottom:52}}>
      <div style={{display:"flex",alignItems:"baseline",gap:14,marginBottom:18}}>
        <span style={{fontFamily:MONO,fontSize:9,color:col,letterSpacing:"0.2em"}}>{n}</span>
        <h2 style={{margin:0,fontFamily:DISP,fontSize:"1.15rem",fontWeight:400,
          color:col,letterSpacing:"0.12em"}}>{title}</h2>
        <div style={{flex:1,height:1,background:`linear-gradient(90deg,${col}44,transparent)`}}/>
      </div>
      {children}
    </div>
  );
}

function Para({children,style}:{children:React.ReactNode;style?:React.CSSProperties}){
  return (
    <p style={{fontFamily:SERIF,fontSize:"1.05rem",lineHeight:1.82,
      color:"rgba(184,204,232,0.82)",margin:"0 0 16px",...style}}>
      {children}
    </p>
  );
}

export default function CoherenceFieldTheory() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const gridRef   = useRef<CoherenceCell[][]>([]);
  const rafRef    = useRef<number>(0);
  const frameRef  = useRef<number>(0);
  const [paused, setPaused] = useState(false);
  const pausedRef = useRef(false);
  const [avgC, setAvgC] = useState(0);

  useEffect(()=>{
    const g:CoherenceCell[][]=[];
    for(let y=0;y<GH;y++){
      g.push([]);
      for(let x=0;x<GW;x++){
        g[y].push({c: Math.random()<0.28 ? Math.random() : 0});
      }
    }
    gridRef.current=g;
  },[]);

  useEffect(()=>{
    const canvas=canvasRef.current;
    if(!canvas) return;
    const ctx=canvas.getContext("2d");
    if(!ctx) return;

    const W=canvas.width, H=canvas.height;
    const cw=W/GW, ch=H/GH;
    const D=0.14, r=2.6, dt=0.18;

    function tick(){
      const g=gridRef.current;
      if(!g.length){rafRef.current=requestAnimationFrame(tick);return;}

      if(!pausedRef.current){
        const next:number[][]=[];
        let sum=0;
        for(let y=0;y<GH;y++){
          next.push([]);
          for(let x=0;x<GW;x++){
            const c=g[y][x].c;
            const up=g[(y-1+GH)%GH][x].c;
            const dn=g[(y+1)%GH][x].c;
            const lt=g[y][(x-1+GW)%GW].c;
            const rt=g[y][(x+1)%GW].c;
            const lap=up+dn+lt+rt-4*c;
            const react=r*c*(1-c)*(1-2*c);
            let nc=c+dt*(D*lap+react);
            nc=Math.max(0,Math.min(1,nc));
            next[y].push(nc);
            sum+=nc;
          }
        }
        for(let y=0;y<GH;y++) for(let x=0;x<GW;x++) g[y][x].c=next[y][x];

        if(frameRef.current%8===0) setAvgC(sum/(GW*GH));

        if(frameRef.current%100===0){
          const rx=Math.floor(Math.random()*GW);
          const ry=Math.floor(Math.random()*GH);
          for(let dy=-3;dy<=3;dy++) for(let dx=-3;dx<=3;dx++){
            const nx=(rx+dx+GW)%GW, ny=(ry+dy+GH)%GH;
            g[ny][nx].c=Math.random();
          }
        }
        frameRef.current++;
      }

      ctx.fillStyle="#010308";
      ctx.fillRect(0,0,W,H);
      for(let y=0;y<GH;y++){
        for(let x=0;x<GW;x++){
          const c=g[y][x].c;
          ctx.fillStyle=cellColor(c);
          ctx.globalAlpha=0.12+c*0.88;
          ctx.fillRect(x*cw,y*ch,cw-0.4,ch-0.4);
        }
      }
      ctx.globalAlpha=1;
      rafRef.current=requestAnimationFrame(tick);
    }
    rafRef.current=requestAnimationFrame(tick);
    return ()=>cancelAnimationFrame(rafRef.current);
  },[]);

  function togglePause(){
    pausedRef.current=!pausedRef.current;
    setPaused(p=>!p);
  }

  const pct=(avgC*100).toFixed(1);

  return (
    <div style={{minHeight:"100vh",background:V.bg,padding:"48px 24px 80px",
      maxWidth:860,margin:"0 auto"}}>

      {/* ── Head ── */}
      <div style={{marginBottom:48}}>
        <div style={{fontFamily:MONO,fontSize:8,color:V.aurora+"88",
          letterSpacing:"0.25em",marginBottom:12}}>
          AETHER RESEARCH -- SPECULATIVE FRAMEWORK
        </div>
        <h1 style={{margin:"0 0 10px",fontFamily:DISP,fontSize:"clamp(1.6rem,4vw,2.4rem)",
          fontWeight:400,color:V.aurora,letterSpacing:"0.18em",lineHeight:1.15}}>
          COHERENCE FIELD THEORY
        </h1>
        <div style={{fontFamily:SERIF,fontSize:"1.1rem",color:V.gold,
          letterSpacing:"0.06em",marginBottom:20}}>
          Substrate Quantization and the Epigenetic Distribution Network
        </div>
        <div style={{display:"flex",flexWrap:"wrap" as const,gap:6,marginBottom:20}}>
          <Chip col={V.aurora}>Coherence Field</Chip>
          <Chip col={V.blue}>Order Parameter</Chip>
          <Chip col={V.green}>Reaction Diffusion</Chip>
          <Chip col={V.gold}>Slime Substrate</Chip>
          <Chip col={V.vio}>Epigenetics</Chip>
          <Chip col={V.amb}>Gravity as Network</Chip>
        </div>
        <div style={{height:1,background:`linear-gradient(90deg,${V.aurora}44,transparent)`}}/>
      </div>

      {/* ── Abstract ── */}
      <div style={{marginBottom:44,padding:"24px 28px",
        background:"rgba(0,255,178,0.04)",border:"1px solid rgba(0,255,178,0.14)",
        borderRadius:8}}>
        <div style={{fontFamily:MONO,fontSize:8,color:V.aurora,
          letterSpacing:"0.2em",marginBottom:12}}>ABSTRACT</div>
        <Para>
          We present a speculative mathematical framework that unifies three conceptual threads:
          the quantization of continuous biological slime substrates into discrete epigenetic
          state distributions; a variational field theory for a complex order parameter
          governed by two fundamental derivative classes; and a network-geometric reinterpretation
          of gravity as a coherence distribution rule across curved local state space.
          The central object is the coherence scalar C(x,t), measuring the degree to which
          a substrate's actual entropy state aligns with its optimal reference manifold.
          Below, a live Allen-Cahn simulation demonstrates spontaneous coherence domain formation
          -- the self-organizing behavior this framework predicts at every scale.
        </Para>
        <div style={{fontFamily:MONO,fontSize:9,color:V.dim,marginTop:4}}>
          Status: Speculative hypothesis -- requires rigorous derivation and empirical testing
        </div>
      </div>

      {/* ── Live Canvas ── */}
      <div style={{marginBottom:52}}>
        <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",
          marginBottom:10}}>
          <div>
            <div style={{fontFamily:MONO,fontSize:8,color:V.aurora+"88",
              letterSpacing:"0.22em",marginBottom:2}}>LIVE COHERENCE FIELD SIMULATION</div>
            <div style={{fontFamily:MONO,fontSize:9,color:V.dim}}>
              Allen-Cahn bistable reaction-diffusion -- C(x,t) domain formation
            </div>
          </div>
          <div style={{display:"flex",alignItems:"center",gap:16}}>
            <div style={{textAlign:"right" as const}}>
              <div style={{fontFamily:MONO,fontSize:8,color:V.dim}}>MEAN COHERENCE</div>
              <div style={{fontFamily:MONO,fontSize:"1.1rem",color:avgC>0.5?V.aurora:V.plasma}}>
                {pct}%
              </div>
            </div>
            <button onClick={togglePause}
              style={{fontFamily:MONO,fontSize:8,letterSpacing:"0.15em",
                padding:"8px 16px",background:"transparent",cursor:"pointer",
                border:`1px solid ${paused?V.aurora:V.dim}`,
                color:paused?V.aurora:V.dim,borderRadius:4}}>
              {paused?"RESUME":"PAUSE"}
            </button>
          </div>
        </div>

        <canvas ref={canvasRef} width={864} height={486}
          style={{width:"100%",borderRadius:6,
            border:"1px solid rgba(0,255,178,0.12)",display:"block"}}/>

        <div style={{display:"flex",gap:24,marginTop:10,justifyContent:"center"}}>
          {[["PLASMA","Low coherence",V.plasma],["BLUE","Transitional",V.blue],["AURORA","High coherence",V.aurora]].map(([k,l,c])=>(
            <div key={k} style={{display:"flex",alignItems:"center",gap:6}}>
              <div style={{width:10,height:10,borderRadius:2,background:c as string,
                boxShadow:`0 0 6px ${c}`}}/>
              <span style={{fontFamily:MONO,fontSize:8,color:(c as string)+"99"}}>{l}</span>
            </div>
          ))}
        </div>
      </div>

      {/* ── Section I: Substrate Quantization ── */}
      <Sec n="I" title="SUBSTRATE QUANTIZATION" col={V.gold}>
        <Para>
          A slime substrate is a continuous, adaptive biological medium whose properties --
          viscosity, ion concentration, cytoskeletal tension, signaling molecule density --
          vary smoothly across space and time. To analyze such a system mathematically,
          we <em>quantize</em> it: we represent its continuous properties as a finite set
          of discrete state classes, each occupying a defined region of phase space.
        </Para>
        <Para>
          The resulting discrete state distribution is the <strong style={{color:V.gold}}>epigenetic
          distribution network spectrum</strong> -- a mapping from spatial substrate coordinates
          to quantized state indices, with transition probabilities between adjacent states
          governed by local gradients rather than arbitrary jumps.
        </Para>
        <div style={{padding:"16px 20px",background:"rgba(200,160,48,0.06)",
          border:"1px solid rgba(200,160,48,0.18)",borderRadius:6,marginBottom:16}}>
          <div style={{fontFamily:MONO,fontSize:9,color:V.gold,letterSpacing:"0.15em",marginBottom:8}}>
            KEY INSIGHT
          </div>
          <Para style={{margin:0}}>
            "There were only two derivatives per action" -- each state transition in the
            network depends on exactly two rate-of-change classes: a <em>spatial derivative</em>
            (how the state differs from its neighbors) and a <em>temporal derivative</em>
            (how the state is changing in time). This minimal-derivative constraint is
            the biological analog of locality in field theory.
          </Para>
        </div>
        <EQ tex="\Delta S_{\text{action}} = f\!\left(\frac{\partial \psi}{\partial t},\, \nabla \psi\right)" dm label="TWO-DERIVATIVE ACTION CONSTRAINT"/>
      </Sec>

      {/* ── Section II: Mathematical Framework ── */}
      <Sec n="II" title="MATHEMATICAL FRAMEWORK" col={V.aurora}>
        <Para>
          We define the coherence scalar C(x,t) as the normalized alignment between
          the substrate's current entropy state E and its optimal reference manifold S*.
          When the substrate is maximally self-organized, C approaches unity. When it
          is fully disordered, C approaches zero.
        </Para>
        <EQ tex="C(x,t) = 1 - \frac{\|E\|}{\|S^*\|}" dm label="COHERENCE SCALAR"/>
        <Para>
          The complex order parameter psi encodes the full state of the substrate field.
          Its dynamics are governed by a variational action S[psi] of the form:
        </Para>
        <EQ tex="S[\psi] = \int d^4x \left[\frac{1}{2}(\partial_\mu \psi)^2 - V(\psi, C)\right]" dm label="VARIATIONAL ACTION"/>
        <Para>
          The interaction potential V couples the order parameter to the coherence field
          through two terms: a nonlinear self-interaction scaled by C, and a
          phi-anchoring term that binds the field to a reference soliton phi:
        </Para>
        <EQ tex="V(\psi, C) = \beta|\psi|^2(\psi \cdot C) + \lambda_\phi|\psi - \phi|^2" dm label="INTERACTION POTENTIAL"/>
        <Para>
          Applying the Euler-Lagrange equations to this action yields the field equation
          of motion. In the over-damped (biological) limit, this reduces to a
          reaction-diffusion equation of Allen-Cahn type -- precisely what the canvas
          above is simulating:
        </Para>
        <EQ tex="\partial_t \psi = D\,\nabla^2\psi + r\,\psi(1-\psi)(1-2\psi)" dm label="COHERENCE FIELD EQUATION (ALLEN-CAHN LIMIT)"/>

        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:16,marginTop:8}}>
          {[
            {sym:"D",desc:"Diffusion coefficient -- spatial coupling strength",col:V.blue},
            {sym:"r",desc:"Reaction rate -- bistable switching speed",col:V.aurora},
            {sym:"\\beta",desc:"Nonlinear self-interaction -- coherence amplification",col:V.gold},
            {sym:"\\lambda_\\phi",desc:"Phi-anchoring strength -- soliton binding",col:V.vio},
          ].map(({sym,desc,col})=>(
            <div key={sym} style={{padding:"12px 16px",
              background:"rgba(4,6,18,0.6)",border:`1px solid ${col}22`,borderRadius:6}}>
              <div style={{display:"flex",alignItems:"baseline",gap:10}}>
                <span dangerouslySetInnerHTML={{__html:kx(sym)}}
                  style={{color:col,fontSize:"1.1rem"}}/>
                <span style={{fontFamily:MONO,fontSize:9,color:V.dim,lineHeight:1.5}}>{desc}</span>
              </div>
            </div>
          ))}
        </div>

        <div style={{marginTop:24,padding:"18px 22px",
          background:"rgba(255,68,119,0.05)",border:"1px solid rgba(255,68,119,0.18)",
          borderRadius:6}}>
          <div style={{fontFamily:MONO,fontSize:9,color:V.plasma,letterSpacing:"0.15em",marginBottom:8}}>
            OPEN QUESTIONS (SCIENTIFIC REQUIREMENT)
          </div>
          <Para style={{margin:0,fontSize:"0.95rem"}}>
            For this framework to advance beyond speculation, each constant requires
            physical units and a measurement protocol; the symmetry motivating the
            interaction terms must be identified; Lorentz invariance (or its biological
            analog) must be checked; and at least one quantitative prediction derivable
            from the action must be compared against experimental data.
          </Para>
        </div>
      </Sec>

      {/* ── Section III: Gravity as Network ── */}
      <Sec n="III" title="GRAVITY AS COHERENCE DISTRIBUTION" col={V.vio}>
        <Para>
          General Relativity describes gravity through spacetime curvature: mass-energy
          warps geometry, and freely-falling objects follow geodesics -- the straightest
          paths through that curved geometry. In network language, this maps onto:
        </Para>
        <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:12,marginBottom:20}}>
          {[
            {label:"NODES",val:"Concentrations of mass-energy",col:V.gold},
            {label:"EDGES",val:"Local spacetime geometry connections",col:V.blue},
            {label:"FIELD",val:"Continuous curvature distribution",col:V.vio},
          ].map(({label,val,col})=>(
            <div key={label} style={{padding:"14px 16px",textAlign:"center" as const,
              background:`${col}0C`,border:`1px solid ${col}33`,borderRadius:6}}>
              <div style={{fontFamily:MONO,fontSize:8,color:col,letterSpacing:"0.18em",marginBottom:6}}>{label}</div>
              <div style={{fontFamily:SERIF,fontSize:"0.9rem",color:"rgba(184,204,232,0.7)",lineHeight:1.5}}>{val}</div>
            </div>
          ))}
        </div>
        <Para>
          Within the substrate quantization framework, gravity can be reinterpreted
          as the <strong style={{color:V.vio}}>distribution rule that continuously reorganizes
          trajectories through a quantized network of local geometric states</strong>.
          This is not an established physical claim -- it is a structural analogy that
          highlights why the two-derivative constraint appears in both biological networks
          and gravitational field equations.
        </Para>
        <EQ tex="\text{Matter/Energy} \;\to\; \text{Curvature of Spacetime} \;\to\; \text{Motion}" dm label="EINSTEIN'S CHAIN (CONCEPTUAL)"/>
        <EQ tex="\text{Substrate State} \;\to\; C(x,t) \;\text{field} \;\to\; \text{Epigenetic Trajectory}" dm label="BIOLOGICAL ANALOG"/>
        <Para>
          The structural similarity between these two chains -- an intensive field
          (curvature or coherence) mediating the trajectory of objects through a
          quantized state space -- motivates the hypothesis that both are instances
          of a deeper geometry-distribution duality operating at different scales.
        </Para>
      </Sec>

      {/* ── Section IV: Research Path ── */}
      <Sec n="IV" title="PATH TO VALIDATION" col={V.amb}>
        <Para>
          A productive narrowing strategy focuses on one mathematically precise
          component before attempting unification. The recommended progression:
        </Para>
        <div style={{display:"flex",flexDirection:"column" as const,gap:10}}>
          {[
            {n:"01",title:"Definitions",desc:"Assign explicit units to E, S*, and every constant. State what instrument measures each quantity and what the measurement uncertainty is.",col:V.amb},
            {n:"02",title:"Mathematical consistency",desc:"Derive conservation laws from the action. Identify symmetries (gauge, discrete, continuous). Show that bistable solutions are stable under small perturbations.",col:V.gold},
            {n:"03",title:"Quantitative prediction",desc:"Select a single measurable quantity -- e.g. the domain-wall velocity between coherent and incoherent regions in a slime mold network -- and derive its value from the field equation.",col:V.aurora},
            {n:"04",title:"Experimental falsification",desc:"Design a biological or computational experiment whose outcome would rule out the model. Compare domain statistics from the Allen-Cahn simulation against published physarum polycephalum data.",col:V.green},
          ].map(({n,title,desc,col})=>(
            <div key={n} style={{display:"flex",gap:16,padding:"16px 20px",
              background:`${col}08`,border:`1px solid ${col}28`,borderRadius:6}}>
              <div style={{fontFamily:MONO,fontSize:"1.2rem",color:col,
                letterSpacing:"0.1em",minWidth:28,lineHeight:1}}>{n}</div>
              <div>
                <div style={{fontFamily:MONO,fontSize:9,color:col,
                  letterSpacing:"0.15em",marginBottom:6}}>{title.toUpperCase()}</div>
                <Para style={{margin:0,fontSize:"0.95rem"}}>{desc}</Para>
              </div>
            </div>
          ))}
        </div>
      </Sec>

      {/* ── Footer ── */}
      <div style={{borderTop:`1px solid ${V.dim}44`,paddingTop:28,
        display:"flex",justifyContent:"space-between",alignItems:"center",
        flexWrap:"wrap" as const,gap:12}}>
        <div>
          <div style={{fontFamily:MONO,fontSize:8,color:V.dim,letterSpacing:"0.18em"}}>AETHER KNOWLEDGE SYSTEM</div>
          <div style={{fontFamily:SERIF,fontSize:"0.85rem",color:V.dim,marginTop:3}}>
            Coherence Field Theory -- Speculative Research Framework
          </div>
        </div>
        <div style={{fontFamily:MONO,fontSize:8,color:V.dim,textAlign:"right" as const}}>
          <div>Simulation: Allen-Cahn bistable PDE</div>
          <div style={{marginTop:3}}>D = 0.14 | r = 2.6 | dt = 0.18</div>
        </div>
      </div>
    </div>
  );
}
