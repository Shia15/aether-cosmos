/*═══════════════════════════════════════════════════════════════
  Color Perception Interface
  How the eye-brain system constructs colour from EM wavelengths.
  Blue & violet: the meaning embedded in short-wavelength light.

  Physics:
  ── Photon energy:     E = hc/λ     (λ in nm, E in eV)
  ── CIE tristimulus:   X,Y,Z = ∫ S(λ)·x̄(λ)dλ  (colour matching)
  ── Opponent channels: L−M (red-green), S−(L+M) (blue-yellow)
  ── Hering opponent:   +B/−Y,  +R/−G  (neural channels)
  ── Rayleigh scatter:  I ∝ λ⁻⁴  (why sky is blue)
  ── Purkinje shift:    scotopic peak 507 nm vs photopic 555 nm
═══════════════════════════════════════════════════════════════*/
import { useRef, useEffect, useState } from "react";
const omniFlow = "/api/storage/public-objects/72D555D1-E91E-4B74-A73B-4628B8538AA1_1784561445345.png";
const magStorm = "/api/storage/public-objects/A6805E91-9684-4C59-BFC8-482EF421381D_1784561445345.png";
const skyrmion = "/api/storage/public-objects/IMG_4534_1784561445345.png";
const P = {
  bg:"#04020c", panel:"#080516", panel2:"#0b0720",
  ivory:"#f0eaff", dim:"rgba(240,234,255,0.55)", muted:"rgba(240,234,255,0.28)",
  line:"rgba(160,120,255,0.08)",
  violet:"#a78bfa", blue:"#818cf8", cyan:"#22d3ee",
  rose:"#f472b6", gold:"#fbbf24", green:"#4ade80",
  red:"#f87171", indigo:"#6366f1",
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

// CIE 1931 colour-matching functions (simplified Gaussian approximation)
function cmfX(nm:number){return 1.056*Math.exp(-0.5*((nm-599.8)/37.9)**2)+0.362*Math.exp(-0.5*((nm-442.0)/16.0)**2)-0.065*Math.exp(-0.5*((nm-501.1)/20.4)**2);}
function cmfY(nm:number){return 0.821*Math.exp(-0.5*((nm-568.8)/46.9)**2)+0.286*Math.exp(-0.5*((nm-530.9)/16.3)**2);}
function cmfZ(nm:number){return 1.217*Math.exp(-0.5*((nm-437.0)/11.8)**2)+0.681*Math.exp(-0.5*((nm-459.0)/26.0)**2);}
function nmToRGB(nm:number):[number,number,number]{
  const X=cmfX(nm),Y=cmfY(nm),Z=cmfZ(nm);
  let r= 3.2406*X-1.5372*Y-0.4986*Z;
  let g=-0.9689*X+1.8758*Y+0.0415*Z;
  let b= 0.0557*X-0.2040*Y+1.0570*Z;
  const mx=Math.max(r,g,b,0.001);
  r=Math.max(0,r/mx); g=Math.max(0,g/mx); b=Math.max(0,b/mx);
  const gamma=(v:number)=>v<=0.0031308?12.92*v:1.055*v**(1/2.4)-0.055;
  return [Math.round(gamma(r)*255),Math.round(gamma(g)*255),Math.round(gamma(b)*255)];
}

/* ── CANVAS 1: Spectrum + Cone Responses + Opponent Channels ── */
function SpectrumCanvas(){
  const ref=useRef<HTMLCanvasElement>(null);
  const selRef=useRef(450);
  const [sel,setSel]=useState(450);
  useEffect(()=>{selRef.current=sel;},[sel]);

  const handleClick=(e:React.MouseEvent<HTMLCanvasElement>)=>{
    const cv=ref.current;if(!cv)return;
    const rect=cv.getBoundingClientRect();
    const frac=(e.clientX-rect.left)/rect.width;
    setSel(Math.round(380+frac*(750-380)));
  };

  useEffect(()=>{
    const cv=ref.current;if(!cv)return;
    const ctx=cv.getContext("2d")!;
    let raf=0,t=0;
    const ro=new ResizeObserver(()=>{cv.width=cv.offsetWidth;cv.height=cv.offsetHeight;});
    ro.observe(cv); cv.width=cv.offsetWidth;cv.height=cv.offsetHeight;

    // Cone response approximation (L/M/S)
    const coneL=(nm:number)=>Math.exp(-0.5*((nm-565)/40)**2);
    const coneM=(nm:number)=>Math.exp(-0.5*((nm-535)/38)**2);
    const coneS=(nm:number)=>Math.exp(-0.5*((nm-425)/22)**2);

    function draw(){
      const W=cv.width,H=cv.height;
      ctx.clearRect(0,0,W,H);ctx.fillStyle=P.bg;ctx.fillRect(0,0,W,H);

      const barY=H*0.12,barH=H*0.14;
      const coneY=H*0.35,coneH=H*0.28;
      const oppY=H*0.72,oppH=H*0.22;
      const pad=24;
      const specW=W-pad*2;

      // ── Spectrum bar ────────────────────────────────────────
      for(let i=0;i<specW;i++){
        const nm=380+(i/specW)*(750-380);
        const [r,g,b]=nmToRGB(nm);
        ctx.fillStyle=`rgb(${r},${g},${b})`;
        ctx.fillRect(pad+i,barY,1,barH);
      }
      // UV glow left, IR fade right
      const uvGrd=ctx.createLinearGradient(pad,0,pad+40,0);
      uvGrd.addColorStop(0,"rgba(160,0,255,0.6)");uvGrd.addColorStop(1,"transparent");
      ctx.fillStyle=uvGrd;ctx.fillRect(pad,barY,40,barH);

      // Selected wavelength cursor
      const selNm=selRef.current;
      const selX=pad+(selNm-380)/(750-380)*specW;
      ctx.strokeStyle="rgba(255,255,255,0.9)";ctx.lineWidth=1.5;
      ctx.beginPath();ctx.moveTo(selX,barY-6);ctx.lineTo(selX,barY+barH+6);ctx.stroke();
      const [sr,sg,sb]=nmToRGB(selNm);
      const selCol=`rgb(${sr},${sg},${sb})`;
      ctx.fillStyle=selCol;ctx.beginPath();ctx.arc(selX,barY-8,4,0,Math.PI*2);ctx.fill();

      // nm labels
      ctx.fillStyle=P.muted;ctx.font="7px monospace";ctx.textAlign="center";
      [380,420,450,490,530,570,600,640,680,720,750].forEach(nm=>{
        const x=pad+(nm-380)/(750-380)*specW;
        ctx.fillText(`${nm}`,x,barY+barH+12);
      });
      ctx.textAlign="left";ctx.fillStyle=P.muted;ctx.font="bold 7px monospace";
      ctx.fillText("UV",pad,barY-2);
      ctx.textAlign="right";ctx.fillText("IR",pad+specW,barY-2);

      // ── Cone curves ─────────────────────────────────────────
      ctx.strokeStyle="rgba(200,200,255,0.1)";ctx.lineWidth=0.6;
      ctx.beginPath();ctx.moveTo(pad,coneY);ctx.lineTo(pad+specW,coneY);ctx.stroke();
      ctx.beginPath();ctx.moveTo(pad,coneY+coneH);ctx.lineTo(pad+specW,coneY+coneH);ctx.stroke();

      // S cone (blue)
      ctx.strokeStyle="#60a5fa";ctx.lineWidth=2;ctx.beginPath();
      for(let i=0;i<specW;i++){const nm=380+(i/specW)*(750-380);const y=coneY+coneH-coneS(nm)*coneH;i===0?ctx.moveTo(pad+i,y):ctx.lineTo(pad+i,y);}ctx.stroke();
      // M cone (green)
      ctx.strokeStyle="#4ade80";ctx.lineWidth=2;ctx.beginPath();
      for(let i=0;i<specW;i++){const nm=380+(i/specW)*(750-380);const y=coneY+coneH-coneM(nm)*coneH;i===0?ctx.moveTo(pad+i,y):ctx.lineTo(pad+i,y);}ctx.stroke();
      // L cone (red)
      ctx.strokeStyle="#f87171";ctx.lineWidth=2;ctx.beginPath();
      for(let i=0;i<specW;i++){const nm=380+(i/specW)*(750-380);const y=coneY+coneH-coneL(nm)*coneH;i===0?ctx.moveTo(pad+i,y):ctx.lineTo(pad+i,y);}ctx.stroke();

      // Cursor responses
      const lv=coneL(selNm),mv=coneM(selNm),sv=coneS(selNm);
      ctx.strokeStyle="rgba(255,255,255,0.5)";ctx.lineWidth=1;
      ctx.setLineDash([3,3]);
      ctx.beginPath();ctx.moveTo(selX,coneY);ctx.lineTo(selX,coneY+coneH);ctx.stroke();
      ctx.setLineDash([]);
      // Response dots
      [[lv,"#f87171"],[mv,"#4ade80"],[sv,"#60a5fa"]].forEach(([v,c])=>{
        ctx.fillStyle=c as string;
        ctx.beginPath();ctx.arc(selX,coneY+coneH-(v as number)*coneH,5,0,Math.PI*2);ctx.fill();
      });

      // Cone labels
      ctx.font="bold 7px monospace";ctx.textAlign="left";
      ctx.fillStyle="#f87171";ctx.fillText(`L(${selNm}nm)=${lv.toFixed(2)}`,pad,coneY-4);
      ctx.fillStyle="#4ade80";ctx.fillText(`M=${mv.toFixed(2)}`,pad+70,coneY-4);
      ctx.fillStyle="#60a5fa";ctx.fillText(`S=${sv.toFixed(2)}`,pad+140,coneY-4);

      // ── Opponent channels ─────────────────────────────────
      // L-M (red-green), S-(L+M)/2 (blue-yellow)
      ctx.strokeStyle="rgba(200,200,255,0.1)";ctx.lineWidth=0.6;
      ctx.beginPath();ctx.moveTo(pad,oppY+oppH/2);ctx.lineTo(pad+specW,oppY+oppH/2);ctx.stroke();

      ctx.strokeStyle=P.rose;ctx.lineWidth=1.8;ctx.beginPath();
      for(let i=0;i<specW;i++){const nm=380+(i/specW)*(750-380);const v=(coneL(nm)-coneM(nm))*0.5;const y=oppY+oppH/2-v*oppH;i===0?ctx.moveTo(pad+i,y):ctx.lineTo(pad+i,y);}ctx.stroke();
      ctx.strokeStyle=P.blue;ctx.lineWidth=1.8;ctx.beginPath();
      for(let i=0;i<specW;i++){const nm=380+(i/specW)*(750-380);const v=(coneS(nm)-(coneL(nm)+coneM(nm))*0.4)*0.6;const y=oppY+oppH/2-v*oppH;i===0?ctx.moveTo(pad+i,y):ctx.lineTo(pad+i,y);}ctx.stroke();

      const lmv=(lv-mv)*0.5,blv=(sv-(lv+mv)*0.4)*0.6;
      ctx.font="bold 7px monospace";ctx.textAlign="left";
      ctx.fillStyle=P.rose;ctx.fillText(`L−M=${lmv.toFixed(2)} (${lmv>0?"RED":"GREEN"})`,pad,oppY-4);
      ctx.fillStyle=P.blue;ctx.fillText(`S−(L+M)=${blv.toFixed(2)} (${blv>0?"BLUE":"YELLOW"})`,pad+160,oppY-4);

      // Cursor
      ctx.strokeStyle="rgba(255,255,255,0.4)";ctx.lineWidth=1;ctx.setLineDash([3,3]);
      ctx.beginPath();ctx.moveTo(selX,oppY);ctx.lineTo(selX,oppY+oppH);ctx.stroke();ctx.setLineDash([]);

      // ── Selected λ info box ──────────────────────────────
      const E=(1240/selNm).toFixed(3);
      const rayleigh=(589/selNm)**4;
      const meaning=selNm<420?"UV · spirit · beyond visible · Rayleigh-scattered by atmosphere":
        selNm<450?"VIOLET · highest photon energy · intuition · pineal sensitivity · ≈3 eV":
        selNm<495?"BLUE · sky · trust · stability · CCO absorption peak · Rayleigh dominant":
        selNm<520?"CYAN · clarity · communication · water resonance":
        selNm<565?"GREEN · growth · balance · peak photopic sensitivity":
        selNm<590?"YELLOW · warmth · caution · opponent channel boundary":
        selNm<620?"ORANGE · creativity · appetite":
        selNm<700?"RED · survival · depth penetration · lowest energy visible":"Deep NIR · beyond red · penetrates 40mm";
      ctx.fillStyle=P.panel2;ctx.fillRect(selX+8,barY+4,220,55);
      ctx.strokeStyle=selCol+"80";ctx.lineWidth=0.8;ctx.strokeRect(selX+8,barY+4,220,55);
      ctx.fillStyle=selCol;ctx.font="bold 9px monospace";ctx.textAlign="left";
      ctx.fillText(`${selNm} nm · E=${E} eV`,selX+13,barY+17);
      ctx.fillStyle=P.dim;ctx.font="7.5px monospace";
      ctx.fillText(`Rayleigh: ${rayleigh.toFixed(2)}× (vs 589nm)`,selX+13,barY+30);
      const wrapped=meaning.split(" · ");
      wrapped.forEach((w,i)=>ctx.fillText(w,selX+13,barY+42+i*10));

      // Title
      ctx.fillStyle=P.violet;ctx.font="bold 8px monospace";ctx.textAlign="left";
      ctx.fillText("COLOR PERCEPTION INTERFACE · CLICK SPECTRUM TO SELECT WAVELENGTH",8,14);
      ctx.fillStyle=P.muted;ctx.font="7px monospace";
      ctx.fillText("TOP: visible spectrum · MIDDLE: L/M/S cone responses · BOTTOM: opponent channels (L−M red-green · S−LM blue-yellow)",8,H-6);

      t++;raf=requestAnimationFrame(draw);
    }
    draw();
    return()=>{cancelAnimationFrame(raf);ro.disconnect();};
  },[]);

  return(
    <div style={{border:`1px solid ${P.line}`,borderRadius:12,overflow:"hidden",marginBottom:28}}>
      <canvas ref={ref} onClick={handleClick} style={{width:"100%",height:420,display:"block",cursor:"crosshair"}}/>
      <div style={{padding:"8px 16px",background:P.panel,fontSize:11,color:P.dim,lineHeight:1.8}}>
        <strong style={{color:P.violet}}>Click anywhere on the spectrum</strong> to select that wavelength. See its photon energy, L/M/S cone activation, opponent-channel sign (red-green, blue-yellow), Rayleigh scattering strength, and meaning.
      </div>
    </div>
  );
}

/* ── CANVAS 2: Blue/Violet Deep Dive — retinal + brain + meaning ── */
function BlueVioletCanvas(){
  const ref=useRef<HTMLCanvasElement>(null);
  useEffect(()=>{
    const cv=ref.current;if(!cv)return;
    const ctx=cv.getContext("2d")!;
    let raf=0,t=0;
    const ro=new ResizeObserver(()=>{cv.width=cv.offsetWidth;cv.height=cv.offsetHeight;});
    ro.observe(cv);cv.width=cv.offsetWidth;cv.height=cv.offsetHeight;

    // Key wavelengths and their meanings
    const BANDS=[
      {nm:405,label:"405nm",title:"Violet-UV",col:"#c084fc",meaning:"Pineal melatonin suppression peak · retinal ipRGC · circadian driver · 'spirit' channel in ancient colour systems · highest visible photon energy E=3.06 eV"},
      {nm:430,label:"430nm",title:"Deep Violet",col:"#a78bfa",meaning:"S-cone peak 425nm · opponent blue-yellow channel maximum · ancient indigo/violet = truth, mystery · blue-light hazard (HIIT 430nm). Rayleigh ×2.9 vs green"},
      {nm:450,label:"Blue-Violet",title:"Blue-Violet",col:"#818cf8",meaning:"Cytochrome c oxidase minor absorption band · melanopsin (ipRGC) 480nm peak nearby · blue = trust/reliability (cross-cultural universal). Sky Rayleigh."},
      {nm:480,label:"480nm",title:"Sky Blue",col:"#60a5fa",meaning:"Melanopsin (intrinsically photosensitive RGC) peak · controls pupil, circadian, mood · melatonin suppression · alertness · Cherenkov radiation blue (charged particle faster than c/n)"},
      {nm:495,label:"495nm",title:"Cyan-Blue",col:"#22d3ee",meaning:"Water absorption minimum · maximum ocean penetration depth · bioluminescent organisms peak emission · blue-green algae photosynthesis · calm, clarity, communication"},
    ];

    // Rayleigh data to draw
    function rayleigh(nm:number){return (589/nm)**4;}

    function draw(){
      const W=cv.width,H=cv.height;
      ctx.clearRect(0,0,W,H);ctx.fillStyle=P.bg;ctx.fillRect(0,0,W,H);

      const N=BANDS.length;
      const colW=W/N;

      BANDS.forEach((band,i)=>{
        const x=i*colW,w=colW;
        const [r,g,b]=nmToRGB(band.nm);

        // Background glow
        const grd=ctx.createLinearGradient(x,0,x,H);
        grd.addColorStop(0,`rgba(${r},${g},${b},0.18)`);
        grd.addColorStop(1,"transparent");
        ctx.fillStyle=grd;ctx.fillRect(x,0,w,H);

        // Vertical separator
        if(i>0){ctx.strokeStyle="rgba(255,255,255,0.06)";ctx.lineWidth=0.5;ctx.beginPath();ctx.moveTo(x,0);ctx.lineTo(x,H);ctx.stroke();}

        // Wavelength pill
        ctx.fillStyle=band.col+"cc";ctx.beginPath();
        ctx.roundRect(x+w/2-28,12,56,18,9);ctx.fill();
        ctx.fillStyle="#fff";ctx.font="bold 8px monospace";ctx.textAlign="center";
        ctx.fillText(band.label,x+w/2,24);

        // Pulsing circle
        const pulse=0.8+0.2*Math.sin(t*0.04+i*1.2);
        const grd2=ctx.createRadialGradient(x+w/2,H*0.22,0,x+w/2,H*0.22,28*pulse);
        grd2.addColorStop(0,band.col+"cc");grd2.addColorStop(1,band.col+"00");
        ctx.fillStyle=grd2;ctx.beginPath();ctx.arc(x+w/2,H*0.22,28*pulse,0,Math.PI*2);ctx.fill();

        // Title
        ctx.fillStyle=band.col;ctx.font="bold 9px monospace";ctx.textAlign="center";
        ctx.fillText(band.title,x+w/2,H*0.38);

        // Rayleigh bar
        const ry=rayleigh(band.nm);
        const barMaxH=H*0.12,barW=w*0.55;
        const barH=Math.min(barMaxH,ry/5*barMaxH);
        ctx.fillStyle=band.col+"44";ctx.fillRect(x+w/2-barW/2,H*0.44,barW,barMaxH);
        ctx.fillStyle=band.col+"cc";ctx.fillRect(x+w/2-barW/2,H*0.44+barMaxH-barH,barW,barH);
        ctx.fillStyle=band.col;ctx.font="bold 7px monospace";ctx.textAlign="center";
        ctx.fillText(`Rayleigh ${ry.toFixed(1)}×`,x+w/2,H*0.44+barMaxH+10);

        // Meaning text (word-wrapped)
        const words=band.meaning.split(" · ");
        ctx.fillStyle=P.dim;ctx.font="6.5px monospace";ctx.textAlign="center";
        words.forEach((word,wi)=>{
          // wrap at 20 chars
          const lineH=9,startY=H*0.62+wi*lineH;
          if(startY<H-12)ctx.fillText(word.length>22?word.slice(0,21)+"…":word,x+w/2,startY);
        });
      });

      // Title
      ctx.fillStyle=P.violet;ctx.font="bold 8px monospace";ctx.textAlign="left";
      ctx.fillText("BLUE & VIOLET DEEP DIVE · 405–495nm · PHOTON ENERGY · RAYLEIGH SCATTER · BIOLOGICAL MEANING",8,14);

      t++;raf=requestAnimationFrame(draw);
    }
    draw();
    return()=>{cancelAnimationFrame(raf);ro.disconnect();};
  },[]);
  return(
    <div style={{border:`1px solid ${P.line}`,borderRadius:12,overflow:"hidden",marginBottom:28}}>
      <canvas ref={ref} style={{width:"100%",height:400,display:"block"}}/>
      <div style={{padding:"8px 16px",background:P.panel,fontSize:11,color:P.dim,lineHeight:1.8}}>
        Blue and violet carry the highest photon energy in the visible range — each photon can activate more molecular transitions. Rayleigh scattering scales as λ⁻⁴: 405 nm scatters 2.9× more than 495 nm. The sky is blue because atmosphere preferentially scatters short wavelengths back to your eyes. Bars show relative Rayleigh scattering intensity.
      </div>
    </div>
  );
}

/* ── CANVAS 3: Full colour wheel + perceptual space ── */
function ColourWheelCanvas(){
  const ref=useRef<HTMLCanvasElement>(null);
  useEffect(()=>{
    const cv=ref.current;if(!cv)return;
    const ctx=cv.getContext("2d")!;
    let raf=0,t=0;
    const ro=new ResizeObserver(()=>{cv.width=cv.offsetWidth;cv.height=cv.offsetHeight;});
    ro.observe(cv);cv.width=cv.offsetWidth;cv.height=cv.offsetHeight;

    function draw(){
      const W=cv.width,H=cv.height;
      ctx.clearRect(0,0,W,H);ctx.fillStyle=P.bg;ctx.fillRect(0,0,W,H);

      const cx=W*0.35,cy=H*0.50,R=Math.min(W*0.28,H*0.42);

      // ── Spectral locus + colour wheel ───────────────────
      // Perceptual hue from nm (non-linear)
      function nmToHue(nm:number){
        if(nm<380)return 270;
        if(nm>750)return 0;
        const t=(nm-380)/(750-380);
        // Spectral locus mapped to hue: violet(270)→blue(240)→cyan(180)→green(120)→yellow(60)→red(0)
        return 270-t*270;
      }
      // Draw spectral locus arc
      const STEP=2;
      for(let nm=380;nm<750;nm+=STEP){
        const h1=nmToHue(nm),h2=nmToHue(nm+STEP);
        const a1=(h1-90)*Math.PI/180,a2=(h2-90)*Math.PI/180;
        const [r,g,b]=nmToRGB(nm);
        ctx.strokeStyle=`rgb(${r},${g},${b})`;ctx.lineWidth=6;
        ctx.beginPath();ctx.arc(cx,cy,R,a1,a2);ctx.stroke();
      }
      // Purple line (non-spectral)
      ctx.strokeStyle="rgba(180,60,220,0.7)";ctx.lineWidth=2;ctx.setLineDash([4,4]);
      ctx.beginPath();
      const a380=(nmToHue(380)-90)*Math.PI/180,a750=(nmToHue(750)-90)*Math.PI/180;
      ctx.moveTo(cx+R*Math.cos(a380),cy+R*Math.sin(a380));
      ctx.lineTo(cx+R*Math.cos(a750),cy+R*Math.sin(a750));ctx.stroke();ctx.setLineDash([]);
      // "Purple" label
      ctx.fillStyle="rgba(180,60,220,0.9)";ctx.font="7px monospace";ctx.textAlign="center";
      ctx.fillText("non-spectral purples",cx,cy+R*0.55);

      // White point D65
      const pulse=0.9+0.1*Math.sin(t*0.05);
      ctx.fillStyle="rgba(255,255,255,0.9)";ctx.beginPath();ctx.arc(cx,cy,8*pulse,0,Math.PI*2);ctx.fill();
      ctx.fillStyle=P.muted;ctx.font="7px monospace";ctx.textAlign="center";ctx.fillText("D65 white",cx,cy+18);

      // Wavelength labels
      [[380,"VIOLET",270],[450,"BLUE",240],[495,"CYAN",195],[530,"GREEN",138],[570,"YEL",80],[620,"ORA",40],[680,"RED",10]].forEach(([nm,lbl,hue])=>{
        const ang=(hue as number-90)*Math.PI/180;
        const lx=cx+(R+18)*Math.cos(ang),ly=cy+(R+18)*Math.sin(ang);
        const [r,g,b]=nmToRGB(nm as number);
        ctx.fillStyle=`rgb(${r},${g},${b})`;ctx.font="bold 7px monospace";ctx.textAlign="center";
        ctx.fillText(`${lbl}\n${nm}nm`,lx,ly);
      });

      // Blue/violet arcs highlighted
      const blueStart=(240-90)*Math.PI/180,blueEnd=(270-90)*Math.PI/180;
      ctx.strokeStyle="rgba(160,140,255,0.4)";ctx.lineWidth=12;
      ctx.beginPath();ctx.arc(cx,cy,R+16,blueStart,blueEnd);ctx.stroke();
      ctx.fillStyle=P.violet;ctx.font="bold 7px monospace";ctx.textAlign="center";
      ctx.fillText("BLUE–VIOLET",cx+(R+28)*Math.cos((255-90)*Math.PI/180),cy+(R+28)*Math.sin((255-90)*Math.PI/180)+3);

      // ── Right panel: information / frequency strip ──────
      const rX=W*0.64,rW=W*0.33;
      const ENTRY=[
        {label:"Highest energy visible",col:P.violet,val:"3.1 eV (400nm)"},
        {label:"S-cone (blue) peak",col:"#60a5fa",val:"425 nm"},
        {label:"Melanopsin ipRGC peak",col:"#818cf8",val:"480 nm"},
        {label:"Rayleigh scatter (vs 589nm)",col:"#a78bfa",val:"λ⁻⁴ → 2.9× at 430nm"},
        {label:"Purkinje shift",col:P.cyan,val:"555→507nm (dark adapt)"},
        {label:"Cherenkov radiation",col:"#60a5fa",val:"Blue glow in reactors"},
        {label:"Bioluminescence",col:"#22d3ee",val:"480nm (marine, deep)"},
        {label:"Pineal response",col:P.violet,val:"~480nm melatonin gate"},
        {label:"Blue-yellow opponent",col:"#fbbf24",val:"S−(L+M)/2 channel"},
        {label:"Violet meaning",col:"#c084fc",val:"Vision beyond visible · spirit"},
      ];
      ENTRY.forEach((e,i)=>{
        const ey=H*0.08+i*(H*0.086);
        const pulse2=0.7+0.3*Math.sin(t*0.03+i*0.8);
        ctx.fillStyle=e.col+Math.round(pulse2*30).toString(16).padStart(2,"0");
        ctx.fillRect(rX,ey,rW,H*0.076);
        ctx.strokeStyle=e.col+"30";ctx.lineWidth=0.6;ctx.strokeRect(rX,ey,rW,H*0.076);
        ctx.fillStyle=e.col;ctx.font="bold 7px monospace";ctx.textAlign="left";
        ctx.fillText(e.label,rX+6,ey+12);
        ctx.fillStyle=P.dim;ctx.font="8px monospace";
        ctx.fillText(e.val,rX+6,ey+24);
      });

      ctx.fillStyle=P.violet;ctx.font="bold 8px monospace";ctx.textAlign="left";
      ctx.fillText("COLOUR WHEEL · CIE SPECTRAL LOCUS · PERCEPTUAL INTERFACE",8,14);
      t++;raf=requestAnimationFrame(draw);
    }
    draw();
    return()=>{cancelAnimationFrame(raf);ro.disconnect();};
  },[]);
  return(
    <div style={{border:`1px solid ${P.line}`,borderRadius:12,overflow:"hidden",marginBottom:28}}>
      <canvas ref={ref} style={{width:"100%",height:440,display:"block"}}/>
    </div>
  );
}

export default function ColorPerceptionPage(){
  const [imgX,setImgX]=useState<number|null>(null);
  const imgs=[
    {src:skyrmion,caption:"Topological Spin Texture · Colour as Angular Momentum",
     anno:"The eye-brain colour system is fundamentally a measurement of photon angular momentum. Circular polarisation (spin ±ℏ) affects which retinal photopigment transitions are accessed. Rhodopsin, the 11-cis retinal chromophore, has a specific absorption cross-section for left-vs-right circular polarisation. The skyrmion texture shown here is the spatial analogue of this: a topologically stable vortex in a spin field, exactly as colour qualia are topologically stable perceptual objects — no continuous transformation of EM parameters maps green into red without passing through all intermediate colours.",
     chips:["Circular Polarisation","Photon Angular Momentum","Rhodopsin Chromophore","Topological Colour Space","11-cis Retinal","Spin ±ℏ"]},
    {src:magStorm,caption:"Solar Chromosphere · Where Colour Carries Energy",
     anno:"Solar chromospheric light is where the colour spectrum encodes plasma temperature. The chromosphere emits at specific wavelengths because hydrogen, helium, and calcium ions each have fixed energy-level transitions. H-alpha at 656 nm (red), Ca II H+K at 397/393 nm (deep violet), He II at 304 nm (UV). The blue-violet light from the chromosphere carries the highest photon energy — enough to ionise hydrogen (13.6 eV) when concentrated. In the eye, these same short wavelengths push cytochrome c oxidase into its highest activation state and stimulate melanopsin-driven pupillary constriction. The sun is teaching the same lesson the retina knows: blue means high energy, high information, high state-change potential.",
     chips:["H-alpha 656nm","Ca II K 393nm","Chromospheric Emission","Melanopsin","Blue Means High Energy","Ionisation 13.6eV"]},
    {src:omniFlow,caption:"Omni-Sensing Array · The Retina as Field Detector",
     anno:"The human retina is a distributed phased-array detector — 6 million cone cells and 120 million rod cells, each sampling a tiny solid angle, feeding a massively parallel neural network (the retina's own 10 layers of neural processing) before the signal even reaches the optic nerve. The omni-flow rhombic grid is the direct analogue: each rhombus cell is one cone, sampling colour, intensity, and phase simultaneously. The retina does something no camera does: it subtracts the mean luminance in real time (adaptation), computes local contrast, and encodes opponent-channel differences rather than absolute values. The result is a colour experience that is invariant to illuminant (colour constancy), just as AETHER's coherence field C(x,t) is invariant to the source — it represents the field relationship, not the absolute field.",
     chips:["6M Cones","120M Rods","Opponent Coding","Colour Constancy","Retinal Adaptation","Phased Array"]},
  ];
  return(
    <div style={{background:P.bg,color:P.ivory,minHeight:"100vh",fontFamily:"inherit"}}>
      <div style={{maxWidth:1060,margin:"0 auto",padding:"52px 32px 36px"}}>
        <Tag label="Color Perception Interface · Eye-Brain · Cone Responses · Opponent Channels · Blue-Violet Meaning · Rayleigh · Melanopsin"/>
        <h1 style={{fontSize:34,fontWeight:800,lineHeight:1.1,margin:"8px 0 14px",letterSpacing:-0.5}}>
          <span style={{color:P.violet}}>Colour</span> is the Brain's Interface<br/>
          <span style={{color:P.blue}}>to the Electromagnetic</span> <span style={{color:P.cyan}}>Field</span>
        </h1>
        <h2 style={{fontSize:18,fontWeight:400,color:"#c4b5fd",margin:"0 0 18px",lineHeight:1.5}}>
          The eye does not see wavelengths — it computes differences · three cones generate an infinite perceptual space · blue and violet sit at the energetic edge of visibility
        </h2>
        <p style={{fontSize:14,color:P.dim,lineHeight:1.9,maxWidth:780,marginBottom:20}}>
          Visible light spans 380–750 nm. But the eye never measures wavelength directly — three cone types (L, M, S) each absorb a broad range, and the brain computes ratios: L−M encodes red-green, S−(L+M) encodes blue-yellow. Blue and violet are special: they carry the highest photon energy in the visible range (E = hc/λ, so 400 nm ≈ 3.1 eV vs 700 nm ≈ 1.8 eV), they trigger the most Rayleigh scattering (why sky is blue), and they uniquely activate the non-image-forming photoreceptors (ipRGC, melanopsin) that drive circadian rhythm, melatonin suppression, and mood.
        </p>
      </div>
      <Divider/>
      <div style={{maxWidth:1060,margin:"0 auto",padding:"0 32px 48px"}}>
        <Tag label="Section I · Spectrum Interface · Click to Select Wavelength · Cone Responses · Opponent Channels" color={P.violet}/>
        <h2 style={{fontSize:22,fontWeight:700,color:P.violet,margin:"0 0 12px"}}>Interactive Spectrum · L/M/S Cones · Opponent Channels</h2>
        <SpectrumCanvas/>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:14}}>
          <Card title="CIE Tristimulus" sub="colour matching" color={P.violet}
            body="Any colour can be matched by three primaries because humans have three cone types. The CIE 1931 colour space maps every visible colour to an (X,Y,Z) triplet — XYZ are the integrals of the spectrum weighted by the colour-matching functions x̄, ȳ, z̄. No real primary set spans the entire spectral locus — that is why sRGB cannot display all visible colours."/>
          <Card title="Opponent Channels" sub="Hering 1874" color={P.blue}
            body="The retina and LGN compute L−M (red vs green) and S−(L+M) (blue vs yellow). These two axes are perceptually independent: you cannot see a reddish-green or a bluish-yellow. The opponent channels are why complementary colours (red+green, blue+yellow) produce maximum contrast — they push the two channels in opposite directions simultaneously."/>
          <Card title="Melanopsin / ipRGC" sub="circadian photoreceptor" color={P.indigo}
            body="A third photoreceptor class (intrinsically photosensitive retinal ganglion cells, ipRGC) peaks at 480 nm. They do not form images — they drive pupil constriction, melatonin suppression (pineal gland), and the circadian clock (SCN). Blue light at 480 nm is therefore both a colour signal AND a biological time signal."/>
          <Card title="Blue-Violet Meaning" sub="chromatic + biological" color="#c084fc"
            body="Blue and violet trigger the S cone maximally, push the blue-yellow opponent channel positive, and suppress melatonin via ipRGC. In every culture independently, blue = trust, stability, the sky. Violet = the edge of the visible, spiritual, truth. The physics underpins the meaning: highest energy, highest scatter, most 'heavenly' (the sky is the Rayleigh scatter of violet/blue)."/>
        </div>
      </div>
      <Divider/>
      <div style={{maxWidth:1060,margin:"0 auto",padding:"0 32px 48px"}}>
        <Tag label="Section II · Blue-Violet Deep Dive · 405–495nm · Rayleigh · Melanopsin · Meaning" color={P.blue}/>
        <h2 style={{fontSize:22,fontWeight:700,color:P.blue,margin:"0 0 12px"}}>The Five Faces of Blue · 405 to 495 nm</h2>
        <BlueVioletCanvas/>
      </div>
      <Divider/>
      <div style={{maxWidth:1060,margin:"0 auto",padding:"0 32px 48px"}}>
        <Tag label="Section III · CIE Chromaticity · Spectral Locus · Perceptual Colour Space" color={P.cyan}/>
        <h2 style={{fontSize:22,fontWeight:700,color:P.cyan,margin:"0 0 12px"}}>Colour Wheel · Spectral Locus · Non-Spectral Purples</h2>
        <ColourWheelCanvas/>
        <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(190px,1fr))",gap:12}}>
          <Card title="Spectral Locus" sub="cie boundary" color={P.cyan} body="The spectral locus is the boundary of all visible colours in the CIE diagram — each point is a pure monochromatic wavelength. All physically realisable colours lie inside the locus. The curved top is the blue-violet edge; the straight bottom is the 'purple line' — non-spectral purples that require a mix of red + violet."/>
          <Card title="White D65" sub="standard illuminant" color={P.ivory} body="D65 represents average daylight at 6500 K. All colours are perceived relative to the ambient white — this is colour constancy. The brain computes colour from ratios, not absolutes, so a white paper looks white whether illuminated by 3000K incandescent or 6500K daylight."/>
          <Card title="Rayleigh λ⁻⁴" sub="atmospheric scatter" color={P.blue} body="Rayleigh scattering intensity scales as λ⁻⁴. At 400 nm (violet), scatter is (589/400)⁴ = 4.7× stronger than at 589 nm (sodium yellow). The sky is blue rather than violet only because the sun emits more blue photons than violet, and because violet is partly absorbed by the ozone layer."/>
          <Card title="Purkinje Shift" sub="rod vs cone peak" color={P.green} body="In bright light, peak sensitivity is 555 nm (green, cone-dominated). In dim light, rods dominate with peak at 507 nm. This is why blue objects appear brighter than red objects at dusk — rods are more sensitive to short wavelengths. Van Gogh's Starry Night is visible evidence: the blue-white swirls glow at night."/>
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
        <Tag label="Section V · AETHER Reading"/>
        <div style={{padding:"20px 24px",background:P.panel2,borderRadius:14,border:`1px solid ${P.violet}15`,marginBottom:24}}>
          <div style={{fontSize:14,color:P.ivory,lineHeight:2.0}}>
            Colour is not in the light. It is the brain's <em style={{color:P.violet}}>interface</em> to the electromagnetic field — a computed relationship, not a measurement. Blue and violet sit at the energetic boundary of what the eye can transduce. They carry the highest photon energy. They trigger the most scattering (the sky is built from them). They activate the non-image-forming biological clocks (melanopsin). In AETHER, they represent the coherence edge: the frequencies where matter most strongly notices the field, where a single photon can change a conformational state, suppress a hormone, or shift a circadian oscillator. Blue is not decoration. Blue is the signature of high-energy information arriving at a biological interface.
          </div>
        </div>
        <div style={{display:"flex",gap:8,flexWrap:"wrap"}}>
          {["/larmor-field","/laser-regen","/electron-field","/bioluminescence-spectrum","/chromatic-glare","/color-cosmology","/nutritional-dna-key","/wave-collapse"].map(href=>(
            <a key={href} href={href} style={{padding:"6px 12px",borderRadius:8,border:`1px solid ${P.line}`,color:P.dim,fontSize:11,textDecoration:"none"}}>{href.replace("/","").replace(/-/g," ")} →</a>
          ))}
        </div>
      </div>
    </div>
  );
}
