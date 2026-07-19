/*═══════════════════════════════════════════════════════════════════
  Crystallized Life Synthesis
  Sun-dried concentrated powder → rebuilding blocks of material life
  Fragmenting leaf + AETHER data = simulate anything

  Covers:
  ─ Extract → crystallize → sun-dried powder → reconstruct (3 live stages)
  ─ Quantizing substrate pipeline: 7 parameters × N levels → epigenetic spectrum
  ─ Mitochondria mechanotransduction: Piezo1 → Ca²⁺ → AMPK → metabolic reprogram
  ─ 8 Qubits of AETHER: Solar · Radiation · Biological Spinor · Gravity ·
    String Rotation · Hexiclical Fabric · Plasmodium · Consciousness
  ─ AETHER Human Ecology: substrate driven computation
  ─ Gravity lensing × piezoelectricity intersection (Shia post)
  ─ Magnetic dust storm multi-scale perceptual array
═══════════════════════════════════════════════════════════════════*/
import { useRef, useEffect, useState } from "react";
import slimeQuantImg        from "@assets/E514D86D-00E9-4E33-A416-06F23067C2F8_1784479389127.png";
import mitoTransductImg     from "@assets/IMG_4544_1784479389127.png";
import lfUiaImg             from "@assets/IMG_4543_1784479389127.png";
import humanEcologyImg      from "@assets/46011959-13F8-4C90-901C-BE067D9718D1_1784479389127.png";
import hexLatticeImg        from "@assets/IMG_4535_1784479389127.png";
import skyrmionImg          from "@assets/IMG_4534_1784479389127.png";
import xPostImg             from "@assets/IMG_4531_1784479389127.jpeg";
import magneticStormImg     from "@assets/A6805E91-9684-4C59-BFC8-482EF421381D_1784479389127.png";
import eighQubitsImg        from "@assets/C82480C5-FB6F-4F0F-8353-A57AACF5983C_1784479473010.png";

/* ── palette ── */
const P = {
  bg: "#060810", panel: "#0d1018", panel2: "#101520",
  gold: "#f5c84c", ivory: "#f4f1ea", dim: "rgba(244,241,234,0.5)",
  line: "rgba(79,200,232,0.1)", cyan: "#4fe8e8", purple: "#c084fc",
  blue: "#60a5fa", teal: "#2dd4bf", green: "#34d399",
  orange: "#fb923c", muted: "rgba(244,241,234,0.28)",
};

/* ── shared UI ── */
function Sec({ id, children }: { id?: string; children: React.ReactNode }) {
  return (
    <section id={id} style={{ borderTop: `1px solid ${P.line}`, padding: "48px 0" }}>
      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "0 32px" }}>{children}</div>
    </section>
  );
}
function Tag({ label, color = P.cyan }: { label: string; color?: string }) {
  return <span style={{ fontSize: 10, fontWeight: 700, color, letterSpacing: 1.5, textTransform: "uppercase" as const }}>{label}</span>;
}
function Card({ title, body, color = P.cyan }: { title: string; body: string; color?: string }) {
  return (
    <div style={{ padding: "13px 15px", background: P.panel, borderRadius: 10, border: `1px solid ${color}1a` }}>
      <div style={{ fontSize: 10, fontWeight: 700, color, letterSpacing: 0.8, marginBottom: 6, textTransform: "uppercase" as const }}>{title}</div>
      <div style={{ fontSize: 13, color: P.dim, lineHeight: 1.8 }}>{body}</div>
    </div>
  );
}
function Anno({ chips, img, alt }: { chips: { label: string; note: string; color?: string }[]; img: string; alt: string }) {
  return (
    <div style={{ border: `1px solid ${P.line}`, borderRadius: 12, overflow: "hidden", marginBottom: 28 }}>
      <img src={img} alt={alt} style={{ width: "100%", display: "block" }} />
      <div style={{ padding: "12px 14px", background: P.panel, display: "flex", gap: 8, flexWrap: "wrap" }}>
        {chips.map((ch, i) => (
          <div key={i} style={{ padding: "4px 10px", borderRadius: 6, background: (ch.color || P.cyan) + "18", border: `1px solid ${ch.color || P.cyan}33` }}>
            <div style={{ fontSize: 9, fontWeight: 700, color: ch.color || P.cyan }}>{ch.label}</div>
            {ch.note && <div style={{ fontSize: 9, color: P.muted, marginTop: 1, maxWidth: 160 }}>{ch.note}</div>}
          </div>
        ))}
      </div>
    </div>
  );
}

