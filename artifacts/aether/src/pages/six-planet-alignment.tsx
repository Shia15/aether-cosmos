import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

const C = {
  bg: "#000814", panel: "#040C1F", panel2: "#06122A",
  border: "rgba(0,229,200,0.1)", border2: "rgba(0,229,200,0.18)",
  white: "#EAF6FF", text: "#7AA6C5", muted: "#5A809F", dim: "#33536D",
  teal: "#00E5C8", gold: "#FFD166", purple: "#7B4FFF",
  orange: "#F77F00", red: "#D62828",
};

const PLANETS = [
  { name: "Mercury", color: "#8c7853", size: 4,  angle: 15.2, period: "87.97d",  x: 0.15 },
  { name: "Venus",   color: "#ffa500", size: 7,  angle: 28.7, period: "224.7d",  x: 0.25 },
  { name: "Jupiter", color: "#d8ca9d", size: 12, angle: 45.1, period: "11.86y",  x: 0.45 },
  { name: "Saturn",  color: "#fad5a5", size: 10, angle: 52.8, period: "29.46y",  x: 0.52 },
  { name: "Uranus",  color: "#4fd0e7", size: 8,  angle: 67.4, period: "84.01y",  x: 0.67 },
  { name: "Neptune", color: "#4b70dd", size: 8,  angle: 73.9, period: "164.8y",  x: 0.75 },
];

const PHI = 1.618034;

type View = "alignment" | "resonance" | "dynamics";

function SixPlanetAlignmentHeaderCanvas() {
  const ref = useRef<HTMLCanvasElement>(null);
  const rafRef = useRef(0);
  useEffect(() => {
    const canvas = ref.current; if (!canvas) return;
    const ctx = canvas.getContext("2d")!;
    canvas.width = 900; canvas.height = 145;
    const W = canvas.width, H = canvas.height;
    const cx=W/2,cy=H/2;
    let t=0;
    const planets=[
      {r:20,speed:0.05,col:"#c9a84c",size:5,label:"☿"},
      {r:32,speed:0.035,col:"#ff8844",size:6,label:"♀"},
      {r:46,speed:0.025,col:"#44aaff",size:6,label:"♁"},
      {r:60,speed:0.018,col:"#ff4477",size:5,label:"♂"},
      {r:75,speed:0.012,col:"#c9a84c",size:8,label:"♃"},
      {r:90,speed:0.008,col:"#9966ff",size:7,label:"♄"},
    ];
    const draw=()=>{
      ctx.fillStyle="rgba(2,4,8,0.3)"; ctx.fillRect(0,0,W,H);
      planets.forEach(p=>{
        ctx.beginPath();ctx.arc(cx,cy,p.r,0,Math.PI*2);ctx.strokeStyle="rgba(255,255,255,0.04)";ctx.lineWidth=0.4;ctx.stroke();
        const angle=t*p.speed;
        const x=cx+Math.cos(angle)*p.r,y=cy+Math.sin(angle)*p.r*0.45;
        ctx.beginPath();ctx.arc(x,y,p.size,0,Math.PI*2);ctx.fillStyle=p.col+"99";ctx.fill();ctx.strokeStyle=p.col+"cc";ctx.lineWidth=0.6;ctx.stroke();
        ctx.fillStyle=p.col;ctx.font="7px serif";ctx.textAlign="center";ctx.fillText(p.label,x,y+2.5);ctx.textAlign="left";
      });
      ctx.beginPath();ctx.arc(cx,cy,5,0,Math.PI*2);ctx.fillStyle="#ffcc44";ctx.fill();
      ctx.fillStyle="rgba(201,168,76,0.3)"; ctx.font="9px 'DM Mono',monospace";
      ctx.fillText("SIX PLANET ALIGNMENT · ORBITAL RESONANCE · CONJUNCTIONS · AETHER",14,14);
      t++; rafRef.current=requestAnimationFrame(draw);
    };
    draw();
    return ()=>cancelAnimationFrame(rafRef.current);
  },[]);
  return <canvas ref={ref} style={{width:"100%",height:"auto",borderRadius:8,display:"block"}} />;
}

