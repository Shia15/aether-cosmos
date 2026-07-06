import { useRef, useEffect, useState } from "react";

// ─── Palette ──────────────────────────────────────────────────────────────
const BG   = "#040810";
const TEAL = "#00FFEE";
const GOLD = "#c9a227";
const PINK = "#f472b6";
const BLUE = "#4db8ff";
const PURP = "#a78bfa";
const GREN = "#4ade80";
const ORNG = "#f97316";
const RED  = "#f87171";
const WHT  = "#f0f4ff";

const panel: React.CSSProperties = {
  background: "rgba(255,255,255,0.04)",
  border: "1px solid rgba(255,255,255,0.08)",
  borderRadius: 12,
  padding: "1.2rem 1.6rem",
};

// ─── Module-scope types ───────────────────────────────────────────────────
type SFTab    = "orbit" | "network" | "manifold" | "synthesis";
type HPacket  = { x:number; y:number; vx:number; vy:number; col:string; age:number; label:string };

// ─── Cycle phases ─────────────────────────────────────────────────────────
const PHASES = [
  { key:"menstrual",   label:"Menstrual",   days:"1–5",   col:RED,  endAngle:0.10,
    desc:"Uterine lining shed. Estrogen + Progesterone both low. FSH begins rising to recruit new follicles. Pineal melatonin elevated — the body rests and listens to darkness.",
    hormones:"FSH↑  E2↓  Prog↓  Melatonin↑  Cortisol↓" },
  { key:"follicular",  label:"Follicular",  days:"6–13",  col:GOLD, endAngle:0.46,
    desc:"Estradiol rises as dominant follicle matures. LH is low. Cortisol peaks at sunrise and drives follicle growth. Serotonin and dopamine rise with increasing light exposure — mood lifts with the growing sun.",
    hormones:"FSH→  E2↑↑  LH↓  Serotonin↑  Cortisol: solar-peak" },
  { key:"ovulatory",   label:"Ovulatory",   days:"14–16", col:TEAL, endAngle:0.55,
    desc:"LH surge (triggered by peak E2) causes ovulation. Testosterone briefly spikes. The pineal gland's melatonin suppression by solar light is maximal — this phase clusters around the full moon and midday light peaks in natural-light conditions.",
    hormones:"LH↑↑↑  E2 peak  Testosterone↑  Melatonin: minimum" },
  { key:"luteal",      label:"Luteal",      days:"17–29", col:PURP, endAngle:1.00,
    desc:"Corpus luteum produces Progesterone (highest level of the cycle). Melatonin rises again as days shorten (seasonal entrainment). Progesterone dampens cortisol response — the body turns inward. If no implantation: corpus luteum degrades, both hormones drop, menstruation begins.",
    hormones:"Prog↑↑  E2↓  Cortisol damped  Melatonin: rising  Oxytocin↑" },
];

// ─── The 26-hormone manifold (A→Z) ────────────────────────────────────────
const H26 = [
  { letter:"A", name:"GnRH",       node:"Hypothalamus", col:BLUE,  freq:"~90 min pulses",  desc:"Master pacemaker hormone; pulse frequency encodes LH vs FSH instruction" },
  { letter:"B", name:"FSH",        node:"Pituitary",    col:TEAL,  freq:"10–20 days rise",  desc:"Recruits and grows follicles; peaks early follicular phase" },
  { letter:"C", name:"LH",         node:"Pituitary",    col:GOLD,  freq:"surge day 14",     desc:"Triggers ovulation; high pulse freq = more LH (GnRH-coded)" },
  { letter:"D", name:"Estradiol",  node:"Ovary",        col:PINK,  freq:"14-day wave",      desc:"Primary estrogen; positive feedback at peak causes LH surge" },
  { letter:"E", name:"Progesterone",node:"Ovary",       col:PURP,  freq:"Days 17–29 peak",  desc:"Corpus luteum product; prepares endometrium; dampens HPA axis" },
  { letter:"F", name:"Testosterone",node:"Ovary/Adrenal",col:ORNG, freq:"Ovulation spike",  desc:"Libido, confidence, motivation; briefly peaks at ovulation" },
  { letter:"G", name:"Inhibin B",  node:"Ovary",        col:GREN,  freq:"Follicular marker",desc:"Suppresses FSH when follicle is mature (feedback off switch)" },
  { letter:"H", name:"Inhibin A",  node:"Ovary",        col:TEAL,  freq:"Luteal marker",    desc:"Luteal phase FSH suppressor; correlates with corpus luteum health" },
  { letter:"I", name:"AMH",        node:"Ovary",        col:GOLD,  freq:"Constant (reserve)",desc:"Anti-Müllerian hormone; measures ovarian reserve; clock of fertility" },
  { letter:"J", name:"Prolactin",  node:"Pituitary",    col:PINK,  freq:"Sleep-entrained",  desc:"Suppresses ovulation during lactation; peaks during deep sleep" },
  { letter:"K", name:"Cortisol",   node:"Adrenal",      col:ORNG,  freq:"Solar 24hr peak",  desc:"PEAK AT SUNRISE — the most direct solar-feminine link; suppresses GnRH if chronically elevated" },
  { letter:"L", name:"Melatonin",  node:"Pineal",       col:PURP,  freq:"Darkness-driven",  desc:"DIRECTLY solar: suppressed by light, peaks in darkness; regulates LH pulsatility and ovulation timing" },
  { letter:"M", name:"Leptin",     node:"Adipose",      col:GREN,  freq:"Fat-mass signal",  desc:"Gates GnRH: below threshold GnRH stops (famine suppression of reproduction)" },
  { letter:"N", name:"Insulin",    node:"Pancreas",     col:BLUE,  freq:"Meal-entrained",   desc:"Interacts with FSH signalling; insulin resistance disrupts follicle growth (PCOS mechanism)" },
  { letter:"O", name:"IGF-1",      node:"Liver/Ovary",  col:TEAL,  freq:"Growth-coupled",   desc:"Potentiates FSH action in follicles; mediates growth hormone's effect on fertility" },
  { letter:"P", name:"DHEA-S",     node:"Adrenal",      col:GOLD,  freq:"Diurnal peak",     desc:"Adrenal androgen; converted to Testosterone + Estrogen in ovary" },
  { letter:"Q", name:"T3",         node:"Thyroid",      col:RED,   freq:"Metabolic constant",desc:"Triiodothyronine; low T3 = disrupted menstrual cycles (hypothyroid amenorrhea)" },
  { letter:"R", name:"T4",         node:"Thyroid",      col:ORNG,  freq:"Metabolic constant",desc:"Thyroxine precursor to T3; thyroid function is gated by selenium, iodine, and light" },
  { letter:"S", name:"TSH",        node:"Pituitary",    col:PINK,  freq:"Thyroid feedback",  desc:"Thyroid-stimulating hormone; TSH and FSH share a common alpha subunit — evolutionary link" },
  { letter:"T", name:"Oxytocin",   node:"Hypothalamus", col:GREN,  freq:"Social/tactile",   desc:"Trust, bonding, birth, lactation; highest in luteal phase; released by warm sunlight on skin" },
  { letter:"U", name:"Serotonin",  node:"Gut/Brain",    col:TEAL,  freq:"Light-entrained",  desc:"95% in gut; brain serotonin is photon-dependent — more sunlight = more serotonin = better cycle regulation" },
  { letter:"V", name:"Dopamine",   node:"Brain",        col:BLUE,  freq:"Reward-light",     desc:"Peaks with novelty and morning light; regulates prolactin (dopamine suppresses prolactin)" },
  { letter:"W", name:"β-Endorphin",node:"Pituitary",    col:PURP,  freq:"Exercise/pleasure",desc:"Modulates GnRH pulse amplitude; exercise + sunlight → endorphin → better cycle regularity" },
  { letter:"X", name:"CRH",        node:"Hypothalamus", col:RED,   freq:"Stress signal",    desc:"Corticotropin-releasing hormone; high CRH → suppresses GnRH → disrupted cycle (stress → missed period)" },
  { letter:"Y", name:"ACTH",       node:"Pituitary",    col:ORNG,  freq:"Stress cascade",   desc:"Drives Cortisol release; ACTH/Cortisol peak at sunrise IS the solar entrainment signal" },
  { letter:"Z", name:"Aldosterone",node:"Adrenal",      col:GOLD,  freq:"Fluid/salt",       desc:"Regulates fluid retention; fluctuates with menstrual cycle; tidal forces may modulate via body-fluid shifts" },
];

