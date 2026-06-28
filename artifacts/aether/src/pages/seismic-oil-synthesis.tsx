import React, { useRef, useEffect, useState, useCallback } from "react";

/* ── palette ─────────────────────────────────────────────────────────── */
const C = {
  bg:     "#04060E",
  panel:  "rgba(8,10,20,0.82)",
  text:   "#B8C4D4",
  muted:  "#4A5568",
  dim:    "#1a2a3a",
  border: "#1C2D40",
  border2:"#2a4060",
  white:  "#E8EFF8",
  gold:   "#C8A030",
  amber:  "#E07820",
  cyan:   "#00FFB2",
  quant:  "#00ffe0",
  violet: "#B090F0",
  rose:   "#F06090",
  green:  "#50C880",
  red:    "#FF4455",
  orange: "#FF7030",
  blue:   "#4090FF",
};

/* ── canvas grid config ──────────────────────────────────────────────── */
const GW = 160;
const GH = 100;
const FAULT_COL = Math.floor(GW * 0.62);
const INJECT_COL = Math.floor(GW * 0.28);
const INJECT_ROW = Math.floor(GH * 0.5);

type SeismicEvent = { col: number; row: number; t: number; mag: number };

/* ── pressure colour ─────────────────────────────────────────────────── */
function pressureToRgb(p: number): [number, number, number] {
  const t = Math.min(1, Math.max(0, p));
  if (t < 0.25) {
    const s = t / 0.25;
    return [Math.round(4 + s * 10), Math.round(6 + s * 14), Math.round(14 + s * 40)];
  }
  if (t < 0.55) {
    const s = (t - 0.25) / 0.30;
    return [Math.round(14 + s * 120), Math.round(20 + s * 40), Math.round(54 - s * 30)];
  }
  if (t < 0.80) {
    const s = (t - 0.55) / 0.25;
    return [Math.round(134 + s * 90), Math.round(60 - s * 40), Math.round(24 - s * 10)];
  }
  const s = (t - 0.80) / 0.20;
  return [Math.round(224 + s * 31), Math.round(20 + s * 50), Math.round(14 + s * 30)];
}

