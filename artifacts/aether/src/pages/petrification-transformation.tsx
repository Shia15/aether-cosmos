import { useEffect, useRef } from "react";
import { Link } from "wouter";

const BG="#04060d",PAN="#0a0d1a",PAN2="#0d1020",BORDER="#182038",TEXT="#b8cce8",MUTED="#5a6e8c";
const GOLD="#ffb830",CYAN="#3fd8d0",VIOLET="#a87aff",GREEN="#50d49a",ROSE="#ff5a6a",BLUE="#4ab0ff";

function hexA(h:string,a:number){const n=h.replace("#","");return `rgba(${parseInt(n.slice(0,2),16)},${parseInt(n.slice(2,4),16)},${parseInt(n.slice(4,6),16)},${a})`;}
function fitCanvas(cv:HTMLCanvasElement,ctx:CanvasRenderingContext2D){const dpr=Math.min(2,window.devicePixelRatio||1);const w=cv.clientWidth||640;const h=cv.clientHeight||280;cv.width=Math.round(w*dpr);cv.height=Math.round(h*dpr);ctx.setTransform(dpr,0,0,dpr,0,0);return{w,h};}

/* Live entropy decay canvas — 3-phase petrification model */
function PetrificationCanvas() {
  const cvRef = useRef<HTMLCanvasElement|null>(null);
  const kRef = useRef(0.4);
  const mRef = useRef(0.3);

  useEffect(()=>{
    const cv=cvRef.current; if(!cv)return;
    const ctx=cv.getContext("2d"); if(!ctx)return;
    let raf=0,t=0;

    const loop=()=>{
      const{w,h}=fitCanvas(cv,ctx);
      t+=0.012;
      const k=kRef.current, m=mRef.current;
      ctx.clearRect(0,0,w,h);
      ctx.fillStyle=BG; ctx.fillRect(0,0,w,h);

      // axes
      const ox=56,oy=h-44,aw=w-ox-24,ah=h-oy-24;
      ctx.strokeStyle=hexA(MUTED,0.4); ctx.lineWidth=1;
      ctx.beginPath(); ctx.moveTo(ox,oy-ah); ctx.lineTo(ox,oy); ctx.lineTo(ox+aw,oy); ctx.stroke();
      ctx.fillStyle=hexA(MUTED,0.7); ctx.font="10px monospace";
      ctx.fillText("S(t)",ox-44,oy-ah+10); ctx.fillText("time →",ox+aw-36,oy+16);

      // draw 3 curves: disruption phase, infiltration phase, locked state
      const draw=(colF:(x:number)=>string, S:(t:number)=>number, label:string, lx:number, ly:number)=>{
        ctx.beginPath();
        for(let i=0;i<=aw;i++){
          const tt=i/aw*6;
          const s=Math.max(0,Math.min(1,S(tt)));
          const x=ox+i, y=oy-s*ah;
          i===0?ctx.moveTo(x,y):ctx.lineTo(x,y);
        }
        ctx.strokeStyle=colF(0); ctx.lineWidth=2; ctx.stroke();
        ctx.fillStyle=colF(0); ctx.font="11px monospace"; ctx.fillText(label,lx,ly);
      };

      // unharmonized: rapid decay dS/dt = -k·chaos + m·minerals → locks near 0.15
      draw(()=>ROSE, tt=>{
        if(tt<2) return 1-0.18*tt*k*3.5;
        if(tt<4) return Math.max(0.15,0.64-0.12*(tt-2)*m*3);
        return 0.15+0.03*Math.sin(tt*4);
      },"unharmonized",ox+8,oy-ah+14);

      // AETHER coherence injection — decay arrested, reversal begins
      draw(()=>GREEN, tt=>{
        if(tt<2) return 1-0.12*tt*k*2;
        if(tt<3.5) return Math.max(0.38,0.76-0.1*(tt-2)*m*1.8);
        return 0.38+0.04*(tt-3.5); // coherence injection = reversal
      },"AETHER coherence",ox+aw-120,oy-ah*0.35+10);

      // phase boundaries
      const phaseX=[2,4].map(tt=>ox+tt/6*aw);
      phaseX.forEach((px,i)=>{
        ctx.strokeStyle=hexA(GOLD,0.3); ctx.lineWidth=1; ctx.setLineDash([4,4]);
        ctx.beginPath(); ctx.moveTo(px,oy-ah); ctx.lineTo(px,oy); ctx.stroke();
        ctx.setLineDash([]);
        ctx.fillStyle=hexA(GOLD,0.75); ctx.font="10px monospace";
        ctx.fillText(["infiltration","locking"][i],px+4,oy-ah*0.88+i*14);
      });

      // phase labels
      [["disruption",0.5],["infiltration",2.7],["locking",4.8]].forEach(([lab,tt])=>{
        const x=ox+(tt as number)/6*aw;
        ctx.fillStyle=hexA(CYAN,0.5); ctx.font="9px monospace"; ctx.fillText(lab as string,x-18,oy+30);
      });

      // animated cursor on unharmonized curve
      const cursor=(t%6)/6;
      const tc=cursor*6;
      const sy=tc<2?1-0.18*tc*k*3.5:tc<4?Math.max(0.15,0.64-0.12*(tc-2)*m*3):0.15;
      const cx2=ox+cursor*aw, cy2=oy-sy*ah;
      ctx.fillStyle=ROSE; ctx.beginPath(); ctx.arc(cx2,cy2,5,0,Math.PI*2); ctx.fill();

      raf=requestAnimationFrame(loop);
    };
    raf=requestAnimationFrame(loop);
    return()=>cancelAnimationFrame(raf);
  },[]);

  return(
    <div>
      <canvas ref={cvRef} style={{width:"100%",height:280,display:"block",borderRadius:10,border:`1px solid ${BORDER}`}}/>
      <div style={{display:"flex",gap:20,marginTop:12,flexWrap:"wrap"}}>
        <label style={{fontFamily:"monospace",fontSize:11,color:MUTED}}>
          chaos k
          <input type="range" min={0.1} max={1.2} step={0.05} defaultValue={0.4}
            onChange={e=>(kRef.current=parseFloat(e.target.value))}
            style={{marginLeft:8,accentColor:ROSE,width:100}}/>
        </label>
        <label style={{fontFamily:"monospace",fontSize:11,color:MUTED}}>
          mineral m
          <input type="range" min={0.1} max={1.0} step={0.05} defaultValue={0.3}
            onChange={e=>(mRef.current=parseFloat(e.target.value))}
            style={{marginLeft:8,accentColor:GOLD,width:100}}/>
        </label>
      </div>
      <div style={{fontFamily:"monospace",fontSize:11,color:MUTED,marginTop:8}}>
        dS/dt = −k(chaos) + m(minerals) · Red = unharmonized → locking · Green = coherence injection → reversal
      </div>
    </div>
  );
}

