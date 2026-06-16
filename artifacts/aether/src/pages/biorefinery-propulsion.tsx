import { useEffect, useRef, useState } from "react";

/* ── Palette ── */
const BG     = "#020408";
const PANEL  = "rgba(4,10,18,0.97)";
const BORDER = "#0c1826";
const GOLD   = "#c9a84c";
const GOLD2  = "#f0d46a";
const CYAN   = "#2ef0d8";
const GREEN  = "#44e888";
const VIOLET = "#9966ff";
const EMBER  = "#ff6633";
const DIM    = "#3a5060";
const TEXT   = "#b0c4d0";
const MUTED  = "#506070";

const mono  = "'Space Mono', monospace";
const serif = "'Cinzel', serif";
const body  = "'Crimson Pro', Georgia, serif";

/* ── Pipeline stages ── */
interface Stage {
  id: number;
  label: string;
  sub: string;
  color: string;
  icon: string;
  detail: string;
}

const STAGES: Stage[] = [
  { id:0, label:"PLASTIC WASTE",       sub:"Polymer Feedstock",     color:EMBER,  icon:"♻",
    detail:"Oil-derived polymer chains — PET, PVC, polyethylene. Carbon-rich substrate locked in stable long-chain form. 380 million tonnes/year global output." },
  { id:1, label:"BIOLOGICAL BREAKDOWN", sub:"Fungi + Bacteria",      color:GREEN,  icon:"🍄",
    detail:"Fungal enzymes (laccases, peroxidases) attack polymer backbones. Bacterial depolymerases digest plastic fragments into soluble small molecules. Polymer → Monomer." },
  { id:2, label:"MONOMERS / FEEDSTOCK", sub:"Liberated Carbon Units", color:CYAN,   icon:"⬡",
    detail:"Depolymerization yields monomers: styrene, ethylene glycol, lactic acid. These are high-energy carbon feedstocks identical to petrochemical equivalents — biology-derived." },
  { id:3, label:"ENGINEERED MICROBES",  sub:"Synthetic Biology",     color:VIOLET, icon:"⚙",
    detail:"Metabolically rewired bacteria (E. coli, Clostridium) consume monomers and produce target molecules via designed enzymatic pathways. The genome is the factory." },
  { id:4, label:"FUELS & CHEMICALS",    sub:"CH₄ · H₂ · Biofuels",  color:GOLD,   icon:"⚡",
    detail:"Output stream: methane (CH₄), hydrogen (H₂), ethanol, butanol. Bio-identical to fossil fuels in combustion chemistry but zero-net-carbon in origin." },
  { id:5, label:"LIQUID PROPELLANT",    sub:"Bio-CH₄ / Bio-LH₂",    color:GOLD2,  icon:"🚀",
    detail:"Liquefied bio-methane + liquid oxygen (or liquid hydrogen + LOX). Drop-in for Raptor-class engines. Same propellant chemistry, biology-closed supply chain." },
  { id:6, label:"MASS FLOW · vₑ",      sub:"Nozzle Thermodynamics", color:"#ff9933", icon:"▶",
    detail:"Propellant combusts in convergent-divergent nozzle. Chamber pressure ~250 bar, exhaust velocity ~3,800 m/s. Supersonic regime (Mach >1) at the throat." },
  { id:7, label:"THRUST  F = ṁ·vₑ",   sub:"Newton's 3rd Law",      color:EMBER,  icon:"↑",
    detail:"Equal and opposite reaction. ~2.3 MN thrust at 600 kg/s mass flow and 3,800 m/s exhaust velocity. The biology changes the fuel source; the physics remains invariant." },
];

