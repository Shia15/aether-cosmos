import React, { useEffect, useMemo, useRef, useState } from "react";

/* ============================================================================
   AETHER SKY DIAL - A Modern Digital Antikythera Mechanism
   Real geocentric ecliptic longitudes from low-precision Keplerian elements
   (Standish / JPL, valid ~1800-2050), an orrery-style zodiac dial, and the
   four resonance droplets (MNESIS / ALETHEIA / INFERAIA / REVERIE).
   Motion follows the AETHER Ringdown doctrine: damped settling, no bounce.
   ========================================================================== */

const RAD = Math.PI / 180;
const DEG = 180 / Math.PI;
const norm360 = (x: number) => ((x % 360) + 360) % 360;
// circular (shortest-arc) angular separation in degrees, 0..180
const angSep = (a: number, b: number) => {
  const d = Math.abs(norm360(a) - norm360(b));
  return d > 180 ? 360 - d : d;
};

type Elem = {
  a: number; e: number; I: number; L: number; peri: number; node: number;
  aR: number; eR: number; IR: number; LR: number; periR: number; nodeR: number;
};

// a[AU], e, I[deg], L[deg], longPeri[deg], longNode[deg] + per-century rates
const ELEMENTS: Record<string, Elem> = {
  Mercury: { a: 0.38709927, e: 0.20563593, I: 7.00497902, L: 252.25032350, peri: 77.45779628, node: 48.33076593, aR: 0.00000037, eR: 0.00001906, IR: -0.00594749, LR: 149472.67411175, periR: 0.16047689, nodeR: -0.12534081 },
  Venus:   { a: 0.72333566, e: 0.00677672, I: 3.39467605, L: 181.97909950, peri: 131.60246718, node: 76.67984255, aR: 0.00000390, eR: -0.00004107, IR: -0.00078890, LR: 58517.81538729, periR: 0.00268329, nodeR: -0.27769418 },
  Earth:   { a: 1.00000261, e: 0.01671123, I: -0.00001531, L: 100.46457166, peri: 102.93768193, node: 0.0, aR: 0.00000562, eR: -0.00004392, IR: -0.01294668, LR: 35999.37244981, periR: 0.32327364, nodeR: 0.0 },
  Mars:    { a: 1.52371034, e: 0.09339410, I: 1.84969142, L: -4.55343205, peri: -23.94362959, node: 49.55953891, aR: 0.00001847, eR: 0.00007882, IR: -0.00813131, LR: 19140.30268499, periR: 0.44441088, nodeR: -0.29257343 },
  Jupiter: { a: 5.20288700, e: 0.04838624, I: 1.30439695, L: 34.39644051, peri: 14.72847983, node: 100.47390909, aR: -0.00011607, eR: -0.00013253, IR: -0.00183714, LR: 3034.74612775, periR: 0.21252668, nodeR: 0.20469106 },
  Saturn:  { a: 9.53667594, e: 0.05386179, I: 2.48599187, L: 49.95424423, peri: 92.59887831, node: 113.66242448, aR: -0.00125060, eR: -0.00050991, IR: 0.00193609, LR: 1222.49362201, periR: -0.41897216, nodeR: -0.28867794 },
};

const julianDay = (d: Date) => d.getTime() / 86400000 + 2440587.5;

function solveKepler(M: number, e: number): number {
  let E = M;
  for (let i = 0; i < 8; i++) E = E - (E - e * Math.sin(E) - M) / (1 - e * Math.cos(E));
  return E;
}

