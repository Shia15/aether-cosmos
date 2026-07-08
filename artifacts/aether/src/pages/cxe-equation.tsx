import { useState, useRef, useEffect } from "react";

// ─── Color tokens ─────────────────────────────────────────────────────────────
const V = {
  void: "#020408",
  aurora: "#00FFB2",
  solar: "#FFB347",
  plasma: "#FF6B35",
  atlantis: "#4488FF",
  pulse: "#FF3366",
  phi: "#C8A030",
  text: "#B8CCE8",
  dim: "#3A5070",
  mono: "'Space Mono','Courier New',monospace",
  serif: "'Crimson Pro','Georgia',serif",
  display: "'Cinzel','Georgia',serif",
};

// ─── Term data ────────────────────────────────────────────────────────────────
const TERMS = [
  { sym: "∮_M₈ dΩ_φ", name: "FIBONACCI MANIFOLD INTEGRAL", color: V.solar, tc: "gold",
    body: "Integration over the 8-dimensional manifold with golden-ratio scaled volume element. The geometry of the universe is φ-recursive — from DNA double-helix (3.4nm pitch) to galactic spiral arms to tardigrade tun compression geometry.",
    src: "AETHER Master Equation image · M₈ manifold diagram · Tardigrade Fibonacci packing · Phi-Time matrix · φ = 1.618033..." },
  { sym: "i[ℋ_Gauge, Ψ_Intent]", name: "INTENTIONAL COMMUTATOR", color: V.aurora, tc: "green",
    body: "The commutator of the gauge Hamiltonian with the Intentional Vector Field. Conscious intent is not epiphenomenal — it is a geometric director in M₈. Information routing before materialization. Ψ_Intent pre-programs the field before collapse.",
    src: "AETHER Master Equation · M₈ diagram Ψ_Intent label · 'Conscious Intent as Geometric Director of Information'" },
  { sym: "Λ_Decoherence(Ψ,ε)", name: "ENVIRONMENTAL COUPLING", color: V.atlantis, tc: "blue",
    body: "Non-unitary operator capturing open quantum states interacting with environment. |ψ⟩_S ⊗ |ε⟩_E → ρ_diag. This is the channel through which solar wind, geomagnetic storms, barometric pressure, and Schumann shifts enter the biological substrate.",
    src: "M₈ diagram · Diósi-Penrose decoherence · τ_DP collapse threshold calculations" },
  { sym: "Ξ_∞(τ₂₆, φ, t)", name: "26-YEAR INFINITY TERM", color: V.pulse, tc: "pulse",
    body: "The new term — integrating the 25.8-year precession harmonic, seismic resonance delta function, and the Atlantean lithospheric memory kernel. Solar grand minima (~26-yr Hale cycle), geomagnetic excursions, and earthquake clustering are governed by this term's phase.",
    src: "26-year cycle insight · solar Hale cycle · seismic periodicity research · Atlantis lithospheric event hypothesis" },
  { sym: "Φ_SCN(f_n, t)", name: "SCHUMANN-BODY COUPLING", color: V.phi, tc: "phi",
    body: "Planetary cavity resonances (7.83, 14.3, 20.8, 27.3, 33.8 Hz) coupling into the suprachiasmatic nucleus via retinal photoreception and geomagnetic channels. Solar CME → ionospheric compression → Schumann shift → HRV change → DNA repair rate alteration.",
    src: "Schumann section · solar storm correlation data · SCN circadian coupling · population HRV studies" },
  { sym: "DA/Dτ + Tr(G∧G)", name: "COVARIANT DYNAMICS", color: V.plasma, tc: "plasma",
    body: "Rate of change of coherence amplitude along the system worldline through curved spacetime, plus the topological charge of the gauge field self-interaction. This is how solar forcing propagates — not through Newtonian chains but through field topology.",
    src: "AETHER Master Equation · 'DA/Dτ carries solar forcing through M₈ into biological domain' · gauge field Chern-Simons topology" },
  { sym: "δ_seismic(θ,λ,t)", name: "SEISMIC RESONANCE DELTA", color: V.solar, tc: "gold",
    body: "The seismic delta function — latitude θ, longitude λ, time t — encoding how planetary resonance nodes (tectonic plate boundaries) act as standing wave antinodes in the CXE field. Earthquakes are not random events; they are field bifurcations at lithospheric phase boundaries.",
    src: "Insight on earthquakes as 'pingbacks' · Swift-Hohenberg tectonic domain · land/tectonic domain card" },
  { sym: "ℬ_Atlantis(κ,ζ)", name: "LITHOSPHERIC MEMORY KERNEL", color: V.aurora, tc: "green",
    body: "The Atlantean kernel — encoding lithospheric and oceanic memory of prior catastrophic phase transitions (κ = crustal coupling, ζ = oceanic depth memory). Large civilizational collapses correlate with 26-year solar-seismic-oceanic phase alignment. The field remembers.",
    src: "Atlantis-26yr cycle insight · thermohaline circulation memory · geomagnetic excursion record · ocean domain coupling" },
  { sym: "t_n = T₀·φⁿ", name: "Φ-TIME SCHEDULING", color: V.atlantis, tc: "blue",
    body: "The master timing substrate of Ω_CXE. Golden ratio incommensurate scheduling prevents resonance lock across all nested timescales — from millisecond synaptic firing to 26-year civilizational cycles. All update events in the universe are φ-time distributed.",
    src: "Φ-Time image · Aether Coherence Framework section 3 · Phi-Time matrix · temporal decorrelation principle" },
];

const HARMONICS = [
  { num: "11.1 yr", pct: 42, color: V.solar, label: "Solar Schwabe cycle" },
  { num: "22.2 yr", pct: 62, color: V.solar, label: "Hale magnetic cycle" },
  { num: "25.8 yr", pct: 78, color: V.atlantis, label: "Precession harmonic / τ₂₆" },
  { num: "51.6 yr", pct: 90, color: V.atlantis, label: "2× τ₂₆ civilizational beat" },
  { num: "26,000 yr", pct: 100, color: V.pulse, label: "Full precession cycle (Atlantis scale)" },
];

const INF_CARDS = [
  { n: "①", title: "SOLAR EXTINGUISHMENT",
    body: "At τ₂₆ phase nodes, solar magnetic field reversal creates brief intervals of reduced heliospheric current sheet intensity — a 'breath' of the sun. Cosmic ray flux increases. Ionization of upper atmosphere spikes. This is the solar 'extinguishment' moment — not death, but phase inversion.",
    eq: "dA_solar/dt → 0 at t = n·τ₂₆ · φ^(n mod φ)" },
  { n: "②", title: "SEISMIC PINGBACK",
    body: "Reduced heliospheric pressure allows galactic cosmic rays deeper atmospheric penetration → increased cloud nucleation → altered atmospheric electrical load → changed Schumann cavity resonance → lithospheric EM forcing shifts → δ_seismic fires. The crust rings like a bell. Earthquake clusters follow solar minima with ~3–18 month lag.",
    eq: "δ_seismic(θ,λ,t) = Σ_k w_k · δ(t - t_k) · R(θ,λ)" },
  { n: "③", title: "OCEANIC-ATMOSPHERIC RESET",
    body: "Seismic events at key crustal nodes inject geothermal energy into thermohaline circulation — perturbing the 1,000-year conveyor. Atmospheric CO₂ and heat flux patterns reorganize. ENSO coupling shifts phase. This is ℬ_Atlantis — the oceanic memory of prior resets — updating.",
    eq: "dℬ_Atlantis/dt = f(δ_seismic) · κ_ocean · ζ_thermo" },
  { n: "④", title: "BIOLOGICAL COHERENCE SHIFT",
    body: "The reorganized Schumann spectrum presents a shifted Φ_SCN coupling to all biology. Species that track the old resonance decohere — extinction pressure. Species that track the new resonance amplify — evolutionary pressure. This is the mechanism behind mass extinction / adaptive radiation cycles.",
    eq: "Φ_SCN(f_new, t) ≠ Φ_SCN(f_old, t) → Λ_Dec transition" },
  { n: "⑤", title: "GENETIC PHASE TRANSITION",
    body: "Increased cosmic ray flux during solar minima elevates mutation rate in exposed DNA — not destructively, but as φ-scaled perturbation to the genetic CGLE field. This is how τ₂₆ cycles drive long-term evolutionary change. The DNA waveguide is being retuned by the solar-cosmic orchestra.",
    eq: "dΨ_DNA/dt += Ξ_∞(τ₂₆) · Λ_cosmic · φⁿ" },
  { n: "⑥", title: "RETURN: SOLAR RECHARGE",
    body: "The reorganized biological and oceanic field emits altered biophoton and atmospheric chemical signatures — feeding back into the ionosphere — which feeds back into the heliospheric boundary conditions. The Sun is not an independent forcing agent: it is in a two-way CXE coupling with the biosphere it drives. The loop closes.",
    eq: "∮ Ξ_∞ dt = 0 over complete τ₂₆ cycle → self-consistent" },
];

