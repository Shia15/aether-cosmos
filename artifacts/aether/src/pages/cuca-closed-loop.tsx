import { useCallback, useEffect, useRef, useState } from "react";

// ── Constants ─────────────────────────────────────────────────────────────────
const PHI      = (1 + Math.sqrt(5)) / 2;
const PHI2     = PHI * PHI;           // φ² ≈ 2.618
const GOLDEN   = 2 * Math.PI / PHI2; // 137.508°
const N_PLANTS = 55;                  // Fibonacci number

// AETHER CUCA vegetables (highest-coherence)
const VEGS = [
  { name:"Romanesco",  col:"#86efac", glow:"#22c55e", λ:450 },
  { name:"Kale",       col:"#4ade80", glow:"#16a34a", λ:440 },
  { name:"Spinach",    col:"#22c55e", glow:"#15803d", λ:445 },
  { name:"Carrot",     col:"#fb923c", glow:"#ea580c", λ:470 },
  { name:"Beet",       col:"#f472b6", glow:"#db2777", λ:430 },
  { name:"Tomato",     col:"#ef4444", glow:"#dc2626", λ:455 },
];

// CUCA 4-layer stack
const LAYERS = [
  { id:"photon",    label:"Photon Layer",         desc:"Incident light-medium",                col:"#fbbf24" },
  { id:"exciton",   label:"Exciton Layer",         desc:"Quantum-entangled photosynthesis",     col:"#06b6d4" },
  { id:"granular",  label:"Granular Pigment Layer",desc:"Soil-to-root diffusion",               col:"#22c55e" },
  { id:"biofeed",   label:"Bio-Feedback Layer",    desc:"Plant → robot → spiral resonance",    col:"#c084fc" },
];

// Robot nodes in the CUCA swarm
const ROBOTS = [
  { name:"SpiralHarvester-φA", col:"#38bdf8", glyph:"◉" },
  { name:"SpiralHarvester-φB", col:"#34d399", glyph:"◆" },
  { name:"WaveCoherence-Ψ1",   col:"#fbbf24", glyph:"✦" },
  { name:"WaveCoherence-Ψ2",   col:"#c084fc", glyph:"⟳" },
];

function plantPos(i: number, R: number, cx: number, cy: number) {
  const r   = R * Math.sqrt((i + 1) / N_PLANTS);
  const ang = i * GOLDEN;
  return { x: cx + r * Math.cos(ang), y: cy + r * Math.sin(ang), ang };
}

// CUCA photosynthesis coherence operator P_photo
function cucaPhoto(λ_peak: number): number {
  const a1 = Math.exp(-((λ_peak - 430) ** 2) / (50 ** 2)); // Chl
  const a2 = Math.exp(-((λ_peak - 662) ** 2) / (50 ** 2)); // Car
  return PHI2 * 0.998 * (a1 + a2);                          // η = 99.8%
}

// ── Canvas draw ───────────────────────────────────────────────────────────────
interface Photon { x: number; y: number; vx: number; vy: number; life: number; col: string }
interface Exciton { x: number; y: number; r: number; maxR: number; alpha: number; col: string }
interface PigmentStream { x: number; y: number; vx: number; vy: number; life: number; alpha: number }

