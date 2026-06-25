import { useEffect, useRef, useState } from "react";

/* ── palette ──────────────────────────────────────────────── */
const V = {
  bg:"#04060E", aurora:"#00FFB2", gold:"#C8A030", blue:"#4488FF",
  vio:"#9966FF", amb:"#FF9933", rose:"#FF6699", plasma:"#FF4477",
  green:"#44CC77", dim:"#3A5060", ink:"#B8CCE8", fire:"#FF6622",
  shock:"#FFDD22", photon:"#00FFBB", cyan:"#22DDFF",
};
const MONO = "'Space Mono',monospace";
const SERIF = "'Crimson Pro',serif";
const DISP = "'Cinzel',serif";
const mkRng = (seed:number) => {
  let s = seed;
  return () => { s=(s*16807)%2147483647; return (s-1)/2147483646; };
};

/* ── helpers ──────────────────────────────────────────────── */
function Tag({ l, c }: { l:string; c:string }) {
  return (
    <span style={{
      display:"inline-block", padding:"2px 8px", margin:"0 4px 4px 0",
      background:c+"22", border:`1px solid ${c}44`,
      borderRadius:3, fontFamily:MONO, fontSize:9, color:c, letterSpacing:"0.12em",
    }}>{l}</span>
  );
}

/* ── Canvas 1: Trefoil DNA Knot + Topoisomerase II ─────────── */
function KnotCanvas({ speed }:{ speed:number }) {
  const ref = useRef<HTMLCanvasElement>(null);
  const raf = useRef(0);
  useEffect(() => {
    const cv = ref.current; if (!cv) return;
    const ctx = cv.getContext("2d")!;
    const W = cv.width, H = cv.height, CX = W/2, CY = H/2;
    const SC = Math.min(W,H)*0.27;
    const N = 300;
    let t = 0;

    function draw() {
      ctx.clearRect(0,0,W,H);
      ctx.fillStyle = "#010308"; ctx.fillRect(0,0,W,H);

      ctx.strokeStyle = V.dim+"18"; ctx.lineWidth = 0.5;
      for (let x=0; x<W; x+=50) {
        ctx.beginPath(); ctx.moveTo(x,0); ctx.lineTo(x,H); ctx.stroke();
      }
      for (let y=0; y<H; y+=50) {
        ctx.beginPath(); ctx.moveTo(0,y); ctx.lineTo(W,y); ctx.stroke();
      }

      const pxs: number[] = [];
      const pys: number[] = [];
      const pzs: number[] = [];
      for (let i=0; i<N; i++) {
        const th = (i/N)*Math.PI*2 + t*0.25;
        pxs.push((Math.sin(th)+2*Math.sin(2*th))*SC + CX);
        pys.push((Math.cos(th)-2*Math.cos(2*th))*SC + CY);
        pzs.push(Math.sin(3*th));
      }

      for (let i=0; i<N; i++) {
        if (pzs[i] >= 0) continue;
        const br = (pzs[i]+1)/2;
        const j = (i+1)%N;
        ctx.beginPath(); ctx.moveTo(pxs[i],pys[i]); ctx.lineTo(pxs[j],pys[j]);
        ctx.strokeStyle = `rgba(0,${Math.floor(120*br)},${Math.floor(100*br)},0.35)`;
        ctx.lineWidth = 1.5; ctx.stroke();
      }

      const crossAngles = [0, Math.PI*2/3, Math.PI*4/3];
      crossAngles.forEach(ca => {
        const base = ca + t*0.25;
        const gx = (Math.sin(base)+2*Math.sin(2*base))*SC+CX;
        const gy = (Math.cos(base)-2*Math.cos(2*base))*SC+CY;
        if (!isFinite(gx)||!isFinite(gy)) return;
        ctx.beginPath(); ctx.arc(gx,gy,7,0,Math.PI*2);
        ctx.fillStyle = "#010308"; ctx.fill();
      });

      for (let i=0; i<N; i++) {
        if (pzs[i] < 0) continue;
        const br = (pzs[i]+1)/2;
        const j = (i+1)%N;
        ctx.beginPath(); ctx.moveTo(pxs[i],pys[i]); ctx.lineTo(pxs[j],pys[j]);
        ctx.strokeStyle = `rgba(0,${Math.floor(200+55*br)},${Math.floor(100+80*br)},${0.4+0.55*br})`;
        ctx.lineWidth = 1.5+br*1.8; ctx.stroke();
      }

      crossAngles.forEach((ca, ci) => {
        const base = ca + t*0.25;
        const nx = (Math.sin(base)+2*Math.sin(2*base))*SC+CX;
        const ny = (Math.cos(base)-2*Math.cos(2*base))*SC+CY;
        if (!isFinite(nx)||!isFinite(ny)) return;
        const z = Math.sin(3*base);
        const col = z > 0 ? V.aurora : V.rose;
        ctx.beginPath(); ctx.arc(nx,ny,5,0,Math.PI*2);
        ctx.strokeStyle = col; ctx.lineWidth = 1.5; ctx.stroke();
        ctx.fillStyle = V.ink; ctx.font = `7px ${MONO}`; ctx.textAlign = "center";
        ctx.fillText(`c${ci+1}`, nx, ny-10);
      });

      const enzT = (t*0.1) % (Math.PI*2);
      const ex = (Math.sin(enzT)+2*Math.sin(2*enzT))*SC+CX;
      const ey = (Math.cos(enzT)-2*Math.cos(2*enzT))*SC+CY;
      if (isFinite(ex)&&isFinite(ey)) {
        const grd = ctx.createRadialGradient(ex,ey,0,ex,ey,16);
        grd.addColorStop(0, V.gold+"99"); grd.addColorStop(1, V.gold+"00");
        ctx.beginPath(); ctx.arc(ex,ey,16,0,Math.PI*2);
        ctx.fillStyle = grd; ctx.fill();
        ctx.beginPath(); ctx.arc(ex,ey,6,0,Math.PI*2);
        ctx.fillStyle = V.gold+"55"; ctx.fill();
        ctx.strokeStyle = V.gold; ctx.lineWidth = 1.5; ctx.stroke();
        ctx.fillStyle = V.gold; ctx.font = `7px ${MONO}`; ctx.textAlign = "center";
        ctx.fillText("TopoII", ex, ey+20);
      }

      ctx.textAlign = "left";
      ctx.fillStyle = V.aurora; ctx.font = `9px ${MONO}`;
      ctx.fillText("TREFOIL 3\u2081 · WRITHE +3", 10, 16);
      ctx.fillStyle = V.gold+"BB"; ctx.font = `8px ${MONO}`;
      ctx.fillText("JONES: \u2212t\u207B\u2074+t\u207B\u00B3+t\u207B\u00B9", 10, 29);
      ctx.fillStyle = V.ink+"55";
      ctx.fillText("ALEXANDER: \u2212t+3\u2212t\u207B\u00B9", 10, 42);
      ctx.fillStyle = V.green+"99"; ctx.textAlign = "right";
      ctx.fillText("TOPO II \u2192 STRAND PASSAGE \u2192 UNKNOT", W-10, 16);
      ctx.fillStyle = V.gold+"77";
      ctx.fillText("WALKING STRAND AT " + ((enzT/(Math.PI*2))*100).toFixed(0)+"%", W-10, 29);
    }

    function loop() { t += 0.008*speed; draw(); raf.current = requestAnimationFrame(loop); }
    loop();
    return () => cancelAnimationFrame(raf.current);
  }, [speed]);

  return (
    <canvas ref={ref} width={720} height={320}
      style={{ width:"100%", height:320, display:"block", borderRadius:4 }}/>
  );
}

