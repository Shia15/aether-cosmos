import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";

const C = {
  bg: "#04070E", panel: "#080D1A", panel2: "#0B1220",
  border: "#0E1A2C", border2: "#152438",
  white: "#EBF4FF", text: "#7AA6C5", muted: "#486888", dim: "#243850",
  teal: "#00C9B1", gold: "#F5C518", orange: "#F97316",
  red: "#EF4444", yellow: "#FBBF24", purple: "#7C5CFC", blue: "#3B82F6",
  green: "#10B981", pink: "#F472B6",
};

type Tab = "overview" | "tumor" | "systemic" | "mental" | "interface" | "feedback" | "translational";

const LAYERS = [
  { id: "tumor",     n: "01", title: "Tumor & Biological Core",        col: "#EC4899", elements: ["Genomic alterations","Epigenetic markers","Tumor microenvironment","Stromal cells, immune cells, ECM"] },
  { id: "systemic",  n: "02", title: "Systemic & Physiological Dynamics", col: "#10B981", elements: ["Immune response","Inflammatory signaling","Metabolic state","Circadian rhythms"] },
  { id: "mental",    n: "03", title: "Mental–Emotional Layer",         col: "#F5C518", elements: ["Stress / anxiety markers","Patient adherence","Lifestyle factors","Psycho-oncology support"] },
  { id: "interface", n: "04", title: "Clinical Decision & AI Interface", col: "#7C5CFC", elements: ["Predictive modeling","Multi-agent therapy simulation","Decision-support dashboard","Real-time risk flags"] },
  { id: "feedback",  n: "05", title: "Research & Learning Feedback Loop", col: "#94A3B8", elements: ["Multi-dimensional clinical trials","Outcome tracking","AI-driven hypothesis refinement","Integrated data lake"] },
];

const TUMOR_DETAIL = [
  { tag: "GENOMICS",       body: "Driver mutations, copy-number variants, structural rearrangements. Foundation for targeted therapy selection." },
  { tag: "EPIGENETICS",    body: "DNA methylation, chromatin state, non-coding RNA. Modulates expression without changing sequence." },
  { tag: "MICROENVIRONMENT", body: "Stromal cells, immune infiltrate, ECM stiffness, hypoxia gradient. Shapes tumor behavior and treatment response." },
  { tag: "HETEROGENEITY",  body: "Intra- and inter-tumor variation. Subclonal evolution drives resistance — argues for sequential, adaptive therapy." },
];

const SYSTEMIC_DETAIL = [
  { tag: "IMMUNE",      col: C.green,    body: "T-cell infiltration, MHC presentation, checkpoint receptor expression. Modulates immunotherapy response." },
  { tag: "INFLAMMATION", col: C.orange,  body: "Chronic IL-6 / TNF-α elevation associated with progression. CRP and NLR are accessible biomarkers." },
  { tag: "METABOLISM",  col: C.gold,     body: "Warburg effect; tumor glucose uptake; circulating insulin/IGF-1 axis. Metabolic state is treatable." },
  { tag: "CIRCADIAN",   col: C.purple,   body: "Cortisol rhythm, melatonin secretion, chemotherapy timing (chronotherapy). Disruption observable." },
];

const MENTAL_DETAIL = [
  { tag: "STRESS / ANXIETY",        body: "Chronic stress is associated with measurable changes in inflammatory markers and immune surveillance. Association — not causation of disease itself." },
  { tag: "ADHERENCE & TOLERABILITY", body: "Patient well-being influences treatment adherence and tolerability. Improving QoL improves the chance the regimen is completed as intended." },
  { tag: "PSYCHOSOCIAL SUPPORT",    body: "Mindfulness, lifestyle optimization, psycho-oncology support — included as evidence-bound complements, never as substitutes for standard care." },
  { tag: "QUALITY OF LIFE",         body: "Tracked as a primary outcome alongside survival. Patient-reported outcomes inform real-time treatment adjustment." },
];

