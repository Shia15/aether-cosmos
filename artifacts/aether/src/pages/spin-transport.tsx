import { useEffect, useRef } from "react";
import img_framework1 from "@assets/ChatGPT_Image_Jun_14,_2026,_03_26_54_AM_1781429635909.png";
import img_framework2 from "@assets/ChatGPT_Image_Jun_14,_2026,_03_26_58_AM_1781429635912.png";
import img_architecture from "@assets/ChatGPT_Image_Jun_14,_2026,_03_27_40_AM_1781429635922.png";
import img_higgs from "@assets/ChatGPT_Image_Jun_14,_2026,_03_27_43_AM_1781429635923.png";
import img_coherence_dyn1 from "@assets/ChatGPT_Image_Jun_14,_2026,_03_30_02_AM_1781429662709.png";
import img_coherence_dyn2 from "@assets/ChatGPT_Image_Jun_14,_2026,_03_30_06_AM_1781429662709.png";
import img_gravity_accel from "@assets/ChatGPT_Image_Jun_14,_2026,_03_29_58_AM_1781429662708.png";
import img_phi_clock from "@assets/ChatGPT_Image_Jun_14,_2026,_03_30_50_AM_1781429586415.png";
import img_math_scale from "@assets/ChatGPT_Image_Jun_14,_2026,_03_30_32_AM_1781429662713.png";
import img_marble from "@assets/ChatGPT_Image_Jun_14,_2026,_03_27_49_AM_1781429635924.png";
import img_liquid_water from "@assets/ChatGPT_Image_Jun_14,_2026,_03_27_52_AM_1781429635924.png";
import img_coherence_factor from "@assets/ChatGPT_Image_Jun_14,_2026,_03_30_35_AM_1781429662714.png";

