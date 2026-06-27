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
function Chip({col,children}:{col:string;children:string}){
  return(
    <span style={{display:"inline-block",padding:"2px 10px",borderRadius:3,
      background:col+"18",border:`1px solid ${col}44`,fontFamily:MONO,
      fontSize:9,color:col,letterSpacing:"0.12em",marginRight:6,marginBottom:4}}>
      {children}
    </span>
  );
}

// ── Module-level interfaces ───────────────────────────────────────────────────
interface WaveState {
  u: Float32Array;
  up: Float32Array;
  mask: Uint8Array;
  W: number;
  H: number;
}

// ── Growth Canvas ─────────────────────────────────────────────────────────────
// Shows three mechanism pieces growing and merging into one resonant body.
function GrowthCanvas(){
  const ref=useRef<HTMLCanvasElement>(null);
  const rafRef=useRef<number>(0);
  const tRef=useRef(0);
  const phaseRef=useRef(0); // 0=apart,1=growing,2=merging,3=unified

  useEffect(()=>{
    const canvas=ref.current;
    if(!canvas) return;
    const ctx=canvas.getContext("2d");
    if(!ctx) return;
    const W=canvas.width,H=canvas.height;
    const cx=W/2,cy=H/2;

    // Seeded RNG
    let seed=77;
    const rand=()=>{seed=(seed*16807)%2147483647;return(seed-1)/2147483646;};

    // Velvet dot positions (pre-generated for the outer shell)
    const vDots:{x:number;y:number;r:number}[]=[];
    for(let i=0;i<600;i++){
      const a=rand()*Math.PI*2;
      const radX=140+rand()*20,radY=90+rand()*18;
      vDots.push({x:cx+Math.cos(a)*radX,y:cy+Math.sin(a)*radY,r:0.8+rand()*2.2});
    }

    function drawVelvetDots(alpha:number,scaleX:number,scaleY:number,offsetX:number,offsetY:number){
      ctx.save();
      ctx.translate(offsetX,offsetY);
      ctx.scale(scaleX,scaleY);
      for(const d of vDots){
        const vx=d.x-cx,vy=d.y-cy;
        // Only draw on outer ring
        const normR=Math.sqrt(vx*vx/160**2+vy*vy/100**2);
        if(normR<0.82||normR>1.05) continue;
        ctx.beginPath();
        ctx.arc(d.x,d.y,d.r,0,Math.PI*2);
        ctx.fillStyle=`rgba(120,60,180,${alpha*(0.3+rand()*0.3)})`;
        ctx.fill();
      }
      ctx.restore();
    }

    function drawRibs(
      progress:number, // 0-1 how many ribs have appeared
      ox:number,oy:number, // center offset from canvas center
      scaleX:number,scaleY:number,
      alpha:number,
      glowCol:string
    ){
      const N=18; // number of rib layers
      ctx.save();
      ctx.translate(cx+ox,cy+oy);
      ctx.scale(scaleX,scaleY);

      const visibleRibs=Math.floor(progress*N);
      for(let i=0;i<visibleRibs;i++){
        const t=i/(N-1);
        const rx=30+t*110, ry=18+t*72;
        // Rib fill alpha (older inner ribs more solid)
        const ribAlpha=alpha*(0.15+0.6*(1-t));
        // Color: inner=gold, mid=amber, outer=vio
        let r,g,b;
        if(t<0.5){
          const s=t*2;
          r=Math.round(200-s*100); g=Math.round(160-s*80); b=Math.round(48+s*102);
        } else {
          const s=(t-0.5)*2;
          r=Math.round(100-s*60); g=Math.round(80-s*60); b=Math.round(150+s*105);
        }
        // Rib stroke (the carved rib line)
        ctx.beginPath();
        ctx.ellipse(0,0,rx,ry,0,0,Math.PI*2);
        ctx.strokeStyle=`rgba(${r},${g},${b},${alpha*(0.4+0.5*(1-t))})`;
        ctx.lineWidth=1.5+2*(1-t);
        ctx.stroke();
        // Inner fill for the solid body
        if(i===visibleRibs-1){
          ctx.beginPath();
          ctx.ellipse(0,0,rx,ry,0,0,Math.PI*2);
          ctx.fillStyle=`rgba(${r},${g},${b},${ribAlpha*0.3})`;
          ctx.fill();
        }
      }

      // Glow
      if(progress>0.5&&isFinite(cx+ox)&&isFinite(cy+oy)){
        const g=ctx.createRadialGradient(0,0,0,0,0,80);
        g.addColorStop(0,glowCol+"22");
        g.addColorStop(1,"transparent");
        ctx.beginPath();
        ctx.ellipse(0,0,130,85,0,0,Math.PI*2);
        ctx.fillStyle=g;
        ctx.fill();
      }
      ctx.restore();
    }

    function drawSolarArc(progress:number,ox:number,oy:number,alpha:number){
      if(progress<0.1) return;
      ctx.save();
      ctx.translate(cx+ox,cy+oy-70);
      const a=(progress-0.1)/0.9;
      // Solar fan arc
      for(let i=0;i<12;i++){
        const ang=-Math.PI/2+(-Math.PI/2+i*(Math.PI/11))*a;
        const len=(55+i%3*8)*a;
        ctx.beginPath();
        ctx.moveTo(0,0);
        ctx.lineTo(Math.cos(ang)*len,Math.sin(ang)*len);
        ctx.strokeStyle=`rgba(255,220,80,${alpha*0.5*(Math.sin(progress*6+i))})`;
        ctx.lineWidth=1.5;
        ctx.stroke();
      }
      // Sun disc
      ctx.beginPath();
      ctx.arc(0,0,10*a,0,Math.PI*2);
      ctx.fillStyle=`rgba(255,240,100,${alpha*a*0.9})`;
      ctx.fill();
      if(isFinite(0)){
        const sg=ctx.createRadialGradient(0,0,0,0,0,28*a);
        sg.addColorStop(0,"rgba(255,220,80,0.4)");
        sg.addColorStop(1,"transparent");
        ctx.beginPath();
        ctx.arc(0,0,28*a,0,Math.PI*2);
        ctx.fillStyle=sg;
        ctx.fill();
      }
      ctx.restore();
    }

    function drawWheelArc(progress:number,ox:number,oy:number,alpha:number){
      if(progress<0.05) return;
      ctx.save();
      ctx.translate(cx+ox,cy+oy);
      const a=Math.min(1,(progress-0.05)/0.95);
      // Organic wheel - grown arc spokes
      const spokes=8;
      for(let i=0;i<spokes;i++){
        const ang=(i/spokes)*Math.PI*2*a+tRef.current*0.4;
        ctx.beginPath();
        ctx.moveTo(0,0);
        // Curved spoke (bezier)
        const r=32*a;
        const ex=Math.cos(ang)*r, ey=Math.sin(ang)*r;
        const mx=Math.cos(ang-0.3)*r*0.6, my=Math.sin(ang-0.3)*r*0.6;
        ctx.bezierCurveTo(mx*0.5,my*0.5,mx,my,ex,ey);
        ctx.strokeStyle=`rgba(200,160,48,${alpha*a*0.7})`;
        ctx.lineWidth=1.2;
        ctx.stroke();
      }
      // Rim
      ctx.beginPath();
      ctx.arc(0,0,32*a,0,Math.PI*2);
      ctx.strokeStyle=`rgba(200,160,48,${alpha*a*0.8})`;
      ctx.lineWidth=2;
      ctx.stroke();
      // Hub
      ctx.beginPath();
      ctx.arc(0,0,5*a,0,Math.PI*2);
      ctx.fillStyle=`rgba(255,220,80,${alpha*a})`;
      ctx.fill();
      ctx.restore();
    }

    function tick(){
      tRef.current+=0.016;
      const t=tRef.current;

      // Phase cycle: 12 seconds per cycle
      const cycle=t%18;
      let ribProgress=0,mergeProgress=0,unifiedAlpha=0;
      let solarOffset={x:0,y:0},wheelLOffset={x:0,y:0},wheelROffset={x:0,y:0};
      let solarProgress=0,wheelProgress=0;

      if(cycle<4){
        // Separate parts growing
        const p=cycle/4;
        ribProgress=p*0.6;
        solarProgress=p;
        wheelProgress=p;
        solarOffset={x:0,y:-140+p*40};
        wheelLOffset={x:-190+p*50,y:80-p*20};
        wheelROffset={x:190-p*50,y:80-p*20};
      } else if(cycle<8){
        // Merging together
        const p=(cycle-4)/4;
        ribProgress=0.6+p*0.4;
        solarProgress=1;
        wheelProgress=1;
        mergeProgress=p;
        const ease=p*p*(3-2*p);
        solarOffset={x:0,y:-100+ease*50};
        wheelLOffset={x:-140+ease*80,y:60};
        wheelROffset={x:140-ease*80,y:60};
      } else {
        // Unified resonant body
        ribProgress=1;
        solarProgress=1;
        wheelProgress=1;
        mergeProgress=1;
        unifiedAlpha=(cycle-8)/2;
        solarOffset={x:0,y:-50};
        wheelLOffset={x:-60,y:60};
        wheelROffset={x:60,y:60};
      }

      // Clear
      ctx.fillStyle="#010308";
      ctx.fillRect(0,0,W,H);

      // Phase label
      const phaseLabel=cycle<4?"GROWING MECHANISM PARTS":
        cycle<8?"MERGING INTO ONE BODY":"UNIFIED RESONANT FORM";
      ctx.fillStyle="rgba(184,204,232,0.4)";
      ctx.font=`8px ${MONO}`;
      ctx.textAlign="center";
      ctx.fillText(phaseLabel,W/2,H-12);
      ctx.textAlign="left";

      const bodyAlpha=cycle<8?0.85:1.0;

      // Draw body ribs
      drawRibs(ribProgress,0,0,1,1,bodyAlpha,V.vio);

      // Velvet dots (outer surface)
      if(ribProgress>0.7){
        drawVelvetDots((ribProgress-0.7)/0.3*0.8,1,1,0,0);
      }

      // Solar mechanism (separate then merges to top)
      drawSolarArc(solarProgress,solarOffset.x,solarOffset.y,bodyAlpha);

      // Wheels (left then merges to base)
      drawWheelArc(wheelProgress,wheelLOffset.x,wheelLOffset.y,bodyAlpha);
      drawWheelArc(wheelProgress,wheelROffset.x,wheelROffset.y,bodyAlpha);

      // Merge glow effect
      if(mergeProgress>0&&mergeProgress<1){
        const mg=Math.sin(mergeProgress*Math.PI);
        if(isFinite(cx)&&isFinite(cy)){
          const g=ctx.createRadialGradient(cx,cy,0,cx,cy,180);
          g.addColorStop(0,`rgba(153,102,255,${mg*0.3})`);
          g.addColorStop(1,"transparent");
          ctx.beginPath();
          ctx.ellipse(cx,cy,220,160,0,0,Math.PI*2);
          ctx.fillStyle=g;
          ctx.fill();
        }
      }

      // Unified resonance ring
      if(unifiedAlpha>0){
        const pulse=Math.sin(t*3.2)*0.5+0.5;
        ctx.beginPath();
        ctx.ellipse(cx,cy,145+pulse*6,95+pulse*4,0,0,Math.PI*2);
        ctx.strokeStyle=`rgba(0,255,178,${Math.min(unifiedAlpha,1)*0.4})`;
        ctx.lineWidth=2;
        ctx.stroke();
        ctx.fillStyle=`rgba(0,255,178,${Math.min(unifiedAlpha,1)*0.06})`;
        ctx.fill();

        // One resonance label
        ctx.fillStyle=`rgba(0,255,178,${Math.min(unifiedAlpha,1)*0.8})`;
        ctx.font=`9px ${MONO}`;
        ctx.textAlign="center";
        ctx.fillText("ONE RESONANT BODY",W/2,cy+110);
        ctx.textAlign="left";
      }

      rafRef.current=requestAnimationFrame(tick);
    }
    rafRef.current=requestAnimationFrame(tick);
    return()=>cancelAnimationFrame(rafRef.current);
  },[]);

  return(
    <canvas ref={ref} width={520} height={340}
      style={{width:"100%",borderRadius:10,
        border:"1px solid rgba(153,102,255,0.2)",display:"block"}}/>
  );
}

