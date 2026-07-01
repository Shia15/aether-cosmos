import { useState, useEffect, useRef } from "react";

const PHI = 1.618033988749895;
const PHI_INV = 1 / PHI;

// ── MATH ENGINE ────────────────────────────────────────────────────────────
function computeEngine(params) {
  const { medium, scale, purpose, coherenceTarget, phi_harmonic } = params;

  const scaleM = [1e-9, 1e-6, 1e-3, 1.0, 1e3][scale];
  const scaleLabel = ["Nano (nm)", "Micro (μm)", "Meso (mm)", "Macro (m)", "Mega (km)"][scale];

  const rho = { water: 1000, air: 1.225, vacuum: 1e-12, plasma: 0.001, tissue: 1050, rock: 2700 }[medium];

  // Purpose modifies the effective coherence demand and output emphasis
  const purposeMod = {
    "Propulsion": { thrustW: 1.0, sensW: 0.3, powW: 0.5, compW: 0.2, healW: 0.1, commW: 0.2 },
    "Sensing": { thrustW: 0.2, sensW: 1.0, powW: 0.3, compW: 0.5, healW: 0.3, commW: 0.4 },
    "Power Generation": { thrustW: 0.3, sensW: 0.3, powW: 1.0, compW: 0.2, healW: 0.2, commW: 0.2 },
    "Computation": { thrustW: 0.1, sensW: 0.4, powW: 0.3, compW: 1.0, healW: 0.2, commW: 0.6 },
    "Healing": { thrustW: 0.1, sensW: 0.5, powW: 0.2, compW: 0.3, healW: 1.0, commW: 0.3 },
    "Communication": { thrustW: 0.1, sensW: 0.5, powW: 0.3, compW: 0.6, healW: 0.2, commW: 1.0 },
  }[purpose];

  const phases = Array.from({length: 6}, (_, i) => (i * 2 * Math.PI / PHI) % (2 * Math.PI));
  const St = 0.2 + (coherenceTarget - 0.5) * 0.4;

  const Gamma = 2 * Math.PI * scaleM * coherenceTarget;
  const L_ring = 2 * Math.PI * scaleM * PHI_INV;
  const v_ring = (St * scaleM) / (scaleM / 10 + 1e-12) * 0.1;
  const F_thrust = rho * Gamma * L_ring * Math.max(v_ring, 1e-20) * purposeMod.thrustW;

  const eta_prop = (0.75 + (coherenceTarget - PHI_INV) * 0.5) * (0.6 + purposeMod.thrustW * 0.4);
  const P_required = F_thrust > 0 ? F_thrust * v_ring / Math.max(eta_prop, 0.01) : 0;

  const tau_BEC = (phi_harmonic ? scaleM * PHI * 1e6 : scaleM * 1e6) * (0.5 + purposeMod.sensW * 0.5);
  const f_resonant = St * v_ring / Math.max(scaleM, 1e-12);

  const fib = [1,1,2,3,5,8,13,21,34,55,89,144,233,377];
  const nodeIdx = Math.min(scale * 3 + 2, fib.length - 1);
  const nodes = fib[nodeIdx];

  // Sensing sensitivity, power output, compute throughput, healing dose, comm bandwidth
  const sensSensitivity = coherenceTarget * purposeMod.sensW * (1/scaleM) * 1e-15;
  const powerOutput = rho * scaleM * scaleM * scaleM * coherenceTarget * purposeMod.powW * 1e3;
  const computeOps = nodes * f_resonant * purposeMod.compW * (phi_harmonic ? PHI : 1);
  const healDose = coherenceTarget * purposeMod.healW * Math.exp(-scaleM) * 100;
  const commBandwidth = f_resonant * nodes * purposeMod.commW * 1e-3;

  const architectures = {
    water: {
      name: "QMOSL Oscillating Snowflake Lattice",
      type: "Marine Vortex Ring Engine",
      mechanism: "6-fold φ-harmonic pulsed bubble-jet + coherent toroidal vortex rings",
      material: "Elastic polymer lattice + slime coating + photonic backbone",
      looks: "Flexible snowflake cube with oscillating tunnel nozzles and bioluminescent sensing skin",
    },
    air: {
      name: "Wave-Vortex Propulsion Surface",
      type: "Atmospheric Traveling Wave Engine",
      mechanism: "Distributed surface wave → pressure pulsation → vortex ring shedding",
      material: "Smart adaptive skin lattice with piezo actuators + zero-drag surface",
      looks: "Smooth dolphin-shaped body with rippling surface waves and toroidal wake rings",
    },
    vacuum: {
      name: "AQISP Coherence Field Drive",
      type: "Quantum Interferometric Field Engine",
      mechanism: "BEC coherence pressure gradient + atom interferometric phase coupling",
      material: "DC-native solar BEC substrate + programmable magnetic geometry",
      looks: "Compact crystalline cube with glowing atomic trap arrays and magnetic field sculptures",
    },
    plasma: {
      name: "High-β Plasmoid Reconnection Engine",
      type: "Plasma Vortex Field Drive",
      mechanism: "Magnetic reconnection + plasmoid ejection + coherence warp coupling",
      material: "Superconducting coil array + plasma containment vessel",
      looks: "Toroidal ring structure with plasma ribbons and pulsing reconnection events",
    },
    tissue: {
      name: "Biophotonic Coherence Motor",
      type: "Biological Coherence Engine",
      mechanism: "φ-spiral biophoton emission + mycelium SOC network + cellular vortex actuation",
      material: "Living synthetic cell lattice + luciferin/luciferase energy system",
      looks: "Pulsing organic sphere with glowing φ-spiral light patterns and mycelial network",
    },
    rock: {
      name: "Geological Substrate Resonance Driver",
      type: "Seismic Coherence Actuator",
      mechanism: "Phonon-coupled resonance at substrate natural frequencies + coherence fossil activation",
      material: "Piezoelectric crystal array + φ-lattice acoustic transducers",
      looks: "Crystalline slab with embedded sensor nodes radiating coherent seismic waves",
    },
  };

  const arch = architectures[medium];
  const stability = coherenceTarget >= PHI_INV ? "STABLE ✓" : "⚠ BELOW φ⁻¹ THRESHOLD";
  const stability_color = coherenceTarget >= PHI_INV ? "#00ff88" : "#ff4444";

  return {
    arch, phases, St, Gamma, L_ring, v_ring,
    F_thrust, eta_prop, P_required, tau_BEC, f_resonant,
    nodes, scaleLabel, scaleM, rho, purposeMod,
    sensSensitivity, powerOutput, computeOps, healDose, commBandwidth,
    stability, stability_color,
    phi_phases: phases.map(p => (p * 180 / Math.PI).toFixed(1)),
  };
}

