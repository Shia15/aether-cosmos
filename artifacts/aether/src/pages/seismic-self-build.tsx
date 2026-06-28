import { useEffect, useRef, useState } from "react";
import katex from "katex";
import "katex/dist/katex.min.css";

const V = {
  bg:"#05060C",aurora:"#00FFB2",gold:"#C8A030",blue:"#4488FF",
  vio:"#9966FF",amb:"#FF9933",rose:"#FF6699",plasma:"#FF4477",
  green:"#44CC77",dim:"#3A5060",ink:"#B8CCE8",fire:"#FF6622",
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

interface Seg { x1: number; y1: number; x2: number; y2: number; depth: number; }

function fitCanvas(canvas: HTMLCanvasElement, h: number) {
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  const w = canvas.clientWidth || 640;
  canvas.width = Math.round(w * dpr);
  canvas.height = Math.round(h * dpr);
  const ctx = canvas.getContext("2d");
  if (ctx) ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  return { w, h };
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

// ── Seismic defiance simulation ────────────────────────────────────────────────
function SeismicCanvas() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const magRef = useRef(0.6);
  const dampRef = useRef(0.22);
  const depthRef = useRef(2);
  const isoRef = useRef(true);

  const [mag, setMag] = useState(0.6);
  const [damp, setDamp] = useState(0.22);
  const [depth, setDepth] = useState(2);
  const [iso, setIso] = useState(true);

  const driftR = useRef<HTMLSpanElement | null>(null);
  const trR = useRef<HTMLSpanElement | null>(null);
  const energyR = useRef<HTMLSpanElement | null>(null);
  const survR = useRef<HTMLSpanElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    let dim = fitCanvas(canvas, 360);
    const onResize = () => { dim = fitCanvas(canvas, 360); };
    window.addEventListener("resize", onResize);

    let raf = 0;
    let t = 0;
    let u = 0, uv = 0;
    let energy = 0, peakAbs = 0;
    const fg = 1.45; // ground frequency (Hz) -- near rigid resonance

    const draw = () => {
      const ctx = canvas.getContext("2d");
      if (!ctx) { raf = requestAnimationFrame(draw); return; }
      const w = dim.w, h = dim.h;
      const mag = magRef.current, damp = dampRef.current, dep = depthRef.current, isolated = isoRef.current;

      const dt = 1 / 60;
      t += dt;
      const wg = 2 * Math.PI * fg;
      const A = mag * 26;
      const g = A * Math.sin(wg * t);

      // SDOF: building relative to ground
      const wn = isolated ? 2 * Math.PI * (0.42 - dep * 0.02) : 2 * Math.PI * 1.38;
      const zeta = isolated ? Math.min(0.6, damp + dep * 0.04) : 0.02;
      const force = A * wg * wg * Math.sin(wg * t); // -g''
      for (let s = 0; s < 6; s++) {
        const sdt = dt / 6;
        const acc = force - 2 * zeta * wn * uv - wn * wn * u;
        uv += acc * sdt;
        u += uv * sdt;
      }
      energy += 2 * zeta * wn * uv * uv * dt * 0.02;
      const absTop = g + u;
      const aa = Math.abs(absTop);
      if (aa > peakAbs) peakAbs = aa * 0.5 + peakAbs * 0.5;
      else peakAbs = peakAbs * 0.995;

      ctx.clearRect(0, 0, w, h);
      ctx.fillStyle = "#05060C";
      ctx.fillRect(0, 0, w, h);

      const groundY = h - 46;
      const cx = w / 2;
      const BH = groundY - 40;
      const BW = Math.min(150, w * 0.32);
      const baseY = groundY - (isolated ? 12 : 0);
      const stress = Math.min(1, aa / 34);

      // ground
      ctx.save();
      ctx.translate(g, 0);
      ctx.strokeStyle = V.dim;
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(-40, groundY); ctx.lineTo(w + 40, groundY); ctx.stroke();
      for (let x = -40; x < w + 40; x += 16) {
        ctx.beginPath(); ctx.moveTo(x, groundY); ctx.lineTo(x - 8, groundY + 9);
        ctx.strokeStyle = "rgba(58,80,96,0.5)"; ctx.stroke();
      }
      ctx.restore();

      // isolator pads
      if (isolated) {
        ctx.strokeStyle = V.gold;
        ctx.lineWidth = 2;
        for (let k = -1; k <= 1; k++) {
          const px = cx + k * (BW * 0.36) + g * 0.4;
          ctx.beginPath();
          for (let yy = 0; yy <= 12; yy += 2) {
            const xx = px + Math.sin(yy * 0.9 + t * 2) * 4 * mag;
            if (yy === 0) ctx.moveTo(xx, groundY); else ctx.lineTo(xx, groundY - yy);
          }
          ctx.stroke();
        }
      }

      // building -- self-similar braced frame
      const stressCol = `rgba(${Math.round(68 + stress * 187)},${Math.round(204 - stress * 100)},${Math.round(119 - stress * 50)},`;
      const shiftAt = (frac: number) => g + u * frac; // linear cantilever shear

      const drawBay = (x0: number, y0: number, x1b: number, y1b: number, d: number) => {
        const f0 = (baseY - y0) / BH;
        const f1 = (baseY - y1b) / BH;
        const ax0 = x0 + shiftAt(f0);
        const ax1 = x1b + shiftAt(f0);
        const bx0 = x0 + shiftAt(f1);
        const bx1 = x1b + shiftAt(f1);
        // columns
        ctx.strokeStyle = stressCol + "0.9)";
        ctx.lineWidth = 1.4;
        ctx.beginPath(); ctx.moveTo(ax0, y0); ctx.lineTo(bx0, y1b); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(ax1, y0); ctx.lineTo(bx1, y1b); ctx.stroke();
        // beam
        ctx.beginPath(); ctx.moveTo(ax0, y0); ctx.lineTo(ax1, y0); ctx.stroke();
        if (d <= 0) {
          // X brace
          ctx.strokeStyle = stressCol + "0.4)";
          ctx.lineWidth = 0.9;
          ctx.beginPath(); ctx.moveTo(ax0, y0); ctx.lineTo(bx1, y1b); ctx.stroke();
          ctx.beginPath(); ctx.moveTo(ax1, y0); ctx.lineTo(bx0, y1b); ctx.stroke();
          return;
        }
        const my = (y0 + y1b) / 2;
        const mx = (x0 + x1b) / 2;
        drawBay(x0, y0, mx, my, d - 1);
        drawBay(mx, y0, x1b, my, d - 1);
        drawBay(x0, my, mx, y1b, d - 1);
        drawBay(mx, my, x1b, y1b, d - 1);
      };

      drawBay(cx - BW / 2, baseY - BH, cx + BW / 2, baseY, dep);

      // top mass marker
      const topX = cx + shiftAt(1);
      ctx.fillStyle = stressCol + "1)";
      ctx.beginPath(); ctx.arc(topX, baseY - BH, 5, 0, Math.PI * 2); ctx.fill();
      ctx.shadowBlur = 14; ctx.shadowColor = stressCol + "1)";
      ctx.beginPath(); ctx.arc(topX, baseY - BH, 5, 0, Math.PI * 2); ctx.fill();
      ctx.shadowBlur = 0;

      // drift limit guides
      const limit = BH * 0.035;
      ctx.strokeStyle = "rgba(255,68,119,0.35)";
      ctx.setLineDash([4, 4]); ctx.lineWidth = 1;
      ctx.beginPath(); ctx.moveTo(cx - limit, baseY - BH - 14); ctx.lineTo(cx - limit, baseY); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(cx + limit, baseY - BH - 14); ctx.lineTo(cx + limit, baseY); ctx.stroke();
      ctx.setLineDash([]);

      // label
      ctx.fillStyle = isolated ? V.aurora : V.plasma;
      ctx.font = `9px ${MONO}`;
      ctx.fillText(isolated ? "AETHER RECURSIVE LATTICE + BASE ISOLATION" : "RIGID FRAME -- NO ISOLATION", 12, 18);

      // readouts
      const driftRatio = (peakAbs / BH) * 100;
      const tr = peakAbs / Math.max(1, A);
      const surv = Math.max(0, Math.min(100, (1 - driftRatio / 3.5) * 100));
      if (driftR.current) driftR.current.textContent = `${driftRatio.toFixed(2)} %`;
      if (trR.current) trR.current.textContent = `${tr.toFixed(2)} x`;
      if (energyR.current) energyR.current.textContent = `${energy.toFixed(0)} J*`;
      if (survR.current) survR.current.textContent = `${surv.toFixed(0)} %`;

      raf = requestAnimationFrame(draw);
    };
    raf = requestAnimationFrame(draw);
    return () => { cancelAnimationFrame(raf); window.removeEventListener("resize", onResize); };
  }, []);

  return (
    <div>
      <canvas ref={canvasRef} style={{ width: "100%", height: 360, display: "block",
        borderRadius: 8, border: `1px solid ${V.dim}44`, background: "#05060C" }} />
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: 8, marginTop: 10 }}>
        <Readout label="Top drift ratio" col={V.plasma} vref={driftR} />
        <Readout label="Transmissibility" col={V.gold} vref={trR} />
        <Readout label="Energy dissipated" col={V.green} vref={energyR} />
        <Readout label="Survival factor" col={V.aurora} vref={survR} />
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginTop: 12 }}>
        <div>
          <Slider label="Quake intensity (PGA)" value={mag} min={0.05} max={1} step={0.01} col={V.plasma}
            onChange={(v) => { setMag(v); magRef.current = v; }} fmt={(v) => `${(v * 100).toFixed(0)}%`} />
          <Slider label="Isolator damping zeta" value={damp} min={0.02} max={0.45} step={0.01} col={V.gold}
            onChange={(v) => { setDamp(v); dampRef.current = v; }} fmt={(v) => v.toFixed(2)} />
        </div>
        <div>
          <Slider label="Brace recursion depth d" value={depth} min={0} max={3} step={1} col={V.aurora}
            onChange={(v) => { setDepth(v); depthRef.current = v; }} fmt={(v) => `${v}`} />
          <div style={{ display: "flex", gap: 8, marginTop: 6 }}>
            <button onClick={() => { const n = !iso; setIso(n); isoRef.current = n; }}
              style={{ flex: 1, fontFamily: MONO, fontSize: 8, letterSpacing: "0.1em",
                padding: "8px", borderRadius: 5, cursor: "pointer",
                background: iso ? `${V.aurora}1A` : `${V.plasma}1A`,
                border: `1px solid ${iso ? V.aurora : V.plasma}55`,
                color: iso ? V.aurora : V.plasma }}>
              {iso ? "ISOLATION: ON" : "ISOLATION: OFF"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Recursive self-build simulation ────────────────────────────────────────────
function RecursiveBuildCanvas() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const branchRef = useRef(2);
  const maxDepthRef = useRef(6);
  const speedRef = useRef(0.5);

  const [branch, setBranch] = useState(2);
  const [maxDepth, setMaxDepth] = useState(6);
  const [speed, setSpeed] = useState(0.5);

  const genR = useRef<HTMLSpanElement | null>(null);
  const botR = useRef<HTMLSpanElement | null>(null);
  const compR = useRef<HTMLSpanElement | null>(null);
  const loopR = useRef<HTMLSpanElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    let dim = fitCanvas(canvas, 360);
    const onResize = () => { dim = fitCanvas(canvas, 360); };
    window.addEventListener("resize", onResize);

    let raf = 0;
    let progress = 0;
    let loops = 0;
    let sig = "";
    let segs: Seg[] = [];

    const build = (w: number, h: number) => {
      const b = branchRef.current, md = maxDepthRef.current;
      const list: Seg[] = [];
      const baseLen = Math.min(h * 0.26, 120);
      const grow = (x: number, y: number, ang: number, len: number, d: number) => {
        if (d > md || list.length > 6000) return;
        const x2 = x + Math.cos(ang) * len;
        const y2 = y + Math.sin(ang) * len;
        list.push({ x1: x, y1: y, x2, y2, depth: d });
        const spread = 0.5;
        for (let k = 0; k < b; k++) {
          const off = b === 1 ? 0 : (k / (b - 1) - 0.5) * 2 * spread;
          grow(x2, y2, ang + off, len * 0.72, d + 1);
        }
      };
      grow(w / 2, h - 40, -Math.PI / 2, baseLen, 0);
      return list;
    };

    const draw = () => {
      const ctx = canvas.getContext("2d");
      if (!ctx) { raf = requestAnimationFrame(draw); return; }
      const w = dim.w, h = dim.h;
      const b = branchRef.current, md = maxDepthRef.current;
      const nsig = `${b}-${md}-${Math.round(w)}`;
      if (nsig !== sig) { sig = nsig; segs = build(w, h); }

      progress += speedRef.current * 0.004;
      if (progress >= 1.18) { progress = 0; loops += 1; }
      const p = Math.min(1, progress);
      const frontier = p * (md + 1);

      ctx.clearRect(0, 0, w, h);
      ctx.fillStyle = "#05060C";
      ctx.fillRect(0, 0, w, h);

      // ground
      ctx.strokeStyle = V.dim; ctx.lineWidth = 1;
      ctx.beginPath(); ctx.moveTo(0, h - 40); ctx.lineTo(w, h - 40); ctx.stroke();

      let drawn = 0;
      for (const s of segs) {
        const reveal = frontier - s.depth;
        if (reveal <= 0) continue;
        const r = Math.min(1, reveal);
        const ex = s.x1 + (s.x2 - s.x1) * r;
        const ey = s.y1 + (s.y2 - s.y1) * r;
        const hue = s.depth / (md + 1);
        const col = `rgba(${Math.round(68 + hue * 140)},${Math.round(204 - hue * 60)},${Math.round(119 + hue * 80)},`;
        ctx.strokeStyle = col + `${0.85 - hue * 0.4})`;
        ctx.lineWidth = Math.max(0.6, 3 - s.depth * 0.4);
        ctx.beginPath(); ctx.moveTo(s.x1, s.y1); ctx.lineTo(ex, ey); ctx.stroke();
        drawn += 1;
        // nanobot at the frontier of currently-building segments
        if (r < 1) {
          ctx.fillStyle = V.aurora;
          ctx.shadowBlur = 8; ctx.shadowColor = V.aurora;
          ctx.beginPath(); ctx.arc(ex, ey, 2.2, 0, Math.PI * 2); ctx.fill();
          ctx.shadowBlur = 0;
        }
      }

      // seed glow
      ctx.fillStyle = V.gold;
      ctx.shadowBlur = 12; ctx.shadowColor = V.gold;
      ctx.beginPath(); ctx.arc(w / 2, h - 40, 4, 0, Math.PI * 2); ctx.fill();
      ctx.shadowBlur = 0;

      ctx.fillStyle = V.green; ctx.font = `9px ${MONO}`;
      ctx.fillText("NANOBIOTIC RECURSIVE CONSTRUCTOR", 12, 18);

      const gen = Math.min(md, Math.floor(frontier));
      const bots = Math.pow(b, gen);
      if (genR.current) genR.current.textContent = `${gen} / ${md}`;
      if (botR.current) botR.current.textContent = bots > 9999 ? bots.toExponential(1) : `${bots}`;
      if (compR.current) compR.current.textContent = `${(p * 100).toFixed(0)} %`;
      if (loopR.current) loopR.current.textContent = `${loops}`;

      raf = requestAnimationFrame(draw);
    };
    raf = requestAnimationFrame(draw);
    return () => { cancelAnimationFrame(raf); window.removeEventListener("resize", onResize); };
  }, []);

  return (
    <div>
      <canvas ref={canvasRef} style={{ width: "100%", height: 360, display: "block",
        borderRadius: 8, border: `1px solid ${V.dim}44`, background: "#05060C" }} />
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: 8, marginTop: 10 }}>
        <Readout label="Recursion gen n" col={V.amb} vref={genR} />
        <Readout label="Active robots b^n" col={V.green} vref={botR} />
        <Readout label="Completion" col={V.aurora} vref={compR} />
        <Readout label="Build loops" col={V.gold} vref={loopR} />
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 16, marginTop: 12 }}>
        <Slider label="Branching factor b" value={branch} min={1} max={4} step={1} col={V.green}
          onChange={(v) => { setBranch(v); branchRef.current = v; }} fmt={(v) => `${v}`} />
        <Slider label="Max recursion depth" value={maxDepth} min={3} max={8} step={1} col={V.amb}
          onChange={(v) => { setMaxDepth(v); maxDepthRef.current = v; }} fmt={(v) => `${v}`} />
        <Slider label="Build rate" value={speed} min={0.1} max={1.5} step={0.05} col={V.aurora}
          onChange={(v) => { setSpeed(v); speedRef.current = v; }} fmt={(v) => `${v.toFixed(2)}x`} />
      </div>
    </div>
  );
}

