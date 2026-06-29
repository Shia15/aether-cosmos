import { useEffect, useRef, useState } from "react";
import katex from "katex";
import "katex/dist/katex.min.css";

const V = {
  bg: "#08060A", aurora: "#00FFB2", gold: "#E0A83C", honey: "#FFB42E",
  rasp: "#E8326B", lemon: "#F4D03F", lime: "#7BD64A", blue: "#4488FF",
  vio: "#9966FF", amb: "#FF9933", rose: "#FF6699", green: "#44CC77",
  dim: "#5A4A52", ink: "#EAD8DE", plum: "#7A2848",
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

// ── shared food-science models (heuristic engineering estimates for prototyping) ──
const TW = -137, TH = -40, TF = 60; // glass-transition refs (degC): water, honey solids, fruit solids
const STORE_DEFAULT = 22;

function tgMix(moisturePct: number, honeyFrac: number, fiberBoost: number) {
  const ww = moisturePct / 100;
  const dry = 1 - ww;
  const wh = dry * honeyFrac;
  const wf = dry * (1 - honeyFrac);
  const tf = TF + fiberBoost * 30; // added fibre / fruit solids raise the matrix Tg
  return (ww * TW + wh * TH + wf * tf) / (ww + wh + wf);
}

function waterActivity(moisturePct: number, honeyFrac: number) {
  const m = moisturePct;
  const base = m / (m + 8);
  const humectant = 0.16 * honeyFrac * (m / (m + 22));
  return Math.max(0, Math.min(0.98, base + humectant));
}

function textureState(tg: number, aw: number, store: number) {
  const margin = tg - store;
  if (margin > 10 && aw < 0.3) return { s: "CRUNCHY / GLASSY", c: V.lime };
  if (margin > 0 && aw < 0.42) return { s: "CRISP / FRAGILE", c: V.aurora };
  if (margin > -15 && aw < 0.58) return { s: "LEATHERY / CHEWY", c: V.gold };
  return { s: "STICKY / SOFT", c: V.rose };
}

function shelfMonths(aw: number, desiccant: boolean) {
  const base = 13 * Math.exp(-(aw - 0.18) / 0.13);
  return Math.max(0.3, base * (desiccant ? 1.7 : 1));
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

// ── SIM 1 — Drying kinetics: moisture falls, the chip vitrifies into a crisp ──────
function DryingCanvas() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const tempRef = useRef(60);     // drying temp degC
  const thickRef = useRef(2.5);   // spread thickness mm
  const honeyRef = useRef(15);    // honey % of total solids
  const tgtRef = useRef(3.5);     // target final moisture %

  const [temp, setTemp] = useState(60);
  const [thick, setThick] = useState(2.5);
  const [honey, setHoney] = useState(15);
  const [tgt, setTgt] = useState(3.5);

  const mR = useRef<HTMLSpanElement | null>(null);
  const tR = useRef<HTMLSpanElement | null>(null);
  const aR = useRef<HTMLSpanElement | null>(null);
  const sR = useRef<HTMLSpanElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    let dim = fitCanvas(canvas, 360);
    const onResize = () => { dim = fitCanvas(canvas, 360); };
    window.addEventListener("resize", onResize);
    const reduce = prefersReduced();

    const M0 = 80, Meq = 1.5; // start (compote) and floor (fully dried) moisture %
    let raf = 0, t = 0; // t in simulated hours, loops

    const draw = () => {
      const ctx = canvas.getContext("2d");
      if (!ctx) { raf = requestAnimationFrame(draw); return; }
      const w = dim.w, h = dim.h;
      const temp = tempRef.current, thick = thickRef.current;
      const honeyF = honeyRef.current / 100, target = tgtRef.current;

      // drying rate constant: hotter + thinner dries faster; honey slows water release
      const k = (temp / 60) * (2.5 / thick) * (1 - 0.25 * honeyF) * 0.42;
      const tEnd = Math.max(0.05, -Math.log((target - Meq) / (M0 - Meq)) / k);

      if (!reduce) t += tEnd / 240; // sweep the full dry in ~4s, then loop
      if (t > tEnd * 1.18) t = 0;
      const tShow = Math.min(t, tEnd);
      const M = Meq + (M0 - Meq) * Math.exp(-k * tShow);
      const aw = waterActivity(M, honeyF);
      const tg = tgMix(M, honeyF, 0);
      const tex = textureState(tg, aw, STORE_DEFAULT);

      ctx.clearRect(0, 0, w, h);
      ctx.fillStyle = "#08060A"; ctx.fillRect(0, 0, w, h);

      // ── left: drying curve M(t)
      const padL = 44, padR = 14, padT = 22, padB = 34;
      const gx = padL, gy = padT, gw = w * 0.52 - padL - padR, gh = h - padT - padB;
      ctx.strokeStyle = `${V.dim}88`; ctx.lineWidth = 1;
      ctx.strokeRect(gx, gy, gw, gh);
      ctx.font = `8px ${MONO}`; ctx.fillStyle = V.dim;
      ctx.fillText("MOISTURE %", gx, gy - 7);
      ctx.fillText("DRYING TIME (h)", gx + gw - 70, gy + gh + 20);
      const X = (tt: number) => gx + (tt / (tEnd * 1.05)) * gw;
      const Y = (mm: number) => gy + gh - (mm / M0) * gh;
      // target line
      ctx.strokeStyle = `${V.lime}66`; ctx.setLineDash([4, 4]);
      ctx.beginPath(); ctx.moveTo(gx, Y(target)); ctx.lineTo(gx + gw, Y(target)); ctx.stroke();
      ctx.setLineDash([]);
      ctx.fillStyle = V.lime; ctx.fillText(`target ${target.toFixed(1)}%`, gx + gw - 78, Y(target) - 4);
      // curve
      ctx.strokeStyle = V.honey; ctx.lineWidth = 2; ctx.beginPath();
      for (let i = 0; i <= 120; i++) {
        const tt = (i / 120) * tEnd * 1.05;
        const mm = Meq + (M0 - Meq) * Math.exp(-k * tt);
        if (i === 0) ctx.moveTo(X(tt), Y(mm)); else ctx.lineTo(X(tt), Y(mm));
      }
      ctx.stroke();
      // moving cursor
      ctx.fillStyle = tex.c; ctx.shadowBlur = 10; ctx.shadowColor = tex.c;
      ctx.beginPath(); ctx.arc(X(tShow), Y(M), 4, 0, Math.PI * 2); ctx.fill();
      ctx.shadowBlur = 0;

      // ── right: chip cross-section vitrifying
      const cxx = w * 0.58, cww = w - cxx - 16, cyy = h / 2;
      const dryFrac = 1 - (M - Meq) / (M0 - Meq); // 0 wet -> 1 dry
      const chipH = 8 + thick * 9 * (1 - 0.5 * dryFrac); // shrinks as it dries
      const chipW = cww * 0.86, cx0 = cxx + (cww - chipW) / 2;
      // raspberry + honey body colour, gloss fades to matte as it vitrifies
      const grad = ctx.createLinearGradient(0, cyy - chipH, 0, cyy + chipH);
      grad.addColorStop(0, `rgba(232,50,107,${0.55 + 0.35 * dryFrac})`);
      grad.addColorStop(1, `rgba(122,40,72,${0.6 + 0.3 * dryFrac})`);
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.moveTo(cx0, cyy + chipH);
      ctx.lineTo(cx0, cyy - chipH + 6);
      ctx.quadraticCurveTo(cx0, cyy - chipH, cx0 + 6, cyy - chipH);
      ctx.lineTo(cx0 + chipW - 6, cyy - chipH);
      ctx.quadraticCurveTo(cx0 + chipW, cyy - chipH, cx0 + chipW, cyy - chipH + 6);
      ctx.lineTo(cx0 + chipW, cyy + chipH);
      ctx.closePath(); ctx.fill();
      // wet gloss highlight (fades as it dries)
      ctx.fillStyle = `rgba(255,255,255,${0.28 * (1 - dryFrac)})`;
      ctx.fillRect(cx0 + 6, cyy - chipH + 3, chipW - 12, 3);
      // glassy crackle when vitrified
      if (dryFrac > 0.6) {
        ctx.strokeStyle = `rgba(255,255,255,${0.12 * (dryFrac - 0.6) / 0.4})`;
        ctx.lineWidth = 0.7;
        for (let i = 0; i < 6; i++) {
          const xx = cx0 + (i + 0.5) / 6 * chipW;
          ctx.beginPath(); ctx.moveTo(xx, cyy - chipH); ctx.lineTo(xx + 4, cyy + chipH); ctx.stroke();
        }
      }
      // escaping water vapour
      if (!reduce && dryFrac < 0.95) {
        for (let i = 0; i < 14; i++) {
          const ph = (t * 60 + i * 31) % 100;
          const yy = cyy - chipH - ph * 0.7;
          const xx = cx0 + ((i * 53) % chipW);
          ctx.fillStyle = `rgba(140,180,220,${0.4 * (1 - ph / 100) * (1 - dryFrac)})`;
          ctx.beginPath(); ctx.arc(xx, yy, 1.4, 0, Math.PI * 2); ctx.fill();
        }
      }
      ctx.font = `9px ${MONO}`; ctx.fillStyle = V.ink;
      ctx.textAlign = "center";
      ctx.fillText(dryFrac > 0.85 ? "VITRIFIED -- SNAPS" : dryFrac > 0.5 ? "SETTING" : "WET COMPOTE",
        cxx + cww / 2, cyy + chipH + 22);
      ctx.fillStyle = V.honey;
      ctx.fillText(`${(thick).toFixed(1)} mm spread @ ${temp}\u00B0C`, cxx + cww / 2, gy + 6);
      ctx.textAlign = "left";

      if (mR.current) mR.current.textContent = `${M.toFixed(1)} %`;
      if (tR.current) tR.current.textContent = `${tEnd.toFixed(1)} h`;
      if (aR.current) aR.current.textContent = aw.toFixed(2);
      if (sR.current) { sR.current.textContent = tex.s; sR.current.style.color = tex.c; }

      raf = requestAnimationFrame(draw);
    };
    raf = requestAnimationFrame(draw);
    return () => { cancelAnimationFrame(raf); window.removeEventListener("resize", onResize); };
  }, []);

  return (
    <div>
      <canvas ref={canvasRef} style={{ width: "100%", height: 360, display: "block",
        borderRadius: 8, border: `1px solid ${V.dim}44`, background: "#08060A" }} />
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: 8, marginTop: 10 }}>
        <Readout label="Live moisture" col={V.honey} vref={mR} />
        <Readout label="Time to target" col={V.blue} vref={tR} />
        <Readout label="Water activity" col={V.aurora} vref={aR} />
        <Readout label="Final texture" col={V.lime} vref={sR} />
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginTop: 12 }}>
        <div>
          <Slider label="Drying temperature" value={temp} min={45} max={75} step={1} col={V.amb}
            onChange={(v) => { setTemp(v); tempRef.current = v; }} fmt={(v) => `${v.toFixed(0)} \u00B0C`} />
          <Slider label="Spread thickness" value={thick} min={1} max={5} step={0.1} col={V.blue}
            onChange={(v) => { setThick(v); thickRef.current = v; }} fmt={(v) => `${v.toFixed(1)} mm`} />
        </div>
        <div>
          <Slider label="Honey (% of solids)" value={honey} min={5} max={35} step={1} col={V.honey}
            onChange={(v) => { setHoney(v); honeyRef.current = v; }} fmt={(v) => `${v.toFixed(0)} %`} />
          <Slider label="Target final moisture" value={tgt} min={1.5} max={12} step={0.1} col={V.lime}
            onChange={(v) => { setTgt(v); tgtRef.current = v; }} fmt={(v) => `${v.toFixed(1)} %`} />
        </div>
      </div>
    </div>
  );
}

