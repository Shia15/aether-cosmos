import { useEffect, useRef, useState } from "react";

/* ── Palette ────────────────────────────────────────────────────────── */
const BG    = "#04060E";
const SURF  = "#0c1220";
const AURORA = "#00FFB2";
const GOLD   = "#C8A030";
const VIOLET = "#9966ff";
const ROSE   = "#ff4477";
const BLUE   = "#44aaff";
const MONO   = "'Space Mono', monospace";
const DISP   = "'Cinzel', serif";
const SERIF  = "'Crimson Pro', serif";
const TWO_PI = Math.PI * 2;

/* ── Canvas & grid constants ────────────────────────────────────────── */
const CW = 600;   // canvas width
const CH = 370;   // canvas height
const HR = 8;     // hex cell radius

/* ── Types ──────────────────────────────────────────────────────────── */
type V3 = [number, number, number];
type Pt2 = [number, number];
interface KnotDef {
  id: string; name: string; cross: number; col: string;
  fn: (t: number) => V3; winding: number; sigma: number; desc: string;
}

/* ── Knot parametric families (module-level) ────────────────────────── */
function mkTorus(P: number, Q: number): (t: number) => V3 {
  return (t) => {
    const R = 1.5, r = 0.65;
    return [
      (R + r * Math.cos(Q * t)) * Math.cos(P * t) * 0.60,
      (R + r * Math.cos(Q * t)) * Math.sin(P * t) * 0.60,
      r * Math.sin(Q * t) * 0.60,
    ];
  };
}
function mkFig8(): (t: number) => V3 {
  return (t) => [
    (2 + Math.cos(2 * t)) * Math.cos(3 * t) * 0.42,
    (2 + Math.cos(2 * t)) * Math.sin(3 * t) * 0.42,
    Math.sin(4 * t),
  ];
}
function mkStevedore(): (t: number) => V3 {
  return (t) => [
    (Math.sin(t) + 2 * Math.sin(2 * t) + 0.5 * Math.sin(3 * t + 0.5)) * 0.45,
    (Math.cos(t) - 2 * Math.cos(2 * t) - 0.5 * Math.cos(3 * t + 0.5)) * 0.45,
    Math.sin(3 * t + 0.2) * 0.9,
  ];
}
function mkThreeTwist(): (t: number) => V3 {
  return (t) => [
    (Math.cos(2 * t) - Math.cos(3 * t)) * 0.65,
    (Math.sin(2 * t) + Math.sin(3 * t)) * 0.65,
    Math.sin(5 * t) * 0.40,
  ];
}

/* ── Knot catalog ───────────────────────────────────────────────────── */
const KNOTS: KnotDef[] = [
  {
    id: "3\u2081", name: "Trefoil", cross: 3, col: GOLD,
    fn: mkTorus(2, 3), winding: 2, sigma: 30,
    desc: "Simplest non-trivial knot. 3 phase singularities. Chiral -- left and right forms are topologically distinct. Models collagen helix knot topology.",
  },
  {
    id: "4\u2081", name: "Figure-Eight", cross: 4, col: VIOLET,
    fn: mkFig8(), winding: 1, sigma: 26,
    desc: "Amphichiral -- identical to its mirror image. 4 crossings. Appears in DNA supercoiling and RNA pseudoknot formation.",
  },
  {
    id: "5\u2081", name: "Cinquefoil", cross: 5, col: ROSE,
    fn: mkTorus(2, 5), winding: 2, sigma: 22,
    desc: "Torus knot T(2,5). 5 crossings. Models pentagonal symmetry in viral capsid assembly and wood frog guanine crystal arrays.",
  },
  {
    id: "5\u2082", name: "Three-Twist", cross: 5, col: BLUE,
    fn: mkThreeTwist(), winding: 3, sigma: 20,
    desc: "Non-torus 5-crossing knot. Phase defect density higher than cinquefoil. Observed in mitochondrial DNA repair pathways.",
  },
  {
    id: "6\u2081", name: "Stevedore", cross: 6, col: AURORA,
    fn: mkStevedore(), winding: 1, sigma: 18,
    desc: "6-crossing slice knot. Topoisomerase II uses stevedore geometry to unknot circular DNA. High coherence in biophotonic arrays.",
  },
];

