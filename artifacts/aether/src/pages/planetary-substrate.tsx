import { useState, useEffect } from "react";

const PHI     = 1.618033988749895;
const PHI_INV = 1 / PHI;

/* ── types ───────────────────────────────────────────────────────────── */
interface SVector { tau: number; rho: number; eta: number; mu: number; phi_d: number; kappa: number; }
interface Planet {
  id: string; name: string; subtitle: string; color: string; icon: string;
  status: string; statusColor: string; signature: string;
  vector: SVector; facts: string[]; aether: string;
}
interface VectorKey { key: keyof SVector; label: string; name: string; }

/* ── data ────────────────────────────────────────────────────────────── */
const planets: Planet[] = [
  {
    id:"europa", name:"EUROPA", subtitle:"Jupiter's Ocean Moon", color:"#4488ff", icon:"🧊",
    status:"HIGH PRIORITY", statusColor:"#00ffcc", signature:"SALINE OCEAN COUPLING",
    vector:{ tau:0.28, rho:0.82, eta:0.91, mu:0.45, phi_d:0.60, kappa:0.88 },
    facts:["Ice shell: 35-63 km deep","Ocean conductivity: >=2.8 S/m","Induced B-field: Jupiter-driven 11hr & 85hr","No intrinsic core dynamo","Europa Clipper arrives: 2030","NaCl-rich saline ocean"],
    aether:"Highest kappa in solar system. AQISP & Clipper measure same S vector -- direct cross-validation pathway.",
  },
  {
    id:"enceladus", name:"ENCELADUS", subtitle:"Saturn's Active Plume Moon", color:"#ff88aa", icon:"💨",
    status:"dS/dt != 0 -- LIVE", statusColor:"#ff4488", signature:"DYNAMIC ACTIVE GEOLOGY",
    vector:{ tau:0.15, rho:0.22, eta:0.78, mu:0.52, phi_d:0.88, kappa:0.75 },
    facts:["Plume dB > 10 nT (confirmed 2026)","Peak plume density: ~5.5x10^-11 kg/m3","Composition: H2O, CO2, CH4, organics","South polar tiger stripe vents","Only body: dS/dt directly measurable","Subsurface ocean confirmed Cassini"],
    aether:"Only body where dS/dt != 0 from orbit. Dynamic phi_d is Enceladus unique fingerprint.",
  },
  {
    id:"mars", name:"MARS", subtitle:"Coherence Fossil Body", color:"#ff6633", icon:"🔴",
    status:"COHERENCE FOSSIL", statusColor:"#ff9900", signature:"ANCIENT DYNAMO FOSSIL",
    vector:{ tau:0.92, rho:0.88, eta:0.12, mu:0.65, phi_d:0.35, kappa:0.08 },
    facts:["Core density: 5.7-6.3 g/cm3 (InSight)","Solid inner core: ~600 km (Nature 2025)","Dynamo ceased: ~3.7 Ga ago","Crustal remanence: 10x stronger than predicted","Ancient dynamo: Earth-comparable strength","Coherence fossil in basement rocks"],
    aether:"Proof coherence structure survives billions of years in geology. 10x remanence IS the fossil.",
  },
  {
    id:"moon", name:"MOON", subtitle:"Nearest Test Case", color:"#ccccff", icon:"🌕",
    status:"ARTEMIS III TARGET", statusColor:"#aaaaff", signature:"HETEROGENEOUS FOSSIL",
    vector:{ tau:0.88, rho:0.95, eta:0.05, mu:0.55, phi_d:0.42, kappa:0.18 },
    facts:["Crustal thickness: 3-61 km (Kim 2025 GRL)","Dynamo active: 4.25-1.92 Ga","Peak field: Earth-comparable before 3.56 Ga","Chang'e-6 farside: stronger than nearside","Artemis III: seismometers deploying","CE-7 South Pole survey launch 2026"],
    aether:"Closest AETHER field validation. Farside fossil larger than nearside -- testable by Artemis III.",
  },
];

const vectorKeys: VectorKey[] = [
  { key:"tau",   label:"τ",   name:"Coherence Decay Time" },
  { key:"rho",   label:"ρ",   name:"Density" },
  { key:"eta",   label:"η",   name:"Fluid Coupling" },
  { key:"mu",    label:"μ",   name:"Magnetic Permeability" },
  { key:"phi_d", label:"φ_d", name:"Decoherence Phase" },
  { key:"kappa", label:"κ",   name:"Coupling Coefficient" },
];

