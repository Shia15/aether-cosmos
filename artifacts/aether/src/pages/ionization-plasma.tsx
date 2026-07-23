/*═══════════════════════════════════════════════════════════════
  Ionization and Plasma Formation
  From neutral gas to fully ionised plasma.
  Blue and violet: the meaning of high-energy plasma light.

  Physics:
  ── Ionization energy:  E_i = 13.6 eV/n²   (hydrogen series)
  ── Saha equation:      n_e·n_i/n_0 = (2πm_e kT/h²)^{3/2}·2·e^{−E_i/kT}
  ── Debye length:       λ_D = √(ε₀kT/n_e·e²)
  ── Plasma frequency:   ω_p = √(n_e·e²/ε₀·m_e)
  ── Emission lines:     Lyman α 121.6nm · Hα 656nm · Hβ 486nm
  ── Blue-violet plasma: N₂ 391nm · Ar 488nm · He 447/501nm
═══════════════════════════════════════════════════════════════*/
import { useRef, useEffect, useState } from "react";
const omniFlow = "/api/storage/public-objects/72D555D1-E91E-4B74-A73B-4628B8538AA1_1784561445345.png";
const magStorm = "/api/storage/public-objects/A6805E91-9684-4C59-BFC8-482EF421381D_1784561445345.png";
const skyrmion = "/api/storage/public-objects/IMG_4534_1784561445345.png";
const P={
  bg:"#02000f",panel:"#060018",panel2:"#0a0020",
  ivory:"#f0eaff",dim:"rgba(240,234,255,0.55)",muted:"rgba(240,234,255,0.28)",
  line:"rgba(120,80,255,0.08)",
  violet:"#a78bfa",blue:"#818cf8",indigo:"#6366f1",
  cyan:"#22d3ee",teal:"#2dd4bf",rose:"#f472b6",
  gold:"#fbbf24",green:"#4ade80",white:"#ffffff",
  red:"#f87171",
};

function Tag({label,color=P.violet}:{label:string;color?:string}){
  return <div style={{fontSize:9,fontWeight:700,color,letterSpacing:2,textTransform:"uppercase" as const,marginBottom:10}}>{label}</div>;
}
function Divider(){return <div style={{height:1,background:P.line,margin:"44px 0"}}/>;}
function Card({title,body,color=P.violet,sub}:{title:string;body:string;color?:string;sub?:string}){
  return(
    <div style={{padding:"13px 15px",background:P.panel,borderRadius:10,border:`1px solid ${color}18`}}>
      {sub&&<div style={{fontSize:9,color,letterSpacing:1.2,marginBottom:4,textTransform:"uppercase" as const}}>{sub}</div>}
      <div style={{fontSize:11,fontWeight:700,color,letterSpacing:.5,marginBottom:6,textTransform:"uppercase" as const}}>{title}</div>
      <div style={{fontSize:12,color:P.dim,lineHeight:1.85}}>{body}</div>
    </div>
  );
}
function EqBlock({label,eq,note,color=P.violet}:{label:string;eq:string;note?:string;color?:string}){
  return(
    <div style={{padding:"12px 16px",background:P.panel2,borderRadius:9,border:`1px solid ${color}20`,marginBottom:10}}>
      <div style={{fontSize:9,color:P.muted,marginBottom:4,letterSpacing:1}}>{label}</div>
      <pre style={{fontSize:12,fontFamily:"monospace",color,lineHeight:1.9,margin:0,whiteSpace:"pre-wrap"}}>{eq}</pre>
      {note&&<div style={{fontSize:11,color:P.dim,marginTop:6,lineHeight:1.75}}>{note}</div>}
    </div>
  );
}

