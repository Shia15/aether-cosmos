import { useEffect, useMemo, useRef, useState } from "react";
import fusionSubstrate from "@assets/HHvIaowXQAY-n8z_(1)_1778197228444.jpg";
import shiaCaCO3 from "@assets/IMG_1606_1778070646724.jpeg";
import shiaSpatialIntention from "@assets/IMG_1603_1778070646724.jpeg";
import bavsSubstrates from "@assets/IMG_1600_1778070646724.png";
import photochemHypothesis from "@assets/IMG_1599_1778070646724.png";
import layeredOpticalFramework from "@assets/5CF0BA96-40F7-436B-878A-8D93871C36B9_1778070646724.png";
import blueVioletPaper from "@assets/1FCF6888-89B7-4E22-B40A-2DB7BCE6E11D_1778070646724.png";
import geologicalAccelerator from "@assets/C4A9F181-C71B-4042-96B3-91D5C4AF73A3_1778070646724.png";
import treeOfLife from "@assets/IMG_1588_1778070646724.jpeg";
import shiaLifeFormula from "@assets/IMG_1577_1778070646724.jpeg";

// ── Synthesis conditions, rates from 1FCF6888 (mg/L precipitated after 180 min)
interface Condition {
  key: string;
  label: string;
  wavelength: string;
  rate: number;          // mg/L/min
  total180: number;      // mg/L at 180 min
  color: string;         // light beam color
  glow: string;
  jarTint: string;
}
const CONDITIONS: Condition[] = [
  { key:"violet", label:"Violet Light", wavelength:"405 nm", rate:0.72, total180:88.7, color:"#b388ff", glow:"#a259ff", jarTint:"rgba(179,136,255,0.18)" },
  { key:"blue",   label:"Blue Light",   wavelength:"450 nm", rate:0.55, total180:68.1, color:"#5ec8ff", glow:"#3a9eff", jarTint:"rgba(94,200,255,0.18)" },
  { key:"white",  label:"White Light",  wavelength:"400–700 nm", rate:0.32, total180:44.3, color:"#e8e4d8", glow:"#cfcabb", jarTint:"rgba(232,228,216,0.14)" },
  { key:"dark",   label:"Dark Control", wavelength:"—",     rate:0.18, total180:26.7, color:"#3a3445", glow:"#1a1623", jarTint:"rgba(26,22,35,0.5)" },
];

const KICKER = { fontSize:11, letterSpacing:"0.32em", color:"#a78bfa",
  fontFamily:"'DM Mono',monospace", textTransform:"uppercase" as const, marginBottom:6 };

function Section({ kicker, title, lead, anchor, children }: {
  kicker:string; title:string; lead?:string; anchor?:string; children:React.ReactNode;
}) {
  return (
    <section id={anchor} style={{ marginBottom:"3.2rem", scrollMarginTop:"2rem" }}>
      <div style={KICKER}>{kicker}</div>
      <h2 style={{ fontSize:"1.7rem", fontWeight:700, color:"#f1f5f9", margin:"0 0 0.55rem", letterSpacing:"-0.01em" }}>{title}</h2>
      {lead && <p style={{ color:"#cbd5e1", fontSize:"0.97rem", lineHeight:1.65, maxWidth:820, margin:"0 0 1.2rem" }}>{lead}</p>}
      {children}
    </section>
  );
}

function Card({ children, title, kicker, accent="#a78bfa" }: {
  children:React.ReactNode; title?:string; kicker?:string; accent?:string;
}) {
  return (
    <div style={{
      padding:"1.1rem 1.25rem", borderRadius:12,
      background:"rgba(15,23,42,0.65)",
      border:"1px solid rgba(255,255,255,0.08)",
      borderLeft:`3px solid ${accent}`,
    }}>
      {kicker && <div style={{...KICKER, color:accent, marginBottom:4 }}>{kicker}</div>}
      {title && <div style={{ fontSize:"1rem", fontWeight:700, color:"#f1f5f9", marginBottom:6 }}>{title}</div>}
      <div style={{ fontSize:"0.88rem", color:"#cbd5e1", lineHeight:1.6 }}>{children}</div>
    </div>
  );
}

