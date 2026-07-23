import { useState, useRef, useEffect, useCallback } from "react";
const imgGutBrain = "/api/storage/public-objects/770EA1EA-DBF1-41FD-93A6-A8742013520F_1782484195842.png";
const BG    = "#020810";
const PNL   = "#071220";
const PNL2  = "#0a1628";
const BDR   = "rgba(26,58,107,0.25)";
const BGLOW = "rgba(46,109,164,0.35)";
const TP    = "#e8f0fa";
const TS    = "#8ba8cc";
const TD    = "#4a6080";
const TEAL  = "#1fd4c8";
const GOLD  = "#c9a84c";
const VIO   = "#8b5cf6";
const ORA   = "#f97316";
const GRN   = "#22c55e";
const BLU   = "#4a9fd4";
const ROSE  = "#f472b6";
const AMB   = "#e8a030";

const MONO  = "'Space Mono',monospace";
const SERIF = "'Crimson Pro',serif";
const DISP  = "'Cinzel',serif";
const ORBI  = "'Orbitron',sans-serif";

const PHI_INV = 1 / 1.6180339887;

const TABS = [
  { id:"brain",     label:"Brain Metabolism",  col:BLU  },
  { id:"gut",       label:"Gut-Brain Axis",    col:GRN  },
  { id:"living",    label:"Living Nutrition",  col:TEAL },
  { id:"substrate", label:"Food Substrate",    col:VIO  },
  { id:"health",    label:"AETHER Health",     col:GOLD },
];

/* ── BRAIN METABOLISM CANVAS ──────────────────────────────── */
function BrainMetCanvas() {
  const ref = useRef<HTMLCanvasElement>(null);
  const raf = useRef(0);
  useEffect(() => {
    const cv = ref.current; if (!cv) return;
    const ctx = cv.getContext("2d")!;
    cv.width = 860; cv.height = 230;
    const W = cv.width, H = cv.height, cx = W/2, cy = H/2;
    const nodes = [
      { label:"GLUCOSE\nINTAKE", col:"#60a5fa", angle:-Math.PI/2,               r:100 },
      { label:"ATP\nSYNTH",      col:"#fcd34d", angle:-Math.PI/2+Math.PI*2/5,   r:100 },
      { label:"NEURO\nTRANS",    col:"#a78bfa", angle:-Math.PI/2+Math.PI*4/5,   r:100 },
      { label:"MYELIN\nREPAIR",  col:"#34d399", angle:-Math.PI/2+Math.PI*6/5,   r:100 },
      { label:"COHERE\nFIELD",   col:TEAL,      angle:-Math.PI/2+Math.PI*8/5,   r:100 },
    ];
    let t = 0;
    const draw = () => {
      ctx.fillStyle = "rgba(2,8,16,0.18)"; ctx.fillRect(0,0,W,H); t++;
      nodes.forEach((s,i) => {
        const a = nodes[(i+1)%nodes.length];
        const sx=cx+Math.cos(s.angle)*s.r, sy=cy+Math.sin(s.angle)*s.r;
        const ax=cx+Math.cos(a.angle)*a.r, ay=cy+Math.sin(a.angle)*a.r;
        const pkt=(t*0.01+i*0.4)%1, px=sx+(ax-sx)*pkt, py=sy+(ay-sy)*pkt;
        const g=ctx.createLinearGradient(sx,sy,ax,ay);
        g.addColorStop(0,s.col+"44"); g.addColorStop(1,a.col+"44");
        ctx.beginPath(); ctx.moveTo(sx,sy); ctx.lineTo(ax,ay);
        ctx.strokeStyle=g; ctx.lineWidth=1; ctx.stroke();
        ctx.beginPath(); ctx.arc(px,py,2.5,0,Math.PI*2);
        ctx.fillStyle="#fff"; ctx.shadowColor="#fff"; ctx.shadowBlur=7; ctx.fill(); ctx.shadowBlur=0;
      });
      nodes.forEach((s,i) => {
        const dx=cx+Math.cos(s.angle)*s.r, dy=cy+Math.sin(s.angle)*s.r;
        const pulse=1+0.1*Math.sin(t*0.04+i*1.25);
        const g2=ctx.createRadialGradient(dx,dy,0,dx,dy,16*pulse);
        g2.addColorStop(0,s.col+"cc"); g2.addColorStop(0.5,s.col+"33"); g2.addColorStop(1,"transparent");
        ctx.beginPath(); ctx.arc(dx,dy,14*pulse,0,Math.PI*2);
        ctx.fillStyle=g2; ctx.shadowColor=s.col; ctx.shadowBlur=16*pulse; ctx.fill(); ctx.shadowBlur=0;
        ctx.strokeStyle=s.col; ctx.lineWidth=1.5; ctx.stroke();
        ctx.fillStyle=s.col; ctx.font=`bold 7px ${MONO}`; ctx.textAlign="center";
        s.label.split("\n").forEach((ln,li)=>ctx.fillText(ln,dx,dy+18*pulse+li*9));
      });
      ctx.beginPath(); ctx.arc(cx,cy,14+2*Math.sin(t*0.05),0,Math.PI*2);
      const gc=ctx.createRadialGradient(cx,cy,0,cx,cy,16);
      gc.addColorStop(0,BLU+"cc"); gc.addColorStop(1,"transparent");
      ctx.fillStyle=gc; ctx.shadowColor=BLU; ctx.shadowBlur=20; ctx.fill(); ctx.shadowBlur=0;
      raf.current=requestAnimationFrame(draw);
    };
    draw(); return ()=>cancelAnimationFrame(raf.current);
  },[]);
  return <canvas ref={ref} style={{width:"100%",height:"auto",borderRadius:6,display:"block"}} />;
}

