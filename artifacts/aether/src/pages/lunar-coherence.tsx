import { useEffect, useMemo, useRef, useState } from "react";

const KICKER: React.CSSProperties = { fontSize:11, letterSpacing:"0.32em", color:"#a78bfa",
  fontFamily:"'DM Mono',monospace", textTransform:"uppercase", marginBottom:6 };

function Section({ kicker, title, lead, children }: {
  kicker:string; title:string; lead?:string; children:React.ReactNode;
}) {
  return (
    <section style={{ marginBottom:"3rem" }}>
      <div style={KICKER}>{kicker}</div>
      <h2 style={{ fontSize:"1.7rem", fontWeight:700, color:"#f1f5f9", margin:"0 0 0.55rem", letterSpacing:"-0.01em" }}>{title}</h2>
      {lead && <p style={{ color:"#cbd5e1", fontSize:"0.97rem", lineHeight:1.65, maxWidth:820, margin:"0 0 1.2rem" }}>{lead}</p>}
      {children}
    </section>
  );
}

function Card({ children, title, kicker, accent="#a78bfa" }: {
  children:React.ReactNode; title?:string; kicker?:string; accent?:string;
}) {
  return (
    <div style={{
      padding:"1.1rem 1.25rem", borderRadius:12,
      background:"rgba(15,23,42,0.65)",
      border:"1px solid rgba(255,255,255,0.08)",
      borderLeft:`3px solid ${accent}`,
    }}>
      {kicker && <div style={{ ...KICKER, color:accent, marginBottom:4 }}>{kicker}</div>}
      {title && <div style={{ fontSize:"1rem", fontWeight:700, color:"#f1f5f9", marginBottom:6 }}>{title}</div>}
      <div style={{ fontSize:"0.88rem", color:"#cbd5e1", lineHeight:1.6 }}>{children}</div>
    </div>
  );
}