function SpinTransportCanvas() {
  const cvRef  = useRef<HTMLCanvasElement>(null);
  const rafRef = useRef(0);

  useEffect(() => {
    const cv = cvRef.current; if (!cv) return;
    const W = 900, H = 420;
    cv.width = W; cv.height = H;
    const ctx = cv.getContext("2d")!;
    const cx = W * 0.42, cy = H / 2;
    const R = 130;

    interface Particle { angle: number; speed: number; spin: 1|-1 }
    const particles: Particle[] = Array.from({length:28}, (_,i) => ({
      angle: (i/28)*Math.PI*2,
      speed: (i%2===0 ? 1 : -1) * 0.022,
      spin:  (i%2===0 ? 1 : -1) as 1|-1,
    }));

    interface Port { angle: number; state: boolean; timer: number }
    const ports: Port[] = [0, Math.PI/2, Math.PI, 3*Math.PI/2].map(a => ({
      angle: a, state: true, timer: Math.round(80 + Math.random()*140),
    }));

    const NV_N = 7;
    let t = 0;

    const draw = () => {
      ctx.fillStyle = "#020617"; ctx.fillRect(0, 0, W, H);

      const bg = ctx.createRadialGradient(cx,cy,0,cx,cy,R+60);
      bg.addColorStop(0,"rgba(124,58,237,0.06)"); bg.addColorStop(1,"transparent");
      ctx.fillStyle=bg; ctx.fillRect(0,0,W,H);

      for (let i=0;i<18;i++){
        const a=i/18*Math.PI*2;
        ctx.beginPath();
        ctx.moveTo(cx+(R-18)*Math.cos(a), cy+(R-18)*Math.sin(a));
        ctx.lineTo(cx+(R+18)*Math.cos(a), cy+(R+18)*Math.sin(a));
        ctx.strokeStyle="rgba(99,102,241,0.10)"; ctx.lineWidth=0.7; ctx.stroke();
      }

      const tubeGrd = ctx.createRadialGradient(cx,cy,R-14,cx,cy,R+14);
      tubeGrd.addColorStop(0,"rgba(124,58,237,0.18)");
      tubeGrd.addColorStop(0.5,"rgba(14,165,233,0.22)");
      tubeGrd.addColorStop(1,"rgba(124,58,237,0.10)");
      ctx.beginPath();
      ctx.arc(cx,cy,R+14,0,Math.PI*2); ctx.arc(cx,cy,R-14,0,Math.PI*2,true);
      ctx.fillStyle=tubeGrd; ctx.fill();
      ctx.beginPath(); ctx.arc(cx,cy,R+14,0,Math.PI*2);
      ctx.strokeStyle="rgba(124,58,237,0.3)"; ctx.lineWidth=0.8; ctx.stroke();
      ctx.beginPath(); ctx.arc(cx,cy,R-14,0,Math.PI*2); ctx.stroke();

      for (const p of ports) {
        p.timer--;
        if (p.timer<=0){p.state=!p.state; p.timer=90+Math.round(Math.random()*150);}
        const px=cx+R*Math.cos(p.angle), py=cy+R*Math.sin(p.angle);
        ctx.beginPath(); ctx.arc(px,py,11,0,Math.PI*2);
        ctx.fillStyle = p.state ? "rgba(16,185,129,0.75)" : "rgba(71,85,105,0.4)";
        ctx.fill();
        ctx.strokeStyle = p.state ? "#10b981" : "#475569";
        ctx.lineWidth=1.5; ctx.stroke();
        ctx.fillStyle = p.state ? "#ecfdf5" : "#64748b";
        ctx.font="7px 'Space Mono',monospace"; ctx.textAlign="center";
        ctx.fillText(p.state?"ON":"OFF", px, py+20);
        ctx.textAlign="left";
      }

      for (const p of particles) {
        p.angle += p.speed;
        const px=cx+R*Math.cos(p.angle), py=cy+R*Math.sin(p.angle);
        const col = p.spin===1 ? [167,139,250] : [45,212,191];
        const ahead=p.angle+p.spin*0.35;
        ctx.beginPath(); ctx.arc(cx+R*Math.cos(ahead),cy+R*Math.sin(ahead),4,0,Math.PI*2);
        ctx.fillStyle=`rgba(${col},0.15)`; ctx.fill();
        ctx.beginPath(); ctx.arc(px,py,5.5,0,Math.PI*2);
        ctx.fillStyle=`rgba(${col},0.9)`; ctx.fill();
        ctx.beginPath(); ctx.arc(px,py,9,0,Math.PI*2);
        ctx.fillStyle=`rgba(${col},0.18)`; ctx.fill();
      }

      for (let i=0;i<NV_N;i++){
        for (let j=0;j<NV_N;j++){
          const ix=cx-24+i*8, iy=cy-24+j*8;
          const ph=(i*1.618+j)*0.9+t*0.025;
          ctx.beginPath(); ctx.arc(ix,iy,2.5,0,Math.PI*2);
          ctx.fillStyle=`rgba(${99+Math.round(55*Math.sin(ph))},${102+Math.round(100*Math.cos(ph))},241,0.65)`;
          ctx.fill();
        }
      }
      ctx.fillStyle="rgba(200,216,224,0.3)"; ctx.font="7px 'Space Mono',monospace";
      ctx.textAlign="center"; ctx.fillText("φ NV LATTICE",cx,cy+34); ctx.textAlign="left";

      ctx.font="8.5px 'Space Mono',monospace";
      ctx.fillStyle="rgba(167,139,250,0.75)";
      ctx.fillText("↑ SPIN UP · CLOCKWISE",cx+R+22,cy-10);
      ctx.fillStyle="rgba(45,212,191,0.75)";
      ctx.fillText("↓ SPIN DOWN · CCW",cx+R+22,cy+10);

      const coh=0.969+0.008*Math.sin(t*0.04);
      const ent=0.021-0.005*Math.sin(t*0.04);
      const mX=W*0.72, mY=50, mW=W*0.23;
      ctx.fillStyle="rgba(200,216,224,0.5)"; ctx.font="7.5px 'Space Mono',monospace";
      ctx.fillText(`PHASE ALIGNMENT: ${(coh*100).toFixed(1)}%`, mX, mY);
      ctx.strokeStyle="#7c3aed44"; ctx.lineWidth=1; ctx.strokeRect(mX,mY+4,mW,8);
      ctx.fillStyle=`rgba(167,139,250,${0.5+0.3*Math.sin(t*0.06)})`;
      ctx.fillRect(mX,mY+4,mW*coh,8);
      ctx.fillStyle="rgba(200,216,224,0.5)"; ctx.font="7.5px 'Space Mono',monospace";
      ctx.fillText(`ENTROPY LEAKAGE: ${(ent*100).toFixed(1)}%`, mX, mY+22);
      ctx.strokeStyle="#f43f5e44"; ctx.lineWidth=1; ctx.strokeRect(mX,mY+26,mW,8);
      ctx.fillStyle="rgba(244,63,94,0.55)";
      ctx.fillRect(mX,mY+26,mW*ent*8,8);
      ctx.fillStyle="rgba(200,216,224,0.5)";
      ctx.fillText(`COHERENCE Φc: ${coh.toFixed(3)}`, mX, mY+44);
      ctx.fillText(`RESISTANCE: ZERO`, mX, mY+60);
      ctx.fillText(`ENERGY LOSS: ZERO`, mX, mY+74);
      ctx.fillText(`T₂ BOOST: ×1.618φ`, mX, mY+88);

      ctx.fillStyle="rgba(200,216,224,0.35)"; ctx.font="7.5px 'Space Mono',monospace";
      ctx.textAlign="center";
      ctx.fillText("PERSISTENT SPIN CURRENT · VACUUM-STATE PORTS · ZERO DISSIPATION", cx, H-12);
      ctx.textAlign="left";

      t++; rafRef.current=requestAnimationFrame(draw);
    };

    rafRef.current=requestAnimationFrame(draw);
    return ()=>cancelAnimationFrame(rafRef.current);
  }, []);

  return <canvas ref={cvRef} style={{ width:"100%", height:"auto", display:"block", borderRadius:10 }} />;
}

