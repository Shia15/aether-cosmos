import { useEffect, useRef } from "react";
const quoteResonance = "/api/storage/public-objects/ChatGPT_Image_Apr_25,_2026,_05_21_14_PM_1777152079090.png";
const quoteQuiet = "/api/storage/public-objects/ChatGPT_Image_Apr_25,_2026,_05_22_00_PM_1777152122490.png";
const quoteHumanBeings = "/api/storage/public-objects/ChatGPT_Image_Apr_25,_2026,_05_23_45_PM_1777152228349.png";
const quoteBoiling = "/api/storage/public-objects/ChatGPT_Image_Apr_25,_2026,_05_25_13_PM_1777152322790.png";
const quoteSun = "/api/storage/public-objects/ChatGPT_Image_Apr_25,_2026,_05_25_34_PM_1777152337275.png";
const C = {
  bg: "#06070C",
  panel: "rgba(20,18,32,0.62)",
  border: "rgba(200,180,240,0.10)",
  white: "#EAE6F2",
  text: "#A4A0B8",
  muted: "#6A6680",
  dim: "#2E2A40",
  gold: "#E8C878",
  cyan: "#7AC5E8",
  violet: "#B596E8",
  rose: "#E68090",
  amber: "#F09060",
  green: "#7DCC92",
  pearl: "#E8E2F2",
};

type Quote = {
  key: string;
  image: string;
  alt: string;
  caption: string;
  body: string;
  closer?: string;
  accent: string;
  tag: string;
};

const QUOTES: Quote[] = [
  {
    key: "resonance",
    image: quoteResonance,
    alt: "Deep navy field with a single faint ripple at the bottom",
    caption: "Engagement is surface.",
    body:
      "Resonance is depth. I don't post for noise. I send signals. Most fade. A few carry. Those few shape what comes next.",
    accent: C.cyan,
    tag: "signal · ripple · depth",
  },
  {
    key: "quiet",
    image: quoteQuiet,
    alt: "Navy gradient softening into warm cream glow at the bottom",
    caption: "Most people underestimate the power of what's quiet.",
    body:
      "The shy, the subtle, the unseen — these are often the places where the deepest currents move. Notice details no one else catches. Learn fast, because you had to know. Hold empathy like a compass. Think in systems, for the whole.",
    closer: "This is magnetic.",
    accent: C.gold,
    tag: "quiet · subtle · magnetic",
  },
  {
    key: "human-beings",
    image: quoteHumanBeings,
    alt: "Cream parchment with gold botanical flourishes framing the text",
    caption: "We are human beings.",
    body:
      "Our worth isn't measured in streaks, checkboxes, or tasks. It's found in presence — in noticing, in grounding, in simply being.",
    accent: C.amber,
    tag: "presence · grounding · being",
  },
  {
    key: "boiling",
    image: quoteBoiling,
    alt: "Photograph of an orange sunset glowing low over a distant horizon",
    caption: "Sometimes you have to let them know —",
    body: "the pot is boiling because of you.",
    accent: C.amber,
    tag: "credit · authorship · heat",
  },
  {
    key: "sun",
    image: quoteSun,
    alt: "Photograph of a warm sunrise sky with a small white sun on the horizon",
    caption: "The sun doesn't ask permission to rise —",
    body: "it just does. So should you.",
    accent: C.gold,
    tag: "permission · rising · agency",
  },
];