// ── Live lunar-tide sim: moon orbits, Earth groundwater bulges align with moon
function LunarTideSim() {
  const [running, setRunning] = useState(true);
  const [phase, setPhase] = useState(0); // 0..2π
  const [hours, setHours] = useState(0);
  const [showAmbient, setShowAmbient] = useState(true);
  const runningRef = useRef(running);
  const lastRef = useRef<number | null>(null);
  const rafRef = useRef<number | null>(null);

  useEffect(() => { runningRef.current = running; }, [running]);
  useEffect(() => {
    const tick = (now: number) => {
      if (lastRef.current === null) lastRef.current = now;
      const dt = (now - lastRef.current) / 1000;
      lastRef.current = now;
      if (runningRef.current) {
        // 1 real second = 1 hour of lunar progression; full lunar day = 24.84 h
        setHours(h => (h + dt) % 24.84);
        setPhase(p => (p + (dt / 24.84) * Math.PI * 2) % (Math.PI * 2));
      }
      rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => { if (rafRef.current !== null) cancelAnimationFrame(rafRef.current); };
  }, []);

  // Moon position
  const earthR = 38;
  const orbitR = 130;
  const mx = Math.cos(phase) * orbitR;
  const my = Math.sin(phase) * orbitR;

  // Tide bulge amplitude (rises facing moon AND opposite — semidiurnal)
  // Local tide at angle θ around earth: cos(2 * (θ - phase))
  const bulgePts = useMemo(() => {
    const N = 64;
    const pts: string[] = [];
    for (let i = 0; i <= N; i++) {
      const θ = (i / N) * Math.PI * 2;
      const tide = Math.cos(2 * (θ - phase)); // -1..1
      const r = earthR + 4 + tide * 5.5;
      const x = Math.cos(θ) * r;
      const y = Math.sin(θ) * r;
      pts.push(`${x.toFixed(2)},${y.toFixed(2)}`);
    }
    return pts.join(" ");
  }, [phase]);

  // Tide value at user-chosen reference point (treat as θ=0, i.e. equator-noon)
  const tideAt0 = Math.cos(2 * (0 - phase));      // -1..1
  const ambientAt0 = 0.5 + tideAt0 * 0.4;         // 0.1..0.9 normalized

  return (
    <div style={{
      padding:"1.4rem", borderRadius:16,
      background:"rgba(7,10,20,0.7)",
      border:"1px solid rgba(167,139,250,0.18)",
    }}>
      <div style={{ display:"flex", flexWrap:"wrap", alignItems:"center", gap:14, marginBottom:"1.2rem" }}>
        <div style={{ flex:"1 1 200px" }}>
          <div style={KICKER}>Lunar Hour</div>
          <div style={{ fontSize:"1.45rem", color:"#f1f5f9", fontFamily:"'Cinzel',serif" }}>
            {hours.toFixed(1)} <span style={{ fontSize:"0.85rem", color:"#94a3b8" }}>/ 24.84 h (1 lunar day)</span>
          </div>
        </div>
        <button onClick={() => setRunning(r => !r)} data-testid="btn-tide-toggle" style={btn(running ? "#22c55e" : "#a78bfa")}>
          {running ? "⏸ Pause" : "▶ Resume"}
        </button>
        <button onClick={() => setShowAmbient(s => !s)} data-testid="btn-ambient-toggle" style={btn(showAmbient ? "#38bdf8" : "#94a3b8")}>
          {showAmbient ? "◉ Ambient field on" : "◯ Ambient field off"}
        </button>
      </div>

      <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit, minmax(min(100%, 320px), 1fr))", gap:"1rem" }}>
        {/* Earth + Moon + tide bulge */}
        <div style={{ background:"#000", borderRadius:10, padding:"0.5rem", border:"1px solid rgba(255,255,255,0.05)" }}>
          <div style={{ ...KICKER, marginBottom:6 }}>Tide envelope · Earth · Moon</div>
          <svg viewBox="-180 -180 360 360" style={{ width:"100%", maxHeight:340, display:"block" }}>
            {/* moon orbit */}
            <circle cx="0" cy="0" r={orbitR} fill="none" stroke="rgba(167,139,250,0.18)" strokeDasharray="3 4"/>
            {/* tide envelope (groundwater + ambient field bulge) */}
            <polygon points={bulgePts} fill="rgba(56,189,248,0.18)" stroke="rgba(56,189,248,0.6)" strokeWidth="1"/>
            {/* Earth */}
            <circle cx="0" cy="0" r={earthR} fill="url(#earthG)" stroke="rgba(167,139,250,0.4)"/>
            {/* equator dot at θ=0 (reference observer) */}
            <circle cx={earthR + 1} cy="0" r="2.5" fill="#facc15"/>
            <text x={earthR + 8} y="2" fill="#facc15" fontSize="9" fontFamily="DM Mono,monospace">obs</text>
            {/* Moon */}
            <circle cx={mx} cy={my} r="9" fill="#e2e8f0" stroke="rgba(255,255,255,0.6)"/>
            <line x1="0" y1="0" x2={mx} y2={my} stroke="rgba(255,255,255,0.18)" strokeDasharray="2 3"/>
            <defs>
              <radialGradient id="earthG" cx="0.3" cy="0.3" r="0.8">
                <stop offset="0%" stopColor="#3b82f6"/><stop offset="60%" stopColor="#1e40af"/><stop offset="100%" stopColor="#0f172a"/>
              </radialGradient>
            </defs>
          </svg>
        </div>

        {/* Numeric readouts */}
        <div style={{ display:"grid", gap:"0.7rem", alignContent:"start" }}>
          <Card kicker="Tide bulge @ obs" title={`${(tideAt0 * 100).toFixed(1)} %`} accent="#38bdf8">
            Cos(2·(θ−lunar phase)) — semidiurnal envelope. Two highs and two lows per lunar day.
          </Card>
          {showAmbient && (
            <Card kicker="Ambient field strength" title={`${(ambientAt0 * 100).toFixed(1)} %`} accent="#a78bfa">
              Local gravitational + electromagnetic ambient field, normalized 0–100. Tracks the tide envelope but with a small
              groundwater-mediated lag (not modelled here).
            </Card>
          )}
          <Card kicker="Phase relation" accent="#facc15">
            Moon at azimuth {(phase * 180 / Math.PI).toFixed(0)}°. The bulge maximum sits along the Earth–Moon line (and on the
            opposite side) — your local "high tide" arrives twice per lunar day, ~12h25m apart.
          </Card>
        </div>
      </div>

      <div style={{ marginTop:"1rem", fontSize:"0.82rem", color:"#94a3b8", lineHeight:1.55 }}>
        Sim time scale: 1 real second ≈ 1 lunar hour. Tide envelope shown is the gravitational equilibrium tide, ignoring continental
        coastline interference. AETHER's working hypothesis: groundwater and intracellular fluid follow the same envelope at much
        smaller amplitude — a continuous, sub-perceptual lunar pulse threaded through every body of water on Earth, including the
        ones inside us.
      </div>
    </div>
  );
}

const btn = (col: string): React.CSSProperties => ({
  padding:"0.55rem 0.95rem", borderRadius:8,
  background:`${col}1f`, border:`1px solid ${col}55`,
  color:"#f1f5f9", fontSize:"0.85rem", fontFamily:"'DM Mono',monospace",
  letterSpacing:1.5, textTransform:"uppercase", cursor:"pointer",
});