/* ── Canvas 2: Thermal Seizure Threshold ──────────────────── */
function ThermalCanvas({ lyme, temp }:{ lyme:boolean; temp:number }) {
  const ref = useRef<HTMLCanvasElement>(null);
  const raf = useRef(0);
  useEffect(() => {
    const cv = ref.current; if (!cv) return;
    const ctx = cv.getContext("2d")!;
    const W = cv.width, H = cv.height;
    const PL = 56, PR = 16, PT = 22, PB = 38;
    const IW = W-PL-PR, IH = H-PT-PB;

    function threshold(tc:number, ly:boolean): number {
      const base = 1/(1+Math.exp((tc-38.5)*1.3));
      return Math.max(0.03, base * (ly ? 0.72 : 1.0));
    }
    function toX(tc:number) { return PL+((tc-35)/7)*IW; }
    function toY(val:number) { return PT+IH*(1-val); }

    function draw() {
      ctx.clearRect(0,0,W,H);
      ctx.fillStyle = "#010308"; ctx.fillRect(0,0,W,H);

      const dangerGrd = ctx.createLinearGradient(toX(38.5),0,toX(42),0);
      dangerGrd.addColorStop(0, V.plasma+"00"); dangerGrd.addColorStop(1, V.plasma+"33");
      ctx.fillStyle = dangerGrd;
      ctx.fillRect(toX(38.5),PT,toX(42)-toX(38.5),IH);

      ctx.strokeStyle = V.dim+"33"; ctx.lineWidth = 0.5;
      for (let tc=35; tc<=42; tc++) {
        const x = toX(tc);
        ctx.beginPath(); ctx.moveTo(x,PT); ctx.lineTo(x,PT+IH); ctx.stroke();
        ctx.fillStyle = V.ink+"55"; ctx.font = `8px ${MONO}`; ctx.textAlign = "center";
        ctx.fillText(`${tc}°`, x, PT+IH+14);
      }
      for (let v=0; v<=1; v+=0.25) {
        const y = toY(v);
        ctx.beginPath(); ctx.moveTo(PL,y); ctx.lineTo(W-PR,y); ctx.stroke();
        ctx.fillStyle = V.ink+"55"; ctx.font = `8px ${MONO}`; ctx.textAlign = "right";
        ctx.fillText(`${Math.round(v*100)}%`, PL-6, y+3);
      }

      ctx.fillStyle = V.ink+"66"; ctx.font = `8px ${MONO}`; ctx.textAlign = "center";
      ctx.fillText("TEMPERATURE (°C)", W/2, H-4);
      ctx.save(); ctx.translate(10, PT+IH/2); ctx.rotate(-Math.PI/2);
      ctx.fillText("SEIZURE THRESHOLD", 0, 0); ctx.restore();

      ctx.beginPath();
      for (let i=0; i<=120; i++) {
        const tc = 35+7*(i/120);
        const x = toX(tc), y = toY(threshold(tc,false));
        i===0 ? ctx.moveTo(x,y) : ctx.lineTo(x,y);
      }
      ctx.strokeStyle = V.aurora; ctx.lineWidth = 2; ctx.setLineDash([]); ctx.stroke();

      if (lyme) {
        ctx.beginPath();
        for (let i=0; i<=120; i++) {
          const tc = 35+7*(i/120);
          const x = toX(tc), y = toY(threshold(tc,true));
          i===0 ? ctx.moveTo(x,y) : ctx.lineTo(x,y);
        }
        ctx.strokeStyle = V.rose; ctx.lineWidth = 2;
        ctx.setLineDash([5,3]); ctx.stroke(); ctx.setLineDash([]);
      }

      const cx2 = toX(temp);
      const thVal = threshold(temp, lyme);
      const cy2 = toY(thVal);

      ctx.strokeStyle = V.shock+"66"; ctx.lineWidth = 1; ctx.setLineDash([3,3]);
      ctx.beginPath(); ctx.moveTo(cx2,PT); ctx.lineTo(cx2,PT+IH); ctx.stroke();
      ctx.setLineDash([]);

      if (isFinite(cx2)&&isFinite(cy2)) {
        const col = thVal > 0.5 ? V.aurora : thVal > 0.25 ? V.gold : V.plasma;
        ctx.beginPath(); ctx.arc(cx2,cy2,5,0,Math.PI*2);
        ctx.fillStyle = col; ctx.fill();
        ctx.fillStyle = V.ink; ctx.font = `8px ${MONO}`; ctx.textAlign = "center";
        ctx.fillText(`${Math.round(thVal*100)}%`, cx2, cy2-12);
        ctx.fillStyle = col+"88"; ctx.font = `7px ${MONO}`;
        const risk = thVal > 0.5 ? "LOW RISK" : thVal > 0.25 ? "MODERATE" : "HIGH RISK";
        ctx.fillText(risk, cx2, cy2-22);
      }

      ctx.textAlign = "left"; ctx.font = `8px ${MONO}`;
      ctx.fillStyle = V.aurora; ctx.fillText("\u2500\u2500\u2500 HEALTHY BASELINE", PL+4, PT+13);
      if (lyme) {
        ctx.fillStyle = V.rose;
        ctx.fillText("- - LYME NEUROBORRELIOSIS (\u221220%)", PL+4, PT+25);
      }
      ctx.fillStyle = V.plasma+"88"; ctx.textAlign = "right";
      ctx.fillText("\u25A0 THERMAL DANGER ZONE", W-PR-4, PT+13);
    }

    function loop() { draw(); raf.current = requestAnimationFrame(loop); }
    loop();
    return () => cancelAnimationFrame(raf.current);
  }, [lyme, temp]);

  return (
    <canvas ref={ref} width={700} height={280}
      style={{ width:"100%", height:280, display:"block", borderRadius:4 }}/>
  );
}

