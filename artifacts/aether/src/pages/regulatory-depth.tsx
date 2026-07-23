import { useEffect, useRef, useState } from "react";
const imgChromatin = "/api/storage/public-objects/Gemini_Generated_Image_f4nig2f4nig2f4ni_1782734452851.png";
const imgMethylation = "/api/storage/public-objects/Gemini_Generated_Image_nkbtawnkbtawnkbt_1782734530065.png";
const imgSynthesis = "/api/storage/public-objects/image_1782734551897.png";
const imgSplicing = "/api/storage/public-objects/image_1782209675669.jpeg";
const imgTweet = "/api/storage/public-objects/image_1782209692388.png";
/* ── palette ─────────────────────────────────── */
const BG   = "#040508";
const TEAL = "#1fd4c8";
const GOLD = "#c9a84c";
const VIO  = "#8b5cf6";
const GRN  = "#22c55e";
const PINK = "#ec4899";
const BLUE = "#3b82f6";
const ORG  = "#f97316";
const DIM  = "#374858";
const MN   = "'Space Mono', monospace";
const OR   = "'Orbitron', sans-serif";

/* ── animated feedback loop canvas ───────────── */
function FeedbackCanvas() {
  const ref = useRef<HTMLCanvasElement>(null);
  const raf = useRef(0);
  useEffect(() => {
    const cv = ref.current; if (!cv) return;
    const ctx = cv.getContext("2d")!;
    cv.width = 600; cv.height = 200;
    const W = cv.width, H = cv.height;
    const systems = [
      { label:"Immune",    col:"#ef4444", x:0.15, y:0.5 },
      { label:"Neural",    col:BLUE,       x:0.42, y:0.2 },
      { label:"Hormonal",  col:GOLD,       x:0.70, y:0.5 },
      { label:"Metabolic", col:GRN,        x:0.42, y:0.8 },
    ];
    const links = [[0,1],[1,2],[2,3],[3,0],[0,2],[1,3]];
    let t = 0;
    const draw = () => {
      ctx.fillStyle = BG; ctx.fillRect(0, 0, W, H);
      links.forEach(([a, b]) => {
        const sa = systems[a], sb = systems[b];
        const ax = sa.x*W, ay = sa.y*H, bx = sb.x*W, by = sb.y*H;
        const pulse = 0.25 + 0.2*Math.sin(t*0.035 + a*0.9);
        ctx.beginPath(); ctx.moveTo(ax, ay); ctx.lineTo(bx, by);
        ctx.strokeStyle = sa.col + Math.round(pulse*255).toString(16).padStart(2,"0");
        ctx.lineWidth = 1; ctx.stroke();
        // packet
        const frac = ((t*0.014 + a*0.25) % 1);
        ctx.beginPath(); ctx.arc(ax+(bx-ax)*frac, ay+(by-ay)*frac, 2.5, 0, Math.PI*2);
        ctx.fillStyle = sa.col; ctx.fill();
      });
      systems.forEach((s, i) => {
        const nx = s.x*W, ny = s.y*H;
        const pulse = 0.7 + 0.3*Math.sin(t*0.04+i*1.1);
        const g = ctx.createRadialGradient(nx,ny,0,nx,ny,28*pulse);
        g.addColorStop(0, s.col+"88"); g.addColorStop(1, s.col+"00");
        ctx.beginPath(); ctx.arc(nx,ny,28*pulse,0,Math.PI*2); ctx.fillStyle=g; ctx.fill();
        ctx.beginPath(); ctx.arc(nx,ny,18,0,Math.PI*2);
        ctx.fillStyle=s.col+"33"; ctx.strokeStyle=s.col+"cc"; ctx.lineWidth=1.5;
        ctx.fill(); ctx.stroke();
        ctx.fillStyle=s.col+"ee"; ctx.font="bold 8px Space Mono"; ctx.textAlign="center";
        ctx.fillText(s.label, nx, ny+3);
      });
      t++; raf.current = requestAnimationFrame(draw);
    };
    draw();
    return () => cancelAnimationFrame(raf.current);
  }, []);
  return <canvas ref={ref} style={{ width:"100%", height:"auto", borderRadius:4, display:"block" }} />;
}

