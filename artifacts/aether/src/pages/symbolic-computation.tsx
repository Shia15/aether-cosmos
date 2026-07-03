import { useState, useEffect, useRef } from "react";
import { Link } from "wouter";
import { Play, Pause, RotateCcw } from "lucide-react";

const BG="#04060d",PAN="#0a0d1a",PAN2="#0d1020",BORDER="#182038",TEXT="#b8cce8",MUTED="#5a6e8c";
const GOLD="#ffb830",CYAN="#3fd8d0",VIOLET="#a87aff",GREEN="#50d49a",BLUE="#4ab0ff";

function hexA(h:string,a:number){const n=h.replace("#","");return `rgba(${parseInt(n.slice(0,2),16)},${parseInt(n.slice(2,4),16)},${parseInt(n.slice(4,6),16)},${a})`;}

// ── animal symbols carried by the 14 pillars ─────────────────────────────────
type Animal={name:string;glyph:string};
const ANIMALS:Animal[]=[
  {name:"Snake",glyph:"S"},
  {name:"Fox",glyph:"Fx"},
  {name:"Bird",glyph:"Bd"},
  {name:"Boar",glyph:"Br"},
  {name:"Scorpion",glyph:"Sc"},
  {name:"Crane",glyph:"Cr"},
  {name:"Vulture",glyph:"Vu"},
  {name:"Aurochs",glyph:"Au"},
  {name:"Gazelle",glyph:"Gz"},
  {name:"Spider",glyph:"Sp"},
  {name:"Lizard",glyph:"Lz"},
  {name:"Duck",glyph:"Dk"},
  {name:"Leopard",glyph:"Lp"},
  {name:"Ibis",glyph:"Ib"},
];

// alignments the light oracle can strike as it sweeps the ring
const ALIGNMENTS=[
  "Solstice sunrise","Vulture Stone (Vega)","Sirius rising","Deneb / Cygnus",
  "Equinox shadow","Galactic centre","Orion belt","Pleiades cluster",
];

// ── seeded co-occurrence graph (nodes = animals, edges = proximity) ───────────
type Edge={a:number;b:number;w:number};
function buildEdges():Edge[]{
  const N=ANIMALS.length;
  const edges:Edge[]=[];
  // ring neighbours — the base relational structure
  for(let i=0;i<N;i++) edges.push({a:i,b:(i+1)%N,w:2});
  // seeded chords = semantic clusters / higher-order co-occurrence
  let s=1337;
  const rnd=()=>{s=(s*1103515245+12345)&0x7fffffff;return s/0x7fffffff;};
  for(let k=0;k<22;k++){
    const a=Math.floor(rnd()*N);
    let b=Math.floor(rnd()*N);
    if(b===a) b=(b+1)%N;
    if(edges.some(e=>(e.a===a&&e.b===b)||(e.a===b&&e.b===a))) continue;
    edges.push({a,b,w:1+Math.floor(rnd()*4)});
  }
  return edges.sort((x,y)=>y.w-x.w);
}