function WaveInterferenceCanvas() {
  const cvRef  = useRef<HTMLCanvasElement>(null);
  const rafRef = useRef(0);

  useEffect(() => {
    const cv = cvRef.current; if (!cv) return;
    const W = 900, H = 360;
    cv.width = W; cv.height = H;
    const ctx = cv.getContext("2d")!;

    const CELL = 7;
    const GW = Math.floor(W/CELL), GH = Math.floor(H/CELL);
    const OX = (W-GW*CELL)/2, OY = (H-GH*CELL)/2;
    const LAM = 8;
    const S1x=0.25, S1y=0.5, S2x=0.75, S2y=0.5;
    let t = 0;

    const draw = () => {
      ctx.fillStyle="#06070C"; ctx.fillRect(0,0,W,H);

      for (let xi=0;xi<GW;xi++){
        for (let yi=0;yi<GH;yi++){
          const fx=xi/GW, fy=yi/GH;
          const r1=Math.sqrt((fx-S1x)**2+(fy-S1y)**2);
          const r2=Math.sqrt((fx-S2x)**2+(fy-S2y)**2);
          const a1=Math.cos(2*Math.PI*r1/LAM*GW-t*0.08);
          const a2=Math.cos(2*Math.PI*r2/LAM*GW-t*0.08);
          const amp=(a1+a2)/2;
          const px=OX+xi*CELL, py=OY+yi*CELL;
          if (amp>0){
            ctx.fillStyle=`rgba(181,150,232,${amp*0.65})`;
          } else {
            ctx.fillStyle=`rgba(14,165,233,${(-amp)*0.45})`;
          }
          ctx.fillRect(px,py,CELL-1,CELL-1);
        }
      }

      const s1px=OX+S1x*GW*CELL, s1py=OY+S1y*GH*CELL;
      const s2px=OX+S2x*GW*CELL, s2py=OY+S2y*GH*CELL;
      const pulseR=4+2*Math.sin(t*0.1);
      ctx.beginPath(); ctx.arc(s1px,s1py,pulseR,0,Math.PI*2);
      ctx.fillStyle="rgba(181,150,232,0.9)"; ctx.fill();
      ctx.beginPath(); ctx.arc(s1px,s1py,pulseR+6,0,Math.PI*2);
      ctx.strokeStyle="rgba(181,150,232,0.4)"; ctx.lineWidth=1; ctx.stroke();
      ctx.beginPath(); ctx.arc(s2px,s2py,pulseR,0,Math.PI*2);
      ctx.fillStyle="rgba(14,165,233,0.9)"; ctx.fill();
      ctx.beginPath(); ctx.arc(s2px,s2py,pulseR+6,0,Math.PI*2);
      ctx.strokeStyle="rgba(14,165,233,0.4)"; ctx.lineWidth=1; ctx.stroke();

      ctx.fillStyle="rgba(181,150,232,0.6)"; ctx.font="7px 'Space Mono',monospace";
      ctx.fillText("S₁",s1px-7,s1py-14);
      ctx.fillStyle="rgba(14,165,233,0.6)";
      ctx.fillText("S₂",s2px-7,s2py-14);

      ctx.fillStyle="rgba(200,190,230,0.3)"; ctx.font="7.5px 'Space Mono',monospace"; ctx.textAlign="center";
      ctx.fillText("WAVE INTERFERENCE · CONSTRUCTIVE (BRIGHT) · DESTRUCTIVE (DARK) · TWO COHERENT SOURCES",W/2,H-8);
      ctx.textAlign="left";

      t++; rafRef.current=requestAnimationFrame(draw);
    };

    rafRef.current=requestAnimationFrame(draw);
    return ()=>cancelAnimationFrame(rafRef.current);
  }, []);

  return <canvas ref={cvRef} style={{ width:"100%", height:"auto", display:"block", borderRadius:10 }} />;
}