// purpose-specific primary readouts (so every Purpose button visibly changes the dashboard)
function purposeMetrics(result, purpose) {
  const fmtLocal = (n, unit) => fmt(n, unit);
  switch (purpose) {
    case "Sensing":
      return [
        { label: "Sensitivity", val: fmtLocal(result.sensSensitivity, "T") },
        { label: "τ Coherence", val: fmtLocal(result.tau_BEC, "s") },
        { label: "f Resonant", val: fmtLocal(result.f_resonant, "Hz") },
        { label: "Lattice Nodes", val: result.nodes },
      ];
    case "Power Generation":
      return [
        { label: "Power Out", val: fmtLocal(result.powerOutput, "W") },
        { label: "η Conversion", val: (result.eta_prop * 100).toFixed(1) + "%" },
        { label: "Scale", val: result.scaleLabel },
        { label: "ρ Medium", val: result.rho + " kg/m³" },
      ];
    case "Computation":
      return [
        { label: "Ops Throughput", val: fmtLocal(result.computeOps, "ops/s") },
        { label: "Lattice Nodes", val: result.nodes },
        { label: "f Resonant", val: fmtLocal(result.f_resonant, "Hz") },
        { label: "φ-Boost", val: result.tau_BEC > 0 ? "Active" : "Off" },
      ];
    case "Healing":
      return [
        { label: "Coherence Dose", val: result.healDose.toFixed(2) + " u" },
        { label: "Scale", val: result.scaleLabel },
        { label: "τ Coherence", val: fmtLocal(result.tau_BEC, "s") },
        { label: "Stability", val: result.stability.split(" ")[0] },
      ];
    case "Communication":
      return [
        { label: "Bandwidth", val: fmtLocal(result.commBandwidth, "bps") },
        { label: "Lattice Nodes", val: result.nodes },
        { label: "f Resonant", val: fmtLocal(result.f_resonant, "Hz") },
        { label: "η Channel", val: (result.eta_prop * 100).toFixed(1) + "%" },
      ];
    default: // Propulsion
      return [
        { label: "Thrust F", val: fmtLocal(result.F_thrust, "N") },
        { label: "η Propulsive", val: (result.eta_prop * 100).toFixed(1) + "%" },
        { label: "Power P", val: fmtLocal(result.P_required, "W") },
        { label: "St (Strouhal)", val: result.St.toFixed(3) },
      ];
  }
}

