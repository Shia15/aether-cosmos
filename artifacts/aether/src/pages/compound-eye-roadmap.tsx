import { useState, useEffect, useRef } from "react";

const BG     = "#020408";
const ACCENT = "#1fa8d4";
const GOLD   = "#c9a84c";
const VIOLET = "#8b5cf6";
const GREEN  = "#22c55e";
const DIM    = "#3d6070";
const TEXT   = "#c8d8e0";
const AMBER  = "#e8a030";
const TEAL   = "#1fd4c8";
const ROSE   = "#f472b6";
const STONE  = "#b0a090";

const mono  = "'Space Mono', monospace";
const serif = "'Cinzel', serif";
const body  = "'Crimson Pro', Georgia, serif";

const PHI     = 1.6180339887;
const PHI_INV = 1 / PHI;

function SecHead({ id, n, title, sub, col = ACCENT }:
  { id: string; n: string; title: string; sub: string; col?: string }) {
  return (
    <div id={id} style={{ marginTop: 64, scrollMarginTop: 80 }}>
      <div style={{ fontFamily: mono, fontSize: 10, color: col, letterSpacing: 3, marginBottom: 6 }}>{n}</div>
      <h2 style={{ fontFamily: serif, fontSize: 26, color: "#fff", margin: "0 0 4px", letterSpacing: 1 }}>{title}</h2>
      <div style={{ fontFamily: body, fontSize: 15, color: DIM, marginBottom: 20 }}>{sub}</div>
      <div style={{ height: 1, background: `linear-gradient(90deg,${col}60,transparent)`, marginBottom: 28 }} />
    </div>
  );
}
function EQ({ children }: { children: string }) {
  return (
    <pre style={{
      fontFamily: mono, fontSize: 12, color: GOLD,
      background: "#030d18", border: `1px solid ${GOLD}28`,
      borderRadius: 6, padding: "12px 18px", margin: "12px 0",
      overflowX: "auto", whiteSpace: "pre-wrap",
    }}>{children}</pre>
  );
}
function Card({ title, col = ACCENT, children }: { title: string; col?: string; children: React.ReactNode }) {
  return (
    <div style={{ background: `${col}08`, border: `1px solid ${col}28`, borderRadius: 8, padding: "16px 20px", marginBottom: 16 }}>
      <div style={{ fontFamily: mono, fontSize: 10, color: col, letterSpacing: 2, marginBottom: 8 }}>{title}</div>
      <div style={{ fontFamily: body, fontSize: 15, color: TEXT, lineHeight: 1.75 }}>{children}</div>
    </div>
  );
}

