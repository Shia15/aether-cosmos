import { useState, useRef, useMemo } from "react";

/* ── fonts / colours matching original textbook ─────────────────────── */
const GOLD  = "#C9A84C";
const GOLD2 = "#FFD000";
const ACC   = "#00BFFF";
const PLAS  = "#FF4500";
const GUT   = "#a8e063";
const CIRC  = "#c0f0ff";
const EPI   = "#ff6ec7";
const DIS   = "#f0b27a";
const BG    = "#06080F";
const BG2   = "#0C0F1A";
const CARD  = "#13172A";
const BORD  = "rgba(201,168,76,.18)";
const TXT   = "#D8E0F0";
const DIM   = "#6878A0";
const disp  = "'Orbitron','Space Mono',monospace";
const mono2 = "'JetBrains Mono','Space Mono',monospace";
const serif2= "'Crimson Pro',Georgia,serif";

/* ── cascade engine ──────────────────────────────────────────────────── */
interface CascadeResult {
  f107: number; Bsw: number; Kp: number; uw: number;
  iod: number; T3r: number; ATP: number; gam: number;
  Om: number; rho: number; Sig: number; dis: number;
}
function calcCascade(solar: number, se: number, coast: number, gq: number, t: number): CascadeResult {
  const ph  = (t % 11) / 11;
  const cyc = 0.5 * (1 - Math.cos(2 * Math.PI * ph));
  const f107 = 65 + 155 * solar * cyc + (1 - solar) * 65;
  const Bsw  = 4 + 3.5 * Math.pow(f107 / 200, 0.5);
  const Kp   = 1.2 + 2.8 * Math.pow(f107 / 220, 0.7);
  const uw   = (0.4 + 0.3 * (Kp / 4)) * (0.3 + 0.7 * coast);
  const iod  = (50 + 110 * uw * (1 + 0.8 * coast)) * (0.5 + 0.5 * Math.min(f107, 220) / 220);
  const In   = iod / (iod + 80);
  const T3   = In * se * (0.85 + 0.15 * se);
  const rT3  = In * (1 - se) * 0.6 + 0.1;
  const T3r  = rT3 > 0.01 ? T3 / rT3 : 20;
  const PGC  = 0.4 + 0.6 * T3;
  const dPsi = 150 + 30 * T3;
  const ATP  = PGC * (dPsi / 180) * (0.7 + 0.3 * se);
  const tau  = 1 - ATP * 0.6;
  const gam  = Math.pow(Math.max(0.01, ATP), 1.4) * Math.exp(-0.3 * tau);
  const but  = 0.3 + 0.7 * gq * (0.5 + 0.5 * T3);
  const Om   = Math.min(1, Math.pow(Math.max(0.001, T3), 0.8) * but * (gq * 0.6 + 0.4));
  const rho  = Math.min(1, (0.4 + 0.4 * T3 + 0.2 * Om) * (0.7 + 0.3 * gam));
  const Sig  = Math.max(0, 1 - ((1 - rho) * 0.5 + (1 - Om) * 0.3 + (1 - gam) * 0.2) * 0.85);
  const dis  = Math.pow(1 - Math.min(1, gam * Om * rho * Sig), 1.8) * 100;
  return { f107, Bsw, Kp, uw, iod, T3r, ATP, gam, Om, rho, Sig, dis };
}

interface LayerDef { icon: string; name: string; col: string; val(r: CascadeResult): string; frac(r: CascadeResult): number; }
const CV_LAYERS: LayerDef[] = [
  { icon:"☀", name:"Solar F10.7",   col:GOLD2, val:r=>`${r.f107.toFixed(1)} sfu`, frac:r=>r.f107/230 },
  { icon:"⚡", name:"Solar Wind",    col:PLAS,  val:r=>`${r.Bsw.toFixed(2)} nT`,  frac:r=>(r.Bsw-4)/7 },
  { icon:"🌍", name:"Geomagnetic Kp",col:ACC,   val:r=>r.Kp.toFixed(2),           frac:r=>r.Kp/9 },
  { icon:"🌊", name:"Upwelling w",   col:"#4dc6ff",val:r=>`${(r.uw*100).toFixed(1)}%`,frac:r=>r.uw },
  { icon:"⚗", name:"Iodine UIE",    col:"#c39bd3",val:r=>`${r.iod.toFixed(1)} mcg/L`,frac:r=>r.iod/250},
  { icon:"⚙", name:"T3:rT3",        col:"#58d68d",val:r=>r.T3r.toFixed(1),        frac:r=>Math.min(r.T3r/25,1) },
  { icon:"⚡", name:"ATP rel.",      col:"#f1948a",val:r=>`${(r.ATP*100).toFixed(1)}%`,frac:r=>r.ATP },
  { icon:"🧠", name:"Neural Γ",      col:"#7fb3d3",val:r=>r.gam.toFixed(3),        frac:r=>r.gam },
  { icon:"🦠", name:"Microbiome Ω", col:GUT,   val:r=>r.Om.toFixed(3),            frac:r=>r.Om },
  { icon:"🌙", name:"Circadian ρ",  col:CIRC,  val:r=>r.rho.toFixed(3),           frac:r=>r.rho },
  { icon:"🧬", name:"Epigenome Σ",  col:EPI,   val:r=>r.Sig.toFixed(3),           frac:r=>r.Sig },
  { icon:"⚠", name:"Disease ΔR",   col:DIS,   val:r=>`+${r.dis.toFixed(1)}%`,    frac:r=>Math.min(r.dis/80,1)},
];

/* ── sub-components ──────────────────────────────────────────────────── */
function Eq({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div style={{ margin:"18px 0", padding:"14px 18px", background:`rgba(0,191,255,.04)`,
      borderLeft:`3px solid ${ACC}`, borderRadius:"0 5px 5px 0",
      fontFamily:mono2, fontSize:".78rem", color:"#c0e8ff", lineHeight:2, overflowX:"auto" }}>
      <span style={{ display:"block", fontSize:".54rem", color:DIM, letterSpacing:".14em", marginBottom:3, textTransform:"uppercase" }}>{label}</span>
      {children}
    </div>
  );
}

function LawBox({ badge, name, stmt, eq }: { badge: string; name: string; stmt: string; eq: React.ReactNode }) {
  return (
    <div style={{ margin:"26px 0", padding:"18px 22px", background:`linear-gradient(135deg,rgba(255,208,0,.07),rgba(255,208,0,.02))`,
      border:`1px solid rgba(255,208,0,.28)`, borderRadius:7, position:"relative", overflow:"hidden" }}>
      <div style={{ position:"absolute", left:0, top:0, bottom:0, width:4, background:`linear-gradient(180deg,${GOLD2},${GOLD})` }} />
      <div style={{ fontFamily:disp, fontSize:".5rem", letterSpacing:".22em", color:GOLD, textTransform:"uppercase", marginBottom:7 }}>{badge}</div>
      <div style={{ fontFamily:disp, fontSize:".95rem", fontWeight:700, color:GOLD2, marginBottom:9 }}>{name}</div>
      <div style={{ fontFamily:serif2, fontSize:"1rem", fontStyle:"italic", color:TXT, marginBottom:11, lineHeight:1.6 }}>{stmt}</div>
      <div style={{ fontFamily:mono2, fontSize:".76rem", color:"#e0f4ff", background:"rgba(0,0,0,.3)", padding:"9px 13px", borderRadius:4, lineHeight:1.85 }}>{eq}</div>
    </div>
  );
}

function Callout({ kind, label, children }: { kind: "n"|"w"|"k"; label: string; children: React.ReactNode }) {
  const bord = kind==="n" ? ACC : kind==="w" ? PLAS : GUT;
  const bg   = kind==="n" ? "rgba(0,191,255,.06)" : kind==="w" ? "rgba(255,69,0,.06)" : "rgba(168,224,99,.06)";
  return (
    <div style={{ margin:"20px 0", padding:"14px 18px", borderRadius:5, fontSize:".88rem", lineHeight:1.6, background:bg, borderLeft:`3px solid ${bord}` }}>
      <span style={{ display:"block", fontFamily:mono2, fontSize:".52rem", letterSpacing:".18em", textTransform:"uppercase", color:DIM, marginBottom:5 }}>{label}</span>
      {children}
    </div>
  );
}