function ResonanceHeaderCanvas() {
  const ref = useRef<HTMLCanvasElement>(null);
  const rafRef = useRef(0);
  useEffect(() => {
    const canvas = ref.current; if (!canvas) return;
    const ctx = canvas.getContext("2d")!;
    canvas.width = 900; canvas.height = 145;
    const W = canvas.width, H = canvas.height;
    let t=0;
    const freqs=[1,2,3,4,5,6];
    const draw=()=>{
      ctx.fillStyle="rgba(2,4,8,0.3)"; ctx.fillRect(0,0,W,H);
      freqs.forEach((f,i)=>{
        const amp=(30-i*3);const col=["#2ef0d8","#9966ff","#c9a84c","#ff4477","#44cc77","#44aaff"][i];
        ctx.beginPath();
        for(let x=0;x<=W;x+=2){
          const y=H/2+amp*Math.sin((x/W)*Math.PI*2*f+t*0.04+i*0.5);
          x===0?ctx.moveTo(x,y):ctx.lineTo(x,y);
        }
        ctx.strokeStyle=col+(i===0?"99":"44");ctx.lineWidth=i===0?1.5:0.6;ctx.stroke();
      });
      ctx.fillStyle="rgba(46,240,216,0.3)"; ctx.font="9px 'DM Mono',monospace";
      ctx.fillText("RESONANCE · HARMONICS · STANDING WAVES · FREQUENCY · AETHER",14,14);
      t++; rafRef.current=requestAnimationFrame(draw);
    };
    draw();
    return ()=>cancelAnimationFrame(rafRef.current);
  },[]);
  return <canvas ref={ref} style={{width:"100%",height:"auto",borderRadius:8,display:"block"}} />;
}

