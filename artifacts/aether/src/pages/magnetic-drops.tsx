import { useEffect, useRef, useState } from "react";

/* ── Palette ──────────────────────────────────────────────── */
const BG   = "#050810";
const GOLD = "#e6b85c";
const CYAN = "#7cd7ff";
const VIO  = "#b49cff";
const ROSE = "#f49ab6";
const TEXT = "#c8d8e8";
const DIM  = "#3a5060";
const mono  = "'Space Mono', monospace";
const serif = "'Cinzel', serif";
const body  = "'Crimson Pro', Georgia, serif";

/* ══════════════════════════════════════════════════════════
   SOLAR SPECTRAL BARS CANVAS
   72 frequency bars · UV 380nm → IR 780nm
   Planck blackbody spectrum at T=5778K (solar surface)
   DP coherence wave emanates from 550nm peak outward
   Coherent bars: bright, tall, sharp rays
   Decoherent bars: dim, short, phase-noisy
══════════════════════════════════════════════════════════ */
const N_BARS   = 72;
const LMIN     = 380;
const LMAX     = 780;
const LPEAK    = 550;

function planckNorm(lam_nm: number): number {
  const l = lam_nm * 1e-9;
  const h = 6.626e-34, c = 3e8, k = 1.38e-23, T = 5778;
  return (1 / Math.pow(l, 5)) / (Math.exp(h * c / (l * k * T)) - 1);
}

function wavToRgb(nm: number): [number, number, number] {
  let r = 0, g = 0, b = 0;
  if      (nm < 420) { r = 0.9*(420-nm)/40; b = 1; }
  else if (nm < 440) { r = (440-nm)/20; b = 1; }
  else if (nm < 490) { g = (nm-440)/50; b = 1; }
  else if (nm < 510) { g = 1; b = (510-nm)/20; }
  else if (nm < 580) { g = 1; r = (nm-510)/70; }
  else if (nm < 645) { r = 1; g = (645-nm)/65; }
  else               { r = 1; }
  const edge = nm < 420 ? 0.3 + (nm-380)/40*0.7
             : nm > 700 ? Math.max(0.1, 1-(nm-700)/80*0.8)
             : 1;
  return [
    Math.round(Math.pow(r * edge, 0.82) * 255),
    Math.round(Math.pow(g * edge, 0.82) * 255),
    Math.round(Math.pow(b * edge, 0.82) * 255),
  ];
}

