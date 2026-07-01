import { useEffect, useRef, type ReactNode } from "react";
import { Link } from "wouter";

const C = {
  bg: "#05060C",
  panel: "#0b0e18",
  panel2: "#0e1224",
  border: "#1a2340",
  text: "#b8cce8",
  muted: "#5a708c",
  violet: "#a86bff",
  gold: "#ffb347",
  blue: "#4aa8ff",
};

const FACTS = [
  { k: "Mineral", v: "Quartz · SiO₂" },
  { k: "Pure form", v: "Colorless (rock crystal)" },
  { k: "Crystal system", v: "Trigonal · hexagonal habit" },
  { k: "Refractive index", v: "1.544 – 1.553" },
  { k: "Mohs hardness", v: "7" },
  { k: "Chromophore", v: "Iron (Fe³⁺ / Fe⁴⁺) + defects" },
  { k: "Violet (amethyst)", v: "Fe + natural γ-irradiation" },
  { k: "Gold-red (citrine)", v: "Amethyst heated ~470 °C" },
];

const MATH = [
  { eq: "I(λ) = I₀(λ) · e^(−α(λ)·c·d)", note: "Beer–Lambert law. The iron color centers absorb selected wavelengths; c is the Fe concentration and d the path length through the crystal. What is NOT absorbed is the color you see." },
  { eq: "n(λ) = A + B/λ²   (A ≈ 1.54)", note: "Cauchy dispersion. Quartz bends violet more than red, fanning white light into a spectrum — the reds, blues, and violets separate as they pass through." },
  { eq: "ΔE = Δ_o = h c / λ_abs", note: "Crystal-field splitting. Iron's 3d orbitals split by an energy Δ set by the SiO₄ cage; a photon whose energy matches Δ is absorbed, removing that wavelength from the transmitted beam." },
  { eq: "[FeO₄]⁴⁻ hole center:  Fe³⁺ + γ → Fe⁴⁺ + e⁻", note: "Amethyst. Natural gamma radiation knocks an electron off a substitutional Fe³⁺, leaving a hole color center that absorbs ~545 nm (green-yellow) and transmits violet." },
  { eq: "k = A · e^(−Ea/RT)   (Arrhenius)", note: "Heat conversion. Warming amethyst past ~470 °C thermally erases the Fe⁴⁺ hole centers; the iron re-disperses as fine Fe³⁺, and the stone turns to golden-red citrine. Hotter still (~750 °C) clears it entirely." },
  { eq: "I_scatter ∝ 1 / λ⁴   (Rayleigh)", note: "Blue quartz. When the color is not from absorption but from sub-micron mineral inclusions, short blue wavelengths scatter far more than red — the same reason the sky is blue." },
];

const VERBAL = [
  { t: "Pure quartz is colorless", d: "Perfect SiO₂ is transparent across the whole visible band — rock crystal. Every color in quartz is a defect: a trace of iron, a missing electron, a radiation scar, or a foreign inclusion. The purity is the blank canvas; the impurity is the pigment." },
  { t: "Iron is the master chromophore", d: "A few atoms of iron per million of silicon do all the work. As Fe³⁺ it leans gold; kicked to Fe⁴⁺ by natural radiation it becomes the violet hole center of amethyst. The SAME element paints both the reds and the violets — only its charge state and its radiation history differ." },
  { t: "Heat is a color switch", d: "Amethyst and citrine are the same stone at different temperatures. Below ~470 °C the violet Fe⁴⁺ centers are stable; heat past that threshold and they collapse into golden Fe³⁺ (citrine); push past ~750 °C and even that fades to clear. Not enough heat, no conversion — the change needs to cross an activation barrier." },
  { t: "Blue is a different mechanism", d: "Most blue quartz is honest scattering, not absorption. Clouds of sub-micron inclusions (dumortierite, tourmaline, ilmenite) scatter blue light out sideways by the 1/λ⁴ Rayleigh law. Turn the crystal and the blue shifts — a sign the color lives in the cloud, not in a chemical bond." },
  { t: "Conglomerations", d: "Quartz rarely grows as one clean crystal. In a gas cavity it nucleates all along the wall and grows inward as a drusy carpet of thousands of small crystals — a geode. Banded agate is the same story in microcrystalline form: layer upon layer of silica, each band tinted by whatever iron the hydrothermal fluid carried that season." },
  { t: "Reading light as history", d: "The color of a quartz is a written record: how much iron entered the melt, how much radiation the ground delivered over millions of years, and how hot the rock later became. Light passing through the stone is decoded geology — coherence carrying the memory of the crystal." },
];

