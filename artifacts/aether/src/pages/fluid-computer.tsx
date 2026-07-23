import { useState, useEffect, useRef } from "react";
const img1 = "/api/storage/public-objects/F267AF72-C84E-4CCD-84A4-5F3A408923FE_1782248870607.png";
const img2 = "/api/storage/public-objects/1DBBC817-C6CA-4CC9-83E1-D0E507B40433_1782248870607.png";
const img3 = "/api/storage/public-objects/29A240ED-5DA4-4189-8496-2838BE84F39E_1782248870607.png";
const img4 = "/api/storage/public-objects/06DD1D28-9ABF-4AF4-9C1A-A31A86895C34_1782248870607.png";
const img5 = "/api/storage/public-objects/IMG_2749_1782248870607.png";
const V = {
  bg: "#010409", panel: "#03060e",
  aurora: "#00FFB2", gold: "#C8A030",
  blue: "#4488FF", violet: "#9966ff",
  plasma: "#FF4477", amb: "#FF9933",
  green: "#44CC77", cyan: "#00CCFF",
  laser1: "#4466FF", laser2: "#FF44FF",
  dim: "#2A3A50", text: "#B8CCE8",
  mono: "'Space Mono','Courier New',monospace",
  serif: "'Crimson Pro','Georgia',serif",
  display: "'Cinzel','Georgia',serif",
};

// ── 1: Open-Air Fluid Computer Canvas ─────────────────────────────────────────
function FluidComputerCanvas() {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const cv = ref.current; if (!cv) return;
    const ctx = cv.getContext("2d")!;
    cv.width = 960; cv.height = 390;
    const W = cv.width, H = cv.height;
    let t = 0, raf = 0;

    const Z1 = W * 0.27, Z2 = W * 0.28, Z3 = W * 0.68, Z4 = W * 0.69;
    const GRID_COLS = 14, GRID_ROWS = 10;
    const cW = (Z3 - Z2) / GRID_COLS, cH = H / GRID_ROWS;

    // Velocity field u(x,y) — two counter-rotating vortices
    const vel = (x: number, y: number, T: number) => {
      const nx = (x - W * 0.48) / (Z3 - Z2);
      const ny = (y - H / 2) / H;
      const vx = -ny * 0.9 + 0.3 * Math.sin(nx * 3 + T * 0.018) + 0.2 * Math.cos(ny * 4 + T * 0.012);
      const vy =  nx * 0.9 + 0.3 * Math.cos(ny * 3 + T * 0.018) + 0.2 * Math.sin(nx * 4 + T * 0.014);
      return { vx, vy };
    };

    type Pt = { x:number; y:number; vx:number; vy:number; life:number; col:string };
    const lidarPts: Pt[] = [];
    const scanX = { v: 0 };
    const laserBeams: { ang: number; len: number; life: number }[] = [];
    const bubbleR = { v: 30 };

    // Init some lidar particles
    for (let i = 0; i < 60; i++)
      lidarPts.push({ x: Math.random()*Z1, y: Math.random()*H, vx:0, vy: 0.4+Math.random()*0.6, life:1, col: `hsl(${180+Math.random()*60},80%,60%)` });

    const draw = () => {
      ctx.fillStyle = "rgba(1,4,9,0.22)"; ctx.fillRect(0,0,W,H);

      // ── Zone backgrounds ──
      ctx.fillStyle = "rgba(0,200,255,0.03)"; ctx.fillRect(0,0,Z1,H);
      ctx.fillStyle = "rgba(0,255,178,0.02)"; ctx.fillRect(Z2,0,Z3-Z2,H);
      ctx.fillStyle = "rgba(255,68,255,0.03)"; ctx.fillRect(Z4,0,W-Z4,H);

      // ── ZONE 1: CAPTURE / LiDAR ──
      // Scan line
      scanX.v = ((t * 0.7) % Z1);
      const scanGrad = ctx.createLinearGradient(scanX.v-20,0,scanX.v,0);
      scanGrad.addColorStop(0,"rgba(0,200,255,0)");
      scanGrad.addColorStop(1,"rgba(0,200,255,0.35)");
      ctx.fillStyle = scanGrad; ctx.fillRect(scanX.v-20,0,20,H);

      // Thermal blob
      const tBx = Z1*0.35, tBy = H*0.45;
      const thermG = ctx.createRadialGradient(tBx,tBy,0,tBx,tBy,60+10*Math.sin(t*0.03));
      thermG.addColorStop(0,"rgba(255,120,0,0.12)");
      thermG.addColorStop(0.6,"rgba(255,60,0,0.05)");
      thermG.addColorStop(1,"transparent");
      ctx.fillStyle=thermG; ctx.fillRect(0,0,Z1,H);

      // Particle rain
      if (t%4===0 && lidarPts.length<80)
        lidarPts.push({x:Math.random()*Z1, y:-5, vx:(Math.random()-0.5)*0.3, vy:0.5+Math.random()*0.7, life:1, col:`hsl(${180+Math.random()*80},80%,65%)`});

      for (let i=lidarPts.length-1;i>=0;i--) {
        const p=lidarPts[i];
        p.y+=p.vy; p.x+=p.vx;
        // Highlight particles near scan line
        const highlighted = Math.abs(p.x - scanX.v) < 8;
        if (highlighted) { ctx.beginPath(); ctx.arc(p.x,p.y,2.5,0,Math.PI*2); ctx.fillStyle=`rgba(0,220,255,0.9)`; ctx.fill(); }
        else { ctx.beginPath(); ctx.arc(p.x,p.y,1.2,0,Math.PI*2); ctx.fillStyle=p.col+"99"; ctx.fill(); }
        if (p.y>H+10) lidarPts.splice(i,1);
      }

      // Wind vectors (left zone)
      ctx.strokeStyle="rgba(0,200,255,0.2)"; ctx.lineWidth=0.8;
      for (let gx=0;gx<4;gx++) for (let gy=0;gy<6;gy++) {
        const px=gx*(Z1/3.5)+20, py=gy*(H/5.5)+20;
        const ang = Math.sin(px*0.04+t*0.02)*0.8 + Math.cos(py*0.05+t*0.018)*0.6;
        ctx.beginPath(); ctx.moveTo(px,py);
        ctx.lineTo(px+Math.cos(ang)*12, py+Math.sin(ang)*12);
        ctx.stroke();
      }

      // ── ZONE 2: NAVIER-STOKES ENGINE (CENTER) ──
      // Vector field arrows
      for (let ci=0; ci<=GRID_COLS; ci++) for (let ri=0; ri<=GRID_ROWS; ri++) {
        const px = Z2 + ci*cW, py = ri*cH;
        const { vx, vy } = vel(px, py, t);
        const mag = Math.sqrt(vx*vx+vy*vy);
        const hue = 150 + mag*80;
        const alpha = 0.15 + mag*0.25;
        const len = 6 + mag*8;
        ctx.strokeStyle=`hsla(${hue},75%,55%,${alpha})`; ctx.lineWidth=0.9;
        ctx.beginPath(); ctx.moveTo(px,py); ctx.lineTo(px+vx*len, py+vy*len); ctx.stroke();
        // Arrow head
        const ang2 = Math.atan2(vy,vx);
        ctx.beginPath(); ctx.moveTo(px+vx*len, py+vy*len);
        ctx.lineTo(px+vx*len-3*Math.cos(ang2-0.4), py+vy*len-3*Math.sin(ang2-0.4));
        ctx.stroke();
      }

      // T+100ms prediction ellipse
      const ellCx = Z2+(Z3-Z2)*0.55, ellCy = H*0.42;
      ctx.save(); ctx.translate(ellCx,ellCy); ctx.scale(1,0.55);
      ctx.beginPath(); ctx.arc(0,0,40+8*Math.sin(t*0.04),0,Math.PI*2);
      ctx.strokeStyle=`rgba(255,153,51,${0.3+0.15*Math.sin(t*0.05)})`; ctx.lineWidth=1.5; ctx.stroke();
      ctx.restore();
      ctx.fillStyle="rgba(255,153,51,0.5)"; ctx.font=`6px ${V.mono}`; ctx.textAlign="center";
      ctx.fillText("T+100ms", ellCx, ellCy-26);

      // Turbulence swirl at bottom center
      for (let s=0;s<3;s++) {
        const sr = 20+s*14, sAlpha=0.06+s*0.03;
        ctx.beginPath(); ctx.arc(Z2+(Z3-Z2)*0.3, H*0.75, sr, 0, Math.PI*2);
        ctx.strokeStyle=`rgba(68,136,255,${sAlpha})`; ctx.lineWidth=1; ctx.stroke();
      }

      // Zone dividers — light pillars
      [Z1, Z2, Z3, Z4].forEach(x => {
        const wg = ctx.createLinearGradient(0,0,0,H);
        wg.addColorStop(0,"rgba(0,255,178,0)");
        wg.addColorStop(0.4,"rgba(0,255,178,0.18)");
        wg.addColorStop(1,"rgba(200,160,48,0)");
        ctx.fillStyle=wg; ctx.fillRect(x-1.5,0,3,H);
      });

      // ── ZONE 3: MANIFESTATION SUBSTRATE (RIGHT) ──
      // Emergent bubble
      const bCx = Z4+(W-Z4)*0.42, bCy = H*0.48;
      bubbleR.v = 55 + 12*Math.sin(t*0.025);
      const bubG = ctx.createRadialGradient(bCx,bCy,0,bCx,bCy,bubbleR.v);
      bubG.addColorStop(0,"rgba(255,100,255,0.06)");
      bubG.addColorStop(0.7,"rgba(68,100,255,0.04)");
      bubG.addColorStop(1,"rgba(255,68,255,0.12)");
      ctx.fillStyle=bubG; ctx.beginPath(); ctx.arc(bCx,bCy,bubbleR.v,0,Math.PI*2); ctx.fill();
      ctx.strokeStyle=`rgba(255,100,255,${0.3+0.15*Math.sin(t*0.035)})`; ctx.lineWidth=1.5; ctx.stroke();

      // Laser beams radiating from bubble surface
      if (t%12===0) laserBeams.push({ ang: Math.random()*Math.PI*2, len: 40+Math.random()*60, life:1 });
      for (let i=laserBeams.length-1;i>=0;i--) {
        const b=laserBeams[i]; b.life-=0.04;
        if (b.life<=0) { laserBeams.splice(i,1); continue; }
        const bx1=bCx+Math.cos(b.ang)*bubbleR.v, by1=bCy+Math.sin(b.ang)*bubbleR.v;
        const bx2=bCx+Math.cos(b.ang)*(bubbleR.v+b.len*b.life), by2=bCy+Math.sin(b.ang)*(bubbleR.v+b.len*b.life);
        ctx.beginPath(); ctx.moveTo(bx1,by1); ctx.lineTo(bx2,by2);
        const laserCols = ["68,100,255","255,68,255","0,200,255","255,153,51"];
        ctx.strokeStyle=`rgba(${laserCols[i%4]},${b.life*0.8})`; ctx.lineWidth=1.5; ctx.stroke();
      }

      // Galvo mirror grid (small dots arranged in grid)
      for (let gx=0;gx<4;gx++) for (let gy=0;gy<5;gy++) {
        const px=Z4+gx*((W-Z4)/4)+10, py=gy*(H/5)+10;
        ctx.beginPath(); ctx.arc(px,py,2.5,0,Math.PI*2);
        const gAlpha=0.3+0.3*Math.sin(t*0.04+gx+gy);
        ctx.fillStyle=`rgba(255,68,255,${gAlpha})`; ctx.fill();
        // Beam to bubble
        if (Math.sin(t*0.05+gx*gy*0.7)>0.85) {
          ctx.beginPath(); ctx.moveTo(px,py); ctx.lineTo(bCx,bCy);
          ctx.strokeStyle=`rgba(100,68,255,0.15)`; ctx.lineWidth=0.5; ctx.stroke();
        }
      }

      // ── Zone Labels ──
      const zones = [
        { x: Z1/2,          label:"CAPTURE LAYER", sub:"LiDAR · Thermal · Particles · Wind", col:"#00CCFF" },
        { x: Z2+(Z3-Z2)/2,  label:"NAVIER-STOKES ENGINE", sub:"ρ(∂u/∂t + u·∇u) = −∇p + μ∇²u + F", col:V.aurora },
        { x: Z4+(W-Z4)/2,   label:"MANIFESTATION SUBSTRATE", sub:"Galvo · Acoustic · Laser · Bubble", col:"#FF44FF" },
      ];
      ctx.textAlign="center";
      zones.forEach(z => {
        ctx.font=`8px ${V.mono}`; ctx.fillStyle=z.col; ctx.fillText(z.label, z.x, 16);
        ctx.font=`6px ${V.mono}`; ctx.fillStyle=z.col+"66"; ctx.fillText(z.sub, z.x, 28);
      });

      // Control loop status bar
      const loopLabels = ["LATENCY 4.2ms","DELAY 78ms","PROCESS 100ms","UPDATE 1.1ms"];
      ctx.fillStyle="rgba(255,255,255,0.03)"; ctx.fillRect(4,H-18,W-8,14);
      loopLabels.forEach((l,i) => {
        const x = 20 + i*(W/4.5);
        ctx.fillStyle="rgba(0,255,178,0.45)"; ctx.font=`6px ${V.mono}`; ctx.textAlign="left";
        ctx.fillText(l, x, H-8);
      });
      ctx.textAlign="center"; ctx.fillStyle="rgba(255,68,255,0.4)"; ctx.font=`6px ${V.mono}`;
      ctx.fillText(`"We don't project into the air. We compute with it."  ·  t=${t}`, W/2, H-8);

      t++; raf=requestAnimationFrame(draw);
    };
    draw();
    return () => cancelAnimationFrame(raf);
  }, []);
  return <canvas ref={ref} style={{ width:"100%", height:"auto", borderRadius:10, display:"block" }} />;
}

