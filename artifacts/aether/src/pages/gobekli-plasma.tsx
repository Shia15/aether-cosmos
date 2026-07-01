import { useEffect, useRef, useState } from "react";

const ANIMALS = [
  { name: "Serpent", sym: "𓆙", color: "#4ade80", freq: 3 },
  { name: "Fox", sym: "𓃱", color: "#f59e0b", freq: 6 },
  { name: "Vulture", sym: "𓅃", color: "#a78bfa", freq: 9 },
  { name: "Scorpion", sym: "𓆞", color: "#f87171", freq: 3 },
  { name: "Boar", sym: "𓃰", color: "#fb923c", freq: 6 },
  { name: "Ibis", sym: "𓅜", color: "#38bdf8", freq: 9 },
  { name: "Aurochs", sym: "𓃗", color: "#e879f9", freq: 3 },
];

const MODES: [string, string][] = [
  ["ring", "Ring Walk"],
  ["random", "Random Hop"],
  ["cluster", "Frequency Cluster"],
];

function hexToRgb(h: string): [number, number, number] {
  h = h.replace("#", "");
  return [
    parseInt(h.substring(0, 2), 16),
    parseInt(h.substring(2, 4), 16),
    parseInt(h.substring(4, 6), 16),
  ];
}
function rgb(c: number[], a: number) {
  return `rgba(${c[0]},${c[1]},${c[2]},${a})`;
}
function lightningPath(
  x1: number, y1: number, x2: number, y2: number,
  segments: number, jitter: number,
) {
  const pts = [{ x: x1, y: y1 }];
  const ang = Math.atan2(y2 - y1, x2 - x1) + Math.PI / 2;
  for (let i = 1; i < segments; i++) {
    const t = i / segments;
    const bx = x1 + (x2 - x1) * t;
    const by = y1 + (y2 - y1) * t;
    const amt = (Math.random() - 0.5) * jitter * Math.sin(t * Math.PI);
    pts.push({ x: bx + Math.cos(ang) * amt, y: by + Math.sin(ang) * amt });
  }
  pts.push({ x: x2, y: y2 });
  return pts;
}

