import { useEffect, useRef, useState } from "react";
const mayaTable = "/api/storage/public-objects/IMG_4484_1784409956288.jpeg";
const xPost = "/api/storage/public-objects/IMG_4443_1784409868092.jpeg";
const radialField = "/api/storage/public-objects/IMG_4483_1784409956288.png";
const meshLattice = "/api/storage/public-objects/IMG_4481_1784409956289.png";
/* ── palette ── */
const C = {
  bg:     "#050308",
  deep:   "#0a0610",
  panel:  "#0f0816",
  border: "rgba(180,120,255,0.18)",
  gold:   "#f5c84c",
  violet: "#b07ef8",
  pink:   "#f472b6",
  teal:   "#1fd4c8",
  amber:  "#f59e0b",
  cream:  "#f4f1ea",
  muted:  "#7a6a8a",
  dim:    "#2a1e38",
  text:   "#e8e0f4",
};
const mono  = "'Space Mono', monospace";
const serif = "'Cinzel', serif";
const body  = "'Crimson Pro', Georgia, serif";

/* ── cycle data ── */
const CYCLES = [
  { name: "Menstrual / Lunar",   days: 28,    color: C.pink,   ring: 0, symbol: "☽", body: "biological" },
  { name: "Tzolkin",             days: 260,   color: C.violet, ring: 1, symbol: "✦", body: "sacred" },
  { name: "Venus Synodic",       days: 584,   color: "#fffaaa",ring: 2, symbol: "♀", body: "planetary" },
  { name: "K'awil 819",          days: 819,   color: C.amber,  ring: 3, symbol: "⚡", body: "Jupiter+Saturn" },
  { name: "1080 · 3 Tuns",      days: 1080,  color: C.teal,   ring: 4, symbol: "◎", body: "cosmic" },
  { name: "Venus Great Cycle",   days: 2920,  color: C.gold,   ring: 5, symbol: "☀", body: "solar" },
];

const HARMONICS = [
  { ratio: "Tzolkin ÷ Menstrual",        value: "260 ÷ 28",   result: "≈ 9.28",   note: "≈ 9 cycles — gestation is 9 lunar months" },
  { ratio: "Venus ÷ Menstrual",          value: "584 ÷ 28",   result: "≈ 20.86",  note: "near-harmonic; Venus as fertility messenger" },
  { ratio: "819 ÷ Menstrual",            value: "819 ÷ 28",   result: "≈ 29.25",  note: "≈ 29 complete cycles — a full Jupiter+Saturn arc" },
  { ratio: "1080 ÷ Menstrual",           value: "1080 ÷ 28",  result: "≈ 38.6",   note: "3 Tuns spanning a multi-year fertility window" },
  { ratio: "819 ÷ Tzolkin",             value: "819 ÷ 260",  result: "≈ 3.15",   note: "≈ 3 — the first 3-6-9 operator" },
  { ratio: "1080 ÷ 360 (Tun)",          value: "1080 ÷ 360", result: "= 3",       note: "exact: 3 Tuns, base-3 harmonic key" },
  { ratio: "2920 ÷ Tzolkin",            value: "2920 ÷ 260", result: "≈ 11.23",  note: "≈ 11 — near solar cycle (11 yrs = 4,018 days)" },
  { ratio: "Digital root 1080",         value: "1+0+8+0",    result: "= 9",       note: "1080 resolves to 9 — Tesla's completion digit" },
  { ratio: "Digital root 819",          value: "8+1+9",      result: "= 18 → 9", note: "819 resolves to 9 — same completion axis" },
  { ratio: "Digital root 2920",         value: "2+9+2+0",    result: "= 13 → 4", note: "bridge number: 4 = stability, material form" },
];

const PHASES = [
  { name: "Menstrual",  days: "1–5",   color: C.pink,   desc: "Shedding · renewal · void state · low estrogen",           cosmic: "New Moon · Venus invisible (inferior conjunction)" },
  { name: "Follicular", days: "6–13",  color: C.teal,   desc: "Rising estrogen · growth · morning star emergence",         cosmic: "Waxing Moon · Venus as Morning Star rises" },
  { name: "Ovulation",  days: "14",    color: C.gold,   desc: "LH surge · peak coherence · highest field coupling",        cosmic: "Full Moon · Venus at greatest elongation · maximum brightness" },
  { name: "Luteal",     days: "15–28", color: C.violet, desc: "Progesterone · integration · inward turn · completion",     cosmic: "Waning Moon · Venus descends toward evening star" },
];