const PSEUDOCODE = `function build(node, depth):
    if depth == 0:
        return seal(node)            # terminal cell -- structurally final
    place_struts(node)               # lay one self-similar braced bay
    for k in 1..b:                   # spawn b child nanobots
        child = replicate(node, k)   # bot copies its own blueprint
        build(child, depth - 1)      # recurse one scale smaller
    return node                      # bay complete, return upward

# kickoff: one seed bot, runs the loop until the lattice closes
build(seed, D)`;

export default function SeismicSelfBuildPage() {
  return (
    <div style={{ maxWidth: 1080, margin: "0 auto", padding: "28px 20px 80px",
      background: V.bg, minHeight: "100vh", color: V.ink }}>
      {/* Header */}
      <div style={{ marginBottom: 30 }}>
        <div style={{ fontFamily: MONO, fontSize: 8, color: V.dim, letterSpacing: "0.2em", marginBottom: 10 }}>
          AETHER KNOWLEDGE SYSTEM -- LIVING ARCHITECTURE
        </div>
        <h1 style={{ margin: "0 0 8px", fontFamily: DISP, fontSize: "clamp(1.2rem,4vw,1.9rem)",
          fontWeight: 400, color: V.aurora, letterSpacing: "0.15em", lineHeight: 1.2 }}>
          SEISMIC SELF-BUILD
        </h1>
        <div style={{ fontFamily: SERIF, fontSize: "1.05rem", color: "rgba(184,204,232,0.75)", marginBottom: 14 }}>
          Architectural efficiency that defies seismic force -- nanobiotic robots that build
          themselves through a recursive looping program. The loop that constructs the tower
          is the same loop that lets it survive the quake.
        </div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 5, marginBottom: 8 }}>
          <Chip col={V.plasma}>Earthquake Defiance</Chip>
          <Chip col={V.gold}>Base Isolation</Chip>
          <Chip col={V.aurora}>Self-Similar Bracing</Chip>
          <Chip col={V.green}>Recursive Self-Build</Chip>
          <Chip col={V.amb}>Nanobiotic Robots</Chip>
          <Chip col={V.vio}>Fixed-Point Loop</Chip>
        </div>
        <div style={{ height: 1, background: `linear-gradient(90deg,${V.aurora}44,transparent)` }} />
      </div>

      {/* I — Seismic defiance sim */}
      <div style={{ marginBottom: 42 }}>
        <SectionHead n="I" title="LIVE -- DEFYING THE QUAKE" col={V.plasma} />
        <div style={{ fontFamily: SERIF, fontSize: "0.92rem", color: "rgba(184,204,232,0.7)",
          lineHeight: 1.55, marginBottom: 14, maxWidth: 820 }}>
          The ground shakes at its dominant frequency. A rigid frame whose natural frequency
          sits near that of the ground enters resonance -- its sway amplifies until it fails.
          Turn isolation ON: the recursive lattice rides on damped isolator pads that lengthen
          the building period, pushing it far from the ground frequency so almost no motion is
          transmitted. Deeper brace recursion adds redundant load paths and damping. Watch the
          top drift ratio stay below the red failure limit.
        </div>
        <SeismicCanvas />
      </div>

      {/* II — Recursive self-build sim */}
      <div style={{ marginBottom: 42 }}>
        <SectionHead n="II" title="LIVE -- RECURSIVE SELF-CONSTRUCTION" col={V.green} />
        <div style={{ fontFamily: SERIF, fontSize: "0.92rem", color: "rgba(184,204,232,0.7)",
          lineHeight: 1.55, marginBottom: 14, maxWidth: 820 }}>
          One seed nanobot runs a recursive program. At every step it lays a single braced bay,
          then replicates itself into b child bots -- each building the same structure one scale
          smaller. The robot population grows as b raised to the generation, so the whole lattice
          self-assembles in only a logarithmic number of stages. When the lattice closes, the
          loop restarts to repair and extend -- construction never stops.
        </div>
        <RecursiveBuildCanvas />
      </div>

      {/* III — Mathematical definition */}
      <div style={{ marginBottom: 42 }}>
        <SectionHead n="III" title="DEFINED MATHEMATICALLY" col={V.gold} />
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
          {[
            { c: V.plasma, t: "Equation of motion",
              tex: "m\\,\\ddot{x} + c\\,\\dot{x} + k\\,x = -\\,m\\,a_g(t)",
              d: "The building, mass m and stiffness k, driven by ground acceleration a_g(t). Everything else follows from this balance." },
            { c: V.gold, t: "Frequency and damping",
              tex: "\\omega_n=\\sqrt{\\tfrac{k}{m}},\\quad \\zeta=\\dfrac{c}{2\\sqrt{km}},\\quad T=\\dfrac{2\\pi}{\\omega_n}",
              d: "Natural frequency, damping ratio and period. Base isolation lowers k and raises c, so T grows and zeta grows." },
            { c: V.aurora, t: "Transmissibility (why isolation wins)",
              tex: "TR=\\dfrac{1}{\\sqrt{(1-r^2)^2+(2\\zeta r)^2}},\\quad r=\\dfrac{\\omega_g}{\\omega_n}",
              d: "At r near 1 (rigid, resonant) TR explodes. Isolation makes omega_n small so r is large and TR falls toward zero -- the quake passes underneath." },
            { c: V.rose, t: "Drift ratio and limit",
              tex: "\\theta=\\dfrac{\\Delta}{h}\\;\\le\\;\\theta_{\\max}\\;(\\approx 0.02)",
              d: "Inter-storey drift normalised by height. Stay under the code limit and the structure survives elastically." },
            { c: V.vio, t: "Self-similar brace scaling",
              tex: "N(d)=b^{\\,d},\\qquad k_{\\mathrm{eff}}=k_0\\sum_{i=0}^{d}\\alpha^{\\,i}",
              d: "Each recursion level d multiplies members by b and adds redundant stiffness. Failure of any one path is rerouted across scales." },
            { c: V.fire, t: "Structural efficiency",
              tex: "\\eta_s=\\dfrac{k}{m}=\\omega_n^{2}\\;\\Rightarrow\\;\\dfrac{\\text{stiffness}}{\\text{mass}}\\ \\text{maximised}",
              d: "Fractal bracing buys high stiffness per unit mass -- more resistance for less material, the heart of defying gravity efficiently." },
            { c: V.green, t: "Recursive robot population",
              tex: "R_n=b\\,R_{n-1}\\;\\Longrightarrow\\;R_n=R_0\\,b^{\\,n}",
              d: "Self-replication: each generation multiplies the build crew by b. A single seed becomes an army geometrically." },
            { c: V.amb, t: "Build cost (divide and conquer)",
              tex: "T(n)=a\\,T\\!\\left(\\tfrac{n}{b}\\right)+f(n),\\quad C(d)=1-r^{\\,d}",
              d: "The construction recurrence: total work splits across b sub-builders, so completion C approaches 1 in logarithmic depth." },
            { c: V.blue, t: "The loop is the invariant",
              tex: "x^{*}=F(x^{*})\\quad\\text{(fixed point of the build map)}",
              d: "Both the structure and the program converge to a fixed point. The recursive loop is what builds AND what stabilises -- one invariant, two faces." },
            { c: V.aurora, t: "Total material",
              tex: "M=\\sum_{d=0}^{D} b^{\\,d}\\,m_d,\\qquad m_d=m_0\\,s^{\\,d}",
              d: "Members shrink by scale factor s each level. If b*s is less than 1 the total mass converges -- a finite, efficient, self-bounded tower." },
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

      {/* IV — The recursive program */}
      <div style={{ marginBottom: 42 }}>
        <SectionHead n="IV" title="THE RECURSIVE PROGRAM" col={V.aurora} />
        <div style={{ fontFamily: SERIF, fontSize: "0.92rem", color: "rgba(184,204,232,0.7)",
          lineHeight: 1.55, marginBottom: 12, maxWidth: 820 }}>
          The nanobiotic constructor is a single self-referential function. It builds one bay,
          clones itself b times, and each clone runs the identical loop one scale down until the
          terminal depth seals the smallest cells. The program is finite, yet it produces a
          structure of unbounded detail -- the definition of recursion.
        </div>
        <pre style={{ fontFamily: MONO, fontSize: "0.78rem", color: V.aurora, lineHeight: 1.55,
          background: "#070A12", border: `1px solid ${V.aurora}30`, borderRadius: 8,
          padding: "16px 18px", overflowX: "auto", margin: 0 }}>{PSEUDOCODE}</pre>
      </div>

      {/* V — Verbal synthesis */}
      <div style={{ marginBottom: 42 }}>
        <SectionHead n="V" title="DEFINED VERBALLY" col={V.vio} />
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
          {[
            { c: V.plasma, t: "Why it defies the quake",
              b: "Earthquakes destroy buildings through resonance -- when the structure and the ground share a frequency, energy pumps in until something snaps. Base isolation lengthens the building period so the two frequencies diverge; the ground slides underneath while the tower barely moves." },
            { c: V.aurora, t: "Self-similar redundancy",
              b: "A fractal brace has load paths at every scale. When one member yields, force reroutes through the redundant geometry instead of concentrating at a single point. Damage stays local; the global structure holds." },
            { c: V.green, t: "Why it builds itself",
              b: "A single seed robot carries the whole blueprint. It builds one piece, then makes copies of itself that do the same one scale smaller. Because the crew doubles each generation, an enormous structure assembles in only a handful of recursive stages." },
            { c: V.amb, t: "Efficiency of recursion",
              b: "Recursion is cheap: one short program describes infinite detail, and the divide-and-conquer split means total build time grows only logarithmically with size. Less code, less material, less time -- maximum structure per unit of everything." },
            { c: V.gold, t: "Gravity, handled efficiently",
              b: "Defying gravity is not brute mass -- it is stiffness-to-mass ratio. Self-similar bracing puts material exactly where load flows, so the tower carries far more for far less weight, the architectural meaning of efficiency." },
            { c: V.vio, t: "The loop is the invariant",
              b: "The same recursive loop that constructs the lattice is the loop that stabilises it. Build and survival are two readings of one fixed point. In AETHER terms: the loop is the invariant, and phi is its fingerprint." },
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
        <a href="/soi-building" style={{ fontFamily: MONO, fontSize: 8, color: V.aurora, textDecoration: "none" }}>
          &lt;-- SOI BUILDING -- LIVING ARCHITECTURE
        </a>
        <div style={{ fontFamily: MONO, fontSize: 8, color: V.dim, textAlign: "right" }}>
          <div>Seismic Self-Build -- Recursive Nanobiotic Construction</div>
          <div>The loop is the invariant -- phi is its fingerprint</div>
        </div>
      </div>
    </div>
  );
}