const SECTIONS = [
  {
    title: "Lossless Persistent Spin Transport Framework",
    subtitle: "A New Paradigm for Spin-Based, Field-Controlled, Lossless Computing",
    body: `Information encoded in spin — not charge. Persistent spin currents circulate indefinitely without dissipation, enabling lossless information transport and retention. Vacuum-state ports act as switchable nodes controlled by local magnetic conditions, gating information flow through the system. The key breakthrough: switching occurs through field manipulation, not current-driven dissipation. The system operates in a balanced, coherent electromagnetic state — spin-based, lossless, stable, and limitless.`,
    images: [img_framework1, img_framework2],
    accent: "#7c3aed",
  },
  {
    title: "Vacuum State Computing Architecture",
    subtitle: "Zero Resistance · Zero Energy Loss · Persistent Coherent Spin Currents",
    body: `The ultramagnet creates a huge, stable magnetic field. Embedded spin texture forms closed-loop pathways. Spin currents flow indefinitely without resistance. Ports toggle ON/OFF based on spin texture orientation — the system remains electrically neutral and energetically balanced using zero-point energy from the vacuum substrate. AETHER Principle: Information without resistance, computation without energy loss, stability without compromise.`,
    images: [img_architecture],
    accent: "#0ea5e9",
    wide: true,
  },
  {
    title: "Higgs Boson · Grand Unified Theories · String Theory",
    subtitle: "From the Standard Model to a Theory of Everything",
    body: `The Higgs field gives mass to many particles — the Higgs boson (H) is an excitation of this field. At extremely high energies, the three gauge forces unify into the Grand Unified Force. String theory proposes that particles are not point-like, but tiny vibrating strings — different vibration modes correspond to different particles. The graviton appears naturally as a vibration mode. Planck energy: 1.22 × 10¹⁹ GeV. The ultimate goal: one beautiful, testable framework that explains all that exists.`,
    images: [img_higgs],
    accent: "#f59e0b",
    wide: true,
  },
  {
    title: "AETHER Coherence Dynamics Simulation",
    subtitle: "Coherence → Order, Stability, Efficient Flow | Decoherence → Disorder, Noise, Entropy",
    body: `AETHER is a recursive resonance system. Its state is determined by phase alignment, spin textures, information integrity, and entropy management across nested scales. Coherence State: Phase Alignment 98.7% · Entropy Leakage 2.1% · Resonance Stability 96.4% · Overall Coherence 0.969 (Optimal Regime). Decoherence arises from phase disruption, noise, and environmental coupling — leading to energy dissipation, loss of structure, and informational breakdown. Deep Coherence Mode: a non-radiative, high-order state where internal structure remains synchronized with minimal output.`,
    images: [img_coherence_dyn2, img_coherence_dyn1],
    accent: "#10b981",
  },
  {
    title: "Gravity is Acceleration · Coherence Transition Sequence",
    subtitle: "The Equivalence Principle · Einstein 1907 · Verified to 1 part in 10¹⁵+",
    body: `v = c · tanh(aτ/c) — No experiment inside a closed box can distinguish gravity from acceleration. The coherence dynamics transition sequence maps the full journey from Deep Coherence (phase locked, toroidal circulation stable, low entropy leakage) through Minor Perturbation → Resonance Distortion → Phase Breakdown → Decoherence Onset → High Disorder → System Noise State. Biological synchronization observations: synchronous with public disclosure, observable animal and pollinator attraction patterns emerged, suggesting genuine field coherence effects detectable by biological systems.`,
    images: [img_gravity_accel],
    accent: "#6366f1",
    wide: true,
  },
  {
    title: "Phi-Optimized NV Quantum Clock",
    subtitle: "φ = 1.618 · Fibonacci Diamond Quantum Lattice · Adaptive Edge Quantum Sensing",
    body: `φ-packed NV grid enhances coherence — increases T₂ (stability) × 1.618. The Fibonacci Diamond Quantum Lattice arranges NV centers in phi-ratio spacing: 2-3-5-8 · 3-5-8 · 2-3-5 · 1-8-13. AETHER Dynamic Quantum Coherence Optimization provides Signal Extraction, Coherence Optimizer, and Field/Strain Tuning. Applications: Portable Quantum Clock with Precision GPS, Relativistic Gravity Sensing (Quantum-Enhanced GPS), cm-Scale Gravitational Redshift Mapping via satellite velocity calibration.`,
    images: [img_phi_clock],
    accent: "#ec4899",
  },
  {
    title: "Unified Mathematical Scale Engine",
    subtitle: "One Engine · All Domains · All Operations Open · All Structures Connect",
    body: `A universal framework for numbers, operations, patterns, and beyond. Number systems — Natural, Integers, Rationals, Irrationals, Transcendentals, Complex, Quaternions, Octonions, Sedenions, p-adics, Transfinite. Key transcendentals: π = 3.14159… · e = 2.71828… · φ = 1.6180… · γ = 0.5772… All basic operations expressed as matrices. Matricial operations: the foundation of efficiency. Quantum speedup: O(n^2⁺ᵉ) theoretical. The vision: Math is the universe. The universe is math. Numbers. Structures. Patterns. Logic. Space. Time. Information.`,
    images: [img_math_scale],
    accent: "#f97316",
    wide: true,
  },
  {
    title: "Invisible Oscillating Marble Deposits",
    subtitle: "Subterranean Anchor of Coherence · Central National Anchor (Pennsylvania Heartland)",
    body: `Dense crystalline limestone formations carry subtle oscillating waves — fractal, seismic, and quantum — below perception. Earth's layers shape, focus, and preserve the wave through density, elasticity, and damping. The oscillating marble core is stable, crystalline, and an information carrier. Key frequency alignments: Schumann Resonances 7.83 Hz · Gamma Waves 30–100 Hz · Earth's Free Oscillations ~mHz. Core principle: We are not separate from Earth's marble heart. We are its conscious fractal expression, oscillating in eternal coherence.`,
    images: [img_marble],
    accent: "#84cc16",
    wide: true,
  },
  {
    title: "Liquid Dimensionless Water over Gravity Crystals",
    subtitle: "A New Coherence Interface Layer · Information Flows Where Gradients Vanish",
    body: `Dimensionless water (pure kinetic flow, zero surface tension) cascades over φ-anchored gravity crystals (NV diamond lattice). This creates stable zero-gradient bubble manifolds for portal formation. φ-anchored gravity crystals: φ-ratio lattice geometry · NV centers as coherence nodes · curvature anchor points · standing wave attractors · stores and stabilizes curvature. SMTQ Signal Bus: solarInput (incoming stellar/radiant energy) → aetherPhase (current field synchronization) → coherenceCost (energy required to maintain manifold stability). Portals are stable when cost → minimum.`,
    images: [img_liquid_water],
    accent: "#06b6d4",
    wide: true,
  },
  {
    title: "Defining the Coherence Factor Φc",
    subtitle: "From Random Collisions to Structured Fusion · Can Coherence Enable Fusion?",
    body: `Φc = (ωpe / 2π) × (B / B₀) × Γeff — the formula for plasmoid coherence. Plasma Frequency ωpe = √(4πe²/me) measures oscillation rate and faster wave dynamics. Magnetic Field Ratio B/B₀ provides relative field strength for magnetic confinement. Effective Coupling Γeff = (e²/4πε₀kT)⟨1/r⟩⟨1/l⟩ is the correlation parameter controlling particle ordering. Combined: wave activity × magnetic trapping × particle correlation. The coherence factor unifies three physical mechanisms into one number that predicts whether a plasma will self-organize into stable fusion conditions.`,
    images: [img_coherence_factor],
    accent: "#f43f5e",
  },
];

