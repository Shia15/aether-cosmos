import { useEffect, useRef, useState } from "react";
import katex from "katex";
import "katex/dist/katex.min.css";
import imgVortexStone from "@assets/IMG_3682_1782767136954.jpeg";
import imgCutawayVortex from "@assets/IMG_3683_1782767136954.jpeg";
import imgPyramidGate from "@assets/IMG_3686_1782767136954.jpeg";
import imgResonantTool from "@assets/IMG_3684_1782767136954.jpeg";

const V = {
  bg: "#05060C", aurora: "#00FFB2", gold: "#C8A030", blue: "#4488FF",
  vio: "#9966FF", amb: "#FF9933", rose: "#FF6699", plasma: "#FF4477",
  green: "#44CC77", dim: "#3A5060", ink: "#B8CCE8", fire: "#FF6622",
};
const MONO = "'Space Mono',monospace";
const SERIF = "'Crimson Pro',serif";
const DISP = "'Cinzel',serif";

function kx(tex: string, dm = false) {
  try {
    return katex.renderToString(tex, { throwOnError: false, output: "html", displayMode: dm });
  } catch {
    return tex;
  }
}

function fitCanvas(canvas: HTMLCanvasElement, h: number) {
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  const w = canvas.clientWidth || 640;
  canvas.width = Math.round(w * dpr);
  canvas.height = Math.round(h * dpr);
  const ctx = canvas.getContext("2d");
  if (ctx) ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  return { w, h };
}