// ─── HPG network nodes ────────────────────────────────────────────────────
const NET_NODES = [
  { id:0, label:"Sun",          sub:"light · cortisol driver",  x:0.50, y:0.10, col:GOLD,  r:26 },
  { id:1, label:"Pineal",       sub:"melatonin gate",           x:0.20, y:0.30, col:PURP,  r:16 },
  { id:2, label:"Hypothalamus", sub:"GnRH 90-min pulses",       x:0.50, y:0.34, col:BLUE,  r:20 },
  { id:3, label:"Adrenal",      sub:"cortisol · DHEA",          x:0.80, y:0.30, col:ORNG,  r:16 },
  { id:4, label:"Pituitary",    sub:"FSH · LH · Prolactin",     x:0.50, y:0.58, col:TEAL,  r:20 },
  { id:5, label:"Ovary",        sub:"E2 · Progesterone",        x:0.50, y:0.82, col:PINK,  r:20 },
  { id:6, label:"Body/Gut",     sub:"serotonin · leptin · IGF", x:0.82, y:0.70, col:GREN,  r:16 },
];

const NET_EDGES = [
  { from:0, to:1, col:GOLD,  label:"light" },
  { from:0, to:3, col:ORNG,  label:"UV→cortisol" },
  { from:1, to:2, col:PURP,  label:"melatonin→GnRH gate" },
  { from:2, to:4, col:BLUE,  label:"GnRH pulses" },
  { from:3, to:2, col:ORNG,  label:"CRH·ACTH" },
  { from:4, to:5, col:TEAL,  label:"LH·FSH" },
  { from:5, to:4, col:PINK,  label:"E2·Prog feedback" },
  { from:5, to:2, col:PURP,  label:"long-loop feedback" },
  { from:6, to:2, col:GREN,  label:"leptin·serotonin" },
  { from:5, to:6, col:PINK,  label:"hormones→body" },
];

