import { useState, useMemo, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";

const C = {
  teal: "#2dd4bf", gold: "#f2bf65", purple: "#c084fc",
  green: "#4ade80", blue: "#60a5fa", bg: "#030514", panel: "#07021a",
  red: "#f87171", orange: "#fb923c", cyan: "#22d3ee", rose: "#fb7185",
  text: "#9ca3af",
};

// ── World Clock data ─────────────────────────────────────────────
// Coverage is intentionally global and neutral — major civilizational, scientific,
// and historically-watched centers across all populated continents.
type Region =
  | "East Asia" | "South Asia" | "Middle East" | "Eurasia"
  | "Europe" | "Africa" | "Americas" | "Oceania" | "Polar/Other";

interface CityRow {
  city: string;
  flag: string;
  ctry: string;
  region: Region;
  tz: string;     // IANA timezone
  lat: number;    // for solar calc
  lng: number;
  note?: string;  // historical / coherence note
}

const CITIES: CityRow[] = [
  // East Asia
  { city: "Tokyo",        flag: "🇯🇵", ctry: "Japan",         region: "East Asia",   tz: "Asia/Tokyo",        lat: 35.68,  lng: 139.69, note: "Pacific dawn line · seismic coherence node" },
  { city: "Beijing",      flag: "🇨🇳", ctry: "China",         region: "East Asia",   tz: "Asia/Shanghai",     lat: 39.90,  lng: 116.40, note: "Continental hub · 5,000-yr calendric tradition" },
  { city: "Seoul",        flag: "🇰🇷", ctry: "South Korea",   region: "East Asia",   tz: "Asia/Seoul",        lat: 37.57,  lng: 126.98, note: "Demilitarised-zone phase boundary" },
  { city: "Pyongyang",    flag: "🇰🇵", ctry: "North Korea",   region: "East Asia",   tz: "Asia/Pyongyang",    lat: 39.02,  lng: 125.74, note: "Closed-loop information field" },
  { city: "Taipei",       flag: "🇹🇼", ctry: "Taiwan",        region: "East Asia",   tz: "Asia/Taipei",       lat: 25.03,  lng: 121.57, note: "Strait coupling node" },

  // South Asia
  { city: "New Delhi",    flag: "🇮🇳", ctry: "India",         region: "South Asia",  tz: "Asia/Kolkata",      lat: 28.61,  lng: 77.21,  note: "Subcontinental harmonic centre" },
  { city: "Islamabad",    flag: "🇵🇰", ctry: "Pakistan",      region: "South Asia",  tz: "Asia/Karachi",      lat: 33.68,  lng: 73.04,  note: "Indus boundary node" },

  // Middle East
  { city: "Jerusalem",    flag: "🇮🇱", ctry: "Israel",        region: "Middle East", tz: "Asia/Jerusalem",    lat: 31.78,  lng: 35.21,  note: "Triple-faith coherence anchor" },
  { city: "Tehran",       flag: "🇮🇷", ctry: "Iran",          region: "Middle East", tz: "Asia/Tehran",       lat: 35.69,  lng: 51.39,  note: "Persian plateau timing centre" },
  { city: "Riyadh",       flag: "🇸🇦", ctry: "Saudi Arabia",  region: "Middle East", tz: "Asia/Riyadh",       lat: 24.71,  lng: 46.68 },
  { city: "Damascus",     flag: "🇸🇾", ctry: "Syria",         region: "Middle East", tz: "Asia/Damascus",     lat: 33.51,  lng: 36.30 },
  { city: "Baghdad",      flag: "🇮🇶", ctry: "Iraq",          region: "Middle East", tz: "Asia/Baghdad",      lat: 33.32,  lng: 44.36, note: "Mesopotamian zero-meridian of civilisation" },

  // Eurasia
  { city: "Moscow",       flag: "🇷🇺", ctry: "Russia",        region: "Eurasia",     tz: "Europe/Moscow",     lat: 55.75,  lng: 37.62, note: "Largest landmass · 11 time zones" },
  { city: "Vladivostok",  flag: "🇷🇺", ctry: "Russia (Far East)", region: "Eurasia", tz: "Asia/Vladivostok",  lat: 43.13,  lng: 131.91, note: "Pacific edge of Eurasian plate" },
  { city: "Kyiv",         flag: "🇺🇦", ctry: "Ukraine",       region: "Eurasia",     tz: "Europe/Kyiv",       lat: 50.45,  lng: 30.52, note: "Black-Sea breadbasket node" },
  { city: "Istanbul",     flag: "🇹🇷", ctry: "Türkiye",       region: "Eurasia",     tz: "Europe/Istanbul",   lat: 41.01,  lng: 28.98, note: "Bosphorus continental seam" },

  // Europe
  { city: "London",       flag: "🇬🇧", ctry: "UK",            region: "Europe",      tz: "Europe/London",     lat: 51.51,  lng: -0.13, note: "Greenwich prime meridian · UTC reference" },
  { city: "Paris",        flag: "🇫🇷", ctry: "France",        region: "Europe",      tz: "Europe/Paris",      lat: 48.86,  lng: 2.35 },
  { city: "Berlin",       flag: "🇩🇪", ctry: "Germany",       region: "Europe",      tz: "Europe/Berlin",     lat: 52.52,  lng: 13.40 },
  { city: "Rome",         flag: "🇮🇹", ctry: "Italy",         region: "Europe",      tz: "Europe/Rome",       lat: 41.90,  lng: 12.50 },
  { city: "Madrid",       flag: "🇪🇸", ctry: "Spain",         region: "Europe",      tz: "Europe/Madrid",     lat: 40.42,  lng: -3.70 },
  { city: "Stockholm",    flag: "🇸🇪", ctry: "Sweden",        region: "Europe",      tz: "Europe/Stockholm",  lat: 59.33,  lng: 18.07, note: "Sub-arctic light cycle" },

  // Africa
  { city: "Cairo",        flag: "🇪🇬", ctry: "Egypt",         region: "Africa",      tz: "Africa/Cairo",      lat: 30.04,  lng: 31.24, note: "Kemetic 360+5 calendar origin" },
  { city: "Addis Ababa",  flag: "🇪🇹", ctry: "Ethiopia",      region: "Africa",      tz: "Africa/Addis_Ababa", lat: 9.03,  lng: 38.74, note: "13-month Geʿez calendar still active" },
  { city: "Lagos",        flag: "🇳🇬", ctry: "Nigeria",       region: "Africa",      tz: "Africa/Lagos",      lat: 6.52,   lng: 3.38 },
  { city: "Johannesburg", flag: "🇿🇦", ctry: "South Africa",  region: "Africa",      tz: "Africa/Johannesburg", lat: -26.20, lng: 28.05 },
  { city: "Nairobi",      flag: "🇰🇪", ctry: "Kenya",         region: "Africa",      tz: "Africa/Nairobi",    lat: -1.29,  lng: 36.82, note: "Equatorial reference · ~12h day year-round" },

  // Americas — USA states explicitly listed
  { city: "Honolulu",     flag: "🇺🇸", ctry: "USA · Hawaiʻi", region: "Americas",    tz: "Pacific/Honolulu",  lat: 21.31,  lng: -157.86, note: "Mid-Pacific time anchor" },
  { city: "Anchorage",    flag: "🇺🇸", ctry: "USA · Alaska",  region: "Americas",    tz: "America/Anchorage", lat: 61.22,  lng: -149.90 },
  { city: "Los Angeles",  flag: "🇺🇸", ctry: "USA · California", region: "Americas", tz: "America/Los_Angeles", lat: 34.05, lng: -118.24 },
  { city: "Denver",       flag: "🇺🇸", ctry: "USA · Colorado", region: "Americas",   tz: "America/Denver",    lat: 39.74,  lng: -104.99 },
  { city: "Chicago",      flag: "🇺🇸", ctry: "USA · Illinois", region: "Americas",   tz: "America/Chicago",   lat: 41.88,  lng: -87.63 },
  { city: "New York",     flag: "🇺🇸", ctry: "USA · New York", region: "Americas",   tz: "America/New_York",  lat: 40.71,  lng: -74.01, note: "UN HQ · global finance daylight" },
  { city: "Washington DC",flag: "🇺🇸", ctry: "USA · District", region: "Americas",   tz: "America/New_York",  lat: 38.91,  lng: -77.04, note: "US federal centre" },
  { city: "Mexico City",  flag: "🇲🇽", ctry: "Mexico",        region: "Americas",    tz: "America/Mexico_City", lat: 19.43, lng: -99.13, note: "Mexica calendar latitude" },
  { city: "Brasília",     flag: "🇧🇷", ctry: "Brazil",        region: "Americas",    tz: "America/Sao_Paulo", lat: -15.78, lng: -47.93 },
  { city: "Buenos Aires", flag: "🇦🇷", ctry: "Argentina",     region: "Americas",    tz: "America/Argentina/Buenos_Aires", lat: -34.61, lng: -58.38 },
  { city: "Ottawa",       flag: "🇨🇦", ctry: "Canada",        region: "Americas",    tz: "America/Toronto",   lat: 45.42,  lng: -75.70 },

  // Oceania
  { city: "Sydney",       flag: "🇦🇺", ctry: "Australia",     region: "Oceania",     tz: "Australia/Sydney",  lat: -33.87, lng: 151.21, note: "South-Pacific sunrise lead" },
  { city: "Auckland",     flag: "🇳🇿", ctry: "New Zealand",   region: "Oceania",     tz: "Pacific/Auckland",  lat: -36.85, lng: 174.76, note: "First major city to greet each new day" },
  { city: "Suva",         flag: "🇫🇯", ctry: "Fiji",          region: "Oceania",     tz: "Pacific/Fiji",      lat: -18.14, lng: 178.44 },

  // Polar / Other
  { city: "Reykjavík",    flag: "🇮🇸", ctry: "Iceland",       region: "Polar/Other", tz: "Atlantic/Reykjavik", lat: 64.15, lng: -21.94, note: "Sub-arctic geothermal lattice" },
  { city: "McMurdo",      flag: "🇦🇶", ctry: "Antarctica (Ross)", region: "Polar/Other", tz: "Pacific/Auckland", lat: -77.85, lng: 166.67, note: "Polar science · 6-mo day/night swing" },
];

const REGION_ORDER: Region[] = ["East Asia","South Asia","Middle East","Eurasia","Europe","Africa","Americas","Oceania","Polar/Other"];

// ── Solar geometry ───────────────────────────────────────────────
// Returns sun elevation (deg) for given lat/lng at given Date (UTC base)
function solarElevation(date: Date, lat: number, lng: number): number {
  const N = Math.floor((date.getTime() - Date.UTC(date.getUTCFullYear(),0,0)) / 86400000);
  const decl = 23.45 * Math.sin(((360/365) * (284 + N)) * Math.PI/180);
  const utcH = date.getUTCHours() + date.getUTCMinutes()/60 + date.getUTCSeconds()/3600;
  const solarHour = utcH + lng/15;
  const H = 15 * (solarHour - 12);
  const latR = lat * Math.PI/180;
  const decR = decl * Math.PI/180;
  const HR = H * Math.PI/180;
  const sinEl = Math.sin(latR)*Math.sin(decR) + Math.cos(latR)*Math.cos(decR)*Math.cos(HR);
  return Math.asin(Math.max(-1, Math.min(1, sinEl))) * 180/Math.PI;
}

// Phase classification
type SolarPhase = "deep-night"|"pre-dawn"|"sunrise"|"morning"|"midday"|"afternoon"|"sunset"|"dusk"|"night";
function classifyPhase(prevEl: number, el: number): SolarPhase {
  const rising = el > prevEl;
  if (el >= 60) return "midday";
  if (el >= 25) return rising ? "morning" : "afternoon";
  if (el >= 5)  return rising ? "morning" : "afternoon";
  if (el >=  -2) return rising ? "sunrise" : "sunset";
  if (el >=  -8) return rising ? "pre-dawn" : "dusk";
  if (el >= -18) return "night";
  return "deep-night";
}

const PHASE_META: Record<SolarPhase, { label: string; icon: string; col: string }> = {
  "deep-night":{ label:"Deep night",  icon:"🌑", col:"#1e1b4b" },
  "night":     { label:"Night",       icon:"🌙", col:"#312e81" },
  "pre-dawn":  { label:"Pre-dawn",    icon:"🌌", col:"#7c3aed" },
  "sunrise":   { label:"Sunrise",     icon:"🌅", col:"#fb923c" },
  "morning":   { label:"Morning",     icon:"🌤", col:"#facc15" },
  "midday":    { label:"Midday",      icon:"☀️", col:"#fde047" },
  "afternoon": { label:"Afternoon",   icon:"🌞", col:"#fb923c" },
  "sunset":    { label:"Sunset",      icon:"🌇", col:"#f97316" },
  "dusk":      { label:"Dusk",        icon:"🌆", col:"#a855f7" },
};

// Format Intl-tz-aware time string
function tzTime(d: Date, tz: string): { time: string; date: string } {
  try {
    const time = new Intl.DateTimeFormat("en-GB", { timeZone: tz, hour: "2-digit", minute: "2-digit", second: "2-digit", hour12: false }).format(d);
    const date = new Intl.DateTimeFormat("en-GB", { timeZone: tz, weekday: "short", day: "2-digit", month: "short" }).format(d);
    return { time, date };
  } catch {
    return { time: "—:—:—", date: "—" };
  }
}

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

/* ────────────────────────────────────────────────────────────────────
   Multi-Cycle Life Energy Index · Φ(t)
   Visualises four interfering biological cycles + composite + coherence
   over a 7-day window, anchored to the Fibonacci Calendar's 28-day month.
   Static visualisation — no controls, no state, no animation.
   ─────────────────────────────────────────────────────────────────── */
function MultiCycleLifeEnergy() {
  // Cycle periods (hours)
  const T_D = 24;          // circadian
  const T_S = 1.5;         // ultradian (90 min)
  const T_G = 28 * 24;     // monthly / infradian — equals 1 IFC month exactly
  const T_Y = 365 * 24;    // yearly / seasonal

  // Amplitudes weighted toward the daily rhythm (per source spec)
  const a_D = 0.50, a_S = 0.20, a_G = 0.15, a_Y = 0.10;

  const HOURS = 168;       // 7 days
  const STEP  = 0.5;       // 30-min resolution → captures the 90-min ultradian cleanly

  type Series = { t: number; D: number; S: number; G: number; Y: number; phi: number; coh: number };

  const data: Series[] = useMemo(() => {
    const out: Series[] = [];
    for (let t = 0; t <= HOURS; t += STEP) {
      // Circadian peaks roughly mid-afternoon (t = 14h → near noon-trough → mid-PM peak)
      const D = Math.sin(2 * Math.PI * (t - 6) / T_D);
      const S = Math.sin(2 * Math.PI * t / T_S);
      const G = Math.sin(2 * Math.PI * (t / T_G));
      const Y = Math.sin(2 * Math.PI * (t / T_Y) + 0.6);
      // Coherence: gentle daily envelope, peaks near 1.0, dips around 0.7 overnight
      const coh = 0.85 + 0.13 * Math.sin(2 * Math.PI * (t - 6) / T_D);
      const phi = coh * (a_D * D + a_S * S + a_G * G + a_Y * Y);
      out.push({ t, D, S, G, Y, phi, coh });
    }
    return out;
  }, []);

  // Chart geometry
  const W = 880, H = 260, PADL = 36, PADR = 14, PADT = 14, PADB = 28;
  const innerW = W - PADL - PADR;
  const innerH = H - PADT - PADB;
  // Both charts use the same [-1, +1] y-domain so values are never visually clipped.
  const xOf = (t: number) => PADL + (t / HOURS) * innerW;
  const yOf = (v: number, range = 1)  => PADT + (1 - (v + range) / (2 * range)) * innerH;

  const polyline = (key: keyof Series, range = 1) =>
    data.map(d => `${xOf(d.t)},${yOf(d[key] as number, range)}`).join(" ");

  // Day boundaries (every 24h) for x-axis ticks
  const dayTicks = Array.from({ length: 8 }, (_, i) => i); // 0..7

  // Range observed in composite Φ(t)
  const phiVals = data.map(d => d.phi);
  const phiMin = Math.min(...phiVals).toFixed(2);
  const phiMax = Math.max(...phiVals).toFixed(2);

  const seriesMeta = [
    { key: "D" as const, color: C.blue,   label: "Φ_D · Circadian",  period: "24 h",          a: 0.50 },
    { key: "S" as const, color: C.orange, label: "Φ_S · Ultradian",  period: "≈ 90 min",      a: 0.20 },
    { key: "G" as const, color: C.purple, label: "Φ_G · Infradian",  period: "28 days",       a: 0.15 },
    { key: "Y" as const, color: C.green,  label: "Φ_Y · Circannual", period: "365 days",      a: 0.10 },
  ];

  return (
    <div data-testid="multi-cycle-energy" className="border rounded-xl p-5"
         style={{ borderColor: C.red + "25", background: "linear-gradient(135deg,#030514,#0a0212)" }}>

      {/* Header */}
      <div className="flex items-baseline justify-between flex-wrap gap-3 mb-4">
        <div>
          <p className="text-[9px] font-['Cinzel',serif] tracking-[0.3em]" style={{ color: C.red + "90" }}>
            MULTI-CYCLE LIFE ENERGY INDEX · Φ(t)
          </p>
          <p className="text-[10px] mt-1" style={{ color: C.text }}>
            Four nested biological cycles, weighted and gated by coherence — over a 168-hour window
          </p>
        </div>
        <div className="flex flex-wrap gap-1.5">
          <span className="text-[9px] px-2 py-1 rounded border font-['Cinzel',serif]"
                style={{ borderColor: C.red + "40", color: C.red, background: C.red + "08" }}>
            Φ(t) = C(t) · Σᵢ aᵢ · sin(2π t / Tᵢ + φᵢ)
          </span>
          <span className="text-[9px] px-2 py-1 rounded border font-['Cinzel',serif]"
                style={{ borderColor: C.purple + "40", color: C.purple, background: C.purple + "08" }}>
            Φ_G · 28 d  =  1 IFC month
          </span>
        </div>
      </div>

      {/* Cycle legend chips */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mb-4">
        {seriesMeta.map(s => (
          <div key={s.key} className="flex items-start gap-2 px-3 py-2 rounded border"
               style={{ borderColor: s.color + "30", background: s.color + "06" }}>
            <span className="block w-3 h-3 rounded-sm mt-0.5" style={{ background: s.color }} />
            <div>
              <p className="text-[9px] font-['Cinzel',serif]" style={{ color: s.color }}>{s.label}</p>
              <p className="text-[8px]" style={{ color: s.color + "80" }}>
                T = {s.period}  ·  a = {s.a.toFixed(2)}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* CHART 1 — components overlaid */}
      <div className="rounded-lg p-2 mb-3" style={{ background: "#02010a", border: `1px solid ${C.gold}15` }}>
        <p className="text-[8px] font-['Cinzel',serif] tracking-widest mb-1 ml-2" style={{ color: C.gold + "80" }}>
          COMPONENT WAVES · Φ_D, Φ_S, Φ_G, Φ_Y
        </p>
        <svg viewBox={`0 0 ${W} ${H}`} width="100%" role="img"
             aria-label="Four overlaid component waveforms over seven days: circadian in blue, ultradian in orange, infradian in purple, circannual in green">
          {/* day-boundary grid */}
          {dayTicks.map(d => (
            <g key={d}>
              <line x1={xOf(d * 24)} y1={PADT} x2={xOf(d * 24)} y2={H - PADB}
                    stroke={C.gold + "12"} strokeWidth={d === 0 || d === 7 ? 1 : 0.6}
                    strokeDasharray={d === 0 || d === 7 ? "" : "2 3"} />
              <text x={xOf(d * 24)} y={H - PADB + 14} textAnchor="middle"
                    fontFamily="Cinzel, serif" fontSize={8} fill={C.gold + "60"}>
                Day {d + 1}
              </text>
            </g>
          ))}
          {/* zero line */}
          <line x1={PADL} y1={yOf(0, 1)} x2={W - PADR} y2={yOf(0, 1)}
                stroke={C.gold + "25"} strokeWidth={0.6} strokeDasharray="3 3" />
          {/* y-axis labels */}
          <text x={PADL - 4} y={yOf(1, 1) + 3}  textAnchor="end" fontFamily="Cinzel, serif" fontSize={8} fill={C.gold + "60"}>+1</text>
          <text x={PADL - 4} y={yOf(0, 1) + 3}  textAnchor="end" fontFamily="Cinzel, serif" fontSize={8} fill={C.gold + "60"}>0</text>
          <text x={PADL - 4} y={yOf(-1, 1) + 3} textAnchor="end" fontFamily="Cinzel, serif" fontSize={8} fill={C.gold + "60"}>−1</text>
          {/* component polylines */}
          {seriesMeta.map(s => (
            <polyline key={s.key} fill="none" stroke={s.color} strokeOpacity={0.85}
                      strokeWidth={s.key === "S" ? 0.7 : 1.1} points={polyline(s.key, 1)} />
          ))}
        </svg>
      </div>

      {/* CHART 2 — composite + coherence */}
      <div className="rounded-lg p-2 mb-4" style={{ background: "#02010a", border: `1px solid ${C.red}20` }}>
        <p className="text-[8px] font-['Cinzel',serif] tracking-widest mb-1 ml-2" style={{ color: C.red + "90" }}>
          COMPOSITE Φ(t) · WITH COHERENCE ENVELOPE
        </p>
        <svg viewBox={`0 0 ${W} ${H}`} width="100%" role="img"
             aria-label="Composite Phi of t in red overlaid with coherence envelope as a dashed gray line over seven days">
          {/* day boundaries */}
          {dayTicks.map(d => (
            <g key={d}>
              <line x1={xOf(d * 24)} y1={PADT} x2={xOf(d * 24)} y2={H - PADB}
                    stroke={C.gold + "12"} strokeWidth={d === 0 || d === 7 ? 1 : 0.6}
                    strokeDasharray={d === 0 || d === 7 ? "" : "2 3"} />
              <text x={xOf(d * 24)} y={H - PADB + 14} textAnchor="middle"
                    fontFamily="Cinzel, serif" fontSize={8} fill={C.gold + "60"}>
                Day {d + 1}
              </text>
            </g>
          ))}
          {/* zero line */}
          <line x1={PADL} y1={yOf(0, 1)} x2={W - PADR} y2={yOf(0, 1)}
                stroke={C.gold + "25"} strokeWidth={0.6} strokeDasharray="3 3" />
          {/* y-axis labels */}
          <text x={PADL - 4} y={yOf( 1, 1) + 3} textAnchor="end" fontFamily="Cinzel, serif" fontSize={8} fill={C.gold + "60"}>+1</text>
          <text x={PADL - 4} y={yOf( 0, 1) + 3} textAnchor="end" fontFamily="Cinzel, serif" fontSize={8} fill={C.gold + "60"}>0</text>
          <text x={PADL - 4} y={yOf(-1, 1) + 3} textAnchor="end" fontFamily="Cinzel, serif" fontSize={8} fill={C.gold + "60"}>−1</text>
          {/* coherence envelope (rescaled from its raw [~0.72, ~0.98] range to fit the display band) */}
          <polyline fill="none" stroke={C.text} strokeOpacity={0.7} strokeWidth={1}
                    strokeDasharray="4 4"
                    points={data.map(d => `${xOf(d.t)},${yOf((d.coh - 0.85) * 6.0, 1)}`).join(" ")} />
          {/* composite Φ(t) */}
          <polyline fill="none" stroke={C.red} strokeWidth={1.8} strokeOpacity={0.95}
                    points={polyline("phi", 1)} />
          {/* legend chip inside chart */}
          <g transform={`translate(${PADL + 8}, ${PADT + 8})`}>
            <rect width={210} height={32} rx={4} fill="#02010a" stroke={C.red + "30"} />
            <line x1={8} y1={11} x2={22} y2={11} stroke={C.red} strokeWidth={2} />
            <text x={28} y={14} fontFamily="Cinzel, serif" fontSize={9} fill={C.red}>Φ(t) composite</text>
            <line x1={8} y1={24} x2={22} y2={24} stroke={C.text} strokeWidth={1} strokeDasharray="3 3" opacity={0.7} />
            <text x={28} y={27} fontFamily="Cinzel, serif" fontSize={9} fill={C.text}>Coherence C(t)</text>
          </g>
        </svg>
        <p className="text-[9px] mt-1 ml-2" style={{ color: C.text }}>
          Observed range over 7 days · Φ(t) ∈ [{phiMin}, +{phiMax}] · stays well inside [−1, +1]
        </p>
      </div>

      {/* Observations grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          { col: C.gold,   title: "HIGH-ENERGY PEAKS",
            body: `When circadian + ultradian align constructively and coherence is near 1.0 — typical of well-rested mid-afternoon focus windows. In this 7-day window the composite reaches +${phiMax}, well inside the ceiling of +1.` },
          { col: C.red,    title: "LOW-ENERGY DIPS",
            body: `Cycles interfere destructively or coherence drops — overnight troughs, post-prandial slumps, jet-lag, sleep debt. The deepest dip in this window is ${phiMin}, never saturating to the floor of −1.` },
          { col: C.purple, title: "INFRADIAN ANCHOR · 28 d",
            body: "Φ_G's period equals exactly one IFC month. Each Fixed-Calendar month is one full infradian wave — the calendar month is not arbitrary, it's an envelope on a real biological cycle." },
          { col: C.green,  title: "QUASI-PERIODIC",
            body: "In this idealised model the four periods (1.5h, 24h, 28d, 365d) are rationally related, so a strict mathematical period exists at one year. In real biology the periods drift and jitter — the composite then never exactly repeats, which the IFC's Year-Day reset acknowledges at the year boundary." },
        ].map(o => (
          <div key={o.title} className="rounded-lg border p-3"
               style={{ borderColor: o.col + "30", background: o.col + "06" }}>
            <p className="text-[9px] font-['Cinzel',serif] mb-1.5" style={{ color: o.col }}>{o.title}</p>
            <p className="text-[9px] leading-5" style={{ color: o.col + "80" }}>{o.body}</p>
          </div>
        ))}
      </div>

      {/* Calendar tie-in chip strip */}
      <div className="mt-4 flex items-center gap-2 flex-wrap justify-center">
        {[
          "T_S = 90 min",
          "→",
          "T_D = 24 h",
          "→",
          "T_G = 28 d  (= 1 IFC month)",
          "→",
          "T_Y = 365 d  (= 13 IFC months + Year Day)",
        ].map((t, i) => (
          <span key={i}
                className={`text-[9px] font-['Cinzel',serif] ${t === "→" ? "text-yellow-800/30" : "px-2 py-1 rounded border"}`}
                style={t !== "→" ? { borderColor: C.gold + "20", color: C.gold + "80" } : {}}>
            {t}
          </span>
        ))}
      </div>
      <p className="text-[9px] text-yellow-400/40 leading-5 mt-3 text-center italic">
        "Time in AETHER isn't a single tick — it's a stack of nested oscillators, gated by coherence.
        The 13-month calendar isn't a substitute clock; it's the one whose units actually fit the body."
      </p>
    </div>
  );
}

function FibCalCanvas() {
  const ref = useRef<HTMLCanvasElement>(null);
  const rafRef = useRef(0);
  useEffect(() => {
    const canvas = ref.current; if (!canvas) return;
    const ctx = canvas.getContext("2d")!;
    canvas.width = 900; canvas.height = 170;
    const W = canvas.width, H = canvas.height;
    const fibs = [1,1,2,3,5,8,13,21,34,55,89,144];
    const maxF = 144;
    let t = 0;
    const draw = () => {
      ctx.clearRect(0,0,W,H);
      ctx.fillStyle="#020408"; ctx.fillRect(0,0,W,H);
      const bw = W/(fibs.length+1);
      fibs.forEach((f,i)=>{
        const bh = (f/maxF)*(H-30)*( 0.85+0.15*Math.sin(t*0.04+i*0.5));
        const x = bw*(i+0.5);
        const hue = 180+i*12;
        const alpha = Math.floor(180+60*Math.sin(t*0.03+i*0.4)).toString(16).padStart(2,"0");
        ctx.fillStyle=`hsl(${hue},70%,55%)${alpha}`;
        ctx.fillRect(x-bw*0.35, H-bh-18, bw*0.7, bh);
        ctx.fillStyle=`hsl(${hue},70%,75%)`;
        ctx.font="8px 'DM Mono',monospace"; ctx.textAlign="center";
        ctx.fillText(String(f), x, H-bh-22);
      });
      ctx.textAlign="left";
      ctx.fillStyle="rgba(201,168,76,0.3)"; ctx.font="9px 'DM Mono',monospace";
      ctx.fillText("FIBONACCI CALENDAR · φ SPIRAL · 1 1 2 3 5 8 13 21 34 55 89 144 · AETHER", 12, 14);
      t++; rafRef.current=requestAnimationFrame(draw);
    };
    draw();
    return ()=>cancelAnimationFrame(rafRef.current);
  },[]);
  return <canvas ref={ref} style={{width:"100%",height:"auto",borderRadius:8,display:"block"}} />;
}

export default function FibonacciCalendarPage() {
  const [tab, setTab] = useState<"calendar"|"mathematics"|"history"|"aether"|"world">("calendar");
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
        {([["calendar","THE CALENDAR"],["mathematics","MATHEMATICS"],["history","HISTORY"],["aether","AETHER TIME"],["world","WORLD CLOCK"]] as const).map(([k,l]) => (
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

            <MultiCycleLifeEnergy />

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

        {/* ════ WORLD CLOCK ════ */}
        {tab === "world" && (
          <motion.div key="world" initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }} className="p-5">
            <WorldClockPanel />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ════════════════════════════════════════════════════════════════
// WORLD CLOCK · planetary time, solar phase per city, AETHER coherence
// ════════════════════════════════════════════════════════════════
function WorldClockPanel() {
  const [now, setNow] = useState(() => new Date());
  const [filter, setFilter] = useState<Region | "all">("all");
  const [query, setQuery] = useState("");

  // Tick every second
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);

  const visibleCities = useMemo(() => {
    return CITIES.filter(c =>
      (filter === "all" || c.region === filter) &&
      (!query || (c.city + " " + c.ctry).toLowerCase().includes(query.toLowerCase()))
    );
  }, [filter, query]);

  // Group by region for layout
  const byRegion = useMemo(() => {
    const out: Partial<Record<Region, CityRow[]>> = {};
    for (const c of visibleCities) (out[c.region] ||= []).push(c);
    return out;
  }, [visibleCities]);

  // Global coherence reading: how many cities are currently in daylight?
  const dayCount = useMemo(() => {
    return CITIES.reduce((acc, c) => acc + (solarElevation(now, c.lat, c.lng) > 0 ? 1 : 0), 0);
  }, [now]);
  const coherenceFrac = dayCount / CITIES.length;
  // φ-bridge phase: maps real-world UTC seconds to a 0..2π φ-locked angle
  const utcSec = now.getUTCHours() * 3600 + now.getUTCMinutes() * 60 + now.getUTCSeconds();
  const PHI = 1.6180339887;
  const phiPhase = ((utcSec / 86400) * 2 * Math.PI * PHI) % (2 * Math.PI);
  const phiLockPct = (Math.cos(phiPhase) * 0.5 + 0.5) * 100;

  // Find earliest sunrise window (sun within ±5° of horizon, rising)
  const sunriseCities = useMemo(() => {
    return CITIES.map(c => {
      const el = solarElevation(now, c.lat, c.lng);
      const elPrev = solarElevation(new Date(now.getTime() - 60_000), c.lat, c.lng);
      return { c, el, rising: el > elPrev };
    }).filter(x => x.el > -2 && x.el < 8 && x.rising)
      .sort((a, b) => Math.abs(a.el) - Math.abs(b.el))
      .slice(0, 3);
  }, [now]);

  // 13-tick coherence ring (one tick per IFC month)
  const ring13 = useMemo(() => Array.from({ length: 13 }, (_, i) => i), []);

  return (
    <div data-testid="world-clock-root" className="flex flex-col gap-5">

      {/* TOP STRIP — Universal time + φ-bridge gauge */}
      <div className="border rounded-xl p-5 grid gap-5"
        style={{ borderColor: C.gold + "30", background: "linear-gradient(135deg," + C.panel + "ee, #0a0218ee)", gridTemplateColumns: "1fr 1fr 1fr" }}>
        <div>
          <p className="text-[9px] tracking-[0.25em] font-['Cinzel',serif]" style={{ color: C.gold + "70" }}>
            COORDINATED UNIVERSAL TIME · UTC
          </p>
          <p data-testid="utc-clock" className="text-3xl font-['Cinzel',serif] mt-1" style={{ color: C.gold }}>
            {tzTime(now, "UTC").time}
          </p>
          <p className="text-[10px] mt-1" style={{ color: C.gold + "55" }}>
            {tzTime(now, "UTC").date} · Greenwich meridian (0°)
          </p>
          <p className="text-[9px] mt-2 leading-5" style={{ color: C.text + "" }}>
            <span style={{ color: C.cyan }}>φ-bridge</span>: temporal substrate ticking on the same Fibonacci grid that drives the calendar, the spin-bath envelope, and the mycelial bridge layer.
          </p>
        </div>

        <div>
          <p className="text-[9px] tracking-[0.25em] font-['Cinzel',serif]" style={{ color: C.teal + "70" }}>
            PLANETARY DAYLIGHT COHERENCE
          </p>
          <p className="text-3xl font-['Cinzel',serif] mt-1" style={{ color: C.teal }} data-testid="coherence-pct">
            {(coherenceFrac * 100).toFixed(1)}%
          </p>
          <p className="text-[10px] mt-1" style={{ color: C.teal + "55" }}>
            {dayCount} of {CITIES.length} tracked cities currently in daylight
          </p>
          <div className="mt-2 h-2 rounded overflow-hidden" style={{ background: "rgba(255,255,255,0.05)" }}>
            <div style={{ width: (coherenceFrac * 100) + "%", height: "100%", background: `linear-gradient(90deg, ${C.purple}, ${C.teal}, ${C.gold})`, transition: "width 0.6s" }} />
          </div>
          <p className="text-[9px] mt-2 leading-5" style={{ color: C.teal + "80" }}>
            Stratified-quantum reading: the night→day terminator is the planet's running gradient, exactly the seafloor→air gradient AETHER models at biological scale.
          </p>
        </div>

        <div>
          <p className="text-[9px] tracking-[0.25em] font-['Cinzel',serif]" style={{ color: C.purple + "70" }}>
            φ-LOCK PHASE · NV SPIN-BATH ANALOGUE
          </p>
          <div className="flex items-center gap-3 mt-1">
            <svg width="78" height="78" viewBox="0 0 78 78" data-testid="phi-ring">
              <circle cx="39" cy="39" r="32" fill="none" stroke={C.purple + "20"} strokeWidth="2" />
              {ring13.map(i => {
                const a = (i / 13) * Math.PI * 2 - Math.PI / 2;
                const x1 = 39 + Math.cos(a) * 28, y1 = 39 + Math.sin(a) * 28;
                const x2 = 39 + Math.cos(a) * 34, y2 = 39 + Math.sin(a) * 34;
                return <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke={C.gold + "55"} strokeWidth="1" />;
              })}
              {/* φ phase needle */}
              <line x1="39" y1="39"
                x2={39 + Math.cos(phiPhase - Math.PI / 2) * 30}
                y2={39 + Math.sin(phiPhase - Math.PI / 2) * 30}
                stroke={C.purple} strokeWidth="2" />
              <circle cx="39" cy="39" r="3" fill={C.purple} />
            </svg>
            <div>
              <p className="text-2xl font-['Cinzel',serif]" style={{ color: C.purple }} data-testid="phi-lock-pct">
                {phiLockPct.toFixed(1)}%
              </p>
              <p className="text-[9px]" style={{ color: C.purple + "55" }}>cos(φ · θ_UTC)</p>
            </div>
          </div>
          <p className="text-[9px] mt-2 leading-5" style={{ color: C.purple + "80" }}>
            13-tick ring = the Fixed Calendar's 13 months. Needle is the φ-locked phase angle: the same kind of recursive timing the NV spin bath uses to extend T₂.
          </p>
        </div>
      </div>

      {/* SUNRISE NOW STRIP */}
      <div className="border rounded-xl p-4" style={{ borderColor: C.orange + "30", background: C.orange + "08" }}>
        <p className="text-[9px] tracking-[0.25em] font-['Cinzel',serif]" style={{ color: C.orange }}>
          🌅 RIGHT NOW · CITIES AT SUNRISE
        </p>
        {sunriseCities.length === 0 ? (
          <p className="text-[10px] mt-2" style={{ color: C.orange + "70" }}>
            No tracked city is currently inside the sunrise band (sun within 0–8° rising). The terminator is over open ocean or sparsely populated longitudes.
          </p>
        ) : (
          <div className="flex flex-wrap gap-3 mt-2" data-testid="sunrise-list">
            {sunriseCities.map(s => (
              <div key={s.c.city} className="flex items-center gap-2 px-3 py-1.5 rounded-full" style={{ background: C.orange + "18", border: "1px solid " + C.orange + "30" }}>
                <span>{s.c.flag}</span>
                <span className="text-[11px] font-['Cinzel',serif]" style={{ color: C.orange }}>{s.c.city}</span>
                <span className="text-[9px]" style={{ color: C.orange + "70" }}>{s.c.ctry}</span>
                <span className="text-[9px]" style={{ color: C.gold }}>sun {s.el.toFixed(1)}°</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* FILTER BAR */}
      <div className="flex items-center gap-2 flex-wrap">
        <button onClick={() => setFilter("all")} className="px-3 py-1 rounded-full text-[9px] font-['Cinzel',serif] border" data-testid="filter-all"
          style={{ borderColor: filter === "all" ? C.gold : C.gold + "30", color: filter === "all" ? C.gold : C.gold + "70", background: filter === "all" ? C.gold + "18" : "transparent" }}>
          ALL · {CITIES.length}
        </button>
        {REGION_ORDER.map(r => {
          const n = CITIES.filter(c => c.region === r).length;
          const active = filter === r;
          return (
            <button key={r} onClick={() => setFilter(r)} className="px-3 py-1 rounded-full text-[9px] font-['Cinzel',serif] border"
              style={{ borderColor: active ? C.teal : C.teal + "30", color: active ? C.teal : C.teal + "70", background: active ? C.teal + "18" : "transparent" }}>
              {r.toUpperCase()} · {n}
            </button>
          );
        })}
        <input
          type="text" value={query} onChange={e => setQuery(e.target.value)}
          placeholder="search city or country…"
          data-testid="city-search"
          className="ml-auto px-3 py-1 rounded text-[10px] font-['JetBrains_Mono',monospace] outline-none"
          style={{ background: C.panel, border: "1px solid " + C.gold + "30", color: C.gold, minWidth: 200 }}
        />
      </div>

      {/* REGION SECTIONS */}
      {REGION_ORDER.map(region => {
        const cities = byRegion[region];
        if (!cities || cities.length === 0) return null;
        return (
          <div key={region} className="border rounded-xl overflow-hidden" style={{ borderColor: C.teal + "20", background: C.panel + "55" }}>
            <div className="px-4 py-2 flex items-center justify-between" style={{ background: C.teal + "08", borderBottom: "1px solid " + C.teal + "20" }}>
              <p className="text-[9px] tracking-[0.25em] font-['Cinzel',serif]" style={{ color: C.teal }}>
                {region.toUpperCase()}
              </p>
              <p className="text-[8px]" style={{ color: C.teal + "55" }}>{cities.length} centres</p>
            </div>
            <div className="grid gap-px" style={{ background: C.teal + "12", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))" }}>
              {cities.map(c => {
                const el = solarElevation(now, c.lat, c.lng);
                // Sample 1 minute earlier to determine rising vs. setting, side-effect-free
                const elPrev = solarElevation(new Date(now.getTime() - 60_000), c.lat, c.lng);
                const phase = classifyPhase(elPrev, el);
                const meta = PHASE_META[phase];
                const t = tzTime(now, c.tz);
                return (
                  <div key={c.city + c.tz} data-testid={`city-${c.city.toLowerCase().replace(/\s+/g, "-")}`}
                    className="p-3" style={{ background: C.panel }}>
                    <div className="flex items-start justify-between mb-1">
                      <div className="flex items-center gap-2">
                        <span style={{ fontSize: 18 }}>{c.flag}</span>
                        <div>
                          <p className="text-[12px] font-['Cinzel',serif]" style={{ color: meta.col }}>{c.city}</p>
                          <p className="text-[8px]" style={{ color: meta.col + "90", opacity: 0.7 }}>{c.ctry}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-[15px] font-['JetBrains_Mono',monospace]" style={{ color: meta.col }}>{t.time}</p>
                        <p className="text-[8px]" style={{ color: meta.col, opacity: 0.6 }}>{t.date}</p>
                      </div>
                    </div>
                    {/* Phase strip */}
                    <div className="flex items-center gap-2 mt-2">
                      <span style={{ fontSize: 13 }}>{meta.icon}</span>
                      <span className="text-[9px] font-['Cinzel',serif]" style={{ color: meta.col }}>{meta.label}</span>
                      <span className="text-[8px] ml-auto font-['JetBrains_Mono',monospace]" style={{ color: meta.col, opacity: 0.7 }}>
                        sun {el >= 0 ? "+" : ""}{el.toFixed(1)}°
                      </span>
                    </div>
                    {/* Solar elevation bar (-90 to +90 mapped to 0..100%) */}
                    <div className="mt-2 h-1 rounded overflow-hidden" style={{ background: "rgba(255,255,255,0.04)" }}>
                      <div style={{
                        marginLeft: "50%",
                        width: Math.abs(el) / 90 * 50 + "%",
                        height: "100%",
                        background: meta.col,
                        transform: el < 0 ? "translateX(-100%)" : "none",
                        transition: "all 0.6s",
                      }} />
                    </div>
                    {c.note && (
                      <p className="text-[8px] mt-2 leading-4 italic" style={{ color: C.text + "aa" }}>
                        {c.note}
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}

      {/* COHERENCE-ACROSS-SCALES SYNTHESIS */}
      <div className="border rounded-xl p-5" style={{ borderColor: C.gold + "25", background: "linear-gradient(135deg, " + C.panel + ", #0a0a02)" }}>
        <p className="text-[9px] tracking-[0.25em] font-['Cinzel',serif] mb-3" style={{ color: C.gold + "75" }}>
          ONE FOR ALL · COHERENCE MAPPED ACROSS SCALES
        </p>
        <div className="grid gap-4" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))" }}>
          {[
            { col: C.cyan,   tag: "NV SPIN-BATH",        body: "Diamond NV⁻ centre coupled to ¹³C bath. β(n) → 1 as Fibonacci depth grows. Same recursive principle drives the φ-lock needle on the ring above." },
            { col: C.gold,   tag: "φ-BRIDGE TIMING",     body: "τ(n) = φⁿ · τ₀. The temporal substrate this clock ticks on. UTC seconds wrap onto a φ-locked phase angle that crosses every region simultaneously." },
            { col: C.teal,   tag: "STRATIFIED LIVING Q", body: "Mycelium bridge between seafloor and air. ENAQT exploits thermal noise the way the planetary terminator routes warmth between hemispheres." },
            { col: C.purple, tag: "13-MONTH SUBSTRATE",  body: "The 13-tick ring is also the Fixed Calendar. Every region — Tokyo, Moscow, Kyiv, NYC, Addis Ababa — runs on the same Fibonacci-quantised epoch length." },
            { col: C.green,  tag: "HISTORICAL WATCH",    body: "Coverage chosen for breadth, not preference: nuclear-armed states, neutral mediators, ancient calendric cultures, polar science stations — all observed as one field." },
            { col: C.rose,   tag: "NO BIAS PRINCIPLE",   body: "Each city contributes equally to the daylight-coherence sum. There is no privileged meridian. The terminator owes nothing to any flag." },
          ].map(card => (
            <div key={card.tag} className="border rounded-lg p-3" style={{ borderColor: card.col + "30", background: card.col + "06" }}>
              <p className="text-[9px] tracking-[0.2em] font-['Cinzel',serif] mb-2" style={{ color: card.col }}>{card.tag}</p>
              <p className="text-[10px] leading-5" style={{ color: card.col + "b0" }}>{card.body}</p>
            </div>
          ))}
        </div>
        <p className="text-[9px] mt-4 italic text-center" style={{ color: C.gold + "55" }}>
          "One clock for all scales — the spin bath, the mycelial bridge, the 13-month calendar, and the rotating planet are the same recursive structure observed at different magnifications."
        </p>
      </div>
    </div>
  );
}