/* ── Build hex cell grid ────────────────────────────────────────────── */
function buildHexGrid(W: number, H: number, r: number): Pt2[] {
  const cells: Pt2[] = [];
  const cw = Math.sqrt(3) * r;
  const ch = 2 * r;
  const rows = Math.ceil(H / (ch * 0.75)) + 2;
  const cols = Math.ceil(W / cw) + 2;
  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      const cx = col * cw + (row % 2) * (cw * 0.5);
      const cy = row * ch * 0.75;
      if (cx >= -r && cx <= W + r && cy >= -r && cy <= H + r) {
        cells.push([cx, cy]);
      }
    }
  }
  return cells;
}

/* ── Draw hexagon path ──────────────────────────────────────────────── */
function hexPath(ctx: CanvasRenderingContext2D, cx: number, cy: number, r: number) {
  ctx.beginPath();
  for (let i = 0; i < 6; i++) {
    const a = (i / 6) * TWO_PI - Math.PI / 6;
    if (i === 0) ctx.moveTo(cx + r * Math.cos(a), cy + r * Math.sin(a));
    else ctx.lineTo(cx + r * Math.cos(a), cy + r * Math.sin(a));
  }
  ctx.closePath();
}

/* ── Project 3D knot to 2D canvas coords ───────────────────────────── */
function projectKnot(fn: (t: number) => V3, N: number, cx: number, cy: number, scale: number): Pt2[] {
  return Array.from({ length: N + 1 }, (_, i) => {
    const t = (i / N) * TWO_PI;
    const [x, y] = fn(t);
    return [cx + x * scale, cy + y * scale] as Pt2;
  });
}

/* ── Build amplitude distance map ───────────────────────────────────── */
function buildDistMap(cells: Pt2[], path: Pt2[]): Float32Array {
  const out = new Float32Array(cells.length);
  // subsample path every 5th point for speed
  const sparse: Pt2[] = [];
  for (let i = 0; i < path.length; i += 5) sparse.push(path[i]);
  for (let i = 0; i < cells.length; i++) {
    const [cx, cy] = cells[i];
    let minD2 = 1e9;
    for (const [px, py] of sparse) {
      const d2 = (cx - px) * (cx - px) + (cy - py) * (cy - py);
      if (d2 < minD2) minD2 = d2;
    }
    out[i] = Math.sqrt(minD2);
  }
  return out;
}

/* ── Find 2D crossing singularities ─────────────────────────────────── */
function findCrossings(path: Pt2[], skip: number, thr: number): Pt2[] {
  const out: Pt2[] = [];
  const seen = new Set<string>();
  for (let i = 0; i < path.length - skip; i += 4) {
    for (let j = i + skip; j < path.length; j += 4) {
      const dx = path[i][0] - path[j][0];
      const dy = path[i][1] - path[j][1];
      if (dx * dx + dy * dy < thr * thr) {
        const key = Math.round(path[i][0] / thr) + "," + Math.round(path[i][1] / thr);
        if (!seen.has(key)) {
          seen.add(key);
          out.push([(path[i][0] + path[j][0]) / 2, (path[i][1] + path[j][1]) / 2]);
        }
      }
    }
  }
  return out;
}

/* ── HSL color helper ───────────────────────────────────────────────── */
function hsl(h: number, s: number, l: number, a: number): string {
  const hh = ((h % 360) + 360) % 360;
  return `hsla(${Math.round(hh)},${Math.round(s * 100)}%,${Math.round(l * 100)}%,${a.toFixed(3)})`;
}

/* ── Pre-build hex grid (one time) ─────────────────────────────────── */
const HEX_CELLS: Pt2[] = buildHexGrid(CW, CH, HR);