const SECTIONS=[
  {n:"Abstract",txt:"The petrification transformation models systemic hardening as a three-phase arc — disruption → infiltration → locking — shared across biological calcification (hydroxyapatite in vessels and cancers), economic avalanches (power-law distributions), and planetary orbital congestion. Grounded in hermetic transmutation and AETHER's φ-optimized coherence, the framework models reversal via β-scaled SOC threshold tuning. Simulations show FQP energy gains of 25%, 40% tumor burden reduction via multi-omics integration, and self-maintaining orbital logistics."},
  {n:"Introduction",txt:"The petrification transformation posits an ontology of decay: dynamic entities evolve through stages — radiance → structure → pressure → fluid memory — but risk brittleness if unbalanced. System state S(t) decays as dS/dt = −k(chaos) + m(minerals), converging to a brittle equilibrium where dS/dt = 0 and small shocks trigger Zipf-distributed failures. Hermetic transmutation as reversal maps onto AETHER's coherence injection strategy."},
  {n:"Philosophical Ontology",txt:"Petrification embodies existential hardening: Democritus saw stones as petrified souls; hermeticism counters via transmutation. The 'systemic entropy' echoes Wittgenstein's conceptual rigidification, where ideas lose nuance. Logically, S(t) decays per dS/dt = −k(chaos) + m(minerals). At equilibrium (dS/dt = 0), small shocks trigger Zipf-distributed failures. Neural-economic isomorphisms extend to satellite constellations (e.g., Starlink): satellites 'trade' data and signals, fostering emergent capabilities — global connectivity, autonomous repair — until disruptions initiate infiltration and locking."},
  {n:"Biological Calcification",txt:"Calcification deposits calcium in soft tissues, hardening organs. Vascular plaques arise from dystrophic calcification in necrosis; metastatic calcification follows hypercalcemia. Hydroxyapatite crystals rigidify bone matrix. Pathological deposition in cancers and vessels occurs via osteoblast-like cells. Calciphylaxis exemplifies rapid skin and vessel hardening — a clinical window into petrification at the cellular scale. Myths like Medusa encode cultural memory of this process; fibrodysplasia ossificans progressiva (FOP) is the modern medical parallel."},
];

const MECHANISMS=[
  {phase:"Disruption",eq:"dS/dt = −k(chaos) × fluid channels",col:ROSE,txt:"Fluid networks overload via stress in synapses, volatility in markets, or debris in orbits. Organic adaptive channels erode. This is the entry point of petrification — the system's plasticity is taxed beyond recovery threshold."},
  {phase:"Infiltration",eq:"dS/dt = m(minerals)",col:GOLD,txt:"Minerals and perturbations replace organic components atom by atom, maximizing entropy throughout the system. Atom-by-atom substitution is geologically real (permineralization) and biologically real (calcium deposition). The system's information-carrying capacity shrinks as rigid mineral replaces flexible organic."},
  {phase:"Locking",eq:"S(t) = decay rate k + infiltration m + coherence factor β = 0",col:VIOLET,txt:"The system stabilizes in brittleness. Shocks trigger cascading Zipf-distributed failures. The locked state is not dead — it is fragile: small perturbations release large avalanches. This is the power-law regime of self-organized criticality taken to its extreme."},
];

