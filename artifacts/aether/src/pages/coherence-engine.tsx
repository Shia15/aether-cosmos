import { useEffect, useRef, useState } from "react";
import { Link } from "wouter";

const BG="#04060d",PAN="#0a0d1a",PAN2="#0d1020",BORDER="#182038",TEXT="#b8cce8",MUTED="#5a6e8c";
const GOLD="#ffb830",CYAN="#3fd8d0",VIOLET="#a87aff",GREEN="#50d49a",BLUE="#4ab0ff",ROSE="#f06090";
function hexA(h:string,a:number){
  const r=parseInt(h.slice(1,3),16),g=parseInt(h.slice(3,5),16),b=parseInt(h.slice(5,7),16);
  return `rgba(${r},${g},${b},${a})`;
}
function mulberry32(s:number){let x=s;return()=>{x|=0;x=x+0x6d2b79f5|0;let t=Math.imul(x^x>>>15,1|x);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296;};}

type Substrate="neural"|"ferrofluid"|"plasma"|"fusion"|"crystal"|"bio";

// ── Master Coherence Field Canvas ─────────────────────────────────────────────────────
function CoherenceFieldCanvas({substrate,onNucleationCount}:{substrate:Substrate;onNucleationCount:(n:number)=>void;}){
  const cvRef=useRef<HTMLCanvasElement>(null);
  const ARef=useRef(0.6);
  const wRef=useRef(1.0);
  const kRef=useRef(0.4);
  const thRef=useRef(0.35);
  const playRef=useRef(true);
  const [A,setA]=useState(0.6);
  const [w,setW]=useState(1.0);
  const [k,setK]=useState(0.4);
  const [th,setTh]=useState(0.35);
  const [playing,setPlaying]=useState(true);
  useEffect(()=>{ARef.current=A;},[A]);
  useEffect(()=>{wRef.current=w;},[w]);
  useEffect(()=>{kRef.current=k;},[k]);
  useEffect(()=>{thRef.current=th;},[th]);
  useEffect(()=>{playRef.current=playing;},[playing]);

  useEffect(()=>{
    const cv=cvRef.current; if(!cv) return;
    const ctx=cv.getContext("2d"); if(!ctx) return;
    let raf=0,t=0,lastW=0;
    const reduced=window.matchMedia&&window.matchMedia("(prefers-reduced-motion:reduce)").matches;
    const GRIDW=72,GRIDH=40;
    let phs:number[][]=Array.from({length:GRIDH},()=>Array(GRIDW).fill(0));

    const loop=()=>{
      const dpr=Math.min(2,window.devicePixelRatio||1);
      const W=cv.clientWidth||900,H=420;
      if(W!==lastW){cv.width=Math.round(W*dpr);cv.height=Math.round(H*dpr);lastW=W;}
      ctx.setTransform(dpr,0,0,dpr,0,0);
      if(playRef.current&&!reduced) t+=0.018;

      ctx.fillStyle=BG; ctx.fillRect(0,0,W,H);

      const Amp=ARef.current,omega=wRef.current,kappa=kRef.current,theta=thRef.current;
      const cellW=W/GRIDW,cellH=H/GRIDH;
      let nCount=0;

      for(let gy=0;gy<GRIDH;gy++){
        for(let gx=0;gx<GRIDW;gx++){
          const fx=gx/GRIDW,fy=gy/GRIDH;
          const phase=phs[gy][gx];
          const r=Math.sqrt((fx-0.5)*(fx-0.5)+(fy-0.5)*(fy-0.5)*0.6);
          const C=Amp*Math.exp(-kappa*r*2.5)*Math.cos(phase-omega*t*2);
          const absC=Math.abs(C);

          let col;
          if(absC>theta){
            const above=(absC-theta)/(1-theta);
            if(substrate==="neural") col=hexA(GOLD,above*0.9);
            else if(substrate==="ferrofluid") col=hexA(CYAN,above*0.85);
            else if(substrate==="plasma") col=hexA(VIOLET,above*0.85);
            else if(substrate==="fusion") col=hexA(GREEN,above*0.85);
            else if(substrate==="crystal") col=hexA(BLUE,above*0.85);
            else col=hexA(ROSE,above*0.85);
            nCount++;
          } else {
            col=hexA(MUTED,0.04+absC*0.08);
          }
          ctx.fillStyle=col;
          ctx.fillRect(gx*cellW,gy*cellH,cellW+0.5,cellH+0.5);
          phs[gy][gx]+=0.003+0.004*Math.sin(fx*Math.PI*3+fy*Math.PI*2);
        }
      }

      // threshold line label
      ctx.fillStyle=hexA(TEXT,0.5); ctx.font="11px monospace"; ctx.textAlign="left";
      ctx.fillText("threshold C\u209c = "+theta.toFixed(2),12,H-12);

      // colorbar
      const barY=H-28,barW=120,barH=8;
      const barX=W-barW-14;
      const tGrad=ctx.createLinearGradient(barX,0,barX+barW,0);
      tGrad.addColorStop(0,hexA(MUTED,0.3)); tGrad.addColorStop(theta,hexA(MUTED,0.3));
      const subCol=substrate==="neural"?GOLD:substrate==="ferrofluid"?CYAN:substrate==="plasma"?VIOLET:substrate==="fusion"?GREEN:substrate==="crystal"?BLUE:ROSE;
      tGrad.addColorStop(theta,subCol); tGrad.addColorStop(1,subCol);
      ctx.fillStyle=tGrad; ctx.fillRect(barX,barY,barW,barH);
      ctx.strokeStyle=hexA(TEXT,0.5); ctx.lineWidth=1;
      ctx.beginPath(); ctx.moveTo(barX+barW*theta,barY-2); ctx.lineTo(barX+barW*theta,barY+barH+2); ctx.stroke();

      onNucleationCount(nCount);
      raf=requestAnimationFrame(loop);
    };
    raf=requestAnimationFrame(loop);
    return ()=>cancelAnimationFrame(raf);
  },[substrate,onNucleationCount]);

  return (
    <div>
      <canvas ref={cvRef} style={{width:"100%",height:420,borderRadius:8,display:"block"}} />
      <div style={{marginTop:12,display:"flex",gap:14,flexWrap:"wrap",alignItems:"flex-end"}}>
        <label style={{flex:1,minWidth:140,color:TEXT,fontSize:12,fontFamily:"monospace"}}>
          Amplitude A
          <input type="range" min={0.1} max={1} step={0.01} value={A}
            onChange={e=>{const v=+e.target.value;setA(v);ARef.current=v;}}
            style={{display:"block",width:"100%",marginTop:4}} />
        </label>
        <label style={{flex:1,minWidth:140,color:TEXT,fontSize:12,fontFamily:"monospace"}}>
          Frequency \u03c9
          <input type="range" min={0.2} max={3} step={0.1} value={w}
            onChange={e=>{const v=+e.target.value;setW(v);wRef.current=v;}}
            style={{display:"block",width:"100%",marginTop:4}} />
        </label>
        <label style={{flex:1,minWidth:140,color:TEXT,fontSize:12,fontFamily:"monospace"}}>
          Decay \u03ba
          <input type="range" min={0.05} max={1.5} step={0.05} value={k}
            onChange={e=>{const v=+e.target.value;setK(v);kRef.current=v;}}
            style={{display:"block",width:"100%",marginTop:4}} />
        </label>
        <label style={{flex:1,minWidth:140,color:TEXT,fontSize:12,fontFamily:"monospace"}}>
          Threshold C\u209c
          <input type="range" min={0.05} max={0.8} step={0.01} value={th}
            onChange={e=>{const v=+e.target.value;setTh(v);thRef.current=v;}}
            style={{display:"block",width:"100%",marginTop:4}} />
        </label>
        <button onClick={()=>setPlaying(p=>!p)}
          style={{background:PAN2,border:"1px solid "+BORDER,color:TEXT,
            borderRadius:6,padding:"6px 16px",cursor:"pointer",fontFamily:"monospace",fontSize:12}}>
          {playing?"Pause":"Play"}
        </button>
      </div>
    </div>
  );
}