// ── SIM 2 — Texture phase map: water activity x glass-transition margin ───────────
function PhaseMapCanvas() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const honeyRef = useRef(15);
  const moistRef = useRef(3.5);
  const storeRef = useRef(22);
  const fiberRef = useRef(0);
  const descRef = useRef(true);

  const [honey, setHoney] = useState(15);
  const [moist, setMoist] = useState(3.5);
  const [store, setStore] = useState(22);
  const [fiber, setFiber] = useState(0);
  const [desc, setDesc] = useState(true);

  const aR = useRef<HTMLSpanElement | null>(null);
  const gR = useRef<HTMLSpanElement | null>(null);
  const mR = useRef<HTMLSpanElement | null>(null);
  const sR = useRef<HTMLSpanElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    let dim = fitCanvas(canvas, 360);
    const onResize = () => { dim = fitCanvas(canvas, 360); };
    window.addEventListener("resize", onResize);
    const reduce = prefersReduced();

    let raf = 0, t = 0;
    const AW_MAX = 0.7, MARG_MIN = -45, MARG_MAX = 55;

    const draw = () => {
      const ctx = canvas.getContext("2d");
      if (!ctx) { raf = requestAnimationFrame(draw); return; }
      const w = dim.w, h = dim.h;
      const honeyF = honeyRef.current / 100, M = moistRef.current;
      const storeT = storeRef.current, fiberB = fiberRef.current;
      if (!reduce) t += 1 / 60;

      const aw = waterActivity(M, honeyF);
      const tg = tgMix(M, honeyF, fiberB);
      const margin = tg - storeT;
      const tex = textureState(tg, aw, storeT);
      const shelf = shelfMonths(aw, descRef.current);

      const padL = 46, padR = 14, padT = 20, padB = 34;
      const gx = padL, gy = padT, gw = w - padL - padR, gh = h - padT - padB;
      const X = (a: number) => gx + (a / AW_MAX) * gw;
      const Y = (m: number) => gy + gh - ((m - MARG_MIN) / (MARG_MAX - MARG_MIN)) * gh;

      ctx.clearRect(0, 0, w, h);
      ctx.fillStyle = "#08060A"; ctx.fillRect(0, 0, w, h);

      // shade texture regions by sampling the classifier on a coarse grid
      const step = 14;
      for (let px = gx; px < gx + gw; px += step) {
        for (let py = gy; py < gy + gh; py += step) {
          const a = ((px - gx) / gw) * AW_MAX;
          const m = MARG_MIN + (1 - (py - gy) / gh) * (MARG_MAX - MARG_MIN);
          const st = textureState(m + storeT, a, storeT);
          ctx.fillStyle = `${st.c}1C`;
          ctx.fillRect(px, py, step, step);
        }
      }
      ctx.strokeStyle = `${V.dim}88`; ctx.lineWidth = 1; ctx.strokeRect(gx, gy, gw, gh);

      // storage temp line (margin = 0)
      ctx.strokeStyle = `${V.ink}44`; ctx.setLineDash([3, 4]);
      ctx.beginPath(); ctx.moveTo(gx, Y(0)); ctx.lineTo(gx + gw, Y(0)); ctx.stroke();
      ctx.setLineDash([]);
      ctx.font = `8px ${MONO}`; ctx.fillStyle = V.dim;
      ctx.fillText("Tg = storage T (glass line)", gx + 6, Y(0) - 4);

      // axes labels
      ctx.fillStyle = V.dim;
      ctx.fillText("WATER ACTIVITY a_w \u2192", gx + gw - 130, gy + gh + 20);
      ctx.save(); ctx.translate(gx - 32, gy + gh / 2); ctx.rotate(-Math.PI / 2);
      ctx.fillText("Tg MARGIN (\u00B0C)", -40, 0); ctx.restore();
      ctx.fillText("0.3", X(0.3) - 6, gy + gh + 12);
      ctx.fillText("0.6", X(0.6) - 6, gy + gh + 12);

      // region legend
      const leg = [
        { s: "CRUNCHY", c: V.lime }, { s: "CRISP", c: V.aurora },
        { s: "LEATHERY", c: V.gold }, { s: "STICKY", c: V.rose },
      ];
      leg.forEach((l, i) => {
        const lx = gx + 8 + i * 92;
        ctx.fillStyle = l.c; ctx.fillRect(lx, gy + 6, 8, 8);
        ctx.fillStyle = V.ink; ctx.fillText(l.s, lx + 12, gy + 13);
      });

      // formulation point (pulsing)
      const pulse = reduce ? 6 : 6 + Math.sin(t * 4) * 2;
      const px = X(Math.min(aw, AW_MAX)), py = Y(Math.max(MARG_MIN, Math.min(MARG_MAX, margin)));
      ctx.fillStyle = tex.c; ctx.shadowBlur = 16; ctx.shadowColor = tex.c;
      ctx.beginPath(); ctx.arc(px, py, pulse, 0, Math.PI * 2); ctx.fill();
      ctx.shadowBlur = 0;
      ctx.strokeStyle = "#fff"; ctx.lineWidth = 1.4;
      ctx.beginPath(); ctx.arc(px, py, pulse + 3, 0, Math.PI * 2); ctx.stroke();
      ctx.font = `9px ${MONO}`; ctx.fillStyle = V.ink;
      ctx.fillText("YOUR FORMULATION", px + 12, py - 8);

      if (aR.current) aR.current.textContent = aw.toFixed(2);
      if (gR.current) gR.current.textContent = `${tg.toFixed(0)} \u00B0C`;
      if (mR.current) { mR.current.textContent = `${margin >= 0 ? "+" : ""}${margin.toFixed(0)} \u00B0C`; mR.current.style.color = tex.c; }
      if (sR.current) sR.current.textContent = `${shelf.toFixed(1)} mo`;

      raf = requestAnimationFrame(draw);
    };
    raf = requestAnimationFrame(draw);
    return () => { cancelAnimationFrame(raf); window.removeEventListener("resize", onResize); };
  }, []);

  return (
    <div>
      <canvas ref={canvasRef} style={{ width: "100%", height: 360, display: "block",
        borderRadius: 8, border: `1px solid ${V.dim}44`, background: "#08060A" }} />
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: 8, marginTop: 10 }}>
        <Readout label="Water activity" col={V.aurora} vref={aR} />
        <Readout label="Glass transition Tg" col={V.vio} vref={gR} />
        <Readout label="Tg margin" col={V.lime} vref={mR} />
        <Readout label="Shelf life" col={V.gold} vref={sR} />
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginTop: 12 }}>
        <div>
          <Slider label="Honey (% of solids)" value={honey} min={5} max={35} step={1} col={V.honey}
            onChange={(v) => { setHoney(v); honeyRef.current = v; }} fmt={(v) => `${v.toFixed(0)} %`} />
          <Slider label="Final moisture" value={moist} min={1.5} max={14} step={0.1} col={V.blue}
            onChange={(v) => { setMoist(v); moistRef.current = v; }} fmt={(v) => `${v.toFixed(1)} %`} />
          <Slider label="Fibre / fruit-solid boost" value={fiber} min={0} max={1} step={0.05} col={V.lime}
            onChange={(v) => { setFiber(v); fiberRef.current = v; }} fmt={(v) => `${(v * 100).toFixed(0)} %`} />
        </div>
        <div>
          <Slider label="Storage temperature" value={store} min={4} max={35} step={1} col={V.amb}
            onChange={(v) => { setStore(v); storeRef.current = v; }} fmt={(v) => `${v.toFixed(0)} \u00B0C`} />
          <label style={{ display: "flex", alignItems: "center", gap: 8, fontFamily: MONO,
            fontSize: 9, color: V.gold, marginTop: 8, cursor: "pointer" }}>
            <input type="checkbox" checked={desc} onChange={(e) => { setDesc(e.target.checked); descRef.current = e.target.checked; }}
              style={{ accentColor: V.gold }} />
            DESICCANT + SEALED BARRIER PACK
          </label>
          <div style={{ fontFamily: SERIF, fontSize: "0.8rem", color: "rgba(234,216,222,0.55)", lineHeight: 1.4, marginTop: 8 }}>
            Push the point into the lime <b style={{ color: V.lime }}>CRUNCHY</b> zone: low water
            activity and a glass transition safely above storage temp. Honey is hygroscopic &mdash;
            too much drags Tg down and a_w up, toward the sticky corner.
          </div>
        </div>
      </div>
    </div>
  );
}