/* ── canvas component ────────────────────────────────────────────────── */
function SeismicCanvas({
  injRate, diffusivity, faultFriction, injDepth,
}: {
  injRate: number; diffusivity: number; faultFriction: number; injDepth: number;
}) {
  const cvRef = useRef<HTMLCanvasElement>(null);
  const stateRef = useRef({
    pressure: new Float32Array(GW * GH),
    events: [] as SeismicEvent[],
    t: 0,
    frame: 0,
    raf: 0,
  });

  useEffect(() => {
    stateRef.current.pressure = new Float32Array(GW * GH);
    stateRef.current.events = [];
    stateRef.current.t = 0;
  }, [injRate, diffusivity, faultFriction, injDepth]);

  useEffect(() => {
    const cv = cvRef.current;
    if (!cv) return;
    const ctx = cv.getContext("2d");
    if (!ctx) return;

    const W = cv.offsetWidth;
    const H = cv.offsetHeight;
    cv.width  = W * window.devicePixelRatio;
    cv.height = H * window.devicePixelRatio;
    ctx.scale(window.devicePixelRatio, window.devicePixelRatio);

    const cellW = W / GW;
    const cellH = H / GH;
    const s = stateRef.current;

    function injectRow(): number {
      return Math.round(GH * 0.5 + (injDepth - 0.5) * GH * 0.4);
    }

    function step() {
      s.t += 0.016;
      s.frame += 1;

      const inRow = injectRow();
      const D = diffusivity * 0.18;
      const injectStrength = injRate * 0.022;

      /* inject pressure at well */
      for (let dr = -1; dr <= 1; dr++) {
        const ir = inRow + dr;
        if (ir >= 0 && ir < GH) {
          s.pressure[ir * GW + INJECT_COL] = Math.min(1, s.pressure[ir * GW + INJECT_COL] + injectStrength);
        }
      }

      /* diffuse (explicit finite difference) */
      const next = new Float32Array(s.pressure);
      for (let row = 1; row < GH - 1; row++) {
        for (let col = 1; col < GW - 1; col++) {
          const idx = row * GW + col;
          const lap =
            s.pressure[(row - 1) * GW + col] +
            s.pressure[(row + 1) * GW + col] +
            s.pressure[row * GW + (col - 1)] +
            s.pressure[row * GW + (col + 1)] -
            4 * s.pressure[idx];
          next[idx] = Math.min(1, Math.max(0, s.pressure[idx] + D * lap - 0.0008));
        }
      }

      /* fault interaction -- Mohr-Coulomb slip */
      if (s.frame % 6 === 0) {
        for (let row = 0; row < GH; row++) {
          const pf = next[row * GW + FAULT_COL];
          /* effective normal stress reduction -- slip threshold */
          const threshold = faultFriction * 0.55 + 0.22;
          if (pf > threshold) {
            const mag = 1 + (pf - threshold) * 4;
            s.events.push({ col: FAULT_COL, row, t: s.t, mag });
            /* release pressure along fault */
            for (let dc = -2; dc <= 2; dc++) {
              const fc = FAULT_COL + dc;
              if (fc >= 0 && fc < GW) {
                next[row * GW + fc] *= 0.55;
              }
            }
          }
        }
      }

      /* trim old events */
      const cutoff = s.t - 4;
      s.events = s.events.filter(e => e.t > cutoff);
      s.pressure = next;
    }

    function draw() {
      ctx.clearRect(0, 0, W, H);

      /* pressure field */
      const imgData = ctx.createImageData(W, H);
      const d32 = new Uint32Array(imgData.data.buffer);
      for (let row = 0; row < GH; row++) {
        for (let col = 0; col < GW; col++) {
          const p = stateRef.current.pressure[row * GW + col];
          const [r, g, b] = pressureToRgb(p);
          const px0col = Math.floor(col * cellW);
          const px0row = Math.floor(row * cellH);
          const px1col = Math.floor((col + 1) * cellW);
          const px1row = Math.floor((row + 1) * cellH);
          const colour = (255 << 24) | (b << 16) | (g << 8) | r;
          for (let py = px0row; py < px1row; py++) {
            for (let px = px0col; px < px1col; px++) {
              d32[py * W + px] = colour;
            }
          }
        }
      }
      ctx.putImageData(imgData, 0, 0);

      /* rock layer tint */
      ctx.fillStyle = "rgba(0,0,0,0.18)";
      ctx.fillRect(0, 0, W, H);

      /* depth shading -- deeper = darker */
      const topGrad = ctx.createLinearGradient(0, 0, 0, H);
      topGrad.addColorStop(0, "rgba(0,10,30,0.45)");
      topGrad.addColorStop(1, "rgba(0,0,0,0)");
      ctx.fillStyle = topGrad;
      ctx.fillRect(0, 0, W, H * 0.3);

      /* fault plane */
      const faultX = FAULT_COL * cellW;
      ctx.strokeStyle = "rgba(200,80,40,0.55)";
      ctx.lineWidth = 1.5;
      ctx.setLineDash([6, 4]);
      ctx.beginPath();
      ctx.moveTo(faultX, 0);
      ctx.lineTo(faultX, H);
      ctx.stroke();
      ctx.setLineDash([]);

      /* fault label */
      ctx.fillStyle = "rgba(200,80,40,0.7)";
      ctx.font = "10px 'DM Mono', monospace";
      ctx.fillText("FAULT", faultX + 5, 14);

      /* injection well */
      const inRow = stateRef.current.t > 0
        ? Math.round(GH * 0.5 + (injDepth - 0.5) * GH * 0.4)
        : INJECT_ROW;
      const wellX = INJECT_COL * cellW;
      const wellY = inRow * cellH;

      /* well casing */
      ctx.strokeStyle = "#C8A030";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(wellX, 0);
      ctx.lineTo(wellX, wellY - 4);
      ctx.stroke();

      /* well head */
      ctx.fillStyle = "#C8A030";
      ctx.beginPath();
      ctx.arc(wellX, wellY, 5, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = "rgba(200,160,48,0.18)";
      ctx.beginPath();
      ctx.arc(wellX, wellY, 12, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = "#C8A030";
      ctx.font = "9px 'DM Mono', monospace";
      ctx.fillText("INJECT", wellX + 8, wellY - 4);

      /* seismic events */
      const now = stateRef.current.t;
      for (const ev of stateRef.current.events) {
        const age = now - ev.t;
        const alpha = Math.max(0, 1 - age / 3.5);
        const radius = 3 + ev.mag * 6 * (1 - Math.exp(-age * 2));
        const ex = ev.col * cellW;
        const ey = ev.row * cellH;
        const g = ctx.createRadialGradient(ex, ey, 0, ex, ey, radius * 2);
        g.addColorStop(0, `rgba(255,80,60,${alpha * 0.9})`);
        g.addColorStop(1, `rgba(255,40,20,0)`);
        ctx.fillStyle = g;
        ctx.beginPath();
        ctx.arc(ex, ey, radius * 2, 0, Math.PI * 2);
        ctx.fill();
      }

      /* surface label */
      ctx.fillStyle = "rgba(180,200,220,0.4)";
      ctx.font = "9px 'DM Mono', monospace";
      ctx.fillText("SURFACE", 8, 12);
      ctx.fillText("BASEMENT ROCK", 8, H - 6);

      /* pressure legend */
      const legX = W - 90;
      const legY = H - 60;
      const legW = 70;
      const legH = 10;
      const legGrad = ctx.createLinearGradient(legX, 0, legX + legW, 0);
      legGrad.addColorStop(0, "#04060E");
      legGrad.addColorStop(0.4, "#8c3c18");
      legGrad.addColorStop(0.75, "#e04808");
      legGrad.addColorStop(1, "#ff4030");
      ctx.fillStyle = legGrad;
      ctx.fillRect(legX, legY, legW, legH);
      ctx.strokeStyle = "rgba(255,255,255,0.15)";
      ctx.lineWidth = 0.5;
      ctx.strokeRect(legX, legY, legW, legH);
      ctx.fillStyle = "rgba(180,200,220,0.5)";
      ctx.font = "8px 'DM Mono', monospace";
      ctx.fillText("low P", legX, legY - 2);
      ctx.fillText("high P", legX + legW - 30, legY - 2);
    }

    function loop() {
      step();
      draw();
      s.raf = requestAnimationFrame(loop);
    }
    s.raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(s.raf);
  }, [injRate, diffusivity, faultFriction, injDepth]);

  return (
    <canvas
      ref={cvRef}
      data-testid="seismic-canvas"
      style={{ width: "100%", height: 400, display: "block", background: C.bg }}
    />
  );
}

/* ── tabs ────────────────────────────────────────────────────────────── */
const TABS = [
  { key: "induced",    label: "Induced Seismicity",    sym: "M",  col: C.red    },
  { key: "fracking",   label: "Hydraulic Fracturing",  sym: "F",  col: C.orange },
  { key: "wastewater", label: "Wastewater Injection",  sym: "W",  col: C.amber  },
  { key: "mechanics",  label: "Fault Mechanics",       sym: "tau", col: C.violet },
  { key: "seismology", label: "Exploration Seismology",sym: "Vs", col: C.cyan   },
] as const;
type TabKey = typeof TABS[number]["key"];

/* ── sub-components ──────────────────────────────────────────────────── */
function STitle({ children, col }: { children: React.ReactNode; col: string }) {
  return (
    <div style={{ fontSize: 15, letterSpacing: "0.04em", marginBottom: 12, color: col, fontFamily: "Cinzel, ui-serif, Georgia, serif" }}>
      {children}
    </div>
  );
}
function SBody({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ fontSize: 12.5, lineHeight: 1.75, color: C.text, fontFamily: "Inter, ui-sans-serif, system-ui, sans-serif" }}>
      {children}
    </div>
  );
}
function SStat({ k, v, c }: { k: string; v: string; c: string }) {
  return (
    <div style={{ border: `1px solid ${C.border}`, borderRadius: 6, padding: "10px 12px", background: "rgba(20,18,32,0.45)" }}>
      <div style={{ fontSize: 9, letterSpacing: "0.25em", textTransform: "uppercase", color: C.muted, fontFamily: "Inter, ui-sans-serif, system-ui, sans-serif" }}>{k}</div>
      <div style={{ marginTop: 4, fontSize: 12, color: c, fontFamily: "JetBrains Mono, ui-monospace, monospace" }}>{v}</div>
    </div>
  );
}
function SRow({ k, v, c }: { k: string; v: string; c: string }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
      <span style={{ color: C.muted, fontFamily: "Inter, ui-sans-serif, system-ui, sans-serif", fontSize: 10.5, letterSpacing: "0.04em" }}>{k}</span>
      <span style={{ color: c, fontFamily: "JetBrains Mono, ui-monospace, monospace", fontSize: 11 }}>{v}</span>
    </div>
  );
}
function SBar({ label, val, c }: { label: string; val: number; c: string }) {
  const v = Math.max(0, Math.min(1, val));
  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", fontSize: 10, marginBottom: 6 }}>
        <span style={{ color: "#6A6680", fontFamily: "Inter, ui-sans-serif, system-ui, sans-serif", letterSpacing: "0.04em" }}>{label}</span>
        <span style={{ color: c, fontFamily: "JetBrains Mono, ui-monospace, monospace" }}>{v.toFixed(2)}</span>
      </div>
      <div style={{ height: 4, borderRadius: 9999, overflow: "hidden", background: "rgba(255,255,255,0.04)" }}>
        <div style={{ height: "100%", borderRadius: 9999, width: `${v * 100}%`, background: `linear-gradient(90deg, ${c}55 0%, ${c} 100%)`, boxShadow: `0 0 8px ${c}66` }} />
      </div>
    </div>
  );
}
function SSlider({ id, label, value, min, max, step, col, fmt, onChange }: {
  id: string; label: string; value: number; min: number; max: number; step: number;
  col: string; fmt: (v: number) => string; onChange: (v: number) => void;
}) {
  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, marginBottom: 4 }}>
        <span style={{ color: "#60607A" }}>{label}</span>
        <span style={{ color: col }}>{fmt(value)}</span>
      </div>
      <input type="range" min={min} max={max} step={step} value={value}
        onChange={e => onChange(parseFloat(e.target.value))}
        onInput={e => onChange(parseFloat((e.target as HTMLInputElement).value))}
        data-testid={`sl-${id}`} aria-label={label}
        style={{ width: "100%", accentColor: col, cursor: "pointer" }} />
    </div>
  );
}