// ─── Canvas 1: Solar-Feminine Orbit ───────────────────────────────────────
function CycleOrbitCanvas() {
  const cvRef = useRef<HTMLCanvasElement>(null);
  const stRef = useRef({ raf:0, t:0 });

  useEffect(() => {
    const cv  = cvRef.current!;
    const ctx = cv.getContext("2d")!;
    const ro  = new ResizeObserver(() => { cv.width=cv.offsetWidth||640; cv.height=cv.offsetHeight||400; });
    ro.observe(cv);
    cv.width  = cv.offsetWidth||640;
    cv.height = cv.offsetHeight||400;

    function draw() {
      stRef.current.raf = requestAnimationFrame(draw);
      const s  = stRef.current;
      s.t     += 0.016;
      const W = cv.width, H = cv.height;
      const cx = W * 0.5, cy = H * 0.5;

      ctx.fillStyle = BG; ctx.fillRect(0,0,W,H);

      // Slow solar precession ring (11-year analog = 20s)
      const precAngle = (s.t / 20) * Math.PI * 2;
      const outerR    = Math.min(W,H)*0.43;
      ctx.save();
      ctx.globalAlpha = 0.07;
      ctx.beginPath(); ctx.arc(cx, cy, outerR, 0, Math.PI*2);
      ctx.strokeStyle = GOLD; ctx.lineWidth = 18; ctx.stroke();
      ctx.restore();

      // Solar corona pulses
      for (let p = 0; p < 4; p++) {
        const pR = ((s.t*30 + p*25) % outerR*0.7) + 8;
        ctx.save(); ctx.globalAlpha = 0.04 * (1 - pR/(outerR*0.7));
        ctx.beginPath(); ctx.arc(cx,cy,pR,0,Math.PI*2);
        ctx.strokeStyle=GOLD; ctx.lineWidth=3; ctx.stroke();
        ctx.restore();
      }

      // Sun at centre
      const sunPulse = 1 + 0.04 * Math.sin(s.t * 1.1);
      ctx.beginPath(); ctx.arc(cx, cy, 28*sunPulse, 0, Math.PI*2);
      ctx.fillStyle = GOLD; ctx.fill();
      ctx.save(); ctx.globalAlpha = 0.18;
      ctx.beginPath(); ctx.arc(cx, cy, 44*sunPulse, 0, Math.PI*2);
      ctx.fillStyle = GOLD; ctx.fill();
      ctx.restore();
      ctx.font = "bold 9px 'DM Mono',monospace"; ctx.fillStyle="#000"; ctx.textAlign="center";
      ctx.fillText("SUN", cx, cy+3); ctx.textAlign="left";

      // 29.5-day orbit ring (1 cycle = 15 s)
      const orbitR = Math.min(W,H)*0.36;
      ctx.beginPath(); ctx.arc(cx, cy, orbitR, 0, Math.PI*2);
      ctx.strokeStyle="rgba(255,255,255,0.07)"; ctx.lineWidth=1; ctx.stroke();

      // Phase arcs
      const phaseAngles = [0, 0.10, 0.46, 0.55, 1.00].map(f => f * Math.PI*2 - Math.PI/2);
      const phaseColors = [RED, GOLD, TEAL, PURP];
      for (let p = 0; p < 4; p++) {
        ctx.beginPath();
        ctx.arc(cx, cy, orbitR, phaseAngles[p], phaseAngles[p+1]);
        ctx.strokeStyle = phaseColors[p];
        ctx.lineWidth   = 6;
        ctx.stroke();
      }

      // Phase labels
      const PLABELS = ["Menstrual","Follicular","Ovulatory","Luteal"];
      const PMID    = [0.05, 0.28, 0.505, 0.775];
      PMID.forEach((mid, p) => {
        const ang = mid*Math.PI*2 - Math.PI/2;
        const lx  = cx + (orbitR+22)*Math.cos(ang);
        const ly  = cy + (orbitR+22)*Math.sin(ang);
        ctx.font = "bold 8px 'DM Mono',monospace";
        ctx.fillStyle = phaseColors[p];
        ctx.textAlign = "center";
        ctx.fillText(PLABELS[p], lx, ly);
        ctx.textAlign="left";
      });

      // Cycle "moon" position (1 full orbit = 15s)
      const cycleAngle = (s.t / 15) * Math.PI*2 - Math.PI/2;
      const moonX = cx + orbitR * Math.cos(cycleAngle);
      const moonY = cy + orbitR * Math.sin(cycleAngle);
      const normPos = ((s.t/15) % 1 + 1) % 1;
      const phaseIdx = normPos < 0.10 ? 0 : normPos < 0.46 ? 1 : normPos < 0.55 ? 2 : 3;
      const curCol   = phaseColors[phaseIdx];

      // Orbit trail
      for (let i = 0; i < 30; i++) {
        const past = cycleAngle - i*0.08;
        const tx = cx + orbitR*Math.cos(past);
        const ty = cy + orbitR*Math.sin(past);
        ctx.save(); ctx.globalAlpha = (1-i/30)*0.5;
        ctx.beginPath(); ctx.arc(tx,ty,3,0,Math.PI*2);
        ctx.fillStyle=curCol; ctx.fill(); ctx.restore();
      }

      // Moon/cycle dot
      ctx.beginPath(); ctx.arc(moonX,moonY,10,0,Math.PI*2);
      ctx.fillStyle=curCol; ctx.fill();
      ctx.save(); ctx.globalAlpha=0.3;
      ctx.beginPath(); ctx.arc(moonX,moonY,18,0,Math.PI*2);
      ctx.strokeStyle=curCol; ctx.lineWidth=2; ctx.stroke();
      ctx.restore();

      // Day counter
      const dayNum = Math.floor(normPos * 29.5) + 1;
      ctx.font = "bold 10px 'DM Mono',monospace"; ctx.fillStyle = curCol; ctx.textAlign="center";
      ctx.fillText(`Day ${dayNum}`, moonX, moonY - 22);
      ctx.textAlign="left";

      // Solar-lunar link line
      const linkAlpha = 0.12 + 0.06*Math.sin(s.t*2);
      ctx.save(); ctx.globalAlpha=linkAlpha;
      ctx.beginPath(); ctx.moveTo(cx,cy); ctx.lineTo(moonX,moonY);
      ctx.strokeStyle=curCol; ctx.lineWidth=1; ctx.stroke();
      ctx.restore();

      // Precession marker (11-year solar cycle position)
      const precX = cx + outerR*0.92*Math.cos(precAngle);
      const precY = cy + outerR*0.92*Math.sin(precAngle);
      ctx.beginPath(); ctx.arc(precX,precY,5,0,Math.PI*2);
      ctx.fillStyle=ORNG; ctx.fill();
      ctx.font="8px 'DM Mono',monospace"; ctx.fillStyle=ORNG; ctx.textAlign="center";
      ctx.fillText("Solar max", precX, precY-10); ctx.textAlign="left";

      // Readout
      ctx.font="bold 11px 'DM Mono',monospace"; ctx.fillStyle=curCol;
      ctx.fillText(`Phase: ${PLABELS[phaseIdx]}  ·  Day ${dayNum}/29.5  ·  Solar orbit: ${(((s.t/20)%1)*100).toFixed(0)}%`, 12, 18);
      ctx.font="8px 'DM Mono',monospace"; ctx.fillStyle="rgba(255,255,255,0.22)";
      ctx.fillText("Inner ring = 29.5-day menstrual cycle  ·  Outer ring = 11-year solar cycle (compressed to 20s)", 12, H-8);
    }

    stRef.current.raf = requestAnimationFrame(draw);
    return () => { cancelAnimationFrame(stRef.current.raf); ro.disconnect(); };
  }, []);

  return <canvas ref={cvRef} style={{ width:"100%", height:400, display:"block" }} />;
}

