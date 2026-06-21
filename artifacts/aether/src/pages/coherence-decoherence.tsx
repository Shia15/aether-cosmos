import coherentCancerCare from "@assets/8C4BA75D-7FCC-429F-9202-61503AC85C19_1781446780853.png";
import aetherResonanceEngine from "@assets/994704D2-1196-44A8-9F1A-B709EDC5CCB6_1781446780853.png";
import universeArchive from "@assets/7CE2D364-23F2-4130-87AC-50FE500A45EB_1781446780853.png";
import fractalLight from "@assets/22BE668C-ACD4-4C99-A934-49AE8E9925BC_1781446780853.png";
import backwardsWaves from "@assets/FDD48C65-CEF2-4773-8A49-B923F4D4592A_1781446780853.png";
import dynamicAdaptive from "@assets/4B792D20-1118-4E06-B9A1-77FD1FDAEB3D_1781446780853.png";
import solarNeural1 from "@assets/DE78871E-EA85-4C52-BB6F-1645DBB84DD7_1781446780853.png";
import solarNeural2 from "@assets/533761B4-974D-4AE4-AA14-06CF1286A280_1781446780853.png";

import { useEffect, useRef, useState } from "react";

const TABS = [
  { id: "healing",   label: "Coherent Healing" },
  { id: "decohere",  label: "Decoherence & Information" },
  { id: "adaptive",  label: "Dynamic Adaptive Systems" },
  { id: "solar",     label: "Solar-Neural Interface" },
] as const;

type TabId = (typeof TABS)[number]["id"];

const CD_B = {
  bg:"#070918", ink:"#E7ECF7", dim:"#9AA3B8", panel:"rgba(255,255,255,0.04)",
  line:"rgba(255,255,255,0.10)", gold:"#E6B85C", cyan:"#7CD7FF", violet:"#B49CFF", rose:"#F49AB6",
};

function CoherenceWaveCanvas() {
  const cvRef = useRef<HTMLCanvasElement>(null);
  const rafRef = useRef(0);
  const tRef = useRef(0);
  const W = 860, H = 240;
  useEffect(() => {
    const cv = cvRef.current; if (!cv) return;
    const ctx = cv.getContext("2d"); if (!ctx) return;
    cv.width = W; cv.height = H;
    function draw() {
      ctx.clearRect(0, 0, W, H);
      ctx.fillStyle = "#070918"; ctx.fillRect(0, 0, W, H);
      const t = tRef.current;
      const midY = H / 2;
      const halfW = W / 2;
      const sigma0 = 30 + 15 * Math.sin(t * 0.005);
      const spread = 1 + (t * 0.008) % 3;
      for (let side = 0; side < 2; side++) {
        const xOffset = side * halfW;
        const sigmaEff = side === 0 ? sigma0 : sigma0 * spread;
        const color = side === 0 ? CD_B.cyan : CD_B.rose;
        const label = side === 0 ? "COHERENT" : "DECOHERENT";
        ctx.fillStyle = color + "55";
        ctx.font = "8px 'Space Mono', monospace";
        ctx.fillText(label, xOffset + 10, 18);
        ctx.beginPath();
        for (let x = 0; x < halfW; x++) {
          const relX = x - halfW / 2;
          const envelope = Math.exp(-(relX * relX) / (2 * sigmaEff * sigmaEff));
          const wave = Math.sin((x / halfW) * Math.PI * 8 - t * 0.06);
          const y = midY + wave * 80 * envelope;
          if (x === 0) ctx.moveTo(xOffset + x, y); else ctx.lineTo(xOffset + x, y);
        }
        ctx.strokeStyle = color;
        ctx.lineWidth = 1.8;
        ctx.stroke();
        ctx.beginPath();
        for (let x = 0; x < halfW; x++) {
          const relX = x - halfW / 2;
          const envelope = Math.exp(-(relX * relX) / (2 * sigmaEff * sigmaEff));
          const y = midY - envelope * 80;
          if (x === 0) ctx.moveTo(xOffset + x, y); else ctx.lineTo(xOffset + x, y);
        }
        ctx.beginPath();
        for (let x = 0; x < halfW; x++) {
          const relX = x - halfW / 2;
          const envelope = Math.exp(-(relX * relX) / (2 * sigmaEff * sigmaEff));
          const yTop = midY - envelope * 80;
          const yBot = midY + envelope * 80;
          if (x === 0) { ctx.moveTo(xOffset + x, yTop); } else { ctx.lineTo(xOffset + x, yTop); }
          if (x === halfW - 1) {
            for (let rx = halfW - 1; rx >= 0; rx--) {
              const rrelX = rx - halfW / 2;
              const renv = Math.exp(-(rrelX * rrelX) / (2 * sigmaEff * sigmaEff));
              ctx.lineTo(xOffset + rx, midY + renv * 80);
            }
          }
        }
        ctx.fillStyle = color + "11";
        ctx.fill();
      }
      ctx.strokeStyle = "rgba(255,255,255,0.08)";
      ctx.lineWidth = 1;
      ctx.beginPath(); ctx.moveTo(halfW, 0); ctx.lineTo(halfW, H); ctx.stroke();
      ctx.strokeStyle = "rgba(255,255,255,0.06)";
      ctx.beginPath(); ctx.moveTo(0, midY); ctx.lineTo(W, midY); ctx.stroke();
      ctx.fillStyle = CD_B.dim + "66";
      ctx.font = "8px 'Space Mono', monospace";
      ctx.fillText("QUANTUM COHERENCE vs DECOHERENCE · GAUSSIAN WAVE PACKET", 10, H - 10);
      tRef.current += 0.5;
      rafRef.current = requestAnimationFrame(draw);
    }
    draw();
    return () => cancelAnimationFrame(rafRef.current);
  }, []);
  return <canvas ref={cvRef} style={{ width:"100%", height:"auto", display:"block", borderRadius:6 }} />;
}

