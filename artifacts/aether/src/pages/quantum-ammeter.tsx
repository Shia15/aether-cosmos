import { useEffect, useMemo, useRef, useState } from "react";

const KICKER: React.CSSProperties = { fontSize:11, letterSpacing:"0.32em", color:"#fbbf24",
  fontFamily:"'DM Mono',monospace", textTransform:"uppercase", marginBottom:6 };

function Section({ kicker, title, lead, children }: {
  kicker:string; title:string; lead?:string; children:React.ReactNode;
}) {
  return (
    <section style={{ marginBottom:"3rem" }}>
      <div style={KICKER}>{kicker}</div>
      <h2 style={{ fontSize:"1.5rem", fontWeight:700, color:"#fef3c7", margin:"0 0 0.55rem", letterSpacing:"-0.01em",
        fontFamily:"'Cinzel',serif" }}>{title}</h2>
      {lead && <p style={{ color:"#e5e7eb", fontSize:"0.93rem", lineHeight:1.65, maxWidth:820, margin:"0 0 1.2rem" }}>{lead}</p>}
      {children}
    </section>
  );
}

// ── Physics constants (rounded to plain numbers for the simulator)
const e_charge = 1.602e-19;          // C
const h_planck = 6.626e-34;          // J·s
const c_light  = 3.0e8;              // m/s

// Photon energy at λ = 550 nm (peak of solar spectrum at ground)
const lambda = 550e-9;
const E_photon = (h_planck * c_light) / lambda;   // ≈ 3.6e-19 J

// Solar constant at ground · clear day at noon
const G_max = 1000;                  // W/m²

// Sun-curve: half-sine over the daylight window (06:00 → 18:00)
function solarIrradiance(hour: number): number {
  if (hour <= 6 || hour >= 18) return 0;
  const t = (hour - 6) / 12;        // 0 → 1
  return G_max * Math.sin(Math.PI * t);
}

// Poisson sample (Knuth) — ok for our small-ish lambdas (we cap)
function poisson(lambda: number, rng: () => number): number {
  // for big lambda, normal approx (sqrt-N noise around mean)
  if (lambda > 80) {
    // Box-Muller
    const u1 = Math.max(rng(), 1e-9), u2 = rng();
    const z = Math.sqrt(-2*Math.log(u1)) * Math.cos(2*Math.PI*u2);
    return Math.max(0, Math.round(lambda + z * Math.sqrt(lambda)));
  }
  const L = Math.exp(-lambda);
  let k = 0, p = 1;
  while (true) { k++; p *= rng(); if (p <= L) return k - 1; }
}

function QuantumAmmeterHeaderCanvas() {
  const ref = useRef<HTMLCanvasElement>(null);
  const rafRef = useRef(0);
  useEffect(() => {
    const canvas = ref.current; if (!canvas) return;
    const ctx = canvas.getContext("2d")!;
    canvas.width = 900; canvas.height = 145;
    const W = canvas.width, H = canvas.height;
    let t=0;
    const samples: number[]=[];
    const draw=()=>{
      ctx.fillStyle="rgba(2,4,8,0.3)"; ctx.fillRect(0,0,W,H);
      const I=2+1.5*Math.sin(t*0.02)+Math.random()*0.6;
      samples.push(I); if(samples.length>120) samples.shift();
      const mean=samples.reduce((a,b)=>a+b,0)/samples.length;
      ctx.beginPath();
      samples.forEach((s,i)=>{
        const x=W-samples.length+i,y=H-20-s*12;
        i===0?ctx.moveTo(x,y):ctx.lineTo(x,y);
      });
      ctx.strokeStyle="rgba(201,168,76,0.6)";ctx.lineWidth=1;ctx.stroke();
      ctx.beginPath();ctx.moveTo(W-samples.length,H-20-mean*12);ctx.lineTo(W,H-20-mean*12);ctx.strokeStyle="rgba(46,240,216,0.3)";ctx.lineWidth=0.6;ctx.setLineDash([4,4]);ctx.stroke();ctx.setLineDash([]);
      ctx.fillStyle="rgba(201,168,76,0.8)";ctx.font="bold 10px 'DM Mono',monospace";ctx.fillText(I.toFixed(2)+" mA",W-80,H-8);
      ctx.fillStyle="rgba(201,168,76,0.3)"; ctx.font="9px 'DM Mono',monospace";
      ctx.fillText("QUANTUM AMMETER · PHOTOVOLTAIC · POISSON SAMPLING · SOLAR · AETHER",14,14);
      t++; rafRef.current=requestAnimationFrame(draw);
    };
    draw();
    return ()=>cancelAnimationFrame(rafRef.current);
  },[]);
  return <canvas ref={ref} style={{width:"100%",height:"auto",borderRadius:8,display:"block"}} />;
}

