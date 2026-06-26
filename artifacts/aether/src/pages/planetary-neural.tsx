import { useEffect, useRef, useState } from "react";
import imgPlanetary from "@assets/2FB64D9D-19C2-4675-AA57-CEC1704DEDE2_1782484195842.png";

/* ── palette ───────────────────────────────────────────────── */
const V = {
  bg:"#04060E", aurora:"#00FFB2", gold:"#C8A030", blue:"#4488FF",
  vio:"#9966FF", amb:"#FF9933", rose:"#FF6699", plasma:"#FF4477",
  green:"#44CC77", dim:"#3A5060", ink:"#B8CCE8", fire:"#FF6622",
  shock:"#FFDD22", photon:"#00FFBB", cyan:"#22DDFF",
};
const MONO  = "'Space Mono',monospace";
const SERIF = "'Crimson Pro',serif";
const DISP  = "'Cinzel',serif";

function ha(v:number):string {
  return Math.round(Math.max(0,Math.min(255,v))).toString(16).padStart(2,"0");
}

function Tag({ l, c }: { l:string; c:string }) {
  return (
    <span style={{
      display:"inline-block", padding:"2px 8px", margin:"0 4px 4px 0",
      background:c+"22", border:`1px solid ${c}44`,
      borderRadius:3, fontFamily:MONO, fontSize:9, color:c, letterSpacing:"0.12em",
    }}>{l}</span>
  );
}

/* ── Planetary Cascade Canvas ──────────────────────────────── */
const STAGES = [
  { label:"SOLAR WIND",       sub:"Charged particles",      col:V.fire   },
  { label:"GEOMAGNETIC",      sub:"AE/Kp index drives",     col:V.gold   },
  { label:"OCEAN CIRC.",      sub:"Thermohaline + ENSO",    col:V.blue   },
  { label:"IODINE AVAIL.",    sub:"0.06 μg/L seawater",     col:V.aurora },
  { label:"MARINE BIO.",      sub:"Up to 30,000× conc.",    col:V.green  },
  { label:"TERRESTRIAL",      sub:"Coastal → inland",       col:V.vio    },
];

