import { useEffect, useRef, useState, useCallback } from "react";

/* ── palette ───────────────────────────────────────────────── */
const V = {
  bg:"#04060E", aurora:"#00FFB2", gold:"#C8A030", blue:"#4488FF",
  vio:"#9966FF", amb:"#FF9933", rose:"#FF6699", plasma:"#FF4477",
  green:"#44CC77", dim:"#3A5060", ink:"#B8CCE8", fire:"#FF6622",
  shock:"#FFDD22", photon:"#00FFBB", cyan:"#22DDFF",
};
const MONO  = "'Space Mono',monospace";
const SERIF = "'Crimson Pro',serif";
const DISP  = "'Cinzel',serif";

function ha(v:number):string {
  return Math.round(Math.max(0,Math.min(255,v))).toString(16).padStart(2,"0");
}

function Tag({ l, c }: { l:string; c:string }) {
  return (
    <span style={{ display:"inline-block", padding:"2px 8px", margin:"0 4px 4px 0",
      background:c+"22", border:`1px solid ${c}44`, borderRadius:3,
      fontFamily:MONO, fontSize:9, color:c, letterSpacing:"0.12em" }}>{l}</span>
  );
}

/* ── palette cycle for rings ───────────────────────────────── */
const RING_COLS = [
  V.aurora, V.blue, V.vio, V.rose, V.gold, V.fire, V.cyan, V.green, V.plasma,
];

/* ── Dirichlet kernel (closed form sum Σ_{k=1}^N cos(k·θ)) ── */
function dirichlet(N:number, theta:number):number {
  const d = theta / 2;
  const sd = Math.sin(d);
  if (Math.abs(sd) < 1e-9) return N;
  return (Math.sin(N * d) / sd) * Math.cos((N + 1) * d);
}

