import { useEffect, useRef, useState } from "react";
import katex from "katex";
import "katex/dist/katex.min.css";

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

// wavelength (nm) -> approximate visible RGB, used to colour the beam
function wlToRGB(wl: number): [number, number, number] {
  let r = 0, g = 0, b = 0;
  if (wl >= 380 && wl < 440) { r = -(wl - 440) / (440 - 380); b = 1; }
  else if (wl < 490) { g = (wl - 440) / (490 - 440); b = 1; }
  else if (wl < 510) { g = 1; b = -(wl - 510) / (510 - 490); }
  else if (wl < 580) { r = (wl - 510) / (580 - 510); g = 1; }
  else if (wl < 645) { r = 1; g = -(wl - 645) / (645 - 580); }
  else { r = 1; }
  return [Math.round(r * 255), Math.round(g * 255), Math.round(b * 255)];
}

interface Photon { x: number; y: number; vx: number; alive: boolean; reflected: boolean }

// ── SIM 1 — Absorption pressure column (Beer-Lambert + radiation pressure) ────────
function AbsorptionColumnCanvas() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const i0Ref = useRef(1.2);    // incident intensity I_0 (relative)
  const alRef = useRef(3.0);    // absorption coefficient alpha (1/L)
  const rRef = useRef(0.12);    // surface reflectivity R
  const wlRef = useRef(500);    // wavelength (nm)

  const [i0, setI0] = useState(1.2);
  const [al, setAl] = useState(3.0);
  const [r, setR] = useState(0.12);
  const [wl, setWl] = useState(500);

  const dR = useRef<HTMLSpanElement | null>(null);
  const aR = useRef<HTMLSpanElement | null>(null);
  const tR = useRef<HTMLSpanElement | null>(null);
  const pR = useRef<HTMLSpanElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    let dim = fitCanvas(canvas, 380);
    const onResize = () => { dim = fitCanvas(canvas, 380); };
    window.addEventListener("resize", onResize);
    const reduce = prefersReduced();

    const photons: Photon[] = [];
    const beamTop = () => dim.h * 0.30;
    const beamBot = () => dim.h * 0.70;
    const x0 = () => dim.w * 0.14; // medium surface x

    const spawn = (): Photon => {
      const y = beamTop() + Math.random() * (beamBot() - beamTop());
      return { x: 4, y, vx: 1.6 + Math.random() * 0.6, alive: true, reflected: false };
    };
    for (let i = 0; i < 120; i++) { const p = spawn(); p.x = Math.random() * dim.w; photons.push(p); }

    let raf = 0;

    const draw = () => {
      const ctx = canvas.getContext("2d");
      if (!ctx) { raf = requestAnimationFrame(draw); return; }
      const w = dim.w, h = dim.h;
      const I0 = i0Ref.current, alpha = alRef.current, R = rRef.current, wlen = wlRef.current;
      const sx = x0(), bt = beamTop(), bb = beamBot();
      const L = w - sx; // medium length in pixels
      const [cr, cg, cb] = wlToRGB(wlen);

      ctx.clearRect(0, 0, w, h);
      ctx.fillStyle = "#05060C";
      ctx.fillRect(0, 0, w, h);

      // medium block
      ctx.fillStyle = "rgba(40,60,90,0.10)";
      ctx.fillRect(sx, 0, L, h);
      ctx.strokeStyle = `${V.dim}66`;
      ctx.beginPath(); ctx.moveTo(sx, 0); ctx.lineTo(sx, h); ctx.stroke();

      // transmitted-into-medium fraction after surface reflection
      const inFrac = 1 - R;

      // medium layers compressed by radiation pressure (denser near surface where dI/dx peaks)
      // cumulative compression u(x) ~ integral of absorbed power -> 1 - e^{-alpha x}
      const nLayers = 26;
      for (let k = 0; k <= nLayers; k++) {
        const frac = k / nLayers; // 0..1 across medium in *relaxed* coords
        // map relaxed coord to compressed coord: layers bunch toward the surface
        const press = 1 - Math.exp(-alpha * frac);
        const pressMax = 1 - Math.exp(-alpha);
        const comp = pressMax > 0 ? press / pressMax : frac;
        // squeeze: weighted blend pulls layers toward surface proportional to pressure
        const xc = sx + L * (0.55 * frac + 0.45 * comp);
        const a = 0.05 + 0.22 * (1 - frac);
        ctx.strokeStyle = `rgba(${cr},${cg},${cb},${a})`;
        ctx.lineWidth = 0.8;
        ctx.beginPath(); ctx.moveTo(xc, 0); ctx.lineTo(xc, h); ctx.stroke();
      }

      // beam intensity envelope I(x) = inFrac*I0*e^{-alpha*(x-sx)/L}
      // one vertical gradient built per frame; per-column intensity via globalAlpha
      const beamH = bb - bt;
      const beamGrad = ctx.createLinearGradient(0, bt, 0, bb);
      beamGrad.addColorStop(0, `rgba(${cr},${cg},${cb},0)`);
      beamGrad.addColorStop(0.5, `rgba(${cr},${cg},${cb},0.6)`);
      beamGrad.addColorStop(1, `rgba(${cr},${cg},${cb},0)`);
      ctx.fillStyle = beamGrad;
      for (let px = 0; px < w; px++) {
        let I: number;
        if (px < sx) I = I0; // incident beam in vacuum
        else {
          const depth = (px - sx) / L;
          I = inFrac * I0 * Math.exp(-alpha * depth);
        }
        ctx.globalAlpha = Math.max(0, Math.min(1, I / 2));
        ctx.fillRect(px, bt, 1, beamH);
      }
      ctx.globalAlpha = 1;

      // radiation-pressure profile curve P(x) ~ alpha*I(x) (absorbed power density)
      ctx.strokeStyle = V.amb;
      ctx.lineWidth = 1.4;
      ctx.beginPath();
      let pPeak = 0;
      for (let px = sx; px < w; px++) {
        const depth = (px - sx) / L;
        const I = inFrac * I0 * Math.exp(-alpha * depth);
        const P = alpha * I;
        pPeak = Math.max(pPeak, P);
        const yy = h - 18 - P * 22;
        if (px === sx) ctx.moveTo(px, yy); else ctx.lineTo(px, yy);
      }
      ctx.stroke();
      ctx.font = `8px ${MONO}`;
      ctx.fillStyle = V.amb;
      ctx.fillText("RADIATION PRESSURE dP ~ alpha*I(x)", sx + 6, h - 22 - pPeak * 22);

      // reflected lobe at surface
      if (R > 0.01) {
        ctx.fillStyle = `rgba(${cr},${cg},${cb},${0.18 + R * 0.4})`;
        ctx.beginPath();
        ctx.moveTo(sx, (bt + bb) / 2);
        ctx.lineTo(sx - 26 * R - 6, bt - 8);
        ctx.lineTo(sx - 26 * R - 6, bb + 8);
        ctx.closePath();
        ctx.fill();
      }

      // photons
      const dt = reduce ? 0 : 1;
      for (const p of photons) {
        if (dt) {
          if (!p.reflected && p.x >= sx) {
            // chance to be absorbed in this step, scaled by alpha and local depth
            const depth = (p.x - sx) / L;
            const probAbs = alpha * 0.012 * Math.exp(-alpha * depth * 0.3);
            if (Math.random() < probAbs) {
              // absorbed flash -> respawn (possibly reflected at surface next time)
              ctx.fillStyle = `rgba(255,160,60,0.9)`;
              ctx.beginPath(); ctx.arc(p.x, p.y, 3, 0, Math.PI * 2); ctx.fill();
              const np = spawn();
              if (Math.random() < R) { np.reflected = true; np.x = sx; np.vx = -(1.4 + Math.random()); }
              Object.assign(p, np);
              continue;
            }
          }
          p.x += p.vx;
          if (p.reflected && p.x < -4) Object.assign(p, spawn());
          if (!p.reflected && p.x > w + 4) Object.assign(p, spawn());
        }
        const inMed = p.x >= sx && !p.reflected;
        const depth = inMed ? (p.x - sx) / L : 0;
        const bright = inMed ? Math.exp(-alpha * depth) : 1;
        ctx.fillStyle = `rgba(${cr},${cg},${cb},${0.4 + bright * 0.55})`;
        ctx.shadowBlur = bright * 7; ctx.shadowColor = `rgba(${cr},${cg},${cb},0.9)`;
        ctx.beginPath(); ctx.arc(p.x, p.y, 1.5, 0, Math.PI * 2); ctx.fill();
        ctx.shadowBlur = 0;
      }

      // labels
      ctx.font = `9px ${MONO}`;
      ctx.fillStyle = V.aurora;
      ctx.fillText("INCIDENT LIGHT", 8, 16);
      ctx.fillStyle = V.ink;
      ctx.fillText("MEDIUM (ABSORBING)", sx + 6, 16);

      // computed conservation + readouts
      const Ttot = inFrac * Math.exp(-alpha);            // transmitted out the back
      const Atot = inFrac * (1 - Math.exp(-alpha));       // absorbed inside
      const delta = 1 / Math.max(0.001, alpha);           // penetration depth (in L units)
      // surface radiation pressure: absorbed photons give p=E/c, reflected give 2E/c
      // P_surf (relative) = (A_local + 2R) * I0 ; A_local at surface ~ inFrac
      const Psurf = (inFrac + 2 * R) * I0;
      if (dR.current) dR.current.textContent = `${delta.toFixed(2)} L`;
      if (aR.current) aR.current.textContent = Atot.toFixed(3);
      if (tR.current) tR.current.textContent = Ttot.toFixed(3);
      if (pR.current) pR.current.textContent = Psurf.toFixed(2);

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
        <Readout label="Penetration depth d" col={V.blue} vref={dR} />
        <Readout label="Absorbed A" col={V.amb} vref={aR} />
        <Readout label="Transmitted T" col={V.green} vref={tR} />
        <Readout label="Surface pressure P" col={V.rose} vref={pR} />
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginTop: 12 }}>
        <div>
          <Slider label="Incident intensity I0" value={i0} min={0.2} max={2} step={0.02} col={V.aurora}
            onChange={(v) => { setI0(v); i0Ref.current = v; }} fmt={(v) => v.toFixed(2)} />
          <Slider label="Absorption coefficient alpha" value={al} min={0.5} max={8} step={0.05} col={V.amb}
            onChange={(v) => { setAl(v); alRef.current = v; }} fmt={(v) => v.toFixed(2)} />
        </div>
        <div>
          <Slider label="Surface reflectivity R" value={r} min={0} max={0.9} step={0.01} col={V.rose}
            onChange={(v) => { setR(v); rRef.current = v; }} fmt={(v) => v.toFixed(2)} />
          <Slider label="Wavelength (nm)" value={wl} min={380} max={720} step={1} col={V.vio}
            onChange={(v) => { setWl(v); wlRef.current = v; }} fmt={(v) => `${v.toFixed(0)} nm`} />
        </div>
      </div>
      <div style={{ fontFamily: SERIF, fontSize: "0.8rem", color: "rgba(184,204,232,0.55)", lineHeight: 1.4, marginTop: 6 }}>
        The beam dims with depth by Beer&ndash;Lambert decay; the amber curve is the radiation pressure
        deposited at each depth, peaking at the surface where absorption is fiercest. The medium&apos;s
        layers bunch toward that surface &mdash; light is pressing on matter as it is absorbed.
      </div>
    </div>
  );
}