// ── 2: Plasmodium Bubble Canvas ────────────────────────────────────────────────
function PlasmodiumCanvas() {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const cv = ref.current; if (!cv) return;
    const ctx = cv.getContext("2d")!;
    cv.width = 960; cv.height = 360;
    const W = cv.width, H = cv.height;
    let t = 0, raf = 0;
    const N = 52;
    const cx = W*0.42, cy = H/2;

    type Node = { x:number; y:number; vx:number; vy:number; phi:number; type:"interior"|"boundary"|"exterior" };
    const nodes: Node[] = Array.from({length:N}, (_,i) => {
      const ang = (i/N)*Math.PI*2 + Math.random()*0.3;
      const r = 60 + Math.random()*90;
      return { x: cx+Math.cos(ang)*r, y: cy+Math.sin(ang)*r, vx:0, vy:0, phi:0, type:"exterior" };
    });
    // Interior nodes
    for (let i=0;i<12;i++) nodes.push({ x: cx+(Math.random()-0.5)*80, y: cy+(Math.random()-0.5)*80, vx:0, vy:0, phi:0, type:"interior" });

    const bubbleRadius = { v: 100 };

    const draw = () => {
      ctx.fillStyle = "rgba(1,4,9,0.22)"; ctx.fillRect(0,0,W,H);

      bubbleRadius.v = 95 + 12*Math.sin(t*0.022);

      // ── Field background Φ heatmap ──
      const step = 16;
      for (let gx=0; gx<W; gx+=step) for (let gy=0; gy<H; gy+=step) {
        const dx=(gx-cx)/W, dy=(gy-cy)/H;
        const dist=Math.sqrt(dx*dx+dy*dy)*2.2;
        const phi = Math.exp(-dist*dist*0.9) * (0.5 + 0.4*Math.sin(dist*6-t*0.03));
        if (phi>0.05) {
          const hue=200+phi*100;
          ctx.fillStyle=`hsla(${hue},70%,50%,${phi*0.14})`; ctx.fillRect(gx,gy,step,step);
        }
      }

      // ── Exterior field arrows ──
      ctx.strokeStyle="rgba(255,80,80,0.18)"; ctx.lineWidth=0.8;
      for (let gx=0;gx<W;gx+=40) for (let gy=0;gy<H;gy+=40) {
        const dx=gx-cx, dy=gy-cy, dist=Math.sqrt(dx*dx+dy*dy);
        if (dist>bubbleRadius.v+30 && dist<bubbleRadius.v+160) {
          const nx=dx/dist, ny=dy/dist;
          const len=8+4*Math.sin(dist*0.05+t*0.02);
          ctx.beginPath(); ctx.moveTo(gx,gy); ctx.lineTo(gx+nx*len,gy+ny*len); ctx.stroke();
        }
      }

      // ── Interior arrows (stabilized, inward-pointing) ──
      ctx.strokeStyle="rgba(68,170,255,0.2)"; ctx.lineWidth=0.8;
      for (let gx=cx-80;gx<cx+80;gx+=28) for (let gy=cy-80;gy<cy+80;gy+=28) {
        const dx=gx-cx, dy=gy-cy, dist=Math.sqrt(dx*dx+dy*dy);
        if (dist<70) {
          const ang=Math.atan2(dy,dx)+Math.PI+0.4*Math.sin(t*0.02);
          const len=5+3*Math.sin(dist*0.12+t*0.025);
          ctx.beginPath(); ctx.moveTo(gx,gy); ctx.lineTo(gx+Math.cos(ang)*len, gy+Math.sin(ang)*len); ctx.stroke();
        }
      }

      // ── Bubble boundary ──
      const bubGrad = ctx.createRadialGradient(cx,cy,0,cx,cy,bubbleRadius.v);
      bubGrad.addColorStop(0,"rgba(68,170,255,0.07)");
      bubGrad.addColorStop(0.75,"rgba(0,200,255,0.04)");
      bubGrad.addColorStop(1,"rgba(0,200,255,0)");
      ctx.fillStyle=bubGrad; ctx.beginPath(); ctx.arc(cx,cy,bubbleRadius.v,0,Math.PI*2); ctx.fill();
      // Adaptive boundary line
      ctx.beginPath();
      for (let a=0;a<Math.PI*2;a+=0.05) {
        const rr=bubbleRadius.v + 8*Math.sin(a*4+t*0.03) + 4*Math.cos(a*7-t*0.02);
        const bx=cx+Math.cos(a)*rr, by=cy+Math.sin(a)*rr;
        a<0.05 ? ctx.moveTo(bx,by) : ctx.lineTo(bx,by);
      }
      ctx.closePath();
      ctx.strokeStyle=`rgba(0,220,255,${0.4+0.15*Math.sin(t*0.04)})`; ctx.lineWidth=1.5; ctx.stroke();

      // ── Nodes update & draw ──
      nodes.forEach((n,i) => {
        const dx=n.x-cx, dy=n.y-cy, dist=Math.sqrt(dx*dx+dy*dy);
        // Classify
        if (dist < bubbleRadius.v*0.65) n.type="interior";
        else if (dist < bubbleRadius.v*1.1) n.type="boundary";
        else n.type="exterior";

        // Node dynamics — ∂φ/∂t + F|∇φ| = 0
        const gradMag = Math.abs(Math.exp(-(dist/bubbleRadius.v-1)*(dist/bubbleRadius.v-1)*8));
        const F = n.type==="boundary" ? 0.3 : n.type==="interior" ? -0.05 : 0.15;
        n.phi += F * gradMag * 0.1 + (Math.random()-0.5)*0.02;
        n.phi = Math.max(0, Math.min(1, n.phi));
        // Drift toward boundary if exterior, stabilize if interior
        if (n.type==="boundary") {
          n.vx += (Math.random()-0.5)*0.1;
          n.vy += (Math.random()-0.5)*0.1;
        }
        n.vx *= 0.92; n.vy *= 0.92;
        n.x+=n.vx*0.4; n.y+=n.vy*0.4;

        // Draw node
        const col = n.type==="interior" ? [68,170,255] : n.type==="boundary" ? [255,200,50] : [255,80,80];
        ctx.beginPath(); ctx.arc(n.x,n.y, n.type==="boundary"?3.5:2.5, 0, Math.PI*2);
        ctx.fillStyle=`rgba(${col[0]},${col[1]},${col[2]},0.85)`; ctx.fill();

        // Connection links between nearby boundary nodes
        if (n.type==="boundary") {
          nodes.forEach((m,j) => {
            if (j<=i || m.type!=="boundary") return;
            const dd=Math.sqrt((n.x-m.x)**2+(n.y-m.y)**2);
            if (dd<60) {
              ctx.beginPath(); ctx.moveTo(n.x,n.y); ctx.lineTo(m.x,m.y);
              ctx.strokeStyle=`rgba(255,200,50,${0.25*(1-dd/60)})`; ctx.lineWidth=0.7; ctx.stroke();
            }
          });
        }
        // Sensing lines from boundary nodes
        if (n.type==="boundary" && Math.sin(t*0.08+i)>0.7) {
          const nearAng = Math.atan2(n.y-cy, n.x-cx);
          ctx.beginPath(); ctx.moveTo(n.x,n.y);
          ctx.lineTo(n.x+Math.cos(nearAng)*20, n.y+Math.sin(nearAng)*20);
          ctx.strokeStyle="rgba(255,200,50,0.3)"; ctx.lineWidth=0.6; ctx.stroke();
        }
      });

      // ── Labels ──
      ctx.textAlign="center";
      ctx.fillStyle="rgba(0,220,255,0.6)"; ctx.font=`7px ${V.mono}`;
      ctx.fillText("STABLE INTERIOR  (Uniform Φ · Low Gradient)", cx, cy-5);
      ctx.fillStyle="rgba(0,220,255,0.3)"; ctx.font=`6px ${V.mono}`;
      ctx.fillText("∇Φ ≈ 0", cx, cy+8);

      const labR = bubbleRadius.v + 18;
      const lAng = -Math.PI*0.3;
      ctx.fillStyle="rgba(255,200,50,0.7)"; ctx.font=`6.5px ${V.mono}`;
      ctx.fillText("ADAPTIVE BOUNDARY LAYER", cx+Math.cos(lAng)*labR, cy+Math.sin(lAng)*labR-8);
      ctx.fillStyle="rgba(255,200,50,0.4)"; ctx.font=`5.5px ${V.mono}`;
      ctx.fillText("Boundary / Gradient Regulation", cx+Math.cos(lAng)*labR, cy+Math.sin(lAng)*labR+4);

      ctx.fillStyle="rgba(255,80,80,0.6)"; ctx.font=`6.5px ${V.mono}`;
      ctx.textAlign="left"; ctx.fillText("EXTERIOR FIELD (High Gradient)", W*0.03, 20);

      // ∂Φ/∂t equation
      ctx.textAlign="right"; ctx.fillStyle="rgba(0,255,178,0.55)"; ctx.font=`8px ${V.mono}`;
      ctx.fillText("∂Φ/∂t + F|∇Φ| = 0", W-12, 20);
      ctx.font=`6px ${V.mono}`; ctx.fillStyle="rgba(0,255,178,0.3)";
      ctx.fillText(`nodes: ${nodes.length}  boundary: ${nodes.filter(n=>n.type==="boundary").length}  interior: ${nodes.filter(n=>n.type==="interior").length}`, W-12, 32);

      // Node legend (right panel)
      const lx = W*0.76, ly = H*0.18;
      [
        { col:"rgb(255,200,50)",  label:"Boundary Node (Active Regulation)" },
        { col:"rgb(68,170,255)",  label:"Interior Node (Stabilization)" },
        { col:"rgb(255,80,80)",   label:"Exterior Node" },
      ].forEach(({ col, label }, i) => {
        ctx.beginPath(); ctx.arc(lx,ly+i*18,4,0,Math.PI*2); ctx.fillStyle=col; ctx.fill();
        ctx.fillStyle="rgba(184,204,232,0.5)"; ctx.font=`6px ${V.mono}`; ctx.textAlign="left";
        ctx.fillText(label, lx+10, ly+i*18+3);
      });

      t++; raf=requestAnimationFrame(draw);
    };
    draw();
    return () => cancelAnimationFrame(raf);
  }, []);
  return <canvas ref={ref} style={{ width:"100%", height:"auto", borderRadius:10, display:"block" }} />;
}

