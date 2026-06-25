import { useEffect, useRef, useState } from "react";

/* ── palette ───────────────────────────────────────────── */
const V = {
  bg:"#04060E", aurora:"#00FFB2", gold:"#C8A030", blue:"#4488FF",
  vio:"#9966FF", amb:"#FF9933", rose:"#FF6699", plasma:"#FF4477",
  green:"#44CC77", dim:"#3A5060", ink:"#B8CCE8", fire:"#FF6622",
  shock:"#FFDD22", photon:"#00FFBB", cyan:"#22DDFF",
};
const MONO  = "'Space Mono',monospace";
const SERIF = "'Crimson Pro',serif";
const DISP  = "'Cinzel',serif";

/* Ring definitions ─────────────────────────────────────── */
const RINGS = [
  { n:5, col:V.aurora, label:"5-PETAL",  pw:0.28, name:"Pentatopic",  hz:"ω₅ = 5Ω" },
  { n:6, col:V.gold,   label:"6-PETAL",  pw:0.26, name:"Hexatopic",   hz:"ω₆ = 6Ω" },
  { n:7, col:V.vio,    label:"7-PETAL",  pw:0.24, name:"Heptatopic",  hz:"ω₇ = 7Ω" },
  { n:8, col:V.rose,   label:"8-PETAL",  pw:0.22, name:"Octatopic",   hz:"ω₈ = 8Ω" },
  { n:9, col:V.cyan,   label:"9-PETAL",  pw:0.20, name:"Nonatopic",   hz:"ω₉ = 9Ω" },
];

/* Tag ──────────────────────────────────────────────────── */
function Tag({ l, c }: { l:string; c:string }) {
  return (
    <span style={{
      display:"inline-block", padding:"2px 8px", margin:"0 4px 4px 0",
      background:c+"22", border:`1px solid ${c}44`,
      borderRadius:3, fontFamily:MONO, fontSize:9, color:c, letterSpacing:"0.12em",
    }}>{l}</span>
  );
}