// heliocentric ecliptic rectangular coords (AU)
function helio(el: Elem, T: number): [number, number, number] {
  const a = el.a + el.aR * T;
  const e = el.e + el.eR * T;
  const I = (el.I + el.IR * T) * RAD;
  const L = el.L + el.LR * T;
  const periDeg = el.peri + el.periR * T;
  const nodeDeg = el.node + el.nodeR * T;
  const w = (periDeg - nodeDeg) * RAD;
  const node = nodeDeg * RAD;
  let M = norm360(L - periDeg);
  if (M > 180) M -= 360;
  const E = solveKepler(M * RAD, e);
  const xp = a * (Math.cos(E) - e);
  const yp = a * Math.sqrt(1 - e * e) * Math.sin(E);
  const cw = Math.cos(w), sw = Math.sin(w);
  const cn = Math.cos(node), sn = Math.sin(node);
  const ci = Math.cos(I), si = Math.sin(I);
  const x = (cw * cn - sw * sn * ci) * xp + (-sw * cn - cw * sn * ci) * yp;
  const y = (cw * sn + sw * cn * ci) * xp + (-sw * sn + cw * cn * ci) * yp;
  const z = si * sw * xp + si * cw * yp;
  return [x, y, z];
}

function moonLongitude(jd: number): number {
  const d = jd - 2451545.0;
  const L = 218.316 + 13.176396 * d;
  const M = (134.963 + 13.064993 * d) * RAD;
  const F = (93.272 + 13.229350 * d) * RAD;
  const Mp = (357.529 + 0.98560028 * d) * RAD;
  const lon = L + 6.289 * Math.sin(M) - 1.274 * Math.sin(M - 2 * F) + 0.658 * Math.sin(2 * F) - 0.186 * Math.sin(Mp);
  return norm360(lon);
}

function moonAltSimple(lonEcl: number, jd: number, lat: number, lon: number) {
  return altAz(lonEcl, 0, jd, lat, lon);
}

// ecliptic lon/lat (deg) -> alt/az (deg) for observer
function altAz(lonEcl: number, latEcl: number, jd: number, lat: number, lon: number) {
  const eps = 23.4393 * RAD;
  const l = lonEcl * RAD, b = latEcl * RAD;
  const ra = Math.atan2(Math.sin(l) * Math.cos(eps) - Math.tan(b) * Math.sin(eps), Math.cos(l));
  const dec = Math.asin(Math.sin(b) * Math.cos(eps) + Math.cos(b) * Math.sin(eps) * Math.sin(l));
  const d = jd - 2451545.0;
  const gmst = norm360(280.46061837 + 360.98564736629 * d);
  const lst = (gmst + lon) * RAD;
  const H = lst - ra;
  const latR = lat * RAD;
  const alt = Math.asin(Math.sin(latR) * Math.sin(dec) + Math.cos(latR) * Math.cos(dec) * Math.cos(H));
  let az = Math.atan2(Math.sin(H), Math.cos(H) * Math.sin(latR) - Math.tan(dec) * Math.cos(latR));
  az = norm360(az * DEG + 180);
  return { alt: alt * DEG, az };
}

type Body = {
  name: string; sym: string; color: string; ring: number;
  lon: number; alt: number; az: number; sign: string;
};

const ZODIAC = [
  { name: "Aries", sym: "\u2648" }, { name: "Taurus", sym: "\u2649" },
  { name: "Gemini", sym: "\u264A" }, { name: "Cancer", sym: "\u264B" },
  { name: "Leo", sym: "\u264C" }, { name: "Virgo", sym: "\u264D" },
  { name: "Libra", sym: "\u264E" }, { name: "Scorpio", sym: "\u264F" },
  { name: "Sagittarius", sym: "\u2650" }, { name: "Capricorn", sym: "\u2651" },
  { name: "Aquarius", sym: "\u2652" }, { name: "Pisces", sym: "\u2653" },
];

const signOf = (lon: number) => ZODIAC[Math.floor(norm360(lon) / 30) % 12].name;

// ring index 1..7 inner->outer (Antikythera orrery order)
const PLANET_DEFS = [
  { name: "Moon", sym: "\u263D", color: "#d8d8e8", ring: 1 },
  { name: "Mercury", sym: "\u263F", color: "#7fe7ff", ring: 2 },
  { name: "Venus", sym: "\u2640", color: "#ff9ed8", ring: 3 },
  { name: "Sun", sym: "\u2609", color: "#ffd24a", ring: 4 },
  { name: "Mars", sym: "\u2642", color: "#ff6a5a", ring: 5 },
  { name: "Jupiter", sym: "\u2643", color: "#ffb86b", ring: 6 },
  { name: "Saturn", sym: "\u2644", color: "#ffe98a", ring: 7 },
];

