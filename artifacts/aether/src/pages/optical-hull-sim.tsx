import { useEffect, useRef, useState } from "react";

/* ── palette ──────────────────────────────────── */
const BG   = "#02030a";
const MN   = "'Space Mono',monospace";
const OR   = "'Orbitron',sans-serif";
const DIM  = "#2a3550";

/* ── plate mode definitions ───────────────────── */
const MODES = [
  { name:"Beam Receive",  short:"RECV", col:"#3b82f6", glow:"#3b82f6", desc:"Captures EM / photovoltaic harvest" },
  { name:"Beam Steer",    short:"STEER",col:"#f59e0b", glow:"#f59e0b", desc:"Phase-conjugate beam redirection" },
  { name:"Thermal Emit",  short:"THERM",col:"#ef4444", glow:"#ef4444", desc:"Selective IR emission · heat balance" },
  { name:"Stealth / Absorb",short:"BLCK",col:"#1e2a3a", glow:"#0a1020",desc:"Broadband absorption · EM blackout" },
  { name:"LIDAR / Sense", short:"LIDAR",col:"#10b981", glow:"#10b981", desc:"Active ranging · environment map" },
  { name:"Comms",         short:"COMMS",col:"#a78bfa", glow:"#a78bfa", desc:"Directional optical link · tight-beam" },
] as const;

/* ── global hull modes ── */
type HullMode = "NOMINAL"|"STEALTH"|"BEAM"|"THERMAL"|"COMMS"|"SCAN";
const HULL_MODES: { key: HullMode; col: string; dist: number[] }[] = [
  { key:"NOMINAL",  col:"#1fd4c8", dist:[0.28,0.22,0.18,0.10,0.12,0.10] },
  { key:"STEALTH",  col:"#64748b", dist:[0.02,0.02,0.04,0.86,0.04,0.02] },
  { key:"BEAM",     col:"#f59e0b", dist:[0.40,0.38,0.10,0.04,0.05,0.03] },
  { key:"THERMAL",  col:"#ef4444", dist:[0.08,0.08,0.54,0.10,0.12,0.08] },
  { key:"COMMS",    col:"#a78bfa", dist:[0.06,0.14,0.06,0.06,0.08,0.60] },
  { key:"SCAN",     col:"#10b981", dist:[0.07,0.08,0.06,0.06,0.60,0.13] },
];

/* ── scale levels ─────────────────────────────── */
const SCALES = [
  { level:"Atomic",               size:"~0.2 nm",     col:"#60a5fa", n:0  },
  { level:"Nanostructure",        size:"100–300 nm",   col:"#34d399", n:1  },
  { level:"Metasurface",          size:"0.5–5 μm",    col:"#a78bfa", n:2  },
  { level:"Ommatidium Lens",      size:"10–50 μm",    col:"#fbbf24", n:3  },
  { level:"Waveguide Core",       size:"5–20 μm",     col:"#34d399", n:4  },
  { level:"Artif. Ommatidium",    size:"20–100 μm",   col:"#f97316", n:5  },
  { level:"Compound-Eye Cluster", size:"1–10 mm",     col:"#ef4444", n:6  },
  { level:"Full Compound Eye",    size:"1–20 cm",     col:"#ec4899", n:7  },
  { level:"Laser Aperture Array", size:"10 cm–10 m",  col:"#f43f5e", n:8  },
  { level:"Directed Energy",      size:"1–100 m",     col:"#a78bfa", n:9  },
  { level:"Orbital Array",        size:"100 m–10 km", col:"#818cf8", n:10 },
  { level:"Interplanetary Beamer",size:"10–1000 km",  col:"#c4b5fd", n:11 },
];

function ha(hex: string, a: number) {
  return hex + Math.round(a * 255).toString(16).padStart(2, "0");
}
function lerp(a: number, b: number, t: number) { return a + (b - a) * t; }
function lerpHex(h1: string, h2: string, t: number) {
  const c1 = [parseInt(h1.slice(1,3),16),parseInt(h1.slice(3,5),16),parseInt(h1.slice(5,7),16)];
  const c2 = [parseInt(h2.slice(1,3),16),parseInt(h2.slice(3,5),16),parseInt(h2.slice(5,7),16)];
  return `#${c1.map((v,i)=>Math.round(lerp(v,c2[i],t)).toString(16).padStart(2,"0")).join("")}`;
}

/* ── Plate type ── */
type Plate = {
  cx: number; cy: number;
  mode: number; target: number;
  progress: number; delay: number;
  brightness: number;
};