// ── LIVE SIM · Symbolic Computation Engine ───────────────────────────────────
function SymbolicEngine(){
  const cvRef=useRef<HTMLCanvasElement|null>(null);
  const pillarRef=useRef<HTMLSpanElement|null>(null);
  const symbolRef=useRef<HTMLSpanElement|null>(null);
  const alignRef=useRef<HTMLSpanElement|null>(null);
  const depthRef=useRef<HTMLSpanElement|null>(null);

  const [speed,setSpeed]=useState(1.0);
  const [density,setDensity]=useState(12);
  const [pathDepth,setPathDepth]=useState(5);
  const [playing,setPlaying]=useState(true);

  const speedR=useRef(speed),densityR=useRef(density),pathR=useRef(pathDepth),playR=useRef(playing);
  useEffect(()=>{speedR.current=speed;},[speed]);
  useEffect(()=>{densityR.current=density;},[density]);
  useEffect(()=>{pathR.current=pathDepth;},[pathDepth]);
  useEffect(()=>{playR.current=playing;},[playing]);

  const edgesR=useRef<Edge[]|null>(null);
  if(!edgesR.current) edgesR.current=buildEdges();

  useEffect(()=>{
    const cv=cvRef.current; if(!cv) return;
    const ctx=cv.getContext("2d"); if(!ctx) return;
    const reduced=typeof window!=="undefined"&&window.matchMedia
      ?window.matchMedia("(prefers-reduced-motion: reduce)").matches:false;
    let raf=0,lastW=0,t=0,last=performance.now();
    const N=ANIMALS.length;
    const edges=edgesR.current!;

    const loop=()=>{
      const now=performance.now();
      const dt=Math.min(0.05,(now-last)/1000); last=now;
      const dpr=Math.min(2,window.devicePixelRatio||1);
      const w=cv.clientWidth||640,h=440;
      if(w!==lastW){cv.width=Math.round(w*dpr);cv.height=Math.round(h*dpr);lastW=w;}
      ctx.setTransform(dpr,0,0,dpr,0,0);

      if(playR.current&&!reduced) t+=dt*speedR.current;
      const cx=w/2,cy=h/2;
      const R=Math.min(w,h)*0.34;

      ctx.fillStyle="#02030a"; ctx.fillRect(0,0,w,h);

      // faint concentric rings (the enclosure)
      ctx.strokeStyle=hexA(BORDER,0.9); ctx.lineWidth=1;
      [R*0.55,R,R*1.28].forEach(rr=>{ctx.beginPath();ctx.arc(cx,cy,rr,0,Math.PI*2);ctx.stroke();});

      // pillar / node positions on the ring
      const pos:{x:number;y:number;ang:number}[]=[];
      for(let i=0;i<N;i++){
        const ang=(i/N)*Math.PI*2-Math.PI/2;
        pos.push({x:cx+Math.cos(ang)*R,y:cy+Math.sin(ang)*R,ang});
      }

      // light oracle (sun) sweeps the ring
      const sunAng=t*0.6-Math.PI/2;
      // active pillar = nearest to the sun's angular position
      let active=0,bestD=1e9;
      for(let i=0;i<N;i++){
        let d=Math.abs(((pos[i].ang-sunAng)%(Math.PI*2)));
        d=Math.min(d,Math.PI*2-d);
        if(d<bestD){bestD=d;active=i;}
      }

      // build the active interpretation pathway by walking strongest edges
      const depth=pathR.current;
      const adj:Record<number,{n:number;w:number}[]>={};
      for(let i=0;i<N;i++) adj[i]=[];
      edges.forEach(e=>{adj[e.a].push({n:e.b,w:e.w});adj[e.b].push({n:e.a,w:e.w});});
      const path:number[]=[active]; const seen=new Set([active]);
      let cur=active;
      for(let s=0;s<depth;s++){
        const opts=adj[cur].filter(o=>!seen.has(o.n)).sort((p,q)=>q.w-p.w);
        if(!opts.length) break;
        cur=opts[0].n; path.push(cur); seen.add(cur);
      }
      const pathSet=new Set<string>();
      for(let i=0;i<path.length-1;i++){const a=path[i],b=path[i+1];pathSet.add(a<b?`${a}-${b}`:`${b}-${a}`);}

      // edges (breathing) — show the strongest `density` chords
      const shown=edges.slice(0,densityR.current);
      shown.forEach(e=>{
        const key=e.a<e.b?`${e.a}-${e.b}`:`${e.b}-${e.a}`;
        const onPath=pathSet.has(key);
        const breathe=0.18+0.12*Math.sin(t*1.6+e.a*0.7+e.b*0.3);
        ctx.strokeStyle=onPath?hexA(GOLD,0.85):hexA(CYAN,breathe*(0.4+e.w*0.12));
        ctx.lineWidth=onPath?2.4:1+e.w*0.25;
        ctx.beginPath(); ctx.moveTo(pos[e.a].x,pos[e.a].y); ctx.lineTo(pos[e.b].x,pos[e.b].y); ctx.stroke();
      });

      // pillars + glyph nodes
      for(let i=0;i<N;i++){
        const p=pos[i];
        const isActive=i===active;
        const onPath=seen.has(i);
        // T-shaped stone pillar, oriented radially
        ctx.save();
        ctx.translate(p.x,p.y);
        ctx.rotate(p.ang+Math.PI/2);
        const stoneCol=isActive?hexA(GOLD,0.9):onPath?hexA(VIOLET,0.55):hexA("#8595b0",0.35);
        ctx.fillStyle=stoneCol;
        ctx.fillRect(-4,-2,8,26);           // vertical shaft
        ctx.fillRect(-9,-8,18,7);           // T head
        ctx.restore();

        // glyph node
        const glow=isActive?14:onPath?7:2;
        const col=isActive?GOLD:onPath?VIOLET:CYAN;
        ctx.beginPath(); ctx.arc(p.x,p.y,isActive?13:10,0,Math.PI*2);
        ctx.fillStyle=hexA(col,isActive?0.32:0.16); ctx.fill();
        ctx.beginPath(); ctx.arc(p.x,p.y,isActive?9:7,0,Math.PI*2);
        ctx.fillStyle=hexA(PAN2,0.95); ctx.shadowBlur=glow; ctx.shadowColor=col; ctx.fill(); ctx.shadowBlur=0;
        ctx.lineWidth=1.4; ctx.strokeStyle=col; ctx.stroke();
        ctx.fillStyle=col; ctx.font="bold 8px monospace"; ctx.textAlign="center"; ctx.textBaseline="middle";
        ctx.fillText(ANIMALS[i].glyph,p.x,p.y);
        // outer label
        const lx=cx+Math.cos(p.ang)*(R+30),ly=cy+Math.sin(p.ang)*(R+30);
        ctx.fillStyle=isActive?GOLD:hexA(MUTED,0.9); ctx.font="9px monospace";
        ctx.fillText(ANIMALS[i].name,lx,ly);
      }

      // light oracle (sun) + its beam to the active pillar
      const sx=cx+Math.cos(sunAng)*R*1.42,sy=cy+Math.sin(sunAng)*R*1.42;
      ctx.strokeStyle=hexA(GOLD,0.35); ctx.lineWidth=2;
      ctx.beginPath(); ctx.moveTo(sx,sy); ctx.lineTo(pos[active].x,pos[active].y); ctx.stroke();
      const sg=ctx.createRadialGradient(sx,sy,0,sx,sy,26);
      sg.addColorStop(0,hexA(GOLD,0.95)); sg.addColorStop(1,"transparent");
      ctx.fillStyle=sg; ctx.beginPath(); ctx.arc(sx,sy,26,0,Math.PI*2); ctx.fill();
      ctx.fillStyle=GOLD; ctx.beginPath(); ctx.arc(sx,sy,7,0,Math.PI*2); ctx.fill();

      // central execution core glow
      const cg=ctx.createRadialGradient(cx,cy,0,cx,cy,R*0.5);
      cg.addColorStop(0,hexA(VIOLET,0.14)); cg.addColorStop(1,"transparent");
      ctx.fillStyle=cg; ctx.beginPath(); ctx.arc(cx,cy,R*0.5,0,Math.PI*2); ctx.fill();

      // readouts
      const alignIdx=Math.floor(((sunAng+Math.PI/2)/(Math.PI*2)*ALIGNMENTS.length)%ALIGNMENTS.length+ALIGNMENTS.length)%ALIGNMENTS.length;
      if(pillarRef.current) pillarRef.current.textContent="#"+(active+1);
      if(symbolRef.current) symbolRef.current.textContent=ANIMALS[active].name;
      if(alignRef.current) alignRef.current.textContent=ALIGNMENTS[alignIdx];
      if(depthRef.current) depthRef.current.textContent=String(path.length-1)+" hops";

      raf=requestAnimationFrame(loop);
    };
    raf=requestAnimationFrame(loop);
    return ()=>cancelAnimationFrame(raf);
  },[]);

  const readout=(label:string,ref:React.RefObject<HTMLSpanElement|null>,col:string)=>(
    <div style={{background:PAN2,border:`1px solid ${BORDER}`,borderRadius:10,padding:"10px 12px"}}>
      <div style={{fontFamily:"monospace",fontSize:10,color:col,textTransform:"uppercase",letterSpacing:1,marginBottom:4}}>{label}</div>
      <span ref={ref} style={{fontSize:14,color:TEXT,fontWeight:600}}>—</span>
    </div>
  );

  const slider=(label:string,val:number,min:number,max:number,step:number,set:(n:number)=>void,disp:string,col:string)=>(
    <div>
      <div style={{display:"flex",justifyContent:"space-between",fontFamily:"monospace",fontSize:11,color:MUTED,marginBottom:5}}>
        <span style={{color:col,textTransform:"uppercase",letterSpacing:1}}>{label}</span><span style={{color:TEXT}}>{disp}</span>
      </div>
      <input type="range" min={min} max={max} step={step} value={val} onChange={e=>set(parseFloat(e.target.value))}
        style={{width:"100%",accentColor:col}}/>
    </div>
  );

  return(
    <div>
      <canvas ref={cvRef} style={{width:"100%",height:440,display:"block",borderRadius:12,border:`1px solid ${BORDER}`,background:"#02030a"}}/>
      <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(150px,1fr))",gap:10,marginTop:12}}>
        {readout("Active Pillar",pillarRef,GOLD)}
        {readout("Active Symbol",symbolRef,VIOLET)}
        {readout("Current Alignment",alignRef,CYAN)}
        {readout("Pathway Length",depthRef,GREEN)}
      </div>
      <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(200px,1fr))",gap:16,marginTop:16}}>
        {slider("Sun Speed",speed,0,3,0.1,setSpeed,speed.toFixed(1)+"×",GOLD)}
        {slider("Connection Density",density,2,36,1,setDensity,String(density)+" edges",CYAN)}
        {slider("Pathway Depth",pathDepth,1,10,1,setPathDepth,String(pathDepth)+" steps",VIOLET)}
      </div>
      <div style={{display:"flex",justifyContent:"center",gap:12,marginTop:16}}>
        <button onClick={()=>setPlaying(p=>!p)}
          style={{display:"flex",alignItems:"center",gap:8,padding:"9px 18px",background:hexA(VIOLET,0.18),color:VIOLET,border:`1px solid ${hexA(VIOLET,0.4)}`,borderRadius:8,cursor:"pointer",fontFamily:"monospace",fontSize:12}}>
          {playing?<Pause size={16}/>:<Play size={16}/>}{playing?"Pause":"Play"}
        </button>
        <button onClick={()=>{setSpeed(1);setDensity(12);setPathDepth(5);setPlaying(true);}}
          style={{display:"flex",alignItems:"center",gap:8,padding:"9px 18px",background:PAN2,color:TEXT,border:`1px solid ${BORDER}`,borderRadius:8,cursor:"pointer",fontFamily:"monospace",fontSize:12}}>
          <RotateCcw size={16}/> Reset
        </button>
      </div>
    </div>
  );
}

