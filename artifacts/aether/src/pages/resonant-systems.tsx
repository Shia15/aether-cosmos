const quantumSubstrate = "/api/storage/public-objects/5691890B-386F-4A72-A6B4-303D728077C4_1781448388514.png";
const resonantCell = "/api/storage/public-objects/65A7A2E3-063F-4F8A-A92B-D74BB81B294B_1781448388514.png";
const ancientCurrents = "/api/storage/public-objects/8D9910A2-2ACC-4CAA-8532-84639E46A5E7_1781448388514.png";
const atlantisBeacon = "/api/storage/public-objects/IMG_1764_1781448388514.jpeg";
import { useState, useEffect, useRef } from "react";

const TABS = [
  { id: "quantum",  label: "Quantum Substrate State" },
  { id: "cell",     label: "The Resonant Cell" },
  { id: "currents", label: "Ancient Current Power" },
  { id: "atlantis", label: "Atlantis Beacon Portal" },
] as const;

type TabId = (typeof TABS)[number]["id"];

function ChladniCanvas() {
  const cvRef  = useRef<HTMLCanvasElement>(null);
  const rafRef = useRef(0);

  useEffect(() => {
    const cv = cvRef.current; if (!cv) return;
    const W = 900, H = 380;
    cv.width = W; cv.height = H;
    const ctx = cv.getContext("2d")!;

    const MODES: [number,number][] = [[2,1],[2,2],[3,1],[3,2],[3,3],[4,1],[4,2],[4,3],[4,4],[5,2]];
    let modeIdx = 0, modeT = 0, fadeAlpha = 1;
    const CELL = 6;
    const GW = Math.floor(W/CELL), GH = Math.floor(H/CELL);
    const OX = (W-GW*CELL)/2, OY = (H-GH*CELL)/2;

    let t = 0;

    const chladni = (xi:number,yi:number,m:number,n:number):number => {
      const x=xi/GW, y=yi/GH;
      return Math.cos(m*Math.PI*x)*Math.cos(n*Math.PI*y) - Math.cos(n*Math.PI*x)*Math.cos(m*Math.PI*y);
    };

    const draw = () => {
      ctx.fillStyle="#020617"; ctx.fillRect(0,0,W,H);

      modeT++;
      if (modeT>240){ modeIdx=(modeIdx+1)%MODES.length; modeT=0; }
      fadeAlpha=modeT<30 ? modeT/30 : modeT>210 ? 1-(modeT-210)/30 : 1;

      const [m,n]=MODES[modeIdx];
      const threshold=0.12+0.04*Math.sin(t*0.05);

      for (let xi=0;xi<GW;xi++){
        for (let yi=0;yi<GH;yi++){
          const z=chladni(xi,yi,m,n);
          const abz=Math.abs(z);
          const px=OX+xi*CELL, py=OY+yi*CELL;
          if (abz<threshold){
            const bright=1-(abz/threshold);
            ctx.fillStyle=`rgba(74,222,128,${bright*0.75*fadeAlpha})`;
            ctx.fillRect(px,py,CELL-1,CELL-1);
          } else {
            const dark=Math.min(1,abz)*0.06*fadeAlpha;
            ctx.fillStyle=`rgba(56,189,248,${dark})`;
            ctx.fillRect(px,py,CELL-1,CELL-1);
          }
        }
      }

      const pX=W*0.78, pY=30;
      ctx.fillStyle="rgba(74,222,128,0.6)"; ctx.font="8.5px 'Space Mono',monospace";
      ctx.fillText(`MODE (m=${m}, n=${n})`,pX,pY);
      ctx.fillStyle="rgba(56,189,248,0.5)"; ctx.font="7px 'Space Mono',monospace";
      ctx.fillText("z = cos(mπx)cos(nπy) − cos(nπx)cos(mπy)",pX,pY+18);
      ctx.fillStyle="rgba(74,222,128,0.35)";
      ctx.fillText("▓ SAND · NODAL LINES",pX,pY+34);
      ctx.fillText("CHLADNI RESONANT PATTERN",pX,pY+50);

      ctx.fillStyle="rgba(74,222,128,0.2)"; ctx.font="7px 'Space Mono',monospace"; ctx.textAlign="center";
      ctx.fillText(`CHLADNI FIGURE · RESONANT STANDING WAVE · CYCLING MODES`,W/2,H-8);
      ctx.textAlign="left";

      t++; rafRef.current=requestAnimationFrame(draw);
    };

    rafRef.current=requestAnimationFrame(draw);
    return ()=>cancelAnimationFrame(rafRef.current);
  }, []);

  return <canvas ref={cvRef} style={{ width:"100%", height:"auto", display:"block", borderRadius:10 }} />;
}

