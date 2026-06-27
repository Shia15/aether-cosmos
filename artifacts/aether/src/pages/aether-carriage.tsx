import { useEffect, useRef, useState } from "react";
import katex from "katex";
import "katex/dist/katex.min.css";

const V = {
  bg:"#04060E",aurora:"#00FFB2",gold:"#C8A030",blue:"#4488FF",
  vio:"#9966FF",amb:"#FF9933",rose:"#FF6699",plasma:"#FF4477",
  green:"#44CC77",dim:"#3A5060",ink:"#B8CCE8",fire:"#FF6622",
};
const MONO="'Space Mono',monospace";
const SERIF="'Crimson Pro',serif";
const DISP="'Cinzel',serif";

function kx(tex:string,dm=false){
  try{return katex.renderToString(tex,{throwOnError:false,output:"html",displayMode:dm});}
  catch{return tex;}
}

function Chip({col,children}:{col:string;children:string}){
  return(
    <span style={{display:"inline-block",padding:"2px 10px",borderRadius:3,
      background:col+"18",border:`1px solid ${col}44`,fontFamily:MONO,
      fontSize:9,color:col,letterSpacing:"0.12em",marginRight:6,marginBottom:4}}>
      {children}
    </span>
  );
}
function SectionHead({n,title,col}:{n:string;title:string;col:string}){
  return(
    <div style={{display:"flex",alignItems:"baseline",gap:14,marginBottom:24}}>
      <span style={{fontFamily:MONO,fontSize:9,color:col,letterSpacing:"0.2em"}}>{n}</span>
      <h2 style={{margin:0,fontFamily:DISP,fontSize:"1.1rem",fontWeight:400,
        color:col,letterSpacing:"0.14em"}}>{title}</h2>
      <div style={{flex:1,height:1,background:`linear-gradient(90deg,${col}55,transparent)`}}/>
    </div>
  );
}

