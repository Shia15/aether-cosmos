import { useEffect, useRef, useState, useCallback } from "react";
import imgInfernia from "@assets/1_1781441110829.jpeg";
const BASE = import.meta.env.BASE_URL.replace(/\/$/, "");

// ── Constants ────────────────────────────────────────────────────────────────
const PHI = 1.6180339887;
const FIBS = [1,1,2,3,5,8,13,21,34,55,89,144,233,377,610];
const N_AGENTS = 500;
const LOOP_STEPS = ["sense","deliver","activate","feedback","learn"] as const;

// ── Layer definitions ─────────────────────────────────────────────────────────
const LAYERS = [
  { id:"bio",   icon:"⬡", name:"Bio-Mycelium",  desc:"Sparse electrochemical sensing, SOC monitoring",        keys:["Mycelium σ","Sensing Nodes","SOC Threshold"], status:"crit"     },
  { id:"fqp",   icon:"φ", name:"FQP Processor",  desc:"Fibonacci–Zeckendorf quantization, live energy savings",keys:["φ Depth","Energy Saving","Quantization Err"], status:"active-s" },
  { id:"econ",  icon:"◈", name:"Economic ABM",   desc:"500 agents with stochastic capital dynamics",           keys:["Firm Output","Bankruptcy Rate","Cascade Size"], status:"active-s" },
  { id:"tda",   icon:"◎", name:"Topology TDA",   desc:"Betti numbers, β₁ cycles, resilience score",            keys:["β₀","β₁ Cycles","Resilience R"],              status:"crit"     },
  { id:"anyon", icon:"∞", name:"Anyon Error-Correct", desc:"Non-Abelian Fibonacci braiding, 11% threshold",    keys:["Error Rate","Fidelity","Threshold"],           status:"idle"     },
  { id:"sdg",   icon:"◉", name:"SDG Sustainability",  desc:"CO₂ avoided, FQP savings, rebound risk",          keys:["CO₂ Avoided","FQP Saving","Rebound Risk"],    status:"crit"     },
];

// ── Types ────────────────────────────────────────────────────────────────────
type Agent = { id:number; capital:number; x:number; y:number; active:boolean; firing:boolean; fireTimer:number; bias:number; connections:number[]; fqpDepth:number; mycelium:number; coherence:number; entropy:number; torusPhase:number; };
type Edge  = { a:number; b:number; w:number; active:boolean; };
type LogEntry = { time:string; type:"info"|"warn"|"crit"|"ok"; msg:string; };
type LayerVals = Record<string, string[]>;

// ── Utility ──────────────────────────────────────────────────────────────────
function fqpQuantize(w:number, depth:number) { const f=FIBS[Math.min(depth,FIBS.length-1)]; return Math.round(w*f)/f; }
function fqpEnergy(depth:number) { return 1-(depth/FIBS.length)*0.3; }
function computePE(arr:number[]) {
  if(arr.length<3) return 0.9;
  const m=3; const patterns:Record<string,number>={};
  for(let i=0;i<arr.length-m+1;i++){
    const sl=arr.slice(i,i+m);
    const perm=[0,1,2].sort((a,b)=>sl[a]-sl[b]).join('');
    patterns[perm]=(patterns[perm]||0)+1;
  }
  const n=Object.values(patterns).reduce((a,b)=>a+b,0);
  let h=0; Object.values(patterns).forEach(c=>{const p=c/n; h-=p*Math.log(p);});
  return Math.min(1,h/Math.log(6));
}
function estimateAlpha(vals:number[]) {
  const sorted=[...vals].sort((a,b)=>b-a); const k=Math.floor(sorted.length*0.1);
  if(k<2) return 1.5;
  const xmin=sorted[k]; let sum=0;
  for(let i=0;i<k;i++) sum+=Math.log(sorted[i]/xmin);
  return 1+k/sum;
}
function stdDev(arr:number[]) {
  if(!arr.length) return 0;
  const m=arr.reduce((a,b)=>a+b,0)/arr.length;
  return Math.sqrt(arr.reduce((a,b)=>a+(b-m)**2,0)/arr.length);
}
function errorCorrect(p:number) { const t=0.11; return p<t ? 0.95+(t-p)/t*0.045 : Math.max(0.5,0.95-(p-t)*8); }

// ── Colour helpers ────────────────────────────────────────────────────────────
const SPIRIT = "rgba(196,181,253,";
const AURORA = "rgba(123,167,255,";
const ICE    = "rgba(168,188,232,";
const EMBER  = "rgba(255,152,96,";
const FADE   = "rgba(58,80,128,";