/* ── GUT-BRAIN CANVAS ─────────────────────────────────────── */
const PW_COLS = [TEAL,BLU,ROSE,GOLD];
function GutBrainCanvas({ pw }:{ pw:number }) {
  const ref = useRef<HTMLCanvasElement>(null);
  const raf = useRef(0);
  const pwRef = useRef(pw);
  useEffect(()=>{pwRef.current=pw;},[pw]);
  useEffect(()=>{
    const cv=ref.current; if(!cv) return;
    const ctx=cv.getContext("2d")!;
    const W=cv.width, H=cv.height;
    let t=0;
    const packs: number[]=[];
    for(let i=0;i<24;i++) packs.push(i/24);
    const mrng=((s:number)=>{let r=s;return()=>{r=(r*16807)%2147483647;return(r-1)/2147483646;};})(1111);
    const microbes: number[]=[];
    for(let i=0;i<12;i++){microbes.push(mrng()*Math.PI*2, mrng()*0.75);}
    function nervePt(s:number):[number,number]{
      return[190+s*(W-380), H*0.48+26*Math.sin(s*Math.PI*2.5+t*0.4)];
    }
    function draw(){
      ctx.clearRect(0,0,W,H); ctx.fillStyle="#010308"; ctx.fillRect(0,0,W,H);
      const col=PW_COLS[pwRef.current];
      const GX=100,GY=H*0.5,GR=55,BX=W-100,BY=H*0.5,BR=48;
      for(let i=3;i>=0;i--){ctx.beginPath();ctx.arc(GX,GY,GR-i*12,0,Math.PI*2);ctx.strokeStyle=GRN+["88","55","33","18"][i];ctx.lineWidth=2;ctx.stroke();}
      for(let i=0;i<12;i++){
        const ang=microbes[i*2],d=microbes[i*2+1]*GR*0.7,mx=GX+d*Math.cos(ang),my=GY+d*Math.sin(ang);
        const p=0.4+0.6*Math.abs(Math.sin(t*2.5+i*0.8));
        if(!isFinite(mx)||!isFinite(my)) continue;
        ctx.beginPath();ctx.arc(mx,my,2+p,0,Math.PI*2);ctx.fillStyle=GRN+Math.round((120+p*120)).toString(16).padStart(2,"0");ctx.fill();
      }
      ctx.fillStyle=GRN;ctx.font=`8px ${MONO}`;ctx.textAlign="center";ctx.fillText("GUT MICROBIOME",GX,GY+GR+14);
      ctx.fillStyle=TP+"44";ctx.font=`7px ${MONO}`;ctx.fillText("90% SEROTONIN",GX,GY+GR+24);
      const bg=ctx.createRadialGradient(BX,BY,0,BX,BY,BR);
      bg.addColorStop(0,BLU+"33");bg.addColorStop(1,BLU+"08");
      ctx.beginPath();ctx.arc(BX,BY,BR,0,Math.PI*2);ctx.fillStyle=bg;ctx.fill();
      ctx.strokeStyle=BLU+"66";ctx.lineWidth=1;ctx.stroke();
      ctx.fillStyle=BLU;ctx.font=`8px ${MONO}`;ctx.textAlign="center";ctx.fillText("BRAIN",BX,BY+BR+14);
      ctx.beginPath();
      for(let i=0;i<=80;i++){const[x,y]=nervePt(i/80);i===0?ctx.moveTo(x,y):ctx.lineTo(x,y);}
      ctx.strokeStyle=col+"44";ctx.lineWidth=2.5;ctx.stroke();
      for(let i=0;i<24;i++){
        packs[i]=(packs[i]+0.003)%1;
        const[sx,sy]=nervePt(packs[i]);
        if(!isFinite(sx)||!isFinite(sy)) continue;
        const bright=0.5+0.5*Math.sin(t*4+i*0.6);
        ctx.beginPath();ctx.arc(sx,sy,2.5,0,Math.PI*2);
        ctx.fillStyle=col+Math.round(120+bright*120).toString(16).padStart(2,"0");ctx.fill();
      }
      ctx.fillStyle=col+"AA";ctx.font=`9px ${MONO}`;ctx.textAlign="center";
      ctx.fillText(["NEURAL · VAGUS","ENDOCRINE · HORMONES","IMMUNE · CYTOKINES","METABOLIC · SCFAs"][pwRef.current],W/2,H-10);
      t+=0.012; raf.current=requestAnimationFrame(draw);
    }
    draw(); return()=>cancelAnimationFrame(raf.current);
  },[]);
  return <canvas ref={ref} width={720} height={200} style={{width:"100%",height:200,display:"block",borderRadius:4}} />;
}