function drawCUCA(
  canvas: HTMLCanvasElement,
  t: number,
  photons: Photon[],
  excitons: Exciton[],
  streams: PigmentStream[],
  loopClosure: number,
  coherence: number,
) {
  const ctx = canvas.getContext("2d")!;
  const W = canvas.width, H = canvas.height;
  const cx = W / 2, cy = H / 2;
  const R = Math.min(W, H) * 0.44;

  ctx.clearRect(0, 0, W, H);
  ctx.fillStyle = "rgb(2,8,18)";
  ctx.fillRect(0, 0, W, H);

  // ── Toroidal loop glow (CUCA closed loop) ──
  const grad = ctx.createRadialGradient(cx, cy, R * 0.3, cx, cy, R * 1.1);
  grad.addColorStop(0, "rgba(0,255,136,0)");
  grad.addColorStop(0.6, `rgba(0,255,136,${0.015 * loopClosure})`);
  grad.addColorStop(1, "rgba(0,255,136,0)");
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, W, H);

  // ── Fibonacci golden spiral guide ──
  ctx.beginPath();
  for (let i = 0; i < N_PLANTS * 2; i++) {
    const a  = i * GOLDEN;
    const rr = R * Math.sqrt((i + 1) / (N_PLANTS * 2));
    const x  = cx + rr * Math.cos(a), y = cy + rr * Math.sin(a);
    i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
  }
  ctx.strokeStyle = "rgba(0,255,136,0.05)";
  ctx.lineWidth = 1; ctx.stroke();

  // ── Coherence rings ──
  for (let ring = 1; ring <= 5; ring++) {
    const rr    = R * ring / 5;
    const pulse = 0.04 + 0.02 * Math.sin(t * 0.018 + ring * 0.9) * coherence;
    ctx.beginPath();
    ctx.arc(cx, cy, rr, 0, Math.PI * 2);
    ctx.strokeStyle = `rgba(0,255,136,${pulse})`;
    ctx.lineWidth = ring === 5 ? 1.5 : 0.8;
    ctx.stroke();
  }

  // ── Bio-feedback toroidal arrows (outer ring) ──
  if (loopClosure > 0.4) {
    const N_ARROWS = 8;
    for (let a = 0; a < N_ARROWS; a++) {
      const baseAng = (a / N_ARROWS) * Math.PI * 2 + t * 0.005 * loopClosure;
      const arrowR  = R * 1.06;
      const ax = cx + arrowR * Math.cos(baseAng);
      const ay = cy + arrowR * Math.sin(baseAng);
      const tangAng = baseAng + Math.PI / 2;
      ctx.save();
      ctx.translate(ax, ay);
      ctx.rotate(tangAng);
      ctx.beginPath();
      ctx.moveTo(-5, 0); ctx.lineTo(5, 0); ctx.lineTo(2, -3);
      ctx.strokeStyle = `rgba(192,132,252,${0.15 + 0.25 * loopClosure})`;
      ctx.lineWidth = 1.2; ctx.stroke();
      ctx.restore();
    }
  }

  // ── Photon rain particles ──
  for (const p of photons) {
    ctx.beginPath();
    ctx.arc(p.x, p.y, 1.5, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(251,191,36,${p.life})`;
    ctx.fill();
    // small trail
    ctx.beginPath();
    ctx.moveTo(p.x, p.y);
    ctx.lineTo(p.x - p.vx * 4, p.y - p.vy * 4);
    ctx.strokeStyle = `rgba(251,191,36,${p.life * 0.4})`;
    ctx.lineWidth = 0.6; ctx.stroke();
  }

  // ── Pigment streams (golden upward diffusion) ──
  for (const s of streams) {
    ctx.beginPath();
    ctx.arc(s.x, s.y, 1.2, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(${s.life > 0.5 ? "251,191,36" : "34,197,94"},${s.alpha})`;
    ctx.fill();
  }

  // ── Exciton wave rings from plants ──
  for (const ex of excitons) {
    ctx.beginPath();
    ctx.arc(ex.x, ex.y, ex.r, 0, Math.PI * 2);
    ctx.strokeStyle = `rgba(6,182,212,${ex.alpha})`;
    ctx.lineWidth = 0.8; ctx.stroke();
  }

  // ── Entanglement leaf↔soil lines ──
  for (let i = 0; i < N_PLANTS; i += 7) {
    const p = plantPos(i, R, cx, cy);
    // innermost soil point (scaled down)
    const soilR = R * 0.08;
    const sx = cx + soilR * Math.cos(p.ang + t * 0.002);
    const sy = cy + soilR * Math.sin(p.ang + t * 0.002);
    const alpha = 0.04 + 0.04 * Math.sin(t * 0.03 + i) * coherence;
    ctx.beginPath();
    ctx.moveTo(p.x, p.y);
    ctx.lineTo(sx, sy);
    ctx.strokeStyle = `rgba(6,182,212,${alpha})`;
    ctx.lineWidth = 0.5; ctx.stroke();
  }

  // ── Plants ──
  for (let i = 0; i < N_PLANTS; i++) {
    const p    = plantPos(i, R, cx, cy);
    const veg  = VEGS[i % VEGS.length];
    const photo = cucaPhoto(veg.λ);
    const pulse = 0.7 + 0.3 * Math.sin(t * 0.04 * photo + i * 0.7);
    const r     = 3.5 + 1.5 * pulse + (coherence > 0.8 ? 1.5 : 0);

    // CUCA glow
    if (coherence > 0.5) {
      const glowG = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, r * 3.5);
      glowG.addColorStop(0, veg.glow + "44");
      glowG.addColorStop(1, "transparent");
      ctx.fillStyle = glowG;
      ctx.beginPath(); ctx.arc(p.x, p.y, r * 3.5, 0, Math.PI * 2); ctx.fill();
    }

    ctx.beginPath(); ctx.arc(p.x, p.y, r, 0, Math.PI * 2);
    ctx.fillStyle = veg.col; ctx.fill();
    ctx.strokeStyle = veg.glow + "99"; ctx.lineWidth = 0.8; ctx.stroke();

    // leaf photon absorption flash
    if (Math.random() < 0.004 * coherence) {
      ctx.beginPath(); ctx.arc(p.x, p.y, r + 5, 0, Math.PI * 2);
      ctx.strokeStyle = "#fbbf2488"; ctx.lineWidth = 1; ctx.stroke();
    }
  }

  // ── Robots ──
  for (let ri = 0; ri < ROBOTS.length; ri++) {
    const robot   = ROBOTS[ri];
    const elapsed = t * 0.006 + ri * (Math.PI / 2);
    const orbitR  = R * (0.5 + ri * 0.12);
    const orbitA  = elapsed + ri;
    const rx = cx + orbitR * Math.cos(orbitA);
    const ry = cy + orbitR * Math.sin(orbitA);

    // CUCA node ring
    ctx.beginPath(); ctx.arc(rx, ry, 9, 0, Math.PI * 2);
    ctx.strokeStyle = `${robot.col}50`; ctx.lineWidth = 1; ctx.stroke();
    ctx.beginPath(); ctx.arc(rx, ry, 5.5, 0, Math.PI * 2);
    ctx.fillStyle = robot.col + "cc"; ctx.fill();
    ctx.fillStyle = "#fff"; ctx.font = "bold 6px monospace"; ctx.textAlign = "center";
    ctx.textBaseline = "middle"; ctx.fillText(robot.glyph, rx, ry);

    // THz scan arc
    ctx.beginPath();
    ctx.arc(rx, ry, 14 + 4 * Math.sin(t * 0.12 + ri), -0.4, 0.4);
    ctx.strokeStyle = `${robot.col}55`; ctx.lineWidth = 1.5; ctx.stroke();
  }

  // ── Center: CUCA core ──
  const coreR = R * 0.09;
  const coreGrad = ctx.createRadialGradient(cx, cy, 0, cx, cy, coreR * 2.5);
  coreGrad.addColorStop(0, "rgba(0,255,136,0.5)");
  coreGrad.addColorStop(0.5, "rgba(0,255,136,0.12)");
  coreGrad.addColorStop(1, "transparent");
  ctx.fillStyle = coreGrad;
  ctx.beginPath(); ctx.arc(cx, cy, coreR * 2.5, 0, Math.PI * 2); ctx.fill();
  ctx.beginPath(); ctx.arc(cx, cy, coreR, 0, Math.PI * 2);
  ctx.fillStyle = "rgba(0,255,136,0.15)"; ctx.fill();
  ctx.strokeStyle = `rgba(0,255,136,${0.4 + 0.3 * Math.sin(t * 0.04)})`;
  ctx.lineWidth = 1.5; ctx.stroke();
  ctx.fillStyle = "rgba(0,255,136,0.7)"; ctx.font = "bold 7px monospace";
  ctx.textAlign = "center"; ctx.textBaseline = "middle";
  ctx.fillText("CUCA", cx, cy - 3); ctx.fillText("CORE", cx, cy + 5);

  ctx.textBaseline = "alphabetic";
}

