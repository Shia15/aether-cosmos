import { useEffect, useRef, useState } from "react";
import { Link } from "wouter";

const BG="#04060d",PAN="#0a0d1a",PAN2="#0d1020",BORDER="#182038",TEXT="#b8cce8",MUTED="#5a6e8c";
const GOLD="#ffb830",CYAN="#3fd8d0",VIOLET="#a87aff",GREEN="#50d49a",BLUE="#4ab0ff";
function hexA(h:string,a:number){
  const r=parseInt(h.slice(1,3),16),g=parseInt(h.slice(3,5),16),b=parseInt(h.slice(5,7),16);
  return `rgba(${r},${g},${b},${a})`;
}
function mulberry32(s:number){let x=s;return()=>{x|=0;x=x+0x6d2b79f5|0;let t=Math.imul(x^x>>>15,1|x);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296;};}

// ── Hebbian Neural Canvas ─────────────────────────────────────────────────────
function SynapticSim(){
  const cvRef=useRef<HTMLCanvasElement>(null);
  const eRef=useRef(0.35);
  const burstRef=useRef(0);
  const playRef=useRef(true);
  const genSpan=useRef<HTMLSpanElement>(null);
  const cohSpan=useRef<HTMLSpanElement>(null);
  const stSpan=useRef<HTMLSpanElement>(null);
  const synSpan=useRef<HTMLSpanElement>(null);
  const [entropy,setEntropy]=useState(0.35);
  const [playing,setPlaying]=useState(true);
  useEffect(()=>{eRef.current=entropy;},[entropy]);
  useEffect(()=>{playRef.current=playing;},[playing]);

  useEffect(()=>{
    const cv=cvRef.current; if(!cv) return;
    const ctx=cv.getContext("2d"); if(!ctx) return;
    let raf=0,t=0,lastW=0,gen=0;
    const N=26;
    const rng=mulberry32(0x4e657572);
    const phi=Math.PI*(3-Math.sqrt(5));

    const neurons=Array.from({length:N},(_,i)=>{
      const r=0.10+0.40*Math.sqrt((i+0.5)/N);
      const a=i*phi+rng()*0.25;
      return {x:r*Math.cos(a),y:r*Math.sin(a)*0.78,energy:rng()*0.2,firing:0,isDNA:i<6};
    });
    for(let i=0;i<6;i++){
      const a=(i/6)*Math.PI*2;
      neurons[i].x=Math.cos(a)*0.08; neurons[i].y=Math.sin(a)*0.065;
    }

    const S:number[][]=Array.from({length:N},()=>Array(N).fill(0));
    const D:number[][]=Array.from({length:N},(_,i)=>
      Array.from({length:N},(_,j)=>{
        const dx=neurons[i].x-neurons[j].x,dy=neurons[i].y-neurons[j].y;
        return Math.sqrt(dx*dx+dy*dy);
      })
    );

    const reduced=window.matchMedia&&window.matchMedia("(prefers-reduced-motion:reduce)").matches;

    const loop=()=>{
      const dpr=Math.min(2,window.devicePixelRatio||1);
      const W=cv.clientWidth||640,H=400;
      if(W!==lastW){cv.width=Math.round(W*dpr);cv.height=Math.round(H*dpr);lastW=W;}
      ctx.setTransform(dpr,0,0,dpr,0,0);
      if(playRef.current&&!reduced) t+=0.015;

      ctx.fillStyle=BG; ctx.fillRect(0,0,W,H);
      const cx=W/2,cy=H/2,sc=Math.min(W,H)*0.42;
      const ex=(x:number)=>cx+x*sc,ey=(y:number)=>cy+y*sc;

      if(playRef.current&&!reduced){
        const E=eRef.current;
        const burst=burstRef.current>0;
        if(burst) burstRef.current=Math.max(0,burstRef.current-0.035);
        for(let i=0;i<N;i++){
          const n=neurons[i];
          n.energy=Math.max(0,n.energy-0.011);
          n.firing=Math.max(0,n.firing-0.045);
          if(Math.random()<E*0.045*(burst?3.5:1)){
            n.energy=Math.min(1,n.energy+0.38+(burst?0.45:0));
            n.firing=1;
            for(let j=0;j<N;j++){
              if(j!==i&&D[i][j]<0.30&&neurons[j].energy>0.28){
                S[i][j]=Math.min(1,S[i][j]+0.045);
                S[j][i]=S[i][j];
              }
            }
          }
          for(let j=0;j<N;j++){
            if(j!==i&&S[i][j]>0.12&&n.energy>0.45)
              neurons[j].energy=Math.min(1,neurons[j].energy+S[i][j]*0.04);
          }
          for(let j=0;j<N;j++) S[i][j]=Math.max(0,S[i][j]-0.00025);
        }
        gen++;
        if(gen%10===0){
          const mc=neurons.reduce((s,n)=>s+n.energy,0)/N;
          let ns=0; for(let i=0;i<N;i++) for(let j=i+1;j<N;j++) if(S[i][j]>0.08) ns++;
          if(cohSpan.current) cohSpan.current.textContent=(mc*100).toFixed(0)+"%";
          if(genSpan.current) genSpan.current.textContent=String(gen);
          if(synSpan.current) synSpan.current.textContent=String(ns);
          const E=eRef.current;
          const st=E<0.2?"Resting":E<0.5?"Active":"High-State Burst";
          if(stSpan.current) stSpan.current.textContent=st;
        }
      }

      // synapses
      for(let i=0;i<N;i++){
        for(let j=i+1;j<N;j++){
          if(S[i][j]<0.07) continue;
          const both=neurons[i].energy>0.25&&neurons[j].energy>0.25;
          const a=S[i][j]*(both?0.9:0.35);
          const col=S[i][j]>0.65?hexA(GOLD,a):S[i][j]>0.35?hexA(CYAN,a):hexA(VIOLET,a*0.8);
          ctx.strokeStyle=col; ctx.lineWidth=0.7+S[i][j]*2.8;
          ctx.beginPath();
          ctx.moveTo(ex(neurons[i].x),ey(neurons[i].y));
          ctx.lineTo(ex(neurons[j].x),ey(neurons[j].y));
          ctx.stroke();
          if(both&&S[i][j]>0.38){
            const pk=((t*1.3+(i*j*3))%1+1)%1;
            const pkx=ex(neurons[i].x+(neurons[j].x-neurons[i].x)*pk);
            const pky=ey(neurons[i].y+(neurons[j].y-neurons[i].y)*pk);
            ctx.beginPath(); ctx.arc(pkx,pky,2.2,0,Math.PI*2);
            ctx.fillStyle=GOLD; ctx.fill();
          }
        }
      }

      // DNA helix (center)
      for(let k=0;k<44;k++){
        const fk=k/44;
        const ha=fk*Math.PI*4.5-t*0.75;
        const hy=cy-sc*0.28+fk*sc*0.56;
        const hx1=cx+Math.cos(ha)*16,hx2=cx+Math.cos(ha+Math.PI)*16;
        const s1=Math.sin(ha)>0;
        ctx.beginPath(); ctx.arc(hx1,hy,2.4,0,Math.PI*2);
        ctx.fillStyle=s1?hexA(CYAN,0.65):hexA(VIOLET,0.55); ctx.fill();
        ctx.beginPath(); ctx.arc(hx2,hy,2.4,0,Math.PI*2);
        ctx.fillStyle=s1?hexA(VIOLET,0.55):hexA(CYAN,0.65); ctx.fill();
        if(k%5===0){
          ctx.strokeStyle=hexA(GREEN,0.32); ctx.lineWidth=1;
          ctx.beginPath(); ctx.moveTo(hx1,hy); ctx.lineTo(hx2,hy); ctx.stroke();
        }
      }

      // neurons
      for(const n of neurons){
        const nx=ex(n.x),ny=ey(n.y);
        const e=n.energy,f=n.firing;
        const sz=n.isDNA?4.5:2.5+e*3.5;
        if(e>0.12){
          const grd=ctx.createRadialGradient(nx,ny,0,nx,ny,sz*4);
          grd.addColorStop(0,f>0.5?hexA(GOLD,0.22+e*0.18):hexA(CYAN,0.14+e*0.1));
          grd.addColorStop(1,hexA(GOLD,0));
          ctx.fillStyle=grd; ctx.fillRect(nx-sz*5,ny-sz*5,sz*10,sz*10);
        }
        ctx.beginPath(); ctx.arc(nx,ny,sz,0,Math.PI*2);
        ctx.fillStyle=f>0.5?GOLD:e>0.5?CYAN:e>0.18?hexA(VIOLET,0.85):hexA(TEXT,0.3);
        ctx.fill();
        if(n.isDNA){
          ctx.strokeStyle=hexA(GREEN,0.55); ctx.lineWidth=1.5;
          ctx.beginPath(); ctx.arc(nx,ny,sz+3,0,Math.PI*2); ctx.stroke();
        }
      }

      // entropy pulse ring
      if(eRef.current>0.5){
        const p=((t*2.2)%1+1)%1;
        ctx.strokeStyle=hexA(GOLD,0.22*(1-p)); ctx.lineWidth=2;
        ctx.beginPath(); ctx.arc(cx,cy,p*sc*0.78,0,Math.PI*2); ctx.stroke();
      }

      raf=requestAnimationFrame(loop);
    };
    raf=requestAnimationFrame(loop);
    return ()=>cancelAnimationFrame(raf);
  },[]);

  return (
    <div>
      <canvas ref={cvRef} style={{width:"100%",height:400,borderRadius:8,display:"block"}} />
      <div style={{marginTop:12,display:"flex",gap:16,flexWrap:"wrap",alignItems:"flex-end"}}>
        <label style={{flex:1,minWidth:180,color:TEXT,fontSize:12,fontFamily:"monospace"}}>
          Entropy rate
          <input type="range" min={0} max={1} step={0.01} value={entropy}
            onChange={e=>{const v=+e.target.value;setEntropy(v);eRef.current=v;}}
            style={{display:"block",width:"100%",marginTop:4}} />
        </label>
        <button onClick={()=>{burstRef.current=1;}}
          style={{background:hexA(GOLD,0.1),border:"1px solid "+GOLD,color:GOLD,
            borderRadius:6,padding:"6px 16px",cursor:"pointer",fontFamily:"monospace",fontSize:12}}>
          Trigger Burst
        </button>
        <button onClick={()=>setPlaying(p=>!p)}
          style={{background:PAN2,border:"1px solid "+BORDER,color:TEXT,
            borderRadius:6,padding:"6px 16px",cursor:"pointer",fontFamily:"monospace",fontSize:12}}>
          {playing?"Pause":"Play"}
        </button>
      </div>
      <div style={{display:"flex",gap:20,flexWrap:"wrap",marginTop:10,fontFamily:"monospace",fontSize:12}}>
        <span style={{color:MUTED}}>Gen <span ref={genSpan} style={{color:TEXT}}>0</span></span>
        <span style={{color:MUTED}}>Coherence <span ref={cohSpan} style={{color:CYAN}}>0%</span></span>
        <span style={{color:MUTED}}>Active synapses <span ref={synSpan} style={{color:VIOLET}}>0</span></span>
        <span style={{color:MUTED}}>State <span ref={stSpan} style={{color:GOLD}}>Resting</span></span>
      </div>
    </div>
  );
}

