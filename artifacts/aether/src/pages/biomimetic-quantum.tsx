import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

const C = {
  bg: "#04070E", panel: "#080D1A", panel2: "#0B1220",
  border: "#0E1A2C", border2: "#152438",
  white: "#EBF4FF", text: "#7AA6C5", muted: "#486888", dim: "#243850",
  teal: "#00C9B1", gold: "#F5C518", orange: "#F97316",
  red: "#EF4444", yellow: "#FBBF24", purple: "#7C5CFC", blue: "#3B82F6",
  green: "#10B981", pink: "#F472B6", silver: "#C0CFDB",
};

type Tab = "abstract" | "patterns" | "qbio" | "photonic" | "protonic" | "hybrid" | "metrics" | "challenges";

const PATTERNS = [
  { name: "ENERGY MINIMIZATION",   col: C.gold,    body: "Biological systems exploit quantum effects for low-energy operations. Photosynthesis: near-100% efficient exciton transport via quantum coherence. Proton tunneling in enzymes reduces activation energies." },
  { name: "SCALABLE MODULARITY",   col: C.teal,    body: "Termite mounds use passive ventilation. Neuromorphic chips mimicking brain efficiency are ~1,000,000× more energy-efficient than silicon for similar tasks." },
  { name: "RESILIENCE TO NOISE",   col: C.purple,  body: "Biological quantum processes operate at room temperature amid thermal noise. Avian magnetoreception via radical pairs uses environmental coupling for stability." },
  { name: "HYBRID INTEGRATION",    col: C.orange,  body: "Ecosystems blend discrete and continuous elements (photon-protein interactions in vision). This informs hybrid CV-DV (continuous-variable / discrete-variable) quantum systems." },
];

const QBIO = [
  { title: "PHOTONIC PROCESSES",  col: C.gold,   body: "Photosynthesis uses quantum superposition and entanglement for efficient light harvesting. Excitons delocalize across chromophores achieving unity quantum yield. Biophotons — ultraweak coherent emissions from metabolic processes — function as quantum light sources." },
  { title: "PROTON MANIPULATION", col: C.teal,   body: "Proton tunneling underpins enzyme catalysis and DNA mutations, enabling barrier penetration with minimal energy. In hydrogen bonds, protons exhibit quantum delocalization influencing biological stability." },
  { title: "INTEGRATED SYSTEMS",  col: C.purple, body: "Proteins can sustain quantum superpositions, turning cells into proto-quantum processors. Quantum biomimetic protocols encode self-replication and mutation, mimicking evolutionary algorithms." },
];

const PHOTONIC = [
  { tag: "LIGHT-HARVESTING MIMICRY",   col: C.gold,    body: "Emulate photosynthetic antennas for efficient photon sources. Deterministic quantum-dot emitters mimic chromophore arrays, reducing multiplexing needs and boosting scalability. Squeezed states inspired by biophoton coherence minimize uncertainty in continuous-variable encoding." },
  { tag: "NOISE-RESILIENT GATES",      col: C.purple,  body: "Avian-navigation radical-pair mechanism inspires error-corrected photonic gates tolerating 11.5% photon loss using GHZ states. Enables all-photonic universal QC at room temperature." },
  { tag: "EFFICIENCY GAINS",           col: C.teal,    body: "Polarization encoding, redundant multi-photon pulses, and hybrid CV-DV models reduce resource overheads (~2.07 × 10⁶ for 10⁻⁶ accuracy). Applications: simulating molecular energies, photonic hydrogen spectrum calculations." },
];

const PROTONIC = [
  { tag: "TUNNELING-INSPIRED GATES",   col: C.orange,  body: "Enzyme-like proton tunneling enables low-energy quantum gates. NMR QC manipulates proton spins; biomimicry enhances this with delocalized proton networks for dense encoding." },
  { tag: "HYBRID PHOTONIC-PROTONIC",   col: C.pink,    body: "Integrate photonic qubits with protonic ones, mimicking biophoton-protein interactions. Trapped H⁺ ions could interface with photons for quantum networks, drawing from mitogenetic UV photon-cellular response." },
  { tag: "SCALABILITY & EFFICIENCY",   col: C.green,   body: "Multi-proton biomimetic redundancy reduces errors. Simulations show proton-based systems could simulate complex biomolecules with lower energy than superconducting QC." },
];