function prefersReduced() {
  return typeof window !== "undefined" &&
    window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

function Chip({ children, col }: { children: React.ReactNode; col: string }) {
  return (
    <span style={{ fontFamily: MONO, fontSize: 8, color: col, letterSpacing: "0.1em",
      border: `1px solid ${col}44`, borderRadius: 4, padding: "3px 8px",
      background: `${col}0C`, whiteSpace: "nowrap" }}>{children}</span>
  );
}

function SectionHead({ n, title, col }: { n: string; title: string; col: string }) {
  return (
    <div style={{ display: "flex", alignItems: "baseline", gap: 12, marginBottom: 14 }}>
      <div style={{ fontFamily: DISP, fontSize: "1.1rem", color: col, letterSpacing: "0.18em" }}>{n}</div>
      <div style={{ flex: 1, height: 1, background: `linear-gradient(90deg,${col}55,transparent)` }} />
      <div style={{ fontFamily: MONO, fontSize: 9, color: col, letterSpacing: "0.16em" }}>{title}</div>
    </div>
  );
}

function Slider({ label, value, min, max, step, col, onChange, fmt }: {
  label: string; value: number; min: number; max: number; step: number; col: string;
  onChange: (v: number) => void; fmt: (v: number) => string;
}) {
  return (
    <label style={{ display: "block", marginBottom: 9 }}>
      <div style={{ display: "flex", justifyContent: "space-between", fontFamily: MONO,
        fontSize: 8, color: V.dim, letterSpacing: "0.1em", marginBottom: 3 }}>
        <span>{label}</span><span style={{ color: col }}>{fmt(value)}</span>
      </div>
      <input type="range" min={min} max={max} step={step} value={value}
        onChange={(e) => onChange(parseFloat(e.target.value))}
        style={{ width: "100%", accentColor: col, height: 3 }} />
    </label>
  );
}

function Readout({ label, col, vref }: { label: string; col: string; vref: React.RefObject<HTMLSpanElement | null> }) {
  return (
    <div style={{ padding: "8px 10px", borderRadius: 5, background: `${col}0C`, border: `1px solid ${col}30` }}>
      <div style={{ fontFamily: MONO, fontSize: 7, color: col, letterSpacing: "0.12em", marginBottom: 3 }}>{label.toUpperCase()}</div>
      <span ref={vref} style={{ fontFamily: MONO, fontSize: "0.92rem", color: col }}>--</span>
    </div>
  );
}

function Plate({ src, title, cap, col }: { src: string; title: string; cap: string; col: string }) {
  return (
    <figure style={{ margin: 0, borderRadius: 10, overflow: "hidden",
      border: `1px solid ${col}30`, background: `${col}08` }}>
      <img src={src} alt={title} loading="lazy"
        style={{ width: "100%", display: "block", aspectRatio: "3 / 4", objectFit: "cover" }} />
      <figcaption style={{ padding: "10px 12px" }}>
        <div style={{ fontFamily: MONO, fontSize: 8, color: col, letterSpacing: "0.12em", marginBottom: 4 }}>
          {title.toUpperCase()}
        </div>
        <div style={{ fontFamily: SERIF, fontSize: "0.82rem", color: "rgba(184,204,232,0.65)", lineHeight: 1.4 }}>
          {cap}
        </div>
      </figcaption>
    </figure>
  );
}

function Anno({ k, v, col }: { k: string; v: string; col: string }) {
  return (
    <div style={{ display: "flex", gap: 10, alignItems: "baseline", padding: "5px 0",
      borderBottom: `1px solid ${col}18` }}>
      <span style={{ fontFamily: MONO, fontSize: 8, color: col, letterSpacing: "0.08em",
        minWidth: 104, flexShrink: 0 }}>{k}</span>
      <span style={{ fontFamily: SERIF, fontSize: "0.82rem", color: "rgba(184,204,232,0.7)", lineHeight: 1.4 }}>{v}</span>
    </div>
  );
}

// rhombus path centred at (cx,cy) with half-width hw, half-height hh
function rhombusPath(ctx: CanvasRenderingContext2D, cx: number, cy: number, hw: number, hh: number) {
  ctx.beginPath();
  ctx.moveTo(cx, cy - hh);
  ctx.lineTo(cx + hw, cy);
  ctx.lineTo(cx, cy + hh);
  ctx.lineTo(cx - hw, cy);
  ctx.closePath();
}

interface Spark { x: number; y: number; ph: number; glow: number }

// ── SIM 1 — Rhombus-squared building with a vortex aperture carved in energy ──────
function VortexApertureCanvas() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const gamRef = useRef(3.0);    // circulation Gamma
  const raRef = useRef(46);      // aperture radius (px)
  const nestRef = useRef(3);     // rhombus-squared nesting / grid density
  const thrRef = useRef(0.6);    // slip threshold
  const omRef = useRef(1.0);     // swirl speed

  const [gam, setGam] = useState(3.0);
  const [ra, setRa] = useState(46);
  const [nest, setNest] = useState(3);
  const [thr, setThr] = useState(0.6);
  const [om, setOm] = useState(1.0);

  const vR = useRef<HTMLSpanElement | null>(null);
  const cR = useRef<HTMLSpanElement | null>(null);
  const gR = useRef<HTMLSpanElement | null>(null);
  const sR = useRef<HTMLSpanElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    let dim = fitCanvas(canvas, 420);
    const onResize = () => { dim = fitCanvas(canvas, 420); };
    window.addEventListener("resize", onResize);
    const reduce = prefersReduced();

    const sparks: Spark[] = [];
    const Rmax = () => Math.min(dim.w, dim.h) * 0.45;
    const spawn = (s: Spark) => {
      const ang = Math.random() * Math.PI * 2;
      const rr = Rmax() * (0.78 + Math.random() * 0.2);
      s.x = dim.w / 2 + Math.cos(ang) * rr;
      s.y = dim.h / 2 + Math.sin(ang) * rr * 0.92;
      s.ph = Math.random() * Math.PI * 2;
      s.glow = 0.2;
    };
    for (let i = 0; i < 220; i++) { const s = { x: 0, y: 0, ph: 0, glow: 0 }; spawn(s); sparks.push(s); }

    let raf = 0, t = 0, slips = 0, slipRate = 0, frames = 0;

    const draw = () => {
      const ctx = canvas.getContext("2d");
      if (!ctx) { raf = requestAnimationFrame(draw); return; }
      const w = dim.w, h = dim.h, cx = w / 2, cy = h / 2;
      const Gamma = gamRef.current, rA = raRef.current, N = nestRef.current;
      const thresh = thrRef.current, swirl = omRef.current;
      const dt = reduce ? 0 : 1;
      t += dt / 60; frames++;

      ctx.clearRect(0, 0, w, h);
      ctx.fillStyle = "#05060C";
      ctx.fillRect(0, 0, w, h);

      const hw = w * 0.42, hh = h * 0.45;

      // aperture coherence: stronger swirl + tighter hole => higher |C|
      const Cap = 1 - Math.exp(-Gamma * (60 / (rA + 30)));
      const gateOpen = Cap > thresh;

      // ── rhombus-squared lattice (a rhombus tiled by rhombi), clipped to the shell
      ctx.save();
      rhombusPath(ctx, cx, cy, hw, hh);
      ctx.clip();
      const cols = 2 + N * 2;
      // two families of parallel lines along the rhombus edges => diamond grid
      for (let k = -cols; k <= cols; k++) {
        const f = k / cols;
        ctx.strokeStyle = `rgba(153,102,255,${0.10 + 0.06 * (1 - Math.abs(f))})`;
        ctx.lineWidth = 0.7;
        // family A: parallel to top-right edge
        ctx.beginPath();
        ctx.moveTo(cx + f * hw, cy - hh + Math.abs(f) * 0);
        ctx.lineTo(cx + hw + f * hw, cy);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(cx - hw + f * hw, cy);
        ctx.lineTo(cx + f * hw, cy + hh);
        ctx.stroke();
        // family B: mirrored
        ctx.beginPath();
        ctx.moveTo(cx + f * hw, cy - hh);
        ctx.lineTo(cx - hw + f * hw, cy);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(cx + hw + f * hw, cy);
        ctx.lineTo(cx + f * hw, cy + hh);
        ctx.stroke();
      }
      ctx.restore();

      // nested rhombi rings (the "squared" recursion)
      for (let i = 1; i <= N; i++) {
        const s = 1 - i / (N + 1);
        rhombusPath(ctx, cx, cy, hw * s, hh * s);
        ctx.strokeStyle = `rgba(0,255,178,${0.06 + 0.05 * s})`;
        ctx.lineWidth = 1;
        ctx.stroke();
      }

      // outer shell
      rhombusPath(ctx, cx, cy, hw, hh);
      ctx.strokeStyle = `rgba(0,255,178,0.55)`;
      ctx.lineWidth = 1.6;
      ctx.stroke();

      // ── carved vortex hole: dark well + rotating spiral arms
      const hole = ctx.createRadialGradient(cx, cy, 2, cx, cy, rA * 1.4);
      hole.addColorStop(0, "rgba(0,0,0,0.95)");
      hole.addColorStop(0.6, "rgba(10,6,24,0.8)");
      hole.addColorStop(1, "rgba(10,6,24,0)");
      ctx.fillStyle = hole;
      ctx.beginPath(); ctx.arc(cx, cy, rA * 1.4, 0, Math.PI * 2); ctx.fill();

      const arms = 3;
      for (let a = 0; a < arms; a++) {
        ctx.beginPath();
        for (let rr = 4; rr < rA * 1.3; rr += 2) {
          const ang = (a / arms) * Math.PI * 2 + t * swirl * 2 + rr * 0.06;
          const px = cx + Math.cos(ang) * rr;
          const py = cy + Math.sin(ang) * rr;
          if (rr === 4) ctx.moveTo(px, py); else ctx.lineTo(px, py);
        }
        ctx.strokeStyle = gateOpen ? `rgba(0,255,178,0.5)` : `rgba(153,102,255,0.4)`;
        ctx.lineWidth = 1.2;
        ctx.stroke();
      }
      // aperture rim
      ctx.beginPath(); ctx.arc(cx, cy, rA, 0, Math.PI * 2);
      ctx.setLineDash([4, 5]);
      ctx.strokeStyle = gateOpen ? `rgba(0,255,178,0.9)` : `rgba(255,102,153,0.7)`;
      ctx.lineWidth = 1.4; ctx.stroke();
      ctx.setLineDash([]);

      // ── energy sparks spiral inward and slip through when the gate is open
      const core = 8;
      for (const s of sparks) {
        const dx = s.x - cx, dy = s.y - cy;
        const r = Math.hypot(dx, dy) || 0.001;
        const th = Math.atan2(dy, dx);
        if (dt) {
          const vth = Math.min(7, (Gamma * 60) / Math.max(r, core)) * swirl;
          const vr = -(0.5 + swirl * 0.6) * (1 + Cap);   // inflow grows with coherence
          s.x += (-Math.sin(th) * vth + Math.cos(th) * vr) * 0.25;
          s.y += (Math.cos(th) * vth + Math.sin(th) * vr) * 0.25;
        }
        s.glow = Math.min(1, 0.15 + (1 - r / Rmax()) * 1.1);
        if (r < rA) {
          if (gateOpen) {
            // SLIP — flash and re-enter from the rim (transported)
            ctx.fillStyle = "rgba(0,255,178,0.95)";
            ctx.shadowBlur = 14; ctx.shadowColor = "rgba(0,255,178,0.9)";
            ctx.beginPath(); ctx.arc(s.x, s.y, 2.6, 0, Math.PI * 2); ctx.fill();
            ctx.shadowBlur = 0;
            slips++;
            spawn(s);
            continue;
          } else {
            // bounce back out — the gate is shut
            s.x = cx + Math.cos(th) * (rA + 2);
            s.y = cy + Math.sin(th) * (rA + 2);
          }
        }
        const col = gateOpen ? [0, 255, 178] : [153, 102, 255];
        ctx.fillStyle = `rgba(${col[0]},${col[1]},${col[2]},${0.35 + s.glow * 0.6})`;
        ctx.shadowBlur = s.glow * 8; ctx.shadowColor = `rgba(${col[0]},${col[1]},${col[2]},0.8)`;
        ctx.beginPath(); ctx.arc(s.x, s.y, 1.3 + s.glow * 1.6, 0, Math.PI * 2); ctx.fill();
        ctx.shadowBlur = 0;
      }

      // labels
      ctx.font = `9px ${MONO}`;
      ctx.fillStyle = V.vio;
      ctx.fillText("RHOMBUS-SQUARED SHELL", 10, 16);
      ctx.fillStyle = gateOpen ? V.aurora : V.rose;
      ctx.fillText(gateOpen ? "APERTURE OPEN -- SLIP THROUGH" : "APERTURE CLOSED", 10, h - 10);

      if (frames % 30 === 0) { slipRate = slips * 2; slips = 0; }

      const vPeak = (Gamma * 60) / Math.max(rA, core) * swirl;
      if (vR.current) vR.current.textContent = vPeak.toFixed(1);
      if (cR.current) cR.current.textContent = Cap.toFixed(2);
      if (gR.current) { gR.current.textContent = gateOpen ? "OPEN" : "CLOSED"; gR.current.style.color = gateOpen ? V.aurora : V.rose; }
      if (sR.current) sR.current.textContent = `${slipRate}/s`;

      raf = requestAnimationFrame(draw);
    };
    raf = requestAnimationFrame(draw);
    return () => { cancelAnimationFrame(raf); window.removeEventListener("resize", onResize); };
  }, []);

  return (
    <div>
      <canvas ref={canvasRef} style={{ width: "100%", height: 420, display: "block",
        borderRadius: 8, border: `1px solid ${V.dim}44`, background: "#05060C" }} />
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: 8, marginTop: 10 }}>
        <Readout label="Peak swirl v_theta" col={V.blue} vref={vR} />
        <Readout label="Aperture |C|" col={V.aurora} vref={cR} />
        <Readout label="Gate" col={V.rose} vref={gR} />
        <Readout label="Slip rate" col={V.gold} vref={sR} />
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginTop: 12 }}>
        <div>
          <Slider label="Circulation Gamma" value={gam} min={0.5} max={6} step={0.05} col={V.vio}
            onChange={(v) => { setGam(v); gamRef.current = v; }} fmt={(v) => v.toFixed(2)} />
          <Slider label="Aperture radius" value={ra} min={20} max={90} step={1} col={V.rose}
            onChange={(v) => { setRa(v); raRef.current = v; }} fmt={(v) => `${v.toFixed(0)} px`} />
          <Slider label="Rhombus-squared nesting N" value={nest} min={1} max={5} step={1} col={V.aurora}
            onChange={(v) => { setNest(v); nestRef.current = v; }} fmt={(v) => v.toFixed(0)} />
        </div>
        <div>
          <Slider label="Slip threshold" value={thr} min={0.3} max={0.95} step={0.01} col={V.gold}
            onChange={(v) => { setThr(v); thrRef.current = v; }} fmt={(v) => v.toFixed(2)} />
          <Slider label="Swirl speed omega" value={om} min={0.3} max={2.2} step={0.05} col={V.blue}
            onChange={(v) => { setOm(v); omRef.current = v; }} fmt={(v) => v.toFixed(2)} />
          <div style={{ fontFamily: SERIF, fontSize: "0.8rem", color: "rgba(184,204,232,0.55)", lineHeight: 1.4, marginTop: 6 }}>
            Raise circulation or tighten the aperture until the coherence at the throat crosses the slip
            threshold &mdash; the rim turns aurora and energy slips through instead of bouncing back.
          </div>
        </div>
      </div>
    </div>
  );
}

