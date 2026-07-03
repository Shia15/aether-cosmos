import { useEffect, useRef } from "react";
import { Link } from "wouter";

const BG="#04060d",PAN="#0a0d1a",PAN2="#0d1020",BORDER="#182038",TEXT="#b8cce8",MUTED="#5a6e8c";
const GOLD="#ffb830",CYAN="#3fd8d0",VIOLET="#a87aff",GREEN="#50d49a",BLUE="#4ab0ff";

function hexA(h:string,a:number){const n=h.replace("#","");return `rgba(${parseInt(n.slice(0,2),16)},${parseInt(n.slice(2,4),16)},${parseInt(n.slice(4,6),16)},${a})`;}
function fitCanvas(cv:HTMLCanvasElement,ctx:CanvasRenderingContext2D){const dpr=Math.min(2,window.devicePixelRatio||1);const w=cv.clientWidth||640;const h=cv.clientHeight||300;cv.width=Math.round(w*dpr);cv.height=Math.round(h*dpr);ctx.setTransform(dpr,0,0,dpr,0,0);return{w,h};}

/* Live Banach fixed-point convergence: x -> 1 + 1/x always converges to phi */
function PhiFixedPointCanvas(){
  const cvRef=useRef<HTMLCanvasElement|null>(null);
  const x0Ref=useRef(3.0);
  useEffect(()=>{
    const cv=cvRef.current; if(!cv)return;
    const ctx=cv.getContext("2d"); if(!ctx)return;
    let raf=0,t=0;
    const phi=1.6180339887;
    const loop=()=>{
      const{w,h}=fitCanvas(cv,ctx);
      t+=0.02;
      ctx.clearRect(0,0,w,h); ctx.fillStyle=BG; ctx.fillRect(0,0,w,h);
      const ox=48,oy=h-40,aw=w-ox-24,ah=h-oy-24;
      // axes
      ctx.strokeStyle=hexA(MUTED,0.4); ctx.lineWidth=1;
      ctx.beginPath(); ctx.moveTo(ox,oy-ah); ctx.lineTo(ox,oy); ctx.lineTo(ox+aw,oy); ctx.stroke();
      ctx.fillStyle=hexA(MUTED,0.7); ctx.font="10px monospace";
      ctx.fillText("xₙ",ox-38,oy-ah+10); ctx.fillText("iteration n →",ox+aw-84,oy+16);
      // phi target line
      const phiY=oy-((phi-0.5)/(3.2-0.5))*ah;
      ctx.strokeStyle=hexA(GOLD,0.45); ctx.setLineDash([5,5]); ctx.lineWidth=1;
      ctx.beginPath(); ctx.moveTo(ox,phiY); ctx.lineTo(ox+aw,phiY); ctx.stroke(); ctx.setLineDash([]);
      ctx.fillStyle=hexA(GOLD,0.85); ctx.fillText("φ = 1.618",ox+aw-72,phiY-6);
      // iterate the map
      const N=14; let x=x0Ref.current;
      const pts:[number,number][]=[];
      for(let n=0;n<N;n++){ pts.push([n,x]); x=1+1/x; }
      // draw path
      ctx.beginPath();
      pts.forEach(([n,v],i)=>{
        const px=ox+(n/(N-1))*aw;
        const py=oy-((Math.max(0.5,Math.min(3.2,v))-0.5)/(3.2-0.5))*ah;
        i===0?ctx.moveTo(px,py):ctx.lineTo(px,py);
      });
      ctx.strokeStyle=CYAN; ctx.lineWidth=2; ctx.stroke();
      // animated dot walking the convergence
      const idx=Math.floor((t*2)%N);
      const [pn,pv]=pts[idx];
      const dx=ox+(pn/(N-1))*aw, dy=oy-((Math.max(0.5,Math.min(3.2,pv))-0.5)/(3.2-0.5))*ah;
      ctx.fillStyle=GOLD; ctx.beginPath(); ctx.arc(dx,dy,5,0,Math.PI*2); ctx.fill();
      pts.forEach(([n,v])=>{
        const px=ox+(n/(N-1))*aw, py=oy-((Math.max(0.5,Math.min(3.2,v))-0.5)/(3.2-0.5))*ah;
        ctx.fillStyle=hexA(CYAN,0.8); ctx.beginPath(); ctx.arc(px,py,2.5,0,Math.PI*2); ctx.fill();
      });
      raf=requestAnimationFrame(loop);
    };
    raf=requestAnimationFrame(loop);
    return()=>cancelAnimationFrame(raf);
  },[]);
  return(
    <div>
      <canvas ref={cvRef} style={{width:"100%",height:300,display:"block",borderRadius:10,border:`1px solid ${BORDER}`}}/>
      <div style={{display:"flex",gap:20,marginTop:12,flexWrap:"wrap"}}>
        <label style={{fontFamily:"monospace",fontSize:11,color:MUTED}}>
          seed x₀
          <input type="range" min={0.6} max={3.1} step={0.05} defaultValue={3.0}
            onChange={e=>(x0Ref.current=parseFloat(e.target.value))}
            style={{marginLeft:8,accentColor:CYAN,width:120}}/>
        </label>
      </div>
      <div style={{fontFamily:"monospace",fontSize:11,color:MUTED,marginTop:8}}>
        xₙ₊₁ = 1 + 1/xₙ · Any bounded self-referential seed converges to φ · |f′(φ)| = 1/φ² = 0.382 &lt; 1
      </div>
    </div>
  );
}