// ── Mini 4-layer loop canvas ──────────────────────────────────────────────────
function LayerCanvas({ t, loopClosure }: { t: number; loopClosure: number }) {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const c = ref.current; if (!c) return;
    const ctx = c.getContext("2d")!;
    const W = c.width, H = c.height;
    ctx.clearRect(0, 0, W, H);
    ctx.fillStyle = "rgb(2,8,18)"; ctx.fillRect(0, 0, W, H);

    const cx = W / 2, cy = H / 2 + 10;
    const baseR = Math.min(W, H) * 0.33;

    LAYERS.forEach((layer, li) => {
      const r = baseR - li * (baseR * 0.2);
      const startA = t * 0.012 * (li % 2 === 0 ? 1 : -1) - Math.PI / 2;
      const filled = loopClosure > li * 0.25;

      // Arc ring
      ctx.beginPath();
      ctx.arc(cx, cy, r, 0, Math.PI * 2);
      ctx.strokeStyle = `${layer.col}${filled ? "55" : "18"}`;
      ctx.lineWidth = filled ? 2.5 : 1;
      ctx.stroke();

      if (filled) {
        // Animated moving segment
        const segLen = Math.PI * 0.6;
        ctx.beginPath();
        ctx.arc(cx, cy, r, startA, startA + segLen);
        ctx.strokeStyle = layer.col;
        ctx.lineWidth = 2.5; ctx.stroke();

        // Arrow at end of segment
        const ax = cx + r * Math.cos(startA + segLen);
        const ay = cy + r * Math.sin(startA + segLen);
        const tangA = startA + segLen + Math.PI / 2;
        ctx.save(); ctx.translate(ax, ay); ctx.rotate(tangA);
        ctx.beginPath(); ctx.moveTo(-4, 0); ctx.lineTo(4, 0); ctx.lineTo(0, -5);
        ctx.fillStyle = layer.col; ctx.fill(); ctx.restore();
      }

      // Label on right
      const labelA = 0;
      const lx = cx + (r + 10) * Math.cos(labelA);
      const ly = cy + (r + 1) * Math.sin(labelA);
      ctx.font = "bold 7px monospace"; ctx.fillStyle = filled ? layer.col : layer.col + "44";
      ctx.textAlign = "left"; ctx.fillText(`L${li + 1}: ${layer.label}`, lx - r + 4, ly);
    });

    // Center label
    ctx.font = "bold 8px monospace"; ctx.fillStyle = `rgba(0,255,136,${0.4 + 0.3 * Math.sin(t * 0.04)})`;
    ctx.textAlign = "center";
    ctx.fillText("CLOSED", cx, cy - 4); ctx.fillText("LOOP", cx, cy + 6);

  }, [t, loopClosure]);

  useEffect(() => {
    const c = ref.current; if (!c) return;
    c.width = c.offsetWidth; c.height = c.offsetHeight;
  }, []);

  return <canvas ref={ref} style={{ width: "100%", height: "100%", display: "block" }} />;
}

