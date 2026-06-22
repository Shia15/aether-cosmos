import { useEffect, useRef, useState } from "react";

/* ── palette ─────────────────────────────────────────── */
const BG   = "#030608";
const TEAL = "#2ef0d8";
const GOLD = "#c9a84c";
const ROSE = "#ff4477";
const BLUE = "#44aaff";
const VIO  = "#9966ff";
const mono = "'Space Mono', monospace";

/* ── grid ────────────────────────────────────────────── */
const GW = 260, GH = 200;

/* ── Chladni modes (m, n) ────────────────────────────── */
const MODES: [number,number][] = [
  [2,3],[3,4],[4,5],[2,5],[3,5],[1,4],
  [4,7],[3,7],[5,6],[2,7],[3,8],[5,7],
];
const MODE_LABELS = MODES.map(([m,n]) => `(${m},${n})`);

/* ── spatial field ──────────────────────────────────── */
function chladniField(m: number, n: number): Float32Array {
  const f = new Float32Array(GW * GH);
  for (let y = 0; y < GH; y++) {
    for (let x = 0; x < GW; x++) {
      const px = x / (GW - 1), py = y / (GH - 1);
      f[y*GW+x] = Math.cos(m*Math.PI*px)*Math.cos(n*Math.PI*py)
                - Math.cos(n*Math.PI*px)*Math.cos(m*Math.PI*py);
    }
  }
  return f;
}

function gradAbsField(f: Float32Array): [Float32Array, Float32Array] {
  const gx = new Float32Array(GW * GH);
  const gy = new Float32Array(GW * GH);
  for (let y = 1; y < GH-1; y++) {
    for (let x = 1; x < GW-1; x++) {
      const i = y*GW+x;
      gx[i] = (Math.abs(f[i+1]) - Math.abs(f[i-1])) * 0.5;
      gy[i] = (Math.abs(f[i+GW]) - Math.abs(f[i-GW])) * 0.5;
    }
  }
  return [gx, gy];
}

/* ── color helpers ──────────────────────────────────── */
function hexRgb(h: string): [number,number,number] {
  const n = parseInt(h.replace("#",""),16);
  return [(n>>16)&255,(n>>8)&255,n&255];
}
function lerp3(
  a:[number,number,number], b:[number,number,number], t:number
):[number,number,number] {
  return [a[0]+(b[0]-a[0])*t|0, a[1]+(b[1]-a[1])*t|0, a[2]+(b[2]-a[2])*t|0];
}

/* ── acoustic field color map ────────────────────────── */
const cTEAL = hexRgb(TEAL), cGOLD = hexRgb(GOLD), cROSE = hexRgb(ROSE);
const cVIO  = hexRgb(VIO),  cBLUE = hexRgb(BLUE),  cBG   = hexRgb(BG);
const WHITE:[number,number,number] = [240,245,255];
const NODAL_THRESH = 0.06;

function acousticColor(z: number, t: number): [number,number,number] {
  const osc = Math.sin(t * 0.06);
  const v = z * osc;
  const n = Math.max(-1, Math.min(1, v));
  if (Math.abs(z) < NODAL_THRESH) return WHITE; // nodal line
  if (n > 0) return n < 0.5 ? lerp3(cBG, cTEAL, n*2) : lerp3(cTEAL, cGOLD, (n-0.5)*2);
  const m = -n;
  return m < 0.5 ? lerp3(cBG, cVIO, m*2) : lerp3(cVIO, cROSE, (m-0.5)*2);
}

/* ── ice color map ───────────────────────────────────── */
const ICE_DEEP:[number,number,number] = [8,24,44];
const ICE_COLD:[number,number,number] = [70,160,220];
const ICE_PALE:[number,number,number] = [200,235,255];

function iceColor(age: number, maxAge: number): [number,number,number] {
  const t = Math.min(1, age / maxAge);
  return t < 0.5 ? lerp3(ICE_COLD, ICE_PALE, t*2) : lerp3(ICE_PALE, WHITE, (t-0.5)*2);
}