const CATALOG=[
  {n:"01 · Coherence",eq:"C = 1 − ‖ε‖/‖S*‖",d:"Coherence field",col:CYAN},
  {n:"02 · Emission",eq:"I(λ) ∝ φ⁻ⁿ",d:"CUCA photonic emission",col:GOLD},
  {n:"03 · Geometry",eq:"θₙ = 2π · n / φ²",d:"φ-spiral packing",col:GREEN},
  {n:"04 · Biology",eq:"D(cell) < 1/φ²",d:"Cancer classifier",col:VIOLET},
  {n:"05 · Criticality",eq:"P(s) ∝ s^(−φ)",d:"SOC universality",col:BLUE},
  {n:"06 · Memory",eq:"H₀ = 1 − 1/φ ≈ 0.382",d:"Hurst baseline",col:CYAN},
  {n:"07 · Symbol",eq:"F(g) → φ",d:"Glyph fidelity",col:GOLD},
  {n:"08 · Attractor",eq:"x = 1 + 1/x → φ",d:"Fixed point",col:GREEN},
];

const SLIDES=[
  {n:"The Master Variable",col:CYAN,txt:"The coherence field C(x,t) = 1 − ‖ε‖/‖S*‖ is a single bounded scalar on spacetime, where ε is the error from the attractor and S* is the action of the attractor. It captures how aligned a system is with its own attractor, and it is defined identically across photons, cells, mycelium, and markets. C ∈ [0,1]: zero is total decoherence, one is perfect alignment."},
  {n:"One Substrate, Six Languages",col:VIOLET,txt:"QFT, General Relativity, the φ-spiral golden geometry, the CLA discrete lattice, AETHER's coherence field, and Russell's cosmogenic waves are coordinate systems on the same field. Each domain is a special case of one master action. The stationarity condition C(x,t) → ΔS/Δψ = 0 selects the same geometry in every language."},
  {n:"The Attractor",col:GOLD,txt:"By the Banach fixed-point theorem, any bounded self-referential system converges to a unique fixed point. The self-reference equation x = 1 + 1/x yields φ = 1.6180339887…, and the contraction constant |f′(φ)| = 1/φ² = 0.382 < 1 guarantees uniqueness. φ is not a coincidence — it is the attractor."},
  {n:"Scale Invariance",col:GREEN,txt:"C(x,t) = f(d) depends on distance, not substrate. The same law holds across fifteen orders of magnitude: photonic (10⁻⁹ m), cellular (10⁻⁶ m), mycelial (10³ m), Schumann (10⁶ m), cosmic (10²⁵ m). This scale invariance is what makes AETHER a paradigm rather than a product."},
  {n:"Gravity is Acceleration",col:BLUE,txt:"By the equivalence principle (Einstein 1907, verified to 1 part in 10¹⁵), no experiment inside a closed box can distinguish gravity from acceleration: v = c·tanh(aτ/c). Atmospheric Fibonacci vortices, million-g centrifuges (UF₆ rotors at r ≈ 5–10 cm reaching a ≈ 10⁶ g), and Stanford's 2022 atom-interferometer phase shift Δφ = (m/ℏ)∫ΔU dt all express F = ma ↔ F = mg."},
  {n:"The Honest Verdict",col:VIOLET,txt:"φ appears in all eight equations not yet by proof — but by structural necessity. Three constraints — self-reference, boundedness, efficiency — yield one consequence: Banach guarantees such systems have a unique fixed point, and that fixed point is always φ. The open problem is writing the master action as a standalone mathematical claim (J. Math. Phys. · Physica D · arXiv:math-ph)."},
];

