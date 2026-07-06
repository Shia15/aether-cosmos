import { useRef, useEffect, useState } from "react";

// ─── Palette ──────────────────────────────────────────────────────────────
const BG   = "#040810";
const TEAL = "#00FFEE";
const GOLD = "#c9a227";
const PINK = "#f472b6";
const BLUE = "#4db8ff";
const PURP = "#a78bfa";
const GREN = "#4ade80";
const ORNG = "#f97316";
const WHT  = "#f0f4ff";

const GA = 2.399963; // golden angle in radians (137.5°)

const panel: React.CSSProperties = {
  background: "rgba(255,255,255,0.04)",
  border: "1px solid rgba(255,255,255,0.08)",
  borderRadius: 12,
  padding: "1.2rem 1.6rem",
};

const sliderRow: React.CSSProperties = {
  display: "flex", gap: "1.2rem", alignItems: "center", flexWrap: "wrap",
  padding: "0.8rem 1rem", background: "rgba(255,255,255,0.02)",
  borderTop: "1px solid rgba(255,255,255,0.06)",
};

const btn: React.CSSProperties = {
  background: "rgba(0,255,238,0.1)", border: "1px solid rgba(0,255,238,0.3)",
  color: TEAL, borderRadius: 8, padding: "0.4rem 0.9rem", fontSize: 11,
  cursor: "pointer", fontFamily: "'DM Mono',monospace",
};

// ─── Shared Slider ──────────────────────────────────────────────────────────
function Slider({ label, val, set, min = 0, max = 1, step = 0.01 }:
  { label: string; val: number; set: (n: number) => void; min?: number; max?: number; step?: number }) {
  return (
    <label style={{ display: "flex", flexDirection: "column", gap: 2, fontSize: 9,
      color: "rgba(255,255,255,0.5)", fontFamily: "'DM Mono',monospace", minWidth: 130 }}>
      <span>{label}: {val.toFixed(2)}</span>
      <input type="range" min={min} max={max} step={step} value={val}
        onChange={e => set(parseFloat(e.target.value))} style={{ accentColor: TEAL }} />
    </label>
  );
}

// ─── Drawing helpers (module scope) ─────────────────────────────────────────
function drawFlower(ctx: CanvasRenderingContext2D, x: number, y: number, r: number, col: string, t: number) {
  for (let i = 0; i < 8; i++) {
    const a = i / 8 * 6.283 + Math.sin(t * 0.5) * 0.05;
    ctx.save(); ctx.translate(x, y); ctx.rotate(a); ctx.globalAlpha = 0.8;
    ctx.beginPath(); ctx.ellipse(0, -r * 0.6, r * 0.28, r * 0.6, 0, 0, 6.283);
    ctx.fillStyle = col; ctx.fill(); ctx.restore();
  }
  ctx.beginPath(); ctx.arc(x, y, r * 0.32, 0, 6.283); ctx.fillStyle = GOLD; ctx.fill();
  for (let i = 0; i < 24; i++) {
    const a = i * GA, rr = Math.sqrt(i) * r * 0.06;
    ctx.beginPath(); ctx.arc(x + Math.cos(a) * rr, y + Math.sin(a) * rr, 1.2, 0, 6.283);
    ctx.fillStyle = "#7a5a10"; ctx.fill();
  }
}

function drawMoth(ctx: CanvasRenderingContext2D, x: number, y: number, ang: number, t: number, isMoth: boolean) {
  const flap = Math.abs(Math.sin(t * 10)) * 0.7 + 0.3;
  const col  = isMoth ? "#d8c9a8" : "#ff9edb";
  const col2 = isMoth ? "#9c8763" : PURP;
  ctx.save(); ctx.translate(x, y); ctx.rotate(ang + Math.PI / 2);
  const wings: number[][] = [[-1, -1], [-1, 1], [1, -1], [1, 1]];
  wings.forEach(([sx, sy]) => {
    ctx.save(); ctx.scale(1, flap); ctx.globalAlpha = 0.85;
    ctx.beginPath(); ctx.ellipse(sx * 6, sy * 7, 7, 9, sx * 0.5, 0, 6.283);
    ctx.fillStyle = sx < 0 ? col : col2; ctx.fill(); ctx.restore();
  });
  ctx.globalAlpha = 1;
  ctx.beginPath(); ctx.ellipse(0, 0, 3, 8, 0, 0, 6.283); ctx.fillStyle = "#2a2320"; ctx.fill();
  ctx.beginPath(); ctx.moveTo(0, -6); ctx.lineTo(-3, -12); ctx.moveTo(0, -6); ctx.lineTo(3, -12);
  ctx.strokeStyle = "#2a2320"; ctx.lineWidth = 1; ctx.stroke();
  ctx.restore();
}