// ═══════════════════════════════════════════════════════════════════════════════
export default function PhiAetherView() {
  // Simulation state (all in refs — no re-renders per frame)
  const runningRef    = useRef(false);
  const tickRef       = useRef(0);
  const modeRef       = useRef<"network"|"avalanche"|"torus">("network");
  const agentsRef     = useRef<Agent[]>([]);
  const edgesRef      = useRef<Edge[]>([]);
  const cfgRef        = useRef({ crit:0.5, phi:6, coup:0.4, errRate:0.05 });
  const avalHistRef   = useRef<number[]>([]);
  const volHistRef    = useRef<number[]>([]);
  const co2HistRef    = useRef<number[]>([]);
  const phaseHistRef  = useRef<{x:number;y:number}[]>([]);
  const bankruptRef   = useRef(0);
  const cascadesRef   = useRef(0);
  const co2Ref        = useRef(0);
  const lastTimeRef   = useRef(0);
  const animRef       = useRef(0);
  const pendingLogRef = useRef<LogEntry[]>([]);

  // Canvas refs
  const simRef      = useRef<HTMLCanvasElement>(null);
  const spAvRef     = useRef<HTMLCanvasElement>(null);
  const spVolRef    = useRef<HTMLCanvasElement>(null);
  const spCo2Ref    = useRef<HTMLCanvasElement>(null);
  const phaseRef    = useRef<HTMLCanvasElement>(null);
  const bgRef       = useRef<HTMLCanvasElement>(null);

  // React state for UI
  const [mode, setMode]         = useState<"network"|"avalanche"|"torus">("network");
  const [isRunning, setIsRunning] = useState(false);
  const [loopStep, setLoopStep] = useState(0);
  const [openLayer, setOpenLayer] = useState<string|null>("fqp");
  const [cfg, setCfg]           = useState({ crit:0.5, phi:6, coup:0.4, errRate:5 });
  const [metrics, setMetrics]   = useState({ alpha:"1.49", hurst:"0.62", pe:"0.91", crash:"0", resil:"50%", fqp:"30%", anyon:"99.1%", bankrupt:"0" });
  const [sparkVals, setSparkVals] = useState({ av:"—", vol:"—", co2:"—" });
  const [hStats, setHStats]     = useState({ tick:0, alpha:"—", pe:"—", co2:"0.0" });
  const [layerVals, setLayerVals] = useState<LayerVals>({});
  const [layerBars, setLayerBars] = useState<Record<string,number>>({});
  const [logEntries, setLogEntries] = useState<LogEntry[]>([]);

  // ── Init ──────────────────────────────────────────────────────────────────
  const addEdge = (agents:Agent[], edges:Edge[], a:number, b:number) => {
    if(a===b) return;
    edges.push({a,b,w:Math.random()*0.5+0.3,active:false});
    agents[a].connections.push(b); agents[b].connections.push(a);
  };

  const initSim = useCallback(() => {
    const agents: Agent[] = [];
    const edges: Edge[] = [];
    bankruptRef.current=0; cascadesRef.current=0; co2Ref.current=0; tickRef.current=0;
    avalHistRef.current=[]; volHistRef.current=[]; co2HistRef.current=[]; phaseHistRef.current=[];
    pendingLogRef.current=[];

    for(let i=0;i<N_AGENTS;i++) {
      agents.push({ id:i, capital:Math.random()*50+10, x:Math.random(), y:Math.random(), active:false, firing:false, fireTimer:0, bias:Math.random(), connections:[], fqpDepth:Math.floor(Math.random()*8)+2, mycelium:Math.random()*0.5, coherence:Math.random(), entropy:Math.random()*0.5+0.5, torusPhase:Math.random()*Math.PI*2 });
    }
    const m=3;
    for(let i=0;i<m;i++) for(let j=i+1;j<m;j++) addEdge(agents,edges,i,j);
    for(let i=m;i<N_AGENTS;i++){
      const degrees=agents.map(a=>a.connections.length+1);
      const total=degrees.reduce((a,b)=>a+b,0);
      let added=0;
      while(added<m){
        let r=Math.random()*total, cum=0;
        for(let j=0;j<i;j++){ cum+=degrees[j]; if(r<=cum&&!agents[i].connections.includes(j)){addEdge(agents,edges,i,j);added++;break;} }
      }
    }
    // circular layout
    const cx=0.5,cy=0.5,r2=0.42;
    agents.forEach((a,i)=>{ const ang=(i/N_AGENTS)*Math.PI*2; a.x=cx+r2*Math.cos(ang)+(Math.random()-0.5)*0.15; a.y=cy+r2*Math.sin(ang)+(Math.random()-0.5)*0.15; });

    agentsRef.current=agents; edgesRef.current=edges;
    pushLog("ok","φ-AETHER system awakened");
    pushLog("info",`${N_AGENTS} souls bound · BA-network (m=3)`);
    pushLog("ok","FQP depth range: 2–10 · Savings: 20–30%");
  }, []);

  function pushLog(type: LogEntry["type"], msg: string) {
    const time = String(tickRef.current).padStart(5,"0");
    pendingLogRef.current = [...pendingLogRef.current, {time,type,msg}].slice(-80);
  }

  // ── Simulation step ───────────────────────────────────────────────────────
  const simStep = useCallback(() => {
    const tick = ++tickRef.current;
    const {crit,phi:phi_d,coup,errRate} = cfgRef.current;
    const agents = agentsRef.current, edges = edgesRef.current;

    const loopIdx = tick % LOOP_STEPS.length;
    setLoopStep(loopIdx);

    agents.forEach(a => { a.mycelium+=(Math.random()-0.5)*0.1*(1-crit); a.mycelium=Math.max(0,Math.min(1,a.mycelium)); });

    let avalancheCount=0;
    const outputs:number[]=[];
    agents.forEach(a=>{
      const sigma=0.08+(1-crit)*0.12;
      const shock=Math.exp((Math.random()-0.5)*sigma*2);
      const w=fqpQuantize(a.bias+a.coherence*0.3,phi_d);
      const f=w*(1+coup*a.mycelium);
      a.capital*=shock*f;
      outputs.push(a.capital);
      if(a.capital>60+Math.random()*40){a.firing=true;a.fireTimer=6;avalancheCount++;}
      if(a.fireTimer>0) a.fireTimer--; else a.firing=false;
    });

    let cascadeSize=0;
    edges.forEach(e=>{
      const aa=agents[e.a],ab=agents[e.b]; e.active=false;
      if(aa.firing||ab.firing){
        e.active=true; cascadeSize++;
        if(aa.firing&&!ab.firing&&Math.random()<coup/PHI){ab.firing=true;ab.fireTimer=4;}
      }
    });

    let newBankrupt=0;
    agents.forEach(a=>{
      if(a.capital<1){bankruptRef.current++;newBankrupt++;a.capital=Math.random()*20+5;a.bias=Math.random();a.coherence=Math.random();}
    });
    if(newBankrupt>5){cascadesRef.current++;pushLog("crit",`Cascade · ${newBankrupt} dissolving at tick ${tick}`);}

    const sorted=[...outputs].sort((a,b)=>a-b);
    const pe=computePE(sorted.slice(0,30));
    const hurst=0.5+(crit-0.5)*0.25+Math.sin(tick*0.03)*0.05;
    const fidelity=errorCorrect(errRate);
    agents.forEach(a=>{ a.coherence=fqpQuantize(a.coherence+(pe-0.9)*0.05,phi_d); a.coherence=Math.max(0,Math.min(1,a.coherence)); a.torusPhase+=(0.05+a.mycelium*0.03); });
    const energySave=fqpEnergy(phi_d)*0.3*N_AGENTS;
    co2Ref.current+=energySave*0.00004;
    const alpha=estimateAlpha(outputs);
    const vol=stdDev(outputs.slice(-50));

    const ah=avalHistRef.current, vh=volHistRef.current, ch=co2HistRef.current, ph=phaseHistRef.current;
    ah.push(cascadeSize); if(ah.length>200) ah.shift();
    vh.push(vol);         if(vh.length>200) vh.shift();
    ch.push(co2Ref.current); if(ch.length>200) ch.shift();
    ph.push({x:hurst,y:pe}); if(ph.length>300) ph.shift();

    if(tick%30===0) {
      pushLog("info",`Ψ=${tick}: α=${alpha.toFixed(3)} H=${hurst.toFixed(2)} PE=${pe.toFixed(3)}`);
    }
    if(tick%50===0&&fidelity<0.9) pushLog("warn",`Anyon coherence dimming: ${(fidelity*100).toFixed(1)}%`);

    // Update React state (throttle to every ~15 frames = every step since simStep itself is ~80ms)
    const resil=40+Math.sin(tick*0.07)*10+coup*20;
    setMetrics({ alpha:alpha.toFixed(3), hurst:hurst.toFixed(3), pe:pe.toFixed(3), crash:String(cascadesRef.current), resil:resil.toFixed(0)+"%", fqp:(fqpEnergy(phi_d)*30).toFixed(0)+"%", anyon:(fidelity*100).toFixed(1)+"%", bankrupt:String(bankruptRef.current) });
    setSparkVals({ av:ah[ah.length-1]?.toFixed(0)??"—", vol:vol.toFixed(2), co2:co2Ref.current.toFixed(2) });
    setHStats({ tick, alpha:alpha.toFixed(3), pe:pe.toFixed(3), co2:co2Ref.current.toFixed(1) });

    // Layer metrics
    const myc=agents.slice(0,5).reduce((s,a)=>s+a.mycelium,0)/5;
    const avgCap=agents.reduce((s,a)=>s+a.capital,0)/agents.length;
    setLayerVals({
      bio: [myc.toFixed(3), String(agents.filter(a=>a.firing).length), crit.toFixed(2)],
      fqp: [String(phi_d), (fqpEnergy(phi_d)*30).toFixed(0)+"%", "<2%"],
      econ:[avgCap.toFixed(1), ((bankruptRef.current/Math.max(tick,1))*100).toFixed(2)+"%", String(ah[ah.length-1]??0)],
      tda: ["1", String(Math.round(12+coup*30)), resil.toFixed(0)+"%"],
      anyon:[(errRate*100).toFixed(0)+"%",(fidelity*100).toFixed(1)+"%","11%"],
      sdg: [co2Ref.current.toFixed(2)+" kt",(fqpEnergy(phi_d)*30).toFixed(0)+"%",coup>0.7?"HIGH":coup>0.4?"MED":"LOW"],
    });
    setLayerBars({ bio:myc, fqp:fqpEnergy(phi_d), econ:Math.min(1,avgCap/80), tda:0.5+coup*0.3, anyon:fidelity, sdg:Math.min(1,co2Ref.current/100) });
    if(pendingLogRef.current.length>0){ setLogEntries([...pendingLogRef.current]); }
  }, []);

  // ── Drawing ───────────────────────────────────────────────────────────────
  function drawSim() {
    const c=simRef.current; if(!c) return;
    const ctx=c.getContext("2d")!; const W=c.width,H=c.height;
    ctx.fillStyle="#03050d"; ctx.fillRect(0,0,W,H);
    if(modeRef.current==="network") drawNetwork(ctx,W,H);
    else if(modeRef.current==="avalanche") drawAvalanche(ctx,W,H);
    else drawTorus(ctx,W,H);
  }

  function drawNetwork(ctx:CanvasRenderingContext2D,W:number,H:number) {
    const vg=ctx.createRadialGradient(W/2,H/2,H*0.2,W/2,H/2,H*0.7);
    vg.addColorStop(0,"transparent"); vg.addColorStop(1,"rgba(3,5,13,0.5)");
    ctx.fillStyle=vg; ctx.fillRect(0,0,W,H);
    const edges=edgesRef.current, agents=agentsRef.current;
    const sample=edges.filter((_,i)=>i%4===0);
    sample.forEach(e=>{
      const a=agents[e.a],b=agents[e.b];
      ctx.beginPath(); ctx.moveTo(a.x*W,a.y*H); ctx.lineTo(b.x*W,b.y*H);
      if(e.active){ctx.strokeStyle=SPIRIT+"0.5)";ctx.lineWidth=1;}
      else{ctx.strokeStyle=FADE+"0.25)";ctx.lineWidth=0.4;}
      ctx.stroke();
    });
    agents.forEach((a,i)=>{
      if(i%2!==0) return;
      const r=a.firing?5.5:2, x=a.x*W, y=a.y*H;
      ctx.beginPath(); ctx.arc(x,y,r,0,Math.PI*2);
      if(a.firing){
        ctx.fillStyle=SPIRIT+(0.7+a.fireTimer/6*0.3)+")";
        ctx.shadowBlur=16; ctx.shadowColor=SPIRIT+"0.8)";
      } else {
        const t2=Math.min(1,a.capital/80);
        ctx.fillStyle=a.capital<10?EMBER+"0.7)":`rgba(${Math.round(100+t2*68)},${Math.round(140+t2*80)},${Math.round(200+t2*55)},0.7)`;
        ctx.shadowBlur=0;
      }
      ctx.fill(); ctx.shadowBlur=0;
    });
    ctx.fillStyle=FADE+"0.4)"; ctx.font="9px Raleway,sans-serif";
    ctx.fillText(`ψ=${tickRef.current}  ·  FIELD MODE`,12,H-12);
  }

  function drawAvalanche(ctx:CanvasRenderingContext2D,W:number,H:number) {
    const ah=avalHistRef.current; if(ah.length<2) return;
    const max=Math.max(...ah,1), step=W/ah.length;
    ctx.beginPath();
    ah.forEach((v,i)=>{const x=i*step,y=H-(v/max)*(H*0.8)-20;i===0?ctx.moveTo(x,y):ctx.lineTo(x,y);});
    const last=ah.length-1; ctx.lineTo(last*step,H); ctx.lineTo(0,H); ctx.closePath();
    const grad=ctx.createLinearGradient(0,0,0,H);
    grad.addColorStop(0,AURORA+"0.12)"); grad.addColorStop(1,AURORA+"0.01)");
    ctx.fillStyle=grad; ctx.fill();
    ctx.beginPath();
    ah.forEach((v,i)=>{const x=i*step,y=H-(v/max)*(H*0.8)-20;i===0?ctx.moveTo(x,y):ctx.lineTo(x,y);});
    ctx.strokeStyle=AURORA+"0.7)"; ctx.lineWidth=1.2; ctx.stroke();
    const vals=agentsRef.current.map(a=>a.capital).sort((a,b)=>b-a);
    ctx.fillStyle=SPIRIT+"0.5)";
    for(let i=1;i<vals.length;i++){
      const lx=(Math.log(i)/Math.log(vals.length))*W;
      const ly=H-(Math.log(vals[i]+1)/Math.log(Math.max(...vals)+1))*H*0.75-20;
      ctx.fillRect(lx-1,ly-1,2,2);
    }
    ctx.fillStyle=FADE+"0.5)"; ctx.font="9px Raleway,sans-serif";
    ctx.fillText("WAVE · POWER-LAW (log-log)",12,H-12);
  }

  function drawTorus(ctx:CanvasRenderingContext2D,W:number,H:number) {
    const tick=tickRef.current;
    const cx=W/2, cy=H/2, R=Math.min(W,H)*0.3, r=Math.min(W,H)*0.11;
    for(let u=0;u<Math.PI*2;u+=0.14){
      for(let v=0;v<Math.PI*2;v+=0.22){
        const x=(R+r*Math.cos(v+tick*0.005))*Math.cos(u+tick*0.002)+cx;
        const y=(R+r*Math.cos(v+tick*0.005))*Math.sin(u+tick*0.002)*0.5+cy;
        const bright=(Math.sin(u*PHI+tick*0.03)+1)/2;
        const al=0.25+bright*0.45;
        ctx.beginPath(); ctx.arc(x,y,1.3,0,Math.PI*2);
        ctx.fillStyle=`rgba(${Math.round(100+bright*96)},${Math.round(150+bright*87)},${Math.round(220+bright*35)},${al})`;
        ctx.fill();
      }
    }
    ctx.beginPath();
    for(let i=0;i<600;i++){
      const t=i*0.04, rr=Math.sqrt(t)*10;
      const theta=t*PHI*Math.PI;
      const sx=cx+rr*Math.cos(theta+tick*0.004), sy=cy+rr*Math.sin(theta+tick*0.004)*0.5;
      i===0?ctx.moveTo(sx,sy):ctx.lineTo(sx,sy);
    }
    ctx.strokeStyle=SPIRIT+"0.25)"; ctx.lineWidth=0.6; ctx.stroke();
    const cg=ctx.createRadialGradient(cx,cy,0,cx,cy,40);
    cg.addColorStop(0,SPIRIT+"0.15)"); cg.addColorStop(1,"transparent");
    ctx.fillStyle=cg; ctx.beginPath(); ctx.arc(cx,cy,40,0,Math.PI*2); ctx.fill();
    ctx.fillStyle=FADE+"0.5)"; ctx.font="9px Raleway,sans-serif";
    ctx.fillText("AETHER TOROIDAL FIELD · φ-SPIRAL",12,H-12);
  }

  function drawSparkline(ref:React.RefObject<HTMLCanvasElement>, data:number[], color:string) {
    const c=ref.current; if(!c||data.length<2) return;
    c.width=c.offsetWidth*devicePixelRatio; c.height=36*devicePixelRatio;
    const ctx=c.getContext("2d")!; ctx.scale(devicePixelRatio,devicePixelRatio);
    const W=c.offsetWidth,H=36;
    ctx.clearRect(0,0,W,H);
    const max=Math.max(...data,1), min=Math.min(...data,0), range=max-min||1, step=W/data.length;
    ctx.beginPath();
    data.forEach((v,i)=>{const x=i*step,y=H-((v-min)/range)*(H-4)-2;i===0?ctx.moveTo(x,y):ctx.lineTo(x,y);});
    ctx.strokeStyle=color; ctx.lineWidth=1; ctx.stroke();
    ctx.lineTo(W,H); ctx.lineTo(0,H); ctx.closePath();
    const grad=ctx.createLinearGradient(0,0,0,H);
    grad.addColorStop(0,color.replace("0.8)","0.1)").replace("0.7)","0.1)").replace("0.6)","0.1)"));
    grad.addColorStop(1,"transparent");
    ctx.fillStyle=grad; ctx.fill();
  }

  function drawPhasePortrait() {
    const c=phaseRef.current; if(!c) return;
    c.width=c.offsetWidth; c.height=80;
    const ctx=c.getContext("2d")!; const W=c.width,H=c.height;
    ctx.fillStyle="#03050d"; ctx.fillRect(0,0,W,H);
    ctx.strokeStyle=FADE+"0.2)"; ctx.lineWidth=0.5;
    for(let i=1;i<4;i++){
      ctx.beginPath(); ctx.moveTo(W*i/4,0); ctx.lineTo(W*i/4,H); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(0,H*i/4); ctx.lineTo(W,H*i/4); ctx.stroke();
    }
    const ph=phaseHistRef.current;
    if(ph.length>1){
      ctx.beginPath();
      ph.forEach((p,i)=>{const x=p.x*W*0.9+W*0.05,y=H-p.y*H*0.9-H*0.05;i===0?ctx.moveTo(x,y):ctx.lineTo(x,y);});
      ctx.strokeStyle=SPIRIT+"0.5)"; ctx.lineWidth=0.8; ctx.stroke();
    }
    ctx.fillStyle=FADE+"0.6)"; ctx.font="7px Raleway,sans-serif";
    ctx.fillText("H →",W-18,H-4); ctx.fillText("PE↑",4,10);
  }

  function drawBg() {
    const c=bgRef.current; if(!c) return;
    c.width=window.innerWidth; c.height=window.innerHeight;
    const ctx=c.getContext("2d")!; const W=c.width,H=c.height;
    ctx.clearRect(0,0,W,H);
    ctx.beginPath();
    for(let i=0;i<1800;i++){
      const t=i*0.07, r=Math.pow(PHI,t*0.18)*1.8;
      const theta=t*PHI*Math.PI;
      const x=W/2+r*Math.cos(theta), y=H/2+r*Math.sin(theta);
      i===0?ctx.moveTo(x,y):ctx.lineTo(x,y);
    }
    ctx.strokeStyle=AURORA+"0.07)"; ctx.lineWidth=0.8; ctx.stroke();
    ctx.beginPath(); ctx.arc(W/2,H/2,Math.min(W,H)*0.42,0,Math.PI*2);
    ctx.strokeStyle=ICE+"0.04)"; ctx.lineWidth=1; ctx.stroke();
  }

  // ── Animation loop ────────────────────────────────────────────────────────
  const loop = useCallback((ts:number) => {
    if(!runningRef.current) return;
    if(ts-lastTimeRef.current>80){ simStep(); lastTimeRef.current=ts; }
    drawSim();
    drawSparkline(spAvRef,  avalHistRef.current, AURORA+"0.8)");
    drawSparkline(spVolRef,  volHistRef.current,  ICE+"0.6)");
    drawSparkline(spCo2Ref,  co2HistRef.current,  SPIRIT+"0.8)");
    drawPhasePortrait();
    animRef.current=requestAnimationFrame(loop);
  }, [simStep]);

  function resizeSim() {
    const c=simRef.current; if(!c) return;
    const rect=c.parentElement!.getBoundingClientRect();
    c.width=rect.width; c.height=Math.max(rect.height-88,200);
  }

  useEffect(() => {
    drawBg();
    initSim();
    resizeSim();
    window.addEventListener("resize",()=>{drawBg();resizeSim();});
    return ()=>{runningRef.current=false;cancelAnimationFrame(animRef.current);};
  }, []);

  const handleToggle = () => {
    if(!agentsRef.current.length) initSim();
    runningRef.current=!runningRef.current;
    setIsRunning(runningRef.current);
    if(runningRef.current){ pushLog("ok","Simulation awakened..."); animRef.current=requestAnimationFrame(loop); }
    else { pushLog("warn","Simulation suspended"); cancelAnimationFrame(animRef.current); }
  };

  const setViewMode = (m:"network"|"avalanche"|"torus") => { modeRef.current=m; setMode(m); };

  // ── Badge colors ──────────────────────────────────────────────────────────
  const badgeStyle = (s:string) => s==="active-s" ? { background:"rgba(123,167,255,0.15)", color:"#7ba7ff", border:"1px solid rgba(123,167,255,0.4)" }
    : s==="crit" ? { background:"rgba(255,152,96,0.12)", color:"#ff9860", border:"1px solid rgba(255,152,96,0.35)" }
    : { background:"rgba(58,80,128,0.15)", color:"#8899bb", border:"1px solid rgba(58,80,128,0.35)" };

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div className="relative flex flex-col h-full overflow-hidden" style={{ background:"#03050d", fontFamily:"'Raleway',sans-serif", fontWeight:300, color:"rgba(168,188,232,0.9)" }}>
      {/* Sacred-geometry background */}
      <canvas ref={bgRef} className="absolute inset-0 pointer-events-none z-0" />
      <div className="absolute inset-0 pointer-events-none z-0" style={{ background:"radial-gradient(ellipse 80% 60% at 50% 40%, rgba(30,20,80,0.45) 0%, transparent 70%)" }} />

      {/* ── Header ── */}
      <header className="relative z-10 flex items-center justify-between px-5 py-3 shrink-0" style={{ borderBottom:"1px solid rgba(58,80,128,0.35)", background:"rgba(3,5,13,0.7)" }}>
        <div>
          <div style={{ fontFamily:"'Cinzel',serif", fontSize:18, letterSpacing:6, color:"rgba(232,240,255,0.95)" }}>φ · AETHER</div>
          <div style={{ fontSize:9, letterSpacing:3, color:"rgba(123,167,255,0.6)", textTransform:"uppercase", marginTop:2 }}>Coherent Criticality Engine · v0.1</div>
        </div>
        <div className="flex gap-5">
          {[["500","Agents"],[String(hStats.tick),"Tick"],[hStats.alpha,"α Exponent"],[hStats.pe,"Perm Entropy"],[hStats.co2,"CO₂ Avoided kt"]].map(([val,lbl])=>(
            <div key={lbl} className="text-center">
              <div style={{ fontFamily:"'Cinzel',serif", fontSize:13, color:"rgba(196,181,253,0.9)" }}>{val}</div>
              <div style={{ fontSize:7, letterSpacing:2, textTransform:"uppercase", color:"rgba(58,80,128,0.8)" }}>{lbl}</div>
            </div>
          ))}
        </div>
        <button onClick={handleToggle} style={{ fontFamily:"'Raleway',sans-serif", fontWeight:600, fontSize:10, letterSpacing:3, padding:"8px 20px", border:`1px solid ${isRunning?"rgba(196,181,253,0.6)":"rgba(58,80,128,0.5)"}`, background:isRunning?"rgba(196,181,253,0.08)":"rgba(58,80,128,0.08)", color:isRunning?"rgba(196,181,253,0.9)":"rgba(123,167,255,0.7)", cursor:"pointer", textTransform:"uppercase", transition:"all 0.3s" }}>
          {isRunning ? "⏸ PAUSE" : "▶ INITIALIZE"}
        </button>
      </header>

      {/* ── Main 3-column body ── */}
      <div className="relative z-10 flex-1 grid overflow-hidden" style={{ gridTemplateColumns:"240px 1fr 240px", gridTemplateRows:"1fr auto", gap:6, padding:6 }}>

        {/* LEFT PANEL — spans full height */}
        <div className="row-span-2 rounded flex flex-col gap-3 overflow-y-auto p-3" style={{ background:"rgba(3,5,20,0.5)", border:"1px solid rgba(58,80,128,0.25)" }}>
          <div style={{ fontSize:8, letterSpacing:3, textTransform:"uppercase", color:"rgba(123,167,255,0.6)", display:"flex", alignItems:"center", gap:6 }}>
            <span style={{ color:"rgba(196,181,253,0.8)", animation:"pulse-rune 3s ease-in-out infinite" }}>◈</span> φ-AETHER LAYERS
          </div>
          {LAYERS.map(l=>{
            const isOpen=openLayer===l.id;
            const vals=layerVals[l.id]??["—","—","—"];
            const bar=layerBars[l.id]??0.5;
            return (
              <div key={l.id} style={{ border:"1px solid rgba(58,80,128,0.2)", background:"rgba(3,5,20,0.3)" }}>
                <div onClick={()=>setOpenLayer(isOpen?null:l.id)} className="flex items-center gap-2 cursor-pointer px-2 py-1.5" style={{ background:isOpen?"rgba(58,80,128,0.15)":"transparent" }}>
                  <span style={{ fontFamily:"'Cinzel',serif", fontSize:14, color:"rgba(196,181,253,0.7)" }}>{l.icon}</span>
                  <span style={{ fontSize:9, letterSpacing:1.5, textTransform:"uppercase", flex:1 }}>{l.name}</span>
                  <span style={{ fontSize:7, letterSpacing:1.5, padding:"2px 5px", borderRadius:2, textTransform:"uppercase", ...badgeStyle(l.status) }}>{l.status==="active-s"?"ACTIVE":l.status==="crit"?"CRIT":"IDLE"}</span>
                </div>
                {isOpen && (
                  <div className="px-2 pb-2">
                    <div style={{ fontSize:8, color:"rgba(58,80,128,0.7)", marginBottom:4 }}>{l.desc}</div>
                    {l.keys.map((k,i)=>(
                      <div key={k} className="flex justify-between" style={{ fontSize:8, padding:"2px 0", borderBottom:"1px solid rgba(58,80,128,0.1)" }}>
                        <span style={{ color:"rgba(58,80,128,0.7)" }}>{k}</span>
                        <span style={{ color:"rgba(123,167,255,0.9)", fontFamily:"'Cinzel',serif" }}>{vals[i]??""}</span>
                      </div>
                    ))}
                    <div className="mt-2 h-1 rounded-full overflow-hidden" style={{ background:"rgba(58,80,128,0.2)" }}>
                      <div style={{ height:"100%", width:`${Math.max(0,Math.min(1,bar))*100}%`, background:"linear-gradient(90deg,rgba(58,80,128,0.6),rgba(196,181,253,0.7))", transition:"width 0.5s" }} />
                    </div>
                  </div>
                )}
              </div>
            );
          })}

          <div style={{ fontSize:8, letterSpacing:3, textTransform:"uppercase", color:"rgba(168,188,232,0.4)", display:"flex", alignItems:"center", gap:6, marginTop:4 }}>
            <span style={{ color:"rgba(255,152,96,0.6)" }}>◇</span> AETHER LOOP
          </div>
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:4 }}>
            {LOOP_STEPS.map((s,i)=>{
              const isLit=i===loopStep;
              return (
                <div key={s} style={{ gridColumn:i===4?"1/-1":"auto", padding:"6px 8px", border:`1px solid ${isLit?"rgba(196,181,253,0.5)":"rgba(58,80,128,0.2)"}`, background:isLit?"rgba(196,181,253,0.07)":"rgba(3,5,20,0.3)", fontSize:8, letterSpacing:2, textTransform:"uppercase", display:"flex", alignItems:"center", gap:5, color:isLit?"rgba(196,181,253,0.9)":"rgba(58,80,128,0.6)", transition:"all 0.4s" }}>
                  <span>{i===0?"◉":i===1?"⟳":i===2?"✦":i===3?"↺":"∞"}</span>{s}{i===4?" · φ-Recursive":""}
                </div>
              );
            })}
          </div>
        </div>

        {/* CENTER PANEL — simulation canvas */}
        <div className="rounded flex flex-col overflow-hidden" style={{ background:"rgba(3,5,20,0.5)", border:"1px solid rgba(58,80,128,0.25)" }}>
          <canvas ref={simRef} className="w-full block" style={{ flex:1, display:"block" }} />
          <div className="flex flex-wrap gap-3 px-3 py-2 shrink-0" style={{ borderTop:"1px solid rgba(58,80,128,0.2)", background:"rgba(3,5,13,0.6)" }}>
            {[
              { label:"Criticality Bias", min:0, max:100, val:Math.round(cfgRef.current.crit*100), disp:cfgRef.current.crit.toFixed(2), key:"crit" },
              { label:"φ-Quantization",  min:1, max:10,  val:cfgRef.current.phi, disp:String(cfgRef.current.phi), key:"phi" },
              { label:"Coupling Strength",min:0,max:100, val:Math.round(cfgRef.current.coup*100), disp:cfgRef.current.coup.toFixed(2), key:"coup" },
              { label:"Error Rate",      min:0, max:20,  val:Math.round(cfgRef.current.errRate*100), disp:Math.round(cfgRef.current.errRate*100)+"%", key:"err" },
            ].map(ctrl=>(
              <div key={ctrl.key} className="flex flex-col" style={{ minWidth:90 }}>
                <div style={{ fontSize:7, letterSpacing:2, textTransform:"uppercase", color:"rgba(58,80,128,0.7)", marginBottom:3 }}>{ctrl.label}</div>
                <input type="range" min={ctrl.min} max={ctrl.max} defaultValue={ctrl.val} onChange={e=>{
                  const v=+e.target.value;
                  const c=cfgRef.current;
                  if(ctrl.key==="crit") c.crit=v/100;
                  else if(ctrl.key==="phi") c.phi=v;
                  else if(ctrl.key==="coup") c.coup=v/100;
                  else c.errRate=v/100;
                  setCfg({crit:c.crit,phi:c.phi,coup:c.coup,errRate:Math.round(c.errRate*100)});
                }} style={{ width:"100%", accentColor:"rgba(196,181,253,0.8)", cursor:"pointer" }} />
                <div style={{ fontSize:9, fontFamily:"'Cinzel',serif", color:"rgba(123,167,255,0.7)", marginTop:1 }}>{ctrl.disp}</div>
              </div>
            ))}
            <div className="flex flex-col">
              <div style={{ fontSize:7, letterSpacing:2, textTransform:"uppercase", color:"rgba(58,80,128,0.7)", marginBottom:3 }}>View Mode</div>
              <div className="flex gap-1">
                {(["network","avalanche","torus"] as const).map(m=>(
                  <button key={m} onClick={()=>setViewMode(m)} style={{ fontSize:7, letterSpacing:2, padding:"4px 7px", border:`1px solid ${mode===m?"rgba(196,181,253,0.6)":"rgba(58,80,128,0.35)"}`, background:mode===m?"rgba(196,181,253,0.1)":"transparent", color:mode===m?"rgba(196,181,253,0.9)":"rgba(58,80,128,0.6)", cursor:"pointer", textTransform:"uppercase", transition:"all 0.3s" }}>
                    {m==="network"?"FIELD":m==="avalanche"?"WAVE":"TORUS"}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT TOP — metrics + sparklines */}
        <div className="rounded overflow-y-auto p-3" style={{ background:"rgba(3,5,20,0.5)", border:"1px solid rgba(58,80,128,0.25)" }}>
          <div style={{ fontSize:8, letterSpacing:3, textTransform:"uppercase", color:"rgba(123,167,255,0.6)", display:"flex", alignItems:"center", gap:6, marginBottom:10 }}>
            <span style={{ color:"rgba(123,167,255,0.8)" }}>◈</span> LIVE METRICS
          </div>
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:5, marginBottom:14 }}>
            {[
              { val:metrics.alpha, cls:"aurora", lbl:"Power Law α" },
              { val:metrics.hurst, cls:"", lbl:"Hurst H" },
              { val:metrics.pe, cls:"spirit", lbl:"Perm Entropy" },
              { val:metrics.crash, cls:"ember", lbl:"Cascades" },
              { val:metrics.resil, cls:"", lbl:"Topology R" },
              { val:metrics.fqp, cls:"spirit", lbl:"FQP Saving" },
              { val:metrics.anyon, cls:"aurora", lbl:"Anyon Fidelity" },
              { val:metrics.bankrupt, cls:"ember", lbl:"Bankruptcies" },
            ].map(({val,cls,lbl})=>(
              <div key={lbl} style={{ background:"rgba(3,5,20,0.5)", border:"1px solid rgba(58,80,128,0.2)", padding:"9px 7px", textAlign:"center" }}>
                <div style={{ fontFamily:"'Cinzel',serif", fontSize:15, fontWeight:600, lineHeight:1, marginBottom:3, background:cls==="aurora"?"linear-gradient(135deg,rgba(168,188,232,0.9),rgba(123,167,255,0.9))":cls==="spirit"?"linear-gradient(135deg,rgba(196,181,253,0.9),rgba(200,200,240,0.9))":cls==="ember"?"linear-gradient(135deg,rgba(255,200,120,0.9),rgba(255,152,96,0.9))":"rgba(232,240,255,0.9)", WebkitBackgroundClip:cls?"text":"", WebkitTextFillColor:cls?"transparent":"", color:cls?"":"rgba(232,240,255,0.9)" }}>{val}</div>
                <div style={{ fontSize:7, color:"rgba(58,80,128,0.7)", letterSpacing:2, textTransform:"uppercase" }}>{lbl}</div>
              </div>
            ))}
          </div>

          <div style={{ fontSize:8, letterSpacing:3, textTransform:"uppercase", color:"rgba(196,181,253,0.5)", display:"flex", alignItems:"center", gap:6, marginBottom:8 }}>
            <span>◇</span> ETHERIC STREAMS
          </div>
          {[
            { ref:spAvRef,  label:"Avalanche Size",    valKey:"av"  as const, color:"rgba(123,167,255,0.8)"  },
            { ref:spVolRef,  label:"Output Volatility", valKey:"vol" as const, color:"rgba(232,240,255,0.6)"  },
            { ref:spCo2Ref, label:"CO₂ Avoided kt",    valKey:"co2" as const, color:"rgba(196,181,253,0.8)"  },
          ].map(({ref,label,valKey,color})=>(
            <div key={label} style={{ marginBottom:10 }}>
              <div style={{ fontSize:8, color:"rgba(58,80,128,0.6)", letterSpacing:2, textTransform:"uppercase", display:"flex", justifyContent:"space-between", marginBottom:4 }}>
                <span>{label}</span>
                <span style={{ fontFamily:"'Cinzel',serif", fontSize:10, color:"rgba(123,167,255,0.9)" }}>{sparkVals[valKey]}</span>
              </div>
              <canvas ref={ref} className="w-full block" style={{ height:36, display:"block" }} />
            </div>
          ))}
        </div>

        {/* RIGHT BOTTOM — phase portrait + log */}
        <div className="rounded overflow-hidden flex flex-col p-3 gap-2" style={{ background:"rgba(3,5,20,0.5)", border:"1px solid rgba(58,80,128,0.25)", gridColumn:3, gridRow:2 }}>
          <div style={{ fontSize:8, letterSpacing:3, textTransform:"uppercase", color:"rgba(255,152,96,0.5)", display:"flex", alignItems:"center", gap:6 }}>
            <span>◉</span> PHASE PORTRAIT
          </div>
          <canvas ref={phaseRef} className="w-full block shrink-0" style={{ height:80, display:"block", border:"1px solid rgba(58,80,128,0.2)" }} />
          <div style={{ fontSize:8, letterSpacing:3, textTransform:"uppercase", color:"rgba(168,188,232,0.4)", display:"flex", alignItems:"center", gap:6 }}>
            <span>◇</span> SYSTEM LOG
          </div>
          <div className="flex-1 overflow-y-auto" style={{ background:"rgba(3,5,13,0.6)", border:"1px solid rgba(58,80,128,0.2)", padding:"8px 10px", fontSize:9, lineHeight:1.8 }}>
            {logEntries.map((e,i)=>(
              <div key={i} className="flex gap-2">
                <span style={{ color:"rgba(58,80,128,0.6)", flexShrink:0, fontSize:8, letterSpacing:1 }}>{e.time}</span>
                <span style={{ color:e.type==="info"?"rgba(123,167,255,0.9)":e.type==="warn"?"rgba(255,200,120,0.9)":e.type==="crit"?"rgba(255,152,96,0.9)":"rgba(196,181,253,0.9)" }}>{e.msg}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <style>{`@keyframes pulse-rune{0%,100%{opacity:.5;transform:scale(1)}50%{opacity:1;transform:scale(1.15)}}`}</style>

      {/* ── INFERNIA + Animal Neural Sim appendix ───────────────────────────── */}
      <div style={{ padding: "2rem 2rem 3.5rem", borderTop: "1px solid rgba(58,80,128,0.25)", background: "#020617" }}>
        <div style={{ maxWidth: 860, margin: "0 auto" }}>

          {/* INFERNIA image + AETHER-Core pipeline */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.5rem", marginBottom: "2.5rem", alignItems: "start" }}>
            <div>
              <div style={{ fontSize: "0.62rem", letterSpacing: "0.2em", color: "rgba(255,152,96,0.7)", textTransform: "uppercase", marginBottom: "0.5rem" }}>Infernia · Intensity Analysis</div>
              <img src={imgInfernia} alt="INFERNIA — Intensity Analysis / Emotional Spectrum" style={{ width: "100%", borderRadius: 6, border: "1px solid rgba(58,80,128,0.3)" }} />
              <div style={{ marginTop: "0.5rem", fontSize: "0.6rem", color: "rgba(100,116,139,0.8)", textAlign: "center", letterSpacing: "0.1em", textTransform: "uppercase" }}>
                INFERNIA · Emotional Input → Emotional Spectrum
              </div>
            </div>
            <div>
              <div style={{ fontSize: "0.62rem", letterSpacing: "0.2em", color: "rgba(196,181,253,0.7)", textTransform: "uppercase", marginBottom: "0.5rem" }}>AETHER-Core Pipeline</div>
              <h3 style={{ fontSize: "1.1rem", fontWeight: 700, color: "#e2e8f0", margin: "0 0 0.75rem", lineHeight: 1.3 }}>Mnêsis → Infernia → Aletheia → Reverie</h3>
              <p style={{ color: "rgba(148,163,184,0.8)", fontSize: "0.8rem", lineHeight: 1.75, marginBottom: "0.75rem" }}>
                Intelligence is not generated — it is <em style={{ color: "#f59e0b", fontStyle: "normal", fontWeight: 600 }}>crystallized</em>. Raw Al₂O₃ under extreme pressure and trace-element doping forms a stable, optically coherent sapphire. This maps directly to the AETHER intelligence process.
              </p>
              {[
                { g: "Μ", n: "Mnêsis", c: "#00ffee", s: "Memory Substrate — 128×128 real-valued field, random noise + holographic seed. The primordial ocean." },
                { g: "Ι", n: "Infernia", c: "#f97316", s: "Transformation Forge — Laplacian + Gray-Scott + CGLE. Titanium τ drives the Blue Shift." },
                { g: "Α", n: "Aletheia", c: "#a78bfa", s: "Truth Stabilizer — phase-coherence Ψ = 1−σ/μ. Declares Stable Attractor when threshold crossed." },
                { g: "Ρ", n: "Reverie", c: "#ec4899", s: "Radiant Output — live plasma-colormap. Bloom → waves → maze → locked hexagonal attractors." },
              ].map((stage, i) => (
                <div key={stage.n} style={{ display: "flex", gap: "0.7rem", marginBottom: "0.6rem", background: `${stage.c}08`, border: `1px solid ${stage.c}20`, borderLeft: `2px solid ${stage.c}`, borderRadius: 4, padding: "0.55rem 0.7rem", alignItems: "start" }}>
                  <div style={{ width: 28, height: 28, borderRadius: "50%", background: `${stage.c}15`, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 900, fontSize: "0.9rem", color: stage.c, flexShrink: 0, fontFamily: "serif" }}>{stage.g}</div>
                  <div>
                    <span style={{ fontWeight: 700, color: stage.c, fontSize: "0.82rem" }}>{stage.n}</span>
                    <span style={{ color: "rgba(100,116,139,0.8)", fontSize: "0.72rem", marginLeft: "0.4rem" }}>— {stage.s}</span>
                  </div>
                </div>
              ))}
              <div style={{ marginTop: "0.75rem", padding: "0.55rem 0.8rem", background: "rgba(0,0,0,0.35)", borderLeft: "2px solid rgba(245,158,11,0.5)", fontFamily: "monospace", fontSize: "0.75rem", color: "rgba(245,158,11,0.85)" }}>
                ∂A/∂t = μA + (1+iα)∇²A − (1+iβ)|A|²A + F_holo
              </div>
            </div>
          </div>

          {/* Animal Neural Plasmoid Simulator */}
          <div style={{ marginBottom: "0.4rem", fontSize: "0.62rem", letterSpacing: "0.2em", color: "rgba(100,116,139,0.7)", textTransform: "uppercase" }}>Live Interactive Simulator</div>
          <h3 style={{ fontSize: "1.2rem", fontWeight: 700, color: "#e2e8f0", margin: "0 0 0.4rem" }}>AETHER · Animal Neural Plasmoid Simulator v2</h3>
          <p style={{ color: "rgba(148,163,184,0.8)", fontSize: "0.82rem", lineHeight: 1.65, marginBottom: "0.9rem" }}>
            Type an animal name and explore its neural oscillation signature across Alpha, Beta, Theta, Delta, and Gamma brainwave bands. Signal pipeline: <em style={{ color: "rgba(0,255,238,0.75)", fontStyle: "normal" }}>Receptor → Encoding → Neural Processing → Integration → Cognition</em>. Each animal generates a unique plasmoid geometry in the φ-AETHER field.
          </p>
          <div style={{ border: "1px solid rgba(58,80,128,0.3)", borderRadius: 8, overflow: "hidden", height: 580 }}>
            <iframe
              src={`${BASE}/animal-neural-sim.html`}
              style={{ width: "100%", height: "100%", border: "none", display: "block" }}
              title="AETHER Animal Neural Plasmoid Simulator v2"
            />
          </div>
          <div style={{ marginTop: "0.75rem", padding: "0.6rem 0.9rem", background: "rgba(200,168,76,0.06)", border: "1px solid rgba(200,168,76,0.15)", borderRadius: 5 }}>
            <span style={{ fontSize: "0.62rem", letterSpacing: "0.1em", color: "rgba(200,168,76,0.8)", textTransform: "uppercase", marginRight: "0.5rem" }}>Try:</span>
            <span style={{ fontSize: "0.75rem", color: "rgba(148,163,184,0.8)" }}>dolphin · octopus · elephant · crow · mantis shrimp · jellyfish</span>
          </div>
        </div>
      </div>
    </div>
  );
}
