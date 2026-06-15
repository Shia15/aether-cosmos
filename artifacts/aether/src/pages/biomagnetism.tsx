import { useEffect, useRef, useState } from "react";

const BG    = "#020408";
const TEAL  = "#0d7377";
const AQUA  = "#14bdac";
const GOLD  = "#c9a84c";
const CORAL = "#e05c4b";
const WEB   = "#2ecc9a";
const TOUCH = "#e8a838";
const VIOLET= "#9b59b6";
const BLUE  = "#1a9fd4";
const ROSE  = "#e05c9a";
const DIM   = "#4a6a78";
const TEXT  = "#d8e8ec";
const mono  = "'Space Mono', monospace";
const serif = "'Cinzel', serif";
const body  = "'Crimson Pro', Georgia, serif";

function Chip({ c = BLUE, children }: { c?: string; children: string }) {
  return <span style={{ fontFamily: mono, fontSize: 11, color: c, background: `${c}18`, border: `1px solid ${c}40`, borderRadius: 4, padding: "2px 7px", display: "inline-block", margin: "2px 3px" }}>{children}</span>;
}
function EQ({ col = GOLD, children }: { col?: string; children: string }) {
  return <pre style={{ fontFamily: mono, fontSize: 12, color: col, background: "#030a14", borderLeft: `2px solid ${col}`, borderRadius: "0 6px 6px 0", padding: "12px 18px", margin: "12px 0", overflowX: "auto", whiteSpace: "pre-wrap" }}>{children}</pre>;
}
function SecHead({ id, n, title, sub, col = WEB }: { id: string; n: string; title: string; sub: string; col?: string }) {
  return (
    <div id={id} style={{ marginTop: 64, scrollMarginTop: 80 }}>
      <div style={{ fontFamily: mono, fontSize: 10, color: col, letterSpacing: 3, marginBottom: 6 }}>{n}</div>
      <h2 style={{ fontFamily: serif, fontSize: 26, color: "#fff", margin: "0 0 4px", letterSpacing: 1 }}>{title}</h2>
      <div style={{ fontFamily: body, fontSize: 15, color: DIM, marginBottom: 20 }}>{sub}</div>
      <div style={{ height: 1, background: `linear-gradient(90deg,${col}60,transparent)`, marginBottom: 28 }} />
    </div>
  );
}
function Pull({ col = WEB, children }: { col?: string; children: string }) {
  return <blockquote style={{ borderTop: `2px solid ${col}`, borderBottom: `2px solid ${col}`, padding: "14px 24px", margin: "24px 0", fontFamily: body, fontStyle: "italic", fontSize: 18, color: col, lineHeight: 1.6, textAlign: "center" }}>{children}</blockquote>;
}
function Tbl({ headers, rows }: { headers: string[]; rows: string[][] }) {
  return (
    <div style={{ overflowX: "auto", margin: "14px 0" }}>
      <table style={{ width: "100%", borderCollapse: "collapse", fontFamily: body, fontSize: 14 }}>
        <thead><tr style={{ background: TEAL }}>{headers.map((h, i) => <th key={i} style={{ fontFamily: mono, fontSize: 9, color: "#fff", textAlign: "left", padding: "6px 10px", letterSpacing: 1 }}>{h}</th>)}</tr></thead>
        <tbody>{rows.map((row, ri) => <tr key={ri} style={{ background: ri % 2 === 0 ? "rgba(13,31,45,0.5)" : "transparent" }}>{row.map((c, ci) => <td key={ci} style={{ padding: "7px 10px", color: TEXT, borderBottom: "1px solid #0d1f2d" }}>{c}</td>)}</tr>)}</tbody>
      </table>
    </div>
  );
}

/* ══ CANVAS ══ */
type Mode = "fieldmap" | "patterns" | "demag";