function hexA(h: string, a: number) {
  const n = h.replace("#", "");
  return `rgba(${parseInt(n.slice(0, 2), 16)},${parseInt(n.slice(2, 4), 16)},${parseInt(n.slice(4, 6), 16)},${a})`;
}

function fitCanvas(cv: HTMLCanvasElement, ctx: CanvasRenderingContext2D) {
  const dpr = Math.min(2, window.devicePixelRatio || 1);
  const w = cv.clientWidth || 600;
  const h = cv.clientHeight || 300;
  cv.width = Math.round(w * dpr);
  cv.height = Math.round(h * dpr);
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  return { w, h };
}

function waveRGB(wl: number): [number, number, number] {
  let r = 0, g = 0, b = 0;
  if (wl >= 380 && wl < 440) { r = -(wl - 440) / (440 - 380); b = 1; }
  else if (wl < 490) { g = (wl - 440) / (490 - 440); b = 1; }
  else if (wl < 510) { g = 1; b = -(wl - 510) / (510 - 490); }
  else if (wl < 580) { r = (wl - 510) / (580 - 510); g = 1; }
  else if (wl < 645) { r = 1; g = -(wl - 645) / (645 - 580); }
  else if (wl <= 780) { r = 1; }
  let f = 1;
  if (wl > 700) f = 0.3 + 0.7 * (780 - wl) / (780 - 700);
  else if (wl < 420) f = 0.3 + 0.7 * (wl - 380) / (420 - 380);
  const ch = (x: number) => Math.round(255 * Math.pow(Math.max(0, x) * f, 0.8));
  return [ch(r), ch(g), ch(b)];
}

function absorbTransmission(wl: number, fe: number, temp: number): number {
  if (fe < 0.05) return 1;
  const gauss = (c: number, wid: number, depth: number) =>
    1 - depth * Math.exp(-((wl - c) * (wl - c)) / (2 * wid * wid));
  if (temp >= 750) return 1 - 0.05 * fe;
  if (temp >= 470) {
    // citrine — absorb violet/blue, transmit gold-red
    return Math.max(0, gauss(445, 70, 0.95 * fe));
  }
  // amethyst — absorb green-yellow, transmit violet (+ some red)
  return Math.max(0, gauss(548, 55, 0.95 * fe));
}

function gemInfo(fe: number, temp: number, inc: number) {
  if (inc > 0.55 && fe < 0.4) return { name: "Blue Quartz", cause: "Rayleigh scattering from sub-micron inclusions" };
  if (fe < 0.05) return { name: "Rock Crystal (clear)", cause: "no iron · no color centers" };
  if (temp >= 750) return { name: "Heat-cleared Quartz", cause: "centers annealed out above ~750 °C" };
  if (temp >= 470) return { name: "Citrine", cause: "Fe³⁺ · absorbs violet-blue, transmits gold-red" };
  return { name: "Amethyst", cause: "[FeO₄] hole centers · absorbs green, transmits violet" };
}