function EqChip({ children, col }: { children: React.ReactNode; col: string }) {
  return (
    <div style={{ display: "inline-block", padding: "4px 10px", background: `${col}12`, border: `1px solid ${col}40`, borderRadius: 6, fontSize: 12, fontFamily: "JetBrains Mono, ui-monospace, monospace", color: col, margin: "4px 4px 4px 0" }}>
      {children}
    </div>
  );
}

/* ── shared card style ───────────────────────────────────────────────── */
const CARD: React.CSSProperties = {
  boxShadow: "0 1px 0 rgba(255,255,255,0.02) inset, 0 30px 70px -30px rgba(0,0,0,0.8)",
  backdropFilter: "blur(3px)",
  WebkitBackdropFilter: "blur(3px)",
};

/* ── main page ───────────────────────────────────────────────────────── */
export default function SeismicOilSynthesisPage() {
  const [tab, setTab]           = useState<TabKey>("induced");
  const [injRate, setInjRate]   = useState(0.55);
  const [diffusivity, setDiff]  = useState(0.5);
  const [faultFriction, setFF]  = useState(0.6);
  const [injDepth, setDepth]    = useState(0.5);
  const [eventCount, setEC]     = useState(0);
  const [magnitude, setMag]     = useState(0);

  /* derived observables */
  const hydraulicD = (diffusivity * 4.5).toFixed(2);
  const mohrCrit   = (faultFriction * 0.55 + 0.22).toFixed(3);
  const estMag      = Math.max(0.5, (injRate * 3.2 * (1 - faultFriction * 0.6))).toFixed(1);
  const riskLevel   = injRate > 0.7 && faultFriction < 0.5 ? "HIGH" : injRate > 0.45 ? "MODERATE" : "LOW";

  /* tick event counter */
  useEffect(() => {
    const id = setInterval(() => {
      if (injRate > 0.3) {
        const prob = injRate * (1 - faultFriction * 0.7) * 0.4;
        if (Math.random() < prob) {
          setEC(n => n + 1);
          setMag(parseFloat((1 + Math.random() * injRate * 3).toFixed(1)));
        }
      }
    }, 1800);
    return () => clearInterval(id);
  }, [injRate, faultFriction]);

  const activeTab = TABS.find(t => t.key === tab)!;

  return (
    <div style={{ background: C.bg, color: C.text, fontFamily: "Cinzel, ui-serif, Georgia, serif", minHeight: "100%", position: "relative", overflowX: "hidden" }}>

      <style>{`
        @keyframes seis-pulse   { 0%,100%{opacity:.35;transform:scale(1)} 50%{opacity:1;transform:scale(1.45)} }
        @keyframes seis-breathe { 0%,100%{opacity:.5;transform:scale(1)} 50%{opacity:.9;transform:scale(1.08)} }
        @keyframes seis-drift   { 0%{transform:translate3d(0,0,0)} 50%{transform:translate3d(35px,-18px,0)} 100%{transform:translate3d(0,0,0)} }
        @keyframes seis-fadein  { from{opacity:0;transform:translateY(3px)} to{opacity:1;transform:translateY(0)} }
        @keyframes seis-shimmer { 0%,100%{opacity:.6} 50%{opacity:1} }
        .s-pulse  { animation: seis-pulse 2.4s ease-in-out infinite; transform-origin:center; }
        .s-glow-1 { animation: seis-breathe 10s ease-in-out infinite, seis-drift 24s ease-in-out infinite; position:absolute; }
        .s-glow-2 { animation: seis-breathe 13s ease-in-out infinite, seis-drift 30s ease-in-out infinite reverse; position:absolute; }
        .s-shimmer{ animation: seis-shimmer 5s ease-in-out infinite; }
        input[type=range]{ width:100%; cursor:pointer; accent-color:currentColor; }
      `}</style>

      {/* atmospheric glow */}
      <div style={{ pointerEvents: "none", position: "absolute", inset: 0, userSelect: "none", overflow: "hidden" }} aria-hidden>
        <div className="s-glow-1" style={{ top: "-10%", left: "-6%", width: 700, height: 700, background: "radial-gradient(circle, rgba(255,80,40,0.12) 0%, rgba(255,80,40,0) 70%)", filter: "blur(24px)" }} />
        <div className="s-glow-2" style={{ top: "40%", right: "-12%", width: 600, height: 600, background: "radial-gradient(circle, rgba(200,160,48,0.08) 0%, rgba(200,160,48,0) 70%)", filter: "blur(24px)" }} />
      </div>

      <div style={{ position: "relative", padding: "32px" }}>

        {/* header */}
        <div style={{ marginBottom: 28, maxWidth: 840 }}>
          <div style={{ fontSize: 10, letterSpacing: "0.4em", textTransform: "uppercase", fontStyle: "italic", color: C.muted, fontFamily: "'Cinzel', ui-serif, Georgia, serif" }}>
            aether · induced seismicity · oil & gas · subsurface synthesis
          </div>
          <h1 style={{ fontSize: 38, marginTop: 8, marginBottom: 0, lineHeight: 1.05, color: C.white, letterSpacing: "0.015em" }}>
            Seismic <span style={{ color: C.red }}>&amp;</span> Oil Industry{" "}
            <span style={{ color: C.gold }}>Synthesis</span>
          </h1>
          <div className="s-shimmer" style={{ marginTop: 12, marginBottom: 16, height: 1, background: `linear-gradient(90deg, ${C.red}66 0%, ${C.gold}40 40%, transparent 100%)`, width: "58%" }} />
          <p style={{ fontSize: 13.5, marginTop: 12, lineHeight: 1.75, color: C.text, fontFamily: "Inter, ui-sans-serif, system-ui, sans-serif" }}>
            The oil and gas industry does not merely extract hydrocarbons -- it{" "}
            <span style={{ color: C.red }}>reshapes subsurface stress fields</span>. By injecting billions of barrels of
            produced water into deep disposal wells, operators alter{" "}
            <span style={{ color: C.amber }}>pore pressure</span> along ancient fault planes, reducing effective normal
            stress until faults that have been locked for millennia suddenly slip.
            Oklahoma went from 1-2 magnitude-3+ earthquakes per year to{" "}
            <span style={{ color: C.gold }}>over 900 in 2015</span> -- directly correlated with wastewater injection volumes.
          </p>
          <p style={{ fontSize: 12, marginTop: 10, fontStyle: "italic", color: C.muted, fontFamily: "'Cinzel', ui-serif, Georgia, serif" }}>
            -- pore pressure diffusion · Mohr-Coulomb slip · Darcy flow · fault reactivation
          </p>
        </div>

        {/* canvas card */}
        <div style={{ ...CARD, border: `1px solid ${C.border}`, borderRadius: 10, overflow: "hidden", background: C.panel, marginBottom: 20 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 20px", borderBottom: `1px solid ${C.border}` }}>
            <div style={{ display: "inline-flex", alignItems: "center", gap: 8, fontSize: 10, letterSpacing: "0.3em", textTransform: "uppercase", color: C.amber }}>
              <span className="s-pulse" style={{ width: 6, height: 6, borderRadius: "50%", background: C.red, boxShadow: `0 0 8px ${C.red}`, flexShrink: 0 }} />
              PORE PRESSURE DIFFUSION -- LIVE SIMULATION
            </div>
            <div style={{ display: "inline-flex", alignItems: "center", gap: 16, fontSize: 10, color: C.muted }}>
              <span>seismic events: <span style={{ color: C.red, fontFamily: "JetBrains Mono, ui-monospace, monospace" }}>{eventCount}</span></span>
              <span>last M: <span style={{ color: eventCount > 0 ? C.red : C.muted, fontFamily: "JetBrains Mono, ui-monospace, monospace" }}>{eventCount > 0 ? magnitude : "--"}</span></span>
              <span style={{ color: riskLevel === "HIGH" ? C.red : riskLevel === "MODERATE" ? C.amber : C.green }}>
                {riskLevel} RISK
              </span>
            </div>
          </div>
          <SeismicCanvas injRate={injRate} diffusivity={diffusivity} faultFriction={faultFriction} injDepth={injDepth} />
          {/* slider row under canvas */}
          <div style={{ padding: "16px 20px", borderTop: `1px solid ${C.border}`, display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: 16 }}>
            <SSlider id="inj"  label="injection rate"     value={injRate}      min={0.05} max={1.0} step={0.01} col={C.amber}  fmt={v => v.toFixed(2)} onChange={setInjRate} />
            <SSlider id="diff" label="rock diffusivity"   value={diffusivity}  min={0.05} max={1.0} step={0.01} col={C.cyan}   fmt={v => v.toFixed(2)} onChange={setDiff}   />
            <SSlider id="ff"   label="fault friction mu"  value={faultFriction} min={0.1} max={0.9} step={0.01} col={C.violet} fmt={v => v.toFixed(2)} onChange={setFF}     />
            <SSlider id="dep"  label="injection depth"    value={injDepth}     min={0.1} max={0.9} step={0.01} col={C.gold}   fmt={v => v.toFixed(2)} onChange={setDepth}  />
          </div>
        </div>

        {/* main 2-col layout */}
        <div style={{ display: "grid", gridTemplateColumns: "minmax(0,1fr) 320px", gap: 20 }}>

          {/* left column: tabs + content */}
          <div>
            {/* tab row */}
            <div style={{ display: "flex", gap: 8, marginBottom: 16, flexWrap: "wrap" }}>
              {TABS.map(T => {
                const active = tab === T.key;
                return (
                  <button key={T.key} onClick={() => setTab(T.key)}
                    data-testid={`tab-${T.key}`} aria-pressed={active}
                    style={{
                      padding: "9px 14px", fontSize: 10.5, letterSpacing: "0.18em", textTransform: "uppercase",
                      border: `1px solid ${active ? T.col + "88" : C.border}`,
                      borderRadius: 9999, display: "inline-flex", alignItems: "center", gap: 7,
                      cursor: "pointer",
                      background: active ? T.col + "18" : "rgba(20,18,32,0.45)",
                      color: active ? T.col : C.text,
                      fontFamily: "Cinzel, ui-serif, Georgia, serif",
                      boxShadow: active ? `0 0 20px ${T.col}33` : "none",
                    }}>
                    {active && <span className="s-pulse" style={{ width: 5, height: 5, borderRadius: "50%", background: T.col, flexShrink: 0 }} />}
                    {T.label}
                  </button>
                );
              })}
            </div>

            {/* tab content */}
            <div style={{ ...CARD, border: `1px solid ${C.border}`, borderRadius: 10, padding: 24, background: C.panel }}>

              {tab === "induced" && (
                <>
                  <STitle col={C.red}>Induced Seismicity -- the Oklahoma Experiment</STitle>
                  <SBody>
                    Between 2009 and 2015, Oklahoma's earthquake rate increased by{" "}
                    <span style={{ color: C.red }}>40,000%</span>. The USGS now lists
                    Oklahoma, Kansas, and Texas as having{" "}
                    <span style={{ color: C.amber }}>human-caused seismic hazard</span>{" "}
                    comparable to natural zones like California. The mechanism is not fracking itself --
                    it is the deep disposal of <span style={{ color: C.gold }}>produced water</span>{" "}
                    (brine that comes up with oil and gas) into the Arbuckle formation, a highly
                    permeable limestone sitting directly atop crystalline basement rock where ancient
                    faults live. Pore pressure diffuses kilometers from the well over months,
                    slowly squeezing fault planes until they slip.
                  </SBody>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginTop: 16 }}>
                    <div style={{ padding: "12px 14px", background: "rgba(255,60,40,0.06)", border: `1px solid ${C.red}30`, borderRadius: 8 }}>
                      <div style={{ fontSize: 10, letterSpacing: "0.2em", textTransform: "uppercase", color: C.red, marginBottom: 6 }}>Oklahoma 2015</div>
                      <div style={{ fontSize: 22, color: C.white, fontFamily: "JetBrains Mono, ui-monospace, monospace", lineHeight: 1 }}>900+</div>
                      <div style={{ fontSize: 10.5, color: C.muted, marginTop: 4 }}>M3+ events in one year</div>
                    </div>
                    <div style={{ padding: "12px 14px", background: "rgba(200,160,48,0.06)", border: `1px solid ${C.gold}30`, borderRadius: 8 }}>
                      <div style={{ fontSize: 10, letterSpacing: "0.2em", textTransform: "uppercase", color: C.gold, marginBottom: 6 }}>Baseline (pre-2008)</div>
                      <div style={{ fontSize: 22, color: C.white, fontFamily: "JetBrains Mono, ui-monospace, monospace", lineHeight: 1 }}>1-2</div>
                      <div style={{ fontSize: 10.5, color: C.muted, marginTop: 4 }}>M3+ events per year</div>
                    </div>
                  </div>
                  <div style={{ marginTop: 14, fontSize: 11.5, color: C.text, fontFamily: "Inter, ui-sans-serif, system-ui, sans-serif", lineHeight: 1.7 }}>
                    Key insight: the largest events (M5.8 Pawnee 2016, M5.6 Prague 2011) occurred on
                    faults <span style={{ color: C.amber }}>kilometers away</span> from injection wells --
                    demonstrating that pressure can diffuse through permeable formations over many months
                    before reaching a critically stressed fault.
                  </div>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10, marginTop: 14 }}>
                    <SStat k="peak year" v="2015" c={C.red} />
                    <SStat k="largest event" v="M 5.8" c={C.orange} />
                    <SStat k="disposal volume" v="~1B bbl/yr" c={C.amber} />
                  </div>
                </>
              )}

              {tab === "fracking" && (
                <>
                  <STitle col={C.orange}>Hydraulic Fracturing -- microseismic swarms</STitle>
                  <SBody>
                    Fracking (hydraulic fracturing) injects fluid at{" "}
                    <span style={{ color: C.orange }}>pressures exceeding the minimum principal stress</span>{" "}
                    of the rock (typically 3,000-8,000 psi), propagating tensile fractures outward from
                    the wellbore to release hydrocarbons trapped in tight shale. Each fracture tip creates
                    a microseismic event -- typically{" "}
                    <span style={{ color: C.gold }}>M -3 to M 1</span>, far below felt threshold.
                    Fracking-induced events reaching M 3+ are rare but documented.
                  </SBody>
                  <div style={{ marginTop: 14 }}>
                    <div style={{ fontSize: 10, letterSpacing: "0.3em", textTransform: "uppercase", color: C.muted, marginBottom: 8 }}>key physics</div>
                    <EqChip col={C.orange}>P_frac = sigma_3 + T</EqChip>
                    <EqChip col={C.gold}>KIc = P * sqrt(pi * a)</EqChip>
                    <EqChip col={C.cyan}>b-value ~ 1.5 (fracking swarms)</EqChip>
                    <div style={{ fontSize: 11, color: C.muted, marginTop: 8, fontFamily: "Inter, ui-sans-serif, system-ui, sans-serif" }}>
                      sigma_3 = minimum horizontal stress, T = tensile strength, KIc = fracture toughness, a = fracture half-length
                    </div>
                  </div>
                  <div style={{ marginTop: 16, fontSize: 11.5, color: C.text, fontFamily: "Inter, ui-sans-serif, system-ui, sans-serif", lineHeight: 1.7 }}>
                    Operators use microseismic monitoring arrays to map fracture geometry in real time --
                    the same physics that creates hazard also provides a{" "}
                    <span style={{ color: C.cyan }}>subsurface imaging tool</span>. Moment tensor inversion
                    of the microseismic catalog reveals fracture orientation, length, and whether events
                    are tensile (opening) or shear (sliding).
                  </div>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10, marginTop: 14 }}>
                    <SStat k="typical frack M" v="-3 to +1" c={C.orange} />
                    <SStat k="fluid pressure" v="3-8 kpsi" c={C.gold} />
                    <SStat k="frac length" v="200-400 m" c={C.cyan} />
                  </div>
                </>
              )}

              {tab === "wastewater" && (
                <>
                  <STitle col={C.amber}>Wastewater Injection -- the hidden hazard</STitle>
                  <SBody>
                    For every barrel of oil produced in the Permian Basin, roughly{" "}
                    <span style={{ color: C.amber }}>10 barrels of brine</span> (produced water) come
                    with it. This water is too saline and contaminated to treat economically, so it is
                    injected into deep disposal formations under federal Class II well permits.
                    The Arbuckle group in Oklahoma -- a 3,000-foot-thick permeable limestone -- accepted
                    billions of barrels, creating a slow-moving pressure wave that diffused into
                    Precambrian basement faults.
                  </SBody>
                  <div style={{ marginTop: 14 }}>
                    <div style={{ fontSize: 10, letterSpacing: "0.3em", textTransform: "uppercase", color: C.muted, marginBottom: 8 }}>Darcy flow in the formation</div>
                    <EqChip col={C.amber}>q = -(k/mu) * grad(P)</EqChip>
                    <EqChip col={C.gold}>dP/dt = D * laplacian(P)</EqChip>
                    <EqChip col={C.cyan}>D = k / (mu * Ss)</EqChip>
                    <div style={{ fontSize: 11, color: C.muted, marginTop: 8, fontFamily: "Inter, ui-sans-serif, system-ui, sans-serif" }}>
                      k = permeability (Arbuckle ~ 100-500 mD), mu = fluid viscosity, Ss = specific storage, D = hydraulic diffusivity (0.1-10 m2/s)
                    </div>
                  </div>
                  <div style={{ marginTop: 16, fontSize: 11.5, color: C.text, fontFamily: "Inter, ui-sans-serif, system-ui, sans-serif", lineHeight: 1.7 }}>
                    The Arbuckle's high permeability means pressure diffuses{" "}
                    <span style={{ color: C.amber }}>faster than expected</span> -- events can correlate
                    with injection wells 20+ km away. Traffic-light protocols now throttle or shut wells
                    when nearby seismicity exceeds M 2.5, but regulatory authority varies by state.
                  </div>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10, marginTop: 14 }}>
                    <SStat k="water ratio (Permian)" v="~10:1 bbl" c={C.amber} />
                    <SStat k="Arbuckle depth" v="1500-2000 m" c={C.gold} />
                    <SStat k="hydraulic D" v={`${hydraulicD} m2/s`} c={C.cyan} />
                  </div>
                </>
              )}

              {tab === "mechanics" && (
                <>
                  <STitle col={C.violet}>Fault Mechanics -- Mohr-Coulomb reactivation</STitle>
                  <SBody>
                    A fault slips when the{" "}
                    <span style={{ color: C.violet }}>resolved shear stress</span> on the fault plane
                    exceeds the frictional resistance. Frictional resistance depends on the{" "}
                    <span style={{ color: C.amber }}>effective normal stress</span> -- total stress minus
                    pore fluid pressure. Injecting fluid raises pore pressure, reducing effective normal
                    stress, which shifts the Mohr circle toward the Coulomb failure envelope until it
                    touches -- and the fault slips.
                  </SBody>
                  <div style={{ marginTop: 14 }}>
                    <div style={{ fontSize: 10, letterSpacing: "0.3em", textTransform: "uppercase", color: C.muted, marginBottom: 8 }}>Mohr-Coulomb failure criterion</div>
                    <EqChip col={C.violet}>tau_f = c + mu_f * (sigma_n - P_f)</EqChip>
                    <EqChip col={C.rose}>slip when tau {'>='} tau_f</EqChip>
                    <EqChip col={C.gold}>Delta_P_crit = (tau - c) / mu_f - sigma_n + tau/mu_f</EqChip>
                    <div style={{ fontSize: 11, color: C.muted, marginTop: 8, fontFamily: "Inter, ui-sans-serif, system-ui, sans-serif" }}>
                      c = cohesion, mu_f = friction coefficient (0.6-0.85 Byerlee), sigma_n = normal stress, P_f = pore pressure
                    </div>
                  </div>
                  <div style={{ marginTop: 14 }}>
                    <div style={{ fontSize: 10, letterSpacing: "0.3em", textTransform: "uppercase", color: C.muted, marginBottom: 8 }}>current simulation parameters</div>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                      <SStat k="slip threshold P_f" v={mohrCrit} c={C.violet} />
                      <SStat k="fault friction mu" v={faultFriction.toFixed(2)} c={C.rose} />
                      <SStat k="est. magnitude" v={`M ${estMag}`} c={C.red} />
                      <SStat k="risk assessment" v={riskLevel} c={riskLevel === "HIGH" ? C.red : riskLevel === "MODERATE" ? C.amber : C.green} />
                    </div>
                  </div>
                </>
              )}

              {tab === "seismology" && (
                <>
                  <STitle col={C.cyan}>Exploration Seismology -- oil finds earthquakes find oil</STitle>
                  <SBody>
                    The oil industry pioneered <span style={{ color: C.cyan }}>reflection seismology</span>{" "}
                    in the 1920s to image subsurface structure. A controlled seismic source (vibroseis truck,
                    airgun, or explosive) sends acoustic waves into the earth; each rock interface reflects
                    a portion back. By recording arrival times on a geophone array, geophysicists reconstruct
                    3D velocity models that reveal{" "}
                    <span style={{ color: C.gold }}>anticlines, salt domes, and stratigraphic traps</span>{" "}
                    where hydrocarbons accumulate.
                  </SBody>
                  <div style={{ marginTop: 14 }}>
                    <div style={{ fontSize: 10, letterSpacing: "0.3em", textTransform: "uppercase", color: C.muted, marginBottom: 8 }}>reflection / refraction physics</div>
                    <EqChip col={C.cyan}>t(x) = sqrt(x2/Vrms2 + 4z2/Vrms2)</EqChip>
                    <EqChip col={C.gold}>R = (Z2-Z1)/(Z2+Z1)</EqChip>
                    <EqChip col={C.violet}>Snell: sin(i1)/V1 = sin(i2)/V2</EqChip>
                    <div style={{ fontSize: 11, color: C.muted, marginTop: 8, fontFamily: "Inter, ui-sans-serif, system-ui, sans-serif" }}>
                      Vrms = rms velocity, Z = acoustic impedance = rho*V, R = reflection coefficient
                    </div>
                  </div>
                  <div style={{ marginTop: 16, fontSize: 11.5, color: C.text, fontFamily: "Inter, ui-sans-serif, system-ui, sans-serif", lineHeight: 1.7 }}>
                    The same wave physics underlies natural earthquake seismology. Microseismic monitoring
                    during fracking borrows directly from exploration methods:{" "}
                    <span style={{ color: C.cyan }}>downhole geophone arrays</span> locate fracture events
                    to sub-meter precision. The irony: the industry built the world's most detailed
                    subsurface monitoring network, and it now shows exactly how much pressure it is
                    injecting into fault systems.
                  </div>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10, marginTop: 14 }}>
                    <SStat k="P-wave (sandstone)" v="2-4 km/s" c={C.cyan} />
                    <SStat k="P-wave (basement)" v="5-7 km/s" c={C.gold} />
                    <SStat k="3D survey density" v="~25m x 25m" c={C.violet} />
                  </div>
                </>
              )}
            </div>

            {/* phenomenon bars */}
            <div style={{ ...CARD, marginTop: 20, border: `1px solid ${C.border}`, borderRadius: 10, padding: 20, background: C.panel }}>
              <div style={{ fontSize: 10, letterSpacing: "0.4em", textTransform: "uppercase", marginBottom: 14, fontStyle: "italic", color: C.muted, fontFamily: "'Cinzel', ui-serif, Georgia, serif" }}>
                subsurface hazard indicators
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: 16 }}>
                <SBar label="injection pressure"   val={injRate}                           c={C.amber}  />
                <SBar label="pore pressure front"  val={injRate * diffusivity * 0.9}       c={C.red}    />
                <SBar label="fault proximity"      val={1 - faultFriction}                 c={C.violet} />
                <SBar label="seismic risk index"   val={injRate * (1 - faultFriction * 0.6)} c={C.rose} />
              </div>
            </div>
          </div>

          {/* right sidebar */}
          <aside style={{ ...CARD, border: `1px solid ${C.border}`, borderRadius: 10, padding: 20, background: C.panel, alignSelf: "start" }}>
            <div style={{ fontSize: 10, letterSpacing: "0.4em", textTransform: "uppercase", marginBottom: 16, fontStyle: "italic", color: C.muted, fontFamily: "'Cinzel', ui-serif, Georgia, serif" }}>
              telemetry
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              <SRow k="active lens"        v={activeTab.label}              c={activeTab.col} />
              <SRow k="inj rate"           v={injRate.toFixed(2)}           c={C.amber}  />
              <SRow k="diffusivity"        v={`${hydraulicD} m2/s`}         c={C.cyan}   />
              <SRow k="fault friction"     v={faultFriction.toFixed(2)}     c={C.violet} />
              <SRow k="slip threshold Pf"  v={mohrCrit}                     c={C.rose}   />
              <SRow k="inj depth (norm)"   v={injDepth.toFixed(2)}          c={C.gold}   />
              <SRow k="est. magnitude"     v={`M ${estMag}`}                c={C.red}    />
              <SRow k="seismic events"     v={`${eventCount}`}              c={C.red}    />
              <SRow k="risk level"         v={riskLevel} c={riskLevel === "HIGH" ? C.red : riskLevel === "MODERATE" ? C.amber : C.green} />
            </div>

            <div style={{ marginTop: 20, borderTop: `1px solid ${C.border}`, paddingTop: 16 }}>
              <div style={{ fontSize: 10, letterSpacing: "0.3em", textTransform: "uppercase", marginBottom: 10, color: C.muted }}>
                AETHER synthesis
              </div>
              <div style={{ fontSize: 11, lineHeight: 1.75, color: C.text, fontFamily: "Inter, ui-sans-serif, system-ui, sans-serif" }}>
                <p style={{ margin: "0 0 8px" }}>
                  The <span style={{ color: C.amber }}>oil industry's waste stream</span> is its seismic fingerprint.
                  Pore pressure spreads like a slow wave through permeable rock, reaching faults the operator never mapped.
                </p>
                <p style={{ margin: "0 0 8px" }}>
                  <span style={{ color: C.violet }}>Mohr-Coulomb mechanics</span> is indifferent to cause --
                  whether tectonics or a pump raises pore pressure, the fault responds the same way.
                </p>
                <p style={{ margin: 0 }}>
                  The same <span style={{ color: C.cyan }}>seismic imaging</span> the industry uses to find reservoirs
                  now documents exactly how deeply it has disturbed the basement.
                </p>
              </div>
            </div>

            <div style={{ marginTop: 20, borderTop: `1px solid ${C.border}`, paddingTop: 16 }}>
              <div style={{ fontSize: 10, letterSpacing: "0.3em", textTransform: "uppercase", marginBottom: 10, color: C.muted }}>
                case studies
              </div>
              {[
                { name: "Prague, OK -- M5.6", year: "2011", col: C.red,    note: "Linked to nearby SWD well" },
                { name: "Pawnee, OK -- M5.8", year: "2016", col: C.red,    note: "Largest induced event, OK" },
                { name: "Cushing, OK -- M5.0", year: "2016", col: C.orange, note: "Near major oil hub" },
                { name: "Fox Creek, AB -- M4.6", year: "2015", col: C.amber, note: "Directly linked to fracking" },
                { name: "Azle, TX -- M3.6",   year: "2013", col: C.gold,   note: "SWD + fault network" },
              ].map((cs, i) => (
                <div key={i} style={{ marginBottom: 10, paddingBottom: 10, borderBottom: i < 4 ? `1px solid ${C.border}` : "none" }}>
                  <div style={{ fontSize: 11, color: cs.col, fontFamily: "JetBrains Mono, ui-monospace, monospace" }}>{cs.name}</div>
                  <div style={{ fontSize: 10, color: C.muted, marginTop: 2 }}>{cs.year} -- {cs.note}</div>
                </div>
              ))}
            </div>
          </aside>
        </div>

        {/* bottom synthesis block */}
        <div style={{ ...CARD, marginTop: 24, border: `1px solid ${C.border}`, borderRadius: 10, padding: 24, background: C.panel }}>
          <div style={{ fontSize: 10, letterSpacing: "0.4em", textTransform: "uppercase", marginBottom: 16, fontStyle: "italic", color: C.muted, fontFamily: "'Cinzel', ui-serif, Georgia, serif" }}>
            AETHER knowledge synthesis -- what this means
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 20 }}>
            {[
              {
                title: "Pressure as a weapon, accidentally",
                col: C.red,
                body: "Produced water disposal is economically essential -- without it, oil production costs would spike sharply. But injecting billions of barrels into basement-adjacent formations is, in effect, lubricating ancient fault systems. The industry did not intend to cause earthquakes; it simply did not model what happens when you raise pore pressure across thousands of square kilometers of crystalline basement.",
              },
              {
                title: "Regulatory fragmentation as amplifier",
                col: C.amber,
                body: "Class II well permits in the US are issued by state agencies with varying seismic review requirements. Oklahoma's surge forced the OCC to develop traffic-light protocols -- but only after 900+ events in 2015. The lag between cause and regulatory response is itself a function of how slowly pressure diffuses: events appear months to years after injection begins, making causal attribution politically deniable.",
              },
              {
                title: "The monitoring paradox",
                col: C.cyan,
                body: "The oil and gas industry has deployed the most comprehensive subsurface monitoring network in history -- 3D seismic surveys, microseismic arrays, downhole gauges. This network was built to find hydrocarbons. It now provides unprecedented evidence of anthropogenic fault perturbation. AETHER frames this as coherence collapse: the instruments designed to extract value are also the instruments that measure the cost.",
              },
            ].map((blk, i) => (
              <div key={i}>
                <div style={{ fontSize: 12, letterSpacing: "0.05em", color: blk.col, fontFamily: "Cinzel, ui-serif, Georgia, serif", marginBottom: 8 }}>{blk.title}</div>
                <div style={{ fontSize: 11.5, lineHeight: 1.75, color: C.text, fontFamily: "Inter, ui-sans-serif, system-ui, sans-serif" }}>{blk.body}</div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}
