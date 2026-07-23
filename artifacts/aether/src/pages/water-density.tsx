import { useEffect, useRef, useState } from "react";
const chladniImg = "/api/storage/public-objects/IMG_3241_1781550160764.jpeg";
/* ── Palette ─────────────────────────────────────── */
const BG     = "#020408";
const BLUE   = "#1a9fd4";
const TEAL   = "#1fd4c8";
const AMBER  = "#e8a030";
const VIOLET = "#8b5cf6";
const GREEN  = "#22c55e";
const ROSE   = "#e84070";
const DIM    = "#3a5060";
const TEXT   = "#c8d8e0";
const GOLD   = "#c9a84c";

const mono  = "'Space Mono', monospace";
const serif = "'Cinzel', serif";
const body  = "'Crimson Pro', Georgia, serif";

/* ── Shared helpers ──────────────────────────────── */
function Chip({ c = BLUE, children }: { c?: string; children: string }) {
  return (
    <span style={{
      fontFamily: mono, fontSize: 11, color: c,
      background: `${c}18`, border: `1px solid ${c}40`,
      borderRadius: 4, padding: "2px 7px", display: "inline-block", margin: "2px 3px",
    }}>{children}</span>
  );
}
function EQ({ children }: { children: string }) {
  return (
    <pre style={{
      fontFamily: mono, fontSize: 12, color: GOLD,
      background: "#030d18", border: `1px solid ${GOLD}28`,
      borderRadius: 6, padding: "12px 18px", margin: "12px 0",
      overflowX: "auto", whiteSpace: "pre-wrap",
    }}>{children}</pre>
  );
}
function SecHead({ id, n, title, sub, col = BLUE }:
  { id: string; n: string; title: string; sub: string; col?: string }) {
  return (
    <div id={id} style={{ marginTop: 64, scrollMarginTop: 80 }}>
      <div style={{ fontFamily: mono, fontSize: 10, color: col, letterSpacing: 3, marginBottom: 6 }}>{n}</div>
      <h2 style={{ fontFamily: serif, fontSize: 26, color: "#fff", margin: "0 0 4px", letterSpacing: 1 }}>{title}</h2>
      <div style={{ fontFamily: body, fontSize: 15, color: DIM, marginBottom: 20 }}>{sub}</div>
      <div style={{ height: 1, background: `linear-gradient(90deg,${col}60,transparent)`, marginBottom: 28 }} />
    </div>
  );
}
function Card({ title, col = BLUE, children }: { title: string; col?: string; children: any }) {
  return (
    <div style={{
      background: `${col}08`, border: `1px solid ${col}28`,
      borderRadius: 8, padding: "16px 20px", marginBottom: 16,
    }}>
      <div style={{ fontFamily: mono, fontSize: 10, color: col, letterSpacing: 2, marginBottom: 8 }}>{title}</div>
      <div style={{ fontFamily: body, fontSize: 15, color: TEXT, lineHeight: 1.75 }}>{children}</div>
    </div>
  );
}
function Tbl({ headers, rows, accent = BLUE }:
  { headers: string[]; rows: string[][]; accent?: string }) {
  return (
    <div style={{ overflowX: "auto", margin: "14px 0" }}>
      <table style={{ width: "100%", borderCollapse: "collapse", fontFamily: body, fontSize: 14 }}>
        <thead>
          <tr style={{ borderBottom: `1px solid ${accent}40` }}>
            {headers.map((h, i) => <th key={i} style={{ fontFamily: mono, fontSize: 10, color: accent, textAlign: "left", padding: "7px 10px", letterSpacing: 1 }}>{h}</th>)}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, ri) => (
            <tr key={ri} style={{ borderBottom: "1px solid #ffffff08", background: ri % 2 === 0 ? "#ffffff03" : "transparent" }}>
              {row.map((c, ci) => <td key={ci} style={{ padding: "8px 10px", color: TEXT, verticalAlign: "top" }}>{c}</td>)}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/* ══════════════════════════════════════════════════
   CIRCULAR CHLADNI CANVAS  (Section IV upgrade)
══════════════════════════════════════════════════ */
const CHLADNI_WATER_FREQS: [number, number, number][] = [
  [128, 0, 1], [256, 0, 2], [426, 3, 1], [512, 2, 2],
];

function CircularChladniCanvas() {
  const cvRef    = useRef<HTMLCanvasElement>(null);
  const [freq, setFreq] = useState(426);
  const freqRef  = useRef(426);
  useEffect(() => { freqRef.current = freq; }, [freq]);

  useEffect(() => {
    const cv = cvRef.current;
    if (!cv) return;
    cv.width = 260; cv.height = 260;
    const ctx = cv.getContext("2d")!;
    const imgBuf = ctx.createImageData(260, 260);
    const px = imgBuf.data;
    let t = 0, raf: number;

    const draw = () => {
      t += 0.018;
      const f    = freqRef.current;
      const mode = CHLADNI_WATER_FREQS.find(x => x[0] === f) ?? [426, 3, 1];
      const n = mode[1], m = mode[2];
      const rot = t * 0.006;

      for (let iy = 0; iy < 260; iy++) {
        for (let ix = 0; ix < 260; ix++) {
          const dx = (ix - 130) / 122, dy = (iy - 130) / 122;
          const r = Math.sqrt(dx * dx + dy * dy);
          const k = (iy * 260 + ix) * 4;
          if (r > 1.01) { px[k]=2;px[k+1]=4;px[k+2]=8;px[k+3]=255; continue; }
          const theta = Math.atan2(dy, dx) + rot;
          const u     = Math.sin(Math.PI * m * r) * Math.cos(n * theta);
          const nodal = Math.max(0, 1 - Math.abs(u) * 2.8);
          const glow  = nodal * nodal;
          if (glow > 0.35) {
            px[k]  =Math.min(255,Math.round(201*glow+30));
            px[k+1]=Math.min(255,Math.round(168*glow));
            px[k+2]=Math.min(255,Math.round(76*glow));
          } else {
            const a=1-glow*2;
            px[k]=Math.round(3+20*a); px[k+1]=Math.round(5+95*a); px[k+2]=Math.round(10+170*a);
          }
          px[k+3]=255;
        }
      }
      ctx.putImageData(imgBuf,0,0);
      ctx.beginPath(); ctx.arc(130,130,122,0,Math.PI*2);
      ctx.strokeStyle=`${AMBER}30`; ctx.lineWidth=1.5; ctx.stroke();
      ctx.font=`bold 9px 'Space Mono',monospace`; ctx.textAlign="center";
      ctx.fillStyle=`${AMBER}cc`;
      ctx.fillText(`${f} Hz  ·  n=${n}  m=${m}`, 130, 250);
      raf=requestAnimationFrame(draw);
    };
    draw();
    return () => cancelAnimationFrame(raf);
  }, []);

  return (
    <div>
      <canvas ref={cvRef} style={{
        display:"block", borderRadius:"50%",
        border:`1px solid ${AMBER}20`,
        boxShadow:`0 0 28px ${AMBER}14, 0 0 56px ${TEAL}0a`,
      }} />
      <div style={{ display:"flex", gap:6, marginTop:10, flexWrap:"wrap" }}>
        {CHLADNI_WATER_FREQS.map(([f]) => (
          <button key={f} onClick={() => setFreq(f)} style={{
            fontFamily: mono, fontSize:8, padding:"4px 10px",
            borderRadius:4, cursor:"pointer",
            border:`1px solid ${freq===f?AMBER:AMBER+"30"}`,
            background: freq===f ? `${AMBER}14` : "transparent",
            color: freq===f ? AMBER : `${AMBER}50`,
          }}>{f} Hz</button>
        ))}
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════
   HOPFION BURST CANVAS  (Section VI)
══════════════════════════════════════════════════ */
function HopfionBurstCanvas() {
  const cvRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const cv = cvRef.current;
    if (!cv) return;
    cv.width = 230; cv.height = 230;
    const ctx = cv.getContext("2d")!;
    const CX = 115, CY = 115, R = 108;
    const imgBuf = ctx.createImageData(230, 230);
    const px = imgBuf.data;
    const noise = new Float32Array(230 * 230);
    for (let i=0; i<noise.length; i++) noise[i]=Math.random()*2-1;
    const CYCLE = Math.PI * 10;
    let t = 0, raf: number;

    const draw = () => {
      t += 0.014;
      const phase = (t % CYCLE) / CYCLE;

      for (let iy=0; iy<230; iy++) {
        for (let ix=0; ix<230; ix++) {
          const dx=(ix-CX)/R, dy=(iy-CY)/R;
          const r=Math.sqrt(dx*dx+dy*dy);
          const theta=Math.atan2(dy,dx);
          const k=(iy*230+ix)*4;
          if (r>1.01){px[k]=2;px[k+1]=4;px[k+2]=8;px[k+3]=255;continue;}
          let Rc=0,Gc=0,Bc=0;

          if (phase<0.22) {
            const pulse=0.82+0.18*Math.sin(t*5.5);
            const amp=Math.exp(-r*r*9.5)*pulse;
            const rd=r-0.28;
            const ring=Math.exp(-(rd*rd)*55)*0.35*pulse;
            const v=amp+ring;
            Rc=Math.round(29*v); Gc=Math.round(158*v); Bc=Math.round(212*v);
          } else if (phase<0.44) {
            const sq=(phase-0.22)/0.22, ang=t*0.22;
            const ex=dx*Math.cos(ang)+dy*Math.sin(ang);
            const ey=-dx*Math.sin(ang)+dy*Math.cos(ang);
            const sx=1+sq*0.72, sy=Math.max(0.3,1-sq*0.4);
            const rsq=Math.sqrt(ex*ex/(sx*sx)+ey*ey/(sy*sy));
            const amp=Math.exp(-rsq*rsq*9)*0.9;
            Rc=Math.round(201*amp); Gc=Math.round(168*amp); Bc=Math.round(76*amp);
          } else if (phase<0.60) {
            const dc=(phase-0.44)/0.16;
            const amp=Math.exp(-r*r*9)*(1-dc*0.6);
            const nv=noise[iy*230+ix]*dc*0.35;
            const v=Math.max(0,amp+nv);
            Rc=Math.round(160*v*(1-dc*0.5)+100*v*dc);
            Gc=Math.round(180*v); Bc=Math.round(200*v);
          } else if (phase<0.75) {
            const burst=(phase-0.60)/0.15;
            const ct=Math.cos(6*theta);
            const petal=ct*ct;
            const sd=r-0.1-burst*0.72;
            const shell=Math.exp(-(sd*sd)*22);
            const flash=Math.exp(-r*r*55)*(1-burst)*2.8;
            const v=petal*shell*(1-burst*0.4)+flash;
            Rc=Math.min(255,Math.round(255*Math.min(1,v)));
            Gc=Math.min(255,Math.round(200*Math.min(1,v*0.9)));
            Bc=Math.min(255,Math.round(80*Math.min(1,v*0.6)));
          } else {
            const radial=Math.sin(Math.PI*r);
            const angular=Math.cos(6*theta+t*0.04);
            const u=radial*angular;
            const nodal=Math.max(0,1-Math.abs(u)*2.6);
            const glow=nodal*nodal;
            Rc=Math.round(29*glow); Gc=Math.round(158*glow); Bc=Math.round(212*glow);
          }
          px[k]=Math.min(255,Rc);px[k+1]=Math.min(255,Gc);px[k+2]=Math.min(255,Bc);px[k+3]=255;
        }
      }
      ctx.putImageData(imgBuf,0,0);
      ctx.beginPath();ctx.arc(CX,CY,R,0,Math.PI*2);
      ctx.strokeStyle=`${GOLD}18`;ctx.lineWidth=1;ctx.stroke();
      const labels=["COHERENT  |α⟩","SQUEEZE  Ŝ(ζ)","DECOHERENCE  ℒ","BURST  ΔQ_Hopf","STABLE n=6"];
      const pi=phase<0.22?0:phase<0.44?1:phase<0.60?2:phase<0.75?3:4;
      const lc=[`${TEAL}ee`,`${AMBER}ee`,"rgba(160,170,200,0.9)",`${AMBER}ee`,`${TEAL}ee`][pi];
      ctx.font=`bold 7px 'Space Mono',monospace`;ctx.textAlign="center";
      ctx.fillStyle=lc; ctx.fillText(labels[pi],CX,222);
      raf=requestAnimationFrame(draw);
    };
    draw();
    return () => cancelAnimationFrame(raf);
  }, []);

  return (
    <canvas ref={cvRef} style={{
      display:"block", borderRadius:"50%",
      border:`1px solid ${VIOLET}28`,
      boxShadow:`0 0 24px ${VIOLET}18`,
    }} />
  );
}

/* ══════════════════════════════════════════════════
   MAIN SIMULATION CANVAS
══════════════════════════════════════════════════ */
type CanvasMode = "gradient" | "chladni" | "warp";

/* Gaussian bump height field */
function heightAt(x: number, y: number, bumps: { x: number; y: number; h: number; s: number }[]) {
  return bumps.reduce((acc, b) => {
    const dx = x - b.x, dy = y - b.y;
    return acc + b.h * Math.exp(-(dx * dx + dy * dy) / (2 * b.s * b.s));
  }, 0);
}

const BUMPS = [
  { x: 0.25, y: 0.3,  h: 1.0,  s: 0.1 },
  { x: 0.7,  y: 0.25, h: 0.8,  s: 0.12 },
  { x: 0.5,  y: 0.65, h: 0.9,  s: 0.09 },
  { x: 0.15, y: 0.7,  h: 0.6,  s: 0.08 },
  { x: 0.8,  y: 0.7,  h: 0.7,  s: 0.11 },
  { x: 0.45, y: 0.42, h: -0.5, s: 0.13 }, // valley
];

function DensityCanvas({ mode }: { mode: CanvasMode }) {
  const cvs = useRef<HTMLCanvasElement>(null);
  const raf = useRef(0);
  const t   = useRef(0);

  useEffect(() => {
    const canvas = cvs.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d")!;

    const resize = () => {
      const p = canvas.parentElement!;
      canvas.width  = p.clientWidth;
      canvas.height = Math.min(340, Math.round(p.clientWidth * 0.52));
    };
    resize();
    window.addEventListener("resize", resize);

    /* ── pre-compute height field ── */
    const GRID = 80;
    const field: number[][] = Array.from({ length: GRID }, (_, iy) =>
      Array.from({ length: GRID }, (_, ix) =>
        heightAt(ix / (GRID - 1), iy / (GRID - 1), BUMPS)
      )
    );
    const maxH = Math.max(...field.flat());
    const minH = Math.min(...field.flat());

    /* ── chladni mode state ── */
    let chladniM = 2, chladniN = 3;
    const chladniCycle = Math.PI * 2 * 8; // switch modes every 8s
    let prevChladniSwitch = 0;

    const draw = () => {
      const W = canvas.width, H = canvas.height;
      ctx.clearRect(0, 0, W, H);

      /* ══ MODE: GRADIENT FLOW ══ */
      if (mode === "gradient") {
        // draw water thickness heatmap
        const cellW = W / GRID, cellH = H / GRID;
        for (let iy = 0; iy < GRID; iy++) {
          for (let ix = 0; ix < GRID; ix++) {
            const h = field[iy][ix];
            const norm = (h - minH) / (maxH - minH); // 0 = valley, 1 = peak
            // thickness = inverse of height (water pools in valleys)
            const thickness = 1 - norm * 0.8;
            // Color: deep blue = thick water, light = thin
            const r = Math.round(10 + 20 * norm);
            const g = Math.round(30 + 80 * norm * 0.3);
            const b = Math.round(60 + 160 * thickness);
            ctx.fillStyle = `rgb(${r},${g},${b})`;
            ctx.fillRect(Math.round(ix * cellW), Math.round(iy * cellH),
              Math.ceil(cellW) + 1, Math.ceil(cellH) + 1);
          }
        }

        // draw flow vectors (gradient descent)
        const arrowGrid = 18;
        for (let iy = 1; iy < arrowGrid - 1; iy++) {
          for (let ix = 1; ix < arrowGrid - 1; ix++) {
            const fx = ix / (arrowGrid - 1), fy = iy / (arrowGrid - 1);
            const eps = 0.02;
            const dhdx = (heightAt(fx + eps, fy, BUMPS) - heightAt(fx - eps, fy, BUMPS)) / (2 * eps);
            const dhdy = (heightAt(fx, fy + eps, BUMPS) - heightAt(fx, fy - eps, BUMPS)) / (2 * eps);
            const vx = -dhdx, vy = -dhdy;
            const speed = Math.sqrt(vx * vx + vy * vy);
            if (speed < 0.05) continue;
            const nx = vx / speed, ny = vy / speed;
            const px = fx * W, py = fy * H;
            const len = Math.min(22, speed * 30);
            const ex = px + nx * len, ey = py + ny * len;
            // animated offset
            const animOffset = (t.current * 0.4 + ix * 0.3 + iy * 0.7) % 1;
            const apx = px + nx * len * animOffset;
            const apy = py + ny * len * animOffset;
            ctx.beginPath();
            ctx.moveTo(apx, apy);
            ctx.lineTo(ex, ey);
            const alpha = 0.35 + 0.25 * Math.sin(t.current * 2 + ix + iy);
            ctx.strokeStyle = `rgba(100,220,255,${alpha})`;
            ctx.lineWidth = 1.2;
            ctx.stroke();
            // arrowhead
            const angle = Math.atan2(ey - apy, ex - apx);
            ctx.beginPath();
            ctx.moveTo(ex, ey);
            ctx.lineTo(ex - 5 * Math.cos(angle - 0.5), ey - 5 * Math.sin(angle - 0.5));
            ctx.lineTo(ex - 5 * Math.cos(angle + 0.5), ey - 5 * Math.sin(angle + 0.5));
            ctx.fillStyle = `rgba(100,220,255,${alpha * 0.8})`;
            ctx.fill();
          }
        }

        // draw contour lines
        const levels = [-0.3, 0, 0.3, 0.6, 0.9];
        for (const lev of levels) {
          ctx.beginPath();
          let first = true;
          for (let ix = 0; ix < GRID - 1; ix++) {
            for (let iy = 0; iy < GRID - 1; iy++) {
              const h = field[iy][ix];
              if (Math.abs(h - lev) < 0.08) {
                const px = (ix / GRID) * W, py = (iy / GRID) * H;
                if (first) { ctx.moveTo(px, py); first = false; }
                else ctx.lineTo(px, py);
              }
            }
          }
          ctx.strokeStyle = `rgba(200,180,120,0.12)`;
          ctx.lineWidth = 0.8;
          ctx.stroke();
        }

        // labels
        ctx.textAlign = "left";
        ctx.fillStyle = "rgba(100,220,255,0.7)";
        ctx.font = `9px ${mono}`;
        ctx.fillText("v⃗ = −k∇h", 8, H - 28);
        ctx.fillStyle = "rgba(200,200,255,0.4)";
        ctx.fillText("BLUE = THICK WATER  ·  DARK = SHALLOW", 8, H - 14);

        // bump labels
        BUMPS.slice(0, 5).forEach((b, i) => {
          ctx.fillStyle = b.h > 0 ? "rgba(255,200,100,0.7)" : "rgba(100,200,255,0.7)";
          ctx.font = `8px ${mono}`;
          ctx.textAlign = "center";
          ctx.fillText(b.h > 0 ? "BUMP" : "VALLEY", b.x * W, b.y * H - 4);
        });
      }

      /* ══ MODE: CHLADNI ══ */
      else if (mode === "chladni") {
        // switch between Chladni mode pairs over time
        if (t.current - prevChladniSwitch > 6) {
          prevChladniSwitch = t.current;
          const modes = [[2, 3], [3, 4], [2, 5], [4, 5], [3, 5]];
          const m = modes[Math.floor(t.current / 6) % modes.length];
          chladniM = m[0]; chladniN = m[1];
        }

        // Standing wave superposition: Z = cos(m*pi*x)*cos(n*pi*y) + cos(n*pi*x)*cos(m*pi*y)
        const imgData = ctx.createImageData(W, H);
        const data = imgData.data;
        for (let py = 0; py < H; py++) {
          for (let px = 0; px < W; px++) {
            const x = px / W, y = py / H;
            const Z = Math.cos(chladniM * Math.PI * x) * Math.cos(chladniN * Math.PI * y)
                    + Math.cos(chladniN * Math.PI * x) * Math.cos(chladniM * Math.PI * y);
            const amp = Math.abs(Z);
            const isNode = amp < 0.12; // nodal lines
            const idx = (py * W + px) * 4;
            if (isNode) {
              // Nodal lines — particles settle here
              data[idx]     = 220;
              data[idx + 1] = 200;
              data[idx + 2] = 80;
              data[idx + 3] = 200;
            } else {
              // High amplitude — particles blown away
              const c = Math.min(255, amp * 180);
              data[idx]     = Math.round(10 + c * 0.3);
              data[idx + 1] = Math.round(20 + c * 0.5);
              data[idx + 2] = Math.round(40 + c * 0.9);
              data[idx + 3] = 220;
            }
          }
        }
        ctx.putImageData(imgData, 0, 0);

        // Animated particle swarm at nodes
        for (let i = 0; i < 300; i++) {
          const px = Math.random() * W, py = Math.random() * H;
          const x = px / W, y = py / H;
          const Z = Math.cos(chladniM * Math.PI * x) * Math.cos(chladniN * Math.PI * y)
                  + Math.cos(chladniN * Math.PI * x) * Math.cos(chladniM * Math.PI * y);
          if (Math.abs(Z) < 0.15) {
            ctx.beginPath();
            ctx.arc(px, py, 1.5, 0, Math.PI * 2);
            ctx.fillStyle = "rgba(255,220,80,0.7)";
            ctx.fill();
          }
        }

        // labels
        ctx.fillStyle = "rgba(255,220,80,0.8)";
        ctx.font = `9px ${mono}`;
        ctx.textAlign = "left";
        ctx.fillText(`CHLADNI MODE (${chladniM},${chladniN})  ·  Z = cos(${chladniM}πx)cos(${chladniN}πy) + cos(${chladniN}πx)cos(${chladniM}πy)`, 8, H - 14);
        ctx.fillStyle = "rgba(220,200,80,0.6)";
        ctx.fillText("YELLOW LINES = NODES (zero amplitude) · PARTICLES COLLECT HERE", 8, H - 28);
      }

      /* ══ MODE: WARP METRIC ══ */
      else if (mode === "warp") {
        // Dark background
        ctx.fillStyle = "#010610";
        ctx.fillRect(0, 0, W, H);

        // Compute effective spacetime metric from fluid velocity field
        // g_μν ~ η_μν + f(∇h, ∇²h)
        // Visualize as distorted grid

        const gridLines = 20;
        const vortexX = W * 0.5, vortexY = H * 0.45;

        // Draw distorted spacetime grid
        for (let pass = 0; pass < 2; pass++) {
          const isX = pass === 0;
          ctx.beginPath();
          for (let line = 0; line <= gridLines; line++) {
            const frac = line / gridLines;
            ctx.moveTo(
              isX ? (frac * W) : 0,
              isX ? 0 : (frac * H)
            );
            for (let step = 1; step <= 60; step++) {
              const sf = step / 60;
              let px = isX ? frac * W : sf * W;
              let py = isX ? sf * H  : frac * H;
              // distortion: pull toward vortex, strength from flow field
              const dx = px - vortexX, dy = py - vortexY;
              const dist = Math.sqrt(dx * dx + dy * dy) + 1;
              const strength = (W * 0.35) / dist;
              const distFactor = Math.min(0.45, strength * 0.015);
              const spiralT = t.current * 0.3;
              const warpX = -dy / dist * distFactor * W * 0.25;
              const warpY =  dx / dist * distFactor * H * 0.25;
              px += warpX * Math.sin(spiralT + dist * 0.015);
              py += warpY * Math.cos(spiralT + dist * 0.015);
              ctx.lineTo(px, py);
            }
          }
          const gridAlpha = 0.12 + 0.04 * Math.sin(t.current * 0.5);
          ctx.strokeStyle = `rgba(80,160,220,${gridAlpha})`;
          ctx.lineWidth = 0.8;
          ctx.stroke();
        }

        // Warp vortex core
        for (let r = 5; r < 80; r += 12) {
          const pulse = 0.7 + 0.3 * Math.sin(t.current * 1.8 + r * 0.1);
          ctx.beginPath();
          ctx.arc(vortexX, vortexY, r * pulse, 0, Math.PI * 2);
          const alpha = (80 - r) / 80 * 0.4 * pulse;
          ctx.strokeStyle = `rgba(220,80,160,${alpha})`;
          ctx.lineWidth = 1;
          ctx.stroke();
        }

        // Rotating spiral arms
        for (let arm = 0; arm < 3; arm++) {
          ctx.beginPath();
          for (let s = 0; s < 100; s++) {
            const r = s * 1.5;
            const a = (arm / 3) * Math.PI * 2 + s * 0.12 + t.current * 0.4;
            const px = vortexX + r * Math.cos(a);
            const py = vortexY + r * Math.sin(a) * 0.65;
            s === 0 ? ctx.moveTo(px, py) : ctx.lineTo(px, py);
          }
          ctx.strokeStyle = `rgba(160,80,255,0.20)`;
          ctx.lineWidth = 1.5;
          ctx.stroke();
        }

        // Metric label
        ctx.textAlign = "center";
        ctx.fillStyle = "rgba(220,80,160,0.7)";
        ctx.font = `9px ${mono}`;
        ctx.fillText("ds² = −(c²−v²)dt² − 2v⃗·dx⃗dt + dx⃗²", vortexX, vortexY + 95);
        ctx.fillStyle = "rgba(80,160,220,0.5)";
        ctx.fillText("SPACETIME GRID DISTORTED BY FLOW FIELD  ·  FLUID ANALOG GRAVITY", W * 0.5, H - 14);

        // Infobox
        const labels = [
          { x: W * 0.12, y: H * 0.2,  col: BLUE,   txt: "FLAT\nSPACETIME" },
          { x: W * 0.88, y: H * 0.2,  col: VIOLET, txt: "HIGH-VELOCITY\nFLOW ZONE" },
          { x: W * 0.5,  y: H * 0.45, col: ROSE,   txt: "VORTEX\nCORE" },
        ];
        for (const lb of labels) {
          ctx.textAlign = "center";
          ctx.fillStyle = lb.col + "bb";
          ctx.font = `8px ${mono}`;
          lb.txt.split("\n").forEach((line, i) => ctx.fillText(line, lb.x, lb.y + i * 12));
        }
      }

      t.current += 0.016;
      raf.current = requestAnimationFrame(draw);
    };
    draw();
    return () => { cancelAnimationFrame(raf.current); window.removeEventListener("resize", resize); };
  }, [mode]);

  return (
    <div style={{ borderRadius: 10, overflow: "hidden", border: `1px solid ${BLUE}20` }}>
      <canvas ref={cvs} style={{ display: "block", width: "100%" }} />
    </div>
  );
}

/* ── Mode tabs ─────────────────────────────────── */
function ModeTabs({ value, onChange }: { value: CanvasMode; onChange: (m: CanvasMode) => void }) {
  const tabs: { k: CanvasMode; label: string; col: string }[] = [
    { k: "gradient", label: "Gradient Flow  v = −∇h", col: BLUE   },
    { k: "chladni",  label: "Chladni Field",          col: AMBER  },
    { k: "warp",     label: "Emergent Metric",        col: VIOLET },
  ];
  return (
    <div style={{ display: "flex", gap: 6, marginBottom: 10, flexWrap: "wrap" }}>
      {tabs.map(tab => (
        <button key={tab.k} onClick={() => onChange(tab.k)} style={{
          fontFamily: mono, fontSize: 10, padding: "5px 14px", borderRadius: 4, cursor: "pointer",
          border: `1px solid ${value === tab.k ? tab.col : DIM + "60"}`,
          background: value === tab.k ? `${tab.col}18` : "transparent",
          color: value === tab.k ? tab.col : DIM,
          transition: "all 0.2s",
        }}>{tab.label}</button>
      ))}
    </div>
  );
}

/* ══════════════════════════════════════════════════
   WATER DENSITY DYNAMICS SIMULATOR  (Section IX)
   2-D Boussinesq convection · real Kell ρ(T) curve
   Interactive: left-click = heat · right-click = cool
══════════════════════════════════════════════════ */
type DynMode = "density" | "thermal" | "buoyancy";

function WaterDensityDynamicsCanvas() {
  const cvRef = useRef<HTMLCanvasElement>(null);
  const [leftTemp,  setLeftTemp]  = useState(2);
  const [rightTemp, setRightTemp] = useState(65);
  const [diffVal,   setDiffVal]   = useState(10);
  const [dynMode,   setDynMode]   = useState<DynMode>("density");

  const ltRef = useRef(2), rtRef = useRef(65), diffRef = useRef(0.10);
  const modeRef = useRef<DynMode>("density");
  useEffect(() => { ltRef.current = leftTemp; },        [leftTemp]);
  useEffect(() => { rtRef.current = rightTemp; },       [rightTemp]);
  useEffect(() => { diffRef.current = diffVal / 100; }, [diffVal]);
  useEffect(() => { modeRef.current = dynMode; },       [dynMode]);

  const [stats, setStats] = useState({ avgT: 20, avgRho: 998.2, minRho: 958.0, maxRho: 999.97 });

  useEffect(() => {
    const cv = cvRef.current; if (!cv) return;
    const ctx = cv.getContext("2d")!;

    const resize = () => {
      const dpr = window.devicePixelRatio || 1;
      const w = cv.parentElement!.clientWidth;
      cv.width  = w * dpr;
      cv.height = 420 * dpr;
      cv.style.width  = "100%";
      cv.style.height = "420px";
    };
    resize();
    window.addEventListener("resize", resize);

    const COLS = 120, ROWS = 55;

    // Kell (1975) polynomial — kg/m³, accurate 0–100 °C
    const kell = (t: number): number => {
      const tc = Math.max(0, Math.min(100, t));
      return 999.842594
        + 6.793952e-2  * tc
        - 9.095290e-3  * tc * tc
        + 1.001685e-4  * tc * tc * tc
        - 1.120083e-6  * tc * tc * tc * tc
        + 6.536332e-9  * tc * tc * tc * tc * tc;
    };

    // Init with room-temp + small noise
    let T = new Float32Array(COLS * ROWS);
    for (let i = 0; i < T.length; i++) T[i] = 20 + (Math.random() - 0.5) * 3;

    const mouse = { x: -1, y: -1, active: false, hot: true };
    const onMove = (e: MouseEvent) => {
      const r = cv.getBoundingClientRect();
      mouse.x = (e.clientX - r.left) / r.width;
      mouse.y = (e.clientY - r.top)  / r.height;
    };
    const onDown  = (e: MouseEvent) => { mouse.active = true; mouse.hot = e.button !== 2; e.preventDefault(); };
    const onUp    = ()              => { mouse.active = false; };
    const onCtx   = (e: MouseEvent) => { e.preventDefault(); mouse.hot = false; mouse.active = true; };
    cv.addEventListener("mousemove",   onMove);
    cv.addEventListener("mousedown",   onDown);
    cv.addEventListener("mouseup",     onUp);
    cv.addEventListener("contextmenu", onCtx);
    document.addEventListener("mouseup", onUp);

    let raf = 0, tick = 0;

    const draw = () => {
      const dpr = window.devicePixelRatio || 1;
      const W = cv.width, H = cv.height;

      // ── mouse heat/cool brush ──
      if (mouse.active && mouse.x >= 0) {
        const mx = Math.floor(mouse.x * COLS);
        const my = Math.floor(mouse.y * ROWS);
        const R = 5;
        for (let dy = -R; dy <= R; dy++) {
          for (let dx = -R; dx <= R; dx++) {
            if (dx*dx + dy*dy > R*R) continue;
            const nx = mx+dx, ny = my+dy;
            if (nx < 1 || nx >= COLS-1 || ny < 0 || ny >= ROWS) continue;
            T[ny*COLS+nx] = Math.max(0, Math.min(100, T[ny*COLS+nx] + (mouse.hot ? 4 : -4)));
          }
        }
      }

      // ── wall boundary conditions ──
      for (let iy = 0; iy < ROWS; iy++) {
        T[iy*COLS + 0]      = ltRef.current;
        T[iy*COLS + COLS-1] = rtRef.current;
      }

      // ── diffusion (explicit finite-difference) ──
      const d = diffRef.current;
      const T2 = new Float32Array(T);
      for (let iy = 1; iy < ROWS-1; iy++) {
        for (let ix = 1; ix < COLS-1; ix++) {
          T2[iy*COLS+ix] = T[iy*COLS+ix] + d * (
            T[(iy-1)*COLS+ix] + T[(iy+1)*COLS+ix] +
            T[iy*COLS+ix-1]   + T[iy*COLS+ix+1]   - 4*T[iy*COLS+ix]
          );
        }
      }
      T = T2;

      // ── buoyancy: denser water sinks, lighter rises ──
      // Water is anomalous below 4°C: colder water is LIGHTER than 4°C water
      // so both cold (<4°C) AND warm (>4°C) water rise relative to 4°C water
      for (let ix = 1; ix < COLS-1; ix++) {
        for (let iy = ROWS-2; iy >= 1; iy--) {
          const rhoHere  = kell(T[iy*COLS+ix]);
          const rhoBelow = kell(T[(iy+1)*COLS+ix]);
          if (rhoBelow < rhoHere - 0.008) {
            // Rayleigh-Taylor instability: lighter cell below heavier → swap
            const blend = 0.06;
            const tH = T[iy*COLS+ix], tB = T[(iy+1)*COLS+ix];
            T[iy*COLS+ix]      = tH*(1-blend) + tB*blend;
            T[(iy+1)*COLS+ix]  = tB*(1-blend) + tH*blend;
          }
        }
      }

      // ── rasterise cells ──
      const img = ctx.createImageData(W, H);
      const px  = img.data;
      const cw  = W / COLS, ch = H / ROWS;
      const m   = modeRef.current;
      let sumT = 0, sumR = 0, minR = 1e9, maxR = 0;

      for (let iy = 0; iy < ROWS; iy++) {
        for (let ix = 0; ix < COLS; ix++) {
          const temp    = Math.max(0, Math.min(100, T[iy*COLS+ix]));
          const density = kell(temp);
          sumT += temp; sumR += density;
          if (density < minR) minR = density;
          if (density > maxR) maxR = density;

          let r = 0, g = 0, b = 0;

          if (m === "density") {
            if (temp < 4) {
              // anomalous zone: 0–4°C — cyan-white as density approaches max
              const f = temp / 4;
              r = Math.round(15  + 10*f);
              g = Math.round(140 + 90*f);
              b = Math.round(185 + 70*f);
            } else {
              // normal zone: 4–100°C — max-density teal → hot amber/red
              const f = Math.min(1, (temp - 4) / 96);
              r = Math.round(10  + 230*f*f);
              g = Math.round(225 - 175*f);
              b = Math.round(255 - 220*f);
            }
          } else if (m === "thermal") {
            const f = temp / 100;
            r = Math.round(30  + 200*f*f);
            g = Math.round(110 - 70*f + 20*Math.sin(Math.PI*f));
            b = Math.round(215 - 175*f);
          } else {
            // buoyancy mode: color by ρ relative to 4°C max
            const buoy = 999.97 - density; // 0 = max density; +ve = less dense (rises)
            if (buoy < 0.5) {
              // near max density: teal glow
              const f = Math.max(0, 1 - buoy/0.5);
              r = 0; g = Math.round(190 + 65*f); b = Math.round(160 + 95*f);
            } else if (temp > 4) {
              // warm, light, rising: amber-orange
              const f = Math.min(1, (temp-4)/96);
              r = Math.round(170 + 70*f); g = Math.round(110 + 60*f); b = 15;
            } else {
              // cold anomaly (<4°C): also less dense than max — ice-blue
              const f = 1 - temp/4;
              r = Math.round(80 + 60*f); g = Math.round(120 + 60*f); b = Math.round(200 + 55*f);
            }
          }

          // fill cell pixels
          const x0 = Math.round(ix*cw), y0 = Math.round(iy*ch);
          const x1 = Math.round((ix+1)*cw), y1 = Math.round((iy+1)*ch);
          for (let py = y0; py < Math.min(y1,H); py++) {
            for (let qx = x0; qx < Math.min(x1,W); qx++) {
              const k = (py*W + qx)*4;
              px[k]=r; px[k+1]=g; px[k+2]=b; px[k+3]=255;
            }
          }
        }
      }
      ctx.putImageData(img, 0, 0);

      // ── 4°C iso-density contour ──
      ctx.beginPath();
      for (let iy = 0; iy < ROWS; iy++) {
        for (let ix = 0; ix < COLS-1; ix++) {
          const a = T[iy*COLS+ix], b2 = T[iy*COLS+ix+1];
          if ((a-4)*(b2-4) < 0) {
            const f = (4-a)/(b2-a);
            const px2 = (ix+f)*cw; const py2 = iy*ch;
            ctx.moveTo(px2, py2); ctx.lineTo(px2, py2+ch);
          }
        }
      }
      for (let ix = 0; ix < COLS; ix++) {
        for (let iy = 0; iy < ROWS-1; iy++) {
          const a = T[iy*COLS+ix], b2 = T[(iy+1)*COLS+ix];
          if ((a-4)*(b2-4) < 0) {
            const f = (4-a)/(b2-a);
            const px2 = ix*cw; const py2 = (iy+f)*ch;
            ctx.moveTo(px2, py2); ctx.lineTo(px2+cw, py2);
          }
        }
      }
      ctx.strokeStyle = "rgba(0,255,230,0.72)";
      ctx.lineWidth   = 1.5 * dpr;
      ctx.stroke();

      // ── wall temperature labels ──
      ctx.save();
      ctx.font      = `${9*dpr}px 'Space Mono', monospace`;
      ctx.textAlign = "center";
      ctx.fillStyle = `rgba(26,159,212,0.85)`;
      ctx.fillText(`${ltRef.current.toFixed(0)}°C`, 28*dpr, H - 10*dpr);
      ctx.fillStyle = `rgba(232,160,48,0.85)`;
      ctx.fillText(`${rtRef.current.toFixed(0)}°C`, W - 28*dpr, H - 10*dpr);
      ctx.restore();

      // ── 4°C label ──
      ctx.save();
      ctx.font      = `${8*dpr}px 'Space Mono', monospace`;
      ctx.textAlign = "left";
      ctx.fillStyle = "rgba(0,255,230,0.8)";
      ctx.fillText("4°C · ρ_max", 8*dpr, 15*dpr);
      ctx.restore();

      // update stats every 30 frames
      if (tick % 30 === 0) {
        const n = COLS * ROWS;
        setStats({ avgT: sumT/n, avgRho: sumR/n, minRho: minR, maxRho: maxR });
      }
      tick++;
      raf = requestAnimationFrame(draw);
    };
    draw();

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
      cv.removeEventListener("mousemove",   onMove);
      cv.removeEventListener("mousedown",   onDown);
      cv.removeEventListener("mouseup",     onUp);
      cv.removeEventListener("contextmenu", onCtx);
      document.removeEventListener("mouseup", onUp);
    };
  }, []);

  return (
    <div>
      {/* mode + hint */}
      <div style={{ display:"flex", gap:8, marginBottom:14, flexWrap:"wrap", alignItems:"center", justifyContent:"space-between" }}>
        <div style={{ display:"flex", gap:6, flexWrap:"wrap" }}>
          {([
            ["density",  "ρ · DENSITY",  TEAL],
            ["thermal",  "T · THERMAL",  AMBER],
            ["buoyancy", "↕ · BUOYANCY", VIOLET],
          ] as const).map(([k, label, col]) => (
            <button key={k} onClick={() => setDynMode(k)} style={{
              fontFamily: mono, fontSize: 9, letterSpacing: 1.5, padding: "5px 14px",
              border: `1px solid ${dynMode===k ? col : col+"30"}`,
              background: dynMode===k ? `${col}14` : "transparent",
              color:  dynMode===k ? col : `${col}50`,
              cursor: "pointer",
            }}>{label}</button>
          ))}
        </div>
        <span style={{ fontFamily:mono, fontSize:9, color:`${DIM}90`, letterSpacing:1 }}>
          LEFT CLICK = heat · RIGHT CLICK = cool
        </span>
      </div>

      {/* sliders */}
      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:18, marginBottom:14 }}>
        {([
          { label:"LEFT WALL",   val:leftTemp,  min:0, max:80, col:BLUE,   set:setLeftTemp,           fmt:(v:number)=>`${v}°C` },
          { label:"RIGHT WALL",  val:rightTemp, min:0, max:80, col:AMBER,  set:setRightTemp,          fmt:(v:number)=>`${v}°C` },
          { label:"DIFFUSIVITY", val:diffVal,   min:2, max:28, col:TEAL,   set:setDiffVal,            fmt:(v:number)=>`${(v/100).toFixed(2)}` },
        ] as const).map(s => (
          <div key={s.label}>
            <div style={{ display:"flex", justifyContent:"space-between", marginBottom:5 }}>
              <span style={{ fontFamily:mono, fontSize:8, color:s.col, letterSpacing:1.5 }}>{s.label}</span>
              <span style={{ fontFamily:mono, fontSize:9, color:s.col }}>{s.fmt(s.val)}</span>
            </div>
            <input type="range" min={s.min} max={s.max} step={1} value={s.val}
              onChange={e => (s.set as (v: number) => void)(+e.target.value)}
              style={{ width:"100%", accentColor:s.col, cursor:"pointer" }} />
          </div>
        ))}
      </div>

      {/* canvas */}
      <div style={{ borderRadius:8, overflow:"hidden", border:`1px solid ${BLUE}28` }}>
        <canvas ref={cvRef} style={{ display:"block", width:"100%", height:420, cursor:"crosshair" }} />
      </div>

      {/* telemetry strip */}
      <div style={{ display:"flex", gap:24, marginTop:10, flexWrap:"wrap", alignItems:"center" }}>
        {([
          { lbl:"T̄",    val:`${stats.avgT.toFixed(1)} °C`,          col:AMBER  },
          { lbl:"ρ̄",    val:`${stats.avgRho.toFixed(2)} kg/m³`,     col:BLUE   },
          { lbl:"ρ max", val:`${stats.maxRho.toFixed(2)} kg/m³`,     col:TEAL   },
          { lbl:"ρ min", val:`${stats.minRho.toFixed(2)} kg/m³`,     col:DIM    },
          { lbl:"Δρ",    val:`${(stats.maxRho-stats.minRho).toFixed(2)} kg/m³`, col:VIOLET },
        ] as const).map(s => (
          <div key={s.lbl} style={{ fontFamily:mono, fontSize:9, display:"flex", gap:5, alignItems:"baseline" }}>
            <span style={{ color:DIM, letterSpacing:1 }}>{s.lbl}</span>
            <span style={{ color:s.col }}>{s.val}</span>
          </div>
        ))}
        <div style={{ fontFamily:mono, fontSize:9, color:`${TEAL}80`, marginLeft:"auto" }}>── 4°C iso-density</div>
      </div>
    </div>
  );
}

