import { useEffect, useRef } from "react";
import { Link } from "wouter";

const BG="#04060d",PAN="#0a0d1a",PAN2="#0d1020",BORDER="#182038",TEXT="#b8cce8",MUTED="#5a6e8c";
const GOLD="#ffb830",CYAN="#3fd8d0",VIOLET="#a87aff",GREEN="#50d49a",BLUE="#4ab0ff",ROSE="#ff5a6a";

function hexA(h:string,a:number){const n=h.replace("#","");return `rgba(${parseInt(n.slice(0,2),16)},${parseInt(n.slice(2,4),16)},${parseInt(n.slice(4,6),16)},${a})`;}
function fitCanvas(cv:HTMLCanvasElement,ctx:CanvasRenderingContext2D){const dpr=Math.min(2,window.devicePixelRatio||1);const w=cv.clientWidth||640;const h=cv.clientHeight||340;cv.width=Math.round(w*dpr);cv.height=Math.round(h*dpr);ctx.setTransform(dpr,0,0,dpr,0,0);return{w,h};}

/* Live: coherence C(x,t) under chessboard demand for each photonic dimensionality.
   0D->1D->2D->3D each resolves more edge directions; gyroid floor keeps C near 0.9 */
function ChessboardCanvas(){
  const cvRef=useRef<HTMLCanvasElement|null>(null);
  const dimRef=useRef(3); // 0..3 spatial dims resolved (gyroid=3)
  const freqRef=useRef(8);
  useEffect(()=>{
    const cv=cvRef.current; if(!cv)return;
    const ctx=cv.getContext("2d"); if(!ctx)return;
    let raf=0,t=0;
    const loop=()=>{
      const{w,h}=fitCanvas(cv,ctx);
      t+=0.02;
      ctx.clearRect(0,0,w,h); ctx.fillStyle=BG; ctx.fillRect(0,0,w,h);
      const dim=dimRef.current, freq=Math.round(freqRef.current);
      const panelW=Math.min(w*0.62,w-150);
      // draw a chessboard-demand target; each cell needs a hard edge
      const cw=panelW/freq, ch=(h-24)/freq;
      // resolution factor: how well this dimensionality resolves edges
      const resolve=[0.05,0.35,0.72,0.94][dim];
      let err=0, cells=0;
      for(let i=0;i<freq;i++)for(let j=0;j<freq;j++){
        cells++;
        const demand=(i+j)%2; // ideal 0 or 1
        // achieved value: blurred toward 0.5 when unresolved
        const noise=(Math.sin(i*1.7+t)+Math.cos(j*2.1-t))*0.5*(1-resolve);
        let achieved=0.5+(demand-0.5)*resolve+noise*0.15;
        achieved=Math.max(0,Math.min(1,achieved));
        err+=Math.abs(demand-achieved);
        const g=Math.round(achieved*255);
        // colorize: coherent edges = crisp blue/gold; incoherent = muddy
        const col=demand?hexA(GOLD,0.35+achieved*0.6):hexA(BLUE,0.2+(1-achieved)*0.5);
        ctx.fillStyle=col;
        ctx.fillRect(12+j*cw,12+i*ch,cw-1,ch-1);
      }
      const C=1-err/cells;
      // readout panel
      const px=panelW+30;
      ctx.fillStyle=hexA(TEXT,0.85); ctx.font="12px monospace";
      ctx.fillText("C(x,t) under demand",px,32);
      const cCol=C>0.8?GREEN:C>0.55?GOLD:ROSE;
      ctx.fillStyle=cCol; ctx.font="30px monospace"; ctx.fillText(C.toFixed(2),px,66);
      // bar
      ctx.fillStyle=hexA(TEXT,0.12); ctx.fillRect(px,78,120,8);
      ctx.fillStyle=cCol; ctx.fillRect(px,78,120*Math.max(0,C),8);
      const names=["P8 0D chromatophore","P6 1D reflectin","P5 2D nanocrystal","P3 3D gyroid floor"];
      ctx.fillStyle=hexA(MUTED,0.85); ctx.font="10px monospace";
      ctx.fillText(names[dim],px,104);
      ctx.fillText(dim<3?"edges unresolved":"omni-directional bandgap",px,120);
      raf=requestAnimationFrame(loop);
    };
    raf=requestAnimationFrame(loop);
    return()=>cancelAnimationFrame(raf);
  },[]);
  return(
    <div>
      <canvas ref={cvRef} style={{width:"100%",height:340,display:"block",borderRadius:10,border:`1px solid ${BORDER}`}}/>
      <div style={{display:"flex",gap:20,marginTop:12,flexWrap:"wrap"}}>
        <label style={{fontFamily:"monospace",fontSize:11,color:MUTED}}>
          resolved dims (0D→3D)
          <input type="range" min={0} max={3} step={1} defaultValue={3}
            onChange={e=>(dimRef.current=parseInt(e.target.value))}
            style={{marginLeft:8,accentColor:GOLD,width:120}}/>
        </label>
        <label style={{fontFamily:"monospace",fontSize:11,color:MUTED}}>
          chessboard frequency
          <input type="range" min={4} max={16} step={1} defaultValue={8}
            onChange={e=>(freqRef.current=parseInt(e.target.value))}
            style={{marginLeft:8,accentColor:CYAN,width:120}}/>
        </label>
      </div>
      <div style={{fontFamily:"monospace",fontSize:11,color:MUTED,marginTop:8}}>
        Drag from 0D to 3D: only the gyroid resolves edges in every direction, so C stays near 0.9 under chessboard overload
      </div>
    </div>
  );
}