const PROCESS = `function prototype_compote_chip(fruit, honey, acid):
    # 1. COMPOTE -- cook down, concentrate solids
    compote = simmer(fruit + honey + acid, 95C, until reduced ~35%)
    if seedy(fruit): compote = sieve(compote)        # raspberry: optional de-seed
    adjust(pectin) if set_too_loose                  # citrus brings its own pectin

    # 2. SPREAD -- thin, even, edge-to-edge
    sheet = spread(compote, thickness = 2.0..3.0 mm) on lined tray

    # 3. DRY -- remove water until it vitrifies
    while moisture > target(3..4%):
        dehydrate(57..63C)        # low + slow protects colour & honey aromatics
    # crunch appears only once Tg climbs above room temp

    # 4. CONDITION + CUT
    cool in low-humidity room (<40% RH)
    snap / score into chips while brittle

    # 5. PACKAGE -- defend against honey's hygroscopicity
    pack with desiccant + sealed barrier film  (N2 flush optional)
    return chips`;

export default function CompoteChipsPage() {
  return (
    <div style={{ maxWidth: 1080, margin: "0 auto", padding: "28px 20px 80px",
      background: V.bg, minHeight: "100vh", color: V.ink }}>
      {/* Header */}
      <div style={{ marginBottom: 30 }}>
        <div style={{ fontFamily: MONO, fontSize: 8, color: V.dim, letterSpacing: "0.2em", marginBottom: 10 }}>
          AETHER KITCHEN LAB &middot; R&amp;D SPEC SHEET &middot; FORMULATION &times; TEXTURE &times; SHELF LIFE
        </div>
        <h1 style={{ margin: "0 0 8px", fontFamily: DISP, fontSize: "clamp(1.2rem,4vw,1.9rem)",
          fontWeight: 400, color: V.rasp, letterSpacing: "0.12em", lineHeight: 1.2 }}>
          CRUNCHY COMPOTE CHIPS
        </h1>
        <div style={{ fontFamily: SERIF, fontSize: "1.05rem", color: "rgba(234,216,222,0.78)", marginBottom: 14 }}>
          A product &amp; process prototype for <b style={{ color: V.rasp }}>crunchy raspberry compote
          chips</b> sweetened with <b style={{ color: V.honey }}>honey</b>, plus tart
          <b style={{ color: V.lemon }}> lemon</b> and <b style={{ color: V.lime }}>lime</b> variants.
          The whole challenge is crunch: fruit compote is mostly water and honey is hygroscopic, so the
          chip only goes glassy-crisp once it is dried far enough that its glass-transition temperature
          climbs above room temperature and its water activity drops below the spoilage line. The two
          live tools below let you dial formulation, drying, and packaging until the texture lands in
          the crunchy zone &mdash; then the spec tables capture the recipe, targets, shelf life, and
          batch scaling.
        </div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 5, marginBottom: 8 }}>
          <Chip col={V.rasp}>Raspberry</Chip>
          <Chip col={V.lemon}>Lemon</Chip>
          <Chip col={V.lime}>Lime</Chip>
          <Chip col={V.honey}>Honey-sweetened</Chip>
          <Chip col={V.aurora}>Water Activity &lt; 0.3</Chip>
          <Chip col={V.vio}>Glass Transition</Chip>
          <Chip col={V.gold}>Shelf-stable</Chip>
        </div>
        <div style={{ height: 1, background: `linear-gradient(90deg,${V.rasp}55,transparent)` }} />
      </div>

      {/* note */}
      <div style={{ marginBottom: 30, padding: "12px 16px", borderRadius: 8,
        background: `${V.gold}0C`, border: `1px solid ${V.gold}30`,
        fontFamily: SERIF, fontSize: "0.86rem", color: "rgba(234,216,222,0.7)", lineHeight: 1.5 }}>
        <b style={{ color: V.gold, fontFamily: MONO, fontSize: 8, letterSpacing: "0.12em" }}>HEURISTIC MODELS &mdash; </b>
        the simulators use simplified engineering relations (Gordon-Taylor blend for Tg, a sorption-style
        water-activity estimate, first-order drying kinetics, an a_w-driven shelf-life curve) so you can
        explore trade-offs fast. They guide the prototype direction; confirm final numbers with bench
        measurements (moisture analyser, a_w meter, texture analyser).
      </div>

      {/* I — drying */}
      <div style={{ marginBottom: 42 }}>
        <SectionHead n="I" title="LIVE -- DRYING KINETICS & THE ROUTE TO CRUNCH" col={V.honey} />
        <div style={{ fontFamily: SERIF, fontSize: "0.92rem", color: "rgba(234,216,222,0.7)",
          lineHeight: 1.55, marginBottom: 14, maxWidth: 840 }}>
          Watch the compote lose water on a first-order drying curve while a cross-section vitrifies from
          glossy wet gel into a matte, crackling glass. Hotter air and a thinner spread dry faster;
          extra honey holds water and slows the release. Crunch only appears once the chip crosses into
          the vitrified state &mdash; the cursor turns lime when the final texture lands crunchy.
        </div>
        <DryingCanvas />
      </div>

      {/* II — phase map */}
      <div style={{ marginBottom: 42 }}>
        <SectionHead n="II" title="LIVE -- TEXTURE PHASE MAP (WATER ACTIVITY x Tg MARGIN)" col={V.lime} />
        <div style={{ fontFamily: SERIF, fontSize: "0.92rem", color: "rgba(234,216,222,0.7)",
          lineHeight: 1.55, marginBottom: 14, maxWidth: 840 }}>
          Texture is set by two numbers: water activity (across) and how far the glass-transition
          temperature sits above storage temperature (up). The crunchy corner is low-a_w, high-Tg-margin.
          Honey pushes the formulation toward the sticky corner; drying further and adding fruit-fibre
          solids pull it back to crunchy. The point is your current recipe; move it into the lime zone
          and read the shelf life.
        </div>
        <PhaseMapCanvas />
      </div>

      {/* III — formulation */}
      <div style={{ marginBottom: 42 }}>
        <SectionHead n="III" title="FORMULATION -- BASE COMPOTE PER 100 g (WET)" col={V.rasp} />
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontFamily: MONO, fontSize: "0.74rem" }}>
            <thead>
              <tr style={{ color: V.dim, textAlign: "left" }}>
                {["Ingredient", "Raspberry", "Lemon", "Lime", "Function"].map((hd) => (
                  <th key={hd} style={{ padding: "8px 10px", borderBottom: `1px solid ${V.dim}55`,
                    letterSpacing: "0.08em" }}>{hd.toUpperCase()}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {[
                ["Fruit purée / pulp", "78 g", "62 g", "62 g", "Flavour + colour + body", V.ink],
                ["Honey", "15 g", "20 g", "20 g", "Sweetener (humectant — limit for crunch)", V.honey],
                ["Citrus juice", "3 g", "14 g", "14 g", "Acidity, brightness, pectin set", V.lemon],
                ["Citrus zest", "—", "1.5 g", "1.5 g", "Aromatic oils", V.lime],
                ["Apple / fruit fibre", "3 g", "2 g", "2 g", "Raises Tg → crunch matrix", V.lime],
                ["Pectin (if loose)", "0.5 g", "0.2 g", "0.2 g", "Gel structure for the sheet", V.aurora],
                ["Ascorbic acid", "0.1 g", "0.1 g", "0.1 g", "Colour + oxidation guard", V.green],
                ["Salt", "0.1 g", "0.1 g", "0.1 g", "Flavour contrast", V.dim],
              ].map((r, i) => (
                <tr key={i} style={{ borderBottom: `1px solid ${V.dim}22` }}>
                  <td style={{ padding: "7px 10px", color: r[5] }}>{r[0]}</td>
                  <td style={{ padding: "7px 10px", color: V.rasp }}>{r[1]}</td>
                  <td style={{ padding: "7px 10px", color: V.lemon }}>{r[2]}</td>
                  <td style={{ padding: "7px 10px", color: V.lime }}>{r[3]}</td>
                  <td style={{ padding: "7px 10px", color: "rgba(234,216,222,0.6)", fontFamily: SERIF, fontSize: "0.82rem" }}>{r[4]}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div style={{ fontFamily: SERIF, fontSize: "0.82rem", color: "rgba(234,216,222,0.55)", marginTop: 10, lineHeight: 1.5 }}>
          Honey runs ~13&ndash;18% of total solids for raspberry and a touch higher for the tart citrus
          variants. Above ~22% the chips trend chewy and re-absorb humidity; below ~10% they are crisp
          but sharp. The fruit-fibre line is the lever that buys crunch back when you want more honey.
        </div>
      </div>

      {/* IV — targets */}
      <div style={{ marginBottom: 42 }}>
        <SectionHead n="IV" title="TEXTURE & QUALITY TARGETS" col={V.aurora} />
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
          {[
            { c: V.aurora, t: "Final moisture", v: "3 – 4 % (w/w)", d: "Low enough to vitrify; the practical floor before flavour scorches." },
            { c: V.gold, t: "Water activity a_w", v: "< 0.30 (target 0.20)", d: "Below the mould/yeast line and in the brittle-glass regime." },
            { c: V.vio, t: "Glass transition Tg", v: "≥ 35 °C", d: "Comfortably above room temp so the chip stays crisp on the shelf." },
            { c: V.rose, t: "Snap force", v: "Clean fracture, low cohesion", d: "High initial break, no chewy pull — the signature of crunch." },
            { c: V.lemon, t: "Spread thickness", v: "2.0 – 3.0 mm", d: "Thin enough to dry evenly; thick enough to hold a chip shape." },
            { c: V.lime, t: "Colour retention", v: "Bright fruit hue", d: "Low-and-slow drying + ascorbic acid protect anthocyanins." },
          ].map((e) => (
            <div key={e.t} style={{ padding: "13px 15px", borderRadius: 8,
              background: `${e.c}08`, border: `1px solid ${e.c}30` }}>
              <div style={{ fontFamily: MONO, fontSize: 8, color: e.c, letterSpacing: "0.12em", marginBottom: 5 }}>
                {e.t.toUpperCase()}
              </div>
              <div style={{ fontFamily: DISP, fontSize: "1rem", color: V.ink, marginBottom: 6 }}>{e.v}</div>
              <div style={{ fontFamily: SERIF, fontSize: "0.82rem", color: "rgba(234,216,222,0.62)", lineHeight: 1.45 }}>{e.d}</div>
            </div>
          ))}
        </div>
      </div>

      {/* V — math */}
      <div style={{ marginBottom: 42 }}>
        <SectionHead n="V" title="THE MODELS BEHIND THE SLIDERS" col={V.vio} />
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
          {[
            { c: V.vio, t: "Glass transition (Gordon-Taylor blend)",
              tex: "T_g=\\dfrac{w_wT_w+w_hT_h+w_fT_f}{w_w+w_h+w_f}",
              d: "Water (Tw≈-137°C) is a strong plasticiser, honey solids (≈-40°C) soften, fruit/fibre solids (≈+60°C) stiffen. Drying lowers w_w and lifts Tg into the crunchy range." },
            { c: V.aurora, t: "Water activity (sorption estimate)",
              tex: "a_w=\\dfrac{M}{M+8}+0.16\\,\\phi_h\\dfrac{M}{M+22}",
              d: "Rises with moisture M and with honey fraction φ_h. The honey term is why a sweet chip needs to be dried that bit further to stay safe and crisp." },
            { c: V.honey, t: "Drying kinetics (first order)",
              tex: "M(t)=M_{eq}+(M_0-M_{eq})\\,e^{-k t}",
              d: "k grows with temperature and falls with thickness; honey lowers k slightly. Time-to-target = (1/k)·ln[(M0−Meq)/(Mtgt−Meq)]." },
            { c: V.gold, t: "Shelf life (a_w driven)",
              tex: "L\\approx 13\\,e^{-(a_w-0.18)/0.13}\\cdot\\beta",
              d: "Months of stability collapse as water activity climbs. β≈1.7 with a desiccant + sealed barrier pack that blocks honey from re-absorbing humidity." },
            { c: V.lime, t: "Crunch condition",
              tex: "\\text{crunchy}\\iff (T_g-T_{store})>10\\ \\wedge\\ a_w<0.3",
              d: "Both must hold: the matrix is a glass at storage temp AND dry enough to stay that way. Miss either and it goes leathery or sticky." },
            { c: V.rasp, t: "Process yield",
              tex: "Y=\\dfrac{S_{in}}{1-M_{f}/100}\\Big/ m_{in}",
              d: "Most of the input mass is water that leaves. With ~20% solids in and 3.5% final moisture, finished chips are roughly a fifth of the wet input weight." },
          ].map((e) => (
            <div key={e.t} style={{ padding: "14px 16px", borderRadius: 8,
              background: `${e.c}08`, border: `1px solid ${e.c}30` }}>
              <div style={{ fontFamily: MONO, fontSize: 8, color: e.c, letterSpacing: "0.12em", marginBottom: 8 }}>
                {e.t.toUpperCase()}
              </div>
              <div style={{ overflowX: "auto", color: V.ink, marginBottom: 8 }}
                dangerouslySetInnerHTML={{ __html: kx(e.tex, true) }} />
              <div style={{ fontFamily: SERIF, fontSize: "0.84rem", color: "rgba(234,216,222,0.65)", lineHeight: 1.45 }}>
                {e.d}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* VI — process */}
      <div style={{ marginBottom: 42 }}>
        <SectionHead n="VI" title="PROCESS -- COMPOTE TO PACKAGED CHIP" col={V.aurora} />
        <pre style={{ fontFamily: MONO, fontSize: "0.78rem", color: V.aurora, lineHeight: 1.55,
          background: "#0B0710", border: `1px solid ${V.aurora}30`, borderRadius: 8,
          padding: "16px 18px", overflowX: "auto", margin: 0 }}>{PROCESS}</pre>
      </div>

      {/* VII — batch scaling */}
      <div style={{ marginBottom: 42 }}>
        <SectionHead n="VII" title="BATCH SCALING -- LAB TO PRODUCTION" col={V.gold} />
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontFamily: MONO, fontSize: "0.74rem" }}>
            <thead>
              <tr style={{ color: V.dim, textAlign: "left" }}>
                {["Stage", "Wet input", "Tray / belt area", "Dry time", "≈ Chip yield", "Equipment"].map((hd) => (
                  <th key={hd} style={{ padding: "8px 10px", borderBottom: `1px solid ${V.dim}55`, letterSpacing: "0.08em" }}>
                    {hd.toUpperCase()}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {[
                ["Lab / bench", "0.5 kg", "0.3 m²", "8 – 10 h", "~110 g", "Home dehydrator / low oven"],
                ["Pilot", "10 kg", "6 m²", "9 – 11 h", "~2.1 kg", "Tray dehydrator cabinet"],
                ["Small production", "60 kg", "35 m²", "10 – 12 h", "~12.5 kg", "Multi-cart hot-air dryer"],
                ["Continuous", "200 kg/run", "Belt 120 m²", "Inline 6 – 8 h", "~42 kg", "Drum/belt dryer + IR finish"],
              ].map((r, i) => (
                <tr key={i} style={{ borderBottom: `1px solid ${V.dim}22` }}>
                  <td style={{ padding: "7px 10px", color: V.gold }}>{r[0]}</td>
                  <td style={{ padding: "7px 10px", color: V.ink }}>{r[1]}</td>
                  <td style={{ padding: "7px 10px", color: V.ink }}>{r[2]}</td>
                  <td style={{ padding: "7px 10px", color: V.ink }}>{r[3]}</td>
                  <td style={{ padding: "7px 10px", color: V.rasp }}>{r[4]}</td>
                  <td style={{ padding: "7px 10px", color: "rgba(234,216,222,0.6)", fontFamily: SERIF, fontSize: "0.82rem" }}>{r[5]}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div style={{ fontFamily: SERIF, fontSize: "0.82rem", color: "rgba(234,216,222,0.55)", marginTop: 10, lineHeight: 1.5 }}>
          Yields assume ~20% solids in the wet mix and a 3.5% final moisture. As surface area per kg
          drops at scale, hold spread thickness constant and add airflow rather than heat to protect
          colour and honey aromatics.
        </div>
      </div>

      {/* VIII — R&D notes */}
      <div style={{ marginBottom: 42 }}>
        <SectionHead n="VIII" title="R&D NOTES -- WHAT MAKES OR BREAKS THE CRUNCH" col={V.rasp} />
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
          {[
            { c: V.honey, t: "Honey is the central tension",
              b: "Honey sweetens beautifully but it is a humectant — it lowers the glass-transition temperature and pulls moisture from the air. That is exactly what fights crunch. Keep it near 13–18% of solids, dry harder to compensate, and always pack against humidity." },
            { c: V.lime, t: "Fibre is the crunch lever",
              b: "A few percent of apple or fruit fibre (and the fruit's own pectin) raises the matrix Tg without much sweetness cost. It is the cleanest way to keep crunch while carrying more honey — the slider that buys back the sticky corner." },
            { c: V.lemon, t: "Citrus variants set themselves",
              b: "Lemon and lime are high in acid and pectin, so they gel readily and dry to a sharp, glassy snap. They need more honey to balance the tartness, so lean harder on drying and fibre — and consider a light sugar bloom finish for shelf gloss." },
            { c: V.aurora, t: "Two numbers decide texture",
              b: "Everything reduces to water activity and Tg margin. Crisp lives at low a_w with Tg above room temp. The phase map is the design space: every formulation and drying choice just moves the point — aim it at the lime corner." },
            { c: V.gold, t: "Packaging is half the product",
              b: "Even a perfect chip softens in open air because honey re-absorbs humidity. A sealed barrier film with desiccant (optionally nitrogen-flushed) is what turns weeks of shelf life into many months — it is part of the formulation, not an afterthought." },
            { c: V.rose, t: "Colour and aroma are fragile",
              b: "Raspberry anthocyanins and honey's volatile aromatics both degrade with heat. Dry low and slow (57–63°C), add a little ascorbic acid, and finish thin sheets with a short infrared pass rather than longer high heat." },
          ].map((e) => (
            <div key={e.t} style={{ padding: "14px 16px", borderRadius: 8,
              background: `${e.c}08`, border: `1px solid ${e.c}28` }}>
              <div style={{ fontFamily: DISP, fontSize: "0.95rem", color: e.c, letterSpacing: "0.06em", marginBottom: 7 }}>
                {e.t}
              </div>
              <div style={{ fontFamily: SERIF, fontSize: "0.86rem", color: "rgba(234,216,222,0.68)", lineHeight: 1.5 }}>
                {e.b}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Footer */}
      <div style={{ borderTop: `1px solid ${V.dim}44`, paddingTop: 24, display: "flex",
        justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}>
        <a href="/" style={{ fontFamily: MONO, fontSize: 8, color: V.rasp, textDecoration: "none" }}>
          &lt;-- AETHER KNOWLEDGE SYSTEM
        </a>
        <div style={{ fontFamily: MONO, fontSize: 8, color: V.dim, textAlign: "right" }}>
          <div>Crunchy Compote Chips -- R&amp;D Prototype</div>
          <div>a_w &lt; 0.3 -- Tg &gt; room -- crunch holds</div>
        </div>
      </div>
    </div>
  );
}
