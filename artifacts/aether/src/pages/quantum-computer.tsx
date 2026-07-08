import { useEffect, useRef, useState, useCallback, useLayoutEffect } from "react";

/* ── palette ─────────────────────────────────────── */
const BG   = "#010408";
const TEAL = "#1fd4c8";
const GOLD = "#c9a84c";
const VIO  = "#8b5cf6";
const RED  = "#ef4444";
const GRN  = "#22c55e";
const BLUE = "#4a9fd4";
const ORG  = "#f97316";
const DIM  = "#3a5a7a";
const BORD = "rgba(31,212,200,0.12)";
const MN   = "'Space Mono', monospace";
const OR   = "'Orbitron', sans-serif";

/* ── complex number math ─────────────────────────── */
interface C { re: number; im: number; }
const C0: C = {re:0,im:0}; const C1: C = {re:1,im:0};
const Ci: C = {re:0,im:1}; const CNi: C = {re:0,im:-1};
function cadd(a:C,b:C):C{return{re:a.re+b.re,im:a.im+b.im};}
function cmul(a:C,b:C):C{return{re:a.re*b.re-a.im*b.im,im:a.re*b.im+a.im*b.re};}
function cabs2(a:C):number{return a.re*a.re+a.im*a.im;}
function carg(a:C):number{return Math.atan2(a.im,a.re);}
function cphaseStr(a:C):string{
  const arg=carg(a);
  if(Math.abs(arg)<0.05) return ''; if(Math.abs(arg-Math.PI/2)<0.05) return '+i';
  if(Math.abs(arg+Math.PI/2)<0.05) return '-i'; if(Math.abs(Math.abs(arg)-Math.PI)<0.05) return '-1';
  return `e^{${(arg/Math.PI).toFixed(2)}π}`;
}
const R2I: C = {re:1/Math.SQRT2,im:0}; const NR2I: C = {re:-1/Math.SQRT2,im:0};
function ea(θ:number):C{return{re:Math.cos(θ),im:Math.sin(θ)};}

/* ── gate definitions ────────────────────────────── */
type GateName='H'|'X'|'Y'|'Z'|'S'|'T'|'Sdg'|'Tdg'|'CNOT';
type M2=[[C,C],[C,C]];
const GM: Record<Exclude<GateName,'CNOT'>,M2>={
  H: [[R2I,R2I],[R2I,NR2I]],
  X: [[C0,C1],[C1,C0]],
  Y: [[C0,CNi],[Ci,C0]],
  Z: [[C1,C0],[C0,{re:-1,im:0}]],
  S: [[C1,C0],[C0,Ci]],
  T: [[C1,C0],[C0,ea(Math.PI/4)]],
  Sdg:[[C1,C0],[C0,CNi]],
  Tdg:[[C1,C0],[C0,ea(-Math.PI/4)]],
};
const GCOL: Record<GateName,string>={H:BLUE,X:RED,Y:TEAL,Z:GOLD,S:GRN,T:VIO,Sdg:GRN,Tdg:VIO,CNOT:ORG};
const GLABEL: Record<GateName,string>={H:'H',X:'X',Y:'Y',Z:'Z',S:'S',T:'T',Sdg:'S†',Tdg:'T†',CNOT:'CX'};

/* ── quantum simulation ──────────────────────────── */
const NQ = 4; const DIM2 = 1<<NQ;

function initState(): C[] {
  const s=Array.from({length:DIM2},()=>({...C0})); s[0]={...C1}; return s;
}
function applyGate(state:C[],q:number,gate:M2):C[]{
  const out:C[]=Array.from({length:DIM2},()=>({...C0}));
  const mask=1<<(NQ-1-q);
  for(let i=0;i<DIM2;i++){
    if((i&mask)===0){
      const j=i|mask;
      out[i]=cadd(cmul(gate[0][0],state[i]),cmul(gate[0][1],state[j]));
      out[j]=cadd(cmul(gate[1][0],state[i]),cmul(gate[1][1],state[j]));
    }
  }
  return out;
}
function applyCNOT(state:C[],ctrl:number,tgt:number):C[]{
  const out=state.map(x=>({...x}));
  const cm=1<<(NQ-1-ctrl), tm=1<<(NQ-1-tgt);
  for(let i=0;i<DIM2;i++){
    if((i&cm)!==0&&(i&tm)===0){const j=i|tm;out[i]={...state[j]};out[j]={...state[i]};}
  }
  return out;
}
function blochVec(state:C[],q:number):[number,number,number]{
  const mask=1<<(NQ-1-q);
  let r00=0,r11=0,r01r=0,r01i=0;
  for(let i=0;i<DIM2;i++){
    if((i&mask)===0){
      const j=i|mask;
      r00+=cabs2(state[i]); r11+=cabs2(state[j]);
      r01r+=state[i].re*state[j].re+state[i].im*state[j].im; // Re(s[i]* s[j])
      r01i+=state[i].re*state[j].im-state[i].im*state[j].re; // Im(s[i]* s[j])
    }
  }
  return [2*r01r, -2*r01i, r00-r11];
}
function entEntropy(state:C[]):number{
  let ent=0;
  for(let q=0;q<NQ;q++){
    const mask=1<<(NQ-1-q);
    let p0=0,p1=0;
    for(let i=0;i<DIM2;i++){(i&mask)?p1+=cabs2(state[i]):p0+=cabs2(state[i]);}
    if(p0>1e-9)ent-=p0*Math.log2(p0); if(p1>1e-9)ent-=p1*Math.log2(p1);
  }
  return ent/NQ;
}
function circuitFidelity(state:C[]):number{return Math.max(...state.map(cabs2));}

