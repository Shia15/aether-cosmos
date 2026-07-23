/*═══════════════════════════════════════════════════════════════
  Blueprint Systems Decoupling · Open-Air Fluid Computer
  Engineering Topology Stack · EZ Water Energy Substrate
  Control-Theory Feedback Pipeline

  Source conversations:
    – chatgpt.com/share/6a5fbd4c (Blueprint Decoupling / Topology Stack)
    – chatgpt.com/share/6a5fbd08 (Pollack EZ Water / docx publishing engine)

  Three canvases:
  I.  Engineering Topology Stack — 5-layer animated flow with feedback
  II. EZ Water Energy Cell — Pollack IR→EZ→charge→pulse→recharge cycle
  III.Control-Theory Loop — circular pipeline: Env→Capture→Assess→Process→Actuate
═══════════════════════════════════════════════════════════════*/
import { useRef, useEffect, useState } from "react";
const omniFlow = "/api/storage/public-objects/72D555D1-E91E-4B74-A73B-4628B8538AA1_1784561445345.png";
const magStorm = "/api/storage/public-objects/A6805E91-9684-4C59-BFC8-482EF421381D_1784561445345.png";
const skyrmion = "/api/storage/public-objects/IMG_4534_1784561445345.png";
/* ── palette ── */
const BG = "#02030d";
const PANEL = "#060818";
const IVORY = "#f0eeff";
const DIM = "rgba(240,238,255,0.52)";
const MUTED = "rgba(240,238,255,0.26)";
const LINE = "rgba(120,130,255,0.10)";
const GOLD = "#f5c84c";
const CYAN = "#22d3ee";
const VIOLET = "#a78bfa";
const BLUE = "#60a5fa";
const TEAL = "#2dd4bf";
const GREEN = "#4ade80";
const ORANGE = "#fb923c";
const RED = "#f87171";

/* ── shared helpers ── */
function Tag({ t, c = GOLD }: { t: string; c?: string }) {
  return <div style={{ fontSize: 9, fontWeight: 700, color: c, letterSpacing: 2, textTransform: "uppercase" as const, marginBottom: 10 }}>{t}</div>;
}
function Divider() { return <div style={{ height: 1, background: LINE, margin: "44px 0" }} />; }
function kx(s: object) { return s; }

/* ══════════════════════════════════════════════════════════
   CANVAS I — Engineering Topology Stack
   5 layers CAPTURE / ASSESS / PROCESS / CONTROL / ADAPT
   Particles fall through layers, some loop back via feedback
══════════════════════════════════════════════════════════ */
function TopoStackCanvas() {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const cv = ref.current; if (!cv) return;
    const ctx = cv.getContext("2d")!;
    let raf = 0;
    const ro = new ResizeObserver(() => { cv.width = cv.offsetWidth; cv.height = cv.offsetHeight; });
    ro.observe(cv); cv.width = cv.offsetWidth; cv.height = cv.offsetHeight;

    const LAYERS = [
      { label: "CAPTURE", sub: "LIDAR · Thermal · IR arrays",        col: CYAN,   },
      { label: "ASSESS",  sub: "Pattern recognition · Data filter",   col: BLUE,   },
      { label: "PROCESS", sub: "Fluid computation · Coherence",       col: VIOLET, },
      { label: "CONTROL", sub: "Actuation · Output formation",        col: GOLD,   },
      { label: "ADAPT",   sub: "Feedback · Entropy correction",       col: GREEN,  },
    ];

    const particles: { x: number; y: number; vy: number; vx: number; col: string; alpha: number; r: number; feedback: boolean }[] = [];

    function spawnParticle(W: number) {
      const isF = Math.random() < 0.18;
      const h = cv.height;
      particles.push({
        x: W * (0.1 + Math.random() * 0.8),
        y: isF ? h * 0.95 : 0,
        vy: isF ? -(0.6 + Math.random() * 0.8) : (0.6 + Math.random() * 0.8),
        vx: (Math.random() - 0.5) * 0.4,
        col: LAYERS[Math.floor(Math.random() * LAYERS.length)].col,
        alpha: 0.7 + Math.random() * 0.3,
        r: 2 + Math.random() * 2.5,
        feedback: isF,
      });
    }

    let tick = 0;
    function draw() {
      const W = cv.width, H = cv.height;
      ctx.clearRect(0, 0, W, H);
      const bgG = ctx.createLinearGradient(0, 0, 0, H);
      bgG.addColorStop(0, "#02030d"); bgG.addColorStop(1, "#050818");
      ctx.fillStyle = bgG; ctx.fillRect(0, 0, W, H);

      const LH = H / LAYERS.length;

      // Layer bands
      LAYERS.forEach((layer, i) => {
        const y = i * LH;
        // subtle gradient band
        const bg = ctx.createLinearGradient(0, y, 0, y + LH);
        bg.addColorStop(0, layer.col + "08"); bg.addColorStop(1, layer.col + "02");
        ctx.fillStyle = bg; ctx.fillRect(0, y, W, LH);
        // divider line
        ctx.strokeStyle = layer.col + "33"; ctx.lineWidth = 1;
        ctx.beginPath(); ctx.moveTo(0, y + LH); ctx.lineTo(W, y + LH); ctx.stroke();
        // label
        ctx.fillStyle = layer.col; ctx.font = "bold 11px monospace"; ctx.textAlign = "left";
        ctx.fillText(layer.label, 14, y + 18);
        ctx.fillStyle = layer.col + "80"; ctx.font = "9px monospace";
        ctx.fillText(layer.sub, 14, y + 32);
        // left border accent
        ctx.fillStyle = layer.col + "cc";
        ctx.fillRect(0, y, 3, LH);
      });

      // Feedback arrow on right
      ctx.strokeStyle = GREEN + "55"; ctx.lineWidth = 1.5;
      ctx.setLineDash([4, 3]);
      ctx.beginPath();
      ctx.moveTo(W - 20, H * 0.95);
      ctx.lineTo(W - 20, H * 0.05);
      ctx.stroke();
      ctx.setLineDash([]);
      // arrow head up
      ctx.fillStyle = GREEN + "aa";
      ctx.beginPath();
      ctx.moveTo(W - 20, H * 0.05);
      ctx.lineTo(W - 25, H * 0.05 + 10);
      ctx.lineTo(W - 15, H * 0.05 + 10);
      ctx.closePath(); ctx.fill();
      ctx.fillStyle = GREEN + "80"; ctx.font = "8px monospace"; ctx.textAlign = "right";
      ctx.fillText("FEEDBACK", W - 25, H * 0.5);

      // Spawn + move particles
      if (tick % 4 === 0) spawnParticle(W);
      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        p.x += p.vx; p.y += p.vy;
        if (p.feedback) {
          if (p.y < -10) { particles.splice(i, 1); continue; }
        } else {
          if (p.y > H + 10) { particles.splice(i, 1); continue; }
        }
        const grd = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.r * 4);
        grd.addColorStop(0, p.col + "bb"); grd.addColorStop(1, p.col + "00");
        ctx.fillStyle = grd;
        ctx.beginPath(); ctx.arc(p.x, p.y, p.r * 4, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = p.col;
        ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2); ctx.fill();
      }
      if (particles.length > 180) particles.splice(0, 10);

      // HUD
      ctx.fillStyle = GOLD + "99"; ctx.font = "bold 9px monospace"; ctx.textAlign = "right";
      ctx.fillText("OPEN-AIR FLUID COMPUTER · TOPOLOGY STACK", W - 8, H - 8);

      tick++; raf = requestAnimationFrame(draw);
    }
    draw();
    return () => { cancelAnimationFrame(raf); ro.disconnect(); };
  }, []);
  return (
    <div style={{ border: `1px solid ${LINE}`, borderRadius: 12, overflow: "hidden" }}>
      <canvas ref={ref} style={{ width: "100%", height: 320, display: "block" }} />
    </div>
  );
}

