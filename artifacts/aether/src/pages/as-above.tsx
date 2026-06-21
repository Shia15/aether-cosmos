import { useState, useRef, useEffect } from "react";

interface TooltipData {
  date: string; title: string; body: string; tags: string[];
  x: number; y: number;
}

function GeoSVG() {
  return (
    <svg viewBox="0 0 140 1500" preserveAspectRatio="none" className="absolute inset-0 w-full h-full">
      <defs>
        <linearGradient id="geoGrad" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#cc222200" />
          <stop offset="100%" stopColor="#cc222230" />
        </linearGradient>
        <linearGradient id="fluxGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#ee442200" />
          <stop offset="100%" stopColor="#ee4422aa" />
        </linearGradient>
        <marker id="arrowRed" markerWidth="6" markerHeight="6" refX="3" refY="3" orient="auto">
          <path d="M0,0 L6,3 L0,6 Z" fill="#ee5522" />
        </marker>
      </defs>
      {/* Modern era */}
      <path d="M 110 10 C 108 30, 115 50, 112 70 C 109 90, 117 110, 113 130 C 110 150, 116 170, 112 185 C 108 200, 114 215, 110 230 C 106 245, 112 260, 108 270 C 104 280, 110 295, 106 310 C 102 325, 108 345, 104 360 C 100 375, 106 385, 100 375"
        fill="none" stroke="#cc8822" strokeWidth="2" opacity="0.8" />
      {/* Holocene */}
      <path d="M 100 375 C 96 400, 104 420, 98 445 C 92 470, 100 495, 94 515 C 88 535, 96 555, 90 575 C 84 595, 92 610, 86 625 C 80 640, 88 655, 84 668 C 78 682, 30 710, 28 735 C 26 750, 30 760, 32 770 C 40 790, 60 805, 72 820 C 84 835, 80 855, 85 875 C 90 895, 84 915, 88 935 C 92 955, 86 965, 90 975"
        fill="none" stroke="#cc8822" strokeWidth="2" opacity="0.8" />
      {/* Deep geo */}
      <path d="M 90 975 C 86 1000, 94 1020, 88 1040 C 80 1060, 85 1080, 82 1100 C 50 1130, 20 1150, 18 1180 C 16 1210, 22 1240, 30 1260 C 45 1290, 70 1310, 80 1340 C 90 1365, 84 1390, 88 1420 C 92 1450, 86 1470, 90 1500"
        fill="none" stroke="#cc8822" strokeWidth="2" opacity="0.8" />
      {/* Shading under curve */}
      <path d="M 130 0 L 110 10 C 108 30,115 50,112 70 C 109 90,117 110,113 130 C 110 150,116 170,112 185 C 108 200,114 215,110 230 C 106 245,112 260,108 270 C 104 280,110 295,106 310 C 102 325,108 345,104 360 C 100 375,106 385,100 375 C 96 400,104 420,98 445 C 92 470,100 495,94 515 C 88 535,96 555,90 575 C 84 595,92 610,86 625 C 80 640,88 655,84 668 C 78 682,30 710,28 735 C 26 750,30 760,32 770 C 40 790,60 805,72 820 C 84 835,80 855,85 875 C 90 895,84 915,88 935 C 92 955,86 965,90 975 C 86 1000,94 1020,88 1040 C 80 1060,85 1080,82 1100 C 50 1130,20 1150,18 1180 C 16 1210,22 1240,30 1260 C 45 1290,70 1310,80 1340 C 90 1365,84 1390,88 1420 C 92 1450,86 1470,90 1500 L 130 1500 Z"
        fill="url(#geoGrad)" opacity="0.3" />
      {/* Labels */}
      <line x1="110" y1="0" x2="110" y2="375" stroke="#cc882230" strokeWidth="1" strokeDasharray="3,3" />
      <text x="112" y="15" fontSize="8" fill="#a07040" fontFamily="monospace">85%</text>
      <line x1="10" y1="735" x2="130" y2="735" stroke="#cc882225" strokeWidth="1" strokeDasharray="2,4" />
      <text x="12" y="730" fontSize="8" fill="#cc6622" fontFamily="monospace">10%</text>
      <text x="12" y="896" fontSize="8" fill="#a07040" fontFamily="monospace">30%</text>
      <text x="133" y="15" fontSize="8" fill="#a07040" fontFamily="monospace">100%</text>
      <text x="12" y="1495" fontSize="8" fill="#a07040" fontFamily="monospace">0%</text>
      <line x1="130" y1="0" x2="130" y2="1500" stroke="#88442215" strokeWidth="1" />
      {/* -15% decline arrow */}
      <text x="55" y="60" fontSize="9" fill="#ee5522" fontFamily="monospace" fontWeight="600">−15%</text>
      <line x1="80" y1="65" x2="80" y2="200" stroke="#ee5522" strokeWidth="1.5" markerEnd="url(#arrowRed)" opacity="0.7" />
      {/* Cosmic ray flux bar */}
      <rect x="125" y="600" width="8" height="400" fill="url(#fluxGrad)" rx="2" />
      {/* Increased cosmic rad */}
      <text x="8" y="670" fontSize="7" fill="#ee5522" fontFamily="monospace">Increased</text>
      <text x="8" y="680" fontSize="7" fill="#ee5522" fontFamily="monospace">Cosmic</text>
      <text x="8" y="690" fontSize="7" fill="#ee5522" fontFamily="monospace">Radiation</text>
      <text x="8" y="1080" fontSize="7" fill="#ee5522" fontFamily="monospace">Increased</text>
      <text x="8" y="1090" fontSize="7" fill="#ee5522" fontFamily="monospace">Cosmic</text>
      <text x="8" y="1100" fontSize="7" fill="#ee5522" fontFamily="monospace">Radiation</text>
    </svg>
  );
}

