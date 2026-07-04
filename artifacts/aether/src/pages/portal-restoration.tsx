import { useEffect, useRef } from "react";
import restorationImg from "@assets/2E4D299F-AE6C-4A8D-A146-E888B177F6A0_1782493532725.png";

const V = {
  bg:"#04060E", aurora:"#00FFB2", gold:"#C8A030", blue:"#4488FF",
  vio:"#9966FF", amb:"#FF9933", rose:"#FF6699", plasma:"#FF4477",
  green:"#44CC77", dim:"#3A5060", ink:"#B8CCE8", fire:"#FF6622",
  shock:"#FFDD22", photon:"#00FFBB", cyan:"#22DDFF",
};
const MONO  = "'Space Mono',monospace";
const SERIF = "'Crimson Pro',serif";
const DISP  = "'Cinzel',serif";
function ha(v:number):string{return Math.round(Math.max(0,Math.min(255,v))).toString(16).padStart(2,"0");}
function Tag({l,c}:{l:string;c:string}){
  return <span style={{display:"inline-block",padding:"2px 8px",margin:"0 4px 4px 0",
    background:c+"22",border:`1px solid ${c}44`,borderRadius:3,
    fontFamily:MONO,fontSize:9,color:c,letterSpacing:"0.12em"}}>{l}</span>;
}

/* 7-step restoration flow */
const FLOW_STEPS = [
  { id:"NATURAL LIGHT",          col:V.shock, icon:"☀",
    sub:"Exposure to sunlight synchronises the body clock." },
  { id:"CIRCADIAN RHYTHM",       col:V.gold,  icon:"⏰",
    sub:"Internal rhythms align with day/night cycles." },
  { id:"REST & RECOVERY",        col:V.blue,  icon:"🛏",
    sub:"Sleep and rest restore energy and repair systems." },
  { id:"MEDITATION & REFLECTION",col:V.vio,   icon:"◎",
    sub:"Mind quiets. Awareness expands." },
  { id:"PHYSIOLOGICAL REGULATION",col:V.green,icon:"⚙",
    sub:"Nervous system stabilises. Hormones and immunity balance." },
  { id:"MENTAL CLARITY",         col:V.cyan,  icon:"◈",
    sub:"Focus improves. Emotions stabilise. Intuition sharpens." },
  { id:"INTERNAL COHERENCE",     col:V.aurora,icon:"✦",
    sub:"Alignment within. Energy radiates outward." },
];

