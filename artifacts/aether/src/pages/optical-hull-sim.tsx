import { useEffect, useRef, useState } from "react";

/* ── palette ──────────────────────────────────── */
const BG  = "#02030a";
const MN  = "'Space Mono',monospace";
const OR  = "'Orbitron',sans-serif";
const DIM = "#2a3550";

function ha(hex: string, a: number) {
  if (hex === "#0a1020") return `rgba(10,16,32,${a.toFixed(2)})`;
  const r = parseInt(hex.slice(1,3),16), g = parseInt(hex.slice(3,5),16), b = parseInt(hex.slice(5,7),16);
  return `rgba(${r},${g},${b},${a.toFixed(2)})`;
}
function lerp(a: number, b: number, t: number) { return a + (b-a)*t; }
function lerpHex(h1: string, h2: string, t: number) {
  const c1=[parseInt(h1.slice(1,3),16),parseInt(h1.slice(3,5),16),parseInt(h1.slice(5,7),16)];
  const c2=[parseInt(h2.slice(1,3),16),parseInt(h2.slice(3,5),16),parseInt(h2.slice(5,7),16)];
  return "#"+c1.map((v,i)=>Math.round(lerp(v,c2[i],t)).toString(16).padStart(2,"0")).join("");
}

/* ── plate modes ──────────────────────────────── */
const MODES = [
  { short:"RECV",  col:"#3b82f6", glow:"#3b82f6", name:"Beam Receive"     },
  { short:"STEER", col:"#f59e0b", glow:"#f59e0b", name:"Beam Steer"       },
  { short:"THERM", col:"#ef4444", glow:"#ef4444", name:"Thermal Emit"     },
  { short:"BLCK",  col:"#1e2a3a", glow:"#0a1020", name:"Stealth / Absorb" },
  { short:"LIDAR", col:"#10b981", glow:"#10b981", name:"LIDAR / Sense"    },
  { short:"COMMS", col:"#a78bfa", glow:"#a78bfa", name:"Comms"            },
] as const;

type HullMode = "NOMINAL"|"STEALTH"|"BEAM"|"THERMAL"|"COMMS"|"SCAN";
const HULL_MODES: { key: HullMode; col: string; dist: number[] }[] = [
  { key:"NOMINAL",  col:"#1fd4c8", dist:[0.28,0.22,0.18,0.10,0.12,0.10] },
  { key:"STEALTH",  col:"#64748b", dist:[0.02,0.02,0.04,0.86,0.04,0.02] },
  { key:"BEAM",     col:"#f59e0b", dist:[0.40,0.38,0.10,0.04,0.05,0.03] },
  { key:"THERMAL",  col:"#ef4444", dist:[0.08,0.08,0.54,0.10,0.12,0.08] },
  { key:"COMMS",    col:"#a78bfa", dist:[0.06,0.14,0.06,0.06,0.08,0.60] },
  { key:"SCAN",     col:"#10b981", dist:[0.07,0.08,0.06,0.06,0.60,0.13] },
];

