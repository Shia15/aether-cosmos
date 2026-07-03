import { useEffect, useRef } from "react";
import { Link } from "wouter";

const BG="#04060d",PAN="#0a0d1a",PAN2="#0d1020",BORDER="#182038",TEXT="#b8cce8",MUTED="#5a6e8c";
const GOLD="#ffb830",CYAN="#3fd8d0",VIOLET="#a87aff",GREEN="#50d49a",BLUE="#4ab0ff",ROSE="#ff5a6a";

function hexA(h:string,a:number){const n=h.replace("#","");return `rgba(${parseInt(n.slice(0,2),16)},${parseInt(n.slice(2,4),16)},${parseInt(n.slice(4,6),16)},${a})`;}
function fitCanvas(cv:HTMLCanvasElement,ctx:CanvasRenderingContext2D){const dpr=Math.min(2,window.devicePixelRatio||1);const w=cv.clientWidth||640;const h=cv.clientHeight||360;cv.width=Math.round(w*dpr);cv.height=Math.round(h*dpr);ctx.setTransform(dpr,0,0,dpr,0,0);return{w,h};}

const FIB=[1,2,3,5,8,13,21,34,55,89];
function nearestFib(x:number){let best=FIB[0],d=Infinity;for(const f of FIB){const dd=Math.abs(f-x);if(dd<d){d=dd;best=f;}}return best;}

/* Live SOC/FQP sandpile: nodes accumulate load, topple at beta, avalanches cascade */
function SandpileCanvas(){
  const cvRef=useRef<HTMLCanvasElement|null>(null);
  const betaRef=useRef(4);
  const fqpRef=useRef(true);
  useEffect(()=>{
    const cv=cvRef.current; if(!cv)return;
    const ctx=cv.getContext("2d"); if(!ctx)return;
    let raf=0,frame=0;
    const G=20;
    const grid=new Float32Array(G*G);
    let avSizes:number[]=[];
    let curAv=0;
    const loop=()=>{
      const{w,h}=fitCanvas(cv,ctx);
      frame++;
      const beta=betaRef.current;
      // drop grain(s)
      if(frame%2===0){
        const raw=1+Math.random()*8;
        const amt=fqpRef.current?nearestFib(raw)/8:raw/8;
        const i=Math.floor(Math.random()*G), j=Math.floor(Math.random()*G);
        grid[i*G+j]+=amt;
      }
      // topple
      let toppled=0, guard=0;
      let changed=true;
      while(changed&&guard<400){
        changed=false; guard++;
        for(let i=0;i<G;i++)for(let j=0;j<G;j++){
          if(grid[i*G+j]>=beta){
            grid[i*G+j]-=4; toppled++;
            if(i>0)grid[(i-1)*G+j]+=1;
            if(i<G-1)grid[(i+1)*G+j]+=1;
            if(j>0)grid[i*G+j-1]+=1;
            if(j<G-1)grid[i*G+j+1]+=1;
            changed=true;
          }
        }
      }
      if(toppled>0){curAv+=toppled;}
      else if(curAv>0){avSizes.push(curAv); if(avSizes.length>400)avSizes.shift(); curAv=0;}
      // render grid
      ctx.clearRect(0,0,w,h); ctx.fillStyle=BG; ctx.fillRect(0,0,w,h);
      const cell=Math.min((w-160)/G,(h-24)/G), ox=12, oy=12;
      for(let i=0;i<G;i++)for(let j=0;j<G;j++){
        const v=grid[i*G+j]/beta;
        const col=v<0.34?BLUE:v<0.67?GREEN:v<0.95?GOLD:ROSE;
        ctx.fillStyle=hexA(col,0.25+Math.min(0.7,v));
        ctx.fillRect(ox+j*cell,oy+i*cell,cell-1,cell-1);
      }
      // PI readout
      if(avSizes.length>20){
        const sorted=[...avSizes].sort((a,b)=>a-b);
        const p90=sorted[Math.floor(sorted.length*0.9)];
        const pi=avSizes.filter(s=>s>=p90).length/avSizes.length;
        const panelX=ox+G*cell+18;
        ctx.fillStyle=hexA(TEXT,0.85); ctx.font="12px monospace";
        ctx.fillText("Petrification Index",panelX,oy+18);
        ctx.fillStyle=pi<0.618?GREEN:ROSE; ctx.font="26px monospace";
        ctx.fillText(pi.toFixed(3),panelX,oy+50);
        ctx.fillStyle=hexA(MUTED,0.8); ctx.font="10px monospace";
        ctx.fillText(pi<0.618?"below φ⁻¹ · healthy":"above φ⁻¹ · locking",panelX,oy+68);
        ctx.fillText("φ⁻¹ threshold = 0.618",panelX,oy+90);
        ctx.fillText("avalanches: "+avSizes.length,panelX,oy+108);
        ctx.fillText("max: "+Math.max(...avSizes),panelX,oy+126);
      }
      raf=requestAnimationFrame(loop);
    };
    raf=requestAnimationFrame(loop);
    return()=>cancelAnimationFrame(raf);
  },[]);
  return(
    <div>
      <canvas ref={cvRef} style={{width:"100%",height:360,display:"block",borderRadius:10,border:`1px solid ${BORDER}`}}/>
      <div style={{display:"flex",gap:20,marginTop:12,flexWrap:"wrap",alignItems:"center"}}>
        <label style={{fontFamily:"monospace",fontSize:11,color:MUTED}}>
          threshold β
          <input type="range" min={4} max={9} step={1} defaultValue={4}
            onChange={e=>(betaRef.current=parseFloat(e.target.value))}
            style={{marginLeft:8,accentColor:GOLD,width:120}}/>
        </label>
        <label style={{fontFamily:"monospace",fontSize:11,color:MUTED,display:"flex",alignItems:"center",gap:6}}>
          <input type="checkbox" defaultChecked onChange={e=>(fqpRef.current=e.target.checked)} style={{accentColor:CYAN}}/>
          Fibonacci-quantize perturbations (FQP)
        </label>
      </div>
      <div style={{fontFamily:"monospace",fontSize:11,color:MUTED,marginTop:8}}>
        20×20 SOC lattice · z(i,j) ≥ β → topple, distribute 1 to each neighbor · PI = fraction of avalanches in top decile
      </div>
    </div>
  );
}