// ── Main component ────────────────────────────────────────────────────────────
function CucaClosedLoopCanvas() {
  const ref = useRef<HTMLCanvasElement>(null);
  const rafRef = useRef(0);
  useEffect(() => {
    const canvas = ref.current; if (!canvas) return;
    const ctx = canvas.getContext("2d")!;
    canvas.width = 900; canvas.height = 200;
    const W = canvas.width, H = canvas.height;
    const cx=W/2, cy=H/2;
    let t=0;
    const draw=()=>{
      ctx.fillStyle="rgba(2,8,18,0.18)"; ctx.fillRect(0,0,W,H);
      t++;
      for(let i=0;i<3;i++){
        const r=30+i*22, speed=0.015+i*0.008;
        const x=cx+r*Math.cos(t*speed+i*2), y=cy+r*Math.sin(t*speed*0.7+i*2);
        const g=ctx.createRadialGradient(x,y,0,x,y,10);
        const col=i===0?"#2ef0d8":i===1?"#9966ff":"#44cc77";
        g.addColorStop(0,col+"aa"); g.addColorStop(1,"transparent");
        ctx.beginPath(); ctx.arc(x,y,10,0,Math.PI*2); ctx.fillStyle=g; ctx.fill();
        ctx.beginPath(); ctx.arc(cx,cy,r,0,Math.PI*2);
        ctx.strokeStyle=col+"1a"; ctx.lineWidth=1; ctx.stroke();
      }
      const r2=80; const ang2=t*0.008;
      const feedbackPts=[[cx+r2*Math.cos(ang2),cy+r2*Math.sin(ang2)],[cx+r2*Math.cos(ang2+Math.PI*2/3),cy+r2*Math.sin(ang2+Math.PI*2/3)],[cx+r2*Math.cos(ang2+Math.PI*4/3),cy+r2*Math.sin(ang2+Math.PI*4/3)]];
      ctx.beginPath(); ctx.moveTo(feedbackPts[0][0],feedbackPts[0][1]); ctx.lineTo(feedbackPts[1][0],feedbackPts[1][1]); ctx.lineTo(feedbackPts[2][0],feedbackPts[2][1]); ctx.closePath();
      ctx.strokeStyle="rgba(46,240,216,0.12)"; ctx.lineWidth=1; ctx.stroke();
      ctx.fillStyle="rgba(46,240,216,0.35)"; ctx.font="9px 'DM Mono',monospace"; ctx.textAlign="left";
      ctx.fillText("CUCA CLOSED LOOP · MORPHOGENETIC FEEDBACK · GYROID · BIO-HYBRID SKIN · AETHER",14,14);
      rafRef.current=requestAnimationFrame(draw);
    };
    draw();
    return ()=>cancelAnimationFrame(rafRef.current);
  },[]);
  return <canvas ref={ref} style={{ width:"100%", height:"auto", borderRadius:8, display:"block" }} />;
}