// ── Wave resonance canvas ─────────────────────────────────────────────────────
function ResonanceCanvas(){
  const ref=useRef<HTMLCanvasElement>(null);
  const waveRef=useRef<WaveState|null>(null);
  const rafRef=useRef<number>(0);
  const tRef=useRef(0);
  const strikeRef=useRef(0);

  useEffect(()=>{
    const canvas=ref.current;
    if(!canvas) return;
    const ctx=canvas.getContext("2d");
    if(!ctx) return;
    const CW=canvas.width, CH=canvas.height;
    const GW=120, GH=70;
    const scaleX=CW/GW, scaleY=CH/GH;

    // Build wave state + mask
    const u=new Float32Array(GW*GH);
    const up=new Float32Array(GW*GH);
    const mask=new Uint8Array(GW*GH);
    const gcx=GW/2, gcy=GH/2, grx=GW*0.44, gry=GH*0.4;
    for(let j=0;j<GH;j++) for(let i=0;i<GW;i++){
      const nx=(i-gcx)/grx, ny=(j-gcy)/gry;
      if(nx*nx+ny*ny<1) mask[j*GW+i]=1;
    }
    waveRef.current={u,up,mask,W:GW,H:GH};

    function strike(sx:number,sy:number,amp:number){
      const w=waveRef.current;
      if(!w) return;
      const gi=Math.round(sx/scaleX), gj=Math.round(sy/scaleY);
      const R=6;
      for(let dj=-R;dj<=R;dj++) for(let di=-R;di<=R;di++){
        const ii=gi+di, jj=gj+dj;
        if(ii<0||ii>=GW||jj<0||jj>=GH) continue;
        if(!w.mask[jj*GW+ii]) continue;
        const d=Math.sqrt(di*di+dj*dj);
        w.u[jj*GW+ii]+=amp*Math.exp(-d*d/8);
      }
    }

    function stepWave(){
      const w=waveRef.current;
      if(!w) return;
      const c=0.45, damp=0.9988;
      const {u,up,mask,W,H}=w;
      const un=new Float32Array(W*H);
      for(let j=1;j<H-1;j++) for(let i=1;i<W-1;i++){
        if(!mask[j*W+i]) continue;
        const lap=u[(j-1)*W+i]+u[(j+1)*W+i]+u[j*W+(i-1)]+u[j*W+(i+1)]-4*u[j*W+i];
        un[j*W+i]=damp*(2*u[j*W+i]-up[j*W+i]+c*c*lap);
      }
      w.up.set(u);
      w.u.set(un);
    }

    function drawWave(){
      const w=waveRef.current;
      if(!w) return;
      const {u,mask,W,H}=w;
      ctx.fillStyle="#010308";
      ctx.fillRect(0,0,CW,CH);

      // Draw wave field
      for(let j=0;j<H;j++) for(let i=0;i<W;i++){
        if(!mask[j*W+i]) continue;
        const val=u[j*W+i];
        const px=i*scaleX, py=j*scaleY;
        // Color: negative=blue, zero=dark, positive=aurora/plasma
        let r=0,g=0,b=0,a=0;
        if(val>0){
          const v=Math.min(val/0.6,1);
          r=Math.round(v*0+68*(1-v)); g=Math.round(v*255+204*(1-v)); b=Math.round(v*178+255*(1-v));
          a=0.15+v*0.75;
        } else {
          const v=Math.min(-val/0.6,1);
          r=Math.round(v*255+68*(1-v)); g=Math.round(v*68+136*(1-v)); b=Math.round(v*255);
          a=0.15+v*0.75;
        }
        ctx.fillStyle=`rgba(${r},${g},${b},${a})`;
        ctx.fillRect(px,py,scaleX+0.5,scaleY+0.5);
      }

      // Nodal lines (where u ~0)
      ctx.strokeStyle="rgba(184,204,232,0.12)";
      ctx.lineWidth=0.5;
      for(let j=1;j<H-1;j++) for(let i=1;i<W-1;i++){
        if(!mask[j*W+i]) continue;
        const v=u[j*W+i];
        if(Math.abs(v)<0.03){
          ctx.fillStyle="rgba(184,204,232,0.1)";
          ctx.fillRect(i*scaleX,j*scaleY,scaleX,scaleY);
        }
      }

      // Boundary outline
      ctx.beginPath();
      ctx.ellipse(CW/2,CH/2,GW*0.44*scaleX,GH*0.4*scaleY,0,0,Math.PI*2);
      ctx.strokeStyle="rgba(153,102,255,0.4)";
      ctx.lineWidth=1.5;
      ctx.stroke();
    }

    function tick(){
      tRef.current+=1;
      strikeRef.current++;
      // Auto-strike every 180 frames
      if(strikeRef.current%180===0){
        strike(CW/2,CH/2,1.2);
      }
      // Occasional off-center strike
      if(strikeRef.current%180===90){
        strike(CW*0.35,CH*0.45,0.7);
      }
      for(let i=0;i<4;i++) stepWave();
      drawWave();
      rafRef.current=requestAnimationFrame(tick);
    }
    // Initial strike
    strike(CW/2,CH/2,1.5);
    rafRef.current=requestAnimationFrame(tick);
    return()=>cancelAnimationFrame(rafRef.current);
  },[]);

  return(
    <canvas ref={ref} width={440} height={200}
      onClick={e=>{
        // Let user click to strike
        const r=ref.current;
        if(!r) return;
        const rect=r.getBoundingClientRect();
        const x=(e.clientX-rect.left)*(r.width/rect.width);
        const y=(e.clientY-rect.top)*(r.height/rect.height);
        const w=waveRef.current;
        if(!w) return;
        const GW=w.W,GH=w.H,scaleX=r.width/GW,scaleY=r.height/GH;
        const gi=Math.round(x/scaleX),gj=Math.round(y/scaleY);
        const R=6;
        for(let dj=-R;dj<=R;dj++) for(let di=-R;di<=R;di++){
          const ii=gi+di,jj=gj+dj;
          if(ii<0||ii>=GW||jj<0||jj>=GH) continue;
          if(!w.mask[jj*GW+ii]) continue;
          const d=Math.sqrt(di*di+dj*dj);
          w.u[jj*GW+ii]+=1.5*Math.exp(-d*d/8);
        }
      }}
      style={{width:"100%",borderRadius:8,cursor:"crosshair",
        border:"1px solid rgba(153,102,255,0.22)",display:"block"}}/>
  );
}

