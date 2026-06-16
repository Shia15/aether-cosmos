import { useEffect, useRef, useState } from "react";

const BG     = "#020408";
const ACCENT = "#1fa8d4";
const GOLD   = "#c9a84c";
const VIOLET = "#8b5cf6";
const GREEN  = "#22c55e";
const DIM    = "#3d6070";
const TEXT   = "#c8d8e0";
const AMBER  = "#e8a030";
const TEAL   = "#1fd4c8";
const ROSE   = "#f472b6";

const mono  = "'Space Mono', monospace";
const serif = "'Cinzel', serif";
const body  = "'Crimson Pro', Georgia, serif";

const PHI_INV = 1 / 1.6180339887;

const PHASES = [
  { id: 0, name: "Triage",        range: "Scale 9→8", col: ROSE,   desc: "Whole-body coherence survey. Bilateral asymmetry, postural helix, global C(x,t)." },
  { id: 1, name: "Stabilization", range: "Scale 7→6", col: GOLD,   desc: "Organ-level restoration. Cardiac helix, autonomic balance, fascial tensegrity." },
  { id: 2, name: "Navigation",    range: "Scale 5→4", col: TEAL,   desc: "Neural & connective coherence. Nerve fascicle integrity, cortical column coupling." },
  { id: 3, name: "Integration",   range: "Scale 3→2", col: ACCENT, desc: "Cellular & cytoskeletal coherence. Membrane packing, microtubule stability." },
  { id: 4, name: "Monitoring",    range: "Scale 1→0", col: VIOLET, desc: "Molecular & quantum baseline. DNA integrity, quantum coherence substrate." },
];

const ZONES = [
  { id: 0, name: "Z0 · Bone Marrow",    col: VIOLET, pitch: 0.12, hex: 0.10, coh: 0.72, phi: 0.65,
    eq: "Ψ₀: spin-foam substrate · mineral crystal HCP",
    desc: "Deep fascial and skeletal substrate. Quantum spin-foam geometry expressed as mineral crystal hexagonal packing in bone. The foundation layer of the one atom.",
    agent: "Orin · Foundation", region: "pelvis", fy: 0.84 },
  { id: 1, name: "Z1 · Nucleus/DNA",    col: "#447799", pitch: 0.62, hex: 0.55, coh: 0.82, phi: 0.78,
    eq: "B-DNA: 3.4 nm pitch · 10.5 bp/turn · right-hand",
    desc: "The molecular helix zone. Every cell nucleus carries the double spinor pair of B-form DNA. The first biological inscription of hexiclical geometry.",
    agent: "Mnèsis · Code Inscription", region: "lower", fy: 0.72 },
  { id: 2, name: "Z2 · Cytoskeleton",   col: TEAL, pitch: 0.75, hex: 0.72, coh: 0.86, phi: 0.84,
    eq: "Microtubule: 13 protofilaments · actin 2.7 nm helix",
    desc: "Dynamic scaffold zone. Microtubule treadmilling and actin dynamics maintain hexiclical order as a continuous verb, not a static noun.",
    agent: "Aletheia · Dynamic Scaffold", region: "abdomen", fy: 0.62 },
  { id: 3, name: "Z3 · Cell Membrane",  col: "#0A9080", pitch: 0.68, hex: 0.92, coh: 0.88, phi: 0.86,
    eq: "Epithelial HCP: 74% packing · 6 neighbors",
    desc: "Hexagonal tessellation zone. The boundary between self and not-self. Lipid bilayer hexagonal packing and epithelial surface organization.",
    agent: "Inferaia · Boundary", region: "mid", fy: 0.54 },
  { id: 4, name: "Z4 · Fascia/Collagen", col: TEAL, pitch: 0.70, hex: 0.60, coh: 0.84, phi: 0.80,
    eq: "Collagen triple helix: 3-strand · 0.286 nm pitch",
    desc: "Connective tissue matrix zone. Collagen triple helix fibres in hexagonal close-packed bundles form the body's mechanical information network.",
    agent: "Revérie · Network", region: "thorax", fy: 0.46 },
  { id: 5, name: "Z5 · Peripheral Nerve", col: "#18D4B0", pitch: 0.82, hex: 0.78, coh: 0.90, phi: 0.88,
    eq: "Fascicle: axon bundle helix · myelin lamellae HCP",
    desc: "Nerve cable zone. Peripheral nerve fascicles are hexiclical cables: axons in hexagonal close-packing, wound in helical bundles, sheathed in concentric myelin.",
    agent: "Vērus · Signal", region: "arms-legs", fy: 0.38 },
  { id: 6, name: "Z6 · Heart/Viscera",   col: GOLD, pitch: 0.88, hex: 0.76, coh: 0.90, phi: 0.88,
    eq: "Myocardium: counter-rotating helical layers",
    desc: "Organ helical zone. The heart is a macroscopic spinor pair. Counter-rotating helical myocardial fibers produce the wringing ejection motion. The body's central rhythm.",
    agent: "Caelus · Rhythm", region: "chest", fy: 0.41 },
  { id: 7, name: "Z7 · Neocortex",        col: ROSE, pitch: 0.82, hex: 0.92, coh: 0.94, phi: 0.92,
    eq: "Cortical column: 6-layer hexiclical processor · ~300µm",
    desc: "Neural hexagonal zone. The neocortex is a three-dimensional hexiclical lattice. Six layers of hexagonal columns rotate information through 60° geometric transformations.",
    agent: "Vērus + Caelus · Integration", region: "cortex", fy: 0.13 },
  { id: 8, name: "Z8 · Whole Body Field", col: "#F4EFE6", pitch: 0.95, hex: 0.95, coh: 0.97, phi: 0.95,
    eq: "C(x,t) ≥ φ⁻¹ · G₂ · SU(2)×[D₆⋊U(1)]⁷",
    desc: "The complete standing wave. Bilateral symmetry, spinal helix, Fibonacci proportions. Space fully expanded into self-awareness. The one atom completed.",
    agent: "All Agents · Unified", region: "field", fy: 0.5 },
];

