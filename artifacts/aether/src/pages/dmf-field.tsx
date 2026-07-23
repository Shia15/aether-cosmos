import { useEffect, useRef, useState } from "react";
import katex from "katex";
import "katex/dist/katex.min.css";
const imgTransport = "/api/storage/public-objects/Gemini_Generated_Image_fwivy7fwivy7fwiv_1782920005182.png";
const imgSpectral = "/api/storage/public-objects/Gemini_Generated_Image_w1iv0w1iv0w1iv0w_1782920005183.png";
const imgInfoGain = "/api/storage/public-objects/Gemini_Generated_Image_wmyjldwmyjldwmyj_1782920005183.png";
const imgRingLayer = "/api/storage/public-objects/Gemini_Generated_Image_l9zo1il9zo1il9zo_1782920005184.png";
const imgMito = "/api/storage/public-objects/2efe9ded-1713-45f5-aa4b-9563cdf1ffaa_1782920005185.jpg";
const imgMaster = "/api/storage/public-objects/7d51f5d0-727d-411b-abf2-361b05e55814_1782920005185.jpg";
const imgPhi = "/api/storage/public-objects/Gemini_Generated_Image_xru7hlxru7hlxru7_1782920005186.png";
const imgVoidEmber = "/api/storage/public-objects/Gemini_Generated_Image_c3j49bc3j49bc3j4_1782920005187.png";
const imgCohNode = "/api/storage/public-objects/Gemini_Generated_Image_21v3z921v3z921v3_1782920005188.png";
const imgCrystalIR = "/api/storage/public-objects/Gemini_Generated_Image_nzpjfznzpjfznzpj_1782920005188.png";
const imgMycelium = "/api/storage/public-objects/Gemini_Generated_Image_ddcufdddcufdddcu_1782920005189.png";
const imgCuca = "/api/storage/public-objects/Gemini_Generated_Image_v4cvshv4cvshv4cv_1782920005189.png";
const imgGR = "/api/storage/public-objects/Gemini_Generated_Image_r2zvd1r2zvd1r2zv_1782920005190.png";
const imgFilament = "/api/storage/public-objects/Gemini_Generated_Image_of5f1jof5f1jof5f_1782920005190.png";
const imgVortex = "/api/storage/public-objects/Gemini_Generated_Image_ot7ybpot7ybpot7y_1782920005191.png";
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
      <div style={{ fontFamily: MONO, fontSize: 9, color: col, letterSpacing: "0.16em", textAlign: "right" }}>{title}</div>
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
      border: `1px solid ${col}30`, background: "#070A12" }}>
      <img src={src} alt={title} loading="lazy"
        style={{ width: "100%", height: "auto", display: "block" }} />
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
        minWidth: 118, flexShrink: 0 }}>{k}</span>
      <span style={{ fontFamily: SERIF, fontSize: "0.82rem", color: "rgba(184,204,232,0.7)", lineHeight: 1.4 }}>{v}</span>
    </div>
  );
}

function Intro({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ fontFamily: SERIF, fontSize: "0.92rem", color: "rgba(184,204,232,0.7)",
      lineHeight: 1.55, marginBottom: 14, maxWidth: 840 }}>{children}</div>
  );
}