const ARCHITECTURE = [
  { layer: "01 · PHOTONIC BACKBONE",   col: C.gold,    desc: "Fast, low-loss computation. Linear optics, quantum-dot single-photon sources, polarization-encoded qubits. Room-temperature operation." },
  { layer: "02 · PROTONIC MODULES",    col: C.orange,  desc: "Stable storage and tunneling-based operations. Trapped H⁺ ions or NMR proton spins. Long coherence times." },
  { layer: "03 · GHZ ENTANGLED CLUSTERS", col: C.purple, desc: "Modular blocks tolerating high photon loss (11.5%+). Fault-tolerant via biological-redundancy patterns." },
  { layer: "04 · BIOPHOTON INTERFACE", col: C.teal,    desc: "UV/optical signal translation between photonic backbone and protonic stores — mimicking mitogenetic activation." },
  { layer: "05 · ENVIRONMENTAL COUPLING", col: C.green, desc: "Engineered ENAQT (environment-assisted quantum transport) using thermal noise as resource, not enemy." },
  { layer: "06 · ADAPTIVE ERROR-CORRECT", col: C.pink, desc: "Radical-pair-inspired gates and self-replicating biomimetic protocols for runtime error mitigation." },
];

const METRICS = [
  { k: "ENERGY REDUCTION",    v: "10–100×",   n: "vs superconducting QC, via coherence mimicry", col: C.gold },
  { k: "PHOTON LOSS TOLERANCE", v: "11.5%",   n: "with GHZ-cluster encoding",                     col: C.purple },
  { k: "RESOURCE OVERHEAD",   v: "2.07 × 10⁶", n: "for 10⁻⁶ accuracy in CV-DV hybrid",            col: C.teal },
  { k: "EXCITON YIELD",       v: "~100%",     n: "biological photosynthesis benchmark",          col: C.green },
  { k: "TEMPERATURE",         v: "300 K",     n: "room-temperature operation target",            col: C.orange },
  { k: "NEUROMORPHIC EDGE",   v: "10⁶×",      n: "energy advantage of brain-mimetic chips",      col: C.pink },
];

