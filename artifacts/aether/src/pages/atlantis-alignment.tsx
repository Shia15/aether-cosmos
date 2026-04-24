import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import infographic from "@assets/1767210329858_1776476951085.jpeg";

const C = {
  teal: "#2dd4bf", gold: "#f2bf65", purple: "#c084fc",
  green: "#4ade80", rose: "#fb7185", orange: "#fb923c",
  blue: "#60a5fa", cyan: "#22d3ee", bg: "#030514", panel: "#07021a",
};

// Years are negative for BCE, positive for CE
const EPOCHS = [
  { year: -9600, label: "MELTWATER PULSE 1B",      sub: "11,600 yrs ago",    col: C.cyan,
    desc: "Massive ice-sheet collapse. Global sea levels rise 13–15 meters in under 500 years. Coastlines reshape. Ice Age ends." },
  { year: -9600, label: "PLATO'S ATLANTIS DATE",   sub: "9,000 yrs before Solon", col: C.gold,
    desc: "Plato writes that Atlantis fell 9,000 years before Solon's Egyptian visit. 9,000 + 600 BCE = 9600 BCE. Same epoch." },
  { year: -7000, label: "REBUILDING",              sub: "9000–5000 BCE",      col: C.green,
    desc: "Human cultures recover. New coastlines stabilize. Early farming begins. Göbekli Tepe (~9600 BCE) emerges in Anatolia." },
  { year: -2200, label: "BRONZE AGE",              sub: "3300–1200 BCE",      col: C.orange,
    desc: "Egypt, Sumer, Indus Valley, Minoans rise. Global flood myths appear across unconnected cultures — memory echoes?" },
  { year: -600,  label: "SOLON IN EGYPT",          sub: "600 BCE",            col: C.purple,
    desc: "Egyptian priests at Sais tell Solon the Atlantis story: 'You Hellenes are children… 9,000 years before your time.'" },
  { year: 950,   label: "INTERPRETATION ERA",      sub: "0–1900 CE",          col: C.rose,
    desc: "Atlantis becomes symbolic. Flood myths universal. Scholars debate literal vs. allegorical. Knowledge fragmentation." },
  { year: 1962,  label: "MODERN SCIENCE MATCHES",  sub: "1900–2025",          col: C.teal,
    desc: "Geologists identify Meltwater Pulse 1B in coral records, ice cores, sediment layers. Dated ~11,600 years ago — Plato's exact timing." },
  { year: 2025,  label: "PRESENT DAY",             sub: "Convergence",        col: C.gold,
    desc: "Ancient narratives meet modern data. Science and mythology converge. AETHER documents the alignment." },
];

const TIMELINE_START = -11700;
const TIMELINE_END = 2100;
const SPAN = TIMELINE_END - TIMELINE_START;

function yearLabel(y: number) {
  if (y < 0) return `${Math.abs(y).toLocaleString()} BCE`;
  return `${y} CE`;
}

