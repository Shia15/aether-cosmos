import { useEffect, useRef, useState, useCallback } from "react";

/* ── palette ─────────────────────────────────────── */
const BG    = "#010408";
const BRIGHT = "#4a9fd4";
const TEAL  = "#1fd4c8";
const GOLD  = "#c9a84c";
const VIO   = "#8b5cf6";
const RED   = "#ef4444";
const GRN   = "#22c55e";
const ORG   = "#f97316";
const PINK  = "#ec4899";
const DIM   = "#3a5a7a";
const BORD  = "rgba(46,109,164,0.18)";
const BORD2 = "rgba(46,109,164,0.38)";
const MN    = "'Share Tech Mono', monospace";
const OR    = "'Orbitron', sans-serif";
const RJ    = "'Rajdhani', sans-serif";

const PHI_INV = 0.618034;
const WHEEL   = new Set([1,7,11,13,17,19,23,29]);
const BEAT_FRAMES = 18;

/* ── primitive config ────────────────────────────── */
type PrimKey = 'torus'|'helix'|'mandala'|'branch'|'knot'|'star';
interface Prim { key:PrimKey; name:string; sub:string; cv:string; active:boolean; w:number; }

const PRIMS_INIT: Prim[] = [
  {key:'torus',  name:'TORUS TUNNEL',      sub:'Concentric rings, flying outward',   cv:GOLD, active:true, w:80},
  {key:'helix',  name:'HELIX LADDER',      sub:'Double strand climbing the tower',   cv:TEAL, active:true, w:75},
  {key:'mandala',name:'RADIAL MANDALA',    sub:'Six-petal symmetric burst',          cv:VIO,  active:true, w:85},
  {key:'branch', name:'FRACTAL BRANCH',    sub:'Recursive branching sparks',         cv:GRN,  active:true, w:60},
  {key:'knot',   name:'KNOT BRAID LOOP',   sub:'Torus knot T(p,q), real crossings', cv:RED,  active:true, w:55},
  {key:'star',   name:'STAR CONSTELLATION',sub:'Radiating lines to scattered pts',  cv:PINK, active:true, w:65},
];

const TYPE_COL: Record<PrimKey,string> = {torus:GOLD,helix:TEAL,mandala:VIO,branch:GRN,knot:RED,star:PINK};
function h2rgb(hex:string){const v=parseInt(hex.slice(1),16);return {r:(v>>16)&255,g:(v>>8)&255,b:v&255};}
const TYPE_RGB: Record<PrimKey,{r:number,g:number,b:number}> = {
  torus:h2rgb(GOLD),helix:h2rgb(TEAL),mandala:h2rgb(VIO),branch:h2rgb(GRN),knot:h2rgb(RED),star:h2rgb(PINK),
};

/* ── types ───────────────────────────────────────── */
interface Burst { type:PrimKey; x:number; y:number; age:number; max:number; sparks:{x:number;y:number;vx:number;vy:number;life:number;max:number}[]; seed:number[]; coupled:boolean; pq?:{p:number;q:number;crossings:number} }
interface FogP  { x:number;y:number;vx:number;vy:number;r:number;baseA:number;tint:{r:number;g:number;b:number};tintMix:number;phase:number; }
interface Ripple{ x:number;r:number;max:number;age:number;col:string; }
interface Building{ x:number;w:number;h:number;isTower:boolean; }
interface Cascade{ x:number;y:number;vy:number;life:number;col:string; }
interface DirectorPhase{ id:string;name:string;duration:number;primKeys:PrimKey[];density:'sparse'|'normal'|'dense';fogDim:'dim'|'normal'|'clear';waterBias:boolean;forceCommit:boolean;holdC:boolean; }

/* ── math helpers ────────────────────────────────── */
function gcd(a:number,b:number):number{return b===0?a:gcd(b,a%b);}
function getKnotPQ(commits:number,step:number){let p=2+(commits%4),q=3+(Math.floor(step/120)%3);if(gcd(p,q)>1)p++;const x=Math.min(p*(q-1),q*(p-1));return{p,q,crossings:x};}
function envelope(p:number){return Math.sin(Math.min(p,1)*Math.PI);}
function hex2(n:number){return Math.floor(Math.max(0,Math.min(255,n))).toString(16).padStart(2,'0');}