// ── SIM 2 — Radiation-pressure sail (momentum transfer -> thrust) ────────────────
function SailCanvas() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const intRef = useRef(1.2);   // incident intensity I
  const rflRef = useRef(0.85);  // sail reflectivity (0 = black/absorbing, 1 = mirror)
  const areaRef = useRef(1.0);  // sail area A
  const massRef = useRef(1.0);  // sail mass m

  const [int, setInt] = useState(1.2);
  const [rfl, setRfl] = useState(0.85);
  const [area, setArea] = useState(1.0);
  const [mass, setMass] = useState(1.0);

  const pR = useRef<HTMLSpanElement | null>(null);
  const fR = useRef<HTMLSpanElement | null>(null);
  const aR = useRef<HTMLSpanElement | null>(null);
  const vR = useRef<HTMLSpanElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    let dim = fitCanvas(canvas, 360);
    const onResize = () => { dim = fitCanvas(canvas, 360); };
    window.addEventListener("resize", onResize);
    const reduce = prefersReduced();

    interface Ph { x: number; y: number; vx: number; back: boolean }
    const phs: Ph[] = [];
    for (let i = 0; i < 90; i++) {
      phs.push({ x: Math.random() * dim.w, y: 40 + Math.random() * (dim.h - 80), vx: 2 + Math.random(), back: false });
    }

    let sailX = dim.w * 0.4;
    let sailV = 0;
    let raf = 0;

    const draw = () => {
      const ctx = canvas.getContext("2d");
      if (!ctx) { raf = requestAnimationFrame(draw); return; }
      const w = dim.w, h = dim.h;
      const I = intRef.current, rflv = rflRef.current, A = areaRef.current, m = massRef.current;
      const reduceStep = reduce ? 0 : 1;

      // radiation pressure P = (1 + R) I / c  (reflective doubles momentum transfer)
      // relative units: c folded into a constant scale
      const cRel = 8;
      const P = (1 + rflv) * I / cRel;
      const F = P * A;
      const acc = F / Math.max(0.1, m);

      if (reduceStep) {
        sailV += acc * 0.25;
        sailV *= 0.992; // mild relativistic-style damping so it stays on screen
        sailX += sailV;
        if (sailX > w * 0.9) { sailX = w * 0.4; sailV = 0; }
      }
      const sailW = 8;
      const sailHalf = 60 + A * 30;

      ctx.clearRect(0, 0, w, h);
      ctx.fillStyle = "#05060C";
      ctx.fillRect(0, 0, w, h);

      // photon stream
      for (const p of phs) {
        if (reduceStep) {
          if (!p.back) {
            p.x += p.vx;
            if (p.x >= sailX - sailW && Math.abs(p.y - h / 2) < sailHalf) {
              if (Math.random() < rflv) { p.back = true; p.vx = -(1.6 + Math.random()); }
              else { // absorbed -> flash, respawn at left
                ctx.fillStyle = "rgba(255,150,60,0.9)";
                ctx.beginPath(); ctx.arc(p.x, p.y, 3, 0, Math.PI * 2); ctx.fill();
                p.x = -4; p.y = 40 + Math.random() * (h - 80); p.vx = 2 + Math.random();
              }
            }
            if (p.x > w + 4) { p.x = -4; p.y = 40 + Math.random() * (h - 80); }
          } else {
            p.x += p.vx;
            if (p.x < -4) { p.back = false; p.x = -4; p.y = 40 + Math.random() * (h - 80); p.vx = 2 + Math.random(); }
          }
        }
        ctx.fillStyle = p.back ? "rgba(255,200,120,0.8)" : "rgba(255,240,180,0.85)";
        ctx.shadowBlur = 5; ctx.shadowColor = "rgba(255,220,140,0.8)";
        ctx.beginPath(); ctx.arc(p.x, p.y, 1.5, 0, Math.PI * 2); ctx.fill();
        ctx.shadowBlur = 0;
      }

      // sun glow at left
      const sg = ctx.createRadialGradient(0, h / 2, 8, 0, h / 2, 120);
      sg.addColorStop(0, "rgba(255,220,120,0.5)");
      sg.addColorStop(1, "rgba(255,220,120,0)");
      ctx.fillStyle = sg;
      ctx.fillRect(0, 0, 120, h);

      // sail (colour from absorbing->reflecting)
      const refl = rflv;
      const sr = Math.round(120 + refl * 120);
      const sgc = Math.round(150 + refl * 90);
      const sb = Math.round(200 + refl * 55);
      ctx.fillStyle = `rgba(${sr},${sgc},${sb},${0.45 + refl * 0.4})`;
      ctx.strokeStyle = `rgba(${sr},${sgc},${sb},0.95)`;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(sailX, h / 2 - sailHalf);
      ctx.lineTo(sailX + sailW, h / 2 - sailHalf + 10);
      ctx.lineTo(sailX + sailW, h / 2 + sailHalf - 10);
      ctx.lineTo(sailX, h / 2 + sailHalf);
      ctx.closePath();
      ctx.fill(); ctx.stroke();

      // thrust arrow
      ctx.strokeStyle = V.aurora;
      ctx.lineWidth = 2;
      const al = 10 + F * 30;
      ctx.beginPath();
      ctx.moveTo(sailX + sailW + 4, h / 2);
      ctx.lineTo(sailX + sailW + 4 + al, h / 2);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(sailX + sailW + 4 + al, h / 2);
      ctx.lineTo(sailX + sailW + al - 4, h / 2 - 5);
      ctx.lineTo(sailX + sailW + al - 4, h / 2 + 5);
      ctx.closePath(); ctx.fillStyle = V.aurora; ctx.fill();

      ctx.font = `9px ${MONO}`;
      ctx.fillStyle = V.gold;
      ctx.fillText("PHOTON SOURCE", 8, 16);
      ctx.fillStyle = refl > 0.5 ? V.aurora : V.amb;
      ctx.fillText(refl > 0.5 ? "MIRROR SAIL  P = 2I/c" : "BLACK SAIL  P = I/c", sailX - 20, h / 2 - sailHalf - 8);

      if (pR.current) pR.current.textContent = P.toFixed(3);
      if (fR.current) fR.current.textContent = F.toFixed(3);
      if (aR.current) aR.current.textContent = acc.toFixed(3);
      if (vR.current) vR.current.textContent = sailV.toFixed(2);

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
        <Readout label="Pressure P" col={V.rose} vref={pR} />
        <Readout label="Force F = P*A" col={V.gold} vref={fR} />
        <Readout label="Accel a = F/m" col={V.aurora} vref={aR} />
        <Readout label="Velocity v" col={V.blue} vref={vR} />
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginTop: 12 }}>
        <div>
          <Slider label="Light intensity I" value={int} min={0.2} max={2.5} step={0.02} col={V.gold}
            onChange={(v) => { setInt(v); intRef.current = v; }} fmt={(v) => v.toFixed(2)} />
          <Slider label="Sail reflectivity (absorb<->mirror)" value={rfl} min={0} max={1} step={0.01} col={V.aurora}
            onChange={(v) => { setRfl(v); rflRef.current = v; }} fmt={(v) => v.toFixed(2)} />
        </div>
        <div>
          <Slider label="Sail area A" value={area} min={0.4} max={3} step={0.05} col={V.vio}
            onChange={(v) => { setArea(v); areaRef.current = v; }} fmt={(v) => v.toFixed(2)} />
          <Slider label="Sail mass m" value={mass} min={0.3} max={4} step={0.05} col={V.rose}
            onChange={(v) => { setMass(v); massRef.current = v; }} fmt={(v) => v.toFixed(2)} />
        </div>
      </div>
      <div style={{ fontFamily: SERIF, fontSize: "0.8rem", color: "rgba(184,204,232,0.55)", lineHeight: 1.4, marginTop: 6 }}>
        A black sail absorbs each photon and takes its momentum once (P = I/c). A mirror sail bounces
        the photon back and takes it twice (P = 2I/c) &mdash; absorption is the floor of thrust,
        reflection the ceiling. The same pressure that warms a body in sunlight can push a craft.
      </div>
    </div>
  );
}