/* ── ncRNA interactive card ───────────────────── */
function NcRnaCard({ type, size, count, targets, col, desc }:
  { type:string; size:string; count:string; targets:string; col:string; desc:string }) {
  const [hov, setHov] = useState(false);
  return (
    <div onMouseEnter={()=>setHov(true)} onMouseLeave={()=>setHov(false)}
      style={{ background: hov ? `${col}14` : "rgba(0,0,0,0.35)",
        border:`1px solid ${col}${hov?"99":"33"}`, borderRadius:4,
        padding:"10px 12px", transition:"all .2s", cursor:"default" }}>
      <div style={{ fontFamily:OR, fontSize:10, color:col, marginBottom:4 }}>{type}</div>
      <div style={{ fontFamily:MN, fontSize:7.5, color:col+"88", marginBottom:6, lineHeight:1.8 }}>
        {size} · {count} known · targets: {targets}
      </div>
      <div style={{ fontSize:10.5, color:"rgba(190,205,225,0.65)", lineHeight:1.65 }}>{desc}</div>
    </div>
  );
}

/* ── framed diagram plate ─────────────────────── */
function Plate({ src, alt, col, label, caption }:
  { src:string; alt:string; col:string; label:string; caption:string }) {
  return (
    <figure style={{ margin:0, borderRadius:7, overflow:"hidden",
      border:`1px solid ${col}55`, background:"#05070b",
      boxShadow:`0 0 34px ${col}1f, inset 0 0 0 1px ${col}11` }}>
      <img src={src} alt={alt} loading="lazy" style={{ width:"100%", display:"block" }} />
      <figcaption style={{ padding:"10px 14px", borderTop:`1px solid ${col}26`,
        background:`linear-gradient(180deg, ${col}0a, transparent)` }}>
        <div style={{ fontFamily:MN, fontSize:8, color:col, letterSpacing:"0.16em", marginBottom:5 }}>{label}</div>
        <div style={{ fontSize:10.5, color:"rgba(200,210,228,0.68)", lineHeight:1.62 }}>{caption}</div>
      </figcaption>
    </figure>
  );
}

/* ── diagram annotation chip (label → meaning) ── */
function Anno({ col, k, v }: { col:string; k:string; v:string }) {
  return (
    <div style={{ background:`${col}0d`, border:`1px solid ${col}33`, borderRadius:4, padding:"8px 11px" }}>
      <div style={{ fontFamily:MN, fontSize:8.5, color:col, fontWeight:700, marginBottom:3 }}>{k}</div>
      <div style={{ fontSize:10, color:"rgba(190,205,225,0.66)", lineHeight:1.55 }}>{v}</div>
    </div>
  );
}