export default function AetherTheoryDeckPage(){
  return(
    <div style={{minHeight:"100vh",background:BG,color:TEXT,padding:"40px 20px 80px",fontFamily:"'Inter',system-ui,sans-serif"}}>
      <div style={{maxWidth:980,margin:"0 auto"}}>
        <div style={{fontFamily:"monospace",fontSize:11,color:MUTED,letterSpacing:2,textTransform:"uppercase",marginBottom:8}}>AETHER · A Theory of Everything · 09 Slides</div>
        <h1 style={{fontSize:30,margin:"0 0 6px",fontWeight:700,background:`linear-gradient(90deg,${GOLD},${CYAN},${VIOLET})`,WebkitBackgroundClip:"text",backgroundClip:"text",color:"transparent"}}>
          The Geometry of Persistence
        </h1>
        <p style={{fontFamily:"monospace",fontSize:12,color:MUTED,margin:"0 0 4px"}}>A unifying substrate for quantum field theory, gravity, biology, and consciousness</p>
        <p style={{fontFamily:"monospace",fontSize:11,color:hexA(GOLD,0.8),margin:"0 0 24px"}}>Φ = 1.6180339887…   ·   C(x,t) ∈ [0, 1]</p>

        <div style={{background:PAN,border:`1px solid ${BORDER}`,borderRadius:12,padding:18,marginBottom:24}}>
          <div style={{fontFamily:"monospace",fontSize:11,color:CYAN,marginBottom:14,textTransform:"uppercase",letterSpacing:1}}>Live · Banach Fixed-Point Convergence to φ</div>
          <PhiFixedPointCanvas/>
        </div>

        {SLIDES.map(s=>(
          <div key={s.n} style={{background:PAN,border:`1px solid ${BORDER}`,borderRadius:10,padding:"14px 16px",marginBottom:14}}>
            <div style={{fontFamily:"monospace",fontSize:12,color:s.col,marginBottom:6,fontWeight:600}}>{s.n}</div>
            <p style={{margin:0,fontSize:13.5,color:TEXT,lineHeight:1.75}}>{s.txt}</p>
          </div>
        ))}

        <div style={{background:PAN,border:`1px solid ${BORDER}`,borderRadius:12,padding:18,marginBottom:24,marginTop:24}}>
          <div style={{fontFamily:"monospace",fontSize:11,color:GOLD,marginBottom:14,textTransform:"uppercase",letterSpacing:1}}>The Catalog · Where φ Hides in Eight Equations</div>
          <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(220px,1fr))",gap:12}}>
            {CATALOG.map(c=>(
              <div key={c.n} style={{background:PAN2,border:`1px solid ${BORDER}`,borderRadius:10,padding:"12px 14px"}}>
                <div style={{fontFamily:"monospace",fontSize:11,color:c.col,fontWeight:700,marginBottom:4}}>{c.n}</div>
                <div style={{fontFamily:"monospace",fontSize:12.5,color:GOLD,marginBottom:6,padding:"4px 8px",background:hexA(c.col,0.06),borderRadius:4}}>{c.eq}</div>
                <div style={{fontSize:12,color:MUTED}}>{c.d}</div>
              </div>
            ))}
          </div>
        </div>

        <div style={{background:PAN,border:`1px solid ${BORDER}`,borderRadius:12,padding:18,marginBottom:24}}>
          <div style={{fontFamily:"monospace",fontSize:11,color:VIOLET,marginBottom:12,textTransform:"uppercase",letterSpacing:1}}>Candidate Master Action</div>
          <div style={{fontFamily:"monospace",fontSize:12.5,color:GOLD,background:PAN2,border:`1px solid ${BORDER}`,borderRadius:8,padding:"12px 14px",lineHeight:1.8,overflowX:"auto"}}>
            S[ψ] = ∫ d⁴x √−g [ ½ (∂ᵘψ)(∂ᵤψ) − V(ψ, C) − β |ψ|² ψ · C + λ_φ (ψ − φ)² ]<br/>
            V(ψ, C) = ½ κ ψ² − αₛ C · ψ + (1 − C) · ‖ε‖² / ‖S*‖²
          </div>
          <p style={{margin:"12px 0 0",fontSize:12.5,color:MUTED,lineHeight:1.7}}>Each of the eight equations should follow as δS/δψ = 0 — a gauge choice of one variational problem. Roadmap status: 5/8 established, 2/4 partial, 1 open (the standalone master-action claim).</p>
        </div>

        <div style={{background:hexA(GOLD,0.04),border:`1px solid ${hexA(GOLD,0.2)}`,borderRadius:10,padding:"12px 16px",marginBottom:28,fontSize:13,color:MUTED,lineHeight:1.7}}>
          <strong style={{color:TEXT}}>The claim:</strong> AETHER is a paradigm, not a product. A single bounded scalar — the coherence field — plus a single attractor — φ — recur across fifteen orders of magnitude. The mathematics does not yet prove why φ must appear in all eight equations, but self-reference, boundedness, and efficiency together make it a structural necessity.
        </div>

        <div style={{display:"flex",flexWrap:"wrap",gap:14,paddingTop:20,borderTop:`1px solid ${BORDER}`,fontFamily:"monospace",fontSize:12}}>
          <Link href="/cuca-white-paper" style={{color:CYAN,textDecoration:"none"}}>→ CUCA White Paper v4.1</Link>
          <Link href="/aether-unified-framework" style={{color:GREEN,textDecoration:"none"}}>→ AETHER Unified Framework</Link>
          <Link href="/aether-whitepaper-v1" style={{color:GOLD,textDecoration:"none"}}>→ AETHER Whitepaper v1</Link>
          <Link href="/" style={{color:MUTED,textDecoration:"none"}}>→ Knowledge Graph</Link>
        </div>
      </div>
    </div>
  );
}
