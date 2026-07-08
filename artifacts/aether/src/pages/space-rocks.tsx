import { useState, useEffect, useRef } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";

type EventType = "impact" | "airburst" | "magnetic" | "cataclysm" | "civil" | "planet";
type Density = "hi" | "lo" | null;

const TYPE_META: Record<EventType, { label: string; icon: string; color: string; border: string }> = {
  impact:    { label: "Dense Impact — Crater Formed",         icon: "🔩", color: "#e03030", border: "#e0303040" },
  airburst:  { label: "Air Explosion — No Crater",            icon: "💥", color: "#28b87a", border: "#28b87a40" },
  magnetic:  { label: "Magnetic Field Event",                 icon: "🧲", color: "#3a9fd8", border: "#3a9fd840" },
  cataclysm: { label: "Biggest Debate in Modern Prehistory",  icon: "🌊", color: "#f07c22", border: "#f07c2240" },
  civil:     { label: "Human Response",                       icon: "🏛", color: "#9060e0", border: "#9060e040" },
  planet:    { label: "Sky Events — As Above",                icon: "✦",  color: "#e8b84b", border: "#e8b84b40" },
};

const ERAS = [
  { label: "DEEP TIME",            sub: "Hundreds of thousands of years ago" },
  { label: "EARLY HUMAN HISTORY",  sub: "10,000–15,000 years ago" },
  { label: "BRONZE AGE",           sub: "3,000–4,000 years ago" },
  { label: "MODERN ERA",           sub: "20th Century to Today" },
];