function CascadeCanvas() {
  const ref = useRef<HTMLCanvasElement>(null);
  const raf = useRef(0);

  useEffect(() => {
    const cv = ref.current; if (!cv) return;
    const ctx = cv.getContext("2d")!;
    const W = cv.width, H = cv.height;
    let t = 0;

    const N = STAGES.length;
    const MARGIN = 60;
    const STEP   = (W - MARGIN*2) / (N-1);
    const CY     = H * 0.45;
    const NPART  = 60;

    /* particles flowing along the cascade */
    const px: number[] = [];
    for (let i=0; i<NPART; i++) px.push((i/NPART) * (N-1));

    /* node x positions */
    const nodeX = (i:number) => MARGIN + i*STEP;

    function draw() {
      ctx.clearRect(0,0,W,H);
      ctx.fillStyle="#010308"; ctx.fillRect(0,0,W,H);

      /* connecting arrows */
      for (let i=0; i<N-1; i++) {
        const x1=nodeX(i), x2=nodeX(i+1);
        ctx.beginPath(); ctx.moveTo(x1+22,CY); ctx.lineTo(x2-22,CY);
        ctx.strokeStyle=V.dim+"55"; ctx.lineWidth=1.5; ctx.stroke();
        /* arrowhead */
        const ax=x2-22;
        ctx.beginPath();
        ctx.moveTo(ax,CY); ctx.lineTo(ax-8,CY-5); ctx.lineTo(ax-8,CY+5);
        ctx.closePath(); ctx.fillStyle=V.dim+"55"; ctx.fill();
      }

      /* nodes */
      for (let i=0; i<N; i++) {
        const nx=nodeX(i);
        const { col } = STAGES[i];
        /* how many particles are near this node? */
        let nearCount=0;
        for (let p=0; p<NPART; p++) {
          if (Math.abs(px[p]-i)<0.4) nearCount++;
        }
        const brightness=Math.min(1, nearCount/6 + 0.3);
        const grd=ctx.createRadialGradient(nx,CY,0,nx,CY,26);
        grd.addColorStop(0,col+ha(brightness*200));
        grd.addColorStop(0.6,col+ha(brightness*80));
        grd.addColorStop(1,col+"00");
        ctx.beginPath(); ctx.arc(nx,CY,26,0,Math.PI*2);
        ctx.fillStyle=grd; ctx.fill();
        ctx.beginPath(); ctx.arc(nx,CY,18,0,Math.PI*2);
        ctx.strokeStyle=col+ha(brightness*200+30); ctx.lineWidth=1.5; ctx.stroke();
        ctx.fillStyle=col+ha(brightness*240+15);
        ctx.beginPath(); ctx.arc(nx,CY,5,0,Math.PI*2); ctx.fill();
        /* labels */
        ctx.fillStyle=col; ctx.font=`7px ${MONO}`; ctx.textAlign="center";
        ctx.fillText(STAGES[i].label,nx,CY+35);
        ctx.fillStyle=V.ink+"44"; ctx.font=`6px ${MONO}`;
        ctx.fillText(STAGES[i].sub,nx,CY+45);
        /* stage number */
        ctx.fillStyle=col+"66"; ctx.font=`7px ${MONO}`;
        ctx.fillText(String(i+1),nx,CY-28);
      }

      /* particles */
      for (let p=0; p<NPART; p++) {
        px[p] += 0.004;
        if (px[p]>=N-0.5) px[p]=0;
        const ni = Math.floor(px[p]);
        const frac = px[p]-ni;
        const x1=nodeX(Math.min(ni,N-1)), x2=nodeX(Math.min(ni+1,N-1));
        const px2=x1+(x2-x1)*frac;
        const col=STAGES[Math.min(ni,N-1)].col;
        const py2=CY+6*Math.sin(px[p]*Math.PI*2+t*2);
        if (!isFinite(px2)||!isFinite(py2)) continue;
        ctx.beginPath(); ctx.arc(px2,py2,2,0,Math.PI*2);
        ctx.fillStyle=col+ha(140+80*Math.sin(t*3+p*0.4));
        ctx.fill();
      }

      /* top label */
      ctx.fillStyle=V.fire+"AA"; ctx.font=`9px ${MONO}`; ctx.textAlign="left";
      ctx.fillText("SOLAR WIND → IODINE → THYROID → BRAIN",MARGIN,18);
      ctx.fillStyle=V.ink+"44"; ctx.font=`8px ${MONO}`;
      ctx.fillText("PLANETARY-NEURAL CASCADE · ENERGY PARTICLES TRACE THE FULL CHAIN",MARGIN,30);
    }

    function loop() { t+=0.01; draw(); raf.current=requestAnimationFrame(loop); }
    loop();
    return () => cancelAnimationFrame(raf.current);
  }, []);

  return (
    <canvas ref={ref} width={720} height={130}
      style={{ width:"100%", height:130, display:"block", borderRadius:4 }}/>
  );
}

/* ── Bio Cascade Canvas ────────────────────────────────────── */
const BIO_STAGES = [
  { label:"IODINE INGESTION",    sub:"Dietary food & water",       col:V.aurora },
  { label:"THYROID UPTAKE",      sub:"Active transport into gland", col:V.gold  },
  { label:"T4 / T3 SYNTHESIS",   sub:"Thyroxine & triiodothyronine",col:V.vio  },
  { label:"SYSTEMIC DIST.",      sub:"Bloodstream circulation",     col:V.blue  },
  { label:"BRAIN DEVELOPMENT",   sub:"Myelination · Synaptogenesis",col:V.rose },
  { label:"COGNITIVE OUTCOMES",  sub:"IQ · Memory · Mood · Stress", col:V.cyan },
];