/* ══════════════════════════════════════════════════
   CANVAS 1 — OPTICAL HULL
══════════════════════════════════════════════════ */
function HullCanvas({ modeRef }: { modeRef: React.MutableRefObject<HullMode> }) {
  const ref = useRef<HTMLCanvasElement>(null);
  const raf = useRef(0);

  useEffect(() => {
    const canvas = ref.current; if (!canvas) return;
    const ctx = canvas.getContext("2d")!;
    const W = canvas.width, H = canvas.height;

    // Build hex grid (flat-top, R=22)
    const R = 22;
    const xStep = R * 1.5;
    const yStep = R * Math.sqrt(3);
    const plates: Plate[] = [];

    const COLS = Math.ceil(W / xStep) + 2;
    const ROWS = Math.ceil(H / yStep) + 2;

    for (let col = 0; col < COLS; col++) {
      for (let row = 0; row < ROWS; row++) {
        const cx = col * xStep - R * 0.5;
        const cy = row * yStep + (col % 2) * yStep * 0.5 - yStep * 0.5;
        if (cx < -R || cx > W + R || cy < -R || cy > H + R) continue;
        const m = Math.floor(Math.random() * 6);
        plates.push({ cx, cy, mode: m, target: m, progress: 1, delay: 0, brightness: 0.5 + Math.random() * 0.5 });
      }
    }

    // Stars background (pre-render)
    const stars: [number,number,number][] = Array.from({length:120}, () =>
      [Math.random()*W, Math.random()*H, Math.random()]);

    let t = 0;
    let lastMode: HullMode = "NOMINAL";
    let beams: { x1:number,y1:number,x2:number,y2:number,life:number,col:string }[] = [];
    let signals: { x:number,y:number,r:number,col:string }[] = [];

    function drawHex(cx: number, cy: number, r: number) {
      ctx.beginPath();
      for (let i = 0; i < 6; i++) {
        const a = (Math.PI / 3) * i;
        const x = cx + r * Math.cos(a), y = cy + r * Math.sin(a);
        if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
      }
      ctx.closePath();
    }

    function reassignTargets(key: HullMode) {
      const hm = HULL_MODES.find(m => m.key === key)!;
      const dist = hm.dist;
      const cumul = dist.reduce((acc, v, i) => [...acc, (acc[i-1]??0)+v], [] as number[]);
      plates.forEach((p, pi) => {
        const r = Math.random();
        let t2 = 0;
        for (let i = 0; i < 6; i++) { if (r < cumul[i]) { t2 = i; break; } }
        p.target = t2;
        p.progress = 0;
        p.delay = Math.floor(Math.random() * 90 + pi % 30);
      });
    }

    reassignTargets("NOMINAL");

    function frame() {
      t++;

      // Mode change detection
      const curMode = modeRef.current;
      if (curMode !== lastMode) {
        lastMode = curMode;
        reassignTargets(curMode);
      }

      // Advance plate transitions
      plates.forEach(p => {
        if (p.delay > 0) { p.delay--; return; }
        if (p.progress < 1) {
          p.progress = Math.min(1, p.progress + 0.025);
          if (p.progress >= 1) p.mode = p.target;
        }
        p.brightness = 0.55 + 0.45 * Math.abs(Math.sin(t * 0.02 + p.cx * 0.01));
      });

      // Spawn beam lines from gold plates
      if (t % 18 === 0) {
        const gold = plates.filter(p => (p.progress < 1 ? p.target : p.mode) === 1);
        if (gold.length > 0) {
          const src = gold[Math.floor(Math.random() * gold.length)];
          const tgt = plates[Math.floor(Math.random() * plates.length)];
          beams.push({ x1:src.cx, y1:src.cy, x2:tgt.cx, y2:tgt.cy, life:40, col:"#f59e0b" });
        }
      }
      // Purple comms bursts
      if (t % 30 === 0) {
        const purp = plates.filter(p => (p.progress < 1 ? p.target : p.mode) === 5);
        if (purp.length > 0) {
          const src = purp[Math.floor(Math.random() * purp.length)];
          signals.push({ x:src.cx, y:src.cy, r:0, col:"#a78bfa" });
        }
      }
      beams  = beams.filter(b => b.life-- > 0);
      signals = signals.filter(s => (s.r += 2.5) < 90);

      // ── Draw ──
      ctx.fillStyle = "#010309";
      ctx.fillRect(0, 0, W, H);

      // Stars
      stars.forEach(([sx, sy, sv]) => {
        ctx.fillStyle = `rgba(160,200,255,${0.2 + sv * 0.4})`;
        ctx.fillRect(sx, sy, sv < 0.5 ? 1 : 1.5, sv < 0.5 ? 1 : 1.5);
      });

      // Hull plates
      plates.forEach(p => {
        const displayMode = p.progress < 1 ? p.mode : p.mode;
        const m1 = MODES[p.mode], m2 = MODES[p.target];
        const col = p.progress < 1 ? lerpHex(m1.col, m2.col, p.progress) : m1.col;
        const glow = p.progress < 1 ? lerpHex(m1.glow, m2.glow, p.progress) : m1.glow;
        const bri = p.brightness;
        const activating = p.progress < 1;

        // Gap border
        drawHex(p.cx, p.cy, R - 1.5);
        ctx.fillStyle = "#010309";
        ctx.fill();

        // Plate fill
        drawHex(p.cx, p.cy, R - 3);
        const alpha = 0.12 + bri * 0.20;
        ctx.fillStyle = ha(col, alpha);
        if (glow !== "#0a1020") {
          ctx.shadowColor = glow;
          ctx.shadowBlur  = activating ? 14 : 5 + bri * 9;
        }
        ctx.fill();
        ctx.shadowBlur = 0;

        // Edge highlight
        ctx.strokeStyle = ha(col, 0.30 + bri * 0.35);
        ctx.lineWidth   = 0.8 + (activating ? 1.2 : 0);
        ctx.stroke();

        // Mode indicator dot
        ctx.beginPath();
        ctx.arc(p.cx, p.cy, 3.5, 0, Math.PI * 2);
        ctx.fillStyle = ha(col, 0.60 + bri * 0.35);
        ctx.fill();
      });

      // Beam lines
      beams.forEach(b => {
        const a = b.life / 40;
        ctx.save();
        ctx.strokeStyle = ha(b.col, a * 0.7);
        ctx.lineWidth   = 1.5 * a;
        ctx.shadowColor = b.col; ctx.shadowBlur = 8 * a;
        ctx.beginPath(); ctx.moveTo(b.x1, b.y1); ctx.lineTo(b.x2, b.y2); ctx.stroke();
        ctx.shadowBlur = 0; ctx.restore();
      });

      // Comms signals
      signals.forEach(s => {
        const a = 1 - s.r / 90;
        ctx.strokeStyle = ha(s.col, a * 0.55);
        ctx.lineWidth   = 1.5 * a;
        ctx.shadowColor = s.col; ctx.shadowBlur = 8 * a;
        ctx.beginPath(); ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2); ctx.stroke();
        ctx.shadowBlur = 0;
      });

      // AI Controller HUD (top-right)
      const hudX = W - 210, hudY = 14;
      ctx.fillStyle = "rgba(1,3,10,0.75)";
      ctx.fillRect(hudX, hudY, 196, 100);
      ctx.strokeStyle = ha(HULL_MODES.find(m=>m.key===curMode)!.col, 0.4);
      ctx.lineWidth = 1; ctx.strokeRect(hudX, hudY, 196, 100);
      ctx.fillStyle = HULL_MODES.find(m=>m.key===curMode)!.col;
      ctx.font = `bold 11px ${OR}`; ctx.textAlign = "left";
      ctx.fillText("AI CONTROLLER", hudX+10, hudY+18);
      ctx.font = `10px ${MN}`;
      ctx.fillStyle = "rgba(180,210,240,0.6)";
      ctx.fillText(`mode:  ${curMode}`, hudX+10, hudY+36);
      ctx.fillText(`plates: ${plates.length}`, hudX+10, hudY+50);
      const trans = plates.filter(p=>p.progress<1).length;
      ctx.fillStyle = trans > 0 ? "#fbbf24" : "#22c55e";
      ctx.fillText(`switching: ${trans}`, hudX+10, hudY+64);
      ctx.fillStyle = "rgba(180,210,240,0.45)";
      ctx.fillText(`t = ${t.toString().padStart(6,"0")}`, hudX+10, hudY+80);
      const modeBar = Math.min(196, (t % 300) / 300 * 196);
      ctx.fillStyle = ha(HULL_MODES.find(m=>m.key===curMode)!.col, 0.25);
      ctx.fillRect(hudX, hudY+96, modeBar, 4);

      // LIDAR sweep (green plates active)
      if (curMode === "SCAN" || curMode === "NOMINAL") {
        const sweepAngle = (t * 0.03) % (Math.PI * 2);
        ctx.save();
        ctx.strokeStyle = ha("#10b981", 0.15);
        ctx.lineWidth = 1.5;
        const sweepLen = 200;
        ctx.beginPath();
        ctx.moveTo(W * 0.5, H * 0.5);
        ctx.lineTo(W * 0.5 + Math.cos(sweepAngle) * sweepLen, H * 0.5 + Math.sin(sweepAngle) * sweepLen);
        ctx.stroke();
        ctx.restore();
      }

      // Status bar (bottom)
      ctx.fillStyle = "rgba(1,3,10,0.72)";
      ctx.fillRect(0, H - 26, W, 26);
      ctx.strokeStyle = ha("#1fd4c8", 0.12);
      ctx.lineWidth = 1;
      ctx.beginPath(); ctx.moveTo(0, H-26); ctx.lineTo(W, H-26); ctx.stroke();

      const modesCount = [0,1,2,3,4,5].map(m => plates.filter(p=>p.mode===m).length);
      let bx = 12;
      MODES.forEach((md, i) => {
        ctx.fillStyle = ha(md.col, 0.75);
        ctx.font = `10px ${MN}`; ctx.textAlign = "left";
        ctx.fillText(`${md.short}: ${modesCount[i]}`, bx, H - 9);
        bx += 90;
      });

      raf.current = requestAnimationFrame(frame);
    }

    frame();
    return () => cancelAnimationFrame(raf.current);
  }, []);

  return (
    <canvas ref={ref} width={1100} height={500}
      style={{ width: "100%", height: "auto", display: "block", borderRadius: 6 }} />
  );
}

