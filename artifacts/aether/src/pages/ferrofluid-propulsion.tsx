import { useEffect, useRef, useState } from "react";
import { Link } from "wouter";
const imgFerro = "/api/storage/public-objects/IMG_3934_1783108235908.jpeg";
const BG="#04060d",PAN="#0a0d1a",PAN2="#0d1020",BORDER="#182038",TEXT="#b8cce8",MUTED="#5a6e8c";
const GOLD="#ffb830",CYAN="#3fd8d0",VIOLET="#a87aff",GREEN="#50d49a",BLUE="#4ab0ff",ROSE="#f06090";
function hexA(h:string,a:number){
  const r=parseInt(h.slice(1,3),16),g=parseInt(h.slice(3,5),16),b=parseInt(h.slice(5,7),16);
  return `rgba(${r},${g},${b},${a})`;
}
function mulberry32(s:number){let x=s;return()=>{x|=0;x=x+0x6d2b79f5|0;let t=Math.imul(x^x>>>15,1|x);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296;};}

type Mode="rosensweig"|"bio"|"vehicle";

function FerroCanvas({mode}:{mode:Mode}){
  const cvRef=useRef<HTMLCanvasElement>(null);
  const fieldRef=useRef(0.55);
  const playRef=useRef(true);
  const dirRef=useRef(0);
  const readA=useRef<HTMLSpanElement>(null);
  const readB=useRef<HTMLSpanElement>(null);
  const readC=useRef<HTMLSpanElement>(null);
  const [field,setField]=useState(0.55);
  const [playing,setPlaying]=useState(true);
  const [dir,setDir]=useState(0);
  useEffect(()=>{fieldRef.current=field;},[field]);
  useEffect(()=>{playRef.current=playing;},[playing]);
  useEffect(()=>{dirRef.current=dir;},[dir]);

  useEffect(()=>{
    const cv=cvRef.current; if(!cv) return;
    const ctx=cv.getContext("2d"); if(!ctx) return;
    let raf=0,t=0,lastW=0;
    const reduced=window.matchMedia&&window.matchMedia("(prefers-reduced-motion:reduce)").matches;
    const rng=mulberry32(0xfe5270);
    const N=28;
    // per-spike phase offsets for natural variation
    const spikePhase=Array.from({length:N},()=>rng()*Math.PI*2);
    const spikeW=Array.from({length:N},()=>3.5+rng()*3);
    const H_c=0.32; // Rosensweig threshold

    // bio particles
    const particles=Array.from({length:22},()=>({
      x:rng()*0.15, y:0.3+rng()*0.4,
      vx:0.0015+rng()*0.001, vy:(rng()-0.5)*0.0005,
      r:rng()*2+2, at:false,
    }));

    const loop=()=>{
      const dpr=Math.min(2,window.devicePixelRatio||1);
      const W=cv.clientWidth||680,H=380;
      if(W!==lastW){cv.width=Math.round(W*dpr);cv.height=Math.round(H*dpr);lastW=W;}
      ctx.setTransform(dpr,0,0,dpr,0,0);
      if(playRef.current&&!reduced) t+=0.016;

      ctx.fillStyle=BG; ctx.fillRect(0,0,W,H);

      const F=fieldRef.current;

      if(mode==="rosensweig"){
        // ── Magnet body ──
        const magH=48,magW=96,magX=W/2-magW/2,magY=H-magH-12;
        const mgrd=ctx.createLinearGradient(magX,magY,magX+magW,magY+magH);
        mgrd.addColorStop(0,"#6b4a2a"); mgrd.addColorStop(0.5,"#a07850"); mgrd.addColorStop(1,"#6b4a2a");
        ctx.fillStyle=mgrd;
        ctx.beginPath(); ctx.roundRect(magX,magY,magW,magH,4); ctx.fill();
        ctx.strokeStyle=hexA(MUTED,0.4); ctx.lineWidth=1.5;
        ctx.beginPath(); ctx.roundRect(magX,magY,magW,magH,4); ctx.stroke();
        ctx.fillStyle=hexA(TEXT,0.5); ctx.font="bold 11px monospace";
        ctx.textAlign="center"; ctx.fillText("N",magX+magW*0.28,magY+magH*0.62);
        ctx.fillText("S",magX+magW*0.72,magY+magH*0.62);

        // fluid body
        const surfY=H*0.54;
        const flgrd=ctx.createLinearGradient(0,surfY,0,magY);
        flgrd.addColorStop(0,hexA(CYAN,0.05));
        flgrd.addColorStop(1,hexA(CYAN,0.18));
        ctx.fillStyle=flgrd;
        ctx.fillRect(0,surfY,W,magY-surfY);

        // field lines from magnet to spikes
        if(F>H_c){
          ctx.strokeStyle=hexA(BLUE,0.12); ctx.lineWidth=1;
          for(let k=0;k<7;k++){
            const fx=magX+magW*(0.15+k*0.12);
            const targetX=W*(0.12+k*0.115);
            ctx.beginPath();
            ctx.moveTo(fx,magY);
            ctx.bezierCurveTo(fx,magY-30,targetX,surfY+20,targetX,surfY);
            ctx.stroke();
          }
        }

        // Rosensweig spikes
        for(let i=0;i<N;i++){
          const sx=W*(i+0.5)/N;
          const above=F-H_c;
          const ripple=Math.sin(t*2.5+spikePhase[i])*4*(1-Math.min(1,above/0.3));
          const spikeH= above>0
            ? above*(90+30*Math.sin(t*1.2+spikePhase[i]))
            : 0;
          const h=Math.max(0,spikeH)+Math.max(0,ripple);
          const tipY=surfY-h;
          const w=spikeW[i];

          // spike body (dark metallic)
          const sg=ctx.createLinearGradient(sx-w,surfY,sx+w,surfY);
          sg.addColorStop(0,"#1a1a1a"); sg.addColorStop(0.4,"#3a3a3a");
          sg.addColorStop(0.6,"#555"); sg.addColorStop(1,"#1a1a1a");
          ctx.fillStyle=sg;
          ctx.beginPath();
          ctx.moveTo(sx-w,surfY);
          ctx.lineTo(sx,tipY-2);
          ctx.lineTo(sx+w,surfY);
          ctx.fill();

          // chrome highlight
          if(h>8){
            ctx.strokeStyle=hexA(TEXT,0.25); ctx.lineWidth=0.8;
            ctx.beginPath(); ctx.moveTo(sx-w*0.3,surfY-h*0.15); ctx.lineTo(sx,tipY); ctx.stroke();
          }
          // tip glow
          if(h>12){
            const tg=ctx.createRadialGradient(sx,tipY,0,sx,tipY,h*0.25);
            tg.addColorStop(0,hexA(CYAN,0.5)); tg.addColorStop(1,hexA(CYAN,0));
            ctx.fillStyle=tg;
            ctx.beginPath(); ctx.arc(sx,tipY,h*0.25,0,Math.PI*2); ctx.fill();
          }
        }

        // surface line
        ctx.strokeStyle=hexA(CYAN,0.3); ctx.lineWidth=1.5;
        ctx.beginPath(); ctx.moveTo(0,surfY); ctx.lineTo(W,surfY); ctx.stroke();

        // readouts
        const above=Math.max(0,F-H_c);
        const spH=(above*90).toFixed(0);
        const nActive=above>0?N:0;
        if(readA.current) readA.current.textContent=spH+" mm";
        if(readB.current) readB.current.textContent=nActive+" / "+N;
        if(readC.current) readC.current.textContent=above>0.4?"Saturated":above>0.1?"Growing":"Below threshold";

      } else if(mode==="bio"){
        // ── Bio navigation mode ──
        const vesY0=H*0.28,vesY1=H*0.72;
        // vessel walls
        const vwgrd=ctx.createLinearGradient(0,vesY0,0,vesY0+12);
        vwgrd.addColorStop(0,hexA(ROSE,0.5)); vwgrd.addColorStop(1,hexA(ROSE,0.15));
        ctx.fillStyle=vwgrd;
        ctx.fillRect(0,vesY0,W,12);
        ctx.fillStyle=vwgrd;
        ctx.fillRect(0,vesY1-12,W,12);

        // blood interior
        const bgrd=ctx.createLinearGradient(0,vesY0+12,0,vesY1-12);
        bgrd.addColorStop(0,hexA(ROSE,0.06));
        bgrd.addColorStop(0.5,hexA(ROSE,0.12));
        bgrd.addColorStop(1,hexA(ROSE,0.06));
        ctx.fillStyle=bgrd;
        ctx.fillRect(0,vesY0+12,W,vesY1-vesY0-24);

        // target site (right side)
        const tgtX=W*0.88,tgtY=(vesY0+vesY1)/2;
        const tg=ctx.createRadialGradient(tgtX,tgtY,0,tgtX,tgtY,28);
        tg.addColorStop(0,hexA(GREEN,0.7)); tg.addColorStop(1,hexA(GREEN,0));
        ctx.fillStyle=tg; ctx.beginPath(); ctx.arc(tgtX,tgtY,28,0,Math.PI*2); ctx.fill();
        ctx.fillStyle=hexA(TEXT,0.5); ctx.font="10px monospace"; ctx.textAlign="center";
        ctx.fillText("TARGET",tgtX,tgtY+42);

        // magnetic field direction arrow
        const D=dirRef.current;
        const arrX=W*0.5,arrY=vesY0-28;
        ctx.strokeStyle=hexA(GOLD,0.7); ctx.lineWidth=2;
        ctx.beginPath(); ctx.moveTo(arrX-24,arrY); ctx.lineTo(arrX+24,arrY); ctx.stroke();
        const arrowDir=D>=0?1:-1;
        ctx.fillStyle=hexA(GOLD,0.7);
        ctx.beginPath();
        ctx.moveTo(arrX+24*arrowDir,arrY-6);
        ctx.lineTo(arrX+30*arrowDir,arrY);
        ctx.lineTo(arrX+24*arrowDir,arrY+6);
        ctx.fill();
        ctx.font="10px monospace"; ctx.fillStyle=hexA(GOLD,0.7);
        ctx.fillText("B field",arrX,arrY-14);

        // update + draw particles
        for(const p of particles){
          if(!p.at){
            p.x+=p.vx*F*2.5;
            // magnetic steering toward vertical center + lateral guide
            const cy=(vesY0+vesY1)/2;
            const py=vesY0+p.y*(vesY1-vesY0);
            p.y+=(p.vy+(cy-py)*0.0002+D*F*0.0004);
            p.y=Math.max(0.05,Math.min(0.95,p.y));
            if(p.x>0.85) p.at=true;
          } else {
            if(Math.random()<0.003) { p.x=rng()*0.08; p.y=0.3+rng()*0.4; p.at=false; }
          }
          const px=p.x*W,py2=vesY0+p.y*(vesY1-vesY0);
          const pg=ctx.createRadialGradient(px,py2,0,px,py2,p.r*2.5);
          pg.addColorStop(0,p.at?hexA(GREEN,0.9):hexA(CYAN,0.85));
          pg.addColorStop(1,hexA(CYAN,0));
          ctx.fillStyle=pg; ctx.beginPath(); ctx.arc(px,py2,p.r*2.5,0,Math.PI*2); ctx.fill();
          ctx.fillStyle=p.at?GREEN:hexA(TEXT,0.7);
          ctx.beginPath(); ctx.arc(px,py2,p.r,0,Math.PI*2); ctx.fill();
        }

        const atCount=particles.filter(p=>p.at).length;
        if(readA.current) readA.current.textContent=particles.length+" particles";
        if(readB.current) readB.current.textContent=atCount+" at target";
        if(readC.current) readC.current.textContent=((atCount/particles.length)*100).toFixed(0)+"% delivery";

      } else {
        // ── Vehicle levitation mode ──
        const trackY=H*0.78;
        const levH=40+F*80;
        const carY=trackY-levH;
        const carW=W*0.55,carH=48,carX=(W-carW)/2;

        // ferrofluid track surface with Rosensweig spikes
        const surfY=trackY;
        // track body
        const tgrd=ctx.createLinearGradient(0,surfY,0,H);
        tgrd.addColorStop(0,hexA(CYAN,0.18)); tgrd.addColorStop(1,hexA(CYAN,0.04));
        ctx.fillStyle=tgrd; ctx.fillRect(0,surfY,W,H-surfY);
        ctx.strokeStyle=hexA(CYAN,0.35); ctx.lineWidth=2;
        ctx.beginPath(); ctx.moveTo(0,surfY); ctx.lineTo(W,surfY); ctx.stroke();

        // spikes from track pointing up
        const nSpk=20;
        for(let i=0;i<nSpk;i++){
          const sx=W*(i+0.5)/nSpk;
          const sh=(F*48)*Math.abs(Math.sin(t*1.5+spikePhase[i%N]));
          ctx.fillStyle=hexA(CYAN,0.45);
          ctx.beginPath();
          ctx.moveTo(sx-5,surfY);
          ctx.lineTo(sx,surfY-sh);
          ctx.lineTo(sx+5,surfY);
          ctx.fill();
        }

        // levitation gap field lines
        for(let i=0;i<8;i++){
          const lx=carX+carW*(i+0.5)/8;
          ctx.strokeStyle=hexA(BLUE,0.18+F*0.12); ctx.lineWidth=1;
          ctx.beginPath(); ctx.moveTo(lx,carY+carH); ctx.lineTo(lx,surfY); ctx.stroke();
        }

        // gap label
        const gapH=surfY-(carY+carH);
        ctx.fillStyle=hexA(GOLD,0.55); ctx.font="11px monospace"; ctx.textAlign="center";
        ctx.fillText("gap: "+(gapH).toFixed(0)+" px \u2248 "+(levH*0.8).toFixed(0)+" mm",W/2,carY+carH+gapH/2+4);

        // car body
        const cgrd=ctx.createLinearGradient(carX,carY,carX,carY+carH);
        cgrd.addColorStop(0,hexA(MUTED,0.9)); cgrd.addColorStop(1,hexA(BORDER,0.95));
        ctx.fillStyle=cgrd;
        ctx.beginPath(); ctx.roundRect(carX,carY,carW,carH,8); ctx.fill();
        ctx.strokeStyle=hexA(TEXT,0.25); ctx.lineWidth=1.5;
        ctx.beginPath(); ctx.roundRect(carX,carY,carW,carH,8); ctx.stroke();
        // car cabin
        ctx.fillStyle=hexA(BLUE,0.18);
        ctx.beginPath(); ctx.roundRect(carX+carW*0.22,carY-20,carW*0.56,22,6); ctx.fill();
        ctx.strokeStyle=hexA(BLUE,0.4); ctx.lineWidth=1;
        ctx.beginPath(); ctx.roundRect(carX+carW*0.22,carY-20,carW*0.56,22,6); ctx.stroke();
        // magnetic undercarriage glow
        const ugrd=ctx.createLinearGradient(carX,carY+carH-4,carX,carY+carH+16);
        ugrd.addColorStop(0,hexA(CYAN,F*0.6)); ugrd.addColorStop(1,hexA(CYAN,0));
        ctx.fillStyle=ugrd; ctx.fillRect(carX-8,carY+carH-4,carW+16,20);

        if(readA.current) readA.current.textContent=(levH*0.8).toFixed(0)+" mm";
        if(readB.current) readB.current.textContent=(F*9.2).toFixed(1)+" kN";
        if(readC.current) readC.current.textContent=F>0.7?"Full levitation":F>0.4?"Partial":"Grounded";
      }

      raf=requestAnimationFrame(loop);
    };
    raf=requestAnimationFrame(loop);
    return ()=>cancelAnimationFrame(raf);
  },[mode]);

  const labelA=mode==="rosensweig"?"Spike height":mode==="bio"?"Particles":"Levitation gap";
  const labelB=mode==="rosensweig"?"Active spikes":mode==="bio"?"At target":"Lift force";
  const labelC=mode==="rosensweig"?"State":mode==="bio"?"Delivery %":"Status";
  const fieldLabel=mode==="bio"?"Gradient strength (field)":"Field strength B";

  return (
    <div>
      <canvas ref={cvRef} style={{width:"100%",height:380,borderRadius:8,display:"block"}} />
      <div style={{marginTop:12,display:"flex",gap:16,flexWrap:"wrap",alignItems:"flex-end"}}>
        <label style={{flex:1,minWidth:180,color:TEXT,fontSize:12,fontFamily:"monospace"}}>
          {fieldLabel}
          <input type="range" min={0} max={1} step={0.01} value={field}
            onChange={e=>{const v=+e.target.value;setField(v);fieldRef.current=v;}}
            style={{display:"block",width:"100%",marginTop:4}} />
        </label>
        {mode==="bio"&&(
          <label style={{flex:1,minWidth:180,color:TEXT,fontSize:12,fontFamily:"monospace"}}>
            Steer direction ({dir>=0?"right ":"left "}{Math.abs(dir*90).toFixed(0)}\u00b0)
            <input type="range" min={-1} max={1} step={0.01} value={dir}
              onChange={e=>{const v=+e.target.value;setDir(v);dirRef.current=v;}}
              style={{display:"block",width:"100%",marginTop:4}} />
          </label>
        )}
        <button onClick={()=>setPlaying(p=>!p)}
          style={{background:PAN2,border:"1px solid "+BORDER,color:TEXT,
            borderRadius:6,padding:"6px 16px",cursor:"pointer",fontFamily:"monospace",fontSize:12}}>
          {playing?"Pause":"Play"}
        </button>
      </div>
      <div style={{display:"flex",gap:20,flexWrap:"wrap",marginTop:10,fontFamily:"monospace",fontSize:12}}>
        <span style={{color:MUTED}}>{labelA} <span ref={readA} style={{color:CYAN}}>—</span></span>
        <span style={{color:MUTED}}>{labelB} <span ref={readB} style={{color:GOLD}}>—</span></span>
        <span style={{color:MUTED}}>{labelC} <span ref={readC} style={{color:VIOLET}}>—</span></span>
      </div>
    </div>
  );
}