export default function BiomimeticQuantumPage() {
  const [tab, setTab] = useState<Tab>("abstract");

  const TABS: [Tab, string][] = [
    ["abstract","ABSTRACT"], ["patterns","BIOMIMETIC PATTERNS"], ["qbio","QUANTUM BIOLOGY"],
    ["photonic","PHOTONIC QC"], ["protonic","PROTONIC QC"], ["hybrid","INTEGRATED ARCHITECTURE"],
    ["metrics","METRICS"], ["challenges","CHALLENGES"],
  ];

  return (
    <div data-testid="biomimetic-quantum-root" className="min-h-screen p-6" style={{ background: C.bg, color: C.text, fontFamily: "'JetBrains Mono', monospace" }}>

      <div className="border-b pb-5 mb-6" style={{ borderColor: C.border2 }}>
        <p className="text-[9px] tracking-[0.36em] uppercase mb-3" style={{ color: C.dim }}>
          AETHER · Biomimetic Quantum Computing · Photonic + Protonic Synthesis
        </p>
        <h1 className="font-['Cinzel',serif] font-light leading-none tracking-tight" style={{ fontSize: "clamp(34px,4.8vw,58px)", color: C.white }}>
          Biomimetic <em style={{ color: C.green, fontStyle: "italic" }}>Quantum</em> Computing
        </h1>
        <p className="font-['Cinzel',serif] italic mt-2" style={{ fontSize: "clamp(13px,1.6vw,18px)", color: C.muted }}>
          Patterned synthesis · light-based + proton-based manipulations · room-temperature QC
        </p>
        <p className="mt-4 max-w-3xl text-[12px] leading-7 border-l-2 pl-4" style={{ color: C.text, borderColor: C.green }}>
          Biomimicry — the emulation of nature's optimized designs — has yielded efficiency gains across energy,
          materials, and computing. This page synthesizes recurring patterns (minimal energy, adaptive resilience,
          scalable architectures) and applies them to quantum computing through photonic and protonic systems.
          Quantum biology provides direct blueprints for room-temperature, noise-tolerant quantum information handling.
        </p>
      </div>

      {/* TABS */}
      <div className="flex gap-1 mb-5 border-b overflow-x-auto" style={{ borderColor: C.border2 }}>
        {TABS.map(([k, lbl]) => (
          <button key={k} data-testid={`tab-${k}`} onClick={() => setTab(k)}
            className="px-3 py-2 text-[8px] tracking-[0.22em] whitespace-nowrap transition-colors"
            style={{
              color: tab === k ? C.green : C.muted,
              borderBottom: tab === k ? "2px solid " + C.green : "2px solid transparent",
              marginBottom: "-1px",
            }}>{lbl}</button>
        ))}
      </div>

      <AnimatePresence mode="wait">

        {tab === "abstract" && (
          <motion.div key="abstract" initial={{ opacity:0,y:8 }} animate={{ opacity:1,y:0 }} exit={{ opacity:0 }}>
            <SectionTitle n="00" t="Abstract" />
            <p className="text-[12.5px] leading-7 max-w-3xl" style={{ color: C.text }}>
              Biological systems — photosynthesis, enzyme tunneling, avian magnetoreception — operate as
              proto-quantum processors at <strong style={{ color: C.gold }}>room temperature</strong> amid
              <strong style={{ color: C.gold }}> thermal noise</strong>, using environmental interactions
              for stability rather than fighting them. Engineered QC has historically required cryogenic
              isolation. We propose a hybrid framework that imports the biological resilience strategies
              into photonic and protonic QC, achieving 10–100× energy reduction, 11.5% photon-loss tolerance
              via GHZ entangled clusters, and room-temperature universal computation.
            </p>
            <div className="grid mt-6" style={{ gridTemplateColumns: "repeat(auto-fit,minmax(160px,1fr))", gap: 1, background: C.border, border: "1px solid " + C.border }}>
              {[
                ["TARGET",     "Universal QC", C.gold],
                ["TEMPERATURE", "300 K",       C.green],
                ["BACKBONE",   "Photonic",    C.purple],
                ["MEMORY",     "Protonic",    C.orange],
                ["INSPIRATION","Quantum Bio", C.teal],
              ].map(([k,v,col]) => (
                <div key={k as string} className="p-3" style={{ background: C.panel }}>
                  <p className="text-[7.5px] tracking-[0.22em]" style={{ color: C.dim }}>{k}</p>
                  <p className="text-[14px] mt-1 font-['Cinzel',serif]" style={{ color: col as string }}>{v}</p>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {tab === "patterns" && (
          <motion.div key="patterns" initial={{ opacity:0,y:8 }} animate={{ opacity:1,y:0 }} exit={{ opacity:0 }}>
            <SectionTitle n="01" t="Biomimetic Patterns · Efficiency Across Fields" />
            <p className="text-[12px] leading-7 mb-4 max-w-3xl">
              Four recurring patterns that biology uses to extract performance from constrained resources.
              Examples already deployed: whale-fin tubercles (+40% wind-turbine efficiency), shark-skin riblets
              (aircraft drag reduction).
            </p>
            <div className="grid gap-3" style={{ gridTemplateColumns: "repeat(auto-fit,minmax(280px,1fr))" }}>
              {PATTERNS.map(p => (
                <div key={p.name} data-testid={`pattern-${p.name.toLowerCase().replace(/\W+/g, "-")}`} className="border p-4" style={{ borderColor: p.col + "40", background: p.col + "08" }}>
                  <p className="text-[10px] tracking-[0.22em] mb-2" style={{ color: p.col }}>{p.name}</p>
                  <p className="text-[11px] leading-6" style={{ color: C.text }}>{p.body}</p>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {tab === "qbio" && (
          <motion.div key="qbio" initial={{ opacity:0,y:8 }} animate={{ opacity:1,y:0 }} exit={{ opacity:0 }}>
            <SectionTitle n="02" t="Insights from Quantum Biology" />
            <div className="grid gap-3" style={{ gridTemplateColumns: "repeat(auto-fit,minmax(280px,1fr))" }}>
              {QBIO.map(q => (
                <div key={q.title} className="border p-4" style={{ borderColor: q.col + "40", background: q.col + "08" }}>
                  <p className="text-[10px] tracking-[0.22em] mb-2" style={{ color: q.col }}>{q.title}</p>
                  <p className="text-[11px] leading-6" style={{ color: C.text }}>{q.body}</p>
                </div>
              ))}
            </div>
            <Callout col={C.gold} k="OPERATING REGIME">
              These phenomena operate efficiently <strong>without isolation</strong>, suggesting QC can
              borrow resilience strategies rather than requiring millikelvin shielding.
            </Callout>
          </motion.div>
        )}

        {tab === "photonic" && (
          <motion.div key="photonic" initial={{ opacity:0,y:8 }} animate={{ opacity:1,y:0 }} exit={{ opacity:0 }}>
            <SectionTitle n="03" t="Photonic Quantum Computing · Inspired by Biology" />
            <p className="text-[12px] leading-7 mb-4 max-w-3xl">
              Photonic QC uses photons as qubits via linear optics, single-photon sources, and detectors.
              Biology supplies three direct inspirations.
            </p>
            <div className="flex flex-col gap-2">
              {PHOTONIC.map(p => (
                <div key={p.tag} className="grid border p-4" style={{
                  borderColor: C.border, borderLeft: "3px solid " + p.col, background: C.panel2,
                  gridTemplateColumns: "240px 1fr", gap: 16,
                }}>
                  <p className="text-[10px] tracking-[0.2em] self-start" style={{ color: p.col }}>{p.tag}</p>
                  <p className="text-[11.5px] leading-6" style={{ color: C.text }}>{p.body}</p>
                </div>
              ))}
            </div>
            <div className="mt-5 border p-4 flex justify-center" style={{ borderColor: C.gold + "30", background: C.panel }}>
              <PhotonAntennaSVG />
            </div>
          </motion.div>
        )}

        {tab === "protonic" && (
          <motion.div key="protonic" initial={{ opacity:0,y:8 }} animate={{ opacity:1,y:0 }} exit={{ opacity:0 }}>
            <SectionTitle n="04" t="Proton Manipulation in Quantum Computing" />
            <p className="text-[12px] leading-7 mb-4 max-w-3xl">
              Protons, as nuclear spins, offer long coherence times for qubits. Biological tunneling
              provides the gate primitives.
            </p>
            <div className="flex flex-col gap-2">
              {PROTONIC.map(p => (
                <div key={p.tag} className="grid border p-4" style={{
                  borderColor: C.border, borderLeft: "3px solid " + p.col, background: C.panel2,
                  gridTemplateColumns: "240px 1fr", gap: 16,
                }}>
                  <p className="text-[10px] tracking-[0.2em] self-start" style={{ color: p.col }}>{p.tag}</p>
                  <p className="text-[11.5px] leading-6" style={{ color: C.text }}>{p.body}</p>
                </div>
              ))}
            </div>
            <div className="mt-5 border p-4 flex justify-center" style={{ borderColor: C.orange + "30", background: C.panel }}>
              <TunnelingSVG />
            </div>
          </motion.div>
        )}

        {tab === "hybrid" && (
          <motion.div key="hybrid" initial={{ opacity:0,y:8 }} animate={{ opacity:1,y:0 }} exit={{ opacity:0 }}>
            <SectionTitle n="05" t="Integrated Revolution · Biomimetic QC Architecture" badge="6-LAYER STACK" badgeCol={C.purple} />
            <p className="text-[12px] leading-7 mb-4 max-w-3xl">
              A patterned synthesis: photonic backbone for fast low-loss computation; protonic modules for stable
              storage and tunneling-based operations. Mimics biological quantum integration.
            </p>
            <div className="grid gap-px" style={{ background: C.border, border: "1px solid " + C.border }}>
              {ARCHITECTURE.map(a => (
                <div key={a.layer} data-testid={`arch-${a.layer.substring(0,2)}`} className="grid p-3" style={{ background: C.panel, gridTemplateColumns: "240px 1fr", gap: 16 }}>
                  <p className="text-[10px] font-['Cinzel',serif]" style={{ color: a.col }}>{a.layer}</p>
                  <p className="text-[11px]" style={{ color: C.text }}>{a.desc}</p>
                </div>
              ))}
            </div>
            <Callout col={C.green} k="APPLICATIONS">
              Drug discovery via enzyme-tunneling simulation. Photosynthetic-analog energy modeling.
              Photonic hydrogen-spectrum calculations. Fault-tolerant overheads drop significantly with
              biological-inspired error correction.
            </Callout>
          </motion.div>
        )}

        {tab === "metrics" && (
          <motion.div key="metrics" initial={{ opacity:0,y:8 }} animate={{ opacity:1,y:0 }} exit={{ opacity:0 }}>
            <SectionTitle n="06" t="Resource Estimates · Where Biomimicry Wins" />
            <div className="grid gap-2" style={{ gridTemplateColumns: "repeat(auto-fit,minmax(220px,1fr))" }}>
              {METRICS.map(m => (
                <div key={m.k} data-testid={`metric-${m.k.toLowerCase().replace(/\W+/g, "-")}`} className="border p-4" style={{ borderColor: m.col + "40", background: m.col + "08" }}>
                  <p className="text-[8px] tracking-[0.22em]" style={{ color: m.col }}>{m.k}</p>
                  <p className="font-['Cinzel',serif] mt-1" style={{ color: m.col, fontSize: 28 }}>{m.v}</p>
                  <p className="text-[10px] mt-1" style={{ color: C.muted }}>{m.n}</p>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {tab === "challenges" && (
          <motion.div key="challenges" initial={{ opacity:0,y:8 }} animate={{ opacity:1,y:0 }} exit={{ opacity:0 }}>
            <SectionTitle n="07" t="Challenges and Future Directions" />
            <div className="grid gap-3" style={{ gridTemplateColumns: "1fr 1fr" }}>
              <div className="border p-4" style={{ borderColor: C.red + "40", background: C.red + "06" }}>
                <p className="text-[10px] tracking-[0.22em] mb-2" style={{ color: C.red }}>OPEN PROBLEMS</p>
                <ul className="text-[11px] space-y-2 leading-6" style={{ color: C.text }}>
                  <li>· Generating deterministic multiphoton states at scale</li>
                  <li>· Integrating protonic elements at chip scale</li>
                  <li>· Maintaining coherence across hybrid CV-DV interface</li>
                  <li>· Engineered ENAQT calibration in noisy environments</li>
                  <li>· Manufacturing reproducibility of bio-inspired emitters</li>
                </ul>
              </div>
              <div className="border p-4" style={{ borderColor: C.green + "40", background: C.green + "06" }}>
                <p className="text-[10px] tracking-[0.22em] mb-2" style={{ color: C.green }}>NEXT STEPS</p>
                <ul className="text-[11px] space-y-2 leading-6" style={{ color: C.text }}>
                  <li>· Experimental prototypes with quantum dots as photonic sources</li>
                  <li>· Ion traps for proton qubit modules</li>
                  <li>· Integration with AETHER mycelial substrate (see <code>/biomimetic-symphony</code>)</li>
                  <li>· Refinement of patterns from new quantum biology research</li>
                  <li>· Cross-link with NV spin-bath β(n) framework (see <code>/aquarium-chip</code>)</li>
                </ul>
              </div>
            </div>
            <Callout col={C.yellow} k="ETHICAL CONSIDERATION">
              Biomimetic QC could accelerate AI capability — raising energy and equity questions that should
              be addressed by the architecture, not by patches.
            </Callout>
          </motion.div>
        )}

      </AnimatePresence>

      <div className="mt-12 pt-4 border-t flex justify-between text-[8px] tracking-[0.16em] uppercase" style={{ borderColor: C.border, color: C.dim }}>
        <span>AETHER · Biomimetic Quantum · Photonic + Protonic Synthesis</span>
        <span style={{ fontFamily: "serif", fontSize: 16, color: C.green }}>η ≈ 100%</span>
        <span>nature is the ultimate innovator</span>
      </div>
    </div>
  );
}

function SectionTitle({ n, t, badge, badgeCol }: { n: string; t: string; badge?: string; badgeCol?: string }) {
  return (
    <div className="flex items-baseline gap-3 mb-4 pb-2 border-b" style={{ borderColor: C.border2 }}>
      <span className="text-[8px] tracking-[0.22em]" style={{ color: C.dim }}>{n}</span>
      <h2 className="font-['Cinzel',serif] flex-1" style={{ color: C.white, fontSize: "clamp(17px,2.4vw,23px)", fontWeight: 400 }}>{t}</h2>
      {badge && (
        <span className="text-[7.5px] tracking-[0.18em] uppercase px-2 py-1 border" style={{ color: badgeCol, borderColor: badgeCol }}>{badge}</span>
      )}
    </div>
  );
}

function Callout({ col, k, children }: { col: string; k: string; children: React.ReactNode }) {
  return (
    <div className="border p-3 mt-4" style={{ borderColor: C.border, borderLeft: "3px solid " + col, background: C.panel2 }}>
      <p className="text-[8px] tracking-[0.26em] uppercase mb-1" style={{ color: col }}>{k}</p>
      <p className="text-[12px] leading-6" style={{ color: C.text }}>{children}</p>
    </div>
  );
}

function PhotonAntennaSVG() {
  const cx = 220, cy = 130;
  return (
    <svg width="100%" viewBox="0 0 440 260" style={{ maxWidth: 600 }} data-testid="photon-antenna-svg"
         role="img" aria-labelledby="photon-title photon-desc">
      <title id="photon-title">Photosynthetic Antenna Array</title>
      <desc id="photon-desc">Chromophore array delocalizing exciton across multiple sites toward reaction center.</desc>
      {/* Chromophores in ring */}
      {Array.from({ length: 8 }, (_, i) => {
        const a = (i / 8) * Math.PI * 2;
        const x = cx + Math.cos(a) * 70;
        const y = cy + Math.sin(a) * 70;
        return (
          <g key={i}>
            <circle cx={x} cy={y} r="14" fill={C.green} opacity="0.18" />
            <circle cx={x} cy={y} r="9" fill={C.green} opacity="0.5" />
            <circle cx={x} cy={y} r="4" fill={C.green} />
            <line x1={x} y1={y} x2={cx} y2={cy} stroke={C.gold + "60"} strokeDasharray="2,2" />
          </g>
        );
      })}
      {/* Reaction center */}
      <circle cx={cx} cy={cy} r="20" fill={C.gold} opacity="0.2" />
      <circle cx={cx} cy={cy} r="12" fill={C.gold} />
      <text x={cx} y={cy + 4} textAnchor="middle" fontSize="9" fill="#000" fontFamily="Cinzel, serif">RC</text>
      {/* Incoming photon */}
      <path d="M 380 30 L 320 90" stroke={C.yellow} strokeWidth="2" markerEnd="url(#photonArrow)" />
      <text x="385" y="26" fontSize="10" fill={C.yellow} fontFamily="JetBrains Mono">hν</text>
      <text x={cx} y="240" textAnchor="middle" fontSize="9" fill={C.muted}>chromophore array · η ≈ 100% exciton transport</text>
      <defs>
        <marker id="photonArrow" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto">
          <polygon points="0 0, 6 3, 0 6" fill={C.yellow} />
        </marker>
      </defs>
    </svg>
  );
}

function TunnelingSVG() {
  return (
    <svg width="100%" viewBox="0 0 440 220" style={{ maxWidth: 560 }} data-testid="tunneling-svg"
         role="img" aria-labelledby="tun-title tun-desc">
      <title id="tun-title">Proton Tunneling Through Energy Barrier</title>
      <desc id="tun-desc">Wavefunction with non-zero amplitude on both sides of an enzyme energy barrier.</desc>
      {/* Energy barrier */}
      <path d="M 30 180 L 150 180 L 200 60 L 280 60 L 330 180 L 410 180" fill="none" stroke={C.orange} strokeWidth="2" />
      {/* Proton wavefunction (sine envelope) */}
      <path d={(() => {
        let d = "M 30 130";
        for (let x = 30; x <= 410; x += 4) {
          const env = Math.exp(-Math.pow((x - 240) / 90, 2)) * 30;
          const y = 130 - Math.cos((x - 30) * 0.3) * env;
          d += ` L ${x} ${y}`;
        }
        return d;
      })()}
      fill="none" stroke={C.teal} strokeWidth="1.5" />
      {/* Proton dot */}
      <circle cx="80" cy="130" r="6" fill={C.teal} />
      <text x="80" y="115" textAnchor="middle" fontSize="9" fill={C.teal}>H⁺</text>
      {/* Tunneled proton */}
      <circle cx="380" cy="130" r="6" fill={C.teal} opacity="0.4" />
      <text x="380" y="115" textAnchor="middle" fontSize="9" fill={C.teal} opacity="0.6">H⁺ (tunneled)</text>
      <text x="220" y="200" textAnchor="middle" fontSize="9" fill={C.muted}>energy barrier (enzyme active site)</text>
      <text x="220" y="40" textAnchor="middle" fontSize="9" fill={C.orange} fontFamily="Cinzel, serif">classical-impossible barrier crossing</text>
    </svg>
  );
}