/* ── FOOD ORBITAL CANVAS ──────────────────────────────────── */
const FOODS=[
  {id:"leaf",  name:"Leafy Greens",   col:GRN,  coherence:0.91, biolum:0.78},
  {id:"fungi", name:"Fungi",          col:VIO,  coherence:0.96, biolum:0.95},
  {id:"fruit", name:"Fruits/Berries", col:ROSE, coherence:0.88, biolum:0.68},
  {id:"grain", name:"Grains/Seeds",   col:GOLD, coherence:0.82, biolum:0.40},
  {id:"prot",  name:"Proteins",       col:BLU,  coherence:0.85, biolum:0.50},
  {id:"sea",   name:"Sea Veg/Algae",  col:TEAL, coherence:0.79, biolum:0.62},
  {id:"root",  name:"Root Veg",       col:AMB,  coherence:0.74, biolum:0.30},
  {id:"min",   name:"Minerals",       col:TS,   coherence:0.69, biolum:0.22},
];
function FoodOrbitalCanvas({ phase }:{ phase:number }) {
  const cvs=useRef<HTMLCanvasElement>(null);
  const raf=useRef(0);
  const phRef=useRef(phase);
  useEffect(()=>{phRef.current=phase;},[phase]);
  useEffect(()=>{
    const cv=cvs.current;if(!cv)return;
    const ctx=cv.getContext("2d")!;
    const resize=()=>{cv.width=cv.parentElement!.clientWidth||700;cv.height=300;};
    resize(); window.addEventListener("resize",resize);
    const parts=FOODS.map((f,fi)=>Array.from({length:16},(_, pi)=>({
      food:fi,angle:(pi/16)*Math.PI*2+fi*(Math.PI*2/FOODS.length),
      r:70+fi*18,speed:0.004+fi*0.0008,size:2.5+f.biolum*2.5,
      phase:pi%4,pulse:Math.random()*Math.PI*2,
    }))).flat();
    let tick=0;
    const draw=()=>{
      tick++;
      const W=cv.width,H=cv.height,cx=W/2,cy=H/2,t=tick*0.01;
      ctx.clearRect(0,0,W,H);ctx.fillStyle="#010810";ctx.fillRect(0,0,W,H);
      const cVal=FOODS.reduce((s,f)=>s+f.coherence,0)/FOODS.length;
      const pulse=0.6+0.4*Math.sin(t*PHI_INV*2);
      const cg=ctx.createRadialGradient(cx,cy,0,cx,cy,50);
      cg.addColorStop(0,`rgba(200,168,76,${0.18*pulse})`);cg.addColorStop(1,"transparent");
      ctx.fillStyle=cg;ctx.fillRect(0,0,W,H);
      ctx.font=`9px ${MONO}`;ctx.textAlign="center";
      ctx.fillStyle=`rgba(200,168,76,${0.7*pulse})`;ctx.fillText(`C(x,t) = ${(cVal*pulse).toFixed(3)}`,cx,cy+4);
      ctx.font=`7px ${MONO}`;ctx.fillStyle=GOLD+"40";ctx.fillText(`phi-1 = ${PHI_INV.toFixed(4)}`,cx,cy+16);
      parts.forEach(p=>{
        const f=FOODS[p.food];
        let orbitR=p.r;
        if(phRef.current<4&&p.phase===phRef.current)orbitR=p.r*0.55+18;
        p.angle+=p.speed*(phRef.current<4&&p.phase===phRef.current?1.5:1);
        const px=cx+orbitR*Math.cos(p.angle+t*0.3);
        const py=cy+orbitR*Math.sin(p.angle+t*0.15);
        const bio=0.4+0.6*Math.abs(Math.sin(t*1.618+p.pulse));
        const alpha=(phRef.current===4||p.phase===phRef.current)?bio:0.18;
        if(f.biolum>0.5&&alpha>0.3){
          const hg=ctx.createRadialGradient(px,py,0,px,py,p.size*4);
          hg.addColorStop(0,f.col+Math.floor(alpha*60).toString(16).padStart(2,"0"));hg.addColorStop(1,"transparent");
          ctx.fillStyle=hg;ctx.fillRect(px-p.size*4,py-p.size*4,p.size*8,p.size*8);
        }
        ctx.beginPath();ctx.arc(px,py,p.size*(phRef.current<4&&p.phase===phRef.current?1.4:1),0,Math.PI*2);
        ctx.fillStyle=f.col+Math.floor(alpha*255).toString(16).padStart(2,"0");ctx.fill();
      });
      FOODS.forEach((f,fi)=>{
        const la=(fi/FOODS.length)*Math.PI*2+t*0.05;
        const lr=160+fi*6;
        if(lr<Math.min(W,H)*0.48){
          const lx=cx+lr*Math.cos(la),ly=cy+lr*Math.sin(la);
          ctx.font=`6px ${MONO}`;ctx.textAlign="center";ctx.fillStyle=f.col+"70";
          ctx.fillText(f.name.split(" ")[0],lx,ly);
        }
      });
      raf.current=requestAnimationFrame(draw);
    };
    raf.current=requestAnimationFrame(draw);
    return()=>{cancelAnimationFrame(raf.current);window.removeEventListener("resize",resize);};
  },[]);
  return <canvas ref={cvs} style={{width:"100%",display:"block",borderRadius:6,border:`1px solid ${VIO}20`}} />;
}

