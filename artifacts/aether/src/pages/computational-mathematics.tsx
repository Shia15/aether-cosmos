import { useEffect, useRef } from "react";
import { Link } from "wouter";

const BG="#04060d",PAN="#0a0d1a",PAN2="#0d1020",BORDER="#182038",TEXT="#b8cce8",MUTED="#5a6e8c";
const GOLD="#ffb830",CYAN="#3fd8d0",VIOLET="#a87aff",GREEN="#50d49a",BLUE="#4ab0ff",ROSE="#ff5a6a";

function hexA(h:string,a:number){const n=h.replace("#","");return `rgba(${parseInt(n.slice(0,2),16)},${parseInt(n.slice(2,4),16)},${parseInt(n.slice(4,6),16)},${a})`;}
function fitCanvas(cv:HTMLCanvasElement,ctx:CanvasRenderingContext2D){const dpr=Math.min(2,window.devicePixelRatio||1);const w=cv.clientWidth||640;const h=cv.clientHeight||280;cv.width=Math.round(w*dpr);cv.height=Math.round(h*dpr);ctx.setTransform(dpr,0,0,dpr,0,0);return{w,h};}

/* Fano plane — 7 points, 7 lines, octonion multiplication */
function FanoCanvas(){
  const cvRef=useRef<HTMLCanvasElement|null>(null);
  const tRef=useRef(0);

  useEffect(()=>{
    const cv=cvRef.current; if(!cv)return;
    const ctx=cv.getContext("2d"); if(!ctx)return;
    let raf=0;

    // 7 Fano plane points (projective plane PG(2,2))
    const FANO_LINES=[[0,1,3],[1,2,4],[2,3,5],[3,4,6],[4,5,0],[5,6,1],[6,0,2]];

    const loop=()=>{
      const{w,h}=fitCanvas(cv,ctx);
      tRef.current+=0.008;
      const t=tRef.current;
      ctx.clearRect(0,0,w,h);
      ctx.fillStyle=BG; ctx.fillRect(0,0,w,h);

      const cx=w*0.5, cy=h*0.5;
      const R=Math.min(w,h)*0.38;
      const r=R*0.42; // inner circle point

      // 6 outer points on circle + 1 centre
      const pts:number[][]=[];
      for(let i=0;i<6;i++){
        const ang=(i/6)*Math.PI*2-Math.PI/2;
        pts.push([cx+Math.cos(ang)*R, cy+Math.sin(ang)*R]);
      }
      pts.push([cx,cy]); // pt 6 = centre

      const COLS=[CYAN,GOLD,VIOLET,GREEN,BLUE,ROSE,GOLD];

      // draw lines (each is a "line" in PG(2,2))
      FANO_LINES.forEach(([a,b,c],li)=>{
        const pulse=0.5+0.4*Math.sin(t*1.4+li);
        ctx.strokeStyle=hexA(COLS[li],0.25+pulse*0.25);
        ctx.lineWidth=1.6;
        // draw 3-point line as a curve through all 3 points
        const [ax,ay]=pts[a],[bx,by]=pts[b],[cx2,cy2]=pts[c];
        ctx.beginPath();
        ctx.moveTo(ax,ay);
        // control point = centroid offset
        const mx=(ax+bx+cx2)/3, my=(ay+by+cy2)/3;
        ctx.quadraticCurveTo(mx,my,cx2,cy2);
        ctx.stroke();
        ctx.beginPath(); ctx.moveTo(ax,ay); ctx.lineTo(bx,by); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(bx,by); ctx.lineTo(cx2,cy2); ctx.stroke();
      });

      // inner circle (the 7th "line" in Fano plane)
      ctx.strokeStyle=hexA(CYAN,0.18);
      ctx.lineWidth=1;
      ctx.beginPath(); ctx.arc(cx,cy,r,0,Math.PI*2); ctx.stroke();

      // draw points
      pts.forEach(([px,py],i)=>{
        const pulse=0.7+0.3*Math.sin(t*2+i*1.1);
        ctx.fillStyle=COLS[i];
        ctx.shadowColor=COLS[i]; ctx.shadowBlur=12*pulse;
        ctx.beginPath(); ctx.arc(px,py,7,0,Math.PI*2); ctx.fill();
        ctx.shadowBlur=0;
        ctx.fillStyle=TEXT; ctx.font="bold 11px monospace";
        ctx.fillText(`e${i+1}`,px+9,py-6);
      });

      // title
      ctx.fillStyle=hexA(MUTED,0.8); ctx.font="11px monospace";
      ctx.fillText("Fano Plane · PG(2,2) · 7 points, 7 lines",8,h-12);

      raf=requestAnimationFrame(loop);
    };
    raf=requestAnimationFrame(loop);
    return()=>cancelAnimationFrame(raf);
  },[]);

  return <canvas ref={cvRef} style={{width:"100%",height:280,display:"block",borderRadius:10,border:`1px solid ${BORDER}`}}/>;
}