const INTERFACE_DETAIL = [
  { tag: "PREDICTIVE MODELING",     col: C.purple,  body: "Anticipates treatment response, side effects, progression. Trained on integrated genomic + phenotypic + behavioural data." },
  { tag: "DECISION SUPPORT",        col: C.blue,    body: "Synthesizes biomarkers, treatment history, and psychosocial factors into a single legible clinician interface." },
  { tag: "MULTI-AGENT SIMULATION",  col: C.pink,    body: "Therapy scenarios run in silico — biological, immune, and patient-state agents interact before any clinical decision." },
  { tag: "DATA INTEGRATION",        col: C.teal,    body: "Omics + EHR + PROs + wearable streams unified. The interface owns the integration so the clinician owns the decision." },
];

const FEEDBACK_DETAIL = [
  { tag: "MULTI-DIM TRIALS",        body: "Studies that capture physical, biochemical, and mental–emotional metrics yielding richer evidence." },
  { tag: "OUTCOME TRACKING",        body: "Continuous learning from patient outcomes informs both clinical decision support and research hypotheses." },
  { tag: "AI HYPOTHESIS REFINEMENT", body: "Patterns from the data lake suggest new mechanistic studies and biomarker candidates — AI as a hypothesis amplifier." },
  { tag: "PROTOCOL ITERATION",      body: "Dynamic refinement of treatment protocols based on aggregated real-world evidence; feeds back into Layer 1." },
];

const TRANSLATIONAL = [
  { tag: "DECISION-SUPPORT FRAMEWORKS",    col: C.purple,  body: "Build interfaces that synthesize biomarker, treatment history, and psychosocial factors for clinicians at the point of care." },
  { tag: "PREDICTIVE MODELING",            col: C.blue,    body: "Leverage AI to anticipate response, side effects, or progression — informed by systemic and patient-centered data." },
  { tag: "SYSTEMIC INTERVENTIONS",         col: C.green,   body: "Incorporate lifestyle, stress, and behavioural optimization into care protocols in evidence-bound ways." },
  { tag: "MULTI-DIM CLINICAL TRIALS",      col: C.gold,    body: "Design studies capturing physical, biochemical, and mental–emotional metrics, yielding richer insights." },
  { tag: "CROSS-DISCIPLINARY TEAMS",       col: C.pink,    body: "Engage data scientists, behavioural scientists, and clinicians to bridge mechanistic biology and patient experience." },
];

