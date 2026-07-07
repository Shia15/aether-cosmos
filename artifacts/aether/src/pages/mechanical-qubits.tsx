import { useEffect, useRef } from "react";
import type { MutableRefObject } from "react";

// ── physics constants (normalised / dimensionless) ────────────────
const TB    = 20;     // base temperature (≈20 mK equivalent)
const TMAX  = 280;    // above this: coherence → 0
const T2MX  = 100;    // max coherence time (normalised µs)
const GAMA  = 0.018;  // decoherence sensitivity to ΔT
const CTH   = 2.5;    // thermal capacity
const LG    = 88;     // effective gate-zone width px
const TX0   = 60;
const TX1   = 670;
const TRW   = TX1 - TX0;
const VMAX  = 6.0;    // slider max speed

// ── zone layout ────────────────────────────────────────────────────
const ZONES = [
  { id: "load",  x: 60,  w: 68, lbl: "LOAD",   bg: "rgba(46,240,216,0.06)", hm:  0.0 },
  { id: "gate1", x: 158, w: 88, lbl: "GATE-1",  bg: "rgba(255,215,0,0.07)",  hm:  0.9 },
  { id: "cool",  x: 276, w: 90, lbl: "COOL",    bg: "rgba(20,80,255,0.10)",  hm: -2.0 },
  { id: "gate2", x: 396, w: 88, lbl: "GATE-2",  bg: "rgba(255,215,0,0.07)",  hm:  0.9 },
  { id: "read",  x: 514, w: 82, lbl: "READ",    bg: "rgba(57,255,20,0.07)",  hm:  0.0 },
  { id: "reset", x: 616, w: 54, lbl: "RESET",   bg: "rgba(160,0,220,0.07)", hm:  0.0 },
];

// ── types ──────────────────────────────────────────────────────────
type QB = { id: number; x: number; temp: number; coh: number; gates: number };
type Readout = { avgT: number; avgC: number; throughput: number; efficiency: number };

// ── helpers ────────────────────────────────────────────────────────
function zoneAt(x: number) {
  return ZONES.find(z => x >= z.x && x < z.x + z.w) ?? null;
}

function t2rgb(temp: number): [number, number, number] {
  const t = Math.max(0, Math.min(1, (temp - TB) / (TMAX - TB)));
  return [Math.round(20 + t * 235), Math.round(190 - t * 170), Math.round(255 - t * 230)];
}

function stepQB(qbs: QB[], sp: number, fr: number, co: number): QB[] {
  return qbs.map(q => {
    const z = zoneAt(q.x);
    const hm = z ? z.hm : 0;
    const Qin  = fr * sp * sp * (1 + Math.max(0, hm));
    const boost = hm < 0 ? -hm : 1.0;
    const Qout = co * boost * Math.max(0, q.temp - TB);
    let t2 = q.temp + (Qin - Qout) / CTH;
    t2 = Math.max(TB, Math.min(TMAX, t2));
    const T2  = T2MX * Math.exp(-GAMA * (t2 - TB));
    const coh = T2 / T2MX;
    const inGate = !!(z && (z.id === "gate1" || z.id === "gate2") && coh > 0.25);
    let nx = q.x + sp;
    if (nx > TX1) nx = TX0 + (nx - TX1);
    return { id: q.id, x: nx, temp: t2, coh, gates: q.gates + (inGate ? 1 : 0) };
  });
}