function SolarSpectralBarsCanvas() {
  const cvRef  = useRef<HTMLCanvasElement>(null);
  const rafRef = useRef(0);

  const lambdas = Array.from({length: N_BARS}, (_, i) =>
    LMIN + (i / (N_BARS - 1)) * (LMAX - LMIN));
  const rawI  = lambdas.map(planckNorm);
  const maxI  = Math.max(...rawI);
  const normI = rawI.map(v => v / maxI);
  const PEAK_IDX = Math.round((LPEAK - LMIN) / (LMAX - LMIN) * (N_BARS - 1));

  useEffect(() => {
    const cv = cvRef.current; if (!cv) return;
    const ctx = cv.getContext("2d")!;
    const W = cv.width, H = cv.height;

    const coh = Float32Array.from({length: N_BARS}, () => 0.15 + Math.random() * 0.45);
    const phi = Float32Array.from({length: N_BARS}, () => Math.random() * Math.PI * 2);

    const SUN_X = W / 2, SUN_Y = 54;
    const BAR_W_TOT = W * 0.9;
    const BAR_STEP  = BAR_W_TOT / N_BARS;
    const BAR_INNER = BAR_STEP * 0.68;
    const BAR_OX    = (W - BAR_W_TOT) / 2;
    const BAR_TOP   = SUN_Y + 32;
    const BAR_MAX_H = H - BAR_TOP - 44;

    let frame = 0;

    const updateDP = () => {
      const t = frame * 0.005;
      const next = new Float32Array(N_BARS);
      for (let i = 0; i < N_BARS; i++) {
        const c = coh[i];
        let wSum = 0, cSum = 0;
        for (let j = Math.max(0, i-5); j <= Math.min(N_BARS-1, i+5); j++) {
          if (j === i) continue;
          const w = 1 / (1 + Math.abs(j-i) * 0.7);
          cSum += coh[j] * w; wSum += w;
        }
        const nbr = wSum > 0 ? cSum / wSum : c;
        const distPeak = Math.abs(i - PEAK_IDX) / N_BARS;
        const attractor = 0.5 + 0.44 * Math.sin(t - distPeak * 14 + frame * 0.0028);
        next[i] = Math.max(0.04, Math.min(0.96,
          0.83*c + 0.09*nbr + 0.06*attractor + (Math.random()-0.5)*0.016
        ));
        if (c < 0.42) phi[i] += 0.022 * (0.5-c) * (Math.sin(i*6.1) > 0 ? 1 : -1);
      }
      for (let i = 0; i < N_BARS; i++) coh[i] = next[i];
    };

    const draw = () => {
      frame++;
      updateDP();
      ctx.fillStyle = BG; ctx.fillRect(0, 0, W, H);

      const bg = ctx.createRadialGradient(SUN_X, SUN_Y, 0, SUN_X, SUN_Y, H * 1.1);
      bg.addColorStop(0, "rgba(255,240,180,0.09)");
      bg.addColorStop(0.35, "rgba(255,200,80,0.03)");
      bg.addColorStop(1, "rgba(5,8,16,0)");
      ctx.fillStyle = bg; ctx.fillRect(0, 0, W, H);

      for (let i = 0; i < N_BARS; i++) {
        const lambda = lambdas[i];
        const [r, g, b] = wavToRgb(lambda);
        const c = coh[i];
        const planckH = normI[i];
        const boost  = c * 0.28;
        const flutter = (1 - c) * 0.07 * Math.sin(frame * 0.055 + phi[i]);
        const barH = Math.max(3, (planckH + boost + flutter) * BAR_MAX_H);
        const bx   = BAR_OX + i * BAR_STEP;
        const alpha = 0.18 + c * 0.78;

        ctx.beginPath();
        ctx.moveTo(SUN_X, SUN_Y + 20);
        ctx.lineTo(bx + BAR_INNER / 2, BAR_TOP);
        ctx.strokeStyle = `rgba(${r},${g},${b},${c * 0.10})`;
        ctx.lineWidth = 0.35; ctx.stroke();

        if (c > 0.48) {
          const gx = ctx.createLinearGradient(bx, BAR_TOP, bx, BAR_TOP + barH * c);
          gx.addColorStop(0, `rgba(${r},${g},${b},${(c-0.48)*0.6})`);
          gx.addColorStop(1, `rgba(${r},${g},${b},0)`);
          ctx.fillStyle = gx;
          ctx.fillRect(bx - 3, BAR_TOP, BAR_INNER + 6, barH * c);
        }

        const grad = ctx.createLinearGradient(0, BAR_TOP, 0, BAR_TOP + barH);
        grad.addColorStop(0,   `rgba(${r},${g},${b},${alpha})`);
        grad.addColorStop(0.55,`rgba(${Math.round(r*.8)},${Math.round(g*.8)},${Math.round(b*.8)},${alpha*.75})`);
        grad.addColorStop(1,   `rgba(${Math.round(r*.25)},${Math.round(g*.25)},${Math.round(b*.25)},${alpha*.3})`);
        ctx.fillStyle = grad;
        ctx.fillRect(bx, BAR_TOP, BAR_INNER, barH);

        if (c > 0.64) {
          const capG = ctx.createRadialGradient(bx + BAR_INNER/2, BAR_TOP, 0, bx + BAR_INNER/2, BAR_TOP, BAR_STEP * 2.2);
          capG.addColorStop(0, `rgba(${r},${g},${b},${(c-0.64)*1.6})`);
          capG.addColorStop(1, `rgba(${r},${g},${b},0)`);
          ctx.fillStyle = capG;
          ctx.fillRect(bx - BAR_STEP, BAR_TOP - BAR_STEP * 1.8, BAR_STEP * 3, BAR_STEP * 1.8);
        }
      }

      const avgCoh = Array.from(coh).reduce((s, v) => s + v, 0) / N_BARS;
      for (let ri = 0; ri < 28; ri++) {
        const ang = ri * Math.PI * 2 / 28 + frame * 0.0018;
        const len = 10 + 9 * Math.sin(frame * 0.045 + ri * 1.2) * avgCoh;
        ctx.beginPath();
        ctx.moveTo(SUN_X + Math.cos(ang) * 22, SUN_Y + Math.sin(ang) * 22);
        ctx.lineTo(SUN_X + Math.cos(ang) * (22 + len), SUN_Y + Math.sin(ang) * (22 + len));
        ctx.strokeStyle = `rgba(255,240,180,${0.10 + 0.12 * avgCoh})`;
        ctx.lineWidth = 0.65; ctx.stroke();
      }

      const solarG = ctx.createRadialGradient(SUN_X, SUN_Y, 0, SUN_X, SUN_Y, 44);
      solarG.addColorStop(0,   "rgba(255,255,230,0.98)");
      solarG.addColorStop(0.3, "rgba(255,240,160,0.88)");
      solarG.addColorStop(0.6, "rgba(255,200,80,0.55)");
      solarG.addColorStop(0.85,"rgba(255,160,40,0.18)");
      solarG.addColorStop(1,   "rgba(255,120,20,0)");
      ctx.fillStyle = solarG; ctx.fillRect(SUN_X - 48, SUN_Y - 48, 96, 96);

      ([
        [380,"UV",0.38],[440,"Violet",0.55],[490,"Blue",0.65],
        [550,"Green",0.8],[580,"Yellow",0.7],[630,"Orange",0.65],[700,"Red",0.55],[780,"IR",0.38]
      ] as [number,string,number][]).forEach(([nm, label, a]) => {
        if (nm < LMIN || nm > LMAX) return;
        const ii = Math.round((nm-LMIN)/(LMAX-LMIN)*(N_BARS-1));
        const bx2 = BAR_OX + ii * BAR_STEP;
        const [r2,g2,b2] = wavToRgb(nm);
        ctx.fillStyle = `rgba(${r2},${g2},${b2},${a*0.65})`;
        ctx.font = `5.5px ${mono}`; ctx.textAlign = "center";
        ctx.fillText(`${nm}`, bx2 + BAR_INNER/2, H - 24);
        ctx.fillStyle = `rgba(${r2},${g2},${b2},${a*0.45})`;
        ctx.fillText(label, bx2 + BAR_INNER/2, H - 13);
      });

      const peakBx = BAR_OX + PEAK_IDX * BAR_STEP;
      ctx.fillStyle = "rgba(255,255,180,0.35)"; ctx.textAlign = "center";
      ctx.font = `6px ${mono}`;
      ctx.fillText("⊙ PEAK · 550nm", peakBx + BAR_INNER/2, BAR_TOP - 10);

      ctx.fillStyle = "rgba(200,210,240,0.25)"; ctx.textAlign = "left";
      ctx.fillText("← UV DECOHERENT", BAR_OX, BAR_TOP - 10);
      ctx.textAlign = "right";
      ctx.fillText("IR DECOHERENT →", BAR_OX + BAR_W_TOT, BAR_TOP - 10);
      ctx.fillStyle = "rgba(255,240,180,0.20)"; ctx.textAlign = "center";
      ctx.fillText("SOLAR SPECTRAL RAY · PLANCK 5778K · DP COHERENCE FIELD", W/2, 16);

      rafRef.current = requestAnimationFrame(draw);
    };
    draw();
    return () => cancelAnimationFrame(rafRef.current);
  }, []);

  return (
    <canvas ref={cvRef} width={900} height={390}
      style={{ width:"100%", display:"block", borderRadius:12, background:BG,
        border:`1px solid rgba(255,240,180,0.08)` }} />
  );
}