/* ── CANVAS 1: Ionization cascade — temperature slider → plasma fraction ── */
function IonizationCanvas(){
  const ref=useRef<HTMLCanvasElement>(null);
  const tempRef=useRef(5000);
  const [temp,setTemp]=useState(5000);
  useEffect(()=>{tempRef.current=temp;},[temp]);

  useEffect(()=>{
    const cv=ref.current;if(!cv)return;
    const ctx=cv.getContext("2d")!;
    let raf=0,t=0;
    const ro=new ResizeObserver(()=>{cv.width=cv.offsetWidth;cv.height=cv.offsetHeight;});
    ro.observe(cv);cv.width=cv.offsetWidth;cv.height=cv.offsetHeight;

    // Saha equation for hydrogen
    function sahaH(T:number):number{
      const k=1.381e-23,h=6.626e-34,m=9.109e-31,Ei=13.6*1.6e-19;
      const n0=2.5e25; // neutral density (m^-3) at 1 atm
      const factor=(2*Math.PI*m*k*T/h**2)**1.5*(2/1)*Math.exp(-Ei/(k*T));
      // Saha: ne^2/n0 = factor*kT (simplified, n_i = n_e)
      // ne ≈ sqrt(factor*n0)
      return Math.min(1,Math.sqrt(factor/n0));
    }

    // Atoms: animated particles
    type Atom={x:number;y:number;vx:number;vy:number;ionised:boolean;col:string;r:number};
    const atoms:Atom[]=[];

    function init(){
      const W=cv.width,H=cv.height;
      atoms.length=0;
      for(let i=0;i<80;i++){
        atoms.push({x:Math.random()*W*0.55,y:H*0.1+Math.random()*H*0.78,vx:(Math.random()-0.5)*0.8,vy:(Math.random()-0.5)*0.8,ionised:false,col:P.violet,r:5+Math.random()*3});
      }
    }
    init();

    function draw(){
      const W=cv.width,H=cv.height;
      ctx.clearRect(0,0,W,H);ctx.fillStyle=P.bg;ctx.fillRect(0,0,W,H);

      const T=tempRef.current;
      const ionFrac=sahaH(T);
      const nIon=Math.round(ionFrac*atoms.length);

      // Update atom velocities (temperature = kinetic energy)
      const speedScale=Math.sqrt(T/5000)*1.2;
      atoms.forEach((a,i)=>{
        a.ionised=i<nIon;
        const speed=Math.hypot(a.vx,a.vy);
        if(speed<0.1)a.vx=(Math.random()-0.5);
        a.vx+=(Math.random()-0.5)*0.05*speedScale;
        a.vy+=(Math.random()-0.5)*0.05*speedScale;
        const sp2=Math.hypot(a.vx,a.vy);
        const maxSp=speedScale*3;
        if(sp2>maxSp){a.vx*=maxSp/sp2;a.vy*=maxSp/sp2;}
        a.x+=a.vx;a.y+=a.vy;
        const W2=W*0.55;
        if(a.x<0){a.x=0;a.vx*=-1;}if(a.x>W2){a.x=W2;a.vx*=-1;}
        if(a.y<H*0.1){a.y=H*0.1;a.vy*=-1;}if(a.y>H*0.9){a.y=H*0.9;a.vy*=-1;}
      });

      // Containment border
      ctx.strokeStyle="rgba(120,80,255,0.2)";ctx.lineWidth=1;
      ctx.strokeRect(0,H*0.1,W*0.55,H*0.8);

      // Draw atoms
      atoms.forEach(a=>{
        const col=a.ionised?P.violet:P.blue;
        const grd=ctx.createRadialGradient(a.x,a.y,0,a.x,a.y,a.r+4);
        grd.addColorStop(0,col+(a.ionised?"cc":"55"));grd.addColorStop(1,col+"00");
        ctx.fillStyle=grd;ctx.beginPath();ctx.arc(a.x,a.y,a.r+4,0,Math.PI*2);ctx.fill();
        ctx.fillStyle=a.ionised?P.violet:P.blue;ctx.beginPath();ctx.arc(a.x,a.y,a.r,0,Math.PI*2);ctx.fill();
        // Electron orbit on neutrals; free electron on ions
        if(!a.ionised){
          const ea=t*0.08+a.x*0.2;
          ctx.strokeStyle=P.cyan+"60";ctx.lineWidth=0.8;
          ctx.beginPath();ctx.ellipse(a.x,a.y,a.r+5,a.r+2,ea,0,Math.PI*2);ctx.stroke();
          ctx.fillStyle=P.cyan;ctx.beginPath();ctx.arc(a.x+Math.cos(ea)*(a.r+5),a.y+Math.sin(ea)*(a.r+2),1.5,0,Math.PI*2);ctx.fill();
        } else {
          // Free electron drifting away
          const ex=a.x+Math.cos(t*0.1+a.x)*12,ey2=a.y+Math.sin(t*0.09+a.y)*10;
          ctx.fillStyle=P.cyan+"aa";ctx.beginPath();ctx.arc(ex,ey2,2,0,Math.PI*2);ctx.fill();
          // Emission photon (coloured dot drifting outward)
          const ph=(t*0.03+a.y*0.01)%1;
          const px=a.x+Math.cos(a.x)*20*ph,py=a.y-10*ph;
          const nm=380+ionFrac*(750-380);
          const h=Math.round(260-ionFrac*180);
          ctx.fillStyle=`hsla(${h},90%,70%,${(1-ph)*0.8})`;
          ctx.beginPath();ctx.arc(px,py,2.5*(1-ph),0,Math.PI*2);ctx.fill();
        }
      });

      // ── Right panel: Saha curve + state readouts ──────────
      const rX=W*0.58,rW=W-rX-12;
      // Saha curve T vs ionisation fraction
      const curveY=H*0.12,curveH=H*0.40;
      ctx.fillStyle=P.panel2;ctx.fillRect(rX,curveY,rW,curveH);
      const Tmin=1000,Tmax=50000;
      // Draw curve
      ctx.beginPath();
      for(let i=0;i<rW;i++){
        const Tcv=Tmin+(i/rW)*(Tmax-Tmin);
        const frac2=sahaH(Tcv);
        const sy=curveY+curveH-(frac2*curveH);
        i===0?ctx.moveTo(rX+i,sy):ctx.lineTo(rX+i,sy);
      }
      ctx.strokeStyle=P.violet;ctx.lineWidth=2;ctx.stroke();
      // Cursor
      const cursorX=rX+(T-Tmin)/(Tmax-Tmin)*rW;
      ctx.strokeStyle=P.gold;ctx.lineWidth=1.5;ctx.setLineDash([3,3]);
      ctx.beginPath();ctx.moveTo(cursorX,curveY);ctx.lineTo(cursorX,curveY+curveH);ctx.stroke();ctx.setLineDash([]);
      ctx.fillStyle=P.gold;ctx.beginPath();ctx.arc(cursorX,curveY+curveH-(ionFrac*curveH),5,0,Math.PI*2);ctx.fill();
      // Axis labels
      ctx.fillStyle=P.muted;ctx.font="6px monospace";ctx.textAlign="left";
      ctx.fillText("1000K",rX,curveY+curveH+10);ctx.textAlign="right";ctx.fillText("50kK",rX+rW,curveY+curveH+10);
      ctx.fillStyle=P.violet;ctx.font="bold 7px monospace";ctx.textAlign="center";
      ctx.fillText("SAHA IONISATION CURVE (H)",rX+rW/2,curveY-4);

      // State readouts
      const Debye=Math.sqrt(8.85e-12*1.381e-23*T/(Math.max(1,ionFrac*2.5e25)*1.6e-19**2))*1e6; // μm
      const wp=Math.sqrt(ionFrac*2.5e25*1.6e-19**2/(8.85e-12*9.109e-31))/1e9; // GHz
      const plasmaState=ionFrac<0.01?"NEUTRAL GAS":ionFrac<0.1?"PARTIALLY IONISED":ionFrac<0.5?"WEAKLY IONISED":"FULLY IONISED PLASMA";
      const col=ionFrac<0.01?P.blue:ionFrac<0.1?P.teal:ionFrac<0.5?P.violet:P.rose;
      const readouts=[
        [`T = ${(T/1000).toFixed(1)} kK`,P.gold],
        [`α = ${(ionFrac*100).toFixed(1)}% ionised`,P.violet],
        [plasmaState,col],
        [`λ_D = ${Debye.toFixed(2)} μm`,P.cyan],
        [`ω_p = ${wp.toFixed(1)} GHz`,P.teal],
        [`E_i (H) = 13.6 eV`,P.rose],
      ];
      readouts.forEach(([l,c],i)=>{
        ctx.fillStyle=c as string;ctx.font="bold 8px monospace";ctx.textAlign="left";
        ctx.fillText(l as string,rX+6,curveY+curveH+28+i*14);
      });

      // Emission colour indicator
      const emCol=ionFrac>0.5?"rgba(160,80,255,0.8)":ionFrac>0.1?"rgba(100,150,255,0.8)":"rgba(60,80,200,0.5)";
      const pulseE=0.7+0.3*Math.sin(t*0.06);
      ctx.fillStyle=emCol;ctx.beginPath();ctx.arc(rX+rW*0.75,H*0.82,20*pulseE,0,Math.PI*2);ctx.fill();
      ctx.fillStyle=P.ivory;ctx.font="bold 7px monospace";ctx.textAlign="center";
      ctx.fillText("PLASMA",rX+rW*0.75,H*0.82+3);
      ctx.fillText("GLOW",rX+rW*0.75,H*0.82+32);

      ctx.fillStyle=P.violet;ctx.font="bold 8px monospace";ctx.textAlign="left";
      ctx.fillText("IONISATION CASCADE · SAHA EQUATION · HYDROGEN PLASMA · TEMPERATURE DRIVER",8,14);
      ctx.fillStyle=P.muted;ctx.font="7px monospace";
      ctx.fillText("Violet = ionised atoms · Blue = neutral · Cyan dots = free electrons · photon emitted on recombination",8,H-6);

      t++;raf=requestAnimationFrame(draw);
    }
    draw();
    return()=>{cancelAnimationFrame(raf);ro.disconnect();};
  },[]);

  return(
    <div style={{border:`1px solid ${P.line}`,borderRadius:12,overflow:"hidden",marginBottom:28}}>
      <canvas ref={ref} style={{width:"100%",height:440,display:"block"}}/>
      <div style={{padding:"10px 16px",background:P.panel,display:"flex",gap:20,flexWrap:"wrap",alignItems:"center"}}>
        <div>
          <div style={{fontSize:10,color:P.violet,marginBottom:3}}>Temperature · {(temp/1000).toFixed(1)} kK</div>
          <input type="range" min={1000} max={50000} step={500} value={temp} onChange={e=>setTemp(+e.target.value)} style={{width:200}}/>
        </div>
        <div style={{fontSize:11,color:P.dim,lineHeight:1.85,maxWidth:500}}>
          Raise temperature to drive ionisation. The Saha equation gives equilibrium ionisation fraction. At ~10,000 K hydrogen is 50% ionised; at 20,000 K it is fully ionised. Debye length shrinks as n_e increases. Plasma frequency rises. Below 1000 K: neutral gas. Above 30,000 K: fully ionised plasma glowing blue-violet.
        </div>
      </div>
    </div>
  );
}