function BioCascadeCanvas() {
  const ref = useRef<HTMLCanvasElement>(null);
  const raf = useRef(0);

  useEffect(() => {
    const cv = ref.current; if (!cv) return;
    const ctx = cv.getContext("2d")!;
    const W = cv.width, H = cv.height;
    let t = 0;
    const N = BIO_STAGES.length;
    const MARGIN = 60;
    const STEP   = (W-MARGIN*2)/(N-1);
    const CY     = H*0.45;
    const NPART  = 50;
    const px2: number[] = [];
    for (let i=0;i<NPART;i++) px2.push((i/NPART)*(N-1));
    const nodeX = (i:number) => MARGIN+i*STEP;

    function draw() {
      ctx.clearRect(0,0,W,H);
      ctx.fillStyle="#010308"; ctx.fillRect(0,0,W,H);

      for (let i=0;i<N-1;i++) {
        const x1=nodeX(i)+20, x2=nodeX(i+1)-20;
        ctx.beginPath(); ctx.moveTo(x1,CY); ctx.lineTo(x2,CY);
        ctx.strokeStyle=V.dim+"44"; ctx.lineWidth=1.2; ctx.stroke();
        ctx.beginPath(); ctx.moveTo(x2,CY); ctx.lineTo(x2-7,CY-4); ctx.lineTo(x2-7,CY+4);
        ctx.closePath(); ctx.fillStyle=V.dim+"44"; ctx.fill();
      }

      for (let i=0;i<N;i++) {
        const nx=nodeX(i), { col }=BIO_STAGES[i];
        let nc=0;
        for (let p=0;p<NPART;p++) { if (Math.abs(px2[p]-i)<0.4) nc++; }
        const br=Math.min(1,nc/5+0.25);
        const grd=ctx.createRadialGradient(nx,CY,0,nx,CY,22);
        grd.addColorStop(0,col+ha(br*180)); grd.addColorStop(1,col+"00");
        ctx.beginPath(); ctx.arc(nx,CY,22,0,Math.PI*2);
        ctx.fillStyle=grd; ctx.fill();
        ctx.beginPath(); ctx.arc(nx,CY,14,0,Math.PI*2);
        ctx.strokeStyle=col+ha(br*200); ctx.lineWidth=1.2; ctx.stroke();
        ctx.beginPath(); ctx.arc(nx,CY,4,0,Math.PI*2);
        ctx.fillStyle=col+ha(br*230+20); ctx.fill();
        ctx.fillStyle=col; ctx.font=`7px ${MONO}`; ctx.textAlign="center";
        ctx.fillText(BIO_STAGES[i].label,nx,CY+30);
        ctx.fillStyle=V.ink+"44"; ctx.font=`6px ${MONO}`;
        ctx.fillText(BIO_STAGES[i].sub,nx,CY+40);
      }

      for (let p=0;p<NPART;p++) {
        px2[p]+=0.0035; if (px2[p]>=N-0.5) px2[p]=0;
        const ni=Math.floor(px2[p]), fr=px2[p]-ni;
        const x1b=nodeX(Math.min(ni,N-1)), x2b=nodeX(Math.min(ni+1,N-1));
        const bx=x1b+(x2b-x1b)*fr;
        const by=CY+5*Math.sin(px2[p]*Math.PI*2+t*2.5);
        if (!isFinite(bx)||!isFinite(by)) continue;
        const col=BIO_STAGES[Math.min(ni,N-1)].col;
        ctx.beginPath(); ctx.arc(bx,by,2,0,Math.PI*2);
        ctx.fillStyle=col+ha(160+80*Math.sin(t*3+p*0.5)); ctx.fill();
      }

      ctx.fillStyle=V.aurora+"88"; ctx.font=`8px ${MONO}`; ctx.textAlign="left";
      ctx.fillText("BIOLOGICAL CASCADE · IODINE TO COGNITIVE FUNCTION",MARGIN,18);
    }

    function loop() { t+=0.01; draw(); raf.current=requestAnimationFrame(loop); }
    loop();
    return () => cancelAnimationFrame(raf.current);
  }, []);

  return (
    <canvas ref={ref} width={720} height={110}
      style={{ width:"100%", height:110, display:"block", borderRadius:4 }}/>
  );
}