/* ── SIMPLE COHERENCE GRID ────────────────────────────────── */
const GW=40,GH=24,CS=8;
function initGrid(){return Array.from({length:GH},()=>Array.from({length:GW},()=>({c:Math.random()*0.3,n:Math.random()*0.15,g:0,b:Math.random()*0.2})));}
function GridCanvas(){
  const cvs=useRef<HTMLCanvasElement>(null);
  const grid=useRef(initGrid());
  const raf=useRef(0);
  const tick=useRef(0);
  const [running,setRunning]=useState(false);
  const draw=useCallback(()=>{
    const cv=cvs.current;if(!cv)return;
    const ctx=cv.getContext("2d")!;
    const g=grid.current;
    for(let y=0;y<GH;y++)for(let x=0;x<GW;x++){
      const cell=g[y][x];
      const r=Math.floor(cell.c*26+8),gr=Math.floor(cell.c*190+20),b2=Math.floor((1-cell.c)*150+40);
      ctx.fillStyle=cell.g>0.5?`rgba(255,220,60,${cell.g})`:`rgb(${r},${gr},${b2})`;
      ctx.fillRect(x*CS,y*CS,CS,CS);
    }
  },[]);
  const step=useCallback(()=>{
    const t=tick.current++;
    const next=grid.current.map(r=>r.map(c=>({...c})));
    for(let y=0;y<GH;y++)for(let x=0;x<GW;x++){
      const cell=grid.current[y][x];
      const pm=0.5+0.5*Math.sin(t*PHI_INV*0.3+(x*y)/(GW*GH*1.618));
      let n=Math.min(1,cell.n+0.02*pm+0.1*(0-cell.n)*0.01);
      let c=Math.max(0,Math.min(1,1-Math.abs(n-PHI_INV)/PHI_INV));
      let g=cell.g;if(c>0.6)g=Math.min(1,g+0.012);
      let b2=Math.min(1,cell.b+(c>PHI_INV?0.015*pm:-0.008));
      next[y][x]={c,n,g,b:b2};
    }
    grid.current=next;draw();
  },[draw]);
  useEffect(()=>{
    if(running){const loop=()=>{step();raf.current=requestAnimationFrame(loop);};raf.current=requestAnimationFrame(loop);}
    else cancelAnimationFrame(raf.current);
    return()=>cancelAnimationFrame(raf.current);
  },[running,step]);
  useEffect(()=>{draw();},[draw]);
  return(
    <div style={{display:"flex",gap:16,flexWrap:"wrap"}}>
      <div>
        <canvas ref={cvs} width={GW*CS} height={GH*CS} style={{display:"block",border:`1px solid ${VIO}30`,borderRadius:6}}/>
        <div style={{display:"flex",gap:6,marginTop:8}}>
          <button onClick={()=>setRunning(r=>!r)} style={{padding:"6px 16px",fontFamily:MONO,fontSize:10,cursor:"pointer",background:running?"#0a1820":GRN,color:running?GRN:"#020408",border:`1px solid ${GRN}40`,borderRadius:4}}>{running?"PAUSE":"RUN GROWTH"}</button>
          <button onClick={()=>{setRunning(false);cancelAnimationFrame(raf.current);tick.current=0;grid.current=initGrid();setTimeout(draw,50);}} style={{padding:"6px 10px",fontFamily:MONO,fontSize:10,cursor:"pointer",background:"transparent",color:TD,border:`1px solid ${TD}30`,borderRadius:4}}>RESET</button>
        </div>
      </div>
      <div style={{flex:1,minWidth:180,fontFamily:MONO,fontSize:10,color:TD,lineHeight:2}}>
        <div style={{color:TEAL}}>C(x,t) = 1 - ||epsilon|| / ||S*||</div>
        <div>epsilon = |nutrition - phi-1|</div>
        <div>S* = living seed max coherence</div>
        <div style={{marginTop:8,color:GOLD}}>Gold flash = phi-burst growth event</div>
        <div style={{color:GRN}}>Green = high coherence zone</div>
        <div style={{color:VIO}}>Rows = life stages · Cols = substrates</div>
      </div>
    </div>
  );
}

/* ── SHARED HELPERS ───────────────────────────────────────── */
function Pill({label,col}:{label:string;col:string}){
  return <span style={{fontFamily:MONO,fontSize:9,padding:"3px 9px",borderRadius:3,background:col+"18",color:col,border:`1px solid ${col}33`,letterSpacing:"0.1em",display:"inline-block",margin:"0 4px 4px 0"}}>{label}</span>;
}
function SecLabel({txt,col}:{txt:string;col:string}){
  return <div style={{fontFamily:MONO,fontSize:9,letterSpacing:"0.3em",color:col,textTransform:"uppercase",marginBottom:12,marginTop:36,opacity:0.85}}>{txt}</div>;
}
function Grid2({children}:{children:React.ReactNode}){return<div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(260px,1fr))",gap:14,marginBottom:24}}>{children}</div>;}
function MiniCard({title,body,col}:{title:string;body:string;col:string}){
  return<div style={{background:PNL,border:`1px solid ${col}33`,borderRadius:6,padding:"16px 18px",position:"relative",overflow:"hidden"}}>
    <div style={{position:"absolute",top:0,left:0,width:3,height:"100%",background:col,opacity:0.7}}/>
    <div style={{fontFamily:ORBI,fontSize:12,color:col,marginBottom:8}}>{title}</div>
    <div style={{fontFamily:SERIF,fontSize:13,color:TS,lineHeight:1.7}}>{body}</div>
  </div>;
}

