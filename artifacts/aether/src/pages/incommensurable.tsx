import { useEffect, useRef, useState } from "react";

/* ── palette ─────────────────────────────────────────── */
const BG   = "#030508";
const TEAL = "#2ef0d8";
const GOLD = "#c9a84c";
const ROSE = "#ff4477";
const VIO  = "#9966ff";
const BLUE = "#44aaff";
const mono = "'Space Mono', monospace";
const DIM  = "rgba(180,190,200,0.45)";

/* ── irrationals ─────────────────────────────────────── */
type IrrKey = "√2" | "φ" | "π" | "e";
const IRRATIONALS: Record<IrrKey, { val: number; cf: number[]; name: string; desc: string }> = {
  "√2": { val: Math.SQRT2,            cf: [1,2,2,2,2,2,2,2,2,2,2,2], name: "√2 · The Diagonal", desc: "Side-to-diagonal of a unit square · [1; 2,2,2,…]" },
  "φ":  { val: (1+Math.sqrt(5))/2,    cf: [1,1,1,1,1,1,1,1,1,1,1,1], name: "φ · Golden Ratio",  desc: "Most irrational — slowest convergents · [1; 1,1,1,…]" },
  "π":  { val: Math.PI,               cf: [3,7,15,1,292,1,1,1,2,1,3,1], name: "π · Circle Ratio", desc: "Circumference ÷ diameter · [3; 7,15,1,292,…]" },
  "e":  { val: Math.E,                cf: [2,1,2,1,1,4,1,1,6,1,1,8],   name: "e · Euler Number",  desc: "Natural growth base · [2; 1,2,1,1,4,1,1,6,…]" },
};

/* ── continued fraction convergents ─────────────────── */
function convergents(cf: number[]): [number, number][] {
  const res: [number, number][] = [];
  let [hp, hc, kp, kc] = [1, cf[0], 0, 1];
  res.push([hc, kc]);
  for (let i = 1; i < cf.length; i++) {
    const a = cf[i];
    const hn = a*hc + hp, kn = a*kc + kp;
    hp=hc; hc=hn; kp=kc; kc=kn;
    res.push([hc, kc]);
  }
  return res;
}

/* ── anthyphairesis boxes ────────────────────────────── */
type Box = { x:number; y:number; w:number; h:number; depth:number };
const DEPTH_COLORS = [TEAL,GOLD,ROSE,VIO,BLUE,"#88ff44","#ff8800","#ff44cc","#00ddff","#ffee00","#44ff88","#cc88ff"];

function anthyphairesis(
  x:number, y:number, w:number, h:number,
  depth:number, maxD:number, boxes:Box[], minSz=0.8
): void {
  if (depth > maxD || Math.min(w,h) < minSz) return;
  if (w >= h) {
    const n = Math.max(1, Math.floor(w/h + 1e-9));
    for (let i = 0; i < n; i++) boxes.push({x:x+i*h, y, w:h, h, depth});
    const rem = w - n*h;
    if (rem > minSz) anthyphairesis(x+n*h, y, rem, h, depth+1, maxD, boxes, minSz);
  } else {
    const n = Math.max(1, Math.floor(h/w + 1e-9));
    for (let i = 0; i < n; i++) boxes.push({x, y:y+i*w, w, h:w, depth});
    const rem = h - n*w;
    if (rem > minSz) anthyphairesis(x, y+n*w, w, rem, depth+1, maxD, boxes, minSz);
  }
}

function hexToRgba(hex:string, a:number): string {
  const n = parseInt(hex.replace("#",""),16);
  return `rgba(${(n>>16)&255},${(n>>8)&255},${n&255},${a})`;
}

