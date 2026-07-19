/*═══════════════════════════════════════════════════════════════════
  The Pineal–Eye Cosmic Map
  Pineal gland + iris eye circumference as biological field transducers
  mapping to: Solar · Geomagnetic · Connective · Coherence ·
              EM Spectrum · Dark Matter · Brain Matter

  The pineal gland is phylogenetically an eye — it contains:
    • Magnetite crystals → geomagnetic coupling
    • Opsin photoreceptors → solar/UV sensing
    • Calcite piezo microcrystals → EM transduction
    • DMT biosynthesis → "dark matter" of consciousness

  The iris circumference encodes 200+ heritable genetic parameters
  — a biological field map of the individual's coherence signature.
  Together pineal + iris = the human antenna system for the full
  ontological spectrum: visible ↔ dark matter, local ↔ cosmic.
═══════════════════════════════════════════════════════════════════*/
import { useRef, useEffect, useState } from "react";

const P = {
  bg: "#04060e", panel: "#090c18", panel2: "#0d1022",
  gold: "#f5c84c", ivory: "#f4f1ea", dim: "rgba(244,241,234,0.5)",
  line: "rgba(100,120,255,0.09)", cyan: "#4fe8e8", purple: "#c084fc",
  blue: "#60a5fa", teal: "#2dd4bf", green: "#34d399",
  orange: "#fb923c", rose: "#fb7185", amber: "#fbbf24",
  muted: "rgba(244,241,234,0.28)", indigo: "#818cf8",
};

function Sec({ id, children }: { id?: string; children: React.ReactNode }) {
  return (
    <section id={id} style={{ borderTop: `1px solid ${P.line}`, padding: "52px 0" }}>
      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "0 32px" }}>{children}</div>
    </section>
  );
}
function Tag({ label, color = P.cyan }: { label: string; color?: string }) {
  return <span style={{ fontSize: 10, fontWeight: 700, color, letterSpacing: 1.5, textTransform: "uppercase" as const }}>{label}</span>;
}
function Card({ title, body, color = P.cyan, sub }: { title: string; body: string; color?: string; sub?: string }) {
  return (
    <div style={{ padding: "14px 16px", background: P.panel, borderRadius: 10, border: `1px solid ${color}1a` }}>
      {sub && <div style={{ fontSize: 9, color, letterSpacing: 1.2, marginBottom: 4, textTransform: "uppercase" as const }}>{sub}</div>}
      <div style={{ fontSize: 11, fontWeight: 700, color, letterSpacing: 0.5, marginBottom: 7, textTransform: "uppercase" as const }}>{title}</div>
      <div style={{ fontSize: 12, color: P.dim, lineHeight: 1.85 }}>{body}</div>
    </div>
  );
}
function EqBlock({ label, eq, note, color = P.cyan }: { label: string; eq: string; note?: string; color?: string }) {
  return (
    <div style={{ padding: "11px 15px", background: P.panel2, borderRadius: 8, border: `1px solid ${color}20`, marginBottom: 9 }}>
      <div style={{ fontSize: 9, color: P.muted, marginBottom: 3, letterSpacing: 1 }}>{label}</div>
      <div style={{ fontSize: 13, fontFamily: "monospace", color, lineHeight: 1.7, whiteSpace: "pre-wrap" as const }}>{eq}</div>
      {note && <div style={{ fontSize: 11, color: P.dim, marginTop: 5, lineHeight: 1.7 }}>{note}</div>}
    </div>
  );
}