/* ── Main Floquet Canvas ───────────────────────────────── */
function FloquetCanvas({
  speed, deform, active, showGrid
}: {
  speed:number; deform:number; active:boolean[]; showGrid:boolean;
}) {
  const ref  = useRef<HTMLCanvasElement>(null);
  const raf  = useRef(0);
  const st   = useRef({ speed, deform, active, showGrid });
  useEffect(() => { st.current = { speed, deform, active, showGrid }; },
    [speed, deform, active, showGrid]);

  useEffect(() => {
    const cv = ref.current; if (!cv) return;
    const ctx = cv.getContext("2d")!;
    const W = cv.width, H = cv.height, CX = W/2, CY = H/2;
    const BASE = Math.min(W,H) * 0.46;
    const RADII = [0.18, 0.34, 0.52, 0.70, 0.90];
    let t = 0;

    function petal(cx:number, cy:number, R:number, pw:number, ang:number, col:string) {
      ctx.save();
      ctx.translate(cx, cy);
      ctx.rotate(ang);
      const w = R * pw;
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.bezierCurveTo( w, R*0.25,  w, R*0.75, 0, R);
      ctx.bezierCurveTo(-w, R*0.75, -w, R*0.25, 0, 0);
      const grd = ctx.createLinearGradient(0, 0, 0, R);
      grd.addColorStop(0,   col+"00");
      grd.addColorStop(0.15, col+"33");
      grd.addColorStop(0.55, col+"CC");
      grd.addColorStop(0.85, col+"88");
      grd.addColorStop(1,   col+"22");
      ctx.fillStyle = grd; ctx.fill();
      ctx.strokeStyle = col+"66"; ctx.lineWidth = 0.7; ctx.stroke();
      ctx.restore();
    }

    function ring(ri:number, tt:number) {
      const { n, col, pw } = RINGS[ri];
      const R  = RADII[ri] * BASE;
      const ph = (n * tt * st.current.speed * 0.18) % (Math.PI*2);
      const frac = RADII[ri];
      const pLen = BASE * (frac - (ri > 0 ? RADII[ri-1] : 0)) * 1.1 + BASE*0.06;

      for (let p = 0; p < n; p++) {
        const ang = (p / n) * Math.PI*2 + ph;
        const rx = CX + R * Math.cos(ang);
        const ry = CY + R * Math.sin(ang);
        if (!isFinite(rx)||!isFinite(ry)) continue;
        petal(rx, ry, pLen, pw, ang + Math.PI/2, col);
      }

      // ring circle (faint)
      ctx.beginPath(); ctx.arc(CX, CY, R, 0, Math.PI*2);
      ctx.strokeStyle = col+"14"; ctx.lineWidth = 0.5; ctx.stroke();

      // n-label at current phase position
      const lx = CX + (R + pLen*0.6) * Math.cos(ph);
      const ly = CY + (R + pLen*0.6) * Math.sin(ph);
      if (isFinite(lx)&&isFinite(ly)) {
        ctx.fillStyle = col+"99"; ctx.font = `7px ${MONO}`; ctx.textAlign = "center";
        ctx.fillText(String(n), lx, ly+3);
      }
    }

    function grid(tt:number) {
      const GN = 22;
      const pts: number[] = [];
      const { active: act, deform: def } = st.current;

      for (let i = 0; i <= GN; i++) {
        for (let j = 0; j <= GN; j++) {
          const u = (i/GN)*W, v = (j/GN)*H;
          let dx = 0, dy = 0;
          for (let ri = 0; ri < RINGS.length; ri++) {
            if (!act[ri]) continue;
            const { n } = RINGS[ri];
            const R  = RADII[ri] * BASE;
            const ph = (n * tt * st.current.speed * 0.18) % (Math.PI*2);
            for (let p = 0; p < n; p++) {
              const ang = (p/n)*Math.PI*2 + ph;
              const pcx = CX + R * Math.cos(ang);
              const pcy = CY + R * Math.sin(ang);
              const d2  = (u-pcx)*(u-pcx) + (v-pcy)*(v-pcy);
              if (d2 < 4) continue;
              const sigma = R * 0.38;
              const str   = def * 12 * Math.exp(-d2 / (2*sigma*sigma));
              const d     = Math.sqrt(d2);
              dx += str * (u-pcx) / d;
              dy += str * (v-pcy) / d;
            }
          }
          pts.push(u+dx, v+dy);
        }
      }

      ctx.strokeStyle = V.dim+"2A"; ctx.lineWidth = 0.4;
      const G1 = GN+1;
      for (let i = 0; i <= GN; i++) {
        ctx.beginPath();
        for (let j = 0; j <= GN; j++) {
          const bi = (i*G1+j)*2;
          j===0 ? ctx.moveTo(pts[bi],pts[bi+1]) : ctx.lineTo(pts[bi],pts[bi+1]);
        }
        ctx.stroke();
      }
      for (let j = 0; j <= GN; j++) {
        ctx.beginPath();
        for (let i = 0; i <= GN; i++) {
          const bi = (i*G1+j)*2;
          i===0 ? ctx.moveTo(pts[bi],pts[bi+1]) : ctx.lineTo(pts[bi],pts[bi+1]);
        }
        ctx.stroke();
      }
    }

    function draw() {
      ctx.clearRect(0,0,W,H);
      ctx.fillStyle = "#010308"; ctx.fillRect(0,0,W,H);

      // faint stars
      const rng = ((s:number) => { let r=s; return () => { r=(r*16807)%2147483647; return(r-1)/2147483646; }; })(4242);
      for (let i=0; i<60; i++) {
        const sx=rng()*W, sy=rng()*H, sr=rng()*0.8+0.1;
        ctx.beginPath(); ctx.arc(sx,sy,sr,0,Math.PI*2);
        ctx.fillStyle = `rgba(184,204,232,${rng()*0.3+0.05})`; ctx.fill();
      }

      // spacetime grid
      const { showGrid:sg, active:act } = st.current;
      if (sg) grid(t);

      // petal rings (inner to outer)
      for (let ri = 0; ri < RINGS.length; ri++) {
        if (act[ri]) ring(ri, t);
      }

      // central glow
      const cg = ctx.createRadialGradient(CX,CY,0,CX,CY,BASE*0.08);
      cg.addColorStop(0, V.aurora+"DD"); cg.addColorStop(0.5, V.aurora+"44"); cg.addColorStop(1, V.aurora+"00");
      ctx.beginPath(); ctx.arc(CX,CY,BASE*0.08,0,Math.PI*2);
      ctx.fillStyle = cg; ctx.fill();
      ctx.beginPath(); ctx.arc(CX,CY,2.5,0,Math.PI*2);
      ctx.fillStyle = "#fff"; ctx.fill();

      // Floquet freq labels
      ctx.textAlign = "left"; ctx.font = `8px ${MONO}`;
      for (let ri = 0; ri < RINGS.length; ri++) {
        if (!act[ri]) continue;
        ctx.fillStyle = RINGS[ri].col+"99";
        ctx.fillText(RINGS[ri].hz, 10, 16+ri*13);
      }

      // phase clock tick
      const clkR = 18, clkX = W-28, clkY = H-28;
      ctx.strokeStyle = V.dim+"55"; ctx.lineWidth = 0.8;
      ctx.beginPath(); ctx.arc(clkX,clkY,clkR,0,Math.PI*2); ctx.stroke();
      for (let ri = 0; ri < RINGS.length; ri++) {
        if (!act[ri]) continue;
        const { n, col } = RINGS[ri];
        const ph = (n * t * st.current.speed * 0.18) % (Math.PI*2) - Math.PI/2;
        const tickX = clkX + clkR*0.75*Math.cos(ph);
        const tickY = clkY + clkR*0.75*Math.sin(ph);
        if (isFinite(tickX)&&isFinite(tickY)) {
          ctx.beginPath(); ctx.moveTo(clkX,clkY); ctx.lineTo(tickX,tickY);
          ctx.strokeStyle = col+"AA"; ctx.lineWidth = 1.2; ctx.stroke();
        }
      }
      ctx.fillStyle = V.ink+"44"; ctx.font = `6px ${MONO}`; ctx.textAlign = "center";
      ctx.fillText("Ω", clkX, clkY+3);
    }

    function loop() { t += 0.012; draw(); raf.current = requestAnimationFrame(loop); }
    loop();
    return () => cancelAnimationFrame(raf.current);
  }, []);

  return (
    <canvas ref={ref} width={740} height={540}
      style={{ width:"100%", height:540, display:"block", borderRadius:4 }}/>
  );
}