/* ── Canvas 3: 6-Axis Plausibility Radar ──────────────────── */
function RadarCanvas() {
  const ref = useRef<HTMLCanvasElement>(null);
  const raf = useRef(0);
  useEffect(() => {
    const cv = ref.current; if (!cv) return;
    const ctx = cv.getContext("2d")!;
    const W = cv.width, H = cv.height, CX = W/2, CY = H/2+10;
    const R = Math.min(W,H)*0.34;
    let t = 0;

    const axes = [
      { label:"LYME\u2192SEIZURE",     score:0.88, col:V.aurora },
      { label:"HEAT\u2192SEIZURE",     score:0.65, col:V.gold   },
      { label:"EMF\u2192SEIZURE",      score:0.32, col:V.amb    },
      { label:"DNA KNOT RX",           score:0.12, col:V.vio    },
      { label:"QUANTUM DECOH.",        score:0.08, col:V.rose   },
      { label:"RESONANT DRIVER",       score:0.05, col:V.plasma },
    ];
    const N6 = axes.length;

    function draw() {
      ctx.clearRect(0,0,W,H);
      ctx.fillStyle = "#010308"; ctx.fillRect(0,0,W,H);

      for (let ring=1; ring<=4; ring++) {
        const r = R*ring/4;
        ctx.beginPath();
        for (let i=0; i<N6; i++) {
          const ang = (i/N6)*Math.PI*2 - Math.PI/2;
          const x = CX+r*Math.cos(ang), y = CY+r*Math.sin(ang);
          i===0 ? ctx.moveTo(x,y) : ctx.lineTo(x,y);
        }
        ctx.closePath();
        ctx.strokeStyle = V.dim+"55"; ctx.lineWidth = 0.5; ctx.stroke();
        if (ring<4) {
          ctx.fillStyle = V.ink+"22"; ctx.font = `7px ${MONO}`; ctx.textAlign = "center";
          ctx.fillText(`${ring*25}%`, CX+4, CY-r+9);
        }
      }

      for (let i=0; i<N6; i++) {
        const ang = (i/N6)*Math.PI*2 - Math.PI/2;
        ctx.beginPath();
        ctx.moveTo(CX,CY);
        ctx.lineTo(CX+R*Math.cos(ang), CY+R*Math.sin(ang));
        ctx.strokeStyle = V.dim+"66"; ctx.lineWidth = 0.5; ctx.stroke();
      }

      const pulse = 0.9+0.1*Math.sin(t*1.8);
      ctx.beginPath();
      for (let i=0; i<N6; i++) {
        const ang = (i/N6)*Math.PI*2 - Math.PI/2;
        const r = R*axes[i].score*pulse;
        const x = CX+r*Math.cos(ang), y = CY+r*Math.sin(ang);
        i===0 ? ctx.moveTo(x,y) : ctx.lineTo(x,y);
      }
      ctx.closePath();
      ctx.fillStyle = V.aurora+"14"; ctx.fill();
      ctx.strokeStyle = V.aurora+"55"; ctx.lineWidth = 1.5; ctx.stroke();

      for (let i=0; i<N6; i++) {
        const ang = (i/N6)*Math.PI*2 - Math.PI/2;
        const r = R*axes[i].score;
        const dx = CX+r*Math.cos(ang), dy = CY+r*Math.sin(ang);
        if (!isFinite(dx)||!isFinite(dy)) continue;

        ctx.beginPath(); ctx.arc(dx,dy,4,0,Math.PI*2);
        ctx.fillStyle = axes[i].col; ctx.fill();

        const lx = CX+(R+28)*Math.cos(ang), ly = CY+(R+28)*Math.sin(ang);
        if (!isFinite(lx)||!isFinite(ly)) continue;
        const ca = Math.cos(ang);
        ctx.textAlign = ca > 0.1 ? "left" : ca < -0.1 ? "right" : "center";
        ctx.fillStyle = axes[i].col; ctx.font = `8px ${MONO}`;
        ctx.fillText(axes[i].label, lx, ly);
        ctx.fillStyle = V.ink+"66"; ctx.font = `7px ${MONO}`;
        ctx.fillText(`${Math.round(axes[i].score*100)}% plausible`, lx, ly+11);
      }

      ctx.textAlign = "center";
      ctx.fillStyle = V.ink+"44"; ctx.font = `8px ${MONO}`;
      ctx.fillText("EVIDENCE", CX, CY-7);
      ctx.fillText("PLAUSIBILITY", CX, CY+7);
    }

    function loop() { t += 0.02; draw(); raf.current = requestAnimationFrame(loop); }
    loop();
    return () => cancelAnimationFrame(raf.current);
  }, []);

  return (
    <canvas ref={ref} width={640} height={380}
      style={{ width:"100%", maxWidth:640, height:380, display:"block",
        margin:"0 auto", borderRadius:4 }}/>
  );
}

