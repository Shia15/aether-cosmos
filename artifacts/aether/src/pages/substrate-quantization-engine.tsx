import { useEffect, useRef, useState } from "react";
import katex from "katex";
import "katex/dist/katex.min.css";
const infographic = "/api/storage/public-objects/E514D86D-00E9-4E33-A416-06F23067C2F8_1782531582029.png";
const V = {
  bg:"#04060E",aurora:"#00FFB2",gold:"#C8A030",blue:"#4488FF",
  vio:"#9966FF",amb:"#FF9933",rose:"#FF6699",plasma:"#FF4477",
  green:"#44CC77",dim:"#3A5060",ink:"#B8CCE8",fire:"#FF6622",
};
const MONO="'Space Mono',monospace";
const SERIF="'Crimson Pro',serif";
const DISP="'Cinzel',serif";

function kx(tex:string,dm=false){
  try{return katex.renderToString(tex,{throwOnError:false,output:"html",displayMode:dm});}
  catch{return tex;}
}

// ── Module-level types ──────────────────────────────────────────────────────
interface NetNode{id:number;x:number;y:number;vx:number;vy:number;type:number;r:number;}
interface NetEdge{a:number;b:number;w:number;}

// ── Static data ─────────────────────────────────────────────────────────────
const MARK_TYPES=[
  {label:"DNA Methylation",col:V.vio},
  {label:"Histone Acetylation",col:V.gold},
  {label:"Histone Methylation",col:V.amb},
  {label:"Histone Phosphorylation",col:V.rose},
  {label:"Chromatin Accessibility",col:V.aurora},
  {label:"Non-coding RNA",col:V.blue},
];

const SUBSTRATES=[
  {name:"Polysaccharide-rich",sub:"Bacterial Slime",col:V.green,
    props:["High viscosity","Gel-forming","Biofilm matrix","Ion chelation"]},
  {name:"Protein-rich",sub:"EPS / Enzymatic",col:V.blue,
    props:["Enzymatic activity","Surface adhesion","Signal transduction","Structural scaffold"]},
  {name:"Humic Substances",sub:"Complex Organic",col:V.amb,
    props:["Redox activity","Carbon reservoir","Pollutant binding","Electron shuttle"]},
  {name:"Mineral Particles",sub:"Clay / Silica / Metal Oxides",col:V.gold,
    props:["Ion exchange","Surface catalysis","Sorption sites","Crystalline lattice"]},
  {name:"Mixed Organic-Mineral",sub:"Composite Substrate",col:V.vio,
    props:["Multi-modal signals","Hybrid binding","Gradient fields","Network bridging"]},
];

const PARAMS=[
  "Polysaccharide Content",
  "Protein Content",
  "Humic Content",
  "Mineral Content",
  "Surface Charge",
  "Porosity",
  "Hydration Capacity",
];

const PIPELINE=[
  {n:"01",label:"SUBSTRATE CHARACTERISATION",desc:"Measure raw material properties",col:V.aurora},
  {n:"02",label:"DISCRETISATION",desc:"Convert to Q-state space",col:V.blue},
  {n:"03",label:"SIGNAL PROFILE",desc:"Quantify molecular signals",col:V.green},
  {n:"04",label:"EPIGENETIC RESPONSE",desc:"Measure marks (multi-omics)",col:V.gold},
  {n:"05",label:"NETWORK CONSTRUCTION",desc:"Build distribution network",col:V.amb},
  {n:"06",label:"SPECTRUM ANALYSIS",desc:"Compute metrics and map spectrum",col:V.plasma},
];

const CUCA_LAYERS=[
  {id:"P8",name:"Octopus Chromatophore",org:"Octopus dermis",dim:"0D point field",
   stability:"Low",ts:"100ms",cMin:0,cMax:0.05,col:V.plasma,
   note:"Analog sac cannot digitize -- edge constraint fires immediately"},
  {id:"P4",name:"Morpho Multilayer",org:"Morpho butterfly",dim:"1D directional",
   stability:"High (directional)",ts:"Fixed",cMin:0.2,cMax:0.4,col:V.rose,
   note:"Angle-dependent -- perpendicular edges not resolved"},
  {id:"P6",name:"Squid Reflectin",org:"Squid iridocyte",dim:"1D sinusoidal gradient",
   stability:"Medium (dynamic)",ts:"17-32s",cMin:0.4,cMax:0.55,col:V.amb,
   note:"Rugate profile reduces sidelobes -- still 1D"},
  {id:"P7",name:"Cuttlefish Disruptive",org:"Cuttlefish dermis",dim:"2D spatial pattern",
   stability:"Medium (neural)",ts:"200ms",cMin:0.55,cMax:0.7,col:V.gold,
   note:"Abandons mimicry -- redirects via outline disruption"},
  {id:"P5",name:"Chameleon Nanocrystal",org:"Chameleon dermis",dim:"2D photonic lattice",
   stability:"High (tunable)",ts:"Seconds",cMin:0.6,cMax:0.75,col:V.green,
   note:"2D bandgap -- two axes resolved, third axis still weak"},
  {id:"P3",name:"Lycaenid Gyroid",org:"Lycaenid butterfly",dim:"3D photonic crystal",
   stability:"Maximum omni-directional",ts:"Fixed",cMin:0.85,cMax:0.95,col:V.aurora,
   note:"FULL 3D BANDGAP -- chessboard edges solved from every direction"},
  {id:"P1",name:"Bouligand Chitin",org:"Crab exoskeleton",dim:"3D helicoidal",
   stability:"Maximum structural",ts:"Developmental",cMin:1,cMax:1,col:V.blue,
   note:"Structural invariant -- distributes all stress across all angles"},
  {id:"FULL",name:"v3.0 Full Stack P0-P9",org:"Integrated system",dim:"P0-P9 integrated",
   stability:"Fully coherent",ts:"Multi-timescale",cMin:0.90,cMax:0.98,col:V.aurora,
   note:"Gyroid passive floor + tunable upper layers + autologous genome substrate"},
];

