import { useEffect, useRef, useState } from "react";

const C = {
  ink: "#090e15", ink2: "#0f1822", ink3: "#141f2e",
  border: "rgba(80,130,190,0.13)", border2: "rgba(80,130,190,0.26)",
  teal: "#4a9fc4", tealD: "rgba(74,159,196,0.1)", tealM: "rgba(74,159,196,0.28)",
  gold: "#c9a84c", goldD: "rgba(201,168,76,0.1)", goldM: "rgba(201,168,76,0.32)",
  amber: "#e07b39", amberD: "rgba(224,123,57,0.1)", amberM: "rgba(224,123,57,0.28)",
  green: "#5aab7f", greenD: "rgba(90,171,127,0.09)", greenM: "rgba(90,171,127,0.28)",
  purple: "#8b72c8", purpleD: "rgba(139,114,200,0.1)", purpleM: "rgba(139,114,200,0.28)",
  red: "#c45a6a", redD: "rgba(196,90,106,0.09)", redM: "rgba(196,90,106,0.28)",
  text: "#c8d5e5", textD: "#637a96", textB: "#edf2fa",
  serif: "'Crimson Pro', serif", display: "'Cormorant Garamond', serif", mono: "'DM Mono', monospace",
};

const SECTIONS = [
  { id: "abstract", label: "Abstract" },
  { id: "genetics", label: "Genetics" },
  { id: "nutrition", label: "Nutrition" },
  { id: "bridge", label: "Bridge" },
  { id: "chain", label: "Chain" },
  { id: "spectrum", label: "Spectrum" },
  { id: "synthesis", label: "Synthesis" },
];

function BrainMetabolismCanvas() {
  const ref = useRef<HTMLCanvasElement>(null);
  const rafRef = useRef(0);
  useEffect(() => {
    const canvas = ref.current; if (!canvas) return;
    const ctx = canvas.getContext("2d")!;
    canvas.width = 900; canvas.height = 260;
    const W = canvas.width, H = canvas.height;
    const cx=W/2, cy=H/2;
    const nodes = [
      { label:"GLUCOSE\nINTAKE", col:"#60a5fa", angle:-Math.PI/2, r:110 },
      { label:"ATP\nSYNTH", col:"#fcd34d", angle:-Math.PI/2+Math.PI*2/5, r:110 },
      { label:"NEURO\nTRANS", col:"#a78bfa", angle:-Math.PI/2+Math.PI*4/5, r:110 },
      { label:"MYELIN\nREPAIR", col:"#34d399", angle:-Math.PI/2+Math.PI*6/5, r:110 },
      { label:"COHERE\nFIELD", col:"#2ef0d8", angle:-Math.PI/2+Math.PI*8/5, r:110 },
    ];
    let t=0;
    const draw=()=>{
      ctx.fillStyle="rgba(9,14,21,0.16)"; ctx.fillRect(0,0,W,H);
      t++;
      nodes.forEach((s,i)=>{
        const a=nodes[(i+1)%nodes.length];
        const sx=cx+Math.cos(s.angle)*s.r, sy=cy+Math.sin(s.angle)*s.r;
        const ax=cx+Math.cos(a.angle)*a.r, ay=cy+Math.sin(a.angle)*a.r;
        const pkt=(t*0.01+i*0.4)%1;
        const px=sx+(ax-sx)*pkt, py=sy+(ay-sy)*pkt;
        ctx.beginPath(); ctx.arc(px,py,2.5,0,Math.PI*2);
        ctx.fillStyle="#fff"; ctx.shadowColor="#fff"; ctx.shadowBlur=7; ctx.fill(); ctx.shadowBlur=0;
        const g=ctx.createLinearGradient(sx,sy,ax,ay);
        g.addColorStop(0,s.col+"44"); g.addColorStop(1,a.col+"44");
        ctx.beginPath(); ctx.moveTo(sx,sy); ctx.lineTo(ax,ay);
        ctx.strokeStyle=g; ctx.lineWidth=1; ctx.stroke();
      });
      nodes.forEach((s,i)=>{
        const dx=cx+Math.cos(s.angle)*s.r, dy=cy+Math.sin(s.angle)*s.r;
        const pulse=1+0.1*Math.sin(t*0.04+i*1.25);
        const g=ctx.createRadialGradient(dx,dy,0,dx,dy,16*pulse);
        g.addColorStop(0,s.col+"cc"); g.addColorStop(0.5,s.col+"33"); g.addColorStop(1,"transparent");
        ctx.beginPath(); ctx.arc(dx,dy,14*pulse,0,Math.PI*2);
        ctx.fillStyle=g; ctx.shadowColor=s.col; ctx.shadowBlur=16*pulse; ctx.fill(); ctx.shadowBlur=0;
        ctx.strokeStyle=s.col; ctx.lineWidth=1.5; ctx.stroke();
        ctx.fillStyle=s.col; ctx.font="bold 7px 'DM Mono',monospace"; ctx.textAlign="center";
        s.label.split("\n").forEach((ln,li)=>ctx.fillText(ln,dx,dy+18*pulse+li*9));
      });
      const gc=ctx.createRadialGradient(cx,cy,0,cx,cy,16);
      gc.addColorStop(0,"#4a9fc4cc"); gc.addColorStop(1,"transparent");
      ctx.beginPath(); ctx.arc(cx,cy,14+2*Math.sin(t*0.05),0,Math.PI*2);
      ctx.fillStyle=gc; ctx.shadowColor="#4a9fc4"; ctx.shadowBlur=20; ctx.fill(); ctx.shadowBlur=0;
      ctx.fillStyle="rgba(96,165,250,0.4)"; ctx.font="9px 'DM Mono',monospace"; ctx.textAlign="left";
      ctx.fillText("BRAIN METABOLISM · GLUCOSE INTAKE · ATP SYNTHESIS · NEUROTRANSMITTER · MYELIN REPAIR · COHERENCE",14,18);
      rafRef.current=requestAnimationFrame(draw);
    };
    draw();
    return ()=>cancelAnimationFrame(rafRef.current);
  },[]);
  return <canvas ref={ref} style={{ width:"100%", height:"auto", borderRadius:8, display:"block" }} />;
}