/* ── Canvas 1 · Light through quartz ── */
function QuartzPrismCanvas() {
  const cvRef = useRef<HTMLCanvasElement | null>(null);
  const feRef = useRef(0.7);
  const tempRef = useRef(20);
  const incRef = useRef(0.15);
  const nameOut = useRef<HTMLSpanElement | null>(null);
  const causeOut = useRef<HTMLSpanElement | null>(null);
  const bandOut = useRef<HTMLSpanElement | null>(null);

  useEffect(() => {
    const cv = cvRef.current;
    if (!cv) return;
    const ctx = cv.getContext("2d");
    if (!ctx) return;
    let raf = 0;
    let t = 0;

    const loop = () => {
      const { w, h } = fitCanvas(cv, ctx);
      ctx.clearRect(0, 0, w, h);
      ctx.fillStyle = "#04050b";
      ctx.fillRect(0, 0, w, h);
      t += 0.016;

      const fe = feRef.current;
      const temp = tempRef.current;
      const inc = incRef.current;

      const cx = w * 0.5;
      const cy = h * 0.52;
      const R = Math.min(w, h) * 0.24;

      // incoming white beam
      const inY = cy;
      const grd = ctx.createLinearGradient(0, 0, cx - R, 0);
      grd.addColorStop(0, "rgba(255,255,255,0)");
      grd.addColorStop(1, "rgba(255,255,255,0.85)");
      ctx.strokeStyle = grd;
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(0, inY);
      ctx.lineTo(cx - R, inY);
      ctx.stroke();

      // hexagonal quartz crystal
      ctx.save();
      ctx.translate(cx, cy);
      ctx.beginPath();
      for (let i = 0; i < 6; i++) {
        const a = (Math.PI / 3) * i - Math.PI / 6 + Math.sin(t * 0.2) * 0.02;
        const x = Math.cos(a) * R;
        const y = Math.sin(a) * R * 1.15;
        if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
      }
      ctx.closePath();
      const gem = gemInfo(fe, temp, inc);
      let bodyRGB: [number, number, number] = [230, 235, 245];
      // integrate transmitted color
      let sr = 0, sg = 0, sb = 0, sw = 0;
      for (let wl = 400; wl <= 700; wl += 6) {
        const tr = absorbTransmission(wl, fe, temp);
        const [r, g, b] = waveRGB(wl);
        sr += r * tr; sg += g * tr; sb += b * tr; sw += 1;
      }
      if (sw > 0) {
        bodyRGB = [sr / sw, sg / sw, sb / sw];
        const mx = Math.max(bodyRGB[0], bodyRGB[1], bodyRGB[2], 1);
        const boost = 210 / mx;
        bodyRGB = [bodyRGB[0] * boost, bodyRGB[1] * boost, bodyRGB[2] * boost];
      }
      // scattering adds blue veil
      const scB = inc * 120;
      bodyRGB = [bodyRGB[0] * (1 - inc * 0.4), bodyRGB[1] * (1 - inc * 0.2) + inc * 40, bodyRGB[2] * (1 - inc * 0.2) + scB];
      const bodyCss = `rgb(${Math.round(bodyRGB[0])},${Math.round(bodyRGB[1])},${Math.round(bodyRGB[2])})`;
      const fill = ctx.createLinearGradient(-R, -R, R, R);
      fill.addColorStop(0, hexA("#ffffff", 0.10));
      fill.addColorStop(0.5, bodyCss);
      fill.addColorStop(1, hexA("#000000", 0.25));
      ctx.fillStyle = fill;
      ctx.shadowColor = bodyCss;
      ctx.shadowBlur = 30;
      ctx.fill();
      ctx.shadowBlur = 0;
      ctx.strokeStyle = hexA("#ffffff", 0.35);
      ctx.lineWidth = 1.2;
      ctx.stroke();
      // inner facet lines
      ctx.strokeStyle = hexA("#ffffff", 0.12);
      ctx.beginPath();
      ctx.moveTo(-R * 0.5, -R); ctx.lineTo(-R * 0.5, R);
      ctx.moveTo(R * 0.5, -R); ctx.lineTo(R * 0.5, R);
      ctx.stroke();
      ctx.restore();

      // dispersed exit fan
      const lambdas = [410, 440, 470, 500, 540, 580, 620, 660, 690];
      lambdas.forEach((wl, i) => {
        const tr = absorbTransmission(wl, fe, temp);
        const spread = (i - (lambdas.length - 1) / 2) * 0.05;
        const [r, g, b] = waveRGB(wl);
        const alpha = 0.15 + 0.75 * tr;
        ctx.strokeStyle = `rgba(${r},${g},${b},${alpha})`;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(cx + R * 0.4, cy);
        ctx.lineTo(w, cy + (w - cx) * spread);
        ctx.stroke();
      });

      // resultant swatch
      ctx.fillStyle = bodyCss;
      ctx.shadowColor = bodyCss;
      ctx.shadowBlur = 24;
      ctx.beginPath();
      ctx.arc(w - 34, h - 34, 20, 0, Math.PI * 2);
      ctx.fill();
      ctx.shadowBlur = 0;
      ctx.strokeStyle = hexA("#ffffff", 0.4);
      ctx.stroke();

      if (nameOut.current) nameOut.current.textContent = gem.name;
      if (causeOut.current) causeOut.current.textContent = gem.cause;
      const band = temp >= 750 || fe < 0.05 ? "none (clear)" : temp >= 470 ? "≈ 445 nm (violet-blue)" : "≈ 548 nm (green-yellow)";
      if (bandOut.current) bandOut.current.textContent = band;

      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, []);

  return (
    <div>
      <canvas ref={cvRef} style={{ width: "100%", height: 320, display: "block", borderRadius: 10, border: `1px solid ${C.border}` }} />
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(150px,1fr))", gap: 10, marginTop: 12 }}>
        <Slider label="Iron content (Fe)" min={0} max={1} step={0.01} def={0.7} onChange={(v) => (feRef.current = v)} />
        <Slider label="Temperature °C" min={20} max={900} step={1} def={20} onChange={(v) => (tempRef.current = v)} />
        <Slider label="Inclusion scattering" min={0} max={1} step={0.01} def={0.15} onChange={(v) => (incRef.current = v)} />
      </div>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 16, marginTop: 12 }}>
        <Readout label="Variety" refEl={nameOut} accent={C.violet} />
        <Readout label="Absorbed band" refEl={bandOut} accent={C.gold} />
        <Readout label="Mechanism" refEl={causeOut} accent={C.blue} wide />
      </div>
    </div>
  );
}