const CONSTRAINT_DOMAINS=[
  {domain:"Cephalopod skin",sys:"Chromatophores + iridophores + papillae",
   input:"Chessboard -- binary edges all directions",fail:"Pattern glitch, flicker, fallback"},
  {domain:"Atmosphere",sys:"Pressure, temperature, humidity gradients",
   input:"Extreme discontinuous pressure boundary",fail:"Turbulence, shock wave, lightning discharge"},
  {domain:"Lithosphere",sys:"Stress coupling across fault networks",
   input:"Rapid binary stress reversal across locked fault",fail:"Irregular rupture, aftershock cascade"},
  {domain:"Human cognition",sys:"Neural coherence across cortical networks",
   input:"Simultaneous contradictory logical demands",fail:"Fragmentation, paralysis, confabulation"},
  {domain:"Financial markets",sys:"Continuous price discovery across coupled assets",
   input:"Simultaneous binary liquidity collapse",fail:"Flash crash, bid-ask fragmentation"},
  {domain:"CLCS / CUCA",sys:"Coherence field C(x,t) across sensing layers",
   input:"E(t) >> system bandwidth -- overconstraint",fail:"C(x,t) to 0, replication spikes, fallback"},
];

// ── Sub-components ───────────────────────────────────────────────────────────
function Chip({col,children}:{col:string;children:string}){
  return(
    <span style={{display:"inline-block",padding:"2px 10px",borderRadius:3,
      background:col+"18",border:`1px solid ${col}44`,fontFamily:MONO,
      fontSize:9,color:col,letterSpacing:"0.12em",marginRight:6,marginBottom:4}}>
      {children}
    </span>
  );
}

function SectionHead({n,title,col}:{n:string;title:string;col:string}){
  return(
    <div style={{display:"flex",alignItems:"baseline",gap:14,marginBottom:24}}>
      <span style={{fontFamily:MONO,fontSize:9,color:col,letterSpacing:"0.2em"}}>{n}</span>
      <h2 style={{margin:0,fontFamily:DISP,fontSize:"1.1rem",fontWeight:400,
        color:col,letterSpacing:"0.14em"}}>{title}</h2>
      <div style={{flex:1,height:1,background:`linear-gradient(90deg,${col}55,transparent)`}}/>
    </div>
  );
}