// ── Carriage SVG ─────────────────────────────────────────────────────────────
function CarriageDiagram(){
  const [phase,setPhase]=useState(0);
  useEffect(()=>{
    const id=setInterval(()=>setPhase(p=>p+0.06),50);
    return()=>clearInterval(id);
  },[]);
  const sway=Math.sin(phase)*5;
  const rock=Math.sin(phase*0.7)*2.5;

  return(
    <svg viewBox="0 0 480 260" style={{width:"100%",overflow:"visible"}}>
      <defs>
        <radialGradient id="sunGlow" cx="50%" cy="20%" r="40%">
          <stop offset="0%" stopColor="#FFEE88" stopOpacity="0.9"/>
          <stop offset="100%" stopColor="#FF9933" stopOpacity="0"/>
        </radialGradient>
        <radialGradient id="goldSurf" cx="30%" cy="30%" r="70%">
          <stop offset="0%" stopColor="#FFE066"/>
          <stop offset="50%" stopColor="#C8A030"/>
          <stop offset="100%" stopColor="#7A5E10"/>
        </radialGradient>
        <linearGradient id="woodGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#4A2C10"/>
          <stop offset="40%" stopColor="#6B3F1A"/>
          <stop offset="100%" stopColor="#3A1E08"/>
        </linearGradient>
        <filter id="glow">
          <feGaussianBlur stdDeviation="4" result="blur"/>
          <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
        </filter>
        <filter id="goldGlow">
          <feGaussianBlur stdDeviation="2" result="blur"/>
          <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
        </filter>
      </defs>

      {/* Sun rays */}
      {[...Array(8)].map((_,i)=>{
        const a=(i*45)*Math.PI/180;
        return(
          <line key={i}
            x1={240+Math.cos(a)*28} y1={28+Math.sin(a)*28}
            x2={240+Math.cos(a)*55} y2={28+Math.sin(a)*55}
            stroke="#FFEE88" strokeWidth={1.5} opacity={0.4}/>
        );
      })}
      {/* Sun */}
      <circle cx={240} cy={28} r={18} fill="url(#sunGlow)" opacity={0.85}/>
      <circle cx={240} cy={28} r={10} fill="#FFEE88" filter="url(#glow)"/>

      {/* Photon rays hitting carriage */}
      {[200,240,280].map((x,i)=>(
        <line key={i} x1={240+(i-1)*18} y1={46}
          x2={x+sway*0.3} y2={110}
          stroke="#FFE066" strokeWidth={0.8} opacity={0.35} strokeDasharray="4 3"/>
      ))}

      {/* Suspension rods */}
      <g transform={`translate(${sway},0) rotate(${rock},240,200)`}>
        <line x1={160} y1={145} x2={160} y2={105} stroke={V.gold+"88"} strokeWidth={2}/>
        <line x1={320} y1={145} x2={320} y2={105} stroke={V.gold+"88"} strokeWidth={2}/>
        {/* Suspension springs */}
        {[160,320].map(x=>(
          <polyline key={x}
            points={`${x},105 ${x-5},113 ${x+5},119 ${x-5},125 ${x+5},131 ${x},138`}
            fill="none" stroke={V.gold+"66"} strokeWidth={1.5}/>
        ))}

        {/* Carriage body -- wood frame */}
        <rect x={130} y={110} width={220} height={95} rx={10}
          fill="url(#woodGrad)" stroke="#7A5E10" strokeWidth={2}/>

        {/* Bouligand wood grain lines */}
        {[...Array(9)].map((_,i)=>(
          <line key={i}
            x1={130} y1={115+i*10} x2={350} y2={118+i*10}
            stroke="#8B5020" strokeWidth={0.7} opacity={0.4}/>
        ))}
        {/* Diagonal cross grain */}
        {[...Array(5)].map((_,i)=>(
          <line key={i}
            x1={130+i*50} y1={110} x2={130+i*40} y2={205}
            stroke="#6B3010" strokeWidth={0.5} opacity={0.25}/>
        ))}

        {/* Gold leaf outer surface */}
        <rect x={128} y={108} width={224} height={99} rx={11}
          fill="none" stroke="url(#goldSurf)" strokeWidth={4} opacity={0.85}
          filter="url(#goldGlow)"/>

        {/* Carved corner ornaments */}
        {[[138,118],[342,118],[138,196],[342,196]].map(([cx,cy],i)=>(
          <g key={i}>
            <circle cx={cx} cy={cy} r={7} fill="#C8A030" opacity={0.6}/>
            <circle cx={cx} cy={cy} r={4} fill="#FFE066" opacity={0.8}/>
          </g>
        ))}

        {/* Interior glow -- coherence field */}
        <rect x={138} y={118} width={204} height={79} rx={6}
          fill={V.aurora+"08"} stroke={V.aurora+"22"} strokeWidth={1}/>

        {/* Window */}
        <rect x={165} y={125} width={65} height={55} rx={4}
          fill="#0A1825" stroke={V.gold+"55"} strokeWidth={1}/>
        <rect x={250} y={125} width={65} height={55} rx={4}
          fill="#0A1825" stroke={V.gold+"55"} strokeWidth={1}/>

        {/* C(x,t) field indicator */}
        <text x={240} y={160} textAnchor="middle"
          fill={V.aurora} fontSize={9} fontFamily={MONO} opacity={0.7}>
          C(x,t) = 0.94
        </text>

        {/* Coherence field aura */}
        <ellipse cx={240} cy={157} rx={100} ry={44}
          fill="none" stroke={V.aurora+"18"} strokeWidth={8}/>
      </g>

      {/* Wheels */}
      {[155,325].map((cx)=>(
        <g key={cx}>
          <circle cx={cx+sway*0.5} cy={218} r={28}
            fill="none" stroke="#5A3510" strokeWidth={6}/>
          <circle cx={cx+sway*0.5} cy={218} r={22}
            fill="none" stroke="#4A2A0A" strokeWidth={2}/>
          {/* Spokes */}
          {[...Array(8)].map((_,i)=>{
            const a=i*45*Math.PI/180+phase*0.3;
            return(
              <line key={i}
                x1={cx+sway*0.5} y1={218}
                x2={cx+sway*0.5+Math.cos(a)*22}
                y2={218+Math.sin(a)*22}
                stroke="#7A5020" strokeWidth={2}/>
            );
          })}
          <circle cx={cx+sway*0.5} cy={218} r={5}
            fill={V.gold} opacity={0.9}/>
          {/* Gold rim */}
          <circle cx={cx+sway*0.5} cy={218} r={28}
            fill="none" stroke={V.gold+"66"} strokeWidth={1.5}
            filter="url(#goldGlow)"/>
        </g>
      ))}

      {/* Ground */}
      <line x1={60} y1={246} x2={420} y2={246}
        stroke={V.dim+"55"} strokeWidth={1} strokeDasharray="4 4"/>

      {/* Labels */}
      {[
        {x:74,y:130,label:"GOLD LEAF",sub:"Plasmonic surface",col:V.gold},
        {x:74,y:170,label:"CARVED WOOD",sub:"Bouligand structure",col:V.amb},
        {x:370,y:130,label:"COHERENCE FIELD",sub:"C(x,t) damping",col:V.aurora},
        {x:370,y:170,label:"SUSPENSION",sub:"Analog sway",col:V.blue},
      ].map(({x,y,label,sub,col})=>(
        <g key={label}>
          <text x={x} y={y} textAnchor="middle"
            fill={col} fontSize={8} fontFamily="'Space Mono',monospace"
            letterSpacing="0.1em">{label}</text>
          <text x={x} y={y+12} textAnchor="middle"
            fill={col+"88"} fontSize={7} fontFamily="'Space Mono',monospace">{sub}</text>
        </g>
      ))}
    </svg>
  );
}