/* ══════════════════════════════════════════════════
   CANVAS 2 — SCALE HIERARCHY
══════════════════════════════════════════════════ */
function ScaleCanvas() {
  const ref = useRef<HTMLCanvasElement>(null);
  const raf = useRef(0);

  useEffect(() => {
    const canvas = ref.current; if (!canvas) return;
    const ctx = canvas.getContext("2d")!;
    const W = canvas.width, H = canvas.height;
    let t = 0;

    // Log-scale ruler constants
    // 0.2nm = 0.2e-9 → log10 = -9.7
    // 10,000km = 1e10m → log10 = 10
    const LOG_MIN = -10, LOG_MAX = 10;
    const PANEL_W = 260, PANEL_H = 95;
    const COLS = 4, ROWS = 3;
    const PAD_X = (W - COLS * PANEL_W) / (COLS + 1);
    const PAD_Y = 14;

    // Characteristic log values for each level
    const SCALE_LOG = [-9.7, -7.5, -6.3, -5, -5.3, -4.7, -3, -1.5, -0.5, 1, 3, 5];

    function drawLevel(n: number, x: number, y: number, pw: number, ph: number, active: boolean) {
      const sc = SCALES[n];
      const pulse = 0.5 + 0.5 * Math.sin(t * 0.04 + n * 0.6);
      const col = sc.col;

      // Panel bg
      ctx.fillStyle = active ? ha(col, 0.10) : ha(col, 0.04);
      ctx.strokeStyle = active ? ha(col, 0.55) : ha(col, 0.18);
      ctx.lineWidth = active ? 1.5 : 1;
      ctx.beginPath(); ctx.roundRect(x, y, pw, ph, 5); ctx.fill(); ctx.stroke();

      // Left accent
      ctx.fillStyle = ha(col, active ? 0.8 : 0.3);
      ctx.fillRect(x, y, 4, ph);

      // Characteristic illustration in upper area
      const ix = x + 14, iy = y + 8, iw = pw - 28, ih = ph - 32;
      const icx = ix + iw / 2, icy = iy + ih / 2;

      ctx.save();
      ctx.beginPath(); ctx.rect(ix, iy, iw, ih);
      ctx.clip();

      if (n === 0) {
        // Atomic: crystal lattice dots
        const sp = 10;
        ctx.fillStyle = ha(col, 0.55 + pulse * 0.35);
        for (let dx = 0; dx < iw; dx += sp)
          for (let dy = 0; dy < ih; dy += sp) {
            ctx.beginPath(); ctx.arc(ix+dx+sp/2, iy+dy+sp/2, 2, 0, Math.PI*2); ctx.fill();
          }
      } else if (n === 1) {
        // Nanostructure: moth-eye pillars
        const sp = 8;
        for (let dx = 0; dx < iw; dx += sp) {
          const ph2 = ih * (0.4 + 0.3 * Math.sin(t*0.05 + dx * 0.3));
          ctx.fillStyle = ha(col, 0.35 + pulse * 0.3);
          ctx.fillRect(ix + dx + 1, iy + ih - ph2, sp - 2, ph2);
          ctx.fillStyle = ha(col, 0.7);
          ctx.beginPath(); ctx.ellipse(ix+dx+sp/2, iy+ih-ph2, sp*0.4, 2.5, 0, 0, Math.PI*2); ctx.fill();
        }
      } else if (n === 2) {
        // Metasurface: resonator grid
        const sp = 11;
        for (let dx = 0; dx < iw; dx += sp)
          for (let dy = 0; dy < ih; dy += sp) {
            ctx.strokeStyle = ha(col, 0.4 + pulse * 0.3); ctx.lineWidth = 0.8;
            ctx.strokeRect(ix+dx+1.5, iy+dy+1.5, sp-3, sp-3);
            ctx.strokeStyle = ha(col, 0.6);
            ctx.beginPath(); ctx.moveTo(ix+dx+sp/2,iy+dy+2.5); ctx.lineTo(ix+dx+sp/2,iy+dy+sp-2.5); ctx.stroke();
            ctx.beginPath(); ctx.moveTo(ix+dx+2.5,iy+dy+sp/2); ctx.lineTo(ix+dx+sp-2.5,iy+dy+sp/2); ctx.stroke();
          }
      } else if (n === 3) {
        // Ommatidium: concentric lens rings
        ctx.strokeStyle = ha(col, 0.6 + pulse * 0.3); ctx.lineWidth = 1.2;
        for (let r = 4; r < ih * 0.6; r += 5) {
          ctx.beginPath(); ctx.arc(icx, icy, r, 0, Math.PI*2); ctx.stroke();
        }
        ctx.fillStyle = ha(col, 0.7); ctx.beginPath(); ctx.arc(icx, icy, 3, 0, Math.PI*2); ctx.fill();
      } else if (n === 4) {
        // Waveguide: parallel channels
        const nch = 6;
        for (let i = 0; i < nch; i++) {
          const cy2 = iy + (ih/(nch+1))*(i+1);
          const light = 0.4 + 0.5 * Math.sin(t*0.06 + i*0.8);
          ctx.fillStyle = ha(col, light);
          ctx.fillRect(ix, cy2-2, iw, 4);
          // Light pulse dot
          const px = ix + ((t*2 + i*30) % iw);
          ctx.fillStyle = ha(col, 0.9); ctx.shadowColor = col; ctx.shadowBlur = 6;
          ctx.beginPath(); ctx.arc(px, cy2, 2.5, 0, Math.PI*2); ctx.fill(); ctx.shadowBlur = 0;
        }
      } else if (n === 5) {
        // Artificial ommatidium: hex cell
        const hR = Math.min(iw, ih) * 0.38;
        for (let i = 0; i < 6; i++) {
          const ang = (Math.PI/3)*i;
          const hx = icx + hR * Math.cos(ang), hy = icy + hR * Math.sin(ang);
          ctx.strokeStyle = ha(col, 0.4 + pulse*0.3); ctx.lineWidth=0.9;
          ctx.beginPath(); ctx.moveTo(icx,icy); ctx.lineTo(hx,hy); ctx.stroke();
          ctx.fillStyle = ha(col, 0.55); ctx.beginPath(); ctx.arc(hx,hy,4,0,Math.PI*2); ctx.fill();
        }
        ctx.strokeStyle = ha(col, 0.7); ctx.lineWidth = 1.5;
        for (let r2 = 3; r2 <= hR*0.6; r2+=4) {
          ctx.beginPath(); ctx.arc(icx,icy,r2,0,Math.PI*2); ctx.stroke();
        }
      } else if (n === 6) {
        // Compound-eye cluster: hex array
        const hR2 = 9, sep = 20;
        const offsets: [number,number][] = [[0,0],[sep,0],[-sep,0],[sep/2,-sep*0.86],[-sep/2,-sep*0.86],[sep/2,sep*0.86],[-sep/2,sep*0.86]];
        offsets.forEach(([ox,oy]) => {
          const hx = icx+ox, hy = icy+oy;
          ctx.strokeStyle = ha(col, 0.5 + pulse*0.3); ctx.lineWidth = 1;
          ctx.beginPath();
          for(let i=0;i<6;i++){const a=(Math.PI/3)*i;const nx=hx+hR2*Math.cos(a),ny=hy+hR2*Math.sin(a);if(i===0)ctx.moveTo(nx,ny);else ctx.lineTo(nx,ny);}
          ctx.closePath(); ctx.stroke();
          ctx.beginPath(); ctx.arc(hx,hy,2.5,0,Math.PI*2); ctx.fillStyle=ha(col,0.6); ctx.fill();
        });
      } else if (n === 7) {
        // Full compound eye: curved hemisphere silhouette
        ctx.strokeStyle = ha(col, 0.5 + pulse*0.25); ctx.lineWidth = 1.5;
        ctx.beginPath(); ctx.arc(icx, icy+8, ih*0.5, -Math.PI, 0); ctx.stroke();
        // hex facets on surface
        for (let i = -3; i <= 3; i++) {
          const ang = i * 0.25;
          const sr = ih * 0.5;
          const fx = icx + sr * Math.sin(ang), fy = icy + 8 - sr * Math.cos(ang);
          ctx.fillStyle = ha(col, 0.35); ctx.beginPath(); ctx.arc(fx,fy,4,0,Math.PI*2); ctx.fill();
        }
      } else if (n === 8) {
        // Laser aperture array: multiple rings
        const rs = [6, 14, 22, 30];
        rs.forEach(r2 => {
          ctx.strokeStyle = ha(col, 0.4 + pulse*0.4); ctx.lineWidth = r2 < 15 ? 2.5 : 1.5;
          ctx.beginPath(); ctx.arc(icx, icy, r2, 0, Math.PI*2); ctx.stroke();
          // rotating phasors
          const pa = t * 0.04 + r2 * 0.1;
          ctx.fillStyle = ha(col, 0.7);
          ctx.beginPath(); ctx.arc(icx+r2*Math.cos(pa), icy+r2*Math.sin(pa), 2.5, 0, Math.PI*2); ctx.fill();
        });
      } else if (n === 9) {
        // Directed energy: platform + beam
        ctx.fillStyle = ha(col, 0.25); ctx.fillRect(icx-iw*0.4, icy, iw*0.8, ih*0.35);
        ctx.strokeStyle = ha(col, 0.5); ctx.lineWidth = 1;
        ctx.strokeRect(icx-iw*0.4, icy, iw*0.8, ih*0.35);
        // Beam
        ctx.save(); ctx.shadowColor = col; ctx.shadowBlur = 10;
        ctx.strokeStyle = ha(col, 0.6 + pulse*0.35); ctx.lineWidth = 2 + pulse*1.5;
        ctx.beginPath(); ctx.moveTo(icx, icy); ctx.lineTo(icx, iy); ctx.stroke();
        ctx.shadowBlur = 0; ctx.restore();
      } else if (n === 10) {
        // Orbital array: small spacecraft cluster
        const sats: [number,number][] = [[icx,icy],[icx-35,icy-15],[icx+35,icy-15],[icx-20,icy+25],[icx+20,icy+25]];
        sats.forEach(([sx,sy], si) => {
          ctx.fillStyle = ha(col, 0.35); ctx.fillRect(sx-7,sy-3,14,6);
          ctx.fillStyle = ha(col, 0.5); ctx.fillRect(sx-3,sy-5,6,10);
          if (si > 0) {
            ctx.save(); ctx.strokeStyle = ha(col, 0.2 + pulse*0.15); ctx.lineWidth = 0.7;
            ctx.setLineDash([3,3]); ctx.beginPath(); ctx.moveTo(icx,icy); ctx.lineTo(sx,sy); ctx.stroke();
            ctx.setLineDash([]); ctx.restore();
          }
        });
      } else if (n === 11) {
        // Interplanetary: planet + beam
        const pr = ih * 0.38;
        ctx.strokeStyle = ha(col, 0.4); ctx.lineWidth = 1.5;
        ctx.beginPath(); ctx.arc(ix+pr+4, icy, pr, 0, Math.PI*2); ctx.stroke();
        ctx.fillStyle = ha(col, 0.08); ctx.fill();
        // rings
        ctx.strokeStyle = ha(col, 0.25); ctx.lineWidth = 1;
        ctx.beginPath(); ctx.ellipse(ix+pr+4, icy, pr*1.5, pr*0.25, 0, 0, Math.PI*2); ctx.stroke();
        // beam to right
        ctx.save(); ctx.shadowColor = col; ctx.shadowBlur = 12;
        ctx.strokeStyle = ha(col, 0.55 + pulse*0.35); ctx.lineWidth = 1.5;
        ctx.beginPath(); ctx.moveTo(ix+pr*2+8, icy); ctx.lineTo(ix+iw, icy); ctx.stroke();
        ctx.shadowBlur = 0; ctx.restore();
      }

      ctx.restore();

      // Level label + size
      ctx.fillStyle = active ? col : ha(col, 0.65);
      ctx.font = `${active ? "bold " : ""}11px ${MN}`; ctx.textAlign = "left";
      ctx.fillText(sc.level, x+8, y+ph-17);
      ctx.fillStyle = ha(col, 0.45); ctx.font = `10px ${MN}`;
      ctx.fillText(sc.size, x+8, y+ph-5);

      // Log position indicator (small dot in bottom-right)
      ctx.fillStyle = ha(col, 0.55 + (active ? pulse*0.4 : 0));
      ctx.font = `9px ${MN}`; ctx.textAlign = "right";
      ctx.fillText(`L${n+1}`, x+pw-6, y+ph-5);
    }

    function drawScaleRuler() {
      // Log scale ruler at the very bottom
      const ry = H - 38, rh = 10;
      const rw = W - 24;
      const rx = 12;

      // Background
      ctx.fillStyle = "rgba(0,0,0,0.4)";
      ctx.fillRect(rx-2, ry-14, rw+4, 52);
      ctx.strokeStyle = ha("#1fd4c8", 0.12);
      ctx.lineWidth = 1;
      ctx.strokeRect(rx-2, ry-14, rw+4, 52);

      // Gradient ruler bar
      const grad = ctx.createLinearGradient(rx, 0, rx+rw, 0);
      SCALES.forEach((sc, i) => {
        const frac = (SCALE_LOG[i] - LOG_MIN) / (LOG_MAX - LOG_MIN);
        grad.addColorStop(Math.max(0, Math.min(1, frac)), ha(sc.col, 0.7));
      });
      ctx.fillStyle = grad;
      ctx.fillRect(rx, ry, rw, rh);
      ctx.strokeStyle = ha("#1fd4c8", 0.15); ctx.lineWidth = 1;
      ctx.strokeRect(rx, ry, rw, rh);

      // Decade ticks
      for (let dec = LOG_MIN; dec <= LOG_MAX; dec += 2) {
        const fx = rx + (dec - LOG_MIN) / (LOG_MAX - LOG_MIN) * rw;
        ctx.strokeStyle = ha("#60a5fa", 0.3); ctx.lineWidth = 1;
        ctx.beginPath(); ctx.moveTo(fx, ry); ctx.lineTo(fx, ry+rh); ctx.stroke();
        ctx.fillStyle = ha("#b0c8e8", 0.45); ctx.font = `9px ${MN}`; ctx.textAlign = "center";
        const labmap: {[k:number]:string} = {"-10":"0.1nm","-8":"10nm","-6":"1μm","-4":"100μm","-2":"1cm","0":"1m","2":"100m","4":"10km","6":"1Mm","8":"100Mm","10":"10Gm"};
        if (labmap[dec]) ctx.fillText(labmap[dec], fx, ry+rh+12);
      }

      // Scale markers on ruler
      const activeLevel = Math.floor(t / 120) % 12;
      SCALES.forEach((sc, i) => {
        const fx = rx + (SCALE_LOG[i] - LOG_MIN) / (LOG_MAX - LOG_MIN) * rw;
        const act = i === activeLevel;
        ctx.fillStyle = act ? sc.col : ha(sc.col, 0.5);
        if (act) { ctx.shadowColor = sc.col; ctx.shadowBlur = 10; }
        ctx.beginPath(); ctx.arc(fx, ry + rh * 0.5, act ? 5 : 3, 0, Math.PI*2); ctx.fill();
        ctx.shadowBlur = 0;
      });

      // Ruler label
      ctx.fillStyle = ha("#1fd4c8", 0.35); ctx.font = `9px ${MN}`; ctx.textAlign = "right";
      ctx.fillText("← sub-atomic", rx + rw * 0.15, ry - 4);
      ctx.textAlign = "left";
      ctx.fillText("interplanetary →", rx + rw * 0.82, ry - 4);
      ctx.textAlign = "center";
      ctx.fillStyle = ha("#1fd4c8", 0.45); ctx.font = `bold 9px ${MN}`;
      ctx.fillText("LOGARITHMIC SCALE  ·  0.2 nm → 10,000 km  ·  21 decades", rx + rw/2, ry - 4);
    }

    function frame() {
      t++;
      ctx.fillStyle = "#010309";
      ctx.fillRect(0, 0, W, H);

      const activeLevel = Math.floor(t / 120) % 12;

      // Draw 4×3 grid of panels
      SCALES.forEach((_, n) => {
        const col2 = n % COLS;
        const row2 = Math.floor(n / COLS);
        const x = PAD_X + col2 * (PANEL_W + PAD_X);
        const y = PAD_Y + row2 * (PANEL_H + 8);
        drawLevel(n, x, y, PANEL_W, PANEL_H, n === activeLevel);
      });

      drawScaleRuler();

      // Current level callout
      const sc = SCALES[activeLevel];
      ctx.fillStyle = ha(sc.col, 0.8); ctx.font = `bold 12px ${MN}`; ctx.textAlign = "center";
      ctx.fillText(`↑ active level: L${activeLevel+1} · ${sc.level} · ${sc.size}`, W/2, H - 56);

      raf.current = requestAnimationFrame(frame);
    }

    frame();
    return () => cancelAnimationFrame(raf.current);
  }, []);

  return (
    <canvas ref={ref} width={1100} height={460}
      style={{ width: "100%", height: "auto", display: "block", borderRadius: 6 }} />
  );
}