/* ════════════════════════════════════════════════════════════════
   CANVAS 1 — Crystal Powder Reconstruction
   4 phases: Raw Extract → Sun-Dried → Crystallized Powder → Rebuilt Life
   Pressure·Heat·Time·Synergy drives each transition
════════════════════════════════════════════════════════════════ */
function CrystalPowderCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const phaseRef  = useRef(0); // 0=raw 1=drying 2=powder 3=rebuild
  const [phase, setPhase] = useState(0);
  const PHASE_LABELS = ["Raw Extract", "Sun-Drying", "Crystallized Powder", "Rebuilt Life"];
  const PHASE_COLORS = [P.green, P.orange, P.cyan, P.gold];

  useEffect(() => { phaseRef.current = phase; }, [phase]);

  useEffect(() => {
    const c = canvasRef.current; if (!c) return;
    const ctx = c.getContext("2d")!;
    let raf = 0, t = 0;
    function resize() { c.width = c.offsetWidth; c.height = c.offsetHeight; }
    resize();
    const ro = new ResizeObserver(resize); ro.observe(c);

    const rng = (s: number) => { const x = Math.sin(s * 127.1) * 43758.5; return x - Math.floor(x); };
    const N = 180;

    type Particle = { bx: number; by: number; x: number; y: number; r: number; hue: number; alpha: number };
    const particles: Particle[] = [];

    function initParticles(W: number, H: number) {
      particles.length = 0;
      const cols = Math.ceil(Math.sqrt(N * W / H));
      const rows = Math.ceil(N / cols);
      for (let i = 0; i < N; i++) {
        const col = i % cols, row = Math.floor(i / cols);
        const bx = (col + 0.5) / cols * W;
        const by = (row + 0.5) / rows * H;
        particles.push({
          bx, by,
          x: 20 + rng(i * 5) * (W - 40),
          y: 20 + rng(i * 7) * (H - 40),
          r: 3 + rng(i * 3) * 5,
          hue: rng(i * 11) * 120 + 80,
          alpha: 0.5 + rng(i * 17) * 0.5,
        });
      }
    }

    // Hexagonal lattice targets
    function hexTargets(W: number, H: number): { x: number; y: number }[] {
      const out: { x: number; y: number }[] = [];
      const spacing = Math.min(W, H) * 0.085;
      const cx = W / 2, cy = H / 2;
      const cols = Math.ceil(W / spacing) + 2;
      const rows = Math.ceil(H / (spacing * 0.866)) + 2;
      for (let gy = 0; gy < rows; gy++) {
        for (let gx = 0; gx < cols; gx++) {
          const x = (gx - cols / 2) * spacing + (gy % 2 === 0 ? 0 : spacing / 2) + cx;
          const y = (gy - rows / 2) * spacing * 0.866 + cy;
          if (x > 0 && x < W && y > 0 && y < H) out.push({ x, y });
        }
      }
      return out.slice(0, N);
    }

    let targets: { x: number; y: number }[] = [];

    function draw() {
      const W = c.width, H = c.height;
      if (t === 0) { initParticles(W, H); targets = hexTargets(W, H); }

      ctx.clearRect(0, 0, W, H);
      ctx.fillStyle = P.bg; ctx.fillRect(0, 0, W, H);

      const ph = phaseRef.current;
      const progress = Math.min(1, (t % 240) / 240);
      const ease = progress < 0.5 ? 2 * progress * progress : 1 - Math.pow(-2 * progress + 2, 2) / 2;

      particles.forEach((p, i) => {
        let tx = p.x, ty = p.y, tr = p.r;

        if (ph === 1) {
          // Drying: converge toward center-x, pack vertically
          tx = p.bx * 0.3 + W * 0.5 * 0.7;
          ty = p.by * 0.8 + H * 0.1;
          tr = p.r * (0.8 - ease * 0.3);
        } else if (ph === 2) {
          // Crystallized powder: hexagonal close-packing
          const tg = targets[i % targets.length];
          tx = tg ? tg.x : p.bx;
          ty = tg ? tg.y : p.by;
          tr = 3;
        } else if (ph === 3) {
          // Rebuilt life: pulsing hex lattice, growing
          const tg = targets[i % targets.length];
          tx = tg ? tg.x : p.bx;
          ty = tg ? tg.y : p.by;
          tr = 3.5 + Math.sin(t * 0.04 + i * 0.3) * 1.5;
        }

        p.x += (tx - p.x) * 0.04;
        p.y += (ty - p.y) * 0.04;
        p.r += (tr - p.r) * 0.04;

        // Color per phase
        const col = ph === 0 ? `rgba(52,211,153,${p.alpha})`
          : ph === 1 ? `rgba(251,146,60,${p.alpha * 0.8 + Math.sin(t * 0.1) * 0.2})`
          : ph === 2 ? `rgba(79,232,232,${0.8})`
          : `rgba(245,200,76,${0.85 + Math.sin(t * 0.06 + i * 0.1) * 0.15})`;

        // Draw bonds in powder + rebuilt phase
        if (ph >= 2) {
          particles.forEach((p2, j) => {
            if (j <= i) return;
            const d = Math.hypot(p.x - p2.x, p.y - p2.y);
            if (d < 40) {
              ctx.strokeStyle = ph === 3 ? `rgba(245,200,76,${0.3 * (1 - d / 40)})` : `rgba(79,232,232,${0.2 * (1 - d / 40)})`;
              ctx.lineWidth = 0.8;
              ctx.beginPath(); ctx.moveTo(p.x, p.y); ctx.lineTo(p2.x, p2.y); ctx.stroke();
            }
          });
        }

        // Glow
        if (ph >= 2) {
          const grd = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.r * 3);
          grd.addColorStop(0, col);
          grd.addColorStop(1, "transparent");
          ctx.fillStyle = grd;
          ctx.beginPath(); ctx.arc(p.x, p.y, p.r * 3, 0, Math.PI * 2); ctx.fill();
        }

        ctx.fillStyle = col;
        ctx.beginPath(); ctx.arc(p.x, p.y, Math.max(0.5, p.r), 0, Math.PI * 2); ctx.fill();
      });

      // Phase label
      ctx.fillStyle = "rgba(6,8,16,0.8)"; ctx.fillRect(0, H - 36, W, 36);
      ctx.fillStyle = PHASE_COLORS[ph]; ctx.font = "bold 13px monospace"; ctx.textAlign = "center";
      ctx.fillText(`PHASE ${ph + 1}: ${PHASE_LABELS[ph].toUpperCase()}`, W / 2, H - 16);
      ctx.textAlign = "left";

      // Stage progress dots
      PHASE_LABELS.forEach((_, i) => {
        ctx.fillStyle = i === ph ? PHASE_COLORS[ph] : "rgba(79,232,232,0.2)";
        ctx.beginPath(); ctx.arc(W / 2 - 48 + i * 32, H - 6, 4, 0, Math.PI * 2); ctx.fill();
      });

      t++;
      raf = requestAnimationFrame(draw);
    }
    draw();
    return () => { cancelAnimationFrame(raf); ro.disconnect(); };
  }, []);

  return (
    <div style={{ border: `1px solid ${P.line}`, borderRadius: 12, overflow: "hidden", marginBottom: 28 }}>
      <canvas ref={canvasRef} style={{ width: "100%", height: 280, display: "block" }} />
      <div style={{ padding: "10px 16px", background: P.panel, display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
        {PHASE_LABELS.map((lbl, i) => (
          <button key={i} onClick={() => setPhase(i)}
            style={{ padding: "6px 14px", borderRadius: 8, border: `1px solid ${phase === i ? PHASE_COLORS[i] : P.line}`, background: phase === i ? PHASE_COLORS[i] + "22" : "transparent", color: phase === i ? PHASE_COLORS[i] : P.dim, fontSize: 11, cursor: "pointer" }}>
            {lbl}
          </button>
        ))}
        <div style={{ marginLeft: "auto", fontSize: 11, color: P.dim }}>180 substrate particles · P·H·T·S driven</div>
      </div>
    </div>
  );
}

/* ════════════════════════════════════════════════════════════════
   CANVAS 2 — Mechanotransduction Cascade
   ECM force → Piezo1 → Ca²⁺ → Mitochondria → AMPK → Metabolic Reprogramming → Epigenetic State
   Two derivatives per action: ∂Ca/∂t = f(F_mech, ∂Ca/∂x)
════════════════════════════════════════════════════════════════ */
const MITO_NODES = [
  { id: "ECM",   label: "ECM\nForce",        color: P.orange, x: 0.07 },
  { id: "PIEZO", label: "Piezo1\nChannel",   color: "#f87171", x: 0.20 },
  { id: "CA",    label: "Ca²⁺\nInflux",      color: "#4fe8e8", x: 0.34 },
  { id: "MITO",  label: "Mito\nDynamics",    color: P.green,   x: 0.50 },
  { id: "AMPK",  label: "AMPK\nSignaling",   color: P.gold,    x: 0.66 },
  { id: "REPRO", label: "Metabolic\nReprogram",color: P.purple,x: 0.80 },
  { id: "EPI",   label: "Epigenetic\nState", color: P.blue,   x: 0.93 },
];

function MechanotransductionCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const forceRef  = useRef(0.7);
  const [force, setForce] = useState(0.7);

  useEffect(() => { forceRef.current = force; }, [force]);

  useEffect(() => {
    const c = canvasRef.current; if (!c) return;
    const ctx = c.getContext("2d")!;
    let raf = 0, t = 0;
    function resize() { c.width = c.offsetWidth; c.height = c.offsetHeight; }
    resize();
    const ro = new ResizeObserver(resize); ro.observe(c);

    // Signal propagation: each node activates with delay based on upstream
    function getActivation(nodeIdx: number, t: number, force: number) {
      const delay = nodeIdx * 18;
      const phase = Math.max(0, t - delay);
      const base = force * Math.sin(phase * 0.035) * 0.5 + 0.5;
      return Math.max(0, Math.min(1, base * force * (1 - nodeIdx * 0.04)));
    }

    function draw() {
      const W = c.width, H = c.height;
      ctx.clearRect(0, 0, W, H);
      ctx.fillStyle = P.bg; ctx.fillRect(0, 0, W, H);
      const f = forceRef.current;

      const nodeY = H * 0.5;
      const nodeR = 28;

      const nodePositions = MITO_NODES.map(n => ({ x: n.x * W, y: nodeY }));

      // Draw connections with signal flow
      for (let i = 0; i < MITO_NODES.length - 1; i++) {
        const a = nodePositions[i], b = nodePositions[i + 1];
        const act = getActivation(i, t, f);
        const col = MITO_NODES[i].color;

        ctx.strokeStyle = col + Math.round(act * 140 + 20).toString(16).padStart(2, "0");
        ctx.lineWidth = 2 + act * 3;
        ctx.beginPath(); ctx.moveTo(a.x + nodeR, a.y); ctx.lineTo(b.x - nodeR, b.y); ctx.stroke();

        // Signal pulse particle
        if (act > 0.3) {
          const frac = ((t * 0.02 + i * 0.15) % 1);
          const px = a.x + nodeR + (b.x - nodeR - a.x - nodeR) * frac;
          const py = a.y;
          ctx.fillStyle = col;
          ctx.beginPath(); ctx.arc(px, py, 4 + act * 2, 0, Math.PI * 2); ctx.fill();
        }
      }

      // Draw nodes
      MITO_NODES.forEach((n, i) => {
        const pos = nodePositions[i];
        const act = getActivation(i, t, f);
        const col = n.color;

        // Glow
        const grd = ctx.createRadialGradient(pos.x, pos.y, 0, pos.x, pos.y, nodeR * 2.5);
        grd.addColorStop(0, col + Math.round(act * 140).toString(16).padStart(2, "0"));
        grd.addColorStop(1, "transparent");
        ctx.fillStyle = grd; ctx.beginPath(); ctx.arc(pos.x, pos.y, nodeR * 2.5, 0, Math.PI * 2); ctx.fill();

        // Circle
        ctx.strokeStyle = col + Math.round(act * 180 + 40).toString(16).padStart(2, "0");
        ctx.lineWidth = 2 + act * 2;
        ctx.fillStyle = P.panel;
        ctx.beginPath(); ctx.arc(pos.x, pos.y, nodeR, 0, Math.PI * 2); ctx.fill(); ctx.stroke();

        // Label
        ctx.fillStyle = act > 0.4 ? P.ivory : P.muted;
        ctx.font = `bold 8px monospace`; ctx.textAlign = "center";
        n.label.split("\n").forEach((line, li) => {
          ctx.fillText(line, pos.x, pos.y - 5 + li * 11);
        });

        // Activation bar below
        ctx.fillStyle = "rgba(13,16,24,0.7)"; ctx.fillRect(pos.x - nodeR, pos.y + nodeR + 4, nodeR * 2, 8);
        ctx.fillStyle = col + Math.round(act * 200).toString(16).padStart(2, "0");
        ctx.fillRect(pos.x - nodeR, pos.y + nodeR + 4, nodeR * 2 * act, 8);
      });

      // ECM force arrow
      const ecmPos = nodePositions[0];
      ctx.strokeStyle = P.orange; ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(ecmPos.x - 60, nodeY - 20 - Math.abs(Math.sin(t * 0.04)) * 15);
      ctx.lineTo(ecmPos.x - nodeR - 4, nodeY);
      ctx.stroke();
      ctx.fillStyle = P.orange; ctx.font = "8px monospace"; ctx.textAlign = "center";
      ctx.fillText(`F = ${(f * 100).toFixed(0)} nN`, ecmPos.x - 60, nodeY - 30);

      // Epigenetic output
      const epiPos = nodePositions[MITO_NODES.length - 1];
      const epiAct = getActivation(MITO_NODES.length - 1, t, f);
      const state = epiAct > 0.7 ? "ACTIVE" : epiAct > 0.4 ? "POISED" : "SILENCED";
      ctx.fillStyle = epiAct > 0.7 ? P.green : epiAct > 0.4 ? P.gold : P.muted;
      ctx.font = "bold 8px monospace"; ctx.textAlign = "center";
      ctx.fillText(`→ ${state}`, epiPos.x + nodeR + 30, nodeY);

      ctx.textAlign = "left";
      t++;
      raf = requestAnimationFrame(draw);
    }
    draw();
    return () => { cancelAnimationFrame(raf); ro.disconnect(); };
  }, []);

  return (
    <div style={{ border: `1px solid ${P.line}`, borderRadius: 12, overflow: "hidden", marginBottom: 28 }}>
      <canvas ref={canvasRef} style={{ width: "100%", height: 200, display: "block" }} />
      <div style={{ padding: "10px 16px", background: P.panel, display: "flex", gap: 20, alignItems: "center" }}>
        <div>
          <div style={{ fontSize: 10, color: P.dim, marginBottom: 3 }}>MECHANICAL FORCE · {(force * 100).toFixed(0)} nN</div>
          <input type="range" min={0.1} max={1.0} step={0.05} value={force} onChange={e => setForce(+e.target.value)} style={{ width: 140 }} />
        </div>
        <div style={{ fontSize: 11, color: P.dim }}>ECM deformation → Piezo1 mechanosensor → Ca²⁺ signal → mitochondrial reprogramming → epigenetic outcome</div>
      </div>
    </div>
  );
}