// ── Network Canvas ───────────────────────────────────────────────────────────
function EpiNetworkCanvas(){
  const ref=useRef<HTMLCanvasElement>(null);
  const nodesRef=useRef<NetNode[]>([]);
  const edgesRef=useRef<NetEdge[]>([]);
  const rafRef=useRef<number>(0);

  useEffect(()=>{
    const W=800,H=440;
    const N=42;
    const rng=(s:number)=>{let v=s;return()=>{v=(v*16807)%2147483647;return(v-1)/2147483646;};};
    const rand=rng(42);

    const nodes:NetNode[]=[];
    for(let i=0;i<N;i++){
      nodes.push({
        id:i,
        x:80+rand()*(W-160),
        y:60+rand()*(H-120),
        vx:(rand()-0.5)*0.5,
        vy:(rand()-0.5)*0.5,
        type:Math.floor(rand()*6),
        r:5+rand()*7,
      });
    }

    const edges:NetEdge[]=[];
    for(let i=0;i<N;i++){
      const nConn=2+Math.floor(rand()*4);
      for(let k=0;k<nConn;k++){
        const j=Math.floor(rand()*N);
        if(j!==i) edges.push({a:i,b:j,w:rand()});
      }
    }

    nodesRef.current=nodes;
    edgesRef.current=edges;
  },[]);

  useEffect(()=>{
    const canvas=ref.current;
    if(!canvas) return;
    const ctx=canvas.getContext("2d");
    if(!ctx) return;
    const W=canvas.width,H=canvas.height;

    function tick(){
      const nodes=nodesRef.current;
      const edges=edgesRef.current;
      if(!nodes.length){rafRef.current=requestAnimationFrame(tick);return;}

      // Force simulation
      const K_spring=0.004,REST=80,K_rep=800,DAMP=0.88;
      const fx=new Float32Array(nodes.length);
      const fy=new Float32Array(nodes.length);

      // Repulsion
      for(let i=0;i<nodes.length;i++){
        for(let j=i+1;j<nodes.length;j++){
          const dx=nodes[j].x-nodes[i].x;
          const dy=nodes[j].y-nodes[i].y;
          const d2=dx*dx+dy*dy;
          if(!isFinite(d2)||d2<1) continue;
          const d=Math.sqrt(d2);
          const f=K_rep/d2;
          fx[i]-=f*dx/d; fy[i]-=f*dy/d;
          fx[j]+=f*dx/d; fy[j]+=f*dy/d;
        }
      }
      // Spring
      for(const e of edges){
        const dx=nodes[e.b].x-nodes[e.a].x;
        const dy=nodes[e.b].y-nodes[e.a].y;
        const d=Math.sqrt(dx*dx+dy*dy);
        if(!isFinite(d)||d<1) continue;
        const f=K_spring*(d-REST);
        fx[e.a]+=f*dx/d; fy[e.a]+=f*dy/d;
        fx[e.b]-=f*dx/d; fy[e.b]-=f*dy/d;
      }
      // Centering
      for(let i=0;i<nodes.length;i++){
        fx[i]+=(W/2-nodes[i].x)*0.0006;
        fy[i]+=(H/2-nodes[i].y)*0.0006;
      }
      // Integrate
      for(let i=0;i<nodes.length;i++){
        nodes[i].vx=(nodes[i].vx+fx[i])*DAMP;
        nodes[i].vy=(nodes[i].vy+fy[i])*DAMP;
        nodes[i].x+=nodes[i].vx;
        nodes[i].y+=nodes[i].vy;
        nodes[i].x=Math.max(nodes[i].r,Math.min(W-nodes[i].r,nodes[i].x));
        nodes[i].y=Math.max(nodes[i].r,Math.min(H-nodes[i].r,nodes[i].y));
      }

      // Render
      ctx.fillStyle="#010309";
      ctx.fillRect(0,0,W,H);

      // Edges
      for(const e of edgesRef.current){
        const na=nodes[e.a],nb=nodes[e.b];
        const grad=ctx.createLinearGradient(na.x,na.y,nb.x,nb.y);
        const ca=MARK_TYPES[na.type].col;
        const cb=MARK_TYPES[nb.type].col;
        grad.addColorStop(0,ca+"55");
        grad.addColorStop(1,cb+"55");
        ctx.beginPath();
        ctx.moveTo(na.x,na.y);
        ctx.lineTo(nb.x,nb.y);
        ctx.strokeStyle=grad;
        ctx.lineWidth=0.8+e.w*1.2;
        ctx.stroke();
      }

      // Nodes
      for(const n of nodes){
        const col=MARK_TYPES[n.type].col;
        // Glow
        if(isFinite(n.x)&&isFinite(n.y)){
          const g=ctx.createRadialGradient(n.x,n.y,0,n.x,n.y,n.r*2.4);
          g.addColorStop(0,col+"55");
          g.addColorStop(1,"transparent");
          ctx.beginPath();
          ctx.arc(n.x,n.y,n.r*2.4,0,Math.PI*2);
          ctx.fillStyle=g;
          ctx.fill();
        }
        // Node
        ctx.beginPath();
        ctx.arc(n.x,n.y,n.r,0,Math.PI*2);
        ctx.fillStyle=col+"CC";
        ctx.fill();
        ctx.strokeStyle=col;
        ctx.lineWidth=1.2;
        ctx.stroke();
      }

      rafRef.current=requestAnimationFrame(tick);
    }
    rafRef.current=requestAnimationFrame(tick);
    return()=>cancelAnimationFrame(rafRef.current);
  },[]);

  return(
    <canvas ref={ref} width={800} height={440}
      style={{width:"100%",borderRadius:8,
        border:"1px solid rgba(0,255,178,0.14)",display:"block"}}/>
  );
}

// ── Heatmap Canvas ───────────────────────────────────────────────────────────
const HM_ROWS=32, HM_COLS=6;