function LunarCoherenceCanvas() {
  const ref = useRef<HTMLCanvasElement>(null);
  const rafRef = useRef(0);
  useEffect(() => {
    const canvas = ref.current; if (!canvas) return;
    const ctx = canvas.getContext("2d")!;
    canvas.width = 900; canvas.height = 145;
    const W = canvas.width, H = canvas.height;
    const cx=W*0.15,cy=H*0.5;
    const earthCx=W*0.5,earthCy=H*0.5;
    let t=0;
    const draw=()=>{
      ctx.fillStyle="rgba(2,4,16,0.3)"; ctx.fillRect(0,0,W,H);
      const tide=Math.sin(t*0.015);
      for(let i=0;i<5;i++){
        const yr=earthCy+tide*(12+i*8);
        const alpha=0.04+0.06*Math.abs(tide);
        ctx.beginPath();
        for(let px=0;px<W;px++){
          const y=yr+Math.sin(px*0.02+t*0.02)*6;
          px===0?ctx.moveTo(px,y):ctx.lineTo(px,y);
        }
        ctx.strokeStyle=`rgba(167,139,250,${alpha})`; ctx.lineWidth=0.8; ctx.stroke();
      }
      const moonAngle=t*0.008;
      const moonX=earthCx+80*Math.cos(moonAngle),moonY=earthCy+40*Math.sin(moonAngle);
      ctx.beginPath();ctx.arc(earthCx,earthCy,14,0,Math.PI*2);ctx.fillStyle="rgba(30,100,220,0.6)";ctx.fill();
      ctx.beginPath();ctx.arc(moonX,moonY,7,0,Math.PI*2);ctx.fillStyle="rgba(220,220,200,0.85)";ctx.fill();
      ctx.beginPath();ctx.moveTo(earthCx,earthCy);ctx.lineTo(moonX,moonY);ctx.strokeStyle="rgba(167,139,250,0.15)";ctx.lineWidth=0.5;ctx.stroke();
      ctx.fillStyle="rgba(167,139,250,0.3)"; ctx.font="9px 'DM Mono',monospace";
      ctx.fillText("LUNAR COHERENCE · TIDE ENVELOPE · MOON CYCLE · GRAVITATIONAL COUPLING · AETHER",14,14);
      t++; rafRef.current=requestAnimationFrame(draw);
    };
    draw();
    return ()=>cancelAnimationFrame(rafRef.current);
  },[]);
  return <canvas ref={ref} style={{width:"100%",height:"auto",borderRadius:8,display:"block"}} />;
}