// ── VISUAL ENGINE RENDERER ─────────────────────────────────────────────────
function EngineViz({ result, medium, scale, coherence, time, purpose }) {
  const { nodes, f_resonant } = result;
  const pulse = Math.sin(time * Math.max(f_resonant, 0.5) * 0.01 + 0.5) * 0.5 + 0.5;
  const colors = {
    water: "#4488ff", air: "#88ffcc", vacuum: "#cc44ff",
    plasma: "#ff8844", tissue: "#44ff88", rock: "#ffcc44"
  };
  const col = colors[medium];
  const sz = 200;
  const cx = sz/2, cy = sz/2;
  const r = 50 + scale * 9;

  // purpose overlay glyph (always rendered so every Purpose button changes the visual)
  const purposeGlyph = () => {
    switch (purpose) {
      case "Sensing":
        return (
          <g opacity={0.85}>
            {[0.4, 0.65, 0.9].map((rv, i) => (
              <circle key={i} cx={cx} cy={cy} r={r * rv * (1 + pulse * 0.05)}
                fill="none" stroke="#ffffff" strokeWidth={0.6} opacity={0.15 + i * 0.07} />
            ))}
            <circle cx={cx} cy={cy} r={3 + pulse * 2} fill="#ffffff" opacity={0.6} />
          </g>
        );
      case "Power Generation":
        return (
          <g opacity={0.9}>
            {Array.from({ length: 8 }, (_, i) => {
              const a = i * Math.PI / 4;
              const len = r * (0.3 + pulse * 0.5);
              return <line key={i} x1={cx + r*0.25*Math.cos(a)} y1={cy + r*0.25*Math.sin(a)}
                x2={cx + len*Math.cos(a)} y2={cy + len*Math.sin(a)}
                stroke="#ffee44" strokeWidth={1.5} opacity={0.5 + pulse*0.3} />;
            })}
          </g>
        );
      case "Computation":
        return (
          <g opacity={0.9}>
            {Array.from({ length: Math.min(nodes, 21) }, (_, i) => {
              const a = i * 2 * Math.PI / PHI;
              const rad = r * 0.85;
              const x = cx + rad * Math.cos(a) * 0.5, y = cy + rad * Math.sin(a) * 0.5;
              return <rect key={i} x={x-2} y={y-2} width={4} height={4}
                fill="#88ffff" opacity={0.4 + ((i + time*0.05) % 3 === 0 ? 0.5 : 0)} />;
            })}
          </g>
        );
      case "Healing":
        return (
          <g opacity={0.85}>
            <circle cx={cx} cy={cy} r={r * 0.95 * (1 + pulse*0.08)} fill="none"
              stroke="#ff99cc" strokeWidth={1.2} opacity={0.4 + pulse*0.3} />
            <circle cx={cx} cy={cy} r={r * 0.5} fill="#ff99cc11" />
          </g>
        );
      case "Communication":
        return (
          <g opacity={0.85}>
            {[0.3,0.5,0.7,0.9].map((rv,i) => (
              <path key={i} d={`M ${cx - r*rv} ${cy} A ${r*rv} ${r*rv} 0 0 1 ${cx + r*rv} ${cy}`}
                fill="none" stroke="#aaddff" strokeWidth={1}
                opacity={((time*0.02 + i) % 4 < 1) ? 0.6 : 0.1} />
            ))}
          </g>
        );
      default:
        return null;
    }
  };

  const renderEngine = () => {
    if (medium === "water" || medium === "air") {
      const arms = Array.from({length: 6}, (_, i) => {
        const angle = (i * 2 * Math.PI / PHI) % (2 * Math.PI);
        const len = r * (0.7 + pulse * 0.3);
        return { x1: cx, y1: cy, x2: cx + len * Math.cos(angle), y2: cy + len * Math.sin(angle), angle };
      });
      return (
        <g>
          {[0.3,0.5,0.7,0.9].map((rv,i) => (
            <circle key={i} cx={cx} cy={cy} r={r*rv*(1+pulse*0.1)}
              fill="none" stroke={col} strokeWidth={1} opacity={0.2 + rv * 0.3}
              strokeDasharray={`${4+i*2},${3+i}`} />
          ))}
          {arms.map((a,i) => (
            <g key={i}>
              <line x1={a.x1} y1={a.y1} x2={a.x2} y2={a.y2} stroke={col} strokeWidth={2} opacity={0.8} />
              <circle cx={a.x2} cy={a.y2} r={4+pulse*3} fill={col} opacity={0.9} />
              {[0.4,0.7].map((frac,j) => {
                const subAngle = a.angle + Math.PI/3;
                return (
                  <line key={j} x1={cx+(a.x2-cx)*frac} y1={cy+(a.y2-cy)*frac}
                    x2={cx+(a.x2-cx)*frac + 15*Math.cos(subAngle)}
                    y2={cy+(a.y2-cy)*frac + 15*Math.sin(subAngle)}
                    stroke={col} strokeWidth={1} opacity={0.5} />
                );
              })}
            </g>
          ))}
          <circle cx={cx} cy={cy} r={8+pulse*4} fill={col} opacity={0.9} />
          <circle cx={cx} cy={cy} r={14+pulse*2} fill="none" stroke={col} strokeWidth={1.5} opacity={0.6} />
          <circle cx={cx} cy={cy} r={r*PHI_INV} fill="none" stroke="#ffffff44" strokeWidth={1} strokeDasharray="4,3" />
        </g>
      );
    }

    if (medium === "vacuum") {
      return (
        <g>
          {Array.from({length: Math.min(nodes, 13)}, (_,i) => {
            const angle = i * 2*Math.PI*PHI_INV;
            const rad = (20 + (i%3)*18) * (1 + pulse*0.1);
            const x = cx + rad*Math.cos(angle), y = cy + rad*Math.sin(angle);
            return (
              <g key={i}>
                <rect x={x-4} y={y-4} width={8} height={8}
                  fill={col+"44"} stroke={col} strokeWidth={1}
                  transform={`rotate(45,${x},${y})`} opacity={0.8+pulse*0.2} />
                <line x1={cx} y1={cy} x2={x} y2={y} stroke={col} strokeWidth={0.5} opacity={0.3} />
              </g>
            );
          })}
          <circle cx={cx} cy={cy} r={r*PHI_INV} fill="none" stroke={col} strokeWidth={1.5} strokeDasharray="3,3" opacity={0.8} />
          <circle cx={cx} cy={cy} r={10+pulse*5} fill={col} opacity={0.9} />
          <text x={cx} y={cy+4} textAnchor="middle" fill="#000" fontSize="8" fontWeight="bold">BEC</text>
        </g>
      );
    }

    if (medium === "plasma") {
      return (
        <g>
          {[0.5,0.7,0.9].map((rv,i) => (
            <ellipse key={i} cx={cx} cy={cy} rx={r*rv} ry={r*rv*0.4*(1+i*0.1)}
              fill="none" stroke={col} strokeWidth={2-i*0.3} opacity={0.3+pulse*0.5}
              strokeDasharray={`${6+i*3},${2+i}`} />
          ))}
          {Array.from({length:8},(_,i) => {
            const a = i*Math.PI/4 + time*0.02;
            return <circle key={i} cx={cx+r*0.7*Math.cos(a)} cy={cy+r*0.28*Math.sin(a)}
              r={3+pulse*3} fill={col} opacity={0.7} />;
          })}
          <circle cx={cx} cy={cy} r={12+pulse*4} fill={col} opacity={0.8} />
        </g>
      );
    }

    if (medium === "tissue") {
      const spiralPts = Array.from({length:34}, (_,i) => {
        const angle = i * 2*Math.PI/PHI;
        const rad = i * 2.5;
        return { x: cx+rad*Math.cos(angle), y: cy+rad*Math.sin(angle) };
      });
      return (
        <g>
          {spiralPts.slice(1).map((p,i) => (
            <line key={i} x1={spiralPts[i].x} y1={spiralPts[i].y} x2={p.x} y2={p.y}
              stroke={col} strokeWidth={1} opacity={0.6} />
          ))}
          {spiralPts.filter((_,i)=>i%5===0).map((p,i) => (
            <circle key={i} cx={p.x} cy={p.y} r={3+pulse*2} fill={col} opacity={0.7+pulse*0.3} />
          ))}
          <circle cx={cx} cy={cy} r={r*PHI_INV} fill="none" stroke="#ffffff33" strokeWidth={1} strokeDasharray="3,3" />
        </g>
      );
    }

    if (medium === "rock") {
      const grid = [];
      for (let i=-3;i<=3;i++) for (let j=-3;j<=3;j++) {
        const x = cx + i*20, y = cy + j*20, d = Math.sqrt(i*i+j*j);
        if (d < 4) grid.push({x,y,d});
      }
      return (
        <g>
          {grid.map((p,i) => (
            <g key={i}>
              <rect x={p.x-5} y={p.y-5} width={10} height={10}
                fill={col+"33"} stroke={col} strokeWidth={1} opacity={0.5 + pulse*0.3*(1-p.d/5)} />
              {p.d < 2 && <circle cx={p.x} cy={p.y} r={2+pulse*2} fill={col} opacity={0.8} />}
            </g>
          ))}
          <circle cx={cx} cy={cy} r={r*PHI_INV} fill="none" stroke="#ffffff33" strokeWidth={1} strokeDasharray="3,3" />
        </g>
      );
    }

    return <circle cx={cx} cy={cy} r={r} fill={col+"33"} stroke={col} strokeWidth={2} />;
  };

  return (
    <svg width={sz} height={sz} style={{background:"#06060f",borderRadius:"50%",border:`2px solid ${col}33`}}>
      {renderEngine()}
      {purposeGlyph()}
      <circle cx={cx} cy={cy} r={sz/2-4} fill="none" stroke={col} strokeWidth={1} opacity={0.15+pulse*0.1} />
    </svg>
  );
}