export default function CoherenceDecoherencePage() {
  const [active, setActive] = useState<TabId>("healing");

  return (
    <div style={{ background: "#020617", minHeight: "100vh", color: "#e2e8f0", fontFamily: "system-ui, sans-serif" }}>
      {/* Header */}
      <div style={{ background: "linear-gradient(135deg, #0f172a 0%, #1e1b4b 50%, #0f172a 100%)", borderBottom: "1px solid #312e81", padding: "2.5rem 2rem 2rem" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "0.75rem" }}>
            <span style={{ fontSize: "1.75rem" }}>🌀</span>
            <span style={{ fontSize: "0.75rem", letterSpacing: "0.2em", color: "#818cf8", textTransform: "uppercase", fontWeight: 600 }}>AETHER · Coherence Framework</span>
          </div>
          <h1 style={{ fontSize: "clamp(1.6rem, 4vw, 2.6rem)", fontWeight: 800, margin: "0 0 0.5rem", background: "linear-gradient(135deg, #c7d2fe, #a78bfa, #818cf8)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
            Coherence &amp; Decoherence
          </h1>
          <p style={{ color: "#94a3b8", fontSize: "1rem", margin: 0, maxWidth: 680 }}>
            From cellular resonance to universal information archives — how coherence shapes healing, consciousness, and the structure of reality across every scale.
          </p>
        </div>
      </div>

      <div style={{ padding:"0 2rem 1.5rem", maxWidth:1100, margin:"0 auto" }}>
        <div style={{ display:"inline-block", background:"rgba(124,215,255,0.08)", border:"1px solid rgba(124,215,255,0.25)",
          borderRadius:8, padding:"0.3rem 1rem", fontSize:"0.7rem", letterSpacing:"0.2em",
          color:CD_B.cyan, textTransform:"uppercase", fontFamily:"'Space Mono',monospace", marginBottom:12 }}>
          Live Simulation
        </div>
        <div style={{ background:CD_B.panel, border:`1px solid ${CD_B.line}`, borderLeft:`3px solid ${CD_B.cyan}`,
          borderRadius:10, padding:20 }}>
          <h2 style={{ fontFamily:'"Cinzel",serif', fontSize:18, color:CD_B.ink, margin:"0 0 6px", fontVariant:"small-caps" }}>
            Quantum Coherence vs Decoherence · Gaussian Wave Packet
          </h2>
          <p style={{ fontFamily:"Inter,sans-serif", fontSize:12, color:CD_B.dim, margin:"0 0 14px", lineHeight:1.65 }}>
            Left (cyan): a tight coherent Gaussian wave packet — well-defined position and phase. Right (rose):
            the same packet after environmental interaction — spread wider, phase randomized. The dividing line
            is the decoherence boundary; the Gaussian envelope fills in as quantum information leaks to the environment.
          </p>
          <CoherenceWaveCanvas />
        </div>
      </div>

      {/* Tab Bar */}
      <div style={{ background: "#0f172a", borderBottom: "1px solid #1e293b", padding: "0 2rem" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto", display: "flex", gap: "0.25rem", overflowX: "auto" }}>
          {TABS.map((t) => (
            <button
              key={t.id}
              onClick={() => setActive(t.id)}
              style={{
                padding: "0.85rem 1.25rem",
                border: "none",
                borderBottom: active === t.id ? "2px solid #818cf8" : "2px solid transparent",
                background: "transparent",
                color: active === t.id ? "#c7d2fe" : "#64748b",
                fontWeight: active === t.id ? 700 : 400,
                fontSize: "0.875rem",
                cursor: "pointer",
                whiteSpace: "nowrap",
                transition: "all 0.2s",
              }}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "2rem" }}>

        {/* ── Tab 1: Coherent Healing ── */}
        {active === "healing" && (
          <div>
            <div style={{ marginBottom: "1.5rem" }}>
              <h2 style={{ fontSize: "1.4rem", fontWeight: 700, color: "#c7d2fe", margin: "0 0 0.4rem" }}>Coherent Healing Systems</h2>
              <p style={{ color: "#94a3b8", margin: 0, fontSize: "0.95rem" }}>
                Unifying human biology, AI, and resonance technology to create the optimal conditions for healing — where coherence becomes the cure.
              </p>
            </div>

            {/* Coherent Cancer Care */}
            <div style={{ background: "#0f172a", border: "1px solid #1e293b", borderLeft: "4px solid #818cf8", borderRadius: "0.75rem", padding: "1.5rem", marginBottom: "1.5rem" }}>
              <h3 style={{ color: "#a78bfa", fontSize: "1.1rem", fontWeight: 700, margin: "0 0 0.5rem" }}>Coherent Cancer Care · Unified Human + AI + Robotics Ecosystem</h3>
              <p style={{ color: "#94a3b8", fontSize: "0.875rem", margin: "0 0 1rem", lineHeight: 1.6 }}>
                A mathematically coherent model of the whole patient — continuous patient timelines, family observation layers, AI pattern recognition, adaptive care routing, and robotics working as a single resonant system. The Patient Coherence Model: <code style={{ color: "#c7d2fe", background: "#1e1b4b", padding: "0.1rem 0.4rem", borderRadius: 4 }}>C(t) = f(B(t), G(t), E(t), T(t), F(t), S(t))</code>
              </p>
              <img src={coherentCancerCare} alt="Coherent Cancer Care — Unified Human AI Robotics Ecosystem" style={{ width: "100%", borderRadius: "0.5rem", border: "1px solid #1e293b" }} />
              <div style={{ marginTop: "1rem", display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "0.75rem" }}>
                {[
                  ["Continuous Patient Timeline", "Dynamic data streams create a real-time coherence map of the patient"],
                  ["Family Observation Layer", "Family becomes a structured part of the care team via live input app"],
                  ["AI Pattern Recognition", "Detects deterioration early, correlates events, predicts complications"],
                  ["Adaptive Care Routing", "Right information to right people at the right time — fewer ER visits"],
                  ["Robotics + Intelligent Systems", "Care Companion, Lab, Surgical, Logistics, and Monitoring Robots"],
                  ["Human-Centered Interface", "Simple. Supportive. Accessible. Multi-language. Low burden."],
                ].map(([title, desc]) => (
                  <div key={title} style={{ background: "#1e1b4b22", border: "1px solid #312e81", borderRadius: "0.5rem", padding: "0.75rem" }}>
                    <div style={{ color: "#c7d2fe", fontSize: "0.8rem", fontWeight: 700, marginBottom: "0.25rem" }}>{title}</div>
                    <div style={{ color: "#94a3b8", fontSize: "0.75rem", lineHeight: 1.5 }}>{desc}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* AETHER Resonance Engine */}
            <div style={{ background: "#0f172a", border: "1px solid #1e293b", borderLeft: "4px solid #7c3aed", borderRadius: "0.75rem", padding: "1.5rem" }}>
              <h3 style={{ color: "#a78bfa", fontSize: "1.1rem", fontWeight: 700, margin: "0 0 0.5rem" }}>AETHER Resonance Engine · Coherent Harmonic Optimization</h3>
              <p style={{ color: "#94a3b8", fontSize: "0.875rem", margin: "0 0 1rem", lineHeight: 1.6 }}>
                Creating ultimate resonant conditions for cellular harmony, healing, and regenerative intelligence. Multi-layered bioelectric, biochemical, cellular, environmental, lifestyle, and emotional inputs feed the AETHER Analytic Core — producing an adaptive feedback loop of Measure → Analyze → Optimize → Apply → Evaluate → Evolve.
              </p>
              <img src={aetherResonanceEngine} alt="AETHER Resonance Engine — Coherent Harmonic Optimization" style={{ width: "100%", borderRadius: "0.5rem", border: "1px solid #1e293b" }} />
              <div style={{ marginTop: "1rem", display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "0.75rem" }}>
                {[
                  ["Bioelectric Resonance", "Cellular signaling harmonization"],
                  ["Photonic Resonance", "Light-frequency optimization"],
                  ["Sound & Vibration", "Tissue and water cymatics alignment"],
                  ["Geomagnetic Resonance", "Earth's field coherence"],
                  ["Biochemical Resonance", "pH, redox, and metabolic balance"],
                  ["Neuro-Emotional Resonance", "Nervous system regulation"],
                  ["Cellular Coherence", "Restored communication & function"],
                  ["Tissue Regeneration", "Enhanced repair & regenerative signaling"],
                ].map(([title, desc]) => (
                  <div key={title} style={{ background: "#16123a22", border: "1px solid #312e81", borderRadius: "0.5rem", padding: "0.75rem" }}>
                    <div style={{ color: "#c7d2fe", fontSize: "0.8rem", fontWeight: 700, marginBottom: "0.25rem" }}>{title}</div>
                    <div style={{ color: "#94a3b8", fontSize: "0.75rem", lineHeight: 1.5 }}>{desc}</div>
                  </div>
                ))}
              </div>
              <div style={{ marginTop: "1rem", background: "#1e1b4b33", border: "1px solid #312e81", borderRadius: "0.5rem", padding: "1rem", fontSize: "0.875rem", color: "#c7d2fe", fontStyle: "italic", textAlign: "center" }}>
                "The body is not a machine to be fixed, but a symphony to be re-tuned. When resonance is restored, healing becomes inevitable."
              </div>
            </div>
          </div>
        )}

        {/* ── Tab 2: Decoherence & Information ── */}
        {active === "decohere" && (
          <div>
            <div style={{ marginBottom: "1.5rem" }}>
              <h2 style={{ fontSize: "1.4rem", fontWeight: 700, color: "#c7d2fe", margin: "0 0 0.4rem" }}>Decoherence &amp; Universal Information</h2>
              <p style={{ color: "#94a3b8", margin: 0, fontSize: "0.95rem" }}>
                Information is never destroyed — only transformed or distributed. The universe encodes its entire history in light, entropy, and field interactions.
              </p>
            </div>

            {/* Universe as Archive */}
            <div style={{ background: "#0f172a", border: "1px solid #1e293b", borderLeft: "4px solid #f59e0b", borderRadius: "0.75rem", padding: "1.5rem", marginBottom: "1.5rem" }}>
              <h3 style={{ color: "#fcd34d", fontSize: "1.1rem", fontWeight: 700, margin: "0 0 0.5rem" }}>The Universe as an Archive of Information · The Past is Not Lost — It is Distributed</h3>
              <p style={{ color: "#94a3b8", fontSize: "0.875rem", margin: "0 0 1rem", lineHeight: 1.6 }}>
                Light echoes in astronomy, fossilized magnetic fields, cosmic microwave background, quantum correlations, and thermal residue patterns — the present contains geometric residues of the past, encoded through light, entropy, and field interactions. Backward Decoherence reconstructs earlier coherent states from present information traces.
              </p>
              <img src={universeArchive} alt="The Universe as an Archive of Information" style={{ width: "100%", borderRadius: "0.5rem", border: "1px solid #1e293b" }} />
              <div style={{ marginTop: "1rem", display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "0.75rem" }}>
                {[
                  ["Distributed Information", "Information is scattered and decohered but never erased"],
                  ["Enhance Patterns", "Identify interference structures, correlations, and residues"],
                  ["Phase Alignment", "Reconstruct phase relationships via inverse problem"],
                  ["Coherence Restored", "Information recombines into earlier coherent states"],
                  ["Earlier State Reconstructed", "A closer approximation of the past emerges from present"],
                  ["Light as Historical Carrier", "Every photon is a messenger of what it has interacted with"],
                ].map(([title, desc]) => (
                  <div key={title} style={{ background: "#1c170022", border: "1px solid #78350f", borderRadius: "0.5rem", padding: "0.75rem" }}>
                    <div style={{ color: "#fcd34d", fontSize: "0.8rem", fontWeight: 700, marginBottom: "0.25rem" }}>{title}</div>
                    <div style={{ color: "#94a3b8", fontSize: "0.75rem", lineHeight: 1.5 }}>{desc}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Fractal Language of Light */}
            <div style={{ background: "#0f172a", border: "1px solid #1e293b", borderLeft: "4px solid #06b6d4", borderRadius: "0.75rem", padding: "1.5rem", marginBottom: "1.5rem" }}>
              <h3 style={{ color: "#67e8f9", fontSize: "1.1rem", fontWeight: 700, margin: "0 0 0.5rem" }}>The Fractal Language of Light · From Color to Coherence · From Symmetry to Fibonacci Time</h3>
              <p style={{ color: "#94a3b8", fontSize: "0.875rem", margin: "0 0 1rem", lineHeight: 1.6 }}>
                Light is not 3 colors — it is a continuum of frequencies. The Unifying Equation: <code style={{ color: "#67e8f9", background: "#0c4a6e22", padding: "0.1rem 0.4rem", borderRadius: 4 }}>I = ∫∫∫∫∫ C(λ,φ,S,T) Φ(λ,φ,S,T) dλ dφ dS dT</code> — Information arises from the dance of Spectrum, Phase, Symmetry, Coherence, Scale, and Time.
              </p>
              <img src={fractalLight} alt="The Fractal Language of Light" style={{ width: "100%", borderRadius: "0.5rem", border: "1px solid #1e293b" }} />
              <div style={{ marginTop: "1rem", display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(185px, 1fr))", gap: "0.75rem" }}>
                {[
                  ["RGB → Thinner Colors", "Light is a continuum — hyperspectral hundreds to thousands of narrow bands"],
                  ["Decoherence of Light", "Light entering a medium loses coherence in layers — distributed, not lost"],
                  ["Symmetry Fraction", "Φₛ = Symmetric/Total → higher symmetry reveals deeper information access"],
                  ["Fibonacci Structures", "Natural light patterns follow Fibonacci ratios — galaxy, nautilus, sunflower"],
                  ["Phase Gate Measurement", "Blue-purple wavelengths carry highest spatial frequency information"],
                  ["Fractal Reconstruction", "Raw Capture → Spectral Decomp → Phase Retrieval → Fibonacci Rebuild"],
                ].map(([title, desc]) => (
                  <div key={title} style={{ background: "#0c4a6e22", border: "1px solid #164e63", borderRadius: "0.5rem", padding: "0.75rem" }}>
                    <div style={{ color: "#67e8f9", fontSize: "0.8rem", fontWeight: 700, marginBottom: "0.25rem" }}>{title}</div>
                    <div style={{ color: "#94a3b8", fontSize: "0.75rem", lineHeight: 1.5 }}>{desc}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Backwards the Waves */}
            <div style={{ background: "#0f172a", border: "1px solid #1e293b", borderLeft: "4px solid #10b981", borderRadius: "0.75rem", padding: "1.5rem" }}>
              <h3 style={{ color: "#6ee7b7", fontSize: "1.1rem", fontWeight: 700, margin: "0 0 0.5rem" }}>Backwards the Waves · Speak &amp; Understand · 5D Space Wave Mechanics</h3>
              <p style={{ color: "#94a3b8", fontSize: "0.875rem", margin: "0 0 1rem", lineHeight: 1.6 }}>
                Back-propagated acoustic waves decode and communicate across frequencies, dimensions, and environments. Mass is a wave interference pattern in 5D space — materializing (in-phase), dematerializing (out-of-phase), and rematerializing (re-phase). By restricting and conserving space, we manipulate gravity. The entropy control axis lets us delay, accelerate, or modulate entropy to control the lifecycle of systems and matter.
              </p>
              <img src={backwardsWaves} alt="Backwards The Waves — 5D Space Waves and Entropy" style={{ width: "100%", borderRadius: "0.5rem", border: "1px solid #1e293b" }} />
              <div style={{ marginTop: "1rem", display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(190px, 1fr))", gap: "0.75rem" }}>
                {[
                  ["Entropy Control Axis", "Low Entropy = Coherence (preserved) → Modulated → High Entropy = Chaos (lost)"],
                  ["5D Space Wave Lattice", "Mass phase states: Materialized · Dematerialized · Rematerializing"],
                  ["Space Restriction = Gravity", "Compression → Gravity Increase / Expansion → Gravity Decrease"],
                  ["Back-Propagated Waves", "Reverse-engineered waveforms for two-way communication beyond boundaries"],
                  ["Practical Applications", "Gravity Modulation · Mass Cloaking · Interdimensional Travel · Energy Conservation"],
                  ["The Cycle", "Wave Emission → Phase Shift 5D → Mass Disappears → Space Conserved → Reappears"],
                ].map(([title, desc]) => (
                  <div key={title} style={{ background: "#052e1622", border: "1px solid #064e3b", borderRadius: "0.5rem", padding: "0.75rem" }}>
                    <div style={{ color: "#6ee7b7", fontSize: "0.8rem", fontWeight: 700, marginBottom: "0.25rem" }}>{title}</div>
                    <div style={{ color: "#94a3b8", fontSize: "0.75rem", lineHeight: 1.5 }}>{desc}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ── Tab 3: Dynamic Adaptive Systems ── */}
        {active === "adaptive" && (
          <div>
            <div style={{ marginBottom: "1.5rem" }}>
              <h2 style={{ fontSize: "1.4rem", fontWeight: 700, color: "#c7d2fe", margin: "0 0 0.4rem" }}>Dynamic Adaptive Frequency Coherence</h2>
              <p style={{ color: "#94a3b8", margin: 0, fontSize: "0.95rem" }}>
                Continuously sensing and modeling environmental conditions and biological state to find the optimal resonant environment for DNA repair, coherence, and healing.
              </p>
            </div>

            <div style={{ background: "#0f172a", border: "1px solid #1e293b", borderLeft: "4px solid #22c55e", borderRadius: "0.75rem", padding: "1.5rem", marginBottom: "1.5rem" }}>
              <h3 style={{ color: "#86efac", fontSize: "1.1rem", fontWeight: 700, margin: "0 0 0.5rem" }}>Dynamic Adaptive Frequency Coherence System · Environment · Resonance · Biology · Mathematics · Healing</h3>
              <p style={{ color: "#94a3b8", fontSize: "0.875rem", margin: "0 0 1rem", lineHeight: 1.6 }}>
                The body is a dynamic adaptive oscillator system — when environmental frequencies and conditions are coherent with biology and DNA, healing becomes efficient, natural, and accelerated. Multi-variable system model: <code style={{ color: "#86efac", background: "#052e1622", padding: "0.1rem 0.4rem", borderRadius: 4 }}>State_bio(t) = f(P, T, H, EM, S, O₂, G, ω)</code> with a dynamical systems approach: <code style={{ color: "#86efac", background: "#052e1622", padding: "0.1rem 0.4rem", borderRadius: 4 }}>dΨ/dt = -∇V_env(Ψ, G) + λR(Ω, P, T, EM, S)</code>
              </p>
              <img src={dynamicAdaptive} alt="Dynamic Adaptive Frequency Coherence System" style={{ width: "100%", borderRadius: "0.5rem", border: "1px solid #1e293b" }} />
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: "1rem" }}>
              {/* Environmental Conditions */}
              <div style={{ background: "#0f172a", border: "1px solid #1e293b", borderRadius: "0.75rem", padding: "1.25rem" }}>
                <h4 style={{ color: "#86efac", fontSize: "0.95rem", fontWeight: 700, margin: "0 0 0.75rem" }}>🌍 Environmental Conditions Monitored</h4>
                {[
                  ["High Altitude · Low Pressure", "↓ Pressure · ↓ Oxygen · Cold/Dry · High UV"],
                  ["Temperate · Balanced", "Optimal Pressure · Moderate Temp · Good Coherence"],
                  ["Storm · Low Pressure System", "↓ Pressure · High Winds · Inflammation Reduced"],
                  ["Humid · Low Light", "High Humidity · Lower Oxygen · Mold/Toxins"],
                  ["Electromagnetic Disturbance", "High EMF · Artificial Signals · Sleep Disruption · Stress"],
                ].map(([env, effect]) => (
                  <div key={env} style={{ marginBottom: "0.5rem", paddingBottom: "0.5rem", borderBottom: "1px solid #1e293b" }}>
                    <div style={{ color: "#d1fae5", fontSize: "0.8rem", fontWeight: 600 }}>{env}</div>
                    <div style={{ color: "#94a3b8", fontSize: "0.75rem" }}>{effect}</div>
                  </div>
                ))}
              </div>

              {/* Continuous Biosensing */}
              <div style={{ background: "#0f172a", border: "1px solid #1e293b", borderRadius: "0.75rem", padding: "1.25rem" }}>
                <h4 style={{ color: "#86efac", fontSize: "0.95rem", fontWeight: 700, margin: "0 0 0.75rem" }}>❤️ Continuous Biosensing</h4>
                {[
                  "Heart Rate Variability",
                  "Respiration Rate / Depth",
                  "EEG Brain Waves",
                  "Blood Oxygen (SpO₂)",
                  "Body Temperature",
                  "Cortisol (Stress)",
                  "Inflammation Markers",
                  "Sleep Quality",
                  "HR Coherence",
                ].map((item) => (
                  <div key={item} style={{ color: "#94a3b8", fontSize: "0.8rem", padding: "0.3rem 0", borderBottom: "1px solid #1e293b1a" }}>
                    • {item}
                  </div>
                ))}
              </div>

              {/* Adaptive Feedback */}
              <div style={{ background: "#0f172a", border: "1px solid #1e293b", borderRadius: "0.75rem", padding: "1.25rem" }}>
                <h4 style={{ color: "#86efac", fontSize: "0.95rem", fontWeight: 700, margin: "0 0 0.75rem" }}>🔄 Adaptive Feedback System</h4>
                {[
                  ["Sound Frequency Modulation", "Cymatics alignment"],
                  ["Light Spectrum Tuning", "Photonic resonance"],
                  ["Pressure / Oxygen Optimization", "Cellular oxygenation"],
                  ["Thermal Regulation", "Body temperature coherence"],
                  ["Breathing Rhythm Guidance", "Nervous system coherence"],
                  ["Movement / Vibration Therapy", "Physical resonance"],
                  ["EMF Harmonization", "Geomagnetic alignment"],
                ].map(([method, desc]) => (
                  <div key={method} style={{ marginBottom: "0.5rem", paddingBottom: "0.5rem", borderBottom: "1px solid #1e293b" }}>
                    <div style={{ color: "#d1fae5", fontSize: "0.8rem", fontWeight: 600 }}>{method}</div>
                    <div style={{ color: "#94a3b8", fontSize: "0.75rem" }}>{desc}</div>
                  </div>
                ))}
              </div>
            </div>

            <div style={{ marginTop: "1rem", background: "#052e1622", border: "1px solid #064e3b", borderRadius: "0.75rem", padding: "1rem" }}>
              <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap", justifyContent: "center", fontSize: "0.875rem" }}>
                {["Coherence Creates Order", "→", "Order Enables Repair", "→", "Repair Restores Vitality"].map((step) => (
                  <span key={step} style={{ color: step === "→" ? "#64748b" : "#86efac", fontWeight: step === "→" ? 400 : 700 }}>{step}</span>
                ))}
              </div>
              <div style={{ marginTop: "0.75rem", textAlign: "center", color: "#64748b", fontSize: "0.8rem" }}>
                Continuous Closed-Loop Adaptation: Sense → Model → Optimize → Apply → Observe → Learn → Adapt
              </div>
            </div>
          </div>
        )}

        {/* ── Tab 4: Solar-Neural Interface ── */}
        {active === "solar" && (
          <div>
            <div style={{ marginBottom: "1.5rem" }}>
              <h2 style={{ fontSize: "1.4rem", fontWeight: 700, color: "#c7d2fe", margin: "0 0 0.4rem" }}>Direct Solar-to-Neural Interface</h2>
              <p style={{ color: "#94a3b8", margin: 0, fontSize: "0.95rem" }}>
                Sunlight is not just energy — it is information, intelligence, and life. The Sun does not just shine on us — it thinks us. ~800 GPCRs act as tunable receivers. Retinol (Vitamin A derivative) is the chromophore linking light to chemistry.
              </p>
            </div>

            {/* Image 1 */}
            <div style={{ background: "#0f172a", border: "1px solid #1e293b", borderLeft: "4px solid #f97316", borderRadius: "0.75rem", padding: "1.5rem", marginBottom: "1.5rem" }}>
              <h3 style={{ color: "#fdba74", fontSize: "1.1rem", fontWeight: 700, margin: "0 0 0.5rem" }}>Σₛ [Solar] Input → Retinol → GPCRs → Chemistry → Neural Computation → Consciousness</h3>
              <p style={{ color: "#94a3b8", fontSize: "0.875rem", margin: "0 0 1rem", lineHeight: 1.6 }}>
                The Sun emits a dynamic spectrum of photons (X-ray, UV, Vis, IR, coherent fields). The eye and potentially skin/microtubules serve as living transducers. Retinol isomerizes upon photon absorption, changing shape and initiating a chemical signal — the molecular switch that converts light into chemistry. ~800 GPCRs (G Protein-Coupled Receptors) create a vast receptor spectrum tunable by light, chemistry, and fields.
              </p>
              <img src={solarNeural1} alt="Direct Solar-to-Neural Interface — Retinol and GPCRs" style={{ width: "100%", borderRadius: "0.5rem", border: "1px solid #1e293b" }} />
              <div style={{ marginTop: "1rem", display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "0.75rem" }}>
                {[
                  ["Σₛ Solar Input", "Dynamic spectrum: X-ray, UV, Vis, IR, and coherent fields"],
                  ["Living Transducer", "Eye + skin + microtubules convert solar energy to biochemical signals"],
                  ["Retinol Chromophore", "11-cis-RETINAL (inactive) + photon → ALL-TRANS-RETINAL (active)"],
                  ["~800 GPCRs", "Largest receptor family in human biology — tunable by light and chemistry"],
                  ["Signaling Cascade", "GPCR → G proteins → second messengers → ion channels → synaptic transmission"],
                  ["Schumann Resonances", "7.83, 14.07, 20.32, 26.56, 33.81 Hz entrain biological rhythms and brainwaves"],
                ].map(([title, desc]) => (
                  <div key={title} style={{ background: "#431a0122", border: "1px solid #7c2d12", borderRadius: "0.5rem", padding: "0.75rem" }}>
                    <div style={{ color: "#fdba74", fontSize: "0.8rem", fontWeight: 700, marginBottom: "0.25rem" }}>{title}</div>
                    <div style={{ color: "#94a3b8", fontSize: "0.75rem", lineHeight: 1.5 }}>{desc}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Image 2 — Coherence and Decoherence + Dark Matter Filament Web */}
            <div style={{ background: "#0f172a", border: "1px solid #1e293b", borderLeft: "4px solid #ec4899", borderRadius: "0.75rem", padding: "1.5rem" }}>
              <h3 style={{ color: "#f9a8d4", fontSize: "1.1rem", fontWeight: 700, margin: "0 0 0.5rem" }}>Coherence &amp; Decoherence · The Dark Matter Filament Web · Extended Mind &amp; Consciousness</h3>
              <p style={{ color: "#94a3b8", fontSize: "0.875rem", margin: "0 0 1rem", lineHeight: 1.6 }}>
                The Universe is a living network. Dark matter filaments form the cosmic scaffold for energy, information, and consciousness. Coherent filaments: high coherence, low entropy, constructive interference, information flow, creation, growth, integration. Decoherent filaments: low coherence, high entropy, destructive interference, information loss, disorder, isolation, decay. The Extended Mind: telepathy as the natural communication of coherent minds.
              </p>
              <img src={solarNeural2} alt="Coherence Decoherence Dark Matter Filament Web and Solar Neural Interface" style={{ width: "100%", borderRadius: "0.5rem", border: "1px solid #1e293b" }} />
              <div style={{ marginTop: "1rem", display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "0.75rem" }}>
                {[
                  ["Coherent Filaments", "High coherence · Low entropy · Constructive interference · Information flow · Growth"],
                  ["Decoherent Filaments", "Low coherence · High entropy · Destructive interference · Information loss · Decay"],
                  ["The Extended Mind", "Coherent fields allow information to couple across brains, bodies, and environments"],
                  ["The Feeling of Being Stared At", "Your nervous system detects subtle field, attention, and intention shifts before conscious mind"],
                  ["Full Chain", "Σₛ Solar → Eye/Skin/Microtubules → Retinol → ~800 GPCRs → Chemistry → Neural → Schumann → Consciousness"],
                  ["We Are Bio-Machines", "Living receivers, transmitters, and creators of consciousness — not just biological machines"],
                ].map(([title, desc]) => (
                  <div key={title} style={{ background: "#4a044422", border: "1px solid #831843", borderRadius: "0.5rem", padding: "0.75rem" }}>
                    <div style={{ color: "#f9a8d4", fontSize: "0.8rem", fontWeight: 700, marginBottom: "0.25rem" }}>{title}</div>
                    <div style={{ color: "#94a3b8", fontSize: "0.75rem", lineHeight: 1.5 }}>{desc}</div>
                  </div>
                ))}
              </div>
              <div style={{ marginTop: "1rem", background: "#4a044422", border: "1px solid #831843", borderRadius: "0.5rem", padding: "1rem", fontSize: "0.875rem", color: "#f9a8d4", fontStyle: "italic", textAlign: "center" }}>
                "Sunlight is not just energy. It is information, intelligence, and life. The Sun does not just shine on us — it thinks us."
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
