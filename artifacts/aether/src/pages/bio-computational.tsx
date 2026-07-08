import { useState, useEffect, useRef } from "react";
import { Link } from "wouter";
import { Play, Pause, RotateCcw } from "lucide-react";

const BG="#04060d",PAN="#0a0d1a",PAN2="#0d1020",BORDER="#182038",TEXT="#b8cce8",MUTED="#5a6e8c";
const GOLD="#ffb830",CYAN="#3fd8d0",VIOLET="#a87aff",GREEN="#50d49a",BLUE="#4ab0ff";
const RED="#ff5a6a";

function hexA(h:string,a:number){const n=h.replace("#","");return `rgba(${parseInt(n.slice(0,2),16)},${parseInt(n.slice(2,4),16)},${parseInt(n.slice(4,6),16)},${a})`;}

// ── Live simulation: Bone Marrow Core ────────────────────────────────────────
type Cell={x:number;y:number;vx:number;vy:number;kind:0|1|2;age:number;life:number;r:number};

function MarrowSim(){
  const cvRef=useRef<HTMLCanvasElement|null>(null);
  const playRef=useRef(true);
  const demandRef=useRef(0.5);
  const rateRef=useRef(0.5);
  const rbcBiasRef=useRef(0.6);
  const wbcBiasRef=useRef(0.25);
  const pltBiasRef=useRef(0.15);
  const countRef=useRef<[number,number,number]>([0,0,0]);
  const rbcOut=useRef<HTMLSpanElement|null>(null);
  const wbcOut=useRef<HTMLSpanElement|null>(null);
  const pltOut=useRef<HTMLSpanElement|null>(null);
  const demOut=useRef<HTMLSpanElement|null>(null);

  const [play,setPlay]=useState(true);
  const [demand,setDemand]=useState(0.5);
  const [rate,setRate]=useState(0.5);
  const [rbcBias,setRbcBias]=useState(0.6);
  const [wbcBias,setWbcBias]=useState(0.25);
  const [pltBias,setPltBias]=useState(0.15);

  useEffect(()=>{playRef.current=play;},[play]);
  useEffect(()=>{demandRef.current=demand;},[demand]);
  useEffect(()=>{rateRef.current=rate;},[rate]);
  useEffect(()=>{rbcBiasRef.current=rbcBias;},[rbcBias]);
  useEffect(()=>{wbcBiasRef.current=wbcBias;},[wbcBias]);
  useEffect(()=>{pltBiasRef.current=pltBias;},[pltBias]);

  useEffect(()=>{
    const cv=cvRef.current; if(!cv) return;
    const ctx=cv.getContext("2d"); if(!ctx) return;
    const reduce=typeof window!=="undefined"&&window.matchMedia&&window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let raf=0;
    let cells:Cell[]=[];
    let emit=0;
    let pulse=0;
    let lastW=0;
    const KIND_COL=[RED,"#e8eefc",GOLD];

    const loop=()=>{
      const dpr=Math.min(2,window.devicePixelRatio||1);
      const w=cv.clientWidth||640,h=380;
      if(w!==lastW){cv.width=Math.round(w*dpr);cv.height=Math.round(h*dpr);lastW=w;}
      ctx.setTransform(dpr,0,0,dpr,0,0);

      const running=playRef.current&&!reduce;
      const cx=w*0.5,cy=h*0.5;
      pulse+=running?0.05:0;
      const dem=demandRef.current, rate=rateRef.current;

      // background bloodstream
      ctx.fillStyle="#02030a"; ctx.fillRect(0,0,w,h);
      const bg=ctx.createLinearGradient(0,0,w,0);
      bg.addColorStop(0,hexA(RED,0.05));
      bg.addColorStop(0.5,hexA(VIOLET,0.04));
      bg.addColorStop(1,hexA(BLUE,0.05));
      ctx.fillStyle=bg; ctx.fillRect(0,0,w,h);

      // flowing stream lines
      ctx.lineWidth=1;
      for(let i=0;i<6;i++){
        const yy=h*(i+0.5)/6;
        ctx.strokeStyle=hexA(BLUE,0.06);
        ctx.beginPath(); ctx.moveTo(0,yy); ctx.lineTo(w,yy); ctx.stroke();
      }

      // emit cells based on production rate × demand
      if(running){
        const prod=0.15+rate*1.9*(0.5+dem);
        emit+=prod;
        const sum=Math.max(0.001,rbcBiasRef.current+wbcBiasRef.current+pltBiasRef.current);
        const pR=rbcBiasRef.current/sum;
        const pW=(wbcBiasRef.current/sum)*(1+dem*0.8); // immune stress raises WBC
        while(emit>=1&&cells.length<520){
          emit-=1;
          const roll=Math.random()*(pR+pW+pltBiasRef.current/sum);
          let kind:0|1|2=0;
          if(roll<pR) kind=0; else if(roll<pR+pW) kind=1; else kind=2;
          const ang=(Math.random()-0.5)*1.1;
          const spd=1.1+Math.random()*1.4+dem*0.9;
          cells.push({x:cx+(Math.random()-0.5)*20,y:cy+(Math.random()-0.5)*20,
            vx:Math.cos(ang)*spd,vy:Math.sin(ang)*spd*0.5,
            kind,age:0,life:260+Math.random()*120,
            r:kind===0?4.5:kind===1?6:2.6});
        }
      }

      // update + count
      const cnt:[number,number,number]=[0,0,0];
      cells=cells.filter(c=>{
        if(running){c.x+=c.vx;c.y+=c.vy;c.vy+=0.002;c.age++;}
        cnt[c.kind]++;
        return c.x<w+20&&c.x>-20&&c.y<h+20&&c.y>-20&&c.age<c.life;
      });
      countRef.current=cnt;

      // draw cells
      for(const c of cells){
        const col=KIND_COL[c.kind];
        if(c.kind===0){
          ctx.beginPath(); ctx.arc(c.x,c.y,c.r,0,Math.PI*2);
          ctx.fillStyle=hexA(col,0.85); ctx.fill();
          ctx.beginPath(); ctx.arc(c.x,c.y,c.r*0.5,0,Math.PI*2);
          ctx.fillStyle=hexA("#8a1020",0.6); ctx.fill();
        } else if(c.kind===1){
          ctx.beginPath(); ctx.arc(c.x,c.y,c.r,0,Math.PI*2);
          ctx.fillStyle=hexA(col,0.6); ctx.fill();
          ctx.lineWidth=1.2; ctx.strokeStyle=hexA(CYAN,0.6); ctx.stroke();
        } else {
          ctx.beginPath(); ctx.arc(c.x,c.y,c.r,0,Math.PI*2);
          ctx.fillStyle=col; ctx.shadowBlur=6; ctx.shadowColor=GOLD; ctx.fill(); ctx.shadowBlur=0;
        }
      }

      // central marrow core (pulsing)
      const beat=0.5+0.5*Math.sin(pulse);
      const coreR=34+beat*7*(0.6+dem);
      const g=ctx.createRadialGradient(cx,cy,0,cx,cy,coreR*2.2);
      g.addColorStop(0,hexA(RED,0.5));
      g.addColorStop(0.4,hexA(VIOLET,0.25));
      g.addColorStop(1,"transparent");
      ctx.fillStyle=g; ctx.beginPath(); ctx.arc(cx,cy,coreR*2.2,0,Math.PI*2); ctx.fill();
      ctx.beginPath(); ctx.arc(cx,cy,coreR,0,Math.PI*2);
      ctx.fillStyle=hexA("#2a0812",0.9); ctx.fill();
      ctx.lineWidth=2; ctx.strokeStyle=hexA(RED,0.55+beat*0.35); ctx.stroke();
      // clonal expansion sparks in core
      for(let i=0;i<10;i++){
        const a=pulse*0.6+i*0.63;
        const rr=coreR*(0.3+0.55*((Math.sin(pulse*1.3+i)+1)/2));
        ctx.beginPath(); ctx.arc(cx+Math.cos(a)*rr,cy+Math.sin(a)*rr,1.8,0,Math.PI*2);
        ctx.fillStyle=hexA(GOLD,0.7); ctx.fill();
      }
      ctx.font="700 10px monospace"; ctx.fillStyle=hexA(TEXT,0.8);
      ctx.textAlign="center"; ctx.fillText("MARROW CORE",cx,cy+coreR+16);
      ctx.textAlign="left";

      if(rbcOut.current) rbcOut.current.textContent=String(cnt[0]);
      if(wbcOut.current) wbcOut.current.textContent=String(cnt[1]);
      if(pltOut.current) pltOut.current.textContent=String(cnt[2]);
      if(demOut.current) demOut.current.textContent=dem>0.66?"HIGH (immune stress)":dem>0.33?"NORMAL":"LOW";

      raf=requestAnimationFrame(loop);
    };
    raf=requestAnimationFrame(loop);
    return ()=>cancelAnimationFrame(raf);
  },[]);

  const reset=()=>{ setDemand(0.5); setRate(0.5); setRbcBias(0.6); setWbcBias(0.25); setPltBias(0.15); setPlay(true); };

  const slider=(label:string,val:number,set:(n:number)=>void,col:string)=>(
    <div style={{marginBottom:10}}>
      <div style={{display:"flex",justifyContent:"space-between",fontFamily:"monospace",fontSize:11,color:MUTED,marginBottom:4}}>
        <span style={{color:col}}>{label}</span><span style={{color:TEXT}}>{Math.round(val*100)}%</span>
      </div>
      <input type="range" min={0} max={1} step={0.01} value={val} onChange={e=>set(parseFloat(e.target.value))}
        style={{width:"100%",accentColor:col}}/>
    </div>
  );

  return(
    <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(300px,1fr))",gap:16}}>
      <div>
        <canvas ref={cvRef} style={{width:"100%",height:380,display:"block",borderRadius:12,border:`1px solid ${BORDER}`,background:"#02030a"}}/>
        <div style={{display:"flex",gap:16,marginTop:10,flexWrap:"wrap"}}>
          {[["RBC · oxygen",RED],["WBC · immune","#e8eefc"],["Platelets · clot",GOLD]].map(([l,c])=>(
            <div key={l as string} style={{display:"flex",alignItems:"center",gap:6,fontFamily:"monospace",fontSize:11,color:MUTED}}>
              <span style={{width:10,height:10,borderRadius:"50%",background:c as string}}/>{l}
            </div>
          ))}
        </div>
        <div style={{display:"flex",justifyContent:"center",gap:12,marginTop:14}}>
          <button onClick={()=>setPlay(!play)}
            style={{display:"flex",alignItems:"center",gap:8,padding:"9px 18px",background:hexA(VIOLET,0.18),color:VIOLET,border:`1px solid ${hexA(VIOLET,0.4)}`,borderRadius:8,cursor:"pointer",fontFamily:"monospace",fontSize:12}}>
            {play?<Pause size={16}/>:<Play size={16}/>}{play?"Pause":"Play"}
          </button>
          <button onClick={reset}
            style={{display:"flex",alignItems:"center",gap:8,padding:"9px 18px",background:PAN2,color:TEXT,border:`1px solid ${BORDER}`,borderRadius:8,cursor:"pointer",fontFamily:"monospace",fontSize:12}}>
            <RotateCcw size={16}/> Reset
          </button>
        </div>
      </div>
      <div style={{display:"flex",flexDirection:"column",gap:14}}>
        <div style={{background:PAN2,border:`1px solid ${BORDER}`,borderRadius:12,padding:16}}>
          <div style={{fontFamily:"monospace",fontSize:11,color:CYAN,textTransform:"uppercase",letterSpacing:1,marginBottom:12}}>Live Blood Census</div>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:10,textAlign:"center"}}>
            <div><div style={{fontSize:22,fontWeight:700,color:RED}}><span ref={rbcOut}>0</span></div><div style={{fontFamily:"monospace",fontSize:10,color:MUTED}}>RBC</div></div>
            <div><div style={{fontSize:22,fontWeight:700,color:"#e8eefc"}}><span ref={wbcOut}>0</span></div><div style={{fontFamily:"monospace",fontSize:10,color:MUTED}}>WBC</div></div>
            <div><div style={{fontSize:22,fontWeight:700,color:GOLD}}><span ref={pltOut}>0</span></div><div style={{fontFamily:"monospace",fontSize:10,color:MUTED}}>PLT</div></div>
          </div>
          <div style={{display:"flex",justifyContent:"space-between",fontFamily:"monospace",fontSize:11,color:MUTED,marginTop:12,paddingTop:10,borderTop:`1px solid ${BORDER}`}}>
            <span>Demand / Stimulus</span><span ref={demOut} style={{color:GOLD}}>NORMAL</span>
          </div>
        </div>
        <div style={{background:PAN2,border:`1px solid ${BORDER}`,borderRadius:12,padding:16}}>
          <div style={{fontFamily:"monospace",fontSize:11,color:GOLD,textTransform:"uppercase",letterSpacing:1,marginBottom:12}}>Regulation Controls</div>
          {slider("Demand / stimulus",demand,setDemand,GOLD)}
          {slider("Production rate",rate,setRate,CYAN)}
          {slider("RBC lineage bias",rbcBias,setRbcBias,RED)}
          {slider("WBC lineage bias",wbcBias,setWbcBias,"#e8eefc")}
          {slider("Platelet lineage bias",pltBias,setPltBias,GOLD)}
          <p style={{margin:"8px 0 0",fontSize:11,color:MUTED,lineHeight:1.5}}>Raising demand models immune stress — clonal expansion accelerates and the WBC lineage is up-regulated.</p>
        </div>
      </div>
    </div>
  );
}