export default function SynapticEntropyPage(){
  const sec:React.CSSProperties={background:PAN,border:"1px solid "+BORDER,borderRadius:12,padding:20,marginBottom:22};
  const secLabel:React.CSSProperties={fontFamily:"monospace",fontSize:10,letterSpacing:2,color:MUTED,textTransform:"uppercase",marginBottom:12};
  const card:React.CSSProperties={background:PAN2,border:"1px solid "+BORDER,borderRadius:8,padding:14};

  const eqs=[
    {letter:"A",label:"Hebbian Synapse Growth",col:GOLD,
     eq:"S(i,j) \u2191 when E(i)\u00b7E(j) > \u03b8",
     desc:"Neurons that fire together wire together. Co-activation above threshold \u03b8 strengthens the connecting synapse. Entropy accelerates co-activation events."},
    {letter:"B",label:"Entropy Firing Rate",col:CYAN,
     eq:"P(fire) = \u03b5 \u00b7 E \u00b7 (1 + burst)",
     desc:"Spontaneous firing probability scales with entropy E. A high-state burst multiplier temporarily supercharges the firing field, seeding dense new synaptic paths."},
    {letter:"C",label:"DNA Dynamics Update",col:GREEN,
     eq:"dN/dt = \u03b1 \u00b7 C(t) \u22c5 S\u00b2(t)",
     desc:"Coherence C gates structural genomic change. High coherence squared drives BDNF and Arc expression, physically remodeling the synaptic scaffold."},
    {letter:"D",label:"Decision Gate",col:VIOLET,
     eq:"Decision \u27fa \u03a3 S(i,j)\u00b7E(j) > \u039b",
     desc:"Decisions crystallize when the weighted input sum across active synapses exceeds threshold \u039b. Strengthened paths lower the energy barrier for each subsequent decision."},
    {letter:"E",label:"Consciousness Coherence",col:BLUE,
     eq:"C(x,t) = A(x) e^{i(\u03c6\u2212\u03c9t)}",
     desc:"The AETHER coherence field unifies neural oscillation. Phase \u03c6 encodes meaning; amplitude A(x) maps spatial salience across the distributed brain network."},
    {letter:"F",label:"Knowledge Crystallization",col:hexA(GOLD,0.9),
     eq:"\u0394T = \u222b C(x,t) dt over bursts",
     desc:"Accumulated coherence integrals update the technological understanding T. Each burst contributes a nucleation event in the crystallizing knowledge lattice."},
  ];

  const phases=[
    {ph:"Resting",e:"< 0.2",col:hexA(TEXT,0.6),
     desc:"Baseline maintenance firing. Existing pathways sustained. Low-energy default mode. Synapses decay slowly toward equilibrium."},
    {ph:"Active",e:"0.2\u20130.5",col:CYAN,
     desc:"Moderate coherent oscillation. New synapse seeds form. Working memory and deliberate reasoning engage the mid-range network."},
    {ph:"High-State Burst",e:"> 0.5",col:GOLD,
     desc:"Short-term surge of parallel co-activation. Rapid synapse strengthening. Insight, flow states, and dense DNA epigenomic signaling cascade simultaneously."},
  ];

  const dna=[
    {label:"BDNF Expression",val:"Burst-gated",col:GREEN,
     note:"Brain-derived neurotrophic factor — strengthens high-activity synapses during burst states"},
    {label:"Arc / Arg3.1",val:"< 5 min",col:CYAN,
     note:"Immediate early gene encodes structural synaptic protein within minutes of high-entropy firing"},
    {label:"ncRNA Epigenome",val:"Writable",col:VIOLET,
     note:"Long non-coding RNA rewrites epigenetic marks, locking new coherent architecture in place"},
    {label:"Reflectin Scaffold",val:"Adaptive",col:BLUE,
     note:"Bio-inspired adaptive protein analogous to octopus reflectin — dynamic structural remodeling"},
  ];

  return (
    <div style={{minHeight:"100vh",background:BG,color:TEXT,padding:"40px 20px 80px",fontFamily:"'Inter',system-ui,sans-serif"}}>
      <div style={{maxWidth:1040,margin:"0 auto"}}>

        <p style={{fontFamily:"monospace",fontSize:11,letterSpacing:2,color:MUTED,textTransform:"uppercase",marginBottom:8}}>
          AETHER · Consciousness Engine
        </p>
        <h1 style={{fontSize:"clamp(22px,4vw,34px)",fontWeight:700,
          background:"linear-gradient(90deg,"+VIOLET+","+CYAN+","+GOLD+")",
          WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent",marginBottom:8}}>
          Cybernetic Brain · Synaptic Entropy Engine
        </h1>
        <p style={{color:MUTED,fontFamily:"monospace",fontSize:13,marginBottom:32}}>
          Synapses grow with entropy · Dense DNA dynamics rewrite the architecture · High-state bursts crystallize new knowledge
        </p>

        <div style={sec}>
          <p style={secLabel}>01 · Live Hebbian Neural Network · Synaptic Growth Simulation</p>
          <SynapticSim />
          <p style={{color:MUTED,fontSize:12,marginTop:10,fontFamily:"monospace",lineHeight:1.6}}>
            Gold = firing neuron · Cyan = active · Violet edges = forming synapses · Gold edges = established pathways · Green rings = DNA-layer nodes · Moving dots = data packets on active synapses
          </p>
        </div>

        <div style={sec}>
          <p style={secLabel}>02 · Mathematical Framework · Entropy-Driven Coherence</p>
          <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(290px,1fr))",gap:12}}>
            {eqs.map(c=>(
              <div key={c.letter} style={{...card,borderColor:hexA(c.col,0.28)}}>
                <div style={{display:"flex",alignItems:"baseline",gap:10,marginBottom:8}}>
                  <span style={{color:GOLD,fontFamily:"monospace",fontSize:20,fontWeight:700}}>{c.letter}</span>
                  <span style={{color:TEXT,fontSize:13,fontWeight:600}}>{c.label}</span>
                </div>
                <p style={{color:c.col,fontFamily:"monospace",fontSize:13,fontWeight:700,marginBottom:6}}>{c.eq}</p>
                <p style={{color:MUTED,fontSize:12,lineHeight:1.6}}>{c.desc}</p>
              </div>
            ))}
          </div>
        </div>

        <div style={sec}>
          <p style={secLabel}>03 · Cognitive Phase States</p>
          <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(240px,1fr))",gap:12}}>
            {phases.map(p=>(
              <div key={p.ph} style={{...card,borderColor:hexA(p.col,0.35)}}>
                <p style={{color:p.col,fontFamily:"monospace",fontSize:14,fontWeight:700,marginBottom:4}}>{p.ph}</p>
                <p style={{color:MUTED,fontFamily:"monospace",fontSize:11,marginBottom:8}}>Entropy {p.e}</p>
                <p style={{color:TEXT,fontSize:13,lineHeight:1.6}}>{p.desc}</p>
              </div>
            ))}
          </div>
        </div>

        <div style={sec}>
          <p style={secLabel}>04 · Dense DNA Dynamics · Architectural Update Layer</p>
          <p style={{color:TEXT,fontSize:14,lineHeight:1.7,marginBottom:16}}>
            The brain is a continuously rewriting architecture. High-state bursts trigger expression of plasticity genes that physically remodel the synaptic scaffold. The AETHER coherence field C(x,t) acts as the gate — determining which pathways crystallize and which dissolve. Over time, the strongest paths become load-bearing structures of understanding.
          </p>
          <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(220px,1fr))",gap:10}}>
            {dna.map(m=>(
              <div key={m.label} style={{...card,borderColor:hexA(m.col,0.3)}}>
                <p style={{color:MUTED,fontFamily:"monospace",fontSize:10,letterSpacing:1,textTransform:"uppercase",marginBottom:4}}>{m.label}</p>
                <p style={{color:m.col,fontFamily:"monospace",fontSize:15,fontWeight:700,marginBottom:4}}>{m.val}</p>
                <p style={{color:MUTED,fontSize:12}}>{m.note}</p>
              </div>
            ))}
          </div>
        </div>

        <div style={sec}>
          <p style={secLabel}>05 · Consciousness as Coherence Attractor · AETHER Framing</p>
          <p style={{color:TEXT,fontSize:14,lineHeight:1.7}}>
            Under the AETHER Crystallization Model, consciousness is not computed but crystallized. Each synapse is a phase relationship. Each thought is a coherent attractor state. Entropy-driven bursts are nucleation events — analogous to the seeding stage in crystal formation — that initiate new cognitive lattice structures. The brain as a whole is a self-organizing system that continuously discovers its own highest-coherence configuration through the pressure of entropy and the memory of what has fired together before.
          </p>
        </div>

        <div style={{marginTop:36,paddingTop:20,borderTop:"1px solid "+BORDER,
          fontFamily:"monospace",fontSize:12,color:MUTED,display:"flex",gap:24,flexWrap:"wrap"}}>
          <Link href="/slinky-propulsion" style={{color:CYAN,textDecoration:"none"}}>\u2192 Slinky Propulsion</Link>
          <Link href="/neural-coherence" style={{color:CYAN,textDecoration:"none"}}>\u2192 Neural Coherence</Link>
          <Link href="/kinematic-replication" style={{color:CYAN,textDecoration:"none"}}>\u2192 Kinematic Replication</Link>
          <Link href="/" style={{color:MUTED,textDecoration:"none"}}>\u2192 Knowledge Graph</Link>
        </div>
      </div>
    </div>
  );
}