export default function GobekliPlasmaPage() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fromRef = useRef<HTMLSpanElement>(null);
  const toRef = useRef<HTMLSpanElement>(null);
  const freqRef = useRef<HTMLSpanElement>(null);

  const [playing, setPlaying] = useState(true);
  const [speed, setSpeed] = useState(1);
  const [modeIdx, setModeIdx] = useState(0);

  const playingRef = useRef(true);
  const speedRef = useRef(1);
  const modeRef = useRef("ring");

  useEffect(() => {
    const cv = canvasRef.current;
    if (!cv) return;
    const ctx = cv.getContext("2d");
    if (!ctx) return;
    const DPR = Math.min(window.devicePixelRatio || 1, 2);

    function resize() {
      const r = cv!.getBoundingClientRect();
      cv!.width = Math.round(r.width * DPR);
      cv!.height = Math.round(r.height * DPR);
      ctx!.setTransform(DPR, 0, 0, DPR, 0, 0);
    }
    resize();

    const W = () => cv.width / DPR;
    const H = () => cv.height / DPR;
    const CX = () => W() / 2;
    const CY = () => H() * 0.5;
    const R1 = () => Math.min(W(), H()) * 0.155;
    const R2 = () => Math.min(W(), H()) * 0.26;

    const PILLARS: { ring: number; angle: number; animal: typeof ANIMALS[0]; h: number }[] = [];
    for (let i = 0; i < 9; i++) {
      const a = (i / 9) * Math.PI * 2 - Math.PI / 2;
      PILLARS.push({ ring: 0, angle: a, animal: ANIMALS[i % 7], h: 30 });
    }
    for (let i = 0; i < 9; i++) {
      const a = (i / 9) * Math.PI * 2 - Math.PI / 2 + Math.PI / 9;
      PILLARS.push({ ring: 1, angle: a, animal: ANIMALS[(i + 2) % 7], h: 21 });
    }

    const px = (p: typeof PILLARS[0]) => CX() + Math.cos(p.angle) * (p.ring === 0 ? R1() : R2());
    const py = (p: typeof PILLARS[0]) => CY() + Math.sin(p.angle) * (p.ring === 0 ? R1() : R2()) * 0.55;
    const topX = (p: typeof PILLARS[0]) => px(p);
    const topY = (p: typeof PILLARS[0]) => py(p) - p.h;

    const STARS = Array.from({ length: 80 }, () => ({
      x: Math.random(), y: Math.random() * 0.5,
      r: Math.random() * 0.8 + 0.3, a: Math.random() * 0.5 + 0.15,
      tw: Math.random() * Math.PI * 2,
    }));

    let current = 0;
    let timer = 0;
    const baseInterval = 46;
    let activeArc: any = null;
    let flashes: any[] = [];
    let sparks: any[] = [];

    function pickNext() {
      const mode = modeRef.current;
      if (mode === "ring") return (current + 1) % 18;
      if (mode === "random") {
        let r;
        do { r = Math.floor(Math.random() * 18); } while (r === current);
        return r;
      }
      const freq = PILLARS[current].animal.freq;
      const same = PILLARS.map((p, i) => i).filter(
        (i) => i !== current && PILLARS[i].animal.freq === freq,
      );
      if (same.length && Math.random() < 0.82) return same[Math.floor(Math.random() * same.length)];
      let r;
      do { r = Math.floor(Math.random() * 18); } while (r === current);
      return r;
    }

    function spawnArc(fromIdx: number, toIdx: number) {
      const a = PILLARS[fromIdx], b = PILLARS[toIdx];
      activeArc = {
        age: 0, maxAge: 30, col: hexToRgb(b.animal.color),
        x1: topX(a), y1: topY(a), x2: topX(b), y2: topY(b), pts: [],
      };
      activeArc.pts = lightningPath(activeArc.x1, activeArc.y1, activeArc.x2, activeArc.y2, 9, Math.min(W(), H()) * 0.045);
      flashes.push({ x: topX(b), y: topY(b), radius: 0, maxR: Math.min(W(), H()) * 0.08, col: hexToRgb(b.animal.color), alpha: 0.9 });
      for (let i = 0; i < 8; i++) {
        const ang = Math.random() * Math.PI * 2, sp = 0.5 + Math.random() * 1.3;
        sparks.push({ x: topX(b), y: topY(b), vx: Math.cos(ang) * sp, vy: Math.sin(ang) * sp - 0.25, life: 22 + Math.random() * 14, maxLife: 36, col: hexToRgb(b.animal.color) });
      }
      if (fromRef.current) fromRef.current.textContent = a.animal.sym + " " + a.animal.name;
      if (toRef.current) toRef.current.textContent = b.animal.sym + " " + b.animal.name;
      if (freqRef.current) freqRef.current.textContent = String(b.animal.freq);
    }

    function drawPillar(p: typeof PILLARS[0]) {
      const bx = px(p), by = py(p), tx = topX(p), ty = topY(p);
      ctx!.strokeStyle = "rgba(220,225,235,0.5)"; ctx!.lineWidth = p.ring === 0 ? 3 : 2.2;
      ctx!.beginPath(); ctx!.moveTo(bx, by); ctx!.lineTo(tx, ty); ctx!.stroke();
      ctx!.beginPath(); ctx!.moveTo(tx - 7, ty); ctx!.lineTo(tx + 7, ty);
      ctx!.strokeStyle = "rgba(220,225,235,0.65)"; ctx!.lineWidth = 3; ctx!.stroke();
      ctx!.beginPath(); ctx!.arc(tx, ty, 1.8, 0, Math.PI * 2); ctx!.fillStyle = p.animal.color; ctx!.fill();
      ctx!.font = "11px serif"; ctx!.textAlign = "center"; ctx!.fillStyle = p.animal.color; ctx!.globalAlpha = 0.85;
      ctx!.fillText(p.animal.sym, tx, ty - 9); ctx!.globalAlpha = 1;
    }

    let t = 0;
    let raf = 0;
    function frame() {
      t++;
      const playing = playingRef.current;
      const speed = speedRef.current;
      const w = W(), h = H();
      ctx!.fillStyle = "#000"; ctx!.fillRect(0, 0, w, h);
      const sky = ctx!.createRadialGradient(CX(), CY(), 0, CX(), CY(), Math.max(w, h) * 0.8);
      sky.addColorStop(0, "#050a12"); sky.addColorStop(0.5, "#03060a"); sky.addColorStop(1, "#000");
      ctx!.fillStyle = sky; ctx!.fillRect(0, 0, w, h);

      STARS.forEach((s) => {
        const tw = 0.6 + 0.4 * Math.sin(t * 0.02 + s.tw);
        ctx!.beginPath(); ctx!.arc(s.x * w, s.y * h, s.r, 0, Math.PI * 2);
        ctx!.fillStyle = `rgba(255,255,255,${s.a * tw})`; ctx!.fill();
      });

      const groundY = CY() + R2() * 0.55 + 18;
      const grd = ctx!.createLinearGradient(0, groundY, 0, h);
      grd.addColorStop(0, "#0a0d13"); grd.addColorStop(1, "#000");
      ctx!.fillStyle = grd; ctx!.fillRect(0, groundY, w, h - groundY);

      const sorted = [...PILLARS].sort((a, b) => py(a) - py(b));
      sorted.forEach(drawPillar);

      if (playing) {
        timer -= speed;
        if (timer <= 0) { const next = pickNext(); spawnArc(current, next); current = next; timer = baseInterval; }
      }

      ctx!.save(); ctx!.globalCompositeOperation = "lighter";

      if (activeArc) {
        activeArc.age += playing ? speed : 0;
        if (activeArc.age < 10) activeArc.pts = lightningPath(activeArc.x1, activeArc.y1, activeArc.x2, activeArc.y2, 9, Math.min(w, h) * 0.045 * (1 - activeArc.age / 10));
        const a = Math.max(0, 1 - activeArc.age / activeArc.maxAge);
        const pts = activeArc.pts;
        ctx!.beginPath(); ctx!.moveTo(pts[0].x, pts[0].y);
        for (let i = 1; i < pts.length; i++) ctx!.lineTo(pts[i].x, pts[i].y);
        ctx!.strokeStyle = rgb(activeArc.col, a * 0.18); ctx!.lineWidth = 5; ctx!.lineCap = "round"; ctx!.lineJoin = "round"; ctx!.stroke();
        ctx!.strokeStyle = rgb([255, 255, 255], a * 0.9); ctx!.lineWidth = 1.3; ctx!.stroke();
        if (activeArc.age > activeArc.maxAge) activeArc = null;
      }

      flashes = flashes.filter((f) => f.alpha > 0.01);
      flashes.forEach((f) => {
        f.radius += 2.0 * speed; f.alpha *= 0.91;
        ctx!.beginPath(); ctx!.arc(f.x, f.y, f.radius, 0, Math.PI * 2);
        ctx!.strokeStyle = rgb(f.col, f.alpha * 0.6); ctx!.lineWidth = 1.2; ctx!.stroke();
        ctx!.beginPath(); ctx!.arc(f.x, f.y, 3.2, 0, Math.PI * 2);
        ctx!.fillStyle = rgb(f.col, f.alpha); ctx!.fill();
      });

      sparks = sparks.filter((s) => s.life > 0);
      sparks.forEach((s) => {
        s.x += s.vx * speed; s.y += s.vy * speed; s.vy += 0.022 * speed; s.life -= speed;
        const a = Math.max(s.life / s.maxLife, 0);
        ctx!.beginPath(); ctx!.arc(s.x, s.y, 1.2, 0, Math.PI * 2);
        ctx!.fillStyle = rgb(s.col, a); ctx!.fill();
      });

      ctx!.restore();
      raf = requestAnimationFrame(frame);
    }
    raf = requestAnimationFrame(frame);
    window.addEventListener("resize", resize);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
    };
  }, []);

  return (
    <div style={{ minHeight: "100vh", background: "#05070c", color: "#cdd5de", fontFamily: "'IBM Plex Mono', monospace", padding: 20 }}>
      <div style={{ textAlign: "center", marginBottom: 16 }}>
        <div style={{ fontSize: 11, letterSpacing: "3px", color: "#ffd060" }}>GÖBEKLI TEPE · PLASMA ARC</div>
        <div style={{ fontSize: 22, fontWeight: 800, color: "#e8edf3", marginTop: 4, fontFamily: "'Space Grotesk', sans-serif" }}>Plasma Bounce · Eighteen Pillars</div>
        <div style={{ fontSize: 12, color: "#7c8794", marginTop: 4 }}>Two rings · a jagged plasma arc jumping between pillars in sequential, random, or frequency-cluster patterns.</div>
      </div>

      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 10, maxWidth: 640, margin: "0 auto" }}>
        <canvas ref={canvasRef} style={{ display: "block", width: "100%", maxWidth: 600, aspectRatio: "1 / 1", borderRadius: 10, background: "#000" }} />
        <div style={{ fontSize: 12, textAlign: "center" }}>
          <span ref={fromRef}>—</span> → <span ref={toRef}>—</span> &nbsp;·&nbsp; freq{" "}
          <span ref={freqRef} style={{ color: "#ffd060" }}>—</span> &nbsp;·&nbsp; mode{" "}
          <span style={{ color: "#ffd060" }}>{MODES[modeIdx][1].toLowerCase()}</span>
        </div>
        <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap", justifyContent: "center" }}>
          <button
            onClick={() => { const p = !playing; setPlaying(p); playingRef.current = p; }}
            style={btnStyle}
          >
            {playing ? "⏸ Pause" : "▶ Play"}
          </button>
          <span style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: 11, color: "rgba(255,200,80,0.6)" }}>
            <span>speed</span>
            <input
              type="range" min={0.3} max={3} step={0.1} value={speed}
              onChange={(e) => { const v = parseFloat(e.target.value); setSpeed(v); speedRef.current = v; }}
              style={{ accentColor: "#ffd060" }}
            />
            <span>{speed.toFixed(1)}×</span>
          </span>
          <button
            onClick={() => { const n = (modeIdx + 1) % MODES.length; setModeIdx(n); modeRef.current = MODES[n][0]; }}
            style={btnStyle}
          >
            Mode: {MODES[modeIdx][1]}
          </button>
        </div>
        <div style={{ fontSize: 11, color: "#7c8794", maxWidth: 520, textAlign: "center", lineHeight: 1.5 }}>
          arc = jagged path · flash = landing · bounce = sequence — artistic plasma rendering, same 18-pillar layout and animal palette as the full engine.
        </div>
      </div>
    </div>
  );
}

const btnStyle: React.CSSProperties = {
  fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700, background: "transparent",
  border: "1px solid rgba(255,200,80,0.4)", color: "#ffd060", fontSize: 11.5, letterSpacing: "0.05em",
  padding: "7px 13px", cursor: "pointer", borderRadius: 5, textTransform: "uppercase",
};