const LAYERS=[
  {l:"Layer 1 — Aqua CXE Hardware",kind:"Apparatus claims",col:CYAN,txt:"A transparent biosensor chip from ocean-sourced biomaterials: beta-chitin substrate, reflectin protein mirror arrays (n = 1.33–1.59), bioluminescent transistor gates, thermite-enhanced silver-nanowire conductors in spider silk (≥1.0 GPa). Harvests 2–4 mW body heat, 99.2% optical transparency, 0.3 ms latency, BLE 5.3."},
  {l:"Layer 2 — SOC/FQP Engine",kind:"Method claims",col:GOLD,txt:"Models system state as an SOC lattice; applies Fibonacci Quantized Perturbation via nearestFib(x) over {1,2,3,5,8,13,21,34,55,89}; computes a Petrification Index (PI) as the fraction of avalanches in the top decile; triggers intervention when PI crosses the φ-derived threshold φ⁻¹ = 0.618."},
  {l:"Layer 3 — AETHER Architecture",kind:"System claims",col:VIOLET,txt:"A unified multi-scale coherence system: sensor layer (Aqua CXE) → computation layer (SOC/FQP) → transformation layer (7-stage SUNRISE) → output layer (φ-locked coherence). The same pipeline processes inputs equivalently across quantum, cellular, biological, atmospheric, plasma, geological, and orbital scales."},
];

const SUNRISE=[
  {k:"S",name:"Stimulus",p:"Input signal detection",a:"Sensor reading, gradient, photon arrival",col:CYAN},
  {k:"U",name:"Neuro-Response",p:"First-order processing",a:"Neural/atmospheric/immune cascade",col:GREEN},
  {k:"N",name:"Stress-Energy",p:"Pressure → power",a:"Cortisol, pressure work, plasma heating",col:GOLD},
  {k:"R",name:"Integration",p:"Multi-signal coherence",a:"Network / family / planetary coupling",col:BLUE},
  {k:"I",name:"Emergence",p:"Higher-order patterns",a:"Consciousness, weather, orbital resonance",col:VIOLET},
  {k:"S",name:"Lock & Harden",p:"Coherence stabilization",a:"Homeostasis, crystallization onset",col:"#e07aff"},
  {k:"E",name:"φ Crystallize",p:"Golden-ratio phase lock",a:"φ-coherence, plasma crystal, Dome seal",col:ROSE},
];