/* ── circuit types ───────────────────────────────── */
interface GateCell{gate:GateName;target?:number;}
type Circuit=(GateCell|null)[][]; // [NQ][N_STEPS]
const NS=8;
function emptyCircuit():Circuit{return Array.from({length:NQ},()=>Array(NS).fill(null));}

function cloneCircuit(c:Circuit):Circuit{return c.map(row=>row.map(cell=>cell?{...cell}:null));}

function runCircuit(circuit:Circuit):C[]{
  let state=initState();
  for(let step=0;step<NS;step++){
    for(let q=0;q<NQ;q++){
      const cell=circuit[q][step];
      if(!cell)continue;
      if(cell.gate==='CNOT'){
        const tgt=cell.target??((q+1)%NQ);
        state=applyCNOT(state,q,tgt);
      } else {
        state=applyGate(state,q,GM[cell.gate]);
      }
    }
  }
  return state;
}

function basisLabel(i:number):string{return i.toString(2).padStart(NQ,'0');}

/* ── presets ─────────────────────────────────────── */
const PRESETS: {name:string;desc:string;make:()=>Circuit}[] = [
  {name:'Bell',desc:'(|0000⟩+|0011⟩)/√2 — entangled pair',make:()=>{
    const c=emptyCircuit();c[0][0]={gate:'H'};c[0][1]={gate:'CNOT',target:1};return c;}},
  {name:'GHZ',desc:'(|0000⟩+|0111⟩)/√2 — 3-qubit entanglement',make:()=>{
    const c=emptyCircuit();c[0][0]={gate:'H'};c[0][1]={gate:'CNOT',target:1};c[0][2]={gate:'CNOT',target:2};return c;}},
  {name:'All |+⟩',desc:'Uniform superposition of all 16 states',make:()=>{
    const c=emptyCircuit();for(let q=0;q<NQ;q++)c[q][0]={gate:'H'};return c;}},
  {name:'QFT-2',desc:'Quantum Fourier Transform on qubits 0-1',make:()=>{
    const c=emptyCircuit();
    c[0][0]={gate:'H'};c[0][2]={gate:'T'};
    c[1][0]={gate:'CNOT',target:0};c[1][3]={gate:'H'};
    return c;}},
  {name:'Phase Kick',desc:'Phase kickback circuit (T-gate)',make:()=>{
    const c=emptyCircuit();
    c[0][0]={gate:'H'};c[1][0]={gate:'X'};c[1][1]={gate:'H'};
    c[0][2]={gate:'CNOT',target:1};c[1][3]={gate:'T'};
    c[0][4]={gate:'CNOT',target:1};c[0][5]={gate:'H'};
    return c;}},
  {name:'W State',desc:'W-state-like superposition with phases',make:()=>{
    const c=emptyCircuit();
    c[0][0]={gate:'H'};c[1][0]={gate:'H'};c[2][0]={gate:'H'};c[3][0]={gate:'H'};
    c[0][1]={gate:'CNOT',target:1};c[2][1]={gate:'CNOT',target:3};
    c[0][2]={gate:'S'};c[1][2]={gate:'T'};c[2][2]={gate:'Sdg'};c[3][2]={gate:'Tdg'};
    return c;}},
];

