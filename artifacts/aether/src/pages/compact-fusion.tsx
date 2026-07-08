import { useEffect, useRef, useState } from "react";
import { Link } from "wouter";
import imgReactor from "@assets/IMG_3906_1783104902646.jpeg";
import imgMath from "@assets/IMG_3901_1783104902646.jpeg";

const BG="#04060d",PAN="#0a0d1a",PAN2="#0d1020",BORDER="#182038",TEXT="#b8cce8",MUTED="#5a6e8c";
const GOLD="#ffb830",CYAN="#3fd8d0",VIOLET="#a87aff",GREEN="#50d49a",BLUE="#4ab0ff";
function hexA(h:string,a:number){
  const r=parseInt(h.slice(1,3),16),g=parseInt(h.slice(3,5),16),b=parseInt(h.slice(5,7),16);
  return `rgba(${r},${g},${b},${a})`;
}

// ── He-3 vs He-11 comparison canvas ──────────────────────────────────────────
function FuelComparisonCanvas(){
  const ref=useRef<HTMLCanvasElement>(null);
  useEffect(()=>{
    const cv=ref.current; if(!cv) return;
    const dpr=Math.min(2,window.devicePixelRatio||1);
    cv.width=Math.round(cv.clientWidth*dpr);
    cv.height=Math.round(150*dpr);
    const ctx=cv.getContext("2d"); if(!ctx) return;
    ctx.setTransform(dpr,0,0,dpr,0,0);
    const W=cv.clientWidth, H=150;
    ctx.fillStyle=PAN2; ctx.fillRect(0,0,W,H);

    const lx=W*0.25, rx=W*0.72, cy=H*0.42;

    // He-3: turbine/magnetic coil ring
    ctx.strokeStyle=hexA(BLUE,0.8); ctx.lineWidth=1.5;
    ctx.beginPath(); ctx.moveTo(lx-40,cy); ctx.lineTo(lx+40,cy); ctx.stroke();
    for(let i=0;i<10;i++){
      const a=(i/10)*Math.PI*2;
      ctx.beginPath(); ctx.moveTo(lx,cy);
      ctx.lineTo(lx+Math.cos(a)*34,cy+Math.sin(a)*28);
      ctx.strokeStyle=hexA(CYAN,0.6+0.2*(i%2)); ctx.lineWidth=1.5; ctx.stroke();
    }
    ctx.beginPath(); ctx.arc(lx,cy,7,0,Math.PI*2);
    ctx.fillStyle=VIOLET; ctx.fill();
    ctx.beginPath(); ctx.arc(lx-14,cy,4,0,Math.PI*2); ctx.fillStyle=GREEN; ctx.fill();
    ctx.beginPath(); ctx.arc(lx+14,cy,4,0,Math.PI*2); ctx.fillStyle=BLUE; ctx.fill();

    // VS label
    ctx.fillStyle=TEXT; ctx.font="bold 14px Inter,system-ui,sans-serif"; ctx.textAlign="center";
    ctx.fillText("VS",W*0.5,cy+5);

    // He-11: concentric particle lattice (dot field from image)
    const rings=[
      {r:10,n:7,col:GOLD,sz:3.5},
      {r:22,n:13,col:"#ff8c42",sz:3},
      {r:33,n:18,col:BLUE,sz:3},
      {r:44,n:10,col:hexA(CYAN,0.7),sz:2.5},
      {r:54,n:6,col:hexA(GOLD,0.45),sz:2},
    ];
    for(const ring of rings){
      for(let i=0;i<ring.n;i++){
        const a=(i/ring.n)*Math.PI*2;
        ctx.beginPath();
        ctx.arc(rx+Math.cos(a)*ring.r,cy+Math.sin(a)*ring.r,ring.sz,0,Math.PI*2);
        ctx.fillStyle=ring.col; ctx.fill();
      }
    }
    ctx.beginPath(); ctx.arc(rx,cy,5,0,Math.PI*2); ctx.fillStyle=GOLD; ctx.fill();

    // power scale bar
    const barY=H-24, barX0=W*0.05, barW=W*0.9;
    ctx.strokeStyle=hexA(BORDER,1); ctx.lineWidth=1;
    ctx.beginPath(); ctx.moveTo(barX0,barY); ctx.lineTo(barX0+barW,barY); ctx.stroke();
    const ms=[{v:25,frac:0},{v:50,frac:0.33},{v:75,frac:0.67},{v:100,frac:1}];
    ms.forEach(m=>{
      const x=barX0+barW*m.frac;
      ctx.strokeStyle=m.v>=75?GOLD:hexA(TEXT,0.4); ctx.lineWidth=m.v>=75?2:1;
      ctx.beginPath(); ctx.moveTo(x,barY-5); ctx.lineTo(x,barY+5); ctx.stroke();
      ctx.fillStyle=m.v>=75?GOLD:hexA(TEXT,0.6);
      ctx.font="bold 12px monospace"; ctx.textAlign="center";
      ctx.fillText(String(m.v),x,H-6);
    });

    // top labels
    ctx.fillStyle=CYAN; ctx.font="bold 13px Inter,system-ui,sans-serif"; ctx.textAlign="center";
    ctx.fillText("Helium-3",lx,16);
    ctx.fillStyle=GOLD; ctx.fillText("Helium-11",rx,16);
    ctx.fillStyle=hexA(GOLD,0.8); ctx.fillText("Power",W-28,cy+5);
  },[]);
  return <canvas ref={ref} style={{width:"100%",height:150,borderRadius:8,display:"block"}} />;
}

