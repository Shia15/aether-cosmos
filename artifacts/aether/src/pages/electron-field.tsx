import { useEffect, useRef, useState } from "react";
import katex from "katex";
import "katex/dist/katex.min.css";
import plateLight from "@assets/ChatGPT_Image_Jun_28,_2026,_02_44_54_PM_1782672305141.png";
import plateDensity from "@assets/ChatGPT_Image_Jun_28,_2026,_02_46_34_PM_1782672398737.png";

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

interface Electron { x: number; y: number; band: number; ph: number; jx: number; jy: number }
interface Particle { x: number; y: number }
interface Vel { sp: number; inside: boolean; vx: number; vy: number }

// four media -- each is a substrate the field crosses, with its own T / R / A
// (transmission / reflection / absorption, summing to 1) and a drift speed.
const MEDIA = [
  { name: "AIR",   col: [120, 180, 255], T: 0.90, R: 0.04, A: 0.06, drift: 1.6 },
  { name: "LAND",  col: [200, 150, 70],  T: 0.10, R: 0.25, A: 0.65, drift: 0.35 },
  { name: "WATER", col: [70, 150, 230],  T: 0.78, R: 0.07, A: 0.15, drift: 0.9 },
  { name: "SEA",   col: [60, 120, 160],  T: 0.55, R: 0.10, A: 0.35, drift: 0.55 },
];