/* ── header canvas ───────────────────────────────── */
function HeaderCanvas(){
  const ref=useRef<HTMLCanvasElement>(null);
  const rafRef=useRef(0);
  useEffect(()=>{
    const cv=ref.current;if(!cv)return;
    const ctx=cv.getContext('2d')!;
    cv.width=900;cv.height=90;
    const W=cv.width,H=cv.height;
    let t=0;
    const nodes:number[]=Array.from({length:14},(_, i)=>(i/(13))*W*0.92+W*0.04);
    const draw=()=>{
      ctx.fillStyle='rgba(1,4,8,0.3)';ctx.fillRect(0,0,W,H);
      // qubit lines
      for(let q=0;q<4;q++){
        const y=10+q*18;
        ctx.strokeStyle=`rgba(31,212,200,${0.08+q*0.04})`;ctx.lineWidth=0.7;
        ctx.beginPath();ctx.moveTo(0,y);ctx.lineTo(W,y);ctx.stroke();
        // traveling packets
        for(let p=0;p<3;p++){
          const px=((t*0.6+p*300+q*80)%W);
          const g=ctx.createRadialGradient(px,y,0,px,y,12);
          g.addColorStop(0,[TEAL,GOLD,VIO,GRN][q]+'dd');g.addColorStop(1,'rgba(0,0,0,0)');
          ctx.beginPath();ctx.arc(px,y,12,0,Math.PI*2);ctx.fillStyle=g;ctx.fill();
        }
      }
      // gate boxes
      nodes.forEach((nx,i)=>{
        const q=i%4,y=10+q*18;
        const blink=0.3+0.35*Math.sin(t*0.025+i*0.7);
        const cols=[TEAL,GOLD,VIO,GRN,RED,BLUE];
        ctx.fillStyle=cols[i%cols.length]+Math.floor(blink*160).toString(16).padStart(2,'0');
        ctx.fillRect(nx-9,y-7,18,14);
        ctx.strokeStyle=cols[i%cols.length]+Math.floor(blink*255).toString(16).padStart(2,'0');
        ctx.lineWidth=0.8;ctx.strokeRect(nx-9,y-7,18,14);
        ctx.fillStyle=`rgba(255,255,255,${blink*0.8})`;ctx.font='7px Space Mono';ctx.textAlign='center';
        ctx.fillText(['H','X','T','Z','S','Y','CNOT','H','T†','S†','Z','X','H','Y'][i],nx,y+3);
      });
      ctx.fillStyle='rgba(74,159,212,0.25)';ctx.font='8px Space Mono';ctx.textAlign='left';
      ctx.fillText('AETHER QUANTUM COMPUTER · GATE MODEL · 4-QUBIT HILBERT SPACE · 16-DIM STATE VECTOR · BLOCH SPHERE · ENTANGLEMENT',8,H-8);
      t++;rafRef.current=requestAnimationFrame(draw);
    };draw();
    return()=>cancelAnimationFrame(rafRef.current);
  },[]);
  return <canvas ref={ref} style={{width:'100%',height:'auto',borderRadius:4,display:'block'}}/>;
}

/* ── bloch sphere canvas ─────────────────────────── */
function BlochCanvas({state}:{state:C[]|null}){
  const ref=useRef<HTMLCanvasElement>(null);
  const rafRef=useRef(0);
  const stateRef=useRef(state);
  stateRef.current=state;
  useEffect(()=>{
    const cv=ref.current;if(!cv)return;
    const ctx=cv.getContext('2d')!;
    cv.width=480;cv.height=140;
    const W=cv.width,H=cv.height;
    let t=0;
    const qcols=[BLUE,GRN,VIO,ORG];
    const draw=()=>{
      ctx.fillStyle=BG;ctx.fillRect(0,0,W,H);
      const s=stateRef.current;
      for(let q=0;q<NQ;q++){
        const cx=60+q*120,cy=H/2,R=44;
        const col=qcols[q];
        const [bx,by,bz]=s?blochVec(s,q):[0,0,1];

        // sphere outline
        ctx.beginPath();ctx.arc(cx,cy,R,0,Math.PI*2);
        ctx.strokeStyle='rgba(31,212,200,0.15)';ctx.lineWidth=1;ctx.stroke();
        ctx.fillStyle='rgba(1,4,8,0.4)';ctx.fill();

        // equatorial ellipse
        ctx.beginPath();ctx.ellipse(cx,cy,R,R*0.32,0,0,Math.PI*2);
        ctx.strokeStyle='rgba(31,212,200,0.08)';ctx.lineWidth=0.7;ctx.stroke();

        // axes
        ctx.strokeStyle='rgba(255,255,255,0.12)';ctx.lineWidth=0.7;
        ctx.beginPath();ctx.moveTo(cx,cy-R-4);ctx.lineTo(cx,cy+R+4);ctx.stroke();
        ctx.beginPath();ctx.moveTo(cx-R-4,cy);ctx.lineTo(cx+R+4,cy);ctx.stroke();

        // pole labels
        ctx.fillStyle='rgba(200,220,255,0.45)';ctx.font='8px Space Mono';ctx.textAlign='center';
        ctx.fillText('|0⟩',cx,cy-R-10);ctx.fillText('|1⟩',cx,cy+R+14);

        // state vector (isometric projection)
        const anim=s?1:0.5+0.4*Math.sin(t*0.05+q);
        const sx=(bx+by*0.32)*anim, sy=(-bz+by*0.22)*anim;
        const pvx=cx+sx*R, pvy=cy+sy*R;

        // glow
        ctx.save();ctx.shadowBlur=12;ctx.shadowColor=col;
        ctx.beginPath();ctx.moveTo(cx,cy);ctx.lineTo(pvx,pvy);
        ctx.strokeStyle=col+'cc';ctx.lineWidth=2;ctx.stroke();
        ctx.beginPath();ctx.arc(pvx,pvy,4.5,0,Math.PI*2);
        ctx.fillStyle=col;ctx.fill();ctx.restore();

        // qubit label
        ctx.fillStyle=col;ctx.font='9px Orbitron';ctx.textAlign='center';
        ctx.fillText(`q${q}`,cx,cy+R+28);

        // purity ring
        const p=s?Math.min(1,bx*bx+by*by+bz*bz):0.5;
        ctx.beginPath();ctx.arc(cx,cy+R+4,4,0,Math.PI*2*p);
        ctx.strokeStyle=col+'99';ctx.lineWidth=2;ctx.stroke();
      }
      t++;rafRef.current=requestAnimationFrame(draw);
    };draw();
    return()=>cancelAnimationFrame(rafRef.current);
  },[]);
  return <canvas ref={ref} style={{width:'100%',maxWidth:480,height:'auto',borderRadius:4,display:'block'}}/>;
}

