import { useEffect, useRef } from "react";
const imgFovea = "/api/storage/public-objects/spec_fovea.jpg";
const imgRetCell = "/api/storage/public-objects/spec_retinal_cells.jpg";
const imgLGN = "/api/storage/public-objects/spec_lgn_pathway.jpg";
const imgPineal = "/api/storage/public-objects/spec_pineal.jpg";
const imgMelan = "/api/storage/public-objects/spec_melanocyte.jpg";
const imgOtt = "/api/storage/public-objects/spec_ott.jpg";
const imgRPE = "/api/storage/public-objects/spec_rpe.jpg";
const imgDNA = "/api/storage/public-objects/spec_dna.jpg";
const imgDHA = "/api/storage/public-objects/spec_dha.jpg";
/* ── palette ─────────────────────────────────── */
const BG   = "#040608";
const TEAL = "#1fd4c8";
const GOLD = "#c9a84c";
const VIO  = "#8b5cf6";
const GRN  = "#22c55e";
const RED  = "#ef4444";
const ORG  = "#f97316";
const BLUE = "#3b82f6";
const PINK = "#ec4899";
const DIM  = "#364858";
const MN   = "'Space Mono', monospace";
const OR   = "'Orbitron', sans-serif";

/* ── light pathway canvas ─────────────────────── */
function LightPathwayCanvas() {
  const ref = useRef<HTMLCanvasElement>(null);
  const raf = useRef(0);
  useEffect(() => {
    const cv = ref.current; if (!cv) return;
    const ctx = cv.getContext("2d")!;
    cv.width = 860; cv.height = 260;
    const W = cv.width, H = cv.height;

    // Nodes in the light pathway
    const nodes = [
      { label:"Sunlight\n(Full Spectrum)", x:0.06, y:0.5, col:"#facc15", r:24 },
      { label:"Eye\nFovea / Retina", x:0.22, y:0.5, col:TEAL, r:22 },
      { label:"Optic\nNerve", x:0.38, y:0.5, col:"#94a3b8", r:18 },
      // split: visual top, non-visual bottom
      { label:"LGN\n(thalamus)", x:0.57, y:0.24, col:BLUE, r:20 },
      { label:"Visual\nCortex", x:0.78, y:0.24, col:BLUE, r:20 },
      { label:"Hypothal-\namus", x:0.57, y:0.72, col:VIO, r:20 },
      { label:"Pineal\nGland", x:0.75, y:0.78, col:PINK, r:20 },
      { label:"Melatonin\n(HIOMT)", x:0.93, y:0.72, col:GRN, r:18 },
    ];
    const edges = [
      [0,1,"#facc15",1.8], [1,2,"#94a3b8",1.5],
      [2,3,BLUE,1.5], [3,4,BLUE,1.5],
      [2,5,VIO,1.5], [5,6,PINK,1.5], [6,7,GRN,1.5],
    ];

    let t = 0;
    const draw = () => {
      ctx.fillStyle = BG; ctx.fillRect(0,0,W,H);

      // full-spectrum gradient bar at top
      const gbar = ctx.createLinearGradient(0, 12, W, 12);
      ["#c084fc","#818cf8","#7c3aed","#2563eb","#16a34a","#ca8a04","#ea580c","#dc2626","#b91c1c"]
        .forEach((c,i,a) => gbar.addColorStop(i/(a.length-1), c));
      ctx.fillStyle = gbar; ctx.fillRect(0, 8, W, 6);

      // section labels
      ctx.fillStyle = "rgba(255,255,255,0.12)";
      ctx.font = "7px Space Mono"; ctx.textAlign = "center";
      ctx.fillText("VISUAL PATHWAY", W * 0.68, 16);
      ctx.fillText("NON-VISUAL / ENERGETIC PATHWAY", W * 0.72, H - 6);

      // dividing dashes
      ctx.setLineDash([4,5]); ctx.strokeStyle = "rgba(255,255,255,0.05)"; ctx.lineWidth = 1;
      ctx.beginPath(); ctx.moveTo(W*0.3, H*0.5); ctx.lineTo(W, H*0.5); ctx.stroke();
      ctx.setLineDash([]);

      // edges
      edges.forEach(([a,b,col,lw]) => {
        const na = nodes[a as number], nb = nodes[b as number];
        const ax = na.x*W, ay = na.y*H, bx = nb.x*W, by = nb.y*H;
        const pulse = 0.4 + 0.6*Math.abs(Math.sin(t*0.035 + (a as number)*0.7));
        ctx.beginPath(); ctx.moveTo(ax,ay); ctx.lineTo(bx,by);
        ctx.strokeStyle = (col as string) + Math.round(pulse*180).toString(16).padStart(2,"0");
        ctx.lineWidth = lw as number; ctx.stroke();
        // moving packet dot
        const frac = (t*0.018 + (a as number)*0.25) % 1;
        const px = ax + (bx-ax)*frac, py = ay + (by-ay)*frac;
        ctx.beginPath(); ctx.arc(px, py, 3, 0, Math.PI*2);
        ctx.fillStyle = col as string; ctx.fill();
        // arrowhead
        const dx = bx-ax, dy = by-ay, len = Math.sqrt(dx*dx+dy*dy);
        if (len > 0) {
          const ux = dx/len, uy = dy/len;
          const ex = bx - ux*(nb.r as number + 4), ey = by - uy*(nb.r as number + 4);
          ctx.beginPath();
          ctx.moveTo(ex, ey);
          ctx.lineTo(ex - ux*8 + uy*5, ey - uy*8 - ux*5);
          ctx.lineTo(ex - ux*8 - uy*5, ey - uy*8 + ux*5);
          ctx.closePath(); ctx.fillStyle = col as string; ctx.fill();
        }
      });

      // nodes
      nodes.forEach((nd, i) => {
        const nx = nd.x*W, ny = nd.y*H;
        const pulse = 0.8 + 0.2*Math.sin(t*0.04+i*0.8);
        const g = ctx.createRadialGradient(nx,ny,0,nx,ny,nd.r*pulse*1.6);
        g.addColorStop(0, nd.col+"99"); g.addColorStop(1, nd.col+"00");
        ctx.beginPath(); ctx.arc(nx,ny,nd.r*pulse*1.6,0,Math.PI*2);
        ctx.fillStyle = g; ctx.fill();
        ctx.beginPath(); ctx.arc(nx,ny,nd.r,0,Math.PI*2);
        ctx.fillStyle = nd.col+"44"; ctx.strokeStyle = nd.col; ctx.lineWidth = 1.5;
        ctx.fill(); ctx.stroke();
        nd.label.split("\n").forEach((line, li, lines) => {
          ctx.fillStyle = nd.col+"ee"; ctx.font = `bold ${nd.r > 20 ? 8 : 7}px Space Mono`;
          ctx.textAlign = "center";
          const yOff = (li - (lines.length-1)/2) * 10;
          ctx.fillText(line, nx, ny + yOff + 3);
        });
      });

      t++; raf.current = requestAnimationFrame(draw);
    };
    draw();
    return () => cancelAnimationFrame(raf.current);
  }, []);
  return <canvas ref={ref} style={{ width:"100%", height:"auto", borderRadius:4, display:"block" }} />;
}

