import { useEffect, useRef, useState } from "react";

interface Drop {
  x: number; y: number;
  vx: number; vy: number;
  r: number;
  phase: number; phaseV: number;
  theta: number; elongation: number;
  charge: 1 | -1;
  wobbleAmp: number; wobbleFreq: number; wobblePhase: number;
  hue: number; sat: number;
  spikes: number; spikePhase: number;
}

function makeDrop(i: number, total: number, W: number, H: number): Drop {
  const margin = 60;
  const spacing = (W - margin * 2) / (total - 1 || 1);
  const cx = total === 1 ? W / 2 : margin + i * spacing;
  const r0 = 14 + Math.random() * 14;
  return {
    x: cx, y: H * 0.5 + (Math.random() - 0.5) * 60,
    vx: (Math.random() - 0.5) * 0.4, vy: (Math.random() - 0.5) * 0.4,
    r: r0, phase: Math.random() * Math.PI * 2, phaseV: 0.008 + Math.random() * 0.018,
    theta: Math.random() * Math.PI * 2, elongation: 1.0,
    charge: Math.random() > 0.5 ? 1 : -1,
    wobbleAmp: 0.08 + Math.random() * 0.14, wobbleFreq: 0.5 + Math.random() * 1.5,
    wobblePhase: Math.random() * Math.PI * 2,
    hue: 200 + Math.random() * 80, sat: 70 + Math.random() * 25,
    spikes: 3 + Math.floor(Math.random() * 4), spikePhase: Math.random() * Math.PI * 2,
  };
}

function fieldAt(x: number, y: number, t: number, W: number, H: number) {
  const cx = W / 2, cy = H / 2;
  const dx = x - cx, dy = y - cy;
  const dist = Math.sqrt(dx * dx + dy * dy) + 1;
  const angle = t * 0.4;
  const Bx = (Math.cos(angle) * dy - Math.sin(angle) * dx) / (dist * dist) * 8000;
  const By = (Math.sin(angle) * dy + Math.cos(angle) * dx) / (dist * dist) * 8000;
  return { Bx, By, mag: Math.sqrt(Bx * Bx + By * By) };
}

function dropInteraction(a: Drop, b: Drop, fieldStrength: number) {
  const dx = b.x - a.x, dy = b.y - a.y;
  const dist2 = dx * dx + dy * dy;
  const dist = Math.sqrt(dist2) + 0.01;
  if (dist > 280) return { fx: 0, fy: 0 };
  const sign = a.charge * b.charge;
  const F = sign * fieldStrength * 180 / (dist2 + 400);
  return { fx: -F * dx / dist, fy: -F * dy / dist };
}

