import { useEffect, useRef } from "react";
import { Link } from "wouter";

const BG="#04060d",PAN="#0a0d1a",PAN2="#0d1020",BORDER="#182038",TEXT="#b8cce8",MUTED="#5a6e8c";
const GOLD="#ffb830",CYAN="#3fd8d0",VIOLET="#a87aff",GREEN="#50d49a",BLUE="#4ab0ff",ROSE="#ff5a6a";

function hexA(h:string,a:number){const n=h.replace("#","");return `rgba(${parseInt(n.slice(0,2),16)},${parseInt(n.slice(2,4),16)},${parseInt(n.slice(4,6),16)},${a})`;}
function fitCanvas(cv:HTMLCanvasElement,ctx:CanvasRenderingContext2D){const dpr=Math.min(2,window.devicePixelRatio||1);const w=cv.clientWidth||640;const h=cv.clientHeight||260;cv.width=Math.round(w*dpr);cv.height=Math.round(h*dpr);ctx.setTransform(dpr,0,0,dpr,0,0);return{w,h};}

/* Five-phase loop diagram + wearable biomarker concept */
function FivePhaseCanvas(){
  const cvRef=useRef<HTMLCanvasElement|null>(null);
  useEffect(()=>{
    const cv=cvRef.current; if(!cv)return;
    const ctx=cv.getContext("2d"); if(!ctx)return;
    let raf=0,t=0;
    const PHASES=["SENSE","DELIVER","ACTIVATE","FEEDBACK","LEARN"];
    const COLS=[CYAN,BLUE,VIOLET,GREEN,GOLD];

    const loop=()=>{
      const{w,h}=fitCanvas(cv,ctx);
      t+=0.018;
      ctx.clearRect(0,0,w,h); ctx.fillStyle=BG; ctx.fillRect(0,0,w,h);
      const cx=w*0.5,cy=h*0.5, R=Math.min(w,h)*0.37;

      // orbit ring
      ctx.strokeStyle=hexA(CYAN,0.1); ctx.lineWidth=1.5;
      ctx.beginPath(); ctx.arc(cx,cy,R,0,Math.PI*2); ctx.stroke();

      // active packet travelling around
      const packAng=t*0.6;
      const px=cx+Math.cos(packAng)*R, py=cy+Math.sin(packAng)*R;
      ctx.fillStyle=hexA(GOLD,0.9);
      ctx.shadowColor=GOLD; ctx.shadowBlur=18;
      ctx.beginPath(); ctx.arc(px,py,7,0,Math.PI*2); ctx.fill();
      ctx.shadowBlur=0;

      // phase nodes
      PHASES.forEach((p,i)=>{
        const ang=(i/5)*Math.PI*2-Math.PI/2;
        const nx=cx+Math.cos(ang)*R, ny=cy+Math.sin(ang)*R;
        const active=Math.abs(((packAng%(Math.PI*2))/(Math.PI*2)*5)-i)<0.55;
        const col=COLS[i];
        ctx.fillStyle=active?col:hexA(col,0.4);
        ctx.shadowColor=col; ctx.shadowBlur=active?24:8;
        ctx.beginPath(); ctx.arc(nx,ny,active?13:9,0,Math.PI*2); ctx.fill();
        ctx.shadowBlur=0;
        // label
        ctx.fillStyle=active?col:hexA(col,0.65);
        ctx.font=`bold ${active?12:10}px monospace`;
        const tx=nx+Math.cos(ang)*26-22, ty=ny+Math.sin(ang)*26+4;
        ctx.fillText(p,tx,ty);
        // spoke
        ctx.strokeStyle=hexA(col,0.2); ctx.lineWidth=1;
        ctx.beginPath(); ctx.moveTo(cx,cy); ctx.lineTo(nx,ny); ctx.stroke();
      });

      // centre label
      ctx.fillStyle=hexA(TEXT,0.85); ctx.font="bold 13px monospace";
      ctx.fillText("AETHER",cx-30,cy-8);
      ctx.fillStyle=hexA(MUTED,0.7); ctx.font="10px monospace";
      ctx.fillText("Scale-Invariant",cx-42,cy+8);
      ctx.fillText("Five-Phase Loop",cx-42,cy+21);

      // biomarker bars at bottom
      const bars=[{lab:"RBC",v:0.6+0.12*Math.sin(t*1.2),col:ROSE},{lab:"WBC",v:0.45+0.08*Math.sin(t*0.9+1),col:CYAN},{lab:"PLT",v:0.55+0.1*Math.sin(t*1.5+2),col:GOLD}];
      const bx=8,by=h-32;
      bars.forEach((b,i)=>{
        const bw=(w-20)/3-8;
        const x=bx+i*(bw+8);
        ctx.fillStyle=hexA(b.col,0.12); ctx.fillRect(x,by,bw,20);
        ctx.fillStyle=b.col; ctx.fillRect(x,by,bw*b.v,20);
        ctx.fillStyle=TEXT; ctx.font="10px monospace";
        ctx.fillText(b.lab,x+4,by+14);
      });

      raf=requestAnimationFrame(loop);
    };
    raf=requestAnimationFrame(loop);
    return()=>cancelAnimationFrame(raf);
  },[]);

  return(
    <div>
      <canvas ref={cvRef} style={{width:"100%",height:260,display:"block",borderRadius:10,border:`1px solid ${BORDER}`}}/>
      <p style={{fontFamily:"monospace",fontSize:11,color:MUTED,marginTop:8}}>
        Five-phase loop circulating a coherence packet. Bottom: wearable biomarker monitors (RBC · WBC · PLT) updating in real time.
      </p>
    </div>
  );
}