// ─── SIM 1 — DMF-Rankine vortex with coherence-extended lifetime ───────────────
interface VP { r: number; a: number; life: number; jit: number }
function RankineVortexCanvas() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const gamRef = useRef(3.2);
  const rcRef = useRef(52);
  const cohRef = useRef(0.72);
  const spRef = useRef(1.0);
  const [gam, setGam] = useState(3.2);
  const [rc, setRc] = useState(52);
  const [coh, setCoh] = useState(0.72);
  const [sp, setSp] = useState(1.0);
  const vR = useRef<HTMLSpanElement | null>(null);
  const tR = useRef<HTMLSpanElement | null>(null);
  const rgR = useRef<HTMLSpanElement | null>(null);
  const cR = useRef<HTMLSpanElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    let dim = fitCanvas(canvas, 400);
    const onResize = () => { dim = fitCanvas(canvas, 400); };
    window.addEventListener("resize", onResize);
    const reduce = prefersReduced();
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const ps: VP[] = [];
    for (let i = 0; i < 220; i++) {
      ps.push({ r: 20 + Math.random() * 150, a: Math.random() * Math.PI * 2, life: Math.random(), jit: 0 });
    }
    let t = 0;
    let raf = 0;

    const draw = () => {
      const cx = dim.w / 2, cy = dim.h / 2;
      const Gam = gamRef.current, Rc = rcRef.current, C = cohRef.current, spd = spRef.current;
      ctx.fillStyle = "rgba(5,6,12,0.30)";
      ctx.fillRect(0, 0, dim.w, dim.h);

      // core disk
      const cg = ctx.createRadialGradient(cx, cy, 0, cx, cy, Rc);
      cg.addColorStop(0, `${V.gold}55`);
      cg.addColorStop(1, `${V.gold}00`);
      ctx.fillStyle = cg;
      ctx.beginPath(); ctx.arc(cx, cy, Rc, 0, Math.PI * 2); ctx.fill();
      ctx.strokeStyle = `${V.gold}66`; ctx.lineWidth = 1;
      ctx.beginPath(); ctx.arc(cx, cy, Rc, 0, Math.PI * 2); ctx.stroke();

      const turb = 1 - C;              // low coherence -> turbulence
      const tau = 1.5 * Math.exp(2.4 * C); // coherence-extended lifetime
      let peak = 0;

      for (const p of ps) {
        // Rankine profile: solid body inside core, 1/r outside
        const vth = p.r < Rc ? (Gam / (2 * Math.PI * Rc)) * (p.r / Rc) : Gam / (2 * Math.PI * p.r);
        if (vth > peak) peak = vth;
        if (!reduce) {
          p.a += (vth / Math.max(p.r, 6)) * spd * 2.4;
          p.r -= 0.22 * spd;          // slow inward drift
          // turbulence jitter grows as coherence falls
          p.jit = p.jit * 0.9 + (Math.random() - 0.5) * turb * 6;
          p.life -= 0.006 * spd / Math.max(tau, 0.4);
        }
        if (p.r < 8 || p.life <= 0) {
          p.r = Rc + 20 + Math.random() * 130; p.a = Math.random() * Math.PI * 2; p.life = 1;
        }
        const rr = p.r + p.jit;
        const x = cx + Math.cos(p.a) * rr;
        const y = cy + Math.sin(p.a) * rr;
        const glow = Math.max(0, Math.min(1, p.life)) * (0.4 + 0.6 * C);
        const hue = C > 0.5 ? V.aurora : V.amb;
        ctx.fillStyle = hue + Math.round(glow * 200).toString(16).padStart(2, "0");
        ctx.beginPath(); ctx.arc(x, y, 1.6 + glow * 1.8, 0, Math.PI * 2); ctx.fill();
      }

      // regime badge
      const laminar = C >= 0.5;
      ctx.font = `9px ${MONO}`;
      ctx.fillStyle = laminar ? V.aurora : V.plasma;
      ctx.fillText(laminar ? "LAMINAR -- vortex holds" : "TURBULENT -- vortex diffuses", 12, 20);

      if (vR.current) vR.current.textContent = peak.toFixed(3);
      if (tR.current) tR.current.textContent = tau.toFixed(2) + " s";
      if (rgR.current) { rgR.current.textContent = laminar ? "LAMINAR" : "TURBULENT"; }
      if (cR.current) cR.current.textContent = C.toFixed(2);

      if (!reduce) t += 1;
      raf = requestAnimationFrame(draw);
    };
    draw();
    return () => { cancelAnimationFrame(raf); window.removeEventListener("resize", onResize); };
  }, []);

  return (
    <div>
      <canvas ref={canvasRef} style={{ width: "100%", height: 400, display: "block",
        borderRadius: 8, border: `1px solid ${V.dim}44`, background: "#05060C" }} />
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: 8, marginTop: 10 }}>
        <Readout label="Peak v_theta" col={V.blue} vref={vR} />
        <Readout label="Lifetime tau" col={V.aurora} vref={tR} />
        <Readout label="Regime" col={V.plasma} vref={rgR} />
        <Readout label="Coherence C" col={V.gold} vref={cR} />
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginTop: 12 }}>
        <div>
          <Slider label="Circulation Gamma" value={gam} min={0.5} max={6} step={0.05} col={V.vio}
            onChange={(v) => { setGam(v); gamRef.current = v; }} fmt={(v) => v.toFixed(2)} />
          <Slider label="Core radius Rc" value={rc} min={24} max={90} step={1} col={V.gold}
            onChange={(v) => { setRc(v); rcRef.current = v; }} fmt={(v) => `${v.toFixed(0)} px`} />
        </div>
        <div>
          <Slider label="DMF coherence C" value={coh} min={0.05} max={1} step={0.01} col={V.aurora}
            onChange={(v) => { setCoh(v); cohRef.current = v; }} fmt={(v) => v.toFixed(2)} />
          <Slider label="Time speed" value={sp} min={0.3} max={2.2} step={0.05} col={V.blue}
            onChange={(v) => { setSp(v); spRef.current = v; }} fmt={(v) => v.toFixed(2)} />
          <div style={{ fontFamily: SERIF, fontSize: "0.8rem", color: "rgba(184,204,232,0.55)", lineHeight: 1.4, marginTop: 6 }}>
            Coherence modulates the effective viscosity. High C stretches the vortex lifetime
            &tau; and keeps flow laminar; low C lets turbulence infiltrate and the core smears.
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── SIM 2 — Dimensionless water quantum ring-layer wave function (D8) ─────────
function RingLayerCanvas() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const jRef = useRef(0.9);
  const gRef = useRef(0.25);
  const kRef = useRef(0.5);
  const cRef = useRef(0.7);
  const nRef = useRef(8);
  const [j, setJ] = useState(0.9);
  const [g, setG] = useState(0.25);
  const [k, setK] = useState(0.5);
  const [c, setC] = useState(0.7);
  const [n, setN] = useState(8);
  const tot = useRef<HTMLSpanElement | null>(null);
  const dom = useRef<HTMLSpanElement | null>(null);
  const comm = useRef<HTMLSpanElement | null>(null);
  const cc = useRef<HTMLSpanElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    let dim = fitCanvas(canvas, 400);
    const onResize = () => { dim = fitCanvas(canvas, 400); };
    window.addEventListener("resize", onResize);
    const reduce = prefersReduced();
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const H = new Array(9).fill(0).map(() => 0.15);
    let t = 0;
    let raf = 0;

    const draw = () => {
      const N = Math.round(nRef.current);
      const J = jRef.current, gam = gRef.current, K = kRef.current, C = cRef.current;
      ctx.fillStyle = "#070A12";
      ctx.fillRect(0, 0, dim.w, dim.h);
      const cx = dim.w * 0.34, cy = dim.h / 2;

      // integrate ring amplitudes: dHn/dt = J*C - gamma*Hn + K*H(n-1)
      if (!reduce) {
        for (let i = 1; i <= N; i++) {
          const drive = J * C * (0.5 + 0.5 * Math.sin(t * 0.03 + i));
          const dH = drive - gam * H[i] + K * (H[i - 1] || 0);
          H[i] += dH * 0.03;
          if (H[i] < 0) H[i] = 0;
          if (H[i] > 1.4) H[i] = 1.4;
        }
      }

      let total = 0, best = 1, bestv = 0;
      for (let i = 1; i <= N; i++) {
        const amp = H[i];
        total += amp * amp;
        if (amp > bestv) { bestv = amp; best = i; }
        const rad = 16 + i * (Math.min(dim.h, dim.w * 0.6) * 0.5 - 18) / N;
        const glow = Math.max(0, Math.min(1, amp));
        ctx.strokeStyle = `rgba(68,136,255,${0.18 + glow * 0.7})`;
        ctx.lineWidth = 1.5 + glow * 3.2;
        ctx.beginPath(); ctx.arc(cx, cy, rad, 0, Math.PI * 2); ctx.stroke();
        // D8 nodes on the ring
        for (let s = 0; s < 8; s++) {
          const ang = (s / 8) * Math.PI * 2 + t * 0.01 * (i % 2 ? 1 : -1);
          const nx = cx + Math.cos(ang) * rad, ny = cy + Math.sin(ang) * rad;
          ctx.fillStyle = `rgba(0,255,178,${glow})`;
          ctx.beginPath(); ctx.arc(nx, ny, 1.4 + glow * 1.6, 0, Math.PI * 2); ctx.fill();
        }
      }

      // probability-density cluster (right side)
      const px = dim.w * 0.8, py = dim.h / 2;
      for (let b = 0; b < 4; b++) {
        const ang = (b / 4) * Math.PI * 2 + Math.PI / 4;
        const bx = px + Math.cos(ang) * 30, by = py + Math.sin(ang) * 30;
        const pg = ctx.createRadialGradient(bx, by, 0, bx, by, 26);
        pg.addColorStop(0, `${V.amb}cc`);
        pg.addColorStop(1, `${V.amb}00`);
        ctx.fillStyle = pg;
        ctx.beginPath(); ctx.arc(bx, by, 26, 0, Math.PI * 2); ctx.fill();
      }
      ctx.font = `8px ${MONO}`;
      ctx.fillStyle = V.dim;
      ctx.fillText("PSI density cluster", px - 44, py + 60);
      ctx.fillText("D8 ring superposition", cx - 52, dim.h - 12);

      const lam = 1 / best;
      const m = Math.max(1, Math.round(best / 2));
      if (tot.current) tot.current.textContent = Math.sqrt(total).toFixed(3);
      if (dom.current) dom.current.textContent = "n = " + best;
      if (comm.current) comm.current.textContent = "a = " + m + " x " + lam.toFixed(3);
      if (cc.current) cc.current.textContent = C.toFixed(2);

      if (!reduce) t += 1;
      raf = requestAnimationFrame(draw);
    };
    draw();
    return () => { cancelAnimationFrame(raf); window.removeEventListener("resize", onResize); };
  }, []);

  return (
    <div>
      <canvas ref={canvasRef} style={{ width: "100%", height: 400, display: "block",
        borderRadius: 8, border: `1px solid ${V.dim}44`, background: "#070A12" }} />
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: 8, marginTop: 10 }}>
        <Readout label="Total |Psi|" col={V.blue} vref={tot} />
        <Readout label="Dominant ring" col={V.aurora} vref={dom} />
        <Readout label="Commensurability" col={V.gold} vref={comm} />
        <Readout label="Coherence C" col={V.amb} vref={cc} />
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginTop: 12 }}>
        <div>
          <Slider label="Inflow J_in" value={j} min={0.1} max={2} step={0.05} col={V.blue}
            onChange={(v) => { setJ(v); jRef.current = v; }} fmt={(v) => v.toFixed(2)} />
          <Slider label="Damping gamma" value={g} min={0.05} max={0.8} step={0.01} col={V.rose}
            onChange={(v) => { setG(v); gRef.current = v; }} fmt={(v) => v.toFixed(2)} />
          <Slider label="Coupling K" value={k} min={0} max={1} step={0.02} col={V.vio}
            onChange={(v) => { setK(v); kRef.current = v; }} fmt={(v) => v.toFixed(2)} />
        </div>
        <div>
          <Slider label="Coherence C(x,t)" value={c} min={0.05} max={1} step={0.01} col={V.aurora}
            onChange={(v) => { setC(v); cRef.current = v; }} fmt={(v) => v.toFixed(2)} />
          <Slider label="Ring layers N" value={n} min={2} max={8} step={1} col={V.gold}
            onChange={(v) => { setN(v); nRef.current = v; }} fmt={(v) => v.toFixed(0)} />
          <div style={{ fontFamily: SERIF, fontSize: "0.8rem", color: "rgba(184,204,232,0.55)", lineHeight: 1.4, marginTop: 6 }}>
            Each ring is a quantized topological vortex with D8 symmetry. Inflow of coherence feeds
            them, damping drains them, and coupling passes amplitude up the ladder &mdash; flowing
            water crystallises when velocity and coherence match the lattice geometry.
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── SIM 3 — DMF-assisted 3-cone to 4-cone UV projection (Shannon info gain) ───
interface Fil { x0: number; y0: number; x1: number; y1: number; c: number }
function UvConeCanvas() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const fldRef = useRef(0.7);
  const uvRef = useRef(1.0);
  const nsRef = useRef(0.3);
  const [fld, setFld] = useState(0.7);
  const [uv, setUv] = useState(1.0);
  const [ns, setNs] = useState(0.3);
  const giR = useRef<HTMLSpanElement | null>(null);
  const suvR = useRef<HTMLSpanElement | null>(null);
  const rgR = useRef<HTMLSpanElement | null>(null);
  const fR = useRef<HTMLSpanElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    let dim = fitCanvas(canvas, 380);
    const onResize = () => { dim = fitCanvas(canvas, 380); };
    window.addEventListener("resize", onResize);
    const reduce = prefersReduced();
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const fils: Fil[] = [];
    for (let i = 0; i < 26; i++) {
      const y = 20 + Math.random() * 300;
      fils.push({ x0: 10 + Math.random() * 40, y0: y, x1: 40 + Math.random() * 120, y1: y + (Math.random() - 0.5) * 80, c: Math.random() });
    }
    const speck: { x: number; y: number }[] = [];
    for (let i = 0; i < 160; i++) speck.push({ x: Math.random(), y: Math.random() });
    let t = 0;
    let raf = 0;

    const panel = (ox: number, w: number, showC: number, label: string) => {
      ctx.save();
      ctx.beginPath(); ctx.rect(ox, 16, w, dim.h - 60); ctx.clip();
      const bg = ctx.createLinearGradient(ox, 0, ox, dim.h);
      bg.addColorStop(0, "#0b1a10"); bg.addColorStop(1, "#08120c");
      ctx.fillStyle = bg; ctx.fillRect(ox, 16, w, dim.h - 60);
      // hidden coherent filaments, visible in proportion to showC
      for (const f of fils) {
        const alpha = 0.06 + showC * 0.85 * (0.4 + 0.6 * f.c);
        ctx.strokeStyle = `rgba(0,255,178,${alpha})`;
        ctx.lineWidth = 1 + showC * 2.2 * f.c;
        ctx.beginPath();
        ctx.moveTo(ox + f.x0, f.y0);
        ctx.quadraticCurveTo(ox + f.x0 + 40, (f.y0 + f.y1) / 2 + Math.sin(t * 0.02 + f.c * 6) * 6 * showC, ox + f.x1, f.y1);
        ctx.stroke();
      }
      // noise speckle
      const noise = nsRef.current;
      for (const s of speck) {
        const nx = ox + s.x * w, ny = 16 + s.y * (dim.h - 60);
        ctx.fillStyle = `rgba(180,204,232,${0.05 + noise * 0.18 * Math.random()})`;
        ctx.fillRect(nx, ny, 1.2, 1.2);
      }
      ctx.restore();
      ctx.strokeStyle = `${V.dim}66`; ctx.lineWidth = 1;
      ctx.strokeRect(ox, 16, w, dim.h - 60);
      ctx.font = `8px ${MONO}`;
      ctx.fillStyle = showC > 0.4 ? V.aurora : V.dim;
      ctx.fillText(label, ox + 8, dim.h - 30);
    };

    const draw = () => {
      ctx.fillStyle = "#070A12"; ctx.fillRect(0, 0, dim.w, dim.h);
      const C = fldRef.current, uvg = uvRef.current, noise = Math.max(0.03, nsRef.current);
      const gap = 14;
      const w = (dim.w - gap * 3) / 2;
      panel(gap, w, 0, "3-CONE (L,M,S) -- structure hidden");
      panel(gap * 2 + w, w, C * uvg, "4-CONE (+UV) -- coherence revealed");

      const sigUv = (uvg * uvg * C) / 1;         // variance scales with field C
      const gain = 0.5 * Math.log2(1 + sigUv / (noise * noise));
      if (giR.current) giR.current.textContent = gain.toFixed(3) + " bits";
      if (suvR.current) suvR.current.textContent = sigUv.toFixed(3);
      if (rgR.current) rgR.current.textContent = C > 0.5 ? "TETRACHROMATIC" : "TRICHROMATIC";
      if (fR.current) fR.current.textContent = C.toFixed(2);

      if (!reduce) t += 1;
      raf = requestAnimationFrame(draw);
    };
    draw();
    return () => { cancelAnimationFrame(raf); window.removeEventListener("resize", onResize); };
  }, []);

  return (
    <div>
      <canvas ref={canvasRef} style={{ width: "100%", height: 380, display: "block",
        borderRadius: 8, border: `1px solid ${V.dim}44`, background: "#070A12" }} />
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: 8, marginTop: 10 }}>
        <Readout label="Info gain dI" col={V.aurora} vref={giR} />
        <Readout label="sigma_UV^2" col={V.vio} vref={suvR} />
        <Readout label="Vision" col={V.gold} vref={rgR} />
        <Readout label="DMF field C" col={V.blue} vref={fR} />
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginTop: 12 }}>
        <div>
          <Slider label="DMF field C(x,t)" value={fld} min={0} max={1} step={0.01} col={V.aurora}
            onChange={(v) => { setFld(v); fldRef.current = v; }} fmt={(v) => v.toFixed(2)} />
          <Slider label="UV cone gain" value={uv} min={0.2} max={2} step={0.05} col={V.vio}
            onChange={(v) => { setUv(v); uvRef.current = v; }} fmt={(v) => v.toFixed(2)} />
        </div>
        <div>
          <Slider label="Noise sigma" value={ns} min={0.05} max={0.9} step={0.01} col={V.rose}
            onChange={(v) => { setNs(v); nsRef.current = v; }} fmt={(v) => v.toFixed(2)} />
          <div style={{ fontFamily: SERIF, fontSize: "0.8rem", color: "rgba(184,204,232,0.55)", lineHeight: 1.4, marginTop: 6 }}>
            The UV cone is tuned to coherence-dependent signals. Raise the DMF field and the fourth
            channel lifts organised structure out of the noise &mdash; the information gain is the
            Shannon capacity opened by the resonance.
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── SIM 4 — Mitochondrial ATP: DMF coherence enhancement of the proton motive force ─
interface Proton { x: number; y: number; ph: number; side: number }
function MitoCanvas() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const psiRef = useRef(0.6);
  const cRef = useRef(0.6);
  const phRef = useRef(0.4);
  const [psi, setPsi] = useState(0.6);
  const [c, setC] = useState(0.6);
  const [ph, setPh] = useState(0.4);
  const pmfR = useRef<HTMLSpanElement | null>(null);
  const atpR = useRef<HTMLSpanElement | null>(null);
  const exR = useRef<HTMLSpanElement | null>(null);
  const cR = useRef<HTMLSpanElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    let dim = fitCanvas(canvas, 380);
    const onResize = () => { dim = fitCanvas(canvas, 380); };
    window.addEventListener("resize", onResize);
    const reduce = prefersReduced();
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const prot: Proton[] = [];
    for (let i = 0; i < 60; i++) prot.push({ x: Math.random(), y: Math.random(), ph: Math.random(), side: i % 4 });
    let rotor = 0;
    let t = 0;
    let raf = 0;

    const draw = () => {
      const Dpsi = psiRef.current, C = cRef.current, dpH = phRef.current;
      ctx.fillStyle = "#070A12"; ctx.fillRect(0, 0, dim.w, dim.h);
      const topY = dim.h * 0.32, botY = dim.h * 0.68;
      // membrane bands
      ctx.fillStyle = `${V.blue}18`; ctx.fillRect(0, topY, dim.w, botY - topY);
      ctx.strokeStyle = `${V.blue}55`; ctx.lineWidth = 1.5;
      ctx.beginPath(); ctx.moveTo(0, topY); ctx.lineTo(dim.w, topY); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(0, botY); ctx.lineTo(dim.w, botY); ctx.stroke();
      ctx.font = `8px ${MONO}`; ctx.fillStyle = V.dim;
      ctx.fillText("INTERMEMBRANE SPACE (H+ high)", 10, topY - 8);
      ctx.fillText("MATRIX", 10, botY + 18);

      // ETC complexes I-IV as pumps
      const pumps = [0.16, 0.34, 0.52, 0.70];
      for (let i = 0; i < pumps.length; i++) {
        const x = dim.w * pumps[i];
        ctx.fillStyle = `${V.vio}44`;
        ctx.fillRect(x - 14, topY - 4, 28, botY - topY + 8);
        ctx.strokeStyle = `${V.vio}88`; ctx.strokeRect(x - 14, topY - 4, 28, botY - topY + 8);
        ctx.fillStyle = V.vio; ctx.fillText("I II III IV".split(" ")[i], x - 6, (topY + botY) / 2);
      }

      // PMF and ATP rate
      const pmf = Dpsi + 0.6 * dpH;
      const enh = 1 + (0.9 * C) / Math.max(pmf, 0.2);
      const atp = pmf * enh;
      const baseline = pmf;            // Warburg baseline (no DMF)
      const excess = ((atp - baseline) / Math.max(baseline, 0.01)) * 100;

      // ATP synthase rotor (right)
      const sx = dim.w * 0.88, sy = (topY + botY) / 2;
      if (!reduce) rotor += atp * 0.12;
      ctx.save(); ctx.translate(sx, sy); ctx.rotate(rotor);
      for (let b = 0; b < 6; b++) {
        ctx.rotate(Math.PI / 3);
        ctx.fillStyle = `${V.gold}cc`;
        ctx.fillRect(0, -3, 16, 6);
      }
      ctx.restore();
      const rg = ctx.createRadialGradient(sx, sy, 0, sx, sy, 14 + C * 10);
      rg.addColorStop(0, `${V.gold}${Math.round(120 + C * 120).toString(16)}`);
      rg.addColorStop(1, `${V.gold}00`);
      ctx.fillStyle = rg; ctx.beginPath(); ctx.arc(sx, sy, 14 + C * 10, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = V.gold; ctx.fillText("ATP", sx - 9, sy + 34);

      // protons flow up through pumps, across, and down through synthase
      for (const p of prot) {
        if (!reduce) {
          p.ph += 0.01 * (0.6 + pmf);
          if (p.ph > 1) p.ph -= 1;
        }
        const px = dim.w * pumps[p.side] + (Math.random() - 0.5) * 6;
        const py = botY - p.ph * (botY - topY);
        ctx.fillStyle = `rgba(255,153,51,${0.4 + 0.5 * C})`;
        ctx.beginPath(); ctx.arc(px, py, 2, 0, Math.PI * 2); ctx.fill();
      }

      if (pmfR.current) pmfR.current.textContent = pmf.toFixed(3);
      if (atpR.current) atpR.current.textContent = atp.toFixed(3);
      if (exR.current) exR.current.textContent = excess.toFixed(1) + " %";
      if (cR.current) cR.current.textContent = C.toFixed(2);

      if (!reduce) t += 1;
      raf = requestAnimationFrame(draw);
    };
    draw();
    return () => { cancelAnimationFrame(raf); window.removeEventListener("resize", onResize); };
  }, []);

  return (
    <div>
      <canvas ref={canvasRef} style={{ width: "100%", height: 380, display: "block",
        borderRadius: 8, border: `1px solid ${V.dim}44`, background: "#070A12" }} />
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: 8, marginTop: 10 }}>
        <Readout label="Total PMF" col={V.blue} vref={pmfR} />
        <Readout label="ATP rate" col={V.gold} vref={atpR} />
        <Readout label="Excess vs Warburg" col={V.aurora} vref={exR} />
        <Readout label="Coherence C" col={V.rose} vref={cR} />
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginTop: 12 }}>
        <div>
          <Slider label="Membrane potential dPsi" value={psi} min={0.1} max={1} step={0.01} col={V.blue}
            onChange={(v) => { setPsi(v); psiRef.current = v; }} fmt={(v) => v.toFixed(2)} />
          <Slider label="pH gradient dpH" value={ph} min={0} max={1} step={0.01} col={V.vio}
            onChange={(v) => { setPh(v); phRef.current = v; }} fmt={(v) => v.toFixed(2)} />
        </div>
        <div>
          <Slider label="DMF coherence C" value={c} min={0} max={1} step={0.01} col={V.aurora}
            onChange={(v) => { setC(v); cRef.current = v; }} fmt={(v) => v.toFixed(2)} />
          <div style={{ fontFamily: SERIF, fontSize: "0.8rem", color: "rgba(184,204,232,0.55)", lineHeight: 1.4, marginTop: 6 }}>
            The DMF field adds a third term to the proton motive force. As coherence rises the ATP
            synthase spins faster and metabolic rate climbs above the Warburg baseline &mdash;
            energy harvested from the field, not just the gradient.
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── SIM 5 — Space-time filament: two agents phase-lock in a coupling cavity ───
function HeartCouplingCanvas() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const sepRef = useRef(0.5);
  const kRef = useRef(1.6);
  const mmRef = useRef(0.3);
  const [sep, setSep] = useState(0.5);
  const [k, setK] = useState(1.6);
  const [mm, setMm] = useState(0.3);
  const rR = useRef<HTMLSpanElement | null>(null);
  const keR = useRef<HTMLSpanElement | null>(null);
  const stR = useRef<HTMLSpanElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    let dim = fitCanvas(canvas, 380);
    const onResize = () => { dim = fitCanvas(canvas, 380); };
    window.addEventListener("resize", onResize);
    const reduce = prefersReduced();
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // 6 oscillators: 3 per agent (heart, breath, neural)
    const th = [0, 1.4, 2.7, 0.6, 3.1, 5.0];
    const base = [1.0, 0.28, 2.2, 1.0, 0.28, 2.2];
    let t = 0;
    let raf = 0;

    const draw = () => {
      const sepN = sepRef.current, K = kRef.current, mism = mmRef.current;
      ctx.fillStyle = "#070A12"; ctx.fillRect(0, 0, dim.w, dim.h);
      const cy = dim.h / 2;
      const half = 40 + sepN * (dim.w * 0.28);
      const ax = dim.w / 2 - half, bx = dim.w / 2 + half;
      const overlap = Math.max(0, 1 - sepN);       // cavity strength
      const Keff = K * overlap;

      // Kuramoto with cross coupling only inside the cavity
      if (!reduce) {
        const dt = 0.05;
        const nth = th.slice();
        for (let i = 0; i < 6; i++) {
          let sum = 0;
          for (let jx = 0; jx < 6; jx++) sum += Math.sin(th[jx] - th[i]);
          const w = base[i] * (1 + mism * (i < 3 ? -1 : 1));
          nth[i] = th[i] + (w + (Keff / 6) * sum) * dt;
        }
        for (let i = 0; i < 6; i++) th[i] = nth[i];
      }
      // order parameter
      let sx = 0, sy = 0;
      for (let i = 0; i < 6; i++) { sx += Math.cos(th[i]); sy += Math.sin(th[i]); }
      const R = Math.sqrt(sx * sx + sy * sy) / 6;

      // coupling cavity glow
      if (overlap > 0.02) {
        const mgx = dim.w / 2;
        const cg = ctx.createRadialGradient(mgx, cy, 0, mgx, cy, half + 30);
        const gc = R > 0.85 ? V.gold : V.rose;
        cg.addColorStop(0, `${gc}${Math.round(overlap * R * 160).toString(16).padStart(2, "0")}`);
        cg.addColorStop(1, `${gc}00`);
        ctx.fillStyle = cg;
        ctx.beginPath(); ctx.ellipse(mgx, cy, half + 30, 70, 0, 0, Math.PI * 2); ctx.fill();
      }

      const drawAgent = (x: number, idx: number, hue: string) => {
        // warmth halo pulses with heart oscillator
        const beat = 0.5 + 0.5 * Math.sin(th[idx]);
        const col = R > 0.85 ? V.gold : hue;         // colors equalize when bonded
        const hg = ctx.createRadialGradient(x, cy, 0, x, cy, 46 + beat * 14);
        hg.addColorStop(0, `${col}${Math.round((100 + beat * 120)).toString(16)}`);
        hg.addColorStop(1, `${col}00`);
        ctx.fillStyle = hg;
        ctx.beginPath(); ctx.arc(x, cy, 46 + beat * 14, 0, Math.PI * 2); ctx.fill();
        ctx.strokeStyle = col; ctx.lineWidth = 2;
        ctx.beginPath(); ctx.arc(x, cy, 16, 0, Math.PI * 2); ctx.stroke();
      };
      drawAgent(ax, 0, V.blue);
      drawAgent(bx, 3, V.rose);

      // phase-lock filaments between agents inside cavity
      if (overlap > 0.05) {
        for (let s = 0; s < 3; s++) {
          const yy = cy - 20 + s * 20;
          ctx.strokeStyle = `rgba(200,160,48,${overlap * R})`;
          ctx.lineWidth = 1 + R * 2;
          ctx.beginPath(); ctx.moveTo(ax + 16, yy); ctx.lineTo(bx - 16, yy); ctx.stroke();
        }
      }

      ctx.font = `9px ${MONO}`;
      const bonded = R > 0.85 && overlap > 0.3;
      ctx.fillStyle = bonded ? V.gold : V.dim;
      ctx.fillText(bonded ? "CLUSTER = BOND -- phase-locked" : "coupling cavity forming...", 12, 20);

      if (rR.current) rR.current.textContent = R.toFixed(3);
      if (keR.current) keR.current.textContent = Keff.toFixed(2);
      if (stR.current) stR.current.textContent = bonded ? "BONDED" : overlap > 0.3 ? "COUPLING" : "SEPARATE";

      if (!reduce) t += 1;
      raf = requestAnimationFrame(draw);
    };
    draw();
    return () => { cancelAnimationFrame(raf); window.removeEventListener("resize", onResize); };
  }, []);

  return (
    <div>
      <canvas ref={canvasRef} style={{ width: "100%", height: 380, display: "block",
        borderRadius: 8, border: `1px solid ${V.dim}44`, background: "#070A12" }} />
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8, marginTop: 10 }}>
        <Readout label="Phase coherence R" col={V.gold} vref={rR} />
        <Readout label="Coupling K_eff" col={V.aurora} vref={keR} />
        <Readout label="State" col={V.rose} vref={stR} />
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginTop: 12 }}>
        <div>
          <Slider label="Separation (contact)" value={sep} min={0} max={1} step={0.01} col={V.blue}
            onChange={(v) => { setSep(v); sepRef.current = v; }} fmt={(v) => v.toFixed(2)} />
          <Slider label="Coupling K" value={k} min={0} max={4} step={0.05} col={V.gold}
            onChange={(v) => { setK(v); kRef.current = v; }} fmt={(v) => v.toFixed(2)} />
        </div>
        <div>
          <Slider label="Frequency mismatch" value={mm} min={0} max={0.8} step={0.01} col={V.rose}
            onChange={(v) => { setMm(v); mmRef.current = v; }} fmt={(v) => v.toFixed(2)} />
          <div style={{ fontFamily: SERIF, fontSize: "0.8rem", color: "rgba(184,204,232,0.55)", lineHeight: 1.4, marginTop: 6 }}>
            Bring two agents close and their heart, breath, and neural rhythms couple. When the cavity
            holds, phases converge toward one value, the halos merge and colors equalise &mdash; a
            coherence pocket inside a larger incoherent field.
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── SIM 6 — DMF-modulated space-filled transport cavity ───────────────────────
function TransportCanvas() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const fRef = useRef(1.2);
  const cRef = useRef(0.75);
  const mRef = useRef(1.0);
  const [f, setF] = useState(1.2);
  const [c, setC] = useState(0.75);
  const [m, setM] = useState(1.0);
  const vR = useRef<HTMLSpanElement | null>(null);
  const cR = useRef<HTMLSpanElement | null>(null);
  const tR = useRef<HTMLSpanElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    let dim = fitCanvas(canvas, 400);
    const onResize = () => { dim = fitCanvas(canvas, 400); };
    window.addEventListener("resize", onResize);
    const reduce = prefersReduced();
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let s = 0;         // path parameter 0..1
    let t = 0;
    let raf = 0;

    const draw = () => {
      const F = fRef.current, C = cRef.current, mass = mRef.current;
      ctx.fillStyle = "#070A12"; ctx.fillRect(0, 0, dim.w, dim.h);
      const cx = dim.w / 2, cy = dim.h / 2;
      const R = Math.min(dim.w, dim.h) * 0.42;

      // spherical cavity shell
      for (let i = 3; i >= 1; i--) {
        ctx.strokeStyle = `rgba(68,136,255,${0.10 * i})`;
        ctx.lineWidth = 1;
        ctx.beginPath(); ctx.arc(cx, cy, R * (0.7 + i * 0.1), 0, Math.PI * 2); ctx.stroke();
      }
      const core = ctx.createRadialGradient(cx, cy, 0, cx, cy, R * 0.45);
      core.addColorStop(0, `${V.amb}44`); core.addColorStop(1, `${V.amb}00`);
      ctx.fillStyle = core; ctx.beginPath(); ctx.arc(cx, cy, R * 0.45, 0, Math.PI * 2); ctx.fill();
      ctx.font = `8px ${MONO}`; ctx.fillStyle = V.dim;
      ctx.fillText("SOLID-BODY TRANSPORT CORE", cx - 70, cy - R * 0.5);

      // guided axial path: sinus trajectory across the cavity
      const pathY = (u: number) => cy + Math.sin(u * Math.PI * 2) * R * 0.34 * (0.4 + 0.6 * C);
      const pathX = (u: number) => cx - R * 0.9 + u * R * 1.8;
      ctx.strokeStyle = `${V.aurora}${C > 0.5 ? "88" : "33"}`;
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      for (let u = 0; u <= 1.0001; u += 0.02) {
        const x = pathX(u), y = pathY(u);
        if (u === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
      }
      ctx.stroke();

      // axial acceleration Gaussian pulse -> velocity
      const az = F * Math.exp(-Math.pow((s - 0.5) * 4, 2));
      const vel = (0.002 + az * 0.004) / Math.max(mass, 0.3);
      if (!reduce) { s += vel * 6; if (s > 1) s -= 1; }

      const turb = 1 - C;
      const ox = pathX(s), oy = pathY(s) + (reduce ? 0 : (Math.random() - 0.5) * turb * 22);

      // coherence sheath streamlines around the object
      for (let a = 0; a < 10; a++) {
        const ang = (a / 10) * Math.PI * 2;
        const rr = 16 + (reduce ? 0 : Math.sin(t * 0.1 + a) * 3);
        ctx.strokeStyle = `rgba(0,255,178,${C * 0.5})`;
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(ox + Math.cos(ang) * 10, oy + Math.sin(ang) * 10);
        ctx.lineTo(ox + Math.cos(ang) * rr, oy + Math.sin(ang) * rr);
        ctx.stroke();
      }
      // payload
      const og = ctx.createRadialGradient(ox, oy, 0, ox, oy, 12);
      og.addColorStop(0, V.gold); og.addColorStop(1, `${V.gold}00`);
      ctx.fillStyle = og; ctx.beginPath(); ctx.arc(ox, oy, 12, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = V.gold; ctx.fillRect(ox - 5, oy - 5, 10, 10);

      const stable = C >= 0.5;
      ctx.fillStyle = stable ? V.aurora : V.plasma;
      ctx.fillText(stable ? "STABLE TRANSIT -- guided" : "DRIFT -- sheath weak", 12, 20);

      if (vR.current) vR.current.textContent = (vel * 1000).toFixed(2);
      if (cR.current) cR.current.textContent = C.toFixed(2);
      if (tR.current) tR.current.textContent = stable ? "STABLE" : "DRIFT";

      if (!reduce) t += 1;
      raf = requestAnimationFrame(draw);
    };
    draw();
    return () => { cancelAnimationFrame(raf); window.removeEventListener("resize", onResize); };
  }, []);

  return (
    <div>
      <canvas ref={canvasRef} style={{ width: "100%", height: 400, display: "block",
        borderRadius: 8, border: `1px solid ${V.dim}44`, background: "#070A12" }} />
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8, marginTop: 10 }}>
        <Readout label="Transport velocity" col={V.blue} vref={vR} />
        <Readout label="Sheath |C|" col={V.aurora} vref={cR} />
        <Readout label="Trajectory" col={V.plasma} vref={tR} />
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginTop: 12 }}>
        <div>
          <Slider label="DMF guidance force" value={f} min={0.2} max={3} step={0.05} col={V.amb}
            onChange={(v) => { setF(v); fRef.current = v; }} fmt={(v) => v.toFixed(2)} />
          <Slider label="Payload mass" value={m} min={0.3} max={3} step={0.05} col={V.vio}
            onChange={(v) => { setM(v); mRef.current = v; }} fmt={(v) => v.toFixed(2)} />
        </div>
        <div>
          <Slider label="Coherence sheath C" value={c} min={0.05} max={1} step={0.01} col={V.aurora}
            onChange={(v) => { setC(v); cRef.current = v; }} fmt={(v) => v.toFixed(2)} />
          <div style={{ fontFamily: SERIF, fontSize: "0.8rem", color: "rgba(184,204,232,0.55)", lineHeight: 1.4, marginTop: 6 }}>
            A payload is injected axially and guided by the DMF force through the space-filled cavity.
            The coherence sheath suppresses turbulence and holds the trajectory; drop C and the object
            drifts off its guided path.
          </div>
        </div>
      </div>
    </div>
  );
}