function ResonantSystemsHeaderCanvas() {
  const ref = useRef<HTMLCanvasElement>(null);
  const rafRef = useRef(0);
  useEffect(() => {
    const canvas = ref.current; if (!canvas) return;
    const ctx = canvas.getContext("2d")!;
    canvas.width = 900; canvas.height = 145;
    const W = canvas.width, H = canvas.height;
    let t=0;
    const systems=[
      {x:130,y:72,col:"#2ef0d8",f:1.0},
      {x:320,y:72,col:"#9966ff",f:1.5},
      {x:510,y:72,col:"#c9a84c",f:2.0},
      {x:700,y:72,col:"#44cc77",f:2.5},
    ];
    const draw=()=>{
      ctx.fillStyle="rgba(2,4,8,0.3)"; ctx.fillRect(0,0,W,H);
      systems.forEach(s=>{
        for(let ring=1;ring<=4;ring++){
          const r=(ring*15+6*Math.sin(t*0.04*s.f+ring))*0.9;
          ctx.beginPath();ctx.arc(s.x,s.y,r,0,Math.PI*2);ctx.strokeStyle=s.col+Math.round(0.04+ring*0.06).toString(16);ctx.lineWidth=0.6;ctx.stroke();
        }
        ctx.beginPath();ctx.arc(s.x,s.y,5,0,Math.PI*2);ctx.fillStyle=s.col+"aa";ctx.fill();
        ctx.beginPath();
        for(let x=s.x-70;x<=s.x+70;x+=2){
          const y=s.y+25*Math.sin((x-s.x)*0.1*s.f+t*0.06*s.f);
          x===s.x-70?ctx.moveTo(x,y):ctx.lineTo(x,y);
        }
        ctx.strokeStyle=s.col+"55";ctx.lineWidth=0.7;ctx.stroke();
      });
      ctx.fillStyle="rgba(46,240,216,0.3)"; ctx.font="9px 'DM Mono',monospace";
      ctx.fillText("RESONANT SYSTEMS · COUPLED OSCILLATORS · FIELD HARMONICS · AETHER",14,14);
      t++; rafRef.current=requestAnimationFrame(draw);
    };
    draw();
    return ()=>cancelAnimationFrame(rafRef.current);
  },[]);
  return <canvas ref={ref} style={{width:"100%",height:"auto",borderRadius:8,display:"block"}} />;
}

