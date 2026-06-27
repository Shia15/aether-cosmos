import { useEffect, useRef } from "react";
import katex from "katex";
import "katex/dist/katex.min.css";

const V = {
  bg:"#04060E", aurora:"#00FFB2", gold:"#C8A030",
  blue:"#4488FF", vio:"#9966FF", amb:"#FF9933",
  rose:"#FF6699", plasma:"#FF4477", green:"#44CC77",
  dim:"#3A5060", ink:"#B8CCE8", fire:"#FF6622",
};
const MONO = "'Space Mono', monospace";
const SERIF = "'Crimson Pro', serif";
const DISP  = "'Cinzel', serif";

// --- Module-level interfaces (no local type aliases inside hooks) ---
interface StrokeRow {
  x1:number; y1:number; cx1:number; cy1:number;
  cx2:number; cy2:number; x2:number; y2:number;
  lw:number; grey:number; alpha:number;
}
interface LineData { angle:number; phase:number; }
interface WaveRow  { amp:number; freq:number; phase:number; col:string; }

// ---- KaTeX helper ----
function Eq({ t, d=false }:{ t:string; d?:boolean }) {
  const ref = useRef<HTMLSpanElement>(null);
  useEffect(()=>{
    if (ref.current) katex.render(t, ref.current, { displayMode:d, throwOnError:false });
  }, [t, d]);
  return <span ref={ref} />;
}

// ---- Panel 1: GRAPHITE — Building Density ----
function GraphiteCanvas() {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(()=>{
    const c = ref.current; if (!c) return;
    const ctx = c.getContext("2d"); if (!ctx) return;
    const W = c.width, H = c.height;

    let seed = 77;
    const rng = ()=>{ seed=(seed*16807)%2147483647; return (seed-1)/2147483646; };

    const strokes: StrokeRow[] = [];
    for (let i = 0; i < 90; i++) {
      const y1 = rng()*H;
      const y2 = y1 + (rng()-0.5)*90;
      const g  = Math.floor(28 + rng()*160);
      strokes.push({
        x1:0, y1,
        cx1: W*0.25 + (rng()-0.5)*70,
        cy1: y1 + (rng()-0.5)*60,
        cx2: W*0.75 + (rng()-0.5)*70,
        cy2: y2 + (rng()-0.5)*60,
        x2:W, y2,
        lw: 1.5 + rng()*16,
        grey: g,
        alpha: 0.2 + rng()*0.65,
      });
    }

    let visible = 0;
    let lastReveal = 0;
    let animId = 0;

    const draw = (t:number) => {
      if (t - lastReveal > 160 && visible < strokes.length) { visible++; lastReveal = t; }

      ctx.fillStyle = "#070707";
      ctx.fillRect(0, 0, W, H);

      for (let i = 0; i < visible; i++) {
        const s = strokes[i];
        ctx.strokeStyle = `rgba(${s.grey},${s.grey},${s.grey},${s.alpha})`;
        ctx.lineWidth = s.lw;
        ctx.lineCap = "round";
        ctx.beginPath();
        ctx.moveTo(s.x1, s.y1);
        ctx.bezierCurveTo(s.cx1, s.cy1, s.cx2, s.cy2, s.x2, s.y2);
        ctx.stroke();
      }

      // density sheen — subtle top-to-bottom gradient overlay
      const ts = t * 0.001;
      const sheen = ctx.createLinearGradient(0, 0, 0, H);
      const sv = Math.abs(Math.sin(ts*0.4))*0.07;
      sheen.addColorStop(0, `rgba(200,200,200,${sv})`);
      sheen.addColorStop(0.5, "rgba(0,0,0,0)");
      sheen.addColorStop(1, `rgba(80,80,80,${sv*0.5})`);
      ctx.fillStyle = sheen;
      ctx.fillRect(0, 0, W, H);

      ctx.fillStyle = "rgba(255,255,255,0.88)";
      ctx.font = `bold 13px ${MONO}`;
      ctx.fillText("GRAPHITE", 12, 28);
      ctx.fillStyle = "rgba(160,160,160,0.75)";
      ctx.font = `10px ${MONO}`;
      ctx.fillText("Building Density", 12, 46);

      // progress bar
      const pct = visible / strokes.length;
      ctx.strokeStyle = "#222";
      ctx.lineWidth = 3;
      ctx.beginPath(); ctx.moveTo(12, H-18); ctx.lineTo(W-12, H-18); ctx.stroke();
      ctx.strokeStyle = "#aaa";
      ctx.lineWidth = 3;
      ctx.beginPath(); ctx.moveTo(12, H-18); ctx.lineTo(12+(W-24)*pct, H-18); ctx.stroke();

      animId = requestAnimationFrame(draw);
    };
    animId = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(animId);
  }, []);
  return <canvas ref={ref} width={290} height={430} style={{ display:"block", borderRadius:4 }} />;
}