// ── content data ─────────────────────────────────────────────────────────────
const MARROW_PRODUCTS=[
  {t:"Red blood cells",col:RED,d:"Oxygen transport throughout the body — the largest daily output of the marrow."},
  {t:"White blood cells",col:"#e8eefc",d:"Immune defense — the cellular front line against infection and disease."},
  {t:"Platelets",col:GOLD,d:"Coagulation — clot formation that seals wounds and prevents blood loss."},
];

const BIOMOLECULES=[
  {src:"Animal",bio:"Proteins / mRNA",fn:"Enzymes, regulatory factors",app:"Regenerative medicine, gene repair",col:RED},
  {src:"Plant",bio:"Structural proteins",fn:"Adhesion, scaffolding",app:"Biomaterials, tissue engineering",col:GREEN},
  {src:"Spider",bio:"Silk proteins (spidroins)",fn:"Strength, flexibility",app:"Sutures, scaffolds, soft robotics",col:CYAN},
  {src:"Octopus",bio:"Reflectins, adhesives",fn:"Dynamic coloration, adhesion",app:"Soft robotics, adaptive materials",col:VIOLET},
  {src:"Shellfish",bio:"Chitin, adhesive proteins",fn:"Structural integrity, natural adhesives",app:"Medical adhesives, biodegradable plastics",col:GOLD},
];