/* ════════════════════════════════════════════════════════════════
   CANVAS 1 — Pineal Cosmic Transducer
   Central pineal sphere with:
   - Magnetite particle field (aligning to geomagnetic vector B)
   - Solar photon rain from above (visible + UV)
   - Schumann resonance field rings (7.83 Hz)
   - DMT pulse burst events (purple)
   - Melatonin circadian tide
════════════════════════════════════════════════════════════════ */
function PinealTransducerCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const bAngleRef = useRef(Math.PI * 0.3); // geomagnetic field angle
  const solarRef  = useRef(0.7);
  const [bAngle, setBAngle] = useState(54);    // degrees from vertical
  const [solar,  setSolar]  = useState(0.7);

  useEffect(() => { bAngleRef.current = (bAngle * Math.PI) / 180; }, [bAngle]);
  useEffect(() => { solarRef.current = solar; }, [solar]);

  useEffect(() => {
    const c = canvasRef.current; if (!c) return;
    const ctx = c.getContext("2d")!;
    let raf = 0, t = 0;
    function resize() { c.width = c.offsetWidth; c.height = c.offsetHeight; }
    resize();
    const ro = new ResizeObserver(resize); ro.observe(c);

    const rng = (s: number) => { const x = Math.sin(s * 127.1) * 43758.5; return x - Math.floor(x); };
    // Magnetite crystals — positions in local sphere frame
    const N_MAG = 60;
    type Crystal = { ox: number; oy: number; angle: number };
    const crystals: Crystal[] = Array.from({ length: N_MAG }, (_, i) => ({
      ox: (rng(i * 5) - 0.5) * 2,
      oy: (rng(i * 7) - 0.5) * 2,
      angle: rng(i * 11) * Math.PI * 2,
    }));

    // Photon rain particles
    const N_PHOT = 40;
    type Photon = { x: number; progress: number; hue: number; speed: number };
    const photons: Photon[] = Array.from({ length: N_PHOT }, (_, i) => ({
      x: rng(i * 3) * 2 - 1, progress: rng(i * 9), hue: rng(i * 13) * 80 + 200,
      speed: 0.004 + rng(i * 17) * 0.006,
    }));

    let dmtTimer = 0;

    function draw() {
      const W = c.width, H = c.height;
      ctx.clearRect(0, 0, W, H);
      ctx.fillStyle = P.bg; ctx.fillRect(0, 0, W, H);

      const cx = W / 2, cy = H / 2 + 20;
      const R = Math.min(W, H) * 0.18;
      const ba = bAngleRef.current;
      const sol = solarRef.current;

      // ── Schumann resonance rings ──
      for (let ring = 1; ring <= 5; ring++) {
        const ringR = R * (1.6 + ring * 0.55) + Math.sin(t * 0.04 * ring + ring) * 4;
        const alpha = 0.06 + Math.sin(t * 0.04 + ring * 1.2) * 0.04;
        ctx.strokeStyle = `rgba(96,165,250,${alpha})`;
        ctx.lineWidth = 0.8;
        ctx.beginPath(); ctx.arc(cx, cy, ringR, 0, Math.PI * 2); ctx.stroke();
      }
      ctx.fillStyle = P.muted; ctx.font = "8px monospace"; ctx.textAlign = "left";
      ctx.fillText("Schumann 7.83 Hz", cx + R * 2.4, cy - 10);

      // ── Solar photon rain ──
      photons.forEach(ph => {
        ph.progress += ph.speed * sol;
        if (ph.progress > 1) { ph.progress = 0; ph.x = rng(t * 0.01 + ph.hue) * 2 - 1; }
        const px = cx + ph.x * R * 2.5;
        const py = cy - R * 2 - 30 + ph.progress * (R * 2 + 40);
        const isAbovePineal = py < cy - R;
        ctx.fillStyle = `hsla(${ph.hue},80%,75%,${isAbovePineal ? 0.7 * sol : 0.2 * sol})`;
        ctx.beginPath(); ctx.arc(px, py, 2, 0, Math.PI * 2); ctx.fill();
      });
      ctx.fillStyle = P.orange; ctx.font = "bold 9px monospace"; ctx.textAlign = "center";
      ctx.fillText("☀  SOLAR PHOTON FIELD", cx, cy - R * 2 - 35);

      // ── Geomagnetic field lines through the pineal ──
      const fieldLines = 7;
      for (let fl = 0; fl < fieldLines; fl++) {
        const offset = (fl - (fieldLines - 1) / 2) * R * 0.35;
        const perp = { x: Math.cos(ba + Math.PI / 2), y: Math.sin(ba + Math.PI / 2) };
        const dir  = { x: Math.cos(ba), y: Math.sin(ba) };
        const startX = cx + perp.x * offset - dir.x * R * 3;
        const startY = cy + perp.y * offset - dir.y * R * 3;
        const endX   = cx + perp.x * offset + dir.x * R * 3;
        const endY   = cy + perp.y * offset + dir.y * R * 3;

        const grd = ctx.createLinearGradient(startX, startY, endX, endY);
        grd.addColorStop(0, "transparent");
        grd.addColorStop(0.4, `rgba(79,232,232,0.25)`);
        grd.addColorStop(0.6, `rgba(79,232,232,0.25)`);
        grd.addColorStop(1, "transparent");
        ctx.strokeStyle = grd; ctx.lineWidth = 1;
        ctx.beginPath(); ctx.moveTo(startX, startY); ctx.lineTo(endX, endY); ctx.stroke();
      }
      // B field arrow
      const arrowLen = R * 1.5;
      ctx.strokeStyle = `rgba(79,232,232,0.7)`; ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(cx - Math.cos(ba) * arrowLen, cy - Math.sin(ba) * arrowLen);
      ctx.lineTo(cx + Math.cos(ba) * arrowLen, cy + Math.sin(ba) * arrowLen);
      ctx.stroke();
      ctx.fillStyle = P.cyan; ctx.font = "bold 8px monospace"; ctx.textAlign = "right";
      ctx.fillText("B⃗ geomagnetic", cx - Math.cos(ba) * arrowLen - 5, cy - Math.sin(ba) * arrowLen);

      // ── Pineal gland body ──
      const pinealGrd = ctx.createRadialGradient(cx, cy, 0, cx, cy, R);
      pinealGrd.addColorStop(0, "#e040fb44");
      pinealGrd.addColorStop(0.5, "#7c3aed22");
      pinealGrd.addColorStop(1, "#4c1d9511");
      ctx.fillStyle = pinealGrd;
      ctx.strokeStyle = P.purple; ctx.lineWidth = 2;
      ctx.beginPath(); ctx.arc(cx, cy, R, 0, Math.PI * 2); ctx.fill(); ctx.stroke();

      // ── Magnetite crystals (aligning to B field) ──
      crystals.forEach((cr, i) => {
        const targetAngle = ba + (rng(i * 23) - 0.5) * 0.5;
        cr.angle += (targetAngle - cr.angle) * 0.03;
        const px = cx + cr.ox * R * 0.75;
        const py = cy + cr.oy * R * 0.75;
        const len = 5 + rng(i * 7) * 4;
        ctx.strokeStyle = `rgba(100,180,255,0.7)`;
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(px - Math.cos(cr.angle) * len, py - Math.sin(cr.angle) * len);
        ctx.lineTo(px + Math.cos(cr.angle) * len, py + Math.sin(cr.angle) * len);
        ctx.stroke();
        // Crystal node
        ctx.fillStyle = "#93c5fd";
        ctx.beginPath(); ctx.arc(px, py, 1.5, 0, Math.PI * 2); ctx.fill();
      });

      // ── DMT pulse burst ──
      dmtTimer++;
      const dmtPeriod = 180;
      const dmtPhase = (dmtTimer % dmtPeriod) / dmtPeriod;
      if (dmtPhase < 0.3) {
        const intensity = Math.sin(dmtPhase * Math.PI / 0.3);
        for (let ring = 0; ring < 4; ring++) {
          const rr = R * (0.2 + ring * 0.25 + dmtPhase * 1.5);
          ctx.strokeStyle = `rgba(192,132,252,${intensity * 0.5 * (1 - ring * 0.2)})`;
          ctx.lineWidth = 2;
          ctx.beginPath(); ctx.arc(cx, cy, rr, 0, Math.PI * 2); ctx.stroke();
        }
      }
      if (dmtPhase < 0.05) {
        ctx.fillStyle = `rgba(192,132,252,${1 - dmtPhase / 0.05})`;
        ctx.font = "bold 10px monospace"; ctx.textAlign = "center";
        ctx.fillText("DMT ↑", cx, cy + R * 0.5);
      }

      // Labels
      ctx.fillStyle = P.purple; ctx.font = "bold 10px monospace"; ctx.textAlign = "center";
      ctx.fillText("PINEAL", cx, cy + 4);
      ctx.fillStyle = P.muted; ctx.font = "8px monospace";
      ctx.fillText("magnetite · opsin · calcite · DMT", cx, cy + 16);

      // Readouts
      ctx.textAlign = "left";
      const readouts = [
        { label: "Solar coupling", val: `${(sol * 100).toFixed(0)}%`,  color: P.orange },
        { label: "B field angle",  val: `${bAngle}°`,                  color: P.cyan },
        { label: "Schumann freq",  val: "7.83 Hz",                     color: P.blue },
        { label: "DMT cycle",      val: `${(dmtTimer % dmtPeriod)}/${dmtPeriod}`, color: P.purple },
      ];
      readouts.forEach((r, i) => {
        ctx.fillStyle = r.color;
        ctx.font = "8px monospace";
        ctx.fillText(`${r.label}: ${r.val}`, 8, 16 + i * 14);
      });

      t++;
      raf = requestAnimationFrame(draw);
    }
    draw();
    return () => { cancelAnimationFrame(raf); ro.disconnect(); };
  }, [bAngle]);

  return (
    <div style={{ border: `1px solid ${P.line}`, borderRadius: 12, overflow: "hidden", marginBottom: 28 }}>
      <canvas ref={canvasRef} style={{ width: "100%", height: 380, display: "block" }} />
      <div style={{ padding: "10px 16px", background: P.panel, display: "flex", gap: 24, flexWrap: "wrap", alignItems: "center" }}>
        <div>
          <div style={{ fontSize: 10, color: P.dim, marginBottom: 3 }}>SOLAR IRRADIANCE · {(solar * 100).toFixed(0)}%</div>
          <input type="range" min={0} max={1} step={0.05} value={solar} onChange={e => setSolar(+e.target.value)} style={{ width: 120 }} />
        </div>
        <div>
          <div style={{ fontSize: 10, color: P.dim, marginBottom: 3 }}>GEOMAGNETIC ANGLE · {bAngle}° from vertical</div>
          <input type="range" min={0} max={90} step={1} value={bAngle} onChange={e => setBAngle(+e.target.value)} style={{ width: 120 }} />
        </div>
        <div style={{ fontSize: 11, color: P.dim }}>Blue rods = magnetite crystals aligning to B field. Purple pulses = DMT burst (auto-periodic). Rings = Schumann standing wave.</div>
      </div>
    </div>
  );
}