/* ── scale hierarchy data ─────────────────────── */
const SCALE_DATA = [
  {
    n: 1, col:"#60a5fa",
    level:"Atomic",                 size:"~0.2 nm",
    feature:"Silicon crystal lattice",
    desc1:"Si diamond-cubic unit cell a = 0.543 nm. Nearest-neighbour: 0.235 nm.",
    desc2:"All solid-state photonics begin here. EM interaction → quantum mechanics.",
    eq:   "E = ℏ²k²/2m*   [effective-mass dispersion in band structure]",
    ref:  "Kittel, Introduction to Solid State Physics, 8th ed. (2004) · Ashcroft & Mermin (1976)",
  },
  {
    n: 2, col:"#34d399",
    level:"Nanostructure",           size:"100–300 nm",
    feature:"Moth-eye anti-reflection pillars",
    desc1:"SiO₂ pillars at 200 nm pitch create GRIN index n: 1.0 → 3.5 over height h.",
    desc2:"Suppresses Fresnel reflection <0.2 % across 300–1000 nm broadband window.",
    eq:   "n_eff(z) = n_air + (n_Si−n_air)·(z/h)^α   [GRIN profile, α≈0.6]",
    ref:  "Wilson & Hutley, Optica Acta 29(7), 1982 · Dewan et al., Adv. Opt. Mat. 2012",
  },
  {
    n: 3, col:"#a78bfa",
    level:"Metasurface",             size:"0.5–5 μm",
    feature:"Huygens resonator unit cells",
    desc1:"Electric + magnetic Mie modes overlap → 0–2π phase coverage, near-unity T.",
    desc2:"Enables flat optics: lenses, holograms, waveplates without refractive bulk.",
    eq:   "φ(r) = (2π/λ)·[√(f²+r²) − f]   [Fresnel lens phase profile]",
    ref:  "Yu & Capasso, Nature Mater. 13, 139–150 (2014) · Decker et al., Adv. Opt. Mat. 2015",
  },
  {
    n: 4, col:"#fbbf24",
    level:"Ommatidium Lens",         size:"10–50 μm",
    feature:"Individual corneal microlens",
    desc1:"Biconvex facet (n≈1.52) focuses onto rhabdom waveguide. Dragonfly: 28 μm Ø.",
    desc2:"Acceptance angle Δφ ≈ λ/D. 10,000–30,000 facets per compound eye.",
    eq:   "1/f = (n−1)·(1/R₁ − 1/R₂)   [Lensmaker's equation]",
    ref:  "Land & Nilsson, Animal Eyes, 2nd ed., OUP (2012)",
  },
  {
    n: 5, col:"#34d399",
    level:"Waveguide Core",          size:"5–20 μm",
    feature:"Light confinement channel",
    desc1:"Step-index core n₁=1.48, clad n₂=1.46 guides via total internal reflection.",
    desc2:"Single-mode condition: V = (2πa/λ)·NA < 2.405. SMF-28 core: 8 μm @ 1550 nm.",
    eq:   "NA = √(n₁²−n₂²)   ·   V = (2πa/λ)·NA < 2.405",
    ref:  "Saleh & Teich, Fundamentals of Photonics, Wiley (2007)",
  },
  {
    n: 6, col:"#f97316",
    level:"Artificial Ommatidium",   size:"20–100 μm",
    feature:"Stacked optical + detector cell",
    desc1:"Microlens + photonic-crystal waveguide + Si photodiode in 50 μm³ stacked cube.",
    desc2:"Photonic bandgap confines in-band. Responsivity R = η·qλ/hc [A/W].",
    eq:   "R = η·qλ/hc   [detector responsivity, A/W]",
    ref:  "Jeong et al., Nature Mater. 5, 454–460 (2006) · Ko et al., Nature 454 (2008)",
  },
  {
    n: 7, col:"#ef4444",
    level:"Compound-Eye Cluster",    size:"1–10 mm",
    feature:"Curved lens sub-array",
    desc1:"7–37 ommatidia on curved substrate. Dragonfly: 30,000 facets, 270° panorama.",
    desc2:"Combined FOV = Δφ × N_rows. Angular res. per facet: Δφ ≈ λ/d_facet.",
    eq:   "D_eff = N^½·d_single   [sparse aperture equivalent diameter]",
    ref:  "Sheng et al., JOSA A 30(8), 2013 · Duparré & Wippermann, Analyst (2012)",
  },
  {
    n: 8, col:"#ec4899",
    level:"Full Compound-Eye Optic", size:"1–20 cm",
    feature:"Hemispherical curved optical surface",
    desc1:"256-ommatidium Si compound eye on elastic hemispherical substrate. FOV: 180°.",
    desc2:"Mimics mantis-shrimp 4-quadrant retina + polarisation. Solid angle Ω = 2π sr.",
    eq:   "Ω = 2π·(1−cosθ)   [solid angle, steradians]",
    ref:  "Ko et al., Nature 454, 748–753 (2008) · Song et al., Nature Electronics (2020)",
  },
  {
    n: 9, col:"#f43f5e",
    level:"Laser Aperture Array",    size:"10 cm – 10 m",
    feature:"Coherent phased emitter field",
    desc1:"N apertures phase-locked via OPLL. Irradiance ∝ N² (coherent addition).",
    desc2:"DARPA JDPA target: 100 kW combined at 1 km. Phase error budget: λ/16 rms.",
    eq:   "I_total = N²·I₀·sinc²(NΔφ/2π)   [coherent array irradiance]",
    ref:  "Fan et al., Opt. Lett. 44(8), 2019 · McNaught et al., SPIE 7195 (2009)",
  },
  {
    n:10, col:"#a78bfa",
    level:"Directed Energy System",  size:"1 – 100 m",
    feature:"Space-based beam-forming platform",
    desc1:"Diffraction-limited spot: r = 1.22λR/D at range R. Scales with aperture D.",
    desc2:"Starshot: 4 m Ø, 100 GW burst → 1 GW/m² at 1 km lightsail.",
    eq:   "r_spot = 1.22λR/D   [Airy-disk radius at range R]",
    ref:  "Lubin, JBIS 69 (2016) · Kulkarni et al., Acta Astronautica (2018)",
  },
  {
    n:11, col:"#818cf8",
    level:"Orbital Laser Array",     size:"100 m – 10 km",
    feature:"Distributed aperture synthesis",
    desc1:"Inter-satellite baseline B → θ_res = λ/B (VLBI analogue from orbit).",
    desc2:"Path-length stability ≤ λ/8 = 190 nm at 1550 nm via laser metrology.",
    eq:   "θ_res = λ/B   [VLBI-analogue angular resolution]",
    ref:  "ESA Blackbeard/OISL concept (2022) · Fridlund, Proc. SPIE 4852 (2004)",
  },
  {
    n:12, col:"#c4b5fd",
    level:"Interplanetary Beamer",   size:"10 – 1,000 km",
    feature:"Solar-system propulsion infrastructure",
    desc1:"10 km aperture array in Earth orbit drives 4 m lightsail to 0.2c in ~10 min.",
    desc2:"Required: ~100 GW CW. Min size: D_min = 2.44λL/d (L = 1 AU, d = sail).",
    eq:   "a = 2P/(Mc)   [radiation-pressure acceleration on reflective sail]",
    ref:  "Lubin, JBIS 69 (2016) · Manchester & Loeb, ApJ 837, L2 (2017)",
  },
];

/* ══════════════ HULL CANVAS ══════════════ */
type Plate = {
  cx:number; cy:number; mode:number; target:number;
  progress:number; delay:number; brightness:number;
};