const FIVE_PHASE=[
  {ph:"SENSE",bio:"Sensory receptors / CBC markers",fn:"PPG + impedance signal capture",geo:"Seismic array / strain gauges",col:CYAN},
  {ph:"DELIVER",bio:"Vascular transport (RBC/WBC flow)",fn:"BLE data stream to edge / cloud",geo:"Ridge push — plate divergence",col:BLUE},
  {ph:"ACTIVATE",bio:"Hematopoietic stem cell activation",fn:"FQP-Edge-1 ASIC inference",geo:"Slab pull — subduction drive",col:VIOLET},
  {ph:"FEEDBACK",bio:"Cytokine / clonal feedback loops",fn:"Claude AI dashboard personalization",geo:"Mantle convection return flow",col:GREEN},
  {ph:"LEARN",bio:"Epigenetic memory / marrow adaptation",fn:"Federated on-device model update",geo:"Long-cycle tectonic memory",col:GOLD},
];

const SENSOR_STACK=[
  {k:"PPG array",v:"3-wavelength (660/880/940 nm) — hemoglobin saturation + microvascular pulse morphology"},
  {k:"Bioimpedance spectroscopy",v:"1 kHz – 1 MHz — hematocrit, cell volume, plasma osmolarity"},
  {k:"Interstitial fluid patch",v:"Glucose, lactate, uric acid — metabolic correlates of marrow stress"},
];

const FQP_SPECS=[
  {k:"Process node",v:"TSMC 28nm HPC+"},
  {k:"Die area",v:"4 mm²"},
  {k:"Power",v:"<10 mW typical, <18 mW peak"},
  {k:"Inference latency",v:"<50 ms (full 5-phase loop)"},
  {k:"On-chip SRAM",v:"2 MB"},
  {k:"Unit cost (10k vol.)",v:"$1 – $3"},
];

const BIOMATERIALS=[
  {mat:"Spider silk (recombinant MaSp1/2)",prop:"Tensile strength 1.1 GPa, biocompatible, piezoelectric signal coupling"},
  {mat:"Octopus suckerrin protein",prop:"Pressure-sensitive adhesion without surface chemistry, conformable to wrist curvature"},
  {mat:"Shellfish chitin scaffold",prop:"Antimicrobial, moisture-wicking, biodegradable outer shell"},
];

const MARKET=[
  {seg:"Hematology diagnostics",sz:"$28B",entry:"Clinical CBC replacement (Year 3+)"},
  {seg:"Continuous glucose monitors",sz:"$12B",entry:"Regulatory precedent for wellness path"},
  {seg:"Wearable health monitors",sz:"$36B",entry:"Direct consumer launch Q3 2026"},
  {seg:"Precision oncology monitoring",sz:"$9B",entry:"Chemo titration partnership (Year 2)"},
  {seg:"Regenerative medicine dx",sz:"$4B",entry:"Bone marrow / stem cell tracking (Year 4)"},
];