// ── 3: Laser Matrix Canvas ─────────────────────────────────────────────────────
function LaserMatrixCanvas() {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const cv = ref.current; if (!cv) return;
    const ctx = cv.getContext("2d")!;
    cv.width = 960; cv.height = 310;
    const W = cv.width, H = cv.height;
    let t = 0, raf = 0;
    const BPM = 128, BEAT_FRAMES = Math.round(60*60/BPM);
    const COLS = 7, ROWS = 5;
    const padX = 80, padY = 40;
    const sW = (W-padX*2)/(COLS-1), sH = (H-padY*2)/(ROWS-1);

    type Burst = { x:number; y:number; r:number; maxR:number; col:string; life:number };
    const bursts: Burst[] = [];
    type Smoke = { x:number; y:number; vx:number; vy:number; r:number; life:number };
    const smoke: Smoke[] = Array.from({length:80}, () => ({
      x: Math.random()*W, y: Math.random()*H,
      vx:(Math.random()-0.5)*0.2, vy:-0.08-Math.random()*0.15,
      r:8+Math.random()*20, life:Math.random(),
    }));

    const gridNode = (c: number, r: number) => ({ x: padX+c*sW, y: padY+r*sH });

    const draw = () => {
      ctx.fillStyle = "rgba(1,4,9,0.18)"; ctx.fillRect(0,0,W,H);

      // Sky gradient
      const skyG = ctx.createLinearGradient(0,0,0,H);
      skyG.addColorStop(0,"rgba(5,5,30,0)"); skyG.addColorStop(1,"rgba(10,5,25,0.4)");
      ctx.fillStyle=skyG; ctx.fillRect(0,0,W,H);

      // Beat counter
      const beat = Math.floor(t/BEAT_FRAMES);
      const beatPhase = (t%BEAT_FRAMES)/BEAT_FRAMES;

      // ── Smoke particles ──
      smoke.forEach(s => {
        s.x+=s.vx; s.y+=s.vy; s.life-=0.002;
        if (s.life<0) { s.x=Math.random()*W; s.y=H+10; s.life=0.3+Math.random()*0.7; }
        ctx.beginPath(); ctx.arc(s.x,s.y,s.r*(0.5+s.life*0.5),0,Math.PI*2);
        ctx.fillStyle=`rgba(100,100,180,${s.life*0.06})`; ctx.fill();
      });

      // ── Laser grid lines ──
      for (let c=0;c<COLS;c++) for (let r=0;r<ROWS;r++) {
        const { x:x1, y:y1 } = gridNode(c,r);
        // Horizontal
        if (c<COLS-1) {
          const { x:x2, y:y2 } = gridNode(c+1,r);
          const pulse = 0.4 + 0.3*Math.sin(t*0.03+c+r);
          const laserG = ctx.createLinearGradient(x1,y1,x2,y2);
          laserG.addColorStop(0,`rgba(68,100,255,${pulse})`);
          laserG.addColorStop(0.5,`rgba(200,68,255,${pulse*0.8})`);
          laserG.addColorStop(1,`rgba(68,100,255,${pulse})`);
          ctx.strokeStyle=laserG; ctx.lineWidth=1.2;
          ctx.beginPath(); ctx.moveTo(x1,y1); ctx.lineTo(x2,y2); ctx.stroke();
          // Glow
          ctx.shadowBlur=6; ctx.shadowColor="rgba(150,68,255,0.4)";
          ctx.lineWidth=0.4; ctx.strokeStyle=`rgba(200,100,255,${pulse*0.5})`;
          ctx.beginPath(); ctx.moveTo(x1,y1); ctx.lineTo(x2,y2); ctx.stroke();
          ctx.shadowBlur=0;
        }
        // Vertical
        if (r<ROWS-1) {
          const { x:x2, y:y2 } = gridNode(c,r+1);
          const pulse = 0.35+0.25*Math.sin(t*0.025-c+r*1.2);
          ctx.strokeStyle=`rgba(100,68,255,${pulse})`; ctx.lineWidth=1;
          ctx.beginPath(); ctx.moveTo(x1,y1); ctx.lineTo(x2,y2); ctx.stroke();
        }
        // Diagonal connections (sparse)
        if (c<COLS-1 && r<ROWS-1 && (c+r)%3===0) {
          const { x:x2, y:y2 } = gridNode(c+1,r+1);
          ctx.strokeStyle=`rgba(0,200,255,0.12)`; ctx.lineWidth=0.5;
          ctx.beginPath(); ctx.moveTo(x1,y1); ctx.lineTo(x2,y2); ctx.stroke();
        }
      }

      // ── Grid nodes ──
      for (let c=0;c<COLS;c++) for (let r=0;r<ROWS;r++) {
        const { x, y } = gridNode(c,r);
        const glow = 0.5+0.4*Math.sin(t*0.04+c*0.7+r*1.1);
        ctx.beginPath(); ctx.arc(x,y,3.5,0,Math.PI*2);
        ctx.fillStyle=`rgba(220,100,255,${glow})`; ctx.fill();
        // Node flash on beat
        if (beatPhase<0.12 && (c+r)%2===beat%2) {
          ctx.beginPath(); ctx.arc(x,y,8,0,Math.PI*2);
          ctx.fillStyle=`rgba(255,255,255,${0.4*(0.12-beatPhase)/0.12})`; ctx.fill();
        }
      }

      // ── Spawn firework on beat at random grid node ──
      if (t%BEAT_FRAMES===0) {
        const c=Math.floor(Math.random()*COLS), r=Math.floor(Math.random()*ROWS);
        const { x, y } = gridNode(c,r);
        const fireworkCols=["255,68,200","68,150,255","255,200,50","0,255,178","255,68,100"];
        bursts.push({ x, y, r:0, maxR:40+Math.random()*60, col:fireworkCols[Math.floor(Math.random()*5)], life:1 });
        if (t%BEAT_FRAMES===0 && Math.random()>0.5) {
          const c2=(c+2)%COLS, r2=(r+1)%ROWS;
          const { x:x2, y:y2 } = gridNode(c2,r2);
          bursts.push({ x:x2, y:y2, r:0, maxR:30+Math.random()*40, col:fireworkCols[Math.floor(Math.random()*5)], life:1 });
        }
      }

      // ── Draw bursts ──
      for (let i=bursts.length-1;i>=0;i--) {
        const b=bursts[i]; b.r+=2.2+b.maxR*0.04; b.life-=0.035;
        if (b.life<=0) { bursts.splice(i,1); continue; }
        const alpha=b.life*0.7;
        ctx.beginPath(); ctx.arc(b.x,b.y,b.r,0,Math.PI*2);
        ctx.strokeStyle=`rgba(${b.col},${alpha})`; ctx.lineWidth=1.5; ctx.stroke();
        // Sparks
        for (let s=0;s<8;s++) {
          const sang=(s/8)*Math.PI*2+b.r*0.05;
          const sx=b.x+Math.cos(sang)*b.r, sy=b.y+Math.sin(sang)*b.r;
          ctx.beginPath(); ctx.arc(sx,sy,1.5,0,Math.PI*2);
          ctx.fillStyle=`rgba(${b.col},${alpha*0.8})`; ctx.fill();
        }
      }

      // ── Labels ──
      ctx.textAlign="left"; ctx.fillStyle="rgba(200,100,255,0.7)"; ctx.font=`8px ${V.mono}`;
      ctx.fillText("LASER MATRIX · 3D GRID", 12, 18);
      ctx.fillStyle="rgba(200,100,255,0.35)"; ctx.font=`6px ${V.mono}`;
      ctx.fillText("Smoke volumes · Firework nodes · Music sync · Coherent volumetric architecture", 12, 30);

      // BPM counter
      ctx.textAlign="right"; ctx.fillStyle="rgba(0,255,178,0.7)"; ctx.font=`9px ${V.mono}`;
      ctx.fillText(`♩ ${BPM} BPM · BEAT ${beat+1}`, W-12, 18);
      // Beat bar
      ctx.fillStyle="rgba(255,255,255,0.05)"; ctx.fillRect(W-100,24,90,4);
      ctx.fillStyle=`rgba(0,255,178,${0.7*(1-beatPhase)})`; ctx.fillRect(W-100,24,90*beatPhase,4);

      // Layer legend
      const layers=[
        { n:"5",col:"#FF8800",label:"Firework Events"},
        { n:"4",col:"#AA44FF",label:"Smoke / Particles"},
        { n:"3",col:"#4466FF",label:"Laser Grid"},
        { n:"2",col:"#222266",label:"Atmosphere"},
        { n:"1",col:"#002200",label:"Ground Systems"},
      ];
      layers.forEach((l,i) => {
        ctx.fillStyle=l.col+"cc"; ctx.fillRect(W*0.73, H-28-i*13, 8, 8);
        ctx.fillStyle="rgba(184,204,232,0.5)"; ctx.font=`6px ${V.mono}`; ctx.textAlign="left";
        ctx.fillText(`${l.n} ${l.label}`, W*0.73+12, H-22-i*13);
      });

      t++; raf=requestAnimationFrame(draw);
    };
    draw();
    return () => cancelAnimationFrame(raf);
  }, []);
  return <canvas ref={ref} style={{ width:"100%", height:"auto", borderRadius:10, display:"block" }} />;
}