/* ── Live Canvas ─────────────────────────────────────────────── */
function RestorationCanvas() {
  const ref = useRef<HTMLCanvasElement>(null);
  const raf = useRef(0);
  useEffect(() => {
    const cv = ref.current; if (!cv) return;
    const ctx = cv.getContext("2d")!;
    const W = cv.width, H = cv.height;
    let t = 0;

    /* particle pool for flow */
    type FPt = { step:number; progress:number; speed:number; y:number; alpha:number };
    const fparts: FPt[] = [];
    function spawnFPart() {
      fparts.push({ step:0, progress:Math.random(), speed:0.004+Math.random()*0.003,
        y: Math.random()*6-3, alpha:0.8+Math.random()*0.2 });
    }
    for (let i=0; i<30; i++) spawnFPart();

    const N = FLOW_STEPS.length;
    const PAD = 40;
    const nodeW = (W - PAD*2) / (N - 1);
    const nodeY = H * 0.56;

    function nodeX(i:number) { return PAD + i * nodeW; }

    /* circadian arc */
    const ARC_CX = W * 0.5;
    const ARC_CY = H * 0.28;
    const ARC_R  = H * 0.22;

    function draw() {
      ctx.clearRect(0,0,W,H);
      ctx.fillStyle = V.bg; ctx.fillRect(0,0,W,H);

      /* ── Circadian Arc ── */
      /* dawn-to-dusk arc (left to right) */
      ctx.beginPath();
      ctx.arc(ARC_CX, ARC_CY, ARC_R, Math.PI, 0, false);
      ctx.strokeStyle = V.dim + "44"; ctx.lineWidth = 1.5;
      ctx.setLineDash([4,4]); ctx.stroke(); ctx.setLineDash([]);

      /* sun position along arc: t modulates through the day */
      const dayFrac = (Math.sin(t * 0.15) + 1) * 0.5; /* 0=dawn, 1=dusk */
      const sunAngle = Math.PI - dayFrac * Math.PI; /* left to right */
      const sunX = ARC_CX + ARC_R * Math.cos(sunAngle);
      const sunY = ARC_CY + ARC_R * Math.sin(sunAngle);

      /* sun glow */
      const sgrd = ctx.createRadialGradient(sunX, sunY, 0, sunX, sunY, 22);
      sgrd.addColorStop(0, V.shock + "FF");
      sgrd.addColorStop(0.5, V.gold + "AA");
      sgrd.addColorStop(1, V.gold + "00");
      ctx.beginPath(); ctx.arc(sunX, sunY, 22, 0, Math.PI * 2);
      ctx.fillStyle = sgrd; ctx.fill();
      /* sun core */
      ctx.beginPath(); ctx.arc(sunX, sunY, 8, 0, Math.PI * 2);
      ctx.fillStyle = V.shock; ctx.fill();

      /* 12:12 portal marker */
      const p1212X = ARC_CX; /* noon = top of arc */
      const p1212Y = ARC_CY - ARC_R;
      const portalPulse = 1 + 0.15 * Math.sin(t * 3);
      ctx.beginPath(); ctx.arc(p1212X, p1212Y, 9 * portalPulse, 0, Math.PI * 2);
      ctx.strokeStyle = V.aurora + ha(120 + 60 * Math.sin(t * 3));
      ctx.lineWidth = 1.5; ctx.stroke();
      ctx.beginPath(); ctx.arc(p1212X, p1212Y, 4, 0, Math.PI * 2);
      ctx.fillStyle = V.aurora + "CC"; ctx.fill();
      ctx.fillStyle = V.aurora + "88"; ctx.font = `7px ${MONO}`; ctx.textAlign = "center";
      ctx.fillText("12:12", p1212X, p1212Y - 16);
      ctx.fillText("PORTAL", p1212X, p1212Y - 8);

      /* horizon line */
      ctx.beginPath();
      ctx.moveTo(ARC_CX - ARC_R - 12, ARC_CY);
      ctx.lineTo(ARC_CX + ARC_R + 12, ARC_CY);
      ctx.strokeStyle = V.gold + "33"; ctx.lineWidth = 1; ctx.stroke();

      /* RISE label left, MIDNIGHT label right */
      ctx.fillStyle = V.gold + "66"; ctx.font = `7px ${MONO}`;
      ctx.textAlign = "center";
      ctx.fillText("RISE", ARC_CX - ARC_R - 2, ARC_CY + 12);
      ctx.fillText("SET",  ARC_CX + ARC_R + 2, ARC_CY + 12);

      /* moon / midnight hint below arc center */
      const moonY = ARC_CY + 26;
      ctx.beginPath(); ctx.arc(ARC_CX, moonY, 6, 0, Math.PI * 2);
      ctx.strokeStyle = V.vio + "55"; ctx.lineWidth = 1; ctx.stroke();
      ctx.fillStyle = V.vio + "44"; ctx.fill();
      ctx.fillStyle = V.vio + "55"; ctx.font = `6px ${MONO}`; ctx.textAlign = "center";
      ctx.fillText("MIDNIGHT", ARC_CX, moonY + 16);

      /* ── Flow connection line ── */
      ctx.beginPath();
      ctx.moveTo(nodeX(0), nodeY);
      ctx.lineTo(nodeX(N - 1), nodeY);
      ctx.strokeStyle = V.dim + "33"; ctx.lineWidth = 2; ctx.stroke();

      /* ── Flow particles ── */
      for (let i = fparts.length - 1; i >= 0; i--) {
        const fp = fparts[i];
        fp.progress += fp.speed;
        if (fp.progress >= 1) { fparts.splice(i, 1); spawnFPart(); continue; }
        /* interpolate across nodes */
        const totalX = fp.progress * (N - 1);
        const si = Math.floor(totalX);
        const sf = totalX - si;
        if (si >= N - 1) continue;
        const x = nodeX(si) + sf * nodeW;
        const y = nodeY + fp.y;
        const col = FLOW_STEPS[Math.min(si, N - 1)].col;
        if (!isFinite(x)||!isFinite(y)) continue;
        ctx.beginPath(); ctx.arc(x, y, 2.5, 0, Math.PI * 2);
        ctx.fillStyle = col + ha(fp.alpha * 180); ctx.fill();
      }

      /* ── Flow Nodes ── */
      FLOW_STEPS.forEach((step, i) => {
        const nx = nodeX(i), ny = nodeY;
        const active = 0.5 + 0.5 * Math.sin(t * 1.4 + i * 0.9);
        /* connector arrow */
        if (i < N - 1) {
          ctx.beginPath();
          ctx.moveTo(nx + 18, ny);
          ctx.lineTo(nodeX(i + 1) - 18, ny);
          ctx.strokeStyle = step.col + ha(30 + 30 * active);
          ctx.lineWidth = 1; ctx.stroke();
          /* arrowhead */
          const ax = nodeX(i + 1) - 18;
          ctx.beginPath();
          ctx.moveTo(ax, ny - 4); ctx.lineTo(ax + 6, ny); ctx.lineTo(ax, ny + 4);
          ctx.strokeStyle = step.col + ha(60); ctx.lineWidth = 1; ctx.stroke();
        }
        /* node glow */
        const gr = ctx.createRadialGradient(nx, ny, 0, nx, ny, 22);
        gr.addColorStop(0, step.col + ha(active * 80));
        gr.addColorStop(1, step.col + "00");
        ctx.beginPath(); ctx.arc(nx, ny, 22, 0, Math.PI * 2);
        ctx.fillStyle = gr; ctx.fill();
        /* node circle */
        ctx.beginPath(); ctx.arc(nx, ny, 14, 0, Math.PI * 2);
        ctx.strokeStyle = step.col + ha(120 + 80 * active); ctx.lineWidth = 1.5; ctx.stroke();
        ctx.fillStyle = step.col + ha(active * 40); ctx.fill();
        /* special glow for final node */
        if (i === N - 1) {
          const fp2 = 1 + 0.25 * Math.sin(t * 2);
          ctx.beginPath(); ctx.arc(nx, ny, 20 * fp2, 0, Math.PI * 2);
          ctx.strokeStyle = V.aurora + ha(50 + 40 * Math.sin(t * 2));
          ctx.lineWidth = 2; ctx.stroke();
        }
        /* icon */
        ctx.fillStyle = step.col; ctx.font = `11px ${MONO}`;
        ctx.textAlign = "center"; ctx.textBaseline = "middle";
        ctx.fillText(step.icon, nx, ny);
        ctx.textBaseline = "alphabetic";
        /* label below */
        ctx.fillStyle = step.col + ha(140 + 80 * active);
        ctx.font = `6px ${MONO}`; ctx.textAlign = "center";
        const words = step.id.split(" ");
        words.forEach((w, wi) => {
          ctx.fillText(w, nx, ny + 22 + wi * 9);
        });
      });

      /* ── "Glow From the Inside Out" arc label ── */
      const loopPulse = 0.5 + 0.5 * Math.sin(t * 0.8);
      ctx.fillStyle = V.aurora + ha(80 + 60 * loopPulse);
      ctx.font = `italic 9px ${SERIF}`;
      ctx.textAlign = "center";
      ctx.fillText('"Glow From the Inside Out"', W * 0.5, nodeY + 68);

      /* feedback arrow (loop) */
      ctx.beginPath();
      ctx.arc(W * 0.5, nodeY + 50, W * 0.42, 0, Math.PI, true);
      ctx.setLineDash([3, 6]);
      ctx.strokeStyle = V.aurora + ha(20 + 15 * loopPulse);
      ctx.lineWidth = 1; ctx.stroke(); ctx.setLineDash([]);

      t += 0.012;
    }

    function loop() { draw(); raf.current = requestAnimationFrame(loop); }
    loop();
    return () => cancelAnimationFrame(raf.current);
  }, []);

  return <canvas ref={ref} width={860} height={400}
    style={{ width:"100%", height:400, display:"block", borderRadius:"0 0 4px 4px" }}/>;
}