/* ── helpers ─────────────────────────────────────────────────────────── */
function SlideHeader({ title, sub, color }: { title: string; sub: string; color: string }) {
  return (
    <div style={{ borderBottom:`1px solid ${color}33`, paddingBottom:10, marginBottom:4 }}>
      <div style={{ fontSize:18, color, fontWeight:"bold", letterSpacing:2 }}>{title}</div>
      <div style={{ fontSize:11, color:"#666", marginTop:2 }}>{sub}</div>
    </div>
  );
}
function SectionLabel({ label, color }: { label: string; color: string }) {
  return <div style={{ fontSize:9, color, letterSpacing:2, marginBottom:6, marginTop:2 }}>{label}</div>;
}

function RadarChart({ vector, color, size = 140 }: { vector: SVector; color: string; size?: number }) {
  const cx = size/2, cy = size/2, r = size*0.36, n = vectorKeys.length;
  const pts = vectorKeys.map(({ key }, i) => {
    const a = (Math.PI*2*i)/n - Math.PI/2;
    return {
      x: cx + r*vector[key]*Math.cos(a), y: cy + r*vector[key]*Math.sin(a),
      gx: cx + r*Math.cos(a), gy: cy + r*Math.sin(a),
      lx: cx + (r+16)*Math.cos(a), ly: cy + (r+16)*Math.sin(a),
      label: vectorKeys[i].label
    };
  });
  const rings = [0.25, 0.5, PHI_INV, 1.0];
  return (
    <svg width={size} height={size} style={{ overflow:"visible" }}>
      {rings.map((rv, i) => (
        <polygon key={i} points={vectorKeys.map((_, j) => {
          const a = (Math.PI*2*j)/n - Math.PI/2;
          return `${cx+r*rv*Math.cos(a)},${cy+r*rv*Math.sin(a)}`;
        }).join(" ")} fill="none"
          stroke={rv === PHI_INV ? `${color}88` : "#ffffff15"}
          strokeWidth={rv === PHI_INV ? 1.5 : 0.5}
          strokeDasharray={rv === PHI_INV ? "3,2" : undefined} />
      ))}
      {pts.map((p, i) => <line key={i} x1={cx} y1={cy} x2={p.gx} y2={p.gy} stroke="#ffffff10" strokeWidth={0.5}/>)}
      <polygon points={pts.map(p=>`${p.x},${p.y}`).join(" ")} fill={`${color}30`} stroke={color} strokeWidth={1.5}/>
      {pts.map((p, i) => <circle key={i} cx={p.x} cy={p.y} r={2.5} fill={color}/>)}
      {pts.map((p, i) => <text key={i} x={p.lx} y={p.ly+3} textAnchor="middle" fill={color} fontSize="8" fontFamily="monospace" fontWeight="bold">{p.label}</text>)}
      <text x={cx+r*PHI_INV+2} y={cy-3} fill={`${color}77`} fontSize="6" fontFamily="monospace">φ⁻¹</text>
    </svg>
  );
}

function MiniBar({ val, color }: { val: number; color: string }) {
  return (
    <div style={{ background:"#ffffff0d", borderRadius:2, height:5, position:"relative", width:"100%" }}>
      <div style={{ background:color, width:`${val*100}%`, height:"100%", borderRadius:2 }}/>
      <div style={{ position:"absolute", left:`${PHI_INV*100}%`, top:0, bottom:0, width:1, background:"#ffffff44" }}/>
    </div>
  );
}