// ───────────────────────────────────────────────────────────────────────────
// Live photochemistry sim — 4 jars + accumulating precipitate + chart
function PhotochemSim() {
  const [running, setRunning] = useState(true);
  const [tMin, setTMin] = useState(0);          // simulated minutes (0..180)
  const [speed, setSpeed] = useState(60);       // simulated min per real second
  const runningRef = useRef(running);
  const speedRef = useRef(speed);
  const lastRef = useRef<number | null>(null);
  const rafRef = useRef<number | null>(null);

  useEffect(() => { runningRef.current = running; }, [running]);
  useEffect(() => { speedRef.current = speed; }, [speed]);

  useEffect(() => {
    const tick = (now: number) => {
      if (lastRef.current === null) lastRef.current = now;
      const dt = (now - lastRef.current) / 1000;
      lastRef.current = now;
      if (runningRef.current) {
        setTMin(prev => {
          const next = prev + dt * speedRef.current;
          return next >= 180 ? 180 : next;
        });
      }
      rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => { if (rafRef.current !== null) cancelAnimationFrame(rafRef.current); };
  }, []);

  const reset = () => { setTMin(0); setRunning(true); };

  // chart geometry
  const W = 560, H = 220, padL = 42, padR = 12, padT = 12, padB = 32;
  const innerW = W - padL - padR, innerH = H - padT - padB;
  const xMin = 0, xMax = 180;
  const yMin = 0, yMax = 100;
  const xScale = (m: number) => padL + (m - xMin) / (xMax - xMin) * innerW;
  const yScale = (v: number) => padT + (1 - (v - yMin) / (yMax - yMin)) * innerH;

  const curves = CONDITIONS.map(c => {
    const points: string[] = [];
    const stepN = 60;
    for (let i = 0; i <= stepN; i++) {
      const m = (i / stepN) * Math.min(tMin, 180);
      const v = c.rate * m;
      points.push(`${xScale(m).toFixed(1)},${yScale(v).toFixed(1)}`);
      if (m >= tMin) break;
    }
    return { c, points: points.join(" "), current: c.rate * tMin };
  });

  return (
    <div style={{
      padding:"1.4rem", borderRadius:16,
      background:"rgba(7,10,20,0.7)",
      border:"1px solid rgba(167,139,250,0.18)",
    }}>
      {/* control row */}
      <div style={{ display:"flex", flexWrap:"wrap", alignItems:"center", gap:14, marginBottom:"1.2rem" }}>
        <div style={{ flex:"1 1 200px" }}>
          <div style={{ ...KICKER, marginBottom:2 }}>Sim Time</div>
          <div style={{ fontSize:"1.45rem", color:"#f1f5f9", fontFamily:"'Cinzel',serif" }}>{tMin.toFixed(1)} <span style={{ fontSize:"0.85rem", color:"#94a3b8" }}>/ 180 min</span></div>
        </div>
        <button onClick={() => setRunning(r => !r)} data-testid="btn-sim-toggle" style={btn(running ? "#22c55e" : "#a78bfa")}>
          {running ? "⏸ Pause" : "▶ Run"}
        </button>
        <button onClick={reset} data-testid="btn-sim-reset" style={btn("#94a3b8")}>↺ Reset</button>
        <label style={{ display:"flex", flexDirection:"column", gap:4, minWidth:160 }}>
          <span style={{ ...KICKER, marginBottom:0 }}>Speed · {speed}× min/s</span>
          <input type="range" min={5} max={180} value={speed} onChange={e => setSpeed(Number(e.target.value))}
            style={{ accentColor:"#a78bfa" }}/>
        </label>
      </div>

      {/* jars */}
      <div style={{ display:"grid", gridTemplateColumns:"repeat(4, 1fr)", gap:"0.9rem", marginBottom:"1.4rem" }}>
        {CONDITIONS.map(c => {
          const v = c.rate * tMin;
          const fillFrac = Math.min(1, v / 110); // visual fill (sediment ratio)
          return (
            <div key={c.key} data-testid={`jar-${c.key}`} style={{
              padding:"0.7rem 0.5rem", borderRadius:10,
              background:"rgba(0,0,0,0.45)",
              border:"1px solid rgba(255,255,255,0.05)",
              display:"flex", flexDirection:"column", alignItems:"center",
            }}>
              {/* lamp */}
              <div style={{
                width:38, height:6, borderRadius:3,
                background: c.key === "dark" ? "#222" : c.color,
                boxShadow: c.key === "dark" ? "none" : `0 0 14px ${c.glow}`,
                marginBottom:0,
              }}/>
              {/* light beam */}
              <div style={{
                width:0, height:30,
                borderLeft: c.key === "dark" ? "20px solid transparent" : `20px solid ${c.color}33`,
                borderRight: c.key === "dark" ? "20px solid transparent" : `20px solid ${c.color}33`,
                borderTop:"6px solid transparent",
              }}/>
              {/* jar */}
              <div style={{
                position:"relative",
                width:"100%", maxWidth:90, aspectRatio:"3/5",
                borderRadius:"6px 6px 14px 14px",
                background: `linear-gradient(180deg, ${c.jarTint} 0%, rgba(0,0,0,0.7) 100%)`,
                border:"1px solid rgba(255,255,255,0.18)",
                boxShadow:`inset 0 0 30px ${c.glow}33`,
                overflow:"hidden",
              }}>
                {/* solution shimmer */}
                <div style={{
                  position:"absolute", inset:"6% 6% 24% 6%",
                  background: c.key === "dark"
                    ? "rgba(20,18,28,0.4)"
                    : `radial-gradient(ellipse at 30% 20%, ${c.color}60, transparent 70%)`,
                  borderRadius:4,
                }}/>
                {/* sediment */}
                <div style={{
                  position:"absolute", left:"6%", right:"6%", bottom:"6%",
                  height:`${4 + fillFrac * 38}%`,
                  background:`linear-gradient(180deg, ${c.color}aa, #eaeaff)`,
                  borderRadius:"2px 2px 8px 8px",
                  transition:"height 0.3s ease",
                }}/>
              </div>
              <div style={{ marginTop:6, textAlign:"center" }}>
                <div style={{ fontSize:11, color:c.color, fontFamily:"'DM Mono',monospace", letterSpacing:1, fontWeight:700 }}>{c.label}</div>
                <div style={{ fontSize:9, color:"#64748b", fontFamily:"'DM Mono',monospace" }}>{c.wavelength}</div>
                <div style={{ fontSize:"0.85rem", color:"#f1f5f9", fontWeight:700, marginTop:3 }}>{v.toFixed(1)}<span style={{ fontSize:9, color:"#64748b", fontWeight:400 }}> mg/L</span></div>
              </div>
            </div>
          );
        })}
      </div>

      {/* chart */}
      <div style={{
        padding:"0.7rem", borderRadius:10, background:"rgba(0,0,0,0.45)",
        border:"1px solid rgba(255,255,255,0.05)", overflowX:"auto",
      }}>
        <div style={{ ...KICKER, marginBottom:6 }}>Cumulative CaCO₃ · mg/L vs minutes</div>
        <svg viewBox={`0 0 ${W} ${H}`} style={{ width:"100%", maxWidth:W, height:"auto", display:"block" }}>
          {/* grid */}
          {[0,25,50,75,100].map(v => (
            <g key={v}>
              <line x1={padL} x2={W-padR} y1={yScale(v)} y2={yScale(v)} stroke="rgba(255,255,255,0.06)"/>
              <text x={padL-6} y={yScale(v)+3} fill="#64748b" fontSize="9" fontFamily="DM Mono,monospace" textAnchor="end">{v}</text>
            </g>
          ))}
          {[0,30,60,90,120,150,180].map(m => (
            <g key={m}>
              <line x1={xScale(m)} x2={xScale(m)} y1={padT} y2={H-padB} stroke="rgba(255,255,255,0.04)"/>
              <text x={xScale(m)} y={H-padB+12} fill="#64748b" fontSize="9" fontFamily="DM Mono,monospace" textAnchor="middle">{m}</text>
            </g>
          ))}
          {/* axes */}
          <line x1={padL} x2={W-padR} y1={H-padB} y2={H-padB} stroke="rgba(255,255,255,0.18)"/>
          <line x1={padL} x2={padL} y1={padT} y2={H-padB} stroke="rgba(255,255,255,0.18)"/>
          {/* curves */}
          {curves.map(({ c, points, current }) => (
            <g key={c.key}>
              <polyline points={points} fill="none" stroke={c.color} strokeWidth={2} strokeLinejoin="round"
                style={{ filter: c.key==="dark" ? "none" : `drop-shadow(0 0 4px ${c.glow})` }}/>
              {tMin > 0 && (
                <circle cx={xScale(Math.min(tMin,180))} cy={yScale(current)} r={3} fill={c.color}/>
              )}
            </g>
          ))}
          {/* legend */}
          <g transform={`translate(${padL+12}, ${padT+8})`}>
            {CONDITIONS.map((c, i) => (
              <g key={c.key} transform={`translate(0, ${i*14})`}>
                <rect width={10} height={3} y={4} fill={c.color}/>
                <text x={16} y={9} fill="#cbd5e1" fontSize="10" fontFamily="DM Mono,monospace">{c.label}</text>
              </g>
            ))}
          </g>
        </svg>
      </div>

      <div style={{ marginTop:"0.9rem", fontSize:"0.8rem", color:"#94a3b8", lineHeight:1.55 }}>
        Rates from <strong style={{ color:"#cbd5e1" }}>1FCF6888</strong>: Violet 0.72 · Blue 0.55 · White 0.32 · Dark 0.18 mg/L/min.
        Verdict: <strong style={{ color:"#a78bfa" }}>Violet ≻ Blue ≻ White ≻ Dark</strong> — visible-light photochemistry lowers the nucleation barrier via electronic excitation of Ca²⁺, CO₃²⁻ and H₂O.
      </div>
    </div>
  );
}

const btn = (col: string): React.CSSProperties => ({
  padding:"0.55rem 0.95rem", borderRadius:8,
  background:`${col}1f`, border:`1px solid ${col}55`,
  color:"#f1f5f9", fontSize:"0.85rem", fontFamily:"'DM Mono',monospace",
  letterSpacing:1.5, textTransform:"uppercase", cursor:"pointer",
});

// ───────────────────────────────────────────────────────────────────────────
// Synthesis Bridge — auto-cycling 5-stage geological accelerator
const STAGES = [
  { num:1, label:"Chemical Layering",  detail:"Introduce calcium, silicates, carbonates and other ions in controlled layers.", color:"#7AC5E8", icon:"≣" },
  { num:2, label:"Rapid Light Pulse",  detail:"High-intensity light stimulates photochemical reactions and nucleation.",      color:"#FFFFFF", icon:"✺" },
  { num:3, label:"Cool",                detail:"Rapid cooling creates stress that encourages crystal formation.",                color:"#5EC8E8", icon:"❄" },
  { num:4, label:"Warm",                detail:"Controlled heating finishes the cycle and stabilises the lattice.",              color:"#F09060", icon:"☼" },
  { num:5, label:"Dark / Pressure",     detail:"Pressure phase compacts and binds — natural-looking rock formation.",            color:"#9B7AC5", icon:"▮" },
];

function SynthesisBridges() {
  const [stageIdx, setStageIdx] = useState(0);
  const [auto, setAuto] = useState(true);
  const autoRef = useRef(auto);
  useEffect(() => { autoRef.current = auto; }, [auto]);
  useEffect(() => {
    const id = setInterval(() => {
      if (autoRef.current) setStageIdx(i => (i + 1) % STAGES.length);
    }, 2200);
    return () => clearInterval(id);
  }, []);
  const current = STAGES[stageIdx] ?? STAGES[0]!;
  return (
    <div style={{
      padding:"1.2rem 1.4rem", borderRadius:16,
      background:"rgba(7,10,20,0.7)",
      border:"1px solid rgba(56,189,248,0.18)",
    }}>
      <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", flexWrap:"wrap", gap:12, marginBottom:"1rem" }}>
        <div>
          <div style={KICKER}>Synthesis Bridge · auto-cycling</div>
          <div style={{ fontSize:"1.1rem", color:"#f1f5f9", fontWeight:700 }}>Recreate Geological Formation Faster</div>
        </div>
        <button onClick={() => setAuto(a => !a)} data-testid="btn-auto-toggle" style={btn(auto ? "#22c55e" : "#94a3b8")}>
          {auto ? "⏸ Pause cycle" : "▶ Resume cycle"}
        </button>
      </div>

      <div style={{ display:"grid", gridTemplateColumns:"repeat(5, 1fr)", gap:"0.6rem", marginBottom:"1rem" }}>
        {STAGES.map((s, i) => {
          const active = i === stageIdx;
          return (
            <button key={s.num} onClick={() => { setAuto(false); setStageIdx(i); }}
              data-testid={`stage-${s.num}`}
              style={{
                padding:"0.7rem 0.4rem", borderRadius:10,
                background: active ? `${s.color}24` : "rgba(0,0,0,0.4)",
                border:`1px solid ${active ? s.color : "rgba(255,255,255,0.08)"}`,
                color:"#f1f5f9", cursor:"pointer", textAlign:"center",
                transition:"all 0.3s",
                boxShadow: active ? `0 0 18px ${s.color}55` : "none",
              }}>
              <div style={{ fontSize:"1.6rem", color:s.color, lineHeight:1 }}>{s.icon}</div>
              <div style={{ fontSize:9, color:"#64748b", fontFamily:"'DM Mono',monospace", marginTop:4 }}>STAGE {s.num}</div>
              <div style={{ fontSize:"0.78rem", fontWeight:600, color:"#f1f5f9", marginTop:2, lineHeight:1.2 }}>{s.label}</div>
            </button>
          );
        })}
      </div>

      <div style={{
        padding:"0.9rem 1.1rem", borderRadius:10,
        background:`linear-gradient(135deg, ${current.color}1a, transparent)`,
        border:`1px solid ${current.color}44`,
      }}>
        <div style={{ fontSize:"0.78rem", color:current.color, fontFamily:"'DM Mono',monospace", letterSpacing:1.5, textTransform:"uppercase", marginBottom:5 }}>
          Stage {current.num} · {current.label}
        </div>
        <div style={{ fontSize:"0.92rem", color:"#e2e8f0", lineHeight:1.55 }}>{current.detail}</div>
      </div>
    </div>
  );
}

// ───────────────────────────────────────────────────────────────────────────
// Plasma Mix Ratio panel

function polarToCart(cx: number, cy: number, r: number, angleDeg: number): [number, number] {
  const rad = (angleDeg - 90) * Math.PI / 180;
  return [cx + r * Math.cos(rad), cy + r * Math.sin(rad)];
}
function donutArcPath(cx: number, cy: number, r: number, ri: number, a0: number, a1: number): string {
  if (a1 - a0 >= 360) a1 = a0 + 359.99;
  const [ox0, oy0] = polarToCart(cx, cy, r,  a0);
  const [ox1, oy1] = polarToCart(cx, cy, r,  a1);
  const [ix1, iy1] = polarToCart(cx, cy, ri, a1);
  const [ix0, iy0] = polarToCart(cx, cy, ri, a0);
  const lg = a1 - a0 > 180 ? 1 : 0;
  return `M${ox0},${oy0} A${r},${r} 0 ${lg},1 ${ox1},${oy1} L${ix1},${iy1} A${ri},${ri} 0 ${lg},0 ${ix0},${iy0} Z`;
}

type GasKey = "H2" | "He" | "Ar" | "N2" | "O2" | "CO2";

const GASES: {
  key: GasKey; label: string; name: string; color: string; desc: string;
  coherence: number; nucleation: number; photonic: number; field: number;
}[] = [
  { key:"H2",  label:"H₂",  name:"Hydrogen",       color:"#60a5fa",
    desc:"Fusion fuel · high thermal conductivity · drives reduction & accelerates nucleation.",
    coherence:0.80, nucleation:1.20, photonic:1.40, field:1.30 },
  { key:"He",  label:"He",  name:"Helium",          color:"#a78bfa",
    desc:"Inert carrier · highest field coherence propagation · cryogenic compatible.",
    coherence:1.40, nucleation:0.60, photonic:0.80, field:1.50 },
  { key:"Ar",  label:"Ar",  name:"Argon",           color:"#5ec8e8",
    desc:"Nucleation moderator · uniform ion bombardment · surface activation layer.",
    coherence:1.20, nucleation:0.90, photonic:0.70, field:1.10 },
  { key:"N2",  label:"N₂",  name:"Nitrogen",        color:"#34d399",
    desc:"Surface nitriding · adhesion layer · biological substrate compatibility.",
    coherence:0.90, nucleation:0.80, photonic:1.10, field:0.90 },
  { key:"O2",  label:"O₂",  name:"Oxygen",          color:"#f59e0b",
    desc:"Photochemical oxidiser · drives CaCO₃ formation · powers CUCA photosynthesis loop.",
    coherence:0.70, nucleation:1.50, photonic:1.30, field:0.80 },
  { key:"CO2", label:"CO₂", name:"Carbon Dioxide",  color:"#fb7185",
    desc:"Carbon source · carbonate precipitation · closes atmospheric CO₂ loop in CUCA.",
    coherence:0.60, nucleation:1.30, photonic:1.00, field:0.70 },
];

const PLASMA_PRESETS: Record<string, Record<GasKey, number>> = {
  "AETHER Optimal": { H2:40, He:20, Ar:15, N2:5,  O2:15, CO2:5  },
  "CUCA Loop":      { H2:30, He:10, Ar:10, N2:10, O2:30, CO2:10 },
  "Marine CaCO₃":   { H2:10, He:5,  Ar:20, N2:15, O2:35, CO2:15 },
  "Fusion Blanket":  { H2:70, He:20, Ar:5,  N2:2,  O2:2,  CO2:1  },
};

const METRIC_META = [
  { k:"coherence"  as const, label:"Field Coherence",  col:"#a78bfa" },
  { k:"nucleation" as const, label:"Nucleation Rate",  col:"#f59e0b" },
  { k:"photonic"   as const, label:"Photonic Yield",   col:"#60a5fa" },
  { k:"field"      as const, label:"Resonant Field",   col:"#34d399" },
];

function PlasmaMixer() {
  const [vals, setVals] = useState<Record<GasKey, number>>({ ...PLASMA_PRESETS["AETHER Optimal"] });
  const [activePreset, setActivePreset] = useState<string>("AETHER Optimal");
  const [hoveredGas, setHoveredGas] = useState<GasKey | null>(null);

  const total = useMemo(() =>
    (Object.values(vals) as number[]).reduce((s, v) => s + v, 0) || 1,
    [vals]
  );

  const normed = useMemo(
    () => Object.fromEntries(GASES.map(g => [g.key, (vals[g.key] ?? 0) / total])) as Record<GasKey, number>,
    [vals, total]
  );

  const metrics = useMemo(() => {
    let coherence = 0, nucleation = 0, photonic = 0, field = 0;
    GASES.forEach(g => {
      const w = normed[g.key];
      coherence  += w * g.coherence;
      nucleation += w * g.nucleation;
      photonic   += w * g.photonic;
      field      += w * g.field;
    });
    const sc = (v: number) => Math.round(Math.max(0, Math.min(100, (v - 0.55) / 1.0 * 100)));
    return { coherence: sc(coherence), nucleation: sc(nucleation), photonic: sc(photonic), field: sc(field) };
  }, [normed]);

  const arcs = useMemo(() => {
    const CX = 80, CY = 80, R = 64, RI = 42;
    let angle = -90;
    return GASES.map(g => {
      const sweep = normed[g.key] * 360;
      const path = donutArcPath(CX, CY, R, RI, angle, angle + (sweep < 0.5 ? 0 : sweep));
      angle += sweep;
      return { g, path, pct: Math.round(normed[g.key] * 100) };
    });
  }, [normed]);

  const setPreset = (name: string) => {
    const p = PLASMA_PRESETS[name];
    if (p) { setVals({ ...p }); setActivePreset(name); }
  };

  const setGas = (key: GasKey, v: number) => {
    setVals(prev => ({ ...prev, [key]: v }));
    setActivePreset("");
  };

  const hovered = hoveredGas ? GASES.find(g => g.key === hoveredGas) : null;

  return (
    <div style={{ padding:"1.4rem", borderRadius:16, background:"rgba(7,10,20,0.72)", border:"1px solid rgba(96,165,250,0.2)" }}>

      {/* Presets */}
      <div style={{ display:"flex", flexWrap:"wrap", gap:8, marginBottom:"1.3rem", alignItems:"center" }}>
        <span style={{ ...KICKER, marginBottom:0 }}>Preset recipes ·</span>
        {Object.keys(PLASMA_PRESETS).map(p => (
          <button key={p} onClick={() => setPreset(p)} style={{
            padding:"0.35rem 0.8rem", borderRadius:6,
            fontSize:"0.76rem", fontFamily:"'DM Mono',monospace", letterSpacing:1, cursor:"pointer",
            background: activePreset === p ? "rgba(96,165,250,0.16)" : "rgba(0,0,0,0.4)",
            border:`1px solid ${activePreset === p ? "#60a5fa88" : "rgba(255,255,255,0.09)"}`,
            color: activePreset === p ? "#60a5fa" : "#94a3b8", transition:"all 0.2s",
          }}>{p}</button>
        ))}
      </div>

      <div style={{ display:"grid", gridTemplateColumns:"min(160px,35%) 1fr", gap:"1.6rem", alignItems:"start" }}>

        {/* Donut + legend */}
        <div>
          <svg viewBox="0 0 160 160" style={{ width:"100%", height:"auto", display:"block" }}>
            {arcs.map(({ g, path, pct }) => pct === 0 ? null : (
              <path key={g.key} d={path}
                fill={g.color}
                opacity={hoveredGas === null || hoveredGas === g.key ? 0.88 : 0.28}
                style={{ filter:`drop-shadow(0 0 5px ${g.color}55)`, transition:"opacity 0.2s" }}
              />
            ))}
            <circle cx={80} cy={80} r={38} fill="rgba(7,10,20,0.9)"/>
            {hovered ? (
              <>
                <text x="80" y="74" textAnchor="middle" fill={hovered.color}
                  fontSize="14" fontFamily="DM Mono,monospace" fontWeight="800">{hovered.label}</text>
                <text x="80" y="88" textAnchor="middle" fill="#94a3b8"
                  fontSize="9" fontFamily="DM Mono,monospace">
                  {Math.round(normed[hovered.key] * 100)}%
                </text>
              </>
            ) : (
              <>
                <text x="80" y="76" textAnchor="middle" fill="#e2e8f0"
                  fontSize="10" fontFamily="DM Mono,monospace" fontWeight="700">PLASMA</text>
                <text x="80" y="89" textAnchor="middle" fill="#475569"
                  fontSize="9" fontFamily="DM Mono,monospace">MIX</text>
              </>
            )}
          </svg>
          <div style={{ display:"flex", flexDirection:"column", gap:4, marginTop:6 }}>
            {GASES.map(g => (
              <div key={g.key} style={{ display:"flex", alignItems:"center", gap:6, opacity: normed[g.key] < 0.01 ? 0.3 : 1 }}>
                <div style={{ width:8, height:8, borderRadius:2, background:g.color, flexShrink:0 }}/>
                <span style={{ fontSize:9, fontFamily:"'DM Mono',monospace", color:"#94a3b8" }}>
                  {g.label} <span style={{ color:g.color, fontWeight:700 }}>{Math.round(normed[g.key]*100)}%</span>
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Sliders */}
        <div style={{ display:"flex", flexDirection:"column", gap:"0.9rem" }}>
          {GASES.map(g => {
            const pct = Math.round(normed[g.key] * 100);
            return (
              <div key={g.key}
                onMouseEnter={() => setHoveredGas(g.key)}
                onMouseLeave={() => setHoveredGas(null)}>
                <div style={{ display:"flex", justifyContent:"space-between", marginBottom:4 }}>
                  <span style={{ fontSize:11, fontFamily:"'DM Mono',monospace", color:g.color, fontWeight:700 }}>
                    {g.label} · <span style={{ color:"#94a3b8", fontWeight:400 }}>{g.name}</span>
                  </span>
                  <span style={{ fontSize:11, fontFamily:"'DM Mono',monospace", color:"#f1f5f9", fontWeight:700 }}>
                    {pct}%
                  </span>
                </div>
                <div style={{ position:"relative", height:6, borderRadius:3, background:"rgba(255,255,255,0.06)", marginBottom:4 }}>
                  <div style={{
                    position:"absolute", left:0, top:0, height:"100%",
                    width:`${pct}%`, borderRadius:3,
                    background:`linear-gradient(90deg, ${g.color}88, ${g.color})`,
                    boxShadow:`0 0 6px ${g.color}66`,
                    transition:"width 0.15s ease",
                  }}/>
                </div>
                <input type="range" min={0} max={100} value={vals[g.key]}
                  onChange={e => setGas(g.key, Number(e.target.value))}
                  style={{ width:"100%", accentColor:g.color, margin:0 }}/>
                <div style={{ fontSize:9, color:"#475569", fontFamily:"'DM Mono',monospace", marginTop:3, lineHeight:1.4 }}>
                  {g.desc}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Output metrics */}
      <div style={{ marginTop:"1.4rem", borderTop:"1px solid rgba(255,255,255,0.06)", paddingTop:"1.1rem" }}>
        <div style={{ ...KICKER, marginBottom:"0.8rem" }}>Substrate output · derived from mix ratio</div>
        <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit, minmax(150px,1fr))", gap:"0.75rem" }}>
          {METRIC_META.map(({ k, label, col }) => {
            const v = metrics[k];
            return (
              <div key={k} style={{
                padding:"0.75rem 0.9rem", borderRadius:10,
                background:"rgba(0,0,0,0.38)", border:`1px solid ${col}22`,
              }}>
                <div style={{ fontSize:9, color:col, fontFamily:"'DM Mono',monospace",
                  letterSpacing:1.5, textTransform:"uppercase", marginBottom:6 }}>{label}</div>
                <div style={{ fontSize:"1.45rem", fontWeight:800, color:col, fontFamily:"'Cinzel',serif", lineHeight:1 }}>
                  {v}<span style={{ fontSize:"0.75rem", color:"#475569", fontWeight:400 }}>%</span>
                </div>
                <div style={{ marginTop:8, height:4, borderRadius:2, background:"rgba(255,255,255,0.06)" }}>
                  <div style={{
                    height:"100%", width:`${v}%`, borderRadius:2,
                    background:`linear-gradient(90deg, ${col}88, ${col})`,
                    boxShadow:`0 0 6px ${col}88`,
                    transition:"width 0.4s ease",
                  }}/>
                </div>
              </div>
            );
          })}
        </div>
        <div style={{ marginTop:"0.9rem", fontSize:"0.78rem", color:"#475569", lineHeight:1.55, fontFamily:"'DM Mono',monospace" }}>
          Weights derived from AETHER CUCA v4.1 + EUROFER97 fusion blanket data.
          Coherence peaks with He-dominant mix · Nucleation peaks with O₂/CO₂ · Field peaks with He/H₂.
          Presets are normalised so all ratios always sum to 100 %.
        </div>
      </div>
    </div>
  );
}

// ───────────────────────────────────────────────────────────────────────────
export default function SubstrateSynthesisPage() {
  const totalAt180 = useMemo(() => CONDITIONS.reduce((s, c) => s + c.total180, 0), []);
  return (
    <div data-testid="page-substrate-synthesis" style={{
      minHeight:"100vh", width:"100%",
      background:"radial-gradient(ellipse at top, #0f172a 0%, #020617 55%, #000 100%)",
      color:"#e2e8f0", fontFamily:"'Outfit', system-ui, sans-serif",
      padding:"3rem 1.5rem 5rem",
    }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@400;600;700&family=DM+Mono&family=Outfit:wght@400;600;700&display=swap');
      `}</style>

      <div style={{ maxWidth:1200, margin:"0 auto" }}>
        {/* Masthead */}
        <header style={{
          padding:"2rem 1.8rem", borderRadius:18, marginBottom:"2rem",
          background:"linear-gradient(135deg, rgba(167,139,250,0.10), rgba(56,189,248,0.10))",
          border:"1px solid rgba(167,139,250,0.25)",
        }}>
          <div style={{ ...KICKER, fontSize:11, letterSpacing:"0.4em", marginBottom:10 }}>AETHER · Substrate Studio</div>
          <h1 style={{ fontSize:"clamp(1.9rem, 4.4vw, 2.9rem)", fontWeight:800, color:"#f1f5f9",
            margin:"0 0 0.6rem", letterSpacing:"-0.02em", lineHeight:1.12 }}>
            Substrate Synthesis · Automated Light, Layered Crystallization
          </h1>
          <p style={{ fontSize:"1rem", color:"#cbd5e1", lineHeight:1.7, maxWidth:820, margin:0 }}>
            Live photochemistry sim of CaCO₃ precipitation under violet · blue · white · dark conditions, an auto-cycling
            5-stage geological-accelerator bridge, and the substrate stack that grounds AETHER's coherence engine —
            all driven by Shia Miller's "calculation in matter, under light".
          </p>
        </header>

        {/* LIFE = formula */}
        <Section kicker="Substrate Axiom · Shia Miller (5/3/26)" title="LIFE = Energy Gradient · Medium · Mechanism"
          lead="Three slots that any living substrate must fill. AETHER's stack reads this triad as: input → carrier → exploit-and-build.">
          <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit, minmax(min(100%, 240px), 1fr))", gap:"0.9rem" }}>
            <Card kicker="Energy Gradient" title="Sunlight · Chemical · Geothermal" accent="#f7c948">
              The input that drives everything. Without a gradient, no work; without work, no organisation.
            </Card>
            <Card kicker="Medium" title="Water · Atmosphere · Substrate" accent="#5ec8e8">
              The carrier for processes. Liquid state lets planetary forces in (Steiner) — the medium is itself partly the message.
            </Card>
            <Card kicker="Mechanism" title="Molecules / Systems" accent="#a78bfa">
              That exploit the gradient and build structure. CaCO₃ light-directed precipitation is the canonical example.
            </Card>
          </div>
        </Section>

        {/* Live photochemistry sim */}
        <Section kicker="I · Live Photochemistry Sim" title="Blue & Violet Light Accelerate CaCO₃ Precipitation"
          lead="Simulated marine environment (0.5 M NaCl · 10 mM CaCl₂ · 10 mM NaHCO₃ · pH 8.2 · 25 °C). Four jars run in parallel.
          Press Run; watch the sediment build and the curves diverge in real time. The numbers come straight from the published 180-min experiment.">
          <PhotochemSim/>
        </Section>

        {/* Mechanism breakdown */}
        <Section kicker="II · Mechanism" title="How Visible Light Lowers the Nucleation Barrier (Indirectly)"
          lead="From the Layered Optical + Noise-Driven Control framework — three coupled photophysical levers.">
          <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit, minmax(min(100%, 280px), 1fr))", gap:"0.9rem" }}>
            <Card kicker="A · Hydration Shell" title="H-bond perturbation" accent="#5ec8e8">
              Blue/violet light perturbs the H-bond network around Ca²⁺ → faster water reorganisation, easier desolvation,
              lower nucleation barrier.
            </Card>
            <Card kicker="B · Micro-thermal" title="Hot spots & micro-convection" accent="#f09060">
              Absorption + scattering create local hot spots → increased collision frequency, controlled "noise" that
              drives exploration of state space.
            </Card>
            <Card kicker="C · Interface Activation" title="Charge surface + photochem" accent="#a78bfa">
              Stronger interaction at impurities / interfaces → more nucleation sites where the field is most intense.
            </Card>
          </div>
          <div style={{ marginTop:"1rem", padding:"1rem 1.2rem", borderRadius:10,
            background:"rgba(167,139,250,0.06)", border:"1px solid rgba(167,139,250,0.2)" }}>
            <div style={KICKER}>Nucleation Rate Equation (from §11 of the framework)</div>
            <div style={{ fontFamily:"'Cinzel',serif", fontSize:"1.25rem", color:"#f1f5f9", margin:"0.3rem 0", letterSpacing:"0.5px" }}>
              J = J₀ · exp(−ΔG* / k T_eff)
            </div>
            <div style={{ fontSize:"0.85rem", color:"#cbd5e1" }}>
              T_eff = T + α_violet · I_violet + α_blue · I_blue + σ_noise.&nbsp;
              ΔG* = ΔG*₀ − β_hyd − γ_int − δ_light.
            </div>
          </div>
        </Section>

        {/* Synthesis Bridges */}
        <Section kicker="III · Synthesis Bridges" title="Geological Formation, Hours Instead of Millennia"
          lead="The 5-stage accelerator: Layer · Pulse · Cool · Warm · Dark. Each stage targets a different phase of the natural mineral cycle. Click a stage to inspect; hit Pause to stop the auto-cycle.">
          <SynthesisBridges/>
        </Section>

        {/* Plasma Mix Ratio */}
        <Section kicker="IV · Plasma-to-Substrate Mix Ratio" title="Tune the Plasma Gas Composition"
          lead="Adjust each gas fraction with the sliders — the donut, metric bars, and output scores update live. Hover any gas to highlight its segment. Presets lock in AETHER-recommended profiles derived from the CUCA v4.1 framework and EUROFER97 fusion blanket data.">
          <PlasmaMixer/>
          <div style={{ marginTop:"1rem" }}>
            <Plate src={fusionSubstrate}
              caption="AETHER // Quantum Substrate State — EUROFER97 (F82H) blanket · substrate quantum diagonalisation · quantum knotting cycle engaged. TBR 1.248 ± 0.003 · extraction efficiency 99.4 % · coherence fidelity 1.000000 ± 2.1×10⁻¹⁸"
              aspect="16/9"/>
          </div>
        </Section>

        {/* BAVS substrates */}
        <Section kicker="V · Bio-Adaptive Vortex System (BAVS)" title="Substrate as Ecological Restoration Field"
          lead="Five-spiral-arm architecture induces vortices and recirculates water through internal feedback loops.
          Beyond mechanical flow, the system incorporates bioactive surfaces to foster marine micro-ecosystems.">
          <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit, minmax(min(100%, 240px), 1fr))", gap:"0.9rem" }}>
            <Card kicker="Substrates" title="Algae · Ceramic" accent="#7DCC92">
              Algae-seeded surfaces and porous ceramic microbial anchors promote nutrient absorption and organic-waste breakdown.
            </Card>
            <Card kicker="Materials" title="Marine PVC · HDPE · Silicone" accent="#5ec8e8">
              Structural components utilise marine-grade PVC, high-density polyethylene (HDPE) and silicone elastomer coatings.
            </Card>
            <Card kicker="Networked Impact" title="Cluster Deployment" accent="#a78bfa">
              Units deployed in clusters within specific zip codes create micro-ecosystem restoration fields that self-organise in high-pollution zones.
            </Card>
          </div>
        </Section>

        {/* Spatial Intention */}
        <Section kicker="VI · Mapping Biological Response → AETHER" title="Molecular Control as 'Spatial Intention' (A)"
          lead="In AETHER, spatial intention (A) refers to the explicit meaning encoded within a given space. The molecular/industrial scale represents the definition of intention; picogram consistency and live attenuation of the rotavirus are the engineered signals — high-fidelity spatial 'bricks' of meaning.">
          <Card kicker="Bridge" title="Substrate → Intention → Computation" accent="#a78bfa">
            Light pattern (intention) → CaCO₃ supersaturation field (substrate) → crystal morphology (output structure).
            The same loop runs at the BAVS scale (water flow → biofilm) and the AETHER scale (prompt → coherence field → response).
          </Card>
        </Section>

        {/* Tree of Life */}
        <Section kicker="VII · Substrate of Substrates" title="Where the Mechanism Sits in the Tree of Life"
          lead="LUCA → Bacteria · Archaea · Eukarya. Every substrate-computation experiment AETHER runs is implicitly running on one of these branches. The Institut Pasteur 2023 dendrogram is the cross-check against branch-naïve claims.">
          <Plate src={treeOfLife} caption="Tree of Life (Institut Pasteur, Feb 2023). LUCA at the centre; Bacteria (purple) and Archaea (cream) on either side; Eukarya inset (teal). Schematic illustrations at each leaf." aspect="16/10"/>
        </Section>

        {/* Source plates */}
        <Section kicker="VIII · Source Plates" title="Originals" lead="The infographics and tweets that drive this page.">
          <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit, minmax(min(100%, 280px), 1fr))", gap:"0.9rem" }}>
            <Plate src={shiaLifeFormula}    caption="Shia Miller · LIFE = Energy Gradient + Medium + Mechanism (8:21 AM · 5/3/26)"/>
            <Plate src={shiaCaCO3}          caption="Shia Miller · 'calculation performed not symbolically but spatiotemporally, in matter, under light' (6:06 PM · 5/3/26)"/>
            <Plate src={shiaSpatialIntention} caption="Shia Miller · Mapping Biological Response to AETHER (5:26 PM · 5/3/26)"/>
            <Plate src={bavsSubstrates}     caption="BAVS · Bio-Adaptive Vortex System substrates / materials / networked impact (4:48 PM · 5/3/26)"/>
            <Plate src={photochemHypothesis} caption="Photochemistry Hypothesis Test for CaCO₃ Precipitation · 4-panel experimental design"/>
            <Plate src={blueVioletPaper}    caption="Blue & Violet Light Accelerate CaCO₃ Precipitation in a Simulated Marine Environment · 180-min results table" aspect="16/10"/>
            <Plate src={layeredOpticalFramework} caption="Layered Optical + Noise-Driven Control of Crystallization · the 11-section framework" aspect="auto"/>
            <Plate src={geologicalAccelerator} caption="Recreating Geological Formation Faster · 5-stage dynamic cycle (drives Section III)" aspect="16/10"/>
          </div>
        </Section>

        {/* LinkedIn Image Archive */}
        <Section
          anchor="linkedin-archive"
          kicker="IX · LinkedIn Archive"
          title="Friday April 24th — 227 Slides"
          lead="Full image archive extracted from the LinkedIn post collection. Slides load on demand — 40 per page. Click any slide to open it full-screen. Use the jump box to go directly to a slide number."
        >
          <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
          <LinkedInGallery />
        </Section>

        {/* GPT Image Archive */}
        <Section
          anchor="gpt-archive"
          kicker="X · GPT Image Archive"
          title="315 GPT Images"
          lead="ChatGPT-generated image collection — 235 images available. Loads 40 per page. Click any image to open full-screen. Use the jump box to go directly to a specific image number."
        >
          <GptGallery />
        </Section>

        <footer style={{ marginTop:"2rem", paddingTop:"1.4rem",
          borderTop:"1px solid rgba(255,255,255,0.08)",
          textAlign:"center", fontSize:"0.78rem", color:"#64748b",
          fontFamily:"'DM Mono',monospace", letterSpacing:"0.2em", textTransform:"uppercase" }}>
          Substrate Studio · {totalAt180.toFixed(1)} mg/L total at 180 min · light is the prompt · matter is the answer
        </footer>
      </div>
    </div>
  );
}

// ── LinkedIn Image Gallery — 227 slides, lazy-loaded via IntersectionObserver ─
const LI_COUNT = 227;
const LI_URLS: string[] = Array.from({ length: LI_COUNT }, (_, i) => {
  const n = String(i + 1).padStart(3, "0");
  return `${import.meta.env.BASE_URL}linkedin_imgs/li-${n}.jpg`;
});

function LazyImg({ src, index, total = LI_COUNT, accentColor = "#a78bfa" }: {
  src: string; index: number; total?: number; accentColor?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [loaded, setLoaded] = useState(false);
  const [visible, setVisible] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const el = ref.current; if (!el) return;
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) { setVisible(true); obs.disconnect(); } },
      { rootMargin: "300px" }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  return (
    <>
      <div ref={ref}
        onClick={() => loaded && setOpen(true)}
        style={{
          borderRadius: 8, overflow: "hidden",
          background: "rgba(15,23,42,0.8)",
          border: "1px solid rgba(255,255,255,0.07)",
          aspectRatio: "8.5/11",
          cursor: loaded ? "zoom-in" : "default",
          position: "relative",
          transition: "border-color 0.2s",
        }}
        onMouseEnter={e => (e.currentTarget.style.borderColor = `${accentColor}66`)}
        onMouseLeave={e => (e.currentTarget.style.borderColor = "rgba(255,255,255,0.07)")}
      >
        {visible && (
          <img src={src} alt={`Image ${index + 1}`} loading="lazy"
            onLoad={() => setLoaded(true)}
            style={{
              width: "100%", height: "100%", objectFit: "cover",
              display: "block",
              opacity: loaded ? 1 : 0,
              transition: "opacity 0.3s",
            }}
          />
        )}
        {!loaded && (
          <div style={{
            position: "absolute", inset: 0,
            display: "flex", flexDirection: "column",
            alignItems: "center", justifyContent: "center", gap: 8,
          }}>
            <div style={{
              width: 28, height: 28, borderRadius: "50%",
              border: `2px solid ${accentColor}30`,
              borderTopColor: accentColor,
              animation: "spin 0.9s linear infinite",
            }}/>
            <div style={{ fontFamily: "'DM Mono',monospace", fontSize: 10,
              color: `${accentColor}66`, letterSpacing: "0.2em" }}>
              {String(index + 1).padStart(3, "0")}
            </div>
          </div>
        )}
        {/* image number badge */}
        <div style={{
          position: "absolute", bottom: 6, right: 7,
          fontFamily: "'DM Mono',monospace", fontSize: 9,
          color: `${accentColor}80`, letterSpacing: "0.15em",
          pointerEvents: "none",
        }}>
          {String(index + 1).padStart(3, "0")} / {total}
        </div>
      </div>

      {/* Lightbox */}
      {open && (
        <div
          onClick={() => setOpen(false)}
          style={{
            position: "fixed", inset: 0, zIndex: 9999,
            background: "rgba(0,0,0,0.92)",
            display: "flex", alignItems: "center", justifyContent: "center",
            cursor: "zoom-out",
          }}
        >
          <img src={src} alt={`LinkedIn post ${index + 1}`}
            style={{ maxWidth: "90vw", maxHeight: "90vh", objectFit: "contain",
              borderRadius: 8, boxShadow: "0 0 60px rgba(167,139,250,0.2)" }}
            onClick={e => e.stopPropagation()}
          />
          <div style={{
            position: "absolute", top: 24, right: 28,
            fontFamily: "'DM Mono',monospace", fontSize: 11,
            color: "rgba(167,139,250,0.6)", letterSpacing: "0.25em",
          }}>
            {String(index + 1).padStart(3, "0")} / {LI_COUNT} · click outside to close
          </div>
        </div>
      )}
    </>
  );
}

function LinkedInGallery() {
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(0);
  const PER_PAGE = 40;

  const filtered = useMemo(() => {
    if (!query.trim()) return LI_URLS.map((url, i) => ({ url, i }));
    const n = parseInt(query.trim(), 10);
    if (!isNaN(n) && n >= 1 && n <= LI_COUNT)
      return [{ url: LI_URLS[n - 1], i: n - 1 }];
    return LI_URLS.map((url, i) => ({ url, i }));
  }, [query]);

  const pages = Math.ceil(filtered.length / PER_PAGE);
  const slice = filtered.slice(page * PER_PAGE, (page + 1) * PER_PAGE);

  return (
    <div>
      {/* Controls */}
      <div style={{ display: "flex", flexWrap: "wrap", gap: 12, alignItems: "center", marginBottom: "1.2rem" }}>
        <input
          placeholder="Jump to slide # (1–227)"
          value={query}
          onChange={e => { setQuery(e.target.value); setPage(0); }}
          style={{
            background: "rgba(15,23,42,0.7)", border: "1px solid rgba(167,139,250,0.25)",
            borderRadius: 8, padding: "0.45rem 0.85rem",
            fontFamily: "'DM Mono',monospace", fontSize: 12,
            color: "#e2e8f0", outline: "none", width: 220,
          }}
        />
        <div style={{ fontFamily: "'DM Mono',monospace", fontSize: 11,
          color: "rgba(167,139,250,0.5)", letterSpacing: "0.2em" }}>
          {filtered.length} slides · page {page + 1} / {pages}
        </div>
        <div style={{ display: "flex", gap: 8, marginLeft: "auto" }}>
          <button onClick={() => setPage(p => Math.max(0, p - 1))} disabled={page === 0}
            style={{
              fontFamily: "'DM Mono',monospace", fontSize: 11, letterSpacing: "0.15em",
              background: "rgba(15,23,42,0.7)", border: "1px solid rgba(167,139,250,0.25)",
              borderRadius: 6, padding: "0.35rem 0.75rem", color: "#a78bfa",
              cursor: page === 0 ? "not-allowed" : "pointer", opacity: page === 0 ? 0.4 : 1,
            }}>← Prev</button>
          <button onClick={() => setPage(p => Math.min(pages - 1, p + 1))} disabled={page >= pages - 1}
            style={{
              fontFamily: "'DM Mono',monospace", fontSize: 11, letterSpacing: "0.15em",
              background: "rgba(15,23,42,0.7)", border: "1px solid rgba(167,139,250,0.25)",
              borderRadius: 6, padding: "0.35rem 0.75rem", color: "#a78bfa",
              cursor: page >= pages - 1 ? "not-allowed" : "pointer", opacity: page >= pages - 1 ? 0.4 : 1,
            }}>Next →</button>
        </div>
      </div>

      {/* Grid */}
      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fill, minmax(min(100%, 180px), 1fr))",
        gap: "0.75rem",
      }}>
        {slice.map(({ url, i }) => (
          <LazyImg key={i} src={url} index={i} />
        ))}
      </div>

      {/* Page dots */}
      {pages > 1 && (
        <div style={{ display: "flex", gap: 6, justifyContent: "center", marginTop: "1.2rem", flexWrap: "wrap" }}>
          {Array.from({ length: pages }, (_, pi) => (
            <button key={pi} onClick={() => setPage(pi)}
              style={{
                width: 28, height: 28, borderRadius: "50%",
                background: pi === page ? "#a78bfa" : "rgba(167,139,250,0.12)",
                border: `1px solid ${pi === page ? "#a78bfa" : "rgba(167,139,250,0.2)"}`,
                fontFamily: "'DM Mono',monospace", fontSize: 10,
                color: pi === page ? "#0f172a" : "#a78bfa",
                cursor: "pointer",
              }}>
              {pi + 1}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// ── GPT Image Gallery — 235 images, lazy-loaded ──────────────────────────────
const GPT_COUNT = 235;
const GPT_URLS: string[] = Array.from({ length: GPT_COUNT }, (_, i) => {
  const n = String(i + 1).padStart(3, "0");
  return `${import.meta.env.BASE_URL}gpt_imgs/gpt-${n}.png`;
});

function GptGallery() {
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(0);
  const PER_PAGE = 40;

  const filtered = useMemo(() => {
    if (!query.trim()) return GPT_URLS.map((url, i) => ({ url, i }));
    const n = parseInt(query.trim(), 10);
    if (!isNaN(n) && n >= 1 && n <= GPT_COUNT)
      return [{ url: GPT_URLS[n - 1], i: n - 1 }];
    return GPT_URLS.map((url, i) => ({ url, i }));
  }, [query]);

  const pages = Math.ceil(filtered.length / PER_PAGE);
  const slice = filtered.slice(page * PER_PAGE, (page + 1) * PER_PAGE);

  return (
    <div>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 12, alignItems: "center", marginBottom: "1.2rem" }}>
        <input
          placeholder="Jump to image # (1–235)"
          value={query}
          onChange={e => { setQuery(e.target.value); setPage(0); }}
          style={{
            background: "rgba(15,23,42,0.7)", border: "1px solid rgba(0,229,192,0.25)",
            borderRadius: 8, padding: "0.45rem 0.85rem",
            fontFamily: "'DM Mono',monospace", fontSize: 12,
            color: "#e2e8f0", outline: "none", width: 220,
          }}
        />
        <div style={{ fontFamily: "'DM Mono',monospace", fontSize: 11,
          color: "rgba(0,229,192,0.5)", letterSpacing: "0.2em" }}>
          {filtered.length} images · page {page + 1} / {pages}
        </div>
        <div style={{ display: "flex", gap: 8, marginLeft: "auto" }}>
          <button onClick={() => setPage(p => Math.max(0, p - 1))} disabled={page === 0}
            style={{
              fontFamily: "'DM Mono',monospace", fontSize: 11, letterSpacing: "0.15em",
              background: "rgba(15,23,42,0.7)", border: "1px solid rgba(0,229,192,0.25)",
              borderRadius: 6, padding: "0.35rem 0.75rem", color: "#00e5c0",
              cursor: page === 0 ? "not-allowed" : "pointer", opacity: page === 0 ? 0.4 : 1,
            }}>← Prev</button>
          <button onClick={() => setPage(p => Math.min(pages - 1, p + 1))} disabled={page >= pages - 1}
            style={{
              fontFamily: "'DM Mono',monospace", fontSize: 11, letterSpacing: "0.15em",
              background: "rgba(15,23,42,0.7)", border: "1px solid rgba(0,229,192,0.25)",
              borderRadius: 6, padding: "0.35rem 0.75rem", color: "#00e5c0",
              cursor: page >= pages - 1 ? "not-allowed" : "pointer", opacity: page >= pages - 1 ? 0.4 : 1,
            }}>Next →</button>
        </div>
      </div>

      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fill, minmax(min(100%, 180px), 1fr))",
        gap: "0.75rem",
      }}>
        {slice.map(({ url, i }) => (
          <LazyImg key={`gpt-${i}`} src={url} index={i} total={GPT_COUNT} accentColor="#00e5c0" />
        ))}
      </div>

      {pages > 1 && (
        <div style={{ display: "flex", gap: 6, justifyContent: "center", marginTop: "1.2rem", flexWrap: "wrap" }}>
          {Array.from({ length: pages }, (_, pi) => (
            <button key={pi} onClick={() => setPage(pi)}
              style={{
                width: 28, height: 28, borderRadius: "50%",
                background: pi === page ? "#00e5c0" : "rgba(0,229,192,0.1)",
                border: `1px solid ${pi === page ? "#00e5c0" : "rgba(0,229,192,0.2)"}`,
                fontFamily: "'DM Mono',monospace", fontSize: 10,
                color: pi === page ? "#0f172a" : "#00e5c0",
                cursor: "pointer",
              }}>
              {pi + 1}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function Plate({ src, caption, aspect = "16/10" }: { src: string; caption: string; aspect?: string }) {
  const isAuto = aspect === "auto";
  return (
    <figure style={{
      margin:0, borderRadius:12, overflow:"hidden",
      background:"rgba(15,23,42,0.7)",
      border:"1px solid rgba(255,255,255,0.08)",
    }}>
      <div style={{
        width:"100%",
        ...(isAuto ? { maxHeight:560 } : { aspectRatio: aspect }),
        background:"#000", display:"flex", alignItems:"center", justifyContent:"center", overflow:"hidden",
      }}>
        <img src={src} alt={caption} loading="lazy"
          style={{ width: isAuto ? "auto" : "100%", height: isAuto ? "auto" : "100%",
            maxWidth:"100%", maxHeight: isAuto ? 560 : "100%",
            objectFit:"contain", display:"block" }}/>
      </div>
      <figcaption style={{ padding:"0.7rem 0.9rem", fontSize:"0.8rem", color:"#cbd5e1", lineHeight:1.5 }}>{caption}</figcaption>
    </figure>
  );
}