const EVENTS: {
  era: number; type: EventType; date: string; headline: string; density: Density;
  plain: string; means: string; detail: string;
}[] = [
  {
    era: 0, type: "magnetic", date: "~780,000 years ago",
    headline: "Earth's Compass Flipped Upside Down", density: null,
    plain: "North became south and south became north. For thousands of years, Earth's magnetic field — the invisible shield that blocks deadly radiation from the sun and cosmos — collapsed and then slowly rebuilt itself pointing the other direction.",
    means: "If your GPS compass worked 780,000 years ago, it would point south instead of north. The field that protects everything alive got so weak that cosmic rays flooded in.",
    detail: "Called the Brunhes–Matuyama Reversal. This is the last complete pole reversal — meaning the magnetic poles fully swapped. Field strength dropped dramatically during the transition. Scientists can read this event in ancient lava flows and ocean sediment, which recorded the field direction like a tape recorder. Full reversals happen every ~200,000–300,000 years on average. We are 'overdue' by some measures — though that doesn't mean one is imminent.",
  },
  {
    era: 0, type: "impact", date: "~50,000 years ago",
    headline: "A Giant Iron Ball Hit Arizona — You Can Still Visit the Hole", density: "hi",
    plain: "A 50-metre iron meteorite — about as wide as a 15-story building is tall — smashed into what is now Arizona at 12 km per second. It was so dense it didn't burn up in the atmosphere. It hit the ground and blew a hole 1.2 km wide and 170 metres deep.",
    means: "This is the cannonball end of the spectrum. Heavy, dense, unstoppable. Meteor Crater in Arizona is still there today and is one of Earth's best-preserved impact scars. This is what happens when density is high.",
    detail: "Barringer Crater (Meteor Crater) near Winslow, Arizona. The impactor was a nickel-iron meteorite ~40–50 m across, density 6–7 g/cm³ — similar to cast iron or steel. Its high density meant it didn't fragment or slow down significantly in the atmosphere. It delivered nearly all its kinetic energy directly into the ground, creating a 150-megaton-equivalent explosion. This is the 'high-density endpoint' of the impact continuum.",
  },
  {
    era: 0, type: "magnetic", date: "~42,000 years ago — \"The Adams Event\"",
    headline: "Earth's Shield Collapsed to 5% — Neanderthals Disappeared Shortly After", density: null,
    plain: "Earth's magnetic field didn't just weaken — it dropped to 5% of its normal strength for hundreds of years. During this time, cosmic radiation from the sun and deep space flooded the atmosphere. The ozone layer thinned. Life on the surface got hammered with radiation.",
    means: "Imagine removing 95% of Earth's sunscreen at once. Neanderthals went extinct around this time. Australian megafauna collapsed. Cave art suddenly exploded in quantity — some researchers think humans literally went underground to shelter from the radiation.",
    detail: "Called the Laschamp Excursion — the most thoroughly studied 'geomagnetic excursion' (a short, partial field reversal). The transition from normal to reversed took ~250 years; it remained reversed ~440 years before returning. A 2021 study of a 42,500-year-old fossilized kauri tree in New Zealand provided the first high-resolution record of this event. Named the 'Adams Event' as a tribute to Douglas Adams — 42,000 years, and '42' was his answer to the universe.",
  },
  {
    era: 1, type: "cataclysm", date: "~12,800 years ago",
    headline: "Something Hit Earth and Froze It for 1,200 Years", density: "lo",
    plain: "Earth was warming after the last Ice Age. Then suddenly — within decades — temperatures plunged back almost to Ice Age levels. This 'Younger Dryas' cold snap lasted 1,200 years. Mammoths, giant ground sloths, and American horses went extinct. The humans who built stone tools called the 'Clovis' culture vanished. The human population crashed globally.",
    means: "Scientists found a layer of melted platinum, tiny diamonds, and burned glass baked into the ground across 4 continents at exactly this moment in time. The same materials you'd find after an atomic bomb test. Something enormous exploded. The survivors who came through it built the world's first temples and eventually invented agriculture — forced to settle down because their old nomadic food sources had collapsed.",
    detail: "The Younger Dryas Impact Hypothesis (YDIH) proposes that one or more cometary fragments — likely from the Taurid meteor stream (the same stream that produced Tunguska in 1908) — exploded over North America or Eurasia around 12,800 BCE. Evidence includes: platinum anomalies, magnetic spherules, shocked quartz, meltglass, nanodiamonds, and a distinctive black carbon layer found at 50+ sites on 4+ continents. The hypothesis is actively debated. Skeptics argue no crater exists. A 2024 study found additional evidence in Louisiana. The YDIH remains scientifically unresolved — but the abrupt climate event itself is not in dispute.",
  },
  {
    era: 1, type: "civil", date: "~11,600 years ago",
    headline: "Survivors Built the World's First Temple and Encoded the Disaster in Stone", density: null,
    plain: "At a hilltop in what is now Turkey, hunter-gatherers built an enormous stone complex 7,000 years before Stonehenge. They left no writing — but carved the walls with animals that may represent constellations and a comet impact. One pillar appears to record the exact date of the cold snap, written using the slow wobble of Earth's axis.",
    means: "These were nomads with no agriculture and no writing system — and they built something more sophisticated than anything that came after it for thousands of years. They were so important that the builders buried the entire complex intentionally ~3,000 years later to protect it from being destroyed.",
    detail: "Göbekli Tepe, Şanlıurfa Province, Turkey. Oldest confirmed megalithic complex on Earth. Pillar 43 ('Vulture Stone') has been interpreted as encoding the date of the Younger Dryas impact using precession of the equinoxes — essentially a star calendar locked in stone. Pillars 2 and 38 appear to trace the Taurid meteor stream radiant. The complex was deliberately and carefully buried around 8,000 BCE. Designated UNESCO World Heritage Site 2018.",
  },
  {
    era: 2, type: "airburst", date: "~1,650 BCE (3,600 years ago)",
    headline: "A City Near the Dead Sea Was Instantly Vaporized from Above", density: "lo",
    plain: "A major Bronze Age city called Tall el-Hammam in what is now Jordan was suddenly and completely destroyed. Scientists found evidence that temperatures briefly exceeded 2,000°C — hotter than the surface of the sun. The city's pottery melted. The palace collapsed. A thick ash layer coated everything. The surrounding farmland became too salty to grow anything for 300–600 years.",
    means: "Some researchers believe this is the real event behind the Sodom and Gomorrah story in the Bible. A space rock exploded in the air above the city — bigger than the Tunguska explosion — and the heat and pressure instantly killed everyone and everything. No crater, but devastating local destruction.",
    detail: "Tall el-Hammam sits northeast of the Dead Sea, near the boundary between modern Israel and Jordan. Evidence published in Scientific Reports (2021) included: shocked quartz at 5–10 GPa, melted platinum, iridium, gold, zircon, and diamond-like carbon. Heating experiments showed temperatures must have exceeded 2,000°C. The 2021 paper was retracted in 2025 over concerns about image manipulation in the figures — not the core data. An expanded version was republished in 2025 in the journal Airbursts and Cratering Impacts. This remains an active and contested scientific debate.",
  },
  {
    era: 3, type: "airburst", date: "June 30, 1908 — Siberia, Russia",
    headline: "A Space Rock Exploded in the Air and Nobody Knew for 20 Years", density: "lo",
    plain: "At 7:15am on a summer morning in Siberia, a space rock about as wide as a 15-storey building exploded in the air above a remote forest. The explosion was equivalent to 1,000 Hiroshima atomic bombs. 80 million trees fell down in an instant across an area bigger than London. There was no crater — because the rock was too light to survive to the ground.",
    means: "This is the low-density endpoint of the continuum. Same size as what hit Arizona 50,000 years ago — but because it was a fluffy, icy space rock instead of solid iron, it exploded in the air and left no crater. If this had hit any major city, millions would have died. The first scientific expedition didn't reach the site until 1927, almost 20 years later.",
    detail: "The Tunguska Event is the calibration reference for all modern airburst science. The object is now believed to have been an asteroid fragment, possibly from the Taurid meteor stream — the same stream that crosses Earth's orbit twice per year and is the proposed source of the Younger Dryas event ~12,800 years earlier. Entry angle: ~30°. Detonation altitude: ~10 km. Energy release: 10–30 megatons TNT. Effected area: 2,150 km² of fallen trees.",
  },
  {
    era: 3, type: "planet", date: "2020 · 2026 · 2040",
    headline: "Planets Are Lining Up in Ways Not Seen for Centuries", density: null,
    plain: "In December 2020, Jupiter and Saturn came closer together in the sky than they had in 400 years. In February 2026, 6 planets will appear in an arc across the sky at once. By 2040, another Jupiter-Saturn pairing arrives. These are the 'As Above' markers — celestial events ancient cultures tracked obsessively.",
    means: "These alignments don't cause disasters — the gravity of distant planets is tiny compared to the Moon's. But ancient civilizations tracked them carefully as markers of long cycles. The builders of Göbekli Tepe watched the same sky and encoded planetary positions in their stones.",
    detail: "Key alignments: Jupiter-Saturn Great Conjunction December 2020 (closest since 1623). 6-planet parade February 28, 2026 (Mercury, Venus, Jupiter, Saturn, Uranus, Neptune in arc). Next Jupiter-Saturn Great Conjunction November 2040. Uranus-Neptune trine aspects ~2025. Carlson's broader thesis, drawing on Clube and Napier's 'coherent catastrophism,' proposes that the Taurid meteor stream may have predictable dense encounter windows tied to Earth's orbital cycle.",
  },
  {
    era: 3, type: "magnetic", date: "1840 — Present (2026)",
    headline: "Earth's Magnetic Shield Is Weakening and Moving Toward Siberia", density: null,
    plain: "Since scientists first reliably measured it in 1840, Earth's magnetic field has weakened by about 9%. The North Magnetic Pole — where compasses point — has been moving toward Russia at speeds of up to 55 km per year. A large weak spot called the South Atlantic Anomaly is growing.",
    means: "Our magnetic shield is slowly turning down the dial. It's not an emergency today — satellites handle it with regular corrections. But if it continues, more cosmic radiation reaches Earth's surface. And history shows that when the shield gets weak enough, bad things happen (see: Laschamp, 42,000 BCE).",
    detail: "The North Magnetic Pole was found in the Canadian Arctic in 1831. By the 1990s it was moving at ~15 km/year. By the early 2000s it accelerated to ~55 km/year. Recent measurements suggest it has slowed to ~35 km/year. The World Magnetic Model (used by GPS and aviation) must be updated every 5 years to track the shift. Some geophysicists consider the current field behavior as possibly an early-stage excursion (like Laschamp) rather than a full reversal. Monitoring is ongoing via ESA's Swarm satellite constellation.",
  },
];