/* ── Page ──────────────────────────────────────────────────── */
export default function PlanetaryNeuralPage() {

  const PLANET_STEPS = [
    { n:"1", title:"SOLAR WIND", col:V.fire,
      body:"Charged particles streaming from the Sun interact with Earth's magnetic field, varying the AE (auroral electrojet) and Kp (planetary) geomagnetic indices. These fluctuations drive atmospheric and oceanic circulation patterns." },
    { n:"2", title:"GEOMAGNETIC DYNAMICS", col:V.gold,
      body:"Geomagnetic activity modulates Earth's coupled systems — altering jet stream, precipitation patterns, and atmospheric pressure gradients. The AE index directly correlates with intensity of thermohaline circulation events." },
    { n:"3", title:"OCEAN CIRCULATION MODULATION", col:V.blue,
      body:"Geomagnetic fluctuations influence cloud formation, winds, and upwelling dynamics (ENSO, thermohaline circulation). Ocean upwelling determines where iodine-rich deep water reaches the surface, dramatically controlling coastal iodine bioavailability." },
    { n:"4", title:"OCEAN CHEMISTRY · IODINE", col:V.aurora,
      body:"Ocean circulation and redox conditions determine iodine speciation between I⁻ and IO₃⁻. Average seawater concentration ~0.06 μg/L. Upwelling events can increase surface iodine dramatically, fuelling marine bioconcentration." },
    { n:"5", title:"MARINE BIOCONCENTRATION", col:V.green,
      body:"Marine organisms — seaweed, fish, shellfish — actively concentrate iodine up to 30,000× seawater levels. Kelp can contain 1500–8000 μg iodine per gram dry weight. These organisms are the primary dietary iodine source for coastal populations." },
    { n:"6", title:"TERRESTRIAL TRANSFER", col:V.vio,
      body:"Iodine enters land food webs via coastal weather patterns, river runoff, and rainfall from marine air masses. Inland populations — especially at high altitude — receive far less iodine, creating goitre belts historically documented on every continent." },
  ];

  const BIO_STEPS = [
    { title:"IODINE INGESTION", col:V.aurora,
      body:"Dietary iodine from food and water — primarily seafood, dairy, iodised salt, and seaweed. Daily requirement: 150 μg/day (adults), 220 μg/day (pregnancy). Deficiency affects ~2 billion people globally." },
    { title:"THYROID UPTAKE", col:V.gold,
      body:"Iodine is actively transported into the thyroid gland via the sodium-iodide symporter (NIS). The thyroid concentrates iodine 20–40× above plasma levels. This active uptake is the rate-limiting step in hormone synthesis." },
    { title:"T4 / T3 SYNTHESIS", col:V.vio,
      body:"Iodine is essential for producing thyroxine (T4, four iodine atoms) and triiodothyronine (T3, three iodine atoms). T3 is the biologically active form — T4 is converted to T3 in target tissues including the brain." },
    { title:"SYSTEMIC DISTRIBUTION", col:V.blue,
      body:"Thyroid hormones circulate throughout the body via the bloodstream bound to thyroxine-binding globulin (TBG). They regulate metabolic rate, body temperature, heart rate, and critically — neural development." },
    { title:"BRAIN DEVELOPMENT & FUNCTION", col:V.rose,
      body:"Critical for neuronal migration, myelination, synaptogenesis, and neurotransmitter regulation. Iodine deficiency is the world's leading preventable cause of intellectual disability. Even subclinical deficiency impairs IQ by 10–15 points." },
    { title:"COGNITIVE & BEHAVIORAL OUTCOMES", col:V.cyan,
      body:"Optimal iodine status supports IQ, learning efficiency, memory consolidation, mood stability, and stress resilience. The thyroid-brain axis is a direct link between planetary iodine distribution and human cognitive potential." },
  ];

  return (
    <div style={{ background:V.bg, minHeight:"100vh", color:V.ink,
      fontFamily:MONO, paddingBottom:80 }}>

      <div style={{ padding:"10px 24px", borderBottom:`1px solid ${V.dim}44`,
        display:"flex", flexWrap:"wrap", gap:4 }}>
        {[
          ["PLANETARY-NEURAL",V.fire],["SOLAR WIND",V.gold],
          ["GEOMAGNETIC",V.blue],["IODINE CASCADE",V.aurora],
          ["THYROID",V.vio],["NEUROBIOLOGY",V.rose],["AETHER",V.plasma],
        ].map(([l,c])=><Tag key={l} l={l} c={c}/>)}
      </div>

      <div style={{ padding:"44px 32px 20px", maxWidth:980, margin:"0 auto" }}>
        <div style={{ fontFamily:MONO, fontSize:10, color:V.fire,
          letterSpacing:"0.2em", marginBottom:12 }}>LIVE SIMULATION · PLANETARY-NEURAL CASCADE</div>
        <h1 style={{ fontFamily:DISP, fontSize:"clamp(22px,4vw,44px)",
          color:V.ink, margin:"0 0 16px", lineHeight:1.1 }}>
          The Planetary-Neural Cascade<br/>
          <span style={{ color:V.fire+"BB", fontSize:"0.58em" }}>
            From Solar Wind to Human Neurobiology
          </span>
        </h1>
        <p style={{ fontFamily:SERIF, fontSize:15, color:V.ink+"99",
          lineHeight:1.75, maxWidth:700, margin:0 }}>
          Solar wind modulates geomagnetic dynamics, which drive ocean circulation,
          which controls coastal iodine bioavailability, which determines thyroid hormone
          production, which shapes neuronal myelination and cognitive function.
          Iodine is the link between planetary processes and human potential.
        </p>
      </div>

      <div style={{ maxWidth:980, margin:"0 auto", padding:"0 32px" }}>

        {/* infographic */}
        <div style={{ margin:"0 0 4px", border:`1px solid ${V.dim}44`,
          borderRadius:4, overflow:"hidden" }}>
          <img src={imgPlanetary} alt="Planetary-Neural Cascade infographic"
            style={{ width:"100%", display:"block" }}/>
        </div>

        {/* planetary cascade canvas */}
        <div style={{ border:`1px solid ${V.dim}`, borderRadius:"0 0 4px 4px",
          overflow:"hidden", marginBottom:4 }}>
          <div style={{ padding:"5px 12px", background:V.dim+"22",
            borderBottom:`1px solid ${V.dim}44`, fontFamily:MONO, fontSize:8,
            color:V.fire+"88", letterSpacing:"0.12em" }}>
            PLANETARY CASCADE · SIX STAGES · LIVE PARTICLE FLOW · SOLAR→OCEAN→IODINE→NEURO
          </div>
          <CascadeCanvas/>
        </div>

        {/* bio cascade canvas */}
        <div style={{ border:`1px solid ${V.dim}33`, borderRadius:4,
          overflow:"hidden" }}>
          <div style={{ padding:"5px 12px", background:V.dim+"14",
            borderBottom:`1px solid ${V.dim}22`, fontFamily:MONO, fontSize:8,
            color:V.aurora+"77", letterSpacing:"0.12em" }}>
            BIOLOGICAL CASCADE · IODINE INGESTION → THYROID → T4/T3 → BRAIN → COGNITION
          </div>
          <BioCascadeCanvas/>
        </div>

        {/* planetary steps */}
        <div style={{ margin:"44px 0 0" }}>
          <div style={{ borderLeft:`3px solid ${V.fire}`, paddingLeft:14, marginBottom:16 }}>
            <div style={{ fontFamily:MONO, fontSize:10, color:V.fire, letterSpacing:"0.18em" }}>
              I · THE SIX-STAGE PLANETARY CASCADE
            </div>
          </div>
          <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(280px,1fr))", gap:12 }}>
            {PLANET_STEPS.map(s=>(
              <div key={s.n} style={{ padding:16, background:s.col+"0A",
                border:`1px solid ${s.col}33`, borderRadius:4 }}>
                <div style={{ display:"flex", gap:10, alignItems:"baseline", marginBottom:8 }}>
                  <span style={{ fontFamily:DISP, fontSize:22, color:s.col }}>{s.n}</span>
                  <span style={{ fontFamily:MONO, fontSize:9, color:s.col,
                    letterSpacing:"0.12em" }}>{s.title}</span>
                </div>
                <div style={{ fontFamily:SERIF, fontSize:13, color:V.ink+"88",
                  lineHeight:1.65 }}>{s.body}</div>
              </div>
            ))}
          </div>
        </div>

        {/* bio cascade steps */}
        <div style={{ margin:"44px 0 0" }}>
          <div style={{ borderLeft:`3px solid ${V.aurora}`, paddingLeft:14, marginBottom:16 }}>
            <div style={{ fontFamily:MONO, fontSize:10, color:V.aurora, letterSpacing:"0.18em" }}>
              II · BIOLOGICAL CASCADE · IODINE TO COGNITION
            </div>
          </div>
          <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(280px,1fr))", gap:12 }}>
            {BIO_STEPS.map(s=>(
              <div key={s.title} style={{ padding:16, background:s.col+"0A",
                border:`1px solid ${s.col}33`, borderRadius:4 }}>
                <div style={{ fontFamily:MONO, fontSize:9, color:s.col,
                  letterSpacing:"0.12em", marginBottom:8 }}>{s.title}</div>
                <div style={{ fontFamily:SERIF, fontSize:13, color:V.ink+"88",
                  lineHeight:1.65 }}>{s.body}</div>
              </div>
            ))}
          </div>
        </div>

        {/* historical reality */}
        <div style={{ margin:"40px 0 0", padding:22, background:V.fire+"08",
          border:`1px solid ${V.fire}33`, borderRadius:4 }}>
          <div style={{ fontFamily:MONO, fontSize:9, color:V.fire,
            letterSpacing:"0.18em", marginBottom:14 }}>
            III · THE HISTORICAL REALITY · GOITRE BELTS
          </div>
          <p style={{ fontFamily:SERIF, fontSize:14, color:V.ink+"99",
            lineHeight:1.75, margin:"0 0 12px" }}>
            Inland populations are iodine-poor. Goitre belts existed in <strong>every landlocked
            region on Earth</strong> before iodization programs. The Great Lakes region, Central
            Europe, the Himalayas, Central Africa — all show goitre rates of 30–70% in
            pre-iodization historical records.
          </p>
          <p style={{ fontFamily:SERIF, fontSize:14, color:V.ink+"99",
            lineHeight:1.75, margin:0 }}>
            "Iodine is the link between planetary processes and human potential. No iodine.
            No thyroid hormone. No brain development. No future." Iodization of salt is
            considered one of the highest-return public health interventions in history,
            with estimated IQ gains of 10–15 points across entire populations.
          </p>
        </div>

        {/* key numbers */}
        <div style={{ margin:"40px 0 0" }}>
          <div style={{ borderLeft:`3px solid ${V.vio}`, paddingLeft:14, marginBottom:16 }}>
            <div style={{ fontFamily:MONO, fontSize:10, color:V.vio, letterSpacing:"0.18em" }}>
              IV · KEY NUMBERS
            </div>
          </div>
          <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(160px,1fr))", gap:12 }}>
            {[
              ["30,000×","marine iodine bioconcentration", V.aurora],
              ["0.06 μg/L","average seawater iodine",      V.blue],
              ["2B",      "people with iodine deficiency", V.fire],
              ["150 μg",  "daily adult iodine requirement", V.gold],
              ["10–15 pts","IQ gain from iodization",       V.green],
              ["220 μg",  "pregnancy daily requirement",    V.vio],
            ].map(([n,l,c])=>(
              <div key={n as string} style={{ padding:"12px 14px", background:c+"0A",
                border:`1px solid ${c}33`, borderRadius:4, textAlign:"center" }}>
                <div style={{ fontFamily:DISP, fontSize:22, color:c, marginBottom:6 }}>{n}</div>
                <div style={{ fontFamily:SERIF, fontSize:11, color:V.ink+"66",
                  lineHeight:1.5 }}>{l}</div>
              </div>
            ))}
          </div>
        </div>

        {/* cross-links */}
        <div style={{ margin:"40px 0 0" }}>
          <div style={{ fontFamily:MONO, fontSize:9, color:V.dim,
            letterSpacing:"0.16em", marginBottom:12 }}>RELATED SYSTEMS</div>
          <div style={{ display:"flex", flexWrap:"wrap", gap:8 }}>
            {[
              ["/gut-brain",           "Gut-Brain Axis",          V.aurora],
              ["/borrelia-knot",       "Borrelia Knot",           V.gold],
              ["/understanding-strand","Understanding Strand",     V.vio],
              ["/floquet-petals",      "Floquet Petals",          V.blue],
            ].map(([path,label,col])=>(
              <a key={path} href={path} style={{
                fontFamily:MONO, fontSize:9, color:col, letterSpacing:"0.1em",
                textDecoration:"none", padding:"4px 10px",
                border:`1px solid ${col}44`, borderRadius:3,
              }}>{label} →</a>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