/* ── draw primitives (ctx-stateless helpers) ─────── */
function drawTorus(ctx:CanvasRenderingContext2D,b:Burst,p:number,a:number){
  const e=envelope(p),cx=b.x,cy=b.y;
  [[1,GOLD],[1.6,TEAL],[2.3,VIO]].forEach(([m,col])=>{
    const r=24*(m as number)*(0.3+p*1.1);
    ctx.beginPath();ctx.ellipse(cx,cy,r,r*0.42,0,0,Math.PI*2);
    ctx.strokeStyle=col+hex2(e*a*180);ctx.lineWidth=1.4;ctx.stroke();
    for(let k=0;k<6;k++){const ang=k*Math.PI/3;const px=cx+Math.cos(ang)*r,py=cy+Math.sin(ang)*r*0.42;ctx.beginPath();ctx.arc(px,py,1.6,0,Math.PI*2);ctx.fillStyle=col+hex2(e*a*255);ctx.fill();}
  });
}
function drawHelix(ctx:CanvasRenderingContext2D,b:Burst,p:number,a:number){
  const e=envelope(p),cx=b.x,cy=b.y,ext=70*p,n=28;
  ctx.beginPath();for(let i=0;i<=n;i++){const t2=i/n;const yy=cy+ext/2-t2*ext;const xx=cx+Math.sin(t2*Math.PI*3)*22;i===0?ctx.moveTo(xx,yy):ctx.lineTo(xx,yy);}
  ctx.strokeStyle=TEAL+hex2(e*a*220);ctx.lineWidth=1.6;ctx.stroke();
  ctx.beginPath();for(let i=0;i<=n;i++){const t2=i/n;const yy=cy+ext/2-t2*ext;const xx=cx+Math.sin(t2*Math.PI*3+Math.PI)*22;i===0?ctx.moveTo(xx,yy):ctx.lineTo(xx,yy);}
  ctx.strokeStyle=VIO+hex2(e*a*220);ctx.lineWidth=1.6;ctx.stroke();
  for(let i=0;i<=4;i++){const t2=i/4;const yy=cy+ext/2-t2*ext;const x1=cx+Math.sin(t2*Math.PI*3)*22,x2=cx+Math.sin(t2*Math.PI*3+Math.PI)*22;ctx.beginPath();ctx.moveTo(x1,yy);ctx.lineTo(x2,yy);ctx.strokeStyle=GOLD+hex2(e*a*150);ctx.lineWidth=1;ctx.stroke();}
}
function drawMandala(ctx:CanvasRenderingContext2D,b:Burst,p:number,a:number){
  const e=envelope(p),cx=b.x,cy=b.y,L=46*p;
  const cols=[TEAL,VIO,GOLD,RED,TEAL,VIO];
  for(let k=0;k<6;k++){const ang=k*Math.PI/3;ctx.save();ctx.translate(cx,cy);ctx.rotate(ang);ctx.beginPath();ctx.ellipse(0,-L*0.55,L*0.22,L*0.55,0,0,Math.PI*2);ctx.strokeStyle=cols[k]+hex2(e*a*210);ctx.lineWidth=1.4;ctx.stroke();ctx.restore();}
  ctx.beginPath();ctx.arc(cx,cy,3,0,Math.PI*2);ctx.fillStyle=`rgba(255,255,255,${(e*a).toFixed(2)})`;ctx.fill();
}
function drawBranch(ctx:CanvasRenderingContext2D,b:Burst,p:number,a:number){
  const e=envelope(p),cols=[VIO,TEAL,ORG];
  function seg(x:number,y:number,ang:number,len:number,depth:number){
    if(depth>2||len<3)return;
    const x2=x+Math.cos(ang)*len,y2=y+Math.sin(ang)*len;
    ctx.beginPath();ctx.moveTo(x,y);ctx.lineTo(x2,y2);ctx.strokeStyle=cols[depth]+hex2(e*a*200);ctx.lineWidth=Math.max(0.6,2-depth*0.5);ctx.stroke();
    if(depth===2){ctx.beginPath();ctx.arc(x2,y2,1.6,0,Math.PI*2);ctx.fillStyle=ORG+hex2(e*a*255);ctx.fill();}
    seg(x2,y2,ang-0.42,len*0.72,depth+1);seg(x2,y2,ang+0.42,len*0.72,depth+1);
  }
  seg(b.x,b.y+30*p,-Math.PI/2,38*p,0);
}
function drawKnot(ctx:CanvasRenderingContext2D,b:Burst,p:number,a:number){
  const e=envelope(p),cx=b.x,cy=b.y;
  const pq=b.pq||{p:2,q:3,crossings:2};
  const R=20*p,r2=9*p,n=120;
  ctx.beginPath();
  for(let i=0;i<=n;i++){const tt=(i/n)*Math.PI*2;const rad=R+r2*Math.cos(pq.q*tt);const x=cx+rad*Math.cos(pq.p*tt);const y=cy+rad*Math.sin(pq.p*tt)*0.62;i===0?ctx.moveTo(x,y):ctx.lineTo(x,y);}
  ctx.closePath();ctx.strokeStyle=RED+hex2(e*a*215);ctx.lineWidth=1.5;ctx.stroke();
  const showN=Math.min(pq.crossings,14);
  for(let i=0;i<showN;i++){const tt=(i/showN)*Math.PI*2*1.3;const rad=R+r2*Math.cos(pq.q*tt);const x=cx+rad*Math.cos(pq.p*tt),y=cy+rad*Math.sin(pq.p*tt)*0.62;ctx.beginPath();ctx.arc(x,y,1.3,0,Math.PI*2);ctx.fillStyle=GOLD+hex2(e*a*220);ctx.fill();}
}
function drawStar(ctx:CanvasRenderingContext2D,b:Burst,p:number,a:number){
  const e=envelope(p),cx=b.x,cy=b.y;
  const cols=[TEAL,ORG,VIO,RED,GOLD];
  for(let k=0;k<5;k++){
    const ang=b.seed[k]*Math.PI*2,dist=(20+b.seed[k]*40)*p;
    const px=cx+Math.cos(ang)*dist,py=cy+Math.sin(ang)*dist*0.6;
    ctx.beginPath();ctx.moveTo(cx,cy);ctx.lineTo(px,py);ctx.strokeStyle=VIO+hex2(e*a*140);ctx.lineWidth=0.8;ctx.stroke();
    ctx.beginPath();ctx.arc(px,py,1.8,0,Math.PI*2);ctx.fillStyle=cols[k]+hex2(e*a*255);ctx.fill();
  }
  ctx.beginPath();ctx.arc(cx,cy,2.4,0,Math.PI*2);ctx.fillStyle=`rgba(255,255,255,${(e*a*0.9).toFixed(2)})`;ctx.fill();
}
const DRAWERS:{[k in PrimKey]:(ctx:CanvasRenderingContext2D,b:Burst,p:number,a:number)=>void}={
  torus:drawTorus,helix:drawHelix,mandala:drawMandala,branch:drawBranch,knot:drawKnot,star:drawStar,
};

/* ── phase factory ───────────────────────────────── */
let phaseIdN=0;
function mkPhase(name:string,duration:number,primKeys:PrimKey[],density:'sparse'|'normal'|'dense',fogDim:'dim'|'normal'|'clear',waterBias:boolean,forceCommit:boolean,holdC:boolean):DirectorPhase{
  return{id:'ph'+(phaseIdN++),name,duration,primKeys:[...primKeys],density,fogDim,waterBias,forceCommit,holdC};
}
const ALL_KEYS:PrimKey[]=['torus','helix','mandala','branch','knot','star'];
const PRESETS:{[k:string]:DirectorPhase[]}={
  slowbuild:[
    mkPhase('Whisper',10,['star'],'sparse','dim',false,false,true),
    mkPhase('Introduce',10,['star','torus'],'sparse','normal',false,false,true),
    mkPhase('Build',12,['star','torus','helix'],'normal','normal',false,false,true),
    mkPhase('Gather',12,['star','torus','helix','mandala'],'normal','normal',false,false,true),
    mkPhase('Surge',10,ALL_KEYS,'dense','clear',false,true,false),
    mkPhase('Afterglow',8,['helix'],'sparse','dim',true,false,false),
  ],
  symmetrical:[
    mkPhase('Mirror Seed',8,['mandala'],'sparse','normal',true,false,true),
    mkPhase('Paired Calls',10,['mandala','knot'],'normal','normal',true,false,true),
    mkPhase('Reflection Build',10,['mandala','knot','torus'],'normal','normal',true,false,true),
    mkPhase('Full Symmetry',12,ALL_KEYS,'dense','clear',true,true,false),
    mkPhase('Settle',8,['torus'],'sparse','dim',true,false,false),
  ],
  knotarc:[
    mkPhase('Knot Seed',14,['knot'],'sparse','dim',false,false,true),
    mkPhase('Entangle',16,['knot','branch'],'normal','normal',false,false,true),
    mkPhase('Topology Shift',18,['knot','branch','star'],'normal','normal',false,false,true),
    mkPhase('Deep Weave',16,['knot','branch','star','helix'],'sparse','dim',false,false,true),
    mkPhase('Knot Reveal',10,ALL_KEYS,'dense','clear',false,true,false),
  ],
};