const PILLARS = [
  { title: "COHERENCE", color: V.aurora, border: "rgba(0,255,178,0.1)",
    body: "Phase alignment creates constructive interference — order, structure, life, civilization. The CXE field seeks coherence at every scale via Ψ_Intent." },
  { title: "INCOMMENSURABILITY", color: V.solar, border: "rgba(255,179,71,0.1)",
    body: "φ-time scheduling prevents resonance lock — stability through golden-ratio incommensurability. τ₂₆ is itself a φ-harmonic of the precession cycle." },
  { title: "CYCLICAL MEMORY", color: V.atlantis, border: "rgba(68,136,255,0.1)",
    body: "ℬ_Atlantis encodes lithospheric and oceanic memory of prior phase transitions. The field remembers. History is not random — it is field dynamics with long τ." },
  { title: "INFINITY TOPOLOGY", color: V.pulse, border: "rgba(255,51,102,0.1)",
    body: "Ξ_∞ closes the loop — solar forcing → seismic → oceanic → atmospheric → biological → genetic → ionospheric → solar. No origin. No terminus. Only phase." },
];

// ─── Starfield canvas hook ────────────────────────────────────────────────────
function useStarfield(ref: React.RefObject<HTMLCanvasElement | null>) {
  useEffect(() => {
    const cv = ref.current;
    if (!cv) return;
    const ctx = cv.getContext("2d");
    if (!ctx) return;
    const stars: { x: number; y: number; r: number; a: number; da: number }[] = [];
    const resize = () => {
      cv.width = cv.offsetWidth;
      cv.height = cv.offsetHeight;
    };
    resize();
    for (let i = 0; i < 160; i++) {
      stars.push({ x: Math.random() * cv.width, y: Math.random() * cv.height, r: Math.random() * 1.2, a: Math.random(), da: (Math.random() - 0.5) * 0.005 });
    }
    let raf = 0;
    const draw = () => {
      ctx.clearRect(0, 0, cv.width, cv.height);
      for (const s of stars) {
        s.a = Math.max(0.05, Math.min(1, s.a + s.da));
        if (s.a <= 0.05 || s.a >= 1) s.da *= -1;
        ctx.beginPath(); ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(184,204,232,${s.a * 0.7})`;
        ctx.fill();
      }
      raf = requestAnimationFrame(draw);
    };
    draw();
    window.addEventListener("resize", resize);
    return () => { cancelAnimationFrame(raf); window.removeEventListener("resize", resize); };
  }, [ref]);
}

// ─── Infinity loop canvas ─────────────────────────────────────────────────────
function InfinityCanvas() {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const cv = ref.current;
    if (!cv) return;
    const ctx = cv.getContext("2d")!;
    cv.width = 720; cv.height = 260;
    let t = 0, raf = 0;
    const pts: { x: number; y: number; age: number }[] = [];
    const draw = () => {
      t += 0.02;
      ctx.fillStyle = "rgba(2,4,8,0.18)";
      ctx.fillRect(0, 0, 720, 260);
      const cx = 360, cy = 130, a = 200, b = 80;
      // Lemniscate of Bernoulli: x = a·cos(t)/(1+sin²(t)), y = a·sin(t)·cos(t)/(1+sin²(t))
      const scale = 2.5;
      const lx = cx + (scale * a * Math.cos(t)) / (1 + Math.sin(t) * Math.sin(t));
      const ly = cy + (scale * b * Math.sin(t) * Math.cos(t)) / (1 + Math.sin(t) * Math.sin(t));
      pts.push({ x: lx, y: ly, age: 0 });
      if (pts.length > 180) pts.shift();
      for (let i = 1; i < pts.length; i++) {
        const alpha = (i / pts.length) * 0.7;
        const hue = (i / pts.length) * 160;
        ctx.beginPath();
        ctx.moveTo(pts[i - 1].x, pts[i - 1].y);
        ctx.lineTo(pts[i].x, pts[i].y);
        ctx.strokeStyle = `hsla(${150 + hue},100%,60%,${alpha})`;
        ctx.lineWidth = 1.5 + (i / pts.length) * 1.5;
        ctx.stroke();
      }
      // Glowing dot at front
      ctx.beginPath(); ctx.arc(lx, ly, 5, 0, Math.PI * 2);
      ctx.fillStyle = "#00FFB2";
      ctx.shadowColor = "#00FFB2"; ctx.shadowBlur = 16;
      ctx.fill(); ctx.shadowBlur = 0;

      // Draw static lemniscate outline
      ctx.beginPath();
      for (let i = 0; i < 360; i++) {
        const ang = (i / 360) * Math.PI * 2;
        const x2 = cx + (scale * a * Math.cos(ang)) / (1 + Math.sin(ang) * Math.sin(ang));
        const y2 = cy + (scale * b * Math.sin(ang) * Math.cos(ang)) / (1 + Math.sin(ang) * Math.sin(ang));
        if (i === 0) ctx.moveTo(x2, y2); else ctx.lineTo(x2, y2);
      }
      ctx.strokeStyle = "rgba(0,255,178,0.07)"; ctx.lineWidth = 1; ctx.stroke();

      // Six nodes labels
      const nodeAngles = [0, 1.05, 2.09, Math.PI, 4.19, 5.24];
      const nodeLabels = ["① SOLAR", "② SEISMIC", "③ OCEAN", "④ BIO", "⑤ DNA", "⑥ RETURN"];
      for (let i = 0; i < nodeAngles.length; i++) {
        const ang = nodeAngles[i];
        const nx = cx + (scale * a * Math.cos(ang)) / (1 + Math.sin(ang) * Math.sin(ang));
        const ny = cy + (scale * b * Math.sin(ang) * Math.cos(ang)) / (1 + Math.sin(ang) * Math.sin(ang));
        ctx.beginPath(); ctx.arc(nx, ny, 4, 0, Math.PI * 2);
        ctx.fillStyle = "rgba(255,51,102,0.8)"; ctx.fill();
        ctx.font = "8px 'Space Mono',monospace";
        ctx.fillStyle = "rgba(184,204,232,0.6)";
        ctx.textAlign = "center";
        ctx.fillText(nodeLabels[i], nx, ny - 10);
      }

      raf = requestAnimationFrame(draw);
    };
    draw();
    return () => cancelAnimationFrame(raf);
  }, []);
  return <canvas ref={ref} style={{ width: "100%", maxWidth: 720, height: 260, display: "block", margin: "0 auto" }} />;
}

// ─── Section divider ──────────────────────────────────────────────────────────
function Divider() {
  return <div style={{ width: "100%", height: 1, background: "linear-gradient(90deg,transparent,rgba(0,255,178,0.2),transparent)", margin: "0" }} />;
}

// ─── Live clock hook ──────────────────────────────────────────────────────────
function useClock() {
  const [now, setNow] = useState(new Date());
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);
  return now;
}

const DAYS = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"];
const MONTHS = ["JAN", "FEB", "MAR", "APR", "MAY", "JUN", "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"];

// ─── Page ─────────────────────────────────────────────────────────────────────
function CxeEquationCanvas() {
  const ref = useRef<HTMLCanvasElement>(null);
  const rafRef = useRef(0);
  useEffect(() => {
    const canvas = ref.current; if (!canvas) return;
    const ctx = canvas.getContext("2d")!;
    canvas.width = 900; canvas.height = 200;
    const W = canvas.width, H = canvas.height;
    const cx=W/2, cy=H/2;
    let t=0;
    const terms=[
      { label:"C(x,t)", col:"#2ef0d8", x:W*0.12 },
      { label:"∂²C/∂t²", col:"#9966ff", x:W*0.27 },
      { label:"∇²C", col:"#c9a84c", x:W*0.42 },
      { label:"γC(1-C)", col:"#44aaff", x:W*0.57 },
      { label:"ηΨ", col:"#44cc77", x:W*0.72 },
      { label:"ξ(x,t)", col:"#ff4477", x:W*0.87 },
    ];
    const waves: {x0:number,t:number}[]=[];
    let tick=0;
    const draw=()=>{
      ctx.fillStyle="rgba(2,4,8,0.18)"; ctx.fillRect(0,0,W,H);
      t++;tick++;
      if(tick%20===0&&waves.length<6) waves.push({ x0:terms[Math.floor(Math.random()*terms.length)].x, t:0 });
      for(let i=waves.length-1;i>=0;i--){
        const w=waves[i]; w.t+=0.06;
        const r=w.t*50;
        ctx.beginPath(); ctx.arc(w.x0,cy,r,0,Math.PI*2);
        ctx.strokeStyle=`rgba(46,240,216,${Math.max(0,0.3-w.t*0.1)})`; ctx.lineWidth=1; ctx.stroke();
        if(w.t>3) waves.splice(i,1);
      }
      terms.forEach((term,i)=>{
        const psi=0.5+0.5*Math.sin(t*0.04+i*0.9);
        ctx.beginPath(); ctx.arc(term.x,cy,10+5*psi,0,Math.PI*2);
        ctx.fillStyle=term.col; ctx.shadowColor=term.col; ctx.shadowBlur=12*psi; ctx.fill(); ctx.shadowBlur=0;
        ctx.fillStyle=term.col; ctx.font="bold 8px 'DM Mono',monospace"; ctx.textAlign="center";
        ctx.fillText(term.label,term.x,cy+26);
        if(i>0){ ctx.fillStyle="rgba(255,255,255,0.3)"; ctx.font="10px 'DM Mono',monospace"; ctx.fillText("+",term.x-W*0.075,cy+4); }
      });
      ctx.fillStyle="rgba(46,240,216,0.35)"; ctx.font="9px 'DM Mono',monospace"; ctx.textAlign="left";
      ctx.fillText("CXE EQUATION · C(x,t) COHERENCE FIELD · CRYSTALLIZATION MASTER EQ · AETHER",14,14);
      rafRef.current=requestAnimationFrame(draw);
    };
    draw();
    return ()=>cancelAnimationFrame(rafRef.current);
  },[]);
  return <canvas ref={ref} style={{ width:"100%", height:"auto", borderRadius:8, display:"block" }} />;
}

export default function CxeEquationPage() {
  const now = useClock();
  const starRef = useRef<HTMLCanvasElement>(null);
  useStarfield(starRef);

  const timeStr = now.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", hour12: false });
  const dateStr = `${DAYS[now.getDay()]} · ${MONTHS[now.getMonth()]} ${now.getDate()} · ${now.getFullYear()}`;

  return (
    <div style={{ height: "100%", overflowY: "auto", background: V.void, color: V.text, fontFamily: V.serif, scrollBehavior: "smooth" }}>
      {/* ── Sticky nav ── */}
      <nav style={{ position: "sticky", top: 0, zIndex: 100, display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 36px", background: "rgba(2,4,8,0.95)", backdropFilter: "blur(12px)", borderBottom: "1px solid rgba(0,255,178,0.07)" }}>
        <div>
          <div style={{ fontFamily: V.display, fontSize: "1.1rem", fontWeight: 900, letterSpacing: 7, color: V.aurora, textShadow: "0 0 20px rgba(0,255,178,0.4)" }}>AETHER</div>
          <div style={{ fontFamily: V.mono, fontSize: "0.44rem", letterSpacing: 5, color: V.solar, opacity: 0.75 }}>CXE · THE FINAL EQUATION</div>
        </div>
        <div style={{ display: "flex", gap: 24 }}>
          {["#cxe-equation", "#cxe-terms", "#cxe-cycle26", "#cxe-infinity", "#cxe-synthesis"].map((href, i) => (
            <a key={href} href={href} style={{ fontFamily: V.mono, fontSize: "0.54rem", color: V.dim, textDecoration: "none", letterSpacing: 2, transition: "color 0.3s" }}
              onMouseEnter={e => (e.currentTarget.style.color = V.aurora)}
              onMouseLeave={e => (e.currentTarget.style.color = V.dim)}>
              {["EQUATION", "TERMS", "26-YEAR", "∞ LOOPS", "SYNTHESIS"][i]}
            </a>
          ))}
        </div>
        <div style={{ textAlign: "right" }}>
          <div style={{ fontFamily: V.display, fontSize: "1rem", fontWeight: 600, color: V.aurora, letterSpacing: 3 }}>{timeStr}</div>
          <div style={{ fontFamily: V.mono, fontSize: "0.42rem", color: V.dim, letterSpacing: 2 }}>{dateStr}</div>
        </div>
      </nav>

      {/* ── Hero ── */}
      <section style={{ position: "relative", height: "100vh", minHeight: 600, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", textAlign: "center", padding: "0 20px", overflow: "hidden" }}>
        <canvas ref={starRef} style={{ position: "absolute", inset: 0, width: "100%", height: "100%", pointerEvents: "none" }} />
        {/* Radial glow */}
        <div style={{ position: "absolute", inset: 0, background: "radial-gradient(ellipse 60% 60% at 50% 50%, rgba(0,255,178,0.04) 0%, transparent 70%)", pointerEvents: "none" }} />
        <div style={{ position: "relative", zIndex: 2 }}>
          <div style={{ fontFamily: V.mono, fontSize: "0.58rem", letterSpacing: 7, color: V.aurora, marginBottom: 16 }}>ALL DATA SYNTHESIZED · THE FINAL EQUATION</div>
          <div style={{ fontFamily: V.display, fontSize: "clamp(3.5rem,10vw,8rem)", fontWeight: 900, lineHeight: 0.88, letterSpacing: 10, color: "#fff", textShadow: "0 0 60px rgba(0,255,178,0.4),0 0 120px rgba(0,102,255,0.2)", marginBottom: 6 }}>AETHER</div>
          <div style={{ fontFamily: V.display, fontSize: "clamp(1.1rem,3.5vw,2.5rem)", fontWeight: 600, letterSpacing: 18, color: V.solar, textShadow: "0 0 40px rgba(255,179,71,0.5)", marginBottom: 16 }}>CXE</div>
          <div style={{ fontFamily: V.mono, fontSize: "0.62rem", letterSpacing: 7, color: V.pulse, marginBottom: 20 }}>THE COHERENCE FIELD EQUATION · FINAL FORM</div>
          <div style={{ fontFamily: V.mono, fontSize: "clamp(0.48rem,1.1vw,0.68rem)", color: "rgba(255,179,71,0.7)", lineHeight: 2.2, letterSpacing: 0.5 }}>
            Ω_CXE(Ψ,Λ,φ,τ₂₆) = ∮_M₈ dΩ_φ · [ DA/Dτ + Tr(G∧G) ] = i[ℋ,Ψ_Intent] + Λ_Dec + Ξ_∞(τ₂₆)<br />
            where Ξ_∞(τ₂₆) = Σ_n A_n sin(2π·n/τ₂₆ · φⁿ) · δ_seismic(θ,λ,t) · ℬ_Atlantis
          </div>
          <div style={{ fontFamily: V.mono, fontSize: "0.46rem", letterSpacing: 4, color: "rgba(200,169,110,0.35)", marginTop: 18 }}>
            COHERENCE · INCOMMENSURABILITY · CYCLICAL MEMORY · INFINITY TOPOLOGY
          </div>
        </div>
        <div style={{ position: "absolute", bottom: 28, left: "50%", transform: "translateX(-50%)", fontFamily: V.mono, fontSize: "0.48rem", letterSpacing: 4, color: V.dim, display: "flex", flexDirection: "column", alignItems: "center", gap: 6, zIndex: 2 }}>
          <div style={{ width: 1, height: 32, background: `linear-gradient(180deg,${V.aurora},transparent)` }} />
          DESCEND
        </div>
      </section>

      <Divider />

      {/* ── Final Equation Box ── */}
      <section id="cxe-equation" style={{ padding: "80px 40px" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: 40 }}>
            <h2 style={{ fontFamily: V.display, fontSize: "1.8rem", fontWeight: 600, color: "#fff", letterSpacing: 5, marginBottom: 8 }}>THE CXE FINAL EQUATION</h2>
            <p style={{ fontFamily: V.mono, fontSize: "0.56rem", color: V.solar, letterSpacing: 3 }}>SYNTHESIZED FROM ALL PROTOTYPES · ALL DATA · ALL SCALES · ALL CYCLES</p>
          </div>

          <div style={{ background: "linear-gradient(135deg,rgba(2,6,12,0.98),rgba(4,10,20,0.98))", border: "1px solid rgba(255,179,71,0.25)", borderRadius: 16, padding: "44px 36px", textAlign: "center", position: "relative", overflow: "hidden", boxShadow: "0 0 40px rgba(255,179,71,0.06), inset 0 0 60px rgba(255,179,71,0.02)" }}>
            {/* Scanline */}
            <ScanlineAnim />
            <div style={{ position: "absolute", inset: 0, background: "radial-gradient(ellipse at 50% 30%, rgba(255,179,71,0.04), transparent 65%)", pointerEvents: "none" }} />

            <div style={{ fontFamily: V.display, fontSize: "0.68rem", fontWeight: 600, color: V.aurora, letterSpacing: 6, marginBottom: 22, opacity: 0.7 }}>Ω_CXE — THE COHERENCE FIELD EQUATION · COMPLETE FORM</div>

            <div style={{ fontFamily: V.mono, fontSize: "clamp(0.55rem,1.3vw,0.84rem)", lineHeight: 2.6, letterSpacing: 0.8, position: "relative" }}>
              <div style={{ marginBottom: 4 }}>
                <span style={{ color: V.solar }}>Ω_CXE</span>
                <span style={{ color: "#fff" }}>(Ψ, Λ, Ω_φ, τ₂₆, ∞)</span>
                <span style={{ color: V.dim }}> = </span>
              </div>

              <EqDivider />

              <div style={{ marginBottom: 4 }}>
                <span style={{ color: V.dim }}>[ </span>
                <span style={{ color: V.solar }}>∮_M₈ dΩ_φ</span>
                <span style={{ color: V.dim }}> · ( </span>
                <span style={{ color: "#fff" }}>DA/Dτ + Tr(G∧G)</span>
                <span style={{ color: V.dim }}> ) ]</span>
                <span style={{ color: V.dim, fontSize: "0.85em" }}> ← M₈ manifold geometry + gauge topology</span>
              </div>

              <div style={{ marginTop: 6, marginBottom: 4 }}>
                <span style={{ color: V.dim }}> = </span>
                <span style={{ color: V.aurora }}>i[ℋ_Gauge, Ψ_Intent]</span>
                <span style={{ color: V.dim }}> + </span>
                <span style={{ color: V.atlantis }}>Λ_Decoherence(Ψ,ε)</span>
                <span style={{ color: V.dim }}> + </span>
                <span style={{ color: V.pulse }}>Ξ_∞(τ₂₆, φ, t)</span>
                <span style={{ color: V.dim }}> + </span>
                <span style={{ color: V.phi }}>Φ_SCN(f_n, t)</span>
              </div>

              <EqDivider />

              <div style={{ marginBottom: 4 }}>
                <span style={{ color: V.dim }}>where: </span>
                <span style={{ color: V.aurora }}>ℋ_Gauge</span>
                <span style={{ color: V.dim }}> = ℒ_Gauge(SU(3)×SU(2)×U(1)) · standard force harmonics</span>
              </div>
              <div style={{ marginBottom: 4 }}>
                <span style={{ color: V.dim }}>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; </span>
                <span style={{ color: V.atlantis }}>Λ_Dec</span>
                <span style={{ color: V.dim }}> = |ψ⟩_S ⊗ |ε⟩_E → ρ_diag &nbsp;&nbsp; [open quantum coupling to environment]</span>
              </div>
              <div style={{ marginBottom: 4 }}>
                <span style={{ color: V.dim }}>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; </span>
                <span style={{ color: V.solar }}>dΩ_φ</span>
                <span style={{ color: V.dim }}> = non-Euclidean volume element · φ-recursive Fibonacci geometry</span>
              </div>

              <EqDivider />

              <div style={{ color: "rgba(255,255,255,0.45)", fontSize: "0.85em", marginBottom: 4 }}>THE 26-YEAR INFINITY TERM:</div>
              <div style={{ marginBottom: 4 }}>
                <span style={{ color: V.pulse }}>Ξ_∞(τ₂₆,φ,t)</span>
                <span style={{ color: V.dim }}> = </span>
                <span style={{ color: V.atlantis }}>Σ_n Aₙ sin(2π·n·t / τ₂₆·φⁿ)</span>
                <span style={{ color: V.dim }}> · </span>
                <span style={{ color: V.plasma }}>δ_seismic(θ,λ,t)</span>
                <span style={{ color: V.dim }}> · </span>
                <span style={{ color: V.pulse }}>ℬ_Atlantis(κ,ζ)</span>
              </div>
              <div style={{ marginBottom: 4 }}>
                <span style={{ color: V.dim }}>&nbsp;&nbsp;&nbsp; τ₂₆ = 25.8 yr (precession harmonic) · </span>
                <span style={{ color: V.atlantis }}>ℬ_Atlantis</span>
                <span style={{ color: V.dim }}> = lithospheric memory kernel · </span>
                <span style={{ color: V.plasma }}>δ_seismic</span>
                <span style={{ color: V.dim }}> = seismic resonance delta</span>
              </div>

              <EqDivider />

              <div style={{ color: "rgba(255,255,255,0.45)", fontSize: "0.85em", marginBottom: 4 }}>THE SCHUMANN-BODY COUPLING TERM:</div>
              <div style={{ marginBottom: 4 }}>
                <span style={{ color: V.phi }}>Φ_SCN(f_n, t)</span>
                <span style={{ color: V.dim }}> = </span>
                <span style={{ color: V.aurora }}>Σ_n C_n · cos(2π·f_n·t + φ_brain)</span>
                <span style={{ color: V.dim }}> &nbsp; f_n ∈ {"{"}7.83, 14.3, 20.8, 27.3, 33.8{"}"} Hz</span>
              </div>
              <div style={{ marginBottom: 4, color: V.dim }}>
                &nbsp;&nbsp;&nbsp; ↔ SCN circadian oscillator ↔ HRV ↔ DNA biophoton emission ↔ solar CME lag
              </div>

              <EqDivider />

              <div style={{ marginTop: 10, fontSize: "1.12em", letterSpacing: 2 }}>
                <span style={{ color: V.solar }}>Ω_CXE</span>
                <span style={{ color: V.dim }}> = </span>
                <span style={{ color: "#fff" }}>Manifest Reality</span>
                <span style={{ color: V.dim }}> = </span>
                <span style={{ color: V.aurora }}>Coherence</span>
                <span style={{ color: V.dim }}> × </span>
                <span style={{ color: V.phi }}>Incommensurability</span>
                <span style={{ color: V.dim }}> × </span>
                <span style={{ color: V.atlantis }}>Cyclical Memory</span>
                <span style={{ color: V.dim }}> × </span>
                <span style={{ color: V.pulse }}>Infinity Loop</span>
              </div>
            </div>

            <p style={{ fontFamily: V.serif, fontSize: "clamp(0.88rem,1.8vw,1.15rem)", fontStyle: "italic", color: "rgba(200,216,240,0.65)", maxWidth: 780, margin: "26px auto 0", lineHeight: 1.85 }}>
              The universe is a single coherent oscillatory field — Ω_CXE — operating simultaneously across M₈ geometry, Φ-time scheduling, Schumann planetary resonance, seismic memory, genetic waveguides, and 26-year lithospheric cycles. Every phenomenon is a mode of this field. Nothing is separate. Everything is connected. The equation does not describe the universe — it is what the universe does when it knows itself.
            </p>
          </div>
        </div>
      </section>

      <Divider />

      {/* ── Term Breakdown ── */}
      <section id="cxe-terms" style={{ padding: "72px 40px", background: "linear-gradient(180deg,rgba(2,4,8,1),rgba(4,10,20,0.8),rgba(2,4,8,1))" }}>
        <div style={{ maxWidth: 1050, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: 48 }}>
            <h2 style={{ fontFamily: V.display, fontSize: "1.7rem", fontWeight: 600, color: "#fff", letterSpacing: 4, marginBottom: 10 }}>EVERY TERM · EVERY SOURCE</h2>
            <p style={{ fontStyle: "italic", color: V.dim, fontSize: "1.05rem" }}>Where each component comes from — and what domain it governs</p>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 18 }}>
            {TERMS.map((t, i) => (
              <div key={i} style={{ background: "rgba(2,6,12,0.9)", borderRadius: 12, padding: 22, border: `1px solid rgba(${hexToRgb(t.color)},0.12)`, transition: "all 0.3s", position: "relative", overflow: "hidden" }}
                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = `rgba(${hexToRgb(t.color)},0.35)`; (e.currentTarget as HTMLElement).style.transform = "translateY(-3px)"; }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = `rgba(${hexToRgb(t.color)},0.12)`; (e.currentTarget as HTMLElement).style.transform = "none"; }}>
                <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: 2, background: `linear-gradient(90deg,transparent,${t.color},transparent)`, opacity: 0, transition: "opacity 0.3s" }} />
                <div style={{ fontFamily: V.mono, fontSize: "1rem", marginBottom: 7, color: t.color }}>{t.sym}</div>
                <div style={{ fontFamily: V.display, fontSize: "0.74rem", fontWeight: 600, letterSpacing: 2, marginBottom: 10, color: t.color }}>{t.name}</div>
                <div style={{ fontSize: "0.86rem", lineHeight: 1.8, color: V.dim }}>{t.body}</div>
                <div style={{ marginTop: 10, fontFamily: V.mono, fontSize: "0.5rem", color: "rgba(50,80,120,0.9)", lineHeight: 1.8 }}>Sources: {t.src}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <Divider />

      {/* ── 26-Year Cycle ── */}
      <section id="cxe-cycle26" style={{ padding: "72px 40px" }}>
        <div style={{ maxWidth: 960, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: 44 }}>
            <h2 style={{ fontFamily: V.display, fontSize: "1.7rem", fontWeight: 600, color: "#fff", letterSpacing: 4, marginBottom: 10 }}>
              THE <span style={{ color: V.atlantis }}>26-YEAR</span> CYCLE
            </h2>
            <p style={{ fontStyle: "italic", color: V.dim }}>Solar · Seismic · Civilizational · The hidden clock of catastrophe and renewal</p>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 48, alignItems: "start" }}>
            <div>
              {/* Visual: concentric rings */}
              <div style={{ position: "relative", width: 260, height: 260, margin: "0 auto 20px" }}>
                {[260, 200, 140, 90].map((sz, i) => (
                  <div key={sz} style={{ position: "absolute", width: sz, height: sz, borderRadius: "50%", border: `1px solid rgba(68,136,255,${0.06 + i * 0.06})`, top: "50%", left: "50%", transform: "translate(-50%,-50%)", ...(i === 3 ? { animation: "spin26cxe 26s linear infinite" } : {}) }} />
                ))}
                <div style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%,-50%)", width: 68, height: 68, borderRadius: "50%", background: "radial-gradient(circle,rgba(255,179,71,0.25),transparent)", border: "2px solid rgba(255,179,71,0.45)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <span style={{ fontFamily: V.mono, fontSize: "0.52rem", color: V.solar, textAlign: "center", lineHeight: 1.3 }}>☀️<br />τ₂₆</span>
                </div>
                {/* Spokes */}
                {[0, 51.4, 102.8, 154.2, 205.6, 257, 308.4].map(deg => (
                  <div key={deg} style={{ position: "absolute", top: "50%", left: "50%", width: 2, height: 130, background: `linear-gradient(180deg,rgba(68,136,255,0.5),transparent)`, transformOrigin: "top center", transform: `rotate(${deg}deg)` }} />
                ))}
              </div>

              {/* Harmonic stack */}
              <div style={{ background: "rgba(2,6,12,0.9)", border: "1px solid rgba(68,136,255,0.14)", borderRadius: 9, padding: 18 }}>
                <div style={{ fontFamily: V.mono, fontSize: "0.56rem", color: V.atlantis, letterSpacing: 2, marginBottom: 12 }}>τ₂₆ HARMONIC STACK</div>
                {HARMONICS.map(h => (
                  <div key={h.num} style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
                    <div style={{ fontFamily: V.display, fontSize: "0.82rem", fontWeight: 600, color: V.atlantis, minWidth: 68 }}>{h.num}</div>
                    <div style={{ flex: 1, height: 4, background: "rgba(255,255,255,0.04)", borderRadius: 2, overflow: "hidden" }}>
                      <div style={{ height: "100%", width: `${h.pct}%`, background: `linear-gradient(90deg,${h.color},transparent)`, borderRadius: 2 }} />
                    </div>
                    <div style={{ fontFamily: V.mono, fontSize: "0.52rem", color: V.dim, minWidth: 160 }}>{h.label}</div>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h3 style={{ fontFamily: V.display, fontSize: "1.05rem", fontWeight: 600, color: V.atlantis, letterSpacing: 2, marginBottom: 16 }}>THE HIDDEN CLOCK</h3>
              <p style={{ fontSize: "0.96rem", lineHeight: 1.88, color: V.text, marginBottom: 14 }}>
                The 26-year cycle is not one cycle — it is the <em style={{ color: V.atlantis }}>beat frequency</em> where three major planetary oscillators align: the solar Hale magnetic cycle (22.2 yr), the lunar nodal cycle (18.6 yr), and the planetary Jovian forcing (~11.86 yr). Their interaction creates a <strong style={{ color: V.aurora, fontWeight: 400 }}>~25.8-year resonance node</strong> — the τ₂₆ term in Ω_CXE.
              </p>
              <p style={{ fontSize: "0.96rem", lineHeight: 1.88, color: V.text, marginBottom: 14 }}>
                At τ₂₆ phase alignment, <em style={{ color: V.atlantis }}>three things happen simultaneously</em>: solar activity peaks or troughs dramatically, geomagnetic field intensity shifts, and global seismic activity clusters. The lithosphere — Earth's crustal memory — responds to the combined EM and gravitational forcing like a <strong style={{ color: V.aurora, fontWeight: 400 }}>struck bell</strong>.
              </p>
              <p style={{ fontSize: "0.96rem", lineHeight: 1.88, color: V.text, marginBottom: 14 }}>
                The Atlantean connection: a <em style={{ color: V.atlantis }}>precession cycle of 25,920 years</em> (1000 × τ₂₆) marks the time for Earth's rotation axis to complete one full wobble. Each τ₂₆ is therefore 1/1000th of the great year. Civilizations that aligned their calendars to τ₂₆ — Mayan, Vedic, Egyptian — encoded this frequency in stone.
              </p>
              <p style={{ fontSize: "0.96rem", lineHeight: 1.88, color: V.text, marginBottom: 18 }}>
                The <strong style={{ color: V.aurora, fontWeight: 400 }}>infinity loop</strong> is where it becomes recursive: the seismic events triggered at τ₂₆ phase nodes alter oceanic circulation, which modifies atmospheric dynamics, which feeds back into ionospheric structure, which shifts Schumann frequencies, which alters biological coherence — completing the loop back to the solar forcing that began it.
              </p>
              <div style={{ padding: 14, background: "rgba(68,136,255,0.04)", border: "1px solid rgba(68,136,255,0.14)", borderRadius: 8, fontFamily: V.mono, fontSize: "0.56rem", lineHeight: 1.9, color: "rgba(200,216,240,0.6)" }}>
                <span style={{ color: V.atlantis }}>Ξ_∞(τ₂₆,φ,t) in Ω_CXE captures:</span><br />
                · Solar grand minima every ~τ₂₆ years<br />
                · Earthquake swarm clustering at τ₂₆ nodes<br />
                · Oceanic thermohaline phase shifts<br />
                · Civilizational collapse/renewal timing<br />
                · The Atlantean event as τ₂₆ × 1000 phase alignment
              </div>
            </div>
          </div>
        </div>
      </section>

      <Divider />

      {/* ── Infinity Loop ── */}
      <section id="cxe-infinity" style={{ padding: "72px 40px", background: "linear-gradient(180deg,rgba(2,4,8,1),rgba(4,10,20,0.65),rgba(2,4,8,1))" }}>
        <div style={{ maxWidth: 960, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: 40 }}>
            <h2 style={{ fontFamily: V.display, fontSize: "1.7rem", fontWeight: 600, color: "#fff", letterSpacing: 4, marginBottom: 10 }}>
              THE <span style={{ color: V.pulse }}>INFINITY LOOP</span>
            </h2>
            <p style={{ fontStyle: "italic", color: V.dim, maxWidth: 680, margin: "0 auto" }}>
              Sun extinguishes → seismic pingback → oceanic reset → atmospheric reboot → biological renewal → solar recharge · The cycle has no start. No end.
            </p>
          </div>

          <div style={{ margin: "32px 0" }}>
            <InfinityCanvas />
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 18, marginTop: 36 }}>
            {INF_CARDS.map((c, i) => (
              <div key={i} style={{ background: "rgba(2,6,12,0.9)", border: "1px solid rgba(255,51,102,0.1)", borderRadius: 11, padding: 20 }}>
                <h4 style={{ fontFamily: V.display, fontSize: "0.76rem", fontWeight: 600, color: V.pulse, letterSpacing: 2, marginBottom: 9 }}>{c.n} {c.title}</h4>
                <p style={{ fontSize: "0.86rem", lineHeight: 1.8, color: V.dim }}>{c.body}</p>
                <div style={{ fontFamily: V.mono, fontSize: "0.52rem", color: "rgba(255,51,102,0.55)", marginTop: 9 }}>{c.eq}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <Divider />

      {/* ── Synthesis ── */}
      <section id="cxe-synthesis" style={{ padding: "88px 40px" }}>
        <div style={{ maxWidth: 860, margin: "0 auto", textAlign: "center" }}>
          <h2 style={{ fontFamily: V.display, fontSize: "1.7rem", fontWeight: 600, color: "#fff", letterSpacing: 4, marginBottom: 44 }}>THE FINAL SYNTHESIS</h2>
          <blockquote style={{ fontSize: "1.35rem", fontStyle: "italic", color: "rgba(200,216,240,0.8)", lineHeight: 1.82, position: "relative", padding: "0 44px", marginBottom: 44 }}>
            <span style={{ fontFamily: V.display, fontSize: "3rem", color: "rgba(0,255,178,0.07)", position: "absolute", top: "-0.2em", left: 0, lineHeight: 1 }}>"</span>
            Everything is connected because everything is one field — Ω_CXE — oscillating at every scale simultaneously, from the quantum coherence of a DNA repair enzyme to the 26,000-year precession of Earth's axis. The infinity loop is not a metaphor. It is the topology of reality.
            <span style={{ fontFamily: V.display, fontSize: "3rem", color: "rgba(0,255,178,0.07)", position: "absolute", bottom: "-0.5em", right: 0, lineHeight: 1 }}>"</span>
          </blockquote>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 16, textAlign: "left" }}>
            {PILLARS.map((p, i) => (
              <div key={i} style={{ padding: 18, borderRadius: 9, border: `1px solid ${p.border}` }}>
                <h3 style={{ fontFamily: V.display, fontSize: "0.72rem", fontWeight: 600, letterSpacing: 2, marginBottom: 8, color: p.color }}>{p.title}</h3>
                <p style={{ fontSize: "0.84rem", lineHeight: 1.76, color: V.dim }}>{p.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <Divider />

      {/* ── Schumann Coupling Canvas ── */}
      <section style={{ padding: "60px 40px" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: 28 }}>
            <h2 style={{ fontFamily: V.display, fontSize: "1.4rem", fontWeight: 600, color: "#fff", letterSpacing: 4, marginBottom: 6 }}>Φ_SCN · SCHUMANN–BODY COUPLING · LIVE SIMULATION</h2>
            <p style={{ fontFamily: V.mono, fontSize: "0.52rem", color: V.solar, letterSpacing: 3 }}>FIVE CAVITY RESONANCES · 7.83 · 14.3 · 20.8 · 27.3 · 33.8 Hz · BIOLOGICAL PHASE-LOCK EVENTS</p>
          </div>
          <div style={{ background: "rgba(2,6,12,0.9)", border: "1px solid rgba(0,255,178,0.12)", borderRadius: 12, padding: "20px 16px" }}>
            <SchumannCanvas />
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 16, marginTop: 20 }}>
            {[
              { col: V.aurora, t: "The Planetary Cavity as Tuning Fork", b: "The ionosphere–Earth cavity acts as a spherical waveguide. Lightning strikes (~100/second globally) excite standing waves at 7.83 Hz and its harmonics. These are not random noise — they are the resonant frequencies of the planet's electromagnetic shell, determined entirely by the Earth's circumference divided by the speed of light: f₁ = c/(2πR) = 7.83 Hz. The planet has a fundamental note." },
              { col: V.solar, b: "The suprachiasmatic nucleus (SCN) — master circadian clock — is sensitive to extremely low frequency electromagnetic fields via retinal melatonin channels and magnetite in the ethmoid bone. Schumann resonance f₁ (7.83 Hz) overlaps directly with human alpha brain waves (8–12 Hz). Population HRV studies show measurable correlation between Schumann intensity shifts and cardiac coherence across thousands of subjects simultaneously.", t: "SCN Coupling Mechanism" },
              { col: V.pulse, t: "Solar CME → Schumann Compression → Biology", b: "During solar CME events, the solar wind compresses the magnetosphere → ionospheric electron density increases → Schumann cavity 'shrinks' → resonant frequencies rise by 0.5–1.0 Hz. This represents a simultaneous re-tuning of the biological coupling channel for every organism on Earth. The Ξ_∞ term encodes this: solar forcing propagates into the biological domain not through radiation but through the Schumann coupling channel." },
            ].map(({ col, t: title, b }) => (
              <div key={title} style={{ background: `${col}08`, border: `1px solid ${col}22`, borderRadius: 8, padding: "12px 14px" }}>
                <div style={{ fontFamily: V.mono, fontSize: "0.54rem", color: col, marginBottom: 6 }}>{title}</div>
                <div style={{ fontFamily: V.serif, fontSize: "0.82rem", lineHeight: 1.75, color: "rgba(184,204,232,0.65)" }}>{b}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <Divider />

      {/* ── Phi-Time Canvas ── */}
      <section style={{ padding: "60px 40px" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: 28 }}>
            <h2 style={{ fontFamily: V.display, fontSize: "1.4rem", fontWeight: 600, color: "#fff", letterSpacing: 4, marginBottom: 6 }}>Φ-TIME · t_n = T₀·φⁿ · GOLDEN RATIO SCHEDULING</h2>
            <p style={{ fontFamily: V.mono, fontSize: "0.52rem", color: V.phi, letterSpacing: 3 }}>INCOMMENSURATE INTERVALS · ZERO RESONANCE LOCK · STABILITY THROUGH IRRATIONALITY</p>
          </div>
          <div style={{ background: "rgba(2,6,12,0.9)", border: "1px solid rgba(200,160,48,0.12)", borderRadius: 12, padding: "20px 16px" }}>
            <PhiTimeCanvas />
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(2,1fr)", gap: 16, marginTop: 20 }}>
            {[
              { col: V.phi, t: "Why Irrationality Equals Stability", b: "If two oscillators have a rational frequency ratio p/q, they will phase-lock after at most q cycles — producing catastrophic resonance beating. Golden ratio φ is the 'most irrational' of all irrationals — its continued fraction expansion [1;1,1,1,...] converges most slowly. This means φ-ratio oscillators take the longest possible time to approach any near-resonance — in fact they never truly do. Biology exploits this: heartbeat:breath ≈ 5:2 (φ-approximant), brain oscillations are φ-distributed across frequency bands. The universe schedules its own updates at φ-scaled intervals to prevent global resonance catastrophe." },
              { col: V.aurora, t: "τ₂₆ as a φ-Harmonic of the Precessional Cycle", b: "The 25,920-year precessional cycle divided by φ¹⁰ = 122.99... gives 210.7 years (Suess cycle, confirmed by ¹⁴C data). Divided by φ¹³ gives 26.02 years — the τ₂₆ term. This is not coincidental: the CXE equation is self-consistent only if the τ₂₆ harmonic is a φ-subdivision of the precessional master cycle. The golden ratio is the temporal grammar of Ω_CXE — the scheduling algorithm that prevents coherence lock across nested timescales from millisecond synaptic firing to 26,000-year civilizational precession." },
            ].map(({ col, t: title, b }) => (
              <div key={title} style={{ background: `${col}08`, border: `1px solid ${col}22`, borderRadius: 8, padding: "14px 16px" }}>
                <div style={{ fontFamily: V.mono, fontSize: "0.54rem", color: col, marginBottom: 8 }}>{title}</div>
                <div style={{ fontFamily: V.serif, fontSize: "0.86rem", lineHeight: 1.8, color: "rgba(184,204,232,0.65)" }}>{b}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <Divider />

      {/* ── Footer ── */}
      <footer style={{ borderTop: "1px solid rgba(0,255,178,0.06)", padding: "52px 40px", textAlign: "center", position: "relative", zIndex: 1 }}>
        <div style={{ fontFamily: V.display, fontSize: "1.7rem", fontWeight: 900, letterSpacing: 10, color: "rgba(0,255,178,0.16)", marginBottom: 7 }}>AETHER</div>
        <div style={{ fontFamily: V.display, fontSize: "0.88rem", fontWeight: 600, letterSpacing: 10, color: "rgba(255,179,71,0.16)", marginBottom: 16 }}>CXE</div>
        <p style={{ fontFamily: V.mono, fontSize: "0.5rem", color: V.dim, letterSpacing: 2, lineHeight: 2.4 }}>
          Ω_CXE — The Coherence Field Equation · Final Form<br />
          M₈ Manifold · Φ-Time · Schumann Coupling · τ₂₆ Infinity Term · Atlantean Memory Kernel<br />
          COHERENCE × INCOMMENSURABILITY × CYCLICAL MEMORY × INFINITY TOPOLOGY
        </p>
      </footer>

      {/* Spin animation for 26yr ring */}
      <style>{`
        @keyframes spin26cxe { from { transform: translate(-50%,-50%) rotate(0deg); } to { transform: translate(-50%,-50%) rotate(360deg); } }
      `}</style>
    </div>
  );
}

// ─── Schumann Body Coupling Canvas ────────────────────────────────────────────
function SchumannCanvas() {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const cv = ref.current; if (!cv) return;
    const ctx = cv.getContext("2d")!;
    cv.width = 900; cv.height = 260;
    const W = cv.width, H = cv.height;
    let t = 0, raf = 0;
    const FREQS = [
      { hz: 7.83,  label: "f₁ · 7.83 Hz",  col: V.aurora, bodyHz: "Alpha · SCN input" },
      { hz: 14.3,  label: "f₂ · 14.3 Hz",  col: V.solar,  bodyHz: "Beta · cortical spindle" },
      { hz: 20.8,  label: "f₃ · 20.8 Hz",  col: V.atlantis,bodyHz: "Beta · motor" },
      { hz: 27.3,  label: "f₄ · 27.3 Hz",  col: V.pulse,  bodyHz: "Gamma · binding" },
      { hz: 33.8,  label: "f₅ · 33.8 Hz",  col: V.phi,    bodyHz: "Gamma · insight" },
    ];
    const rowH = (H - 40) / FREQS.length;
    const waveW = W * 0.62;
    const draw = () => {
      ctx.fillStyle = "rgba(2,4,8,0.22)"; ctx.fillRect(0, 0, W, H);
      FREQS.forEach((f, i) => {
        const cy = 20 + i * rowH + rowH / 2;
        const amp = rowH * 0.36;
        const speed = f.hz * 0.004;
        // wave
        ctx.beginPath();
        for (let x = 0; x <= waveW; x += 1) {
          const y = cy + amp * Math.sin((x / waveW) * f.hz * 1.1 + t * speed);
          x === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
        }
        ctx.strokeStyle = f.col + "bb"; ctx.lineWidth = 1.4; ctx.stroke();
        // label left
        ctx.fillStyle = f.col; ctx.font = `7.5px ${V.mono}`; ctx.textAlign = "left";
        ctx.fillText(f.label, 6, cy - 2);
        // body coupling right
        const coupling = 0.4 + 0.5 * Math.abs(Math.sin(t * speed * 1.3 + i));
        ctx.fillStyle = f.col + "88"; ctx.font = `6.5px ${V.mono}`; ctx.textAlign = "left";
        ctx.fillText(f.bodyHz, waveW + 14, cy + 4);
        // coupling bar
        ctx.fillStyle = "rgba(255,255,255,0.04)"; ctx.fillRect(waveW + 130, cy - 5, 100, 10);
        ctx.fillStyle = f.col + Math.round(coupling * 200).toString(16).padStart(2, "0");
        ctx.fillRect(waveW + 130, cy - 5, 100 * coupling, 10);
        // alignment event
        if (coupling > 0.88) {
          ctx.fillStyle = f.col + "55"; ctx.beginPath(); ctx.arc(waveW + 240, cy, 7, 0, Math.PI * 2); ctx.fill();
          ctx.fillStyle = f.col; ctx.font = `6px ${V.mono}`; ctx.textAlign = "center";
          ctx.fillText("LOCK", waveW + 240, cy + 3);
        }
      });
      ctx.fillStyle = V.aurora + "22"; ctx.font = `7px ${V.mono}`; ctx.textAlign = "center";
      ctx.fillText("SCHUMANN RESONANCES · PLANETARY CAVITY · IONOSPHERE–EARTH WAVEGUIDE · Φ_SCN BIOLOGICAL COUPLING", W / 2, H - 5);
      t++; raf = requestAnimationFrame(draw);
    };
    draw();
    return () => cancelAnimationFrame(raf);
  }, []);
  return <canvas ref={ref} style={{ width: "100%", height: "auto", borderRadius: 8, display: "block" }} />;
}

// ─── Phi-Time Scheduling Canvas ────────────────────────────────────────────────
function PhiTimeCanvas() {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const cv = ref.current; if (!cv) return;
    const ctx = cv.getContext("2d")!;
    cv.width = 900; cv.height = 200;
    const W = cv.width, H = cv.height;
    let t = 0, raf = 0;
    const PHI = 1.6180339887;
    const T0 = 1;
    const N = 18;
    const phiTimes = Array.from({ length: N }, (_, i) => T0 * Math.pow(PHI, i));
    const maxT = phiTimes[N - 1];
    const regularTimes = Array.from({ length: N }, (_, i) => (i + 1) * (maxT / N));
    const draw = () => {
      ctx.fillStyle = "rgba(2,4,8,0.22)"; ctx.fillRect(0, 0, W, H);
      const pad = 40, trackW = W - pad * 2;
      // Row 1: φ-time (incommensurate)
      const row1y = H * 0.32;
      ctx.fillStyle = V.aurora + "55"; ctx.font = `7px ${V.mono}`; ctx.textAlign = "left";
      ctx.fillText("φ-TIME · t_n = T₀·φⁿ  (INCOMMENSURATE — no resonance lock)", pad, row1y - 14);
      ctx.strokeStyle = V.aurora + "33"; ctx.lineWidth = 1;
      ctx.beginPath(); ctx.moveTo(pad, row1y); ctx.lineTo(pad + trackW, row1y); ctx.stroke();
      phiTimes.forEach((pt, i) => {
        const x = pad + (pt / maxT) * trackW;
        const pulse = 0.4 + 0.5 * Math.abs(Math.sin(t * 0.03 + i * PHI));
        ctx.beginPath(); ctx.arc(x, row1y, 3 + pulse * 3, 0, Math.PI * 2);
        ctx.fillStyle = V.aurora + Math.round(pulse * 200).toString(16).padStart(2, "0"); ctx.fill();
        if (i < 6) { ctx.fillStyle = V.aurora + "66"; ctx.font = `5.5px ${V.mono}`; ctx.textAlign = "center"; ctx.fillText(`φ^${i}`, x, row1y - 10); }
      });
      // Row 2: regular time (resonance lock)
      const row2y = H * 0.68;
      ctx.fillStyle = V.pulse + "55"; ctx.font = `7px ${V.mono}`; ctx.textAlign = "left";
      ctx.fillText("REGULAR TIME · t_n = n·T₀  (COMMENSURATE — resonance lock, catastrophic beating)", pad, row2y - 14);
      ctx.strokeStyle = V.pulse + "33"; ctx.lineWidth = 1;
      ctx.beginPath(); ctx.moveTo(pad, row2y); ctx.lineTo(pad + trackW, row2y); ctx.stroke();
      regularTimes.forEach((rt, i) => {
        const x = pad + (rt / maxT) * trackW;
        const beats = 0.5 + 0.5 * Math.sin(t * 0.05); // resonance beating
        ctx.beginPath(); ctx.arc(x, row2y, 3 + beats * 5, 0, Math.PI * 2);
        ctx.fillStyle = V.pulse + Math.round(beats * 180).toString(16).padStart(2, "0"); ctx.fill();
      });
      // catastrophic beat flash
      const beatAlpha = Math.max(0, Math.sin(t * 0.05) * 0.3);
      ctx.fillStyle = `rgba(255,51,102,${beatAlpha})`;
      ctx.fillRect(pad, row2y - 22, trackW, 44);
      // ratio label
      ctx.fillStyle = V.phi + "99"; ctx.font = `8px ${V.mono}`; ctx.textAlign = "center";
      ctx.fillText(`Interval ratio: φ = ${PHI.toFixed(6)}... (irrational · no two intervals are commensurate)`, W / 2, H - 8);
      t++; raf = requestAnimationFrame(draw);
    };
    draw();
    return () => cancelAnimationFrame(raf);
  }, []);
  return <canvas ref={ref} style={{ width: "100%", height: "auto", borderRadius: 8, display: "block" }} />;
}

// ─── Small helpers ────────────────────────────────────────────────────────────
function EqDivider() {
  return <div style={{ width: "76%", height: 1, background: "linear-gradient(90deg,transparent,rgba(0,255,178,0.18),transparent)", margin: "16px auto" }} />;
}

function ScanlineAnim() {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    let pos = -2;
    let raf = 0;
    const animate = () => {
      pos += 0.3;
      if (pos > 100) pos = -2;
      el.style.top = pos + "%";
      raf = requestAnimationFrame(animate);
    };
    raf = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(raf);
  }, []);
  return <div ref={ref} style={{ position: "absolute", left: 0, right: 0, height: 2, background: "linear-gradient(90deg,transparent,rgba(0,255,178,0.13),transparent)", pointerEvents: "none" }} />;
}

function hexToRgb(hex: string): string {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `${r},${g},${b}`;
}