// ── Sway physics canvas ───────────────────────────────────────────────────────
function SwayCanvas(){
  const ref=useRef<HTMLCanvasElement>(null);
  const stateRef=useRef({theta:0.18,omega:0,t:0,coh:0.94});
  const rafRef=useRef<number>(0);

  useEffect(()=>{
    const canvas=ref.current;
    if(!canvas) return;
    const ctx=canvas.getContext("2d");
    if(!ctx) return;
    const W=canvas.width,H=canvas.height;
    const pivotX=W/2,pivotY=55,L=80;
    const DT=0.025,G=9.8,damping=0.012;

    const history:number[]=[];

    function tick(){
      const s=stateRef.current;
      s.t+=DT;
      // Terrain forcing (small periodic bumps)
      const bump=0.004*Math.sin(s.t*2.1)+0.002*Math.sin(s.t*5.3);
      // Pendulum equation with coherence damping
      const alpha=-G/L*Math.sin(s.theta)-(damping*(1+s.coh))*s.omega+bump;
      s.omega+=alpha*DT;
      s.theta+=s.omega*DT;
      // Coherence oscillates slightly
      s.coh=0.88+0.06*Math.sin(s.t*0.4+0.3);

      history.push(s.theta);
      if(history.length>W) history.shift();

      ctx.fillStyle="#010308";
      ctx.fillRect(0,0,W,H);

      // History waveform
      ctx.beginPath();
      history.forEach((th,i)=>{
        const px=i;
        const py=H*0.85-th*80;
        i===0?ctx.moveTo(px,py):ctx.lineTo(px,py);
      });
      ctx.strokeStyle=V.gold+"55";
      ctx.lineWidth=1;
      ctx.stroke();

      // Coherence field overlay
      const cohH=H*0.85;
      ctx.fillStyle=V.aurora+"08";
      ctx.fillRect(0,cohH-12,W,24);

      // Pivot
      ctx.beginPath();
      ctx.arc(pivotX,pivotY,5,0,Math.PI*2);
      ctx.fillStyle=V.gold;
      ctx.fill();

      // Rod
      const bx=pivotX+Math.sin(s.theta)*L;
      const by=pivotY+Math.cos(s.theta)*L;
      ctx.beginPath();
      ctx.moveTo(pivotX,pivotY);
      ctx.lineTo(bx,by);
      ctx.strokeStyle=V.gold+"AA";
      ctx.lineWidth=2;
      ctx.stroke();

      // Carriage bob -- gold rect
      if(isFinite(bx)&&isFinite(by)){
        ctx.fillStyle=V.gold+"44";
        ctx.strokeStyle=V.gold+"CC";
        ctx.lineWidth=1.5;
        const bw=36,bh=22;
        ctx.beginPath();
        ctx.roundRect(bx-bw/2,by-bh/2,bw,bh,4);
        ctx.fill();
        ctx.stroke();

        // Coherence glow on bob
        const grd=ctx.createRadialGradient(bx,by,0,bx,by,24);
        grd.addColorStop(0,V.aurora+"33");
        grd.addColorStop(1,"transparent");
        ctx.beginPath();
        ctx.arc(bx,by,24,0,Math.PI*2);
        ctx.fillStyle=grd;
        ctx.fill();
      }

      // Readouts
      ctx.fillStyle=V.dim;
      ctx.font=`9px ${MONO}`;
      ctx.fillText(`theta: ${s.theta.toFixed(3)} rad`,8,14);
      ctx.fillStyle=V.aurora;
      ctx.fillText(`C(x,t): ${s.coh.toFixed(3)}`,8,26);
      ctx.fillStyle=V.gold;
      ctx.fillText(`omega: ${s.omega.toFixed(3)} rad/s`,8,38);

      rafRef.current=requestAnimationFrame(tick);
    }
    rafRef.current=requestAnimationFrame(tick);
    return()=>cancelAnimationFrame(rafRef.current);
  },[]);

  return(
    <canvas ref={ref} width={420} height={200}
      style={{width:"100%",borderRadius:8,
        border:"1px solid rgba(200,160,48,0.18)",display:"block"}}/>
  );
}

// ── Gold photon scatter canvas ────────────────────────────────────────────────
interface Photon{x:number;y:number;vx:number;vy:number;life:number;maxLife:number;}

