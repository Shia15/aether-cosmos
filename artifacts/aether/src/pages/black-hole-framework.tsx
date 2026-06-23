import { useEffect, useRef, useState } from "react";

const BG   = "#030408";
const TEAL = "#1fd4c8";
const GOLD = "#c9a84c";
const VIO  = "#8b5cf6";
const GRN  = "#22c55e";
const PINK = "#ec4899";
const BLUE = "#3b82f6";
const RED  = "#ef4444";
const ORG  = "#f97316";
const DIM  = "#2a3550";
const MN   = "'Space Mono',monospace";
const OR   = "'Orbitron',sans-serif";

function ha(hex: string, a: number) {
  const r=parseInt(hex.slice(1,3),16), g=parseInt(hex.slice(3,5),16), b=parseInt(hex.slice(5,7),16);
  return `rgba(${r},${g},${b},${a.toFixed(2)})`;
}
function lerp(a:number,b:number,t:number){return a+(b-a)*t;}

function Slider({label,value,min,max,step,unit,col=TEAL,decimals=2,onChange}:{
  label:string;value:number;min:number;max:number;step:number;unit:string;
  col?:string;decimals?:number;onChange:(v:number)=>void;
}) {
  return (
    <div style={{marginBottom:8}}>
      <div style={{display:"flex",justifyContent:"space-between",marginBottom:3}}>
        <span style={{fontFamily:MN,fontSize:11,color:"rgba(180,200,230,0.65)"}}>{label}</span>
        <span style={{fontFamily:MN,fontSize:11,color:col}}>{value.toFixed(decimals)}{unit}</span>
      </div>
      <input type="range" min={min} max={max} step={step} value={value}
        onChange={e=>onChange(Number(e.target.value))}
        style={{width:"100%",accentColor:col,cursor:"pointer",height:4}}/>
    </div>
  );
}
function EqChip({eq,col}:{eq:string;col:string}) {
  return <div style={{display:"inline-block",fontFamily:MN,fontSize:11,
    background:ha(col,0.08),border:`1px solid ${ha(col,0.30)}`,
    color:col,padding:"3px 10px",borderRadius:3,marginRight:6,marginBottom:4}}>{eq}</div>;
}