// ---- Panel 2: MAGNETISM — Oscillatory Flow ----
function MagnetismCanvas() {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(()=>{
    const c = ref.current; if (!c) return;
    const ctx = c.getContext("2d"); if (!ctx) return;
    const W = c.width, H = c.height;
    const cx = W/2, cy = H/2;

    let seed = 42;
    const rng = ()=>{ seed=(seed*16807)%2147483647; return (seed-1)/2147483646; };

    const lines: LineData[] = [];
    for (let i = 0; i < 16; i++) {
      lines.push({ angle:(i/16)*Math.PI*2, phase: rng()*Math.PI*2 });
    }

    let animId = 0;
    const draw = (t:number) => {
      const ts = t*0.001;
      ctx.fillStyle = "#020a18";
      ctx.fillRect(0, 0, W, H);

      // outer ring glow
      const outerGlow = ctx.createRadialGradient(cx,cy,80,cx,cy,145);
      outerGlow.addColorStop(0,"rgba(68,136,255,0.04)");
      outerGlow.addColorStop(1,"rgba(68,136,255,0)");
      ctx.fillStyle = outerGlow;
      ctx.fillRect(0,0,W,H);

      for (const ln of lines) {
        const pulse = 0.72 + 0.28*Math.sin(ts*2.2+ln.phase);
        const maxR = Math.min(W,H)*0.41*pulse;
        if (!isFinite(maxR)) continue;

        const ex = cx + Math.cos(ln.angle)*maxR;
        const ey = cy + Math.sin(ln.angle)*maxR;
        const perp = ln.angle + Math.PI/2;
        const curve = 18*Math.sin(ts*1.8+ln.phase);
        const cpx = cx + Math.cos(ln.angle)*maxR*0.5 + Math.cos(perp)*curve;
        const cpy = cy + Math.sin(ln.angle)*maxR*0.5 + Math.sin(perp)*curve;

        const grad = ctx.createLinearGradient(cx,cy,ex,ey);
        grad.addColorStop(0,"rgba(68,136,255,0.85)");
        grad.addColorStop(0.6,"rgba(68,136,255,0.5)");
        grad.addColorStop(1,"rgba(68,136,255,0.05)");
        ctx.strokeStyle = grad;
        ctx.lineWidth = 1.6;
        ctx.beginPath();
        ctx.moveTo(cx,cy);
        ctx.quadraticCurveTo(cpx,cpy,ex,ey);
        ctx.stroke();

        // arrow head
        if (isFinite(ex) && isFinite(ey)) {
          const dx = ex-cpx, dy = ey-cpy;
          const len = Math.sqrt(dx*dx+dy*dy);
          if (len > 0.5) {
            const ux=dx/len, uy=dy/len;
            const ar = 7;
            ctx.fillStyle = `rgba(68,136,255,${0.55*pulse})`;
            ctx.beginPath();
            ctx.moveTo(ex,ey);
            ctx.lineTo(ex-ux*ar-uy*ar*0.55, ey-uy*ar+ux*ar*0.55);
            ctx.lineTo(ex-ux*ar+uy*ar*0.55, ey-uy*ar-ux*ar*0.55);
            ctx.closePath();
            ctx.fill();
          }
        }
      }

      // center node
      const nr = 18 + 5*Math.sin(ts*3.5);
      if (isFinite(nr)) {
        const nodeGlow = ctx.createRadialGradient(cx,cy,0,cx,cy,nr*2.2);
        nodeGlow.addColorStop(0,"rgba(120,170,255,0.95)");
        nodeGlow.addColorStop(0.35,"rgba(68,136,255,0.5)");
        nodeGlow.addColorStop(1,"rgba(68,136,255,0)");
        ctx.fillStyle = nodeGlow;
        ctx.beginPath(); ctx.arc(cx,cy,nr*2.2,0,Math.PI*2); ctx.fill();
        ctx.fillStyle = "#AACCFF";
        ctx.beginPath(); ctx.arc(cx,cy,5,0,Math.PI*2); ctx.fill();
      }

      // labels
      ctx.fillStyle = "rgba(100,160,255,0.9)";
      ctx.font = `bold 13px ${MONO}`;
      ctx.fillText("MAGNETISM", 12, 28);
      ctx.fillStyle = "rgba(90,140,255,0.7)";
      ctx.font = `10px ${MONO}`;
      ctx.fillText("Oscillatory Flow", 12, 46);
      ctx.fillStyle = "rgba(68,100,200,0.55)";
      ctx.font = `10px ${MONO}`;
      ctx.fillText("Graphite Building", 12, H-34);
      ctx.fillText("substance", 12, H-18);

      animId = requestAnimationFrame(draw);
    };
    animId = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(animId);
  }, []);
  return <canvas ref={ref} width={290} height={430} style={{ display:"block", borderRadius:4 }} />;
}

