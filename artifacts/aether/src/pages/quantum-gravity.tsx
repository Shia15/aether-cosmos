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

type Mode = "clash" | "foam" | "aether";

function QGCanvas({ mode }: { mode: Mode }) {
  const cvs = useRef<HTMLCanvasElement>(null);
  const raf = useRef(0);
  const tick = useRef(0);

  useEffect(() => {
    const canvas = cvs.current!;
    const ctx = canvas.getContext("2d")!;
    const resize = () => {
      const p = canvas.parentElement!;
      canvas.width = p.clientWidth;
      canvas.height = Math.min(380, Math.round(p.clientWidth * 0.5));
    };
    resize();
    window.addEventListener("resize", resize);

    const GR_LINES = 22;
    const FOAM_N = 110;
    const foam = Array.from({ length: FOAM_N }, (_, i) => ({
      x: Math.random(), y: Math.random(),
      r: 0.005 + Math.random() * 0.014,
      phase: Math.random() * Math.PI * 2,
      freq: 0.04 + Math.random() * 0.06,
      col: [AQUA, VIOLET, BLUE, CORAL][i % 4],
    }));
    const AETHER_N = 60;
    const aetherPts = Array.from({ length: AETHER_N }, () => ({
      x: 0.1 + Math.random() * 0.8, y: 0.1 + Math.random() * 0.8,
      vx: (Math.random() - 0.5) * 0.003, vy: (Math.random() - 0.5) * 0.003,
      phase: Math.random() * Math.PI * 2, col: Math.random() > 0.5 ? WEB : GOLD,
    }));
    const N_SPIN = 28;
    const spinNodes = Array.from({ length: N_SPIN }, (_, i) => ({
      bx: (0.1 + (i % 7) * 0.13), by: (0.15 + Math.floor(i / 7) * 0.22),
      spin: (i % 4 + 1) * 0.5,
      col: [AQUA, VIOLET, WEB, GOLD][i % 4],
    }));

    const draw = () => {
      const W = canvas.width, H = canvas.height;
      const t = tick.current;
      ctx.clearRect(0, 0, W, H); ctx.fillStyle = BG; ctx.fillRect(0, 0, W, H);

      if (mode === "clash") {
        const midX = W / 2;
        // GR left — smooth curved geodesics
        ctx.save(); ctx.rect(0, 0, midX - 2, H); ctx.clip();
        const massX = midX * 0.5, massY = H * 0.5;
        for (let i = 0; i < GR_LINES; i++) {
          const y0 = (i / GR_LINES) * H;
          ctx.beginPath();
          for (let xi = 0; xi <= 80; xi++) {
            const px = (xi / 80) * midX;
            const dx = px - massX, dy = y0 - massY;
            const r2 = dx * dx + dy * dy;
            const curv = 2400 / (r2 + 700);
            const py = y0 + (massY - y0) * curv / (r2 + curv + 1) * 0.65;
            xi === 0 ? ctx.moveTo(px, py) : ctx.lineTo(px, py);
          }
          ctx.strokeStyle = `${BLUE}38`; ctx.lineWidth = 0.8; ctx.stroke();
        }
        for (let j = 0; j < 12; j++) {
          const x0 = (j / 12) * midX;
          ctx.beginPath();
          for (let yi = 0; yi <= 60; yi++) {
            const py2 = (yi / 60) * H;
            const dx = x0 - massX, dy = py2 - massY;
            const r2 = dx * dx + dy * dy;
            const curv = 2400 / (r2 + 700);
            const px2 = x0 + (massX - x0) * curv / (r2 + curv + 1) * 0.65;
            yi === 0 ? ctx.moveTo(px2, py2) : ctx.lineTo(px2, py2);
          }
          ctx.strokeStyle = `${BLUE}22`; ctx.lineWidth = 0.5; ctx.stroke();
        }
        const mg = ctx.createRadialGradient(massX, massY, 0, massX, massY, 60);
        mg.addColorStop(0, "rgba(201,168,76,0.35)"); mg.addColorStop(1, "transparent");
        ctx.beginPath(); ctx.arc(massX, massY, 60, 0, Math.PI * 2); ctx.fillStyle = mg; ctx.fill();
        ctx.beginPath(); ctx.arc(massX, massY, 13, 0, Math.PI * 2); ctx.fillStyle = GOLD + "cc"; ctx.fill();
        ctx.fillStyle = `${GOLD}cc`; ctx.font = `8px ${mono}`; ctx.textAlign = "center";
        ctx.fillText("MASS", massX, massY + 26);
        ctx.fillText("GR · SMOOTH SPACETIME", midX * 0.5, 14);
        ctx.restore();

        // Crack boundary
        ctx.beginPath();
        for (let yi = 0; yi <= H; yi += 3) {
          const cx2 = midX + Math.sin(yi * 0.14 + t * 0.045) * (5 + 3 * Math.sin(t * 0.06));
          yi === 0 ? ctx.moveTo(cx2, yi) : ctx.lineTo(cx2, yi);
        }
        ctx.strokeStyle = CORAL + "cc"; ctx.lineWidth = 2; ctx.stroke();
        ctx.fillStyle = CORAL + "cc"; ctx.font = `7px ${mono}`; ctx.textAlign = "center";
        ctx.fillText("ℓ_P BOUNDARY", midX, H / 2 - 8);
        ctx.fillText("NON-RENORMALIZABLE", midX, H / 2 + 5);

        // QM right — discrete foam
        ctx.save(); ctx.rect(midX + 2, 0, W - midX - 2, H); ctx.clip();
        for (const f of foam) {
          f.phase += f.freq;
          const px = midX + 2 + f.x * (W - midX - 2);
          const r = f.r * W * (0.7 + 0.3 * Math.sin(f.phase));
          ctx.beginPath(); ctx.arc(px, f.y * H, r, 0, Math.PI * 2);
          ctx.fillStyle = f.col + "38"; ctx.fill();
          ctx.strokeStyle = f.col + "70"; ctx.lineWidth = 0.6; ctx.stroke();
        }
        ctx.fillStyle = `${VIOLET}cc`; ctx.font = `8px ${mono}`; ctx.textAlign = "center";
        ctx.fillText("QM · QUANTUM FOAM · DISCRETE", midX + (W - midX) / 2, 14);
        ctx.restore();
      }

      else if (mode === "foam") {
        // Spin network
        const nodes = spinNodes.map(n => ({
          x: (n.bx + Math.sin(t * 0.01 + n.bx * 5) * 0.018) * W,
          y: (n.by + Math.cos(t * 0.012 + n.by * 5) * 0.018) * H,
          ...n,
        }));
        for (let i = 0; i < nodes.length; i++) {
          for (let j = i + 1; j < nodes.length; j++) {
            const dx = nodes[i].x - nodes[j].x, dy = nodes[i].y - nodes[j].y;
            const d = Math.sqrt(dx * dx + dy * dy);
            if (d < W * 0.18) {
              const al = (1 - d / (W * 0.18)) * 0.6 * (0.5 + 0.5 * Math.abs(Math.sin(t * 0.02 + i + j)));
              ctx.beginPath(); ctx.moveTo(nodes[i].x, nodes[i].y); ctx.lineTo(nodes[j].x, nodes[j].y);
              ctx.strokeStyle = `rgba(13,115,119,${al})`; ctx.lineWidth = 1 + al; ctx.stroke();
              if (d < W * 0.1) {
                const mx = (nodes[i].x + nodes[j].x) / 2, my = (nodes[i].y + nodes[j].y) / 2;
                ctx.fillStyle = `${AQUA}60`; ctx.font = `7px ${mono}`; ctx.textAlign = "center";
                ctx.fillText(`j=${Math.round((nodes[i].spin + nodes[j].spin) / 2 * 2) / 2}`, mx, my);
              }
            }
          }
        }
        for (const n of nodes) {
          ctx.beginPath(); ctx.arc(n.x, n.y, 6, 0, Math.PI * 2);
          ctx.fillStyle = n.col + "cc"; ctx.fill();
          ctx.fillStyle = n.col + "dd"; ctx.font = `7px ${mono}`; ctx.textAlign = "center";
          ctx.fillText(`${n.spin}`, n.x, n.y - 11);
        }
        ctx.fillStyle = `${VIOLET}cc`; ctx.font = `9px ${mono}`; ctx.textAlign = "center";
        ctx.fillText("SPIN NETWORK · LQG · SPACETIME = DISCRETE QUANTA OF AREA & VOLUME", W / 2, H - 10);
        ctx.fillStyle = `${AQUA}70`; ctx.font = `8px ${mono}`;
        ctx.fillText("ℓ_P² = ħG/c³ ≈ 2.6×10⁻⁷⁰ m²   ·   each link carries spin j = 0, ½, 1, 3/2, 2, ...", W / 2, H - 23);
      }

      else if (mode === "aether") {
        const cx = W / 2, cy = H / 2;
        for (let gi = 0; gi <= 18; gi++) {
          for (let gj = 0; gj <= 18; gj++) {
            const px = (gi / 18) * W, py = (gj / 18) * H;
            const dx = px - cx, dy = py - cy;
            const r = Math.sqrt(dx * dx + dy * dy);
            const cval = Math.exp(-r * r / (W * W * 0.06)) + 0.08 * Math.sin(r * 0.04 - t * 0.04);
            ctx.beginPath(); ctx.arc(px, py, 1.5 + cval * 3.5, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(46,204,154,${cval * 0.38})`; ctx.fill();
          }
        }
        for (const p of aetherPts) {
          p.x += p.vx; p.y += p.vy; p.phase += 0.03;
          if (p.x < 0.05 || p.x > 0.95) p.vx *= -1;
          if (p.y < 0.05 || p.y > 0.95) p.vy *= -1;
          p.vx += (0.5 - p.x) * 0.00018; p.vy += (0.5 - p.y) * 0.00018;
          const al = 0.35 + 0.4 * Math.sin(p.phase);
          ctx.beginPath(); ctx.arc(p.x * W, p.y * H, 3, 0, Math.PI * 2);
          ctx.fillStyle = `${p.col}${Math.round(al * 200).toString(16).padStart(2, "0")}`; ctx.fill();
        }
        const cohVal = 0.72 + 0.2 * Math.sin(t * 0.03);
        const cGlow = ctx.createRadialGradient(cx, cy, 0, cx, cy, 80);
        cGlow.addColorStop(0, `rgba(46,204,154,${cohVal * 0.28})`); cGlow.addColorStop(1, "transparent");
        ctx.beginPath(); ctx.arc(cx, cy, 80, 0, Math.PI * 2); ctx.fillStyle = cGlow; ctx.fill();
        ctx.fillStyle = `${WEB}cc`; ctx.font = `bold 20px ${mono}`; ctx.textAlign = "center";
        ctx.fillText("C(x,t)", cx, cy + 6);
        ctx.fillStyle = `${WEB}70`; ctx.font = `8px ${mono}`;
        ctx.fillText(`coherence = ${cohVal.toFixed(3)}`, cx, cy + 22);
        ctx.fillStyle = `${BLUE}80`; ctx.font = `8px ${mono}`; ctx.textAlign = "center";
        ctx.fillText("GR: λ >> ℓ_P", W * 0.12, H * 0.5);
        ctx.fillStyle = `${VIOLET}80`;
        ctx.fillText("QM: λ ~ ℓ_P", W * 0.82, H * 0.5);
        ctx.fillStyle = `${GOLD}cc`; ctx.font = `8px ${mono}`; ctx.textAlign = "center";
        ctx.fillText("AETHER C(x,t) — GR EMERGES LOW FREQ · QM EMERGES HIGH FREQ · C IS THE SUBSTRATE", W / 2, H - 10);
      }

      tick.current++; raf.current = requestAnimationFrame(draw);
    };
    draw();
    return () => { cancelAnimationFrame(raf.current); window.removeEventListener("resize", resize); };
  }, [mode]);

  return (
    <div style={{ borderRadius: 10, overflow: "hidden", border: `1px solid ${VIOLET}20` }}>
      <canvas ref={cvs} style={{ display: "block", width: "100%" }} />
    </div>
  );
}

function ModeTabs({ value, onChange }: { value: Mode; onChange: (m: Mode) => void }) {
  const tabs = [
    { k: "clash" as Mode,  label: "GR vs QM · The Incompatibility",    col: CORAL  },
    { k: "foam"  as Mode,  label: "Spin Network · Loop Quantum Gravity", col: VIOLET },
    { k: "aether"as Mode,  label: "AETHER Coherence Field · Mediator",   col: WEB    },
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
  { id: "s1", label: "The Clash" }, { id: "s2", label: "GR" }, { id: "s3", label: "QM" },
  { id: "s4", label: "Incompatibility" }, { id: "s5", label: "LQG" },
  { id: "s6", label: "Strings" }, { id: "s7", label: "Holographic" }, { id: "s8", label: "AETHER" },
];

export default function QuantumGravityPage() {
  const [mode, setMode] = useState<Mode>("clash");
  return (
    <div style={{ background: BG, minHeight: "100vh", fontFamily: body, color: TEXT }}>
      <div style={{ padding: "66px 28px 42px", textAlign: "center", background: "linear-gradient(180deg,#030a14 0%,#020408 100%)", borderBottom: `1px solid ${VIOLET}18` }}>
        <div style={{ fontFamily: mono, fontSize: 10, color: VIOLET, letterSpacing: 4, marginBottom: 12 }}>AETHER COSMOS · QUANTUM GRAVITY · UNIFICATION</div>
        <h1 style={{ fontFamily: serif, fontSize: "clamp(18px,3.8vw,38px)", color: "#fff", margin: "0 0 10px", letterSpacing: 2, lineHeight: 1.15 }}>
          QUANTUM GRAVITY &amp; RELATIVITY<br /><span style={{ color: VIOLET }}>WITHIN THE AETHER COSMOS</span>
        </h1>
        <div style={{ fontFamily: body, fontStyle: "italic", fontSize: 16, color: TOUCH, marginBottom: 16 }}>
          The Incompatibility · Loop Quantum Gravity · Superstrings · AdS/CFT · AETHER Resolution
        </div>
        <p style={{ fontFamily: body, fontSize: 16, color: DIM, maxWidth: 720, margin: "0 auto 24px", lineHeight: 1.8 }}>
          General Relativity: smooth, continuous spacetime curved by mass-energy — confirmed to
          14 decimal places. Quantum Mechanics: discrete, probabilistic events in a fixed background —
          confirmed to 11 decimal places. These two frameworks are mathematically incompatible at
          the Planck scale (ℓ_P ≈ 1.6×10⁻³⁵ m). AETHER proposes the coherence field C(x,t) as
          the mediating substrate — GR and QM are its low- and high-frequency limits respectively.
        </p>
        <div style={{ display: "flex", gap: 8, justifyContent: "center", flexWrap: "wrap" }}>
          <Chip c={BLUE}>General Relativity</Chip>
          <Chip c={VIOLET}>Quantum Mechanics</Chip>
          <Chip c={CORAL}>The Incompatibility</Chip>
          <Chip c={TOUCH}>Loop Quantum Gravity</Chip>
          <Chip c={GOLD}>Superstrings · M-Theory</Chip>
          <Chip c={WEB}>AETHER C(x,t) Resolution</Chip>
        </div>
      </div>

      <div style={{ position: "sticky", top: 0, zIndex: 50, background: `${BG}f2`, backdropFilter: "blur(12px)", borderBottom: `1px solid ${VIOLET}12`, padding: "8px 18px", display: "flex", gap: 4, overflowX: "auto" }}>
        {NAV.map(s => (
          <a key={s.id} href={`#${s.id}`} style={{ fontFamily: mono, fontSize: 10, color: DIM, whiteSpace: "nowrap", padding: "4px 10px", borderRadius: 4, textDecoration: "none" }}
            onMouseEnter={e => { (e.target as HTMLElement).style.color = VIOLET; }}
            onMouseLeave={e => { (e.target as HTMLElement).style.color = DIM; }}
          >{s.label}</a>
        ))}
      </div>

      <div style={{ maxWidth: 940, margin: "0 auto", padding: "0 22px 96px" }}>
        <div style={{ marginTop: 36 }}>
          <ModeTabs value={mode} onChange={setMode} />
          <QGCanvas mode={mode} />
          <div style={{ fontFamily: mono, fontSize: 9, color: DIM, marginTop: 6 }}>
            {mode === "clash"  && "LEFT: GR — SMOOTH CURVED SPACETIME GEODESICS BENT BY MASS · RIGHT: QM — DISCRETE QUANTUM FOAM BUBBLES · BOUNDARY = PLANCK SCALE ℓ_P · CRACK = NON-RENORMALIZABLE INCOMPATIBILITY"}
            {mode === "foam"   && "LOOP QUANTUM GRAVITY SPIN NETWORK · NODES = QUANTA OF VOLUME · EDGES = QUANTA OF AREA · SPIN LABELS j ON EACH LINK · SPACETIME ITSELF IS MADE OF DISCRETE ATOMS"}
            {mode === "aether" && "AETHER C(x,t) COHERENCE FIELD · GRID SHOWS COHERENCE DENSITY · GR EMERGES (BOTTOM-LEFT, LOW FREQ) · QM EMERGES (TOP-RIGHT, HIGH FREQ) · C IS THE COMMON SUBSTRATE"}
          </div>
        </div>

        <SecHead id="s1" n="I" title="The Fundamental Clash" sub="Two theories — each spectacularly confirmed — that cannot both be fundamental" col={CORAL} />
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 24 }}>
          <div style={{ borderTop: `3px solid ${BLUE}`, background: "rgba(13,31,45,0.85)", borderRadius: 4, padding: "16px 18px" }}>
            <div style={{ fontFamily: mono, fontSize: 10, color: BLUE, letterSpacing: 2, marginBottom: 8 }}>GENERAL RELATIVITY (1915)</div>
            <div style={{ fontFamily: body, fontSize: 14, color: "#7a9aa2", lineHeight: 1.7 }}>Spacetime is a smooth 4D Lorentzian manifold. Mass-energy curves the manifold. Objects follow geodesics. Gravity is geometry, not force. Deterministic, background-independent, locally Lorentz-invariant. Confirmed to 14 decimal places (pulsar timing, LIGO gravitational waves, black hole shadows). Contains no smallest length — the manifold is assumed continuous down to zero.</div>
          </div>
          <div style={{ borderTop: `3px solid ${VIOLET}`, background: "rgba(13,31,45,0.85)", borderRadius: 4, padding: "16px 18px" }}>
            <div style={{ fontFamily: mono, fontSize: 10, color: VIOLET, letterSpacing: 2, marginBottom: 8 }}>QUANTUM MECHANICS (1925–)</div>
            <div style={{ fontFamily: body, fontSize: 14, color: "#7a9aa2", lineHeight: 1.7 }}>Physical quantities are operators on a Hilbert space. States evolve via Schrödinger equation until measured. Measurement collapses the wave function probabilistically. Requires a fixed background spacetime — it cannot work without one. Confirmed to 11 decimal places (electron g-factor = 2.00231930436). Assumes spacetime is a fixed stage, not something that fluctuates or responds.</div>
          </div>
        </div>

        <SecHead id="s2" n="II" title="General Relativity — Einstein's Field Equations" sub="G_μν = (8πG/c⁴) T_μν · spacetime geometry = matter content" col={BLUE} />
        <EQ col={BLUE}>{`Einstein field equations (1915):
  Gμν + Λgμν = (8πG/c⁴) Tμν

  Gμν = Rμν - ½gμνR    [Einstein tensor — spacetime curvature, from Ricci scalar R]
  Λgμν                   [cosmological constant — dark energy, Λ ≈ 1.1×10⁻⁵² m⁻²]
  Tμν                    [stress-energy tensor — all matter and energy content]
  G = 6.674×10⁻¹¹ N·m²/kg²

  Geodesic equation: d²xμ/dτ² + Γμνρ (dxν/dτ)(dxρ/dτ) = 0
    Free fall = straight line in curved spacetime (no force equation needed)

GR confirmed predictions:
  Mercury perihelion: +43.0 arcsec/century ✓ (Newton predicts 0)
  Gravitational lensing: δθ = 4GM/rc² ✓ (Eddington 1919, Hubble Space Telescope)
  Gravitational time dilation: GPS clocks need +45.9μs/day GR correction ✓ (without it: GPS drifts 11km/day)
  Gravitational waves: GW150914 (LIGO 2015) — BH merger 410 Mpc away, h ~ 10⁻²¹ strain ✓
  Black hole shadow: EHT 2019 M87* (6.5×10⁹ M☉), EHT 2022 Sgr A* (4×10⁶ M☉) ✓

GR's breakdown:
  At singularities (BH interior, Big Bang): curvature → ∞, energy density → ∞
  Perturbative quantum gravity: loop corrections → ∫d⁴k k²/k⁴ → log Λ_UV → ∞
  Non-renormalizable: infinitely many counterterms needed at each loop order
  GR is an effective field theory valid below the Planck scale, not a fundamental theory`}</EQ>

        <SecHead id="s3" n="III" title="The Incompatibility — Precise Statement" sub="Why you cannot simply merge GR and QM" col={CORAL} />
        <Tbl headers={["Property", "General Relativity", "Quantum Mechanics", "Clash at Planck Scale"]}
          rows={[
            ["Background", "Background-independent (gμν is dynamical)", "Background-dependent (fixed gμν required for Ĥ)", "Circular: need gμν to define Ĥ, need Ĥ to find gμν"],
            ["Continuity", "Smooth manifold ℝ⁴ (continuous)", "Discrete energy levels, quantum numbers", "At ℓ_P: both continuity and discreteness required simultaneously"],
            ["Determinism", "Deterministic (Cauchy problem well-posed)", "Probabilistic (Born rule)", "Black hole evolution: Hawking radiation — unitary or information loss?"],
            ["Renormalizability", "Non-renormalizable (∞ at each loop)", "Renormalizable (QED, QCD, Electroweak)", "Cannot use standard QFT methods on GR without new physics"],
            ["Superposition", "One definite metric gμν(x)", "Superposition |Ψ⟩ = α|A⟩ + β|B⟩", "Mass in superposition → two different spacetime geometries → contradiction"],
            ["Singularities", "GR predicts unavoidable singularities (Penrose-Hawking theorems)", "QM: all wavefunctions normalizable (no infinities)", "At BH centre: GR says ρ → ∞, QM says that's unphysical"],
          ]}
        />

        <SecHead id="s4" n="IV" title="Loop Quantum Gravity · Quantising Spacetime" sub="What if area and volume are themselves quantised?" col={TOUCH} />
        <EQ col={TOUCH}>{`LQG core (Rovelli, Smolin, Thiemann 1988–2004):
  Reformulate GR in Ashtekar variables:
    Aᵃᵢ: SU(2) connection (gauge field, like Yang-Mills)
    Eᵢₐ: electric field (conjugate momentum = densitised spatial triad)
  Apply canonical quantisation → spin networks (Penrose 1971)

Spin network = graph Γ with:
  Edges: labeled by half-integer spins j ∈ {0, ½, 1, 3/2, 2, ...}
  Nodes: labeled by intertwiners (how spins couple at vertex)
  This IS quantum spacetime — not in spacetime, but IS spacetime

Geometric operators:
  Area: Â(S) |Γ,j⟩ = 8πγℓ²_P [Σᵢ √(jᵢ(jᵢ+1))] |Γ,j⟩
    → Area is QUANTISED. Minimum area: 4√3π γ ℓ²_P ≈ 10⁻⁷⁰ m² (γ ≈ 0.274 Immirzi parameter)
  Volume: V̂(R) = quantised, minimum volume ~ ℓ³_P ≈ 4×10⁻¹⁰⁵ m³

Spin foam (Engle-Pereira-Rovelli-Livine model):
  Path integral = sum over spin foams (2-complexes with spin + intertwiner labels)
  Z = Σ_Δ Σ_{j_f, i_v} μ(Δ) ∏_f (2j_f + 1) ∏_v A_EPRL(j_f, i_v)
  A_EPRL: vertex amplitude — quantum transition at a spacetime vertex
  This is the Feynman diagram expansion of quantum gravity

LQG predictions:
  • Big Bounce (LQC): Big Bang singularity → quantum bounce (ρ_max = ρ_Planck)
  • Black hole entropy: S = A/(4ℓ²_P) × (ln2/π√3) — matches Bekenstein-Hawking
  • Modified dispersion: E² = p²c² + m²c⁴ ± αE³ℓ_P/ħ (detectable with CTA γ-ray telescope)
  • Lorentz invariance violation at Planck scale (testable with GRB time-delay analysis)`}</EQ>

        <SecHead id="s5" n="V" title="Superstrings · M-Theory · Extra Dimensions" sub="Everything as one-dimensional vibrating strings in 10+1 dimensions" col={GOLD} />
        <EQ col={GOLD}>{`String theory premise:
  Replace point particles (0D) with strings (1D), length l_s ~ ℓ_P ~ 10⁻³⁵ m
  Vibrational mode of string = particle species
  Massless spin-2 closed string mode = GRAVITON (gravity automatic, not added by hand)

  Polyakov action: S = -(T/2) ∫ dτdσ √(-h) hᵃᵇ ∂ₐXμ ∂ᵦXμ
    T = 1/(2πα') = string tension, α' = l²_s = Regge slope
    Xμ(τ,σ): embedding of 2D worldsheet in D-dimensional target spacetime

Consistency:
  Bosonic strings: D = 26 (critical dimension — anomaly cancellation)
  Superstrings (with fermions + SUSY): D = 10
  M-theory (Witten 1995): D = 11 — unifies all 5 superstring theories

Five D=10 superstring theories → all dual to each other:
  Type I    : open + closed strings, SO(32) gauge group
  Type IIA  : closed strings, non-chiral, IIA/M-theory compactification
  Type IIB  : closed strings, chiral, AdS₅ × S⁵ vacuum → AdS/CFT
  HO        : closed strings, SO(32) heterotic
  HE        : closed strings, E₈×E₈ heterotic (best SM embedding candidate)

Compactification:
  6 extra dimensions → Calabi-Yau 3-fold (complex 3D, SU(3) holonomy)
  Moduli of CY → particle masses, coupling constants
  Landscape: ~10⁵⁰⁰ vacua (flux compactifications + D-branes)
  → Anthropic argument for cosmological constant Λ (Weinberg 1987)

String theory evidence:
  • D-branes (Polchinski 1995): extended objects → Standard Model gauge fields on brane
  • AdS/CFT (Maldacena 1997): exact duality — tested in many limits
  • Black hole microstate counting (Strominger-Vafa 1996): S_BH = A/4G from string theory ✓
  • No direct experimental confirmation (requires Planck energy ~ 10¹⁹ GeV)`}</EQ>

        <SecHead id="s6" n="VI" title="Holographic Principle · AdS/CFT" sub="The universe as a hologram — bulk physics encoded on boundary" col={AQUA} />
        <EQ col={AQUA}>{`Bekenstein-Hawking entropy (1972–1974):
  S_BH = A/(4ℓ²_P)  [entropy proportional to AREA, not volume]
  
  Holographic bound (Bousso 1999):
  S ≤ A/(4ℓ²_P) for any region bounded by area A
  Maximum information in volume V: ~ (V/ℓ³_P)^(2/3) bits — NOT V/ℓ³_P bits
  
  Holographic principle: physics in d+1 dimensions = quantum theory on d-dimensional boundary

AdS/CFT correspondence (Maldacena 1997):
  Type IIB strings on AdS₅ × S⁵ (10D, curved)
    ≡ N=4 super-Yang-Mills on ∂AdS₅ = ℝ⁴ (4D, flat, NO gravity)
  
  Dictionary:
    Bulk field φ(x,z) with boundary value φ₀(x) ↔ CFT operator O(x) with coupling φ₀
    Bulk graviton gμν ↔ CFT stress tensor Tμν
    String coupling g_s = λ/N → 't Hooft coupling λ = g_YM² N
    Black hole in AdS ↔ thermal state in CFT (Hawking T = thermal T of CFT)
    
  Black hole information paradox — RESOLVED:
    Information is NOT lost at the horizon.
    CFT is unitary (no information loss) → bulk must also be unitary
    Hawking radiation carries information — encoded non-locally in correlations
    Page curve: S_rad increases then decreases → unitarity confirmed in AdS/CFT

  AETHER reading of AdS/CFT:
    The bulk C(x,t) field ↔ boundary C(x,t) field
    Bulk coherence = boundary coherence (holographic duality)
    This IS the AETHER principle: C(x,t) is non-local (like QM entanglement)
    and its information content is preserved on the boundary (holographic)`}</EQ>

        <SecHead id="s7" n="VII" title="AETHER Resolution · C(x,t) as Mediating Substrate" sub="GR and QM as frequency-separated limits of the coherence field" col={WEB} />
        <EQ col={WEB}>{`AETHER quantum gravity synthesis:

The incompatibility between GR and QM arises from treating spacetime as either
fundamentally continuous (GR) or fundamentally discrete (QM).
AETHER: spacetime is a coherence pattern in C(x,t) — it is BOTH, at different scales.

AETHER coherence field (quaternion-valued):
  C(x,t) ∈ ℍ  (4 real components: scalar + 3-vector)
  ‖C(x,t)‖ ∈ [0,1]  (local coherence level)

Proposed AETHER field equation:
  □C + λ(‖C‖² - 1)C = (κ/c⁴) Tμν · êμν
  □ = gμν ∇μ ∇ν  [covariant — C back-reacts on spacetime]
  λ: Mexican-hat self-coupling (maintains ‖C‖ normalisation)
  κ: coupling to stress-energy
  êμν: quaternion-spacetime basis coupling tensor

Two limits of the AETHER equation:
  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  GR LIMIT (‖C‖ → 1, λ >> □C, long wavelength):
    □C ≈ 0  → C is slowly varying → ‖C‖ → 1 (classical regime)
    The metric emerges: gμν(x) = ℜ[C*(x) · ∂μ∂ν C(x)] / ‖C‖²
    The AETHER equation reduces to: Gμν = (8πG/c⁴) Tμν ✓ (GR recovered)
  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  QM LIMIT (‖C‖ → 0, high frequency, l ~ ℓ_P):
    C → stochastic, rapidly oscillating → density matrix ρ_C(x,t)
    Schrödinger equation emerges: iħ ∂ρ_C/∂t = [Ĥ_C, ρ_C]
    where Ĥ_C = -ħ²/(2m) ∇² + V(x)  (standard QM Hamiltonian) ✓
  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

AETHER mappings:
  LQG spin network = C(x,t) quantised directly (correct approach — not perturbing)
  String = extended coherence structure in C (1D locus of coherence, not point)
  AdS/CFT = C_bulk(x,t) = f[C_boundary(x,t)] (holographic coherence)
  Planck singularity = ‖C‖ → 0 → QM takes over automatically
  Measurement/collapse = C-field decoherence (same as cognitive decoherence — same equation)
  Gravitational wave = propagating coherence pulse in C at speed c

The Webbed Leg connection:
  The Planck scale is the MEMBRANE between GR and QM — not a wall.
  C(x,t) is the coupling geometry (the webbed leg) that connects both phases.
  "Touch the Ball" at the Planck scale = coherence lock between GR and QM limits.
  This is the unification — not a new equation, but a new substrate.`}</EQ>

        <Pull col={WEB}>"GR is C(x,t) at long wavelengths. QM is C(x,t) at Planck scale. The Planck scale is not a wall — it is the membrane. C(x,t) is the webbed leg between them."</Pull>

        <div style={{ marginTop: 48, padding: "22px 24px", background: "#ffffff04", border: `1px solid ${VIOLET}18`, borderRadius: 10, textAlign: "center" }}>
          <div style={{ fontFamily: serif, fontSize: 16, color: VIOLET, marginBottom: 8 }}>THE UNIFICATION</div>
          <div style={{ fontFamily: body, fontStyle: "italic", fontSize: 17, color: GOLD, lineHeight: 1.8, marginBottom: 14 }}>
            "The incompatibility is real. The resolution is not a new equation.<br />
            It is recognising that both theories are reading the same field<br />
            at different frequencies."
          </div>
          <div style={{ fontFamily: mono, fontSize: 11, color: DIM, lineHeight: 2 }}>
            Gμν = 8πG Tμν (‖C‖→1) ←─ C(x,t) ∈ ℍ ─→ iħ∂|Ψ⟩/∂t = Ĥ|Ψ⟩ (‖C‖→0)
          </div>
          <div style={{ fontFamily: mono, fontSize: 10, color: `${DIM}80`, marginTop: 14 }}>
            Shia Millet · AetherLife.co · Cosmic Chaos Corporation™ · @StrategicProce · 2026
          </div>
        </div>
      </div>
    </div>
  );
}