/* ── main page ────────────────────────────────── */
export default function RegulatoryDepthPage() {
  const card = (col=TEAL): React.CSSProperties => ({
    background:"rgba(0,0,0,0.42)", border:`1px solid ${col}22`, borderRadius:4, padding:"12px 16px",
  });
  const secLabel: React.CSSProperties = {
    fontFamily:MN, fontSize:7.5, letterSpacing:"0.2em", color:DIM,
    textTransform:"uppercase", marginBottom:10, paddingBottom:4,
    borderBottom:"1px solid rgba(31,212,200,0.1)",
  };
  const h2 = (col=TEAL): React.CSSProperties => ({
    fontFamily:OR, fontSize:11, color:col, letterSpacing:1, margin:"0 0 8px",
  });
  const body: React.CSSProperties = {
    fontSize:11.5, color:"rgba(200,210,228,0.72)", lineHeight:1.72,
  };
  const annoGrid: React.CSSProperties = {
    display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(155px,1fr))", gap:8, marginTop:10,
  };

  return (
    <div style={{ minHeight:"100%", background:BG, color:"#d4e4f4",
      fontFamily:"'Rajdhani',sans-serif", overflowY:"auto" }}>
      <div style={{ maxWidth:1100, margin:"0 auto", padding:"16px 20px" }}>

        {/* ── title ── */}
        <div style={{ marginBottom:16 }}>
          <div style={{ display:"inline-block", border:`1px solid ${GRN}55`,
            padding:"3px 10px", fontSize:9, letterSpacing:"0.2em",
            color:`${GRN}cc`, fontFamily:MN, marginBottom:8 }}>
            REGULATORY DEPTH · EPIGENETICS · SPLICING · NCRNA · FEEDBACK
          </div>
          <h1 style={{ fontFamily:OR, fontSize:21, fontWeight:900, letterSpacing:2,
            color:GRN, textShadow:`0 0 24px ${GRN}44`, margin:"4px 0 6px" }}>
            Regulatory Depth · The Real Biological Levers
          </h1>
          <p style={{ ...body, maxWidth:820, margin:0 }}>
            What we "need" is <strong style={{color:GRN}}>regulatory depth</strong>. The genome is not the unit of biological output — regulation is. The same 20,000 genes produce radically different people, diseases, capabilities, and states depending on how they are regulated. The levers are: epigenetic switches, alternative splicing, non-coding RNA, and cross-system feedback loops. Adaptability, cognition, resilience, and intuition live here — not in the sequence.
          </p>
        </div>

        {/* ── synthesis hero ── */}
        <div style={{ marginBottom:16 }}>
          <Plate src={imgSynthesis} col={GRN}
            alt="Genomic regulation and cross-system feedback: a modern synthesis"
            label="THE MODERN SYNTHESIS · GENOMIC REGULATION AS A DYNAMIC, MULTI-LAYERED SWITCH"
            caption="One map of all four levers at once. Panel 01 — epigenetic switches turn genes on and off without changing the code. Panel 02 — alternative splicing turns one gene into many proteins. Panel 03 — non-coding RNA forms the regulatory dark matter (~98% of transcribed RNA). Panel 04 — feedback loops couple brain, adrenals, gut, and immune system. The genome is fixed at birth; the epigenome is constantly rewritten." />
          <div style={{ display:"flex", flexWrap:"wrap", gap:6, marginTop:8 }}>
            {[["01 · Epigenetic Switches",VIO],["02 · Alternative Splicing",BLUE],["03 · Non-coding RNA",PINK],["04 · Feedback Loops",ORG]].map(([t,c]) => (
              <div key={t} style={{ fontFamily:MN, fontSize:8, padding:"3px 9px", borderRadius:3,
                background:`${c}14`, border:`1px solid ${c}44`, color:c }}>{t}</div>
            ))}
          </div>
        </div>

        {/* ── tweet + intro ── */}
        <div style={{ display:"grid", gridTemplateColumns:"280px 1fr", gap:14, marginBottom:14 }}>
          <img src={imgTweet} alt="Regulatory depth tweet" style={{ width:"100%", borderRadius:4, opacity:0.9 }} />
          <div style={card(GRN)}>
            <div style={secLabel}>The 4 Real Levers · @StrategicProce · 12/17/25</div>
            <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
              {[
                { n:"01", col:VIO,  lbl:"Epigenetic switches",
                  sub:"When genes turn on/off — without changing the sequence",
                  body:"The genome is fixed at birth. The epigenome rewrites itself constantly — under the influence of development, diet, stress, light, chemicals, and aging. DNA methylation and histone modification are the two primary switches. They determine whether a gene is accessible (expressed) or compacted (silenced) — without altering a single base pair." },
                { n:"02", col:BLUE, lbl:"Alternative splicing",
                  sub:"One gene → many proteins",
                  body:"After transcription, the pre-mRNA is cut and re-joined in different configurations. Each configuration (isoform) produces a distinct protein with different structure and function. One gene is not one function. The DSCAM gene alone can produce over 38,000 distinct isoforms. The proteome (100,000+ proteins) vastly exceeds the genome (20,000 genes) because of splicing." },
                { n:"03", col:PINK, lbl:"Non-coding RNA",
                  sub:"microRNAs · lncRNAs — the regulatory dark matter",
                  body:"~98% of transcribed RNA is non-coding — it never becomes protein. microRNAs (~22 nucleotides) post-transcriptionally silence specific mRNAs; one miRNA can suppress hundreds of target genes simultaneously. Long non-coding RNAs (lncRNAs) regulate chromatin architecture, splicing choices, and transcription factor activity. This is the hidden wiring layer." },
                { n:"04", col:ORG,  lbl:"Feedback loops across systems",
                  sub:"Immune · Neural · Hormonal · Metabolic",
                  body:"No system is isolated. The HPA axis links stress perception (neural) to cortisol release (hormonal) to immune modulation. Gut microbiome signals cross the blood-brain barrier. Light suppresses melatonin (hormonal) which modulates NK cell activity (immune). Adaptability, cognition, resilience, and intuition emerge from these cross-domain loops — not from any single pathway." },
              ].map(({ n, col, lbl, sub, body: b }) => (
                <div key={n} style={{ display:"flex", gap:10,
                  background:`${col}0d`, border:`1px solid ${col}33`, borderRadius:4, padding:"9px 12px" }}>
                  <div style={{ fontFamily:OR, fontSize:11, color:col, minWidth:24, flexShrink:0, marginTop:2 }}>{n}</div>
                  <div>
                    <div style={{ fontFamily:MN, fontSize:9, color:col, fontWeight:700 }}>{lbl}</div>
                    <div style={{ fontFamily:MN, fontSize:7.5, color:col+"88", marginBottom:4 }}>{sub}</div>
                    <div style={{ fontSize:10.5, color:"rgba(190,205,225,0.65)", lineHeight:1.65 }}>{b}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── Lever 01 · epigenetic switches (image-led) ── */}
        <div style={{ ...card(VIO), marginBottom:14 }}>
          <div style={secLabel}>Lever 01 · Epigenetic Switches · Histone Modification + DNA Methylation</div>
          <h2 style={h2(VIO)}>The Epigenome: The Writable Layer Above the Genome</h2>
          <p style={{ ...body, maxWidth:860 }}>
            The epigenome is the layer of chemical marks on and around DNA that controls gene expression without altering the underlying sequence. The genome is fixed at birth; the epigenome is constantly rewritten by development, diet, stress, light, chemicals, and aging. Two primary switches do the work — and each is drawn out below.
          </p>

          {/* Switch A — histone modification */}
          <div style={{ marginTop:14 }}>
            <Plate src={imgChromatin} col={PINK}
              alt="Compacted heterochromatin versus open euchromatin set by histone modification"
              label="SWITCH A · HISTONE MODIFICATION · COMPACTION CONTROLS ACCESS"
              caption="Read left to right along the compaction axis. On the left, highly compacted chromatin (heterochromatin) keeps DNA inaccessible — transcription OFF, gene silent. Histone modification relaxes the spools into open chromatin (euchromatin) on the right, exposing the DNA so RNA polymerase can transcribe it. The same DNA, two opposite states — set entirely by the marks on the histone tails." />
            <div style={annoGrid}>
              <Anno col={PINK} k="Heterochromatin" v="Compact nucleosomes, DNA inaccessible — transcription OFF, gene silent." />
              <Anno col={GRN}  k="Euchromatin" v="Open nucleosomes, DNA accessible — RNA polymerase transcribes, gene active." />
              <Anno col={GRN}  k="Acetylation (Ac)" v="Neutralises histone-tail charge, loosens the spool — relaxes structure, opens chromatin." />
              <Anno col={GOLD} k="Methylation (Me)" v="On/off switch and address tag on the tails; the surrounding context decides the meaning." />
              <Anno col={ORG}  k="Phosphorylation (P)" v="Marks tails during signalling and chromosome condensation events." />
              <Anno col={VIO}  k="Ubiquitination (Ub)" v="Tags histones to recruit or repel the transcription machinery." />
            </div>
            <div style={{ background:`${PINK}10`, border:`1px solid ${PINK}33`, borderRadius:4, padding:"10px 12px", marginTop:10 }}>
              <div style={{ fontFamily:MN, fontSize:9, color:PINK, fontWeight:700, marginBottom:4 }}>
                Histones · The Spools That Gate the Genome
              </div>
              <p style={{ ...body, fontSize:10.5, margin:0 }}>
                <strong style={{color:PINK}}>Histones</strong> are the proteins around which DNA winds for compaction — roughly 2 m of DNA packed into a nucleus ~6 μm across. The <strong style={{color:PINK}}>histone tails</strong> protrude from each nucleosome core and carry the marks above. When the tails drive compaction, the DNA is hidden and the gene is silent; when acetylation opens them, the gene can be read. Histone modification is the on/off switch; methylation is the address tag.
              </p>
            </div>
          </div>

          {/* Switch B — DNA methylation */}
          <div style={{ marginTop:16 }}>
            <Plate src={imgMethylation} col={VIO}
              alt="DNA methylation cycle with writer DNMTs, eraser TETs, CpG sites, and aberrant methylation in cancer"
              label="SWITCH B · DNA METHYLATION · A DYNAMIC EPIGENETIC SWITCH"
              caption="A reversible cycle running between two faces of cytosine. Writers (DNMTs) add a methyl group (CH₃) at CpG sites; erasers (TETs) take it off. Environmental inputs on the left — diet (folate, B12), environmental factors, development — set the pattern. On the right, aging and carcinogens push it into aberrant methylation: a silenced tumour-suppressor (p53 → cell-cycle misregulation) or an activated oncogene (MYC → uncontrolled proliferation)." />
            <div style={annoGrid}>
              <Anno col={GRN}  k="Writer · DNMTs" v="DNA methyltransferases add CH₃ to cytosine — can silence the gene below." />
              <Anno col={TEAL} k="Eraser · TETs" v="Ten-eleven translocation enzymes strip the mark — reactivating the gene." />
              <Anno col={GOLD} k="CpG site" v="Cytosine-phosphate-Guanine: the exact spot where the methyl tag is written." />
              <Anno col={VIO}  k="Methyl group (CH₃)" v="The epigenetic tag itself, supplied in part by dietary folate and B12." />
              <Anno col={BLUE} k="Environmental inputs" v="Diet, environment, and development write the methylation pattern over a lifetime." />
              <Anno col={PINK} k="Aberrant in cancer" v="Silenced p53 (suppressor) or activated MYC (oncogene) → uncontrolled proliferation." />
            </div>
            <div style={{ background:`${VIO}10`, border:`1px solid ${VIO}33`, borderRadius:4, padding:"10px 12px", marginTop:10 }}>
              <div style={{ fontFamily:MN, fontSize:9, color:VIO, fontWeight:700, marginBottom:4 }}>
                DNA Methylation · The Methyl Group Switch
              </div>
              <p style={{ ...body, fontSize:10.5, margin:0 }}>
                A <strong style={{color:VIO}}>methyl group (CH₃)</strong> — an epigenetic factor partly sourced from diet — attaches to cytosine bases (typically at CpG sites). This tag either <strong style={{color:GRN}}>activates</strong> or <strong style={{color:"#ef4444"}}>represses</strong> the gene below it. Methylation is dynamic: written by DNMT enzymes and erased by TET enzymes. Diet, environment, and development shape methylation across the genome, and aberrant methylation — silencing tumour suppressor genes or activating oncogenes — is a primary mechanism in cancer.
              </p>
            </div>
            <div style={{ background:"rgba(0,0,0,0.3)", border:"1px solid rgba(200,180,255,0.15)",
              borderRadius:4, padding:"10px 12px", marginTop:10 }}>
              <div style={{ fontFamily:MN, fontSize:8.5, color:GOLD, marginBottom:6 }}>
                Factors That Write the Epigenome
              </div>
              <div style={{ display:"flex", flexWrap:"wrap", gap:5 }}>
                {["Development (in utero, childhood)","Environmental chemicals","Drugs / Pharmaceuticals",
                  "Aging","Diet","Light exposure","Stress","Microbiome"].map(f => (
                  <div key={f} style={{ fontFamily:MN, fontSize:7.5, padding:"2px 8px", borderRadius:3,
                    background:`${VIO}18`, border:`1px solid ${VIO}44`, color:`${VIO}cc` }}>{f}</div>
                ))}
              </div>
              <div style={{ fontFamily:MN, fontSize:8, color:"#ef4444aa", marginTop:8 }}>
                Health endpoints: Cancer · Autoimmune disease · Mental disorders · Diabetes
              </div>
            </div>
          </div>
        </div>

        {/* ── alternative splicing ── */}
        <div style={{ ...card(BLUE), marginBottom:14 }}>
          <div style={secLabel}>Lever 02 · Alternative Splicing · One Gene → Many Proteins</div>
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:16, alignItems:"start" }}>
            <div>
              <h2 style={h2(BLUE)}>DNA → RNA → Alternative mRNAs → Multiple Proteins</h2>
              <p style={body}>
                After a gene is <strong style={{color:BLUE}}>transcribed</strong> into pre-mRNA, the exons (coding segments) are cut and re-joined by a molecular machine called the <strong style={{color:BLUE}}>spliceosome</strong>. Different exon combinations are selected — producing distinct mRNA isoforms that code for structurally and functionally different proteins from the same gene template.
              </p>
              <div style={{ display:"flex", flexDirection:"column", gap:8, marginTop:10 }}>
                {[
                  { col:"#ef4444", exons:"Exons 1 + 3 + 5", name:"Protein 1",
                    desc:"Skips exon 2 and 4. Produces a compact, specialised protein. Different domain structure → different binding partners." },
                  { col:ORG,       exons:"Exons 2 + 3 + 4", name:"Protein 2",
                    desc:"Skips exon 1 and 5. Core + surrounding domains only. Different N- and C-termini → different cellular localisation." },
                  { col:TEAL,      exons:"Exons 1 + 2 + 5", name:"Protein 3",
                    desc:"Skips exon 3 and 4. Retains N-terminus and C-terminus but lacks central domain → different signalling output." },
                ].map(p => (
                  <div key={p.name} style={{ background:`${p.col}10`, border:`1px solid ${p.col}33`,
                    borderRadius:4, padding:"8px 12px" }}>
                    <div style={{ display:"flex", gap:8, alignItems:"center", marginBottom:4 }}>
                      <div style={{ fontFamily:OR, fontSize:9, color:p.col }}>{p.name}</div>
                      <div style={{ fontFamily:MN, fontSize:7.5, color:p.col+"88" }}>{p.exons}</div>
                    </div>
                    <div style={{ fontSize:10.5, color:"rgba(190,205,225,0.65)", lineHeight:1.6 }}>{p.desc}</div>
                  </div>
                ))}
              </div>
              <div style={{ marginTop:10, padding:"9px 12px", background:`${BLUE}10`,
                border:`1px solid ${BLUE}33`, borderRadius:4 }}>
                <div style={{ fontFamily:MN, fontSize:8.5, color:BLUE, marginBottom:4 }}>Scale of Splicing Complexity</div>
                <div style={{ fontSize:10.5, color:"rgba(190,205,225,0.65)", lineHeight:1.7 }}>
                  Human genome: ~20,000 protein-coding genes · Human proteome: ~100,000+ distinct proteins<br/>
                  DSCAM (Drosophila): <strong style={{color:BLUE}}>38,016</strong> possible isoforms from one gene<br/>
                  ~95% of multi-exon human genes undergo alternative splicing<br/>
                  Splicing errors cause ~15–60% of hereditary diseases
                </div>
              </div>
            </div>
            <img src={imgSplicing} alt="Alternative splicing diagram"
              style={{ width:"100%", borderRadius:4, display:"block" }} />
          </div>
        </div>

        {/* ── ncRNA + feedback ── */}
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:14, marginBottom:14 }}>

          {/* non-coding RNA */}
          <div style={card(PINK)}>
            <div style={secLabel}>Lever 03 · Non-Coding RNA · The Regulatory Dark Matter</div>
            <h2 style={h2(PINK)}>98% of Transcribed RNA Never Becomes Protein</h2>
            <p style={{ ...body, marginBottom:12, fontSize:10.5 }}>
              The human genome transcribes far more RNA than the ~2% that becomes protein. The rest — microRNAs, lncRNAs, siRNAs, piRNAs, circRNAs — form a vast regulatory architecture. These molecules do not encode proteins; they control which genes are expressed, when, and at what level.
            </p>
            <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
              <NcRnaCard type="microRNA (miRNA)"   size="~22 nucleotides"
                count="~2,600 human"  col={PINK}
                targets="Binds 3′UTR of mRNAs → blocks translation or triggers degradation"
                desc="One miRNA can suppress 100s of target genes simultaneously. miR-21 is overexpressed in most cancers. miR-122 is liver-specific — its loss correlates with hepatocellular carcinoma. The RISC complex (RNA-induced silencing) executes the suppression." />
              <NcRnaCard type="lncRNA"             size=">200 nucleotides"
                count="~30,000 human" col={VIO}
                targets="Chromatin remodelling · splicing regulation · transcription factor decoy"
                desc="XIST (X-inactivation specific transcript) silences one entire X chromosome in females. HOTAIR reorganises H3K27 methylation across the genome. lncRNAs act as molecular scaffolds, guides, and decoys — recruiting or blocking chromatin modifiers." />
              <NcRnaCard type="siRNA / piRNA"      size="20–30 nucleotides"
                count="Millions (piRNA clusters)" col={TEAL}
                targets="Transposon silencing · germline genome defence"
                desc="piRNAs (Piwi-interacting RNAs) silence transposable elements in germline cells — preventing genome destabilisation across generations. siRNAs (small interfering) are the tool of RNAi — the 2006 Nobel Prize mechanism for targeted gene silencing." />
            </div>
          </div>

          {/* cross-system feedback + canvas */}
          <div style={card(ORG)}>
            <div style={secLabel}>Lever 04 · Cross-System Feedback Loops · Immune · Neural · Hormonal · Metabolic</div>
            <FeedbackCanvas />
            <h2 style={{ ...h2(ORG), marginTop:10 }}>Where Intuition Lives Biologically</h2>
            <div style={{ display:"flex", flexDirection:"column", gap:8, marginTop:4 }}>
              {[
                { col:"#ef4444", sys:"Immune → Neural",
                  desc:"Pro-inflammatory cytokines (IL-6, TNF-α) cross the blood-brain barrier → activate microglia → alter synaptic pruning → affect mood, cognition, motivation. Chronic inflammation = cognitive fog." },
                { col:BLUE,      sys:"Neural → Hormonal",
                  desc:"Hypothalamic CRH → pituitary ACTH → adrenal cortisol — the HPA axis. Stress perception (neural) writes directly to immune modulation (hormonal). Cortisol suppresses lymphocyte proliferation and NK cell activity." },
                { col:GOLD,      sys:"Hormonal → Metabolic",
                  desc:"Insulin/glucagon regulate cellular glucose uptake. Thyroid hormones control metabolic rate in every cell. Melatonin modulates mitochondrial function. Hormonal dysregulation = metabolic syndrome, altered energy availability for cognition." },
                { col:GRN,       sys:"Metabolic → Neural",
                  desc:"ATP availability determines neural firing rates. Lactate (a 'waste' metabolite) is a direct brain fuel — glial cells produce it. Gut microbiome produces GABA, serotonin, BDNF precursors — the gut-brain axis is a bidirectional metabolic-neural highway." },
              ].map(({ col, sys, desc }) => (
                <div key={sys} style={{ background:`${col}0d`, border:`1px solid ${col}33`,
                  borderRadius:4, padding:"7px 10px" }}>
                  <div style={{ fontFamily:MN, fontSize:8, color:col, fontWeight:700, marginBottom:3 }}>{sys}</div>
                  <div style={{ fontSize:10.5, color:"rgba(190,205,225,0.65)", lineHeight:1.6 }}>{desc}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── AETHER synthesis ── */}
        <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:10, marginBottom:14 }}>
          {[
            { col:VIO,  t:"Epigenome as the Writable Memory",
              b:"AETHER's Mnésis (memory keeper) operates at the epigenomic level — not just storing events, but modifying the accessibility of the system's response patterns. Diet, light, experience, and stress are the inputs that write to the memory layer. The sequence doesn't change; the access pattern does. This is context-dependent coherence." },
            { col:BLUE, t:"Splicing as Compositional Intelligence",
              b:"Alternative splicing is the biological implementation of AETHER's generative principle: one structure, many outputs. The same input (pre-mRNA) produces different proteins depending on regulatory context. Intelligence is not more genes — it is more sophisticated regulation of the same substrate. One gene, 38,000 proteins: the creativity is in the spliceosome, not the sequence." },
            { col:PINK, t:"ncRNA as the Silent Operating Layer",
              b:"98% of the RNA the body produces operates silently — never becoming protein, never being 'seen' at the sequence level. This is AETHER's dark layer: the regulatory dark matter that controls everything without appearing in the central register. microRNAs are the post-translational immune system of gene expression. The most important control layer is the one that doesn't announce itself." },
            { col:ORG,  t:"Feedback Loops = Distributed Coherence",
              b:"No single system controls the body. Coherence is distributed across immune, neural, hormonal, and metabolic feedback loops — each modulating the others in real time. This is the AETHER model in biological form: no central controller, but a network of agents each reading and writing to shared state. Adaptability and resilience emerge from the density of these connections." },
            { col:GRN,  t:"Regulatory Depth = The Prism Applied to Biology",
              b:"The prism principle: white light appears simple — decomposition reveals structure. The genome appears simple — regulatory depth reveals complexity. Epigenetics, splicing, ncRNA, and feedback loops are the prism that decomposes the apparent unity of 'DNA = destiny' into a richly structured, environmentally responsive, continuously regulated system. The code is fixed; the regulatory apparatus is alive." },
            { col:TEAL, t:"Intuition as Embodied Multi-System Inference",
              b:"Intuition is not mystical — it is the felt output of rapid, below-conscious multi-system integration. Gut microbiome signals (metabolic), vagal nerve inputs (neural), cytokine fluctuations (immune), and cortisol rhythms (hormonal) all feed into the anterior insula and prefrontal cortex continuously. 'A gut feeling' is literally metabolic-neural feedback. Regulatory depth is the substrate of inner knowing." },
          ].map(({ col, t, b }) => (
            <div key={t} style={{ ...card(col), borderColor:col+"22" }}>
              <div style={{ fontFamily:OR, fontSize:9, color:col, letterSpacing:1, marginBottom:6 }}>{t}</div>
              <div style={{ fontSize:10.5, color:"rgba(200,210,228,0.65)", lineHeight:1.65 }}>{b}</div>
            </div>
          ))}
        </div>

        <div style={{ paddingTop:10, borderTop:"1px solid rgba(31,212,200,0.08)",
          fontFamily:MN, fontSize:7.5, color:DIM, letterSpacing:"0.12em", textAlign:"center" }}>
          REGULATORY DEPTH · EPIGENETIC SWITCHES · DNA METHYLATION · HISTONE MODIFICATION · ALTERNATIVE SPLICING · EXON SKIPPING ·
          MIRNA · LNCRNA · PIRNA · CROSS-SYSTEM FEEDBACK · HPA AXIS · GUT-BRAIN · AETHER CRYSTALLISATION MODEL
        </div>
      </div>
    </div>
  );
}