export default function FerrofluidPropulsionPage(){
  const [mode,setMode]=useState<Mode>("rosensweig");
  const sec:React.CSSProperties={background:PAN,border:"1px solid "+BORDER,borderRadius:12,padding:20,marginBottom:22};
  const secLabel:React.CSSProperties={fontFamily:"monospace",fontSize:10,letterSpacing:2,color:MUTED,textTransform:"uppercase",marginBottom:12};
  const card:React.CSSProperties={background:PAN2,border:"1px solid "+BORDER,borderRadius:8,padding:14};

  const modes:{id:Mode,label:string,col:string}[]=[
    {id:"rosensweig",label:"Rosensweig Instability",col:CYAN},
    {id:"bio",label:"Bio Navigation",col:GREEN},
    {id:"vehicle",label:"Vehicle Levitation",col:GOLD},
  ];

  const eqs=[
    {letter:"A",label:"Rosensweig Threshold",col:CYAN,
     eq:"\u03c7H\u00b2 / (2\u03bc\u2080) > 2\u03b3/\u03bb",
     desc:"Spikes form when magnetic pressure exceeds surface tension restoring force. \u03c7 = susceptibility, H = field, \u03b3 = surface tension, \u03bb = spike wavelength."},
    {letter:"B",label:"Magnetic Pressure",col:GOLD,
     eq:"P\u2098\u2090\u1d4d = \u03bc\u2080 \u03c7 H\u00b2 / 2",
     desc:"Magnetic pressure builds beneath each forming spike tip, creating a self-reinforcing nucleation event identical to crystallization in the AETHER model."},
    {letter:"C",label:"Magnetophoretic Drift (Bio)",col:GREEN,
     eq:"v\u2090 = 2r\u00b2 \u0394\u03c7 \u2207B\u00b2 / (9\u03b7)",
     desc:"Nanoparticle drift velocity toward high-field regions. Radius r and susceptibility contrast \u0394\u03c7 amplify speed; viscosity \u03b7 limits it. Enables targeted drug delivery."},
    {letter:"D",label:"Levitation Gap",col:VIOLET,
     eq:"h = k \u00b7 B\u00b2 / (\u03c1g)",
     desc:"Ferrofluid levitation height scales with B\u00b2. Density \u03c1 and gravity g resist. Active field control dynamically adjusts suspension stiffness for vehicle isolation."},
    {letter:"E",label:"Coherence Analogy",col:BLUE,
     eq:"C(x,t) = A(x) e^{i(\u03c6 \u2212 \u03c9t)}",
     desc:"Spike formation is a coherence crystallization event. Below threshold: disordered fluid (\u03a6 random). Above threshold: ordered spike lattice (\u03a6 phase-locked) — exactly the AETHER nucleation model."},
    {letter:"F",label:"Nucleation Propulsion Thrust",col:ROSE,
     eq:"F\u209c = \u2211\u1d62 \u0394P\u1d62 \u00b7 A\u1d62 \u00b7 \u0109\u207f",
     desc:"Controlled spike collapse across a ferrofluid surface element generates net momentum. Directional bias in field gradient breaks symmetry and produces coherent thrust vector."},
  ];

  const domains=[
    {
      label:"Biological",col:GREEN,icon:"🧬",
      headline:"Magnetic Nanoparticle Drug Delivery",
      points:[
        "10\u201320 nm iron oxide nanoparticles coated with biocompatible polymer",
        "External gradient field steers particles through vasculature to tumor site",
        "Drug payload released by AC hyperthermia pulse at target",
        "BBB crossing enabled by ferrofluid-coated liposomes at 12 nm",
        "Coherence analogy: synaptic firing (entropy surge) \u2192 directional drug packet",
      ],
    },
    {
      label:"Magnetic Technology",col:CYAN,icon:"\u26a1",
      headline:"Ferrofluid Bearings, Seals & Cooling",
      points:[
        "Ferrofluid shaft seals: liquid ring held by permanent magnet, zero wear, 10\u207b\u00b9\u00b2 mbar vacuum",
        "Magnetic bearings: ferrofluid cushion replaces ball bearings \u2192 frictionless rotation",
        "Loudspeaker cooling: ferrofluid fills voice-coil gap, conducts heat 50\u00d7 better than air",
        "Adaptive dampers: variable-field ferrofluid changes viscosity 1000\u00d7 in < 1 ms",
        "Data storage read heads use ferrofluid gap seals in 100% of hard drives",
      ],
    },
    {
      label:"Vehicles",col:GOLD,icon:"\ud83d\ude97",
      headline:"Active Magnetic Suspension & Propulsion",
      points:[
        "Ferrofluid suspension: field-variable stiffness responds to road in < 2 ms",
        "Maglev track integration: ferrofluid fills gap between vehicle and rail \u2192 zero contact",
        "Braking: field-induced viscosity increase converts kinetic energy to heat",
        "Steering: differential field gradient across front axle ferrofluid pockets",
        "Full drive: peristaltic ferrofluid pump (Slinky-mode ring coils) \u2192 no moving parts",
      ],
    },
  ];

  const vision=[
    {step:"01",label:"Nucleation Seed",col:CYAN,
     txt:"A controlled magnetic field pulse above H_c nucleates the first Rosensweig spike — a coherent structure emerging from disorder. This is the seeding event."},
    {step:"02",label:"Spike Collapse Thrust",col:GOLD,
     txt:"Rapid field switching collapses the spike asymmetrically. The collapse momentum is transferred to the fluid body as a directional jet — nucleation propulsion."},
    {step:"03",label:"Peristaltic Ring Array",col:VIOLET,
     txt:"Slinky-mode coil rings (as in the Slinky Propulsion engine) create a travelling ferrofluid wave — analogous to biological peristalsis, but magnetically driven."},
    {step:"04",label:"Coherence Locking",col:GREEN,
     txt:"Phase-locked spike arrays across the vehicle undercarriage or bio-vessel surface create a coherent propulsion field C(x,t) — sustained by constructive interference."},
    {step:"05",label:"Scale-Free Architecture",col:BLUE,
     txt:"Same physics at 10 nm (drug carrier), 10 cm (bearing seal), 10 m (vehicle track), 100 m (Slinky ring array). The AETHER coherence engine is scale-invariant."},
  ];

  return (
    <div style={{minHeight:"100vh",background:BG,color:TEXT,padding:"40px 20px 80px",fontFamily:"'Inter',system-ui,sans-serif"}}>
      <div style={{maxWidth:1040,margin:"0 auto"}}>

        <p style={{fontFamily:"monospace",fontSize:11,letterSpacing:2,color:MUTED,textTransform:"uppercase",marginBottom:8}}>
          AETHER · Nucleation Propulsion Engine
        </p>
        <h1 style={{fontSize:"clamp(22px,4vw,34px)",fontWeight:700,
          background:"linear-gradient(90deg,"+CYAN+","+GOLD+","+VIOLET+")",
          WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent",marginBottom:8}}>
          Ferrofluid Nucleation Propulsion
        </h1>
        <p style={{color:MUTED,fontFamily:"monospace",fontSize:13,marginBottom:32}}>
          Rosensweig instability as engine · Bio nanoparticle navigation · Magnetic vehicle levitation · Coherent scale-free propulsion
        </p>

        {/* Ferrofluid photo */}
        <div style={sec}>
          <p style={secLabel}>01 · Rosensweig Instability · The Source Image</p>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:16,alignItems:"start"}}>
            <img src={imgFerro} alt="Ferrofluid Rosensweig instability spikes above a neodymium magnet"
              style={{width:"100%",borderRadius:8,display:"block",objectFit:"cover",maxHeight:340}} />
            <div style={{display:"flex",flexDirection:"column",gap:10}}>
              {[
                {label:"Fluid",val:"Magnetite Fe\u2083O\u2084 nanoparticles in carrier oil",col:CYAN},
                {label:"Spikes",val:"Rosensweig instability — ordered spike lattice",col:GOLD},
                {label:"Driver",val:"Neodymium permanent magnet below",col:VIOLET},
                {label:"Physics",val:"\u03c7H\u00b2/(2\u03bc\u2080) > 2\u03b3/\u03bb triggers nucleation",col:GREEN},
                {label:"Pattern",val:"Self-organized hexagonal lattice above threshold",col:BLUE},
                {label:"AETHER",val:"Phase-locked coherence field crystallizing from noise",col:ROSE},
              ].map(a=>(
                <div key={a.label} style={{...card,padding:10,display:"flex",gap:10,alignItems:"flex-start"}}>
                  <span style={{color:a.col,fontFamily:"monospace",fontSize:11,fontWeight:700,minWidth:70,paddingTop:1}}>{a.label}</span>
                  <span style={{color:TEXT,fontSize:12,lineHeight:1.5}}>{a.val}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Live simulation */}
        <div style={sec}>
          <p style={secLabel}>02 · Live Simulation · Three Modes</p>
          <div style={{display:"flex",gap:8,marginBottom:16,flexWrap:"wrap"}}>
            {modes.map(m=>(
              <button key={m.id} onClick={()=>setMode(m.id)}
                style={{background:mode===m.id?hexA(m.col,0.15):PAN2,
                  border:"1px solid "+(mode===m.id?m.col:BORDER),
                  color:mode===m.id?m.col:MUTED,borderRadius:6,
                  padding:"6px 16px",cursor:"pointer",fontFamily:"monospace",fontSize:12}}>
                {m.label}
              </button>
            ))}
          </div>
          <FerroCanvas mode={mode} key={mode} />
          <p style={{color:MUTED,fontSize:12,marginTop:10,fontFamily:"monospace",lineHeight:1.6}}>
            {mode==="rosensweig"&&"Raise field above 0.32 threshold to trigger spike nucleation. Spikes grow with field strength, glow at tips marks coherence lock."}
            {mode==="bio"&&"Particles navigate a blood vessel toward the target site. Field strength sets drift velocity; steer slider applies lateral gradient for vessel navigation."}
            {mode==="vehicle"&&"Ferrofluid fills the gap between car undercarriage and track. Field strength controls levitation height and lift force. Spikes on track surface = active field contact."}
          </p>
        </div>

        {/* Math framework */}
        <div style={sec}>
          <p style={secLabel}>03 · Mathematical Framework · Ferrofluid Physics + AETHER Synthesis</p>
          <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(290px,1fr))",gap:12}}>
            {eqs.map(c=>(
              <div key={c.letter} style={{...card,borderColor:hexA(c.col,0.3)}}>
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

        {/* Three application domains */}
        <div style={sec}>
          <p style={secLabel}>04 · Application Domains · Bio · Technology · Vehicles</p>
          <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(295px,1fr))",gap:14}}>
            {domains.map(d=>(
              <div key={d.label} style={{...card,borderColor:hexA(d.col,0.35)}}>
                <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:10}}>
                  <span style={{fontSize:20}}>{d.icon}</span>
                  <div>
                    <p style={{color:d.col,fontFamily:"monospace",fontSize:11,fontWeight:700,letterSpacing:1,textTransform:"uppercase",marginBottom:2}}>{d.label}</p>
                    <p style={{color:TEXT,fontSize:13,fontWeight:600}}>{d.headline}</p>
                  </div>
                </div>
                <ul style={{color:MUTED,fontSize:12,lineHeight:1.7,paddingLeft:16,margin:0}}>
                  {d.points.map((pt,i)=><li key={i}>{pt}</li>)}
                </ul>
              </div>
            ))}
          </div>
        </div>

        {/* Coherent engine vision */}
        <div style={sec}>
          <p style={secLabel}>05 · Coherent Engine Vision · Nucleation as Universal Propulsion</p>
          <p style={{color:TEXT,fontSize:14,lineHeight:1.7,marginBottom:18}}>
            The Rosensweig spike is not merely a curiosity — it is a nucleation event identical in structure to crystallization, synaptic burst, and plasma wave formation. At the moment the field crosses H_c, the disordered fluid surface phase-transitions into a coherent, ordered lattice of spikes. This is the AETHER crystallization model made liquid. The same engine logic applies at every scale: below threshold, entropy; above threshold, ordered structure; collapse of that structure creates directional thrust.
          </p>
          <div style={{display:"flex",flexDirection:"column",gap:10}}>
            {vision.map(v=>(
              <div key={v.step} style={{...card,display:"flex",gap:16,alignItems:"flex-start",borderColor:hexA(v.col,0.25)}}>
                <span style={{color:v.col,fontFamily:"monospace",fontSize:16,fontWeight:700,minWidth:28}}>{v.step}</span>
                <div>
                  <p style={{color:v.col,fontFamily:"monospace",fontSize:12,fontWeight:700,marginBottom:4}}>{v.label}</p>
                  <p style={{color:TEXT,fontSize:13,lineHeight:1.6}}>{v.txt}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* AETHER synthesis */}
        <div style={sec}>
          <p style={secLabel}>06 · Full AETHER Picture · From Ferrofluid to Consciousness</p>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12,marginBottom:14}}>
            {[
              {from:"Synaptic Entropy",to:"Neural spike \u2192 synapse lock",col:VIOLET,href:"/synaptic-entropy"},
              {from:"Ferrofluid",to:"Field spike \u2192 coherent lattice",col:CYAN,href:"/ferrofluid-propulsion"},
              {from:"Slinky Propulsion",to:"Plasma wave \u2192 space-time curvature",col:GOLD,href:"/slinky-propulsion"},
              {from:"Compact Fusion",to:"B\u207f magnetic gain \u2192 2\u02e3 power",col:GREEN,href:"/compact-fusion"},
            ].map(r=>(
              <Link key={r.from} href={r.href} style={{textDecoration:"none"}}>
                <div style={{...card,cursor:"pointer",borderColor:hexA(r.col,0.3)}}>
                  <p style={{color:r.col,fontFamily:"monospace",fontSize:11,fontWeight:700,marginBottom:4}}>{r.from}</p>
                  <p style={{color:MUTED,fontSize:12}}>{r.to}</p>
                </div>
              </Link>
            ))}
          </div>
          <p style={{color:TEXT,fontSize:14,lineHeight:1.7}}>
            Every AETHER engine — neural, ferrofluid, plasma, fusion — follows the same underlying logic: a coherence field C(x,t) that exists below a threshold in disordered form, then crosses a nucleation point and crystallizes into a self-organized, phase-locked structure that can do work. The difference between a ferrofluid spike and a conscious thought is only the substrate. The geometry of the transition is identical.
          </p>
        </div>

        <div style={{marginTop:36,paddingTop:20,borderTop:"1px solid "+BORDER,
          fontFamily:"monospace",fontSize:12,color:MUTED,display:"flex",gap:24,flexWrap:"wrap"}}>
          <Link href="/synaptic-entropy" style={{color:CYAN,textDecoration:"none"}}>\u2192 Synaptic Entropy Engine</Link>
          <Link href="/slinky-propulsion" style={{color:CYAN,textDecoration:"none"}}>\u2192 Slinky Propulsion</Link>
          <Link href="/compact-fusion" style={{color:CYAN,textDecoration:"none"}}>\u2192 Compact Fusion</Link>
          <Link href="/biomagnetism" style={{color:CYAN,textDecoration:"none"}}>\u2192 Biomagnetism</Link>
          <Link href="/graph-map" style={{color:MUTED,textDecoration:"none"}}>\u2192 Knowledge Graph</Link>
        </div>
      </div>
    </div>
  );
}