/* ── Main Page ────────────────────────────────────────────── */
export default function BorreliaKnotPage() {
  const [knotSpeed, setKnotSpeed] = useState(1);
  const [lymeActive, setLymeActive] = useState(false);
  const [currentTemp, setCurrentTemp] = useState(37);
  const [tab, setTab] = useState<"knot"|"thermal"|"radar">("knot");

  const tabLabel = (k: string) =>
    k==="knot" ? "DNA KNOT" : k==="thermal" ? "THERMAL THRESHOLD" : "PLAUSIBILITY RADAR";

  const MECHS = [
    { title:"LYME → SEIZURE", ev:"HIGH · CLINICAL", col:V.aurora, score:88,
      body:"Borrelia burgdorferi invades the CNS, triggering inflammation and autoimmune responses that lower the seizure threshold. Documented in case reports and neurological studies. IV ceftriaxone (14–21 days) often resolves seizures once the underlying infection clears." },
    { title:"HEAT → SEIZURE", ev:"MODERATE · MECHANISM KNOWN", col:V.gold, score:65,
      body:"Elevated body temperature increases neuronal excitability and reduces inhibitory GABA activity. In Lyme patients with an already-lowered threshold, heat acts as an amplifying co-trigger — pushing excitation past the seizure boundary at lower temperatures than a healthy baseline." },
    { title:"EMF → SEIZURE", ev:"LOW-MODERATE · ANIMAL MODELS", col:V.amb, score:32,
      body:"Some animal studies show EMF at specific frequencies can elevate c-Fos expression (a seizure marker). Human evidence is mixed. EMF may act as a secondary stressor in already-compromised nervous systems rather than a primary cause. Sensitivity varies widely between individuals." },
    { title:"DNA KNOT THERAPY", ev:"THEORETICAL · NO CLINICAL DATA", col:V.vio, score:12,
      body:"Knot theory describes how Type II topoisomerases resolve DNA supercoiling using strand-passage. The model is mathematically rigorous and biologically accurate. No resonant driver method exists clinically to manipulate these knots therapeutically in Lyme or seizure contexts." },
    { title:"QUANTUM DECOHERENCE", ev:"SPECULATIVE · FRINGE RESEARCH", col:V.rose, score:8,
      body:"Fringe papers speculate on quantum effects in ion channels or microtubules preceding seizures. Quantum biology is valid in limited contexts (photosynthesis, avian navigation) but its role in macroscopic neural pathology like Lyme-induced seizures is entirely unestablished." },
    { title:"RESONANT DRIVER", ev:"NO EVIDENCE · UNVALIDATED", col:V.plasma, score:5,
      body:"Using a resonant driver to decohere pathogen-entangled DNA knots combines quantum decoherence and knot theory in a way that lacks any clinical validation. Mathematically elegant as a model. Self-experimentation risks delaying real antibiotics and anti-seizure treatment." },
  ];

  const KNOTS = [
    ["UNKNOT 0\u2081","0","0","0","\u00B11","\u00B11",V.aurora],
    ["TREFOIL 3\u2081","3","\u00B13","1","\u2212t+3\u2212t\u207B\u00B9","\u2212t\u207B\u2074+t\u207B\u00B3+t\u207B\u00B9",V.gold],
    ["FIGURE-8 4\u2081","4","0","1","t\u22123+t\u207B\u00B9","t\u00B2\u2212t+1\u2212t\u207B\u00B9+t\u207B\u00B2",V.vio],
    ["CINQUEFOIL 5\u2081","5","\u00B15","2","t\u00B2\u2212t+1\u2212t\u207B\u00B9+t\u207B\u00B2","\u2212t\u207B\u2078+t\u207B\u2076+t\u207B\u00B2",V.rose],
  ];

  const tabs: Array<"knot"|"thermal"|"radar"> = ["knot","thermal","radar"];

  return (
    <div style={{ background:V.bg, minHeight:"100vh", color:V.ink, fontFamily:MONO, paddingBottom:80 }}>
      <div style={{ padding:"10px 24px", borderBottom:`1px solid ${V.dim}44`,
        display:"flex", flexWrap:"wrap", gap:4 }}>
        {[
          ["BORRELIA KNOT",V.aurora],["DNA TOPOLOGY",V.gold],
          ["KNOT INVARIANTS",V.vio],["THERMAL DECOHERENCE",V.rose],
          ["PLAUSIBILITY MAP",V.blue],["SEIZURE THRESHOLD",V.amb],
          ["AETHER",V.plasma],
        ].map(([l,c]) => <Tag key={l} l={l} c={c}/>)}
      </div>

      <div style={{ padding:"44px 32px 20px", maxWidth:960, margin:"0 auto" }}>
        <div style={{ fontFamily:MONO, fontSize:10, color:V.aurora, letterSpacing:"0.2em", marginBottom:12 }}>
          LIVE SIMULATION
        </div>
        <h1 style={{ fontFamily:DISP, fontSize:"clamp(24px,4.5vw,48px)", color:V.ink,
          margin:"0 0 16px", lineHeight:1.1 }}>
          Knot Topology · Thermal Decoherence · Borrelia Field
        </h1>
        <p style={{ fontFamily:SERIF, fontSize:16, color:V.ink+"99", lineHeight:1.7,
          maxWidth:680, margin:"0 0 6px" }}>
          DNA supercoiling under Lyme neuroborreliosis creates measurable topological stress.
          Heat amplifies crossing probability, lowering the seizure threshold through compound
          neuronal excitability. This simulator deciphers mechanism plausibility across the
          Lyme–knot–decoherence axis and separates evidence-based signals from decoy hypotheses.
        </p>
      </div>

      <div style={{ maxWidth:960, margin:"0 auto", padding:"0 32px" }}>

        {/* tab bar */}
        <div style={{ display:"flex", gap:4, marginBottom:0 }}>
          {tabs.map(tb => (
            <button key={tb} onClick={() => setTab(tb)} style={{
              background: tab===tb ? V.aurora+"22" : "transparent",
              border: `1px solid ${tab===tb ? V.aurora : V.dim}`,
              borderBottom: tab===tb ? `1px solid ${V.bg}` : `1px solid ${V.dim}`,
              color: tab===tb ? V.aurora : V.ink+"55", fontFamily:MONO, fontSize:9,
              letterSpacing:"0.14em", padding:"6px 14px", cursor:"pointer",
              borderRadius:"3px 3px 0 0", position:"relative", bottom:-1,
            }}>{tabLabel(tb)}</button>
          ))}
        </div>

        {/* canvas panel */}
        <div style={{ border:`1px solid ${V.dim}`, borderRadius:"0 4px 4px 4px", overflow:"hidden" }}>
          <div style={{ padding:"6px 12px", background:V.dim+"22",
            borderBottom:`1px solid ${V.dim}44`, fontFamily:MONO, fontSize:8,
            color:V.aurora+"88", letterSpacing:"0.12em" }}>
            {tab==="knot" && "DNA KNOT TOPOLOGY · TREFOIL 3\u2081 · TOPOISOMERASE II ENGINE · JONES POLYNOMIAL"}
            {tab==="thermal" && "THERMAL SEIZURE THRESHOLD · NEUROBORRELIOSIS CO-FACTOR · TEMPERATURE AXIS · 35\u201342\u00B0C"}
            {tab==="radar" && "MECHANISM PLAUSIBILITY RADAR · EVIDENCE QUALITY SCORES · 6-AXIS HEXAGONAL MAP"}
          </div>

          {tab==="knot" && (
            <div>
              <KnotCanvas speed={knotSpeed}/>
              <div style={{ padding:"8px 16px", background:V.dim+"11",
                display:"flex", alignItems:"center", gap:16, flexWrap:"wrap",
                borderTop:`1px solid ${V.dim}33` }}>
                <span style={{ fontFamily:MONO, fontSize:9, color:V.ink+"55" }}>ROTATION SPEED</span>
                <input type="range" min={0.2} max={3} step={0.1} value={knotSpeed}
                  onChange={e => setKnotSpeed(+e.target.value)}
                  style={{ width:120, accentColor:V.aurora }}/>
                <span style={{ fontFamily:MONO, fontSize:9, color:V.aurora }}>{knotSpeed.toFixed(1)}×</span>
                <span style={{ fontFamily:MONO, fontSize:8, color:V.gold+"88", marginLeft:"auto" }}>
                  GOLD DOT = TOPOISOMERASE II · GOLD ENZYME WALKS STRAND · RESOLVES CROSSINGS
                </span>
              </div>
            </div>
          )}

          {tab==="thermal" && (
            <div>
              <ThermalCanvas lyme={lymeActive} temp={currentTemp}/>
              <div style={{ padding:"8px 16px", background:V.dim+"11",
                display:"flex", alignItems:"center", gap:20, flexWrap:"wrap",
                borderTop:`1px solid ${V.dim}33` }}>
                <div style={{ display:"flex", alignItems:"center", gap:8 }}>
                  <span style={{ fontFamily:MONO, fontSize:9, color:V.ink+"55" }}>TEMP</span>
                  <input type="range" min={35} max={42} step={0.1} value={currentTemp}
                    onChange={e => setCurrentTemp(+e.target.value)}
                    style={{ width:140, accentColor:V.shock }}/>
                  <span style={{ fontFamily:MONO, fontSize:9, color:V.shock }}>
                    {currentTemp.toFixed(1)}°C
                  </span>
                </div>
                <button onClick={() => setLymeActive(a => !a)} style={{
                  background: lymeActive ? V.rose+"33" : "transparent",
                  border: `1px solid ${lymeActive ? V.rose : V.dim}`,
                  color: lymeActive ? V.rose : V.ink+"55",
                  fontFamily:MONO, fontSize:9, padding:"5px 14px",
                  cursor:"pointer", borderRadius:3, letterSpacing:"0.1em",
                }}>
                  {lymeActive ? "● LYME ACTIVE" : "○ LYME OFF"}
                </button>
                <span style={{ fontFamily:MONO, fontSize:8, color:V.ink+"44", marginLeft:"auto" }}>
                  TOGGLE LYME CO-FACTOR · OBSERVE THRESHOLD SHIFT
                </span>
              </div>
            </div>
          )}

          {tab==="radar" && <RadarCanvas/>}
        </div>

        {/* Knot invariant table */}
        <div style={{ margin:"44px 0 0" }}>
          <div style={{ borderLeft:`3px solid ${V.gold}`, paddingLeft:14, marginBottom:16 }}>
            <div style={{ fontFamily:MONO, fontSize:10, color:V.gold, letterSpacing:"0.18em" }}>
              I · KNOT INVARIANT REFERENCE
            </div>
            <div style={{ fontFamily:SERIF, fontSize:13, color:V.ink+"66", marginTop:4 }}>
              Classification tools used to identify DNA knot type in topoisomerase experiments
            </div>
          </div>
          <div style={{ overflowX:"auto" }}>
            <table style={{ width:"100%", borderCollapse:"collapse", fontFamily:MONO, fontSize:10 }}>
              <thead>
                <tr>
                  {["KNOT","CROSSINGS","WRITHE","UNKNOTTING #","ALEXANDER POLY","JONES POLY"].map(h => (
                    <th key={h} style={{ padding:"8px 12px", borderBottom:`1px solid ${V.dim}`,
                      color:V.ink+"55", textAlign:"left", letterSpacing:"0.08em", whiteSpace:"nowrap" }}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {KNOTS.map(([name,cr,wr,un,al,jo,col]) => (
                  <tr key={name}>
                    <td style={{ padding:"8px 12px", color:col, borderBottom:`1px solid ${V.dim}22`, whiteSpace:"nowrap" }}>{name}</td>
                    <td style={{ padding:"8px 12px", color:V.ink+"88", borderBottom:`1px solid ${V.dim}22` }}>{cr}</td>
                    <td style={{ padding:"8px 12px", color:V.ink+"88", borderBottom:`1px solid ${V.dim}22` }}>{wr}</td>
                    <td style={{ padding:"8px 12px", color:V.ink+"88", borderBottom:`1px solid ${V.dim}22` }}>{un}</td>
                    <td style={{ padding:"8px 12px", color:V.ink+"66", fontFamily:SERIF, fontSize:12, borderBottom:`1px solid ${V.dim}22` }}>{al}</td>
                    <td style={{ padding:"8px 12px", color:V.ink+"66", fontFamily:SERIF, fontSize:12, borderBottom:`1px solid ${V.dim}22` }}>{jo}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Evidence matrix cards */}
        <div style={{ margin:"44px 0 0" }}>
          <div style={{ borderLeft:`3px solid ${V.blue}`, paddingLeft:14, marginBottom:16 }}>
            <div style={{ fontFamily:MONO, fontSize:10, color:V.blue, letterSpacing:"0.18em" }}>
              II · MECHANISM EVIDENCE MATRIX · DECOY PLAUSIBILITY FILTER
            </div>
            <div style={{ fontFamily:SERIF, fontSize:13, color:V.ink+"66", marginTop:4 }}>
              Evidence-weighted scores separate actionable signals from mathematically-seductive decoys
            </div>
          </div>
          <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(280px,1fr))", gap:12 }}>
            {MECHS.map(m => (
              <div key={m.title} style={{ padding:16, background:m.col+"0A",
                border:`1px solid ${m.col}33`, borderRadius:4 }}>
                <div style={{ display:"flex", justifyContent:"space-between",
                  alignItems:"flex-start", marginBottom:6 }}>
                  <div style={{ fontFamily:MONO, fontSize:9, color:m.col,
                    letterSpacing:"0.12em" }}>{m.title}</div>
                  <div style={{ fontFamily:MONO, fontSize:11, color:m.col,
                    fontWeight:"bold" }}>{m.score}%</div>
                </div>
                <div style={{ fontFamily:MONO, fontSize:8, color:m.col+"77",
                  marginBottom:10, letterSpacing:"0.08em" }}>{m.ev}</div>
                <div style={{ fontFamily:SERIF, fontSize:12.5, color:V.ink+"88",
                  lineHeight:1.65 }}>{m.body}</div>
                <div style={{ marginTop:12, height:3, background:V.dim+"44", borderRadius:2 }}>
                  <div style={{ width:`${m.score}%`, height:3, background:m.col,
                    borderRadius:2, transition:"width 0.3s" }}/>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Practical decoy filter note */}
        <div style={{ margin:"44px 0 0", padding:22, background:V.gold+"0A",
          border:`1px solid ${V.gold}33`, borderRadius:4 }}>
          <div style={{ fontFamily:MONO, fontSize:9, color:V.gold, letterSpacing:"0.18em", marginBottom:14 }}>
            III · PRACTICAL DECOY FILTER · WEATHERING & FEATHERING HEAT DECIPHER
          </div>
          <p style={{ fontFamily:SERIF, fontSize:14, color:V.ink+"99", lineHeight:1.75,
            margin:"0 0 12px" }}>
            <strong style={{ color:V.gold }}>"Weathering"</strong> is the thermal erosion of seizure thresholds —
            a real, measurable mechanism. Temperature above 38.5°C causes sigmoidally accelerating
            threshold collapse. In a Lyme-compromised nervous system, the inflection point shifts
            ~1.5°C lower, meaning fever that a healthy brain tolerates can be enough to trigger a seizure.
          </p>
          <p style={{ fontFamily:SERIF, fontSize:14, color:V.ink+"99", lineHeight:1.75,
            margin:"0 0 12px" }}>
            <strong style={{ color:V.aurora }}>"Feathering"</strong> is the gradual fraying of DNA topology under
            conditions of topoisomerase stress — increased supercoiling, crossing density, and writhe.
            Topoisomerase II inhibition (which certain Borrelia-mediated inflammation can induce) lets
            knot complexity grow unchecked. The trefoil 3₁ with writhe +3 is the first stable knot;
            untreated, the system progresses to 5₁ and beyond.
          </p>
          <p style={{ fontFamily:SERIF, fontSize:14, color:V.ink+"99", lineHeight:1.75, margin:0 }}>
            The <strong style={{ color:V.rose }}>decoy plausibilities</strong> — quantum decoherence, resonant
            drivers, EMF as primary cause — are mathematically seductive but clinically unsupported.
            This simulator assigns evidence-weighted scores to each. High-score mechanisms (Lyme → heat
            cascade) should drive clinical action: antibiotics + anti-seizure meds + thermal management.
            Low-score mechanisms remain theoretical research hypotheses, not treatment vectors.
          </p>
        </div>

        {/* cross-links */}
        <div style={{ margin:"40px 0 0" }}>
          <div style={{ fontFamily:MONO, fontSize:9, color:V.dim, letterSpacing:"0.16em", marginBottom:12 }}>
            RELATED SYSTEMS
          </div>
          <div style={{ display:"flex", flexWrap:"wrap", gap:8 }}>
            {[
              ["/understanding-strand", "Understanding Strand", V.aurora],
              ["/atp-transport",        "ATP Transport",        V.gold],
              ["/polymer-biobreak",     "Polymer Biobreak",     V.vio],
              ["/gravitational-field",  "Gravitational Field",  V.blue],
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