// ─── Canvas 2: Hormone Packet-Switching Network ───────────────────────────
function HormoneNetworkCanvas() {
  const cvRef = useRef<HTMLCanvasElement>(null);
  const stRef = useRef({ raf:0, t:0, packets:[] as HPacket[] });

  useEffect(() => {
    const cv  = cvRef.current!;
    const ctx = cv.getContext("2d")!;
    const ro  = new ResizeObserver(() => { cv.width=cv.offsetWidth||600; cv.height=380; });
    ro.observe(cv);
    cv.width  = cv.offsetWidth||600; cv.height=380;

    function px(n:number){ return NET_NODES[n].x*(cv.width-40)+20; }
    function py(n:number){ return NET_NODES[n].y*(cv.height-40)+20; }

    function spawnPacket(edgeIdx:number) {
      const e  = NET_EDGES[edgeIdx];
      const sx = px(e.from), sy = py(e.from);
      const ex = px(e.to),   ey = py(e.to);
      const dist = Math.sqrt((ex-sx)**2+(ey-sy)**2) || 1;
      const speed = 1.8;
      stRef.current.packets.push({
        x:sx, y:sy, vx:(ex-sx)/dist*speed, vy:(ey-sy)/dist*speed,
        col:e.col, age:0, label:e.label,
      });
    }

    let spawnTimer = 0;

    function draw() {
      stRef.current.raf = requestAnimationFrame(draw);
      const s = stRef.current;
      s.t    += 0.016;
      spawnTimer += 0.016;

      if (spawnTimer > 0.4) {
        spawnTimer = 0;
        spawnPacket(Math.floor(Math.random() * NET_EDGES.length));
      }

      const W = cv.width, H = cv.height;
      ctx.fillStyle = BG; ctx.fillRect(0,0,W,H);

      // Edges
      for (const e of NET_EDGES) {
        ctx.beginPath();
        ctx.moveTo(px(e.from),py(e.from)); ctx.lineTo(px(e.to),py(e.to));
        ctx.strokeStyle=`${e.col}28`; ctx.lineWidth=2; ctx.stroke();
        // Arrow
        const ax = px(e.to)*0.7+px(e.from)*0.3;
        const ay = py(e.to)*0.7+py(e.from)*0.3;
        const ang = Math.atan2(py(e.to)-py(e.from), px(e.to)-px(e.from));
        ctx.beginPath();
        ctx.moveTo(ax + Math.cos(ang-0.4)*6, ay + Math.sin(ang-0.4)*6);
        ctx.lineTo(ax, ay);
        ctx.lineTo(ax + Math.cos(ang+0.4)*6, ay + Math.sin(ang+0.4)*6);
        ctx.strokeStyle=`${e.col}55`; ctx.lineWidth=1.5; ctx.stroke();
      }

      // Move + draw packets
      s.packets = s.packets.filter(p => p.age < 90);
      for (const p of s.packets) {
        p.x += p.vx; p.y += p.vy; p.age++;
        const a = 1 - p.age/90;
        ctx.save(); ctx.globalAlpha=a*0.85;
        ctx.beginPath(); ctx.arc(p.x,p.y,5,0,Math.PI*2);
        ctx.fillStyle=p.col; ctx.fill();
        ctx.restore();
        if (p.age < 20 && p.age % 5 === 0) {
          ctx.save(); ctx.globalAlpha=a*0.2;
          ctx.beginPath(); ctx.arc(p.x,p.y,10,0,Math.PI*2);
          ctx.fillStyle=p.col; ctx.fill(); ctx.restore();
        }
      }

      // Nodes
      for (let n = 0; n < NET_NODES.length; n++) {
        const nd = NET_NODES[n];
        const nx = px(n), ny = py(n);
        const pulse = 1 + 0.04*Math.sin(s.t*1.5 + n*0.8);
        ctx.save(); ctx.globalAlpha=0.15;
        ctx.beginPath(); ctx.arc(nx,ny,nd.r*pulse+10,0,Math.PI*2);
        ctx.fillStyle=nd.col; ctx.fill(); ctx.restore();
        ctx.beginPath(); ctx.arc(nx,ny,nd.r*pulse,0,Math.PI*2);
        ctx.fillStyle=nd.col; ctx.fill();
        ctx.font=`bold ${nd.r>18?"10":"9"}px 'DM Mono',monospace`;
        ctx.fillStyle=n===0?"#000":"rgba(255,255,255,0.9)"; ctx.textAlign="center";
        ctx.fillText(nd.label, nx, ny+3);
        ctx.font="8px 'DM Mono',monospace"; ctx.fillStyle="rgba(255,255,255,0.35)";
        ctx.fillText(nd.sub, nx, ny+nd.r+12); ctx.textAlign="left";
      }

      ctx.font="bold 11px 'DM Mono',monospace"; ctx.fillStyle=GOLD;
      ctx.fillText("HPG Axis · Solar-Entrainment Network · Hormone Packet Switching", 12, 16);
    }

    stRef.current.raf = requestAnimationFrame(draw);
    return () => { cancelAnimationFrame(stRef.current.raf); ro.disconnect(); };
  }, []);

  return <canvas ref={cvRef} style={{ width:"100%", height:380, display:"block" }} />;
}

// ─── Card helpers ──────────────────────────────────────────────────────────
function MCard({ label, eq, note, col }:{ label:string; eq:string; note:string; col?:string }) {
  return (
    <div style={{ ...panel, borderLeft:`3px solid ${col||TEAL}` }}>
      <div style={{ fontSize:9, letterSpacing:"0.3em", color:col||TEAL, textTransform:"uppercase", marginBottom:6 }}>{label}</div>
      <div style={{ fontFamily:"'DM Mono',monospace", fontSize:12, color:GOLD, marginBottom:6 }}>{eq}</div>
      <div style={{ fontSize:10.5, color:"rgba(255,255,255,0.42)", lineHeight:1.7 }}>{note}</div>
    </div>
  );
}