// ── Canvas: 11,600-year timeline ─────────────────────────────────────────────
function drawTimeline(ctx: CanvasRenderingContext2D, W: number, H: number, t: number, hover: number | null) {
  ctx.clearRect(0, 0, W, H);
  const bg = ctx.createLinearGradient(0, 0, 0, H);
  bg.addColorStop(0, "#04051a"); bg.addColorStop(1, "#000005");
  ctx.fillStyle = bg; ctx.fillRect(0, 0, W, H);

  const margin = 50;
  const cy = H * 0.55;
  const xFor = (year: number) => margin + ((year - TIMELINE_START) / SPAN) * (W - margin * 2);

  // Major millennium grid
  for (let y = -11000; y <= 2000; y += 1000) {
    const x = xFor(y);
    ctx.beginPath(); ctx.moveTo(x, cy - 8); ctx.lineTo(x, cy + 8);
    ctx.strokeStyle = "rgba(242,191,101,0.05)"; ctx.lineWidth = 0.5; ctx.stroke();
    if (y % 2000 === 0) {
      ctx.fillStyle = "rgba(242,191,101,0.25)"; ctx.font = "6px Cinzel,serif";
      ctx.textAlign = "center"; ctx.fillText(yearLabel(y), x, cy + 22);
    }
  }

  // BCE/CE divider (year 0)
  const zeroX = xFor(0);
  ctx.beginPath(); ctx.moveTo(zeroX, 20); ctx.lineTo(zeroX, H - 20);
  ctx.strokeStyle = "rgba(255,255,255,0.08)"; ctx.lineWidth = 1;
  ctx.setLineDash([2, 4]); ctx.stroke(); ctx.setLineDash([]);
  ctx.fillStyle = "rgba(255,255,255,0.3)"; ctx.font = "5px Cinzel,serif";
  ctx.textAlign = "center"; ctx.fillText("YEAR 0", zeroX, 14);

  // Main timeline arc
  const grad = ctx.createLinearGradient(margin, cy, W - margin, cy);
  grad.addColorStop(0, C.cyan + "60");
  grad.addColorStop(0.15, C.green + "40");
  grad.addColorStop(0.65, C.purple + "40");
  grad.addColorStop(0.95, C.gold + "60");
  ctx.beginPath(); ctx.moveTo(margin, cy); ctx.lineTo(W - margin, cy);
  ctx.strokeStyle = grad; ctx.lineWidth = 2; ctx.stroke();

  // Bracket for "11,600-YEAR ARC"
  const arcStartX = xFor(-9600), arcEndX = xFor(2025);
  ctx.beginPath();
  ctx.moveTo(arcStartX, cy - 35); ctx.lineTo(arcStartX, cy - 28);
  ctx.lineTo(arcEndX, cy - 28); ctx.lineTo(arcEndX, cy - 35);
  ctx.strokeStyle = "rgba(192,132,252,0.3)"; ctx.lineWidth = 1; ctx.stroke();
  ctx.fillStyle = "rgba(192,132,252,0.55)"; ctx.font = "bold 8px Cinzel,serif";
  ctx.textAlign = "center"; ctx.fillText("11,600 YEARS · PLATO TO PRESENT", (arcStartX + arcEndX) / 2, cy - 38);

  // Epoch markers
  EPOCHS.forEach((e, i) => {
    const x = xFor(e.year);
    const isHover = hover === i;
    const pulse = 1 + Math.sin(t * 0.05 + i) * 0.15;
    const r = (isHover ? 9 : 6) * pulse;

    // Glow
    const g = ctx.createRadialGradient(x, cy, 0, x, cy, r * 4);
    g.addColorStop(0, e.col + "60"); g.addColorStop(1, "transparent");
    ctx.beginPath(); ctx.arc(x, cy, r * 4, 0, Math.PI * 2);
    ctx.fillStyle = g; ctx.fill();

    // Core
    ctx.beginPath(); ctx.arc(x, cy, r, 0, Math.PI * 2);
    ctx.fillStyle = e.col; ctx.shadowBlur = 12; ctx.shadowColor = e.col;
    ctx.fill(); ctx.shadowBlur = 0;

    // Connector to label
    const labelY = i % 2 === 0 ? cy - 50 : cy + 50;
    ctx.beginPath(); ctx.moveTo(x, cy); ctx.lineTo(x, labelY + (i % 2 === 0 ? 6 : -6));
    ctx.strokeStyle = e.col + "40"; ctx.lineWidth = 0.5; ctx.stroke();

    // Label
    ctx.fillStyle = e.col; ctx.font = "bold 7px Cinzel,serif"; ctx.textAlign = "center";
    ctx.fillText(e.label, x, labelY);
    ctx.fillStyle = e.col + "70"; ctx.font = "6px Cinzel,serif";
    ctx.fillText(e.sub, x, labelY + (i % 2 === 0 ? -8 : 9));
    ctx.fillStyle = e.col + "55"; ctx.font = "5px monospace";
    ctx.fillText(yearLabel(e.year), x, labelY + (i % 2 === 0 ? -16 : 17));
  });

  // Scan cursor (sweeps left-to-right)
  const cursorYear = TIMELINE_START + ((t * 18) % SPAN);
  const cx = xFor(cursorYear);
  ctx.beginPath(); ctx.moveTo(cx, 25); ctx.lineTo(cx, H - 30);
  ctx.strokeStyle = "rgba(45,212,191,0.4)"; ctx.lineWidth = 1; ctx.stroke();
  ctx.fillStyle = "rgba(45,212,191,0.6)"; ctx.font = "6px monospace";
  ctx.textAlign = cx > W * 0.85 ? "right" : "left";
  ctx.fillText(yearLabel(Math.round(cursorYear)), cx + (cx > W * 0.85 ? -4 : 4), 30);

  // Header
  ctx.fillStyle = "rgba(242,191,101,0.5)"; ctx.font = "bold 9px Cinzel,serif"; ctx.textAlign = "center";
  ctx.fillText("11,600-YEAR ALIGNMENT · PLATO'S ATLANTIS · MELTWATER PULSE 1B · PRESENT DAY", W / 2, 14);
}