/* ══════════════════════════════════════════════════════════
   MAGNETIC DROPS SIMULATION (original — now in fixed container)
══════════════════════════════════════════════════════════ */
interface Drop {
  x:number; y:number; vx:number; vy:number; r:number;
  phase:number; phaseV:number; theta:number; elongation:number;
  charge:1|-1; wobbleAmp:number; wobbleFreq:number; wobblePhase:number;
  hue:number; sat:number; spikes:number; spikePhase:number;
}

function makeDrop(i:number, total:number, W:number, H:number): Drop {
  const margin = 60;
  const spacing = (W-margin*2)/(total-1||1);
  const cx = total===1 ? W/2 : margin+i*spacing;
  const r0 = 14 + Math.random()*14;
  return {
    x:cx, y:H*0.5+(Math.random()-0.5)*60,
    vx:(Math.random()-0.5)*0.4, vy:(Math.random()-0.5)*0.4,
    r:r0, phase:Math.random()*Math.PI*2, phaseV:0.008+Math.random()*0.018,
    theta:Math.random()*Math.PI*2, elongation:1.0,
    charge:Math.random()>0.5?1:-1,
    wobbleAmp:0.08+Math.random()*0.14, wobbleFreq:0.5+Math.random()*1.5,
    wobblePhase:Math.random()*Math.PI*2,
    hue:200+Math.random()*80, sat:70+Math.random()*25,
    spikes:3+Math.floor(Math.random()*4), spikePhase:Math.random()*Math.PI*2,
  };
}

