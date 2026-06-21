import { useEffect, useRef } from "react";

/* ── Palette ─────────────────────────────────────────── */
const BG   = "#050810";
const TEAL = "#2ef0d8";
const GOLD = "#c9a84c";
const GRN  = "#44cc77";
const AMB  = "#ff9933";
const ROSE = "#ff4477";
const VIO  = "#9966ff";
const CYAN = "#44aaff";
const TEXT = "#c8d8e8";
const DIM  = "#2a4240";
const mono  = "'Space Mono', monospace";
const serif = "'Cinzel', serif";
const body  = "'Crimson Pro', Georgia, serif";

function wavToRgb(nm: number): [number, number, number] {
  let r=0,g=0,b=0;
  if(nm<420){r=0.9*(420-nm)/40;b=1;}
  else if(nm<440){r=(440-nm)/20;b=1;}
  else if(nm<490){g=(nm-440)/50;b=1;}
  else if(nm<510){g=1;b=(510-nm)/20;}
  else if(nm<580){g=1;r=(nm-510)/70;}
  else if(nm<645){r=1;g=(645-nm)/65;}
  else{r=1;}
  const edge=nm<420?0.3+(nm-380)/40*0.7:nm>700?Math.max(0.1,1-(nm-700)/80*0.8):1;
  return[
    Math.round(Math.pow(r*edge,0.82)*255),
    Math.round(Math.pow(g*edge,0.82)*255),
    Math.round(Math.pow(b*edge,0.82)*255)
  ];
}

function gauss(x:number,mu:number,sig:number){
  return Math.exp(-0.5*((x-mu)/sig)**2);
}

function planckNorm(lam_nm:number):number{
  const l=lam_nm*1e-9,h=6.626e-34,c=3e8,k=1.38e-23,T=5778;
  return(1/Math.pow(l,5))/(Math.exp(h*c/(l*k*T))-1);
}