/* ── Breakdown agents ── */
const BREAKDOWN = [
  {
    name:"MUSHROOMS (FUNGI)", color:GREEN,
    steps:[
      "Fungal enzymes attack polymer chains",
      "Laccases / peroxidases cleave C–C bonds",
      "Polymer → Monomer in 2–8 weeks",
      "Works on PE, PU, PET, PS",
    ],
    note:"White-rot fungi (Trametes versicolor) degrade 50–90% of some plastics in lab conditions.",
  },
  {
    name:"MICROBES (BACTERIA)", color:CYAN,
    steps:[
      "Bacteria adhere to plastic surface",
      "Biofilm secretes depolymerases",
      "Digest polymer → small molecules",
      "Ideonella sakaiensis — PET specialist",
    ],
    note:"PETase enzyme naturally evolved in a Japanese recycling site. Rate can be 3× accelerated via protein engineering.",
  },
];

/* ── Synthetic biology outputs ── */
const SYN_BIO = [
  { name:"FOSSIL FUEL · RENEWED", color:EMBER,  sub:"Biofuels", items:["Methane (CH₄)","Ethanol","Butanol","Synthetic diesel"] },
  { name:"RENEWED CHEMICALS",     color:VIOLET, sub:"Bioplastics, solvents, monomers", items:["Lactic acid","Succinic acid","Specialty polymers","Industrial solvents"] },
  { name:"RENEWED DRUG",          color:GOLD,   sub:"Pharmaceuticals", items:["Drug precursors","Therapeutic proteins","Enzyme libraries","Folate-linked delivery"] },
];

/* ── Biocompatible materials ── */
const BIOCOMPAT = [
  { name:"DNA",           color:VIOLET, sub:"Information storage · structural material · biosensing" },
  { name:"BIOCOMPATIBLE", color:CYAN,   sub:"Compatible with life · medical implants · tissue engineering" },
  { name:"FOLATE",        color:GREEN,  sub:"Vitamin B9 · targeted drug delivery · cellular growth" },
  { name:"BIO-POLYMERS",  color:GOLD,   sub:"Biodegradable · renewable · low toxicity" },
];

/* ── Resource recovery ── */
const RESOURCES = [
  { name:"Metals",            color:EMBER,  items:["Cu · Ni · Co · Fe · Li","Electronic waste recovery","Bioleaching (40% global Cu)"] },
  { name:"Rare Earth Elements", color:VIOLET, items:["Nd · Ce · La · Y","Fungal mineral recovery","Lower-impact than hard mining"] },
  { name:"Uranium",           color:GOLD,   items:["Biological extraction from water","Bacterial biosorption","Waste-to-resource pathway"] },
];

