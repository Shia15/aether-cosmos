import { useEffect, useRef, useState } from "react";

/* ── palette ──────────────────────────────── */
const BG   = "#040610";
const TEAL = "#2ef0d8";
const GOLD = "#c9a84c";
const VIO  = "#9966ff";
const ROSE = "#ff4477";
const DIM  = "#1a2840";
const mono = "'Space Mono', monospace";

/* ── grid constants ──────────────────────── */
const GW = 210;
const GH = 150;
const ABSORB = 14;         // sponge-layer width
const AVG_DECAY = 0.007;   // time-average decay rate

/* ── sources ─────────────────────────────── */
interface Src { nx: number; ny: number; amp: number; freq: number; ph: number }

function makeSources(n: number): Src[] {
  const positions = [
    [0.22, 0.28], [0.78, 0.28], [0.50, 0.72],
    [0.15, 0.70], [0.85, 0.70], [0.50, 0.20],
    [0.30, 0.50], [0.70, 0.50],
  ];
  const freqs  = [0.072, 0.095, 0.058, 0.113, 0.081, 0.066, 0.104, 0.089];
  const phases = [0, 1.2, 2.4, 0.6, 3.1, 1.8, 4.2, 0.3];
  return positions.slice(0, n).map(([nx, ny], i) => ({
    nx, ny, amp: 1.6, freq: freqs[i], ph: phases[i],
  }));
}

/* ── field color map ─────────────────────── */
function fieldColor(phi: number): [number, number, number] {
  const n = Math.max(-1, Math.min(1, phi / 1.6));
  if (n >= 0) {
    if (n < 0.38) {
      const t = n / 0.38;
      return [Math.round(6*t), Math.round(12*t + 46*t*t), Math.round(8*t)];
    }
    if (n < 0.70) {
      const t = (n - 0.38) / 0.32;
      return [Math.round(6 + 195*t), Math.round(58 + 90*t), Math.round(8 + 66*t)];
    }
    const t = (n - 0.70) / 0.30;
    return [
      Math.round(201 + 54*t),
      Math.round(148 + 102*t),
      Math.round(74 + 146*t),
    ];
  }
  // negative: black → violet → rose
  const m = -n;
  if (m < 0.40) {
    const t = m / 0.40;
    return [Math.round(20*t), 0, Math.round(40*t)];
  }
  const t = (m - 0.40) / 0.60;
  return [
    Math.round(20 + 235*t),
    Math.round(0),
    Math.round(40 + 79*t),
  ];
}

/* ── predicted-space color (muted teal-violet tint) ── */
function predictedColor(phi: number, alpha: number): [number, number, number, number] {
  const n = Math.max(-1, Math.min(1, phi / 1.4));
  const r = n >= 0 ? Math.round(20*n) : Math.round(60*(-n));
  const g = n >= 0 ? Math.round(180*n) : 0;
  const b = n >= 0 ? Math.round(200*n) : Math.round(200*(-n));
  return [r, g, b, Math.round(alpha * 255)];
}