const PSEUDOCODE = `function light_under_pressure(I0, alpha, R, lambda):
    # 1. conservation at the surface -- nothing is lost
    R_tot = R
    into  = 1 - R                          # fraction entering the medium

    # 2. Beer-Lambert decay through depth x in [0, L]
    I(x)  = into * I0 * exp(-alpha * x)     # intensity falls exponentially
    T_tot = into * exp(-alpha * L)          # transmitted out the back
    A_tot = into * (1 - exp(-alpha * L))    # absorbed inside
    assert T_tot + R_tot + A_tot == 1

    # 3. each photon carries momentum p = E/c = h/lambda
    #    absorbed -> transfers p once ; reflected -> transfers 2p
    P(x)     = alpha * I(x) / c             # radiation pressure deposited at depth x
    P_surf   = (into + 2*R) * I0 / c        # net push on the surface

    # 4. penetration depth -- how deep light reaches before 1/e remains
    delta = 1 / alpha

    # 5. turn pressure into motion (sail / propulsion)
    F = (1 + R_sail) * I * A / c
    a = F / m

    return { I(x), P(x), delta, F, a }`;

export default function LightAbsorptionPressurePage() {
  return (
    <div style={{ maxWidth: 1080, margin: "0 auto", padding: "28px 20px 80px",
      background: V.bg, minHeight: "100vh", color: V.ink }}>
      {/* Header */}
      <div style={{ marginBottom: 30 }}>
        <div style={{ fontFamily: MONO, fontSize: 8, color: V.dim, letterSpacing: "0.2em", marginBottom: 10 }}>
          AETHER KNOWLEDGE SYSTEM &middot; LIGHT &times; MATTER &middot; ABSORPTION PRESSURES
        </div>
        <h1 style={{ margin: "0 0 8px", fontFamily: DISP, fontSize: "clamp(1.2rem,4vw,1.9rem)",
          fontWeight: 400, color: V.aurora, letterSpacing: "0.15em", lineHeight: 1.2 }}>
          LIGHT UNDER ABSORPTION PRESSURES
        </h1>
        <div style={{ fontFamily: SERIF, fontSize: "1.05rem", color: "rgba(184,204,232,0.75)", marginBottom: 14 }}>
          Light is not weightless. Every photon a medium absorbs hands over its momentum, and that
          momentum is a pressure. This page simulates the whole chain that AETHER already carries:
          a beam splits at a surface by T + R + A = 1, decays through depth by Beer&ndash;Lambert,
          and presses on matter as it is absorbed &mdash; the same pressure that warms a body in
          sunlight and that can drive a craft on a beam of light.
        </div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 5, marginBottom: 8 }}>
          <Chip col={V.gold}>T + R + A = 1</Chip>
          <Chip col={V.amb}>Beer&ndash;Lambert</Chip>
          <Chip col={V.blue}>Penetration Depth</Chip>
          <Chip col={V.rose}>Radiation Pressure</Chip>
          <Chip col={V.aurora}>Photon Momentum</Chip>
          <Chip col={V.vio}>Light Sail</Chip>
          <Chip col={V.green}>Travel &times; Health</Chip>
        </div>
        <div style={{ height: 1, background: `linear-gradient(90deg,${V.aurora}44,transparent)` }} />
      </div>

      {/* I — absorption column */}
      <div style={{ marginBottom: 42 }}>
        <SectionHead n="I" title="LIVE -- ABSORPTION PRESSURE COLUMN" col={V.amb} />
        <div style={{ fontFamily: SERIF, fontSize: "0.92rem", color: "rgba(184,204,232,0.7)",
          lineHeight: 1.55, marginBottom: 14, maxWidth: 820 }}>
          A beam enters an absorbing medium from the left. A fraction R reflects at the surface; the
          rest passes in and fades with depth by Beer&ndash;Lambert decay. Where the light is absorbed
          it deposits its momentum &mdash; the amber curve is that radiation pressure, fiercest right at
          the surface and falling into the depth. Watch the medium&apos;s layers bunch toward the
          surface: light is physically pressing on matter. Raise the absorption coefficient and the
          penetration depth collapses; raise reflectivity and more push comes back off the surface.
        </div>
        <AbsorptionColumnCanvas />
      </div>

      {/* II — sail */}
      <div style={{ marginBottom: 42 }}>
        <SectionHead n="II" title="LIVE -- RADIATION-PRESSURE SAIL" col={V.aurora} />
        <div style={{ fontFamily: SERIF, fontSize: "0.92rem", color: "rgba(184,204,232,0.7)",
          lineHeight: 1.55, marginBottom: 14, maxWidth: 820 }}>
          The same pressure becomes propulsion. A stream of photons strikes a sail. A black,
          absorbing sail takes each photon&apos;s momentum once (P = I/c); a mirror sail bounces it
          back and takes it twice (P = 2I/c). Force is pressure times area, acceleration is force over
          mass &mdash; the bridge from absorbed light to motion, and the same physics behind the
          inertial-propulsion work in the system. Slide from black to mirror to feel absorption set
          the floor of thrust and reflection set the ceiling.
        </div>
        <SailCanvas />
      </div>

      {/* III — math */}
      <div style={{ marginBottom: 42 }}>
        <SectionHead n="III" title="DEFINED MATHEMATICALLY -- PROVEN AETHER EQUATIONS" col={V.gold} />
        <div style={{ fontFamily: SERIF, fontSize: "0.86rem", color: "rgba(184,204,232,0.6)",
          lineHeight: 1.5, marginBottom: 14, maxWidth: 820 }}>
          Every law here already lives inside AETHER &mdash; the conservation of light across a
          substrate, the coherence field, and the penetration depth. The page only composes them into
          the chain from absorption to pressure to motion; it invents no new physics.
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
          {[
            { c: V.gold, t: "Conservation across a medium",
              tex: "T+R+A=1",
              d: "When light meets a substrate it splits into transmitted, reflected, and absorbed parts. The three always sum to one -- the budget every pressure is drawn from." },
            { c: V.amb, t: "Beer-Lambert decay",
              tex: "I(x)=I_0\\,(1-R)\\,e^{-\\alpha x}",
              d: "Intensity falls exponentially with depth. The absorption coefficient alpha sets how fast the medium drinks the beam." },
            { c: V.blue, t: "Penetration depth",
              tex: "\\delta=\\dfrac{1}{\\alpha}=\\dfrac{\\lambda}{2\\pi\\kappa}",
              d: "The depth at which only 1/e of the light remains. Tissue, water, and metal each have their own delta -- why red light reaches deeper than blue." },
            { c: V.aurora, t: "Photon momentum",
              tex: "p=\\dfrac{E}{c}=\\dfrac{h}{\\lambda}",
              d: "Light carries momentum even with no mass. Every absorbed photon hands the medium exactly this much push." },
            { c: V.rose, t: "Radiation pressure -- absorbing",
              tex: "P_{\\text{abs}}=\\dfrac{I}{c}",
              d: "A perfectly absorbing surface takes each photon's momentum once. This is the floor of light pressure." },
            { c: V.plasma, t: "Radiation pressure -- reflecting",
              tex: "P_{\\text{ref}}=\\dfrac{2I}{c},\\qquad P=(1+R)\\dfrac{I}{c}",
              d: "A mirror reverses the photon and takes its momentum twice. Reflectivity R interpolates between the absorbing floor and the mirror ceiling." },
            { c: V.fire, t: "Absorbed power density",
              tex: "-\\dfrac{dI}{dx}=\\alpha\\,I(x)",
              d: "The rate light is absorbed at each depth -- and therefore the radiation pressure deposited there. It peaks at the surface and decays inward." },
            { c: V.green, t: "Pressure to motion",
              tex: "F=P\\,A=(1+R)\\dfrac{I A}{c},\\qquad a=\\dfrac{F}{m}",
              d: "Pressure over an area is a force; force over a mass is an acceleration. The bridge from absorbed light to travel." },
            { c: V.vio, t: "Coherence field tie-in",
              tex: "|C(x)|=A(x)=\\sqrt{(1-R)\\,e^{-\\alpha x}}",
              d: "The local coherence amplitude follows the square root of intensity, so the field glow dims with the same depth law that builds the pressure." },
            { c: V.gold, t: "Net surface pressure",
              tex: "P_{\\text{surf}}=\\bigl[(1-R)+2R\\bigr]\\dfrac{I_0}{c}",
              d: "The whole push on the surface: the absorbed share counted once and the reflected share counted twice, drawn from the T + R + A budget." },
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
        <SectionHead n="IV" title="THE CHAIN -- ABSORPTION TO PRESSURE TO MOTION" col={V.aurora} />
        <div style={{ fontFamily: SERIF, fontSize: "0.92rem", color: "rgba(184,204,232,0.7)",
          lineHeight: 1.55, marginBottom: 12, maxWidth: 820 }}>
          The mechanism reads as one pass: split the light at the surface, decay it through depth,
          deposit its momentum where it is absorbed, and read the surface push out as a force. The
          same line of code that warms tissue drives a sail.
        </div>
        <pre style={{ fontFamily: MONO, fontSize: "0.78rem", color: V.aurora, lineHeight: 1.55,
          background: "#070A12", border: `1px solid ${V.aurora}30`, borderRadius: 8,
          padding: "16px 18px", overflowX: "auto", margin: 0 }}>{PSEUDOCODE}</pre>
      </div>

      {/* V — verbal */}
      <div style={{ marginBottom: 42 }}>
        <SectionHead n="V" title="DEFINED VERBALLY -- TRAVEL & PERSONAL HEALTH" col={V.vio} />
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
          {[
            { c: V.amb, t: "Absorption is a transaction",
              b: "A medium does not just dim light -- it buys the light's momentum. Every absorbed photon pays a tiny push, and the bill comes due as pressure. The deeper and faster the medium absorbs, the more concentrated that pressure becomes near the surface. Absorption and pressure are two readings of one event." },
            { c: V.blue, t: "Depth is wavelength's choice",
              b: "Penetration depth is why a red laser reaches deep into tissue while blue stops at the skin. The same beam, the same body, but a different delta for each colour. Choosing the wavelength is choosing where the pressure -- and the warmth, and the signal -- is deposited. This is the lever behind every light-based therapy." },
            { c: V.rose, t: "The floor and the ceiling of push",
              b: "A black surface takes a photon's momentum once; a mirror takes it twice. So absorption sets the minimum thrust and reflection sets the maximum, with real materials living in between. To push hardest, reflect; to heat or signal, absorb. The single dial of reflectivity moves you along that whole range." },
            { c: V.aurora, t: "Light as a way to travel",
              b: "If pressure is force over area and force makes acceleration, then a large, light, reflective sail can be driven by nothing but a beam. No fuel rides along -- the momentum arrives at the speed of light. This is the same bridge from field to motion the inertial-propulsion work already builds, now sourced directly from photons." },
            { c: V.green, t: "Light as personal health",
              b: "The body is an absorbing medium. Sunlight on skin is a real, gentle radiation pressure and a real deposition of energy at a depth set by wavelength. Understanding T + R + A and penetration depth turns vague light exposure into a tunable dose: how much enters, how deep it reaches, how much is reflected away." },
            { c: V.gold, t: "Only proven equations",
              b: "Nothing here is invented for the page. Conservation across a substrate, Beer-Lambert decay, penetration depth, photon momentum, and the coherence field all already live inside AETHER. The only new step is composing them into one chain -- absorption, to pressure, to motion -- so light, travel, and health read as a single mechanism." },
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
        <a href="/electron-field" style={{ fontFamily: MONO, fontSize: 8, color: V.aurora, textDecoration: "none" }}>
          &lt;-- UNBREAKABLE PULSING ELECTRON FIELD -- T + R + A = 1
        </a>
        <div style={{ fontFamily: MONO, fontSize: 8, color: V.dim, textAlign: "right" }}>
          <div>Light Under Absorption Pressures -- Travel &times; Health</div>
          <div>P = (1 + R) I / c -- the net is there</div>
        </div>
      </div>
    </div>
  );
}