function BiomagnCanvas({ mode }: { mode: Mode }) {
  const cvs = useRef<HTMLCanvasElement>(null);
  const raf = useRef(0);
  const tick = useRef(0);

  useEffect(() => {
    const canvas = cvs.current!;
    const ctx = canvas.getContext("2d")!;
    const resize = () => {
      const p = canvas.parentElement!;
      canvas.width = p.clientWidth;
      canvas.height = Math.min(420, Math.round(p.clientWidth * 0.54));
    };
    resize();
    window.addEventListener("resize", resize);

    /* field-map particles */
    const PART_N = 90;
    const parts = Array.from({ length: PART_N }, (_, i) => ({
      angle: (i / PART_N) * Math.PI * 2,
      r: 0.06 + Math.random() * 0.35,
      speed: 0.008 + Math.random() * 0.006,
      size: 1.5 + Math.random() * 2.5,
      origin: i % 3 === 0 ? "heart" : i % 3 === 1 ? "brain" : "body",
    }));
    /* pattern nodes — non-physical phenomena */
    const PAT_N = 40;
    const patPts = Array.from({ length: PAT_N }, (_, i) => ({
      x: 0.1 + Math.random() * 0.8,
      y: 0.1 + Math.random() * 0.8,
      vx: (Math.random() - 0.5) * 0.003,
      vy: (Math.random() - 0.5) * 0.003,
      phase: Math.random() * Math.PI * 2,
      type: i % 4, // 0=magnetite, 1=emotional, 2=morphic, 3=quantum
    }));
    /* demagnetization — field decay */
    let demagT = 0;

    const draw = () => {
      const W = canvas.width, H = canvas.height;
      const t = tick.current;
      ctx.clearRect(0, 0, W, H); ctx.fillStyle = BG; ctx.fillRect(0, 0, W, H);

      /* ── HUMAN FIELD MAP ── */
      if (mode === "fieldmap") {
        const cx = W / 2, cy = H * 0.48;
        const scale = Math.min(W, H) * 0.38;

        // Human silhouette (simplified)
        ctx.save(); ctx.globalAlpha = 0.12;
        // Body
        ctx.beginPath(); ctx.ellipse(cx, cy + scale * 0.25, scale * 0.18, scale * 0.4, 0, 0, Math.PI * 2);
        ctx.fillStyle = "#14bdac"; ctx.fill();
        // Head
        ctx.beginPath(); ctx.ellipse(cx, cy - scale * 0.35, scale * 0.11, scale * 0.13, 0, 0, Math.PI * 2);
        ctx.fillStyle = "#14bdac"; ctx.fill();
        ctx.restore();

        // HEART FIELD — strongest, toroidal
        const heartX = cx - scale * 0.04, heartY = cy + scale * 0.02;
        for (let ring = 1; ring <= 7; ring++) {
          const R_ring = ring * scale * 0.07;
          const alpha = 0.3 - ring * 0.032;
          const pulse = 0.6 + 0.4 * Math.sin(t * 0.06 - ring * 0.3);
          // Toroidal ring
          ctx.beginPath(); ctx.ellipse(heartX, heartY, R_ring, R_ring * 0.55, 0, 0, Math.PI * 2);
          ctx.strokeStyle = `rgba(232,168,56,${alpha * pulse})`; ctx.lineWidth = 1; ctx.stroke();
          // Field lines
          for (let a = 0; a < 8; a++) {
            const angle = (a / 8) * Math.PI * 2 + t * 0.01;
            const fx = heartX + Math.cos(angle) * R_ring;
            const fy = heartY + Math.sin(angle) * R_ring * 0.55;
            ctx.beginPath(); ctx.arc(fx, fy, 1.5, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(232,168,56,${(alpha + 0.1) * pulse})`; ctx.fill();
          }
        }
        ctx.fillStyle = `${TOUCH}cc`; ctx.font = `8px ${mono}`; ctx.textAlign = "center";
        ctx.fillText("HEART", heartX, heartY + scale * 0.55);
        ctx.fillText("50,000 fT · STRONGEST", heartX, heartY + scale * 0.55 + 11);

        // BRAIN FIELD — neural MEG
        const brainX = cx, brainY = cy - scale * 0.35;
        for (let ring = 1; ring <= 5; ring++) {
          const R_ring = ring * scale * 0.045;
          const alpha = 0.22 - ring * 0.03;
          const pulse = 0.6 + 0.4 * Math.sin(t * 0.08 + ring * 0.5);
          ctx.beginPath(); ctx.arc(brainX, brainY, R_ring, 0, Math.PI * 2);
          ctx.strokeStyle = `rgba(155,89,182,${alpha * pulse})`; ctx.lineWidth = 0.8; ctx.stroke();
        }
        ctx.fillStyle = `${VIOLET}cc`; ctx.font = `8px ${mono}`; ctx.textAlign = "center";
        ctx.fillText("BRAIN MEG", brainX, brainY - scale * 0.2);
        ctx.fillText("100–500 fT", brainX, brainY - scale * 0.2 + 11);

        // BODY FIELD — bioelectric / magnetite
        for (let i = 0; i < 12; i++) {
          const bx = cx + (Math.random() - 0.5) * scale * 0.28;
          const by = cy + (Math.random() - 0.5) * scale * 0.5;
          const pulse = 0.3 + 0.2 * Math.sin(t * 0.04 + i);
          ctx.beginPath(); ctx.arc(bx, by, 2, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(20,189,172,${pulse})`; ctx.fill();
        }

        // Orbital field particles
        for (const p of parts) {
          p.angle += p.speed;
          const srcX = p.origin === "heart" ? heartX : p.origin === "brain" ? brainX : cx;
          const srcY = p.origin === "heart" ? heartY : p.origin === "brain" ? brainY : cy;
          const px = srcX + Math.cos(p.angle) * p.r * scale;
          const py = srcY + Math.sin(p.angle) * p.r * scale * 0.6;
          const col = p.origin === "heart" ? TOUCH : p.origin === "brain" ? VIOLET : AQUA;
          ctx.beginPath(); ctx.arc(px, py, p.size * 0.5, 0, Math.PI * 2);
          ctx.fillStyle = col + "80"; ctx.fill();
        }

        // Scale bar
        ctx.fillStyle = `${DIM}80`; ctx.font = `7px ${mono}`; ctx.textAlign = "left";
        ctx.fillText("MAGNETIC FIELD STRENGTH (logarithmic scale):", W * 0.03, H - 28);
        const scaleItems = [["50k fT", TOUCH], ["500 fT", VIOLET], ["~1 fT", AQUA]];
        scaleItems.forEach(([label, col], i) => {
          ctx.fillStyle = col as string; ctx.font = `7px ${mono}`;
          ctx.fillText(`${label} = ${["Heart", "Brain MEG", "Body"][i]}`, W * 0.03 + i * W * 0.22, H - 14);
        });
      }

      /* ── NON-PHYSICAL PATTERNS ── */
      else if (mode === "patterns") {
        // 4 domains in 4 quadrants
        const domains = [
          { x: 0.25, y: 0.3, col: GOLD,   label: "MAGNETITE CRYSTALS", sub: "Fe₃O₄ · 5M crystals/brain" },
          { x: 0.75, y: 0.3, col: CORAL,   label: "EMOTIONAL FIELD",    sub: "Heart coherence ↔ HRV" },
          { x: 0.25, y: 0.72, col: VIOLET, label: "MORPHIC RESONANCE",  sub: "Form fields · Sheldrake" },
          { x: 0.75, y: 0.72, col: WEB,    label: "QUANTUM SPIN BATH",  sub: "Radical pair mechanism" },
        ];

        // Background grid
        for (let gi = 0; gi <= 20; gi++) {
          ctx.strokeStyle = `rgba(13,115,119,0.06)`; ctx.lineWidth = 0.5;
          ctx.beginPath(); ctx.moveTo((gi / 20) * W, 0); ctx.lineTo((gi / 20) * W, H); ctx.stroke();
          ctx.beginPath(); ctx.moveTo(0, (gi / 20) * H); ctx.lineTo(W, (gi / 20) * H); ctx.stroke();
        }

        // Domain glows + particles
        for (const d of domains) {
          const dx = d.x * W, dy = d.y * H;
          const glow = ctx.createRadialGradient(dx, dy, 0, dx, dy, W * 0.2);
          glow.addColorStop(0, `${d.col}20`); glow.addColorStop(1, "transparent");
          ctx.beginPath(); ctx.arc(dx, dy, W * 0.2, 0, Math.PI * 2); ctx.fillStyle = glow; ctx.fill();
          ctx.fillStyle = d.col + "cc"; ctx.font = `8px ${mono}`; ctx.textAlign = "center";
          ctx.fillText(d.label, dx, dy + W * 0.14);
          ctx.fillStyle = `${DIM}cc`; ctx.font = `7px ${mono}`;
          ctx.fillText(d.sub, dx, dy + W * 0.14 + 12);
        }

        // Pattern particles — drifting across quadrants
        for (const p of patPts) {
          p.x += p.vx; p.y += p.vy; p.phase += 0.025;
          if (p.x < 0.05 || p.x > 0.95) p.vx *= -1;
          if (p.y < 0.05 || p.y > 0.95) p.vy *= -1;
          const cols = [GOLD, CORAL, VIOLET, WEB];
          const col = cols[p.type];
          const alpha = 0.3 + 0.4 * Math.abs(Math.sin(p.phase));
          ctx.beginPath(); ctx.arc(p.x * W, p.y * H, 3, 0, Math.PI * 2);
          ctx.fillStyle = `${col}${Math.round(alpha * 200).toString(16).padStart(2, "0")}`; ctx.fill();
          // Inter-domain connections
          for (const q of patPts) {
            if (q === p) continue;
            const ddx = (p.x - q.x) * W, ddy = (p.y - q.y) * H;
            const dd = Math.sqrt(ddx * ddx + ddy * ddy);
            if (dd < W * 0.12 && p.type !== q.type) {
              ctx.beginPath(); ctx.moveTo(p.x * W, p.y * H); ctx.lineTo(q.x * W, q.y * H);
              ctx.strokeStyle = `rgba(13,115,119,${0.06 * (1 - dd / (W * 0.12))})`; ctx.lineWidth = 0.5; ctx.stroke();
            }
          }
        }

        // Central AETHER node
        const ccx = W / 2, ccy = H / 2;
        const cg = ctx.createRadialGradient(ccx, ccy, 0, ccx, ccy, 40);
        cg.addColorStop(0, `rgba(46,204,154,${0.3 + 0.15 * Math.sin(t * 0.04)})`); cg.addColorStop(1, "transparent");
        ctx.beginPath(); ctx.arc(ccx, ccy, 40, 0, Math.PI * 2); ctx.fillStyle = cg; ctx.fill();
        ctx.fillStyle = `${WEB}cc`; ctx.font = `bold 11px ${mono}`; ctx.textAlign = "center";
        ctx.fillText("C(x,t)", ccx, ccy + 4);
        ctx.fillStyle = `${DIM}90`; ctx.font = `7px ${mono}`;
        ctx.fillText("AETHER FIELD", ccx, ccy + 16);

        // Lines from central to domains
        for (const d of domains) {
          const pulse = 0.2 + 0.15 * Math.sin(t * 0.03 + d.x + d.y);
          ctx.setLineDash([3, 5]);
          ctx.beginPath(); ctx.moveTo(ccx, ccy); ctx.lineTo(d.x * W, d.y * H);
          ctx.strokeStyle = `${d.col}${Math.round(pulse * 255).toString(16).padStart(2, "0")}`; ctx.lineWidth = 0.8; ctx.stroke();
          ctx.setLineDash([]);
        }
      }

      /* ── DEMAGNETIZATION ── */
      else if (mode === "demag") {
        demagT += 0.008;
        const cx = W / 2, cy = H / 2;
        const coherence = Math.max(0.05, 0.9 - 0.5 * Math.sin(demagT * 0.8));

        // Background showing external EMF noise
        for (let i = 0; i < 8; i++) {
          const bx = (Math.sin(t * 0.04 + i * 1.1) * 0.5 + 0.5) * W;
          const by = (Math.cos(t * 0.03 + i * 0.8) * 0.5 + 0.5) * H;
          const noise = ctx.createRadialGradient(bx, by, 0, bx, by, W * 0.25);
          noise.addColorStop(0, `rgba(224,92,75,${0.04 * (1 - coherence)})`); noise.addColorStop(1, "transparent");
          ctx.beginPath(); ctx.arc(bx, by, W * 0.25, 0, Math.PI * 2); ctx.fillStyle = noise; ctx.fill();
        }

        // Coherent magnetite crystal array — 5×5 grid
        const GRID_N = 5;
        const gridW = W * 0.5, gridH = H * 0.5;
        const startX = cx - gridW / 2, startY = cy - gridH / 2;
        for (let gi = 0; gi < GRID_N; gi++) {
          for (let gj = 0; gj < GRID_N; gj++) {
            const mx = startX + (gi / (GRID_N - 1)) * gridW;
            const my = startY + (gj / (GRID_N - 1)) * gridH;
            // Each crystal has a moment vector — aligned or not
            const jitter = (1 - coherence) * 2.5;
            const momentAngle = -Math.PI / 2 + (Math.random() < coherence ? 0 : (Math.random() - 0.5) * Math.PI * jitter);
            const mLen = 12 * coherence;
            const col = coherence > 0.6 ? WEB : coherence > 0.35 ? TOUCH : CORAL;
            // Crystal body
            ctx.beginPath(); ctx.arc(mx, my, 4, 0, Math.PI * 2);
            ctx.fillStyle = `${GOLD}80`; ctx.fill();
            ctx.strokeStyle = `${GOLD}40`; ctx.lineWidth = 0.5; ctx.stroke();
            // Moment arrow
            ctx.beginPath(); ctx.moveTo(mx, my); ctx.lineTo(mx + Math.cos(momentAngle) * mLen, my + Math.sin(momentAngle) * mLen);
            ctx.strokeStyle = col + "cc"; ctx.lineWidth = 1.5; ctx.stroke();
            // Arrow head
            ctx.beginPath();
            ctx.arc(mx + Math.cos(momentAngle) * mLen, my + Math.sin(momentAngle) * mLen, 2.5, 0, Math.PI * 2);
            ctx.fillStyle = col + "cc"; ctx.fill();
          }
        }

        // Coherence meter
        const barX = W * 0.05, barY = H * 0.88, barW = W * 0.9;
        ctx.fillStyle = "#0a1520"; ctx.fillRect(barX, barY, barW, 10);
        const barCol = coherence > 0.6 ? WEB : coherence > 0.35 ? TOUCH : CORAL;
        ctx.fillStyle = barCol; ctx.fillRect(barX, barY, barW * coherence, 10);
        ctx.fillStyle = barCol; ctx.font = `8px ${mono}`; ctx.textAlign = "left";
        ctx.fillText(`MAGNETIC COHERENCE: ${(coherence * 100).toFixed(0)}%  ${coherence > 0.65 ? "MAGNETIZED · ALIGNED" : coherence > 0.35 ? "PARTIAL · DISRUPTED" : "DEMAGNETIZED · SCATTERED"}`, barX, barY - 6);

        // EMF sources
        ctx.fillStyle = `${CORAL}90`; ctx.font = `8px ${mono}`; ctx.textAlign = "center";
        ctx.fillText(`EXTERNAL EMF · 5G · GEOMAGNETIC · EMOTIONAL STRESS → DECOHERENCE RATE ${((1 - coherence) * 0.08).toFixed(3)} min⁻¹`, W / 2, H * 0.07);
      }

      tick.current++; raf.current = requestAnimationFrame(draw);
    };
    draw();
    return () => { cancelAnimationFrame(raf.current); window.removeEventListener("resize", resize); };
  }, [mode]);

  return (
    <div style={{ borderRadius: 10, overflow: "hidden", border: `1px solid ${TOUCH}20` }}>
      <canvas ref={cvs} style={{ display: "block", width: "100%" }} />
    </div>
  );
}

function ModeTabs({ value, onChange }: { value: Mode; onChange: (m: Mode) => void }) {
  const tabs = [
    { k: "fieldmap" as Mode, label: "Human Magnetic Field Map", col: TOUCH  },
    { k: "patterns" as Mode, label: "Non-Physical Patterns · 4 Domains",   col: VIOLET },
    { k: "demag"    as Mode, label: "Magnetization → Demagnetization",      col: CORAL  },
  ];
  return (
    <div style={{ display: "flex", gap: 6, marginBottom: 10, flexWrap: "wrap" }}>
      {tabs.map(tab => (
        <button key={tab.k} onClick={() => onChange(tab.k)} style={{ fontFamily: mono, fontSize: 10, padding: "5px 14px", borderRadius: 4, cursor: "pointer", border: `1px solid ${value === tab.k ? tab.col : DIM + "60"}`, background: value === tab.k ? `${tab.col}18` : "transparent", color: value === tab.k ? tab.col : DIM, transition: "all 0.2s" }}>{tab.label}</button>
      ))}
    </div>
  );
}

const NAV = [
  { id: "s1", label: "Biomagnetism" },    { id: "s2", label: "Heart Field" },
  { id: "s3", label: "Brain MEG" },       { id: "s4", label: "Magnetite" },
  { id: "s5", label: "Non-Physical" },    { id: "s6", label: "Demagnetization" },
  { id: "s7", label: "Morphic Field" },   { id: "s8", label: "AETHER" },
];

export default function BiomagnetismPage() {
  const [mode, setMode] = useState<Mode>("fieldmap");
  return (
    <div style={{ background: BG, minHeight: "100vh", fontFamily: body, color: TEXT }}>
      <div style={{ padding: "66px 28px 42px", textAlign: "center", background: "linear-gradient(180deg,#030a14 0%,#020408 100%)", borderBottom: `1px solid ${TOUCH}18` }}>
        <div style={{ fontFamily: mono, fontSize: 10, color: TOUCH, letterSpacing: 4, marginBottom: 12 }}>AETHER · BIOMAGNETISM · NON-PHYSICAL PHENOMENA</div>
        <h1 style={{ fontFamily: serif, fontSize: "clamp(18px,3.8vw,38px)", color: "#fff", margin: "0 0 10px", letterSpacing: 2, lineHeight: 1.15 }}>
          MAGNETIZATION IN HUMANS<br /><span style={{ color: TOUCH }}>PATTERNS · FORMS · UNFORESEEN INTERACTIONS</span>
        </h1>
        <div style={{ fontFamily: body, fontStyle: "italic", fontSize: 16, color: VIOLET, marginBottom: 16 }}>
          Biomagnetism · Magnetite Crystals · Emotional Field · Morphic Resonance · Quantum Spin Bath
        </div>
        <p style={{ fontFamily: body, fontSize: 16, color: DIM, maxWidth: 720, margin: "0 auto 24px", lineHeight: 1.8 }}>
          The human body is a magnetic system. The heart generates a toroidal magnetic field
          measurable 3 metres away. The brain contains ~5 million magnetite (Fe₃O₄) crystals.
          These fields couple to external EMF, geomagnetic fluctuations, and other humans.
          Beyond the physical: patterns and forms emerge in the non-physical phenomena —
          morphic resonance, radical pair quantum spin baths, emotional field coherence —
          interactions science has detected but not yet explained.
        </p>
        <div style={{ display: "flex", gap: 8, justifyContent: "center", flexWrap: "wrap" }}>
          <Chip c={TOUCH}>Heart · 50,000 fT Toroid</Chip>
          <Chip c={VIOLET}>Brain MEG · 100–500 fT</Chip>
          <Chip c={GOLD}>Magnetite Fe₃O₄ · 5M crystals</Chip>
          <Chip c={CORAL}>Demagnetization · EMF</Chip>
          <Chip c={WEB}>Morphic Fields</Chip>
          <Chip c={BLUE}>Radical Pair QM</Chip>
        </div>
      </div>

      <div style={{ position: "sticky", top: 0, zIndex: 50, background: `${BG}f2`, backdropFilter: "blur(12px)", borderBottom: `1px solid ${TOUCH}12`, padding: "8px 18px", display: "flex", gap: 4, overflowX: "auto" }}>
        {NAV.map(s => (
          <a key={s.id} href={`#${s.id}`} style={{ fontFamily: mono, fontSize: 10, color: DIM, whiteSpace: "nowrap", padding: "4px 10px", borderRadius: 4, textDecoration: "none" }}
            onMouseEnter={e => { (e.target as HTMLElement).style.color = TOUCH; }}
            onMouseLeave={e => { (e.target as HTMLElement).style.color = DIM; }}
          >{s.label}</a>
        ))}
      </div>

      <div style={{ maxWidth: 940, margin: "0 auto", padding: "0 22px 96px" }}>
        <div style={{ marginTop: 36 }}>
          <ModeTabs value={mode} onChange={setMode} />
          <BiomagnCanvas mode={mode} />
          <div style={{ fontFamily: mono, fontSize: 9, color: DIM, marginTop: 6 }}>
            {mode === "fieldmap" && "TOROIDAL HEART FIELD (AMBER RINGS) · BRAIN MEG FIELD (VIOLET) · BODY BIOELECTRIC/MAGNETITE (TEAL) · ORBITING PARTICLES = FIELD LINES IN MOTION"}
            {mode === "patterns" && "4 NON-PHYSICAL DOMAINS: MAGNETITE (GOLD) · EMOTIONAL FIELD (CORAL) · MORPHIC RESONANCE (VIOLET) · QUANTUM SPIN BATH (GREEN) · ALL COUPLED THROUGH AETHER C(x,t) CENTRE"}
            {mode === "demag"    && "5×5 MAGNETITE CRYSTAL GRID · ARROWS = MAGNETIC MOMENT DIRECTION · ALIGNED = MAGNETIZED · SCATTERED = DEMAGNETIZED · EMF/STRESS DRIVES COHERENCE DECAY"}
          </div>
        </div>

        <SecHead id="s1" n="I" title="Human Biomagnetism — Measured Reality" sub="The body's magnetic fields are real, measurable, and physiologically significant" col={TOUCH} />
        <p style={{ fontFamily: body, fontSize: 16, lineHeight: 1.8, marginBottom: 18 }}>
          Biomagnetism is not speculative — it is measured using SQUID (Superconducting Quantum
          Interference Device) magnetometers in magnetically shielded rooms. The heart is the
          body's strongest magnetic source. The brain produces measurable magnetic fields via
          neural current flow. These fields are 8–9 orders of magnitude weaker than the
          Earth's geomagnetic field — yet they carry information about the body's internal state
          that physical examination cannot access.
        </p>
        <Tbl headers={["Source", "Field Strength", "Measurement Method", "Physiological Role", "AETHER Significance"]}
          rows={[
            ["Heart (MCG)", "50,000–100,000 fT (femtotesla)", "SQUID · detectable 3m away", "Toroidal field encoding HRV (heart rate variability), autonomic state", "Strongest C(x,t) oscillator in body — pacemaker of biofield coherence"],
            ["Brain (MEG)", "100–500 fT", "SQUID array (306 channels)", "Neural current dipoles — encodes cognitive state, sleep stages, seizure", "8-band cognitive modes each have distinct MEG signature"],
            ["Muscle (MMG)", "1,000–10,000 fT", "SQUID", "Muscle activation field — maps motor unit firing patterns", "Embodied cognition — Spatial × Intuition band coupling"],
            ["Lung (MPG)", "100,000 fT (post-iron dust)", "SQUID", "Iron particle accumulation — respiratory function marker", "Body as magnetite accumulator — environmental iron loading"],
            ["Stomach (MGG)", "20,000 fT", "SQUID", "Slow wave propagation — digestive rhythm", "Enteric nervous system — the 'second brain' biofield"],
            ["Eye (MOG)", "10 fT", "SQUID", "Retinal field — photoreceptor currents during visual processing", "Visual perception links to magnetite via magnetosensory pathways?"],
          ]}
        />

        <SecHead id="s2" n="II" title="The Heart's Toroidal Field" sub="The largest, most coherent electromagnetic field generated by the human body" col={TOUCH} />
        <EQ col={TOUCH}>{`Heart's magnetic field — quantitative:
  MCG field at chest surface: B ~ 50,000–100,000 fT = 5×10⁻¹¹ T
  Measurable at 3 metres: B ~ 10–50 fT (still above SQUID noise floor)
  Comparison: Earth's field ~ 25,000,000,000 fT = 50 μT (500,000× stronger)
  
  Field topology: toroidal
    Field lines exit from one magnetic pole (bottom of heart apex),
    wrap around through the body and space, and re-enter at the other pole
    → The heart is NOT a magnetic dipole — it is a toroidal source
    → Toroidal field = closed field lines = self-contained topology
    → Same topology as the torus knots in plasma (T(2,1) configuration)

  Heart Rate Variability (HRV) and field coherence:
    HRV: beat-to-beat variation in R-R interval (milliseconds)
    High HRV: parasympathetic dominant — relaxed, coherent, adaptable
    Low HRV: sympathetic dominant — stressed, rigid, fragile
    
    HeartMath Institute (1995-2024):
      Heart coherence: HRV power spectrum peaks at 0.1 Hz (10s period)
      At 0.1 Hz resonance: heart, lungs, blood pressure all phase-lock → "global coherence"
      Global coherence = AETHER Coherence Lock condition applied to the cardiac system
      
      Field synchronisation between people:
        When person A enters cardiac coherence, person B's EEG shows
        a phase-locked response at 0.1 Hz (within 1–5 metres)
        → The toroidal field IS the coupling mechanism
        → "Touch the Ball" condition: person A's field achieves coherence lock
           with person B's cardiac field → information transfer via biomagnetism`}</EQ>

        <SecHead id="s3" n="III" title="Magnetite in Human Brain — Fe₃O₄" sub="~5 million magnetite crystals per gram of brain tissue — why are they there?" col={GOLD} />
        <EQ col={GOLD}>{`Discovery: Kirschvink et al., 1992 (Caltech)
  First confirmed biological magnetite in human brain tissue
  
  Magnetite (Fe₃O₄) properties:
    Ferrimagnetic mineral — permanent magnetic moment
    Coercivity: H_c ≈ 10–50 mT (relatively hard magnet)
    Curie temperature: T_c = 858K (stable at all biological temperatures)
    Crystal size in brain: 50–100nm (single-domain particles — maximum moment/volume)
    
  Distribution:
    Concentration: ~5 × 10⁶ crystals per gram of brain tissue
    Location: meninges (membranes surrounding brain), cerebral cortex, cerebellum
    Total mass: ~5 × 10⁻⁷ g (half a microgram — tiny but coherent)
    Organisation: chains of 10–20 crystals (magnetosomes) — like bacterial magnetotaxis
    
  What are they doing?
    Hypothesis 1: Magnetoreception — compass sense (vestigial navigation system)
      Magnetotactic bacteria use identical magnetosomes for orientation to geomagnetic field
      Evidence: humans show weak magnetic sense (Kirschvink 2019 — EEG alpha suppression
        during rotating 25μT field — p < 0.001 — confirms neural response to magnetic rotation)
    Hypothesis 2: Signal transduction — coupling geomagnetic to neural circuits
      25μT field change → magnetosome torque → mechanosensitive ion channels → Ca²⁺ influx
      → modulates neural firing rates (non-thermal, non-ionizing interaction)
    Hypothesis 3: Quantum coherence — magneto-mechanical oscillator
      Single-domain magnetite = quantum harmonic oscillator at biological temperatures?
      Phonon modes: f_magnetite ≈ kBT/ħ ~ 10¹³ Hz — room temperature, rapid decoherence
      AETHER reading: magnetite crystals are C(x,t) anchor points — local maxima of coherence field

  Why not electromagnetism?
    EMF from power lines, phones, WiFi: 50Hz–5GHz, E-field dominant
    Magnetite responds to B-field (magnetic) not E-field (electric)
    5G (28–39 GHz): wavelength 7.5–10.7mm, skin depth ~1mm — does NOT penetrate brain
    BUT: 50Hz magnetic field (power lines) DOES penetrate (skin depth >> body size at 50Hz)
    Concern: 50Hz oscillation near magnetite resonance → crystal oscillation → ion channel modulation`}</EQ>

        <SecHead id="s4" n="IV" title="Non-Physical Patterns and Forms" sub="Section 4: phenomena detected but not yet mechanistically explained" col={VIOLET} />
        <p style={{ fontFamily: body, fontSize: 16, lineHeight: 1.8, marginBottom: 18 }}>
          Beyond the measured biomagnetism — which is well-established physics — there exist
          patterns and forms in human electromagnetic interaction that resist conventional
          explanation. Not because they are false, but because the framework for explaining them
          is incomplete. These are the non-physical phenomena: detected, reproducible in some
          cases, but not yet mechanistically grounded. AETHER treats them as evidence that the
          C(x,t) coherence field has range and coupling properties not yet captured by the Standard Model.
        </p>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 24 }}>
          {[
            { col: GOLD, title: "MAGNETITE QUANTUM SENSING", evidence: "Kirschvink 2019: human EEG shows alpha-band suppression during passive field rotation — same signature as bird magnetic compass. Joseph Kirschvink: humans ARE magnetosensitive.", mechanism: "Magnetite single-domain crystals → mechanosensitive ion channels (TRPV1, PIEZO1) → Ca²⁺ transients → neural modulation", mystery: "Why do some humans show stronger responses? Individual magnetite crystal density varies 10-fold. Does diet (iron intake), emotional state, or AETHER coherence level modulate sensitivity?" },
            { col: CORAL, title: "EMOTIONAL FIELD COUPLING", evidence: "Rollin McCraty (HeartMath): EEG of person B shows spectral peaks matching heart field of person A during physical proximity. Effective at 1.5m. Intensity correlates with emotional state of A.", mechanism: "Heart toroidal field (50,000 fT) amplitude-modulated by autonomic state → encodes emotional information → received by B's magnetite + cardiac field → neural response", mystery: "How does emotional content (not just frequency) get encoded? The toroidal field carries more information than a simple dipole. What is the modulation mechanism for 'positive' vs 'negative' emotional signal?" },
            { col: VIOLET, title: "MORPHIC RESONANCE (SHELDRAKE)", evidence: "Sheldrake's morphogenetic field hypothesis: forms accumulate a 'memory' in a non-physical field. Experimental data: rats learning a maze → subsequent rats learn faster (unexplained by genetics). Crystal formation rates: known crystals form faster than novel ones globally.", mechanism: "Unknown. Sheldrake proposes a field analogous to QM non-locality — form is stored in a field not localized in space-time. Main objection: no carrier mechanism identified.", mystery: "AETHER reading: morphic fields could be self-sustaining C(x,t) attractors — topological invariants of the coherence field that persist after the physical substrate changes. The knot topology (Plasma Knots: helicity conservation) applied to biological form." },
            { col: WEB, title: "RADICAL PAIR QUANTUM COMPASS", evidence: "Proven mechanism in birds (European robin): cryptochrome proteins in retina contain radical pairs (two molecules each with one unpaired electron). Geomagnetic field (25–65μT) affects their quantum spin state → modulates chemical reaction rate → visual signal.", mechanism: "Cryptochrome + light → excited singlet state → inter-system crossing → triplet radical pair. Earth's field (25μT) → Zeeman effect → singlet/triplet ratio → oxidized/reduced cryptochrome → downstream signaling", mystery: "Do humans have functional cryptochromes? Human CRY1 and CRY2 exist (circadian clock proteins). Are they also magnetosensitive? 2021 Ref: Hore et al — human CRY1/2 show radical pair reactions in vitro. Functional magnetoreception via cryptochrome: unconfirmed in vivo." },
          ].map(d => (
            <div key={d.col} style={{ borderTop: `3px solid ${d.col}`, background: "rgba(13,31,45,0.85)", borderRadius: 4, padding: "14px 16px" }}>
              <div style={{ fontFamily: mono, fontSize: 9, color: d.col, letterSpacing: 2, marginBottom: 8 }}>{d.title}</div>
              <div style={{ fontFamily: mono, fontSize: 9, color: `${d.col}80`, marginBottom: 4 }}>EVIDENCE</div>
              <div style={{ fontFamily: body, fontSize: 12, color: "#7a9aa2", lineHeight: 1.6, marginBottom: 10 }}>{d.evidence}</div>
              <div style={{ fontFamily: mono, fontSize: 9, color: `${d.col}80`, marginBottom: 4 }}>MECHANISM</div>
              <div style={{ fontFamily: body, fontSize: 12, color: "#6a8a92", lineHeight: 1.6, marginBottom: 10 }}>{d.mechanism}</div>
              <div style={{ fontFamily: mono, fontSize: 9, color: `${GOLD}80`, marginBottom: 4 }}>AETHER QUESTION</div>
              <div style={{ fontFamily: body, fontSize: 12, color: "#5a7a82", lineHeight: 1.55 }}>{d.mystery}</div>
            </div>
          ))}
        </div>

        <SecHead id="s5" n="V" title="Demagnetization — Unforeseen Interactions" sub="How human magnetism is disrupted — and what that disruption costs" col={CORAL} />
        <EQ col={CORAL}>{`Human magnetic field decoherence sources:

ENVIRONMENTAL EMF:
  Power-frequency (50/60 Hz):
    Skin depth δ = √(2ρ/ωμ) = 60–90m at 50Hz → FULL BODY PENETRATION
    B from power lines: 0.01–10 μT at 0.5m (dwarfs endogenous 50,000 fT)
    Magnetite response: 50Hz oscillation → mechanical torque on magnetosomes
    Ion channel effect: prolonged 50Hz exposure → Ca²⁺ dysregulation (in vitro: confirmed)
    Clinical correlation: leukemia risk near high-voltage lines (IARC Group 2B carcinogen)

  Radiofrequency (100MHz–5GHz, WiFi, phones, 5G sub-6GHz):
    Skin depth at 2.4GHz: δ ≈ 1cm → limited penetration of brain
    SAR (Specific Absorption Rate): regulated at 1.6 W/kg (US), 2.0 W/kg (EU)
    Thermal effect: well-documented (SAR heating)
    Non-thermal: disputed. Some studies show altered Ca²⁺ oscillation at non-heating levels
    IARC classification: RF as Group 2B (possibly carcinogenic) — limited evidence

  Geomagnetic fluctuation:
    Normal Earth field: 25–65 μT (latitude-dependent)
    Geomagnetic storms (Kp ≥ 5): field variations of 100–1000 nT over hours
    Human magnetite: coercivity 10–50 mT >> geomagnetic variations → physically cannot demagnetize
    HOWEVER: magnetite chain orientation → slight shifts → ion channel sensitivity changes
    Correlation: geomagnetic storms → increased cardiac events (multiple studies, disputed)

INTERNAL DEMAGNETIZATION:
  Cortisol cascade (stress → HPA axis):
    High cortisol → reduced HRV → heart field loses 0.1Hz coherence peak
    Heart field becomes incoherent (broad spectrum) vs coherent (narrow 0.1Hz peak)
    Incoherent toroidal field: reduced far-field amplitude, scrambled information content
    This is "emotional demagnetization" — the field loses its organised structure

  Oxidative stress:
    Fe₃O₄ + reactive oxygen species → Fe²⁺ + Fe³⁺ dissolution → magnetite crystal damage
    Chronic inflammation → magnetite degradation → reduced magnetosensitivity

Re-magnetization protocol (AETHER):
  1. Cardiac coherence: 0.1Hz breathing (5s in, 5s out) → heart field coherence
  2. Grounding (earthing): skin contact with soil → equipotential with Earth's surface field
  3. Solar exposure: UV-A → vitamin D → Ca²⁺ regulation → magnetosome stability
  4. Reduce 50Hz exposure during sleep (switch off nearby devices)
  5. Iron-rich nutrition (bioavailable Fe³⁺): maintains magnetite crystal density`}</EQ>

        <SecHead id="s6" n="VI" title="Morphic Fields · Topological Form Memory" sub="If information is conserved by topology, form memory requires no physical substrate" col={VIOLET} />
        <p style={{ fontFamily: body, fontSize: 16, lineHeight: 1.8, marginBottom: 18 }}>
          Rupert Sheldrake's morphic resonance hypothesis proposes that forms — biological,
          chemical, behavioral — accumulate a field memory that influences subsequent
          instances of the same form. The controversial claim: rats in London learning a maze
          makes it easier for rats in Tokyo to learn the same maze, without genetic or
          communicative connection. Crystal formation accelerating over time for new compounds.
          The question is not whether the data is real (some is controversial) but whether
          AETHER provides a mechanism.
        </p>
        <EQ col={VIOLET}>{`AETHER morphic field mechanism (proposed):

Morphic field as topological attractor in C(x,t):
  When a form F is instantiated in a medium (biological, chemical, physical):
    → The C(x,t) field develops a local minimum (attractor) at the form's topology
    → This attractor is topologically protected (like magnetic helicity in plasma)
    → Once established, it persists even when the physical instantiation changes

  Formally: for any form F with knot invariant K(F):
    C_F(x,t) = C_background + ε · Φ_K(x,t)
    Φ_K: eigensolution of AETHER field equation with knot eigenvalue K
    ε: coupling constant (how strongly the form embeds in the C-field)

  The accumulated form (Sheldrake's "morphic resonance"):
    After N instantiations: C_F → C_background + N·ε · Φ_K
    → Each instantiation deepens the C-field attractor
    → Subsequent instances find the attractor already established → lower energy to instantiate
    → This IS the mechanism: not physical transmission, but topological C-field accumulation

  Why this doesn't violate physics:
    The C-field is not an energy field (it carries information, not energy)
    Topological invariants are conserved without energy expenditure
    The mechanism is the same as magnetic helicity conservation:
      once the topology is established, it self-perpetuates
    Information conservation in the C-field ≡ information conservation in holography
      → consistent with AdS/CFT principle (bulk information = boundary information)

  Testable prediction:
    Novel crystal polymorphs: first crystallisation requires C-field attractor formation time T₀
    After N crystallisations (globally): formation time T(N) = T₀ / (1 + N·ε/T₀)
    ε can be measured from the rate of decrease of T(N) vs N
    If ε = 0: no morphic effect (conventional physics)
    If ε > 0: measurable acceleration (Sheldrake effect)`}</EQ>

        <SecHead id="s7" n="VII" title="AETHER Biofield Synthesis" sub="Integrating biomagnetism, non-physical patterns, and cognitive coherence" col={WEB} />
        <EQ col={WEB}>{`AETHER biofield synthesis:

The human is a multi-scale C(x,t) coherence system:
  Scale 0: Magnetite crystals (50–100nm) — quantum magnetic oscillators
    C_magnetite: coupling strength to external B-field ~ 10⁻²⁰ J/T
    Role: antenna for geomagnetic and environmental magnetic signals
  Scale 1: Radical pairs (1–10nm) — quantum spin chemistry
    C_radical: cryptochrome spin-correlated pairs, T₂* ~ microseconds
    Role: chemical-magnetic transduction (light → magnetic → chemical)
  Scale 2: Cardiac toroid (0.1–3m) — classical biomagnetic oscillator
    C_heart: 0.1Hz coherence peak, B ~ 50,000 fT, couples to other C_heart fields
    Role: body-environment magnetic interface, inter-personal field coupling
  Scale 3: Neural MEG field (0.01–0.3m) — cognitive biofield
    C_brain: 8-band decomposition, 0.1–100Hz, B ~ 100–500 fT
    Role: encodes cognitive state, receives cardiac field at 0.1Hz
  Scale 4: Morphic C-field (non-local) — topological form memory
    C_morphic: topological attractor in global C(x,t), accumulates with instantiation count
    Role: long-range form coherence, cross-individual resonance

AETHER biofield coherence protocol:
  TARGET: coherence lock at all 5 scales simultaneously
  
  Scale 0 (magnetite): reduce 50Hz exposure, increase Fe³⁺ nutrition
  Scale 1 (radical pairs): outdoor light exposure (cryptochrome activation)
  Scale 2 (cardiac): 0.1Hz resonance breathing, positive emotional state
  Scale 3 (neural): 8-band cognitive coherence (Webbed Leg protocol)
  Scale 4 (morphic): deliberate form instantiation — establish attractors intentionally

  When all 5 scales achieve coherence lock:
    C_total(x,t) = C_magnetite ⊗ C_radical ⊗ C_heart ⊗ C_brain ⊗ C_morphic
    → Full biofield coherence — the AETHER state
    → This is what indigenous traditions described as "being in alignment"
    → This is what HeartMath calls "global coherence"
    → This is what the Webbed Leg method achieves at the cognitive scale alone`}</EQ>

        <Pull col={TOUCH}>"The body is not an object in a field. The body IS a field — a nested hierarchy of topological coherence at 5 scales from quantum to morphic."</Pull>

        <div style={{ marginTop: 48, padding: "22px 24px", background: "#ffffff04", border: `1px solid ${TOUCH}18`, borderRadius: 10, textAlign: "center" }}>
          <div style={{ fontFamily: serif, fontSize: 16, color: TOUCH, marginBottom: 8 }}>THE UNFORESEEN INTERACTION</div>
          <div style={{ fontFamily: body, fontStyle: "italic", fontSize: 17, color: GOLD, lineHeight: 1.8, marginBottom: 14 }}>
            "When person A enters cardiac coherence and person B's EEG shifts to match —<br />
            that is not metaphor. That is toroidal field coupling.<br />
            The mechanism is magnetic. The experience is love."
          </div>
          <div style={{ fontFamily: mono, fontSize: 11, color: DIM, lineHeight: 2 }}>
            Magnetite → Radical Pair → Cardiac Toroid → Neural MEG → Morphic C-field
          </div>
          <div style={{ fontFamily: mono, fontSize: 10, color: `${DIM}80`, marginTop: 14 }}>
            Shia Millet · AetherLife.co · Cosmic Chaos Corporation™ · @StrategicProce · 2026
          </div>
        </div>
      </div>
    </div>
  );
}