// ── SIM 2 — The slip: two worlds joined at the throat when the gate crosses LPE ───
function SlipGateCanvas() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const drvRef = useRef(0.7);    // energy drive into the throat
  const lpeRef = useRef(0.65);   // LPE threshold
  const cplRef = useRef(0.7);    // coupling strength between worlds
  const swRef = useRef(1.0);     // swirl

  const [drv, setDrv] = useState(0.7);
  const [lpe, setLpe] = useState(0.65);
  const [cpl, setCpl] = useState(0.7);
  const [sw, setSw] = useState(1.0);

  const cR = useRef<HTMLSpanElement | null>(null);
  const gR = useRef<HTMLSpanElement | null>(null);
  const xR = useRef<HTMLSpanElement | null>(null);
  const lR = useRef<HTMLSpanElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    let dim = fitCanvas(canvas, 380);
    const onResize = () => { dim = fitCanvas(canvas, 380); };
    window.addEventListener("resize", onResize);
    const reduce = prefersReduced();

    interface P { x: number; y: number; vx: number; vy: number; world: number }
    const ps: P[] = [];
    const seed = (p: P, world: number) => {
      p.world = world;
      p.x = world === 0 ? Math.random() * dim.w * 0.4 : dim.w * 0.6 + Math.random() * dim.w * 0.4;
      p.y = 30 + Math.random() * (dim.h - 60);
      p.vx = world === 0 ? 0.6 + Math.random() : -(0.6 + Math.random());
      p.vy = (Math.random() - 0.5) * 0.6;
    };
    for (let i = 0; i < 150; i++) { const p = { x: 0, y: 0, vx: 0, vy: 0, world: 0 }; seed(p, i % 2); ps.push(p); }

    let raf = 0, t = 0, xfer = 0, xferRate = 0, frames = 0;

    const draw = () => {
      const ctx = canvas.getContext("2d");
      if (!ctx) { raf = requestAnimationFrame(draw); return; }
      const w = dim.w, h = dim.h, cx = w / 2;
      const drive = drvRef.current, lpeT = lpeRef.current, coup = cplRef.current, swv = swRef.current;
      const dt = reduce ? 0 : 1;
      t += dt / 60; frames++;

      // throat coherence rises with drive; LPE gate opens above threshold
      const Cthroat = 1 - Math.exp(-drive * 2.4 * coup);
      const open = Cthroat > lpeT;
      const throatR = 30 + drive * 26;

      ctx.clearRect(0, 0, w, h);
      // two worlds tinted
      ctx.fillStyle = "rgba(40,60,100,0.10)"; ctx.fillRect(0, 0, cx, h);          // this world
      ctx.fillStyle = "rgba(120,70,160,0.10)"; ctx.fillRect(cx, 0, w - cx, h);    // other world
      ctx.strokeStyle = `${V.dim}55`;
      ctx.beginPath(); ctx.moveTo(cx, 0); ctx.lineTo(cx, h); ctx.stroke();

      // throat aperture (the vortex hole carved between worlds)
      const tg = ctx.createRadialGradient(cx, h / 2, 4, cx, h / 2, throatR);
      tg.addColorStop(0, open ? "rgba(0,255,178,0.35)" : "rgba(255,102,153,0.18)");
      tg.addColorStop(1, "rgba(10,6,24,0)");
      ctx.fillStyle = tg;
      ctx.beginPath(); ctx.arc(cx, h / 2, throatR, 0, Math.PI * 2); ctx.fill();
      for (let a = 0; a < 4; a++) {
        ctx.beginPath();
        for (let rr = 3; rr < throatR; rr += 2) {
          const ang = (a / 4) * Math.PI * 2 + t * swv * 2 + rr * 0.08;
          const px = cx + Math.cos(ang) * rr, py = h / 2 + Math.sin(ang) * rr;
          if (rr === 3) ctx.moveTo(px, py); else ctx.lineTo(px, py);
        }
        ctx.strokeStyle = open ? "rgba(0,255,178,0.45)" : "rgba(153,102,255,0.35)";
        ctx.lineWidth = 1; ctx.stroke();
      }

      // connection filaments — "everything connected at the same time" when open
      if (open) {
        for (let i = 0; i < 10; i++) {
          const yy = 30 + (i / 9) * (h - 60);
          const wob = Math.sin(t * 2 + i) * 14;
          ctx.strokeStyle = `rgba(0,255,178,${0.05 + 0.12 * Math.abs(Math.sin(t + i))})`;
          ctx.lineWidth = 0.8;
          ctx.beginPath();
          ctx.moveTo(cx - throatR, yy);
          ctx.quadraticCurveTo(cx + wob, h / 2, cx + throatR, yy);
          ctx.stroke();
        }
      }

      // particles drift to the throat; slip across only when the gate is open
      for (const p of ps) {
        if (dt) {
          p.x += p.vx; p.y += p.vy;
          // gentle pull toward throat line
          p.y += (h / 2 - p.y) * 0.004;
          const near = Math.abs(p.x - cx) < throatR && Math.abs(p.y - h / 2) < throatR;
          if (near) {
            if (open) {
              // slip to the other world
              p.world = 1 - p.world; xfer++;
              p.x = p.world === 0 ? cx - throatR - 4 : cx + throatR + 4;
              p.vx = Math.abs(p.vx) * (p.world === 0 ? -1 : 1) * 0.6 + (p.world === 0 ? -0.6 : 0.6);
            } else {
              // reflect off the shut gate
              p.vx *= -1;
              p.x += p.vx * 2;
            }
          }
          if (p.x < -4) seed(p, 0);
          if (p.x > w + 4) seed(p, 1);
        }
        const col = p.world === 0 ? [80, 150, 255] : [180, 120, 255];
        ctx.fillStyle = `rgba(${col[0]},${col[1]},${col[2]},0.8)`;
        ctx.shadowBlur = 5; ctx.shadowColor = `rgba(${col[0]},${col[1]},${col[2]},0.8)`;
        ctx.beginPath(); ctx.arc(p.x, p.y, 1.5, 0, Math.PI * 2); ctx.fill();
        ctx.shadowBlur = 0;
      }

      ctx.font = `9px ${MONO}`;
      ctx.fillStyle = V.blue; ctx.fillText("THIS WORLD -- STATE COLLEGE", 10, 16);
      ctx.fillStyle = V.vio; ctx.textAlign = "right"; ctx.fillText("THE OTHER WORLD", w - 10, 16); ctx.textAlign = "left";
      ctx.fillStyle = open ? V.aurora : V.rose;
      ctx.fillText(open ? "GATE OPEN -- CONNECTED AT THE SAME TIME" : "GATE CLOSED", 10, h - 10);

      if (frames % 30 === 0) { xferRate = xfer * 2; xfer = 0; }
      if (cR.current) cR.current.textContent = Cthroat.toFixed(2);
      if (gR.current) { gR.current.textContent = open ? "OPEN" : "CLOSED"; gR.current.style.color = open ? V.aurora : V.rose; }
      if (xR.current) xR.current.textContent = `${xferRate}/s`;
      if (lR.current) lR.current.textContent = lpeT.toFixed(2);

      raf = requestAnimationFrame(draw);
    };
    raf = requestAnimationFrame(draw);
    return () => { cancelAnimationFrame(raf); window.removeEventListener("resize", onResize); };
  }, []);

  return (
    <div>
      <canvas ref={canvasRef} style={{ width: "100%", height: 380, display: "block",
        borderRadius: 8, border: `1px solid ${V.dim}44`, background: "#05060C" }} />
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: 8, marginTop: 10 }}>
        <Readout label="Throat |C|" col={V.aurora} vref={cR} />
        <Readout label="Gate" col={V.rose} vref={gR} />
        <Readout label="Transfer rate" col={V.gold} vref={xR} />
        <Readout label="LPE threshold" col={V.green} vref={lR} />
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginTop: 12 }}>
        <div>
          <Slider label="Energy drive" value={drv} min={0.1} max={1.5} step={0.01} col={V.amb}
            onChange={(v) => { setDrv(v); drvRef.current = v; }} fmt={(v) => v.toFixed(2)} />
          <Slider label="LPE threshold" value={lpe} min={0.3} max={0.9} step={0.01} col={V.green}
            onChange={(v) => { setLpe(v); lpeRef.current = v; }} fmt={(v) => v.toFixed(2)} />
        </div>
        <div>
          <Slider label="World coupling" value={cpl} min={0.2} max={1.5} step={0.01} col={V.vio}
            onChange={(v) => { setCpl(v); cplRef.current = v; }} fmt={(v) => v.toFixed(2)} />
          <Slider label="Swirl speed" value={sw} min={0.3} max={2.2} step={0.05} col={V.blue}
            onChange={(v) => { setSw(v); swRef.current = v; }} fmt={(v) => v.toFixed(2)} />
          <div style={{ fontFamily: SERIF, fontSize: "0.8rem", color: "rgba(184,204,232,0.55)", lineHeight: 1.4, marginTop: 6 }}>
            Below the LPE threshold the two worlds bounce off each other. Above it the throat opens and
            filaments link mirrored points &mdash; both sides present at once.
          </div>
        </div>
      </div>
    </div>
  );
}