/* ══════════════════════════════════════════════════════════
   CANVAS II — EZ Water Energy Cell
   Pollack infrared absorption → exclusion zone → charge
   separation → electrochemical potential → combustion pulse
   → passive recharge from ambient thermal/solar
══════════════════════════════════════════════════════════ */
function EZWaterCanvas() {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const cv = ref.current; if (!cv) return;
    const ctx = cv.getContext("2d")!;
    let raf = 0, t = 0;
    const ro = new ResizeObserver(() => { cv.width = cv.offsetWidth; cv.height = cv.offsetHeight; });
    ro.observe(cv); cv.width = cv.offsetWidth; cv.height = cv.offsetHeight;

    // Photon rays
    const photons: { x: number; y: number; vx: number; vy: number; alpha: number; absorbed: boolean }[] = [];
    for (let i = 0; i < 12; i++) {
      photons.push({ x: Math.random() * 400 - 200, y: -20 - Math.random() * 80, vx: (Math.random() - 0.5) * 0.3, vy: 1.2 + Math.random() * 0.6, alpha: 1, absorbed: false });
    }

    let pulseT = 0;

    function draw() {
      const W = cv.width, H = cv.height;
      ctx.clearRect(0, 0, W, H);
      ctx.fillStyle = "#02030d"; ctx.fillRect(0, 0, W, H);

      // Sun / ambient heat source top
      const sunX = W * 0.5, sunY = 28;
      const sunGrd = ctx.createRadialGradient(sunX, sunY, 0, sunX, sunY, 60);
      sunGrd.addColorStop(0, "rgba(255,200,60,0.6)"); sunGrd.addColorStop(1, "rgba(255,120,0,0)");
      ctx.fillStyle = sunGrd; ctx.beginPath(); ctx.arc(sunX, sunY, 60, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = GOLD; ctx.font = "bold 9px monospace"; ctx.textAlign = "center";
      ctx.fillText("IR 3000 nm  ·  AMBIENT SOLAR  ·  THERMAL", W * 0.5, 56);

      // IR photon beams
      photons.forEach(ph => {
        ph.x = ph.x < 0 ? W + ph.x : ph.x;
        ph.y += ph.vy; ph.x += ph.vx;
        if (ph.y < 0) ph.y = -20 - Math.random() * 80;
        const ezBoundary = H * 0.38;
        if (!ph.absorbed && ph.y > ezBoundary) { ph.absorbed = true; ph.y = ezBoundary; }
        if (ph.absorbed) {
          ph.alpha = Math.max(0, ph.alpha - 0.04);
          if (ph.alpha <= 0) {
            ph.y = -20 - Math.random() * 80;
            ph.x = Math.random() * W;
            ph.alpha = 1; ph.absorbed = false;
          }
        }
        const len = 12;
        const grd = ctx.createLinearGradient(ph.x, ph.y - len, ph.x, ph.y);
        grd.addColorStop(0, `rgba(255,100,0,0)`);
        grd.addColorStop(1, `rgba(255,160,40,${ph.alpha * 0.8})`);
        ctx.strokeStyle = grd; ctx.lineWidth = 2;
        ctx.beginPath(); ctx.moveTo(ph.x, ph.y - len); ctx.lineTo(ph.x, ph.y); ctx.stroke();
      });

      // EZ (Exclusion Zone) gel layer
      const ezY = H * 0.38, ezH = H * 0.2;
      const ezGrd = ctx.createLinearGradient(0, ezY, 0, ezY + ezH);
      ezGrd.addColorStop(0, "rgba(34,211,238,0.22)");
      ezGrd.addColorStop(1, "rgba(96,165,250,0.08)");
      ctx.fillStyle = ezGrd; ctx.fillRect(0, ezY, W, ezH);
      ctx.strokeStyle = CYAN + "66"; ctx.lineWidth = 1;
      ctx.beginPath(); ctx.moveTo(0, ezY); ctx.lineTo(W, ezY); ctx.stroke();
      ctx.fillStyle = CYAN; ctx.font = "bold 10px monospace"; ctx.textAlign = "left";
      ctx.fillText("EXCLUSION ZONE (EZ)  ·  H₂O liquid crystal gel", 12, ezY + 16);
      ctx.fillStyle = CYAN + "80"; ctx.font = "9px monospace";
      ctx.fillText("Ordered proton lattice  ·  negative charge layer  ·  excludes solutes", 12, ezY + 30);

      // Bulk water below
      const bulkY = ezY + ezH;
      const bulkGrd = ctx.createLinearGradient(0, bulkY, 0, H);
      bulkGrd.addColorStop(0, "rgba(96,165,250,0.12)"); bulkGrd.addColorStop(1, "rgba(96,165,250,0.02)");
      ctx.fillStyle = bulkGrd; ctx.fillRect(0, bulkY, W, H - bulkY);
      ctx.strokeStyle = BLUE + "44"; ctx.lineWidth = 1;
      ctx.beginPath(); ctx.moveTo(0, bulkY); ctx.lineTo(W, bulkY); ctx.stroke();
      ctx.fillStyle = BLUE; ctx.font = "bold 10px monospace"; ctx.textAlign = "left";
      ctx.fillText("BULK WATER  ·  positive proton-rich zone", 12, bulkY + 16);

      // Charge separation arrows
      const arrowX = W * 0.82;
      ctx.strokeStyle = RED + "cc"; ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(arrowX, bulkY + 10);
      ctx.lineTo(arrowX, bulkY + 32);
      ctx.stroke();
      ctx.fillStyle = RED;
      ctx.beginPath();
      ctx.moveTo(arrowX, bulkY + 36);
      ctx.lineTo(arrowX - 5, bulkY + 26);
      ctx.lineTo(arrowX + 5, bulkY + 26);
      ctx.closePath(); ctx.fill();
      ctx.fillStyle = RED; ctx.font = "bold 9px monospace"; ctx.textAlign = "right";
      ctx.fillText("+ H⁺ ions", arrowX - 8, bulkY + 28);

      ctx.strokeStyle = CYAN + "cc"; ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(arrowX, ezY + ezH - 10);
      ctx.lineTo(arrowX, ezY + ezH - 32);
      ctx.stroke();
      ctx.fillStyle = CYAN;
      ctx.beginPath();
      ctx.moveTo(arrowX, ezY + ezH - 36);
      ctx.lineTo(arrowX - 5, ezY + ezH - 26);
      ctx.lineTo(arrowX + 5, ezY + ezH - 26);
      ctx.closePath(); ctx.fill();
      ctx.fillStyle = CYAN; ctx.font = "bold 9px monospace"; ctx.textAlign = "right";
      ctx.fillText("− charge (EZ)", arrowX - 8, ezY + ezH - 28);

      // Voltage label
      const Vpot = (0.15 + 0.05 * Math.sin(t * 0.03)).toFixed(3);
      ctx.fillStyle = GOLD; ctx.font = "bold 11px monospace"; ctx.textAlign = "center";
      ctx.fillText(`ΔV = ${Vpot} V  ·  Electrochemical Potential`, W * 0.5, ezY + ezH + 36);

      // Combustion pulse
      pulseT++;
      if (pulseT % 180 < 18) {
        const pr = ((pulseT % 180) / 18);
        const flashAlpha = Math.sin(pr * Math.PI) * 0.7;
        const pGrd = ctx.createRadialGradient(W * 0.5, bulkY, 0, W * 0.5, bulkY, 80 * pr);
        pGrd.addColorStop(0, `rgba(255,200,60,${flashAlpha})`);
        pGrd.addColorStop(0.5, `rgba(255,100,0,${flashAlpha * 0.5})`);
        pGrd.addColorStop(1, `rgba(255,60,0,0)`);
        ctx.fillStyle = pGrd; ctx.beginPath(); ctx.arc(W * 0.5, bulkY, 80 * pr, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = `rgba(255,200,60,${flashAlpha})`; ctx.font = "bold 13px monospace"; ctx.textAlign = "center";
        ctx.fillText("COMBUSTION PULSE · ENERGY RELEASE", W * 0.5, bulkY + 55);
      }

      // Passive recharge label
      ctx.fillStyle = GREEN + "99"; ctx.font = "9px monospace"; ctx.textAlign = "left";
      ctx.fillText("↻ PASSIVE RECHARGE · Ambient thermal + solar radiation", 12, H - 12);

      t++; raf = requestAnimationFrame(draw);
    }
    draw();
    return () => { cancelAnimationFrame(raf); ro.disconnect(); };
  }, []);
  return (
    <div style={{ border: `1px solid ${LINE}`, borderRadius: 12, overflow: "hidden" }}>
      <canvas ref={ref} style={{ width: "100%", height: 360, display: "block" }} />
    </div>
  );
}