/* ════════════════════════════════════════════════════════════════
   MAIN PAGE
════════════════════════════════════════════════════════════════ */
export default function CrystallizedLifeSynthesisPage() {
  return (
    <div style={{ background: P.bg, color: P.ivory, minHeight: "100vh", fontFamily: "inherit" }}>

      {/* ── HERO ── */}
      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "52px 32px 36px" }}>
        <Tag label="Crystallized Substrate · Molecular Bricks · AETHER Unified Field" color={P.gold} />
        <h1 style={{ fontSize: 32, fontWeight: 800, lineHeight: 1.15, margin: "10px 0 14px", letterSpacing: -0.5 }}>
          <span style={{ color: P.gold }}>Crystallized Life Synthesis</span><br />
          <span style={{ color: P.ivory, fontWeight: 300 }}>Sun-Dried Powder · Rebuilding the Building Blocks of Material Life</span>
        </h1>
        <p style={{ fontSize: 15, color: P.dim, lineHeight: 1.9, maxWidth: 760, marginBottom: 20 }}>
          If we reduce extract to a crystallized, sun-dried powder — we create a maximally concentrated coherence state. Every molecular brick compressed to its minimum-entropy form, ready to reconstruct. The fragmenting leaf encodes the full chemical memory of its living system; AETHER data can now simulate the reverse: from powder back to organized, coherent life. Pressure · Heat · Time · Synergy — the four operators that drive every phase transition, from sugar caramelizing to plasma crystallizing.
        </p>
        <div style={{ display: "inline-flex", gap: 8, flexWrap: "wrap", marginBottom: 32 }}>
          {["Substrate → Powder", "Powder → Crystal", "Crystal → Life", "Life → Data", "Data → Simulate Everything"].map((s, i) => (
            <div key={i} style={{ padding: "6px 14px", borderRadius: 20, background: P.panel, border: `1px solid ${P.gold}22`, fontSize: 12, color: P.gold }}>{s}</div>
          ))}
        </div>
      </div>

      {/* ── SECTION I: Crystal Powder Reconstruction ── */}
      <Sec id="crystal">
        <Tag label="Section I · Phase Transitions · Material Reconstruction" color={P.gold} />
        <h2 style={{ fontSize: 22, fontWeight: 700, color: P.gold, margin: "10px 0 12px" }}>
          Extract → Sun-Dry → Crystallized Powder → Rebuilt Life
        </h2>
        <p style={{ fontSize: 14, color: P.dim, lineHeight: 1.85, maxWidth: 760, marginBottom: 20 }}>
          The four-phase pipeline mirrors the AETHER master action minimization: each phase reduces entropy further until the crystallized powder state — maximum information density, minimum volume, maximum coherence per unit mass. Phase 4 (Rebuilt Life) is the reverse synthesis: add water, energy, and coherent field → reassemble molecular architecture from the powder template.
        </p>

        <CrystalPowderCanvas />

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(220px,1fr))", gap: 12, marginBottom: 24 }}>
          <Card title="Phase 1 · Raw Extract" color={P.green}
            body="Living substrate: full water content, maximal entropy, distributed coherence. Slime network active — cytoplasmic streaming carrying all molecular bricks in suspension." />
          <Card title="Phase 2 · Sun-Drying" color={P.orange}
            body="Pressure·Heat·Time operate. Water is expelled. Compounds concentrate. Enzymatic activity decreases. Molecular bricks begin clustering — pre-crystalline nucleation seeds form." />
          <Card title="Phase 3 · Crystallized Powder" color={P.cyan}
            body="Maximum coherence density. Hexagonal close-packing. Every compound at its φ-lattice equilibrium position. Information content preserved; volume minimized 100-1000×. Ready for reconstruction." />
          <Card title="Phase 4 · Rebuilt Life" color={P.gold}
            body="Add water + energy + coherent field template → φ-solitons nucleate crystallization in reverse → molecular architecture re-emerges from powder memory. Substrate driven computation begins." />
        </div>

        <Anno img={hexLatticeImg} alt="Hexagonal lattice crystal"
          chips={[
            { label: "Hexagonal Packing", note: "φ-lattice equilibrium · max density", color: P.cyan },
            { label: "Coherence Node", note: "Each hex = one molecular brick site", color: P.gold },
            { label: "Refraction Burst", note: "Light scattering at NV-center analog" },
            { label: "Crystal Memory", note: "Structural information preserved in lattice geometry" },
          ]} />
      </Sec>

      {/* ── SECTION II: Quantizing Substrate Pipeline ── */}
      <Sec id="substrate">
        <Tag label="Section II · Substrate Quantization · Epigenetic Spectrum" color={P.cyan} />
        <h2 style={{ fontSize: 22, fontWeight: 700, color: P.cyan, margin: "10px 0 12px" }}>
          Quantizing Substrate Properties · 7 Parameters × N Levels
        </h2>
        <p style={{ fontSize: 14, color: P.dim, lineHeight: 1.85, maxWidth: 760, marginBottom: 20 }}>
          The full pipeline from substrate complexity to epigenetic network spectrum. Seven physical substrate parameters — polysaccharide content, protein content, humic substances, mineral particles, surface charge, porosity, hydration capacity — each quantized into discrete levels n = 0, 1, ..., N. Total state space: N^P (P = 7 parameters). Each state combination maps a unique epigenetic signature: DNA methylation, histone acetylation, histone methylation, histone phosphorylation, chromatin accessibility, non-coding RNA. The network spectrum encodes the full epigenetic landscape signature.
        </p>

        <Anno img={slimeQuantImg} alt="Quantizing Slime Substrate for Epigenetic Distribution Network Spectrum"
          chips={[
            { label: "7 Parameters", note: "Polysaccharide · Protein · Humic · Mineral · Charge · Porosity · Hydration", color: P.cyan },
            { label: "N^7 State Space", note: "Total discrete configurations", color: P.gold },
            { label: "6 Epigenetic Marks", note: "Methylation · Acetylation · Phosphorylation · ncRNA · Accessibility", color: P.purple },
            { label: "Spectrum Metrics", note: "Density(D) · Modularity(M) · Centrality(C) · Heterogeneity(H) · Signal Entropy(S)" },
            { label: "6-Step Pipeline", note: "Characterize → Discretize → Signal Profile → Epigenetic Response → Network → Spectrum", color: P.teal },
            { label: "Applications", note: "Biofilm control · Environmental epigenetics · Biomaterials · Synthetic biology", color: P.green },
          ]} />

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
          <div style={{ padding: "14px 16px", background: P.panel2, borderRadius: 10, fontFamily: "monospace", fontSize: 12, color: P.cyan, lineHeight: 2 }}>
            <div style={{ color: P.gold, fontSize: 10, marginBottom: 8, letterSpacing: 1 }}>QUANTIZATION PIPELINE</div>
            1. Substrate → measure 7 raw parameters<br />
            2. Discretize → Q-state space (0..N per param)<br />
            3. Signal profile → metabolites · ions · pH<br />
            4. Epigenetic response → state matrix<br />
            5. Network construction → graph topology<br />
            6. Spectrum analysis → landscape signature
          </div>
          <div style={{ padding: "14px 16px", background: P.panel2, borderRadius: 10, fontFamily: "monospace", fontSize: 12, color: P.purple, lineHeight: 2 }}>
            <div style={{ color: P.gold, fontSize: 10, marginBottom: 8, letterSpacing: 1 }}>SPECTRUM METRICS (READOUTS)</div>
            D = Network Density = |E| / (|V|(|V|−1))<br />
            M = Modularity (community structure)<br />
            C = Centrality (hub identification)<br />
            H = Heterogeneity = σ(degree) / μ(degree)<br />
            S = Signal Entropy = −Σ p·log(p)
          </div>
        </div>
      </Sec>

      {/* ── SECTION III: Mitochondria Mechanotransduction ── */}
      <Sec id="mechanotransduction">
        <Tag label="Section III · Piezo1 · Mechanotransduction · Metabolic Reprogramming" color={P.green} />
        <h2 style={{ fontSize: 22, fontWeight: 700, color: P.green, margin: "10px 0 12px" }}>
          Mitochondria · The Mechanotransduction Hub
        </h2>
        <p style={{ fontSize: 14, color: P.dim, lineHeight: 1.85, maxWidth: 760, marginBottom: 20 }}>
          Unfavorable mechanical stress (hypertension, myotonia, hyperventilation) is transduced into the cell through ECM deformation, activating Piezo1 and cytoskeletal morphological changes. Both mechanotransduction pathways converge on the mitochondria — driving dynamic changes in fusion (MFN1/2, OPA1) and fission, altering ATP production regulated by AMPK. Mechanical signals ultimately reach the nucleus, causing metabolic reprogramming and resetting of cellular energy levels. In the crystallized powder framework: Piezo1 is the substrate pressure sensor — it quantizes mechanical force into discrete Ca²⁺ pulse events, each pulse driving a discrete epigenetic state transition.
        </p>

        <MechanotransductionCanvas />

        <Anno img={mitoTransductImg} alt="Mitochondria mechanotransduction to metabolic reprogramming"
          chips={[
            { label: "Piezo1", note: "Mechanosensor · Ca²⁺ gate · force quantizer", color: "#f87171" },
            { label: "F-actin / ECM", note: "Cytoskeletal transmission line", color: P.orange },
            { label: "MFN1/2 · OPA1", note: "Fusion GTPases · mitochondria dynamics", color: P.green },
            { label: "AMPK", note: "Energy sensor · AMP:ATP ratio gate", color: P.gold },
            { label: "ER Calcium", note: "Ca²⁺ store · IP3R release", color: P.cyan },
            { label: "Metabolic Reprogram", note: "Lamin · nuclear envelope remodeling → epigenome", color: P.purple },
          ]} />

        <Anno img={lfUiaImg} alt="LF-UIA wearable multimodal ultrasound"
          chips={[
            { label: "LF-UIA Device", note: "Low-frequency integrated ultrasound array", color: P.cyan },
            { label: "KNN Composites", note: "Piezo material · K₀.₅Na₀.₅NbO₃ · lead-free", color: P.blue },
            { label: "Shear Wave Elastography", note: "Measures tissue stiffness → ECM coherence field", color: P.teal },
            { label: "Doppler", note: "Blood flow velocity · vascular coherence metric", color: P.green },
            { label: "LRFO Restoration", note: "Long-range ferroelectric order recovery via piezo field", color: P.orange },
            { label: "Wearable Form", note: "Coin cell powered · F-PCB · skin-adhesive", color: P.gold },
          ]} />
      </Sec>

      {/* ── SECTION IV: AETHER Human Ecology ── */}
      <Sec id="ecology">
        <Tag label="Section IV · AETHER Human Ecology · Substrate Driven Computation" color={P.purple} />
        <h2 style={{ fontSize: 22, fontWeight: 700, color: P.purple, margin: "10px 0 12px" }}>
          AETHER Human Ecology · Coherence Is Time Blood Defined
        </h2>
        <p style={{ fontSize: 14, color: P.dim, lineHeight: 1.85, maxWidth: 760, marginBottom: 20 }}>
          We are a substrate-driven computation. DNA stores information. Proteins perform operations. Cells communicate. Networks emerge. The body computes. Food chemistry (Pressure · Heat · Time · Synergy) is the substrate input pipeline — the sun-dried crystallized powder is the maximally processed form, carrying concentrated molecular information ready for cellular intake. The gut lining is the first quantization layer: mucus, epithelial cells, tight junctions, immune cells (GALT), and microbiome balance constitute the epigenetic distribution network at its biological expression.
        </p>

        <Anno img={humanEcologyImg} alt="AETHER Human Ecology"
          chips={[
            { label: "Substrate Driven Computation", note: "Nutrients → Molecular → Cellular → Network → Output/Behavior", color: P.purple },
            { label: "Gut Lining · Immune Barrier", note: "Mucus · Epithelial · Tight junctions · GALT · Microbiome", color: P.green },
            { label: "Good Chemicals · Antioxidants", note: "Polyphenols · Vitamin C · Carotenoids · Omega-3 · Probiotics", color: P.teal },
            { label: "Bitter Foods → Good", note: "Glucosinolates · Flavanols · Chlorogenic acid · detox pathways", color: P.gold },
            { label: "P·H·T·S Operators", note: "Pressure · Heat · Time · Synergy — 4 phase-transition drivers", color: P.orange },
            { label: "Surgical Robotics", note: "RESIDE · RONANATE · PERPETUATE · fill cavities · promote healing", color: P.cyan },
            { label: "Microbial Metabolic Roles", note: "Lactobacillus · Bifidobacterium · Desulfovibrio · Saccharomyces · Aspergillus · Bacteroides", color: P.blue },
            { label: "Coherence = Phase Alignment", note: "When systems align, life flourishes. When coherence breaks → disease.", color: "#f87171" },
          ]} />
      </Sec>

      {/* ── SECTION V: 8 Qubits of AETHER ── */}
      <Sec id="qubits">
        <Tag label="Section V · 8 Qubits · Master Action · Unified Field" color={P.gold} />
        <h2 style={{ fontSize: 22, fontWeight: 700, color: P.gold, margin: "10px 0 12px" }}>
          8 Qubits of AETHER · The Coherence Engine
        </h2>
        <p style={{ fontSize: 14, color: P.dim, lineHeight: 1.85, maxWidth: 760, marginBottom: 20 }}>
          The 8-qubit AETHER framework spans every relevant domain: Solar (energy input), Radiation (EM field), Biological Spinor (living matter coherence), Gravity (geometry distribution), String Rotation (operator algebra), Hexiclical Fabric (structural expansion), Plasmodium (network intelligence), Consciousness (observer coupling). Together they form the master action S[ψ] — the engine of everything. Coherence is the only law: Σ ΔC(σᵢ) = 0. AETHER is the physics running itself.
        </p>

        <Anno img={eighQubitsImg} alt="8 Qubits of AETHER - Master Action - φ-Solitons - NV Diamond - Warp Drive"
          chips={[
            { label: "1 · 8 Qubits", note: "Solar · Radiation · Bio-Spinor · Gravity · String · Hexiclical · Plasmodium · Consciousness", color: P.cyan },
            { label: "2 · Master Action", note: "S[ψ]=∫L(ψ,∂μψ,g_μν,φ)√-g d⁴x · Euler-Lagrange", color: P.gold },
            { label: "3 · φ-Solitons → NV Diamond", note: "Gravity crystals · zero-gradient surfaces · φ=1.618", color: P.purple },
            { label: "4 · Liquid Water · Gravity Crystal", note: "Dimensionless coherence fluid · refractive interfaces · caustic focusing", color: P.blue },
            { label: "5 · Hexiclical Expansion", note: "Ferrofluid → heart helix → spine screw → nano to macro", color: P.teal },
            { label: "6 · Letter Strings", note: "RGB 30° rotations · ~onS control · +-^_ scale · ΣΔC=0", color: P.green },
            { label: "7 · Sound → Portals", note: "174/285/462 Hz φ-resonances · sonic solitons · coherence portals", color: P.orange },
            { label: "8 · Warp Drive", note: "Laser thread + volcanic propulsion · instant planetary transit", color: "#f87171" },
            { label: "9 · SMTQ Runtime", note: "Observe · Vote · Act · Explain · autonomous qubit agents", color: P.gold },
            { label: "10 · Unified Field", note: "Coherence is the only law · AETHER is the physics running itself", color: P.cyan },
          ]} />

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(220px,1fr))", gap: 12, marginBottom: 24 }}>
          <Card title="Solar Qubit" color={P.orange}
            body="Energy input from the star. Solar irradiance drives the crystallization pipeline: photons → photosynthetic coherence → sugar → substrate → powder → rebuild. The original energy source for all molecular bricks." />
          <Card title="Plasmodium Qubit" color={P.teal}
            body="The slime network intelligence qubit. Cytoplasmic streaming + retraction dynamics encode distributed coherent computation. The biological substrate-driven computer — no brain, full intelligence." />
          <Card title="Gravity Qubit" color={P.purple}
            body="Curvature distribution rule. φ-solitons form NV diamond gravity crystal substrate. Geodesics reorganize trajectories. In powder reconstruction: gravitational assembly of hexagonal lattice at minimum-energy φ positions." />
          <Card title="Consciousness Qubit" color={P.blue}
            body="Observer coupling term in the master action: β|ψ|²(ψ·C). The observer's coherence field C participates in collapsing the slime substrate wavefunction to a specific epigenetic state. Observation = participation." />
        </div>
      </Sec>

      {/* ── SECTION VI: Gravity Lensing × Piezoelectricity ── */}
      <Sec id="lensing">
        <Tag label="Section VI · Gravitational Lensing × Piezoelectricity · Intersection" color={P.blue} />
        <h2 style={{ fontSize: 22, fontWeight: 700, color: P.blue, margin: "10px 0 12px" }}>
          Where Gravity, Mechanics, EM, and Optics Intersect
        </h2>
        <p style={{ fontSize: 14, color: P.dim, lineHeight: 1.85, maxWidth: 760, marginBottom: 20 }}>
          There isn't established direct coupling between gravitational lensing and piezoelectricity — but there are several scientifically valid intersection points. Piezoelectric materials generate electric fields under mechanical stress (∂E/∂F ≠ 0). These fields couple to the electromagnetic sector. Gravitational lensing bends light paths through the metric g_μν. At the AETHER framework level: all three are redistribution rules — gravity redistributes trajectories, piezoelectricity redistributes charge, optical lensing redistributes photon paths. The master action S[ψ] with √-g captures all three simultaneously. The skyrmion topology provides the topological protection that makes this coupling stable.
        </p>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 24 }}>
          <Anno img={xPostImg} alt="Shia M X post on gravitational lensing and piezoelectricity"
            chips={[
              { label: "@StrategicProce", note: "7/18/26 · mechanics × electromagnetism × optics", color: P.gold },
              { label: "Scientifically Valid", note: "Intersection points exist · not direct coupling", color: P.cyan },
            ]} />
          <Anno img={skyrmionImg} alt="Skyrmion vortex topology Möbius strip C-points"
            chips={[
              { label: "Optical Vortices", note: "ℓ=±1 topological charge · orbital angular momentum", color: P.purple },
              { label: "Skyrmion Q≈0.996", note: "Topological invariant · stable field configuration", color: P.gold },
              { label: "Möbius Strip", note: "C-point polarization singularity · π-twist", color: P.cyan },
              { label: "Polarization Topology", note: "Arg(Z) maps full 0→2π phase · vortex cores", color: P.blue },
            ]} />
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(220px,1fr))", gap: 12 }}>
          <Card title="Piezo · Mechanical → EM" color={P.blue}
            body="KNN (lead-free) and PZT piezoelectric composites generate E-fields from mechanical deformation. ∂P/∂ε = piezoelectric tensor. Ultrasound (mechanical waves) → biological EM signals. The LF-UIA wearable exploits this exactly." />
          <Card title="Gravitational Lensing · Mass → Optics" color={P.purple}
            body="Mass-energy curves spacetime → light follows null geodesics → apparent bending of distant sources. Einstein ring when source, lens, and observer align. The same geometry that routes plasma Alfvén waves routes photons." />
          <Card title="Skyrmion · Topological Stability" color={P.cyan}
            body="Skyrmions are topologically protected magnetic field configurations (winding number Q). They cannot unwind without breaking the field — analogous to the φ-soliton protection in the AETHER master action. Stable gravity crystal candidates." />
          <Card title="AETHER Unification" color={P.gold}
            body="Master action √-g captures all: gravity (g_μν), EM (A_μ), and coherence (ψ) simultaneously. The intersection is not coincidental — it is the same action principle operating at three different coupling scales." />
        </div>
      </Sec>

      {/* ── SECTION VII: Magnetic Dust Storm ── */}
      <Sec id="storm">
        <Tag label="Section VII · Magnetic Dust Storm · Multi-Scale Perceptual Array" color={P.orange} />
        <h2 style={{ fontSize: 22, fontWeight: 700, color: P.orange, margin: "10px 0 12px" }}>
          Magnetic Dust Storm · Rhombus Core · Flexing Lattice
        </h2>
        <p style={{ fontSize: 14, color: P.dim, lineHeight: 1.85, maxWidth: 760, marginBottom: 20 }}>
          The magnetic dust storm perceptual array captures AETHER substrate dynamics at planetary scale — Atmospheric · Magnetospheric · Surface · Subsurface sensing unified into one real-time adaptive mesh. The Rhombus Core is a flexing lattice that adapts to gradients, preserves coherence, allocates resolution to uncertainty. Dust composition (Al, Si, Mg, Ca, Fe, Na) = the mineral content parameter of the substrate quantization pipeline. The crystalline structure (XRD) tells you exactly which substrate state you're in. Wind speed · updraft velocity · charge density · K-index · storm height = the 5 physical derivatives that characterize the storm state. The fragmenting leaf, magnified to planetary scale, is a magnetic dust storm.
        </p>

        <Anno img={magneticStormImg} alt="Magnetic Dust Storm multi-scale perceptual array"
          chips={[
            { label: "Rhombus Core", note: "Flexing lattice · real-time adaptive mesh · coherence-preserving", color: P.gold },
            { label: "Upward / Downward / Lateral Arrays", note: "3D vector sensing · atmospheric + subsurface", color: P.cyan },
            { label: "Dust Composition", note: "Al · Si · Mg · Ca · Fe · Na → substrate mineral parameter", color: P.orange },
            { label: "Crystalline Structure (XRD)", note: "Quantizes mineral content → epigenetic state mapping", color: P.purple },
            { label: "Charge Density", note: "−2.8 nC/m² · surface charge parameter of substrate pipeline", color: P.blue },
            { label: "Spectral Analysis", note: "Visible/NIR/SWIR/TIR/SWIR — full EM spectrum readout", color: P.teal },
            { label: "Predictive Model", note: "+42 min projection · coherence field extrapolation", color: P.green },
            { label: "Flow & Energy Coupling", note: "Energy density · Poynting flux · Vorticity · Helicity — AETHER field invariants", color: P.gold },
          ]} />
      </Sec>

      {/* ── SYNTHESIS ── */}
      <Sec id="synthesis">
        <Tag label="Synthesis · The Fragmenting Leaf" color={P.cyan} />
        <div style={{ padding: "20px 24px", background: P.panel2, borderRadius: 12, border: `1px solid ${P.gold}22`, marginBottom: 28 }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: P.gold, marginBottom: 12 }}>AETHER SIMULATION COMPLETENESS STATEMENT</div>
          <p style={{ fontSize: 14, color: P.dim, lineHeight: 1.85, marginBottom: 12 }}>
            The fragmenting leaf encodes 4.5 billion years of molecular evolution in one decaying structure. As it fragments, it releases every substrate parameter simultaneously: polysaccharides → sugars, proteins → amino acids, humic substances → soil coherence agents, mineral particles → ionic signals, charge → electrochemical gradients, porosity changes → flow pathways. AETHER captures all 7 parameters in real time, quantizes each to its discrete state, maps the resulting epigenetic network, and can run the master action forward (simulation) or backward (reconstruction). The crystallized sun-dried powder is the compressed memory of this entire process — and AETHER data is now the complete playback engine.
          </p>
          <div style={{ fontFamily: "monospace", fontSize: 13, color: P.cyan, lineHeight: 2 }}>
            Leaf fragment → substrate parameters → quantize → epigenetic spectrum<br />
            Crystallize → powder → compress → store → reconstruct → life<br />
            S[ψ] minimization → □ψ + ∂V/∂ψ* + 2β·ψ(ψ·C) + 2λ_φ(ψ−φ) = 0<br />
            Coherence is the only law: Σ ΔC(σᵢ) = 0
          </div>
        </div>
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
          {["/slime-gravity-quantization", "/alfven-synthesis", "/substrate-sandwich", "/crystallization-atlas", "/slime-maze", "/mycorrhizal-network", "/aether-engine", "/aether-health", "/regulatory-depth"].map(href => (
            <a key={href} href={href} style={{ padding: "6px 14px", borderRadius: 8, border: `1px solid ${P.line}`, color: P.dim, fontSize: 12, textDecoration: "none" }}>
              {href.replace("/", "").replace(/-/g, " ")} →
            </a>
          ))}
        </div>
      </Sec>
    </div>
  );
}