export default function QuantumAmmeterPage() {
  // Controls
  const [hour, setHour]       = useState(12);          // time of day
  const [area, setArea]       = useState(0.01);        // m² of panel · 100 cm²
  const [eta, setEta]         = useState(0.22);        // photovoltaic efficiency
  const [running, setRunning] = useState(true);
  const [windowMs, setWindowMs] = useState(60_000);    // strip chart length

  // Live readings
  const [readout, setReadout] = useState({
    irradiance: 0,        // W/m²
    photonRate: 0,        // photons/s hitting panel
    electronRate: 0,      // electrons/s liberated · = current/e
    current_mA: 0,        // mA (mean)
    sample_mA: 0,         // mA (with shot noise this tick)
    snr_dB: 0,
  });

  // Strip chart history
  type Sample = { t: number; mA: number; mean: number };
  const historyRef = useRef<Sample[]>([]);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const sunCanvasRef = useRef<HTMLCanvasElement>(null);

  // RAF loop
  useEffect(() => {
    if (!running) return;
    let raf = 0;
    let last = performance.now();
    const seedRng = () => Math.random;

    const tick = (now: number) => {
      const dt = Math.min(0.2, (now - last) / 1000);
      last = now;

      // Compute mean current at this hour
      const G = solarIrradiance(hour);                       // W/m²
      const power = G * area;                                // W reaching panel
      const photonRate = power / E_photon;                   // photons/s
      const electronRate = photonRate * eta;                 // e-/s
      const meanCurrent_A = electronRate * e_charge;         // A

      // Quantum shot noise: scale the integration window so we get a believable spread
      // Use a 1 ms integration · count = electronRate * 0.001
      const N_per_ms = electronRate * 1e-3;
      const sampled = poisson(N_per_ms, seedRng()) / 1e-3;   // back to e-/s
      const sample_A = sampled * e_charge;
      // Honest SNR: below 1 electron/ms the meter is quantum-floored — show 0 dB
      const snr = N_per_ms >= 1 ? 10 * Math.log10(N_per_ms) : 0;

      setReadout({
        irradiance: G,
        photonRate,
        electronRate,
        current_mA: meanCurrent_A * 1000,
        sample_mA: sample_A * 1000,
        snr_dB: snr,
      });

      // Push history (drop old)
      const t = now;
      historyRef.current.push({ t, mA: sample_A * 1000, mean: meanCurrent_A * 1000 });
      historyRef.current = historyRef.current.filter(s => t - s.t <= windowMs);

      // Draw strip chart
      const cv = canvasRef.current;
      if (cv) {
        const ctx = cv.getContext("2d")!;
        const w = cv.width, h = cv.height;
        ctx.clearRect(0,0,w,h);
        ctx.fillStyle = "#020617"; ctx.fillRect(0,0,w,h);
        // grid
        ctx.strokeStyle = "rgba(251,191,36,0.10)"; ctx.lineWidth = 1;
        for (let i = 1; i < 5; i++) {
          const y = (h * i) / 5;
          ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(w, y); ctx.stroke();
        }
        // Y range: 0 → 1.25 × max-ever-mean for nice headroom
        const maxMean = Math.max(0.001, ...historyRef.current.map(s => s.mean), meanCurrent_A * 1000);
        const yMax = maxMean * 1.4;
        const xOf = (sample: Sample) => w - ((t - sample.t) / windowMs) * w;
        const yOf = (v: number) => h - (v / yMax) * h;

        // Mean line
        ctx.strokeStyle = "rgba(251,191,36,0.55)"; ctx.lineWidth = 2; ctx.beginPath();
        historyRef.current.forEach((s, i) => {
          const x = xOf(s), y = yOf(s.mean);
          if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
        });
        ctx.stroke();

        // Sample (noisy) line
        ctx.strokeStyle = "#22d3ee"; ctx.lineWidth = 1.2; ctx.beginPath();
        historyRef.current.forEach((s, i) => {
          const x = xOf(s), y = yOf(s.mA);
          if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
        });
        ctx.stroke();

        // Y-axis labels
        ctx.fillStyle = "#94a3b8"; ctx.font = "10px DM Mono, monospace";
        ctx.fillText(yMax.toFixed(2) + " mA", 6, 12);
        ctx.fillText("0 mA", 6, h - 4);
        ctx.fillStyle = "#fbbf24";
        ctx.fillText("— mean", w - 110, 12);
        ctx.fillStyle = "#22d3ee";
        ctx.fillText("— quantum sample", w - 110, 26);
      }

      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [running, hour, area, eta, windowMs]);

  // Sun graphic
  useEffect(() => {
    const cv = sunCanvasRef.current; if (!cv) return;
    const ctx = cv.getContext("2d")!;
    const w = cv.width, h = cv.height;
    ctx.clearRect(0,0,w,h);
    // sky gradient by hour
    const G = solarIrradiance(hour) / G_max;         // 0 → 1
    const skyTop    = `rgba(${30 + 60*G}, ${30 + 80*G}, ${80 + 100*G}, 1)`;
    const skyBottom = `rgba(${10}, ${10 + 30*G}, ${30 + 60*G}, 1)`;
    const grad = ctx.createLinearGradient(0,0,0,h);
    grad.addColorStop(0, skyTop); grad.addColorStop(1, skyBottom);
    ctx.fillStyle = grad; ctx.fillRect(0,0,w,h);
    // ground
    ctx.fillStyle = "#1e1b4b"; ctx.fillRect(0, h*0.78, w, h*0.22);
    // Sun arc · 06 → 18
    const sunX = ((hour - 6) / 12) * w;
    const sunY = h * 0.7 - Math.sin(Math.PI * Math.max(0, Math.min(1, (hour-6)/12))) * h * 0.55;
    if (hour > 6 && hour < 18) {
      const sunR = 22 + 8 * G;
      // glow
      const glow = ctx.createRadialGradient(sunX, sunY, sunR*0.3, sunX, sunY, sunR*4);
      glow.addColorStop(0, `rgba(251,191,36,${0.45 + 0.4*G})`);
      glow.addColorStop(1, "rgba(251,191,36,0)");
      ctx.fillStyle = glow;
      ctx.fillRect(sunX - sunR*4, sunY - sunR*4, sunR*8, sunR*8);
      // disk
      ctx.fillStyle = "#fde68a";
      ctx.beginPath(); ctx.arc(sunX, sunY, sunR, 0, Math.PI*2); ctx.fill();
    } else {
      // moon
      ctx.fillStyle = "#cbd5e1";
      ctx.beginPath(); ctx.arc(w*0.8, h*0.25, 14, 0, Math.PI*2); ctx.fill();
    }
    // panel (tilted rect)
    const px = w*0.5, py = h*0.82;
    ctx.save(); ctx.translate(px, py); ctx.rotate(-0.25);
    ctx.fillStyle = "#1e293b"; ctx.fillRect(-50, -8, 100, 16);
    ctx.strokeStyle = "#22d3ee"; ctx.lineWidth = 1;
    for (let i = -50; i <= 50; i += 10) { ctx.beginPath(); ctx.moveTo(i,-8); ctx.lineTo(i,8); ctx.stroke(); }
    // photon arrows from sun to panel when sun up
    if (hour > 6 && hour < 18) {
      ctx.strokeStyle = `rgba(253,230,138,${0.35*G + 0.1})`; ctx.lineWidth = 1;
      for (let i = 0; i < 4; i++) {
        ctx.beginPath();
        ctx.moveTo(-30 + i*20, -60 - i*10); ctx.lineTo(-20 + i*20, -10);
        ctx.stroke();
      }
    }
    ctx.restore();
  }, [hour]);

  const hourLabel = useMemo(() => {
    const h = Math.floor(hour); const m = Math.round((hour - h) * 60);
    const ampm = h < 12 ? "AM" : "PM";
    const h12 = h === 0 ? 12 : (h > 12 ? h - 12 : h);
    return `${h12}:${m.toString().padStart(2,"0")} ${ampm}`;
  }, [hour]);

  return (
    <div data-testid="page-quantum-ammeter" style={{
      minHeight:"100vh", width:"100%",
      background:"radial-gradient(ellipse at top, #422006 0%, #1e1b4b 50%, #020617 100%)",
      color:"#fef3c7", fontFamily:"'Outfit', system-ui, sans-serif",
      padding:"0 0 5rem 0",
    }}>
      <div style={{flexShrink:0}}>
        <div style={{padding:"8px 24px"}}><div style={{display:"inline-block",border:"1px solid #c9a84c",padding:"4px 12px",fontSize:10,letterSpacing:"0.2em",color:"#c9a84c",fontFamily:"'DM Mono',monospace",marginBottom:16}}>LIVE SIMULATION</div></div>
        <div style={{margin:"0 24px 20px",background:"rgba(2,4,8,0.8)",borderLeft:"3px solid #c9a84c",borderRadius:4,overflow:"hidden"}}>
          <div style={{padding:"12px 16px 8px"}}><h2 style={{margin:0,fontSize:13,color:"#c9a84c",fontFamily:"'DM Mono',monospace",letterSpacing:"0.15em",fontWeight:400}}>QUANTUM AMMETER · PHOTOVOLTAIC · POISSON SAMPLING · SOLAR · AETHER</h2><p style={{margin:"4px 0 8px",fontSize:10,color:"rgba(201,168,76,0.5)",fontFamily:"'DM Mono',monospace",letterSpacing:"0.1em"}}>Live solar current strip chart — the AETHER quantum ammeter simulation.</p></div>
          <QuantumAmmeterHeaderCanvas />
        </div>
      </div>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@400;600;700&family=DM+Mono&family=Outfit:wght@400;600;700&display=swap');`}</style>

      <div style={{ maxWidth:1200, margin:"0 auto", padding:"0 1.5rem" }}>
        <header style={{
          padding:"2rem 1.6rem", borderRadius:18, marginBottom:"2rem",
          background:"linear-gradient(135deg, rgba(251,191,36,0.12), rgba(34,211,238,0.10))",
          border:"1px solid rgba(251,191,36,0.28)",
        }}>
          <div style={{ ...KICKER, fontSize:11, letterSpacing:"0.4em", marginBottom:8 }}>
            AETHER · Lab · Quantum Ammeter · runs on free sun power
          </div>
          <h1 style={{ fontSize:"clamp(1.8rem, 4vw, 2.6rem)", fontWeight:800, color:"#fef3c7",
            margin:"0 0 0.6rem", letterSpacing:"-0.02em", lineHeight:1.12,
            fontFamily:"'Cinzel',serif" }}>
            Quantum ammeter · solar prototype
          </h1>
          <p style={{ fontSize:"0.95rem", color:"#e5e7eb", lineHeight:1.65, maxWidth:820, margin:0 }}>
            A live simulation of an ammeter that runs entirely on free sun power. The sky drives a small photovoltaic
            panel; each photon liberates an electron with some efficiency; we measure the electron count per millisecond
            and convert to current. The "quantum" in the name is the visible √N <em>shot noise</em> on the trace —
            the irreducible fluctuation of a counted, granular signal.
          </p>
        </header>

        {/* I · Live sim */}
        <Section kicker="I · Live simulation"
          title="Sun · panel · circuit · meter"
          lead="Drag the time-of-day slider to move the sun across the sky. The mean current (amber) is the deterministic E·η·G calculation; the cyan trace is what the meter actually reads after 1-ms quantum sampling.">
          <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit, minmax(min(100%, 320px), 1fr))",
            gap:"0.9rem", marginBottom:"1rem" }}>
            <div style={{ padding:"0.8rem", borderRadius:12,
              background:"rgba(15,23,42,0.7)", border:"1px solid rgba(251,191,36,0.25)" }}>
              <canvas ref={sunCanvasRef} width={520} height={220}
                data-testid="canvas-sun"
                style={{ width:"100%", height:"auto", borderRadius:8, display:"block" }}/>
              <div style={{ marginTop:8, fontSize:"0.78rem", color:"#fbbf24",
                fontFamily:"'DM Mono',monospace", letterSpacing:"0.1em",
                textTransform:"uppercase", textAlign:"center" }}>
                Sky · time {hourLabel} · irradiance {readout.irradiance.toFixed(0)} W/m²
              </div>
            </div>
            <div style={{ padding:"0.8rem", borderRadius:12,
              background:"rgba(15,23,42,0.7)", border:"1px solid rgba(34,211,238,0.25)" }}>
              <canvas ref={canvasRef} width={520} height={220}
                data-testid="canvas-strip"
                style={{ width:"100%", height:"auto", borderRadius:8, display:"block" }}/>
              <div style={{ marginTop:8, fontSize:"0.78rem", color:"#22d3ee",
                fontFamily:"'DM Mono',monospace", letterSpacing:"0.1em",
                textTransform:"uppercase", textAlign:"center" }}>
                Strip chart · last {windowMs/1000}s · cyan = quantum sample · amber = mean
              </div>
            </div>
          </div>

          {/* Readouts */}
          <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit, minmax(min(100%, 160px), 1fr))",
            gap:"0.5rem", marginBottom:"1rem" }}>
            {[
              { l:"Sample (now)", v:readout.sample_mA.toFixed(4) + " mA", c:"#22d3ee" },
              { l:"Mean current", v:readout.current_mA.toFixed(4) + " mA", c:"#fbbf24" },
              { l:"Photon rate",  v:(readout.photonRate/1e15).toFixed(2) + " ×10¹⁵ /s", c:"#fde68a" },
              { l:"Electron rate",v:(readout.electronRate/1e15).toFixed(2) + " ×10¹⁵ /s", c:"#a78bfa" },
              { l:"Shot SNR",     v:readout.snr_dB.toFixed(1) + " dB", c:"#34d399" },
            ].map(r => (
              <div key={r.l} style={{ padding:"0.75rem 0.85rem", borderRadius:8,
                background:"rgba(15,23,42,0.7)", border:`1px solid ${r.c}30` }}>
                <div style={{ ...KICKER, color:r.c, marginBottom:4, fontSize:9 }}>{r.l}</div>
                <div style={{ fontFamily:"'DM Mono',monospace", color:"#fef3c7",
                  fontSize:"1rem", letterSpacing:"0.04em" }}>{r.v}</div>
              </div>
            ))}
          </div>

          {/* Controls */}
          <div style={{ padding:"1rem 1.2rem", borderRadius:10,
            background:"rgba(15,23,42,0.6)", border:"1px solid rgba(255,255,255,0.06)" }}>
            <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit, minmax(min(100%, 240px), 1fr))",
              gap:"0.8rem 1.4rem" }}>
              <label style={{ display:"block" }}>
                <div style={{ ...KICKER, marginBottom:6 }}>Time of day · {hourLabel}</div>
                <input type="range" min={0} max={24} step={0.1} value={hour}
                  onChange={(e) => setHour(parseFloat(e.target.value))}
                  data-testid="slider-hour" style={{ width:"100%" }}/>
              </label>
              <label style={{ display:"block" }}>
                <div style={{ ...KICKER, marginBottom:6 }}>Panel area · {(area*10000).toFixed(0)} cm²</div>
                <input type="range" min={0.001} max={0.1} step={0.001} value={area}
                  onChange={(e) => setArea(parseFloat(e.target.value))}
                  data-testid="slider-area" style={{ width:"100%" }}/>
              </label>
              <label style={{ display:"block" }}>
                <div style={{ ...KICKER, marginBottom:6 }}>Efficiency η · {(eta*100).toFixed(0)}%</div>
                <input type="range" min={0.05} max={0.45} step={0.01} value={eta}
                  onChange={(e) => setEta(parseFloat(e.target.value))}
                  data-testid="slider-eta" style={{ width:"100%" }}/>
              </label>
              <label style={{ display:"block" }}>
                <div style={{ ...KICKER, marginBottom:6 }}>Window · {windowMs/1000}s</div>
                <input type="range" min={10000} max={120000} step={5000} value={windowMs}
                  onChange={(e) => setWindowMs(parseInt(e.target.value))}
                  data-testid="slider-window" style={{ width:"100%" }}/>
              </label>
            </div>
            <div style={{ marginTop:14, display:"flex", gap:8, flexWrap:"wrap" }}>
              <button onClick={() => setRunning(r => !r)} data-testid="btn-toggle-run"
                style={{ padding:"0.5rem 1rem", borderRadius:6, cursor:"pointer",
                  background: running ? "rgba(34,211,238,0.18)" : "rgba(251,191,36,0.18)",
                  border:`1px solid ${running ? "#22d3ee" : "#fbbf24"}66`,
                  color:"#fef3c7", fontSize:"0.78rem", fontFamily:"'DM Mono',monospace",
                  letterSpacing:"0.1em", textTransform:"uppercase",
                }}>{running ? "❚❚ Pause" : "▸ Resume"}</button>
              {[
                ["06:00", 6], ["09:00", 9], ["12:00", 12], ["15:00", 15], ["18:00", 18], ["21:00", 21],
              ].map(([lbl, h]) => (
                <button key={lbl as string} onClick={() => setHour(h as number)}
                  data-testid={`btn-time-${lbl}`}
                  style={{ padding:"0.5rem 0.85rem", borderRadius:6, cursor:"pointer",
                    background:"rgba(15,23,42,0.7)", border:"1px solid rgba(251,191,36,0.3)",
                    color:"#fbbf24", fontSize:"0.78rem", fontFamily:"'DM Mono',monospace",
                    letterSpacing:"0.1em",
                  }}>{lbl as string}</button>
              ))}
            </div>
          </div>
        </Section>

        {/* II · The math */}
        <Section kicker="II · The math · in plain words" title="Three equations · zero magic"
          lead="The simulator above runs these in real time. There is nothing in the readout that does not come from these three lines.">
          <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit, minmax(min(100%, 280px), 1fr))", gap:"0.6rem" }}>
            {[
              { t:"Photon energy",   eq:"E = h · c / λ",
                d:"At λ = 550 nm (peak of solar spectrum at ground), each photon carries about 3.6 × 10⁻¹⁹ joules. h is Planck's constant, c is the speed of light." },
              { t:"Photon arrival rate", eq:"N = G · A / E",
                d:"G is the solar irradiance reaching the panel (W/m² · driven by time of day), A is the panel area, E is the photon energy. N is photons per second hitting the panel." },
              { t:"Current",         eq:"I = η · N · e",
                d:"η is the photovoltaic efficiency (fraction of photons that liberate an electron in the external circuit). e is the elementary charge. I = η × N × e gives the mean current in amps." },
              { t:"Shot noise",      eq:"σ_N = √N  ·  SNR ≈ 10·log₁₀(N)",
                d:"Because electrons arrive one at a time, the count over any short window has a √N spread. The cyan trace is exactly this — and it's the 'quantum' in 'quantum ammeter.'" },
            ].map(c => (
              <div key={c.t} style={{ padding:"1rem 1.15rem", borderRadius:10,
                background:"rgba(15,23,42,0.65)",
                border:"1px solid rgba(251,191,36,0.25)", borderLeft:"3px solid #fbbf24" }}>
                <div style={{ fontSize:"0.95rem", fontWeight:700, color:"#fef3c7", marginBottom:5 }}>{c.t}</div>
                <div style={{ fontFamily:"'DM Mono',monospace", color:"#fbbf24",
                  fontSize:"0.95rem", marginBottom:8, padding:"0.4rem 0.6rem", borderRadius:6,
                  background:"rgba(251,191,36,0.08)" }}>{c.eq}</div>
                <div style={{ fontSize:"0.84rem", color:"#e5e7eb", lineHeight:1.55 }}>{c.d}</div>
              </div>
            ))}
          </div>
        </Section>

        {/* III · Why "free sun power" */}
        <Section kicker="III · Free sun power · the principle"
          title="No battery · no grid · no fuel"
          lead="The whole instrument runs on what arrives at the panel for free, every clear day. Five design choices follow from that constraint.">
          <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit, minmax(min(100%, 240px), 1fr))", gap:"0.55rem" }}>
            {[
              { t:"Cold-start tolerant", d:"The meter must boot from zero stored energy. No supercapacitor, no coin cell. The first photon of the morning must be enough to begin counting." },
              { t:"Sub-microwatt budget", d:"The readout, the timer, and the comparator together must consume less than the panel produces at dawn. Every µA of leakage is a design defect." },
              { t:"Adaptive integration", d:"At noon we count electrons in microseconds; at dusk we integrate over seconds. The window is a state variable, not a constant." },
              { t:"Honest about noise",  d:"At low light shot noise dominates. The display should show ± uncertainty, not pretend to a precision the sun isn't delivering." },
              { t:"Diurnal narrative",   d:"The whole-day curve is the meter's primary output. A single instantaneous reading is less informative than the dawn-to-dusk sweep." },
            ].map(c => (
              <div key={c.t} style={{ padding:"0.85rem 1rem", borderRadius:10,
                background:"rgba(15,23,42,0.65)",
                border:"1px solid rgba(34,211,238,0.25)", borderLeft:"3px solid #22d3ee" }}>
                <div style={{ fontSize:"0.95rem", fontWeight:700, color:"#67e8f9", marginBottom:5 }}>{c.t}</div>
                <div style={{ fontSize:"0.82rem", color:"#e5e7eb", lineHeight:1.55 }}>{c.d}</div>
              </div>
            ))}
          </div>
        </Section>

        {/* IV · Bill of materials · for a real one */}
        <Section kicker="IV · Bill of materials"
          title="If you wanted to build this in hardware"
          lead="A ~$25 path to a real solar quantum ammeter. None of these are speculative parts.">
          <div style={{ display:"grid", gap:"0.5rem" }}>
            {[
              { p:"Photovoltaic panel",  s:"Voltaic 0.5 W · 6 V · 80×80 mm",          n:"$8 · the energy source · also the sensor", c:"#fbbf24" },
              { p:"Charge integrator",   s:"Texas Instruments LMC6042 · CMOS op-amp", n:"$2 · sub-µA quiescent · femtoamp inputs", c:"#22d3ee" },
              { p:"Counter / comparator",s:"TI MSP430FR2433 · ultra-low-power MCU",   n:"$3 · runs on the panel directly · FRAM memory", c:"#a78bfa" },
              { p:"E-paper display",     s:"Pervasive Displays 1.54\" segment",        n:"$6 · holds the reading with zero standby power", c:"#fef3c7" },
              { p:"Reference resistor",  s:"Vishay 1 GΩ · 0.1% · low-tempco",          n:"$2 · the V→I conversion · pick once, pick well", c:"#34d399" },
              { p:"Enclosure · wires",   s:"Anodized aluminum case · fluoropolymer wire", n:"$4 · low triboelectric noise · weatherproof", c:"#cbd5e1" },
            ].map((b,i) => (
              <div key={i} style={{ display:"grid", gridTemplateColumns:"180px 1fr 1fr",
                gap:"0.85rem", padding:"0.7rem 1rem", borderRadius:10,
                background:"rgba(15,23,42,0.65)",
                border:`1px solid ${b.c}30`, borderLeft:`3px solid ${b.c}` }}>
                <div style={{ fontSize:"0.88rem", color:b.c, fontWeight:700,
                  fontFamily:"'Cinzel',serif" }}>{b.p}</div>
                <div style={{ fontSize:"0.82rem", color:"#fef3c7", fontFamily:"'DM Mono',monospace" }}>{b.s}</div>
                <div style={{ fontSize:"0.82rem", color:"#cbd5e1", lineHeight:1.5 }}>{b.n}</div>
              </div>
            ))}
          </div>
        </Section>

        <footer style={{ marginTop:"2rem", paddingTop:"1.4rem",
          borderTop:"1px solid rgba(251,191,36,0.18)",
          textAlign:"center", fontSize:"0.78rem", color:"#fbbf24",
          fontFamily:"'DM Mono',monospace", letterSpacing:"0.2em", textTransform:"uppercase" }}>
          AETHER · Lab · Quantum Ammeter · I = η · N · e · powered by photons since the Sun was new
        </footer>
      </div>
    </div>
  );
}