/* ── TAB PANELS ───────────────────────────────────────────── */
function BrainTab(){
  return<div>
    <div style={{background:PNL2,border:`1px solid ${BLU}22`,borderRadius:6,overflow:"hidden",marginBottom:24}}>
      <div style={{padding:"10px 16px",borderBottom:`1px solid ${BDR}`,fontFamily:MONO,fontSize:9,color:BLU,letterSpacing:"0.2em"}}>BRAIN METABOLISM ENGINE · 5-NODE PENTAGONAL FLOW</div>
      <div style={{padding:16}}><BrainMetCanvas/></div>
    </div>
    <SecLabel txt="The Three Core Genes" col={BLU}/>
    <Grid2>
      {[
        {tag:"FTO",role:"Reward Modulator",desc:"Governs dopamine reward pathway sensitivity and hunger signaling. When dysregulated, shifts behavior toward hedonic eating -- pleasure seeking rather than metabolic need.",col:AMB},
        {tag:"MC4R",role:"Satiety Switch",desc:"Master regulator of satiety signaling in the hypothalamus. Mutations silence the neural signal communicating fullness -- not a failure of fat storage.",col:TEAL},
        {tag:"BDNF",role:"Plasticity Engine",desc:"Sustains neuronal health and synaptic plasticity. The hinge gene: connecting metabolic regulation to immune defense and Alzheimer's amyloid response.",col:GRN},
      ].map(g=><MiniCard key={g.tag} title={`${g.tag} · ${g.role}`} body={g.desc} col={g.col}/>)}
    </Grid2>
    <SecLabel txt="Four Nutritional Inputs to Brain Biochemistry" col={GRN}/>
    <Grid2>
      {[
        {icon:"🌿",name:"Glucose Stabilization",desc:"Root vegetables provide slow-release carbs maintaining the continuous glucose supply hypothalamic neurons require. Targets the MC4R satiety pathway.",col:TEAL},
        {icon:"⚗️",name:"Microbiome Signaling",desc:"Prebiotic fibers feed colonic bacteria producing SCFAs. SCFAs signal via vagal afferents to the hypothalamus, reinforcing satiety pathways and immune tone.",col:VIO},
        {icon:"🫐",name:"Neuroplasticity Support",desc:"Flavonoids from cacao and berries are associated with BDNF upregulation -- supporting hippocampal neuroplasticity and neuroprotection.",col:ROSE},
        {icon:"🔥",name:"Anti-Inflammatory Load",desc:"Polyphenols from turmeric (curcuminoids), olive oil (oleocanthal), and green tea (EGCG) modulate NF-kB signaling, keeping brain immune tone calm.",col:GOLD},
      ].map(it=><MiniCard key={it.name} title={`${it.icon} ${it.name}`} body={it.desc} col={it.col}/>)}
    </Grid2>
    <div style={{background:`${BLU}08`,borderLeft:`3px solid ${BLU}`,padding:"16px 22px",borderRadius:"0 6px 6px 0",fontFamily:SERIF,fontSize:15,color:TS,lineHeight:1.75,fontStyle:"italic"}}>
      "Weight gain is what happens when the brain loses the ability to accurately regulate appetite -- not a primary failure of fat metabolism. The control system is neural. Whole foods restore signal clarity."
    </div>
  </div>;
}

function GutTab(){
  const [pw,setPw]=useState(0);
  const pathways=[
    {label:"NEURAL · VAGUS NERVE",col:TEAL,body:"The vagus nerve is the primary highway -- a bidirectional cable containing ~100 million neurons. 80-90% of fibres are afferent (gut to brain), carrying microbial metabolite signals directly to the brainstem."},
    {label:"ENDOCRINE · HORMONES",col:BLU,body:"Gut enteroendocrine cells release 20+ hormones including GLP-1, PYY, CCK, and ghrelin. Gut bacteria modulate hormone secretion by metabolising bile acids and short-chain fatty acids."},
    {label:"IMMUNE · CYTOKINES",col:ROSE,body:"70% of immune cells reside in gut-associated lymphoid tissue. Commensal bacteria train T-regulatory cells. Cytokine signals (IL-6, TNF-a, IL-10) cross the blood-brain barrier and alter mood and cognition."},
    {label:"METABOLIC · SCFAs",col:GOLD,body:"Fermentation of dietary fibre by microbiota produces butyrate, propionate, and acetate. Butyrate is the primary fuel for colonocytes, repairs gut barrier, and modulates HDAC activity + neuroinflammation."},
  ];
  return<div>
    <div style={{border:`1px solid ${TD}44`,borderRadius:6,overflow:"hidden",marginBottom:16}}>
      <img src={imgGutBrain} alt="Microbial to Neural infographic" style={{width:"100%",display:"block"}}/>
    </div>
    <div style={{display:"flex",gap:6,flexWrap:"wrap",marginBottom:4}}>
      {pathways.map((p,i)=><button key={p.label} onClick={()=>setPw(i)} style={{background:pw===i?p.col+"22":"transparent",border:`1px solid ${pw===i?p.col:TD}`,color:pw===i?p.col:TS,fontFamily:MONO,fontSize:8,padding:"5px 12px",cursor:"pointer",borderRadius:3}}>{p.label}</button>)}
    </div>
    <div style={{border:`1px solid ${TD}`,borderRadius:"0 4px 4px 4px",overflow:"hidden",marginBottom:20}}>
      <GutBrainCanvas pw={pw}/>
    </div>
    <div style={{padding:"14px 18px",background:pathways[pw].col+"0A",border:`1px solid ${pathways[pw].col}33`,borderRadius:4,marginBottom:24}}>
      <div style={{fontFamily:MONO,fontSize:9,color:pathways[pw].col,letterSpacing:"0.14em",marginBottom:8}}>{pathways[pw].label}</div>
      <div style={{fontFamily:SERIF,fontSize:14,color:TS,lineHeight:1.7}}>{pathways[pw].body}</div>
    </div>
    <SecLabel txt="Minimum Coherent Inputs" col={GOLD}/>
    <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(200px,1fr))",gap:12,marginBottom:28}}>
      {[
        {n:"30",unit:"PLANT SPECIES / WEEK",col:TEAL,checks:["30+ different plant species","Fiber, polyphenols + prebiotics","Foundation of microbial diversity"]},
        {n:"3",unit:"FERMENTED SOURCES / DAY",col:GOLD,checks:["Fermented vegetables","Yogurt, kefir, or kombucha","Traditional + unpasteurised ideal"]},
        {n:"8",unit:"HOURS SLEEP NIGHTLY",col:BLU,checks:["7.5-8.5 hours optimal","Consistent sleep schedule","Dark, cool, quiet environment"]},
        {n:"15",unit:"HOUR OVERNIGHT FAST",col:VIO,checks:["15 hr fast (minimum)","Supports autophagy","Improves metabolic + immune function"]},
      ].map(inp=><div key={inp.unit} style={{padding:16,background:inp.col+"0A",border:`1px solid ${inp.col}33`,borderRadius:4}}>
        <div style={{display:"flex",alignItems:"baseline",gap:8,marginBottom:8}}>
          <span style={{fontFamily:DISP,fontSize:34,color:inp.col,lineHeight:1}}>{inp.n}</span>
          <span style={{fontFamily:MONO,fontSize:8,color:inp.col+"88",lineHeight:1.3}}>{inp.unit}</span>
        </div>
        {inp.checks.map(ck=><div key={ck} style={{display:"flex",gap:6,marginBottom:4}}>
          <span style={{color:inp.col,fontSize:9}}>+</span>
          <span style={{fontFamily:SERIF,fontSize:12,color:TS,lineHeight:1.5}}>{ck}</span>
        </div>)}
      </div>)}
    </div>
    <SecLabel txt="Key Numbers" col={VIO}/>
    <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(150px,1fr))",gap:10}}>
      {[["90%","serotonin made in gut",TEAL],["70%","immune cells in gut",GOLD],["100M","enteric neurons",BLU],["1000+","microbial species",VIO],["80%","vagus fibres afferent",ROSE]].map(([n,l,c])=><div key={n as string} style={{padding:"12px 14px",background:c+"0A",border:`1px solid ${c}33`,borderRadius:4,textAlign:"center"}}>
        <div style={{fontFamily:DISP,fontSize:24,color:c,marginBottom:4}}>{n}</div>
        <div style={{fontFamily:SERIF,fontSize:11,color:TS,lineHeight:1.5}}>{l}</div>
      </div>)}
    </div>
  </div>;
}