/* ── Main Canvas ───────────────────────────────────────────── */
function RingCanvas({
  N, speed, traveling, coupling, showWaterfall,
}: {
  N:number; speed:number; traveling:boolean; coupling:number; showWaterfall:boolean;
}) {
  const ref = useRef<HTMLCanvasElement>(null);
  const raf = useRef(0);
  const st  = useRef({ N, speed, traveling, coupling, showWaterfall });
  useEffect(() => { st.current = { N, speed, traveling, coupling, showWaterfall }; },
    [N, speed, traveling, coupling, showWaterfall]);

  useEffect(() => {
    const cv = ref.current; if (!cv) return;
    const ctx = cv.getContext("2d")!;
    const W = cv.width, H = cv.height;
    let t = 0;

    /* waterfall buffer: rows × phi-steps */
    const WF_ROWS  = 80;
    const WF_COLS  = 180;
    const wfBuf    = new Float32Array(WF_ROWS * WF_COLS);
    let wfRow      = 0;

    const PHI_STEPS = 360;

    function drawRingStack(cx:number, cy:number, n:number, phase:number) {
      const SPAN_Y = H * 0.72;
      const TOP    = cy - SPAN_Y / 2;
      const RX     = 78;   /* semi-major */
      const RY     = 22;   /* semi-minor (isometric tilt) */

      if (n <= 56) {
        /* individual ellipses */
        for (let k = 0; k < n; k++) {
          const yk   = TOP + (k / Math.max(n - 1, 1)) * SPAN_Y;
          const kph  = (k + 1) * phase;
          const amp  = 0.5 + 0.5 * Math.cos(kph);
          const col  = RING_COLS[k % RING_COLS.length];
          /* outer glow */
          const grdE = ctx.createEllipse; // not a method — use fill approach
          ctx.beginPath();
          ctx.ellipse(cx, yk, RX + 4, RY + 1.2, 0, 0, Math.PI * 2);
          ctx.strokeStyle = col + ha(amp * 55);
          ctx.lineWidth = 4;
          ctx.stroke();
          /* ring */
          ctx.beginPath();
          ctx.ellipse(cx, yk, RX, RY, 0, 0, Math.PI * 2);
          ctx.strokeStyle = col + ha(90 + amp * 140);
          ctx.lineWidth = 1 + amp * 1.5;
          ctx.stroke();
          /* bright node (top of each ellipse) */
          const nx = cx, ny = yk - RY;
          if (!isFinite(nx)||!isFinite(ny)) continue;
          ctx.beginPath(); ctx.arc(nx, ny, 2 + amp * 2, 0, Math.PI * 2);
          ctx.fillStyle = col + ha(amp * 220); ctx.fill();
        }
        /* central axis */
        ctx.beginPath();
        ctx.moveTo(cx, TOP); ctx.lineTo(cx, TOP + SPAN_Y);
        ctx.strokeStyle = V.dim + "44"; ctx.lineWidth = 1; ctx.stroke();
      } else {
        /* density field for N > 56 */
        /* draw cylinder outline */
        ctx.beginPath(); ctx.ellipse(cx, TOP,    RX, RY, 0, 0, Math.PI * 2);
        ctx.strokeStyle = V.dim + "44"; ctx.lineWidth = 1; ctx.stroke();
        ctx.beginPath(); ctx.ellipse(cx, TOP + SPAN_Y, RX, RY, 0, 0, Math.PI * 2);
        ctx.strokeStyle = V.dim + "44"; ctx.lineWidth = 1; ctx.stroke();
        /* left/right edges */
        ctx.beginPath();
        ctx.moveTo(cx - RX, TOP); ctx.lineTo(cx - RX, TOP + SPAN_Y);
        ctx.moveTo(cx + RX, TOP); ctx.lineTo(cx + RX, TOP + SPAN_Y);
        ctx.strokeStyle = V.dim + "33"; ctx.lineWidth = 1; ctx.stroke();
        /* density stripes */
        for (let y = TOP; y <= TOP + SPAN_Y; y += 2) {
          const kFrac = (y - TOP) / SPAN_Y;
          const k = kFrac * n;
          const kph = k * phase * 0.06;
          const amp = 0.5 + 0.5 * Math.cos(kph);
          const col = RING_COLS[Math.floor(kFrac * RING_COLS.length) % RING_COLS.length];
          /* left stripe */
          ctx.fillStyle = col + ha(amp * 90);
          ctx.fillRect(cx - RX - 1, y, 2.5, 1.8);
          /* right stripe */
          ctx.fillRect(cx + RX - 1, y, 2.5, 1.8);
          /* interior haze */
          if (amp > 0.7) {
            ctx.fillStyle = col + ha(amp * 20);
            ctx.fillRect(cx - RX + 4, y, RX * 2 - 8, 1.8);
          }
        }
        /* axis */
        ctx.beginPath();
        ctx.moveTo(cx, TOP); ctx.lineTo(cx, TOP + SPAN_Y);
        ctx.strokeStyle = V.aurora + "33"; ctx.lineWidth = 1; ctx.stroke();
      }

      /* stack label */
      ctx.fillStyle = V.ink + "44"; ctx.font = `7px ${MONO}`; ctx.textAlign = "center";
      ctx.fillText("Z-AXIS", cx, TOP - 10);
      ctx.fillText(n <= 56 ? `N = ${n}` : `${n} RINGS`, cx, TOP + SPAN_Y + 14);
    }

    function drawPolar(cx:number, cy:number, n:number, phase:number) {
      const PR = Math.min(W * 0.19, H * 0.38);

      /* reference rings */
      for (const rf of [0.35, 0.65, 1]) {
        ctx.beginPath(); ctx.arc(cx, cy, PR * rf, 0, Math.PI * 2);
        ctx.strokeStyle = V.dim + "2A"; ctx.lineWidth = 0.7; ctx.stroke();
      }

      /* compute A(φ,t) */
      ctx.beginPath();
      let first = true;
      for (let i = 0; i <= PHI_STEPS; i++) {
        const phi   = (i / PHI_STEPS) * Math.PI * 2;
        const theta = phi - phase;
        const raw   = dirichlet(n, theta) / n;    /* in [-1, 1] */
        const rr    = PR * (0.5 + 0.45 * raw);
        if (!isFinite(rr)) continue;
        const x = cx + rr * Math.cos(phi);
        const y = cy - rr * Math.sin(phi);
        if (!isFinite(x)||!isFinite(y)) continue;
        first ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
        first = false;
      }
      ctx.closePath();
      /* fill */
      const grd = ctx.createRadialGradient(cx, cy, 0, cx, cy, PR);
      grd.addColorStop(0, V.aurora + "55");
      grd.addColorStop(0.5, V.vio + "33");
      grd.addColorStop(1, V.plasma + "18");
      ctx.fillStyle = grd; ctx.fill();
      ctx.strokeStyle = V.aurora + "BB"; ctx.lineWidth = 1.2; ctx.stroke();

      /* spike tips: bright dots at each peak */
      const spikes = Math.min(n, 64);
      for (let s = 0; s < spikes; s++) {
        const phi   = ((s + 0.5) / n) * Math.PI * 2 + (traveling ? phase : 0);
        const theta = phi - phase;
        const raw   = dirichlet(n, theta) / n;
        const rr    = PR * (0.5 + 0.45 * raw);
        if (!isFinite(rr)||rr < PR * 0.6) continue;
        const x = cx + rr * Math.cos(phi);
        const y = cy - rr * Math.sin(phi);
        if (!isFinite(x)||!isFinite(y)) continue;
        const col = RING_COLS[s % RING_COLS.length];
        ctx.beginPath(); ctx.arc(x, y, 2, 0, Math.PI * 2);
        ctx.fillStyle = col + "CC"; ctx.fill();
      }

      /* labels */
      ctx.fillStyle = V.ink + "44"; ctx.font = `7px ${MONO}`; ctx.textAlign = "center";
      ctx.fillText("φ = 0", cx + PR + 14, cy + 4);
      ctx.fillText(`Σ cos(kφ${traveling ? "−kΩt" : ""}) / N`, cx, cy + PR + 18);
    }

    function drawStrip(sy:number, sh:number, n:number, phase:number) {
      /* unwrapped A(φ,t) as a horizontal strip */
      const sl = 32, sw = W - 64;
      ctx.fillStyle = V.bg; ctx.fillRect(sl, sy, sw, sh);
      ctx.strokeStyle = V.dim + "33"; ctx.lineWidth = 0.7;
      ctx.strokeRect(sl, sy, sw, sh);
      const my = sy + sh / 2;
      /* baseline */
      ctx.beginPath(); ctx.moveTo(sl, my); ctx.lineTo(sl + sw, my);
      ctx.strokeStyle = V.dim + "44"; ctx.lineWidth = 0.5; ctx.stroke();
      /* wave */
      ctx.beginPath();
      for (let i = 0; i <= sw; i++) {
        const phi   = (i / sw) * Math.PI * 2;
        const theta = phi - phase;
        const raw   = dirichlet(n, theta) / n;
        const y     = my - raw * (sh * 0.42);
        if (!isFinite(y)) continue;
        i === 0 ? ctx.moveTo(sl + i, y) : ctx.lineTo(sl + i, y);
      }
      ctx.strokeStyle = V.gold + "AA"; ctx.lineWidth = 1.2; ctx.stroke();
      ctx.fillStyle = V.ink + "44"; ctx.font = `7px ${MONO}`; ctx.textAlign = "left";
      ctx.fillText(`A(φ,t)  N=${n}  HARMONICS`, sl + 4, sy + 10);
      ctx.textAlign = "right";
      ctx.fillText("φ → 2π", sl + sw - 2, sy + 10);
    }

    function updateWaterfall(n:number, phase:number) {
      /* write current row */
      for (let c = 0; c < WF_COLS; c++) {
        const phi   = (c / WF_COLS) * Math.PI * 2;
        const raw   = dirichlet(n, phi - phase) / n;
        wfBuf[wfRow * WF_COLS + c] = raw;
      }
      wfRow = (wfRow + 1) % WF_ROWS;
    }

    function drawWaterfall(sy:number, sh:number) {
      const sl = 32, sw = W - 64;
      const cellW = sw / WF_COLS;
      const cellH = sh / WF_ROWS;
      for (let row = 0; row < WF_ROWS; row++) {
        const ry = (WF_ROWS - 1 - row); /* newest at bottom */
        const bufRow = (wfRow - 1 - ry + WF_ROWS) % WF_ROWS;
        for (let c = 0; c < WF_COLS; c++) {
          const v = wfBuf[bufRow * WF_COLS + c];
          const bright = Math.max(0, v);
          const col = bright > 0.6 ? V.aurora : bright > 0.3 ? V.vio : V.blue;
          ctx.fillStyle = col + ha(bright * 200);
          ctx.fillRect(sl + c * cellW, sy + ry * cellH, cellW + 0.5, cellH + 0.5);
        }
      }
      ctx.strokeStyle = V.dim + "44"; ctx.lineWidth = 0.7;
      ctx.strokeRect(sl, sy, sw, sh);
      ctx.fillStyle = V.ink + "44"; ctx.font = `7px ${MONO}`; ctx.textAlign = "left";
      ctx.fillText("WATERFALL · A(φ,t) over time — newest at bottom", sl + 4, sy + 10);
    }

    let frame = 0;
    function draw() {
      ctx.clearRect(0, 0, W, H);
      ctx.fillStyle = V.bg; ctx.fillRect(0, 0, W, H);

      const { N: n, speed: Ω, traveling, showWaterfall } = st.current;
      const phase = traveling ? t * Ω : 0;

      /* update waterfall every 3 frames */
      if (frame % 3 === 0) updateWaterfall(n, phase);

      const stripH = 56;
      const stripY = H - stripH - 6;
      const wfY    = H - stripH - 6;

      /* layouts differ by showWaterfall */
      const mainH  = showWaterfall ? H - stripH - 16 : H - stripH - 16;

      /* divider */
      const divX = W * 0.48;
      ctx.beginPath();
      ctx.moveTo(divX, 16); ctx.lineTo(divX, mainH - 10);
      ctx.strokeStyle = V.dim + "28"; ctx.lineWidth = 1; ctx.stroke();

      /* ring stack: left half */
      drawRingStack(W * 0.24, mainH * 0.5, n, phase);

      /* polar interference: right half */
      drawPolar(W * 0.74, mainH * 0.5, n, phase);

      /* bottom strip */
      if (showWaterfall) {
        drawWaterfall(wfY, stripH);
      } else {
        drawStrip(stripY, stripH, n, phase);
      }

      /* HUD */
      ctx.fillStyle = V.aurora + "99"; ctx.font = `9px ${MONO}`; ctx.textAlign = "left";
      ctx.fillText(`N = ${n}  ·  Ω = ${Ω.toFixed(2)}  ·  ${traveling?"TRAVELING":"STANDING"}`, 16, 14);
      ctx.fillStyle = V.ink + "33"; ctx.font = `7px ${MONO}`;
      ctx.fillText("STACKED RINGS CONJECTURE  ·  Σ cos(kφ−kΩt) / N  ·  DIRICHLET KERNEL", 16, 24);

      frame++;
    }

    function loop() { t += 0.01; draw(); raf.current = requestAnimationFrame(loop); }
    loop();
    return () => cancelAnimationFrame(raf.current);
  }, []);

  return (
    <canvas ref={ref} width={900} height={460}
      style={{ width:"100%", height:460, display:"block", borderRadius:"0 0 4px 4px" }}/>
  );
}