/* ══════════════════════════════════════════
   MAIN PAGE
══════════════════════════════════════════ */
export default function EnergeticFieldSimPage() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rootRef   = useRef<HTMLDivElement>(null);
  const rafRef    = useRef(0);
  const sizeRef   = useRef({ W: 900, H: 600 });

  const [speed,      setSpeed]      = useState(0.58);
  const [damping,    setDamping]    = useState(0.018);
  const [srcCount,   setSrcCount]   = useState(4);
  const [predAlpha,  setPredAlpha]  = useState(0.38);
  const [viewMode,   setViewMode]   = useState<"both"|"field"|"predicted"|"divergence">("both");

  const parRef = useRef({ speed, damping, srcCount, predAlpha, viewMode });
  parRef.current = { speed, damping, srcCount, predAlpha, viewMode };

  useEffect(() => {
    const cv   = canvasRef.current;
    const root = rootRef.current;
    if (!cv || !root) return;
    const ctx = cv.getContext("2d")!;

    /* offscreen grid canvas */
    const off    = document.createElement("canvas");
    off.width    = GW; off.height = GH;
    const offCtx = off.getContext("2d")!;
    const img    = offCtx.createImageData(GW, GH);
    const px     = img.data;

    const offPred    = document.createElement("canvas");
    offPred.width    = GW; offPred.height = GH;
    const offCtxPred = offPred.getContext("2d")!;
    const imgPred    = offCtxPred.createImageData(GW, GH);
    const pxPred     = imgPred.data;

    /* field buffers */
    const prev = new Float32Array(GW * GH);
    const curr = new Float32Array(GW * GH);
    const next = new Float32Array(GW * GH);
    const avg  = new Float32Array(GW * GH); // time-average = predicted space
    const vel  = new Float32Array(GW * GH); // ∂φ/∂t

    /* sponge layer mask */
    const sponge = new Float32Array(GW * GH);
    for (let y = 0; y < GH; y++) {
      for (let x = 0; x < GW; x++) {
        const d = Math.min(x, GW-1-x, y, GH-1-y);
        sponge[y*GW+x] = d < ABSORB ? (d / ABSORB) ** 2.2 : 1.0;
      }
    }

    /* resize */
    const resize = () => {
      const W = root.clientWidth, H = root.clientHeight;
      const dpr = window.devicePixelRatio || 1;
      cv.width  = W * dpr; cv.height = H * dpr;
      cv.style.width = W + "px"; cv.style.height = H + "px";
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      sizeRef.current = { W, H };
    };
    resize();
    const ro = new ResizeObserver(resize); ro.observe(root);

    let t = 0;
    let totalE = 0;
    let coherence = 0;

    function step() {
      const { speed: c, damping: gam, srcCount: ns } = parRef.current;
      const c2 = c * c;
      const srcs = makeSources(ns);

      // wave update (finite difference)
      for (let y = 1; y < GH-1; y++) {
        for (let x = 1; x < GW-1; x++) {
          const i   = y*GW+x;
          const lap = curr[(y)*GW+(x+1)] + curr[(y)*GW+(x-1)]
                    + curr[(y+1)*GW+(x)] + curr[(y-1)*GW+(x)]
                    - 4*curr[i];
          const v   = curr[i] - prev[i];
          next[i]   = curr[i] + v*(1-gam) + c2*lap;
        }
      }

      // sponge + sources
      srcs.forEach(s => {
        const sx = Math.round(s.nx * GW) | 0;
        const sy = Math.round(s.ny * GH) | 0;
        if (sx > 0 && sx < GW-1 && sy > 0 && sy < GH-1) {
          next[sy*GW+sx] += s.amp * Math.sin(t * s.freq + s.ph);
        }
      });

      // apply sponge, update avg & vel, compute stats
      let eSum = 0, corrNum = 0, corrDen = 0;
      for (let i = 0; i < GW*GH; i++) {
        next[i] *= sponge[i];
        vel[i]   = next[i] - curr[i];
        avg[i]   = avg[i] * (1 - AVG_DECAY) + next[i] * AVG_DECAY;
        eSum    += vel[i]*vel[i] + c2*(next[i]*next[i]);
        corrNum += next[i]*avg[i];
        corrDen += Math.sqrt(next[i]*next[i] + 0.001) * Math.sqrt(avg[i]*avg[i] + 0.001);
      }
      totalE    = Math.sqrt(eSum / (GW*GH));
      coherence = Math.max(0, Math.min(1, corrNum / (corrDen + 1e-6)));

      // rotate buffers
      prev.set(curr); curr.set(next);
      t += 1;
    }

    function renderPixels() {
      const { predAlpha: pa, viewMode: vm } = parRef.current;

      // main field
      for (let i = 0; i < GW*GH; i++) {
        let phi = 0;
        if (vm === "divergence") phi = (curr[i] - avg[i]) * 1.5;
        else if (vm === "predicted") phi = avg[i] * 1.4;
        else phi = curr[i];
        const [r, g, b] = fieldColor(phi);
        px[i*4]   = r;
        px[i*4+1] = g;
        px[i*4+2] = b;
        px[i*4+3] = 255;
      }
      offCtx.putImageData(img, 0, 0);

      // predicted overlay
      if (vm === "both" && pa > 0.02) {
        for (let i = 0; i < GW*GH; i++) {
          const [r, g, b, a] = predictedColor(avg[i], pa);
          pxPred[i*4]   = r;
          pxPred[i*4+1] = g;
          pxPred[i*4+2] = b;
          pxPred[i*4+3] = a;
        }
        offCtxPred.putImageData(imgPred, 0, 0);
      }
    }

    function draw() {
      step();
      renderPixels();
      const { W, H } = sizeRef.current;
      const { predAlpha: pa, viewMode: vm, srcCount: ns } = parRef.current;
      const srcs = makeSources(ns);

      // clear
      ctx.fillStyle = BG; ctx.fillRect(0, 0, W, H);

      // main field scaled
      ctx.imageSmoothingEnabled = false;
      ctx.drawImage(off, 0, 0, W, H);
      ctx.imageSmoothingEnabled = true;

      // predicted overlay
      if (vm === "both" && pa > 0.02) {
        ctx.globalCompositeOperation = "screen";
        ctx.drawImage(offPred, 0, 0, W, H);
        ctx.globalCompositeOperation = "source-over";
      }

      // source markers
      const scX = W / GW, scY = H / GH;
      srcs.forEach((s, si) => {
        const sx = s.nx * W, sy = s.ny * H;
        const phase = (t * s.freq + s.ph) % (Math.PI * 2);
        const pulse = 0.5 + 0.5 * Math.sin(phase);

        // outer ring (pulsing)
        ctx.beginPath();
        ctx.arc(sx, sy, 8 + pulse * 14, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(46,240,216,${0.08 + pulse * 0.18})`;
        ctx.lineWidth = 1; ctx.stroke();

        // second ring
        ctx.beginPath();
        ctx.arc(sx, sy, 4 + pulse * 7, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(201,168,76,${0.15 + pulse * 0.25})`;
        ctx.lineWidth = 0.8; ctx.stroke();

        // core
        ctx.beginPath(); ctx.arc(sx, sy, 3.5, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255,240,200,${0.65 + pulse * 0.35})`; ctx.fill();

        // label
        ctx.font = `5px ${mono}`; ctx.fillStyle = "rgba(255,240,200,0.4)";
        ctx.textAlign = "center";
        ctx.fillText(`S${si+1}`, sx, sy + 16);
      });

      // scan line effect
      for (let y = 0; y < H; y += 4) {
        ctx.fillStyle = "rgba(0,0,0,0.025)";
        ctx.fillRect(0, y, W, 1);
      }

      // stats overlay (top-right)
      const sx2 = W - 14;
      const stats = [
        { label: "FIELD ENERGY",  val: totalE.toFixed(3),         col: TEAL },
        { label: "COHERENCE",     val: (coherence*100).toFixed(1)+"%", col: GOLD },
        { label: "GRID",          val: `${GW}×${GH}`,             col: DIM.replace("1a2840","5a7898") },
        { label: "STEP",          val: `${t}`,                    col: DIM.replace("1a2840","5a7898") },
      ];
      stats.forEach((s, si) => {
        ctx.textAlign = "right"; ctx.font = `6px ${mono}`;
        ctx.fillStyle = s.col; ctx.fillText(s.label, sx2, 22 + si*16);
        ctx.fillStyle = "#fff"; ctx.font = `bold 8px ${mono}`;
        ctx.fillText(s.val, sx2, 32 + si*16);
      });

      // view mode label (top-center)
      ctx.textAlign = "center"; ctx.font = `6px ${mono}`;
      ctx.fillStyle = "rgba(200,220,240,0.22)";
      const modeLabel = vm === "both"       ? "ACTUAL FIELD + PREDICTED SPACE OVERLAY"
                      : vm === "predicted"  ? "PREDICTED SPACE · TIME-AVERAGE FIELD"
                      : vm === "divergence" ? "DIVERGENCE · ACTUAL − PREDICTED"
                      :                      "ACTUAL FIELD · SCALAR WAVE";
      ctx.fillText(modeLabel, W/2, 14);

      // coherence bar (bottom of canvas, above controls)
      const barW = W * 0.4;
      const barX = (W - barW) / 2;
      const barY = H - 6;
      ctx.fillStyle = "rgba(46,240,216,0.15)";
      ctx.fillRect(barX, barY, barW, 3);
      ctx.fillStyle = `rgba(46,240,216,${0.5 + coherence * 0.45})`;
      ctx.fillRect(barX, barY, barW * coherence, 3);

      rafRef.current = requestAnimationFrame(draw);
    }

    rafRef.current = requestAnimationFrame(draw);
    return () => { cancelAnimationFrame(rafRef.current); ro.disconnect(); };
  }, []);

  /* ── styles ────────────────────────────── */
  const lbl: React.CSSProperties = {
    fontFamily: mono, fontSize: 10, color: `${TEAL}88`,
    letterSpacing: "0.08em", userSelect: "none",
  };
  const val: React.CSSProperties = {
    fontFamily: mono, fontSize: 10, color: `${TEAL}cc`,
    minWidth: 32, textAlign: "right",
  };
  const sep: React.CSSProperties = { width: 1, height: 28, background: "rgba(46,240,216,0.12)" };
  const slid: React.CSSProperties = { width: 80, accentColor: TEAL };

  const modeBtn = (m: typeof viewMode, label: string) => (
    <button key={m} onClick={() => setViewMode(m)}
      style={{
        fontFamily: mono, fontSize: 9, letterSpacing: "0.1em",
        padding: "5px 10px", cursor: "pointer", border: "1px solid",
        borderRadius: 4, background: "transparent",
        borderColor: viewMode === m ? TEAL : "rgba(46,240,216,0.2)",
        color: viewMode === m ? TEAL : "rgba(46,240,216,0.38)",
      }}>
      {label}
    </button>
  );

  return (
    <div style={{ width:"100%", height:"100%", position:"relative",
      overflow:"hidden", background:BG, display:"flex", flexDirection:"column" }}>

      {/* canvas fills available space */}
      <div ref={rootRef} style={{ flex:1, position:"relative", overflow:"hidden" }}>
        <canvas ref={canvasRef} style={{ position:"absolute", inset:0 }} />

        {/* LIVE badge + title (top-left overlay) */}
        <div style={{ position:"absolute", top:8, left:10, zIndex:10, pointerEvents:"none" }}>
          <div style={{
            display:"inline-block", border:`1px solid ${TEAL}88`,
            padding:"3px 10px", fontSize:9, letterSpacing:"0.18em",
            color:`${TEAL}aa`, fontFamily:"'DM Mono',monospace", marginBottom:5,
          }}>LIVE SIMULATION</div>
          <div style={{
            fontFamily:"'DM Mono',monospace", fontSize:"0.55rem",
            letterSpacing:3, color:`${TEAL}50`,
          }}>ENERGETIC FIELD SIMULATOR · PREDICTED SPACE · AETHER</div>
        </div>
      </div>

      {/* controls bar */}
      <div style={{
        flexShrink:0, display:"flex", gap:14, alignItems:"center", justifyContent:"center",
        flexWrap:"wrap", background:"rgba(4,6,16,0.90)",
        borderTop:`1px solid rgba(46,240,216,0.12)`,
        padding:"9px 20px",
      }}>

        <span style={lbl}>WAVE SPEED</span>
        <input type="range" min="0.2" max="0.70" step="0.02" value={speed} style={slid}
          onChange={e => setSpeed(parseFloat(e.target.value))} />
        <span style={val}>{speed.toFixed(2)}</span>

        <div style={sep}/>

        <span style={lbl}>DAMPING</span>
        <input type="range" min="0.002" max="0.08" step="0.002" value={damping} style={slid}
          onChange={e => setDamping(parseFloat(e.target.value))} />
        <span style={val}>{damping.toFixed(3)}</span>

        <div style={sep}/>

        <span style={lbl}>SOURCES</span>
        <input type="range" min="1" max="8" step="1" value={srcCount} style={slid}
          onChange={e => setSrcCount(parseInt(e.target.value))} />
        <span style={val}>{srcCount}</span>

        <div style={sep}/>

        <span style={lbl}>PRED. ALPHA</span>
        <input type="range" min="0" max="0.85" step="0.05" value={predAlpha} style={slid}
          onChange={e => setPredAlpha(parseFloat(e.target.value))} />
        <span style={val}>{predAlpha.toFixed(2)}</span>

        <div style={sep}/>

        <div style={{ display:"flex", gap:5 }}>
          {modeBtn("both",       "BOTH")}
          {modeBtn("field",      "FIELD")}
          {modeBtn("predicted",  "PRED.")}
          {modeBtn("divergence", "DIVERG.")}
        </div>

      </div>
    </div>
  );
}