function drawLifeform(ctx: CanvasRenderingContext2D, x: number, y: number, r: number, phase: number, t: number) {
  const stage = Math.floor(phase) % 4;
  const frac  = phase - Math.floor(phase);
  ctx.save(); ctx.translate(x, y);
  if (stage === 0) {
    ctx.beginPath(); ctx.ellipse(0, 0, r * 0.5, r * 0.65, 0, 0, 6.283);
    ctx.fillStyle = WHT; ctx.globalAlpha = 0.9; ctx.fill();
    ctx.strokeStyle = GOLD; ctx.lineWidth = 1; ctx.stroke();
  } else if (stage === 1) {
    for (let i = 0; i < 7; i++) {
      const yy = (i - 3) * r * 0.28, xx = Math.sin(t * 3 + i * 0.6) * r * 0.12;
      ctx.beginPath(); ctx.arc(xx, yy, r * 0.24, 0, 6.283);
      ctx.fillStyle = GREN; ctx.globalAlpha = 0.9; ctx.fill();
    }
  } else if (stage === 2) {
    ctx.beginPath(); ctx.moveTo(0, -r * 0.8);
    ctx.quadraticCurveTo(r * 0.5, 0, 0, r * 0.9);
    ctx.quadraticCurveTo(-r * 0.5, 0, 0, -r * 0.8);
    ctx.fillStyle = GOLD; ctx.globalAlpha = 0.85; ctx.fill();
    ctx.globalAlpha = frac * 0.4; ctx.fillStyle = PINK;
    ctx.beginPath(); ctx.ellipse(0, 0, r * 0.3, r * 0.5, 0, 0, 6.283); ctx.fill();
  } else {
    const spread = 0.4 + 0.6 * frac;
    const sides: number[] = [-1, 1];
    sides.forEach(sx => {
      ctx.save(); ctx.scale(sx * spread, 1); ctx.globalAlpha = 0.85;
      ctx.beginPath(); ctx.ellipse(r * 0.5, -r * 0.2, r * 0.5, r * 0.4, 0, 0, 6.283);
      ctx.fillStyle = PINK; ctx.fill();
      ctx.beginPath(); ctx.ellipse(r * 0.4, r * 0.4, r * 0.4, r * 0.3, 0, 0, 6.283);
      ctx.fillStyle = PURP; ctx.fill(); ctx.restore();
    });
    ctx.globalAlpha = 1;
    ctx.beginPath(); ctx.ellipse(0, 0, r * 0.12, r * 0.6, 0, 0, 6.283); ctx.fillStyle = "#2a2320"; ctx.fill();
  }
  ctx.restore();
}

// ─── Canvas 1: Air + Pollen → Flower ────────────────────────────────────────
type Grain = { x: number; y: number; vx: number; vy: number; landed: boolean; ph: number };

