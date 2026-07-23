import { useEffect, useRef, useState } from "react";
const imgGutBrain = "/api/storage/public-objects/770EA1EA-DBF1-41FD-93A6-A8742013520F_1782484195842.png";
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

/* ── Gut-Brain Axis Canvas ─────────────────────────────────── */
const PATHWAY_COLS = [V.aurora, V.blue, V.rose, V.gold];
const PATHWAY_LABS = ["NEURAL · VAGUS", "ENDOCRINE · HORMONES", "IMMUNE · CYTOKINES", "METABOLIC · SCFAs"];

function GutBrainCanvas({ pw }:{ pw:number }) {
  const ref = useRef<HTMLCanvasElement>(null);
  const raf = useRef(0);
  const st  = useRef({ pw });
  useEffect(() => { st.current = { pw }; }, [pw]);

  useEffect(() => {
    const cv = ref.current; if (!cv) return;
    const ctx = cv.getContext("2d")!;
    const W = cv.width, H = cv.height;
    let t = 0;

    /* signal packets along vagus nerve */
    const NPACK = 28;
    const packs: number[] = [];
    for (let i=0; i<NPACK; i++) packs.push(i/NPACK);

    /* stable microbe positions (seeded) */
    const microbes: number[] = [];
    const mrng = ((s:number)=>{ let r=s; return()=>{ r=(r*16807)%2147483647; return(r-1)/2147483646; }; })(1111);
    for (let i=0; i<14; i++) { microbes.push(mrng()*Math.PI*2, mrng()*0.75); }

    /* stable neuron positions */
    const neurons: number[] = [];
    const nrng = ((s:number)=>{ let r=s; return()=>{ r=(r*16807)%2147483647; return(r-1)/2147483646; }; })(2222);
    for (let i=0; i<12; i++) { neurons.push(nrng()*Math.PI*2, nrng()*0.8); }

    function nervePt(s:number): [number,number] {
      const x = 190 + s*(W-380);
      const y = H*0.48 + 28*Math.sin(s*Math.PI*2.5 + t*0.4);
      return [x, y];
    }

    function draw() {
      ctx.clearRect(0,0,W,H);
      ctx.fillStyle="#010308"; ctx.fillRect(0,0,W,H);

      const col = PATHWAY_COLS[st.current.pw];
      const GX = 110, GY = H*0.5, GR = 62;
      const BX = W-110, BY = H*0.5, BR = 52;

      /* gut coils */
      for (let i=3; i>=0; i--) {
        ctx.beginPath();
        ctx.arc(GX, GY, GR-i*13, 0, Math.PI*2);
        ctx.strokeStyle = V.green+["88","55","33","18"][i];
        ctx.lineWidth = 2.5; ctx.stroke();
      }

      /* gut microbes */
      for (let i=0; i<14; i++) {
        const ang = microbes[i*2], d = microbes[i*2+1]*GR*0.7;
        const mx = GX+d*Math.cos(ang), my = GY+d*Math.sin(ang);
        const pulse = 0.4+0.6*Math.abs(Math.sin(t*2.5+i*0.8));
        if (!isFinite(mx)||!isFinite(my)) continue;
        const grd = ctx.createRadialGradient(mx,my,0,mx,my,3+pulse);
        grd.addColorStop(0,V.green+ha(180+pulse*60));
        grd.addColorStop(1,V.green+"00");
        ctx.beginPath(); ctx.arc(mx,my,3+pulse,0,Math.PI*2);
        ctx.fillStyle=grd; ctx.fill();
      }
      ctx.fillStyle=V.green; ctx.font=`8px ${MONO}`; ctx.textAlign="center";
      ctx.fillText("GUT MICROBIOME",GX,GY+GR+14);
      ctx.fillStyle=V.ink+"44"; ctx.font=`7px ${MONO}`;
      ctx.fillText("90% SEROTONIN",GX,GY+GR+24);
      ctx.fillText("70% IMMUNE CELLS",GX,GY+GR+34);

      /* brain region */
      const bgrd = ctx.createRadialGradient(BX,BY,0,BX,BY,BR);
      bgrd.addColorStop(0,V.blue+"33"); bgrd.addColorStop(1,V.blue+"08");
      ctx.beginPath(); ctx.arc(BX,BY,BR,0,Math.PI*2);
      ctx.fillStyle=bgrd; ctx.fill();
      ctx.strokeStyle=V.blue+"66"; ctx.lineWidth=1.2; ctx.stroke();

      /* synapses */
      const npts: [number,number][] = [];
      for (let i=0; i<12; i++) {
        const ang=neurons[i*2], d=neurons[i*2+1]*BR*0.7;
        npts.push([BX+d*Math.cos(ang), BY+d*Math.sin(ang)]);
      }
      for (let i=0; i<npts.length; i++) {
        for (let j=i+1; j<npts.length; j++) {
          const dx=npts[i][0]-npts[j][0], dy=npts[i][1]-npts[j][1];
          if (dx*dx+dy*dy > BR*BR*0.7) continue;
          const fire = 0.3+0.7*Math.max(0,Math.sin(t*3+i*0.5));
          ctx.beginPath(); ctx.moveTo(npts[i][0],npts[i][1]); ctx.lineTo(npts[j][0],npts[j][1]);
          ctx.strokeStyle=V.blue+ha(fire*80); ctx.lineWidth=0.6; ctx.stroke();
        }
        const fire = 0.4+0.6*Math.abs(Math.sin(t*2+i));
        ctx.beginPath(); ctx.arc(npts[i][0],npts[i][1],2,0,Math.PI*2);
        ctx.fillStyle=V.blue+ha(fire*200); ctx.fill();
      }
      ctx.fillStyle=V.blue; ctx.font=`8px ${MONO}`; ctx.textAlign="center";
      ctx.fillText("BRAIN",BX,BY+BR+14);
      ctx.fillStyle=V.ink+"44"; ctx.font=`7px ${MONO}`;
      ctx.fillText("MOOD · COGNITION",BX,BY+BR+24);

      /* vagus nerve path */
      ctx.beginPath();
      for (let i=0; i<=80; i++) {
        const [x,y]=nervePt(i/80);
        i===0?ctx.moveTo(x,y):ctx.lineTo(x,y);
      }
      ctx.strokeStyle=col+"44"; ctx.lineWidth=2.5; ctx.stroke();

      /* signal packets */
      for (let i=0; i<NPACK; i++) {
        packs[i]=(packs[i]+0.003)%1;
        const [sx,sy]=nervePt(packs[i]);
        if (!isFinite(sx)||!isFinite(sy)) continue;
        const bright=0.5+0.5*Math.sin(t*4+i*0.6);
        ctx.beginPath(); ctx.arc(sx,sy,2.5,0,Math.PI*2);
        ctx.fillStyle=col+ha(120+bright*120); ctx.fill();
      }

      /* hud */
      ctx.fillStyle=col+"AA"; ctx.font=`9px ${MONO}`; ctx.textAlign="center";
      ctx.fillText(PATHWAY_LABS[st.current.pw], W/2, H-10);
      ctx.fillStyle=V.aurora+"77"; ctx.font=`8px ${MONO}`;
      ctx.fillText("GUT PRODUCES 90% OF BODY SEROTONIN · PRIMARY IMMUNE INTERFACE", W/2, 18);
    }

    function loop() { t+=0.012; draw(); raf.current=requestAnimationFrame(loop); }
    loop();
    return () => cancelAnimationFrame(raf.current);
  }, []);

  return (
    <canvas ref={ref} width={720} height={220}
      style={{ width:"100%", height:220, display:"block", borderRadius:4 }}/>
  );
}