/* ── Winding Number Mini Canvas ─────────────────────────── */
function WindingCanvas({ n, col }: { n:number; col:string }) {
  const ref = useRef<HTMLCanvasElement>(null);
  const raf = useRef(0);
  useEffect(() => {
    const cv = ref.current; if (!cv) return;
    const ctx = cv.getContext("2d")!;
    const W = cv.width, H = cv.height, CX = W/2, CY = H/2, R = Math.min(W,H)*0.35;
    let t = 0;
    function draw() {
      ctx.clearRect(0,0,W,H);
      ctx.fillStyle = "#010308"; ctx.fillRect(0,0,W,H);
      ctx.beginPath();
      for (let i=0; i<=300; i++) {
        const th = (i/300)*Math.PI*2 + t;
        const r  = R * Math.abs(Math.cos(n*th/2));
        const x  = CX + r*Math.cos(th), y = CY + r*Math.sin(th);
        i===0 ? ctx.moveTo(x,y) : ctx.lineTo(x,y);
      }
      ctx.strokeStyle = col; ctx.lineWidth = 1.2; ctx.stroke();
      ctx.fillStyle = col+"33"; ctx.fill();
      ctx.fillStyle = col+"88"; ctx.font = `8px ${MONO}`; ctx.textAlign = "center";
      ctx.fillText(`n=${n}`, CX, H-6);
    }
    function loop() { t += 0.012; draw(); raf.current = requestAnimationFrame(loop); }
    loop();
    return () => cancelAnimationFrame(raf.current);
  }, [n, col]);
  return (
    <canvas ref={ref} width={100} height={100}
      style={{ width:100, height:100, display:"block", borderRadius:3 }}/>
  );
}