// ── content data ─────────────────────────────────────────────────────────────
const ANOMALIES=[
  {t:"Monumental Architecture",d:"Large-scale coordinated construction predating agriculture — with no evidence of permanent settlement at the site.",col:GOLD},
  {t:"Repeated Animal Carvings",d:"Extensive, systematic reuse of symbolic animal motifs across pillars, structured rather than random.",col:CYAN},
  {t:"Circular Enclosures",d:"Structured spatial layouts with circular enclosures and radial pillar placement of varying orientation.",col:VIOLET},
  {t:"Intentional Burial",d:"The complex was deliberately buried around ~8000 BCE, sealing the system after ~1,500 years of active use.",col:GREEN},
];

const CHRONO=[
  {t:"~10,900 BCE · Younger Dryas",d:"Onset of the Younger Dryas impact hypothesis — abrupt climatic disruption lasting over a millennium sets the environmental context."},
  {t:"~9600 BCE · Construction",d:"Göbekli Tepe is built, exhibiting large-scale coordinated construction long before farming settlements."},
  {t:"~9600–8100 BCE · Active Use",d:"Roughly 1,500 years of continuous use, carving, and re-carving of the symbolic enclosures."},
  {t:"~8000 BCE · Burial",d:"The site is intentionally backfilled and buried, preserving its architecture for millennia."},
];