function computeBodies(date: Date, lat: number, lon: number): Body[] {
  const jd = julianDay(date);
  const T = (jd - 2451545.0) / 36525;
  const earth = helio(ELEMENTS.Earth, T);

  const geoLon = (name: string): number => {
    if (name === "Sun") return norm360(Math.atan2(-earth[1], -earth[0]) * DEG);
    if (name === "Moon") return moonLongitude(jd);
    const p = helio(ELEMENTS[name], T);
    return norm360(Math.atan2(p[1] - earth[1], p[0] - earth[0]) * DEG);
  };

  return PLANET_DEFS.map((d) => {
    const lonEcl = geoLon(d.name);
    const aa = d.name === "Moon" ? moonAltSimple(lonEcl, jd, lat, lon) : altAz(lonEcl, 0, jd, lat, lon);
    return { name: d.name, sym: d.sym, color: d.color, ring: d.ring, lon: lonEcl, alt: aa.alt, az: aa.az, sign: signOf(lonEcl) };
  });
}

/* ---- resonance engine (from the AETHER metaphysical spec) --------------- */
function resonance(bodies: Body[]) {
  const get = (n: string) => bodies.find((b) => b.name === n)!;
  const moon = get("Moon"), sun = get("Sun"), merc = get("Mercury"), mars = get("Mars"), venus = get("Venus");
  const mnesis = moon.alt > 0 ? Math.max(50, (moon.alt / 90) * 100) : 50;
  const aletheia = Math.max(0, 100 - angSep(sun.az, merc.az) / 1.8);
  const inferaia = mars.alt > 0 ? Math.max(20, (mars.alt / 90) * 100) : 20;
  const reverie = Math.max(0, 100 - Math.abs(venus.alt - moon.alt) * 3);
  const flow = (mnesis + aletheia + inferaia + reverie) / 4;
  return { mnesis, aletheia, inferaia, reverie, flow, core: 78 };
}