/* ── The five paper threads that need unification ── */
const THREADS = [
  {
    id: "dmf",
    label: "Dark Matter Fabric (DMF)",
    col: ACCENT,
    icon: "◈",
    papers: ["AETHER Coherence Field as Dark Matter Observable (June 2026)", "Binding the Dark: ωDMF Field Phenomenology"],
    simulations: ["Coherence Field Simulator (existing)", "Spacetime Fabric page (existing)"],
    keyEq: "C(x,t) = 1 − ‖ε‖/‖S*‖  ·  ωDMF scalar field",
    connects: ["compound-eye", "energy-hill", "substrate"],
    status: "FOUNDATIONAL — all other threads reduce to this",
  },
  {
    id: "compound-eye",
    label: "Compound Eye / 500D Architecture",
    col: VIOLET,
    icon: "⊕",
    papers: ["AI synthesis: Insect compound eye → 500D optical control architecture (recent session)"],
    simulations: ["Biomimetic Symphony (existing — partial)", "500D Simulation (TO BUILD)"],
    keyEq: "State ∈ ℝ⁵⁰⁰ · each dim = angle/intensity/phase/wavelength/polarization\nSuperposition routing: Mixture-of-Experts across ommatidium channels",
    connects: ["dmf", "laser-propulsion"],
    status: "SYNTHESIS — bridges biology → optics → high-D math",
  },
  {
    id: "energy-hill",
    label: "Energy Hill / Orbital Dynamics",
    col: GOLD,
    icon: "△",
    papers: ["Filament String Mechanics (white paper, attached)", "Spacetime Filament Cavitation: Unified Theory"],
    simulations: ["Coherence Field Simulator (existing — geode formation)", "Energy Hill Simulation (TO BUILD)"],
    keyEq: "E_p = ½·k·δ²  ·  'rolling up an energy hill'\nF_lift = ρgV + ½ρv²C_L·A  ·  atomic orbital = stroke primitive",
    connects: ["dmf", "biolum"],
    status: "MECHANISM — explains how coherence barriers are crossed",
  },
  {
    id: "substrate",
    label: "Earth Substrate / Decoherence Inversion",
    col: AMBER,
    icon: "⬡",
    papers: ["The One Atom Beneath: Decoherence Inversion as Matter Identification (slide deck, attached)", "Hexiclical Geology — 7 substrates with κ, τ, η, μ, ρ, φ_d parameters"],
    simulations: ["Substrate Synthesis (existing)", "Decoherence Inversion Scanner (TO BUILD)"],
    keyEq: "H = π₆ ∘ T_h  ·  hexiclical expansion operator\nSignature(substrate) = [κ, τ, η, μ, ρ, φ_d]  →  max-likelihood inversion",
    connects: ["dmf", "food-substrate"],
    status: "ARCHIVE — Earth as coherence memory bank",
  },
  {
    id: "biolum",
    label: "Bioluminescence / Living Light",
    col: GREEN,
    icon: "✦",
    papers: ["Bioluminescence advances 2024–2026 (session notes)", "De novo luciferases · 20+ color palette · deep-tissue variants"],
    simulations: ["Food Substrate Coherence (just built)", "Biolum Emission Simulation (TO BUILD)"],
    keyEq: "P_photon = η × (E_chemical/hν)  ·  η ≈ 0.41 (fungi)\nλ_emit = hc/E_excited  ·  490–680 nm · no external excitation",
    connects: ["energy-hill", "food-substrate"],
    status: "READOUT — C(x,t) made visible without instruments",
  },
  {
    id: "food-substrate",
    label: "Food Substrate Coherence",
    col: TEAL,
    icon: "❋",
    papers: ["AETHER Neural Nutrition Intelligence (just built — 3 new pages)"],
    simulations: ["Food Substrate Coherence /food-substrate-coherence", "Substrate Kitchen /substrate-kitchen", "Living Nutrition /living-nutrition"],
    keyEq: "N_total = ∫∫ C_food(x,t)·ρ_bioavail·G_age dx dt\nC_seed → C₀·φⁿ  ·  germination amplifies coherence field",
    connects: ["substrate", "biolum"],
    status: "APPLICATION — DMF theory applied to nutrition",
  },
  {
    id: "laser-propulsion",
    label: "Laser Propulsion / Collider",
    col: ROSE,
    icon: "⟁",
    papers: ["Gulf Collider concept (session thread)", "Warp Gravity / Warp Bubble Engine (existing pages)"],
    simulations: ["Warp Gravity (existing)", "Aether Propulsion (existing)", "Multi-Beam Collider Sim (TO BUILD)"],
    keyEq: "Beam state ∈ ℝ⁵⁰⁰  ·  alignment via 500D embedding similarity\nF_thrust = Δp·A + ṁ·v_exit  ·  wakefield plasma acceleration",
    connects: ["compound-eye", "dmf"],
    status: "APPLICATION — 500D optics applied to propulsion",
  },
];