function LivingTab(){
  return<div>
    <SecLabel txt="Long-Term Coherence Growth Field Simulator" col={TEAL}/>
    <p style={{fontFamily:SERIF,fontSize:15,color:TS,lineHeight:1.75,marginBottom:20}}>
      48 x 32 coherence grid -- rows represent life stages (infant to elder), columns represent nutritional substrate axes. Run the simulation to watch growth events crystallize at phi-burst thresholds.
    </p>
    <div style={{marginBottom:28}}><GridCanvas/></div>
    <SecLabel txt="Six Life Stage Coherence Requirements" col={VIO}/>
    <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(240px,1fr))",gap:12,marginBottom:28}}>
      {[
        {stage:"INFANT (0-2)",col:ROSE,need:0.95,sub:"High-biolum extracts, enzyme-active liquid substrates, fungi beta-glucan",mech:"Maximum diffusion rate, breast milk coherence C = 0.97"},
        {stage:"CHILD (3-12)",col:AMB,need:0.85,sub:"Whole seeds, root powders, sprouts, whole grain ferments",mech:"phi-diversity window, maximum neural plasticity"},
        {stage:"TEEN (13-18)",col:GOLD,need:0.80,sub:"Full-spectrum amino acids, high-mineral sea vegetables, fermented substrates",mech:"Skeletal crystallization phase -- highest substrate throughput"},
        {stage:"ADULT (19-39)",col:BLU,need:0.75,sub:"Precision extracts, fermented foods, phi-balanced whole food combinations",mech:"Maintenance mode -- efficiency over volume"},
        {stage:"MIDLIFE (40-60)",col:TEAL,need:0.82,sub:"Mycelium substrates, polyphenol extracts, seed reactivation protocols",mech:"Coherence recalibration, hormonal substrate rebalancing"},
        {stage:"ELDER (60+)",col:VIO,need:0.92,sub:"Fungi beta-glucan, sea mineral ionic extracts, spore activators",mech:"Return to high-coherence substrates -- the loop closes"},
      ].map(s=><div key={s.stage} style={{background:`${s.col}07`,border:`1px solid ${s.col}25`,borderRadius:8,padding:"14px 16px"}}>
        <div style={{fontFamily:MONO,fontSize:10,color:s.col,marginBottom:6}}>{s.stage}</div>
        <div style={{display:"flex",alignItems:"center",gap:6,marginBottom:8}}>
          <div style={{flex:1,height:3,background:"#ffffff0a",borderRadius:2}}>
            <div style={{height:3,width:`${s.need*100}%`,background:s.col,borderRadius:2}}/>
          </div>
          <div style={{fontFamily:MONO,fontSize:9,color:s.col}}>C_need {s.need.toFixed(2)}</div>
        </div>
        <div style={{fontFamily:MONO,fontSize:8,color:TD,marginBottom:3}}>SUBSTRATE</div>
        <div style={{fontFamily:SERIF,fontSize:12,color:`${s.col}cc`,lineHeight:1.5,marginBottom:6}}>{s.sub}</div>
        <div style={{fontFamily:SERIF,fontSize:12,color:TS,lineHeight:1.5}}>{s.mech}</div>
      </div>)}
    </div>
  </div>;
}