const APPLICATIONS=[
  {title:"Biomedical · Oncology Morphogenetics",col:GREEN,txt:"Tumors function as calcifying economies: proliferating agents accumulate structural rigidity while suppressing adaptive immune signaling. AETHER's multi-omics integration framework simulates tumor evolution and predicts intervention windows, with modeled outcomes showing 40% reduction in tumor burden through coherence disruption of calcification pathways. ALP inhibition (alkaline phosphatase) is the biological lever."},
  {title:"Planetary · Golden Dome & Orbital Logistics",col:BLUE,txt:"A golden dome architecture harmonizes scalar beams across the electromagnetic spectrum, dispersing inbound threats via impedance mismatch into stable mineral by-products. Orbital layers — constellations, servicing, transport/refueling — form a technological shell tunable via Fibonacci quantization for emergent self-maintenance. Self-maintaining orbital ecosystems are the antidote to orbital 'locking' via debris congestion."},
  {title:"Economic · Fibonacci Quantization Protocol",col:GOLD,txt:"FQP systems show power-law degree distributions with significantly reduced avalanche frequency and a modeled 25% gain in systemic energy efficiency relative to untuned baseline networks. φ-quantized incentive structures prevent avalanche lock-in at market criticality. Entropy and Hurst exponent measurements validate the efficiency claim."},
  {title:"Reversal · Coherence Injection",col:CYAN,txt:"Coherence injection via μ-scaled threshold resets tunes SOC criticality, preventing terminal locking. The strategy is identical across domains: detect early infiltration signatures, inject coherence at the phase transition boundary, reset the SOC threshold before locking becomes irreversible. In biology: ALP inhibition. In orbits: autonomous servicing. In economics: φ-quantized incentives."},
];

const EQUATIONS=[
  {eq:"dS/dt = −k(chaos) + m(minerals)",note:"Governing ODE for system state. Disruption reduces S at rate k; mineral infiltration increases rigidity at rate m. When m > k, S decays toward brittle equilibrium."},
  {eq:"S(t_lock) ≈ 0 → Zipf-distributed failures",note:"Locked state: SOC power-law fragility. Small shocks trigger large avalanches. Zipf's law emerges from self-organized criticality at the edge of petrification."},
  {eq:"Reversal: dS/dt = −k + m + β·C(x,t) > 0",note:"Coherence injection term β·C(x,t) must exceed the net decay to reverse petrification. β is the SOC coupling; C(x,t) is the AETHER coherence field."},
  {eq:"τ_braiding → phase e^{4πi/5}",note:"Fibonacci anyons braid for non-Abelian topological phase evolution — a quantum-information mechanism for fault-tolerant coherence resets at the quantum layer."},
];