export default function MagneticDropsPage() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rootRef   = useRef<HTMLDivElement>(null);
  const stRef = useRef({ fieldStrength: 1.2, dropCount: 7, viscosity: 0.62 });
  const dropsRef = useRef<Drop[]>([]);
  const rafRef   = useRef(0);
  const sizeRef  = useRef({ W: 800, H: 560 });

  const [field, setField]   = useState(1.2);
  const [count, setCount]   = useState(7);
  const [visc,  setVisc]    = useState(0.62);

  // Sync params to ref
  stRef.current = { fieldStrength: field, dropCount: count, viscosity: visc };

  const rebuildDrops = () => {
    const { W, H } = sizeRef.current;
    dropsRef.current = Array.from({ length: stRef.current.dropCount }, (_, i) =>
      makeDrop(i, stRef.current.dropCount, W, H));
  };

  useEffect(() => { rebuildDrops(); }, [count]);

  useEffect(() => {
    const cv = canvasRef.current, root = rootRef.current;
    if (!cv || !root) return;
    const ctx = cv.getContext("2d")!;

    const resize = () => {
      const dpr = window.devicePixelRatio || 1;
      const W = root.clientWidth, H = root.clientHeight;
      cv.width = W * dpr; cv.height = H * dpr;
      cv.style.width = W + "px"; cv.style.height = H + "px";
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      sizeRef.current = { W, H };
      rebuildDrops();
    };
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(root);

    let t = 0;
    const FIELD_LINES = 18;

    function drawFieldLines() {
      const { W, H } = sizeRef.current;
      ctx.save();
      for (let li = 0; li < FIELD_LINES; li++) {
        const startX = (W / FIELD_LINES) * li + W / FIELD_LINES / 2;
        ctx.beginPath();
        let px = startX, py = 0;
        ctx.moveTo(px, py);
        for (let step = 0; step < 80; step++) {
          const { Bx, By } = fieldAt(px, py, t, W, H);
          const len = Math.sqrt(Bx * Bx + By * By) + 0.01;
          px += (Bx / len) * 7; py += (By / len) * 7;
          if (px < -10 || px > W + 10 || py < -10 || py > H + 10) break;
          ctx.lineTo(px, py);
        }
        const alpha = 0.045 + 0.025 * Math.sin(t * 0.6 + li);
        ctx.strokeStyle = `rgba(80,140,255,${alpha})`;
        ctx.lineWidth = 0.6; ctx.stroke();
      }
      ctx.restore();
    }

    function drawDrop(d: Drop) {
      const { fieldStrength } = stRef.current;
      const { x, y, r, elongation, theta, wobbleAmp, wobbleFreq, wobblePhase, spikes, spikePhase, hue, sat } = d;
      const elong = 1 + (elongation - 1) * fieldStrength * 0.6;
      const rA = r * elong, rB = r / Math.max(elong, 0.9);
      ctx.save();
      ctx.translate(x, y);
      ctx.rotate(theta);

      // Glow
      const grd = ctx.createRadialGradient(0, 0, 0, 0, 0, rA * 1.8);
      grd.addColorStop(0, `hsla(${hue},${sat}%,65%,0.18)`);
      grd.addColorStop(1, `hsla(${hue},${sat}%,40%,0.0)`);
      ctx.beginPath(); ctx.ellipse(0, 0, rA * 1.8, rB * 1.8, 0, 0, Math.PI * 2);
      ctx.fillStyle = grd; ctx.fill();

      // Body
      ctx.beginPath();
      const pts = 120;
      for (let i = 0; i <= pts; i++) {
        const angle = (i / pts) * Math.PI * 2;
        const spikeVal = Math.pow(Math.max(0, Math.cos(spikes * angle + spikePhase + t * 0.8)), 3.5);
        const wobble = 1 + wobbleAmp * Math.sin(wobbleFreq * angle * 3 + t * 2.2 + wobblePhase) * fieldStrength * 0.5;
        const bx = Math.cos(angle) * rA, by = Math.sin(angle) * rB;
        const blen = Math.sqrt(bx * bx + by * by);
        const spikeLen = spikeVal * r * 0.55 * fieldStrength;
        const nx = bx / blen, ny = by / blen;
        const px = bx * wobble + nx * spikeLen, py = by * wobble + ny * spikeLen;
        i === 0 ? ctx.moveTo(px, py) : ctx.lineTo(px, py);
      }
      ctx.closePath();

      const bg = ctx.createRadialGradient(-rA * 0.28, -rB * 0.32, 0, 0, 0, rA * 1.1);
      bg.addColorStop(0,    `hsla(${hue + 25},${sat + 10}%,80%,0.92)`);
      bg.addColorStop(0.35, `hsla(${hue + 10},${sat + 5}%,58%,0.92)`);
      bg.addColorStop(0.72, `hsla(${hue},${sat}%,36%,0.92)`);
      bg.addColorStop(1,    `hsla(${hue - 12},${sat - 10}%,14%,0.92)`);
      ctx.fillStyle = bg; ctx.fill();
      ctx.strokeStyle = `hsla(${hue + 30},90%,88%,0.28)`; ctx.lineWidth = 0.8; ctx.stroke();

      // Highlight
      ctx.beginPath(); ctx.ellipse(-rA * 0.28, -rB * 0.3, rA * 0.22, rB * 0.14, -0.3, 0, Math.PI * 2);
      const hl = ctx.createRadialGradient(-rA * 0.28, -rB * 0.3, 0, -rA * 0.28, -rB * 0.3, rA * 0.22);
      hl.addColorStop(0, "rgba(255,255,255,0.75)"); hl.addColorStop(1, "rgba(255,255,255,0)");
      ctx.fillStyle = hl; ctx.fill();
      ctx.restore();
    }

    function drawFieldVectors() {
      const drops = dropsRef.current;
      drops.forEach(d => {
        const { Bx, By, mag } = fieldAt(d.x, d.y, t, sizeRef.current.W, sizeRef.current.H);
        if (mag < 0.001) return;
        const { fieldStrength } = stRef.current;
        const len = Math.min(28, mag * 0.4) * fieldStrength;
        const nx = Bx / mag, ny = By / mag;
        ctx.save(); ctx.translate(d.x, d.y);
        ctx.beginPath();
        ctx.moveTo(-nx * len * 0.5, -ny * len * 0.5);
        ctx.lineTo( nx * len * 0.5,  ny * len * 0.5);
        ctx.strokeStyle = `hsla(${d.hue + 20},85%,75%,0.35)`; ctx.lineWidth = 1;
        const hlen = 5;
        const hx = nx * len * 0.5 - nx * hlen, hy = ny * len * 0.5 - ny * hlen;
        const ppx = -ny * hlen * 0.5, ppy = nx * hlen * 0.5;
        ctx.moveTo(nx * len * 0.5, ny * len * 0.5); ctx.lineTo(hx + ppx, hy + ppy);
        ctx.moveTo(nx * len * 0.5, ny * len * 0.5); ctx.lineTo(hx - ppx, hy - ppy);
        ctx.stroke(); ctx.restore();
      });
    }

    function stepSim() {
      const { W, H } = sizeRef.current;
      const { fieldStrength, viscosity } = stRef.current;
      const drops = dropsRef.current;
      drops.forEach((d, i) => {
        const { Bx, By, mag } = fieldAt(d.x, d.y, t, W, H);
        const targetTheta = Math.atan2(By, Bx);
        let dTheta = targetTheta - d.theta;
        while (dTheta >  Math.PI) dTheta -= 2 * Math.PI;
        while (dTheta < -Math.PI) dTheta += 2 * Math.PI;
        d.theta += dTheta * 0.04 * fieldStrength;
        const targetElong = 1 + mag * 0.004 * fieldStrength;
        d.elongation += (Math.min(targetElong, 1.8) - d.elongation) * 0.06;

        const targetY = H * 0.5 + Math.sin(d.phase + t * d.phaseV * fieldStrength * 1.4) * (H * 0.18);
        d.vy += (targetY - d.y) * 0.004 * fieldStrength;
        d.vx += Math.sin(t * 0.3 + d.phase) * 0.012 * fieldStrength;

        drops.forEach((b, j) => {
          if (i === j) return;
          const { fx, fy } = dropInteraction(d, b, fieldStrength);
          d.vx += fx * 0.016; d.vy += fy * 0.016;
        });

        d.vx *= viscosity; d.vy *= viscosity;
        const spd = Math.sqrt(d.vx * d.vx + d.vy * d.vy);
        if (spd > 4) { d.vx *= 4 / spd; d.vy *= 4 / spd; }
        d.x += d.vx; d.y += d.vy;

        const margin = d.r * 1.8;
        if (d.x < margin)   { d.x = margin;   d.vx =  Math.abs(d.vx) * 0.5; }
        if (d.x > W-margin) { d.x = W-margin; d.vx = -Math.abs(d.vx) * 0.5; }
        if (d.y < margin)   { d.y = margin;   d.vy =  Math.abs(d.vy) * 0.5; }
        if (d.y > H-margin) { d.y = H-margin; d.vy = -Math.abs(d.vy) * 0.5; }
        d.spikePhase += 0.006 * fieldStrength;
      });
    }

    function render() {
      const { W, H } = sizeRef.current;
      const drops = dropsRef.current;
      ctx.fillStyle = "#050810"; ctx.fillRect(0, 0, W, H);
      drawFieldLines();

      drops.forEach((a, i) => {
        drops.forEach((b, j) => {
          if (j <= i) return;
          const dx = b.x - a.x, dy = b.y - a.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 180 && a.charge !== b.charge) {
            const alpha = (1 - dist / 180) * 0.18 * stRef.current.fieldStrength;
            ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y);
            ctx.strokeStyle = `rgba(120,180,255,${alpha})`; ctx.lineWidth = 0.7; ctx.stroke();
          }
        });
      });

      stepSim();
      drawFieldVectors();
      drops.forEach(d => drawDrop(d));
      t += 0.016;
      rafRef.current = requestAnimationFrame(render);
    }

    rafRef.current = requestAnimationFrame(render);
    return () => { cancelAnimationFrame(rafRef.current); ro.disconnect(); };
  }, []);

  const sliderStyle: React.CSSProperties = { width: 88, accentColor: "#5ba4f5" };
  const labelStyle: React.CSSProperties = { fontFamily: "'Space Mono',monospace", fontSize: 11, color: "rgba(160,200,255,0.55)", letterSpacing: "0.08em" };
  const valStyle: React.CSSProperties   = { fontFamily: "'Space Mono',monospace", fontSize: 11, color: "rgba(160,210,255,0.8)", minWidth: 26, textAlign: "right" };
  const sepStyle: React.CSSProperties   = { width: 1, height: 28, background: "rgba(100,160,255,0.18)" };

  return (
    <div ref={rootRef} style={{ width: "100%", height: "100%", position: "relative", overflow: "hidden", background: "#050810" }}>
      <canvas ref={canvasRef} style={{ position: "absolute", inset: 0 }} />

      <div style={{ position: "absolute", top: 8, left: 12, zIndex: 20, pointerEvents: "none" }}>
        <div style={{display:"inline-block",border:"1px solid rgba(91,164,245,0.6)",padding:"3px 10px",fontSize:9,letterSpacing:"0.2em",color:"rgba(91,164,245,0.8)",fontFamily:"'DM Mono',monospace",marginBottom:6}}>LIVE SIMULATION</div>
        <div style={{ fontFamily: "'DM Mono',monospace", fontSize: "0.6rem", letterSpacing: 3, color: "rgba(91,164,245,0.5)" }}>MAGNETIC DROPS · OSCILLATING FERROFLUID · AETHER</div>
      </div>
      {/* Title overlay */}
      <div style={{ position: "absolute", top: 16, left: 20, zIndex: 10, pointerEvents: "none" }}>
        <div style={{ fontFamily: "'Cinzel',serif", fontSize: "0.78rem", fontWeight: 700, letterSpacing: 6, color: "rgba(91,164,245,0.55)" }}>AETHER</div>
        <div style={{ fontFamily: "'Space Mono',monospace", fontSize: "0.48rem", letterSpacing: 4, color: "rgba(91,164,245,0.3)", marginTop: 2 }}>OSCILLATING MAGNETIC DROPS · FERROFLUID SIMULATION</div>
      </div>

      {/* Controls */}
      <div style={{ position: "absolute", bottom: 18, left: "50%", transform: "translateX(-50%)", display: "flex", gap: 18, alignItems: "center", background: "rgba(10,14,28,0.82)", border: "0.5px solid rgba(100,160,255,0.22)", borderRadius: 10, padding: "10px 20px", zIndex: 10 }}>
        <span style={labelStyle}>Field</span>
        <input type="range" min="0.2" max="3.0" step="0.1" value={field} style={sliderStyle}
          onChange={e => setField(parseFloat(e.target.value))} />
        <span style={valStyle}>{field.toFixed(1)}</span>
        <div style={sepStyle} />
        <span style={labelStyle}>Drops</span>
        <input type="range" min="3" max="14" step="1" value={count} style={sliderStyle}
          onChange={e => setCount(parseInt(e.target.value))} />
        <span style={valStyle}>{count}</span>
        <div style={sepStyle} />
        <span style={labelStyle}>Viscosity</span>
        <input type="range" min="0.1" max="0.98" step="0.02" value={visc} style={sliderStyle}
          onChange={e => setVisc(parseFloat(e.target.value))} />
        <span style={valStyle}>{visc.toFixed(2)}</span>
      </div>
    </div>
  );
}