// ── 4: Liquid Cooling + DC Power Canvas ────────────────────────────────────────
function LiquidCoolingCanvas() {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const cv = ref.current; if (!cv) return;
    const ctx = cv.getContext("2d")!;
    cv.width = 960; cv.height = 240;
    const W = cv.width, H = cv.height;
    let t = 0, raf = 0;

    // Coolant path waypoints (closed loop)
    const path = [
      {x:80,y:60},{x:200,y:60},{x:320,y:60},{x:440,y:60},{x:560,y:60},{x:680,y:60},
      {x:760,y:60},{x:840,y:60},{x:880,y:H/2},{x:840,y:H-50},{x:680,y:H-50},
      {x:560,y:H-50},{x:440,y:H-50},{x:320,y:H-50},{x:200,y:H-50},{x:80,y:H-50},
      {x:40,y:H/2},{x:80,y:60},
    ];

    type CoolPt = { t: number }; // t ∈ [0,1] on path
    const coolants: CoolPt[] = Array.from({length:22}, (_,i) => ({ t: i/22 }));

    const pathInterp = (tt: number) => {
      const n=path.length-1;
      const idx=Math.floor(((tt%1+1)%1)*n);
      const frac=((tt%1+1)%1)*n - idx;
      const a=path[idx], b=path[(idx+1)%n];
      return { x: a.x+(b.x-a.x)*frac, y: a.y+(b.y-a.y)*frac };
    };

    // Temperature at a path point (hot near top/compute, cold near bottom/radiator)
    const tempAt = (tt: number) => {
      const norm=((tt%1+1)%1);
      return norm<0.45 ? 0.3+norm*1.4 : norm<0.5 ? 0.95 : 0.95-(norm-0.5)*1.8;
    };

    // Server rack blocks (top section)
    const racks = [{x:160,w:60},{x:280,w:60},{x:400,w:60},{x:520,w:60},{x:640,w:60}];

    // DC power bus nodes
    const dcNodes = [120,240,360,480,600,720,840].map(x => ({x, y:H/2, v:0}));

    const draw = () => {
      ctx.fillStyle="rgba(1,4,9,0.24)"; ctx.fillRect(0,0,W,H);

      // ── Rack blocks ──
      racks.forEach((r,i) => {
        const load=0.3+0.5*Math.sin(t*0.025+i*0.8);
        const hue=20+load*30; // orange to red
        ctx.fillStyle=`hsla(${hue},70%,25%,0.5)`; ctx.fillRect(r.x,28,r.w,50);
        ctx.strokeStyle=`hsla(${hue},70%,50%,0.3)`; ctx.lineWidth=1; ctx.strokeRect(r.x,28,r.w,50);
        // Load bars inside
        for (let row=0;row<4;row++) {
          ctx.fillStyle=`hsla(${hue},80%,55%,${load*0.7})`;
          ctx.fillRect(r.x+4, 32+row*11, (r.w-8)*load, 7);
        }
        ctx.fillStyle="rgba(255,200,100,0.4)"; ctx.font=`5.5px ${V.mono}`; ctx.textAlign="center";
        ctx.fillText(`GPU${i+1}`, r.x+r.w/2, 24);
        ctx.fillText(`${Math.round(load*100)}%`, r.x+r.w/2, H*0.55);
      });

      // ── Coolant path tube ──
      ctx.beginPath();
      path.forEach((p,i) => i===0 ? ctx.moveTo(p.x,p.y) : ctx.lineTo(p.x,p.y));
      ctx.strokeStyle="rgba(0,200,255,0.08)"; ctx.lineWidth=14; ctx.stroke();
      ctx.strokeStyle="rgba(0,200,255,0.15)"; ctx.lineWidth=10; ctx.stroke();

      // Temperature-colored tube segments
      for (let seg=0;seg<path.length-1;seg++) {
        const tt=seg/(path.length-1);
        const temp=tempAt(tt);
        const hue=220-temp*180; // blue→red
        const a=path[seg], b=path[seg+1];
        ctx.beginPath(); ctx.moveTo(a.x,a.y); ctx.lineTo(b.x,b.y);
        ctx.strokeStyle=`hsla(${hue},80%,55%,0.45)`; ctx.lineWidth=8; ctx.stroke();
      }

      // ── Coolant flow particles ──
      coolants.forEach(cp => {
        cp.t=(cp.t+0.0025)%1;
        const pos=pathInterp(cp.t);
        const temp=tempAt(cp.t);
        const hue=220-temp*180;
        ctx.beginPath(); ctx.arc(pos.x,pos.y,3.5,0,Math.PI*2);
        ctx.fillStyle=`hsla(${hue},90%,65%,0.9)`; ctx.fill();
      });

      // ── DC power bus (center line) ──
      ctx.strokeStyle="rgba(200,160,48,0.25)"; ctx.lineWidth=3;
      ctx.setLineDash([8,6]);
      ctx.beginPath(); ctx.moveTo(40,H/2); ctx.lineTo(W-40,H/2); ctx.stroke();
      ctx.setLineDash([]);
      dcNodes.forEach((n,i) => {
        n.v = 0.4+0.4*Math.sin(t*0.06+i*0.9);
        const sz=5+n.v*5;
        ctx.beginPath(); ctx.arc(n.x,n.y,sz,0,Math.PI*2);
        ctx.fillStyle=`rgba(200,160,48,${0.3+n.v*0.4})`; ctx.fill();
        ctx.beginPath(); ctx.arc(n.x,n.y,sz+4,0,Math.PI*2);
        ctx.strokeStyle=`rgba(200,160,48,${0.15+n.v*0.2})`; ctx.lineWidth=1; ctx.stroke();
        // Connect to rack above
        const rIdx=i-1;
        if (rIdx>=0 && rIdx<racks.length) {
          const r=racks[rIdx];
          ctx.strokeStyle=`rgba(200,160,48,0.2)`; ctx.lineWidth=1;
          ctx.setLineDash([3,4]);
          ctx.beginPath(); ctx.moveTo(n.x,n.y); ctx.lineTo(r.x+r.w/2,78); ctx.stroke();
          ctx.setLineDash([]);
        }
      });

      // ── Labels ──
      ctx.textAlign="left"; ctx.fillStyle="rgba(0,200,255,0.6)"; ctx.font=`7.5px ${V.mono}`;
      ctx.fillText("LIQUID COOLING LOOP", 12, H-8);
      ctx.fillStyle="rgba(0,200,255,0.3)"; ctx.font=`6px ${V.mono}`;
      ctx.fillText("Phase-change coolant · DC pump motors · Rack-direct cold plate extraction", 12, H-18);
      ctx.textAlign="right"; ctx.fillStyle="rgba(200,160,48,0.55)"; ctx.font=`7px ${V.mono}`;
      ctx.fillText("DC NATIVE POWER BUS · 48V rail · Powerline data", W-12, H-8);
      ctx.fillStyle="rgba(200,160,48,0.3)"; ctx.font=`6px ${V.mono}`;
      ctx.fillText("No AC conversion loss · Combined energy + networking", W-12, H-18);

      // Temp legend
      const lgx=W*0.78, lgy=28;
      ctx.fillStyle="rgba(255,80,80,0.6)"; ctx.fillRect(lgx,lgy,14,8);
      ctx.fillStyle="rgba(68,200,255,0.6)"; ctx.fillRect(lgx,lgy+10,14,8);
      ctx.fillStyle="rgba(184,204,232,0.4)"; ctx.font=`5.5px ${V.mono}`; ctx.textAlign="left";
      ctx.fillText("Hot (compute exit)", lgx+17, lgy+7);
      ctx.fillText("Cold (radiator return)", lgx+17, lgy+17);

      t++; raf=requestAnimationFrame(draw);
    };
    draw();
    return () => cancelAnimationFrame(raf);
  }, []);
  return <canvas ref={ref} style={{ width:"100%", height:"auto", borderRadius:10, display:"block" }} />;
}