export default function BlackHoleFrameworkPage() {
  const schRef  = useRef<HTMLCanvasElement>(null);
  const kerrRef = useRef<HTMLCanvasElement>(null);
  const hawkRef = useRef<HTMLCanvasElement>(null);
  const bekRef  = useRef<HTMLCanvasElement>(null);
  const infoRef = useRef<HTMLCanvasElement>(null);
  const goldRef = useRef<HTMLCanvasElement>(null);
  const animRef = useRef(0);

  // Schwarzschild
  const [bhMass, setBhMass] = useState(3.0);
  const [angMom, setAngMom] = useState(3.8);
  // Kerr
  const [spin, setSpin]   = useState(0.60);
  // Hawking
  const [hawkM, setHawkM] = useState(1.0);
  // Bekenstein
  const [bekM, setBekM]   = useState(1.0);
  // Info Paradox
  const [tPage, setTPage] = useState(0.50);
  // Golden
  const [phi, _]          = useState(1.6180339887);

  const rBhM = useRef(bhMass); useEffect(()=>{rBhM.current=bhMass;},[bhMass]);
  const rAng  = useRef(angMom); useEffect(()=>{rAng.current=angMom;},[angMom]);
  const rSpin = useRef(spin);  useEffect(()=>{rSpin.current=spin;},[spin]);
  const rHM   = useRef(hawkM); useEffect(()=>{rHM.current=hawkM;},[hawkM]);
  const rBM   = useRef(bekM);  useEffect(()=>{rBM.current=bekM;},[bekM]);
  const rTP   = useRef(tPage); useEffect(()=>{rTP.current=tPage;},[tPage]);

  useEffect(()=>{
    const cs=[schRef.current,kerrRef.current,hawkRef.current,bekRef.current,infoRef.current,goldRef.current];
    if(cs.some(c=>!c))return;
    const [cSch,cKerr,cHawk,cBek,cInfo,cGold]=cs as HTMLCanvasElement[];
    const [xS,xK,xH,xB,xI,xG]=cs.map(c=>(c as HTMLCanvasElement).getContext("2d")!);
    let t=0;

    /* ── grid helper ── */
    function grid(ctx:CanvasRenderingContext2D,pl:number,pt:number,pw:number,ph:number,col:string,xN=5,yN=4){
      ctx.save(); ctx.setLineDash([3,5]); ctx.strokeStyle=ha(col,0.08); ctx.lineWidth=1;
      for(let i=0;i<=xN;i++){const x=pl+i/xN*pw;ctx.beginPath();ctx.moveTo(x,pt);ctx.lineTo(x,pt+ph);ctx.stroke();}
      for(let i=0;i<=yN;i++){const y=pt+i/yN*ph;ctx.beginPath();ctx.moveTo(pl,y);ctx.lineTo(pl+pw,y);ctx.stroke();}
      ctx.restore();
    }

    /* ════════════ I SCHWARZSCHILD ════════════ */
    function drawSch(){
      const W=cSch.width,H=cSch.height;
      const Lv=rAng.current;
      xS.fillStyle="#040810";xS.fillRect(0,0,W,H);
      const pl=80,pr=30,pt=50,pb=64;
      const pw=W-pl-pr,ph=H-pt-pb;
      const rMin=1.5,rMax=28;
      const Vmin=0,Vmax=1.35;
      const gx=(r:number)=>pl+(r-rMin)/(rMax-rMin)*pw;
      const gy=(V:number)=>pt+ph-(V-Vmin)/(Vmax-Vmin)*ph;
      const veff=(r:number)=>{
        if(r<=2)return 0;
        const L2=Lv*Lv;
        return Math.sqrt(Math.max(0,(1-2/r)*(1+L2/(r*r))));
      };
      grid(xS,pl,pt,pw,ph,TEAL);

      // Event horizon shaded region
      xS.fillStyle="rgba(239,68,68,0.07)";xS.fillRect(pl,pt,gx(2)-pl,ph);
      xS.strokeStyle=ha(RED,0.45);xS.lineWidth=1.5;
      xS.beginPath();xS.moveTo(gx(2),pt);xS.lineTo(gx(2),pt+ph);xS.stroke();

      // Photon sphere r=3M
      xS.save();xS.setLineDash([5,4]);xS.strokeStyle=ha(GOLD,0.38);xS.lineWidth=1;
      xS.beginPath();xS.moveTo(gx(3),pt);xS.lineTo(gx(3),pt+ph);xS.stroke();xS.restore();
      // ISCO r=6M
      xS.save();xS.setLineDash([5,4]);xS.strokeStyle=ha(TEAL,0.38);xS.lineWidth=1;
      xS.beginPath();xS.moveTo(gx(6),pt);xS.lineTo(gx(6),pt+ph);xS.stroke();xS.restore();

      // Axis labels
      ["2","3","6","9","15","25"].forEach(v=>{
        const r=Number(v); const x=gx(r);
        if(x<pl||x>pl+pw)return;
        xS.fillStyle=ha("#b0c8e8",0.45);xS.font=`13px ${MN}`;xS.textAlign="center";
        xS.fillText(`${v}M`,x,pt+ph+18);
      });
      [0.2,0.4,0.6,0.8,1.0,1.2].forEach(v=>{
        xS.fillStyle=ha("#b0c8e8",0.4);xS.font=`13px ${MN}`;xS.textAlign="right";
        xS.fillText(v.toFixed(1),pl-7,gy(v)+5);
      });

      // Massive particle V_eff curve
      xS.beginPath();xS.strokeStyle=TEAL;xS.lineWidth=2.5;xS.shadowColor=TEAL;xS.shadowBlur=8;
      let first=true;
      for(let px=0;px<=pw;px+=2){
        const r=rMin+(px/pw)*(rMax-rMin);
        const V=veff(r);
        if(V<=0||V>Vmax){first=true;continue;}
        if(first){xS.moveTo(pl+px,gy(V));first=false;}else xS.lineTo(pl+px,gy(V));
      }
      xS.stroke();xS.shadowBlur=0;

      // Null geodesic V_eff (L/r, approximate)
      xS.beginPath();xS.strokeStyle=ha(GOLD,0.5);xS.lineWidth=1.5;xS.setLineDash([4,4]);
      first=true;
      for(let px=0;px<=pw;px+=2){
        const r=rMin+(px/pw)*(rMax-rMin);
        const V=r<=2?0:(Lv/r)*Math.sqrt(Math.max(0,1-2/r));
        const Vn=V/Lv; // normalize
        if(Vn<=0||Vn>Vmax){first=true;continue;}
        if(first){xS.moveTo(pl+px,gy(Vn));first=false;}else xS.lineTo(pl+px,gy(Vn));
      }
      xS.stroke();xS.setLineDash([]);

      // Energy level
      const Elevel=0.955;
      xS.strokeStyle=ha(ORG,0.45);xS.lineWidth=1.2;xS.setLineDash([5,4]);
      xS.beginPath();xS.moveTo(pl,gy(Elevel));xS.lineTo(pl+pw,gy(Elevel));xS.stroke();xS.setLineDash([]);
      xS.fillStyle=ha(ORG,0.55);xS.font=`11px ${MN}`;xS.textAlign="right";
      xS.fillText(`E/μ=${Elevel}`,pl+pw,gy(Elevel)-5);

      // Animated orbiting particle
      // find turning points
      let innerR=6,outerR=20;
      for(let ri=30;ri<280;ri++){const r=ri/10;if(veff(r)>Elevel&&veff(r-0.1)<=Elevel&&r>2.5)innerR=r;}
      for(let ri=60;ri<280;ri++){const r=ri/10;if(veff(r)<Elevel&&veff(r-0.1)>=Elevel&&r>6)outerR=r;}
      const phase=(t*0.007)%1;
      const orbitR=phase<0.5?lerp(innerR,outerR,phase*2):lerp(outerR,innerR,(phase-0.5)*2);
      const Vop=veff(orbitR);
      if(Vop>0&&Vop<=Vmax){
        xS.save();xS.shadowColor=GOLD;xS.shadowBlur=18;xS.fillStyle=GOLD;
        xS.beginPath();xS.arc(gx(orbitR),gy(Vop),6,0,Math.PI*2);xS.fill();xS.shadowBlur=0;xS.restore();
      }

      // Light cones at r=4,8,14 showing tilting
      [4,8,14].forEach(r=>{
        if(r>=rMax)return;
        const cx=gx(r),cy=gy(veff(r));
        const tilt=2/(r); // tilt ∝ 1/r near horizon
        const coneH=ph*0.06;
        xS.save();xS.strokeStyle=ha("#60a5fa",0.4);xS.lineWidth=1;
        const dx1=coneH*(tilt+0.3),dx2=-coneH*(0.3-tilt*0.5);
        xS.beginPath();xS.moveTo(cx,cy);xS.lineTo(cx+dx1,cy-coneH);
        xS.moveTo(cx,cy);xS.lineTo(cx+dx2,cy-coneH);xS.stroke();xS.restore();
      });

      // Labels on plot
      xS.fillStyle=ha(RED,0.5);xS.font=`11px ${MN}`;xS.textAlign="center";xS.fillText("r_s=2M",gx(2),pt+ph+32);
      xS.fillStyle=ha(GOLD,0.5);xS.fillText("γ·sph 3M",gx(3),pt+ph+44);
      xS.fillStyle=ha(TEAL,0.5);xS.fillText("ISCO 6M",gx(6),pt+ph+32);

      // Axis titles
      xS.fillStyle=TEAL;xS.font=`15px ${MN}`;xS.textAlign="center";
      xS.fillText("Radial coordinate  r/M",pl+pw/2,pt+ph+56);
      xS.save();xS.translate(22,pt+ph/2);xS.rotate(-Math.PI/2);xS.fillText("V_eff (E/μ)",0,0);xS.restore();

      // Readout
      xS.fillStyle=TEAL;xS.font=`bold 14px ${MN}`;xS.textAlign="left";
      xS.fillText(`L=${Lv.toFixed(2)}M  ·  r_ISCO=${innerR.toFixed(1)}M  ·  E/μ=${Elevel.toFixed(3)}`,pl,pt+ph+46);

      // Title
      xS.font=`bold 20px ${OR}`;xS.fillStyle=TEAL;xS.shadowColor=TEAL;xS.shadowBlur=10;
      xS.fillText("I · Schwarzschild · Effective Potential",pl,34);xS.shadowBlur=0;
      xS.font=`12px ${MN}`;xS.fillStyle=ha("#b0c8e8",0.4);
      xS.fillText("ds² = −(1−r_s/r)c²dt² + (1−r_s/r)⁻¹dr² + r²dΩ²",pl+430,34);
      xS.strokeStyle=ha(TEAL,0.12);xS.lineWidth=1;xS.strokeRect(pl,pt,pw,ph);
    }

    /* ════════════ II KERR ════════════ */
    function drawKerr(){
      const W=cKerr.width,H=cKerr.height;
      const av=Math.min(0.998,rSpin.current);
      xK.fillStyle="#040810";xK.fillRect(0,0,W,H);
      const cx=W/2,cy=H/2;
      // M=1 units; outer horizon r+ = 1 + sqrt(1-a²)
      const rOuter=1+Math.sqrt(Math.max(0,1-av*av));
      const rInner=1-Math.sqrt(Math.max(0,1-av*av));
      const SCALE=Math.min(W,H)*0.28;

      // Draw polar cross-section
      // Ergosphere: r_E(θ) = 1 + sqrt(1 - a²cos²θ) — equatorial bulge
      // Event horizon: r_+ — slightly oblate
      function drawEllipse(rx:number,ry:number,col:string,fill:boolean,label?:string){
        xK.beginPath();
        xK.ellipse(cx,cy,rx*SCALE,ry*SCALE,0,0,Math.PI*2);
        if(fill){xK.fillStyle=ha(col,0.08);xK.fill();}
        xK.strokeStyle=ha(col,0.55);xK.lineWidth=1.5;xK.stroke();
        if(label){xK.fillStyle=ha(col,0.55);xK.font=`11px ${MN}`;xK.textAlign="left";xK.fillText(label,cx+rx*SCALE+8,cy+5);}
      }

      // Ergosphere (equatorial r_E=2M, polar r_E=r_+)
      const ergEq=2, ergPol=rOuter;
      drawEllipse(ergEq/2,ergPol/2,PINK,true,"Ergosphere");
      // Outer event horizon (r_+ slightly oblate due to rotation)
      const hOblateness=0.85+0.15*(1-av);
      drawEllipse(rOuter/2,rOuter/2*hOblateness,RED,true,"r_+ event horizon");
      // Inner event horizon
      if(rInner>0.01){drawEllipse(rInner/2,rInner/2,GOLD,true,"r_- inner horizon");}
      // Ring singularity (equatorial ring)
      xK.strokeStyle=ha(RED,0.8);xK.lineWidth=2;xK.shadowColor=RED;xK.shadowBlur=12;
      xK.beginPath();xK.ellipse(cx,cy,av*SCALE*0.6,2,0,0,Math.PI*2);xK.stroke();
      xK.shadowBlur=0;
      xK.fillStyle=ha(RED,0.6);xK.font=`10px ${MN}`;xK.textAlign="center";
      xK.fillText("ring singularity",cx,cy+12);

      // Frame-dragging arrows (rotating field lines)
      const nArrows=12;
      for(let i=0;i<nArrows;i++){
        const ang=(i/nArrows)*Math.PI*2+t*0.012*av;
        const ri=ergEq/2*SCALE*1.05+20;
        const ax=cx+ri*Math.cos(ang),ay=cy+ri*Math.sin(ang);
        const tangX=-Math.sin(ang)*12*av,tangY=Math.cos(ang)*12*av;
        xK.save();xK.strokeStyle=ha(VIO,0.35+av*0.3);xK.lineWidth=1.2;
        xK.shadowColor=VIO;xK.shadowBlur=6*av;
        xK.beginPath();xK.moveTo(ax-tangX*0.5,ay-tangY*0.5);xK.lineTo(ax+tangX,ay+tangY);xK.stroke();
        // arrowhead
        const nx=-tangY/12,ny=tangX/12;
        xK.beginPath();xK.moveTo(ax+tangX,ay+tangY);xK.lineTo(ax+tangX-tangX*0.35+nx*4,ay+tangY-tangY*0.35+ny*4);xK.stroke();
        xK.shadowBlur=0;xK.restore();
      }

      // Axis of rotation (dashed vertical)
      xK.save();xK.setLineDash([4,4]);xK.strokeStyle=ha("#b0c8e8",0.18);xK.lineWidth=1;
      xK.beginPath();xK.moveTo(cx,pt=20);xK.lineTo(cx,H-20);xK.stroke();xK.restore();
      xK.fillStyle=ha("#b0c8e8",0.3);xK.font=`10px ${MN}`;xK.textAlign="center";xK.fillText("J/Mc",cx,18);

      // Spin parameter display
      const barX=W-130,barY=H-50;
      xK.fillStyle="rgba(1,3,10,0.7)";xK.fillRect(barX-8,barY-28,126,46);
      xK.strokeStyle=ha(PINK,0.3);xK.lineWidth=1;xK.strokeRect(barX-8,barY-28,126,46);
      xK.fillStyle=PINK;xK.font=`bold 12px ${MN}`;xK.textAlign="left";
      xK.fillText(`a = ${av.toFixed(3)}`,barX,barY-12);
      xK.fillStyle=ha(RED,0.55);xK.font=`10px ${MN}`;
      xK.fillText(`r_+ = ${rOuter.toFixed(3)}M`,barX,barY+2);
      xK.fillStyle=ha(GOLD,0.55);
      xK.fillText(`r_- = ${rInner.toFixed(3)}M`,barX,barY+14);

      // Title
      xK.font=`bold 20px ${OR}`;xK.fillStyle=PINK;xK.shadowColor=PINK;xK.shadowBlur=10;
      xK.textAlign="left";xK.fillText("II · Kerr · Rotating Black Hole",80,34);xK.shadowBlur=0;
      xK.font=`12px ${MN}`;xK.fillStyle=ha("#b0c8e8",0.4);
      xK.fillText("r_± = M ± √(M²−a²)   ·   frame drag Ω = ac/(r²+a²)",80+370,34);

      var pt=0;// reset (reuse symbol)
    }

    /* ════════════ III HAWKING RADIATION ════════════ */
    function drawHawk(){
      const W=cHawk.width,H=cHawk.height;
      // T_H = ℏc³/(8πGMk_B) ∝ 1/M
      const Mv=rHM.current;
      // Normalized T_H: set T_H=1 when M=1, scales as 1/M
      const TH=1/Mv;
      xH.fillStyle="#040810";xH.fillRect(0,0,W,H);
      const pl=80,pr=30,pt=50,pb=64;
      const pw=W-pl-pr,ph=H-pt-pb;
      const omMax=8;
      const nMax=(om:number,T:number)=>1/(Math.exp(om/T)-1+1e-9);
      const fluxMax=2.5;
      const gx=(om:number)=>pl+(om/omMax)*pw;
      const gy=(n:number)=>pt+ph-(n/fluxMax)*ph;

      grid(xH,pl,pt,pw,ph,GOLD);

      // Draw spectra for 3 temperatures (M=3, M=1, M=0.3)
      const specs=[
        {Mv:3,col:ha(BLUE,0.45),dash:[6,4]},
        {Mv:Mv,col:GOLD,dash:[]},
        {Mv:0.3,col:ha(RED,0.45),dash:[6,4]},
      ];
      specs.forEach(({Mv:mv,col,dash})=>{
        const T=1/mv;
        xH.save();
        xH.beginPath();xH.strokeStyle=col;xH.lineWidth=mv===Mv?2.5:1.5;
        if(dash.length)xH.setLineDash(dash);
        xH.shadowColor=col;xH.shadowBlur=mv===Mv?8:0;
        let first=true;
        for(let px=1;px<=pw;px+=2){
          const om=(px/pw)*omMax;
          const n=nMax(om,T);
          if(!isFinite(n)||n>fluxMax){first=true;continue;}
          if(first){xH.moveTo(gx(om),gy(n));first=false;}else xH.lineTo(gx(om),gy(n));
        }
        xH.stroke();xH.shadowBlur=0;xH.restore();
        // Peak label
        const omPeak=2.82*T;
        const nPeak=nMax(omPeak,T);
        if(nPeak>0.05&&nPeak<fluxMax&&omPeak<omMax){
          xH.fillStyle=ha(col.startsWith("rgb")?GOLD:col,0.6);xH.font=`11px ${MN}`;xH.textAlign="center";
          xH.fillText(`M=${mv.toFixed(1)}`,gx(omPeak),gy(nPeak)-10);
        }
      });

      // Wien peak marker for current T
      const omPeak=2.82*TH;
      if(omPeak<omMax){
        const npeak=nMax(omPeak,TH);
        if(npeak>0&&npeak<fluxMax){
          xH.save();xH.shadowColor=GOLD;xH.shadowBlur=16;xH.fillStyle=GOLD;
          xH.beginPath();xH.arc(gx(omPeak),gy(npeak),7,0,Math.PI*2);xH.fill();xH.shadowBlur=0;xH.restore();
          xH.setLineDash([4,4]);xH.strokeStyle=ha(GOLD,0.3);xH.lineWidth=1;
          xH.beginPath();xH.moveTo(gx(omPeak),pt);xH.lineTo(gx(omPeak),pt+ph);xH.stroke();xH.setLineDash([]);
          xH.fillStyle=ha(GOLD,0.6);xH.font=`11px ${MN}`;xH.textAlign="center";
          xH.fillText(`ω_peak=2.82T_H`,gx(omPeak),pt+14);
        }
      }

      // Temperature bar animation
      const tBar=W-120,tBarY=80;
      xH.fillStyle="rgba(1,3,10,0.7)";xH.fillRect(tBar-8,tBarY-18,116,90);
      xH.strokeStyle=ha(GOLD,0.3);xH.lineWidth=1;xH.strokeRect(tBar-8,tBarY-18,116,90);
      xH.fillStyle=GOLD;xH.font=`bold 11px ${MN}`;xH.textAlign="left";
      xH.fillText("T_H ∝ 1/M",tBar,tBarY);
      xH.fillStyle=ha(GOLD,0.55);xH.font=`11px ${MN}`;
      xH.fillText(`M = ${Mv.toFixed(2)}M_☉`,tBar,tBarY+16);
      xH.fillText(`T_H ∝ ${TH.toFixed(2)}`,tBar,tBarY+30);
      xH.fillText(`ω_p= ${(2.82*TH).toFixed(2)}`,tBar,tBarY+44);
      // T bar
      xH.fillStyle=ha(RED,0.18);xH.fillRect(tBar,tBarY+52,100,10);
      xH.fillStyle=GOLD;xH.shadowColor=GOLD;xH.shadowBlur=8;
      xH.fillRect(tBar,tBarY+52,Math.min(100,TH/3*100),10);xH.shadowBlur=0;

      // Animated evaporation pulse
      const pulse=0.5+0.5*Math.sin(t*0.04);
      xH.fillStyle=ha(RED,0.06+pulse*0.06);xH.fillRect(pl,pt,gx(omPeak<omMax?omPeak:omMax)-pl,ph);

      // Axis
      xH.fillStyle=GOLD;xH.font=`15px ${MN}`;xH.textAlign="center";
      xH.fillText("Frequency  ω/T_H",pl+pw/2,pt+ph+50);
      xH.save();xH.translate(22,pt+ph/2);xH.rotate(-Math.PI/2);xH.fillText("n(ω)  [Planck factor]",0,0);xH.restore();
      for(let i=0;i<=omMax;i+=2){
        xH.fillStyle=ha("#b0c8e8",0.4);xH.font=`13px ${MN}`;xH.textAlign="center";
        xH.fillText(`${i}`,gx(i),pt+ph+18);
      }
      [0.5,1,1.5,2].forEach(v=>{xH.fillStyle=ha("#b0c8e8",0.4);xH.font=`13px ${MN}`;xH.textAlign="right";xH.fillText(v.toFixed(1),pl-6,gy(v)+5);});

      xH.font=`bold 20px ${OR}`;xH.fillStyle=GOLD;xH.shadowColor=GOLD;xH.shadowBlur=10;xH.textAlign="left";
      xH.fillText("III · Hawking Radiation · Planck Spectrum",pl,34);xH.shadowBlur=0;
      xH.font=`12px ${MN}`;xH.fillStyle=ha("#b0c8e8",0.4);
      xH.fillText("T_H = ℏc³/(8πGMk_B)   n(ω) = 1/(e^(ω/T_H)−1)",pl+450,34);
      xH.strokeStyle=ha(GOLD,0.12);xH.lineWidth=1;xH.strokeRect(pl,pt,pw,ph);
    }

    /* ════════════ IV BEKENSTEIN-HAWKING ════════════ */
    function drawBek(){
      const W=cBek.width,H=cBek.height;
      const Mv=rBM.current;
      // S = A/(4l_P²) in Planck units  ·  A = 16πM² (G=c=1, M in Planck mass)
      // Display: S vs A, both normalized to M=1
      xB.fillStyle="#040810";xB.fillRect(0,0,W,H);

      // Left half: S vs A plot
      const pl=80,pr=W/2+20,pt=50,pb=64;
      const pw=W/2-pl-20,ph=H-pt-pb;
      const Amax=50,Smax=Amax/4+1;
      const gx=(A:number)=>pl+(A/Amax)*pw;
      const gy=(S:number)=>pt+ph-(S/Smax)*ph;
      grid(xB,pl,pt,pw,ph,VIO);

      // S = A/4 line
      xB.beginPath();xB.strokeStyle=VIO;xB.lineWidth=2.5;xB.shadowColor=VIO;xB.shadowBlur=8;
      xB.moveTo(gx(0),gy(0));xB.lineTo(gx(Amax),gy(Amax/4));xB.stroke();xB.shadowBlur=0;

      // Current M marker
      const Acurr=16*Math.PI*Mv*Mv;
      const Scurr=Acurr/4;
      if(Acurr<=Amax){
        xB.save();xB.shadowColor=TEAL;xB.shadowBlur=16;xB.fillStyle=TEAL;
        xB.beginPath();xB.arc(gx(Acurr),gy(Scurr),7,0,Math.PI*2);xB.fill();xB.shadowBlur=0;xB.restore();
        xB.fillStyle=TEAL;xB.font=`12px ${MN}`;xB.textAlign="left";
        xB.fillText(`S=${Scurr.toFixed(1)}  A=${Acurr.toFixed(1)}`,gx(Acurr)+12,gy(Scurr)-5);
      }

      // Axes
      xB.fillStyle=VIO;xB.font=`13px ${MN}`;xB.textAlign="center";
      xB.fillText("Horizon area  A/ℓ_P²",pl+pw/2,pt+ph+50);
      xB.save();xB.translate(22,pt+ph/2);xB.rotate(-Math.PI/2);xB.fillText("Entropy  S/k_B",0,0);xB.restore();
      [0,10,20,30,40].forEach(v=>{xB.fillStyle=ha("#b0c8e8",0.4);xB.font=`12px ${MN}`;xB.textAlign="center";xB.fillText(`${v}`,gx(v),pt+ph+18);});
      [0,3,6,9,12].forEach(v=>{xB.fillStyle=ha("#b0c8e8",0.4);xB.font=`12px ${MN}`;xB.textAlign="right";xB.fillText(`${v}`,pl-5,gy(v)+5);});
      xB.fillStyle=ha(VIO,0.4);xB.font=`12px ${MN}`;xB.textAlign="center";
      xB.fillText("S = A / 4ℓ_P²",gx(Amax*0.6),gy(Amax*0.6/4)-12);
      xB.strokeStyle=ha(VIO,0.12);xB.lineWidth=1;xB.strokeRect(pl,pt,pw,ph);

      // Right half: growing BH circle + entropy bar
      const rcx=W*0.75,rcy=H/2+10;
      const Rnorm=Math.sqrt(Acurr/(4*Math.PI));
      const Rdisplay=Math.min(pw*0.45,Rnorm*12);
      // Stars behind
      [[rcx-60,rcy-50,0.5],[rcx+50,rcy-40,0.4],[rcx-40,rcy+60,0.6],[rcx+70,rcy+55,0.35]].forEach(([sx,sy,sv])=>{
        xB.fillStyle=`rgba(160,200,255,${sv})`;xB.fillRect(sx as number,sy as number,1.5,1.5);});

      // BH circle with lensing ring
      const lensAngle=t*0.012;
      for(let k=0;k<3;k++){
        const lR=Rdisplay*(1.1+k*0.08);
        xB.strokeStyle=ha(VIO,0.10-k*0.02);xB.lineWidth=1.5-k*0.3;
        xB.beginPath();xB.arc(rcx,rcy,lR,0,Math.PI*2);xB.stroke();
      }
      xB.fillStyle="rgba(0,0,0,1)";xB.shadowColor=VIO;xB.shadowBlur=20;
      xB.beginPath();xB.arc(rcx,rcy,Rdisplay,0,Math.PI*2);xB.fill();xB.shadowBlur=0;
      // Photon ring glow
      xB.strokeStyle=ha(GOLD,0.5+0.3*Math.sin(t*0.03));xB.lineWidth=2;xB.shadowColor=GOLD;xB.shadowBlur=12;
      xB.beginPath();xB.arc(rcx,rcy,Rdisplay*1.04,0,Math.PI*2);xB.stroke();xB.shadowBlur=0;
      xB.fillStyle="rgba(0,0,0,0.95)";xB.beginPath();xB.arc(rcx,rcy,Rdisplay-2,0,Math.PI*2);xB.fill();

      // Entropy readout
      xB.fillStyle=VIO;xB.font=`bold 13px ${MN}`;xB.textAlign="center";
      xB.fillText(`M = ${Mv.toFixed(2)} M_P`,rcx,rcy+Rdisplay+22);
      xB.fillText(`A = ${Acurr.toFixed(1)} ℓ_P²`,rcx,rcy+Rdisplay+38);
      xB.fillStyle=TEAL;
      xB.fillText(`S = ${Scurr.toFixed(1)} k_B`,rcx,rcy+Rdisplay+54);

      // Title
      xB.font=`bold 20px ${OR}`;xB.fillStyle=VIO;xB.shadowColor=VIO;xB.shadowBlur=10;xB.textAlign="left";
      xB.fillText("IV · Bekenstein-Hawking · Entropy",pl,34);xB.shadowBlur=0;
      xB.font=`12px ${MN}`;xB.fillStyle=ha("#b0c8e8",0.4);
      xB.fillText("S_BH = k_B·A / (4ℓ_P²)   ·   A = 16πG²M²/c⁴",pl+340,34);
    }

    /* ════════════ V INFORMATION PARADOX ════════════ */
    function drawInfo(){
      const W=cInfo.width,H=cInfo.height;
      const tPageV=rTP.current;
      xI.fillStyle="#040810";xI.fillRect(0,0,W,H);
      const pl=80,pr=30,pt=50,pb=64;
      const pw=W-pl-pr,ph=H-pt-pb;
      const gx=(t2:number)=>pl+t2*pw;
      const gy=(S:number)=>pt+ph-S*ph;
      grid(xI,pl,pt,pw,ph,GRN);

      // Hawking's naive prediction: S_naive = t (monotonically rising → ∞)
      xI.save();xI.setLineDash([6,4]);xI.strokeStyle=ha(RED,0.5);xI.lineWidth=2;
      xI.beginPath();xI.moveTo(gx(0),gy(0));xI.lineTo(gx(1),gy(1));xI.stroke();
      xI.restore();
      xI.fillStyle=ha(RED,0.55);xI.font=`11px ${MN}`;xI.textAlign="left";
      xI.fillText("Hawking (naive): S→∞, information lost",gx(0.55),gy(0.65));

      // S_BH remaining = 1−t (decreasing)
      xI.save();xI.setLineDash([4,5]);xI.strokeStyle=ha(GOLD,0.35);xI.lineWidth=1.5;
      xI.beginPath();xI.moveTo(gx(0),gy(1));xI.lineTo(gx(1),gy(0));xI.stroke();
      xI.restore();
      xI.fillStyle=ha(GOLD,0.4);xI.font=`11px ${MN}`;xI.textAlign="right";
      xI.fillText("S_BH remaining",gx(0.3),gy(0.72));

      // Page curve (unitary): min(S_naive, S_BH) — tent shape
      xI.beginPath();xI.strokeStyle=GRN;xI.lineWidth=2.5;xI.shadowColor=GRN;xI.shadowBlur=10;
      xI.moveTo(gx(0),gy(0));
      for(let px=0;px<=pw;px++){
        const tt=px/pw;
        const Snaive=tt;
        const Sbh=1-tt;
        const Spage=Math.min(Snaive,Sbh); // actual Page curve
        xI.lineTo(gx(tt),gy(Spage));
      }
      xI.stroke();xI.shadowBlur=0;
      xI.fillStyle=ha(GRN,0.6);xI.font=`11px ${MN}`;xI.textAlign="center";
      xI.fillText("Page curve (unitary)",gx(0.25),gy(0.28));

      // Island formula fill (area between Page curve and naive Hawking)
      xI.save();xI.beginPath();
      xI.moveTo(gx(0),gy(0));
      for(let px=0;px<=pw;px++){
        const tt=px/pw;
        xI.lineTo(gx(tt),gy(Math.min(tt,1-tt)));
      }
      xI.lineTo(gx(1),gy(0));xI.closePath();
      xI.fillStyle=ha(GRN,0.06);xI.fill();xI.restore();

      // Page time marker
      xI.strokeStyle=ha(GRN,0.5);xI.lineWidth=1.5;xI.setLineDash([5,4]);
      xI.beginPath();xI.moveTo(gx(tPageV),pt);xI.lineTo(gx(tPageV),pt+ph);xI.stroke();xI.setLineDash([]);
      xI.fillStyle=ha(GRN,0.7);xI.font=`11px ${MN}`;xI.textAlign="center";
      xI.fillText(`t_Page=${tPageV.toFixed(2)}τ_evap`,gx(tPageV),pt+14);

      // Island formula annotation
      xI.fillStyle=ha(GRN,0.35);xI.font=`11px ${MN}`;xI.textAlign="center";
      xI.fillText("island formula bridges",gx(0.75),gy(0.33));
      xI.fillText("BH interior + radiation",gx(0.75),gy(0.27));

      // Animated dot on Page curve
      const dotT=(t*0.006)%1;
      const dotS=Math.min(dotT,1-dotT);
      xI.save();xI.shadowColor=GRN;xI.shadowBlur=18;xI.fillStyle=GRN;
      xI.beginPath();xI.arc(gx(dotT),gy(dotS),7,0,Math.PI*2);xI.fill();xI.shadowBlur=0;xI.restore();
      // Label
      const phase=dotT<tPageV?"growing":"purifying";
      xI.fillStyle=GRN;xI.font=`11px ${MN}`;xI.textAlign="left";
      xI.fillText(phase,gx(dotT)+10,gy(dotS)-6);

      // Axis labels
      xI.fillStyle=GRN;xI.font=`15px ${MN}`;xI.textAlign="center";
      xI.fillText("Time  t / τ_evap",pl+pw/2,pt+ph+50);
      xI.save();xI.translate(22,pt+ph/2);xI.rotate(-Math.PI/2);xI.fillText("S_radiation / S_BH(0)",0,0);xI.restore();
      ["0","0.2","0.4","0.6","0.8","1.0"].forEach((v,i)=>{
        xI.fillStyle=ha("#b0c8e8",0.4);xI.font=`13px ${MN}`;xI.textAlign="center";
        xI.fillText(v,gx(i*0.2),pt+ph+18);
      });
      ["0","0.2","0.4","0.6","0.8","1.0"].forEach((v,i)=>{
        xI.fillStyle=ha("#b0c8e8",0.4);xI.font=`13px ${MN}`;xI.textAlign="right";
        xI.fillText(v,pl-6,gy(i*0.2)+5);
      });

      // Readout
      xI.fillStyle=GRN;xI.font=`bold 14px ${MN}`;xI.textAlign="left";
      xI.fillText(`t_Page = ${tPageV.toFixed(2)}  ·  Information paradox → resolved by islands  ·  S_final = 0`,pl,pt+ph+46);

      xI.font=`bold 20px ${OR}`;xI.fillStyle=GRN;xI.shadowColor=GRN;xI.shadowBlur=10;
      xI.fillText("V · Information Paradox · Page Curve",pl,34);xI.shadowBlur=0;
      xI.font=`12px ${MN}`;xI.fillStyle=ha("#b0c8e8",0.4);
      xI.fillText("S_rad(t) = min(S_BH, S_naive)   ·   island formula (Penington 2019)",pl+390,34);
      xI.strokeStyle=ha(GRN,0.12);xI.lineWidth=1;xI.strokeRect(pl,pt,pw,ph);
    }

    /* ════════════ VI GOLDEN RATIO ════════════ */
    function drawGolden(){
      const W=cGold.width,H=cGold.height;
      xG.fillStyle="#040810";xG.fillRect(0,0,W,H);
      const φ=1.6180339887;

      // Left: golden rectangle spiral
      const cx=W*0.38,cy=H*0.5;
      const maxSize=Math.min(W*0.33,H*0.42);
      let w=maxSize,h=maxSize/φ;
      let x=cx-w/2,y=cy-h/2;
      const spiral: {x:number;y:number;w:number;h:number;dir:number;col:string}[]=[];
      const cols=[TEAL,GOLD,VIO,GRN,PINK,BLUE,ORG,RED];

      for(let i=0;i<9;i++){
        const sq=Math.min(w,h);
        let rx=x,ry=y;
        let nextW=w,nextH=h,nextX=x,nextY=y;
        const dir=i%4;
        if(dir===0){// square on right
          rx=x; ry=y; nextX=x+sq; nextY=y; nextW=w-sq; nextH=h;
        } else if(dir===1){// square on bottom
          rx=x; ry=y+h-sq; nextX=x; nextY=y; nextW=w; nextH=h-sq;
        } else if(dir===2){// square on left
          rx=x+w-sq; ry=y; nextX=x; nextY=y; nextW=w-sq; nextH=h;
        } else {// square on top
          rx=x; ry=y; nextX=x; nextY=y+sq; nextW=w; nextH=h-sq;
        }
        spiral.push({x:rx,y:ry,w:sq,h:sq,dir,col:cols[i%cols.length]});
        x=nextX;y=nextY;w=nextW;h=nextH;
        if(Math.min(w,h)<3)break;
      }

      // Draw rectangles
      spiral.forEach((s,i)=>{
        const pulse=0.5+0.5*Math.sin(t*0.025+i*0.5);
        xG.fillStyle=ha(s.col,0.07+pulse*0.06);
        xG.strokeStyle=ha(s.col,0.35+pulse*0.25);
        xG.lineWidth=1.2;
        xG.fillRect(s.x,s.y,s.w,s.h);xG.strokeRect(s.x,s.y,s.w,s.h);
        // Spiral arc
        xG.strokeStyle=ha(s.col,0.55+pulse*0.3);xG.lineWidth=1.8;
        xG.shadowColor=s.col;xG.shadowBlur=6*pulse;
        xG.beginPath();
        const d=s.dir%4;
        const [acx,acy,start,end]=
          d===0?[s.x,    s.y+s.h, -Math.PI/2,0]:
          d===1?[s.x,    s.y,     0,           Math.PI/2]:
          d===2?[s.x+s.w,s.y,     Math.PI/2,  Math.PI]:
                [s.x+s.w,s.y+s.h,  Math.PI,    Math.PI*1.5];
        xG.arc(acx,acy,s.w,start,end);xG.stroke();xG.shadowBlur=0;
      });

      // φ ratio display
      xG.fillStyle=TEAL;xG.font=`bold 32px ${OR}`;xG.textAlign="center";
      const phX=W*0.78;
      xG.shadowColor=TEAL;xG.shadowBlur=16;
      xG.fillText(`φ = ${φ.toFixed(10)}`,phX,pt=55);xG.shadowBlur=0;

      // Key identities
      const identities=[
        {eq:"φ² = φ + 1",  col:GOLD,  desc:"self-similar"},
        {eq:"1/φ = φ − 1", col:VIO,   desc:"reciprocal"},
        {eq:"φ = (1+√5)/2",col:TEAL,  desc:"algebraic"},
        {eq:"φⁿ = Fₙφ+Fₙ₋₁",col:GRN, desc:"Fibonacci"},
        {eq:"lim Fₙ₊₁/Fₙ=φ",col:PINK, desc:"ratio"},
      ];
      identities.forEach(({eq,col,desc},i)=>{
        const iy=90+i*46;
        xG.fillStyle=ha(col,0.08+0.5*Math.abs(Math.sin(t*0.025+i*0.7))*0.06);
        xG.fillRect(phX-220,iy-16,440,38);
        xG.strokeStyle=ha(col,0.22);xG.lineWidth=0.8;xG.strokeRect(phX-220,iy-16,440,38);
        xG.fillStyle=col;xG.font=`bold 15px ${MN}`;xG.textAlign="left";
        xG.fillText(eq,phX-210,iy+4);
        xG.fillStyle=ha(col,0.5);xG.font=`11px ${MN}`;xG.textAlign="right";
        xG.fillText(desc,phX+215,iy+4);
      });

      // Fibonacci bars (animated growing)
      const fibs=[1,1,2,3,5,8,13,21,34,55];
      const barX=phX-220, barY=330;
      xG.fillStyle=ha("#b0c8e8",0.3);xG.font=`11px ${MN}`;xG.textAlign="left";
      xG.fillText("Fibonacci sequence →",barX,barY-6);
      fibs.forEach((f,i)=>{
        const bh=Math.min(80,f*1.2);
        const bw=36,bx=barX+i*38;
        const col=cols[i%cols.length];
        const bri=0.5+0.5*Math.sin(t*0.03+i*0.4);
        xG.fillStyle=ha(col,0.15+bri*0.15);xG.fillRect(bx,barY+90-bh,bw,bh);
        xG.strokeStyle=ha(col,0.4+bri*0.25);xG.lineWidth=1;xG.strokeRect(bx,barY+90-bh,bw,bh);
        xG.fillStyle=ha(col,0.6);xG.font=`10px ${MN}`;xG.textAlign="center";
        xG.fillText(`${f}`,bx+bw/2,barY+90-bh-5);
        if(i>0){xG.fillStyle=ha("#b0c8e8",0.2);xG.fillText("→",bx-8,barY+90-bh/2+4);}
      });

      // Ratio marker
      xG.fillStyle=ha("#b0c8e8",0.35);xG.font=`11px ${MN}`;xG.textAlign="center";
      xG.fillText(`F₉/F₈ = ${(fibs[9]/fibs[8]).toFixed(6)} ≈ φ`,barX+180,barY+112);

      // AETHER connection
      xG.fillStyle=ha(TEAL,0.35);xG.font=`11px ${MN}`;xG.textAlign="center";
      xG.fillText("φ emerges in Penrose tiling · crystallographic quasi-order · BH extremal charge ratio",phX,H-18);

      // Title
      xG.font=`bold 20px ${OR}`;xG.fillStyle=ORG;xG.shadowColor=ORG;xG.shadowBlur=10;xG.textAlign="left";
      xG.fillText("VI · Golden Ratio · φ · Self-Similarity",80,34);xG.shadowBlur=0;
      xG.font=`12px ${MN}`;xG.fillStyle=ha("#b0c8e8",0.4);
      xG.fillText("φ = (1+√5)/2 ≈ 1.618…   ·   φ² = φ+1   ·   lim Fₙ₊₁/Fₙ = φ",80+350,34);

      var pt=0;
    }

    const loop=()=>{t++;drawSch();drawKerr();drawHawk();drawBek();drawInfo();drawGolden();animRef.current=requestAnimationFrame(loop);};
    loop();
    return()=>cancelAnimationFrame(animRef.current);
  },[]);

  const row: React.CSSProperties = {display:"grid",gridTemplateColumns:"1fr 260px",gap:12,marginBottom:12,alignItems:"start"};
  const panel=(col=TEAL,): React.CSSProperties=>({background:ha(col,0.04),border:`1px solid ${ha(col,0.18)}`,borderRadius:6,padding:0,overflow:"hidden"});
  const ctrl=(col=TEAL,): React.CSSProperties=>({...panel(col),padding:"10px 14px"});
  const secLbl: React.CSSProperties={fontFamily:MN,fontSize:8,letterSpacing:"0.22em",color:DIM,textTransform:"uppercase",marginBottom:8,paddingBottom:4,borderBottom:"1px solid rgba(31,212,200,0.08)"};
  const eq=(col:string)=>{return {fontFamily:MN,fontSize:10,color:ha(col,0.7),lineHeight:1.9};};
  const body: React.CSSProperties={fontSize:11.5,color:"rgba(200,210,228,0.7)",lineHeight:1.7};
  const hdr=(col:string,n:string,sub:string)=>(
    <div style={{padding:"6px 14px",borderBottom:`1px solid ${ha(col,0.12)}`}}>
      <span style={{fontFamily:OR,fontSize:10,color:col,letterSpacing:1}}>{n}</span>
      <span style={{fontFamily:MN,fontSize:9,color:DIM,marginLeft:12}}>{sub}</span>
    </div>
  );

  return (
    <div style={{minHeight:"100%",background:BG,color:"#d4e4f4",fontFamily:"'Rajdhani',sans-serif",overflowY:"auto"}}>
      <div style={{maxWidth:1160,margin:"0 auto",padding:"16px 20px"}}>

        {/* Title */}
        <div style={{marginBottom:14}}>
          <div style={{display:"inline-block",border:"1px solid #1fd4c855",padding:"3px 10px",fontSize:9,letterSpacing:"0.2em",fontFamily:MN,color:TEAL,marginBottom:8,borderRadius:2}}>
            AETHER · COMPLETE MATHEMATICAL FRAMEWORK · BLACK HOLE PHYSICS
          </div>
          <h1 style={{fontFamily:OR,fontSize:24,color:"#fff",margin:"0 0 6px",letterSpacing:2,textShadow:`0 0 24px ${TEAL}55`}}>
            Complete Mathematical Framework · Black Hole Physics
          </h1>
          <p style={{...body,margin:"0 0 10px",maxWidth:900}}>
            Six live interactive simulations — <strong style={{color:TEAL}}>Schwarzschild</strong> effective potential,{" "}
            <strong style={{color:PINK}}>Kerr</strong> rotating geometry,{" "}
            <strong style={{color:GOLD}}>Hawking</strong> thermal spectrum,{" "}
            <strong style={{color:VIO}}>Bekenstein-Hawking</strong> entropy,{" "}
            <strong style={{color:GRN}}>Information Paradox</strong> Page curve, and the{" "}
            <strong style={{color:ORG}}>Golden Ratio</strong> — each with governing equation, animated simulation, and interactive parameters.
          </p>
          <div style={{marginTop:6}}>
            <EqChip eq="ds² = −(1−r_s/r)c²dt²+…" col={TEAL}/>
            <EqChip eq="r_± = M ± √(M²−a²)" col={PINK}/>
            <EqChip eq="T_H = ℏc³/(8πGMk_B)" col={GOLD}/>
            <EqChip eq="S = A/4ℓ_P²" col={VIO}/>
            <EqChip eq="S_rad = min(S_BH, S_naive)" col={GRN}/>
            <EqChip eq="φ = (1+√5)/2" col={ORG}/>
          </div>
        </div>

        {/* I SCHWARZSCHILD */}
        <div style={row}>
          <div style={panel(TEAL)}>
            {hdr(TEAL,"I · SCHWARZSCHILD","Effective potential · light cones · ISCO · photon sphere")}
            <canvas ref={schRef} width={820} height={400} style={{width:"100%",height:"auto",display:"block"}}/>
          </div>
          <div style={ctrl(TEAL)}>
            <div style={secLbl}>Controls</div>
            <Slider label="L — angular momentum" value={angMom} min={2.0} max={6.0} step={0.1} unit="M" col={TEAL} onChange={setAngMom}/>
            <Slider label="M — black hole mass" value={bhMass} min={1} max={10} step={0.5} unit="M☉" col={GOLD} decimals={1} onChange={setBhMass}/>
            <div style={{...secLbl,marginTop:10}}>Equations</div>
            <div style={eq(TEAL)}>
              ds²=−(1−r_s/r)c²dt²<br/>+…r²dΩ²<br/>
              r_s = 2GM/c²<br/>
              ISCO: r=6M, L²=12M²<br/>
              γ·sphere: r=3M
            </div>
            <div style={{...secLbl,marginTop:8}}>Reference</div>
            <div style={{fontFamily:MN,fontSize:9,color:ha(TEAL,0.35),lineHeight:1.7}}>
              K. Schwarzschild (1916)<br/>
              Misner, Thorne &amp; Wheeler,<br/>Gravitation (1973)
            </div>
          </div>
        </div>

        {/* II KERR */}
        <div style={row}>
          <div style={panel(PINK)}>
            {hdr(PINK,"II · KERR","Rotating black hole · ergosphere · frame dragging · ring singularity")}
            <canvas ref={kerrRef} width={820} height={400} style={{width:"100%",height:"auto",display:"block"}}/>
          </div>
          <div style={ctrl(PINK)}>
            <div style={secLbl}>Controls</div>
            <Slider label="a — spin parameter" value={spin} min={0} max={0.998} step={0.01} unit="M" col={PINK} onChange={setSpin}/>
            <div style={{...secLbl,marginTop:10}}>Equations</div>
            <div style={eq(PINK)}>
              r_± = M ± √(M²−a²)<br/>
              Ω_H = a/(2Mr_+)<br/>
              r_E(θ)=M+√(M²−a²cos²θ)<br/>
              J = aMc (angular momentum)
            </div>
            <div style={{...secLbl,marginTop:8}}>Reference</div>
            <div style={{fontFamily:MN,fontSize:9,color:ha(PINK,0.35),lineHeight:1.7}}>
              R. Kerr, PRL 11 (1963)<br/>
              Boyer &amp; Lindquist (1967)<br/>
              Penrose process (1969)
            </div>
          </div>
        </div>

        {/* III HAWKING */}
        <div style={row}>
          <div style={panel(GOLD)}>
            {hdr(GOLD,"III · HAWKING RADIATION","Planck spectrum · T_H ∝ 1/M · Wien peak shift")}
            <canvas ref={hawkRef} width={820} height={400} style={{width:"100%",height:"auto",display:"block"}}/>
          </div>
          <div style={ctrl(GOLD)}>
            <div style={secLbl}>Controls</div>
            <Slider label="M — BH mass (Planck units)" value={hawkM} min={0.2} max={5.0} step={0.1} unit="" col={GOLD} onChange={setHawkM}/>
            <div style={{...secLbl,marginTop:10}}>Equations</div>
            <div style={eq(GOLD)}>
              T_H = ℏc³/(8πGMk_B)<br/>
              n(ω) = 1/(e^(ω/T_H)−1)<br/>
              ω_peak = 2.82·T_H<br/>
              P = ℏc⁶/(15360πG²M²)
            </div>
            <div style={{...secLbl,marginTop:8}}>Reference</div>
            <div style={{fontFamily:MN,fontSize:9,color:ha(GOLD,0.35),lineHeight:1.7}}>
              S. W. Hawking,<br/>Nature 248 (1974)<br/>
              Comm. Math. Phys. (1975)
            </div>
          </div>
        </div>

        {/* IV BEKENSTEIN-HAWKING */}
        <div style={row}>
          <div style={panel(VIO)}>
            {hdr(VIO,"IV · BEKENSTEIN-HAWKING","S = A/4ℓ_P²  ·  area theorem  ·  holographic principle")}
            <canvas ref={bekRef} width={820} height={400} style={{width:"100%",height:"auto",display:"block"}}/>
          </div>
          <div style={ctrl(VIO)}>
            <div style={secLbl}>Controls</div>
            <Slider label="M — BH mass" value={bekM} min={0.2} max={1.8} step={0.05} unit=" M_P" col={VIO} onChange={setBekM}/>
            <div style={{...secLbl,marginTop:10}}>Equations</div>
            <div style={eq(VIO)}>
              S = k_B·A/(4ℓ_P²)<br/>
              A = 16πG²M²/c⁴<br/>
              ℓ_P = √(Gℏ/c³)<br/>
              ΔA ≥ 0 (area theorem)
            </div>
            <div style={{...secLbl,marginTop:8}}>Reference</div>
            <div style={{fontFamily:MN,fontSize:9,color:ha(VIO,0.35),lineHeight:1.7}}>
              J. Bekenstein, PRD (1973)<br/>
              Hawking, Ellis, Bardeen,<br/>Carter (1973)
            </div>
          </div>
        </div>

        {/* V INFORMATION PARADOX */}
        <div style={row}>
          <div style={panel(GRN)}>
            {hdr(GRN,"V · INFORMATION PARADOX","Page curve · island formula · unitarity · entanglement entropy")}
            <canvas ref={infoRef} width={820} height={400} style={{width:"100%",height:"auto",display:"block"}}/>
          </div>
          <div style={ctrl(GRN)}>
            <div style={secLbl}>Controls</div>
            <Slider label="t_Page — Page time" value={tPage} min={0.2} max={0.8} step={0.01} unit="τ" col={GRN} onChange={setTPage}/>
            <div style={{...secLbl,marginTop:10}}>Equations</div>
            <div style={eq(GRN)}>
              S_rad = min(S_BH, S_naive)<br/>
              t_Page ≈ τ_evap/2<br/>
              τ_evap = 5120πG²M³/ℏc⁴<br/>
              S_island ≈ A_island/4G
            </div>
            <div style={{...secLbl,marginTop:8}}>Reference</div>
            <div style={{fontFamily:MN,fontSize:9,color:ha(GRN,0.35),lineHeight:1.7}}>
              D. N. Page, PRL 71 (1993)<br/>
              Penington (2019)<br/>
              Almheiri et al. (2019)<br/>
              AMPS firewall (2013)
            </div>
          </div>
        </div>

        {/* VI GOLDEN RATIO */}
        <div style={row}>
          <div style={panel(ORG)}>
            {hdr(ORG,"VI · GOLDEN RATIO · φ","φ=(1+√5)/2 · self-similarity · Fibonacci · Penrose · AETHER crystallisation")}
            <canvas ref={goldRef} width={820} height={440} style={{width:"100%",height:"auto",display:"block"}}/>
          </div>
          <div style={ctrl(ORG)}>
            <div style={secLbl}>Constant</div>
            <div style={{fontFamily:MN,fontSize:18,color:ORG,marginBottom:10,textShadow:`0 0 12px ${ORG}88`}}>
              φ = {phi.toFixed(10)}
            </div>
            <div style={{...secLbl,marginTop:2}}>Identities</div>
            <div style={eq(ORG)}>
              φ² = φ + 1<br/>
              1/φ = φ − 1<br/>
              φ = (1+√5)/2<br/>
              φ^n = F_n·φ + F_n-1
            </div>
            <div style={{...secLbl,marginTop:8}}>BH Connection</div>
            <div style={{fontFamily:MN,fontSize:9,color:ha(ORG,0.5),lineHeight:1.7}}>
              Extremal Kerr: a/M = 1<br/>
              Charge ratio Q/M = 1<br/>
              Penrose tiling: 5-fold φ<br/>
              AETHER crystallisation
            </div>
            <div style={{...secLbl,marginTop:8}}>Reference</div>
            <div style={{fontFamily:MN,fontSize:9,color:ha(ORG,0.35),lineHeight:1.7}}>
              Euclid, Elements (300 BC)<br/>
              Luca Pacioli (1509)<br/>
              Penrose tiling (1974)
            </div>
          </div>
        </div>

        {/* Synthesis */}
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:10,marginBottom:16}}>
          {[
            {col:TEAL,title:"Schwarzschild → Kerr",body:"The Schwarzschild metric (a=0) is the unique spherically-symmetric vacuum solution (Birkhoff's theorem). Adding rotation a≠0 gives Kerr — the unique stationary, axisymmetric vacuum BH. Extremal Kerr (a=M) has a photon sphere merging with the horizon at r=M."},
            {col:GOLD,title:"Hawking → Bekenstein",body:"Hawking radiation carries away entropy at rate dS/dt ∝ T_H. Bekenstein-Hawking entropy S = A/4ℓ_P² means the horizon area A encodes all information about the interior. Decreasing A contradicts classical area theorem (ΔA≥0), resolved quantum mechanically."},
            {col:GRN,title:"Information → Golden",body:"The Page curve's tent peak at t_Page and the golden ratio's φ² = φ+1 both express the same fundamental self-referential structure: the part contains the whole. AETHER proposes crystallisation follows φ-symmetry — a golden lattice threading quantum gravity to conscious coherence."},
          ].map(({col,title,body:b})=>(
            <div key={title} style={{background:ha(col,0.04),border:`1px solid ${ha(col,0.18)}`,borderRadius:4,padding:"10px 12px"}}>
              <div style={{fontFamily:MN,fontSize:8,letterSpacing:"0.2em",color:DIM,marginBottom:6,textTransform:"uppercase"}}>{title}</div>
              <div style={body}>{b}</div>
            </div>
          ))}
        </div>

      </div>
    </div>
  );
}