function HullCanvas({ modeRef }: { modeRef: React.MutableRefObject<HullMode> }) {
  const ref = useRef<HTMLCanvasElement>(null);
  const raf = useRef(0);

  useEffect(() => {
    const canvas = ref.current; if (!canvas) return;
    const ctx = canvas.getContext("2d")!;
    const W = canvas.width, H = canvas.height;

    const R = 22;
    const xStep = R * 1.5, yStep = R * Math.sqrt(3);
    const plates: Plate[] = [];
    const COLS = Math.ceil(W / xStep) + 2, ROWS = Math.ceil(H / yStep) + 2;

    for (let col = 0; col < COLS; col++)
      for (let row = 0; row < ROWS; row++) {
        const cx = col * xStep - R * 0.5;
        const cy = row * yStep + (col % 2) * yStep * 0.5 - yStep * 0.5;
        if (cx < -R || cx > W+R || cy < -R || cy > H+R) continue;
        const m = Math.floor(Math.random() * 6);
        plates.push({ cx, cy, mode:m, target:m, progress:1, delay:0, brightness:0.5+Math.random()*0.5 });
      }

    const stars: [number,number,number][] = Array.from({length:120}, ()=>
      [Math.random()*W, Math.random()*H, Math.random()]);

    let t = 0, lastMode: HullMode = "NOMINAL";
    let beams: {x1:number;y1:number;x2:number;y2:number;life:number;col:string}[] = [];
    let signals: {x:number;y:number;r:number;col:string}[] = [];

    function drawHex(cx:number, cy:number, r:number) {
      ctx.beginPath();
      for (let i=0;i<6;i++){const a=(Math.PI/3)*i;ctx.lineTo(cx+r*Math.cos(a),cy+r*Math.sin(a));}
      ctx.closePath();
    }

    function reassign(key: HullMode) {
      const hm = HULL_MODES.find(m=>m.key===key)!;
      const cumul = hm.dist.reduce((acc,v,i)=>[...acc,(acc[i-1]??0)+v],[] as number[]);
      plates.forEach((p,pi)=>{
        const rv=Math.random(); let t2=0;
        for(let i=0;i<6;i++){if(rv<cumul[i]){t2=i;break;}}
        p.target=t2; p.progress=0; p.delay=Math.floor(Math.random()*90+pi%30);
      });
    }
    reassign("NOMINAL");

    function frame() {
      t++;
      const curMode = modeRef.current;
      if (curMode !== lastMode) { lastMode=curMode; reassign(curMode); }

      plates.forEach(p=>{
        if(p.delay>0){p.delay--;return;}
        if(p.progress<1){ p.progress=Math.min(1,p.progress+0.025); if(p.progress>=1)p.mode=p.target; }
        p.brightness=0.55+0.45*Math.abs(Math.sin(t*0.022+p.cx*0.01));
      });

      if(t%18===0){ const gs=plates.filter(p=>(p.progress<1?p.target:p.mode)===1); if(gs.length){const s=gs[~~(Math.random()*gs.length)],tt=plates[~~(Math.random()*plates.length)];beams.push({x1:s.cx,y1:s.cy,x2:tt.cx,y2:tt.cy,life:40,col:"#f59e0b"});}}
      if(t%28===0){ const ps=plates.filter(p=>(p.progress<1?p.target:p.mode)===5); if(ps.length){const s=ps[~~(Math.random()*ps.length)];signals.push({x:s.cx,y:s.cy,r:0,col:"#a78bfa"});}}
      beams=beams.filter(b=>b.life-->0);
      signals=signals.filter(s=>(s.r+=2.5)<90);

      ctx.fillStyle="#010309"; ctx.fillRect(0,0,W,H);
      stars.forEach(([sx,sy,sv])=>{ ctx.fillStyle=`rgba(160,200,255,${0.2+sv*0.4})`; ctx.fillRect(sx,sy,sv<0.5?1:1.5,sv<0.5?1:1.5); });

      plates.forEach(p=>{
        const m1=MODES[p.mode],m2=MODES[p.target];
        const col=p.progress<1?lerpHex(m1.col,m2.col,p.progress):m1.col;
        const glow=p.progress<1?lerpHex(m1.glow,m2.glow,p.progress):m1.glow;
        const bri=p.brightness, act=p.progress<1;

        drawHex(p.cx,p.cy,R-1.5); ctx.fillStyle="#010309"; ctx.fill();
        drawHex(p.cx,p.cy,R-3);
        ctx.fillStyle=ha(col,0.12+bri*0.20);
        if(glow!=="#0a1020"){ctx.shadowColor=glow;ctx.shadowBlur=act?14:5+bri*9;}
        ctx.fill(); ctx.shadowBlur=0;
        ctx.strokeStyle=ha(col,0.30+bri*0.35); ctx.lineWidth=0.8+(act?1.2:0); ctx.stroke();
        ctx.beginPath(); ctx.arc(p.cx,p.cy,3.5,0,Math.PI*2);
        ctx.fillStyle=ha(col,0.60+bri*0.35); ctx.fill();
      });

      beams.forEach(b=>{ const a=b.life/40; ctx.save(); ctx.strokeStyle=ha(b.col,a*0.7); ctx.lineWidth=1.5*a; ctx.shadowColor=b.col; ctx.shadowBlur=8*a; ctx.beginPath(); ctx.moveTo(b.x1,b.y1); ctx.lineTo(b.x2,b.y2); ctx.stroke(); ctx.shadowBlur=0; ctx.restore(); });
      signals.forEach(s=>{ const a=1-s.r/90; ctx.strokeStyle=ha(s.col,a*0.55); ctx.lineWidth=1.5*a; ctx.shadowColor=s.col; ctx.shadowBlur=8*a; ctx.beginPath(); ctx.arc(s.x,s.y,s.r,0,Math.PI*2); ctx.stroke(); ctx.shadowBlur=0; });

      // AI HUD
      const hx=W-210,hy=14,hm=HULL_MODES.find(m=>m.key===curMode)!;
      ctx.fillStyle="rgba(1,3,10,0.78)"; ctx.fillRect(hx,hy,196,102);
      ctx.strokeStyle=ha(hm.col,0.4); ctx.lineWidth=1; ctx.strokeRect(hx,hy,196,102);
      ctx.fillStyle=hm.col; ctx.font=`bold 11px ${OR}`; ctx.textAlign="left"; ctx.fillText("AI CONTROLLER",hx+10,hy+18);
      ctx.font=`10px ${MN}`; ctx.fillStyle="rgba(180,210,240,0.6)";
      ctx.fillText(`mode:     ${curMode}`,hx+10,hy+34);
      ctx.fillText(`plates:   ${plates.length}`,hx+10,hy+48);
      const sw=plates.filter(p=>p.progress<1).length;
      ctx.fillStyle=sw>0?"#fbbf24":"#22c55e";
      ctx.fillText(`switching: ${sw}`,hx+10,hy+62);
      ctx.fillStyle="rgba(180,210,240,0.45)";
      ctx.fillText(`t = ${t.toString().padStart(7,"0")}`,hx+10,hy+76);
      ctx.fillStyle=ha(hm.col,0.22); ctx.fillRect(hx,hy+96,Math.min(196,(t%300)/300*196),6);

      if(curMode==="SCAN"||curMode==="NOMINAL"){
        const sa=(t*0.03)%(Math.PI*2);
        ctx.save(); ctx.strokeStyle=ha("#10b981",0.14); ctx.lineWidth=1.5;
        ctx.beginPath(); ctx.moveTo(W*0.5,H*0.5); ctx.lineTo(W*0.5+Math.cos(sa)*180,H*0.5+Math.sin(sa)*180); ctx.stroke(); ctx.restore();
      }

      ctx.fillStyle="rgba(1,3,10,0.74)"; ctx.fillRect(0,H-26,W,26);
      ctx.strokeStyle=ha("#1fd4c8",0.10); ctx.lineWidth=1; ctx.beginPath(); ctx.moveTo(0,H-26); ctx.lineTo(W,H-26); ctx.stroke();
      const mc=[0,1,2,3,4,5].map(m=>plates.filter(p=>p.mode===m).length);
      let bx=12;
      MODES.forEach((m,i)=>{ ctx.fillStyle=ha(m.col,0.75); ctx.font=`10px ${MN}`; ctx.textAlign="left"; ctx.fillText(`${m.short}: ${mc[i]}`,bx,H-9); bx+=90; });

      raf.current=requestAnimationFrame(frame);
    }
    frame();
    return ()=>cancelAnimationFrame(raf.current);
  }, []);

  return <canvas ref={ref} width={1100} height={500} style={{width:"100%",height:"auto",display:"block",borderRadius:6}} />;
}