/* ── Jump nav ─────────────────────────────────── */
const NAV = [
  { id: "s1", label: "Gradient Field" },
  { id: "s2", label: "Curvature" },
  { id: "s3", label: "Rainfall" },
  { id: "s4", label: "Chladni / Cymatics" },
  { id: "s5", label: "Emergent Spacetime" },
  { id: "s6", label: "Quaternion Water" },
  { id: "s7", label: "Warp Chamber" },
  { id: "s9", label: "Density Dynamics" },
];

/* ── Page ─────────────────────────────────────── */
function WaterDensityHeaderCanvas() {
  const ref = useRef<HTMLCanvasElement>(null);
  const rafRef = useRef(0);
  useEffect(() => {
    const canvas = ref.current; if (!canvas) return;
    const ctx = canvas.getContext("2d")!;
    canvas.width = 900; canvas.height = 145;
    const W = canvas.width, H = canvas.height;
    let t=0;
    const layers=5;
    const layerCols=["rgba(20,80,160,","rgba(30,100,180,","rgba(40,120,200,","rgba(60,150,220,","rgba(100,200,255,"];
    const draw=()=>{
      ctx.fillStyle="rgba(2,4,8,0.28)"; ctx.fillRect(0,0,W,H);
      for(let l=0;l<layers;l++){
        const y0=l*(H/layers),y1=(l+1)*(H/layers);
        const density=1-l/layers;
        ctx.fillStyle=layerCols[l]+`${0.05+density*0.1})`;
        ctx.fillRect(0,y0,W,y1-y0);
        ctx.beginPath();
        for(let x=0;x<=W;x+=4){
          const wave=y0+3*Math.sin(x*0.03+t*0.03+l*0.5);
          x===0?ctx.moveTo(x,wave):ctx.lineTo(x,wave);
        }
        ctx.strokeStyle=layerCols[l]+`${0.2+density*0.2})`;ctx.lineWidth=0.8;ctx.stroke();
      }
      ctx.fillStyle="rgba(100,200,255,0.3)"; ctx.font="9px 'DM Mono',monospace";
      ctx.fillText("WATER DENSITY · THERMOCLINE · HALOCLINE · PYCNOCLINE · OCEAN LAYERS · AETHER",14,14);
      t++; rafRef.current=requestAnimationFrame(draw);
    };
    draw();
    return ()=>cancelAnimationFrame(rafRef.current);
  },[]);
  return <canvas ref={ref} style={{width:"100%",height:"auto",borderRadius:8,display:"block"}} />;
}