/* ════════════════════════════════════════════════════════════════
   CANVAS 2 — Iris Genetic Map
   Circular iris showing 8 radial zones, each encoding a genetic trait
   Fiber density, crypts, contraction furrows, collarette, pigment
   Zones light up based on "genetic coherence" signal
════════════════════════════════════════════════════════════════ */
const IRIS_ZONES = [
  { name: "Pupillary Zone",  r0: 0.18, r1: 0.30, color: "#6d28d9", trait: "CNS · autonomic tone" },
  { name: "Collarette",      r0: 0.30, r1: 0.36, color: P.gold,    trait: "Digestive · gut-brain axis" },
  { name: "Ciliary Zone",    r0: 0.36, r1: 0.60, color: "#2563eb",  trait: "Organ systems · lymph" },
  { name: "Fiber Density",   r0: 0.60, r1: 0.72, color: P.teal,    trait: "Connective tissue · fascia" },
  { name: "Contraction Ring",r0: 0.72, r1: 0.78, color: P.orange,  trait: "Stress response · cortisol" },
  { name: "Pigment Ring",    r0: 0.78, r1: 0.86, color: "#f59e0b",  trait: "Liver · metabolic load" },
  { name: "Limbal Ring",     r0: 0.86, r1: 0.93, color: P.green,   trait: "Vitality · cellular health" },
  { name: "Scleral Edge",    r0: 0.93, r1: 1.00, color: P.dim,     trait: "Circulatory boundary" },
];

const GENETIC_SECTORS = [
  { name: "Melanocortin (OCA2)", angle: 0,    color: "#92400e", note: "Brown/hazel pigment gene" },
  { name: "TYRP1 Eumelanin",     angle: 45,   color: "#78350f", note: "Dark pigment density" },
  { name: "HERC2/OCA2 Blue",    angle: 90,   color: "#1d4ed8", note: "Blue/grey Rayleigh scatter" },
  { name: "SLC45A2 (AIM1)",     angle: 135,  color: "#065f46", note: "Green/hazel modifier" },
  { name: "IRF4 Freckling",     angle: 180,  color: P.gold,    note: "Freckle pattern distribution" },
  { name: "ASIP Stroma",        angle: 225,  color: "#6b7280", note: "Stroma density · iris crypts" },
  { name: "TYR Albinism locus", angle: 270,  color: P.ivory,   note: "Melanin pathway baseline" },
  { name: "SLC24A4",            angle: 315,  color: "#7c3aed", note: "Blonde/blue modifier" },
];

function IrisGeneticMapCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const highlightRef = useRef(-1);
  const [hoveredZone, setHoveredZone] = useState<string | null>(null);

  useEffect(() => {
    const c = canvasRef.current; if (!c) return;
    const ctx = c.getContext("2d")!;
    let raf = 0, t = 0;
    function resize() { c.width = c.offsetWidth; c.height = c.offsetHeight; }
    resize();
    const ro = new ResizeObserver(resize); ro.observe(c);

    const rng = (s: number) => { const x = Math.sin(s * 127.1) * 43758.5; return x - Math.floor(x); };

    // Iris fiber threads
    const N_FIBERS = 240;
    const fibers = Array.from({ length: N_FIBERS }, (_, i) => ({
      angle: (i / N_FIBERS) * Math.PI * 2,
      r: 0.3 + rng(i * 7) * 0.58,
      len: 0.02 + rng(i * 11) * 0.06,
      alpha: 0.3 + rng(i * 13) * 0.5,
    }));

    // Crypts (gaps in iris stroma)
    const N_CRYPTS = 18;
    const crypts = Array.from({ length: N_CRYPTS }, (_, i) => ({
      angle: (i / N_CRYPTS) * Math.PI * 2 + rng(i * 3) * 0.3,
      r: 0.4 + rng(i * 5) * 0.25,
      size: 0.015 + rng(i * 9) * 0.025,
    }));

    function draw() {
      const W = c.width, H = c.height;
      ctx.clearRect(0, 0, W, H);
      ctx.fillStyle = P.bg; ctx.fillRect(0, 0, W, H);

      const cx = W / 2, cy = H / 2;
      const R = Math.min(W, H) * 0.38;
      const hi = highlightRef.current;

      // ── Zone rings ──
      IRIS_ZONES.forEach((zone, zi) => {
        const r0 = zone.r0 * R, r1 = zone.r1 * R;
        const isHi = hi === zi;
        const pulse = isHi ? 1 + Math.sin(t * 0.12) * 0.08 : 1;

        ctx.fillStyle = zone.color + (isHi ? "44" : "18");
        ctx.beginPath(); ctx.arc(cx, cy, r1 * pulse, 0, Math.PI * 2);
        ctx.arc(cx, cy, r0, 0, Math.PI * 2, true); ctx.fill();

        if (isHi) {
          ctx.strokeStyle = zone.color; ctx.lineWidth = 1.5;
          ctx.beginPath(); ctx.arc(cx, cy, r0, 0, Math.PI * 2); ctx.stroke();
          ctx.beginPath(); ctx.arc(cx, cy, r1, 0, Math.PI * 2); ctx.stroke();
        }
      });

      // ── Genetic sector arcs (outer ring) ──
      GENETIC_SECTORS.forEach((sec, si) => {
        const arcR = R * 1.08;
        const a0 = (sec.angle - 20) * Math.PI / 180;
        const a1 = (sec.angle + 20) * Math.PI / 180;
        const alpha = 0.6 + Math.sin(t * 0.05 + si) * 0.2;
        ctx.strokeStyle = sec.color + Math.round(alpha * 120).toString(16).padStart(2, "0");
        ctx.lineWidth = 4;
        ctx.beginPath(); ctx.arc(cx, cy, arcR, a0, a1); ctx.stroke();
      });

      // ── Iris fibers ──
      fibers.forEach((f, fi) => {
        const fr = f.r * R;
        const fx = cx + Math.cos(f.angle) * fr;
        const fy = cy + Math.sin(f.angle) * fr;
        const ex = cx + Math.cos(f.angle) * (fr + f.len * R);
        const ey = cy + Math.sin(f.angle) * (fr + f.len * R);
        // Color fiber by zone
        const zoneIdx = IRIS_ZONES.findIndex(z => f.r >= z.r0 && f.r < z.r1);
        const zCol = IRIS_ZONES[zoneIdx]?.color || P.muted;
        ctx.strokeStyle = zCol + Math.round(f.alpha * 160).toString(16).padStart(2, "0");
        ctx.lineWidth = 0.7;
        ctx.beginPath(); ctx.moveTo(fx, fy); ctx.lineTo(ex, ey); ctx.stroke();
      });

      // ── Crypts ──
      crypts.forEach(cr => {
        const px = cx + Math.cos(cr.angle) * cr.r * R;
        const py = cy + Math.sin(cr.angle) * cr.r * R;
        ctx.fillStyle = P.bg;
        ctx.strokeStyle = "rgba(30,30,60,0.8)"; ctx.lineWidth = 1;
        ctx.beginPath(); ctx.arc(px, py, cr.size * R, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
      });

      // ── Collarette ring (digestive reflex ring) ──
      ctx.strokeStyle = P.gold + "88";
      ctx.lineWidth = 2 + Math.sin(t * 0.06) * 0.5;
      ctx.setLineDash([4, 4]);
      ctx.beginPath(); ctx.arc(cx, cy, 0.33 * R, 0, Math.PI * 2); ctx.stroke();
      ctx.setLineDash([]);

      // ── Pupil ──
      const pupilR = R * 0.18 + Math.sin(t * 0.03) * R * 0.01;
      const pupilGrd = ctx.createRadialGradient(cx, cy, 0, cx, cy, pupilR);
      pupilGrd.addColorStop(0, "#000000");
      pupilGrd.addColorStop(0.6, "#0a0a1a");
      pupilGrd.addColorStop(1, "#1a0a2a");
      ctx.fillStyle = pupilGrd;
      ctx.beginPath(); ctx.arc(cx, cy, pupilR, 0, Math.PI * 2); ctx.fill();

      // Light reflex
      ctx.fillStyle = "rgba(255,255,255,0.15)";
      ctx.beginPath(); ctx.ellipse(cx - pupilR * 0.3, cy - pupilR * 0.35, pupilR * 0.22, pupilR * 0.14, -0.5, 0, Math.PI * 2); ctx.fill();

      // ── Coherence pulse rings from center outward ──
      const pulsePhase = (t * 0.02) % 1;
      const pulseR = pulsePhase * R;
      ctx.strokeStyle = `rgba(192,132,252,${(1 - pulsePhase) * 0.35})`;
      ctx.lineWidth = 1.5;
      ctx.beginPath(); ctx.arc(cx, cy, pulseR, 0, Math.PI * 2); ctx.stroke();

      // ── Zone label ──
      if (hi >= 0) {
        const zone = IRIS_ZONES[hi];
        ctx.fillStyle = zone.color; ctx.font = "bold 9px monospace"; ctx.textAlign = "center";
        ctx.fillText(zone.name, cx, cy + R + 20);
        ctx.fillStyle = P.dim; ctx.font = "8px monospace";
        ctx.fillText(zone.trait, cx, cy + R + 33);
        ctx.textAlign = "left";
      } else {
        ctx.fillStyle = P.muted; ctx.font = "8px monospace"; ctx.textAlign = "center";
        ctx.fillText("iris · biological coherence map · hover zone buttons", cx, cy + R + 20);
        ctx.textAlign = "left";
      }

      t++;
      raf = requestAnimationFrame(draw);
    }
    draw();
    return () => { cancelAnimationFrame(raf); ro.disconnect(); };
  }, []);

  return (
    <div style={{ border: `1px solid ${P.line}`, borderRadius: 12, overflow: "hidden", marginBottom: 28 }}>
      <canvas ref={canvasRef}
        style={{ width: "100%", height: 400, display: "block" }} />
      <div style={{ padding: "10px 14px", background: P.panel }}>
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 8 }}>
          {IRIS_ZONES.map((zone, i) => (
            <button key={i}
              onMouseEnter={() => { highlightRef.current = i; setHoveredZone(zone.name); }}
              onMouseLeave={() => { highlightRef.current = -1; setHoveredZone(null); }}
              style={{ padding: "4px 10px", borderRadius: 6, border: `1px solid ${zone.color}44`, background: zone.color + "18", color: zone.color, fontSize: 9, cursor: "pointer" }}>
              {zone.name}
            </button>
          ))}
        </div>
        <div style={{ fontSize: 11, color: P.dim }}>
          {hoveredZone
            ? `${hoveredZone}: ${IRIS_ZONES.find(z => z.name === hoveredZone)?.trait}`
            : "Hover a zone to highlight. Outer arc = 8 genetic color loci. Gold dashes = collarette (gut reflex zone). Purple pulse = coherence field propagation."}
        </div>
      </div>
    </div>
  );
}