const ALGEBRA_TABLE=[
  {alg:"Reals ℝ",dim:"1D",lost:"—",app:"Scalar quantities, classical physics"},
  {alg:"Complex ℂ",dim:"2D",lost:"—",app:"2D rotation, wave functions, signal processing"},
  {alg:"Quaternions ℍ",dim:"4D",lost:"Commutativity",app:"3D rotation (gimbal-lock-free), robotics, VR, GR spinors"},
  {alg:"Octonions 𝕆",dim:"8D",lost:"Associativity",app:"Unified field theory, Standard Model, GR generalizations"},
  {alg:"Sedenions",dim:"16D",lost:"Division algebra",app:"Speculative; zero divisors appear"},
];

const QUAT_RULES=[
  "i² = j² = k² = ijk = −1",
  "ij = k,  jk = i,  ki = j",
  "ji = −k, kj = −i, ik = −j",
  "q = a + bi + cj + dk",
  "Rotation: v′ = qvq⁻¹",
];

const FANO_LINES_TXT=[
  "{e₁,e₂,e₄}","  {e₂,e₃,e₅}","  {e₃,e₄,e₆}","  {e₄,e₅,e₇}",
  "{e₅,e₆,e₁}","  {e₆,e₇,e₂}","  {e₇,e₁,e₃}",
];

const EINSTEIN_EQ="G_μν + Λg_μν = (8πG/c⁴)·T_μν";
const ENERGY_TRIANGLE="E² = (pc)² + (mc²)²";

const FIVE_PHASE=[
  {ph:"Sense",bio:"Sensory receptors",comp:"Input encoding",geo:"Seismic strain"},
  {ph:"Deliver",bio:"Vascular transport",comp:"FFT propagation",geo:"Ridge push"},
  {ph:"Activate",bio:"Stem cell activation",comp:"Nonlinear modulation",geo:"Slab pull"},
  {ph:"Feedback",bio:"Cytokine loops",comp:"Hebbian adaptation",geo:"Mantle convection"},
  {ph:"Learn",bio:"Epigenetic memory",comp:"Model update",geo:"Lithospheric memory"},
];

const SECTIONS=[
  {n:"Abstract",col:CYAN,txt:"This white paper proposes a unified computational framework extending traditional real and complex arithmetic into hypercomplex algebras — quaternions (4D), octonions (8D) — guided by three structural pillars: Einstein's general relativity as the paradigmatic case of non-linear mathematical breakdown; triangular geometric representations (the relativistic energy-momentum triangle and the Fano plane); and Fano coherence, the algebraic consistency principle underlying octonion multiplication. The framework grounds AETHER's Scale-Invariant Five-Phase Loop in rigorous algebraic formalism."},
  {n:"Core Thesis",col:GOLD,txt:"Standard arithmetic is foundational but insufficient. GR reveals that reality operates in a register our basic number systems cannot reach. Expanding computational mathematics through hypercomplex algebras — anchored by Fano coherence and triangular geometry — provides the structural vocabulary AETHER needs to make its cross-domain claims rigorous."},
  {n:"The Demand for Expansion",col:VIOLET,txt:"Einstein's GR breaks the assumption of flatness. Its governing equations are coupled, non-linear PDEs in which the geometry of space determines the motion of matter, and the distribution of matter determines the geometry of space. This feedback loop cannot be captured by linear mathematics. The non-linearity enters because the metric tensor g_μν — which defines measurement — appears in both the curvature tensor G_μν and in how the stress-energy T_μν is constructed. The measurement apparatus depends on what is being measured."},
  {n:"Fano Coherence as Architectural Principle",col:GREEN,txt:"The Fano plane's triangular structure provides Fano coherence: a consistency condition ensuring that despite the loss of associativity, the octonion algebra retains its division property and internal integrity. Without the Fano plane's organizing structure, octonion multiplication would collapse into inconsistency. Fano coherence represents a general principle: high-dimensional, non-commutative, non-associative systems can remain coherent if structured by a sufficiently rich combinatorial geometry. For AETHER's cross-domain structural identity claims, this is directly relevant: the claim that biological systems, computational architectures, and tectonic dynamics share structural identity requires a coherence principle analogous to the Fano plane."},
];