/* ══════════════════════════════════════════════════════
   CANVAS I · Quantum Photosynthesis — Antenna Complex
   Left: coherent quantum walk (all sites simultaneously)
   Right: decoherent classical hop (one site at a time)
══════════════════════════════════════════════════════ */
function QuantumPhotosynthesisCanvas() {
  const cvRef = useRef<HTMLCanvasElement>(null);
  const rafRef= useRef(0);

  useEffect(()=>{
    const cv=cvRef.current; if(!cv) return;
    const ctx=cv.getContext("2d")!;
    const W=cv.width,H=cv.height;

    const N=20;
    const R=H*0.33;
    const LX=W*0.25, LY=H*0.5;
    const RX=W*0.75, RY=H*0.5;

    const mols=Array.from({length:N},(_,i)=>({
      a: i/N*Math.PI*2 - Math.PI/2,
      lx: LX+R*Math.cos(i/N*Math.PI*2-Math.PI/2),
      ly: LY+R*Math.sin(i/N*Math.PI*2-Math.PI/2),
      rx: RX+R*Math.cos(i/N*Math.PI*2-Math.PI/2),
      ry: RY+R*Math.sin(i/N*Math.PI*2-Math.PI/2),
    }));

    // Tight-binding quantum walk on ring
    // |ψ_j(t)|² = (1/N)|Σ_k exp(i·2πkj/N + 2i·J·cos(2πk/N)·t)|²
    const J=0.55;
    const getProb=(j:number,t:number)=>{
      let re=0,im=0;
      for(let k=0;k<N;k++){
        const eps=-2*J*Math.cos(2*Math.PI*k/N);
        const a=2*Math.PI*k*j/N+eps*t;
        re+=Math.cos(a); im+=Math.sin(a);
      }
      return(re*re+im*im)/(N*N);
    };

    // Classical walk
    let cSite=0, cTimer=0;
    const C_HOP=22;

    // Photon injection
    let photonT=0;
    const CYCLE=320;

    let frame=0;

    const draw=()=>{
      frame++;
      photonT=(photonT+1)%CYCLE;
      const tQ=photonT*0.10;

      ctx.fillStyle=BG; ctx.fillRect(0,0,W,H);

      // ---- divider ----
      ctx.strokeStyle="rgba(255,255,255,0.05)"; ctx.lineWidth=1;
      ctx.setLineDash([4,6]);
      ctx.beginPath(); ctx.moveTo(W/2,24); ctx.lineTo(W/2,H-24); ctx.stroke();
      ctx.setLineDash([]);

      // ─── LEFT: COHERENT ───────────────────────────
      // coupling bonds
      mols.forEach((m,i)=>{
        const n=mols[(i+1)%N];
        const pa=(getProb(i,tQ)+getProb((i+1)%N,tQ))*0.5;
        ctx.beginPath(); ctx.moveTo(m.lx,m.ly); ctx.lineTo(n.lx,n.ly);
        ctx.strokeStyle=`rgba(46,240,216,${pa*0.45})`; ctx.lineWidth=pa*2.5+0.3; ctx.stroke();
      });

      // reaction-center transfer (pulses as wave explores ring)
      const rcCoherence=Math.min(1,1.6*getProb(N/2|0,tQ));
      const rcG=ctx.createRadialGradient(LX,LY,0,LX,LY,22);
      rcG.addColorStop(0,`rgba(201,168,76,${0.1+rcCoherence*0.85})`);
      rcG.addColorStop(1,`rgba(201,168,76,0)`);
      ctx.fillStyle=rcG; ctx.beginPath(); ctx.arc(LX,LY,28,0,Math.PI*2); ctx.fill();
      ctx.beginPath(); ctx.arc(LX,LY,5,0,Math.PI*2);
      ctx.fillStyle=`rgba(255,240,160,${0.55+rcCoherence*0.45})`; ctx.fill();
      ctx.fillStyle="rgba(201,168,76,0.3)"; ctx.font=`5.5px ${mono}`;
      ctx.textAlign="center"; ctx.fillText("RC",LX,LY+14);

      // molecules
      mols.forEach((m,i)=>{
        const p=getProb(i,tQ);
        const hue=165+i*9;
        // glow halo
        ctx.beginPath(); ctx.arc(m.lx,m.ly,p*30+3,0,Math.PI*2);
        ctx.fillStyle=`hsla(${hue},85%,65%,${p*0.5})`; ctx.fill();
        // core dot
        ctx.beginPath(); ctx.arc(m.lx,m.ly,4,0,Math.PI*2);
        ctx.fillStyle=`hsla(${hue},90%,80%,${0.45+p*0.5})`; ctx.fill();
      });

      // incoming photon (red, 680nm = P680)
      if(photonT<50){
        const ph=1-photonT/50;
        const pm=mols[0];
        const sx=pm.lx+R*0.6, sy=pm.ly-52;
        ctx.beginPath(); ctx.moveTo(sx,sy); ctx.lineTo(pm.lx,pm.ly);
        ctx.strokeStyle=`rgba(255,100,60,${ph*0.8})`; ctx.lineWidth=1.8; ctx.stroke();
        ctx.beginPath(); ctx.arc(sx,sy,4,0,Math.PI*2);
        ctx.fillStyle=`rgba(255,140,80,${ph})`; ctx.fill();
        ctx.font=`5px ${mono}`; ctx.fillStyle=`rgba(255,180,100,${ph*0.7})`;
        ctx.textAlign="center"; ctx.fillText("680nm photon",sx,sy-10);
      }

      ctx.font=`7px ${mono}`; ctx.fillStyle=`rgba(46,240,216,0.55)`;
      ctx.textAlign="center";
      ctx.fillText("COHERENT · QUANTUM WALK",LX,H-22);
      ctx.font=`5.5px ${mono}`; ctx.fillStyle="rgba(200,230,220,0.22)";
      ctx.fillText("ALL SITES SIMULTANEOUSLY · ~98% efficiency",LX,H-12);

      // ─── RIGHT: CLASSICAL ─────────────────────────
      cTimer++;
      if(cTimer>=C_HOP){
        cTimer=0;
        cSite=(cSite+(Math.random()>0.5?1:-1)+N)%N;
      }

      // dim bonds
      mols.forEach((m,i)=>{
        const n=mols[(i+1)%N];
        ctx.beginPath(); ctx.moveTo(m.rx,m.ry); ctx.lineTo(n.rx,n.ry);
        ctx.strokeStyle="rgba(255,70,120,0.05)"; ctx.lineWidth=0.4; ctx.stroke();
      });

      // dim RC
      const rcGr=ctx.createRadialGradient(RX,RY,0,RX,RY,22);
      rcGr.addColorStop(0,"rgba(201,168,76,0.08)"); rcGr.addColorStop(1,"rgba(201,168,76,0)");
      ctx.fillStyle=rcGr; ctx.beginPath(); ctx.arc(RX,RY,28,0,Math.PI*2); ctx.fill();
      ctx.beginPath(); ctx.arc(RX,RY,5,0,Math.PI*2);
      ctx.fillStyle="rgba(255,240,160,0.22)"; ctx.fill();
      ctx.fillStyle="rgba(201,168,76,0.15)"; ctx.font=`5.5px ${mono}`;
      ctx.textAlign="center"; ctx.fillText("RC",RX,RY+14);

      mols.forEach((m,i)=>{
        const here=i===cSite;
        ctx.beginPath(); ctx.arc(m.rx,m.ry,here?16:3.5,0,Math.PI*2);
        ctx.fillStyle=here?"rgba(255,70,120,0.3)":"rgba(100,50,70,0.2)"; ctx.fill();
        ctx.beginPath(); ctx.arc(m.rx,m.ry,4,0,Math.PI*2);
        ctx.fillStyle=here?"rgba(255,100,140,0.92)":"rgba(80,40,60,0.28)"; ctx.fill();
      });

      // trail
      const prev=(cSite-1+N)%N;
      ctx.beginPath();
      ctx.moveTo(mols[prev].rx,mols[prev].ry);
      ctx.lineTo(mols[cSite].rx,mols[cSite].ry);
      ctx.strokeStyle="rgba(255,70,120,0.22)"; ctx.lineWidth=1.4; ctx.stroke();

      ctx.font=`7px ${mono}`; ctx.fillStyle=`rgba(255,70,120,0.55)`;
      ctx.textAlign="center";
      ctx.fillText("DECOHERENT · CLASSICAL RANDOM WALK",RX,H-22);
      ctx.font=`5.5px ${mono}`; ctx.fillStyle="rgba(200,160,170,0.22)";
      ctx.fillText("ONE SITE AT A TIME · stochastic loss · ~30% efficiency",RX,H-12);

      // header
      ctx.font=`6px ${mono}`; ctx.fillStyle="rgba(200,220,200,0.22)";
      ctx.textAlign="center";
      ctx.fillText("PHOTOSYNTHETIC ANTENNA COMPLEX · 20 BChl CHROMOPHORES · QUANTUM VS CLASSICAL ENERGY TRANSFER",W/2,13);

      rafRef.current=requestAnimationFrame(draw);
    };
    draw();
    return()=>cancelAnimationFrame(rafRef.current);
  },[]);

  return (
    <canvas ref={cvRef} width={900} height={360}
      style={{width:"100%",display:"block",borderRadius:12,background:BG,
        border:`1px solid ${TEAL}12`}} />
  );
}