// ── Canvas: Antikythera Mechanism ────────────────────────────────────────────
function drawAntikythera(ctx: CanvasRenderingContext2D, W: number, H: number, t: number) {
  ctx.clearRect(0, 0, W, H);
  const bg = ctx.createRadialGradient(W/2, H/2, 0, W/2, H/2, W*0.7);
  bg.addColorStop(0, "#0a0810"); bg.addColorStop(1, "#000005");
  ctx.fillStyle = bg; ctx.fillRect(0, 0, W, H);

  const cx = W / 2, cy = H / 2;

  // Bronze patina background plate
  ctx.beginPath(); ctx.arc(cx, cy, 130, 0, Math.PI * 2);
  const plate = ctx.createRadialGradient(cx, cy, 50, cx, cy, 130);
  plate.addColorStop(0, "#3a3018"); plate.addColorStop(1, "#1a1408");
  ctx.fillStyle = plate; ctx.fill();
  ctx.strokeStyle = "#5a4820"; ctx.lineWidth = 1; ctx.stroke();

  // Helper: draw gear
  const drawGear = (gx: number, gy: number, r: number, teeth: number, angle: number, col: string, glow = false) => {
    ctx.save(); ctx.translate(gx, gy); ctx.rotate(angle);
    ctx.beginPath();
    for (let i = 0; i < teeth * 2; i++) {
      const a = (i / (teeth * 2)) * Math.PI * 2;
      const tr = i % 2 === 0 ? r : r * 0.88;
      const px = Math.cos(a) * tr, py = Math.sin(a) * tr;
      if (i === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);
    }
    ctx.closePath();
    if (glow) { ctx.shadowBlur = 8; ctx.shadowColor = col; }
    ctx.fillStyle = col; ctx.fill();
    ctx.shadowBlur = 0;
    ctx.strokeStyle = "rgba(0,0,0,0.4)"; ctx.lineWidth = 0.5; ctx.stroke();
    // Inner ring
    ctx.beginPath(); ctx.arc(0, 0, r * 0.5, 0, Math.PI * 2);
    ctx.fillStyle = "rgba(0,0,0,0.3)"; ctx.fill();
    // Spoke marks
    for (let s = 0; s < 4; s++) {
      const sa = (s / 4) * Math.PI * 2;
      ctx.beginPath(); ctx.moveTo(0, 0);
      ctx.lineTo(Math.cos(sa) * r * 0.5, Math.sin(sa) * r * 0.5);
      ctx.strokeStyle = "rgba(0,0,0,0.5)"; ctx.lineWidth = 1; ctx.stroke();
    }
    ctx.restore();
  };

  // Main gear (Sun cycle)
  drawGear(cx, cy, 70, 36, t * 0.005, "#d4a94e", true);
  // Moon gear (smaller, faster)
  drawGear(cx - 95, cy - 15, 30, 18, -t * 0.01, "#c8d8e8");
  // Saturn gear
  drawGear(cx + 95, cy - 15, 32, 22, t * 0.003, "#a08560");
  // Mars
  drawGear(cx + 60, cy + 80, 24, 14, t * 0.008, "#c46060");
  // Venus
  drawGear(cx - 60, cy + 80, 26, 16, -t * 0.007, "#d8c490");
  // Jupiter (smaller upper)
  drawGear(cx, cy - 100, 22, 14, t * 0.004, "#d4a94e");

  // Connection lines (gear engagements)
  ctx.strokeStyle = "rgba(212,169,78,0.15)"; ctx.lineWidth = 0.5;
  [[cx-95, cy-15], [cx+95, cy-15], [cx+60, cy+80], [cx-60, cy+80], [cx, cy-100]].forEach(([px, py]) => {
    ctx.beginPath(); ctx.moveTo(cx, cy); ctx.lineTo(px, py); ctx.stroke();
  });

  // Front dial — months / zodiac ring
  ctx.beginPath(); ctx.arc(cx, cy, 115, 0, Math.PI * 2);
  ctx.strokeStyle = "rgba(212,169,78,0.4)"; ctx.lineWidth = 1; ctx.stroke();
  ctx.beginPath(); ctx.arc(cx, cy, 122, 0, Math.PI * 2);
  ctx.strokeStyle = "rgba(212,169,78,0.25)"; ctx.lineWidth = 0.5; ctx.stroke();

  const zodiac = ["♈","♉","♊","♋","♌","♍","♎","♏","♐","♑","♒","♓"];
  for (let z = 0; z < 12; z++) {
    const a = (z / 12) * Math.PI * 2 - Math.PI / 2;
    ctx.fillStyle = "rgba(212,169,78,0.65)"; ctx.font = "9px serif"; ctx.textAlign = "center"; ctx.textBaseline = "middle";
    ctx.fillText(zodiac[z], cx + Math.cos(a) * 118, cy + Math.sin(a) * 118);
  }

  // Sun/Moon pointer
  const sunA = (t * 0.005);
  ctx.save(); ctx.translate(cx, cy); ctx.rotate(sunA);
  ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(0, -100);
  ctx.strokeStyle = "#fff3a0"; ctx.lineWidth = 1; ctx.stroke();
  ctx.beginPath(); ctx.arc(0, -100, 4, 0, Math.PI * 2);
  ctx.fillStyle = "#fff3a0"; ctx.shadowBlur = 8; ctx.shadowColor = "#ffd700"; ctx.fill();
  ctx.shadowBlur = 0; ctx.restore();

  const moonA = -t * 0.067;
  ctx.save(); ctx.translate(cx, cy); ctx.rotate(moonA);
  ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(0, -90);
  ctx.strokeStyle = "rgba(200,216,232,0.7)"; ctx.lineWidth = 0.8; ctx.stroke();
  ctx.beginPath(); ctx.arc(0, -90, 3, 0, Math.PI * 2);
  ctx.fillStyle = "#c8d8e8"; ctx.fill(); ctx.restore();

  // Center pin
  ctx.beginPath(); ctx.arc(cx, cy, 5, 0, Math.PI * 2);
  ctx.fillStyle = "#1a1408"; ctx.fill();
  ctx.strokeStyle = "#5a4820"; ctx.lineWidth = 1; ctx.stroke();

  // Labels
  ctx.fillStyle = "rgba(212,169,78,0.45)"; ctx.font = "6px Cinzel,serif"; ctx.textAlign = "center";
  ctx.fillText("ANTIKYTHERA MECHANISM · c. 100 BCE", cx, 16);
  ctx.fillStyle = "rgba(212,169,78,0.3)"; ctx.fillText("BRONZE GEARS · ZODIAC RING · SUN/MOON POSITION · ECLIPSE PREDICTION", cx, H - 8);
}

