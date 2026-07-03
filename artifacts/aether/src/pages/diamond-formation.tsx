import { useState, useEffect } from "react";
import { Link } from "wouter";
import { Play, Pause, RotateCcw } from "lucide-react";

const BG="#04060d",PAN="#0a0d1a",PAN2="#0d1020",BORDER="#182038",TEXT="#b8cce8",MUTED="#5a6e8c";
const GOLD="#ffb830",CYAN="#3fd8d0",VIOLET="#a87aff",GREEN="#50d49a",BLUE="#4ab0ff";

function hexA(h:string,a:number){const n=h.replace("#","");return `rgba(${parseInt(n.slice(0,2),16)},${parseInt(n.slice(2,4),16)},${parseInt(n.slice(4,6),16)},${a})`;}

type Atom={x:number;y:number;opacity:number;size:number};
type Bond={x1:number;y1:number;x2:number;y2:number;opacity:number};

const STAGES=[
  {name:"Scattered Carbon",pressure:"1 atm",temp:"25 °C"},
  {name:"Extreme Compression",pressure:"50,000 atm",temp:"1,000 °C"},
  {name:"Lattice Formation",pressure:"55,000 atm",temp:"1,200 °C"},
  {name:"Diamond Crystal",pressure:"60,000 atm",temp:"1,300 °C"},
];

const PROCESS=[
  {t:"1. Scattered Carbon",d:"Carbon atoms float freely in a disordered, high-entropy arrangement — amorphous graphite or soot."},
  {t:"2. Compression",d:"Extreme pressure forces atoms together, collapsing the free space between them toward a common center."},
  {t:"3. Lattice Formation",d:"Tetrahedral sp³ bonds begin to form the 3D crystal scaffold — order crystallizing out of chaos."},
  {t:"4. Diamond Crystal",d:"The perfect diamond lattice is complete — every carbon bonded to four neighbors in a rigid coherent network."},
];