type ColEvent = { top: string; title: string; sub?: string; color: string; size?: "sm" | "md" | "lg"; dot?: "circle" | "square"; density?: "hi" | "lo" | null; tag?: string; tagColor?: string; tooltip?: TooltipData; };

const CENTER_EVENTS: ColEvent[] = [
  {
    top: "1%", color: "#d4a830", title: "↑ Modern Pole Shift / Magnetic Decline",
    sub: "1840–present: field weakening + accelerating pole drift",
    tooltip: { date: "2026 CE", title: "Modern Pole Shift / Magnetic Decline", body: "North Magnetic Pole migrating toward Siberia at ~35–50 km/yr. Global field down ~9% since 1840. South Atlantic Anomaly growing. No reversal predicted this century but excursion risk discussed.", tags: ["Pole Migration", "Field Weakening", "SAA", "2026"], x: 0, y: 0 },
  },
  {
    top: "13%", color: "#22aa66", title: "Tunguska Airburst (1908 CE)",
    sub: "Low-density object · ~1 g/cm³ · No crater · 2,150 km² flattened",
    density: "lo", tag: "LOW DENSITY", tagColor: "#22aa66",
    tooltip: { date: "June 30, 1908", title: "Tunguska Airburst — Low Density Endpoint", body: "~50 m stony/cometary object at ~1 g/cm³ detonates at 10 km altitude. 10–30 megatons TNT. 80 million trees flattened across 2,150 km². No crater. Classic airburst. Taurid meteor stream origin proposed.", tags: ["~1 g/cm³", "Airburst", "No Crater", "15 Megatons", "Taurid Stream", "Low-Density Endpoint"], x: 0, y: 0 },
  },
  {
    top: "37%", color: "#22aa66", title: "Proposed Tall el-Hammam Airburst (~1650 BCE)",
    sub: "Low-density · No crater · Sodom/Gomorrah parallel?",
    density: "lo", tag: "LOW DENSITY", tagColor: "#22aa66",
    tooltip: { date: "~1,650 BCE", title: "Tall el-Hammam Airburst — Jordan Valley", body: "Proposed airburst near Dead Sea. Evidence: 1.5m ash layer, shocked quartz (5–10 GPa), >2000°C temperatures, melted platinum/gold/zircon. Salt influx sterilized land for 300–600 years. May be origin of Sodom/Gomorrah.", tags: ["Jordan Valley", "Dead Sea", "Bronze Age", "Airburst", "2000°C+", "Contested"], x: 0, y: 0 },
  },
  {
    top: "50%", color: "#ddcc20", title: "Younger Dryas (~12.9k–11.7kya)",
    sub: "Impact Hypothesis / Magnetic Instability / Abrupt Cooling",
    tooltip: { date: "~12,800 BCE", title: "Younger Dryas Boundary Event", body: "Proposed cometary airburst(s) over N. America/Eurasia triggers 1,200 year global cooling. Evidence: platinum anomalies, shocked quartz, meltglass, magnetic spherules across 50+ sites on 4+ continents. Clovis collapse, megafaunal extinctions, human population bottleneck.", tags: ["~12,800 BCE", "Airburst", "Taurid", "Clovis Collapse", "Megafaunal", "Holocene", "YDIH"], x: 0, y: 0 },
  },
  {
    top: "60%", color: "#4488cc", title: "Göbekli Tepe (~9,600 BCE)",
    sub: "World's first temple · Taurid meteor calendar · Post-catastrophe memorial",
    tooltip: { date: "~9,600 BCE", title: "Göbekli Tepe — World's First Temple", body: "Built by post-Younger Dryas hunter-gatherers in southern Turkey. 11,600 years old. Pillar 43 proposed to encode YD impact date via precession. Taurid stream radiant traced on pillars 2 & 38. Deliberately buried ~8000 BCE.", tags: ["Turkey", "Megalith", "Taurid Calendar", "Catastrophe Memorial", "11,600yr"], x: 0, y: 0 },
  },
  {
    top: "79%", color: "#cc2222", title: "Meteor Crater (AZ) Impact (~50kya)",
    sub: "High-density iron · 6–7 g/cm³ · Crater-forming",
    density: "hi", tag: "HIGH DENSITY", tagColor: "#cc2222",
    tooltip: { date: "~50,000 BCE", title: "Meteor Crater (Arizona) — High-Density Endpoint", body: "Iron-nickel meteorite at 6–7 g/cm³ strikes Arizona. Creates 1.2 km crater, 170 m deep. Survives atmospheric entry because density is too high to fragment. The opposite physical outcome from Tunguska.", tags: ["6–7 g/cm³", "Iron-Nickel", "Crater", "Arizona", "High-Density Endpoint"], x: 0, y: 0 },
  },
  {
    top: "87%", color: "#4488cc", title: "Brunhes–Matuyama Reversal (~780kya)",
    sub: "Last full pole reversal · Field collapse · Cosmic ray increase",
    tooltip: { date: "~780,000 BCE", title: "Brunhes–Matuyama Full Geomagnetic Reversal", body: "Last complete pole flip. Field collapsed over thousands of years. Significant increase in cosmic ray flux. No confirmed impact trigger. Predates all human habitation.", tags: ["780k BCE", "Full Reversal", "Pole Flip", "Cosmic Rays"], x: 0, y: 0 },
  },
];