export default function CucaClosedLoopPage() {
  const canvasRef   = useRef<HTMLCanvasElement>(null);
  const tickRef     = useRef(0);
  const rafRef      = useRef<number>(0);
  const photonsRef  = useRef<Photon[]>([]);
  const excitonsRef = useRef<Exciton[]>([]);
  const streamsRef  = useRef<PigmentStream[]>([]);

  const [running, setRunning]   = useState(true);
  const [t, setT]               = useState(0);
  const [loopClosure, setLoop]  = useState(0);
  const [coherence, setCoherence] = useState(0.47);
  const [power, setPower]       = useState(1892);
  const [yield_, setYield]      = useState(340);
  const [entangle, setEntangle] = useState(0.998);
  const [activeLayer, setActiveLayer] = useState(0);

  const [log, setLog] = useState<{ ts: string; msg: string; col: string }[]>([
    { ts: "00:00", msg: "CUCA v4.0 bootstrap initiated", col: "#00ff88" },
    { ts: "00:01", msg: "Photon layer — incident light-medium ONLINE", col: "#fbbf24" },
  ]);

  const pushLog = useCallback((msg: string, col = "#00ff88") => {
    const now = new Date();
    const ts  = `${String(now.getMinutes()).padStart(2,"0")}:${String(now.getSeconds()).padStart(2,"0")}`;
    setLog(prev => [{ ts, msg, col }, ...prev].slice(0, 24));
  }, []);

  const animate = useCallback(() => {
    if (!running) return;
    tickRef.current += 1;
    const tk = tickRef.current;

    // ── Spawn photons from top ──
    if (tk % 3 === 0 && photonsRef.current.length < 80) {
      const c = canvasRef.current;
      if (c) {
        const veg = VEGS[Math.floor(Math.random() * VEGS.length)];
        photonsRef.current.push({
          x: Math.random() * c.width, y: -5,
          vx: (Math.random() - 0.5) * 0.4,
          vy: 1.5 + Math.random() * 1.5,
          life: 1,
          col: "#fbbf24",
        });
        void veg;
      }
    }
    photonsRef.current = photonsRef.current
      .map(p => ({ ...p, x: p.x + p.vx, y: p.y + p.vy, life: p.life - 0.012 }))
      .filter(p => p.life > 0 && p.y < (canvasRef.current?.height ?? 800));

    // ── Exciton rings from plant impacts ──
    if (tk % 18 === 0) {
      const c = canvasRef.current;
      if (c) {
        const idx = Math.floor(Math.random() * N_PLANTS);
        const { x, y } = plantPos(idx, Math.min(c.width, c.height) * 0.44, c.width / 2, c.height / 2);
        const veg = VEGS[idx % VEGS.length];
        excitonsRef.current.push({ x, y, r: 0, maxR: 12 + Math.random() * 10, alpha: 0.8, col: veg.col });
      }
    }
    excitonsRef.current = excitonsRef.current
      .map(ex => ({ ...ex, r: ex.r + 0.45, alpha: ex.alpha - 0.025 }))
      .filter(ex => ex.alpha > 0);

    // ── Pigment streams (upward from soil to leaf) ──
    if (tk % 8 === 0 && streamsRef.current.length < 120) {
      const c = canvasRef.current;
      if (c) {
        const ang = Math.random() * Math.PI * 2;
        const baseR = Math.min(c.width, c.height) * 0.44 * 0.1;
        streamsRef.current.push({
          x: c.width / 2 + baseR * Math.cos(ang),
          y: c.height / 2 + baseR * Math.sin(ang),
          vx: (Math.cos(ang) * 0.8 + (Math.random() - 0.5) * 0.3),
          vy: (Math.sin(ang) * 0.8 + (Math.random() - 0.5) * 0.3),
          life: 1, alpha: 0.6,
        });
      }
    }
    streamsRef.current = streamsRef.current
      .map(s => ({ ...s, x: s.x + s.vx, y: s.y + s.vy, life: s.life - 0.008, alpha: s.alpha - 0.006 }))
      .filter(s => s.alpha > 0);

    // ── Draw ──
    const c = canvasRef.current;
    if (c) {
      const lc = Math.min(1, tk / 400);
      drawCUCA(c, tk, photonsRef.current, excitonsRef.current, streamsRef.current, lc, coherence);
    }

    // ── Update metrics ──
    if (tk % 30 === 0) {
      const lc = Math.min(1, tk / 400);
      setLoop(lc);
      setT(tk);
      setActiveLayer(Math.floor((tk / 60) % 4));

      // Oscillating metrics
      setCoherence(0.47 + 0.06 * Math.sin(tk * 0.01));
      setPower(1892 + 120 * Math.sin(tk * 0.008));
      setYield(340 + 25 * Math.sin(tk * 0.007));
      setEntangle(0.998 - 0.0005 * (1 - lc));

      // Log events
      if (tk === 120) pushLog("Exciton layer — quantum coherence locked", "#06b6d4");
      if (tk === 240) pushLog("Granular pigment flow — soil→leaf ACTIVE", "#22c55e");
      if (tk === 360) pushLog("Bio-feedback loop — robots entangled", "#c084fc");
      if (tk === 400) pushLog("CUCA LOOP CLOSED — over-unity coherence achieved 🌱", "#fbbf24");
      if (tk % 300 === 0 && tk > 400) {
        pushLog(`Free power: ${(1892 + 120 * Math.sin(tk * 0.008)).toFixed(0)} kWh — self-sustaining`, "#fbbf24");
      }
    }

    rafRef.current = requestAnimationFrame(animate);
  }, [running, coherence, pushLog]);

  useEffect(() => {
    if (running) { rafRef.current = requestAnimationFrame(animate); }
    return () => cancelAnimationFrame(rafRef.current);
  }, [running, animate]);

  useEffect(() => {
    const resize = () => {
      const c = canvasRef.current; if (!c) return;
      c.width = c.offsetWidth; c.height = c.offsetHeight;
    };
    resize();
    window.addEventListener("resize", resize);
    return () => window.removeEventListener("resize", resize);
  }, []);

  const G = "#00ff88";
  const mono: React.CSSProperties = { fontFamily: "'Courier New', monospace" };
  const loopPct = Math.min(100, (t / 400) * 100).toFixed(0);

  const MetricBox = ({ label, value, unit, color }: { label: string; value: string; unit?: string; color?: string }) => (
    <div style={{ background: "rgba(0,255,136,0.03)", border: "1px solid rgba(0,255,136,0.08)", borderRadius: 6, padding: "8px 10px" }}>
      <div style={{ fontSize: 7, color: "rgba(0,255,136,0.4)", letterSpacing: 2, marginBottom: 3 }}>{label}</div>
      <div style={{ fontSize: 18, fontWeight: 700, color: color ?? G, lineHeight: 1 }}>{value}</div>
      {unit && <div style={{ fontSize: 7, color: "rgba(255,255,255,0.3)", marginTop: 2 }}>{unit}</div>}
    </div>
  );

  return (
    <div style={{ height: "100%", display: "flex", flexDirection: "column", background: "rgb(2,8,18)", color: G, ...mono, overflow: "hidden" }}>
      <div style={{ padding:"16px 24px 0", flexShrink:0 }}>
        <div style={{ display:"inline-block", border:"1px solid #2ef0d8", borderRadius:4, padding:"4px 14px", fontSize:10, letterSpacing:"0.28em", color:"#2ef0d8", fontFamily:"'DM Mono',monospace", marginBottom:16 }}>LIVE SIMULATION</div>
        <div style={{ background:"rgba(2,8,18,0.9)", border:"1px solid rgba(46,240,216,0.1)", borderLeft:"3px solid #2ef0d8", borderRadius:10, padding:20, marginBottom:16 }}>
          <h2 style={{ fontFamily:"'DM Mono',monospace", fontSize:18, color:"#e0f8ff", margin:"0 0 6px" }}>
            CUCA Closed Loop · Morphogenetic Feedback · Gyroid · Bio-Hybrid Skin · AETHER
          </h2>
          <p style={{ fontFamily:"'DM Mono',monospace", fontSize:12, color:"rgba(46,240,216,0.35)", margin:"0 0 14px", lineHeight:1.65 }}>
            Three-orbit feedback loop with rotating triangular coherence scaffold — the live AETHER CUCA morphogenetic closed-loop simulation.
          </p>
          <CucaClosedLoopCanvas />
        </div>
      </div>

      {/* Header */}
      <div style={{ padding: "6px 16px", borderBottom: "1px solid rgba(0,255,136,0.1)", display: "flex", alignItems: "center", gap: 14, flexShrink: 0 }}>
        <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: 4 }}>CUCA v4.0</span>
        <span style={{ fontSize: 7, color: "rgba(0,255,136,0.35)", letterSpacing: 2 }}>COHERENT UNIFIED CLOSED-LOOP ARCHITECTURE · PHOTOSYNTHETIC ENGINE</span>
        <div style={{ marginLeft: "auto", display: "flex", gap: 8, alignItems: "center" }}>
          {/* Loop closure bar */}
          <div style={{ fontSize: 7, color: "rgba(255,255,255,0.4)" }}>LOOP CLOSURE</div>
          <div style={{ width: 100, height: 6, background: "rgba(255,255,255,0.08)", borderRadius: 3, overflow: "hidden" }}>
            <div style={{ height: "100%", width: `${loopPct}%`, background: `linear-gradient(90deg, ${G}, #fbbf24)`, transition: "width 0.3s", borderRadius: 3 }} />
          </div>
          <div style={{ fontSize: 9, fontWeight: 700, color: Number(loopPct) >= 100 ? "#fbbf24" : G }}>{loopPct}%</div>
          <button onClick={() => setRunning(r => !r)} style={{ marginLeft: 8, padding: "3px 12px", background: "transparent", border: `1px solid ${running ? G + "50" : "rgba(255,255,255,0.15)"}`, borderRadius: 4, color: running ? G : "rgba(255,255,255,0.3)", fontSize: 8, cursor: "pointer", letterSpacing: 2, ...mono }}>
            {running ? "⏸ PAUSE" : "▶ RUN"}
          </button>
        </div>
      </div>

      {/* CUCA Master Equation */}
      <div style={{ padding: "6px 16px", borderBottom: "1px solid rgba(0,255,136,0.06)", background: "rgba(0,255,136,0.015)", flexShrink: 0, display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
        <span style={{ fontSize: 7, color: "rgba(0,255,136,0.4)", letterSpacing: 2 }}>MASTER EQ:</span>
        <span style={{ fontSize: 9, color: "rgba(255,255,255,0.55)" }}>
          ∂²ψ<sub>CUCA</sub>/∂t² = c²∇²ψ + φ·ℛ<sub>369</sub>(ψ) − γ·∂ψ/∂t + ℰ(ψ₁,ψ₂) + 𝒫<sub>photo</sub>(ψ)
        </span>
        <span style={{ fontSize: 7, color: "rgba(0,255,136,0.3)", marginLeft: "auto" }}>
          𝒫<sub>photo</sub> = φ²·η·Σᵢ αᵢ·exp(−(λᵢ−λ_peak)²/σ²)·⟨ψ<sub>leaf</sub>|ψ<sub>soil</sub>⟩  ·  η={entangle.toFixed(4)}
        </span>
      </div>

      {/* Main layout */}
      <div style={{ flex: 1, display: "grid", gridTemplateColumns: "220px 1fr 200px", minHeight: 0 }}>

        {/* LEFT PANEL */}
        <div style={{ borderRight: "1px solid rgba(0,255,136,0.08)", display: "flex", flexDirection: "column", gap: 0, overflowY: "auto" }}>

          {/* Metrics */}
          <div style={{ padding: "10px 10px 6px", display: "grid", gridTemplateColumns: "1fr 1fr", gap: 5 }}>
            <MetricBox label="COHERENCE EFF." value={`${(coherence * 100).toFixed(1)}`} unit="%" color={coherence > 0.5 ? "#fbbf24" : G} />
            <MetricBox label="FREE POWER"     value={power.toFixed(0)}    unit="kWh"  color="#06b6d4" />
            <MetricBox label="PHOTO YIELD"    value={`+${yield_.toFixed(0)}`} unit="%" color="#22c55e" />
            <MetricBox label="ENTANGLEMENT"   value={entangle.toFixed(3)} unit="fidelity" color="#c084fc" />
          </div>

          {/* 4-Layer stack */}
          <div style={{ padding: "6px 10px", borderTop: "1px solid rgba(0,255,136,0.06)" }}>
            <div style={{ fontSize: 7, color: "rgba(0,255,136,0.35)", letterSpacing: 2, marginBottom: 6 }}>CUCA LAYER STACK</div>
            {LAYERS.map((layer, li) => {
              const active = li === activeLayer;
              const lit    = loopClosure > li * 0.25;
              return (
                <div key={layer.id} style={{ display: "flex", alignItems: "flex-start", gap: 8, marginBottom: 7, padding: "5px 7px", borderRadius: 5, border: `1px solid ${active ? layer.col + "40" : "rgba(255,255,255,0.04)"}`, background: active ? `${layer.col}08` : "transparent", transition: "all 0.4s" }}>
                  <div style={{ width: 6, height: 6, borderRadius: "50%", background: lit ? layer.col : layer.col + "30", boxShadow: lit ? `0 0 6px ${layer.col}` : "none", flexShrink: 0, marginTop: 2 }} />
                  <div>
                    <div style={{ fontSize: 7, fontWeight: 700, color: lit ? layer.col : "rgba(255,255,255,0.25)", letterSpacing: 0.5 }}>L{li + 1} · {layer.label}</div>
                    <div style={{ fontSize: 6, color: "rgba(255,255,255,0.25)", marginTop: 1 }}>{layer.desc}</div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Vegetables */}
          <div style={{ padding: "6px 10px", borderTop: "1px solid rgba(0,255,136,0.06)" }}>
            <div style={{ fontSize: 7, color: "rgba(0,255,136,0.35)", letterSpacing: 2, marginBottom: 5 }}>CUCA VEGGIES (φ-SPIRAL)</div>
            {VEGS.map(v => (
              <div key={v.name} style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 4 }}>
                <div style={{ width: 7, height: 7, borderRadius: "50%", background: v.col, flexShrink: 0 }} />
                <span style={{ fontSize: 7, color: "rgba(255,255,255,0.45)" }}>{v.name}</span>
                <span style={{ fontSize: 6, color: "rgba(255,255,255,0.2)", marginLeft: "auto" }}>λ{v.λ}nm</span>
              </div>
            ))}
          </div>

          {/* Robots */}
          <div style={{ padding: "6px 10px", borderTop: "1px solid rgba(0,255,136,0.06)" }}>
            <div style={{ fontSize: 7, color: "rgba(0,255,136,0.35)", letterSpacing: 2, marginBottom: 5 }}>CUCA ROBOT SWARM</div>
            {ROBOTS.map(r => (
              <div key={r.name} style={{ display: "flex", alignItems: "center", gap: 5, marginBottom: 4 }}>
                <span style={{ fontSize: 9, color: r.col }}>{r.glyph}</span>
                <span style={{ fontSize: 6, color: "rgba(255,255,255,0.4)" }}>{r.name}</span>
                <span style={{ fontSize: 5, color: `${r.col}80`, marginLeft: "auto" }}>ACTIVE</span>
              </div>
            ))}
          </div>
        </div>

        {/* CENTER — Main canvas */}
        <div style={{ position: "relative" }}>
          <canvas ref={canvasRef} style={{ width: "100%", height: "100%", display: "block" }} />

          {/* CUCA status overlay */}
          {Number(loopPct) >= 100 && (
            <div style={{ position: "absolute", top: 10, left: "50%", transform: "translateX(-50%)", padding: "4px 16px", background: "rgba(251,191,36,0.12)", border: "1px solid rgba(251,191,36,0.4)", borderRadius: 20, fontSize: 8, color: "#fbbf24", letterSpacing: 2, animation: "pulse 2s ease-in-out infinite", ...mono }}>
              ⚡ LOOP CLOSED · OVER-UNITY · SELF-SUSTAINING
            </div>
          )}

          {/* Legend */}
          <div style={{ position: "absolute", bottom: 10, left: 10, display: "flex", flexDirection: "column", gap: 3 }}>
            {[
              { col:"#fbbf24", label:"Photon rain" },
              { col:"#06b6d4", label:"Exciton wave" },
              { col:"#22c55e", label:"Pigment stream" },
              { col:"#c084fc", label:"Bio-feedback" },
            ].map(l => (
              <div key={l.label} style={{ display: "flex", alignItems: "center", gap: 5 }}>
                <div style={{ width: 5, height: 5, borderRadius: "50%", background: l.col }} />
                <span style={{ fontSize: 7, color: "rgba(255,255,255,0.35)" }}>{l.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* RIGHT PANEL */}
        <div style={{ borderLeft: "1px solid rgba(0,255,136,0.08)", display: "flex", flexDirection: "column" }}>

          {/* 4-layer loop diagram */}
          <div style={{ height: 180, flexShrink: 0, borderBottom: "1px solid rgba(0,255,136,0.06)", padding: 4 }}>
            <div style={{ fontSize: 6, color: "rgba(0,255,136,0.3)", letterSpacing: 2, padding: "2px 6px" }}>LOOP DIAGRAM</div>
            <div style={{ height: "calc(100% - 16px)" }}>
              <LayerCanvas t={t} loopClosure={loopClosure} />
            </div>
          </div>

          {/* φ² amplifier */}
          <div style={{ padding: "8px 10px", borderBottom: "1px solid rgba(0,255,136,0.06)" }}>
            <div style={{ fontSize: 7, color: "rgba(0,255,136,0.35)", letterSpacing: 2, marginBottom: 5 }}>φ² AMPLIFIER</div>
            {["Chl α: 430 nm — 0.892", "Chl β: 662 nm — 0.877", "Car:  470 nm — 0.841", "φ²:   2.618×  boost"].map(s => (
              <div key={s} style={{ fontSize: 7, color: "rgba(255,255,255,0.4)", marginBottom: 2 }}>{s}</div>
            ))}
          </div>

          {/* Python code stub */}
          <div style={{ padding: "8px 10px", borderBottom: "1px solid rgba(0,255,136,0.06)" }}>
            <div style={{ fontSize: 7, color: "rgba(0,255,136,0.35)", letterSpacing: 2, marginBottom: 5 }}>CUCA PYTHON CORE</div>
            <pre style={{ margin: 0, fontSize: 6, color: "rgba(255,255,255,0.3)", lineHeight: 1.5, overflow: "hidden" }}>{`phi = (1+√5)/2

def P_photo(ψ, λ):
  α = exp(-((λ-430)²
    +(λ-662)²)/50²)
  ε = |ψ_leaf·ψ_soil*|
  return phi²·α·ε

def cuca_wave(θ,t):
  base = aether_wave(θ,t)
  return base + P_photo(base)`}</pre>
          </div>

          {/* Event log */}
          <div style={{ flex: 1, overflowY: "auto", padding: "6px 8px" }}>
            <div style={{ fontSize: 7, color: "rgba(0,255,136,0.35)", letterSpacing: 2, marginBottom: 5 }}>EVENT LOG</div>
            {log.map((l, i) => (
              <div key={i} style={{ marginBottom: 5, opacity: 1 - i * 0.04 }}>
                <div style={{ display: "flex", gap: 6, alignItems: "flex-start" }}>
                  <span style={{ fontSize: 6, color: "rgba(255,255,255,0.2)", flexShrink: 0, paddingTop: 1 }}>{l.ts}</span>
                  <span style={{ fontSize: 7, color: l.col, lineHeight: 1.4 }}>{l.msg}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <style>{`@keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.5} }`}</style>
    </div>
  );
}