function SubstrateTab(){
  const [phase,setPhase]=useState(4);
  const phaseNames=["WHOLE","POWDER","EXTRACT","SEED","ALL"];
  const phaseCols=[TS,GOLD,TEAL,GRN,VIO];
  return<div>
    <SecLabel txt="Food Coherence Field C(x,t) -- phi-Orbital Map" col={GRN}/>
    <div style={{display:"flex",gap:8,marginBottom:16,flexWrap:"wrap"}}>
      {phaseNames.map((p,i)=><button key={p} onClick={()=>setPhase(i)} style={{fontFamily:MONO,fontSize:10,padding:"6px 14px",borderRadius:4,cursor:"pointer",border:`1px solid ${phaseCols[i]}40`,background:phase===i?`${phaseCols[i]}20`:"transparent",color:phase===i?phaseCols[i]:TD}}>{p}</button>)}
    </div>
    <div style={{marginBottom:28}}><FoodOrbitalCanvas phase={phase}/></div>
    <SecLabel txt="Four Substrate Phases" col={GOLD}/>
    <Grid2>
      {[
        {phase:"WHOLE",col:TS,icon:"hexagon",title:"Maximum Structural Coherence",body:"The food in its living state. Cell walls intact, enzyme complexes active. C = C_native. Slowest absorption, deepest nutritional intelligence."},
        {phase:"POWDER",col:GOLD,icon:"circle",title:"Geometry Broken, Chemistry Preserved",body:"Cell walls fractured, surface area x1000, enzyme activity arrested. C = C_native x 0.72. Rapid absorption, stackable with other powders."},
        {phase:"EXTRACT",col:TEAL,icon:"diamond",title:"Targeted Molecule Isolation",body:"A single coherent molecular family -- anthocyanins, beta-glucans, omega-3s. C = C_native x phi-1. Maximum bioavailability for targeted application."},
        {phase:"SEED",col:GRN,icon:"star",title:"Amplified Coherence -- Living Growth",body:"Germinated or myceliated substrate where the coherence field AMPLIFIES. C approaches C_native x phi = 1.618x. The phi-multiplication event."},
      ].map(p=><MiniCard key={p.phase} title={`${p.phase} · ${p.title}`} body={p.body} col={p.col}/>)}
    </Grid2>
    <SecLabel txt="8 Food Categories -- Coherence + Bioluminescence Map" col={VIO}/>
    <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(220px,1fr))",gap:10}}>
      {FOODS.map(f=><div key={f.id} style={{background:`${f.col}07`,border:`1px solid ${f.col}28`,borderRadius:8,padding:"12px 14px"}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:6}}>
          <div style={{fontFamily:MONO,fontSize:10,color:f.col}}>{f.name}</div>
          <div style={{fontFamily:MONO,fontSize:13,color:f.col}}>{f.coherence.toFixed(2)}</div>
        </div>
        <div style={{height:3,background:"#ffffff08",borderRadius:2,marginBottom:8}}>
          <div style={{height:3,width:`${f.coherence*100}%`,background:f.col,borderRadius:2}}/>
        </div>
        <div style={{display:"flex",alignItems:"center",gap:6}}>
          <div style={{fontFamily:MONO,fontSize:8,color:TD}}>biolum</div>
          {Array.from({length:5},(_,i)=><div key={i} style={{width:6,height:6,borderRadius:"50%",background:i<Math.round(f.biolum*5)?f.col:"#ffffff10"}}/>)}
        </div>
      </div>)}
    </div>
  </div>;
}