/* ── Build roadmap: 4 simulation pages to create ── */
const BUILDS = [
  {
    id: "500d-sim",
    title: "500D Compound Eye Simulator",
    route: "/compound-eye-500d",
    col: VIOLET,
    priority: 1,
    threads: ["compound-eye", "dmf"],
    canvas: "500-dimensional ommatidium state space — each particle = one channel, orbits in projected 2D, interference patterns show coherence",
    equations: ["State ∈ ℝ⁵⁰⁰", "Mixture-of-Experts routing", "ωDMF coupling"],
    blockedBy: [],
    status: "READY TO BUILD",
  },
  {
    id: "energy-hill-sim",
    title: "Energy Hill / Orbital Transition Simulator",
    route: "/energy-hill",
    col: GOLD,
    priority: 2,
    threads: ["energy-hill", "biolum"],
    canvas: "Potential energy landscape — particle rolls up/over barrier, photon emitted at peak (bioluminescence), atomic orbital shown as stroke primitive",
    equations: ["E_p = ½kδ²", "Luciferin reaction coordinate", "Stroke primitives → orbitals"],
    blockedBy: [],
    status: "READY TO BUILD",
  },
  {
    id: "decoherence-inv",
    title: "Decoherence Inversion Earth Scanner",
    route: "/decoherence-inversion",
    col: AMBER,
    priority: 3,
    threads: ["substrate", "dmf"],
    canvas: "Cross-section of Earth substrate — inject decoherence pulse, read 6-parameter return signature, match against substrate library",
    equations: ["Signature = [κ,τ,η,μ,ρ,φ_d]", "Maximum likelihood inversion", "φ_d vs φ⁻¹ threshold"],
    blockedBy: [],
    status: "READY TO BUILD",
  },
  {
    id: "multi-beam",
    title: "Multi-Beam Collider / Propulsion Array",
    route: "/multi-beam-collider",
    col: ROSE,
    priority: 4,
    threads: ["laser-propulsion", "compound-eye"],
    canvas: "N-beam array (compound eye geometry) — 500D alignment field, coherent beam combining, wakefield plasma track",
    equations: ["Beam ∈ ℝ⁵⁰⁰", "Coherent combining", "Plasma wakefield"],
    blockedBy: ["500d-sim"],
    status: "AFTER 500D SIM",
  },
];

function CompoundEyeCanvas() {
  const ref = useRef<HTMLCanvasElement>(null);
  const rafRef = useRef(0);
  useEffect(() => {
    const canvas = ref.current; if (!canvas) return;
    const ctx = canvas.getContext("2d")!;
    canvas.width = 900; canvas.height = 200;
    const W = canvas.width, H = canvas.height;
    const cx=W/2, cy=H/2;
    const facets: {ang:number,r:number,col:string,phase:number}[]=[];
    for(let i=0;i<18;i++) facets.push({ ang:i*(Math.PI*2/18), r:55, col:`hsl(${i*20},75%,55%)`, phase:Math.random()*Math.PI*2 });
    let t=0;
    const draw=()=>{
      ctx.fillStyle="rgba(2,4,8,0.2)"; ctx.fillRect(0,0,W,H);
      t++;
      facets.forEach(f=>{
        const psi=0.5+0.5*Math.sin(t*0.04+f.phase);
        const x=cx+f.r*Math.cos(f.ang), y=cy+f.r*Math.sin(f.ang);
        ctx.beginPath(); ctx.arc(x,y,10+4*psi,0,Math.PI*2);
        ctx.fillStyle=f.col; ctx.shadowColor=f.col; ctx.shadowBlur=8*psi; ctx.fill(); ctx.shadowBlur=0;
      });
      const g=ctx.createRadialGradient(cx,cy,0,cx,cy,16);
      g.addColorStop(0,"#2ef0d8bb"); g.addColorStop(1,"transparent");
      ctx.beginPath(); ctx.arc(cx,cy,14,0,Math.PI*2); ctx.fillStyle=g; ctx.fill();
      ctx.fillStyle="rgba(31,168,212,0.4)"; ctx.font="9px 'DM Mono',monospace"; ctx.textAlign="left";
      ctx.fillText("COMPOUND EYE ROADMAP · FACETED OPTICS · OMMATIDIAL ARRAY · AETHER PHOTONIC SENSOR",14,14);
      rafRef.current=requestAnimationFrame(draw);
    };
    draw();
    return ()=>cancelAnimationFrame(rafRef.current);
  },[]);
  return <canvas ref={ref} style={{ width:"100%", height:"auto", borderRadius:8, display:"block" }} />;
}