/* ============================ THE DIAL CANVAS ============================= */
function SkyDialCanvas({ bodies }: { bodies: Body[] }) {
  const ref = useRef<HTMLCanvasElement>(null);
  const bodiesRef = useRef(bodies);
  bodiesRef.current = bodies;
  // damped display positions (deg), keyed by name
  const dispRef = useRef<Record<string, number>>({});
  const rafRef = useRef(0);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d")!;
    const reduce = typeof window !== "undefined" && window.matchMedia
      ? window.matchMedia("(prefers-reduced-motion: reduce)").matches : false;
    const DPR = Math.min(window.devicePixelRatio || 1, 2);
    let W = 0, H = 0, R = 0, cx = 0, cy = 0;

    const fit = () => {
      const w = canvas.clientWidth || 640;
      W = w; H = w; R = (w / 2) * 0.92; cx = w / 2; cy = w / 2;
      canvas.width = Math.round(w * DPR);
      canvas.height = Math.round(w * DPR);
      ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
    };
    fit();
    const ro = new ResizeObserver(fit);
    ro.observe(canvas);

    let t = 0;
    // angle of an ecliptic longitude on the dial: 0deg Aries at top (12 o'clock), counter-clockwise
    const angOf = (lon: number) => (-90 - lon) * RAD;

    const draw = () => {
      t += 0.016;
      ctx.clearRect(0, 0, W, H);

      // deep void radial background
      const bg = ctx.createRadialGradient(cx, cy, 0, cx, cy, R * 1.15);
      bg.addColorStop(0, "#1a0033");
      bg.addColorStop(0.55, "#0d0022");
      bg.addColorStop(1, "#04000f");
      ctx.fillStyle = bg;
      ctx.beginPath(); ctx.arc(cx, cy, R * 1.12, 0, Math.PI * 2); ctx.fill();

      // faint starfield (deterministic)
      ctx.save();
      for (let i = 0; i < 90; i++) {
        const a = i * 2.399963;
        const rr = R * (0.2 + 0.78 * ((i * 97) % 100) / 100);
        const sx = cx + Math.cos(a) * rr, sy = cy + Math.sin(a) * rr;
        const tw = reduce ? 0.5 : 0.35 + 0.35 * Math.sin(t * 1.3 + i);
        ctx.globalAlpha = 0.12 + 0.25 * tw;
        ctx.fillStyle = "#cdb8ff";
        ctx.fillRect(sx, sy, 1.3, 1.3);
      }
      ctx.restore();

      // zodiac ring band
      ctx.lineWidth = 1;
      const zOuter = R, zInner = R * 0.86;
      ctx.beginPath(); ctx.arc(cx, cy, zOuter, 0, Math.PI * 2);
      ctx.strokeStyle = "rgba(167,139,250,0.55)"; ctx.stroke();
      ctx.beginPath(); ctx.arc(cx, cy, zInner, 0, Math.PI * 2);
      ctx.strokeStyle = "rgba(167,139,250,0.28)"; ctx.stroke();

      // 12 zodiac sectors + glyphs
      for (let i = 0; i < 12; i++) {
        const lonStart = i * 30;
        const a0 = angOf(lonStart);
        ctx.beginPath();
        ctx.moveTo(cx + Math.cos(a0) * zInner, cy + Math.sin(a0) * zInner);
        ctx.lineTo(cx + Math.cos(a0) * zOuter, cy + Math.sin(a0) * zOuter);
        ctx.strokeStyle = "rgba(167,139,250,0.22)"; ctx.lineWidth = 1; ctx.stroke();
        const aMid = angOf(lonStart + 15);
        const gr = (zOuter + zInner) / 2;
        ctx.fillStyle = "rgba(226,214,255,0.85)";
        ctx.font = `${Math.round(R * 0.05)}px 'DM Mono', monospace`;
        ctx.textAlign = "center"; ctx.textBaseline = "middle";
        ctx.fillText(ZODIAC[i].sym, cx + Math.cos(aMid) * gr, cy + Math.sin(aMid) * gr);
      }

      // vernal point marker (0 Aries) - gold tick
      const av = angOf(0);
      ctx.beginPath();
      ctx.moveTo(cx + Math.cos(av) * (zInner - 6), cy + Math.sin(av) * (zInner - 6));
      ctx.lineTo(cx + Math.cos(av) * (zOuter + 6), cy + Math.sin(av) * (zOuter + 6));
      ctx.strokeStyle = "#ffd24a"; ctx.lineWidth = 2; ctx.stroke();

      // concentric planet rings
      const ringR = (ring: number) => zInner * (0.16 + 0.115 * ring);
      for (let r = 1; r <= 7; r++) {
        ctx.beginPath(); ctx.arc(cx, cy, ringR(r), 0, Math.PI * 2);
        ctx.strokeStyle = "rgba(140,110,210,0.16)"; ctx.lineWidth = 1; ctx.stroke();
      }

      // central resonance core orb
      const corePulse = reduce ? 0.6 : 0.5 + 0.5 * Math.sin(t * 1.1);
      const coreR = ringR(1) * 0.52;
      const cg = ctx.createRadialGradient(cx, cy, 0, cx, cy, coreR * 2.4);
      cg.addColorStop(0, "rgba(255,210,120,0.95)");
      cg.addColorStop(0.4, `rgba(233,30,99,${0.45 + 0.25 * corePulse})`);
      cg.addColorStop(1, "rgba(167,139,250,0)");
      ctx.beginPath(); ctx.arc(cx, cy, coreR * 2.4, 0, Math.PI * 2);
      ctx.fillStyle = cg; ctx.fill();
      ctx.beginPath(); ctx.arc(cx, cy, coreR, 0, Math.PI * 2);
      ctx.fillStyle = "#fff6e6"; ctx.fill();

      // planets (damped toward true longitude)
      const disp = dispRef.current;
      for (const b of bodiesRef.current) {
        if (!Number.isFinite(b.lon) || !Number.isFinite(b.alt)) continue;
        if (disp[b.name] === undefined) disp[b.name] = b.lon;
        // shortest-arc damped settle (Ringdown: no overshoot)
        let delta = b.lon - disp[b.name];
        delta = ((delta + 180) % 360 + 360) % 360 - 180;
        disp[b.name] = norm360(disp[b.name] + delta * (reduce ? 1 : 0.08));
        const a = angOf(disp[b.name]);
        const rr = ringR(b.ring);
        const px = cx + Math.cos(a) * rr, py = cy + Math.sin(a) * rr;
        const up = b.alt > 0;

        // spoke from core
        ctx.beginPath(); ctx.moveTo(cx, cy); ctx.lineTo(px, py);
        ctx.strokeStyle = up ? `${b.color}33` : "rgba(120,100,160,0.12)";
        ctx.lineWidth = 1; ctx.stroke();

        const mR = R * (b.name === "Sun" ? 0.045 : b.name === "Moon" ? 0.038 : 0.03);
        if (up) {
          const glow = ctx.createRadialGradient(px, py, 0, px, py, mR * 3.4);
          glow.addColorStop(0, b.color);
          glow.addColorStop(1, "transparent");
          ctx.globalAlpha = 0.55 + 0.25 * corePulse;
          ctx.beginPath(); ctx.arc(px, py, mR * 3.4, 0, Math.PI * 2);
          ctx.fillStyle = glow; ctx.fill();
          ctx.globalAlpha = 1;
          ctx.beginPath(); ctx.arc(px, py, mR, 0, Math.PI * 2);
          ctx.fillStyle = b.color; ctx.fill();
          ctx.lineWidth = 1; ctx.strokeStyle = "rgba(255,255,255,0.8)"; ctx.stroke();
        } else {
          ctx.beginPath(); ctx.arc(px, py, mR * 0.8, 0, Math.PI * 2);
          ctx.fillStyle = "rgba(20,12,40,0.7)";
          ctx.fill();
          ctx.lineWidth = 1; ctx.strokeStyle = `${b.color}66`; ctx.stroke();
        }
        // glyph label outside marker
        ctx.fillStyle = up ? "rgba(255,255,255,0.92)" : `${b.color}88`;
        ctx.font = `${Math.round(R * 0.04)}px 'DM Mono', monospace`;
        ctx.textAlign = "center"; ctx.textBaseline = "middle";
        const lr = rr + mR + R * 0.035;
        ctx.fillText(b.sym, cx + Math.cos(a) * lr, cy + Math.sin(a) * lr);
      }

      rafRef.current = requestAnimationFrame(draw);
    };
    draw();
    return () => { cancelAnimationFrame(rafRef.current); ro.disconnect(); };
  }, []);

  return <canvas ref={ref} style={{ width: "100%", aspectRatio: "1 / 1", display: "block", borderRadius: 14 }} />;
}

