import { useEffect, useRef, useState } from "react";

/*─────────────────────────────────────────────────────────────────────────────
  Solar Quantum Loop · Knotted Human Mechanics
  Looping with different energy and context — quantum knotted biology
  rooted at the sun.
─────────────────────────────────────────────────────────────────────────────*/

const BG    = "#060408";
const PANEL = "#0c0910";
const IVORY = "#f0eae0";
const DIM   = "rgba(240,234,224,0.5)";
const MUTED = "rgba(240,234,224,0.25)";
const GOLD  = "#f5c84c";
const AMBER = "#fb923c";
const CYAN  = "#22d3ee";
const VIOLET= "#a78bfa";
const ROSE  = "#fb7185";
const TEAL  = "#2dd4bf";
const GREEN = "#4ade80";
const BLUE  = "#60a5fa";
const LINE  = "rgba(245,200,76,0.09)";

function Tag({ t, c = GOLD }: { t: string; c?: string }) {
  return (
    <span style={{ display:"inline-block", background:`${c}18`, border:`1px solid ${c}44`,
      borderRadius:4, padding:"2px 8px", fontSize:11, color:c, fontFamily:"'DM Mono',monospace",
      letterSpacing:"0.06em", margin:"0 4px 4px 0" }}>
      {t}
    </span>
  );
}
function Divider() {
  return <div style={{ height:1, background:LINE, margin:"44px 0" }} />;
}

// ── CANVAS I: Solar Quantum Loop Engine ──────────────────────────────────────
// Solar photon enters → drives a coherence loop that mutates its energy+context
// each cycle. The loop path is topologically knotted (trefoil braid closure).

interface LoopParticle {
  t: number;       // position along loop [0,1)
  speed: number;   // base speed
  phase: number;   // personal phase offset
  ctx: number;     // which energy context (0-3)
  born: number;    // timestamp
}

const CTX_COLORS = [GOLD, CYAN, VIOLET, ROSE];
const CTX_LABELS = ["Solar · Photonic", "Thermal · Kinetic", "Chemical · Binding", "Quantum · Tunneling"];

// Trefoil knot parametric projection: (cos t + 2cos 2t, sin t - 2sin 2t)
function trefoilXY(t: number, cx: number, cy: number, r: number): [number, number] {
  const a = t * Math.PI * 2;
  const x = cx + r * (Math.cos(a) + 2 * Math.cos(2 * a));
  const y = cy + r * (Math.sin(a) - 2 * Math.sin(2 * a));
  return [x, y];
}