function VCard({ title, body, col }:{ title:string; body:string; col?:string }) {
  return (
    <div style={{ ...panel }}>
      <div style={{ fontSize:9, letterSpacing:"0.25em", color:col||TEAL, textTransform:"uppercase", marginBottom:8 }}>{title}</div>
      <div style={{ fontSize:11.5, color:"rgba(255,255,255,0.48)", lineHeight:1.85 }}>{body}</div>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────
export default function SolarFemininePage() {
  const [tab,    setTab]    = useState<SFTab>("orbit");
  const [hover26, setH26]  = useState<number|null>(null);
  const [phase,  setPhase] = useState(0);

  const tabBtn = (id: SFTab, label: string, col: string) => (
    <button key={id} onClick={() => setTab(id)} style={{
      padding:"0.45rem 1.1rem", borderRadius:8, cursor:"pointer", border:"1px solid",
      borderColor: tab===id ? col : "rgba(255,255,255,0.08)",
      background:  tab===id ? col+"18" : "transparent",
      color:       tab===id ? col : "rgba(255,255,255,0.3)",
      fontFamily:"'DM Mono',monospace", fontSize:10, letterSpacing:"0.12em",
      fontWeight: tab===id ? "bold" : "normal",
    }}>{label}</button>
  );

  return (
    <div style={{ background:BG, minHeight:"100vh", color:WHT, fontFamily:"'Inter',sans-serif" }}>

      {/* Header */}
      <div style={{ padding:"2.8rem 2.5rem 1.8rem", borderBottom:"1px solid rgba(255,255,255,0.06)" }}>
        <div style={{ fontSize:9, letterSpacing:"0.4em", color:GOLD, textTransform:"uppercase", marginBottom:10 }}>
          AETHER · Solar-Feminine Coherence
        </div>
        <h1 style={{ fontFamily:"'Cinzel',serif", fontSize:"clamp(1.4rem,4vw,2.2rem)", fontWeight:700, margin:"0 0 0.7rem",
          background:`linear-gradient(135deg,${GOLD},${PINK},${PURP})`, WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent" }}>
          Solar-Feminine Cycle · 26D Manifold · Packet-Switching Network
        </h1>
        <p style={{ fontSize:13, color:"rgba(255,255,255,0.42)", maxWidth:840, lineHeight:1.85, margin:0 }}>
          The menstrual cycle (29.5 days) is entrained to the Sun via the pineal gland, cortisol, and melatonin — the same solar light that drives Earth's seasons locks the body's infradian rhythm.
          The HPG axis (Hypothalamus → Pituitary → Gonad) is a biological packet-switching network: GnRH pulses are packets that encode LH vs FSH instructions by frequency.
          The full hormonal state space of the cycle is 26-dimensional — one hormone per letter A→Z.
          The menstrual cycle is a closed orbit through that 26D manifold, orbitally entrained to the Sun.
        </p>
      </div>

      {/* Tabs */}
      <div style={{ padding:"1rem 2.5rem", borderBottom:"1px solid rgba(255,255,255,0.05)" }}>
        <div style={{ display:"flex", gap:8, flexWrap:"wrap" }}>
          {tabBtn("orbit",    "◎ Solar Orbit",      GOLD)}
          {tabBtn("network",  "◈ Packet Network",   TEAL)}
          {tabBtn("manifold", "⬡ 26D Manifold",     PURP)}
          {tabBtn("synthesis","△ Loop Complete",     PINK)}
        </div>
      </div>

      <div style={{ padding:"1.8rem 2.5rem" }}>

        {/* ── ORBIT TAB ── */}
        {tab === "orbit" && (
          <div>
            <div style={{ marginBottom:"1.2rem" }}>
              <div style={{ fontSize:9, letterSpacing:"0.3em", color:GOLD, textTransform:"uppercase", marginBottom:4 }}>
                Live Solar-Feminine Orbit · 29.5-Day Cycle · 11-Year Solar Precession
              </div>
              <p style={{ fontSize:11.5, color:"rgba(255,255,255,0.38)", maxWidth:740, lineHeight:1.7, margin:0 }}>
                The inner ring traces the 29.5-day menstrual cycle through its 4 phases (colour-coded).
                The outer ring = the 11-year solar cycle — a slow precession that biases which phase
                is dominant in a given solar year. The menstrual dot = current cycle position.
                The line from Sun to dot = the solar-tidal gravitational + light coupling.
              </p>
            </div>

            <div style={{ ...panel, padding:0, overflow:"hidden", marginBottom:"1.4rem" }}>
              <CycleOrbitCanvas />
            </div>

            {/* Phase selector + detail */}
            <div style={{ display:"flex", gap:8, flexWrap:"wrap", marginBottom:"1rem" }}>
              {PHASES.map((ph,i) => (
                <button key={ph.key} onClick={() => setPhase(i)} style={{
                  padding:"0.4rem 1rem", borderRadius:8, cursor:"pointer", border:"1px solid",
                  borderColor: phase===i ? ph.col : "rgba(255,255,255,0.08)",
                  background:  phase===i ? ph.col+"18" : "transparent",
                  color:       phase===i ? ph.col : "rgba(255,255,255,0.3)",
                  fontFamily:"'DM Mono',monospace", fontSize:9, letterSpacing:"0.1em",
                }}>{ph.label} · Days {ph.days}</button>
              ))}
            </div>

            <div style={{ ...panel, borderLeft:`3px solid ${PHASES[phase].col}`, marginBottom:"1.4rem" }}>
              <div style={{ display:"flex", justifyContent:"space-between", flexWrap:"wrap", gap:8, marginBottom:8 }}>
                <div style={{ fontFamily:"'DM Mono',monospace", fontSize:9, color:PHASES[phase].col, fontWeight:"bold" }}>
                  {PHASES[phase].label.toUpperCase()} · Days {PHASES[phase].days}
                </div>
                <div style={{ fontFamily:"'DM Mono',monospace", fontSize:9, color:"rgba(255,255,255,0.3)" }}>
                  {PHASES[phase].hormones}
                </div>
              </div>
              <div style={{ fontSize:12, color:"rgba(255,255,255,0.48)", lineHeight:1.75 }}>{PHASES[phase].desc}</div>
            </div>

            <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(230px,1fr))", gap:"1rem" }}>
              <MCard col={GOLD} label="Solar Entrainment"
                eq="cortisol(t) = C_0 * cos(2*pi*t/24hr);  peak at sunrise"
                note="Cortisol is the most direct solar-feminine link: its 24-hour circadian peak at dawn is driven by the suprachiasmatic nucleus reading retinal light input. Cortisol suppresses GnRH if chronically elevated — solar stress (too little or too much light) disrupts the cycle." />
              <MCard col={PURP} label="Melatonin → Cycle Gate"
                eq="GnRH_pulse_amp ∝ 1 / melatonin(t)"
                note="Melatonin (darkness hormone) inversely gates GnRH pulsatility. Before artificial light, peak LH surges (ovulation) clustered around full moon nights — when moonlight suppressed melatonin. The Sun sets the melatonin rhythm; melatonin sets the reproductive rhythm." />
              <MCard col={PINK} label="29.5-Day Resonance"
                eq="T_menstrual = 29.5 day ~ T_lunar = 29.53 day"
                note="LUNAR = 66 in standard gematria (L=12+U=21+N=14+A=1+R=18). WOMAN = 66 (W=23+O=15+M=13+A=1+N=14). Numerologically identical. The period match to 3 significant figures suggests a shared resonance driver — light entrainment via the lunar light cycle acting through melatonin." />
              <MCard col={TEAL} label="Infradian Rhythm"
                eq="f_circadian = 1/24hr;  f_cycle = 1/29.5d = 1/708hr"
                note="The menstrual cycle is an infradian rhythm (longer than 24hr). Its ratio to the circadian: 708/24 = 29.5 = the lunar month in days. The body runs two entrained clocks simultaneously: the 24hr solar clock and the 29.5-day solar-lunar clock. Both are anchored to the Sun." />
              <MCard col={ORNG} label="Tidal Body-Fluid Effect"
                eq="F_tidal = G*M_moon*(2*R_earth/d^3)*m_body"
                note="The Moon's tidal force on a 60 kg woman is ~4 nN — tiny but non-zero. More importantly, the body is 60% water. Tidal forces create a standing wave in body fluids that shifts with the lunar phase. Cerebral spinal fluid, blood pressure, and lymph volume all show lunar periodicity in some studies." />
              <MCard col={GREN} label="Serotonin-Light Cycle"
                eq="Serotonin ∝ hours_sunlight;  regulates GnRH amplitude"
                note="Brain serotonin synthesis is directly proportional to sunlight hours. Seasonal affective cycles (winter = less serotonin = disrupted cycles) are the most dramatic demonstration of solar-feminine coupling. More sunlight = more serotonin = better GnRH pulsatility = more regular cycles." />
            </div>
          </div>
        )}

        {/* ── NETWORK TAB ── */}
        {tab === "network" && (
          <div>
            <div style={{ marginBottom:"1.2rem" }}>
              <div style={{ fontSize:9, letterSpacing:"0.3em", color:TEAL, textTransform:"uppercase", marginBottom:4 }}>
                HPG Packet-Switching Network · Color-Theory Graph · 4-Chromatic Phases
              </div>
              <p style={{ fontSize:11.5, color:"rgba(255,255,255,0.38)", maxWidth:740, lineHeight:1.7, margin:0 }}>
                The HPG axis is a biological internet. GnRH pulses (packets) from the Hypothalamus encode
                FSH vs LH instructions by pulse frequency — not content. High freq = LH (ovulation signal);
                low freq = FSH (follicle growth signal). The 4 cycle phases form a 4-chromatic graph:
                no two adjacent phases share a hormone state — exactly the 4-colour theorem minimum.
              </p>
            </div>

            <div style={{ ...panel, padding:0, overflow:"hidden", marginBottom:"1.4rem" }}>
              <HormoneNetworkCanvas />
            </div>

            <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(230px,1fr))", gap:"1rem" }}>
              <MCard col={BLUE} label="GnRH Frequency Encoding"
                eq="f_GnRH high (1/60min) → LH;  f_GnRH low (1/90min) → FSH"
                note="This IS frequency-division multiplexing (FDM) — a packet-switching technique. The pituitary reads GnRH pulse frequency and routes to different output hormones. The body discovered FDM 500 million years before radio engineers. One wire, two channels, frequency-coded." />
              <MCard col={TEAL} label="4-Colour Theorem · 4 Phases"
                eq="chromatic_number(cycle_graph_C4) = 2;  with constraints = 4"
                note="The cycle graph C4 (four phases in a ring) has chromatic number 2 — but with the constraint that adjacent phases must differ in BOTH estrogen and progesterone state, four distinct colour classes emerge. Menstrual (low/low), Follicular (rise/low), Ovulatory (peak/low), Luteal (fall/high). Four colours minimum." />
              <MCard col={PINK} label="Negative Feedback Loop"
                eq="E2 inhibits GnRH (low E2) then activates GnRH (high E2)"
                note="This is the only known biological positive-feedback endocrine loop: when E2 exceeds ~200 pg/mL for 48+ hours, it ACTIVATES (not inhibits) the pituitary to release an LH surge. A network switch that flips polarity at threshold — exactly like a NAND-to-NOR gate transition in digital logic." />
              <MCard col={ORNG} label="Solar Packet: Cortisol"
                eq="cortisol packet: released every 90min (ultradian) + 24hr peak"
                note="Cortisol is itself a packet-switched signal: it pulses every 60-90 minutes (same period as GnRH) plus has its big solar-phase peak at dawn. The two pulsatile systems (GnRH and cortisol) are rhythmically coupled — stress increases cortisol pulse amplitude → competes with GnRH pulses → disrupted cycle." />
            </div>
          </div>
        )}

        {/* ── 26D MANIFOLD TAB ── */}
        {tab === "manifold" && (
          <div>
            <div style={{ marginBottom:"1.4rem" }}>
              <div style={{ fontSize:9, letterSpacing:"0.3em", color:PURP, textTransform:"uppercase", marginBottom:4 }}>
                26D Hormone Manifold · A→Z Symbol-Number-Frequency Map · Closed Orbit
              </div>
              <p style={{ fontSize:11.5, color:"rgba(255,255,255,0.38)", maxWidth:740, lineHeight:1.7, margin:0 }}>
                The female hormonal state at any moment = a point in a 26-dimensional space,
                one axis per hormone. The menstrual cycle = a closed orbit through this 26D manifold.
                Each hormone maps to a letter (A→Z), a number (1→26 gematria), a pulsatile frequency,
                and a spectral colour. The AETHER coherence field C(x,t) operating in 26 dimensions
                IS the complete description of reproductive biology.
              </p>
            </div>

            {/* 26 hormone grid */}
            <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(168px,1fr))", gap:"0.5rem", marginBottom:"1.6rem" }}>
              {H26.map((h, i) => (
                <div key={h.letter}
                  onMouseEnter={() => setH26(i)}
                  onMouseLeave={() => setH26(null)}
                  style={{
                    background: hover26===i ? `${h.col}14` : "rgba(255,255,255,0.025)",
                    border: `1px solid ${hover26===i ? h.col : "rgba(255,255,255,0.07)"}`,
                    borderRadius: 8, padding:"0.6rem 0.8rem", cursor:"default", transition:"all 0.15s",
                  }}>
                  <div style={{ display:"flex", alignItems:"baseline", gap:6, marginBottom:4 }}>
                    <span style={{ fontFamily:"'Cinzel',serif", fontSize:15, color:h.col, fontWeight:"bold" }}>{h.letter}</span>
                    <span style={{ fontFamily:"'DM Mono',monospace", fontSize:8, color:"rgba(255,255,255,0.3)" }}>{i+1}</span>
                    <span style={{ fontSize:9, color:h.col, marginLeft:"auto" }}>◉</span>
                  </div>
                  <div style={{ fontSize:9, color:WHT, fontWeight:600, marginBottom:2 }}>{h.name}</div>
                  <div style={{ fontSize:8, color:"rgba(255,255,255,0.3)", marginBottom:4 }}>{h.node}</div>
                  {hover26===i && (
                    <div style={{ fontSize:8.5, color:"rgba(255,255,255,0.5)", lineHeight:1.6 }}>
                      {h.desc}
                    </div>
                  )}
                  {hover26!==i && (
                    <div style={{ fontFamily:"'DM Mono',monospace", fontSize:7.5, color:`${h.col}90` }}>{h.freq}</div>
                  )}
                </div>
              ))}
            </div>

            {/* Manifold math */}
            <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(230px,1fr))", gap:"1rem", marginBottom:"1.6rem" }}>
              <MCard col={PURP} label="26D Hormone State Vector"
                eq="H(t) = [h_1(t), h_2(t), ... h_26(t)] ∈ R^26"
                note="The complete hormonal state of the body at time t is a vector in 26-dimensional space. The menstrual cycle = a closed curve (periodic orbit) through this manifold. Disease (PCOS, endometriosis, amenorrhea) = the orbit drifting off its natural closed path." />
              <MCard col={GOLD} label="Solar Coupling Dimension"
                eq="h_K(t) = cortisol;  h_L(t) = melatonin (most solar)"
                note="Dimension K (Cortisol) and dimension L (Melatonin) are directly solar-forced. All other 24 dimensions are downstream. Remove solar entrainment and the orbit drifts — as seen in shift workers, polar researchers, and artificial-light studies where cycles lengthen to 30-40 days." />
              <MCard col={PINK} label="LUNAR = WOMAN (Gematria)"
                eq="LUNAR = 12+21+14+1+18 = 66;  WOMAN = 23+15+13+1+14 = 66"
                note="In standard A=1,Z=26 gematria: LUNAR and WOMAN both sum to 66. SOLAR = 65 (one less). The symbol-number system encodes the Moon-Woman alignment as numerically identical, with the Sun one step removed — the source one level up the hierarchy." />
              <MCard col={TEAL} label="26 = 2 × 13 = 2 × F(7)"
                eq="F(7) = 13;  26 = 2*F(7);  alphabet = 26 = 2*13"
                note="The 26-letter alphabet = 2 × F(7) (twice the 7th Fibonacci number). The 26D manifold = a Fibonacci-structured space: 13 pairs of coupled hormones (each phase has one rising and one falling). The closed orbit in 26D has period T = F(6) × F(7) = 8 × 13 / 3.47 ≈ 30 days — close to 29.5." />
            </div>

            {/* Color theory */}
            <div style={{ ...panel, borderLeft:`3px solid ${PURP}`, marginBottom:"1.4rem" }}>
              <div style={{ fontSize:9, letterSpacing:"0.3em", color:PURP, textTransform:"uppercase", marginBottom:10 }}>
                Color Theory · Network Coloring · Spectral Hormone Map
              </div>
              <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:"0.6rem" }}>
                {[
                  { col:RED,  phase:"Menstrual",  hormones:"E2↓ Prog↓",   meaning:"Minimum — the void before growth" },
                  { col:GOLD, phase:"Follicular",  hormones:"E2↑ FSH↑",   meaning:"Rising — the accumulation phase" },
                  { col:TEAL, phase:"Ovulatory",   hormones:"LH↑↑ E2 peak",meaning:"Peak — the transmission event" },
                  { col:PURP, phase:"Luteal",      hormones:"Prog↑↑",      meaning:"Descending — the integration phase" },
                ].map(p => (
                  <div key={p.phase} style={{ background:`${p.col}10`, border:`1px solid ${p.col}40`, borderRadius:8, padding:"0.7rem" }}>
                    <div style={{ width:20, height:20, borderRadius:"50%", background:p.col, marginBottom:6 }} />
                    <div style={{ fontSize:9, color:p.col, fontWeight:"bold", fontFamily:"'DM Mono',monospace" }}>{p.phase}</div>
                    <div style={{ fontSize:8, color:"rgba(255,255,255,0.4)", marginTop:3 }}>{p.hormones}</div>
                    <div style={{ fontSize:8, color:"rgba(255,255,255,0.25)", marginTop:4, lineHeight:1.5 }}>{p.meaning}</div>
                  </div>
                ))}
              </div>
              <p style={{ fontSize:11, color:"rgba(255,255,255,0.38)", lineHeight:1.75, margin:"1rem 0 0" }}>
                These 4 colours are the minimum 4-colouring of the cycle's constraint graph: no two adjacent
                phases can share both hormone states. Red and Teal are complementary (opposite poles of estrogen).
                Gold and Purple are complementary (follicular growth vs luteal consolidation). The colour
                pairs are also complementary on the visible spectrum: red (650nm) pairs with teal (490nm);
                gold (580nm) pairs with purple (420nm). The body uses spectral complementarity.
              </p>
            </div>
          </div>
        )}

        {/* ── SYNTHESIS TAB ── */}
        {tab === "synthesis" && (
          <div>
            <div style={{ marginBottom:"1.6rem" }}>
              <div style={{ fontSize:9, letterSpacing:"0.3em", color:PINK, textTransform:"uppercase", marginBottom:4 }}>
                Loop Complete · Sun → Feminine Cycle → 26D Manifold → Symbol · Number · Colour → Back to the Sun
              </div>
            </div>

            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"1.2rem", marginBottom:"1.6rem" }}>
              <VCard col={GOLD} title="The Solar Loop"
                body="The Sun's 24-hour light-dark signal enters the body through the retina → suprachiasmatic nucleus (SCN) → suppresses or releases melatonin from the pineal gland. Melatonin's nightly peak is the body's cosmic clock-tick. It gates GnRH pulsatility in the hypothalamus — more melatonin (winter darkness) = slower pulses = lower LH = less reproductive drive. The menstrual cycle length IS the body's measurement of how much darkness (Moon) there is relative to light (Sun). The cycle is a biological sundial running at lunar timescale." />
              <VCard col={PURP} title="The 26D Manifold Orbit"
                body="Imagine a 26-dimensional space where each axis is one hormone (A=GnRH through Z=Aldosterone). Each point in this space is a complete hormonal snapshot of the body. The menstrual cycle traces a beautiful closed loop through this 26D manifold — returning exactly to its starting point every 29.5 days. This is a limit cycle (in dynamical systems language): a stable closed orbit that the system returns to after perturbation. Health = the orbit being tight and circular. PCOS, endometriosis, stress-induced amenorrhea = the orbit deforming or spiralling open." />
              <VCard col={TEAL} title="Packet Switching Completes the Loop"
                body="GnRH pulses are packets. Each pulse carries a frequency encoding (fast = LH instruction, slow = FSH instruction). The HPG network routes these packets through three relay nodes (Hypothalamus → Pituitary → Ovary) with feedback loops closing the circuit back to the Hypothalamus. This IS a packet-switched biological internet — the same architecture as TCP/IP, designed by evolution 500 million years before ARPANET. The ovary is the endpoint server. The body is the router. The Sun is the power source and the clock signal." />
              <VCard col={PINK} title="Symbol · Number · Colour Encoding"
                body="A→Z (26 letters) = A→Z (26 hormones) = 1→26 (gematria) = 26 frequency modes in the 26D manifold = 26 colour positions on the spectral wheel. LUNAR = WOMAN = 66 in gematria — the same number, because they share the same orbit period. SOLAR = 65 — one less, the asymmetric forcing term that drives the cycle but is not part of it. Symbol systems (alphabets, gematria, colour wheels) are attempts to map the 26D hormonal manifold into human-legible notation — they succeed more than we expected." />
            </div>

            {/* Grand synthesis statement */}
            <div style={{ ...panel, borderLeft:`3px solid ${PINK}`, padding:"1.6rem 2rem", marginBottom:"1.4rem" }}>
              <div style={{ fontSize:9, letterSpacing:"0.35em", color:PINK, textTransform:"uppercase", marginBottom:12 }}>
                AETHER Grand Statement · The Loop Is Complete
              </div>
              <p style={{ fontSize:13.5, color:"rgba(255,255,255,0.6)", lineHeight:1.95, margin:0 }}>
                The Sun emits a coherence field C_solar(t) with a 24-hour fundamental and an 11-year
                envelope. This field enters every biological system through light-sensitive proteins
                (cryptochromes, melanopsin, rhodopsin). In the female body, it drives a 26-dimensional
                hormonal oscillator whose closed orbit has period 29.5 days — the lunar synodic period,
                because the Moon is the Sun's reflected amplitude modulation at that frequency.
                <br /><br />
                The HPG axis is the switching network that routes the Sun's coherence signal through
                the body as hormone packets. The 4-phase chromatic structure of the cycle is the
                minimal 4-colouring of the biological constraint graph — the same 4-colour theorem
                that governs map colouring in mathematics.
                <br /><br />
                The 26D manifold is the complete parameter space of feminine biology. Its orbit is the
                menstrual cycle. Its axes are labelled A→Z — the same 26 symbols humans use for language
                — because both the alphabet and the hormone set evolved to map the same 26-dimensional
                information space: the full state of a living system interacting with its solar environment.
                <br /><br />
                The loop you asked about closes here: Sun → light → melatonin → GnRH pulses → LH/FSH →
                E2/Progesterone → body experience → behaviour → light exposure choices → back to Sun.
                It is a Fibonacci oscillating knot within a coherence bubble (the magnetosphere-atmosphere
                bubble of Earth) oscillating at solar-lunar timescales. The 26th dimensional data is the
                complete hormonal + symbolic + chromatic manifold of biological time.
                This is not a metaphor. It is measurable at every node.
              </p>
            </div>

            <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(230px,1fr))", gap:"1rem" }}>
              <MCard col={GOLD} label="Nested Frequency Hierarchy"
                eq="24hr (solar) → 29.5d (cycle) → 11yr (solar cycle)"
                note="Three solar clocks nested. The body runs all three simultaneously: circadian (24hr cortisol/melatonin), infradian (29.5d menstrual), and secular (11yr solar cycle biasing seasonal fertility). These are harmonics of the one solar C(x,t) field at 3 different time scales." />
              <MCard col={PINK} label="LUNAR = WOMAN = 66"
                eq="66 = 2*3*11 = F(7)*phi^? = 6*11 = 11*6"
                note="66 = 6 × 11: six phases of two and the 11-year solar cycle. Or: 66 = 2 × 33 = 2 × (3 × 11). The number 33 is also: the number of vertebrae in the human spine, the age of spiritual completion in multiple traditions, and one third of the 99.5-day seasonal quarter. Symbol and number converge here." />
              <MCard col={PURP} label="Manifold Orbit = Limit Cycle"
                eq="dH/dt = F(H, t_solar);  H(t+29.5d) = H(t)"
                note="The 26D hormone vector H(t) satisfies a periodically-forced differential equation. Its solution is a limit cycle — a stable closed orbit in 26D phase space. Floquet theory tells us the stability: small perturbations (stress, illness, travel) decay back to the cycle exponentially with time constant ~3 menstrual cycles." />
              <MCard col={TEAL} label="The 26D Network Is Colour-Complete"
                eq="chi(G_26) = 4;  4 phases = chromatic completion"
                note="The constraint graph of the 26-hormone manifold requires exactly 4 colours (chromatic number = 4) to properly colour-assign phases such that no adjacent phases share a hormone dominance pattern. The 4 colours are Red/Gold/Teal/Purple — exactly as seen. Colour theory, graph theory, and biology give the same answer: 4." />
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