function TH({ children }: { children: React.ReactNode }) {
  return <th style={{ padding:"8px 11px", textAlign:"left", color:GOLD, letterSpacing:".09em", textTransform:"uppercase", fontWeight:700 }}>{children}</th>;
}
function TD({ children }: { children: React.ReactNode }) {
  return <td style={{ padding:"7px 11px", borderBottom:`1px solid rgba(255,255,255,.05)`, color:"rgba(216,224,240,.78)", verticalAlign:"top", fontSize:".82rem" }}>{children}</td>;
}

function ChHdr({ num, title, sub }: { num: string; title: string; sub: string }) {
  return (
    <div style={{ paddingTop:44 }}>
      <div style={{ fontFamily:mono2, fontSize:".56rem", letterSpacing:".22em", color:GOLD, textTransform:"uppercase", marginBottom:7 }}>{num}</div>
      <div style={{ fontFamily:disp, fontSize:"clamp(1rem,2.8vw,1.5rem)", fontWeight:700, color:GOLD2, letterSpacing:".06em", lineHeight:1.2, marginBottom:5 }}>{title}</div>
      <div style={{ fontFamily:serif2, fontSize:"1rem", fontStyle:"italic", color:DIM, marginBottom:24 }}>{sub}</div>
      <div style={{ height:1, background:`linear-gradient(90deg,rgba(201,168,76,.4),transparent)`, marginBottom:28 }} />
    </div>
  );
}

function PartHdr({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ padding:"44px 0 14px", borderTop:`2px solid ${BORD}`, marginTop:60,
      fontFamily:disp, fontSize:".6rem", letterSpacing:".32em", color:GOLD, textTransform:"uppercase" }}>
      {children}
    </div>
  );
}