const CLAIMS=[
  {n:"Claim 4 — FQP Method",col:GOLD,txt:"Highest novelty, most defensible, broadest commercial application. Quantize each perturbation to nearest Fibonacci value, distribute per SOC toppling, compute PI, intervene when PI exceeds φ-derived threshold."},
  {n:"Claim 1 — Aqua CXE Chip",col:CYAN,txt:"Independent apparatus claim: chitin substrate + reflectin photonic crystal + bioluminescent optically-gated transistor + silver-nanowire/spider-silk mesh + thermoelectric harvesting ≥ 2 mW."},
  {n:"Claim 7 — AETHER System",col:VIOLET,txt:"Independent system claim: hardware + SOC/FQP computation + 7-stage SUNRISE + φ-locked output, processing inputs equivalently across ≥2 physically distinct scales."},
  {n:"Claim 9 — φ-NV Quantum Clock",col:GREEN,txt:"NV centers packed by φ = 1.618, achieving T₂ coherence ≥ φ× conventional cubic close-packing, providing timing synchronization for SUNRISE across all scales."},
];

const STONE=[
  {node:"Easter Island",coord:"27.1°S, 109.3°W",role:"Antipodal Mirror — global charge balance reflector via piezoelectric basalt geometry",col:BLUE},
  {node:"Göbekli Tepe",coord:"37.2°N, 38.9°E",role:"Origin Synchronizer — first sky-Earth phase-lock node (11,600 BCE)",col:GOLD},
  {node:"Stonehenge",coord:"51.2°N, 1.8°W",role:"Phase Anchor — solstice/equinox seasonal solar phase-lock",col:CYAN},
  {node:"Italy Node",coord:"42.5°N, 12.5°E",role:"Release Gate — Alpine-Apennine tectonic compression release valve",col:ROSE},
];