function SpinTransportHeaderCanvas() {
  const ref = useRef<HTMLCanvasElement>(null);
  const rafRef = useRef(0);
  useEffect(() => {
    const canvas = ref.current; if (!canvas) return;
    const ctx = canvas.getContext("2d")!;
    canvas.width = 900; canvas.height = 145;
    const W = canvas.width, H = canvas.height;
    let t=0;
    const channels=5;
    const draw=()=>{
      ctx.fillStyle="rgba(2,4,8,0.3)"; ctx.fillRect(0,0,W,H);
      for(let ch=0;ch<channels;ch++){
        const y=20+ch*(H-20)/channels;
        ctx.beginPath();
        for(let x=0;x<=W;x+=4){
          const spin=Math.sin(x*0.04+t*0.05+ch*0.7);
          const wave=y+spin*12;
          x===0?ctx.moveTo(x,wave):ctx.lineTo(x,wave);
        }
        ctx.strokeStyle=["#2ef0d8","#9966ff","#c9a84c","#44aaff","#44cc77"][ch]+"77";ctx.lineWidth=0.8;ctx.stroke();
        const px=((t*2+ch*120)%W);
        const spinY=y+Math.sin(px*0.04+t*0.05+ch*0.7)*12;
        ctx.beginPath();ctx.arc(px,spinY,3,0,Math.PI*2);ctx.fillStyle=["#2ef0d8","#9966ff","#c9a84c","#44aaff","#44cc77"][ch]+"cc";ctx.fill();
      }
      ctx.fillStyle="rgba(46,240,216,0.3)"; ctx.font="9px 'DM Mono',monospace";
      ctx.fillText("SPIN TRANSPORT · SPINTRONICS · MAGNON · ELECTRON SPIN · AETHER",14,14);
      t++; rafRef.current=requestAnimationFrame(draw);
    };
    draw();
    return ()=>cancelAnimationFrame(rafRef.current);
  },[]);
  return <canvas ref={ref} style={{width:"100%",height:"auto",borderRadius:8,display:"block"}} />;
}