// ── Flex canvas ───────────────────────────────────────────────────────────────
function FlexCanvas(){
  const ref=useRef<HTMLCanvasElement>(null);
  const rafRef=useRef<number>(0);
  const tRef=useRef(0);

  useEffect(()=>{
    const canvas=ref.current;
    if(!canvas) return;
    const ctx=canvas.getContext("2d");
    if(!ctx) return;
    const W=canvas.width, H=canvas.height;
    const cx=W/2, cy=H/2;
    const N=22; // rib arcs

    function tick(){
      tRef.current+=0.022;
      const t=tRef.current;

      ctx.fillStyle="#010308";
      ctx.fillRect(0,0,W,H);

      // Terrain line (wavy road)
      ctx.beginPath();
      for(let x=0;x<W;x++){
        const gy=H*0.88+Math.sin(x*0.07+t*2)*5+Math.sin(x*0.13+t*1.3)*3;
        x===0?ctx.moveTo(x,gy):ctx.lineTo(x,gy);
      }
      ctx.strokeStyle=V.dim+"55";
      ctx.lineWidth=1;
      ctx.stroke();

      // Multi-axis motion
      const sway=Math.sin(t*1.8)*22;  // side-to-side
      const bounce=Math.sin(t*3.1)*8; // vertical bounce
      const rock=Math.sin(t*1.4)*0.06; // tilt angle

      ctx.save();
      ctx.translate(cx+sway, cy+bounce);
      ctx.rotate(rock);

      // Draw ribs from innermost to outermost
      for(let i=0;i<N;i++){
        const frac=i/(N-1);
        const rx=28+frac*110, ry=16+frac*68;

        // Each rib has a flex offset based on its position in the body
        // Inner ribs flex less, outer ribs flex more
        const ribFlex=frac*Math.sin(t*2.6+i*0.15)*6;
        const stressMag=Math.abs(ribFlex)/6; // 0-1

        // Color by stress: green=relaxed, amber=moderate, plasma=stressed
        let r,g,b;
        if(stressMag<0.4){
          const s=stressMag/0.4;
          r=Math.round(68-s*68+255*s*0.3); g=Math.round(204+s*30); b=Math.round(119-s*80);
        } else if(stressMag<0.75){
          const s=(stressMag-0.4)/0.35;
          r=Math.round(255); g=Math.round(234-s*120); b=Math.round(39-s*39);
        } else {
          const s=(stressMag-0.75)/0.25;
          r=Math.round(255); g=Math.round(114-s*80); b=Math.round(s*119);
        }

        const alpha=0.5+0.4*(1-frac);

        ctx.beginPath();
        // Slightly perturbed ellipse for the flex
        const pts=48;
        for(let k=0;k<=pts;k++){
          const ang=(k/pts)*Math.PI*2;
          const fr=ribFlex*Math.cos(ang*2)*0.4;
          const px=Math.cos(ang)*rx;
          const py=Math.sin(ang)*(ry+fr)+fr*0.3;
          k===0?ctx.moveTo(px,py):ctx.lineTo(px,py);
        }
        ctx.closePath();
        ctx.strokeStyle=`rgba(${r},${g},${b},${alpha})`;
        ctx.lineWidth=i===N-1?2.5:1.2;
        ctx.stroke();

        // Fill innermost
        if(i===0){
          ctx.fillStyle=`rgba(${r},${g},${b},0.15)`;
          ctx.fill();
        }
      }

      // Velvet outer dots (moving with body)
      {
        let dseed=42;
        const dr=()=>{dseed=(dseed*16807)%2147483647;return(dseed-1)/2147483646;};
        for(let i=0;i<80;i++){
          const a=dr()*Math.PI*2;
          const rr=125+dr()*15;
          const dx=Math.cos(a)*rr*(1+Math.sin(t*2.6+i*0.4)*0.04);
          const dy=Math.sin(a)*rr*0.63*(1+Math.sin(t*2.6+i*0.4)*0.04);
          ctx.beginPath();
          ctx.arc(dx,dy,1.2+dr()*2,0,Math.PI*2);
          ctx.fillStyle=`rgba(140,80,220,${0.4+dr()*0.3})`;
          ctx.fill();
        }
      }

      // Solar crown (grows on top)
      ctx.save();
      ctx.translate(0,-78);
      for(let i=0;i<9;i++){
        const a=-Math.PI/2+((i-4)/4)*(Math.PI/2.2);
        const len=22+Math.sin(t*4+i)*5;
        ctx.beginPath();
        ctx.moveTo(0,0);
        ctx.lineTo(Math.cos(a)*len, Math.sin(a)*len);
        ctx.strokeStyle=`rgba(255,220,80,${0.5+Math.sin(t*3+i)*0.3})`;
        ctx.lineWidth=1.5;
        ctx.stroke();
      }
      ctx.beginPath();
      ctx.arc(0,0,8,0,Math.PI*2);
      ctx.fillStyle="rgba(255,240,100,0.9)";
      ctx.fill();
      ctx.restore();

      // Wheel arcs (grown into body base)
      for(const wx of [-68,68]){
        ctx.save();
        ctx.translate(wx, 68);
        ctx.beginPath();
        ctx.arc(0,0,26,0,Math.PI*2);
        ctx.strokeStyle="rgba(200,160,48,0.5)";
        ctx.lineWidth=2;
        ctx.stroke();
        // Spoke flex
        for(let i=0;i<6;i++){
          const a=(i/6)*Math.PI*2+t*0.5*(wx<0?1:-1);
          ctx.beginPath();
          ctx.moveTo(0,0);
          ctx.bezierCurveTo(
            Math.cos(a-0.4)*14, Math.sin(a-0.4)*14,
            Math.cos(a)*20, Math.sin(a)*20,
            Math.cos(a)*26, Math.sin(a)*26
          );
          ctx.strokeStyle="rgba(200,160,48,0.4)";
          ctx.lineWidth=1.2;
          ctx.stroke();
        }
        ctx.beginPath();
        ctx.arc(0,0,4,0,Math.PI*2);
        ctx.fillStyle="rgba(255,220,80,0.8)";
        ctx.fill();
        ctx.restore();
      }

      ctx.restore();

      // Stress legend
      ctx.font=`7px ${MONO}`;
      ctx.fillStyle=V.green+"AA";ctx.fillText("relaxed",6,H-20);
      ctx.fillStyle=V.amb+"AA";ctx.fillText("flex",60,H-20);
      ctx.fillStyle=V.plasma+"AA";ctx.fillText("stressed",102,H-20);

      // Readouts
      ctx.fillStyle="rgba(184,204,232,0.45)";
      ctx.fillText(`sway: ${sway.toFixed(1)}mm`,W-100,14);
      ctx.fillText(`bounce: ${bounce.toFixed(1)}mm`,W-100,24);
      ctx.fillText(`rock: ${(rock*180/Math.PI).toFixed(1)}deg`,W-100,34);

      rafRef.current=requestAnimationFrame(tick);
    }
    rafRef.current=requestAnimationFrame(tick);
    return()=>cancelAnimationFrame(rafRef.current);
  },[]);

  return(
    <canvas ref={ref} width={420} height={260}
      style={{width:"100%",borderRadius:8,
        border:"1px solid rgba(200,160,48,0.18)",display:"block"}}/>
  );
}