export default function BrainMetabolismView() {
  const [active, setActive] = useState("abstract");
  const [scroll, setScroll] = useState(0);

  useEffect(() => {
    const onScroll = () => {
      const root = document.querySelector("[data-testid='brain-met-root']") as HTMLElement | null;
      if (!root) return;
      const sc = root.scrollTop;
      const max = root.scrollHeight - root.clientHeight;
      setScroll(max > 0 ? (sc / max) * 100 : 0);
      let cur = "abstract";
      for (const s of SECTIONS) {
        const el = document.getElementById(`bm-${s.id}`);
        if (el && el.getBoundingClientRect().top <= 120) cur = s.id;
      }
      setActive(cur);
    };
    const root = document.querySelector("[data-testid='brain-met-root']") as HTMLElement | null;
    root?.addEventListener("scroll", onScroll);
    return () => root?.removeEventListener("scroll", onScroll);
  }, []);

  const scrollTo = (id: string) => {
    const root = document.querySelector("[data-testid='brain-met-root']") as HTMLElement | null;
    const el = document.getElementById(`bm-${id}`);
    if (root && el) root.scrollTo({ top: el.offsetTop - 80, behavior: "smooth" });
  };

  const eyebrow = (txt: string, color: string) => (
    <div style={{ fontFamily: C.mono, fontSize: 9.5, letterSpacing: "0.3em", color, textTransform: "uppercase", marginBottom: 8, opacity: 0.85 }}>{txt}</div>
  );

  const secTitle = (jsx: React.ReactNode) => (
    <h2 style={{ fontFamily: C.display, fontSize: "clamp(22px,3.5vw,36px)", fontWeight: 300, color: C.textB, lineHeight: 1.2, marginBottom: 10 }}>{jsx}</h2>
  );

  const divider = (
    <div style={{ height: 1, background: `linear-gradient(90deg,transparent,${C.border2},transparent)`, margin: "10px 0 32px" }} />
  );

  return (
    <div data-testid="brain-met-root" style={{
      background: C.ink, color: C.text, fontFamily: C.serif, lineHeight: 1.7,
      backgroundImage: `radial-gradient(ellipse 1200px 500px at 50% 0%, rgba(74,159,196,0.05) 0%, transparent 70%),
                        radial-gradient(ellipse 600px 500px at 95% 40%, rgba(139,114,200,0.04) 0%, transparent 60%),
                        radial-gradient(ellipse 500px 400px at 5% 70%, rgba(201,168,76,0.03) 0%, transparent 60%)`,
      minHeight: "100%", height: "100%", overflowY: "auto", overflowX: "hidden", position: "relative", scrollBehavior: "smooth",
    }}>
      <div style={{ padding:"16px 20px 0" }}>
        <div style={{ display:"inline-block", background:"rgba(96,165,250,0.07)", border:"1px solid rgba(96,165,250,0.22)",
          borderRadius:8, padding:"0.3rem 1rem", fontSize:"0.7rem", letterSpacing:"0.2em",
          color:"#60a5fa", textTransform:"uppercase", fontFamily:C.mono, marginBottom:12 }}>
          Live Simulation
        </div>
        <div style={{ background:"rgba(9,14,21,0.9)", border:"1px solid rgba(96,165,250,0.1)",
          borderLeft:"3px solid #60a5fa", borderRadius:10, padding:20, marginBottom:16 }}>
          <h2 style={{ fontFamily:C.serif, fontSize:18, color:"#e0f0ff", margin:"0 0 6px" }}>
            Brain Metabolism · Glucose Intake · ATP Synthesis · Neurotransmitter · Myelin Repair · Coherence
          </h2>
          <p style={{ fontFamily:C.mono, fontSize:12, color:"rgba(150,200,240,0.45)", margin:"0 0 14px", lineHeight:1.65 }}>
            Five brain metabolism nodes (Glucose Intake/blue · ATP Synthesis/yellow · Neurotransmitter/violet · Myelin
            Repair/teal · Coherence Field/mint) in a pentagonal ring with metabolic flow packets cycling between each
            system — the live AETHER brain metabolism engine.
          </p>
          <BrainMetabolismCanvas />
        </div>
      </div>

      {/* progress */}
      <div style={{ position: "sticky", top: 0, height: 2, zIndex: 99, background: `linear-gradient(90deg,${C.teal},${C.purple},${C.gold})`, width: scroll + "%", transition: "width .1s linear" }} />

      {/* nav */}
      <nav style={{ position: "sticky", top: 2, zIndex: 100, background: "rgba(9,14,21,0.92)", backdropFilter: "blur(12px)", borderBottom: `1px solid ${C.border}`, padding: "0 32px", display: "flex", alignItems: "center", justifyContent: "space-between", height: 52 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ width: 22, height: 22, background: `linear-gradient(135deg,${C.teal},${C.purple})`, clipPath: "polygon(50% 0%,100% 25%,100% 75%,50% 100%,0% 75%,0% 25%)", animation: "bmHexPulse 4s ease-in-out infinite" }} />
          <span style={{ fontFamily: C.mono, fontSize: 10, letterSpacing: "0.35em", color: C.textD, textTransform: "uppercase" }}>AETHER · Brain-First Metabolism</span>
        </div>
        <div style={{ display: "flex", gap: 4 }}>
          {SECTIONS.map((s) => (
            <button key={s.id} data-testid={`bm-toc-${s.id}`} onClick={() => scrollTo(s.id)} style={{ fontFamily: C.mono, fontSize: 9, letterSpacing: "0.15em", textTransform: "uppercase", color: active === s.id ? C.teal : C.textD, background: active === s.id ? C.tealD : "transparent", textDecoration: "none", padding: "6px 10px", borderRadius: 2, border: "none", cursor: "pointer", transition: "color .2s, background .2s" }}>{s.label}</button>
          ))}
        </div>
        <div style={{ fontFamily: C.mono, fontSize: 9, color: C.textD, border: `1px solid ${C.border}`, padding: "3px 9px", borderRadius: 2, letterSpacing: "0.1em" }}>v2.0</div>
      </nav>

      <div style={{ maxWidth: 1040, margin: "0 auto", padding: "60px 40px 80px" }}>

        {/* HERO */}
        <section style={{ paddingBottom: 20 }}>
          {eyebrow("AETHER Research · Brain-First Metabolism", C.teal)}
          <h1 style={{ fontFamily: C.display, fontSize: "clamp(36px,6vw,72px)", fontWeight: 300, color: C.textB, lineHeight: 1.08, letterSpacing: "-0.01em", marginBottom: 16 }}>
            One Neural<br /><em style={{ fontStyle: "italic", color: C.gold }}>Signaling Crisis.</em><br />
            <span style={{ color: C.teal }}>Two Symptoms.</span>
          </h1>
          <p style={{ fontSize: 18, fontWeight: 300, color: C.textD, lineHeight: 1.65, maxWidth: 680, marginBottom: 36 }}>
            A unified neuro-metabolic framework connecting the genetics of obesity, the neuroscience of appetite regulation, and the antimicrobial protection hypothesis of Alzheimer's disease — through a single shared substrate: the brain's biochemical environment.
          </p>
          <div style={{ display: "flex", gap: 24, flexWrap: "wrap", paddingTop: 20, borderTop: `1px solid ${C.border}` }}>
            {[
              ["Framework", "Neuro-Metabolic-Immune"],
              ["Core Genes", "FTO · MC4R · BDNF"],
              ["Intervention", "Whole Food Biochemistry"],
              ["Status", "Theoretical Synthesis · v2.0"],
            ].map(([a, b]) => (
              <div key={a} style={{ fontFamily: C.mono, fontSize: 10, letterSpacing: "0.15em", color: C.textD, textTransform: "uppercase" }}>
                {a}<span style={{ color: C.text, display: "block", marginTop: 2 }}>{b}</span>
              </div>
            ))}
          </div>
        </section>

        {/* ABSTRACT */}
        <section id="bm-abstract" style={{ paddingTop: 70 }}>
          {eyebrow("Abstract", C.teal)}
          <div style={{ background: C.ink3, border: `1px solid ${C.border2}`, borderRadius: 3, padding: "32px 36px", marginBottom: 40, position: "relative", overflow: "hidden" }}>
            <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 2, background: `linear-gradient(90deg,${C.teal},${C.purple},${C.gold})` }} />
            <div style={{ fontFamily: C.mono, fontSize: 9, letterSpacing: "0.3em", textTransform: "uppercase", color: C.teal, marginBottom: 14 }}>Unified Framework Summary</div>
            <p style={{ fontSize: 15.5, lineHeight: 1.75, color: C.text, fontWeight: 300, marginBottom: 14 }}>
              Large-scale GWAS have established that <strong style={{ color: C.textB }}>most genetic variants linked to obesity act within neural circuits</strong> — not in adipose tissue. The primary sites of dysfunction are the hypothalamus, brainstem metabolic circuits, and dopaminergic reward pathways. This repositions metabolic health as a fundamentally neurological problem governed by three key genes: <strong style={{ color: C.textB }}>FTO</strong>, <strong style={{ color: C.textB }}>MC4R</strong>, and <strong style={{ color: C.textB }}>BDNF</strong>.
            </p>
            <p style={{ fontSize: 15.5, lineHeight: 1.75, color: C.text, fontWeight: 300, marginBottom: 14 }}>
              The AETHER framework extends this reframing by identifying a second consequence of the same neural instability: <strong style={{ color: C.textB }}>activation of the brain's antimicrobial defense system</strong>. Chronic neuroinflammation triggers the amyloid aggregation response. The Alzheimer's pathology that results is not a primary disease but a <strong style={{ color: C.textB }}>chronic immune overcorrection</strong> triggered by metabolic failure.
            </p>
            <p style={{ fontSize: 15.5, lineHeight: 1.75, color: C.text, fontWeight: 300 }}>
              Whole foods provide the biochemical inputs needed to <strong style={{ color: C.textB }}>restore signal clarity across both systems simultaneously</strong>. The intervention target is not symptoms — it is the neural environment itself.
            </p>
          </div>
        </section>

        {/* GENETICS */}
        <section id="bm-genetics" style={{ paddingTop: 70 }}>
          {eyebrow("Section I", C.amber)}
          {secTitle(<>The Genetic Architecture of <em style={{ fontStyle: "italic" }}>Brain-Centered Metabolism</em></>)}
          {divider}
          <p style={{ fontSize: 16, fontWeight: 300, color: C.textD, lineHeight: 1.7, maxWidth: 720, marginBottom: 32 }}>
            The traditional model positioned adipose tissue as the primary locus of metabolic dysfunction. Genomic evidence has systematically dismantled this view. The control system is neural — and three genes form its core.
          </p>

          {/* gene flow */}
          <div style={{ display: "flex", alignItems: "center", gap: 0, background: C.ink2, border: `1px solid ${C.border}`, borderRadius: 3, padding: 24, marginBottom: 24, overflowX: "auto" }}>
            {[
              { lab: "FTO", role: "Reward\nModulator", sub: "dopamine\nsensitivity", color: C.amber, bg: C.amberD },
              { lab: "MC4R", role: "Satiety\nSwitch", sub: "hypothalamic\nfullness", color: C.teal, bg: C.tealD },
              { lab: "BDNF", role: "Plasticity\nEngine", sub: "energy\nhomeostasis", color: C.green, bg: C.greenD },
              { lab: "SET\nPOINT", role: "Metabolic\nEquilibrium", sub: "nutrition +\nstress", color: C.gold, bg: C.goldD, small: true },
            ].flatMap((n, i, arr) => {
              const node = (
                <div key={n.lab} data-testid={`bm-flow-${n.lab.toLowerCase().replace(/[^a-z]/g, "")}`} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8, minWidth: 100 }}>
                  <div style={{ width: 52, height: 52, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: C.mono, fontSize: n.small ? 9 : 11, fontWeight: 500, border: `1.5px solid ${n.color}`, background: n.bg, color: n.color, textAlign: "center", lineHeight: 1.2, whiteSpace: "pre-line" }}>{n.lab}</div>
                  <div style={{ fontFamily: C.mono, fontSize: 9, letterSpacing: "0.1em", textTransform: "uppercase", color: C.textD, textAlign: "center", lineHeight: 1.4, whiteSpace: "pre-line" }}>{n.role}</div>
                  <div style={{ fontSize: 11, fontStyle: "italic", color: C.textD, textAlign: "center", lineHeight: 1.3, fontFamily: C.serif, whiteSpace: "pre-line" }}>{n.sub}</div>
                </div>
              );
              if (i < arr.length - 1) {
                return [node, <div key={`l-${i}`} style={{ flex: 1, height: 1, minWidth: 16, background: `linear-gradient(90deg,${C.tealM},${C.goldM})` }} />];
              }
              return [node];
            })}
          </div>

          {/* gene cards */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 14, marginBottom: 32 }}>
            {[
              { tag: "FTO", role: "The Reward Modulator", desc: "Governs dopamine reward pathway sensitivity and hunger signaling. When dysregulated, it shifts behavior toward hedonic eating — seeking food for pleasure rather than metabolic need.", c: C.amber },
              { tag: "MC4R", role: "The Satiety Switch", desc: "Master regulator of satiety signaling within the hypothalamus. Mutations effectively silence the neural signal communicating fullness — not increased fat storage.", c: C.teal },
              { tag: "BDNF", role: "The Plasticity Engine", desc: "Sustains neuronal health and synaptic plasticity. Critically, BDNF is the hinge gene: connecting metabolic regulation to immune defense.", c: C.green },
            ].map((g) => (
              <div key={g.tag} data-testid={`bm-gene-${g.tag.toLowerCase()}`} style={{ background: C.ink2, border: `1px solid ${C.border}`, borderRadius: 3, padding: "22px 20px", position: "relative", overflow: "hidden" }}>
                <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 2, background: g.c, opacity: 0.7 }} />
                <div style={{ fontFamily: C.mono, fontSize: 22, fontWeight: 500, color: g.c, marginBottom: 3 }}>{g.tag}</div>
                <div style={{ fontFamily: C.mono, fontSize: 9, letterSpacing: "0.2em", textTransform: "uppercase", color: C.textD, marginBottom: 14 }}>{g.role}</div>
                <div style={{ fontSize: 13.5, lineHeight: 1.6, color: C.text, fontWeight: 300 }}>{g.desc}</div>
              </div>
            ))}
          </div>

          <div style={{ background: C.ink3, borderLeft: `3px solid ${C.teal}`, padding: "18px 22px", marginBottom: 28, borderRadius: "0 3px 3px 0" }}>
            <div style={{ fontFamily: C.mono, fontSize: 9, letterSpacing: "0.25em", textTransform: "uppercase", marginBottom: 8, color: C.teal }}>Reframe</div>
            <p style={{ fontSize: 15, lineHeight: 1.7, color: C.text, fontWeight: 300 }}>
              Targeting adipose tissue addresses a downstream consequence. The upstream failure is in neural signaling. <em style={{ color: C.textB, fontStyle: "italic" }}>Weight gain is what happens when the brain loses the ability to accurately regulate appetite — not a primary failure of fat metabolism.</em>
            </p>
          </div>
        </section>

        {/* NUTRITION */}
        <section id="bm-nutrition" style={{ paddingTop: 70 }}>
          {eyebrow("Section II", C.green)}
          {secTitle(<>Nutritional Regulation of <em style={{ fontStyle: "italic" }}>Brain Biochemistry</em></>)}
          {divider}
          <p style={{ fontSize: 16, fontWeight: 300, color: C.textD, lineHeight: 1.7, maxWidth: 720, marginBottom: 32 }}>
            The brain requires four continuous inputs to maintain accurate metabolic signaling. Whole foods provide these; ultra-processed foods systematically disrupt them.
          </p>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(2,1fr)", gap: 12, marginBottom: 28 }}>
            {[
              { icon: "🌿", name: "Glucose Stabilization", desc: "Root vegetables (potatoes, sweet potatoes, beets, carrots) provide slow-release carbohydrates maintaining the continuous glucose supply hypothalamic neurons require.", tags: [["MC4R pathway", C.teal, C.tealD, C.tealM], ["hypothalamus", C.amber, C.amberD, C.amberM]] },
              { icon: "⚗️", name: "Microbiome Signaling", desc: "Prebiotic fibers feed colonic bacteria that produce SCFAs. SCFAs signal via vagal afferents to the hypothalamus — reinforcing satiety pathways.", tags: [["MC4R pathway", C.teal, C.tealD, C.tealM], ["immune tone", C.purple, C.purpleD, C.purpleM]] },
              { icon: "🫐", name: "Neuroplasticity Support", desc: "Flavonoids from cacao and berries are associated with BDNF upregulation in preclinical models — supporting hippocampal neuroplasticity.", tags: [["BDNF", C.green, C.greenD, C.greenM], ["neuroprotection", C.purple, C.purpleD, C.purpleM]] },
              { icon: "🔥", name: "Anti-Inflammatory Load", desc: "Polyphenols from turmeric (curcuminoids), olive oil (oleocanthal), and green tea (EGCG) modulate NF-κB signaling — keeping the brain's immune tone calm.", tags: [["NF-κB", C.gold, C.goldD, C.goldM], ["immune calm", C.purple, C.purpleD, C.purpleM]] },
            ].map((it) => (
              <div key={it.name} style={{ background: C.ink2, border: `1px solid ${C.border}`, borderRadius: 3, padding: "18px 18px", display: "flex", gap: 14, alignItems: "flex-start" }}>
                <div style={{ fontSize: 20, flexShrink: 0, paddingTop: 2 }}>{it.icon}</div>
                <div>
                  <div style={{ fontFamily: C.mono, fontSize: 9.5, letterSpacing: "0.18em", textTransform: "uppercase", color: C.gold, marginBottom: 5 }}>{it.name}</div>
                  <div style={{ fontSize: 13.5, lineHeight: 1.55, color: C.text, fontWeight: 300 }}>{it.desc}</div>
                  <div style={{ marginTop: 8, display: "flex", flexWrap: "wrap", gap: 5 }}>
                    {it.tags.map(([t, col, bg, brd]) => (
                      <span key={t} style={{ fontFamily: C.mono, fontSize: 8, padding: "2px 6px", borderRadius: 2, background: bg, color: col, border: `1px solid ${brd}` }}>{t}</span>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* BRIDGE */}
        <section id="bm-bridge" style={{ paddingTop: 70 }}>
          {eyebrow("Section III · NMI Bridge", C.purple)}
          {secTitle(<>The Intersection of <em style={{ fontStyle: "italic" }}>Metabolism &amp; Defense</em></>)}
          {divider}

          {/* BDNF dual link */}
          <div style={{ background: C.ink3, border: `1px solid ${C.border2}`, borderRadius: 3, padding: "20px 24px", marginBottom: 24, display: "grid", gridTemplateColumns: "1fr 1px 1fr", gap: 20, position: "relative" }}>
            <div style={{ position: "absolute", top: -9, left: "50%", transform: "translateX(-50%)", fontFamily: C.mono, fontSize: 9, letterSpacing: "0.25em", color: C.green, background: C.ink3, padding: "0 12px", textTransform: "uppercase" }}>BDNF — DUAL LINK</div>
            <div>
              <strong style={{ display: "block", fontFamily: C.mono, fontSize: 9.5, color: C.green, letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: 6 }}>Metabolic Function</strong>
              <p style={{ fontSize: 13.5, lineHeight: 1.6, color: C.text, fontWeight: 300 }}>Regulates energy balance, voluntary activity levels, and metabolic efficiency. Low BDNF expression reduces the brain's adaptive response to caloric intake.</p>
            </div>
            <div style={{ background: C.border, alignSelf: "stretch" }} />
            <div>
              <strong style={{ display: "block", fontFamily: C.mono, fontSize: 9.5, color: C.green, letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: 6 }}>Immune / Structural</strong>
              <p style={{ fontSize: 13.5, lineHeight: 1.6, color: C.text, fontWeight: 300 }}>Supports hippocampal neuroplasticity. Insufficient BDNF weakens the brain's "structural integrity" — increasing susceptibility to defensive amyloid aggregation.</p>
            </div>
          </div>

          {/* Two-col bridge */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 60px 1fr", border: `1px solid ${C.border}`, borderRadius: 3, overflow: "hidden", marginBottom: 24 }}>
            <div style={{ padding: "24px 22px", background: `linear-gradient(160deg,rgba(74,159,196,0.06),transparent)` }}>
              <div style={{ fontFamily: C.mono, fontSize: 9, letterSpacing: "0.25em", textTransform: "uppercase", marginBottom: 16, paddingBottom: 8, borderBottom: `1px solid ${C.border}`, color: C.teal }}>Metabolic System</div>
              {[
                ["Hypothalamic Sensitivity", "The hypothalamus regulates hunger and satiety — and is simultaneously highly responsive to systemic inflammation. Chronic stress can mimic pathogen detection."],
                ["Brain Insulin Resistance", "Persistent glucose spikes impair neuronal insulin signaling. Reduces mitochondrial efficiency and limits energy available for immune regulation."],
                ["Gut-Brain Disconnect", "Loss of SCFA-producing microbiota removes the primary 'calm' signal to hypothalamic immune circuits — leaving them persistently sensitized."],
              ].map(([n, d]) => (
                <div key={n} style={{ marginBottom: 16 }}>
                  <div style={{ fontFamily: C.mono, fontSize: 10.5, fontWeight: 500, letterSpacing: "0.06em", marginBottom: 4, color: C.teal }}>{n}</div>
                  <div style={{ fontSize: 13, lineHeight: 1.55, color: C.textD, fontWeight: 300 }}>{d}</div>
                </div>
              ))}
            </div>
            <div style={{ background: C.ink3, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 10, borderLeft: `1px solid ${C.border}`, borderRight: `1px solid ${C.border}` }}>
              <div style={{ writingMode: "vertical-lr", fontFamily: C.mono, fontSize: 8, letterSpacing: "0.2em", color: C.textD, textTransform: "uppercase" }}>Overlap</div>
              <div style={{ fontSize: 22, opacity: 0.8 }}>⟷</div>
              <div style={{ writingMode: "vertical-lr", fontFamily: C.mono, fontSize: 8, letterSpacing: "0.2em", color: C.textD, textTransform: "uppercase" }}>Zone</div>
            </div>
            <div style={{ padding: "24px 22px", background: `linear-gradient(200deg,rgba(139,114,200,0.06),transparent)` }}>
              <div style={{ fontFamily: C.mono, fontSize: 9, letterSpacing: "0.25em", textTransform: "uppercase", marginBottom: 16, paddingBottom: 8, borderBottom: `1px solid ${C.border}`, color: C.purple }}>Immune / Defense</div>
              {[
                ["BBB Permeability", "Systemic inflammation increases blood-brain barrier permeability, exposing neural tissue to inflammatory molecules the immune system reads as threats."],
                ["Amyloid as Defense", "The Antimicrobial Protection Hypothesis positions amyloid-beta as a first-responder 'trap' — not a primary cause but a self-destructive immune response."],
                ["Tau Tangle Formation", "Downstream of chronic amyloid response. Tau hyperphosphorylation marks the transition from acute defense to network collapse."],
              ].map(([n, d]) => (
                <div key={n} style={{ marginBottom: 16 }}>
                  <div style={{ fontFamily: C.mono, fontSize: 10.5, fontWeight: 500, letterSpacing: "0.06em", marginBottom: 4, color: C.purple }}>{n}</div>
                  <div style={{ fontSize: 13, lineHeight: 1.55, color: C.textD, fontWeight: 300 }}>{d}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CHAIN */}
        <section id="bm-chain" style={{ paddingTop: 70 }}>
          {eyebrow("Section IV", C.red)}
          {secTitle(<>The Integrated Disease Chain</>)}
          {divider}
          <div style={{ border: `1px solid ${C.border}`, borderRadius: 3, overflow: "hidden", marginBottom: 28 }}>
            <div style={{ display: "grid", gridTemplateColumns: "130px 1fr 1fr", background: C.ink3, borderBottom: `1px solid ${C.border}` }}>
              {["Stage", "Metabolic Context", "Immune / Defense"].map((h) => (
                <div key={h} style={{ padding: "10px 14px", fontFamily: C.mono, fontSize: 9, letterSpacing: "0.22em", textTransform: "uppercase", color: C.textD, borderRight: `1px solid ${C.border}` }}>{h}</div>
              ))}
            </div>
            {[
              ["Initial Stress", C.teal, C.tealD, C.tealM, "High-glucose spikes and absence of fiber matrix disrupt hypothalamic signaling baseline.", "Increased blood-brain barrier permeability; low-grade systemic inflammation enters neural tissue."],
              ["Trigger", C.amber, C.amberD, C.amberM, "Loss of gut-brain signaling — reduced SCFA production removes the primary 'calm' signal.", "Detection of systemic inflammation as a pathogen 'threat.' Amyloid polymerization initiates."],
              ["Defense", C.purple, C.purpleD, C.purpleM, "Insulin resistance in the brain; mitochondrial efficiency drops; neuronal energy supply restricted.", "Amyloid plaques trap inflammatory stressors. Response becomes self-sustaining."],
              ["Degeneration", C.red, C.redD, C.redM, "Mitochondrial failure cascade. BDNF levels collapse. Metabolic-neural feedback loop breaks down.", "Tau tangles form; chronic neuroinflammation leads to network failure. Symptom onset of cognitive decline."],
            ].map(([stage, col, bg, brd, meta, immune]) => (
              <div key={stage as string} data-testid={`bm-chain-${(stage as string).toLowerCase().replace(/\s+/g, "-")}`} style={{ display: "grid", gridTemplateColumns: "130px 1fr 1fr", borderBottom: `1px solid ${C.border}` }}>
                <div style={{ padding: "13px 14px", borderRight: `1px solid ${C.border}`, fontSize: 13.5, lineHeight: 1.5 }}>
                  <span style={{ display: "inline-block", fontFamily: C.mono, fontSize: 9, padding: "3px 8px", borderRadius: 2, fontWeight: 500, letterSpacing: "0.05em", background: bg as string, color: col as string, border: `1px solid ${brd}` }}>{stage}</span>
                </div>
                <div style={{ padding: "13px 14px", borderRight: `1px solid ${C.border}`, fontSize: 13, color: C.text, fontWeight: 300, lineHeight: 1.5 }}>{meta}</div>
                <div style={{ padding: "13px 14px", fontSize: 13, color: C.textD, fontWeight: 300, fontStyle: "italic", lineHeight: 1.5 }}>{immune}</div>
              </div>
            ))}
          </div>
        </section>

        {/* SPECTRUM */}
        <section id="bm-spectrum" style={{ paddingTop: 70 }}>
          {eyebrow("Section V · Xenohormesis", C.gold)}
          {secTitle(<>The Bioactive <em style={{ fontStyle: "italic" }}>Color Hierarchy</em></>)}
          {divider}
          <div style={{ background: C.ink3, border: `1px solid ${C.border}`, borderRadius: 3, padding: "22px 24px", marginBottom: 24 }}>
            <div style={{ fontFamily: C.mono, fontSize: 9, letterSpacing: "0.25em", textTransform: "uppercase", color: C.gold, marginBottom: 8 }}>Xenohormesis Principle</div>
            <div style={{ fontFamily: C.display, fontSize: 17, fontWeight: 400, color: C.textB, marginBottom: 10, lineHeight: 1.3 }}>Plant stress signals as adaptive inputs</div>
            <div style={{ fontSize: 13.5, lineHeight: 1.65, color: C.text, fontWeight: 300 }}>
              Plants synthesize pigments as defense mechanisms against UV, oxidative stress, and pathogen pressure. When ingested, these compounds interact with mammalian cellular stress-response pathways. The hypothesis (Howitz &amp; Sinclair 2004) suggests organisms evolved to use environmental plant stress signals as predictive indicators of resource scarcity.
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(5,1fr)", gap: 10, marginBottom: 28 }}>
            {[
              { sw: "🫐", n: "Deep Purple", pg: "Anthocyanins", tg: "BDNF · Memory", c: C.purple, bg: C.purpleD, brd: C.purpleM, d: "Hippocampal neuroplasticity support; BDNF upregulation in animal models." },
              { sw: "🌿", n: "Gold/Yellow", pg: "Curcuminoids", tg: "NF-κB", c: C.gold, bg: C.goldD, brd: C.goldM, d: "Inhibits NF-κB signaling; reduces chronic inflammation activating amyloid defense." },
              { sw: "🍅", n: "Deep Red", pg: "Lycopene · Betalains", tg: "Vascular", c: C.red, bg: C.redD, brd: C.redM, d: "Supports nitric oxide; cerebral perfusion; metabolic waste clearance." },
              { sw: "🥔", n: "Earth Tones", pg: "Resistant Starch", tg: "MC4R · Gut-Brain", c: "#c0a070", bg: "rgba(160,120,64,0.1)", brd: "rgba(160,120,64,0.3)", d: "Feeds SCFA-producing microbiota signaling satiety to hypothalamus." },
              { sw: "🥬", n: "Dark Green", pg: "Chlorophyll · Lutein", tg: "Mitochondria", c: C.green, bg: C.greenD, brd: C.greenM, d: "Folate and magnesium for mitochondrial energy cycle. Lutein concentrates in macula." },
            ].map((cc) => (
              <div key={cc.n} data-testid={`bm-color-${cc.n.toLowerCase().split(/[\s\/]/)[0]}`} style={{ background: C.ink2, border: `1px solid ${C.border}`, borderRadius: 3, padding: "16px 14px", position: "relative", overflow: "hidden" }}>
                <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 3, background: cc.c }} />
                <div style={{ width: 32, height: 32, borderRadius: "50%", marginBottom: 10, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, background: cc.bg, border: `1.5px solid ${cc.brd}` }}>{cc.sw}</div>
                <div style={{ fontFamily: C.mono, fontSize: 9.5, fontWeight: 500, letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 3, color: cc.c }}>{cc.n}</div>
                <div style={{ fontFamily: C.mono, fontSize: 8.5, color: C.textD, marginBottom: 8, letterSpacing: "0.03em" }}>{cc.pg}</div>
                <div style={{ fontFamily: C.mono, fontSize: 8, padding: "2px 6px", borderRadius: 2, marginBottom: 8, display: "inline-block", letterSpacing: "0.05em", background: cc.bg, color: cc.c, border: `1px solid ${cc.brd}` }}>{cc.tg}</div>
                <div style={{ fontSize: 12, lineHeight: 1.5, color: C.textD, fontWeight: 300 }}>{cc.d}</div>
              </div>
            ))}
          </div>
        </section>

        {/* SYNTHESIS */}
        <section id="bm-synthesis" style={{ paddingTop: 70 }}>
          {eyebrow("AETHER Synthesis", C.teal)}
          {secTitle(<>Resonance Between Systems</>)}
          {divider}
          <div style={{ background: `linear-gradient(135deg,rgba(139,114,200,0.08),rgba(74,159,196,0.06))`, border: `1px solid ${C.border2}`, borderRadius: 3, padding: "32px 36px", marginBottom: 16, position: "relative", overflow: "hidden" }}>
            <div style={{ position: "absolute", bottom: 0, right: 0, width: 300, height: 300, borderRadius: "50%", background: "radial-gradient(rgba(139,114,200,0.06),transparent)", pointerEvents: "none" }} />
            <div style={{ fontFamily: C.mono, fontSize: 9, letterSpacing: "0.3em", textTransform: "uppercase", color: C.teal, marginBottom: 14 }}>Universe-Winner Frame</div>
            <div style={{ fontFamily: C.display, fontSize: "clamp(17px,2.5vw,23px)", fontStyle: "italic", color: C.textB, lineHeight: 1.55, fontWeight: 300, marginBottom: 16 }}>
              "Alzheimer's and metabolic dysfunction are not two different problems. They are two different symptoms of a neural signaling crisis — one presenting first as appetite dysregulation, the other as immune overdrive. The same biochemical environment that allows FTO/MC4R/BDNF circuits to function accurately is the same environment that keeps the amyloid defense system dormant."
            </div>
            <div style={{ fontSize: 12.5, color: C.textD, fontStyle: "italic", lineHeight: 1.6, paddingTop: 14, borderTop: `1px solid ${C.border}` }}>
              Note: Theoretical framework integrating well-supported individual mechanisms. The causal chain from metabolic dysfunction to Alzheimer's pathology is an active research area; this is hypothesis-generating, not clinically established. The Antimicrobial Protection Hypothesis (Moir, Tanzi et al.) remains debated, though mechanistic evidence has grown substantially since 2010.
            </div>
          </div>

          <div style={{ borderTop: `1px solid ${C.border}`, padding: "28px 0", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 16, marginTop: 40 }}>
            <div style={{ fontFamily: C.mono, fontSize: 9, letterSpacing: "0.25em", color: C.textD, textTransform: "uppercase" }}>AETHER · Brain-First Metabolism v2.0 · NMI-Bridge v1.0</div>
            <div style={{ fontFamily: C.mono, fontSize: 9, color: C.textD, maxWidth: 400, lineHeight: 1.6 }}>The intervention target is not symptoms — it is the neural environment itself.</div>
          </div>
        </section>

      </div>
      <style>{`@keyframes bmHexPulse { 0%,100% { opacity: 1; } 50% { opacity: 0.55; } }`}</style>
    </div>
  );
}