const PSEUDOCODE = `# AETHER DMF Grand Synthesis -- one observable, many mechanisms
measure Omega_AETHER(Phi_DMF):
    S   = trace(observer state)          # 6-layer tensor network
    for each system n:                   # DMF hearing condition
        resonate if omega_sys == omega * phi^-n
    for each coupling j:                 # multi-system product
        gain *= 1 + g^2 * rho / (m^2 * omega^2)
    return S * sum(resonances) * gain

# The single field C(x,t) then drives every local mechanism:
vortex.tau      = tau0 * exp(kappa * C)          # SIM 1  lifetime
water.dH_n/dt   = J*C - gamma*H_n + K*H_(n-1)     # SIM 2  ring ladder
vision.dInfo    = 0.5 * log2(1 + sigma_UV(C)^2 / sigma_noise^2)  # SIM 3
mito.ATP        = k * PMF * (1 + g*rho / PMF0)    # SIM 4  enhancement
bond.dtheta_i   = omega_i + (K/N) * sum sin(theta_j - theta_i)   # SIM 5
transport.m*xdd = F_grav + F_DMF(u, C, grad C)    # SIM 6  guidance

# factorised measurement
<M> = rho_DMF * F_bio(C) * G_geo * K              # grand synthesis`;

const MATH = [
  { c: V.aurora, t: "AETHER DMF observable (master)",
    tex: "\\Omega_{\\text{AETHER}}[\\Phi]=\\operatorname{Tr}(S_{\\text{obs}})\\sum_n\\delta\\!\\left(\\omega_{\\text{sys}}^{(n)}-\\omega\\,\\varphi^{-n}\\right)\\prod_j\\!\\left(1+\\dfrac{g_j^{2}\\rho}{m^{2}\\omega^{2}}\\right)",
    d: "The one grand-synthesis functional: the observer trace times a phi-scaled resonance comb times a product of per-system coupling gains. Every mechanism below is a projection of it." },
  { c: V.gold, t: "Factorised measurement",
    tex: "\\langle M\\rangle=\\rho_{\\text{DMF}}\\cdot F_{\\text{bio}}(C)\\cdot G_{\\text{geo}}\\cdot K",
    d: "What an instrument reads factorises into DMF density, a biological response to coherence, a geometric form factor, and a coupling constant." },
  { c: V.blue, t: "DMF-extended flow",
    tex: "\\partial_t\\mathbf{T}+(\\mathbf{v}\\cdot\\nabla)\\mathbf{T}=-G\\nabla\\phi+\\nu_{\\text{eff}}(C)\\,\\nabla^{2}\\mathbf{T}+\\mathbf{f}_{\\text{DMF}}(C)",
    d: "A Navier-Stokes-like transport law where the effective viscosity and body force both depend on the coherence field C." },
  { c: V.vio, t: "Rankine vortex profile",
    tex: "v_\\theta(r)=\\begin{cases}\\Omega\\,r & r<R_c\\\\[2pt]\\dfrac{\\Gamma}{2\\pi r} & r\\ge R_c\\end{cases}",
    d: "Solid-body rotation inside the core, free 1/r swirl outside -- the classic vortex that SIM 1 stabilises with coherence." },
  { c: V.aurora, t: "Coherence-extended lifetime",
    tex: "\\tau(C)=\\tau_0\\,e^{\\,\\kappa C}",
    d: "The vortex lifetime grows exponentially with coherence. DMF turns a decaying eddy into a standing structure." },
  { c: V.blue, t: "Water ring-layer ladder",
    tex: "\\dfrac{dH_n}{dt}=J_{\\text{in}}\\,C(x,t)-\\gamma_n H_n+K\\,H_{n-1}",
    d: "Each quantized D8 ring is driven by coherence inflow, drained by damping, and fed by the ring below -- a ladder of vortex layers." },
  { c: V.gold, t: "Water superposition + commensurability",
    tex: "\\Psi_{\\text{water}}=\\sum_n a_n\\,|\\mathrm{ring}_n\\rangle,\\qquad a_{\\text{lat}}=m\\,\\lambda_{\\text{ring}}",
    d: "The water state is a superposition of ring layers; it crystallises when the lattice spacing is an integer multiple of the ring wavelength." },
  { c: V.rose, t: "Shannon information gain",
    tex: "\\Delta I=\\tfrac12\\log_2\\!\\left(1+\\dfrac{\\sigma_{\\text{UV}}^{2}}{\\sigma_{\\text{noise}}^{2}}\\right),\\quad \\sigma_{\\text{UV}}^{2}=\\dfrac{g_{\\text{bio}}^{2}\\rho\\,C}{m^{2}\\omega^{2}}",
    d: "The extra bits opened by the fourth (UV) cone. Its signal variance scales with the DMF field, so coherence literally buys resolution." },
  { c: V.vio, t: "3 to 4 cone projection",
    tex: "\\mathbf{c}^{(4)}=P_{3\\to4}\\,\\mathbf{c}^{(3)}+\\delta c_{\\text{UV}}(C)",
    d: "Trichromatic response lifted into a tetrachromatic space by a projection plus a coherence-gated UV term." },
  { c: V.gold, t: "Proton motive force (with DMF)",
    tex: "\\Delta\\mu_{H^+}=\\Delta\\psi_m+\\tfrac{RT}{F}\\Delta\\mathrm{pH}+\\delta\\mu_{\\text{DMF}}",
    d: "The membrane potential and pH gradient get a third, coherence-sourced term -- the field contributes directly to the gradient the cell runs on." },
  { c: V.aurora, t: "Enhanced ATP rate",
    tex: "\\dot N_{\\text{ATP}}=k\\,\\Delta\\mu_{H^+}\\!\\left(1+\\dfrac{g_{\\text{bio}}\\,\\rho}{\\Delta\\mu_{H^+}^{0}}\\right)",
    d: "ATP synthesis above the Warburg baseline. As coherence rises the enhancement factor lifts metabolic output." },
  { c: V.rose, t: "Kuramoto phase-lock",
    tex: "\\dot\\theta_i=\\omega_i+\\dfrac{K}{N}\\sum_j\\sin(\\theta_j-\\theta_i),\\quad R=\\tfrac1N\\Bigl|\\textstyle\\sum_j e^{i\\theta_j}\\Bigr|",
    d: "Heart, breath, and neural oscillators couple; the order parameter R rises toward 1 when two agents bond inside the coupling cavity." },
  { c: V.amb, t: "DMF-guided transport",
    tex: "m\\,\\ddot{\\mathbf{x}}=\\mathbf{F}_{G}+\\mathbf{F}_{\\text{DMF}}(\\mathbf{u},C,\\nabla C)",
    d: "A payload obeys Newton with an added DMF force built from the flow, the coherence, and its gradient -- the guidance that steers SIM 6." },
  { c: V.blue, t: "General-relativistic anchor",
    tex: "G_{\\mu\\nu}+\\Lambda g_{\\mu\\nu}=\\dfrac{8\\pi G}{c^{4}}\\,T_{\\mu\\nu}",
    d: "The whole synthesis stays anchored to Einstein: DMF stress-energy is a contribution to T, so coherence curves spacetime like any other energy." },
];