function DensityBadge({ density }: { density: Density }) {
  if (!density) return null;
  return (
    <div className={`inline-flex items-center gap-1.5 text-[8.5px] font-mono font-bold uppercase tracking-wider px-2.5 py-1 rounded-full border mb-3 ${
      density === "hi"
        ? "bg-red-500/10 text-red-400 border-red-500/30"
        : "bg-green-500/10 text-green-400 border-green-500/30"
    }`}>
      {density === "hi" ? "🔩 Dense Iron · 6–7 g/cm³ · Survived atmosphere" : "🧊 Low-Density · Cometary · Airburst · No Crater"}
    </div>
  );
}

function EventCard({ ev, idx }: { ev: typeof EVENTS[0]; idx: number }) {
  const [open, setOpen] = useState(false);
  const m = TYPE_META[ev.type];
  const isRight = idx % 2 === 0;

  return (
    <div className={`flex items-start gap-0 ${isRight ? "flex-row" : "flex-row-reverse"}`}>
      {isRight && <div className="flex-1" />}

      {/* Spine dot */}
      <div className="flex flex-col items-center w-12 flex-shrink-0 pt-4">
        <div className="w-4 h-4 rounded-full border-2 flex items-center justify-center" style={{ borderColor: m.color, boxShadow: `0 0 10px ${m.color}60` }}>
          <div className="w-2 h-2 rounded-full" style={{ background: m.color }} />
        </div>
      </div>

      {/* Card */}
      <div
        className="flex-1 rounded-xl border p-5 cursor-pointer transition-all duration-200 hover:-translate-y-0.5"
        style={{ borderColor: m.border, background: `${m.color}06`, borderLeftWidth: isRight ? "3px" : "1px", borderRightWidth: isRight ? "1px" : "3px" }}
        onClick={() => setOpen((o) => !o)}
      >
        <div className="font-mono text-[8px] font-bold uppercase tracking-widest mb-1" style={{ color: m.color }}>
          {m.icon} {m.label}
        </div>
        <div className="font-mono text-[9px] text-muted-foreground/50 mb-2">{ev.date}</div>
        <DensityBadge density={ev.density} />
        <h3 className="font-serif text-lg text-foreground/85 leading-snug mb-3">{ev.headline}</h3>
        <p className="font-mono text-[9px] text-muted-foreground/55 leading-relaxed mb-3">{ev.plain}</p>
        <div className="border-l-2 pl-3 py-1 mb-3 rounded-r" style={{ borderColor: `${m.color}50`, background: `${m.color}08` }}>
          <span className="font-mono text-[8px] font-bold" style={{ color: m.color }}>Plain English: </span>
          <span className="font-mono text-[8px] text-foreground/65">{ev.means}</span>
        </div>
        <button className="flex items-center gap-1 font-mono text-[8px] text-muted-foreground/40 hover:text-muted-foreground/70 transition-colors">
          {open ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
          {open ? "Less detail" : "More detail"}
        </button>
        {open && (
          <div className="mt-3 pt-3 border-t border-border/10 font-mono text-[8px] text-muted-foreground/40 leading-relaxed">
            {ev.detail}
          </div>
        )}
      </div>

      {!isRight && <div className="flex-1" />}
    </div>
  );
}

function AsteroidImpactCanvas() {
  const cvRef  = useRef<HTMLCanvasElement>(null);
  const rafRef = useRef(0);
  const [mode, setMode] = useState<"dense"|"comet">("dense");
  const modeRef = useRef<"dense"|"comet">("dense");
  useEffect(() => { modeRef.current = mode; }, [mode]);

  useEffect(() => {
    const cv = cvRef.current; if (!cv) return;
    const W = 900, H = 460;
    cv.width = W; cv.height = H;
    const ctx = cv.getContext("2d")!;
    const cx = W/2, ey = H*0.82;
    const ER = 90;

    interface Particle { x:number; y:number; vx:number; vy:number; life:number; r:number; col:string }
    let particles: Particle[] = [];

    let phase: "fly"|"impact"|"pause" = "fly";
    let oy = 0, phaseT = 0;
    let fragments: {x:number;y:number;vx:number;vy:number;r:number;life:number}[] = [];

    const reset = () => {
      oy = 0; phaseT = 0; phase = "fly"; particles = []; fragments = [];
    };
    reset();

    let t = 0;
    const ATMO_Y = ey - ER - 50;

    const draw = () => {
      const m = modeRef.current;
      ctx.fillStyle="#020408"; ctx.fillRect(0,0,W,H);

      for (let i=0;i<50;i++){
        const sx=(i*137.5)%W, sy=(i*73.1)%H;
        ctx.beginPath(); ctx.arc(sx,sy,0.6+((i*31)%10)/10,0,Math.PI*2);
        ctx.fillStyle="rgba(200,220,240,0.35)"; ctx.fill();
      }

      const atmoGrd=ctx.createRadialGradient(cx,ey,ER,cx,ey,ER+65);
      atmoGrd.addColorStop(0,"rgba(56,132,255,0.22)"); atmoGrd.addColorStop(1,"transparent");
      ctx.beginPath(); ctx.arc(cx,ey,ER+65,0,Math.PI*2); ctx.fillStyle=atmoGrd; ctx.fill();

      const earthGrd=ctx.createRadialGradient(cx-25,ey-25,10,cx,ey,ER);
      earthGrd.addColorStop(0,"#3b82f6"); earthGrd.addColorStop(0.5,"#1d4ed8"); earthGrd.addColorStop(1,"#1e3a8a");
      ctx.beginPath(); ctx.arc(cx,ey,ER,0,Math.PI*2); ctx.fillStyle=earthGrd; ctx.fill();

      ctx.strokeStyle="rgba(56,132,255,0.4)"; ctx.lineWidth=1;
      ctx.beginPath(); ctx.arc(cx,ey,ER+32,0,Math.PI*2); ctx.stroke();
      ctx.beginPath(); ctx.arc(cx,ey,ER+52,0,Math.PI*2);
      ctx.strokeStyle="rgba(56,132,255,0.15)"; ctx.stroke();

      ctx.fillStyle="rgba(100,180,255,0.08)"; ctx.font="7px 'Space Mono',monospace"; ctx.textAlign="center";
      ctx.fillText("ATMOSPHERE",cx,ey-ER-58); ctx.textAlign="left";

      if (phase==="fly") {
        phaseT++;
        const speed = m==="dense" ? 4.5 : 3.8;
        oy = phaseT * speed;

        const ax=cx+40-oy*0.25, ay=oy;
        const r = m==="dense" ? 12 : 16;

        if (m==="comet" && ay > ATMO_Y - 20) {
          const fragCount=Math.min(Math.floor((ay-ATMO_Y+20)/4),12);
          for (let i=0;i<Math.min(2,fragCount);i++){
            if (Math.random()>0.5 && fragments.length<30){
              fragments.push({x:ax,y:ay,vx:(Math.random()-0.5)*4,vy:-Math.random()*2,r:2+Math.random()*4,life:1});
            }
          }
        }

        for (let i=fragments.length-1;i>=0;i--){
          const f=fragments[i]; f.x+=f.vx; f.y+=f.vy; f.vy+=0.12; f.life-=0.025;
          if(f.life<=0){fragments.splice(i,1);continue;}
          ctx.beginPath(); ctx.arc(f.x,f.y,f.r*f.life,0,Math.PI*2);
          ctx.fillStyle=`rgba(255,180,60,${f.life*0.7})`; ctx.fill();
        }

        const inAtmo = ay > ATMO_Y;
        const disintegrate = m==="comet" && inAtmo && fragments.length>5;

        if (!disintegrate){
          const col = m==="dense" ? ["#ef4444","#b91c1c"] : ["#fb923c","#ea580c"];
          ctx.beginPath(); ctx.arc(ax,ay,r,0,Math.PI*2);
          ctx.fillStyle=col[0]; ctx.fill();
          if (m==="dense"){
            ctx.beginPath(); ctx.ellipse(ax,ay-8,4,7,0,0,Math.PI*2);
            ctx.fillStyle="#fca5a5"; ctx.fill();
          }
          const trailLen=m==="dense"?60:80;
          const trailGrd=ctx.createLinearGradient(ax,ay,ax-oy*0.25*0.3,ay-trailLen);
          trailGrd.addColorStop(0,col[0]+"cc"); trailGrd.addColorStop(1,"transparent");
          ctx.fillStyle=trailGrd; ctx.fillRect(ax-4,ay-trailLen,8,trailLen);
        }

        const hitY = ey - ER + 8;
        const explodeY = ATMO_Y + 10;
        if (m==="dense"&&ay>hitY){ phase="impact"; phaseT=0; }
        if (m==="comet"&&disintegrate&&ay>explodeY){ phase="impact"; phaseT=0; }
      }

      if (phase==="impact") {
        phaseT++;
        const ex=cx+40, iy=m==="dense"?ey-ER+6:ATMO_Y+10;
        const blastR=Math.min(phaseT*4,m==="dense"?80:120);
        const blastGrd=ctx.createRadialGradient(ex,iy,0,ex,iy,blastR);
        blastGrd.addColorStop(0,m==="dense"?"rgba(255,120,30,0.9)":"rgba(255,200,80,0.7)");
        blastGrd.addColorStop(0.5,m==="dense"?"rgba(255,60,10,0.5)":"rgba(255,150,40,0.4)");
        blastGrd.addColorStop(1,"transparent");
        ctx.beginPath(); ctx.arc(ex,iy,blastR,0,Math.PI*2); ctx.fillStyle=blastGrd; ctx.fill();

        if (m==="dense"&&phaseT<20){
          for (let i=0;i<3;i++){
            particles.push({x:ex,y:iy,vx:(Math.random()-0.5)*8,vy:-Math.random()*6,life:1,r:2+Math.random()*4,col:"rgba(255,100,20,"});
          }
        }
        for (let i=particles.length-1;i>=0;i--){
          const p=particles[i]; p.x+=p.vx; p.y+=p.vy; p.vy+=0.15; p.life-=0.02;
          if(p.life<=0){particles.splice(i,1);continue;}
          ctx.beginPath(); ctx.arc(p.x,p.y,p.r*p.life,0,Math.PI*2);
          ctx.fillStyle=p.col+p.life+")"; ctx.fill();
        }

        ctx.fillStyle="rgba(200,216,224,0.75)"; ctx.font="11px 'Space Mono',monospace"; ctx.textAlign="center";
        ctx.fillText(m==="dense"?"SURFACE IMPACT · CRATER FORMED":"AIRBURST · NO CRATER", cx, 40);
        ctx.font="8px 'Space Mono',monospace"; ctx.fillStyle="rgba(200,216,224,0.5)";
        ctx.fillText(m==="dense"?"Dense iron: ~6 g/cm³ · Passed through atmosphere intact":"Low-density comet: ~0.3 g/cm³ · Fragmented & detonated above surface", cx, 56);
        ctx.textAlign="left";
        if (phaseT>120){ phase="pause"; phaseT=0; }
      }

      if (phase==="pause"){
        phaseT++;
        if (phaseT>80) reset();
      }

      t++; rafRef.current=requestAnimationFrame(draw);
    };

    rafRef.current=requestAnimationFrame(draw);
    return ()=>cancelAnimationFrame(rafRef.current);
  }, []);

  return (
    <div>
      <div style={{ display:"flex", gap:"0.75rem", marginBottom:"0.75rem", flexWrap:"wrap" }}>
        {[{k:"dense",label:"Dense Iron Meteorite · ~6 g/cm³ · Surface Crater"},{k:"comet",label:"Light Comet · ~0.3 g/cm³ · Atmospheric Airburst"}].map(o=>(
          <button key={o.k} onClick={()=>setMode(o.k as "dense"|"comet")}
            style={{ padding:"0.4rem 1rem", border:"1px solid"+(mode===o.k?"#e03030":"#334155"),
              borderRadius:6, background:mode===o.k?"rgba(224,48,48,0.15)":"transparent",
              color:mode===o.k?"#fca5a5":"#94a3b8", fontSize:"0.78rem", cursor:"pointer" }}>
            {o.label}
          </button>
        ))}
      </div>
      <canvas ref={cvRef} style={{ width:"100%", height:"auto", display:"block", borderRadius:10 }} />
    </div>
  );
}

function SpaceRocksHeaderCanvas() {
  const ref = useRef<HTMLCanvasElement>(null);
  const rafRef = useRef(0);
  useEffect(() => {
    const canvas = ref.current; if (!canvas) return;
    const ctx = canvas.getContext("2d")!;
    canvas.width = 900; canvas.height = 145;
    const W = canvas.width, H = canvas.height;
    let t=0;
    const rocks: {x:number;y:number;vx:number;vy:number;r:number;angle:number;spin:number;col:string}[]=[];
    for(let i=0;i<16;i++) rocks.push({x:Math.random()*W,y:Math.random()*H,vx:(Math.random()-0.5)*0.8,vy:(Math.random()-0.5)*0.8,r:4+Math.random()*10,angle:Math.random()*Math.PI*2,spin:(Math.random()-0.5)*0.03,col:["#c9a84c","#9966ff","#ff4477","#44aaff"][Math.floor(Math.random()*4)]});
    const draw=()=>{
      ctx.fillStyle="rgba(2,4,8,0.3)"; ctx.fillRect(0,0,W,H);
      rocks.forEach(r=>{
        r.x+=r.vx; r.y+=r.vy; r.angle+=r.spin;
        if(r.x<-20) r.x=W+20; if(r.x>W+20) r.x=-20;
        if(r.y<-20) r.y=H+20; if(r.y>H+20) r.y=-20;
        ctx.save();ctx.translate(r.x,r.y);ctx.rotate(r.angle);
        ctx.beginPath();
        for(let i=0;i<6;i++){const a=i/6*Math.PI*2,rd=r.r*(0.7+0.3*Math.sin(i*1.7));ctx.lineTo(Math.cos(a)*rd,Math.sin(a)*rd);}
        ctx.closePath();ctx.fillStyle=r.col+"22";ctx.fill();ctx.strokeStyle=r.col+"66";ctx.lineWidth=0.6;ctx.stroke();ctx.restore();
      });
      ctx.fillStyle="rgba(201,168,76,0.3)"; ctx.font="9px 'DM Mono',monospace";
      ctx.fillText("SPACE ROCKS · ASTEROIDS · COHERENT CATASTROPHISM · IMPACT · AETHER",14,14);
      t++; rafRef.current=requestAnimationFrame(draw);
    };
    draw();
    return ()=>cancelAnimationFrame(rafRef.current);
  },[]);
  return <canvas ref={ref} style={{width:"100%",height:"auto",borderRadius:8,display:"block"}} />;
}

export default function SpaceRocksPage() {
  let currentEra = -1;
  return (
    <div className="flex-1 overflow-y-auto p-6 space-y-8 max-w-5xl mx-auto">
      <div className="space-y-2">
        <div className="font-mono text-xs text-amber-400/50 uppercase tracking-[0.25em]">AETHER · Coherent Catastrophism</div>
        <h1 className="font-serif text-4xl text-foreground">Rocks from Space Have Been<br />Reshaping <span className="text-amber-400 italic">Everything</span></h1>
        <p className="font-mono text-xs text-muted-foreground/60 max-w-3xl leading-relaxed mt-3">
          For 780,000 years, space rocks, magnetic field shifts, and planetary cycles have been quietly shaping Earth's climate, ending civilizations, and triggering the birth of new ones. No jargon, no PhD required.
        </p>
      </div>

      <div style={{ marginBottom:"2rem" }}>
        <div style={{ display:"inline-block", background:"rgba(224,48,48,0.12)", border:"1px solid rgba(224,48,48,0.3)",
          borderRadius:8, padding:"0.3rem 1rem", fontSize:"0.7rem", letterSpacing:"0.2em",
          color:"#fca5a5", textTransform:"uppercase", marginBottom:"1rem" }}>
          Live Simulation
        </div>
        <div style={{ background:"rgba(255,255,255,0.03)", border:"1px solid rgba(224,48,48,0.2)",
          borderLeft:"3px solid #e03030", borderRadius:14, padding:"1.5rem" }}>
          <h2 style={{ fontSize:"1.2rem", fontWeight:700, color:"#f8fafc", margin:"0 0 0.35rem",
            fontFamily:"'Cinzel',serif" }}>
            Impactor Trajectory Simulator
          </h2>
          <p style={{ color:"#94a3b8", fontSize:"0.82rem", margin:"0 0 1rem", lineHeight:1.65 }}>
            Toggle between a dense iron meteorite (~6 g/cm³) that punches through the atmosphere and
            strikes the surface, versus a light cometary body (~0.3 g/cm³) that fragments and detonates
            mid-air. This is the core density principle that explains craters vs. airbursts.
          </p>
          <AsteroidImpactCanvas />
        </div>
      </div>

      {/* Quick explainer */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[
          { icon: "🪨", title: "Dense rocks hit the ground", text: "Heavy iron meteorites punch through the atmosphere and leave a crater you can visit today." },
          { icon: "💥", title: "Light rocks explode in the sky", text: "Lighter, icy space debris detonates mid-air like an invisible nuclear bomb — no crater, but massive destruction." },
          { icon: "🧲", title: "Earth's shield is changing", text: "Our magnetic field — which blocks deadly cosmic radiation — has weakened and flipped before. It's weakening again right now." },
        ].map((c) => (
          <div key={c.title} className="rounded-xl border border-border/20 bg-card/30 p-5 space-y-2 text-center">
            <div className="text-3xl">{c.icon}</div>
            <div className="font-mono text-[9px] font-bold text-foreground/70">{c.title}</div>
            <p className="font-mono text-[8px] text-muted-foreground/50 leading-relaxed">{c.text}</p>
          </div>
        ))}
      </div>

      {/* Density continuum */}
      <div className="border border-amber-500/20 rounded-xl p-6 space-y-4" style={{ background: "rgba(232,184,75,0.04)" }}>
        <h2 className="font-serif text-xl text-foreground">The Key Idea: Two Very Different Dangers</h2>
        <p className="font-mono text-[9px] text-muted-foreground/55">Not all space rocks are the same. The single most important thing to understand is this — <span className="text-foreground/80 font-bold">density determines destiny.</span></p>
        <div className="grid grid-cols-3 gap-4 items-center">
          <div className="rounded-xl border-2 border-green-500/40 bg-green-500/5 p-4 text-center space-y-2">
            <div className="text-4xl">🧊</div>
            <div className="font-mono text-[8px] text-green-400 font-bold uppercase tracking-wider">Fluffy / Icy</div>
            <div className="font-serif text-sm text-foreground/70">Explodes in the air</div>
            <p className="font-mono text-[8px] text-muted-foreground/45 leading-relaxed">Like a snowball hitting water — it bursts before touching the ground. Covers a vast area with heat and pressure. No crater to find. Like Tunguska, 1908.</p>
          </div>
          <div className="text-center font-serif text-2xl text-amber-400/60 font-bold">OR</div>
          <div className="rounded-xl border-2 border-red-500/40 bg-red-500/5 p-4 text-center space-y-2">
            <div className="text-4xl">🔩</div>
            <div className="font-mono text-[8px] text-red-400 font-bold uppercase tracking-wider">Dense Iron</div>
            <div className="font-serif text-sm text-foreground/70">Hits the ground</div>
            <p className="font-mono text-[8px] text-muted-foreground/45 leading-relaxed">Like a cannonball through paper — punches straight through and slams into Earth. Leaves a crater you can still visit. Like Meteor Crater, Arizona.</p>
          </div>
        </div>
        {/* Spectrum bar */}
        <div className="space-y-2">
          <div className="font-mono text-[8px] text-muted-foreground/40 uppercase tracking-widest text-center">Density Spectrum: What the rock is made of</div>
          <div className="h-3 rounded-full" style={{ background: "linear-gradient(90deg, #28b87a 0%, #3a9fd8 30%, #e8b84b 60%, #f07c22 80%, #e03030 100%)" }} />
          <div className="flex justify-between font-mono text-[8px] text-muted-foreground/45">
            <span>🧊 Icy comet (~0.5 g/cm³)<br />Airburst · No crater</span>
            <span className="text-center">🪨 Stony asteroid (~2–3 g/cm³)<br />Sometimes craters</span>
            <span className="text-right">🔩 Iron meteorite (~7 g/cm³)<br />Crater · Always hits ground</span>
          </div>
        </div>
      </div>

      {/* Element 115 / Bismuth callout */}
      <div className="border border-border/20 rounded-2xl overflow-hidden">
        <div className="px-6 py-4 border-b border-border/15" style={{ background: "linear-gradient(135deg, rgba(138,90,220,0.08), rgba(72,199,230,0.06))" }}>
          <div className="font-mono text-[8px] text-purple-400/60 uppercase tracking-[0.3em] mb-1">Heavy Element Spotlight</div>
          <h3 className="font-serif text-xl text-foreground">The Two End Points of Heavy Matter</h3>
          <p className="font-mono text-[9px] text-muted-foreground/50 mt-1 leading-relaxed max-w-2xl">
            Iron sits at the top of the density spectrum we use for space rocks. But nature goes further. Bismuth is heavier than iron, forms crystalline geometry that looks designed, and levitates over magnets. Element 115 — now officially named Moscovium — was described decades before its synthesis by someone claiming to have reverse-engineered alien propulsion.
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-border/15">

          {/* Bismuth card */}
          <div className="p-6 space-y-4">
            <div className="flex items-start gap-4">
              {/* Periodic table cell */}
              <div className="flex-shrink-0 w-20 h-20 rounded-xl border-2 border-purple-400/30 flex flex-col items-center justify-center text-center" style={{ background: "rgba(138,90,220,0.1)" }}>
                <div className="font-mono text-[9px] text-purple-400/60">83</div>
                <div className="font-serif text-3xl text-purple-300 font-bold leading-none">Bi</div>
                <div className="font-mono text-[8px] text-purple-400/70 mt-0.5">209.0</div>
                <div className="font-mono text-[7px] text-muted-foreground/40">Bismuth</div>
              </div>
              <div className="space-y-1.5">
                <div className="font-serif text-lg text-foreground">Bismuth</div>
                <div className="font-mono text-[8px] text-purple-300/70 uppercase tracking-widest">Element 83 — Post-Transition Metal</div>
                <div className="font-mono text-[8px] text-muted-foreground/50 leading-relaxed">
                  The heaviest element that is <span className="text-purple-300">practically non-radioactive</span> — its half-life is 1.9 × 10¹⁹ years, a trillion times the age of the universe.
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              {[
                { label: "Density",          val: "9.78 g/cm³", note: "Denser than iron (7.87). Dense enough to hit ground." },
                { label: "Crystal structure", val: "Stepped pyramids", note: "Forms iridescent hopper crystals — fractal staircases of pure metal." },
                { label: "Diamagnetic",      val: "Strongest metal", note: "The only metal dense enough to levitate freely above a strong rare-earth magnet." },
                { label: "Quantum behavior", val: "Topological insulator", note: "Conducts electricity only on its surface edges — a quantum boundary effect." },
              ].map(f => (
                <div key={f.label} className="rounded-lg p-2.5 space-y-0.5" style={{ background: "rgba(138,90,220,0.07)", border: "1px solid rgba(138,90,220,0.12)" }}>
                  <div className="font-mono text-[7.5px] text-purple-400/50 uppercase tracking-widest">{f.label}</div>
                  <div className="font-mono text-[9px] text-purple-200">{f.val}</div>
                  <div className="font-mono text-[7px] text-muted-foreground/40 leading-tight">{f.note}</div>
                </div>
              ))}
            </div>

            <div className="rounded-xl px-4 py-3 font-mono text-[8px] text-muted-foreground/55 leading-relaxed" style={{ background: "rgba(138,90,220,0.06)", border: "1px solid rgba(138,90,220,0.1)" }}>
              <span className="text-purple-300">Why it matters here:</span> Bismuth appears in some iron meteorites as a trace element — it concentrates in the heavy metallic phase. Its crystalline geometry (stepped hopper growth) resembles the self-organizing patterns in the CGLE simulator. It is the closest natural element to the "island of stability" — the predicted region of nuclear physics where super-heavy elements might be long-lived enough to be useful.
            </div>
          </div>

          {/* Element 115 card */}
          <div className="p-6 space-y-4">
            <div className="flex items-start gap-4">
              {/* Periodic table cell */}
              <div className="flex-shrink-0 w-20 h-20 rounded-xl border-2 border-cyan-400/30 flex flex-col items-center justify-center text-center" style={{ background: "rgba(72,199,230,0.08)" }}>
                <div className="font-mono text-[9px] text-cyan-400/60">115</div>
                <div className="font-serif text-3xl text-cyan-300 font-bold leading-none">Mc</div>
                <div className="font-mono text-[8px] text-cyan-400/70 mt-0.5">289.0</div>
                <div className="font-mono text-[7px] text-muted-foreground/40">Moscovium</div>
              </div>
              <div className="space-y-1.5">
                <div className="font-serif text-lg text-foreground">Element 115 — Moscovium</div>
                <div className="font-mono text-[8px] text-cyan-300/70 uppercase tracking-widest">Mc · Synthetic Super-Heavy · Island of Stability</div>
                <div className="font-mono text-[8px] text-muted-foreground/50 leading-relaxed">
                  First synthesized 2003 at JINR, Dubna. Officially named 2016. <span className="text-cyan-300">Half-life: ~220 milliseconds.</span> Only a handful of atoms have ever existed on Earth.
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              {[
                { label: "Proton number", val: "Z = 115", note: "Sits at the predicted 'island of stability' edge — nuclear physics predicts longer-lived isotopes nearby." },
                { label: "Decay chain",   val: "Mc→Nh→Rg→…", note: "Decays through Nihonium (113) → Roentgenium (111) → via alpha emission." },
                { label: "Lazar claim",   val: "1989 — 14 yr early", note: "Bob Lazar described element 115 as alien propulsion fuel in 1989, before the element was synthesized in 2003." },
                { label: "Mechanism",     val: "Proton → gravity wave", note: "Lazar claimed: bombard stable Mc-115 with protons → annihilate with anti-protons → amplified gravity wave used for propulsion." },
              ].map(f => (
                <div key={f.label} className="rounded-lg p-2.5 space-y-0.5" style={{ background: "rgba(72,199,230,0.07)", border: "1px solid rgba(72,199,230,0.12)" }}>
                  <div className="font-mono text-[7.5px] text-cyan-400/50 uppercase tracking-widest">{f.label}</div>
                  <div className="font-mono text-[9px] text-cyan-200">{f.val}</div>
                  <div className="font-mono text-[7px] text-muted-foreground/40 leading-tight">{f.note}</div>
                </div>
              ))}
            </div>

            <div className="rounded-xl px-4 py-3 font-mono text-[8px] text-muted-foreground/55 leading-relaxed" style={{ background: "rgba(72,199,230,0.06)", border: "1px solid rgba(72,199,230,0.1)" }}>
              <span className="text-cyan-300">The Lazar Anomaly:</span> In 1989, Robert Lazar publicly described working at a classified facility (S-4, near Area 51) where he claims to have examined alien craft using a then-nonexistent element — proton number 115 — as its power source. Element 115 was officially synthesized 14 years later. Whether or not the claim is true, the nuclear physics detail was accurate: element 115 does exist, sits at the edge of the "island of stability," and Moscovium-290 is predicted to be more stable than what we've synthesized so far.
            </div>
          </div>
        </div>

        {/* Connecting strip */}
        <div className="px-6 py-3 border-t border-border/15 flex items-center gap-3" style={{ background: "rgba(100,100,150,0.04)" }}>
          <div className="flex-1 h-px" style={{ background: "linear-gradient(90deg, rgba(138,90,220,0.3), rgba(72,199,230,0.3))" }} />
          <div className="font-mono text-[8px] text-muted-foreground/35 text-center px-4 leading-relaxed">
            Bi (83) → gap → Mc (115) · 32 protons apart · Both live at the heavy end of nature's density spectrum · Bismuth stable, Moscovium not — yet
          </div>
          <div className="flex-1 h-px" style={{ background: "linear-gradient(90deg, rgba(72,199,230,0.3), rgba(138,90,220,0.3))" }} />
        </div>
      </div>

      {/* Timeline */}
      <div className="relative space-y-1">
        <div className="absolute left-1/2 top-0 bottom-0 w-px -translate-x-1/2" style={{ background: "linear-gradient(180deg, transparent, rgba(232,184,75,0.25) 5%, rgba(232,184,75,0.25) 95%, transparent)" }} />

        {EVENTS.map((ev, idx) => {
          const isNewEra = ev.era !== currentEra;
          if (isNewEra) currentEra = ev.era;
          return (
            <div key={idx} className="space-y-4">
              {isNewEra && (
                <div className="flex items-center justify-center py-6 relative z-10">
                  <div className="font-mono text-[9px] text-amber-400 uppercase tracking-[0.3em] border border-amber-400/30 bg-background px-4 py-1.5 rounded-full">
                    {ERAS[ev.era].label}
                    <span className="text-muted-foreground/40 ml-2">{ERAS[ev.era].sub}</span>
                  </div>
                </div>
              )}
              <EventCard ev={ev} idx={idx} />
            </div>
          );
        })}
      </div>

      {/* Now box */}
      <div className="border-2 border-amber-400/25 rounded-xl p-8 text-center space-y-4" style={{ background: "rgba(232,184,75,0.06)" }}>
        <h2 className="font-serif text-2xl text-amber-400">So Where Are We Right Now?</h2>
        <p className="font-mono text-[9px] text-muted-foreground/60 max-w-lg mx-auto leading-relaxed">
          We live in an unusual moment. Earth's magnetic shield is measurably weaker. The same meteor stream that produced Tunguska crosses our orbit twice a year. Our planet-detection systems are better than ever — but we still can't detect every small dark object in advance.
        </p>
        <div className="flex flex-wrap justify-center gap-4 pt-2">
          {[
            { num: "−9%",         label: "Magnetic field weakened since 1840" },
            { num: "~500–3,200",  label: "Taurid stream crossings to monitor per year" },
            { num: "42,000 yr",   label: "Since the last major field excursion (Laschamp)" },
            { num: "11,600 yr",   label: "Since the first monument encoded the sky" },
          ].map((s) => (
            <div key={s.label} className="bg-card/50 border border-border/20 rounded-xl p-4 min-w-[140px]">
              <div className="font-serif text-2xl text-foreground mb-1">{s.num}</div>
              <div className="font-mono text-[8px] text-muted-foreground/50 leading-tight">{s.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Legend */}
      <div className="border border-border/15 rounded-xl p-4 flex flex-wrap gap-4 justify-center">
        {Object.entries(TYPE_META).map(([, m]) => (
          <div key={m.label} className="flex items-center gap-2">
            <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: m.color }} />
            <span className="font-mono text-[8px] text-muted-foreground/45">{m.icon} {m.label.split("—")[0].trim()}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