const SCH_MAP=[
  {el:"Animal Symbols",fn:"Encoded variables",col:CYAN},
  {el:"Pillars",fn:"Data structures / containers",col:VIOLET},
  {el:"Spatial Arrangement",fn:"Relational graph",col:GOLD},
  {el:"Repetition Frequency",fn:"Weight / importance",col:GREEN},
  {el:"Light & Shadow",fn:"Temporal execution layer",col:BLUE},
];

const GRAPH_PARTS=[
  {t:"Nodes",d:"Animal symbols — the discrete tokens of the system.",col:CYAN},
  {t:"Edges",d:"Co-occurrence or proximity between symbols on and across pillars.",col:VIOLET},
  {t:"Clusters",d:"Semantic groupings — animals that recur together form meaning families.",col:GOLD},
  {t:"Paths",d:"Sequential interpretation routes traced through the connected graph.",col:GREEN},
];

const FUNCTIONS=[
  {t:"Environmental Memory",d:"Tracking climate patterns and recording ecological cycles across generations.",col:GREEN},
  {t:"Event Encoding",d:"Preserving knowledge of rare or catastrophic events in durable symbolic form.",col:GOLD},
  {t:"Knowledge Transmission",d:"A non-verbal, spatial learning interface enabling intergenerational information persistence.",col:CYAN},
  {t:"Observational Computation",d:"A platform for interpreting relationships between sky, land, and life.",col:VIOLET},
];