/* ══════════════════════════════════════════════════════
   CANVAS II · Solar × Plant Absorption Spectrum
   72 bars: solar Planck irradiance
   Absorption overlays: Chl a, Chl b, Carotenoids
   "Captured" bars glow with plant-green energy
══════════════════════════════════════════════════════ */
function PlantAbsorptionCanvas() {
  const cvRef = useRef<HTMLCanvasElement>(null);
  const rafRef= useRef(0);

  const N=72, LMIN=380, LMAX=780;
  const lambdas=Array.from({length:N},(_,i)=>LMIN+(i/(N-1))*(LMAX-LMIN));
  const raw=lambdas.map(planckNorm);
  const maxR=Math.max(...raw);
  const normI=raw.map(v=>v/maxR);

  // Plant absorption at each wavelength (0-1 scale)
  const plantAbs=lambdas.map(l=>{
    const chlA=0.88*gauss(l,430,14)+0.72*gauss(l,662,11);
    const chlB=0.55*gauss(l,453,14)+0.50*gauss(l,642,11);
    const carot=0.40*(gauss(l,448,28)+gauss(l,478,28)+gauss(l,510,22));
    return Math.min(1, chlA+chlB+carot);
  });

  useEffect(()=>{
    const cv=cvRef.current; if(!cv) return;
    const ctx=cv.getContext("2d")!;
    const W=cv.width,H=cv.height;

    const coh=Float32Array.from({length:N},()=>0.3+Math.random()*0.4);
    const phi2=Float32Array.from({length:N},()=>Math.random()*Math.PI*2);
    const PEAK_IDX=Math.round((550-LMIN)/(LMAX-LMIN)*(N-1));
    const BAR_W_TOT=W*0.9;
    const BAR_STEP=BAR_W_TOT/N;
    const BAR_INNER=BAR_STEP*0.7;
    const BAR_OX=(W-BAR_W_TOT)/2;
    const BAR_MAX_H=H-80;
    const BAR_BASE=H-36;

    let frame=0;

    const updateDP=()=>{
      const t=frame*0.005;
      const next=new Float32Array(N);
      for(let i=0;i<N;i++){
        const c=coh[i];
        let wS=0,cS=0;
        for(let j=Math.max(0,i-5);j<=Math.min(N-1,i+5);j++){
          if(j===i)continue;
          const w=1/(1+Math.abs(j-i)*0.7);
          cS+=coh[j]*w;wS+=w;
        }
        const nbr=wS>0?cS/wS:c;
        const dist=Math.abs(i-PEAK_IDX)/N;
        const att=0.5+0.44*Math.sin(t-dist*14+frame*0.0028);
        next[i]=Math.max(0.04,Math.min(0.96,0.83*c+0.09*nbr+0.06*att+(Math.random()-0.5)*0.015));
        if(c<0.42)phi2[i]+=0.022*(0.5-c)*(Math.sin(i*6.1)>0?1:-1);
      }
      for(let i=0;i<N;i++)coh[i]=next[i];
    };

    const draw=()=>{
      frame++;
      updateDP();
      ctx.fillStyle=BG; ctx.fillRect(0,0,W,H);

      // Soft bg
      const bg=ctx.createRadialGradient(W/2,0,0,W/2,0,H*0.9);
      bg.addColorStop(0,"rgba(50,200,100,0.04)");
      bg.addColorStop(1,"rgba(5,8,16,0)");
      ctx.fillStyle=bg; ctx.fillRect(0,0,W,H);

      for(let i=0;i<N;i++){
        const l=lambdas[i];
        const [r,g,b]=wavToRgb(l);
        const c=coh[i];
        const abs=plantAbs[i]; // how much plant absorbs this wavelength
        const solar=normI[i]*(0.18+c*0.78);
        const flutter=(1-c)*0.06*Math.sin(frame*0.055+phi2[i]);
        const barH=Math.max(2,(solar+flutter)*BAR_MAX_H);
        const bx=BAR_OX+i*BAR_STEP;
        const by=BAR_BASE-barH;
        const alpha=0.15+c*0.7;

        // Main solar bar
        const grad=ctx.createLinearGradient(0,by,0,BAR_BASE);
        grad.addColorStop(0,`rgba(${r},${g},${b},${alpha})`);
        grad.addColorStop(0.6,`rgba(${Math.round(r*.7)},${Math.round(g*.7)},${Math.round(b*.7)},${alpha*.7})`);
        grad.addColorStop(1,`rgba(${Math.round(r*.2)},${Math.round(g*.2)},${Math.round(b*.2)},${alpha*.3})`);
        ctx.fillStyle=grad;
        ctx.fillRect(bx,by,BAR_INNER,barH);

        // Plant absorption highlight — CAPTURED bars glow green
        if(abs>0.08){
          const capH=barH*abs;
          const capY=by;
          // Green energy overlay on absorbed portion
          const gGrad=ctx.createLinearGradient(0,capY,0,capY+capH);
          gGrad.addColorStop(0,`rgba(68,204,119,${abs*(0.25+c*0.35)})`);
          gGrad.addColorStop(1,`rgba(68,204,119,0)`);
          ctx.fillStyle=gGrad;
          ctx.fillRect(bx-1,capY,BAR_INNER+2,capH);

          // Side glow for captured
          if(abs>0.35 && c>0.4){
            const sG=ctx.createRadialGradient(bx+BAR_INNER/2,capY,0,bx+BAR_INNER/2,capY,BAR_STEP*2.5);
            sG.addColorStop(0,`rgba(68,204,119,${abs*c*0.4})`);
            sG.addColorStop(1,`rgba(68,204,119,0)`);
            ctx.fillStyle=sG;
            ctx.fillRect(bx-BAR_STEP,capY-BAR_STEP,BAR_STEP*3,BAR_STEP*2);
          }
        }

        // Green reflected band (530-570nm) — NOT absorbed, glows as "visible green"
        if(l>525&&l<575&&abs<0.12){
          ctx.beginPath(); ctx.arc(bx+BAR_INNER/2,by-6,3,0,Math.PI*2);
          ctx.fillStyle=`rgba(100,255,140,${0.3+c*0.25})`; ctx.fill();
        }
      }

      // Absorption band labels
      const bands=[
        {l:430,label:"Chl-a\n430nm",col:"rgba(46,240,216,0.7)"},
        {l:453,label:"Chl-b\n453nm",col:"rgba(68,204,119,0.65)"},
        {l:478,label:"Carot.\n400–510",col:"rgba(255,153,51,0.65)"},
        {l:642,label:"Chl-b\n642nm",col:"rgba(68,204,119,0.65)"},
        {l:662,label:"Chl-a\n662nm",col:"rgba(46,240,216,0.7)"},
      ];
      bands.forEach(({l,label,col})=>{
        if(l<LMIN||l>LMAX) return;
        const i=Math.round((l-LMIN)/(LMAX-LMIN)*(N-1));
        const bx=BAR_OX+i*BAR_STEP;
        ctx.fillStyle=col; ctx.font=`5px ${mono}`; ctx.textAlign="center";
        label.split("\n").forEach((line,li)=>{
          ctx.fillText(line,bx+BAR_INNER/2,BAR_BASE+13+li*9);
        });
        ctx.strokeStyle=col.replace("0.7)","0.25)").replace("0.65)","0.25)");
        ctx.setLineDash([2,3]); ctx.lineWidth=0.5;
        ctx.beginPath(); ctx.moveTo(bx+BAR_INNER/2,BAR_BASE); ctx.lineTo(bx+BAR_INNER/2,BAR_BASE+8); ctx.stroke();
        ctx.setLineDash([]);
      });

      // Header
      ctx.font=`6px ${mono}`; ctx.fillStyle="rgba(200,220,200,0.22)"; ctx.textAlign="center";
      ctx.fillText("SOLAR SPECTRAL IRRADIANCE (5778K) × PLANT PIGMENT ABSORPTION BANDS · GREEN = CAPTURED ENERGY",W/2,13);

      // Green-reflected legend
      ctx.font=`6px ${mono}`; ctx.fillStyle="rgba(100,255,140,0.35)"; ctx.textAlign="left";
      ctx.fillText("● 530–570nm not absorbed → reflected as green light",BAR_OX,H-7);

      rafRef.current=requestAnimationFrame(draw);
    };
    draw();
    return()=>cancelAnimationFrame(rafRef.current);
  },[]);

  return (
    <canvas ref={cvRef} width={900} height={300}
      style={{width:"100%",display:"block",borderRadius:12,background:BG,
        border:`1px solid ${GRN}12`}} />
  );
}