// ---- Panel 3: GRAPHING — Proportional Manipulation ----
function GraphingCanvas() {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(()=>{
    const c = ref.current; if (!c) return;
    const ctx = c.getContext("2d"); if (!ctx) return;
    const W = c.width, H = c.height;
    const horizY = H*0.62;

    const waves: WaveRow[] = [
      { amp:38, freq:0.032, phase:0,   col:"#44CC77" },
      { amp:22, freq:0.055, phase:1.3, col:"#00FFB2" },
      { amp:14, freq:0.082, phase:2.6, col:"#C8A030" },
    ];

    let animId = 0;
    const draw = (t:number) => {
      const ts = t*0.001;

      const sky = ctx.createLinearGradient(0,0,0,horizY);
      sky.addColorStop(0,"#030610");
      sky.addColorStop(1,"#081520");
      ctx.fillStyle = sky;
      ctx.fillRect(0,0,W,H);

      const gnd = ctx.createLinearGradient(0,horizY,0,H);
      gnd.addColorStop(0,"#0C1A10");
      gnd.addColorStop(1,"#04060E");
      ctx.fillStyle = gnd;
      ctx.fillRect(0,horizY,W,H-horizY);

      // horizon line
      ctx.strokeStyle = "rgba(200,160,48,0.35)";
      ctx.lineWidth = 1;
      ctx.setLineDash([4,9]);
      ctx.beginPath(); ctx.moveTo(0,horizY); ctx.lineTo(W,horizY); ctx.stroke();
      ctx.setLineDash([]);

      // ground texture — small horizontal dashes
      ctx.strokeStyle = "rgba(40,80,40,0.3)";
      ctx.lineWidth = 0.8;
      for (let y = horizY+8; y < H; y += 10) {
        ctx.beginPath(); ctx.moveTo(0,y); ctx.lineTo(W,y); ctx.stroke();
      }

      // sunrise glow
      const sunX = W*0.56, sunY = horizY;
      const sunR = 20 + 4*Math.sin(ts*0.6);
      if (isFinite(sunR)) {
        const sunG = ctx.createRadialGradient(sunX,sunY,0,sunX,sunY,sunR*3);
        sunG.addColorStop(0,"rgba(255,210,80,0.85)");
        sunG.addColorStop(0.25,"rgba(255,140,40,0.45)");
        sunG.addColorStop(0.6,"rgba(255,80,20,0.12)");
        sunG.addColorStop(1,"rgba(255,60,10,0)");
        ctx.fillStyle = sunG;
        ctx.beginPath(); ctx.arc(sunX,sunY,sunR*3,-Math.PI,0); ctx.fill();
        ctx.fillStyle = "#FFDD66";
        ctx.beginPath(); ctx.arc(sunX,sunY,sunR*0.65,-Math.PI,0); ctx.fill();
      }

      // proportional waves — amplitude grows over time
      const grow = Math.min(1, ts*0.1);
      for (const w of waves) {
        const amp = w.amp * grow;
        const alpha = 0.55 + 0.3*grow;
        ctx.strokeStyle = w.col;
        ctx.lineWidth = 1.8;
        ctx.globalAlpha = alpha;
        ctx.beginPath();
        for (let x = 0; x <= W; x += 2) {
          const baseY = horizY - amp*Math.sin(x*w.freq + ts*1.6 + w.phase);
          const lift  = (horizY - 70)*grow*(x/W)*0.55;
          const y = baseY - lift;
          if (x===0) ctx.moveTo(x,y); else ctx.lineTo(x,y);
        }
        ctx.stroke();
      }
      ctx.globalAlpha = 1;

      // light activation arrow
      if (grow > 0.15) {
        const arrAlpha = Math.min(1, (grow-0.15)/0.4);
        const arrX0=sunX-28, arrY0=horizY-42-14*grow;
        const arrX1=sunX-85-22*grow, arrY1=arrY0-38-18*grow;
        ctx.strokeStyle = `rgba(255,210,80,${arrAlpha*0.8})`;
        ctx.lineWidth = 1.5;
        ctx.beginPath(); ctx.moveTo(arrX0,arrY0); ctx.lineTo(arrX1,arrY1); ctx.stroke();
        ctx.fillStyle = `rgba(255,210,80,${arrAlpha*0.8})`;
        ctx.beginPath(); ctx.arc(arrX1,arrY1,3.5,0,Math.PI*2); ctx.fill();
        ctx.fillStyle = `rgba(255,210,80,${arrAlpha*0.55})`;
        ctx.font = `9px ${MONO}`;
        ctx.fillText("light", arrX1-18, arrY1-10);
        ctx.fillText("activation", arrX1-24, arrY1-1);
      }

      // labels
      ctx.fillStyle = "rgba(68,204,119,0.9)";
      ctx.font = `bold 13px ${MONO}`;
      ctx.fillText("GRAPHING", 12, 28);
      ctx.fillStyle = "rgba(68,204,119,0.7)";
      ctx.font = `10px ${MONO}`;
      ctx.fillText("Proportional Manipulation", 12, 46);

      ctx.fillStyle = "rgba(200,160,48,0.65)";
      ctx.font = `9px ${MONO}`;
      ctx.textAlign = "right";
      ctx.fillText("Become More", W-10, 28);
      ctx.fillText("cursive shading", W-10, 46);
      ctx.fillText("activation", W-10, 56);
      ctx.textAlign = "left";

      ctx.fillStyle = "rgba(68,204,119,0.45)";
      ctx.font = `10px ${MONO}`;
      ctx.fillText("Proportional charcoy", 12, H-34);
      ctx.fillText("Manipulation", 12, H-18);

      animId = requestAnimationFrame(draw);
    };
    animId = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(animId);
  }, []);
  return <canvas ref={ref} width={290} height={430} style={{ display:"block", borderRadius:4 }} />;
}