function fieldAt(x:number,y:number,t:number,W:number,H:number){
  const cx=W/2,cy=H/2,dx=x-cx,dy=y-cy;
  const dist=Math.sqrt(dx*dx+dy*dy)+1;
  const angle=t*0.4;
  const Bx=(Math.cos(angle)*dy-Math.sin(angle)*dx)/(dist*dist)*8000;
  const By=(Math.sin(angle)*dy+Math.cos(angle)*dx)/(dist*dist)*8000;
  return {Bx,By,mag:Math.sqrt(Bx*Bx+By*By)};
}

function dropInteraction(a:Drop,b:Drop,fs:number){
  const dx=b.x-a.x,dy=b.y-a.y,dist2=dx*dx+dy*dy,dist=Math.sqrt(dist2)+0.01;
  if(dist>280) return {fx:0,fy:0};
  const sign=a.charge*b.charge,F=sign*fs*180/(dist2+400);
  return {fx:-F*dx/dist,fy:-F*dy/dist};
}

function MagneticDropsCanvas({
  fieldStrength, dropCount, viscosity
}: {fieldStrength:number; dropCount:number; viscosity:number}) {
  const cvRef  = useRef<HTMLCanvasElement>(null);
  const rootRef = useRef<HTMLDivElement>(null);
  const dropsRef = useRef<Drop[]>([]);
  const rafRef  = useRef(0);
  const sizeRef = useRef({W:800, H:440});
  const parRef  = useRef({fieldStrength, dropCount, viscosity});
  parRef.current = {fieldStrength, dropCount, viscosity};

  const rebuild = () => {
    const {W,H}=sizeRef.current;
    dropsRef.current=Array.from({length:parRef.current.dropCount},(_,i)=>makeDrop(i,parRef.current.dropCount,W,H));
  };

  useEffect(()=>{rebuild();},[dropCount]);

  useEffect(()=>{
    const cv=cvRef.current,root=rootRef.current;
    if(!cv||!root) return;
    const ctx=cv.getContext("2d")!;

    const resize=()=>{
      const dpr=window.devicePixelRatio||1;
      const W=root.clientWidth,H=root.clientHeight;
      cv.width=W*dpr; cv.height=H*dpr;
      cv.style.width=W+"px"; cv.style.height=H+"px";
      ctx.setTransform(dpr,0,0,dpr,0,0);
      sizeRef.current={W,H}; rebuild();
    };
    resize();
    const ro=new ResizeObserver(resize); ro.observe(root);

    let t=0;

    function drawFieldLines(){
      const {W,H}=sizeRef.current;
      for(let li=0;li<18;li++){
        const startX=(W/18)*li+W/36;
        ctx.beginPath();
        let px=startX,py=0; ctx.moveTo(px,py);
        for(let step=0;step<80;step++){
          const {Bx,By}=fieldAt(px,py,t,W,H);
          const len=Math.sqrt(Bx*Bx+By*By)+0.01;
          px+=(Bx/len)*7; py+=(By/len)*7;
          if(px<-10||px>W+10||py<-10||py>H+10) break;
          ctx.lineTo(px,py);
        }
        ctx.strokeStyle=`rgba(80,140,255,${0.04+0.025*Math.sin(t*0.6+li)})`;
        ctx.lineWidth=0.6; ctx.stroke();
      }
    }

    function drawDrop(d:Drop){
      const {fieldStrength:fs}=parRef.current;
      const {x,y,r,elongation,theta,wobbleAmp,wobbleFreq,wobblePhase,spikes,spikePhase,hue,sat}=d;
      const elong=1+(elongation-1)*fs*0.6;
      const rA=r*elong,rB=r/Math.max(elong,0.9);
      ctx.save(); ctx.translate(x,y); ctx.rotate(theta);

      const grd=ctx.createRadialGradient(0,0,0,0,0,rA*1.8);
      grd.addColorStop(0,`hsla(${hue},${sat}%,65%,0.18)`);
      grd.addColorStop(1,`hsla(${hue},${sat}%,40%,0.0)`);
      ctx.beginPath(); ctx.ellipse(0,0,rA*1.8,rB*1.8,0,0,Math.PI*2);
      ctx.fillStyle=grd; ctx.fill();

      ctx.beginPath();
      const pts=120;
      for(let i=0;i<=pts;i++){
        const ang=(i/pts)*Math.PI*2;
        const spikeVal=Math.pow(Math.max(0,Math.cos(spikes*ang+spikePhase+t*0.8)),3.5);
        const wobble=1+wobbleAmp*Math.sin(wobbleFreq*ang*3+t*2.2+wobblePhase)*fs*0.5;
        const bx=Math.cos(ang)*rA,by=Math.sin(ang)*rB;
        const blen=Math.sqrt(bx*bx+by*by);
        const spikeLen=spikeVal*r*0.55*fs;
        const nx=bx/blen,ny=by/blen;
        const px=bx*wobble+nx*spikeLen,py=by*wobble+ny*spikeLen;
        i===0?ctx.moveTo(px,py):ctx.lineTo(px,py);
      }
      ctx.closePath();
      const bg=ctx.createRadialGradient(-rA*0.28,-rB*0.32,0,0,0,rA*1.1);
      bg.addColorStop(0,`hsla(${hue+25},${sat+10}%,80%,0.92)`);
      bg.addColorStop(0.35,`hsla(${hue+10},${sat+5}%,58%,0.92)`);
      bg.addColorStop(0.72,`hsla(${hue},${sat}%,36%,0.92)`);
      bg.addColorStop(1,`hsla(${hue-12},${sat-10}%,14%,0.92)`);
      ctx.fillStyle=bg; ctx.fill();
      ctx.strokeStyle=`hsla(${hue+30},90%,88%,0.28)`; ctx.lineWidth=0.8; ctx.stroke();

      ctx.beginPath(); ctx.ellipse(-rA*0.28,-rB*0.3,rA*0.22,rB*0.14,-0.3,0,Math.PI*2);
      const hl=ctx.createRadialGradient(-rA*0.28,-rB*0.3,0,-rA*0.28,-rB*0.3,rA*0.22);
      hl.addColorStop(0,"rgba(255,255,255,0.75)"); hl.addColorStop(1,"rgba(255,255,255,0)");
      ctx.fillStyle=hl; ctx.fill();
      ctx.restore();
    }

    function drawVectors(){
      dropsRef.current.forEach(d=>{
        const {Bx,By,mag}=fieldAt(d.x,d.y,t,sizeRef.current.W,sizeRef.current.H);
        if(mag<0.001) return;
        const {fieldStrength:fs}=parRef.current;
        const len=Math.min(28,mag*0.4)*fs;
        const nx=Bx/mag,ny=By/mag;
        ctx.save(); ctx.translate(d.x,d.y);
        ctx.beginPath();
        ctx.moveTo(-nx*len*0.5,-ny*len*0.5); ctx.lineTo(nx*len*0.5,ny*len*0.5);
        ctx.strokeStyle=`hsla(${d.hue+20},85%,75%,0.35)`; ctx.lineWidth=1;
        const hlen=5,hx=nx*len*0.5-nx*hlen,hy=ny*len*0.5-ny*hlen;
        const ppx=-ny*hlen*0.5,ppy=nx*hlen*0.5;
        ctx.moveTo(nx*len*0.5,ny*len*0.5); ctx.lineTo(hx+ppx,hy+ppy);
        ctx.moveTo(nx*len*0.5,ny*len*0.5); ctx.lineTo(hx-ppx,hy-ppy);
        ctx.stroke(); ctx.restore();
      });
    }

    function step(){
      const {W,H}=sizeRef.current;
      const {fieldStrength:fs,viscosity:visc}=parRef.current;
      dropsRef.current.forEach((d,i)=>{
        const {Bx,By,mag}=fieldAt(d.x,d.y,t,W,H);
        let dTheta=Math.atan2(By,Bx)-d.theta;
        while(dTheta>Math.PI) dTheta-=2*Math.PI;
        while(dTheta<-Math.PI) dTheta+=2*Math.PI;
        d.theta+=dTheta*0.04*fs;
        d.elongation+=(Math.min(1+mag*0.004*fs,1.8)-d.elongation)*0.06;
        const ty=H*0.5+Math.sin(d.phase+t*d.phaseV*fs*1.4)*(H*0.18);
        d.vy+=(ty-d.y)*0.004*fs;
        d.vx+=Math.sin(t*0.3+d.phase)*0.012*fs;
        dropsRef.current.forEach((b,j)=>{
          if(i===j) return;
          const {fx,fy}=dropInteraction(d,b,fs);
          d.vx+=fx*0.016; d.vy+=fy*0.016;
        });
        d.vx*=visc; d.vy*=visc;
        const spd=Math.sqrt(d.vx*d.vx+d.vy*d.vy);
        if(spd>4){d.vx*=4/spd;d.vy*=4/spd;}
        d.x+=d.vx; d.y+=d.vy;
        const m=d.r*1.8;
        if(d.x<m){d.x=m;d.vx=Math.abs(d.vx)*0.5;}
        if(d.x>W-m){d.x=W-m;d.vx=-Math.abs(d.vx)*0.5;}
        if(d.y<m){d.y=m;d.vy=Math.abs(d.vy)*0.5;}
        if(d.y>H-m){d.y=H-m;d.vy=-Math.abs(d.vy)*0.5;}
        d.spikePhase+=0.006*fs;
      });
    }

    function render(){
      const {W,H}=sizeRef.current;
      const drops=dropsRef.current;
      ctx.fillStyle="#050810"; ctx.fillRect(0,0,W,H);
      drawFieldLines();
      drops.forEach((a,i)=>{
        drops.forEach((b,j)=>{
          if(j<=i) return;
          const dx=b.x-a.x,dy=b.y-a.y,dist=Math.sqrt(dx*dx+dy*dy);
          if(dist<180&&a.charge!==b.charge){
            const al=(1-dist/180)*0.18*parRef.current.fieldStrength;
            ctx.beginPath(); ctx.moveTo(a.x,a.y); ctx.lineTo(b.x,b.y);
            ctx.strokeStyle=`rgba(120,180,255,${al})`; ctx.lineWidth=0.7; ctx.stroke();
          }
        });
      });
      step();
      drawVectors();
      drops.forEach(d=>drawDrop(d));
      t+=0.016;
      rafRef.current=requestAnimationFrame(render);
    }
    rafRef.current=requestAnimationFrame(render);
    return()=>{cancelAnimationFrame(rafRef.current);ro.disconnect();};
  },[]);

  return (
    <div ref={rootRef} style={{width:"100%",height:440,position:"relative",
      borderRadius:12,overflow:"hidden",border:`1px solid ${DIM}25`}}>
      <canvas ref={cvRef} style={{position:"absolute",inset:0}} />
    </div>
  );
}