function AsAboveCanvas() {
  const ref = useRef<HTMLCanvasElement>(null);
  const rafRef = useRef(0);
  useEffect(() => {
    const canvas = ref.current; if (!canvas) return;
    const ctx = canvas.getContext("2d")!;
    canvas.width = 900; canvas.height = 260;
    const W = canvas.width, H = canvas.height;
    const eras = [
      { label:"YOUNGER\nDRYAS", col:"#60a5fa", x:W*0.10, y:H*0.5 },
      { label:"BRONZE AGE\nCOLLAPSE", col:"#f59e0b", x:W*0.24, y:H*0.5 },
      { label:"COSMIC\nIMPACT", col:"#ef4444", x:W*0.38, y:H*0.5 },
      { label:"PLASMA\nEVENT", col:"#a78bfa", x:W*0.52, y:H*0.5 },
      { label:"SOLAR\nMICRONOVA", col:"#fb923c", x:W*0.66, y:H*0.5 },
      { label:"GEOLOGICAL\nRECORD", col:"#34d399", x:W*0.80, y:H*0.5 },
      { label:"COHERENT\nSYNTHESIS", col:"#2ef0d8", x:W*0.93, y:H*0.5 },
    ];
    let t=0;
    const draw=()=>{
      ctx.fillStyle="rgba(5,5,15,0.18)"; ctx.fillRect(0,0,W,H);
      t++;
      for (let i=0;i<eras.length-1;i++) {
        const a=eras[i],b=eras[i+1];
        const g=ctx.createLinearGradient(a.x,a.y,b.x,b.y);
        g.addColorStop(0,a.col+"55"); g.addColorStop(1,b.col+"55");
        ctx.beginPath(); ctx.moveTo(a.x,a.y); ctx.lineTo(b.x,b.y);
        ctx.strokeStyle=g; ctx.lineWidth=1.5; ctx.stroke();
        const pkt=(t*0.012+i*0.4)%1;
        const px=a.x+(b.x-a.x)*pkt;
        ctx.beginPath(); ctx.arc(px,H/2,2.5,0,Math.PI*2);
        ctx.fillStyle="#fff"; ctx.shadowColor="#fff"; ctx.shadowBlur=7; ctx.fill(); ctx.shadowBlur=0;
      }
      eras.forEach((e,i)=>{
        const pulse=1+0.08*Math.sin(t*0.035+i*0.9);
        const g=ctx.createRadialGradient(e.x,e.y,0,e.x,e.y,16*pulse);
        g.addColorStop(0,e.col+"cc"); g.addColorStop(0.5,e.col+"33"); g.addColorStop(1,"transparent");
        ctx.beginPath(); ctx.arc(e.x,e.y,14*pulse,0,Math.PI*2);
        ctx.fillStyle=g; ctx.shadowColor=e.col; ctx.shadowBlur=14*pulse; ctx.fill(); ctx.shadowBlur=0;
        ctx.strokeStyle=e.col; ctx.lineWidth=1.5; ctx.stroke();
        ctx.fillStyle=e.col; ctx.font="bold 7px 'DM Mono',monospace"; ctx.textAlign="center";
        e.label.split("\n").forEach((ln,li)=>ctx.fillText(ln,e.x,e.y+18*pulse+li*9));
      });
      ctx.fillStyle="rgba(96,165,250,0.4)"; ctx.font="9px 'DM Mono',monospace"; ctx.textAlign="left";
      ctx.fillText("AS ABOVE · COHERENT CATASTROPHISM · HISTORICAL TIMELINE SYNTHESIS",14,18);
      rafRef.current=requestAnimationFrame(draw);
    };
    draw();
    return ()=>cancelAnimationFrame(rafRef.current);
  },[]);
  return <canvas ref={ref} style={{ width:"100%", height:"auto", borderRadius:8, display:"block" }} />;
}