const AETHER_MAP=[
  {c:"Mnēsis · Memory",g:"Stone carvings",col:CYAN},
  {c:"Aletheia · Logic",g:"Structural constraints",col:VIOLET},
  {c:"Infernia · Transformation",g:"Temporal / light interaction",col:GOLD},
  {c:"Reverie · Intuition",g:"Pattern interpretation",col:GREEN},
];

const LIMITS=[
  "No written records confirming intent",
  "Symbol interpretation remains inferential",
  "Celestial mapping theories are debated",
  "Risk of overfitting patterns onto the carvings",
];

const FUTURE=[
  "Graph modeling of symbol relationships",
  "Frequency analysis across enclosures",
  "Light / shadow simulation over time",
  "Cross-site symbolic comparison (Karahan Tepe)",
  "AI-assisted pattern detection",
];

const sectionLabel=(txt:string,col:string)=>(
  <div style={{fontFamily:"monospace",fontSize:11,color:col,marginBottom:14,textTransform:"uppercase",letterSpacing:1}}>{txt}</div>
);
const panel:React.CSSProperties={background:PAN,border:`1px solid ${BORDER}`,borderRadius:12,padding:18,marginBottom:24};
const subcard:React.CSSProperties={background:PAN2,border:`1px solid ${BORDER}`,borderRadius:10,padding:"12px 14px"};