// ── Helpers ────────────────────────────────────────────────────────────────────
function Divider({ col="#00FFB2" }: { col?: string }) {
  return <div style={{ width:"100%", height:1, background:`linear-gradient(90deg,transparent,${col}33,transparent)`, margin:"0" }} />;
}

function Label({ text }: { text: string }) {
  return (
    <div style={{ display:"inline-flex", border:`1px solid ${V.aurora}40`, borderRadius:3, padding:"3px 10px", fontSize:9, letterSpacing:"0.2em", color:V.aurora, fontFamily:V.mono, marginRight:8 }}>
      {text}
    </div>
  );
}

function SectionHead({ title, accent=V.aurora }: { title:string; accent?:string }) {
  return (
    <div style={{ display:"flex", alignItems:"center", gap:12, marginBottom:20 }}>
      <div style={{ width:3, height:24, background:`linear-gradient(180deg,${accent},${V.blue})`, flexShrink:0 }} />
      <h2 style={{ fontFamily:V.display, fontSize:"0.95rem", fontWeight:600, color:"#fff", letterSpacing:4, margin:0 }}>{title}</h2>
    </div>
  );
}

export default function FluidComputerPage() {
  const [activeLayer, setActiveLayer] = useState(0);
  const [adcBits, setAdcBits] = useState(10);

  const adcMax = adcBits === 8 ? 255 : adcBits === 10 ? 1023 : adcBits === 12 ? 4095 : 65535;
  const adcLabel = adcBits === 8 ? "0–255" : adcBits === 10 ? "0–1023" : adcBits === 12 ? "0–4095" : "0–65535";

  const LAYERS = [
    { id:0, num:"1", name:"CAPTURE LAYER", sub:"Environmental Assessment", col:"#00CCFF",
      items:["Ground LiDAR Fields (10–1000 Hz)","Thermal Tracking Arrays","High-Frequency Metrics","Particle, Cloud & Wind Assessment"],
      metric:"LiDAR point cloud · Thermal field · Wind vector field" },
    { id:1, num:"2", name:"NAVIER-STOKES ENGINE", sub:"Predictive Analytics", col:V.aurora,
      items:["Multi-Phase Flow Solver","Navier-Stokes Equations","Turbulence Modeling (LES)","Preview Window T+100ms"],
      metric:"ρ(∂u/∂t + u·∇u) = −∇p + μ∇²u + F   |   ∇·u = 0" },
    { id:2, num:"3", name:"ADAPTIVE CONTROL LOOP", sub:"Choreographic Coordination", col:V.gold,
      items:["Audience-Aware Targeting","Coordinate Matrix Mapping","Perceptual Normalization","Galvanometer Scaling Rules","Closed-Loop Optimization"],
      metric:"Target vectors (x,y,z,t) · Intensity map I(x,y,z,t) · Galvo scaling (X,Y)" },
    { id:3, num:"4", name:"MANIFESTATION SUBSTRATE", sub:"Audio / Optical Intersect", col:"#FF44FF",
      items:["Galvanometer Mirror Control","Acoustic Phase Triggers","Microsecond Synchronization","Shock Front Alignment","Volumetric Rendering"],
      metric:"Galvo angles θ_x,θ_y · Laser power P(t) · Audio phase M(t) · Timestamp (μs)" },
  ];

  const layer = LAYERS[activeLayer];

  return (
    <div style={{ height:"100%", overflowY:"auto", background:V.bg, color:V.text, fontFamily:V.serif }}>

      {/* Badges */}
      <div style={{ padding:"20px 24px 0", display:"flex", gap:8, flexWrap:"wrap" }}>
        {["LIVE SIMULATION","OPEN-AIR FLUID COMPUTER","FACETIME FABRIC ENGINE","AETHER COMPUTE"].map(b => (
          <Label key={b} text={b} />
        ))}
      </div>

      {/* ── Canvas 1: Fluid Computer ── */}
      <div style={{ padding:"14px 24px 0" }}>
        <div style={{ background:"rgba(1,4,9,0.9)", border:`1px solid rgba(0,200,255,0.12)`, borderLeft:`3px solid ${V.cyan}`, borderRadius:10, overflow:"hidden" }}>
          <div style={{ padding:"12px 16px 8px" }}>
            <div style={{ fontFamily:V.mono, fontSize:12, color:V.cyan, letterSpacing:"0.13em" }}>
              OPEN-AIR FLUID COMPUTER · SENSE → PREDICT → DECIDE → ACT → MANIFEST → ∞ REPEAT
            </div>
            <div style={{ fontFamily:V.mono, fontSize:9.5, color:"rgba(0,200,255,0.35)", marginTop:3 }}>
              Capture Layer → Navier-Stokes Engine → Adaptive Control Loop → Manifestation Substrate
            </div>
          </div>
          <FluidComputerCanvas />
        </div>
      </div>

      {/* ── Canvas 2: Plasmodium Bubble ── */}
      <div style={{ padding:"14px 24px 0" }}>
        <div style={{ background:"rgba(1,4,9,0.9)", border:`1px solid rgba(0,200,255,0.1)`, borderLeft:`3px solid ${V.aurora}`, borderRadius:10, overflow:"hidden" }}>
          <div style={{ padding:"12px 16px 8px" }}>
            <div style={{ fontFamily:V.mono, fontSize:12, color:V.aurora, letterSpacing:"0.13em" }}>
              PLASMODIUM PROTOTYPE BUBBLE MODEL · EMERGENT BUBBLE FROM DISTRIBUTED NODE INTERACTIONS
            </div>
            <div style={{ fontFamily:V.mono, fontSize:9.5, color:`${V.aurora}44`, marginTop:3 }}>
              ∂Φ/∂t + F|∇Φ| = 0  ·  Dynamic equilibrium geometry  ·  Physarum polycephalum field physics
            </div>
          </div>
          <PlasmodiumCanvas />
        </div>
      </div>

      {/* ── Canvas 3: Laser Matrix ── */}
      <div style={{ padding:"14px 24px 0" }}>
        <div style={{ background:"rgba(1,4,9,0.9)", border:`1px solid rgba(200,100,255,0.12)`, borderLeft:`3px solid ${V.violet}`, borderRadius:10, overflow:"hidden" }}>
          <div style={{ padding:"12px 16px 8px" }}>
            <div style={{ fontFamily:V.mono, fontSize:12, color:"#CC88FF", letterSpacing:"0.13em" }}>
              LASER MATRIX FIREWORKS · THE SKY IS THE CANVAS · 3D GRID + SMOKE + NODES + MUSIC SYNC
            </div>
            <div style={{ fontFamily:V.mono, fontSize:9.5, color:"rgba(200,100,255,0.35)", marginTop:3 }}>
              128 BPM · Layer 1 Ground → 5 Firework Events · Every explosion placed in 3D space like a node on a grid
            </div>
          </div>
          <LaserMatrixCanvas />
        </div>
      </div>

      {/* ── Canvas 4: Liquid Cooling ── */}
      <div style={{ padding:"14px 24px 0" }}>
        <div style={{ background:"rgba(1,4,9,0.9)", border:`1px solid rgba(200,160,48,0.12)`, borderLeft:`3px solid ${V.gold}`, borderRadius:10, overflow:"hidden" }}>
          <div style={{ padding:"12px 16px 8px" }}>
            <div style={{ fontFamily:V.mono, fontSize:12, color:V.gold, letterSpacing:"0.13em" }}>
              DC-NATIVE SOLAR POWER · LIQUID COOLING LOOP · COMBINED ENERGY + NETWORKING
            </div>
            <div style={{ fontFamily:V.mono, fontSize:9.5, color:`${V.gold}44`, marginTop:3 }}>
              On-site DC generation → 48V bus → GPU rack cooling → phase-change → radiator return · HVAC & plumbing DC motors
            </div>
          </div>
          <LiquidCoolingCanvas />
        </div>
      </div>

      <div style={{ maxWidth:960, margin:"0 auto", padding:"48px 32px" }}>

        {/* ── 4-Layer System ── */}
        <section style={{ marginBottom:52 }}>
          <SectionHead title="1 · FOUR-LAYER SYSTEM · ENGINEERING TOPOLOGY STACK" accent={V.cyan} />
          <div style={{ display:"flex", gap:4, marginBottom:16 }}>
            {LAYERS.map(l => (
              <button key={l.id} onClick={() => setActiveLayer(l.id)}
                style={{ flex:1, padding:"8px 6px", border:`1px solid ${l.id===activeLayer ? l.col : V.dim+"44"}`,
                  background: l.id===activeLayer ? `${l.col}12` : "rgba(3,6,14,0.6)",
                  color: l.id===activeLayer ? l.col : V.dim+"88", fontFamily:V.mono, fontSize:"0.5rem",
                  letterSpacing:2, cursor:"pointer", borderRadius:4 }}>
                {l.num} {l.name}
              </button>
            ))}
          </div>
          <div style={{ background:"rgba(3,6,14,0.8)", border:`1px solid ${layer.col}22`, borderRadius:10, padding:"20px 24px" }}>
            <div style={{ fontFamily:V.mono, fontSize:"0.6rem", color:layer.col, letterSpacing:3, marginBottom:10 }}>{layer.sub}</div>
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:16 }}>
              <div>
                <ul style={{ margin:0, padding:0, listStyle:"none" }}>
                  {layer.items.map(it => (
                    <li key={it} style={{ padding:"4px 0", borderBottom:"1px solid rgba(255,255,255,0.04)", fontFamily:V.serif, fontSize:"0.88rem", lineHeight:1.7, color:`rgba(184,204,232,0.75)` }}>
                      <span style={{ color:layer.col, marginRight:6 }}>›</span>{it}
                    </li>
                  ))}
                </ul>
              </div>
              <div style={{ background:`${layer.col}07`, border:`1px solid ${layer.col}18`, borderRadius:8, padding:"14px 16px" }}>
                <div style={{ fontFamily:V.mono, fontSize:"0.48rem", color:V.dim, letterSpacing:3, marginBottom:8 }}>SOLVED PARAMETERS / OUTPUT</div>
                <div style={{ fontFamily:V.mono, fontSize:"0.62rem", color:layer.col+"99", lineHeight:2 }}>{layer.metric}</div>
              </div>
            </div>
          </div>
        </section>

        <Divider />

        {/* ── DC Solar Native ── */}
        <section style={{ marginBottom:52, marginTop:40 }}>
          <SectionHead title="2 · DC-NATIVE SOLAR · ENERGY + NETWORKING + HVAC + PLUMBING" accent={V.gold} />
          <p style={{ fontSize:"0.97rem", lineHeight:1.9, color:`rgba(184,204,232,0.75)`, marginBottom:20 }}>
            On-site solar generation is <strong style={{ color:V.gold, fontWeight:400 }}>DC-native</strong> — eliminating the AC conversion stage entirely. The same DC power rail becomes the data network (powerline communication), the cooling pump drive, the HVAC variable-speed motor, and the plumbing system actuator. Energy and information travel on the same wire. This is a new class of technology: <strong style={{ color:V.aurora, fontWeight:400 }}>unified field infrastructure</strong> — combining the four dimensions of reality (electricity · data · thermal · fluid) into a single coherent DC backbone.
          </p>
          <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:10 }}>
            {[
              { dim:"⚡ ELECTRICITY", col:V.gold, lines:["48V DC bus — no inverter","Powerline carrier wave","Zero AC conversion loss","PV → MPPT → Bus direct"] },
              { dim:"📡 NETWORKING", col:V.blue, lines:["Data on DC power rail","G.hn / HomePlug AV2","1 Gbps over 48V line","One wire: power + comms"] },
              { dim:"❄️ THERMAL/HVAC", col:V.cyan, lines:["DC variable-speed drives","Brushless pump motors","Phase-change cold plate","Smart valve actuation"] },
              { dim:"💧 PLUMBING", col:V.aurora, lines:["DC pump arrays","Fluid sensing nodes","Flow rate DAC control","Automated water routing"] },
            ].map(d => (
              <div key={d.dim} style={{ background:`${d.col}08`, border:`1px solid ${d.col}20`, borderRadius:8, padding:"14px 14px" }}>
                <div style={{ fontFamily:V.mono, fontSize:"0.52rem", color:d.col, letterSpacing:2, marginBottom:8 }}>{d.dim}</div>
                {d.lines.map(l => (
                  <div key={l} style={{ fontFamily:V.mono, fontSize:"0.48rem", color:`rgba(184,204,232,0.5)`, borderBottom:"1px solid rgba(255,255,255,0.04)", padding:"3px 0", lineHeight:1.6 }}>{l}</div>
                ))}
              </div>
            ))}
          </div>
        </section>

        <Divider />

        {/* ── 16-bit / 38-pin Hardware ── */}
        <section style={{ marginBottom:52, marginTop:40 }}>
          <SectionHead title="3 · 16-BIT / 38-PIN QUANTIZED CUBIC COMPUTE SPECIFICATION" accent={V.violet} />
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:24 }}>
            <div>
              <p style={{ fontSize:"0.97rem", lineHeight:1.9, color:`rgba(184,204,232,0.75)`, marginBottom:16 }}>
                The fluid computer hardware interface operates on a <strong style={{ color:V.violet, fontWeight:400 }}>38-pin connector</strong> — 6 pins dedicated to GPU power rails, the remainder to ADC/DAC signal I/O. Resolution is selectable from 8-bit (256 levels, 0–255) through 10-bit (1024 levels, 0–1023) to 16-bit (65536 levels). The 10-bit advanced ADC maps physical field measurements (Navier-Stokes velocity fields, LiDAR intensity, thermal gradient) into quantized cubic computation steps.
              </p>
              {/* ADC bit selector */}
              <div style={{ background:"rgba(153,102,255,0.05)", border:`1px solid ${V.violet}22`, borderRadius:8, padding:"16px 18px" }}>
                <div style={{ fontFamily:V.mono, fontSize:"0.5rem", color:V.dim, letterSpacing:3, marginBottom:10 }}>ADC RESOLUTION SELECTOR</div>
                <div style={{ display:"flex", gap:8, marginBottom:14 }}>
                  {[8,10,12,16].map(b => (
                    <button key={b} onClick={() => setAdcBits(b)}
                      style={{ padding:"5px 12px", borderRadius:4, border:`1px solid ${b===adcBits ? V.violet : V.dim+"44"}`,
                        background: b===adcBits ? `${V.violet}18` : "transparent",
                        color: b===adcBits ? V.violet : V.dim, fontFamily:V.mono, fontSize:"0.52rem", cursor:"pointer" }}>
                      {b}-bit
                    </button>
                  ))}
                </div>
                <div style={{ fontFamily:V.mono, fontSize:"0.6rem", color:V.violet, marginBottom:4 }}>Range: {adcLabel}</div>
                <div style={{ height:6, background:"rgba(255,255,255,0.05)", borderRadius:3, marginBottom:8 }}>
                  <div style={{ height:"100%", width:`${Math.log2(adcMax+1)/16*100}%`, background:`linear-gradient(90deg,${V.violet},${V.blue})`, borderRadius:3 }} />
                </div>
                <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:6, fontSize:"0.48rem", fontFamily:V.mono }}>
                  <div style={{ color:V.dim }}>Levels: <span style={{ color:V.violet }}>{adcMax+1}</span></div>
                  <div style={{ color:V.dim }}>Voltage per step: <span style={{ color:V.violet }}>{(3.3/(adcMax+1)*1000).toFixed(2)} mV</span></div>
                  <div style={{ color:V.dim }}>SNR: <span style={{ color:V.violet }}>{(6.02*adcBits+1.76).toFixed(1)} dB</span></div>
                  <div style={{ color:V.dim }}>Cubic: <span style={{ color:V.violet }}>{Math.round((adcMax+1)**0.333)} ³ steps</span></div>
                </div>
              </div>
            </div>
            <div>
              {/* 38-pin connector diagram */}
              <div style={{ background:"rgba(3,6,14,0.8)", border:`1px solid ${V.dim}33`, borderRadius:8, padding:"16px 18px" }}>
                <div style={{ fontFamily:V.mono, fontSize:"0.5rem", color:V.dim, letterSpacing:3, marginBottom:12 }}>38-PIN CONNECTOR LAYOUT</div>
                <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:3 }}>
                  {Array.from({length:38},(_,i)=>{
                    const pin=i+1;
                    const isGPU=pin<=6;
                    const isGND=pin===7||pin===8||pin===37||pin===38;
                    const isADC=pin>=9&&pin<=24;
                    const isDAC=pin>=25&&pin<=36;
                    const col=isGPU?V.amb:isGND?V.dim:isADC?V.blue:isDAC?V.aurora:V.violet;
                    const label=isGPU?`GPU PWR ${pin}`:isGND?`GND ${pin}`:isADC?`ADC-${pin-8}`:isDAC?`DAC-${pin-24}`:`SPI-${pin}`;
                    return (
                      <div key={pin} style={{ display:"flex", gap:5, alignItems:"center" }}>
                        <div style={{ width:12,height:12,borderRadius:"50%",background:`${col}33`,border:`1px solid ${col}55`,flexShrink:0,display:"flex",alignItems:"center",justifyContent:"center",fontFamily:V.mono,fontSize:"0.35rem",color:col }}>{pin}</div>
                        <div style={{ fontFamily:V.mono, fontSize:"0.42rem", color:col+"88" }}>{label}</div>
                      </div>
                    );
                  })}
                </div>
                <div style={{ marginTop:10, display:"flex", gap:10, flexWrap:"wrap" }}>
                  {[{col:V.amb,label:"GPU PWR ×6"},{col:V.blue,label:"ADC ×16"},{col:V.aurora,label:"DAC ×12"},{col:V.dim,label:"GND ×4"}].map(d=>(
                    <div key={d.label} style={{ display:"flex",alignItems:"center",gap:4 }}>
                      <div style={{ width:8,height:8,borderRadius:"50%",background:d.col }}/>
                      <span style={{ fontFamily:V.mono,fontSize:"0.45rem",color:d.col+"88" }}>{d.label}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        <Divider />

        {/* ── Reference images ── */}
        <section style={{ marginBottom:52, marginTop:40 }}>
          <SectionHead title="4 · SYSTEM REFERENCE · ENGINEERING TOPOLOGY STACK" accent={V.aurora} />
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:16, marginBottom:16 }}>
            <div style={{ borderRadius:8, overflow:"hidden", border:`1px solid ${V.cyan}18` }}>
              <img src={img1} alt="Open-Air Fluid Computer" style={{ width:"100%", display:"block" }} />
              <div style={{ fontFamily:V.mono, fontSize:"0.48rem", color:`${V.cyan}55`, padding:"8px 12px" }}>Open-Air Fluid Computer · 4-Layer System</div>
            </div>
            <div style={{ borderRadius:8, overflow:"hidden", border:`1px solid ${V.aurora}18` }}>
              <img src={img2} alt="Engineering Topology Stack" style={{ width:"100%", display:"block" }} />
              <div style={{ fontFamily:V.mono, fontSize:"0.48rem", color:`${V.aurora}55`, padding:"8px 12px" }}>Engineering Topology Stack · Navier-Stokes → Manifestation</div>
            </div>
          </div>
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:16 }}>
            <div style={{ borderRadius:8, overflow:"hidden", border:`1px solid ${V.violet}18` }}>
              <img src={img3} alt="Laser Matrix Fireworks" style={{ width:"100%", display:"block" }} />
              <div style={{ fontFamily:V.mono, fontSize:"0.48rem", color:`${V.violet}55`, padding:"8px 12px" }}>Laser Matrix Fireworks · Living Matrix</div>
            </div>
            <div style={{ borderRadius:8, overflow:"hidden", border:`1px solid ${V.gold}18` }}>
              <img src={img4} alt="Emergent Bubble Structures" style={{ width:"100%", display:"block" }} />
              <div style={{ fontFamily:V.mono, fontSize:"0.48rem", color:`${V.gold}55`, padding:"8px 12px" }}>Emergent Bubble Structures · Plasmodium</div>
            </div>
            <div style={{ borderRadius:8, overflow:"hidden", border:`1px solid ${V.aurora}18` }}>
              <img src={img5} alt="Plasmodium Bubble Model" style={{ width:"100%", display:"block" }} />
              <div style={{ fontFamily:V.mono, fontSize:"0.48rem", color:`${V.aurora}55`, padding:"8px 12px" }}>Plasmodium Prototype · Field Equilibrium</div>
            </div>
          </div>
        </section>

        <Divider />

        {/* ── Quote ── */}
        <section style={{ marginTop:40, textAlign:"center" }}>
          <div style={{ background:"rgba(0,255,178,0.02)", border:`1px solid ${V.aurora}12`, borderRadius:12, padding:"28px 32px" }}>
            <blockquote style={{ fontFamily:V.display, fontSize:"1.35rem", fontStyle:"italic", color:`rgba(0,255,178,0.7)`, margin:0, letterSpacing:2 }}>
              "By shifting the paradigm of containment from static material walls to dynamic equilibrium geometries, emerges a versatile model that elegantly bridges the gap between biological behavior and field physics."
            </blockquote>
            <div style={{ fontFamily:V.mono, fontSize:"0.52rem", color:V.dim, marginTop:12, letterSpacing:3 }}>
              ∂Φ/∂t + F|∇Φ| = 0 · Physarum polycephalum · AETHER FABRIC ENGINE · SHIA M / @StrategicProce
            </div>
          </div>
        </section>

      </div>

      <div style={{ borderTop:`1px solid rgba(0,200,255,0.07)`, padding:"40px 32px", textAlign:"center" }}>
        <div style={{ fontFamily:V.display, fontSize:"1.5rem", fontWeight:900, letterSpacing:10, color:"rgba(0,200,255,0.1)" }}>AETHER</div>
        <div style={{ fontFamily:V.mono, fontSize:"0.44rem", color:V.dim, letterSpacing:3, lineHeight:2.4, marginTop:4 }}>
          Open-Air Fluid Computer · FaceTime Fabric Manipulation Engine · Plasmodium Bubble Model<br />
          Navier-Stokes · ∂Φ/∂t + F|∇Φ| = 0 · DC-Native Solar · Liquid Cooling · 16-bit ADC · 38-pin GPU<br />
          SENSE → PREDICT → DECIDE → ACT → MANIFEST → ∞ REPEAT
        </div>
      </div>
    </div>
  );
}
