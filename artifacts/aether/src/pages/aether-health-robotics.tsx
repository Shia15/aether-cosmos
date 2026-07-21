import { useEffect, useRef, useState, useCallback } from "react";

/* ─── Palette ──────────────────────────────────────────────────────── */
const P = {
  bg: "#030608",
  panel: "rgba(6,12,22,0.80)",
  border: "rgba(60,200,180,0.10)",
  gold: "#F5C84C",
  cyan: "#34D1BF",
  blue: "#4D9EFF",
  violet: "#9B7CF8",
  rose: "#F06080",
  green: "#4ADE80",
  orange: "#FB923C",
  white: "#E8F4F2",
  muted: "#3A5060",
  dim: "#0C1820",
};

/* ─── Module-level interfaces (Babel-safe) ──────────────────────────── */
interface NanoBot {
  x: number; y: number;
  vx: number; vy: number;
  target: number; energy: number; id: number;
}
interface CancerCell {
  x: number; y: number;
  r: number; hp: number; maxHp: number;
  phase: number; respawnIn: number;
}
interface BodyZone {
  label: string; x: number; y: number;
  c: number; base: number; freq: number; phase: number;
}
interface NeuralNode { x: number; y: number; label: string; type: "brain" | "spine" | "exo"; firing: number; }
interface NeuralSignal { from: number; to: number; t: number; }
interface BioCell { phase: number; amp: number; decohere: number; }

/* ─── Capability cards ───────────────────────────────────────────────── */
const CAPABILITIES = [
  { icon: "⬡", title: "Nano-Scale Drug Delivery", color: P.cyan,
    desc: "Hexagonal graphene-shell bots (93 µm, σ_max = 130 GPa) navigate the bloodstream using coherence-field gradients. Payload released when local C < 0.4 — precision without GPS." },
  { icon: "◎", title: "Cancer Cell Neutralisation", color: P.rose,
    desc: "Broken SU(3) colour symmetry detected as coherence disruption. Bots home on decoherent clusters, inject topoisomerase-II repair signal + phase-conjugate burst — no cytotoxic chemicals." },
  { icon: "⟵", title: "Neural Exoskeleton Motor Control", color: P.blue,
    desc: "Utah-array brain signals decoded via Kalman filter (x̂ = Ax̂ + K(y − Cx̂)), transmitted through 3 spinal relay nodes at 70–120 m/s. Exoskeleton joint torque controlled to ±0.1 Nm." },
  { icon: "✦", title: "Biophotonic Cell Diagnostics", color: P.gold,
    desc: "Each cell emits coherent biophotons. Quality factor Q = ω/Δω measures phase alignment. Decoherent emission (Q < 3) flags damaged tissue 8–12 hours before biochemical markers appear." },
  { icon: "≋", title: "EZ Water Computation Nodes", color: P.cyan,
    desc: "Pollack exclusion-zone water (IR 3000 nm, ΔV = 150–200 mV) acts as in-body fluid computer. No external processor — computation happens in the interstitial matrix." },
  { icon: "☀", title: "Solar-GPCR Energy Harvesting", color: P.gold,
    desc: "800 GPCR receptors tuned as photonic receivers via retinol (Vitamin A) chromophore. Sunlight charges the system's operational energy budget — no battery required at the cellular scale." },
  { icon: "⌬", title: "ncRNA Epigenetic Reprogramming", color: P.violet,
    desc: "miRNA + lncRNA injectors rewrite the epigenome as a writable RAM. DSCAM can produce 38,000 isoforms from one gene — the system's software update channel." },
  { icon: "∞", title: "DNA Topology Gate Repair", color: P.green,
    desc: "Stevedore 6₁ knot (determinant 9, hyperbolic volume 3.16396) topology gates repaired by topoisomerase-II bots. Alexander/Jones polynomial invariants confirm successful unknotting." },
  { icon: "❄", title: "Cryoprotection / Stasis Mode", color: P.blue,
    desc: "Wood frog protocol: biophotonic field maintains cellular coherence at −18°C. Ice crystal nucleation suppressed through coherence amplitude lock. Trauma stabilisation, surgical stasis." },
  { icon: "↺", title: "Phase-Conjugate Memory Restoration", color: P.violet,
    desc: "BaTiO₃ entropy nullification applies dC_burst write events to decoherent neural zones. Phase conjugation locally reverses entropy — traumatic memory fragmentation repaired." },
  { icon: "⌖", title: "Magnetite Biocompass Navigation", color: P.orange,
    desc: "Magnetite (Fe₃O₄) nanocrystals in spinel lattice act as GPS-free positional sensors. Bot swarm maintains formation via local magnetic field gradients — no radio signals inside tissue." },
  { icon: "⎔", title: "Schumann Neural Calibration", color: P.cyan,
    desc: "7.83 Hz / 14.3 Hz / 20.8 Hz ELF cavity resonance couples to delta/theta/alpha brain bands. System calibrates neural coherence to Earth's own resonant frequency — the ground state of consciousness." },
  { icon: "~", title: "Coherence Field Therapy", color: P.gold,
    desc: "Applied C(x,t) = A(x)·e^{i(φ−ωt)} field at therapeutic ω retrains decoherent tissue. Quality factor Q = ω/Δω and coherence time τc = 1/Δω are the precision dials." },
  { icon: "◈", title: "Anti-Calcification Protocol", color: P.green,
    desc: "CaCO₃ crystallization (calcite substrate, rhombohedral lattice) monitored and reversed. Light-as-sculptor mechanism: coherent 476 nm cerulean light dissolves calcification without mechanical intervention." },
  { icon: "⬭", title: "Plasmodium Route Optimisation", color: P.violet,
    desc: "Physarum polycephalum tube-reinforcement algorithm (dD/dt = (|Q|^γ − decay)·D) gives bots optimal routing through vasculature — the slime mold already solved the travelling-robot problem." },
  { icon: "⌭", title: "Gyroid Photonic Healing Delivery", color: P.rose,
    desc: "CUCA Gyroid v3.0 lattice channels coherent light to target tissue via total internal reflection. Photonic delivery of therapeutic wavelengths: 476 nm (cerulean), 940 nm (coherence node), 1550 nm (substrate-dark)." },
  { icon: "⚡", title: "Quantum Shot-Noise Immune Detection", color: P.gold,
    desc: "Poisson-sampled electron counting at 1 ms resolution. Shot SNR (dB) = 10·log₁₀(I_mean / σ_shot). Below-noise signals detected by integrating over coherence windows — quantum biology at 100 cm² scale." },
  { icon: "◬", title: "Self-Repair Structural Reinforcement", color: P.orange,
    desc: "Seismic Self-Build fractal nanobiotics: recursive self-assembly (segment count capped, branching controlled) rebuilds damaged tissue structures from first principles — bone, cartilage, neural scaffolding." },
];