/* ── Main Page ──────────────────────────────────────────── */
export default function FloquetPetalsPage() {
  const [speed, setSpeed]       = useState(1.0);
  const [deform, setDeform]     = useState(0.6);
  const [active, setActive]     = useState([true,true,true,true,true]);
  const [showGrid, setShowGrid] = useState(true);

  function toggle(i:number) {
    setActive(prev => prev.map((v,j) => j===i ? !v : v));
  }

  const THEORY = [
    { t:"FLOQUET THEOREM", c:V.aurora,
      b:"In a periodically-driven quantum system, solutions to the Schrödinger equation take the form ψ(t) = e^{−iεt/ℏ} u(t), where u(t) has the same period as the driving and ε is the quasi-energy. Each petal ring is a discrete Floquet mode." },
    { t:"TOPOLOGICAL INVARIANT", c:V.gold,
      b:"The winding number w of each ring around the central singularity is equal to its petal count n. For a closed orbit, ∮ dφ = 2πw. Rings with distinct winding numbers are topologically inequivalent — they cannot be deformed into one another without crossing the core." },
    { t:"SPACETIME DEFORMATION", c:V.vio,
      b:"Each rotating petal ring sources a stress-energy perturbation that curves the ambient metric. The grid deformation models the linearised gravitational lensing effect: δg_{μν} ∝ Σᵢ Aᵢ exp(−r²/2σᵢ²). All five rings superpose to create a composite topology." },
    { t:"QUASI-ENERGY BANDS", c:V.rose,
      b:"The five rings generate five distinct quasi-energy bands separated by topological band gaps. At ring boundaries (where two ring radii intersect) edge states can localise — analogous to topological insulator surface modes or photonic crystal defect modes." },
    { t:"FLOQUET FREQUENCY LOCKING", c:V.cyan,
      b:"Ring n rotates at ωₙ = n·Ω where Ω is the base frequency. The ratio ωₙ/ω₅ = n/5 is rational for all five rings, meaning the system is exactly frequency-locked: after 5·6·7·8·9 = 15120 base periods it returns to its initial configuration." },
  ];

  return (
    <div style={{ background:V.bg, minHeight:"100vh", color:V.ink,
      fontFamily:MONO, paddingBottom:80 }}>

      {/* breadcrumb */}
      <div style={{ padding:"10px 24px", borderBottom:`1px solid ${V.dim}44`,
        display:"flex", flexWrap:"wrap", gap:4 }}>
        {[
          ["FLOQUET PETALS",V.aurora],["DNA TOPOLOGY",V.gold],
          ["5-6-7-8-9 RINGS",V.vio],["SPACETIME SHAPING",V.rose],
          ["WINDING NUMBER",V.cyan],["QUASI-ENERGY",V.blue],["AETHER",V.plasma],
        ].map(([l,c]) => <Tag key={l} l={l} c={c}/>)}
      </div>

      <div style={{ padding:"44px 32px 20px", maxWidth:980, margin:"0 auto" }}>
        <div style={{ fontFamily:MONO, fontSize:10, color:V.aurora,
          letterSpacing:"0.2em", marginBottom:12 }}>LIVE SIMULATION · FLOQUET TOPOLOGY</div>
        <h1 style={{ fontFamily:DISP, fontSize:"clamp(24px,4vw,46px)",
          color:V.ink, margin:"0 0 16px", lineHeight:1.1 }}>
          Floquet Floral Topology<br/>
          <span style={{ color:V.aurora+"CC", fontSize:"0.62em" }}>
            Five Petal-Ring Spacetime Structure · 5 · 6 · 7 · 8 · 9
          </span>
        </h1>
        <p style={{ fontFamily:SERIF, fontSize:16, color:V.ink+"99",
          lineHeight:1.75, maxWidth:680, margin:"0 0 6px" }}>
          Five concentric Floquet petal rings, each rotating at a frequency
          proportional to its petal count, deform the surrounding spacetime metric.
          The composite quasi-energy landscape creates topological band gaps between
          adjacent rings — a floral analogue of a Floquet topological insulator.
        </p>
      </div>

      <div style={{ maxWidth:980, margin:"0 auto", padding:"0 32px" }}>

        {/* controls */}
        <div style={{ display:"flex", flexWrap:"wrap", gap:12,
          padding:"12px 16px", background:V.dim+"18",
          border:`1px solid ${V.dim}44`, borderRadius:4, marginBottom:4,
          alignItems:"center" }}>

          {/* ring toggles */}
          <div style={{ display:"flex", gap:6, flexWrap:"wrap" }}>
            {RINGS.map((r,i) => (
              <button key={r.n} onClick={() => toggle(i)} style={{
                background: active[i] ? r.col+"28" : "transparent",
                border: `1px solid ${active[i] ? r.col : V.dim}`,
                color: active[i] ? r.col : V.ink+"44",
                fontFamily:MONO, fontSize:8, padding:"4px 10px",
                cursor:"pointer", borderRadius:3, letterSpacing:"0.1em",
              }}>
                {active[i]?"●":"○"} {r.n}P
              </button>
            ))}
          </div>

          <div style={{ width:1, height:24, background:V.dim, opacity:0.4 }}/>

          {/* speed */}
          <div style={{ display:"flex", alignItems:"center", gap:8 }}>
            <span style={{ fontFamily:MONO, fontSize:8, color:V.ink+"55" }}>Ω</span>
            <input type="range" min={0.1} max={3} step={0.05} value={speed}
              onChange={e => setSpeed(+e.target.value)}
              style={{ width:100, accentColor:V.aurora }}/>
            <span style={{ fontFamily:MONO, fontSize:8, color:V.aurora, minWidth:28 }}>
              {speed.toFixed(2)}×
            </span>
          </div>

          {/* deform */}
          <div style={{ display:"flex", alignItems:"center", gap:8 }}>
            <span style={{ fontFamily:MONO, fontSize:8, color:V.ink+"55" }}>∇g</span>
            <input type="range" min={0} max={2} step={0.05} value={deform}
              onChange={e => setDeform(+e.target.value)}
              style={{ width:100, accentColor:V.vio }}/>
            <span style={{ fontFamily:MONO, fontSize:8, color:V.vio, minWidth:28 }}>
              {deform.toFixed(2)}
            </span>
          </div>

          {/* grid toggle */}
          <button onClick={() => setShowGrid(g => !g)} style={{
            background: showGrid ? V.dim+"44" : "transparent",
            border: `1px solid ${showGrid ? V.ink+"44" : V.dim}`,
            color: showGrid ? V.ink+"99" : V.ink+"33",
            fontFamily:MONO, fontSize:8, padding:"4px 10px",
            cursor:"pointer", borderRadius:3, letterSpacing:"0.1em",
          }}>
            {showGrid?"▦ GRID ON":"▦ GRID OFF"}
          </button>
        </div>

        {/* canvas */}
        <div style={{ border:`1px solid ${V.dim}`, borderRadius:"0 4px 4px 4px",
          overflow:"hidden" }}>
          <div style={{ padding:"5px 12px", background:V.dim+"22",
            borderBottom:`1px solid ${V.dim}44`, fontFamily:MONO, fontSize:8,
            color:V.aurora+"77", letterSpacing:"0.12em" }}>
            FLOQUET RINGS · ω₅=5Ω · ω₆=6Ω · ω₇=7Ω · ω₈=8Ω · ω₉=9Ω · SPACETIME GRID · ∇g DEFORMATION · WINDING NUMBERS
          </div>
          <FloquetCanvas speed={speed} deform={deform} active={active} showGrid={showGrid}/>
        </div>

        {/* winding number mini-plots */}
        <div style={{ margin:"44px 0 0" }}>
          <div style={{ borderLeft:`3px solid ${V.gold}`, paddingLeft:14, marginBottom:16 }}>
            <div style={{ fontFamily:MONO, fontSize:10, color:V.gold, letterSpacing:"0.18em" }}>
              I · RHODONEA WINDING NUMBERS · r = |cos(nθ/2)|
            </div>
            <div style={{ fontFamily:SERIF, fontSize:13, color:V.ink+"66", marginTop:4 }}>
              Each ring's topological invariant — the number of times the curve winds around the origin
            </div>
          </div>
          <div style={{ display:"flex", gap:16, flexWrap:"wrap" }}>
            {RINGS.map(r => (
              <div key={r.n} style={{ textAlign:"center" }}>
                <WindingCanvas n={r.n} col={r.col}/>
                <div style={{ fontFamily:MONO, fontSize:8, color:r.col, marginTop:6 }}>
                  {r.name}
                </div>
                <div style={{ fontFamily:MONO, fontSize:7, color:V.ink+"44", marginTop:2 }}>
                  w = {r.n} · {r.hz}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Floquet topology table */}
        <div style={{ margin:"44px 0 0" }}>
          <div style={{ borderLeft:`3px solid ${V.vio}`, paddingLeft:14, marginBottom:16 }}>
            <div style={{ fontFamily:MONO, fontSize:10, color:V.vio, letterSpacing:"0.18em" }}>
              II · RING INVARIANT TABLE
            </div>
          </div>
          <div style={{ overflowX:"auto" }}>
            <table style={{ width:"100%", borderCollapse:"collapse", fontFamily:MONO, fontSize:10 }}>
              <thead>
                <tr>
                  {["RING","PETALS","FLOQUET ω","WINDING #","BAND GAP",
                    "EULER χ","SYMMETRY GROUP"].map(h => (
                    <th key={h} style={{ padding:"8px 12px",
                      borderBottom:`1px solid ${V.dim}`, color:V.ink+"55",
                      textAlign:"left", letterSpacing:"0.08em", whiteSpace:"nowrap" }}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {RINGS.map((r,i) => {
                  const chi = 2 - r.n;
                  const gap = ((r.n - 5) * 0.12 + 0.18).toFixed(2);
                  const grp = `C${r.n}`;
                  return (
                    <tr key={r.n}>
                      <td style={{ padding:"8px 12px", color:r.col,
                        borderBottom:`1px solid ${V.dim}22` }}>
                        {r.label}
                      </td>
                      <td style={{ padding:"8px 12px", color:V.ink+"88",
                        borderBottom:`1px solid ${V.dim}22` }}>{r.n}</td>
                      <td style={{ padding:"8px 12px", color:V.ink+"88",
                        borderBottom:`1px solid ${V.dim}22` }}>{r.hz}</td>
                      <td style={{ padding:"8px 12px", color:r.col+"BB",
                        borderBottom:`1px solid ${V.dim}22` }}>w = {r.n}</td>
                      <td style={{ padding:"8px 12px", color:V.ink+"88",
                        borderBottom:`1px solid ${V.dim}22` }}>Δε = {gap} ℏΩ</td>
                      <td style={{ padding:"8px 12px", color:V.ink+"88",
                        borderBottom:`1px solid ${V.dim}22` }}>χ = {chi}</td>
                      <td style={{ padding:"8px 12px", color:V.ink+"66",
                        borderBottom:`1px solid ${V.dim}22` }}>{grp}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Theory cards */}
        <div style={{ margin:"44px 0 0" }}>
          <div style={{ borderLeft:`3px solid ${V.blue}`, paddingLeft:14, marginBottom:16 }}>
            <div style={{ fontFamily:MONO, fontSize:10, color:V.blue, letterSpacing:"0.18em" }}>
              III · FLOQUET TOPOLOGY FIELD NOTES
            </div>
          </div>
          <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(290px,1fr))", gap:12 }}>
            {THEORY.map(th => (
              <div key={th.t} style={{ padding:16, background:th.c+"0A",
                border:`1px solid ${th.c}33`, borderRadius:4 }}>
                <div style={{ fontFamily:MONO, fontSize:9, color:th.c,
                  letterSpacing:"0.12em", marginBottom:10 }}>{th.t}</div>
                <div style={{ fontFamily:SERIF, fontSize:13, color:V.ink+"88",
                  lineHeight:1.68 }}>{th.b}</div>
              </div>
            ))}
          </div>
        </div>

        {/* frequency lock note */}
        <div style={{ margin:"40px 0 0", padding:22, background:V.aurora+"08",
          border:`1px solid ${V.aurora}33`, borderRadius:4 }}>
          <div style={{ fontFamily:MONO, fontSize:9, color:V.aurora,
            letterSpacing:"0.18em", marginBottom:14 }}>
            IV · FREQUENCY LOCK PERIOD · LCM(5,6,7,8,9) = 2520 BASE CYCLES
          </div>
          <div style={{ display:"flex", gap:24, flexWrap:"wrap" }}>
            {RINGS.map(r => (
              <div key={r.n} style={{ textAlign:"center" }}>
                <div style={{ fontFamily:MONO, fontSize:20, color:r.col }}>{r.n}</div>
                <div style={{ fontFamily:MONO, fontSize:7, color:r.col+"77",
                  marginTop:4 }}>{r.hz}</div>
                <div style={{ fontFamily:SERIF, fontSize:11, color:V.ink+"55",
                  marginTop:4 }}>{r.name}</div>
              </div>
            ))}
            <div style={{ borderLeft:`1px solid ${V.dim}`, paddingLeft:24,
              display:"flex", flexDirection:"column", justifyContent:"center" }}>
              <div style={{ fontFamily:MONO, fontSize:9, color:V.ink+"55",
                marginBottom:8, letterSpacing:"0.1em" }}>SYSTEM PERIOD</div>
              <div style={{ fontFamily:DISP, fontSize:28, color:V.aurora }}>2520 Ω</div>
              <div style={{ fontFamily:SERIF, fontSize:12, color:V.ink+"55", marginTop:6 }}>
                LCM(5,6,7,8,9) = 2520<br/>
                System returns to identical<br/>
                floral configuration every<br/>
                2520 base-frequency cycles
              </div>
            </div>
          </div>
        </div>

        {/* cross-links */}
        <div style={{ margin:"40px 0 0" }}>
          <div style={{ fontFamily:MONO, fontSize:9, color:V.dim,
            letterSpacing:"0.16em", marginBottom:12 }}>RELATED SYSTEMS</div>
          <div style={{ display:"flex", flexWrap:"wrap", gap:8 }}>
            {[
              ["/borrelia-knot",      "Borrelia Knot",       V.aurora],
              ["/understanding-strand","Understanding Strand", V.gold],
              ["/atp-transport",       "ATP Transport",        V.vio],
              ["/gravitational-field", "Gravitational Field",  V.rose],
            ].map(([path,label,col]) => (
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