/* ── Orbital Clock Canvas ── */
function OrbitalClock() {
  const ref = useRef<HTMLCanvasElement>(null);
  const raf = useRef(0);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d")!;
    const W = 480, H = 480;
    canvas.width = W; canvas.height = H;
    const cx = W / 2, cy = H / 2;
    const PHI = 1.6180339887;

    // Simulation speed: 1 frame = 0.5 days
    const SPEED = 0.5;
    let day = 0;

    // Ring radii
    const baseR = 30;
    const rings = CYCLES.map((c, i) => baseR + 34 * (i + 1));

    function draw() {
      ctx.clearRect(0, 0, W, H);

      // Background radial glow
      const bg = ctx.createRadialGradient(cx, cy, 0, cx, cy, W * 0.55);
      bg.addColorStop(0, "#1a0828");
      bg.addColorStop(1, "#050308");
      ctx.fillStyle = bg;
      ctx.fillRect(0, 0, W, H);

      // Grid rings
      CYCLES.forEach((cyc, i) => {
        const r = rings[i];
        ctx.beginPath();
        ctx.arc(cx, cy, r, 0, Math.PI * 2);
        ctx.strokeStyle = `${cyc.color}25`;
        ctx.lineWidth = 1;
        ctx.stroke();

        // Tick marks — one per cycle
        const ticks = Math.min(cyc.days, 30);
        for (let t = 0; t < ticks; t++) {
          const a = (t / ticks) * Math.PI * 2 - Math.PI / 2;
          const inner = r - 3, outer = r + 3;
          ctx.beginPath();
          ctx.moveTo(cx + Math.cos(a) * inner, cy + Math.sin(a) * inner);
          ctx.lineTo(cx + Math.cos(a) * outer, cy + Math.sin(a) * outer);
          ctx.strokeStyle = `${cyc.color}30`;
          ctx.lineWidth = 0.5;
          ctx.stroke();
        }

        // Cycle label
        const la = -Math.PI / 2 + 0.12 * i;
        ctx.font = `9px ${mono}`;
        ctx.fillStyle = cyc.color + "99";
        ctx.textAlign = "center";
        ctx.fillText(cyc.name.split(" ")[0], cx + Math.cos(la) * (r + 12), cy + Math.sin(la) * (r + 12));
      });

      // Moving dots for each cycle
      CYCLES.forEach((cyc, i) => {
        const r = rings[i];
        const angle = (day / cyc.days) * Math.PI * 2 - Math.PI / 2;
        const px = cx + Math.cos(angle) * r;
        const py = cy + Math.sin(angle) * r;

        // Trail
        for (let t = 1; t <= 8; t++) {
          const ta = ((day - t * 2) / cyc.days) * Math.PI * 2 - Math.PI / 2;
          const tx = cx + Math.cos(ta) * r;
          const ty = cy + Math.sin(ta) * r;
          const alpha = (1 - t / 9) * 0.4;
          ctx.beginPath();
          ctx.arc(tx, ty, 2, 0, Math.PI * 2);
          ctx.fillStyle = cyc.color + Math.round(alpha * 255).toString(16).padStart(2, "0");
          ctx.fill();
        }

        // Main dot with glow
        const gr = ctx.createRadialGradient(px, py, 0, px, py, 8);
        gr.addColorStop(0, cyc.color + "ff");
        gr.addColorStop(1, cyc.color + "00");
        ctx.beginPath();
        ctx.arc(px, py, 8, 0, Math.PI * 2);
        ctx.fillStyle = gr;
        ctx.fill();
        ctx.beginPath();
        ctx.arc(px, py, 3, 0, Math.PI * 2);
        ctx.fillStyle = cyc.color;
        ctx.fill();

        // Symbol
        ctx.font = `11px sans-serif`;
        ctx.fillStyle = cyc.color;
        ctx.textAlign = "center";
        ctx.fillText(cyc.symbol, px, py - 10);
      });

      // Central Earth / Observer
      const pulse = 1 + 0.08 * Math.sin(day * 0.3);
      const cg = ctx.createRadialGradient(cx, cy, 0, cx, cy, 20 * pulse);
      cg.addColorStop(0, "#ffffffee");
      cg.addColorStop(0.3, C.teal + "99");
      cg.addColorStop(1, C.teal + "00");
      ctx.beginPath();
      ctx.arc(cx, cy, 20 * pulse, 0, Math.PI * 2);
      ctx.fillStyle = cg;
      ctx.fill();
      ctx.font = `bold 9px ${mono}`;
      ctx.fillStyle = "#0a0610";
      ctx.textAlign = "center";
      ctx.fillText("EARTH", cx, cy + 3);

      // Day counter
      ctx.font = `10px ${mono}`;
      ctx.fillStyle = C.gold + "99";
      ctx.fillText(`Day ${Math.floor(day)}`, cx, H - 10);

      // 3-6-9 resonance flash
      const mod9 = Math.floor(day) % 9;
      if (mod9 === 0 || mod9 === 3 || mod9 === 6) {
        const flash = 0.3 * Math.sin(day * 8);
        if (flash > 0) {
          ctx.beginPath();
          ctx.arc(cx, cy, 200 + flash * 20, 0, Math.PI * 2);
          ctx.strokeStyle = `rgba(245,200,76,${flash * 0.12})`;
          ctx.lineWidth = flash * 15;
          ctx.stroke();
        }
      }

      ctx.textAlign = "left";
      day += SPEED;
      if (day > 2920) day = 0;
      raf.current = requestAnimationFrame(draw);
    }
    draw();
    return () => cancelAnimationFrame(raf.current);
  }, []);

  return <canvas ref={ref} style={{ display: "block", width: "100%", height: "auto", borderRadius: 10 }} />;
}

/* ── helpers ── */
function Eq({ children }: { children: string }) {
  return (
    <div style={{
      fontFamily: mono, fontSize: 12, color: C.gold,
      background: "#0f0818", border: `1px solid ${C.gold}25`,
      borderRadius: 6, padding: "12px 18px", margin: "10px 0",
      overflowX: "auto", whiteSpace: "pre",
    }}>{children}</div>
  );
}