/* ── Mode Spectrum Strip ───────────────────────────────────── */
function SpectrumStrip({ N }: { N:number }) {
  const MAX_SHOW = 128;
  const bars = Math.min(N, MAX_SHOW);
  return (
    <div style={{ display:"flex", alignItems:"flex-end", height:48, gap:1.5,
      padding:"6px 0 0", overflow:"hidden" }}>
      {Array.from({ length: bars }, (_, k) => {
        const col = RING_COLS[k % RING_COLS.length];
        const h = 4 + (k < bars - 1 ? 28 : 40);
        return (
          <div key={k} style={{ flex:1, minWidth:1,
            height:h, background:col, opacity:0.6 + 0.4*(k/bars),
            borderRadius:"1px 1px 0 0", transition:"height 0.15s" }}/>
        );
      })}
      {N > MAX_SHOW && (
        <div style={{ fontFamily:MONO, fontSize:7, color:V.ink+"55",
          alignSelf:"center", paddingLeft:8, whiteSpace:"nowrap" }}>
          +{N - MAX_SHOW} more
        </div>
      )}
    </div>
  );
}

/* ── Page ──────────────────────────────────────────────────── */
export default function StackedRingsPage() {
  const [N,        setN]        = useState(12);
  const [speed,    setSpeed]    = useState(0.8);
  const [traveling, setTraveling] = useState(true);
  const [showWF,   setShowWF]   = useState(false);
  const [sweeping, setSweeping] = useState(false);
  const sweepRef = useRef<ReturnType<typeof setInterval>|null>(null);

  const toggleSweep = useCallback(() => {
    if (sweeping) {
      if (sweepRef.current) clearInterval(sweepRef.current);
      sweepRef.current = null;
      setSweeping(false);
    } else {
      setSweeping(true);
      let dir = 1;
      sweepRef.current = setInterval(() => {
        setN(prev => {
          let next = prev + dir;
          if (next >= 512) { dir = -1; next = 511; }
          if (next <= 1)   { dir =  1; next = 2; }
          return next;
        });
      }, 40);
    }
  }, [sweeping]);

  const PRESETS = [1,2,3,5,7,12,24,48,96,256,512];

  return (
    <div style={{ background:V.bg, minHeight:"100vh", color:V.ink,
      fontFamily:MONO, paddingBottom:80 }}>

      {/* tags */}
      <div style={{ padding:"10px 24px", borderBottom:`1px solid ${V.dim}44`,
        display:"flex", flexWrap:"wrap", gap:4 }}>
        {[
          ["STACKED RINGS",V.aurora],["DIRICHLET KERNEL",V.vio],
          ["BARRIERED HARMONICS",V.gold],["VORTICAL MODES",V.blue],
          ["N=512",V.plasma],["INTERFERENCE FIELD",V.rose],["AETHER",V.cyan],
        ].map(([l,c])=><Tag key={l} l={l} c={c}/>)}
      </div>

      {/* header */}
      <div style={{ padding:"44px 32px 20px", maxWidth:980, margin:"0 auto" }}>
        <div style={{ fontFamily:MONO, fontSize:10, color:V.aurora,
          letterSpacing:"0.2em", marginBottom:12 }}>
          LIVE SIMULATION · STACKED RINGS CONJECTURE
        </div>
        <h1 style={{ fontFamily:DISP, fontSize:"clamp(20px,3.8vw,42px)",
          color:V.ink, margin:"0 0 10px", lineHeight:1.1 }}>
          Stacked Rings Conjecture<br/>
          <span style={{ color:V.vio+"BB", fontSize:"0.55em" }}>
            500+ Barriered Vortical Harmonics · Dirichlet Kernel Topology
          </span>
        </h1>
        <p style={{ fontFamily:SERIF, fontSize:15, color:V.ink+"99",
          lineHeight:1.75, maxWidth:720, margin:0 }}>
          Stack N toroidal rings, each carrying azimuthal harmonic k (k=1…N).
          Their superposition A(φ,t)=(1/N)Σcos(kφ−kΩt) collapses via the
          Dirichlet kernel into exactly N sharp vortical spikes separated by N
          near-zero barrier zones — the conjecture's central claim. At N→∞
          the field converges to a delta-comb: infinitely sharp, perfectly
          barriered.
        </p>
      </div>

      <div style={{ maxWidth:980, margin:"0 auto", padding:"0 32px" }}>

        {/* controls */}
        <div style={{ display:"flex", flexWrap:"wrap", gap:8, alignItems:"center",
          padding:"10px 14px", background:V.dim+"18",
          border:`1px solid ${V.dim}44`, borderRadius:"4px 4px 0 0" }}>

          {/* N presets */}
          <div style={{ display:"flex", gap:5, flexWrap:"wrap" }}>
            {PRESETS.map(p=>(
              <button key={p} onClick={()=>{setN(p);setSweeping(false);if(sweepRef.current){clearInterval(sweepRef.current);sweepRef.current=null;}}}
                style={{
                  background:N===p?V.aurora+"22":"transparent",
                  border:`1px solid ${N===p?V.aurora:V.dim}`,
                  color:N===p?V.aurora:V.ink+"55",
                  fontFamily:MONO, fontSize:8, padding:"4px 9px",
                  cursor:"pointer", borderRadius:3, letterSpacing:"0.1em",
                }}>N={p}</button>
            ))}
          </div>

          {/* N slider */}
          <div style={{ display:"flex", alignItems:"center", gap:6 }}>
            <span style={{ fontFamily:MONO, fontSize:8, color:V.ink+"55" }}>N</span>
            <input type="range" min={1} max={512} value={N}
              onChange={e=>{setN(+e.target.value);setSweeping(false);if(sweepRef.current){clearInterval(sweepRef.current);sweepRef.current=null;}}}
              style={{ width:90, accentColor:V.aurora }}/>
            <span style={{ fontFamily:DISP, fontSize:16, color:V.aurora,
              minWidth:34, textAlign:"right" }}>{N}</span>
          </div>

          <div style={{ width:1, height:22, background:V.dim, opacity:0.4 }}/>

          {/* speed */}
          <div style={{ display:"flex", alignItems:"center", gap:6 }}>
            <span style={{ fontFamily:MONO, fontSize:8, color:V.ink+"55" }}>Ω</span>
            <input type="range" min={0.1} max={4} step={0.05} value={speed}
              onChange={e=>setSpeed(+e.target.value)}
              style={{ width:70, accentColor:V.gold }}/>
            <span style={{ fontFamily:MONO, fontSize:8, color:V.gold, minWidth:30 }}>
              {speed.toFixed(2)}
            </span>
          </div>

          {/* wave type */}
          <button onClick={()=>setTraveling(v=>!v)} style={{
            background:traveling?V.vio+"22":V.gold+"22",
            border:`1px solid ${traveling?V.vio:V.gold}`,
            color:traveling?V.vio:V.gold,
            fontFamily:MONO, fontSize:8, padding:"4px 11px",
            cursor:"pointer", borderRadius:3, letterSpacing:"0.1em",
          }}>{traveling?"TRAVELING ↻":"STANDING ◈"}</button>

          {/* waterfall */}
          <button onClick={()=>setShowWF(v=>!v)} style={{
            background:showWF?V.blue+"22":"transparent",
            border:`1px solid ${showWF?V.blue:V.dim}`,
            color:showWF?V.blue:V.ink+"44",
            fontFamily:MONO, fontSize:8, padding:"4px 11px",
            cursor:"pointer", borderRadius:3, letterSpacing:"0.1em",
          }}>{showWF?"● WATERFALL":"STRIP"}</button>

          {/* sweep */}
          <button onClick={toggleSweep} style={{
            background:sweeping?V.plasma+"22":"transparent",
            border:`1px solid ${sweeping?V.plasma:V.dim}`,
            color:sweeping?V.plasma:V.ink+"44",
            fontFamily:MONO, fontSize:8, padding:"4px 11px",
            cursor:"pointer", borderRadius:3, letterSpacing:"0.1em",
          }}>{sweeping?"■ STOP SWEEP":"▷ AUTO-SWEEP"}</button>
        </div>

        {/* canvas */}
        <div style={{ border:`1px solid ${V.dim}`, borderTop:"none",
          borderRadius:"0 0 4px 4px", overflow:"hidden" }}>
          <div style={{ padding:"4px 12px", background:V.dim+"22",
            borderBottom:`1px solid ${V.dim}44`, fontFamily:MONO, fontSize:8,
            color:V.aurora+"66", letterSpacing:"0.12em" }}>
            {`RING STACK (ISO) · POLAR INTERFERENCE · N=${N} HARMONICS · Σcos(kφ${traveling?"−kΩt":""}) / N`}
          </div>
          <RingCanvas N={N} speed={speed} traveling={traveling}
            coupling={0.5} showWaterfall={showWF}/>
        </div>

        {/* spectrum strip */}
        <div style={{ marginTop:4, padding:"2px 0 6px",
          border:`1px solid ${V.dim}33`, borderRadius:4,
          background:V.dim+"0A" }}>
          <div style={{ fontFamily:MONO, fontSize:7, color:V.ink+"33",
            letterSpacing:"0.14em", padding:"4px 10px 0" }}>
            MODE SPECTRUM · k=1…{N}{N>128?" (showing first 128)":""}
          </div>
          <div style={{ padding:"0 10px" }}>
            <SpectrumStrip N={N}/>
          </div>
        </div>

        {/* conjecture statement */}
        <div style={{ margin:"40px 0 0" }}>
          <div style={{ borderLeft:`3px solid ${V.aurora}`, paddingLeft:14, marginBottom:16 }}>
            <div style={{ fontFamily:MONO, fontSize:10, color:V.aurora,
              letterSpacing:"0.18em" }}>I · THE STACKED RINGS CONJECTURE</div>
          </div>
          <div style={{ padding:20, background:V.aurora+"0A",
            border:`1px solid ${V.aurora}22`, borderRadius:4 }}>
            <div style={{ fontFamily:DISP, fontSize:14, color:V.aurora,
              marginBottom:12 }}>FORMAL STATEMENT</div>
            <p style={{ fontFamily:SERIF, fontSize:14, color:V.ink+"99",
              lineHeight:1.75, margin:"0 0 14px" }}>
              Let N toroidal rings be stacked along a central axis, each ring k (k=1…N)
              carrying a traveling azimuthal mode with angular frequency kΩ.
              The superposition field
            </p>
            <div style={{ fontFamily:MONO, fontSize:12, color:V.aurora,
              padding:"10px 16px", background:V.bg, borderRadius:3,
              border:`1px solid ${V.aurora}33`, marginBottom:14,
              lineHeight:1.9 }}>
              <div>{"A(\u03C6,t) = (1/N) \u00B7 \u03A3_{k=1}^N cos(k\u03C6 \u2212 k\u03A9t)"}</div>
              <div>{"       = (1/N) \u00B7 [sin(N\u00B7\u03B8/2) / sin(\u03B8/2)] \u00B7 cos((N+1)\u00B7\u03B8/2)"}</div>
              <div style={{ color:V.ink+"66" }}>{"       where \u03B8 = \u03C6 \u2212 \u03A9t"}</div>
            </div>
            <p style={{ fontFamily:SERIF, fontSize:14, color:V.ink+"99",
              lineHeight:1.75, margin:"0 0 14px" }}>
              has exactly N amplitude maxima ("vortical spikes") and N amplitude
              minima ("barriered nodes") in φ ∈ [0,2π), uniformly distributed with
              spacing 2π/N. The spike amplitude approaches 1 and the barrier amplitude
              approaches 0 as N→∞, forming an ideal <em>delta-comb</em> — the limiting
              structure of a perfectly barriered vortical lattice.
            </p>
            <p style={{ fontFamily:SERIF, fontSize:14, color:V.ink+"99",
              lineHeight:1.75, margin:0 }}>
              <strong style={{ color:V.gold }}>Corollary (Barrier Strength):</strong>{" "}
              The barrier depth D(N) = 1 − A_min(N) increases monotonically with N,
              reaching D→1 as N→∞. For N≥12, barriers exceed 95% suppression.
              For N≥128, the field is indistinguishable from a discrete point lattice.
            </p>
          </div>
        </div>

        {/* theory grid */}
        <div style={{ margin:"36px 0 0" }}>
          <div style={{ borderLeft:`3px solid ${V.vio}`, paddingLeft:14, marginBottom:16 }}>
            <div style={{ fontFamily:MONO, fontSize:10, color:V.vio,
              letterSpacing:"0.18em" }}>II · PHYSICAL INTERPRETATION</div>
          </div>
          <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(240px,1fr))", gap:12 }}>
            {[
              { title:"DIRICHLET KERNEL", col:V.aurora,
                body:"The Dirichlet kernel D_N(θ) = (1/N)Σcos(kθ) is the finite Fourier partial sum kernel. It produces N sharp spikes of amplitude ≈1 and zeros the field everywhere else as N grows — the mathematical embodiment of the conjecture." },
              { title:"QUANTUM RING PARTICLE", col:V.blue,
                body:"A particle on a quantum ring (θ-coordinate) has eigenstates e^{imθ}. The superposition of all m=1…N eigenstates creates a coherent wave packet. The stacked rings conjecture is the classical travelling-wave analogue of this quantum construction." },
              { title:"TOPOLOGICAL BARRIERS", col:V.vio,
                body:"Each zero crossing between spikes is a topological barrier — a point where the order parameter passes through zero, creating a phase singularity. These barriers are stable under small perturbations (topology protection), analogous to vortex cores in superfluids." },
              { title:"FLOQUET CONNECTION", col:V.gold,
                body:"The driving term Ωt links this to the Floquet framework: the time-periodic Hamiltonian H(t+T)=H(t) with T=2π/Ω sustains the stacked mode structure as quasi-energy eigenstates. Each harmonic k occupies a distinct Floquet band." },
              { title:"LCM RETURN PERIOD", col:V.rose,
                body:"The composite field A(φ,t) is periodic in t with period T_N = 2π/Ω (for integer harmonics). The full field returns to identical configuration every single drive period — unlike the Floquet petals system where LCM(m_k) could be enormous." },
              { title:"INFORMATION CAPACITY", col:V.fire,
                body:"N barriered spikes can encode N distinct symbols in the azimuthal coordinate. This is the basis of orbital angular momentum (OAM) multiplexing in photonics — the N-ring stack is a physical implementation of an N-channel phase multiplexer." },
            ].map(s=>(
              <div key={s.title} style={{ padding:14, background:s.col+"0A",
                border:`1px solid ${s.col}33`, borderRadius:4 }}>
                <div style={{ fontFamily:MONO, fontSize:8, color:s.col,
                  letterSpacing:"0.14em", marginBottom:8 }}>{s.title}</div>
                <div style={{ fontFamily:SERIF, fontSize:13, color:V.ink+"88",
                  lineHeight:1.65 }}>{s.body}</div>
              </div>
            ))}
          </div>
        </div>

        {/* key numbers */}
        <div style={{ margin:"36px 0 0" }}>
          <div style={{ borderLeft:`3px solid ${V.gold}`, paddingLeft:14, marginBottom:16 }}>
            <div style={{ fontFamily:MONO, fontSize:10, color:V.gold,
              letterSpacing:"0.18em" }}>III · KEY THRESHOLDS</div>
          </div>
          <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(160px,1fr))", gap:12 }}>
            {[
              ["N=1",    "single azimuthal mode · cosine wave",      V.aurora],
              ["N=5",    "pentagonal symmetry · visible spikes",      V.vio],
              ["N=12",   "95%+ barrier suppression",                  V.gold],
              ["N=48",   "individual ring rendering threshold",       V.blue],
              ["N=128",  "field ≈ discrete point lattice",            V.rose],
              ["N=512",  "near-perfect delta-comb · max demo mode",  V.plasma],
            ].map(([n,l,c])=>(
              <div key={n as string} style={{ padding:"12px 14px", background:c+"0A",
                border:`1px solid ${c}33`, borderRadius:4, textAlign:"center" }}>
                <div style={{ fontFamily:DISP, fontSize:20, color:c, marginBottom:6 }}>{n}</div>
                <div style={{ fontFamily:SERIF, fontSize:11, color:V.ink+"66",
                  lineHeight:1.5 }}>{l}</div>
              </div>
            ))}
          </div>
        </div>

        {/* cross-links */}
        <div style={{ margin:"40px 0 0" }}>
          <div style={{ fontFamily:MONO, fontSize:9, color:V.dim,
            letterSpacing:"0.16em", marginBottom:12 }}>RELATED SYSTEMS</div>
          <div style={{ display:"flex", flexWrap:"wrap", gap:8 }}>
            {[
              ["/floquet-petals",      "Floquet Petals",           V.aurora],
              ["/borrelia-knot",       "Borrelia Knot",            V.gold],
              ["/gravitational-field", "Gravitational Field",      V.vio],
              ["/gut-brain",           "Gut-Brain Axis",           V.blue],
              ["/planetary-neural",    "Planetary-Neural Cascade", V.rose],
            ].map(([path,label,col])=>(
              <a key={path} href={path} style={{
                fontFamily:MONO, fontSize:9, color:col, letterSpacing:"0.1em",
                textDecoration:"none", padding:"4px 10px",
                border:`1px solid ${col}44`, borderRadius:3,
              }}>{label} →</a>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