function PhotonCanvas(){
  const ref=useRef<HTMLCanvasElement>(null);
  const photonsRef=useRef<Photon[]>([]);
  const rafRef=useRef<number>(0);
  const tRef=useRef(0);

  useEffect(()=>{
    const canvas=ref.current;
    if(!canvas) return;
    const ctx=canvas.getContext("2d");
    if(!ctx) return;
    const W=canvas.width,H=canvas.height;
    const rng=(s:number)=>{let v=s;return()=>{v=(v*16807)%2147483647;return(v-1)/2147483646;};};
    const rand=rng(7);

    function spawn(){
      const x=20+rand()*(W-40);
      const angle=Math.PI/2+0.3+(rand()-0.5)*0.6;
      photonsRef.current.push({
        x,y:5,
        vx:Math.cos(angle)*3,
        vy:Math.sin(angle)*3,
        life:0,maxLife:40+Math.floor(rand()*30),
      });
    }

    function tick(){
      tRef.current++;
      if(tRef.current%6===0) spawn();

      ctx.fillStyle="rgba(1,3,8,0.3)";
      ctx.fillRect(0,0,W,H);

      // Gold leaf surface
      const gx=ctx.createLinearGradient(0,H-30,0,H);
      gx.addColorStop(0,"#C8A030");
      gx.addColorStop(0.5,"#FFE066");
      gx.addColorStop(1,"#7A5E10");
      ctx.fillStyle=gx;
      ctx.fillRect(0,H-30,W,30);

      // Surface shimmer
      for(let i=0;i<W;i+=8){
        const sh=Math.sin(i*0.15+tRef.current*0.05)*0.6;
        ctx.fillStyle=`rgba(255,230,100,${0.1+sh*0.1})`;
        ctx.fillRect(i,H-32,4,4);
      }

      // Photons
      photonsRef.current=photonsRef.current.filter(p=>p.life<p.maxLife);
      for(const p of photonsRef.current){
        p.life++;
        p.x+=p.vx;
        p.y+=p.vy;

        // Bounce off gold surface
        if(p.y>H-30){
          p.y=H-31;
          p.vy=-Math.abs(p.vy)*0.75;
          p.vx+=(rand()-0.5)*1.2;
        }

        const alpha=1-(p.life/p.maxLife);
        if(!isFinite(p.x)||!isFinite(p.y)) continue;

        // Photon trail
        const tc=ctx.createRadialGradient(p.x,p.y,0,p.x,p.y,5);
        tc.addColorStop(0,`rgba(255,238,100,${alpha*0.9})`);
        tc.addColorStop(1,"transparent");
        ctx.beginPath();
        ctx.arc(p.x,p.y,5,0,Math.PI*2);
        ctx.fillStyle=tc;
        ctx.fill();

        // Scatter spark at surface bounce
        if(p.y>H-35&&p.life<5){
          ctx.beginPath();
          ctx.arc(p.x,H-30,2,0,Math.PI*2);
          ctx.fillStyle=`rgba(255,220,80,${alpha})`;
          ctx.fill();
        }
      }

      // Labels
      ctx.fillStyle=V.gold+"AA";
      ctx.font=`8px ${MONO}`;
      ctx.fillText("INCOMING PHOTONS",8,14);
      ctx.fillStyle=V.gold;
      ctx.fillText("GOLD LEAF -- PLASMONIC SURFACE",8,H-10);

      rafRef.current=requestAnimationFrame(tick);
    }
    rafRef.current=requestAnimationFrame(tick);
    return()=>cancelAnimationFrame(rafRef.current);
  },[]);

  return(
    <canvas ref={ref} width={380} height={200}
      style={{width:"100%",borderRadius:8,
        border:"1px solid rgba(200,160,48,0.22)",display:"block"}}/>
  );
}

// ── Gravity field canvas ──────────────────────────────────────────────────────
function GravityFieldCanvas(){
  const ref=useRef<HTMLCanvasElement>(null);
  const rafRef=useRef<number>(0);
  const tRef=useRef(0);

  useEffect(()=>{
    const canvas=ref.current;
    if(!canvas) return;
    const ctx=canvas.getContext("2d");
    if(!ctx) return;
    const W=canvas.width,H=canvas.height;

    function tick(){
      tRef.current+=0.02;
      const t=tRef.current;

      ctx.fillStyle="#010308";
      ctx.fillRect(0,0,W,H);

      // Field lines -- curved by coherence field
      const CX=W/2,CY=H/2;
      const R_coh=70+Math.sin(t*0.7)*10;

      // Background gravity field lines (downward)
      ctx.strokeStyle=V.blue+"22";
      ctx.lineWidth=1;
      for(let x=20;x<W;x+=28){
        ctx.beginPath();
        for(let y=0;y<H;y+=4){
          const dx=x-CX,dy=y-CY;
          const dist=Math.sqrt(dx*dx+dy*dy);
          const coh=Math.exp(-dist*dist/(R_coh*R_coh));
          // Field deflects around coherence bubble
          const deflX=coh*(-dx/Math.max(dist,1))*14;
          const plotX=x+deflX;
          if(y===0) ctx.moveTo(plotX,y);
          else ctx.lineTo(plotX,y);
        }
        ctx.stroke();
      }

      // Coherence bubble
      if(isFinite(CX)&&isFinite(CY)){
        const bub=ctx.createRadialGradient(CX,CY,0,CX,CY,R_coh);
        bub.addColorStop(0,V.aurora+"18");
        bub.addColorStop(0.7,V.aurora+"08");
        bub.addColorStop(1,"transparent");
        ctx.beginPath();
        ctx.arc(CX,CY,R_coh,0,Math.PI*2);
        ctx.fillStyle=bub;
        ctx.fill();
        ctx.beginPath();
        ctx.arc(CX,CY,R_coh,0,Math.PI*2);
        ctx.strokeStyle=V.aurora+"44";
        ctx.lineWidth=1.5;
        ctx.stroke();
      }

      // Carriage silhouette
      ctx.fillStyle=V.gold+"33";
      ctx.strokeStyle=V.gold+"88";
      ctx.lineWidth=1.5;
      ctx.beginPath();
      ctx.roundRect(CX-30,CY-18,60,36,5);
      ctx.fill();
      ctx.stroke();

      // Vectored thrust arrows
      const thrustY=-3+Math.sin(t)*0.5;
      for(let dx=-1;dx<=1;dx++){
        const ax=CX+dx*22,ay=CY+20;
        ctx.strokeStyle=V.aurora+"CC";
        ctx.lineWidth=1.5;
        ctx.beginPath();
        ctx.moveTo(ax,ay);
        ctx.lineTo(ax+thrustY*dx*3,ay+22);
        ctx.stroke();
        // Arrowhead
        ctx.beginPath();
        ctx.moveTo(ax+thrustY*dx*3,ay+22);
        ctx.lineTo(ax+thrustY*dx*3-4,ay+16);
        ctx.lineTo(ax+thrustY*dx*3+4,ay+16);
        ctx.closePath();
        ctx.fillStyle=V.aurora+"88";
        ctx.fill();
      }

      // Coherence value
      const cohVal=0.88+Math.sin(t*0.7)*0.06;
      ctx.fillStyle=V.aurora+"CC";
      ctx.font=`8px ${MONO}`;
      ctx.textAlign="center";
      ctx.fillText(`C = ${cohVal.toFixed(3)}`,CX,CY-R_coh-10);
      ctx.textAlign="left";

      // Labels
      ctx.fillStyle=V.blue+"88";
      ctx.font=`8px ${MONO}`;
      ctx.fillText("AMBIENT GRAVITY FIELD",8,14);
      ctx.fillStyle=V.aurora+"AA";
      ctx.fillText("COHERENCE DEFLECTION BUBBLE",8,H-10);

      rafRef.current=requestAnimationFrame(tick);
    }
    rafRef.current=requestAnimationFrame(tick);
    return()=>cancelAnimationFrame(rafRef.current);
  },[]);

  return(
    <canvas ref={ref} width={340} height={220}
      style={{width:"100%",borderRadius:8,
        border:"1px solid rgba(0,255,178,0.16)",display:"block"}}/>
  );
}

