import { useEffect, useRef } from "react";
import { Link } from "wouter";

const BG="#04060d",PAN="#0a0d1a",PAN2="#0d1020",BORDER="#182038",TEXT="#b8cce8",MUTED="#5a6e8c";
const GOLD="#ffb830",CYAN="#3fd8d0",VIOLET="#a87aff",GREEN="#50d49a",BLUE="#4ab0ff",ROSE="#ff5a6a";

function hexA(h:string,a:number){const n=h.replace("#","");return `rgba(${parseInt(n.slice(0,2),16)},${parseInt(n.slice(2,4),16)},${parseInt(n.slice(4,6),16)},${a})`;}
function fitCanvas(cv:HTMLCanvasElement,ctx:CanvasRenderingContext2D){const dpr=Math.min(2,window.devicePixelRatio||1);const w=cv.clientWidth||640;const h=cv.clientHeight||360;cv.width=Math.round(w*dpr);cv.height=Math.round(h*dpr);ctx.setTransform(dpr,0,0,dpr,0,0);return{w,h};}

const LAYER_COLS=[GOLD,CYAN,VIOLET,GREEN,BLUE,"#e07aff","#4ad0ff","#ffd060"];
const LAYER_NAMES=["L0 AETHER Fabric","L1 Molecular Substrate","L2 Quantum-Bio Compute","L3 Signal Fidelity","L4 CLCS Control","L5 Coherence Engine","L6 Meta-Learn / Replicate","L7 Resonant Cell"];

