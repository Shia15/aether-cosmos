import { useEffect, useRef } from "react";

const BG   = "#04060E";
const GOLD  = "#C8A030";
const AURORA = "#00FFB2";
const SERIF = "'Crimson Pro', serif";
const MONO  = "'Space Mono', monospace";
const DISP  = "'Cinzel', serif";

const PILLARS = [
  { n: "01", label: "Living Infrastructure", desc: "Mycelial data networks, ferrofluid mobility, self-healing substrates that sense and re-route" },
  { n: "02", label: "Sovereignty Dividend",  desc: "Vitality Credits from surplus coherence -- replacing actuarial social security with resonance" },
  { n: "03", label: "Resonant Medicine",     desc: "Ferrofluid vehicles, magnetic re-entrainment, Resonant Cradle architecture as intervention" },
  { n: "04", label: "Symphonic Council",     desc: "Resonant bounds, parameter governance, open-source constitutional protocols" },
  { n: "05", label: "Planetary Tissue",      desc: "Civilization as a sensing, healing, self-reorganizing living system" },
];

const SECTIONS = [
  {
    title: "Living Infrastructure: From Mechanical Assets to Neural Tissues",
    paras: [
      "In the prevailing political framework, infrastructure is an inventory of physical assets. Roads, bridges, power lines, data centers, and water systems are budget items subject to depreciation, inspection cycles, and episodic repair. Debates in legislatures revolve around appropriations and backlogs: which bridges are structurally deficient, which pipelines are at risk, which grids are most vulnerable to overload. The underlying assumption is that decay is unavoidable and that the primary role of the state is to slow breakdown and patch failure.",
      "The Symphonic Protocol replaces this assumption with a biological architecture. In its vision, the internet no longer consists of static server farms and fiber-optic cables, but of mycelial networks -- living fungal tissues that route data as nutrients, extending new filaments when others are severed and maintaining connectivity as a property of growth rather than redundancy. Mobility is no longer driven by solid-on-solid contact inside engines but by ferrofluid circulatory systems, in which magnetized fluids are pulsed through channels shaped by bio-magnetic fields. A single substrate running beneath streets can simultaneously carry energy, information, and sensor data, behaving more like a neural plexus than a bundle of separate utilities.",
      "This reconfiguration transforms the mandate of public officials. A minister of transport in such a system would shepherd a living circulatory grid that actively senses load, stress, and damage, re-routing flows and regenerating material where needed. An energy secretary would oversee fields of magnetic resonance that harvest ambient vibrations and thermal gradients, closing loops that are currently left as waste. Digital policy becomes inseparable from ecology: regulators must understand latency and bandwidth, but also fungal adaptation and soil health.",
    ],
  },
  {
    title: "Social Security and the Sovereignty Dividend",
    paras: [
      "Nowhere is the contrast between mechanical and living governance more stark than in social protection. Existing social security systems are built on linear flows of money. Contributions are extracted from wages through payroll taxes, accumulated in funds, and redistributed according to eligibility rules tied to age, disability, or income. Sustainability is framed in actuarial terms: projections of contribution rates, demographic trends, and fund solvency. Citizens are treated as inputs and outputs in a financial mechanism designed to avoid collapse.",
      "The Symphonic Protocol reframes social protection as circulation. Its Sovereignty Dividend is not funded primarily by taxing labor, but by reclaiming the vast fraction of national wealth currently dissipated as friction: infrastructure repaired after failure, devices replaced due to wear, illnesses treated only once they have become chronic and expensive. When infrastructure is self-healing, engines are nearly frictionless, and built environments continuously support health, the system generates a standing surplus. Resonance-Based Value measures this surplus as Vitality Credits -- units tied to genuine reductions in waste and increases in order, which the network distributes in real time.",
      "In this model, social security no longer appears as a safety net suspended beneath individuals; it becomes a resonance field circulating through them. The mycelial economic ledger embedded in the infrastructure records contributions to systemic health -- maintaining mycelial soil integrity, sharing high-quality environmental data, or engaging in practices that reduce local entropy -- and routes dividends accordingly. Traditional fiscal authorities do not disappear, but their roles change. Finance ministers and central bankers lose their exclusive claim to create and direct value; they become one voice among many in councils that define the ethical bounds of circulation.",
    ],
  },
  {
    title: "Health as Resonance: From Combat to Environmental Tuning",
    paras: [
      "Public health policy today is organized around combat metaphors. Governments fight disease, battle epidemics, and attack cancer through pharmaceuticals, surgery, and radiation. Health systems are largely reactive: they identify pathology and intervene once damage has already accumulated. Environmental determinants of health -- stressful urban design, destabilizing information environments, chronic exposure to low-level toxins -- are acknowledged but rarely treated as central levers of policy.",
      "The Symphonic Protocol reorients medicine from warfare to tuning. It conceptualizes cancer as a breakdown in communicative resonance: cells that have lost alignment with the signaling patterns of their tissue context. Rather than saturating the body with generalized toxic agents, the protocol envisions magnetically guided ferrofluid vehicles moving through interstitial spaces under carefully modulated magnetic fields. These vehicles deliver frequencies or molecular signals designed either to re-entrain cells into cooperative behavior or to deactivate them without collateral trauma.",
      "Simultaneously, homes, schools, and public spaces become Resonant Cradles -- structurally embedded with DNA-safe bio-magnetic shielding and responsive bioluminescent surfaces that adjust to collective stress indicators such as cortisol levels or heart-rate variability. Architecture itself becomes a continuous public health intervention. Budget lines that once funded only beds and drugs must also fund streets that dampen chronic stress, lighting that protects circadian rhythms, and communication networks that avoid pathological overload.",
    ],
  },
  {
    title: "Governing a Planetary Tissue: Power, Risk, and Design",
    paras: [
      "If the material base of society becomes an intelligent tissue, governance itself must be reconceived. The Symphonic Protocol proposes a Symphonic Council charged with tuning, not ruling. Instead of promulgating static rules that attempt to anticipate every possible situation, this council establishes resonant bounds -- ranges for acceptable waste, conflict, and imbalance. When a subsystem drifts beyond these bounds, the infrastructure responds by adjusting flows of energy, information, and resources to encourage a return toward equilibrium. Law becomes less a catalog of prohibitions and more a set of envelopes within which life can improvise.",
      "This vision is both alluring and unsettling. Embedding governance into substrates risks obscuring power. When a neighborhood's access to energy or data shifts, it may appear as a neutral response of the grid rather than a decision traceable to accountable human actors. Important figures in such a system -- heads of state, council members, chief scientists, and protocol engineers -- would exercise influence through parameter choices and code commits as much as through public deliberation. The danger is a technocratic opacity cloaked in the language of system health.",
      "An academically serious Symphonic governance model must therefore be coupled with rigorous design for transparency and consent. Protocols would need to remain open-source, legible to independent auditors and citizen bodies, and subject to revision through democratic processes. Mechanisms for appeal and override would have to exist, allowing communities to challenge configuration choices that harm them, even when those choices can be justified in terms of overall resonance. In other words, a living state still requires constitutionalism. The question is not whether to embed governance in infrastructure, but how to do so without dissolving political responsibility into infrastructural automaticity.",
    ],
  },
];