function HealthTab(){
  return<div>
    <div style={{background:`rgba(200,168,76,0.06)`,border:`1px solid ${GOLD}33`,borderRadius:6,padding:"24px 28px",marginBottom:28}}>
      <div style={{fontFamily:MONO,fontSize:9,color:GOLD,letterSpacing:"0.3em",marginBottom:10}}>UNIFIED FRAMEWORK SUMMARY</div>
      <p style={{fontFamily:SERIF,fontSize:15,lineHeight:1.75,color:TP,marginBottom:12}}>
        Large-scale GWAS established that most genetic variants linked to obesity act within neural circuits -- not adipose tissue. The primary sites of dysfunction are the hypothalamus, brainstem metabolic circuits, and dopaminergic reward pathways. This repositions metabolic health as a fundamentally neurological problem.
      </p>
      <p style={{fontFamily:SERIF,fontSize:15,lineHeight:1.75,color:TS}}>
        The AETHER framework extends this by identifying a second consequence of the same neural instability: activation of the brain's antimicrobial defense system. Chronic neuroinflammation triggers amyloid aggregation. Alzheimer's pathology is not a primary disease but a chronic immune overcorrection triggered by metabolic failure.
      </p>
    </div>
    <SecLabel txt="Metabolic / Neuroimmune Architecture" col={GOLD}/>
    <Grid2>
      {[
        {title:"Hypothalamic Sensitivity",body:"The hypothalamus regulates hunger and satiety -- and is simultaneously highly responsive to systemic inflammation. Chronic stress can mimic pathogen detection, persistently sensitizing the system.",col:BLU},
        {title:"Brain Insulin Resistance",body:"Persistent glucose spikes impair neuronal insulin signaling. Reduces mitochondrial efficiency and limits energy available for immune regulation. Ultra-processed foods are the primary driver.",col:AMB},
        {title:"Gut-Brain Disconnect",body:"Loss of SCFA-producing microbiota removes the primary calm signal to hypothalamic immune circuits -- leaving them persistently sensitized to inflammation triggers.",col:GRN},
        {title:"Amyloid as Immune Response",body:"Beta-amyloid has intrinsic antimicrobial properties. Chronic neuroinflammation triggers the amyloid aggregation response as a defensive mechanism -- not primary pathology.",col:VIO},
        {title:"Whole Food Intervention",body:"Whole foods provide the biochemical inputs needed to restore signal clarity across both metabolic and immune systems simultaneously. The target is the neural environment, not symptoms.",col:TEAL},
        {title:"BDNF Dual Link",body:"BDNF regulates energy balance and voluntary activity (metabolic) while supporting hippocampal neuroplasticity. Low BDNF weakens structural integrity -- increasing susceptibility to amyloid aggregation.",col:ROSE},
      ].map(c=><MiniCard key={c.title} title={c.title} body={c.body} col={c.col}/>)}
    </Grid2>
    <SecLabel txt="The Intervention Target" col={TEAL}/>
    <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(200px,1fr))",gap:10}}>
      {[
        ["Omega-3 DHA/EPA","Reduces neuroinflammation, supports BDNF, protects myelin",TEAL],
        ["Polyphenols","NF-kB modulation, antioxidant, gut microbiome fuel",VIO],
        ["Prebiotic Fiber","SCFA production, gut barrier repair, vagal signaling",GRN],
        ["Zinc + Magnesium","Enzyme cofactors, neurotransmitter synthesis, sleep quality",GOLD],
        ["Curcumin","Crosses BBB, inhibits amyloid aggregation, anti-inflammatory",AMB],
        ["Fermented Foods","Live microbiome diversity, lactic acid bacteria, immune tone",ROSE],
      ].map(([n,d,c])=><div key={n as string} style={{padding:"12px 14px",background:c+"0A",border:`1px solid ${c}33`,borderRadius:4}}>
        <div style={{fontFamily:MONO,fontSize:10,color:c,marginBottom:6}}>{n}</div>
        <div style={{fontFamily:SERIF,fontSize:12,color:TS,lineHeight:1.5}}>{d}</div>
      </div>)}
    </div>
  </div>;
}

/* ── MAIN PAGE ────────────────────────────────────────────── */
export default function NutritionForcePage(){
  const [tab,setTab]=useState("brain");
  const active=TABS.find(t=>t.id===tab)!;
  return(
    <div style={{background:BG,minHeight:"100vh",color:TP,overflowX:"hidden"}}>
      {/* HERO */}
      <header style={{borderBottom:`1px solid ${BGLOW}`,background:`linear-gradient(180deg,#030e1e 0%,transparent 100%)`,padding:"28px 36px 22px"}}>
        <div style={{maxWidth:1080,margin:"0 auto"}}>
          <div style={{fontFamily:MONO,fontSize:10,color:TEAL,letterSpacing:"0.35em",textTransform:"uppercase",marginBottom:8,opacity:0.8}}>Brain Metabolism + Gut-Brain + Living Nutrition + Food Substrate + AETHER Health</div>
          <div style={{fontFamily:ORBI,fontSize:"clamp(18px,3.5vw,32px)",fontWeight:700,letterSpacing:2,background:`linear-gradient(135deg,#e8f0fa 0%,${TEAL} 40%,${GOLD} 100%)`,WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent",backgroundClip:"text",lineHeight:1.1}}>NEURAL NUTRITION FORCE</div>
          <div style={{fontFamily:SERIF,fontSize:15,fontStyle:"italic",color:TS,marginTop:6}}>One unified field -- brain metabolism, gut-brain axis, living nutrition intelligence, food substrate coherence, and metabolic health</div>
          <div style={{marginTop:12,display:"flex",gap:8,flexWrap:"wrap"}}>
            {["FTO · MC4R · BDNF","Gut Microbiome","C(x,t) Growth Field","phi-Coherence","Unruh Nutrition"].map(tag=><Pill key={tag} label={tag} col={TEAL}/>)}
          </div>
        </div>
      </header>

      {/* TAB NAV */}
      <div style={{borderBottom:`1px solid ${BDR}`,background:"rgba(2,8,16,0.92)",backdropFilter:"blur(12px)",position:"sticky",top:0,zIndex:100}}>
        <div style={{maxWidth:1080,margin:"0 auto",display:"flex",overflowX:"auto"}}>
          {TABS.map(t=><button key={t.id} onClick={()=>setTab(t.id)} style={{padding:"14px 20px",fontFamily:MONO,fontSize:10,letterSpacing:"0.15em",textTransform:"uppercase",border:"none",borderBottom:tab===t.id?`2px solid ${t.col}`:"2px solid transparent",color:tab===t.id?t.col:TD,background:"transparent",cursor:"pointer",whiteSpace:"nowrap",transition:"color .2s"}}>{t.label}</button>)}
        </div>
      </div>

      {/* CONTENT */}
      <div style={{maxWidth:1080,margin:"0 auto",padding:"36px 32px 80px"}}>
        <div style={{fontFamily:MONO,fontSize:9,letterSpacing:"0.3em",color:active.col,textTransform:"uppercase",marginBottom:20,opacity:0.7}}>{active.label} -- AETHER Unified Nutrition Intelligence</div>
        {tab==="brain"     && <BrainTab/>}
        {tab==="gut"       && <GutTab/>}
        {tab==="living"    && <LivingTab/>}
        {tab==="substrate" && <SubstrateTab/>}
        {tab==="health"    && <HealthTab/>}
      </div>
    </div>
  );
}