export default function CoherenceEnginePage(){
  const [substrate,setSubstrate]=useState<Substrate>("neural");
  const [nucleationCount,setNucleationCount]=useState(0);

  const sec:React.CSSProperties={background:PAN,border:"1px solid "+BORDER,borderRadius:12,padding:20,marginBottom:22};
  const secLabel:React.CSSProperties={fontFamily:"monospace",fontSize:10,letterSpacing:2,color:MUTED,textTransform:"uppercase",marginBottom:12};
  const card:React.CSSProperties={background:PAN2,border:"1px solid "+BORDER,borderRadius:8,padding:14};

  const substrates:{id:Substrate,label:string,col:string,icon:string,scale:string}[]=[
    {id:"neural",label:"Neural",col:GOLD,icon:"\ud83e\udde0",scale:"1 nm \u2013 100 \u00b5m"},
    {id:"ferrofluid",label:"Ferrofluid",col:CYAN,icon:"\ud83e\uddec",scale:"10 nm \u2013 10 cm"},
    {id:"plasma",label:"Plasma",col:VIOLET,icon:"\u26a1",scale:"1 cm \u2013 100 m"},
    {id:"fusion",label:"Fusion",col:GREEN,icon:"\u269b\ufe0f",scale:"10 cm \u2013 1 km"},
    {id:"crystal",label:"Crystal",col:BLUE,icon:"\ud83d\udc8e",scale:"0.1 nm \u2013 1 m"},
    {id:"bio",label:"Biological",col:ROSE,icon:"\ud83c\udf31",scale:"1 nm \u2013 10 m"},
  ];

  const engineData:{id:Substrate,name:string,threshold:string,thresholdVal:string,mechanism:string,page:string}[]=[
    {id:"neural",name:"Synaptic Entropy Engine",threshold:"Co-firing > \u03b8",thresholdVal:"E(i)\u00b7E(j) > 0.3",mechanism:"Hebbian synapse lock via entropy burst",page:"/synaptic-entropy"},
    {id:"ferrofluid",name:"Ferrofluid Propulsion",threshold:"Rosensweig H_c",thresholdVal:"\u03c7H\u00b2/(2\u03bc\u2080) > 2\u03b3/\u03bb",mechanism:"Spike nucleation \u2192 collapse thrust",page:"/ferrofluid-propulsion"},
    {id:"plasma",name:"Slinky Propulsion",threshold:"Standing wave lock",thresholdVal:"|\u03a8\u209b\u209c\u2090\u2099\u1d48\u2097\u2092\u209c| > 0.5",mechanism:"Travelling plasma wave rides curvature",page:"/slinky-propulsion"},
    {id:"fusion",name:"Compact Fusion Reactor",threshold:"Beta \u03b2 > \u03b2_c",thresholdVal:"B\u207f > B\u207b\u2075",mechanism:"Magnetic confinement \u2192 2\u02e3 power gain",page:"/compact-fusion"},
    {id:"crystal",name:"Crystallization Atlas",threshold:"Nucleation T < T_c",thresholdVal:"C(x,t) > C\u209c at seed",mechanism:"Lattice ordering \u2192 crystal lock",page:"/crystallization-atlas"},
    {id:"bio",name:"Bio-Computational Paradigm",threshold:"Coherence field gate",thresholdVal:"|C| > 0.5 at receptor",mechanism:"Cross-species biomolecule signaling",page:"/bio-computational"},
  ];

  const active=engineData.find(e=>e.id===substrate)!;
  const activeCol=substrates.find(s=>s.id===substrate)!.col;

  const stages=[
    {n:"I",label:"Disordered",col:hexA(MUTED,0.6),
     txt:"Entropy dominates. Phase is random. No coherent structure. The system is in thermal equilibrium with its environment."},
    {n:"II",label:"Nucleation Seed",col:hexA(activeCol,0.7),
     txt:"A perturbation crosses threshold. Local coherence forms: a spike, a synapse, a seed crystal, a plasma filament. The transition begins."},
    {n:"III",label:"Phase Lock",col:activeCol,
     txt:"Multiple nucleation sites couple. Constructive interference amplifies the coherent field. The structure becomes self-sustaining."},
    {n:"IV",label:"Work Output",col:GOLD,
     txt:"The locked structure interacts with its substrate to produce thrust, heat, signal, or computation. Coherence does work."},
  ];

  const scales=[
    {label:"Synapse",sz:"1 nm",col:VIOLET,substrates:["neural","bio"]},
    {label:"Nanoparticle",sz:"10 nm",col:ROSE,substrates:["ferrofluid","bio"]},
    {label:"Cell",sz:"10 \u00b5m",col:GREEN,substrates:["bio"]},
    {label:"Bearing seal",sz:"10 cm",col:CYAN,substrates:["ferrofluid"]},
    {label:"Plasma ring",sz:"1 m",col:VIOLET,substrates:["plasma"]},
    {label:"Fusion coil",sz:"10 m",col:GREEN,substrates:["fusion"]},
    {label:"Slinky array",sz:"100 m",col:GOLD,substrates:["plasma"]},
    {label:"Reactor vessel",sz:"1 km",col:BLUE,substrates:["fusion"]},
  ];

  const thresholds=[
    {sub:"Neural",th:"E(i)\u00b7E(j) > 0.3",name:"Co-firing threshold",col:GOLD,
     desc:"Two neurons firing simultaneously cross the Hebbian threshold and lock their synapse. Below: random noise. Above: memory formation."},
    {sub:"Ferrofluid",th:"\u03c7H\u00b2/(2\u03bc\u2080) > 2\u03b3/\u03bb",name:"Rosensweig H_c",col:CYAN,
     desc:"Magnetic pressure exceeds surface tension. The fluid surface buckles into ordered spikes. Below: flat fluid. Above: coherent lattice."},
    {sub:"Plasma",th:"|\u03a8| > 0.5",name:"Standing wave lock",col:VIOLET,
     desc:"Plasma wave amplitude crosses the coherence threshold. Below: turbulent diffusion. Above: self-organized ring array riding curvature."},
    {sub:"Fusion",th:"B\u207f > B\u207b\u2075",name:"Beta critical",col:GREEN,
     desc:"Magnetic confinement field crosses the minimum for plasma stability. Below: disruption. Above: sustained fusion burn with 2\u02e3 gain."},
    {sub:"Crystal",th:"T < T_c",name:"Nucleation temperature",col:BLUE,
     desc:"Thermal energy drops below the crystallization point. Below: disordered liquid. Above: lattice self-assembly and crystal lock."},
    {sub:"Biological",th:"|C| > 0.5",name:"Receptor coherence gate",col:ROSE,
     desc:"Coherence field amplitude at a cell membrane receptor exceeds the signaling threshold. Below: no response. Above: cascaded gene expression."},
  ];

  return (
    <div style={{minHeight:"100vh",background:BG,color:TEXT,padding:"40px 20px 80px",fontFamily:"'Inter',system-ui,sans-serif"}}>
      <div style={{maxWidth:1040,margin:"0 auto"}}>

        <p style={{fontFamily:"monospace",fontSize:11,letterSpacing:2,color:MUTED,textTransform:"uppercase",marginBottom:8}}>
          AETHER · Unified Field Architecture
        </p>
        <h1 style={{fontSize:"clamp(24px,4.5vw,38px)",fontWeight:700,
          background:"linear-gradient(90deg,"+VIOLET+","+CYAN+","+GOLD+","+GREEN+")",
          WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent",marginBottom:8}}>
          Coherence Engine · All Engines Are One Engine
        </h1>
        <p style={{color:MUTED,fontFamily:"monospace",fontSize:13,marginBottom:36}}>
          The same transition — disordered → nucleated → phase-locked → work-producing — across every substrate
        </p>

        {/* Master equation */}
        <div style={sec}>
          <p style={secLabel}>00 · The Governing Equation · Every Engine, Every Scale</p>
          <div style={{textAlign:"center",padding:"24px 0",marginBottom:16}}>
            <p style={{fontFamily:"monospace",fontSize:22,color:CYAN,fontWeight:700,letterSpacing:1,marginBottom:8}}>
              C(x,t) = A(x) e^{i(\u03c6 - \u03c9t)} \u00b7 e^{- \u03ba\u00b7r}
            </p>
            <p style={{color:MUTED,fontSize:13,fontFamily:"monospace",lineHeight:1.7,maxWidth:640,margin:"0 auto"}}>
              Coherence field C at position x and time t · A(x) = local amplitude (salience) · \u03c6 = phase encoding meaning · \u03c9 = angular frequency of oscillation · \u03ba = spatial decay (localization) · r = radial distance from coherence centre
            </p>
          </div>
          <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(160px,1fr))",gap:10}}>
            {[
              {label:"A(x)",desc:"Spatial amplitude map — where coherence concentrates",col:GOLD},
              {label:"\u03c6",desc:"Phase — encodes information, relationship, structure",col:CYAN},
              {label:"\u03c9",desc:"Frequency — oscillation rate of the coherent mode",col:VIOLET},
              {label:"\u03ba",desc:"Decay — how tightly coherence is localized in space",col:GREEN},
              {label:"C\u209c",desc:"Threshold — the crossing point where order crystallizes",col:BLUE},
              {label:"|C| > C\u209c",desc:"Nucleation condition — the universal engine trigger",col:ROSE},
            ].map(p=>(
              <div key={p.label} style={{...card,textAlign:"center",borderColor:hexA(p.col,0.25)}}>
                <p style={{color:p.col,fontFamily:"monospace",fontSize:18,fontWeight:700,marginBottom:4}}>{p.label}</p>
                <p style={{color:MUTED,fontSize:11,lineHeight:1.5}}>{p.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Live coherence field */}
        <div style={sec}>
          <p style={secLabel}>01 · Live Coherence Field · Interactive Nucleation Simulation</p>
          <div style={{display:"flex",gap:8,marginBottom:16,flexWrap:"wrap"}}>
            {substrates.map(s=>(
              <button key={s.id} onClick={()=>setSubstrate(s.id)}
                style={{background:substrate===s.id?hexA(s.col,0.12):PAN2,
                  border:"1px solid "+(substrate===s.id?s.col:BORDER),
                  color:substrate===s.id?s.col:MUTED,borderRadius:6,
                  padding:"6px 14px",cursor:"pointer",fontFamily:"monospace",fontSize:12,
                  display:"flex",alignItems:"center",gap:6}}>
                <span style={{fontSize:14}}>{s.icon}</span>
                <span>{s.label}</span>
              </button>
            ))}
          </div>
          <CoherenceFieldCanvas substrate={substrate} onNucleationCount={setNucleationCount} key={substrate} />
          <div style={{display:"flex",gap:20,marginTop:10,fontFamily:"monospace",fontSize:12}}>
            <span style={{color:MUTED}}>Active substrate <span style={{color:activeCol}}>{active.name}</span></span>
            <span style={{color:MUTED}}>Scale <span style={{color:TEXT}}>{substrates.find(s=>s.id===substrate)!.scale}</span></span>
            <span style={{color:MUTED}}>Nucleated cells <span style={{color:activeCol}}>{nucleationCount}</span></span>
            <span style={{color:MUTED}}>Threshold <span style={{color:TEXT}}>{active.thresholdVal}</span></span>
          </div>
        </div>

        {/* Four-stage transition */}
        <div style={sec}>
          <p style={secLabel}>02 · The Four-Stage Transition · Universal Across All Substrates</p>
          <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(220px,1fr))",gap:12}}>
            {stages.map(s=>(
              <div key={s.n} style={{...card,borderColor:hexA(s.col,0.35),textAlign:"center"}}>
                <p style={{color:s.col,fontFamily:"monospace",fontSize:28,fontWeight:700,marginBottom:6}}>{s.n}</p>
                <p style={{color:TEXT,fontFamily:"monospace",fontSize:13,fontWeight:700,marginBottom:8}}>{s.label}</p>
                <p style={{color:MUTED,fontSize:12,lineHeight:1.6}}>{s.txt}</p>
              </div>
            ))}
          </div>
          <div style={{marginTop:18,display:"flex",alignItems:"center",gap:0,justifyContent:"center",flexWrap:"wrap"}}>
            {stages.map((s,i)=>[
              <div key={s.n} style={{width:20,height:20,borderRadius:"50%",background:s.col,boxShadow:`0 0 12px ${s.col}`}} />,
              i<3&&<div key={`a-${i}`} style={{width:40,height:2,background:hexA(GOLD,0.4)}} />
            ]).flat()}
          </div>
        </div>

        {/* Engine table */}
        <div style={sec}>
          <p style={secLabel}>03 · AETHER Engine Registry · Thresholds, Mechanisms, Routes</p>
          <div style={{overflowX:"auto"}}>
            <table style={{width:"100%",borderCollapse:"collapse",fontSize:13,minWidth:640}}>
              <thead>
                <tr style={{borderBottom:"1px solid "+BORDER}}>
                  <th style={{textAlign:"left",padding:"10px 8px",color:MUTED,fontFamily:"monospace",fontSize:11,fontWeight:600}}>Engine</th>
                  <th style={{textAlign:"left",padding:"10px 8px",color:MUTED,fontFamily:"monospace",fontSize:11,fontWeight:600}}>Threshold</th>
                  <th style={{textAlign:"left",padding:"10px 8px",color:MUTED,fontFamily:"monospace",fontSize:11,fontWeight:600}}>Mechanism</th>
                  <th style={{textAlign:"left",padding:"10px 8px",color:MUTED,fontFamily:"monospace",fontSize:11,fontWeight:600}}>Route</th>
                </tr>
              </thead>
              <tbody>
                {engineData.map(e=>{
                  const sc=substrates.find(s=>s.id===e.id)!;
                  return (
                    <tr key={e.id} style={{borderBottom:"1px solid "+hexA(BORDER,0.5)}}>
                      <td style={{padding:"10px 8px"}}>
                        <span style={{fontSize:16,marginRight:8}}>{sc.icon}</span>
                        <span style={{color:sc.col,fontWeight:600}}>{e.name}</span>
                      </td>
                      <td style={{padding:"10px 8px",fontFamily:"monospace",fontSize:12,color:CYAN}}>{e.threshold}</td>
                      <td style={{padding:"10px 8px",color:MUTED,fontSize:12}}>{e.mechanism}</td>
                      <td style={{padding:"10px 8px"}}>
                        <Link href={e.page} style={{color:sc.col,fontFamily:"monospace",fontSize:12,textDecoration:"none"}}>\u2192 {e.page}</Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Scale ruler */}
        <div style={sec}>
          <p style={secLabel}>04 · Scale Ruler · From Synapse to Cosmic</p>
          <div style={{position:"relative",padding:"20px 0 36px"}}>
            <div style={{height:4,background:hexA(BORDER,0.6),borderRadius:2,position:"relative"}}>
              {scales.map((s,i)=>{
                const left=(i/(scales.length-1))*100;
                const activeHere=s.substrates.includes(substrate);
                return (
                  <div key={s.label} style={{position:"absolute",left:`${left}%`,transform:"translateX(-50%)",top:-6}}>
                    <div style={{width:14,height:14,borderRadius:"50%",background:activeHere?s.col:hexA(MUTED,0.4),border:`2px solid ${activeHere?s.col:BORDER}`,boxShadow:activeHere?`0 0 10px ${s.col}`:"none"}} />
                    <div style={{marginTop:10,textAlign:"center"}}>
                      <p style={{color:activeHere?s.col:MUTED,fontFamily:"monospace",fontSize:10,fontWeight:700,marginBottom:2,whiteSpace:"nowrap"}}>{s.label}</p>
                      <p style={{color:hexA(MUTED,0.6),fontFamily:"monospace",fontSize:9,whiteSpace:"nowrap"}}>{s.sz}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
          <p style={{color:MUTED,fontSize:12,textAlign:"center",fontFamily:"monospace"}}>
            Highlighted = active substrate range · The coherence engine is substrate-scale invariant
          </p>
        </div>

        {/* Threshold unification */}
        <div style={sec}>
          <p style={secLabel}>05 · Threshold Unification · One Crossing, Many Names</p>
          <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(260px,1fr))",gap:12}}>
            {thresholds.map(t=>(
              <div key={t.sub} style={{...card,borderColor:hexA(t.col,0.3)}}>
                <p style={{color:t.col,fontFamily:"monospace",fontSize:11,fontWeight:700,letterSpacing:1,textTransform:"uppercase",marginBottom:4}}>{t.sub}</p>
                <p style={{color:TEXT,fontSize:13,fontWeight:600,marginBottom:4}}>{t.name}</p>
                <p style={{color:CYAN,fontFamily:"monospace",fontSize:12,fontWeight:700,marginBottom:6}}>{t.th}</p>
                <p style={{color:MUTED,fontSize:12,lineHeight:1.6}}>{t.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Closing synthesis */}
        <div style={sec}>
          <p style={secLabel}>06 · The Synthesis · Why All Engines Are One</p>
          <p style={{color:TEXT,fontSize:15,lineHeight:1.8,marginBottom:16}}>
            Every engine in the AETHER system — neural, ferrofluid, plasma, fusion, crystalline, biological — is not a separate invention. It is the same coherence law C(x,t) operating on a different substrate with a different threshold. The geometry of the transition is invariant:
          </p>
          <div style={{display:"flex",justifyContent:"center",marginBottom:16}}>
            <div style={{...card,display:"inline-block",textAlign:"center",padding:"16px 28px",borderColor:hexA(GOLD,0.3)}}>
              <p style={{color:GOLD,fontFamily:"monospace",fontSize:18,fontWeight:700,marginBottom:6}}>
                Entropy → Nucleation → Phase Lock → Work
              </p>
              <p style={{color:MUTED,fontFamily:"monospace",fontSize:12}}>
                Disordered → Seed → Coherent → Productive
              </p>
            </div>
          </div>
          <p style={{color:TEXT,fontSize:14,lineHeight:1.7}}>
            A synapse strengthening in your brain is a ferrofluid spike forming above a magnet is a plasma wave locking into a ring array is a fusion plasma crossing beta critical is a crystal seed nucleating in a cooling melt. The substrate changes. The law does not. This is the AETHER Coherence Engine.
          </p>
        </div>

        <div style={{marginTop:36,paddingTop:20,borderTop:"1px solid "+BORDER,
          fontFamily:"monospace",fontSize:12,color:MUTED,display:"flex",gap:24,flexWrap:"wrap"}}>
          <Link href="/synaptic-entropy" style={{color:GOLD,textDecoration:"none"}}>\u2192 Neural</Link>
          <Link href="/ferrofluid-propulsion" style={{color:CYAN,textDecoration:"none"}}>\u2192 Ferrofluid</Link>
          <Link href="/slinky-propulsion" style={{color:VIOLET,textDecoration:"none"}}>\u2192 Plasma</Link>
          <Link href="/compact-fusion" style={{color:GREEN,textDecoration:"none"}}>\u2192 Fusion</Link>
          <Link href="/crystallization-atlas" style={{color:BLUE,textDecoration:"none"}}>\u2192 Crystal</Link>
          <Link href="/bio-computational" style={{color:ROSE,textDecoration:"none"}}>\u2192 Biological</Link>
          <Link href="/graph-map" style={{color:MUTED,textDecoration:"none"}}>\u2192 Knowledge Graph</Link>
        </div>
      </div>
    </div>
  );
}