/* ══════════════════════════════════════════════════
   MAIN PAGE
══════════════════════════════════════════════════ */
export default function OpticalHullSimPage() {
  const [hullMode, setHullMode] = useState<HullMode>("NOMINAL");
  const modeRef = useRef<HullMode>("NOMINAL");

  const setMode = (m: HullMode) => { setHullMode(m); modeRef.current = m; };

  const panel = (col = "#1fd4c8"): React.CSSProperties => ({
    background: ha(col, 0.04), border: `1px solid ${ha(col, 0.18)}`,
    borderRadius: 6, padding: 0, overflow: "hidden",
  });
  const body: React.CSSProperties = { fontSize: 11.5, color: "rgba(200,210,228,0.7)", lineHeight: 1.7 };
  const secLbl: React.CSSProperties = {
    fontFamily: MN, fontSize: 8, letterSpacing: "0.22em", color: DIM,
    textTransform: "uppercase", marginBottom: 8, paddingBottom: 4,
    borderBottom: "1px solid rgba(31,212,200,0.08)",
  };

  const curHM = HULL_MODES.find(m => m.key === hullMode)!;

  return (
    <div style={{ minHeight: "100%", background: BG, color: "#d4e4f4",
      fontFamily: "'Rajdhani',sans-serif", overflowY: "auto" }}>
      <div style={{ maxWidth: 1160, margin: "0 auto", padding: "16px 20px" }}>

        {/* ── Title ── */}
        <div style={{ marginBottom: 14 }}>
          <div style={{ display: "inline-block", border: "1px solid #1fd4c855",
            padding: "3px 10px", fontSize: 9, letterSpacing: "0.2em",
            fontFamily: MN, color: "#1fd4c8", marginBottom: 8, borderRadius: 2 }}>
            AETHER · OPTICAL HULL · FULL SYSTEM SIMULATION
          </div>
          <h1 style={{ fontFamily: OR, fontSize: 24, color: "#fff",
            margin: "0 0 6px", letterSpacing: 2, textShadow: "0 0 24px #1fd4c855" }}>
            Plate-Switching Optical Hull · Full System
          </h1>
          <p style={{ ...body, margin: "0 0 10px", maxWidth: 900 }}>
            A live hex-tile spacecraft hull where each plate independently switches between
            six optical modes under <strong style={{ color: "#1fd4c8" }}>AI controller</strong> command.
            Below: a 12-level <strong style={{ color: "#a78bfa" }}>scale hierarchy</strong> — from silicon
            lattice (0.2 nm) through moth-eye nanostructures, metasurfaces, compound-eye optics,
            directed-energy platforms, and orbital laser arrays — spanning 21 decades of scale.
          </p>

          {/* ── Hull mode selector ── */}
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            {HULL_MODES.map(hm => (
              <button key={hm.key} onClick={() => setMode(hm.key)}
                style={{
                  fontFamily: MN, fontSize: 11, letterSpacing: "0.15em",
                  padding: "5px 14px", borderRadius: 3, cursor: "pointer",
                  border: `1px solid ${hm.key === hullMode ? ha(hm.col, 0.8) : ha(hm.col, 0.25)}`,
                  background: hm.key === hullMode ? ha(hm.col, 0.14) : ha(hm.col, 0.04),
                  color: hm.key === hullMode ? hm.col : ha(hm.col, 0.55),
                  boxShadow: hm.key === hullMode ? `0 0 18px ${ha(hm.col, 0.3)}` : "none",
                }}>
                {hm.key}
              </button>
            ))}
            <div style={{ fontFamily: MN, fontSize: 10, color: ha(curHM.col, 0.5),
              display: "flex", alignItems: "center", marginLeft: 8 }}>
              ● {curHM.key} mode active
            </div>
          </div>
        </div>

        {/* ── Hull Canvas ── */}
        <div style={{ ...panel(curHM.col), marginBottom: 12 }}>
          <div style={{ padding: "6px 14px", borderBottom: `1px solid ${ha(curHM.col, 0.12)}`,
            display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div>
              <span style={{ fontFamily: OR, fontSize: 10, color: curHM.col, letterSpacing: 1 }}>
                OPTICAL HULL · PLATE ARRAY
              </span>
              <span style={{ fontFamily: MN, fontSize: 9, color: DIM, marginLeft: 12 }}>
                Live hex-tile simulation · AI controller · {MODES.length} plate modes
              </span>
            </div>
            <div style={{ display: "flex", gap: 14 }}>
              {MODES.map((m, i) => (
                <div key={i} style={{ display: "flex", alignItems: "center", gap: 5 }}>
                  <div style={{ width: 8, height: 8, borderRadius: "50%", background: m.col }} />
                  <span style={{ fontFamily: MN, fontSize: 9, color: ha(m.col, 0.6) }}>{m.short}</span>
                </div>
              ))}
            </div>
          </div>
          <HullCanvas modeRef={modeRef} />
        </div>

        {/* ── Plate layer stack ── */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 6, marginBottom: 12 }}>
          {[
            { n:1, name:"Moth-Eye",    col:"#60a5fa", role:"Anti-reflection" },
            { n:2, name:"Metasurface", col:"#a78bfa", role:"Phase shaping" },
            { n:3, name:"Chromogenic", col:"#10b981", role:"Mode switching" },
            { n:4, name:"Photodetect",  col:"#fbbf24", role:"State sensing" },
            { n:5, name:"Actuation",   col:"#f97316", role:"6-axis motion" },
            { n:6, name:"Thermal Mgmt",col:"#ef4444", role:"Heat spread" },
            { n:7, name:"Structural",  col:"#64748b", role:"SiC / CarbonFibre" },
          ].map(({ n, name, col, role }) => (
            <div key={n} style={{
              background: ha(col, 0.06), border: `1px solid ${ha(col, 0.22)}`,
              borderRadius: 4, padding: "7px 8px",
            }}>
              <div style={{ fontFamily: MN, fontSize: 9, color: ha(col, 0.5), marginBottom: 3 }}>L{n}</div>
              <div style={{ fontFamily: OR, fontSize: 9, color: col, letterSpacing: 0.5, marginBottom: 3 }}>{name}</div>
              <div style={{ fontFamily: MN, fontSize: 9, color: "rgba(180,200,230,0.5)" }}>{role}</div>
            </div>
          ))}
        </div>

        {/* ── Scale Hierarchy Canvas ── */}
        <div style={{ ...panel("#a78bfa"), marginBottom: 12 }}>
          <div style={{ padding: "6px 14px", borderBottom: "1px solid rgba(167,139,250,0.15)" }}>
            <span style={{ fontFamily: OR, fontSize: 10, color: "#a78bfa", letterSpacing: 1 }}>
              SCALE HIERARCHY · 12 LEVELS
            </span>
            <span style={{ fontFamily: MN, fontSize: 9, color: DIM, marginLeft: 12 }}>
              0.2 nm → 10,000 km  ·  21 decades  ·  animated level focus
            </span>
          </div>
          <ScaleCanvas />
        </div>

        {/* ── Adaptive modes + science ── */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10 }}>
          {[
            { col:"#1fd4c8", title:"Adaptive Control Loop",
              body:"Onboard processor reads plate state (photodetector layer) 1000×/sec. AI model computes optimal plate assignments based on: thermal load, beam geometry, threat signature, comms direction. Propagation delay <2 ms hull-wide." },
            { col:"#f59e0b", title:"Phase-Conjugate Beam Steering",
              body:"Gold plates use the optical phase-conjugation principle: incoming wavefront is time-reversed and re-emitted with corrected phase. Enables tracking of moving targets at closure rates >1000 m/s without mechanical gimbal movement." },
            { col:"#a78bfa", title:"CaCO₃ Crystal Formation",
              body:"Hull plates grow from rapid crystallisation of calcium carbonate under pulsed UV + thermal cycling. Geological processes (millions of years) compressed to hours via controlled supersaturation, nucleation seeds, and banded deposition." },
          ].map(({ col, title, body: b }) => (
            <div key={title} style={{
              background: ha(col, 0.04), border: `1px solid ${ha(col, 0.18)}`,
              borderRadius: 4, padding: "10px 12px",
            }}>
              <div style={secLbl}>{title}</div>
              <div style={body}>{b}</div>
            </div>
          ))}
        </div>

      </div>
    </div>
  );
}