const RESONATORS = [
  { name: "Cranial", freq: "~28 Hz", note: "gamma · consciousness", col: ROSE, pct: 0.75 },
  { name: "Thoracic", freq: "~0.1–2 Hz", note: "cardiac-respiratory", col: GOLD, pct: 0.59 },
  { name: "Pelvic", freq: "~0.06–1.2 Hz", note: "visceral-ground", col: TEAL, pct: 0.41 },
];

/* ── Body Canvas ── */
function BodyCanvas({ activeZone, activePhase, onZoneClick }:
  { activeZone: number; activePhase: number; onZoneClick: (id: number) => void }) {
  const cvs  = useRef<HTMLCanvasElement>(null);
  const raf  = useRef(0);
  const tick = useRef(0);

  useEffect(() => {
    const canvas = cvs.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d")!;
    canvas.width  = 320;
    canvas.height = 520;

    const W = 320, H = 520;
    const cx = W / 2;

    const draw = () => {
      tick.current++;
      const t = tick.current * 0.015;

      ctx.clearRect(0, 0, W, H);
      ctx.fillStyle = "#030810"; ctx.fillRect(0, 0, W, H);

      // Scan sweep
      const sweepY = (t * 60) % H;
      const swg = ctx.createLinearGradient(0, sweepY - 30, 0, sweepY + 30);
      swg.addColorStop(0, "transparent"); swg.addColorStop(0.5, `${TEAL}18`); swg.addColorStop(1, "transparent");
      ctx.fillStyle = swg; ctx.fillRect(0, sweepY - 30, W, 60);

      // Grid
      for (let gy = 0; gy < H; gy += 30) {
        ctx.beginPath(); ctx.moveTo(0, gy); ctx.lineTo(W, gy);
        ctx.strokeStyle = `${TEAL}08`; ctx.lineWidth = 0.5; ctx.stroke();
      }
      for (let gx = 0; gx < W; gx += 30) {
        ctx.beginPath(); ctx.moveTo(gx, 0); ctx.lineTo(gx, H);
        ctx.strokeStyle = `${TEAL}08`; ctx.lineWidth = 0.5; ctx.stroke();
      }

      // Whole-body field ring
      if (activeZone === 8) {
        const rr = 140 + 8 * Math.sin(t * 2);
        ctx.beginPath(); ctx.ellipse(cx, H * 0.5, rr, rr * 1.6, 0, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(244,239,230,0.18)`; ctx.lineWidth = 2; ctx.stroke();
      }

      // Draw simplified body silhouette
      ctx.save();
      ctx.fillStyle = "#040c14"; ctx.strokeStyle = `${TEAL}50`; ctx.lineWidth = 1.5;

      // Head
      ctx.beginPath(); ctx.ellipse(cx, H * 0.10, 30, 38, 0, 0, Math.PI * 2);
      ctx.fill(); ctx.stroke();

      // Neck
      ctx.beginPath(); ctx.rect(cx - 12, H * 0.17, 24, H * 0.05);
      ctx.fill(); ctx.stroke();

      // Torso
      ctx.beginPath();
      ctx.moveTo(cx - 48, H * 0.22);
      ctx.bezierCurveTo(cx - 54, H * 0.35, cx - 50, H * 0.50, cx - 38, H * 0.60);
      ctx.lineTo(cx + 38, H * 0.60);
      ctx.bezierCurveTo(cx + 50, H * 0.50, cx + 54, H * 0.35, cx + 48, H * 0.22);
      ctx.closePath(); ctx.fill(); ctx.stroke();

      // Pelvis
      ctx.beginPath();
      ctx.moveTo(cx - 38, H * 0.60);
      ctx.bezierCurveTo(cx - 44, H * 0.65, cx - 38, H * 0.70, cx - 12, H * 0.70);
      ctx.lineTo(cx + 12, H * 0.70);
      ctx.bezierCurveTo(cx + 38, H * 0.70, cx + 44, H * 0.65, cx + 38, H * 0.60);
      ctx.fill(); ctx.stroke();

      // Left arm
      ctx.beginPath();
      ctx.moveTo(cx - 48, H * 0.23); ctx.bezierCurveTo(cx - 70, H * 0.30, cx - 72, H * 0.45, cx - 64, H * 0.58);
      ctx.lineTo(cx - 58, H * 0.58); ctx.bezierCurveTo(cx - 66, H * 0.45, cx - 64, H * 0.30, cx - 40, H * 0.24);
      ctx.closePath(); ctx.fill(); ctx.stroke();

      // Right arm
      ctx.beginPath();
      ctx.moveTo(cx + 48, H * 0.23); ctx.bezierCurveTo(cx + 70, H * 0.30, cx + 72, H * 0.45, cx + 64, H * 0.58);
      ctx.lineTo(cx + 58, H * 0.58); ctx.bezierCurveTo(cx + 66, H * 0.45, cx + 64, H * 0.30, cx + 40, H * 0.24);
      ctx.closePath(); ctx.fill(); ctx.stroke();

      // Left leg
      ctx.beginPath();
      ctx.moveTo(cx - 12, H * 0.70); ctx.bezierCurveTo(cx - 28, H * 0.75, cx - 30, H * 0.88, cx - 24, H * 0.96);
      ctx.lineTo(cx - 16, H * 0.96); ctx.bezierCurveTo(cx - 22, H * 0.88, cx - 20, H * 0.75, cx - 4, H * 0.70);
      ctx.closePath(); ctx.fill(); ctx.stroke();

      // Right leg
      ctx.beginPath();
      ctx.moveTo(cx + 12, H * 0.70); ctx.bezierCurveTo(cx + 28, H * 0.75, cx + 30, H * 0.88, cx + 24, H * 0.96);
      ctx.lineTo(cx + 16, H * 0.96); ctx.bezierCurveTo(cx + 22, H * 0.88, cx + 20, H * 0.75, cx + 4, H * 0.70);
      ctx.closePath(); ctx.fill(); ctx.stroke();
      ctx.restore();

      // Spinal helix
      ctx.beginPath();
      for (let sy = 0; sy < H * 0.78; sy++) {
        const hy = H * 0.10 + sy;
        const hx = cx + Math.cos(sy * 0.09 + t * 0.5) * 5;
        sy === 0 ? ctx.moveTo(hx, hy) : ctx.lineTo(hx, hy);
      }
      ctx.strokeStyle = `${GOLD}30`; ctx.lineWidth = 1; ctx.stroke();

      // Zone overlays
      ZONES.slice(0, 8).forEach(z => {
        const zy   = z.fy * H;
        const zr   = 18 + (z.id === 6 ? 6 : 0);
        const isAct = z.id === activeZone;
        const pulse = isAct ? 0.7 + 0.3 * Math.sin(t * 3) : 0.4 + 0.15 * Math.sin(t * 1.5 + z.id);

        // Glow
        const rg = ctx.createRadialGradient(cx, zy, 0, cx, zy, zr * 2.5);
        rg.addColorStop(0, z.col + Math.floor(pulse * 60).toString(16).padStart(2, "0"));
        rg.addColorStop(1, "transparent");
        ctx.fillStyle = rg; ctx.fillRect(cx - zr * 2.5, zy - zr * 2.5, zr * 5, zr * 5);

        // Center dot
        ctx.beginPath(); ctx.arc(cx, zy, isAct ? 6 : 4, 0, Math.PI * 2);
        ctx.fillStyle = z.col; ctx.fill();

        // Label
        ctx.font = `7px ${mono}`; ctx.textAlign = "left"; ctx.fillStyle = `${z.col}99`;
        ctx.fillText(z.name.split("·")[0].trim(), cx + 14, zy + 3);

        // Coherence ring
        if (isAct) {
          ctx.beginPath(); ctx.arc(cx, zy, 14, -Math.PI / 2, -Math.PI / 2 + z.coh * Math.PI * 2);
          ctx.strokeStyle = z.col; ctx.lineWidth = 2; ctx.stroke();
        }
      });

      // Global C label
      const globalC = ZONES.slice(0, 8).reduce((s, z) => s + z.coh, 0) / 8;
      ctx.font = `9px ${mono}`; ctx.textAlign = "center"; ctx.fillStyle = `${GOLD}80`;
      ctx.fillText(`C(x,t) = ${globalC.toFixed(3)}`, cx, H - 8);

      raf.current = requestAnimationFrame(draw);
    };
    raf.current = requestAnimationFrame(draw);
    return () => { cancelAnimationFrame(raf.current); };
  }, [activeZone, activePhase]);

  return (
    <canvas ref={cvs}
      style={{ width: 320, height: 520, display: "block", borderRadius: 8, border: `1px solid ${TEAL}20`, cursor: "pointer" }}
    />
  );
}

export default function BodyCoherenceScannerPage() {
  const [activeZone,  setActiveZone]  = useState(7);
  const [activePhase, setActivePhase] = useState(0);

  const zone  = ZONES.find(z => z.id === activeZone)!;
  const phase = PHASES.find(p => p.id === activePhase)!;
  const globalC = ZONES.slice(0, 8).reduce((s, z) => s + z.coh, 0) / 8;

  return (
    <div style={{ background: BG, minHeight: "100vh", fontFamily: body, color: TEXT }}>

      {/* Hero */}
      <div style={{ background: "linear-gradient(160deg,#03060e 0%,#030a12 60%,#020408 100%)",
        borderBottom: `1px solid ${TEAL}20`, padding: "50px 40px 30px", textAlign: "center" }}>
        <div style={{ fontFamily: mono, fontSize: 10, color: TEAL, letterSpacing: 4, marginBottom: 10 }}>
          AETHER · BODY COHERENCE SCANNER · 9 ZONES · 5 PHASES
        </div>
        <h1 style={{ fontFamily: serif, fontSize: 36, color: "#fff", margin: "0 0 10px", letterSpacing: 2 }}>
          AETHER Body Coherence Scanner
        </h1>
        <p style={{ fontFamily: body, fontSize: 16, color: DIM, maxWidth: 620, margin: "0 auto" }}>
          Nine coherence zones from bone marrow to whole-body field —
          each a different scale of hexiclical geometry expressing C(x,t) ≥ φ⁻¹.
        </p>
      </div>

      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "32px 24px" }}>

        {/* Main layout: left controls | center body | right metrics */}
        <div style={{ display: "grid", gridTemplateColumns: "220px 1fr 280px", gap: 20 }}>

          {/* LEFT — Navigation + Zone list */}
          <div>
            <div style={{ fontFamily: mono, fontSize: 9, color: GOLD, marginBottom: 10, letterSpacing: 2 }}>NAVIGATION PROTOCOL</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 5, marginBottom: 20 }}>
              {PHASES.map(p => (
                <button key={p.id}
                  onClick={() => setActivePhase(p.id)}
                  style={{ textAlign: "left", background: activePhase === p.id ? `${p.col}18` : "transparent",
                    border: `1px solid ${activePhase === p.id ? p.col : DIM + "30"}`,
                    borderRadius: 4, padding: "8px 10px", cursor: "pointer" }}>
                  <div style={{ fontFamily: mono, fontSize: 9, color: p.col }}>{p.name}</div>
                  <div style={{ fontFamily: mono, fontSize: 7, color: DIM }}>{p.range}</div>
                </button>
              ))}
            </div>

            <div style={{ fontFamily: mono, fontSize: 9, color: GOLD, marginBottom: 10, letterSpacing: 2 }}>COHERENCE ZONES</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
              {ZONES.slice(0, 8).map(z => (
                <button key={z.id}
                  onClick={() => setActiveZone(z.id)}
                  style={{ textAlign: "left", background: activeZone === z.id ? `${z.col}14` : "transparent",
                    border: `1px solid ${activeZone === z.id ? z.col : z.col + "25"}`,
                    borderRadius: 4, padding: "6px 8px", cursor: "pointer" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <span style={{ fontFamily: mono, fontSize: 8, color: z.col }}>{z.name}</span>
                    <span style={{ fontFamily: mono, fontSize: 8, color: z.coh >= PHI_INV ? GOLD : ROSE }}>
                      {z.coh.toFixed(3)}
                    </span>
                  </div>
                  <div style={{ height: 2, background: "#0D1F2D", borderRadius: 1, marginTop: 4, overflow: "hidden" }}>
                    <div style={{ height: "100%", width: `${z.coh * 100}%`, background: z.col, borderRadius: 1 }} />
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* CENTER — Body canvas */}
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 16 }}>
            {/* Phase description */}
            <div style={{ background: `${phase.col}08`, border: `1px solid ${phase.col}28`,
              borderRadius: 6, padding: "10px 14px", width: "100%", textAlign: "center" }}>
              <div style={{ fontFamily: mono, fontSize: 9, color: phase.col, marginBottom: 4 }}>
                PHASE: {phase.name} · {phase.range}
              </div>
              <div style={{ fontFamily: body, fontSize: 13, color: DIM }}>{phase.desc}</div>
            </div>

            <BodyCanvas activeZone={activeZone} activePhase={activePhase} onZoneClick={setActiveZone} />

            {/* Whole body field button */}
            <button onClick={() => setActiveZone(8)}
              style={{ fontFamily: mono, fontSize: 9, padding: "6px 16px", borderRadius: 4, cursor: "pointer",
                border: `1px solid ${activeZone === 8 ? "#F4EFE6" : DIM + "40"}`,
                background: activeZone === 8 ? "rgba(244,239,230,0.06)" : "transparent",
                color: activeZone === 8 ? "#F4EFE6" : DIM }}>
              Z8 · WHOLE BODY FIELD
            </button>
          </div>

          {/* RIGHT — Metrics + Resonance + Zone detail */}
          <div>
            {/* Global C */}
            <div style={{ textAlign: "center", border: `1px solid ${TEAL}28`, borderRadius: 6,
              padding: "12px 10px", marginBottom: 14 }}>
              <div style={{ fontFamily: mono, fontSize: 28, fontWeight: "bold",
                color: globalC >= PHI_INV ? GREEN : ROSE }}>
                {globalC.toFixed(3)}
              </div>
              <div style={{ fontFamily: mono, fontSize: 8, color: DIM, marginTop: 2 }}>GLOBAL C(x,t)</div>
              <div style={{ fontFamily: mono, fontSize: 8, color: `${DIM}80`, marginTop: 2 }}>φ⁻¹ threshold: 0.618</div>
            </div>

            {/* Zone meters */}
            <div style={{ fontFamily: mono, fontSize: 9, color: GOLD, marginBottom: 8, letterSpacing: 2 }}>ZONE METRICS — {zone.name}</div>
            {[
              { label: "HELIX PITCH", val: zone.pitch, col: TEAL },
              { label: "HEX PACKING", val: zone.hex, col: ACCENT },
              { label: "COHERENCE C(x,t)", val: zone.coh, col: GOLD },
              { label: "φ-RATIO LOCK", val: zone.phi, col: ROSE },
            ].map(m => (
              <div key={m.label} style={{ marginBottom: 8 }}>
                <div style={{ fontFamily: mono, fontSize: 7, color: DIM, marginBottom: 2 }}>{m.label}</div>
                <div style={{ height: 7, background: "#0D1F2D", borderRadius: 4, overflow: "hidden" }}>
                  <div style={{ height: "100%", width: `${m.val * 100}%`, background: m.col, borderRadius: 4, transition: "width 0.4s" }} />
                </div>
                <div style={{ fontFamily: mono, fontSize: 8, color: GOLD, textAlign: "right" }}>{m.val.toFixed(3)}</div>
              </div>
            ))}

            {/* Resonance chambers */}
            <div style={{ fontFamily: mono, fontSize: 9, color: GOLD, marginBottom: 8, letterSpacing: 2, marginTop: 14 }}>RESONANCE CHAMBERS</div>
            {RESONATORS.map(r => (
              <div key={r.name} style={{ display: "flex", gap: 10, alignItems: "center", marginBottom: 10 }}>
                <div style={{ width: 44, height: 44, flexShrink: 0 }}>
                  <svg viewBox="0 0 44 44" style={{ width: 44, height: 44 }}>
                    <circle cx="22" cy="22" r="18" fill="none" stroke={`${r.col}20`} strokeWidth="3" />
                    <circle cx="22" cy="22" r="18" fill="none" stroke={r.col} strokeWidth="3"
                      strokeDasharray={`${r.pct * 113.1} 113.1`}
                      strokeLinecap="round"
                      transform="rotate(-90 22 22)" />
                  </svg>
                </div>
                <div>
                  <div style={{ fontFamily: mono, fontSize: 9, color: r.col }}>{r.name}</div>
                  <div style={{ fontFamily: mono, fontSize: 8, color: GOLD }}>{r.freq}</div>
                  <div style={{ fontFamily: body, fontSize: 11, color: DIM }}>{r.note}</div>
                </div>
              </div>
            ))}

            {/* Zone detail card */}
            <div style={{ fontFamily: mono, fontSize: 9, color: GOLD, marginBottom: 8, letterSpacing: 2, marginTop: 14 }}>ZONE DETAIL</div>
            <div style={{ background: `${zone.col}08`, border: `1px solid ${zone.col}28`, borderRadius: 6, padding: "12px" }}>
              <div style={{ fontFamily: serif, fontSize: 14, color: zone.col, marginBottom: 6 }}>{zone.name}</div>
              <div style={{ fontFamily: mono, fontSize: 8, color: TEAL, marginBottom: 6 }}>{zone.eq}</div>
              <div style={{ fontFamily: body, fontSize: 12, color: TEXT, lineHeight: 1.6, marginBottom: 6 }}>{zone.desc}</div>
              <div style={{ fontFamily: mono, fontSize: 8, color: GOLD }}>AGENT: {zone.agent}</div>
            </div>
          </div>
        </div>

        {/* Equations section */}
        <div style={{ marginTop: 48 }}>
          <div style={{ fontFamily: mono, fontSize: 10, color: TEAL, letterSpacing: 3, marginBottom: 6 }}>MATHEMATICS</div>
          <h2 style={{ fontFamily: serif, fontSize: 24, color: "#fff", margin: "0 0 4px" }}>Hexiclical Geometry Stack</h2>
          <div style={{ fontFamily: body, fontSize: 14, color: DIM, marginBottom: 20 }}>
            Each zone is the same φ-structured geometry at a different scale — from quantum spin-foam to macroscopic body field
          </div>
          <div style={{ height: 1, background: `linear-gradient(90deg,${TEAL}60,transparent)`, marginBottom: 28 }} />
        </div>

        <pre style={{ fontFamily: mono, fontSize: 11, color: GOLD, background: "#030d18",
          border: `1px solid ${GOLD}28`, borderRadius: 6, padding: "14px 18px",
          margin: "0 0 28px", overflowX: "auto", whiteSpace: "pre-wrap" }}>{`BODY COHERENCE FIELD — HEXICLICAL STACK Z0→Z8:

Z0 · BONE MARROW    Ψ₀ = spin-foam · HCP mineral crystal · κ = 0.72
Z1 · DNA/NUCLEUS    B-DNA: 3.4 nm pitch · 10.5 bp/turn · κ = 0.82
Z2 · CYTOSKELETON   Microtubule: 13 protofilaments · actin 2.7 nm · κ = 0.86
Z3 · CELL MEMBRANE  Epithelial HCP: 74% packing · 6 neighbors · κ = 0.88
Z4 · FASCIA/COLLAGEN Collagen triple helix: 0.286 nm pitch · κ = 0.84
Z5 · PERIPHERAL NS  Fascicle helix · myelin lamellae HCP · κ = 0.90
Z6 · HEART/VISCERA  Counter-rotating myocardial helical layers · κ = 0.90
Z7 · NEOCORTEX      6-layer hexiclical column · 60° transforms · κ = 0.94
Z8 · WHOLE FIELD    C(x,t) ≥ φ⁻¹ · G₂ · SU(2)×[D₆⋊U(1)]⁷ · κ = 0.97

GLOBAL COHERENCE:
  C_global(t) = (1/8) Σᵢ C_zone_i(t)
  Threshold: C ≥ φ⁻¹ ≈ 0.618  →  coherent / load-bearing / phase-locked

RESONANCE CHAMBERS:
  Cranial: ~28 Hz (gamma · consciousness)
  Thoracic: ~0.1–2 Hz (cardiac-respiratory coupling)
  Pelvic: ~0.06–1.2 Hz (visceral-ground)

NAVIGATION PHASES:
  0: Triage        (9→8) Whole-body survey
  1: Stabilization (7→6) Organ-level restoration
  2: Navigation    (5→4) Neural coherence
  3: Integration   (3→2) Cellular cytoskeletal
  4: Monitoring    (1→0) Molecular quantum baseline`}</pre>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 10, marginBottom: 28 }}>
          {ZONES.slice(0, 8).filter((_, i) => i % 3 !== 2 || i < 6).slice(0, 6).map(z => (
            <div key={z.id}
              onClick={() => setActiveZone(z.id)}
              style={{ background: `${z.col}07`, border: `1px solid ${z.col}25`, borderRadius: 8,
                padding: "12px 14px", cursor: "pointer",
                opacity: activeZone === z.id ? 1 : 0.7 }}>
              <div style={{ fontFamily: mono, fontSize: 9, color: z.col, marginBottom: 5 }}>{z.name}</div>
              <div style={{ fontFamily: mono, fontSize: 7, color: DIM, marginBottom: 6 }}>{z.eq}</div>
              <div style={{ fontFamily: body, fontSize: 12, color: TEXT, lineHeight: 1.5 }}>{z.desc.slice(0, 90)}…</div>
            </div>
          ))}
        </div>

        <div style={{ marginTop: 32, padding: "20px 24px", background: "#ffffff04",
          border: `1px solid ${TEAL}18`, borderRadius: 10, textAlign: "center" }}>
          <div style={{ fontFamily: serif, fontSize: 15, color: TEAL, marginBottom: 8 }}>
            THE ONE ATOM — SAME GEOMETRY FROM QUARKS TO WHOLE BODY
          </div>
          <div style={{ fontFamily: body, fontSize: 14, color: DIM, lineHeight: 1.7 }}>
            Every zone (Z0–Z8) is the same φ-structured hexiclical geometry at a different scale.
            The body is not a collection of different systems — it is one fractal coherence field
            expressing C(x,t) ≥ φ⁻¹ across nine orders of magnitude.
          </div>
          <div style={{ fontFamily: mono, fontSize: 9, color: `${DIM}80`, marginTop: 10 }}>
            AETHER Body Scanner · Shia Miller @StrategicProce · 2026
          </div>
        </div>
      </div>
    </div>
  );
}