// ── Material cross section ───────────────────────────────────────────────────
function CrossSectionCanvas(){
  const ref=useRef<HTMLCanvasElement>(null);
  const rafRef=useRef<number>(0);
  const tRef=useRef(0);

  useEffect(()=>{
    const canvas=ref.current;
    if(!canvas) return;
    const ctx=canvas.getContext("2d");
    if(!ctx) return;
    const W=canvas.width, H=canvas.height;
    const cx=W/2, cy=H/2;

    let dseed=55;
    const dr=()=>{dseed=(dseed*16807)%2147483647;return(dseed-1)/2147483646;};
    const vDots:{a:number;r:number;sz:number}[]=[];
    for(let i=0;i<200;i++) vDots.push({a:dr()*Math.PI*2,r:88+dr()*18,sz:0.8+dr()*2.5});
    const gyroidPts:{a:number;r:number}[]=[];
    for(let i=0;i<60;i++) gyroidPts.push({a:(i/60)*Math.PI*2,r:24+Math.sin(i*3)*8});

    function tick(){
      tRef.current+=0.02;
      const t=tRef.current;

      ctx.fillStyle="#010308";
      ctx.fillRect(0,0,W,H);

      // Layer labels
      const layers=[
        {label:"VELVET SKIN",r:100,col:"rgba(140,80,220,0.8)"},
        {label:"RIB SHELL",r:82,col:"rgba(200,160,48,0.7)"},
        {label:"COMPOSITE",r:62,col:"rgba(255,153,51,0.6)"},
        {label:"GYROID CORE",r:38,col:"rgba(0,255,178,0.7)"},
        {label:"RESONANCE",r:18,col:"rgba(153,102,255,0.8)"},
      ];

      // Layer fills
      for(let i=layers.length-1;i>=0;i--){
        const l=layers[i];
        if(isFinite(cx)&&isFinite(cy)){
          const g=ctx.createRadialGradient(cx,cy,0,cx,cy,l.r);
          const next=i<layers.length-1?layers[i+1].r:0;
          g.addColorStop(0,"transparent");
          g.addColorStop(next/l.r,"transparent");
          g.addColorStop(next/l.r+0.01,l.col.replace("0.",`0.${i+1}`));
          g.addColorStop(1,l.col);
          ctx.beginPath();
          ctx.arc(cx,cy,l.r,0,Math.PI*2);
          ctx.fillStyle=g;
          ctx.fill();
          // Ring outline
          ctx.beginPath();
          ctx.arc(cx,cy,l.r,0,Math.PI*2);
          ctx.strokeStyle=l.col;
          ctx.lineWidth=0.8;
          ctx.setLineDash([3,3]);
          ctx.stroke();
          ctx.setLineDash([]);
        }
      }

      // Rib lines in the shell layer
      for(let i=0;i<10;i++){
        const a=(i/10)*Math.PI*2;
        ctx.beginPath();
        ctx.moveTo(cx+Math.cos(a)*42,cy+Math.sin(a)*42);
        ctx.lineTo(cx+Math.cos(a)*80,cy+Math.sin(a)*80);
        ctx.strokeStyle=`rgba(200,160,48,${0.3+Math.sin(t*2+i)*0.15})`;
        ctx.lineWidth=1.5;
        ctx.stroke();
      }

      // Gyroid pattern in core
      ctx.save();
      ctx.beginPath();
      ctx.arc(cx,cy,38,0,Math.PI*2);
      ctx.clip();
      for(const p of gyroidPts){
        const px=cx+Math.cos(p.a+t*0.3)*p.r;
        const py=cy+Math.sin(p.a+t*0.3)*p.r*0.7;
        if(isFinite(px)&&isFinite(py)){
          ctx.beginPath();
          ctx.arc(px,py,2.5,0,Math.PI*2);
          ctx.fillStyle=`rgba(0,255,178,${0.4+Math.sin(t*2+p.a)*0.2})`;
          ctx.fill();
        }
      }
      ctx.restore();

      // Velvet dots on outer ring
      for(const d of vDots){
        const px=cx+Math.cos(d.a)*d.r;
        const py=cy+Math.sin(d.a)*d.r*0.85;
        if(isFinite(px)&&isFinite(py)){
          ctx.beginPath();
          ctx.arc(px,py,d.sz,0,Math.PI*2);
          ctx.fillStyle=`rgba(160,90,240,${0.3+Math.sin(t+d.a)*0.15})`;
          ctx.fill();
        }
      }

      // Center resonance pulse
      const p=0.5+0.5*Math.sin(t*4);
      if(isFinite(cx)&&isFinite(cy)){
        const pg=ctx.createRadialGradient(cx,cy,0,cx,cy,18);
        pg.addColorStop(0,`rgba(153,102,255,${p*0.9})`);
        pg.addColorStop(1,"transparent");
        ctx.beginPath();
        ctx.arc(cx,cy,18,0,Math.PI*2);
        ctx.fillStyle=pg;
        ctx.fill();
      }

      // Labels with leader lines
      layers.forEach((l,i)=>{
        const ang=-Math.PI*0.3+i*0.22;
        const lx=cx+Math.cos(ang)*(l.r+18);
        const ly=cy+Math.sin(ang)*(l.r+18);
        ctx.strokeStyle=l.col;
        ctx.lineWidth=0.7;
        ctx.beginPath();
        ctx.moveTo(cx+Math.cos(ang)*l.r,cy+Math.sin(ang)*l.r*0.9);
        ctx.lineTo(lx,ly);
        ctx.lineTo(lx+(ang>0?10:-10),ly);
        ctx.stroke();
        ctx.fillStyle=l.col;
        ctx.font=`7px ${MONO}`;
        ctx.textAlign=ang>0?"left":"right";
        ctx.fillText(l.label,lx+(ang>0?12:-12),ly+3);
      });
      ctx.textAlign="left";

      rafRef.current=requestAnimationFrame(tick);
    }
    rafRef.current=requestAnimationFrame(tick);
    return()=>cancelAnimationFrame(rafRef.current);
  },[]);

  return(
    <canvas ref={ref} width={280} height={280}
      style={{display:"block",borderRadius:"50%",
        border:"1px solid rgba(153,102,255,0.22)"}}/>
  );
}

