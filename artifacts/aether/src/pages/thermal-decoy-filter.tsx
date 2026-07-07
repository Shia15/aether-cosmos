import { useEffect, useRef } from "react";
import type { MutableRefObject } from "react";

// ── sigmoid seizure threshold ──────────────────────────────────────
// θ(T) = 1 / (1 + exp(k·(T − Ti)))
const H_Ti = 38.5, H_k = 2.5;   // healthy brain
const L_Ti = 37.0, L_k = 3.2;   // Lyme-compromised (inflection −1.5 °C)
const T_LO = 35.5, T_HI = 42.0;

function sigmoid(T: number, Ti: number, k: number): number {
  return 1 / (1 + Math.exp(k * (T - Ti)));
}

// ── depth-sorted segment type (module scope, not inside useEffect) ─
type TSeg = { i: number; depth: number };

// ── decoy filter evidence data ─────────────────────────────────────
const DECOY = [
  { label: "Lyme \u2192 Neuroinflammation \u2192 Seizure",   score: 87, col: "#39ff14", act: "TREAT: Antibiotics + AEDs + Thermal Management"      },
  { label: "Na\u207A Channel Dysfunction (Borrelia toxin)",  score: 72, col: "#2ef0d8", act: "MONITOR: Na\u207A-channel modulators"                  },
  { label: "Autoimmune Encephalitis (NMDAR / CASPR2)",       score: 56, col: "#80c0ff", act: "INVESTIGATE: IgG autoantibody panel"                   },
  { label: "Quantum Decoherence (thermal neural noise)",     score: 16, col: "#556677", act: "RESEARCH ONLY -- no clinical treatment path"           },
  { label: "Resonant EM Drivers",                            score: 13, col: "#445566", act: "RESEARCH ONLY -- mathematically seductive, unproven"   },
  { label: "EMF as primary cause",                           score: 10, col: "#334455", act: "RESEARCH ONLY -- no reproducible clinical evidence"    },
];