// ── Live toroidal plasma simulation ─────────────────────────────────────────
function PlasmaReactorSim(){
  const cvRef=useRef<HTMLCanvasElement>(null);
  const xRef=useRef(4);
  const betaRef=useRef(0.5);
  const playRef=useRef(true);
  const [xVal,setXVal]=useState(4);
  const [beta,setBeta]=useState(0.5);
  const [playing,setPlaying]=useState(true);

  useEffect(()=>{xRef.current=xVal;},[xVal]);
  useEffect(()=>{betaRef.current=beta;},[beta]);
  useEffect(()=>{playRef.current=playing;},[playing]);

  const gainRef=useRef<HTMLSpanElement>(null);
  const betaDispRef=useRef<HTMLSpanElement>(null);

  useEffect(()=>{
    const cv=cvRef.current; if(!cv) return;
    const ctx=cv.getContext("2d"); if(!ctx) return;
    let raf=0, t=0, lastW=0;
    const reduced=window.matchMedia&&window.matchMedia("(prefers-reduced-motion:reduce)").matches;

    const loop=()=>{
      const dpr=Math.min(2,window.devicePixelRatio||1);
      const W=cv.clientWidth||640, H=300;
      if(W!==lastW){ cv.width=Math.round(W*dpr); cv.height=Math.round(H*dpr); lastW=W; }
      ctx.setTransform(dpr,0,0,dpr,0,0);

      if(playRef.current && !reduced) t+=0.018;

      const Xv=xRef.current;
      const Bv=betaRef.current;
      const powerGain=Math.pow(2,Xv);
      const betaExp=(Bv*12-5).toFixed(1);

      if(gainRef.current) gainRef.current.textContent="2^"+Xv+" = "+powerGain.toLocaleString()+"x";
      if(betaDispRef.current) betaDispRef.current.textContent="B^"+betaExp;

      const cxC=W/2, cyC=H/2;
      const rx=Math.min(W*0.41,190), ry=Math.min(H*0.38,105);

      ctx.fillStyle=BG; ctx.fillRect(0,0,W,H);

      // wireframe shell
      ctx.strokeStyle=hexA(BLUE,0.18); ctx.lineWidth=1;
      for(let i=-5;i<=5;i++){
        const fr=i/5;
        const yp=cyC+fr*ry;
        const hw=rx*Math.sqrt(Math.max(0,1-fr*fr));
        ctx.beginPath(); ctx.moveTo(cxC-hw,yp); ctx.lineTo(cxC+hw,yp); ctx.stroke();
      }
      for(let i=-7;i<=7;i++){
        const fr=i/7;
        const xp=cxC+fr*rx;
        const hh=ry*Math.sqrt(Math.max(0,1-fr*fr));
        ctx.beginPath(); ctx.moveTo(xp,cyC-hh); ctx.lineTo(xp,cyC+hh); ctx.stroke();
      }

      // superconducting coil rings
      const nCoils=8;
      for(let i=0;i<nCoils;i++){
        const fx=(i+0.5)/nCoils;
        const xp=cxC+(fx-0.5)*1.7*rx;
        const fr=(fx-0.5)*2;
        const coilH=ry*0.82*Math.sqrt(Math.max(0,1-fr*fr));
        const phase=t*1.4+i*0.5;
        const tw=Xv*0.22;
        ctx.strokeStyle=hexA(CYAN,0.45+0.25*Math.sin(phase));
        ctx.lineWidth=1.5+Bv*1.5;
        ctx.beginPath();
        for(let a=0;a<=Math.PI*2+0.1;a+=0.07){
          const ex=xp+Math.cos(a+phase*0.18+tw*fx)*16;
          const ey=cyC+Math.sin(a+phase*0.18)*coilH;
          a<0.07?ctx.moveTo(ex,ey):ctx.lineTo(ex,ey);
        }
        ctx.stroke();
      }

      // twisting plasma thread (2^X looping)
      const pN=72;
      const twistFactor=Xv*0.35;
      for(let i=0;i<pN;i++){
        const fi=i/pN;
        const ang=fi*Math.PI*2*4+t*(1+Xv*0.25)+twistFactor*Math.sin(fi*Math.PI*3);
        const radX=rx*0.52*(0.65+0.35*Math.sin(fi*Math.PI*5+t*0.9));
        const radY=ry*0.52*(0.65+0.35*Math.cos(fi*Math.PI*4+t*1.2));
        const px=cxC+Math.cos(ang)*radX;
        const py=cyC+Math.sin(ang)*radY;
        const hot=0.5+0.5*Math.sin(fi*Math.PI*7+t*1.8);
        ctx.beginPath(); ctx.arc(px,py,1.8+Bv*2,0,Math.PI*2);
        ctx.fillStyle=hot>0.5?hexA(GOLD,0.75):hexA(VIOLET,0.6); ctx.fill();
      }

      // radial plasma glow
      const grad=ctx.createRadialGradient(cxC,cyC,0,cxC,cyC,ry*0.45);
      const glowA=0.07+Bv*0.08+(Xv/16)*0.06;
      grad.addColorStop(0,hexA(GOLD,glowA)); grad.addColorStop(1,hexA(GOLD,0));
      ctx.fillStyle=grad; ctx.fillRect(0,0,W,H);

      // port labels
      ctx.font="10px monospace"; ctx.textAlign="left"; ctx.fillStyle=hexA(GREEN,0.8);
      ctx.fillText("Input",cxC+rx+6,cyC-14);
      ctx.fillStyle=hexA(GOLD,0.8);
      ctx.fillText("Output",cxC+rx+6,cyC+6);
      ctx.font="10px monospace"; ctx.textAlign="right";
      ctx.fillStyle=hexA(VIOLET,0.85); ctx.fillText("B\u2077 (high \u03b2)",cxC-rx-6,cyC-14);
      ctx.fillStyle=hexA(CYAN,0.75); ctx.fillText("B\u207b\u2075 (low \u03b2)",cxC-rx-6,cyC+6);

      raf=requestAnimationFrame(loop);
    };
    raf=requestAnimationFrame(loop);
    return ()=>cancelAnimationFrame(raf);
  },[]);

  const betaExpDisplay=(-5+beta*12).toFixed(1);

  return (
    <div>
      <canvas ref={cvRef} style={{width:"100%",height:300,borderRadius:8,display:"block"}} />
      <div style={{marginTop:12,display:"flex",gap:20,flexWrap:"wrap",alignItems:"center"}}>
        <label style={{flex:1,minWidth:200,color:TEXT,fontSize:12,fontFamily:"monospace"}}>
          {"Magnetic factor X — 2^X = "}<span ref={gainRef} style={{color:GOLD}}>16x</span>
          <input type="range" min={1} max={16} step={1} value={xVal}
            onChange={e=>{const v=+e.target.value;setXVal(v);xRef.current=v;}}
            style={{display:"block",width:"100%",marginTop:4}} />
        </label>
        <label style={{flex:1,minWidth:200,color:TEXT,fontSize:12,fontFamily:"monospace"}}>
          {"Beta exponent — "}<span ref={betaDispRef} style={{color:CYAN}}>{"B^"+betaExpDisplay}</span>
          <input type="range" min={0} max={1} step={0.01} value={beta}
            onChange={e=>{const v=+e.target.value;setBeta(v);betaRef.current=v;}}
            style={{display:"block",width:"100%",marginTop:4}} />
        </label>
        <button onClick={()=>setPlaying(p=>!p)}
          style={{background:PAN2,border:"1px solid "+BORDER,color:TEXT,borderRadius:6,
            padding:"6px 18px",cursor:"pointer",fontFamily:"monospace",fontSize:12}}>
          {playing?"Pause":"Play"}
        </button>
      </div>
    </div>
  );
}