/* ════════════════════════════════════════════════════════════════
   CANVAS 3 — EM Spectrum → Dark Matter Bridge
   Horizontal spectrum bar from radio → gamma
   Human perception window (380–780nm) highlighted
   Dark matter as the invisible flanking field
   Brain matter bandwidth overlay
════════════════════════════════════════════════════════════════ */
function EMSpectrumCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const c = canvasRef.current; if (!c) return;
    const ctx = c.getContext("2d")!;
    let raf = 0, t = 0;
    function resize() { c.width = c.offsetWidth; c.height = c.offsetHeight; }
    resize();
    const ro = new ResizeObserver(resize); ro.observe(c);

    // EM bands: [label, log10(freq Hz), color]
    const EM_BANDS = [
      { label: "Radio", logf: 6,   color: "#6366f1" },
      { label: "Microwave", logf: 10, color: "#8b5cf6" },
      { label: "Infrared", logf: 13, color: "#f87171" },
      { label: "VISIBLE", logf: 14.7, color: P.gold },
      { label: "UV", logf: 15.5, color: "#a78bfa" },
      { label: "X-ray", logf: 17, color: "#7dd3fc" },
      { label: "Gamma", logf: 20, color: "#67e8f9" },
    ];

    const minLogF = 5, maxLogF = 22;

    function xForLogF(logf: number, W: number) {
      return ((logf - minLogF) / (maxLogF - minLogF)) * W * 0.6 + W * 0.2;
    }

    function draw() {
      const W = c.width, H = c.height;
      ctx.clearRect(0, 0, W, H);
      ctx.fillStyle = P.bg; ctx.fillRect(0, 0, W, H);

      const barY = H * 0.42, barH = H * 0.16;

      // ── Dark matter flanking fields ──
      // Left (low freq, below radio)
      const leftGrd = ctx.createLinearGradient(0, barY, W * 0.2, barY);
      leftGrd.addColorStop(0, "rgba(30,0,60,0.6)");
      leftGrd.addColorStop(1, "transparent");
      ctx.fillStyle = leftGrd;
      ctx.fillRect(0, barY - barH, W * 0.2, barH * 3);

      // Right (high freq, above gamma)
      const rightGrd = ctx.createLinearGradient(W * 0.8, barY, W, barY);
      rightGrd.addColorStop(0, "transparent");
      rightGrd.addColorStop(1, "rgba(30,0,60,0.6)");
      ctx.fillStyle = rightGrd;
      ctx.fillRect(W * 0.8, barY - barH, W * 0.2, barH * 3);

      // Dark matter labels
      ctx.fillStyle = P.purple + "88"; ctx.font = "bold 9px monospace"; ctx.textAlign = "center";
      ctx.fillText("◀ DARK MATTER", W * 0.08, barY - barH * 0.5);
      ctx.fillText("DARK ENERGY ▶", W * 0.92, barY - barH * 0.5);

      // ── EM spectrum bar ──
      const specGrd = ctx.createLinearGradient(W * 0.2, 0, W * 0.8, 0);
      specGrd.addColorStop(0, "#6366f1");
      specGrd.addColorStop(0.35, "#f87171");
      specGrd.addColorStop(0.43, "#ff6600");
      specGrd.addColorStop(0.5, "#f5c84c");
      specGrd.addColorStop(0.57, "#34d399");
      specGrd.addColorStop(0.62, "#60a5fa");
      specGrd.addColorStop(0.68, "#a78bfa");
      specGrd.addColorStop(1, "#7dd3fc");
      ctx.fillStyle = specGrd;
      ctx.fillRect(W * 0.2, barY, W * 0.6, barH);

      // ── Band markers ──
      EM_BANDS.forEach(band => {
        const x = xForLogF(band.logf, W);
        ctx.strokeStyle = "rgba(255,255,255,0.2)"; ctx.lineWidth = 1;
        ctx.beginPath(); ctx.moveTo(x, barY); ctx.lineTo(x, barY + barH); ctx.stroke();
        ctx.fillStyle = P.muted; ctx.font = "7px monospace"; ctx.textAlign = "center";
        ctx.fillText(band.label, x, barY + barH + 14);
        ctx.fillText(`10^${band.logf}Hz`, x, barY + barH + 24);
      });

      // ── Visible light window ──
      const visX0 = xForLogF(14.58, W); // 380nm
      const visX1 = xForLogF(14.9, W);  // 780nm
      ctx.strokeStyle = "rgba(255,255,255,0.6)"; ctx.lineWidth = 2;
      ctx.strokeRect(visX0, barY - 2, visX1 - visX0, barH + 4);

      // Rainbow inside visible window
      const visGrd = ctx.createLinearGradient(visX0, 0, visX1, 0);
      visGrd.addColorStop(0, "rgba(150,0,255,0.4)");
      visGrd.addColorStop(0.16, "rgba(0,0,255,0.4)");
      visGrd.addColorStop(0.33, "rgba(0,255,0,0.4)");
      visGrd.addColorStop(0.5, "rgba(255,255,0,0.4)");
      visGrd.addColorStop(0.66, "rgba(255,165,0,0.4)");
      visGrd.addColorStop(1, "rgba(255,0,0,0.4)");
      ctx.fillStyle = visGrd; ctx.fillRect(visX0, barY, visX1 - visX0, barH);

      ctx.fillStyle = P.gold; ctx.font = "bold 9px monospace"; ctx.textAlign = "center";
      ctx.fillText("EYE: 380–780 nm", (visX0 + visX1) / 2, barY - 6);

      // ── Pineal sensing window (near-UV) ──
      const pinX0 = xForLogF(14.72, W);
      const pinX1 = xForLogF(15.1, W);
      ctx.strokeStyle = P.purple + "bb"; ctx.lineWidth = 1.5;
      ctx.setLineDash([4, 4]);
      ctx.strokeRect(pinX0, barY - 18, pinX1 - pinX0, barH + 20);
      ctx.setLineDash([]);
      ctx.fillStyle = P.purple; ctx.font = "8px monospace"; ctx.textAlign = "center";
      ctx.fillText("PINEAL: UV + NIR", (pinX0 + pinX1) / 2, barY - 22);

      // ── Schumann / brain band ──
      const brainX = xForLogF(Math.log10(8), W);
      ctx.strokeStyle = P.blue + "99"; ctx.lineWidth = 2;
      ctx.beginPath(); ctx.moveTo(brainX, barY - 40); ctx.lineTo(brainX, barY + barH + 30); ctx.stroke();
      ctx.fillStyle = P.blue; ctx.font = "8px monospace"; ctx.textAlign = "center";
      ctx.fillText("Brain/Schumann 8Hz", brainX, barY - 44);

      // ── Dark matter percentage bar ──
      const dmBarY = barY + barH + 50;
      const dmBarH = 14;
      ctx.fillStyle = P.panel2; ctx.fillRect(W * 0.1, dmBarY, W * 0.8, dmBarH);
      // Universe: 68% dark energy, 27% dark matter, 5% normal
      ctx.fillStyle = "#6d28d9"; ctx.fillRect(W * 0.1, dmBarY, W * 0.8 * 0.68, dmBarH);
      ctx.fillStyle = "#7c3aed"; ctx.fillRect(W * 0.1 + W * 0.8 * 0.68, dmBarY, W * 0.8 * 0.27, dmBarH);
      ctx.fillStyle = P.gold; ctx.fillRect(W * 0.1 + W * 0.8 * 0.95, dmBarY, W * 0.8 * 0.05, dmBarH);
      ctx.fillStyle = P.ivory; ctx.font = "bold 8px monospace"; ctx.textAlign = "left";
      ctx.fillText("Universe composition:", W * 0.1, dmBarY - 4);
      ctx.fillStyle = "#9d7bc8"; ctx.fillText("68% Dark Energy", W * 0.1 + 4, dmBarY + 10);
      ctx.fillStyle = "#a78bfa"; ctx.fillText("27% Dark Matter", W * 0.1 + W * 0.8 * 0.68 + 4, dmBarY + 10);
      ctx.fillStyle = P.gold; ctx.fillText("5% Visible", W * 0.1 + W * 0.8 * 0.95 + 4, dmBarY + 10);

      // Brain composition bar
      const brainBarY = dmBarY + 34;
      ctx.fillStyle = P.panel2; ctx.fillRect(W * 0.1, brainBarY, W * 0.8, dmBarH);
      ctx.fillStyle = "#374151"; ctx.fillRect(W * 0.1, brainBarY, W * 0.8 * 0.9, dmBarH);
      ctx.fillStyle = P.cyan; ctx.fillRect(W * 0.1 + W * 0.8 * 0.9, brainBarY, W * 0.8 * 0.1, dmBarH);
      ctx.fillStyle = P.ivory; ctx.font = "bold 8px monospace";
      ctx.fillText("Brain activity:", W * 0.1, brainBarY - 4);
      ctx.fillStyle = "#6b7280"; ctx.fillText("90% unconscious / dark matter of mind", W * 0.1 + 4, brainBarY + 10);
      ctx.fillStyle = P.cyan; ctx.fillText("10% conscious", W * 0.1 + W * 0.8 * 0.9 + 4, brainBarY + 10);

      // Genome bar
      const genBarY = brainBarY + 34;
      ctx.fillStyle = P.panel2; ctx.fillRect(W * 0.1, genBarY, W * 0.8, dmBarH);
      ctx.fillStyle = "#1f2937"; ctx.fillRect(W * 0.1, genBarY, W * 0.8 * 0.98, dmBarH);
      ctx.fillStyle = P.green; ctx.fillRect(W * 0.1 + W * 0.8 * 0.98, genBarY, W * 0.8 * 0.02, dmBarH);
      ctx.fillStyle = P.ivory; ctx.font = "bold 8px monospace";
      ctx.fillText("Human genome:", W * 0.1, genBarY - 4);
      ctx.fillStyle = "#4b5563"; ctx.fillText("98% non-coding (dark regulatory genome)", W * 0.1 + 4, genBarY + 10);
      ctx.fillStyle = P.green; ctx.fillText("2% coding", W * 0.1 + W * 0.8 * 0.98 + 4, genBarY + 10);

      ctx.textAlign = "left";
      t++;
      raf = requestAnimationFrame(draw);
    }
    draw();
    return () => { cancelAnimationFrame(raf); ro.disconnect(); };
  }, []);

  return (
    <div style={{ border: `1px solid ${P.line}`, borderRadius: 12, overflow: "hidden", marginBottom: 28 }}>
      <canvas ref={canvasRef} style={{ width: "100%", height: 360, display: "block" }} />
      <div style={{ padding: "8px 16px", background: P.panel, fontSize: 11, color: P.dim }}>
        Gold bracket = retinal visible window (380–780 nm). Purple dashed = pineal UV+NIR sensing. Blue vertical = brain/Schumann 8 Hz. Dark purple flanks = dark matter domain. Three composition bars: Universe · Brain activity · Human genome — all show the same ~95% invisible ratio.
      </div>
    </div>
  );
}