export function SolarLoopCanvas() {
  const cvs = useRef<HTMLCanvasElement>(null);
  const particles = useRef<LoopParticle[]>([]);
  const raf = useRef(0);
  const start = useRef(Date.now());

  useEffect(() => {
    // Seed 24 loop particles
    particles.current = Array.from({ length: 24 }, (_, i) => ({
      t: i / 24,
      speed: 0.0018 + Math.random() * 0.0012,
      phase: Math.random() * Math.PI * 2,
      ctx: i % 4,
      born: 0,
    }));

    const draw = () => {
      const c = cvs.current;
      if (!c) return;
      const ctx = c.getContext("2d")!;
      const W = c.width; const H = c.height;
      const cx = W * 0.5; const cy = H * 0.52;
      const r = Math.min(W, H) * 0.165;
      const now = (Date.now() - start.current) / 1000;

      ctx.fillStyle = PANEL;
      ctx.fillRect(0, 0, W, H);

      // Draw trefoil knot path (faint, multi-color)
      const steps = 400;
      for (let s = 0; s < steps; s++) {
        const t0 = s / steps;
        const t1 = (s + 1) / steps;
        const [x0, y0] = trefoilXY(t0, cx, cy, r);
        const [x1, y1] = trefoilXY(t1, cx, cy, r);
        const hue = (s / steps) * 360;
        ctx.beginPath();
        ctx.moveTo(x0, y0);
        ctx.lineTo(x1, y1);
        ctx.strokeStyle = `hsla(${hue}, 70%, 55%, 0.18)`;
        ctx.lineWidth = 1.8;
        ctx.stroke();
      }

      // Sun corona — top-left
      const sx = W * 0.12; const sy = H * 0.15;
      const pulse = 1 + 0.08 * Math.sin(now * 2.1);
      for (let ring = 3; ring >= 0; ring--) {
        const rr = (18 + ring * 9) * pulse;
        const alpha = 0.06 + (3 - ring) * 0.05;
        ctx.beginPath();
        ctx.arc(sx, sy, rr, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(245,200,76,${alpha})`;
        ctx.lineWidth = ring === 0 ? 2 : 1;
        ctx.stroke();
      }
      ctx.beginPath();
      ctx.arc(sx, sy, 13 * pulse, 0, Math.PI * 2);
      ctx.fillStyle = GOLD;
      ctx.fill();
      // Label
      ctx.fillStyle = GOLD;
      ctx.font = "bold 10px 'DM Mono', monospace";
      ctx.fillText("SUN", sx - 12, sy + 26);

      // Photon beam from sun to knot entry
      const [entryX, entryY] = trefoilXY(0, cx, cy, r);
      const beamAlpha = 0.5 + 0.3 * Math.sin(now * 3);
      ctx.beginPath();
      ctx.moveTo(sx + 14, sy + 5);
      ctx.lineTo(entryX, entryY);
      ctx.setLineDash([5, 4]);
      ctx.strokeStyle = `rgba(245,200,76,${beamAlpha})`;
      ctx.lineWidth = 1.5;
      ctx.stroke();
      ctx.setLineDash([]);
      // Arrow at entry
      ctx.beginPath();
      ctx.arc(entryX, entryY, 5, 0, Math.PI * 2);
      ctx.fillStyle = GOLD;
      ctx.fill();

      // Advance and draw particles
      particles.current.forEach((p) => {
        p.t = (p.t + p.speed) % 1;
        // Context switches on each loop completion — different energy each pass
        if (p.t < p.speed) {
          p.ctx = (p.ctx + 1) % 4;
          p.phase += 0.4 + Math.random() * 0.8;
        }
        const [px, py] = trefoilXY(p.t, cx, cy, r);
        const col = CTX_COLORS[p.ctx];
        const glow = ctx.createRadialGradient(px, py, 0, px, py, 8);
        glow.addColorStop(0, col);
        glow.addColorStop(1, `${col}00`);
        ctx.beginPath();
        ctx.arc(px, py, 5 + 2 * Math.sin(now * 4 + p.phase), 0, Math.PI * 2);
        ctx.fillStyle = glow;
        ctx.fill();
      });

      // Context legend
      CTX_COLORS.forEach((col, i) => {
        const lx = W * 0.06; const ly = H * 0.72 + i * 20;
        ctx.beginPath();
        ctx.arc(lx, ly, 5, 0, Math.PI * 2);
        ctx.fillStyle = col;
        ctx.fill();
        ctx.fillStyle = IVORY;
        ctx.font = "10px 'DM Mono', monospace";
        ctx.fillText(CTX_LABELS[i], lx + 10, ly + 4);
      });

      // Readout: loop count
      const loopCount = Math.floor(now * 2.4);
      ctx.fillStyle = `rgba(245,200,76,0.6)`;
      ctx.font = "11px 'DM Mono', monospace";
      ctx.fillText(`LOOPS : ${loopCount}`, W - 110, H - 18);
      ctx.fillText(`CONTEXT SWITCHES : ${loopCount * 4}`, W - 200, H - 6);

      raf.current = requestAnimationFrame(draw);
    };
    raf.current = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(raf.current);
  }, []);

  return (
    <div style={{ background: PANEL, borderRadius: 10, border: `1px solid rgba(245,200,76,0.14)`, overflow: "hidden" }}>
      <div style={{ padding: "0.7rem 1rem 0.4rem", display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: `1px solid rgba(255,255,255,0.05)` }}>
        <span style={{ fontSize: 11, letterSpacing: "0.2em", color: GOLD, fontFamily: "'DM Mono',monospace", textTransform: "uppercase" }}>
          ◎ Solar Quantum Loop Engine · Trefoil Knot Path
        </span>
        <span style={{ fontSize: 10, color: MUTED, fontFamily: "'DM Mono',monospace" }}>24 photon-particles · 4 energy contexts</span>
      </div>
      <canvas ref={cvs} width={820} height={360} style={{ display: "block", width: "100%", height: "auto" }} />
    </div>
  );
}

// ── CANVAS II: Quantum Knot State Machine ────────────────────────────────────
// The same knotted topology carries different information depending on quantum
// phase / energy context. Four states cycle: Photonic → Thermal → Chemical → Tunneling

interface KnotState {
  label: string;
  color: string;
  desc: string;
  winding: number; // extra angular speed modifier
}

const KNOT_STATES: KnotState[] = [
  { label: "PHOTONIC",  color: GOLD,   desc: "Solar photon absorption — 11-cis retinal isomerises, coherence spike", winding: 1.0 },
  { label: "THERMAL",   color: AMBER,  desc: "Thermal phonon bath — knot loosens, conformational entropy peaks",     winding: 1.4 },
  { label: "CHEMICAL",  color: TEAL,   desc: "ATP hydrolysis — topoisomerase clamps, crossing number shifts +1",     winding: 0.7 },
  { label: "TUNNELING", color: VIOLET, desc: "Quantum tunneling — electron jumps crossing, knot invariant flips",    winding: 1.8 },
];

export function KnotStateMachineCanvas() {
  const cvs = useRef<HTMLCanvasElement>(null);
  const raf = useRef(0);
  const stateIdx = useRef(0);
  const stateT = useRef(0);  // 0→1 within current state
  const morphT = useRef(0);  // 0→1 crossing morph
  const [liveState, setLiveState] = useState(0);

  useEffect(() => {
    const STATE_DUR = 3.5; // seconds per state
    let last = performance.now();

    const draw = (ts: number) => {
      const dt = Math.min((ts - last) / 1000, 0.05);
      last = ts;
      const c = cvs.current;
      if (!c) return;
      const ctx = c.getContext("2d")!;
      const W = c.width; const H = c.height;
      const cx = W * 0.5; const cy = H * 0.52;

      stateT.current += dt / STATE_DUR;
      if (stateT.current >= 1) {
        stateT.current -= 1;
        stateIdx.current = (stateIdx.current + 1) % 4;
        setLiveState(stateIdx.current);
      }

      const st = KNOT_STATES[stateIdx.current];
      const col = st.color;
      const t = stateT.current;
      // crossing morph: at mid-state, one crossing flips
      morphT.current = t < 0.5 ? t * 2 : 1 - (t - 0.5) * 2;

      ctx.fillStyle = PANEL;
      ctx.fillRect(0, 0, W, H);

      const r = Math.min(W, H) * 0.19;
      const wind = st.winding;

      // Draw knot path — vary parameter path by state
      const steps = 600;
      ctx.lineWidth = 2.2;
      for (let s = 0; s < steps; s++) {
        const a0 = (s / steps) * Math.PI * 2;
        const a1 = ((s + 1) / steps) * Math.PI * 2;
        // Trefoil with crossing morph: smooth perturbation at crossings
        const perturbStrength = 0.18 * morphT.current;
        const p0 = (s / steps);
        const perturb = perturbStrength * Math.sin(p0 * Math.PI * 6);
        const rr = r * (1 + perturb);
        const x0 = cx + rr * (Math.cos(a0) + 2 * Math.cos(2 * a0));
        const y0 = cy + rr * (Math.sin(a0) - 2 * Math.sin(2 * a0));
        const rr1 = r * (1 + perturbStrength * Math.sin(((s + 1) / steps) * Math.PI * 6));
        const x1 = cx + rr1 * (Math.cos(a1) + 2 * Math.cos(2 * a1));
        const y1 = cy + rr1 * (Math.sin(a1) - 2 * Math.sin(2 * a1));
        const alpha = 0.22 + 0.55 * Math.abs(Math.sin(p0 * Math.PI));
        ctx.beginPath();
        ctx.moveTo(x0, y0);
        ctx.lineTo(x1, y1);
        ctx.strokeStyle = `${col}${Math.floor(alpha * 255).toString(16).padStart(2, "0")}`;
        ctx.stroke();
      }

      // Glow center
      const glowR = 30 + 10 * morphT.current;
      const g = ctx.createRadialGradient(cx, cy, 0, cx, cy, glowR);
      g.addColorStop(0, `${col}30`);
      g.addColorStop(1, `${col}00`);
      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.arc(cx, cy, glowR, 0, Math.PI * 2);
      ctx.fill();

      // State label
      ctx.fillStyle = col;
      ctx.font = `bold 13px 'DM Mono', monospace`;
      ctx.textAlign = "center";
      ctx.fillText(`CONTEXT : ${st.label}`, cx, H * 0.12);

      // Progress bar
      const barW = 200; const barX = cx - barW / 2; const barY = H * 0.17;
      ctx.fillStyle = `rgba(255,255,255,0.07)`;
      ctx.fillRect(barX, barY, barW, 4);
      ctx.fillStyle = col;
      ctx.fillRect(barX, barY, barW * t, 4);

      // Crossing annotation
      ctx.fillStyle = `rgba(255,255,255,0.45)`;
      ctx.font = "10px 'DM Mono', monospace";
      ctx.textAlign = "center";
      ctx.fillText(`Alexander polynomial: Δ(t) = −t + 3 − t⁻¹  ·  crossing morph ${Math.round(morphT.current * 100)}%`, cx, H - 18);
      ctx.fillText(`State ${stateIdx.current + 1} / 4  ·  topology invariant ${stateIdx.current % 2 === 0 ? "σ = +2" : "σ = −2"}`, cx, H - 6);
      ctx.textAlign = "left";

      raf.current = requestAnimationFrame(draw);
    };
    raf.current = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(raf.current);
  }, []);

  return (
    <div style={{ background: PANEL, borderRadius: 10, border: `1px solid rgba(167,139,250,0.16)`, overflow: "hidden" }}>
      <div style={{ padding: "0.7rem 1rem 0.4rem", display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: `1px solid rgba(255,255,255,0.05)` }}>
        <span style={{ fontSize: 11, letterSpacing: "0.2em", color: VIOLET, fontFamily: "'DM Mono',monospace", textTransform: "uppercase" }}>
          ⌀ Quantum Knot State Machine · 4-Context Cycle
        </span>
        <span style={{ fontSize: 10, color: MUTED, fontFamily: "'DM Mono',monospace" }}>
          {KNOT_STATES[liveState].desc}
        </span>
      </div>
      <canvas ref={cvs} width={820} height={340} style={{ display: "block", width: "100%", height: "auto" }} />
    </div>
  );
}

// ── CANVAS III: Human Body · Knotted Solar Field ─────────────────────────────
// The human body as a column of knotted quantum channels — each organ/zone
// has a loop of different energy context, all rooted at the solar crown.

interface BodyZone {
  label: string;
  y: number;    // fractional y in canvas
  color: string;
  ctx: string;
  freq: number; // loop oscillation frequency
}

const BODY_ZONES: BodyZone[] = [
  { label: "CROWN · Solar Root",    y: 0.10, color: GOLD,   ctx: "Photonic · 11-cis retinal", freq: 7.83  },
  { label: "BROW · GPCR Field",     y: 0.22, color: VIOLET, ctx: "Photoreceptor cascade",     freq: 14.3  },
  { label: "THROAT · Phonon Wave",  y: 0.34, color: CYAN,   ctx: "Acoustic coherence",        freq: 20.8  },
  { label: "HEART · EM Torus",      y: 0.46, color: ROSE,   ctx: "Electromagnetic knotting",  freq: 0.8   },
  { label: "SOLAR · ATP Engine",    y: 0.58, color: AMBER,  ctx: "Chemical binding loop",     freq: 3.2   },
  { label: "SACRAL · EZ Water",     y: 0.70, color: TEAL,   ctx: "Proton gradient tunnel",    freq: 1.4   },
  { label: "ROOT · Magnetite",      y: 0.82, color: GREEN,  ctx: "Quantum compass — Fe₃O₄",   freq: 0.33  },
];

export function HumanKnotFieldCanvas() {
  const cvs = useRef<HTMLCanvasElement>(null);
  const raf = useRef(0);
  const start = useRef(Date.now());

  useEffect(() => {
    const draw = () => {
      const c = cvs.current;
      if (!c) return;
      const ctx = c.getContext("2d")!;
      const W = c.width; const H = c.height;
      const now = (Date.now() - start.current) / 1000;

      ctx.fillStyle = PANEL;
      ctx.fillRect(0, 0, W, H);

      // Central spine column
      const spineX = W * 0.42;
      const spineGrad = ctx.createLinearGradient(spineX, H * 0.05, spineX, H * 0.9);
      spineGrad.addColorStop(0, `${GOLD}88`);
      spineGrad.addColorStop(0.5, `${VIOLET}44`);
      spineGrad.addColorStop(1, `${GREEN}55`);
      ctx.beginPath();
      ctx.moveTo(spineX, H * 0.05);
      ctx.lineTo(spineX, H * 0.92);
      ctx.strokeStyle = spineGrad;
      ctx.lineWidth = 2.5;
      ctx.setLineDash([6, 3]);
      ctx.stroke();
      ctx.setLineDash([]);

      // Solar source at top
      const sunX = spineX; const sunY = H * 0.04;
      const sp = 1 + 0.1 * Math.sin(now * 2.2);
      const sg = ctx.createRadialGradient(sunX, sunY, 0, sunX, sunY, 24 * sp);
      sg.addColorStop(0, GOLD);
      sg.addColorStop(0.5, `${GOLD}66`);
      sg.addColorStop(1, `${GOLD}00`);
      ctx.beginPath();
      ctx.arc(sunX, sunY, 18 * sp, 0, Math.PI * 2);
      ctx.fillStyle = sg;
      ctx.fill();
      ctx.beginPath();
      ctx.arc(sunX, sunY, 9, 0, Math.PI * 2);
      ctx.fillStyle = GOLD;
      ctx.fill();

      // Each body zone: left loop + knot node + right label
      BODY_ZONES.forEach((zone) => {
        const zy = H * zone.y;
        const loopR = 32 + 8 * Math.sin(now * zone.freq * 0.5);
        const loopX = spineX - loopR - 8;
        const loopPhase = now * zone.freq * 0.3;

        // Draw mini trefoil loop on left
        ctx.save();
        ctx.translate(loopX, zy);
        const ls = loopR * 0.28;
        const lSteps = 80;
        ctx.beginPath();
        for (let s = 0; s <= lSteps; s++) {
          const a = (s / lSteps) * Math.PI * 2 + loopPhase;
          const lx = ls * (Math.cos(a) + 2 * Math.cos(2 * a));
          const ly = ls * (Math.sin(a) - 2 * Math.sin(2 * a)) * 0.5;
          s === 0 ? ctx.moveTo(lx, ly) : ctx.lineTo(lx, ly);
        }
        const loopAlpha = 0.55 + 0.35 * Math.sin(now * zone.freq);
        ctx.strokeStyle = `${zone.color}${Math.floor(loopAlpha * 255).toString(16).padStart(2, "0")}`;
        ctx.lineWidth = 1.6;
        ctx.stroke();
        ctx.restore();

        // Connecting line to spine
        ctx.beginPath();
        ctx.moveTo(loopX + ls * 0.6, zy);
        ctx.lineTo(spineX, zy);
        ctx.strokeStyle = `${zone.color}33`;
        ctx.lineWidth = 1;
        ctx.stroke();

        // Spine node
        const nodePulse = 1 + 0.2 * Math.sin(now * zone.freq + 1);
        const ng = ctx.createRadialGradient(spineX, zy, 0, spineX, zy, 10 * nodePulse);
        ng.addColorStop(0, zone.color);
        ng.addColorStop(1, `${zone.color}00`);
        ctx.beginPath();
        ctx.arc(spineX, zy, 7 * nodePulse, 0, Math.PI * 2);
        ctx.fillStyle = ng;
        ctx.fill();
        ctx.beginPath();
        ctx.arc(spineX, zy, 4, 0, Math.PI * 2);
        ctx.fillStyle = zone.color;
        ctx.fill();

        // Right: label + context
        const labelX = spineX + 18;
        ctx.fillStyle = zone.color;
        ctx.font = `bold 10px 'DM Mono', monospace`;
        ctx.fillText(zone.label, labelX, zy - 4);
        ctx.fillStyle = `rgba(240,234,224,0.42)`;
        ctx.font = `9px 'DM Mono', monospace`;
        ctx.fillText(zone.ctx, labelX, zy + 8);
        ctx.fillStyle = `${zone.color}66`;
        ctx.fillText(`${zone.freq} Hz`, labelX, zy + 19);
      });

      // Solar energy flow particles down spine
      for (let i = 0; i < 6; i++) {
        const ft = ((now * 0.35 + i / 6) % 1);
        const fy = H * (0.05 + ft * 0.87);
        const fc = `hsl(${45 + ft * 210}, 80%, 60%)`;
        ctx.beginPath();
        ctx.arc(spineX, fy, 2.5, 0, Math.PI * 2);
        ctx.fillStyle = fc;
        ctx.fill();
      }

      // Grounding arrow at bottom
      ctx.beginPath();
      ctx.moveTo(spineX, H * 0.92);
      ctx.lineTo(spineX, H * 0.97);
      ctx.strokeStyle = `${GREEN}66`;
      ctx.lineWidth = 2;
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(spineX - 5, H * 0.95);
      ctx.lineTo(spineX, H * 0.975);
      ctx.lineTo(spineX + 5, H * 0.95);
      ctx.strokeStyle = GREEN;
      ctx.lineWidth = 1.5;
      ctx.stroke();
      ctx.fillStyle = `${GREEN}88`;
      ctx.font = "9px 'DM Mono', monospace";
      ctx.textAlign = "center";
      ctx.fillText("GROUND · Earth Field", spineX, H * 0.985);
      ctx.textAlign = "left";

      raf.current = requestAnimationFrame(draw);
    };
    raf.current = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(raf.current);
  }, []);

  return (
    <div style={{ background: PANEL, borderRadius: 10, border: `1px solid rgba(34,211,238,0.14)`, overflow: "hidden" }}>
      <div style={{ padding: "0.7rem 1rem 0.4rem", borderBottom: `1px solid rgba(255,255,255,0.05)` }}>
        <span style={{ fontSize: 11, letterSpacing: "0.2em", color: CYAN, fontFamily: "'DM Mono',monospace", textTransform: "uppercase" }}>
          ☀ Human Body · Knotted Solar Field Channels · 7 Zones
        </span>
      </div>
      <canvas ref={cvs} width={820} height={500} style={{ display: "block", width: "100%", height: "auto" }} />
    </div>
  );
}

// ── Equation cards ────────────────────────────────────────────────────────────
interface EqCard { label: string; eq: string; desc: string; color: string; }
const EQ_CARDS: EqCard[] = [
  { label: "Quantum Loop Coherence",  eq: "C_loop(n) = C₀ · e^{−κ·n} · cos(φₙ + Δφ)",          color: GOLD,   desc: "Each loop pass n applies a phase shift Δφ — same topology, different energy context" },
  { label: "Trefoil Knot Invariant",  eq: "V(3₁) = −t⁻⁴ + t⁻³ + t⁻¹",                          color: VIOLET, desc: "Jones polynomial for the trefoil — preserved across all 4 energy context states" },
  { label: "Solar Coupling Rate",     eq: "k_solar = σ_GPCR · Φ_sun · η_retinal",                color: AMBER,  desc: "GPCR cross-section × solar photon flux × rhodopsin quantum yield (η ≈ 0.67)" },
  { label: "Knot Crossing Energy",    eq: "ΔE_cross = ℏω · |⟨ψ_over|ψ_under⟩|²",                color: CYAN,   desc: "Energy cost of switching over/under crossing — drives quantum tunneling context" },
  { label: "Topoisomerase Torque",    eq: "τ_topo = −∂G/∂Lk  where  Lk = Tw + Wr",              color: TEAL,   desc: "Linking number Lk splits into twist Tw and writhe Wr — topoisomerase relaxes Wr" },
  { label: "Loop Context Entropy",    eq: "S_ctx = −k_B Σᵢ pᵢ log pᵢ  (4 contexts)",            color: ROSE,   desc: "Shannon-Boltzmann entropy of context distribution — maximised when all 4 equally likely" },
  { label: "Solar Root Frequency",    eq: "f_Schumann = c / (2π · R_Earth) ≈ 7.83 Hz",          color: GOLD,   desc: "Earth cavity resonance — the clock rate of the crown solar-knot loop channel" },
  { label: "Quantum Knot Tunnel",     eq: "Γ_tunnel = ω₀ · exp(−2∫√{2m(V−E)} dx / ℏ)",         color: VIOLET, desc: "Gamow factor for electron tunneling through a crossing barrier — sets context switch rate" },
];

// ── Verbal cards ──────────────────────────────────────────────────────────────
interface VCard { title: string; body: string; color: string; }
const V_CARDS: VCard[] = [
  { title: "Looping Is Not Repeating",        color: GOLD,   body: "Each pass through the knot path deposits a different energy context onto the topology — the invariant (Jones polynomial) stays the same but the information carried changes. Same road, different passenger." },
  { title: "The Knot Is the Memory",          color: VIOLET, body: "Topology preserves what content cannot. A trefoil knot in a protein or DNA strand cannot be thermally erased — it is a topological memory of the crossing sequence, independent of substrate temperature." },
  { title: "Solar Is the Root Clock",         color: AMBER,  body: "The 7.83 Hz Schumann resonance is Earth's cavity response to solar-UV discharge. Every biological quantum loop is phase-locked to this frequency at the crown zone — the sun is not a metaphor, it is the oscillator." },
  { title: "Four Contexts, One Topology",     color: CYAN,   body: "Photonic, thermal, chemical, and tunneling are four quantum descriptions of the same underlying knot state. The topology doesn't change — but what it means to the receiving cell changes completely each loop." },
  { title: "Rotted At the Sun Means Rooted",  color: ROSE,   body: "The phrase 'rotted at within the sun' names a physical truth: the human quantum field decays back toward solar coherence at its base frequency. Not destruction — return. The root channel is always solar." },
  { title: "Different Energy, Same Self",     color: TEAL,   body: "The Jones polynomial V(3₁) is the same whether the knot carries photonic or tunneling energy. This is the mathematical statement of personal identity through transformation — invariant across all contexts." },
];

// ── Main page ─────────────────────────────────────────────────────────────────
export default function SolarQuantumLoop() {
  return (
    <div style={{ background: BG, minHeight: "100vh", color: IVORY, fontFamily: "'DM Sans', sans-serif" }}>
      <div style={{ maxWidth: 900, margin: "0 auto", padding: "2.5rem 1.5rem 4rem" }}>

        {/* Header */}
        <div style={{ marginBottom: "2.4rem" }}>
          <div style={{ fontSize: 10, letterSpacing: "0.38em", color: GOLD, fontFamily: "'DM Mono',monospace", textTransform: "uppercase", marginBottom: 10, opacity: 0.8 }}>
            AETHER · Quantum Biology · Solar Mechanics
          </div>
          <h1 style={{ margin: "0 0 0.6rem", fontSize: "clamp(2rem,5vw,3.4rem)", fontWeight: 800, letterSpacing: "-0.03em", lineHeight: 1.1 }}>
            Solar Quantum Loop
          </h1>
          <h2 style={{ margin: "0 0 1rem", fontSize: "clamp(1rem,2.5vw,1.4rem)", fontWeight: 400, color: DIM, letterSpacing: "-0.01em" }}>
            Knotted Human Mechanics · Rooted at the Sun
          </h2>
          <p style={{ color: DIM, fontSize: "0.97rem", lineHeight: 1.7, maxWidth: 720, margin: "0 0 1.2rem" }}>
            Looping with different energy and context — quantum knotted biological mechanics are not repeating cycles but topological loops that carry a different energy context on each pass. The knot invariant stays fixed; the information riding it transforms. And every loop is rooted at the solar frequency.
          </p>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
            <Tag t="Trefoil Knot 3₁" /><Tag t="Jones Polynomial" /><Tag t="4 Energy Contexts" c={CYAN} />
            <Tag t="Topoisomerase Lk=Tw+Wr" c={TEAL} /><Tag t="Solar Root 7.83 Hz" c={AMBER} />
            <Tag t="Quantum Tunneling" c={VIOLET} /><Tag t="GPCR Photon Coupling" c={ROSE} />
            <Tag t="Schumann Resonance" /><Tag t="EZ Water Proton" c={TEAL} /><Tag t="Magnetite Fe₃O₄" c={GREEN} />
          </div>
        </div>

        {/* Canvas I */}
        <SolarLoopCanvas />
        <p style={{ color: MUTED, fontSize: "0.82rem", margin: "0.6rem 0 0", fontFamily: "'DM Mono',monospace" }}>
          24 photon-particles trace the trefoil knot path. Each time a particle completes a loop it switches to a new energy context — colour codes the context. The solar corona (top-left) continuously injects new particles via the gold beam to the knot entry point.
        </p>

        <Divider />

        {/* Canvas II */}
        <KnotStateMachineCanvas />
        <p style={{ color: MUTED, fontSize: "0.82rem", margin: "0.6rem 0 0", fontFamily: "'DM Mono',monospace" }}>
          The trefoil knot morphs between four quantum energy contexts every 3.5 seconds. The topology (Alexander polynomial Δ(t) = −t + 3 − t⁻¹) is invariant — the crossing morph shows the physical deformation at each context switch. Signature σ alternates ±2 between states.
        </p>

        <Divider />

        {/* Canvas III */}
        <HumanKnotFieldCanvas />
        <p style={{ color: MUTED, fontSize: "0.82rem", margin: "0.6rem 0 0", fontFamily: "'DM Mono',monospace" }}>
          Seven body zones each host a mini trefoil quantum loop oscillating at a zone-specific frequency. Solar energy flows down the central spine column, colour-shifting from gold (photonic crown) to green (magnetite root). Each zone animates at its own biological frequency.
        </p>

        <Divider />

        {/* Equation cards */}
        <div style={{ marginBottom: "0.5rem" }}>
          <div style={{ fontSize: 10, letterSpacing: "0.32em", color: GOLD, fontFamily: "'DM Mono',monospace", textTransform: "uppercase", marginBottom: "1.2rem", opacity: 0.7 }}>
            Governing Equations
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(390px,1fr))", gap: 12 }}>
            {EQ_CARDS.map((e) => (
              <div key={e.label} style={{ background: PANEL, border: `1px solid ${e.color}22`, borderLeft: `3px solid ${e.color}`, borderRadius: 8, padding: "0.9rem 1rem" }}>
                <div style={{ fontSize: "0.75rem", color: e.color, fontFamily: "'DM Mono',monospace", letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 6 }}>{e.label}</div>
                <div style={{ fontFamily: "'DM Mono',monospace", fontSize: "0.9rem", color: IVORY, marginBottom: 6, whiteSpace: "pre-wrap" }}>{e.eq}</div>
                <div style={{ fontSize: "0.82rem", color: MUTED, lineHeight: 1.55 }}>{e.desc}</div>
              </div>
            ))}
          </div>
        </div>

        <Divider />

        {/* Verbal cards */}
        <div>
          <div style={{ fontSize: 10, letterSpacing: "0.32em", color: GOLD, fontFamily: "'DM Mono',monospace", textTransform: "uppercase", marginBottom: "1.2rem", opacity: 0.7 }}>
            AETHER Synthesis
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(380px,1fr))", gap: 12 }}>
            {V_CARDS.map((v) => (
              <div key={v.title} style={{ background: PANEL, border: `1px solid ${v.color}1a`, borderLeft: `3px solid ${v.color}`, borderRadius: 8, padding: "1rem 1.1rem" }}>
                <div style={{ fontSize: "0.88rem", fontWeight: 700, color: v.color, marginBottom: 8 }}>{v.title}</div>
                <div style={{ fontSize: "0.87rem", color: DIM, lineHeight: 1.65 }}>{v.body}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Footer links */}
        <div style={{ marginTop: "3rem", paddingTop: "1.2rem", borderTop: `1px solid ${LINE}`, display: "flex", gap: 24, flexWrap: "wrap" }}>
          {[
            ["→ Nutritional DNA Key", "/nutritional-dna-key"],
            ["→ Solar Neural Interface", "/solar-neural-interface"],
            ["→ Schumann Neural Fields", "/schumann-neural-fields"],
            ["→ AETHER Engine", "/aether-engine"],
          ].map(([label, href]) => (
            <a key={href} href={href} style={{ color: GOLD, fontSize: "0.84rem", textDecoration: "none", opacity: 0.65 }}>{label}</a>
          ))}
        </div>

      </div>
    </div>
  );
}