export default function ResonantSystemsPage() {
  const [active, setActive] = useState<TabId>("quantum");

  return (
    <div style={{ background: "#020617", minHeight: "100vh", color: "#e2e8f0", fontFamily: "system-ui, sans-serif" }}>
      {/* Header */}
      <div style={{ background: "linear-gradient(135deg, #0f172a 0%, #0c1a0c 40%, #0f0a1a 100%)", borderBottom: "1px solid #14532d", padding: "2.5rem 2rem 2rem" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "0.75rem" }}>
            <span style={{ fontSize: "1.75rem" }}>⚛️</span>
            <span style={{ fontSize: "0.75rem", letterSpacing: "0.2em", color: "#4ade80", textTransform: "uppercase", fontWeight: 600 }}>AETHER · Resonant Systems</span>
          </div>
          <h1 style={{ fontSize: "clamp(1.6rem, 4vw, 2.6rem)", fontWeight: 800, margin: "0 0 0.5rem", background: "linear-gradient(135deg, #86efac, #4ade80, #38bdf8)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
            Resonant Systems · Quantum &amp; Ancient
          </h1>
          <p style={{ color: "#94a3b8", fontSize: "1rem", margin: 0, maxWidth: 700 }}>
            From topologically protected tritium breeding in quantum-coherent fusion substrates to 10-acre field platforms measuring coupled energy systems — and the ancient tidal power systems that powered civilization before fossil fuels.
          </p>
        </div>
      </div>

      <div style={{ padding:"1.5rem 2rem 0", maxWidth:1100, margin:"0 auto" }}>
        <div style={{ display:"inline-block", background:"rgba(74,222,128,0.1)", border:"1px solid rgba(74,222,128,0.3)",
          borderRadius:8, padding:"0.3rem 1rem", fontSize:"0.7rem", letterSpacing:"0.2em",
          color:"#86efac", textTransform:"uppercase", marginBottom:"1rem" }}>
          Live Simulation
        </div>
        <div style={{ background:"rgba(255,255,255,0.03)", border:"1px solid rgba(74,222,128,0.2)",
          borderLeft:"3px solid #4ade80", borderRadius:14, padding:"1.5rem", marginBottom:"1.5rem" }}>
          <h2 style={{ fontSize:"1.2rem", fontWeight:700, color:"#86efac", margin:"0 0 0.35rem" }}>
            Chladni Figure · Resonant Standing Wave Patterns
          </h2>
          <p style={{ color:"#94a3b8", fontSize:"0.82rem", margin:"0 0 1rem", lineHeight:1.65 }}>
            Sand on a vibrating plate self-organizes into the nodal lines of the standing wave — the places where the
            plate is not moving. Bright green = sand accumulation (nodal lines). Cycles through 10 resonant modes (m, n).
          </p>
          <ChladniCanvas />
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
                borderBottom: active === t.id ? "2px solid #4ade80" : "2px solid transparent",
                background: "transparent",
                color: active === t.id ? "#86efac" : "#64748b",
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

        {/* ── Tab 1: Quantum Substrate State ── */}
        {active === "quantum" && (
          <div>
            <div style={{ marginBottom: "1.5rem" }}>
              <h2 style={{ fontSize: "1.4rem", fontWeight: 700, color: "#86efac", margin: "0 0 0.4rem" }}>AETHER Quantum Substrate State · Substrate Quantum Diagonalization + Quantum Knotting Cycle Engaged</h2>
              <p style={{ color: "#94a3b8", margin: 0, fontSize: "0.95rem" }}>
                SUBSTRATE: EUROFER97 (F82H) · 55,316 Elements · Hamiltonian: Ĥ_total = Ĥ_n + Ĥ_Li + Ĥ_Eurofer + Ĥ_int · AETHER STATUS: RUNNING · Knot invariants stabilized.
              </p>
            </div>

            <div style={{ background: "#0f172a", border: "1px solid #1e293b", borderLeft: "4px solid #4ade80", borderRadius: "0.75rem", padding: "1.5rem", marginBottom: "1.5rem" }}>
              <img src={quantumSubstrate} alt="AETHER Quantum Substrate State — Tritium Breeding and Quantum Knotting" style={{ width: "100%", borderRadius: "0.5rem", border: "1px solid #1e293b" }} />
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "1rem" }}>
              {[
                ["Tritium Breeding Performance", "Global TBR: 1.248 ± 0.003 · Peak Local Production: 1.87×10¹⁸ T atoms/cm³/s · Extraction Efficiency (Knot-Protected): 99.4%"],
                ["Net Extractable Tritium", "≈ 1.14 kg/full power day · Self-Sufficiency Margin: 24.8% · Startup Inventory Cover: 18.7 days"],
                ["Quantum Knotting Topology", "Dominant knot types (Poloidal Plane): Trefoil (3₁) J(q) = q⁻⁴+q⁻³−q⁻¹ · Figure-Eight (4₁) · S₂ Knot"],
                ["Jones Polynomial Value", "q = e²ᵖⁱ/5 · Knot torsion max at plasma-blanket interface gaps — new info nodes generated"],
                ["Topological Protection Status", "✓ Knot invariants stabilized · ✓ Leakage paths detected & corrected · ✓ Streaming losses eliminated 97% · ✓ Quantum coherence maintained"],
                ["Eigenvalue Spectrum", "Solver: Hybrid VQE + Quantum Phase Estimation · 2.31×10⁶ → 312 modes retained · Spectrum compression: 10⁴× · Statistical uncertainty <0.01%"],
                ["Material Composition", "EUROFER97 + Breeder: Fe 86.0% · Cr 9.0% · W 1.0% · V 0.2% · Ta 0.1% · C 0.1% · Other 3.6%"],
                ["Breeder Pebble Li₂TiO₃", "Li-6 enrichment: 90.0% (operator set) · Pebble diameter: 1.0 mm · Pebble packing fraction: 0.60"],
                ["Real-Time Coherence Monitor", "Coherence Fidelity: 1.000000 ± 2.1×10⁻⁸ · Decoherence Rate: <1.0×10⁻¹² /s"],
                ["Next Actions", "SET Li-6 enrichment % · ADJUST purge gas flow/manifold · SET TBR target · SELECT blanket module to re-knot · VIEW 3D tritium inventory slice · ESCALATE to multi-knot fusion"],
                ["Extraction Pathways", "Knot-Protected: Purge Gas Manifolds · Liquid Metal Loops (LiPb) · Extraction Nodes at 95–99.9% efficiency"],
                ["AETHER Status", "RUNNING · Quantum run complete · Knot invariants stabilized · Ready for next instruction"],
              ].map(([title, desc]) => (
                <div key={title} style={{ background: "#0f172a", border: "1px solid #1e293b", borderRadius: "0.75rem", padding: "1rem" }}>
                  <div style={{ color: "#86efac", fontSize: "0.82rem", fontWeight: 700, marginBottom: "0.35rem" }}>{title}</div>
                  <div style={{ color: "#94a3b8", fontSize: "0.75rem", lineHeight: 1.5 }}>{desc}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── Tab 2: The Resonant Cell ── */}
        {active === "cell" && (
          <div>
            <div style={{ marginBottom: "1.5rem" }}>
              <h2 style={{ fontSize: "1.4rem", fontWeight: 700, color: "#86efac", margin: "0 0 0.4rem" }}>AETHER · The Resonant Cell · 10-Acre Field Platform</h2>
              <p style={{ color: "#94a3b8", margin: 0, fontSize: "0.95rem" }}>
                A multi-scale field platform measuring coupled energy systems. "Energy is measured in isolation; interactions across domains are invisible." The Resonant Cell makes them visible. "The Resonant Cell measures energy as it actually flows. Ground. Air. Water. Connected."
              </p>
            </div>

            <div style={{ background: "#0f172a", border: "1px solid #1e293b", borderLeft: "4px solid #4ade80", borderRadius: "0.75rem", padding: "1.5rem", marginBottom: "1.5rem" }}>
              <img src={resonantCell} alt="AETHER The Resonant Cell — 10-Acre Field Platform" style={{ width: "100%", borderRadius: "0.5rem", border: "1px solid #1e293b" }} />
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(230px, 1fr))", gap: "1rem" }}>
              {[
                ["The Core Problem", "Energy is measured in isolation — solar panels measure DC output, grids measure AC flow, soil sensors measure conductivity, but interactions across domains are invisible. The Resonant Cell integrates all."],
                ["10-Acre Field Platform", "A 10-acre circular sensor array with a central resonant hub — the geometry maximizes cross-domain field coupling measurement while minimizing edge effects"],
                ["Data Streams", "Ground Potential · Atmosphere E-Field · EM Spectrum · Solar DC Output · Soil Conductivity · Thermal Gradient — all sampled at high frequency and cross-correlated"],
                ["Integrated Sensor Network", "Multi-layer sensor array · High-frequency sampling · Edge processing & data flow · Calibration & validation — the sensors live in the field, not in a lab"],
                ["Early Results", "Coherent signals across domains · Branched energy propagation (nonlinear) · Anomalies detected — the field behaves as a coupled nonlinear system, not a sum of independent parts"],
                ["Energy Propagation", "Energy behaves as a coupled field — propagation is nonlinear and branched. The same solar input produces different ground potential responses depending on soil moisture and EM background."],
                ["Impact & Applications", "Renewable Energy Efficiency · Grid Stability Modeling · Open Data for Research — Phase 1: Deploy & Validate ($200K–$350K) · Phase 2: Multi-Site Expansion · Phase 3: Global Energy Network"],
                ["The Vision", "A global network of Resonant Cells — measuring how energy actually flows through the living Earth system. Ground truth for climate models, grid design, and resonance-based energy harvesting."],
              ].map(([title, desc]) => (
                <div key={title} style={{ background: "#0f172a", border: "1px solid #1e293b", borderRadius: "0.75rem", padding: "1rem" }}>
                  <div style={{ color: "#86efac", fontSize: "0.82rem", fontWeight: 700, marginBottom: "0.35rem" }}>{title}</div>
                  <div style={{ color: "#94a3b8", fontSize: "0.75rem", lineHeight: 1.5 }}>{desc}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── Tab 3: Ancient Current Power ── */}
        {active === "currents" && (
          <div>
            <div style={{ marginBottom: "1.5rem" }}>
              <h2 style={{ fontSize: "1.4rem", fontWeight: 700, color: "#86efac", margin: "0 0 0.4rem" }}>How We Used to Draw These Currents to Power Batteries · Ancient Principles. Natural Flows. Electrical Power.</h2>
              <p style={{ color: "#94a3b8", margin: 0, fontSize: "0.95rem" }}>
                Long before fossil fuels, we learned to work with nature. Ocean currents, tides, and the moon's pull were drawn through engineered systems to generate electricity and charge batteries. We didn't fight nature. We worked with it.
              </p>
            </div>

            <div style={{ background: "#0f172a", border: "1px solid #1e293b", borderLeft: "4px solid #4ade80", borderRadius: "0.75rem", padding: "1.5rem", marginBottom: "1.5rem" }}>
              <img src={ancientCurrents} alt="How We Used to Draw Ocean Currents to Power Batteries — Ancient Tidal Power" style={{ width: "100%", borderRadius: "0.5rem", border: "1px solid #1e293b" }} />
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "1rem", marginBottom: "1rem" }}>
              {[
                ["1. Understanding the Currents", "Observed the rhythm of the seas — tides, moon phases, and deep currents. Using knowledge passed through generations, they mapped the flows: Tides · Ocean Currents · Moon's Gravity · Temperature Gradients"],
                ["2. Drawing the Flow", "Built systems to draw moving water through channels and spirals: Tidal Gates · Flow Channels · Spiral Conduits · Pressure Ducts — water was directed like a living river into the mechanical heart"],
                ["3. Turning Motion into Energy", "Moving water spun water wheels and turbines: Horizontal Wheels · Vertical Turbines · Oscillating Blades · Pressure Rotation — the rotation of the planet expressed through engineered motion"],
                ["4. Generating Electricity", "Turbines powered dynamos / magneto-electric generators: Copper Coils · Iron Cores · Magnetic Rotors · Voltage Output — the same physics as modern power plants, discovered millennia earlier"],
                ["5. Storing the Power", "Electricity stored in natural batteries: Lead Acid Cells · Saltwater Cells · Flow Batteries · Capacitors — energy held for later use, grid-independent"],
                ["System in Action", "Natural Force (Currents & Tides) → Mechanical Motion (Wheels & Turbines) → Electrical Generation (Dynamos) → Power Storage (Batteries) → Usable Energy (Light, Tools, Transport)"],
                ["What They Powered", "Lighting · Communication · Tools & Machinery · Water Pumps & Irrigation · Transportation (sailboats, trolleys) — a complete civilization running on Earth-resonant energy"],
                ["Natural Battery Examples", "Lead Acid Battery · Saltwater Battery · Flow Battery · Clay & Copper Battery — these are not primitive. They are elegant minimal-material solutions to energy storage."],
              ].map(([title, desc]) => (
                <div key={title} style={{ background: "#0f172a", border: "1px solid #1e293b", borderRadius: "0.75rem", padding: "1rem" }}>
                  <div style={{ color: "#86efac", fontSize: "0.82rem", fontWeight: 700, marginBottom: "0.35rem" }}>{title}</div>
                  <div style={{ color: "#94a3b8", fontSize: "0.75rem", lineHeight: 1.5 }}>{desc}</div>
                </div>
              ))}
            </div>

            <div style={{ background: "#0c1a0c", border: "1px solid #14532d", borderRadius: "0.75rem", padding: "1rem", textAlign: "center" }}>
              <div style={{ color: "#86efac", fontWeight: 700, fontSize: "0.95rem" }}>
                "We didn't fight nature. We worked with it. We drew the currents, and they powered our world."
              </div>
              <div style={{ color: "#64748b", fontSize: "0.8rem", marginTop: "0.25rem" }}>The knowledge remains. The time to remember is now.</div>
            </div>
          </div>
        )}

        {/* ── Tab 4: Atlantis Beacon Portal ── */}
        {active === "atlantis" && (
          <div>
            <div style={{ marginBottom: "1.5rem" }}>
              <h2 style={{ fontSize: "1.4rem", fontWeight: 700, color: "#86efac", margin: "0 0 0.4rem" }}>Atlantis Beacon Portal · 13-Month Cycle</h2>
              <p style={{ color: "#94a3b8", margin: 0, fontSize: "0.95rem" }}>
                90-Day Intensity Protocol — Reflect Reality into Structure. A lunar-cycle tracking map aligned to the Capricorn Atlantis Beacon Portal (May 9, 2026), pole shift timing, and a 26,000-year precession cycle.
              </p>
            </div>

            <div style={{ background: "#0f172a", border: "1px solid #1e293b", borderLeft: "4px solid #a78bfa", borderRadius: "0.75rem", padding: "1.5rem", marginBottom: "1.5rem" }}>
              <img src={atlantisBeacon} alt="Atlantis Beacon Portal — 13-Month Lunar Cycle July 2025 to July 2026" style={{ width: "100%", borderRadius: "0.5rem", border: "1px solid #1e293b" }} />
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "1rem" }}>
              {[
                ["Atlantis Beacon Portal", "May 9, 2026 · Capricorn ♑ symbol at center · Portal anchor in a 26,000-year precession cycle — the moment of maximum coherence in a full great year"],
                ["26K Year Cycle", "Earth's axial precession completes in approximately 25,772 years — the great year. May 9, 2026 marks a calculable node point in this cycle corresponding to the Capricorn gateway"],
                ["Pole Shift Reference", "Arrow pointing to Pole Shift ← · The portal aligns with the theoretical geomagnetic/geographic axis realignment window currently being tracked in geophysical monitoring"],
                ["Oct 15, 2025 · AI Atlas Trigger", "The first observable trigger point — AI Atlas activation event aligned to the lunar cycle. Information Input Bar on right side indicates live tracking protocol"],
                ["Oct 21, 2025 · 12:29 AM · Dynamic", "Precise dynamic moment — full moon in dynamic configuration. The cyan spiral highlights this as the primary energetic peak of the Oct–Nov window"],
                ["Oct 21, 2025 · Dynamic", "Second Oct 21 marker — double-peak dynamic event. The proximity suggests a 2-peak resonance within a 24-hour window"],
                ["Nov 29, 2025 · Blind Observation", "Transition from active tracking to blind observation — internal state only, no external validation, reflecting pure inner knowing"],
                ["13-Month Cycle", "13 full moons arranged in an orbital circle · July 2025 to July 2026 · The 13th moon completes the year-long integration protocol"],
                ["90-Day Intensity Protocol", "Reflect Reality into Structure — the 90-day working period between trigger events. Each window corresponds to one quarter of the 26K cycle at human-perception scale"],
                ["Information Input Bar", "Right side bar labeled 'Information Input Bar' with X close button — indicates this is an interactive tracking interface, not a static map. Live inputs modify the portal activation state"],
              ].map(([title, desc]) => (
                <div key={title} style={{ background: "#0f172a", border: "1px solid #1e293b", borderRadius: "0.75rem", padding: "1rem" }}>
                  <div style={{ color: "#c4b5fd", fontSize: "0.82rem", fontWeight: 700, marginBottom: "0.35rem" }}>{title}</div>
                  <div style={{ color: "#94a3b8", fontSize: "0.75rem", lineHeight: 1.5 }}>{desc}</div>
                </div>
              ))}
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