/* ══════════════ SCALE HIERARCHY CANVAS ══════════════ */
function ScaleHierarchyCanvas() {
  const ref = useRef<HTMLCanvasElement>(null);
  const raf = useRef(0);
  const STRIP = 92;

  useEffect(() => {
    const canvas = ref.current; if (!canvas) return;
    const ctx = canvas.getContext("2d")!;
    const W = canvas.width, H = canvas.height;
    const VX = W - 270, VW = 265; // visualization column
    let t = 0;

    function drawVis(n: number, vx: number, vy: number, vw: number, vh: number, col: string, pulse: number) {
      ctx.save();
      ctx.beginPath(); ctx.rect(vx, vy, vw, vh); ctx.clip();
      const cx = vx + vw/2, cy = vy + vh/2;

      if (n === 0) {
        // Crystal lattice — animated breathing dots
        const sp = 14;
        for (let dx = 0; dx < vw; dx += sp)
          for (let dy = 0; dy < vh; dy += sp) {
            const beat = 0.5 + 0.5*Math.sin(t*0.04 + dx*0.2 + dy*0.15);
            ctx.fillStyle = ha(col, 0.35 + beat*0.45);
            ctx.beginPath(); ctx.arc(vx+dx+sp/2, vy+dy+sp/2, 2.5+beat*1.2, 0, Math.PI*2); ctx.fill();
          }
        // Bond lines
        ctx.strokeStyle = ha(col, 0.12); ctx.lineWidth = 0.5;
        for (let dx = sp; dx < vw; dx += sp)
          for (let dy = 0; dy < vh; dy += sp) {
            ctx.beginPath(); ctx.moveTo(vx+dx-sp+sp/2, vy+dy+sp/2); ctx.lineTo(vx+dx+sp/2, vy+dy+sp/2); ctx.stroke();
            if (dy > 0) { ctx.beginPath(); ctx.moveTo(vx+dx+sp/2, vy+dy-sp+sp/2); ctx.lineTo(vx+dx+sp/2, vy+dy+sp/2); ctx.stroke(); }
          }
      }
      else if (n === 1) {
        // Moth-eye pillars — vertical bars with rounded caps
        const nPil = Math.floor(vw / 10);
        for (let i = 0; i < nPil; i++) {
          const px = vx + i*(vw/nPil) + (vw/nPil)*0.5;
          const ph = vh*(0.35 + 0.35*Math.sin(t*0.05 + i*0.4));
          const alpha = 0.3 + pulse*0.4;
          ctx.fillStyle = ha(col, alpha);
          ctx.fillRect(px-3, vy+vh-ph, 6, ph);
          ctx.shadowColor = col; ctx.shadowBlur = 6*pulse;
          ctx.fillStyle = ha(col, 0.75);
          ctx.beginPath(); ctx.ellipse(px, vy+vh-ph, 3.5, 2.5, 0, 0, Math.PI*2); ctx.fill();
          ctx.shadowBlur = 0;
        }
        // Incident light rays
        for (let i = 0; i < nPil; i+=2) {
          const px = vx + i*(vw/nPil) + (vw/nPil)*0.5;
          ctx.strokeStyle = ha(col, 0.20); ctx.lineWidth = 1;
          ctx.setLineDash([3,4]);
          ctx.beginPath(); ctx.moveTo(px, vy+2); ctx.lineTo(px, vy+vh*0.25); ctx.stroke();
          ctx.setLineDash([]);
        }
      }
      else if (n === 2) {
        // Metasurface — resonator cross grid
        const sp = 13;
        for (let dx = 0; dx < vw; dx += sp)
          for (let dy = 0; dy < vh; dy += sp) {
            const px = vx+dx+sp/2, py = vy+dy+sp/2;
            const a = 0.3+pulse*0.35;
            ctx.strokeStyle = ha(col, a); ctx.lineWidth = 0.8;
            ctx.strokeRect(px-4, py-4, 8, 8);
            ctx.strokeStyle = ha(col, a+0.2); ctx.lineWidth = 1.2;
            ctx.beginPath(); ctx.moveTo(px-3,py); ctx.lineTo(px+3,py); ctx.stroke();
            ctx.beginPath(); ctx.moveTo(px,py-3); ctx.lineTo(px,py+3); ctx.stroke();
          }
        // Phase wavefront indicator
        ctx.strokeStyle = ha(col, 0.3+pulse*0.3); ctx.lineWidth = 1.5;
        ctx.setLineDash([5,3]);
        ctx.beginPath(); ctx.moveTo(vx, vy+vh*0.5); ctx.lineTo(vx+vw, vy+vh*0.5); ctx.stroke();
        ctx.setLineDash([]);
      }
      else if (n === 3) {
        // Ommatidium lens — concentric rings + pupil
        for (let r = 4; r < vh*0.52; r += 6) {
          ctx.strokeStyle = ha(col, 0.25+pulse*0.3*(1-r/(vh*0.55))); ctx.lineWidth = 1.2;
          ctx.beginPath(); ctx.arc(cx, cy, r, 0, Math.PI*2); ctx.stroke();
        }
        ctx.shadowColor = col; ctx.shadowBlur = 12*pulse;
        ctx.fillStyle = ha(col, 0.65+pulse*0.3);
        ctx.beginPath(); ctx.arc(cx, cy, 4, 0, Math.PI*2); ctx.fill();
        ctx.shadowBlur = 0;
        // Focal point below
        const fy = cy + 22;
        ctx.strokeStyle = ha(col, 0.22); ctx.lineWidth = 0.8;
        ctx.beginPath(); ctx.moveTo(cx-12,cy+10); ctx.lineTo(cx,fy); ctx.moveTo(cx+12,cy+10); ctx.lineTo(cx,fy); ctx.stroke();
      }
      else if (n === 4) {
        // Waveguide — light pulses in parallel channels
        const nCh = 5;
        for (let i = 0; i < nCh; i++) {
          const cy2 = vy + (vh/(nCh+1))*(i+1);
          ctx.fillStyle = ha(col, 0.25+0.15*Math.sin(t*0.06+i*0.8));
          ctx.fillRect(vx, cy2-3, vw, 6);
          ctx.strokeStyle = ha(col, 0.4); ctx.lineWidth = 0.6; ctx.strokeRect(vx, cy2-3, vw, 6);
          // Pulse dot
          const ppx = vx + ((t*2.5 + i*40) % vw);
          ctx.shadowColor = col; ctx.shadowBlur = 10;
          ctx.fillStyle = ha(col, 0.9);
          ctx.beginPath(); ctx.arc(ppx, cy2, 3, 0, Math.PI*2); ctx.fill();
          ctx.shadowBlur = 0;
        }
      }
      else if (n === 5) {
        // Artificial ommatidium — hex cell with rings
        const hR = Math.min(vw, vh)*0.35;
        ctx.strokeStyle = ha(col, 0.5+pulse*0.3); ctx.lineWidth = 1.5;
        ctx.beginPath();
        for(let i=0;i<6;i++){const a=(Math.PI/3)*i;const px=cx+hR*Math.cos(a),py=cy+hR*Math.sin(a);if(i===0)ctx.moveTo(px,py);else ctx.lineTo(px,py);}
        ctx.closePath(); ctx.stroke();
        for (let r = 4; r < hR*0.7; r += 7) {
          ctx.strokeStyle = ha(col, 0.3+pulse*0.25); ctx.lineWidth = 0.9;
          ctx.beginPath(); ctx.arc(cx, cy, r, 0, Math.PI*2); ctx.stroke();
        }
        ctx.shadowColor=col; ctx.shadowBlur=8*pulse;
        ctx.fillStyle=ha(col, 0.7); ctx.beginPath(); ctx.arc(cx,cy,3.5,0,Math.PI*2); ctx.fill();
        ctx.shadowBlur=0;
      }
      else if (n === 6) {
        // Compound-eye cluster — 7 hex cells
        const offsets: [number,number][] = [[0,0],[22,0],[-22,0],[11,-19],[-11,-19],[11,19],[-11,19]];
        offsets.forEach(([ox,oy])=>{
          const hx2=cx+ox, hy2=cy+oy, hr=9;
          ctx.strokeStyle=ha(col,0.45+pulse*0.3); ctx.lineWidth=1;
          ctx.beginPath();
          for(let i=0;i<6;i++){const a=(Math.PI/3)*i;const px=hx2+hr*Math.cos(a),py=hy2+hr*Math.sin(a);if(i===0)ctx.moveTo(px,py);else ctx.lineTo(px,py);}
          ctx.closePath(); ctx.stroke();
          ctx.fillStyle=ha(col,0.3+pulse*0.2); ctx.fill();
          ctx.fillStyle=ha(col,0.6); ctx.beginPath(); ctx.arc(hx2,hy2,2,0,Math.PI*2); ctx.fill();
        });
      }
      else if (n === 7) {
        // Full compound eye — hemisphere
        ctx.strokeStyle=ha(col,0.45+pulse*0.25); ctx.lineWidth=1.5;
        ctx.beginPath(); ctx.arc(cx, cy+8, vh*0.44, -Math.PI, 0); ctx.stroke();
        // Facets on surface
        for (let i=-4;i<=4;i++){
          const ang=i*0.22;
          const sr=vh*0.44;
          const fx=cx+sr*Math.sin(ang), fy=cy+8-sr*Math.cos(ang);
          ctx.fillStyle=ha(col,0.4+pulse*0.25);
          ctx.beginPath(); ctx.arc(fx,fy,4.5,0,Math.PI*2); ctx.fill();
        }
        // FOV arc
        ctx.strokeStyle=ha(col,0.15); ctx.lineWidth=0.8;
        ctx.setLineDash([4,4]);
        ctx.beginPath(); ctx.arc(cx,cy+8,vh*0.44+18,-Math.PI,0); ctx.stroke();
        ctx.setLineDash([]);
        ctx.fillStyle=ha(col,0.3); ctx.font=`9px ${MN}`; ctx.textAlign="center";
        ctx.fillText("180° FOV", cx, vy+vh-4);
      }
      else if (n === 8) {
        // Laser aperture array — nested rings + phase markers
        const rs = [8, 18, 28, 38];
        rs.forEach((r,ri)=>{
          ctx.strokeStyle=ha(col,0.35+pulse*0.3); ctx.lineWidth=ri===0?2.5:1.5;
          ctx.shadowColor=col; ctx.shadowBlur=ri===0?10*pulse:4*pulse;
          ctx.beginPath(); ctx.arc(cx,cy,r,0,Math.PI*2); ctx.stroke();
          ctx.shadowBlur=0;
          // rotating phasor
          const pa=t*0.05+ri*0.7;
          ctx.fillStyle=ha(col,0.8); ctx.beginPath(); ctx.arc(cx+r*Math.cos(pa),cy+r*Math.sin(pa),2.5,0,Math.PI*2); ctx.fill();
        });
        // Coherent beam out
        ctx.save(); ctx.shadowColor=col; ctx.shadowBlur=16*pulse;
        ctx.strokeStyle=ha(col,0.55+pulse*0.35); ctx.lineWidth=2.5;
        ctx.beginPath(); ctx.moveTo(cx,cy); ctx.lineTo(cx,vy+2); ctx.stroke();
        ctx.shadowBlur=0; ctx.restore();
      }
      else if (n === 9) {
        // Directed energy — platform + beam
        ctx.fillStyle=ha(col,0.18); ctx.strokeStyle=ha(col,0.45); ctx.lineWidth=1.2;
        ctx.beginPath(); ctx.roundRect(cx-45,cy,90,20,3); ctx.fill(); ctx.stroke();
        // Solar panels
        ctx.fillStyle=ha(col,0.12); ctx.strokeStyle=ha(col,0.3); ctx.lineWidth=0.8;
        ctx.fillRect(cx-80,cy+5,28,10); ctx.strokeRect(cx-80,cy+5,28,10);
        ctx.fillRect(cx+52,cy+5,28,10); ctx.strokeRect(cx+52,cy+5,28,10);
        // Beam
        ctx.save(); ctx.shadowColor=col; ctx.shadowBlur=14*pulse;
        ctx.strokeStyle=ha(col,0.55+pulse*0.4); ctx.lineWidth=2.5+pulse*1.5;
        ctx.beginPath(); ctx.moveTo(cx,cy); ctx.lineTo(cx,vy+2); ctx.stroke();
        ctx.shadowBlur=0; ctx.restore();
        // Range text
        ctx.fillStyle=ha(col,0.35); ctx.font=`9px ${MN}`; ctx.textAlign="center";
        ctx.fillText("↑ beam", cx, vy+12);
      }
      else if (n === 10) {
        // Orbital array — 5 satellites in formation
        const sats: [number,number][] = [[cx,cy],[cx-38,cy-16],[cx+38,cy-16],[cx-22,cy+24],[cx+22,cy+24]];
        const orbAng = t*0.007;
        sats.forEach(([sx,sy],si)=>{
          const ox = si>0 ? Math.cos(orbAng+si)*4 : 0;
          const oy = si>0 ? Math.sin(orbAng+si)*4 : 0;
          const nx=sx+ox, ny=sy+oy;
          // Body
          ctx.fillStyle=ha(col,0.3); ctx.fillRect(nx-7,ny-3,14,6);
          // Panels
          ctx.fillStyle=ha(col,0.18); ctx.fillRect(nx-14,ny-2,6,4); ctx.fillRect(nx+8,ny-2,6,4);
          ctx.strokeStyle=ha(col,0.4); ctx.lineWidth=0.6;
          ctx.strokeRect(nx-14,ny-2,6,4); ctx.strokeRect(nx+8,ny-2,6,4);
          // Link
          if(si>0){
            ctx.save(); ctx.strokeStyle=ha(col,0.18+pulse*0.15); ctx.lineWidth=0.8;
            ctx.setLineDash([3,3]); ctx.beginPath(); ctx.moveTo(sats[0][0],sats[0][1]); ctx.lineTo(nx,ny); ctx.stroke();
            ctx.setLineDash([]); ctx.restore();
          }
        });
      }
      else if (n === 11) {
        // Interplanetary — planet with rings + beam
        const pr = vh*0.36;
        ctx.strokeStyle=ha(col,0.4); ctx.lineWidth=1.5;
        const px2 = vx + pr + 12;
        ctx.beginPath(); ctx.arc(px2,cy,pr,0,Math.PI*2); ctx.stroke();
        ctx.fillStyle=ha(col,0.07); ctx.fill();
        // Rings
        ctx.strokeStyle=ha(col,0.22); ctx.lineWidth=0.9;
        ctx.beginPath(); ctx.ellipse(px2,cy,pr*1.6,pr*0.22,0,0,Math.PI*2); ctx.stroke();
        // Beam
        ctx.save(); ctx.shadowColor=col; ctx.shadowBlur=18*pulse;
        ctx.strokeStyle=ha(col,0.55+pulse*0.4); ctx.lineWidth=2;
        ctx.beginPath(); ctx.moveTo(px2+pr+4,cy); ctx.lineTo(vx+vw,cy); ctx.stroke();
        ctx.shadowBlur=0; ctx.restore();
        // Lightsail at right
        ctx.strokeStyle=ha(col,0.55); ctx.lineWidth=2;
        ctx.beginPath(); ctx.moveTo(vx+vw-12,cy-12); ctx.lineTo(vx+vw-12,cy+12); ctx.stroke();
        ctx.fillStyle=ha(col,0.35); ctx.font=`9px ${MN}`; ctx.textAlign="center";
        ctx.fillText("~0.2c", vx+vw-6, cy-16);
      }

      ctx.restore();
    }

    function frame() {
      t++;
      ctx.fillStyle="#01030a"; ctx.fillRect(0,0,W,H);

      const activeLevel = Math.floor(t/160) % 12;

      SCALE_DATA.forEach((d, n) => {
        const y = n * STRIP;
        const col = d.col;
        const active = n === activeLevel;
        const pulse = 0.5 + 0.5*Math.sin(t*0.035 + n*0.65);

        // Strip background
        ctx.fillStyle = ha(col, active ? 0.09 : 0.03);
        ctx.fillRect(0, y, W, STRIP-1);

        // Separator
        ctx.fillStyle = ha(col, 0.06);
        ctx.fillRect(0, y+STRIP-1, W, 1);

        // Left accent bar
        ctx.fillStyle = ha(col, active ? 0.9+pulse*0.1 : 0.35);
        if (active) { ctx.shadowColor=col; ctx.shadowBlur=8; }
        ctx.fillRect(0, y, 5, STRIP-1);
        ctx.shadowBlur=0;

        // Level number badge
        ctx.fillStyle = ha(col, active ? 0.8 : 0.35);
        ctx.font = `bold 18px ${OR}`;
        ctx.textAlign = "left";
        ctx.fillText(`L${d.n.toString().padStart(2,"0")}`, 12, y+24);

        // Level name
        ctx.fillStyle = active ? col : ha(col, 0.65);
        ctx.font = `bold 14px ${OR}`;
        ctx.fillText(d.level, 12, y+42);

        // Size badge
        ctx.fillStyle = ha(col, active ? 0.65 : 0.4);
        ctx.font = `10px ${MN}`;
        ctx.fillText(d.size, 12, y+56);

        // Feature label
        ctx.fillStyle = ha(col, 0.45);
        ctx.font = `10px ${MN}`;
        ctx.fillText(`↳ ${d.feature}`, 12, y+70);

        // Descriptions (starting after level label column)
        const TXT_X = 200;
        ctx.fillStyle = "rgba(190,210,235,0.70)";
        ctx.font = `11px ${MN}`;
        ctx.fillText(d.desc1, TXT_X, y+18);
        ctx.fillStyle = "rgba(190,210,235,0.55)";
        ctx.fillText(d.desc2, TXT_X, y+33);

        // Equation
        ctx.fillStyle = ha(col, 0.60);
        ctx.font = `11px ${MN}`;
        ctx.fillText(d.eq, TXT_X, y+52);

        // Reference
        ctx.fillStyle = "rgba(120,150,185,0.38)";
        ctx.font = `10px ${MN}`;
        ctx.fillText(d.ref, TXT_X, y+68);

        // Viz separator line
        ctx.strokeStyle = ha(col, 0.10); ctx.lineWidth = 1;
        ctx.beginPath(); ctx.moveTo(VX-1, y+4); ctx.lineTo(VX-1, y+STRIP-5); ctx.stroke();

        // Visualization
        drawVis(n, VX+4, y+4, VW-8, STRIP-10, col, pulse);

        // Active glow border
        if (active) {
          ctx.strokeStyle = ha(col, 0.35);
          ctx.lineWidth = 1.5;
          ctx.strokeRect(0, y, W, STRIP-1);
        }
      });

      // Log-scale ruler at very bottom
      const ry = H - 36, rh = 10, rx = 12, rw = W - 24;
      ctx.fillStyle = "rgba(0,0,0,0.5)"; ctx.fillRect(rx-4, ry-20, rw+8, 56);
      ctx.strokeStyle = ha("#1fd4c8", 0.10); ctx.lineWidth=1; ctx.strokeRect(rx-4,ry-20,rw+8,56);

      const grad = ctx.createLinearGradient(rx,0,rx+rw,0);
      const logVals = [-9.7,-7.5,-6.3,-5,-5.3,-4.7,-3,-1.5,-0.5,1,3,5];
      const LOG_MIN=-10, LOG_MAX=5;
      SCALE_DATA.forEach((d,i)=>{
        const frac = (logVals[i]-LOG_MIN)/(LOG_MAX-LOG_MIN);
        grad.addColorStop(Math.max(0,Math.min(1,frac)), ha(d.col, 0.65));
      });
      ctx.fillStyle = grad; ctx.fillRect(rx, ry, rw, rh);
      ctx.strokeStyle = ha("#1fd4c8", 0.15); ctx.lineWidth=1; ctx.strokeRect(rx,ry,rw,rh);

      const decLabs: {[k:number]:string} = {"-10":"0.1nm","-8":"10nm","-6":"1μm","-4":"100μm","-2":"1cm","0":"1m","2":"100m","4":"10km"};
      for (let dec=LOG_MIN; dec<=LOG_MAX; dec+=2) {
        const fx = rx+(dec-LOG_MIN)/(LOG_MAX-LOG_MIN)*rw;
        ctx.strokeStyle=ha("#60a5fa",0.25); ctx.lineWidth=1;
        ctx.beginPath(); ctx.moveTo(fx,ry); ctx.lineTo(fx,ry+rh); ctx.stroke();
        if (decLabs[dec]) { ctx.fillStyle=ha("#b0c8e8",0.40); ctx.font=`9px ${MN}`; ctx.textAlign="center"; ctx.fillText(decLabs[dec],fx,ry+rh+12); }
      }

      // Scale markers
      SCALE_DATA.forEach((d,i)=>{
        const fx = rx+(logVals[i]-LOG_MIN)/(LOG_MAX-LOG_MIN)*rw;
        const act = i===activeLevel;
        ctx.shadowColor=d.col; ctx.shadowBlur=act?12:0;
        ctx.fillStyle=ha(d.col,act?0.95:0.5);
        ctx.beginPath(); ctx.arc(fx,ry+rh*0.5,act?6:3.5,0,Math.PI*2); ctx.fill();
        ctx.shadowBlur=0;
      });

      ctx.fillStyle=ha("#1fd4c8",0.40); ctx.font=`bold 9px ${MN}`; ctx.textAlign="center";
      ctx.fillText("LOGARITHMIC SCALE  ·  ~0.2 nm → 1,000 km  ·  21 decades", rx+rw/2, ry-8);
      ctx.fillStyle=ha(SCALE_DATA[activeLevel].col,0.65); ctx.font=`9px ${MN}`;
      ctx.fillText(`⬤ active: L${activeLevel+1} · ${SCALE_DATA[activeLevel].level}  ${SCALE_DATA[activeLevel].size}`, rx+rw/2, ry+rh+24);

      raf.current = requestAnimationFrame(frame);
    }
    frame();
    return ()=>cancelAnimationFrame(raf.current);
  }, []);

  return (
    <canvas ref={ref} width={1100} height={STRIP*12+52}
      style={{width:"100%",height:"auto",display:"block",borderRadius:6}} />
  );
}