/* ── probability histogram canvas ────────────────── */
function ProbCanvas({state}:{state:C[]|null}){
  const ref=useRef<HTMLCanvasElement>(null);
  const rafRef=useRef(0);
  const stateRef=useRef(state);
  stateRef.current=state;
  useEffect(()=>{
    const cv=ref.current;if(!cv)return;
    const ctx=cv.getContext('2d')!;
    cv.width=620;cv.height=130;
    const W=cv.width,H=cv.height;
    const bw=(W-16)/DIM2;
    let t=0;
    const grad=ctx.createLinearGradient(0,0,W,0);
    grad.addColorStop(0,TEAL);grad.addColorStop(0.33,BLUE);grad.addColorStop(0.66,VIO);grad.addColorStop(1,GRN);
    const draw=()=>{
      ctx.fillStyle='rgba(1,4,8,0.6)';ctx.fillRect(0,0,W,H);
      const s=stateRef.current;
      const maxBarH=H-32;
      for(let i=0;i<DIM2;i++){
        const x=8+i*bw;
        const p=s?cabs2(s[i]):0;
        const barH=p*maxBarH;
        const phase=s?carg(s[i]):0;
        const hue=Math.round(((phase+Math.PI)/(2*Math.PI))*360);
        // animated placeholder bar
        const ph=s?barH:4+4*Math.abs(Math.sin(t*0.04+i*0.5));
        ctx.fillStyle=s?`hsl(${hue},80%,55%)`:'rgba(31,212,200,0.2)';
        ctx.fillRect(x,H-24-ph,bw-1.5,ph);
        // probability label
        if(p>0.005){
          ctx.fillStyle='rgba(255,255,255,0.75)';ctx.font='7px Space Mono';ctx.textAlign='center';
          ctx.fillText((p*100).toFixed(0)+'%',x+bw/2-0.75,H-24-ph-3);
        }
        // basis label
        ctx.fillStyle=`rgba(74,159,212,${s?0.5:0.2})`;ctx.font='7px Space Mono';ctx.textAlign='center';
        ctx.fillText(basisLabel(i),x+bw/2-0.75,H-8);
      }
      // PHI threshold line
      const phi_p=0.618034;
      ctx.strokeStyle='rgba(201,168,76,0.3)';ctx.lineWidth=0.8;ctx.setLineDash([3,4]);
      ctx.beginPath();ctx.moveTo(8,H-24-phi_p*maxBarH);ctx.lineTo(W-8,H-24-phi_p*maxBarH);ctx.stroke();
      ctx.setLineDash([]);
      ctx.fillStyle='rgba(201,168,76,0.5)';ctx.font='7px Space Mono';ctx.textAlign='right';
      ctx.fillText('φ⁻¹',W-6,H-24-phi_p*maxBarH-3);
      t++;rafRef.current=requestAnimationFrame(draw);
    };draw();
    return()=>cancelAnimationFrame(rafRef.current);
  },[]);
  return <canvas ref={ref} style={{width:'100%',maxWidth:620,height:'auto',borderRadius:4,display:'block'}}/>;
}

