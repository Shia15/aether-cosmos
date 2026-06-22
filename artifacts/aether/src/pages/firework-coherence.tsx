import { useEffect, useRef, useState } from "react";

/* ── palette ─────────────────────────────────────────── */
const BG   = "#010408";
const TEAL = "#1fd4c8"; const TEAL_RGB:[number,number,number] = [31,212,200];
const GOLD = "#c9a84c"; const GOLD_RGB:[number,number,number] = [201,168,76];
const VIO  = "#8b5cf6"; const VIO_RGB:[number,number,number]  = [139,92,246];
const GRN  = "#22c55e"; const GRN_RGB:[number,number,number]  = [34,197,94];
const RED  = "#ef4444"; const RED_RGB:[number,number,number]  = [239,68,68];
const PINK = "#ec4899"; const PINK_RGB:[number,number,number] = [236,72,153];
const mono = "'Space Mono', monospace";

const PHI_INV = 0.618034;
/* Beer-Lambert extinction coefficients */
const MU_COH  = 3.0;  // coherent — sharp, absorptive
const MU_DEC  = 0.75; // decoherent — diffuse scatter
const MU_SMOKE= 1.8;  // smoke absorption
const MU_FOG  = 0.35; // fog scatter

const DGW = 80, DGH = 56; // density grid dimensions

/* ── primitive definitions ───────────────────────────── */
const PRIMS = [
  { key:"torus",   name:"TORUS TUNNEL",       col:GOLD_RGB, hexCol:GOLD, decayRate:0.006, nParticles:56 },
  { key:"helix",   name:"HELIX LADDER",        col:TEAL_RGB, hexCol:TEAL, decayRate:0.005, nParticles:50 },
  { key:"mandala", name:"RADIAL MANDALA",      col:VIO_RGB,  hexCol:VIO,  decayRate:0.004, nParticles:60 },
  { key:"branch",  name:"FRACTAL BRANCH",      col:GRN_RGB,  hexCol:GRN,  decayRate:0.012, nParticles:44 },
  { key:"knot",    name:"KNOT BRAID LOOP",     col:RED_RGB,  hexCol:RED,  decayRate:0.009, nParticles:52 },
  { key:"star",    name:"STAR CONSTELLATION",  col:PINK_RGB, hexCol:PINK, decayRate:0.014, nParticles:48 },
] as const;
type PrimKey = typeof PRIMS[number]["key"];

/* ── types ───────────────────────────────────────────── */
interface Rocket { x:number; y:number; vx:number; vy:number; life:number; maxLife:number; typeKey:PrimKey; col:[number,number,number]; trail:{x:number;y:number}[] }
interface BurstParticle { x:number; y:number; vx:number; vy:number; life:number; maxLife:number; col:[number,number,number]; coherence:number; decayRate:number; bx:number; by:number; }
interface SmokeParticle { x:number; y:number; vx:number; vy:number; life:number; maxLife:number; radius:number; }
interface FogParticle   { x:number; y:number; vx:number; vy:number; life:number; maxLife:number; radius:number; }
interface Building      { x:number; w:number; h:number; windows:{wx:number;wy:number;bright:boolean}[] }

/* ── density grid helpers ────────────────────────────── */
function addGaussian(grid:Float32Array, gw:number, gh:number, fx:number, fy:number, strength:number, sigma:number) {
  const cx = Math.round(fx*gw), cy = Math.round(fy*gh);
  const r  = Math.ceil(sigma*3);
  for (let dy=-r; dy<=r; dy++) {
    for (let dx=-r; dx<=r; dx++) {
      const nx=cx+dx, ny=cy+dy;
      if (nx<0||nx>=gw||ny<0||ny>=gh) continue;
      const d2=(dx*dx+dy*dy)/(sigma*sigma);
      if (d2>9) continue;
      grid[ny*gw+nx] += strength * Math.exp(-0.5*d2);
    }
  }
}