function PollenBloomCanvas() {
  const cvRef = useRef<HTMLCanvasElement>(null);
  const windRef = useRef(0.5), rateRef = useRef(0.5);
  const stRef = useRef({ raf: 0, t: 0, captured: 0, p: 0, grains: [] as Grain[] });
  const [wind, setWind] = useState(0.5), [rate, setRate] = useState(0.5);
  useEffect(() => { windRef.current = wind; }, [wind]);
  useEffect(() => { rateRef.current = rate; }, [rate]);

  useEffect(() => {
    const cv = cvRef.current!; const ctx = cv.getContext("2d")!;
    const ro = new ResizeObserver(() => { cv.width = cv.offsetWidth || 640; cv.height = cv.offsetHeight || 420; });
    ro.observe(cv); cv.width = cv.offsetWidth || 640; cv.height = cv.offsetHeight || 420;

    function draw() {
      stRef.current.raf = requestAnimationFrame(draw);
      const s = stRef.current; s.t += 0.016;
      const W = cv.width, H = cv.height;
      const wind = windRef.current, rate = rateRef.current;
      const flowerX = W * 0.5, groundY = H * 0.92, stigmaY = groundY - Math.min(W, H) * 0.34;

      ctx.fillStyle = BG; ctx.fillRect(0, 0, W, H);

      let active = 0;
      for (const g of s.grains) if (!g.landed) active++;
      if (Math.random() < rate * 0.6 && active < 180)
        s.grains.push({ x: Math.random() * W, y: -8, vx: 0, vy: 0, landed: false, ph: Math.random() * 6.28 });

      ctx.save(); ctx.globalAlpha = 0.08;
      for (let gx = 0; gx < W; gx += 54)
        for (let gy = 0; gy < H * 0.7; gy += 54) {
          const ang = Math.sin(gy * 0.01 + s.t * 0.3) * 0.6 + wind * 0.8;
          ctx.beginPath(); ctx.moveTo(gx, gy);
          ctx.lineTo(gx + Math.cos(ang) * 14, gy + Math.sin(ang) * 14);
          ctx.strokeStyle = TEAL; ctx.lineWidth = 1; ctx.stroke();
        }
      ctx.restore();

      s.grains.forEach(g => {
        if (!g.landed) {
          const ang = Math.sin(g.y * 0.01 + s.t * 0.3) * 0.6 + wind * 0.8;
          g.vx += Math.cos(ang) * 0.06 + (wind - 0.5) * 0.05;
          g.vy += 0.045; g.vx *= 0.98; g.vy *= 0.99;
          g.x += g.vx; g.y += g.vy;
          const dx = flowerX - g.x, dy = stigmaY - g.y, d = Math.hypot(dx, dy);
          if (d > 0.001 && d < 70) { g.vx += dx / d * 0.12; g.vy += dy / d * 0.12; }
          if (d < 12) { g.landed = true; s.captured++; }
          if (g.y > groundY) g.landed = true;
        }
        const tw = 0.6 + 0.4 * Math.sin(s.t * 3 + g.ph);
        ctx.save(); ctx.globalAlpha = g.landed ? 0.25 : 0.85 * tw;
        ctx.beginPath(); ctx.arc(g.x, g.y, g.landed ? 1.5 : 2.4, 0, 6.283);
        ctx.fillStyle = GOLD; ctx.fill(); ctx.restore();
      });
      if (s.grains.length > 300) s.grains = s.grains.filter(g => !g.landed).slice(-260);

      const target = Math.min(1, s.captured / 120);
      s.p += (target - s.p) * 0.02;
      const p = s.p;

      ctx.beginPath(); ctx.moveTo(flowerX, groundY);
      ctx.quadraticCurveTo(flowerX - 8, (groundY + stigmaY) / 2, flowerX, stigmaY);
      ctx.strokeStyle = GREN; ctx.lineWidth = 3; ctx.stroke();

      const R = Math.min(W, H) * 0.16 * p;
      const nP = Math.max(0, Math.floor(p * 13));
      for (let i = 0; i < nP; i++) {
        const ang = i * GA - Math.PI / 2;
        const rr = R * (0.55 + 0.45 * i / Math.max(1, nP));
        const px = flowerX + Math.cos(ang) * rr * 0.4;
        const py = stigmaY + Math.sin(ang) * rr * 0.4;
        ctx.save(); ctx.translate(px, py); ctx.rotate(ang + Math.PI / 2); ctx.globalAlpha = 0.75;
        const grd = ctx.createLinearGradient(0, 0, 0, -R * 0.7);
        grd.addColorStop(0, PINK); grd.addColorStop(1, PURP);
        ctx.fillStyle = grd;
        ctx.beginPath(); ctx.ellipse(0, -R * 0.35, R * 0.16, R * 0.42, 0, 0, 6.283);
        ctx.fill(); ctx.restore();
      }
      const nF = Math.floor(p * 80);
      for (let i = 0; i < nF; i++) {
        const ang = i * GA, rr = Math.sqrt(i) * R * 0.045;
        ctx.beginPath(); ctx.arc(flowerX + Math.cos(ang) * rr, stigmaY + Math.sin(ang) * rr, 1.6, 0, 6.283);
        ctx.fillStyle = GOLD; ctx.globalAlpha = 0.9; ctx.fill();
      }
      ctx.globalAlpha = 1;

      ctx.font = "bold 11px 'DM Mono',monospace"; ctx.fillStyle = TEAL;
      ctx.fillText(`AIR + POLLEN → FLOWER  ·  captured ${s.captured}  ·  bloom ${(p * 100).toFixed(0)}%  ·  petals ${nP} (Fibonacci)`, 12, 22);
      ctx.font = "8px 'DM Mono',monospace"; ctx.fillStyle = "rgba(255,255,255,0.22)";
      ctx.fillText("wind flow field carries pollen → stigma capture → phyllotaxis bloom at golden angle 137.5°", 12, 36);
    }
    stRef.current.raf = requestAnimationFrame(draw);
    return () => { cancelAnimationFrame(stRef.current.raf); ro.disconnect(); };
  }, []);

  return (
    <div>
      <canvas ref={cvRef} style={{ width: "100%", height: 420, display: "block" }} />
      <div style={sliderRow}>
        <Slider label="Wind" val={wind} set={setWind} />
        <Slider label="Pollen Rate" val={rate} set={setRate} />
        <button style={btn} onClick={() => { stRef.current.captured = 0; stRef.current.p = 0; stRef.current.grains = []; }}>Reset Bloom</button>
      </div>
    </div>
  );
}

// ─── Canvas 2: Scent Plume → Moth Navigation ────────────────────────────────
type Mol = { x: number; y: number; vx: number; vy: number; life: number };