/* ── main page ───────────────────────────────────── */
export default function QuantumComputerPage(){
  const [circuit, setCircuit]       = useState<Circuit>(emptyCircuit());
  const [selected, setSelected]     = useState<GateName>('H');
  const [result, setResult]         = useState<C[]|null>(null);
  const [lastRun, setLastRun]       = useState<{entropy:number;fidelity:number;dominant:string}|null>(null);

  const circuitRef = useRef(circuit);
  useLayoutEffect(()=>{ circuitRef.current=circuit; },[circuit]);

  const handleRun = useCallback(()=>{
    const c = circuitRef.current;
    const state = runCircuit(c);
    setResult(state);
    const entropy = entEntropy(state);
    const fidelity = circuitFidelity(state);
    const dom = state.reduce((mi,s,i)=>cabs2(s)>cabs2(state[mi])?i:mi,0);
    setLastRun({entropy,fidelity,dominant:basisLabel(dom)});
  },[]);

  const handleCell=useCallback((q:number,step:number)=>{
    setCircuit(prev=>{
      const c=cloneCircuit(prev);
      const cell=c[q][step];
      // clicking same gate type on same cell removes it
      if(cell&&cell.gate===selected){c[q][step]=null;return c;}
      // for CNOT: check target won't self-loop and step is free on target
      if(selected==='CNOT'){
        const tgt=(q+1)%NQ;
        if(tgt===q){return c;}
        // clear any existing gate on target at this step
        c[tgt][step]=null;
        c[q][step]={gate:'CNOT',target:tgt};
      } else {
        // clear if the cell is a CNOT target from another qubit
        const prevCtrl=c.findIndex(row=>row[step]?.gate==='CNOT'&&row[step]?.target===q);
        if(prevCtrl>=0)c[prevCtrl][step]=null;
        c[q][step]={gate:selected};
      }
      return c;
    });
    setResult(null);setLastRun(null);
  },[selected]);

  const handleClear=()=>{setCircuit(emptyCircuit());setResult(null);setLastRun(null);};
  const handlePreset=(make:()=>Circuit)=>{setCircuit(make());setResult(null);setLastRun(null);};

  /* ── styles ── */
  const card=(col=TEAL):React.CSSProperties=>({background:'rgba(0,0,0,0.4)',border:`1px solid ${col}22`,borderRadius:4,padding:'10px 14px'});
  const secLabel:React.CSSProperties={fontFamily:MN,fontSize:7.5,letterSpacing:'0.2em',color:DIM,textTransform:'uppercase',marginBottom:10,paddingBottom:4,borderBottom:`1px solid ${BORD}`};

  return(
    <div style={{minHeight:'100%',background:BG,color:'#d4e8f7',fontFamily:"'Rajdhani',sans-serif",overflowY:'auto'}}>
      <div style={{maxWidth:1100,margin:'0 auto',padding:'16px 20px'}}>

        {/* ── title ── */}
        <div style={{marginTop:14,marginBottom:18}}>
          <h1 style={{fontFamily:OR,fontSize:22,fontWeight:900,letterSpacing:2,color:TEAL,textShadow:`0 0 24px ${TEAL}66`,margin:'4px 0'}}>AETHER Quantum Computer</h1>
          <p style={{fontSize:13,color:'rgba(180,210,240,0.7)',maxWidth:680,lineHeight:1.6,margin:0}}>
            Gate-model quantum circuit simulator operating in the 16-dimensional Hilbert space of 4 qubits. Build circuits from the AETHER gate palette, run the exact unitary evolution, and observe coherence collapse in real time via Bloch sphere + probability field.
          </p>
        </div>

        {/* ── stats bar ── */}
        {lastRun&&(
          <div style={{display:'flex',gap:12,flexWrap:'wrap',marginBottom:16}}>
            {[
              ['Entanglement Entropy',lastRun.entropy.toFixed(4)+' bits/qubit',TEAL],
              ['Max Basis Fidelity',(lastRun.fidelity*100).toFixed(1)+'%',GOLD],
              ['Dominant State','|'+lastRun.dominant+'⟩',VIO],
              ['φ⁻¹ Threshold','0.618034',ORG],
            ].map(([l,v,c])=>(
              <div key={l} style={{...card(c as string),flex:'1 1 140px',minWidth:120}}>
                <div style={{fontFamily:MN,fontSize:7,color:DIM,letterSpacing:1,marginBottom:3}}>{l}</div>
                <div style={{fontFamily:OR,fontSize:14,fontWeight:700,color:c as string}}>{v}</div>
              </div>
            ))}
          </div>
        )}

        {/* ── main content ── */}
        <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:16,alignItems:'start'}}>

          {/* ── left: circuit editor ── */}
          <div>
            {/* gate palette */}
            <div style={{...card(),marginBottom:12}}>
              <div style={secLabel}>Gate Palette</div>
              <div style={{display:'flex',flexWrap:'wrap',gap:5,marginBottom:10}}>
                {(['H','X','Y','Z','S','T','Sdg','Tdg','CNOT'] as GateName[]).map(g=>(
                  <button key={g} onClick={()=>setSelected(g)}
                    style={{fontFamily:MN,fontSize:9,padding:'5px 9px',cursor:'pointer',borderRadius:3,
                      background:selected===g?GCOL[g]+'33':'rgba(0,0,0,0.3)',
                      border:`1px solid ${GCOL[g]}${selected===g?'cc':'44'}`,
                      color:GCOL[g],fontWeight:700,letterSpacing:0.5,minWidth:36}}>
                    {GLABEL[g]}
                  </button>
                ))}
              </div>
              <div style={{fontSize:9,color:DIM,fontFamily:MN,lineHeight:1.7}}>
                <span style={{color:GCOL[selected]}}>{selected}</span>
                {selected==='H'&&' · Hadamard: maps |0⟩→|+⟩, creates superposition'}
                {selected==='X'&&' · Pauli-X: bit-flip, |0⟩↔|1⟩ (NOT gate)'}
                {selected==='Y'&&' · Pauli-Y: bit+phase flip with imaginary factor'}
                {selected==='Z'&&' · Pauli-Z: phase flip, |1⟩→−|1⟩ (no |0⟩ effect)'}
                {selected==='S'&&' · Phase gate: |1⟩→i|1⟩ (π/2 phase)'}
                {selected==='T'&&' · T-gate: |1⟩→e^{iπ/4}|1⟩ (π/4 phase)'}
                {selected==='Sdg'&&' · S†: |1⟩→−i|1⟩ (−π/2 phase, inverse of S)'}
                {selected==='Tdg'&&' · T†: inverse T gate (−π/4 phase)'}
                {selected==='CNOT'&&' · Controlled-NOT: flips qubit+1 when control=|1⟩'}
              </div>
            </div>

            {/* presets */}
            <div style={{...card(),marginBottom:12}}>
              <div style={secLabel}>Circuit Presets</div>
              <div style={{display:'flex',flexWrap:'wrap',gap:6}}>
                {PRESETS.map(p=>(
                  <button key={p.name} onClick={()=>handlePreset(p.make)}
                    style={{fontFamily:MN,fontSize:8,padding:'5px 10px',cursor:'pointer',borderRadius:3,
                      background:'rgba(74,159,212,0.08)',border:`1px solid rgba(74,159,212,0.3)`,
                      color:BLUE,letterSpacing:0.5}}>
                    {p.name}
                  </button>
                ))}
              </div>
              <div style={{marginTop:8,fontSize:8.5,color:DIM,fontFamily:MN}}>
                {PRESETS.find(p=>p.desc)?.desc||''}
              </div>
            </div>

            {/* circuit grid */}
            <div style={{...card(),overflowX:'auto'}}>
              <div style={secLabel}>Circuit Editor · click cell to place {GLABEL[selected]}</div>
              <div style={{position:'relative',userSelect:'none'}}>
                {/* Column step headers */}
                <div style={{display:'flex',marginLeft:52,marginBottom:4}}>
                  {Array.from({length:NS},(_,s)=>(
                    <div key={s} style={{width:48,textAlign:'center',fontFamily:MN,fontSize:7,color:DIM,letterSpacing:1}}>t{s}</div>
                  ))}
                </div>
                {/* Qubit rows */}
                {Array.from({length:NQ},(_,q)=>{
                  const qcols=[BLUE,GRN,VIO,ORG];
                  const qc=qcols[q];
                  return(
                    <div key={q} style={{display:'flex',alignItems:'center',marginBottom:4,position:'relative',height:42}}>
                      {/* Qubit label */}
                      <div style={{width:52,fontFamily:MN,fontSize:9,color:qc,letterSpacing:0.5,flexShrink:0}}>|ψ{q}⟩</div>
                      {/* Wire + cells */}
                      <div style={{position:'relative',display:'flex'}}>
                        {/* wire line */}
                        <div style={{position:'absolute',top:'50%',left:0,right:0,height:1,background:`${qc}22`,transform:'translateY(-50%)',zIndex:0}}/>
                        {Array.from({length:NS},(_,step)=>{
                          const cell=circuit[q][step];
                          // Check if this cell is a CNOT target
                          const isCNOTTarget=circuit.some((row,cq)=>cq!==q&&row[step]?.gate==='CNOT'&&row[step]?.target===q);
                          const isCtrl=cell?.gate==='CNOT';
                          let bgCol='transparent',borderCol=`${qc}18`,labelTxt='',labelCol='#fff';
                          if(isCtrl){bgCol=GCOL.CNOT+'22';borderCol=GCOL.CNOT+'aa';labelTxt='●';labelCol=GCOL.CNOT;}
                          else if(isCNOTTarget){bgCol='rgba(249,115,22,0.1)';borderCol=ORG+'66';labelTxt='⊕';labelCol=ORG;}
                          else if(cell){bgCol=GCOL[cell.gate]+'22';borderCol=GCOL[cell.gate]+'aa';labelTxt=GLABEL[cell.gate];labelCol=GCOL[cell.gate];}
                          return(
                            <div key={step} onClick={()=>isCNOTTarget?null:handleCell(q,step)}
                              style={{width:48,height:40,position:'relative',zIndex:1,display:'flex',alignItems:'center',justifyContent:'center',
                                cursor:isCNOTTarget?'default':'pointer',flexShrink:0,
                                background:bgCol,border:`1px solid ${borderCol}`,borderRadius:3,
                                transition:'all .15s',margin:'0 0.5px'}}>
                              <span style={{fontFamily:OR,fontSize:isCtrl||isCNOTTarget?14:10,fontWeight:700,color:labelCol,letterSpacing:0}}>
                                {labelTxt||<span style={{opacity:0.1,fontSize:8}}>·</span>}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
                {/* CNOT connector lines */}
                {Array.from({length:NS},(_,step)=>{
                  const cnotGates=circuit.map((row,q)=>({q,cell:row[step]})).filter(x=>x.cell?.gate==='CNOT');
                  return cnotGates.map(({q,cell})=>{
                    const tgt=cell!.target??((q+1)%NQ);
                    const fromY=22+q*46,toY=22+tgt*46;
                    const x=52+step*48+24;
                    return(
                      <div key={`${step}-${q}`} style={{position:'absolute',left:x,top:Math.min(fromY,toY),width:2,height:Math.abs(toY-fromY),background:ORG+'88',zIndex:0}}/>
                    );
                  });
                })}
              </div>

              <div style={{display:'flex',gap:8,marginTop:12}}>
                <button type="button" onClick={handleRun}
                  style={{fontFamily:MN,fontSize:9,padding:'7px 18px',cursor:'pointer',borderRadius:3,letterSpacing:1,
                    background:`rgba(31,212,200,0.18)`,border:`2px solid ${TEAL}cc`,color:TEAL,fontWeight:700,
                    boxShadow:`0 0 8px ${TEAL}44`}}>
                  ▶ RUN CIRCUIT
                </button>
                <button type="button" onClick={handleClear}
                  style={{fontFamily:MN,fontSize:9,padding:'7px 14px',cursor:'pointer',borderRadius:3,letterSpacing:1,
                    background:'rgba(0,0,0,0.3)',border:`1px solid rgba(31,212,200,0.25)`,color:DIM}}>
                  CLEAR
                </button>
                <div style={{flex:1,fontFamily:MN,fontSize:8,color:DIM,display:'flex',alignItems:'center',paddingLeft:8}}>
                  {result?`✓ State computed · ${result.filter(a=>cabs2(a)>0.0001).length} non-zero amplitudes`:'Place gates above then click ▶ RUN CIRCUIT'}
                </div>
              </div>
            </div>
          </div>

          {/* ── right: visualizations ── */}
          <div style={{display:'flex',flexDirection:'column',gap:14}}>
            {/* Bloch spheres */}
            <div style={card()}>
              <div style={secLabel}>Bloch Spheres · Reduced State per Qubit</div>
              <BlochCanvas state={result}/>
              {!result&&<div style={{fontFamily:MN,fontSize:8,color:DIM,marginTop:6}}>Run circuit to update Bloch vectors · initial state |0000⟩ shown at north pole</div>}
            </div>

            {/* Probability histogram */}
            <div style={card()}>
              <div style={secLabel}>Measurement Probability Field |⟨x|ψ⟩|²</div>
              <ProbCanvas state={result}/>
              {!result&&<div style={{fontFamily:MN,fontSize:8,color:DIM,marginTop:4}}>Run circuit to compute probability amplitudes across the 16-state Hilbert space</div>}
            </div>

            {/* AETHER coherence card */}
            <div style={{...card(GOLD),borderColor:GOLD+'33'}}>
              <div style={{fontFamily:MN,fontSize:7,color:GOLD,letterSpacing:'0.15em',marginBottom:6}}>AETHER · CRYSTALLIZATION MODEL</div>
              <div style={{fontSize:11,color:'rgba(201,168,76,0.8)',lineHeight:1.7}}>
                When C(x,t) ≥ φ⁻¹ = 0.618034, the wavefunction crystallizes — probability mass condenses onto dominant basis states. This quantum-classical threshold mirrors AETHER's coherence commitment rule: the system <em>accretes knowledge</em> only when entanglement entropy is maximally distributed then collapses into eigenstructure.
              </div>
              {lastRun&&(
                <div style={{marginTop:8,fontFamily:MN,fontSize:8}}>
                  <span style={{color:lastRun.entropy>0.5?TEAL:GOLD}}>
                    {lastRun.entropy>0.5?'▲ HIGH ENTANGLEMENT — quantum phase':'▼ LOW ENTANGLEMENT — classical regime'}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* ── state vector table ── */}
        {result&&(
          <div style={{...card(),marginTop:16}}>
            <div style={secLabel}>State Vector |ψ⟩ — Full 16-Amplitude Complex Decomposition</div>
            <div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:4}}>
              {result.map((amp,i)=>{
                const p=cabs2(amp);
                if(p<0.0001)return null;
                const col=p>0.4?TEAL:p>0.1?BLUE:DIM;
                return(
                  <div key={i} style={{background:'rgba(0,0,0,0.3)',border:`1px solid ${col}33`,borderRadius:3,padding:'5px 8px',position:'relative',overflow:'hidden'}}>
                    <div style={{position:'absolute',bottom:0,left:0,height:2,width:`${p*100}%`,background:col,opacity:0.6}}/>
                    <span style={{fontFamily:MN,fontSize:9,color:'rgba(74,159,212,0.8)'}}>|{basisLabel(i)}⟩</span>
                    <span style={{fontFamily:MN,fontSize:7,color:col,marginLeft:6}}>{(p*100).toFixed(1)}%</span>
                    <div style={{fontFamily:MN,fontSize:7.5,color:'rgba(200,220,255,0.6)',marginTop:2}}>
                      {amp.re.toFixed(3)}{amp.im>=0?'+':''}{amp.im.toFixed(3)}i
                    </div>
                  </div>
                );
              }).filter(Boolean)}
            </div>
          </div>
        )}

        {/* ── AETHER quantum synthesis ── */}
        <div style={{marginTop:16,display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:12}}>
          {[
            {col:TEAL,title:'Schrödinger Evolution',eq:'iℏ ∂ψ/∂t = Ĥψ',body:'Each gate G is a unitary operator U = e^{-iHt/ℏ}. The circuit Ĥ is the sequence of gates — the AETHER Hamiltonian sculpting the wavefunction across the Hilbert space landscape.'},
            {col:VIO,title:'Knot Topology of Entanglement',eq:'T(p,q) knot structure',body:'CNOT gates braid qubits — their combined action traces paths in SU(2)⊗SU(2) that form topological knots. Bell states are the simplest knot: the trefoil T(2,3).'},
            {col:GOLD,title:'DMF Density & Collapse',eq:'ρ_DMF = Tr_env(|ψ⟩⟨ψ|)',body:'Decoherence is partial trace over environmental qubits. The Bloch sphere shrinks from the surface (pure state) toward center (mixed state). AETHER monitors this collapse via C(x,t).'},
            {col:GRN,title:'Quantum Fourier Transform',eq:'QFT: |j⟩ → (1/√N)Σ e^{2πijk/N}|k⟩',body:'The QFT preset implements exact phase encoding. It underlies Shor\'s algorithm — exponential speedup over classical factoring by computing all phases simultaneously.'},
            {col:BLUE,title:'Quantum Error & Fidelity',eq:'F = |⟨ψ_ideal|ψ_actual⟩|²',body:'Gate errors accumulate as small rotations on the Bloch sphere. Fidelity tracks how close the actual state is to the intended ideal. The φ⁻¹ threshold marks the AETHER coherence boundary.'},
            {col:RED,title:'Phase Kickback',eq:'CNOT → global phase shift',body:'The Phase Kickback preset demonstrates how auxiliary qubits can encode eigenvalues in phase. Used in quantum phase estimation — the foundation of AETHER\'s coherence field measurement architecture.'},
          ].map(({col,title,eq,body})=>(
            <div key={title} style={{...card(col),borderColor:col+'22'}}>
              <div style={{fontFamily:OR,fontSize:9,color:col,letterSpacing:1,marginBottom:4}}>{title}</div>
              <div style={{fontFamily:MN,fontSize:9,color:col+'99',marginBottom:6}}>{eq}</div>
              <div style={{fontSize:11,color:'rgba(200,220,240,0.65)',lineHeight:1.6}}>{body}</div>
            </div>
          ))}
        </div>

        {/* footer */}
        <div style={{marginTop:16,paddingTop:10,borderTop:`1px solid ${BORD}`,fontFamily:MN,fontSize:7.5,color:DIM,letterSpacing:'0.12em',textAlign:'center'}}>
          AETHER QUANTUM COMPUTER · 4-QUBIT GATE MODEL · EXACT UNITARY SIMULATION · 16-DIM HILBERT SPACE · BLOCH SPHERE · ENTANGLEMENT ENTROPY · CRYSTALLIZATION THRESHOLD φ⁻¹ = 0.618034
        </div>
      </div>
    </div>
  );
}