/* ═══════════════════════════════════════════════════════════════════════
   COMPONENT
═══════════════════════════════════════════════════════════════════════ */
export default function WoodFrogKnotsPage() {
  const canvasRef   = useRef<HTMLCanvasElement>(null);
  const rafRef      = useRef(0);
  const tRef        = useRef(0);
  const pathRef     = useRef<Pt2[]>([]);
  const distMapRef  = useRef<Float32Array>(new Float32Array());
  const crossRef    = useRef<Pt2[]>([]);
  const omegaRef    = useRef(0.025);
  const sigmaRef    = useRef(28);
  const freezeRef   = useRef(0);
  const gradRef     = useRef(false);

  const [knotIdx, setKnotIdx]   = useState(0);
  const [running,  setRunning]  = useState(true);
  const [omega,    setOmega]    = useState(0.025);
  const [sigma,    setSigma]    = useState(28);
  const [freeze,   setFreeze]   = useState(0);
  const [showGrad, setShowGrad] = useState(false);
  const [liveAmp,  setLiveAmp]  = useState("--");
  const [liveCoh,  setLiveCoh]  = useState("--");

  // sync refs from state so animation loop reads fresh values
  useEffect(() => { omegaRef.current = omega;   }, [omega]);
  useEffect(() => { sigmaRef.current = sigma;   }, [sigma]);
  useEffect(() => { freezeRef.current = freeze; }, [freeze]);
  useEffect(() => { gradRef.current = showGrad; }, [showGrad]);

  // rebuild knot geometry when knot changes
  useEffect(() => {
    const k = KNOTS[knotIdx];
    sigmaRef.current = k.sigma;
    setSigma(k.sigma);
    const newPath = projectKnot(k.fn, 500, CW / 2, CH / 2, CW * 0.29);
    pathRef.current = newPath;
    distMapRef.current = buildDistMap(HEX_CELLS, newPath);
    crossRef.current = findCrossings(newPath, 40, 11);
  }, [knotIdx]);

  // initial build
  useEffect(() => {
    const k = KNOTS[0];
    const newPath = projectKnot(k.fn, 500, CW / 2, CH / 2, CW * 0.29);
    pathRef.current = newPath;
    distMapRef.current = buildDistMap(HEX_CELLS, newPath);
    crossRef.current = findCrossings(newPath, 40, 11);
  }, []);

  // animation loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d")!;
    const k = KNOTS[knotIdx];

    let ampSum = 0, ampCnt = 0;

    const draw = () => {
      tRef.current += omegaRef.current;
      const t = tRef.current;
      const sig = sigmaRef.current;
      const frz = freezeRef.current;
      const showG = gradRef.current;

      ctx.clearRect(0, 0, CW, CH);
      ctx.fillStyle = BG;
      ctx.fillRect(0, 0, CW, CH);

      const distMap = distMapRef.current;
      ampSum = 0; ampCnt = 0;

      // ── Draw hex cells ──────────────────────────────────────
      for (let i = 0; i < HEX_CELLS.length; i++) {
        const [cx, cy] = HEX_CELLS[i];
        const d = distMap.length > 0 ? distMap[i] : 40;
        // A(x) = tanh(d/sigma) -- rises from 0 at knot, to 1 far away
        const A = Math.tanh(d / sig);
        // Freeze thickens the dark zone (cryoprotectant reduces coherence radius)
        const Af = A * (1 - frz * 0.4 * Math.exp(-d / (sig * 1.8)));
        // Phase field: winding angle around centre + radial modulation
        const phi = Math.atan2(cy - CH / 2, cx - CW / 2) * k.winding + d * 0.018;
        // Coherence field (real part): C(x,t) = A(x) * cos(phi(x) - omega*t)
        const C = Af * Math.cos(phi - t);
        // Gradient opacity differential: opacity = A^2
        const alpha = Af * Af;
        // Hue tracks phase: teal (160deg) through violet (250deg)
        const hueBase = 165 + ((phi - t + Math.PI) % TWO_PI) * (85 / TWO_PI);
        // Freeze shifts to blue-white
        const hue = hueBase * (1 - frz * 0.15) + frz * 200;
        const sat = 0.65 + 0.35 * Math.abs(C);
        const lit = 0.18 + 0.40 * Math.abs(C);

        hexPath(ctx, cx, cy, HR - 0.8);
        ctx.fillStyle = hsl(hue, sat, lit, alpha * 0.92);
        ctx.fill();

        // Cell membrane border
        if (alpha > 0.08) {
          ctx.strokeStyle = hsl(hue, 0.5, lit + 0.15, alpha * 0.28);
          ctx.lineWidth = 0.5;
          ctx.stroke();
        }

        // Gradient arrows (show dA/dx direction)
        if (showG && i % 4 === 0 && d > 6 && d < sig * 2.5) {
          const dAdx = Math.tanh((d + 1) / sig) - Math.tanh((d - 1) / sig);
          const dx = cx - CW / 2, dy = cy - CH / 2;
          const len = Math.sqrt(dx * dx + dy * dy) + 0.001;
          const arrowLen = dAdx * 18;
          const nx = dx / len, ny = dy / len;
          ctx.beginPath();
          ctx.moveTo(cx, cy);
          ctx.lineTo(cx + nx * arrowLen, cy + ny * arrowLen);
          ctx.strokeStyle = `rgba(255,200,80,${Math.min(0.7, dAdx * 3)})`;
          ctx.lineWidth = 0.8;
          ctx.stroke();
        }

        ampSum += Af; ampCnt++;
      }

      // ── Draw knot path ──────────────────────────────────────
      const path = pathRef.current;
      if (path.length > 2) {
        ctx.beginPath();
        ctx.moveTo(path[0][0], path[0][1]);
        for (let i = 1; i < path.length; i++) {
          ctx.lineTo(path[i][0], path[i][1]);
        }
        ctx.closePath();
        ctx.strokeStyle = k.col + "CC";
        ctx.lineWidth = 2.8;
        ctx.shadowColor = k.col;
        ctx.shadowBlur = 14;
        ctx.stroke();
        ctx.shadowBlur = 0;
      }

      // ── Draw crossing singularities ─────────────────────────
      const crosses = crossRef.current;
      for (const [px, py] of crosses) {
        // Dark void -- amplitude node
        const voidGrad = ctx.createRadialGradient(px, py, 0, px, py, 11);
        voidGrad.addColorStop(0, "rgba(4,6,14,0.95)");
        voidGrad.addColorStop(0.6, "rgba(4,6,14,0.7)");
        voidGrad.addColorStop(1, "rgba(4,6,14,0.0)");
        ctx.beginPath();
        ctx.arc(px, py, 11, 0, TWO_PI);
        ctx.fillStyle = voidGrad;
        ctx.fill();
        // Pulsing ring
        const ring = 0.55 + 0.45 * Math.sin(t * 1.8);
        ctx.beginPath();
        ctx.arc(px, py, 8 + ring * 2, 0, TWO_PI);
        ctx.strokeStyle = k.col + Math.round(ring * 160 + 48).toString(16).padStart(2, "0");
        ctx.lineWidth = 1.2;
        ctx.stroke();
        // Label
        ctx.fillStyle = "rgba(255,255,255,0.4)";
        ctx.font = "7px " + MONO;
        ctx.textAlign = "center";
        ctx.fillText("A=0", px, py + 20);
      }

      // ── Freeze ice crystals overlay ─────────────────────────
      if (frz > 0.05) {
        const icePts: Pt2[] = [[120,50],[200,30],[300,20],[400,45],[500,35],[150,80],[350,70],[480,60]];
        const cnt = Math.min(Math.round(frz * 8), icePts.length);
        for (let n = 0; n < cnt; n++) {
          const [ix, iy] = icePts[n];
          for (let arm = 0; arm < 6; arm++) {
            const ang = (arm / 6) * TWO_PI;
            const rr = 14 + n;
            ctx.strokeStyle = `rgba(180,225,255,${frz * 0.6})`;
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(ix, iy);
            ctx.lineTo(ix + Math.cos(ang) * rr, iy + Math.sin(ang) * rr);
            ctx.stroke();
          }
        }
        ctx.fillStyle = `rgba(220,240,255,${frz * 0.55})`;
        ctx.font = "8px " + MONO;
        ctx.textAlign = "left";
        ctx.fillText("Glucose C6H12O6 cryoprotectant active", 12, CH - 12);
      }

      // ── Canvas equation stamp ───────────────────────────────
      ctx.fillStyle = "rgba(255,255,255,0.14)";
      ctx.font = "9px " + MONO;
      ctx.textAlign = "left";
      ctx.fillText("C(x,t) = A(x) * e^(i(phi(x)-wt))   opacity = A^2", 10, CH - (frz > 0.05 ? 26 : 12));

      // ── Metrics to state (every 10 frames) ─────────────────
      if (Math.floor(tRef.current * 10) % 10 === 0 && ampCnt > 0) {
        const avgA = ampSum / ampCnt;
        setLiveAmp(avgA.toFixed(4));
        const coh = 1 - Math.abs(avgA - 0.618) / 0.618;
        setLiveCoh(Math.max(0, coh).toFixed(4));
      }

      rafRef.current = requestAnimationFrame(draw);
    };

    if (running) {
      rafRef.current = requestAnimationFrame(draw);
    } else {
      cancelAnimationFrame(rafRef.current);
    }
    return () => cancelAnimationFrame(rafRef.current);
  }, [knotIdx, running]);

  const k = KNOTS[knotIdx];

  return (
    <div style={{ background: BG, color: "#c8d8e0", minHeight: "100vh", fontFamily: MONO, padding: 16, boxSizing: "border-box" }}>

      {/* Header */}
      <div style={{ marginBottom: 14, borderBottom: `1px solid rgba(0,255,176,0.12)`, paddingBottom: 12 }}>
        <div style={{ fontSize: 11, color: AURORA, letterSpacing: "0.18em", fontFamily: DISP, marginBottom: 4 }}>
          WOOD FROG SKIN x TAIT KNOTS
        </div>
        <div style={{ fontSize: 9, color: "#3a5060", letterSpacing: "0.10em" }}>
          Coherence Field with Knot Topology -- Gradient Opacity Differential Visualization
        </div>
        <div style={{ marginTop: 8, fontFamily: MONO, fontSize: 10, color: "#5a8090", letterSpacing: "0.04em" }}>
          C(x,t) = A(x) * e^(i(phi(x)-wt)){" "}
          <span style={{ color: "#3a5060", marginLeft: 16 }}>
            where A(x) = tanh( dist_to_knot(x) / sigma ) -- amplitude zero at knot crossings
          </span>
        </div>
      </div>

      <div style={{ display: "flex", gap: 14, flexWrap: "wrap" }}>

        {/* Canvas + knot selector */}
        <div style={{ flex: "0 0 auto" }}>
          {/* Knot selector */}
          <div style={{ display: "flex", gap: 5, marginBottom: 8, flexWrap: "wrap" }}>
            {KNOTS.map((kd, i) => (
              <button key={kd.id} onClick={() => setKnotIdx(i)} style={{
                padding: "5px 9px", fontSize: 9, cursor: "pointer", borderRadius: 4,
                border: `1px solid ${i === knotIdx ? kd.col : "#1a2535"}`,
                background: i === knotIdx ? kd.col + "22" : "#080f1a",
                color: i === knotIdx ? kd.col : "#3a5060",
                fontFamily: MONO, letterSpacing: "0.04em",
                transition: "all 0.15s",
              }}>
                {kd.id} {kd.name} ({kd.cross}x)
              </button>
            ))}
          </div>

          {/* Canvas */}
          <div style={{ position: "relative", borderRadius: 6, overflow: "hidden", border: `1px solid ${k.col}33` }}>
            <canvas ref={canvasRef} width={CW} height={CH}
              style={{ display: "block", background: BG }} />
            {/* Corner label */}
            <div style={{ position: "absolute", top: 8, right: 10, fontSize: 8, color: k.col, fontFamily: MONO, opacity: 0.7 }}>
              {k.id} / cross = {k.cross}
            </div>
          </div>

          {/* Controls row */}
          <div style={{ display: "flex", gap: 6, marginTop: 8, flexWrap: "wrap" }}>
            <button onClick={() => setRunning(r => !r)} style={{
              padding: "6px 12px", fontSize: 10, fontWeight: 700, cursor: "pointer",
              borderRadius: 4, background: running ? "#0c1220" : k.col,
              border: `1px solid ${k.col}`, color: running ? k.col : BG, fontFamily: MONO,
            }}>
              {running ? "Pause" : "Run"}
            </button>
            <button onClick={() => setShowGrad(v => !v)} style={{
              padding: "6px 10px", fontSize: 9, cursor: "pointer", borderRadius: 4,
              border: `1px solid ${showGrad ? GOLD : "#1a2535"}`,
              background: showGrad ? GOLD + "22" : "#080f1a",
              color: showGrad ? GOLD : "#3a5060", fontFamily: MONO,
            }}>
              {showGrad ? "Grad ON" : "Grad OFF"}
            </button>
            {/* omega slider */}
            <div style={{ background: SURF, borderRadius: 4, padding: "4px 8px", border: "1px solid #0e1e30", minWidth: 110 }}>
              <div style={{ fontSize: 7, color: "#3a5060", marginBottom: 2 }}>omega (phase velocity)</div>
              <div style={{ fontSize: 10, color: AURORA, fontWeight: 700, marginBottom: 2 }}>{omega.toFixed(3)}</div>
              <input type="range" min={0.005} max={0.12} step={0.005} value={omega}
                onChange={e => setOmega(parseFloat(e.target.value))}
                style={{ width: "100%", accentColor: AURORA }} />
            </div>
            {/* sigma slider */}
            <div style={{ background: SURF, borderRadius: 4, padding: "4px 8px", border: "1px solid #0e1e30", minWidth: 110 }}>
              <div style={{ fontSize: 7, color: "#3a5060", marginBottom: 2 }}>sigma (coherence radius)</div>
              <div style={{ fontSize: 10, color: VIOLET, fontWeight: 700, marginBottom: 2 }}>{sigma}</div>
              <input type="range" min={6} max={70} step={2} value={sigma}
                onChange={e => setSigma(parseInt(e.target.value))}
                style={{ width: "100%", accentColor: VIOLET }} />
            </div>
            {/* freeze slider */}
            <div style={{ background: SURF, borderRadius: 4, padding: "4px 8px", border: "1px solid #0e1e30", minWidth: 110 }}>
              <div style={{ fontSize: 7, color: "#3a5060", marginBottom: 2 }}>freeze (cryoprotectant)</div>
              <div style={{ fontSize: 10, color: BLUE, fontWeight: 700, marginBottom: 2 }}>{freeze.toFixed(2)}</div>
              <input type="range" min={0} max={1} step={0.02} value={freeze}
                onChange={e => setFreeze(parseFloat(e.target.value))}
                style={{ width: "100%", accentColor: BLUE }} />
            </div>
          </div>
        </div>

        {/* Side panels */}
        <div style={{ flex: 1, minWidth: 200, display: "flex", flexDirection: "column", gap: 10 }}>

          {/* Knot info */}
          <div style={{ background: SURF, borderRadius: 6, padding: 12, border: `1px solid ${k.col}33` }}>
            <div style={{ fontSize: 9, color: k.col, letterSpacing: "0.10em", marginBottom: 6, fontFamily: DISP }}>
              {k.id} -- {k.name} Knot
            </div>
            <div style={{ fontSize: 9, color: "#5a8090", lineHeight: 1.7, marginBottom: 8, fontFamily: SERIF }}>
              {k.desc}
            </div>
            <div style={{ fontFamily: MONO, fontSize: 8, color: "#2a4060" }}>
              Crossings: {k.cross} | Winding: {k.winding} | sigma: {k.sigma}px
            </div>
          </div>

          {/* Live metrics */}
          <div style={{ background: SURF, borderRadius: 6, padding: 12, border: "1px solid #0e1e30" }}>
            <div style={{ fontSize: 8, color: "#3a5060", letterSpacing: "0.14em", marginBottom: 8, textTransform: "uppercase" }}>
              Live Coherence Field Metrics
            </div>
            {[
              { label: "Mean A(x) amplitude",        val: liveAmp, unit: "",    col: AURORA },
              { label: "Coherence C(A,phi^-1)",      val: liveCoh, unit: "",    col: k.col  },
              { label: "Phase singularities found",  val: String(crossRef.current.length), unit: "crossings", col: VIOLET },
              { label: "Active hex cells",           val: String(HEX_CELLS.length), unit: "cells", col: "#5a8090" },
            ].map(({ label, val, unit, col }) => (
              <div key={label} style={{ display: "flex", justifyContent: "space-between", padding: "5px 0", borderBottom: "1px solid #0c1828" }}>
                <span style={{ fontSize: 8, color: "#3a5060" }}>{label}</span>
                <span style={{ fontSize: 11, color: col, fontFamily: MONO, fontWeight: 700 }}>
                  {val} <span style={{ fontSize: 7, color: "#2a4060" }}>{unit}</span>
                </span>
              </div>
            ))}
          </div>

          {/* Gradient opacity explanation */}
          <div style={{ background: SURF, borderRadius: 6, padding: 12, border: `1px solid rgba(200,160,48,0.2)` }}>
            <div style={{ fontSize: 8, color: GOLD, letterSpacing: "0.14em", marginBottom: 8, textTransform: "uppercase" }}>
              Gradient Opacity Differential
            </div>
            <div style={{ fontSize: 8, color: "#3a5060", lineHeight: 1.8, fontFamily: SERIF }}>
              The skin opacity at each cell is A(x)^2 -- not linear in distance, but squared.
              This mirrors quantum probability density: coherence intensity = |C|^2 = A^2 * cos^2.
              Near each knot crossing (phase singularity): A to 0, opacity to 0 -- the cell becomes
              transparent, revealing the dark void beneath. The gradient dA/dx (shown with arrows
              when Grad ON) shows the flow direction of coherence restoration away from the defect.
            </div>
            <div style={{ marginTop: 8, fontFamily: MONO, fontSize: 7, color: "#2a4060", lineHeight: 2 }}>
              opacity(x) = A(x)^2 = tanh(d/sigma)^2<br />
              dA/dx = sech^2(d/sigma) * (1/sigma) * dd/dx<br />
              d(opacity)/dx = 2A * dA/dx  [chain rule]
            </div>
          </div>

          {/* Frog biology */}
          <div style={{ background: SURF, borderRadius: 6, padding: 12, border: "1px solid #0e1e30" }}>
            <div style={{ fontSize: 8, color: "#3a5060", letterSpacing: "0.14em", marginBottom: 8, textTransform: "uppercase" }}>
              Rana Sylvatica -- Wood Frog Skin
            </div>
            <div style={{ fontSize: 8, color: "#3a5060", lineHeight: 1.7, fontFamily: SERIF }}>
              The wood frog survives 70% of body water freezing. The skin's biophotonic layers
              (guanine nanocrystals, Bouligand helix, gyroid photonic crystal) form a coherence
              field exactly described by C(x,t) = A(x) * e^(i(phi-wt)). During freeze, A(x)
              collapses near crystal boundaries -- the same geometry as Tait knot crossings --
              while glucose cryoprotectant maintains coherence in the open regions (A near 1).
              Knot topology predicts which crystallization pathways are energetically forbidden.
            </div>
          </div>
        </div>
      </div>

      {/* Bottom: equation strip */}
      <div style={{ marginTop: 14, padding: "12px 14px", background: SURF, borderRadius: 6, border: "1px solid #0e1e30" }}>
        <div style={{ display: "flex", gap: 28, flexWrap: "wrap", alignItems: "flex-start" }}>
          {[
            { label: "Coherence Field", eq: "C(x,t) = A(x) * e^(i(phi(x) - omega*t))", col: AURORA },
            { label: "Amplitude (distance field)", eq: "A(x) = tanh( d(x, knot) / sigma )", col: k.col },
            { label: "Opacity Differential", eq: "opacity(x) = A(x)^2    d(opacity)/dx = 2A * dA/dx", col: GOLD },
            { label: "Phase Singularity", eq: "crossing(p,q) => A=0 => void", col: VIOLET },
          ].map(({ label, eq, col }) => (
            <div key={label} style={{ flex: 1, minWidth: 160 }}>
              <div style={{ fontSize: 7, color: "#3a5060", marginBottom: 4, letterSpacing: "0.10em" }}>{label}</div>
              <div style={{ fontFamily: MONO, fontSize: 9, color: col, lineHeight: 1.6 }}>{eq}</div>
            </div>
          ))}
        </div>
      </div>

      <div style={{ marginTop: 10, fontSize: 7, color: "#1a2535", fontFamily: MONO }}>
        AETHER -- Wood Frog Skin x Tait Knot Topology -- Phase Singularity = Knot Crossing -- Gradient Opacity Differential = d(A^2)/dx
      </div>
    </div>
  );
}