// ── HELPERS ─────────────────────────────────────────────────────────────
function fmt(n, unit) {
  if (n === undefined || n === null || isNaN(n)) return "—";
  const sign = n < 0 ? "-" : "";
  n = Math.abs(n);
  if (n > 1e9) return sign+(n/1e9).toFixed(2)+" G"+unit;
  if (n > 1e6) return sign+(n/1e6).toFixed(2)+" M"+unit;
  if (n > 1e3) return sign+(n/1e3).toFixed(2)+" k"+unit;
  if (n === 0) return "0 "+unit;
  if (n < 1e-9) return sign+(n*1e12).toFixed(2)+" p"+unit;
  if (n < 1e-6) return sign+(n*1e9).toFixed(2)+" n"+unit;
  if (n < 1e-3) return sign+(n*1e6).toFixed(2)+" μ"+unit;
  if (n < 1) return sign+(n*1e3).toFixed(2)+" m"+unit;
  return sign+n.toFixed(3)+" "+unit;
}

// ── MAIN APP ───────────────────────────────────────────────────────────────
const mediums = [
  {id:"water", label:"💧 Water", desc:"Marine / Subsurface Ocean"},
  {id:"air", label:"💨 Air", desc:"Atmospheric / Aerial"},
  {id:"vacuum", label:"⚡ Vacuum", desc:"Space / Quantum"},
  {id:"plasma", label:"🌊 Plasma", desc:"High-Energy / Fusion"},
  {id:"tissue", label:"🧬 Tissue", desc:"Biological / Medical"},
  {id:"rock", label:"🪨 Rock", desc:"Geological / Planetary"},
];