/* ── Pipeline canvas ── */
function PipelineCanvas({ activeStage, setActive }: { activeStage: number; setActive:(i:number)=>void }) {
  const cvRef = useRef<HTMLCanvasElement>(null);
  const tRef  = useRef(0);
  const raf   = useRef(0);
  const activeRef = useRef(activeStage);
  activeRef.current = activeStage;

  useEffect(() => {
    const cv = cvRef.current; if (!cv) return;
    const ctx = cv.getContext("2d"); if (!ctx) return;

    function resize() {
      const dpr = Math.min(2, window.devicePixelRatio || 1);
      const r = cv!.getBoundingClientRect();
      cv!.width  = r.width  * dpr;
      cv!.height = r.height * dpr;
      ctx!.setTransform(dpr, 0, 0, dpr, 0, 0);
    }
    resize();
    window.addEventListener("resize", resize);

    function loop() {
      raf.current = requestAnimationFrame(loop);
      tRef.current += 0.007;
      const t = tRef.current;
      const r = cv!.getBoundingClientRect();
      const W = r.width, H = r.height;
      ctx!.clearRect(0, 0, W, H);
      ctx!.fillStyle = BG;
      ctx!.fillRect(0, 0, W, H);

      const n = STAGES.length;
      const nodeW = W / n;
      const cy = H * 0.45;
      const nr = 22;

      // Pipe segments
      for (let i = 0; i < n - 1; i++) {
        const x1 = nodeW * i + nodeW / 2 + nr;
        const x2 = nodeW * (i + 1) + nodeW / 2 - nr;
        const col = STAGES[i].color;
        // Background pipe
        ctx!.beginPath();
        ctx!.moveTo(x1, cy); ctx!.lineTo(x2, cy);
        ctx!.strokeStyle = `${col}22`; ctx!.lineWidth = 6; ctx!.stroke();
        // Active glow
        const isActive = i === activeRef.current || i === activeRef.current - 1;
        if (isActive) {
          ctx!.beginPath();
          ctx!.moveTo(x1, cy); ctx!.lineTo(x2, cy);
          ctx!.strokeStyle = `${col}55`; ctx!.lineWidth = 8; ctx!.stroke();
        }
      }

      // Particles flowing along the pipe
      const pCount = 24;
      for (let p = 0; p < pCount; p++) {
        const progress = ((p / pCount + t * 0.28) % 1);
        const globalX = progress * (W - nodeW) + nodeW / 2;
        // Which segment?
        const segI = Math.floor(progress * (n - 1));
        const col = STAGES[Math.min(segI, n - 1)].color;
        const alive = progress > 0.01 && progress < 0.99;
        if (!alive) continue;
        const alpha = 0.2 + 0.65 * Math.sin(progress * Math.PI);
        const radius = 2.5 + Math.sin(p * 2.3 + t * 4) * 0.8;
        ctx!.beginPath();
        ctx!.arc(globalX, cy + Math.sin(p * 1.7 + t * 3) * 4, radius, 0, Math.PI * 2);
        ctx!.fillStyle = col + Math.round(alpha * 255).toString(16).padStart(2,"0");
        ctx!.fill();
      }

      // Nodes
      for (let i = 0; i < n; i++) {
        const s = STAGES[i];
        const nx = nodeW * i + nodeW / 2;
        const active = i === activeRef.current;
        const pulse = 0.5 + 0.5 * Math.sin(t * 3 + i);

        // Outer halo
        if (active) {
          ctx!.beginPath(); ctx!.arc(nx, cy, nr + 10 + pulse * 6, 0, Math.PI * 2);
          ctx!.fillStyle = `${s.color}18`; ctx!.fill();
        }
        // Ring
        ctx!.beginPath(); ctx!.arc(nx, cy, nr + (active ? 3 : 0), 0, Math.PI * 2);
        ctx!.strokeStyle = active ? s.color : `${s.color}55`;
        ctx!.lineWidth = active ? 2.5 : 1.2; ctx!.stroke();

        // Inner fill
        ctx!.beginPath(); ctx!.arc(nx, cy, nr - 2, 0, Math.PI * 2);
        ctx!.fillStyle = active ? `${s.color}25` : `${s.color}10`; ctx!.fill();

        // Icon
        ctx!.font = `${active ? 15 : 12}px serif`;
        ctx!.textAlign = "center"; ctx!.textBaseline = "middle";
        ctx!.fillStyle = active ? s.color : `${s.color}aa`;
        ctx!.fillText(s.icon, nx, cy);

        // Label below
        ctx!.font = `bold ${active ? 8 : 7}px ${mono}`;
        ctx!.fillStyle = active ? s.color : MUTED;
        ctx!.textAlign = "center"; ctx!.textBaseline = "top";
        const lWords = s.label.split(" ");
        lWords.forEach((w, wi) => {
          ctx!.fillText(w, nx, cy + nr + 8 + wi * 10);
        });

        // Step number above
        ctx!.font = `7px ${mono}`;
        ctx!.fillStyle = active ? s.color : DIM;
        ctx!.textAlign = "center"; ctx!.textBaseline = "bottom";
        ctx!.fillText(`0${i + 1}`, nx, cy - nr - 6);
      }
    }
    loop();
    return () => { cancelAnimationFrame(raf.current); window.removeEventListener("resize", resize); };
  }, []);

  function handleClick(e: React.MouseEvent<HTMLCanvasElement>) {
    const cv = cvRef.current; if (!cv) return;
    const rect = cv.getBoundingClientRect();
    const mx = e.clientX - rect.left;
    const W = rect.width;
    const n = STAGES.length;
    const nodeW = W / n;
    for (let i = 0; i < n; i++) {
      const nx = nodeW * i + nodeW / 2;
      if (Math.abs(mx - nx) < 28) { setActive(i); break; }
    }
  }

  return <canvas ref={cvRef} onClick={handleClick} style={{ display:"block", width:"100%", height:160, cursor:"pointer" }} />;
}