export default function SixPlanetAlignmentPage() {
  const skyRef = useRef<HTMLCanvasElement>(null);
  const waveRef = useRef<HTMLCanvasElement>(null);
  const [view, setView] = useState<View>("alignment");
  const [coherence, setCoherence] = useState(83.7);

  // Sky canvas
  useEffect(() => {
    const canvas = skyRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    let raf = 0, t = 0;

    function resize() {
      if (!canvas) return;
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
    }
    resize();
    window.addEventListener("resize", resize);

    function draw() {
      if (!canvas || !ctx) return;
      const W = canvas.width, H = canvas.height;
      ctx.clearRect(0, 0, W, H);
      // starfield
      for (let i = 0; i < 200; i++) {
        const x = (i * 137.5) % W;
        const y = (i * 97.3 + 123) % H;
        const br = ((i * 17) % 5) * 0.08 + 0.2;
        ctx.fillStyle = `rgba(255,255,255,${br})`;
        ctx.beginPath(); ctx.arc(x, y, 0.8, 0, Math.PI * 2); ctx.fill();
      }
      // horizon
      const horizonY = H * 0.75;
      ctx.strokeStyle = "rgba(0,229,200,0.3)";
      ctx.setLineDash([4, 8]);
      ctx.beginPath(); ctx.moveTo(0, horizonY); ctx.lineTo(W, horizonY); ctx.stroke();
      ctx.setLineDash([]);
      // arc
      const arcCY = horizonY + 50;
      const arcR = W * 0.8;
      ctx.strokeStyle = "rgba(255,209,102,0.2)";
      ctx.lineWidth = 2;
      ctx.beginPath(); ctx.arc(W / 2, arcCY, arcR, Math.PI * 0.85, Math.PI * 0.15, true); ctx.stroke();

      PLANETS.forEach((p, i) => {
        const a = Math.PI * (0.85 - p.x * 0.7);
        const x = W / 2 + Math.cos(a) * arcR;
        const y = arcCY + Math.sin(a) * arcR;
        const g = ctx.createRadialGradient(x, y, 0, x, y, p.size * 3);
        g.addColorStop(0, p.color + "60");
        g.addColorStop(0.5, p.color + "20");
        g.addColorStop(1, p.color + "00");
        ctx.fillStyle = g;
        ctx.beginPath(); ctx.arc(x, y, p.size * 3, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = p.color;
        ctx.beginPath(); ctx.arc(x, y, p.size, 0, Math.PI * 2); ctx.fill();
        if (p.name === "Saturn") {
          ctx.strokeStyle = p.color + "80"; ctx.lineWidth = 1;
          ctx.beginPath(); ctx.ellipse(x, y, p.size * 1.8, p.size * 0.6, 0, 0, Math.PI * 2); ctx.stroke();
        }
        ctx.fillStyle = "rgba(255,255,255,0.85)";
        ctx.font = "9px JetBrains Mono"; ctx.textAlign = "center";
        ctx.fillText(p.name.toUpperCase(), x, y - p.size - 12);
        ctx.fillStyle = "rgba(255,209,102,0.7)";
        ctx.font = "7px JetBrains Mono";
        ctx.fillText(`${p.angle}°`, x, y - p.size - 2);

        if (view === "resonance") {
          const next = PLANETS[i + 1];
          if (next) {
            const ratio = next.angle / p.angle;
            const close = Math.abs(ratio - PHI) < 0.1;
            ctx.strokeStyle = close ? "rgba(255,209,102,0.85)" : "rgba(0,229,200,0.3)";
            ctx.lineWidth = close ? 2 : 1;
            ctx.setLineDash(close ? [] : [2, 4]);
            const na = Math.PI * (0.85 - next.x * 0.7);
            const nx = W / 2 + Math.cos(na) * arcR;
            const ny = arcCY + Math.sin(na) * arcR;
            ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(nx, ny); ctx.stroke();
            ctx.setLineDash([]);
            if (close) {
              ctx.fillStyle = "rgba(255,209,102,0.95)";
              ctx.font = "10px serif"; ctx.textAlign = "center";
              ctx.fillText("φ", (x + nx) / 2, (y + ny) / 2);
            }
          }
        }
      });

      if (view === "dynamics") {
        ctx.save(); ctx.globalAlpha = 0.4;
        for (let ring = 0; ring < 3; ring++) {
          const radius = 100 + ring * 80;
          const cxR = W * 0.5, cyR = H * 0.4;
          for (let i = 0; i < 16; i++) {
            const a = (i / 16) * Math.PI * 2 + t * 0.01;
            const x1 = cxR + Math.cos(a) * radius;
            const y1 = cyR + Math.sin(a) * radius * 0.3;
            const na = ((i + 1) / 16) * Math.PI * 2 + t * 0.01;
            const x2 = cxR + Math.cos(na) * radius;
            const y2 = cyR + Math.sin(na) * radius * 0.3;
            const phase = Math.sin(t * 0.05 + ring) * 0.5 + 0.5;
            ctx.strokeStyle = `rgba(0,229,200,${0.3 * phase})`;
            ctx.lineWidth = 1;
            ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x2, y2); ctx.stroke();
          }
        }
        ctx.restore();
      }
    }

    function loop() { t++; draw(); raf = requestAnimationFrame(loop); }
    loop();
    return () => { cancelAnimationFrame(raf); window.removeEventListener("resize", resize); };
  }, [view]);

  // Wave canvas
  useEffect(() => {
    const canvas = waveRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    let raf = 0, t = 0;
    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;

    function draw() {
      if (!canvas || !ctx) return;
      const W = canvas.width, H = canvas.height;
      ctx.clearRect(0, 0, W, H);
      const waves = [
        { freq: 0.10, amp: 20, phase: t * 0.02, color: "rgba(0,229,200,0.6)" },
        { freq: 0.16, amp: 15, phase: t * 0.03, color: "rgba(255,209,102,0.5)" },
        { freq: 0.26, amp: 10, phase: t * 0.05, color: "rgba(123,79,255,0.4)" },
      ];
      waves.forEach(w => {
        ctx.strokeStyle = w.color; ctx.lineWidth = 1.5;
        ctx.beginPath();
        for (let x = 0; x < W; x += 2) {
          const y = H / 2 + Math.sin(x * w.freq + w.phase) * w.amp;
          x === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
        }
        ctx.stroke();
      });
    }

    function loop() { t++; draw(); raf = requestAnimationFrame(loop); }
    loop();
    return () => cancelAnimationFrame(raf);
  }, []);

  // Coherence ticker
  useEffect(() => {
    const id = setInterval(() => setCoherence(83.7 + Math.sin(Date.now() * 0.001) * 2.3), 200);
    return () => clearInterval(id);
  }, []);

  function exportData() {
    const data = {
      alignment: "March 2026 Six-Planet Arc",
      planets: PLANETS,
      phiRatios: PLANETS.map((p, i) => i === 0 ? null : ({
        planets: [PLANETS[i - 1].name, p.name],
        ratio: (p.angle / PLANETS[i - 1].angle).toFixed(3),
        phiMatch: Math.abs(p.angle / PLANETS[i - 1].angle - PHI) < 0.1,
      })).filter(Boolean),
      coherence: 0.837,
    };
    console.log("AETHER Planetary Alignment Data:", data);
    alert("Alignment data exported to console");
  }

  return (
    <div data-testid="six-planet-root" className="min-h-screen p-6"
         style={{ background: C.bg, color: C.text, fontFamily: "'JetBrains Mono', monospace" }}>
      <div style={{flexShrink:0,marginBottom:20}}>
        <div style={{display:"inline-block",border:"1px solid #c9a84c",padding:"4px 12px",fontSize:10,letterSpacing:"0.2em",color:"#c9a84c",fontFamily:"'DM Mono',monospace",marginBottom:12}}>LIVE SIMULATION</div>
        <div style={{background:"rgba(2,4,8,0.8)",borderLeft:"3px solid #c9a84c",borderRadius:4,overflow:"hidden"}}>
          <div style={{padding:"12px 16px 8px"}}><h2 style={{margin:0,fontSize:13,color:"#c9a84c",fontFamily:"'DM Mono',monospace",letterSpacing:"0.15em",fontWeight:400}}>SIX PLANET ALIGNMENT · ORBITAL RESONANCE · CONJUNCTIONS · AETHER</h2><p style={{margin:"4px 0 8px",fontSize:10,color:"rgba(201,168,76,0.5)",fontFamily:"'DM Mono',monospace",letterSpacing:"0.1em"}}>6 orbiting planets — the live AETHER six planet alignment simulation.</p></div>
          <SixPlanetAlignmentHeaderCanvas />
        </div>
      </div>

      <div className="border-b pb-5 mb-6" style={{ borderColor: C.border2 }}>
        <p className="text-[9px] tracking-[0.36em] uppercase mb-3" style={{ color: C.dim }}>
          AETHER · Six-Planet Alignment · March 2026 · Western Horizon
        </p>
        <h1 className="font-['Cinzel',serif] font-light leading-none tracking-tight" style={{ fontSize: "clamp(34px,4.8vw,58px)", color: C.white }}>
          Six-Planet <em style={{ color: C.gold, fontStyle: "italic" }}>Evening Arc</em>
        </h1>
        <p className="font-['Cinzel',serif] italic mt-2" style={{ fontSize: "clamp(13px,1.6vw,18px)", color: C.muted }}>
          Multi-scale phase-lock detected across quantum · biological · planetary
        </p>
      </div>

      <div className="grid gap-4" style={{ gridTemplateColumns: "300px 1fr 280px" }}>

        {/* LEFT: planet roster */}
        <div className="border p-4 space-y-3" style={{ borderColor: C.border2, background: C.panel }}>
          <p className="text-[8px] tracking-[0.3em] mb-2 pb-2 border-b" style={{ color: C.dim, borderColor: C.border }}>PLANETARY BODIES</p>
          {PLANETS.map(p => (
            <div key={p.name} data-testid={`planet-${p.name.toLowerCase()}`}
                 className="flex items-center gap-3 p-2"
                 style={{ background: "rgba(0,229,200,0.03)" }}>
              <span style={{
                width: 12, height: 12, borderRadius: 6,
                background: p.color, boxShadow: "0 0 8px " + p.color,
              }} />
              <div className="flex-1">
                <p className="text-[10px] tracking-[0.1em]" style={{ color: p.color }}>{p.name.toUpperCase()}</p>
                <p className="text-[8px]" style={{ color: C.muted }}>Angular {p.angle}° · Period {p.period}</p>
              </div>
            </div>
          ))}
          <div className="border p-3 mt-3" style={{ borderColor: "rgba(123,79,255,0.3)", background: "rgba(123,79,255,0.06)" }}>
            <p className="font-['Cinzel',serif] mb-2" style={{ color: C.purple, fontSize: 13 }}>Phi-Ratio Analysis</p>
            <p className="text-center" style={{ color: C.gold, fontFamily: "serif", fontSize: 16 }}>φ = 1.618034…</p>
            <p className="text-[8px] text-center mt-1" style={{ color: C.muted }}>Angular spacing follows Fibonacci quantization</p>
          </div>
        </div>

        {/* CENTER: sky canvas */}
        <div className="border relative" style={{ borderColor: C.border2, background: C.bg, minHeight: 540 }}>
          <canvas ref={skyRef} style={{ width: "100%", height: 540, display: "block" }} data-testid="sky-canvas" />
          <div className="absolute top-4 left-1/2 -translate-x-1/2 text-center pointer-events-none">
            <p className="font-['Cinzel',serif]" style={{ color: C.teal, fontSize: 22, textShadow: "0 0 20px rgba(0,229,200,0.6)" }}>Six-Planet Evening Arc</p>
            <p className="text-[10px] tracking-[0.22em] mt-1" style={{ color: C.gold }}>MARCH 2026 · WESTERN HORIZON</p>
          </div>
          <div className="absolute right-4 top-1/2 -translate-y-1/2 space-y-2 pointer-events-none">
            {[
              { col: C.purple, lbl: "QUANTUM" },
              { col: C.teal,   lbl: "BIOLOGICAL" },
              { col: C.gold,   lbl: "PLANETARY" },
            ].map(s => (
              <div key={s.lbl} className="flex items-center gap-2">
                <span className="rounded-full" style={{ width: 8, height: 8, background: s.col }} />
                <span className="text-[8px] tracking-[0.1em]" style={{ color: C.muted }}>{s.lbl}</span>
              </div>
            ))}
          </div>
        </div>

        {/* RIGHT: equation + coherence */}
        <div className="border p-4 space-y-3" style={{ borderColor: C.border2, background: C.panel }}>
          <p className="text-[8px] tracking-[0.3em] mb-2 pb-2 border-b" style={{ color: C.dim, borderColor: C.border }}>WAVE DYNAMICS</p>
          <div className="border p-3" style={{ borderColor: "rgba(255,209,102,0.3)", background: "rgba(255,209,102,0.06)" }}>
            <p className="text-[8px] tracking-[0.22em]" style={{ color: C.gold }}>SCALE-INVARIANT COUPLING</p>
            <p className="text-[18px] text-center mt-2" style={{ color: C.white, fontFamily: "serif" }}>∇²Ψ = k²φⁿΨ</p>
            <p className="text-[8px] mt-1 text-center" style={{ color: C.muted }}>φ = golden ratio resonance</p>
          </div>

          <p className="text-[8px] tracking-[0.3em] mt-3 pb-2 border-b" style={{ color: C.dim, borderColor: C.border }}>COHERENCE METRICS</p>
          {[
            { lbl: "QUANTUM FIELD COUPLING", v: 73, c: C.purple },
            { lbl: "BIOLOGICAL RESONANCE",   v: 85, c: C.teal },
            { lbl: "PLANETARY SYNCHRONY",    v: 92, c: C.gold },
          ].map(m => (
            <div key={m.lbl}>
              <p className="text-[8px] mb-1" style={{ color: C.muted }}>{m.lbl}</p>
              <div style={{ height: 4, background: "rgba(255,255,255,0.1)" }}>
                <div style={{ height: "100%", width: m.v + "%", background: m.c, transition: "width 1s ease" }} />
              </div>
            </div>
          ))}

          <p className="text-[8px] tracking-[0.3em] mt-3 pb-2 border-b" style={{ color: C.dim, borderColor: C.border }}>SYSTEM STATE</p>
          <p data-testid="coherence-readout" className="text-center font-['Cinzel',serif]" style={{ color: C.teal, fontSize: 18 }}>
            COHERENCE: {coherence.toFixed(1)}%
          </p>
          <p className="text-[8px] text-center" style={{ color: C.muted }}>Multi-scale phase-lock detected</p>
        </div>
      </div>

      {/* BOTTOM: waves + controls */}
      <div className="grid gap-4 mt-4" style={{ gridTemplateColumns: "1fr 1fr" }}>
        <div className="border p-3" style={{ borderColor: C.border2, background: C.panel }}>
          <p className="text-[8px] tracking-[0.3em] pb-2 border-b" style={{ color: C.dim, borderColor: C.border }}>FIBONACCI WAVE PATTERNS</p>
          <canvas ref={waveRef} style={{ width: "100%", height: 120, display: "block" }} data-testid="wave-canvas" />
        </div>

        <div className="border p-3" style={{ borderColor: C.border2, background: C.panel }}>
          <p className="text-[8px] tracking-[0.3em] pb-2 border-b mb-3" style={{ color: C.dim, borderColor: C.border }}>ANALYSIS CONTROLS</p>
          <div className="flex flex-wrap gap-2">
            {(["alignment","resonance","dynamics"] as View[]).map(v => (
              <button key={v} data-testid={`view-${v}`} onClick={() => setView(v)}
                className="px-3 py-1.5 text-[9px] tracking-[0.2em] uppercase border transition-colors"
                style={{
                  color: view === v ? C.bg : C.teal,
                  background: view === v ? C.teal : "transparent",
                  borderColor: C.teal,
                }}>{v}</button>
            ))}
            <button data-testid="export-btn" onClick={exportData}
              className="px-3 py-1.5 text-[9px] tracking-[0.2em] uppercase border"
              style={{ color: C.gold, borderColor: C.gold }}>EXPORT DATA</button>
          </div>
          <AnimatePresence mode="wait">
            <motion.p key={view} initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}}
              className="text-[10px] mt-3" style={{ color: C.muted }}>
              {view === "alignment" && "Plain alignment view — six planets along the western horizon arc with angular markers."}
              {view === "resonance" && "Inter-planetary angular ratios highlighted. Gold lines marked φ where ratio is within 0.1 of the golden ratio."}
              {view === "dynamics"  && "Toroidal field overlay — three nested rings rotating to visualize the centripetal/centrifugal cycle."}
            </motion.p>
          </AnimatePresence>
        </div>
      </div>

      <div className="mt-12 pt-4 border-t flex justify-between text-[8px] tracking-[0.16em] uppercase" style={{ borderColor: C.border, color: C.dim }}>
        <span>AETHER · Six-Planet Alignment · March 2026</span>
        <span style={{ fontFamily: "serif", fontSize: 14, color: C.gold, fontStyle: "italic" }}>∇²Ψ = k²φⁿΨ</span>
        <span>quantum · biological · planetary</span>
      </div>
    </div>
  );
}