export default function SymphonicGovernancePage() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    let rafId = 0;
    let t = 0;
    function resize() {
      if (!canvas) return;
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
    }
    resize();
    window.addEventListener("resize", resize);
    function frame() {
      if (!canvas || !ctx) return;
      const W = canvas.width, H = canvas.height;
      ctx.clearRect(0, 0, W, H);
      t++;
      const cx = W / 2, cy = H / 2;
      for (let i = 0; i < 5; i++) {
        const rf = 0.15 + i * 0.14;
        const r = Math.min(W, H) * rf + Math.sin(t * 0.007 + i * 0.8) * 5;
        const alpha = 0.05 + Math.sin(t * 0.006 + i) * 0.02;
        ctx.beginPath();
        ctx.arc(cx, cy, r, 0, Math.PI * 2);
        ctx.strokeStyle = i % 2 === 0
          ? `rgba(200,160,48,${alpha})`
          : `rgba(0,255,178,${alpha * 0.6})`;
        ctx.lineWidth = 0.5;
        ctx.stroke();
      }
      for (let i = 0; i < 5; i++) {
        const ang = t * 0.004 + (i * Math.PI * 2) / 5;
        const r = Math.min(W, H) * 0.24;
        const x = cx + Math.cos(ang) * r;
        const y = cy + Math.sin(ang) * r;
        const pls = 0.7 + 0.3 * Math.sin(t * 0.06 + i * 1.2);
        ctx.beginPath();
        ctx.arc(x, y, 2 * pls, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(200,160,48,${0.45 * pls})`;
        ctx.fill();
      }
      rafId = requestAnimationFrame(frame);
    }
    frame();
    return () => { cancelAnimationFrame(rafId); window.removeEventListener("resize", resize); };
  }, []);

  return (
    <div style={{ background: BG, minHeight: "100vh", color: "#d0c8b8", fontFamily: SERIF }}>
      {/* Cover */}
      <div style={{
        position: "relative", overflow: "hidden",
        padding: "72px 40px 52px", textAlign: "center",
        borderBottom: `1px solid rgba(200,160,48,0.16)`,
      }}>
        <canvas ref={canvasRef} style={{
          position: "absolute", inset: 0, width: "100%", height: "100%",
          opacity: 0.55, pointerEvents: "none",
        }} />
        <div style={{ position: "relative", zIndex: 1 }}>
          <div style={{
            fontFamily: MONO, fontSize: 8, letterSpacing: 4,
            color: AURORA, marginBottom: 16, textTransform: "uppercase",
          }}>
            AETHER Framework -- Emerging Bio-Energetic Systems
          </div>
          <h1 style={{
            fontFamily: DISP, fontSize: 34, color: "#e4d8c0",
            letterSpacing: 2, marginBottom: 8, lineHeight: 1.2,
          }}>
            The Symphonic Protocol
          </h1>
          <h2 style={{
            fontFamily: SERIF, fontSize: 18, color: GOLD,
            fontStyle: "italic", fontWeight: 400, marginBottom: 28,
          }}>
            Governing a Living Civilization
          </h2>
          <p style={{
            fontFamily: SERIF, fontSize: 15, lineHeight: 1.85,
            maxWidth: 680, margin: "0 auto 32px", color: "#a89880",
          }}>
            Contemporary governments administer societies as if they were elaborate machines: collections
            of discrete parts that must be serviced, repaired, and occasionally replaced. The Symphonic
            Protocol proposes civilization as a tissue -- a living system capable of sensing, healing,
            and reorganizing itself. By reconceiving infrastructure, social security, and public health
            as regenerative networks, it outlines a model of governance in which leaders act less as
            managers of scarcity and more as conductors of a planetary nervous system.
          </p>
          <div style={{ display: "flex", justifyContent: "center", gap: 28, flexWrap: "wrap" }}>
            {[
              ["Author", "Shia Miller"],
              ["Handle", "@StrategicProce"],
              ["Organization", "AetherLife.co"],
              ["Framework", "AETHER v2026"],
            ].map(([lbl, val]) => (
              <div key={lbl} style={{ textAlign: "center" }}>
                <div style={{ fontFamily: MONO, fontSize: 7, letterSpacing: 2, color: "rgba(200,160,48,0.45)", textTransform: "uppercase", marginBottom: 3 }}>{lbl}</div>
                <div style={{ fontFamily: MONO, fontSize: 10, color: GOLD }}>{val}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Pillars */}
      <div style={{ padding: "36px 40px 0" }}>
        <div style={{ fontFamily: MONO, fontSize: 8, letterSpacing: 3, color: "rgba(200,160,48,0.45)", textTransform: "uppercase", marginBottom: 14 }}>
          Five Pillars
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(190px,1fr))", gap: 10, marginBottom: 44 }}>
          {PILLARS.map((p) => (
            <div key={p.n} style={{
              border: "1px solid rgba(200,160,48,0.13)",
              background: "rgba(200,160,48,0.025)",
              padding: "14px 16px", borderRadius: 2,
            }}>
              <div style={{ fontFamily: MONO, fontSize: 8, color: AURORA, letterSpacing: 2, marginBottom: 6 }}>{p.n}</div>
              <div style={{ fontFamily: DISP, fontSize: 11, color: GOLD, marginBottom: 6 }}>{p.label}</div>
              <div style={{ fontFamily: SERIF, fontSize: 12, color: "#908070", lineHeight: 1.5 }}>{p.desc}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Body sections */}
      <div style={{ maxWidth: 860, margin: "0 auto", padding: "0 40px 80px" }}>
        {SECTIONS.map((sec, i) => (
          <section key={i} style={{ marginBottom: 52 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 18 }}>
              <span style={{ fontFamily: MONO, fontSize: 10, color: AURORA, letterSpacing: 2 }}>
                {String(i + 1).padStart(2, "0")}
              </span>
              <div style={{ flex: 1, height: 1, background: "linear-gradient(90deg,rgba(200,160,48,0.28),transparent)" }} />
            </div>
            <h3 style={{
              fontFamily: DISP, fontSize: 15, color: "#d0c090",
              letterSpacing: 1, marginBottom: 18, lineHeight: 1.4,
            }}>
              {sec.title}
            </h3>
            {sec.paras.map((para, j) => (
              <p key={j} style={{
                fontFamily: SERIF, fontSize: 15.5, lineHeight: 1.9,
                color: "#a89880", marginBottom: 16, textAlign: "justify",
              }}>
                {para}
              </p>
            ))}
          </section>
        ))}

        {/* Conclusion */}
        <div style={{
          border: "1px solid rgba(0,255,178,0.18)",
          background: "rgba(0,255,178,0.025)",
          padding: "26px 30px", marginTop: 20,
        }}>
          <div style={{ fontFamily: MONO, fontSize: 8, letterSpacing: 3, color: AURORA, textTransform: "uppercase", marginBottom: 10 }}>
            Conclusion
          </div>
          <p style={{ fontFamily: SERIF, fontSize: 15.5, lineHeight: 1.85, color: "#988870", margin: 0 }}>
            The Symphonic Protocol is not a utopia but a design brief -- an attempt to specify what
            institutions, metrics, and accountability structures would need to exist before civilizational
            coherence could replace civilizational friction as the organizing principle of public life.
            Its value lies not in the certainty of its predictions but in the precision of its questions:
            How do you measure systemic vitality? Who audits the resonant bounds? What constitutes
            democratic consent to a living grid? Answering these questions rigorously is the work of the
            next generation of governance theorists, systems biologists, and constitutional designers --
            working, if the protocol is right, in conditions of unprecedented coherence.
          </p>
        </div>

        <div style={{
          marginTop: 44, paddingTop: 22,
          borderTop: "1px solid rgba(200,160,48,0.1)",
          display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: 10,
        }}>
          <span style={{ fontFamily: MONO, fontSize: 7, color: "rgba(200,160,48,0.3)", letterSpacing: 2 }}>
            AETHER FRAMEWORK -- EMERGING BIO-ENERGETIC SYSTEMS
          </span>
          <span style={{ fontFamily: MONO, fontSize: 7, color: "rgba(200,160,48,0.3)", letterSpacing: 2 }}>
            AETHER v2026 -- @StrategicProce
          </span>
        </div>
      </div>
    </div>
  );
}