const LAYERS=[
  {n:"1",t:"Core Layer · Production",col:RED,d:"Bone marrow manufactures blood cells; ash trees manufacture fiber — the biological source of raw output."},
  {n:"2",t:"Functional Layer · Signal & Regulation",col:GOLD,d:"Cytokine signaling and protein–mRNA interactions govern rate, type, and timing of production."},
  {n:"3",t:"Interface Layer · Application",col:CYAN,d:"Wearable marrow monitor and bio-inspired materials translate biology into usable devices."},
  {n:"4",t:"Feedback Layer · Adaptive Optimization",col:VIOLET,d:"AI predictive models and visual dashboards close the loop, tuning the system over time."},
];

const APPLICATIONS=[
  {t:"4.1 · Personalized marrow monitoring",col:CYAN,d:"A wearable tracks blood-cell production, flags immune stress, anemia, and early disease signs, and drives educational dashboards for self-understanding."},
  {t:"4.2 · Gene repair & protein engineering",col:VIOLET,d:"Stimulate DNA repair pathways, deliver therapeutic proteins, and design bio-inspired delivery scaffolds targeted to tissue."},
  {t:"4.3 · Bio-inspired materials",col:GOLD,d:"Spider-silk scaffolds for strength, octopus-inspired adaptive adhesion, and shellfish chitin for biodegradable plastics."},
];

