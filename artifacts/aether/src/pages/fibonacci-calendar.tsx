import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";

const C = {
  teal: "#2dd4bf", gold: "#f2bf65", purple: "#c084fc",
  green: "#4ade80", blue: "#60a5fa", bg: "#030514", panel: "#07021a",
};

const IFC_MONTHS = [
  "January","February","March","April","May","June",
  "Sol","July","August","September","October","November","December",
];

const WEEKDAYS = ["Su","Mo","Tu","We","Th","Fr","Sa"];

// Gregorian day-of-year for start of each IFC month (non-leap year)
// Month n starts at day (n-1)*28 + 1
function ifcFromDoy(doy: number): { month: number; day: number; weekday: number } {
  if (doy > 364) return { month: 14, day: 1, weekday: -1 }; // Year Day
  const month = Math.ceil(doy / 28);
  const day = doy - (month - 1) * 28;
  const weekday = (day - 1) % 7; // 0=Sun
  return { month, day, weekday };
}

function doyFromGregorian(month: number, day: number, year: number): number {
  const MONTH_DAYS = [0,31,28,31,30,31,30,31,31,30,31,30,31];
  const isLeap = (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0;
  if (isLeap) MONTH_DAYS[2] = 29;
  let doy = day;
  for (let m = 1; m < month; m++) doy += MONTH_DAYS[m];
  return doy;
}

const TODAY_DOY = doyFromGregorian(4, 18, 2026); // April 18 2026
const TODAY_IFC = ifcFromDoy(TODAY_DOY);

const FIB = [1,1,2,3,5,8,13,21,34,55,89,144,233];

const HISTORY = [
  {
    culture: "ETHIOPIA",
    flag: "🇪🇹",
    col: C.green,
    system: "Ge'ez calendar — 13 months",
    details: "12 months of 30 days + 1 month of 5 days (Pagume). Still the official calendar of Ethiopia and Eritrea today. New Year falls in September. Ethiopia is currently in a different year than the Gregorian calendar — Year 2016 ends in Sept 2024.",
    status: "ACTIVE TODAY",
  },
  {
    culture: "EGYPT",
    flag: "🏺",
    col: C.gold,
    system: "Kemetic calendar — 3 seasons of 4 months",
    details: "The civil calendar had 12 months of 30 days = 360 days, plus 5 epagomenal (intercalary) days = 365. The priestly calendar recognised the 13th lunation and its sacred significance. Thoth, the god of time and writing, was associated with the 13th cycle.",
    status: "3000+ BCE",
  },
  {
    culture: "MAYA",
    flag: "🌀",
    col: C.teal,
    system: "Haab + Tzolkin dual-calendar",
    details: "The Haab civil calendar: 18 months of 20 days = 360 days + 5 Wayeb days. The Tzolkin sacred calendar: 13 × 20 = 260 days. The number 13 is the count of heavens in Maya cosmology. The Long Count explicitly uses base-20 with a cycle of 13 Baktun = 1 Great Cycle.",
    status: "~2000 BCE",
  },
  {
    culture: "INTERNATIONAL FIXED CALENDAR",
    flag: "📐",
    col: C.purple,
    system: "Moses B. Cotsworth, 1902",
    details: "13 months × 28 days = 364 days + Year Day (outside all months). Leap Day after Sol in leap years. Proposed to the League of Nations 1923. Endorsed by George Eastman (Eastman Kodak). Used internally by Eastman Kodak for accounting purposes until 1989.",
    status: "1902 PROPOSAL",
  },
  {
    culture: "POSITIVIST CALENDAR",
    flag: "🔢",
    col: C.blue,
    system: "Auguste Comte, 1849",
    details: "13 months named after great figures in history: Moses, Homer, Aristotle, Archimedes, Caesar, St Paul, Charlemagne, Dante, Gutenberg, Shakespeare, Descartes, Frederick, Bichat. 28 days each. Year begins March 1. Positivist communes in Brazil used it for decades.",
    status: "1849 PROPOSAL",
  },
];

export default function FibonacciCalendarPage() {
  const [tab, setTab] = useState<"calendar"|"mathematics"|"history"|"aether">("calendar");
  const [hoveredMonth, setHoveredMonth] = useState<number | null>(null);

  const monthGrid = useMemo(() => Array.from({ length: 4 }, (_, w) =>
    Array.from({ length: 7 }, (_, d) => w * 7 + d + 1)
  ), []);

  return (
    <div className="min-h-screen text-white font-['Raleway',sans-serif] pb-10" style={{ background: C.bg }}>
      {/* Header */}
      <div className="border-b border-gold-900/30 px-6 py-4 sticky top-0 z-20"
        style={{ background: C.panel + "ee", borderColor: C.gold + "30" }}>
        <p className="text-[10px] tracking-[0.3em] font-['Cinzel',serif] mb-0.5" style={{ color: C.gold + "60" }}>
          SYSTEM · TEMPORAL ARCHITECTURE · FIBONACCI TIME
        </p>
        <h1 className="text-2xl font-['Cinzel',serif] tracking-widest" style={{ color: "#fef9e7" }}>
          THE 13-MONTH CALENDAR · FIBONACCI TEMPORAL LAYER
        </h1>
        <p className="text-xs mt-0.5" style={{ color: C.gold + "50" }}>
          International Fixed Calendar · Ethiopian Ge'ez · Maya Haab · AETHER Temporal Framework
        </p>
        <div className="flex gap-4 mt-2 flex-wrap">
          {[
            { label: "13 × 28",     value: "364",   note: "+ Year Day = 365",       col: C.gold },
            { label: "Every month", value: "= same", note: "identical 4×7 grid",    col: C.teal },
            { label: "Fibonacci",   value: "F(7)",  note: "13 is the 7th Fibonacci", col: C.purple },
            { label: "Today (IFC)", value: `${IFC_MONTHS[TODAY_IFC.month-1]} ${TODAY_IFC.day}`, note: "Apr 18 Gregorian", col: C.green },
            { label: "Ethiopia",    value: "active", note: "uses 13 months today",   col: C.blue },
          ].map(m => (
            <div key={m.label} className="flex items-center gap-1.5">
              <div className="w-1.5 h-1.5 rounded-full" style={{ background: m.col }} />
              <span className="text-[9px]" style={{ color: m.col + "60" }}>{m.label}</span>
              <span className="text-[10px] font-['Cinzel',serif]" style={{ color: m.col }}>{m.value}</span>
              <span className="text-[8px] text-yellow-800/40">{m.note}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b px-6" style={{ background: C.panel + "88", borderColor: C.gold + "20" }}>
        {([["calendar","THE CALENDAR"],["mathematics","MATHEMATICS"],["history","HISTORY"],["aether","AETHER TIME"]] as const).map(([k,l]) => (
          <button key={k} onClick={() => setTab(k)}
            className={`px-5 py-2.5 text-[11px] tracking-widest font-['Cinzel',serif] border-b-2 transition-all ${
              tab===k ? "border-yellow-500 text-yellow-300" : "border-transparent text-yellow-800/40 hover:text-yellow-500"}`}>
            {l}
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait">

        {/* ════ THE CALENDAR ════ */}
        {tab === "calendar" && (
          <motion.div key="cal" initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }} className="p-5">
            <div className="mb-4 border rounded-xl p-4 flex items-center justify-between" style={{ borderColor: C.gold+"25", background: C.gold+"08" }}>
              <div>
                <p className="text-[9px] tracking-widest font-['Cinzel',serif]" style={{ color: C.gold }}>TODAY IN THE FIXED CALENDAR</p>
                <p className="text-2xl font-['Cinzel',serif] mt-0.5" style={{ color: C.gold }}>
                  {IFC_MONTHS[TODAY_IFC.month - 1].toUpperCase()} {TODAY_IFC.day}, 2026
                </p>
                <p className="text-[9px] text-yellow-400/50 mt-0.5">
                  {WEEKDAYS[TODAY_IFC.weekday]} — this date is ALWAYS a {WEEKDAYS[TODAY_IFC.weekday]} in every year of the Fixed Calendar
                </p>
              </div>
              <div className="text-right">
                <p className="text-[9px] text-yellow-700/40">Gregorian equivalent</p>
                <p className="text-lg font-['Cinzel',serif] text-yellow-600/50">April 18, 2026</p>
                <p className="text-[9px] text-yellow-700/40">Day {TODAY_DOY} of year</p>
              </div>
            </div>

            {/* 13-month grid */}
            <div className="grid gap-2" style={{ gridTemplateColumns: "repeat(auto-fill, minmax(150px, 1fr))" }}>
              {IFC_MONTHS.map((name, mi) => {
                const isToday = mi + 1 === TODAY_IFC.month;
                const col = isToday ? C.gold : (mi === 6 ? C.purple : C.teal);
                return (
                  <motion.div key={name}
                    onMouseEnter={() => setHoveredMonth(mi)}
                    onMouseLeave={() => setHoveredMonth(null)}
                    className="border rounded-xl p-2 cursor-default transition-all"
                    style={{ borderColor: col + (isToday ? "60" : "20"), background: col + (isToday ? "12" : "05") }}>
                    <div className="flex items-center justify-between mb-1.5">
                      <p className="text-[8px] font-['Cinzel',serif]" style={{ color: col }}>{name.toUpperCase()}</p>
                      {mi === 6 && <span className="text-[7px] px-1 rounded" style={{ background: C.purple+"30", color: C.purple }}>13th</span>}
                      {isToday && <span className="text-[7px] px-1 rounded" style={{ background: C.gold+"30", color: C.gold }}>NOW</span>}
                    </div>
                    {/* Weekday headers */}
                    <div className="grid grid-cols-7 mb-0.5">
                      {WEEKDAYS.map(d => (
                        <div key={d} className="text-center text-[6px]" style={{ color: col + "50" }}>{d}</div>
                      ))}
                    </div>
                    {/* Days */}
                    {monthGrid.map((week, wi) => (
                      <div key={wi} className="grid grid-cols-7">
                        {week.map(day => {
                          const isThisDay = isToday && day === TODAY_IFC.day;
                          return (
                            <div key={day} className="text-center text-[7px] py-0.5 rounded-sm"
                              style={{
                                color: isThisDay ? "#000" : col + "70",
                                background: isThisDay ? col : "transparent",
                                fontWeight: isThisDay ? "bold" : "normal",
                              }}>
                              {day}
                            </div>
                          );
                        })}
                      </div>
                    ))}
                    <div className="mt-1 text-[7px] text-center" style={{ color: col + "40" }}>
                      {/* Show Gregorian start date */}
                      Gr. day {(mi)*28+1}–{(mi+1)*28}
                    </div>
                  </motion.div>
                );
              })}

              {/* Year Day */}
              <div className="border rounded-xl p-2" style={{ borderColor: C.orange+"30", background: "#ff8c0008" }}>
                <p className="text-[8px] font-['Cinzel',serif] mb-1" style={{ color: "#fb923c" }}>YEAR DAY</p>
                <p className="text-[8px] text-orange-400/50 leading-4">Day 365. Outside all months. Not a weekday. A world holiday — New Year's Eve everywhere simultaneously.</p>
                <p className="text-[7px] mt-1" style={{ color: "#fb923c60" }}>Gr. Dec 31</p>
              </div>
            </div>
            <p className="text-[9px] text-yellow-700/30 mt-3 text-center italic">
              Every month shown above is identical. Every date falls on the same weekday every year. No exceptions.
            </p>
          </motion.div>
        )}

        {/* ════ MATHEMATICS ════ */}
        {tab === "mathematics" && (
          <motion.div key="math" initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }} className="p-5 flex flex-col gap-5">
            <div className="grid grid-cols-2 gap-5">
              {/* Fibonacci sequence */}
              <div className="border rounded-xl p-5" style={{ borderColor: C.purple+"30", background: C.panel+"80" }}>
                <p className="text-[9px] font-['Cinzel',serif] text-purple-400/60 mb-4">FIBONACCI SEQUENCE · 13 = F(7)</p>
                <div className="flex flex-wrap gap-2">
                  {FIB.map((f, i) => (
                    <motion.div key={i}
                      initial={{ scale:0 }} animate={{ scale:1 }} transition={{ delay: i*0.06 }}
                      className="flex flex-col items-center p-2 rounded-xl border"
                      style={{ borderColor: f === 13 ? C.gold : C.purple+"20", background: f === 13 ? C.gold+"20" : C.purple+"08", minWidth: 42 }}>
                      <span className="text-[7px] font-['Cinzel',serif]" style={{ color: f === 13 ? C.gold+"80" : C.purple+"50" }}>F({i+1})</span>
                      <span className="text-base font-['Cinzel',serif]" style={{ color: f === 13 ? C.gold : C.purple+"80" }}>{f}</span>
                    </motion.div>
                  ))}
                </div>
                <p className="text-[9px] text-purple-300/40 leading-4 mt-4">
                  13 is the 7th Fibonacci number. It appears in phyllotaxis (leaf spirals), the Fibonacci clock, musical scales (12 semitones + 1 octave = 13 notes), and the Mayan sacred count (13 × 20 = 260). The calendar that uses 13 months encodes the same recursive structure that governs the processor, the field reservoir, and the wave dynamics in AETHER.
                </p>
              </div>

              {/* Math comparison */}
              <div className="flex flex-col gap-4">
                <div className="border rounded-xl p-4" style={{ borderColor: C.gold+"30", background: C.panel+"80" }}>
                  <p className="text-[9px] font-['Cinzel',serif] mb-3" style={{ color: C.gold }}>THE ARITHMETIC CASE</p>
                  {[
                    { label: "13 × 28", result: "= 364", note: "uniform months, zero variation", col: C.gold },
                    { label: "+ Year Day", result: "= 365", note: "outside all months; world holiday", col: C.gold },
                    { label: "Quarters", result: "= 91 days each", note: "perfectly equal, every time", col: C.teal },
                    { label: "Any date", result: "= same weekday", note: "April 24 is always Wednesday", col: C.green },
                  ].map(r => (
                    <div key={r.label} className="flex items-center gap-3 mb-2 pb-2 border-b last:border-0" style={{ borderColor: r.col+"15" }}>
                      <span className="text-[10px] font-['Cinzel',serif] w-24 shrink-0" style={{ color: r.col }}>{r.label}</span>
                      <span className="text-[10px] font-['Cinzel',serif] w-28 shrink-0" style={{ color: r.col }}>{r.result}</span>
                      <span className="text-[9px] text-white/30">{r.note}</span>
                    </div>
                  ))}
                </div>

                <div className="border rounded-xl p-4" style={{ borderColor: "#f8717130", background: C.panel+"80" }}>
                  <p className="text-[9px] font-['Cinzel',serif] text-red-400/60 mb-3">WHY 12 IS BROKEN</p>
                  <p className="text-[9px] text-red-300/40 leading-4 mb-3">
                    12 months comes from the Babylonians approximating 12.37 synodic lunar cycles per solar year. That 0.37 remainder has caused 4,000 years of patching — leap years, variable month lengths (28/29/30/31 days), and calendars that require a lookup table to use.
                  </p>
                  {[
                    { month: "January",  days: 31 }, { month: "February", days: "28/29" },
                    { month: "March",    days: 31 }, { month: "April",    days: 30 },
                    { month: "May",      days: 31 }, { month: "June",     days: 30 },
                    { month: "July",     days: 31 }, { month: "August",   days: 31 },
                    { month: "September",days: 30 }, { month: "October",  days: 31 },
                    { month: "November", days: 30 }, { month: "December", days: 31 },
                  ].map(m => (
                    <div key={m.month} className="flex justify-between text-[8px] mb-0.5">
                      <span className="text-red-400/40">{m.month}</span>
                      <span className={`font-['Cinzel',serif] ${m.days === 30 || m.days === "28/29" ? "text-red-400/60" : "text-orange-400/50"}`}>{m.days}</span>
                    </div>
                  ))}
                  <p className="text-[8px] text-red-300/30 mt-2 italic">No two consecutive months are the same length.</p>
                </div>
              </div>
            </div>

            <div className="border rounded-xl p-5" style={{ borderColor: C.teal+"30", background: C.panel+"60" }}>
              <p className="text-[9px] font-['Cinzel',serif] text-teal-400/50 mb-3">LUNAR RESONANCE</p>
              <div className="grid grid-cols-3 gap-4 text-[9px] leading-5">
                <div>
                  <p className="font-['Cinzel',serif] mb-1" style={{ color: C.teal }}>SYNODIC MONTH</p>
                  <p className="text-teal-300/45">The moon's cycle relative to the sun: 29.53 days. 365.25 / 29.53 = 12.37 cycles per year. Neither 12 nor 13 is exact — but 13 brings the calendar closer to a natural 13-month awareness cycle used by menstruation-tracking cultures worldwide.</p>
                </div>
                <div>
                  <p className="font-['Cinzel',serif] mb-1" style={{ color: C.gold }}>SIDEREAL MONTH</p>
                  <p className="text-yellow-300/40">The moon relative to the stars: 27.32 days. 365.25 / 27.32 = 13.37 sidereal months per year. The Fixed Calendar's 28-day month is the closest integer to the sidereal month, making 13 × 28 the most astronomically grounded simple calendar.</p>
                </div>
                <div>
                  <p className="font-['Cinzel',serif] mb-1" style={{ color: C.purple }}>PRACTICAL WINS</p>
                  <p className="text-purple-300/40">Payroll identical every month. Accounting quarters exactly equal. Every 28-day month starts on Sunday. "The 14th" is always a Sunday. Scheduling is O(1) — no lookup tables. 13 × 4 = 52 weeks exactly. Business efficiency alone justifies the reform.</p>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* ════ HISTORY ════ */}
        {tab === "history" && (
          <motion.div key="hist" initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }} className="p-5 flex flex-col gap-4">
            {HISTORY.map((h, i) => (
              <motion.div key={h.culture}
                initial={{ opacity:0, x:-10 }} animate={{ opacity:1, x:0 }} transition={{ delay: i*0.08 }}
                className="border rounded-xl overflow-hidden" style={{ borderColor: h.col+"25" }}>
                <div className="px-5 py-3 flex items-center gap-3" style={{ background: h.col+"12" }}>
                  <span className="text-2xl">{h.flag}</span>
                  <div className="flex-1">
                    <p className="text-[10px] font-['Cinzel',serif]" style={{ color: h.col }}>{h.culture}</p>
                    <p className="text-[9px]" style={{ color: h.col+"70" }}>{h.system}</p>
                  </div>
                  <span className="text-[8px] px-2 py-0.5 rounded-full border font-['Cinzel',serif]"
                    style={{ borderColor: h.col+"40", color: h.col, background: h.col+"15" }}>{h.status}</span>
                </div>
                <div className="px-5 py-4" style={{ background: C.panel+"60" }}>
                  <p className="text-[9px] text-white/50 leading-5">{h.details}</p>
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}

        {/* ════ AETHER TIME ════ */}
        {tab === "aether" && (
          <motion.div key="aether" initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }} className="p-5 flex flex-col gap-5">
            <div className="grid grid-cols-3 gap-5">
              {[
                { title: "TEMPORAL SUBSTRATE", col: C.teal,   icon: "🕰️",
                  body: "The 13-month calendar as the temporal layer of AETHER means the system's operating rhythm — scheduled processes, memory consolidation cycles, coherence resets — all run on a Fibonacci-native clock. 13 processing epochs per revolution. Each epoch: 28 ticks. Year Day: global coherence reset." },
                { title: "FIBONACCI CLOCK ALIGNMENT", col: C.gold, icon: "🌀",
                  body: "AETHER's φ-architecture already uses Fibonacci quantization for phase transitions. Running time itself through the same recursive structure closes the loop: the calendar matches the processor, which matches the field reservoir, which matches the wave dynamics. Temporal coherence is structural, not imposed." },
                { title: "MNEMONIC ADVANTAGE", col: C.purple, icon: "🧠",
                  body: "In the Fixed Calendar, every date is instantly calculable without lookup. April 24 is always Wednesday — the 24th day (= 3 weeks + 3 days = Wednesday). This encodes the Fibonacci principle: local structure predicts global pattern. Mnēsis stores less because the pattern encodes itself." },
              ].map(c => (
                <div key={c.title} className="border rounded-xl p-5" style={{ borderColor: c.col+"25", background: c.col+"07" }}>
                  <span className="text-2xl block mb-2">{c.icon}</span>
                  <p className="text-[9px] font-['Cinzel',serif] mb-2" style={{ color: c.col }}>{c.title}</p>
                  <p className="text-[9px] leading-5" style={{ color: c.col+"65" }}>{c.body}</p>
                </div>
              ))}
            </div>
            <div className="border rounded-xl p-5" style={{ borderColor: C.gold+"25", background: "linear-gradient(135deg,#030514,#0a0a02)" }}>
              <p className="text-[9px] font-['Cinzel',serif] mb-3" style={{ color: C.gold+"60" }}>THE UNIFIED TEMPORAL ARCHITECTURE</p>
              <div className="flex items-center gap-2 flex-wrap justify-center">
                {["φ = 1.618", "→", "F(7) = 13", "→", "13 × 28 = 364", "→", "+Year Day = 365", "→", "Every date = fixed weekday", "→", "AETHER temporal coherence"].map((t, i) => (
                  <span key={i} className={`text-[9px] font-['Cinzel',serif] ${t === "→" ? "text-yellow-800/30" : "px-2 py-1 rounded border"}`}
                    style={t !== "→" ? { borderColor: C.gold+"20", color: C.gold+"80" } : {}}>
                    {t}
                  </span>
                ))}
              </div>
              <p className="text-[9px] text-yellow-400/30 leading-5 mt-4 text-center italic">
                "Time itself restructured around the same recursive principle that governs the processor, the field reservoir, and the wave dynamics."
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