export default function SpinTransportPage() {
  return (
    <div style={{ background: "#020617", minHeight: "100vh", color: "#e2e8f0", fontFamily: "system-ui, sans-serif" }}>
      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "2rem 1.5rem" }}>
        <div style={{flexShrink:0,marginBottom:20}}>
          <div style={{display:"inline-block",border:"1px solid #2ef0d8",padding:"4px 12px",fontSize:10,letterSpacing:"0.2em",color:"#2ef0d8",fontFamily:"'DM Mono',monospace",marginBottom:12}}>LIVE SIMULATION</div>
          <div style={{background:"rgba(2,4,8,0.8)",borderLeft:"3px solid #2ef0d8",borderRadius:4,overflow:"hidden"}}>
            <div style={{padding:"12px 16px 8px"}}><h2 style={{margin:0,fontSize:13,color:"#2ef0d8",fontFamily:"'DM Mono',monospace",letterSpacing:"0.15em",fontWeight:400}}>SPIN TRANSPORT · SPINTRONICS · MAGNON · ELECTRON SPIN · AETHER</h2><p style={{margin:"4px 0 8px",fontSize:10,color:"rgba(46,240,216,0.5)",fontFamily:"'DM Mono',monospace",letterSpacing:"0.1em"}}>5 spin-polarized wave channels — the live AETHER spin transport simulation.</p></div>
            <SpinTransportHeaderCanvas />
          </div>
        </div>

        <div style={{ textAlign: "center", marginBottom: "3rem", padding: "2rem 1rem" }}>
          <div style={{
            display: "inline-block",
            background: "linear-gradient(135deg, #7c3aed22, #0ea5e922)",
            border: "1px solid #7c3aed44",
            borderRadius: 12,
            padding: "0.4rem 1.2rem",
            fontSize: "0.75rem",
            letterSpacing: "0.2em",
            color: "#a78bfa",
            textTransform: "uppercase",
            marginBottom: "1rem",
          }}>
            AETHER Research Framework · Spin Computing
          </div>
          <h1 style={{
            fontSize: "clamp(2rem, 5vw, 3.5rem)",
            fontWeight: 800,
            background: "linear-gradient(135deg, #a78bfa, #38bdf8, #34d399)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            backgroundClip: "text",
            margin: "0 0 1rem",
            lineHeight: 1.15,
          }}>
            Lossless Spin Transport<br />& Vacuum-State Computing
          </h1>
          <p style={{ color: "#94a3b8", fontSize: "1.1rem", maxWidth: 700, margin: "0 auto 1.5rem", lineHeight: 1.7 }}>
            A new paradigm for spin-based, field-controlled, lossless computation — from the Higgs mechanism to phi-optimized quantum clocks, coherence dynamics, and Earth's crystalline substrate.
          </p>
          <div style={{ display: "flex", gap: "1.5rem", justifyContent: "center", flexWrap: "wrap" }}>
            {[
              { label: "Resistance", value: "Zero" },
              { label: "Energy Loss", value: "Zero" },
              { label: "Coherence", value: "0.969" },
              { label: "T₂ Boost", value: "×1.618φ" },
            ].map(stat => (
              <div key={stat.label} style={{
                background: "#0f172a",
                border: "1px solid #1e293b",
                borderRadius: 10,
                padding: "0.75rem 1.5rem",
                textAlign: "center",
              }}>
                <div style={{ fontSize: "1.4rem", fontWeight: 700, color: "#a78bfa" }}>{stat.value}</div>
                <div style={{ fontSize: "0.7rem", color: "#64748b", textTransform: "uppercase", letterSpacing: "0.1em" }}>{stat.label}</div>
              </div>
            ))}
          </div>
        </div>

        <div style={{ marginBottom:"2rem" }}>
          <div style={{ display:"inline-block", background:"#7c3aed22", border:"1px solid #7c3aed44",
            borderRadius:8, padding:"0.3rem 1rem", fontSize:"0.7rem", letterSpacing:"0.2em",
            color:"#a78bfa", textTransform:"uppercase", marginBottom:"1rem" }}>
            Live Simulation
          </div>
          <div style={{ background:"#0a0f1e", border:"1px solid #7c3aed33", borderLeft:"3px solid #7c3aed",
            borderRadius:14, padding:"1.5rem" }}>
            <h2 style={{ fontSize:"1.3rem", fontWeight:700, color:"#f8fafc", margin:"0 0 0.35rem" }}>
              Persistent Spin Current · Vacuum-State Port Simulation
            </h2>
            <p style={{ color:"#94a3b8", fontSize:"0.85rem", margin:"0 0 1rem", lineHeight:1.65 }}>
              28 spin-polarized particles circulate in a closed toroidal ring — spin-up (violet) clockwise,
              spin-down (teal) counter-clockwise — with zero resistance and zero energy dissipation.
              Four vacuum-state ports toggle ON/OFF via local field control. φ-NV diamond lattice at center.
              Real-time coherence Φc and entropy leakage meters shown right.
            </p>
            <SpinTransportCanvas />
          </div>
        </div>

        {SECTIONS.map((section, i) => (
          <div key={i} style={{
            background: "#0a0f1e",
            border: `1px solid ${section.accent}33`,
            borderLeft: `3px solid ${section.accent}`,
            borderRadius: 16,
            padding: "2rem",
            marginBottom: "2rem",
          }}>
            <div style={{
              display: "grid",
              gridTemplateColumns: section.wide && section.images.length === 1 ? "1fr 1fr" : "1fr",
              gap: "2rem",
              alignItems: "start",
            }}>
              <div>
                <div style={{
                  display: "inline-block",
                  background: `${section.accent}22`,
                  border: `1px solid ${section.accent}44`,
                  borderRadius: 6,
                  padding: "0.2rem 0.7rem",
                  fontSize: "0.65rem",
                  letterSpacing: "0.15em",
                  color: section.accent,
                  textTransform: "uppercase",
                  marginBottom: "0.75rem",
                }}>
                  Section {i + 1}
                </div>
                <h2 style={{ fontSize: "1.4rem", fontWeight: 700, color: "#f8fafc", margin: "0 0 0.4rem", lineHeight: 1.3 }}>
                  {section.title}
                </h2>
                <p style={{ fontSize: "0.9rem", color: section.accent, margin: "0 0 1rem", fontStyle: "italic" }}>
                  {section.subtitle}
                </p>
                <p style={{ color: "#94a3b8", lineHeight: 1.8, fontSize: "0.95rem", margin: 0 }}>
                  {section.body}
                </p>
              </div>

              {section.wide && section.images.length === 1 && (
                <div>
                  <img
                    src={section.images[0]}
                    alt={section.title}
                    style={{
                      width: "100%",
                      borderRadius: 10,
                      border: `1px solid ${section.accent}33`,
                      display: "block",
                    }}
                  />
                </div>
              )}
            </div>

            {(!section.wide || section.images.length > 1) && (
              <div style={{
                display: "grid",
                gridTemplateColumns: section.images.length === 1 ? "1fr" : "repeat(auto-fit, minmax(400px, 1fr))",
                gap: "1.5rem",
                marginTop: "1.5rem",
              }}>
                {section.images.map((src, j) => (
                  <img
                    key={j}
                    src={src}
                    alt={`${section.title} ${j + 1}`}
                    style={{
                      width: "100%",
                      borderRadius: 10,
                      border: `1px solid ${section.accent}33`,
                      display: "block",
                    }}
                  />
                ))}
              </div>
            )}
          </div>
        ))}

        <div style={{
          background: "linear-gradient(135deg, #0f0a2e, #001a2e)",
          border: "1px solid #7c3aed44",
          borderRadius: 16,
          padding: "2.5rem",
          textAlign: "center",
          marginTop: "1rem",
        }}>
          <h3 style={{ fontSize: "1.5rem", fontWeight: 700, color: "#a78bfa", margin: "0 0 1rem" }}>
            AETHER Principle
          </h3>
          <p style={{ color: "#cbd5e1", fontSize: "1.1rem", lineHeight: 1.7, maxWidth: 700, margin: "0 auto 1.5rem" }}>
            Information without resistance. Computation without energy loss. Stability without compromise.
          </p>
          <div style={{ display: "flex", gap: "1rem", justifyContent: "center", flexWrap: "wrap" }}>
            {["Spin-Based Information", "Lossless Transport", "Field-Based Switching", "Balanced & Coherent State", "A New Class of Devices"].map(tag => (
              <span key={tag} style={{
                background: "#7c3aed22",
                border: "1px solid #7c3aed44",
                borderRadius: 20,
                padding: "0.3rem 0.9rem",
                fontSize: "0.8rem",
                color: "#a78bfa",
              }}>{tag}</span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