const PROTOTYPE=[
  {t:"Human core systems",col:RED,d:"A bone-marrow core visualization coupled to a gene-repair / protein layer representing the body's regenerative engine."},
  {t:"Biomolecular ecosystem input",col:GREEN,d:"A multi-species biofeedback network feeding animal, plant, spider, octopus, and shellfish signals into the model."},
  {t:"Claude integration",col:VIOLET,d:"Natural-language interpretation of live data, 'what-if' scenario simulation, and autonomous insight generation with dynamic visualizations."},
  {t:"Real-time AETHER dashboard",col:CYAN,d:"A unified, live view mapping every layer of the bio-computational system as it updates."},
];

const REVOLUTIONARY=[
  "Self-directed health understanding",
  "Cross-species simulation",
  "AI-powered predictive biology",
  "Multi-layer system mapping",
];

const ROADMAP=[
  {t:"Phase 1 · Simulated Environment",col:BLUE,d:"Model behavior in software before any hardware — observational and safe."},
  {t:"Phase 2 · Data Integration",col:CYAN,d:"Connect real sensor streams into the simulation pipeline."},
  {t:"Phase 3 · Interactive Visualization",col:GREEN,d:"Live dashboards and Claude-driven interpretation for the user."},
  {t:"Phase 4 · Pilot Testing",col:GOLD,d:"Careful, observational-first trials — never a diagnostic claim without validation."},
];