/* ── differential color ──────────────────────────────── */
function diffColor(nodal: boolean, frozen: boolean): [number,number,number] {
  if (nodal  && frozen)  return cTEAL;             // acoustic-crystallization agreement
  if (nodal  && !frozen) return hexRgb(GOLD);      // nodal but still liquid
  if (!nodal && frozen)  return hexRgb(ROSE);      // frozen spontaneously (decoherent)
  return [4, 10, 18];                              // bulk liquid + vibrating field
}

/* ════════════════════════════════════════════════════
   PAGE
════════════════════════════════════════════════════ */
export default function ChladniFreezeSimPage() {
  const rootRef   = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rafRef    = useRef(0);
  const sizeRef   = useRef({ W: 900, H: 600 });

  const [modeIdx,   setModeIdx]   = useState(0);
  const [coupling,  setCoupling]  = useState(0.65);
  const [simSpeed,  setSimSpeed]  = useState(1);
  const [viewMode,  setViewMode]  = useState<"coupled"|"acoustic"|"freeze"|"diff">("coupled");
  const [frozen,    setFrozen]    = useState(0);

  const parRef   = useRef({ modeIdx, coupling, simSpeed, viewMode });
  parRef.current = { modeIdx, coupling, simSpeed, viewMode };
  const resetRef = useRef(false);

  useEffect(() => {
    const cv   = canvasRef.current;
    const root = rootRef.current;
    if (!cv || !root) return;
    const ctx  = cv.getContext("2d")!;

    /* offscreen panel buffers */
    const offA = document.createElement("canvas"); offA.width = GW; offA.height = GH;
    const offF = document.createElement("canvas"); offF.width = GW; offF.height = GH;
    const offD = document.createElement("canvas"); offD.width = GW; offD.height = GH;
    const ctxA = offA.getContext("2d")!;
    const ctxF = offF.getContext("2d")!;
    const ctxD = offD.getContext("2d")!;
    const imgA = ctxA.createImageData(GW, GH), pxA = imgA.data;
    const imgF = ctxF.createImageData(GW, GH), pxF = imgF.data;
    const imgD = ctxD.createImageData(GW, GH), pxD = imgD.data;

    /* field buffers, updated on mode change */
    let field    = new Float32Array(GW * GH);
    let gx       = new Float32Array(GW * GH);
    let gy_      = new Float32Array(GW * GH);
    let iceGrid  = new Uint16Array(GW * GH);  // 0=liquid, >0=frozen (age)
    let frontier = new Set<number>();

    function rebuildMode(mi: number) {
      const [m, n] = MODES[mi];
      field = chladniField(m, n);
      [gx, gy_] = gradAbsField(field);
      iceGrid  = new Uint16Array(GW * GH);
      frontier = new Set<number>();
      // seed from center
      const cx = Math.round(GW/2), cy = Math.round(GH/2);
      for (let dy = -2; dy <= 2; dy++) {
        for (let dx = -2; dx <= 2; dx++) {
          const i = (cy+dy)*GW+(cx+dx);
          if (i >= 0 && i < GW*GH) {
            iceGrid[i] = 1;
            addFrontier(i);
          }
        }
      }
    }

    function addFrontier(i: number) {
      const x = i % GW, y = Math.floor(i / GW);
      for (const [dx,dy] of [[-1,0],[1,0],[0,-1],[0,1]]) {
        const nx = x+dx, ny = y+dy;
        if (nx<0||nx>=GW||ny<0||ny>=GH) continue;
        const ni = ny*GW+nx;
        if (iceGrid[ni] === 0) frontier.add(ni);
      }
    }

    rebuildMode(0);
    let lastModeIdx = 0;

    /* particles */
    const N_PARTICLES = 380;
    const parts = Array.from({ length: N_PARTICLES }, () => ({
      x: Math.random() * GW,
      y: Math.random() * GH,
      vx: (Math.random()-0.5)*0.4,
      vy: (Math.random()-0.5)*0.4,
    }));

    /* resize */
    const resize = () => {
      const W = root.clientWidth, H = root.clientHeight;
      const dpr = window.devicePixelRatio||1;
      cv.width = W*dpr; cv.height = H*dpr;
      cv.style.width = W+"px"; cv.style.height = H+"px";
      ctx.setTransform(dpr,0,0,dpr,0,0);
      sizeRef.current = { W, H };
    };
    resize();
    const ro = new ResizeObserver(resize); ro.observe(root);

    let t = 0;
    let frozenCount = 0;

    function stepFreeze(coupling_: number, speed: number) {
      const stepsPerFrame = Math.max(1, Math.round(speed * 4));
      for (let s = 0; s < stepsPerFrame; s++) {
        if (frontier.size === 0) break;
        const frontierArr = [...frontier];
        const tries = Math.min(frontierArr.length, 80);
        for (let k = 0; k < tries; k++) {
          const idx = frontierArr[Math.floor(Math.random()*frontierArr.length)];
          const amp = Math.abs(field[idx]);
          // freeze probability: high at nodal lines (low amp)
          const p = coupling_ * (1 - amp) + 0.003;
          if (Math.random() < p) {
            iceGrid[idx] = frozenCount + 1;
            frozenCount++;
            frontier.delete(idx);
            addFrontier(idx);
          }
        }
      }
    }

    function renderAcoustic(t_: number) {
      for (let i = 0; i < GW*GH; i++) {
        const [r,g,b] = acousticColor(field[i], t_);
        pxA[i*4]=r; pxA[i*4+1]=g; pxA[i*4+2]=b; pxA[i*4+3]=255;
      }
      ctxA.putImageData(imgA, 0, 0);
    }

    function renderFreeze(maxAge: number) {
      for (let i = 0; i < GW*GH; i++) {
        const age = iceGrid[i];
        let r,g,b;
        if (age > 0) {
          [r,g,b] = iceColor(age, Math.max(1, maxAge*0.8));
        } else if (frontier.has(i)) {
          // frontier glow
          const a = Math.abs(field[i]);
          r = Math.round(8 + (1-a)*30); g = Math.round(24+(1-a)*80); b = Math.round(44+(1-a)*120);
        } else {
          [r,g,b] = ICE_DEEP;
        }
        pxF[i*4]=r; pxF[i*4+1]=g; pxF[i*4+2]=b; pxF[i*4+3]=255;
      }
      ctxF.putImageData(imgF, 0, 0);
    }

    function renderDiff() {
      for (let i = 0; i < GW*GH; i++) {
        const nodal  = Math.abs(field[i]) < NODAL_THRESH;
        const frozen_ = iceGrid[i] > 0;
        const [r,g,b] = diffColor(nodal, frozen_);
        pxD[i*4]=r; pxD[i*4+1]=g; pxD[i*4+2]=b; pxD[i*4+3]=255;
      }
      ctxD.putImageData(imgD, 0, 0);
    }

    function draw() {
      const { modeIdx: mi, coupling: cp, simSpeed: sp, viewMode: vm } = parRef.current;
      const { W, H } = sizeRef.current;

      if (mi !== lastModeIdx) { rebuildMode(mi); lastModeIdx = mi; frozenCount = 0; }
      if (resetRef.current) { rebuildMode(lastModeIdx); frozenCount = 0; resetRef.current = false; }

      t++;
      for (let iter = 0; iter < Math.max(1,Math.round(sp)); iter++) {
        stepFreeze(cp, sp);
      }

      // update particles
      const DAMPING = 0.88, FORCE = 0.12, NOISE = 0.05;
      parts.forEach(p => {
        const xi = Math.max(0, Math.min(GW-1, Math.round(p.x))) | 0;
        const yi = Math.max(0, Math.min(GH-1, Math.round(p.y))) | 0;
        const i  = yi*GW+xi;
        p.vx += -gx[i]*FORCE + (Math.random()-0.5)*NOISE;
        p.vy += -gy_[i]*FORCE + (Math.random()-0.5)*NOISE;
        p.vx *= DAMPING; p.vy *= DAMPING;
        p.x  += p.vx; p.y += p.vy;
        if (p.x < 0) { p.x = 0; p.vx *= -0.5; }
        if (p.x > GW-1) { p.x = GW-1; p.vx *= -0.5; }
        if (p.y < 0) { p.y = 0; p.vy *= -0.5; }
        if (p.y > GH-1) { p.y = GH-1; p.vy *= -0.5; }
      });

      // render panels
      renderAcoustic(t);
      renderFreeze(frozenCount);
      renderDiff();

      // notify frozen %
      const pct = Math.round(frozenCount*100/(GW*GH));
      setFrozen(pct);

      ctx.fillStyle = BG; ctx.fillRect(0, 0, W, H);
      ctx.imageSmoothingEnabled = false;

      const CTRL_H = 44;
      const CH = H - CTRL_H;

      if (vm === "coupled") {
        const AW = Math.round(W * 0.455);
        const DW = Math.round(W * 0.09);
        const FX = AW + DW;
        const FW = W - FX;
        ctx.drawImage(offA, 0,      0, AW, CH);
        ctx.drawImage(offD, AW,     0, DW, CH);
        ctx.drawImage(offF, FX,     0, FW, CH);
        // dividers
        ctx.fillStyle = "rgba(46,240,216,0.15)"; ctx.fillRect(AW,0,1,CH);
        ctx.fillStyle = "rgba(46,240,216,0.15)"; ctx.fillRect(FX,0,1,CH);
        // panel labels
        ctx.font = `6px ${mono}`; ctx.textAlign="center";
        ctx.fillStyle="rgba(46,240,216,0.45)"; ctx.fillText("ACOUSTIC FIELD · CHLADNI NODAL LINES · PARTICLES SETTLE AT ZERO DISPLACEMENT",AW/2,14);
        ctx.fillStyle="rgba(201,168,76,0.4)";  ctx.fillText("DIFF",AW+DW/2,14);
        ctx.fillStyle="rgba(100,180,240,0.45)"; ctx.fillText("FREEZING PATTERN · DENDRITIC CRYSTALLISATION · COUPLED TO ACOUSTIC FIELD",FX+FW/2,14);
      } else if (vm === "acoustic") {
        ctx.drawImage(offA, 0, 0, W, CH);
        ctx.font = `6px ${mono}`; ctx.textAlign="center"; ctx.fillStyle="rgba(46,240,216,0.4)";
        ctx.fillText("ACOUSTIC FIELD · CHLADNI NODAL LINES · PARTICLES SETTLE AT ZERO DISPLACEMENT", W/2, 14);
      } else if (vm === "freeze") {
        ctx.drawImage(offF, 0, 0, W, CH);
        ctx.font = `6px ${mono}`; ctx.textAlign="center"; ctx.fillStyle="rgba(100,180,240,0.4)";
        ctx.fillText("FREEZING PATTERN · DENDRITIC CRYSTALLISATION · ACOUSTIC-COUPLED NUCLEATION", W/2, 14);
      } else {
        ctx.drawImage(offD, 0, 0, W, CH);
        ctx.font = `6px ${mono}`; ctx.textAlign="center"; ctx.fillStyle="rgba(201,168,76,0.4)";
        ctx.fillText("DIFFERENTIAL · TEAL=ACOUSTIC-DRIVEN FREEZE · GOLD=NODAL NOT FROZEN · ROSE=SPONTANEOUS FREEZE", W/2, 14);
        // legend
        ctx.font = `5.5px ${mono}`; ctx.textAlign="left";
        [[TEAL,"Acoustic-crystallisation agreement"],[GOLD,"Nodal line — not yet frozen"],[ROSE,"Spontaneous (thermal) freezing"]].forEach(([c,l],i) => {
          ctx.fillStyle = c as string; ctx.fillRect(W-200, 28+i*14, 8, 8);
          ctx.fillStyle="rgba(200,210,220,0.4)"; ctx.fillText(l as string, W-188, 36+i*14);
        });
      }

      // Particles (on acoustic or coupled view)
      if (vm === "acoustic" || vm === "coupled") {
        const scX = vm === "coupled" ? (W * 0.455) / GW : W / GW;
        const scY = CH / GH;
        ctx.save();
        if (vm === "coupled") ctx.rect(0,0,W*0.455,CH); // clip to acoustic panel
        parts.forEach(p => {
          const xi = Math.max(0, Math.min(GW-1,Math.round(p.x)))|0;
          const yi = Math.max(0, Math.min(GH-1,Math.round(p.y)))|0;
          const atNode = Math.abs(field[yi*GW+xi]) < NODAL_THRESH;
          ctx.beginPath();
          ctx.arc(p.x*scX, p.y*scY, atNode?1.8:1.0, 0, Math.PI*2);
          ctx.fillStyle = atNode ? "rgba(255,250,240,0.85)" : "rgba(200,200,200,0.22)";
          ctx.fill();
        });
        ctx.restore();
      }

      // Mode info overlay (top-left)
      const [m,n] = MODES[parRef.current.modeIdx];
      ctx.font = `bold 9px ${mono}`; ctx.fillStyle = TEAL; ctx.textAlign = "left";
      ctx.fillText(`MODE ${MODE_LABELS[parRef.current.modeIdx]}  f ∝ √(m²+n²)`, 10, 28);
      ctx.font = `6px ${mono}`; ctx.fillStyle = "rgba(46,240,216,0.4)";
      ctx.fillText(`cos(${m}πx)cos(${n}πy) − cos(${n}πx)cos(${m}πy)`, 10, 40);

      // Coherence bar (bottom of canvas)
      const barY = CH - 5;
      const barW = W * 0.4;
      const barX = (W - barW) / 2;
      const cohFrac = parRef.current.viewMode !== "acoustic" ? frozen/100 : 0;
      ctx.fillStyle = "rgba(46,240,216,0.1)"; ctx.fillRect(barX, barY, barW, 3);
      ctx.fillStyle = `rgba(100,180,240,0.65)`; ctx.fillRect(barX, barY, barW*cohFrac, 3);

      // scan lines
      for (let sl = 0; sl < CH; sl += 4) {
        ctx.fillStyle = "rgba(0,0,0,0.018)"; ctx.fillRect(0, sl, W, 1);
      }

      rafRef.current = requestAnimationFrame(draw);
    }

    rafRef.current = requestAnimationFrame(draw);
    return () => { cancelAnimationFrame(rafRef.current); ro.disconnect(); };
  }, []);

  /* ── styles ─── */
  const lbl: React.CSSProperties = { fontFamily:mono, fontSize:9, color:`${TEAL}88`, letterSpacing:"0.08em", userSelect:"none" };
  const val: React.CSSProperties = { fontFamily:mono, fontSize:9, color:`${TEAL}cc`, minWidth:30, textAlign:"right" };
  const sep: React.CSSProperties = { width:1, height:28, background:"rgba(46,240,216,0.12)" };
  const slid: React.CSSProperties = { width:80, accentColor:TEAL };
  const btn = (active: boolean, color = TEAL): React.CSSProperties => ({
    fontFamily:mono, fontSize:9, letterSpacing:"0.1em", padding:"5px 10px",
    cursor:"pointer", border:`1px solid`, borderRadius:4, background:"transparent",
    borderColor: active ? color : "rgba(46,240,216,0.2)",
    color: active ? color : "rgba(46,240,216,0.35)",
  });

  return (
    <div style={{ width:"100%", height:"100%", position:"relative", overflow:"hidden", background:BG, display:"flex", flexDirection:"column" }}>

      <div ref={rootRef} style={{ flex:1, position:"relative", overflow:"hidden" }}>
        <canvas ref={canvasRef} style={{ position:"absolute", inset:0 }} />

        {/* header */}
        <div style={{ position:"absolute", top:8, left:10, zIndex:10, pointerEvents:"none" }}>
          <div style={{ display:"inline-block", border:`1px solid ${TEAL}88`, padding:"3px 10px", fontSize:9, letterSpacing:"0.18em", color:`${TEAL}aa`, fontFamily:"'DM Mono',monospace", marginBottom:5 }}>LIVE SIMULATION</div>
          <div style={{ fontFamily:"'DM Mono',monospace", fontSize:"0.5rem", letterSpacing:3, color:`${TEAL}48` }}>CHLADNI ACOUSTIC PATTERNS · FREEZING DIFFERENTIAL · NODAL CRYSTALLISATION · AETHER</div>
        </div>

        {/* stats overlay (top-right) */}
        <div style={{ position:"absolute", top:8, right:12, zIndex:10, pointerEvents:"none", textAlign:"right" }}>
          <div style={{ fontFamily:mono, fontSize:6, color:`${TEAL}66`, letterSpacing:1 }}>FROZEN</div>
          <div style={{ fontFamily:mono, fontSize:10, color:`${BLUE}cc` }}>{frozen}%</div>
          <div style={{ fontFamily:mono, fontSize:6, color:`${TEAL}44`, marginTop:4, letterSpacing:1 }}>COUPLING</div>
          <div style={{ fontFamily:mono, fontSize:10, color:`${GOLD}bb` }}>{(parRef.current?.coupling??0.65).toFixed(2)}</div>
        </div>

        {/* differential legend (bottom-left, always visible) */}
        <div style={{ position:"absolute", bottom:50, left:10, zIndex:10, pointerEvents:"none", display:"flex", flexDirection:"column", gap:4 }}>
          {[
            [TEAL, "Nodal + frozen · acoustic crystallisation"],
            [GOLD, "Nodal · liquid · waiting to freeze"],
            [ROSE, "Frozen · not nodal · thermal nucleation"],
          ].map(([c,l]) => (
            <div key={l} style={{ display:"flex", alignItems:"center", gap:6 }}>
              <div style={{ width:7, height:7, borderRadius:1, background:c, flexShrink:0 }}/>
              <span style={{ fontFamily:mono, fontSize:5.5, color:`${c}88`, letterSpacing:0.5 }}>{l}</span>
            </div>
          ))}
        </div>
      </div>

      {/* controls bar */}
      <div style={{
        flexShrink:0, display:"flex", gap:12, alignItems:"center", justifyContent:"center",
        flexWrap:"wrap", background:"rgba(3,6,8,0.92)", borderTop:`1px solid rgba(46,240,216,0.12)`,
        padding:"9px 18px",
      }}>

        {/* mode stepper */}
        <span style={lbl}>MODE</span>
        <div style={{ display:"flex", gap:4 }}>
          <button onClick={() => setModeIdx(i => (i-1+MODES.length)%MODES.length)}
            style={{ ...btn(false), padding:"4px 8px" }}>◀</button>
          <span style={{ fontFamily:mono, fontSize:10, color:TEAL, minWidth:36, textAlign:"center", padding:"4px 0" }}>
            {MODE_LABELS[modeIdx]}
          </span>
          <button onClick={() => setModeIdx(i => (i+1)%MODES.length)}
            style={{ ...btn(false), padding:"4px 8px" }}>▶</button>
        </div>

        <div style={sep}/>

        <span style={lbl}>COUPLING</span>
        <input type="range" min="0.0" max="1.0" step="0.05" value={coupling} style={slid}
          onChange={e => setCoupling(parseFloat(e.target.value))} />
        <span style={val}>{coupling.toFixed(2)}</span>

        <div style={sep}/>

        <span style={lbl}>SPEED</span>
        <input type="range" min="0.5" max="4" step="0.5" value={simSpeed} style={slid}
          onChange={e => setSimSpeed(parseFloat(e.target.value))} />
        <span style={val}>{simSpeed}×</span>

        <div style={sep}/>

        <div style={{ display:"flex", gap:5 }}>
          {(["coupled","acoustic","freeze","diff"] as const).map(m => (
            <button key={m} onClick={() => setViewMode(m)} style={btn(viewMode===m)}>
              {m === "coupled" ? "COUPLED" : m === "acoustic" ? "ACOUSTIC" : m === "freeze" ? "FREEZE" : "DIFF"}
            </button>
          ))}
        </div>

        <div style={sep}/>

        <button onClick={() => { resetRef.current = true; }}
          style={{ ...btn(false), padding:"4px 10px", color:`${ROSE}88`, borderColor:`${ROSE}30` }}>
          RESET ICE
        </button>
      </div>
    </div>
  );
}