/* ── Page ──────────────────────────────────────────────────────── */
export default function PortalRestorationPage() {
  return (
    <div style={{ background:V.bg, minHeight:"100vh", color:V.ink,
      fontFamily:MONO, paddingBottom:80 }}>
      {/* tags */}
      <div style={{ padding:"10px 24px", borderBottom:`1px solid ${V.dim}44`,
        display:"flex", flexWrap:"wrap", gap:4 }}>
        {[["PORTAL STATES",V.aurora],["RESTORATION",V.gold],["INNER RESONANCE",V.vio],
          ["CIRCADIAN ALIGNMENT",V.cyan],["12:12 PORTAL",V.rose],["AETHER MODULE",V.blue],
        ].map(([l,c])=><Tag key={l} l={l} c={c}/>)}
      </div>

      {/* header */}
      <div style={{ padding:"44px 32px 20px", maxWidth:980, margin:"0 auto" }}>
        <div style={{ fontFamily:MONO, fontSize:10, color:V.aurora,
          letterSpacing:"0.2em", marginBottom:12 }}>
          AETHER MODULE · PORTAL STATES · RESTORATION · INNER RESONANCE
        </div>
        <h1 style={{ fontFamily:DISP, fontSize:"clamp(20px,3.8vw,40px)",
          color:V.ink, margin:"0 0 10px", lineHeight:1.1 }}>
          Portal States<br/>
          <span style={{ color:V.aurora }}>Restoration · Inner Resonance</span>
        </h1>
        <div style={{ display:"flex", gap:32, flexWrap:"wrap", marginTop:16 }}>
          <p style={{ fontFamily:SERIF, fontSize:15, color:V.ink+"99",
            lineHeight:1.75, margin:0, maxWidth:440 }}>
            Rest is not inactivity — it is system maintenance. Across biological and
            engineered systems, restoration sustains stability, coherence, and performance.
            Human restoration works in harmony with solar activity, geomagnetic processes,
            atmospheric dynamics, and environmental time scales.
          </p>
          <div style={{ flex:1, minWidth:220, padding:16,
            background:V.aurora+"08", border:`1px solid ${V.aurora}22`, borderRadius:4 }}>
            <div style={{ fontFamily:DISP, fontSize:13, color:V.aurora, marginBottom:12 }}>
              INTERNAL STATE
            </div>
            <div style={{ fontFamily:DISP, fontSize:16, color:V.ink, marginBottom:6, lineHeight:1.3 }}>
              Extremely alluring<br/>and magnetic.
            </div>
            <div style={{ fontFamily:SERIF, fontSize:13, color:V.aurora, fontStyle:"italic" }}>
              Glow from the inside out.
            </div>
            <div style={{ marginTop:10, fontFamily:SERIF, fontSize:11, color:V.ink+"55", lineHeight:1.6 }}>
              In AETHER, this describes a state of coherence — where health, attention, emotional
              balance, and outward expression become aligned. Personal coherence amplifies the entire system.
            </div>
          </div>
        </div>
      </div>

      <div style={{ maxWidth:980, margin:"0 auto", padding:"0 32px" }}>

        {/* canvas */}
        <div style={{ border:`1px solid ${V.dim}`, borderRadius:"4px 4px 0 0", overflow:"hidden" }}>
          <div style={{ padding:"4px 12px", background:V.dim+"22",
            borderBottom:`1px solid ${V.dim}44`, fontFamily:MONO, fontSize:8,
            color:V.aurora+"66", letterSpacing:"0.12em" }}>
            LIVE · CIRCADIAN ARC · 12:12 PORTAL · AETHER RESTORATION FLOW · 7 STEPS
          </div>
          <RestorationCanvas/>
        </div>

        {/* Symbolic References */}
        <div style={{ margin:"32px 0 0" }}>
          <div style={{ borderLeft:`3px solid ${V.gold}`, paddingLeft:14, marginBottom:16 }}>
            <div style={{ fontFamily:MONO, fontSize:10, color:V.gold, letterSpacing:"0.18em" }}>
              SYMBOLIC REFERENCES
            </div>
          </div>
          <div style={{ display:"flex", gap:14, flexWrap:"wrap" }}>
            <div style={{ flex:"1 1 220px", padding:14, background:V.aurora+"08",
              border:`1px solid ${V.aurora}22`, borderRadius:4 }}>
              <div style={{ fontFamily:DISP, fontSize:13, color:V.aurora, marginBottom:6 }}>
                Portal — 12:12
              </div>
              <div style={{ fontFamily:SERIF, fontSize:13, color:V.ink+"77", lineHeight:1.65 }}>
                A moment of alignment and awareness. The noon point on the circadian arc where
                solar energy peaks and inner stillness is most accessible.
              </div>
            </div>
            <div style={{ flex:"1 1 220px", padding:14, background:V.gold+"08",
              border:`1px solid ${V.gold}22`, borderRadius:4 }}>
              <div style={{ fontFamily:DISP, fontSize:13, color:V.gold, marginBottom:6 }}>
                Stonehenge
              </div>
              <div style={{ fontFamily:SERIF, fontSize:13, color:V.ink+"77", lineHeight:1.65 }}>
                Ancient structure aligned with solar cycles and earth energies. A portal in stone —
                marking solstices where sky, land, and human intention meet.
              </div>
            </div>
          </div>
        </div>

        {/* Purpose of Restoration */}
        <div style={{ margin:"32px 0 0" }}>
          <div style={{ borderLeft:`3px solid ${V.blue}`, paddingLeft:14, marginBottom:16 }}>
            <div style={{ fontFamily:MONO, fontSize:10, color:V.blue, letterSpacing:"0.18em" }}>
              PURPOSE OF RESTORATION
            </div>
          </div>
          <div style={{ display:"flex", gap:12, flexWrap:"wrap" }}>
            {[
              { act:"REST",      col:V.blue,  icon:"🛏",
                body:"Replenish the body and mind. Sleep and rest are the primary systems maintenance." },
              { act:"BATH",      col:V.cyan,  icon:"🛁",
                body:"Cleanse, relax, and reset. Water is the medium through which the body recalibrates." },
              { act:"MEDITATION",col:V.vio,   icon:"◎",
                body:"Calm the mind and restore inner balance. The quieted mind is a coherent mind." },
            ].map(r=>(
              <div key={r.act} style={{ flex:"1 1 200px", padding:14, background:r.col+"08",
                border:`1px solid ${r.col}33`, borderRadius:4,
                display:"flex", gap:10, alignItems:"flex-start" }}>
                <span style={{ fontSize:20, lineHeight:1 }}>{r.icon}</span>
                <div>
                  <div style={{ fontFamily:MONO, fontSize:9, color:r.col, letterSpacing:"0.12em", marginBottom:6 }}>
                    {r.act}
                  </div>
                  <div style={{ fontFamily:SERIF, fontSize:13, color:V.ink+"77", lineHeight:1.6 }}>
                    {r.body}
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div style={{ marginTop:10, fontFamily:SERIF, fontSize:12, color:V.ink+"44", fontStyle:"italic" }}>
            These practices represent intentional periods of recovery, allowing physical and mental systems
            to return toward equilibrium.
          </div>
        </div>

        {/* Circadian Alignment */}
        <div style={{ margin:"32px 0 0" }}>
          <div style={{ borderLeft:`3px solid ${V.shock}`, paddingLeft:14, marginBottom:16 }}>
            <div style={{ fontFamily:MONO, fontSize:10, color:V.shock, letterSpacing:"0.18em" }}>
              CIRCADIAN ALIGNMENT
            </div>
          </div>
          <div style={{ display:"flex", gap:12, flexWrap:"wrap" }}>
            <div style={{ flex:"1 1 280px", padding:14, background:V.shock+"08",
              border:`1px solid ${V.shock}33`, borderRadius:4 }}>
              <div style={{ fontFamily:DISP, fontSize:13, color:V.shock, marginBottom:6 }}>
                ☀ Always rise with the Sun.
              </div>
              <div style={{ fontFamily:SERIF, fontSize:13, color:V.ink+"77", lineHeight:1.65 }}>
                Morning light helps regulate your circadian rhythm, mood, and energy.
                Sunlight triggers cortisol → serotonin → melatonin sequence in the correct phase.
              </div>
            </div>
            <div style={{ flex:"1 1 280px", padding:14, background:V.vio+"08",
              border:`1px solid ${V.vio}33`, borderRadius:4 }}>
              <div style={{ fontFamily:DISP, fontSize:13, color:V.vio, marginBottom:6 }}>
                ☾ Midnight / Tonight
              </div>
              <div style={{ fontFamily:SERIF, fontSize:13, color:V.ink+"77", lineHeight:1.65 }}>
                Protect your sleep cycle. Consistent rest supports recovery, clarity, and longevity.
                Deep sleep is when cellular repair, memory consolidation, and glymphatic clearing occur.
              </div>
            </div>
          </div>
        </div>

        {/* 7-step flow detail */}
        <div style={{ margin:"32px 0 0" }}>
          <div style={{ borderLeft:`3px solid ${V.aurora}`, paddingLeft:14, marginBottom:16 }}>
            <div style={{ fontFamily:MONO, fontSize:10, color:V.aurora, letterSpacing:"0.18em" }}>
              AETHER RESTORATION FLOW · 7 STEPS
            </div>
          </div>
          <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
            {FLOW_STEPS.map((step, i) => (
              <div key={step.id} style={{ display:"flex", gap:14, alignItems:"flex-start",
                padding:"12px 14px", background:step.col+"08",
                border:`1px solid ${step.col}22`, borderRadius:4 }}>
                <div style={{ minWidth:28, height:28, borderRadius:"50%", flexShrink:0,
                  background:step.col+"22", border:`1px solid ${step.col}44`,
                  display:"flex", alignItems:"center", justifyContent:"center",
                  fontFamily:MONO, fontSize:10, color:step.col }}>
                  {i + 1}
                </div>
                <div>
                  <div style={{ fontFamily:MONO, fontSize:8, color:step.col,
                    letterSpacing:"0.12em", marginBottom:4 }}>{step.icon}  {step.id}</div>
                  <div style={{ fontFamily:SERIF, fontSize:13, color:V.ink+"77",
                    lineHeight:1.6 }}>{step.sub}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Personal References */}
        <div style={{ margin:"32px 0 0" }}>
          <div style={{ borderLeft:`3px solid ${V.rose}`, paddingLeft:14, marginBottom:16 }}>
            <div style={{ fontFamily:MONO, fontSize:10, color:V.rose, letterSpacing:"0.18em" }}>
              PERSONAL REFERENCES
            </div>
          </div>
          <div style={{ display:"flex", gap:12, flexWrap:"wrap" }}>
            {[["Alex Padilla", V.blue, "Personal reference / reminder."],
            ].map(([name, col, note]) => (
              <div key={name} style={{ flex:"1 1 200px", padding:"12px 16px",
                background:col+"08", border:`1px solid ${col}22`, borderRadius:4,
                display:"flex", gap:10, alignItems:"center" }}>
                <div style={{ width:32, height:32, borderRadius:"50%",
                  background:col+"22", border:`1px solid ${col}44`, flexShrink:0 }}/>
                <div>
                  <div style={{ fontFamily:DISP, fontSize:13, color:col }}>{name}</div>
                  <div style={{ fontFamily:SERIF, fontSize:11, color:V.ink+"44" }}>{note}</div>
                </div>
              </div>
            ))}
          </div>
          <div style={{ marginTop:6, fontFamily:SERIF, fontSize:11,
            color:V.ink+"33", fontStyle:"italic" }}>Stand-alone notes or reminders.</div>
        </div>

        {/* AETHER Guiding Principle footer */}
        <div style={{ margin:"36px 0 0", padding:"20px 24px",
          background:V.aurora+"06", border:`1px solid ${V.aurora}22`, borderRadius:4 }}>
          <div style={{ fontFamily:DISP, fontSize:13, color:V.aurora, marginBottom:12,
            letterSpacing:"0.1em" }}>
            AETHER GUIDING PRINCIPLE
          </div>
          <div style={{ display:"flex", flexWrap:"wrap", gap:18, alignItems:"center" }}>
            {[["◎ Observe","what is.",V.ink+"88"],
              ["☀ Align","with nature.",V.gold],
              ["✦ Restore","what powers you.",V.aurora],
              ["⊛ Integrate","the systems.",V.cyan],
              ["◈ Radiate","your coherence.",V.vio],
            ].map(([verb,obj,col])=>(
              <div key={verb} style={{ display:"flex", flexDirection:"column", alignItems:"center", gap:2 }}>
                <span style={{ fontFamily:MONO, fontSize:9, color:col }}>{verb}</span>
                <span style={{ fontFamily:SERIF, fontSize:11, color:V.ink+"44" }}>{obj}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Reference image */}
        <div style={{ margin:"40px 0 0" }}>
          <div style={{ fontFamily:MONO, fontSize:9, color:V.dim,
            letterSpacing:"0.16em", marginBottom:12 }}>
            REFERENCE SOURCE MATERIAL
          </div>
          <img src={restorationImg} alt="Portal States · Restoration · Inner Resonance"
            style={{ width:"100%", borderRadius:6,
              border:`1px solid ${V.dim}44`, display:"block" }}/>
        </div>

        {/* cross-links */}
        <div style={{ margin:"36px 0 0" }}>
          <div style={{ fontFamily:MONO, fontSize:9, color:V.dim,
            letterSpacing:"0.16em", marginBottom:12 }}>RELATED SYSTEMS</div>
          <div style={{ display:"flex", flexWrap:"wrap", gap:8 }}>
            {[["/earth-living-system","Earth Living System",V.aurora],
              ["/divine-timing","Divine Timing",V.vio],
              ["/gut-brain","Gut-Brain Axis",V.blue],
              ["/aether-flow","AETHER Flow",V.gold],
              ["/lunar-coherence","Lunar Coherence",V.cyan],
            ].map(([path,label,col])=>(
              <a key={path} href={path} style={{ fontFamily:MONO, fontSize:9, color:col,
                letterSpacing:"0.1em", textDecoration:"none", padding:"4px 10px",
                border:`1px solid ${col}44`, borderRadius:3 }}>{label} →</a>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