/* ── spawn particles for each primitive type ─────────── */
function spawnPrimitive(typeKey:PrimKey, bx:number, by:number): BurstParticle[] {
  const prim = PRIMS.find(p=>p.key===typeKey)!;
  const N = prim.nParticles;
  const ps: BurstParticle[] = [];
  const base = { col:prim.col, decayRate:prim.decayRate, bx, by };

  if (typeKey === "torus") {
    for (let i=0; i<N; i++) {
      const ring = Math.floor(i/(N/3));
      const ang  = (i%(N/3)) / (N/3) * Math.PI*2;
      const spd  = 1.0 + ring*0.5;
      ps.push({...base, x:bx, y:by, vx:Math.cos(ang)*spd, vy:Math.sin(ang)*spd*0.6-0.3, life:0, maxLife:90+ring*10, coherence:1.0});
    }
  } else if (typeKey === "helix") {
    for (let i=0; i<N; i++) {
      const t   = i/N;
      const ang  = t * Math.PI*4 + (i%2)*Math.PI;
      const spd  = 1.1 + t*0.4;
      ps.push({...base, x:bx, y:by, vx:Math.cos(ang)*spd*0.6, vy:-t*2.2 + Math.sin(ang)*0.4, life:0, maxLife:80+t*30, coherence:1.0});
    }
  } else if (typeKey === "mandala") {
    for (let i=0; i<N; i++) {
      const petal = Math.floor(i/8), idx = i%8;
      const ang   = petal*Math.PI/3 + idx*Math.PI/24;
      const spd   = 0.6 + (idx/8)*1.4;
      ps.push({...base, x:bx, y:by, vx:Math.cos(ang)*spd, vy:Math.sin(ang)*spd-0.2, life:0, maxLife:100+Math.random()*20, coherence:1.0});
    }
  } else if (typeKey === "branch") {
    function addBranch(px:number, py:number, ang:number, spd:number, depth:number) {
      if (depth>3 || ps.length>=N+20) return;
      ps.push({...base, x:bx, y:by, vx:Math.cos(ang)*spd, vy:Math.sin(ang)*spd, life:0, maxLife:50+depth*20, coherence:Math.max(0.2, 1-depth*0.25)});
      if (depth<3) {
        addBranch(px,py,ang-0.45,spd*0.7,depth+1);
        addBranch(px,py,ang+0.45,spd*0.7,depth+1);
      }
    }
    for (let i=0; i<6; i++) addBranch(bx,by,-Math.PI/2 + i*Math.PI/3, 1.5, 0);
  } else if (typeKey === "knot") {
    const p2=2, q2=3;
    for (let i=0; i<N; i++) {
      const tt = (i/N)*Math.PI*2;
      const R=1.2, r2=0.5;
      const rad = R + r2*Math.cos(q2*tt);
      const vx  = Math.cos(p2*tt)*rad*1.1;
      const vy  = Math.sin(p2*tt)*rad*0.65 - 0.3;
      ps.push({...base, x:bx, y:by, vx, vy, life:0, maxLife:85+Math.random()*20, coherence:1.0});
    }
  } else { // star
    for (let i=0; i<N; i++) {
      const ang = Math.random()*Math.PI*2;
      const spd = 0.3 + Math.random()*2.2;
      ps.push({...base, x:bx, y:by, vx:Math.cos(ang)*spd, vy:Math.sin(ang)*spd - 0.4, life:0, maxLife:70+Math.random()*40, coherence:1.0});
    }
  }
  return ps;
}

/* ── smoke spawn ─────────────────────────────────────── */
function spawnSmoke(bx:number, by:number, n:number): SmokeParticle[] {
  return Array.from({length:n}, () => ({
    x: bx + (Math.random()-0.5)*20,
    y: by + (Math.random()-0.5)*10,
    vx: (Math.random()-0.5)*0.25,
    vy: -0.15 - Math.random()*0.3,
    life: 0,
    maxLife: 180 + Math.random()*120,
    radius: 6 + Math.random()*10,
  }));
}