/* ════════════════════════════════════════════════════════════════
   MAIN PAGE
════════════════════════════════════════════════════════════════ */
const PINEAL_COMPONENTS = [
  { label: "Magnetite (Fe₃O₄) Crystals", color: P.blue,
    body: "Biologically synthesized magnetite nanocrystals found in pinealocytes. Size 50–100 nm — within the single-domain ferromagnetic range, maximizing magnetic moment per crystal. Respond to Earth's geomagnetic field (25–65 μT). Estimated 5–100 million crystals per pineal gland. Provide a direct physical coupling between geomagnetic fluctuations and neural signaling. Also found: in the ethmoid bone (head navigation), heart, adrenal cortex." },
  { label: "Calcite (CaCO₃) Microcrystals", color: P.teal,
    body: "Calcite concretions ('corpora arenacea' or brain sand) accumulate in the pineal from childhood, increasing with age. Calcite is piezoelectric — mechanical deformation (sound waves, vibration, heartbeat pulse pressure) generates electric fields. These microvoltaic signals may couple into the surrounding neural tissue. The piezo effect: P = d · σ (polarization = piezo coefficient × mechanical stress). The same mineral found in the crystallized powder synthesis." },
  { label: "Opsin Photoreceptors", color: P.orange,
    body: "The pineal gland is phylogenetically a photoreceptive organ — it evolved as the 'third eye' (parietal eye visible externally in lizards and tuataras). Human pinealocytes contain opsin proteins (neuropsin/OPN5, melanopsin) identical to retinal photoreceptors. In fish and birds, pineal opsin responds directly to light. In humans, retinal input is relayed via the suprachiasmatic nucleus (SCN) → superior cervical ganglion → pineal. Still fundamentally a solar transducer." },
  { label: "DMT (N,N-Dimethyltryptamine)", color: P.purple,
    body: "The pineal gland synthesizes DMT from tryptophan via tryptophan → tryptamine → N-methyltryptamine → DMT (enzymes INMT + AADC both present in pineal). DMT is the most potent known psychedelic compound, produced endogenously. It interacts with serotonin 2A receptors, sigma-1 receptors, and trace amine receptors. Sigma-1 receptors are located on the mitochondria-associated ER membrane — linking DMT action directly to the mechanotransduction cascade. Proposed: the 'dark matter of consciousness' — the invisible active field of mind." },
  { label: "Melatonin · Circadian Transduction", color: P.green,
    body: "Primary output: melatonin (N-acetyl-5-methoxytryptamine). Synthesis peaks at night (solar absence). Light → retina → SCN → pineal suppresses melatonin. Melatonin is a potent antioxidant, immune modulator, and mitochondrial protectant. It synchronizes all circadian clocks in every organ via bloodstream delivery. The pineal is the master clock — it translates solar position into a chemical time signal distributed throughout the entire body. One small gland (100mg) governing the temporal coherence of 37 trillion cells." },
];