const VERBAL = [
  { c: V.aurora, t: "One field, many faces",
    b: "The DMF (Dark-Matter-Field / Dimensional-Modulation-Field) is a single coherence field C(x,t). It is not six unrelated ideas -- it is one quantity read out by six different instruments. A vortex, a water layer, an eye, a mitochondrion, a heartbeat, and a moving payload are all just places where the same field becomes measurable." },
  { c: V.vio, t: "The master equation is a hearing test",
    b: "Omega_AETHER does not create energy; it decides what a system can hear. The phi-scaled comb says a system resonates only when its own frequency matches the field at a golden-ratio harmonic. The product term says many systems listening together amplify more than one alone. Coherence is the shared note they all tune to." },
  { c: V.blue, t: "A vortex that refuses to die",
    b: "Ordinary vortices decay -- viscosity eats them. In the DMF picture, coherence lowers the effective viscosity, so the lifetime grows exponentially. A high-coherence vortex becomes a standing structure: a way to hold shape in a fluid without walls, purely by keeping the field organised." },
  { c: V.gold, t: "Water that remembers its rings",
    b: "Flowing water is treated as a ladder of quantized ring layers with eight-fold symmetry. Coherence feeds the rings, damping drains them, and coupling passes structure upward. When the ring spacing lines up with a lattice, the water crystallises -- structure emerging from flow the moment geometry and coherence agree." },
  { c: V.rose, t: "A fourth cone for hidden light",
    b: "Three cones give ordinary colour; a fourth, tuned to coherence-dependent UV, opens a new channel. The information gain is honest Shannon capacity: raising the field lifts organised filaments out of noise that the three-cone eye simply cannot separate. Seeing more is a matter of adding a receiver, not inventing light." },
  { c: V.green, t: "Energy from the gradient and the field",
    b: "A cell runs on the proton motive force. The DMF adds a third term to that force, so the ATP synthase spins faster and output climbs above the Warburg baseline. The claim is modest and testable: a coherent field contributes to the very gradient mitochondria already harvest." },
  { c: V.amb, t: "Bonds are coherence pockets",
    b: "When two people sit close their hearts, breath, and brains begin to couple. In the model this is Kuramoto phase-locking inside a coupling cavity: the order parameter rises, halos merge, colours equalise. A bond is a small pocket of high coherence held inside a larger, noisier field -- warmth made quantitative." },
  { c: V.plasma, t: "Transport without a tube",
    b: "The space-filled cavity carries a payload not through a pipe but along a coherence-guided trajectory. The sheath suppresses turbulence and the DMF force steers the object; lose coherence and it drifts. It is the same lesson as the vortex -- shape held by field, not by wall -- applied to moving mass." },
  { c: V.gold, t: "Emitters are the field made visible",
    b: "The bioluminescent emitters -- phi-Resonance, Void-Ember, Coherence-Node, Crystal-IR, Mycelium-Dark, CUCA Gyroid-Null -- are substrates that convert coherence into light at specific wavelengths. Each is a different way of tapping the same field, from deep-void embers to gyroid nulls, and together they form an emission atlas of the DMF." },
  { c: V.blue, t: "Anchored to real physics",
    b: "None of this leaves general relativity. DMF stress-energy is just another contribution to the Einstein tensor's source term, so coherence curves spacetime exactly as any energy does. The synthesis is speculative in mechanism but conservative in law -- it adds a field, not a loophole." },
];