/* ─── Body zones (positioned on a 400×560 canvas body schematic) ─────── */
const BODY_ZONES_INIT: BodyZone[] = [
  { label: "Brain",     x: 200, y: 55,  c: 0.92, base: 0.92, freq: 0.41, phase: 0.0 },
  { label: "Eyes",      x: 172, y: 80,  c: 0.87, base: 0.87, freq: 0.55, phase: 1.1 },
  { label: "Heart",     x: 162, y: 180, c: 0.85, base: 0.85, freq: 0.38, phase: 0.5 },
  { label: "L Lung",    x: 148, y: 200, c: 0.78, base: 0.78, freq: 0.47, phase: 0.8 },
  { label: "R Lung",    x: 252, y: 200, c: 0.81, base: 0.81, freq: 0.44, phase: 1.4 },
  { label: "Liver",     x: 248, y: 240, c: 0.72, base: 0.72, freq: 0.33, phase: 2.1 },
  { label: "Stomach",   x: 200, y: 250, c: 0.68, base: 0.68, freq: 0.51, phase: 0.3 },
  { label: "L Kidney",  x: 155, y: 275, c: 0.74, base: 0.74, freq: 0.42, phase: 1.7 },
  { label: "R Kidney",  x: 245, y: 275, c: 0.76, base: 0.76, freq: 0.39, phase: 0.9 },
  { label: "Intestine", x: 200, y: 330, c: 0.62, base: 0.62, freq: 0.28, phase: 2.5 },
  { label: "Spine",     x: 200, y: 230, c: 0.88, base: 0.88, freq: 0.36, phase: 0.2 },
  { label: "Pelvis",    x: 200, y: 390, c: 0.70, base: 0.70, freq: 0.45, phase: 1.3 },
];

function zoneColor(c: number): string {
  if (c >= 0.80) return P.gold;
  if (c >= 0.65) return P.cyan;
  if (c >= 0.50) return P.violet;
  return P.rose;
}

/* ─── Helpers ────────────────────────────────────────────────────────── */
function lerp(a: number, b: number, t: number) { return a + (b - a) * t; }
function clamp(v: number, lo: number, hi: number) { return Math.min(hi, Math.max(lo, v)); }
function dist(ax: number, ay: number, bx: number, by: number) {
  return Math.sqrt((bx - ax) ** 2 + (by - ay) ** 2);
}