/* ── CANVAS 2: Plasma emission line spectrum — blue/violet meaning ── */
function PlasmaSpectrumCanvas(){
  const ref=useRef<HTMLCanvasElement>(null);
  useEffect(()=>{
    const cv=ref.current;if(!cv)return;
    const ctx=cv.getContext("2d")!;
    let raf=0,t=0;
    const ro=new ResizeObserver(()=>{cv.width=cv.offsetWidth;cv.height=cv.offsetHeight;});
    ro.observe(cv);cv.width=cv.offsetWidth;cv.height=cv.offsetHeight;

    // Emission lines for common plasma gases
    const GASES=[
      {name:"H Balmer",col:"#e84040",lines:[
        {nm:656.3,label:"Hα",I:1.0,note:"n=3→2"},
        {nm:486.1,label:"Hβ",I:0.36,note:"n=4→2"},
        {nm:434.0,label:"Hγ",I:0.17,note:"n=5→2"},
        {nm:410.2,label:"Hδ",I:0.10,note:"n=6→2"},
      ]},
      {name:"N₂ (air plasma)",col:"#8080ff",lines:[
        {nm:391.4,label:"N₂⁺ B",I:0.9,note:"1st neg band"},
        {nm:337.1,label:"N₂ C",I:0.8,note:"2nd pos band (UV)"},
        {nm:357.7,label:"N₂ C",I:0.6,note:"2nd pos"},
        {nm:315.9,label:"N₂ B",I:0.5,note:"1st pos"},
      ]},
      {name:"He",col:"#ffcc00",lines:[
        {nm:587.5,label:"He D3",I:0.8,note:"2³P→2³S"},
        {nm:501.6,label:"He 5016",I:0.5,note:"2¹P→2¹S"},
        {nm:447.1,label:"He 4471",I:0.4,note:"2³P→4³D"},
        {nm:388.9,label:"He 3889",I:0.3,note:"2³P→3³P"},
      ]},
      {name:"Ar",col:"#00ffcc",lines:[
        {nm:811.5,label:"Ar I",I:1.0,note:"NIR dominant"},
        {nm:750.4,label:"Ar I",I:0.7,note:"deep red"},
        {nm:696.5,label:"Ar I",I:0.5,note:"red"},
        {nm:488.0,label:"Ar II",I:0.4,note:"LASER line, cyan"},
      ]},
    ];

    function nmToHue(nm:number){
      if(nm<380)return 270;if(nm>750)return 0;
      const t=(nm-380)/(750-380);return 270-t*270;
    }
    function nmToRgbSimple(nm:number):[number,number,number]{
      const h=nmToHue(nm);
      const c=85,s=0.9;
      const H=h/60;const X=c*(1-Math.abs(H%2-1));
      let r=0,g=0,b=0;
      if(H<1){r=c;g=X;}else if(H<2){r=X;g=c;}else if(H<3){g=c;b=X;}
      else if(H<4){g=X;b=c;}else if(H<5){r=X;b=c;}else{r=c;b=X;}
      return [r+50,g+50,b+50];
    }

    function draw(){
      const W=cv.width,H=cv.height;
      ctx.clearRect(0,0,W,H);ctx.fillStyle=P.bg;ctx.fillRect(0,0,W,H);

      const padX=16,padY=30;
      const specW=W-padX*2;
      const rowH=(H-padY*2)/GASES.length-8;
      const NM_MIN=350,NM_MAX=900;

      // Spectrum bar at top
      for(let i=0;i<specW;i++){
        const nm=NM_MIN+(i/specW)*(NM_MAX-NM_MIN);
        if(nm<380||nm>750){ctx.fillStyle="rgba(30,0,60,0.5)";ctx.fillRect(padX+i,padY-16,1,12);continue;}
        const h=nmToHue(nm);
        ctx.fillStyle=`hsl(${h},90%,55%)`;ctx.fillRect(padX+i,padY-16,1,12);
      }
      ctx.fillStyle=P.muted;ctx.font="7px monospace";ctx.textAlign="left";
      ctx.fillText(`${NM_MIN}nm`,padX,padY-18);ctx.textAlign="right";ctx.fillText(`${NM_MAX}nm`,padX+specW,padY-18);

      // Each gas row
      GASES.forEach((gas,gi)=>{
        const baseY=padY+gi*(rowH+8);
        // Background
        ctx.fillStyle=gas.col+"0a";ctx.fillRect(padX,baseY,specW,rowH);
        // Gas label
        ctx.fillStyle=gas.col;ctx.font="bold 8px monospace";ctx.textAlign="left";
        ctx.fillText(gas.name,padX+4,baseY+12);

        // Emission lines
        gas.lines.forEach(line=>{
          if(line.nm<NM_MIN||line.nm>NM_MAX)return;
          const lx=padX+(line.nm-NM_MIN)/(NM_MAX-NM_MIN)*specW;
          const lh=line.I*rowH*0.85;
          const pulse=0.8+0.2*Math.sin(t*0.05+line.nm*0.02+gi);
          const [r,g,b]=nmToRgbSimple(Math.min(750,Math.max(380,line.nm)));
          // Lorentzian profile
          for(let dx=-8;dx<=8;dx++){
            const lor=line.I/(1+(dx/2)**2)*pulse;
            ctx.fillStyle=`rgba(${r},${g},${b},${lor*0.7})`;
            ctx.fillRect(lx+dx,baseY+rowH-lh*lor,1,lh*lor);
          }
          // Label
          ctx.fillStyle=`rgb(${r},${g},${b})`;ctx.font="bold 7px monospace";ctx.textAlign="center";
          ctx.fillText(line.label,lx,baseY+rowH-lh-5);
          ctx.fillStyle=P.muted;ctx.font="6px monospace";
          ctx.fillText(`${line.nm}nm`,lx,baseY+rowH+10);
        });

        // Separator
        ctx.strokeStyle="rgba(120,80,255,0.1)";ctx.lineWidth=0.5;
        ctx.beginPath();ctx.moveTo(padX,baseY+rowH+4);ctx.lineTo(padX+specW,baseY+rowH+4);ctx.stroke();
      });

      // Blue-violet region highlight
      const bvStart=padX+(380-NM_MIN)/(NM_MAX-NM_MIN)*specW;
      const bvEnd=padX+(495-NM_MIN)/(NM_MAX-NM_MIN)*specW;
      ctx.fillStyle="rgba(120,80,255,0.06)";ctx.fillRect(bvStart,padY-20,bvEnd-bvStart,H-padY);
      ctx.strokeStyle="rgba(120,80,255,0.3)";ctx.lineWidth=1;ctx.setLineDash([3,3]);
      ctx.beginPath();ctx.moveTo(bvStart,padY-20);ctx.lineTo(bvStart,H-8);ctx.stroke();
      ctx.beginPath();ctx.moveTo(bvEnd,padY-20);ctx.lineTo(bvEnd,H-8);ctx.stroke();ctx.setLineDash([]);
      ctx.fillStyle=P.violet;ctx.font="bold 7px monospace";ctx.textAlign="center";
      ctx.fillText("BLUE-VIOLET · 380-495nm",bvStart+(bvEnd-bvStart)/2,H-4);

      ctx.fillStyle=P.violet;ctx.font="bold 8px monospace";ctx.textAlign="left";
      ctx.fillText("PLASMA EMISSION LINES · H BALMER · N₂ · He · Ar · BLUE-VIOLET DOMINANCE",8,14);

      t++;raf=requestAnimationFrame(draw);
    }
    draw();
    return()=>{cancelAnimationFrame(raf);ro.disconnect();};
  },[]);
  return(
    <div style={{border:`1px solid ${P.line}`,borderRadius:12,overflow:"hidden",marginBottom:28}}>
      <canvas ref={ref} style={{width:"100%",height:400,display:"block"}}/>
      <div style={{padding:"8px 16px",background:P.panel,fontSize:11,color:P.dim,lineHeight:1.8}}>
        Each gas emits only specific wavelengths when ionised — its spectral fingerprint. The blue-violet region (380–495nm, highlighted) is dense with emission lines: N₂⁺ at 391nm (the signature of air plasma and lightning), He at 447nm and 388nm, Ar II laser line at 488nm, H Balmer δ at 410nm. This is why high-temperature plasma glows blue-violet: these are the transitions with the highest photon energy — the electrons are falling from the highest levels, releasing the most energy per photon.
      </div>
    </div>
  );
}