export default function AsAbovePage() {
  const [tooltip, setTooltip] = useState<TooltipData | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  function showTip(e: React.MouseEvent, data: TooltipData) {
    const rect = containerRef.current?.getBoundingClientRect();
    setTooltip({ ...data, x: e.clientX - (rect?.left ?? 0) + 12, y: e.clientY - (rect?.top ?? 0) + 12 });
  }

  return (
    <div className="flex-1 overflow-y-auto p-6 space-y-6 max-w-6xl mx-auto">
      <div>
        <div style={{ display:"inline-block", background:"rgba(96,165,250,0.07)", border:"1px solid rgba(96,165,250,0.22)",
          borderRadius:8, padding:"0.3rem 1rem", fontSize:"0.7rem", letterSpacing:"0.2em",
          color:"#60a5fa", textTransform:"uppercase", fontFamily:"monospace", marginBottom:12 }}>
          Live Simulation
        </div>
        <div style={{ background:"rgba(5,5,15,0.88)", border:"1px solid rgba(96,165,250,0.1)",
          borderLeft:"3px solid #60a5fa", borderRadius:10, padding:20, marginBottom:8 }}>
          <h2 style={{ fontFamily:"'Playfair Display',serif", fontSize:18, color:"#e0eeff", margin:"0 0 6px" }}>
            As Above · Coherent Catastrophism · Historical Timeline Synthesis
          </h2>
          <p style={{ fontFamily:"monospace", fontSize:12, color:"rgba(150,180,220,0.5)", margin:"0 0 14px", lineHeight:1.65 }}>
            Seven historical catastrophe nodes (Younger Dryas/blue · Bronze Age Collapse/amber · Cosmic Impact/red
            · Plasma Event/violet · Solar Micronova/orange · Geological Record/green · Coherent Synthesis/teal)
            with timeline photon packets streaming sequentially — the coherent catastrophism timeline synthesis.
          </p>
          <AsAboveCanvas />
        </div>
      </div>

      {/* Header */}
      <div className="space-y-2">
        <div className="font-mono text-xs text-amber-400/50 uppercase tracking-[0.25em]">AETHER · Coherent Catastrophism</div>
        <h1 className="font-serif text-4xl text-foreground tracking-wide" style={{ fontFamily: "'Playfair Display', serif" }}>AS ABOVE, SO BELOW</h1>
        <div className="font-mono text-base text-amber-400/70 tracking-[0.2em] uppercase">A Historical Timeline Synthesis</div>
        <p className="font-mono text-xs text-muted-foreground/50 max-w-3xl leading-relaxed">Synthesizing verified and observational data across multiple interconnected scales — geophysical, historical, astronomical, and civilizational.</p>
      </div>

      {/* Column header row 1 */}
      <div className="grid border border-amber-500/25 rounded-t-xl overflow-hidden" style={{ gridTemplateColumns: "80px 1fr 1fr 2fr 1fr 1fr" }}>
        <div className="bg-card/60 border-r-2 border-amber-500/40 p-2 flex items-center justify-center">
          <span className="font-mono text-[7px] text-amber-400 uppercase tracking-widest">ERA</span>
        </div>
        <div className="col-span-2 border-r-2 border-amber-500/25 bg-card/40 p-2 text-center">
          <div className="font-mono text-[7px] font-bold text-amber-400 uppercase tracking-widest">AS BELOW: Geophysical &amp; Historical Events</div>
          <div className="font-mono text-[6px] text-muted-foreground/40 mt-0.5">Earth &amp; Humanity</div>
        </div>
        <div className="border-r border-amber-500/15 bg-amber-500/[0.03] p-2 text-center">
          <div className="font-mono text-[7px] font-bold text-amber-400 uppercase tracking-widest">Synthesis Center</div>
          <div className="font-mono text-[6px] text-muted-foreground/40 mt-0.5">Alignments · Geo · History</div>
        </div>
        <div className="col-span-2 bg-card/30 p-2 text-center">
          <div className="font-mono text-[7px] font-bold text-amber-400 uppercase tracking-widest">AS ABOVE: Astronomical Events</div>
          <div className="font-mono text-[6px] text-muted-foreground/40 mt-0.5">Planetary &amp; Cosmic Cycles</div>
        </div>
      </div>

      {/* Column header row 2 */}
      <div className="grid border-x border-amber-500/25 -mt-4" style={{ gridTemplateColumns: "80px 1fr 1fr 2fr 1fr 1fr" }}>
        {["TIME", "GEOMAGNETIC INTENSITY & POLARITY", "HISTORICAL & CATACLYSMIC EVENTS", "PLANETARY ALIGNMENTS, GEOMAGNETIC EVENTS & KEY DATES", "OUTER-PLANET GRAND CONJUNCTIONS", "MULTI-PLANET ALIGNMENTS"].map((h, i) => (
          <div key={i} className={`border-b-2 border-amber-500/40 border-r border-amber-500/10 p-2 text-center ${i === 3 ? "bg-amber-500/[0.04]" : "bg-card/50"}`}>
            <div className="font-mono text-[6.5px] font-bold text-amber-400/70 uppercase leading-tight">{h}</div>
          </div>
        ))}
      </div>

      {/* Main grid — fixed height with relative-positioned event markers */}
      <div
        ref={containerRef}
        className="grid border border-amber-500/20 rounded-b-xl overflow-hidden relative"
        style={{ gridTemplateColumns: "80px 1fr 1fr 2fr 1fr 1fr", height: "900px" }}
        onClick={(e) => { if (!(e.target as HTMLElement).closest("[data-tip]")) setTooltip(null); }}
      >
        {/* ERA column */}
        <div className="border-r-2 border-amber-500/35 flex flex-col" style={{ background: "rgba(10,22,40,0.9)" }}>
          {[
            { label: "MODERN ERA", sub: "LAST 500 YR", flex: 25, bg: "rgba(10,30,60,0.9)" },
            { label: "HOLOCENE", sub: "EARLY HUMAN", flex: 40, bg: "rgba(40,25,10,0.7)" },
            { label: "DEEP GEO", sub: "780K YR AGO", flex: 35, bg: "rgba(20,10,5,0.9)" },
          ].map((e) => (
            <div
              key={e.label}
              className="flex items-center justify-center border-b border-amber-500/15 px-1"
              style={{ flex: e.flex, background: e.bg, writingMode: "vertical-rl", transform: "rotate(180deg)" }}
            >
              <div className="font-mono text-[7px] text-amber-400 tracking-[0.2em] uppercase leading-tight text-center">
                {e.label}<br /><span className="text-muted-foreground/40">{e.sub}</span>
              </div>
            </div>
          ))}
        </div>

        {/* Geo intensity column */}
        <div className="border-r border-amber-500/10 relative overflow-hidden" style={{ background: "linear-gradient(180deg, rgba(10,30,60,0.4) 0%, rgba(60,40,20,0.4) 60%, rgba(20,10,5,0.4) 100%)" }}>
          <GeoSVG />
          {[
            { top: "2%", label: "Modern Decline", sub: "(1840–present)\nNorth Pole Migration", color: "#f07c22" },
            { top: "44%", label: "Laschamp Excursion", sub: "(~42 kya)", color: "#4488cc" },
            { top: "62%", label: "Gothenburg Excursion", sub: "(~12 kya, debated)", color: "#887744" },
            { top: "76%", label: "Brunhes–Matuyama", sub: "(~780 kya)", color: "#8888aa" },
          ].map((a) => (
            <div key={a.label} className="absolute left-1 right-1 z-10" style={{ top: a.top }}>
              <div className="font-mono text-[7px] font-bold leading-tight whitespace-pre-line" style={{ color: a.color }}>{a.label}</div>
              <div className="font-mono text-[6px] text-muted-foreground/30 leading-tight">{a.sub}</div>
            </div>
          ))}
        </div>

        {/* Historical events column */}
        <div className="border-r-2 border-amber-500/30 relative" style={{ background: "linear-gradient(180deg, rgba(10,30,60,0.3) 0%, rgba(50,30,15,0.3) 60%, rgba(15,8,3,0.3) 100%)" }}>
          {[
            { top: "1%", label: "Modern Pole Shift / Magnetic Decline", sub: "↑ Arrow indicates modern acceleration", color: "#aaaaaa", dot: "circle" as const, size: 12 },
            { top: "14%", label: "Tunguska Airburst (1908 CE)", sub: "Low Density Object · 2,150 km² Flattened, No Crater", color: "#22aa66", dot: "circle" as const, size: 12 },
            { top: "38%", label: "Proposed Tall el-Hammam Airburst (~1650 BCE)", sub: "No Crater · Airburst Explosion", color: "#22aa66", dot: "circle" as const, size: 12 },
            { top: "50%", label: "Younger Dryas (~12.9k–11.7kya)", sub: "Impact Hypothesis / Magnetic Instability", color: "#ddcc20", dot: "circle" as const, size: 10 },
            { top: "80%", label: "Meteor Crater (AZ) Impact (~50kya)", sub: "High Density Iron", color: "#cc2222", dot: "circle" as const, size: 14 },
          ].map((ev) => (
            <div key={ev.top} className="absolute left-2 right-2 z-10" style={{ top: ev.top }}>
              <div className="flex items-start gap-1.5">
                <div className="flex-shrink-0 rounded-full border-2 mt-0.5" style={{ width: ev.size, height: ev.size, background: ev.color, boxShadow: `0 0 8px ${ev.color}` }} />
                <div>
                  <div className="font-mono text-[7.5px] font-bold text-foreground/70 leading-tight">{ev.label}</div>
                  <div className="font-mono text-[6px] text-muted-foreground/40 leading-tight mt-0.5">{ev.sub}</div>
                </div>
              </div>
            </div>
          ))}
          {/* YD band */}
          <div className="absolute left-0 right-0 border-t border-b border-dashed border-yellow-500/20" style={{ top: "49%", height: "8%", background: "rgba(220,200,30,0.04)" }}>
            <div className="absolute right-1 top-0.5 font-mono text-[6px] text-yellow-500/40">Younger Dryas (~12.9k–11.7kya)</div>
          </div>
        </div>

        {/* Center synthesis column */}
        <div className="relative border-r border-amber-500/20" style={{ background: "linear-gradient(180deg, rgba(20,40,80,0.3) 0%, rgba(80,50,20,0.25) 55%, rgba(20,10,5,0.3) 100%)" }}>
          {/* YD band */}
          <div className="absolute left-0 right-0 border-t border-b border-dashed border-yellow-500/20 z-0" style={{ top: "49%", height: "8%", background: "rgba(220,200,30,0.04)" }} />
          {CENTER_EVENTS.map((ev, i) => (
            <div
              key={i}
              data-tip="1"
              className="absolute left-2 right-2 z-10 border-l-2 rounded-r px-2 py-1.5 cursor-pointer transition-all duration-150 hover:brightness-110"
              style={{ top: ev.top, borderColor: ev.color, background: `${ev.color}0d` }}
              onClick={(e) => ev.tooltip && showTip(e, ev.tooltip)}
            >
              <div className="font-mono text-[8px] font-bold text-foreground/75 leading-tight">{ev.title}</div>
              {ev.sub && <div className="font-mono text-[6.5px] text-muted-foreground/45 leading-tight mt-0.5">{ev.sub}</div>}
              {ev.tag && (
                <div className="inline-block mt-1 font-mono text-[6px] uppercase tracking-wide px-1.5 py-0.5 rounded-sm" style={{ background: `${ev.tagColor}20`, color: ev.tagColor }}>
                  {ev.tag}
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Outer-planet conjunctions column */}
        <div className="border-r border-amber-500/10 relative" style={{ background: "linear-gradient(180deg, rgba(20,10,40,0.3) 0%, rgba(10,5,20,0.3) 100%)" }}>
          {[
            { top: "2%", label: "2014–2025", sub: "Uranus-Pluto / Trine Neptune Cycles", color: "#8844cc", symbol: "———" },
            { top: "47%", label: "Taurus-series Neptune-Pluto", sub: "(~1071 BCE)", color: "#d4a830", symbol: "○" },
            { top: "57%", label: "Rare Uranus-Neptune-Pluto", sub: "Grand Conjunction in Taurus, ~577 BCE", color: "#d4a830", symbol: "⊗" },
            { top: "70%", label: "2014–2025 Rare U-N-P", sub: "(~1071 BCE)", color: "#8844cc", symbol: "⊗" },
          ].map((ev) => (
            <div key={ev.top} className="absolute left-2 right-2 z-10" style={{ top: ev.top }}>
              <div className="font-mono text-[9px]" style={{ color: ev.color }}>{ev.symbol}</div>
              <div className="font-mono text-[7.5px] font-bold leading-tight" style={{ color: ev.color }}>{ev.label}</div>
              <div className="font-mono text-[6px] text-muted-foreground/40 leading-tight">{ev.sub}</div>
            </div>
          ))}
        </div>

        {/* Multi-planet alignments column */}
        <div className="relative" style={{ background: "linear-gradient(180deg, rgba(30,20,10,0.3) 0%, rgba(10,5,3,0.3) 100%)" }}>
          {/* 2026 callout */}
          <div className="absolute top-1 right-1 z-20 border border-amber-400/40 rounded px-1.5 py-1" style={{ background: "rgba(212,168,48,0.08)" }}>
            <div className="font-mono text-[7px] font-bold text-amber-300">→ Feb 28, 2026</div>
            <div className="font-mono text-[6px] text-muted-foreground/40">6-planet parade</div>
          </div>
          {[
            { top: "1%", label: "Great Conjunction (Jupiter-Saturn)", sub: "2020 Dec", color: "#d4a830", size: 14 },
            { top: "7%", label: "2000 Partial Alignment", sub: "(Sun+M,V,M,J,S)", color: "#e07820", size: 12 },
            { top: "16%", label: "Da Vinci Code Alignment", sub: "1496 CE", color: "#d4a830", size: 10, square: true },
            { top: "35%", label: "Rare 5-Planet Babylonian", sub: "(~185 BCE)", color: "#d4a830", size: 10, square: true },
            { top: "42%", label: "332 CE", sub: "", color: "#d4a830", size: 8 },
            { top: "46%", label: "710 CE", sub: "", color: "#d4a830", size: 8 },
            { top: "50%", label: "1186 CE", sub: "", color: "#d4a830", size: 8 },
          ].map((ev) => (
            <div key={ev.top} className="absolute left-2 right-2 z-10" style={{ top: ev.top }}>
              <div className="flex items-start gap-1.5">
                <div className="flex-shrink-0 mt-0.5" style={{ width: ev.size, height: ev.size, background: ev.color, boxShadow: `0 0 8px ${ev.color}`, borderRadius: (ev as any).square ? "2px" : "50%", opacity: 0.85 }} />
                <div>
                  <div className="font-mono text-[7.5px] font-bold text-foreground/65 leading-tight">{ev.label}</div>
                  {ev.sub && <div className="font-mono text-[6px] text-muted-foreground/35 leading-tight">{ev.sub}</div>}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Tooltip */}
      {tooltip && (
        <div
          className="fixed z-50 rounded-lg border shadow-2xl p-4 max-w-xs pointer-events-none"
          style={{ left: tooltip.x, top: tooltip.y, background: "rgba(8,16,32,0.97)", borderColor: "#d4a830" }}
        >
          <div className="font-mono text-[8px] uppercase tracking-widest text-amber-400/60 mb-1">{tooltip.date}</div>
          <div className="font-mono text-sm font-bold text-foreground mb-2">{tooltip.title}</div>
          <p className="font-mono text-[9px] text-muted-foreground/60 leading-relaxed mb-3">{tooltip.body}</p>
          <div className="flex flex-wrap gap-1">
            {tooltip.tags.map((t) => (
              <span key={t} className="font-mono text-[7px] px-1.5 py-0.5 rounded" style={{ background: "rgba(255,255,255,0.05)", color: "#706050" }}>{t}</span>
            ))}
          </div>
        </div>
      )}

      {/* Key box */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 border border-amber-500/20 rounded-xl p-5" style={{ background: "rgba(8,15,30,0.95)" }}>
        <div className="space-y-3">
          <h4 className="font-mono text-[7px] font-bold text-amber-400 uppercase tracking-widest">Impact Type</h4>
          {[
            { color: "#cc2222", label: "High-Density Impact (Crater) · 6–8 g/cm³ iron-nickel" },
            { color: "#22aa66", label: "Low-Density Airburst · ~1 g/cm³ stony/cometary" },
          ].map((k) => (
            <div key={k.label} className="flex items-center gap-2">
              <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: k.color, boxShadow: `0 0 6px ${k.color}` }} />
              <span className="font-mono text-[8px] text-muted-foreground/50">{k.label}</span>
            </div>
          ))}
        </div>
        <div className="space-y-3">
          <h4 className="font-mono text-[7px] font-bold text-amber-400 uppercase tracking-widest">Geomagnetic Events</h4>
          {[
            { color: "#4488cc", label: "Geomagnetic Reversal / Excursion" },
            { color: "#d4a830", label: "Planetary Conjunction / Grand Cycle" },
            { color: "#8844cc", label: "Outer-Planet Long Cycle (>1000yr)" },
          ].map((k) => (
            <div key={k.label} className="flex items-center gap-2">
              <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: k.color, boxShadow: `0 0 6px ${k.color}` }} />
              <span className="font-mono text-[8px] text-muted-foreground/50">{k.label}</span>
            </div>
          ))}
        </div>
        <div className="space-y-2">
          <h4 className="font-mono text-[7px] font-bold text-amber-400 uppercase tracking-widest">Key Continuum Observations</h4>
          <ul className="space-y-1.5 list-disc list-inside">
            {[
              "Density-driven impacts at every timescale, from stochastic to coherent Taurid-stream cycles",
              "Geomagnetic weakening and shielding decline (Laschamp → modern decline = less cosmic ray protection)",
              "Planetary alignments as system-wide markers (gravitational markers, not proven causal triggers)",
              "Younger Dryas debate — proposed impact + magnetic/climate interactions, still contested",
            ].map((l) => (
              <li key={l} className="font-mono text-[7.5px] text-muted-foreground/40 leading-relaxed">{l}</li>
            ))}
          </ul>
          <p className="font-mono text-[7px] text-muted-foreground/25 mt-2">Tap any synthesis event for full research context.</p>
        </div>
      </div>

      <div className="font-mono text-[7.5px] text-muted-foreground/25 leading-relaxed border-t border-border/10 pt-4">
        Data synthesized from NASA, USGS, NOAA, peer-reviewed paleomagnetic and astronomical studies.
        *Note: Observational correlations are not proven causal. Several events (Tall el-Hammam, Younger Dryas Impact Hypothesis, Gothenburg Excursion) remain actively debated in the scientific literature.
        Sources: Firestone et al. 2007 · Kennett et al. 2015–2024 · Sweatman &amp; Tsikritsis 2017 · Wikipedia: Laschamp / Brunhes-Matuyama / Göbekli Tepe · NASA Planetary Defense 2023
      </div>
    </div>
  );
}