/* ── Page ──────────────────────────────────────────────────── */
export default function GutBrainPage() {
  const [pw, setPw] = useState(0);

  const PATHWAYS = [
    { label:"NEURAL · VAGUS NERVE", col:V.aurora,
      body:"The vagus nerve is the primary highway of the gut-brain axis — a bidirectional communication cable containing ~100 million neurons. 80–90% of fibres are afferent (gut→brain), carrying microbial metabolite signals, stretch, and immune status directly to the brainstem." },
    { label:"ENDOCRINE · HORMONES", col:V.blue,
      body:"Gut enteroendocrine cells release over 20 hormones including GLP-1, PYY, CCK, and ghrelin. These regulate appetite, energy balance, and neurotransmitter production. Gut bacteria modulate hormone secretion by metabolising bile acids and short-chain fatty acids." },
    { label:"IMMUNE · CYTOKINES", col:V.rose,
      body:"70% of immune cells reside in gut-associated lymphoid tissue. Commensal bacteria train T-regulatory cells and shape the baseline inflammatory tone of the entire body. Cytokine signals (IL-6, TNF-α, IL-10) cross the blood-brain barrier and alter mood and cognition." },
    { label:"METABOLIC · SCFAs", col:V.gold,
      body:"Fermentation of dietary fibre by microbiota produces short-chain fatty acids — primarily butyrate, propionate, and acetate. Butyrate is the primary fuel for colonocytes, repairs gut barrier, and crosses into the brain where it modulates HDAC activity and neuroinflammation." },
  ];

  const INPUTS = [
    { n:"30", unit:"PLANT SPECIES / WEEK", col:V.aurora,
      checks:["30+ different plant species weekly","Fiber, polyphenols & prebiotics","Foundation of microbial diversity"] },
    { n:"3",  unit:"FERMENTED SOURCES / DAY", col:V.gold,
      checks:["Fermented vegetables","Yogurt, kefir, or kombucha","Traditional & unpasteurised when possible"] },
    { n:"8",  unit:"HOURS SLEEP NIGHTLY", col:V.blue,
      checks:["7.5–8.5 hours optimal","Consistent sleep schedule","Dark, cool, quiet environment"] },
    { n:"15", unit:"HOUR OVERNIGHT FAST", col:V.vio,
      checks:["15 hour overnight fast (minimum)","Supports autophagy","Improves metabolic & immune function"] },
  ];

  const OUTPUTS = [
    ["RESILIENT IMMUNE SYSTEM",V.aurora],["STABLE MOOD",V.gold],
    ["SHARP COGNITION",V.blue],["RESTORATIVE SLEEP",V.vio],
    ["HEALTHY METABOLISM",V.rose],["LONG-TERM VITALITY",V.cyan],
  ];

  return (
    <div style={{ background:V.bg, minHeight:"100vh", color:V.ink,
      fontFamily:MONO, paddingBottom:80 }}>

      <div style={{ padding:"10px 24px", borderBottom:`1px solid ${V.dim}44`,
        display:"flex", flexWrap:"wrap", gap:4 }}>
        {[
          ["MICROBIAL → NEURAL",V.aurora],["GUT-BRAIN AXIS",V.green],
          ["VAGUS NERVE",V.blue],["SEROTONIN",V.gold],
          ["MICROBIOME",V.vio],["IMMUNE INTERFACE",V.rose],["AETHER",V.plasma],
        ].map(([l,c])=><Tag key={l} l={l} c={c}/>)}
      </div>

      <div style={{ padding:"44px 32px 20px", maxWidth:980, margin:"0 auto" }}>
        <div style={{ fontFamily:MONO, fontSize:10, color:V.aurora,
          letterSpacing:"0.2em", marginBottom:12 }}>LIVE SIMULATION · GUT-BRAIN AXIS</div>
        <h1 style={{ fontFamily:DISP, fontSize:"clamp(22px,4vw,44px)",
          color:V.ink, margin:"0 0 16px", lineHeight:1.1 }}>
          Microbial → Neural<br/>
          <span style={{ color:V.green+"BB", fontSize:"0.58em" }}>
            The gut microbiome produces 90% of serotonin · Primary immune interface
          </span>
        </h1>
        <p style={{ fontFamily:SERIF, fontSize:15, color:V.ink+"99",
          lineHeight:1.75, maxWidth:700, margin:0 }}>
          Trillions of microorganisms in the gut communicate continuously with the brain
          via four distinct signalling pathways — neural (vagus nerve), endocrine (hormones),
          immune (cytokines), and metabolic (short-chain fatty acids). A coherent microbiome
          is a prerequisite for mood stability, cognitive clarity, and immune resilience.
        </p>
      </div>

      <div style={{ maxWidth:980, margin:"0 auto", padding:"0 32px" }}>

        {/* infographic */}
        <div style={{ margin:"0 0 4px", border:`1px solid ${V.dim}44`,
          borderRadius:4, overflow:"hidden" }}>
          <img src={imgGutBrain} alt="Microbial to Neural infographic"
            style={{ width:"100%", display:"block" }}/>
        </div>

        {/* pathway selector */}
        <div style={{ display:"flex", gap:6, flexWrap:"wrap", margin:"12px 0 4px" }}>
          {PATHWAYS.map((p,i)=>(
            <button key={p.label} onClick={()=>setPw(i)} style={{
              background:pw===i?p.col+"22":"transparent",
              border:`1px solid ${pw===i?p.col:V.dim}`,
              color:pw===i?p.col:V.ink+"44",
              fontFamily:MONO, fontSize:8, padding:"5px 12px",
              cursor:"pointer", borderRadius:3, letterSpacing:"0.1em",
            }}>{p.label}</button>
          ))}
        </div>

        {/* gut-brain canvas */}
        <div style={{ border:`1px solid ${V.dim}`, borderRadius:"0 4px 4px 4px",
          overflow:"hidden" }}>
          <div style={{ padding:"5px 12px", background:V.dim+"22",
            borderBottom:`1px solid ${V.dim}44`, fontFamily:MONO, fontSize:8,
            color:PATHWAY_COLS[pw]+"88", letterSpacing:"0.12em" }}>
            {PATHWAY_LABS[pw]} · BIDIRECTIONAL SIGNALLING · GUT ↔ BRAIN VIA VAGUS NERVE
          </div>
          <GutBrainCanvas pw={pw}/>
        </div>

        {/* pathway description */}
        <div style={{ marginTop:10, padding:"14px 18px",
          background:PATHWAYS[pw].col+"0A",
          border:`1px solid ${PATHWAYS[pw].col}33`, borderRadius:4 }}>
          <div style={{ fontFamily:MONO, fontSize:9, color:PATHWAYS[pw].col,
            letterSpacing:"0.14em", marginBottom:8 }}>{PATHWAYS[pw].label}</div>
          <div style={{ fontFamily:SERIF, fontSize:14, color:V.ink+"88",
            lineHeight:1.7 }}>{PATHWAYS[pw].body}</div>
        </div>

        {/* minimum coherent inputs */}
        <div style={{ margin:"44px 0 0" }}>
          <div style={{ borderLeft:`3px solid ${V.gold}`, paddingLeft:14, marginBottom:16 }}>
            <div style={{ fontFamily:MONO, fontSize:10, color:V.gold, letterSpacing:"0.18em" }}>
              I · THE MINIMUM COHERENT INPUTS
            </div>
            <div style={{ fontFamily:SERIF, fontSize:13, color:V.ink+"66", marginTop:4 }}>
              Four pillars that sustain a diverse, functional microbiome
            </div>
          </div>
          <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(210px,1fr))", gap:12 }}>
            {INPUTS.map(inp=>(
              <div key={inp.unit} style={{ padding:16, background:inp.col+"0A",
                border:`1px solid ${inp.col}33`, borderRadius:4 }}>
                <div style={{ display:"flex", alignItems:"baseline", gap:8, marginBottom:8 }}>
                  <span style={{ fontFamily:DISP, fontSize:36, color:inp.col,
                    lineHeight:1 }}>{inp.n}</span>
                  <span style={{ fontFamily:MONO, fontSize:8, color:inp.col+"88",
                    lineHeight:1.3 }}>{inp.unit}</span>
                </div>
                {inp.checks.map(ck=>(
                  <div key={ck} style={{ display:"flex", gap:6, alignItems:"flex-start",
                    marginBottom:5 }}>
                    <span style={{ color:inp.col, fontSize:9, marginTop:1 }}>✓</span>
                    <span style={{ fontFamily:SERIF, fontSize:12, color:V.ink+"88",
                      lineHeight:1.5 }}>{ck}</span>
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>

        {/* coherent outputs */}
        <div style={{ margin:"44px 0 0" }}>
          <div style={{ borderLeft:`3px solid ${V.aurora}`, paddingLeft:14, marginBottom:16 }}>
            <div style={{ fontFamily:MONO, fontSize:10, color:V.aurora, letterSpacing:"0.18em" }}>
              II · THE COHERENT OUTPUTS
            </div>
          </div>
          <div style={{ display:"flex", flexWrap:"wrap", gap:10 }}>
            {OUTPUTS.map(([label,col])=>(
              <div key={label} style={{ padding:"10px 16px",
                background:col+"0A", border:`1px solid ${col}33`, borderRadius:4,
                fontFamily:MONO, fontSize:9, color:col, letterSpacing:"0.12em" }}>
                {label}
              </div>
            ))}
          </div>
          <div style={{ marginTop:16, padding:"14px 18px", background:V.dim+"18",
            border:`1px solid ${V.dim}44`, borderRadius:4 }}>
            <div style={{ fontFamily:SERIF, fontSize:14, color:V.ink+"77",
              lineHeight:1.7, fontStyle:"italic" }}>
              "Microbes aren't just in you. They're <em>for</em> you. A healthy gut builds a resilient mind."
            </div>
          </div>
        </div>

        {/* key numbers */}
        <div style={{ margin:"44px 0 0" }}>
          <div style={{ borderLeft:`3px solid ${V.vio}`, paddingLeft:14, marginBottom:16 }}>
            <div style={{ fontFamily:MONO, fontSize:10, color:V.vio, letterSpacing:"0.18em" }}>
              III · KEY NUMBERS
            </div>
          </div>
          <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(160px,1fr))", gap:12 }}>
            {[
              ["90%",  "of serotonin produced in gut",    V.aurora],
              ["70%",  "of immune cells in gut",          V.gold],
              ["100M", "neurons in enteric nervous system",V.blue],
              ["1000+","microbial species in microbiome",  V.vio],
              ["80%",  "vagus fibres are afferent (gut→brain)", V.rose],
              ["40%",  "of Lyme patients: neurological symptoms", V.fire],
            ].map(([n,l,c])=>(
              <div key={n as string} style={{ padding:"12px 14px", background:c+"0A",
                border:`1px solid ${c}33`, borderRadius:4, textAlign:"center" }}>
                <div style={{ fontFamily:DISP, fontSize:26, color:c, marginBottom:6 }}>{n}</div>
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
              ["/planetary-neural",    "Planetary-Neural Cascade", V.aurora],
              ["/borrelia-knot",       "Borrelia Knot",            V.gold],
              ["/understanding-strand","Understanding Strand",      V.vio],
              ["/atp-transport",       "ATP Transport",             V.blue],
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