/* ══════════════════════════════════════════════════
   MAIN PAGE
══════════════════════════════════════════════════ */
export default function BiorefineryPropulsionPage() {
  const [activeStage, setActiveStage] = useState(0);
  const stage = STAGES[activeStage];

  const panelBox: React.CSSProperties = {
    background: PANEL, border: `1px solid ${BORDER}`,
    borderRadius: 2, padding: "10px 12px",
    marginBottom: 10, position: "relative",
  };
  const topLine = (c = GOLD) => (
    <div style={{ position:"absolute", top:0, left:0, right:0, height:1,
      background:`linear-gradient(90deg,${c},transparent)`, opacity:0.35 }} />
  );
  const SH = ({ label, color = GOLD }: { label:string; color?:string }) => (
    <div style={{ fontSize:7, letterSpacing:"0.2em", textTransform:"uppercase",
      color, marginBottom:6, borderBottom:`1px solid ${BORDER}`, paddingBottom:3 }}>
      {label}
    </div>
  );

  return (
    <div style={{ background:BG, minHeight:"100vh", color:TEXT, fontFamily:mono, overflowY:"auto" }}>

      {/* ── HEADER ── */}
      <div style={{
        padding:"12px 20px 10px", borderBottom:`1px solid ${BORDER}`,
        background:"rgba(2,4,10,0.98)", position:"sticky", top:0, zIndex:20,
      }}>
        <div style={{ position:"absolute", bottom:0, left:0, right:0, height:1,
          background:`linear-gradient(90deg,transparent,${GREEN},${CYAN},${GOLD},${EMBER},transparent)`,
          opacity:0.35 }} />
        <div style={{ maxWidth:1400, margin:"0 auto", display:"flex", alignItems:"center", justifyContent:"space-between", gap:16 }}>
          <div>
            <div style={{ fontSize:7, letterSpacing:"0.2em", color:GREEN, marginBottom:3 }}>
              AETHER · BIOREFINERY LOOP · PLASTIC UPCYCLING → PROPULSION PHYSICS
            </div>
            <div style={{ fontFamily:serif, fontSize:20, letterSpacing:2, color:"#fff" }}>
              CLOSED-LOOP BIO-PROPULSION REFINERY
            </div>
            <div style={{ fontFamily:body, fontSize:11, color:DIM, marginTop:2 }}>
              Plastic Waste  ·  Fungal Breakdown  ·  Engineered Microbes  ·  Bio-CH₄/H₂  ·  F = ṁ·vₑ
            </div>
          </div>
          <div style={{ display:"flex", gap:18 }}>
            {[["Stage", `0${activeStage+1}/${STAGES.length}`, stage.color],
              ["Current", stage.label, stage.color],
              ["Output", stage.sub, CYAN]].map(([k,v,c])=>(
              <div key={k as string} style={{ textAlign:"center" }}>
                <div style={{ fontSize:6, color:DIM, letterSpacing:1, marginBottom:1 }}>{k as string}</div>
                <div style={{ fontFamily:serif, fontSize:11, color:c as string, letterSpacing:1, maxWidth:140 }}>{v as string}</div>
              </div>
            ))}
          </div>
          <div style={{ fontFamily:body, fontStyle:"italic", fontSize:10, color:DIM, maxWidth:220, lineHeight:1.6 }}>
            "Biology can transform waste into resources, fuelling a sustainable future on Earth and beyond."
          </div>
        </div>
      </div>

      {/* ── BODY ── */}
      <div style={{ maxWidth:1400, margin:"0 auto", padding:"14px 20px 32px" }}>

        {/* Pipeline canvas */}
        <div style={{ ...panelBox, padding:0, overflow:"hidden", marginBottom:12 }}>
          <div style={{ padding:"8px 12px 4px", borderBottom:`1px solid ${BORDER}`, display:"flex", justifyContent:"space-between", alignItems:"center" }}>
            <div style={{ fontSize:7, letterSpacing:"0.18em", color:DIM, textTransform:"uppercase" }}>
              Full Conversion Pipeline · Click any node
            </div>
            <div style={{ fontFamily:body, fontStyle:"italic", fontSize:10, color:stage.color }}>
              {stage.label} — {stage.sub}
            </div>
          </div>
          <PipelineCanvas activeStage={activeStage} setActive={setActiveStage} />
          {/* Stage detail bar */}
          <div style={{ padding:"8px 16px", borderTop:`1px solid ${BORDER}`,
            background:`${stage.color}08`, display:"flex", gap:16, alignItems:"flex-start" }}>
            <div style={{ fontFamily:serif, fontSize:14, color:stage.color, minWidth:26 }}>{stage.icon}</div>
            <div>
              <div style={{ fontFamily:serif, fontSize:12, color:stage.color, letterSpacing:1, marginBottom:3 }}>
                {stage.label}
              </div>
              <div style={{ fontFamily:body, fontSize:11, color:TEXT, lineHeight:1.7 }}>{stage.detail}</div>
            </div>
          </div>
        </div>

        {/* 3-column body */}
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:12 }}>

          {/* ── COL 1: Breakdown pathways ── */}
          <div>
            <div style={{ ...panelBox, border:`1px solid ${GREEN}30` }}>
              {topLine(GREEN)}
              <SH label="01 · Breakdown Pathways" color={GREEN} />
              <div style={{ fontFamily:body, fontSize:11, color:DIM, marginBottom:10, lineHeight:1.6 }}>
                Biology uses two primary agents to depolymerize plastic — fungal enzymes and bacterial biofilms. Both convert stable polymer chains into bioavailable monomers.
              </div>
              {BREAKDOWN.map(agent => (
                <div key={agent.name} style={{ marginBottom:12, padding:"8px 10px",
                  background:`${agent.color}08`, border:`1px solid ${agent.color}25`, borderRadius:2 }}>
                  <div style={{ fontSize:8, fontWeight:"bold", color:agent.color, letterSpacing:1, marginBottom:6 }}>
                    {agent.name}
                  </div>
                  {agent.steps.map(s => (
                    <div key={s} style={{ display:"flex", gap:6, alignItems:"flex-start", marginBottom:3 }}>
                      <span style={{ color:agent.color, fontSize:8, marginTop:1 }}>›</span>
                      <span style={{ fontSize:8, color:TEXT, lineHeight:1.5 }}>{s}</span>
                    </div>
                  ))}
                  <div style={{ marginTop:6, padding:"4px 6px", background:"rgba(0,0,0,0.3)",
                    borderLeft:`2px solid ${agent.color}50`, fontSize:8, color:MUTED,
                    fontFamily:body, fontStyle:"italic", lineHeight:1.5 }}>
                    {agent.note}
                  </div>
                </div>
              ))}

              {/* Polymer → Monomer diagram */}
              <div style={{ padding:"8px 10px", border:`1px solid ${BORDER}`, borderRadius:2, textAlign:"center", marginTop:4 }}>
                <div style={{ fontSize:8, color:DIM, marginBottom:6, letterSpacing:1 }}>DEPOLYMERIZATION</div>
                <div style={{ display:"flex", alignItems:"center", justifyContent:"center", gap:8 }}>
                  <div style={{ padding:"4px 8px", border:`1px solid ${EMBER}50`, borderRadius:1 }}>
                    <div style={{ fontSize:8, color:EMBER }}>POLYMER</div>
                    <div style={{ fontSize:6, color:DIM }}>long chain</div>
                  </div>
                  <div style={{ fontSize:12, color:GREEN }}>→</div>
                  <div style={{ padding:"4px 8px", border:`1px solid ${GREEN}50`, borderRadius:1 }}>
                    <div style={{ fontSize:8, color:GREEN }}>MONOMER</div>
                    <div style={{ fontSize:6, color:DIM }}>small molecule</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Handwritten notes card */}
            <div style={{ ...panelBox, border:`1px solid ${GOLD}30` }}>
              {topLine()}
              <SH label="Seed Concept · Raw Notes" color={GOLD} />
              <div style={{ fontFamily:body, fontStyle:"italic", fontSize:10, color:DIM, marginBottom:8, lineHeight:1.5 }}>
                Original handwritten idea that seeded this synthesis:
              </div>
              <img src="/handwritten-notes.jpeg" alt="Handwritten notes"
                style={{ width:"100%", borderRadius:2, border:`1px solid ${BORDER}`, opacity:0.85 }} />
              <div style={{ marginTop:8, fontFamily:mono, fontSize:8, color:DIM, lineHeight:1.8 }}>
                <div style={{ color:GOLD }}>Plastic | Oil | Folate · DNA</div>
                <div>Bio compatible — Compatible w/ life</div>
                <div style={{ color:GREEN }}>Mushrooms → break polymer to monomer</div>
                <div>Microbes to break down plastics</div>
                <div style={{ color:VIOLET }}>Engineering bacteria → Fossil Fuel</div>
                <div>Renewed drug</div>
                <div style={{ color:EMBER }}>elements → uranium</div>
              </div>
            </div>
          </div>

          {/* ── COL 2: Synthetic biology + pipeline detail ── */}
          <div>
            <div style={{ ...panelBox, border:`1px solid ${VIOLET}30` }}>
              {topLine(VIOLET)}
              <SH label="02 · Synthetic Biology — Engineering Bacteria" color={VIOLET} />
              <div style={{ fontFamily:body, fontSize:11, color:DIM, marginBottom:10, lineHeight:1.6 }}>
                Metabolically rewired microbes consume plastic-derived monomers as feedstock and output target molecules via designed enzymatic pathways.
              </div>

              {/* Metabolic flow arrow */}
              <div style={{ display:"flex", alignItems:"center", justifyContent:"center", gap:6, marginBottom:10, padding:"6px", border:`1px solid ${BORDER}`, borderRadius:2 }}>
                {["PLASTIC","→","FEEDSTOCK","→","PRODUCT"].map((s,i) => (
                  <div key={i} style={{ fontSize:8, color: s==="→" ? DIM : i===0 ? EMBER : i===4 ? GREEN : VIOLET, fontWeight: s!=="→"?"bold":"normal" }}>{s}</div>
                ))}
              </div>

              {SYN_BIO.map(out => (
                <div key={out.name} style={{ marginBottom:10, padding:"8px 10px",
                  background:`${out.color}07`, border:`1px solid ${out.color}25`, borderRadius:2 }}>
                  <div style={{ fontSize:8, fontWeight:"bold", color:out.color, letterSpacing:1, marginBottom:2 }}>{out.name}</div>
                  <div style={{ fontSize:8, color:MUTED, fontFamily:body, marginBottom:6 }}>{out.sub}</div>
                  <div style={{ display:"flex", flexWrap:"wrap", gap:4 }}>
                    {out.items.map(item => (
                      <div key={item} style={{ fontSize:7, padding:"2px 5px",
                        border:`1px solid ${out.color}30`, borderRadius:1, color:out.color }}>
                        {item}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            {/* Biocompatible materials */}
            <div style={{ ...panelBox, border:`1px solid ${CYAN}25` }}>
              {topLine(CYAN)}
              <SH label="03 · Biocompatible Materials" color={CYAN} />
              {BIOCOMPAT.map(bc => (
                <div key={bc.name} style={{ display:"flex", gap:10, alignItems:"flex-start",
                  padding:"5px 0", borderBottom:`1px solid ${BORDER}` }}>
                  <div style={{ fontSize:8, fontWeight:"bold", color:bc.color, minWidth:72, letterSpacing:1 }}>{bc.name}</div>
                  <div style={{ fontSize:8, color:DIM, lineHeight:1.5, fontFamily:body }}>{bc.sub}</div>
                </div>
              ))}
            </div>

            {/* Plastic upcycling reference image */}
            <div style={{ ...panelBox, padding:0, overflow:"hidden" }}>
              <div style={{ padding:"6px 12px", borderBottom:`1px solid ${BORDER}` }}>
                <div style={{ fontSize:7, letterSpacing:"0.15em", color:DIM, textTransform:"uppercase" }}>Reference · Plastic Upcycling Infographic</div>
              </div>
              <img src="/plastic-upcycling.png" alt="Plastic Upcycling"
                style={{ width:"100%", display:"block", opacity:0.88 }} />
            </div>
          </div>

          {/* ── COL 3: Resource recovery + propulsion terminal ── */}
          <div>
            {/* Resource recovery */}
            <div style={{ ...panelBox, border:`1px solid ${GOLD}30` }}>
              {topLine()}
              <SH label="04 · Resource Recovery · Bio-Mining" color={GOLD} />
              <div style={{ fontFamily:body, fontSize:11, color:DIM, marginBottom:10, lineHeight:1.6 }}>
                Microorganisms dissolve metals from ores and e-waste via bioleaching — lower energy, lower impact than conventional mining.
              </div>
              {RESOURCES.map(r => (
                <div key={r.name} style={{ marginBottom:10, padding:"7px 10px",
                  background:`${r.color}07`, border:`1px solid ${r.color}25`, borderRadius:2 }}>
                  <div style={{ fontSize:8, fontWeight:"bold", color:r.color, marginBottom:4, letterSpacing:1 }}>{r.name}</div>
                  {r.items.map(item => (
                    <div key={item} style={{ display:"flex", gap:6, marginBottom:2 }}>
                      <span style={{ color:r.color, fontSize:8 }}>◆</span>
                      <span style={{ fontSize:8, color:TEXT, lineHeight:1.5 }}>{item}</span>
                    </div>
                  ))}
                </div>
              ))}
              <div style={{ fontSize:8, color:MUTED, fontFamily:body, fontStyle:"italic", lineHeight:1.5, marginTop:4 }}>
                Uranium recovery from contaminated water via bacterial biosorption is an active research area — the same microbe that eats plastic can extract fissile material.
              </div>
            </div>

            {/* Connection to propulsion */}
            <div style={{ ...panelBox, border:`1px solid ${EMBER}40` }}>
              {topLine(EMBER)}
              <SH label="05 · Connection to Propulsion" color={EMBER} />

              {/* Chain diagram */}
              <div style={{ marginBottom:12 }}>
                {[
                  ["PLASTIC WASTE",      EMBER,  "Carbon polymer substrate"],
                  ["BIOLOGICAL BREAKDOWN", GREEN, "Fungi + bacteria → monomers"],
                  ["MONOMERS / HCs",     CYAN,   "Liberated carbon feedstock"],
                  ["ENGINEERED MICROBES", VIOLET, "Synthetic biology conversion"],
                  ["CH₄ · H₂ · BIOFUEL", GOLD,  "Combustion-ready molecules"],
                  ["LIQUID PROPELLANT",  GOLD2,  "Bio-LCH₄ + LOX / LH₂ + LOX"],
                  ["MASS FLOW → Thrust", EMBER,  "F = ṁ · vₑ  (Newton 3rd)"],
                ].map(([label, color, note], i) => (
                  <div key={label as string} style={{ display:"flex", gap:8, alignItems:"flex-start", marginBottom:i===6?0:2 }}>
                    <div style={{ display:"flex", flexDirection:"column", alignItems:"center" }}>
                      <div style={{ width:8, height:8, borderRadius:"50%", background:color as string, border:`1px solid ${color as string}`, flexShrink:0 }} />
                      {i < 6 && <div style={{ width:1, height:14, background:`${color as string}40` }} />}
                    </div>
                    <div>
                      <div style={{ fontSize:8, fontWeight:"bold", color:color as string, letterSpacing:0.5 }}>{label as string}</div>
                      <div style={{ fontSize:7, color:DIM, fontFamily:body, lineHeight:1.4 }}>{note as string}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* F = ṁ·vₑ terminal */}
            <div style={{ ...panelBox, border:`1px solid ${GOLD}55` }}>
              {topLine()}
              <SH label="Momentum Principle · Terminal Equation" color={GOLD} />
              <div style={{ textAlign:"center", padding:"12px 0 8px" }}>
                <div style={{ fontFamily:serif, fontSize:26, color:GOLD2, letterSpacing:2, marginBottom:8 }}>
                  F = ṁ · v<sub style={{ fontSize:18 }}>e</sub>
                </div>
                <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:6, marginBottom:10 }}>
                  {[["F","Thrust","~2,300 kN",GOLD],["ṁ","Mass Flow","~600 kg/s",GREEN],["vₑ","Exhaust Vel.","~3,800 m/s",CYAN]].map(([sym,name,val,c])=>(
                    <div key={sym as string} style={{ padding:"5px", border:`1px solid ${c as string}30`, borderRadius:2, textAlign:"center" }}>
                      <div style={{ fontFamily:serif, fontSize:14, color:c as string }}>{sym}</div>
                      <div style={{ fontSize:6, color:DIM, marginTop:1 }}>{name}</div>
                      <div style={{ fontSize:9, color:c as string, fontWeight:"bold", marginTop:2 }}>{val}</div>
                    </div>
                  ))}
                </div>
                <div style={{ fontFamily:body, fontSize:11, color:TEXT, lineHeight:1.7 }}>
                  The biology changes <span style={{ color:GREEN }}>how the fuel is produced</span>. The physics of equal and opposite reaction remains <span style={{ color:GOLD }}>invariant</span>. A closed-loop biosphere can fuel a rocket.
                </div>
              </div>

              {/* Raptor formula */}
              <div style={{ padding:"6px 10px", background:"rgba(200,168,76,0.06)", border:`1px solid ${GOLD}30`, borderRadius:2, textAlign:"center" }}>
                <div style={{ fontFamily:serif, fontSize:11, color:GOLD }}>2.3 × 10⁶ N ≈ 600 kg/s × 3,800 m/s</div>
                <div style={{ fontSize:7, color:DIM, marginTop:3 }}>Bio-derived propellant · Raptor-class engine · sea level</div>
              </div>
            </div>

            {/* AETHER synthesis note */}
            <div style={{ ...panelBox, border:`1px solid ${CYAN}30` }}>
              {topLine(CYAN)}
              <SH label="AETHER Synthesis" color={CYAN} />
              <div style={{ fontFamily:body, fontSize:11, color:TEXT, lineHeight:1.75 }}>
                Plastic is <span style={{ color:EMBER }}>fossilized carbon</span> — the same substrate that burned to create the petroleum age. Fungi and bacteria are returning that carbon to its <span style={{ color:GREEN }}>active, bioavailable state</span>. Engineered microbes then direct it into <span style={{ color:VIOLET }}>methane or hydrogen</span> — molecules identical to rocket propellants. The pipeline from a discarded plastic bottle to a Raptor-class engine is real, continuous, and closed-loop. <span style={{ color:GOLD }}>The biosphere is the refinery.</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