/* ── slides ──────────────────────────────────────────────────────────── */
function SlideTitle() {
  return (
    <div style={{ display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", height:"100%", textAlign:"center", padding:40 }}>
      <div style={{ fontSize:11, color:"#7b61ff", letterSpacing:4, marginBottom:16 }}>COSMIC CHAOS CORPORATION™ | AETHERLIFE.CO | @STRATEGICPROCE</div>
      <div style={{ fontSize:11, color:"#00ffcc", letterSpacing:3, marginBottom:8 }}>PROVISIONAL PATENT -- JUNE 2026</div>
      <h1 style={{ fontSize:36, color:"#fff", margin:"0 0 8px", lineHeight:1.2, letterSpacing:2 }}>
        AETHER UNIVERSAL<br/>
        <span style={{ color:"#00ffcc" }}>PLANETARY SUBSTRATE</span><br/>
        SENSOR
      </h1>
      <div style={{ fontSize:16, color:"#888", margin:"16px 0 24px" }}>One Instrument · One Method · Every World</div>
      <div style={{ background:"#ffffff08", border:"1px solid #7b61ff44", borderRadius:10, padding:"16px 32px", maxWidth:500 }}>
        <div style={{ fontSize:20, color:"#7b61ff", fontFamily:"monospace", marginBottom:8 }}>S = (τ, ρ, η, μ, φ_d, κ)</div>
        <div style={{ fontSize:11, color:"#666" }}>Universal Geological Signature Vector · Hexiclical Substrate Architecture</div>
      </div>
      <div style={{ display:"flex", gap:20, marginTop:32, flexWrap:"wrap", justifyContent:"center" }}>
        {planets.map(p => (
          <div key={p.id} style={{ textAlign:"center" }}>
            <div style={{ fontSize:28 }}>{p.icon}</div>
            <div style={{ fontSize:10, color:p.color, letterSpacing:1 }}>{p.name}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

function SlideFramework() {
  return (
    <div style={{ padding:28, height:"100%", boxSizing:"border-box" }}>
      <SlideHeader title="THE AETHER INVERSION METHOD" sub="How One Instrument Reads Any Planetary Body" color="#00ffcc"/>
      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:16, marginTop:16 }}>
        <div>
          <SectionLabel label="THE PRINCIPLE" color="#00ffcc"/>
          <div style={{ background:"#ffffff08", border:"1px solid #00ffcc33", borderRadius:8, padding:14, marginBottom:12 }}>
            <div style={{ fontSize:13, color:"#fff", lineHeight:1.7 }}>
              Every planetary body -- regardless of size, composition, or state -- imprints a unique six-component coherence signature on the fabric of its substrate field.<br/><br/>
              <span style={{ color:"#00ffcc" }}>Decoherence inversion</span> reads this signature: where coherence drops, substrate structure is revealed.
            </div>
          </div>
          <div style={{ background:"#ffffff08", border:"1px solid #7b61ff33", borderRadius:8, padding:14 }}>
            <div style={{ fontSize:11, color:"#7b61ff", letterSpacing:2, marginBottom:8 }}>INVERSION TRANSFER FUNCTION</div>
            <div style={{ fontFamily:"monospace", fontSize:12, color:"#fff", lineHeight:2 }}>
              <span style={{ color:"#00ffcc" }}>S_planet(x,t)</span> = T_AQISP[<br/>
              &nbsp;&nbsp;<span style={{ color:"#4488ff" }}>Δφ_grav</span>(x,t),<br/>
              &nbsp;&nbsp;<span style={{ color:"#ff88aa" }}>Δφ_B</span>(x,t),<br/>
              &nbsp;&nbsp;<span style={{ color:"#cc44ff" }}>Δφ_DM</span>(x,t)<br/>
              ]
            </div>
          </div>
        </div>
        <div>
          <SectionLabel label="HEXICLICAL LAYER STACK" color="#7b61ff"/>
          <div style={{ background:"#ffffff08", border:"1px solid #7b61ff33", borderRadius:8, padding:14, marginBottom:12 }}>
            <div style={{ fontSize:11, color:"#888", marginBottom:10 }}>L_n = φⁿ · L₀ -- scale-invariant from core to magnetosphere</div>
            {["Magnetosphere","Ionosphere","Atmosphere","Surface","Crust","Mantle","Core"].reverse().map((layer, i) => (
              <div key={i} style={{ display:"flex", alignItems:"center", gap:8, marginBottom:4 }}>
                <div style={{ width:`${20+i*18}px`, height:18, background:`hsl(${260+i*15},60%,${20+i*6}%)`, border:"1px solid #ffffff22", borderRadius:3, display:"flex", alignItems:"center", justifyContent:"center" }}>
                  <span style={{ fontSize:7, color:"#aaa" }}>{`φ^${i}`}</span>
                </div>
                <span style={{ fontSize:10, color:"#ccc" }}>{layer}</span>
                <span style={{ fontSize:9, color:"#555", marginLeft:"auto" }}>x{Math.pow(PHI, i).toFixed(2)}</span>
              </div>
            ))}
          </div>
          <div style={{ background:"#ffffff08", border:"1px solid #00ff8833", borderRadius:8, padding:10 }}>
            <div style={{ fontSize:11, color:"#00ff88", marginBottom:4 }}>φ⁻¹ ≈ 0.618 STABILITY THRESHOLD</div>
            <div style={{ fontSize:11, color:"#888" }}>Vector components below threshold indicate decoherence zone -- substrate boundary detected.</div>
          </div>
        </div>
      </div>
    </div>
  );
}

function SlidePlanet({ planet }: { planet: Planet }) {
  return (
    <div style={{ padding:24, height:"100%", boxSizing:"border-box" }}>
      <div style={{ display:"flex", alignItems:"center", gap:12, marginBottom:16 }}>
        <div style={{ fontSize:36 }}>{planet.icon}</div>
        <div>
          <div style={{ fontSize:22, color:planet.color, fontWeight:"bold", letterSpacing:2 }}>{planet.name}</div>
          <div style={{ fontSize:11, color:"#888" }}>{planet.subtitle}</div>
        </div>
        <div style={{ marginLeft:"auto", background:`${planet.statusColor}22`, border:`1px solid ${planet.statusColor}`, borderRadius:6, padding:"4px 12px", fontSize:10, color:planet.statusColor, letterSpacing:1 }}>
          {planet.status}
        </div>
      </div>
      <div style={{ display:"grid", gridTemplateColumns:"auto 1fr 1fr", gap:16 }}>
        <div style={{ display:"flex", flexDirection:"column", alignItems:"center" }}>
          <RadarChart vector={planet.vector} color={planet.color} size={160}/>
          <div style={{ fontSize:8, color:"#555", marginTop:4, textAlign:"center" }}>dashed = φ⁻¹ threshold</div>
          <div style={{ marginTop:8, background:"#ffffff08", borderRadius:6, padding:"6px 10px", border:`1px solid ${planet.color}33` }}>
            <div style={{ fontSize:9, color:planet.color, fontStyle:"italic", textAlign:"center" }}>{planet.signature}</div>
          </div>
        </div>
        <div>
          <SectionLabel label="S VECTOR" color={planet.color}/>
          {vectorKeys.map(vk => (
            <div key={vk.key} style={{ marginBottom:7 }}>
              <div style={{ display:"flex", justifyContent:"space-between", marginBottom:2 }}>
                <span style={{ fontSize:10, color:"#aaa" }}><span style={{ color:planet.color, fontWeight:"bold" }}>{vk.label}</span> {vk.name}</span>
                <span style={{ fontSize:10, color:planet.vector[vk.key]>=PHI_INV?"#00ff88":"#ff6644", fontFamily:"monospace" }}>{planet.vector[vk.key].toFixed(2)}</span>
              </div>
              <MiniBar val={planet.vector[vk.key]} color={planet.color}/>
            </div>
          ))}
        </div>
        <div>
          <SectionLabel label="OBSERVED DATA" color="#888"/>
          <div style={{ marginBottom:10 }}>
            {planet.facts.map((f, i) => (
              <div key={i} style={{ fontSize:10, color:"#ccc", marginBottom:4, display:"flex", gap:5 }}>
                <span style={{ color:planet.color }}>▸</span>{f}
              </div>
            ))}
          </div>
          <SectionLabel label="AETHER READING" color="#7b61ff"/>
          <div style={{ background:"#ffffff08", border:"1px solid #7b61ff33", borderRadius:6, padding:10, fontSize:10, color:"#ccc", lineHeight:1.6 }}>
            {planet.aether}
          </div>
        </div>
      </div>
    </div>
  );
}

function SlideComparison() {
  return (
    <div style={{ padding:24, height:"100%", boxSizing:"border-box" }}>
      <SlideHeader title="SUBSTRATE VECTOR COMPARISON" sub="All Four Bodies -- Same Inversion Method" color="#7b61ff"/>
      <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:10, marginTop:14, marginBottom:14 }}>
        {planets.map(p => (
          <div key={p.id} style={{ background:"#ffffff08", border:`1px solid ${p.color}44`, borderRadius:8, padding:10, textAlign:"center" }}>
            <div style={{ fontSize:9, color:p.statusColor, letterSpacing:1, marginBottom:4 }}>{p.status}</div>
            <div style={{ fontSize:14, color:p.color, fontWeight:"bold", marginBottom:2 }}>{p.icon} {p.name}</div>
            <div style={{ display:"flex", justifyContent:"center", margin:"6px 0" }}>
              <RadarChart vector={p.vector} color={p.color} size={110}/>
            </div>
            <div style={{ fontSize:8, color:`${p.color}99`, fontStyle:"italic" }}>{p.signature}</div>
          </div>
        ))}
      </div>
      <SectionLabel label="VECTOR COMPONENT COMPARISON" color="#00ffcc"/>
      <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:8 }}>
        {vectorKeys.map(vk => (
          <div key={vk.key} style={{ background:"#ffffff08", border:"1px solid #ffffff11", borderRadius:6, padding:8 }}>
            <div style={{ fontSize:10, color:"#fff", marginBottom:5, fontFamily:"monospace" }}>
              <span style={{ color:"#00ffcc", fontWeight:"bold" }}>{vk.label}</span> -- {vk.name}
            </div>
            {planets.map(p => (
              <div key={p.id} style={{ display:"flex", alignItems:"center", gap:5, marginBottom:3 }}>
                <span style={{ width:64, fontSize:8, color:p.color }}>{p.name}</span>
                <div style={{ flex:1, background:"#ffffff0d", borderRadius:2, height:6, position:"relative" }}>
                  <div style={{ background:p.color, width:`${p.vector[vk.key]*100}%`, height:"100%", borderRadius:2 }}/>
                  <div style={{ position:"absolute", left:`${PHI_INV*100}%`, top:0, bottom:0, width:1, background:"#ffffff33" }}/>
                </div>
                <span style={{ width:28, fontSize:8, color:p.vector[vk.key]>=PHI_INV?"#00ff88":"#ff6644", textAlign:"right", fontFamily:"monospace" }}>{p.vector[vk.key].toFixed(2)}</span>
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

function SlidePatentClaims() {
  const claims = [
    { id:"PS1", title:"Universal Substrate Vector", color:"#00ffcc", text:"S_planet = (τ, ρ, η, μ, φ_d, κ) applies invariantly across all planetary bodies. Same six components. Same inversion method. Every world." },
    { id:"PS2", title:"Hexiclical Layer Stack",      color:"#7b61ff", text:"L_n = φⁿ · L₀. Each planetary layer is φ-scaled from the one below. Core to magnetosphere. Scale-invariant from Planck to planetary." },
    { id:"PS3", title:"Decoherence Inversion Read",  color:"#4488ff", text:"C_inv(x,t) = 1 - C(x,t). Substrate signature extracted from ∇C_inv. Where coherence drops, structure is revealed." },
    { id:"PS5", title:"Subsurface Ocean Detection",  color:"#ff88aa", text:"η > η_threshold AND τ < τ_dry → liquid layer present at depth d = f(∇C_inv). AQISP detects Europa/Enceladus oceans remotely via gravitational gradient." },
    { id:"PS6", title:"Magnetic Core Discrimination",color:"#ff6633", text:"κ_planet = μ_core · ω_rotation · f(C_mantle). Active dynamos vs. dead cores vs. coherence fossils -- discriminated by κ value alone." },
    { id:"PS7", title:"Active Geology Signature",    color:"#ffcc00", text:"dτ/dt < 0 AND dφ_d/dt != 0 → active geological process. Time derivatives of S vector distinguish live bodies (Enceladus) from static fossils." },
    { id:"PS8", title:"Universal Transfer Function", color:"#cc44ff", text:"S_planet(x,t) = T_AQISP[Δφ_grav, Δφ_B, Δφ_DM]. Single instrument. Three phase-shift measurements. Complete substrate characterization of any planetary body." },
  ];
  return (
    <div style={{ padding:24, height:"100%", boxSizing:"border-box" }}>
      <SlideHeader title="PROVISIONAL PATENT CLAIMS" sub="AETHER Universal Planetary Substrate Sensor -- PS1 through PS8" color="#7b61ff"/>
      <div style={{ display:"grid", gridTemplateColumns:"repeat(2,1fr)", gap:10, marginTop:14 }}>
        {claims.map(c => (
          <div key={c.id} style={{ background:"#ffffff08", border:`1px solid ${c.color}44`, borderRadius:8, padding:12, display:"flex", gap:10 }}>
            <div style={{ background:`${c.color}22`, border:`1px solid ${c.color}`, borderRadius:6, padding:"4px 8px", height:"fit-content", whiteSpace:"nowrap" }}>
              <span style={{ fontSize:10, color:c.color, fontWeight:"bold", fontFamily:"monospace" }}>{c.id}</span>
            </div>
            <div>
              <div style={{ fontSize:11, color:c.color, fontWeight:"bold", marginBottom:4 }}>{c.title}</div>
              <div style={{ fontSize:10, color:"#bbb", lineHeight:1.5 }}>{c.text}</div>
            </div>
          </div>
        ))}
        <div style={{ background:"#00ff8808", border:"1px solid #00ff8844", borderRadius:8, padding:12, gridColumn:"1/-1" }}>
          <div style={{ fontSize:10, color:"#00ff88", letterSpacing:2, marginBottom:6 }}>KEY DIFFERENTIATOR VS. PRIOR ART</div>
          <div style={{ display:"flex", gap:20, flexWrap:"wrap" }}>
            {[
              "No prior system uses a unified coherence field metric to characterize multiple planetary bodies",
              "No prior system combines gravitational gradient + magnetic + dark matter phase shifts into a single substrate vector",
              "No prior system applies φ-harmonic layer scaling (hexiclical stack) to planetary substrate identification",
              "No prior system uses decoherence inversion as the primary read mechanism across all planetary substrates"
            ].map((d, i) => (
              <div key={i} style={{ display:"flex", gap:6, fontSize:10, color:"#aaa", flex:"1 1 40%" }}>
                <span style={{ color:"#00ff88" }}>✓</span>{d}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function SlideRoadmap() {
  const missions = [
    { year:"2026", name:"CE-7 Launch",             body:"MOON",      color:"#ccccff", desc:"South Pole magnetic survey -- first AETHER substrate field test" },
    { year:"2026", name:"AETHER Provisional Filed", body:"EARTH",     color:"#00ffcc", desc:"Priority date established for PS1-PS8" },
    { year:"2027", name:"AQISP Prototype",          body:"EARTH",     color:"#00ffcc", desc:"DC-native solar atom interferometer -- field deployment" },
    { year:"2028", name:"CE-8 South Pole",          body:"MOON",      color:"#ccccff", desc:"Seismic + magnetic -- full lunar substrate vector validation" },
    { year:"2028", name:"Mars Sample Return",        body:"MARS",      color:"#ff6633", desc:"Coherence fossil analysis -- basement rock magnetization" },
    { year:"2030", name:"Europa Clipper Science",    body:"EUROPA",    color:"#4488ff", desc:"First full S_Europa measurement -- AQISP cross-validation" },
    { year:"2032", name:"Enceladus Mission",         body:"ENCELADUS", color:"#ff88aa", desc:"Dynamic dS/dt measurement -- live substrate monitoring" },
  ];
  return (
    <div style={{ padding:24, height:"100%", boxSizing:"border-box" }}>
      <SlideHeader title="VALIDATION ROADMAP" sub="AETHER Planetary Sensing -- Cross-Mission Verification Timeline" color="#ffaa00"/>
      <div style={{ position:"relative", marginTop:20 }}>
        <div style={{ position:"absolute", left:80, top:0, bottom:0, width:2, background:"linear-gradient(to bottom, #7b61ff, #00ffcc)", opacity:0.3 }}/>
        {missions.map((m, i) => (
          <div key={i} style={{ display:"flex", gap:16, alignItems:"flex-start", marginBottom:12, position:"relative" }}>
            <div style={{ width:64, textAlign:"right", flexShrink:0 }}>
              <span style={{ fontSize:11, color:"#888", fontFamily:"monospace" }}>{m.year}</span>
            </div>
            <div style={{ width:12, height:12, borderRadius:"50%", background:m.color, border:`2px solid ${m.color}`, flexShrink:0, marginTop:2, position:"relative", zIndex:1 }}/>
            <div style={{ background:"#ffffff08", border:`1px solid ${m.color}33`, borderRadius:6, padding:"8px 12px", flex:1 }}>
              <div style={{ display:"flex", gap:8, alignItems:"center", marginBottom:2 }}>
                <span style={{ fontSize:12, color:m.color, fontWeight:"bold" }}>{m.name}</span>
                <span style={{ fontSize:9, color:`${m.color}77`, background:`${m.color}22`, borderRadius:3, padding:"1px 6px" }}>{m.body}</span>
              </div>
              <div style={{ fontSize:10, color:"#888" }}>{m.desc}</div>
            </div>
          </div>
        ))}
      </div>
      <div style={{ background:"#ffffff08", border:"1px solid #00ff8833", borderRadius:8, padding:12, marginTop:8 }}>
        <div style={{ fontSize:10, color:"#00ff88", letterSpacing:2, marginBottom:6 }}>CROSS-VALIDATION STRATEGY</div>
        <div style={{ display:"flex", gap:16, flexWrap:"wrap" }}>
          {[
            { label:"Europa Clipper <> AQISP", desc:"Both measure S_Europa -- different methods, same vector" },
            { label:"InSight <> AQISP",        desc:"Mars crustal remanence ground-truth vs. interferometric read" },
            { label:"Chang'e-7 <> AQISP",      desc:"Lunar South Pole magnetic survey vs. coherence inversion" },
          ].map((v, i) => (
            <div key={i} style={{ flex:"1 1 28%", fontSize:10 }}>
              <div style={{ color:"#00ff88", marginBottom:2 }}>{v.label}</div>
              <div style={{ color:"#666" }}>{v.desc}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function SlideSummary() {
  return (
    <div style={{ display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", height:"100%", textAlign:"center", padding:40 }}>
      <div style={{ fontSize:11, color:"#7b61ff", letterSpacing:3, marginBottom:20 }}>AETHER FRAMEWORK | COSMIC CHAOS CORPORATION™</div>
      <div style={{ fontSize:28, color:"#fff", fontWeight:"bold", marginBottom:6, lineHeight:1.3 }}>
        ONE INSTRUMENT.<br/><span style={{ color:"#00ffcc" }}>EVERY WORLD.</span>
      </div>
      <div style={{ fontSize:18, color:"#7b61ff", fontFamily:"monospace", margin:"20px 0" }}>
        S_planet(x,t) = T_AQISP[ Δφ_grav, Δφ_B, Δφ_DM ]
      </div>
      <div style={{ display:"grid", gridTemplateColumns:"repeat(2,1fr)", gap:12, maxWidth:560, marginBottom:24 }}>
        {[
          { label:"7 Patent Claims Filed",             color:"#00ffcc" },
          { label:"4 Planetary Bodies Characterized",  color:"#7b61ff" },
          { label:"2024-2026 Peer-Reviewed Data",      color:"#4488ff" },
          { label:"Cross-Mission Validation Path",     color:"#ffaa00" },
        ].map((item, i) => (
          <div key={i} style={{ background:`${item.color}11`, border:`1px solid ${item.color}44`, borderRadius:8, padding:10, fontSize:12, color:item.color }}>
            ✓ {item.label}
          </div>
        ))}
      </div>
      <div style={{ display:"flex", gap:24, marginBottom:24 }}>
        {planets.map(p => (
          <div key={p.id} style={{ textAlign:"center" }}>
            <div style={{ fontSize:24 }}>{p.icon}</div>
            <div style={{ fontSize:9, color:p.color }}>{p.name}</div>
            <div style={{ fontSize:8, color:"#555" }}>{p.signature}</div>
          </div>
        ))}
      </div>
      <div style={{ fontSize:11, color:"#555", letterSpacing:2 }}>
        AETHERLIFE.CO | @STRATEGICPROCE | USPTO PROVISIONAL 2026
      </div>
    </div>
  );
}

/* ── slide deck ──────────────────────────────────────────────────────── */
const SLIDES = [
  { id:"title",     label:"Title",     component: <SlideTitle /> },
  { id:"framework", label:"Framework", component: <SlideFramework /> },
  { id:"europa",    label:"Europa",    component: <SlidePlanet planet={planets[0]} /> },
  { id:"enceladus", label:"Enceladus", component: <SlidePlanet planet={planets[1]} /> },
  { id:"mars",      label:"Mars",      component: <SlidePlanet planet={planets[2]} /> },
  { id:"moon",      label:"Moon",      component: <SlidePlanet planet={planets[3]} /> },
  { id:"compare",   label:"Compare",   component: <SlideComparison /> },
  { id:"claims",    label:"Claims",    component: <SlidePatentClaims /> },
  { id:"roadmap",   label:"Roadmap",   component: <SlideRoadmap /> },
  { id:"summary",   label:"Summary",   component: <SlideSummary /> },
];

/* ── page export ─────────────────────────────────────────────────────── */
export default function PlanetarySubstratePage() {
  const [idx,  setIdx ] = useState(0);
  const [anim, setAnim] = useState(true);

  const go = (dir: number) => {
    setAnim(false);
    setTimeout(() => {
      setIdx(i => Math.max(0, Math.min(SLIDES.length-1, i+dir)));
      setAnim(true);
    }, 80);
  };

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight") go(1);
      if (e.key === "ArrowLeft")  go(-1);
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  return (
    <div style={{ background:"#06060f", minHeight:"100vh", color:"#e0e0ff", fontFamily:"'Courier New',monospace", display:"flex", flexDirection:"column" }}>

      {/* top nav */}
      <div style={{ display:"flex", gap:4, padding:"8px 12px", borderBottom:"1px solid #ffffff11", flexWrap:"wrap", alignItems:"center" }}>
        <div style={{ fontSize:9, color:"#7b61ff", letterSpacing:2, marginRight:8 }}>AETHER</div>
        {SLIDES.map((s, i) => (
          <button key={s.id}
            onClick={() => { setAnim(false); setTimeout(()=>{ setIdx(i); setAnim(true); }, 80); }}
            style={{ background:idx===i?"#7b61ff22":"transparent", border:`1px solid ${idx===i?"#7b61ff":"#333"}`, borderRadius:4, padding:"3px 8px", color:idx===i?"#7b61ff":"#555", fontSize:9, cursor:"pointer", letterSpacing:1 }}>
            {s.label}
          </button>
        ))}
        <div style={{ marginLeft:"auto", fontSize:9, color:"#444", fontFamily:"monospace" }}>{idx+1}/{SLIDES.length}</div>
      </div>

      {/* slide area */}
      <div style={{ flex:1, position:"relative", overflow:"hidden", minHeight:520 }}>
        <div style={{ opacity:anim?1:0, transition:"opacity 0.15s", height:"100%" }}>
          {SLIDES[idx].component}
        </div>
      </div>

      {/* bottom controls */}
      <div style={{ display:"flex", alignItems:"center", justifyContent:"center", gap:16, padding:10, borderTop:"1px solid #ffffff11" }}>
        <button onClick={() => go(-1)} disabled={idx===0}
          style={{ background:"#111128", border:"1px solid #333", borderRadius:6, padding:"6px 18px", color:idx===0?"#333":"#aaa", fontSize:14, cursor:idx===0?"default":"pointer" }}>
          &#8592;
        </button>
        <div style={{ display:"flex", gap:5 }}>
          {SLIDES.map((_, i) => (
            <div key={i}
              onClick={() => { setAnim(false); setTimeout(()=>{ setIdx(i); setAnim(true); }, 80); }}
              style={{ width:idx===i?18:6, height:6, borderRadius:3, background:idx===i?"#7b61ff":"#333", transition:"width 0.2s", cursor:"pointer" }}/>
          ))}
        </div>
        <button onClick={() => go(1)} disabled={idx===SLIDES.length-1}
          style={{ background:"#111128", border:"1px solid #333", borderRadius:6, padding:"6px 18px", color:idx===SLIDES.length-1?"#333":"#aaa", fontSize:14, cursor:idx===SLIDES.length-1?"default":"pointer" }}>
          &#8594;
        </button>
      </div>
    </div>
  );
}