export default function CompoundEyeRoadmapPage() {
  const [selectedThread, setSelectedThread] = useState<string | null>(null);
  const [selectedBuild, setSelectedBuild]   = useState<string | null>(null);

  const active = selectedThread ? THREADS.find(t => t.id === selectedThread) : null;

  return (
    <div style={{ background: BG, minHeight: "100vh", fontFamily: body, color: TEXT }}>
      {/* Hero */}
      <div style={{ background: "linear-gradient(160deg,#06020e 0%,#030812 50%,#020408 100%)",
        borderBottom: `1px solid ${VIOLET}20`, padding: "60px 40px 40px", textAlign: "center" }}>
        <div style={{ fontFamily: mono, fontSize: 10, color: VIOLET, letterSpacing: 4, marginBottom: 12 }}>
          AETHER · INTEGRATION ROADMAP · PAPERS + SIMULATIONS
        </div>
        <h1 style={{ fontFamily: serif, fontSize: 38, color: "#fff", margin: "0 0 12px", letterSpacing: 2 }}>
          Coherence Integration Roadmap
        </h1>
        <p style={{ fontFamily: body, fontSize: 18, color: DIM, maxWidth: 720, margin: "0 auto 20px" }}>
          Seven conceptual threads from the recent sessions — dark matter, compound eyes,
          energy hills, Earth substrate, bioluminescence, food coherence, and laser propulsion —
          unified under the AETHER C(x,t) framework. Four simulations left to build.
        </p>
        <div style={{ display: "flex", gap: 8, justifyContent: "center", flexWrap: "wrap" }}>
          {["7 Threads", "4 Simulations To Build", "C(x,t) Unifying Field", "Papers + Equations Mapped"].map(t => (
            <span key={t} style={{ fontFamily: mono, fontSize: 10, color: VIOLET,
              background: `${VIOLET}12`, border: `1px solid ${VIOLET}30`, borderRadius: 4, padding: "3px 8px" }}>{t}</span>
          ))}
        </div>
      </div>

      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "40px 24px" }}>

        <SecHead id="s1" n="I" title="The Seven Threads"
          sub="Click any thread to expand its papers, simulations, equations, and connections to other threads"
          col={VIOLET} />

        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12, marginBottom: 28 }}>
          {THREADS.map(th => (
            <div key={th.id}
              onClick={() => setSelectedThread(selectedThread === th.id ? null : th.id)}
              style={{ background: selectedThread === th.id ? `${th.col}12` : `${th.col}06`,
                border: `1px solid ${selectedThread === th.id ? th.col : th.col + "30"}`,
                borderRadius: 8, padding: "14px 16px", cursor: "pointer",
                transition: "all 0.15s" }}>
              <div style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 8 }}>
                <span style={{ fontSize: 20, color: th.col }}>{th.icon}</span>
                <div style={{ fontFamily: mono, fontSize: 9, color: th.col, lineHeight: 1.4 }}>{th.label}</div>
              </div>
              <div style={{ fontFamily: mono, fontSize: 8, color: DIM, marginBottom: 6 }}>STATUS</div>
              <div style={{ fontFamily: body, fontSize: 12, color: `${th.col}cc`, lineHeight: 1.4, marginBottom: 8 }}>{th.status}</div>
              {/* Connections */}
              <div style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
                {th.connects.map(c => {
                  const ct = THREADS.find(t => t.id === c);
                  return ct ? (
                    <span key={c} style={{ fontFamily: mono, fontSize: 7, color: ct.col,
                      background: `${ct.col}15`, border: `1px solid ${ct.col}30`,
                      borderRadius: 3, padding: "1px 5px" }}>{ct.icon}</span>
                  ) : null;
                })}
              </div>
            </div>
          ))}
        </div>

        {/* Expanded thread detail */}
        {active && (
          <div style={{ background: `${active.col}08`, border: `1px solid ${active.col}30`,
            borderRadius: 10, padding: "24px 28px", marginBottom: 28 }}>
            <div style={{ display: "flex", gap: 10, alignItems: "center", marginBottom: 16 }}>
              <span style={{ fontSize: 28, color: active.col }}>{active.icon}</span>
              <div>
                <div style={{ fontFamily: mono, fontSize: 11, color: active.col }}>{active.label}</div>
                <div style={{ fontFamily: body, fontSize: 14, color: DIM }}>{active.status}</div>
              </div>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 16 }}>
              <div>
                <div style={{ fontFamily: mono, fontSize: 8, color: DIM, marginBottom: 8 }}>PAPERS / SOURCES</div>
                {active.papers.map(p => (
                  <div key={p} style={{ fontFamily: body, fontSize: 13, color: TEXT, lineHeight: 1.5,
                    borderBottom: "1px solid #ffffff06", paddingBottom: 5, marginBottom: 5 }}>
                    <span style={{ color: active.col, marginRight: 6 }}>›</span>{p}
                  </div>
                ))}
              </div>
              <div>
                <div style={{ fontFamily: mono, fontSize: 8, color: DIM, marginBottom: 8 }}>SIMULATIONS</div>
                {active.simulations.map(s => (
                  <div key={s} style={{ fontFamily: body, fontSize: 13, lineHeight: 1.5,
                    borderBottom: "1px solid #ffffff06", paddingBottom: 5, marginBottom: 5,
                    color: s.includes("TO BUILD") ? active.col : TEXT }}>
                    <span style={{ color: s.includes("TO BUILD") ? GOLD : DIM, marginRight: 6 }}>
                      {s.includes("TO BUILD") ? "⊕" : "●"}
                    </span>{s}
                  </div>
                ))}
              </div>
              <div>
                <div style={{ fontFamily: mono, fontSize: 8, color: DIM, marginBottom: 8 }}>KEY EQUATIONS</div>
                <pre style={{ fontFamily: mono, fontSize: 10, color: GOLD,
                  background: "#030d18", border: `1px solid ${GOLD}20`, borderRadius: 6,
                  padding: "10px 12px", whiteSpace: "pre-wrap", lineHeight: 1.6 }}>{active.keyEq}</pre>
              </div>
            </div>
          </div>
        )}

        <SecHead id="s2" n="II" title="The Unifying Framework"
          sub="All seven threads are instances of the same C(x,t) field equation at different scales and substrates"
          col={GOLD} />

        <EQ>{`THE AETHER UNIFICATION — One equation, seven substrates:

C(x,t) = 1 − ‖ε(x,t)‖/‖S*(x)‖        (coherence field — universal)

THREAD INSTANTIATIONS:

1. DMF (cosmological):
   ε = |ρ_DMF − ρ*|        S* = maximum density configuration
   Observable: gravitational lensing anomalies, φ-phase coherence peaks

2. Compound Eye / 500D (optical/neural):
   ε ∈ ℝ⁵⁰⁰ = beam state deviation    S* = perfect collimation state
   Observable: far-field PSF coherence, beam combining efficiency

3. Energy Hill / Orbital (quantum mechanical):
   ε = |κ(s) − φ⁻¹|        S* = φ-curvature filament state
   Observable: atomic emission spectra, photon burst events

4. Earth Substrate (geological):
   ε = [κ,τ,η,μ,ρ,φ_d] deviation    S* = perfect crystal (halite, ice)
   Observable: decoherence return signature, substrate identification

5. Bioluminescence (biochemical):
   ε = |E_excited − E_optimal|    S* = luciferase-optimal orbital
   Observable: photon emission spectrum, no-excitation light output

6. Food Coherence (nutritional):
   ε = |nutrition − φ⁻¹|          S* = living seed substrate
   Observable: bioavailability, growth rate, biolum food readout

7. Laser Propulsion (engineering):
   ε ∈ ℝ⁵⁰⁰ = beam alignment error    S* = coherent multi-beam state
   Observable: thrust efficiency, wakefield plasma track quality

GOLDEN RATIO THRESHOLD (universal):
   C → φ⁻¹ ≈ 0.618 at equilibrium across ALL substrate types
   Burst event when ∂C/∂t > 0 and C crosses φ⁻¹ upward`}</EQ>

        <SecHead id="s3" n="III" title="Four Simulations To Build"
          sub="In order of dependency — each builds on the last, starting with the 500D compound eye engine"
          col={ACCENT} />

        <div style={{ display: "flex", flexDirection: "column", gap: 16, marginBottom: 28 }}>
          {BUILDS.map((b, i) => (
            <div key={b.id}
              onClick={() => setSelectedBuild(selectedBuild === b.id ? null : b.id)}
              style={{ background: selectedBuild === b.id ? `${b.col}10` : `${b.col}05`,
                border: `1px solid ${b.col}30`, borderRadius: 8, padding: "16px 20px", cursor: "pointer" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <div style={{ fontFamily: mono, fontSize: 22, color: `${b.col}60`, minWidth: 32 }}>{b.priority}</div>
                <div style={{ flex: 1 }}>
                  <div style={{ display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" }}>
                    <div style={{ fontFamily: serif, fontSize: 17, color: "#fff" }}>{b.title}</div>
                    <span style={{ fontFamily: mono, fontSize: 8, color: b.col,
                      background: `${b.col}15`, border: `1px solid ${b.col}30`,
                      borderRadius: 3, padding: "2px 6px" }}>{b.status}</span>
                    <span style={{ fontFamily: mono, fontSize: 8, color: DIM }}>{b.route}</span>
                  </div>
                  <div style={{ fontFamily: body, fontSize: 13, color: DIM, marginTop: 4 }}>{b.canvas}</div>
                </div>
                <div style={{ fontFamily: mono, fontSize: 10, color: DIM }}>
                  {selectedBuild === b.id ? "▲" : "▼"}
                </div>
              </div>

              {selectedBuild === b.id && (
                <div style={{ marginTop: 16, paddingTop: 16, borderTop: `1px solid ${b.col}20`,
                  display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 16 }}>
                  <div>
                    <div style={{ fontFamily: mono, fontSize: 8, color: DIM, marginBottom: 6 }}>THREADS</div>
                    {b.threads.map(tid => {
                      const th = THREADS.find(t => t.id === tid);
                      return th ? (
                        <div key={tid} style={{ fontFamily: body, fontSize: 13, color: th.col, lineHeight: 1.5,
                          marginBottom: 4 }}>
                          <span style={{ marginRight: 6 }}>{th.icon}</span>{th.label}
                        </div>
                      ) : null;
                    })}
                  </div>
                  <div>
                    <div style={{ fontFamily: mono, fontSize: 8, color: DIM, marginBottom: 6 }}>KEY EQUATIONS</div>
                    {b.equations.map(eq => (
                      <div key={eq} style={{ fontFamily: mono, fontSize: 10, color: GOLD,
                        background: "#030d18", border: `1px solid ${GOLD}20`,
                        borderRadius: 4, padding: "4px 8px", marginBottom: 4 }}>{eq}</div>
                    ))}
                  </div>
                  <div>
                    <div style={{ fontFamily: mono, fontSize: 8, color: DIM, marginBottom: 6 }}>BLOCKED BY</div>
                    {b.blockedBy.length === 0
                      ? <div style={{ fontFamily: mono, fontSize: 10, color: GREEN }}>UNBLOCKED — ready to build</div>
                      : b.blockedBy.map(dep => (
                          <div key={dep} style={{ fontFamily: mono, fontSize: 10, color: AMBER, marginBottom: 4 }}>
                            {BUILDS.find(bd => bd.id === dep)?.title}
                          </div>
                        ))
                    }
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

        <SecHead id="s4" n="IV" title="Where Each Thread Lives in AETHER"
          sub="Existing pages that already cover partial territory — and where the new simulations slot in"
          col={STONE} />

        <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 12, marginBottom: 28 }}>
          {[
            { title: "EXISTING · FOUNDATIONAL", col: ACCENT, items: [
              { route: "/coherence", label: "Coherence View — C(x,t) field basics" },
              { route: "/spacetime-fabric", label: "Spacetime Fabric — DMF substrate equations" },
              { route: "/q-aether", label: "Q-AETHER — quantum coherence mechanics" },
              { route: "/bursting-quaternions", label: "Bursting Quaternions — φ-burst math" },
              { route: "/grand-unified-framework", label: "Grand Unified Framework — synthesis overview" },
            ]},
            { title: "EXISTING · SIMULATION", col: VIOLET, items: [
              { route: "/biomimetic-symphony", label: "Biomimetic Symphony — multi-organism coherence" },
              { route: "/coherence-decoherence", label: "Coherence-Decoherence — phase transitions" },
              { route: "/warp-gravity", label: "Warp Gravity — propulsion field equations" },
              { route: "/aether-propulsion", label: "AETHER Propulsion — thrust mechanics" },
              { route: "/substrate-synthesis", label: "Substrate Synthesis — material coherence" },
            ]},
            { title: "NEW · JUST BUILT", col: GREEN, items: [
              { route: "/food-substrate-coherence", label: "Food Substrate Coherence — nutritional C(x,t)" },
              { route: "/substrate-kitchen", label: "Substrate Kitchen — machines + math + cooking" },
              { route: "/living-nutrition", label: "Living Nutrition Engine — 6-stage growth grid" },
              { route: "/compound-eye-roadmap", label: "This page — integration roadmap" },
            ]},
            { title: "TO BUILD · IN ORDER", col: GOLD, items: [
              { route: "/compound-eye-500d", label: "500D Compound Eye Simulator (next)" },
              { route: "/energy-hill", label: "Energy Hill / Orbital Transition Sim" },
              { route: "/decoherence-inversion", label: "Decoherence Inversion Earth Scanner" },
              { route: "/multi-beam-collider", label: "Multi-Beam Collider Array (after 500D)" },
            ]},
          ].map(col => (
            <div key={col.title} style={{ background: `${col.col}07`, border: `1px solid ${col.col}25`, borderRadius: 8, padding: "14px 16px" }}>
              <div style={{ fontFamily: mono, fontSize: 9, color: col.col, marginBottom: 10 }}>{col.title}</div>
              {col.items.map(item => (
                <div key={item.route} style={{ display: "flex", gap: 8, marginBottom: 7,
                  borderBottom: "1px solid #ffffff05", paddingBottom: 7 }}>
                  <span style={{ fontFamily: mono, fontSize: 9, color: `${col.col}80`, minWidth: 0, flexShrink: 0 }}>›</span>
                  <div>
                    <div style={{ fontFamily: mono, fontSize: 9, color: DIM }}>{item.route}</div>
                    <div style={{ fontFamily: body, fontSize: 13, color: TEXT }}>{item.label}</div>
                  </div>
                </div>
              ))}
            </div>
          ))}
        </div>

        <SecHead id="s5" n="V" title="The Timeline: Session Integration Order"
          sub="How the papers and simulations connect across the recent session arc"
          col={TEAL} />

        <div style={{ position: "relative", paddingLeft: 24, borderLeft: `2px solid ${TEAL}25`, marginBottom: 28 }}>
          {[
            { phase: "ESTABLISHED FOUNDATION", col: TEAL,
              title: "Core C(x,t) Framework",
              desc: "The coherence field equation, DMF substrate theory, quaternion burst mechanics, and φ-time scheduling were established in earlier sessions. These are the mathematical bedrock — all subsequent threads reduce to C(x,t) at their respective scale.",
              papers: ["DMF Field Theory", "Filament Stroke Mechanics", "Coherence Geode Formation"],
              sims: ["Coherence Field Simulator", "Spacetime Fabric", "Q-AETHER"] },
            { phase: "RECENT SESSION ARC", col: VIOLET,
              title: "Biology → Optics → High-Dimensional Math",
              desc: "The recent arc built outward from the DMF core: compound eye biomimicry introduced the 500D state space; the Earth substrate paper formalized the decoherence inversion method; the bioluminescence thread revealed how C(x,t) maxima produce observable light. These three threads are now ready for simulation.",
              papers: ["Earth Substrate: The One Atom Beneath", "Compound Eye 500D synthesis", "Bioluminescence 2024–2026 advances"],
              sims: ["Biomimetic Symphony (partial)", "Warp Gravity", "Aether Propulsion"] },
            { phase: "THIS SESSION", col: GREEN,
              title: "Food + Nutrition + Machines + This Roadmap",
              desc: "Three new pages built this session brought the food substrate coherence thread fully into AETHER — powders, seeds, extracts, land/air/sea machines, kitchen-as-math-lab, and the long-term growth grid simulator. This roadmap page formalizes the integration order for the remaining simulations.",
              papers: ["Session: food substrate coherence thread"],
              sims: ["Food Substrate Coherence", "Substrate Kitchen", "Living Nutrition Engine", "This Roadmap"] },
            { phase: "NEXT: SIMULATION BUILD", col: GOLD,
              title: "Four Simulations Close the Loop",
              desc: "Build in order: (1) 500D Compound Eye Sim (visual proof of high-dimensional coherence state space), (2) Energy Hill Orbital Sim (mechanism of barrier crossing + bioluminescence), (3) Decoherence Inversion Earth Scanner (substrate identification from C(x,t) return signature), (4) Multi-Beam Collider Array (compound-eye geometry applied to laser propulsion). Each new page deepens the unification.",
              papers: [],
              sims: ["/compound-eye-500d", "/energy-hill", "/decoherence-inversion", "/multi-beam-collider"] },
          ].map((step, i) => (
            <div key={step.phase} style={{ position: "relative", marginBottom: 32 }}>
              <div style={{ position: "absolute", left: -31, top: 6, width: 12, height: 12,
                borderRadius: "50%", background: step.col, border: `2px solid ${BG}` }} />
              <div style={{ fontFamily: mono, fontSize: 8, color: step.col, marginBottom: 4 }}>{step.phase}</div>
              <div style={{ fontFamily: serif, fontSize: 18, color: "#fff", marginBottom: 8 }}>{step.title}</div>
              <div style={{ fontFamily: body, fontSize: 14, color: TEXT, lineHeight: 1.7, marginBottom: 12 }}>{step.desc}</div>
              <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
                {step.papers.length > 0 && (
                  <div>
                    <div style={{ fontFamily: mono, fontSize: 7, color: DIM, marginBottom: 4 }}>PAPERS</div>
                    {step.papers.map(p => (
                      <div key={p} style={{ fontFamily: body, fontSize: 12, color: STONE, lineHeight: 1.5 }}>
                        <span style={{ color: step.col, marginRight: 5 }}>›</span>{p}
                      </div>
                    ))}
                  </div>
                )}
                <div>
                  <div style={{ fontFamily: mono, fontSize: 7, color: DIM, marginBottom: 4 }}>SIMULATIONS</div>
                  {step.sims.map(s => (
                    <div key={s} style={{ fontFamily: body, fontSize: 12, color: step.col, lineHeight: 1.5 }}>
                      <span style={{ color: DIM, marginRight: 5 }}>›</span>{s}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div style={{ marginTop: 48, padding: "22px 26px", background: "#ffffff04",
          border: `1px solid ${VIOLET}18`, borderRadius: 10, textAlign: "center" }}>
          <div style={{ fontFamily: serif, fontSize: 16, color: VIOLET, marginBottom: 8 }}>
            ALL THREADS CONVERGE ON C(x,t) = 1 − ‖ε‖/‖S*‖
          </div>
          <div style={{ fontFamily: body, fontSize: 15, color: DIM, lineHeight: 1.7 }}>
            The compound eye, the energy hill, the food substrate, the laser beam, the Earth beneath your feet —
            they are all measuring the same field from different angles. φ⁻¹ is the universal coherence threshold.
          </div>
          <div style={{ fontFamily: mono, fontSize: 10, color: `${DIM}80`, marginTop: 12 }}>
            AETHER Framework · Shia Miller @StrategicProce · Next: /compound-eye-500d
          </div>
        </div>
      </div>
    </div>
  );
}