/* Live 8-layer stack: coherence packets glide bottom -> top, modulated by alpha(S_L0) */
function StackCanvas(){
  const cvRef=useRef<HTMLCanvasElement|null>(null);
  const alphaRef=useRef(1.0);
  useEffect(()=>{
    const cv=cvRef.current; if(!cv)return;
    const ctx=cv.getContext("2d"); if(!ctx)return;
    let raf=0,t=0;
    const loop=()=>{
      const{w,h}=fitCanvas(cv,ctx);
      t+=0.014;
      const alpha=alphaRef.current;
      ctx.clearRect(0,0,w,h); ctx.fillStyle=BG; ctx.fillRect(0,0,w,h);
      const n=8, pad=14, bh=(h-pad*2)/n, bw=w-160;
      for(let i=0;i<n;i++){
        // layer 0 at bottom => i drawn from bottom up
        const row=n-1-i;
        const y=pad+row*bh;
        const col=LAYER_COLS[i];
        // coherence increases up the stack, scaled by alpha
        const coh=(0.35+0.6*(i/(n-1)))*alpha;
        ctx.fillStyle=hexA(col,0.08+coh*0.14);
        ctx.strokeStyle=hexA(col,0.5);
        ctx.lineWidth=1;
        ctx.beginPath(); ctx.roundRect(20,y+3,bw,bh-6,6); ctx.fill(); ctx.stroke();
        ctx.fillStyle=hexA(col,0.95); ctx.font="11px monospace";
        ctx.fillText(LAYER_NAMES[i],30,y+bh/2+4);
        // coherence bar
        const bx=20+bw-140;
        ctx.fillStyle=hexA(TEXT,0.15); ctx.fillRect(bx,y+bh/2-3,120,6);
        ctx.fillStyle=col; ctx.fillRect(bx,y+bh/2-3,120*Math.min(1,coh),6);
      }
      // rising coherence packets
      for(let p=0;p<10;p++){
        const ph=(t*0.5+p/10)%1;
        const py=(pad+(n)*bh)-ph*(n*bh);
        const px=20+bw+40+Math.sin(t*2+p)*10;
        const size=3+ph*3*alpha;
        ctx.fillStyle=hexA(CYAN,0.5*alpha*(0.4+ph*0.6));
        ctx.beginPath(); ctx.arc(px,py,size,0,Math.PI*2); ctx.fill();
      }
      // upward arrow label
      ctx.fillStyle=hexA(MUTED,0.7); ctx.font="10px monospace";
      ctx.save(); ctx.translate(20+bw+60,h/2); ctx.rotate(-Math.PI/2);
      ctx.fillText("reality rises  ·  C(x,t) = C_L1 · α(S_L0)",-90,4); ctx.restore();
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
          geophysical α(S_L0)
          <input type="range" min={0.2} max={1.0} step={0.02} defaultValue={1.0}
            onChange={e=>(alphaRef.current=parseFloat(e.target.value))}
            style={{marginLeft:8,accentColor:CYAN,width:140}}/>
        </label>
      </div>
      <div style={{fontFamily:"monospace",fontSize:11,color:MUTED,marginTop:8}}>
        α ≈ 1: stable Schumann + geomagnetic field · α &lt; 1: geomagnetic storm or EM interference degrades effective coherence at every layer
      </div>
    </div>
  );
}

const LAYERS=[
  {l:"L0",name:"AETHER Fabric",dom:"Geophysical / planetary EM",role:"Initial conditions + timing",sub:"Schumann resonances, geomagnetic field, bioelectric fields, ionic gradients, atmospheric circuit",col:GOLD},
  {l:"L1",name:"Molecular Substrate",dom:"DNA / RNA / Proteins / Lipids",role:"Hardware",sub:"Chromatin, metabolome, lipid bilayers, organelle architecture",col:CYAN},
  {l:"L2",name:"Quantum-Bio Computation",dom:"Molecular / cellular",role:"Processing",sub:"ENAQT, proton tunneling, electron transport, radical pair mechanism",col:VIOLET},
  {l:"L3",name:"Signal Fidelity",dom:"Metabolic / neural",role:"Timing + integrity",sub:"Mineral cascade, thyroid → mitochondria → neural clock",col:GREEN},
  {l:"L4",name:"CLCS Control",dom:"System dynamics",role:"Control",sub:"Feedback loops, error minimization, PID / AI-K",col:BLUE},
  {l:"L5",name:"Coherence Engine",dom:"Cross-loop",role:"Stability",sub:"C(x,t) field, gradient ∇C, relational norm ‖E‖ℛ",col:"#e07aff"},
  {l:"L6",name:"Meta-Learning / Replication",dom:"Generative",role:"Evolution",sub:"G(·), K_core capsule, Z = compress(S), PACE evolution",col:"#4ad0ff"},
  {l:"L7",name:"Resonant Cell / Embodiment",dom:"Real-world deployment",role:"Embodiment",sub:"9-domain sensor array / biological agent in vivo",col:"#ffd060"},
];

const FABRIC=[
  {sig:"Schumann resonances (7.83 Hz)",coup:"Neural oscillation entrainment, circadian pacemakers",role:"System clock signal — L0 timing reference",col:GOLD},
  {sig:"Geomagnetic field (25–65 μT)",coup:"Magnetoreception, radical-pair mechanism in cryptochrome",role:"Directional coherence signal — spatial orientation",col:CYAN},
  {sig:"Bioelectric fields (0.1–1 V/cm)",coup:"Wound healing, morphogenetic polarity, tumor suppression",role:"Tissue-scale coherence — physical basis of ∇C",col:GREEN},
  {sig:"Ionic gradients (Na⁺/K⁺, Ca²⁺)",coup:"Membrane potential, action potentials, gap junctions",role:"L1 substrate signal — X(t) initialization",col:VIOLET},
];

const PHASES=[
  {n:"1 — Proof",org:"Xenopus (frog)",mile:"Kinematic self-replication confirmed · 4–5 generations",safe:"Natural depletion ~10 days",time:"Achieved 2021",col:GREEN},
  {n:"2 — Motility",org:"Zebrafish / mouse",mile:"In vivo bio-agents in vertebrate tissue · coherence measured",safe:"Immune clearance + auxotrophy backup",time:"2024–2026",col:CYAN},
  {n:"3 — Directed",org:"Non-human primate",mile:"Full coherence engine · C(x,t) corrected real-time · u(t) actuated",safe:"Triple kill switch",time:"2026–2029",col:BLUE},
  {n:"4 — Human-compatible",org:"Human tissue (in vitro)",mile:"Anthrobot agents · SynHG X*(t) encoding · degradation tested",safe:"Full regulatory review",time:"2028–2032",col:VIOLET},
  {n:"5 — Therapeutic",org:"Human (in vivo)",mile:"CLCS-Bio coherence nodes in tumor microenvironment",safe:"IND filing · Phase I · kill-switch cert",time:"2030+",col:ROSE},
];

export default function CucaWhitePaperPage(){
  return(
    <div style={{minHeight:"100vh",background:BG,color:TEXT,padding:"40px 20px 80px",fontFamily:"'Inter',system-ui,sans-serif"}}>
      <div style={{maxWidth:980,margin:"0 auto"}}>
        <div style={{fontFamily:"monospace",fontSize:11,color:MUTED,letterSpacing:2,textTransform:"uppercase",marginBottom:8}}>CLCS–AETHER · White Paper v4.1 · March 2026 · Sections 1–31</div>
        <h1 style={{fontSize:30,margin:"0 0 6px",fontWeight:700,background:`linear-gradient(90deg,${GOLD},${CYAN},${VIOLET})`,WebkitBackgroundClip:"text",backgroundClip:"text",color:"transparent"}}>
          CUCA · Unified Coherence Architecture
        </h1>
        <p style={{fontFamily:"monospace",fontSize:12,color:MUTED,margin:"0 0 4px"}}>Physics → Biology → Environment → Computation → Intelligence → Replication</p>
        <p style={{fontFamily:"monospace",fontSize:11,color:hexA(CYAN,0.8),margin:"0 0 24px"}}>AETHER provides the substrate · CLCS provides the control · Biology provides the computation · Coherence provides the objective</p>

        <div style={{background:PAN,border:`1px solid ${BORDER}`,borderRadius:12,padding:18,marginBottom:24}}>
          <div style={{fontFamily:"monospace",fontSize:11,color:CYAN,marginBottom:14,textTransform:"uppercase",letterSpacing:1}}>Live · Eight-Layer Coherence Stack (bottom-up)</div>
          <StackCanvas/>
        </div>

        <div style={{background:hexA(GOLD,0.04),border:`1px solid ${hexA(GOLD,0.2)}`,borderRadius:10,padding:"12px 16px",marginBottom:24,fontSize:13,color:MUTED,lineHeight:1.7}}>
          <strong style={{color:TEXT}}>Honest status:</strong> We have not created humans. But we have created the first programmable, self-replicating, self-destructing biological mechanisms that can be embedded in tissue and steered by the same closed-loop mathematics. The vector lines are being drawn — one chromosome, one circuit, one coherent subsystem at a time.
        </div>

        <div style={{background:PAN,border:`1px solid ${BORDER}`,borderRadius:12,padding:18,marginBottom:24}}>
          <div style={{fontFamily:"monospace",fontSize:11,color:VIOLET,marginBottom:14,textTransform:"uppercase",letterSpacing:1}}>The Eight-Layer Architecture</div>
          <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(300px,1fr))",gap:10}}>
            {LAYERS.map(l=>(
              <div key={l.l} style={{background:PAN2,border:`1px solid ${BORDER}`,borderLeft:`3px solid ${l.col}`,borderRadius:8,padding:"12px 14px"}}>
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"baseline",marginBottom:4}}>
                  <span style={{fontFamily:"monospace",fontSize:13,color:l.col,fontWeight:700}}>{l.l} · {l.name}</span>
                  <span style={{fontFamily:"monospace",fontSize:10,color:MUTED}}>{l.role}</span>
                </div>
                <div style={{fontFamily:"monospace",fontSize:11,color:hexA(l.col,0.8),marginBottom:6}}>{l.dom}</div>
                <div style={{fontSize:12,color:MUTED,lineHeight:1.55}}>{l.sub}</div>
              </div>
            ))}
          </div>
        </div>

        <div style={{background:PAN,border:`1px solid ${BORDER}`,borderRadius:12,padding:18,marginBottom:24}}>
          <div style={{fontFamily:"monospace",fontSize:11,color:GOLD,marginBottom:6,textTransform:"uppercase",letterSpacing:1}}>Layer 0 · The AETHER Fabric</div>
          <p style={{margin:"0 0 14px",fontSize:13,color:TEXT,lineHeight:1.7}}>Every substrate sits in a medium. The molecular substrate sits in a geophysical-bioelectric field environment that provides initial conditions, timing signals, and electromagnetic coherence context. Layer 0 is not metaphysical — it is a set of physically measurable field phenomena. Formally, S = S_L0 ⋈ S_L1, and C(x,t) = C_L1(x,t) · α(S_L0).</p>
          <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(260px,1fr))",gap:12}}>
            {FABRIC.map(f=>(
              <div key={f.sig} style={{background:PAN2,border:`1px solid ${BORDER}`,borderRadius:10,padding:"12px 14px"}}>
                <div style={{fontSize:12.5,color:f.col,fontWeight:600,marginBottom:4}}>{f.sig}</div>
                <div style={{fontSize:11.5,color:MUTED,lineHeight:1.55,marginBottom:6}}>{f.coup}</div>
                <div style={{fontFamily:"monospace",fontSize:10.5,color:hexA(f.col,0.75)}}>{f.role}</div>
              </div>
            ))}
          </div>
        </div>

        <div style={{background:PAN,border:`1px solid ${BORDER}`,borderRadius:12,padding:18,marginBottom:24}}>
          <div style={{fontFamily:"monospace",fontSize:11,color:GREEN,marginBottom:6,textTransform:"uppercase",letterSpacing:1}}>Sensor vs Controller · The Corrected Vector-Field Relationship</div>
          <p style={{margin:"0 0 12px",fontSize:13,color:TEXT,lineHeight:1.7}}>RNA velocity and Dynamo reconstruct the natural vector field v_nat(x,t) — they are descriptive sensors. CUCA defines a target field v*(x,t) from the desired state X*(t), computes deviation Δv = v* − v_nat, and applies a control force to close the gap.</p>
          <div style={{fontFamily:"monospace",fontSize:12.5,color:GOLD,background:PAN2,border:`1px solid ${BORDER}`,borderRadius:8,padding:"10px 14px",lineHeight:1.9}}>
            E(t) = X*(t) − X(t)  ·  u(t) = K(E(t))  ·  C(x,t) = 1 − ‖E‖/‖X*‖<br/>
            u(t) = K · (v*(x,t) − v_nat(x,t))   [vector-field control law]
          </div>
          <p style={{margin:"12px 0 0",fontSize:12.5,color:MUTED,lineHeight:1.7}}>Dynamo asks: where are cells going? CUCA asks: where should they go, and how do we correct the deviation? RNA velocity is the sensor. CUCA is the controller. Together they close the loop neither provides alone.</p>
        </div>

        <div style={{background:PAN,border:`1px solid ${BORDER}`,borderRadius:12,padding:18,marginBottom:24}}>
          <div style={{fontFamily:"monospace",fontSize:11,color:BLUE,marginBottom:14,textTransform:"uppercase",letterSpacing:1}}>Development Roadmap · Animal-First, Human-Last</div>
          <div style={{display:"grid",gap:8}}>
            {PHASES.map(p=>(
              <div key={p.n} style={{background:PAN2,border:`1px solid ${BORDER}`,borderLeft:`3px solid ${p.col}`,borderRadius:8,padding:"10px 14px"}}>
                <div style={{display:"flex",flexWrap:"wrap",justifyContent:"space-between",alignItems:"baseline",gap:8,marginBottom:4}}>
                  <span style={{fontFamily:"monospace",fontSize:12.5,color:p.col,fontWeight:700}}>{p.n} · {p.org}</span>
                  <span style={{fontFamily:"monospace",fontSize:10.5,color:GOLD}}>{p.time}</span>
                </div>
                <div style={{fontSize:12,color:TEXT,lineHeight:1.5,marginBottom:2}}>{p.mile}</div>
                <div style={{fontFamily:"monospace",fontSize:10.5,color:MUTED}}>Safety: {p.safe}</div>
              </div>
            ))}
          </div>
        </div>

        <div style={{background:hexA(CYAN,0.04),border:`1px solid ${hexA(CYAN,0.2)}`,borderRadius:10,padding:"12px 16px",marginBottom:28,fontSize:13,color:MUTED,lineHeight:1.7}}>
          <strong style={{color:TEXT}}>CUCA_silicon(t) ≡ CUCA_biological(t):</strong> the equations do not care whether the sensor is a silicon chip or a cilia-bearing Anthrobot. Eight layers, eight equations, one coherence objective. From the geomagnetic field to the living cell to the distributed therapeutic network. No metal. No silicon. Only living code — reading reality bottom-up, shaping it top-down, ending cleanly when the mission is done.
        </div>

        <div style={{display:"flex",flexWrap:"wrap",gap:14,paddingTop:20,borderTop:`1px solid ${BORDER}`,fontFamily:"monospace",fontSize:12}}>
          <Link href="/aether-unified-framework" style={{color:CYAN,textDecoration:"none"}}>→ AETHER Unified Framework</Link>
          <Link href="/cuca-bioengine" style={{color:GREEN,textDecoration:"none"}}>→ CUCA BioEngine v3.2</Link>
          <Link href="/aether-theory-deck" style={{color:GOLD,textDecoration:"none"}}>→ AETHER Theory Deck</Link>
          <Link href="/graph-map" style={{color:MUTED,textDecoration:"none"}}>→ Knowledge Graph</Link>
        </div>
      </div>
    </div>
  );
}