const scales = ["Nano", "Micro", "Meso", "Macro", "Mega"];
const purposes = ["Propulsion","Sensing","Power Generation","Computation","Healing","Communication"];

export default function EngineDesignerPage() {
  const [medium, setMedium] = useState("water");
  const [scale, setScale] = useState(3);
  const [purpose, setPurpose] = useState("Propulsion");
  const [coherence, setCoherence] = useState(0.75);
  const [phiHarmonic, setPhiHarmonic] = useState(true);
  const [time, setTime] = useState(0);
  const [searching, setSearching] = useState(false);
  const [searchResult, setSearchResult] = useState(null);
  const rafRef = useRef();

  useEffect(() => {
    const tick = () => { setTime(t => t+1); rafRef.current = requestAnimationFrame(tick); };
    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current);
  }, []);

  const result = computeEngine({ medium, scale, purpose, coherenceTarget: coherence, phi_harmonic: phiHarmonic });
  const metrics = purposeMetrics(result, purpose);

  const findBestEngine = () => {
    setSearching(true);
    setTimeout(() => {
      let best = null, bestScore = -Infinity;
      mediums.forEach(m => {
        [0,1,2,3,4].forEach(s => {
          [0.62,0.75,0.85,0.95].forEach(c => {
            const r = computeEngine({ medium:m.id, scale:s, purpose, coherenceTarget:c, phi_harmonic:true });
            const pmetrics = purposeMetrics(r, purpose);
            const score = (r.eta_prop * 0.4) + (c * 0.3) + (Math.min(r.nodes,377)/377 * 0.3);
            if (score > bestScore) { bestScore = score; best = { medium:m.id, scale:s, coherence:c, result:r, score }; }
          });
        });
      });
      setSearchResult(best);
      setSearching(false);
      if (best) { setMedium(best.medium); setScale(best.scale); setCoherence(best.coherence); }
    }, 900);
  };

  const col = {water:"#4488ff",air:"#88ffcc",vacuum:"#cc44ff",plasma:"#ff8844",tissue:"#44ff88",rock:"#ffcc44"}[medium];

  return (
    <div style={{background:"#06060f",minHeight:"100vh",color:"#e0e0ff",fontFamily:"'Courier New',monospace",padding:"12px"}}>

      <div style={{textAlign:"center",marginBottom:"14px"}}>
        <div style={{fontSize:"10px",color:"#7b61ff",letterSpacing:"3px",marginBottom:"2px"}}>COSMIC CHAOS CORPORATION™ | AETHER ENGINE DESIGNER</div>
        <div style={{fontSize:"18px",color:"#00ffcc",fontWeight:"bold",letterSpacing:"2px"}}>MATTER ROOM ENGINE SYNTHESIZER</div>
        <div style={{fontSize:"11px",color:"#666",marginTop:"2px"}}>φ-Harmonic · Vortex-Coherent · Scale-Invariant · Any Medium</div>
      </div>

      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"10px",marginBottom:"12px"}}>

        <div style={{background:"#0d0d20",border:"1px solid #333",borderRadius:"8px",padding:"10px"}}>
          <div style={{fontSize:"9px",color:"#7b61ff",letterSpacing:"2px",marginBottom:"8px"}}>OPERATING MEDIUM</div>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"5px"}}>
            {mediums.map(m => (
              <button key={m.id} onClick={()=>setMedium(m.id)}
                style={{background:medium===m.id?col+"22":"#111",border:`1px solid ${medium===m.id?col:"#333"}`,borderRadius:"5px",padding:"5px",color:medium===m.id?col:"#666",fontSize:"9px",cursor:"pointer",textAlign:"left"}}>
                <div>{m.label}</div>
                <div style={{fontSize:"8px",color:"#555",marginTop:"1px"}}>{m.desc}</div>
              </button>
            ))}
          </div>
        </div>

        <div style={{background:"#0d0d20",border:"1px solid #333",borderRadius:"8px",padding:"10px"}}>
          <div style={{fontSize:"9px",color:"#7b61ff",letterSpacing:"2px",marginBottom:"8px"}}>SCALE & PURPOSE</div>
          <div style={{marginBottom:"10px"}}>
            <div style={{fontSize:"9px",color:"#888",marginBottom:"4px"}}>ENGINE SCALE: <span style={{color:col}}>{scales[scale]}</span></div>
            <input type="range" min={0} max={4} step={1} value={scale} onChange={e=>setScale(+e.target.value)}
              style={{width:"100%",accentColor:col}} />
            <div style={{display:"flex",justifyContent:"space-between",fontSize:"8px",color:"#444"}}>
              {scales.map(s=><span key={s}>{s}</span>)}
            </div>
          </div>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"4px"}}>
            {purposes.map(p => (
              <button key={p} onClick={()=>setPurpose(p)}
                style={{background:purpose===p?col+"22":"#111",border:`1px solid ${purpose===p?col:"#333"}`,borderRadius:"4px",padding:"4px",color:purpose===p?col:"#666",fontSize:"8px",cursor:"pointer"}}>
                {p}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div style={{background:"#0d0d20",border:"1px solid #333",borderRadius:"8px",padding:"10px",marginBottom:"12px"}}>
        <div style={{display:"flex",gap:"12px",alignItems:"center",flexWrap:"wrap"}}>
          <div style={{flex:1,minWidth:"160px"}}>
            <div style={{fontSize:"9px",color:"#7b61ff",letterSpacing:"2px",marginBottom:"4px"}}>
              COHERENCE TARGET: <span style={{color:result.stability_color,fontWeight:"bold"}}>{coherence.toFixed(2)} — {result.stability}</span>
            </div>
            <input type="range" min={0.3} max={0.99} step={0.01} value={coherence} onChange={e=>setCoherence(+e.target.value)}
              style={{width:"100%",accentColor:col}} />
            <div style={{display:"flex",justifyContent:"space-between",fontSize:"8px",color:"#444"}}>
              <span>0.3</span><span style={{color:"#ffffff44"}}>φ⁻¹=0.618</span><span>0.99</span>
            </div>
          </div>
          <div style={{display:"flex",gap:"8px",alignItems:"center"}}>
            <button onClick={()=>setPhiHarmonic(!phiHarmonic)}
              style={{background:phiHarmonic?"#7b61ff22":"#111",border:`1px solid ${phiHarmonic?"#7b61ff":"#333"}`,borderRadius:"5px",padding:"6px 10px",color:phiHarmonic?"#7b61ff":"#666",fontSize:"10px",cursor:"pointer"}}>
              {phiHarmonic?"φ ON":"φ OFF"}
            </button>
            <button onClick={findBestEngine} disabled={searching}
              style={{background:searching?"#00ffcc11":"#00ffcc22",border:"1px solid #00ffcc",borderRadius:"5px",padding:"6px 12px",color:"#00ffcc",fontSize:"10px",cursor:"pointer",letterSpacing:"1px"}}>
              {searching?"SEARCHING...":"⚡ FIND BEST"}
            </button>
          </div>
        </div>
        {searchResult && (
          <div style={{marginTop:"8px",background:"#00ffcc0d",border:"1px solid #00ffcc33",borderRadius:"5px",padding:"6px 10px",fontSize:"10px",color:"#00ffcc"}}>
            ✓ Best engine for <b>{purpose}</b>: <b>{mediums.find(m=>m.id===searchResult.medium)?.label}</b> at <b>{scales[searchResult.scale]}</b> scale, C={searchResult.coherence} — score {searchResult.score.toFixed(3)}
          </div>
        )}
      </div>

      <div style={{display:"grid",gridTemplateColumns:"auto 1fr",gap:"14px",marginBottom:"12px"}}>

        <div style={{display:"flex",flexDirection:"column",alignItems:"center",gap:"8px"}}>
          <EngineViz result={result} medium={medium} scale={scale} coherence={coherence} time={time} purpose={purpose} />
          <div style={{textAlign:"center"}}>
            <div style={{fontSize:"11px",color:col,fontWeight:"bold"}}>{result.arch.name}</div>
            <div style={{fontSize:"9px",color:"#888"}}>{result.arch.type}</div>
            <div style={{fontSize:"9px",color:"#7b61ff",marginTop:"2px"}}>Mode: {purpose}</div>
          </div>
        </div>

        <div style={{display:"flex",flexDirection:"column",gap:"8px"}}>

          <div style={{background:"#0d0d20",border:`1px solid ${col}33`,borderRadius:"8px",padding:"10px"}}>
            <div style={{fontSize:"9px",color:col,letterSpacing:"2px",marginBottom:"8px"}}>PERFORMANCE METRICS — {purpose.toUpperCase()}</div>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"6px"}}>
              {metrics.map((m,i) => (
                <div key={i} style={{background:"#ffffff06",borderRadius:"4px",padding:"5px 7px"}}>
                  <div style={{fontSize:"8px",color:"#666"}}>{m.label}</div>
                  <div style={{fontSize:"11px",color:col,fontFamily:"monospace"}}>{m.val}</div>
                </div>
              ))}
              <div style={{background:"#ffffff06",borderRadius:"4px",padding:"5px 7px"}}>
                <div style={{fontSize:"8px",color:"#666"}}>Scale</div>
                <div style={{fontSize:"11px",color:col,fontFamily:"monospace"}}>{result.scaleLabel}</div>
              </div>
              <div style={{background:"#ffffff06",borderRadius:"4px",padding:"5px 7px"}}>
                <div style={{fontSize:"8px",color:"#666"}}>Lattice Nodes</div>
                <div style={{fontSize:"11px",color:col,fontFamily:"monospace"}}>{result.nodes}</div>
              </div>
            </div>
          </div>

          <div style={{background:"#0d0d20",border:"1px solid #7b61ff33",borderRadius:"8px",padding:"10px"}}>
            <div style={{fontSize:"9px",color:"#7b61ff",letterSpacing:"2px",marginBottom:"6px"}}>φ-HARMONIC PHASE OFFSETS (6-FOLD)</div>
            <div style={{display:"flex",gap:"4px",flexWrap:"wrap"}}>
              {result.phi_phases.map((p,i) => (
                <div key={i} style={{background:"#7b61ff22",border:"1px solid #7b61ff33",borderRadius:"4px",padding:"3px 6px",fontSize:"9px",color:"#7b61ff",fontFamily:"monospace"}}>
                  n={i}: {p}°
                </div>
              ))}
            </div>
            <div style={{fontSize:"8px",color:"#555",marginTop:"4px"}}>φ_n = n·(2π/φ) mod 2π — constructive interference in shear layers</div>
          </div>
        </div>
      </div>

      <div style={{background:"#0d0d20",border:`1px solid ${col}22`,borderRadius:"8px",padding:"12px",marginBottom:"10px"}}>
        <div style={{fontSize:"9px",color:col,letterSpacing:"2px",marginBottom:"8px"}}>ENGINE ARCHITECTURE</div>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"10px"}}>
          {[
            {label:"MECHANISM", val:result.arch.mechanism},
            {label:"MATERIAL", val:result.arch.material},
            {label:"APPEARANCE", val:result.arch.looks},
            {label:"MEDIUM DENSITY", val:`ρ = ${result.rho} kg/m³`},
          ].map((item,i) => (
            <div key={i}>
              <div style={{fontSize:"8px",color:"#555",marginBottom:"2px",letterSpacing:"1px"}}>{item.label}</div>
              <div style={{fontSize:"10px",color:"#ccc",lineHeight:1.5}}>{item.val}</div>
            </div>
          ))}
        </div>
      </div>

      <div style={{background:"#0d0d20",border:"1px solid #333",borderRadius:"8px",padding:"10px"}}>
        <div style={{fontSize:"9px",color:"#00ffcc",letterSpacing:"2px",marginBottom:"8px"}}>AETHER EQUATION CHAIN</div>
        <div style={{fontSize:"10px",color:"#666",fontFamily:"monospace",lineHeight:2}}>
          <span style={{color:"#00ffcc"}}>C(x,t)</span> = 1 − |ε|/|S*| = <span style={{color:col}}>{coherence.toFixed(2)}</span>
          {"  →  "}<span style={{color:"#00ffcc"}}>C ≥ φ⁻¹</span>: <span style={{color:result.stability_color}}>{result.stability}</span><br/>
          <span style={{color:"#00ffcc"}}>φ_n</span> = n·(2π/φ) mod 2π
          {"  →  "}<span style={{color:"#00ffcc"}}>St</span> = <span style={{color:col}}>{result.St.toFixed(3)}</span> [0.2–0.4 optimal]<br/>
          <span style={{color:"#00ffcc"}}>F</span> = ρ·Γ·L·v {"  →  "}<span style={{color:"#00ffcc"}}>η</span> = <span style={{color:col}}>{(result.eta_prop*100).toFixed(1)}%</span><br/>
          <span style={{color:"#00ffcc"}}>L_n</span> = φⁿ·L₀ [Hexiclical] {"  →  "}<span style={{color:"#00ffcc"}}>Nodes</span>: <span style={{color:col}}>{result.nodes}</span> (Fibonacci)
        </div>
      </div>

    </div>
  );
}