// ── Efficiency ramp chart ─────────────────────────────────────────────────────
function EfficiencyChart(){
  const ref=useRef<HTMLCanvasElement>(null);
  useEffect(()=>{
    const cv=ref.current; if(!cv) return;
    const dpr=Math.min(2,window.devicePixelRatio||1);
    cv.width=Math.round(cv.clientWidth*dpr); cv.height=Math.round(160*dpr);
    const ctx=cv.getContext("2d"); if(!ctx) return;
    ctx.setTransform(dpr,0,0,dpr,0,0);
    const W=cv.clientWidth, H=160;
    ctx.fillStyle=PAN2; ctx.fillRect(0,0,W,H);

    const pL=36,pR=24,pT=18,pB=28;
    const cw=W-pL-pR, ch=H-pT-pB;

    // grid
    ctx.strokeStyle=hexA(BORDER,0.5); ctx.lineWidth=1;
    [0,25,50,75,100].forEach(v=>{
      const y=pT+ch*(1-v/100);
      ctx.beginPath(); ctx.moveTo(pL,y); ctx.lineTo(pL+cw,y); ctx.stroke();
      ctx.fillStyle=MUTED; ctx.font="9px monospace"; ctx.textAlign="right";
      ctx.fillText(String(v),pL-4,y+3);
    });
    // axes
    ctx.strokeStyle=hexA(TEXT,0.2); ctx.lineWidth=1;
    ctx.beginPath(); ctx.moveTo(pL,pT); ctx.lineTo(pL,pT+ch); ctx.lineTo(pL+cw,pT+ch); ctx.stroke();

    // x-axis labels
    ["0","4","8","12","16"].forEach((v,i)=>{
      ctx.fillStyle=MUTED; ctx.font="9px monospace"; ctx.textAlign="center";
      ctx.fillText(v,pL+cw*(i/4),pT+ch+14);
    });

    // triangular ramp fill (from image — linear ramp to B^-5 efficiency)
    const grad=ctx.createLinearGradient(pL,0,pL+cw,0);
    grad.addColorStop(0,hexA(GOLD,0.05));
    grad.addColorStop(0.7,hexA(GOLD,0.3));
    grad.addColorStop(1,hexA(GOLD,0.55));
    ctx.fillStyle=grad;
    ctx.beginPath();
    ctx.moveTo(pL,pT+ch);
    ctx.lineTo(pL+cw,pT);
    ctx.lineTo(pL+cw,pT+ch);
    ctx.closePath(); ctx.fill();

    // ramp stroke
    ctx.strokeStyle=GOLD; ctx.lineWidth=2;
    ctx.beginPath(); ctx.moveTo(pL,pT+ch); ctx.lineTo(pL+cw,pT); ctx.stroke();

    // B^-5 label
    ctx.fillStyle=GOLD; ctx.font="bold 10px monospace"; ctx.textAlign="left";
    ctx.fillText("B\u207b\u2075",pL+cw+3,pT+10);

    ctx.fillStyle=MUTED; ctx.font="9px monospace"; ctx.textAlign="left";
    ctx.fillText("X (magnetic factor)",pL+cw/2-20,pT+ch+14);
  },[]);
  return <canvas ref={ref} style={{width:"100%",height:160,borderRadius:8,display:"block"}} />;
}

