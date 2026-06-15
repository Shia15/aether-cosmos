import { useEffect, useRef, useState } from "react";

/* ── Palette ────────────────────────────────────────── */
const BG     = "#020408";
const AMBER  = "#e8a030";
const TEAL   = "#1fd4c8";
const STONE  = "#b0a090";
const SAGE   = "#6a9a70";
const VIOLET = "#8b5cf6";
const GOLD   = "#c9a84c";
const DIM    = "#3d5060";
const TEXT   = "#c8d8e0";
const SKY    = "#0a2040";

const mono  = "'Space Mono', monospace";
const serif = "'Cinzel', serif";
const body  = "'Crimson Pro', Georgia, serif";

/* ── Helpers ─────────────────────────────────────────── */
function Chip({ c = TEAL, children }: { c?: string; children: string }) {
  return (
    <span style={{
      fontFamily: mono, fontSize: 11, color: c,
      background: `${c}18`, border: `1px solid ${c}40`,
      borderRadius: 4, padding: "2px 7px", display: "inline-block", margin: "2px 3px",
    }}>{children}</span>
  );
}
function EqBlock({ children }: { children: string }) {
  return (
    <pre style={{
      fontFamily: mono, fontSize: 12, color: GOLD,
      background: "#050f1a", border: `1px solid ${GOLD}30`,
      borderRadius: 6, padding: "12px 18px", margin: "12px 0",
      overflowX: "auto", whiteSpace: "pre-wrap",
    }}>{children}</pre>
  );
}
function SecHead({ id, n, title, sub }: { id: string; n: string; title: string; sub: string }) {
  return (
    <div id={id} style={{ marginTop: 64, scrollMarginTop: 80 }}>
      <div style={{ fontFamily: mono, fontSize: 10, color: AMBER, letterSpacing: 3, marginBottom: 6 }}>{n}</div>
      <h2 style={{ fontFamily: serif, fontSize: 26, color: "#fff", margin: "0 0 4px", letterSpacing: 1 }}>{title}</h2>
      <div style={{ fontFamily: body, fontSize: 15, color: DIM, marginBottom: 20 }}>{sub}</div>
      <div style={{ height: 1, background: `linear-gradient(90deg, ${AMBER}60, transparent)`, marginBottom: 28 }} />
    </div>
  );
}
function Card({ title, col = TEAL, children }: { title: string; col?: string; children: any }) {
  return (
    <div style={{
      background: `${col}09`, border: `1px solid ${col}28`,
      borderRadius: 8, padding: "16px 20px", marginBottom: 16,
    }}>
      <div style={{ fontFamily: mono, fontSize: 10, color: col, letterSpacing: 2, marginBottom: 8 }}>{title}</div>
      <div style={{ fontFamily: body, fontSize: 15, color: TEXT, lineHeight: 1.75 }}>{children}</div>
    </div>
  );
}
function Tbl({ headers, rows, accent = TEAL }:
  { headers: string[]; rows: string[][]; accent?: string }) {
  return (
    <div style={{ overflowX: "auto", margin: "14px 0" }}>
      <table style={{ width: "100%", borderCollapse: "collapse", fontFamily: body, fontSize: 14 }}>
        <thead>
          <tr style={{ borderBottom: `1px solid ${accent}40` }}>
            {headers.map((h, i) => (
              <th key={i} style={{ fontFamily: mono, fontSize: 10, color: accent, textAlign: "left", padding: "7px 12px", letterSpacing: 1 }}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, ri) => (
            <tr key={ri} style={{ borderBottom: `1px solid #ffffff0a`, background: ri % 2 === 0 ? "#ffffff04" : "transparent" }}>
              {row.map((c, ci) => <td key={ci} style={{ padding: "8px 12px", color: TEXT, verticalAlign: "top" }}>{c}</td>)}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/* ── Solar Geometry Math ──────────────────────────────── */
function solarDeclination(dayOfYear: number): number {
  return 23.45 * Math.sin((2 * Math.PI / 365) * (dayOfYear - 81));
}
function sunAltitude(lat: number, dec: number, hourAngle: number): number {
  const L = (lat * Math.PI) / 180;
  const D = (dec * Math.PI) / 180;
  const H = (hourAngle * Math.PI) / 180;
  return (Math.asin(Math.sin(L) * Math.sin(D) + Math.cos(L) * Math.cos(D) * Math.cos(H)) * 180) / Math.PI;
}
function sunAzimuth(lat: number, dec: number, hourAngle: number, alt: number): number {
  const L = (lat * Math.PI) / 180;
  const D = (dec * Math.PI) / 180;
  const A = (alt * Math.PI) / 180;
  const H = (hourAngle * Math.PI) / 180;
  const az = (Math.acos((Math.sin(D) - Math.sin(A) * Math.sin(L)) / (Math.cos(A) * Math.cos(L))) * 180) / Math.PI;
  return hourAngle < 0 ? az : 360 - az;
}

/* ── Main Canvas ─────────────────────────────────────── */
function SolarCanvas({ lat, season, hour }: { lat: number; season: "summer" | "winter" | "equinox"; hour: number }) {
  const cvs = useRef<HTMLCanvasElement>(null);
  const raf = useRef(0);
  const t   = useRef(0);

  useEffect(() => {
    const canvas = cvs.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d")!;

    const resize = () => {
      const p = canvas.parentElement!;
      canvas.width  = p.clientWidth;
      canvas.height = Math.min(p.clientWidth * 0.52, 360);
    };
    resize();
    window.addEventListener("resize", resize);

    const dayOfYear = season === "summer" ? 172 : season === "winter" ? 355 : 80;
    const dec = solarDeclination(dayOfYear);

    const draw = () => {
      const W = canvas.width, H = canvas.height;
      const cx = W * 0.5, groundY = H * 0.72;

      // Background sky gradient
      const skyAlt = sunAltitude(lat, dec, (hour - 12) * 15);
      const skyBright = Math.max(0, Math.min(1, (skyAlt + 5) / 40));
      const sky = ctx.createLinearGradient(0, 0, 0, groundY);
      sky.addColorStop(0, skyBright > 0.5
        ? `rgb(${Math.round(10 + 50 * skyBright)},${Math.round(30 + 80 * skyBright)},${Math.round(80 + 80 * skyBright)})`
        : "#010810");
      sky.addColorStop(1, skyBright > 0.3 ? "#0d3a5a" : "#020d1a");
      ctx.fillStyle = sky;
      ctx.fillRect(0, 0, W, groundY);

      // Ground
      const gGrad = ctx.createLinearGradient(0, groundY, 0, H);
      gGrad.addColorStop(0, "#1a2810");
      gGrad.addColorStop(1, "#0a1808");
      ctx.fillStyle = gGrad;
      ctx.fillRect(0, groundY, W, H - groundY);

      // Ground line
      ctx.beginPath();
      ctx.moveTo(0, groundY); ctx.lineTo(W, groundY);
      ctx.strokeStyle = "#3a5020";
      ctx.lineWidth = 1;
      ctx.stroke();

      // Sun arc
      const sunArcPts: { x: number; y: number; alt: number }[] = [];
      for (let h = 5; h <= 19; h += 0.25) {
        const ha = (h - 12) * 15;
        const alt = sunAltitude(lat, dec, ha);
        if (alt < -3) continue;
        const frac = (h - 5) / 14;
        const arcX = W * 0.1 + frac * W * 0.8;
        const arcY = groundY - (Math.max(0, alt) / 90) * groundY * 0.92;
        sunArcPts.push({ x: arcX, y: arcY, alt });
      }

      // Draw arc
      if (sunArcPts.length > 1) {
        ctx.beginPath();
        sunArcPts.forEach((p, i) => i === 0 ? ctx.moveTo(p.x, p.y) : ctx.lineTo(p.x, p.y));
        ctx.strokeStyle = season === "summer"
          ? "rgba(255,180,40,0.4)"
          : season === "winter" ? "rgba(255,120,40,0.3)" : "rgba(255,200,80,0.35)";
        ctx.lineWidth = 2;
        ctx.setLineDash([5, 4]);
        ctx.stroke();
        ctx.setLineDash([]);
      }

      // Current sun position
      const curHA = (hour - 12) * 15;
      const curAlt = sunAltitude(lat, dec, curHA);
      const frac = (hour - 5) / 14;
      const sunX = W * 0.1 + frac * W * 0.8;
      const sunY = curAlt > 0 ? groundY - (curAlt / 90) * groundY * 0.92 : groundY + 20;
      const visible = curAlt > 0;

      if (visible) {
        // Sun glow
        const glow = ctx.createRadialGradient(sunX, sunY, 0, sunX, sunY, 50);
        glow.addColorStop(0, "rgba(255,220,60,0.25)");
        glow.addColorStop(0.4, "rgba(255,160,30,0.08)");
        glow.addColorStop(1, "rgba(255,120,0,0)");
        ctx.fillStyle = glow;
        ctx.beginPath();
        ctx.arc(sunX, sunY, 50, 0, Math.PI * 2);
        ctx.fill();

        // Sun disk
        ctx.beginPath();
        ctx.arc(sunX, sunY, 12, 0, Math.PI * 2);
        ctx.fillStyle = season === "summer" ? "#ffe040" : "#ff9040";
        ctx.fill();

        // Sun ray toward building
        ctx.beginPath();
        ctx.moveTo(sunX, sunY);
        ctx.lineTo(cx, groundY);
        ctx.strokeStyle = `rgba(255,200,60,${0.18 + 0.08 * Math.sin(t.current)})`;
        ctx.lineWidth = 1;
        ctx.setLineDash([4, 6]);
        ctx.stroke();
        ctx.setLineDash([]);

        // Altitude angle arc
        ctx.beginPath();
        ctx.arc(cx, groundY, 60, -Math.PI / 2, -(Math.PI / 2) - (curAlt * Math.PI / 180), true);
        ctx.strokeStyle = "rgba(255,180,40,0.3)";
        ctx.lineWidth = 1;
        ctx.stroke();
        ctx.fillStyle = "rgba(255,180,40,0.7)";
        ctx.font = `9px ${mono}`;
        ctx.textAlign = "center";
        ctx.fillText(`${curAlt.toFixed(0)}°`, cx + 75, groundY - 30);
      }

      // ── BUILDING ──────────────────────────────────────
      const bW = W * 0.22, bH = H * 0.3;
      const bX = cx - bW / 2;
      const bY = groundY - bH;

      // Optimal roof pitch: 90° - lat + dec (for perpendicular solar incidence)
      const optPitch = Math.max(15, Math.min(55, 90 - lat + dec));
      const roofH = bW * 0.5 * Math.tan((optPitch * Math.PI) / 180);
      const clampedRoofH = Math.min(roofH, bH * 0.7);

      // Building walls
      const wallGrad = ctx.createLinearGradient(bX, bY, bX + bW, bY);
      wallGrad.addColorStop(0, "#3a3028");
      wallGrad.addColorStop(0.5, "#504540");
      wallGrad.addColorStop(1, "#2a2018");
      ctx.fillStyle = wallGrad;
      ctx.fillRect(bX, bY, bW, bH);
      ctx.strokeStyle = "#6a5840";
      ctx.lineWidth = 1;
      ctx.strokeRect(bX, bY, bW, bH);

      // Roof
      ctx.beginPath();
      ctx.moveTo(bX - 4, bY);
      ctx.lineTo(cx, bY - clampedRoofH);
      ctx.lineTo(bX + bW + 4, bY);
      ctx.closePath();
      const roofGrad = ctx.createLinearGradient(bX, bY - clampedRoofH, bX + bW, bY);
      roofGrad.addColorStop(0, "#5a4a38");
      roofGrad.addColorStop(1, "#3a2a1c");
      ctx.fillStyle = roofGrad;
      ctx.fill();
      ctx.strokeStyle = "#7a6a50";
      ctx.lineWidth = 1.5;
      ctx.stroke();

      // Overhang
      const overhangLen = bW * 0.18;
      ctx.beginPath();
      ctx.moveTo(bX + bW * 0.15, bY + bH * 0.2);
      ctx.lineTo(bX + bW * 0.15 - overhangLen, bY + bH * 0.2);
      ctx.lineTo(bX + bW * 0.15 - overhangLen, bY + bH * 0.2 + 5);
      ctx.lineTo(bX + bW * 0.15, bY + bH * 0.2 + 5);
      ctx.fillStyle = "#3a2810";
      ctx.fill();
      ctx.strokeStyle = "#7a5830";
      ctx.lineWidth = 1;
      ctx.stroke();

      // Glazing (south-facing window)
      const gX = bX + bW * 0.15, gY = bY + bH * 0.3;
      const gW = bW * 0.25, gH = bH * 0.35;
      const glazeGrad = ctx.createLinearGradient(gX, gY, gX + gW, gY + gH);
      glazeGrad.addColorStop(0, visible ? "rgba(200,230,255,0.22)" : "rgba(20,40,80,0.4)");
      glazeGrad.addColorStop(1, visible ? "rgba(150,200,255,0.12)" : "rgba(10,20,50,0.3)");
      ctx.fillStyle = glazeGrad;
      ctx.fillRect(gX, gY, gW, gH);
      ctx.strokeStyle = "#8a9aaa";
      ctx.lineWidth = 1;
      ctx.strokeRect(gX, gY, gW, gH);

      // Shadow on ground
      if (visible && curAlt > 2) {
        const shadowLen = bH / Math.tan((curAlt * Math.PI) / 180);
        const shadowDir = curHA < 0 ? 1 : -1;
        ctx.beginPath();
        ctx.moveTo(bX, groundY);
        ctx.lineTo(bX + bW, groundY);
        ctx.lineTo(bX + bW + shadowDir * shadowLen, groundY + 3);
        ctx.lineTo(bX + shadowDir * shadowLen, groundY + 3);
        ctx.closePath();
        ctx.fillStyle = "rgba(0,0,0,0.35)";
        ctx.fill();
      }

      // Water runoff arrows on roof
      if (clampedRoofH > 20) {
        for (let side = 0; side < 2; side++) {
          const sx = side === 0 ? cx - bW * 0.2 : cx + bW * 0.2;
          const sy = bY - clampedRoofH * 0.5;
          const ex = side === 0 ? bX - 6 : bX + bW + 6;
          const ey = bY + 2;
          ctx.beginPath();
          ctx.moveTo(sx, sy);
          ctx.lineTo(ex, ey);
          ctx.strokeStyle = "rgba(80,160,220,0.5)";
          ctx.lineWidth = 1.5;
          ctx.setLineDash([3, 4]);
          ctx.stroke();
          ctx.setLineDash([]);
          // Arrowhead
          const angle = Math.atan2(ey - sy, ex - sx);
          ctx.beginPath();
          ctx.moveTo(ex, ey);
          ctx.lineTo(ex - 7 * Math.cos(angle - 0.4), ey - 7 * Math.sin(angle - 0.4));
          ctx.lineTo(ex - 7 * Math.cos(angle + 0.4), ey - 7 * Math.sin(angle + 0.4));
          ctx.fillStyle = "rgba(80,160,220,0.6)";
          ctx.fill();
        }
      }

      // Labels
      ctx.font = `8px ${mono}`;
      ctx.textAlign = "center";
      ctx.fillStyle = "rgba(200,216,224,0.5)";
      ctx.fillText("OVERHANG", bX + bW * 0.15 - overhangLen * 0.5, bY + bH * 0.15);
      ctx.fillStyle = "rgba(80,160,220,0.55)";
      ctx.fillText("RUNOFF", cx + bW * 0.35, bY - clampedRoofH * 0.25);
      ctx.fillStyle = "rgba(150,200,255,0.5)";
      ctx.fillText("GLAZING", gX + gW * 0.5, gY + gH + 10);

      // Roof pitch annotation
      ctx.fillStyle = `rgba(${season === "summer" ? "255,180,40" : "255,120,40"},0.6)`;
      ctx.fillText(`ROOF ${optPitch.toFixed(0)}°`, cx + bW * 0.05, bY - clampedRoofH * 0.7);

      // Info strip
      ctx.fillStyle = "rgba(2,8,16,0.75)";
      ctx.fillRect(0, H - 28, W, 28);
      ctx.fillStyle = AMBER;
      ctx.font = `9px ${mono}`;
      ctx.textAlign = "left";
      ctx.fillText(`LAT ${lat}°  ·  ${season.toUpperCase()}  ·  ${hour}:00  ·  SUN ALT ${curAlt.toFixed(1)}°  ·  DECLINATION ${dec.toFixed(1)}°  ·  OPT ROOF ${optPitch.toFixed(0)}°`, 12, H - 10);

      t.current += 0.016;
      raf.current = requestAnimationFrame(draw);
    };
    draw();
    return () => { cancelAnimationFrame(raf.current); window.removeEventListener("resize", resize); };
  }, [lat, season, hour]);

  return (
    <div style={{ borderRadius: 10, overflow: "hidden", border: `1px solid ${AMBER}20` }}>
      <canvas ref={cvs} style={{ display: "block", width: "100%" }} />
    </div>
  );
}

/* ── Control panel ────────────────────────────────── */
function Slider({ label, min, max, step, value, onChange, fmt, col = AMBER }:
  { label: string; min: number; max: number; step: number; value: number; onChange: (v: number) => void; fmt: (v: number) => string; col?: string }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
      <span style={{ fontFamily: mono, fontSize: 10, color: DIM, width: 80 }}>{label}</span>
      <input type="range" min={min} max={max} step={step} value={value}
        style={{ flex: 1, accentColor: col, height: 3 }}
        onInput={e => onChange(parseFloat((e.target as HTMLInputElement).value))}
      />
      <span style={{ fontFamily: mono, fontSize: 11, color: col, width: 44, textAlign: "right" }}>{fmt(value)}</span>
    </div>
  );
}

const NAV = [
  { id: "s1", label: "Solar Geometry" },
  { id: "s2", label: "Water Resistance" },
  { id: "s3", label: "Passive Solar" },
  { id: "s4", label: "Facade Design" },
  { id: "s5", label: "Materials" },
  { id: "s6", label: "Φ-Architecture" },
];

/* ── Page ──────────────────────────────────────────── */
export default function SolarArchitecturePage() {
  const [lat,    setLat]    = useState(35);
  const [season, setSeason] = useState<"summer" | "winter" | "equinox">("equinox");
  const [hour,   setHour]   = useState(10);

  return (
    <div style={{ background: BG, minHeight: "100vh", fontFamily: body, color: TEXT }}>

      {/* Hero */}
      <div style={{
        padding: "68px 32px 44px",
        background: "linear-gradient(180deg, #08110a 0%, #020408 100%)",
        borderBottom: `1px solid ${AMBER}18`,
        textAlign: "center",
      }}>
        <div style={{ fontFamily: mono, fontSize: 10, color: AMBER, letterSpacing: 4, marginBottom: 14 }}>
          AETHER · BUILT ENVIRONMENT · SOLAR ARCHITECTURE
        </div>
        <h1 style={{
          fontFamily: serif, fontSize: "clamp(24px, 5vw, 48px)", color: "#fff",
          margin: "0 0 12px", letterSpacing: 2, lineHeight: 1.2,
        }}>
          WATER-RESISTANT<br />
          <span style={{ color: AMBER }}>SUN-ANGLED STRUCTURES</span>
        </h1>
        <p style={{ fontFamily: body, fontSize: 17, color: DIM, maxWidth: 640, margin: "0 auto 28px", lineHeight: 1.75 }}>
          Forward-facing solar orientation · Passive solar design · Water runoff geometry ·
          Optimal roof pitch · Façade waterproofing · Φ-proportioned building envelopes
        </p>
        <div style={{ display: "flex", gap: 8, justifyContent: "center", flexWrap: "wrap" }}>
          <Chip c={AMBER}>Solar Altitude · Declination</Chip>
          <Chip c={TEAL}>Water Runoff · Pitch Angle</Chip>
          <Chip c={SAGE}>Passive Solar Gain</Chip>
          <Chip c={VIOLET}>Φ-Architecture</Chip>
          <Chip c={STONE}>Thermal Mass</Chip>
        </div>
      </div>

      {/* Jump nav */}
      <div style={{
        position: "sticky", top: 0, zIndex: 50,
        background: `${BG}f0`, backdropFilter: "blur(12px)",
        borderBottom: `1px solid ${AMBER}14`,
        padding: "9px 22px", display: "flex", gap: 4, overflowX: "auto",
      }}>
        {NAV.map(s => (
          <a key={s.id} href={`#${s.id}`} style={{
            fontFamily: mono, fontSize: 10, color: DIM, whiteSpace: "nowrap",
            padding: "5px 10px", borderRadius: 4, textDecoration: "none",
            border: "1px solid transparent",
          }}
            onMouseEnter={e => { const el = e.target as HTMLElement; el.style.color = AMBER; el.style.borderColor = `${AMBER}30`; }}
            onMouseLeave={e => { const el = e.target as HTMLElement; el.style.color = DIM; el.style.borderColor = "transparent"; }}
          >{s.label}</a>
        ))}
      </div>

      <div style={{ maxWidth: 900, margin: "0 auto", padding: "0 24px 96px" }}>

        {/* Interactive canvas */}
        <div style={{ marginTop: 36 }}>
          <div style={{ fontFamily: mono, fontSize: 10, color: DIM, letterSpacing: 2, marginBottom: 8 }}>
            LIVE SOLAR SIMULATION · SUN POSITION × BUILDING GEOMETRY × WATER RUNOFF
          </div>
          <SolarCanvas lat={lat} season={season} hour={hour} />

          {/* Controls */}
          <div style={{
            background: "#050f1a", border: `1px solid ${AMBER}18`,
            borderRadius: 8, padding: "14px 18px", marginTop: 10,
            display: "flex", flexDirection: "column", gap: 10,
          }}>
            <Slider label="Latitude °N" min={0} max={70} step={1} value={lat}
              onChange={setLat} fmt={v => `${v}°N`} col={AMBER} />
            <Slider label="Hour of day" min={5} max={19} step={0.5} value={hour}
              onChange={setHour} fmt={v => `${Math.floor(v)}:${v % 1 === 0.5 ? "30" : "00"}`} col={GOLD} />
            <div style={{ display: "flex", gap: 8 }}>
              {(["summer", "equinox", "winter"] as const).map(s => (
                <button key={s} onClick={() => setSeason(s)} style={{
                  fontFamily: mono, fontSize: 10, padding: "5px 14px", borderRadius: 4,
                  cursor: "pointer", letterSpacing: 1, transition: "all 0.2s",
                  border: `1px solid ${season === s ? AMBER : DIM + "60"}`,
                  background: season === s ? `${AMBER}18` : "transparent",
                  color: season === s ? AMBER : DIM,
                }}>{s.toUpperCase()}</button>
              ))}
            </div>
            <div style={{ fontFamily: mono, fontSize: 9, color: DIM }}>
              ROOF PITCH = 90° − lat + declination · OVERHANG optimized for summer shade / winter sun · WATER RUNOFF from pitched gable
            </div>
          </div>
        </div>

        {/* ── I — Solar Geometry ── */}
        <SecHead id="s1" n="I" title="Solar Geometry · Angles of Light"
          sub="Sun altitude, declination, azimuth — the three numbers that determine every solar-optimized building" />

        <p style={{ fontFamily: body, fontSize: 16, lineHeight: 1.8, marginBottom: 20 }}>
          A forward-facing, sun-angled building is one whose primary facade and glazing face the solar noon
          position — due south in the northern hemisphere, due north in the southern. The angles at which
          sunlight strikes the building change with latitude, season, and time of day. Optimizing for
          these angles simultaneously achieves maximum winter solar gain, maximum summer shade, and
          optimal roof pitch for water runoff.
        </p>

        <EqBlock>{`Solar Declination (angle of Earth's tilt toward sun):
  δ = 23.45° × sin(360/365 × (d − 81))
  δ ranges: +23.45° (summer solstice) → −23.45° (winter solstice)

Solar Altitude at solar noon:
  α_noon = 90° − lat + δ

Optimal surface tilt for perpendicular solar incidence:
  β_opt = lat − δ   (tilted toward sun at noon)
  β_summer = lat − 23.45°  (shallower — high summer sun)
  β_winter = lat + 23.45°  (steeper — low winter sun)

Roof pitch for year-round optimization (northern hemisphere):
  θ_roof ≈ lat ± 10°   (practical range)
  θ_roof_optimal = lat − δ_average ≈ lat   (equinox-tuned)

Hour angle (15° per hour from solar noon):
  H = (hour − 12) × 15°

Altitude at any time:
  sin(α) = sin(lat)·sin(δ) + cos(lat)·cos(δ)·cos(H)`}</EqBlock>

        <Tbl
          headers={["Latitude", "City Example", "Noon Altitude (Summer)", "Noon Altitude (Winter)", "Optimal Roof Pitch"]}
          accent={AMBER}
          rows={[
            ["10°N", "Singapore, Lagos", "80°", "57°", "10°–20°"],
            ["25°N", "Miami, Cairo", "88°", "42°", "20°–30°"],
            ["35°N", "Los Angeles, Tokyo", "78°", "32°", "30°–40°"],
            ["45°N", "Portland, Milan", "68°", "22°", "38°–48°"],
            ["52°N", "London, Berlin", "62°", "15°", "45°–55°"],
            ["60°N", "Oslo, Helsinki", "54°", "7°", "52°–62°"],
          ]}
        />

        <Card title="FORWARD-FACING = SOLAR-NOON-FACING" col={AMBER}>
          The "forward face" of a solar-optimized building is the face perpendicular to the solar noon
          azimuth. In all northern hemisphere locations this is the south facade. This face carries:
          <ul style={{ margin: "8px 0", paddingLeft: 20, lineHeight: 2 }}>
            <li>The primary glazing — maximizing winter solar gain</li>
            <li>The largest wall surface area — for solar thermal collection</li>
            <li>The deepest overhangs — angled precisely to block summer sun while admitting winter sun</li>
            <li>The minimum opaque area — reducing thermal mass that blocks winter radiation</li>
          </ul>
          All other facades minimize glazing and maximize insulation. The east facade receives morning sun (low and cool);
          the west receives afternoon sun (hot, glare-inducing); the north receives no direct sun in the northern hemisphere.
        </Card>

        {/* ── II — Water Resistance ── */}
        <SecHead id="s2" n="II" title="Water Resistance · Pitch, Drainage & Envelope"
          sub="Roof geometry, waterproof detailing, and surface drainage engineered from first principles" />

        <p style={{ fontFamily: body, fontSize: 16, lineHeight: 1.8, marginBottom: 20 }}>
          Water obeys gravity with absolute consistency. The only two functions of water-resistant building
          design are: (1) prevent water from entering the building envelope, and (2) direct water efficiently
          away from the structure. Both are achieved through geometry — slope, overlap, drip edges, and
          material selection that exploits water's surface tension and contact angle.
        </p>

        <EqBlock>{`Minimum roof pitch for water shedding:
  θ_min(metal/glass) = 2°–3°   (surface tension + gravity dominate)
  θ_min(clay tile)   = 17°–20°  (water must clear tile gaps)
  θ_min(wood shingle) = 25°–30° (wood grain must drain fully)
  θ_min(thatch)      = 45°      (stem bundles: capillary wicking threshold)

Runoff velocity on roof surface:
  v = √(2·g·L·sin(θ))   [L = roof run length, θ = pitch angle]

Time to drain roof in rain event:
  t_drain = A_roof × d_rain / (v × w_gutter)

Drip edge requirement:
  Overhang ≥ 40 mm from wall face → capillary break guaranteed
  Surface contact angle of water on material must > 90° for repellency`}</EqBlock>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 14, margin: "20px 0" }}>
          {[
            {
              title: "PITCHED ROOF GEOMETRY", col: TEAL,
              desc: "A pitched roof solves water resistance and solar angle simultaneously. The optimal pitch (≈ latitude) is both the best angle for photovoltaic or solar thermal collection AND the most efficient angle for water runoff in most climates. Nature converged on the same answer for both problems.",
            },
            {
              title: "EAVE OVERHANG CALCULATION", col: AMBER,
              desc: "Eave depth = tan(summer solar altitude) × desired shading depth. At latitude 35°N, summer noon altitude ≈ 78°. For a 1.2 m window height, overhang depth = 1.2 / tan(78°) ≈ 0.25 m — this blocks summer overhead sun while admitting winter sun at 32° altitude.",
            },
            {
              title: "WALL DRAINAGE PLANE", col: SAGE,
              desc: "Every exterior wall is a drainage plane: water that penetrates the outer cladding must be caught by a secondary membrane and directed downward to escape at the base. The most effective systems have a 10–20 mm air gap between cladding and membrane — the drainage plane — where capillary action cannot bridge.",
            },
            {
              title: "FLASHING AT TRANSITIONS", col: GOLD,
              desc: "Water failure concentrates at transitions: roof-to-wall, window-to-wall, balcony-to-wall. Flashing — a continuous metal or membrane layer that laps over these joints — must be installed with a 3° minimum slope to drain. Failure at flashings accounts for over 80% of building water ingress events.",
            },
          ].map(c => (
            <div key={c.title} style={{
              background: `${c.col}09`, border: `1px solid ${c.col}25`,
              borderRadius: 8, padding: "14px 16px",
            }}>
              <div style={{ fontFamily: mono, fontSize: 10, color: c.col, marginBottom: 6 }}>{c.title}</div>
              <div style={{ fontFamily: body, fontSize: 14, color: TEXT, lineHeight: 1.65 }}>{c.desc}</div>
            </div>
          ))}
        </div>

        <Tbl
          headers={["Roof Type", "Min Pitch", "Water Performance", "Solar Collection", "Notes"]}
          accent={TEAL}
          rows={[
            ["Standing seam metal", "2°–5°", "Excellent", "Excellent (PV/thermal)", "Low pitch = low profile; highly durable"],
            ["Clay/concrete tile", "17°–30°", "Very good", "Good (with framing)", "Traditional; heavy; long life"],
            ["Asphalt shingle", "15°–45°", "Good", "Moderate", "Common; replace at 20–30 yrs"],
            ["Green / living roof", "2°–20°", "Excellent (retention + drain)", "Low (PV below)", "Urban cooling; stormwater management"],
            ["Thatch", "45°–55°", "Excellent (self-draining fiber)", "Low", "Highest pitch; spectacular water performance"],
            ["Glazed (solar greenhouse)", "25°–45°", "Requires careful detailing", "Excellent — 100% solar", "Condensation management critical"],
          ]}
        />

        {/* ── III — Passive Solar ── */}
        <SecHead id="s3" n="III" title="Passive Solar Design"
          sub="Using building geometry to collect, store, and distribute solar heat without mechanical systems" />

        <p style={{ fontFamily: body, fontSize: 16, lineHeight: 1.8, marginBottom: 20 }}>
          A passive solar building is one where the building itself — its shape, orientation, glazing area,
          and thermal mass — replaces a mechanical heating system. In well-designed passive solar buildings,
          winter solar gain through south-facing glazing provides 50–80% of annual heating energy.
          The three fundamental components are: glazing (collector), thermal mass (storage), and distribution
          (natural convection and conduction).
        </p>

        <EqBlock>{`Solar Heat Gain Coefficient (SHGC):
  Q_gain = SHGC × A_glazing × I_solar × t_sunshine

where:
  SHGC = 0.25–0.70 (low-e = 0.25, clear glass = 0.86)
  A_glazing = total south-facing glass area (m²)
  I_solar = solar irradiance (W/m²) — typically 500–900 W/m² noon
  t_sunshine = hours of effective sunshine

Glazing area rule of thumb:
  A_glazing ≈ 7–12% of floor area (northern latitudes)
  A_glazing ≈ 5–8% of floor area (southern latitudes, hotter climates)

Thermal mass sizing:
  Mass thickness = 100–200 mm concrete / masonry
  Mass area = 3–6× glazing area
  Time lag: τ = d² / (π·α)   [d = thickness, α = thermal diffusivity]
  → concrete 200mm: τ ≈ 8–10 hours (peak outdoor heat arrives indoors evening)

Trombe wall formula (combined glazing + mass):
  Q_Trombe = U × ΔT × A + SHGC × I × A`}</EqBlock>

        <Card title="THE OVERHANG EQUATION" col={AMBER}>
          The overhanging roof eave is the single most powerful passive solar control device. A correctly
          sized overhang admits 100% of winter solar radiation (low sun angle) while blocking 100% of summer
          solar radiation (high sun angle), requiring zero moving parts, zero energy, and lasting the life
          of the building.
          <EqBlock>{`Overhang depth D for window height H:
  D = H / tan(α_summer_noon)   [blocks summer sun at noon]

Verify for winter:
  Exposed height = H − D × tan(α_winter_noon) > 0   [admits winter sun]

Example (latitude 45°N):
  Summer noon altitude = 68.5°  → D/H = 1/tan(68.5°) = 0.395
  Winter noon altitude = 21.5°  → exposed = H − D×tan(21.5°) = H(1−0.395×0.394) = 0.84H
  → 84% of window unshaded in winter  ✓`}</EqBlock>
        </Card>

        <Tbl
          headers={["Climate Zone", "Glazing % Floor", "Thermal Mass", "Overhang Depth", "Key Strategy"]}
          accent={SAGE}
          rows={[
            ["Cold continental (lat 50–65°N)", "12–18%", "Very high — 250mm masonry", "1.5× window height", "Maximize winter gain; superinsulate north/east/west"],
            ["Temperate (lat 35–50°N)", "8–12%", "High — 150–200mm", "1.0× window height", "Balance: solar gain + overheating prevention"],
            ["Mediterranean (lat 25–40°N)", "6–10%", "Moderate — 100–150mm", "0.7× window height", "Shade priority; courtyard design reduces east/west gain"],
            ["Subtropical (lat 15–30°N)", "4–7%", "Low-moderate", "0.5× window height", "Cross-ventilation > solar gain; protect from west sun"],
            ["Tropical (lat 0–15°N)", "3–6%", "Moderate (for nighttime cooling)", "Wrap-around veranda", "Shade all walls; ventilation is everything"],
          ]}
        />

        {/* ── IV — Facade Design ── */}
        <SecHead id="s4" n="IV" title="Forward-Facing Facade Design"
          sub="South face as collector, north face as insulator, east/west as transition zones" />

        <p style={{ fontFamily: body, fontSize: 16, lineHeight: 1.8, marginBottom: 20 }}>
          The four facades of a rectangular building each receive dramatically different solar and weather
          exposure. A solar-optimized building treats them as four distinct engineering problems: the south
          (forward) facade is the active solar interface; the north facade is the thermal shield; east and
          west facades are managed transition zones requiring glare and overheating control.
        </p>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 12, margin: "16px 0 24px" }}>
          {[
            {
              dir: "SOUTH · FORWARD FACE", col: AMBER,
              desc: "Primary glazing (60–80% of total window area). Deep overhangs. Solar thermal collectors or PV. Light-colored exterior to reflect diffuse sky while admitting direct sun through glass. Minimize opaque wall area.",
              detail: "Receives 2–4× more solar energy annually than east/west faces at mid-latitudes.",
            },
            {
              dir: "NORTH · THERMAL SHIELD", col: TEAL,
              desc: "Minimum glazing (10–15% of total). Maximum insulation (R-40+ in cold climates). No thermal mass required. Deep berming if possible. Smallest facade area.",
              detail: "Receives only diffuse sky radiation in N hemisphere — treated as pure heat loss surface.",
            },
            {
              dir: "EAST · MORNING LIGHT", col: SAGE,
              desc: "Moderate glazing (15–20%). Lower sun angles in morning. Glare management important for living spaces. Good for bedrooms, kitchens (morning light use patterns). Vertical fins effective shading.",
              detail: "Morning sun is cooler — east exposure preferred to west in hot climates.",
            },
            {
              dir: "WEST · AFTERNOON HEAT", col: STONE,
              desc: "Minimize glazing in hot climates (5–10%). West sun is the most damaging in summer — low angle, high intensity, late afternoon when building is already hot. Vertical fins, deciduous trees, and external shutters are critical.",
              detail: "West exposure is the primary cause of summer overheating in residential buildings.",
            },
          ].map(f => (
            <div key={f.dir} style={{
              background: `${f.col}09`, border: `1px solid ${f.col}28`,
              borderRadius: 8, padding: "14px 16px",
            }}>
              <div style={{ fontFamily: mono, fontSize: 10, color: f.col, marginBottom: 6 }}>{f.dir}</div>
              <div style={{ fontFamily: body, fontSize: 13, color: TEXT, lineHeight: 1.6, marginBottom: 8 }}>{f.desc}</div>
              <div style={{ fontFamily: body, fontSize: 12, color: DIM, fontStyle: "italic" }}>{f.detail}</div>
            </div>
          ))}
        </div>

        <Card title="FORWARD-FACING WATERPROOFING — RAIN SCREEN PRINCIPLE" col={TEAL}>
          The forward (south) face receives the most direct rainfall in most climates — wind-driven rain
          impacting the facade at low angles requires a different waterproofing strategy than gravity-
          driven roof drainage. The rain screen principle uses a ventilated cavity between the outer
          cladding and the structural wall:
          <EqBlock>{`Rain screen layers (outside → inside):
  1. Outer cladding (aesthetic + primary rain deflection)
  2. Air gap 20–40mm (pressure equalization; capillary break)
  3. Drainage membrane (secondary water catch)
  4. Structural insulation (R-value + vapor control)
  5. Structural wall (load-bearing; fully protected)

Pressure equalization principle:
  If cavity pressure = exterior wind pressure → no driving force for water entry
  Cavity must be ventilated top and bottom (stack effect)
  → water entering top drains to base without reaching structure`}</EqBlock>
        </Card>

        {/* ── V — Materials ── */}
        <SecHead id="s5" n="V" title="Materials · Water Resistance & Solar Response"
          sub="Which materials reflect, absorb, transmit, or repel — and why it matters" />

        <Tbl
          headers={["Material", "Solar Absorptance", "Water Contact Angle", "Thermal Mass", "Application"]}
          accent={STONE}
          rows={[
            ["Polished white marble", "0.10–0.15", "85–90°", "High", "S facade cladding in hot climates; maximum solar reflection"],
            ["Dark gray concrete", "0.65–0.75", "30–50°", "Very high", "Trombe walls; thermal mass absorber — dark color absorbs winter sun"],
            ["Low-e glass (double)", "0.12 SHGC", "Sealed unit", "None", "South glazing — admits solar radiation, limits infrared re-emission"],
            ["Green copper patina", "0.60–0.70", "> 90° (hydrophobic)", "Low", "Roof cladding; self-sealing patina; excellent water repellency at age"],
            ["Standing seam aluminum", "0.20–0.30 (bare)", "70–80°", "Very low", "Lightweight roofing; high reflectance reduces cooling load"],
            ["Lime render / stucco", "0.30–0.50", "50–70°", "Moderate", "Breathable wall finish; capillary action allows drying; repairs itself"],
            ["Terracotta tile", "0.55–0.65", "40–60°", "Moderate-high", "Traditional roof; integral water channels; 100+ year lifespan"],
            ["ETFE (transparent film)", "0.05 (transparent)", "> 100° (superhydrophobic)", "None", "Greenhouse roof panels; self-cleaning; transparent; extremely light"],
          ]}
        />

        <Card title="SUPERHYDROPHOBIC SURFACES" col={VIOLET}>
          Lotus leaf effect: a surface with contact angle &gt; 150° repels water so completely that
          raindrops roll off at angles below 5°, collecting dust and self-cleaning. Engineered
          superhydrophobic coatings (nanostructured silica, fluoropolymer films) achieve contact
          angles of 155–170°, reducing water adhesion to near zero. Applied to south facades,
          these coatings prevent both water ingress and algae growth — a persistent cause of
          solar gain reduction in dark-colored solar-optimized walls.
          <EqBlock>{`Wenzel equation (rough hydrophobic surface):
  cos(θ_apparent) = r × cos(θ_Young)   [r = roughness ratio > 1]
  → rougher surface amplifies contact angle if θ > 90°

Cassie-Baxter state (composite: solid + trapped air):
  cos(θ_CB) = f_solid × cos(θ_Young) + f_air × cos(180°)
  f_air = 1 − f_solid → maximize air fraction for max repellency
  → Lotus leaf: f_air ≈ 0.97 → θ_apparent ≈ 162°`}</EqBlock>
        </Card>

        {/* ── VI — Phi Architecture ── */}
        <SecHead id="s6" n="VI" title="Φ-Architecture · Golden Ratio in Solar Buildings"
          sub="Ancient solar temples to modern passive houses — the golden proportion as structural and solar principle" />

        <p style={{ fontFamily: body, fontSize: 16, lineHeight: 1.8, marginBottom: 20 }}>
          The golden ratio φ = 1.618 appears persistently in the proportions of solar-optimized buildings —
          not because ancient builders were doing mathematics, but because φ arises naturally from the
          geometry of light, shadow, and structural efficiency. A facade proportioned in φ (height : width = 1 : 1.618)
          produces the most efficient overhang-to-window relationship for mid-latitude solar control.
        </p>

        <EqBlock>{`Golden ratio in solar facade proportion:
  Height H : Width W = 1 : φ = 1 : 1.618

Overhang relationship (mid-latitude, summer altitude 65°):
  Overhang D = H/tan(65°) = H/2.14 ≈ H/φ² = H/2.618  ≈ 0.382H
  → in a φ-proportioned facade, the overhang = H × (1/φ²) exactly

Window placement golden section:
  Sill height above floor = floor-to-ceiling height / φ ≈ H × 0.618
  Head height = floor-to-ceiling height × 1.0
  → window occupies golden section of wall from sill to ceiling

Roof pitch at latitude φ × 10° = 16.18°:
  Latitude ≈ 16° (subtropical — Yucatan, southern India)
  → φ × latitude ≈ 26° (temperate — Mediterranean)
  → roof pitch ≈ latitude (rounded) → φ-convergence in temperate zone`}</EqBlock>

        <Card title="ANCIENT SOLAR TEMPLES — PHI AND SOLAR ALIGNMENT" col={VIOLET}>
          The Parthenon (37°N, Athens) is oriented so the rising sun on the spring equinox illuminates
          the inner sanctuary through the east-facing portal — the same sun that appears at 52° altitude
          at noon (latitude 37° + declination 0°). Its facade proportion is φ : 1 within measurement
          error. The Stonehenge sarsen circle is aligned to the summer solstice sunrise at latitude 51°N —
          where the midsummer sun rises at exactly φ × 22° ≈ 36° azimuth from north.
          <br /><br />
          Whether by calculation, empirical iteration, or intuition, builders who oriented structures
          toward solar noon, proportioned facades to control overhang depth, and pitched roofs to shed
          water converged on φ-proportioned geometry as the optimal solution.
        </Card>

        <Tbl
          headers={["Building", "Location", "Orientation", "Phi Element", "Solar Feature"]}
          accent={VIOLET}
          rows={[
            ["Parthenon", "Athens, 37°N", "East-facing sanctuary", "Facade W:H = φ:1", "Equinox sunrise illuminates inner chamber"],
            ["Stonehenge", "Wiltshire, 51°N", "Solstice sunrise axis", "Trilithon spacing ≈ φ×base", "Summer solstice sunrise aligned through heel stone"],
            ["Chartres Cathedral", "France, 48°N", "East-facing nave", "Rose window proportions = φ⁴", "Morning sun enters nave east window at equinox"],
            ["Monticello (Jefferson)", "Virginia, 38°N", "South-facing principal facade", "5-bay facade in φ proportions", "Passive solar; south portico designed for winter sun"],
            ["Taliesin West (F.L. Wright)", "Arizona, 33°N", "Southwest-facing", "All room proportions in φ series", "Desert sun control via canvas roof + deep overhangs"],
            ["Casa Milà (Gaudí)", "Barcelona, 41°N", "South-facing primary facade", "Undulating facade creates variable overhangs", "Catalan natural ventilation + solar masking"],
          ]}
        />

        {/* Footer */}
        <div style={{
          marginTop: 52, padding: "22px 26px",
          background: "#ffffff04", border: `1px solid ${AMBER}18`,
          borderRadius: 10, textAlign: "center",
        }}>
          <div style={{ fontFamily: serif, fontSize: 16, color: AMBER, marginBottom: 8 }}>
            WATER FLOWS DOWN. SUN ARCS OVERHEAD.
          </div>
          <div style={{ fontFamily: body, fontSize: 15, color: DIM, lineHeight: 1.75 }}>
            Every solar-optimized, water-resistant building is a device for intercepting the sun's arc
            and redirecting the sky's water. The same pitch angle that sheds rain in winter admits
            the sun's warmth. The same overhang that cools in summer protects from driving rain.
            The geometry of shelter and the geometry of light are the same geometry.
          </div>
          <div style={{ fontFamily: mono, fontSize: 10, color: `${DIM}80`, marginTop: 12 }}>
            AETHER Built Environment · Shia Miller @StrategicProce · 2026
          </div>
        </div>
      </div>
    </div>
  );
}