function ScentPlumeCanvas() {
  const cvRef = useRef<HTMLCanvasElement>(null);
  const windRef = useRef(0.5), emitRef = useRef(0.6), todRef = useRef(0.8);
  const stRef = useRef({ raf: 0, t: 0, mols: [] as Mol[], moth: { x: 0, y: 0, vx: 0, vy: 0, cast: 0 } });
  const [wind, setWind] = useState(0.5), [emit, setEmit] = useState(0.6), [tod, setTod] = useState(0.8);
  useEffect(() => { windRef.current = wind; }, [wind]);
  useEffect(() => { emitRef.current = emit; }, [emit]);
  useEffect(() => { todRef.current = tod; }, [tod]);

  useEffect(() => {
    const cv = cvRef.current!; const ctx = cv.getContext("2d")!;
    const ro = new ResizeObserver(() => { cv.width = cv.offsetWidth || 640; cv.height = cv.offsetHeight || 420; });
    ro.observe(cv); cv.width = cv.offsetWidth || 640; cv.height = cv.offsetHeight || 420;
    stRef.current.moth.x = cv.width * 0.9; stRef.current.moth.y = cv.height * 0.5;

    function draw() {
      stRef.current.raf = requestAnimationFrame(draw);
      const s = stRef.current; s.t += 0.016;
      const W = cv.width, H = cv.height;
      const wind = windRef.current, emit = emitRef.current, night = todRef.current;
      const fx = W * 0.12, fy = H * 0.62;
      const lt = (a: number, b: number) => Math.round(a + (b - a) * night);

      const sky = ctx.createLinearGradient(0, 0, 0, H);
      sky.addColorStop(0, `rgb(${lt(30, 4)},${lt(20, 4)},${lt(50, 20)})`);
      sky.addColorStop(1, BG);
      ctx.fillStyle = sky; ctx.fillRect(0, 0, W, H);

      ctx.beginPath(); ctx.arc(W * 0.82, H * 0.18, 16, 0, 6.283);
      ctx.fillStyle = night > 0.5 ? "#dfe8ff" : "#ffd76b"; ctx.globalAlpha = 0.85; ctx.fill(); ctx.globalAlpha = 1;

      const emitRate = emit * (0.4 + 0.6 * night);
      if (Math.random() < emitRate && s.mols.length < 400)
        s.mols.push({ x: fx, y: fy, vx: 0, vy: 0, life: 1 });

      s.mols.forEach(m => {
        const turb = Math.sin(m.y * 0.02 + s.t) * 0.3;
        m.vx += 0.03 * (0.4 + wind) + turb * 0.02;
        m.vy += (Math.random() - 0.5) * 0.12 - 0.01;
        m.vx *= 0.97; m.vy *= 0.97; m.x += m.vx; m.y += m.vy; m.life -= 0.004;
      });
      s.mols = s.mols.filter(m => m.life > 0 && m.x < W + 10 && m.y > -10 && m.y < H + 10);
      s.mols.forEach(m => {
        ctx.save(); ctx.globalAlpha = m.life * 0.4;
        ctx.beginPath(); ctx.arc(m.x, m.y, 5, 0, 6.283);
        ctx.fillStyle = night > 0.5 ? PURP : GOLD; ctx.fill(); ctx.restore();
      });

      const moth = s.moth;
      let conc = 0, cgx = 0, cgy = 0;
      s.mols.forEach(m => {
        const d = Math.hypot(m.x - moth.x, m.y - moth.y);
        if (d < 60) { const w = m.life * (1 - d / 60); conc += w; cgx += (m.x - moth.x) * w; cgy += (m.y - moth.y) * w; }
      });
      if (conc > 0.3) {
        const gl = Math.hypot(cgx, cgy) || 1;
        moth.vx += cgx / gl * 0.25; moth.vy += cgy / gl * 0.25; moth.cast = 0;
      } else {
        moth.cast += 0.15; moth.vx += -0.12; moth.vy += Math.sin(moth.cast) * 0.3;
      }
      moth.vx *= 0.9; moth.vy *= 0.9; moth.x += moth.vx; moth.y += moth.vy;
      if (moth.x < fx + 18 && Math.abs(moth.y - fy) < 26) { moth.x = W * 0.95; moth.y = Math.random() * H; }
      if (moth.x > W) moth.x = W; if (moth.y < 0) moth.y = 0; if (moth.y > H) moth.y = H;

      drawFlower(ctx, fx, fy, Math.min(W, H) * 0.09, night > 0.5 ? PURP : PINK, s.t);
      drawMoth(ctx, moth.x, moth.y, Math.atan2(moth.vy, moth.vx), s.t, night > 0.5);

      ctx.font = "bold 11px 'DM Mono',monospace"; ctx.fillStyle = TEAL;
      const phase = night > 0.5 ? "NIGHT · moth-pollinated" : "DAY · butterfly-pollinated";
      ctx.fillText(`SCENT PLUME  ·  ${phase}  ·  molecules ${s.mols.length}  ·  moth conc ${conc.toFixed(1)}`, 12, 22);
      ctx.font = "8px 'DM Mono',monospace"; ctx.fillStyle = "rgba(255,255,255,0.22)";
      ctx.fillText("VOC emission → turbulent air plume → moth anemotaxis (upwind casting) → pollination", 12, 36);
    }
    stRef.current.raf = requestAnimationFrame(draw);
    return () => { cancelAnimationFrame(stRef.current.raf); ro.disconnect(); };
  }, []);

  return (
    <div>
      <canvas ref={cvRef} style={{ width: "100%", height: 420, display: "block" }} />
      <div style={sliderRow}>
        <Slider label="Wind" val={wind} set={setWind} />
        <Slider label="Emission" val={emit} set={setEmit} />
        <Slider label="Time (0 day → 1 night)" val={tod} set={setTod} />
      </div>
    </div>
  );
}

