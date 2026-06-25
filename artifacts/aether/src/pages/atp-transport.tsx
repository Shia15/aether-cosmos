import { useEffect, useRef, useState } from "react";

const V = {
  bg: "#04060E", aurora: "#00FFB2", gold: "#C8A030", blue: "#4488FF",
  vio: "#9966FF", amb: "#FF9933", rose: "#FF6699", plasma: "#FF4477",
  green: "#44CC77", dim: "#3A5060", ink: "#B8CCE8", fire: "#FF6622",
  shock: "#FFDD22", photon: "#00FFBB", cyan: "#22DDFF",
};
const MONO = "'Space Mono', monospace";
const SERIF = "'Crimson Pro', serif";
const DISP = "'Cinzel', serif";

const mkRng = (seed: number) => {
  let s = seed;
  return () => { s = (s * 16807) % 2147483647; return (s - 1) / 2147483646; };
};

/* ── ATP Starburst Canvas ── */
function AtpStarburstCanvas() {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const canvas = ref.current; if (!canvas) return;
    const ctx = canvas.getContext("2d"); if (!ctx) return;
    const W = canvas.width = canvas.offsetWidth;
    const H = canvas.height = canvas.offsetHeight;
    const cx = W / 2, cy = H / 2 + 10;
    const rng = mkRng(42);

    /* Particles */
    type Particle = { x: number; y: number; vx: number; vy: number; life: number; maxLife: number; r: number; col: string };
    const particles: Particle[] = [];
    const COLS = [V.aurora, V.photon, V.shock, V.amber || V.amb, V.gold];
    function COLS_pick() { return COLS[Math.floor(rng() * COLS.length)]; }

    function spawnBurst(ox: number, oy: number, n: number) {
      for (let i = 0; i < n; i++) {
        const a = rng() * Math.PI * 2;
        const spd = 0.5 + rng() * 2.5;
        particles.push({
          x: ox + (rng() - 0.5) * 6,
          y: oy + (rng() - 0.5) * 6,
          vx: Math.cos(a) * spd,
          vy: Math.sin(a) * spd,
          life: 0, maxLife: 40 + rng() * 50,
          r: 1 + rng() * 2.5,
          col: COLS_pick(),
        });
      }
    }

    let t = 0;
    let raf = 0;

    function drawPhosphate(px: number, py: number, radius: number, label: string, energy: boolean, glow: number) {
      /* Glow ring */
      const g = ctx.createRadialGradient(px, py, 0, px, py, radius * (energy ? 2.4 : 1.8));
      const a = energy ? (0.35 + 0.2 * glow) : 0.1;
      g.addColorStop(0, `rgba(255,221,34,${a})`);
      g.addColorStop(0.5, `rgba(255,102,34,${a * 0.4})`);
      g.addColorStop(1, "transparent");
      ctx.beginPath(); ctx.arc(px, py, radius * (energy ? 2.4 : 1.8), 0, Math.PI * 2);
      ctx.fillStyle = g; ctx.fill();
      /* Circle */
      ctx.beginPath(); ctx.arc(px, py, radius, 0, Math.PI * 2);
      ctx.fillStyle = energy ? V.shock : V.amb;
      ctx.shadowColor = energy ? V.shock : V.amb;
      ctx.shadowBlur = energy ? 18 : 8;
      ctx.fill(); ctx.shadowBlur = 0;
      /* Border */
      ctx.strokeStyle = energy ? V.gold : "#804010";
      ctx.lineWidth = 1.5; ctx.stroke();
      /* Label */
      ctx.fillStyle = energy ? "#02030A" : "#1a0a00";
      ctx.font = `bold 9px ${MONO}`;
      ctx.textAlign = "center"; ctx.textBaseline = "middle";
      ctx.fillText(label, px, py);
    }

    function drawRibose(rx: number, ry: number) {
      /* Pentagon */
      const pts: [number, number][] = [];
      for (let i = 0; i < 5; i++) {
        const a = -Math.PI / 2 + (i / 5) * Math.PI * 2;
        pts.push([rx + Math.cos(a) * 22, ry + Math.sin(a) * 22]);
      }
      ctx.beginPath(); ctx.moveTo(pts[0][0], pts[0][1]);
      for (let i = 1; i < 5; i++) ctx.lineTo(pts[i][0], pts[i][1]);
      ctx.closePath();
      ctx.fillStyle = "rgba(68,136,255,0.12)";
      ctx.strokeStyle = V.blue;
      ctx.lineWidth = 1.5;
      ctx.fill(); ctx.stroke();
      ctx.fillStyle = V.blue;
      ctx.font = `bold 8px ${MONO}`; ctx.textAlign = "center"; ctx.textBaseline = "middle";
      ctx.fillText("RIBOSE", rx, ry + 1);
    }

    function drawAdenine(ax: number, ay: number) {
      /* Hexagon + pentagon fused (purine base) */
      const hex: [number, number][] = [];
      for (let i = 0; i < 6; i++) {
        const a = -Math.PI / 2 + (i / 6) * Math.PI * 2;
        hex.push([ax + Math.cos(a) * 26, ay + Math.sin(a) * 26]);
      }
      ctx.beginPath(); ctx.moveTo(hex[0][0], hex[0][1]);
      for (let i = 1; i < 6; i++) ctx.lineTo(hex[i][0], hex[i][1]);
      ctx.closePath();
      ctx.fillStyle = "rgba(153,102,255,0.15)";
      ctx.strokeStyle = V.vio; ctx.lineWidth = 1.5; ctx.fill(); ctx.stroke();

      const pent: [number, number][] = [];
      const baseX = ax + 30;
      for (let i = 0; i < 5; i++) {
        const a = -Math.PI / 2 + (i / 5) * Math.PI * 2;
        pent.push([baseX + Math.cos(a) * 16, ay + Math.sin(a) * 16]);
      }
      ctx.beginPath(); ctx.moveTo(pent[0][0], pent[0][1]);
      for (let i = 1; i < 5; i++) ctx.lineTo(pent[i][0], pent[i][1]);
      ctx.closePath();
      ctx.fillStyle = "rgba(153,102,255,0.1)";
      ctx.strokeStyle = V.vio; ctx.lineWidth = 1; ctx.fill(); ctx.stroke();

      ctx.fillStyle = V.vio;
      ctx.font = `bold 8px ${MONO}`; ctx.textAlign = "center"; ctx.textBaseline = "middle";
      ctx.fillText("ADENINE", ax - 2, ay + 1);
    }

    function drawBond(x1: number, y1: number, x2: number, y2: number, high: boolean) {
      ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x2, y2);
      ctx.strokeStyle = high ? V.shock : V.dim;
      ctx.lineWidth = high ? 2.5 : 1.5;
      if (high) { ctx.shadowColor = V.shock; ctx.shadowBlur = 8; }
      ctx.stroke(); ctx.shadowBlur = 0;
      if (high) {
        /* ~high-energy bond label */
        const mx = (x1 + x2) / 2, my = (y1 + y2) / 2;
        ctx.fillStyle = V.shock;
        ctx.font = `7px ${MONO}`; ctx.textAlign = "center";
        ctx.fillText("~", mx, my - 6);
      }
    }

    /* Starburst rays */
    function drawRays(ox: number, oy: number, count: number, phase: number, pulse: number) {
      for (let i = 0; i < count; i++) {
        const a = phase + (i / count) * Math.PI * 2;
        const len = 30 + 20 * pulse + rng() * 10;
        const x2 = ox + Math.cos(a) * len, y2 = oy + Math.sin(a) * len;
        ctx.beginPath(); ctx.moveTo(ox + Math.cos(a) * 14, oy + Math.sin(a) * 14);
        ctx.lineTo(x2, y2);
        const alpha = 0.15 + 0.5 * pulse * (0.5 + 0.5 * Math.sin(t * 0.15 + i));
        ctx.strokeStyle = `rgba(255,221,34,${alpha})`;
        ctx.lineWidth = 1 + pulse;
        ctx.stroke();
        /* Sparkle at tip */
        ctx.beginPath(); ctx.arc(x2, y2, 1.5 + pulse * 1.5, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255,255,180,${alpha * 1.2})`;
        ctx.fill();
      }
    }

    function frame() {
      ctx.clearRect(0, 0, W, H);

      /* Outer glow */
      const outerG = ctx.createRadialGradient(cx, cy, 60, cx, cy, W * 0.55);
      outerG.addColorStop(0, "rgba(0,255,178,0.04)");
      outerG.addColorStop(1, "transparent");
      ctx.beginPath(); ctx.arc(cx, cy, W * 0.55, 0, Math.PI * 2);
      ctx.fillStyle = outerG; ctx.fill();

      /* Positions */
      const adenX = cx - 100, adenY = cy - 10;
      const ribX = cx - 10, ribY = cy;
      const p1X = cx + 60, p1Y = cy;
      const p2X = cx + 100, p2Y = cy;
      const p3X = cx + 140, p3Y = cy;

      const hydPulse = (Math.sin(t * 0.04) + 1) / 2;
      const burstPhase = t * 0.06;

      /* Starburst from terminal phosphate γ */
      drawRays(p3X, p3Y, 14, burstPhase, hydPulse);

      /* Bonds */
      drawBond(adenX + 38, adenY, ribX - 22, ribY, false);
      drawBond(ribX + 22, ribY, p1X - 14, p1Y, false);
      drawBond(p1X + 14, p1Y, p2X - 14, p2Y, true);
      drawBond(p2X + 14, p2Y, p3X - 14, p3Y, true);

      /* Molecules */
      drawAdenine(adenX, adenY);
      drawRibose(ribX, ribY);
      drawPhosphate(p1X, p1Y, 14, "α", false, 0);
      drawPhosphate(p2X, p2Y, 14, "β", true, hydPulse * 0.5);
      drawPhosphate(p3X, p3Y, 14, "γ", true, hydPulse);

      /* Spawn particles from γ */
      if (Math.floor(t) % 3 === 0) spawnBurst(p3X, p3Y, 3);

      /* Update + draw particles */
      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        p.x += p.vx; p.y += p.vy; p.vy += 0.02; p.life++;
        if (p.life > p.maxLife) { particles.splice(i, 1); continue; }
        const frac = p.life / p.maxLife;
        ctx.beginPath(); ctx.arc(p.x, p.y, p.r * (1 - frac * 0.5), 0, Math.PI * 2);
        const alpha = (1 - frac) * 0.85;
        ctx.fillStyle = p.col + Math.floor(alpha * 255).toString(16).padStart(2, "0");
        ctx.fill();
      }

      /* Labels */
      ctx.fillStyle = V.ink; ctx.font = `7px ${MONO}`; ctx.textAlign = "center";
      ctx.fillText("ADENOSINE", (adenX + ribX) / 2 - 5, cy + 40);
      ctx.fillStyle = V.dim; ctx.fillText("NUCLEOSIDE", (adenX + ribX) / 2 - 5, cy + 50);
      ctx.fillStyle = V.shock; ctx.fillText("HIGH-ENERGY BOND  ~", (p1X + p3X) / 2, cy + 40);
      ctx.fillStyle = V.gold; ctx.fillText("TERMINAL  γ-PHOSPHATE", p3X, cy + 50);

      t++; raf = requestAnimationFrame(frame);
    }
    raf = requestAnimationFrame(frame);
    return () => cancelAnimationFrame(raf);
  }, []);

  return (
    <canvas ref={ref} style={{ width: "100%", height: 220, display: "block" }} />
  );
}

/* ── ATP Cycle Canvas ── */
function AtpCycleCanvas() {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const canvas = ref.current; if (!canvas) return;
    const ctx = canvas.getContext("2d"); if (!ctx) return;
    const W = canvas.width = canvas.offsetWidth;
    const H = canvas.height = canvas.offsetHeight;
    const cx = W / 2, cy = H / 2;
    const R = Math.min(W, H) * 0.33;

    let t = 0, raf = 0;

    function arcLabel(text: string, angle: number, r: number, col: string, size = 9) {
      const x = cx + Math.cos(angle) * r;
      const y = cy + Math.sin(angle) * r;
      ctx.fillStyle = col;
      ctx.font = `${size}px ${MONO}`; ctx.textAlign = "center"; ctx.textBaseline = "middle";
      ctx.fillText(text, x, y);
    }

    function arrow(x1: number, y1: number, x2: number, y2: number, col: string, progress: number) {
      const dx = x2 - x1, dy = y2 - y1;
      const len = Math.sqrt(dx * dx + dy * dy);
      const ex = x1 + dx * progress, ey = y1 + dy * progress;
      ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(ex, ey);
      ctx.strokeStyle = col; ctx.lineWidth = 2;
      ctx.shadowColor = col; ctx.shadowBlur = 6;
      ctx.stroke(); ctx.shadowBlur = 0;
      if (progress > 0.95) {
        const nx = dx / len, ny = dy / len;
        ctx.beginPath();
        ctx.moveTo(ex, ey);
        ctx.lineTo(ex - nx * 8 - ny * 5, ey - ny * 8 + nx * 5);
        ctx.lineTo(ex - nx * 8 + ny * 5, ey - ny * 8 - nx * 5);
        ctx.closePath(); ctx.fillStyle = col; ctx.fill();
      }
    }

    function frame() {
      ctx.clearRect(0, 0, W, H);

      /* Orbit track */
      ctx.beginPath(); ctx.arc(cx, cy, R, 0, Math.PI * 2);
      ctx.strokeStyle = "rgba(58,80,96,0.4)"; ctx.lineWidth = 1.5;
      ctx.setLineDash([4, 6]); ctx.stroke(); ctx.setLineDash([]);

      /* Phase: 0→1 = hydrolysis, 1→2 = synthesis */
      const cycleT = ((t * 0.008) % 2);
      const hydrPhase = cycleT < 1 ? cycleT : 1;
      const synthPhase = cycleT >= 1 ? cycleT - 1 : 0;

      /* ATP node (top) */
      const atpAngle = -Math.PI / 2;
      const atpX = cx + Math.cos(atpAngle) * R;
      const atpY = cy + Math.sin(atpAngle) * R;

      /* ADP+Pi node (bottom) */
      const adpAngle = Math.PI / 2;
      const adpX = cx + Math.cos(adpAngle) * R;
      const adpY = cy + Math.sin(adpAngle) * R;

      /* Hydrolysis arc (right side, ATP → ADP) */
      {
        const prog = Math.min(hydrPhase * 1.2, 1);
        const steps = 60;
        if (prog > 0) {
          ctx.beginPath();
          for (let i = 0; i <= Math.floor(prog * steps); i++) {
            const a = atpAngle + (i / steps) * Math.PI;
            const x = cx + Math.cos(a) * R, y = cy + Math.sin(a) * R;
            i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
          }
          ctx.strokeStyle = V.shock; ctx.lineWidth = 3;
          ctx.shadowColor = V.shock; ctx.shadowBlur = 10;
          ctx.stroke(); ctx.shadowBlur = 0;
        }
      }

      /* Synthesis arc (left side, ADP → ATP) */
      {
        const prog = Math.min(synthPhase * 1.2, 1);
        const steps = 60;
        if (prog > 0) {
          ctx.beginPath();
          for (let i = 0; i <= Math.floor(prog * steps); i++) {
            const a = adpAngle + (i / steps) * Math.PI;
            const x = cx + Math.cos(a) * R, y = cy + Math.sin(a) * R;
            i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
          }
          ctx.strokeStyle = V.aurora; ctx.lineWidth = 3;
          ctx.shadowColor = V.aurora; ctx.shadowBlur = 10;
          ctx.stroke(); ctx.shadowBlur = 0;
        }
      }

      /* ATP node */
      ctx.beginPath(); ctx.arc(atpX, atpY, 28, 0, Math.PI * 2);
      ctx.fillStyle = "rgba(255,221,34,0.12)"; ctx.fill();
      ctx.strokeStyle = V.shock; ctx.lineWidth = 2; ctx.stroke();
      ctx.fillStyle = V.shock; ctx.font = `bold 10px ${MONO}`;
      ctx.textAlign = "center"; ctx.textBaseline = "middle";
      ctx.fillText("ATP", atpX, atpY - 4);
      ctx.font = `7px ${MONO}`; ctx.fillStyle = V.gold;
      ctx.fillText("3 × PO₄", atpX, atpY + 8);

      /* ADP node */
      ctx.beginPath(); ctx.arc(adpX, adpY, 28, 0, Math.PI * 2);
      ctx.fillStyle = "rgba(0,255,178,0.08)"; ctx.fill();
      ctx.strokeStyle = V.aurora; ctx.lineWidth = 2; ctx.stroke();
      ctx.fillStyle = V.aurora; ctx.font = `bold 10px ${MONO}`;
      ctx.textAlign = "center"; ctx.textBaseline = "middle";
      ctx.fillText("ADP", adpX, adpY - 4);
      ctx.font = `7px ${MONO}`; ctx.fillStyle = V.photon;
      ctx.fillText("2 × PO₄", adpX, adpY + 4);
      ctx.fillText("+ Pi", adpX, adpY + 13);

      /* Right label: hydrolysis */
      arcLabel("HYDROLYSIS", 0, R + 36, V.shock, 8);
      arcLabel("ATP → ADP + Pi", 0, R + 48, V.dim, 7);
      arcLabel("−30.5 kJ/mol", 0, R + 58, V.fire, 7);

      /* Left label: synthesis */
      arcLabel("SYNTHESIS", Math.PI, R + 36, V.aurora, 8);
      arcLabel("ADP + Pi → ATP", Math.PI, R + 48, V.dim, 7);
      arcLabel("ATP SYNTHASE", Math.PI, R + 58, V.photon, 7);

      /* Moving energy dot on hydrolysis arc */
      {
        const prog = Math.min(hydrPhase, 1);
        const a = atpAngle + prog * Math.PI;
        const x = cx + Math.cos(a) * R, y = cy + Math.sin(a) * R;
        ctx.beginPath(); ctx.arc(x, y, 5, 0, Math.PI * 2);
        ctx.fillStyle = V.shock;
        ctx.shadowColor = V.shock; ctx.shadowBlur = 14; ctx.fill(); ctx.shadowBlur = 0;
      }

      /* Moving dot on synthesis arc */
      {
        const prog = Math.min(synthPhase, 1);
        const a = adpAngle + prog * Math.PI;
        const x = cx + Math.cos(a) * R, y = cy + Math.sin(a) * R;
        ctx.beginPath(); ctx.arc(x, y, 5, 0, Math.PI * 2);
        ctx.fillStyle = V.aurora;
        ctx.shadowColor = V.aurora; ctx.shadowBlur = 14; ctx.fill(); ctx.shadowBlur = 0;
      }

      /* Center label */
      ctx.fillStyle = V.ink; ctx.font = `8px ${MONO}`;
      ctx.textAlign = "center"; ctx.textBaseline = "middle";
      ctx.fillText("ATP", cx, cy - 8);
      ctx.fillText("CYCLE", cx, cy + 4);
      ctx.fillStyle = V.dim; ctx.font = `6px ${MONO}`;
      ctx.fillText("~500 ATP/sec", cx, cy + 16);
      ctx.fillText("per cell", cx, cy + 25);

      t++; raf = requestAnimationFrame(frame);
    }
    raf = requestAnimationFrame(frame);
    return () => cancelAnimationFrame(raf);
  }, []);

  return (
    <canvas ref={ref} style={{ width: "100%", height: 280, display: "block" }} />
  );
}

/* ── Active Transport Canvas ── */
function ActiveTransportCanvas() {
  const ref = useRef<HTMLCanvasElement>(null);
  const [speed, setSpeed] = useState(1.0);
  const speedRef = useRef(speed);
  speedRef.current = speed;

  useEffect(() => {
    const canvas = ref.current; if (!canvas) return;
    const ctx = canvas.getContext("2d"); if (!ctx) return;
    const W = canvas.width = canvas.offsetWidth;
    const H = canvas.height = canvas.offsetHeight;

    type Ion = { x: number; y: number; vx: number; vy: number; r: number; col: string; label: string; side: "high" | "low"; phase: number };
    const ions: Ion[] = [];
    const rng = mkRng(77);

    /* Spawn ions */
    for (let i = 0; i < 18; i++) {
      const side = i < 12 ? "high" : "low";
      const x = side === "high" ? rng() * (W * 0.38) + 20 : rng() * (W * 0.38) + W * 0.58;
      ions.push({
        x, y: 30 + rng() * (H - 60),
        vx: (rng() - 0.5) * 0.5, vy: (rng() - 0.5) * 0.5,
        r: 5 + rng() * 3, col: i % 3 === 0 ? V.aurora : i % 3 === 1 ? V.blue : V.rose,
        label: i % 3 === 0 ? "Na⁺" : i % 3 === 1 ? "K⁺" : "H⁺",
        side, phase: rng() * Math.PI * 2,
      });
    }

    /* Pump state */
    let pumpPhase = 0;
    let pumpOn = true;
    let t = 0;
    let raf = 0;

    function frame() {
      ctx.clearRect(0, 0, W, H);
      const spd = speedRef.current;

      /* Membrane */
      const memX = W / 2;
      const memW = 22;

      /* Background halves */
      const hiG = ctx.createLinearGradient(0, 0, W * 0.46, 0);
      hiG.addColorStop(0, "rgba(255,102,34,0.05)");
      hiG.addColorStop(1, "rgba(255,102,34,0.14)");
      ctx.fillStyle = hiG; ctx.fillRect(0, 0, W * 0.46, H);

      const loG = ctx.createLinearGradient(W * 0.54, 0, W, 0);
      loG.addColorStop(0, "rgba(0,255,178,0.08)");
      loG.addColorStop(1, "rgba(0,255,178,0.03)");
      ctx.fillStyle = loG; ctx.fillRect(W * 0.54, 0, W, H);

      /* Membrane stripes */
      ctx.fillStyle = "rgba(184,204,232,0.08)";
      ctx.fillRect(memX - memW / 2, 0, memW, H);
      ctx.fillStyle = "rgba(184,204,232,0.2)";
      ctx.fillRect(memX - memW / 2, 0, 2, H);
      ctx.fillRect(memX + memW / 2 - 2, 0, 2, H);
      ctx.fillStyle = V.dim; ctx.font = `6px ${MONO}`; ctx.textAlign = "center";
      ctx.fillText("MEMBRANE", memX, 10);

      /* Concentration labels */
      ctx.fillStyle = V.fire; ctx.font = `bold 8px ${MONO}`; ctx.textAlign = "center";
      ctx.fillText("HIGH [C]", W * 0.23, 22);
      ctx.fillStyle = V.aurora;
      ctx.fillText("LOW [C]", W * 0.77, 22);

      /* Gradient arrow */
      const arrY = H - 22;
      ctx.beginPath(); ctx.moveTo(W * 0.1, arrY); ctx.lineTo(W * 0.46, arrY);
      ctx.strokeStyle = "rgba(255,102,34,0.4)"; ctx.lineWidth = 1.5;
      ctx.setLineDash([3, 4]); ctx.stroke(); ctx.setLineDash([]);
      ctx.fillStyle = "rgba(255,102,34,0.4)"; ctx.font = `6px ${MONO}`;
      ctx.textAlign = "center"; ctx.fillText("← concentration gradient →", W / 2, arrY + 10);

      /* Pump body */
      const pumpY = H / 2;
      const pumpR = 20;
      const pumpGlow = (Math.sin(pumpPhase) + 1) / 2;
      ctx.beginPath(); ctx.arc(memX, pumpY, pumpR + 4, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(200,160,48,${0.12 + 0.15 * pumpGlow})`; ctx.fill();
      ctx.beginPath(); ctx.arc(memX, pumpY, pumpR, 0, Math.PI * 2);
      ctx.fillStyle = "#0a0c14";
      ctx.strokeStyle = V.gold; ctx.lineWidth = 2;
      ctx.shadowColor = V.gold; ctx.shadowBlur = pumpGlow * 16;
      ctx.fill(); ctx.stroke(); ctx.shadowBlur = 0;
      ctx.fillStyle = V.gold; ctx.font = `bold 7px ${MONO}`;
      ctx.textAlign = "center"; ctx.textBaseline = "middle";
      ctx.fillText("PUMP", memX, pumpY - 4);
      ctx.fillStyle = V.amb; ctx.font = `6px ${MONO}`;
      ctx.fillText("ATP↓", memX, pumpY + 6);

      /* Pump channel gap */
      ctx.clearRect(memX - memW / 2 - 1, pumpY - pumpR, memW + 2, pumpR * 2);
      ctx.beginPath(); ctx.arc(memX, pumpY, pumpR, 0, Math.PI * 2);
      ctx.fillStyle = "#0a0c14"; ctx.fill();
      ctx.strokeStyle = V.gold; ctx.lineWidth = 2; ctx.stroke();
      ctx.fillStyle = V.gold; ctx.font = `bold 7px ${MONO}`;
      ctx.textAlign = "center"; ctx.textBaseline = "middle";
      ctx.fillText("PUMP", memX, pumpY - 4);
      ctx.fillStyle = V.amb; ctx.font = `6px ${MONO}`;
      ctx.fillText("ATP↓", memX, pumpY + 6);

      /* Transport arrow through pump */
      if (pumpOn) {
        const progress = (pumpPhase % (Math.PI * 2)) / (Math.PI * 2);
        const startX = memX - 8, endX = memX + 8;
        const ionY = pumpY - pumpR + 2 * pumpR * progress;
        ctx.beginPath(); ctx.arc(startX + (endX - startX) * progress, ionY, 4, 0, Math.PI * 2);
        ctx.fillStyle = V.aurora;
        ctx.shadowColor = V.aurora; ctx.shadowBlur = 10; ctx.fill(); ctx.shadowBlur = 0;
      }

      /* Move ions */
      for (const ion of ions) {
        ion.phase += 0.02 * spd;
        ion.x += ion.vx * spd + Math.sin(ion.phase * 0.8) * 0.15;
        ion.y += ion.vy * spd + Math.cos(ion.phase * 0.6) * 0.15;

        /* Bounce within correct side */
        const leftBound = 12, rightBound = W - 12;
        const midLeft = memX - memW / 2 - 10;
        const midRight = memX + memW / 2 + 10;
        if (ion.side === "high") {
          if (ion.x < leftBound || ion.x > midLeft) ion.vx *= -1;
        } else {
          if (ion.x < midRight || ion.x > rightBound) ion.vx *= -1;
        }
        if (ion.y < 30 || ion.y > H - 20) ion.vy *= -1;

        /* Draw */
        const glow = ctx.createRadialGradient(ion.x, ion.y, 0, ion.x, ion.y, ion.r * 2.5);
        glow.addColorStop(0, ion.col + "80");
        glow.addColorStop(1, "transparent");
        ctx.beginPath(); ctx.arc(ion.x, ion.y, ion.r * 2.5, 0, Math.PI * 2);
        ctx.fillStyle = glow; ctx.fill();
        ctx.beginPath(); ctx.arc(ion.x, ion.y, ion.r, 0, Math.PI * 2);
        ctx.fillStyle = ion.col + "CC";
        ctx.strokeStyle = ion.col; ctx.lineWidth = 1; ctx.stroke(); ctx.fill();
        ctx.fillStyle = "#02030A"; ctx.font = `5px ${MONO}`;
        ctx.textAlign = "center"; ctx.textBaseline = "middle";
        ctx.fillText(ion.label, ion.x, ion.y);
      }

      pumpPhase += 0.06 * spd;
      t++; raf = requestAnimationFrame(frame);
    }
    raf = requestAnimationFrame(frame);
    return () => cancelAnimationFrame(raf);
  }, []);

  return (
    <div>
      <canvas ref={ref} style={{ width: "100%", height: 260, display: "block" }} />
      <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "8px 0" }}>
        <span style={{ fontFamily: MONO, fontSize: "0.6rem", color: V.dim }}>PUMP SPEED</span>
        <input type="range" min={0.2} max={3} step={0.1} defaultValue={1}
          onChange={e => setSpeed(+e.target.value)}
          style={{ flex: 1, accentColor: V.gold }} />
        <span style={{ fontFamily: MONO, fontSize: "0.6rem", color: V.gold, minWidth: 36 }}>×{speed.toFixed(1)}</span>
      </div>
    </div>
  );
}