function HeatmapCanvas(){
  const ref=useRef<HTMLCanvasElement>(null);
  const matRef=useRef<number[][]>([]);
  const rafRef=useRef<number>(0);
  const tRef=useRef(0);

  useEffect(()=>{
    const rng=(s:number)=>{let v=s;return()=>{v=(v*16807)%2147483647;return(v-1)/2147483646;};};
    const rand=rng(99);
    const m:number[][]=[];
    for(let r=0;r<HM_ROWS;r++){
      m.push([]);
      for(let c=0;c<HM_COLS;c++) m[r].push(rand());
    }
    matRef.current=m;
  },[]);

  useEffect(()=>{
    const canvas=ref.current;
    if(!canvas) return;
    const ctx=canvas.getContext("2d");
    if(!ctx) return;
    const W=canvas.width,H=canvas.height;
    const cw=W/HM_COLS,ch=H/HM_ROWS;

    function heatColor(v:number):[number,number,number]{
      if(v<0.33) return [0,Math.round(v*3*136),Math.round(v*3*255+119)];
      if(v<0.66){const t=(v-0.33)/0.33;return [Math.round(t*255),Math.round(255-t*100),Math.round(119-t*119)];}
      const t=(v-0.66)/0.34;return [255,Math.round(155-t*155),0];
    }

    function tick(){
      tRef.current+=0.008;
      const m=matRef.current;
      if(!m.length){rafRef.current=requestAnimationFrame(tick);return;}

      // Slow drift
      for(let r=0;r<HM_ROWS;r++){
        for(let c=0;c<HM_COLS;c++){
          m[r][c]+=Math.sin(tRef.current+r*0.3+c*0.7)*0.003;
          m[r][c]=Math.max(0,Math.min(1,m[r][c]));
        }
      }

      ctx.fillStyle="#010309";
      ctx.fillRect(0,0,W,H);

      for(let r=0;r<HM_ROWS;r++){
        for(let c=0;c<HM_COLS;c++){
          const [rr,gg,bb]=heatColor(m[r][c]);
          ctx.fillStyle=`rgb(${rr},${gg},${bb})`;
          ctx.fillRect(c*cw+1,r*ch+1,cw-2,ch-2);
        }
      }

      // Column labels
      ctx.fillStyle="rgba(184,204,232,0.6)";
      ctx.font=`9px ${MONO}`;
      ctx.textAlign="center";
      for(let c=0;c<HM_COLS;c++){
        const abbr=["Me","Ac","P","Cr","nc","Hi"][c]||"";
        ctx.fillText(abbr,c*cw+cw/2,H-4);
      }

      rafRef.current=requestAnimationFrame(tick);
    }
    rafRef.current=requestAnimationFrame(tick);
    return()=>cancelAnimationFrame(rafRef.current);
  },[]);

  return(
    <canvas ref={ref} width={320} height={400}
      style={{height:400,borderRadius:6,border:"1px solid rgba(0,255,178,0.12)",display:"block"}}/>
  );
}