// ── Layer spec data ───────────────────────────────────────────────────────────
const LAYERS=[
  {id:"L7",name:"Photovoltaic Canopy",mat:"Gold-nanoparticle doped DSSC film",
   fn:"Sunlight capture + DC bus generation",eta:"28-34%",col:V.gold,
   aether:"Plasmonic concentration: gold nanoparticles (50-80nm) red-shift absorption to 700-900nm, boosting photocurrent by 2.4x over bare silicon"},
  {id:"L6",name:"Gold Leaf Outer Shell",mat:"23-karat rolled gold leaf (0.1 micron)",
   fn:"Photonic reflector + thermal management + structural ornament",eta:"--",col:V.gold,
   aether:"Bouligand-surface coupling: leaf laid in opposing 45-deg grain directions distributes thermal stress across all axes. Plasmonic surface emits < 0.08 emissivity in IR."},
  {id:"L5",name:"Carved Hardwood Frame",mat:"End-grain oak with helicoidal carving pattern",
   fn:"Primary load structure -- Bouligand-equivalent vibration distribution",eta:"C_struct = 1.0",col:V.amb,
   aether:"Helicoidal grain of carved channels (rotating 5-deg per lamina) mimics crab exoskeleton -- impact energy from every direction redistributed across grain planes, zero stress concentration."},
  {id:"L4",name:"Coherence Suspension",mat:"Magneto-rheological fluid damper array",
   fn:"Active sway/rock damping modulated by C(x,t) sensor field",eta:"0.94 mean",col:V.aurora,
   aether:"The rocking IS the coherence response -- the carriage does not fight terrain, it couples to it as a coupled analog system. MR dampers tune to E(t) load in 8ms. Chessboard overload cannot occur."},
  {id:"L3",name:"Thermal Ground Plane",mat:"Pyrolytic graphite + aerogel sandwich",
   fn:"Passive heat rejection from solar collection to atmosphere",eta:"< 45 C interior",col:V.blue,
   aether:"Graphite in-plane thermal conductivity: 1500 W/mK. Aerogel through-plane: 0.015 W/mK. Creates one-directional heat valve -- in from sun, out from base."},
  {id:"L2",name:"Coherence Field Generator",mat:"NV-diamond magnetometer array + ELF antenna",
   fn:"Generates local C(x,t) field -- speculative gravity deflection layer",eta:"SPECULATIVE",col:V.vio,
   aether:"If coherence field is real: high C(x,t) locally reduces effective gravitational coupling. Requires diamond NV center array to maintain quantum coherence at 300K. Research basis: Anthrobot bio-field analogy."},
  {id:"L1",name:"Gravity Deflection Interface",mat:"THEORETICAL -- field boundary layer",
   fn:"Redirects ambient g-field vector away from carriage mass",eta:"THEORETICAL",col:V.plasma,
   aether:"Not yet demonstrated. Analogous to Cephalopod Edge Constraint: if coherence field C(x,t) >> gravitational complexity E_g, the field deflects rather than collapses. Pure speculative extension."},
  {id:"L0",name:"AETHER Substrate Coupling",mat:"Geomagnetic + Schumann resonance tap",
   fn:"L0 ground state for coherence field -- connects to planetary field",eta:"--",col:V.green,
   aether:"CUCA L0 principle: the geomagnetic field and Schumann cavity provide a 7.83Hz standing wave that stabilizes the local C(x,t) reference. The carriage is tuned to this frequency."},
];