function CancerDynamicsCanvas() {
  const ref = useRef<HTMLCanvasElement>(null);
  const rafRef = useRef(0);
  useEffect(() => {
    const canvas = ref.current; if (!canvas) return;
    const ctx = canvas.getContext("2d")!;
    canvas.width = 900; canvas.height = 260;
    const W = canvas.width, H = canvas.height;
    const cx=W/2, cy=H/2;
    const rings = [
      { label:"TUMOR CORE", col:"#ef4444", r:40 },
      { label:"SYSTEMIC", col:"#f59e0b", r:68 },
      { label:"MENTAL", col:"#a78bfa", r:96 },
      { label:"NUTRITION", col:"#34d399", r:115 },
    ];
    let t=0;
    const particles: {ang:number,r:number,col:string,speed:number}[]=[];
    rings.forEach((ring,i)=>{
      for (let j=0;j<6;j++) particles.push({ ang:j*(Math.PI*2/6)+i*0.5, r:ring.r, col:ring.col, speed:(i%2===0?1:-1)*0.012 });
    });
    const draw=()=>{
      ctx.fillStyle="rgba(4,7,14,0.14)"; ctx.fillRect(0,0,W,H);
      t++;
      rings.forEach(ring=>{
        ctx.beginPath(); ctx.arc(cx,cy,ring.r,0,Math.PI*2);
        ctx.strokeStyle=ring.col+"44"; ctx.lineWidth=1.5; ctx.stroke();
        ctx.fillStyle=ring.col; ctx.font="bold 7px 'DM Mono',monospace"; ctx.textAlign="center";
        ctx.fillText(ring.label,cx,cy-ring.r-6);
      });
      particles.forEach(p=>{
        p.ang+=p.speed;
        const px=cx+Math.cos(p.ang)*p.r, py=cy+Math.sin(p.ang)*p.r;
        ctx.beginPath(); ctx.arc(px,py,3,0,Math.PI*2);
        ctx.fillStyle=p.col; ctx.shadowColor=p.col; ctx.shadowBlur=8; ctx.fill(); ctx.shadowBlur=0;
      });
      const gc=ctx.createRadialGradient(cx,cy,0,cx,cy,16);
      gc.addColorStop(0,"#ef4444cc"); gc.addColorStop(1,"transparent");
      ctx.beginPath(); ctx.arc(cx,cy,14+2*Math.sin(t*0.06),0,Math.PI*2);
      ctx.fillStyle=gc; ctx.shadowColor="#ef4444"; ctx.shadowBlur=18; ctx.fill(); ctx.shadowBlur=0;
      ctx.fillStyle="rgba(167,139,250,0.4)"; ctx.font="9px 'DM Mono',monospace"; ctx.textAlign="left";
      ctx.fillText("CANCER DYNAMICS · TUMOR CORE · SYSTEMIC · MENTAL · NUTRITION · CONCENTRIC LIVING SYSTEM MAP",14,18);
      rafRef.current=requestAnimationFrame(draw);
    };
    draw();
    return ()=>cancelAnimationFrame(rafRef.current);
  },[]);
  return <canvas ref={ref} style={{ width:"100%", height:"auto", borderRadius:8, display:"block" }} />;
}