/* ── small spectrum bar ───────────────────────── */
function SpecBar({ width = "100%" }: { width?: string }) {
  return (
    <div style={{ width, height:8, borderRadius:4,
      background:"linear-gradient(90deg,#c084fc,#7c3aed,#2563eb,#16a34a,#ca8a04,#ea580c,#dc2626)" }} />
  );
}

/* ── page ─────────────────────────────────────── */
export default function FullSpectrumLightPage() {
  const card = (col=TEAL): React.CSSProperties => ({
    background:"rgba(0,0,0,0.4)", border:`1px solid ${col}22`, borderRadius:4, padding:"12px 16px",
  });
  const secLabel: React.CSSProperties = {
    fontFamily:MN, fontSize:7.5, letterSpacing:"0.2em", color:DIM,
    textTransform:"uppercase", marginBottom:10, paddingBottom:4,
    borderBottom:"1px solid rgba(31,212,200,0.1)",
  };
  const h2 = (col=TEAL): React.CSSProperties => ({
    fontFamily:OR, fontSize:11, color:col, letterSpacing:1, margin:"0 0 6px",
  });
  const body: React.CSSProperties = {
    fontSize:11.5, color:"rgba(200,210,225,0.7)", lineHeight:1.7,
  };
  const img = (maxH=280): React.CSSProperties => ({
    width:"100%", maxHeight:maxH, objectFit:"cover", borderRadius:3,
    display:"block", filter:"brightness(0.88) contrast(1.08)", marginBottom:6,
  });

  return (
    <div style={{ minHeight:"100%", background:BG, color:"#d4e4f4", fontFamily:"'Rajdhani',sans-serif", overflowY:"auto" }}>
      <div style={{ maxWidth:1100, margin:"0 auto", padding:"16px 20px" }}>

        {/* ── title ── */}
        <div style={{ marginBottom:16 }}>
          <div style={{ display:"inline-block", border:`1px solid ${GOLD}66`, padding:"3px 10px",
            fontSize:9, letterSpacing:"0.2em", color:`${GOLD}cc`, fontFamily:MN, marginBottom:8 }}>
            FULL SPECTRUM LIGHT · BIOLOGY · VISION · MELATONIN · DNA
          </div>
          <h1 style={{ fontFamily:OR, fontSize:22, fontWeight:900, letterSpacing:2,
            color:GOLD, textShadow:`0 0 24px ${GOLD}44`, margin:"4px 0 6px" }}>
            Full Spectrum Light · The Complete Biology
          </h1>
          <SpecBar />
          <p style={{ fontSize:13, color:"rgba(210,200,165,0.75)", maxWidth:820, lineHeight:1.7, margin:"8px 0 0" }}>
            Full spectrum light (UV → Visible → Infrared) drives two parallel biological systems simultaneously: the <strong style={{color:TEAL}}>visual pathway</strong> (retina → LGN → cortex) and the <strong style={{color:VIO}}>energetic pathway</strong> (optic nerve → hypothalamus → pineal → melatonin). Inadequate artificial lighting disrupts both. Dr. John Ott proved it with plants in 1950; Dr. Nicolas Bazan proved it in the retina through DHA/NPD1 neuroprotection in 2002–2015.
          </p>
        </div>

        {/* ── pathway canvas ── */}
        <div style={{ ...card(GOLD), marginBottom:16 }}>
          <div style={secLabel}>Light Pathway · Visual + Energetic (Non-Visual) · Animated</div>
          <LightPathwayCanvas />
          <div style={{ display:"flex", gap:16, marginTop:8, fontFamily:MN, fontSize:8, color:DIM, flexWrap:"wrap" }}>
            <span style={{color:BLUE}}>■ Visual pathway: Retina → LGN → Primary Visual Cortex</span>
            <span style={{color:VIO}}>■ Energetic pathway: Optic Nerve → Hypothalamus → Pineal → Melatonin (HIOMT)</span>
            <span style={{color:GOLD}}>■ Full spectrum sunlight required for both pathways to fire correctly</span>
          </div>
        </div>

        {/* ── grid: Ott + Fovea ── */}
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12, marginBottom:12 }}>

          {/* Dr. Ott */}
          <div style={card(GOLD)}>
            <div style={secLabel}>Dr. John Nash Ott (1901–2000) · Pioneer of Full Spectrum Light</div>
            <img src={imgOtt} alt="Dr Ott" style={img(220)} />
            <h2 style={h2(GOLD)}>Plants Cannot Thrive Under Artificial Light</h2>
            <p style={body}>
              Dr. Ott's time-lapse photography revealed that plants grown under common artificial lighting failed to develop normally — only <strong style={{color:GOLD}}>full spectrum light</strong> produced healthy growth. Walt Disney commissioned Dr. Ott to create time-lapse for <em>The Secrets of Life</em>. His most striking discovery: pumpkin vines produce <em>only male or only female flowers</em> depending on the light spectrum — demonstrating that light wavelength directly controls gene expression. His work established that artificial light is biologically impoverished, missing critical UV and IR bands that regulate development, hormones, and cellular health in plants, animals, and humans.
            </p>
          </div>

          {/* Fovea */}
          <div style={card(TEAL)}>
            <div style={secLabel}>The Fovea · Highest Visual Acuity · Central Light Focus</div>
            <img src={imgFovea} alt="Fovea" style={img(180)} />
            <h2 style={h2(TEAL)}>The Eye's Precision Detector</h2>
            <p style={body}>
              The <strong style={{color:TEAL}}>fovea centralis</strong> is a small pit at the centre of the macula (~1.5 mm diameter) where cone photoreceptor density reaches its maximum (~150,000 cones/mm²). No rods. No blood vessels overlying it. Light passes through without obstruction to hit cones directly. It provides the sharpest 2° of central vision — reading, face recognition, fine detail. The fovea is the biological equivalent of a high-resolution sensor at the focal point of a precision optical system. Full spectrum light is required: UV is filtered by the lens (tryptophan), visible activates cones, and near-IR drives mitochondrial activity in the RPE beneath.
            </p>
          </div>
        </div>

        {/* ── retinal cell streams ── */}
        <div style={{ ...card(BLUE), marginBottom:12 }}>
          <div style={secLabel}>Three Retinal Ganglion Cell Streams · M / P / K → LGN → Cortex</div>
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12 }}>
            <div>
              <img src={imgRetCell} alt="Retinal cells and RNFL" style={img(200)} />
              <img src={imgLGN} alt="LGN pathway" style={img(180)} />
            </div>
            <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
              {[
                { code:"M", name:"M-cell · Parasol", col:RED,
                  loc:"Peripheral retina", dest:"Magnocellular layers of LGN (1–2)",
                  fn:"Motion detection · Low frequency · Contrast sensitivity · High temporal resolution",
                  note:"M-cells carry the fast, coarse, high-contrast motion signal. ~5% of RGCs. Feed V1 and MT (motion area)." },
                { code:"P", name:"P-cell · Midget", col:GRN,
                  loc:"Central retina (Macula)", dest:"Parvocellular layers of LGN (3–6)",
                  fn:"Fine visual acuity · Red-Green color vision · High spatial frequency · Contrast sensitivity",
                  note:"P-cells are the precision channel — ~80% of RGCs. They carry color and fine detail from the macula. Drive the ventral 'what' pathway." },
                { code:"K", name:"K-cell · Bistratified", col:BLUE,
                  loc:"Central retina (Macula)", dest:"Koniocellular layers of LGN",
                  fn:"Blue-Yellow color vision · Spatial & temporal resolution · Blindsight",
                  note:"K-cells (koniocellular) carry the S-cone (blue) signal. Involved in non-conscious visual processing (blindsight) and project to higher cortical areas and superior colliculus." },
              ].map(c => (
                <div key={c.code} style={{ background:`${c.col}0f`, border:`1px solid ${c.col}33`, borderRadius:4, padding:"8px 12px" }}>
                  <div style={{ display:"flex", gap:8, alignItems:"center", marginBottom:4 }}>
                    <div style={{ width:26, height:26, borderRadius:"50%", background:`${c.col}22`, border:`2px solid ${c.col}`,
                      display:"flex", alignItems:"center", justifyContent:"center",
                      fontFamily:OR, fontSize:12, fontWeight:900, color:c.col, flexShrink:0 }}>{c.code}</div>
                    <div>
                      <div style={{ fontFamily:MN, fontSize:8.5, color:c.col, fontWeight:700 }}>{c.name}</div>
                      <div style={{ fontFamily:MN, fontSize:7, color:c.col+"88" }}>{c.loc} → {c.dest}</div>
                    </div>
                  </div>
                  <div style={{ fontFamily:MN, fontSize:7.5, color:c.col+"bb", marginBottom:4 }}>{c.fn}</div>
                  <div style={{ ...body, fontSize:10.5 }}>{c.note}</div>
                </div>
              ))}
              <div style={{ ...body, fontSize:10.5, padding:"8px 10px", background:"rgba(0,0,0,0.3)", borderRadius:4,
                borderLeft:`2px solid ${BLUE}44` }}>
                <strong style={{color:BLUE}}>RNFL (Retinal Nerve Fiber Layer):</strong> Temporal peripapillary RNFL carries mainly P-cell fibres (affected early in MSA). Superior/Nasal/Inferior RNFL carries mainly M-cell fibres (affected in early MSA stages).
              </div>
            </div>
          </div>
        </div>

        {/* ── pineal + IOL + melanocyte ── */}
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:12, marginBottom:12 }}>

          {/* Pineal pathway */}
          <div style={card(VIO)}>
            <div style={secLabel}>Non-Visual / Energetic Pathway · Pineal · Melatonin</div>
            <img src={imgPineal} alt="Pineal pathway diagram" style={img(200)} />
            <h2 style={h2(VIO)}>Light → Autonomic Centre → Melatonin</h2>
            <p style={body}>
              Hollwich (1948) identified the optic nerve's <strong style={{color:VIO}}>"energetic portion"</strong> — fibres that bypass the LGN and travel to the hypothalamus to stimulate autonomic regulatory centres. Photostimuli entering the eye influence the hypothalamus; the hypothalamus signals the pineal gland. The pineal secretes <strong style={{color:PINK}}>melatonin via HIOMT enzyme</strong> — and HIOMT activity depends directly on light intensity. Constant light → lower melatonin → gonadal hyperactivity. Darkness → high melatonin → gonadal inhibition. The retina → optic chiasma → pituitary → pineal → spinal cord → sympathetic ganglia loop is a direct light-to-hormone transducer.
            </p>
          </div>

          {/* Yellow IOL study */}
          <div style={card(GOLD)}>
            <div style={secLabel}>Yellow IOL Study · Cataract Surgery · Melatonin Evidence</div>
            <div style={{ background:`${GOLD}12`, border:`1px solid ${GOLD}44`, borderRadius:4,
              padding:"10px 12px", marginBottom:10 }}>
              <div style={{ fontFamily:OR, fontSize:10, color:GOLD, marginBottom:6 }}>Clinical Proof: Lens Spectrum → Melatonin</div>
              <div style={{ fontFamily:MN, fontSize:8, color:GOLD+"aa", lineHeight:1.8 }}>
                n = 169 patients · mean age 75.7 years<br/>
                <strong style={{color:GOLD}}>Yellow IOL</strong> (blue-light filtering) vs Clear IOL after cataract surgery<br/>
                <strong style={{color:GRN}}>Result:</strong> Mean urinary melatonin significantly higher in yellow IOL group (adjusted mean diff creatinine: +0.159 log ng/mg, 95% CI 0.045–0.273, P = .007)<br/>
                <strong style={{color:TEAL}}>Mechanism:</strong> Yellow lens filters short-wavelength (blue) light → less blue-light suppression of melatonin → higher nocturnal melatonin production
              </div>
            </div>
            <p style={body}>
              This study provides direct clinical evidence that the <em>spectral composition</em> of light reaching the retina controls melatonin levels. The short-wavelength (460–480 nm blue) component of white light is the primary melatonin suppressor via the non-visual ipRGC pathway to the SCN. A yellow lens that filters blue raises melatonin — proving Dr. Ott's principle in a controlled human trial.
            </p>
          </div>

          {/* Melanocyte */}
          <div style={card(PINK)}>
            <div style={secLabel}>Melanocyte · UV → Melanin · Tyrosine Pathway</div>
            <img src={imgMelan} alt="Melanocyte" style={img(180)} />
            <h2 style={h2(PINK)}>UV Light → Melanin Production</h2>
            <p style={body}>
              <strong style={{color:PINK}}>Melanocytes</strong> are dendritic pigment cells in the basal layer of the epidermis. They produce melanin via the tyrosinase enzyme: <strong style={{color:PINK}}>Tyrosine → DOPA → Dopaquinone → Melanin</strong>. UV light (UVB 280–315 nm) triggers melanocyte activation — the tan response. Melanin absorbs UV photons and converts them to heat, protecting keratinocyte DNA. The same aromatic amino acid (Tyrosine) that absorbs UV at 274nm in the eye's lens is the substrate for melanin production in skin. UV → aromatic absorption → biological pigment response: this is a universal quantum photoprotetion mechanism.
            </p>
          </div>
        </div>

        {/* ── RPE + DHA + DNA ── */}
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12, marginBottom:12 }}>

          {/* RPE */}
          <div style={card(GRN)}>
            <div style={secLabel}>Retinal Pigment Epithelium (RPE) · The Photoreceptor Life Support Layer</div>
            <img src={imgRPE} alt="RPE" style={img(200)} />
            <h2 style={h2(GRN)}>Single Hexagonal Cell Layer · Nourishes Everything Distal to It</h2>
            <p style={body}>
              The <strong style={{color:GRN}}>RPE</strong> is a single monolayer of hexagonal pigmented cells sitting just outside the neurosensory retina. It nourishes all retinal visual cells and is firmly attached to the choroid and the overlying photoreceptors. Known historically as <em>pigmentum nigrum</em> (black pigment) — the cells are densely packed with melanin granules that absorb stray photons and prevent backscatter. The RPE performs ~10 critical functions: phagocytosis of shed photoreceptor outer segments, vitamin A recycling (visual cycle), ion/fluid transport, growth factor secretion, and barrier function. Every photoreceptor depends on RPE integrity for survival.
            </p>
          </div>

          {/* DHA/NPD1 system */}
          <div style={card(ORG)}>
            <div style={secLabel}>Dr. Bazan · DHA · Neuroprotectin D1 · AdipoR1 · Retinal Neuroprotection</div>
            <img src={imgDHA} alt="DHA NPD1 pathway" style={img(200)} />
            <h2 style={h2(ORG)}>Omega-3 → Liver → DHA → RPE → Rhodopsin</h2>
            <p style={body}>
              Dr. Nicolas Bazan (LSU) identified the <strong style={{color:ORG}}>DHA/NPD1 neuroprotection system</strong> in the retina:
            </p>
            <ul style={{ ...body, paddingLeft:16, marginTop:4 }}>
              <li><strong style={{color:GOLD}}>DHA (docosahexaenoic acid)</strong> — omega-3 from diet, processed by the liver, delivered to RPE cells via the "long loop".</li>
              <li><strong style={{color:ORG}}>AdipoR1</strong> — a receptor on RPE cells that regulates DHA uptake, retention, and elongation. Without AdipoR1 → DHA reduction → photoreceptor degeneration.</li>
              <li><strong style={{color:PINK}}>NPD1 (Neuroprotectin D1)</strong> — synthesised from DHA in RPE; arrests apoptosis at the pre-mitochondrial level in retinal cells. Neuroprotective in stroke and epilepsy models.</li>
              <li><strong style={{color:TEAL}}>Rhodopsin</strong> — the photopigment in rod photoreceptors, sustained by the RPE/DHA system. Light → rhodopsin bleaching → DHA recycling maintains sensitivity.</li>
            </ul>
            <div style={{ marginTop:8, fontFamily:MN, fontSize:7.5, color:DIM }}>
              2002: Light-induced DNA repair in photoreceptors · 2003: "Docosanoids" coined · 2004: NPD1 discovery · 2011: DHA neuroprotective in stroke · 2015: AdipoR1 as regulatory switch
            </div>
          </div>
        </div>

        {/* ── Light alters DNA ── */}
        <div style={{ ...card(RED), marginBottom:12 }}>
          <div style={secLabel}>Light is Capable of Altering DNA · Damage and Repair</div>
          <div style={{ display:"grid", gridTemplateColumns:"260px 1fr", gap:16, alignItems:"start" }}>
            <img src={imgDNA} alt="Light alters DNA" style={img(220)} />
            <div>
              <h2 style={h2(RED)}>Photon → DNA Interaction · Two Directions</h2>
              <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10 }}>
                <div style={{ background:`${RED}12`, border:`1px solid ${RED}33`, borderRadius:4, padding:"10px 12px" }}>
                  <div style={{ fontFamily:MN, fontSize:8.5, color:RED, marginBottom:6 }}>UV Damage Mechanism</div>
                  <ul style={{ ...body, paddingLeft:14, fontSize:10.5 }}>
                    <li>UVC (260nm) → DNA base absorption → pyrimidine dimers (T-T, C-T) → strand distortion</li>
                    <li>UVB (280–315nm) → CPD (cyclobutane pyrimidine dimers) → replication errors → mutations</li>
                    <li>UVA (315–400nm) → reactive oxygen species → indirect strand breaks → oxidative guanine damage (8-oxoG)</li>
                    <li>Unrepaired → apoptosis or oncogenesis</li>
                  </ul>
                </div>
                <div style={{ background:`${GRN}12`, border:`1px solid ${GRN}33`, borderRadius:4, padding:"10px 12px" }}>
                  <div style={{ fontFamily:MN, fontSize:8.5, color:GRN, marginBottom:6 }}>Light-Induced DNA Repair (Bazan 2002)</div>
                  <ul style={{ ...body, paddingLeft:14, fontSize:10.5 }}>
                    <li>Photoreceptors have a light-induced DNA repair mechanism — discovered by Bazan's group 2002</li>
                    <li>Photoreactivation: blue-light (380–450nm) activates photolyase enzymes that directly reverse CPD dimers</li>
                    <li>Genes are upregulated by light exposure in retinal pathoangiogenesis models</li>
                    <li>NPD1 expression protects RPE cells at the pre-mitochondrial apoptosis checkpoint</li>
                  </ul>
                </div>
              </div>
              <div style={{ ...body, fontSize:11, marginTop:10, padding:"8px 12px",
                background:`${GOLD}12`, borderRadius:4, borderLeft:`2px solid ${GOLD}55` }}>
                The same wavelengths that damage DNA also activate its repair systems — light is simultaneously mutagenic and protective, depending on intensity, duration, and which chromophore absorbs it. Full spectrum light at physiological doses maintains the balance; artificial narrow-band spectra disrupt it.
              </div>
            </div>
          </div>
        </div>

        {/* ── AETHER synthesis ── */}
        <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:10, marginBottom:14 }}>
          {[
            { col:GOLD, t:"Ott Principle: Spectrum = Information",
              b:"Artificial light is not merely dim — it is spectrally impoverished. Missing UV suppresses vitamin D and aromatic AA stimulation. Missing IR suppresses mitochondrial cytochrome c oxidase photobiomodulation. The biological cell expects the full solar spectrum as an information carrier. AETHER: coherence requires a full signal, not a truncated one." },
            { col:TEAL, t:"Two Pathways, One Input",
              b:"A single photon entering the eye simultaneously writes to the visual cortex (what you see) and the pineal gland (how your body responds hormonally). The energetic pathway — Hollwich's non-visual optic nerve fibres — is the body's master clock setter. Block the spectrum, block the clock. AETHER maps this as the split between signal-processing and state-regulation subsystems." },
            { col:VIO, t:"Pineal as the Biological Timestamp",
              b:"Melatonin amplitude encodes the photoperiod — the ratio of light to dark. HIOMT enzyme activity is the molecular readout of daily light exposure. High melatonin = long night signal = winter physiology. Disrupted spectrum = false photoperiod = metabolic confusion. In AETHER terms: the pineal is the system timestamp function — C(t) requires correct light data." },
            { col:RED, t:"Light Writes to DNA — Both Ways",
              b:"UV at 260nm breaks DNA. UV at 380nm + photolyase repairs it. NPD1 from DHA arrests mitochondrial apoptosis. Light is a read-write medium for the genome, not merely a stimulus. Bazan's work proves the retina actively uses light for DNA maintenance, not just photon detection. AETHER: substrate-level computation — photons as memory-modifying signals." },
            { col:GRN, t:"RPE: The Single Layer That Holds Vision",
              b:"All photoreceptors depend on the RPE. It performs the visual cycle (vitamin A recycling), phagocytoses 10% of outer segments daily, provides trophic factors, and maintains the blood-retinal barrier. RPE failure = photoreceptor death = blindness. DHA delivered by AdipoR1 is the primary neuroprotective substrate. The RPE is the substrate layer of vision — analogous to AETHER's substrate synthesis module." },
            { col:ORG, t:"DHA → NPD1: The Retina's Self-Repair Signal",
              b:"Omega-3 → DHA → NPD1 is the retina's anti-apoptosis cascade. AdipoR1 is the gating receptor — a regulatory switch for DHA conservation and elongation. Without it, photoreceptors degrade regardless of light input. AETHER synthesis: coherence maintenance requires not only correct input (light spectrum) but a functioning self-repair substrate (DHA/NPD1 = the system's error-correction layer)." },
          ].map(({col,t,b}) => (
            <div key={t} style={{ ...card(col), borderColor:col+"22" }}>
              <div style={{ fontFamily:OR, fontSize:9, color:col, letterSpacing:1, marginBottom:6 }}>{t}</div>
              <div style={{ ...body, fontSize:10.5 }}>{b}</div>
            </div>
          ))}
        </div>

        {/* footer */}
        <div style={{ paddingTop:10, borderTop:"1px solid rgba(31,212,200,0.08)", fontFamily:MN,
          fontSize:7.5, color:DIM, letterSpacing:"0.12em", textAlign:"center" }}>
          FULL SPECTRUM LIGHT · FOVEA · M/P/K RETINAL STREAMS · LGN · PINEAL/MELATONIN · MELANOCYTE · RPE · DHA · NPD1 · ADIPOR1 · RHODOPSIN · DNA REPAIR · DR OTT 1901–2000 · DR BAZAN LSU · AETHER CRYSTALLISATION
        </div>
      </div>
    </div>
  );
}