// ── SIM 3 — Four-cavity piezoelectric rhombus: stress on quartz makes charge ──────
function FourCavityPiezoCanvas() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const strRef = useRef(0.7);    // drive stress amplitude
  const frqRef = useRef(1.0);    // drive frequency (relative)
  const cplRef = useRef(0.7);    // quartz piezo coupling d
  const detRef = useRef(0.25);   // cavity detune spread (tone spread)
  const gapRef = useRef(0.5);    // bottom air-gap width

  const [str, setStr] = useState(0.7);
  const [frq, setFrq] = useState(1.0);
  const [cpl, setCpl] = useState(0.7);
  const [det, setDet] = useState(0.25);
  const [gap, setGap] = useState(0.5);

  const vR = useRef<HTMLSpanElement | null>(null);   // total voltage
  const pR = useRef<HTMLSpanElement | null>(null);   // peak cell
  const fR = useRef<HTMLSpanElement | null>(null);   // resonant freq
  const rR = useRef<HTMLSpanElement | null>(null);   // convergence coherence

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    let dim = fitCanvas(canvas, 440);
    const onResize = () => { dim = fitCanvas(canvas, 440); };
    window.addEventListener("resize", onResize);
    const reduce = prefersReduced();

    // air particles that ride the bottom slot (the "stick removed" gap)
    const air = Array.from({ length: 46 }, () => ({
      u: Math.random(), s: 0.3 + Math.random() * 0.9, off: Math.random(),
    }));

    let raf = 0, t = 0;

    const draw = () => {
      const ctx = canvas.getContext("2d");
      if (!ctx) { raf = requestAnimationFrame(draw); return; }
      const w = dim.w, h = dim.h, cx = w / 2, cy = h / 2;
      const A = strRef.current, f = frqRef.current, d = cplRef.current;
      const detune = detRef.current, gapW = gapRef.current;
      const dt = reduce ? 0 : 1;
      t += dt / 60;
      const om = f * 2 * Math.PI;

      ctx.clearRect(0, 0, w, h);
      ctx.fillStyle = "#05060C";
      ctx.fillRect(0, 0, w, h);

      const hw = w * 0.40, hh = h * 0.42;

      // cupped diabase shell — outer soft cup + crisp inner rhombus
      rhombusPath(ctx, cx, cy, hw + 7, hh + 7);
      ctx.strokeStyle = "rgba(153,102,255,0.28)"; ctx.lineWidth = 9; ctx.stroke();
      rhombusPath(ctx, cx, cy, hw, hh);
      ctx.strokeStyle = "rgba(184,204,232,0.55)"; ctx.lineWidth = 1.6; ctx.stroke();

      // four pyramidal cavities in quadrant / tetrahedral symmetry
      const off = Math.min(hw, hh) * 0.46;
      const size = Math.min(hw, hh) * 0.30;
      const cav = [
        { x: cx, y: cy - off, apexIn: true },
        { x: cx + off, y: cy, apexIn: false },
        { x: cx, y: cy + off, apexIn: true },
        { x: cx - off, y: cy, apexIn: false },
      ];

      let totalV = 0, peak = 0, sumRe = 0, sumIm = 0, sumW = 0;
      cav.forEach((c, i) => {
        const ph = i * detune * Math.PI;                 // detune -> distinct tones
        const s = A * (0.5 + 0.5 * Math.sin(om * t + ph));
        const focus = c.apexIn ? 1.35 : 0.8;             // apex-in focuses, apex-out releases
        const v = d * s * focus;                          // piezo polarisation
        totalV += v; peak = Math.max(peak, v);
        sumRe += v * Math.cos(om * t + ph);
        sumIm += v * Math.sin(om * t + ph);
        sumW += Math.max(v, 1e-6);

        // apex direction: toward centre (apex-in) or away (apex-out)
        let dxc = cx - c.x, dyc = cy - c.y;
        const L = Math.hypot(dxc, dyc) || 1;
        dxc /= L; dyc /= L;
        const sgn = c.apexIn ? 1 : -1;
        const ax = c.x + dxc * sgn * size * 0.75;
        const ay = c.y + dyc * sgn * size * 0.75;
        const bx = c.x - dxc * sgn * size * 0.55;
        const by = c.y - dyc * sgn * size * 0.55;
        const px = -dyc, py = dxc;                        // perpendicular
        const glow = Math.min(1, v);
        ctx.beginPath();
        ctx.moveTo(ax, ay);
        ctx.lineTo(bx + px * size * 0.6, by + py * size * 0.6);
        ctx.lineTo(bx - px * size * 0.6, by - py * size * 0.6);
        ctx.closePath();
        const g = ctx.createLinearGradient(bx, by, ax, ay);
        g.addColorStop(0, `rgba(153,102,255,0.10)`);
        g.addColorStop(1, `rgba(255,153,51,${0.15 + glow * 0.6})`);
        ctx.fillStyle = g;
        ctx.fill();
        ctx.strokeStyle = c.apexIn ? `rgba(68,136,255,0.6)` : `rgba(255,102,153,0.55)`;
        ctx.lineWidth = 1.1; ctx.stroke();
        // quartz inclusion at the apex — brightens with charge
        ctx.beginPath(); ctx.arc(ax, ay, 2.2 + glow * 2.4, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255,220,120,${0.4 + glow * 0.6})`;
        ctx.shadowBlur = glow * 12; ctx.shadowColor = "rgba(255,200,90,0.9)";
        ctx.fill(); ctx.shadowBlur = 0;
        // charge feed toward the centre
        ctx.strokeStyle = `rgba(255,153,51,${0.10 + glow * 0.35})`;
        ctx.lineWidth = 0.8;
        ctx.beginPath(); ctx.moveTo(ax, ay); ctx.lineTo(cx, cy); ctx.stroke();
      });

      const R = Math.hypot(sumRe, sumIm) / Math.max(sumW, 1e-6);  // convergence coherence

      // central convergence vortex — brightness tracks coherence x charge
      const conv = Math.min(1, R * totalV * 0.6);
      const cg = ctx.createRadialGradient(cx, cy, 1, cx, cy, 34 + conv * 26);
      cg.addColorStop(0, `rgba(0,255,178,${0.25 + conv * 0.6})`);
      cg.addColorStop(1, "rgba(0,255,178,0)");
      ctx.fillStyle = cg;
      ctx.beginPath(); ctx.arc(cx, cy, 34 + conv * 26, 0, Math.PI * 2); ctx.fill();
      for (let a = 0; a < 4; a++) {
        ctx.beginPath();
        for (let rr = 3; rr < 26 + conv * 22; rr += 2) {
          const ang = (a / 4) * Math.PI * 2 + t * 2.4 + rr * 0.09;
          const qx = cx + Math.cos(ang) * rr, qy = cy + Math.sin(ang) * rr;
          if (rr === 3) ctx.moveTo(qx, qy); else ctx.lineTo(qx, qy);
        }
        ctx.strokeStyle = `rgba(0,255,178,${0.2 + conv * 0.5})`;
        ctx.lineWidth = 1; ctx.stroke();
      }

      // bottom rectangular air-gap slot — the "stick removed" resonance channel
      const slotW = 16 + gapW * 46;
      const slotTop = cy + hh * 0.30;
      const slotBot = cy + hh * 0.98;
      ctx.fillStyle = "rgba(8,10,20,0.9)";
      ctx.fillRect(cx - slotW / 2, slotTop, slotW, slotBot - slotTop);
      ctx.strokeStyle = "rgba(0,255,178,0.35)"; ctx.lineWidth = 1;
      ctx.strokeRect(cx - slotW / 2, slotTop, slotW, slotBot - slotTop);
      for (const p of air) {
        if (dt) { p.u += (0.004 + p.s * 0.006) * (0.4 + totalV); if (p.u > 1) p.u -= 1; }
        const ay = slotBot - p.u * (slotBot - slotTop);
        const ax = cx + (p.off - 0.5) * slotW * 0.8;
        ctx.fillStyle = `rgba(120,200,255,${0.25 + p.s * 0.4})`;
        ctx.beginPath(); ctx.arc(ax, ay, 1.1 + p.s, 0, Math.PI * 2); ctx.fill();
      }

      // labels
      ctx.font = `9px ${MONO}`;
      ctx.fillStyle = V.amb; ctx.fillText("FOUR-CAVITY PIEZO -- QUADRANT SYMMETRY", 10, 16);
      ctx.fillStyle = V.aurora;
      ctx.fillText(conv > 0.45 ? "CONVERGENCE LOCKED -- CHARGE RINGS" : "SEEKING RESONANCE", 10, h - 10);

      // acoustic quarter-wave: shorter effective column (tighter gap) rings higher
      const Leff = 0.5 + (1 - gapW) * 1.6 + (1 - detune) * 0.3;
      const fRes = 340 / (4 * Leff);

      if (vR.current) vR.current.textContent = `${(totalV * 10).toFixed(1)} V`;
      if (pR.current) pR.current.textContent = `${(peak * 10).toFixed(1)} V`;
      if (fR.current) fR.current.textContent = `${fRes.toFixed(0)} Hz`;
      if (rR.current) { rR.current.textContent = R.toFixed(2); rR.current.style.color = R > 0.6 ? V.aurora : V.gold; }

      raf = requestAnimationFrame(draw);
    };
    raf = requestAnimationFrame(draw);
    return () => { cancelAnimationFrame(raf); window.removeEventListener("resize", onResize); };
  }, []);

  return (
    <div>
      <canvas ref={canvasRef} style={{ width: "100%", height: 440, display: "block",
        borderRadius: 8, border: `1px solid ${V.dim}44`, background: "#05060C" }} />
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: 8, marginTop: 10 }}>
        <Readout label="Total charge V" col={V.amb} vref={vR} />
        <Readout label="Peak cavity V" col={V.gold} vref={pR} />
        <Readout label="Resonant freq" col={V.blue} vref={fR} />
        <Readout label="Convergence R" col={V.aurora} vref={rR} />
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginTop: 12 }}>
        <div>
          <Slider label="Drive stress" value={str} min={0.1} max={1.4} step={0.01} col={V.amb}
            onChange={(v) => { setStr(v); strRef.current = v; }} fmt={(v) => v.toFixed(2)} />
          <Slider label="Drive frequency" value={frq} min={0.3} max={3} step={0.05} col={V.blue}
            onChange={(v) => { setFrq(v); frqRef.current = v; }} fmt={(v) => v.toFixed(2)} />
          <Slider label="Quartz coupling d" value={cpl} min={0.2} max={1.4} step={0.01} col={V.gold}
            onChange={(v) => { setCpl(v); cplRef.current = v; }} fmt={(v) => v.toFixed(2)} />
        </div>
        <div>
          <Slider label="Cavity detune spread" value={det} min={0} max={1} step={0.01} col={V.rose}
            onChange={(v) => { setDet(v); detRef.current = v; }} fmt={(v) => v.toFixed(2)} />
          <Slider label="Air-gap slot width" value={gap} min={0} max={1} step={0.01} col={V.aurora}
            onChange={(v) => { setGap(v); gapRef.current = v; }} fmt={(v) => v.toFixed(2)} />
          <div style={{ fontFamily: SERIF, fontSize: "0.8rem", color: "rgba(184,204,232,0.55)", lineHeight: 1.4, marginTop: 6 }}>
            Drive the stress into the four cavities. Apex-in pairs focus it, apex-out pairs release it; when
            the four tones phase-lock the centre convergence R climbs and the charge rings out through the
            air-gap slot &mdash; a resonant mining tool.
          </div>
        </div>
      </div>
    </div>
  );
}

const PSEUDOCODE = `function rhombus_squared_gate(Gamma, r_a, drive, lpe):
    # 1. the building -- a rhombus tiled by rhombi (rhombus squared)
    shell = rhombus(hw, hh)
    lattice = tile(shell, rhombi=N)            # nested + diamond grid

    # 2. carve a vortex hole in the energy at the centre
    v_theta(r) = Gamma / (2*pi*r)              # swirl outside the core
    C_aperture = 1 - exp(-Gamma * 60/(r_a+30)) # coherence at the throat

    # 3. the slip -- a phase transition, not a door
    gate_open = C_aperture > lpe               # LPE threshold ~ 0.65
    for spark in energy:
        spiral_inward(spark, v_theta, inflow)
        if reaches(spark, r_a):
            if gate_open: slip_through(spark)  # enter the other world
            else:         bounce_back(spark)

    # 4. when open, the two worlds are connected at the same time
    if gate_open:
        link(this_world, other_world)          # filaments across the throat

    # 5. four-cavity piezo -- stress on quartz inclusions makes charge
    for cell in cavities(4):                    # quadrant / tetrahedral symmetry
        stress = drive * (focus if apex_in else release)
        V_cell = d * stress                     # direct piezoelectric effect
    R = order_parameter(cells)                  # convergence when tones phase-lock
    ring_out(sum(V_cell)) through air_gap_slot  # resonant mining tool

    return gate_open, R`;

export default function RhombusGatePage() {
  return (
    <div style={{ maxWidth: 1080, margin: "0 auto", padding: "28px 20px 80px",
      background: V.bg, minHeight: "100vh", color: V.ink }}>
      {/* Header */}
      <div style={{ marginBottom: 30 }}>
        <div style={{ fontFamily: MONO, fontSize: 8, color: V.dim, letterSpacing: "0.2em", marginBottom: 10 }}>
          AETHER KNOWLEDGE SYSTEM &middot; GEOMETRY &times; VORTEX &middot; THE SLIP
        </div>
        <h1 style={{ margin: "0 0 8px", fontFamily: DISP, fontSize: "clamp(1.2rem,4vw,1.9rem)",
          fontWeight: 400, color: V.aurora, letterSpacing: "0.15em", lineHeight: 1.2 }}>
          RHOMBUS-SQUARED GATE
        </h1>
        <div style={{ fontFamily: SERIF, fontSize: "1.05rem", color: "rgba(184,204,232,0.75)", marginBottom: 14 }}>
          A building shaped as a rhombus tiled by rhombi &mdash; a rhombus squared &mdash; with a vortex
          hole carved in the energy at its centre. Drive the swirl hard enough and the coherence at the
          throat crosses a threshold: the aperture opens and you slip through to the other world. It is
          the feeling of entering State College &mdash; the home ground where everything reads as
          connected at the same time. Built only from vortex, coherence, and threshold laws already
          proven inside AETHER. Now the same shell is cut from ringing diabase and carved with four
          pyramidal cavities &mdash; stress on their quartz inclusions makes charge, and the four tones
          converge at the centre: a resonant mining tool.
        </div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 5, marginBottom: 8 }}>
          <Chip col={V.vio}>Rhombus &times; Rhombus</Chip>
          <Chip col={V.blue}>Vortex Aperture</Chip>
          <Chip col={V.aurora}>Coherence Throat</Chip>
          <Chip col={V.gold}>LPE Threshold 0.65</Chip>
          <Chip col={V.rose}>The Slip</Chip>
          <Chip col={V.green}>Connected At Once</Chip>
          <Chip col={V.amb}>Four Cavities</Chip>
          <Chip col={V.gold}>Piezo Charge</Chip>
          <Chip col={V.vio}>Ringing Diabase</Chip>
          <Chip col={V.blue}>Air-Gap Slot</Chip>
        </div>
        <div style={{ height: 1, background: `linear-gradient(90deg,${V.aurora}44,transparent)` }} />
      </div>

      {/* I — vortex aperture building */}
      <div style={{ marginBottom: 42 }}>
        <SectionHead n="I" title="LIVE -- VORTEX HOLE CARVED IN A RHOMBUS-SQUARED SHELL" col={V.vio} />
        <div style={{ fontFamily: SERIF, fontSize: "0.92rem", color: "rgba(184,204,232,0.7)",
          lineHeight: 1.55, marginBottom: 14, maxWidth: 820 }}>
          The shell is a rhombus tiled by rhombi, recursed N times &mdash; the &quot;squared&quot; part.
          At its centre a vortex is carved into the energy: swirl arms turn, and sparks spiral inward
          following the tangential velocity v&theta; = &Gamma;/2&pi;r. Their glow is the coherence,
          climbing as they fall toward the throat. When the aperture coherence crosses the slip
          threshold the rim turns aurora and the sparks slip through instead of bouncing back. Raise
          circulation, tighten the aperture, and watch the gate flip open.
        </div>
        <VortexApertureCanvas />
      </div>

      {/* II — the slip */}
      <div style={{ marginBottom: 42 }}>
        <SectionHead n="II" title="LIVE -- THE SLIP -- TWO WORLDS AT THE SAME TIME" col={V.aurora} />
        <div style={{ fontFamily: SERIF, fontSize: "0.92rem", color: "rgba(184,204,232,0.7)",
          lineHeight: 1.55, marginBottom: 14, maxWidth: 820 }}>
          The aperture is not a door you walk through &mdash; it is a phase transition. On the left is
          this world, the home ground; on the right is the other. Energy drives the throat; when its
          coherence rises past the LPE threshold near 0.65, the gate opens and particles slip across,
          while filaments link mirrored points on both sides &mdash; both worlds present at once. Below
          the threshold the gate is shut and they simply bounce. The slip is a crossing of a number,
          not a distance.
        </div>
        <SlipGateCanvas />
      </div>

      {/* III — four-cavity piezo */}
      <div style={{ marginBottom: 42 }}>
        <SectionHead n="III" title="LIVE -- FOUR-CAVITY PIEZOELECTRIC ENGINE" col={V.amb} />
        <div style={{ fontFamily: SERIF, fontSize: "0.92rem", color: "rgba(184,204,232,0.7)",
          lineHeight: 1.55, marginBottom: 14, maxWidth: 820 }}>
          The same rhombus, cut from ringing diabase and cupped like a shell, is carved with four
          pyramidal cavities set in quadrant &mdash; tetrahedral &mdash; symmetry. Their apexes alternate
          in and out: apex-in pairs focus the driving stress, apex-out pairs release it. Each cavity holds
          quartz inclusions, and stress on quartz makes charge &mdash; the piezoelectric effect. When the
          four tones phase-lock, their charge converges at the central vortex and rings out through the
          bottom air-gap slot &mdash; the &quot;stick removed&quot; channel that lets the stone slip and
          resonate. Drive the stress and watch the convergence R climb.
        </div>
        <FourCavityPiezoCanvas />
      </div>

      {/* IV — source images */}
      <div style={{ marginBottom: 42 }}>
        <SectionHead n="IV" title="THE VISION -- RINGING DIABASE, CARVED IN ENERGY" col={V.vio} />
        <div style={{ fontFamily: SERIF, fontSize: "0.92rem", color: "rgba(184,204,232,0.7)",
          lineHeight: 1.55, marginBottom: 16, maxWidth: 820 }}>
          The four studies that seeded this page: a rhombus of stone with a vortex carved into its field
          and a slot cut at its base; a cutaway showing the four-arm convergence at the core; the gate
          read as a pyramid with cavity wells; and the resonant mining tool that carries the four cavities
          into rock.
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
          <Plate src={imgVortexStone} col={V.blue} title="Rhombus Stone -- Field + Slot"
            cap="The ringing rhombus with a vortex carved into the surrounding energy and the rectangular air-gap slot cut at its base." />
          <Plate src={imgCutawayVortex} col={V.aurora} title="Cutaway -- Four-Arm Convergence"
            cap="A section through the block: four arms spiral into a single convergence core seated on a clear resonant base." />
          <Plate src={imgPyramidGate} col={V.gold} title="Pyramid Gate -- Cavity Wells"
            cap="The gate read as a pyramid: a triangular vortex above, circular cavity wells opening at the base." />
          <Plate src={imgResonantTool} col={V.amb} title="Resonant Mining Tool"
            cap="The four pyramidal cavities carried into a tool -- quadrant symmetry, acoustic rings, quartz charge cracking rock." />
        </div>
        <div style={{ marginTop: 16, padding: "14px 16px", borderRadius: 8,
          background: `${V.vio}08`, border: `1px solid ${V.vio}28` }}>
          <div style={{ fontFamily: MONO, fontSize: 8, color: V.vio, letterSpacing: "0.14em", marginBottom: 8 }}>
            IMAGE -&gt; MECHANISM MAP
          </div>
          <Anno k="Shell" v="Rhombus of ringing diabase, cupped so the whole body resonates as one bell." col={V.vio} />
          <Anno k="Cavities" v="Four pyramids in quadrant / tetrahedral symmetry, apexes alternating in and out." col={V.blue} />
          <Anno k="Quartz" v="Inclusions in each cavity convert stress to charge -- the piezoelectric source." col={V.gold} />
          <Anno k="Convergence" v="The four tones meet at the central vortex; phase-lock amplifies the charge." col={V.aurora} />
          <Anno k="Air-gap slot" v="Bottom rectangular channel (the removed stick) lets the stone slip and set its acoustic pitch." col={V.amb} />
          <Anno k="Use" v="Carried into rock it becomes a resonant mining tool -- charge and sound, not brute force." col={V.rose} />
        </div>
      </div>

      {/* V — math */}
      <div style={{ marginBottom: 42 }}>
        <SectionHead n="V" title="DEFINED MATHEMATICALLY -- PROVEN AETHER EQUATIONS" col={V.gold} />
        <div style={{ fontFamily: SERIF, fontSize: "0.86rem", color: "rgba(184,204,232,0.6)",
          lineHeight: 1.5, marginBottom: 14, maxWidth: 820 }}>
          The gate composes laws AETHER already carries &mdash; the vortex velocity field, the
          coherence field, the golden-ratio nesting, and the LPE threshold. It invents no new physics;
          it only carves a hole and crosses a number.
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
          {[
            { c: V.vio, t: "Rhombus-squared geometry",
              tex: "\\mathcal{R}^2=\\bigl\\{\\,\\mathcal{R}(s)\\ \\big|\\ s=1-\\tfrac{i}{N+1}\\,\\bigr\\}_{i=1}^{N}",
              d: "A rhombus tiled by self-similar rhombi, nested N deep. The shell is a shape made of its own shape -- a rhombus squared." },
            { c: V.blue, t: "Vortex tangential velocity",
              tex: "v_\\theta(r)=\\dfrac{\\Gamma}{2\\pi r}\\quad(r>r_{\\text{core}})",
              d: "Outside the core the swirl falls as 1/r; inside it rotates as a solid body. This is the velocity that carves the hole and spins the sparks inward." },
            { c: V.aurora, t: "Coherence field",
              tex: "C(x,t)=A(x)\\,e^{\\,i(\\phi-\\omega t)},\\qquad |C|=A(x)",
              d: "The spark glow is the coherence magnitude. It climbs as the spark falls toward the throat, where the field is densest." },
            { c: V.gold, t: "Aperture coherence",
              tex: "C_{\\text{ap}}=1-e^{-\\Gamma\\,60/(r_a+30)}",
              d: "Stronger circulation and a tighter aperture raise the coherence at the throat. This is the number the slip waits on." },
            { c: V.green, t: "LPE slip threshold",
              tex: "\\text{slip}\\iff C_{\\text{ap}}>C_{\\text{LPE}}\\approx0.65",
              d: "The same linear-to-phase threshold AETHER uses elsewhere. Below it the gate is shut; above it the world opens. A slip is a crossing of this number." },
            { c: V.rose, t: "Phase slip (the crossing)",
              tex: "\\Delta\\phi=2\\pi n,\\qquad n\\in\\mathbb{Z}",
              d: "Crossing the gate adds a whole turn of phase -- a topological slip, discrete and irreversible, not a smooth walk through a doorway." },
            { c: V.amb, t: "Golden-ratio nesting",
              tex: "\\varphi=\\dfrac{1+\\sqrt5}{2},\\qquad s_{i}=\\varphi^{-i}",
              d: "The cleanest rhombus-squared recursion scales each nested rhombus by the inverse golden ratio -- the proportion AETHER returns to again and again." },
            { c: V.fire, t: "Connection at the same time",
              tex: "\\Psi=\\Psi_{\\text{here}}\\otimes\\Psi_{\\text{there}}\\;(\\text{gate open})",
              d: "When open, the two worlds are not sequential but joined -- a tensor of both states, present at once. The felt meaning of everything connected at the same time." },
            { c: V.gold, t: "Direct piezoelectric effect",
              tex: "Q=d_{33}\\,F,\\qquad V=\\dfrac{Q}{C}",
              d: "Stress on the quartz inclusions produces charge in proportion to the piezoelectric coefficient d. Divide by the cavity capacitance C and it reads out as a voltage." },
            { c: V.blue, t: "Cavity quarter-wave resonance",
              tex: "f_{\\text{res}}=\\dfrac{c}{4L_{\\text{eff}}}",
              d: "Each pyramidal cavity plus the bottom air-gap slot behaves like a closed pipe. Tightening the slot shortens the effective column and rings the stone at a higher pitch." },
            { c: V.aurora, t: "Four-cavity convergence",
              tex: "R=\\dfrac{1}{\\sum_i v_i}\\Bigl|\\textstyle\\sum_i v_i\\,e^{\\,i(\\omega t+\\phi_i)}\\Bigr|",
              d: "The Kuramoto order parameter of the four cavity voltages. When their tones phase-lock, R rises toward 1 and the charge converges at the centre." },
            { c: V.rose, t: "Apex focus / quadrant phase",
              tex: "v_i=d\\,\\sigma_i\\cdot\\!\\begin{cases}1.35&\\text{apex-in}\\\\0.8&\\text{apex-out}\\end{cases},\\;\\phi_i=i\\,\\delta\\pi",
              d: "Apex-in cavities focus the stress, apex-out release it; the detune spread delta sets each cavity's phase, giving the four distinct tones that lock into one." },
          ].map((e) => (
            <div key={e.t} style={{ padding: "14px 16px", borderRadius: 8,
              background: `${e.c}08`, border: `1px solid ${e.c}30` }}>
              <div style={{ fontFamily: MONO, fontSize: 8, color: e.c, letterSpacing: "0.12em", marginBottom: 8 }}>
                {e.t.toUpperCase()}
              </div>
              <div style={{ overflowX: "auto", color: V.ink, marginBottom: 8 }}
                dangerouslySetInnerHTML={{ __html: kx(e.tex, true) }} />
              <div style={{ fontFamily: SERIF, fontSize: "0.84rem", color: "rgba(184,204,232,0.65)", lineHeight: 1.45 }}>
                {e.d}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* VI — architecture */}
      <div style={{ marginBottom: 42 }}>
        <SectionHead n="VI" title="THE MECHANISM -- BUILD, CARVE, CROSS" col={V.aurora} />
        <div style={{ fontFamily: SERIF, fontSize: "0.92rem", color: "rgba(184,204,232,0.7)",
          lineHeight: 1.55, marginBottom: 12, maxWidth: 820 }}>
          One pass: build the rhombus-squared shell, carve the vortex hole, raise the coherence until it
          crosses the threshold, and let the energy slip. The geometry holds the field; the field opens
          the gate.
        </div>
        <pre style={{ fontFamily: MONO, fontSize: "0.78rem", color: V.aurora, lineHeight: 1.55,
          background: "#070A12", border: `1px solid ${V.aurora}30`, borderRadius: 8,
          padding: "16px 18px", overflowX: "auto", margin: 0 }}>{PSEUDOCODE}</pre>
      </div>

      {/* VII — verbal */}
      <div style={{ marginBottom: 42 }}>
        <SectionHead n="VII" title="DEFINED VERBALLY -- THE HOME GROUND" col={V.vio} />
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
          {[
            { c: V.vio, t: "A shape made of itself",
              b: "A rhombus squared is a rhombus built out of rhombi -- the same form repeating at every scale. A building like this is not decorated with a pattern; it is the pattern, all the way down. The shell already implies the centre, and the centre already implies the shell." },
            { c: V.blue, t: "The hole is carved, not cut",
              b: "The aperture is not a door punched in a wall. It is a vortex carved in the energy itself -- a swirl that thins the field at its centre until there is a throat. The building does not contain the gate; the building's own circulation makes it." },
            { c: V.gold, t: "The slip is a number, not a distance",
              b: "You do not travel to the other world; you cross a threshold. When the coherence at the throat passes the LPE value, the gate flips from shut to open in a single step. A slip is discrete -- a whole turn of phase added at once -- which is why it feels less like walking and more like arriving." },
            { c: V.aurora, t: "Everything connected at the same time",
              b: "When the gate opens the two worlds are not before-and-after; they are both, at once. Filaments link mirrored points across the throat. This is the exact feeling described: standing on home ground and sensing how all of it is connected simultaneously, not in sequence." },
            { c: V.green, t: "State College as the centre",
              b: "The home ground is not just a location on the left of the canvas -- it is the reference frame, the place from which the connection is felt. The gate opens from where you already are. The other world is reached by deepening the centre you stand on, not by leaving it." },
            { c: V.rose, t: "Only proven equations",
              b: "Nothing here is invented for the page. The vortex velocity field, the coherence field, the golden-ratio nesting, and the LPE threshold all already live inside AETHER. The only new step is carving them into one gate -- a rhombus-squared shell, a vortex throat, and a single number to cross." },
            { c: V.amb, t: "Stone that rings",
              b: "The shell is cut from diabase -- a dense, quartz-bearing stone that rings when struck. Cupped into a rhombus, the whole body becomes one bell: strike it anywhere and the four cavities answer together. The material is not a container for the mechanism; the material is the mechanism." },
            { c: V.gold, t: "Four cavities, one bell",
              b: "The four pyramidal cavities sit in quadrant, tetrahedral symmetry, apexes alternating in and out. Apex-in pairs pull the stress inward and focus it; apex-out pairs push it back and release it. This in-out breathing is what keeps the tones distinct until they choose to phase-lock and converge at the centre." },
            { c: V.blue, t: "Charge, not force",
              b: "Because stress on quartz makes charge, the tool mines by resonance rather than brute impact: drive the cavities, let the tones lock, and the converged charge and sound do the work. The bottom air-gap slot -- the removed stick -- lets the stone slip and sets the pitch, so the same body can be tuned to the rock it meets." },
          ].map((e) => (
            <div key={e.t} style={{ padding: "14px 16px", borderRadius: 8,
              background: `${e.c}08`, border: `1px solid ${e.c}28` }}>
              <div style={{ fontFamily: DISP, fontSize: "0.95rem", color: e.c, letterSpacing: "0.08em", marginBottom: 7 }}>
                {e.t}
              </div>
              <div style={{ fontFamily: SERIF, fontSize: "0.86rem", color: "rgba(184,204,232,0.68)", lineHeight: 1.5 }}>
                {e.b}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Footer */}
      <div style={{ borderTop: `1px solid ${V.dim}44`, paddingTop: 24, display: "flex",
        justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}>
        <a href="/gradient-field" style={{ fontFamily: MONO, fontSize: 8, color: V.aurora, textDecoration: "none" }}>
          &lt;-- GRADIENT FIELD -- VORTEX MECHANISMS MAP
        </a>
        <div style={{ fontFamily: MONO, fontSize: 8, color: V.dim, textAlign: "right" }}>
          <div>Rhombus-Squared Gate -- The Slip</div>
          <div>C_ap &gt; 0.65 -- the net is there</div>
        </div>
      </div>
    </div>
  );
}
