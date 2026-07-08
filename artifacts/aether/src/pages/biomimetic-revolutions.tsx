import { useEffect, useRef } from "react";
import { Link } from "wouter";

const BG="#04060d",PAN="#0a0d1a",PAN2="#0d1020",BORDER="#182038",TEXT="#b8cce8",MUTED="#5a6e8c";
const GOLD="#ffb830",CYAN="#3fd8d0",VIOLET="#a87aff",GREEN="#50d49a",BLUE="#4ab0ff",ROSE="#ff5a6a";

function hexA(h:string,a:number){const n=h.replace("#","");return `rgba(${parseInt(n.slice(0,2),16)},${parseInt(n.slice(2,4),16)},${parseInt(n.slice(4,6),16)},${a})`;}
function fitCanvas(cv:HTMLCanvasElement,ctx:CanvasRenderingContext2D){const dpr=Math.min(2,window.devicePixelRatio||1);const w=cv.clientWidth||640;const h=cv.clientHeight||340;cv.width=Math.round(w*dpr);cv.height=Math.round(h*dpr);ctx.setTransform(dpr,0,0,dpr,0,0);return{w,h};}

/* Live firefly synchronization (Kuramoto) — pulse-coupled oscillators converge to a common flash phase */
function FireflyCanvas(){
  const cvRef=useRef<HTMLCanvasElement|null>(null);
  const couplingRef=useRef(0.06);
  const nRef=useRef(60);
  useEffect(()=>{
    const cv=cvRef.current; if(!cv)return;
    const ctx=cv.getContext("2d"); if(!ctx)return;
    let raf=0;
    const MAXN=120;
    const phase=new Float32Array(MAXN);
    const freq=new Float32Array(MAXN);
    const px=new Float32Array(MAXN);
    const py=new Float32Array(MAXN);
    let inited=false;
    const loop=()=>{
      const{w,h}=fitCanvas(cv,ctx);
      const N=Math.round(nRef.current);
      if(!inited){
        for(let i=0;i<MAXN;i++){phase[i]=Math.random()*Math.PI*2;freq[i]=0.03+Math.random()*0.02;px[i]=0.08+Math.random()*0.84;py[i]=0.1+Math.random()*0.8;}
        inited=true;
      }
      const K=couplingRef.current;
      // order parameter
      let sx=0,sy=0;
      for(let i=0;i<N;i++){sx+=Math.cos(phase[i]);sy+=Math.sin(phase[i]);}
      const meanPhase=Math.atan2(sy,sx);
      const R=Math.sqrt(sx*sx+sy*sy)/N;
      for(let i=0;i<N;i++){
        phase[i]+=freq[i]+K*R*Math.sin(meanPhase-phase[i]);
        if(phase[i]>Math.PI*2)phase[i]-=Math.PI*2;
      }
      ctx.clearRect(0,0,w,h); ctx.fillStyle=BG; ctx.fillRect(0,0,w,h);
      for(let i=0;i<N;i++){
        const flash=Math.max(0,Math.sin(phase[i]));
        const x=px[i]*w, y=py[i]*h;
        const glow=flash*flash;
        if(glow>0.02){
          ctx.fillStyle=hexA(GOLD,0.15*glow);
          ctx.beginPath(); ctx.arc(x,y,14*glow,0,Math.PI*2); ctx.fill();
        }
        ctx.fillStyle=hexA(glow>0.4?"#fff2b0":GREEN,0.25+glow*0.75);
        ctx.beginPath(); ctx.arc(x,y,2.5+glow*2.5,0,Math.PI*2); ctx.fill();
      }
      // order readout
      ctx.fillStyle=hexA(TEXT,0.85); ctx.font="11px monospace";
      ctx.fillText("sync R = "+R.toFixed(2),14,20);
      ctx.fillStyle=hexA(MUTED,0.8); ctx.font="10px monospace";
      ctx.fillText(R>0.85?"phase-locked · coherent flash":"desynchronized",14,36);
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
          coupling K
          <input type="range" min={0} max={0.2} step={0.005} defaultValue={0.06}
            onChange={e=>(couplingRef.current=parseFloat(e.target.value))}
            style={{marginLeft:8,accentColor:GOLD,width:130}}/>
        </label>
        <label style={{fontFamily:"monospace",fontSize:11,color:MUTED}}>
          fireflies
          <input type="range" min={12} max={120} step={1} defaultValue={60}
            onChange={e=>(nRef.current=parseInt(e.target.value))}
            style={{marginLeft:8,accentColor:CYAN,width:120}}/>
        </label>
      </div>
      <div style={{fontFamily:"monospace",fontSize:11,color:MUTED,marginTop:8}}>
        Raise coupling K and independent flickers phase-lock into one coherent flash — Kuramoto order R → 1 (resonant intelligence)
      </div>
    </div>
  );
}

const PATTERNS=[
  {t:"Energy Minimization",d:"Quantum coherence in photosynthesis and tunneling in enzymes enable near-lossless operations at physiological temperature.",col:GOLD},
  {t:"Scalable Modularity",d:"Redundant, distributed designs — termite mounds for passive cooling, mycelium for distributed compute — scale without central control.",col:CYAN},
  {t:"Noise Resilience",d:"Room-temperature quantum processes persist amid thermal chaos; birds' magnetoreception is noise-robust by design.",col:GREEN},
  {t:"Hybrid Integration",d:"Blending wave-particle dynamics, as in photon-protein interactions, fuses fast transport with long storage.",col:VIOLET},
];

const TRANSLATIONS=[
  {nat:"Humpback whale fin tubercles",tech:"Turbine blades",gain:"+40% wind turbine output via drag reduction",col:BLUE},
  {nat:"Shark skin riblets",tech:"Aircraft skin / swimwear",gain:"Cut drag, improved fuel efficiency",col:CYAN},
  {nat:"Photosynthetic light-harvesting",tech:"Squeezed-state photonic QC",gain:"~100% exciton transport via coherence",col:GREEN},
  {nat:"Proton tunneling in enzymes",tech:"Low-energy quantum gates",gain:"Barrier penetration at minimal energy",col:GOLD},
  {nat:"Firefly bioluminescence",tech:"Efficient LEDs · photonic QC sources",gain:"~0.88–1.0 quantum yield 'cold light'",col:"#fff2b0"},
  {nat:"Mycelial networks",tech:"Fungal memristors · bio-hybrid compute",gain:"Distributed signal processing via spikes",col:VIOLET},
];

const OPERATORS=[
  {op:"MnIsis",dom:"Memory",d:"Retention and recall across layers — anchors experiential state to formal structure.",col:CYAN},
  {op:"Aletheia",dom:"Truth",d:"Cross-layer correlation without contradiction — resonance defined without mysticism.",col:GOLD},
  {op:"Infernia",dom:"Transformation",d:"State transition engine — converts photonic gate results into adaptive change.",col:ROSE},
  {op:"Reverie",dom:"Intuition",d:"Higher-order pattern intuition feeding adaptive error correction.",col:VIOLET},
];

export default function BiomimeticRevolutionsPage(){
  return(
    <div style={{minHeight:"100vh",background:BG,color:TEXT,padding:"40px 20px 80px",fontFamily:"'Inter',system-ui,sans-serif"}}>
      <div style={{maxWidth:980,margin:"0 auto"}}>
        <div style={{fontFamily:"monospace",fontSize:11,color:MUTED,letterSpacing:2,textTransform:"uppercase",marginBottom:8}}>Nature-to-Tech Translations · Synthesis Pack</div>
        <h1 style={{fontSize:30,margin:"0 0 6px",fontWeight:700,background:`linear-gradient(90deg,${GREEN},${GOLD},${CYAN})`,WebkitBackgroundClip:"text",backgroundClip:"text",color:"transparent"}}>
          Biomimetic Revolutions
        </h1>
        <p style={{fontFamily:"monospace",fontSize:12,color:MUTED,margin:"0 0 4px"}}>Efficiency · Quantum Computing · Resonant Intelligence</p>
        <p style={{fontFamily:"monospace",fontSize:11,color:hexA(MUTED,0.7),margin:"0 0 24px"}}>Firefly bioluminescence · quantum biology · mycelium bio-computing · AETHER resonant framing</p>

        <div style={{background:hexA(GREEN,0.04),border:`1px solid ${hexA(GREEN,0.2)}`,borderRadius:10,padding:"12px 16px",marginBottom:24,fontSize:13,color:MUTED,lineHeight:1.7}}>
          <strong style={{color:TEXT}}>Abstract:</strong> Nature has engineered solutions over 3.8 billion years, optimizing for efficiency under scarce resources and dynamic environments. This synthesis bridges optimized biological designs with technological innovation — quantum-biological phenomena (firefly bioluminescence's near-unity quantum yield, photosynthetic coherence) applied to room-temperature quantum computing, with the AETHER framework as a meta-layer ensuring epistemic discipline across physical, symbolic, and experiential domains.
        </div>

        <div style={{background:PAN,border:`1px solid ${BORDER}`,borderRadius:12,padding:18,marginBottom:24}}>
          <div style={{fontFamily:"monospace",fontSize:11,color:GOLD,marginBottom:14,textTransform:"uppercase",letterSpacing:1}}>Live · Firefly Flash Synchronization (Kuramoto)</div>
          <FireflyCanvas/>
        </div>

        <div style={{background:PAN,border:`1px solid ${BORDER}`,borderRadius:12,padding:18,marginBottom:24}}>
          <div style={{fontFamily:"monospace",fontSize:11,color:CYAN,marginBottom:14,textTransform:"uppercase",letterSpacing:1}}>Four Biomimetic Patterns</div>
          <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(230px,1fr))",gap:12}}>
            {PATTERNS.map(p=>(
              <div key={p.t} style={{background:PAN2,border:`1px solid ${BORDER}`,borderLeft:`3px solid ${p.col}`,borderRadius:10,padding:"12px 14px"}}>
                <div style={{fontSize:13,color:p.col,fontWeight:600,marginBottom:6}}>{p.t}</div>
                <p style={{margin:0,fontSize:12,color:MUTED,lineHeight:1.6}}>{p.d}</p>
              </div>
            ))}
          </div>
        </div>

        <div style={{background:PAN,border:`1px solid ${BORDER}`,borderRadius:12,padding:18,marginBottom:24}}>
          <div style={{fontFamily:"monospace",fontSize:11,color:GREEN,marginBottom:14,textTransform:"uppercase",letterSpacing:1}}>Nature → Tech Translation Table</div>
          <div style={{display:"grid",gap:7}}>
            {TRANSLATIONS.map(tr=>(
              <div key={tr.nat} style={{background:PAN2,border:`1px solid ${BORDER}`,borderLeft:`3px solid ${tr.col}`,borderRadius:8,padding:"9px 14px",display:"flex",flexWrap:"wrap",gap:8,alignItems:"baseline"}}>
                <span style={{fontSize:12.5,color:tr.col,fontWeight:600,minWidth:200,flex:1}}>{tr.nat}</span>
                <span style={{fontFamily:"monospace",fontSize:11,color:TEXT,minWidth:170,flex:1}}>→ {tr.tech}</span>
                <span style={{fontFamily:"monospace",fontSize:10.5,color:MUTED,flex:1.3,minWidth:200}}>{tr.gain}</span>
              </div>
            ))}
          </div>
        </div>

        <div style={{background:PAN,border:`1px solid ${BORDER}`,borderRadius:12,padding:18,marginBottom:24}}>
          <div style={{fontFamily:"monospace",fontSize:11,color:"#fff2b0",marginBottom:6,textTransform:"uppercase",letterSpacing:1}}>Firefly Bioluminescence · Quantum Efficiency Case Study</div>
          <p style={{margin:"0 0 12px",fontSize:13,color:TEXT,lineHeight:1.7}}>Fireflies embody biomimetic gold. Their "cold light" reaction (luciferin + ATP + O₂ → photon) yields ~0.88–1.0 quantum efficiency, with oxygen gating via tracheoles for precise flashes at 0.1–10 Hz behavioral rhythms. Evolved ~100–150 million years ago for signaling, proton abstraction and dioxetanone intermediates showcase quantum mechanics operating in biology at room temperature.</p>
          <div style={{background:hexA(GOLD,0.05),border:`1px solid ${hexA(GOLD,0.2)}`,borderRadius:8,padding:"10px 14px",fontSize:12.5,color:MUTED,lineHeight:1.7}}>
            <strong style={{color:GOLD}}>Hybrid photonic-protonic QC:</strong> a photonic backbone (fast, low-decoherence) paired with protonic storage (long coherence). Firefly-inspired emitters reduce multiplexing; enzyme tunneling supplies low-energy gates. Modeled gains: 10–100× energy efficiency, room-temperature operation.
          </div>
        </div>

        <div style={{background:PAN,border:`1px solid ${BORDER}`,borderRadius:12,padding:18,marginBottom:24}}>
          <div style={{fontFamily:"monospace",fontSize:11,color:VIOLET,marginBottom:6,textTransform:"uppercase",letterSpacing:1}}>AETHER · Framing Resonant Intelligence</div>
          <p style={{margin:"0 0 14px",fontSize:13,color:TEXT,lineHeight:1.7}}>The AETHER architecture layers reality (physical / formal / symbolic / experiential) with four operators. Resonance aligns domains without mysticism — treating light as domain-separated (physical EM vs. symbolic clarity) to avoid category errors when merging biology with technology.</p>
          <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(210px,1fr))",gap:12}}>
            {OPERATORS.map(o=>(
              <div key={o.op} style={{background:PAN2,border:`1px solid ${BORDER}`,borderRadius:10,padding:"12px 14px"}}>
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"baseline",marginBottom:4}}>
                  <span style={{fontSize:13,color:o.col,fontWeight:700}}>{o.op}</span>
                  <span style={{fontFamily:"monospace",fontSize:10,color:MUTED}}>{o.dom}</span>
                </div>
                <p style={{margin:0,fontSize:12,color:MUTED,lineHeight:1.55}}>{o.d}</p>
              </div>
            ))}
          </div>
        </div>

        <div style={{background:hexA(GREEN,0.04),border:`1px solid ${hexA(GREEN,0.2)}`,borderRadius:10,padding:"12px 16px",marginBottom:28,fontSize:13,color:MUTED,lineHeight:1.7}}>
          <strong style={{color:TEXT}}>Igniting the revolution:</strong> nature-to-tech translations revolutionize quantum computing and intelligence by fixing systems through biomimetic efficiency — start small (Arduino + fungi/LEDs), iterate toward QC/bio-hybrids. AETHER elevates this by resonating quantum biology with human potential, transforming engineered scarcity into abundance via bio-inspired coherence.
        </div>

        <div style={{display:"flex",flexWrap:"wrap",gap:14,paddingTop:20,borderTop:`1px solid ${BORDER}`,fontFamily:"monospace",fontSize:12}}>
          <Link href="/cuca-bioengine" style={{color:GREEN,textDecoration:"none"}}>→ CUCA BioEngine v3.0</Link>
          <Link href="/aether-theory-deck" style={{color:GOLD,textDecoration:"none"}}>→ AETHER Theory Deck</Link>
          <Link href="/fibonacci-quaternion" style={{color:VIOLET,textDecoration:"none"}}>→ Fibonacci–Quaternion AETHER</Link>
          <Link href="/graph-map" style={{color:MUTED,textDecoration:"none"}}>→ Knowledge Graph</Link>
        </div>
      </div>
    </div>
  );
}