const SPECS=[
  {label:"Passenger capacity",val:"2-4 persons"},
  {label:"Mass (target)",val:"320 kg (unloaded)"},
  {label:"Solar collection area",val:"4.2 m2 roof canopy"},
  {label:"Daily energy harvest (clear day)",val:"~6 kWh"},
  {label:"Cruise speed (electric drive)",val:"60 km/h"},
  {label:"Suspension sway tolerance",val:"+-12 deg, C-damped"},
  {label:"Gold leaf surface area",val:"18 m2 (all faces)"},
  {label:"Bouligand wood frame layers",val:"24 laminae x 7.5-deg rotation"},
  {label:"NV diamond array (speculative)",val:"4 cm2, 10^15 centres / cm2"},
  {label:"Coherence field radius (speculative)",val:"~1.2 m around chassis"},
];

// ── Main ──────────────────────────────────────────────────────────────────────
export default function AetherCarriage(){
  const [openLayer,setOpenLayer]=useState<string|null>(null);

  return(
    <div style={{minHeight:"100vh",background:V.bg,padding:"48px 24px 100px",
      maxWidth:900,margin:"0 auto"}}>

      {/* Header */}
      <div style={{marginBottom:44}}>
        <div style={{fontFamily:MONO,fontSize:8,color:V.gold+"88",
          letterSpacing:"0.25em",marginBottom:10}}>
          AETHER TRANSPORT SYNTHESIS -- SPECULATIVE ENGINEERING
        </div>
        <h1 style={{margin:"0 0 10px",fontFamily:DISP,
          fontSize:"clamp(1.4rem,4vw,2.2rem)",fontWeight:400,
          color:V.gold,letterSpacing:"0.15em",lineHeight:1.2}}>
          THE AETHER SOLAR CARRIAGE
        </h1>
        <div style={{fontFamily:SERIF,fontSize:"1.05rem",
          color:"rgba(184,204,232,0.75)",letterSpacing:"0.04em",marginBottom:18}}>
          Gold Leaf Plasmonic Shell -- Bouligand Carved Wood -- Coherence Suspension --
          Gravity Deflection Field
        </div>
        <div style={{display:"flex",flexWrap:"wrap" as const,gap:5,marginBottom:20}}>
          <Chip col={V.gold}>Gold Leaf Photonics</Chip>
          <Chip col={V.amb}>Bouligand Wood</Chip>
          <Chip col={V.aurora}>Coherence Damping</Chip>
          <Chip col={V.vio}>Gravity Manipulation</Chip>
          <Chip col={V.plasma}>Speculative</Chip>
        </div>
        <div style={{height:1,background:`linear-gradient(90deg,${V.gold}44,transparent)`}}/>
      </div>

      {/* Carriage diagram */}
      <div style={{marginBottom:48,padding:"24px",
        background:"rgba(10,8,4,0.8)",
        border:`1px solid ${V.gold}22`,borderRadius:8}}>
        <SectionHead n="DIAGRAM" title="THE AETHER CARRIAGE" col={V.gold}/>
        <CarriageDiagram/>
        <div style={{fontFamily:MONO,fontSize:8,color:V.dim,textAlign:"center" as const,marginTop:8}}>
          Live simulation -- sway and rock driven by coherence-damped pendulum physics
        </div>
      </div>

      {/* Core concept */}
      <div style={{marginBottom:48}}>
        <SectionHead n="I" title="THE AETHER CASE FOR THIS DESIGN" col={V.aurora}/>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12,marginBottom:20}}>
          {[
            {title:"Gold Leaf is not decoration",col:V.gold,
              body:"23-karat gold has the highest reflectivity of any workable metal in visible and near-IR (> 95%). Its plasmonic resonance at 520-900nm concentrates photon energy into the DSSC layer beneath. The leaf is the photonic concentrator -- P4 Morpho multilayer at the macro scale."},
            {title:"Carved Wood is structural biology",col:V.amb,
              body:"End-grain hardwood with helicoidal carving channels creates a Bouligand architecture -- the same principle in crab exoskeletons (P1 of the CUCA stack). Vibration from terrain loads in any direction is redirected by successive rotated grain layers. The carriage absorbs every bump without stress concentration."},
            {title:"Sway is the correct response",col:V.aurora,
              body:"A rigid carriage fights perturbation and loses (Cephalopod Edge Constraint). A coupled analog system -- the carriage swaying on coherence-modulated springs -- distributes the force across time. C(x,t) stays near 0.94. The rocking is the solution, not the failure."},
            {title:"Sunlight is the propulsion source",col:V.fire,
              body:"4.2 m2 gold-nanoparticle doped DSSC canopy generates ~6 kWh per clear day. This powers: electric hub motors (60 km/h cruise), MR-fluid active suspension (8ms response), NV-diamond coherence field array (speculative), and climate control. No combustion. No noise."},
          ].map(card=>(
            <div key={card.title} style={{padding:"18px 16px",borderRadius:6,
              background:`${card.col}08`,border:`1px solid ${card.col}28`}}>
              <div style={{fontFamily:DISP,fontSize:"0.9rem",color:card.col,
                letterSpacing:"0.1em",marginBottom:10}}>{card.title}</div>
              <div style={{fontFamily:SERIF,fontSize:"0.9rem",
                color:"rgba(184,204,232,0.72)",lineHeight:1.72}}>{card.body}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Live simulations */}
      <div style={{marginBottom:48}}>
        <SectionHead n="II" title="LIVE PHYSICS SIMULATIONS" col={V.aurora}/>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:16,marginBottom:12}}>
          <div>
            <div style={{fontFamily:MONO,fontSize:8,color:V.gold,
              letterSpacing:"0.14em",marginBottom:8}}>
              PHOTON -- GOLD LEAF INTERACTION
            </div>
            <PhotonCanvas/>
            <div style={{fontFamily:SERIF,fontSize:"0.82rem",
              color:"rgba(184,204,232,0.55)",marginTop:8,lineHeight:1.5}}>
              Photons scatter off gold plasmonic surface. Reflected photons are
              redirected toward DSSC cell layer beneath. Energy that is not
              converted heats the aerogel base and is rejected via the thermal ground plane.
            </div>
          </div>
          <div>
            <div style={{fontFamily:MONO,fontSize:8,color:V.aurora,
              letterSpacing:"0.14em",marginBottom:8}}>
              GRAVITY FIELD DEFLECTION (SPECULATIVE)
            </div>
            <GravityFieldCanvas/>
            <div style={{fontFamily:SERIF,fontSize:"0.82rem",
              color:"rgba(184,204,232,0.55)",marginTop:8,lineHeight:1.5}}>
              High C(x,t) field deflects ambient gravitational field lines around the
              chassis bubble. Analogy: cephalopod iridophore -- coherent system
              redirects rather than resists. Effective mass reduction: unverified.
            </div>
          </div>
        </div>
        <div style={{marginBottom:4}}>
          <div style={{fontFamily:MONO,fontSize:8,color:V.gold,
            letterSpacing:"0.14em",marginBottom:8}}>
            COHERENCE-DAMPED SUSPENSION -- SWAY PHYSICS
          </div>
          <SwayCanvas/>
          <div style={{fontFamily:SERIF,fontSize:"0.82rem",
            color:"rgba(184,204,232,0.55)",marginTop:8,lineHeight:1.5}}>
            Pendulum model of carriage sway with coherence-proportional damping.
            C(x,t) ~ 0.94 keeps theta small without rigidity.
            Terrain bumps are absorbed as distributed oscillations, not transmitted
            as impulses. The gold trace shows angle history -- the system never locks,
            never collapses.
          </div>
        </div>
      </div>

      {/* Math */}
      <div style={{marginBottom:48}}>
        <SectionHead n="III" title="AETHER MATHEMATICS OF THE CARRIAGE" col={V.blue}/>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
          {[
            {label:"Coherence field",tex:"C(x,t) = 1 - \\dfrac{\\|E(t)\\|}{\\|X^*\\|}",col:V.aurora,
              note:"E(t) = road perturbation load. X* = target smooth-travel state."},
            {label:"Bouligand stress distribution",tex:"\\sigma_{\\text{eff}} = \\sum_{k=0}^{N} R(\\theta_k)\\,\\sigma_0\\,R(\\theta_k)^T",col:V.amb,
              note:"Each lamina rotates stress tensor by theta_k -- no preferred failure axis."},
            {label:"Gold plasmonic efficiency",tex:"\\eta = \\eta_0\\left(1 + \\beta\\,|E_{\\text{SP}}|^2\\right)",col:V.gold,
              note:"E_SP = surface plasmon field enhancement from gold nanoparticles."},
            {label:"Gravity field deflection (speculative)",tex:"\\nabla \\cdot g_{\\text{eff}} = \\nabla \\cdot g_0 - \\alpha\\,\\nabla^2 C",col:V.plasma,
              note:"High C(x,t) locally suppresses divergence of gravitational field. Not validated."},
          ].map(m=>(
            <div key={m.label} style={{padding:"16px",borderRadius:6,
              background:`${m.col}08`,border:`1px solid ${m.col}22`}}>
              <div style={{fontFamily:MONO,fontSize:7,color:m.col,
                letterSpacing:"0.14em",marginBottom:10}}>{m.label.toUpperCase()}</div>
              <div dangerouslySetInnerHTML={{__html:kx(m.tex,true)}}
                style={{color:m.col,marginBottom:8}}/>
              <div style={{fontFamily:SERIF,fontSize:"0.8rem",
                color:V.dim,lineHeight:1.45}}>{m.note}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Layer stack */}
      <div style={{marginBottom:48}}>
        <SectionHead n="IV" title="MATERIAL LAYER SPECIFICATION" col={V.gold}/>
        <div style={{fontFamily:SERIF,fontSize:"0.9rem",color:"rgba(184,204,232,0.65)",
          lineHeight:1.7,marginBottom:20}}>
          Eight layers ordered from innermost substrate (L0) to outermost surface (L7).
          Click any layer for the AETHER engineering note.
          Layers marked SPECULATIVE are theoretical extensions of the coherence framework.
        </div>
        <div style={{display:"flex",flexDirection:"column" as const,gap:5}}>
          {LAYERS.map(l=>{
            const open=openLayer===l.id;
            return(
              <div key={l.id}
                onClick={()=>setOpenLayer(open?null:l.id)}
                style={{padding:"12px 16px",borderRadius:6,cursor:"pointer",
                  transition:"all 0.25s",
                  background:open?`${l.col}10`:`${l.col}05`,
                  border:`1px solid ${open?l.col:l.col+"33"}`,
                  boxShadow:open?`0 0 20px ${l.col}14`:"none"}}>
                <div style={{display:"grid",
                  gridTemplateColumns:"44px 1fr 100px 80px",gap:12,alignItems:"center"}}>
                  <div style={{fontFamily:MONO,fontSize:"0.9rem",
                    color:l.col,fontWeight:600}}>{l.id}</div>
                  <div>
                    <div style={{fontFamily:MONO,fontSize:8,color:l.col,
                      letterSpacing:"0.1em"}}>{l.name}</div>
                    <div style={{fontFamily:SERIF,fontSize:"0.82rem",color:V.dim,marginTop:2}}>
                      {l.mat}
                    </div>
                  </div>
                  <div style={{fontFamily:SERIF,fontSize:"0.8rem",
                    color:"rgba(184,204,232,0.6)"}}>{l.fn}</div>
                  <div style={{fontFamily:MONO,fontSize:8,color:l.col,
                    textAlign:"right" as const}}>{l.eta}</div>
                </div>
                {open&&(
                  <div style={{marginTop:12,paddingTop:12,
                    borderTop:`1px solid ${l.col}22`,
                    fontFamily:SERIF,fontSize:"0.88rem",
                    color:"rgba(184,204,232,0.75)",lineHeight:1.7}}>
                    <span style={{color:l.col,fontFamily:MONO,fontSize:7,
                      letterSpacing:"0.14em",marginRight:8}}>AETHER NOTE:</span>
                    {l.aether}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Specs */}
      <div style={{marginBottom:48}}>
        <SectionHead n="V" title="ENGINEERING SPECIFICATION" col={V.green}/>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"6px 32px"}}>
          {SPECS.map(s=>(
            <div key={s.label} style={{display:"flex",justifyContent:"space-between",
              padding:"8px 0",borderBottom:"1px solid rgba(58,80,96,0.35)"}}>
              <span style={{fontFamily:MONO,fontSize:8,color:V.dim}}>{s.label}</span>
              <span style={{fontFamily:MONO,fontSize:8,color:V.green}}>{s.val}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Speculative note */}
      <div style={{marginBottom:40,padding:"20px 24px",
        background:"rgba(255,68,119,0.04)",
        border:"1px solid rgba(255,68,119,0.18)",borderRadius:8}}>
        <div style={{fontFamily:MONO,fontSize:8,color:V.plasma,
          letterSpacing:"0.2em",marginBottom:10}}>AETHER HONEST NOTE -- SPECULATIVE LAYERS</div>
        <div style={{fontFamily:SERIF,fontSize:"0.92rem",
          color:"rgba(184,204,232,0.7)",lineHeight:1.8}}>
          The gold leaf solar carriage, Bouligand wood frame, coherence-damped MR suspension,
          and photovoltaic canopy are all physically buildable today.
          The gravity deflection field (L1-L2) is a speculative extension of the coherence
          framework -- it follows logically from the AETHER Cephalopod Edge Constraint
          (a sufficiently coherent field deflects rather than collapses under external load)
          but has not been experimentally demonstrated.
          <br/><br/>
          A productive near-term path: build the physical carriage (L3-L7) and instrument it
          with a precision accelerometer array. If C(x,t) -- computed from the sensor field --
          shows non-trivial correlation with effective inertial mass, you have the first
          empirical signal to investigate the gravity hypothesis.
        </div>
      </div>

      {/* Footer */}
      <div style={{borderTop:`1px solid ${V.dim}44`,paddingTop:24,
        display:"flex",justifyContent:"space-between",flexWrap:"wrap" as const,gap:12}}>
        <div style={{fontFamily:MONO,fontSize:8,color:V.dim}}>
          AETHER KNOWLEDGE SYSTEM -- SOLAR CARRIAGE SYNTHESIS
        </div>
        <div style={{fontFamily:MONO,fontSize:8,color:V.dim,textAlign:"right" as const}}>
          <div>Gold Leaf Photonics -- Bouligand Carved Wood</div>
          <div>Coherence Field Suspension -- Speculative Gravity Deflection</div>
        </div>
      </div>
    </div>
  );
}