/* ── CANVAS 3: Plasma phase space — neutrals→weakly ionised→fully ionised ── */
function PlasmaPhaseCanvas(){
  const ref=useRef<HTMLCanvasElement>(null);
  useEffect(()=>{
    const cv=ref.current;if(!cv)return;
    const ctx=cv.getContext("2d")!;
    let raf=0,t=0;
    const ro=new ResizeObserver(()=>{cv.width=cv.offsetWidth;cv.height=cv.offsetHeight;});
    ro.observe(cv);cv.width=cv.offsetWidth;cv.height=cv.offsetHeight;

    // Plasma types: T (K) vs n_e (m^-3)
    const TYPES=[
      {name:"Outer space",T:1e4,n:1e6,col:P.indigo},
      {name:"Solar wind",T:1e5,n:1e7,col:P.teal},
      {name:"Ionosphere",T:1e3,n:1e11,col:P.cyan},
      {name:"Lightning",T:3e4,n:1e24,col:P.gold},
      {name:"Corona",T:2e6,n:1e14,col:P.rose},
      {name:"Tokamak",T:1e8,n:1e20,col:P.violet},
      {name:"Laser fusion",T:1e9,n:1e28,col:"#ff4040"},
      {name:"Z-pinch",T:3e6,n:1e22,col:P.red},
      {name:"Glow discharge",T:3e4,n:1e16,col:P.blue},
      {name:"Flame",T:3e3,n:1e17,col:P.green},
    ];

    function draw(){
      const W=cv.width,H=cv.height;
      ctx.clearRect(0,0,W,H);ctx.fillStyle=P.bg;ctx.fillRect(0,0,W,H);

      const padX=60,padY=20,plotW=W-padX-20,plotH=H-padY-40;
      const logTmin=2,logTmax=10,logNmin=5,logNmax=30;

      function TtoX(T:number){return padX+(Math.log10(T)-logTmin)/(logTmax-logTmin)*plotW;}
      function nToY(n:number){return padY+plotH-(Math.log10(n)-logNmin)/(logNmax-logNmin)*plotH;}

      // Grid
      ctx.strokeStyle="rgba(120,80,255,0.07)";ctx.lineWidth=0.5;
      for(let logT=logTmin;logT<=logTmax;logT++){
        const x=TtoX(10**logT);
        ctx.beginPath();ctx.moveTo(x,padY);ctx.lineTo(x,padY+plotH);ctx.stroke();
        ctx.fillStyle=P.muted;ctx.font="6px monospace";ctx.textAlign="center";
        ctx.fillText(`10^${logT}K`,x,padY+plotH+12);
      }
      for(let logN=logNmin;logN<=logNmax;logN+=2){
        const y=nToY(10**logN);
        ctx.beginPath();ctx.moveTo(padX,y);ctx.lineTo(padX+plotW,y);ctx.stroke();
        ctx.fillStyle=P.muted;ctx.font="6px monospace";ctx.textAlign="right";
        ctx.fillText(`10^${logN}`,padX-3,y+3);
      }

      // Debye length contours
      [1e-6,1e-3,1,1000].forEach(lambdaD=>{
        ctx.setLineDash([2,4]);ctx.strokeStyle="rgba(120,80,255,0.12)";ctx.lineWidth=0.6;
        ctx.beginPath();let first=true;
        for(let logT=logTmin;logT<=logTmax;logT+=0.1){
          const T=10**logT;
          // λ_D = sqrt(ε₀kT/ne²)  →  n = ε₀kT/(e²·λ_D²)
          const n=(8.85e-12*1.381e-23*T)/(1.6e-19**2*lambdaD**2);
          if(n<10**logNmin||n>10**logNmax){first=true;continue;}
          first?ctx.moveTo(TtoX(T),nToY(n)):ctx.lineTo(TtoX(T),nToY(n));first=false;
        }
        ctx.stroke();
        ctx.setLineDash([]);
        const labelT=10**(logTmin+0.5),labelN=(8.85e-12*1.381e-23*labelT)/(1.6e-19**2*lambdaD**2);
        if(labelN>=10**logNmin&&labelN<=10**logNmax){
          ctx.fillStyle="rgba(120,80,255,0.5)";ctx.font="6px monospace";ctx.textAlign="left";
          ctx.fillText(`λD=${lambdaD<1e-3?`${lambdaD*1e6}μm`:lambdaD<1?`${lambdaD*1e3}mm`:`${lambdaD}m`}`,TtoX(labelT)+2,nToY(labelN));
        }
      });

      // Plot plasma types
      TYPES.forEach((pt,pti)=>{
        if(!pt.col)return;
        const x=TtoX(pt.T),y=nToY(pt.n);
        if(x<padX||x>padX+plotW||y<padY||y>padY+plotH)return;
        const pulse=0.8+0.2*Math.sin(t*0.03+pti*0.7);
        const r2=Math.max(2,16*pulse);
        const grd=ctx.createRadialGradient(x,y,0,x,y,r2);
        grd.addColorStop(0,pt.col+"cc");grd.addColorStop(1,pt.col+"00");
        ctx.fillStyle=grd;ctx.beginPath();ctx.arc(x,y,r2,0,Math.PI*2);ctx.fill();
        ctx.fillStyle=pt.col;ctx.beginPath();ctx.arc(x,y,7,0,Math.PI*2);ctx.fill();
        ctx.fillStyle=pt.col;ctx.font="bold 7px monospace";ctx.textAlign="left";
        ctx.fillText(pt.name,x+10,y+3);
      });

      // Axis labels
      ctx.fillStyle=P.violet;ctx.font="bold 7px monospace";ctx.textAlign="center";
      ctx.fillText("Temperature (K)",padX+plotW/2,padY+plotH+26);
      ctx.save();ctx.translate(14,padY+plotH/2);ctx.rotate(-Math.PI/2);
      ctx.fillText("Electron density n_e (m⁻³)",0,0);ctx.restore();

      ctx.fillStyle=P.violet;ctx.font="bold 8px monospace";ctx.textAlign="left";
      ctx.fillText("PLASMA PHASE SPACE · T vs n_e · DEBYE LENGTH CONTOURS",8,14);

      t++;raf=requestAnimationFrame(draw);
    }
    draw();
    return()=>{cancelAnimationFrame(raf);ro.disconnect();};
  },[]);
  return(
    <div style={{border:`1px solid ${P.line}`,borderRadius:12,overflow:"hidden",marginBottom:28}}>
      <canvas ref={ref} style={{width:"100%",height:400,display:"block"}}/>
    </div>
  );
}