const EYE_ZONES_DETAIL = [
  { zone: "Collarette", color: P.gold, body: "The most genetically determined zone. The collarette is the junction between the pupillary and ciliary zones — where the embryonic optic cup margin fused. Its ridge pattern, width, and notch count are fixed at birth and encode the gut-brain axis coherence baseline. High collarette = strong vagal tone. Low collarette = more sympathetic dominance." },
  { zone: "Fiber Density", color: P.teal, body: "Compact fibers (type: 'silk') = strong connective tissue, robust fascia. Open fibers ('linen', 'hessian') = more reactive connective tissue, inflammatory tendency. The iris stroma is developmentally continuous with the leptomeninges (brain coverings) via neural crest cell migration — genetic iris fiber patterns directly reflect brain connective matrix." },
  { zone: "Contraction Rings", color: P.orange, body: "Concentric ring furrows in the ciliary zone indicate chronic autonomic stress — the iris sphincter muscle leaves structural imprints from sustained contraction. The number and depth of rings correlates with long-term cortisol exposure, adrenal load, and nervous system arousal history. Epigenetic record of stress written in the iris." },
  { zone: "Limbal Ring", color: P.green, body: "The dark outer ring (limbus). Thickness correlates strongly with health and immune vitality — healthy immune function maintains a dense, dark limbal ring. It signals cellular renewal rate (the limbal stem cells at the corneal edge are among the most rapidly dividing in the body). Wide, sharp limbal ring = high cellular coherence. Disappearing ring = metabolic stress, aging, immune load." },
  { zone: "Pigment Spots", color: P.amber, body: "Heterochromia and localized pigment deposits (psoric spots) appear at specific clock positions corresponding to organ systems in the iridology mapping. While mainstream medicine does not validate iridology as diagnostic, the pigment is deposited by neural crest-derived melanocytes that migrate from the neural tube — the same cells that form the peripheral nervous system, adrenal medulla, and melanocytes of skin. Genetic variants in the melanocortin pathway (OCA2, MC1R, TYRP1) written simultaneously in iris, skin, and hair color." },
];