const STACK=[
  {p:"P0 — Genome",struct:"SynHG cassette · autologous",role:"L1 substrate — chromosome integrity",stab:"Intrinsic",col:GREEN},
  {p:"P1 — Bouligand",struct:"Helicoidal twisted-plywood chitin",role:"L1 omni-stable structural scaffold",stab:"C = 1 (structural)",col:GOLD},
  {p:"P2 — Nacre",struct:"Aragonite platelets + organic matrix",role:"L0 AETHER memory layer",stab:"High (geological)",col:CYAN},
  {p:"P3 — Gyroid",struct:"3D photonic crystal (Lycaenid lumen)",role:"L5 coherence passive floor",stab:"Max omni-directional",col:VIOLET},
  {p:"P4 — Morpho",struct:"Ridge lamellae Christmas-tree stack",role:"L5 directional signaling flash",stab:"High (directional)",col:BLUE},
  {p:"P5 — Chameleon",struct:"Guanine triangular S-iridophore",role:"L3 signal-fidelity tuning",stab:"High (tunable, sec)",col:"#e07aff"},
  {p:"P6 — Reflectin",struct:"Reflectin rugate / Bragg columns",role:"L2 quantum-bio processing",stab:"Medium (17–32 s)",col:"#4ad0ff"},
  {p:"P7 — Cuttlefish",struct:"Leucophore + chromatophore ratio",role:"L5 edge-conflict resolution",stab:"Medium (200 ms)",col:"#ffd060"},
  {p:"P8 — Chromatophore",struct:"Elastic pigment sac + radial muscles",role:"L4 direct control (fast analog)",stab:"Low (100 ms)",col:ROSE},
  {p:"P9 — Kill Switch",struct:"mazF toxin/antitoxin + auxotrophy + timer",role:"L7 termination protocol",stab:"Absolute (irreversible)",col:"#ff8080"},
];

const MODULES=[
  {mod:"Bouligand chitin",gene:"Chitin synthase + deacetylase + template",ctrl:"Developmental promoter (self-assembly only)",col:GOLD},
  {mod:"Gyroid crystal",gene:"Gyroid-template + reflectin-chitin fusion",ctrl:"Constitutive low-level (permanent floor)",col:VIOLET},
  {mod:"Morpho flash",gene:"Multilayer lamellae + spacing controller",ctrl:"dCas9 gate: activate on ΔN signal",col:BLUE},
  {mod:"Chameleon lattice",gene:"Guanine synthase + lattice-assembly",ctrl:"Riboswitch: ACh analogue → spacing Δd",col:"#e07aff"},
  {mod:"Squid reflectin",gene:"Reflectin-A1/A2 + phosphorylation cascade",ctrl:"dCas9 + muscarinic receptor circuit",col:CYAN},
  {mod:"Coherence engine",gene:"Repressilator (lacI/tetR/cI) + dCas9 gate",ctrl:"Self-regulating clock drives downstream",col:GREEN},
  {mod:"Kill switch (triple)",gene:"mazF/MazE + ncAA auxotrophy + timer flip",ctrl:"Primed; loss of survival signal → death",col:ROSE},
];