/* ══════════════════════════════════════════════════════
   CANVAS III · Phi Phyllotaxis · Golden Angle Coherence
   600 seeds at golden angle (137.508°)
   DP coherence: inner seeds more coherent
   Color by spectral wavelength index
   Fibonacci arms visible at 5, 8, 13, 21, 34
══════════════════════════════════════════════════════ */
function PhiPhyllotaxisCanvas() {
  const cvRef = useRef<HTMLCanvasElement>(null);
  const rafRef= useRef(0);

  const GOLDEN_ANGLE = 2.399827; // radians = 137.508°
  const N_SEEDS = 600;
  const SCALE = 5.6;

  useEffect(()=>{
    const cv=cvRef.current; if(!cv) return;
    const ctx=cv.getContext("2d")!;
    const W=cv.width,H=cv.height;
    const CX=W/2, CY=H/2;

    const seeds=Array.from({length:N_SEEDS},(_,i)=>({
      i,
      angle: i*GOLDEN_ANGLE,
      rad: SCALE*Math.sqrt(i+0.5),
      x: CX+SCALE*Math.sqrt(i+0.5)*Math.cos(i*GOLDEN_ANGLE),
      y: CY+SCALE*Math.sqrt(i+0.5)*Math.sin(i*GOLDEN_ANGLE),
      lam: 380+(i/N_SEEDS)*400, // map seed index → wavelength
    }));

    // DP coherence: inner seeds (small i) more coherent naturally
    // but we animate a wave
    const coh=Float32Array.from({length:N_SEEDS},(_,i)=>
      Math.max(0.1, 0.85-i/N_SEEDS*0.55+Math.random()*0.15));
    const phi3=Float32Array.from({length:N_SEEDS},()=>Math.random()*Math.PI*2);

    let frame=0;

    const updateDP=()=>{
      const t=frame*0.003;
      const next=new Float32Array(N_SEEDS);
      for(let i=0;i<N_SEEDS;i++){
        const c=coh[i];
        let wS=0,cS=0;
        for(let j=Math.max(0,i-8);j<=Math.min(N_SEEDS-1,i+8);j++){
          if(j===i)continue;
          const w=1/(1+Math.abs(j-i)*0.5);
          cS+=coh[j]*w;wS+=w;
        }
        const nbr=wS>0?cS/wS:c;
        const distCenter=Math.sqrt(i)/Math.sqrt(N_SEEDS);
        const att=0.65-distCenter*0.3+0.2*Math.sin(t-distCenter*8+frame*0.002);
        next[i]=Math.max(0.05,Math.min(0.98,0.84*c+0.09*nbr+0.05*att+(Math.random()-0.5)*0.012));
        if(c<0.38)phi3[i]+=0.018*(0.4-c)*(Math.sin(i*3.7)>0?1:-1);
      }
      for(let i=0;i<N_SEEDS;i++)coh[i]=next[i];
    };

    const draw=()=>{
      frame++;
      updateDP();
      ctx.fillStyle=BG; ctx.fillRect(0,0,W,H);

      // subtle bg radial
      const bg=ctx.createRadialGradient(CX,CY,0,CX,CY,Math.min(W,H)*0.48);
      bg.addColorStop(0,"rgba(60,180,100,0.05)");
      bg.addColorStop(0.5,"rgba(120,80,200,0.02)");
      bg.addColorStop(1,"rgba(5,8,16,0)");
      ctx.fillStyle=bg; ctx.fillRect(0,0,W,H);

      // Only draw seeds that fit in canvas
      for(let s=N_SEEDS-1;s>=0;s--){
        const {x,y,lam,i:si}=seeds[s];
        if(x<0||x>W||y<0||y>H) continue;
        const c=coh[si];
        const [r,g,b]=wavToRgb(lam);
        const pulse=1+0.18*Math.sin(frame*0.04+phi3[si]);
        const baseR=1.2+Math.sqrt(si)*0.055;
        const dotR=baseR*(0.5+c*0.5)*pulse;
        const alpha=0.2+c*0.72;

        // glow for coherent seeds
        if(c>0.5&&dotR>2){
          ctx.beginPath(); ctx.arc(x,y,dotR*2.4,0,Math.PI*2);
          ctx.fillStyle=`rgba(${r},${g},${b},${(c-0.5)*0.28})`; ctx.fill();
        }
        // main dot
        ctx.beginPath(); ctx.arc(x,y,Math.max(0.5,dotR),0,Math.PI*2);
        ctx.fillStyle=`rgba(${r},${g},${b},${alpha})`; ctx.fill();
      }

      // Center seedpoint
      ctx.beginPath(); ctx.arc(CX,CY,6,0,Math.PI*2);
      ctx.fillStyle="rgba(255,255,220,0.7)"; ctx.fill();

      // Fibonacci arm labels (draw arcs at approximate radii)
      const fibNums=[5,8,13,21,34,55];
      fibNums.forEach((fn,fi)=>{
        const rad=SCALE*Math.sqrt(fn*N_SEEDS/55+8);
        if(rad>Math.min(W,H)*0.46) return;
        ctx.beginPath();
        ctx.arc(CX,CY,rad,0,Math.PI*2);
        ctx.strokeStyle=`rgba(255,255,200,${0.04+fi*0.012})`; ctx.lineWidth=0.4;
        ctx.stroke();
        // label
        const labelAng=-Math.PI/4+fi*0.22;
        const lx=CX+rad*Math.cos(labelAng);
        const ly=CY+rad*Math.sin(labelAng);
        ctx.font=`5px ${mono}`; ctx.fillStyle=`rgba(200,220,180,${0.18+fi*0.04})`;
        ctx.textAlign="center"; ctx.fillText(`F${fn}`,lx,ly);
      });

      // Header
      ctx.font=`6px ${mono}`; ctx.fillStyle="rgba(200,220,200,0.2)";
      ctx.textAlign="center";
      ctx.fillText("PHI PHYLLOTAXIS · 600 SEEDS · GOLDEN ANGLE 137.508° · FIBONACCI COHERENCE · DP WAVE FROM CENTRE",W/2,13);

      // Phi label center
      ctx.font=`bold 10px ${mono}`; ctx.fillStyle="rgba(201,168,76,0.35)";
      ctx.textAlign="center"; ctx.fillText("φ = 1.6180…",CX,CY+20);

      // Golden angle annotation
      ctx.font=`6px ${mono}`; ctx.fillStyle="rgba(201,168,76,0.25)";
      ctx.fillText("137.508° between every adjacent seed",CX,H-12);

      rafRef.current=requestAnimationFrame(draw);
    };
    draw();
    return()=>cancelAnimationFrame(rafRef.current);
  },[]);

  return (
    <canvas ref={cvRef} width={900} height={380}
      style={{width:"100%",display:"block",borderRadius:12,background:BG,
        border:`1px solid ${GOLD}12`}} />
  );
}