export default function PinealEyeMapPage() {
  const [activePin, setActivePin] = useState(0);
  const [activeZone, setActiveZone] = useState(0);

  return (
    <div style={{ background: P.bg, color: P.ivory, minHeight: "100vh", fontFamily: "inherit" }}>

      {/* ── HERO ── */}
      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "52px 32px 36px" }}>
        <Tag label="Pineal · Iris · Solar · Geomagnetic · EM Spectrum · Dark Matter · Brain Matter" color={P.purple} />
        <h1 style={{ fontSize: 32, fontWeight: 800, lineHeight: 1.15, margin: "10px 0 14px", letterSpacing: -0.5 }}>
          <span style={{ color: P.purple }}>The Pineal–Eye Cosmic Map</span><br />
          <span style={{ color: P.cyan, fontWeight: 400 }}>Genetic Traits as a Guide to Higher Infrastructure</span><br />
          <span style={{ color: P.ivory, fontWeight: 300, fontSize: 21 }}>
            Solar · Geomagnetic · Connective · Coherence · EM Spectrum · Dark Matter · Brain Matter
          </span>
        </h1>
        <p style={{ fontSize: 15, color: P.dim, lineHeight: 1.9, maxWidth: 760, marginBottom: 20 }}>
          The pineal gland and the circumference of the eye (iris topology, limbal ring, fiber density, contraction rings, pigment geography) together form a biological map — or guide — to a higher, larger order of infrastructure. Not metaphorically: the pineal contains physical magnetite crystals that respond to Earth's geomagnetic field, piezoelectric calcite microcrystals that transduce mechanical signals into EM fields, opsin photoreceptors that couple to solar irradiance, and the DMT biosynthesis machinery that bridges visible consciousness into the "dark matter" of mind. The iris encodes 200+ heritable parameters across 8 measurable zones, written by the same neural crest cells that built the peripheral nervous system and the brain's connective tissue matrix. Read together, they define the individual's position in the electromagnetic, gravitational, and coherence fields of the solar system.
        </p>

        {/* Parallel 95% stat */}
        <div style={{ display: "flex", gap: 12, flexWrap: "wrap", marginBottom: 32 }}>
          {[
            { label: "Universe", pct: "95%", sub: "Dark matter + energy", color: P.purple },
            { label: "Human Genome", pct: "98%", sub: "Non-coding dark regulatory", color: P.teal },
            { label: "Brain Activity", pct: "90%", sub: "Unconscious processing", color: P.blue },
            { label: "EM Spectrum", pct: "99.9%", sub: "Beyond visible range", color: P.orange },
          ].map((s, i) => (
            <div key={i} style={{ padding: "14px 18px", background: P.panel, borderRadius: 10, border: `1px solid ${s.color}22`, textAlign: "center" }}>
              <div style={{ fontSize: 28, fontWeight: 800, color: s.color }}>{s.pct}</div>
              <div style={{ fontSize: 11, color: P.ivory, fontWeight: 700 }}>{s.label}</div>
              <div style={{ fontSize: 10, color: P.muted }}>{s.sub}</div>
            </div>
          ))}
        </div>
        <div style={{ padding: "12px 18px", background: P.panel2, borderRadius: 10, border: `1px solid ${P.gold}22`, marginBottom: 32 }}>
          <span style={{ color: P.gold, fontWeight: 700, fontSize: 12 }}>THE 95% DARK PRINCIPLE: </span>
          <span style={{ color: P.dim, fontSize: 13, lineHeight: 1.8 }}>
            95% of the universe is dark. 98% of the human genome is non-coding "dark regulatory" matter. 90% of brain activity is unconscious. 99.9% of the electromagnetic spectrum is invisible to the retina. In every domain, the visible fraction is the 5% tip of an invisible iceberg. The pineal + iris system is the biological interface specifically evolved to transduce the dark into the detectable — magnetite for dark-matter-equivalent geomagnetic fields, opsin for invisible UV, DMT for the dark matter of consciousness. AETHER maps all of it.
          </span>
        </div>
      </div>

      {/* ── SECTION I: Pineal Transducer ── */}
      <Sec id="pineal">
        <Tag label="Section I · Pineal Gland · 5 Components · Solar-Geomagnetic Transducer" color={P.purple} />
        <h2 style={{ fontSize: 22, fontWeight: 700, color: P.purple, margin: "10px 0 12px" }}>
          The Pineal Gland · Phylogenetic Third Eye · Complete Transducer System
        </h2>
        <p style={{ fontSize: 14, color: P.dim, lineHeight: 1.85, maxWidth: 760, marginBottom: 20 }}>
          The pineal gland (100 mg, 8×5 mm, sits at the geometric center of the brain) is the most highly vascularized organ in the body per unit volume — second only to the kidney. It lies outside the blood-brain barrier. Every compound in the bloodstream has direct access. It does not have one function — it has five coupled functions operating simultaneously across solar, geomagnetic, mechanical, and consciousness domains.
        </p>

        <PinealTransducerCanvas />

        {/* Component tabs */}
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 14 }}>
          {PINEAL_COMPONENTS.map((pc, i) => (
            <button key={i} onClick={() => setActivePin(i)}
              style={{ padding: "6px 12px", borderRadius: 7, border: `1px solid ${activePin === i ? pc.color : P.line}`, background: activePin === i ? pc.color + "22" : "transparent", color: activePin === i ? pc.color : P.dim, fontSize: 10, cursor: "pointer" }}>
              {pc.label.split("(")[0].trim()}
            </button>
          ))}
        </div>
        <div style={{ padding: "16px 18px", background: P.panel2, borderRadius: 10, border: `1px solid ${PINEAL_COMPONENTS[activePin].color}22`, marginBottom: 24 }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: PINEAL_COMPONENTS[activePin].color, marginBottom: 8, textTransform: "uppercase" as const }}>{PINEAL_COMPONENTS[activePin].label}</div>
          <p style={{ fontSize: 13, color: P.dim, lineHeight: 1.85, margin: 0 }}>{PINEAL_COMPONENTS[activePin].body}</p>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
          <EqBlock label="MELATONIN SYNTHESIS PATHWAY" color={P.green}
            eq="Trp → 5-HTP → Serotonin → N-AcSerotonin → Melatonin"
            note="Enzymes: tryptophan hydroxylase (TPH) → AADC → AANAT → ASMT. Rate-limiting: AANAT (N-acetyltransferase), suppressed by light via norepinephrine → β-adrenergic → cAMP → inhibition." />
          <EqBlock label="PIEZOELECTRIC TRANSDUCTION (CALCITE)" color={P.teal}
            eq="P = d₃₃ · σ   [piezo polarization]\nV = P/C_0   [voltage at tissue interface]"
            note="For calcite: d₃₃ ≈ 4 pC/N. Heartbeat pressure ~15 kPa → ~60 nC/m² → ~mV signals at crystal surface. Microvolt-range EM fields couple into surrounding neural tissue." />
        </div>
      </Sec>

      {/* ── SECTION II: Iris Genetic Map ── */}
      <Sec id="iris">
        <Tag label="Section II · Iris Circumference · Genetic Map · 8 Zones · 200+ Traits" color={P.gold} />
        <h2 style={{ fontSize: 22, fontWeight: 700, color: P.gold, margin: "10px 0 12px" }}>
          The Iris as a Biological Field Map · Genetic Infrastructure Guide
        </h2>
        <p style={{ fontSize: 14, color: P.dim, lineHeight: 1.85, maxWidth: 760, marginBottom: 20 }}>
          The iris contains more measurable unique features (over 200 independent parameters) than any other human biometric — including the fingerprint. Every feature is primarily genetic: fiber architecture, crypt distribution, contraction furrow depth, collarette structure, limbal ring density, and pigment geography. The iris develops from neural crest cells — the same migratory cells that build the peripheral nervous system, adrenal medulla, heart valves, and facial bones. Reading the iris circumference is reading the developmental coherence map of the entire connective tissue and neural infrastructure.
        </p>

        <IrisGeneticMapCanvas />

        {/* Zone detail */}
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 14 }}>
          {EYE_ZONES_DETAIL.map((z, i) => (
            <button key={i} onClick={() => setActiveZone(i)}
              style={{ padding: "6px 12px", borderRadius: 7, border: `1px solid ${activeZone === i ? z.color : P.line}`, background: activeZone === i ? z.color + "22" : "transparent", color: activeZone === i ? z.color : P.dim, fontSize: 10, cursor: "pointer" }}>
              {z.zone}
            </button>
          ))}
        </div>
        <div style={{ padding: "16px 18px", background: P.panel2, borderRadius: 10, border: `1px solid ${EYE_ZONES_DETAIL[activeZone].color}22`, marginBottom: 24 }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: EYE_ZONES_DETAIL[activeZone].color, marginBottom: 8, textTransform: "uppercase" as const }}>{EYE_ZONES_DETAIL[activeZone].zone}</div>
          <p style={{ fontSize: 13, color: P.dim, lineHeight: 1.85, margin: 0 }}>{EYE_ZONES_DETAIL[activeZone].body}</p>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(220px,1fr))", gap: 12 }}>
          <Card title="8 Genetic Color Loci" color={P.amber} sub="Outer Arc"
            body="OCA2 · HERC2 (brown/blue switch) · TYRP1 · SLC45A2 · IRF4 · ASIP · TYR · SLC24A4. GWAS studies identify these 8 loci explaining ~50% of eye color variance. The other 50%: epistatic interactions, modifier genes, somatic mutation, developmental noise — the individual's epigenetic history written at birth." />
          <Card title="Neural Crest Cell Inheritance" color={P.teal} sub="Structural"
            body="Iris stroma, trabecular meshwork, ciliary body = neural crest derivatives. The same cell lineage builds: peripheral nerves, Schwann cells, DRG neurons, sympathetic ganglia, adrenal medulla, cardiac neural crest (heart valves), craniofacial skeleton. Iris fiber topology = peripheral neural architecture blueprint." />
          <Card title="Solar Entanglement" color={P.orange} sub="Photoreception"
            body="The iris is a living aperture — its sphincter and dilator muscles regulate light entry using the same molecular machinery (melanopsin, OPN4) as the retinal intrinsically photosensitive ganglion cells that set circadian phase. The iris itself responds to light. Its genetic quality directly determines the quality of solar coupling to the entire circadian system." />
          <Card title="Geomagnetic Coupling" color={P.blue} sub="Neural Crest - CNS"
            body="Neural crest cells in the ethmoid sinus (directly adjacent to the eye orbit) contain magnetite. The iris shares its developmental lineage with these geomagnetic sensors. Different iris fiber architectures (compact vs. open stroma) correlate with different autonomic nervous system responses to geomagnetic fluctuations (Kirschvink 2019 — human magnetoreception confirmed via EEG during rotating magnetic field)." />
        </div>
      </Sec>

      {/* ── SECTION III: EM Spectrum ── */}
      <Sec id="spectrum">
        <Tag label="Section III · Electromagnetic Spectrum · Dark Matter · Brain Matter" color={P.cyan} />
        <h2 style={{ fontSize: 22, fontWeight: 700, color: P.cyan, margin: "10px 0 12px" }}>
          Defining the Full EM Spectrum · The Visible is 5% of the Field
        </h2>
        <p style={{ fontSize: 14, color: P.dim, lineHeight: 1.85, maxWidth: 760, marginBottom: 20 }}>
          The retinal eye detects 380–780 nm (visible light). The pineal opsin extends this into UV (300–380 nm) and near-infrared. But the electromagnetic spectrum runs from radio waves (10⁻⁶ Hz) to gamma (10²⁵ Hz) — a range of 31 orders of magnitude. The visible window is 0.0001% of the spectrum. The "dark matter" of electromagnetism — all the fields the body cannot see but the pineal-magnetite system directly responds to — is the remaining 99.9999%. The same proportion holds in the universe, the genome, and brain activity. AETHER defines the coherence coupling across the full 31 orders.
        </p>

        <EMSpectrumCanvas />

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
          <EqBlock label="EM SPECTRUM COUPLING — PINEAL + EYE" color={P.cyan}
            eq="Retina: λ = 380–780 nm (4×10¹⁴ – 8×10¹⁴ Hz)\nPineal opsin OPN5: λ_peak ≈ 380 nm (near UV)\nMagnetite: DC – 100 Hz geomagnetic coupling\nCalcite piezo: 1 Hz – 100 kHz mechanical range\nDMT σ-1 receptor: quantum coherence at ~THz"
            note="Together: 5 complementary sensors spanning DC to THz. No single one is sufficient. Together they span most of the physically relevant biological frequency range." />
          <EqBlock label="DARK MATTER PARALLEL — THE INVISIBLE MAJORITY" color={P.purple}
            eq="Universe: 95% dark (Λ-CDM consensus)\nGenome:  98% non-coding (ENCODE 2012)\nBrain:   90% unconscious (default mode)\nEM spec: 99.9999% beyond visible\nConclusion: the visible is always the 5% surface"
            note="The AETHER coherence field C(x,t) is defined over the full 31-octave EM range. The visible 5% is the readout. The dark 95% is the computation." />
        </div>
      </Sec>

      {/* ── SECTION IV: Connective Tissue Infrastructure ── */}
      <Sec id="connective">
        <Tag label="Section IV · Connective Coherence · Fascia · Dark Matter of the Body" color={P.teal} />
        <h2 style={{ fontSize: 22, fontWeight: 700, color: P.teal, margin: "10px 0 12px" }}>
          Connective Tissue · The Body's Dark Matter Network
        </h2>
        <p style={{ fontSize: 14, color: P.dim, lineHeight: 1.85, maxWidth: 760, marginBottom: 20 }}>
          The iris fiber density zone encodes the quality of the body's connective tissue network — fascia, tendons, ligaments, collagen matrices, and the extracellular matrix (ECM). This network is the body's "dark matter" — largely invisible to conventional medicine but providing the structural coherence field within which cells operate. It is piezoelectric (collagen type I is strongly piezoelectric), conducting (proton conduction along collagen fiber chains at ~10⁻² S/m), and directly coupled to the nervous system via mechanotransduction (Piezo1/Piezo2 channels in all connective tissues). The iris fiber map is the genetic blueprint of this entire infrastructure.
        </p>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(220px,1fr))", gap: 12, marginBottom: 24 }}>
          <Card title="Collagen Piezoelectricity" color={P.teal}
            body="Type I collagen (tendons, bone, fascia) generates electric potentials under compression/tension. d₃₁ ≈ 1–2 pC/N. Every step, breath, heartbeat generates micro-piezo signals throughout the fascial network. These signals trigger cell proliferation, orientation, and differentiation — a body-wide mechanical-electrical coherence field." />
          <Card title="Proton Conduction Highway" color={P.blue}
            body="Water-structured around collagen fibers (interfacial water, exclusion zone, EZ water per Pollack) conducts protons at high rates along the fiber axis. This creates a body-wide proton wire network — an 'electromagnetic dark matter' infrastructure that may carry phase information faster than nerve conduction." />
          <Card title="Iris → Fascia Blueprint" color={P.cyan}
            body="Compact iris fibers (silk/linen grade) indicate dense, well-organized collagen architecture throughout the body. Open/lacunar iris fibers indicate more reactive, less organized connective tissue — higher inflammatory load, greater ECM remodeling tendency, more Piezo1 activation sensitivity to mechanical stress." />
          <Card title="Schumann Entrainment" color={P.green}
            body="The piezoelectric fascial network resonates with external EM fields at sub-Hz to kHz frequencies. Schumann resonances (7.83, 14.3 Hz) fall within the alpha/beta brainwave band AND within the mechanical resonance frequencies of the fascial matrix. The body's connective tissue is a Schumann antenna, and iris fiber quality determines antenna gain." />
        </div>

        <EqBlock label="COLLAGEN PIEZO + EZ WATER COHERENCE FIELD" color={P.teal}
          eq="J_proton = σ_EZ · ∇φ   [proton current along EZ layer]\nσ_EZ ≈ 10⁻³ – 10⁻² S/m   [1000× bulk water]\nδ_EZ ≈ 100–300 μm   [exclusion zone thickness]\nResonance: f_n = v_EZ / (2L)   [proton conductor standing wave]"
          note="The exclusion zone around structured water in collagen creates a proton conductor 1000× more conductive than bulk water. At body scale, this creates cm-range standing wave modes at biologically relevant frequencies (Hz–kHz)." />
      </Sec>

      {/* ── SYNTHESIS ── */}
      <Sec id="synthesis">
        <Tag label="AETHER Synthesis · The Full Map" color={P.gold} />
        <div style={{ padding: "20px 22px", background: P.panel2, borderRadius: 12, border: `1px solid ${P.gold}22`, marginBottom: 28 }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: P.gold, marginBottom: 12 }}>THE PINEAL–EYE–AETHER FIELD MAP</div>
          <div style={{ fontFamily: "monospace", fontSize: 12, color: P.cyan, lineHeight: 2.2, marginBottom: 14 }}>
            Solar photons → retina (380–780nm) + pineal opsin (UV) → melatonin · circadian clock<br />
            Geomagnetic field → magnetite crystals → neural signal → SCN → autonomic tuning<br />
            Heartbeat pressure → calcite piezo → microvolt EM → pineal field modulation<br />
            Tryptophan → pineal DMT → sigma-1 · serotonin 2A → "dark matter of consciousness"<br />
            Neural crest → iris fiber topology → connective tissue map → fascial coherence network<br />
            Collagen piezo + EZ water → proton conduction → Schumann resonance coupling<br />
            <span style={{ color: P.gold }}>All of it: one coherence field C(x,t) = AETHER reading the full 31-octave EM spectrum</span>
          </div>
          <p style={{ fontSize: 13, color: P.dim, lineHeight: 1.85, margin: 0 }}>
            The pineal gland and the iris circumference are not esoteric concepts — they are precision biological instruments coupled to solar irradiance, Earth's geomagnetic field, the body's mechanical pressure field, and the biochemistry of consciousness. Different genetic traits in the iris encode different tuning parameters for this entire system — different antenna gains, different resonance frequencies, different connective tissue coherence signatures. Reading the iris circumference is reading the specification sheet for an individual's position and sensitivity within the AETHER coherence field. The dark matter of the universe, the dark genome, the unconscious mind, and the invisible EM spectrum are all the same thing at different scales — the 95% that the 5% visible is riding on.
          </p>
        </div>
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
          {["/ontological-partials","/crystallized-life-synthesis","/slime-gravity-quantization","/alfven-synthesis","/aether-health","/neuroplasticity","/coherent-body","/blood-dna-lab","/biomagnetism","/aether-engine"].map(href => (
            <a key={href} href={href} style={{ padding: "6px 14px", borderRadius: 8, border: `1px solid ${P.line}`, color: P.dim, fontSize: 12, textDecoration: "none" }}>
              {href.replace("/","").replace(/-/g," ")} →
            </a>
          ))}
        </div>
      </Sec>
    </div>
  );
}