export default function PetrificationTransformationPage(){
  return(
    <div style={{minHeight:"100vh",background:BG,color:TEXT,padding:"40px 20px 80px",fontFamily:"'Inter',system-ui,sans-serif"}}>
      <div style={{maxWidth:980,margin:"0 auto"}}>
        <div style={{fontFamily:"monospace",fontSize:11,color:MUTED,letterSpacing:2,textTransform:"uppercase",marginBottom:8}}>AETHER · White Paper · March 2026</div>
        <h1 style={{fontSize:30,margin:"0 0 6px",fontWeight:700,background:`linear-gradient(90deg,${ROSE},${GOLD},${VIOLET})`,WebkitBackgroundClip:"text",backgroundClip:"text",color:"transparent"}}>
          The Petrification Transformation
        </h1>
        <p style={{fontFamily:"monospace",fontSize:12,color:MUTED,margin:"0 0 6px"}}>Systemic Entropy from Plasticity to Brittleness in Biological, Economic, and Planetary Contexts</p>
        <p style={{fontFamily:"monospace",fontSize:11,color:hexA(MUTED,0.7),margin:"0 0 24px"}}>Shia Miller · Independent Researcher · @StrategicProce · March 08, 2026</p>

        <div style={{background:PAN,border:`1px solid ${BORDER}`,borderRadius:12,padding:18,marginBottom:24}}>
          <div style={{fontFamily:"monospace",fontSize:11,color:CYAN,marginBottom:10,textTransform:"uppercase",letterSpacing:1}}>Live Model · Entropy Decay & Reversal</div>
          <PetrificationCanvas/>
        </div>

        {SECTIONS.map(s=>(
          <div key={s.n} style={{background:PAN,border:`1px solid ${BORDER}`,borderRadius:10,padding:"14px 16px",marginBottom:14}}>
            <div style={{fontFamily:"monospace",fontSize:12,color:CYAN,marginBottom:6,fontWeight:600}}>{s.n}</div>
            <p style={{margin:0,fontSize:13.5,color:TEXT,lineHeight:1.75}}>{s.txt}</p>
          </div>
        ))}

        <div style={{background:PAN,border:`1px solid ${BORDER}`,borderRadius:12,padding:18,marginBottom:24,marginTop:24}}>
          <div style={{fontFamily:"monospace",fontSize:11,color:GOLD,marginBottom:14,textTransform:"uppercase",letterSpacing:1}}>Mechanisms of Transformation</div>
          <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(260px,1fr))",gap:12}}>
            {MECHANISMS.map(m=>(
              <div key={m.phase} style={{background:PAN2,border:`1px solid ${BORDER}`,borderRadius:10,padding:"12px 14px"}}>
                <div style={{fontFamily:"monospace",fontSize:13,color:m.col,fontWeight:700,marginBottom:4}}>{m.phase}</div>
                <div style={{fontFamily:"monospace",fontSize:11,color:hexA(m.col,0.7),marginBottom:8,padding:"4px 8px",background:hexA(m.col,0.06),borderRadius:4}}>{m.eq}</div>
                <p style={{margin:0,fontSize:12,color:MUTED,lineHeight:1.6}}>{m.txt}</p>
              </div>
            ))}
          </div>
        </div>

        <div style={{background:PAN,border:`1px solid ${BORDER}`,borderRadius:12,padding:18,marginBottom:24}}>
          <div style={{fontFamily:"monospace",fontSize:11,color:GREEN,marginBottom:14,textTransform:"uppercase",letterSpacing:1}}>Applications in the AETHER Framework</div>
          <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(260px,1fr))",gap:12}}>
            {APPLICATIONS.map(a=>(
              <div key={a.title} style={{background:PAN2,border:`1px solid ${BORDER}`,borderRadius:10,padding:"12px 14px"}}>
                <div style={{fontSize:13,color:a.col,fontWeight:600,marginBottom:6}}>{a.title}</div>
                <p style={{margin:0,fontSize:12,color:MUTED,lineHeight:1.6}}>{a.txt}</p>
              </div>
            ))}
          </div>
        </div>

        <div style={{background:PAN,border:`1px solid ${BORDER}`,borderRadius:12,padding:18,marginBottom:24}}>
          <div style={{fontFamily:"monospace",fontSize:11,color:VIOLET,marginBottom:14,textTransform:"uppercase",letterSpacing:1}}>Key Equations</div>
          <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(280px,1fr))",gap:10}}>
            {EQUATIONS.map(eq=>(
              <div key={eq.eq} style={{background:PAN2,border:`1px solid ${BORDER}`,borderRadius:8,padding:"10px 12px"}}>
                <div style={{fontFamily:"monospace",fontSize:12.5,color:GOLD,marginBottom:6}}>{eq.eq}</div>
                <div style={{fontSize:12,color:MUTED,lineHeight:1.6}}>{eq.note}</div>
              </div>
            ))}
          </div>
        </div>

        <div style={{background:hexA(CYAN,0.04),border:`1px solid ${hexA(CYAN,0.2)}`,borderRadius:10,padding:"12px 16px",marginBottom:28,fontSize:13,color:MUTED,lineHeight:1.7}}>
          <strong style={{color:TEXT}}>Conclusion:</strong> The petrification transformation warns of entropy in unharmonized systems, but AETHER enables reversal through geometric coherence — φ-optimized coherence, Fibonacci quantization, and the same Scale-Invariant Five-Phase Loop (Sense → Deliver → Activate → Feedback → Learn) that governs cellular coherence applies equally to orbital constellations and economic networks. Stone is not an endpoint. It is a failure mode — and one that geometry can reverse.
        </div>

        <div style={{display:"flex",flexWrap:"wrap",gap:14,paddingTop:20,borderTop:`1px solid ${BORDER}`,fontFamily:"monospace",fontSize:12}}>
          <Link href="/crystallization-locking" style={{color:ROSE,textDecoration:"none"}}>→ Crystallization · Locking</Link>
          <Link href="/aether-whitepaper-v1" style={{color:GREEN,textDecoration:"none"}}>→ AETHER Whitepaper v1</Link>
          <Link href="/substrate-computing" style={{color:BLUE,textDecoration:"none"}}>→ Substrate Computing</Link>
          <Link href="/" style={{color:MUTED,textDecoration:"none"}}>→ Knowledge Graph</Link>
        </div>
      </div>
    </div>
  );
}