export default function CucaBioenginePage(){
  return(
    <div style={{minHeight:"100vh",background:BG,color:TEXT,padding:"40px 20px 80px",fontFamily:"'Inter',system-ui,sans-serif"}}>
      <div style={{maxWidth:980,margin:"0 auto"}}>
        <div style={{fontFamily:"monospace",fontSize:11,color:MUTED,letterSpacing:2,textTransform:"uppercase",marginBottom:8}}>CUCA · Bio Hardware Engine v3.0 · March 2026</div>
        <h1 style={{fontSize:30,margin:"0 0 6px",fontWeight:700,background:`linear-gradient(90deg,${VIOLET},${GOLD},${GREEN})`,WebkitBackgroundClip:"text",backgroundClip:"text",color:"transparent"}}>
          The Photonic Layer Stack · P0 → P9
        </h1>
        <p style={{fontFamily:"monospace",fontSize:12,color:MUTED,margin:"0 0 4px"}}>Bouligand · Nacre · Gyroid · Morpho · Chameleon · Reflectin · Chromatophore · Kill Switch · Human Genome</p>
        <p style={{fontFamily:"monospace",fontSize:11,color:hexA(GOLD,0.85),margin:"0 0 24px"}}>The gyroid is the floor. Everything else tunes on top of it.</p>

        <div style={{background:PAN,border:`1px solid ${BORDER}`,borderRadius:12,padding:18,marginBottom:24}}>
          <div style={{fontFamily:"monospace",fontSize:11,color:CYAN,marginBottom:14,textTransform:"uppercase",letterSpacing:1}}>Live · Coherence Under Chessboard Demand</div>
          <ChessboardCanvas/>
        </div>

        <div style={{background:hexA(VIOLET,0.04),border:`1px solid ${hexA(VIOLET,0.2)}`,borderRadius:10,padding:"12px 16px",marginBottom:24,fontFamily:"monospace",fontSize:12,color:GOLD,lineHeight:1.9}}>
          C(x,t) = f(d_gyroid) + Δf(d_reflectin, d_nano) + u(t)_chromatophore
        </div>

        <div style={{background:PAN,border:`1px solid ${BORDER}`,borderRadius:12,padding:18,marginBottom:24}}>
          <div style={{fontFamily:"monospace",fontSize:11,color:VIOLET,marginBottom:14,textTransform:"uppercase",letterSpacing:1}}>The Ten-Layer Stack (stability cascades downward)</div>
          <div style={{display:"grid",gap:7}}>
            {STACK.map(s=>(
              <div key={s.p} style={{background:PAN2,border:`1px solid ${BORDER}`,borderLeft:`3px solid ${s.col}`,borderRadius:8,padding:"9px 14px",display:"flex",flexWrap:"wrap",gap:8,alignItems:"baseline"}}>
                <span style={{fontFamily:"monospace",fontSize:12.5,color:s.col,fontWeight:700,minWidth:150}}>{s.p}</span>
                <span style={{fontSize:12,color:TEXT,flex:1,minWidth:180}}>{s.struct}</span>
                <span style={{fontFamily:"monospace",fontSize:10.5,color:MUTED,flex:1,minWidth:180}}>{s.role}</span>
                <span style={{fontFamily:"monospace",fontSize:10,color:hexA(s.col,0.8)}}>{s.stab}</span>
              </div>
            ))}
          </div>
        </div>

        <div style={{background:PAN,border:`1px solid ${BORDER}`,borderRadius:12,padding:18,marginBottom:24}}>
          <div style={{fontFamily:"monospace",fontSize:11,color:GOLD,marginBottom:6,textTransform:"uppercase",letterSpacing:1}}>Why the Gyroid Solves the Edge Constraint</div>
          <p style={{margin:"0 0 14px",fontSize:13,color:TEXT,lineHeight:1.7}}>The chessboard demand requires hard edges in every direction at once. A 0D chromatophore is a continuous analog sac — it cannot digitize an edge and fails immediately (C→0). A 1D Bragg stack resolves one axis; a 2D lattice resolves two; the third axis stays vulnerable. The Lycaenid gyroid is a full 3D photonic crystal — it reflects its wavelength band from every direction simultaneously, so edge direction is irrelevant. That is why C(x,t) stays near 0.9 under chessboard demand: the passive floor never destabilizes.</p>
          <div style={{background:hexA(GOLD,0.06),border:`1px solid ${hexA(GOLD,0.25)}`,borderRadius:8,padding:"10px 14px",fontSize:12,color:MUTED,lineHeight:1.6}}>
            <strong style={{color:GOLD}}>Bouligand insight:</strong> The helicoidal chitin is not tunable — it does not need to be. Each layer rotates by a fixed angle; crack propagation in any direction is immediately redirected by the next rotated layer. It distributes all stress across all angles simultaneously, so C_structural = 1, always.
          </div>
        </div>

        <div style={{background:PAN,border:`1px solid ${BORDER}`,borderRadius:12,padding:18,marginBottom:24}}>
          <div style={{fontFamily:"monospace",fontSize:11,color:GREEN,marginBottom:14,textTransform:"uppercase",letterSpacing:1}}>SynHG Gene Cassette · Seven Modules</div>
          <div style={{display:"grid",gap:7}}>
            {MODULES.map(m=>(
              <div key={m.mod} style={{background:PAN2,border:`1px solid ${BORDER}`,borderLeft:`3px solid ${m.col}`,borderRadius:8,padding:"9px 14px",display:"flex",flexWrap:"wrap",gap:8,alignItems:"baseline"}}>
                <span style={{fontSize:12.5,color:m.col,fontWeight:600,minWidth:130}}>{m.mod}</span>
                <span style={{fontFamily:"monospace",fontSize:10.5,color:TEXT,flex:1,minWidth:200}}>{m.gene}</span>
                <span style={{fontFamily:"monospace",fontSize:10.5,color:MUTED,flex:1,minWidth:180}}>{m.ctrl}</span>
              </div>
            ))}
          </div>
          <p style={{margin:"12px 0 0",fontSize:12,color:MUTED,lineHeight:1.6}}>Ordered by stability: constitutive modules (Bouligand, gyroid) express first and remain permanent; dynamic modules (reflectin, nanocrystal, chromatophore) are gated by the coherence-engine clock; the kill switch is constitutively primed, held off by the antitoxin survival signal. No single point of failure.</p>
        </div>

        <div style={{background:PAN,border:`1px solid ${BORDER}`,borderRadius:12,padding:18,marginBottom:24}}>
          <div style={{fontFamily:"monospace",fontSize:11,color:CYAN,marginBottom:12,textTransform:"uppercase",letterSpacing:1}}>The v3.0 Coherence Equation</div>
          <div style={{fontFamily:"monospace",fontSize:12.5,color:GOLD,background:PAN2,border:`1px solid ${BORDER}`,borderRadius:8,padding:"12px 14px",lineHeight:2}}>
            C(x,t) = C_structural(Bouligand, gyroid)   [passive floor ≈ 1]<br/>
            &nbsp;&nbsp;&nbsp;&nbsp;+ ΔC_active(reflectin, nanocrystal)   [active tuning]<br/>
            &nbsp;&nbsp;&nbsp;&nbsp;+ ΔC_neural(chromatophore, cuttlefish)   [fast analog]<br/>
            &nbsp;&nbsp;&nbsp;&nbsp;· α(S_L0)   [geophysical modulator]<br/>
            &nbsp;&nbsp;&nbsp;&nbsp;− ‖E(t)‖/‖X*(t)‖   [error term]
          </div>
        </div>

        <div style={{background:hexA(GREEN,0.04),border:`1px solid ${hexA(GREEN,0.2)}`,borderRadius:10,padding:"12px 16px",marginBottom:28,fontSize:13,color:MUTED,lineHeight:1.7}}>
          <strong style={{color:TEXT}}>v3.0 claim:</strong> the first formally specified biological agent architecture in which photonic coherence is achieved across all three spatial dimensions simultaneously, implemented in autologous human cells, governed by the CUCA coherence field, and terminated by a triple-redundant kill switch encoded in the same synthetic cassette. No metal. No silicon. Only living code, from the patient's own genome outward.
        </div>

        <div style={{display:"flex",flexWrap:"wrap",gap:14,paddingTop:20,borderTop:`1px solid ${BORDER}`,fontFamily:"monospace",fontSize:12}}>
          <Link href="/cuca-white-paper" style={{color:VIOLET,textDecoration:"none"}}>→ CUCA White Paper</Link>
          <Link href="/biomimetic-revolutions" style={{color:GREEN,textDecoration:"none"}}>→ Biomimetic Revolutions</Link>
          <Link href="/aether-patent" style={{color:GOLD,textDecoration:"none"}}>→ AETHER Patent Specification</Link>
          <Link href="/graph-map" style={{color:MUTED,textDecoration:"none"}}>→ Knowledge Graph</Link>
        </div>
      </div>
    </div>
  );
}