export default function AtlantisAlignmentPage() {
  const [tab, setTab] = useState<"timeline"|"meltwater"|"antikythera"|"convergence">("timeline");
  const [hover, setHover] = useState<number | null>(null);
  const hoverRef = useRef<number | null>(null);
  const tlRef = useRef<HTMLCanvasElement>(null);
  const akRef = useRef<HTMLCanvasElement>(null);
  const tRef = useRef(0); const rafRef = useRef(0);

  useEffect(() => { hoverRef.current = hover; }, [hover]);

  useEffect(() => {
    const loop = () => {
      tRef.current++;
      const tl = tlRef.current; if (tl) { const ctx = tl.getContext("2d"); if (ctx) drawTimeline(ctx, tl.width, tl.height, tRef.current, hoverRef.current); }
      const ak = akRef.current; if (ak) { const ctx = ak.getContext("2d"); if (ctx) drawAntikythera(ctx, ak.width, ak.height, tRef.current); }
      rafRef.current = requestAnimationFrame(loop);
    };
    rafRef.current = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(rafRef.current);
  }, []);

  return (
    <div className="min-h-screen text-white font-['Raleway',sans-serif] pb-12" style={{ background: C.bg }}>
      {/* Header */}
      <div className="border-b px-6 py-4 sticky top-0 z-20" style={{ background: C.panel + "ee", borderColor: C.gold + "25" }}>
        <p className="text-[10px] tracking-[0.3em] font-['Cinzel',serif] mb-0.5" style={{ color: C.gold + "55" }}>
          SYSTEM · DEEP TIME · MYTHOLOGY MEETS GEOLOGY
        </p>
        <h1 className="text-xl font-['Cinzel',serif] tracking-widest" style={{ color: "#fffcf0" }}>
          THE 11,600-YEAR ALIGNMENT · ATLANTIS · MELTWATER PULSE 1B · PRESENT DAY
        </h1>
        <p className="text-xs mt-0.5" style={{ color: C.gold + "45" }}>
          Plato's Timaeus · 9600 BCE Climate Reset · Antikythera Analog Computer · Modern Convergence 🕰️🌊✨
        </p>
        <div className="flex gap-4 mt-2 flex-wrap">
          {[
            { label: "Atlantis fall",     value: "9600 BCE",    note: "Plato via Solon",                 col: C.gold   },
            { label: "MWP 1B",            value: "9600 BCE",    note: "geologic record",                 col: C.cyan   },
            { label: "Sea-level rise",    value: "13–15 m",     note: "in <500 years",                   col: C.blue   },
            { label: "Solon's visit",     value: "600 BCE",     note: "Egyptian priests at Sais",        col: C.purple },
            { label: "Antikythera",       value: "c. 100 BCE",  note: "earliest known analog computer",  col: C.orange },
            { label: "Match dated",       value: "1962",        note: "geology confirms Plato's timing", col: C.teal   },
          ].map(m => (
            <div key={m.label} className="flex items-center gap-1.5">
              <div className="w-1.5 h-1.5 rounded-full" style={{ background: m.col }} />
              <span className="text-[9px]" style={{ color: m.col + "55" }}>{m.label}</span>
              <span className="text-[10px] font-['Cinzel',serif]" style={{ color: m.col }}>{m.value}</span>
              <span className="text-[8px] text-white/20">{m.note}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-amber-900/20 px-6" style={{ background: C.panel + "88" }}>
        {([["timeline","TIMELINE"],["meltwater","MELTWATER PULSE 1B"],["antikythera","ANTIKYTHERA"],["convergence","CONVERGENCE"]] as const).map(([k,l]) => (
          <button key={k} onClick={() => setTab(k)}
            className={`px-5 py-2.5 text-[11px] tracking-widest font-['Cinzel',serif] border-b-2 transition-all ${
              tab===k ? "border-amber-400 text-amber-300" : "border-transparent text-amber-800/40 hover:text-amber-400"}`}>
            {l}
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait">

        {/* ════ TIMELINE ════ */}
        {tab === "timeline" && (
          <motion.div key="tl" initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }} className="p-5 flex flex-col gap-5">
            <div className="border rounded-xl overflow-hidden" style={{ borderColor: C.gold + "25" }}>
              <p className="text-[9px] tracking-widest font-['Cinzel',serif] px-4 pt-3 pb-1" style={{ color: C.gold + "40" }}>
                LIVE · 11,600-YEAR EPOCH MAP · 8 ANCHORED EVENTS · TEAL SCAN CURSOR
              </p>
              <canvas ref={tlRef} width={1100} height={320} className="w-full" style={{ background: "#000" }} />
            </div>

            <div className="grid grid-cols-2 gap-4">
              {EPOCHS.map((e, i) => (
                <motion.div key={i}
                  onMouseEnter={() => setHover(i)} onMouseLeave={() => setHover(null)}
                  className="border rounded-xl p-4 transition-all"
                  style={{
                    borderColor: e.col + (hover === i ? "60" : "25"),
                    background: hover === i ? e.col + "10" : C.panel + "60"
                  }}>
                  <div className="flex items-center justify-between mb-2">
                    <p className="font-['Cinzel',serif] text-[10px]" style={{ color: e.col }}>{e.label}</p>
                    <span className="text-[8px] font-mono" style={{ color: e.col + "70" }}>{yearLabel(e.year)}</span>
                  </div>
                  <p className="text-[8px] font-['Cinzel',serif] mb-1" style={{ color: e.col + "60" }}>{e.sub}</p>
                  <p className="text-[9px] leading-4" style={{ color: e.col + "70" }}>{e.desc}</p>
                </motion.div>
              ))}
            </div>

            {/* Source infographic */}
            <div className="border rounded-xl overflow-hidden flex flex-col items-center p-4" style={{ borderColor: C.gold + "25", background: C.panel + "60" }}>
              <p className="text-[9px] tracking-widest font-['Cinzel',serif] mb-3" style={{ color: C.gold }}>SOURCE INFOGRAPHIC · ÆTHER ARCHIVE</p>
              <img src={infographic} alt="The 11,600-Year Alignment infographic" className="max-w-md rounded shadow-lg" style={{ boxShadow: "0 0 24px rgba(242,191,101,0.15)" }} />
            </div>
          </motion.div>
        )}

        {/* ════ MELTWATER PULSE 1B ════ */}
        {tab === "meltwater" && (
          <motion.div key="mw" initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }} className="p-5 grid grid-cols-2 gap-5">
            <div className="border rounded-xl p-5 col-span-2" style={{ borderColor: C.cyan + "30", background: C.cyan + "06" }}>
              <p className="text-[10px] font-['Cinzel',serif] mb-2" style={{ color: C.cyan }}>MELTWATER PULSE 1B · ~11,600 YEARS AGO</p>
              <p className="text-[10px] leading-6" style={{ color: C.cyan + "70" }}>
                A geologically rapid pulse of meltwater released from the collapsing Laurentide and Fennoscandian ice sheets, raising global sea level by approximately 13–15 meters in fewer than 500 years. The pulse is recorded in coral reef stratigraphy from Barbados, Tahiti, and the Sunda Shelf, in oxygen-isotope records from Greenland ice cores (GISP2, GRIP), and in marine sediment δ¹⁸O profiles. The event marks the end of the Younger Dryas cold reversal and the formal beginning of the Holocene epoch — the climate window in which all known agricultural civilizations have arisen.
              </p>
            </div>

            {[
              { title: "GEOLOGICAL SIGNATURE", col: C.cyan,
                bullets: [
                  "Coral terraces (Barbados, Tahiti) show drowning surfaces",
                  "Ice cores GISP2/GRIP — sharp δ¹⁸O shift at 11.6 ka BP",
                  "Sunda Shelf submergence visible in bathymetric mapping",
                  "Marine sediment cores show flooding plumes",
                  "Lake Agassiz outburst contributed massive freshwater pulse",
                ] },
              { title: "COASTLINE COLLAPSE", col: C.blue,
                bullets: [
                  "13–15 meters sea-level rise in <500 years",
                  "~25 million km² of coastal land submerged globally",
                  "Sunda land bridge → Indonesian archipelago",
                  "Doggerland (North Sea plain) inundated",
                  "Persian Gulf transitions from valley to sea",
                ] },
              { title: "BIOLOGICAL & CULTURAL IMPACT", col: C.green,
                bullets: [
                  "Mass migrations from coastal lowlands inland",
                  "Mediterranean cultures concentrate around new shorelines",
                  "Göbekli Tepe construction begins ~9600 BCE in Anatolia",
                  "Earliest evidence of cereal cultivation in Levant",
                  "Climate stabilization enables Neolithic Revolution",
                ] },
              { title: "FLOOD MEMORY GLOBALLY", col: C.gold,
                bullets: [
                  "Sumerian Epic of Gilgamesh — Utnapishtim flood",
                  "Hebrew Bible — Noah and the Ark",
                  "Greek — Deucalion's flood",
                  "Hindu — Manu and the Matsya avatar",
                  "Mesoamerican, Polynesian, Aboriginal flood myths",
                ] },
            ].map(c => (
              <div key={c.title} className="border rounded-xl p-4" style={{ borderColor: c.col + "25", background: c.col + "06" }}>
                <p className="text-[9px] font-['Cinzel',serif] mb-3" style={{ color: c.col }}>{c.title}</p>
                {c.bullets.map(b => (
                  <div key={b} className="flex items-start gap-2 mb-1.5">
                    <div className="w-1 h-1 rounded-full mt-1.5 shrink-0" style={{ background: c.col }} />
                    <p className="text-[8.5px] leading-4" style={{ color: c.col + "70" }}>{b}</p>
                  </div>
                ))}
              </div>
            ))}
          </motion.div>
        )}

        {/* ════ ANTIKYTHERA ════ */}
        {tab === "antikythera" && (
          <motion.div key="ak" initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }} className="p-5 grid grid-cols-2 gap-5">
            <div className="border rounded-xl overflow-hidden" style={{ borderColor: C.orange + "25" }}>
              <p className="text-[9px] tracking-widest font-['Cinzel',serif] px-4 pt-3 pb-1" style={{ color: C.orange + "40" }}>
                LIVE · ANTIKYTHERA RECONSTRUCTION · BRONZE GEARS · ZODIAC RING · SUN/MOON POINTERS
              </p>
              <canvas ref={akRef} width={500} height={500} className="w-full" style={{ background: "#000" }} />
            </div>
            <div className="flex flex-col gap-4">
              <div className="border rounded-xl p-4" style={{ borderColor: C.orange + "30", background: C.orange + "06" }}>
                <p className="text-[10px] font-['Cinzel',serif] mb-2" style={{ color: C.orange }}>THE WORLD'S FIRST ANALOG COMPUTER</p>
                <p className="text-[9.5px] leading-5" style={{ color: C.orange + "75" }}>
                  Recovered from a Roman shipwreck near the island of Antikythera in 1901 and dated to approximately 100 BCE, the Antikythera mechanism is an astronomical calculator built from at least 30 interlocking bronze gears. It tracks the positions of the Sun and Moon through the zodiac, predicts solar and lunar eclipses on the Saros cycle, indicates the synodic months of the Metonic 19-year cycle, and displays the four-year Olympiad cycle for the games. Its precision was not equaled in mechanical engineering for at least 1,400 years.
                </p>
              </div>
              <div className="border rounded-xl p-4" style={{ borderColor: C.gold + "30", background: C.panel + "60" }}>
                <p className="text-[10px] font-['Cinzel',serif] mb-2" style={{ color: C.gold }}>THE PERFECT AETHER ANALOG</p>
                <p className="text-[9.5px] leading-5 italic mb-2" style={{ color: C.gold + "75" }}>
                  "A dynamic tool mapping celestial dimensions in real time through gears, much like layering weather, space, and metaphysical data today." 🕰️
                </p>
                <p className="text-[9px] leading-5" style={{ color: C.gold + "60" }}>
                  The mechanism is the conceptual ancestor of AETHER's atlas tracker. Both fuse astronomical positions, cyclical phenomena, and human-relevant timing into a single legible interface. Where the ancients used bronze gears to track Sun, Moon, and zodiac, AETHER uses live data feeds to track planetary positions, geomagnetic storms, aurora forecasts, and personal synchronicities — the same instinct, iterated 2,100 years forward.
                </p>
              </div>
              <div className="border rounded-xl p-4" style={{ borderColor: C.purple + "30", background: C.panel + "60" }}>
                <p className="text-[10px] font-['Cinzel',serif] mb-2" style={{ color: C.purple }}>WHAT IT TRACKED</p>
                <div className="grid grid-cols-2 gap-2 text-[9px]" style={{ color: C.purple + "70" }}>
                  {[
                    "Solar position in zodiac",
                    "Lunar position + phase",
                    "Eclipse prediction (Saros, 18-yr)",
                    "Metonic cycle (19 yr)",
                    "Callippic cycle (76 yr)",
                    "Olympiad games (4 yr)",
                    "Planetary motion (5 known)",
                    "Heliacal star risings",
                  ].map(f => (
                    <div key={f} className="flex items-center gap-1.5">
                      <div className="w-1 h-1 rounded-full" style={{ background: C.purple }} />
                      <span>{f}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* ════ CONVERGENCE ════ */}
        {tab === "convergence" && (
          <motion.div key="conv" initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }} className="p-5 flex flex-col gap-5">
            <div className="border rounded-xl p-5" style={{ borderColor: C.purple + "30", background: C.purple + "06" }}>
              <p className="text-[10px] font-['Cinzel',serif] mb-2" style={{ color: C.purple }}>THE EXACT MATCH · MYTH AND MEASUREMENT</p>
              <p className="text-[10px] leading-6" style={{ color: C.purple + "70" }}>
                In the Timaeus and Critias, Plato writes that Atlantis sank "9,000 years before Solon" — Solon visited the Egyptian priests at Sais around 600 BCE, placing the event at 9600 BCE. For two millennia this number was treated as legend or symbolic exaggeration. In the late twentieth century, Edouard Bard, Richard Fairbanks, and others identified Meltwater Pulse 1B in coral records and dated it to ~11,600 years before present — almost exactly 9600 BCE. The match is precise enough that it is no longer dismissable as coincidence; the question shifts from "did it happen?" to "what kind of memory survives 11,600 years?"
              </p>
            </div>

            <div className="grid grid-cols-3 gap-4">
              {[
                { title: "PLATO'S NUMBER",     col: C.gold,
                  text: "9,000 years before Solon's visit. 9,000 + 600 BCE = 9600 BCE. Specific, dated, repeated in two dialogues.",
                  result: "9600 BCE" },
                { title: "GEOLOGICAL DATING",  col: C.cyan,
                  text: "MWP 1B identified via coral terraces, ice cores, marine sediments. Calibrated to ~11,600 cal yr BP.",
                  result: "9600 BCE ± 200" },
                { title: "OFFSET",             col: C.green,
                  text: "Plato's number falls inside the geological dating uncertainty band. Match within instrument precision.",
                  result: "≈ 0 years" },
              ].map(c => (
                <div key={c.title} className="border rounded-xl p-4 text-center" style={{ borderColor: c.col + "30", background: c.col + "08" }}>
                  <p className="text-[9px] font-['Cinzel',serif] mb-2" style={{ color: c.col }}>{c.title}</p>
                  <p className="text-[10px] leading-5 mb-3" style={{ color: c.col + "70" }}>{c.text}</p>
                  <div className="border-t pt-2" style={{ borderColor: c.col + "20" }}>
                    <p className="text-xl font-['Cinzel',serif]" style={{ color: c.col }}>{c.result}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="border rounded-xl p-5" style={{ borderColor: C.teal + "30", background: C.panel + "60" }}>
              <p className="text-[10px] font-['Cinzel',serif] mb-3" style={{ color: C.teal }}>WHAT KIND OF MEMORY SURVIVES 11,600 YEARS?</p>
              <div className="grid grid-cols-2 gap-5 text-[9.5px] leading-5" style={{ color: C.teal + "70" }}>
                <p>
                  Oral transmission across 350 generations is unprecedented in any documented tradition. The most parsimonious hypotheses are: (a) the catastrophe was so vivid that compressed flood-myth fragments persisted in ritual and song until literate cultures recorded them; (b) Egyptian priesthoods preserved astronomical and historical records reaching back to a pre-dynastic civilization that itself remembered the event; (c) the event left physical signatures — submerged structures, bathymetric anomalies — that later cultures encountered and incorporated into mythology.
                </p>
                <p>
                  AETHER's working hypothesis is that all three operate together. Memory persists in three substrates simultaneously: oral-symbolic (myth), physical-environmental (drowned coastlines), and informational-archival (Egyptian temple records). The 11,600-year alignment is not a single channel of evidence but a coherence — multiple independent records all pointing at the same epoch. This is exactly the kind of multi-channel signal the Atlas Tracker is built to detect in the present.
                </p>
              </div>
            </div>

            <div className="border rounded-xl p-4 text-center" style={{ borderColor: C.gold + "30", background: C.gold + "06" }}>
              <p className="text-[9px] font-['Cinzel',serif] mb-1" style={{ color: C.gold }}>THE ARC</p>
              <p className="text-[10px] italic leading-5" style={{ color: C.gold + "75" }}>
                Atlantis falls. 11,600 years pass. Civilizations rise, fall, rise again. Solon hears the story. Plato writes it down. Twenty-four centuries later, geologists confirm it. The same century, Antikythera is recovered from the sea — proof that the ancients tracked celestial cycles with mechanical precision. The same generation, AETHER builds a digital atlas tracker on the same instinct. The arc closes. 🕰️🌊✨
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