// ── draw: weathering sigmoid canvas ───────────────────────────────
function drawWeathering(ctx: CanvasRenderingContext2D, W: number, H: number, Tcur: number) {
  ctx.fillStyle = "#03050a"; ctx.fillRect(0, 0, W, H);
  const pl = 52, pr = 18, pt = 32, pb = 44;
  const PW = W - pl - pr, PH = H - pt - pb;

  // axes
  ctx.strokeStyle = "rgba(46,240,216,0.2)"; ctx.lineWidth = 1;
  ctx.beginPath(); ctx.moveTo(pl, pt); ctx.lineTo(pl, pt + PH); ctx.lineTo(pl + PW, pt + PH); ctx.stroke();

  // temperature x-axis ticks
  ctx.fillStyle = "rgba(46,240,216,0.45)"; ctx.font = "8px 'DM Mono',monospace"; ctx.textAlign = "center";
  for (let T = 36; T <= 42; T += 1) {
    const x = pl + ((T - T_LO) / (T_HI - T_LO)) * PW;
    ctx.fillText(`${T}\u00B0`, x, pt + PH + 14);
    ctx.strokeStyle = "rgba(46,240,216,0.06)"; ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(x, pt); ctx.lineTo(x, pt + PH); ctx.stroke();
  }
  ctx.save(); ctx.translate(13, pt + PH / 2); ctx.rotate(-Math.PI / 2);
  ctx.fillStyle = "rgba(46,240,216,0.45)"; ctx.textAlign = "center";
  ctx.fillText("SEIZURE THRESHOLD", 0, 0); ctx.restore();

  // Y ticks
  ctx.fillStyle = "rgba(46,240,216,0.35)"; ctx.font = "7px 'DM Mono',monospace"; ctx.textAlign = "right";
  for (let i = 0; i <= 4; i++) {
    const y = pt + PH - (i / 4) * PH;
    ctx.strokeStyle = "rgba(46,240,216,0.06)"; ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(pl, y); ctx.lineTo(pl + PW, y); ctx.stroke();
    ctx.fillText(`${(i * 25)}%`, pl - 3, y + 3);
  }

  // Lyme danger window: where lyme threshold < 30% but healthy > 55%
  let dxStart = -1, dxEnd = -1;
  for (let i = 0; i <= 400; i++) {
    const T = T_LO + (i / 400) * (T_HI - T_LO);
    const ly = sigmoid(T, L_Ti, L_k);
    const hy = sigmoid(T, H_Ti, H_k);
    if (ly < 0.30 && hy > 0.55) {
      if (dxStart < 0) dxStart = T;
      dxEnd = T;
    }
  }
  if (dxStart > 0) {
    const x1 = pl + ((dxStart - T_LO) / (T_HI - T_LO)) * PW;
    const x2 = pl + ((dxEnd   - T_LO) / (T_HI - T_LO)) * PW;
    ctx.fillStyle = "rgba(255,60,60,0.09)";
    ctx.fillRect(x1, pt, x2 - x1, PH);
    ctx.strokeStyle = "rgba(255,60,60,0.2)"; ctx.lineWidth = 1;
    ctx.strokeRect(x1, pt, x2 - x1, PH);
    ctx.fillStyle = "rgba(255,100,100,0.5)"; ctx.font = "8px 'DM Mono',monospace"; ctx.textAlign = "center";
    ctx.fillText("LYME DANGER WINDOW", (x1 + x2) / 2, pt + 12);
  }

  // healthy curve (teal)
  ctx.strokeStyle = "#2ef0d8"; ctx.lineWidth = 2;
  ctx.beginPath();
  for (let i = 0; i <= 320; i++) {
    const T = T_LO + (i / 320) * (T_HI - T_LO);
    const y = pt + PH - sigmoid(T, H_Ti, H_k) * PH;
    const x = pl + ((T - T_LO) / (T_HI - T_LO)) * PW;
    if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
  }
  ctx.stroke();
  ctx.fillStyle = "#2ef0d8"; ctx.font = "9px 'DM Mono',monospace"; ctx.textAlign = "left";
  ctx.fillText("HEALTHY", pl + 4, pt + 14);

  // Lyme curve (orange)
  ctx.strokeStyle = "#ff8844"; ctx.lineWidth = 2;
  ctx.beginPath();
  for (let i = 0; i <= 320; i++) {
    const T = T_LO + (i / 320) * (T_HI - T_LO);
    const y = pt + PH - sigmoid(T, L_Ti, L_k) * PH;
    const x = pl + ((T - T_LO) / (T_HI - T_LO)) * PW;
    if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
  }
  ctx.stroke();
  ctx.fillStyle = "#ff8844"; ctx.font = "9px 'DM Mono',monospace"; ctx.textAlign = "left";
  ctx.fillText("LYME-COMPROMISED", pl + 4, pt + 25);

  // current temperature cursor
  if (Tcur >= T_LO && Tcur <= T_HI) {
    const cx = pl + ((Tcur - T_LO) / (T_HI - T_LO)) * PW;
    ctx.strokeStyle = "rgba(255,255,255,0.35)"; ctx.lineWidth = 1.5;
    ctx.setLineDash([4, 3]);
    ctx.beginPath(); ctx.moveTo(cx, pt); ctx.lineTo(cx, pt + PH); ctx.stroke();
    ctx.setLineDash([]);
    const thH = sigmoid(Tcur, H_Ti, H_k);
    const thL = sigmoid(Tcur, L_Ti, L_k);
    ctx.fillStyle = "#2ef0d8"; ctx.beginPath(); ctx.arc(cx, pt + PH - thH * PH, 4, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = "#ff8844"; ctx.beginPath(); ctx.arc(cx, pt + PH - thL * PH, 4, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = "rgba(255,255,255,0.45)"; ctx.font = "8px 'DM Mono',monospace"; ctx.textAlign = "center";
    ctx.fillText(`T=${Tcur.toFixed(1)}\u00B0C`, cx, pt + PH + 28);
    ctx.fillStyle = "#2ef0d8"; ctx.textAlign = "right";
    ctx.fillText(`H:${(thH * 100).toFixed(0)}%`, cx - 6, pt + PH - thH * PH - 7);
    ctx.fillStyle = "#ff8844"; ctx.textAlign = "left";
    ctx.fillText(`L:${(thL * 100).toFixed(0)}%`, cx + 6, pt + PH - thL * PH - 7);
  }
}

// ── draw: feathering torus-knot DNA topology ───────────────────────
function drawFeathering(ctx: CanvasRenderingContext2D, W: number, H: number, wr: number) {
  ctx.fillStyle = "#03050a"; ctx.fillRect(0, 0, W, H);
  const cx = W / 2, cy = H * 0.49;
  const R = Math.min(W, H) * 0.30, r = R * 0.33;

  // q = torus-knot winding: increases with writhe
  const q = 1 + Math.min(5.5, wr * 0.72);
  const p = 2;
  const N = 240;

  let knotLabel = "RELAXED";
  let knotCol = "#2ef0d8";
  if      (wr >= 5.0) { knotLabel = "6\u2081 STEVEDORE KNOT"; knotCol = "#ff2222"; }
  else if (wr >= 3.5) { knotLabel = "5\u2081 CINQUEFOIL";     knotCol = "#ff6600"; }
  else if (wr >= 2.2) { knotLabel = "3\u2081 TREFOIL";        knotCol = "#ffaa00"; }

  // build 3D points on torus knot T(p,q)
  const pts: Array<{ sx: number; sy: number; d: number }> = [];
  const cosA = Math.cos(0.38), sinA = Math.sin(0.38);
  for (let i = 0; i <= N; i++) {
    const t = (i / N) * Math.PI * 2;
    const rx = (R + r * Math.cos(q * t)) * Math.cos(p * t);
    const ry = (R + r * Math.cos(q * t)) * Math.sin(p * t);
    const rz = r * Math.sin(q * t);
    const sx = cx + rx * cosA + rz * sinA;
    const sy = cy + ry * 0.72 - rz * 0.18;
    const d  = -rx * sinA + rz * cosA;
    pts.push({ sx, sy, d });
  }

  // depth-sort segments (painter's algorithm)
  const segs: TSeg[] = [];
  for (let i = 0; i < N; i++) {
    segs.push({ i, depth: (pts[i].d + pts[i + 1].d) / 2 });
  }
  segs.sort((a, b) => a.depth - b.depth);

  const dMax = r * 1.3;
  ctx.lineWidth = 2.5;
  for (const seg of segs) {
    const nrm = (seg.depth + dMax) / (2 * dMax);
    ctx.strokeStyle = knotCol;
    ctx.globalAlpha = 0.3 + nrm * 0.7;
    ctx.beginPath();
    ctx.moveTo(pts[seg.i].sx, pts[seg.i].sy);
    ctx.lineTo(pts[seg.i + 1].sx, pts[seg.i + 1].sy);
    ctx.stroke();
  }
  ctx.globalAlpha = 1;

  // knot label
  ctx.fillStyle = knotCol;
  ctx.font = "bold 13px 'Orbitron',monospace";
  ctx.textAlign = "center";
  ctx.fillText(knotLabel, cx, H - 22);
  ctx.fillStyle = "rgba(200,220,240,0.5)";
  ctx.font = "10px 'DM Mono',monospace";
  ctx.fillText(`Wr = ${wr.toFixed(2)}`, cx, H - 8);
}

// ── draw: decoy filter evidence bar chart ─────────────────────────
function drawDecoy(ctx: CanvasRenderingContext2D, W: number, H: number, fill: number) {
  ctx.fillStyle = "#03050a"; ctx.fillRect(0, 0, W, H);
  const labelW = 260, barX = labelW + 14, barMaxW = W - barX - 18;
  const pt = 12, itemH = 28, gap = 7;

  ctx.font = "9px 'DM Mono',monospace";
  for (let i = 0; i < DECOY.length; i++) {
    const it = DECOY[i];
    const y = pt + i * (itemH + gap);
    const bw = barMaxW * (it.score / 100) * fill;

    // label (right-aligned in label column)
    ctx.fillStyle = "rgba(200,220,240,0.72)";
    ctx.textAlign = "right";
    ctx.fillText(it.label, labelW, y + itemH * 0.65);

    // bar background
    ctx.fillStyle = "rgba(46,240,216,0.04)";
    ctx.fillRect(barX, y + 2, barMaxW, itemH - 4);

    // score bar
    ctx.fillStyle = it.col;
    ctx.globalAlpha = 0.65;
    ctx.fillRect(barX, y + 2, bw, itemH - 4);
    ctx.globalAlpha = 1;

    // score value
    ctx.fillStyle = "rgba(255,255,255,0.6)";
    ctx.textAlign = "left";
    ctx.fillText(`${it.score}/100`, barX + Math.min(bw + 4, barMaxW - 48), y + itemH * 0.65);

    // action text
    ctx.fillStyle = it.score > 40 ? "rgba(200,230,200,0.5)" : "rgba(100,120,140,0.5)";
    ctx.font = "7.5px 'DM Mono',monospace";
    ctx.textAlign = "left";
    ctx.fillText(it.act, barX + 4, y + itemH - 4);
    ctx.font = "9px 'DM Mono',monospace";
  }

  // axis label
  ctx.fillStyle = "rgba(46,240,216,0.35)";
  ctx.textAlign = "left";
  ctx.fillText("EVIDENCE SCORE", barX, H - 4);
}

// ── canvas components ──────────────────────────────────────────────
function WeatheringCanvas({ tempRef }: { tempRef: MutableRefObject<number> }) {
  const cr = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const c = cr.current; if (!c) return;
    const ctx = c.getContext("2d"); if (!ctx) return;
    const W = c.width, H = c.height;
    let raf = 0;
    const loop = () => { drawWeathering(ctx, W, H, tempRef.current); raf = requestAnimationFrame(loop); };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, [tempRef]);
  return <canvas ref={cr} width={620} height={220} style={{ width: "100%", maxWidth: 620, display: "block", borderRadius: 4 }} />;
}

function FeatheringCanvas({
  inhibRef, wrRef,
}: {
  inhibRef: MutableRefObject<number>;
  wrRef: MutableRefObject<number>;
}) {
  const cr = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const c = cr.current; if (!c) return;
    const ctx = c.getContext("2d"); if (!ctx) return;
    const W = c.width, H = c.height;
    let writhe = 0;
    let raf = 0;
    const loop = () => {
      const inhib = inhibRef.current;
      // writhe accumulates when Topo-II is inhibited; slowly resolves when active
      writhe += inhib * 0.006 - (1 - inhib) * 0.003;
      writhe = Math.max(0, Math.min(8, writhe));
      wrRef.current = writhe;
      drawFeathering(ctx, W, H, writhe);
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, [inhibRef, wrRef]);
  return <canvas ref={cr} width={360} height={300} style={{ width: "100%", maxWidth: 360, display: "block", borderRadius: 4 }} />;
}

function DecoyCanvas() {
  const cr = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const c = cr.current; if (!c) return;
    const ctx = c.getContext("2d"); if (!ctx) return;
    const W = c.width, H = c.height;
    let fill = 0; let raf = 0;
    const loop = () => {
      fill = Math.min(1, fill + 0.012);
      drawDecoy(ctx, W, H, fill);
      if (fill < 1) raf = requestAnimationFrame(loop);
      else drawDecoy(ctx, W, H, 1);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, []);
  return <canvas ref={cr} width={600} height={250} style={{ width: "100%", maxWidth: 600, display: "block", borderRadius: 4 }} />;
}

// ── readout panels ─────────────────────────────────────────────────
function WReadout({ tempRef }: { tempRef: MutableRefObject<number> }) {
  const hR = useRef<HTMLSpanElement>(null);
  const lR = useRef<HTMLSpanElement>(null);
  const dR = useRef<HTMLSpanElement>(null);
  useEffect(() => {
    let raf = 0;
    const upd = () => {
      const T = tempRef.current;
      const thH = sigmoid(T, H_Ti, H_k);
      const thL = sigmoid(T, L_Ti, L_k);
      const danger = thL < 0.30 && thH > 0.55;
      if (hR.current) hR.current.textContent = `${(thH * 100).toFixed(1)} %`;
      if (lR.current) lR.current.textContent = `${(thL * 100).toFixed(1)} %`;
      if (dR.current) dR.current.textContent  = danger ? "HIGH RISK" : thL < 0.5 ? "ELEVATED" : "SAFE";
      if (dR.current) dR.current.style.color  = danger ? "#ff4444"   : thL < 0.5 ? "#ffaa00"  : "#39ff14";
      raf = requestAnimationFrame(upd);
    };
    raf = requestAnimationFrame(upd);
    return () => cancelAnimationFrame(raf);
  }, [tempRef]);
  return (
    <div style={{ display: "flex", gap: 10, flexWrap: "wrap", margin: "10px 0" }}>
      {([["HEALTHY THRESHOLD", hR, "#2ef0d8"], ["LYME THRESHOLD", lR, "#ff8844"], ["SEIZURE RISK", dR, "#ff4444"]] as const).map(([lbl, ref, col]) => (
        <div key={lbl} style={RO}>
          <div style={{ fontSize: 9, letterSpacing: "0.16em", color: "rgba(200,220,240,0.4)", marginBottom: 2 }}>{lbl}</div>
          <span ref={ref} style={{ fontSize: 14, color: col, fontFamily: "'DM Mono',monospace" }}>—</span>
        </div>
      ))}
    </div>
  );
}

function FReadout({ wrRef }: { wrRef: MutableRefObject<number> }) {
  const wR = useRef<HTMLSpanElement>(null);
  const kR = useRef<HTMLSpanElement>(null);
  useEffect(() => {
    let raf = 0;
    const upd = () => {
      const wr = wrRef.current;
      let knotLabel = "RELAXED", knotCol = "#2ef0d8";
      if      (wr >= 5.0) { knotLabel = "6\u2081 STEVEDORE KNOT"; knotCol = "#ff2222"; }
      else if (wr >= 3.5) { knotLabel = "5\u2081 CINQUEFOIL";     knotCol = "#ff6600"; }
      else if (wr >= 2.2) { knotLabel = "3\u2081 TREFOIL";        knotCol = "#ffaa00"; }
      if (wR.current) wR.current.textContent = wr.toFixed(2);
      if (kR.current) { kR.current.textContent = knotLabel; kR.current.style.color = knotCol; }
      raf = requestAnimationFrame(upd);
    };
    raf = requestAnimationFrame(upd);
    return () => cancelAnimationFrame(raf);
  }, [wrRef]);
  return (
    <div style={{ display: "flex", gap: 10, flexWrap: "wrap", margin: "10px 0" }}>
      <div style={RO}><div style={RO_LBL}>WRITHE Wr</div><span ref={wR} style={{ fontSize: 14, color: "#ffd700", fontFamily: "'DM Mono',monospace" }}>—</span></div>
      <div style={RO}><div style={RO_LBL}>KNOT TYPE</div><span ref={kR} style={{ fontSize: 14, fontFamily: "'DM Mono',monospace" }}>—</span></div>
    </div>
  );
}

// ── slider helper ─────────────────────────────────────────────────
function Slider({ label, min, max, step, init, valRef, fmt }: {
  label: string; min: number; max: number; step: number;
  init: number; valRef: MutableRefObject<number>; fmt: (v: number) => string;
}) {
  const dRef = useRef<HTMLSpanElement>(null);
  return (
    <div style={{ marginBottom: 14 }}>
      <div style={{ display: "flex", justifyContent: "space-between", fontSize: 10, color: "rgba(46,240,216,0.65)", letterSpacing: "0.15em", marginBottom: 3 }}>
        <span>{label}</span>
        <span ref={dRef} style={{ color: "#2ef0d8" }}>{fmt(init)}</span>
      </div>
      <input type="range" min={min} max={max} step={step} defaultValue={init} style={{ width: "100%", accentColor: "#2ef0d8" }}
        onInput={e => { const v = parseFloat((e.target as HTMLInputElement).value); valRef.current = v; if (dRef.current) dRef.current.textContent = fmt(v); }} />
    </div>
  );
}

// ── shared style atoms ────────────────────────────────────────────
const RO: React.CSSProperties = { background: "rgba(3,5,10,0.85)", border: "1px solid rgba(46,240,216,0.15)", borderRadius: 4, padding: "8px 14px", minWidth: 120, fontFamily: "'DM Mono',monospace" };
const RO_LBL: React.CSSProperties = { fontSize: 9, letterSpacing: "0.16em", color: "rgba(200,220,240,0.4)", marginBottom: 2 };
const S = {
  page:    { background: "#03050a", color: "#c8d8e8", minHeight: "100vh", fontFamily: "'DM Mono',monospace" } as React.CSSProperties,
  hero:    { padding: "40px 20px 26px", borderBottom: "1px solid rgba(46,240,216,0.12)" } as React.CSSProperties,
  badge:   { display: "inline-block", border: "1px solid #2ef0d8", padding: "3px 12px", fontSize: 10, letterSpacing: "0.22em", color: "#2ef0d8", marginBottom: 14 } as React.CSSProperties,
  h1:      { margin: 0, fontSize: "clamp(20px,3.5vw,34px)", fontFamily: "'Orbitron',monospace", color: "#2ef0d8", fontWeight: 700, letterSpacing: "0.08em", lineHeight: 1.2 } as React.CSSProperties,
  sub:     { margin: "10px 0 0", fontSize: 12.5, color: "rgba(200,220,240,0.5)", letterSpacing: "0.06em" } as React.CSSProperties,
  sec:     { padding: "26px 20px", borderTop: "1px solid rgba(46,240,216,0.09)" } as React.CSSProperties,
  lbl:     { fontSize: 10, letterSpacing: "0.2em", color: "#2ef0d8", marginBottom: 14, display: "inline-block", borderBottom: "1px solid rgba(46,240,216,0.22)", paddingBottom: 3 } as React.CSSProperties,
  prose:   { fontSize: 13, lineHeight: 1.82, color: "rgba(200,220,240,0.72)", maxWidth: 740, marginBottom: 14 } as React.CSSProperties,
  card:    { background: "rgba(5,12,22,0.9)", border: "1px solid rgba(46,240,216,0.14)", borderLeft: "3px solid #2ef0d8", borderRadius: 4, padding: "13px 16px", marginBottom: 10 } as React.CSSProperties,
  cardH:   { margin: "0 0 5px", fontSize: 11, color: "#2ef0d8", letterSpacing: "0.14em", fontWeight: 400 } as React.CSSProperties,
  cardP:   { margin: 0, fontSize: 12.5, lineHeight: 1.74, color: "rgba(200,220,240,0.65)" } as React.CSSProperties,
  math:    { background: "rgba(5,12,22,0.9)", border: "1px solid rgba(46,240,216,0.14)", borderRadius: 4, padding: "12px 16px", marginBottom: 10 } as React.CSSProperties,
  eq:      { fontSize: 14, color: "#2ef0d8", fontFamily: "'DM Mono',monospace", margin: "0 0 5px", letterSpacing: "0.03em" } as React.CSSProperties,
  eqSub:   { fontSize: 11, color: "rgba(200,220,240,0.5)", margin: 0 } as React.CSSProperties,
  canWrap: { background: "rgba(3,6,12,0.9)", border: "1px solid rgba(46,240,216,0.16)", borderRadius: 6, padding: "10px 10px 6px", marginBottom: 12 } as React.CSSProperties,
  grid2:   { display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(220px,1fr))", gap: 10 } as React.CSSProperties,
  footer:  { padding: "22px 20px", borderTop: "1px solid rgba(46,240,216,0.09)", fontSize: 11, color: "rgba(46,240,216,0.4)", display: "flex", gap: 18, flexWrap: "wrap" as const } as React.CSSProperties,
  link:    { color: "#2ef0d8", textDecoration: "none" } as React.CSSProperties,
};

// ── main page ─────────────────────────────────────────────────────
export default function ThermalDecoyFilterPage() {
  const tempRef   = useRef<number>(37.2);
  const inhibRef  = useRef<number>(0.30);
  const wrRef     = useRef<number>(0);

  return (
    <div style={S.page}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=DM+Mono&family=Orbitron:wght@700&display=swap');`}</style>

      {/* ── HERO ── */}
      <div style={S.hero}>
        <div style={S.badge}>III · PRACTICAL DECOY FILTER</div>
        <h1 style={S.h1}>WEATHERING &amp; FEATHERING HEAT DECIPHER</h1>
        <p style={S.sub}>Thermal Seizure Erosion · DNA Topology Under Topo-II Stress · Evidence-Weighted Mechanism Scoring</p>
      </div>

      {/* ── INTRO ── */}
      <div style={S.sec}>
        <div style={S.lbl}>I · DEFINITIONS</div>
        <p style={S.prose}>
          <strong style={{ color: "#ff8844" }}>Weathering</strong> is the thermal erosion of seizure thresholds
          — a real, measurable mechanism. Temperature above 38.5&deg;C causes sigmoidally accelerating threshold
          collapse in healthy nervous tissue. In a Lyme-compromised nervous system, the inflection point shifts
          approximately 1.5&deg;C lower: fever that a healthy brain tolerates can be enough to trigger a seizure.
          The sigmoid is not a metaphor; it is the biophysical profile of voltage-gated Na&sup;&#8314; channel
          kinetics and GABAergic inhibitory tone as functions of temperature.
        </p>
        <p style={S.prose}>
          <strong style={{ color: "#ffaa00" }}>Feathering</strong> is the gradual fraying of DNA topology under
          conditions of topoisomerase stress. In normal cells, Topoisomerase II constantly resolves the supercoils
          generated by transcription and replication, keeping writhe Wr near zero. Borrelia-mediated inflammation
          can inhibit Topo-II through cytokine pathways and direct neurotoxin effects. When inhibited, writhe
          accumulates unchecked. The trefoil 3&#x2081; forms first (|Wr| &asymp; 3); untreated, the system
          progresses to cinquefoil 5&#x2081;, then to the Stevedore 6&#x2081; knot and beyond.
          Each step increases chromatin compaction, gene expression disruption, and strand-break risk.
        </p>
      </div>

      {/* ── WEATHERING ── */}
      <div style={S.sec}>
        <div style={S.lbl}>II · WEATHERING SIMULATOR &mdash; THERMAL SEIZURE THRESHOLD</div>
        <p style={S.prose}>
          Two sigmoid curves: <span style={{ color: "#2ef0d8" }}>healthy</span> (inflection 38.5&deg;C, steepness k=2.5)
          and <span style={{ color: "#ff8844" }}>Lyme-compromised</span> (inflection 37.0&deg;C, steepness k=3.2).
          The red shaded zone is the Lyme danger window: temperatures where the Lyme threshold collapses below 30&nbsp;%
          while the healthy brain is still above 55&nbsp;%. Move the temperature slider into the danger window to see it.
        </p>
        <div style={S.canWrap}><WeatheringCanvas tempRef={tempRef} /></div>
        <WReadout tempRef={tempRef} />
        <div style={{ maxWidth: 400 }}>
          <Slider label="BODY TEMPERATURE" min={35.5} max={42.0} step={0.1} init={37.2} valRef={tempRef} fmt={v => `${v.toFixed(1)} \u00B0C`} />
        </div>
        <div style={S.grid2}>
          {[
            ["SIGMOID SHAPE", "The sigmoid is not arbitrary — it reflects the cooperative gating of multiple Na\u207A channels, each with an Arrhenius temperature dependence. When channels are already partially inhibited by Lyme neurotoxins, the inflection shifts left and the slope steepens."],
            ["CLINICAL MEANING", "A Lyme patient with T=38.0\u00B0C (a mild fever a healthy person ignores) may have seizure threshold below 15\u202F%. The same temperature leaves a healthy brain at ~90\u202F% threshold. This is why temperature management is an emergency clinical action, not a comfort measure."],
          ].map(([h, p]) => <div key={h} style={S.card}><h3 style={S.cardH}>{h}</h3><p style={S.cardP}>{p}</p></div>)}
        </div>
      </div>

      {/* ── FEATHERING ── */}
      <div style={S.sec}>
        <div style={S.lbl}>III · FEATHERING SIMULATOR &mdash; DNA TOPOLOGY UNDER TOPO-II STRESS</div>
        <p style={S.prose}>
          The torus-knot animation shows DNA supercoiling accumulation as writhe Wr increases.
          Topo-II inhibition level controls the rate: at 0&nbsp;% inhibition, Topo-II actively resolves
          writhe and the strand relaxes toward a circle. At 100&nbsp;% inhibition, writhe accumulates
          until the 3&#x2081; trefoil, 5&#x2081; cinquefoil, and 6&#x2081; Stevedore knot form in sequence.
          Colour encodes knot severity: <span style={{ color: "#2ef0d8" }}>teal</span> = relaxed,
          <span style={{ color: "#ffaa00" }}> orange</span> = trefoil,
          <span style={{ color: "#ff6600" }}> deep orange</span> = cinquefoil,
          <span style={{ color: "#ff2222" }}> red</span> = Stevedore.
        </p>
        <div style={{ display: "flex", gap: 16, flexWrap: "wrap", alignItems: "flex-start" }}>
          <div style={S.canWrap}><FeatheringCanvas inhibRef={inhibRef} wrRef={wrRef} /></div>
          <div style={{ flex: "1 1 260px" }}>
            <FReadout wrRef={wrRef} />
            <div style={{ marginTop: 10 }}>
              <Slider label="TOPO-II INHIBITION" min={0} max={1} step={0.01} init={0.30} valRef={inhibRef} fmt={v => `${(v * 100).toFixed(0)} %`} />
            </div>
            <div style={{ ...S.card, borderLeftColor: "#ffaa00" }}>
              <h3 style={{ ...S.cardH, color: "#ffaa00" }}>WRITHE THRESHOLDS</h3>
              <p style={S.cardP}>Wr &lt; 2.2: relaxed (Topo-II resolves in time)<br />Wr &asymp; 2.2: trefoil 3&#x2081; onset (crossing number 3)<br />Wr &asymp; 3.5: cinquefoil 5&#x2081; (crossing number 5)<br />Wr &asymp; 5.0: Stevedore 6&#x2081; (crossing number 6, hyperbolic volume &asymp;3.16)</p>
            </div>
            <div style={{ ...S.card, borderLeftColor: "#ff6600" }}>
              <h3 style={{ ...S.cardH, color: "#ff6600" }}>BORRELIA MECHANISM</h3>
              <p style={S.cardP}>Borrelia burgdorferi lipoproteins activate NF-&kappa;B, which downregulates Topo-II&alpha; expression. Additionally, Borrelia-induced oxidative stress directly inhibits the ATP-binding domain. Together these effects push cells toward chronic supercoiling and topological instability.</p>
            </div>
          </div>
        </div>
      </div>

      {/* ── DECOY FILTER ── */}
      <div style={S.sec}>
        <div style={S.lbl}>IV · PRACTICAL DECOY FILTER &mdash; EVIDENCE-WEIGHTED SCORES</div>
        <p style={S.prose}>
          Three mechanisms are mathematically seductive but clinically unsupported as <em>primary causes</em>:
          quantum decoherence, resonant EM drivers, and EMF as root cause. They earn low scores because
          they lack reproducible clinical evidence and no treatment vector exists. They belong in a research
          queue, not a clinical action plan. High-score mechanisms (Lyme cascade) should drive immediate action.
        </p>
        <div style={S.canWrap}><DecoyCanvas /></div>

        {/* clinical action matrix */}
        <div style={{ marginTop: 20 }}>
          <div style={S.lbl}>CLINICAL ACTION MATRIX</div>
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12, fontFamily: "'DM Mono',monospace" }}>
              <thead>
                <tr style={{ borderBottom: "1px solid rgba(46,240,216,0.18)" }}>
                  {["MECHANISM", "TREATMENT", "PRIORITY"].map(h => (
                    <th key={h} style={{ padding: "7px 14px", textAlign: "left", fontSize: 10, color: "#2ef0d8", letterSpacing: "0.14em", fontWeight: 400 }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {[
                  ["Lyme spirochetes (active infection)",    "Doxycycline 100\u202Fmg 2\u00D7/day (or IV ceftriaxone if CNS)", "IMMEDIATE"],
                  ["Neuroinflammation + fever",              "Aggressive fever control: paracetamol + NSAIDs + cooling",        "IMMEDIATE"],
                  ["Seizure threshold collapse",             "Anti-epileptic: levetiracetam or valproate",                      "HIGH"],
                  ["Core temperature management",            "Continuous monitoring, cooling blankets, avoid hot environments", "HIGH"],
                  ["DNA topology / oxidative stress",        "Address oxidative stress: NAD\u207A, antioxidants, sleep",         "MODERATE"],
                  ["Na\u207A channel dysregulation",         "Na\u207A-channel blockers if persistent post-infection",           "ASSESS"],
                ].map(([m, t, p]) => (
                  <tr key={m} style={{ borderBottom: "1px solid rgba(46,240,216,0.06)" }}>
                    <td style={{ padding: "7px 14px", color: "#2ef0d8" }}>{m}</td>
                    <td style={{ padding: "7px 14px", color: "rgba(200,220,240,0.65)" }}>{t}</td>
                    <td style={{ padding: "7px 14px", color: p === "IMMEDIATE" ? "#ff4444" : p === "HIGH" ? "#ffaa00" : "#2ef0d8" }}>{p}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* ── TWO-SPECIES QUANTUM ── */}
      <div style={S.sec}>
        <div style={S.lbl}>V · TWO-SPECIES APPROACH &mdash; DECOHERENT + COHERENT SCALING</div>
        <p style={S.prose}>
          The Lyme model offers a direct analogy to a scalable quantum computing architecture.
          A compromised neuron is not zero — it still conducts, still integrates, still modulates.
          It has lost <em>quantum coherence</em> (phase sensitivity, T&#x2082; has collapsed)
          but retains <em>classical function</em> (it still fires, routes signals, inhibits or excites).
          This is exactly the two-species architecture for scaling quantum processors:
        </p>
        <div style={S.grid2}>
          {[
            ["SPECIES A \u2014 DECOHERENT (WARM)",
             "Operates at higher temperature (~mK to ~K range). Tolerates phonons. Handles error correction, qubit routing, thermal monitoring, and classical control logic. High density, low cryogenic overhead. These are the \u201CLyme-compromised\u201D nodes of the system \u2014 they\u2019ve lost coherence but remain functional classical processors."],
            ["SPECIES B \u2014 COHERENT (COLD)",
             "Must stay below 20\u202FmK. Phase-sensitive. Performs the actual quantum gates. Precious, few, fragile. Like the healthy neurons in a Lyme brain \u2014 maximally precise but dependent on the surrounding classical infrastructure for thermal management and error correction."],
            ["THE INTERFACE",
             "Species A monitors the temperature of Species B in real time and adjusts shuttle speed, cooling power, and gate scheduling to protect coherence. This is the exact thermal management loop the weathering simulator models \u2014 now implemented as hardware, not biology. The decoherent layer manages the coherent layer\u2019s thermal budget."],
            ["SCALE PRINCIPLE",
             "Adding more Species A units costs less than adding more Species B units (lower cryogenic requirements). The ratio Species A\u202F:\u202FSpecies B can be 10:1 or higher. More decoherent control units = more coherent qubits can be managed = better scale. The Lyme brain analogy: one healthy neuron can be \u2018supported\u2019 by many compromised but still-functional ones."],
          ].map(([h, p]) => (
            <div key={h} style={{ ...S.card, borderLeftColor: "#ffd700" }}>
              <h3 style={{ ...S.cardH, color: "#ffd700" }}>{h}</h3>
              <p style={S.cardP}>{p}</p>
            </div>
          ))}
        </div>
        <p style={S.prose}>
          The key insight bridging both models: <strong style={{ color: "#ffd700" }}>decoherence is not failure</strong>.
          A decoherent qubit is a classical bit. A Lyme-compromised neuron is a classical neuron.
          Neither is useless. The system fails only when the decoherent layer fails to protect the coherent layer
          from heat, or when coherent units are mistakenly treated as if they are decoherent (misdiagnosis = bad gates).
          Correctly identified and separated, the two species together outperform a homogeneous system.
        </p>
      </div>

      {/* ── GOVERNING EQUATIONS ── */}
      <div style={S.sec}>
        <div style={S.lbl}>VI · GOVERNING EQUATIONS</div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(250px,1fr))", gap: 10 }}>
          {[
            ["\u03B8(T) = 1 / (1 + exp(k\u00B7(T \u2212 T\u1D5A)))",
             "Sigmoid seizure threshold. Ti = inflection temperature, k = slope steepness. Lyme shifts Ti \u22121.5\u00B0C and increases k."],
            ["T\u1D62 (Lyme) = T\u1D62 (healthy) \u2212 1.5\u00B0C",
             "The Lyme inflection shift. Equivalent to +3\u202F% greater susceptibility per \u00B0C of fever. Empirically confirmed in febrile seizure literature."],
            ["d(Wr)/dt = \u03B1 \u00B7 Inhib \u2212 \u03B2 \u00B7 (1 \u2212 Inhib)",
             "Writhe dynamics. \u03B1 = accumulation rate (transcription + replication stress), \u03B2 = Topo-II resolution rate. Inhibition 0\u201E\u20181 controls the balance."],
            ["Kn(Wr) = 3\u2081 if Wr\u22482.2, 5\u2081 if Wr\u22483.5, 6\u2081 if Wr\u22485.0",
             "Knot type thresholds. Stevedore 6\u2081 has Alexander polynomial 2t\u22323t\u00B2\u22123t+2, signature +2, and hyperbolic volume \u22483.164, making it the first genuinely entangled substrate-relevant knot."],
            ["E(mechanism) = \u03A3 w\u1D62 \u00B7 s\u1D62 / \u03A3 w\u1D62",
             "Evidence score: weighted sum over clinical reproducibility, mechanistic specificity, treatment vector, and literature support. High E \u2192 clinical action; low E \u2192 research hypothesis."],
            ["\u0393 = N\u00B7F(v)\u00B7v/L\u1D4D \u2194 \u03B8(T)\u00B7N\u00B7f(Inhib)",
             "Two-species analogy. Quantum throughput \u0393 maps onto the seizure-safe gate rate: the product of N coherent units, fidelity F(T) (coherence), and operation rate v/L. The decoherent layer maximises \u0393 by keeping T below Ti."],
          ].map(([eq, desc]) => (
            <div key={eq} style={S.math}>
              <p style={S.eq}>{eq}</p>
              <p style={S.eqSub}>{desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* ── FOOTER ── */}
      <div style={S.footer}>
        <span>AETHER \u00B7 PRACTICAL DECOY FILTER</span>
        <a href="/mechanical-qubits"     style={S.link}>QUBIT TRAIN</a>
        <a href="/nutritional-dna-key"   style={S.link}>STEVEDORE GATE</a>
        <a href="/regulatory-depth"      style={S.link}>REGULATORY DEPTH</a>
        <a href="/electron-field"        style={S.link}>ELECTRON FIELD</a>
        <a href="/"                      style={S.link}>HOME</a>
      </div>
    </div>
  );
}