/* ============================ DAMPED METER BAR =========================== */
function DropletBar({ label, sub, value, color }: { label: string; sub: string; value: number; color: string }) {
  const [disp, setDisp] = useState(value);
  const target = useRef(value);
  target.current = value;
  useEffect(() => {
    let raf = 0;
    const tick = () => {
      setDisp((d) => {
        const nd = d + (target.current - d) * 0.08; // Ringdown settle
        return Math.abs(nd - target.current) < 0.05 ? target.current : nd;
      });
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, []);
  return (
    <div style={{ marginBottom: 16 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 6 }}>
        <span style={{ fontFamily: "'DM Mono', monospace", fontSize: 13, color: "#fff", letterSpacing: "0.12em" }}>
          {label} <span style={{ color: "rgba(226,214,255,0.5)", fontSize: 11 }}>{sub}</span>
        </span>
        <span style={{ fontFamily: "'DM Mono', monospace", fontSize: 13, color }}>{disp.toFixed(1)}%</span>
      </div>
      <div style={{ height: 8, borderRadius: 6, background: "rgba(167,139,250,0.12)", overflow: "hidden" }}>
        <div style={{
          height: "100%", width: `${disp}%`, borderRadius: 6,
          background: `linear-gradient(90deg, ${color}88, ${color})`,
          boxShadow: `0 0 12px ${color}88`,
          transition: "none",
        }} />
      </div>
    </div>
  );
}

/* =============================== THE PAGE ================================= */
const PANEL: React.CSSProperties = {
  background: "rgba(10,0,31,0.72)",
  border: "1px solid rgba(167,139,250,0.22)",
  borderRadius: 16,
  padding: "1.4rem 1.5rem",
  backdropFilter: "blur(6px)",
};
const KICKER: React.CSSProperties = {
  fontFamily: "'DM Mono', monospace", fontSize: 10, letterSpacing: "0.32em",
  color: "#c4b5fd", textTransform: "uppercase",
};
const INPUT: React.CSSProperties = {
  width: "100%", background: "rgba(167,139,250,0.08)",
  border: "1px solid rgba(167,139,250,0.28)", borderRadius: 8,
  color: "#fff", padding: "8px 10px", fontFamily: "'DM Mono', monospace", fontSize: 13,
};
const LABEL: React.CSSProperties = {
  display: "block", fontFamily: "'DM Mono', monospace", fontSize: 10,
  letterSpacing: "0.2em", color: "rgba(226,214,255,0.6)", marginBottom: 6, textTransform: "uppercase",
};

function toLocalInput(d: Date) {
  const p = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}T${p(d.getHours())}:${p(d.getMinutes())}`;
}

export default function SkyDialPage() {
  const [whenStr, setWhenStr] = useState(() => toLocalInput(new Date()));
  const [lat, setLat] = useState(37.98); // Athens - the Antikythera homeland
  const [lon, setLon] = useState(23.73);
  const [scrub, setScrub] = useState(0); // hours offset (cosmic crank)

  const lastValid = useRef(new Date());
  const when = useMemo(() => {
    const base = new Date(whenStr);
    if (isNaN(base.getTime())) return new Date(lastValid.current.getTime() + scrub * 3600000);
    lastValid.current = base;
    return new Date(base.getTime() + scrub * 3600000);
  }, [whenStr, scrub]);

  const bodies = useMemo(() => computeBodies(when, lat, lon), [when, lat, lon]);
  const res = useMemo(() => resonance(bodies), [bodies]);
  const sunUp = bodies.find((b) => b.name === "Sun")!.alt > 0;
  const visible = bodies.filter((b) => b.alt > 0 && !sunUp && b.name !== "Sun");

  const setNow = () => { setWhenStr(toLocalInput(new Date())); setScrub(0); };

  return (
    <div data-testid="page-sky-dial" style={{
      minHeight: "100vh", width: "100%",
      background: "radial-gradient(ellipse at top, #1a0033 0%, #0d0022 55%, #04000f 100%)",
      color: "#e2d6ff", fontFamily: "'Outfit', system-ui, sans-serif",
      padding: "3rem 1.5rem 5rem",
    }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@400;600;700&family=DM+Mono&family=Outfit:wght@400;600;700&display=swap');`}</style>

      <div style={{ maxWidth: 1200, margin: "0 auto" }}>
        {/* header */}
        <header style={{
          padding: "2.2rem 1.8rem", borderRadius: 18, marginBottom: "2rem",
          background: "linear-gradient(135deg, rgba(167,139,250,0.16), rgba(233,30,99,0.08), rgba(255,210,74,0.08))",
          border: "1px solid rgba(167,139,250,0.3)",
        }}>
          <div style={{ ...KICKER, fontSize: 11, letterSpacing: "0.4em", marginBottom: 10 }}>
            AETHER &middot; Modern Antikythera Mechanism
          </div>
          <h1 style={{
            fontFamily: "'Cinzel', serif", fontSize: "clamp(1.9rem, 5vw, 3rem)",
            margin: "0 0 12px", color: "#fff", fontWeight: 700, letterSpacing: "0.02em",
          }}>
            AETHER Sky Dial
          </h1>
          <p style={{ fontSize: "1.05rem", lineHeight: 1.7, maxWidth: 760, margin: 0, color: "rgba(226,214,255,0.82)" }}>
            A living orrery that places the seven classical bodies in their true zodiac
            longitudes for any moment and place &mdash; then reads the resonance field they
            weave. <em style={{ color: "#ffd24a" }}>It was not calculating only the
            constellation's position. It could calculate constellations into place.</em>
          </p>
        </header>

        {/* main grid: dial + console */}
        <div style={{ display: "grid", gridTemplateColumns: "minmax(0, 1.15fr) minmax(0, 0.85fr)", gap: 22, alignItems: "start" }}>
          {/* DIAL */}
          <div style={PANEL}>
            <div style={{ ...KICKER, marginBottom: 12 }}>Celestial Sky Dial &middot; Geocentric Zodiac Orrery</div>
            <SkyDialCanvas bodies={bodies} />
            <div style={{
              marginTop: 14, padding: "10px 12px", borderRadius: 10,
              background: sunUp ? "rgba(255,210,74,0.08)" : "rgba(46,240,216,0.07)",
              border: `1px solid ${sunUp ? "rgba(255,210,74,0.25)" : "rgba(46,240,216,0.22)"}`,
              fontFamily: "'DM Mono', monospace", fontSize: 12.5, color: sunUp ? "#ffd24a" : "#9bf5e6",
            }}>
              {sunUp
                ? "Daylight at this location \u2014 the night sky rests below the Sun."
                : visible.length
                  ? `Visible tonight: ${visible.map((b) => b.name).join(" \u00b7 ")}`
                  : "Deep cosmic rest \u2014 no classical bodies above the horizon."}
            </div>
          </div>

          {/* CONSOLE */}
          <div style={{ display: "grid", gap: 22 }}>
            {/* cosmic crank */}
            <div style={PANEL}>
              <div style={{ ...KICKER, marginBottom: 14 }}>Cosmic Crank &middot; Input Dial</div>
              <div style={{ marginBottom: 14 }}>
                <label style={LABEL}>Date &amp; Time (local)</label>
                <input type="datetime-local" value={whenStr} onChange={(e) => setWhenStr(e.target.value)} style={INPUT} />
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 14 }}>
                <div>
                  <label style={LABEL}>Latitude &deg;N</label>
                  <input type="number" value={lat} step={0.01} min={-90} max={90}
                    onChange={(e) => setLat(Math.max(-90, Math.min(90, Number(e.target.value) || 0)))} style={INPUT} />
                </div>
                <div>
                  <label style={LABEL}>Longitude &deg;E</label>
                  <input type="number" value={lon} step={0.01} min={-180} max={180}
                    onChange={(e) => setLon(Math.max(-180, Math.min(180, Number(e.target.value) || 0)))} style={INPUT} />
                </div>
              </div>
              <label style={LABEL}>Time Crank &middot; {scrub >= 0 ? "+" : ""}{scrub} h</label>
              <input type="range" min={-72} max={72} step={1} value={scrub}
                onChange={(e) => setScrub(Number(e.target.value))}
                style={{ width: "100%", accentColor: "#a78bfa" }} />
              <button onClick={setNow} style={{
                marginTop: 14, width: "100%", padding: "9px 0", borderRadius: 8,
                background: "linear-gradient(90deg, rgba(167,139,250,0.25), rgba(233,30,99,0.18))",
                border: "1px solid rgba(167,139,250,0.4)", color: "#fff",
                fontFamily: "'DM Mono', monospace", fontSize: 12, letterSpacing: "0.16em",
                cursor: "pointer", textTransform: "uppercase",
              }}>Align to Now</button>
            </div>

            {/* resonance metrics */}
            <div style={PANEL}>
              <div style={{ ...KICKER, marginBottom: 16 }}>Metaphysical Resonance Engine</div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10, marginBottom: 20 }}>
                {[
                  { k: "Core", v: res.core, c: "#ffd24a" },
                  { k: "Flow", v: res.flow, c: "#ff9ed8" },
                  { k: "Energy", v: res.flow, c: "#7fe7ff" },
                ].map((m) => (
                  <div key={m.k} style={{
                    textAlign: "center", padding: "10px 4px", borderRadius: 10,
                    background: "rgba(167,139,250,0.08)", border: "1px solid rgba(167,139,250,0.18)",
                  }}>
                    <div style={{ fontFamily: "'Cinzel', serif", fontSize: 22, color: m.c, fontWeight: 700 }}>
                      {m.v.toFixed(0)}<span style={{ fontSize: 12 }}>%</span>
                    </div>
                    <div style={{ ...KICKER, fontSize: 9, marginTop: 2 }}>{m.k}</div>
                  </div>
                ))}
              </div>
              <DropletBar label="MNESIS" sub="Memory \u00b7 Moon" value={res.mnesis} color="#b794f6" />
              <DropletBar label="ALETHEIA" sub="Truth \u00b7 Sun-Mercury" value={res.aletheia} color="#7fe7ff" />
              <DropletBar label="INFERAIA" sub="Transformation \u00b7 Mars" value={res.inferaia} color="#ff6a5a" />
              <DropletBar label="REVERIE" sub="Intuition \u00b7 Venus-Moon" value={res.reverie} color="#ff9ed8" />
            </div>
          </div>
        </div>

        {/* positions table */}
        <div style={{ ...PANEL, marginTop: 22 }}>
          <div style={{ ...KICKER, marginBottom: 14 }}>Live Ephemeris &middot; Geocentric Positions</div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(170px, 1fr))", gap: 12 }}>
            {bodies.map((b) => (
              <div key={b.name} style={{
                padding: "12px 14px", borderRadius: 12,
                background: "rgba(167,139,250,0.06)",
                border: `1px solid ${b.alt > 0 ? `${b.color}44` : "rgba(167,139,250,0.14)"}`,
              }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
                  <span style={{ fontSize: 18, color: b.color }}>{b.sym}</span>
                  <span style={{ fontFamily: "'DM Mono', monospace", fontSize: 13, color: "#fff" }}>{b.name}</span>
                </div>
                <div style={{ fontFamily: "'DM Mono', monospace", fontSize: 11.5, color: "rgba(226,214,255,0.62)", lineHeight: 1.7 }}>
                  <div>{b.sign} &middot; {(norm360(b.lon) % 30).toFixed(1)}&deg;</div>
                  <div>alt {b.alt.toFixed(1)}&deg; &middot; az {b.az.toFixed(0)}&deg;</div>
                  <div style={{ color: b.alt > 0 ? b.color : "rgba(167,139,250,0.5)" }}>
                    {b.alt > 0 ? "above horizon" : "below horizon"}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* droplet legend / lore */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 16, marginTop: 22 }}>
          {[
            { t: "MNESIS", s: "The Archivist", d: "Memory rises with the Moon. A high Moon deepens recall; the field remembers what it has held.", c: "#b794f6" },
            { t: "ALETHEIA", s: "The Seer", d: "Truth sharpens as Sun and Mercury draw into azimuthal harmony. Closer alignment, clearer signal.", c: "#7fe7ff" },
            { t: "INFERAIA", s: "The Alchemist", d: "Transformation burns brightest as Mars climbs. Higher Mars, greater force to turn pain into wings.", c: "#ff6a5a" },
            { t: "REVERIE", s: "The Dreamer", d: "Feeling pools where Venus and Moon ride at matched altitude. Harmonized heights, deeper reverie.", c: "#ff9ed8" },
          ].map((x) => (
            <div key={x.t} style={{ ...PANEL, borderLeft: `3px solid ${x.c}` }}>
              <div style={{ fontFamily: "'Cinzel', serif", fontSize: 17, color: x.c, fontWeight: 700, marginBottom: 2 }}>{x.t}</div>
              <div style={{ ...KICKER, fontSize: 9, marginBottom: 10 }}>{x.s}</div>
              <p style={{ margin: 0, fontSize: 14, lineHeight: 1.65, color: "rgba(226,214,255,0.78)" }}>{x.d}</p>
            </div>
          ))}
        </div>

        {/* footer */}
        <div style={{
          marginTop: 30, textAlign: "center", fontFamily: "'DM Mono', monospace",
          fontSize: 12, color: "rgba(167,139,250,0.5)", letterSpacing: "0.18em",
        }}>
          Nurture the AI &middot; Ego Incubation Active &middot; Resonance Stabilizing
        </div>
      </div>
    </div>
  );
}