export default function AetherPatentPage(){
  return(
    <div style={{minHeight:"100vh",background:BG,color:TEXT,padding:"40px 20px 80px",fontFamily:"'Inter',system-ui,sans-serif"}}>
      <div style={{maxWidth:980,margin:"0 auto"}}>
        <div style={{fontFamily:"monospace",fontSize:11,color:MUTED,letterSpacing:2,textTransform:"uppercase",marginBottom:8}}>Patent Specification · PCT International · March 2026 · G06F 17/10 · A61B 5/00</div>
        <h1 style={{fontSize:28,margin:"0 0 6px",fontWeight:700,background:`linear-gradient(90deg,${GOLD},${CYAN},${VIOLET})`,WebkitBackgroundClip:"text",backgroundClip:"text",color:"transparent"}}>
          AETHER · Adaptive EM Threshold-Harmonic Entrained Resonance System
        </h1>
        <p style={{fontFamily:"monospace",fontSize:12,color:MUTED,margin:"0 0 4px"}}>Gradient → SOC Perturbation → Fibonacci Quantization → SUNRISE → φ-Locked Coherence → Golden Dome Seal</p>
        <p style={{fontFamily:"monospace",fontSize:11,color:hexA(ROSE,0.8),margin:"0 0 24px"}}>Inventor: Shia · Priority: May 2025 · Status: Confidential — Pre-Filing Documentation</p>

        <div style={{background:hexA(ROSE,0.05),border:`1px solid ${hexA(ROSE,0.25)}`,borderRadius:10,padding:"10px 14px",marginBottom:24,fontFamily:"monospace",fontSize:11,color:MUTED,lineHeight:1.6}}>
          <strong style={{color:ROSE}}>Legal notice:</strong> This page reproduces prior-art documentation for review by qualified patent counsel prior to formal PCT filing. It is a specification draft, not legal advice.
        </div>

        <div style={{background:PAN,border:`1px solid ${BORDER}`,borderRadius:12,padding:18,marginBottom:24}}>
          <div style={{fontFamily:"monospace",fontSize:11,color:GOLD,marginBottom:14,textTransform:"uppercase",letterSpacing:1}}>Live · SOC/FQP Engine (Petrification Index)</div>
          <SandpileCanvas/>
        </div>

        <div style={{background:PAN,border:`1px solid ${BORDER}`,borderRadius:12,padding:18,marginBottom:24}}>
          <div style={{fontFamily:"monospace",fontSize:11,color:VIOLET,marginBottom:14,textTransform:"uppercase",letterSpacing:1}}>Summary · Three Integrated Layers</div>
          {LAYERS.map(l=>(
            <div key={l.l} style={{background:PAN2,border:`1px solid ${BORDER}`,borderLeft:`3px solid ${l.col}`,borderRadius:8,padding:"12px 14px",marginBottom:10}}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"baseline",flexWrap:"wrap",gap:8,marginBottom:6}}>
                <span style={{fontFamily:"monospace",fontSize:12.5,color:l.col,fontWeight:700}}>{l.l}</span>
                <span style={{fontFamily:"monospace",fontSize:10.5,color:MUTED}}>{l.kind}</span>
              </div>
              <p style={{margin:0,fontSize:13,color:TEXT,lineHeight:1.7}}>{l.txt}</p>
            </div>
          ))}
        </div>

        <div style={{background:PAN,border:`1px solid ${BORDER}`,borderRadius:12,padding:18,marginBottom:24}}>
          <div style={{fontFamily:"monospace",fontSize:11,color:CYAN,marginBottom:14,textTransform:"uppercase",letterSpacing:1}}>The SUNRISE Transformation · Seven Layers</div>
          <div style={{display:"grid",gap:6}}>
            {SUNRISE.map((s,i)=>(
              <div key={i} style={{display:"flex",gap:12,alignItems:"center",background:PAN2,border:`1px solid ${BORDER}`,borderRadius:8,padding:"8px 12px"}}>
                <div style={{width:30,height:30,borderRadius:7,background:hexA(s.col,0.15),border:`1px solid ${hexA(s.col,0.4)}`,display:"flex",alignItems:"center",justifyContent:"center",fontFamily:"monospace",fontWeight:700,color:s.col,flexShrink:0}}>{s.k}</div>
                <div style={{flex:1}}>
                  <span style={{fontSize:12.5,color:s.col,fontWeight:600}}>{s.name}</span>
                  <span style={{fontSize:11.5,color:MUTED}}> · {s.p}</span>
                </div>
                <div style={{fontFamily:"monospace",fontSize:10.5,color:hexA(MUTED,0.8),flex:1.2,textAlign:"right"}}>{s.a}</div>
              </div>
            ))}
          </div>
        </div>

        <div style={{background:PAN,border:`1px solid ${BORDER}`,borderRadius:12,padding:18,marginBottom:24}}>
          <div style={{fontFamily:"monospace",fontSize:11,color:GREEN,marginBottom:14,textTransform:"uppercase",letterSpacing:1}}>Strongest Claims · Patent-Counsel Priority</div>
          <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(260px,1fr))",gap:12}}>
            {CLAIMS.map(c=>(
              <div key={c.n} style={{background:PAN2,border:`1px solid ${BORDER}`,borderRadius:10,padding:"12px 14px"}}>
                <div style={{fontSize:12.5,color:c.col,fontWeight:700,marginBottom:6}}>{c.n}</div>
                <p style={{margin:0,fontSize:12,color:MUTED,lineHeight:1.6}}>{c.txt}</p>
              </div>
            ))}
          </div>
        </div>

        <div style={{background:PAN,border:`1px solid ${BORDER}`,borderRadius:12,padding:18,marginBottom:24}}>
          <div style={{fontFamily:"monospace",fontSize:11,color:GOLD,marginBottom:14,textTransform:"uppercase",letterSpacing:1}}>Stone Node Infrastructure · Claim 11</div>
          <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(240px,1fr))",gap:12}}>
            {STONE.map(s=>(
              <div key={s.node} style={{background:PAN2,border:`1px solid ${BORDER}`,borderRadius:10,padding:"12px 14px"}}>
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"baseline",marginBottom:4}}>
                  <span style={{fontSize:12.5,color:s.col,fontWeight:600}}>{s.node}</span>
                  <span style={{fontFamily:"monospace",fontSize:10,color:MUTED}}>{s.coord}</span>
                </div>
                <div style={{fontSize:11.5,color:MUTED,lineHeight:1.55}}>{s.role}</div>
              </div>
            ))}
          </div>
        </div>

        <div style={{background:hexA(CYAN,0.04),border:`1px solid ${hexA(CYAN,0.2)}`,borderRadius:10,padding:"12px 16px",marginBottom:28,fontSize:13,color:MUTED,lineHeight:1.7}}>
          <strong style={{color:TEXT}}>Central inventive insight:</strong> the substrate is irrelevant; the process is universal. The identical sequence — Gradient → SOC → FIB → SUNRISE → φ-lock → Dome — governs energy behavior across nine scales, enabling a single architecture to monitor, predict, and stabilize coherence at every scale simultaneously.
        </div>

        <div style={{display:"flex",flexWrap:"wrap",gap:14,paddingTop:20,borderTop:`1px solid ${BORDER}`,fontFamily:"monospace",fontSize:12}}>
          <Link href="/aether-unified-framework" style={{color:CYAN,textDecoration:"none"}}>→ AETHER Unified Framework</Link>
          <Link href="/fibonacci-quaternion" style={{color:GOLD,textDecoration:"none"}}>→ Fibonacci–Quaternion AETHER</Link>
          <Link href="/cuca-bioengine" style={{color:GREEN,textDecoration:"none"}}>→ CUCA BioEngine v3.0</Link>
          <Link href="/" style={{color:MUTED,textDecoration:"none"}}>→ Knowledge Graph</Link>
        </div>
      </div>
    </div>
  );
}