/* ════════════════════════════════════════════════════
   PAGE
════════════════════════════════════════════════════ */
export default function IncommensurablePage() {
  const rootRef   = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rafRef    = useRef(0);
  const sizeRef   = useRef({W:900, H:600});

  const [irrKey,  setIrrKey]  = useState<IrrKey>("√2");
  const [speed,   setSpeed]   = useState(1.0);
  const [revealN, setRevealN] = useState(0); // how many anthyphairesis levels revealed

  const parRef = useRef({irrKey, speed});
  parRef.current = {irrKey, speed};

  useEffect(() => {
    const cv   = canvasRef.current;
    const root = rootRef.current;
    if (!cv || !root) return;
    const ctx  = cv.getContext("2d")!;

    const resize = () => {
      const dpr = window.devicePixelRatio||1;
      const W = root.clientWidth, H = root.clientHeight;
      cv.width=W*dpr; cv.height=H*dpr;
      cv.style.width=W+"px"; cv.style.height=H+"px";
      ctx.setTransform(dpr,0,0,dpr,0,0);
      sizeRef.current = {W,H};
    };
    resize();
    const ro = new ResizeObserver(resize); ro.observe(root);

    let t = 0;
    let lastKey = "";
    let boxes: Box[] = [];
    let revealT = 0; // frames since last reveal
    let localReveal = 0;

    function rebuildBoxes(key: IrrKey, panelW: number, panelH: number) {
      const irr = IRRATIONALS[key];
      boxes = [];
      const margin = 14;
      const ph = panelH - margin*2;
      const pw = Math.min(panelW - margin*2, ph * irr.val * 1.05);
      // normalize: start w=irr.val, h=1 scaled to fit panel
      const scale = Math.min(ph / 1, pw / irr.val);
      const W0 = irr.val * scale;
      const H0 = 1 * scale;
      const ox = margin + (panelW - margin*2 - W0)*0.5;
      const oy = margin + (panelH - margin*2 - H0)*0.5;
      anthyphairesis(ox, oy, W0, H0, 0, 11, boxes);
      localReveal = 0;
    }

    // Lissajous trail ring-buffer
    const MAX_TRAIL = 2400;
    const lissX = new Float32Array(MAX_TRAIL);
    const lissY = new Float32Array(MAX_TRAIL);
    let lissHead = 0, lissFill = 0;

    let frame = 0;

    function draw() {
      const {irrKey:key, speed:sp} = parRef.current;
      const {W, H} = sizeRef.current;
      const CTRL_H = 44;
      const CH = H - CTRL_H;

      // Panel layout
      const PA_W = Math.round(W * 0.40); // anthyphairesis
      const PB_W = Math.round(W * 0.32); // lissajous
      const PC_W = W - PA_W - PB_W;      // convergents
      const PB_X = PA_W;
      const PC_X = PA_W + PB_W;

      // rebuild boxes on key or size change
      if (key !== lastKey) {
        rebuildBoxes(key, PA_W, CH);
        lastKey = key;
        lissFill = 0; lissHead = 0;
        revealT = 0;
        t = 0;
      }

      frame++;
      t += sp * 0.012;

      // Auto-reveal anthyphairesis levels
      revealT++;
      const revealInterval = Math.max(40, Math.round(90/sp));
      if (revealT >= revealInterval && localReveal < boxes.length) {
        // find depth breakpoint
        const curDepth = localReveal < boxes.length ? boxes[localReveal].depth : 99;
        let next = localReveal;
        while (next < boxes.length && boxes[next].depth <= curDepth) next++;
        localReveal = next;
        revealT = 0;
        setRevealN(localReveal);
      }

      // Lissajous point
      const irr = IRRATIONALS[key];
      const lx = Math.sin(t);
      const ly = Math.sin(irr.val * t);
      lissX[lissHead] = lx; lissY[lissHead] = ly;
      lissHead = (lissHead+1) % MAX_TRAIL;
      if (lissFill < MAX_TRAIL) lissFill++;

      // CLEAR
      ctx.fillStyle = BG; ctx.fillRect(0,0,W,H);

      /* ══ PANEL A — ANTHYPHAIRESIS ══ */
      ctx.save();
      ctx.beginPath(); ctx.rect(0,0,PA_W,CH); ctx.clip();

      // Draw revealed boxes
      for (let i = 0; i < Math.min(localReveal, boxes.length); i++) {
        const b = boxes[i];
        const col = DEPTH_COLORS[b.depth % DEPTH_COLORS.length];
        // fill with very low opacity
        ctx.fillStyle = hexToRgba(col, 0.06 + 0.02*Math.sin(t + b.depth));
        ctx.fillRect(b.x, b.y, b.w, b.h);
        // border
        ctx.strokeStyle = hexToRgba(col, 0.55);
        ctx.lineWidth = b.depth === 0 ? 1.5 : 0.8;
        ctx.strokeRect(b.x+0.5, b.y+0.5, b.w-1, b.h-1);
      }

      // Next box flashing (approaching)
      if (localReveal < boxes.length) {
        const nb = boxes[localReveal];
        const col = DEPTH_COLORS[nb.depth % DEPTH_COLORS.length];
        const flash = 0.3 + 0.3*Math.sin(frame*0.18);
        ctx.strokeStyle = hexToRgba(col, flash);
        ctx.setLineDash([3,3]);
        ctx.lineWidth = 0.7;
        ctx.strokeRect(nb.x+0.5, nb.y+0.5, nb.w-1, nb.h-1);
        ctx.setLineDash([]);
      }

      // Convergent label (current approximation fraction)
      const convs = convergents(irr.cf);
      const ci = Math.min(Math.floor(localReveal*0.5), convs.length-1);
      if (ci >= 0) {
        const [p,q] = convs[ci];
        const err = Math.abs(p/q - irr.val);
        ctx.font = `bold 9px ${mono}`; ctx.fillStyle = TEAL; ctx.textAlign="left";
        ctx.fillText(`≈ ${p}/${q} = ${(p/q).toFixed(7)}`, 12, CH-32);
        ctx.font = `7px ${mono}`; ctx.fillStyle = `${GOLD}99`;
        ctx.fillText(`error: ${err.toExponential(3)}  (never zero)`, 12, CH-20);
      }

      // Panel label
      ctx.font=`5.5px ${mono}`; ctx.fillStyle=`${TEAL}50`; ctx.textAlign="center";
      ctx.fillText("ANTHYPHAIRESIS · EUCLIDEAN SUBTRACTION · NEVER TERMINATES", PA_W/2, 11);
      ctx.restore();

      /* divider */
      ctx.fillStyle=`rgba(46,240,216,0.12)`; ctx.fillRect(PA_W,0,1,CH);

      /* ══ PANEL B — LISSAJOUS ══ */
      ctx.save();
      ctx.beginPath(); ctx.rect(PB_X,0,PB_W,CH); ctx.clip();

      const cx_liss = PB_X + PB_W/2;
      // top half: rational reference (1:2)
      const ratH = Math.round(CH*0.46);
      const ratRadius = Math.min(PB_W*0.40, ratH*0.40);
      const rcy = ratH/2;

      // rational lissajous: x=sin(t), y=sin(2t) → figure-8
      ctx.strokeStyle = hexToRgba(GOLD, 0.5);
      ctx.lineWidth = 0.8; ctx.beginPath();
      for (let i=0; i<=200; i++) {
        const a = i/200 * Math.PI*2;
        const rx = cx_liss + Math.sin(a)*ratRadius;
        const ry = rcy    + Math.sin(2*a)*ratRadius*0.5;
        i===0 ? ctx.moveTo(rx,ry) : ctx.lineTo(rx,ry);
      }
      ctx.closePath(); ctx.stroke();
      // animated position on rational
      const rpos_x = cx_liss + Math.sin(t*2)*ratRadius;
      const rpos_y = rcy    + Math.sin(t*4)*ratRadius*0.5;
      ctx.fillStyle=GOLD; ctx.beginPath(); ctx.arc(rpos_x,rpos_y,2.5,0,Math.PI*2); ctx.fill();

      // label rational
      ctx.font=`6px ${mono}`; ctx.fillStyle=`${GOLD}88`; ctx.textAlign="center";
      ctx.fillText("RATIONAL  1:2  · CLOSED · PERIODIC", cx_liss, 12);
      ctx.font=`5.5px ${mono}`; ctx.fillStyle=`${GOLD}55`;
      ctx.fillText("x=sin(t)  y=sin(2t)  →  complete figure-8", cx_liss, 22);

      // divider line between two lissajous
      ctx.fillStyle=`rgba(100,120,140,0.2)`; ctx.fillRect(PB_X, ratH, PB_W, 1);

      // bottom half: irrational lissajous
      const irrH = CH - ratH;
      const icy = ratH + irrH/2;
      const irrRadius = Math.min(PB_W*0.42, irrH*0.42);

      // draw trail
      ctx.lineWidth=0.7;
      for (let k=0; k<lissFill-1; k++) {
        const i0 = (lissHead - lissFill + k + MAX_TRAIL) % MAX_TRAIL;
        const i1 = (i0+1) % MAX_TRAIL;
        const age = k / lissFill;
        const rx0 = cx_liss + lissX[i0]*irrRadius;
        const ry0 = icy    + lissY[i0]*irrRadius*0.5;
        const rx1 = cx_liss + lissX[i1]*irrRadius;
        const ry1 = icy    + lissY[i1]*irrRadius*0.5;
        ctx.strokeStyle = `rgba(46,240,216,${age*0.35})`;
        ctx.beginPath(); ctx.moveTo(rx0,ry0); ctx.lineTo(rx1,ry1); ctx.stroke();
      }
      // current dot
      const ix = cx_liss + Math.sin(t)*irrRadius;
      const iy = icy    + Math.sin(irr.val*t)*irrRadius*0.5;
      ctx.fillStyle=TEAL; ctx.beginPath(); ctx.arc(ix,iy,2.8,0,Math.PI*2); ctx.fill();
      ctx.fillStyle=hexToRgba(TEAL,0.2); ctx.beginPath(); ctx.arc(ix,iy,6,0,Math.PI*2); ctx.fill();

      ctx.font=`6px ${mono}`; ctx.fillStyle=`${TEAL}88`; ctx.textAlign="center";
      ctx.fillText(`IRRATIONAL  1:${key}  · NEVER CLOSES · EQUIDISTRIBUTED`, cx_liss, ratH+12);
      ctx.font=`5.5px ${mono}`; ctx.fillStyle=`${TEAL}55`;
      ctx.fillText(`x=sin(t)  y=sin(${key}·t)  →  dense space-filling`, cx_liss, ratH+22);

      // equidistribution progress
      const fillPct = Math.min(100, Math.round(lissFill*100/MAX_TRAIL));
      ctx.font=`5px ${mono}`; ctx.fillStyle=`${VIO}66`; ctx.textAlign="center";
      ctx.fillText(`density: ${fillPct}% of bounding box reached (→100% at ∞)`, cx_liss, CH-8);

      ctx.font=`5.5px ${mono}`; ctx.fillStyle=`${TEAL}50`; ctx.textAlign="center";
      ctx.fillText("LISSAJOUS · RATIONAL = CLOSED · IRRATIONAL = OPEN", cx_liss, 11);
      ctx.restore();

      /* divider */
      ctx.fillStyle=`rgba(46,240,216,0.12)`; ctx.fillRect(PC_X,0,1,CH);

      /* ══ PANEL C — CONVERGENTS ══ */
      ctx.save();
      ctx.beginPath(); ctx.rect(PC_X,0,PC_W,CH); ctx.clip();

      const margins = {t:32, b:60, l:14, r:8};
      const chartW = PC_W - margins.l - margins.r;
      const chartH = CH   - margins.t - margins.b;
      const chartX = PC_X + margins.l;
      const chartY = margins.t;

      const allConvs = convergents(irr.cf);
      const errors = allConvs.map(([p,q]) => Math.abs(p/q - irr.val));
      const logErrs = errors.map(e => -Math.log10(Math.max(e, 1e-15)));
      const maxLogErr = Math.max(...logErrs);

      // baseline
      ctx.fillStyle=`rgba(46,240,216,0.08)`; ctx.fillRect(chartX, chartY, chartW, chartH);
      ctx.strokeStyle=`rgba(46,240,216,0.15)`; ctx.lineWidth=0.5;
      ctx.strokeRect(chartX+0.5, chartY+0.5, chartW-1, chartH-1);

      // horizontal gridlines
      for (let g=2; g<=Math.ceil(maxLogErr); g+=2) {
        const gy = chartY + chartH - (g/maxLogErr)*chartH;
        ctx.strokeStyle=`rgba(100,120,140,0.15)`; ctx.lineWidth=0.4;
        ctx.beginPath(); ctx.moveTo(chartX,gy); ctx.lineTo(chartX+chartW,gy); ctx.stroke();
        ctx.font=`4.5px ${mono}`; ctx.fillStyle=`rgba(100,130,150,0.4)`; ctx.textAlign="right";
        ctx.fillText(`10⁻${g}`, chartX-1, gy+1.5);
      }

      const barW = Math.max(3, Math.floor((chartW - 2) / (allConvs.length+1)));
      const gap  = Math.max(1, Math.floor(barW*0.25));

      allConvs.forEach(([p,q], i) => {
        const bx = chartX + 2 + i*(barW+gap);
        const logE = logErrs[i];
        const bh = (logE/maxLogErr)*chartH;
        const col = DEPTH_COLORS[i % DEPTH_COLORS.length];

        // bar
        ctx.fillStyle = hexToRgba(col, 0.65);
        ctx.fillRect(bx, chartY + chartH - bh, barW, bh);
        // border
        ctx.strokeStyle = hexToRgba(col, 0.9); ctx.lineWidth=0.5;
        ctx.strokeRect(bx+0.5, chartY+chartH-bh+0.5, barW-1, bh-1);

        // fraction label (rotated)
        ctx.save();
        ctx.translate(bx+barW/2, chartY+chartH+4);
        ctx.rotate(-Math.PI/2);
        ctx.font=`4.5px ${mono}`; ctx.fillStyle=hexToRgba(col, 0.7); ctx.textAlign="left";
        ctx.fillText(`${p}/${q}`, 0, 0);
        ctx.restore();

        // error dot at top of bar
        ctx.fillStyle=col; ctx.beginPath();
        ctx.arc(bx+barW/2, chartY+chartH-bh, 1.8, 0, Math.PI*2); ctx.fill();
      });

      // "true value" baseline as a dashed line at top
      ctx.strokeStyle=hexToRgba(ROSE,0.4); ctx.lineWidth=0.7;
      ctx.setLineDash([3,3]);
      ctx.beginPath(); ctx.moveTo(chartX, chartY+2); ctx.lineTo(chartX+chartW, chartY+2); ctx.stroke();
      ctx.setLineDash([]);
      ctx.font=`5px ${mono}`; ctx.fillStyle=`${ROSE}88`; ctx.textAlign="left";
      ctx.fillText(`EXACT ${key} — UNREACHABLE`, chartX+2, chartY-2);

      // annotation: φ is worst-approximable
      if (key === "φ") {
        ctx.font=`5px ${mono}`; ctx.fillStyle=`${VIO}88`; ctx.textAlign="center";
        ctx.fillText("φ has the SLOWEST convergents", PC_X+PC_W/2, CH-8);
        ctx.fillStyle=`${VIO}55`; ctx.fillText("— most irrational of all irrationals —", PC_X+PC_W/2, CH-1);
      }
      if (key === "π") {
        ctx.font=`5px ${mono}`; ctx.fillStyle=`${GOLD}88`; ctx.textAlign="center";
        ctx.fillText("355/113 (Milü): 6 digits accuracy", PC_X+PC_W/2, CH-8);
        ctx.fillStyle=`${GOLD}55`; ctx.fillText("cf term 292 = spectacular leap", PC_X+PC_W/2, CH-1);
      }

      ctx.font=`5.5px ${mono}`; ctx.fillStyle=`${TEAL}50`; ctx.textAlign="center";
      ctx.fillText("BEST RATIONAL APPROXIMATIONS · HEIGHT = ACCURACY · NEVER EXACT", PC_X+PC_W/2, 11);
      ctx.restore();

      // scan lines
      for (let sl=0; sl<CH; sl+=4) { ctx.fillStyle="rgba(0,0,0,0.016)"; ctx.fillRect(0,sl,W,1); }

      rafRef.current = requestAnimationFrame(draw);
    }

    rafRef.current = requestAnimationFrame(draw);
    return () => { cancelAnimationFrame(rafRef.current); ro.disconnect(); };
  }, []);

  /* ── styles ─── */
  const lbl: React.CSSProperties = {fontFamily:mono, fontSize:9, color:`${TEAL}88`, letterSpacing:"0.08em", userSelect:"none"};
  const sep: React.CSSProperties = {width:1, height:28, background:`rgba(46,240,216,0.12)`};
  const slid: React.CSSProperties = {width:80, accentColor:TEAL};
  const val_: React.CSSProperties = {fontFamily:mono, fontSize:9, color:`${TEAL}cc`, minWidth:28, textAlign:"right"};
  const btn = (active:boolean, color=TEAL): React.CSSProperties => ({
    fontFamily:mono, fontSize:9, letterSpacing:"0.1em", padding:"5px 11px",
    cursor:"pointer", border:"1px solid", borderRadius:4, background:"transparent",
    borderColor: active ? color : "rgba(46,240,216,0.18)",
    color: active ? color : "rgba(46,240,216,0.33)",
  });

  const irr = IRRATIONALS[irrKey];

  return (
    <div style={{width:"100%",height:"100%",position:"relative",overflow:"hidden",background:BG,display:"flex",flexDirection:"column"}}>

      <div ref={rootRef} style={{flex:1, position:"relative", overflow:"hidden"}}>
        <canvas ref={canvasRef} style={{position:"absolute",inset:0}} />

        {/* header badge */}
        <div style={{position:"absolute",top:8,left:10,zIndex:10,pointerEvents:"none"}}>
          <div style={{display:"inline-block",border:`1px solid ${ROSE}88`,padding:"3px 10px",fontSize:9,letterSpacing:"0.18em",color:`${ROSE}aa`,fontFamily:mono,marginBottom:4}}>DECEPTIVE PRACTICES</div>
          <div style={{fontFamily:mono,fontSize:"0.48rem",letterSpacing:3,color:`${ROSE}44`}}>INCOMMENSURABLE MEASUREMENTS · ANTHYPHAIRESIS · LISSAJOUS · CONVERGENTS · AETHER</div>
        </div>

        {/* irrational info overlay */}
        <div style={{position:"absolute",top:8,right:12,zIndex:10,pointerEvents:"none",textAlign:"right"}}>
          <div style={{fontFamily:mono,fontSize:9,color:`${TEAL}cc`,letterSpacing:1}}>{irr.name}</div>
          <div style={{fontFamily:mono,fontSize:7,color:`${TEAL}55`,marginTop:2}}>{irr.val.toFixed(10)}…</div>
          <div style={{fontFamily:mono,fontSize:6,color:DIM,marginTop:3,maxWidth:200}}>{irr.desc}</div>
        </div>

        {/* concept legend */}
        <div style={{position:"absolute",bottom:52,right:12,zIndex:10,pointerEvents:"none",display:"flex",flexDirection:"column",gap:4}}>
          {[
            [TEAL, "ANTHYPHAIRESIS — subtraction never terminates (irrationality proof)"],
            [GOLD, "LISSAJOUS RATIONAL — closed orbit, perfectly periodic"],
            [TEAL, "LISSAJOUS IRRATIONAL — open orbit, equidistributed (Weyl)"],
            [ROSE, "CONVERGENT LIMIT — approached forever, never reached"],
          ].map(([c,l]) => (
            <div key={l} style={{display:"flex",alignItems:"center",gap:6}}>
              <div style={{width:6,height:6,borderRadius:1,background:c,flexShrink:0}}/>
              <span style={{fontFamily:mono,fontSize:5.5,color:`${c}77`,letterSpacing:0.3}}>{l}</span>
            </div>
          ))}
        </div>
      </div>

      {/* controls */}
      <div style={{flexShrink:0,display:"flex",gap:12,alignItems:"center",justifyContent:"center",flexWrap:"wrap",background:"rgba(3,5,8,0.92)",borderTop:`1px solid rgba(46,240,216,0.10)`,padding:"9px 18px"}}>

        <span style={lbl}>INCOMMENSURABLE</span>
        <div style={{display:"flex",gap:5}}>
          {(["√2","φ","π","e"] as IrrKey[]).map(k => (
            <button key={k} onClick={()=>setIrrKey(k)} style={btn(irrKey===k)}>
              {k === "φ" ? "φ (phi)" : k === "√2" ? "√2" : k === "π" ? "π" : "e"}
            </button>
          ))}
        </div>

        <div style={sep}/>

        <span style={lbl}>SPEED</span>
        <input type="range" min="0.3" max="4" step="0.1" value={speed} style={slid}
          onChange={e=>setSpeed(parseFloat(e.target.value))} />
        <span style={val_}>{speed.toFixed(1)}×</span>

        <div style={sep}/>

        <div style={{fontFamily:mono,fontSize:8,color:DIM,maxWidth:360,lineHeight:1.6}}>
          <strong style={{color:`${ROSE}cc`}}>Incommensurable:</strong>{" "}
          no unit exists that measures both quantities exactly · the Euclidean algorithm runs forever ·
          the Lissajous curve never closes · the approximations converge but never arrive
        </div>
      </div>
    </div>
  );
}