// ─── Canvas 3: Metamorphosis Loop ───────────────────────────────────────────
function MetamorphosisCanvas() {
  const cvRef = useRef<HTMLCanvasElement>(null);
  const speedRef = useRef(0.5);
  const stRef = useRef({ raf: 0, t: 0, phase: 0, gen: 1 });
  const [speed, setSpeed] = useState(0.5);
  useEffect(() => { speedRef.current = speed; }, [speed]);

  useEffect(() => {
    const cv = cvRef.current!; const ctx = cv.getContext("2d")!;
    const ro = new ResizeObserver(() => { cv.width = cv.offsetWidth || 640; cv.height = cv.offsetHeight || 430; });
    ro.observe(cv); cv.width = cv.offsetWidth || 640; cv.height = cv.offsetHeight || 430;
    const STAGES = [
      { name: "Egg", col: WHT }, { name: "Larva (caterpillar)", col: GREN },
      { name: "Pupa (chrysalis)", col: GOLD }, { name: "Adult (moth · butterfly)", col: PINK },
    ];

    function draw() {
      stRef.current.raf = requestAnimationFrame(draw);
      const s = stRef.current; const speed = speedRef.current;
      s.t += 0.016; s.phase += 0.0025 * (0.3 + speed);
      if (s.phase >= 4) { s.phase -= 4; s.gen++; }
      const W = cv.width, H = cv.height, cx = W * 0.5, cy = H * 0.5, R = Math.min(W, H) * 0.32;
      ctx.fillStyle = BG; ctx.fillRect(0, 0, W, H);

      ctx.beginPath(); ctx.arc(cx, cy, R, 0, 6.283);
      ctx.strokeStyle = "rgba(255,255,255,0.08)"; ctx.lineWidth = 2; ctx.stroke();

      STAGES.forEach((st, i) => {
        const a = i / 4 * 6.283 - Math.PI / 2;
        const nx = cx + Math.cos(a) * R, ny = cy + Math.sin(a) * R;
        const active = Math.floor(s.phase) === i;
        ctx.save(); ctx.globalAlpha = active ? 0.3 : 0.12;
        ctx.beginPath(); ctx.arc(nx, ny, active ? 22 : 16, 0, 6.283); ctx.fillStyle = st.col; ctx.fill(); ctx.restore();
        ctx.beginPath(); ctx.arc(nx, ny, active ? 22 : 16, 0, 6.283);
        ctx.strokeStyle = st.col; ctx.lineWidth = active ? 2 : 1; ctx.stroke();
        ctx.font = "9px 'DM Mono',monospace"; ctx.fillStyle = st.col; ctx.textAlign = "center";
        ctx.fillText(st.name, nx, ny + (ny > cy ? 36 : -28)); ctx.textAlign = "left";
      });

      const ma = s.phase / 4 * 6.283 - Math.PI / 2;
      ctx.beginPath(); ctx.arc(cx + Math.cos(ma) * R, cy + Math.sin(ma) * R, 6, 0, 6.283);
      ctx.fillStyle = TEAL; ctx.fill();

      drawLifeform(ctx, cx, cy, Math.min(W, H) * 0.11, s.phase, s.t);

      const stg = STAGES[Math.floor(s.phase) % 4];
      ctx.font = "bold 11px 'DM Mono',monospace"; ctx.fillStyle = TEAL;
      ctx.fillText(`METAMORPHOSIS LOOP  ·  stage ${stg.name}  ·  generation ${s.gen}`, 12, 22);
      ctx.font = "8px 'DM Mono',monospace"; ctx.fillStyle = "rgba(255,255,255,0.22)";
      ctx.fillText("flower nectar feeds adult → pollination → seed → leaf feeds larva → chrysalis → adult", 12, 36);
    }
    stRef.current.raf = requestAnimationFrame(draw);
    return () => { cancelAnimationFrame(stRef.current.raf); ro.disconnect(); };
  }, []);

  return (
    <div>
      <canvas ref={cvRef} style={{ width: "100%", height: 430, display: "block" }} />
      <div style={sliderRow}>
        <Slider label="Cycle Speed" val={speed} set={setSpeed} />
      </div>
    </div>
  );
}

// ─── Card helpers ────────────────────────────────────────────────────────────
function MCard({ col, label, eq, note }: { col: string; label: string; eq: string; note: string }) {
  return (
    <div style={{ ...panel, borderLeft: `3px solid ${col}` }}>
      <div style={{ fontSize: 12, fontWeight: 700, color: col, marginBottom: 6 }}>{label}</div>
      <div style={{ fontFamily: "'DM Mono',monospace", fontSize: 11, color: WHT, background: "rgba(0,0,0,0.3)",
        padding: "0.5rem 0.7rem", borderRadius: 6, marginBottom: 8, overflowX: "auto" }}>{eq}</div>
      <div style={{ fontSize: 11.5, color: "rgba(255,255,255,0.55)", lineHeight: 1.65 }}>{note}</div>
    </div>
  );
}