const EMITTERS: { src: string; title: string; cap: string; col: string; lam: string; sub: string }[] = [
  { src: imgPhi, col: V.gold, title: "phi-Resonance Emitter", lam: "golden comb", sub: "phi-lattice",
    cap: "Emission locked to golden-ratio harmonics of the driving field -- a spectral comb spaced by phi^-n." },
  { src: imgVoidEmber, col: V.plasma, title: "Void-Ember Emitter", lam: "deep-red / IR", sub: "dark substrate",
    cap: "A deep-void ember that glows only where coherence pools in otherwise dark regions -- low background, high contrast." },
  { src: imgCohNode, col: V.aurora, title: "Coherence-Node Gated", lam: "aurora green", sub: "node array",
    cap: "Emission gated on coherence crossing threshold at discrete network nodes -- lights up only where |C| exceeds the LPE value." },
  { src: imgCrystalIR, col: V.blue, title: "Crystal-IR Emitter", lam: "1550 nm IR", sub: "crystal lattice",
    cap: "A crystalline substrate radiating in the telecom infrared -- long-wavelength, low-loss coherence readout." },
  { src: imgMycelium, col: V.green, title: "Mycelium-Dark Emitter", lam: "dim green", sub: "fungal network",
    cap: "A living mycelial mesh emitting faint light along its coherence pathways -- distributed, self-healing, dark-adapted." },
  { src: imgCuca, col: V.vio, title: "CUCA Gyroid-Null", lam: "photonic null", sub: "gyroid photonic",
    cap: "A gyroid photonic structure engineered for a spectral null -- it absorbs the coherence band it is tuned to instead of emitting it." },
];