function SecHead({ n, title, sub, color = C.violet }: { n: string; title: string; sub: string; color?: string }) {
  return (
    <div style={{ marginTop: 60, scrollMarginTop: 80 }}>
      <div style={{ fontFamily: mono, fontSize: 10, color, letterSpacing: 3, marginBottom: 6 }}>{n}</div>
      <h2 style={{ fontFamily: serif, fontSize: 24, color: "#fff", margin: "0 0 6px" }}>{title}</h2>
      <div style={{ fontFamily: body, fontSize: 15, color: C.muted, marginBottom: 20 }}>{sub}</div>
    </div>
  );
}

function ImgPlate({ src, title, anno }: { src: string; title: string; anno: string }) {
  return (
    <div style={{
      background: C.panel, border: `1px solid ${C.border}`,
      borderRadius: 10, overflow: "hidden",
    }}>
      <img src={src} alt={title} style={{ width: "100%", display: "block", maxHeight: 360, objectFit: "cover" }} />
      <div style={{ padding: "12px 16px" }}>
        <div style={{ fontFamily: mono, fontSize: 10, color: C.violet, letterSpacing: 2, marginBottom: 4 }}>{title}</div>
        <div style={{ fontSize: 12, color: C.muted, lineHeight: 1.6 }}>{anno}</div>
      </div>
    </div>
  );
}