function VCard({ col, title, body }: { col: string; title: string; body: string }) {
  return (
    <div style={{ ...panel, borderTop: `2px solid ${col}` }}>
      <div style={{ fontSize: 13, fontWeight: 700, color: col, marginBottom: 8 }}>{title}</div>
      <div style={{ fontSize: 12, color: "rgba(255,255,255,0.6)", lineHeight: 1.7 }}>{body}</div>
    </div>
  );
}

// ─── Page ────────────────────────────────────────────────────────────────────
type Tab = "pollen" | "scent" | "moth" | "synthesis";

const TABS: { id: Tab; label: string }[] = [
  { id: "pollen",    label: "❀ Air + Pollen → Flower" },
  { id: "scent",     label: "≈ Scent Chemistry Plume" },
  { id: "moth",      label: "✦ Moth & Butterfly Loop" },
  { id: "synthesis", label: "△ AETHER Synthesis" },
];

export default function PollenFlowerPage() {
  const [tab, setTab] = useState<Tab>("pollen");

  return (
    <div style={{ minHeight: "100vh", background: BG, color: WHT, padding: "2rem 1.6rem 5rem",
      fontFamily: "'Inter',system-ui,sans-serif" }}>
      <div style={{ maxWidth: 1120, margin: "0 auto" }}>

        {/* Header */}
        <div style={{ marginBottom: "1.6rem" }}>
          <div style={{ fontSize: 9, letterSpacing: "0.4em", color: PINK, textTransform: "uppercase", marginBottom: 8 }}>
            AETHER · Pollination Coherence Engine
          </div>
          <h1 style={{ fontSize: "2rem", fontWeight: 800, margin: "0 0 10px",
            background: `linear-gradient(90deg,${PINK},${GOLD},${PURP})`,
            WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
            Powder Simulator · Air, Pollen &amp; the Making of Flowers
          </h1>
          <p style={{ fontSize: 13.5, color: "rgba(255,255,255,0.55)", maxWidth: 820, lineHeight: 1.75, margin: 0 }}>
            A living chain of three coupled simulations. Air carries pollen powder onto a stigma and a flower
            crystallises into being at the golden angle. The bloom exhales a plume of scent chemicals into the
            wind — and a moth reads that plume as a frequency signature, flying upwind to the source. Its visit
            fertilises the next seed, and the pollinator itself is born through metamorphosis. Every stage is
            drawn from AETHER&apos;s own laws: the coherence field C(x,t), phi-phyllotaxis, the vibrational scent
            decoder, and the Crystallization Model of Intelligence.
          </p>
        </div>

        {/* Tabs */}
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: "1.6rem" }}>
          {TABS.map(tb => (
            <button key={tb.id} onClick={() => setTab(tb.id)}
              style={{ padding: "0.5rem 1rem", borderRadius: 8, fontSize: 12, cursor: "pointer",
                fontFamily: "'DM Mono',monospace",
                background: tab === tb.id ? "rgba(244,114,182,0.15)" : "rgba(255,255,255,0.03)",
                border: `1px solid ${tab === tb.id ? PINK : "rgba(255,255,255,0.1)"}`,
                color: tab === tb.id ? PINK : "rgba(255,255,255,0.55)" }}>
              {tb.label}
            </button>
          ))}
        </div>

        {/* POLLEN TAB */}
        {tab === "pollen" && (
          <div>
            <div style={{ ...panel, padding: 0, overflow: "hidden", marginBottom: "1.4rem" }}>
              <PollenBloomCanvas />
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(240px,1fr))", gap: "1rem", marginBottom: "1.2rem" }}>
              <MCard col={GOLD} label="Coherence Deposition"
                eq="P_land = |C(x,t)| · (1 − drag);  C = A·e^{i(phi − wt)}"
                note="A pollen grain lands where the flower's coherence field is strongest. The stigma is a coherence attractor — the same C(x,t) field that governs every AETHER substrate governs which grains bond and which blow past. Capture is not random; it is a resonance match between grain and stigma." />
              <MCard col={PINK} label="Golden Angle Bloom"
                eq="theta = 137.507° = 360° / phi²;  r_n = c·√n"
                note="Petals and florets are placed at the golden angle so no two ever overlap or shadow each other — the densest possible packing of a growing surface. This is why a flower IS a Fibonacci device (see Fibonacci Replicant). The bloom you watch form uses the exact phyllotaxis law." />
              <MCard col={TEAL} label="Air as Carrier Medium"
                eq="v_settle = 2·r²·(rho_p − rho_air)·g / (9·mu);  Stokes"
                note="Pollen (10–100 microns) settles slowly enough that turbulent air keeps it aloft for kilometres. The flow-field arrows in the sim are the wind's coherence structure — grains ride the streamlines, drifting until the stigma's attractor captures them." />
              <MCard col={GREN} label="Powder → Structure"
                eq="mass_flower = mass_pollen · phi^n;  self-assembly"
                note="A microgram of powder becomes a whole flower. The same principle as the self-replicating planetary powder: a tiny coherent seed of information unfolds phi-exponentially into macroscopic structure, drawing raw matter from air, water, and soil." />
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
              <VCard col={PINK} title="Air + Pollen = Information Transfer"
                body="Pollen is not dust — it is a sealed packet of genetic information wrapped in the toughest biopolymer known (sporopollenin, which survives millions of years in the fossil record). Air is the transport bus. When a grain lands on a compatible stigma, it germinates a tube that delivers its payload to the ovule. The whole event is a coherence handshake: powder carrying information, air carrying the powder, and a field deciding where it bonds." />
              <VCard col={GOLD} title="Why the Flower Is Fibonacci"
                body="Watch the bloom fill in: petals appear in the Fibonacci count (1, 2, 3, 5, 8, 13) and the central florets spiral at 137.5°. This is not decoration — it is the optimal solution to growing on a finite disk with maximum light capture and minimum self-shadowing. AETHER treats the flower as the canonical proof that golden-ratio geometry is what coherent growth looks like in any medium." />
            </div>
          </div>
        )}

        {/* SCENT TAB */}
        {tab === "scent" && (
          <div>
            <div style={{ ...panel, padding: 0, overflow: "hidden", marginBottom: "1.4rem" }}>
              <ScentPlumeCanvas />
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(240px,1fr))", gap: "1rem", marginBottom: "1.2rem" }}>
              <MCard col={GOLD} label="VOC Emission Rhythm"
                eq="E(t) = E_0·(1 + sin(2*pi*t / 24h));  circadian"
                note="Flowers release volatile organic compounds (terpenes, benzenoids, fatty-acid derivatives) on a daily clock. Day-blooming flowers peak in sunlight for butterflies; night-blooming flowers (moonflower, jasmine) peak in darkness for moths. Slide Time toward 1 and watch the emission — and the flower colour — shift to the night regime." />
              <MCard col={TEAL} label="Scent as Frequency Signature"
                eq="detect ∝ tunneling @ vibrational freq (Turin)"
                note="AETHER's Bio-Photonic Scent page models smell as vibrational spectroscopy: a receptor detects the molecular vibration frequency, not just its shape. Each scent is therefore a spectral fingerprint. The plume a flower emits is a broadcast in chemical-frequency space that the right pollinator is tuned to." />
              <MCard col={PURP} label="Plume Anemotaxis"
                eq="v_moth = k·∇C  when C > threshold;  else cast upwind"
                note="A moth cannot see the flower — it navigates the turbulent scent plume. When it senses molecules it climbs the concentration gradient; when it loses them it 'casts', zigzagging crosswind while pushing upwind until it re-acquires the trail. Watch the moth in the sim do exactly this." />
              <MCard col={PINK} label="Nectar Guides &amp; UV"
                eq="reflectance(UV) → bullseye pattern; landing target"
                note="Beyond scent, flowers paint ultraviolet 'nectar guides' invisible to us but blazing to pollinator eyes — a landing bullseye pointing at the reward. Scent draws the pollinator from afar; UV guides land it precisely on the anthers where pollen transfers." />
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
              <VCard col={TEAL} title="The Scent Is a Message"
                body="A flower's fragrance is a chemical sentence written in dozens of volatile molecules, each a vibrational note. The blend, ratio, and timing encode species identity, reward level, and even whether the flower has already been visited (some emit a 'don't bother' repellent after pollination). AETHER reads this as a coherent broadcast: information encoded in a molecular-frequency spectrum, transmitted through the diffusive medium of air." />
              <VCard col={PURP} title="Day vs Night Chemistry"
                body="Butterfly flowers (day) tend toward sweet, light, terpene-rich scents with bold visible colour and UV guides. Moth flowers (night) go heavy on white or pale petals — visible in moonlight — and pump out powerful, musky, often nocturnal-peaking benzenoids that carry far on cool night air. Slide Time in the simulation to move between these two coevolved chemistries and see the pollinator swap from butterfly to moth." />
            </div>
          </div>
        )}

        {/* MOTH TAB */}
        {tab === "moth" && (
          <div>
            <div style={{ ...panel, padding: 0, overflow: "hidden", marginBottom: "1.4rem" }}>
              <MetamorphosisCanvas />
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(240px,1fr))", gap: "1rem", marginBottom: "1.2rem" }}>
              <MCard col={PINK} label="Metamorphosis as Phase Transition"
                eq="order jumps: egg → larva → pupa → imago"
                note="Complete metamorphosis is a biological phase transition. Inside the chrysalis the caterpillar largely dissolves into imaginal-disc 'seed cells' and re-crystallises into a winged adult — a full re-ordering of matter, exactly the Scattered → Nucleation → Ordering → Lock arc of AETHER's Crystallization Atlas, run on flesh." />
              <MCard col={GOLD} label="Pollination Coupling"
                eq="seed_set ∝ visits · pollen_load · compatibility"
                note="The adult drinks nectar and, dusted with pollen, carries it to the next flower. Seed production scales with visit frequency and pollen load. The flower feeds the pollinator; the pollinator makes the flower's seeds. Neither closes its loop alone — they are one coupled coherence engine." />
              <MCard col={TEAL} label="Coevolution Lock"
                eq="corolla_depth ≈ proboscis_length"
                note="Darwin saw a Madagascan orchid with a 30 cm nectar spur and predicted a moth with a 30 cm tongue must exist — decades later, it was found. Flower and pollinator tune to each other over generations until their geometries lock. This is coherence selection: two species converging on a shared resonant form." />
              <MCard col={GREN} label="Larva Needs the Leaf"
                eq="host_plant → larval biomass → next adult"
                note="The adult needs nectar, but the caterpillar needs specific host leaves (monarchs → milkweed). So the plant feeds BOTH ends of the life cycle: leaves grow the larva, flowers fuel the adult. Break either link and the loop collapses — which is why habitat loss hits pollinators so hard." />
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
              <VCard col={GOLD} title="Metamorphosis as Crystallization"
                body="AETHER's core claim is that intelligence and form arise through crystallization — scattered elements nucleating into ordered structure. The chrysalis is the purest visible example: a larva breaks down into a near-liquid of stem-like cells, then re-assembles along imaginal-disc templates into a completely new body plan with wings, compound eyes, and a proboscis. Same matter, higher order. The Crystallization Model of Intelligence and the butterfly's pupa are the same process at different substrates." />
              <VCard col={PINK} title="The Pollinator Loop Is a Coherence Engine"
                body="Trace the full cycle: air carries pollen, pollen makes seeds, seeds grow plants, plants grow leaves and flowers, leaves feed caterpillars, flowers feed the adults those caterpillars become, and the adults carry the next generation of pollen. It is a closed loop that pumps genetic information around an ecosystem using air, light, and sugar as the only inputs. AETHER treats this as the archetype of a self-sustaining coherence engine — the same architecture it aims to build in synthetic substrates." />
            </div>
          </div>
        )}

        {/* SYNTHESIS TAB */}
        {tab === "synthesis" && (
          <div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.2rem", marginBottom: "1.6rem" }}>
              <VCard col={PINK} title="One Chain, Four Media"
                body="Powder (pollen) travels through air, bonds to a flower (solid crystallised structure), is answered by scent (a gas-phase broadcast), and completes through a moth (a living re-crystallising body). Solid, gas, living, and airborne — one coherence signal carried unbroken across four media. This is the same 'unbreakable field through four media' idea AETHER explores on the Electron Field page, expressed here in biology." />
              <VCard col={GOLD} title="Information Is the Payload"
                body="At every step the physical mass is almost irrelevant — a microgram of pollen, a few nanograms of scent, a gram of moth. What moves is information: genetic packets, chemical-frequency messages, learned flight paths. AETHER's thesis is that coherent systems are defined by the information they preserve, not the matter they are made of. The flower proves it." />
              <VCard col={TEAL} title="Cross-Links Within AETHER"
                body="This page completes a triangle already in AETHER. Fibonacci Replicant supplies the phi-phyllotaxis bloom law and the powder-to-structure principle. Bio-Photonic Scent supplies the vibrational (Turin) theory of smell and the butterfly photonic crystal. The Crystallization Atlas supplies the Scattered → Lock arc that metamorphosis follows. Together they describe pollination as an end-to-end coherence engine." />
              <VCard col={PURP} title="Why This Matters"
                body="Understand the pollinator loop and you understand AETHER's blueprint for any self-sustaining system: distribute information as light, cheap, resilient packets; use ambient media (air, light, sugar) as the transport and energy; let golden-ratio geometry do the structural optimisation for free; and close the loop so every output feeds a future input. Flowers, moths, and butterflies have been running this engine for 100 million years." />
            </div>

            <div style={{ ...panel, borderLeft: `3px solid ${GOLD}`, padding: "1.6rem 2rem" }}>
              <div style={{ fontSize: 9, letterSpacing: "0.35em", color: GOLD, textTransform: "uppercase", marginBottom: 12 }}>
                The Unified Statement
              </div>
              <p style={{ fontSize: 14, color: "rgba(255,255,255,0.72)", lineHeight: 1.85, margin: 0 }}>
                Air lifts a grain of powder. A coherence field decides where it lands. A flower crystallises at the
                golden angle and exhales a message written in molecular frequencies. Across the dark, a moth — itself
                just re-crystallised from a dissolved caterpillar — reads that frequency and flies upwind to answer it.
                In the meeting, the next seed is set. There is no waste, no combustion, no central controller: only
                information, geometry, and coupled loops. This is what AETHER means by a living system — and every
                spring, the whole planet runs it at once.
              </p>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