/* ════════════════════════════════════════════════════
   PAGE
════════════════════════════════════════════════════ */
export default function FireworkCoherencePage() {
  const rootRef   = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rafRef    = useRef(0);
  const sizeRef   = useRef({W:900,H:600});

  const [C_global,  setC]     = useState(0.711);
  const [rho,       setRho]   = useState(0.448);
  const [stepN,     setStepN] = useState(0);
  const [commits,   setCommits] = useState(0);
  const [activeType, setActiveType] = useState<string>("—");

  const [launchRate,   setLaunchRate]   = useState(90);
  const [fogAmount,    setFogAmount]    = useState(0.4);
  const [smokeAmount,  setSmokeAmount]  = useState(18);
  const [decayMult,    setDecayMult]    = useState(1.0);
  const [viewMode,     setViewMode]     = useState<"full"|"coh"|"dec"|"density">("full");
  const [waterOn,      setWaterOn]      = useState(true);

  const parRef = useRef({launchRate, fogAmount, smokeAmount, decayMult, viewMode, waterOn});
  parRef.current = {launchRate, fogAmount, smokeAmount, decayMult, viewMode, waterOn};

  useEffect(() => {
    const cv   = canvasRef.current;
    const root = rootRef.current;
    if (!cv||!root) return;
    const ctx  = cv.getContext("2d")!;

    // density grids
    let gridCoh   = new Float32Array(DGW*DGH);
    let gridDec   = new Float32Array(DGW*DGH);
    let gridSmoke = new Float32Array(DGW*DGH);
    let gridFog   = new Float32Array(DGW*DGH);

    // simulation state
    const rockets:  Rocket[]         = [];
    const particles: BurstParticle[] = [];
    const smoke:     SmokeParticle[] = [];
    const fogParts:  FogParticle[]   = [];
    const buildings: Building[]      = [];
    const bgCanvas  = document.createElement("canvas");
    const bgCtx     = bgCanvas.getContext("2d")!;
    let bgReady = false;

    let step=0, commitCount=0, launchTimer=0, C_val=0.711, rho_val=0.448;
    let waterY=0;

    const resize = () => {
      const dpr=window.devicePixelRatio||1;
      const W=root.clientWidth, H=root.clientHeight;
      cv.width=W*dpr; cv.height=H*dpr;
      cv.style.width=W+"px"; cv.style.height=H+"px";
      ctx.setTransform(dpr,0,0,dpr,0,0);
      sizeRef.current={W,H};
      waterY=H*0.84;
      // rebuild buildings with pre-computed windows
      buildings.length=0;
      let bx=0;
      while(bx<W){
        const bw=22+Math.random()*44;
        const bh=waterY*(0.12+Math.random()*0.32);
        const wins:{wx:number;wy:number;bright:boolean}[]=[];
        for(let wy2=4; wy2<bh-4; wy2+=6)
          for(let wx2=3; wx2<bw-3; wx2+=5)
            if(Math.random()<0.28) wins.push({wx:wx2,wy:wy2,bright:Math.random()<0.2});
        buildings.push({x:bx,w:bw,h:bh,windows:wins});
        bx+=bw+Math.random()*3;
      }
      // init fog
      fogParts.length=0;
      const nf=Math.round(80*parRef.current.fogAmount);
      for(let i=0;i<nf;i++) fogParts.push({
        x:Math.random()*W, y:waterY*(0.3+Math.random()*0.7),
        vx:(Math.random()-0.5)*0.12, vy:(Math.random()-0.5)*0.06,
        life:Math.random()*200, maxLife:200+Math.random()*200,
        radius:30+Math.random()*60,
      });
      // draw static background to bgCanvas (stars + sky gradient)
      bgCanvas.width=W; bgCanvas.height=H;
      bgCtx.fillStyle=BG; bgCtx.fillRect(0,0,W,H);
      // sky gradient
      const sg=bgCtx.createLinearGradient(0,0,0,waterY);
      sg.addColorStop(0,"rgba(2,6,20,1)"); sg.addColorStop(1,"rgba(1,4,8,1)");
      bgCtx.fillStyle=sg; bgCtx.fillRect(0,0,W,waterY);
      // stars
      for(let i=0;i<120;i++){
        const sx=Math.random()*W, sy=Math.random()*waterY*0.9;
        const sz=Math.random()<0.08?1.5:1;
        bgCtx.fillStyle=`rgba(200,220,255,${0.3+Math.random()*0.5})`;
        bgCtx.fillRect(sx,sy,sz,sz);
      }
      bgReady=true;
    };
    resize();
    const ro=new ResizeObserver(resize); ro.observe(root);

    /* ── launch rocket ── */
    function launchRocket() {
      const {W} = sizeRef.current;
      const primIdx = Math.floor(Math.random()*PRIMS.length);
      const prim = PRIMS[primIdx];
      const x = W*0.08 + Math.random()*W*0.84;
      const targetY = waterY*(0.12 + Math.random()*0.35);
      const dist = waterY - targetY;
      const vy0  = -Math.sqrt(2*0.06*dist)*1.05;
      rockets.push({
        x, y:waterY, vx:(Math.random()-0.5)*0.6, vy:vy0,
        life:0, maxLife:Math.abs(vy0/0.06)|0,
        typeKey:prim.key, col:prim.col, trail:[],
      });
    }

    /* ── burst ── */
    function burst(r: Rocket) {
      const ps = spawnPrimitive(r.typeKey, r.x, r.y);
      const dm = parRef.current.decayMult;
      ps.forEach(p => { p.decayRate*=dm; particles.push(p); });
      const ns = Math.round(parRef.current.smokeAmount);
      spawnSmoke(r.x, r.y, ns).forEach(s => smoke.push(s));
      setActiveType(r.typeKey.toUpperCase());
      // check commit
      if (C_val >= PHI_INV) {
        commitCount++;
        setCommits(commitCount);
        // flash pulse (visual only via extra particles)
        for (let i=0;i<8;i++) {
          const ang=Math.random()*Math.PI*2;
          particles.push({
            x:r.x, y:r.y, vx:Math.cos(ang)*3, vy:Math.sin(ang)*3-1,
            life:0, maxLife:25, col:[255,245,230], coherence:1.0,
            decayRate:0.06, bx:r.x, by:r.y,
          });
        }
      }
    }

    /* ── density field computation ── */
    function computeDensity() {
      const {W,H}=sizeRef.current;
      gridCoh.fill(0); gridDec.fill(0); gridSmoke.fill(0); gridFog.fill(0);
      const sigma_coh=1.0, sigma_dec=2.8, sigma_smoke=4.0, sigma_fog=3.5;
      particles.forEach(p=>{
        if(p.life>=p.maxLife) return;
        const fx=p.x/W, fy=p.y/H;
        const coh=p.coherence;
        addGaussian(gridCoh,   DGW,DGH, fx,fy, coh*1.2,      sigma_coh);
        addGaussian(gridDec,   DGW,DGH, fx,fy, (1-coh)*0.9,  sigma_dec);
      });
      smoke.forEach(s=>{
        if(s.life>=s.maxLife) return;
        const fx=s.x/W, fy=s.y/H;
        const alpha=(1-s.life/s.maxLife)*0.7;
        addGaussian(gridSmoke, DGW,DGH, fx,fy, alpha, sigma_smoke);
      });
      fogParts.forEach(f=>{
        if(f.life>=f.maxLife) return;
        const fx=f.x/W, fy=f.y/H;
        const alpha=(1-f.life/f.maxLife)*parRef.current.fogAmount;
        addGaussian(gridFog, DGW,DGH, fx,fy, alpha*0.5, sigma_fog);
      });
      // normalize
      let mc=0,md=0,ms=0,mf=0;
      for(let i=0;i<DGW*DGH;i++){ mc=Math.max(mc,gridCoh[i]); md=Math.max(md,gridDec[i]); ms=Math.max(ms,gridSmoke[i]); mf=Math.max(mf,gridFog[i]); }
      if(mc>0) for(let i=0;i<DGW*DGH;i++) gridCoh[i]/=mc;
      if(md>0) for(let i=0;i<DGW*DGH;i++) gridDec[i]/=md;
      if(ms>0) for(let i=0;i<DGW*DGH;i++) gridSmoke[i]/=ms;
      if(mf>0) for(let i=0;i<DGW*DGH;i++) gridFog[i]/=mf;
    }

    /* ── Beer-Lambert transmittance at screen position ── */
    function transmittance(fx:number, fy:number): number {
      const ix=Math.min(DGW-1,Math.round(fx*DGW))|0;
      const iy=Math.min(DGH-1,Math.round(fy*DGH))|0;
      const idx=iy*DGW+ix;
      const tau_smoke = MU_SMOKE * gridSmoke[idx];
      const tau_fog   = MU_FOG   * gridFog[idx];
      return Math.exp(-(tau_smoke+tau_fog));
    }

    /* ── render density overlay ── */
    function renderDensityOverlay(W:number, H:number) {
      const img = ctx.createImageData(DGW, DGH);
      const px  = img.data;
      for(let i=0;i<DGW*DGH;i++){
        const coh   = gridCoh[i];
        const dec   = gridDec[i];
        const smk   = gridSmoke[i];
        const fog_  = gridFog[i];
        // Beer-Lambert opacity
        const O_coh = 1-Math.exp(-MU_COH  * coh);
        const O_dec = 1-Math.exp(-MU_DEC  * dec);
        const O_smk = 1-Math.exp(-MU_SMOKE* smk*0.5);
        const O_fog = 1-Math.exp(-MU_FOG  * fog_*0.8);
        // composite color
        const r = Math.min(255, O_coh*TEAL_RGB[0]*0.4 + O_dec*GOLD_RGB[0]*0.5 + O_smk*60 + O_fog*30)|0;
        const g = Math.min(255, O_coh*TEAL_RGB[1]*0.4 + O_dec*GOLD_RGB[1]*0.3 + O_smk*60 + O_fog*35)|0;
        const b = Math.min(255, O_coh*TEAL_RGB[2]*0.4 + O_dec*GOLD_RGB[2]*0.1 + O_smk*60 + O_fog*40)|0;
        const a = Math.min(255, ((O_coh+O_dec)*100 + O_smk*80 + O_fog*40))|0;
        px[i*4]=r; px[i*4+1]=g; px[i*4+2]=b; px[i*4+3]=a;
      }
      // draw scaled to canvas
      const offscreen = document.createElement("canvas");
      offscreen.width=DGW; offscreen.height=DGH;
      offscreen.getContext("2d")!.putImageData(img,0,0);
      ctx.save();
      ctx.globalAlpha=0.45;
      ctx.imageSmoothingEnabled=true;
      ctx.drawImage(offscreen,0,0,W,H);
      ctx.globalAlpha=1;
      ctx.restore();
    }

    /* ── draw buildings ── */
    function drawBuildings(W:number, H:number) {
      buildings.forEach(b=>{
        ctx.fillStyle="rgba(3,6,14,0.97)";
        ctx.fillRect(b.x, waterY-b.h, b.w, b.h);
        // pre-computed windows
        b.windows.forEach(w=>{
          ctx.fillStyle = w.bright ? "rgba(201,168,76,0.55)" : "rgba(201,168,76,0.15)";
          ctx.fillRect(b.x+w.wx, waterY-b.h+w.wy, 2, 3);
        });
      });
      // skyline ambient glow
      const sg=ctx.createLinearGradient(0,waterY-H*0.08,0,waterY);
      sg.addColorStop(0,"rgba(31,212,200,0.0)"); sg.addColorStop(1,"rgba(31,212,200,0.05)");
      ctx.fillStyle=sg; ctx.fillRect(0,waterY-H*0.08,W,H*0.08);
    }

    /* ── draw water reflection ── */
    function drawWater(W:number, H:number) {
      // water surface
      const wg=ctx.createLinearGradient(0,waterY,0,H);
      wg.addColorStop(0,"rgba(31,212,200,0.08)"); wg.addColorStop(1,"rgba(1,4,8,0.95)");
      ctx.fillStyle=wg; ctx.fillRect(0,waterY,W,H-waterY);
      ctx.fillStyle="rgba(31,212,200,0.18)";
      ctx.fillRect(0,waterY,W,1);
      // ripple lines
      for(let i=1;i<=4;i++){
        const y=waterY+i*((H-waterY)/5);
        ctx.strokeStyle=`rgba(31,212,200,${0.04/i})`;
        ctx.lineWidth=0.5; ctx.beginPath(); ctx.moveTo(0,y); ctx.lineTo(W,y); ctx.stroke();
      }
    }

    const OFFSCREEN_WATER = document.createElement("canvas");
    const OFFSCREEN_CTX   = OFFSCREEN_WATER.getContext("2d")!;

    /* ── main draw ── */
    function draw() {
      const {W,H}=sizeRef.current;
      const {viewMode:vm, waterOn:wo}=parRef.current;

      step++;
      launchTimer++;

      // launch
      if(launchTimer >= parRef.current.launchRate) {
        launchRocket();
        launchTimer=0;
      }

      // update rockets
      for(let i=rockets.length-1; i>=0; i--){
        const r=rockets[i];
        r.trail.push({x:r.x, y:r.y});
        if(r.trail.length>12) r.trail.shift();
        r.vx*=0.995; r.vy+=0.06;
        r.x+=r.vx; r.y+=r.vy;
        r.life++;
        if(r.vy>=0 || r.life>=r.maxLife) { burst(r); rockets.splice(i,1); }
      }

      // update burst particles
      let sumCoh=0, countP=0;
      for(let i=particles.length-1; i>=0; i--){
        const p=particles[i];
        p.life++;
        if(p.life>=p.maxLife){ particles.splice(i,1); continue; }
        p.vx*=0.985; p.vy*=0.985; p.vy+=0.055;
        p.x+=p.vx; p.y+=p.vy;
        // coherence: exponential decay + distance penalty
        const dx=p.x-p.bx, dy=p.y-p.by;
        const dist=Math.sqrt(dx*dx+dy*dy);
        p.coherence = Math.max(0, p.coherence - p.decayRate - dist*0.00015);
        sumCoh+=p.coherence; countP++;
        if(p.y>H+20) { particles.splice(i,1); continue; }
      }

      // update smoke
      for(let i=smoke.length-1; i>=0; i--){
        const s=smoke[i];
        s.life++; if(s.life>=s.maxLife){ smoke.splice(i,1); continue; }
        s.vx*=0.98; s.vy*=0.97;
        s.x+=s.vx; s.y+=s.vy;
        s.radius=Math.min(s.radius+0.08, 60);
      }

      // update fog
      fogParts.forEach(f=>{
        f.life++;
        if(f.life>=f.maxLife){ f.life=0; f.x=Math.random()*W; f.y=waterY*(0.3+Math.random()*0.7); }
        f.vx+=((Math.random()-0.5)*0.01); f.vy+=((Math.random()-0.5)*0.005);
        f.vx*=0.99; f.vy*=0.99;
        f.x+=f.vx; f.y+=f.vy;
        if(f.x<-50) f.x=W+50; if(f.x>W+50) f.x=-50;
      });

      // update global stats
      const C_raw = countP>0 ? sumCoh/countP : C_val*0.998+0.711*0.002;
      C_val = C_val*0.94 + C_raw*0.06;
      rho_val = Math.min(1, particles.length/300);
      if(step%8===0){ setC(+C_val.toFixed(4)); setRho(+rho_val.toFixed(4)); setStepN(step); }

      // density field
      if(step%2===0) computeDensity();

      /* ── RENDER ── */
      // background (with persistent stars)
      if (bgReady) ctx.drawImage(bgCanvas,0,0,W,H);
      else { ctx.fillStyle=BG; ctx.fillRect(0,0,W,H); }

      // buildings
      drawBuildings(W,H);

      // density overlay
      if(vm==="full"||vm==="density") renderDensityOverlay(W,H);

      // fog particles
      if(vm==="full"||vm==="dec") {
        fogParts.forEach(f=>{
          const alpha=parRef.current.fogAmount*(1-f.life/f.maxLife)*0.06;
          if(alpha<0.001) return;
          const gr=ctx.createRadialGradient(f.x,f.y,0,f.x,f.y,f.radius);
          gr.addColorStop(0,`rgba(120,160,180,${alpha})`);
          gr.addColorStop(1,"rgba(120,160,180,0)");
          ctx.fillStyle=gr; ctx.beginPath(); ctx.arc(f.x,f.y,f.radius,0,Math.PI*2); ctx.fill();
        });
      }

      // smoke particles
      smoke.forEach(s=>{
        const lifeF=s.life/s.maxLife;
        const alpha=(1-lifeF)*(lifeF<0.1?lifeF*10:1)*0.18;
        if(alpha<0.001) return;
        const T=transmittance(s.x/W, s.y/H);
        const gr=ctx.createRadialGradient(s.x,s.y,0,s.x,s.y,s.radius*(1+lifeF*2));
        gr.addColorStop(0,`rgba(80,90,100,${alpha*T*0.6})`);
        gr.addColorStop(1,"rgba(80,90,100,0)");
        ctx.fillStyle=gr; ctx.beginPath(); ctx.arc(s.x,s.y,s.radius*(1+lifeF*2),0,Math.PI*2); ctx.fill();
      });

      // burst particles — decoherent layer (wide glow) first
      if(vm!=="coh") {
        particles.forEach(p=>{
          const lifeF=p.life/p.maxLife;
          const dec=1-p.coherence;
          if(dec<0.05) return;
          const T=transmittance(p.x/W,p.y/H);
          const alpha=dec*(1-lifeF)*0.35*T;
          const rad=8+dec*14;
          const gr=ctx.createRadialGradient(p.x,p.y,0,p.x,p.y,rad);
          gr.addColorStop(0,`rgba(${p.col[0]},${p.col[1]},${p.col[2]},${alpha})`);
          gr.addColorStop(1,`rgba(${p.col[0]},${p.col[1]},${p.col[2]},0)`);
          ctx.fillStyle=gr; ctx.beginPath(); ctx.arc(p.x,p.y,rad,0,Math.PI*2); ctx.fill();
        });
      }

      // burst particles — coherent layer (sharp core)
      if(vm!=="dec") {
        ctx.save();
        particles.forEach(p=>{
          const lifeF=p.life/p.maxLife;
          const coh=p.coherence;
          if(coh<0.03) return;
          const T=transmittance(p.x/W,p.y/H);
          const alpha=coh*(1-lifeF)*0.9*T;
          const radius=1.2+coh*2.2;
          ctx.shadowBlur = coh>0.6?8:3;
          ctx.shadowColor=`rgba(${p.col[0]},${p.col[1]},${p.col[2]},${coh*0.7})`;
          ctx.fillStyle=`rgba(${p.col[0]},${p.col[1]},${p.col[2]},${alpha})`;
          ctx.beginPath(); ctx.arc(p.x,p.y,radius,0,Math.PI*2); ctx.fill();
        });
        ctx.restore();
      }

      // light fragmentation: draw bright flash where coherent meets decoherent density
      if(vm==="full") {
        for(let gy=0;gy<DGH;gy++) {
          for(let gx=0;gx<DGW;gx++){
            const i=gy*DGW+gx;
            const coh=gridCoh[i], dec=gridDec[i];
            const frag=Math.min(coh,dec)*2; // maximal at the interface
            if(frag<0.05) continue;
            const sx=(gx/DGW)*W, sy=(gy/DGH)*H;
            const csz=Math.ceil(W/DGW);
            ctx.fillStyle=`rgba(255,250,240,${frag*0.18})`;
            ctx.fillRect(sx,sy,csz,csz);
          }
        }
      }

      // rockets
      rockets.forEach(r=>{
        // trail
        for(let i=1;i<r.trail.length;i++){
          const alpha=(i/r.trail.length)*0.7;
          ctx.strokeStyle=`rgba(${r.col[0]},${r.col[1]},${r.col[2]},${alpha})`;
          ctx.lineWidth=Math.max(0.5, (i/r.trail.length)*2);
          ctx.beginPath(); ctx.moveTo(r.trail[i-1].x,r.trail[i-1].y); ctx.lineTo(r.trail[i].x,r.trail[i].y); ctx.stroke();
        }
        // head
        ctx.save(); ctx.shadowBlur=8; ctx.shadowColor=`rgb(${r.col[0]},${r.col[1]},${r.col[2]})`;
        ctx.fillStyle=`rgb(${r.col[0]},${r.col[1]},${r.col[2]})`;
        ctx.beginPath(); ctx.arc(r.x,r.y,2.2,0,Math.PI*2); ctx.fill();
        ctx.restore();
      });

      // water reflection
      if(wo) drawWater(W,H);

      // C(x,t) commit threshold flash
      if(C_val>=PHI_INV) {
        ctx.fillStyle=`rgba(31,212,200,${(C_val-PHI_INV)*0.08})`;
        ctx.fillRect(0,0,W,H);
      }

      // scan lines
      for(let sl=0;sl<H;sl+=4){ ctx.fillStyle="rgba(0,0,0,0.014)"; ctx.fillRect(0,sl,W,1); }

      rafRef.current = requestAnimationFrame(draw);
    }

    rafRef.current = requestAnimationFrame(draw);
    return () => { cancelAnimationFrame(rafRef.current); ro.disconnect(); };
  }, []);

  /* ── styles ── */
  const lbl: React.CSSProperties = {fontFamily:mono,fontSize:8,color:"rgba(31,212,200,0.55)",letterSpacing:"0.1em",userSelect:"none"};
  const val_: React.CSSProperties = {fontFamily:mono,fontSize:8,color:TEAL,minWidth:32,textAlign:"right"};
  const sep: React.CSSProperties = {width:1,height:28,background:"rgba(31,212,200,0.1)"};
  const slid: React.CSSProperties = {width:70,accentColor:TEAL};
  const btn = (active:boolean,col=TEAL): React.CSSProperties => ({
    fontFamily:mono,fontSize:8,letterSpacing:"0.1em",padding:"5px 10px",cursor:"pointer",
    border:"1px solid",borderRadius:2,background:"transparent",
    borderColor:active?col:"rgba(31,212,200,0.15)",color:active?col:"rgba(31,212,200,0.3)",
  });

  const eqCard = (label:string, value:number, max:number, col:string, thresh?:number): React.JSX.Element => (
    <div style={{background:"rgba(0,0,0,0.4)",border:"1px solid rgba(46,109,164,0.2)",borderRadius:2,padding:"5px 8px",minWidth:140}}>
      <div style={{fontFamily:mono,fontSize:7,color:"rgba(100,140,180,0.7)",letterSpacing:1,marginBottom:2}}>{label}</div>
      <div style={{fontFamily:"'Orbitron',sans-serif",fontSize:13,fontWeight:700,color:col}}>{value.toFixed(4)}</div>
      <div style={{height:3,background:"rgba(46,109,164,0.15)",borderRadius:2,marginTop:4,position:"relative"}}>
        <div style={{position:"absolute",inset:0,borderRadius:2,width:`${Math.min(100,value/max*100)}%`,background:col,transition:"width 0.3s"}}/>
        {thresh!==undefined && <div style={{position:"absolute",top:-2,left:`${thresh/max*100}%`,width:1.5,height:7,background:GOLD}}/>}
      </div>
    </div>
  );

  return (
    <div style={{width:"100%",height:"100%",position:"relative",overflow:"hidden",background:BG,display:"flex",flexDirection:"column"}}>

      <div ref={rootRef} style={{flex:1,position:"relative",overflow:"hidden"}}>
        <canvas ref={canvasRef} style={{position:"absolute",inset:0}} />

        {/* top-left header */}
        <div style={{position:"absolute",top:8,left:10,zIndex:10,pointerEvents:"none"}}>
          <div style={{display:"inline-block",border:`1px solid rgba(31,212,200,0.4)`,padding:"3px 10px",fontSize:9,letterSpacing:"0.2em",color:`${TEAL}cc`,fontFamily:mono,marginBottom:4}}>LIVE SIMULATION</div>
          <div style={{fontFamily:mono,fontSize:"0.48rem",letterSpacing:2,color:"rgba(31,212,200,0.3)"}}>Ψ-COHERENCE FIREWORKS · LIGHT FRAGMENTATION · SMOKE DENSITY · BEER-LAMBERT OPACITY · AETHER</div>
        </div>

        {/* equation display (top center) */}
        <div style={{position:"absolute",top:8,left:"50%",transform:"translateX(-50%)",zIndex:10,pointerEvents:"none",textAlign:"center"}}>
          <div style={{fontFamily:mono,fontSize:7,color:`${TEAL}60`,letterSpacing:0.5,lineHeight:1.8}}>
            Ψ(x,t) = Σ w<sub>i</sub>·S<sub>i</sub>(x,t)·C(x,t)<br/>
            T = exp(−μ·ρ·Δs) &nbsp;·&nbsp; φ⁻¹ = {PHI_INV} (commit)
          </div>
        </div>

        {/* top-right stat cards */}
        <div style={{position:"absolute",top:8,right:10,zIndex:10,pointerEvents:"none",display:"flex",flexDirection:"column",gap:4}}>
          {eqCard("COHERENCE C(x,t)", C_global, 1, TEAL, PHI_INV)}
          {eqCard("DMF DENSITY ρ",    rho,      1, GOLD)}
        </div>

        {/* event log (bottom-right, above controls) */}
        <div style={{position:"absolute",bottom:52,right:10,zIndex:10,pointerEvents:"none",display:"flex",flexDirection:"column",gap:5}}>
          <div style={{fontFamily:mono,fontSize:7,color:"rgba(100,140,180,0.5)",letterSpacing:1}}>LAST BURST</div>
          <div style={{fontFamily:"'Orbitron',sans-serif",fontSize:11,color:TEAL}}>{activeType || "—"}</div>
          <div style={{fontFamily:mono,fontSize:7,color:"rgba(100,140,180,0.4)"}}>COMMITS: {commits} &nbsp;·&nbsp; STEP n={stepN}</div>
        </div>

        {/* Beer-Lambert legend (bottom-left) */}
        <div style={{position:"absolute",bottom:52,left:10,zIndex:10,pointerEvents:"none",display:"flex",flexDirection:"column",gap:3}}>
          {[
            [TEAL, `μ_coh=${MU_COH}  · sharp absorption — coherent opacity`],
            [GOLD, `μ_dec=${MU_DEC}  · diffuse scatter — decoherent opacity`],
            ["#608090",`μ_smoke=${MU_SMOKE} · smoke transmittance T=exp(−τ)`],
            ["#456070",`μ_fog=${MU_FOG}   · fog Beer-Lambert attenuation`],
            ["rgba(255,250,240,0.7)", "FRAGMENTATION · coherent/decoherent interface"],
          ].map(([c,l])=>(
            <div key={l} style={{display:"flex",alignItems:"center",gap:6}}>
              <div style={{width:6,height:6,borderRadius:1,background:c as string,flexShrink:0}}/>
              <span style={{fontFamily:mono,fontSize:5.5,color:`${c}88` as string,letterSpacing:0.3}}>{l}</span>
            </div>
          ))}
        </div>
      </div>

      {/* controls bar */}
      <div style={{flexShrink:0,display:"flex",gap:10,alignItems:"center",justifyContent:"center",flexWrap:"wrap",background:"rgba(1,4,8,0.94)",borderTop:"1px solid rgba(46,109,164,0.15)",padding:"9px 16px"}}>

        <span style={lbl}>LAUNCH RATE</span>
        <input type="range" min="30" max="300" step="10" value={launchRate} style={slid} onChange={e=>setLaunchRate(+e.target.value)} />
        <span style={val_}>{launchRate}</span>

        <div style={sep}/>

        <span style={lbl}>FOG ρ</span>
        <input type="range" min="0" max="1" step="0.05" value={fogAmount} style={slid} onChange={e=>setFogAmount(+e.target.value)} />
        <span style={val_}>{fogAmount.toFixed(2)}</span>

        <div style={sep}/>

        <span style={lbl}>SMOKE</span>
        <input type="range" min="0" max="40" step="2" value={smokeAmount} style={slid} onChange={e=>setSmokeAmount(+e.target.value)} />
        <span style={val_}>{smokeAmount}</span>

        <div style={sep}/>

        <span style={lbl}>DECAY λ</span>
        <input type="range" min="0.2" max="3" step="0.1" value={decayMult} style={slid} onChange={e=>setDecayMult(+e.target.value)} />
        <span style={val_}>{decayMult.toFixed(1)}×</span>

        <div style={sep}/>

        <div style={{display:"flex",gap:4}}>
          {(["full","coh","dec","density"] as const).map(m=>(
            <button key={m} onClick={()=>setViewMode(m)} style={btn(viewMode===m)}>
              {m==="full"?"FULL":m==="coh"?"COH ONLY":m==="dec"?"DEC ONLY":"DENSITY"}
            </button>
          ))}
        </div>

        <div style={sep}/>
        <button onClick={()=>setWaterOn(w=>!w)} style={btn(waterOn,"rgba(31,212,200,0.6)")}>🌊 WATER</button>
      </div>
    </div>
  );
}