export default function DmfFieldPage() {
  return (
    <div style={{ maxWidth: 1080, margin: "0 auto", padding: "28px 20px 80px",
      background: V.bg, minHeight: "100vh", color: V.ink }}>
      {/* Header */}
      <div style={{ marginBottom: 30 }}>
        <div style={{ fontFamily: MONO, fontSize: 8, color: V.dim, letterSpacing: "0.2em", marginBottom: 10 }}>
          AETHER KNOWLEDGE SYSTEM &middot; DMF COHERENCE FIELD &middot; GRAND SYNTHESIS
        </div>
        <h1 style={{ margin: "0 0 8px", fontFamily: DISP, fontSize: "clamp(1.2rem,4vw,1.9rem)",
          fontWeight: 400, color: V.aurora, letterSpacing: "0.15em", lineHeight: 1.2 }}>
          DMF COHERENCE FIELD
        </h1>
        <div style={{ fontFamily: SERIF, fontSize: "1.05rem", color: "rgba(184,204,232,0.75)", marginBottom: 14 }}>
          One field, read six ways. The AETHER DMF observable &Omega;<sub>AETHER</sub> is a single
          master equation &mdash; an observer trace over a golden-ratio resonance comb, multiplied by
          the coupling gains of every listening system. Below it becomes tangible: a vortex that
          refuses to die, water that crystallises into ring-layers, a fourth cone that lifts hidden
          light out of noise, a mitochondrion pushed past the Warburg baseline, two hearts locking
          into one rhythm, and a payload carried through a cavity by nothing but field. Each mechanism
          is a live simulation of the same coherence field C(x,t) &mdash; and the whole synthesis
          stays anchored to Einstein&apos;s equation.
        </div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 5, marginBottom: 8 }}>
          <Chip col={V.aurora}>Master Equation</Chip>
          <Chip col={V.vio}>DMF-Rankine Vortex</Chip>
          <Chip col={V.blue}>Water Ring-Layer D8</Chip>
          <Chip col={V.rose}>4-Cone UV Gain</Chip>
          <Chip col={V.gold}>Mitochondrial ATP</Chip>
          <Chip col={V.amb}>Heart Coupling</Chip>
          <Chip col={V.plasma}>Transport Cavity</Chip>
          <Chip col={V.green}>Emitter Atlas</Chip>
          <Chip col={V.blue}>GR Anchor</Chip>
        </div>
        <div style={{ height: 1, background: `linear-gradient(90deg,${V.aurora}44,transparent)` }} />
      </div>

      {/* 0 — master equation */}
      <div style={{ marginBottom: 42 }}>
        <SectionHead n="0" title="THE COMPLETE AETHER DMF OBSERVABLE" col={V.aurora} />
        <Intro>
          The grand-synthesis image below is the whole system on one plate: the master equation
          &Omega;<sub>AETHER</sub>, its resonance comb, and the web of systems that read it. Everything
          after this section is a projection of this single functional onto one measurable mechanism.
        </Intro>
        <div style={{ display: "grid", gridTemplateColumns: "1.15fr 1fr", gap: 16, alignItems: "start" }}>
          <Plate src={imgMaster} col={V.aurora} title="Master Equation -- Grand Synthesis"
            cap="The complete AETHER DMF observable: observer trace, phi-scaled resonance comb, and multi-system coupling product, drawn as one map." />
          <div>
            <div style={{ padding: "14px 16px", borderRadius: 8, background: `${V.aurora}08`,
              border: `1px solid ${V.aurora}30`, marginBottom: 12 }}>
              <div style={{ overflowX: "auto", color: V.ink }}
                dangerouslySetInnerHTML={{ __html: kx(MATH[0].tex, true) }} />
            </div>
            <div style={{ padding: "12px 14px", borderRadius: 8, background: `${V.gold}08`, border: `1px solid ${V.gold}30` }}>
              <Anno k="Tr(S_obs)" v="Trace over the six-layer observer state -- what the field can be measured against." col={V.aurora} />
              <Anno k="phi-comb" v="Resonance only at golden-ratio harmonics omega * phi^-n -- the hearing condition." col={V.gold} />
              <Anno k="product" v="Each coupled system multiplies the gain -- many listeners amplify more than one." col={V.blue} />
              <Anno k="C(x,t)" v="The single coherence field that every mechanism below is driven by." col={V.vio} />
            </div>
          </div>
        </div>
      </div>

      {/* I — Rankine vortex */}
      <div style={{ marginBottom: 42 }}>
        <SectionHead n="I" title="LIVE -- DMF-RANKINE VORTEX -- COHERENCE-EXTENDED LIFETIME" col={V.vio} />
        <Intro>
          A Rankine vortex rotates as a solid body inside its core and as a free 1/r swirl outside. In
          the DMF picture, coherence lowers the effective viscosity: raise C and the lifetime &tau;
          grows exponentially, holding the vortex laminar; drop C and turbulence smears it apart. Watch
          the sparks spiral and the regime flip.
        </Intro>
        <RankineVortexCanvas />
        <div style={{ marginTop: 14 }}>
          <Plate src={imgVortex} col={V.vio} title="DMF-Rankine Vortex -- Source Plate"
            cap="The infographic that seeded SIM 1: a Rankine vortex with a DMF-modulated core whose stability rides on the coherence field." />
        </div>
      </div>

      {/* II — water ring-layer */}
      <div style={{ marginBottom: 42 }}>
        <SectionHead n="II" title="LIVE -- WATER QUANTUM RING-LAYER (D8)" col={V.blue} />
        <Intro>
          Flowing water is modelled as a ladder of quantized ring layers with eight-fold (D8) symmetry.
          Coherence feeds each ring, damping drains it, coupling passes amplitude up the ladder. When
          the ring spacing becomes commensurate with a lattice, the flow crystallises &mdash; structure
          emerging the instant geometry and coherence agree.
        </Intro>
        <RingLayerCanvas />
        <div style={{ marginTop: 14 }}>
          <Plate src={imgRingLayer} col={V.blue} title="Water Quantum Ring-Layer -- Source Plate"
            cap="The dimensionless water wave function drawn as nested D8 ring-layers -- a superposition of quantized topological vortices." />
        </div>
      </div>

      {/* III — 4-cone UV */}
      <div style={{ marginBottom: 42 }}>
        <SectionHead n="III" title="LIVE -- 3-CONE TO 4-CONE UV -- SHANNON INFO GAIN" col={V.rose} />
        <Intro>
          A fourth cone, tuned to coherence-dependent UV, opens a new information channel. The left
          panel is ordinary trichromatic vision &mdash; structure buried in noise; the right adds the
          UV cone and lifts organised filaments into view. The information gain is honest Shannon
          capacity, and it scales with the DMF field.
        </Intro>
        <UvConeCanvas />
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginTop: 14 }}>
          <Plate src={imgSpectral} col={V.rose} title="Spectral 3 to 4 Cone -- Source Plate"
            cap="The colour-space transform from trichromatic to tetrachromatic vision, adding a UV primary." />
          <Plate src={imgInfoGain} col={V.vio} title="Shannon Info Gain -- Source Plate"
            cap="The information-theoretic view: the UV channel's capacity as a function of the coherence-sourced signal variance." />
        </div>
      </div>

      {/* IV — mito ATP */}
      <div style={{ marginBottom: 42 }}>
        <SectionHead n="IV" title="LIVE -- MITOCHONDRIAL ATP -- DMF ENHANCEMENT" col={V.gold} />
        <Intro>
          The DMF adds a third term to the proton motive force alongside the membrane potential and the
          pH gradient. As coherence rises the ATP synthase spins faster and output climbs above the
          Warburg baseline &mdash; energy harvested from the field, not only from the chemical gradient.
        </Intro>
        <MitoCanvas />
        <div style={{ marginTop: 14 }}>
          <Plate src={imgMito} col={V.gold} title="Mitochondrial ATP + DMF -- Source Plate"
            cap="The bioenergetic plate: electron-transport pumps, the proton motive force, and the DMF term that enhances ATP output." />
        </div>
      </div>

      {/* V — heart coupling */}
      <div style={{ marginBottom: 42 }}>
        <SectionHead n="V" title="LIVE -- SPACE-TIME FILAMENT -- HEART COUPLING" col={V.amb} />
        <Intro>
          Bring two agents close and their heart, breath, and neural rhythms couple through a coherence
          cavity. This is Kuramoto phase-locking: the order parameter R rises toward one, the warmth
          halos merge, and the colours equalise. A bond is a small pocket of high coherence held inside
          a larger, noisier field.
        </Intro>
        <HeartCouplingCanvas />
        <div style={{ marginTop: 14 }}>
          <Plate src={imgFilament} col={V.amb} title="Space-Time Filament -- Source Plate"
            cap="The filament view of coupling: two centres joined by coherence threads across the fabric -- heart-to-heart phase-lock." />
        </div>
      </div>

      {/* VI — transport cavity */}
      <div style={{ marginBottom: 42 }}>
        <SectionHead n="VI" title="LIVE -- DMF-MODULATED TRANSPORT CAVITY" col={V.plasma} />
        <Intro>
          A payload is injected axially into a space-filled cavity and guided by the DMF force along a
          coherence-held trajectory. The sheath suppresses turbulence; lose coherence and the object
          drifts off its path. Shape held by field, not by wall &mdash; the vortex lesson applied to
          moving mass.
        </Intro>
        <TransportCanvas />
        <div style={{ marginTop: 14 }}>
          <Plate src={imgTransport} col={V.plasma} title="DMF Transport Cavity -- Source Plate"
            cap="The transport concept: a space-filled cavity in which a payload is steered by a modulated dark-matter field rather than a physical tube." />
        </div>
      </div>

      {/* VII — emitter atlas */}
      <div style={{ marginBottom: 42 }}>
        <SectionHead n="VII" title="EMITTER ATLAS -- THE FIELD MADE VISIBLE" col={V.green} />
        <Intro>
          Six substrates convert coherence into light (or a spectral null) at specific wavelengths.
          Together they form an emission atlas of the DMF &mdash; from golden-ratio combs and deep-void
          embers to gyroid photonic nulls. Each is a different tap on the same field.
        </Intro>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 14 }}>
          {EMITTERS.map((e) => (
            <Plate key={e.title} src={e.src} col={e.col} title={e.title} cap={e.cap} />
          ))}
        </div>
        <div style={{ marginTop: 16, padding: "14px 16px", borderRadius: 8,
          background: `${V.green}08`, border: `1px solid ${V.green}28` }}>
          <div style={{ fontFamily: MONO, fontSize: 8, color: V.green, letterSpacing: "0.14em", marginBottom: 8 }}>
            EMITTER -&gt; BAND -&gt; SUBSTRATE
          </div>
          {EMITTERS.map((e) => (
            <Anno key={e.title} k={e.title.replace(" Emitter", "")} v={`${e.lam} -- ${e.sub}`} col={e.col} />
          ))}
        </div>
      </div>

      {/* VIII — GR anchor */}
      <div style={{ marginBottom: 42 }}>
        <SectionHead n="VIII" title="ANCHOR -- GENERAL RELATIVITY" col={V.blue} />
        <Intro>
          The synthesis never leaves Einstein. DMF stress-energy is one more contribution to the source
          term of the field equations, so coherence curves spacetime exactly as any energy density
          does. Speculative in mechanism, conservative in law.
        </Intro>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, alignItems: "start" }}>
          <Plate src={imgGR} col={V.blue} title="General Relativity -- Source Plate"
            cap="Einstein's field equations as the anchor: the geometry of spacetime set by its total stress-energy, DMF included." />
          <div style={{ padding: "14px 16px", borderRadius: 8, background: `${V.blue}08`, border: `1px solid ${V.blue}30` }}>
            <div style={{ overflowX: "auto", color: V.ink, marginBottom: 8 }}
              dangerouslySetInnerHTML={{ __html: kx(MATH[13].tex, true) }} />
            <div style={{ fontFamily: SERIF, fontSize: "0.86rem", color: "rgba(184,204,232,0.7)", lineHeight: 1.5 }}>
              {MATH[13].d}
            </div>
          </div>
        </div>
      </div>

      {/* IX — math */}
      <div style={{ marginBottom: 42 }}>
        <SectionHead n="IX" title="DEFINED MATHEMATICALLY -- THE PROJECTIONS" col={V.gold} />
        <Intro>
          Every mechanism is one projection of the master observable onto a measurable quantity. The
          cards below list them in order &mdash; the same coherence field C(x,t) appearing as viscosity,
          as an information channel, as a proton term, as a coupling, as a guidance force.
        </Intro>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
          {MATH.map((e) => (
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

      {/* X — pipeline */}
      <div style={{ marginBottom: 42 }}>
        <SectionHead n="X" title="THE MECHANISM -- ONE OBSERVABLE, MANY READOUTS" col={V.aurora} />
        <Intro>
          One pass: measure the master observable, extract the coherence field, then let that single
          field drive every local mechanism. The observable decides what can be heard; the field does
          the work.
        </Intro>
        <pre style={{ fontFamily: MONO, fontSize: "0.78rem", color: V.aurora, lineHeight: 1.55,
          background: "#070A12", border: `1px solid ${V.aurora}30`, borderRadius: 8,
          padding: "16px 18px", overflowX: "auto", margin: 0 }}>{PSEUDOCODE}</pre>
      </div>

      {/* XI — verbal */}
      <div style={{ marginBottom: 42 }}>
        <SectionHead n="XI" title="DEFINED VERBALLY -- WHAT IT MEANS" col={V.vio} />
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
          {VERBAL.map((e) => (
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
        <a href="/aether-engine" style={{ fontFamily: MONO, fontSize: 8, color: V.aurora, textDecoration: "none" }}>
          &lt;-- AETHER ENGINE -- ALL FIELDS UNIFIED
        </a>
        <div style={{ fontFamily: MONO, fontSize: 8, color: V.dim, textAlign: "right" }}>
          <div>DMF Coherence Field -- Grand Synthesis</div>
          <div>Omega_AETHER -- one field, six readouts</div>
        </div>
      </div>
    </div>
  );
}