export default function LunarCoherencePage() {
  return (
    <div data-testid="page-lunar-coherence" style={{
      minHeight:"100vh", width:"100%",
      background:"radial-gradient(ellipse at top, #0f172a 0%, #020617 55%, #000 100%)",
      color:"#e2e8f0", fontFamily:"'Outfit', system-ui, sans-serif",
      padding:"3rem 1.5rem 5rem",
    }}>
      <div style={{flexShrink:0,marginBottom:20}}>
        <div style={{display:"inline-block",border:"1px solid #a78bfa",padding:"4px 12px",fontSize:10,letterSpacing:"0.2em",color:"#a78bfa",fontFamily:"'DM Mono',monospace",marginBottom:12}}>LIVE SIMULATION</div>
        <div style={{background:"rgba(2,4,16,0.8)",borderLeft:"3px solid #a78bfa",borderRadius:4,overflow:"hidden"}}>
          <div style={{padding:"12px 16px 8px"}}><h2 style={{margin:0,fontSize:13,color:"#a78bfa",fontFamily:"'DM Mono',monospace",letterSpacing:"0.15em",fontWeight:400}}>LUNAR COHERENCE · TIDE ENVELOPE · MOON CYCLE · AETHER</h2><p style={{margin:"4px 0 8px",fontSize:10,color:"rgba(167,139,250,0.5)",fontFamily:"'DM Mono',monospace",letterSpacing:"0.1em"}}>Earth–Moon orbit with 5 tidal sine bands — the live AETHER lunar coherence simulation.</p></div>
          <LunarCoherenceCanvas />
        </div>
      </div>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@400;600;700&family=DM+Mono&family=Outfit:wght@400;600;700&display=swap');`}</style>

      <div style={{ maxWidth:1200, margin:"0 auto" }}>
        {/* Masthead */}
        <header style={{
          padding:"2rem 1.8rem", borderRadius:18, marginBottom:"2rem",
          background:"linear-gradient(135deg, rgba(167,139,250,0.10), rgba(56,189,248,0.10))",
          border:"1px solid rgba(167,139,250,0.25)",
        }}>
          <div style={{ ...KICKER, fontSize:11, letterSpacing:"0.4em", marginBottom:10 }}>AETHER · Lunar Coherence</div>
          <h1 style={{ fontSize:"clamp(1.9rem, 4.4vw, 2.9rem)", fontWeight:800, color:"#f1f5f9",
            margin:"0 0 0.6rem", letterSpacing:"-0.02em", lineHeight:1.12 }}>
            Lunar Tides · Groundwater · Ambient-Field Modulation
          </h1>
          <p style={{ fontSize:"1rem", color:"#cbd5e1", lineHeight:1.7, maxWidth:820, margin:0 }}>
            Gravity changes in the ambient field follow lunar tides — and not only in the oceans. Groundwater, intracellular fluid
            and the electrostatic dust column all carry a sub-perceptual lunar signature. This page collects the field-notes,
            the live envelope sim, and the orbital-resonance hypothesis from the Stephan Burns notebook.
          </p>
        </header>

        {/* I · Live tide sim */}
        <Section kicker="I · Live envelope" title="Tide bulge follows the moon — including the bulge inside you"
          lead="Press Run; watch the semidiurnal envelope sweep around Earth. The yellow dot is a local observer; the readouts on the right are the local tide and the local ambient-field strength.">
          <LunarTideSim/>
        </Section>

        {/* II · Mechanism cards */}
        <Section kicker="II · Mechanism" title="Three coupled pathways, one envelope">
          <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit, minmax(min(100%, 260px), 1fr))", gap:"0.9rem" }}>
            <Card kicker="Gravitational" title="Equilibrium tide" accent="#38bdf8">
              The Moon's tidal force scales as 2GMm/d³ · r. On a free water column it produces ±0.5 m on the open ocean. On a
              human body (~70 kg, ~1.7 m tall) the absolute force is tiny — but the <em>direction</em> rotates with the moon, every day, every life.
            </Card>
            <Card kicker="Groundwater" title="Solid-earth tide + aquifer modulation" accent="#a78bfa">
              The crust itself rises and falls ~30 cm twice a day. Groundwater pressure modulates with it; well-water levels show
              a clean lunar signal. The body — ~60 % water, much of it interstitial — sits inside the same pressure envelope.
            </Card>
            <Card kicker="Electrostatic" title="Dust column · ionospheric coupling" accent="#facc15">
              Stephan Burns (1/9 · 8:58 AM): "electro-static dust clouds in orbital resonance points with the moon · nanometer
              scale, pack shem · interstellar dust force." Schumann-resonance background and ionospheric tides ride the same
              24h/24.84h beat.
            </Card>
          </div>
        </Section>

        {/* III · Stephan Burns notebook */}
        <Section kicker="III · Source · Stephan Burns notebook · Jan 9 · 8:58 AM"
          title="Reclaim Identity · Program · System Thinking only"
          lead="Hand-written field-note threading orbital-resonance dust, lunar nanopacking, Robert Temple's 'new science in heaven', and Jupiter ionization-to-plasma. AETHER reads it as the orbital-resonance lemma for the tide-in-everything hypothesis above.">
        </Section>

        {/* IV · Consciousness implication */}
        <Section kicker="IV · Working hypothesis"
          title="Lunar orientation tides — from within the groundwater — affect us at the energetic and conscious level"
          lead="Field-note (12/9/2025 · 1:31 AM): 'unambiguous presence of a lunar orientation tides from within the groundwater affect us energetically and conscious level arises.' This is the operational claim AETHER tracks.">
          <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit, minmax(min(100%, 280px), 1fr))", gap:"0.9rem" }}>
            <Card kicker="What we expect" title="Sub-perceptual baseline" accent="#22c55e">
              A continuous ~24.84 h envelope on cell-fluid pressure, EEG band power and dream-state recall. Not a "full-moon
              effect" — a continuous lunar-day signature most people never notice.
            </Card>
            <Card kicker="What we'd measure" title="Three signal channels" accent="#38bdf8">
              (1) Heart-rate variability low-frequency band vs lunar phase. (2) Self-reported clarity / agitation across a lunar
              day. (3) Local barometric + groundwater + Schumann coherence — does the envelope tighten at certain phases?
            </Card>
            <Card kicker="What it means" title="Body as antenna" accent="#a78bfa">
              If the body really does ride the same envelope, then "centring" practices (breath, dawn light, grounding) are
              partly a re-tuning to the local lunar phase. The Atlas Tracker is built to surface that phase in real time.
            </Card>
          </div>
        </Section>

        <footer style={{ marginTop:"2rem", paddingTop:"1.4rem",
          borderTop:"1px solid rgba(255,255,255,0.08)",
          textAlign:"center", fontSize:"0.78rem", color:"#64748b",
          fontFamily:"'DM Mono',monospace", letterSpacing:"0.2em", textTransform:"uppercase" }}>
          24.84 h lunar day · semidiurnal envelope · groundwater carries the signal · the body is mostly water
        </footer>
      </div>
    </div>
  );
}