/* ── Main Page ── */
export default function AtpTransportPage() {
  const [tab, setTab] = useState<"molecule" | "cycle" | "transport">("molecule");

  const chip = (label: string, val: string, col: string) => (
    <div style={{ background: `${col}11`, border: `1px solid ${col}44`,
      borderRadius: 6, padding: "8px 14px", minWidth: 120 }}>
      <div style={{ fontFamily: MONO, fontSize: "0.55rem", color: V.dim, letterSpacing: 2, marginBottom: 3 }}>{label}</div>
      <div style={{ fontFamily: MONO, fontSize: "0.75rem", color: col }}>{val}</div>
    </div>
  );

  const tabs: { key: "molecule" | "cycle" | "transport"; label: string }[] = [
    { key: "molecule", label: "MOLECULE" },
    { key: "cycle", label: "ATP CYCLE" },
    { key: "transport", label: "ACTIVE TRANSPORT" },
  ];

  return (
    <div style={{ minHeight: "100vh", background: V.bg, color: V.ink, fontFamily: MONO, padding: "32px 24px", maxWidth: 900, margin: "0 auto" }}>

      {/* Header */}
      <div style={{ marginBottom: 32 }}>
        <div style={{ fontFamily: DISP, fontSize: "0.65rem", letterSpacing: "0.4em", color: V.dim, marginBottom: 8 }}>
          BIOCHEMISTRY · BIOENERGETICS
        </div>
        <h1 style={{ fontFamily: DISP, fontSize: "clamp(1.6rem, 4vw, 2.6rem)", color: V.shock,
          letterSpacing: "0.08em", margin: 0, lineHeight: 1.15,
          textShadow: `0 0 40px ${V.shock}66` }}>
          ATP
        </h1>
        <h2 style={{ fontFamily: DISP, fontSize: "clamp(0.9rem, 2.5vw, 1.4rem)", color: V.gold,
          letterSpacing: "0.12em", margin: "4px 0 12px", fontWeight: 400 }}>
          Active Transport · Energy Currency · Hydrolysis Cycle
        </h2>
        <p style={{ fontFamily: SERIF, fontSize: "1rem", color: V.dim, maxWidth: 640, lineHeight: 1.7, margin: 0 }}>
          Adenosine Triphosphate — the universal energy currency of life. Three phosphate groups
          store chemical potential in high-energy bonds. Hydrolysis of the terminal γ-phosphate
          releases ~30.5 kJ/mol, powering active transport against concentration gradients.
        </p>
      </div>

      {/* Stat chips */}
      <div style={{ display: "flex", flexWrap: "wrap", gap: 10, marginBottom: 28 }}>
        {chip("ENERGY RELEASED", "~30.5 kJ/mol", V.shock)}
        {chip("PHOSPHATE GROUPS", "3 × PO₄³⁻", V.amb)}
        {chip("SUGAR", "RIBOSE (C₅)", V.blue)}
        {chip("BASE", "ADENINE", V.vio)}
        {chip("TURNOVER RATE", "~500 ATP/sec", V.aurora)}
        {chip("MOLECULAR MASS", "507.18 g/mol", V.green)}
      </div>

      {/* Tabs */}
      <div style={{ display: "flex", gap: 4, marginBottom: 16, borderBottom: `1px solid ${V.dim}44`, paddingBottom: 0 }}>
        {tabs.map(tb => (
          <button key={tb.key} onClick={() => setTab(tb.key)}
            style={{ fontFamily: MONO, fontSize: "0.6rem", letterSpacing: 2,
              padding: "7px 16px", border: "none", borderRadius: "4px 4px 0 0", cursor: "pointer",
              background: tab === tb.key ? `${V.shock}18` : "transparent",
              color: tab === tb.key ? V.shock : V.dim,
              borderBottom: tab === tb.key ? `2px solid ${V.shock}` : "2px solid transparent",
              transition: "all 0.2s" }}>
            {tb.label}
          </button>
        ))}
      </div>

      {/* Canvas panel */}
      <div style={{ background: "#060910", border: `1px solid ${V.dim}44`,
        borderRadius: 10, padding: 16, marginBottom: 28, minHeight: 260 }}>
        {tab === "molecule" && <AtpStarburstCanvas />}
        {tab === "cycle" && <AtpCycleCanvas />}
        {tab === "transport" && <ActiveTransportCanvas />}
      </div>

      {/* Structure explainer */}
      {tab === "molecule" && (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: 14, marginBottom: 28 }}>
          {[
            { title: "ADENINE", col: V.vio, lines: ["Purine nitrogenous base", "Fused bicyclic ring system", "Pairs with Thymine in DNA", "Uracil in RNA"] },
            { title: "RIBOSE", col: V.blue, lines: ["5-carbon sugar (pentose)", "C₅H₁₀O₅ furanose ring", "D-ribose configuration", "Connects base + phosphates"] },
            { title: "α-PHOSPHATE", col: V.amb, lines: ["Closest to ribose (C5')", "Linked via ester bond", "Relatively stable bond", "Not hydrolyzed first"] },
            { title: "β & γ PHOSPHATES", col: V.shock, lines: ["High-energy anhydride bonds", "γ is terminal — cleaved first", "~30.5 kJ/mol on hydrolysis", "Starburst energy release"] },
          ].map(s => (
            <div key={s.title} style={{ background: `${s.col}09`, border: `1px solid ${s.col}33`,
              borderRadius: 8, padding: 14 }}>
              <div style={{ fontFamily: MONO, fontSize: "0.6rem", color: s.col, letterSpacing: 2, marginBottom: 8 }}>{s.title}</div>
              {s.lines.map((l, i) => (
                <div key={i} style={{ fontFamily: SERIF, fontSize: "0.85rem", color: V.ink, lineHeight: 1.6,
                  paddingLeft: 10, borderLeft: `2px solid ${s.col}44`, marginBottom: 3 }}>{l}</div>
              ))}
            </div>
          ))}
        </div>
      )}

      {/* Cycle explainer */}
      {tab === "cycle" && (
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 28 }}>
          {[
            { title: "HYDROLYSIS", col: V.shock, dir: "ATP → ADP + Pi", steps: ["Water molecule attacks γ-phosphate", "P–O bond breaks (anhydride)", "Inorganic phosphate (Pi) released", "30.5 kJ/mol free energy released", "Drives endergonic cellular work"] },
            { title: "SYNTHESIS", col: V.aurora, dir: "ADP + Pi → ATP", steps: ["Driven by ATP synthase enzyme", "Proton gradient powers F₀F₁ rotor", "Chemiosmotic phosphorylation", "Oxidative or photosynthetic chain", "Requires 30.5+ kJ/mol input"] },
          ].map(s => (
            <div key={s.title} style={{ background: `${s.col}08`, border: `1px solid ${s.col}33`, borderRadius: 8, padding: 14 }}>
              <div style={{ fontFamily: MONO, fontSize: "0.6rem", color: s.col, letterSpacing: 2, marginBottom: 4 }}>{s.title}</div>
              <div style={{ fontFamily: MONO, fontSize: "0.55rem", color: V.dim, marginBottom: 10 }}>{s.dir}</div>
              {s.steps.map((l, i) => (
                <div key={i} style={{ display: "flex", gap: 8, alignItems: "flex-start", marginBottom: 4 }}>
                  <span style={{ color: s.col, flexShrink: 0, fontSize: "0.6rem" }}>{i + 1}.</span>
                  <span style={{ fontFamily: SERIF, fontSize: "0.85rem", color: V.ink, lineHeight: 1.5 }}>{l}</span>
                </div>
              ))}
            </div>
          ))}
        </div>
      )}

      {/* Transport explainer */}
      {tab === "transport" && (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: 14, marginBottom: 28 }}>
          {[
            { title: "ACTIVE TRANSPORT", col: V.gold, lines: ["Moves solutes AGAINST gradient", "Requires ATP hydrolysis", "Primary: pump uses ATP directly", "Secondary: uses ion gradient"] },
            { title: "Na⁺/K⁺-ATPase PUMP", col: V.aurora, lines: ["3 Na⁺ out, 2 K⁺ in per cycle", "Maintains membrane potential", "1 ATP hydrolyzed per cycle", "~30% of cellular ATP consumed"] },
            { title: "CONCENTRATION GRADIENT", col: V.fire, lines: ["High → Low is spontaneous (ΔG < 0)", "Low → High requires energy input", "ΔG = RT ln([C₂]/[C₁]) + zFΔψ", "Electrochemical gradient combined"] },
            { title: "THERMODYNAMICS", col: V.rose, lines: ["ΔG_transport = ΔG_ATP + ΔG_gradient", "Coupled reactions drive transport", "Entropy of mixing opposes work", "Cells maintain ~10 mM ATP"] },
          ].map(s => (
            <div key={s.title} style={{ background: `${s.col}09`, border: `1px solid ${s.col}33`,
              borderRadius: 8, padding: 14 }}>
              <div style={{ fontFamily: MONO, fontSize: "0.6rem", color: s.col, letterSpacing: 2, marginBottom: 8 }}>{s.title}</div>
              {s.lines.map((l, i) => (
                <div key={i} style={{ fontFamily: SERIF, fontSize: "0.85rem", color: V.ink, lineHeight: 1.6,
                  paddingLeft: 10, borderLeft: `2px solid ${s.col}44`, marginBottom: 3 }}>{l}</div>
              ))}
            </div>
          ))}
        </div>
      )}

      {/* Chemical formula strip */}
      <div style={{ background: "#060910", border: `1px solid ${V.dim}33`, borderRadius: 8,
        padding: "16px 20px", marginBottom: 28 }}>
        <div style={{ fontFamily: MONO, fontSize: "0.55rem", color: V.dim, letterSpacing: 3, marginBottom: 12 }}>
          REACTION EQUATIONS
        </div>
        {[
          { eq: "ATP  +  H₂O  →  ADP  +  Pᵢ  +  H⁺", label: "Hydrolysis", col: V.shock },
          { eq: "ATP  +  H₂O  →  AMP  +  PPᵢ", label: "Pyrophosphate release", col: V.amb },
          { eq: "ADP  +  Pᵢ  +  nH⁺(out)  →  ATP  +  H₂O  +  nH⁺(in)", label: "ATP Synthase (chemiosmotic)", col: V.aurora },
          { eq: "ΔG°' = −30.5 kJ/mol  (physiological ≈ −50 to −65 kJ/mol)", label: "Free energy (standard / in vivo)", col: V.green },
        ].map((r, i) => (
          <div key={i} style={{ marginBottom: 10 }}>
            <div style={{ fontFamily: MONO, fontSize: "0.7rem", color: r.col, letterSpacing: 1 }}>{r.eq}</div>
            <div style={{ fontFamily: MONO, fontSize: "0.52rem", color: V.dim, letterSpacing: 2, marginTop: 2 }}>{r.label}</div>
          </div>
        ))}
      </div>

      {/* Footer */}
      <div style={{ borderTop: `1px solid ${V.dim}33`, paddingTop: 16, display: "flex", gap: 20, flexWrap: "wrap" }}>
        {[["FULL NAME", "Adenosine-5'-triphosphate"], ["CAS", "56-65-5"], ["FORMULA", "C₁₀H₁₆N₅O₁₃P₃"], ["IUPAC", "Adenylyl-(3'→5')-diphospho-"]].map(([k, v]) => (
          <div key={k}>
            <div style={{ fontFamily: MONO, fontSize: "0.48rem", color: V.dim, letterSpacing: 2 }}>{k}</div>
            <div style={{ fontFamily: MONO, fontSize: "0.58rem", color: V.ink }}>{v}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