/* ── Page ── */
export default function VenusCyclesPage() {
  const [hovRow, setHovRow] = useState<number | null>(null);

  return (
    <div style={{ background: C.bg, minHeight: "100vh", color: C.text, fontFamily: body, paddingBottom: 100 }}>

      {/* ── Hero ── */}
      <div style={{
        background: `radial-gradient(ellipse 80% 55% at 50% 0%, ${C.violet}14 0%, ${C.pink}08 40%, transparent 70%)`,
        borderBottom: `1px solid ${C.border}`,
        padding: "72px 24px 52px",
        textAlign: "center",
      }}>
        <div style={{ fontFamily: mono, fontSize: 10, color: C.violet, letterSpacing: 4, marginBottom: 14 }}>
          AETHER · COSMIC CYCLES · HUMAN BIOLOGY
        </div>
        <h1 style={{
          fontFamily: serif, fontSize: "clamp(26px, 5vw, 50px)",
          color: "#fff", margin: "0 0 16px", lineHeight: 1.15,
        }}>
          Venus, 819, and the Women of Earth
        </h1>
        <p style={{ fontSize: 17, color: C.muted, maxWidth: 620, margin: "0 auto 28px", lineHeight: 1.75 }}>
          The Sun-Venus cycle (584 days), the K'awil 819-day Jupiter-Saturn super-number, and the Maya 1080-day
          Tun harmonic — all encode a 3-6-9 time gap that resonates directly with the human body, especially
          women's biological cycles.
        </p>
        <div style={{
          display: "inline-block",
          background: `${C.gold}12`, border: `1px solid ${C.gold}40`,
          borderRadius: 8, padding: "12px 26px",
          fontFamily: mono, fontSize: 12, color: C.gold, lineHeight: 1.6,
        }}>
          "I feel like there's a 3,6,9 time gap for wet curved light"
          <div style={{ fontSize: 10, color: C.muted, marginTop: 4 }}>@StrategicProce · X · 1:30 AM · 7/17/26</div>
        </div>
      </div>

      {/* ── Body ── */}
      <div style={{ maxWidth: 900, margin: "0 auto", padding: "0 22px" }}>

        {/* ── Orbital Clock ── */}
        <SecHead
          n="§ I · THE LIVING CLOCK"
          title="All Cycles Simultaneously"
          sub="Six cosmic and biological cycles shown as concentric orbital rings. Each dot moves at its actual relative rate. Watch for resonance moments when multiple dots align."
          color={C.violet}
        />
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20, alignItems: "start" }}>
          <div style={{
            background: C.deep, border: `1px solid ${C.border}`,
            borderRadius: 12, overflow: "hidden", padding: 10,
          }}>
            <OrbitalClock />
          </div>
          <div>
            {CYCLES.map((cyc, i) => (
              <div key={i} style={{
                display: "flex", alignItems: "center", gap: 12,
                padding: "11px 14px",
                borderBottom: i < CYCLES.length - 1 ? `1px solid ${C.dim}` : "none",
                background: C.panel, borderRadius: i === 0 ? "8px 8px 0 0" : i === CYCLES.length - 1 ? "0 0 8px 8px" : 0,
              }}>
                <span style={{ fontSize: 16, minWidth: 22, textAlign: "center" }}>{cyc.symbol}</span>
                <div style={{ flex: 1 }}>
                  <div style={{ fontFamily: serif, fontSize: 13, color: cyc.color }}>{cyc.name}</div>
                  <div style={{ fontFamily: mono, fontSize: 10, color: C.muted }}>{cyc.days} days · {cyc.body}</div>
                </div>
                <div style={{
                  fontFamily: mono, fontSize: 10, color: cyc.color,
                  background: `${cyc.color}15`, border: `1px solid ${cyc.color}30`,
                  borderRadius: 4, padding: "2px 8px",
                }}>{cyc.days}d</div>
              </div>
            ))}
          </div>
        </div>

        {/* ── 819 K'awil ── */}
        <SecHead
          n="§ II · THE 819-DAY K'AWIL CYCLE"
          title="The True Maya Super-Number"
          sub="How the Maya derived 819 from the 189-day Saturn half-period — and how inscriptions ca. 781 CE proved it via simultaneous even-multiple completions."
          color={C.amber}
        />

        {/* 189 origin story */}
        <div style={{
          background: `${C.amber}0c`, border: `1px solid ${C.amber}35`,
          borderRadius: 10, padding: "20px 24px", marginBottom: 20,
        }}>
          <div style={{ fontFamily: mono, fontSize: 9, color: C.amber, letterSpacing: 3, marginBottom: 12 }}>
            THE 189-DAY SUB-CYCLE · WHERE 819 COMES FROM
          </div>
          <p style={{ fontSize: 14, lineHeight: 1.8, color: C.text, margin: "0 0 12px" }}>
            The Maya began with Saturn — the slowest, most regular of the visible planets.
            Its synodic period (conjunction to conjunction) is <strong style={{ color: C.amber }}>378 days</strong>.
            The half-period — the point exactly between two conjunctions, when Saturn transitions from
            evening star to morning star — is <strong style={{ color: C.amber }}>189 days</strong>.
            This 189-day transition was the anchor. Centuries of observation established it precisely.
          </p>
          <p style={{ fontSize: 14, lineHeight: 1.8, color: C.text, margin: 0 }}>
            From 189 they looked for the number that would simultaneously commensure Mercury (117d),
            Venus (585d), and Mars (780d). The answer: <strong style={{ color: C.gold }}>819 × 20 = 16,380</strong>.
            The multiplier 20 is their own number base — one vigesimal unit.
            819 = 7 × 117 (exactly 7 Mercury periods). That one insight seeded the whole system.
          </p>
        </div>

        {/* Discovery path */}
        <div style={{ display: "flex", flexDirection: "column", gap: 0, marginBottom: 20 }}>
          {[
            { n: "01", col: C.muted,  label: "Observe Saturn",            body: "Centuries of naked-eye records establish Saturn synodic = 378 days. Half-period = 189 days (morning/evening star transition). 189 = 9 × 21 = 3³ × 7." },
            { n: "02", col: C.amber,  label: "Key insight: 7 × Mercury",   body: "Mercury synodic = 117 days. 7 × 117 = 819 exactly. K'awil cycle = 7 Mercury periods. The number 7 is sacred in Maya cosmology (7 creation gods, 7 layers of sky)." },
            { n: "03", col: "#fffaaa",label: "Scale by 20 (their base)",   body: "819 × 20 = 16,380 days. Apply Maya vigesimal scaling (their 'one complete count'). Test against Venus (585d) and Mars (780d)." },
            { n: "04", col: C.teal,   label: "Exact even multiples proven", body: "16,380 ÷ 117 = 140 Mercury (exact). 16,380 ÷ 585 = 28 Venus (exact). 16,380 ÷ 780 = 21 Mars (exact). Three inner planets align simultaneously in whole numbers." },
            { n: "05", col: C.gold,   label: "781 CE inscription confirms", body: "Ca. 781 CE — approximately 100 years after the 819-day K'awil count entered the inscription record (first use ~681 CE, Palenque) — a Classic-period inscription records 45 × 819 = 36,855 days elapsed: Mercury completes 315 cycles (exact), Venus completes 63 cycles (exact). Final days of the super-period, proven in stone." },
          ].map((s, i) => (
            <div key={i} style={{ display: "flex", alignItems: "stretch", gap: 0 }}>
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                <div style={{
                  width: 32, height: 32, borderRadius: "50%", flexShrink: 0,
                  background: `${s.col}20`, border: `2px solid ${s.col}60`,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontFamily: mono, fontSize: 9, color: s.col,
                }}>{s.n}</div>
                {i < 4 && <div style={{ width: 2, flex: 1, background: C.dim, margin: "2px 0" }} />}
              </div>
              <div style={{ padding: "2px 0 16px 14px", flex: 1 }}>
                <div style={{ fontFamily: serif, fontSize: 14, color: s.col, marginBottom: 4 }}>{s.label}</div>
                <div style={{ fontSize: 13, color: C.muted, lineHeight: 1.7 }}>{s.body}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Even multiples proof table */}
        <div style={{
          background: C.deep, border: `1px solid ${C.border}`,
          borderRadius: 12, overflow: "hidden", marginBottom: 20,
        }}>
          <div style={{
            display: "grid", gridTemplateColumns: "90px 80px 90px 90px 1fr",
            background: C.panel, padding: "9px 16px",
            borderBottom: `1px solid ${C.border}`,
            fontFamily: mono, fontSize: 9, color: C.muted, letterSpacing: 2,
          }}>
            <span>PLANET</span><span>SYNODIC</span><span>16,380 ÷</span><span>RESULT</span><span>EXACTNESS</span>
          </div>
          {[
            { planet: "Mercury", syn: "117d",  div: "16,380÷117", res: "= 140", exact: true,  note: "Exact integer — 140 complete Mercury periods" },
            { planet: "Venus",   syn: "585d",  div: "16,380÷585", res: "= 28",  exact: true,  note: "Exact integer — 28 complete Venus periods" },
            { planet: "Mars",    syn: "780d",  div: "16,380÷780", res: "= 21",  exact: true,  note: "Exact integer — 21 complete Mars periods" },
            { planet: "Jupiter", syn: "399d",  div: "16,380÷399", res: "≈ 41.05",exact: false, note: "Near-integer — 41 complete + 0.05 error" },
            { planet: "Saturn",  syn: "378d",  div: "16,380÷378", res: "≈ 43.33",exact: false, note: "Near-integer (189 × 2 = 378; 819 = 189 × 13/3)" },
          ].map((r, i) => (
            <div key={i} style={{
              display: "grid", gridTemplateColumns: "90px 80px 90px 90px 1fr",
              padding: "11px 16px",
              borderBottom: i < 4 ? `1px solid ${C.dim}` : "none",
              background: r.exact ? `${C.teal}08` : "transparent",
            }}>
              <div style={{ fontFamily: serif, fontSize: 13, color: r.exact ? C.gold : C.muted }}>{r.planet}</div>
              <div style={{ fontFamily: mono, fontSize: 11, color: C.muted }}>{r.syn}</div>
              <div style={{ fontFamily: mono, fontSize: 11, color: C.muted }}>{r.div}</div>
              <div style={{
                fontFamily: mono, fontSize: 13,
                color: r.exact ? C.teal : C.muted,
                fontWeight: r.exact ? "bold" : "normal",
              }}>{r.res}</div>
              <div style={{ fontSize: 12, color: C.muted, lineHeight: 1.5 }}>
                {r.exact && <span style={{
                  display: "inline-block", background: `${C.teal}20`, color: C.teal,
                  fontFamily: mono, fontSize: 9, padding: "1px 6px", borderRadius: 4, marginRight: 8,
                }}>EXACT</span>}
                {r.note}
              </div>
            </div>
          ))}
        </div>

        {/* 781 CE anchor + 45-cycle proof */}
        <div style={{
          display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 20,
        }}>
          <div style={{
            background: C.panel, border: `1px solid ${C.amber}30`,
            borderRadius: 8, padding: "16px 18px",
          }}>
            <div style={{ fontFamily: mono, fontSize: 9, color: C.amber, letterSpacing: 2, marginBottom: 8 }}>
              781 CE · THE INSCRIPTION ANCHOR
            </div>
            <p style={{ fontSize: 13, lineHeight: 1.7, color: C.text, margin: 0 }}>
              The 819-day K'awil count first appears in the inscriptional record ca. <strong style={{ color: C.amber }}>681 CE</strong> (Classic Maya, Palenque region). Approximately 100 years later — ca. <strong style={{ color: C.amber }}>781 CE</strong> — accumulated counts at multiple sites reach <strong style={{ color: C.gold }}>45 × 819 = 36,855 days</strong>. At this exact count: Mercury has completed <strong style={{ color: C.teal }}>315 cycles</strong> and Venus has completed <strong style={{ color: C.teal }}>63 cycles</strong> — both exact integers from the epoch start. These are the "final days" — period-ending markers recorded in stone.
            </p>
          </div>
          <div style={{
            background: C.panel, border: `1px solid ${C.violet}30`,
            borderRadius: 8, padding: "16px 18px",
          }}>
            <div style={{ fontFamily: mono, fontSize: 9, color: C.violet, letterSpacing: 2, marginBottom: 8 }}>
              189 · THE SATURN HALF-PERIOD BRIDGE
            </div>
            <p style={{ fontSize: 13, lineHeight: 1.7, color: C.text, margin: "0 0 10px" }}>
              189 days is Saturn split at the transition point. 200 × 189 = 37,800 days = exactly <strong style={{ color: C.gold }}>100 complete Saturn synodic periods</strong> (100 × 378 = 37,800). From 681 CE, 37,800 days ≈ 781 CE. The same anchor date encodes a perfect Saturn century — 100 Saturn cycles from the K'awil epoch, in even multiples.
            </p>
            <div style={{ fontFamily: mono, fontSize: 11, color: C.violet }}>
              189 × 2 = 378 = Saturn<br />
              189 × 13/3 = 819 = K'awil<br />
              819 = 9 × 7 × 13 (Tzolkin units)
            </div>
          </div>
        </div>

        <Eq>{"DERIVATION PATH:\n  Saturn half-period:  189 = 378 ÷ 2\n  Mercury insight:     819 = 7 × 117  (exact — 7 Mercury synodic periods)\n  Vigesimal scale:     16,380 = 819 × 20\n\nEVEN MULTIPLES AT 16,380 (inner three planets, exact):\n  Mercury:  16,380 ÷ 117 = 140   ← exact integer\n  Venus:    16,380 ÷ 585 = 28    ← exact integer\n  Mars:     16,380 ÷ 780 = 21    ← exact integer\n\n781 CE PROOF (45 × 819 = 36,855 days from ~681 CE):\n  Mercury:  36,855 ÷ 117 = 315   ← exact integer\n  Venus:    36,855 ÷ 585 = 63    ← exact integer\n  Saturn:   37,800 ÷ 378 = 100   ← exactly 100 Saturn cycles (200 × 189d)\n\n819 factored:  9 × 7 × 13  (sacred triad: completion × creation × Tzolkin-months)\nDigital root:  8+1+9 = 18 → 9  (Tesla completion digit)"}</Eq>

        {/* ── Venus 584 ── */}
        <SecHead
          n="§ III · VENUS 584 · THE FEMININE MESSENGER"
          title="The Dresden Codex and the Great Venus Cycle"
          sub="The Maya tracked Venus with stunning precision — 584.0 days vs modern 583.92 days. 5 Venus cycles = 8 solar years = exact reset."
          color="#fffaaa"
        />
        <p style={{ fontSize: 15, lineHeight: 1.8, color: C.muted, marginBottom: 16 }}>
          Venus has been mythologically linked to fertility, love, and feminine power across every major civilisation —
          Inanna/Ishtar (Sumerian), Aphrodite (Greek), and the Maya goddess Ix Chel who governed weaving, medicine,
          and childbirth. The mathematical reason is precise: Venus's cycle creates near-harmonics with the menstrual
          cycle and the gestation period that are too close to be coincidental.
        </p>
        <Eq>{"5 Venus synodic cycles  = 5 × 584 = 2,920 days\n8 Haab solar years      = 8 × 365 = 2,920 days  ← perfect reset\n13 Tzolkin cycles       = 13 × 260 = 3,380 days\n\nVenus ÷ Menstrual: 584 ÷ 28 ≈ 20.86 (near-harmonic)\nVenus ÷ Gestation: 584 ÷ 266 ≈ 2.195 ≈ 2 (near-double)"}</Eq>

        {/* ── 1080 / 3-6-9 ── */}
        <SecHead
          n="§ IV · 1080 DAYS · 3-6-9 AND WET CURVED LIGHT"
          title="The Harmonic Bridge"
          sub="1080 = 3 Tuns (3 × 360 days). Digital root = 9. The base-3 harmonic key linking cosmic, biological, and quantum scales."
          color={C.teal}
        />
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 14, marginBottom: 20 }}>
          {[
            { n: "3", c: C.teal,   d: "Trimesters in pregnancy (3×90 days). Follicular/ovulatory/luteal phases. 1080 = 3 Tuns." },
            { n: "6", c: C.violet, d: "6 × 28 ≈ 168 days — half-year bio-rhythm. 6 Tzolkin cycles = 1,560 days ≈ 2 Mars synodic." },
            { n: "9", c: C.pink,   d: "9 months gestation. Digital root of 1080, 819, and 2,916 all reduce to 9. Tesla's completion digit." },
          ].map(x => (
            <div key={x.n} style={{
              background: `${x.c}12`, border: `1px solid ${x.c}40`,
              borderRadius: 10, padding: "18px 16px", textAlign: "center",
            }}>
              <div style={{ fontFamily: serif, fontSize: 36, color: x.c, marginBottom: 8 }}>{x.n}</div>
              <div style={{ fontSize: 12, color: C.muted, lineHeight: 1.6 }}>{x.d}</div>
            </div>
          ))}
        </div>
        <div style={{
          background: `${C.teal}0e`, border: `1px solid ${C.teal}35`,
          borderRadius: 10, padding: "20px 24px", marginBottom: 20,
        }}>
          <div style={{ fontFamily: mono, fontSize: 10, color: C.teal, letterSpacing: 2, marginBottom: 10 }}>WET CURVED LIGHT</div>
          <p style={{ fontSize: 15, lineHeight: 1.8, color: C.text, margin: 0 }}>
            "Wet curved light" is light refracted and bent through bodily fluids — blood, amniotic fluid, cellular water,
            vitreous humor. Just as Venus is observed as a curved-light phenomenon (atmospheric bending at heliacal rising),
            the body receives planetary light through its own water medium. The pineal gland processes this signal —
            light → melatonin → GnRH pulses → LH surge → ovulation. The 3-6-9 time gap describes the
            <em style={{ color: C.teal }}> phase delay</em> introduced by this wet optical medium: the body doesn't
            register the cosmic cycle immediately — it integrates, curves, and re-emits it with a harmonic lag.
          </p>
        </div>
        <Eq>{"T_res = 1080 × 3^k × m\n  k = 3-6-9 vortex index (k=0 → 1080d; k=1 → 3,240d; k=2 → 9,720d)\n  m = Venus-Sun alignment factor (near 584/2920 ratios)\n\nHighest-coherence condition:\n  Δt ≈ n × 584   AND   digital_root(Δt) ∈ {3, 6, 9}   AND   Δt mod 1080 ≈ 0"}</Eq>

        {/* ── Women's Biology ── */}
        <SecHead
          n="§ V · THE BODY AS TOPOLOGICAL BRIDGE"
          title="Women's Cycles as Biological Logical Covers"
          sub="The menstrual cycle is not incidental to the cosmos — it is a biological computation running the same resonant commensurability algorithm as the Maya calendar."
          color={C.pink}
        />
        <p style={{ fontSize: 15, lineHeight: 1.8, color: C.muted, marginBottom: 20 }}>
          In the GUF framework, a "logical cover" is a system that contains and orders the transitions of a higher-dimensional
          field. Women's hormonal cycle is exactly this — a 28-day closed orbit through a 26-dimensional manifold
          (one axis per hormone: GnRH → estrogen → LH → progesterone → FSH → cortisol → oxytocin...) that is
          <em style={{ color: C.text }}> entrained to solar, lunar, and Venus light</em> via the pineal→hypothalamus→pituitary axis.
        </p>

        {/* Phase table */}
        <div style={{
          background: C.deep, border: `1px solid ${C.border}`,
          borderRadius: 12, overflow: "hidden", marginBottom: 20,
        }}>
          <div style={{
            display: "grid", gridTemplateColumns: "110px 1fr 1fr",
            background: C.panel, padding: "10px 18px",
            borderBottom: `1px solid ${C.border}`,
            fontFamily: mono, fontSize: 9, color: C.muted, letterSpacing: 2,
          }}>
            <span>PHASE</span><span>BIOLOGICAL STATE</span><span>COSMIC CORRELATION</span>
          </div>
          {PHASES.map((ph, i) => (
            <div
              key={i}
              onMouseEnter={() => setHovRow(i)}
              onMouseLeave={() => setHovRow(null)}
              style={{
                display: "grid", gridTemplateColumns: "110px 1fr 1fr",
                padding: "14px 18px",
                borderBottom: i < PHASES.length - 1 ? `1px solid ${C.dim}` : "none",
                background: hovRow === i ? `${ph.color}10` : "transparent",
                transition: "background 0.2s", cursor: "default",
              }}
            >
              <div>
                <div style={{ fontFamily: serif, fontSize: 13, color: ph.color }}>{ph.name}</div>
                <div style={{ fontFamily: mono, fontSize: 9, color: C.muted }}>Days {ph.days}</div>
              </div>
              <div style={{ fontSize: 12, color: C.text, lineHeight: 1.6, paddingRight: 12 }}>{ph.desc}</div>
              <div style={{ fontSize: 12, color: C.muted, lineHeight: 1.6 }}>{ph.cosmic}</div>
            </div>
          ))}
        </div>

        {/* Unified formula */}
        <Eq>{"T_human = 28×l ≈ 260×p ≈ 1080×q×3^k\n  l  = lunar/menstrual cycle multiples\n  p  = Tzolkin sacred calendar phases (260 ÷ 28 ≈ 9.28 cycles)\n  q  = Tun-scale meta-cycles (1080 ÷ 28 ≈ 38.5 cycles)\n  k  = 3-6-9 ascension operator\n\nPeak coherence node:\n  Ovulation aligns with Venus elongation + Full Moon\n  → highest hormonal amplitude + maximum curved-light input\n  → topological queuing of highest-order pair (creation/renewal)"}</Eq>

        {/* ── Harmonic Table ── */}
        <SecHead
          n="§ VI · HARMONIC RATIOS"
          title="The Number Relationships"
          sub="Every major cycle resonates with every other through simple integer ratios — this is the mathematical basis for why women's bodies are synchronized to planetary time."
          color={C.gold}
        />
        <div style={{
          background: C.deep, border: `1px solid ${C.border}`,
          borderRadius: 12, overflow: "hidden",
        }}>
          <div style={{
            display: "grid", gridTemplateColumns: "1fr 120px 80px 1fr",
            background: C.panel, padding: "10px 18px",
            borderBottom: `1px solid ${C.border}`,
            fontFamily: mono, fontSize: 9, color: C.muted, letterSpacing: 2,
          }}>
            <span>RATIO</span><span>CALCULATION</span><span>RESULT</span><span>SIGNIFICANCE</span>
          </div>
          {HARMONICS.map((h, i) => (
            <div key={i} style={{
              display: "grid", gridTemplateColumns: "1fr 120px 80px 1fr",
              padding: "12px 18px",
              borderBottom: i < HARMONICS.length - 1 ? `1px solid ${C.dim}` : "none",
            }}>
              <div style={{ fontSize: 13, color: C.text }}>{h.ratio}</div>
              <div style={{ fontFamily: mono, fontSize: 11, color: C.muted }}>{h.value}</div>
              <div style={{ fontFamily: mono, fontSize: 12, color: C.gold }}>{h.result}</div>
              <div style={{ fontSize: 12, color: C.muted, lineHeight: 1.5 }}>{h.note}</div>
            </div>
          ))}
        </div>

        {/* ── Light path ── */}
        <SecHead
          n="§ VII · THE LIGHT PATH"
          title="Sun → Venus → Earth → Body"
          sub="The exact mechanism by which cosmic cycles enter the biological system."
          color={C.violet}
        />
        <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
          {[
            { step: "01", label: "Solar irradiance",    color: C.gold,   desc: "Sun outputs full-spectrum light. Venus reflects this as curved, refracted morning/evening star light — atmospheric bending at heliacal rise is the original 'wet curved light.'" },
            { step: "02", label: "Retinal reception",   color: "#fffaaa",desc: "ipRGC cells (intrinsically photosensitive retinal ganglion cells) detect Venus/lunar light specifically — these are not standard rods/cones. They feed the suprachiasmatic nucleus (SCN) directly." },
            { step: "03", label: "Pineal transduction", color: C.violet, desc: "SCN → pineal gland → melatonin. Nightly melatonin peak is the body's cosmic clock-tick. More darkness = more melatonin = slower GnRH pulses = lower reproductive drive (winter)." },
            { step: "04", label: "Hormonal cascade",    color: C.pink,   desc: "GnRH → LH/FSH surge → estrogen → ovulation. The 28-day cycle IS the body's measurement of the Moon's darkness/light ratio. Cycle length = the body's sundial running at lunar timescale." },
            { step: "05", label: "Cellular water",      color: C.teal,   desc: "At peak coherence (ovulation), cellular water content peaks. Water in tissues, blood, and cervical fluid acts as the wet medium — light-carrying, cymatics-like coherence patterns emerge in biological fluids." },
            { step: "06", label: "Field coupling",      color: C.violet, desc: "The body's bioelectromagnetic field couples to the geomagnetic field, which fluctuates with solar/Venus/Jupiter cycles. Ring band 401–500 in the GUF — the consciousness field — interfaces directly at this step." },
          ].map((s, i) => (
            <div key={i} style={{ display: "flex", alignItems: "stretch", gap: 0 }}>
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                <div style={{
                  width: 36, height: 36, borderRadius: "50%", flexShrink: 0,
                  background: `${s.color}20`, border: `2px solid ${s.color}60`,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontFamily: mono, fontSize: 9, color: s.color,
                }}>{s.step}</div>
                {i < 5 && <div style={{ width: 2, flex: 1, background: C.dim, margin: "2px 0" }} />}
              </div>
              <div style={{ padding: "4px 0 18px 16px", flex: 1 }}>
                <div style={{ fontFamily: serif, fontSize: 14, color: s.color, marginBottom: 4 }}>{s.label}</div>
                <div style={{ fontSize: 13, color: C.muted, lineHeight: 1.7 }}>{s.desc}</div>
              </div>
            </div>
          ))}
        </div>

        {/* ── Image plates ── */}
        <SecHead
          n="§ VIII · SOURCE PLATES"
          title="Reference Materials"
          sub="Maya inscriptions, original synthesis, and geometric field models."
          color={C.muted}
        />
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
          <ImgPlate
            src={mayaTable}
            title="CAMBRIDGE MAYA INSCRIPTION · C6"
            anno="Dresden Codex distance number C6 = 1080 days = 3-HAAB = 3 Tuns of 360 days. The exact 3-6-9 base-3 harmonic in carved stone."
          />
          <ImgPlate
            src={xPost}
            title="@STRATEGICPROCE · X · 7/17/26"
            anno={"\"I feel like there's a 3,6,9 time gap for wet curved light.\" The original insight that seeds this synthesis."}
          />
          <ImgPlate
            src={radialField}
            title="RADIAL FIELD EMITTER"
            anno="Toothpick radial array through a bolt — a physical model of radial field emission from a central node. Mirrors the orbital clock: one axis, many spokes, all at harmonic angles."
          />
          <ImgPlate
            src={meshLattice}
            title="GEOMETRIC LATTICE · @STRATEGICPROCE"
            anno="Mesh deforming from vertex (left) to grid (right) — the transition from high-curvature vortex topology to flat material structure. This is exactly what the dimensional compiler produces."
          />
        </div>

        {/* ── Synthesis ── */}
        <div style={{
          marginTop: 60,
          background: `linear-gradient(135deg, ${C.violet}10 0%, ${C.pink}08 100%)`,
          border: `1px solid ${C.violet}40`,
          borderRadius: 14, padding: "36px 40px", textAlign: "center",
        }}>
          <div style={{ fontFamily: mono, fontSize: 9, color: C.muted, letterSpacing: 3, marginBottom: 16 }}>
            THE SYNTHESIS
          </div>
          <p style={{ fontFamily: serif, fontSize: "clamp(16px, 2.5vw, 22px)", color: "#fff", lineHeight: 1.6, margin: "0 0 16px" }}>
            Women's bodies are not merely influenced by cosmic cycles.
          </p>
          <p style={{ fontFamily: serif, fontSize: "clamp(16px, 2.5vw, 22px)", color: C.pink, lineHeight: 1.6, margin: 0 }}>
            They are the cosmic cycles made biological.
          </p>
          <p style={{ fontSize: 14, color: C.muted, maxWidth: 560, margin: "20px auto 0", lineHeight: 1.8 }}>
            The 28-day menstrual orbit, the 260-day gestation arc, the 584-day Venus resonance, the 819-day
            planetary super-number, and the 1080-day meta-cycle are all expressions of the same 3-6-9 harmonic
            structure — running simultaneously at cellular, organismal, and planetary scale.
            The body is the instrument. Wet curved light is the carrier. The 3-6-9 time gap is the tuning key.
          </p>
        </div>

        {/* ── footer links ── */}
        <div style={{
          marginTop: 48, paddingTop: 28,
          borderTop: `1px solid ${C.dim}`,
          display: "flex", flexWrap: "wrap", gap: 10,
        }}>
          {[
            { href: "/solar-feminine",       label: "→ Solar Feminine" },
            { href: "/womens-coherence-map", label: "→ Women's Coherence Map" },
            { href: "/maya-quarks-dna-gfp",  label: "→ Maya · Quarks · DNA · GFP" },
            { href: "/phi-time",             label: "→ Phi-Time" },
            { href: "/tidal-movement",       label: "→ Tidal Movement" },
            { href: "/dimensional-compiler", label: "→ Dimensional Compiler" },
          ].map(l => (
            <a key={l.href} href={l.href} style={{
              fontFamily: mono, fontSize: 11, color: C.violet,
              background: `${C.violet}10`, border: `1px solid ${C.violet}30`,
              borderRadius: 6, padding: "6px 14px", textDecoration: "none",
            }}>{l.label}</a>
          ))}
        </div>
      </div>
    </div>
  );
}