export default function SymbolicComputationPage(){
  return(
    <div style={{minHeight:"100vh",background:BG,color:TEXT,padding:"40px 20px 80px",fontFamily:"'Inter',system-ui,sans-serif"}}>
      <div style={{maxWidth:1040,margin:"0 auto"}}>
        <div style={{fontFamily:"monospace",fontSize:11,color:MUTED,letterSpacing:2,textTransform:"uppercase",marginBottom:8}}>AETHER · Symbolic Computation Hypothesis</div>
        <h1 style={{fontSize:31,margin:"0 0 6px",fontWeight:700,background:`linear-gradient(90deg,${VIOLET},${CYAN},${BLUE})`,WebkitBackgroundClip:"text",backgroundClip:"text",color:"transparent"}}>
          Göbekli Tepe · Symbolic Computation Engine
        </h1>
        <p style={{fontFamily:"monospace",fontSize:12,color:MUTED,margin:"0 0 24px",maxWidth:780,lineHeight:1.6}}>
          Reinterpreting the Neolithic site (c. 9600–8200 BCE) as an analog, graph-based information processing system — not merely ritual, but architecture as algorithm.
        </p>

        {/* Abstract + thesis */}
        <div style={panel}>
          {sectionLabel("Abstract · The SCH Thesis",CYAN)}
          <p style={{margin:"0 0 12px",fontSize:13.5,color:TEXT,lineHeight:1.7}}>
            This paper proposes that Göbekli Tepe represents an early form of symbolic, spatial computation rather than purely ritualistic or artistic expression. By analyzing repeated animal motifs, pillar arrangements, and spatial constraints, we present a model in which the site functions as a graph-based encoding system capable of storing, transmitting, and possibly processing environmental and celestial information.
          </p>
          <p style={{margin:0,fontSize:13,color:MUTED,lineHeight:1.7}}>
            We introduce the <span style={{color:VIOLET}}>Symbolic Computation Hypothesis (SCH)</span>: that Göbekli Tepe operates as a non-digital, analog information system, where symbols (animals), structures (pillars), and environmental dynamics (light, shadow, and celestial alignment) collectively form a computational architecture.
          </p>
          <div style={{display:"flex",flexWrap:"wrap",gap:10,marginTop:14,fontFamily:"monospace",fontSize:11,color:MUTED}}>
            <span style={{padding:"5px 10px",background:PAN2,border:`1px solid ${BORDER}`,borderRadius:20}}>Stone = storage</span>
            <span style={{padding:"5px 10px",background:PAN2,border:`1px solid ${BORDER}`,borderRadius:20}}>Animals = variables</span>
            <span style={{padding:"5px 10px",background:PAN2,border:`1px solid ${BORDER}`,borderRadius:20}}>Space = structure</span>
            <span style={{padding:"5px 10px",background:PAN2,border:`1px solid ${BORDER}`,borderRadius:20}}>Light = execution</span>
            <span style={{padding:"5px 10px",background:PAN2,border:`1px solid ${BORDER}`,borderRadius:20}}>Time = iteration</span>
          </div>
        </div>

        {/* LIVE SIM */}
        <div style={panel}>
          {sectionLabel("Live Simulation · Symbolic Computation Engine",GOLD)}
          <p style={{margin:"0 0 14px",fontSize:12.5,color:MUTED,lineHeight:1.6}}>
            Fourteen pillars stand in a concentric enclosure, each carrying an animal-glyph node. Breathing edges connect co-occurring symbols into a relational graph. A rotating light oracle sweeps the ring — the pillar it illuminates activates, and an interpretation pathway lights up through its connected neighbours (temporal execution). Adjust the sun's speed, the connection density, and how deep the active pathway walks.
          </p>
          <SymbolicEngine/>
        </div>

        {/* Anomalies */}
        <div style={panel}>
          {sectionLabel("Anomalies · Why Ritual Alone Falls Short",VIOLET)}
          <p style={{margin:"0 0 14px",fontSize:12.5,color:MUTED,lineHeight:1.6}}>
            Göbekli Tepe challenges conventional assumptions by predating agriculture while exhibiting large-scale coordinated construction. Traditional ritual interpretations do not fully account for the systematic repetition, clustering, and constraint patterns observed in the carvings.
          </p>
          <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(230px,1fr))",gap:12}}>
            {ANOMALIES.map(a=>(
              <div key={a.t} style={subcard}>
                <div style={{fontSize:13,color:a.col,fontWeight:600,marginBottom:6}}>{a.t}</div>
                <p style={{margin:0,fontSize:12,color:MUTED,lineHeight:1.6}}>{a.d}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Chronology + context */}
        <div style={panel}>
          {sectionLabel("Chronology · Younger Dryas · Regional Network",GREEN)}
          {CHRONO.map((c,i)=>(
            <div key={c.t} style={{padding:"10px 12px",borderRadius:8,marginBottom:8,background:PAN2,border:`1px solid ${BORDER}`}}>
              <div style={{fontSize:12.5,fontWeight:600,color:i===3?GOLD:TEXT,marginBottom:3}}>{c.t}</div>
              <div style={{fontSize:11.5,color:MUTED,lineHeight:1.5}}>{c.d}</div>
            </div>
          ))}
          <p style={{margin:"6px 0 0",fontSize:12.5,color:MUTED,lineHeight:1.7}}>
            Nearby sites such as <span style={{color:CYAN}}>Karahan Tepe</span> exhibit similar pillars, motifs, and symbolic structures — suggesting a distributed symbolic system rather than an isolated construction. The observational record shows roughly 50+ distinct animal forms, with high-frequency recurrence of specific animals (snakes, foxes, birds), consistent co-occurrence of certain pairs, and mutual exclusion of others.
          </p>
        </div>

        {/* SCH mapping table */}
        <div style={panel}>
          {sectionLabel("SCH Mapping · Element → Function",GOLD)}
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:0,border:`1px solid ${BORDER}`,borderRadius:10,overflow:"hidden"}}>
            <div style={{padding:"10px 14px",background:PAN2,fontFamily:"monospace",fontSize:11,color:MUTED,textTransform:"uppercase",letterSpacing:1}}>Element</div>
            <div style={{padding:"10px 14px",background:PAN2,fontFamily:"monospace",fontSize:11,color:MUTED,textTransform:"uppercase",letterSpacing:1}}>Function</div>
            {SCH_MAP.map(r=>(
              <div key={r.el} style={{display:"contents"}}>
                <div style={{padding:"11px 14px",borderTop:`1px solid ${BORDER}`,fontSize:13,color:r.col,fontWeight:600}}>{r.el}</div>
                <div style={{padding:"11px 14px",borderTop:`1px solid ${BORDER}`,fontSize:13,color:TEXT}}>{r.fn}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Graph-theoretic interpretation */}
        <div style={panel}>
          {sectionLabel("Graph-Theoretic Interpretation",CYAN)}
          <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(220px,1fr))",gap:12,marginBottom:14}}>
            {GRAPH_PARTS.map(g=>(
              <div key={g.t} style={subcard}>
                <div style={{fontSize:13,color:g.col,fontWeight:600,marginBottom:6}}>{g.t}</div>
                <p style={{margin:0,fontSize:12,color:MUTED,lineHeight:1.6}}>{g.d}</p>
              </div>
            ))}
          </div>
          <p style={{margin:0,fontSize:12.5,color:MUTED,lineHeight:1.7}}>
            Modeled this way, the site supports <span style={{color:TEXT}}>pattern recognition</span>, <span style={{color:TEXT}}>sequence encoding</span>, and <span style={{color:TEXT}}>constraint-based relationships</span> — the primitives of a computational system expressed in stone and symbol.
          </p>
        </div>

        {/* Temporal + celestial */}
        <div style={panel}>
          {sectionLabel("Temporal Computation & Celestial Mapping",BLUE)}
          <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(280px,1fr))",gap:12}}>
            <div style={subcard}>
              <div style={{fontSize:13,color:GOLD,fontWeight:600,marginBottom:6}}>Temporal Execution Layer</div>
              <p style={{margin:0,fontSize:12,color:MUTED,lineHeight:1.6}}>
                Solar movement, shadow projection, and seasonal variation form a dynamic layer where meaning changes over time — a primitive form of analog computation. Shadows crossing the pillars activate different symbolic paths as the year turns.
              </p>
            </div>
            <div style={subcard}>
              <div style={{fontSize:13,color:VIOLET,fontWeight:600,marginBottom:6}}>Celestial Mapping</div>
              <p style={{margin:0,fontSize:12,color:MUTED,lineHeight:1.6}}>
                Interpretations such as the Vulture Stone star-map extend the graph into a sky-ground mapping system — projecting animal nodes onto constellations, encoding temporal or catastrophic events, and providing a cosmic reference framework.
              </p>
            </div>
          </div>
        </div>

        {/* System function hypotheses */}
        <div style={panel}>
          {sectionLabel("System Function Hypotheses · Embodied Computation",GREEN)}
          <p style={{margin:"0 0 14px",fontSize:12.5,color:MUTED,lineHeight:1.6}}>
            Göbekli Tepe may be an early example of embodied, analog computation — where computation occurs through interaction with space, meaning emerges through movement and observation, and time is integrated via environmental change.
          </p>
          <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(230px,1fr))",gap:12}}>
            {FUNCTIONS.map(f=>(
              <div key={f.t} style={subcard}>
                <div style={{fontSize:13,color:f.col,fontWeight:600,marginBottom:6}}>{f.t}</div>
                <p style={{margin:0,fontSize:12,color:MUTED,lineHeight:1.6}}>{f.d}</p>
              </div>
            ))}
          </div>
        </div>

        {/* AETHER integration table */}
        <div style={panel}>
          {sectionLabel("Integration with AETHER Architecture",VIOLET)}
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:0,border:`1px solid ${BORDER}`,borderRadius:10,overflow:"hidden"}}>
            <div style={{padding:"10px 14px",background:PAN2,fontFamily:"monospace",fontSize:11,color:MUTED,textTransform:"uppercase",letterSpacing:1}}>AETHER Component</div>
            <div style={{padding:"10px 14px",background:PAN2,fontFamily:"monospace",fontSize:11,color:MUTED,textTransform:"uppercase",letterSpacing:1}}>Göbekli Equivalent</div>
            {AETHER_MAP.map(r=>(
              <div key={r.c} style={{display:"contents"}}>
                <div style={{padding:"11px 14px",borderTop:`1px solid ${BORDER}`,fontSize:13,color:r.col,fontWeight:600}}>{r.c}</div>
                <div style={{padding:"11px 14px",borderTop:`1px solid ${BORDER}`,fontSize:13,color:TEXT}}>{r.g}</div>
              </div>
            ))}
          </div>
          <p style={{margin:"12px 0 0",fontSize:12.5,color:MUTED,lineHeight:1.7}}>
            Insight: SCH is not only archaeological — it is architectural and computational, paralleling emerging paradigms in spatial computing, graph-based AI, embodied intelligence, and transparent "glass box" computation that prize interpretability, relational structure, and observable processes.
          </p>
        </div>

        {/* Limitations + future */}
        <div style={panel}>
          {sectionLabel("Limitations & Future Research · A Testable Hypothesis",GOLD)}
          <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(280px,1fr))",gap:14}}>
            <div style={subcard}>
              <div style={{fontSize:13,color:GOLD,fontWeight:600,marginBottom:8}}>Scientific Caution</div>
              {LIMITS.map(l=>(
                <div key={l} style={{fontSize:12,color:MUTED,lineHeight:1.6,marginBottom:5,paddingLeft:14,position:"relative"}}>
                  <span style={{position:"absolute",left:0,color:GOLD}}>−</span>{l}
                </div>
              ))}
              <p style={{margin:"8px 0 0",fontSize:11.5,color:TEXT,lineHeight:1.6,fontStyle:"italic"}}>
                This framework should be treated as a testable hypothesis, not a confirmed conclusion.
              </p>
            </div>
            <div style={subcard}>
              <div style={{fontSize:13,color:CYAN,fontWeight:600,marginBottom:8}}>Future Directions</div>
              {FUTURE.map(f=>(
                <div key={f} style={{fontSize:12,color:MUTED,lineHeight:1.6,marginBottom:5,paddingLeft:14,position:"relative"}}>
                  <span style={{position:"absolute",left:0,color:CYAN}}>→</span>{f}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Closing */}
        <div style={{...panel,background:`linear-gradient(135deg,${hexA(VIOLET,0.1)},${hexA(CYAN,0.05)})`}}>
          {sectionLabel("Conclusion",CYAN)}
          <p style={{margin:"0 0 12px",fontSize:13,color:TEXT,lineHeight:1.7}}>
            Göbekli Tepe may represent a fundamentally different paradigm of intelligence — not abstracted into text or numbers, but embedded into space, symbol, and time. Human systems of structured knowledge did not begin with writing, but with relational, spatial encoding architectures.
          </p>
          <p style={{margin:0,fontSize:15,color:VIOLET,lineHeight:1.6,fontWeight:600}}>
            "We are not witnessing the origin of intelligence systems. We are witnessing their rediscovery in a different medium."
          </p>
        </div>

        {/* footer */}
        <div style={{display:"flex",flexWrap:"wrap",gap:14,paddingTop:20,borderTop:`1px solid ${BORDER}`,fontFamily:"monospace",fontSize:12}}>
          <Link href="/gobekli-plasma" style={{color:VIOLET,textDecoration:"none"}}>→ Göbekli Plasma</Link>
          <Link href="/symbolic-pillars" style={{color:CYAN,textDecoration:"none"}}>→ Symbolic Pillars</Link>
          <Link href="/gobekli-tepe" style={{color:GOLD,textDecoration:"none"}}>→ Göbekli Tepe</Link>
          <Link href="/" style={{color:MUTED,textDecoration:"none"}}>→ Knowledge Graph</Link>
        </div>
      </div>
    </div>
  );
}