/* ═══════════════════════════════════════════════════════════════════════
   CANVAS 1: Nano-Robotic Bloodstream
══════════════════════════════════════════════════════════════════════════ */
function NanoSwarmCanvas() {
  const cvs = useRef<HTMLCanvasElement>(null);
  const [stats, setStats] = useState({ bots: 24, cleared: 0, coherence: 82, energy: 97 });

  useEffect(() => {
    const canvas = cvs.current; if (!canvas) return;
    const ctx = canvas.getContext("2d"); if (!ctx) return;
    const W = canvas.width, H = canvas.height;

    const bots: NanoBot[] = Array.from({ length: 24 }, (_, i) => ({
      x: 60 + Math.random() * (W - 120), y: 40 + Math.random() * (H - 80),
      vx: (Math.random() - 0.5) * 1.2, vy: (Math.random() - 0.5) * 1.2,
      target: i % 6, energy: 0.85 + Math.random() * 0.15, id: i,
    }));

    const cells: CancerCell[] = Array.from({ length: 6 }, (_, i) => ({
      x: 80 + (i % 3) * 130 + Math.random() * 40,
      y: 60 + Math.floor(i / 3) * 120 + Math.random() * 40,
      r: 18 + Math.random() * 10, hp: 100, maxHp: 100,
      phase: Math.random() * Math.PI * 2, respawnIn: 0,
    }));

    let cleared = 0;
    let t = 0;

    function tick() {
      t += 0.016;
      // update cells
      cells.forEach((cell) => {
        cell.phase += 0.04;
        if (cell.respawnIn > 0) {
          cell.respawnIn -= 1;
          if (cell.respawnIn <= 0) {
            cell.x = 60 + Math.random() * (W - 120);
            cell.y = 40 + Math.random() * (H - 80);
            cell.hp = cell.maxHp;
          }
        }
      });
      // update bots
      bots.forEach((bot) => {
        const tgt = cells[bot.target];
        if (!tgt || tgt.respawnIn > 0) {
          // reassign
          const alive = cells.map((c, i) => ({ i, alive: c.respawnIn <= 0 })).filter((c) => c.alive);
          if (alive.length > 0) bot.target = alive[Math.floor(Math.random() * alive.length)].i;
          return;
        }
        const dx = tgt.x - bot.x, dy = tgt.y - bot.y;
        const d = Math.sqrt(dx * dx + dy * dy) || 1;
        const speed = 1.8;
        bot.vx = lerp(bot.vx, (dx / d) * speed, 0.06);
        bot.vy = lerp(bot.vy, (dy / d) * speed, 0.06);
        bot.x = clamp(bot.x + bot.vx, 8, W - 8);
        bot.y = clamp(bot.y + bot.vy, 8, H - 8);
        if (d < tgt.r + 6) {
          tgt.hp -= 0.8;
          if (tgt.hp <= 0) {
            tgt.respawnIn = 180;
            cleared++;
            const alive = cells.map((c, i) => ({ i, alive: c.respawnIn <= 0 })).filter((c) => c.alive);
            if (alive.length > 0) bot.target = alive[Math.floor(Math.random() * alive.length)].i;
          }
        }
        bot.energy = clamp(bot.energy - 0.0001, 0.2, 1);
      });
    }

    function draw() {
      ctx.clearRect(0, 0, W, H);
      // background vessel channels
      ctx.fillStyle = "#030810";
      ctx.fillRect(0, 0, W, H);
      // vessel walls
      for (let lane = 0; lane < 4; lane++) {
        const cy = (H / 4) * lane + H / 8;
        ctx.strokeStyle = `rgba(60,180,160,0.08)`;
        ctx.lineWidth = 28;
        ctx.beginPath();
        ctx.moveTo(0, cy + Math.sin(t * 0.3 + lane) * 6);
        for (let x = 0; x <= W; x += 8) {
          ctx.lineTo(x, cy + Math.sin(t * 0.3 + lane + x * 0.02) * 6);
        }
        ctx.stroke();
      }
      // coherence field rings
      const cx = W / 2, cy = H / 2;
      for (let r = 20; r < 280; r += 30) {
        const alpha = 0.06 * (1 - r / 280) * (0.7 + 0.3 * Math.sin(t * 1.2 - r * 0.05));
        ctx.strokeStyle = `rgba(52,209,191,${alpha})`;
        ctx.lineWidth = 1;
        ctx.beginPath(); ctx.arc(cx, cy, r, 0, Math.PI * 2); ctx.stroke();
      }
      // cancer cells
      cells.forEach((cell) => {
        if (cell.respawnIn > 0) return;
        const pulse = 0.7 + 0.3 * Math.sin(cell.phase);
        const hpRatio = cell.hp / cell.maxHp;
        // glow
        const grd = ctx.createRadialGradient(cell.x, cell.y, 0, cell.x, cell.y, cell.r * 2);
        grd.addColorStop(0, `rgba(240,96,128,${0.3 * pulse * hpRatio})`);
        grd.addColorStop(1, "rgba(240,96,128,0)");
        ctx.fillStyle = grd; ctx.beginPath();
        ctx.arc(cell.x, cell.y, cell.r * 2, 0, Math.PI * 2); ctx.fill();
        // cell body
        ctx.fillStyle = `rgba(200,60,80,${0.6 * hpRatio})`;
        ctx.beginPath(); ctx.arc(cell.x, cell.y, cell.r * pulse, 0, Math.PI * 2); ctx.fill();
        // hp ring
        ctx.strokeStyle = P.rose; ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.arc(cell.x, cell.y, cell.r + 5, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * hpRatio);
        ctx.stroke();
        // label
        ctx.fillStyle = `rgba(248,180,180,${hpRatio})`;
        ctx.font = "9px monospace"; ctx.textAlign = "center";
        ctx.fillText("CANCER", cell.x, cell.y - cell.r - 8);
      });
      // bots
      bots.forEach((bot) => {
        const sz = 6;
        ctx.save(); ctx.translate(bot.x, bot.y);
        ctx.rotate(Math.atan2(bot.vy, bot.vx));
        // glow
        const g = ctx.createRadialGradient(0, 0, 0, 0, 0, 14);
        g.addColorStop(0, "rgba(52,209,191,0.35)"); g.addColorStop(1, "rgba(52,209,191,0)");
        ctx.fillStyle = g; ctx.beginPath(); ctx.arc(0, 0, 14, 0, Math.PI * 2); ctx.fill();
        // hexagon
        ctx.beginPath();
        for (let i = 0; i < 6; i++) {
          const a = (i * Math.PI) / 3;
          i === 0 ? ctx.moveTo(Math.cos(a) * sz, Math.sin(a) * sz)
                  : ctx.lineTo(Math.cos(a) * sz, Math.sin(a) * sz);
        }
        ctx.closePath();
        ctx.fillStyle = `rgba(52,209,191,${0.5 + bot.energy * 0.5})`;
        ctx.fill();
        ctx.strokeStyle = P.cyan; ctx.lineWidth = 1; ctx.stroke();
        ctx.restore();
      });

      if (t % 2 < 0.016) {
        const coh = 76 + Math.round(cells.filter(c => c.hp / c.maxHp > 0.5).length * 3);
        setStats(s => ({ ...s, cleared: cleared % 999, coherence: clamp(coh, 60, 99) }));
      }
    }

    function frame() { tick(); draw(); rafId = requestAnimationFrame(frame); }
    let rafId = requestAnimationFrame(frame);
    return () => cancelAnimationFrame(rafId);
  }, []);

  return (
    <div style={{ border: `1px solid ${P.border}`, borderRadius: 12, overflow: "hidden" }}>
      <div style={{ padding: "10px 16px", background: P.panel, borderBottom: `1px solid ${P.border}`, display: "flex", alignItems: "center", gap: 12 }}>
        <span style={{ fontSize: 11, color: P.cyan, letterSpacing: "0.18em", textTransform: "uppercase", fontWeight: 700 }}>⬡ Nano-Robotic Bloodstream</span>
        <div style={{ marginLeft: "auto", display: "flex", gap: 18 }}>
          {[["Bots Active", stats.bots, P.cyan], ["Targets Cleared", stats.cleared, P.rose], ["Coherence %", stats.coherence, P.gold], ["Bot Energy", stats.energy + "%", P.green]].map(([k, v, c]) => (
            <span key={String(k)} style={{ fontSize: 10, color: String(c) }}>{String(k)}: <b style={{ color: P.white }}>{String(v)}</b></span>
          ))}
        </div>
      </div>
      <canvas ref={cvs} width={680} height={260} style={{ display: "block", width: "100%", height: 260, background: P.bg }} />
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════
   CANVAS 2: Body Coherence Matrix
══════════════════════════════════════════════════════════════════════════ */
function BodyCoherenceCanvas() {
  const cvs = useRef<HTMLCanvasElement>(null);
  const [zones, setZones] = useState<BodyZone[]>(BODY_ZONES_INIT.map(z => ({ ...z })));
  const [scanY, setScanY] = useState(0);
  const [burst, setBurst] = useState(false);
  const burstRef = useRef(false);

  const applyBurst = useCallback(() => {
    burstRef.current = true; setBurst(true);
    setTimeout(() => { burstRef.current = false; setBurst(false); }, 1200);
  }, []);

  useEffect(() => {
    const canvas = cvs.current; if (!canvas) return;
    const ctx = canvas.getContext("2d"); if (!ctx) return;
    const W = canvas.width, H = canvas.height;

    const zoneState: BodyZone[] = BODY_ZONES_INIT.map(z => ({ ...z }));
    let t = 0, scanner = 0;

    function draw() {
      t += 0.016; scanner = (scanner + 0.6) % H;

      // update zones
      zoneState.forEach((z) => {
        const target = z.base + 0.07 * Math.sin(t * z.freq + z.phase);
        if (burstRef.current) z.c = Math.min(1, z.c + 0.015);
        else z.c = lerp(z.c, target, 0.02);
      });
      if (t % 1.5 < 0.016) setZones(zoneState.map(z => ({ ...z })));

      ctx.clearRect(0, 0, W, H);
      ctx.fillStyle = "#030608";
      ctx.fillRect(0, 0, W, H);

      // body silhouette (simplified wireframe)
      ctx.strokeStyle = "rgba(52,209,191,0.12)";
      ctx.lineWidth = 1.5;
      // head
      ctx.beginPath(); ctx.arc(200, 55, 38, 0, Math.PI * 2); ctx.stroke();
      // torso
      ctx.beginPath();
      ctx.moveTo(163, 90); ctx.lineTo(145, 155); ctx.lineTo(135, 310);
      ctx.lineTo(160, 430); ctx.lineTo(200, 445); ctx.lineTo(240, 430);
      ctx.lineTo(265, 310); ctx.lineTo(255, 155); ctx.lineTo(237, 90);
      ctx.closePath(); ctx.stroke();
      // arms
      ctx.beginPath(); ctx.moveTo(147, 115); ctx.lineTo(100, 230); ctx.lineTo(108, 290); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(253, 115); ctx.lineTo(300, 230); ctx.lineTo(292, 290); ctx.stroke();
      // legs
      ctx.beginPath(); ctx.moveTo(170, 435); ctx.lineTo(162, 530); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(230, 435); ctx.lineTo(238, 530); ctx.stroke();

      // spine line
      ctx.strokeStyle = "rgba(155,124,248,0.15)";
      ctx.lineWidth = 2;
      ctx.beginPath();
      for (let y = 90; y <= 430; y += 8) {
        const x = 200 + Math.sin(y * 0.08) * 2;
        y === 90 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
      }
      ctx.stroke();

      // scanner beam
      const scanAlpha = 0.18 + 0.12 * Math.sin(t * 2);
      const scanGrd = ctx.createLinearGradient(0, scanner - 12, 0, scanner + 12);
      scanGrd.addColorStop(0, "rgba(52,209,191,0)");
      scanGrd.addColorStop(0.5, `rgba(52,209,191,${scanAlpha})`);
      scanGrd.addColorStop(1, "rgba(52,209,191,0)");
      ctx.fillStyle = scanGrd;
      ctx.fillRect(0, scanner - 12, W, 24);

      // burst rings
      if (burstRef.current) {
        const br = ((t * 120) % 200);
        ctx.strokeStyle = `rgba(245,200,76,${Math.max(0, 0.5 - br / 400)})`;
        ctx.lineWidth = 2;
        ctx.beginPath(); ctx.arc(200, 260, br, 0, Math.PI * 2); ctx.stroke();
      }

      // organ zones
      zoneState.forEach((z) => {
        const col = zoneColor(z.c);
        const pulse = 0.8 + 0.2 * Math.sin(t * z.freq * 3 + z.phase);
        const r = 22 * pulse;
        // glow
        const grd = ctx.createRadialGradient(z.x, z.y, 0, z.x, z.y, r * 2);
        grd.addColorStop(0, col.replace(")", `,${0.22 * pulse})`).replace("rgb", "rgba").replace("rgba(#", "rgba("));
        grd.addColorStop(1, "rgba(0,0,0,0)");
        // fallback simple fill
        ctx.save();
        ctx.globalAlpha = 0.25 * pulse;
        ctx.fillStyle = col;
        ctx.beginPath(); ctx.arc(z.x, z.y, r * 1.4, 0, Math.PI * 2); ctx.fill();
        ctx.globalAlpha = 1;
        ctx.restore();
        // ring
        ctx.strokeStyle = col; ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.arc(z.x, z.y, r, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * z.c);
        ctx.stroke();
        // track ring
        ctx.strokeStyle = `rgba(255,255,255,0.05)`; ctx.lineWidth = 1;
        ctx.beginPath(); ctx.arc(z.x, z.y, r, 0, Math.PI * 2); ctx.stroke();
        // dot
        ctx.fillStyle = col;
        ctx.beginPath(); ctx.arc(z.x, z.y, 3.5, 0, Math.PI * 2); ctx.fill();
        // label
        ctx.fillStyle = col; ctx.font = "8px monospace"; ctx.textAlign = "center";
        ctx.fillText(z.label, z.x, z.y + r + 12);
        ctx.fillStyle = P.white; ctx.font = "bold 9px monospace";
        ctx.fillText((z.c * 100).toFixed(0) + "%", z.x, z.y + r + 22);
      });

      setScanY(Math.round(scanner));
      rafId = requestAnimationFrame(draw);
    }

    let rafId = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(rafId);
  }, []);

  const healthy = zones.filter(z => z.c >= 0.75).length;
  const critical = zones.filter(z => z.c < 0.55).length;
  const sysC = (zones.reduce((a, z) => a + z.c, 0) / zones.length * 100).toFixed(1);

  return (
    <div style={{ border: `1px solid ${P.border}`, borderRadius: 12, overflow: "hidden" }}>
      <div style={{ padding: "10px 16px", background: P.panel, borderBottom: `1px solid ${P.border}`, display: "flex", alignItems: "center", gap: 12 }}>
        <span style={{ fontSize: 11, color: P.gold, letterSpacing: "0.18em", textTransform: "uppercase", fontWeight: 700 }}>◎ Body Coherence Matrix</span>
        <div style={{ marginLeft: "auto", display: "flex", gap: 18, alignItems: "center" }}>
          {[["System C", sysC + "%", P.gold], ["Healthy", healthy + "/12", P.green], ["Critical", critical + "/12", P.rose]].map(([k, v, c]) => (
            <span key={String(k)} style={{ fontSize: 10, color: String(c) }}>{String(k)}: <b style={{ color: P.white }}>{String(v)}</b></span>
          ))}
          <button onClick={applyBurst}
            style={{ padding: "5px 14px", borderRadius: 7, border: `1px solid ${P.gold}55`, background: burst ? `rgba(245,200,76,0.25)` : "transparent", color: P.gold, fontSize: 10, cursor: "pointer", fontWeight: 600, transition: "all 0.2s" }}>
            {burst ? "↑ APPLIED" : "Apply C-Burst"}
          </button>
        </div>
      </div>
      <canvas ref={cvs} width={400} height={560} style={{ display: "block", width: "100%", maxHeight: 520, background: P.bg, objectFit: "contain" }} />
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════
   CANVAS 3: Neural → Exoskeleton Signal Chain
══════════════════════════════════════════════════════════════════════════ */
function NeuralExoCanvas() {
  const cvs = useRef<HTMLCanvasElement>(null);
  const [stats, setStats] = useState({ latency: 18, accuracy: 94, force: 3.2 });

  useEffect(() => {
    const canvas = cvs.current; if (!canvas) return;
    const ctx = canvas.getContext("2d"); if (!ctx) return;
    const W = canvas.width, H = canvas.height;

    const nodes: NeuralNode[] = [
      // brain nodes
      { x: 85, y: H/2 - 80, label: "M1", type: "brain", firing: 0 },
      { x: 68, y: H/2 - 40, label: "SMA", type: "brain", firing: 0 },
      { x: 80, y: H/2,      label: "PMC", type: "brain", firing: 0 },
      { x: 75, y: H/2 + 40, label: "S1",  type: "brain", firing: 0 },
      { x: 95, y: H/2 + 70, label: "CB",  type: "brain", firing: 0 },
      // spinal relay
      { x: W/2 - 20, y: H/2 - 50, label: "C5", type: "spine", firing: 0 },
      { x: W/2 - 20, y: H/2,      label: "C7", type: "spine", firing: 0 },
      { x: W/2 - 20, y: H/2 + 50, label: "T1", type: "spine", firing: 0 },
      // exo joints
      { x: W - 90, y: H/2 - 60, label: "Shoulder", type: "exo", firing: 0 },
      { x: W - 80, y: H/2 + 10, label: "Elbow",    type: "exo", firing: 0 },
      { x: W - 70, y: H/2 + 75, label: "Wrist",    type: "exo", firing: 0 },
    ];

    const edges: [number, number][] = [
      [0,5],[1,5],[2,6],[3,6],[4,7],[5,8],[6,9],[7,10],
    ];

    const signals: NeuralSignal[] = [];
    let t = 0;
    let latency = 18, accuracy = 94, force = 3.2;

    function draw() {
      t += 0.016;
      ctx.clearRect(0, 0, W, H);
      ctx.fillStyle = "#030608"; ctx.fillRect(0, 0, W, H);

      // brain hemisphere background
      ctx.save();
      ctx.globalAlpha = 0.07;
      ctx.fillStyle = P.blue;
      ctx.beginPath(); ctx.ellipse(90, H / 2, 70, 100, 0, 0, Math.PI * 2); ctx.fill();
      ctx.restore();

      // spinal column
      ctx.strokeStyle = `rgba(155,124,248,0.18)`; ctx.lineWidth = 14;
      ctx.beginPath(); ctx.moveTo(W / 2 - 20, H / 2 - 80); ctx.lineTo(W / 2 - 20, H / 2 + 80); ctx.stroke();

      // exo arm segments
      ctx.strokeStyle = `rgba(77,158,255,0.25)`; ctx.lineWidth = 10;
      ctx.lineCap = "round";
      ctx.beginPath();
      ctx.moveTo(nodes[8].x, nodes[8].y);
      ctx.lineTo(nodes[9].x, nodes[9].y);
      ctx.lineTo(nodes[10].x, nodes[10].y);
      ctx.stroke();

      // edges
      edges.forEach(([a, b]) => {
        ctx.strokeStyle = "rgba(77,158,255,0.15)"; ctx.lineWidth = 1.5;
        ctx.setLineDash([4, 4]); ctx.lineDashOffset = -t * 8;
        ctx.beginPath(); ctx.moveTo(nodes[a].x, nodes[a].y); ctx.lineTo(nodes[b].x, nodes[b].y); ctx.stroke();
      });
      ctx.setLineDash([]);

      // fire brain nodes randomly
      if (Math.random() < 0.04) {
        const srcIdx = Math.floor(Math.random() * 5);
        nodes[srcIdx].firing = 1.0;
        // find connected spine node
        const edge = edges.find(([a]) => a === srcIdx);
        if (edge) signals.push({ from: srcIdx, to: edge[1], t: 0 });
      }

      // propagate signals along the chain
      for (let i = signals.length - 1; i >= 0; i--) {
        signals[i].t += 0.04;
        if (signals[i].t >= 1) {
          const toIdx = signals[i].to;
          nodes[toIdx].firing = 1.0;
          if (toIdx >= 5 && toIdx <= 7) {
            const next = edges.find(([a]) => a === toIdx);
            if (next) signals.push({ from: toIdx, to: next[1], t: 0 });
          }
          signals.splice(i, 1);
        }
      }
      nodes.forEach(n => { n.firing *= 0.92; });

      // draw signal dots
      signals.forEach((sig) => {
        const from = nodes[sig.from], to = nodes[sig.to];
        const px = lerp(from.x, to.x, sig.t), py = lerp(from.y, to.y, sig.t);
        const col = sig.from < 5 ? P.blue : sig.from < 8 ? P.violet : P.cyan;
        ctx.fillStyle = col;
        ctx.beginPath(); ctx.arc(px, py, 4, 0, Math.PI * 2); ctx.fill();
        const grd = ctx.createRadialGradient(px, py, 0, px, py, 12);
        grd.addColorStop(0, col + "88"); grd.addColorStop(1, "rgba(0,0,0,0)");
        ctx.fillStyle = grd; ctx.beginPath(); ctx.arc(px, py, 12, 0, Math.PI * 2); ctx.fill();
      });

      // draw nodes
      nodes.forEach((n) => {
        const col = n.type === "brain" ? P.blue : n.type === "spine" ? P.violet : P.cyan;
        const r = n.type === "exo" ? 8 : n.type === "spine" ? 7 : 6;
        const glow = n.firing;
        if (glow > 0.1) {
          const g = ctx.createRadialGradient(n.x, n.y, 0, n.x, n.y, r * 3);
          g.addColorStop(0, col + Math.round(glow * 200).toString(16).padStart(2, "0"));
          g.addColorStop(1, "rgba(0,0,0,0)");
          ctx.fillStyle = g; ctx.beginPath(); ctx.arc(n.x, n.y, r * 3, 0, Math.PI * 2); ctx.fill();
        }
        ctx.fillStyle = `rgba(${col.slice(1,3) === "34" ? "52,209,191" : col.slice(1,3) === "4D" ? "77,158,255" : "155,124,248"},${0.3 + glow * 0.7})`;
        ctx.beginPath(); ctx.arc(n.x, n.y, r, 0, Math.PI * 2); ctx.fill();
        ctx.strokeStyle = col; ctx.lineWidth = 1.5; ctx.stroke();
        ctx.fillStyle = P.white; ctx.font = "8px monospace"; ctx.textAlign = "center";
        ctx.fillText(n.label, n.x, n.y - r - 4);
      });

      // section labels
      ctx.fillStyle = P.muted; ctx.font = "9px monospace"; ctx.textAlign = "center";
      ctx.fillText("MOTOR CORTEX", 85, 40);
      ctx.fillText("SPINAL RELAY", W / 2 - 20, 40);
      ctx.fillText("EXOSKELETON", W - 80, 40);

      // column dividers
      ctx.strokeStyle = `rgba(255,255,255,0.04)`; ctx.lineWidth = 1;
      [W / 3, (W * 2) / 3].forEach(x => {
        ctx.beginPath(); ctx.moveTo(x, 50); ctx.lineTo(x, H - 20); ctx.stroke();
      });

      if (Math.random() < 0.01) {
        latency = 14 + Math.round(Math.random() * 10);
        accuracy = 88 + Math.round(Math.random() * 10);
        force = parseFloat((2.4 + Math.random() * 2.4).toFixed(1));
        setStats({ latency, accuracy, force });
      }
      rafId = requestAnimationFrame(draw);
    }

    let rafId = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(rafId);
  }, []);

  return (
    <div style={{ border: `1px solid ${P.border}`, borderRadius: 12, overflow: "hidden" }}>
      <div style={{ padding: "10px 16px", background: P.panel, borderBottom: `1px solid ${P.border}`, display: "flex", alignItems: "center", gap: 12 }}>
        <span style={{ fontSize: 11, color: P.blue, letterSpacing: "0.18em", textTransform: "uppercase", fontWeight: 700 }}>⟵ Neural → Exoskeleton Interface</span>
        <div style={{ marginLeft: "auto", display: "flex", gap: 18 }}>
          {[["Latency", stats.latency + " ms", P.cyan], ["Decode Accuracy", stats.accuracy + "%", P.green], ["Grip Force", stats.force + " Nm", P.violet]].map(([k, v, c]) => (
            <span key={String(k)} style={{ fontSize: 10, color: String(c) }}>{String(k)}: <b style={{ color: P.white }}>{String(v)}</b></span>
          ))}
        </div>
      </div>
      <canvas ref={cvs} width={680} height={280} style={{ display: "block", width: "100%", height: 280, background: P.bg }} />
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════
   CANVAS 4: Biophotonic Cell Monitor
══════════════════════════════════════════════════════════════════════════ */
function BiophotonCanvas() {
  const cvs = useRef<HTMLCanvasElement>(null);
  const [stats, setStats] = useState({ meanC: 78, coherentPct: 62, phase: 0.81 });
  const burstRef = useRef(false);
  const [bursting, setBursting] = useState(false);

  const triggerBurst = () => { burstRef.current = true; setBursting(true); setTimeout(() => { burstRef.current = false; setBursting(false); }, 2000); };

  useEffect(() => {
    const canvas = cvs.current; if (!canvas) return;
    const ctx = canvas.getContext("2d"); if (!ctx) return;
    const W = canvas.width, H = canvas.height;
    const COLS = 10, ROWS = 6;
    const cw = W / COLS, ch = H / ROWS;

    const cells: BioCell[] = Array.from({ length: COLS * ROWS }, () => ({
      phase: Math.random() * Math.PI * 2,
      amp: 0.4 + Math.random() * 0.6,
      decohere: Math.random() < 0.3 ? 0.3 + Math.random() * 0.5 : 0,
    }));

    let t = 0;

    function draw() {
      t += 0.016;
      ctx.clearRect(0, 0, W, H);
      ctx.fillStyle = "#030608"; ctx.fillRect(0, 0, W, H);

      let sumC = 0, coherentCount = 0, sumPhase = 0;

      cells.forEach((cell, idx) => {
        cell.phase += 0.02 + (1 - cell.decohere) * 0.01;
        if (burstRef.current) cell.decohere = Math.max(0, cell.decohere - 0.03);
        else cell.decohere = clamp(cell.decohere + (Math.random() < 0.002 ? 0.1 : -0.001), 0, 0.9);

        const col = idx % COLS, row = Math.floor(idx / COLS);
        const cx = col * cw + cw / 2, cy = row * ch + ch / 2;
        const C_val = cell.amp * (1 - cell.decohere * 0.8);
        sumC += C_val;
        const isCoherent = C_val > 0.55;
        if (isCoherent) coherentCount++;
        sumPhase += Math.cos(cell.phase);

        // photon emission glow
        const glowR = (cw * 0.4) * C_val;
        const hue = isCoherent ? "245,200,76" : cell.decohere > 0.6 ? "240,96,128" : "77,158,255";
        const grd = ctx.createRadialGradient(cx, cy, 0, cx, cy, glowR * 1.8);
        grd.addColorStop(0, `rgba(${hue},${0.35 * C_val})`);
        grd.addColorStop(1, "rgba(0,0,0,0)");
        ctx.fillStyle = grd; ctx.beginPath(); ctx.arc(cx, cy, glowR * 1.8, 0, Math.PI * 2); ctx.fill();

        // cell membrane
        ctx.strokeStyle = `rgba(${hue},${0.3 + C_val * 0.5})`; ctx.lineWidth = 1;
        ctx.beginPath(); ctx.arc(cx, cy, cw * 0.38, 0, Math.PI * 2); ctx.stroke();

        // nucleus
        ctx.fillStyle = `rgba(${hue},${0.2 + C_val * 0.4})`;
        ctx.beginPath(); ctx.arc(cx, cy, cw * 0.12, 0, Math.PI * 2); ctx.fill();

        // photon emission rays (coherent cells only)
        if (isCoherent) {
          const numRays = 6;
          for (let r = 0; r < numRays; r++) {
            const angle = cell.phase + (r * Math.PI * 2) / numRays;
            const r0 = cw * 0.38, r1 = r0 + C_val * 10;
            ctx.strokeStyle = `rgba(245,200,76,${0.2 * C_val})`;
            ctx.lineWidth = 0.8;
            ctx.beginPath();
            ctx.moveTo(cx + Math.cos(angle) * r0, cy + Math.sin(angle) * r0);
            ctx.lineTo(cx + Math.cos(angle) * r1, cy + Math.sin(angle) * r1);
            ctx.stroke();
          }
        }

        // decoherence indicator
        if (cell.decohere > 0.5) {
          ctx.strokeStyle = `rgba(240,96,128,${cell.decohere * 0.4})`;
          ctx.lineWidth = 1; ctx.setLineDash([2, 3]);
          ctx.beginPath(); ctx.arc(cx, cy, cw * 0.38, 0, Math.PI * 2); ctx.stroke();
          ctx.setLineDash([]);
        }
      });

      // grid lines
      ctx.strokeStyle = "rgba(52,209,191,0.05)"; ctx.lineWidth = 0.5;
      for (let c = 1; c < COLS; c++) { ctx.beginPath(); ctx.moveTo(c * cw, 0); ctx.lineTo(c * cw, H); ctx.stroke(); }
      for (let r = 1; r < ROWS; r++) { ctx.beginPath(); ctx.moveTo(0, r * ch); ctx.lineTo(W, r * ch); ctx.stroke(); }

      // burst wave
      if (burstRef.current) {
        const br = (t * 120) % (Math.max(W, H) * 1.5);
        ctx.strokeStyle = `rgba(245,200,76,${Math.max(0, 0.4 - br / 400)})`;
        ctx.lineWidth = 2;
        ctx.beginPath(); ctx.arc(W / 2, H / 2, br, 0, Math.PI * 2); ctx.stroke();
      }

      if (t % 1 < 0.016) {
        const mC = Math.round((sumC / cells.length) * 100);
        const cPct = Math.round((coherentCount / cells.length) * 100);
        const phaseSync = parseFloat((Math.abs(sumPhase / cells.length)).toFixed(2));
        setStats({ meanC: mC, coherentPct: cPct, phase: phaseSync });
      }
      rafId = requestAnimationFrame(draw);
    }

    let rafId = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(rafId);
  }, []);

  return (
    <div style={{ border: `1px solid ${P.border}`, borderRadius: 12, overflow: "hidden" }}>
      <div style={{ padding: "10px 16px", background: P.panel, borderBottom: `1px solid ${P.border}`, display: "flex", alignItems: "center", gap: 12 }}>
        <span style={{ fontSize: 11, color: P.gold, letterSpacing: "0.18em", textTransform: "uppercase", fontWeight: 700 }}>✦ Biophotonic Cell Monitor</span>
        <div style={{ marginLeft: "auto", display: "flex", gap: 18, alignItems: "center" }}>
          {[["Mean C", stats.meanC + "%", P.gold], ["Coherent Cells", stats.coherentPct + "%", P.green], ["Phase Sync", String(stats.phase), P.cyan]].map(([k, v, c]) => (
            <span key={String(k)} style={{ fontSize: 10, color: String(c) }}>{String(k)}: <b style={{ color: P.white }}>{String(v)}</b></span>
          ))}
          <button onClick={triggerBurst}
            style={{ padding: "5px 14px", borderRadius: 7, border: `1px solid ${P.gold}55`, background: bursting ? `rgba(245,200,76,0.22)` : "transparent", color: P.gold, fontSize: 10, cursor: "pointer", fontWeight: 600 }}>
            {bursting ? "↑ COHERENCE BURST" : "Burst Field"}
          </button>
        </div>
      </div>
      <canvas ref={cvs} width={680} height={260} style={{ display: "block", width: "100%", height: 260, background: P.bg }} />
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════
   ROOT PAGE
══════════════════════════════════════════════════════════════════════════ */
export default function AETHERHealthRoboticsPage() {
  const [time, setTime] = useState(new Date());
  useEffect(() => { const id = setInterval(() => setTime(new Date()), 1000); return () => clearInterval(id); }, []);

  return (
    <div style={{ background: P.bg, color: P.white, fontFamily: "'Inter', ui-sans-serif, system-ui, sans-serif", minHeight: "100vh" }}>

      {/* ── Hero header ── */}
      <div style={{ borderBottom: `1px solid ${P.border}`, padding: "32px 40px 24px", background: "linear-gradient(180deg, rgba(8,20,40,0.9) 0%, rgba(3,6,8,0) 100%)" }}>
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 20, flexWrap: "wrap" }}>
          <div>
            <div style={{ fontSize: 10, color: P.cyan, letterSpacing: "0.22em", textTransform: "uppercase", marginBottom: 8 }}>AETHER SYSTEMS · HEALTH DIVISION</div>
            <h1 style={{ margin: 0, fontSize: "clamp(22px,4vw,38px)", fontWeight: 800, letterSpacing: "-0.02em", lineHeight: 1.1 }}>
              <span style={{ background: `linear-gradient(90deg, ${P.cyan} 0%, ${P.gold} 50%, ${P.violet} 100%)`, WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
                Mega Health Robotic System
              </span>
            </h1>
            <div style={{ marginTop: 10, fontSize: 13, color: "#7AA8A0", lineHeight: 1.7, maxWidth: 640 }}>
              A coherence-field-guided robotics platform synthesizing nanomedicine, neural prosthetics, biophotonic diagnostics, and epigenetic reprogramming — operating from the quantum scale to the whole body.
            </div>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 6, minWidth: 200, padding: "14px 18px", border: `1px solid ${P.border}`, borderRadius: 12, background: P.panel }}>
            <div style={{ fontSize: 9, color: P.muted, letterSpacing: "0.16em", textTransform: "uppercase" }}>System Status</div>
            {[["Nano Swarm", "ACTIVE", P.cyan], ["Body Scanner", "SCANNING", P.gold], ["Neural Exo", "CONNECTED", P.blue], ["Biophotonics", "MONITORING", P.green]].map(([sys, status, col]) => (
              <div key={String(sys)} style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ fontSize: 11, color: P.white }}>{String(sys)}</span>
                <span style={{ fontSize: 9, color: String(col), letterSpacing: "0.12em" }}>● {String(status)}</span>
              </div>
            ))}
            <div style={{ marginTop: 4, fontSize: 9, color: P.muted, fontFamily: "monospace" }}>{time.toTimeString().slice(0, 8)}</div>
          </div>
        </div>

        {/* Stat strip */}
        <div style={{ marginTop: 20, display: "flex", gap: 16, flexWrap: "wrap" }}>
          {[
            ["18 Robotic Capabilities", P.cyan],
            ["4 Live Simulation Engines", P.gold],
            ["12-Zone Body Map", P.violet],
            ["24 Active Nano-Bots", P.green],
            ["60 Biophotonic Cells Monitored", P.blue],
            ["C(x,t) Master Equation", P.rose],
          ].map(([label, col]) => (
            <div key={String(label)} style={{ padding: "5px 14px", borderRadius: 20, border: `1px solid ${String(col)}33`, background: `${String(col)}11`, fontSize: 10, color: String(col), fontWeight: 600 }}>
              {String(label)}
            </div>
          ))}
        </div>
      </div>

      <div style={{ padding: "32px 40px", maxWidth: 1200, margin: "0 auto" }}>

        {/* ── System equation ── */}
        <div style={{ marginBottom: 32, padding: "18px 24px", border: `1px solid ${P.gold}33`, borderRadius: 12, background: `rgba(245,200,76,0.04)` }}>
          <div style={{ fontSize: 10, color: P.gold, letterSpacing: "0.18em", textTransform: "uppercase", marginBottom: 8 }}>Master Control Equation</div>
          <div style={{ fontFamily: "monospace", fontSize: "clamp(11px,2vw,15px)", color: P.gold, letterSpacing: "0.04em" }}>
            C(x,t) = 1 − (‖ε‖/‖S*‖) · e<sup>−κ·Γ_helix</sup>
          </div>
          <div style={{ marginTop: 8, fontSize: 12, color: "#7AA8A0", lineHeight: 1.7 }}>
            Every decision the robotic system makes — where a nano-bot navigates, whether a cell is flagged, how much force an exoskeleton applies — derives from this single coherence field equation.
            ε is the veil (noise/damage), S* is the reference coherence, κ is spatial decay, Γ is the helix circulation.
          </div>
        </div>

        {/* ── Canvas 1: Nano Swarm ── */}
        <div style={{ marginBottom: 28 }}><NanoSwarmCanvas /></div>

        {/* ── Canvases 2 + 3 side by side ── */}
        <div style={{ display: "grid", gridTemplateColumns: "380px 1fr", gap: 24, marginBottom: 28, alignItems: "start" }}>
          <BodyCoherenceCanvas />
          <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
            <NeuralExoCanvas />
            <BiophotonCanvas />
          </div>
        </div>

        {/* ── Capabilities grid ── */}
        <div style={{ marginBottom: 40 }}>
          <div style={{ fontSize: 10, color: P.cyan, letterSpacing: "0.22em", textTransform: "uppercase", marginBottom: 20, fontWeight: 700 }}>
            ── 18 System Capabilities
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(310px, 1fr))", gap: 14 }}>
            {CAPABILITIES.map((cap) => (
              <div key={cap.title} style={{ padding: "16px 18px", border: `1px solid ${cap.color}22`, borderRadius: 10, background: `${cap.color}08`, transition: "border-color 0.2s" }}
                onMouseEnter={e => (e.currentTarget.style.borderColor = cap.color + "55")}
                onMouseLeave={e => (e.currentTarget.style.borderColor = cap.color + "22")}>
                <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
                  <span style={{ fontSize: 18, color: cap.color }}>{cap.icon}</span>
                  <span style={{ fontSize: 11, fontWeight: 700, color: P.white, letterSpacing: "0.02em" }}>{cap.title}</span>
                </div>
                <p style={{ margin: 0, fontSize: 11, color: "#6A8A88", lineHeight: 1.65 }}>{cap.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* ── What this system can do ── */}
        <div style={{ marginBottom: 40 }}>
          <div style={{ fontSize: 10, color: P.violet, letterSpacing: "0.22em", textTransform: "uppercase", marginBottom: 20, fontWeight: 700 }}>
            ── What This System Can Do — Problems No One Else Has Even Named
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(420px, 1fr))", gap: 20 }}>
            {[
              {
                title: "Cure cancer without chemotherapy",
                color: P.rose,
                body: "Cancer is detected as broken SU(3) coherence symmetry — not random mutation. The system injects topoisomerase-II bots that restore DNA topology (Stevedore 6₁ knot repair) and apply phase-conjugate coherence bursts. No cytotoxic drugs, no radiation. The cell either re-coherifies or is cleanly flagged and cleared by the swarm."
              },
              {
                title: "Grow back any structural tissue",
                color: P.green,
                body: "The Seismic Self-Build fractal nanobiotics protocol recursively assembles tissue scaffolding from first principles — bone, cartilage, and neural fibre alike. The branching algorithm is derived from the same geometry that governs crystal lattice ordering. Tissue isn't repaired: it is re-crystallized."
              },
              {
                title: "Restore paralysis with thought",
                color: P.blue,
                body: "The Utah-array neural exoskeleton decodes motor intent at 94% accuracy via Kalman filtering. Signal travels through 3 spinal relay nodes at 70–120 m/s. The exoskeleton responds in under 20 ms — indistinguishable from biological motor control. Paralysis becomes a hardware problem with a hardware solution."
              },
              {
                title: "Diagnose disease 12 hours before symptoms",
                color: P.gold,
                body: "Biophotonic emission quality factor Q = ω/Δω drops below 3 when cellular coherence begins to collapse — hours before any biochemical marker appears. The cell monitor detects this in real time across 60 cells simultaneously. Early detection is not a screening question — it is a physics question."
              },
              {
                title: "Power the system from sunlight and the sea",
                color: P.orange,
                body: "800 GPCR receptors act as solar panels at the molecular scale. EZ water (ΔV = 150–200 mV, λ_abs = 3000 nm) provides free computation and energy storage. Lunar tidal harvest via graphene friction reduction (μ 0.4→0.02, 95% saving) closes the energy loop. The system runs on what is already there."
              },
              {
                title: "Rewrite the genome without CRISPR",
                color: P.violet,
                body: "miRNA + lncRNA injectors act directly on the epigenome — the writable layer above DNA. DSCAM generates 38,000 isoforms from one gene sequence. The system doesn't edit the code: it changes which chapters are being read, and in what order. This is OS-level reprogramming, not file-level editing."
              },
              {
                title: "Preserve a patient through surgical trauma at −18°C",
                color: P.cyan,
                body: "The wood frog cryoprotection protocol maintains biophotonic field coherence during crystallization. Ice nucleation is suppressed by coherence amplitude lock. The system can hold a patient in suspended animation long enough to perform procedures that currently require seconds but should take hours."
              },
              {
                title: "Navigate without any GPS or radio signal",
                color: P.blue,
                body: "Magnetite (Fe₃O₄) nanocrystals in spinel lattice give every bot a magnetic position sense accurate to the micron. Plasmodium tube-reinforcement optimization gives the swarm optimal routing through any vascular topology — no external signal, no radiation, no infrastructure."
              },
            ].map((item) => (
              <div key={item.title} style={{ padding: "20px 22px", border: `1px solid ${item.color}22`, borderRadius: 12, background: `${item.color}06` }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: item.color, marginBottom: 10 }}>{item.title}</div>
                <p style={{ margin: 0, fontSize: 12, color: "#6A8A88", lineHeight: 1.75 }}>{item.body}</p>
              </div>
            ))}
          </div>
        </div>

        {/* ── Architecture stack ── */}
        <div style={{ marginBottom: 40, padding: "24px 28px", border: `1px solid ${P.border}`, borderRadius: 14, background: P.panel }}>
          <div style={{ fontSize: 10, color: P.cyan, letterSpacing: "0.22em", textTransform: "uppercase", marginBottom: 20, fontWeight: 700 }}>── System Architecture — Five Layers</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
            {[
              { layer: "L5", name: "Coherence Intelligence Layer", color: P.gold, desc: "Master C(x,t) equation. All robotic decisions derived here. Coherence field computed across body in real time." },
              { layer: "L4", name: "Biophotonic Sensing Layer", color: P.violet, desc: "60-cell biophoton emission monitor. Q-factor analysis. Early disease detection 8–12 hrs ahead of biochemistry." },
              { layer: "L3", name: "Neural-Motor Interface Layer", color: P.blue, desc: "Utah-array decoding + Kalman filter + spinal relay. Exoskeleton control at ±0.1 Nm precision." },
              { layer: "L2", name: "Nano-Robotic Execution Layer", color: P.cyan, desc: "24 graphene-shell bots. Magnetite navigation. Plasmodium-optimised routing. Drug delivery + DNA repair." },
              { layer: "L1", name: "Energy Foundation Layer", color: P.green, desc: "Solar GPCR harvest + EZ water computation + lunar tidal graphene loop. Zero external power dependency." },
            ].map((row, i, arr) => (
              <div key={row.layer} style={{
                display: "flex", gap: 16, alignItems: "flex-start", padding: "16px 20px",
                borderLeft: `3px solid ${row.color}`,
                borderBottom: i < arr.length - 1 ? `1px solid ${P.border}` : "none",
                background: i % 2 === 0 ? "rgba(255,255,255,0.01)" : "transparent",
              }}>
                <div style={{ minWidth: 28, fontSize: 12, fontWeight: 800, color: row.color, fontFamily: "monospace" }}>{row.layer}</div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 12, fontWeight: 700, color: P.white, marginBottom: 4 }}>{row.name}</div>
                  <div style={{ fontSize: 11, color: "#6A8A88", lineHeight: 1.6 }}>{row.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ── Footer links ── */}
        <div style={{ display: "flex", gap: 12, flexWrap: "wrap", paddingTop: 8, borderTop: `1px solid ${P.border}` }}>
          {[["→ Cancer Coherence", "/cancer-coherence"], ["→ Field Healer", "/field-healer"],
            ["→ Bioluminescence Spectrum", "/wood-frog-biophotonics"], ["→ Neural Signal", "/neural-signal"],
            ["→ Seismic Self-Build", "/seismic-self-build"], ["→ Coherent Body", "/coherent-body"],
            ["→ AETHER Health", "/aether-health"], ["→ Nutritional DNA Key", "/nutritional-dna-key"],
          ].map(([label, href]) => (
            <a key={String(href)} href={String(href)} style={{ fontSize: 11, color: P.muted, textDecoration: "none", padding: "4px 0" }}
              onMouseEnter={e => (e.currentTarget.style.color = P.cyan)}
              onMouseLeave={e => (e.currentTarget.style.color = P.muted)}>
              {String(label)}
            </a>
          ))}
        </div>
      </div>
    </div>
  );
}