/* ══════════════ PAGE ══════════════ */
export default function OpticalHullSimPage() {
  const [hullMode, setHullMode] = useState<HullMode>("NOMINAL");
  const modeRef = useRef<HullMode>("NOMINAL");
  const setMode = (m: HullMode) => { setHullMode(m); modeRef.current = m; };

  const curHM = HULL_MODES.find(m=>m.key===hullMode)!;

  const body: React.CSSProperties = { fontSize:11.5, color:"rgba(200,210,228,0.7)", lineHeight:1.7 };
  const secLbl: React.CSSProperties = {
    fontFamily:MN, fontSize:8, letterSpacing:"0.22em", color:DIM,
    textTransform:"uppercase", marginBottom:8, paddingBottom:4,
    borderBottom:"1px solid rgba(31,212,200,0.08)",
  };

  return (
    <div style={{minHeight:"100%",background:BG,color:"#d4e4f4",fontFamily:"'Rajdhani',sans-serif",overflowY:"auto"}}>
      <div style={{maxWidth:1160,margin:"0 auto",padding:"16px 20px"}}>

        {/* Title */}
        <div style={{marginBottom:14}}>
          <div style={{display:"inline-block",border:"1px solid #1fd4c855",
            padding:"3px 10px",fontSize:9,letterSpacing:"0.2em",
            fontFamily:MN,color:"#1fd4c8",marginBottom:8,borderRadius:2}}>
            AETHER · OPTICAL HULL · FULL SYSTEM SIMULATION
          </div>
          <h1 style={{fontFamily:OR,fontSize:24,color:"#fff",
            margin:"0 0 6px",letterSpacing:2,textShadow:"0 0 24px #1fd4c855"}}>
            Plate-Switching Optical Hull · Full System
          </h1>
          <p style={{...body,margin:"0 0 10px",maxWidth:900}}>
            Live hex-tile spacecraft hull with six switchable plate modes under{" "}
            <strong style={{color:"#1fd4c8"}}>AI controller</strong> command, followed by the complete{" "}
            <strong style={{color:"#a78bfa"}}>Scale Hierarchy</strong> — all 12 levels from atomic
            lattice spacing (0.2 nm) through moth-eye nanostructures, Huygens metasurfaces, compound-eye
            optics, directed-energy platforms, and orbital laser arrays to the interplanetary beamer (10–1000 km) —
            each with governing equation, description, and scientific reference.
          </p>

          {/* Mode buttons */}
          <div style={{display:"flex",gap:8,flexWrap:"wrap",marginBottom:4}}>
            {HULL_MODES.map(hm=>(
              <button key={hm.key} onClick={()=>setMode(hm.key)}
                style={{
                  fontFamily:MN,fontSize:11,letterSpacing:"0.15em",
                  padding:"5px 14px",borderRadius:3,cursor:"pointer",
                  border:`1px solid ${hm.key===hullMode?ha(hm.col,0.8):ha(hm.col,0.25)}`,
                  background:hm.key===hullMode?ha(hm.col,0.14):ha(hm.col,0.04),
                  color:hm.key===hullMode?hm.col:ha(hm.col,0.55),
                  boxShadow:hm.key===hullMode?`0 0 18px ${ha(hm.col,0.3)}`:"none",
                }}>
                {hm.key}
              </button>
            ))}
            <span style={{fontFamily:MN,fontSize:10,color:ha(curHM.col,0.5),display:"flex",alignItems:"center",marginLeft:8}}>
              ● {curHM.key} active
            </span>
          </div>
        </div>

        {/* Hull canvas */}
        <div style={{background:ha(curHM.col,0.04),border:`1px solid ${ha(curHM.col,0.18)}`,borderRadius:6,overflow:"hidden",marginBottom:10}}>
          <div style={{padding:"6px 14px",borderBottom:`1px solid ${ha(curHM.col,0.12)}`,display:"flex",justifyContent:"space-between",alignItems:"center"}}>
            <div>
              <span style={{fontFamily:OR,fontSize:10,color:curHM.col,letterSpacing:1}}>OPTICAL HULL · PLATE ARRAY</span>
              <span style={{fontFamily:MN,fontSize:9,color:DIM,marginLeft:12}}>
                Live hex-tile simulation · AI controller · {MODES.length} plate modes · click mode to switch
              </span>
            </div>
            <div style={{display:"flex",gap:14}}>
              {MODES.map((m,i)=>(
                <div key={i} style={{display:"flex",alignItems:"center",gap:5}}>
                  <div style={{width:8,height:8,borderRadius:"50%",background:m.col}}/>
                  <span style={{fontFamily:MN,fontSize:9,color:ha(m.col,0.6)}}>{m.short}</span>
                </div>
              ))}
            </div>
          </div>
          <HullCanvas modeRef={modeRef}/>
        </div>

        {/* Plate layer strip */}
        <div style={{display:"grid",gridTemplateColumns:"repeat(7,1fr)",gap:6,marginBottom:14}}>
          {[
            {n:1,name:"Moth-Eye",    col:"#60a5fa",role:"Anti-reflection",    detail:"100–300 nm pillars, GRIN n: 1→3.5"},
            {n:2,name:"Metasurface", col:"#a78bfa",role:"Wavefront phase",    detail:"Sub-λ Huygens resonators, 0–2π"},
            {n:3,name:"Chromogenic", col:"#10b981",role:"Mode switching",     detail:"Liquid-crystal / electrochromic"},
            {n:4,name:"Photodetect", col:"#fbbf24",role:"State sensing",      detail:"Phase · amplitude · polarisation"},
            {n:5,name:"Actuation",   col:"#f97316",role:"6-axis motion",      detail:"Piezo / MEMS, ms response"},
            {n:6,name:"Thermal Mgmt",col:"#ef4444",role:"Heat spread",        detail:"Graphene + microfluidic cooling"},
            {n:7,name:"Structural",  col:"#64748b",role:"Strength / debris",  detail:"Carbon-fibre / SiC matrix"},
          ].map(({n,name,col,role,detail})=>(
            <div key={n} style={{background:ha(col,0.06),border:`1px solid ${ha(col,0.22)}`,borderRadius:4,padding:"7px 8px"}}>
              <div style={{fontFamily:MN,fontSize:9,color:ha(col,0.45),marginBottom:2}}>L{n}</div>
              <div style={{fontFamily:OR,fontSize:9,color:col,letterSpacing:0.5,marginBottom:2}}>{name}</div>
              <div style={{fontFamily:MN,fontSize:9,color:"rgba(180,200,230,0.55)",marginBottom:2}}>{role}</div>
              <div style={{fontFamily:MN,fontSize:8,color:ha(col,0.35)}}>{detail}</div>
            </div>
          ))}
        </div>

        {/* Scale hierarchy header */}
        <div style={{display:"flex",alignItems:"center",gap:12,marginBottom:8}}>
          <div style={{fontFamily:OR,fontSize:13,color:"#a78bfa",letterSpacing:2}}>
            SCALE HIERARCHY
          </div>
          <div style={{fontFamily:MN,fontSize:9,color:DIM}}>
            12 levels · Atomic → Interplanetary · ~0.2 nm to 10,000 km · 21 decades
          </div>
          <div style={{flex:1,height:1,background:"linear-gradient(to right,rgba(167,139,250,0.3),transparent)"}}/>
        </div>

        {/* Scale canvas */}
        <div style={{background:"rgba(167,139,250,0.03)",border:"1px solid rgba(167,139,250,0.14)",borderRadius:6,overflow:"hidden",marginBottom:14}}>
          <ScaleHierarchyCanvas/>
        </div>

        {/* Adaptive modes */}
        <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:10,marginBottom:6}}>
          {[
            {col:"#1fd4c8",title:"Adaptive Control Loop",
             body:"Onboard processor reads plate state (photodetector layer) 1000×/sec. AI model computes optimal plate assignments based on thermal load, beam geometry, threat signature, and comms direction. Propagation delay <2 ms hull-wide."},
            {col:"#f59e0b",title:"Phase-Conjugate Beam Steering",
             body:"Gold (STEER) plates use the optical phase-conjugation principle: incoming wavefront is time-reversed and re-emitted with corrected phase. Tracks moving targets at closure rates >1000 m/s without mechanical gimbal."},
            {col:"#a78bfa",title:"CaCO₃ Rapid Formation",
             body:"Hull plates grow from rapid crystallisation of calcium carbonate under pulsed UV + thermal cycling. Geological processes (millions of years) compressed to hours via controlled supersaturation, nucleation seeds, and banded deposition."},
          ].map(({col,title,body:b})=>(
            <div key={title} style={{background:ha(col,0.04),border:`1px solid ${ha(col,0.18)}`,borderRadius:4,padding:"10px 12px"}}>
              <div style={secLbl}>{title}</div>
              <div style={body}>{b}</div>
            </div>
          ))}
        </div>

      </div>
    </div>
  );
}