const SENSOR_STACK=[
  {t:"PPG · optical",col:RED,d:"Photoplethysmography (already in every smartwatch) → hemoglobin proxy and SpO2."},
  {t:"Impedance cytometry",col:CYAN,d:"A flexible wristband → hematocrit / RBC volume with proxy WBC and platelet signals."},
  {t:"Interstitial-fluid patch",col:GOLD,d:"Following the Abbott FreeStyle Libre playbook → inflammatory markers from interstitial fluid."},
];

const GAPS=[
  {t:"1 · Sensor problem",col:RED,d:"Marrow itself is inaccessible non-invasively. The bridge is to use peripheral blood as a proxy for marrow output."},
  {t:"2 · Real-time data → AI pipeline",col:GOLD,d:"Sensor firmware → encrypted health API → model inference → user output. Buildable with current tools, but not yet assembled as a product."},
  {t:"3 · Regulatory & clinical validation",col:VIOLET,d:"Any real health claim requires FDA clearance and clinical validation — a long, essential process."},
];

export default function BioComputationalPage(){
  return(
    <div style={{minHeight:"100vh",background:BG,color:TEXT,padding:"40px 20px 80px",fontFamily:"'Inter',system-ui,sans-serif"}}>
      <div style={{maxWidth:1040,margin:"0 auto"}}>
        <div style={{fontFamily:"monospace",fontSize:11,color:MUTED,letterSpacing:2,textTransform:"uppercase",marginBottom:8}}>AETHER · Bio-Computational Paradigm</div>
        <h1 style={{fontSize:30,margin:"0 0 6px",fontWeight:700,background:`linear-gradient(90deg,${VIOLET},${CYAN},${BLUE})`,WebkitBackgroundClip:"text",backgroundClip:"text",color:"transparent"}}>
          Harnessing Biological Systems Through AETHER
        </h1>
        <p style={{fontFamily:"monospace",fontSize:12,color:MUTED,margin:"0 0 22px",maxWidth:780,lineHeight:1.6}}>
          The body's hidden regenerative cores, the biomolecule ecosystem, and a Claude-integrated bio-computational prototype — presented as a conceptual, observational framework, not a medical device.
        </p>

        {/* honest disclosure */}
        <div style={{background:hexA(GOLD,0.08),border:`1px solid ${hexA(GOLD,0.4)}`,borderRadius:12,padding:16,marginBottom:24}}>
          <div style={{fontFamily:"monospace",fontSize:11,color:GOLD,textTransform:"uppercase",letterSpacing:1,marginBottom:8}}>Honest Disclosure</div>
          <p style={{margin:0,fontSize:13,color:TEXT,lineHeight:1.6}}>
            This page is conceptual and observational. Nothing here is a validated medical device, diagnosis, or treatment. No miniaturized full blood-count wearable exists today; every health claim would require clinical validation and FDA clearance before use.
          </p>
        </div>

        {/* live sim */}
        <div style={{background:PAN,border:`1px solid ${BORDER}`,borderRadius:12,padding:18,marginBottom:24}}>
          <div style={{fontFamily:"monospace",fontSize:11,color:CYAN,marginBottom:14,textTransform:"uppercase",letterSpacing:1}}>Live Simulation · Bone Marrow Core</div>
          <MarrowSim/>
        </div>

        {/* marrow products */}
        <div style={{background:PAN,border:`1px solid ${BORDER}`,borderRadius:12,padding:18,marginBottom:24}}>
          <div style={{fontFamily:"monospace",fontSize:11,color:RED,marginBottom:6,textTransform:"uppercase",letterSpacing:1}}>The Regenerative Core</div>
          <p style={{margin:"0 0 14px",fontSize:13,color:MUTED,lineHeight:1.6}}>
            Bone marrow is one of the body's hidden regenerative cores. Through regulated duplication — clonal expansion plus signaling — it continuously produces three essential blood products.
          </p>
          <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(220px,1fr))",gap:12}}>
            {MARROW_PRODUCTS.map(m=>(
              <div key={m.t} style={{background:PAN2,border:`1px solid ${BORDER}`,borderRadius:10,padding:"12px 14px"}}>
                <div style={{fontSize:13,color:m.col,fontWeight:600,marginBottom:6}}>{m.t}</div>
                <p style={{margin:0,fontSize:12,color:MUTED,lineHeight:1.6}}>{m.d}</p>
              </div>
            ))}
          </div>
        </div>

        {/* biomolecule ecosystem table */}
        <div style={{background:PAN,border:`1px solid ${BORDER}`,borderRadius:12,padding:18,marginBottom:24}}>
          <div style={{fontFamily:"monospace",fontSize:11,color:GREEN,marginBottom:14,textTransform:"uppercase",letterSpacing:1}}>Biomolecule Ecosystem</div>
          <div style={{overflowX:"auto"}}>
            <table style={{width:"100%",borderCollapse:"collapse",fontSize:12}}>
              <thead>
                <tr style={{textAlign:"left",color:MUTED,fontFamily:"monospace",fontSize:11,textTransform:"uppercase"}}>
                  <th style={{padding:"8px 10px",borderBottom:`1px solid ${BORDER}`}}>Source</th>
                  <th style={{padding:"8px 10px",borderBottom:`1px solid ${BORDER}`}}>Biomolecule</th>
                  <th style={{padding:"8px 10px",borderBottom:`1px solid ${BORDER}`}}>Function</th>
                  <th style={{padding:"8px 10px",borderBottom:`1px solid ${BORDER}`}}>Application</th>
                </tr>
              </thead>
              <tbody>
                {BIOMOLECULES.map(b=>(
                  <tr key={b.src}>
                    <td style={{padding:"9px 10px",borderBottom:`1px solid ${BORDER}`,color:b.col,fontWeight:600}}>{b.src}</td>
                    <td style={{padding:"9px 10px",borderBottom:`1px solid ${BORDER}`,color:TEXT}}>{b.bio}</td>
                    <td style={{padding:"9px 10px",borderBottom:`1px solid ${BORDER}`,color:MUTED}}>{b.fn}</td>
                    <td style={{padding:"9px 10px",borderBottom:`1px solid ${BORDER}`,color:MUTED}}>{b.app}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* 4-layer architecture */}
        <div style={{background:PAN,border:`1px solid ${BORDER}`,borderRadius:12,padding:18,marginBottom:24}}>
          <div style={{fontFamily:"monospace",fontSize:11,color:VIOLET,marginBottom:14,textTransform:"uppercase",letterSpacing:1}}>AETHER 4-Layer Architecture</div>
          <div style={{display:"flex",flexDirection:"column",gap:10}}>
            {LAYERS.map(l=>(
              <div key={l.n} style={{display:"flex",gap:14,alignItems:"flex-start",background:PAN2,border:`1px solid ${hexA(l.col,0.3)}`,borderRadius:10,padding:"12px 14px"}}>
                <div style={{minWidth:34,height:34,borderRadius:"50%",background:hexA(l.col,0.16),border:`1px solid ${hexA(l.col,0.5)}`,display:"flex",alignItems:"center",justifyContent:"center",fontFamily:"monospace",fontWeight:700,color:l.col}}>{l.n}</div>
                <div>
                  <div style={{fontSize:13.5,color:l.col,fontWeight:600,marginBottom:3}}>{l.t}</div>
                  <p style={{margin:0,fontSize:12,color:MUTED,lineHeight:1.6}}>{l.d}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* applications */}
        <div style={{background:PAN,border:`1px solid ${BORDER}`,borderRadius:12,padding:18,marginBottom:24}}>
          <div style={{fontFamily:"monospace",fontSize:11,color:CYAN,marginBottom:14,textTransform:"uppercase",letterSpacing:1}}>Applications</div>
          <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(260px,1fr))",gap:12}}>
            {APPLICATIONS.map(a=>(
              <div key={a.t} style={{background:PAN2,border:`1px solid ${BORDER}`,borderRadius:10,padding:"12px 14px"}}>
                <div style={{fontSize:13,color:a.col,fontWeight:600,marginBottom:6}}>{a.t}</div>
                <p style={{margin:0,fontSize:12,color:MUTED,lineHeight:1.6}}>{a.d}</p>
              </div>
            ))}
          </div>
        </div>

        {/* prototype */}
        <div style={{background:PAN,border:`1px solid ${BORDER}`,borderRadius:12,padding:18,marginBottom:24}}>
          <div style={{fontFamily:"monospace",fontSize:11,color:VIOLET,marginBottom:6,textTransform:"uppercase",letterSpacing:1}}>Project AETHER · Claude-Integrated Bio-Computational Prototype</div>
          <p style={{margin:"0 0 14px",fontSize:13,color:MUTED,lineHeight:1.6}}>
            A prototype architecture coupling human core systems, a multi-species biomolecular ecosystem, and Claude-driven interpretation into a single real-time dashboard.
          </p>
          <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(240px,1fr))",gap:12,marginBottom:16}}>
            {PROTOTYPE.map(p=>(
              <div key={p.t} style={{background:PAN2,border:`1px solid ${BORDER}`,borderRadius:10,padding:"12px 14px"}}>
                <div style={{fontSize:13,color:p.col,fontWeight:600,marginBottom:6}}>{p.t}</div>
                <p style={{margin:0,fontSize:12,color:MUTED,lineHeight:1.6}}>{p.d}</p>
              </div>
            ))}
          </div>
          <div style={{background:PAN2,border:`1px solid ${BORDER}`,borderRadius:10,padding:"12px 14px",marginBottom:16}}>
            <div style={{fontFamily:"monospace",fontSize:11,color:GOLD,textTransform:"uppercase",letterSpacing:1,marginBottom:10}}>Revolutionary Features</div>
            <div style={{display:"flex",flexWrap:"wrap",gap:8}}>
              {REVOLUTIONARY.map(r=>(
                <span key={r} style={{fontFamily:"monospace",fontSize:11.5,color:TEXT,background:hexA(GREEN,0.1),border:`1px solid ${hexA(GREEN,0.35)}`,borderRadius:20,padding:"5px 12px"}}>{r}</span>
              ))}
            </div>
          </div>
          <div style={{fontFamily:"monospace",fontSize:11,color:BLUE,textTransform:"uppercase",letterSpacing:1,marginBottom:10}}>Roadmap · Observational First</div>
          <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(220px,1fr))",gap:12}}>
            {ROADMAP.map(r=>(
              <div key={r.t} style={{background:PAN2,border:`1px solid ${hexA(r.col,0.3)}`,borderRadius:10,padding:"12px 14px"}}>
                <div style={{fontSize:12.5,color:r.col,fontWeight:600,marginBottom:5}}>{r.t}</div>
                <p style={{margin:0,fontSize:11.5,color:MUTED,lineHeight:1.55}}>{r.d}</p>
              </div>
            ))}
          </div>
        </div>

        {/* reality check */}
        <div style={{background:PAN,border:`1px solid ${BORDER}`,borderRadius:12,padding:18,marginBottom:24}}>
          <div style={{fontFamily:"monospace",fontSize:11,color:GOLD,marginBottom:6,textTransform:"uppercase",letterSpacing:1}}>Reality Check · Wearable CBC</div>
          <p style={{margin:"0 0 14px",fontSize:13,color:MUTED,lineHeight:1.6}}>
            No full miniaturized complete-blood-count wearable has shipped. The closest breakthrough is MIT's CircTrek (April 2025) — a single-cell "wristwatch" using a laser-based 42 × 35 mm board to detect individual circulating cells through the skin. A realistic 2–3 year no-needle sensor stack combines three existing approaches.
          </p>
          <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(240px,1fr))",gap:12,marginBottom:16}}>
            {SENSOR_STACK.map(s=>(
              <div key={s.t} style={{background:PAN2,border:`1px solid ${BORDER}`,borderRadius:10,padding:"12px 14px"}}>
                <div style={{fontSize:13,color:s.col,fontWeight:600,marginBottom:6}}>{s.t}</div>
                <p style={{margin:0,fontSize:12,color:MUTED,lineHeight:1.6}}>{s.d}</p>
              </div>
            ))}
          </div>
          <div style={{fontFamily:"monospace",fontSize:11,color:RED,textTransform:"uppercase",letterSpacing:1,marginBottom:10}}>Three Gaps</div>
          <div style={{display:"flex",flexDirection:"column",gap:10}}>
            {GAPS.map(g=>(
              <div key={g.t} style={{background:PAN2,border:`1px solid ${hexA(g.col,0.3)}`,borderRadius:10,padding:"12px 14px"}}>
                <div style={{fontSize:13,color:g.col,fontWeight:600,marginBottom:4}}>{g.t}</div>
                <p style={{margin:0,fontSize:12,color:MUTED,lineHeight:1.6}}>{g.d}</p>
              </div>
            ))}
          </div>
        </div>

        {/* footer */}
        <div style={{display:"flex",flexWrap:"wrap",gap:14,paddingTop:20,borderTop:`1px solid ${BORDER}`,fontFamily:"monospace",fontSize:12}}>
          <Link href="/cuca-bioengine" style={{color:VIOLET,textDecoration:"none"}}>→ CUCA Bioengine</Link>
          <Link href="/regulatory-depth" style={{color:CYAN,textDecoration:"none"}}>→ Regulatory Depth</Link>
          <Link href="/nutritional-dna-key" style={{color:GREEN,textDecoration:"none"}}>→ Nutritional DNA Key</Link>
          <Link href="/graph-map" style={{color:MUTED,textDecoration:"none"}}>→ Knowledge Graph</Link>
        </div>
      </div>
    </div>
  );
}