const TECTONIC=[
  {ph:"SENSE",geo:"Seismic strain accumulation at plate boundaries"},
  {ph:"DELIVER",geo:"Ridge push — thermal expansion drives plate divergence"},
  {ph:"ACTIVATE",geo:"Slab pull — gravitational collapse drives subduction"},
  {ph:"FEEDBACK",geo:"Mantle convection return flow re-thermalizes ascending rock"},
  {ph:"LEARN",geo:"Long-cycle lithospheric memory encoded in rock rheology / mineral phases"},
];

export default function AetherWhitepaperV1Page(){
  return(
    <div style={{minHeight:"100vh",background:BG,color:TEXT,padding:"40px 20px 80px",fontFamily:"'Inter',system-ui,sans-serif"}}>
      <div style={{maxWidth:980,margin:"0 auto"}}>
        <div style={{fontFamily:"monospace",fontSize:11,color:MUTED,letterSpacing:2,textTransform:"uppercase",marginBottom:8}}>PROJECT AETHER · White Paper v1.0 · March 2026 · CONFIDENTIAL</div>
        <h1 style={{fontSize:30,margin:"0 0 8px",fontWeight:700,background:`linear-gradient(90deg,${CYAN},${VIOLET},${GOLD})`,WebkitBackgroundClip:"text",backgroundClip:"text",color:"transparent"}}>
          PROJECT AETHER · Scale-Invariant Framework for Living Systems
        </h1>
        <p style={{fontFamily:"monospace",fontSize:12,color:MUTED,margin:"0 0 6px"}}>From Bone Marrow to Planetary Intelligence</p>
        <p style={{fontFamily:"monospace",fontSize:11,color:hexA(MUTED,0.7),margin:"0 0 24px"}}>AetherLife.co · contact@aetherlife.co · Version 1.0 · March 2026</p>

        <div style={{background:hexA(CYAN,0.05),border:`1px solid ${hexA(CYAN,0.2)}`,borderRadius:10,padding:"14px 18px",marginBottom:24,fontSize:13.5,color:TEXT,lineHeight:1.8}}>
          <strong>Executive Summary:</strong> AETHER is a scale-invariant computational and biological framework that unifies the five-phase sensing-activation loop across every domain where matter self-organizes: from the stem cells inside human bone marrow, through engineered photonic circuits, to the convective engine of Earth's mantle. At its commercial core, AETHER is a wearable continuous hematology monitor — the world's first device capable of non-invasively tracking red blood cell, white blood cell, and platelet dynamics in real time. Built on a purpose-designed Fibonacci-resonance ASIC (FQP-Edge-1), novel biomaterial patch chemistry, and Claude-powered AI dashboards. Core thesis: The same sparse-local feedback loop that governs marrow clonal expansion also drives ridge push, slab pull, and mantle convection.
        </div>

        <div style={{background:PAN,border:`1px solid ${BORDER}`,borderRadius:12,padding:18,marginBottom:24}}>
          <div style={{fontFamily:"monospace",fontSize:11,color:CYAN,marginBottom:12,textTransform:"uppercase",letterSpacing:1}}>Five-Phase Loop · Live Diagram</div>
          <FivePhaseCanvas/>
        </div>

        <div style={{background:PAN,border:`1px solid ${BORDER}`,borderRadius:12,padding:18,marginBottom:24}}>
          <div style={{fontFamily:"monospace",fontSize:11,color:GOLD,marginBottom:14,textTransform:"uppercase",letterSpacing:1}}>The Five-Phase Loop · Three Domains</div>
          <div style={{overflowX:"auto"}}>
            <table style={{width:"100%",borderCollapse:"collapse",fontFamily:"monospace",fontSize:12}}>
              <thead><tr>{["Phase","Biological","AETHER Function","Tectonic"].map(h=>(
                <th key={h} style={{textAlign:"left",padding:"8px 10px",borderBottom:`1px solid ${BORDER}`,color:CYAN,fontWeight:600,fontSize:11,textTransform:"uppercase",letterSpacing:1}}>{h}</th>
              ))}</tr></thead>
              <tbody>{FIVE_PHASE.map((p,i)=>(
                <tr key={p.ph} style={{background:i%2===0?PAN2:"transparent"}}>
                  <td style={{padding:"7px 10px",color:p.col,fontWeight:700,fontFamily:"monospace"}}>{p.ph}</td>
                  <td style={{padding:"7px 10px",color:GREEN}}>{p.bio}</td>
                  <td style={{padding:"7px 10px",color:CYAN}}>{p.fn}</td>
                  <td style={{padding:"7px 10px",color:BLUE}}>{p.geo}</td>
                </tr>
              ))}</tbody>
            </table>
          </div>
        </div>

        <div style={{background:PAN,border:`1px solid ${BORDER}`,borderRadius:12,padding:18,marginBottom:24}}>
          <div style={{fontFamily:"monospace",fontSize:11,color:VIOLET,marginBottom:14,textTransform:"uppercase",letterSpacing:1}}>The Problem · Bone Marrow as a Black Box</div>
          <p style={{fontSize:13.5,color:TEXT,lineHeight:1.8,margin:"0 0 14px"}}>Bone marrow produces 200 billion blood cells per day. Yet for 99% of people — including the 4.5M Americans living with a blood disorder and the 16M undergoing chemotherapy globally — marrow health is entirely invisible until catastrophic failure occurs. There is no Oura Ring for your blood factory. AETHER builds it.</p>
          <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(200px,1fr))",gap:10}}>
            {[["Bone marrow biopsy","Invasive, painful, clinic-only"],["CBC","Snapshot, 24–72h turnaround"],["Clinical symptoms","Appear only at late stage"],["Hospitalization","Often the first real signal"]].map(([k,v])=>(
              <div key={k} style={{background:PAN2,border:`1px solid ${BORDER}`,borderRadius:8,padding:"10px 12px"}}>
                <div style={{fontFamily:"monospace",fontSize:12,color:ROSE,marginBottom:4}}>{k}</div>
                <div style={{fontSize:12,color:MUTED}}>{v}</div>
              </div>
            ))}
          </div>
        </div>

        <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(280px,1fr))",gap:16,marginBottom:24}}>
          <div style={{background:PAN,border:`1px solid ${BORDER}`,borderRadius:12,padding:18}}>
            <div style={{fontFamily:"monospace",fontSize:11,color:GREEN,marginBottom:12,textTransform:"uppercase",letterSpacing:1}}>Sensor Stack · Gap 1 — Closed</div>
            {SENSOR_STACK.map(s=>(
              <div key={s.k} style={{marginBottom:10}}>
                <div style={{fontFamily:"monospace",fontSize:12,color:CYAN,marginBottom:2}}>{s.k}</div>
                <div style={{fontSize:12,color:MUTED,lineHeight:1.5}}>{s.v}</div>
              </div>
            ))}
          </div>
          <div style={{background:PAN,border:`1px solid ${BORDER}`,borderRadius:12,padding:18}}>
            <div style={{fontFamily:"monospace",fontSize:11,color:GOLD,marginBottom:12,textTransform:"uppercase",letterSpacing:1}}>FQP-Edge-1 ASIC · Specifications</div>
            {FQP_SPECS.map(s=>(
              <div key={s.k} style={{display:"flex",justifyContent:"space-between",padding:"5px 0",borderBottom:`1px solid ${hexA(BORDER,0.5)}`}}>
                <span style={{fontFamily:"monospace",fontSize:11,color:MUTED}}>{s.k}</span>
                <span style={{fontFamily:"monospace",fontSize:11,color:GOLD}}>{s.v}</span>
              </div>
            ))}
          </div>
          <div style={{background:PAN,border:`1px solid ${BORDER}`,borderRadius:12,padding:18}}>
            <div style={{fontFamily:"monospace",fontSize:11,color:VIOLET,marginBottom:12,textTransform:"uppercase",letterSpacing:1}}>Biomaterial Housing · Phase 2</div>
            {BIOMATERIALS.map(b=>(
              <div key={b.mat} style={{marginBottom:10}}>
                <div style={{fontFamily:"monospace",fontSize:11.5,color:VIOLET,marginBottom:2}}>{b.mat}</div>
                <div style={{fontSize:11.5,color:MUTED,lineHeight:1.5}}>{b.prop}</div>
              </div>
            ))}
          </div>
        </div>

        <div style={{background:PAN,border:`1px solid ${BORDER}`,borderRadius:12,padding:18,marginBottom:24}}>
          <div style={{fontFamily:"monospace",fontSize:11,color:BLUE,marginBottom:14,textTransform:"uppercase",letterSpacing:1}}>Market Opportunity · $89B+ TAM</div>
          <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(240px,1fr))",gap:10}}>
            {MARKET.map(m=>(
              <div key={m.seg} style={{background:PAN2,border:`1px solid ${BORDER}`,borderRadius:8,padding:"10px 12px"}}>
                <div style={{fontFamily:"monospace",fontSize:22,color:GOLD,fontWeight:700}}>{m.sz}</div>
                <div style={{fontSize:13,color:TEXT,fontWeight:600,margin:"4px 0 2px"}}>{m.seg}</div>
                <div style={{fontSize:11,color:MUTED}}>{m.entry}</div>
              </div>
            ))}
          </div>
        </div>

        <div style={{background:PAN,border:`1px solid ${BORDER}`,borderRadius:12,padding:18,marginBottom:24}}>
          <div style={{fontFamily:"monospace",fontSize:11,color:CYAN,marginBottom:14,textTransform:"uppercase",letterSpacing:1}}>The Tectonic Extension · February 2026 Validation</div>
          <p style={{fontSize:13.5,color:TEXT,lineHeight:1.8,margin:"0 0 12px"}}>In February 2026, the AETHER team completed the framework's most surprising validation: Earth's tectonic system is a physical instantiation of the five-phase loop operating at geological timescales. This mapping generates three immediately testable scientific predictions: (1) Fibonacci-ratio periodicity in large earthquake recurrence intervals; (2) sparse-local feedback signatures in mid-ocean ridge spreading rates; (3) resonance coupling between mantle plume periodicity and solar Milankovitch cycles.</p>
          <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(200px,1fr))",gap:8}}>
            {TECTONIC.map(t=>(
              <div key={t.ph} style={{background:PAN2,border:`1px solid ${BORDER}`,borderRadius:8,padding:"8px 12px"}}>
                <div style={{fontFamily:"monospace",fontSize:12,color:CYAN,marginBottom:4}}>{t.ph}</div>
                <div style={{fontSize:11.5,color:MUTED,lineHeight:1.5}}>{t.geo}</div>
              </div>
            ))}
          </div>
        </div>

        <div style={{background:PAN,border:`1px solid ${BORDER}`,borderRadius:12,padding:18,marginBottom:24}}>
          <div style={{fontFamily:"monospace",fontSize:11,color:GOLD,marginBottom:12,textTransform:"uppercase",letterSpacing:1}}>FDA Pathway</div>
          <div style={{display:"flex",flexWrap:"wrap",gap:12}}>
            {[["Q3 2026","Wellness device launch — no diagnostic claims","consumer RBC/immune score",CYAN],["Q4 2026 – Q2 2027","IRB-approved clinical study (n=500)","validate vs gold-standard CBC",GREEN],["Q3 2027","FDA 510(k) De Novo submission","Class II hematology monitor",VIOLET],["2028","CE Mark · Japan PMDA · Health Canada","international clearance",GOLD]].map(([d,t,s,c])=>(
              <div key={d as string} style={{flex:"1 1 200px",background:PAN2,border:`1px solid ${BORDER}`,borderRadius:8,padding:"10px 12px"}}>
                <div style={{fontFamily:"monospace",fontSize:11,color:c as string,marginBottom:4}}>{d}</div>
                <div style={{fontSize:12.5,color:TEXT,marginBottom:2}}>{t}</div>
                <div style={{fontSize:11,color:MUTED}}>{s}</div>
              </div>
            ))}
          </div>
        </div>

        <div style={{display:"flex",flexWrap:"wrap",gap:14,paddingTop:20,borderTop:`1px solid ${BORDER}`,fontFamily:"monospace",fontSize:12}}>
          <Link href="/substrate-computing" style={{color:CYAN,textDecoration:"none"}}>→ Substrate Computing</Link>
          <Link href="/computational-mathematics" style={{color:VIOLET,textDecoration:"none"}}>→ Computational Mathematics</Link>
          <Link href="/q-aether-research" style={{color:GREEN,textDecoration:"none"}}>→ Q~AETHER Research</Link>
          <Link href="/petrification-transformation" style={{color:ROSE,textDecoration:"none"}}>→ Petrification Transformation</Link>
          <Link href="/graph-map" style={{color:MUTED,textDecoration:"none"}}>→ Knowledge Graph</Link>
        </div>
      </div>
    </div>
  );
}