// ── draw train ─────────────────────────────────────────────────────
function drawTrain(
  ctx: CanvasRenderingContext2D, W: number, H: number,
  qbs: QB[], tick: number
) {
  ctx.fillStyle = "#03050a";
  ctx.fillRect(0, 0, W, H);
  const TY = Math.round(H * 0.58);

  for (const z of ZONES) {
    ctx.fillStyle = z.bg;
    ctx.fillRect(z.x, 26, z.w, H - 50);
    ctx.strokeStyle = "rgba(100,140,180,0.07)";
    ctx.lineWidth = 1;
    ctx.strokeRect(z.x, 26, z.w, H - 50);
    ctx.fillStyle = "rgba(180,210,240,0.45)";
    ctx.font = "8px 'DM Mono',monospace";
    ctx.textAlign = "center";
    ctx.fillText(z.lbl, z.x + z.w / 2, 38);
  }

  // track
  ctx.strokeStyle = "rgba(46,240,216,0.35)";
  ctx.lineWidth = 2;
  ctx.beginPath(); ctx.moveTo(TX0, TY); ctx.lineTo(TX1, TY); ctx.stroke();
  ctx.lineWidth = 1; ctx.strokeStyle = "rgba(46,240,216,0.1)";
  for (let xi = TX0; xi <= TX1; xi += 18) {
    ctx.beginPath(); ctx.moveTo(xi, TY - 5); ctx.lineTo(xi, TY + 5); ctx.stroke();
  }

  // qubits
  for (const q of qbs) {
    const [r, g, b] = t2rgb(q.temp);
    const grd = ctx.createRadialGradient(q.x, TY, 3, q.x, TY, 20);
    grd.addColorStop(0, `rgba(${r},${g},${b},0.95)`);
    grd.addColorStop(0.5, `rgba(${r},${g},${b},0.3)`);
    grd.addColorStop(1, `rgba(${r},${g},${b},0)`);
    ctx.fillStyle = grd;
    ctx.beginPath(); ctx.arc(q.x, TY, 20, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = `rgb(${r},${g},${b})`;
    ctx.beginPath(); ctx.arc(q.x, TY, 8, 0, Math.PI * 2); ctx.fill();
    if (q.coh > 0.02) {
      ctx.strokeStyle = `rgba(46,240,216,${Math.min(0.85, q.coh)})`;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(q.x, TY, 13, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * q.coh);
      ctx.stroke();
    }
    ctx.fillStyle = "rgba(255,255,255,0.9)";
    ctx.font = "7px 'DM Mono',monospace";
    ctx.textAlign = "center";
    ctx.fillText(`q${q.id}`, q.x, TY + 2);
    ctx.fillStyle = `rgba(${r},${g},${b},0.75)`;
    ctx.font = "7px 'DM Mono',monospace";
    ctx.fillText(`${q.temp.toFixed(0)}`, q.x, TY + 29);
  }

  ctx.fillStyle = "rgba(46,240,216,0.25)";
  ctx.font = "8px 'DM Mono',monospace";
  ctx.textAlign = "left";
  ctx.fillText(`tick ${tick}`, TX0 + 4, H - 8);
}

// ── draw efficiency curve ──────────────────────────────────────────
function drawEfficiency(
  ctx: CanvasRenderingContext2D, W: number, H: number,
  speed: number, friction: number, cooling: number, nQ: number
) {
  ctx.fillStyle = "#03050a";
  ctx.fillRect(0, 0, W, H);
  const pl = 54, pr = 18, pt = 28, pb = 36;
  const PW = W - pl - pr, PH = H - pt - pb;

  // axes
  ctx.strokeStyle = "rgba(46,240,216,0.25)";
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(pl, pt); ctx.lineTo(pl, pt + PH); ctx.lineTo(pl + PW, pt + PH);
  ctx.stroke();

  ctx.fillStyle = "rgba(46,240,216,0.5)";
  ctx.font = "8px 'DM Mono',monospace";
  ctx.textAlign = "center";
  ctx.fillText("SHUTTLE SPEED", pl + PW / 2, H - 4);
  ctx.save();
  ctx.translate(12, pt + PH / 2);
  ctx.rotate(-Math.PI / 2);
  ctx.fillText("THROUGHPUT", 0, 0);
  ctx.restore();

  // curve: Gamma(v) = N * F(v) * v / LG
  const pts: [number, number][] = [];
  let maxG = 1e-9;
  let optV = 0, optG = 0;
  for (let i = 0; i <= 120; i++) {
    const v = (i / 120) * VMAX;
    const Tss = TB + (friction * v * v) / Math.max(0.001, cooling);
    const T2  = T2MX * Math.exp(-GAMA * (Tss - TB));
    const tg  = LG / Math.max(0.01, v);
    const F   = Math.max(0, 1 - tg / Math.max(0.01, T2));
    const G   = nQ * F * v / LG;
    pts.push([v, G]);
    if (G > maxG) { maxG = G; }
    if (G > optG) { optG = G; optV = v; }
  }

  // grid lines
  ctx.strokeStyle = "rgba(46,240,216,0.06)";
  for (let i = 1; i <= 4; i++) {
    const y = pt + PH - (i / 4) * PH;
    ctx.beginPath(); ctx.moveTo(pl, y); ctx.lineTo(pl + PW, y); ctx.stroke();
  }

  // curve fill
  ctx.beginPath();
  for (let i = 0; i < pts.length; i++) {
    const px = pl + (pts[i][0] / VMAX) * PW;
    const py = pt + PH - (pts[i][1] / maxG) * PH;
    if (i === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);
  }
  ctx.lineTo(pl + PW, pt + PH);
  ctx.lineTo(pl, pt + PH);
  ctx.closePath();
  ctx.fillStyle = "rgba(46,240,216,0.06)";
  ctx.fill();

  // curve line
  ctx.strokeStyle = "#2ef0d8";
  ctx.lineWidth = 2;
  ctx.beginPath();
  for (let i = 0; i < pts.length; i++) {
    const px = pl + (pts[i][0] / VMAX) * PW;
    const py = pt + PH - (pts[i][1] / maxG) * PH;
    if (i === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);
  }
  ctx.stroke();

  // optimal point
  const opx = pl + (optV / VMAX) * PW;
  const opy = pt + PH - PH;
  ctx.strokeStyle = "rgba(255,215,0,0.3)";
  ctx.lineWidth = 1;
  ctx.setLineDash([3, 3]);
  ctx.beginPath(); ctx.moveTo(opx, pt + PH); ctx.lineTo(opx, pt); ctx.stroke();
  ctx.setLineDash([]);
  ctx.fillStyle = "#ffd700";
  ctx.beginPath(); ctx.arc(opx, pt + PH - (optG / maxG) * PH, 5, 0, Math.PI * 2); ctx.fill();
  ctx.font = "8px 'DM Mono',monospace";
  ctx.textAlign = "center";
  ctx.fillText(`v*=${optV.toFixed(1)}`, opx, pt + PH + 16);

  // current speed marker
  const cpx = pl + (Math.min(speed, VMAX) / VMAX) * PW;
  ctx.strokeStyle = "rgba(57,255,20,0.65)";
  ctx.lineWidth = 1.5;
  ctx.setLineDash([4, 3]);
  ctx.beginPath(); ctx.moveTo(cpx, pt); ctx.lineTo(cpx, pt + PH); ctx.stroke();
  ctx.setLineDash([]);
  ctx.fillStyle = "#39ff14";
  ctx.font = "8px 'DM Mono',monospace";
  ctx.textAlign = "center";
  ctx.fillText("NOW", cpx, pt + 10);

  ctx.fillStyle = "rgba(46,240,216,0.6)";
  ctx.font = "9px 'DM Mono',monospace";
  ctx.textAlign = "left";
  ctx.fillText("THROUGHPUT vs VELOCITY", pl + 4, pt - 8);

  // void unused opy
  void opy;
}

// ── canvas components ──────────────────────────────────────────────
function QubitTrainCanvas({
  speedRef, frictionRef, coolingRef, nRef, readoutRef,
}: {
  speedRef: MutableRefObject<number>;
  frictionRef: MutableRefObject<number>;
  coolingRef: MutableRefObject<number>;
  nRef: MutableRefObject<number>;
  readoutRef: MutableRefObject<Readout>;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const W = canvas.width, H = canvas.height;

    let lastN = Math.max(1, Math.round(nRef.current));
    let qbs: QB[] = Array.from({ length: lastN }, (_, i) => ({
      id: i, x: TX0 + (i / lastN) * TRW,
      temp: TB + 5 + Math.random() * 8, coh: 0.95, gates: 0,
    }));
    let tick = 0, raf = 0;

    const loop = () => {
      const sp = speedRef.current;
      const fr = frictionRef.current;
      const co = coolingRef.current;
      const N  = Math.max(1, Math.round(nRef.current));
      if (N !== lastN) {
        lastN = N;
        qbs = Array.from({ length: N }, (_, i) => ({
          id: i, x: TX0 + (i / N) * TRW,
          temp: TB + 5, coh: 0.95, gates: 0,
        }));
      }
      qbs = stepQB(qbs, sp, fr, co);
      drawTrain(ctx, W, H, qbs, tick++);
      // update readout
      const avgT  = qbs.reduce((s, q) => s + q.temp, 0) / qbs.length;
      const avgC  = qbs.reduce((s, q) => s + q.coh,  0) / qbs.length;
      const Tss   = TB + (fr * sp * sp) / Math.max(0.001, co);
      const T2    = T2MX * Math.exp(-GAMA * (Tss - TB));
      const tg    = LG / Math.max(0.01, sp);
      const F     = Math.max(0, 1 - tg / Math.max(0.01, T2));
      const thru  = N * F * sp / LG;
      const pMot  = fr * sp * sp * sp;
      const pCool = co * Math.max(0, avgT - TB);
      const eff   = thru / Math.max(0.001, pMot + pCool);
      readoutRef.current = { avgT, avgC, throughput: thru, efficiency: eff };
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, [speedRef, frictionRef, coolingRef, nRef, readoutRef]);

  return (
    <canvas
      ref={canvasRef}
      width={700}
      height={224}
      style={{ width: "100%", maxWidth: 700, display: "block", borderRadius: 4 }}
    />
  );
}

function EfficiencyCanvas({
  speedRef, frictionRef, coolingRef, nRef,
}: {
  speedRef: MutableRefObject<number>;
  frictionRef: MutableRefObject<number>;
  coolingRef: MutableRefObject<number>;
  nRef: MutableRefObject<number>;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const W = canvas.width, H = canvas.height;
    let raf = 0;
    const loop = () => {
      drawEfficiency(ctx, W, H,
        speedRef.current, frictionRef.current,
        coolingRef.current, Math.round(nRef.current));
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, [speedRef, frictionRef, coolingRef, nRef]);
  return (
    <canvas
      ref={canvasRef}
      width={500}
      height={200}
      style={{ width: "100%", maxWidth: 500, display: "block", borderRadius: 4 }}
    />
  );
}

// ── readout display (textContent-driven) ───────────────────────────
function ReadoutPanel({ readoutRef }: { readoutRef: MutableRefObject<Readout> }) {
  const tRef  = useRef<HTMLSpanElement>(null);
  const cRef  = useRef<HTMLSpanElement>(null);
  const gRef  = useRef<HTMLSpanElement>(null);
  const eRef  = useRef<HTMLSpanElement>(null);
  useEffect(() => {
    let raf = 0;
    const upd = () => {
      const ro = readoutRef.current;
      if (tRef.current)  tRef.current.textContent  = `${ro.avgT.toFixed(1)} mK`;
      if (cRef.current)  cRef.current.textContent  = `${(ro.avgC * 100).toFixed(1)} %`;
      if (gRef.current)  gRef.current.textContent  = `${ro.throughput.toFixed(3)} G/µs`;
      if (eRef.current)  eRef.current.textContent  = `${ro.efficiency.toFixed(3)} G/mW`;
      raf = requestAnimationFrame(upd);
    };
    raf = requestAnimationFrame(upd);
    return () => cancelAnimationFrame(raf);
  }, [readoutRef]);

  const cell = (label: string, ref: React.RefObject<HTMLSpanElement>, color: string) => (
    <div style={RO_CELL}>
      <div style={{ fontSize: 9, letterSpacing: "0.18em", color: "rgba(200,220,240,0.45)", marginBottom: 3 }}>
        {label}
      </div>
      <span ref={ref} style={{ fontSize: 15, color, fontWeight: 400, fontFamily: "'DM Mono',monospace" }}>—</span>
    </div>
  );

  return (
    <div style={{ display: "flex", gap: 10, flexWrap: "wrap", margin: "12px 0" }}>
      {cell("AVG TEMP",       tRef, "#ff6666")}
      {cell("AVG COHERENCE",  cRef, "#2ef0d8")}
      {cell("THROUGHPUT",     gRef, "#ffd700")}
      {cell("EFFICIENCY",     eRef, "#39ff14")}
    </div>
  );
}

const RO_CELL: React.CSSProperties = {
  background: "rgba(3,5,10,0.8)",
  border: "1px solid rgba(46,240,216,0.18)",
  borderRadius: 4,
  padding: "8px 14px",
  minWidth: 120,
  fontFamily: "'DM Mono',monospace",
};

// ── styles ─────────────────────────────────────────────────────────
const S = {
  page:    { background: "#03050a", color: "#c8d8e8", minHeight: "100vh",
             fontFamily: "'DM Mono',monospace" } as React.CSSProperties,
  hero:    { padding: "40px 20px 28px", borderBottom: "1px solid rgba(46,240,216,0.12)" } as React.CSSProperties,
  badge:   { display: "inline-block", border: "1px solid #2ef0d8", padding: "3px 12px",
             fontSize: 10, letterSpacing: "0.22em", color: "#2ef0d8", marginBottom: 14 } as React.CSSProperties,
  h1:      { margin: 0, fontSize: "clamp(22px,4vw,38px)", fontFamily: "'Orbitron',monospace",
             color: "#2ef0d8", fontWeight: 700, letterSpacing: "0.08em", lineHeight: 1.2 } as React.CSSProperties,
  sub:     { margin: "10px 0 0", fontSize: 13, color: "rgba(200,220,240,0.55)",
             letterSpacing: "0.06em" } as React.CSSProperties,
  section: { padding: "28px 20px" } as React.CSSProperties,
  label:   { fontSize: 10, letterSpacing: "0.2em", color: "#2ef0d8", marginBottom: 16,
             display: "inline-block", borderBottom: "1px solid rgba(46,240,216,0.25)",
             paddingBottom: 4 } as React.CSSProperties,
  prose:   { fontSize: 13.5, lineHeight: 1.8, color: "rgba(200,220,240,0.72)",
             maxWidth: 740, marginBottom: 16 } as React.CSSProperties,
  card:    { background: "rgba(5,12,22,0.9)", border: "1px solid rgba(46,240,216,0.15)",
             borderLeft: "3px solid #2ef0d8", borderRadius: 4,
             padding: "14px 18px", marginBottom: 12 } as React.CSSProperties,
  cardH:   { margin: "0 0 6px", fontSize: 11, color: "#2ef0d8",
             letterSpacing: "0.14em", fontWeight: 400 } as React.CSSProperties,
  cardP:   { margin: 0, fontSize: 12.5, lineHeight: 1.75,
             color: "rgba(200,220,240,0.68)" } as React.CSSProperties,
  math:    { background: "rgba(5,12,22,0.9)", border: "1px solid rgba(46,240,216,0.15)",
             borderRadius: 4, padding: "14px 18px", marginBottom: 10 } as React.CSSProperties,
  eq:      { fontSize: 14, color: "#2ef0d8", letterSpacing: "0.04em",
             fontFamily: "'DM Mono',monospace", margin: "0 0 6px" } as React.CSSProperties,
  eqSub:   { fontSize: 11.5, color: "rgba(200,220,240,0.55)", margin: 0 } as React.CSSProperties,
  slider:  { width: "100%", accentColor: "#2ef0d8" } as React.CSSProperties,
  slRow:   { marginBottom: 14 } as React.CSSProperties,
  slLabel: { fontSize: 10, color: "rgba(46,240,216,0.7)", letterSpacing: "0.15em",
             display: "flex", justifyContent: "space-between", marginBottom: 4 } as React.CSSProperties,
  footer:  { padding: "24px 20px", borderTop: "1px solid rgba(46,240,216,0.1)",
             fontSize: 11, color: "rgba(46,240,216,0.4)", display: "flex",
             gap: 20, flexWrap: "wrap" as const } as React.CSSProperties,
  link:    { color: "#2ef0d8", textDecoration: "none" } as React.CSSProperties,
};

// ── slider component ───────────────────────────────────────────────
function Slider({
  label, min, max, step, init, valRef, fmt,
}: {
  label: string; min: number; max: number; step: number;
  init: number; valRef: MutableRefObject<number>;
  fmt: (v: number) => string;
}) {
  const dispRef = useRef<HTMLSpanElement>(null);
  return (
    <div style={S.slRow}>
      <div style={S.slLabel as React.CSSProperties}>
        <span>{label}</span>
        <span ref={dispRef} style={{ color: "#2ef0d8" }}>{fmt(init)}</span>
      </div>
      <input
        type="range" min={min} max={max} step={step}
        defaultValue={init} style={S.slider}
        onInput={e => {
          const v = parseFloat((e.target as HTMLInputElement).value);
          valRef.current = v;
          if (dispRef.current) dispRef.current.textContent = fmt(v);
        }}
      />
    </div>
  );
}

// ── main page ─────────────────────────────────────────────────────
export default function MechanicalQubitsPage() {
  const speedRef    = useRef<number>(1.8);
  const frictionRef = useRef<number>(0.022);
  const coolingRef  = useRef<number>(0.055);
  const nRef        = useRef<number>(6);
  const readoutRef  = useRef<Readout>({ avgT: TB, avgC: 1, throughput: 0, efficiency: 0 });

  return (
    <div style={S.page}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Mono&family=Orbitron:wght@700&display=swap');
      `}</style>

      {/* ── HERO ── */}
      <div style={S.hero}>
        <div style={S.badge}>AETHER · QUANTUM MECHANICS</div>
        <h1 style={S.h1}>THERMO-MECHANICAL QUBIT TRAIN</h1>
        <p style={S.sub}>Shuttling · Phonon Heating · Coherence Decay · Throughput Optimisation</p>
      </div>

      {/* ── CONCEPT ── */}
      <div style={S.section}>
        <div style={S.label}>I · CONCEPT</div>
        <p style={S.prose}>
          A qubit doesn&apos;t have to be fixed. In trapped-ion quantum computing (QCCD architecture),
          ions are physically shuttled along micro-fabricated electrodes between specialised zones —
          gate zones for computation, memory zones for storage, cooling zones for recooling.
          The catch: motion excites the ion&apos;s vibrational modes (phonons). Phonons are heat.
          Heat destroys coherence. The faster you shuttle, the more you heat, the shorter your T&#x2082;.
        </p>
        <p style={S.prose}>
          The same physics applies to any mechanical qubit architecture — qubits on a cryogenic
          conveyor, spin qubits shuttled through Si/Ge channels, or photonic qubits on moving waveguide
          actuators. Motion and thermodynamics are always in tension with quantum coherence.
          There is an optimal shuttle velocity v* that maximises useful gate throughput —
          below it you are too slow to be efficient, above it coherence collapses.
        </p>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(220px,1fr))", gap: 12, marginTop: 20 }}>
          {[
            ["PHONON HEATING", "Motion couples to the ion motional mode. Each shuttle stroke adds ~1–10 phonons. Phonon number n̄ ∝ v²."],
            ["COHERENCE DECAY", "T₂ ∝ exp(−γ·ΔT). Every phonon nudges the qubit frequency, broadening the linewidth and randomising phase."],
            ["COOL ZONE", "Laser sideband cooling or dilution-refrigerator pumping removes phonons between gate operations. Higher cooling power = tighter thermal budget."],
            ["THROUGHPUT PEAK", "Γ(v) = N·F(v)·v/L_gate peaks at v*. Left of v*: speed-limited. Right of v*: fidelity-limited. The curve is the engine."],
          ].map(([h, p]) => (
            <div key={h} style={S.card}>
              <h3 style={S.cardH}>{h}</h3>
              <p style={S.cardP}>{p}</p>
            </div>
          ))}
        </div>
      </div>

      {/* ── LIVE TRAIN SIMULATION ── */}
      <div style={{ ...S.section, borderTop: "1px solid rgba(46,240,216,0.1)" }}>
        <div style={S.label}>II · LIVE QUBIT TRAIN SIMULATION</div>
        <p style={S.prose}>
          Qubits (circles) shuttle left-to-right along the track, wrapping continuously.
          Colour encodes temperature: <span style={{ color: "#1060ff" }}>blue = cold / coherent</span>{" "}
          → <span style={{ color: "#ff4444" }}>red = hot / decoherent</span>.
          The teal arc shows coherence fraction. Numbers below each qubit show temperature.
          Gate operations (GATE-1, GATE-2) only succeed when coherence &gt; 25 %.
        </p>

        <div style={{ background: "rgba(3,6,12,0.9)", border: "1px solid rgba(46,240,216,0.18)", borderRadius: 6, padding: "12px 12px 8px", marginBottom: 14 }}>
          <QubitTrainCanvas
            speedRef={speedRef}
            frictionRef={frictionRef}
            coolingRef={coolingRef}
            nRef={nRef}
            readoutRef={readoutRef}
          />
        </div>

        <ReadoutPanel readoutRef={readoutRef} />

        {/* sliders */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(220px,1fr))", gap: "0 24px", marginTop: 16 }}>
          <Slider label="SHUTTLE SPEED"   min={0.3} max={VMAX} step={0.1} init={1.8}  valRef={speedRef}    fmt={v => `${v.toFixed(1)} px/tick`} />
          <Slider label="FRICTION μ"       min={0.003} max={0.08} step={0.001} init={0.022} valRef={frictionRef} fmt={v => v.toFixed(3)} />
          <Slider label="COOLING POWER κ"  min={0.005} max={0.15} step={0.005} init={0.055} valRef={coolingRef}  fmt={v => v.toFixed(3)} />
          <Slider label="QUBIT COUNT N"    min={2} max={12} step={1} init={6} valRef={nRef} fmt={v => `${Math.round(v)} qubits`} />
        </div>

        <div style={{ marginTop: 8, padding: "8px 12px", background: "rgba(46,240,216,0.04)", borderRadius: 4, fontSize: 11, color: "rgba(46,240,216,0.5)", letterSpacing: "0.05em" }}>
          TIP: raise speed until throughput peaks, then increase cooling to shift v* right and extract more performance.
          At high friction or low cooling, coherence collapses — reduce speed or increase κ to recover.
        </div>
      </div>

      {/* ── EFFICIENCY OPTIMIZER ── */}
      <div style={{ ...S.section, borderTop: "1px solid rgba(46,240,216,0.1)" }}>
        <div style={S.label}>III · EFFICIENCY OPTIMIZER</div>
        <p style={S.prose}>
          The gold dot marks v* — the velocity that maximises gate throughput for the current
          friction and cooling settings. The green dashed line is your current operating point.
          Move the sliders above and watch the landscape reshape in real time.
        </p>
        <div style={{ background: "rgba(3,6,12,0.9)", border: "1px solid rgba(46,240,216,0.18)", borderRadius: 6, padding: "12px 12px 8px" }}>
          <EfficiencyCanvas
            speedRef={speedRef}
            frictionRef={frictionRef}
            coolingRef={coolingRef}
            nRef={nRef}
          />
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(220px,1fr))", gap: 10, marginTop: 16 }}>
          {[
            ["LOWER FRICTION", "Reduces heat per shuttle. v* shifts right — you can run faster before coherence collapses. Engineering target: smooth electrode surfaces, cryogenic lubrication."],
            ["HIGHER COOLING", "Stronger κ flattens the T(v) curve. Same speed, lower temperature, longer T₂, higher fidelity. Peak broadens and shifts right."],
            ["MORE QUBITS N", "Scales throughput linearly at fixed fidelity. But more qubits = more heat load on the cooling system. κ must scale with N."],
          ].map(([h, p]) => (
            <div key={h} style={S.card}>
              <h3 style={S.cardH}>{h}</h3>
              <p style={S.cardP}>{p}</p>
            </div>
          ))}
        </div>
      </div>

      {/* ── SCALE ANALYSIS ── */}
      <div style={{ ...S.section, borderTop: "1px solid rgba(46,240,216,0.1)" }}>
        <div style={S.label}>IV · SCALE-UP ANALYSIS</div>
        <p style={S.prose}>
          Scaling the train has three independent levers. Each compounds the others:
        </p>
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12, fontFamily: "'DM Mono',monospace" }}>
            <thead>
              <tr style={{ borderBottom: "1px solid rgba(46,240,216,0.2)" }}>
                {["LEVER", "EFFECT ON THROUGHPUT Γ", "EFFECT ON HEAT LOAD", "CONSTRAINT"].map(h => (
                  <th key={h} style={{ padding: "8px 14px", textAlign: "left", fontSize: 10, color: "#2ef0d8", letterSpacing: "0.15em", fontWeight: 400 }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {[
                ["More qubits N", "Γ ∝ N (linear)", "Q ∝ N · v²", "Cooling capacity"],
                ["Higher speed v", "Γ ∝ v (until fidelity cliff)", "Q ∝ v²·v = v³", "Phonon budget"],
                ["Lower friction μ", "Indirect: shifts v* right", "Q ∝ μ·v²", "Material engineering"],
                ["Higher cooling κ", "Indirect: raises fidelity at v", "P_cool ∝ κ·ΔT", "Refrigerator power"],
                ["Parallel trains", "Γ ∝ n_trains", "Q ∝ n_trains", "Chip footprint"],
              ].map(row => (
                <tr key={row[0]} style={{ borderBottom: "1px solid rgba(46,240,216,0.06)" }}>
                  {row.map((cell, i) => (
                    <td key={i} style={{ padding: "8px 14px", color: i === 0 ? "#2ef0d8" : "rgba(200,220,240,0.65)" }}>{cell}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p style={{ ...S.prose, marginTop: 16 }}>
          The practical limit is almost always the cooling system. A dilution refrigerator
          at 15 mK provides ~1–10 µW of cooling power. Each shuttled qubit dissipates
          ~10–100 fW at low speed, but this rises as v². At 100 qubits moving at v*,
          total heat load approaches the refrigerator ceiling — which is why real
          QCCD architectures segment the chip into hot compute zones and cold memory zones,
          with dedicated cooling in between. That is exactly what the COOL zone in the
          simulation above represents.
        </p>
      </div>

      {/* ── GOVERNING EQUATIONS ── */}
      <div style={{ ...S.section, borderTop: "1px solid rgba(46,240,216,0.1)" }}>
        <div style={S.label}>V · GOVERNING EQUATIONS</div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(260px,1fr))", gap: 12 }}>
          {[
            ["PHONON HEATING POWER",   "Q_in = μ · v²",                   "Kinetic friction couples to motional mode. Heating ∝ v². μ = phonon coupling coefficient."],
            ["THERMAL DYNAMICS",       "dT/dt = (Q_in − κ·ΔT) / C_th",    "Newton cooling model. κ = cooling rate, ΔT = T − T_base, C_th = thermal capacity of qubit + trap."],
            ["STEADY-STATE TEMP",      "T_ss = T_base + μ·v² / κ",         "At equilibrium dT/dt=0. T_ss rises as v², falls as κ. Fundamental trade-off surface."],
            ["COHERENCE TIME",         "T₂ = T₂_max · exp(−γ·ΔT)",         "Exponential sensitivity to temperature excess. γ encodes substrate + trap quality."],
            ["GATE FIDELITY",          "F = 1 − t_gate / T₂",              "Simplified single-gate error model. t_gate = L_gate/v (time in gate zone). F → 0 as T₂ → t_gate."],
            ["THROUGHPUT",             "Γ = N · F(v) · v / L_gate",         "N qubits each executing gates at rate v/L_gate, discounted by fidelity. Peaks at v*."],
            ["OPTIMAL VELOCITY",       "dΓ/dv = 0 → v*",                   "Analytic root exists when γ·μ/κ > 0. Numerically found as argmax of Γ(v). v* ∝ √(κ/(γ·μ))."],
            ["ENERGY EFFICIENCY",      "η = Γ / (P_motion + P_cool)",       "Gates per unit power. P_motion = μ·v³, P_cool = κ·ΔT. Efficiency peaks left of v* — the slow-and-cool regime."],
          ].map(([h, eq, desc]) => (
            <div key={h} style={S.math}>
              <p style={{ ...S.eqSub, marginBottom: 4, fontSize: 9, letterSpacing: "0.16em" }}>{h}</p>
              <p style={S.eq}>{eq}</p>
              <p style={S.eqSub}>{desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* ── DESIGN PRINCIPLES ── */}
      <div style={{ ...S.section, borderTop: "1px solid rgba(46,240,216,0.1)" }}>
        <div style={S.label}>VI · DESIGN PRINCIPLES</div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(240px,1fr))", gap: 12 }}>
          {[
            ["ZONE SEGMENTATION", "Separate the chip into dedicated function zones — gate, cool, read, memory. Never gate in the same region you heat; never heat where you cool. Spatial separation is thermal separation."],
            ["PHONON BUDGET", "Assign each shuttle stroke a phonon allowance. If a shuttle would exceed the budget, insert a mandatory cool-zone pause. This is the quantum equivalent of thermal throttling."],
            ["PARALLEL TRAINS", "Scale horizontally before scaling speed. Two trains at v*/2 deliver more fidelity-weighted throughput than one train at v*. Cooling load is identical but decoherence is halved per qubit."],
            ["MATERIALS LEVER", "The biggest gain is in μ. Reducing phonon coupling by 10× shifts v* right by √10 ≈ 3×. Smooth electrode coatings, lower-mass ions, and engineered mode spectra all reduce μ at the physics level."],
            ["ADAPTIVE CONTROL", "Run a feedback loop: measure T₂ of each qubit before each gate, adjust shuttle speed dynamically. Qubits that are already cold can be rushed; hot qubits wait in the cool zone. This is the runtime processing efficiency layer."],
            ["COHERENCE IS COHERENCE", "The same exponential decay law — T₂ = T₂_max · exp(−γ·ΔT) — appears in biological coherence, optical lattices, and the AETHER C-field. Motion heats any coherent system. The optimal rhythm exists everywhere: move, cool, act."],
          ].map(([h, p]) => (
            <div key={h} style={{ ...S.card, borderLeftColor: "#39ff14" }}>
              <h3 style={{ ...S.cardH, color: "#39ff14" }}>{h}</h3>
              <p style={S.cardP}>{p}</p>
            </div>
          ))}
        </div>
      </div>

      {/* ── FOOTER ── */}
      <div style={S.footer}>
        <span>AETHER · THERMO-MECHANICAL QUBIT TRAIN</span>
        <a href="/aether-engine"   style={S.link}>AETHER ENGINE</a>
        <a href="/gradient-field"  style={S.link}>GRADIENT FIELD</a>
        <a href="/electron-field"  style={S.link}>ELECTRON FIELD</a>
        <a href="/graph-view"      style={S.link}>GRAPH MAP</a>
        <a href="/"                style={S.link}>HOME</a>
      </div>
    </div>
  );
}