/* ── Canvas 2 · Color-center thermodynamics ── */
function ColorCenterCanvas() {
  const cvRef = useRef<HTMLCanvasElement | null>(null);
  const tempRef = useRef(20);
  const stateOut = useRef<HTMLSpanElement | null>(null);

  useEffect(() => {
    const cv = cvRef.current;
    if (!cv) return;
    const ctx = cv.getContext("2d");
    if (!ctx) return;
    let raf = 0;

    const survive = (T: number) => 1 / (1 + Math.exp((T - 470) / 40));
    const citrine = (T: number) => {
      const on = 1 / (1 + Math.exp(-(T - 470) / 40));
      const off = 1 / (1 + Math.exp((T - 750) / 45));
      return on * off;
    };

    const loop = () => {
      const { w, h } = fitCanvas(cv, ctx);
      ctx.clearRect(0, 0, w, h);
      ctx.fillStyle = "#04050b";
      ctx.fillRect(0, 0, w, h);
      const padL = 46, padR = 16, padT = 18, padB = 34;
      const gw = w - padL - padR, gh = h - padT - padB;
      const X = (T: number) => padL + ((T - 20) / (900 - 20)) * gw;
      const Y = (v: number) => padT + (1 - v) * gh;

      // axes
      ctx.strokeStyle = hexA(C.border, 1);
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(padL, padT); ctx.lineTo(padL, padT + gh); ctx.lineTo(padL + gw, padT + gh);
      ctx.stroke();
      ctx.fillStyle = C.muted;
      ctx.font = "10px monospace";
      [20, 470, 750, 900].forEach((T) => {
        ctx.fillText(`${T}`, X(T) - 8, padT + gh + 16);
      });

      // threshold markers
      [{ T: 470, c: C.gold, l: "citrine 470°C" }, { T: 750, c: "#7fd8ff", l: "clear 750°C" }].forEach((m) => {
        ctx.strokeStyle = hexA(m.c, 0.5);
        ctx.setLineDash([4, 4]);
        ctx.beginPath();
        ctx.moveTo(X(m.T), padT); ctx.lineTo(X(m.T), padT + gh);
        ctx.stroke();
        ctx.setLineDash([]);
        ctx.fillStyle = m.c;
        ctx.fillText(m.l, X(m.T) - 24, padT + 10);
      });

      // amethyst survival curve (violet)
      ctx.strokeStyle = C.violet;
      ctx.lineWidth = 2;
      ctx.beginPath();
      for (let T = 20; T <= 900; T += 4) {
        const x = X(T), y = Y(survive(T));
        if (T === 20) ctx.moveTo(x, y); else ctx.lineTo(x, y);
      }
      ctx.stroke();
      // citrine curve (gold)
      ctx.strokeStyle = C.gold;
      ctx.beginPath();
      for (let T = 20; T <= 900; T += 4) {
        const x = X(T), y = Y(citrine(T));
        if (T === 20) ctx.moveTo(x, y); else ctx.lineTo(x, y);
      }
      ctx.stroke();

      // cursor
      const T = tempRef.current;
      ctx.strokeStyle = hexA("#ffffff", 0.5);
      ctx.beginPath();
      ctx.moveTo(X(T), padT); ctx.lineTo(X(T), padT + gh);
      ctx.stroke();
      const s = survive(T), c = citrine(T);
      [{ v: s, col: C.violet }, { v: c, col: C.gold }].forEach((p) => {
        ctx.fillStyle = p.col;
        ctx.beginPath();
        ctx.arc(X(T), Y(p.v), 4, 0, Math.PI * 2);
        ctx.fill();
      });

      if (stateOut.current) {
        const st = T >= 750 ? "colorless (annealed)" : T >= 470 ? "citrine (gold-red)" : "amethyst (violet)";
        stateOut.current.textContent = `${T.toFixed(0)} °C · ${st}`;
      }
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, []);

  return (
    <div>
      <canvas ref={cvRef} style={{ width: "100%", height: 260, display: "block", borderRadius: 10, border: `1px solid ${C.border}` }} />
      <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: 10, marginTop: 12 }}>
        <Slider label="Temperature °C" min={20} max={900} step={1} def={20} onChange={(v) => (tempRef.current = v)} />
      </div>
      <div style={{ marginTop: 12 }}>
        <Readout label="Color state" refEl={stateOut} accent={C.violet} wide />
      </div>
    </div>
  );
}