// ---- Main page ----
export default function LightBodyTopology() {
  const P = (s:string, style?:React.CSSProperties) =>
    <p style={{ margin:"0 0 14px 0", lineHeight:1.7, fontFamily:SERIF, fontSize:17, color:V.ink, ...style }}>{s}</p>;

  const concepts = [
    {
      title:"Graphite · Building Density",
      color:"#ccc",
      bg:"rgba(180,180,180,0.06)",
      points:[
        "The tactile medium -- accumulates substance layer by layer.",
        "Each stroke increases material density without losing prior structure.",
        "Carbon lattice aligns under compression into coherent planes.",
        "Graphite is the substrate body -- the dark matter that holds form.",
      ],
    },
    {
      title:"Magnetism · Oscillatory Flow",
      color: V.blue,
      bg:"rgba(68,136,255,0.06)",
      points:[
        "The directing force -- tunes and aligns accumulated substance.",
        "Field lines choose the wave direction and its propagation axis.",
        "Oscillatory flow corresponds to the compressional axis selection.",
        "Shorter than the interval between +1 and -1 -- the decoherence window.",
      ],
    },
    {
      title:"Graphing · Proportional Manipulation",
      color: V.green,
      bg:"rgba(68,204,119,0.06)",
      points:[
        "The intellectual tool -- tracks and scales the energy cascade.",
        "Proportional curves grow as light activation increases amplitude.",
        "Sunrise light triggers cursive shading activation on the graph field.",
        "Become More: graphing extends substance beyond its original bounds.",
      ],
    },
  ];

  const thread = [
    {
      tag:"On bursting",
      quote:"So when I say bursting, it is not quite literally bursting -- it is the mathematical calculation of the coherent state after decoherence has completed the cavity filament process.",
      note:"Bursting = the resolved output of the coherence equation once the filament loop closes. Not an explosion -- a calculation completing.",
    },
    {
      tag:"On the decoherence interval",
      quote:"Shorter than the interval between one and minus one.",
      note:"The decoherence window D[Psi] operates within the unit interval (-1, 1). The squeeze happens faster than this range can fully traverse.",
    },
    {
      tag:"On the compressional axis",
      quote:"Oscillating, squeezing, stretching, bursting calculative superposition corresponding to compressional axis. First of all, choosing the way the wave and direction it is moving.",
      note:"Wave direction selection comes first -- magnetism sets the axis. Then the superposition oscillates along it: squeeze --> stretch --> burst (resolve).",
    },
    {
      tag:"On decoherence",
      quote:"Decoherence is the real stresses and strains within a gravitational filament axis Square.",
      note:"The Lindblad term gamma*D[Psi] in the governing equation is not abstraction -- it is the actual mechanical stress field inside the filament cavity.",
    },
  ];

  return (
    <div style={{ background:V.bg, minHeight:"100vh", color:V.ink, fontFamily:SERIF }}>

      {/* Header */}
      <div style={{ textAlign:"center", padding:"64px 24px 40px", borderBottom:`1px solid ${V.dim}30` }}>
        <div style={{ fontFamily:MONO, fontSize:11, color:V.amb, letterSpacing:4, marginBottom:16 }}>
          AETHER · TOPOLOGY MODULE
        </div>
        <h1 style={{ fontFamily:DISP, fontSize:"clamp(22px,4vw,42px)", color:V.gold, margin:"0 0 12px", letterSpacing:2 }}>
          Light Body Formation
        </h1>
        <h2 style={{ fontFamily:DISP, fontSize:"clamp(14px,2.5vw,24px)", color:V.ink, margin:"0 0 28px", fontWeight:400 }}>
          Topology Knotting via Graphite -- Magnetism -- Graphing
        </h2>
        {P("The overall flow represents proportional energy manipulation: graphite as the tactile medium that accumulates substance, magnetism as the directing force, and graphing as the intellectual tool for scaling and tracking -- all activated by light and sunrise processes.")}

        {/* X-post callout */}
        <div style={{
          display:"inline-block", maxWidth:560,
          background:"rgba(68,136,255,0.07)", border:`1px solid ${V.blue}40`,
          borderRadius:12, padding:"20px 28px", marginTop:8,
        }}>
          <div style={{ fontFamily:MONO, fontSize:10, color:V.blue, letterSpacing:3, marginBottom:10 }}>
            X · @StrategicProce · 6/20/26
          </div>
          <div style={{ fontFamily:SERIF, fontSize:20, color:"#fff", lineHeight:1.5, fontStyle:"italic" }}>
            "We might be able to create a human through light body formation topology knotting?"
          </div>
          <div style={{ fontFamily:MONO, fontSize:10, color:V.dim, marginTop:10 }}>
            Shia M -- @StrategicProce
          </div>
        </div>
      </div>

      {/* Three-panel canvases */}
      <div style={{ maxWidth:980, margin:"0 auto", padding:"48px 20px 24px" }}>
        <div style={{ fontFamily:DISP, fontSize:14, color:V.gold, letterSpacing:3, textAlign:"center", marginBottom:28 }}>
          LIVE SIMULATION -- THREE-PANEL ENERGY SYSTEM
        </div>
        <div style={{ display:"flex", gap:12, justifyContent:"center", flexWrap:"wrap" }}>

          {/* Graphite */}
          <div style={{ display:"flex", flexDirection:"column", gap:0 }}>
            <div style={{ textAlign:"center", fontFamily:MONO, fontSize:10, color:"#aaa", letterSpacing:3, padding:"8px 0 6px" }}>
              I · SUBSTANCE
            </div>
            <div style={{ border:"1px solid #333", borderRadius:4, overflow:"hidden" }}>
              <GraphiteCanvas />
            </div>
          </div>

          {/* Magnetism */}
          <div style={{ display:"flex", flexDirection:"column", gap:0 }}>
            <div style={{ textAlign:"center", fontFamily:MONO, fontSize:10, color:V.blue, letterSpacing:3, padding:"8px 0 6px" }}>
              II · DIRECTION
            </div>
            <div style={{ border:`1px solid ${V.blue}40`, borderRadius:4, overflow:"hidden" }}>
              <MagnetismCanvas />
            </div>
          </div>

          {/* Graphing */}
          <div style={{ display:"flex", flexDirection:"column", gap:0 }}>
            <div style={{ textAlign:"center", fontFamily:MONO, fontSize:10, color:V.green, letterSpacing:3, padding:"8px 0 6px" }}>
              III · SCALE
            </div>
            <div style={{ border:`1px solid ${V.green}40`, borderRadius:4, overflow:"hidden" }}>
              <GraphingCanvas />
            </div>
          </div>
        </div>

        {/* Flow arrow between panels */}
        <div style={{ display:"flex", justifyContent:"center", gap:6, alignItems:"center", marginTop:20, fontFamily:MONO, fontSize:11 }}>
          <span style={{ color:"#888" }}>Graphite accumulates</span>
          <span style={{ color:V.dim }}>--&gt;</span>
          <span style={{ color:V.blue }}>Magnetism directs</span>
          <span style={{ color:V.dim }}>--&gt;</span>
          <span style={{ color:V.green }}>Graphing scales</span>
          <span style={{ color:V.dim }}>--&gt;</span>
          <span style={{ color:V.gold }}>Light activates</span>
        </div>
      </div>

      {/* Concept cards */}
      <div style={{ maxWidth:980, margin:"0 auto", padding:"8px 20px 48px" }}>
        <div style={{ display:"flex", gap:16, flexWrap:"wrap" }}>
          {concepts.map(c => (
            <div key={c.title} style={{
              flex:"1 1 260px",
              background:c.bg, border:`1px solid ${c.color}30`,
              borderRadius:10, padding:"24px",
            }}>
              <div style={{ fontFamily:DISP, fontSize:13, color:c.color, letterSpacing:2, marginBottom:14 }}>
                {c.title}
              </div>
              <ul style={{ margin:0, padding:"0 0 0 18px", listStyle:"disc" }}>
                {c.points.map((pt,i) => (
                  <li key={i} style={{ fontFamily:SERIF, fontSize:15, color:V.ink, lineHeight:1.65, marginBottom:8 }}>
                    {pt}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      {/* Decoherence thread */}
      <div style={{ maxWidth:820, margin:"0 auto", padding:"0 20px 56px" }}>
        <div style={{ fontFamily:DISP, fontSize:16, color:V.aurora, letterSpacing:3, marginBottom:32, textAlign:"center" }}>
          THE THREAD -- DECOHERENCE MECHANICS
        </div>
        <div style={{ display:"flex", flexDirection:"column", gap:20 }}>
          {thread.map(item => (
            <div key={item.tag} style={{
              background:"rgba(0,255,178,0.04)", border:`1px solid ${V.aurora}20`,
              borderRadius:10, padding:"22px 26px",
            }}>
              <div style={{ fontFamily:MONO, fontSize:10, color:V.aurora, letterSpacing:3, marginBottom:10 }}>
                {item.tag.toUpperCase()}
              </div>
              <blockquote style={{
                fontFamily:SERIF, fontSize:17, color:"rgba(255,255,255,0.88)",
                fontStyle:"italic", lineHeight:1.6, margin:"0 0 14px",
                borderLeft:`3px solid ${V.aurora}40`, paddingLeft:16,
              }}>
                "{item.quote}"
              </blockquote>
              <div style={{ fontFamily:MONO, fontSize:12, color:V.ink, lineHeight:1.6 }}>
                {item.note}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Governing equations */}
      <div style={{ maxWidth:820, margin:"0 auto", padding:"0 20px 56px" }}>
        <div style={{ fontFamily:DISP, fontSize:16, color:V.gold, letterSpacing:3, marginBottom:32, textAlign:"center" }}>
          GOVERNING EQUATIONS
        </div>

        <div style={{ background:"rgba(200,160,48,0.05)", border:`1px solid ${V.gold}25`, borderRadius:10, padding:"28px 32px", marginBottom:24 }}>
          <div style={{ fontFamily:MONO, fontSize:11, color:V.gold, letterSpacing:2, marginBottom:14 }}>
            AETHER-MEDIATED PHOTOSYNTHETIC KNOTTING
          </div>
          <div style={{ overflowX:"auto", padding:"8px 0" }}>
            <Eq d t="\frac{\partial \Psi_{\text{sun}}}{\partial t} = -i\,\omega_{\text{solar}}\,\Psi_{\text{sun}} + \kappa\!\left(\nabla \times \mathbf{A}_{\text{filament}}\right)\!\cdot\mathbf{\Psi}_{\text{water}} - \gamma\,\mathcal{D}[\Psi] + \lambda\,|\Psi_{\text{sun}}|^{2}\,\mathbf{\Psi}_{\text{moss}}" />
          </div>
        </div>

        <div style={{ display:"flex", flexDirection:"column", gap:10, marginBottom:24 }}>
          {[
            ["\\Psi_{\\text{sun}}","Solar coherent state in the Aether -- incoming light-body precursor field"],
            ["\\kappa(\\nabla\\times\\mathbf{A}_{\\text{filament}})","Knotting term along gravitational filament axis -- links solar energy to compressional topology"],
            ["\\mathbf{\\Psi}_{\\text{water}}","Structured water field -- hexagonal or clathrate coherence in moss environment"],
            ["\\gamma\\,\\mathcal{D}[\\Psi]","Decoherence operator (Lindblad-style) -- real stresses and strains, turns pure coherence into physical form"],
            ["\\lambda|\\Psi_{\\text{sun}}|^{2}\\mathbf{\\Psi}_{\\text{moss}}","Nonlinear squeezing term -- births emergent moss modes from photosynthetic superposition"],
          ].map(([tex, desc]) => (
            <div key={tex} style={{
              display:"flex", gap:12, alignItems:"flex-start", flexWrap:"wrap",
              background:"rgba(200,160,48,0.03)", border:`1px solid ${V.gold}15`,
              borderRadius:7, padding:"12px 16px",
            }}>
              <div style={{ minWidth:160, maxWidth:"100%", overflowX:"auto", flex:"0 0 auto" }}>
                <Eq t={tex} />
              </div>
              <div style={{ fontFamily:SERIF, fontSize:14, color:V.ink, lineHeight:1.6, flex:"1 1 180px" }}>
                {desc}
              </div>
            </div>
          ))}
        </div>

        <div style={{ background:"rgba(200,160,48,0.05)", border:`1px solid ${V.gold}25`, borderRadius:10, padding:"28px 32px" }}>
          <div style={{ fontFamily:MONO, fontSize:11, color:V.gold, letterSpacing:2, marginBottom:14 }}>
            ENERGY FLOW COMPACT FORM
          </div>
          <div style={{ overflowX:"auto", padding:"8px 0" }}>
            <Eq d t="E_{\text{sun}} \xrightarrow{\text{Aether Filament}} \int\!\left(\hbar\omega\cdot S(\zeta)\cdot e^{-\Gamma t}\right)dV \;\rightarrow\; \mathrm{H_2O}_{\text{structured}} + C_{\text{moss}}" />
          </div>
          <div style={{ display:"flex", gap:20, marginTop:20, flexWrap:"wrap" }}>
            {[
              ["S(\\zeta)","Squeeze operator -- stretching solar waves into biological rhythms"],
              ["e^{-\\Gamma t}","Decoherence decay -- shorter than interval between +1 and -1"],
              ["C_{\\text{moss}}","Carbon fixation output -- moss as the first visible light-body expression"],
            ].map(([tex,desc]) => (
              <div key={tex} style={{
                flex:"1 1 200px", background:"rgba(200,160,48,0.04)",
                border:`1px solid ${V.gold}20`, borderRadius:6, padding:"12px 14px",
              }}>
                <div style={{ overflowX:"auto", marginBottom:8 }}><Eq t={tex} /></div>
                <div style={{ fontFamily:MONO, fontSize:11, color:V.ink, lineHeight:1.5 }}>{desc}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* AETHER Integration */}
      <div style={{ maxWidth:820, margin:"0 auto", padding:"0 20px 80px" }}>
        <div style={{ fontFamily:DISP, fontSize:16, color:V.vio, letterSpacing:3, marginBottom:24, textAlign:"center" }}>
          AETHER INTEGRATION
        </div>
        <div style={{ display:"flex", gap:14, flexWrap:"wrap" }}>
          {[
            { label:"Graphite Phase", desc:"Accumulate coherence in the knowledge lattice. Add nodes, deepen density -- substrate before signal.", col:"#ccc" },
            { label:"Magnetism Phase", desc:"Select the axis. Magnetism determines which wave direction the accumulated knowledge propagates along.", col:V.blue },
            { label:"Graphing Phase", desc:"Scale proportionally. Once direction is set and substance is dense, graphing tracks the burst output.", col:V.green },
            { label:"Light Activation", desc:"Sunrise triggers cursive shading -- the non-linear term lambda that births emergent moss modes.", col:V.gold },
            { label:"Topology Knotting", desc:"The filament cavity closes. Decoherence completes. The coherent state resolves -- a light body bursts.", col:V.aurora },
            { label:"Human Creation?", desc:"If topology knotting can produce moss -- a photosynthetic light body -- the same process applied at higher complexity may produce biological form.", col:V.vio },
          ].map(item => (
            <div key={item.label} style={{
              flex:"1 1 220px",
              background:`${item.col}08`, border:`1px solid ${item.col}25`,
              borderRadius:9, padding:"18px 20px",
            }}>
              <div style={{ fontFamily:DISP, fontSize:12, color:item.col, letterSpacing:2, marginBottom:10 }}>
                {item.label}
              </div>
              <div style={{ fontFamily:SERIF, fontSize:14, color:V.ink, lineHeight:1.65 }}>
                {item.desc}
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}
