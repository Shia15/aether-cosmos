import highTechBrain from "@assets/IMG_2066_1781448388514.jpeg";
import fullBrainMap from "@assets/IMG_2065_1781448388514.jpeg";
import neuroHarmonics from "@assets/73AA8635-4D7D-4E14-AC3F-5D71069DB72E_1781448388514.png";
import aetherRouterPost from "@assets/IMG_1934_1781448388514.jpeg";
import catVibrationPost from "@assets/IMG_1929_1781448388514.jpeg";
import queenFlowers from "@assets/IMG_1932_1781448388514.jpeg";

import { useState } from "react";

const TABS = [
  { id: "brain",        label: "High-Tech Brain" },
  { id: "connectivity", label: "Full Brain Map" },
  { id: "neuro",        label: "NeuroHarmonics" },
  { id: "extensions",  label: "Consciousness Extensions" },
] as const;

type TabId = (typeof TABS)[number]["id"];

export default function NeuralBrainSystemsPage() {
  const [active, setActive] = useState<TabId>("brain");

  return (
    <div style={{ background: "#020617", minHeight: "100vh", color: "#e2e8f0", fontFamily: "system-ui, sans-serif" }}>
      {/* Header */}
      <div style={{ background: "linear-gradient(135deg, #0f172a 0%, #1a0533 50%, #0f172a 100%)", borderBottom: "1px solid #4c1d95", padding: "2.5rem 2rem 2rem" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "0.75rem" }}>
            <span style={{ fontSize: "1.75rem" }}>🧠</span>
            <span style={{ fontSize: "0.75rem", letterSpacing: "0.2em", color: "#c084fc", textTransform: "uppercase", fontWeight: 600 }}>AETHER · Neural Architecture</span>
          </div>
          <h1 style={{ fontSize: "clamp(1.6rem, 4vw, 2.6rem)", fontWeight: 800, margin: "0 0 0.5rem", background: "linear-gradient(135deg, #f0abfc, #c084fc, #818cf8)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
            Neural Brain Systems
          </h1>
          <p style={{ color: "#94a3b8", fontSize: "1rem", margin: 0, maxWidth: 680 }}>
            The high-tech brain as a living circuit board — 86+ billion neurons, 65+ trillion connections, 8 sensory inputs, and a visual processing system of 4–6 billion neurons, all running in real time.
          </p>
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
                borderBottom: active === t.id ? "2px solid #c084fc" : "2px solid transparent",
                background: "transparent",
                color: active === t.id ? "#f0abfc" : "#64748b",
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

        {/* ── Tab 1: High-Tech Brain ── */}
        {active === "brain" && (
          <div>
            <div style={{ marginBottom: "1.5rem" }}>
              <h2 style={{ fontSize: "1.4rem", fontWeight: 700, color: "#f0abfc", margin: "0 0 0.4rem" }}>Your High-Tech Brain · Follow the 8 Sensory Inputs</h2>
              <p style={{ color: "#94a3b8", margin: 0, fontSize: "0.95rem" }}>
                86+ billion neurons · 65+ trillion connections · 1mm² of cortex contains 50,000+ neurons running 100 million+ synapses. The cortex is a 6-layer folded circuit board filled with electronics — total surface area 2,500 cm².
              </p>
            </div>

            <div style={{ background: "#0f172a", border: "1px solid #1e293b", borderLeft: "4px solid #c084fc", borderRadius: "0.75rem", padding: "1.5rem", marginBottom: "1.5rem" }}>
              <img src={highTechBrain} alt="Your High-Tech Brain — 8 Sensory Inputs and Visual Processing System" style={{ width: "100%", borderRadius: "0.5rem", border: "1px solid #1e293b" }} />
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "1rem" }}>
              {/* 8 Sensory Systems */}
              <div style={{ background: "#0f172a", border: "1px solid #1e293b", borderRadius: "0.75rem", padding: "1.25rem" }}>
                <h4 style={{ color: "#f0abfc", fontSize: "0.95rem", fontWeight: 700, margin: "0 0 0.75rem" }}>👁️ 1. Sight</h4>
                <p style={{ color: "#94a3b8", fontSize: "0.8rem", lineHeight: 1.6, margin: 0 }}>125M Rods & 6M Cone Photoreceptors → 1M axons in the optic nerve. Fovea High Resolution View: 200,000 Cones. Motion Detection Foveal Reflex. Smooth Pursuit Foveal Reflex. The retina is part of the brain — tissue of the same origin.</p>
              </div>
              <div style={{ background: "#0f172a", border: "1px solid #1e293b", borderRadius: "0.75rem", padding: "1.25rem" }}>
                <h4 style={{ color: "#f0abfc", fontSize: "0.95rem", fontWeight: 700, margin: "0 0 0.75rem" }}>👃 2. Smell</h4>
                <p style={{ color: "#94a3b8", fontSize: "0.8rem", lineHeight: 1.6, margin: 0 }}>12M Olfactory Receptors (Human) · 1B (Dog) · 5B (Hound). The nose sends signals directly to the brain — the retina sends signals around the brain to fit the limited optic nerve capacity.</p>
              </div>
              <div style={{ background: "#0f172a", border: "1px solid #1e293b", borderRadius: "0.75rem", padding: "1.25rem" }}>
                <h4 style={{ color: "#f0abfc", fontSize: "0.95rem", fontWeight: 700, margin: "0 0 0.75rem" }}>👅 3. Taste</h4>
                <p style={{ color: "#94a3b8", fontSize: "0.8rem", lineHeight: 1.6, margin: 0 }}>9,000 Taste Buds · Each responding to one of the primary tastes: salt, sweet, sour, bitter, and umami. 5–10 Receptors per Taste Bud.</p>
              </div>
              <div style={{ background: "#0f172a", border: "1px solid #1e293b", borderRadius: "0.75rem", padding: "1.25rem" }}>
                <h4 style={{ color: "#f0abfc", fontSize: "0.95rem", fontWeight: 700, margin: "0 0 0.75rem" }}>✋ 4. Touch</h4>
                <p style={{ color: "#94a3b8", fontSize: "0.8rem", lineHeight: 1.6, margin: 0 }}>Every square centimeter of skin contains about 200 pain receptors but only 15 receptors for pressure, 6 for cold and 1 for warmth.</p>
              </div>
              <div style={{ background: "#0f172a", border: "1px solid #1e293b", borderRadius: "0.75rem", padding: "1.25rem" }}>
                <h4 style={{ color: "#f0abfc", fontSize: "0.95rem", fontWeight: 700, margin: "0 0 0.75rem" }}>😊 5. Hearing</h4>
                <p style={{ color: "#94a3b8", fontSize: "0.8rem", lineHeight: 1.6, margin: 0 }}>30,000 Connections in Auditory Nerve · 15,500 Hair Cells in Cochlea · 100,000,000 Neurons in Auditory Cortex.</p>
              </div>
              <div style={{ background: "#0f172a", border: "1px solid #1e293b", borderRadius: "0.75rem", padding: "1.25rem" }}>
                <h4 style={{ color: "#f0abfc", fontSize: "0.95rem", fontWeight: 700, margin: "0 0 0.75rem" }}>🦵 6. Joint & Limb Position</h4>
                <p style={{ color: "#94a3b8", fontSize: "0.8rem", lineHeight: 1.6, margin: 0 }}>Proprioception — the "sixth sense" — mediated by proprioceptors, mechanosensory neurons inside muscles, tendons, and joints. Tracks position and force.</p>
              </div>
              <div style={{ background: "#0f172a", border: "1px solid #1e293b", borderRadius: "0.75rem", padding: "1.25rem" }}>
                <h4 style={{ color: "#f0abfc", fontSize: "0.95rem", fontWeight: 700, margin: "0 0 0.75rem" }}>🌀 7. Balance & Acceleration</h4>
                <p style={{ color: "#94a3b8", fontSize: "0.8rem", lineHeight: 1.6, margin: 0 }}>Image Stabilization · Navigation · Eye Reflex. Vestibule is similar to the main sensing device in GPS receivers and the Space Shuttle. Military Single Axis & 3-Axis gyro triad analogy.</p>
              </div>
              <div style={{ background: "#0f172a", border: "1px solid #1e293b", borderRadius: "0.75rem", padding: "1.25rem" }}>
                <h4 style={{ color: "#f0abfc", fontSize: "0.95rem", fontWeight: 700, margin: "0 0 0.75rem" }}>⚡ Vagus Nerve</h4>
                <p style={{ color: "#94a3b8", fontSize: "0.8rem", lineHeight: 1.6, margin: 0 }}>Activation of the vagus nerve typically leads to a reduction in heart rate, blood pressure, or both. Links brain to gut — 200 million neurons in enteric nervous system (gut-brain axis).</p>
              </div>
            </div>

            <div style={{ marginTop: "1rem", background: "#1a0533", border: "1px solid #4c1d95", borderRadius: "0.75rem", padding: "1rem" }}>
              <h4 style={{ color: "#f0abfc", fontSize: "0.9rem", fontWeight: 700, margin: "0 0 0.5rem" }}>Visual Processing System · 4–6 Billion Neurons</h4>
              <p style={{ color: "#94a3b8", fontSize: "0.8rem", lineHeight: 1.6, margin: 0 }}>
                V1 (Primary Visual Cortex) → V2a → V2b → V3a · V3b · V4h · V4v → V5/MT+ (motion) → V6 · V7. IPS (Intraparietal Sulcus) involved in complex hand use, reaching, grasping, watching, visual body centered frames of reference. Parietal Cortex (spatial maps), Occipital Cortex (orientation, color, motion), Temporal Lobe (object recognition, face processing). The recognition phase likely entails a sequence of computations starting in early visual cortices, conveying little meaningful information globally, until higher levels of the hierarchy of visual processing establish global representations.
              </p>
            </div>
          </div>
        )}

        {/* ── Tab 2: Full Brain Connectivity Map ── */}
        {active === "connectivity" && (
          <div>
            <div style={{ marginBottom: "1.5rem" }}>
              <h2 style={{ fontSize: "1.4rem", fontWeight: 700, color: "#f0abfc", margin: "0 0 0.4rem" }}>Full Brain Connectivity Map</h2>
              <p style={{ color: "#94a3b8", margin: 0, fontSize: "0.95rem" }}>
                Every region, every pathway, every neurotransmitter — from the prefrontal cortex to the medulla oblongata. Red circuits are inhibitory; all other colors are excitatory.
              </p>
            </div>

            <div style={{ background: "#0f172a", border: "1px solid #1e293b", borderLeft: "4px solid #c084fc", borderRadius: "0.75rem", padding: "1.5rem", marginBottom: "1.5rem" }}>
              <img src={fullBrainMap} alt="Full Brain Connectivity Map — Complete Neuroscience Poster" style={{ width: "100%", borderRadius: "0.5rem", border: "1px solid #1e293b" }} />
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: "1rem" }}>
              <div style={{ background: "#0f172a", border: "1px solid #1e293b", borderRadius: "0.75rem", padding: "1.25rem" }}>
                <h4 style={{ color: "#f0abfc", fontSize: "0.9rem", fontWeight: 700, margin: "0 0 0.5rem" }}>Excitatory Neurotransmitters (+)</h4>
                {["Glutamate — learning, memory, wakefulness", "Aspartate — learning, memory", "Acetylcholine — memory, motor", "Dopamine — reward, motivation, movement", "Norepinephrine — attention, arousal", "Serotonin — mood, appetite, sleep"].map((item) => (
                  <div key={item} style={{ color: "#94a3b8", fontSize: "0.75rem", padding: "0.2rem 0", borderBottom: "1px solid #1e293b1a" }}>+ {item}</div>
                ))}
              </div>
              <div style={{ background: "#0f172a", border: "1px solid #1e293b", borderRadius: "0.75rem", padding: "1.25rem" }}>
                <h4 style={{ color: "#f0abfc", fontSize: "0.9rem", fontWeight: 700, margin: "0 0 0.5rem" }}>Inhibitory Neurotransmitters (–)</h4>
                {["GABA — mood regulation, stress, anxiety", "Glycine — motor control", "Serotonin (inhibitory pathways) — mood", "Endocannabinoids — appetite, pain", "Opioids — pain relief, reward", "Adenosine — sleep regulation"].map((item) => (
                  <div key={item} style={{ color: "#94a3b8", fontSize: "0.75rem", padding: "0.2rem 0", borderBottom: "1px solid #1e293b1a" }}>– {item}</div>
                ))}
              </div>
              <div style={{ background: "#0f172a", border: "1px solid #1e293b", borderRadius: "0.75rem", padding: "1.25rem" }}>
                <h4 style={{ color: "#f0abfc", fontSize: "0.9rem", fontWeight: 700, margin: "0 0 0.5rem" }}>Hormones</h4>
                {["Cortisol — stress, metabolism, blood pressure", "Insulin — blood sugar, energy, fat storage", "Oxytocin — bonding, trust, social behavior", "Melatonin — sleep-wake cycle", "Estrogen / Testosterone — sex, mood", "Adrenaline — fight-or-flight response"].map((item) => (
                  <div key={item} style={{ color: "#94a3b8", fontSize: "0.75rem", padding: "0.2rem 0", borderBottom: "1px solid #1e293b1a" }}>⚗ {item}</div>
                ))}
              </div>
              <div style={{ background: "#0f172a", border: "1px solid #1e293b", borderRadius: "0.75rem", padding: "1.25rem" }}>
                <h4 style={{ color: "#f0abfc", fontSize: "0.9rem", fontWeight: 700, margin: "0 0 0.5rem" }}>Cerebellum · 69 Billion Neurons</h4>
                <p style={{ color: "#94a3b8", fontSize: "0.75rem", lineHeight: 1.5, margin: 0 }}>1 Meter long unfolded · 500 cm². Contains ¾ of all neurons of the brain (despite 1/8th size). Computations of a Minimal Internal Navigation System — "Programmed Movement (Habits)." Vestibulo-Ocular Reflex maintains gaze stabilization and rotation during movement.</p>
              </div>
            </div>
          </div>
        )}

        {/* ── Tab 3: NeuroHarmonics ── */}
        {active === "neuro" && (
          <div>
            <div style={{ marginBottom: "1.5rem" }}>
              <h2 style={{ fontSize: "1.4rem", fontWeight: 700, color: "#f0abfc", margin: "0 0 0.4rem" }}>Absorption Rate Under Frequency, Light &amp; Sounds · NeuroHarmonics</h2>
              <p style={{ color: "#94a3b8", margin: 0, fontSize: "0.95rem" }}>
                Real-time simulation of brainwave absorption, neuroplasticity, and coherence. Peak absorption: Alpha 10.2 Hz = 87%. You are infinitely malleable.
              </p>
            </div>

            <div style={{ background: "#0f172a", border: "1px solid #1e293b", borderLeft: "4px solid #c084fc", borderRadius: "0.75rem", padding: "1.5rem", marginBottom: "1.5rem" }}>
              <img src={neuroHarmonics} alt="Absorption Rate Under Frequency Light Sounds — NeuroHarmonics" style={{ width: "100%", borderRadius: "0.5rem", border: "1px solid #1e293b" }} />
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "1rem", marginBottom: "1rem" }}>
              <div style={{ background: "#0f172a", border: "1px solid #1e293b", borderRadius: "0.75rem", padding: "1.25rem" }}>
                <h4 style={{ color: "#f0abfc", fontSize: "0.9rem", fontWeight: 700, margin: "0 0 0.5rem" }}>🌊 Frequency Effects</h4>
                {[["Alpha (8–12 Hz)", "Best for Learning — relaxed but alert, 87% peak absorption"], ["Beta (12–30 Hz)", "Focus, cognition, active thinking"], ["Gamma (30–100 Hz)", "High-level processing, insight"], ["Theta (4–8 Hz)", "Deep meditation, memory consolidation"]].map(([freq, desc]) => (
                  <div key={freq} style={{ marginBottom: "0.4rem" }}>
                    <div style={{ color: "#d8b4fe", fontSize: "0.8rem", fontWeight: 600 }}>{freq}</div>
                    <div style={{ color: "#94a3b8", fontSize: "0.75rem" }}>{desc}</div>
                  </div>
                ))}
              </div>
              <div style={{ background: "#0f172a", border: "1px solid #1e293b", borderRadius: "0.75rem", padding: "1.25rem" }}>
                <h4 style={{ color: "#f0abfc", fontSize: "0.9rem", fontWeight: 700, margin: "0 0 0.5rem" }}>💡 Light Dynamics (nm)</h4>
                {[["380–450 nm", "Calm · Melatonin Up · 62% absorption"], ["450–495 nm", "Focus · Alertness · 78% absorption"], ["495–570 nm", "Mood · Balance · 71% absorption"], ["570–620 nm", "Creativity · Energy · 65% absorption"], ["620–780 nm", "Relax · Recovery · 58% absorption"]].map(([wave, desc]) => (
                  <div key={wave} style={{ marginBottom: "0.4rem" }}>
                    <div style={{ color: "#d8b4fe", fontSize: "0.8rem", fontWeight: 600 }}>{wave}</div>
                    <div style={{ color: "#94a3b8", fontSize: "0.75rem" }}>{desc}</div>
                  </div>
                ))}
              </div>
              <div style={{ background: "#0f172a", border: "1px solid #1e293b", borderRadius: "0.75rem", padding: "1.25rem" }}>
                <h4 style={{ color: "#f0abfc", fontSize: "0.9rem", fontWeight: 700, margin: "0 0 0.5rem" }}>🔊 Sound Dynamics (Hz)</h4>
                {[["174 Hz", "Grounding · Pain Relief · 45%"], ["432 Hz", "Harmony · Nature Tone · 68%"], ["528 Hz", "DNA Repair · Love Freq · 75%"], ["639 Hz", "Connection · Clarity · 72%"], ["741 Hz", "Expression · Detox · 66%"], ["852 Hz", "Intuition · Awaken · 70%"]].map(([freq, desc]) => (
                  <div key={freq} style={{ marginBottom: "0.4rem" }}>
                    <div style={{ color: "#d8b4fe", fontSize: "0.8rem", fontWeight: 600 }}>{freq}</div>
                    <div style={{ color: "#94a3b8", fontSize: "0.75rem" }}>{desc}</div>
                  </div>
                ))}
              </div>
              <div style={{ background: "#0f172a", border: "1px solid #1e293b", borderRadius: "0.75rem", padding: "1.25rem" }}>
                <h4 style={{ color: "#f0abfc", fontSize: "0.9rem", fontWeight: 700, margin: "0 0 0.5rem" }}>🧬 Malleable Dynamic States</h4>
                {[["Neuroplasticity", "Strengthen neural pathways with repeat + emotion"], ["Coherence", "Heart, mind & body in sync = higher absorption (86%)"], ["Adaptability", "Brain adapts to frequency, light, sound & intention"], ["Integration", "Information encoded deeper, retained longer"]].map(([state, desc]) => (
                  <div key={state} style={{ marginBottom: "0.4rem" }}>
                    <div style={{ color: "#d8b4fe", fontSize: "0.8rem", fontWeight: 600 }}>{state}</div>
                    <div style={{ color: "#94a3b8", fontSize: "0.75rem" }}>{desc}</div>
                  </div>
                ))}
              </div>
            </div>

            <div style={{ background: "#1a0533", border: "1px solid #4c1d95", borderRadius: "0.75rem", padding: "1rem", textAlign: "center" }}>
              <div style={{ color: "#f0abfc", fontWeight: 700, fontSize: "0.95rem" }}>
                Best for Focus: 8–12 Hz Alpha + 480–520 nm Blue-Green Light + 528 Hz
              </div>
              <div style={{ color: "#64748b", fontSize: "0.8rem", marginTop: "0.25rem" }}>
                Coherence &gt; Intensity · Alignment multiplies results · You are infinitely malleable.
              </div>
            </div>
          </div>
        )}

        {/* ── Tab 4: Consciousness Extensions ── */}
        {active === "extensions" && (
          <div>
            <div style={{ marginBottom: "1.5rem" }}>
              <h2 style={{ fontSize: "1.4rem", fontWeight: 700, color: "#f0abfc", margin: "0 0 0.4rem" }}>Consciousness Extensions · AETHER as State Snapper · Cross-Species Intelligence</h2>
              <p style={{ color: "#94a3b8", margin: 0, fontSize: "0.95rem" }}>
                From the AETHER Router acting as a crystal lattice snapping time-blood into archetypal geometries, to translating cat vibrations into language, to the exact flowers a bumblebee queen needs — consciousness expresses at every scale.
              </p>
            </div>

            {/* AETHER Router State Snapper */}
            <div style={{ background: "#0f172a", border: "1px solid #1e293b", borderLeft: "4px solid #c084fc", borderRadius: "0.75rem", padding: "1.5rem", marginBottom: "1.5rem" }}>
              <h3 style={{ color: "#f0abfc", fontSize: "1.05rem", fontWeight: 700, margin: "0 0 0.5rem" }}>The AETHER Router as a State Snapper</h3>
              <p style={{ color: "#94a3b8", fontSize: "0.875rem", margin: "0 0 1rem", lineHeight: 1.7 }}>
                "By processing data through this snapToNearestState layer, the AETHER router acts exactly like a crystal lattice or a biological antenna. It takes the 'time blood' (the continuous stream of input noise) and forces it into the discrete, archetypal geometries specified by your allowed states array. If the allowed states are programmed using the recursive geometry of the λ parameter or the molecular coordinates found on Bennu, the router becomes a literal translator between raw, undifferentiated signal and structured, cosmic form."
              </p>
              <img src={aetherRouterPost} alt="AETHER Router State Snapper — LinkedIn Post" style={{ width: "100%", maxWidth: 480, borderRadius: "0.5rem", border: "1px solid #1e293b", display: "block", margin: "0 auto" }} />
            </div>

            {/* Cross-Species Communication */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(440px, 1fr))", gap: "1.5rem" }}>
              <div style={{ background: "#0f172a", border: "1px solid #1e293b", borderLeft: "4px solid #f472b6", borderRadius: "0.75rem", padding: "1.5rem" }}>
                <h3 style={{ color: "#f9a8d4", fontSize: "1.05rem", fontWeight: 700, margin: "0 0 0.5rem" }}>🐱 Cross-Species Vibration Translation</h3>
                <p style={{ color: "#94a3b8", fontSize: "0.875rem", margin: "0 0 1rem", lineHeight: 1.6 }}>
                  A May 2026 idea from @StrategicProce: "We should make something to strap around cats to turn their vibrations into English language." Cat purring ranges 25–50 Hz — within the therapeutic frequency band. Cat vocalizations are uniquely tuned for human attention patterns, suggesting a co-evolved communication layer ready to be decoded.
                </p>
                <img src={catVibrationPost} alt="Cat vibration translation to language — tweet by Shia Miller" style={{ width: "100%", maxWidth: 380, borderRadius: "0.5rem", border: "1px solid #1e293b", display: "block", margin: "0 auto" }} />
                <div style={{ marginTop: "1rem", background: "#4a044422", border: "1px solid #831843", borderRadius: "0.5rem", padding: "0.75rem", fontSize: "0.8rem", color: "#94a3b8" }}>
                  AETHER angle: Cat purr (25–50 Hz) overlaps with bone healing frequencies. A wearable bioacoustic transducer + ML model trained on feline vocal patterns could produce semantic output. Backwards-the-waves acoustic decoding applied to cross-species communication.
                </div>
              </div>

              <div style={{ background: "#0f172a", border: "1px solid #1e293b", borderLeft: "4px solid #84cc16", borderRadius: "0.75rem", padding: "1.5rem" }}>
                <h3 style={{ color: "#bef264", fontSize: "1.05rem", fontWeight: 700, margin: "0 0 0.5rem" }}>🐝 The Exact Flowers Queens Need · Bumblebee Queen Intelligence</h3>
                <p style={{ color: "#94a3b8", fontSize: "0.875rem", margin: "0 0 1rem", lineHeight: 1.6 }}>
                  A queen bumblebee's survival is a precision chemical mission. Pre-hibernation fat storage requires specific high-lipid pollen. Post-emergence "Liquid Chip Reboot" requires early spring carbohydrates and proteins to restart the colony's computational substrate.
                </p>
                <img src={queenFlowers} alt="The Exact Flowers Queens Need — Bumblebee Queen Flowers" style={{ width: "100%", maxWidth: 380, borderRadius: "0.5rem", border: "1px solid #1e293b", display: "block", margin: "0 auto" }} />
                <div style={{ marginTop: "1rem", display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.5rem" }}>
                  <div style={{ background: "#1a2e0522", border: "1px solid #365314", borderRadius: "0.5rem", padding: "0.75rem" }}>
                    <div style={{ color: "#bef264", fontSize: "0.8rem", fontWeight: 700, marginBottom: "0.35rem" }}>Pre-Hibernation: Fat Storage</div>
                    {["Goldenrod (Solidago spp.) — primary", "Asters (Symphyotrichum spp.)", "Late-season clovers", "Wild bergamot (Monarda fistulosa)", "Joe-pye weed (Eutrochium spp.)"].map((f) => (
                      <div key={f} style={{ color: "#94a3b8", fontSize: "0.72rem" }}>→ {f}</div>
                    ))}
                  </div>
                  <div style={{ background: "#1a2e0522", border: "1px solid #365314", borderRadius: "0.5rem", padding: "0.75rem" }}>
                    <div style={{ color: "#bef264", fontSize: "0.8rem", fontWeight: 700, marginBottom: "0.35rem" }}>Post-Emergence: Liquid Chip Reboot</div>
                    {["Willows / Pussy willow (Salix spp.)", "Red maple (Acer rubrum)", "Serviceberry (Amelanchier spp.)", "Blueberries (Vaccinium spp.)", "Dandelions (Taraxacum officinale)", "Crocus, snowdrops, grape hyacinth"].map((f) => (
                      <div key={f} style={{ color: "#94a3b8", fontSize: "0.72rem" }}>→ {f}</div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