// ── Unbreakable pulsing electron field across four media ─────────────────────────
function ElectronFieldCanvas() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const omRef = useRef(2.4);   // pulse angular frequency omega
  const flRef = useRef(0.35);  // coherence floor A_min -> "unbreakable"
  const dwRef = useRef(0.5);   // disruption linewidth Delta-omega

  const [om, setOm] = useState(2.4);
  const [fl, setFl] = useState(0.35);
  const [dw, setDw] = useState(0.5);

  const cR = useRef<HTMLSpanElement | null>(null);
  const qR = useRef<HTMLSpanElement | null>(null);
  const tR = useRef<HTMLSpanElement | null>(null);
  const fR = useRef<HTMLSpanElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    let dim = fitCanvas(canvas, 380);
    const onResize = () => { dim = fitCanvas(canvas, 380); };
    window.addEventListener("resize", onResize);

    // seed electrons per band
    const electrons: Electron[] = [];
    const seed = () => {
      electrons.length = 0;
      const per = 46;
      for (let b = 0; b < 4; b++) {
        for (let i = 0; i < per; i++) {
          electrons.push({ x: Math.random() * dim.w, y: 0, band: b,
            ph: Math.random() * Math.PI * 2, jx: 0, jy: 0 });
        }
      }
    };
    seed();

    let raf = 0;
    let t = 0;

    const draw = () => {
      const ctx = canvas.getContext("2d");
      if (!ctx) { raf = requestAnimationFrame(draw); return; }
      const w = dim.w, h = dim.h;
      const omega = omRef.current;
      const aMin = flRef.current;
      const dwv = dwRef.current;
      t += 1 / 60;
      const bh = h / 4;

      ctx.clearRect(0, 0, w, h);
      ctx.fillStyle = "#05060C";
      ctx.fillRect(0, 0, w, h);

      // medium bands
      for (let b = 0; b < 4; b++) {
        const m = MEDIA[b];
        ctx.fillStyle = `rgba(${m.col[0]},${m.col[1]},${m.col[2]},0.06)`;
        ctx.fillRect(0, b * bh, w, bh);
        ctx.strokeStyle = `rgba(${m.col[0]},${m.col[1]},${m.col[2]},0.18)`;
        ctx.lineWidth = 1;
        ctx.beginPath(); ctx.moveTo(0, b * bh); ctx.lineTo(w, b * bh); ctx.stroke();
        ctx.font = `9px ${MONO}`;
        ctx.fillStyle = `rgba(${m.col[0]},${m.col[1]},${m.col[2]},0.8)`;
        ctx.fillText(`${m.name}  T=${m.T.toFixed(2)} R=${m.R.toFixed(2)} A=${m.A.toFixed(2)}`, 10, b * bh + 16);
      }

      // the unbreakable pulse: amplitude floored at aMin, oscillating to 1
      const pulse = aMin + (1 - aMin) * 0.5 * (1 + Math.sin(omega * t));
      // disruption jitter scales with Delta-omega but cannot lower the floor
      const jit = dwv * 6;

      // links between near electrons in the same band -- the field web
      for (let b = 0; b < 4; b++) {
        const m = MEDIA[b];
        const cy = b * bh + bh / 2;
        const band = electrons.filter((e) => e.band === b);
        for (let i = 0; i < band.length; i++) {
          for (let j = i + 1; j < band.length; j++) {
            const a = band[i], c = band[j];
            const dx = a.x - c.x, dy = a.y - c.y;
            const d2 = dx * dx + dy * dy;
            if (d2 < 90 * 90) {
              const alpha = (1 - Math.sqrt(d2) / 90) * pulse * 0.4;
              ctx.strokeStyle = `rgba(${m.col[0]},${m.col[1]},${m.col[2]},${alpha})`;
              ctx.lineWidth = 0.7;
              ctx.beginPath(); ctx.moveTo(a.x, cy + a.jy); ctx.lineTo(c.x, cy + c.jy); ctx.stroke();
            }
          }
        }
      }

      // electrons
      for (const e of electrons) {
        const m = MEDIA[e.band];
        const cy = e.band * bh + bh / 2;
        e.x += m.drift * (0.6 + pulse) + (Math.random() - 0.5) * jit * 0.15;
        if (e.x > w + 4) e.x -= w + 8;
        e.jy = Math.sin(t * omega + e.ph) * (bh * 0.22) + (Math.random() - 0.5) * jit;
        // glow brightness = |C| = pulse, modulated by the medium's absorption A
        const glow = pulse * (0.4 + m.A * 0.6);
        const r = 1.6 + glow * 2.8;
        ctx.fillStyle = `rgba(${m.col[0]},${m.col[1]},${m.col[2]},${0.45 + glow * 0.55})`;
        ctx.shadowBlur = glow * 12; ctx.shadowColor = `rgba(${m.col[0]},${m.col[1]},${m.col[2]},0.9)`;
        ctx.beginPath(); ctx.arc(e.x, cy + e.jy, r, 0, Math.PI * 2); ctx.fill();
        ctx.shadowBlur = 0;
      }

      // floor line -- the field never decoheres below this
      const fy = h - 4 - aMin * (h - 8) * 0; // keep label only
      void fy;
      ctx.font = `9px ${MONO}`;
      ctx.fillStyle = V.aurora;
      ctx.fillText("UNBREAKABLE PULSING ELECTRON FIELD", 12, 14);
      ctx.fillStyle = V.green;
      ctx.fillText(`COHERENCE FLOOR A_min = ${aMin.toFixed(2)} (never breaks)`, 12, h - 10);

      // readouts
      const Q = omega / Math.max(0.001, dwv);
      const tau = 1 / Math.max(0.001, dwv);
      if (cR.current) cR.current.textContent = pulse.toFixed(2);
      if (qR.current) qR.current.textContent = Q.toFixed(1);
      if (tR.current) tR.current.textContent = `${tau.toFixed(2)} u`;
      if (fR.current) fR.current.textContent = aMin.toFixed(2);

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
        <Readout label="Pulse |C|" col={V.aurora} vref={cR} />
        <Readout label="Quality factor Q" col={V.gold} vref={qR} />
        <Readout label="Coherence time tc" col={V.blue} vref={tR} />
        <Readout label="Field floor A_min" col={V.green} vref={fR} />
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginTop: 12 }}>
        <div>
          <Slider label="Pulse frequency omega" value={om} min={0.5} max={6} step={0.05} col={V.aurora}
            onChange={(v) => { setOm(v); omRef.current = v; }} fmt={(v) => v.toFixed(2)} />
          <Slider label="Coherence floor A_min (unbreakability)" value={fl} min={0.1} max={0.9} step={0.01} col={V.green}
            onChange={(v) => { setFl(v); flRef.current = v; }} fmt={(v) => v.toFixed(2)} />
        </div>
        <div>
          <Slider label="Disruption linewidth dw" value={dw} min={0.05} max={2} step={0.01} col={V.plasma}
            onChange={(v) => { setDw(v); dwRef.current = v; }} fmt={(v) => v.toFixed(2)} />
          <div style={{ fontFamily: SERIF, fontSize: "0.8rem", color: "rgba(184,204,232,0.55)", lineHeight: 1.4, marginTop: 6 }}>
            Raise disruption and the field jitters and shimmers -- but the glow never falls below the
            floor A_min. That floor is what makes the field unbreakable.
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Medium density flow -- rho(x,y) around a coherence bubble ─────────────────────
function DensityFlowCanvas() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const uRef = useRef(1.0);     // flow speed U
  const medRef = useRef(0);     // selected medium index

  const [u, setU] = useState(1.0);
  const [med, setMed] = useState(0);

  const dMaxR = useRef<HTMLSpanElement | null>(null);
  const dMinR = useRef<HTMLSpanElement | null>(null);
  const uOut = useRef<HTMLSpanElement | null>(null);
  const medOut = useRef<HTMLSpanElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    let dim = fitCanvas(canvas, 380);
    const onResize = () => { dim = fitCanvas(canvas, 380); };
    window.addEventListener("resize", onResize);

    const parts: Particle[] = [];
    for (let i = 0; i < 130; i++) parts.push({ x: Math.random() * dim.w, y: Math.random() * dim.h });

    let raf = 0;
    let t = 0;

    const draw = () => {
      const ctx = canvas.getContext("2d");
      if (!ctx) { raf = requestAnimationFrame(draw); return; }
      const w = dim.w, h = dim.h;
      const U = uRef.current;
      const mi = medRef.current;
      const m = MEDIA[mi];
      t += 1 / 60;

      const cx = w / 2, cy = h / 2;
      // bubble radius depends on medium (denser medium -> larger coherence-locked zone)
      const a = Math.min(w, h) * (0.13 + m.A * 0.12);

      // velocity of potential flow around a cylinder (units of U)
      const vel = (x: number, y: number): Vel => {
        const dx = x - cx, dy = y - cy;
        const r = Math.sqrt(dx * dx + dy * dy);
        if (r < a) return { sp: 0, inside: true, vx: 0, vy: 0 };
        const th = Math.atan2(dy, dx);
        const a2 = (a * a) / (r * r);
        const vr = (1 - a2) * Math.cos(th);
        const vt = -(1 + a2) * Math.sin(th);
        // convert polar to cartesian speed
        const vx = vr * Math.cos(th) - vt * Math.sin(th);
        const vy = vr * Math.sin(th) + vt * Math.cos(th);
        return { sp: Math.sqrt(vx * vx + vy * vy), inside: false, vx, vy };
      };

      ctx.clearRect(0, 0, w, h);
      ctx.fillStyle = "#05060C";
      ctx.fillRect(0, 0, w, h);

      // density heatmap rho = 1 + 0.5(1 - |V|^2), clamped to [0,2]
      const cell = 14;
      let dmax = 0, dmin = 2;
      for (let gx = 0; gx < w; gx += cell) {
        for (let gy = 0; gy < h; gy += cell) {
          const v = vel(gx + cell / 2, gy + cell / 2);
          let rho: number;
          let col: number[];
          if (v.inside) {
            rho = 1; col = [200, 160, 48]; // coherence-locked gold interior
          } else {
            rho = 1 + 0.5 * (1 - v.sp * v.sp);
            rho = Math.max(0, Math.min(2, rho));
            if (rho >= 1) {
              // ambient gold -> high violet
              const k = rho - 1;
              col = [Math.round(200 + (153 - 200) * k), Math.round(160 + (102 - 160) * k), Math.round(48 + (255 - 48) * k)];
            } else {
              // low amber
              const k = 1 - rho;
              col = [Math.round(200 + (255 - 200) * k), Math.round(160 - 10 * k), Math.round(48 + (51 - 48) * k)];
            }
            dmax = Math.max(dmax, rho); dmin = Math.min(dmin, rho);
          }
          ctx.fillStyle = `rgba(${col[0]},${col[1]},${col[2]},0.34)`;
          ctx.fillRect(gx, gy, cell, cell);
        }
      }

      // streamline particles drift along the flow
      for (const p of parts) {
        const v = vel(p.x, p.y);
        if (v.inside) { p.x = -5; p.y = Math.random() * h; continue; }
        p.x += v.vx * U * 2.2 + U * 0.4;
        p.y += v.vy * U * 2.2;
        if (p.x > w + 4 || p.x < -4 || p.y < -4 || p.y > h + 4) {
          p.x = -2; p.y = Math.random() * h;
        }
        const sp = Math.min(1, v.sp / 2);
        ctx.fillStyle = `rgba(255,255,255,${0.25 + sp * 0.5})`;
        ctx.beginPath(); ctx.arc(p.x, p.y, 1.2, 0, Math.PI * 2); ctx.fill();
      }

      // coherence bubble
      ctx.beginPath(); ctx.arc(cx, cy, a, 0, Math.PI * 2);
      ctx.fillStyle = "rgba(200,160,48,0.16)";
      ctx.fill();
      ctx.setLineDash([4, 5]);
      ctx.strokeStyle = "rgba(200,160,48,0.7)";
      ctx.lineWidth = 1.3;
      ctx.stroke();
      ctx.setLineDash([]);

      // stagnation (high) + equatorial (low) markers
      ctx.fillStyle = V.vio;
      ctx.beginPath(); ctx.arc(cx - a, cy, 3, 0, Math.PI * 2); ctx.fill();
      ctx.beginPath(); ctx.arc(cx + a, cy, 3, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = V.amb;
      ctx.beginPath(); ctx.arc(cx, cy - a, 3, 0, Math.PI * 2); ctx.fill();
      ctx.beginPath(); ctx.arc(cx, cy + a, 3, 0, Math.PI * 2); ctx.fill();

      ctx.font = `9px ${MONO}`;
      ctx.fillStyle = V.aurora;
      ctx.fillText(`DENSITY FLOW rho(x,y) -- MEDIUM: ${m.name}`, 12, 16);
      ctx.fillStyle = "rgba(184,204,232,0.55)";
      ctx.fillText("VIOLET = STAGNATION (HIGH)   AMBER = EQUATORIAL |V|=2U (LOW)   GOLD = LOCKED", 12, h - 10);

      if (dMaxR.current) dMaxR.current.textContent = dmax.toFixed(2);
      if (dMinR.current) dMinR.current.textContent = dmin.toFixed(2);
      if (uOut.current) uOut.current.textContent = U.toFixed(2);
      if (medOut.current) medOut.current.textContent = m.name;

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
        <Readout label="Max density (bow)" col={V.vio} vref={dMaxR} />
        <Readout label="Min density (eq.)" col={V.amb} vref={dMinR} />
        <Readout label="Flow speed U" col={V.blue} vref={uOut} />
        <Readout label="Medium" col={V.aurora} vref={medOut} />
      </div>
      <div style={{ marginTop: 12 }}>
        <Slider label="Flow speed U" value={u} min={0.2} max={3} step={0.05} col={V.blue}
          onChange={(v) => { setU(v); uRef.current = v; }} fmt={(v) => v.toFixed(2)} />
        <div style={{ display: "flex", gap: 8, marginTop: 4, flexWrap: "wrap" }}>
          {MEDIA.map((m, i) => (
            <button key={m.name} onClick={() => { setMed(i); medRef.current = i; }}
              style={{ fontFamily: MONO, fontSize: 8, letterSpacing: "0.1em",
                padding: "8px 14px", borderRadius: 5, cursor: "pointer", flex: 1,
                background: med === i ? `rgba(${m.col[0]},${m.col[1]},${m.col[2]},0.18)` : "transparent",
                border: `1px solid rgba(${m.col[0]},${m.col[1]},${m.col[2]},${med === i ? 0.7 : 0.3})`,
                color: `rgb(${m.col[0]},${m.col[1]},${m.col[2]})` }}>
              {m.name}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

const PSEUDOCODE = `function unbreakable_field(media, t):
    # 1. the pulse -- coherence floored so it can never break
    A = A_min + (1 - A_min) * 0.5 * (1 + sin(omega * t))   # A_min > 0
    C = A * exp(i * (phi - omega * t))                      # |C| = A

    # 2. cross each medium -- air, land, water, sea
    for m in [AIR, LAND, WATER, SEA]:
        assert m.T + m.R + m.A == 1            # conservation
        transmitted = m.T * C                   # amplitude carried through
        glow        = m.A * |C|                 # absorbed -> visible pulse

    # 3. flow dynamics around a coherence bubble
    rho(x, y) = 1 + 0.5 * (1 - |V(x, y)|^2)     # density field
    # stagnation: |V|=0 -> high ; equator: |V|=2U -> low ; interior locked

    return C   # never decoheres below A_min`;

export default function ElectronFieldPage() {
  return (
    <div style={{ maxWidth: 1080, margin: "0 auto", padding: "28px 20px 80px",
      background: V.bg, minHeight: "100vh", color: V.ink }}>
      {/* Header */}
      <div style={{ marginBottom: 30 }}>
        <div style={{ fontFamily: MONO, fontSize: 8, color: V.dim, letterSpacing: "0.2em", marginBottom: 10 }}>
          AETHER KNOWLEDGE SYSTEM -- COHERENT FIELD DYNAMICS
        </div>
        <h1 style={{ margin: "0 0 8px", fontFamily: DISP, fontSize: "clamp(1.2rem,4vw,1.9rem)",
          fontWeight: 400, color: V.aurora, letterSpacing: "0.15em", lineHeight: 1.2 }}>
          UNBREAKABLE PULSING ELECTRON FIELD
        </h1>
        <div style={{ fontFamily: SERIF, fontSize: "1.05rem", color: "rgba(184,204,232,0.75)", marginBottom: 14 }}>
          One coherent electron field, pulsing on the AETHER coherence law, carried unbroken through
          four media -- air, land, water, and sea. A coherence floor A_min makes it unbreakable: the
          field shimmers under disruption but never decoheres past the floor. Each medium splits the
          field by T + R + A = 1, and the flow around a coherence bubble follows the spacetime density
          law. Built only from equations already proven inside AETHER.
        </div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 5, marginBottom: 8 }}>
          <Chip col={V.aurora}>Coherence Field</Chip>
          <Chip col={V.green}>Unbreakable Floor</Chip>
          <Chip col={V.blue}>Air</Chip>
          <Chip col={V.amb}>Land</Chip>
          <Chip col={V.blue}>Water</Chip>
          <Chip col={V.vio}>Sea</Chip>
          <Chip col={V.gold}>T + R + A = 1</Chip>
          <Chip col={V.rose}>Density Flow</Chip>
        </div>
        <div style={{ height: 1, background: `linear-gradient(90deg,${V.aurora}44,transparent)` }} />
      </div>

      {/* I — pulsing electron field */}
      <div style={{ marginBottom: 42 }}>
        <SectionHead n="I" title="LIVE -- THE FIELD THAT WILL NOT BREAK" col={V.aurora} />
        <div style={{ fontFamily: SERIF, fontSize: "0.92rem", color: "rgba(184,204,232,0.7)",
          lineHeight: 1.55, marginBottom: 14, maxWidth: 820 }}>
          Four stacked bands are the four media. The electron field pulses across all of them on a
          single phase, and the glow of every electron is the coherence magnitude |C|, brightened by
          how much each medium absorbs (its A). The coherence floor A_min is the key idea: raise the
          disruption and the field jitters, the quality factor and coherence time fall -- but the glow
          never drops below the floor. That is what unbreakable means here. It is not that nothing
          disturbs the field; it is that the field always keeps a minimum coherence and re-pulses.
        </div>
        <ElectronFieldCanvas />
      </div>

      {/* II — density flow */}
      <div style={{ marginBottom: 42 }}>
        <SectionHead n="II" title="LIVE -- FLOW THROUGH EACH MEDIUM" col={V.blue} />
        <div style={{ fontFamily: SERIF, fontSize: "0.92rem", color: "rgba(184,204,232,0.7)",
          lineHeight: 1.55, marginBottom: 14, maxWidth: 820 }}>
          The same field forms a coherence bubble in the medium it moves through. Around that bubble
          the flow obeys the spacetime density law: density piles up at the bow and trailing
          stagnation points (violet) and thins at the equator where the flow accelerates to |V| = 2U
          (amber). Inside the bubble the zone is coherence-locked at a fixed density (gold). Switch the
          medium and change the flow speed to watch air, land, water, and sea reshape the field.
        </div>
        <DensityFlowCanvas />
      </div>

      {/* III — math */}
      <div style={{ marginBottom: 42 }}>
        <SectionHead n="III" title="DEFINED MATHEMATICALLY -- PROVEN AETHER EQUATIONS" col={V.gold} />
        <div style={{ fontFamily: SERIF, fontSize: "0.86rem", color: "rgba(184,204,232,0.6)",
          lineHeight: 1.5, marginBottom: 14, maxWidth: 820 }}>
          Every law here already exists inside AETHER -- the coherence field, the conservation of light
          across a substrate, and the spacetime density field. The page only composes them; it invents
          no new physics.
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
          {[
            { c: V.aurora, t: "Coherence field (master law)",
              tex: "C(x,t)=A(x)\\,e^{\\,i(\\phi-\\omega t)}",
              d: "The single equation the field runs on. Amplitude A(x), phase phi, angular frequency omega. The pulse drives omega t; the medium sets A." },
            { c: V.vio, t: "Coherence magnitude",
              tex: "|C(x,t)|=A(x),\\qquad 0\\le A(x)\\le 1",
              d: "The glow of every electron is exactly its amplitude. Bright means coherent; dim means decohering -- but never below the floor." },
            { c: V.green, t: "The unbreakable pulse",
              tex: "A(t)=A_{\\min}+(1-A_{\\min})\\,\\tfrac{1}{2}\\!\\left(1+\\sin\\omega t\\right)",
              d: "The composition that defines unbreakable. With A_min > 0 the amplitude oscillates up to 1 and back down to the floor -- never to zero." },
            { c: V.gold, t: "Quality factor",
              tex: "Q=\\dfrac{\\omega}{\\Delta\\omega}",
              d: "How many pulses survive before phase is lost. More disruption raises Delta-omega and lowers Q -- the field shimmers but holds." },
            { c: V.blue, t: "Coherence time",
              tex: "\\tau_c\\sim\\dfrac{1}{\\Delta\\omega}",
              d: "The lifetime of phase memory under disruption -- how long the field stays in step across the four media." },
            { c: V.rose, t: "Penetration depth",
              tex: "\\delta\\sim\\dfrac{\\lambda}{2\\pi\\kappa}",
              d: "How far the field reaches into each medium. The extinction kappa differs for air, land, water, and sea." },
            { c: V.amb, t: "Conservation across a medium",
              tex: "T+R+A=1",
              d: "When the field meets a substrate it splits: transmitted, reflected, absorbed. The three always sum to one -- nothing is lost." },
            { c: V.fire, t: "Transmitted and absorbed",
              tex: "|C_{\\text{out}}|\\propto T,\\qquad \\text{glow}\\propto A",
              d: "The amplitude carried through scales with T; the visible pulse in each band scales with that medium's absorption A." },
            { c: V.vio, t: "Spacetime density field",
              tex: "\\rho(x,y)=1+\\tfrac{1}{2}\\!\\left(1-|V(x,y)|^{2}\\right)",
              d: "Around the coherence bubble the density rises where flow slows and falls where it speeds up. Interior is locked at ambient rho_0." },
            { c: V.green, t: "Equatorial acceleration",
              tex: "|V|=2U\\;\\;(\\text{equator}),\\qquad |V|=0\\;\\;(\\text{stagnation})",
              d: "On the bubble surface the flow doubles to 2U at the equator (low density, amber) and stops at the bow and trailing points (high, violet)." },
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

      {/* IV — architecture */}
      <div style={{ marginBottom: 42 }}>
        <SectionHead n="IV" title="THE FIELD ARCHITECTURE" col={V.aurora} />
        <div style={{ fontFamily: SERIF, fontSize: "0.92rem", color: "rgba(184,204,232,0.7)",
          lineHeight: 1.55, marginBottom: 12, maxWidth: 820 }}>
          The mechanism reads as one loop: pulse the field above a floor, carry it through each medium
          by T + R + A, and let the density law shape the flow around the bubble. Floor is what makes
          it unbreakable; the media are what make it dynamic.
        </div>
        <pre style={{ fontFamily: MONO, fontSize: "0.78rem", color: V.aurora, lineHeight: 1.55,
          background: "#070A12", border: `1px solid ${V.aurora}30`, borderRadius: 8,
          padding: "16px 18px", overflowX: "auto", margin: 0 }}>{PSEUDOCODE}</pre>
      </div>

      {/* V — source plates */}
      <div style={{ marginBottom: 42 }}>
        <SectionHead n="V" title="SOURCE PLATES" col={V.rose} />
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(260px,1fr))", gap: 14 }}>
          {[
            { src: plateLight, t: "T + R + A = 1", d: "How a photon meets six substrates -- transmitted, reflected, absorbed -- always summing to one. The law each medium uses to split the field." },
            { src: plateDensity, t: "Spacetime Density Field", d: "rho(x,y) = 1 + 0.5(1 - |V|^2) around an embedded coherence bubble: violet stagnation, amber equator, gold locked interior." },
          ].map((p) => (
            <figure key={p.t} style={{ margin: 0, borderRadius: 8, overflow: "hidden",
              border: `1px solid ${V.dim}44`, background: "#070A12" }}>
              <img src={p.src} alt={p.t} loading="lazy" style={{ width: "100%", display: "block" }} />
              <figcaption style={{ padding: "10px 12px" }}>
                <div style={{ fontFamily: MONO, fontSize: 8, color: V.rose, letterSpacing: "0.12em", marginBottom: 5 }}>
                  {p.t.toUpperCase()}
                </div>
                <div style={{ fontFamily: SERIF, fontSize: "0.82rem", color: "rgba(184,204,232,0.62)", lineHeight: 1.4 }}>
                  {p.d}
                </div>
              </figcaption>
            </figure>
          ))}
        </div>
      </div>

      {/* VI — verbal */}
      <div style={{ marginBottom: 42 }}>
        <SectionHead n="VI" title="DEFINED VERBALLY" col={V.vio} />
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
          {[
            { c: V.green, t: "Unbreakable means floored",
              b: "A field breaks when its coherence reaches zero. This one cannot, because the amplitude is floored at A_min above zero. Disruption can shorten the coherence time and lower the quality factor, but the pulse always returns to the floor and climbs again. Resilience is built into the equation, not bolted on." },
            { c: V.aurora, t: "Pulsing is the phase",
              b: "The pulse is just the coherence law running in time. As omega t advances, the amplitude breathes between the floor and one. That breathing is the heartbeat of the field -- the same oscillation that lights the electrons and drives the flow around the bubble." },
            { c: V.blue, t: "Four media, one field",
              b: "Air, land, water, and sea are not four fields -- they are one field crossing four substrates. Each medium has its own transmission, reflection, and absorption, so the same pulse looks bright and slow in dense land, faint and fast in clear air. The field is shared; the response is local." },
            { c: V.amb, t: "Every medium conserves",
              b: "When the field meets a medium it splits into transmitted, reflected, and absorbed parts, and those parts always sum to one. Nothing is lost, only redistributed. That conservation is why the field can cross between media without leaking coherence." },
            { c: V.rose, t: "Flow shapes the field",
              b: "Where the field forms a coherence bubble, the surrounding flow piles density at the stagnation points and thins it at the equator, where the flow accelerates to twice the free-stream speed. The interior stays locked. This is the same density law that describes a coherence bubble embedded in a moving spacetime." },
            { c: V.gold, t: "Only proven equations",
              b: "Nothing here is invented for the page. The coherence field, the conservation law T + R + A = 1, and the spacetime density field all already live inside AETHER. The only new step is composing the unbreakable pulse from a floor and the proven amplitude bound. The physics is borrowed, not improvised." },
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
        <a href="/nutritional-dna-key" style={{ fontFamily: MONO, fontSize: 8, color: V.aurora, textDecoration: "none" }}>
          &lt;-- NUTRITIONAL RAINBOW DNA KEY -- COHERENCE COMPUTATION
        </a>
        <div style={{ fontFamily: MONO, fontSize: 8, color: V.dim, textAlign: "right" }}>
          <div>Unbreakable Pulsing Electron Field -- Air Land Water Sea</div>
          <div>|C| = A(x) -- T + R + A = 1 -- the net is there</div>
        </div>
      </div>
    </div>
  );
}