/* ── Canvas 3 · Conglomeration / geode growth ── */
function ConglomerationCanvas() {
  const cvRef = useRef<HTMLCanvasElement | null>(null);
  const feRef = useRef(0.6);
  const rateRef = useRef(0.5);
  const countOut = useRef<HTMLSpanElement | null>(null);

  useEffect(() => {
    const cv = cvRef.current;
    if (!cv) return;
    const ctx = cv.getContext("2d");
    if (!ctx) return;
    let raf = 0;
    type Cry = { a: number; len: number; max: number; wl: number; wid: number };
    let crystals: Cry[] = [];
    let seeded = false;

    const loop = () => {
      const { w, h } = fitCanvas(cv, ctx);
      ctx.clearRect(0, 0, w, h);
      ctx.fillStyle = "#04050b";
      ctx.fillRect(0, 0, w, h);

      const cx = w * 0.5, cy = h * 0.5;
      const rimR = Math.min(w, h) * 0.42;
      const fe = feRef.current;
      const rate = rateRef.current;

      if (!seeded) {
        crystals = [];
        const n = 120;
        for (let i = 0; i < n; i++) {
          const a = (i / n) * Math.PI * 2 + (Math.random() - 0.5) * 0.08;
          const max = rimR * (0.35 + Math.random() * 0.5);
          // Fe banding by angle → violet/gold mix
          const band = 0.5 + 0.5 * Math.sin(a * 3 + fe * 4);
          const wl = 415 + band * (fe > 0.5 ? 60 : 160);
          crystals.push({ a, len: 0, max, wl, wid: 2 + Math.random() * 3 });
        }
        seeded = true;
      }

      // outer rock rim (agate banding)
      for (let b = 0; b < 5; b++) {
        ctx.beginPath();
        ctx.arc(cx, cy, rimR + b * 5, 0, Math.PI * 2);
        ctx.strokeStyle = hexA(b % 2 === 0 ? "#6b5138" : "#8a6a44", 0.5);
        ctx.lineWidth = 4;
        ctx.stroke();
      }

      let grown = 0;
      crystals.forEach((cr) => {
        if (cr.len < cr.max) cr.len += rate * 0.9;
        if (cr.len >= cr.max) grown++;
        const [r, g, bl] = waveRGB(cr.wl);
        const x0 = cx + Math.cos(cr.a) * rimR;
        const y0 = cy + Math.sin(cr.a) * rimR;
        const x1 = cx + Math.cos(cr.a) * (rimR - cr.len);
        const y1 = cy + Math.sin(cr.a) * (rimR - cr.len);
        ctx.strokeStyle = `rgba(${r},${g},${bl},0.85)`;
        ctx.lineWidth = cr.wid;
        ctx.beginPath();
        ctx.moveTo(x0, y0);
        ctx.lineTo(x1, y1);
        ctx.stroke();
        // crystal tip
        ctx.fillStyle = `rgba(${r},${g},${bl},0.9)`;
        ctx.beginPath();
        ctx.arc(x1, y1, cr.wid * 0.7, 0, Math.PI * 2);
        ctx.fill();
      });

      // hollow center glow
      const gc = ctx.createRadialGradient(cx, cy, 0, cx, cy, rimR * 0.3);
      gc.addColorStop(0, hexA("#04050b", 0.9));
      gc.addColorStop(1, hexA("#04050b", 0));
      ctx.fillStyle = gc;
      ctx.beginPath();
      ctx.arc(cx, cy, rimR * 0.3, 0, Math.PI * 2);
      ctx.fill();

      if (grown >= crystals.length && crystals.length > 0) {
        // regrow slowly for a living loop
        if (Math.random() < 0.01) seeded = false;
      }
      if (countOut.current) countOut.current.textContent = `${crystals.length} crystals · ${grown} mature`;

      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, []);

  return (
    <div>
      <canvas ref={cvRef} style={{ width: "100%", height: 320, display: "block", borderRadius: 10, border: `1px solid ${C.border}` }} />
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(150px,1fr))", gap: 10, marginTop: 12 }}>
        <Slider label="Iron in fluid" min={0} max={1} step={0.01} def={0.6} onChange={(v) => (feRef.current = v)} />
        <Slider label="Growth rate" min={0.1} max={2} step={0.05} def={0.5} onChange={(v) => (rateRef.current = v)} />
      </div>
      <div style={{ marginTop: 12 }}>
        <Readout label="Aggregate" refEl={countOut} accent={C.gold} wide />
      </div>
    </div>
  );
}

/* ── small UI helpers ── */
function Slider({ label, min, max, step, def, onChange }: { label: string; min: number; max: number; step: number; def: number; onChange: (v: number) => void }) {
  const valRef = useRef<HTMLSpanElement | null>(null);
  return (
    <label style={{ display: "block", fontFamily: "monospace", fontSize: 11, color: C.muted }}>
      <span style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
        <span>{label}</span>
        <span ref={valRef} style={{ color: C.text }}>{def}</span>
      </span>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        defaultValue={def}
        onChange={(e) => {
          const v = parseFloat(e.target.value);
          onChange(v);
          if (valRef.current) valRef.current.textContent = String(v);
        }}
        style={{ width: "100%", accentColor: C.violet }}
      />
    </label>
  );
}

function Readout({ label, refEl, accent, wide }: { label: string; refEl: React.RefObject<HTMLSpanElement | null>; accent: string; wide?: boolean }) {
  return (
    <div style={{ flex: wide ? "1 1 260px" : "0 0 auto" }}>
      <div style={{ fontFamily: "monospace", fontSize: 10, color: C.muted, textTransform: "uppercase", letterSpacing: 1 }}>{label}</div>
      <span ref={refEl} style={{ fontFamily: "monospace", fontSize: 14, color: accent }}>—</span>
    </div>
  );
}

function Section({ n, title, sub, children }: { n: string; title: string; sub?: string; children: ReactNode }) {
  return (
    <section style={{ marginBottom: 34 }}>
      <div style={{ display: "flex", alignItems: "baseline", gap: 12, marginBottom: 6 }}>
        <span style={{ fontFamily: "monospace", fontSize: 12, color: C.violet }}>{n}</span>
        <h2 style={{ margin: 0, fontSize: 20, color: C.text, fontWeight: 600 }}>{title}</h2>
      </div>
      {sub && <p style={{ margin: "0 0 14px", color: C.muted, fontSize: 13, lineHeight: 1.6, maxWidth: 760 }}>{sub}</p>}
      <div style={{ background: C.panel, border: `1px solid ${C.border}`, borderRadius: 12, padding: 18 }}>{children}</div>
    </section>
  );
}

export default function QuartzColorPage() {
  return (
    <div style={{ minHeight: "100vh", background: C.bg, color: C.text, padding: "40px 22px 80px", fontFamily: "'Inter',system-ui,sans-serif" }}>
      <div style={{ maxWidth: 900, margin: "0 auto" }}>
        <div style={{ marginBottom: 8, fontFamily: "monospace", fontSize: 11, color: C.muted, letterSpacing: 2, textTransform: "uppercase" }}>
          AETHER · Substrate · Mineral Optics
        </div>
        <h1 style={{ fontSize: 34, margin: "0 0 10px", fontWeight: 700, background: `linear-gradient(90deg,${C.violet},${C.blue},${C.gold})`, WebkitBackgroundClip: "text", backgroundClip: "text", color: "transparent" }}>
          Quartz Color · Iron, Light &amp; Heat
        </h1>
        <p style={{ color: C.muted, fontSize: 15, lineHeight: 1.7, maxWidth: 760, margin: "0 0 30px" }}>
          Reds, blues, and violets passing through quartz. Pure silica is colorless — every hue is a story written by trace iron, natural radiation, temperature, and mineral inclusions. Here light is decoded geology: absorption paints the violets and golds, scattering paints the blues, and heat rewrites the whole palette.
        </p>
        <p style={{ color: hexA(C.gold, 0.85), fontSize: 12, lineHeight: 1.6, maxWidth: 760, margin: "0 0 30px", fontStyle: "italic" }}>
          Note · the absorption bands and temperature thresholds below are pedagogical approximations chosen to make the mechanisms legible, not lab-calibrated spectra.
        </p>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(180px,1fr))", gap: 10, marginBottom: 34 }}>
          {FACTS.map((f) => (
            <div key={f.k} style={{ background: C.panel2, border: `1px solid ${C.border}`, borderRadius: 10, padding: "10px 12px" }}>
              <div style={{ fontFamily: "monospace", fontSize: 10, color: C.muted, textTransform: "uppercase", letterSpacing: 1 }}>{f.k}</div>
              <div style={{ fontSize: 14, color: C.text, marginTop: 2 }}>{f.v}</div>
            </div>
          ))}
        </div>

        <Section n="I" title="Light through quartz" sub="White light disperses inside the crystal; iron color centers absorb a band and heat switches which band. Drag iron, temperature, and inclusion scattering to move between amethyst violet, citrine gold-red, blue quartz, and clear rock crystal.">
          <QuartzPrismCanvas />
        </Section>

        <Section n="II" title="Color-center thermodynamics" sub="The violet Fe⁴⁺ hole centers of amethyst survive only below a threshold. Heat past ~470 °C converts them to golden citrine; past ~750 °C the color anneals away entirely. Not enough heat, no conversion — the change must cross an activation barrier.">
          <ColorCenterCanvas />
        </Section>

        <Section n="III" title="Conglomerations · geode growth" sub="Quartz rarely grows as a single crystal. In a rock cavity it nucleates all along the wall and grows inward as a drusy carpet of thousands of small crystals — a geode — each banded by the iron the hydrothermal fluid carried.">
          <ConglomerationCanvas />
        </Section>

        <Section n="IV" title="The mathematics">
          <div style={{ display: "grid", gap: 12 }}>
            {MATH.map((m, i) => (
              <div key={i} style={{ background: C.panel2, border: `1px solid ${C.border}`, borderRadius: 10, padding: "12px 14px" }}>
                <div style={{ fontFamily: "monospace", fontSize: 15, color: C.gold, marginBottom: 6 }}>{m.eq}</div>
                <div style={{ fontSize: 13, color: C.muted, lineHeight: 1.6 }}>{m.note}</div>
              </div>
            ))}
          </div>
        </Section>

        <Section n="V" title="In words">
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(240px,1fr))", gap: 12 }}>
            {VERBAL.map((v, i) => (
              <div key={i} style={{ background: C.panel2, border: `1px solid ${C.border}`, borderRadius: 10, padding: "14px 16px" }}>
                <div style={{ fontSize: 14, color: C.violet, fontWeight: 600, marginBottom: 6 }}>{v.t}</div>
                <div style={{ fontSize: 13, color: C.muted, lineHeight: 1.65 }}>{v.d}</div>
              </div>
            ))}
          </div>
        </Section>

        <div style={{ display: "flex", flexWrap: "wrap", gap: 14, marginTop: 20, paddingTop: 20, borderTop: `1px solid ${C.border}` }}>
          <Link href="/periodic-table" style={{ color: C.blue, textDecoration: "none", fontFamily: "monospace", fontSize: 13 }}>← Periodic Table</Link>
          <Link href="/light-forces" style={{ color: C.blue, textDecoration: "none", fontFamily: "monospace", fontSize: 13 }}>Light · Forces →</Link>
          <Link href="/liquid-density" style={{ color: C.blue, textDecoration: "none", fontFamily: "monospace", fontSize: 13 }}>Substrate Materials →</Link>
        </div>
      </div>
    </div>
  );
}