function DiamondFormation(){
  const [stage,setStage]=useState(0);
  const [isPlaying,setIsPlaying]=useState(false);
  const [rotation,setRotation]=useState(0);

  useEffect(()=>{
    let interval:ReturnType<typeof setInterval>|undefined;
    if(isPlaying&&stage<3){
      interval=setInterval(()=>setStage(s=>s+1),2000);
    } else if(stage>=3){
      setIsPlaying(false);
    }
    return ()=>{ if(interval) clearInterval(interval); };
  },[isPlaying,stage]);

  useEffect(()=>{
    const r=setInterval(()=>setRotation(v=>(v+1)%360),50);
    return ()=>clearInterval(r);
  },[]);

  const generateAtoms=():Atom[]=>{
    const atoms:Atom[]=[];
    if(stage===0){
      for(let i=0;i<20;i++){
        const seed=(i*97+13)%997;
        const x=(seed%280)+10;
        const y=((seed*7)%280)+10;
        atoms.push({x,y,opacity:0.8,size:8});
      }
    } else if(stage===1){
      for(let i=0;i<20;i++){
        const angle=(i/20)*Math.PI*2;
        const distance=80-stage*10;
        atoms.push({x:150+Math.cos(angle)*distance,y:150+Math.sin(angle)*distance,opacity:0.9,size:7});
      }
    } else if(stage===2){
      const spacing=35;
      for(let i=-1;i<=1;i++) for(let j=-1;j<=1;j++){
        if((i+j)%2===0) atoms.push({x:150+i*spacing,y:150+j*spacing,opacity:1,size:6});
      }
    } else {
      const spacing=40;
      for(let i=-1;i<=1;i++) for(let j=-1;j<=1;j++) for(let k=-1;k<=1;k++){
        if((i+j+k)%2===0){
          const rotRad=(rotation*Math.PI)/180;
          const x=i*spacing,y=j*spacing,z=k*spacing;
          const rotX=x*Math.cos(rotRad)-z*Math.sin(rotRad);
          const rotZ=x*Math.sin(rotRad)+z*Math.cos(rotRad);
          atoms.push({x:150+rotX,y:150+y-rotZ*0.5,opacity:1-(rotZ+40)/100,size:6-rotZ/20});
        }
      }
    }
    return atoms;
  };

  const atoms=generateAtoms();

  const getBonds=():Bond[]=>{
    if(stage<2) return [];
    const bonds:Bond[]=[];
    atoms.forEach((a1,i)=>atoms.forEach((a2,j)=>{
      if(i<j){
        const dx=a2.x-a1.x,dy=a2.y-a1.y;
        const dist=Math.sqrt(dx*dx+dy*dy);
        if(dist<50&&dist>10) bonds.push({x1:a1.x,y1:a1.y,x2:a2.x,y2:a2.y,opacity:Math.min(a1.opacity,a2.opacity)});
      }
    }));
    return bonds;
  };

  const bonds=getBonds();
  const core=stage===3?BLUE:VIOLET;

  return(
    <div>
      <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(280px,1fr))",gap:16}}>
        <div style={{gridColumn:"span 1"}}>
          <div style={{position:"relative",background:"#02030a",borderRadius:12,border:`1px solid ${BORDER}`,overflow:"hidden"}}>
            {stage>0&&(
              <div style={{position:"absolute",inset:0,background:`radial-gradient(circle at 50% 50%, ${hexA(VIOLET,0.12+stage*0.05)}, transparent 70%)`}}/>
            )}
            <svg width="100%" height="380" viewBox="0 0 300 300" style={{position:"relative",zIndex:2,display:"block"}}>
              {bonds.map((b,i)=>(
                <line key={`b-${i}`} x1={b.x1} y1={b.y1} x2={b.x2} y2={b.y2} stroke={hexA(VIOLET,b.opacity*0.6)} strokeWidth={2}/>
              ))}
              {atoms.map((a,i)=>(
                <g key={`a-${i}`}>
                  <circle cx={a.x} cy={a.y} r={a.size+4} fill={hexA(core,a.opacity*0.3)}/>
                  <circle cx={a.x} cy={a.y} r={a.size} fill={core} opacity={a.opacity}/>
                  <circle cx={a.x-a.size*0.3} cy={a.y-a.size*0.3} r={a.size*0.3} fill="#fff" opacity={a.opacity*0.8}/>
                </g>
              ))}
              {stage>0&&stage<3&&(
                <g>
                  <circle cx={150} cy={150} r={30-stage*5} fill="none" stroke={hexA(VIOLET,0.5)} strokeWidth={2}/>
                  <circle cx={150} cy={150} r={50-stage*8} fill="none" stroke={hexA(VIOLET,0.3)} strokeWidth={1}/>
                </g>
              )}
              {stage===3&&(
                <g>
                  <line x1={150} y1={100} x2={150} y2={80} stroke="#fff" strokeWidth={2} opacity={0.85}/>
                  <line x1={170} y1={120} x2={185} y2={110} stroke="#fff" strokeWidth={2} opacity={0.7}/>
                  <line x1={130} y1={120} x2={115} y2={110} stroke="#fff" strokeWidth={2} opacity={0.7}/>
                </g>
              )}
            </svg>
          </div>
          <div style={{display:"flex",justifyContent:"center",gap:12,marginTop:12}}>
            <button onClick={()=>setIsPlaying(!isPlaying)} disabled={stage>=3}
              style={{display:"flex",alignItems:"center",gap:8,padding:"9px 18px",background:stage>=3?PAN2:hexA(VIOLET,0.18),color:stage>=3?MUTED:VIOLET,border:`1px solid ${stage>=3?BORDER:hexA(VIOLET,0.4)}`,borderRadius:8,cursor:stage>=3?"default":"pointer",fontFamily:"monospace",fontSize:12}}>
              {isPlaying?<Pause size={16}/>:<Play size={16}/>}
              {isPlaying?"Pause":stage>=3?"Complete":"Play"}
            </button>
            <button onClick={()=>{setStage(0);setIsPlaying(false);}}
              style={{display:"flex",alignItems:"center",gap:8,padding:"9px 18px",background:PAN2,color:TEXT,border:`1px solid ${BORDER}`,borderRadius:8,cursor:"pointer",fontFamily:"monospace",fontSize:12}}>
              <RotateCcw size={16}/> Reset
            </button>
          </div>
        </div>

        <div style={{display:"flex",flexDirection:"column",gap:14}}>
          <div style={{background:PAN2,border:`1px solid ${BORDER}`,borderRadius:12,padding:16}}>
            <div style={{fontFamily:"monospace",fontSize:11,color:CYAN,textTransform:"uppercase",letterSpacing:1,marginBottom:10}}>Current Stage</div>
            <div style={{marginBottom:8}}>
              <span style={{fontSize:28,fontWeight:700,color:TEXT}}>{stage+1}</span>
              <span style={{fontSize:15,color:MUTED}}> / 4</span>
            </div>
            <div style={{fontSize:16,fontWeight:600,color:VIOLET,marginBottom:10}}>{STAGES[stage].name}</div>
            <div style={{display:"flex",justifyContent:"space-between",fontFamily:"monospace",fontSize:12,color:MUTED,marginBottom:4}}>
              <span>Pressure</span><span style={{color:TEXT}}>{STAGES[stage].pressure}</span>
            </div>
            <div style={{display:"flex",justifyContent:"space-between",fontFamily:"monospace",fontSize:12,color:MUTED}}>
              <span>Temperature</span><span style={{color:TEXT}}>{STAGES[stage].temp}</span>
            </div>
          </div>
          <div style={{background:PAN2,border:`1px solid ${BORDER}`,borderRadius:12,padding:16}}>
            <div style={{fontFamily:"monospace",fontSize:11,color:GOLD,textTransform:"uppercase",letterSpacing:1,marginBottom:12}}>The Process</div>
            {PROCESS.map((p,i)=>(
              <div key={p.t} style={{padding:"8px 10px",borderRadius:8,marginBottom:8,background:stage>=i?hexA(i===3?BLUE:VIOLET,0.12):PAN,border:`1px solid ${stage>=i?hexA(i===3?BLUE:VIOLET,0.3):BORDER}`}}>
                <div style={{fontSize:12.5,fontWeight:600,color:stage>=i?TEXT:MUTED,marginBottom:2}}>{p.t}</div>
                <div style={{fontSize:11.5,color:MUTED,lineHeight:1.5}}>{p.d}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

const FACTS=[
  {title:"Tetrahedral Bonding",col:CYAN,txt:"Each carbon atom bonds to four others in a perfect 109.5° tetrahedral geometry — the sp³ hybrid orbital signature that makes diamond isotropic and transparent."},
  {title:"Crystal Strength",col:GOLD,txt:"The continuous 3D covalent network has no cleavage-prone layers, creating the hardest known natural material (Mohs 10) with the highest thermal conductivity of any bulk solid."},
  {title:"Formation Time",col:GREEN,txt:"In nature, diamonds form over millions to billions of years at 140–190 km depth. HPHT and CVD labs compress the same phase transition into hours to weeks."},
];

const AETHER_NOTES=[
  {title:"Order from Compression",col:VIOLET,txt:"Diamond formation is a physical instance of the AETHER coherence field C(x,t) → 1: scattered, high-entropy carbon (‖ε‖ large) is driven toward its crystalline attractor (‖ε‖ → 0) by sustained pressure. The lattice is the fixed point the system converges to under constraint."},
  {title:"Petrification Inverted",col:BLUE,txt:"Where the Petrification Transformation describes rigidity as a failure mode (fluid → brittle), diamond is petrification as coherence: the same atom-by-atom locking yields a lattice that is not fragile but maximally stable — order that transmits force without shattering."},
];

export default function DiamondFormationPage(){
  return(
    <div style={{minHeight:"100vh",background:BG,color:TEXT,padding:"40px 20px 80px",fontFamily:"'Inter',system-ui,sans-serif"}}>
      <div style={{maxWidth:980,margin:"0 auto"}}>
        <div style={{fontFamily:"monospace",fontSize:11,color:MUTED,letterSpacing:2,textTransform:"uppercase",marginBottom:8}}>AETHER · Coherence Visualization</div>
        <h1 style={{fontSize:30,margin:"0 0 6px",fontWeight:700,background:`linear-gradient(90deg,${VIOLET},${CYAN},${BLUE})`,WebkitBackgroundClip:"text",backgroundClip:"text",color:"transparent"}}>
          Carbon → Diamond Transformation
        </h1>
        <p style={{fontFamily:"monospace",fontSize:12,color:MUTED,margin:"0 0 24px"}}>Watch carbon atoms undergo extreme pressure and heat to crystallize into a diamond lattice</p>

        <div style={{background:PAN,border:`1px solid ${BORDER}`,borderRadius:12,padding:18,marginBottom:24}}>
          <div style={{fontFamily:"monospace",fontSize:11,color:CYAN,marginBottom:14,textTransform:"uppercase",letterSpacing:1}}>Live Animation · Four-Stage Crystallization</div>
          <DiamondFormation/>
        </div>

        <div style={{background:PAN,border:`1px solid ${BORDER}`,borderRadius:12,padding:18,marginBottom:24}}>
          <div style={{fontFamily:"monospace",fontSize:11,color:GOLD,marginBottom:14,textTransform:"uppercase",letterSpacing:1}}>Diamond Structure Facts</div>
          <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(240px,1fr))",gap:12}}>
            {FACTS.map(f=>(
              <div key={f.title} style={{background:PAN2,border:`1px solid ${BORDER}`,borderRadius:10,padding:"12px 14px"}}>
                <div style={{fontSize:13,color:f.col,fontWeight:600,marginBottom:6}}>{f.title}</div>
                <p style={{margin:0,fontSize:12,color:MUTED,lineHeight:1.6}}>{f.txt}</p>
              </div>
            ))}
          </div>
        </div>

        <div style={{background:PAN,border:`1px solid ${BORDER}`,borderRadius:12,padding:18,marginBottom:24}}>
          <div style={{fontFamily:"monospace",fontSize:11,color:VIOLET,marginBottom:14,textTransform:"uppercase",letterSpacing:1}}>AETHER Framing</div>
          <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(260px,1fr))",gap:12}}>
            {AETHER_NOTES.map(a=>(
              <div key={a.title} style={{background:PAN2,border:`1px solid ${BORDER}`,borderRadius:10,padding:"12px 14px"}}>
                <div style={{fontSize:13,color:a.col,fontWeight:600,marginBottom:6}}>{a.title}</div>
                <p style={{margin:0,fontSize:12,color:MUTED,lineHeight:1.6}}>{a.txt}</p>
              </div>
            ))}
          </div>
        </div>

        <div style={{display:"flex",flexWrap:"wrap",gap:14,paddingTop:20,borderTop:`1px solid ${BORDER}`,fontFamily:"monospace",fontSize:12}}>
          <Link href="/petrification-transformation" style={{color:VIOLET,textDecoration:"none"}}>→ Petrification Transformation</Link>
          <Link href="/aether-theory-deck" style={{color:CYAN,textDecoration:"none"}}>→ AETHER Theory Deck</Link>
          <Link href="/" style={{color:MUTED,textDecoration:"none"}}>→ Knowledge Graph</Link>
        </div>
      </div>
    </div>
  );
}