/* ── UI helpers ──────────────────────────────────────── */
function SH({n,title,sub,col=TEAL}:{n:string;title:string;sub:string;col?:string}){
  return(
    <div style={{marginTop:52,marginBottom:4}}>
      <div style={{fontFamily:mono,fontSize:10,color:col,letterSpacing:3}}>{n}</div>
      <h2 style={{fontFamily:serif,fontSize:22,color:"#fff",margin:"6px 0 4px"}}>{title}</h2>
      <div style={{fontFamily:body,fontSize:15,color:DIM,marginBottom:16}}>{sub}</div>
      <div style={{height:1,background:`linear-gradient(90deg,${col}55,transparent)`,marginBottom:24}}/>
    </div>
  );
}

function Card({col,tag,title,body:bd}:{col:string;tag:string;title:string;body:React.ReactNode}){
  return(
    <div style={{background:`${col}08`,border:`1px solid ${col}22`,borderRadius:10,padding:"16px 18px"}}>
      <div style={{fontFamily:mono,fontSize:9,color:col,letterSpacing:2,marginBottom:6}}>{tag}</div>
      <div style={{fontFamily:mono,fontSize:12,color:`${col}dd`,marginBottom:10}}>{title}</div>
      <div style={{fontFamily:body,fontSize:13.5,color:DIM,lineHeight:1.95}}>{bd}</div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════
   PAGE
══════════════════════════════════════════════════════ */
export default function PlantCoherenceSystemPage() {
  return(
    <div style={{background:BG,minHeight:"100vh",color:TEXT}}>

      {/* Header badge */}
      <div style={{padding:"8px 12px 0"}}>
        <div style={{display:"inline-block",border:`1px solid ${TEAL}99`,padding:"4px 12px",
          fontSize:10,letterSpacing:"0.2em",color:`${TEAL}bb`,fontFamily:"'DM Mono',monospace",marginBottom:12}}>
          LIVE SIMULATION
        </div>
        <div style={{background:"rgba(5,8,16,0.85)",borderLeft:`3px solid ${GRN}`,
          borderRadius:4,padding:"10px 16px",marginBottom:20}}>
          <h2 style={{margin:0,fontSize:13,color:GRN,fontFamily:"'DM Mono',monospace",
            letterSpacing:"0.15em",fontWeight:400}}>
            PLANT COHERENCE SYSTEM · PHOTOSYNTHESIS · VISUAL PIGMENTS · IMMUNITY · PHI · AETHER
          </h2>
          <p style={{margin:"4px 0 0",fontSize:10,color:`${GRN}55`,
            fontFamily:"'DM Mono',monospace",letterSpacing:"0.1em"}}>
            quantum antenna complex · solar spectral absorption · golden angle phyllotaxis ·
            coherent/decoherent as biological ground truth
          </p>
        </div>
      </div>

      {/* Hero */}
      <div style={{textAlign:"center",padding:"36px 24px 24px",
        background:`radial-gradient(ellipse 80% 55% at 50% 0%,rgba(68,204,119,0.07),rgba(201,168,76,0.04),transparent)`}}>
        <div style={{fontFamily:mono,fontSize:10,color:`${GRN}70`,letterSpacing:4,marginBottom:12}}>
          AETHER · BIOLOGICAL COHERENCE · SUNLIGHT AS SOURCE · MATHEMATICAL UNDERSTANDING
        </div>
        <h1 style={{fontFamily:serif,fontSize:"clamp(20px,4vw,44px)",
          color:"#fff",margin:"0 0 10px",lineHeight:1.2}}>
          <span style={{color:GRN}}>PLANT</span>
          <span style={{color:TEAL}}> COHERENCE</span>
          <span style={{color:"#fff"}}> SYSTEM</span>
          <br/>
          <span style={{color:GOLD,fontSize:"0.72em"}}>PHOTOSYNTHESIS</span>
          <span style={{color:DIM,fontSize:"0.72em"}}> · </span>
          <span style={{color:AMB,fontSize:"0.72em"}}>VISUAL</span>
          <span style={{color:DIM,fontSize:"0.72em"}}> · </span>
          <span style={{color:VIO,fontSize:"0.72em"}}>IMMUNITY</span>
          <span style={{color:DIM,fontSize:"0.72em"}}> · </span>
          <span style={{color:CYAN,fontSize:"0.72em"}}>UNDERSTANDING</span>
        </h1>
        <div style={{fontFamily:body,fontSize:16.5,color:DIM,maxWidth:880,margin:"0 auto",lineHeight:2.1}}>
          Plants are the planet's premier <span style={{color:GRN}}>coherence transducers</span>.
          They receive <span style={{color:GOLD}}>incoherent solar photons</span> and convert them — through
          quantum antenna complexes, aromatic pigment rings, and phi-ordered leaf geometry — into
          biological energy, visible color, immune compounds, and the mathematical language of growth.
          If we understand <span style={{color:TEAL}}>coherence and decoherence</span> from the sun as the
          source, <em>the physics of life is completely reframed</em>.
        </div>
      </div>

      <div style={{maxWidth:1100,margin:"0 auto",padding:"0 24px 80px"}}>

        {/* ── I: Quantum Photosynthesis ── */}
        <SH n="I" col={TEAL}
          title="Quantum Photosynthesis · Antenna Complex · Coherent vs Classical Walk"
          sub="20 BChl chromophores · tight-binding Hamiltonian · quantum superposition vs classical random hop · reaction-center capture" />
        <QuantumPhotosynthesisCanvas/>
        <div style={{fontFamily:mono,fontSize:7,color:DIM,marginTop:6,lineHeight:2}}>
          LEFT: coherent quantum walk — exciton probability |ψ_j(t)|² computed from tight-binding Hamiltonian
          H=-J·Σ(|j⟩⟨j+1|+h.c.), J=0.55 · eigenvalues ε_k=-2J·cos(2πk/N) · all sites explored simultaneously ·
          RIGHT: classical random walk — one site at a time, stochastic neighbour hop every 22 frames ·
          real FMO complex coherence lifetime ~300fs at room temperature (Engel et al. 2007)
        </div>

        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:14,marginTop:28}}>
          <Card col={TEAL}
            tag="PS II · P680"
            title="Photosystem II · 680nm absorption"
            body={<>The water-splitting photosystem absorbs at exactly <strong style={{color:TEAL}}>680nm</strong> — the
              red shoulder of the solar Planck curve. This is not the peak irradiance (550nm) but it is the
              <em> most coherent red photon</em>: long wavelength = large coherence length = easier phase matching
              with the chlorophyll Qy transition. The exciton produced has enough energy (1.82 eV) to oxidise water
              (splitting H₂O → O₂ + 4H⁺ + 4e⁻) — the original source of all atmospheric oxygen.</>}/>
          <Card col={GOLD}
            tag="PS I · P700"
            title="Photosystem I · 700nm absorption"
            body={<>Photosystem I absorbs at <strong style={{color:GOLD}}>700nm</strong>, capturing the least energetic
              visible photon still able to drive NADP⁺ reduction (1.77 eV). Placed downstream of PS II in the Z-scheme,
              it represents a second coherent capture event — the two photosystems together are a quantum two-photon
              antenna, using <em>excitonic coupling</em> to divide the solar spectrum into two complementary coherence
              windows. The system achieves ~98% quantum yield — more efficient than any engineered solar cell.</>}/>
          <Card col={AMB}
            tag="CAROTENOIDS · QUANTUM BRIDGE"
            title="β-carotene · 400–550nm broadening"
            body={<>Carotenoids (β-carotene, lutein, zeaxanthin) absorb across the blue-green region (400–550nm) that
              chlorophyll <em>cannot</em> directly use. They act as a <strong style={{color:AMB}}>coherence bridge</strong>:
              absorbing blue photons, then transferring the excitation energy to chlorophyll via ultrafast Förster resonance
              (~100fs). Without carotenoids, plants would be blind to the blue sky. With them, the entire visible spectrum
              becomes accessible — each pigment class a coherent node in a distributed spectral antenna.</>}/>
        </div>

        {/* ── II: Solar × Plant Absorption ── */}
        <SH n="II" col={GRN}
          title="Solar Irradiance × Plant Absorption Bands"
          sub="Chl a (430nm / 662nm) · Chl b (453nm / 642nm) · Carotenoids (400–510nm) · green 530–570nm reflected" />
        <PlantAbsorptionCanvas/>
        <div style={{fontFamily:mono,fontSize:7,color:DIM,marginTop:6,lineHeight:2}}>
          bars = Planck irradiance 5778K normalised · green overlay = absorbed fraction ·
          Chl a: gauss(λ,430,14) + gauss(λ,662,11) · Chl b: gauss(λ,453,14) + gauss(λ,642,11) ·
          Carotenoids: gauss(λ,448,28)+gauss(λ,478,28)+gauss(λ,510,22) ·
          530–570nm not absorbed → reflected → perceived as plant green · DP coherence from 550nm peak
        </div>

        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:14,marginTop:28}}>
          <Card col={GRN}
            tag="GREEN PARADOX"
            title="Plants reflect the peak solar wavelength"
            body={<>The most intense solar photons (530–570nm, the green peak) are <em>not absorbed</em> by
              chlorophyll — they are reflected. This appears wasteful but is coherence-adaptive: green photons
              are so abundant and so coherent that capturing them would over-excite the reaction centre and
              cause <strong style={{color:GRN}}>photoinhibition</strong>. By reflecting the peak, plants self-regulate
              their coherence load. The green light we see in forests is photosynthesis' saturation control signal —
              a decoherence dump that protects the quantum machinery from overload.</>}/>
          <Card col={VIO}
            tag="IMMUNITY · AROMATIC RINGS"
            title="Phytochemicals as coherence shields"
            body={<>Plant immunity compounds — quercetin, resveratrol, curcumin, EGCG — are planar aromatic
              ring systems (polyphenols). Their delocalized π electrons form a <strong style={{color:VIO}}>quantum
              antenna</strong> that absorbs UV photons (280–380nm) with high efficiency and re-emits the energy
              as heat or fluorescence, before the photon can damage DNA. When we consume these compounds, we are
              ingesting molecular <em>coherence shields</em> — exporting the plant's quantum UV protection strategy
              directly into our cellular biology.</>}/>
          <Card col={ROSE}
            tag="VISUAL SYSTEM"
            title="Eye evolved to the green coherence window"
            body={<>Human photopic vision peaks at <strong style={{color:ROSE}}>555nm</strong> — the exact centre of
              the green reflection band that plants eject. Evolution placed our peak visual sensitivity precisely where
              the most photons are available <em>and</em> unabsorbed by vegetation — the ecological gap between plant
              absorption and solar peak. We see green not because it is special, but because it is the <em>coherent
              overflow</em> of photosynthesis, the illumination surplus that drove primate visual cortex evolution.</>}/>
        </div>

        {/* ── III: Phi Phyllotaxis ── */}
        <SH n="III" col={GOLD}
          title="Phi Phyllotaxis · Golden Angle · Fibonacci Coherence"
          sub="600 seeds at 137.508° golden angle · DP coherence from centre · Fibonacci arms: F5 F8 F13 F21 F34 · colour = wavelength" />
        <PhiPhyllotaxisCanvas/>
        <div style={{fontFamily:mono,fontSize:7,color:DIM,marginTop:6,lineHeight:2}}>
          golden angle = 360°/φ² = 137.508° · seed_i: r=C√i, θ=i×137.508° ·
          irrational angle ensures NO two seeds share the same angular line at any scale ·
          Fibonacci spiral arms emerge because F_n/F_{"{n+1}"}→1/φ · DP coherence: inner seeds more coherent (better geometry)
          · colour = wavelength 380+i/600×400 nm mapped through sRGB approximation
        </div>

        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:14,marginTop:28}}>
          <Card col={GOLD}
            tag="PHI · COHERENCE MAXIMISATION"
            title="Why plants chose the irrational number"
            body={<>The golden angle is the unique angle that produces <strong style={{color:GOLD}}>zero overlapping
              directions</strong> at every scale. Any rational angle (like 120° or 144°) creates radial lines where
              leaves block each other's light. Only the most irrational number — φ — avoids all rational
              approximations efficiently enough to guarantee no two leaves cast the same shadow. The phyllotaxis spiral
              is not aesthetic decoration: it is the plant's solution to the <em>coherent light capture problem</em> —
              maximise photon access across the entire antenna surface, at every growth stage, simultaneously.</>}/>
          <Card col={CYAN}
            tag="AETHER SYNTHESIS · UNDERSTANDING"
            title="The coherent mathematical structure of biology"
            body={<>The three systems on this page — quantum antenna (I), spectral absorption (II), and phi geometry
              (III) — share one underlying principle: <strong style={{color:CYAN}}>coherence is the ground state,
              decoherence is the cost function</strong>. Plants evolved to maximise coherence at every scale:
              quantum (exciton transfer), molecular (pigment resonance), and architectural (phi packing). If we
              apply this lens to physics generally, mathematical understanding is not an abstract exercise — it is
              the cognitive equivalent of photosynthesis. <em>Understanding is coherent capture of structure from
              the information field.</em> Decoherence is confusion. Coherence is knowing.</>}/>
        </div>

      </div>
    </div>
  );
}