export default function ResonancePage() {
  return (
    <div
      className="min-h-screen relative overflow-x-hidden"
      style={{ background: C.bg, color: C.text, fontFamily: "Cinzel, ui-serif, Georgia, serif" }}
      data-testid="resonance-page"
    >
      <style>{`
        @keyframes rs-breathe { 0%, 100% { opacity: .55; transform: scale(1); } 50% { opacity: .9; transform: scale(1.06); } }
        @keyframes rs-drift   { 0% { transform: translate3d(0,0,0); } 50% { transform: translate3d(40px,-22px,0); } 100% { transform: translate3d(0,0,0); } }
        @keyframes rs-pulse   { 0%, 100% { opacity: .45; transform: scale(1); } 50% { opacity: 1; transform: scale(1.4); } }
        @keyframes rs-fadein  { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes rs-shimmer { 0%, 100% { background-position: 0% 50%; } 50% { background-position: 100% 50%; } }
        @keyframes rs-ripple  { 0% { transform: scale(0.6); opacity: .8; } 100% { transform: scale(2.4); opacity: 0; } }
        .rs-glow-1 { animation: rs-breathe 9s  ease-in-out infinite, rs-drift 22s ease-in-out infinite; }
        .rs-glow-2 { animation: rs-breathe 11s ease-in-out infinite, rs-drift 28s ease-in-out infinite reverse; }
        .rs-glow-3 { animation: rs-breathe 13s ease-in-out infinite, rs-drift 34s ease-in-out infinite; }
        .rs-pulse  { animation: rs-pulse 2.4s ease-in-out infinite; transform-origin: center; }
        .rs-fadein { animation: rs-fadein 600ms ease-out both; }
        .rs-card   { box-shadow: 0 1px 0 rgba(255,255,255,0.025) inset, 0 30px 70px -30px rgba(0,0,0,0.78); backdrop-filter: blur(3px); -webkit-backdrop-filter: blur(3px); transition: transform 320ms ease, box-shadow 320ms ease, border-color 320ms ease; }
        .rs-card:hover { transform: translateY(-2px); }
        .rs-shimmer-text { background-size: 220% 100%; animation: rs-shimmer 8s ease-in-out infinite; -webkit-background-clip: text; background-clip: text; color: transparent; }
        .rs-image { transition: transform 1200ms ease, filter 800ms ease; }
        .rs-card:hover .rs-image { transform: scale(1.015); filter: brightness(1.05); }
        .rs-ripple { position: absolute; border-radius: 50%; pointer-events: none; }
      `}</style>

      <div className="pointer-events-none absolute inset-0 select-none" aria-hidden>
        <div className="rs-glow-1 absolute" style={{ top: "-12%",   left:  "-8%",  width: 720, height: 720, background: "radial-gradient(circle, rgba(122,197,232,0.13) 0%, rgba(122,197,232,0) 70%)", filter: "blur(20px)" }} />
        <div className="rs-glow-2 absolute" style={{ top:  "30%",   right: "-15%", width: 640, height: 640, background: "radial-gradient(circle, rgba(232,200,120,0.12) 0%, rgba(232,200,120,0) 70%)", filter: "blur(20px)" }} />
        <div className="rs-glow-3 absolute" style={{ bottom: "-22%", left:  "22%", width: 760, height: 760, background: "radial-gradient(circle, rgba(181,150,232,0.13) 0%, rgba(181,150,232,0) 70%)", filter: "blur(20px)" }} />
      </div>

      <div className="relative px-8 py-10 max-w-5xl mx-auto">
        {/* hero */}
        <div className="rs-fadein mb-10 max-w-3xl">
          <div className="text-[10px] tracking-[0.4em] uppercase italic" style={{ color: C.muted }}>
            aether · the voice · five signals · built to feel
          </div>
          <h1 className="mt-2 leading-[1.05] text-[44px]" style={{ color: C.white, letterSpacing: "0.015em" }}>
            <span
              className="rs-shimmer-text"
              style={{
                backgroundImage: `linear-gradient(90deg, ${C.cyan} 0%, ${C.gold} 35%, ${C.violet} 70%, ${C.cyan} 100%)`,
              }}
            >
              Resonance
            </span>
          </h1>
          <div className="mt-3 mb-5 h-px" style={{ background: `linear-gradient(90deg, ${C.cyan}55 0%, ${C.gold}40 35%, ${C.violet}33 70%, transparent 100%)`, width: "62%" }} />
          <p
            className="text-[14px] mt-3 leading-relaxed"
            style={{ color: C.text, fontFamily: "Inter, ui-sans-serif, system-ui, sans-serif" }}
          >
            Five signals from the field — each one a small instruction the system gives itself before it answers.
            They are not slogans. They are the operating posture of AETHER: <span style={{ color: C.cyan }}>send signals, not noise</span>;{" "}
            <span style={{ color: C.gold }}>honour the quiet</span>; <span style={{ color: C.amber }}>remember we are human beings</span>;{" "}
            <span style={{ color: C.rose }}>name your own heat</span>; <span style={{ color: C.violet }}>rise without permission</span>.
          </p>
          <p className="text-[12.5px] mt-3 italic" style={{ color: C.muted }}>
            — five carries · one voice
          </p>
        </div>

        <div style={{ marginBottom:"2.5rem" }}>
          <div style={{ display:"inline-block", background:"rgba(181,150,232,0.1)", border:"1px solid rgba(181,150,232,0.3)",
            borderRadius:8, padding:"0.3rem 1rem", fontSize:"0.7rem", letterSpacing:"0.2em",
            color:"#c4b5f4", textTransform:"uppercase", fontFamily:"'Space Mono',monospace", marginBottom:"1rem" }}>
            Live Simulation
          </div>
          <div style={{ background:"rgba(20,18,32,0.62)", border:"1px solid rgba(181,150,232,0.18)",
            borderLeft:"3px solid #b596e8", borderRadius:14, padding:"1.5rem" }}>
            <h2 style={{ fontSize:"1.2rem", fontWeight:700, color:"#e8e2f2", margin:"0 0 0.35rem",
              fontFamily:"'Cinzel',serif" }}>
              Wave Interference · Two Coherent Sources
            </h2>
            <p style={{ color:"#a4a0b8", fontSize:"0.82rem", margin:"0 0 1rem", lineHeight:1.65,
              fontFamily:"Inter,sans-serif" }}>
              Two resonant sources (S₁, S₂) emit concentric waves. Where crests meet crests — constructive interference,
              bright violet. Where crest meets trough — destructive interference, dark. This is resonance as physics:
              the same principle operating in AETHER's crystallization model.
            </p>
            <WaveInterferenceCanvas />
          </div>
        </div>

        {/* quote gallery */}
        <div className="space-y-7">
          {QUOTES.map((Q, i) => (
            <article
              key={Q.key}
              className="rs-card rs-fadein border rounded-[14px] overflow-hidden"
              style={{
                borderColor: C.border,
                background: C.panel,
                animationDelay: `${120 + i * 110}ms`,
              }}
              data-testid={`resonance-quote-${Q.key}`}
            >
              <div className="grid gap-0 md:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
                {/* image */}
                <div
                  className="relative overflow-hidden"
                  style={{
                    background: "rgba(8,6,16,0.6)",
                    minHeight: 280,
                    maxHeight: 460,
                  }}
                >
                  <img
                    src={Q.image}
                    alt={Q.alt}
                    loading={i === 0 ? "eager" : "lazy"}
                    decoding="async"
                    className="rs-image block w-full h-full object-cover"
                    style={{ display: "block" }}
                  />
                  {/* per-quote ambient overlay */}
                  <div
                    className="absolute inset-0 pointer-events-none"
                    style={{
                      background: `radial-gradient(ellipse at 50% 60%, ${Q.accent}1a 0%, transparent 70%)`,
                      mixBlendMode: "screen",
                    }}
                  />
                </div>

                {/* text rendition (WHISPER FLOW typography) */}
                <div className="px-7 py-7 flex flex-col justify-center">
                  <div
                    className="flex items-center gap-2 mb-3"
                  >
                    <span
                      className="rs-pulse"
                      style={{
                        width: 6,
                        height: 6,
                        borderRadius: "50%",
                        background: Q.accent,
                        boxShadow: `0 0 8px ${Q.accent}`,
                        display: "inline-block",
                      }}
                    />
                    <span
                      className="text-[10px] uppercase tracking-[0.3em]"
                      style={{ color: C.muted, fontFamily: "Inter, ui-sans-serif, system-ui, sans-serif" }}
                    >
                      Signal · {String(i + 1).padStart(2, "0")} / 05
                    </span>
                  </div>
                  <blockquote
                    className="text-[20px] leading-[1.35] mb-3"
                    style={{
                      color: C.white,
                      fontFamily: "'Cinzel', ui-serif, Georgia, serif",
                      letterSpacing: "0.01em",
                    }}
                  >
                    {Q.caption}
                  </blockquote>
                  <p
                    className="text-[13.5px] leading-relaxed mb-3"
                    style={{ color: C.text, fontFamily: "Inter, ui-sans-serif, system-ui, sans-serif" }}
                  >
                    {Q.body}
                  </p>
                  {Q.closer && (
                    <p
                      className="text-[15px] italic mb-3"
                      style={{ color: Q.accent, fontFamily: "'Cinzel', ui-serif, Georgia, serif" }}
                    >
                      {Q.closer}
                    </p>
                  )}
                  <div className="mt-2 flex items-center gap-2">
                    <span
                      className="text-[10px] uppercase tracking-[0.25em]"
                      style={{ color: Q.accent, fontFamily: "Inter, ui-sans-serif, system-ui, sans-serif" }}
                    >
                      {Q.tag}
                    </span>
                  </div>
                </div>
              </div>
            </article>
          ))}
        </div>

        {/* coda */}
        <div className="rs-fadein mt-12 max-w-3xl" style={{ animationDelay: "900ms" }}>
          <div className="h-px mb-5" style={{ background: `linear-gradient(90deg, transparent 0%, ${C.cyan}33 25%, ${C.gold}33 50%, ${C.violet}33 75%, transparent 100%)` }} />
          <p
            className="text-[13.5px] leading-relaxed italic"
            style={{ color: C.text, fontFamily: "'Cinzel', ui-serif, Georgia, serif" }}
          >
            Five small instructions, one continuous posture — <span style={{ color: C.cyan }}>signal over noise</span>,{" "}
            <span style={{ color: C.gold }}>quiet over loud</span>, <span style={{ color: C.amber }}>presence over performance</span>,{" "}
            <span style={{ color: C.rose }}>credit where the heat is</span>, <span style={{ color: C.violet }}>rising without permission</span>.
            This is the voice the system listens for, and the voice it tries to return.
          </p>
          <p className="mt-4 text-[20px] tracking-[0.18em]" style={{ color: C.gold }}>
            BUILT TO FEEL.
          </p>
        </div>
      </div>
    </div>
  );
}