export default function WaterDensityPage() {
  const [mode, setMode] = useState<CanvasMode>("gradient");

  return (
    <div style={{ background: BG, minHeight: "100vh", fontFamily: body, color: TEXT }}>
      {/* Hero */}
      <div style={{
        padding: "66px 28px 42px", textAlign: "center",
        background: "linear-gradient(180deg,#020d1a 0%,#020408 100%)",
        borderBottom: `1px solid ${BLUE}18`,
      }}>
        <div style={{ fontFamily: mono, fontSize: 10, color: BLUE, letterSpacing: 4, marginBottom: 12 }}>
          AETHER · FLUID DYNAMICS · DENSITY · EMERGENT GEOMETRY
        </div>
        <h1 style={{ fontFamily: serif, fontSize: "clamp(24px,5vw,46px)", color: "#fff", margin: "0 0 12px", letterSpacing: 2, lineHeight: 1.2 }}>
          WATER DENSITY<br /><span style={{ color: TEAL }}>DYNAMICS</span>
        </h1>
        <p style={{ fontFamily: body, fontSize: 17, color: DIM, maxWidth: 640, margin: "0 auto 26px", lineHeight: 1.75 }}>
          Surface gradient fields · Curvature of flow paths · Rainfall density on curved Earth ·
          Chladni acoustic patterns · Fluid analog gravity · Quaternion water framework ·
          Dark matter warp chambers
        </p>
        <div style={{ display: "flex", gap: 8, justifyContent: "center", flexWrap: "wrap" }}>
          <Chip c={BLUE}>v = −k∇h</Chip>
          <Chip c={TEAL}>Shallow Water Equations</Chip>
          <Chip c={AMBER}>Chladni · Cymatics</Chip>
          <Chip c={VIOLET}>Emergent Metric</Chip>
          <Chip c={GOLD}>Quaternion Burst</Chip>
        </div>
      </div>

      {/* Sticky nav */}
      <div style={{
        position: "sticky", top: 0, zIndex: 50,
        background: `${BG}f2`, backdropFilter: "blur(12px)",
        borderBottom: `1px solid ${BLUE}12`,
        padding: "8px 18px", display: "flex", gap: 4, overflowX: "auto",
      }}>
        {NAV.map(s => (
          <a key={s.id} href={`#${s.id}`} style={{
            fontFamily: mono, fontSize: 10, color: DIM, whiteSpace: "nowrap",
            padding: "4px 10px", borderRadius: 4, textDecoration: "none",
            border: "1px solid transparent", transition: "all 0.15s",
          }}
            onMouseEnter={e => { (e.target as HTMLElement).style.color = BLUE; (e.target as HTMLElement).style.borderColor = `${BLUE}30`; }}
            onMouseLeave={e => { (e.target as HTMLElement).style.color = DIM; (e.target as HTMLElement).style.borderColor = "transparent"; }}
          >{s.label}</a>
        ))}
      </div>

      <div style={{ maxWidth: 900, margin: "0 auto", padding: "0 22px 96px" }}>

        {/* Canvas */}
        <div style={{ marginTop: 36 }}>
          <ModeTabs value={mode} onChange={setMode} />
          <DensityCanvas mode={mode} />
          <div style={{ fontFamily: mono, fontSize: 9, color: DIM, marginTop: 6 }}>
            {mode === "gradient" && "BUMPY TERRAIN HEIGHT FIELD · WATER THICKNESS COLOR MAP · ANIMATED FLOW VECTORS = -k∇h"}
            {mode === "chladni" && "ACOUSTIC RESONANCE PATTERN · NODAL LINES ROTATE THROUGH CHLADNI MODES · PARTICLES SETTLE AT NODES"}
            {mode === "warp" && "SPACETIME GRID DISTORTED BY FLUID FLOW VORTEX · EMERGENT ANALOG GRAVITY METRIC"}
          </div>
        </div>

        {/* ── I — Gradient Field ── */}
        <SecHead id="s1" n="I" title="Surface Flow as a Gradient Field"
          sub="Water on any surface is a gradient descent machine — it always knows the local slope" col={BLUE} />

        <p style={{ fontFamily: body, fontSize: 16, lineHeight: 1.8, marginBottom: 18 }}>
          Water flowing across any surface — from a tilted pavement to a continental watershed —
          behaves as a gradient field. The flow velocity at any point is proportional to the negative
          gradient of the surface height function h(x,y). The surface <em>defines</em> the flow;
          there is no other information needed. This is not a model — it is a direct consequence
          of gravity and fluid mechanics.
        </p>

        <EQ>{`Surface flow as gradient field:
  v⃗ = −k∇h   [flow velocity = −k × local slope]

∇h = (∂h/∂x, ∂h/∂y) = gradient vector pointing uphill
→ −∇h points in the direction of steepest descent

Shallow water equations (Saint-Venant):
  ∂h/∂t + ∇·(hv⃗) = R − I        [mass conservation: rain R, infiltration I]
  ∂v⃗/∂t + (v⃗·∇)v⃗ = −g∇h − fv⃗   [momentum: gravity + friction f]

Manning's overland flow speed:
  v = (1/n) · h^(2/3) · S^(1/2)   [S = |∇h| = local slope]
  n = roughness coefficient (0.01 smooth concrete → 0.1 dense grass)

Thin-film (lubrication) limit:
  ∂h/∂t + ∇·(h³/3μ · ρg∇h) = 0   [dominating on bumpy pavement]`}</EQ>

        <Card title="WATER ON BUMPY PAVEMENT — THE CLASSIC DEMONSTRATION" col={BLUE}>
          Bumpy pavement is a perfect gradient field laboratory. Each bump creates a local high-point
          where water thins and spreads radially outward (divergence). Each depression is a local
          minimum where water thickens and converges (convergence). The <em>curvature</em> of the
          bumps determines whether flow lines converge, diverge, or form eddies.
          <br /><br />
          Flat areas between bumps produce linear, parallel flow lines. Concave depressions
          (negative curvature) act as attractors — all nearby flow funnels in. Convex bumps
          (positive curvature) act as repellers — flow diverges in all directions simultaneously.
        </Card>

        <Tbl
          headers={["Surface Feature", "Curvature", "Flow Behavior", "Water Thickness"]}
          accent={BLUE}
          rows={[
            ["Flat inclined plane", "κ = 0", "Uniform parallel flow, constant speed", "Uniform (Manning's law)"],
            ["Convex bump (dome)", "κ > 0", "Radial divergence from peak", "Thin over peak (fast flow)"],
            ["Concave depression", "κ < 0", "Radial convergence to center", "Thick in depression (pool)"],
            ["Saddle point", "Mixed κ", "Flow splits: two convergence zones, two divergence zones", "Variable — depends on direction"],
            ["Channel / groove", "κ ≫ 0 at walls", "Confined, accelerated flow along channel", "Deep in channel (deep = fast)"],
            ["Rough random surface", "Random κ", "Chaotic eddies, unpredictable splitting", "Highly variable, fractal boundaries"],
          ]}
        />

        {/* ── II — Curvature ── */}
        <SecHead id="s2" n="II" title="Curvature of the Flow Path"
          sub="How surface geometry bends water trajectories — the differential geometry of drainage" col={TEAL} />

        <EQ>{`2D flow path curvature (Frenet-Serret):
  r(s) = (x(s), y(s))   [path parameterized by arc length s]

  κ = |x'y'' − y'x''| / (x'² + y'²)^(3/2)

High κ → path bends sharply around bumps (high curvature obstacle)
Low  κ → smooth, nearly straight trajectory (open channel)

Thickness measurement across curved path:
  Δh = h_outer − h_inner
  → water is thicker on the outer edge of a curve (centrifugal effect)
  → gradient across the curve reveals curvature of substrate

Cross-section of water film (thin film equation):
  z = h(x,y,t)   [water surface height above substrate]
  h is larger in channels (depressions), smaller over bumps

Shallow film cross-section:
  Thin film over bump: h ~ h₀ · exp(−κ²/2σ²)
  Thick film in channel: h ~ h₀ + α/|∇∇h|`}</EQ>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(220px,1fr))", gap: 14, margin: "16px 0 24px" }}>
          {[
            { title: "CONVERGENCE ZONES", col: BLUE,
              desc: "Where flow lines converge — depressions, valleys, drainage channels — water thickens. Depth increases. Flow slows due to spreading out in the vertical dimension. Information density increases." },
            { title: "DIVERGENCE ZONES", col: TEAL,
              desc: "Over bumps, flow radiates outward in all directions. Water thins. Film becomes vanishingly thin over high spots. Flow actually accelerates as it slides down the bump face." },
            { title: "EDDY FORMATION", col: AMBER,
              desc: "Sharp changes in curvature cause separation: the flow detaches from the surface and creates recirculating eddies. These are the micro-vortices visible around pebbles on wet pavement." },
            { title: "CURVATURE → INFORMATION", col: VIOLET,
              desc: "The curvature κ(s) of the flow path is a direct readout of the substrate geometry. An observer who only measures water thickness h(s) can reconstruct the full curvature from second derivatives of h." },
          ].map(c => (
            <div key={c.title} style={{ background: `${c.col}08`, border: `1px solid ${c.col}25`, borderRadius: 8, padding: "12px 14px" }}>
              <div style={{ fontFamily: mono, fontSize: 10, color: c.col, marginBottom: 6 }}>{c.title}</div>
              <div style={{ fontFamily: body, fontSize: 13, color: TEXT, lineHeight: 1.65 }}>{c.desc}</div>
            </div>
          ))}
        </div>

        {/* ── III — Rainfall ── */}
        <SecHead id="s3" n="III" title="Rainfall Density Gradients on Curved Earth"
          sub="Accumulated water thickness as a function of position, curvature, and storm dynamics" col={AMBER} />

        <p style={{ fontFamily: body, fontSize: 16, lineHeight: 1.8, marginBottom: 18 }}>
          Rainfall doesn't fall uniformly — it accumulates as a thickness function W(x) that varies
          with position along a curved surface. The wetness gradient G = dW/ds (mm per meter of
          distance) is the primary observable that reveals the curvature of the underlying surface
          and the structure of the storm overhead.
        </p>

        <EQ>{`Accumulated water thickness along a curve:
  W(x) = ∫ R(x,t) dt   [integral of rainfall rate R(x,t) over time]

Rainfall intensity scale:
  Dry      W = 0 mm
  Trace    W = 0.1 mm
  Light    W = 1 mm
  Moderate W = 5 mm
  Heavy    W = 15 mm
  Very Heavy W ≥ 30 mm

Wetness gradient (primary observable):
  G = dW/ds ≈ ΔW/Δs   [mm per meter]
  Large G → sharp dry-to-wet transition → surface curvature gradient is steep

Cloud base height (Lifted Condensation Level):
  H ≈ 125 × (T − Td)
  H = cloud base height (m)
  T = air temperature (°C), Td = dew point (°C)
  Example: T=25°C, Td=17°C → H = 125 × 8 = 1000 m

Earth's surface curvature over distance d:
  C = d² / (2R) = d² / (2 × 6.37×10⁶ m)
  d = 10 km → C = 100×10⁶ / 12.74×10⁶ ≈ 7.85 m  (Earth curves away 7.85m per 10km)`}</EQ>

        <Card title="FLAT PLANE vs CURVED SURFACE — PERCEPTION DIFFERENCE" col={AMBER}>
          On an ideal flat plane, rainfall forms a perfectly even layer: ∂ρ/∂x = ∂ρ/∂y = 0.
          Droplet density is uniform everywhere. The air and substrate are cleaned uniformly.
          Plants receive equal moisture. Perception: calm, even, predictable.
          <br /><br />
          On a curved surface — including real Earth — curvature creates gradients even in
          "uniform" rainfall. Flow concentrates at low points. The wetness gradient G becomes
          a readout of the surface curvature. Perception: dynamic, directional, meaningful.
          Observation: <em>gradients reveal what the surface knows about itself.</em>
        </Card>

        <Card title="WHEN DO CLOUDS SETTLE? — THE STRAIGHT LINE QUESTION" col={TEAL}>
          The cloud base height H ≈ 125(T − Td) is approximately horizontal — a nearly straight
          line in the sky. But this line is most clearly defined in <em>stable conditions</em>:
          before a storm (stable atmosphere, moisture rising slowly) and after a storm
          (dissipating, air stabilizes). During a storm, updrafts, turbulence, and
          condensation instability erase the straight line. The cloud base becomes chaotic,
          lowering rapidly, then rebounding. The stability of the cloud base line is a direct
          atmospheric decoherence indicator.
        </Card>

        {/* ── IV — Chladni ── */}
        <SecHead id="s4" n="IV" title="Chladni Patterns · Cymatics · Acoustic Density Nodes"
          sub="Acoustic standing waves create periodic density structures in water and sand — the physics of Chladni figures" col={AMBER} />

        <p style={{ fontFamily: body, fontSize: 16, lineHeight: 1.8, marginBottom: 18 }}>
          The Chladni plate experiment (1787) is one of the most visually striking demonstrations
          of acoustic density dynamics: sprinkle sand on a vibrating metal plate, and the sand
          organizes itself into intricate geometric patterns — the nodal lines where vibration is
          zero. This is the acoustic equivalent of water flowing to depressions: particles migrate
          to the positions of minimum acoustic energy (zero displacement nodes).
        </p>

        <div style={{ display: "flex", gap: 20, flexWrap: "wrap", margin: "16px 0 20px", alignItems: "flex-start" }}>
          <img
            src={chladniImg}
            alt="Chladni plate showing 4-petal flower cymatics pattern"
            style={{
              borderRadius: 10, border: `1px solid ${AMBER}30`,
              maxWidth: "min(100%, 320px)", flex: "0 0 auto",
            }}
          />
          <div style={{ flex: 1, minWidth: 200 }}>
            <div style={{ fontFamily: mono, fontSize: 10, color: AMBER, letterSpacing: 2, marginBottom: 8 }}>
              CHLADNI PLATE · 4-PETAL MODE
            </div>
            <p style={{ fontFamily: body, fontSize: 14, color: TEXT, lineHeight: 1.7, margin: "0 0 12px" }}>
              This octagonal Chladni plate shows a 4-petal flower pattern — the (2,2) vibrational
              mode. The metallic particles have collected precisely along the nodal lines where
              the plate displacement is zero. The plate is vibrating at its (2,2) resonant
              frequency: two half-wavelengths fit along each axis simultaneously.
            </p>
            <EQ>{`Chladni figure equation (rectangular plate):
Z(x,y) = cos(mπx/L)·cos(nπy/L)
        + cos(nπx/L)·cos(mπy/L)

Nodal lines: Z = 0 (particles collect here)
Mode (2,2) → 4-petal flower
Mode (2,3) → star/asterisk form
Mode (3,4) → complex grid

Resonant frequency:
f_mn = (π/2) · √(D/ρh) · (m²/Lx² + n²/Ly²)`}</EQ>
          </div>
        </div>

        <Card title="WATER AS A CHLADNI MEDIUM — FARADAY WAVES" col={AMBER}>
          When water is vibrated vertically (Faraday, 1831), standing surface waves form
          that organize the water surface into the exact same Chladni patterns seen on solid plates.
          Water bridges, water domes, and star-shaped water structures form at specific frequencies.
          This is <em>cymatics</em> in the strict sense: sound organizing matter.
          <br /><br />
          The profound connection: water on a Chladni plate organizes into density nodes
          (thick water at low-vibration zones, thin water at antinodes) — the same physics
          as acoustic tweezers, the same physics as the acoustic standing-wave transport
          of stones through water, and the same mathematics as Chladni figure formation.
          The underlying equation is identical. The material changes; the geometry does not.
        </Card>

        <Tbl
          headers={["Mode (m,n)", "Pattern", "# Nodal Lines", "Application"]}
          accent={AMBER}
          rows={[
            ["(1,1)", "X cross", "2", "Lowest energy mode; simplest structure"],
            ["(2,2)", "4-petal flower (as shown)", "4", "Classic Chladni figure; high symmetry"],
            ["(2,3)", "Star/asterisk", "5", "Pentagonal-approximate; quasicrystal precursor"],
            ["(3,4)", "Complex grid", "7", "High-frequency; dense nodal network"],
            ["(4,5)", "Intricate web", "9", "Near-fractal structure at high frequencies"],
            ["Non-integer", "Quasicrystalline", "Aperiodic", "Penrose-like tiling; phononic crystal base"],
          ]}
        />

        {/* ── IV-b — Circular Chladni · Polar Mode ── */}
        <div style={{ marginTop: 32 }}>
          <div style={{ fontFamily: mono, fontSize: 10, color: AMBER, letterSpacing: 2, marginBottom: 6 }}>
            LIVE CIRCULAR CHLADNI  ·  FARADAY WAVE GEOMETRY IN WATER
          </div>
          <p style={{ fontFamily: body, fontSize: 14, color: TEXT, lineHeight: 1.75, margin: "0 0 16px", maxWidth: 680 }}>
            The rectangular plate formula Z = cos(mπx)cos(nπy) approximates square plates.
            Real cymbals, bowls, and water surfaces are <em>circular</em> — their eigenmodes use polar
            coordinates: <span style={{ fontFamily: mono, fontSize: 12, color: AMBER }}>u(r,θ) = sin(πmr) · cos(nθ)</span>.
            At <strong style={{ color: AMBER }}>426 Hz</strong> in water, Faraday waves form the exact
            3-fold flower below — n=3 azimuthal, m=1 radial. This is the ALL SFV cymatic reference pattern.
            Gold lines = nodes (water accumulates here). Teal regions = antinodes (water thrown outward).
          </p>
          <div style={{ display:"flex", gap:28, flexWrap:"wrap", alignItems:"flex-start" }}>
            <CircularChladniCanvas />
            <div style={{ flex:"1 1 260px", fontFamily: body, fontSize: 14, color: TEXT, lineHeight: 1.75 }}>
              <div style={{ fontFamily: mono, fontSize: 9, color: AMBER+"90", letterSpacing: 1, marginBottom: 10 }}>
                FREQUENCY → WATER SURFACE GEOMETRY
              </div>
              {[
                ["128 Hz", "n=0 m=1", "Simple concentric ring — lowest radial mode; water piles at one central node circle"],
                ["256 Hz", "n=0 m=2", "Double ring — two concentric node circles; water collects in two distinct bands"],
                ["426 Hz", "n=3 m=1", "3-fold flower — documented in ALL SFV research; Faraday wave petal structure"],
                ["512 Hz", "n=2 m=2", "X-star pattern — 2 azimuthal nodes + 2 radial rings; 4-fold symmetry"],
              ].map(([f, mode, desc]) => (
                <div key={f} style={{ marginBottom: 10, paddingLeft: 10, borderLeft: `2px solid ${AMBER}30` }}>
                  <span style={{ fontFamily: mono, fontSize: 10, color: AMBER }}>{f}</span>
                  {" · "}
                  <span style={{ fontFamily: mono, fontSize: 10, color: TEAL }}>{mode}</span>
                  {" — "}
                  <span style={{ color: DIM, fontSize: 13 }}>{desc}</span>
                </div>
              ))}
              <div style={{ marginTop: 14, padding:"10px 14px", background:`${AMBER}08`, border:`1px solid ${AMBER}20`, borderRadius:6, fontSize:13, color:DIM, lineHeight:1.7 }}>
                Faraday (1831): vibrate a water container vertically — the surface organizes into
                the same nodal geometry as a Chladni plate. The underlying math is identical.
                The medium changes; the geometry does not. See{" "}
                <span style={{ fontFamily:mono, fontSize:11, color:TEAL }}>
                  AETHER · Full Perceptive Universe
                </span>
                {" "}for the live bistable field version of this simulation.
              </div>
            </div>
          </div>
        </div>

        {/* ── V — Emergent Spacetime ── */}
        <SecHead id="s5" n="V" title="Emergent Spacetime from Fluid Dynamics"
          sub="Water flow doesn't just move through space — it creates the geometry it moves in" col={VIOLET} />

        <p style={{ fontFamily: body, fontSize: 16, lineHeight: 1.8, marginBottom: 18 }}>
          The deepest insight from fluid dynamics is that flowing water creates an effective
          spacetime geometry for any waves or disturbances propagating within it. Sound waves,
          surface waves, and light-like disturbances in a flowing fluid experience the fluid
          velocity field as a curved spacetime metric. This is not analogy — the mathematics
          are identical to general relativity, with the flow velocity playing the role of the
          gravitational field.
        </p>

        <EQ>{`Effective metric from fluid flow (acoustic metric):
  ds² = −(c²−v²)dt² − 2v⃗·dx⃗ dt + dx⃗²

where:
  c = local wave speed (speed of sound in fluid)
  v⃗ = fluid velocity vector

This is mathematically identical to the Schwarzschild metric for a black hole
when v = c → the "acoustic horizon" (no wave can escape upstream)

Effective metric from surface flow:
  g_μν ≈ η_μν + f(∇h, ∇²h)
  = flat spacetime + corrections from height gradient and curvature

Emergent Spacetime Engine — 4 layers:
  1. Substrate geometry    h(x,y) — the physical surface
  2. Fluid dynamics        v⃗ = −k∇h — the flow
  3. Effective metric      g_μν from flow — the geometry
  4. Emergent experience   waves, particles, information shaped by g_μν

Dynamics → Geometry → Perception
  "The engine of reality is not empty space, but relational flow."
  "Reality is not a place. It is a process. We do not observe the universe. We ride its flow."`}</EQ>

        <Card title="ANALOG BLACK HOLES IN WATER" col={VIOLET}>
          An acoustic (sonic) black hole in water can be created in the laboratory: arrange a
          flowing water system so that the flow speed increases from below the speed of sound
          (in the fluid) to above it across a boundary. Surface wave disturbances on the supersonic
          side cannot propagate upstream — exactly analogous to light unable to escape a
          gravitational black hole's event horizon.
          <br /><br />
          Hawking radiation — quantum radiation predicted to emanate from black holes — has been
          observed in analog water-flow black holes (Weinfurtner et al., 2011). Water density
          dynamics, taken seriously as a field equation, reproduce the major predictions of
          general relativity.
        </Card>

        {/* ── VI — Quaternion Water ── */}
        <SecHead id="s6" n="VI" title="Q~AETHER · Quaternion & Octonion Water Framework"
          sub="Mapping hyper-complex algebra to water density instabilities and the Control Alphabet" col={GOLD} />

        <p style={{ fontFamily: body, fontSize: 16, lineHeight: 1.8, marginBottom: 18 }}>
          Quaternions are four-dimensional numbers: q = a + bi + cj + dk, where
          i² = j² = k² = ijk = −1 and ij = −ji (non-commutative). In the Q~AETHER
          framework, water flow on a surface undergoes a quaternionic instability sequence
          when local permutation entropy (LPE) exceeds 0.6: the system transitions from
          stable laminar flow (real-axis focus) through rotational loading and algebraic burst
          into a phase-restabilization event.
        </p>

        <EQ>{`Quaternion definition:
  q = a + bi + cj + dk   [i² = j² = k² = ijk = −1, non-commutative]

Steady state (real-axis flow):
  q = a + 0i + 0j + 0k   [stable laminar flow, linear time progression]

Quaternion instability sequence:
  1. COHERENT TRAJECTORY: q on real axis, stable 8–15mm levitation gap
  2. ROTATIONAL LOADING: minor turbulence, phase-locked loop tracking
  3. ALGEBRAIC BURST: LPE > 0.6 → high-frequency kinetic shear wave burst
  4. PHASE RESTABILIZATION: waveform inversion, visual distortion cancels

Burst condition:
  |LPE| > 0.6 → non-linear multiplier on imaginary coefficients
  → geometric deformation of flow field
  → EM pulse emission (VHF, 30–300 MHz)

Octonion extension (8D manifold):
  Adds e₁, e₂, e₃, e₄ to standard quaternion basis
  Metric collapse when det(g_μν) → 0 → redistribution of information
  across the manifold (topological pinch)

Control Alphabet interventions:
  ~ (OSCILLATE)  Match incoming vortex frequency to stabilize boundary
  o (MEASURE)    Compute live entropy flux tensor J_s
  n (PERTURB)    Fire phase-locked VHF pulse (30–300 MHz) to alter fluid matrix
  S (VALIDATE)   Engage BaTiO₃ mirror for wavefront inversion & distortion cancel`}</EQ>

        <Tbl
          headers={["Phase State", "Algebraic Domain", "Water Analog", "Observable"]}
          accent={GOLD}
          rows={[
            ["Coherent Trajectory", "Real axis q ∈ ℝ", "Laminar flow, uniform film thickness", "Smooth flow lines, even water surface"],
            ["Rotational Loading", "Imaginary rotation i,j,k", "Onset turbulence, vortex formation", "Eddies appear, film thickness oscillates"],
            ["Algebraic Burst", "Non-commutative saturation", "High-frequency shear wave burst", "Spray, cavitation, localized thinning"],
            ["Phase Restabilization", "Real complex conjugate q*", "Return to laminar flow via waveform inversion", "Flow smooths; phase-conjugate wavefront"],
            ["Quaternion Burst", "LPE > 0.6 threshold", "Kinetic energy unloaded as EM pulse", "VHF emission, optical refraction change"],
          ]}
        />

        <Card title="ANALOG CONTAINMENT OF A QUATERNION BURST" col={GOLD}>
          The Q~AETHER framework proposes that quaternion algebraic instabilities in physical
          water can be measured and contained using a 3-layer system:
          <ul style={{ paddingLeft: 20, margin: "8px 0", lineHeight: 2 }}>
            <li><strong style={{ color: BLUE }}>Layer 1: High-Speed Optical Sensor Array</strong> — real-time ordinal slicing of flow field, capturing t_inner/t_outer time fragmentation</li>
            <li><strong style={{ color: TEAL }}>Layer 2: Non-Linear Fluid Dissipation Medium</strong> — absorbs high-frequency shear waves, dumps kinetic impact into thermal modes</li>
            <li><strong style={{ color: VIOLET }}>Layer 3: Phase-Conjugate Mirror (BaTiO₃)</strong> — phase-conjugate inversion cancels wavefront distortion; waveform is retro-reflected</li>
          </ul>
          The Control Alphabet operators (~, o, n, S) act as the control interface for this
          3-layer system — matching the same operators defined in the Grand Unified Framework.
        </Card>

        {/* ── VI-b — Quaternion ↔ Hopfion Unification ── */}
        <div style={{ marginTop: 36 }}>
          <div style={{ fontFamily: mono, fontSize: 10, color: GOLD, letterSpacing: 2, marginBottom: 6 }}>
            QUATERNION BURST  ↔  HOPFION BURST  ·  THE SAME TOPOLOGY
          </div>
          <p style={{ fontFamily: body, fontSize: 15, color: TEXT, lineHeight: 1.8, marginBottom: 16, maxWidth: 700 }}>
            The quaternion algebraic burst described above (LPE {'>'} 0.6 → shear wave detonation → phase
            restabilization) is not merely analogous to a topological Hopfion burst — it <em>is</em> the
            same event expressed in two different mathematical languages. The threshold numbers match:
            {" "}<span style={{ fontFamily: mono, fontSize: 12, color: GOLD }}>LPE {'>'} 0.6  ≡  C {'>'} φ⁻¹ = 0.618034</span>.
            One describes the entropy of a water flow field; the other describes the bifurcation
            threshold of the Allen-Cahn coherence field. Same transition, different coordinates.
          </p>

          <div style={{ overflowX:"auto", margin:"0 0 20px" }}>
            <table style={{ width:"100%", borderCollapse:"collapse", fontFamily:body, fontSize:13 }}>
              <thead>
                <tr style={{ borderBottom:`1px solid ${GOLD}35` }}>
                  {["Phase","Water Q~AETHER (Section VI)","Perceptive Universe (Hopfion)","Threshold"].map((h,i) => (
                    <th key={i} style={{ fontFamily:mono, fontSize:9, color:GOLD, textAlign:"left", padding:"6px 10px", letterSpacing:1 }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {[
                  ["1 — Coherent", "Real-axis flow, stable laminar, 8–15mm levitation gap", "|α⟩ coherent knot, Ψ localised at origin", "LPE < 0.3  ·  C < 0.38"],
                  ["2 — Rotational", "Imaginary rotation i,j,k — onset turbulence, eddy formation", "Squeeze operator Ŝ(ζ) elongates Wigner function", "LPE 0.3–0.6  ·  C 0.38–0.618"],
                  ["3 — Decoherence", "High-frequency shear wave precursor, film thickness oscillates", "Lindblad ℒ[ρ] spreads coherence to environment", "LPE → 0.6  ·  C → φ⁻¹"],
                  ["4 — Burst", "ALGEBRAIC BURST: LPE > 0.6 → EM pulse 30–300 MHz", "ΔQ_Hopf ≠ 0 — topological charge jumps", "LPE > 0.6  ·  C > 0.618"],
                  ["5 — Restabilize", "Phase-conjugate mirror inversion, waveform cancels distortion", "New stable topology n=6 flower, energy redistributed", "LPE → 0  ·  C → 1"],
                ].map((row,ri) => (
                  <tr key={ri} style={{ borderBottom:"1px solid #ffffff06", background:ri%2===0?"#ffffff02":"transparent" }}>
                    {row.map((c,ci) => (
                      <td key={ci} style={{ padding:"8px 10px", color: ci===3?GOLD:TEXT, verticalAlign:"top", fontFamily:ci===3?mono:body, fontSize:ci===3?10:13 }}>{c}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div style={{ display:"flex", gap:24, flexWrap:"wrap", alignItems:"flex-start" }}>
            <div>
              <div style={{ fontFamily:mono, fontSize:9, color:GOLD+"80", letterSpacing:1, marginBottom:8 }}>
                LIVE HOPFION BURST  ·  SAME 5-PHASE CYCLE
              </div>
              <HopfionBurstCanvas />
            </div>
            <div style={{ flex:"1 1 260px" }}>
              <div style={{ fontFamily:mono, fontSize:9, color:GOLD+"80", letterSpacing:1, marginBottom:10 }}>
                WHY THE NUMBERS MATCH
              </div>
              {[
                { col:GOLD, title:"φ⁻¹ = 0.618034", body:"The golden ratio inverse is the fixed point of the logistic map and the bifurcation threshold for period-doubling. It appears in both LPE (information-theoretic) and Allen-Cahn (energy-landscape) descriptions of the same instability." },
                { col:VIOLET, title:"Topological charge ΔQ_Hopf", body:"When LPE exceeds φ⁻¹, the water vortex field undergoes a topological re-routing identical to a Hopfion knot changing its winding number. The burst is a topological phase transition — not just a fluid event." },
                { col:TEAL, title:"EM pulse = quantum coherence burst", body:"The VHF emission (30–300 MHz) observed at LPE > 0.6 corresponds to the decoherence emission ℒ[ρ] in the quantum Lindblad framework — energy escaping from the collapsing coherent state into the environment." },
                { col:BLUE, title:"Control Alphabet = field operators", body:"The ~ · o · n · S control operators in Q~AETHER map directly to the quantum optical tools: squeezing (Ŝ), measuring (observable ⟨n⟩), perturbation (displacement D̂), and phase-conjugate validation (mirror)." },
              ].map(c => (
                <div key={c.title} style={{ marginBottom:10, padding:"10px 14px", background:`${c.col}08`, border:`1px solid ${c.col}22`, borderRadius:6 }}>
                  <div style={{ fontFamily:mono, fontSize:9, color:c.col, marginBottom:5 }}>{c.title}</div>
                  <div style={{ fontFamily:body, fontSize:13, color:DIM, lineHeight:1.7 }}>{c.body}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── VII — Warp Chamber ── */}
        <SecHead id="s7" n="VII" title="Warping Space Fabric via Dark Matter Oscillation"
          sub="Commercial warp transport chambers using coherent dark matter wave synchronization through fluid media" col={ROSE} />

        <p style={{ fontFamily: body, fontSize: 16, lineHeight: 1.8, marginBottom: 18 }}>
          Space fabric is composed of dynamic oxygen-based structures, constantly shifting with
          atmospheric and thermal variation. By precisely combusting select oxygen states and
          synchronizing with the coherent oscillation of dark matter fabric waves, a localized
          stable warp field can be induced. Water — as the universe's dimensionally neutral
          medium — is the ideal pressure chamber fluid for this process.
        </p>

        <EQ>{`Warp chamber system architecture:
  A. Oxygen Combustion Control Unit       → variable O₂ states in space fabric
  B. Coherent Wave Synchronizer           → locks to stable dark matter oscillation
  C. Light Interaction Array              → multi-frequency lattice interacts with substrate
  D. Substrate Matrix Lining              → specialized materials stabilize warp field
  E. Pressure Field Shell                 → maintains field integrity under extreme stress
  F. Field Conduit Core                   → contains object in space-time bubble

Time transport 4-step sequence:
  1. ENCLOSE    Object sealed in pressure chamber, field stabilized
  2. ISOLATE    Local space-time region isolated from external reference frame
  3. PHASE SHIFT (ΔT)  Chamber's time coordinate shifted by ΔT = t_target − t_current
  4. RE-INTEGRATE  Field re-attaches to space-time at new time coordinate
                   Object emerges at t_target instantaneously

Key principles:
  Coherent dark matter wave  → stable warp generation foundation
  Space-time isolation       → prevents decoherence during phase shift
  Time phase shift           → isolated region changes time coordinate
  Mass preservation          → mass, momentum, structure intact through process`}</EQ>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(220px,1fr))", gap: 12, margin: "16px 0 24px" }}>
          {[
            { title: "WATER AS CHAMBER MEDIUM", col: BLUE,
              desc: "Water's multi-ring superposition state (ψ_water) makes it the optimal pressure chamber fluid. Its dimensionless state accepts the warp field without ring-layer resistance, and its Φ-spacing prevents resonance catastrophe during the isolation phase." },
            { title: "OXYGEN COMBUSTION CONTROL", col: AMBER,
              desc: "Variable atmospheric oxygen is combusted in precise bursts to excite the space fabric filament. The combustion product must match the oscillation frequency of the local dark matter wave. Real-time atmospheric O₂ monitoring is required." },
            { title: "COHERENT WAVE SYNC", col: VIOLET,
              desc: "The dark matter wave oscillation frequency at any location is derived from the local gravity crystal lattice parameter. In water-bearing environments, the water-over-quartz D8 generation provides a continuous reference signal for synchronization." },
            { title: "WATER DENSITY FEEDBACK", col: ROSE,
              desc: "As the warp field activates, the water density in the chamber changes measurably. The density gradient ∇ρ_water is the primary sensor output. Sharp density gradients indicate successful space-time isolation. Even gradients = docked state." },
          ].map(c => (
            <div key={c.title} style={{ background: `${c.col}09`, border: `1px solid ${c.col}28`, borderRadius: 8, padding: "12px 14px" }}>
              <div style={{ fontFamily: mono, fontSize: 10, color: c.col, marginBottom: 6 }}>{c.title}</div>
              <div style={{ fontFamily: body, fontSize: 13, color: TEXT, lineHeight: 1.65 }}>{c.desc}</div>
            </div>
          ))}
        </div>

        <Tbl
          headers={["Capability", "Scale", "Application", "Water Density Role"]}
          accent={ROSE}
          rows={[
            ["Small mass transport", "kg–tonne", "Industrial logistics, instant delivery", "Chamber fluid maintains coherence"],
            ["Disaster prevention", "Structure scale", "Move buildings before catastrophic events", "Water density gradient = warp status sensor"],
            ["Space exploration", "Vessel scale", "Time-window travel to target coordinates", "Vacuum-stable water analog required"],
            ["Planetary engineering", "Mountain/ocean scale", "Terraforming, continental reshaping", "Oceanic water = planetary warp medium"],
            ["Interstellar mass transport", "Planetary scale", "Move asteroid-scale mass across cosmic distances", "Dark matter + water field coupling at scale"],
          ]}
        />

        {/* ── VIII — Allen-Cahn Bridge ── */}
        <div id="s8" style={{ marginTop: 64, scrollMarginTop: 80 }}>
          <div style={{ fontFamily: mono, fontSize: 10, color: TEAL, letterSpacing: 3, marginBottom: 6 }}>VIII</div>
          <h2 style={{ fontFamily: serif, fontSize: 26, color: "#fff", margin: "0 0 4px", letterSpacing: 1 }}>
            Allen-Cahn Bridge · Water as Coherence Field
          </h2>
          <div style={{ fontFamily: body, fontSize: 15, color: DIM, marginBottom: 20 }}>
            Unifying water density dynamics, cosmic field coherence, and the perceptive universe under one equation
          </div>
          <div style={{ height: 1, background: `linear-gradient(90deg,${TEAL}60,transparent)`, marginBottom: 28 }} />
        </div>

        <p style={{ fontFamily: body, fontSize: 16, lineHeight: 1.8, marginBottom: 18 }}>
          The Allen-Cahn equation was derived in 1979 to model phase separation in metal alloys —
          but it describes the same dynamics as water at 4°C, as cosmic field coherence, and as
          every bistable system that exists. The coherence field C(x,t) ∈ [0,1] that runs
          through the Perceptive Universe simulation is water density written in field language.
          They are the same equation. The same threshold. The same burst.
        </p>

        <EQ>{`Allen-Cahn equation (unified form):
  ∂C/∂t = ε²∇²C − V'(C)

Bistable potential (double-well):
  V(C) = −C²/2 + C⁴/4   →   V'(C) = −C + C³ = C(C−1)(C+1)

Fixed points: C* = 0 (decoherent)   C* = ±1 (coherent)
Bifurcation threshold: C = φ⁻¹ = 0.618034

Water density analog:
  C(x,t) → ρ_water(x,y,t) / ρ_max       [normalized density]
  ε²∇²C  → diffusion of density gradient ∇ρ
  V'(C)  → restoring force toward 4°C maximum density

Temperature → coherence mapping:
  T = 0°C  (ice)     →  C = 0.92  (coherent, ordered lattice)
  T = 4°C  (max ρ)   →  C = 1.00  (maximum coherence: ρ = 999.97 kg/m³)
  T = 20°C (warm)    →  C = 0.76  (partial coherence)
  T = 40°C (hot)     →  C = 0.55  (approaching bifurcation — C < φ⁻¹)
  T = 60°C (near bp) →  C = 0.38  (low coherence — rapid density drop)
  T = 100°C (vapor)  →  C = 0.00  (fully decoherent — phase transition)

Threshold crossing:
  C drops below φ⁻¹ = 0.618  →  bistable restoring force reverses sign
  →  system cannot return to coherent well under normal conditions
  →  external perturbation required (cooling, pressure, phase-conjugation)`}</EQ>

        <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(240px,1fr))", gap:12, margin:"20px 0 28px" }}>
          {[
            { col:TEAL, title:"C(x,t) = ρ_water / ρ_max",
              body:"Normalizing water density to its 4°C maximum gives the Allen-Cahn coherence field exactly. Dense, cold water = coherent (C→1). Warm, thin water = decoherent (C→0). The field obeys the same bistable dynamics in both interpretations." },
            { col:AMBER, title:"φ⁻¹ = 0.618 = LPE 0.6 threshold",
              body:"The φ⁻¹ coherence bifurcation threshold from the Allen-Cahn model matches the LPE > 0.6 burst threshold from the Q~AETHER quaternion framework. Both are measuring the same topological instability — just in different coordinate systems." },
            { col:VIOLET, title:"Domain walls = phase boundaries",
              body:"Allen-Cahn domain walls — thin transition zones between C=0 and C=1 — are precisely the ice-water and water-vapor phase boundaries. Their width ε sets the sharpness of the transition: small ε = sharp boundary (cold day); large ε = diffuse interface (warm fog)." },
            { col:BLUE, title:"ε²∇²C = density diffusion",
              body:"The Laplacian term ε²∇²C drives the density field toward local uniformity. In water, this is thermal diffusion spreading heat (and therefore density) through the fluid. High ε = fast diffusion (warm water); low ε = slow diffusion (cold, viscous water near 0°C)." },
            { col:GREEN, title:"V(C) = Gibbs free energy",
              body:"The bistable potential V(C) = −C²/2 + C⁴/4 is the Landau-Ginzburg free energy of water at its phase transition. The two wells at C=±1 correspond to the two stable phases (liquid water, ice). The barrier at C=0 is the activation energy for phase change." },
            { col:ROSE, title:"Faraday waves = C(x,t) modulation",
              body:"When water is vibrated acoustically (Faraday, Chladni), the surface height η(x,t) modulates the density field ρ_water. Nodes (zero displacement) = high density (C→1). Antinodes (maximum displacement) = low density (C→0). The cymatic pattern is the coherence field." },
          ].map(c => (
            <div key={c.title} style={{ background:`${c.col}08`, border:`1px solid ${c.col}22`, borderRadius:8, padding:"13px 16px" }}>
              <div style={{ fontFamily:mono, fontSize:9, color:c.col, letterSpacing:1, marginBottom:6 }}>{c.title}</div>
              <div style={{ fontFamily:body, fontSize:13, color:DIM, lineHeight:1.7 }}>{c.body}</div>
            </div>
          ))}
        </div>

        <div style={{ padding:"18px 22px", background:`${TEAL}08`, border:`1px solid ${TEAL}22`, borderRadius:8, marginBottom:20 }}>
          <div style={{ fontFamily:mono, fontSize:10, color:TEAL, letterSpacing:2, marginBottom:10 }}>
            THE UNIFIED CHAIN  ·  WATER → FIELD → COSMOS
          </div>
          <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(200px,1fr))", gap:10 }}>
            {[
              ["Water density ρ(x,y,t)", "Allen-Cahn C(x,t)", "C = ρ/ρ_max"],
              ["4°C density maximum", "Coherent well C=1", "ρ = 999.97 kg/m³"],
              ["Faraday nodal geometry", "Chladni polar mode", "u(r,θ) = sin(πmr)cos(nθ)"],
              ["LPE > 0.6 quaternion burst", "C > φ⁻¹ Allen-Cahn burst", "Same topological transition"],
              ["Phase-conjugate mirror", "Time-reversal operator T̂", "Lindblad restabilization"],
              ["Acoustic metric ds²", "γ(C) time dilation", "Dense water = slow clocks"],
            ].map(([a,b,eq]) => (
              <div key={a} style={{ fontFamily:body, fontSize:12, lineHeight:1.6 }}>
                <span style={{ color:BLUE }}>{a}</span>
                <span style={{ color:DIM }}> = </span>
                <span style={{ color:TEAL }}>{b}</span>
                <br />
                <span style={{ fontFamily:mono, fontSize:9, color:GOLD }}>{eq}</span>
              </div>
            ))}
          </div>
        </div>

        {/* ── IX — Water Density Dynamics Simulator ── */}
        <div id="s9" style={{ marginTop: 64, scrollMarginTop: 80 }}>
          <div style={{ fontFamily: mono, fontSize: 10, color: TEAL, letterSpacing: 3, marginBottom: 6 }}>IX</div>
          <h2 style={{ fontFamily: serif, fontSize: 26, color: "#fff", margin: "0 0 4px", letterSpacing: 1 }}>
            Water Density Dynamics · Live Simulator
          </h2>
          <div style={{ fontFamily: body, fontSize: 15, color: DIM, marginBottom: 20 }}>
            2-D Boussinesq convection driven by the real Kell (1975) ρ(T) polynomial · anomalous 4°C maximum density
          </div>
          <div style={{ height: 1, background: `linear-gradient(90deg,${TEAL}60,transparent)`, marginBottom: 28 }} />
        </div>

        <p style={{ fontFamily: body, fontSize: 16, lineHeight: 1.8, marginBottom: 16 }}>
          The simulator below integrates a 2-D temperature field at 120 × 55 cells using explicit finite-difference
          diffusion plus a Rayleigh-Taylor buoyancy swap at each column. Density is computed from the{" "}
          <span style={{ color: TEAL }}>Kell (1975) polynomial</span> — the same formula used in NIST metrology — giving ρ(T)
          accurate to ± 0.003 kg/m³ across 0–100 °C. The glowing cyan contour marks the{" "}
          <span style={{ color: TEAL }}>4 °C iso-density line</span> where water reaches its maximum density of 999.97 kg/m³ —
          the anomaly that lets ice float and drives deep-ocean thermohaline circulation.
        </p>

        <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(220px,1fr))", gap:10, marginBottom:24 }}>
          {[
            { col:TEAL,   title:"ρ · DENSITY mode", body:"Color encodes the Kell density field. Cyan = 4 °C maximum-density core. Amber = warm, low-density water. Cold anomaly zone (0–4 °C) glows ice-blue — denser than room-temp water but lighter than 4 °C water." },
            { col:AMBER,  title:"T · THERMAL mode",  body:"Classic thermal colormap — blue is cold, red is hot. Watch convection plumes rise on the warm side and cold fingers descend on the cool side. Set both walls to the same temperature for still, diffusion-only dynamics." },
            { col:VIOLET, title:"↕ · BUOYANCY mode", body:"Color shows buoyancy relative to the 4 °C density maximum. Teal = near-neutral (dense, near ρ_max). Orange = light, rising. Ice-blue = cold anomaly region — lighter than 4 °C despite being colder." },
            { col:GREEN,  title:"Left-click = heat · Right-click = cool", body:"Paint heat or cold directly onto the field. Try creating a hot spot in the middle and watch cold fingers split around it. Or cool the top layer to trigger a downwelling avalanche." },
          ].map(c => (
            <div key={c.title} style={{ background:`${c.col}08`, border:`1px solid ${c.col}22`, borderRadius:8, padding:"12px 15px" }}>
              <div style={{ fontFamily:mono, fontSize:9, color:c.col, letterSpacing:1.5, marginBottom:6 }}>{c.title}</div>
              <div style={{ fontFamily:body, fontSize:13, color:DIM, lineHeight:1.65 }}>{c.body}</div>
            </div>
          ))}
        </div>

        <WaterDensityDynamicsCanvas />

        <EQ>{`Kell (1975) density polynomial — same as NIST water tables:
  ρ(T) = 999.842594 + 6.793952×10⁻² T − 9.095290×10⁻³ T²
        + 1.001685×10⁻⁴ T³ − 1.120083×10⁻⁶ T⁴ + 6.536332×10⁻⁹ T⁵

  ρ_max = 999.97 kg/m³  at  T = 3.98 °C

Boussinesq buoyancy condition (Rayleigh-Taylor instability check):
  if  ρ[i+1, col] < ρ[i, col] − δ  →  swap parcels (fluid overturn)

Allen-Cahn coherence field (from Section VIII):
  C(x,t) = ρ(T) / ρ_max  →  C = 1.00 at 4 °C  |  C = 0.00 at 100 °C`}</EQ>

        <div style={{ display:"flex", gap:20, flexWrap:"wrap", marginTop:8, padding:"14px 18px", background:`${TEAL}06`, border:`1px solid ${TEAL}18`, borderRadius:8 }}>
          {[
            ["0 °C",   "999.84 kg/m³", "ice-point — anomaly starts here"],
            ["4 °C",   "999.97 kg/m³", "absolute maximum — all structure points here"],
            ["20 °C",  "998.20 kg/m³", "room temperature — C = 0.998"],
            ["40 °C",  "992.22 kg/m³", "warm bath — 7.75 kg/m³ below max"],
            ["100 °C", "958.37 kg/m³", "boiling point — C = 0.958"],
          ].map(([t,rho2,note]) => (
            <div key={t} style={{ fontFamily:mono, fontSize:9 }}>
              <span style={{ color:TEAL }}>{t}</span>
              <span style={{ color:BLUE, marginLeft:8 }}>{rho2}</span>
              <span style={{ color:DIM, marginLeft:8 }}>{note}</span>
            </div>
          ))}
        </div>

        {/* Summary */}
        <div style={{
          marginTop: 48, padding: "22px 24px",
          background: "#ffffff04", border: `1px solid ${BLUE}18`,
          borderRadius: 10, textAlign: "center",
        }}>
          <div style={{ fontFamily: serif, fontSize: 16, color: TEAL, marginBottom: 8 }}>
            FROM PAVEMENT TO SPACETIME · THE CHAIN
          </div>
          <div style={{ fontFamily: mono, fontSize: 11, color: DIM, lineHeight: 2.2, letterSpacing: 0.5 }}>
            Gradient → Flow → Curvature → Dynamics → Geometry → Perception → Reality
          </div>
          <div style={{ fontFamily: body, fontSize: 15, color: DIM, lineHeight: 1.75, marginTop: 12 }}>
            Water on bumpy pavement is the universe's most accessible spacetime simulator.
            The same equations that describe a droplet navigating a cobblestone describe
            a wormhole forming in the fluid of spacetime. The surface is different.
            The gradient is the same.
          </div>
          <div style={{ fontFamily: mono, fontSize: 10, color: `${DIM}80`, marginTop: 12 }}>
            AETHER Framework · Shia Miller @StrategicProce
          </div>
        </div>
      </div>
    </div>
  );
}
