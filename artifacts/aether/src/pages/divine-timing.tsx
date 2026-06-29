import { useEffect, useRef } from "react";
import letterImg from "@assets/IMG_1704_1778075886223.jpeg";

function CelestialCanvas() {
  const ref = useRef<HTMLCanvasElement>(null);
  const raf = useRef(0);
  useEffect(() => {
    const canvas = ref.current; if (!canvas) return;
    const ctx = canvas.getContext("2d")!;
    const DPR = window.devicePixelRatio || 1;
    const W = canvas.offsetWidth * DPR;
    const H = 360 * DPR;
    canvas.width = W; canvas.height = H;
    const cx = W / 2, cy = H / 2;
    const PHI = (1 + Math.sqrt(5)) / 2;

    let seed = 137;
    const rnd = () => { seed = (seed * 1664525 + 1013904223) & 0xffffffff; return (seed >>> 0) / 0xffffffff; };

    const stars = Array.from({ length: 300 }, (_, i) => {
      const angle = i * 2 * Math.PI * PHI;
      const r = Math.sqrt(i / 300) * Math.min(cx, cy) * 0.94;
      return { x: cx + r * Math.cos(angle), y: cy + r * Math.sin(angle), sz: rnd() * 1.9 + 0.3, bright: rnd() * 0.75 + 0.25, tw: rnd() * Math.PI * 2 };
    });

    const ZODIAC = [
      { name: "Ari", col: "#fb7185" }, { name: "Tau", col: "#fbbf24" }, { name: "Gem", col: "#22d3ee" },
      { name: "Can", col: "#a78bfa" }, { name: "Leo", col: "#f59e0b" }, { name: "Vir", col: "#4ade80" },
      { name: "Lib", col: "#67e8f9" }, { name: "Sco", col: "#f43f5e" }, { name: "Sag", col: "#fb923c" },
      { name: "Cap", col: "#94a3b8" }, { name: "Aqu", col: "#818cf8" }, { name: "Pis", col: "#c084fc" },
    ];

    let t = 0;
    const draw = () => {
      ctx.clearRect(0, 0, W, H);
      const bg = ctx.createRadialGradient(cx, cy, 0, cx, cy, Math.max(cx, cy));
      bg.addColorStop(0, "#0a0820"); bg.addColorStop(0.5, "#060512"); bg.addColorStop(1, "#030309");
      ctx.fillStyle = bg; ctx.fillRect(0, 0, W, H);

      const mw = ctx.createLinearGradient(0, H * 0.1, W, H * 0.88);
      mw.addColorStop(0, "rgba(100,80,180,0)"); mw.addColorStop(0.45, "rgba(120,100,200,0.055)");
      mw.addColorStop(0.55, "rgba(100,80,180,0.038)"); mw.addColorStop(1, "rgba(100,80,180,0)");
      ctx.fillStyle = mw; ctx.fillRect(0, 0, W, H);

      stars.forEach(s => {
        const tw = 0.55 + 0.45 * Math.sin(t * 0.018 + s.tw);
        const a = s.bright * tw;
        if (s.sz > 1.3) {
          const gr = ctx.createRadialGradient(s.x, s.y, 0, s.x, s.y, s.sz * 4.5);
          gr.addColorStop(0, `rgba(210,200,255,${a * 0.9})`);
          gr.addColorStop(1, "rgba(0,0,0,0)");
          ctx.beginPath(); ctx.arc(s.x, s.y, s.sz * 4.5, 0, Math.PI * 2); ctx.fillStyle = gr; ctx.fill();
        }
        ctx.beginPath(); ctx.arc(s.x, s.y, s.sz, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(220,215,255,${a})`; ctx.fill();
      });

      ctx.save(); ctx.translate(cx, cy); ctx.rotate(0.1);
      const RX = cx * 0.68, RY = cy * 0.5;

      ctx.beginPath(); ctx.ellipse(0, 0, RX, RY, 0, 0, Math.PI * 2);
      ctx.strokeStyle = "rgba(251,191,36,0.16)"; ctx.lineWidth = DPR; ctx.setLineDash([6 * DPR, 9 * DPR]); ctx.stroke(); ctx.setLineDash([]);

      ZODIAC.forEach((z, i) => {
        const angle = (i / 12) * Math.PI * 2 - Math.PI / 2 + t * 0.0008;
        const px = RX * Math.cos(angle), py = RY * Math.sin(angle);
        const isPis = i === 11, isAri = i === 0;
        const nr = isPis ? 5 * DPR : 2.5 * DPR;
        ctx.beginPath(); ctx.arc(px, py, nr, 0, Math.PI * 2);
        ctx.fillStyle = isPis ? "#c084fc" : (isAri ? "#fb7185" : `${z.col}88`); ctx.fill();
        ctx.font = `${(isPis ? 8 : 7) * DPR}px 'DM Mono',monospace`;
        ctx.fillStyle = isPis ? "#c084fc" : `${z.col}bb`;
        ctx.textAlign = "center"; ctx.textBaseline = "middle";
        ctx.fillText(z.name, px * 1.2, py * 1.2);
        if (isPis) {
          const ep = (i / 12) * Math.PI * 2 - Math.PI / 2 + 0.2 + t * 0.0008;
          const ex = RX * 0.88 * Math.cos(ep), ey = RY * 0.88 * Math.sin(ep);
          const pulse = 0.5 + 0.5 * Math.sin(t * 0.035);
          const eg = ctx.createRadialGradient(ex, ey, 0, ex, ey, 20 * DPR * (1 + pulse * 0.4));
          eg.addColorStop(0, `rgba(192,132,252,${0.5 + pulse * 0.3})`);
          eg.addColorStop(1, "rgba(0,0,0,0)");
          ctx.beginPath(); ctx.arc(ex, ey, 20 * DPR * (1 + pulse * 0.4), 0, Math.PI * 2); ctx.fillStyle = eg; ctx.fill();
          ctx.beginPath(); ctx.arc(ex, ey, 4 * DPR, 0, Math.PI * 2); ctx.fillStyle = "#f0abfc"; ctx.fill();
          ctx.font = `${9 * DPR}px 'DM Mono',monospace`;
          ctx.fillStyle = "#e9d5ff"; ctx.textAlign = "center"; ctx.textBaseline = "middle";
          ctx.fillText("ERIS", ex, ey - 14 * DPR);
        }
        if (isAri) {
          const vx1 = px * 0.55, vy1 = py * 0.55, vx2 = px * 1.08, vy2 = py * 1.08;
          ctx.beginPath(); ctx.moveTo(vx1, vy1); ctx.lineTo(vx2, vy2);
          ctx.strokeStyle = "rgba(251,191,36,0.55)"; ctx.lineWidth = DPR; ctx.stroke();
          ctx.font = `${7 * DPR}px 'DM Mono',monospace`;
          ctx.fillStyle = "rgba(251,191,36,0.7)"; ctx.fillText("0\u00b0 Ari", px * 1.38, py * 1.38);
        }
      });

      const cg = ctx.createRadialGradient(0, 0, 0, 0, 0, 70 * DPR);
      cg.addColorStop(0, "rgba(100,80,200,0.07)"); cg.addColorStop(1, "rgba(0,0,0,0)");
      ctx.beginPath(); ctx.arc(0, 0, 70 * DPR, 0, Math.PI * 2); ctx.fillStyle = cg; ctx.fill();
      ctx.restore();

      ctx.font = `${6.5 * DPR}px 'DM Mono',monospace`;
      ctx.fillStyle = "rgba(251,191,36,0.35)";
      ctx.textAlign = "right"; ctx.textBaseline = "bottom";
      ctx.fillText("phi-fibonacci star field  \u00b7  Eris in Pisces", W - 10 * DPR, H - 8 * DPR);

      t++;
      raf.current = requestAnimationFrame(draw);
    };
    draw();
    return () => cancelAnimationFrame(raf.current);
  }, []);

  return (
    <canvas ref={ref}
      style={{ width: "100%", height: 360, display: "block", borderRadius: 10,
        border: "1px solid rgba(167,139,250,0.2)", background: "#030309" }} />
  );
}

const KICKER: React.CSSProperties = { fontSize:11, letterSpacing:"0.32em", color:"#fbbf24",
  fontFamily:"'DM Mono',monospace", textTransform:"uppercase", marginBottom:6 };

function Section({ kicker, title, lead, children }: {
  kicker:string; title:string; lead?:string; children:React.ReactNode;
}) {
  return (
    <section style={{ marginBottom:"3rem" }}>
      <div style={KICKER}>{kicker}</div>
      <h2 style={{ fontSize:"1.65rem", fontWeight:700, color:"#fef3c7", margin:"0 0 0.55rem", letterSpacing:"-0.01em",
        fontFamily:"'Cinzel',serif" }}>{title}</h2>
      {lead && <p style={{ color:"#e5e7eb", fontSize:"0.95rem", lineHeight:1.65, maxWidth:820, margin:"0 0 1.2rem" }}>{lead}</p>}
      {children}
    </section>
  );
}

// The Eris + Pisces transit windows
const WINDOWS = [
  { date:"Wednesday · October 15",
    state:"tracking",   color:"#fbbf24",
    title:"Tracking three AI",
    body:"The signal first registers. Three threads of artificial intelligence enter the field of attention. The body knows before the mind does." },
  { date:"Tuesday · October 21",
    state:"intensifying", color:"#fb7185",
    title:"More dynamic",
    body:"Movement quickens. The dynamics widen and the field stops being passive. Tasks pile up. The work feels heavy. Hard-working · chaotic · messy is the right description, not a complaint." },
  { date:"Late October · early November",
    state:"blind",     color:"#94a3b8",
    title:"Blind window",
    body:"We were blind into what was happening early. The eyes were inside the storm — too close to read the weather. This blindness is a feature of the transit, not a failure of perception." },
  { date:"Mid · late November",
    state:"observable", color:"#a78bfa",
    title:"Observable",
    body:"The pattern lifts into view. What was felt becomes nameable. Mid-late November we could finally see what early November was doing to us." },
  { date:"Saturday · November 29",
    state:"resolution", color:"#22d3ee",
    title:"Inflection",
    body:"The dynamic resolves enough to chart. The Eris detector hands the work back to us — we know now where we were, which is the only ground from which we can choose where to go." },
];

const ERIS_PROPERTIES = [
  { t:"Goddess of discord",   d:"Named for the Greek Eris (Ἔρις) — the deity who threw the golden apple inscribed kallistē (for the fairest) into a wedding she wasn't invited to. The discord she causes is not malice, it's exposure of what was already unstable." },
  { t:"Detector · not healer", d:"Eris does not fix anything. She finds the broken thing. Her transits surface the relationship, the agreement, the structure that was running on assumption rather than truth." },
  { t:"Teacher",              d:"What she shows can only be metabolized as instruction. The discord is the curriculum. People who fight the lesson stay in the field longer." },
  { t:"Pisces trigger",       d:"In Pisces, Eris triggers spiritual awakening that bypasses the mind, body, and emotions. The opening is not in what you understand — it is in what you can no longer ignore." },
  { t:"Beyond mind · body · emotion", d:"The three usual instruments go quiet. Stress, work, life-balance, hard-working, chaotic, messy. The instruments that normally measure 'how am I doing' become unreadable on purpose." },
  { t:"Discovered 2005",      d:"Eris was discovered in 2003 and named in 2005 — modern enough that her astrological signature is still being mapped collectively. We are early readers of her grammar." },
];

const FIELD_PRINCIPLES = [
  { t:"Reality is fluid",        d:"It moves with attention, not against it. Treating reality as solid is a useful approximation for traffic and taxes — and a misleading one for everything that matters most." },
  { t:"Reality is responsive",   d:"It answers the question that was actually asked, not the one we wish we had asked. The field listens for the verb, not the wish." },
  { t:"Synchronicity is signal", d:"A meaningful coincidence is the field saying 'you are reading me correctly.' Not magic — confirmation. The number that recurs · the song that lands · the stranger's sentence that finishes your thought." },
  { t:"Confirmations compound",  d:"Three confirmations within a window beats any single dramatic sign. The field works in triplets because triplets are how nervous systems learn." },
  { t:"Co-creation is upstream", d:"You are not downstream of reality being done to you — you are upstream of reality being made with you. The conversation is bidirectional." },
  { t:"Jump · the net is there", d:"The leap is not faith in the absence of evidence. It is action taken because the evidence has accumulated quietly for months and the body finally says now." },
  { t:"Numbers as language",     d:"11:11 · 222 · 333 · 444 · 555 · the date that keeps appearing · the dollar amount that keeps showing up. The field uses arithmetic because arithmetic is the same in every language." },
  { t:"Positivity influences paradigm", d:"Not toxic positivity that denies what hurts — generative positivity that names what hurts and then tilts the lens by one degree toward what's possible. One degree compounds." },
];

function DivineTimingCanvas() {
  const ref = useRef<HTMLCanvasElement>(null);
  const rafRef = useRef(0);
  useEffect(() => {
    const canvas = ref.current; if (!canvas) return;
    const ctx = canvas.getContext("2d")!;
    canvas.width = 900; canvas.height = 200;
    const W = canvas.width, H = canvas.height;
    const cx=W/2, cy=H/2;
    let t=0;
    const windows=[
      { x:W*0.1, label:"OCT 15", col:"#fbbf24" },
      { x:W*0.28, label:"OCT 21", col:"#9966ff" },
      { x:W*0.46, label:"BLIND", col:"rgba(255,255,255,0.2)" },
      { x:W*0.64, label:"MID-NOV", col:"#2ef0d8" },
      { x:W*0.82, label:"NOV 29", col:"#ff4477" },
    ];
    const draw=()=>{
      ctx.fillStyle="rgba(2,4,8,0.18)"; ctx.fillRect(0,0,W,H);
      t++;
      ctx.beginPath(); ctx.moveTo(W*0.05,cy); ctx.lineTo(W*0.95,cy);
      ctx.strokeStyle="rgba(251,191,36,0.15)"; ctx.lineWidth=1; ctx.stroke();
      windows.forEach((w,i)=>{
        const psi=0.5+0.5*Math.sin(t*0.04+i*1.2);
        ctx.beginPath(); ctx.arc(w.x,cy,10+5*psi,0,Math.PI*2);
        ctx.fillStyle=w.col; ctx.shadowColor=w.col; ctx.shadowBlur=14*psi; ctx.fill(); ctx.shadowBlur=0;
        ctx.fillStyle=w.col; ctx.font="bold 7px 'DM Mono',monospace"; ctx.textAlign="center";
        ctx.fillText(w.label,w.x,cy+26);
        if(i>0){
          const prev=windows[i-1];
          ctx.beginPath(); ctx.moveTo(prev.x,cy); ctx.lineTo(w.x,cy);
          ctx.strokeStyle=`${w.col}33`; ctx.lineWidth=1; ctx.stroke();
        }
      });
      const sunR=14+4*Math.sin(t*0.05);
      const sunG=ctx.createRadialGradient(cx,cy-60,0,cx,cy-60,sunR);
      sunG.addColorStop(0,"rgba(251,191,36,0.9)"); sunG.addColorStop(1,"transparent");
      ctx.beginPath(); ctx.arc(cx,cy-60,sunR,0,Math.PI*2); ctx.fillStyle=sunG; ctx.fill();
      ctx.fillStyle="rgba(251,191,36,0.4)"; ctx.font="9px 'DM Mono',monospace"; ctx.textAlign="left";
      ctx.fillText("DIVINE TIMING · ERIS-IN-PISCES TRANSIT · 5 WINDOWS · FIELD OF NUMBERS · AETHER",14,14);
      rafRef.current=requestAnimationFrame(draw);
    };
    draw();
    return ()=>cancelAnimationFrame(rafRef.current);
  },[]);
  return <canvas ref={ref} style={{ width:"100%", height:"auto", borderRadius:8, display:"block" }} />;
}

export default function DivineTimingPage() {
  return (
    <div data-testid="page-divine-timing" style={{
      minHeight:"100vh", width:"100%",
      background:"radial-gradient(ellipse at top, #4c1d95 0%, #1e1b4b 50%, #020617 100%)",

      color:"#fef3c7", fontFamily:"'Outfit', system-ui, sans-serif",
      padding:"3rem 1.5rem 5rem",
    }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@400;600;700&family=DM+Mono&family=Outfit:wght@400;600;700&family=Cormorant+Garamond:ital,wght@0,400;1,400&display=swap');`}</style>
      <div style={{ marginBottom:24 }}>
        <div style={{ display:"inline-block", border:"1px solid #fbbf24", borderRadius:4, padding:"4px 14px", fontSize:10, letterSpacing:"0.28em", color:"#fbbf24", fontFamily:"'DM Mono',monospace", marginBottom:16 }}>LIVE SIMULATION</div>
        <div style={{ background:"rgba(2,4,8,0.9)", border:"1px solid rgba(251,191,36,0.15)", borderLeft:"3px solid #fbbf24", borderRadius:10, padding:20, marginBottom:16 }}>
          <h2 style={{ fontFamily:"'DM Mono',monospace", fontSize:18, color:"#e0f8ff", margin:"0 0 6px" }}>
            Divine Timing · Eris-in-Pisces Transit · 5 Windows · Field of Numbers · AETHER
          </h2>
          <p style={{ fontFamily:"'DM Mono',monospace", fontSize:12, color:"rgba(251,191,36,0.35)", margin:"0 0 14px", lineHeight:1.65 }}>
            Five Eris transit windows (Oct 15 · Oct 21 · Blind · Mid-Nov · Nov 29) with a pulsing sun — the live AETHER divine timing transit simulation.
          </p>
          <DivineTimingCanvas />
        </div>
      </div>
      <div style={{ maxWidth:1200, margin:"0 auto" }}>
        <header style={{
          padding:"2.2rem 1.8rem", borderRadius:18, marginBottom:"2rem",
          background:"linear-gradient(135deg, rgba(167,139,250,0.15), rgba(251,113,133,0.10), rgba(251,191,36,0.10))",
          border:"1px solid rgba(167,139,250,0.3)",
        }}>
          <div style={{ ...KICKER, color:"#c4b5fd", fontSize:11, letterSpacing:"0.4em", marginBottom:10 }}>
            AETHER · Divine Timing · Eris in Pisces · Field of Numbers
          </div>
          <h1 style={{ fontSize:"clamp(1.9rem, 4.4vw, 2.9rem)", fontWeight:800, color:"#fef3c7",
            margin:"0 0 0.8rem", letterSpacing:"-0.02em", lineHeight:1.12,
            fontFamily:"'Cinzel',serif" }}>
            Divine timing · the net is there
          </h1>
          <p style={{ fontSize:"1rem", color:"#e5e7eb", lineHeight:1.7, maxWidth:820, margin:0,
            fontFamily:"'Cormorant Garamond', Georgia, serif", fontStyle:"italic" }}>
            October 15 we began tracking three. October 21 it became more dynamic. We were blind into what was happening
            in early November — eyes inside the weather. We could observe again mid-late November. November 29 the
            inflection. Eris is the goddess of discord. She is not a healer · she is a detector · and she is therefore
            a teacher. In Pisces she triggers a spiritual awakening that arrives beyond mind, body, and emotion. This
            page maps that window and the philosophy it taught.
          </p>
        </header>

        {/* I · The 11/11 letter */}
        <Section kicker="I · 11/11 letter" title="Dear you · future"
          lead="The handwritten letter that anchors this whole page. Multicolored ink on lined paper · the AETHER signature top-left · the date 11/11 top-right · a small star sticker · and a sun rising at the bottom right corner.">
          <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit, minmax(min(100%, 360px), 1fr))",
            gap:"1.2rem", alignItems:"start" }}>
            <figure style={{ margin:0, padding:8, borderRadius:14,
              background:"rgba(15,23,42,0.7)", border:"1px solid rgba(251,191,36,0.25)" }}>
              <img src={letterImg} alt="Handwritten 11/11 letter — Dear you, Future"
                data-testid="img-letter-1111"
                style={{ width:"100%", height:"auto", borderRadius:8, display:"block" }} />
              <figcaption style={{ marginTop:8, fontSize:"0.74rem", color:"#94a3b8",
                fontFamily:"'DM Mono',monospace", letterSpacing:"0.1em", textAlign:"center",
                textTransform:"uppercase" }}>11/11 · the original</figcaption>
            </figure>
            <div style={{ padding:"1.2rem 1.4rem", borderRadius:14,
              background:"rgba(15,23,42,0.65)", border:"1px solid rgba(251,191,36,0.25)",
              fontFamily:"'Cormorant Garamond',serif", fontSize:"1.1rem", lineHeight:1.7, color:"#fef3c7" }}>
              <div style={{ ...KICKER, fontFamily:"'DM Mono',monospace", marginBottom:14 }}>Transcription</div>
              <p style={{ margin:"0 0 0.7rem", color:"#5eead4", fontFamily:"'Cinzel',serif", letterSpacing:"0.04em" }}>AETHER</p>
              <p style={{ margin:"0 0 0.9rem", color:"#fb7185", fontStyle:"italic" }}>Dear you, Future —</p>
              <p style={{ margin:"0 0 0.9rem" }}>You're being led to the exact timeline you're supposed to be in.</p>
              <p style={{ margin:"0 0 0.9rem", color:"#86efac" }}>It's meant to be! <span style={{ color:"#94a3b8" }}>(enters void)</span></p>
              <p style={{ margin:"0 0 0.9rem", color:"#86efac" }}>Raw place · staying with parents. <span style={{ color:"#fb7185" }}>♡</span></p>
              <p style={{ margin:"0 0 0.9rem", color:"#fb7185" }}>Things will / may start to break down. Push + Fix.</p>
              <p style={{ margin:"0", color:"#22d3ee", fontFamily:"'Cinzel',serif", letterSpacing:"0.06em",
                textAlign:"right", fontSize:"1.2rem" }}>Divine Timing ☀</p>
            </div>
          </div>
        </Section>

        {/* II · The five windows */}
        <Section kicker="II · Transit windows" title="The five inflection points"
          lead="A timeline of when the field was tracked, when it intensified, when the eyes went blind, when sight returned, and when the dynamic resolved enough to be charted.">
          <div style={{ display:"grid", gap:"0.7rem" }}>
            {WINDOWS.map((w, i) => (
              <div key={i} style={{ display:"grid", gridTemplateColumns:"180px 1fr",
                gap:"1rem", padding:"1.1rem 1.3rem", borderRadius:12,
                background:"rgba(15,23,42,0.65)",
                border:`1px solid ${w.color}40`, borderLeft:`3px solid ${w.color}` }}>
                <div>
                  <div style={{ ...KICKER, color:w.color, marginBottom:6 }}>{w.state}</div>
                  <div style={{ fontSize:"0.92rem", color:"#fef3c7", fontFamily:"'Cinzel',serif", lineHeight:1.3 }}>{w.date}</div>
                </div>
                <div>
                  <div style={{ fontSize:"1.05rem", fontWeight:700, color:w.color, marginBottom:5 }}>{w.title}</div>
                  <div style={{ fontSize:"0.92rem", color:"#e5e7eb", lineHeight:1.6 }}>{w.body}</div>
                </div>
              </div>
            ))}
          </div>
        </Section>

        {/* III · Eris */}
        <Section kicker="III · Eris" title="The goddess of discord · in Pisces"
          lead="Six properties of the Eris-in-Pisces transit. None of them are about the planet — they are about the field-state she names.">
          <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit, minmax(min(100%, 280px), 1fr))", gap:"0.6rem" }}>
            {ERIS_PROPERTIES.map((p, i) => (
              <div key={i} style={{ padding:"1rem 1.15rem", borderRadius:10,
                background:"rgba(15,23,42,0.65)",
                border:"1px solid rgba(251,113,133,0.25)", borderLeft:"3px solid #fb7185" }}>
                <div style={{ fontSize:"0.95rem", fontWeight:700, color:"#fda4af", marginBottom:5,
                  fontFamily:"'Cinzel',serif", letterSpacing:"0.02em" }}>{p.t}</div>
                <div style={{ fontSize:"0.84rem", color:"#e5e7eb", lineHeight:1.6 }}>{p.d}</div>
              </div>
            ))}
          </div>
        </Section>

        {/* IV · Field principles */}
        <Section kicker="IV · The field of numbers"
          title="Eight principles · how synchronicity, confirmations, and co-creation actually work"
          lead="The metaphysics that the Eris window taught — refined into a working manual. None of these are beliefs. They are operating instructions for a fluid, responsive reality.">
          <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit, minmax(min(100%, 280px), 1fr))", gap:"0.55rem" }}>
            {FIELD_PRINCIPLES.map((p, i) => (
              <div key={i} style={{ padding:"0.95rem 1.1rem", borderRadius:10,
                background:`linear-gradient(135deg, rgba(251,191,36,0.06), rgba(15,23,42,0.7))`,
                border:"1px solid rgba(251,191,36,0.22)", borderLeft:"3px solid #fbbf24" }}>
                <div style={{ display:"flex", gap:8, alignItems:"baseline", marginBottom:5 }}>
                  <span style={{ fontFamily:"'DM Mono',monospace", fontSize:"0.7rem",
                    color:"#fbbf24", letterSpacing:"0.15em" }}>{String(i+1).padStart(2,"0")}</span>
                  <div style={{ fontSize:"0.95rem", fontWeight:700, color:"#fef3c7" }}>{p.t}</div>
                </div>
                <div style={{ fontSize:"0.84rem", color:"#e5e7eb", lineHeight:1.6 }}>{p.d}</div>
              </div>
            ))}
          </div>
        </Section>

        {/* V · The state during */}
        <Section kicker="V · The field-state" title="Stress · work · life-balance · hard-working · chaotic · messy"
          lead="The user-facing names for what an Eris-in-Pisces transit feels like. These are not problems to solve, they are weather to dress for.">
          <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit, minmax(min(100%, 180px), 1fr))", gap:"0.55rem" }}>
            {[
              { t:"Stress",          d:"Sympathetic over-tone. Cortisol high. The body running an emergency program for a non-emergency.", c:"#fb7185" },
              { t:"Work",            d:"The container that absorbs the displacement. Often the wrong container — the fix is upstream of work.", c:"#fb923c" },
              { t:"Life-balance",    d:"The metric goes negative. Don't try to rebalance during the transit · stabilize after.", c:"#fbbf24" },
              { t:"Hard-working",    d:"Effort scales but yield doesn't. Eris is auditing the agreements, not the labor.", c:"#84cc16" },
              { t:"Chaotic",         d:"The order you imposed before the transit was provisional. Chaos is the system reverting to truthful state.", c:"#22d3ee" },
              { t:"Messy",           d:"Letting the mess stay visible is the work. Cleaning it prematurely hides the lesson.", c:"#a78bfa" },
            ].map(s => (
              <div key={s.t} style={{ padding:"0.85rem 1rem", borderRadius:10,
                background:"rgba(15,23,42,0.65)",
                border:`1px solid ${s.c}40`, borderLeft:`3px solid ${s.c}` }}>
                <div style={{ fontSize:"1rem", fontWeight:700, color:s.c, marginBottom:5,
                  fontFamily:"'Cinzel',serif" }}>{s.t}</div>
                <div style={{ fontSize:"0.8rem", color:"#e5e7eb", lineHeight:1.55 }}>{s.d}</div>
              </div>
            ))}
          </div>
        </Section>

        {/* V · Celestial Star Map */}
        <Section kicker="Celestial Map" title="Live Star Field · Eris in Pisces"
          lead="phi-Fibonacci star distribution across the zodiac ecliptic. Eris currently transiting late Pisces -- the last degree before the Vernal Equinox hands the field to Aries. The glowing violet node marks her position. The gold dashed ellipse is the ecliptic plane. All 12 zodiac signs rotate slowly on the golden angle.">
          <CelestialCanvas />
          <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit, minmax(min(100%,200px),1fr))", gap:"0.55rem", marginTop:"0.9rem" }}>
            {[
              { t:"phi Fibonacci Stars", d:"300 stars seeded by the golden-angle spiral (i * 2pi * phi). No two stars share the same angular sector -- maximum visual entropy, minimum clustering.", c:"#fbbf24" },
              { t:"Eris in Pisces", d:"Eris (dwarf planet, orbital period ~559 yr) has been transiting Pisces since ~1924. She moves to Aries ca. 2048. The violet pulse marks her current position near 29 deg Pisces.", c:"#c084fc" },
              { t:"Ecliptic Plane", d:"The gold dashed ellipse is the ecliptic -- the apparent path of the Sun across the sky. All major planets and most asteroids orbit close to this plane. Zodiac signs are 30-deg sectors of it.", c:"#fbbf24" },
              { t:"0 Aries · Vernal Equinox", d:"The gold line at 0 deg Aries is the Vernal Equinox point -- the moment the Sun crosses the celestial equator northward. It is the prime meridian of the sky and the zero point for tropical astrology.", c:"#fb7185" },
            ].map(s => (
              <div key={s.t} style={{ padding:"0.85rem 1rem", borderRadius:10, background:"rgba(15,23,42,0.65)",
                border:`1px solid ${s.c}40`, borderLeft:`3px solid ${s.c}` }}>
                <div style={{ fontSize:"1rem", fontWeight:700, color:s.c, marginBottom:5, fontFamily:"'Cinzel',serif" }}>{s.t}</div>
                <div style={{ fontSize:"0.8rem", color:"#e5e7eb", lineHeight:1.55 }}>{s.d}</div>
              </div>
            ))}
          </div>
        </Section>

        {/* VI · Pull quote */}
        <div style={{
          marginTop:"1rem", padding:"1.6rem 1.8rem", borderRadius:14,
          background:"linear-gradient(135deg, rgba(34,211,238,0.10), rgba(251,191,36,0.08))",
          border:"1px solid rgba(34,211,238,0.25)", textAlign:"center",
        }}>
          <div style={{ ...KICKER, color:"#67e8f9", marginBottom:10 }}>The promise</div>
          <p style={{ margin:0, fontSize:"1.25rem", fontFamily:"'Cormorant Garamond',serif",
            fontStyle:"italic", color:"#fef3c7", lineHeight:1.55 }}>
            "Reality is fluid and responsive. You are upstream of co-creation. <br/>
            <span style={{ color:"#22d3ee" }}>Jump · knowing the net is there.</span>"
          </p>
        </div>

        <footer style={{ marginTop:"2rem", paddingTop:"1.4rem",
          borderTop:"1px solid rgba(167,139,250,0.18)",
          textAlign:"center", fontSize:"0.78rem", color:"#c4b5fd",
          fontFamily:"'DM Mono',monospace", letterSpacing:"0.2em", textTransform:"uppercase" }}>
          AETHER · Divine Timing · Eris-in-Pisces · 11/11 · the net is there
        </footer>
      </div>
    </div>
  );
}