export default function IonizationPlasmaPage(){
  const [imgX,setImgX]=useState<number|null>(null);
  const imgs=[
    {src:magStorm,caption:"Solar Plasma · Fully Ionised Coronal Gas",
     anno:"The solar corona is a fully ionised plasma at T ~ 1–3 MK — two orders of magnitude hotter than the photosphere below it (5,800 K). The corona emits primarily in X-ray and EUV because T_corona >> T_chromosphere means the Saha equation drives the gas to near-complete ionisation of all elements. The resulting free-free (bremsstrahlung) emission and recombination lines span X-ray to UV. The mystery: why is the corona so much hotter than the surface it sits above? Current leading theories involve Alfvén wave dissipation (the wave turbulence heating the corona) and nanoflare reconnection (countless small reconnection events depositing energy locally). In AETHER terms: the corona is the coherence field at maximum C — where all free energy has been organised into coronal loops, currents, and wave modes.",
     chips:["T = 1-3 MK","Saha Equation","Bremsstrahlung","Alfvén Wave Heating","Nanoflare Reconnection","Coronal Heating Mystery"]},
    {src:skyrmion,caption:"Topological Plasma · Helicity-Preserving Structures",
     anno:"When a fully ionised plasma freezes its magnetic field (the frozen-in condition, where η → 0 and E + v×B = 0), the magnetic topology becomes conserved. A skyrmion-like helical structure in the plasma field cannot relax without reconnection — just as a skyrmion cannot relax without creation of a topological defect. This is Taylor relaxation in plasma physics: resistive MHD allows field lines to reconnect only at current sheets, and the plasma relaxes to its minimum energy state consistent with conserved helicity H = ∫A·B dV. The resulting structures are force-free fields (j∥B, j×B=0) — the plasma equivalent of skyrmion ground states. Blue-violet emission from helicity-carrying structures arises because the highest-energy bound states (which emit blue-violet photons on decay) are also the most topologically complex — they require the most reconnection events to relax.",
     chips:["Frozen-In Condition","Taylor Relaxation","Magnetic Helicity","Force-Free Field","j∥B","Topological Plasma"]},
    {src:omniFlow,caption:"Omni-Flow · Plasma Confinement Grid",
     anno:"Effective plasma confinement requires a magnetic field topology with maximum coverage of the plasma volume — every field line closing on itself, no open lines that allow plasma to escape along them. The omni-flow rhombic grid is the 2D projection of this: a multiply-connected lattice where every cell is bounded by closed loops. In 3D, this becomes the stellarator field topology: a helically wound coil system that generates field lines winding on closed toroidal surfaces. The rhombic cell corresponds to one poloidal turn of a field line; the overall grid corresponds to the full nested toroidal surface structure. The connection: plasma confinement, slime mould transport optimisation, laser beam phased arrays, retinal cone cell packing — all choose the rhombic/hexagonal lattice because it maximises coverage per unit boundary length (the isoperimetric optimum for periodic tilings).",
     chips:["Stellarator Topology","Closed Field Lines","Helical Winding","Isoperimetric Optimum","Toroidal Surfaces","Plasma Confinement"]},
  ];

  // Blue-violet plasma meaning section
  const BV_MEANING=[
    {nm:"391 nm",gas:"N₂⁺",col:"#8880ff",meaning:"First negative band of nitrogen ions — THE signature of air plasma, lightning, sprites. Lightning is blue because of this line. Sky above lightning glows blue-violet.",icon:"⚡"},
    {nm:"447 nm",gas:"He",col:"#8860ff",meaning:"Helium 4471Å line — excited He in stars, lab plasma. Seen in hot blue stars (B-type), in He-Ne laser discharges.",icon:"☀"},
    {nm:"486 nm",gas:"H Hβ",col:"#6090ff",meaning:"Hydrogen Balmer beta — n=4→2. The second-most-prominent hydrogen line. Blue emission nebulae (reflection + ionisation) show this prominently.",icon:"🌌"},
    {nm:"488 nm",gas:"Ar II",col:"#40c0ff",meaning:"Argon ion laser line — the most powerful visible CW laser line. Used in laser shows, confocal microscopy, retinal treatment.",icon:"🔵"},
    {nm:"501 nm",gas:"He / [OIII]",col:"#00e0cc",meaning:"Doubly-ionised oxygen [OIII] — the dominant emission from hot planetary nebulae and HII regions. Turns the nebula teal-green. Also He singlet.",icon:"💫"},
  ];

  return(
    <div style={{background:P.bg,color:P.ivory,minHeight:"100vh",fontFamily:"inherit"}}>
      <div style={{maxWidth:1060,margin:"0 auto",padding:"52px 32px 36px"}}>
        <Tag label="Ionization and Plasma Formation · Saha Equation · Debye Shielding · Emission Lines · Blue-Violet Plasma Meaning"/>
        <h1 style={{fontSize:34,fontWeight:800,lineHeight:1.1,margin:"8px 0 14px",letterSpacing:-0.5}}>
          <span style={{color:P.violet}}>Ionization</span> · the Matter<br/>
          <span style={{color:P.blue}}>Becomes</span> <span style={{color:P.cyan}}>Light</span>
        </h1>
        <h2 style={{fontSize:18,fontWeight:400,color:"#c4b5fd",margin:"0 0 18px",lineHeight:1.5}}>
          Neutral gas → partially ionised → fully ionised plasma · each phase transition emits blue and violet photons · the colour encodes the energy of the transition
        </h2>
        <p style={{fontSize:14,color:P.dim,lineHeight:1.9,maxWidth:780,marginBottom:20}}>
          Ionisation is the transition from bound electrons (neutral atoms, dark matter) to free electrons (plasma, conducting light). The Saha equation gives the equilibrium ionisation fraction at each temperature. Below 3,000 K: molecules and atoms, almost no free electrons. At 10,000 K: hydrogen is half-ionised. At 30,000 K: fully ionised plasma. Each electron captured back (recombination) emits a photon. High-temperature plasma preferentially produces blue and violet photons — because those are the transitions with the most energy — the atom is falling from its most excited states.
        </p>

        {/* Blue-violet meaning strip */}
        <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(150px,1fr))",gap:10,marginBottom:16}}>
          {BV_MEANING.map(bv=>(
            <div key={bv.nm} style={{padding:"10px 14px",background:P.panel2,borderRadius:9,border:`1px solid ${bv.col}25`,textAlign:"center"}}>
              <div style={{fontSize:18,marginBottom:4}}>{bv.icon}</div>
              <div style={{fontSize:10,fontWeight:700,color:bv.col}}>{bv.nm}</div>
              <div style={{fontSize:9,color:P.muted,marginBottom:4}}>{bv.gas}</div>
              <div style={{fontSize:10,color:P.dim,lineHeight:1.6}}>{bv.meaning.slice(0,60)}…</div>
            </div>
          ))}
        </div>
      </div>
      <Divider/>
      <div style={{maxWidth:1060,margin:"0 auto",padding:"0 32px 48px"}}>
        <Tag label="Section I · Ionisation Cascade · Saha Equation · Temperature Driver" color={P.violet}/>
        <h2 style={{fontSize:22,fontWeight:700,color:P.violet,margin:"0 0 12px"}}>Live Ionisation · Neutral Gas to Plasma</h2>
        <IonizationCanvas/>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:14}}>
          <EqBlock label="SAHA EQUATION" color={P.violet}
            eq={"n_e · n_i / n_0 = (2πm_e kT / h²)^{3/2} · (g_i/g_0) · exp(−E_i/kT)\n\nFor hydrogen: g_i/g_0 = 2, E_i = 13.6 eV\n\nAt T = 5,800K (sun surface): α ≈ 10⁻⁴\nAt T = 10,000K: α ≈ 0.3\nAt T = 20,000K: α ≈ 0.99 (≈ fully ionised)\n\nDebye length: λ_D = √(ε₀kT / n_e·e²)\nPlasma frequency: ω_p = √(n_e·e² / ε₀·m_e)"}
            note="The Saha equation balances the ionisation rate (thermal photons breaking bonds) against the recombination rate (electrons captured by ions). It is the thermodynamic equilibrium condition — the plasma's own version of Le Chatelier's principle."/>
          <EqBlock label="DEBYE SHIELDING" color={P.cyan}
            eq={"A test charge Q in a plasma is shielded:\nφ(r) = (Q/4πε₀r)·exp(−r/λ_D)\n\nDebye length λ_D = √(ε₀kT/n_e·e²)\n\nFor T=10⁴K, n_e=10²⁰ m⁻³:\nλ_D = 74 μm\n\nPlasma parameter: Λ = n_e·λ_D³\nCollective behaviour if Λ >> 1\n(many particles in Debye sphere)\n\nω_p >> ω_collision → plasma-like\nω_p << ω_collision → gas-like"}
            note="The Debye length is the range of electrostatic influence inside a plasma. Beyond λ_D, free electrons rearrange to screen any charge perturbation. This is why plasmas can support collective oscillations (plasma waves) at ω_p."/>
        </div>
      </div>
      <Divider/>
      <div style={{maxWidth:1060,margin:"0 auto",padding:"0 32px 48px"}}>
        <Tag label="Section II · Plasma Emission Lines · Blue-Violet Meaning · N₂ · He · Ar · H Balmer" color={P.blue}/>
        <h2 style={{fontSize:22,fontWeight:700,color:P.blue,margin:"0 0 12px"}}>Why Plasma Glows Blue and Violet</h2>
        <PlasmaSpectrumCanvas/>
        <div style={{padding:"16px 20px",background:P.panel2,borderRadius:12,border:`1px solid ${P.violet}20`,marginBottom:24}}>
          <div style={{fontSize:13,fontWeight:700,color:P.violet,marginBottom:10}}>THE BLUE-VIOLET MEANING IN PLASMA</div>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
            {BV_MEANING.map(bv=>(
              <div key={bv.nm} style={{padding:"10px 12px",background:P.panel,borderRadius:8,border:`1px solid ${bv.col}20`}}>
                <div style={{display:"flex",gap:8,alignItems:"center",marginBottom:4}}>
                  <div style={{width:12,height:12,borderRadius:"50%",background:bv.col}}/>
                  <span style={{fontSize:10,fontWeight:700,color:bv.col}}>{bv.nm} · {bv.gas}</span>
                </div>
                <div style={{fontSize:11,color:P.dim,lineHeight:1.75}}>{bv.meaning}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
      <Divider/>
      <div style={{maxWidth:1060,margin:"0 auto",padding:"0 32px 48px"}}>
        <Tag label="Section III · Plasma Phase Space · T vs n_e · All Plasma Types" color={P.teal}/>
        <h2 style={{fontSize:22,fontWeight:700,color:P.teal,margin:"0 0 12px"}}>From Outer Space to Laser Fusion · 30 Orders of Magnitude</h2>
        <PlasmaPhaseCanvas/>
        <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(185px,1fr))",gap:12}}>
          <Card title="Solar Corona" sub="T = 1-3 MK" color={P.rose} body="Fully ionised, low density. Debye length ~10m. Collisionless. Supports Alfvén waves, plasma instabilities, magnetic reconnection. Mystery: heated from below by a cooler surface."/>
          <Card title="Lightning Channel" sub="T = 30,000 K" color={P.gold} body="High density, fully ionised N₂/O₂. Emits strongly in blue-violet (391nm N₂⁺). Channel radius ~1cm, peak current 20kA. Decays in ~1ms. Sky around channel glows blue-violet from nitrogen ion emission."/>
          <Card title="Tokamak" sub="T = 100 MK" color={P.violet} body="Magnetically confined D-T plasma at fusion temperature. Debye length ~10μm. λ >> electron Larmor radius — collective, not individual. Plasma heated by ohmic current + neutral beam injection + RF."/>
          <Card title="Glow Discharge" sub="T_e = 10,000 K, T_i = 300K" color={P.blue} body="Non-equilibrium plasma: electrons are hot, ions cold (e-i collision rate < energy transfer rate). Glows blue-violet from N₂ and Ar excitation. Used in fluorescent lamps, plasma TVs, semiconductor etching."/>
        </div>
      </div>
      <Divider/>
      <div style={{maxWidth:1060,margin:"0 auto",padding:"0 32px 48px"}}>
        <Tag label="Section IV · Source Plates" color={P.gold}/>
        <div style={{display:"flex",flexDirection:"column" as const,gap:22}}>
          {imgs.map((img,i)=>(
            <div key={i} style={{border:`1px solid ${P.line}`,borderRadius:12,overflow:"hidden"}}>
              <img src={img.src} alt={img.caption} onClick={()=>setImgX(imgX===i?null:i)}
                style={{width:"100%",display:"block",cursor:"zoom-in",maxHeight:imgX===i?"none":240,objectFit:"cover" as const,objectPosition:"top"}}/>
              <div style={{padding:"14px 18px",background:P.panel}}>
                <div style={{fontSize:11,fontWeight:700,color:P.gold,marginBottom:8}}>{img.caption}</div>
                <div style={{display:"flex",gap:5,flexWrap:"wrap",marginBottom:10}}>
                  {img.chips.map((ch,ci)=><span key={ci} style={{fontSize:10,padding:"2px 8px",borderRadius:12,border:`1px solid ${P.gold}33`,color:P.gold,background:P.gold+"0f"}}>{ch}</span>)}
                </div>
                <div style={{fontSize:12,color:P.dim,lineHeight:1.85}}>{img.anno}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
      <Divider/>
      <div style={{maxWidth:1060,margin:"0 auto",padding:"0 32px 52px"}}>
        <Tag label="AETHER Reading · Blue and Violet · The Plasma Signal"/>
        <div style={{padding:"20px 24px",background:P.panel2,borderRadius:14,border:`1px solid ${P.violet}15`,marginBottom:24}}>
          <div style={{fontSize:14,color:P.ivory,lineHeight:2.0}}>
            When matter ionises, it speaks in <em style={{color:P.violet}}>blue and violet</em>. The 391nm nitrogen line is the signature of every lightning bolt, every sprite, every coronal streamer. The 447nm helium line marks every hot star, every plasma torch, every spark. These are not arbitrary — they are the highest-energy transitions available to matter at the temperatures where electrons first break free. Blue and violet mean: <em style={{color:P.cyan}}>the system has crossed a threshold</em>. It has moved from bound to unbound, from disordered to coherent charge flow, from insulating to conducting. In AETHER: blue-violet emission is the LPE threshold event made visible. The plasma is showing you, in light, exactly when and where the phase transition occurred.
          </div>
        </div>
        <div style={{display:"flex",gap:8,flexWrap:"wrap"}}>
          {["/electric-breakdown","/cavitation-plasmoid","/color-perception","/electron-field","/aether-engine","/gobekli-plasma","/plasma-confinement"].map(href=>(
            <a key={href} href={href} style={{padding:"6px 12px",borderRadius:8,border:`1px solid ${P.line}`,color:P.dim,fontSize:11,textDecoration:"none"}}>{href.replace("/","").replace(/-/g," ")} →</a>
          ))}
        </div>
      </div>
    </div>
  );
}