// ── Main ──────────────────────────────────────────────────────────────────────
export default function ResonantCarriage(){
  const [openCard,setOpenCard]=useState<number|null>(null);

  const cards=[
    {title:"Grown as one piece",col:V.vio,
      body:"Traditional carriages are assembled: ribs fastened to frame, panels bolted to ribs, surface glued to panels. Every joint is a stress concentration, a failure point, a coherence break. The resonant carriage is grown as a single continuous body -- like a nautilus shell or a bone -- with continuously graded density and geometry. No joints. No fasteners. No seams. The whole body flexes together because it has always been one."},
    {title:"Ribbed flexural shell",col:V.gold,
      body:"The ribs are not stiffeners -- they are the flex pattern. Each rib arc carries bending energy across the whole circumference, distributing it in the same way the Bouligand architecture distributes impact: every direction is equally absorbed. When the carriage hits a bump, the rib shell transmits the wave around the body and back. The shock is not blocked -- it is resonated out."},
    {title:"Velvet dense pluffed surface",col:V.plasma,
      body:"The outer surface is a dense fiber mat -- velvet -- mechanically bonded to the rib shell during growth, not applied afterward. The pile fibers act as damping elements: each fiber is a tiny tuned mass damper. Dense pile (800+ grams per square metre) absorbs high-frequency vibration that the rib shell transmits. Rounded geometry (no corners, no edges) means no stress concentration at the surface. The carriage feels soft because the surface IS the damping mechanism."},
    {title:"One sun -- one resonant frequency",col:V.aurora,
      body:"The solar mechanism at the crown is not an attachment -- it is the termination of the rib arcs. The ribs grow up and outward to form the solar collection surface, then curve back inward at the apex to form the mechanical drive linkage. One continuous material path: solar input at top, mechanical output at wheels, passenger envelope in between. The whole system has one natural frequency, tuned at the geometry level, not by adding dampers after the fact."},
  ];

  return(
    <div style={{minHeight:"100vh",background:V.bg,padding:"48px 24px 100px",
      maxWidth:900,margin:"0 auto"}}>

      {/* Header */}
      <div style={{marginBottom:44}}>
        <div style={{fontFamily:MONO,fontSize:8,color:V.vio+"88",
          letterSpacing:"0.25em",marginBottom:10}}>
          AETHER TRANSPORT SYNTHESIS -- GROWN MONO-BODY VARIANT
        </div>
        <h1 style={{margin:"0 0 10px",fontFamily:DISP,
          fontSize:"clamp(1.4rem,4vw,2.2rem)",fontWeight:400,
          color:V.vio,letterSpacing:"0.15em",lineHeight:1.2}}>
          THE RESONANT CARRIAGE
        </h1>
        <div style={{fontFamily:SERIF,fontSize:"1.05rem",
          color:"rgba(184,204,232,0.75)",letterSpacing:"0.04em",marginBottom:18}}>
          Grown as One Piece -- Ribbed Flexural Shell -- Velvet Pluffed Surface --
          Solar Mechanism Integrated at Crown -- One Resonant Frequency
        </div>
        <div style={{display:"flex",flexWrap:"wrap" as const,gap:5,marginBottom:20}}>
          <Chip col={V.vio}>Grown Mono-body</Chip>
          <Chip col={V.gold}>Ribbed Flexural Shell</Chip>
          <Chip col={V.plasma}>Velvet Surface</Chip>
          <Chip col={V.aurora}>One Resonant Frequency</Chip>
          <Chip col={V.amb}>Solar Crown</Chip>
        </div>
        <div style={{height:1,background:`linear-gradient(90deg,${V.vio}44,transparent)`}}/>
      </div>

      {/* Concept cards */}
      <div style={{marginBottom:44,display:"grid",
        gridTemplateColumns:"1fr 1fr",gap:10}}>
        {cards.map((c,i)=>{
          const open=openCard===i;
          return(
            <div key={i} onClick={()=>setOpenCard(open?null:i)}
              style={{padding:"16px 18px",borderRadius:8,cursor:"pointer",
                transition:"all 0.25s",
                background:open?`${c.col}0E`:`${c.col}06`,
                border:`1px solid ${open?c.col:c.col+"33"}`}}>
              <div style={{fontFamily:DISP,fontSize:"0.88rem",color:c.col,
                letterSpacing:"0.1em",marginBottom:open?12:0}}>{c.title}</div>
              {open&&<div style={{fontFamily:SERIF,fontSize:"0.88rem",
                color:"rgba(184,204,232,0.75)",lineHeight:1.72}}>{c.body}</div>}
            </div>
          );
        })}
      </div>

      {/* Main growth simulation */}
      <div style={{marginBottom:44}}>
        <SectionHead n="I" title="MORPHOGENETIC GROWTH SIMULATION" col={V.vio}/>
        <div style={{marginBottom:12}}>
          <GrowthCanvas/>
        </div>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:10}}>
          {[
            {phase:"PHASE 1",label:"Parts Growing",col:V.gold,
              desc:"Solar crown, rib shell body, and wheel arcs grow independently from separate seed points."},
            {phase:"PHASE 2",label:"Merging",col:V.vio,
              desc:"The three mechanism pieces grow toward each other. Boundaries dissolve. Material gradients merge seamlessly."},
            {phase:"PHASE 3",label:"Unified Body",col:V.aurora,
              desc:"One continuous structure. No joints. The resonance ring appears -- the whole body now has one natural frequency."},
          ].map(p=>(
            <div key={p.phase} style={{padding:"12px 14px",borderRadius:6,
              background:`${p.col}08`,border:`1px solid ${p.col}28`}}>
              <div style={{fontFamily:MONO,fontSize:8,color:p.col,letterSpacing:"0.15em"}}>{p.phase}</div>
              <div style={{fontFamily:MONO,fontSize:8,color:p.col+"AA",
                marginBottom:6}}>{p.label}</div>
              <div style={{fontFamily:SERIF,fontSize:"0.82rem",
                color:"rgba(184,204,232,0.6)",lineHeight:1.5}}>{p.desc}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Resonance + flex side by side */}
      <div style={{marginBottom:44}}>
        <SectionHead n="II" title="RESONANCE AND FLEX MECHANICS" col={V.gold}/>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:16,
          alignItems:"start"}}>
          <div>
            <div style={{fontFamily:MONO,fontSize:8,color:V.vio,
              letterSpacing:"0.14em",marginBottom:8}}>
              STANDING WAVE -- CLICK TO STRIKE
            </div>
            <ResonanceCanvas/>
            <div style={{fontFamily:SERIF,fontSize:"0.82rem",
              color:"rgba(184,204,232,0.55)",marginTop:8,lineHeight:1.5}}>
              The carriage body as a 2D resonant membrane. Aurora = compression,
              blue = rarefaction, dim = nodal lines. Click anywhere inside to
              strike the body and watch the wave propagate. The mono-body
              settles to its fundamental mode naturally.
            </div>
          </div>
          <div>
            <div style={{fontFamily:MONO,fontSize:8,color:V.gold,
              letterSpacing:"0.14em",marginBottom:8}}>
              MULTI-AXIS FLEX -- SWAY + ROCK + BOUNCE
            </div>
            <FlexCanvas/>
            <div style={{fontFamily:SERIF,fontSize:"0.82rem",
              color:"rgba(184,204,232,0.55)",marginTop:8,lineHeight:1.5}}>
              All three motion axes simultaneously. Rib shell flex is color-coded:
              green (relaxed), amber (moderate), plasma (peak stress). The velvet
              dots on the outer surface follow the body motion -- they are the
              surface, not a coating.
            </div>
          </div>
        </div>
      </div>

      {/* Cross section + math */}
      <div style={{marginBottom:44}}>
        <SectionHead n="III" title="MATERIAL CROSS SECTION AND MATHEMATICS" col={V.plasma}/>
        <div style={{display:"grid",gridTemplateColumns:"auto 1fr",gap:28,alignItems:"center"}}>
          <CrossSectionCanvas/>
          <div style={{display:"flex",flexDirection:"column" as const,gap:10}}>
            {[
              {label:"Resonant frequency (grown shell)",
                tex:"f_0 = \\dfrac{1}{2\\pi}\\sqrt{\\dfrac{k_{\\text{rib}}}{m_{\\text{body}}}}",
                col:V.vio,
                note:"k_rib is the flexural stiffness of the grown rib shell. m_body includes velvet mass. Both tuned at geometry level during growth."},
              {label:"Flexural wave transmission",
                tex:"E_{\\text{trans}} = E_0 \\cdot e^{-\\alpha x} \\cdot \\cos(kx - \\omega t)",
                col:V.gold,
                note:"Shock energy decays exponentially as it propagates around the rib shell circumference, dissipated into the velvet fiber mat."},
              {label:"Velvet damping ratio",
                tex:"\\zeta = \\dfrac{c_{\\text{pile}}}{2\\sqrt{k_{\\text{rib}}\\,m_{\\text{body}}}}",
                col:V.plasma,
                note:"c_pile is the viscous damping coefficient of the velvet pile fibers. Dense pile (800g/m2 = high c) gives optimal damping ratio zeta ~ 0.15."},
              {label:"Grown body coherence",
                tex:"C(x,t) = 1 - \\dfrac{\\|E(t)\\|}{\\|X^*\\|}\\quad\\approx 0.97",
                col:V.aurora,
                note:"No joints means no coherence breaks. The grown body reaches C ~ 0.97 versus an assembled carriage at C ~ 0.72 under terrain load."},
            ].map(m=>(
              <div key={m.label} style={{padding:"12px 14px",borderRadius:6,
                background:`${m.col}07`,border:`1px solid ${m.col}22`}}>
                <div style={{fontFamily:MONO,fontSize:7,color:m.col,
                  letterSpacing:"0.13em",marginBottom:6}}>{m.label.toUpperCase()}</div>
                <div dangerouslySetInnerHTML={{__html:kx(m.tex,true)}}
                  style={{color:m.col,marginBottom:6}}/>
                <div style={{fontFamily:SERIF,fontSize:"0.8rem",
                  color:V.dim,lineHeight:1.45}}>{m.note}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* The sun mechanism */}
      <div style={{marginBottom:44}}>
        <SectionHead n="IV" title="THE SUN MECHANISTIC RUNNING PART" col={V.gold}/>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:10,marginBottom:16}}>
          {[
            {label:"Grown rib arc terminations",
              desc:"The upper ribs do not end -- they curve outward and upward to form the solar collection surface. The same material that forms the passenger shell is the solar collector. Maximum structural continuity.",col:V.gold},
            {label:"Photovoltaic grown surface",
              desc:"Gold nanoparticle DSSC layer is deposited during the final growth phase -- not attached afterward. Grows into the rib surface as a conformal coating. Acts as both photovoltaic cell and plasmonic concentrator.",col:V.amb},
            {label:"Crown-to-wheel drive path",
              desc:"Solar current flows through conductive grown channels (carbon nanotube fibers woven into the rib material) from crown to wheel hub motors. One material, one current path, no connectors.",col:V.aurora},
          ].map(s=>(
            <div key={s.label} style={{padding:"14px",borderRadius:6,
              background:`${s.col}08`,border:`1px solid ${s.col}28`}}>
              <div style={{fontFamily:MONO,fontSize:8,color:s.col,
                letterSpacing:"0.1em",marginBottom:8}}>{s.label}</div>
              <div style={{fontFamily:SERIF,fontSize:"0.85rem",
                color:"rgba(184,204,232,0.65)",lineHeight:1.65}}>{s.desc}</div>
            </div>
          ))}
        </div>
        <div style={{padding:"18px 22px",background:"rgba(0,255,178,0.04)",
          border:"1px solid rgba(0,255,178,0.14)",borderRadius:8}}>
          <div dangerouslySetInnerHTML={{__html:kx(
            "\\text{Sun} \\xrightarrow{\\text{DSSC crown}} P_{\\text{elec}} \\xrightarrow{\\text{CNT rib path}} \\tau_{\\text{wheel}} \\xrightarrow{\\text{resonant body}} v_{\\text{carriage}}",
            true)}} style={{color:V.aurora}}/>
          <div style={{fontFamily:SERIF,fontSize:"0.88rem",
            color:"rgba(184,204,232,0.65)",marginTop:12,lineHeight:1.7}}>
            One material path from photon to motion. The resonant body is not a passenger
            container with a drivetrain bolted on -- it is the drivetrain. The solar crown
            is the engine. The ribs are the transmission. The wheels are grown extensions
            of the base rib arcs. One piece. One frequency. One system.
          </div>
        </div>
      </div>

      {/* Comparison table */}
      <div style={{marginBottom:44}}>
        <SectionHead n="V" title="ASSEMBLED VS GROWN -- COHERENCE COMPARISON" col={V.dim}/>
        <div style={{border:"1px solid rgba(58,80,96,0.4)",borderRadius:8,overflow:"hidden"}}>
          {[
            {prop:"Joint count",assembled:"240-380 fastened joints",grown:"0 -- continuous mono-body",win:"grown"},
            {prop:"Coherence C(x,t)",assembled:"0.68-0.74 (joints break field)",grown:"0.94-0.97",win:"grown"},
            {prop:"Shock path",assembled:"Impact -- frame -- passenger (impulse)",grown:"Impact -- rib wave -- distributed out",win:"grown"},
            {prop:"Natural frequency",assembled:"Multiple competing modes",grown:"One tuned fundamental mode",win:"grown"},
            {prop:"Velvet surface",assembled:"Applied coating (adhesion failure point)",grown:"Grown into rib surface",win:"grown"},
            {prop:"Solar integration",assembled:"Panel mounted on roof (joint)",grown:"Crown ribs ARE the collector",win:"grown"},
            {prop:"Build method",assembled:"CNC machined + fastened",grown:"Bioprinted or resin-grown mould",win:"grown"},
            {prop:"Repair",assembled:"Replace component",grown:"Bio-regrowth (speculative)",win:"assembled"},
          ].map((row,i)=>(
            <div key={row.prop} style={{
              display:"grid",gridTemplateColumns:"130px 1fr 1fr",
              gap:16,padding:"10px 16px",
              background:i%2===0?"rgba(4,6,18,0.5)":"rgba(4,6,18,0.25)",
              borderBottom:i<7?"1px solid rgba(58,80,96,0.3)":"none"}}>
              <div style={{fontFamily:MONO,fontSize:8,color:V.dim}}>{row.prop}</div>
              <div style={{fontFamily:SERIF,fontSize:"0.83rem",
                color:row.win==="assembled"?V.gold+"CC":"rgba(184,204,232,0.5)"}}>{row.assembled}</div>
              <div style={{fontFamily:SERIF,fontSize:"0.83rem",
                color:row.win==="grown"?V.aurora:"rgba(184,204,232,0.5)"}}>{row.grown}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Footer */}
      <div style={{borderTop:`1px solid ${V.dim}44`,paddingTop:24,
        display:"flex",justifyContent:"space-between",flexWrap:"wrap" as const,gap:12}}>
        <div style={{fontFamily:MONO,fontSize:8,color:V.dim}}>
          AETHER KNOWLEDGE SYSTEM -- RESONANT CARRIAGE (GROWN VARIANT)
        </div>
        <div style={{fontFamily:MONO,fontSize:8,color:V.dim,textAlign:"right" as const}}>
          <div>Grown Mono-body -- Ribbed Flexural Shell</div>
          <div>Velvet Damping Surface -- Solar Crown Integration</div>
        </div>
      </div>
    </div>
  );
}