// ── Page ─────────────────────────────────────────────────────────────────────
export default function CompactFusionPage(){
  const sec:React.CSSProperties={background:PAN,border:"1px solid "+BORDER,borderRadius:12,padding:20,marginBottom:22};
  const secLabel:React.CSSProperties={fontFamily:"monospace",fontSize:10,letterSpacing:2,color:MUTED,textTransform:"uppercase",marginBottom:12};
  const card:React.CSSProperties={background:PAN2,border:"1px solid "+BORDER,borderRadius:8,padding:14};
  const kicker:React.CSSProperties={fontFamily:"monospace",fontSize:11,letterSpacing:2,color:MUTED,textTransform:"uppercase",marginBottom:8};

  const annotations=[
    {label:"B^7",note:"High-beta limit — maximum confinement pressure",col:VIOLET},
    {label:"B^-5",note:"Low-beta efficiency floor — peak efficiency state",col:CYAN},
    {label:"Input Port",note:"Fuel injection + magnetic field entry",col:GREEN},
    {label:"Output Port",note:"Thermal/electrical power extraction",col:GOLD},
    {label:"Coil Stack",note:"8 nested superconducting coils, exponential twist looping",col:BLUE},
    {label:"Core Plasma",note:"Toroidal plasma thread — 2^X magnetic gain regime",col:hexA(GOLD,0.9)},
  ];

  const confTable=[
    {metric:"Magic Fuel Cycle",value:"2^X · 04 60m",col:GOLD},
    {metric:"Magnetic Power",value:"2tm",col:CYAN},
    {metric:"Increased Gain",value:"10thm",col:GREEN},
    {metric:"Power Generation","16 tigm":true,value:"16 tigm",col:VIOLET},
  ];

  const mathPanels=[
    {letter:"A",title:"Fibonacci Anyon Quantum Dimension",eq:"d\u03a9 = \u03c0",
     desc:"Quantum dimension of a Fibonacci anyon equals \u03c0 — minimal non-abelian braiding enabling universal topological computation in the plasma confinement manifold."},
    {letter:"B",title:"Golden-Angle Spiral Waveguide Packing",eq:"137.5\u00b0",
     desc:"Golden angle \u03c6 = 137.5\u00b0 optimizes waveguide packing density in plasma confinement — maximum node coverage with minimum interference overlap."},
    {letter:"C",title:"Integration Coherence",eq:"\u03c0 (resonance peak)",
     desc:"Coherence integral peaks at \u03c0, defining the standing-mode resonance condition for stable plasma boundary and minimum energy loss."},
    {letter:"D",title:"Power-Law Exponents",eq:"\u2264 1.5\u03a9",
     desc:"Critical exponent for self-organized plasma criticality — power-law scaling with exponent \u2264 1.5\u03a9 marks the coherent, stable-confinement regime."},
    {letter:"E",title:"Connection Age Decay",eq:"\u03c0 \u2212 n\u03a9",
     desc:"Magnetic connection strength decays as \u03c0 \u2212 n\u03a9 — node connections weaken with iteration depth n, setting natural reconfiguration and maintenance timescales."},
    {letter:"F",title:"Cross-Level Coupling Recurrence",eq:"Level(n+1) = \u221a(Level(n) + Level(n\u22121))",
     desc:"Recurrence relation for cross-scale coupling — each coherence level is the sub-geometric mean of its two predecessors, building a fractal confinement hierarchy."},
  ];

  const perfMetrics=[
    {label:"Topological Density",val:"Fibonacci lattice",note:"Golden-angle 137.5\u00b0 node spacing"},
    {label:"Plasma Twist Modes",val:"16 loops",note:"2^X exponential gain via magnetic looping"},
    {label:"Coherence Resonance",val:"\u03c0 peak",note:"Integration coherence at \u03c0 — stable mode"},
    {label:"Decay Timescale",val:"\u03c0 \u2212 n\u03a9",note:"Connection age decay — reconfiguration rate"},
    {label:"Coupling Recurrence",val:"\u221a(L(n)+L(n-1))",note:"Cross-level fractal hierarchy"},
    {label:"Power-Law Exponent",val:"\u2264 1.5\u03a9",note:"Self-organized criticality boundary"},
    {label:"Fuel Cycle Gain",val:"2^X",note:"Magic number exponential gain per cycle"},
    {label:"Efficiency Floor",val:"B^\u207b\u2075",note:"Low-beta optimum from ramp model"},
  ];

  return (
    <div style={{minHeight:"100vh",background:BG,color:TEXT,padding:"40px 20px 80px",fontFamily:"'Inter',system-ui,sans-serif"}}>
      <div style={{maxWidth:1040,margin:"0 auto"}}>

        <p style={kicker}>AETHER · Compact Fusion Concept</p>
        <h1 style={{fontSize:"clamp(22px,4vw,34px)",fontWeight:700,
          background:"linear-gradient(90deg,"+VIOLET+","+CYAN+","+BLUE+")",
          WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent",marginBottom:8}}>
          Smallest Possible Nuclear Fusion Reactor
        </h1>
        <p style={{color:MUTED,fontFamily:"monospace",fontSize:13,marginBottom:32}}>
          Compact · Mobile · Easily Disassembled · Beta-Optimized · 2^X Magnetic Exponential Gain
        </p>

        {/* 01 — Fuel pathways */}
        <div style={sec}>
          <p style={secLabel}>01 · Fuel Pathway Comparison · He-3 vs He-11</p>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:14,marginBottom:14}}>
            <div style={{...card,borderColor:hexA(CYAN,0.3)}}>
              <p style={{color:CYAN,fontFamily:"monospace",fontSize:11,letterSpacing:1,textTransform:"uppercase",marginBottom:6}}>Helium-3</p>
              <p style={{color:TEXT,fontSize:13,lineHeight:1.6}}>
                D + \u00b3He \u2192 \u2074He + p + 18.3 MeV. Aneutronic pathway — direct charged-particle output, minimal radioactivation. Compact magnetic confinement optimal for mobile designs. Power milestone range 25\u201350.
              </p>
            </div>
            <div style={{...card,borderColor:hexA(GOLD,0.3)}}>
              <p style={{color:GOLD,fontFamily:"monospace",fontSize:11,letterSpacing:1,textTransform:"uppercase",marginBottom:6}}>Helium-11</p>
              <p style={{color:TEXT,fontSize:13,lineHeight:1.6}}>
                Exotic neutron-rich isotope (\u00b9\u00b9He, t\u00bd \u2248 6.5 ms) — speculative advanced pathway. High-neutron output maps to a dense concentric dot-field plasmon lattice. Power milestone range 75\u2013100.
              </p>
            </div>
          </div>
          <FuelComparisonCanvas />
        </div>

        {/* 02 — Blueprint image plate */}
        <div style={sec}>
          <p style={secLabel}>02 · Reactor Core · Blueprint Reference</p>
          <img src={imgReactor} alt="Compact fusion reactor cross-section blueprint"
            style={{width:"100%",borderRadius:8,display:"block",maxHeight:440,objectFit:"contain",background:PAN2,marginBottom:14}} />
          <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(180px,1fr))",gap:10}}>
            {annotations.map(a=>(
              <div key={a.label} style={{...card,borderColor:hexA(a.col,0.35)}}>
                <p style={{color:a.col,fontFamily:"monospace",fontSize:11,fontWeight:700,marginBottom:4}}>{a.label}</p>
                <p style={{color:MUTED,fontSize:12}}>{a.note}</p>
              </div>
            ))}
          </div>
        </div>

        {/* 03 — Live plasma sim */}
        <div style={sec}>
          <p style={secLabel}>03 · Live Plasma Simulation · Exponential Twist & Loop</p>
          <PlasmaReactorSim />
          <div style={{marginTop:16,display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(190px,1fr))",gap:10}}>
            {[
              {label:"Magnetic Gain",val:"2^X",note:"Exponential twist — 2 to the power X, up to 65,536x"},
              {label:"Plasma Loops",val:"16\u00d7",note:"16 times power gain via exponential looping"},
              {label:"Beta Range",val:"B\u207b\u2075 \u2192 B\u2077",note:"Confinement parameter: low-efficiency floor to high-pressure peak"},
            ].map(c=>(
              <div key={c.label} style={card}>
                <p style={{color:MUTED,fontFamily:"monospace",fontSize:10,letterSpacing:1,textTransform:"uppercase",marginBottom:4}}>{c.label}</p>
                <p style={{color:GOLD,fontFamily:"monospace",fontSize:20,fontWeight:700,marginBottom:4}}>{c.val}</p>
                <p style={{color:MUTED,fontSize:12}}>{c.note}</p>
              </div>
            ))}
          </div>
        </div>

        {/* 04 — Efficiency + Confidence */}
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:16,marginBottom:22}}>
          <div style={sec}>
            <p style={secLabel}>04A · Efficiency Optimization</p>
            <EfficiencyChart />
            <p style={{color:MUTED,fontSize:11,fontFamily:"monospace",marginTop:8}}>
              Ramp from X=0 to X=16 — efficiency reaches B^\u207b\u2075 floor at maximum magnetic factor.
            </p>
          </div>
          <div style={sec}>
            <p style={secLabel}>04B · Confidence Threshold</p>
            <table style={{width:"100%",borderCollapse:"collapse",fontSize:13}}>
              <thead>
                <tr>
                  <th style={{textAlign:"left",color:MUTED,fontFamily:"monospace",fontSize:10,
                    letterSpacing:1,paddingBottom:8,borderBottom:"1px solid "+BORDER}}>Metric</th>
                  <th style={{textAlign:"right",color:MUTED,fontFamily:"monospace",fontSize:10,
                    letterSpacing:1,paddingBottom:8,borderBottom:"1px solid "+BORDER}}>Fuel Cycle</th>
                </tr>
              </thead>
              <tbody>
                {confTable.map((r,i)=>(
                  <tr key={i}>
                    <td style={{color:r.col,fontFamily:"monospace",fontSize:12,
                      padding:"8px 0",borderBottom:"1px solid "+hexA(BORDER,0.5)}}>{r.metric}</td>
                    <td style={{color:TEXT,fontFamily:"monospace",fontSize:12,textAlign:"right",
                      padding:"8px 0",borderBottom:"1px solid "+hexA(BORDER,0.5)}}>{r.value}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* 05 — Math framework */}
        <div style={sec}>
          <p style={secLabel}>05 · Mathematical Framework · Topological Coherence Structure</p>
          <img src={imgMath} alt="Six-panel mathematical framework — Fibonacci anyon, golden-angle waveguide, integration coherence, power-law exponents, connection age decay, cross-level coupling"
            style={{width:"100%",borderRadius:8,display:"block",maxHeight:380,objectFit:"contain",background:PAN2,marginBottom:16}} />
          <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(290px,1fr))",gap:12}}>
            {mathPanels.map(p=>(
              <div key={p.letter} style={{...card,borderColor:hexA(GOLD,0.25)}}>
                <div style={{display:"flex",alignItems:"baseline",gap:10,marginBottom:8}}>
                  <span style={{color:GOLD,fontFamily:"monospace",fontSize:22,fontWeight:700,lineHeight:1}}>{p.letter}</span>
                  <span style={{color:TEXT,fontSize:13,fontWeight:600}}>{p.title}</span>
                </div>
                <p style={{color:CYAN,fontFamily:"monospace",fontSize:14,fontWeight:700,marginBottom:6}}>{p.eq}</p>
                <p style={{color:MUTED,fontSize:12,lineHeight:1.6}}>{p.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* 06 — Performance metrics */}
        <div style={sec}>
          <p style={secLabel}>06 · Performance · Arithmetic Sequential Coherence States</p>
          <p style={{color:MUTED,fontSize:13,marginBottom:16,lineHeight:1.6}}>
            All arithmetic, mathematical, sequential, and symmetrical topological states mapped to a single system — finding the highest coherent, structured engine configurations across density, porosity, and recurrence layers.
          </p>
          <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(200px,1fr))",gap:10}}>
            {perfMetrics.map(m=>(
              <div key={m.label} style={card}>
                <p style={{color:MUTED,fontFamily:"monospace",fontSize:10,letterSpacing:1,textTransform:"uppercase",marginBottom:4}}>{m.label}</p>
                <p style={{color:GOLD,fontFamily:"monospace",fontSize:16,fontWeight:700,marginBottom:4}}>{m.val}</p>
                <p style={{color:MUTED,fontSize:12}}>{m.note}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div style={{marginTop:40,paddingTop:20,borderTop:"1px solid "+BORDER,
          fontFamily:"monospace",fontSize:12,color:MUTED,display:"flex",gap:24,flexWrap:"wrap"}}>
          <Link href="/warp-bubble-engine" style={{color:CYAN,textDecoration:"none"}}>
            \u2192 Warp Bubble Engine
          </Link>
          <Link href="/gradient-field" style={{color:CYAN,textDecoration:"none"}}>
            \u2192 Gradient Field · Mechanisms
          </Link>
          <Link href="/aether-engine" style={{color:CYAN,textDecoration:"none"}}>
            \u2192 AETHER Engine
          </Link>
          <Link href="/graph-map" style={{color:MUTED,textDecoration:"none"}}>
            \u2192 Knowledge Graph
          </Link>
        </div>

      </div>
    </div>
  );
}