/* ══════════════════════════════════════════════════════════
   CANVAS III — Control-Theory Feedback Pipeline
   Circular loop: ENVIRONMENT → CAPTURE → ASSESS →
   PROCESS → ACTUATE → back to ENVIRONMENT
   Error signal node at top, correction node at bottom
══════════════════════════════════════════════════════════ */
function ControlLoopCanvas() {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const cv = ref.current; if (!cv) return;
    const ctx = cv.getContext("2d")!;
    let raf = 0, t = 0;
    const ro = new ResizeObserver(() => { cv.width = cv.offsetWidth; cv.height = cv.offsetHeight; });
    ro.observe(cv); cv.width = cv.offsetWidth; cv.height = cv.offsetHeight;

    const NODES = [
      { label: "ENVIRONMENT", sub: "Open-air field",     col: TEAL   },
      { label: "CAPTURE",     sub: "LIDAR · thermal",    col: CYAN   },
      { label: "ASSESS",      sub: "Pattern filter",     col: BLUE   },
      { label: "PROCESS",     sub: "Fluid compute",      col: VIOLET },
      { label: "ACTUATE",     sub: "Control output",     col: GOLD   },
    ];

    const particles: { angle: number; speed: number; col: string; r: number }[] = [];
    for (let i = 0; i < 28; i++) {
      particles.push({ angle: (i / 28) * Math.PI * 2, speed: 0.008 + Math.random() * 0.008, col: NODES[i % NODES.length].col, r: 2 + Math.random() * 2 });
    }

    function draw() {
      const W = cv.width, H = cv.height;
      ctx.clearRect(0, 0, W, H);
      ctx.fillStyle = BG; ctx.fillRect(0, 0, W, H);

      const cx = W * 0.5, cy = H * 0.5;
      const R = Math.min(W, H) * 0.34;

      // Ring
      ctx.strokeStyle = LINE; ctx.lineWidth = 60;
      ctx.beginPath(); ctx.arc(cx, cy, R, 0, Math.PI * 2); ctx.stroke();

      // Node positions (evenly spaced around ring)
      const nodePos = NODES.map((_, i) => ({
        x: cx + R * Math.cos((i / NODES.length) * Math.PI * 2 - Math.PI / 2),
        y: cy + R * Math.sin((i / NODES.length) * Math.PI * 2 - Math.PI / 2),
      }));

      // Directional arrows between nodes
      for (let i = 0; i < NODES.length; i++) {
        const a = nodePos[i], b = nodePos[(i + 1) % NODES.length];
        const mx = (a.x + b.x) / 2, my = (a.y + b.y) / 2;
        const ang = Math.atan2(b.y - a.y, b.x - a.x);
        ctx.strokeStyle = NODES[i].col + "55"; ctx.lineWidth = 2;
        ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.stroke();
        // arrow
        ctx.fillStyle = NODES[i].col + "88";
        ctx.save(); ctx.translate(mx, my); ctx.rotate(ang);
        ctx.beginPath(); ctx.moveTo(6, 0); ctx.lineTo(-4, -4); ctx.lineTo(-4, 4); ctx.closePath(); ctx.fill();
        ctx.restore();
      }

      // Move particles along ring
      particles.forEach(p => {
        p.angle += p.speed;
        const px = cx + R * Math.cos(p.angle);
        const py = cy + R * Math.sin(p.angle);
        const grd = ctx.createRadialGradient(px, py, 0, px, py, p.r * 4);
        grd.addColorStop(0, p.col + "cc"); grd.addColorStop(1, p.col + "00");
        ctx.fillStyle = grd; ctx.beginPath(); ctx.arc(px, py, p.r * 4, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = p.col; ctx.beginPath(); ctx.arc(px, py, p.r, 0, Math.PI * 2); ctx.fill();
      });

      // Draw nodes
      nodePos.forEach((pos, i) => {
        const node = NODES[i];
        const glow = ctx.createRadialGradient(pos.x, pos.y, 0, pos.x, pos.y, 32);
        glow.addColorStop(0, node.col + "33"); glow.addColorStop(1, node.col + "00");
        ctx.fillStyle = glow; ctx.beginPath(); ctx.arc(pos.x, pos.y, 32, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = PANEL; ctx.strokeStyle = node.col; ctx.lineWidth = 2;
        ctx.beginPath(); ctx.arc(pos.x, pos.y, 22, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
        ctx.fillStyle = node.col; ctx.font = "bold 7px monospace"; ctx.textAlign = "center";
        ctx.fillText(node.label, pos.x, pos.y + 2);
        ctx.fillStyle = node.col + "80"; ctx.font = "6px monospace";
        ctx.fillText(node.sub, pos.x, pos.y + 11);
      });

      // Centre: error + correction
      const errPulse = 0.7 + 0.3 * Math.sin(t * 0.05);
      ctx.fillStyle = `rgba(167,139,250,${errPulse * 0.15})`;
      ctx.beginPath(); ctx.arc(cx, cy, 44, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = VIOLET; ctx.font = "bold 9px monospace"; ctx.textAlign = "center";
      ctx.fillText("Σ ERROR", cx, cy - 6);
      ctx.fillStyle = VIOLET + "80"; ctx.font = "7px monospace";
      ctx.fillText("CORRECTION", cx, cy + 6);
      ctx.fillText("SIGNAL", cx, cy + 15);

      // Title
      ctx.fillStyle = GOLD + "99"; ctx.font = "bold 9px monospace"; ctx.textAlign = "center";
      ctx.fillText("CONTROL-THEORY PIPELINE · CONTINUOUS FEEDBACK", cx, H - 10);

      t++; raf = requestAnimationFrame(draw);
    }
    draw();
    return () => { cancelAnimationFrame(raf); ro.disconnect(); };
  }, []);
  return (
    <div style={{ border: `1px solid ${LINE}`, borderRadius: 12, overflow: "hidden" }}>
      <canvas ref={ref} style={{ width: "100%", height: 380, display: "block" }} />
    </div>
  );
}

/* ── Equation chip ── */
function EqChip({ eq, label, col = GOLD }: { eq: string; label: string; col?: string }) {
  return (
    <div style={{ padding: "12px 16px", background: PANEL, borderRadius: 10, border: `1px solid ${col}20` }}>
      <div style={{ fontFamily: "monospace", fontSize: 13, color: col, marginBottom: 6 }}>{eq}</div>
      <div style={{ fontSize: 11, color: DIM }}>{label}</div>
    </div>
  );
}

/* ── Source plate ── */
function Plate({ src, title, chips, body }: { src: string; title: string; chips: string[]; body: string }) {
  const [exp, setExp] = useState(false);
  return (
    <div style={{ border: `1px solid ${LINE}`, borderRadius: 12, overflow: "hidden", marginBottom: 24 }}>
      <img src={src} alt={title} onClick={() => setExp(x => !x)}
        style={{ width: "100%", display: "block", cursor: "zoom-in", maxHeight: exp ? "none" : 280, objectFit: "cover" as const }} />
      <div style={{ padding: "14px 18px", background: PANEL }}>
        <div style={{ fontSize: 12, fontWeight: 700, color: VIOLET, marginBottom: 8 }}>{title}</div>
        <div style={{ display: "flex", gap: 5, flexWrap: "wrap" as const, marginBottom: 10 }}>
          {chips.map((c, i) => (
            <span key={i} style={{ fontSize: 10, padding: "2px 8px", borderRadius: 12, border: `1px solid ${VIOLET}33`, color: VIOLET, background: VIOLET + "0f" }}>{c}</span>
          ))}
        </div>
        <div style={{ fontSize: 12, color: DIM, lineHeight: 1.85 }}>{body}</div>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════
   MAIN PAGE
══════════════════════════════════════════════════════════ */
export default function BlueprintDecouplingPage() {
  const LAYERS_INFO = [
    { n: "L1", label: "Capture", col: CYAN,   desc: "Ground-based LIDAR fields, thermal tracking arrays, and IR-sensitive receivers ingest raw environmental data — high-frequency, high-dimensionality streams from an entropic unpredictable field.", eq: "S_in = LIDAR(r,θ,φ) ⊕ T_array(x,y)" },
    { n: "L2", label: "Assess",  col: BLUE,   desc: "Pattern recognition filters reduce the captured stream to coherent signal. Noise is separated from structure. Data is typed — thermal, acoustic, optical, chemical — and tagged for routing to the correct processor.", eq: "A = σ(W·S_in + b)  ·  relevance gate" },
    { n: "L3", label: "Process", col: VIOLET, desc: "The fluid computation layer — the core of the open-air computer. Input vectors flow through a coherence engine: spatial gradients are mapped, pressure differentials computed, and EZ water electrochemical potential is integrated as an energy substrate.", eq: "C(x,t) = A(x)·e^{i(φ−ωt)}  ·  Q = ω/Δω" },
    { n: "L4", label: "Control", col: GOLD,   desc: "Output formation. Actuation signals are generated: mechanical, electromagnetic, acoustic, or thermal. The control layer applies the correction signal computed by the error node — the difference between desired and actual field state.", eq: "u(t) = K_p·e + K_i·∫e dt + K_d·ė" },
    { n: "L5", label: "Adapt",   col: GREEN,  desc: "The feedback tier. Adaptation signals loop back to the Capture layer, modifying sensor sensitivity, scan patterns, and data-type priorities based on what the system has learned in this cycle. Entropy correction — the system moves toward coherence.", eq: "ΔW = η · δ · ∂C/∂W  ·  entropic correction" },
  ];

  return (
    <div style={{ background: BG, color: IVORY, minHeight: "100vh" }}>
      <div style={{ maxWidth: 1060, margin: "0 auto", padding: "52px 32px 36px" }}>
        <Tag t="Blueprint Systems Decoupling · Open-Air Fluid Computer · Engineering Topology Stack · EZ Water Energy · Control-Theory Pipeline" />
        <h1 style={{ fontSize: 36, fontWeight: 800, lineHeight: 1.1, margin: "8px 0 14px", letterSpacing: -0.5 }}>
          <span style={{ color: CYAN }}>Blueprint</span><br />
          <span style={{ color: VIOLET }}>Systems</span> <span style={{ color: GOLD }}>Decoupling</span>
        </h1>
        <h2 style={{ fontSize: 17, fontWeight: 400, color: TEAL, margin: "0 0 20px", lineHeight: 1.6 }}>
          Open-Air Fluid Computer · Engineering Topology Stack
        </h2>
        <p style={{ fontSize: 13, color: DIM, lineHeight: 1.9, maxWidth: 820, marginBottom: 12 }}>
          Blueprint Systems Decoupling is the act of taking an intuitive system — one that started as a series of connected insights — and formalising it into a set of distinct, independently operable abstraction tiers. Each tier has a clear input contract, a defined transformation, and an output format that the next tier can consume without knowing the internal mechanics of the layer above it. The whole stack forms a <em style={{ color: CYAN }}>legitimate control-theory pipeline</em>: the environment is the plant, each layer is a filter and controller, the feedback loop is the integrator that prevents steady-state error. The result is an <em style={{ color: GOLD }}>open-air fluid computer</em> — a system that turns an entropic, unpredictable physical environment into ordered, programmable computation.
        </p>
        <p style={{ fontSize: 13, color: DIM, lineHeight: 1.9, maxWidth: 820 }}>
          The energy substrate for this computation is Pollack's EZ water: infrared radiation (particularly near 3000 nm) is absorbed by interfacial water, driving the formation of an exclusion zone — a liquid-crystalline gel layer with a structured proton lattice. This creates a charge separation of ~150–200 mV across the EZ boundary. The stored electrochemical potential is released during combustion pulse events and recharged passively from ambient thermal and solar radiation. EZ water is, in this sense, a biological battery — continuously charged by the environment, continuously available to the computational engine.
        </p>
      </div>

      {/* Canvas I */}
      <div style={{ maxWidth: 1060, margin: "0 auto", padding: "0 32px 48px" }}>
        <Tag t="Section I · Engineering Topology Stack · 5-Layer Abstraction · Continuous Data Flow · Feedback Loop" c={CYAN} />
        <h2 style={{ fontSize: 20, fontWeight: 700, color: CYAN, marginBottom: 14 }}>Live Engineering Topology Stack</h2>
        <TopoStackCanvas />
        <div style={{ marginTop: 10, fontSize: 10, color: MUTED, textAlign: "center" as const }}>
          Particles flow downward (data forward) · Green particles loop back (feedback) · Each layer band shows its processing role
        </div>
      </div>

      <Divider />

      {/* Layer breakdown */}
      <div style={{ maxWidth: 1060, margin: "0 auto", padding: "0 32px 48px" }}>
        <Tag t="Section II · Layer Breakdown · L1–L5 · Equations · AETHER Coherence Integration" c={VIOLET} />
        <h2 style={{ fontSize: 20, fontWeight: 700, color: VIOLET, marginBottom: 20 }}>The Five Abstraction Tiers</h2>
        <div style={{ display: "flex", flexDirection: "column" as const, gap: 16 }}>
          {LAYERS_INFO.map(layer => (
            <div key={layer.n} style={{ display: "grid", gridTemplateColumns: "72px 1fr 280px", gap: 16, alignItems: "start",
              padding: "18px 20px", background: PANEL, borderRadius: 12, border: `1px solid ${layer.col}18` }}>
              <div>
                <div style={{ fontSize: 22, fontWeight: 800, color: layer.col, marginBottom: 4 }}>{layer.n}</div>
                <div style={{ fontSize: 11, fontWeight: 700, color: layer.col, letterSpacing: 1 }}>{layer.label.toUpperCase()}</div>
                <div style={{ width: 3, height: 40, background: layer.col, borderRadius: 2, marginTop: 8 }} />
              </div>
              <div style={{ fontSize: 12, color: DIM, lineHeight: 1.85 }}>{layer.desc}</div>
              <div style={{ fontFamily: "monospace", fontSize: 11, color: layer.col, background: layer.col + "08",
                padding: "10px 12px", borderRadius: 8, border: `1px solid ${layer.col}20`, lineHeight: 1.8 }}>{layer.eq}</div>
            </div>
          ))}
        </div>
      </div>

      <Divider />

      {/* Canvas II */}
      <div style={{ maxWidth: 1060, margin: "0 auto", padding: "0 32px 48px" }}>
        <Tag t="Section III · EZ Water Energy Cell · Pollack Exclusion Zone · IR 3000nm · Electrochemical Potential · Combustion Pulse" c={BLUE} />
        <h2 style={{ fontSize: 20, fontWeight: 700, color: BLUE, marginBottom: 14 }}>EZ Water Energy Substrate · Pollack's Exclusion Zone</h2>
        <EZWaterCanvas />
        <div style={{ marginTop: 10, fontSize: 10, color: MUTED, textAlign: "center" as const }}>
          Orange beams = IR photons · Cyan band = EZ gel zone · Blue = bulk water · Flash = combustion pulse energy release
        </div>
      </div>

      <Divider />

      {/* EZ equations */}
      <div style={{ maxWidth: 1060, margin: "0 auto", padding: "0 32px 48px" }}>
        <Tag t="Section IV · EZ Water Equations · Energy Storage · Charge Separation · Recharge" c={ORANGE} />
        <h2 style={{ fontSize: 20, fontWeight: 700, color: ORANGE, marginBottom: 20 }}>EZ Water · Governing Relations</h2>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(260px,1fr))", gap: 14, marginBottom: 20 }}>
          <EqChip eq="E_EZ = ΔV · q · N_EZ" label="Energy stored in EZ layer — voltage difference × charge × proton count" col={CYAN} />
          <EqChip eq="ΔV ≈ 150–200 mV" label="Measured EZ boundary potential (Pollack 2013) — akin to mitochondrial membrane potential" col={BLUE} />
          <EqChip eq="λ_abs ≈ 3000 nm (IR)" label="Peak absorption wavelength for EZ formation — near infrared, sunlight and ambient thermal" col={ORANGE} />
          <EqChip eq="J_EZ ∝ I_IR · A_EZ" label="EZ formation rate proportional to IR irradiance × exclusion-zone interface area" col={GOLD} />
          <EqChip eq="P_pulse = E_EZ / τ_pulse" label="Combustion pulse power — stored EZ energy released over pulse duration" col={RED} />
          <EqChip eq="dE/dt = P_solar + P_thermal − P_load" label="Net recharge rate — passive ambient replenishment minus computational load draw" col={GREEN} />
        </div>
        <div style={{ padding: "16px 20px", background: PANEL, borderRadius: 12, border: `1px solid ${ORANGE}15` }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: ORANGE, marginBottom: 8 }}>Pollack's research implications for the open-air fluid computer</div>
          <div style={{ fontSize: 12, color: DIM, lineHeight: 1.9 }}>
            EZ water is not a passive medium — it is an active electrochemical processor. When infrared light hits an interfacial water surface, the exclusion zone grows, protons are expelled into bulk water, and a charge gradient forms spontaneously without any external electrical input. This is the free-energy source for the open-air fluid computer: every wet surface in the environment (leaves, soil, membrane structures) is a potential EZ energy cell, passively charging from sunlight and ambient thermal radiation, available to drive the Capture and Process layers of the engineering topology stack.
          </div>
        </div>
      </div>

      <Divider />

      {/* Canvas III */}
      <div style={{ maxWidth: 1060, margin: "0 auto", padding: "0 32px 48px" }}>
        <Tag t="Section V · Control-Theory Pipeline · Continuous Feedback · Error Signal · Correction Node" c={VIOLET} />
        <h2 style={{ fontSize: 20, fontWeight: 700, color: VIOLET, marginBottom: 14 }}>Control-Theory Feedback Pipeline</h2>
        <ControlLoopCanvas />
        <div style={{ marginTop: 10, fontSize: 10, color: MUTED, textAlign: "center" as const }}>
          Particles flow clockwise through the pipeline · Centre Σ node computes error between desired and actual field state · Feedback corrects Capture sensitivity
        </div>
      </div>

      <Divider />

      {/* Composable rendering / docx architecture note */}
      <div style={{ maxWidth: 1060, margin: "0 auto", padding: "0 32px 48px" }}>
        <Tag t="Section VI · Composable Rendering Objects · Publishing Architecture · Document Engine" c={GOLD} />
        <h2 style={{ fontSize: 20, fontWeight: 700, color: GOLD, marginBottom: 16 }}>Blueprint as Publishing Engine</h2>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(240px,1fr))", gap: 14, marginBottom: 22 }}>
          {[
            { label: "Visual Design Language", col: CYAN,   desc: "The blueprint defines a complete visual grammar — tokens, palettes, type hierarchies — that encode scientific meaning into form. Every colour is a state, every icon a semantic unit." },
            { label: "UI Primitive Library",   col: VIOLET, desc: "Reusable scientific-paper primitives: equation chips, canvas sections, annotation panels, plate images. Composable objects that assemble into manuscripts without reimplementing structure." },
            { label: "Physics Manuscript Pipeline", col: BLUE, desc: "A document generation architecture that treats the physics itself as data — equations rendered from their symbolic form, figures generated from live simulations, sections ordered by logical dependency." },
            { label: "Composable Rendering Objects", col: GOLD, desc: "Each block — equation, canvas, text section, figure — is a typed rendering object with a clear interface. Compose them like code: no coupling between presentation and content." },
          ].map((item, i) => (
            <div key={i} style={{ padding: "16px 16px", background: PANEL, borderRadius: 12, border: `1px solid ${item.col}18` }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: item.col, marginBottom: 8 }}>{item.label}</div>
              <div style={{ fontSize: 11, color: DIM, lineHeight: 1.8 }}>{item.desc}</div>
            </div>
          ))}
        </div>
        <div style={{ padding: "16px 20px", background: PANEL, borderRadius: 12, border: `1px solid ${GOLD}15` }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: GOLD, marginBottom: 8 }}>Blueprint Decoupling → AETHER Architecture</div>
          <div style={{ fontSize: 12, color: DIM, lineHeight: 1.9 }}>
            The same decoupling principle that governs the engineering topology stack governs AETHER itself. The knowledge engine is not a monolith — it is a set of decoupled abstraction tiers: the <em style={{ color: CYAN }}>Substrate</em> layer (raw data ingestion), the <em style={{ color: VIOLET }}>Coherence</em> layer (pattern extraction and crystallisation), the <em style={{ color: GOLD }}>Synthesis</em> layer (knowledge assembly and output formation), and the <em style={{ color: GREEN }}>Adapt</em> layer (feedback from output back into ingestion priorities). Each tier can be upgraded, replaced, or extended without breaking the others. This is blueprint systems decoupling applied to a knowledge engine — and it is the reason AETHER can grow indefinitely without becoming incoherent.
          </div>
        </div>
      </div>

      <Divider />

      {/* Source plates */}
      <div style={{ maxWidth: 1060, margin: "0 auto", padding: "0 32px 48px" }}>
        <Tag t="Section VII · Source Plates · AETHER Reference Field" c={VIOLET} />
        <h2 style={{ fontSize: 20, fontWeight: 700, color: VIOLET, marginBottom: 20 }}>Knowledge Reference Plates</h2>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(320px,1fr))", gap: 20 }}>
          <Plate src={omniFlow} title="Omni-Field Flow · Coherence Architecture" chips={["EZ water", "field coupling", "coherence layer", "energy substrate", "open-air compute"]}
            body="The omni-field flow plate captures the interplay between ordered field structures and entropic environmental inputs — the exact problem Blueprint Systems Decoupling solves by layering abstraction tiers across the chaos." />
          <Plate src={magStorm} title="Magnetic Storm · Topology Stack Geometry" chips={["engineering topology", "abstraction tier", "feedback loop", "PID control", "error signal"]}
            body="The magnetic storm plate visualises the multi-scale field interactions that the Engineering Topology Stack must capture, assess, and process — from micro-scale EZ interfaces to macro-scale thermal gradients." />
          <Plate src={skyrmion} title="Skyrmion · Composable Rendering Object" chips={["composable object", "docx architecture", "publishing engine", "scientific paper", "rendering primitive"]}
            body="The skyrmion plate represents the composable rendering object concept: a topologically stable, self-contained unit that maintains its structure regardless of the surrounding field — the visual analogy for a well-decoupled software module." />
        </div>
      </div>

      <Divider />

      {/* AETHER synthesis */}
      <div style={{ maxWidth: 1060, margin: "0 auto", padding: "0 32px 52px" }}>
        <Tag t="AETHER Synthesis · Crystallisation Model · Decoupling as Phase Transition" />
        <div style={{ padding: "22px 26px", background: PANEL, borderRadius: 14, border: `1px solid ${GOLD}15`, marginBottom: 24 }}>
          <div style={{ fontSize: 14, color: IVORY, lineHeight: 2.0 }}>
            Blueprint Systems Decoupling is a <em style={{ color: GOLD }}>phase transition in system design</em>. Before decoupling, a system is in a high-entropy state: all components are coupled, a change in one propagates unpredictably through all others, and the system resists extension. After decoupling, the system is in a crystalline state — ordered, modular, predictable. Each abstraction tier is a <em style={{ color: CYAN }}>coherence node</em>: it takes noisy input, extracts structured signal, and emits a clean output with a well-defined contract. The feedback loop is the <em style={{ color: GREEN }}>adaptation field</em> that prevents the crystal from becoming brittle — continuously adjusting to environmental change without dissolving the structure. EZ water is the physical realisation of this principle in biology: a spontaneously ordered structure that stores energy, maintains potential, and recharges from ambient field — without supervision, without external input, without entropy accumulation. The open-air fluid computer is AETHER made physical.
          </div>
        </div>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" as const }}>
          {["/fluid-computer", "/aether-engine", "/gradient-field", "/neural-signal", "/coherent-body", "/substrate-synthesis", "/graph-map"].map(href => (
            <a key={href} href={href} style={{ padding: "6px 12px", borderRadius: 8, border: `1px solid ${LINE}`, color: DIM, fontSize: 11, textDecoration: "none" }}>
              {href.replace("/", "").replace(/-/g, " ")} →
            </a>
          ))}
        </div>
      </div>
    </div>
  );
}