/* ════════════════════════════════════════════════════
   COMPONENT
════════════════════════════════════════════════════ */
export default function FireworkCoherencePage() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const gaugeRef  = useRef<HTMLCanvasElement>(null);
  const rafRef    = useRef(0);

  /* ── simulation mutable state (lives in RAF loop) ── */
  const S = useRef({
    C:0.7112, RHO:0.4475, stepN:0, commits:0, frame:0, beatTimer:0, t:0, flash:0,
    playing:true,
    fogOn:true, waterOn:true, interactOn:true,
    densityMod:1, fogDimLevel:1, waterBias:false,
    directorMode:false, currentPhaseIdx:-1, phaseTimer:0, phaseFrames:0,
    interactionEvents:0,
    prims: PRIMS_INIT.map(p=>({...p})) as Prim[],
    timeline:[] as DirectorPhase[],
    bursts:[] as Burst[],
    cascade:[] as Cascade[],
    fog:[] as FogP[],
    ripples:[] as Ripple[],
    accretionLayers:[] as string[],
    buildings:[] as Building[],
    W:900, H:600, towerX:650, towerBaseY:500, towerTopY:200, waterY:500,
  });

  /* ── react state for UI panels ── */
  const [started, setStarted]       = useState(false);
  const [uiC, setUiC]               = useState(0.7112);
  const [uiRho, setUiRho]           = useState(0.4475);
  const [uiStep, setUiStep]         = useState(0);
  const [uiCommits, setUiCommits]   = useState(0);
  const [uiActive, setUiActive]     = useState(6);
  const [uiInter, setUiInter]       = useState(0);
  const [uiKnot, setUiKnot]         = useState('T(2,3) · χ=2');
  const [uiFrame, setUiFrame]       = useState(0);
  const [isPlaying, setIsPlaying]   = useState(true);
  const [fogOn, setFogOn]           = useState(true);
  const [waterOn, setWaterOn]       = useState(true);
  const [interactOn, setInteractOn] = useState(true);
  const [prims, setPrims]           = useState<Prim[]>(PRIMS_INIT.map(p=>({...p})));
  const [dirOpen, setDirOpen]       = useState(false);
  const [dirPlaying, setDirPlaying] = useState(false);
  const [timeline, setTimeline]     = useState<DirectorPhase[]>([]);
  const [curPhaseIdx, setCurPhaseIdx] = useState(-1);
  const [botMid, setBotMid]         = useState('Six Directions · Choreography · DCMA · Physical Coupling — SHIA MILLER 2026');
  const [logEntries, setLogEntries] = useState<{msg:string;col:string;n:number}[]>([]);

  const addLog = useCallback((msg:string,col=BRIGHT)=>{
    setLogEntries(p=>[{msg,col,n:S.current.stepN},...p.slice(0,29)]);
  },[]);

  /* ── main effect: canvas + RAF loop ── */
  useEffect(()=>{
    const cv=canvasRef.current; if(!cv) return;
    const ctx=cv.getContext('2d')!;
    const reflCV=document.createElement('canvas');
    const reflCtx=reflCV.getContext('2d')!;

    function initFog(){
      const s=S.current;
      s.fog=[];
      for(let i=0;i<110;i++) s.fog.push({
        x:Math.random()*s.W, y:s.waterY*0.62+Math.random()*s.waterY*0.36,
        vx:0,vy:0, r:14+Math.random()*28,
        baseA:0.025+Math.random()*0.045,
        tint:{r:170,g:195,b:215}, tintMix:0, phase:Math.random()*Math.PI*2,
      });
    }

    function resize(){
      const s=S.current;
      const parent=cv.parentElement!;
      const W=parent.clientWidth, H=parent.clientHeight;
      const dpr=window.devicePixelRatio||1;
      cv.width=W*dpr; cv.height=H*dpr;
      cv.style.width=W+'px'; cv.style.height=H+'px';
      ctx.setTransform(dpr,0,0,dpr,0,0);
      s.W=W; s.H=H;
      s.waterY=H*0.86;
      s.towerX=W*0.72; s.towerBaseY=s.waterY; s.towerTopY=s.waterY*0.42;
      reflCV.width=W; reflCV.height=Math.max(1,Math.ceil(s.waterY));
      s.buildings=[];
      let x=0;
      while(x<W){
        const bw=24+Math.random()*46;
        const isTower=Math.abs((x+bw/2)-s.towerX)<30;
        const bh=isTower?(s.towerBaseY-s.towerTopY):s.waterY*0.14+Math.random()*s.waterY*0.3;
        s.buildings.push({x,w:bw,h:bh,isTower});
        x+=bw+Math.random()*5;
      }
      initFog();
    }
    resize();
    const ro=new ResizeObserver(resize); ro.observe(cv.parentElement!);

    /* ── spawn burst ── */
    function spawnBurst(typeKey:PrimKey,x:number,y:number){
      const s=S.current;
      const seed=[Math.random(),Math.random(),Math.random(),Math.random(),Math.random()];
      const sparks:Burst['sparks']=[];
      for(let i=0;i<10;i++){
        const ang=Math.random()*Math.PI*2,sp=0.6+Math.random()*1.8;
        sparks.push({x,y,vx:Math.cos(ang)*sp,vy:Math.sin(ang)*sp-0.4,life:0,max:40+Math.random()*30});
      }
      const burst:Burst={type:typeKey,x,y,age:0,max:75+Math.random()*20,sparks,seed,coupled:false};
      if(typeKey==='knot') burst.pq=getKnotPQ(s.commits,s.stepN);
      s.bursts.push(burst);
    }

    function randActivePrim(prims:Prim[]):Prim|null{
      const act=prims.filter(p=>p.active);
      if(!act.length) return null;
      const tw=act.reduce((s2,p)=>s2+p.w,0);
      let r=Math.random()*tw;
      for(const p of act){r-=p.w;if(r<=0)return p;}
      return act[act.length-1];
    }

    function launchX(typeKey:PrimKey){
      const s=S.current;
      if(typeKey==='helix'&&Math.random()<0.6) return s.towerX+(Math.random()-0.5)*30;
      return s.W*0.08+Math.random()*s.W*0.84;
    }
    function launchY(){
      const s=S.current;
      if(s.waterBias) return s.waterY*0.34+Math.random()*s.waterY*0.34;
      return s.H*0.16+Math.random()*s.waterY*0.3;
    }

    /* ── fog update ── */
    function updateFog(){
      const s=S.current;
      if(!s.fogOn) return;
      s.fog.forEach(f=>{
        f.phase+=0.004;
        let fx=Math.sin(f.phase+f.y*0.01)*0.08, fy=Math.cos(f.phase*0.7)*0.03;
        s.bursts.forEach(b=>{
          const dx=f.x-b.x,dy=f.y-b.y,d=Math.sqrt(dx*dx+dy*dy)+1;
          if(d<150){const push=(1-d/150)*1.3;fx+=(dx/d)*push;fy+=(dy/d)*push*0.4;const e=envelope(b.age/b.max);f.tint=TYPE_RGB[b.type];f.tintMix=Math.min(1,f.tintMix+e*0.05*(1-d/150));}
        });
        f.vx=f.vx*0.9+fx*0.15; f.vy=f.vy*0.9+fy*0.15;
        f.x+=f.vx; f.y+=f.vy;
        if(f.x<-40)f.x=s.W+40; if(f.x>s.W+40)f.x=-40;
        if(f.y<s.waterY*0.4)f.y=s.waterY*0.4; if(f.y>s.waterY-4)f.y=s.waterY-4;
        f.tintMix*=0.985;
      });
    }

    /* ── trigger commit ── */
    function triggerCommit(){
      const s=S.current;
      s.commits++;
      const act=s.prims.filter(p=>p.active);
      const n=Math.max(act.length,1);
      act.forEach((p,i)=>{spawnBurst(p.key,s.W*0.1+(s.W*0.8)*(i/(n-1||1)),launchY());});
      const layerColor=act.length?act[Math.floor(Math.random()*act.length)].cv:GOLD;
      s.accretionLayers.push(layerColor);
      if(s.accretionLayers.length>14) s.accretionLayers.shift();
      s.C*=0.55; s.flash=1;
      for(let i=0;i<18;i++) s.cascade.push({x:Math.random()*s.W,y:-10,vy:1.5+Math.random()*2,life:0,col:layerColor});
      s.ripples.push({x:s.W*0.15+Math.random()*s.W*0.7,r:8,max:70,age:0,col:layerColor});
      s.ripples.push({x:s.W*0.15+Math.random()*s.W*0.7,r:6,max:55,age:0,col:layerColor});
      addLog(`Ψ COHERENT STATE COMMITTED — layer ${s.accretionLayers.length} accreted (n=${s.commits})`,GOLD);
    }

    /* ── beat step ── */
    function stepBeat(){
      const s=S.current;
      s.stepN++;
      const act=s.prims.filter(p=>p.active);
      const avgW=act.length?act.reduce((s2,p)=>s2+p.w,0)/act.length/100:0;
      const wheelHit=WHEEL.has(s.stepN%30);

      const curPhase=(s.directorMode&&s.currentPhaseIdx>=0&&s.timeline[s.currentPhaseIdx])?s.timeline[s.currentPhaseIdx]:null;
      const holdC=curPhase?!!curPhase.holdC:false;

      s.C+=act.length*avgW*0.009+Math.sin(s.stepN*0.18)*0.004-0.0035+(wheelHit?0.015:0);
      s.C=Math.max(0.3,Math.min(0.97,s.C));
      s.RHO+=Math.sin(s.stepN*0.27+1)*0.0028+act.length*0.0009;
      s.RHO=Math.max(0.2,Math.min(0.82,s.RHO));

      if(!holdC&&s.C>=PHI_INV){triggerCommit();}
      else if(holdC&&s.C>=PHI_INV){s.C=PHI_INV-0.015;}

      if(wheelHit){
        const pr=randActivePrim(s.prims);if(pr)spawnBurst(pr.key,launchX(pr.key),launchY());
        if(Math.random()<0.5*s.densityMod){const pr2=randActivePrim(s.prims);if(pr2)spawnBurst(pr2.key,launchX(pr2.key),launchY());}
      } else if(Math.random()<0.4*s.densityMod){
        const pr=randActivePrim(s.prims);if(pr)spawnBurst(pr.key,launchX(pr.key),launchY());
      }
    }

    /* ── director tick ── */
    function directorTick(){
      const s=S.current;
      if(!s.directorMode) return;
      if(s.currentPhaseIdx===-1){
        s.currentPhaseIdx=0;
        s.phaseFrames=Math.max(60,s.timeline[0].duration*60);
        s.phaseTimer=0;
        applyPhase(s.timeline[0]);
      }
      s.phaseTimer++;
      if(s.phaseTimer>=s.phaseFrames){
        const fin=s.timeline[s.currentPhaseIdx];
        if(fin.forceCommit) triggerCommit();
        s.currentPhaseIdx++;
        if(s.currentPhaseIdx>=s.timeline.length){
          addLog('DIRECTOR: Sequence complete',GOLD);
          s.directorMode=false;s.currentPhaseIdx=-1;s.phaseTimer=0;
          s.fogDimLevel=1;s.densityMod=1;s.waterBias=false;
          setDirPlaying(false);setBotMid('Six Directions · Choreography · DCMA · Physical Coupling — SHIA MILLER 2026');
        } else {
          s.phaseTimer=0;s.phaseFrames=Math.max(60,s.timeline[s.currentPhaseIdx].duration*60);
          applyPhase(s.timeline[s.currentPhaseIdx]);
        }
      }
      if(s.frame%15===0){
        setCurPhaseIdx(s.currentPhaseIdx);
        if(s.directorMode&&s.currentPhaseIdx>=0&&s.timeline[s.currentPhaseIdx]){
          const remain=Math.max(0,Math.ceil((s.phaseFrames-s.phaseTimer)/60));
          setBotMid(`🎬 DIRECTING: "${s.timeline[s.currentPhaseIdx].name}" — ${remain}s left (phase ${s.currentPhaseIdx+1}/${s.timeline.length})`);
        }
      }
    }

    function applyPhase(phase:DirectorPhase){
      const s=S.current;
      s.prims.forEach(pr=>{pr.active=phase.primKeys.includes(pr.key);});
      setPrims(s.prims.map(p=>({...p})));
      s.densityMod=phase.density==='sparse'?0.4:phase.density==='dense'?1.8:1;
      s.fogDimLevel=phase.fogDim==='dim'?0.3:phase.fogDim==='clear'?1.7:1;
      s.waterBias=!!phase.waterBias;
      addLog(`DIRECTOR: "${phase.name}" — ${phase.primKeys.length} primitives, ${phase.density}${phase.holdC?', C held':''}`,BRIGHT);
    }

    /* ── draw gauge ── */
    function drawGauge(){
      const gc=gaugeRef.current;if(!gc)return;
      const s=S.current;
      const gctx=gc.getContext('2d')!;
      gctx.clearRect(0,0,190,92);
      gctx.fillStyle='rgba(2,8,16,0.7)';gctx.fillRect(0,0,190,92);
      const bx=95,baseY=84,topY=16;
      gctx.fillStyle='#0a1628';gctx.fillRect(bx-7,topY,14,baseY-topY);
      s.accretionLayers.forEach((col,i)=>{
        const ly=baseY-10-i*5.2;
        gctx.fillStyle=col+'cc';gctx.fillRect(bx-9,ly,18,4);
      });
      gctx.fillStyle='rgba(201,168,76,0.6)';gctx.font='8px Share Tech Mono';
      gctx.fillText(`layers: ${s.accretionLayers.length}`,8,88);
    }

    /* ── main draw ── */
    function drawScene(){
      const s=S.current;
      const {W,H,waterY,towerX,towerTopY,towerBaseY}=s;
      if(cv.width===0||cv.height===0||W===0||H===0) return;
      ctx.clearRect(0,0,W,H);
      // sky
      const sky=ctx.createLinearGradient(0,0,0,H);
      sky.addColorStop(0,'#020912');sky.addColorStop(0.6,'#03101f');sky.addColorStop(1,'#050d18');
      ctx.fillStyle=sky;ctx.fillRect(0,0,W,H);

      updateFog();

      // buildings
      s.buildings.forEach(b=>{
        let glow=0,gcol=TEAL;
        s.bursts.forEach(br=>{
          const d=Math.abs((b.x+b.w/2)-br.x);
          if(d<140){const e2=envelope(br.age/br.max);const inten=(1-d/140)*e2;if(inten>glow){glow=inten;gcol=TYPE_COL[br.type];}}
        });
        ctx.fillStyle='#040b15';ctx.fillRect(b.x,waterY-b.h,b.w,b.h);
        if(glow>0.04){ctx.fillStyle=gcol+hex2(glow*90);ctx.fillRect(b.x,waterY-b.h,b.w,b.h);}
        if(!b.isTower){
          for(let wy=waterY-b.h+8;wy<waterY-6;wy+=11){
            for(let wx=b.x+4;wx<b.x+b.w-4;wx+=8){
              ctx.fillStyle=`rgba(201,168,76,${(0.06+glow*0.3).toFixed(2)})`;ctx.fillRect(wx,wy,2.5,4);
            }
          }
        }
      });

      // accretion tower layers
      s.accretionLayers.forEach((col,i)=>{
        const ly=towerTopY-6-i*7;
        ctx.fillStyle=col+'aa';ctx.fillRect(towerX-16,ly,32,5);
        ctx.strokeStyle=col+'55';ctx.lineWidth=0.6;ctx.strokeRect(towerX-16,ly,32,5);
      });

      // fog
      if(s.fogOn){
        s.fog.forEach(f=>{
          const mix=f.tintMix;
          const tr=Math.floor(190*(1-mix)+f.tint.r*mix);
          const tg=Math.floor(205*(1-mix)+f.tint.g*mix);
          const tb=Math.floor(220*(1-mix)+f.tint.b*mix);
          const a2=Math.max(0,(f.baseA+mix*0.06)*s.fogDimLevel);
          const grd=ctx.createRadialGradient(f.x,f.y,0,f.x,f.y,f.r);
          grd.addColorStop(0,`rgba(${tr},${tg},${tb},${a2.toFixed(3)})`);grd.addColorStop(1,'rgba(0,0,0,0)');
          ctx.beginPath();ctx.arc(f.x,f.y,f.r,0,Math.PI*2);ctx.fillStyle=grd;ctx.fill();
        });
      }

      // bursts
      s.bursts.forEach(b=>{
        b.age++;
        const p=b.age/b.max;
        DRAWERS[b.type](ctx,b,p,1);
        b.sparks.forEach(sp=>{
          sp.life++;sp.x+=sp.vx;sp.y+=sp.vy;sp.vy+=0.025;
          const spA=Math.max(0,1-sp.life/sp.max);const e2=envelope(p);
          ctx.beginPath();ctx.arc(sp.x,sp.y,1.1,0,Math.PI*2);
          ctx.fillStyle=`rgba(255,235,200,${(spA*e2*0.8).toFixed(2)})`;ctx.fill();
        });
      });
      s.bursts=s.bursts.filter(b=>b.age<b.max);

      // primitive coupling
      if(s.interactOn){
        for(let i=0;i<s.bursts.length;i++){
          for(let j=i+1;j<s.bursts.length;j++){
            const b1=s.bursts[i],b2=s.bursts[j];
            if(b1.type===b2.type) continue;
            const dx=b2.x-b1.x,dy=b2.y-b1.y,d=Math.sqrt(dx*dx+dy*dy);
            if(d<170){
              const e1=envelope(b1.age/b1.max),e2=envelope(b2.age/b2.max);
              const strength=(1-d/170)*Math.min(e1,e2);
              if(strength>0.08){
                const grad=ctx.createLinearGradient(b1.x,b1.y,b2.x,b2.y);
                grad.addColorStop(0,TYPE_COL[b1.type]+hex2(strength*180));
                grad.addColorStop(1,TYPE_COL[b2.type]+hex2(strength*180));
                ctx.beginPath();ctx.moveTo(b1.x,b1.y);ctx.lineTo(b2.x,b2.y);
                ctx.strokeStyle=grad;ctx.lineWidth=0.8+strength*1.4;ctx.stroke();
                const pt=(s.frame*0.02+i*0.31+j*0.17)%1;
                const px=b1.x+dx*pt,py=b1.y+dy*pt;
                ctx.beginPath();ctx.arc(px,py,2,0,Math.PI*2);
                ctx.fillStyle=`rgba(255,255,255,${(strength*0.9).toFixed(2)})`;ctx.fill();
                if(!b1.coupled){b1.coupled=true;b2.coupled=true;s.interactionEvents++;}
              }
            }
          }
        }
      }

      // cascade streaks
      s.cascade.forEach(c=>{c.life++;c.y+=c.vy;});
      s.cascade=s.cascade.filter(c=>c.life<140&&c.y<waterY);
      s.cascade.forEach(c=>{
        const al=Math.max(0,1-c.life/140);
        ctx.beginPath();ctx.moveTo(c.x,c.y);ctx.lineTo(c.x,c.y-8);
        ctx.strokeStyle=c.col+hex2(al*150);ctx.lineWidth=1;ctx.stroke();
      });

      // water reflection
      if(s.waterOn && cv.width>0 && cv.height>0 && waterY>0){
        reflCtx.clearRect(0,0,W,waterY);
        reflCtx.drawImage(cv,0,0,W,waterY,0,0,W/window.devicePixelRatio,waterY);
        ctx.fillStyle='#020810';ctx.fillRect(0,waterY,W,H-waterY);
        ctx.save();
        ctx.beginPath();ctx.rect(0,waterY,W,H-waterY);ctx.clip();
        const depth=H-waterY;
        for(let ry=0;ry<depth;ry+=2){
          const srcY=Math.max(0,waterY-ry*0.7);
          const wob=Math.sin(ry*0.07+s.t*1.3)*5;
          ctx.globalAlpha=Math.max(0,0.28*(1-ry/depth));
          ctx.drawImage(reflCV,0,srcY,reflCV.width,1,wob,waterY+ry,W,2);
        }
        ctx.globalAlpha=1;
        s.ripples.forEach(rp=>{
          rp.age++;const rp2=rp.age/rp.max;const rr=rp.r+rp2*60;
          ctx.beginPath();ctx.ellipse(rp.x,waterY+8,rr,rr*0.16,0,0,Math.PI*2);
          ctx.strokeStyle=rp.col+hex2(Math.max(0,(1-rp2))*140);ctx.lineWidth=1;ctx.stroke();
        });
        s.ripples=s.ripples.filter(rp=>rp.age<rp.max);
        ctx.restore();
      } else {
        ctx.fillStyle='#050d18';ctx.fillRect(0,waterY,W,H-waterY);
      }

      // commit flash + coherence aura
      if(s.flash>0.001){
        ctx.fillStyle=`rgba(255,250,235,${(s.flash*0.18).toFixed(3)})`;ctx.fillRect(0,0,W,H);
        s.flash*=0.9;
      }
      const near=Math.max(0,(s.C-0.45)/(PHI_INV-0.45));
      if(near>0){ctx.fillStyle=`rgba(201,168,76,${(near*0.05).toFixed(3)})`;ctx.fillRect(0,0,W,H);}

      // scan lines
      for(let sl=0;sl<H;sl+=4){ctx.fillStyle='rgba(0,0,0,0.012)';ctx.fillRect(0,sl,W,1);}
    }

    /* ── RAF loop ── */
    function loop(){
      const s=S.current;
      directorTick();
      if(s.playing){
        s.beatTimer++;
        if(s.beatTimer>=BEAT_FRAMES){s.beatTimer=0;stepBeat();}
      }
      drawScene();
      drawGauge();
      s.t+=0.016;s.frame++;

      // periodic UI updates
      if(s.frame%6===0){
        setUiC(parseFloat(s.C.toFixed(4)));
        setUiRho(parseFloat(s.RHO.toFixed(4)));
        setUiStep(s.stepN);
        setUiCommits(s.commits);
        setUiActive(s.prims.filter(p=>p.active).length);
        setUiInter(s.interactionEvents);
        const pq=getKnotPQ(s.commits,s.stepN);
        setUiKnot(`T(${pq.p},${pq.q}) · χ=${pq.crossings}`);
        setUiFrame(s.frame);
      }
      rafRef.current=requestAnimationFrame(loop);
    }
    rafRef.current=requestAnimationFrame(loop);

    addLog('AETHER Ψ-Coherence Light Sculptor initialized — Director Mode online',GOLD);
    addLog('Mod-30 prime wheel {1,7,11,13,17,19,23,29} active as beat source',BRIGHT);
    addLog('Foglet field, water reflection, and primitive coupling engaged',TEAL);

    return ()=>{cancelAnimationFrame(rafRef.current);ro.disconnect();};
  // eslint-disable-next-line react-hooks/exhaustive-deps
  },[]);

  /* ── control handlers ── */
  function togglePlay(){const s=S.current;s.playing=!s.playing;setIsPlaying(s.playing);}
  function forceCommit(){
    const s=S.current;
    s.C=PHI_INV+0.01;
  }
  function resetAll(){
    const s=S.current;
    s.C=0.7112;s.RHO=0.4475;s.stepN=0;s.commits=0;s.bursts=[];s.accretionLayers=[];s.cascade=[];s.ripples=[];s.interactionEvents=0;
    s.directorMode=false;s.currentPhaseIdx=-1;s.phaseTimer=0;
    s.fogDimLevel=1;s.densityMod=1;s.waterBias=false;
    s.prims.forEach(p=>{p.active=true;});
    setPrims(s.prims.map(p=>({...p})));
    setDirPlaying(false);setCurPhaseIdx(-1);
    setBotMid('Six Directions · Choreography · DCMA · Physical Coupling — SHIA MILLER 2026');
    addLog('SYSTEM RESET — Ψ reinitialized to baseline',BRIGHT);
  }
  function toggleFog(){const s=S.current;s.fogOn=!s.fogOn;setFogOn(s.fogOn);addLog(s.fogOn?'Foglet field ENGAGED':'Foglet field disengaged',s.fogOn?TEAL:RED);}
  function toggleWater(){const s=S.current;s.waterOn=!s.waterOn;setWaterOn(s.waterOn);addLog(s.waterOn?'Water reflection ENGAGED':'Water reflection disengaged',s.waterOn?TEAL:RED);}
  function toggleInteract(){const s=S.current;s.interactOn=!s.interactOn;setInteractOn(s.interactOn);addLog(s.interactOn?'Primitive coupling ENGAGED':'Primitive coupling disengaged',s.interactOn?TEAL:RED);}

  function setPrimActive(idx:number,active:boolean){
    const s=S.current;s.prims[idx].active=active;
    setPrims(s.prims.map(p=>({...p})));
    addLog(`${s.prims[idx].name} ${active?'ENGAGED':'disengaged'} — Ψ superposition updated`,s.prims[idx].cv);
  }
  function setPrimWeight(idx:number,w:number){
    const s=S.current;s.prims[idx].w=w;
    setPrims(s.prims.map(p=>({...p})));
  }

  // director
  function startDirector(){
    const s=S.current;
    if(s.timeline.length===0){addLog('DIRECTOR: timeline empty — add a phase or load a preset',RED);return;}
    s.directorMode=true;s.currentPhaseIdx=-1;s.phaseTimer=0;s.phaseFrames=0;
    setDirPlaying(true);addLog('DIRECTOR: Sequence started',GOLD);
  }
  function stopDirector(){
    const s=S.current;
    s.directorMode=false;s.currentPhaseIdx=-1;s.phaseTimer=0;
    s.fogDimLevel=1;s.densityMod=1;s.waterBias=false;
    setCurPhaseIdx(-1);setDirPlaying(false);
    setBotMid('Six Directions · Choreography · DCMA · Physical Coupling — SHIA MILLER 2026');
  }
  function toggleDirectorPlay(){dirPlaying?stopDirector():startDirector();}

  function loadPreset(key:string){
    const phases=PRESETS[key].map(p=>({...p,primKeys:[...p.primKeys]}));
    S.current.timeline=[...phases];setTimeline([...phases]);
    addLog(`DIRECTOR: Preset "${key}" loaded — ${phases.length} phases`,GOLD);
    startDirector();
  }
  function addPhase(){
    const p=mkPhase('New Phase',8,ALL_KEYS,'normal','normal',false,false,false);
    const next=[...S.current.timeline,p];S.current.timeline=next;setTimeline([...next]);
  }
  function removePhase(id:string){
    const next=S.current.timeline.filter(p=>p.id!==id);S.current.timeline=next;setTimeline([...next]);
  }
  function clearTimeline(){
    S.current.timeline=[];setTimeline([]);stopDirector();addLog('DIRECTOR: Timeline cleared',BRIGHT);
  }
  function updatePhaseField(id:string,field:string,val:string|boolean|number){
    const s=S.current;
    const ph=s.timeline.find(p=>p.id===id);if(!ph)return;
    (ph as any)[field]=val;
    setTimeline([...s.timeline]);
  }
  function togglePhasePrim(id:string,key:PrimKey){
    const s=S.current;
    const ph=s.timeline.find(p=>p.id===id);if(!ph)return;
    if(ph.primKeys.includes(key)) ph.primKeys=ph.primKeys.filter(k=>k!==key);
    else ph.primKeys.push(key);
    setTimeline([...s.timeline]);
  }

  /* ── styles ── */
  const tbtn=(on:boolean,col=BRIGHT):React.CSSProperties=>({
    fontFamily:MN,fontSize:8.5,padding:'5px 9px',background:on?`rgba(31,212,200,0.18)`:'rgba(46,109,164,0.08)',
    border:`1px solid ${on?TEAL:BORD2}`,color:on?'#fff':BRIGHT,cursor:'pointer',
    letterSpacing:1,borderRadius:2,transition:'all .2s',textTransform:'uppercase',whiteSpace:'nowrap',
  });
  const tbtnGold=(on:boolean):React.CSSProperties=>({
    ...tbtn(on,GOLD),borderColor:GOLD,color:GOLD,background:on?'rgba(201,168,76,0.15)':'rgba(0,0,0,0)',
  });
  const plabel:React.CSSProperties={fontFamily:MN,fontSize:7.5,letterSpacing:2.2,color:DIM,textTransform:'uppercase',marginBottom:7,paddingBottom:4,borderBottom:`1px solid ${BORD}`};
  const smalltxt:React.CSSProperties={fontSize:8.5,color:DIM,lineHeight:1.5,padding:'0 2px',marginBottom:7};
  const eqCard=(label:string,value:number,max:number,col:string,thresh?:number)=>(
    <div style={{background:'rgba(0,0,0,0.4)',border:`1px solid ${BORD}`,borderRadius:2,padding:'7px 8px',marginBottom:6}}>
      <div style={{fontFamily:MN,fontSize:8,color:DIM,letterSpacing:1,marginBottom:2}}>{label}</div>
      <div style={{fontFamily:OR,fontSize:13,fontWeight:700,color:col}}>{value.toFixed(3)}</div>
      <div style={{height:3,borderRadius:2,background:BORD,marginTop:5,overflow:'hidden',position:'relative'}}>
        <div style={{position:'absolute',inset:0,borderRadius:2,width:`${Math.min(100,value/max*100)}%`,background:col,transition:'width .25s'}}/>
        {thresh!==undefined&&<div style={{position:'absolute',top:-2,left:`${thresh/max*100}%`,width:1.5,height:7,background:GOLD}}/>}
      </div>
    </div>
  );

  const totalDur=timeline.reduce((s2,p)=>s2+p.duration,0)||1;

  return (
    <div style={{width:'100%',height:'100%',display:'grid',gridTemplateRows:'54px 1fr 28px',gridTemplateColumns:'202px 1fr 212px',background:BG,color:'#d4e8f7',fontFamily:RJ,overflow:'hidden'}}>

      {/* ── TOP BAR ── */}
      <div style={{gridColumn:'1/-1',display:'flex',alignItems:'center',justifyContent:'space-between',padding:'0 14px',background:'rgba(1,4,8,.97)',borderBottom:`1px solid ${BORD}`,gap:10,flexWrap:'wrap'}}>
        <div>
          <div style={{fontFamily:OR,fontSize:12,fontWeight:900,letterSpacing:2.5,color:BRIGHT,textShadow:`0 0 14px ${TEAL}`}}>Ψ-COHERENCE LIGHT SCULPTOR</div>
          <div style={{fontSize:7.5,letterSpacing:1.5,color:DIM,marginTop:1}}>Six Directions · Choreography · DCMA · Physical Coupling · Director</div>
        </div>
        <div style={{display:'flex',gap:11,flexWrap:'wrap'}}>
          {([['Step n',uiStep],['C(x,t)',uiC.toFixed(3)],['ρ DMF',uiRho.toFixed(3)],['Commits',uiCommits],['Active Ψ_i',uiActive],['Couplings',uiInter]] as [string,string|number][]).map(([l,v])=>(
            <div key={l} style={{textAlign:'center'}}>
              <div style={{fontFamily:OR,fontSize:11,fontWeight:700,color:BRIGHT,textShadow:`0 0 6px ${TEAL}`}}>{v}</div>
              <div style={{fontSize:6.5,letterSpacing:1.2,color:DIM,textTransform:'uppercase'}}>{l}</div>
            </div>
          ))}
        </div>
        <div style={{display:'flex',gap:5,flexWrap:'wrap',justifyContent:'flex-end'}}>
          <button style={tbtn(isPlaying)} onClick={togglePlay}>{isPlaying?'⏸ PAUSE':'▶ PLAY'}</button>
          <button style={tbtnGold(false)} onClick={forceCommit}>⚡ FORCE COMMIT</button>
          <button style={tbtn(dirOpen)} onClick={()=>setDirOpen(d=>!d)}>🎬 DIRECTOR</button>
          <button style={tbtn(false)} onClick={resetAll}>↺ RESET</button>
        </div>
      </div>

      {/* ── LEFT PANEL ── */}
      <div style={{gridColumn:1,padding:'10px 9px',background:'linear-gradient(90deg,rgba(1,4,8,.95),transparent)',borderRight:`1px solid ${BORD}`,overflowY:'auto',scrollbarWidth:'none'}}>
        <div style={plabel}>Stroke Primitives Ψ_i</div>
        {prims.map((p,i)=>(
          <div key={p.key} onClick={()=>setPrimActive(i,!p.active)}
            style={{marginBottom:7,padding:7,background:'rgba(0,0,0,.35)',borderRadius:2,cursor:'pointer',
              border:`1px solid ${p.active?p.cv:BORD}`,
              boxShadow:p.active?`0 0 10px ${p.cv}22`:'none',transition:'all .2s'}}>
            <div style={{display:'flex',alignItems:'center',gap:6,marginBottom:3}}>
              <div style={{width:6,height:6,borderRadius:'50%',flexShrink:0,background:p.active?p.cv:DIM,boxShadow:p.active?`0 0 5px ${p.cv}`:undefined}}/>
              <div style={{fontFamily:OR,fontSize:8,fontWeight:700,letterSpacing:1.2,color:p.active?p.cv:DIM}}>{p.name}</div>
            </div>
            <div style={{fontSize:8.5,color:DIM,marginBottom:5,lineHeight:1.25}}>{p.sub}</div>
            <div style={{display:'flex',alignItems:'center',gap:5}} onClick={e=>e.stopPropagation()}>
              <input type="range" min={0} max={100} value={p.w} style={{flex:1,height:2,accentColor:p.cv}}
                onChange={e=>{setPrimWeight(i,parseInt(e.target.value));}}/>
              <span style={{fontFamily:MN,fontSize:7.5,color:DIM,width:20,textAlign:'right'}}>{p.w}</span>
            </div>
          </div>
        ))}

        <div style={{...plabel,marginTop:8}}>Beat Source</div>
        <div style={smalltxt}>Mod-30 wheel spokes &#123;1,7,11,13,17,19,23,29&#125; trigger guaranteed launches — prime-wheel thread driving the score.</div>

        <div style={plabel}>Physical Layer</div>
        <button style={{...tbtn(fogOn),width:'100%',display:'block',textAlign:'center',marginBottom:5}} onClick={toggleFog}>🌫 FOGLET FIELD</button>
        <button style={{...tbtn(waterOn),width:'100%',display:'block',textAlign:'center',marginBottom:5}} onClick={toggleWater}>🌊 WATER REFLECT</button>
        <button style={{...tbtn(interactOn),width:'100%',display:'block',textAlign:'center',marginBottom:5}} onClick={toggleInteract}>⚡ PRIMITIVE COUPLING</button>
      </div>

      {/* ── CENTER CANVAS ── */}
      <div style={{gridColumn:2,position:'relative',overflow:'hidden'}}>
        {/* start gate */}
        {!started&&(
          <div style={{position:'absolute',inset:0,zIndex:9,background:'rgba(1,4,8,.9)',display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',gap:14,backdropFilter:'blur(2px)'}}>
            <div style={{fontFamily:OR,fontSize:18,letterSpacing:3,color:BRIGHT,textShadow:`0 0 14px ${TEAL}`}}>ENGAGE THE ENGINE</div>
            <div style={{fontSize:11,color:DIM,letterSpacing:1,maxWidth:360,textAlign:'center',lineHeight:1.5}}>
              Six stroke primitives superpose into Ψ, coupled through a physical layer. When C(x,t) crosses φ⁻¹ = 0.618034 it commits and the tower accretes a layer — or open Director Mode to choreograph that arc yourself.
            </div>
            <button onClick={()=>setStarted(true)}
              style={{fontFamily:OR,fontSize:11,letterSpacing:2,padding:'11px 26px',background:`rgba(31,212,200,.1)`,border:`1px solid ${TEAL}`,color:TEAL,cursor:'pointer',borderRadius:3}}>
              ▶ START
            </button>
          </div>
        )}
        <canvas ref={canvasRef} style={{position:'absolute',inset:0,width:'100%',height:'100%'}}/>

        {/* Director slide-up panel */}
        <div style={{position:'absolute',left:0,right:0,bottom:0,height:'48%',background:'rgba(1,4,8,.96)',borderTop:`1px solid ${BORD2}`,zIndex:8,display:'flex',flexDirection:'column',transform:dirOpen?'translateY(0)':'translateY(100%)',transition:'transform .3s ease',padding:'9px 11px',boxShadow:'0 -10px 30px rgba(0,0,0,.5)'}}>
          <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',flexWrap:'wrap',gap:7,marginBottom:7,paddingBottom:7,borderBottom:`1px solid ${BORD}`}}>
            <div style={{fontFamily:OR,fontSize:10.5,letterSpacing:2,color:BRIGHT}}>🎬 DIRECTOR MODE</div>
            <div style={{display:'flex',gap:5,flexWrap:'wrap'}}>
              {(['slowbuild','symmetrical','knotarc'] as const).map(k=>(
                <button key={k} style={tbtn(false)} onClick={()=>loadPreset(k)}>
                  {k==='slowbuild'?'Slow Build':k==='symmetrical'?'Symmetrical Climax':'Long Knot Arc'}
                </button>
              ))}
            </div>
            <div style={{display:'flex',gap:5,flexWrap:'wrap'}}>
              <button style={tbtn(dirPlaying,GOLD)} onClick={toggleDirectorPlay}>{dirPlaying?'■ STOP TIMELINE':'▶ PLAY TIMELINE'}</button>
              <button style={tbtn(false)} onClick={addPhase}>+ ADD PHASE</button>
              <button style={tbtn(false)} onClick={clearTimeline}>CLEAR</button>
              <button style={tbtn(false)} onClick={()=>setDirOpen(false)}>✕ CLOSE</button>
            </div>
          </div>

          {/* timeline strip */}
          <div style={{height:20,borderRadius:2,overflow:'hidden',marginBottom:7,background:'rgba(0,0,0,.4)',border:`1px solid ${BORD}`,position:'relative',display:'flex'}}>
            {timeline.length===0?<div style={{color:DIM,fontSize:8,padding:'4px 8px'}}>Timeline empty</div>:
              timeline.map((p,i)=>(
                <div key={p.id} style={{height:'100%',width:`${(p.duration/totalDur)*100}%`,borderRight:'1px solid rgba(0,0,0,.5)',position:'relative',display:'flex',alignItems:'center',justifyContent:'center',
                  background:(TYPE_COL[p.primKeys[0]]||'#223')+'33',borderLeft:`2px solid ${TYPE_COL[p.primKeys[0]]||'#223'}`,
                  outline:i===curPhaseIdx&&dirPlaying?'1px solid #fff':'none'}}>
                  <span style={{fontFamily:MN,fontSize:6.5,color:'rgba(255,255,255,.65)',overflow:'hidden',whiteSpace:'nowrap'}}>{p.name}</span>
                </div>
              ))
            }
          </div>

          {/* phase cards */}
          <div style={{flex:1,overflowY:'auto',display:'flex',flexDirection:'column',gap:5}}>
            {timeline.length===0&&<div style={{color:DIM,fontSize:9,padding:10,textAlign:'center'}}>No phases yet — add one or load a preset above.</div>}
            {timeline.map((p,i)=>(
              <div key={p.id} style={{background:'rgba(0,0,0,.35)',border:`1px solid ${i===curPhaseIdx&&dirPlaying?TEAL:BORD}`,borderRadius:3,padding:'6px 8px',fontSize:9,
                boxShadow:i===curPhaseIdx&&dirPlaying?`0 0 8px rgba(31,212,200,.25)`:'none'}}>
                <div style={{display:'flex',alignItems:'center',gap:5,flexWrap:'wrap',marginBottom:4}}>
                  <input value={p.name} onChange={e=>updatePhaseField(p.id,'name',e.target.value)}
                    style={{background:'rgba(0,0,0,.4)',border:`1px solid ${BORD2}`,color:'#d4e8f7',fontFamily:MN,fontSize:9,padding:'3px 5px',borderRadius:2,width:100}}/>
                  <span style={{color:DIM}}>dur</span>
                  <input type="number" value={p.duration} min={1} onChange={e=>updatePhaseField(p.id,'duration',Math.max(1,parseFloat(e.target.value)||8))}
                    style={{background:'rgba(0,0,0,.4)',border:`1px solid ${BORD2}`,color:'#d4e8f7',fontFamily:MN,fontSize:9,padding:'3px 5px',borderRadius:2,width:42}}/>s
                  <select value={p.density} onChange={e=>updatePhaseField(p.id,'density',e.target.value)}
                    style={{background:'rgba(0,0,0,.4)',border:`1px solid ${BORD2}`,color:'#d4e8f7',fontFamily:MN,fontSize:8.5,padding:'3px 4px',borderRadius:2}}>
                    <option value="sparse">sparse</option><option value="normal">normal</option><option value="dense">dense</option>
                  </select>
                  <select value={p.fogDim} onChange={e=>updatePhaseField(p.id,'fogDim',e.target.value)}
                    style={{background:'rgba(0,0,0,.4)',border:`1px solid ${BORD2}`,color:'#d4e8f7',fontFamily:MN,fontSize:8.5,padding:'3px 4px',borderRadius:2}}>
                    <option value="dim">fog:dim</option><option value="normal">fog:normal</option><option value="clear">fog:dense</option>
                  </select>
                  {([['waterBias','water'],['holdC','hold C'],['forceCommit','commit@end']] as [keyof DirectorPhase,string][]).map(([f,l])=>(
                    <label key={f} style={{display:'flex',alignItems:'center',gap:3,fontSize:8.5,color:DIM,cursor:'pointer'}}>
                      <input type="checkbox" checked={!!p[f]} onChange={e=>updatePhaseField(p.id,f,e.target.checked)}/>{l}
                    </label>
                  ))}
                  <button onClick={()=>removePhase(p.id)} style={{marginLeft:'auto',background:'none',border:'none',color:RED,cursor:'pointer',fontSize:11}}>✕</button>
                </div>
                <div style={{display:'flex',gap:4,flexWrap:'wrap'}}>
                  {PRIMS_INIT.map(pr=>(
                    <span key={pr.key} onClick={()=>togglePhasePrim(p.id,pr.key)}
                      style={{fontFamily:MN,fontSize:7.5,padding:'2px 6px',borderRadius:8,cursor:'pointer',
                        border:`1px solid ${p.primKeys.includes(pr.key)?pr.cv:BORD2}`,
                        background:p.primKeys.includes(pr.key)?pr.cv:'none',
                        color:p.primKeys.includes(pr.key)?'#000':DIM,fontWeight:p.primKeys.includes(pr.key)?700:400}}>
                      {pr.key.slice(0,3)}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── RIGHT PANEL ── */}
      <div style={{gridColumn:3,padding:'10px 9px',background:'linear-gradient(270deg,rgba(1,4,8,.95),transparent)',borderLeft:`1px solid ${BORD}`,overflowY:'auto',scrollbarWidth:'none',display:'flex',flexDirection:'column',gap:8}}>
        <div style={plabel}>Wavefunction</div>
        <div style={{background:'rgba(0,0,0,.4)',border:`1px solid ${BORD}`,borderRadius:2,padding:'7px 8px',marginBottom:6,fontFamily:MN,fontSize:9,color:BRIGHT,lineHeight:1.6}}>
          Ψ(x,t) = Σ w<sub>i</sub>·S<sub>i</sub>(x,t)·C(x,t)<br/>
          C(x,t) = <span style={{color:GOLD}}>{uiC.toFixed(4)}</span><br/>
          ρ<sub>DMF</sub> = <span style={{color:GOLD}}>{uiRho.toFixed(4)}</span><br/>
          φ⁻¹ = <span style={{color:GOLD}}>0.618034</span> (commit)
        </div>
        {eqCard('COHERENCE C(x,t)', uiC, 1, TEAL, 0.618034)}
        {eqCard('DMF DENSITY ρ', uiRho, 1, GOLD)}
        <div style={{background:'rgba(0,0,0,0.4)',border:`1px solid ${BORD}`,borderRadius:2,padding:'7px 8px',marginBottom:6}}>
          <div style={{fontFamily:MN,fontSize:8,color:DIM,letterSpacing:1,marginBottom:2}}>KNOT TOPOLOGY (live, T(p,q))</div>
          <div style={{fontFamily:OR,fontSize:11,fontWeight:700,color:RED}}>{uiKnot}</div>
        </div>

        <div style={plabel}>Accretion Tower</div>
        <canvas ref={gaugeRef} width={190} height={92} style={{display:'block',margin:'0 auto'}}/>

        <div style={plabel}>Event Log</div>
        <div style={{flex:1,background:'rgba(0,0,0,.4)',border:`1px solid ${BORD}`,borderRadius:2,padding:7,overflowY:'auto',minHeight:50,maxHeight:110}}>
          {logEntries.map((e,i)=>(
            <div key={i} style={{fontFamily:MN,fontSize:8.5,color:e.col||DIM,padding:'2px 0',borderBottom:`1px solid ${BORD}`,lineHeight:1.35}}>
              <span style={{color:GOLD,marginRight:4}}>n={String(e.n).padStart(4,'0')}</span>{e.msg}
            </div>
          ))}
        </div>
      </div>

      {/* ── BOTTOM BAR ── */}
      <div style={{gridColumn:'1/-1',display:'flex',alignItems:'center',justifyContent:'space-between',padding:'0 14px',background:'rgba(1,4,8,.97)',borderTop:`1px solid ${BORD}`,fontFamily:MN,fontSize:7.5,letterSpacing:1.3,color:DIM,gap:10}}>
        <div>0 = ∞ · AETHER</div>
        <div style={{flex:1,textAlign:'center',overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{botMid}</div>
        <div>FRAME {uiFrame}</div>
      </div>
    </div>
  );
}