export default function ComputationalMathematicsPage(){
  return(
    <div style={{minHeight:"100vh",background:BG,color:TEXT,padding:"40px 20px 80px",fontFamily:"'Inter',system-ui,sans-serif"}}>
      <div style={{maxWidth:980,margin:"0 auto"}}>
        <div style={{fontFamily:"monospace",fontSize:11,color:MUTED,letterSpacing:2,textTransform:"uppercase",marginBottom:8}}>AETHER · White Paper · 2026 · Shia Miller</div>
        <h1 style={{fontSize:30,margin:"0 0 8px",fontWeight:700,background:`linear-gradient(90deg,${CYAN},${VIOLET},${GOLD})`,WebkitBackgroundClip:"text",backgroundClip:"text",color:"transparent"}}>
          Expanding Computational Mathematics
        </h1>
        <p style={{fontFamily:"monospace",fontSize:12,color:MUTED,margin:"0 0 24px"}}>Integrating Einstein's Relativity, Triangular Geometries, Fano Coherence, and AETHER Architectures</p>

        <div style={{background:PAN,border:`1px solid ${BORDER}`,borderRadius:12,padding:18,marginBottom:24}}>
          <div style={{fontFamily:"monospace",fontSize:11,color:CYAN,marginBottom:12,textTransform:"uppercase",letterSpacing:1}}>Fano Plane · Live · The organizing geometry of octonion multiplication</div>
          <FanoCanvas/>
          <p style={{fontFamily:"monospace",fontSize:11,color:MUTED,marginTop:8}}>
            Each of the 7 oriented lines {"{"}eᵢ,eⱼ,eₖ{"}"} gives an octonion triple: eᵢeⱼ = eₖ. The Fano plane imposes just enough constraint to maintain the division property despite non-associativity.
          </p>
        </div>

        {SECTIONS.map(s=>(
          <div key={s.n} style={{background:PAN,border:`1px solid ${BORDER}`,borderRadius:10,padding:"14px 16px",marginBottom:14}}>
            <div style={{fontFamily:"monospace",fontSize:12,color:s.col,marginBottom:6,fontWeight:600}}>{s.n}</div>
            <p style={{margin:0,fontSize:13.5,color:TEXT,lineHeight:1.75}}>{s.txt}</p>
          </div>
        ))}

        <div style={{background:PAN,border:`1px solid ${BORDER}`,borderRadius:12,padding:18,marginBottom:24,marginTop:24}}>
          <div style={{fontFamily:"monospace",fontSize:11,color:GOLD,marginBottom:14,textTransform:"uppercase",letterSpacing:1}}>The Algebraic Ladder · Cayley-Dickson Construction</div>
          <div style={{overflowX:"auto"}}>
            <table style={{width:"100%",borderCollapse:"collapse",fontFamily:"monospace",fontSize:12}}>
              <thead><tr>{["Algebra","Dimension","Property Lost","Key Application"].map(h=>(
                <th key={h} style={{textAlign:"left",padding:"8px 10px",borderBottom:`1px solid ${BORDER}`,color:CYAN,fontWeight:600,fontSize:11,textTransform:"uppercase",letterSpacing:1}}>{h}</th>
              ))}</tr></thead>
              <tbody>{ALGEBRA_TABLE.map((r,i)=>(
                <tr key={r.alg} style={{background:i%2===0?PAN2:"transparent"}}>
                  <td style={{padding:"7px 10px",color:GOLD}}>{r.alg}</td>
                  <td style={{padding:"7px 10px",color:CYAN}}>{r.dim}</td>
                  <td style={{padding:"7px 10px",color:ROSE}}>{r.lost}</td>
                  <td style={{padding:"7px 10px",color:MUTED}}>{r.app}</td>
                </tr>
              ))}</tbody>
            </table>
          </div>
        </div>

        <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(280px,1fr))",gap:16,marginBottom:24}}>
          <div style={{background:PAN,border:`1px solid ${BORDER}`,borderRadius:12,padding:18}}>
            <div style={{fontFamily:"monospace",fontSize:11,color:VIOLET,marginBottom:12,textTransform:"uppercase",letterSpacing:1}}>Quaternion Multiplication Rules</div>
            {QUAT_RULES.map(r=>(
              <div key={r} style={{fontFamily:"monospace",fontSize:12.5,color:GOLD,padding:"4px 0",borderBottom:`1px solid ${hexA(BORDER,0.5)}`}}>{r}</div>
            ))}
            <p style={{fontSize:12,color:MUTED,lineHeight:1.6,marginTop:10}}>Non-commutativity is the feature, not a bug: 3D rotation is inherently non-commutative. Quaternions encode this naturally. The sandwich product v′ = qvq⁻¹ gives singularity-free rotation.</p>
          </div>
          <div style={{background:PAN,border:`1px solid ${BORDER}`,borderRadius:12,padding:18}}>
            <div style={{fontFamily:"monospace",fontSize:11,color:GREEN,marginBottom:12,textTransform:"uppercase",letterSpacing:1}}>Fano Lines · Octonion Triples</div>
            <div style={{fontFamily:"monospace",fontSize:12.5,color:GOLD}}>
              {FANO_LINES_TXT.map((l,i)=><div key={i} style={{padding:"3px 0",color:i%2===0?GOLD:CYAN}}>{l}</div>)}
            </div>
            <p style={{fontSize:12,color:MUTED,lineHeight:1.6,marginTop:10}}>Each oriented line gives eᵢeⱼ = eₖ. The 7 lines of the Fano plane encode all 480 sign choices for the 7 imaginary units, maintaining the division property despite non-associativity.</p>
          </div>
          <div style={{background:PAN,border:`1px solid ${BORDER}`,borderRadius:12,padding:18}}>
            <div style={{fontFamily:"monospace",fontSize:11,color:BLUE,marginBottom:12,textTransform:"uppercase",letterSpacing:1}}>Einstein Field Equations</div>
            <div style={{fontFamily:"monospace",fontSize:13,color:GOLD,padding:"8px 0",marginBottom:8}}>{EINSTEIN_EQ}</div>
            <div style={{fontFamily:"monospace",fontSize:13,color:CYAN,padding:"8px 0",marginBottom:8}}>{ENERGY_TRIANGLE}</div>
            <p style={{fontSize:12,color:MUTED,lineHeight:1.6}}>GR makes the measurement apparatus dependent on what is being measured. Hypercomplex algebras — with built-in non-commutativity and non-associativity — provide algebraic structures where operations are inherently sensitive to context and ordering, matching GR's geometric character.</p>
          </div>
        </div>

        <div style={{background:PAN,border:`1px solid ${BORDER}`,borderRadius:12,padding:18,marginBottom:24}}>
          <div style={{fontFamily:"monospace",fontSize:11,color:CYAN,marginBottom:14,textTransform:"uppercase",letterSpacing:1}}>AETHER Scale-Invariant Five-Phase Loop · Algebraic Formalization</div>
          <div style={{overflowX:"auto"}}>
            <table style={{width:"100%",borderCollapse:"collapse",fontFamily:"monospace",fontSize:12}}>
              <thead><tr>{["Phase","Biological","Computational","Tectonic"].map(h=>(
                <th key={h} style={{textAlign:"left",padding:"8px 10px",borderBottom:`1px solid ${BORDER}`,color:GOLD,fontWeight:600,fontSize:11}}>{h}</th>
              ))}</tr></thead>
              <tbody>{FIVE_PHASE.map((p,i)=>(
                <tr key={p.ph} style={{background:i%2===0?PAN2:"transparent"}}>
                  <td style={{padding:"7px 10px",color:CYAN,fontWeight:700}}>{p.ph}</td>
                  <td style={{padding:"7px 10px",color:GREEN}}>{p.bio}</td>
                  <td style={{padding:"7px 10px",color:VIOLET}}>{p.comp}</td>
                  <td style={{padding:"7px 10px",color:BLUE}}>{p.geo}</td>
                </tr>
              ))}</tbody>
            </table>
          </div>
          <p style={{fontSize:12.5,color:MUTED,lineHeight:1.7,marginTop:12}}>The Fano coherence research program for AETHER: identify the combinatorial geometry that organizes the Five-Phase Loop across domains. If the five-phase structure has a Fano-like invariant — a set of triples that compose consistently across biological, computational, and geological instantiations — that invariant is the mathematical proof AETHER's structural identity claims require.</p>
        </div>

        <div style={{display:"flex",flexWrap:"wrap",gap:14,paddingTop:20,borderTop:`1px solid ${BORDER}`,fontFamily:"monospace",fontSize:12}}>
          <Link href="/aether-whitepaper-v1" style={{color:CYAN,textDecoration:"none"}}>→ AETHER Whitepaper v1</Link>
          <Link href="/substrate-computing" style={{color:GREEN,textDecoration:"none"}}>→ Substrate Computing</Link>
          <Link href="/q-aether-research" style={{color:VIOLET,textDecoration:"none"}}>→ Q~AETHER Research</Link>
          <Link href="/" style={{color:MUTED,textDecoration:"none"}}>→ Knowledge Graph</Link>
        </div>
      </div>
    </div>
  );
}