// ── Main Page ────────────────────────────────────────────────────────────────
export default function SubstrateQuantizationEngine(){
  const [activeStep,setActiveStep]=useState(0);
  const [hoveredLayer,setHoveredLayer]=useState<string|null>(null);

  useEffect(()=>{
    const id=setInterval(()=>setActiveStep(s=>(s+1)%6),2200);
    return()=>clearInterval(id);
  },[]);

  return(
    <div style={{minHeight:"100vh",background:V.bg,padding:"48px 24px 100px",
      maxWidth:900,margin:"0 auto"}}>

      {/* ── Header ── */}
      <div style={{marginBottom:44}}>
        <div style={{fontFamily:MONO,fontSize:8,color:V.aurora+"88",
          letterSpacing:"0.25em",marginBottom:10}}>
          AETHER SUBSTRATE RESEARCH -- VISUAL ENGINE
        </div>
        <h1 style={{margin:"0 0 10px",fontFamily:DISP,
          fontSize:"clamp(1.4rem,4vw,2.2rem)",fontWeight:400,
          color:V.aurora,letterSpacing:"0.15em",lineHeight:1.2}}>
          SUBSTRATE QUANTIZATION ENGINE
        </h1>
        <div style={{fontFamily:SERIF,fontSize:"1.05rem",color:V.gold,
          letterSpacing:"0.05em",marginBottom:18}}>
          Epigenetic Distribution Network Spectrum · CUCA Photonic Stack · Cephalopod Edge Constraint
        </div>
        <div style={{display:"flex",flexWrap:"wrap" as const,gap:5,marginBottom:20}}>
          <Chip col={V.aurora}>Substrate Quantization</Chip>
          <Chip col={V.blue}>Epigenetic Network</Chip>
          <Chip col={V.gold}>CUCA Bio Engine</Chip>
          <Chip col={V.vio}>Photonic Layer Stack</Chip>
          <Chip col={V.plasma}>Cephalopod Edge Constraint</Chip>
        </div>
        <div style={{height:1,background:`linear-gradient(90deg,${V.aurora}44,transparent)`}}/>
      </div>

      {/* ── Source infographic ── */}
      <div style={{marginBottom:48}}>
        <SectionHead n="REF" title="SOURCE FRAMEWORK" col={V.dim}/>
        <img src={infographic} alt="Quantizing Slime Substrate Materials infographic"
          style={{width:"100%",borderRadius:8,border:"1px solid rgba(184,204,232,0.12)",
            display:"block",opacity:0.92}}/>
        <div style={{fontFamily:MONO,fontSize:8,color:V.dim,marginTop:8,textAlign:"center" as const}}>
          Quantizing Slime Substrate Materials for the Epigenetic Distribution Network Spectrum
          -- From substrate complexity to molecular signals to epigenetic states to network spectrum
        </div>
      </div>

      {/* ── Pipeline ── */}
      <div style={{marginBottom:52}}>
        <SectionHead n="I" title="QUANTIZATION PIPELINE" col={V.aurora}/>
        <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:10}}>
          {PIPELINE.map((s,i)=>{
            const active=activeStep===i;
            return(
              <div key={s.n}
                onClick={()=>setActiveStep(i)}
                style={{padding:"16px 14px",borderRadius:6,cursor:"pointer",
                  transition:"all 0.3s",
                  background:active?`${s.col}14`:"rgba(4,6,18,0.5)",
                  border:`1px solid ${active?s.col:s.col+"33"}`,
                  boxShadow:active?`0 0 18px ${s.col}22`:"none",
                  transform:active?"translateY(-2px)":"none"}}>
                <div style={{fontFamily:MONO,fontSize:"1.1rem",color:s.col,
                  letterSpacing:"0.1em",marginBottom:6}}>{s.n}</div>
                <div style={{fontFamily:MONO,fontSize:8,color:s.col,
                  letterSpacing:"0.14em",marginBottom:6}}>{s.label}</div>
                <div style={{fontFamily:SERIF,fontSize:"0.88rem",
                  color:"rgba(184,204,232,0.65)",lineHeight:1.45}}>{s.desc}</div>
              </div>
            );
          })}
        </div>
        <div style={{marginTop:14,display:"flex",alignItems:"center",gap:0}}>
          {PIPELINE.map((s,i)=>(
            <div key={i} style={{flex:1,display:"flex",alignItems:"center"}}>
              <div style={{width:10,height:10,borderRadius:"50%",flexShrink:0,
                background:activeStep===i?s.col:s.col+"44",
                boxShadow:activeStep===i?`0 0 8px ${s.col}`:"none",
                transition:"all 0.3s"}}/>
              {i<5&&<div style={{flex:1,height:1,
                background:`linear-gradient(90deg,${s.col}88,${PIPELINE[i+1].col}44)`}}/>}
            </div>
          ))}
        </div>
      </div>

      {/* ── Substrate materials ── */}
      <div style={{marginBottom:52}}>
        <SectionHead n="II" title="SLIME SUBSTRATE MATERIALS" col={V.green}/>
        <div style={{display:"grid",gridTemplateColumns:"repeat(5,1fr)",gap:8}}>
          {SUBSTRATES.map(s=>(
            <div key={s.name} style={{padding:"14px 12px",borderRadius:6,
              background:`${s.col}0A`,border:`1px solid ${s.col}33`}}>
              <div style={{width:24,height:24,borderRadius:"50%",
                background:s.col+"44",border:`2px solid ${s.col}`,
                marginBottom:10,boxShadow:`0 0 10px ${s.col}44`}}/>
              <div style={{fontFamily:MONO,fontSize:8,color:s.col,
                letterSpacing:"0.12em",marginBottom:3}}>{s.name}</div>
              <div style={{fontFamily:SERIF,fontSize:"0.78rem",color:V.dim,
                marginBottom:10,lineHeight:1.4}}>{s.sub}</div>
              <div style={{display:"flex",flexDirection:"column" as const,gap:3}}>
                {s.props.map(p=>(
                  <div key={p} style={{fontFamily:MONO,fontSize:7,
                    color:"rgba(184,204,232,0.55)",
                    paddingLeft:8,borderLeft:`2px solid ${s.col}44`}}>{p}</div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Parameter quantization ── */}
      <div style={{marginBottom:52}}>
        <SectionHead n="III" title="PARAMETER QUANTIZATION (Q-STATE SPACE)" col={V.blue}/>
        <div style={{padding:"20px 24px",background:"rgba(4,6,18,0.6)",
          border:"1px solid rgba(68,136,255,0.18)",borderRadius:8}}>
          <div style={{display:"grid",gridTemplateColumns:"160px 1fr",gap:"10px 20px",
            alignItems:"center"}}>
            {PARAMS.map((p,pi)=>{
              const cols=[V.green,V.blue,V.amb,V.gold,V.rose,V.aurora,V.vio];
              const col=cols[pi%cols.length];
              const N=8;
              return[
                <div key={`l${pi}`} style={{fontFamily:MONO,fontSize:8,
                  color:"rgba(184,204,232,0.7)",letterSpacing:"0.08em"}}>{p}</div>,
                <div key={`d${pi}`} style={{display:"flex",alignItems:"center",gap:4}}>
                  {Array.from({length:N},(_, i)=>(
                    <div key={i} style={{display:"flex",flexDirection:"column" as const,
                      alignItems:"center",gap:2}}>
                      <div style={{width:i===0?10:i===N-1?10:8,
                        height:i===0?10:i===N-1?10:8,borderRadius:"50%",
                        background:i===0?col+"33":i===N-1?col:`${col}${Math.round(30+i*25).toString(16).padStart(2,"0")}`,
                        border:`1.5px solid ${col}${i===0?"44":i===N-1?"FF":"88"}`,
                        boxShadow:i===N-1?`0 0 6px ${col}`:"none"}}/>
                      <span style={{fontFamily:MONO,fontSize:7,color:col+"88"}}>
                        {i===0?"0":i===N-1?"N":i}
                      </span>
                    </div>
                  ))}
                  <span style={{fontFamily:MONO,fontSize:7,color:V.dim,marginLeft:8}}>
                    Q levels
                  </span>
                </div>,
              ];
            })}
          </div>
          <div style={{marginTop:16,paddingTop:14,
            borderTop:"1px solid rgba(68,136,255,0.12)",
            display:"flex",gap:32,flexWrap:"wrap" as const}}>
            <div>
              <span style={{fontFamily:MONO,fontSize:8,color:V.dim}}>Resolution: </span>
              <span style={{fontFamily:MONO,fontSize:8,color:V.blue}}>Q (levels per parameter: N)</span>
            </div>
            <div>
              <span style={{fontFamily:MONO,fontSize:8,color:V.dim}}>Total states: </span>
              <span style={{fontFamily:MONO,fontSize:8,color:V.aurora}}
                dangerouslySetInnerHTML={{__html:kx("N^P \\;(P = \\text{parameters})")}}/>
            </div>
          </div>
        </div>
      </div>

      {/* ── Epigenetic network + heatmap ── */}
      <div style={{marginBottom:52}}>
        <SectionHead n="IV" title="EPIGENETIC DISTRIBUTION NETWORK" col={V.vio}/>
        <div style={{display:"grid",gridTemplateColumns:"1fr auto",gap:20,alignItems:"start"}}>
          <div>
            <EpiNetworkCanvas/>
            <div style={{display:"flex",flexWrap:"wrap" as const,gap:10,marginTop:12}}>
              {MARK_TYPES.map(m=>(
                <div key={m.label} style={{display:"flex",alignItems:"center",gap:6}}>
                  <div style={{width:9,height:9,borderRadius:"50%",background:m.col,
                    boxShadow:`0 0 6px ${m.col}`}}/>
                  <span style={{fontFamily:MONO,fontSize:8,color:m.col+"AA"}}>{m.label}</span>
                </div>
              ))}
            </div>
            <div style={{marginTop:10,display:"flex",gap:20}}>
              {[["D","Network Density"],["M","Modularity"],["C","Centrality"],
                ["H","Heterogeneity"],["S","Signal Entropy"]].map(([k,v])=>(
                <div key={k}>
                  <span style={{fontFamily:MONO,fontSize:9,color:V.gold}}>{k}: </span>
                  <span style={{fontFamily:MONO,fontSize:8,color:V.dim}}>{v}</span>
                </div>
              ))}
            </div>
          </div>
          <div>
            <div style={{fontFamily:MONO,fontSize:8,color:V.dim,
              letterSpacing:"0.14em",marginBottom:8}}>
              STATE MATRIX<br/>Samples x Marks
            </div>
            <HeatmapCanvas/>
            <div style={{display:"flex",alignItems:"center",gap:4,marginTop:8,
              justifyContent:"center"}}>
              <div style={{width:60,height:8,borderRadius:3,
                background:"linear-gradient(90deg,#0088FF,#FFFF00,#FF4400)"}}/>
              <span style={{fontFamily:MONO,fontSize:7,color:V.dim}}>Low -- High</span>
            </div>
          </div>
        </div>
      </div>

      {/* ── CUCA Layer Stack ── */}
      <div style={{marginBottom:52}}>
        <SectionHead n="V" title="CUCA PHOTONIC LAYER STACK" col={V.gold}/>
        <div style={{fontFamily:SERIF,fontSize:"1rem",color:"rgba(184,204,232,0.72)",
          lineHeight:1.75,marginBottom:20}}>
          The v3.0 Bio Hardware Engine integrates ten photonic and structural layers,
          ordered by stability. The Lycaenid Gyroid (P3) is the passive floor --
          a 3D photonic bandgap, omni-directional, immune to chessboard overload.
          Everything else tunes on top of it.
        </div>
        <div style={{display:"flex",flexDirection:"column" as const,gap:6}}>
          {CUCA_LAYERS.map(l=>{
            const hov=hoveredLayer===l.id;
            const cAvg=(l.cMin+l.cMax)/2;
            return(
              <div key={l.id}
                onMouseEnter={()=>setHoveredLayer(l.id)}
                onMouseLeave={()=>setHoveredLayer(null)}
                style={{padding:"12px 16px",borderRadius:6,cursor:"default",
                  transition:"all 0.25s",
                  background:hov?`${l.col}10`:`${l.col}06`,
                  border:`1px solid ${hov?l.col:l.col+"33"}`,
                  boxShadow:hov?`0 0 16px ${l.col}18`:"none"}}>
                <div style={{display:"grid",
                  gridTemplateColumns:"44px 1fr 110px 80px",gap:12,alignItems:"center"}}>
                  <div style={{fontFamily:MONO,fontSize:"0.95rem",color:l.col,
                    fontWeight:600}}>{l.id}</div>
                  <div>
                    <div style={{fontFamily:MONO,fontSize:9,color:l.col,
                      letterSpacing:"0.1em"}}>{l.name}</div>
                    <div style={{fontFamily:SERIF,fontSize:"0.82rem",
                      color:V.dim,marginTop:2}}>{l.org} -- {l.dim}</div>
                    {hov&&<div style={{fontFamily:SERIF,fontSize:"0.82rem",
                      color:"rgba(184,204,232,0.6)",marginTop:4,lineHeight:1.4}}>
                      {l.note}
                    </div>}
                  </div>
                  <div>
                    <div style={{fontFamily:MONO,fontSize:7,color:V.dim,marginBottom:3}}>
                      C(x,t) UNDER OVERLOAD
                    </div>
                    <div style={{height:8,background:"rgba(4,6,18,0.8)",borderRadius:4,overflow:"hidden"}}>
                      <div style={{height:"100%",borderRadius:4,
                        transition:"width 0.5s",
                        width:`${cAvg*100}%`,
                        background:`linear-gradient(90deg,${l.col}88,${l.col})`}}/>
                    </div>
                    <div style={{fontFamily:MONO,fontSize:8,color:l.col,marginTop:2}}>
                      {l.cMin===l.cMax
                        ? l.cMin===0?"C -- 0":"C = 1"
                        : `C ${l.cMin.toFixed(2)}-${l.cMax.toFixed(2)}`}
                    </div>
                  </div>
                  <div style={{fontFamily:MONO,fontSize:7,color:V.dim,
                    textAlign:"right" as const,lineHeight:1.6}}>
                    <div>{l.stability}</div>
                    <div style={{color:l.col+"99"}}>{l.ts}</div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ── Cephalopod Edge Constraint ── */}
      <div style={{marginBottom:52}}>
        <SectionHead n="VI" title="CEPHALOPOD EDGE CONSTRAINT" col={V.plasma}/>
        <div style={{padding:"28px 32px",background:"rgba(255,68,119,0.05)",
          border:"1px solid rgba(255,68,119,0.2)",borderRadius:8,marginBottom:24}}>
          <div style={{fontFamily:MONO,fontSize:8,color:V.plasma,
            letterSpacing:"0.2em",marginBottom:16}}>CANONICAL FORM -- AETHER NAMED LAW</div>
          <blockquote style={{fontFamily:SERIF,fontSize:"1.1rem",
            color:"rgba(184,204,232,0.9)",lineHeight:1.8,
            borderLeft:`3px solid ${V.plasma}`,paddingLeft:20,margin:"0 0 20px"}}>
            "Any coupled analog system fails when required to represent
            high-frequency binary structure across all axes simultaneously."
          </blockquote>
          <div style={{textAlign:"center" as const,padding:"16px 0"}}>
            <div dangerouslySetInnerHTML={{__html:kx(
              "\\|E(t)\\| \\uparrow \\;\\Rightarrow\\; \\text{coupling conflict} \\;\\Rightarrow\\; C(x,t) \\downarrow \\;\\Rightarrow\\; \\text{emergent instability}",
              true)}} style={{color:V.plasma}}/>
          </div>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12,marginTop:8}}>
            {[
              {sym:"E(t)",desc:"Environmental complexity / contrast load",col:V.plasma},
              {sym:"C(x,t)",desc:"Coherence of surface expression",col:V.aurora},
              {sym:"B_{\\text{total}} < B_{\\text{demand}}",desc:"System underpowered -- bandwidth constraint",col:V.gold},
              {sym:"\\nabla C",desc:"Coherence gradient -- spatial instability signal",col:V.blue},
            ].map(({sym,desc,col})=>(
              <div key={sym} style={{padding:"10px 14px",
                background:"rgba(4,6,18,0.6)",border:`1px solid ${col}22`,borderRadius:6}}>
                <span dangerouslySetInnerHTML={{__html:kx(sym)}}
                  style={{color:col,marginRight:10}}/>
                <span style={{fontFamily:MONO,fontSize:8,color:V.dim}}>{desc}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Four chessboard demands */}
        <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:8,marginBottom:24}}>
          {[
            {n:"D1",label:"Binary Contrast",desc:"Black/white -- no gradient. Step function, not sigmoid.",col:V.plasma},
            {n:"D2",label:"Sharp Edges",desc:"Infinite spatial frequency at every boundary.",col:V.rose},
            {n:"D3",label:"Uniform Repetition",desc:"Global consistency required across entire surface.",col:V.amb},
            {n:"D4",label:"Flat Topology",desc:"Zero texture cues -- papillae fully suppressed.",col:V.gold},
          ].map(d=>(
            <div key={d.n} style={{padding:"14px 12px",borderRadius:6,
              background:`${d.col}08`,border:`1px solid ${d.col}33`}}>
              <div style={{fontFamily:MONO,fontSize:"0.9rem",color:d.col,
                marginBottom:6}}>{d.n}</div>
              <div style={{fontFamily:MONO,fontSize:8,color:d.col,
                letterSpacing:"0.1em",marginBottom:6}}>{d.label}</div>
              <div style={{fontFamily:SERIF,fontSize:"0.82rem",
                color:"rgba(184,204,232,0.6)",lineHeight:1.45}}>{d.desc}</div>
            </div>
          ))}
        </div>

        {/* Domain table */}
        <div style={{fontFamily:MONO,fontSize:8,color:V.plasma,
          letterSpacing:"0.18em",marginBottom:12}}>GENERALIZATION ACROSS DOMAINS</div>
        <div style={{border:"1px solid rgba(255,68,119,0.2)",borderRadius:6,overflow:"hidden"}}>
          {CONSTRAINT_DOMAINS.map((d,i)=>(
            <div key={d.domain} style={{
              display:"grid",gridTemplateColumns:"140px 1fr 1fr",
              gap:16,padding:"12px 16px",
              background:i%2===0?"rgba(4,6,18,0.4)":"rgba(4,6,18,0.2)",
              borderBottom:i<CONSTRAINT_DOMAINS.length-1?"1px solid rgba(255,68,119,0.1)":"none"}}>
              <div style={{fontFamily:MONO,fontSize:8,color:V.plasma,
                letterSpacing:"0.1em",lineHeight:1.5}}>{d.domain}</div>
              <div style={{fontFamily:SERIF,fontSize:"0.82rem",
                color:"rgba(184,204,232,0.65)",lineHeight:1.4}}>{d.sys}</div>
              <div style={{fontFamily:SERIF,fontSize:"0.82rem",
                color:`${V.rose}CC`,lineHeight:1.4}}>{d.fail}</div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Biological coherence measurement ── */}
      <div style={{marginBottom:40}}>
        <SectionHead n="VII" title="MEASURING C(t) FROM A BIOLOGICAL SAMPLE" col={V.green}/>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:16,marginBottom:20}}>
          {[
            {label:"Gene Expression",method:"RNA sequencing",col:V.aurora,var:"X_gene(t)"},
            {label:"Epigenetic Marks",method:"DNA methylation / histone modifications",col:V.vio,var:"X_epi(t)"},
            {label:"Metabolomics",method:"Metabolite concentrations",col:V.green,var:"X_metab(t)"},
            {label:"Mechanical Properties",method:"Stiffness, elasticity (tissue rheology)",col:V.gold,var:"X_mech(t)"},
          ].map(m=>(
            <div key={m.label} style={{padding:"14px 16px",borderRadius:6,
              background:`${m.col}08`,border:`1px solid ${m.col}28`}}>
              <div style={{fontFamily:MONO,fontSize:8,color:m.col,
                letterSpacing:"0.12em",marginBottom:4}}>{m.label}</div>
              <div style={{fontFamily:SERIF,fontSize:"0.85rem",
                color:"rgba(184,204,232,0.65)",marginBottom:8}}>{m.method}</div>
              <div dangerouslySetInnerHTML={{__html:kx(m.var)}}
                style={{color:m.col,fontSize:"0.9rem"}}/>
            </div>
          ))}
        </div>
        <div style={{textAlign:"center" as const,padding:"20px",
          background:"rgba(0,255,178,0.04)",border:"1px solid rgba(0,255,178,0.14)",
          borderRadius:8}}>
          <div style={{fontFamily:MONO,fontSize:8,color:V.dim,marginBottom:12}}>
            COHERENCE FROM BIOLOGICAL STATE VECTOR
          </div>
          <div dangerouslySetInnerHTML={{__html:kx(
            "\\frac{\\partial C}{\\partial t} = F\\!\\left(\\frac{\\partial C}{\\partial x},\\;\\mathbf{B}\\right)",
            true)}} style={{color:V.aurora,marginBottom:12}}/>
          <div style={{fontFamily:SERIF,fontSize:"0.9rem",
            color:"rgba(184,204,232,0.65)",lineHeight:1.6}}>
            where B is the measured biological state vector from the sample --
            the temporal and spatial derivatives are the two fundamental classes of information flow.
          </div>
        </div>
      </div>

      {/* Footer */}
      <div style={{borderTop:`1px solid ${V.dim}44`,paddingTop:24,
        display:"flex",justifyContent:"space-between",flexWrap:"wrap" as const,gap:12}}>
        <div style={{fontFamily:MONO,fontSize:8,color:V.dim}}>
          AETHER KNOWLEDGE SYSTEM -- SUBSTRATE QUANTIZATION ENGINE
        </div>
        <div style={{fontFamily:MONO,fontSize:8,color:V.dim,textAlign:"right" as const}}>
          <div>CUCA Bio Engine v3.0 -- Photonic Stack P0-P9</div>
          <div>Cephalopod Edge Constraint -- AETHER Named Law</div>
        </div>
      </div>
    </div>
  );
}