/* ── UI helpers ───────────────────────────────────────────── */
function SH({n,title,sub,col=CYAN}:{n:string;title:string;sub:string;col?:string}) {
  return (
    <div style={{marginTop:52,marginBottom:4}}>
      <div style={{fontFamily:mono,fontSize:10,color:col,letterSpacing:3}}>{n}</div>
      <h2 style={{fontFamily:serif,fontSize:22,color:"#fff",margin:"6px 0 4px"}}>{title}</h2>
      <div style={{fontFamily:body,fontSize:15,color:DIM,marginBottom:16}}>{sub}</div>
      <div style={{height:1,background:`linear-gradient(90deg,${col}50,transparent)`,marginBottom:24}} />
    </div>
  );
}

function Card({col,title,sub:sub2,body:bd}:{col:string;title:string;sub:string;body:React.ReactNode}) {
  return (
    <div style={{background:`${col}08`,border:`1px solid ${col}22`,borderRadius:10,padding:"16px 18px"}}>
      <div style={{fontFamily:mono,fontSize:9,color:col,letterSpacing:2,marginBottom:6}}>{sub2}</div>
      <div style={{fontFamily:mono,fontSize:12,color:`${col}dd`,marginBottom:10}}>{title}</div>
      <div style={{fontFamily:body,fontSize:13.5,color:DIM,lineHeight:1.9}}>{bd}</div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════
   PAGE
══════════════════════════════════════════════════════════ */
export default function MagneticDropsPage() {
  const [field, setField] = useState(1.2);
  const [count, setCount] = useState(7);
  const [visc,  setVisc]  = useState(0.62);

  const slid: React.CSSProperties = {width:88, accentColor:CYAN};
  const lbl: React.CSSProperties  = {fontFamily:mono,fontSize:11,color:CYAN+"88",letterSpacing:"0.08em"};
  const val: React.CSSProperties  = {fontFamily:mono,fontSize:11,color:CYAN+"cc",minWidth:28,textAlign:"right"};
  const sep: React.CSSProperties  = {width:1,height:28,background:`${DIM}40`};

  return (
    <div style={{background:BG, minHeight:"100vh", color:TEXT}}>

      <div style={{flexShrink:0,padding:"8px 12px 0"}}>
        <div style={{display:"inline-block",border:`1px solid ${CYAN}99`,padding:"4px 12px",
          fontSize:10,letterSpacing:"0.2em",color:CYAN+"bb",fontFamily:"'DM Mono',monospace",marginBottom:12}}>
          LIVE SIMULATION
        </div>
        <div style={{background:"rgba(5,8,16,0.85)",borderLeft:`3px solid ${CYAN}`,
          borderRadius:4,padding:"10px 16px",marginBottom:20}}>
          <h2 style={{margin:0,fontSize:13,color:CYAN,fontFamily:"'DM Mono',monospace",
            letterSpacing:"0.15em",fontWeight:400}}>
            MAGNETIC DROPS · SOLAR SPECTRAL COHERENCE · DP FIELD · AETHER
          </h2>
          <p style={{margin:"4px 0 0",fontSize:10,color:CYAN+"55",
            fontFamily:"'DM Mono',monospace",letterSpacing:"0.1em"}}>
            Sunlight decomposed into 72 frequency bars (380→780nm) · DP coherence wave from 550nm peak ·
            ferrofluid drops in rotating magnetic field · coherent=bright ray, decoherent=dim shadow
          </p>
        </div>
      </div>

      <div style={{textAlign:"center",padding:"36px 24px 24px",
        background:`radial-gradient(ellipse 80% 60% at 50% 0%,rgba(230,184,92,0.06),rgba(124,215,255,0.04),transparent)`}}>
        <div style={{fontFamily:mono,fontSize:10,color:`${GOLD}70`,letterSpacing:4,marginBottom:12}}>
          AETHER · ELECTROMAGNETIC COHERENCE · SUNLIGHT AS SOURCE · MAGNETIC TOPOLOGY
        </div>
        <h1 style={{fontFamily:serif,fontSize:"clamp(20px,4.2vw,46px)",
          color:"#fff",margin:"0 0 10px",letterSpacing:1,lineHeight:1.2}}>
          MAGNETIC DROPS
          <span style={{color:GOLD}}> · SOLAR</span>
          <span style={{color:CYAN}}> SPECTRAL</span>
          <br />
          <span style={{color:VIO}}>COHERENCE</span>
          <span style={{color:DIM}}> ↔ </span>
          <span style={{color:ROSE}}>DECOHERENCE</span>
        </h1>
        <div style={{fontFamily:body,fontSize:16.5,color:DIM,maxWidth:860,margin:"0 auto",lineHeight:2.1}}>
          If we define <span style={{color:CYAN}}>coherent</span> and{" "}
          <span style={{color:ROSE}}>decoherent</span> as fundamental properties of light — not just
          quantum phenomena but the <em>source structure</em> of all physical law — then sunlight becomes
          the universal teacher. Each spectral frequency bar below is a{" "}
          <span style={{color:GOLD}}>ray of mathematical truth</span>: coherent bars encode the
          physics we can calculate; decoherent bars encode the physics we are still learning to see.
        </div>
      </div>

      <div style={{maxWidth:1100,margin:"0 auto",padding:"0 24px 80px"}}>

        <SH n="I" col={GOLD}
          title="Solar Spectral Ray · 72 Frequency Bars · DP Coherence Field"
          sub="Planck 5778K blackbody · 380nm UV → 780nm IR · coherence wave from 550nm peak outward · bright=coherent, dim=decoherent" />
        <SolarSpectralBarsCanvas />
        <div style={{fontFamily:mono,fontSize:7,color:DIM,marginTop:6,lineHeight:2}}>
          72 BARS spanning UV→IR · height = Planck irradiance × coherence boost ·
          DP update: 0.83·persistence + 0.09·neighbour + 0.06·attractor + noise ·
          wave period ~2π/(0.005×60fps) ≈ 21s emanating outward from 550nm (peak solar) ·
          coherent bars grow taller, brighter, sharper · decoherent bars flutter, dim, shorten
        </div>

        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:14,marginTop:28}}>
          <Card col={GOLD}
            sub="SUNLIGHT AS SOURCE"
            title="Blackbody · Thermal · Decoherent"
            body={<>The sun emits as a 5778K blackbody — classically <em>decoherent</em> by
              every quantum optics measure. Photons from different emission events carry no
              fixed phase relationship. The coherence length of sunlight is ~600 nm — barely
              one wavelength. Yet every equation in physics was derived from observations of this
              decoherent source. The bars at UV and IR edges are dim because they are maximally
              decoherent: few photons, wide phase distribution, low information density.</>} />
          <Card col={CYAN}
            sub="COHERENCE CHANGES PHYSICS"
            title="550nm Peak · Phase-locked Photons"
            body={<>The green–yellow peak (550nm) is the coherence anchor. Solar irradiance
              peaks here; the human eye evolved peak sensitivity here; photosynthesis evolved
              two reaction centres here (P680 / P700). If you reframe physics around the
              coherence structure of light rather than its energy alone, the{" "}
              <em>bar height is the truth</em>: what can be known coherently is tall and bright;
              what remains decoherent is short and dim — a map of epistemic access through light.</>} />
          <Card col={VIO}
            sub="MATHEMATICAL IMPLICATION"
            title="Coherent Light = Solvable Physics"
            body={<>Quantum electrodynamics uses coherent state superpositions — laser-like modes —
              as its mathematical basis, then treats thermal light as a statistical mixture.
              But if we <em>begin</em> from the solar spectral structure, the hierarchy reverses:
              decoherence is the ground state; coherence is the exception — the laser, the
              crystal, the superconductor. Every solvable physical law is a <em>coherence
              island</em> in a decoherent ocean. The bars show where those islands are.</>} />
        </div>

        <SH n="II" col={CYAN}
          title="Magnetic Drops · Oscillating Ferrofluid · Rotating Field"
          sub="Charged drops in a rotating dipole field · field lines, spike deformation, inter-drop coupling" />
        <MagneticDropsCanvas fieldStrength={field} dropCount={count} viscosity={visc} />

        <div style={{display:"flex",gap:18,alignItems:"center",justifyContent:"center",
          marginTop:14,background:"rgba(10,14,28,0.75)",border:`0.5px solid ${DIM}35`,
          borderRadius:10,padding:"10px 24px"}}>
          <span style={lbl}>Field</span>
          <input type="range" min="0.2" max="3.0" step="0.1" value={field} style={slid}
            onChange={e=>setField(parseFloat(e.target.value))} />
          <span style={val}>{field.toFixed(1)}</span>
          <div style={sep}/>
          <span style={lbl}>Drops</span>
          <input type="range" min="3" max="14" step="1" value={count} style={slid}
            onChange={e=>setCount(parseInt(e.target.value))} />
          <span style={val}>{count}</span>
          <div style={sep}/>
          <span style={lbl}>Viscosity</span>
          <input type="range" min="0.1" max="0.98" step="0.02" value={visc} style={slid}
            onChange={e=>setVisc(parseFloat(e.target.value))} />
          <span style={val}>{visc.toFixed(2)}</span>
        </div>

        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:14,marginTop:32}}>
          <Card col={ROSE}
            sub="COHERENCE → MAGNETIC ORDER"
            title="Ferrofluid drops = coherent magnetic domains"
            body={<>Each magnetic drop is a coherent domain — billions of iron nanoparticles
              with phase-locked magnetic moments pointing the same direction. The drop
              exists because ferromagnetic exchange coupling is a <em>coherence mechanism</em>:
              it enforces long-range phase alignment across nanometre distances.
              When the external field rotates, it acts like a decoherence event — the drop
              must re-align its internal coherence to match the new field phase, producing
              the elongation and spike formation visible in the simulation.</>} />
          <Card col={GOLD}
            sub="SUN → DROP · THE SAME PHYSICS"
            title="Solar coherence cascade → magnetic topology"
            body={<>The connection is direct: solar photons at 550nm (coherent peak) carry
              enough energy to drive photochemistry, which drives metabolism, which drives
              the mining and processing of iron, which becomes the ferrofluid. The coherence
              of sunlight is the <em>original source</em> of all ordered matter.
              Decoherent photons (UV, far IR) tend to destroy order — UV denatures proteins,
              far IR is just thermal noise. The bars in Section I are the energy budget
              of creation vs destruction, ordered by coherence.</>} />
          <Card col={CYAN}
            sub="DROPS AS SPECTRAL BARS"
            title="Each drop = one frequency bar · same DP"
            body={<>The magnetic drops obey the same DP-style dynamics as the spectral bars:
              each drop has internal coherence (magnetic alignment, shape stability), couples
              to its neighbours (opposite charges attract, same charges repel), and drifts
              if decoherent. High field strength = high coherence = tall sharp spikes.
              Low field = decoherent = round, relaxed drops. The visual language of the
              spectral bars and the drops is the same language — because the physics is
              the same physics viewed through two lenses.</>} />
          <Card col={VIO}
            sub="WHAT CHANGES"
            title="Physics reframed from coherence as ground truth"
            body={<>If we take sunlight-as-source seriously: mass is a coherence arrest
              (standing wave pattern locked in space); temperature is a decoherence measure
              (how far a system is from its coherent ground state); chemical bonding is
              local coherence between electron wave functions; consciousness might be a
              coherence basin in the brain's electromagnetic field. None of these are
              proven — but framing them through the spectral bar model gives each a
              quantitative handle: <em>how bright is that bar?</em></>} />
        </div>

      </div>
    </div>
  );
}