export default function CancerDynamicsPage() {
  const [tab, setTab] = useState<Tab>("overview");

  const TABS: [Tab, string][] = [
    ["overview","FRAMEWORK MAP"],
    ["tumor","01 · TUMOR CORE"],
    ["systemic","02 · SYSTEMIC"],
    ["mental","03 · MENTAL–EMOTIONAL"],
    ["interface","04 · AI INTERFACE"],
    ["feedback","05 · FEEDBACK LOOP"],
    ["translational","TRANSLATIONAL"],
  ];

  return (
    <div data-testid="cancer-dynamics-root" className="min-h-screen p-6" style={{ background: C.bg, color: C.text, fontFamily: "'JetBrains Mono', monospace" }}>
      <div style={{ marginBottom:24 }}>
        <div style={{ display:"inline-block", background:"rgba(167,139,250,0.07)", border:"1px solid rgba(167,139,250,0.22)",
          borderRadius:8, padding:"0.3rem 1rem", fontSize:"0.7rem", letterSpacing:"0.2em",
          color:C.purple, textTransform:"uppercase", fontFamily:"inherit", marginBottom:12 }}>
          Live Simulation
        </div>
        <div style={{ background:"rgba(4,7,14,0.9)", border:"1px solid rgba(124,92,252,0.2)",
          borderLeft:`3px solid ${C.purple}`, borderRadius:10, padding:20 }}>
          <h2 style={{ fontFamily:"'JetBrains Mono',monospace", fontSize:18, color:C.white, margin:"0 0 6px" }}>
            Cancer Dynamics · Tumor Core → Systemic → Mental → Nutrition → AETHER Field
          </h2>
          <p style={{ fontFamily:"'JetBrains Mono',monospace", fontSize:12, color:"rgba(200,180,240,0.45)", margin:"0 0 14px", lineHeight:1.65 }}>
            Five cancer dynamics layers rendered as a living concentric ring system — Tumor Core outward to the AETHER
            Coherence Field, each layer showing its sub-factors, pathways, and AETHER interventions mapped as a
            live system dynamics canvas.
          </p>
          <CancerDynamicsCanvas />
        </div>
      </div>

      <div className="border-b pb-5 mb-6" style={{ borderColor: C.border2 }}>
        <p className="text-[9px] tracking-[0.36em] uppercase mb-3" style={{ color: C.dim }}>
          AETHER · Cancer Research Dynamics · Living System Map
        </p>
        <h1 className="font-['Cinzel',serif] font-light leading-none tracking-tight" style={{ fontSize: "clamp(34px,4.8vw,58px)", color: C.white }}>
          Cancer <em style={{ color: C.pink, fontStyle: "italic" }}>Dynamics</em>
        </h1>
        <p className="font-['Cinzel',serif] italic mt-2" style={{ fontSize: "clamp(13px,1.6vw,18px)", color: C.muted }}>
          Multi-layered systems framework · evidence-bound · patient-centered · AI-informed
        </p>
        <p className="mt-4 max-w-3xl text-[12px] leading-7 border-l-2 pl-4" style={{ color: C.text, borderColor: C.pink }}>
          Tumor behavior is influenced by cellular, systemic, and environmental interactions — not just genetic
          mutations. This page maps the five interacting layers (tumor core → systemic physiology → mental-emotional
          → AI interface → research feedback loop) as a living system, with explicit non-causation framing on the
          mental–emotional layer to avoid patient blame.
        </p>
      </div>

      {/* Ethics banner */}
      <div className="border p-3 mb-5" style={{ borderColor: C.yellow + "40", background: C.yellow + "08" }}>
        <p className="text-[9px] tracking-[0.22em]" style={{ color: C.yellow }}>EVIDENCE-BOUND · NO CAUSAL CLAIMS</p>
        <p className="text-[11px] mt-1" style={{ color: C.text }}>
          Associations are reported as associations. Mental–emotional state can influence treatment tolerability and
          quality of life — it is <strong>never</strong> presented as the cause of disease. Patient blame is not a
          permitted output of this framework.
        </p>
      </div>

      {/* TABS */}
      <div className="flex gap-1 mb-5 border-b overflow-x-auto" style={{ borderColor: C.border2 }}>
        {TABS.map(([k, lbl]) => (
          <button key={k} data-testid={`tab-${k}`} onClick={() => setTab(k)}
            className="px-3 py-2 text-[8px] tracking-[0.22em] whitespace-nowrap transition-colors"
            style={{
              color: tab === k ? C.pink : C.muted,
              borderBottom: tab === k ? "2px solid " + C.pink : "2px solid transparent",
              marginBottom: "-1px",
            }}>{lbl}</button>
        ))}
      </div>

      <AnimatePresence mode="wait">

        {tab === "overview" && (
          <motion.div key="overview" initial={{ opacity:0,y:8 }} animate={{ opacity:1,y:0 }} exit={{ opacity:0 }}>
            <SectionTitle n="00" t="Concentric Living System Map" />
            <p className="text-[12px] leading-7 mb-4 max-w-3xl">
              Five concentric layers with bidirectional feedback. Tumor biology at the core, surrounded by
              systemic physiology, then mental-emotional state, all observed and acted upon by an AI interface
              layer that closes the loop back to research.
            </p>
            <div className="border p-6 flex justify-center" style={{ borderColor: C.pink + "30", background: C.panel }}>
              <ConcentricMapSVG />
            </div>
            <div className="grid gap-2 mt-4" style={{ gridTemplateColumns: "repeat(auto-fit,minmax(220px,1fr))" }}>
              {LAYERS.map(L => (
                <button key={L.id} data-testid={`overview-card-${L.id}`} onClick={() => setTab(L.id as Tab)}
                  className="border p-3 text-left hover:opacity-80 transition-opacity"
                  style={{ borderColor: L.col + "40", background: L.col + "08" }}>
                  <p className="text-[8px] tracking-[0.22em]" style={{ color: L.col }}>{L.n} · LAYER</p>
                  <p className="font-['Cinzel',serif] mt-1" style={{ color: L.col, fontSize: 14 }}>{L.title}</p>
                  <p className="text-[10px] mt-1" style={{ color: C.muted }}>click to explore →</p>
                </button>
              ))}
            </div>
          </motion.div>
        )}

        {tab === "tumor" && (
          <motion.div key="tumor" initial={{ opacity:0,y:8 }} animate={{ opacity:1,y:0 }} exit={{ opacity:0 }}>
            <SectionTitle n="01" t="Tumor & Biological Core" badge="GENOMIC + EPIGENETIC + ENVIRONMENTAL" badgeCol="#EC4899" />
            <div className="grid gap-3" style={{ gridTemplateColumns: "repeat(auto-fit,minmax(280px,1fr))" }}>
              {TUMOR_DETAIL.map(d => (
                <div key={d.tag} className="border p-4" style={{ borderColor: "#EC4899" + "30", background: C.panel }}>
                  <p className="text-[10px] tracking-[0.2em] mb-2" style={{ color: "#EC4899" }}>{d.tag}</p>
                  <p className="text-[11px] leading-6" style={{ color: C.text }}>{d.body}</p>
                </div>
              ))}
            </div>
            <Callout col="#EC4899" k="WHY MULTI-OMIC">
              Precision medicine is shifting toward integrated genomic, epigenetic, and microenvironmental
              profiling. Single-axis interpretation is insufficient.
            </Callout>
          </motion.div>
        )}

        {tab === "systemic" && (
          <motion.div key="systemic" initial={{ opacity:0,y:8 }} animate={{ opacity:1,y:0 }} exit={{ opacity:0 }}>
            <SectionTitle n="02" t="Systemic & Physiological Dynamics" badge="WHOLE-BODY CONTEXT" badgeCol={C.green} />
            <div className="grid gap-3" style={{ gridTemplateColumns: "repeat(auto-fit,minmax(260px,1fr))" }}>
              {SYSTEMIC_DETAIL.map(d => (
                <div key={d.tag} data-testid={`systemic-${d.tag.toLowerCase()}`} className="border p-4" style={{ borderColor: d.col + "40", background: d.col + "08" }}>
                  <p className="text-[10px] tracking-[0.2em] mb-2" style={{ color: d.col }}>{d.tag}</p>
                  <p className="text-[11px] leading-6" style={{ color: C.text }}>{d.body}</p>
                </div>
              ))}
            </div>
            <Callout col={C.green} k="BIDIRECTIONAL">
              Tumor modulates immune response; immune system affects tumor progression. Solid arrows for
              mechanistic influence — never assumed unidirectional.
            </Callout>
          </motion.div>
        )}

        {tab === "mental" && (
          <motion.div key="mental" initial={{ opacity:0,y:8 }} animate={{ opacity:1,y:0 }} exit={{ opacity:0 }}>
            <SectionTitle n="03" t="Mental–Emotional Layer · Evidence-Bound" badge="ASSOCIATION — NOT CAUSATION" badgeCol={C.yellow} />
            <Callout col={C.yellow} k="STANCE">
              This layer reports <strong>associations</strong>. Mental-emotional state is treated as a modulator
              of treatment tolerability and quality of life. It is never assigned causal role for disease onset.
              Optional dashed arrows back to Layer 1 in the system map signify non-causal association only.
            </Callout>
            <div className="grid gap-3 mt-4" style={{ gridTemplateColumns: "repeat(auto-fit,minmax(280px,1fr))" }}>
              {MENTAL_DETAIL.map(d => (
                <div key={d.tag} className="border p-4" style={{ borderColor: C.yellow + "30", background: C.panel }}>
                  <p className="text-[10px] tracking-[0.2em] mb-2" style={{ color: C.yellow }}>{d.tag}</p>
                  <p className="text-[11px] leading-6" style={{ color: C.text }}>{d.body}</p>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {tab === "interface" && (
          <motion.div key="interface" initial={{ opacity:0,y:8 }} animate={{ opacity:1,y:0 }} exit={{ opacity:0 }}>
            <SectionTitle n="04" t="Clinical Decision & AI Interface" badge="DATA IN · ACTION OUT" badgeCol={C.purple} />
            <div className="grid gap-3" style={{ gridTemplateColumns: "repeat(auto-fit,minmax(260px,1fr))" }}>
              {INTERFACE_DETAIL.map(d => (
                <div key={d.tag} className="border p-4" style={{ borderColor: d.col + "40", background: d.col + "08" }}>
                  <p className="text-[10px] tracking-[0.2em] mb-2" style={{ color: d.col }}>{d.tag}</p>
                  <p className="text-[11px] leading-6" style={{ color: C.text }}>{d.body}</p>
                </div>
              ))}
            </div>
            <Callout col={C.purple} k="ROLE BOUNDARY">
              The AI synthesizes multi-layer data and proposes — the clinician decides. Decision support, not
              decision replacement.
            </Callout>
          </motion.div>
        )}

        {tab === "feedback" && (
          <motion.div key="feedback" initial={{ opacity:0,y:8 }} animate={{ opacity:1,y:0 }} exit={{ opacity:0 }}>
            <SectionTitle n="05" t="Research & Learning Feedback Loop" badge="CONTINUOUS LEARNING" badgeCol="#94A3B8" />
            <div className="grid gap-3" style={{ gridTemplateColumns: "repeat(auto-fit,minmax(280px,1fr))" }}>
              {FEEDBACK_DETAIL.map(d => (
                <div key={d.tag} className="border p-4" style={{ borderColor: "#94A3B8" + "40", background: C.panel }}>
                  <p className="text-[10px] tracking-[0.2em] mb-2" style={{ color: "#94A3B8" }}>{d.tag}</p>
                  <p className="text-[11px] leading-6" style={{ color: C.text }}>{d.body}</p>
                </div>
              ))}
            </div>
            <Callout col="#94A3B8" k="DATA LAKE → HYPOTHESIS">
              Outcome data flows into a unified repository; AI surfaces patterns; patterns become hypotheses;
              hypotheses become trials; trials feed back into Layer 1. The loop closes.
            </Callout>
          </motion.div>
        )}

        {tab === "translational" && (
          <motion.div key="translational" initial={{ opacity:0,y:8 }} animate={{ opacity:1,y:0 }} exit={{ opacity:0 }}>
            <SectionTitle n="06" t="Key Translational Opportunities" badge="ACTIONABLE" badgeCol={C.gold} />
            <p className="text-[12px] leading-7 mb-3 max-w-3xl">
              Five concrete moves the framework enables. Each is grounded in evidence and respects clinician
              authority.
            </p>
            <div className="grid gap-3" style={{ gridTemplateColumns: "repeat(auto-fit,minmax(280px,1fr))" }}>
              {TRANSLATIONAL.map(t => (
                <div key={t.tag} data-testid={`translational-${t.tag.toLowerCase().replace(/\W+/g, "-")}`} className="border p-4" style={{ borderColor: t.col + "40", background: t.col + "08" }}>
                  <p className="text-[10px] tracking-[0.2em] mb-2" style={{ color: t.col }}>{t.tag}</p>
                  <p className="text-[11px] leading-6" style={{ color: C.text }}>{t.body}</p>
                </div>
              ))}
            </div>
            <Callout col={C.gold} k="SUMMARY">
              The future of cancer research is multi-layered and systemically aware. By combining rigorous
              molecular insights with evidence-bound psychosocial dynamics and AI-driven modeling, adaptive,
              patient-centered treatment frameworks can enhance outcomes <strong>without overstepping causal claims</strong>.
            </Callout>
          </motion.div>
        )}

      </AnimatePresence>

      <div className="mt-12 pt-4 border-t flex justify-between text-[8px] tracking-[0.16em] uppercase" style={{ borderColor: C.border, color: C.dim }}>
        <span>AETHER · Cancer Dynamics · Living System Map</span>
        <span style={{ fontFamily: "serif", fontSize: 14, color: C.pink, fontStyle: "italic" }}>patient-centered · evidence-bound</span>
        <span>5 layers · 1 patient</span>
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

function ConcentricMapSVG() {
  const cx = 260, cy = 260;
  const radii = [50, 100, 155, 210, 248];
  return (
    <svg width="100%" viewBox="0 0 520 520" style={{ maxWidth: 560 }} data-testid="concentric-svg"
         role="img" aria-labelledby="conc-title conc-desc">
      <title id="conc-title">Cancer Dynamics Concentric Living System Map</title>
      <desc id="conc-desc">
        Five concentric layers from tumor biological core outward to research feedback loop, with bidirectional
        arrows representing mechanistic influence (solid) and association (dashed).
      </desc>
      {/* Outer-to-inner layered rings */}
      {LAYERS.slice().reverse().map((L, i) => {
        const r = radii[radii.length - 1 - i];
        return (
          <g key={L.id}>
            <circle cx={cx} cy={cy} r={r} fill={L.col} opacity={0.06 + i*0.02} />
            <circle cx={cx} cy={cy} r={r} fill="none" stroke={L.col + "60"} strokeWidth="1" />
            <text x={cx} y={cy - r + 16} textAnchor="middle" fontSize="9"
                  fill={L.col} fontFamily="Cinzel, serif" letterSpacing="2">{L.n}</text>
          </g>
        );
      })}
      {/* Center label */}
      <text x={cx} y={cy - 4} textAnchor="middle" fontSize="11" fontFamily="Cinzel, serif" fill="#EC4899">TUMOR</text>
      <text x={cx} y={cy + 10} textAnchor="middle" fontSize="9" fill={C.text}>core</text>

      {/* Bidirectional arrows between layers */}
      {[1, 2, 3, 4].map(i => {
        const r1 = radii[i - 1], r2 = radii[i];
        const a = -Math.PI / 2 + (i % 2 === 0 ? 0.6 : -0.6);
        const x1 = cx + Math.cos(a) * r1, y1 = cy + Math.sin(a) * r1;
        const x2 = cx + Math.cos(a) * r2, y2 = cy + Math.sin(a) * r2;
        return (
          <g key={"arr"+i}>
            <line x1={x1} y1={y1} x2={x2} y2={y2} stroke={C.gold} strokeWidth="1.2" markerEnd="url(#arrOut)" />
            <line x1={x2} y1={y2} x2={x1} y2={y1} stroke={C.gold} strokeWidth="1.2" markerEnd="url(#arrIn)" />
          </g>
        );
      })}
      {/* Mental-emotional dashed feedback to tumor (non-causal) */}
      <path d={`M ${cx - 80} ${cy + 80} Q ${cx - 110} ${cy + 30}, ${cx - 30} ${cy + 10}`}
            fill="none" stroke={C.yellow + "80"} strokeWidth="1" strokeDasharray="3,3" />
      <text x={cx - 110} y={cy + 100} fontSize="7" fill={C.yellow} fontFamily="JetBrains Mono">association · not causation</text>

      {/* Outer feedback arc */}
      <path d={`M ${cx + radii[4] - 5} ${cy} A ${radii[4] + 8} ${radii[4] + 8} 0 0 1 ${cx} ${cy + radii[4] + 8}`}
            fill="none" stroke="#94A3B8" strokeWidth="1.5" strokeDasharray="5,3" markerEnd="url(#arrFb)" />
      <text x={cx + 200} y={cy + 60} fontSize="8" fill="#94A3B8" fontFamily="JetBrains Mono">research feedback</text>

      <defs>
        <marker id="arrOut" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto">
          <polygon points="0 0, 6 3, 0 6" fill={C.gold} />
        </marker>
        <marker id="arrIn" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto">
          <polygon points="0 0, 6 3, 0 6" fill={C.gold} />
        </marker>
        <marker id="arrFb" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto">
          <polygon points="0 0, 6 3, 0 6" fill="#94A3B8" />
        </marker>
      </defs>
    </svg>
  );
}