/* ── live cascade visualizer ─────────────────────────────────────────── */
function CascadeVis() {
  const [solar, setSolar] = useState(0.65);
  const [se,    setSe   ] = useState(0.75);
  const [coast, setCoast] = useState(0.50);
  const [gq,    setGq   ] = useState(0.60);
  const [t,     setT    ] = useState(5.5);

  const R = useMemo(() => calcCascade(solar, se, coast, gq, t), [solar, se, coast, gq, t]);

  return (
    <div style={{ margin:"28px 0", padding:18, background:CARD, border:`1px solid ${BORD}`, borderRadius:9 }}>
      <div style={{ fontFamily:disp, fontSize:".56rem", letterSpacing:".2em", color:GOLD, textTransform:"uppercase", marginBottom:14 }}>
        All 11 layers -- adjust sliders to see real-time cascade
      </div>
      {CV_LAYERS.map((L, i) => (
        <div key={L.name}>
          <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:5 }}>
            <div style={{ fontSize:".9rem", width:22, textAlign:"center", flexShrink:0 }}>{L.icon}</div>
            <div style={{ fontFamily:mono2, fontSize:".58rem", color:DIM, width:130, flexShrink:0 }}>{L.name}</div>
            <div style={{ flex:1, height:5, background:"rgba(255,255,255,.07)", borderRadius:3, overflow:"hidden" }}>
              <div style={{ height:"100%", background:L.col, width:`${Math.min(1,Math.max(0,L.frac(R)))*100}%`, borderRadius:3, transition:"width .4s" }} />
            </div>
            <div style={{ fontFamily:mono2, fontSize:".62rem", fontWeight:700, color:L.col, width:80, textAlign:"right", flexShrink:0 }}>{L.val(R)}</div>
          </div>
          {i < CV_LAYERS.length - 1 && (
            <div style={{ textAlign:"center", fontSize:".5rem", color:"rgba(255,208,0,.2)", padding:"1px 0", marginLeft:30 }}>&#8595;</div>
          )}
        </div>
      ))}
      {/* sliders */}
      <div style={{ display:"flex", gap:14, flexWrap:"wrap", marginTop:14, paddingTop:12, borderTop:`1px solid rgba(255,255,255,.06)` }}>
        {[
          { label:"Solar Phase (S)", val:solar, set:setSolar, display:`${Math.round(solar*100)}%`, min:0, max:1, step:0.01 },
          { label:"Selenium η_Se",   val:se,    set:setSe,    display:`${Math.round(se*100)}%`,    min:0, max:1, step:0.01 },
          { label:"Coastal [I]",     val:coast, set:setCoast, display:`${Math.round(coast*100)}%`, min:0, max:1, step:0.01 },
          { label:"Microbiome",      val:gq,    set:setGq,    display:`${Math.round(gq*100)}%`,    min:0, max:1, step:0.01 },
          { label:"Cycle Year (0-11)",val:t,    set:setT,     display:`${t.toFixed(1)} yr`,        min:0, max:11, step:0.1 },
        ].map(s => (
          <div key={s.label} style={{ display:"flex", flexDirection:"column", gap:3, flex:1, minWidth:110 }}>
            <label style={{ fontFamily:mono2, fontSize:".5rem", color:DIM, letterSpacing:".1em", textTransform:"uppercase" }}>{s.label}</label>
            <input type="range" min={s.min} max={s.max} step={s.step} value={s.val}
              onChange={e => s.set(Number(e.target.value))}
              style={{ WebkitAppearance:"none", width:"100%", height:2, background:"rgba(255,255,255,.12)", outline:"none", cursor:"pointer", accentColor:GOLD2 }} />
            <div style={{ fontFamily:disp, fontSize:".58rem", color:GOLD }}>{s.display}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ── main page ───────────────────────────────────────────────────────── */
export default function CoherenceSciencePage() {
  const sectionRefs: Record<string, React.RefObject<HTMLElement>> = {
    cover:   useRef<HTMLElement>(null),
    toc:     useRef<HTMLElement>(null),
    preface: useRef<HTMLElement>(null),
    ch1:     useRef<HTMLElement>(null),
    ch2:     useRef<HTMLElement>(null),
    ch3:     useRef<HTMLElement>(null),
    ch4:     useRef<HTMLElement>(null),
    ch5:     useRef<HTMLElement>(null),
    ch6:     useRef<HTMLElement>(null),
    ch7:     useRef<HTMLElement>(null),
    ch8:     useRef<HTMLElement>(null),
    ch9:     useRef<HTMLElement>(null),
    ch10:    useRef<HTMLElement>(null),
    ch11:    useRef<HTMLElement>(null),
    ch12:    useRef<HTMLElement>(null),
    law1:    useRef<HTMLElement>(null),
    law2:    useRef<HTMLElement>(null),
    law3:    useRef<HTMLElement>(null),
    appA:    useRef<HTMLElement>(null),
    appB:    useRef<HTMLElement>(null),
    refs:    useRef<HTMLElement>(null),
  };
  const goTo = (id: string) => sectionRefs[id]?.current?.scrollIntoView({ behavior:"smooth", block:"start" });

  const tocEntry = (num: string, name: string, pg: string, id: string) => (
    <div key={id} onClick={() => goTo(id)} style={{ display:"flex", alignItems:"baseline", gap:6, padding:"4px 0",
      borderBottom:`1px dotted rgba(255,255,255,.05)`, cursor:"pointer" }}>
      <span style={{ fontFamily:mono2, fontSize:".6rem", color:GOLD, minWidth:30, flexShrink:0 }}>{num}</span>
      <span style={{ fontFamily:serif2, fontSize:".92rem", flex:1 }}>{name}</span>
      <span style={{ flex:1, borderBottom:`1px dotted rgba(255,255,255,.08)`, margin:"0 6px", position:"relative", top:-4 }} />
      <span style={{ fontFamily:mono2, fontSize:".56rem", color:DIM }}>{pg}</span>
    </div>
  );
  const partLabel = (txt: string) => (
    <div style={{ fontFamily:mono2, fontSize:".54rem", letterSpacing:".26em", color:DIM, margin:"18px 0 6px", textTransform:"uppercase" }}>{txt}</div>
  );

  return (
    <div style={{ background:BG, color:TXT, fontFamily:serif2, lineHeight:1.75, overflowX:"hidden", fontSize:16 }}>
      <div style={{ position:"relative", maxWidth:860, margin:"0 auto", padding:"0 24px 100px" }}>

        {/* ── COVER ── */}
        <section ref={sectionRefs.cover as React.RefObject<HTMLDivElement>}
          style={{ minHeight:"100vh", display:"flex", flexDirection:"column", alignItems:"center",
            justifyContent:"center", textAlign:"center", padding:"60px 0", borderBottom:`1px solid ${BORD}` }}>
          <div style={{ width:80, height:80, borderRadius:"50%", margin:"0 auto 28px",
            background:"radial-gradient(circle at 38% 38%,#fffde0,#FFD000 38%,#FF8C00 68%,#FF4500)",
            boxShadow:"0 0 60px rgba(255,208,0,.6)", animation:"sunPulse 3.5s ease-in-out infinite" }} />
          <style>{`@keyframes sunPulse{0%,100%{box-shadow:0 0 60px rgba(255,208,0,.5)}50%{box-shadow:0 0 100px rgba(255,208,0,.9),0 0 160px rgba(255,140,0,.4)}}`}</style>
          <div style={{ fontFamily:mono2, fontSize:".6rem", letterSpacing:".32em", color:GOLD, textTransform:"uppercase", marginBottom:14 }}>AETHER Science Series &middot; Volume I</div>
          <div style={{ fontFamily:disp, fontSize:"clamp(1.8rem,5vw,3.2rem)", fontWeight:900, letterSpacing:".08em", color:GOLD2, lineHeight:1.1, marginBottom:10, textShadow:"0 0 40px rgba(255,208,0,.3)" }}>COHERENCE SCIENCE</div>
          <div style={{ fontFamily:serif2, fontSize:"clamp(.95rem,2.2vw,1.25rem)", fontStyle:"italic", color:"rgba(216,224,240,.65)", marginBottom:28, maxWidth:580 }}>
            A Unified Framework from Solar Luminosity to Epigenetic Aging -- with the Three Laws of CUCA Architecture
          </div>
          <div style={{ fontFamily:mono2, fontSize:".68rem", color:GOLD, letterSpacing:".18em" }}>SHIA MILLER</div>
          <div style={{ fontFamily:mono2, fontSize:".56rem", color:DIM, letterSpacing:".12em", marginTop:5 }}>AetherLife.co &middot; Cosmic Chaos Corporation&trade;</div>
          <div style={{ fontFamily:mono2, fontSize:".54rem", color:DIM, marginTop:20, letterSpacing:".14em" }}>FIRST EDITION &middot; JUNE 2026 &middot; HOLLIDAYSBURG, PENNSYLVANIA</div>
          <div style={{ marginTop:36, padding:"16px 24px", background:"rgba(255,208,0,.04)", border:"1px solid rgba(255,208,0,.14)", borderRadius:8, fontFamily:mono2, fontSize:".72rem", color:"rgba(255,208,0,.65)", lineHeight:2, maxWidth:620 }}>
            <span style={{ fontSize:".88rem", color:GOLD2, fontWeight:700 }}>
              &#936;<sub>life</sub> = &int; L<sub>&#9737;</sub> &middot; &kappa;<sub>geo</sub> &middot; [I]<sub>ocean</sub> &middot; &eta;<sub>T3</sub> &middot; &Phi;<sub>ATP</sub> dt
            </span>
            <br /><br />
            L1: F10.7 &#8594; L2: B<sub>sw</sub> &#8594; L3: Kp &#8594; L4: Upwelling &#8594; L5: [I] &#8594; L6: T3:rT3<br />
            &#8594; L7: ATP/&#916;&#936;<sub>m</sub> &#8594; L8: &#915;<sub>neural</sub> &#8594; L9: &#937;<sub>gut</sub> &#8594; L10: &#961;<sub>circ</sub> &#8594; L11: &#931;<sub>epi</sub> &#8594; &#916;R<br /><br />
            <strong>&#916;R = (1 &minus; &#915;&middot;&#937;&middot;&#961;&middot;&#931;)^1.8 &middot; 100%</strong>
          </div>
        </section>

        {/* ── TOC ── */}
        <section ref={sectionRefs.toc as React.RefObject<HTMLDivElement>} style={{ padding:"52px 0", borderBottom:`1px solid ${BORD}` }}>
          <div style={{ fontFamily:disp, fontSize:".85rem", letterSpacing:".22em", color:GOLD, marginBottom:24, textTransform:"uppercase" }}>Contents</div>
          {partLabel("Preface")}
          {tocEntry("--", "Author's Note & Framework Overview", "i", "preface")}
          {partLabel("Part I -- The Physical Cascade")}
          {tocEntry("Ch 1","Solar Luminosity & the F10.7 Index","1","ch1")}
          {tocEntry("Ch 2","Solar Wind, IMF & the Parker Spiral","2","ch2")}
          {tocEntry("Ch 3","Geomagnetic Forcing -- The Kp Index","3","ch3")}
          {tocEntry("Ch 4","Ocean Upwelling & the Iodine Bridge","4","ch4")}
          {partLabel("Part II -- The Endocrine Bottleneck")}
          {tocEntry("Ch 5","Marine Iodine & Urinary Iodine Excretion","5","ch5")}
          {tocEntry("Ch 6","Thyroid T3:rT3 -- The Coherence Biomarker","6","ch6")}
          {partLabel("Part III -- Cellular Energetics")}
          {tocEntry("Ch 7","Mitochondrial ATP & the Voltage Drop","7","ch7")}
          {tocEntry("Ch 8","Neural Coherence Γ -- Signal Fidelity","8","ch8")}
          {partLabel("Part IV -- Extended Biology")}
          {tocEntry("Ch 9","Gut Microbiome Ω -- The Butyrate Loop","9","ch9")}
          {tocEntry("Ch 10","Circadian Rhythm ρ -- The BMAL1 Gate","10","ch10")}
          {tocEntry("Ch 11","Epigenome Σ -- The Memory Layer","11","ch11")}
          {tocEntry("Ch 12","Integrated Disease Risk ΔR","12","ch12")}
          {partLabel("Part V -- The CUCA Formal Laws")}
          {tocEntry("Law I","The Universal Spacing Law -- C(x,t)=f(d)","13","law1")}
          {tocEntry("Law II","The Reptilian Constraint -- τ·B = κ_R","14","law2")}
          {tocEntry("Law III","The Cephalopod Edge Constraint -- ||E(t)||↑ → C↓","15","law3")}
          {partLabel("Appendices & References")}
          {tocEntry("App A","Complete Equation Table","A1","appA")}
          {tocEntry("App B","CUCA Law Summary","A2","appB")}
          {tocEntry("Ref","References","R1","refs")}
        </section>

        {/* ── PREFACE ── */}
        <section ref={sectionRefs.preface as React.RefObject<HTMLDivElement>}>
          <ChHdr num="Preface" title="Author's Note" sub="On building bridges between disciplines that refuse to talk to each other" />
          <p style={{ marginBottom:".9rem", fontSize:".97rem" }}>This textbook began as a computational simulation and became something larger. The AETHER Solar Physics Engine forced a question no single academic department could answer: <em>why does the same thyroid hormone that responds to solar-cycle iodine availability also directly transcribe the gene that determines whether your circadian clock runs at full amplitude?</em></p>
          <p style={{ marginBottom:".9rem", fontSize:".97rem" }}>The answer is that T3 is not merely an endocrine hormone. It is the biological transducer at the boundary between planetary-scale geophysics and molecular-scale gene regulation -- converting the 11-year electromagnetic heartbeat of a star into the epigenetic state of a human cell.</p>
          <Callout kind="n" label="How to use this book">Each chapter contains a live interactive cascade visualizer. Adjust the five sliders -- solar activity, selenium, coastal iodine, microbiome quality, cycle year -- and watch all 11 layers recompute in real time. The equations are not decorative; they run live in your browser.</Callout>
          <p style={{ textAlign:"right", fontStyle:"italic", color:DIM, marginTop:22, fontSize:".97rem" }}>-- Shia Miller, Hollidaysburg PA, June 2026</p>
        </section>

        {/* ── PART I ── */}
        <PartHdr>Part I -- The Physical Cascade</PartHdr>

        <section ref={sectionRefs.ch1 as React.RefObject<HTMLDivElement>}>
          <ChHdr num="Chapter 1" title="Solar Luminosity & the F10.7 Index" sub="The 11-year electromagnetic heartbeat that begins the cascade" />
          <p style={{ fontSize:".97rem", marginBottom:".9rem" }}>The Sun is not a stable star. Over the 11-year Schwabe cycle, solar electromagnetic output varies measurably across nearly every wavelength band. All biological consequences traced in this textbook begin at a single measurable proxy: the <strong style={{ color:GOLD2 }}>F10.7 solar flux index</strong>.</p>
          <p style={{ fontSize:".97rem", marginBottom:".9rem" }}>F10.7 is measured at 10.7 cm (2.8 GHz) radio wavelength and has been continuously recorded since 1947 -- the longest continuous index of solar activity. It correlates with solar UV and EUV output at r = 0.97, making it the most reliable solar activity proxy available for cascade modeling.</p>
          <Eq label="Layer 1 -- Solar Luminosity">
            <strong>F10.7(t) = 65 + 155 &middot; S &middot; &frac12;(1 &minus; cos(2&pi;t / 11))</strong><br />
            S &isin; [0,1] = solar activity parameter &nbsp;&nbsp; t = time in years<br />
            Range: 65 sfu (solar minimum) &#8594; 220+ sfu (solar maximum)
          </Eq>
          <div style={{ fontFamily:disp, fontSize:".88rem", fontWeight:700, letterSpacing:".14em", color:GOLD, textTransform:"uppercase", margin:"32px 0 12px" }}>Live Cascade Visualizer</div>
          <CascadeVis />
          <div style={{ margin:"32px 0 0", padding:"16px 20px", background:"rgba(255,208,0,.04)", border:"1px solid rgba(255,208,0,.13)", borderRadius:7 }}>
            <div style={{ fontFamily:disp, fontSize:".55rem", letterSpacing:".2em", color:GOLD, textTransform:"uppercase", marginBottom:9 }}>Chapter 1 -- Key Points</div>
            <ul style={{ paddingLeft:"1.1em" }}>
              <li style={{ marginBottom:5, fontSize:".86rem" }}>F10.7 is the primary solar proxy; continuously measured since 1947</li>
              <li style={{ marginBottom:5, fontSize:".86rem" }}>The 11-year Schwabe cycle produces ~3.4x F10.7 variation (65-220+ sfu)</li>
              <li style={{ marginBottom:5, fontSize:".86rem" }}>All downstream cascade forcing originates from this single stellar variable</li>
            </ul>
          </div>
        </section>

        <section ref={sectionRefs.ch2 as React.RefObject<HTMLDivElement>}>
          <ChHdr num="Chapter 2" title="Solar Wind, IMF & the Parker Spiral" sub="How stellar plasma couples to Earth's magnetic shield" />
          <p style={{ fontSize:".97rem", marginBottom:".9rem" }}>The solar wind is a continuous stream of charged particles -- primarily protons and electrons -- emitted from the solar corona at 400-800 km/s. Embedded in this plasma is the <strong style={{ color:GOLD2 }}>interplanetary magnetic field (IMF)</strong>, carried outward along the Parker spiral geometry defined by solar rotation and radial plasma flow.</p>
          <Eq label="Layer 2 -- Solar Wind IMF">
            <strong>B_sw = 4.0 + 3.5 &middot; &radic;(F10.7 / 200) &nbsp; [nT]</strong><br />
            Parker spiral scaling: B &prop; &radic;(solar activity)<br />
            Typical range: 4.0 nT (solar min) &#8594; 7.5 nT (solar max)
          </Eq>
          <p style={{ fontSize:".97rem", marginBottom:".9rem" }}>The sub-linear dependence reflects Parker spiral geometry. During coronal mass ejections (CMEs), B_sw can spike to 20-50 nT for 12-48 hours. The southward component B_z &lt; 0 is critical: negative B_z enables magnetic reconnection at the dayside magnetopause, allowing solar wind energy to enter the magnetosphere.</p>
        </section>

        <section ref={sectionRefs.ch3 as React.RefObject<HTMLDivElement>}>
          <ChHdr num="Chapter 3" title="Geomagnetic Forcing -- The Kp Index" sub="From magnetospheric compression to stratospheric perturbation" />
          <p style={{ fontSize:".97rem", marginBottom:".9rem" }}>The <strong style={{ color:GOLD2 }}>Kp index</strong> (0-9 scale, 3-hour resolution) quantifies global geomagnetic activity averaged across 13 magnetometer stations worldwide. It is the standard intermediate variable linking solar wind to atmospheric and oceanic effects.</p>
          <Eq label="Layer 3 -- Geomagnetic Kp">
            <strong>Kp = 1.2 + 2.8 &middot; (F10.7 / 220)^0.7</strong><br />
            Storm classification: Kp &#8805; 5 (G1) &middot; &#8805;6 (G2) &middot; &#8805;7 (G3) &middot; &#8805;8 (G4) &middot; =9 (G5 extreme)
          </Eq>
          <div style={{ fontFamily:disp, fontSize:".88rem", fontWeight:700, letterSpacing:".14em", color:GOLD, textTransform:"uppercase", margin:"32px 0 12px" }}>The Stratospheric Bridge</div>
          <p style={{ fontSize:".97rem", marginBottom:".9rem" }}>The proposed chain linking Kp to ocean circulation: geomagnetic storm &#8594; auroral Joule heating &#8594; stratospheric temperature perturbation &#8594; polar vortex destabilization &#8594; stratosphere-troposphere coupling (Baldwin & Dunkerton 2001) &#8594; trade wind modification &#8594; coastal upwelling change.</p>
          <Callout kind="w" label="Speculative Link">The stratospheric &#8594; ocean upwelling coupling is physically plausible and multi-year correlations exist in proxy data, but no direct controlled study of the Kp &#8594; upwelling chain has been conducted. This is the highest-priority validation target in the cascade.</Callout>
        </section>

        <section ref={sectionRefs.ch4 as React.RefObject<HTMLDivElement>}>
          <ChHdr num="Chapter 4" title="Ocean Upwelling & the Iodine Bridge" sub="Where geophysics hands off to biochemistry" />
          <p style={{ fontSize:".97rem", marginBottom:".9rem" }}>The five major eastern boundary upwelling systems -- California Current, Humboldt Current, Benguela Current, Canary Current, and Somali Current -- are wind-driven. Ekman transport draws cold, deep, iodine-rich water to the surface. When that deep water reaches the photic zone, marine algae bloom and bioconcentrate iodine up to 30,000x.</p>
          <Eq label="Layer 4 -- Ocean Upwelling">
            <strong>w_base = (0.4 + 0.3 &middot; Kp/4)</strong><br />
            <strong>w_total = w_base &middot; (0.3 + 0.7 &middot; coast_exposure)</strong>
          </Eq>
          <Callout kind="k" label="Geographic Prediction">Landlocked, high-altitude populations (Himalayas, Andes, Alps) should show the strongest solar-cycle-phase correlations with iodine status and downstream metabolic outcomes -- a testable epidemiological prediction.</Callout>
        </section>

        <PartHdr>Part II -- The Endocrine Bottleneck</PartHdr>

        <section ref={sectionRefs.ch5 as React.RefObject<HTMLDivElement>}>
          <ChHdr num="Chapter 5" title="Marine Iodine & Urinary Iodine Excretion" sub="The heaviest element essential for life" />
          <p style={{ fontSize:".97rem", marginBottom:".9rem" }}>Iodine (Z = 53) is the heaviest chemical element known to be essential for human life. Its biological role is singular: providing the halogen atoms that T3 and T4 require for receptor binding. The WHO estimates approximately 2 billion people have inadequate iodine intake.</p>
          <Eq label="Layer 5 -- Marine Iodine UIE">
            <strong>[I] = (50 + 110&middot;w&middot;(1+0.8&middot;coast)) &middot; (0.5 + 0.5&middot;min(F10.7,220)/220)</strong><br />
            Units: mcg/L urinary iodine excretion<br />
            WHO: &lt;100 deficient &middot; 100-299 optimal &middot; &#8805;300 excess<br />
            NIS kinetics: J = V_max&middot;[I]/(Km+[I]), Km &#8776; 80 mcg/L
          </Eq>
        </section>

        <section ref={sectionRefs.ch6 as React.RefObject<HTMLDivElement>}>
          <ChHdr num="Chapter 6" title="Thyroid T3:rT3 -- The Coherence Biomarker" sub="Where stellar physics ends and molecular biology begins" />
          <p style={{ fontSize:".97rem", marginBottom:".9rem" }}>The thyroid gland is the cascade's critical transducer. It converts an oceanographic signal (iodine concentration) into a molecular signal (T3 receptor occupancy) that every cell uses to set its metabolic rate, mitochondrial density, and clock gene expression.</p>
          <Eq label="Layer 6a -- T3 Synthesis">
            <strong>T3 = ([I]/(Km+[I])) &middot; &eta;_Se &middot; (0.85 + 0.15&middot;&eta;_Se)</strong><br />
            DIO1/DIO2 deiodination: T4 &#8594; T3 (selenium-dependent, Km = 80 mcg/L)
          </Eq>
          <Eq label="Layer 6b -- Reverse T3 Shunt">
            <strong>rT3 = ([I]/(Km+[I])) &middot; (1&minus;&eta;_Se) &middot; 0.6 + 0.1</strong><br />
            <strong>T3:rT3 ratio = T3 / rT3 &nbsp; (optimal: &gt;20)</strong>
          </Eq>
          <LawBox badge="AETHER Prediction" name="The Selenium Buffer Hypothesis"
            stmt='"Populations with adequate selenium should show weaker solar-cycle correlations with metabolic disease than selenium-deficient populations, because selenium clamps T3:rT3 above the critical threshold regardless of iodine fluctuation."'
            eq={<>If &eta;_Se = 1.0 &#8594; rT3 &#8776; 0.1 (minimum baseline)<br />T3:rT3 ratio remains high even when [I] is low<br />&#8594; cascade protected from solar-minimum iodine deficit</>} />
        </section>

        <PartHdr>Part III -- Cellular Energetics</PartHdr>

        <section ref={sectionRefs.ch7 as React.RefObject<HTMLDivElement>}>
          <ChHdr num="Chapter 7" title="Mitochondrial ATP & the Voltage Drop" sub="T3 as the master regulator of cellular power supply" />
          <p style={{ fontSize:".97rem", marginBottom:".9rem" }}>T3 upregulates PGC-1&#945; -- the master transcriptional regulator of mitochondrial biogenesis. More T3 &#8594; more mitochondria per cell &#8594; more ATP per unit time. This is a direct transcriptional mechanism confirmed by TRE binding at the PGC-1&#945; promoter.</p>
          <Eq label="Layer 7 -- Mitochondrial ATP">
            <strong>PGC-1&#945; = 0.4 + 0.6 &middot; T3_norm</strong><br />
            <strong>&#916;&#936;_m = 150 + 30 &middot; T3_norm &nbsp; [mV]</strong><br />
            <strong>ATP_rel = PGC &middot; (&#916;&#936;_m / 180) &middot; (0.7 + 0.3 &middot; &eta;_Se)</strong>
          </Eq>
          <p style={{ fontSize:".97rem", marginBottom:".9rem" }}>T3 deficiency is a measurable voltage drop across the mitochondrial inner membrane. Cells operating at chronically reduced &#916;&#936;_m downregulate all ATP-consuming processes -- firing rates, protein synthesis, immune function -- entering a low-throughput metabolic state indistinguishable from subclinical hypothyroidism.</p>
        </section>

        <section ref={sectionRefs.ch8 as React.RefObject<HTMLDivElement>}>
          <ChHdr num="Chapter 8" title="Neural Coherence Γ -- Signal Fidelity" sub="The nervous system as an ATP-constrained computation engine" />
          <Eq label="Layer 8 -- Neural Coherence">
            <strong>&#915; = (ATP_rel)^1.4 &middot; exp(&minus;0.3 &middot; &tau;_refract)</strong><br />
            <strong>&tau;_refract = 1 &minus; ATP_rel &middot; 0.6</strong>
          </Eq>
          <p style={{ fontSize:".97rem", marginBottom:".9rem" }}>Neurons consume ~70% of their ATP maintaining the resting membrane potential via Na+/K+-ATPase. When ATP falls, the refractory period lengthens, maximum firing frequency drops, and the nervous system downclocks. &#915; = 1.0 is theoretical maximum; &#915; &lt; 0.5 corresponds to clinical cognitive impairment consistent with moderate hypothyroidism.</p>
        </section>

        <PartHdr>Part IV -- Extended Biology</PartHdr>

        <section ref={sectionRefs.ch9 as React.RefObject<HTMLDivElement>}>
          <ChHdr num="Chapter 9" title="Gut Microbiome Ω -- The Butyrate Loop" sub="T3 shapes the microbiome; the microbiome shapes the brain" />
          <p style={{ fontSize:".97rem", marginBottom:".9rem" }}>The gut microbiome is not a passive bystander. It is an active coherence-maintaining system with four independent T3 input channels and a direct epigenetic output through the butyrate-HDAC axis.</p>
          <Eq label="Layer 9 -- Gut Microbiome">
            <strong>butyrate = 0.3 + 0.7 &middot; gq &middot; (0.5 + 0.5 &middot; T3)</strong><br />
            <strong>&#937; = min(1, T3^0.8 &middot; butyrate &middot; (gq &middot; 0.6 + 0.4))</strong>
          </Eq>
          <div style={{ fontFamily:disp, fontSize:".88rem", fontWeight:700, letterSpacing:".14em", color:GOLD, textTransform:"uppercase", margin:"32px 0 12px" }}>Four T3 &#8594; Gut Mechanisms</div>
          <div style={{ overflowX:"auto", margin:"18px 0" }}>
            <table style={{ width:"100%", borderCollapse:"collapse", fontFamily:mono2, fontSize:".68rem" }}>
              <thead><tr style={{ background:"rgba(255,208,0,.07)", borderBottom:`1px solid ${BORD}` }}>
                <TH>#</TH><TH>Mechanism</TH><TH>Target</TH><TH>Effect of T3 down</TH>
              </tr></thead>
              <tbody>
                <tr><TD>1</TD><TD>Tight junction regulation</TD><TD>ZO-1, occludin, claudin-1</TD><TD>Increased intestinal permeability</TD></tr>
                <tr><TD>2</TD><TD>Bile acid composition</TD><TD>CYP7A1 upregulation</TD><TD>Dysbiotic bile acid pool</TD></tr>
                <tr><TD>3</TD><TD>Intestinal transit time</TD><TD>Smooth muscle motility</TD><TD>40-60% slowing; altered SCFA profiles</TD></tr>
                <tr><TD>4</TD><TD>Mucosal immune tone</TD><TD>IgA, Treg balance</TD><TD>Increased inflammatory infiltrate</TD></tr>
              </tbody>
            </table>
          </div>
          <Callout kind="k" label="Clinical Implication">High-fiber diet, resistant starch, and direct butyrate supplementation can partially bypass T3 deficiency to maintain neural coherence and epigenetic stability -- a non-thyroidal intervention point in the cascade.</Callout>
        </section>

        <section ref={sectionRefs.ch10 as React.RefObject<HTMLDivElement>}>
          <ChHdr num="Chapter 10" title="Circadian Rhythm ρ -- The BMAL1 Gate" sub="Why T3 deficiency disrupts your molecular clock, not just your sleep" />
          <p style={{ fontSize:".97rem", marginBottom:".9rem" }}>The BMAL1 promoter contains confirmed thyroid response elements (TREs) at positions -1,200 and -800 bp relative to the transcription start site. T3-bound TRb directly activates BMAL1 transcription, driving the entire CLOCK/BMAL1 &#8594; PER/CRY feedback oscillator at 24-hour periodicity.</p>
          <Eq label="Layer 10 -- Circadian Rhythm">
            <strong>BMAL1 = 0.4 + 0.4 &middot; T3 + 0.2 &middot; &#937;</strong><br />
            <strong>&#961; = min(1, BMAL1 &middot; (0.7 + 0.3 &middot; &#915;))</strong>
          </Eq>
          <p style={{ fontSize:".97rem", marginBottom:".9rem" }}>Approximately 30-80% of all expressed genes are clock-controlled genes (CCGs), depending on tissue type. When BMAL1 amplitude falls, CCG expression becomes erratic across all tissues simultaneously -- including DNMT3A/3B (methyltransferases), inflammatory cytokines, metabolic enzymes, and immune differentiation factors.</p>
        </section>

        <section ref={sectionRefs.ch11 as React.RefObject<HTMLDivElement>}>
          <ChHdr num="Chapter 11" title="Epigenome Σ -- The Memory Layer" sub="How the cascade's failures are written permanently into the genome" />
          <p style={{ fontSize:".97rem", marginBottom:".9rem" }}>The epigenome is the cascade's temporal integrator. While &#915;, &#937;, and &#961; can recover within hours to weeks when T3 is restored, &#931; accumulates drift over years -- encoding the history of upstream coherence failures into the methylation landscape of the genome.</p>
          <Eq label="Layer 11 -- Epigenome Σ">
            <strong>drift = (1&minus;&#961;)&middot;0.5 + (1&minus;&#937;)&middot;0.3 + (1&minus;&#915;)&middot;0.2</strong><br />
            <strong>&#931; = max(0, 1 &minus; drift &middot; 0.85)</strong>
          </Eq>
          <div style={{ fontFamily:disp, fontSize:".88rem", fontWeight:700, letterSpacing:".14em", color:GOLD, textTransform:"uppercase", margin:"32px 0 12px" }}>Three CpG Drift Mechanisms</div>
          <div style={{ overflowX:"auto", margin:"18px 0" }}>
            <table style={{ width:"100%", borderCollapse:"collapse", fontFamily:mono2, fontSize:".68rem" }}>
              <thead><tr style={{ background:"rgba(255,208,0,.07)", borderBottom:`1px solid ${BORD}` }}>
                <TH>Source</TH><TH>Weight</TH><TH>Molecular mechanism</TH><TH>Genomic target</TH>
              </tr></thead>
              <tbody>
                <tr><TD>Circadian (1-ρ)</TD><TD>0.5</TD><TD>Clock-controlled DNMT3A/3B lose rhythmic expression &#8594; stochastic CpG methylation</TD><TD>Clock-controlled gene promoters</TD></tr>
                <tr><TD>Gut (1-Ω)</TD><TD>0.3</TD><TD>Butyrate loss &#8594; HDAC disinhibition &#8594; repeat element demethylation</TD><TD>LINE-1, Alu SINEs</TD></tr>
                <tr><TD>Neural ATP (1-Γ)</TD><TD>0.2</TD><TD>ATP deficit &#8594; DNMT1 processivity loss &#8594; hemi-methylation errors</TD><TD>CpG-dense gene bodies</TD></tr>
              </tbody>
            </table>
          </div>
        </section>

        <section ref={sectionRefs.ch12 as React.RefObject<HTMLDivElement>}>
          <ChHdr num="Chapter 12" title="Integrated Disease Risk ΔR" sub="The multiplicative collapse and why diseases co-occur" />
          <Eq label="Master Equation -- Integrated Disease Risk">
            <strong>C_total = &#915; &middot; &#937; &middot; &#961; &middot; &#931;</strong><br />
            <strong>&#916;R = (1 &minus; C_total)^1.8 &middot; 100%</strong>
          </Eq>
          <p style={{ fontSize:".97rem", marginBottom:".9rem" }}>The multiplicative structure follows directly from the Universal Spacing Law (Law I): in a series of coupled feedback loops, the coherence of the chain is bounded above by the product of individual loop coherences. No single loop can compensate for another's failure.</p>
          <p style={{ fontSize:".97rem", marginBottom:".9rem" }}>This explains why obesity, Alzheimer's disease, type 2 diabetes, gut dysbiosis, insomnia, and accelerated aging almost always co-occur: they share the same upstream cascade failure. They are convergent expressions of a single coherence deficit propagating through four parallel biological axes.</p>
          <Callout kind="k" label="The Stress Test Result">Setting &eta;_Se = 0 (zero selenium) at solar maximum (S = 0.85) produces: T3 &#8776; 0, &#915; &#8776; 0.02, &#937; &#8776; 0.04, &#961; &#8776; 0.31, &#931; &#8776; 0.76, &#916;R &gt; 90%. This is the Keshan disease scenario -- a real historical epidemic in selenium-deficient China producing massive cardiomyopathy and thyroid dysfunction.</Callout>
        </section>

        <PartHdr>Part V -- The CUCA Formal Laws</PartHdr>

        <section ref={sectionRefs.law1 as React.RefObject<HTMLDivElement>}>
          <ChHdr num="Law I" title="The Universal Spacing Law" sub="C(x,t) = f(d) -- Coherence decays with distance at every scale" />
          <LawBox badge="CUCA Formal Law -- First" name="The Universal Spacing Law"
            stmt='"The coherence C(x,t) of any coupled biological system is a function of the physical distance d between coupled elements. Coherence cannot exceed the limit imposed by the propagation delay between coupled oscillators."'
            eq={<>C(x,t) = f(d) = C_max &middot; exp(&minus;d / &lambda;_coherence)<br /><br />Loop gain: G(j&omega;) = K &middot; exp(&minus;j&omega;&tau;), &tau; = d/v<br />Coherence bound: |G(j&omega;_0)| = K &middot; cos(&omega;_0 &middot; d/v)<br />Failure threshold: &omega;_0 &middot; d/v &gt; &pi;/2 &#8594; coherence collapses</>} />
          <div style={{ fontFamily:disp, fontSize:".88rem", fontWeight:700, letterSpacing:".14em", color:GOLD, textTransform:"uppercase", margin:"32px 0 12px" }}>Scale-Invariant Table</div>
          <div style={{ overflowX:"auto", margin:"18px 0" }}>
            <table style={{ width:"100%", borderCollapse:"collapse", fontFamily:mono2, fontSize:".68rem" }}>
              <thead><tr style={{ background:"rgba(255,208,0,.07)", borderBottom:`1px solid ${BORD}` }}>
                <TH>Scale</TH><TH>Coupled System</TH><TH>Distance d</TH><TH>Signal Speed v</TH><TH>Mechanism</TH>
              </tr></thead>
              <tbody>
                <tr><TD>Molecular</TD><TD>T3 receptor &harr; BMAL1 TRE</TD><TD>1-10 nm</TD><TD>~&micro;m/s (diffusion)</TD><TD>Protein diffusion in nucleoplasm</TD></tr>
                <tr><TD>Organelle</TD><TD>Mitochondria &harr; nucleus</TD><TD>1-10 &micro;m</TD><TD>~&micro;m/s (ATP)</TD><TD>ATP gradient, retrograde signaling</TD></tr>
                <tr><TD>Tissue</TD><TD>Gut epithelium &harr; enteric NS</TD><TD>0.1-1 mm</TD><TD>~mm/s</TD><TD>Paracrine signaling</TD></tr>
                <tr><TD>Organ</TD><TD>Gut &harr; brain (vagus)</TD><TD>50-80 cm</TD><TD>~10 m/s</TD><TD>Vagal afferent conduction</TD></tr>
                <tr><TD>Organismal</TD><TD>Liver clock &harr; SCN</TD><TD>10-20 cm</TD><TD>~0.001 m/s</TD><TD>Melatonin, cortisol circulation</TD></tr>
                <tr><TD>Planetary</TD><TD>Sun &harr; ocean iodine</TD><TD>1.5&#215;10<sup>11</sup> m</TD><TD>3&#215;10<sup>8</sup> m/s</TD><TD>Solar EUV, photolysis (light-speed)</TD></tr>
              </tbody>
            </table>
          </div>
          <Callout kind="n" label="Prediction">The gut-brain axis (~80 cm vagal length, ~10 m/s) has a round-trip delay of ~160 ms, limiting maximum coherent frequency to ~1.6 Hz. This predicts gut signals can modulate slow-wave neural activity but not high-frequency gamma oscillations -- consistent with known vagal physiology.</Callout>
        </section>

        <section ref={sectionRefs.law2 as React.RefObject<HTMLDivElement>}>
          <ChHdr num="Law II" title="The Reptilian Constraint" sub="τ·B = κ_R -- Every biological control loop obeys a time-bandwidth product" />
          <LawBox badge="CUCA Formal Law -- Second" name="The Reptilian Constraint"
            stmt='"In any biological control system, the product of control timescale τ and control bandwidth B is conserved. A system cannot simultaneously achieve fast response and high bandwidth without increasing loop gain -- which increases instability risk."'
            eq={<>&tau;_control &middot; B_control = &kappa;_R &nbsp; (Reptilian Constant)<br /><br />Derived from: time-bandwidth product in signal processing<br />T3 deficiency: &tau;&#8593;, B&#8595; &#8594; system shifts toward reptilian operating point<br />Endothermy: T3 elevates &kappa;_R ~10x over ectotherm baseline</>} />
          <div style={{ overflowX:"auto", margin:"18px 0" }}>
            <table style={{ width:"100%", borderCollapse:"collapse", fontFamily:mono2, fontSize:".68rem" }}>
              <thead><tr style={{ background:"rgba(255,208,0,.07)", borderBottom:`1px solid ${BORD}` }}>
                <TH>System</TH><TH>&tau;_control</TH><TH>B_control</TH><TH>&kappa;_R (est.)</TH><TH>Notes</TH>
              </tr></thead>
              <tbody>
                <tr><TD>T3:rT3 axis</TD><TD>~2-7 days</TD><TD>~0.01 Hz</TD><TD>~864-6,048</TD><TD>Slow hormonal feedback</TD></tr>
                <tr><TD>Neural firing</TD><TD>~1-5 ms</TD><TD>~200-1,000 Hz</TD><TD>~0.2-5</TD><TD>Fast electrical loop</TD></tr>
                <tr><TD>Circadian clock</TD><TD>~24 hours</TD><TD>~10<sup>-5</sup> Hz</TD><TD>~864</TD><TD>Ultra-slow master oscillator</TD></tr>
                <tr><TD>Epigenetic</TD><TD>~1-10 years</TD><TD>~10<sup>-8</sup> Hz</TD><TD>~3&#215;10<sup>7</sup></TD><TD>Decade-scale memory</TD></tr>
                <tr><TD>Solar cycle</TD><TD>~11 years</TD><TD>~3&#215;10<sup>-9</sup> Hz</TD><TD>~10<sup>9</sup></TD><TD>Planetary-scale driver</TD></tr>
                <tr><TD>Reptile (cold)</TD><TD>~days</TD><TD>~0.001 Hz</TD><TD>~86</TD><TD>Reference low-energy baseline</TD></tr>
                <tr><TD>Human (T3 optimal)</TD><TD>~minutes</TD><TD>~0.1 Hz</TD><TD>~864</TD><TD>T3 elevates κ_R 10x</TD></tr>
              </tbody>
            </table>
          </div>
        </section>

        <section ref={sectionRefs.law3 as React.RefObject<HTMLDivElement>}>
          <ChHdr num="Law III" title="The Cephalopod Edge Constraint" sub="||E(t)||↑ → C(x,t)↓ -- Analog systems fail under simultaneous binary stress" />
          <LawBox badge="CUCA Formal Law -- Third" name="The Cephalopod Edge Constraint"
            stmt='"Any coupled analog system fails to maintain coherence when required to simultaneously represent high-frequency binary structure across all coupling axes. When the edge-complexity vector ||E(t)|| exceeds the critical threshold on all axes simultaneously, coherence collapses."'
            eq={<>If ||E(t)|| &gt; E_critical &nbsp; for all coupling axes simultaneously,<br />then &nbsp; dC/dt &lt; 0 &nbsp; (coherence collapse)<br /><br />Formally: ||E(t)||&#8593; &#8594; coupling conflict &#8594; C(x,t)&#8595; &#8594; emergent instability</>} />
          <Callout kind="w" label="Failure Mode 1: Binarization">If any cascade variable is forced to behave as a binary switch (e.g., complete thyroid ablation &#8594; T3 = 0 instantaneously), the step discontinuity propagates through all downstream layers simultaneously as a coherence shock wave. Consistent with rapid multi-system failure seen in untreated myxedema crisis.</Callout>
          <Callout kind="w" label="Failure Mode 2: Compound Multi-Axis Stress">If solar activity, selenium depletion, zero coastal access, and degraded microbiome all reach extreme values simultaneously, ||E(t)|| exceeds the critical threshold on all axes. The cascade fails nonlinearly, consistent with the gamma = 1.8 exponent and the clinical "second hit" threshold behavior.</Callout>
          <div style={{ margin:"32px 0 0", padding:"16px 20px", background:"rgba(255,208,0,.04)", border:"1px solid rgba(255,208,0,.13)", borderRadius:7 }}>
            <div style={{ fontFamily:disp, fontSize:".55rem", letterSpacing:".2em", color:GOLD, textTransform:"uppercase", marginBottom:9 }}>The Three CUCA Laws -- Summary</div>
            <ul style={{ paddingLeft:"1.1em" }}>
              <li style={{ marginBottom:5, fontSize:".86rem" }}><strong>Law I (Universal Spacing):</strong> C(x,t) = f(d). Coherence decays exponentially with distance. Applies from nm to AU.</li>
              <li style={{ marginBottom:5, fontSize:".86rem" }}><strong>Law II (Reptilian Constraint):</strong> τ·B = κ_R. Every biological control loop obeys a time-bandwidth product. T3 sets the organism's position on the τ·B surface.</li>
              <li style={{ marginBottom:5, fontSize:".86rem" }}><strong>Law III (Cephalopod Edge):</strong> ||E(t)||↑ &#8594; C↓. Analog coupled systems fail catastrophically under simultaneous binary-structure representation on all axes.</li>
            </ul>
          </div>
        </section>

        {/* ── APPENDICES ── */}
        <div ref={sectionRefs.appA as React.RefObject<HTMLDivElement>}
          style={{ fontFamily:disp, fontSize:".7rem", letterSpacing:".22em", color:GOLD, textTransform:"uppercase", borderTop:`1px solid ${BORD}`, paddingTop:38, marginTop:56, marginBottom:18 }}>
          Appendix A -- Complete Equation Table
        </div>
        <div style={{ overflowX:"auto", margin:"18px 0" }}>
          <table style={{ width:"100%", borderCollapse:"collapse", fontFamily:mono2, fontSize:".68rem" }}>
            <thead><tr style={{ background:"rgba(255,208,0,.07)", borderBottom:`1px solid ${BORD}` }}>
              <TH>Layer</TH><TH>Symbol</TH><TH>Equation</TH><TH>Units</TH>
            </tr></thead>
            <tbody>
              <tr><TD>1. Solar</TD><TD>F10.7</TD><TD>65 + 155&middot;S&middot;&frac12;(1&minus;cos(2&pi;t/11))</TD><TD>sfu</TD></tr>
              <tr><TD>2. Wind</TD><TD>B_sw</TD><TD>4 + 3.5&middot;&radic;(F10.7/200)</TD><TD>nT</TD></tr>
              <tr><TD>3. Geo</TD><TD>Kp</TD><TD>1.2 + 2.8&middot;(F10.7/220)^0.7</TD><TD>index</TD></tr>
              <tr><TD>4. Ocean</TD><TD>w</TD><TD>(0.4+0.3&middot;Kp/4)&middot;(0.3+0.7&middot;coast)</TD><TD>fraction</TD></tr>
              <tr><TD>5. Iodine</TD><TD>[I]</TD><TD>(50+110&middot;w&middot;(1+0.8&middot;coast))&middot;(0.5+0.5&middot;F107/220)</TD><TD>mcg/L</TD></tr>
              <tr><TD>6a. T3</TD><TD>T3</TD><TD>([I]/(Km+[I]))&middot;&eta;_Se&middot;(0.85+0.15&middot;&eta;_Se); Km=80</TD><TD>norm</TD></tr>
              <tr><TD>6b. rT3</TD><TD>rT3</TD><TD>([I]/(Km+[I]))&middot;(1&minus;&eta;_Se)&middot;0.6 + 0.1</TD><TD>norm</TD></tr>
              <tr><TD>7. ATP</TD><TD>ATP</TD><TD>PGC&middot;(&#916;&#936;/180)&middot;(0.7+0.3&middot;&eta;_Se); PGC=0.4+0.6&middot;T3; &#916;&#936;=150+30&middot;T3</TD><TD>relative</TD></tr>
              <tr><TD>8. Neural</TD><TD>&#915;</TD><TD>ATP^1.4&middot;exp(&minus;0.3&middot;&tau;); &tau;=1&minus;ATP&middot;0.6</TD><TD>[0,1]</TD></tr>
              <tr><TD>9. Gut</TD><TD>&#937;</TD><TD>T3^0.8&middot;but&middot;(gq&middot;0.6+0.4); but=0.3+0.7&middot;gq&middot;(0.5+0.5&middot;T3)</TD><TD>[0,1]</TD></tr>
              <tr><TD>10. Circ</TD><TD>&#961;</TD><TD>BMAL1&middot;(0.7+0.3&middot;&#915;); BMAL1=0.4+0.4&middot;T3+0.2&middot;&#937;</TD><TD>[0,1]</TD></tr>
              <tr><TD>11. Epi</TD><TD>&#931;</TD><TD>1&minus;[(1&minus;&#961;)&middot;0.5+(1&minus;&#937;)&middot;0.3+(1&minus;&#915;)&middot;0.2]&middot;0.85</TD><TD>[0,1]</TD></tr>
              <tr><TD>Risk</TD><TD>&#916;R</TD><TD>(1&minus;&#915;&middot;&#937;&middot;&#961;&middot;&#931;)^1.8&middot;100</TD><TD>%</TD></tr>
            </tbody>
          </table>
        </div>

        <div ref={sectionRefs.appB as React.RefObject<HTMLDivElement>}
          style={{ fontFamily:disp, fontSize:".7rem", letterSpacing:".22em", color:GOLD, textTransform:"uppercase", borderTop:`1px solid ${BORD}`, paddingTop:38, marginTop:56, marginBottom:18 }}>
          Appendix B -- CUCA Law Summary
        </div>
        <div style={{ overflowX:"auto", margin:"18px 0" }}>
          <table style={{ width:"100%", borderCollapse:"collapse", fontFamily:mono2, fontSize:".68rem" }}>
            <thead><tr style={{ background:"rgba(255,208,0,.07)", borderBottom:`1px solid ${BORD}` }}>
              <TH>Law</TH><TH>Name</TH><TH>Statement</TH><TH>Key Equation</TH>
            </tr></thead>
            <tbody>
              <tr><TD>I</TD><TD>Universal Spacing Law</TD><TD>Coherence is a function of physical distance between coupled elements</TD><TD>C(x,t) = C_max&middot;exp(&minus;d/&lambda;)</TD></tr>
              <tr><TD>II</TD><TD>Reptilian Constraint</TD><TD>Control timescale x bandwidth is conserved; T3 sets τ·B position</TD><TD>&tau;&middot;B = &kappa;_R</TD></tr>
              <tr><TD>III</TD><TD>Cephalopod Edge Constraint</TD><TD>Analog systems fail under simultaneous binary stress on all coupling axes</TD><TD>||E(t)||&#8593; &#8594; C(x,t)&#8595;</TD></tr>
            </tbody>
          </table>
        </div>

        {/* ── REFERENCES ── */}
        <div ref={sectionRefs.refs as React.RefObject<HTMLDivElement>}
          style={{ fontFamily:disp, fontSize:".7rem", letterSpacing:".22em", color:GOLD, textTransform:"uppercase", borderTop:`1px solid ${BORD}`, paddingTop:38, marginTop:56, marginBottom:18 }}>
          References
        </div>
        {[
          ["[1]","Baldwin, M.P., & Dunkerton, T.J. (2001). Stratospheric harbingers of anomalous weather regimes. Science, 294(5542), 581-584."],
          ["[2]","Berry, M.J., Banu, L., & Larsen, P.R. (1992). Type I iodothyronine deiodinase is a selenocysteine-containing enzyme. Nature, 349(6308), 438-440."],
          ["[3]","Delange, F., et al. (2002). Iodine deficiency in the world: where do we stand at the turn of the century? Thyroid, 12(6), 523-527."],
          ["[4]","Donohoe, D.R., et al. (2012). The microbiome and butyrate regulate energy metabolism and autophagy. Cell Metabolism, 13(5), 517-526."],
          ["[5]","Farhangi, M.A., et al. (2017). The effects of thyroid hormone on intestinal permeability and gut microbiome. Biomedicine & Pharmacotherapy, 95, 1609-1615."],
          ["[6]","Halberg, F., et al. (2000). Cross-spectrally coherent ~10.5- and 21-year biological and physical cycles. Neuroendocrinology Letters, 21(3), 233-258."],
          ["[7]","Hathaway, D.H. (2015). The solar cycle. Living Reviews in Solar Physics, 12(1), 4."],
          ["[8]","Horvath, S. (2013). DNA methylation age of human tissues and cell types. Genome Biology, 14(10), R115."],
          ["[9]","Miller, S. (2026). AETHER framework: CUCA v4.1. AetherLife.co / Cosmic Chaos Corporation. Preprint."],
          ["[10]","Persinger, M.A. (1987). Geopsychology and geopsychopathology. Experientia, 43(1), 92-104."],
          ["[11]","Sinha, R.A., et al. (2014). Thyroid hormone regulation of hepatic lipid and carbohydrate metabolism. Trends in Endocrinology & Metabolism, 25(10), 538-545."],
          ["[12]","Vetter, C., et al. (2018). Night shift work, genetic risk, and type 2 diabetes in the UK Biobank. Diabetes Care, 41(4), 762-769."],
          ["[13]","Weitzel, J.M., & Iwen, K.A.H. (2011). Coordination of mitochondrial biogenesis by thyroid hormone. Molecular and Cellular Endocrinology, 342(1-2), 1-7."],
        ].map(([id, txt]) => (
          <div key={id} style={{ marginBottom:9, fontSize:".82rem", paddingLeft:"1.8em", textIndent:"-1.8em", color:"rgba(216,224,240,.6)" }}>
            <span style={{ fontFamily:mono2, fontSize:".64rem", color:GOLD, marginRight:7 }}>{id}</span>{txt}
          </div>
        ))}

        {/* ── FOOTER ── */}
        <div style={{ marginTop:56, padding:22, borderTop:`1px solid ${BORD}`, fontFamily:mono2, fontSize:".55rem", color:DIM, textAlign:"center", lineHeight:2 }}>
          &copy; 2026 Shia Miller / AetherLife.co / Cosmic Chaos Corporation&trade;<br />
          AETHER framework &middot; CUCA architecture &middot; Universal Spacing Law &middot; Reptilian Constraint &middot; Cephalopod Edge Constraint -- all rights reserved<br />
          AETHER Science Series Volume I &middot; First Edition &middot; June 2026 &middot; Not peer reviewed &middot; Preprint for priority record
        </div>

      </div>
    </div>
  );
}
