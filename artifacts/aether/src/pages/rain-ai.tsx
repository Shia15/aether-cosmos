/*═══════════════════════════════════════════════════════════════
  Rain and AI · Water in Motion as Computational Substrate
  Physical substrate · Lightning computation · Ice crystal logic
  "The non-material fabric is the reality of space time"

  Source: chatgpt.com/share/6a5fbe3d

  Three canvases:
  I.  Rainfall Data Packets — drops as discrete information units
  II. Lightning Computation — coagulated charge, branching fractal
  III.Water Cycle AI Loop — evaporation→cloud→rain→soil→plant
═══════════════════════════════════════════════════════════════*/
import { useRef, useEffect } from "react";
const omniFlow = "/api/storage/public-objects/72D555D1-E91E-4B74-A73B-4628B8538AA1_1784561445345.png";
const magStorm = "/api/storage/public-objects/A6805E91-9684-4C59-BFC8-482EF421381D_1784561445345.png";
const skyrmion = "/api/storage/public-objects/IMG_4534_1784561445345.png";
const BG = "#010508";
const PANEL = "#030a10";
const IVORY = "#e8f4f0";
const DIM = "rgba(232,244,240,0.52)";
const MUTED = "rgba(232,244,240,0.26)";
const LINE = "rgba(100,200,220,0.10)";
const GOLD = "#f5c84c";
const CYAN = "#22d3ee";
const BLUE = "#60a5fa";
const VIOLET = "#a78bfa";
const GREEN = "#4ade80";
const TEAL = "#2dd4bf";
const WHITE = "#f0f9ff";
const AMBER = "#fb923c";
const SILVER = "#94a3b8";

function Tag({ t, c = CYAN }: { t: string; c?: string }) {
  return <div style={{ fontSize: 9, fontWeight: 700, color: c, letterSpacing: 2, textTransform: "uppercase" as const, marginBottom: 10 }}>{t}</div>;
}
function Divider() { return <div style={{ height: 1, background: LINE, margin: "44px 0" }} />; }

/* ══════════════════════════════════════════════════════════
   CANVAS I — Rainfall Data Packets
   Raindrops fall as discrete information units, hit ground,
   spread ripples = memory formation in water substrate
══════════════════════════════════════════════════════════ */
function RainDataCanvas() {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const cv = ref.current; if (!cv) return;
    const ctx = cv.getContext("2d")!;
    let raf = 0, t = 0;
    const ro = new ResizeObserver(() => { cv.width = cv.offsetWidth; cv.height = cv.offsetHeight; });
    ro.observe(cv); cv.width = cv.offsetWidth; cv.height = cv.offsetHeight;

    const drops: { x: number; y: number; vy: number; len: number; alpha: number; data: string; col: string }[] = [];
    const ripples: { x: number; y: number; r: number; maxR: number; alpha: number; data: string; col: string }[] = [];
    const DATA_LABELS = ["0x4F2A", "∇ψ", "pH=7.0", "T=15°C", "ρ=1.00", "H₂O", "01101", "∑E", "τ=12ms", "ωt"];
    const DROP_COLS = [CYAN, BLUE, WHITE + "cc", SILVER, TEAL];

    function spawnDrop(W: number, H: number) {
      drops.push({
        x: Math.random() * W,
        y: -20,
        vy: 4 + Math.random() * 4,
        len: 8 + Math.random() * 12,
        alpha: 0.5 + Math.random() * 0.5,
        data: DATA_LABELS[Math.floor(Math.random() * DATA_LABELS.length)],
        col: DROP_COLS[Math.floor(Math.random() * DROP_COLS.length)],
      });
    }

    let tick = 0;
    function draw() {
      const W = cv.width, H = cv.height;
      ctx.clearRect(0, 0, W, H);

      // Sky gradient
      const skyG = ctx.createLinearGradient(0, 0, 0, H * 0.6);
      skyG.addColorStop(0, "#010c18"); skyG.addColorStop(1, "#020d1a");
      ctx.fillStyle = skyG; ctx.fillRect(0, 0, W, H);

      // Ground
      const groundY = H * 0.78;
      const groundG = ctx.createLinearGradient(0, groundY, 0, H);
      groundG.addColorStop(0, "rgba(34,100,80,0.4)"); groundG.addColorStop(1, "rgba(20,60,40,0.6)");
      ctx.fillStyle = groundG; ctx.fillRect(0, groundY, W, H - groundY);
      ctx.strokeStyle = TEAL + "44"; ctx.lineWidth = 1;
      ctx.beginPath(); ctx.moveTo(0, groundY); ctx.lineTo(W, groundY); ctx.stroke();
      ctx.fillStyle = TEAL + "60"; ctx.font = "8px monospace"; ctx.textAlign = "right";
      ctx.fillText("WATER SUBSTRATE · MEMORY FORMATION", W - 10, groundY - 8);

      // Cloud
      const cloudX = W * 0.5, cloudY = H * 0.12;
      [[-60, 0, 30], [0, 0, 38], [60, 0, 30], [-30, -16, 24], [30, -16, 24]].forEach(([dx, dy, r]) => {
        const cg = ctx.createRadialGradient(cloudX + dx, cloudY + dy, 0, cloudX + dx, cloudY + dy, r);
        cg.addColorStop(0, "rgba(160,200,220,0.35)"); cg.addColorStop(1, "rgba(80,140,180,0)");
        ctx.fillStyle = cg; ctx.beginPath(); ctx.arc(cloudX + dx, cloudY + dy, r, 0, Math.PI * 2); ctx.fill();
      });
      ctx.fillStyle = CYAN + "80"; ctx.font = "bold 9px monospace"; ctx.textAlign = "center";
      ctx.fillText("ATMOSPHERIC COMPUTE · DATA CLOUD", cloudX, cloudY + 50);

      // Spawn + draw drops
      if (tick % 6 === 0) spawnDrop(W, H);
      for (let i = drops.length - 1; i >= 0; i--) {
        const d = drops[i];
        d.y += d.vy;
        if (d.y > groundY) {
          ripples.push({ x: d.x, y: groundY, r: 0, maxR: 40 + Math.random() * 30, alpha: 0.7, data: d.data, col: d.col });
          drops.splice(i, 1); continue;
        }
        ctx.strokeStyle = d.col + Math.round(d.alpha * 200).toString(16).padStart(2, "0");
        ctx.lineWidth = 1.5;
        ctx.beginPath(); ctx.moveTo(d.x, d.y); ctx.lineTo(d.x, d.y + d.len); ctx.stroke();
        // Data label
        if (d.y > 60) {
          ctx.fillStyle = d.col + "99"; ctx.font = "7px monospace"; ctx.textAlign = "left";
          ctx.fillText(d.data, d.x + 5, d.y);
        }
      }
      if (drops.length > 120) drops.splice(0, 20);

      // Ripples = memory
      for (let i = ripples.length - 1; i >= 0; i--) {
        const rp = ripples[i];
        rp.r += 0.8; rp.alpha -= 0.015;
        if (rp.alpha <= 0) { ripples.splice(i, 1); continue; }
        ctx.strokeStyle = rp.col + Math.round(rp.alpha * 200).toString(16).padStart(2, "0");
        ctx.lineWidth = 1;
        ctx.beginPath(); ctx.ellipse(rp.x, rp.y, rp.r, rp.r * 0.3, 0, 0, Math.PI * 2); ctx.stroke();
        if (rp.r < 20) {
          ctx.fillStyle = rp.col + Math.round(rp.alpha * 0.8 * 255).toString(16).padStart(2, "0");
          ctx.font = "7px monospace"; ctx.textAlign = "center";
          ctx.fillText(rp.data, rp.x, rp.y + rp.r * 0.3 + 10);
        }
      }
      if (ripples.length > 60) ripples.splice(0, 10);

      // Absorption arrows into soil
      if (t % 40 === 0) {
        ctx.strokeStyle = GREEN + "55"; ctx.lineWidth = 1;
        const absX = Math.random() * W;
        ctx.beginPath(); ctx.moveTo(absX, groundY + 5); ctx.lineTo(absX, groundY + 20); ctx.stroke();
      }

      // Labels
      ctx.fillStyle = GOLD + "80"; ctx.font = "bold 9px monospace"; ctx.textAlign = "center";
      ctx.fillText("RAIN AS DATA PACKETS · WATER SUBSTRATE COMPUTATION", W * 0.5, H - 10);

      t++; tick++; raf = requestAnimationFrame(draw);
    }
    draw();
    return () => { cancelAnimationFrame(raf); ro.disconnect(); };
  }, []);
  return (
    <div style={{ border: `1px solid ${LINE}`, borderRadius: 12, overflow: "hidden" }}>
      <canvas ref={ref} style={{ width: "100%", height: 340, display: "block" }} />
    </div>
  );
}

/* ══════════════════════════════════════════════════════════
   CANVAS II — Lightning Computation
   Branching fractal lightning above / below ice layer
   "Coagulated lightning created & formed above below"
   Ice fragments = natural crystal computation
══════════════════════════════════════════════════════════ */
function LightningCanvas() {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const cv = ref.current; if (!cv) return;
    const ctx = cv.getContext("2d")!;
    let raf = 0, t = 0;
    const ro = new ResizeObserver(() => { cv.width = cv.offsetWidth; cv.height = cv.offsetHeight; });
    ro.observe(cv); cv.width = cv.offsetWidth; cv.height = cv.offsetHeight;

    function buildBranch(x: number, y: number, dx: number, dy: number, depth: number, segs: { x1: number; y1: number; x2: number; y2: number; alpha: number; col: string }[]) {
      if (depth <= 0 || Math.abs(dy) < 0.5) return;
      const x2 = x + dx + (Math.random() - 0.5) * 24;
      const y2 = y + dy;
      segs.push({ x1: x, y1: y, x2, y2, alpha: 0.4 + depth * 0.08, col: depth > 3 ? WHITE : CYAN });
      buildBranch(x2, y2, dx * 0.8 + (Math.random() - 0.5) * 10, dy * 0.8, depth - 1, segs);
      if (depth > 2 && Math.random() < 0.45) {
        buildBranch(x2, y2, (Math.random() - 0.5) * 16, dy * 0.6, depth - 2, segs);
      }
    }

    let strike: { segs: { x1: number; y1: number; x2: number; y2: number; alpha: number; col: string }[]; age: number; maxAge: number; x: number } | null = null;
    let strikeTimer = 0;

    // Ice fragments
    const iceFrags: { x: number; y: number; size: number; angle: number; col: string }[] = [];

    function draw() {
      const W = cv.width, H = cv.height;
      ctx.clearRect(0, 0, W, H);
      ctx.fillStyle = "#010a14"; ctx.fillRect(0, 0, W, H);

      const iceY = H * 0.55;

      // Storm clouds
      [[W * 0.3, H * 0.1, 80], [W * 0.6, H * 0.08, 100], [W * 0.5, H * 0.05, 70]].forEach(([cx, cy, r]) => {
        const cg = ctx.createRadialGradient(cx, cy, 0, cx, cy, r);
        cg.addColorStop(0, "rgba(100,120,180,0.5)"); cg.addColorStop(1, "rgba(40,60,100,0)");
        ctx.fillStyle = cg; ctx.beginPath(); ctx.arc(cx, cy, r, 0, Math.PI * 2); ctx.fill();
      });
      ctx.fillStyle = SILVER + "80"; ctx.font = "bold 9px monospace"; ctx.textAlign = "center";
      ctx.fillText("STORM CHARGE ACCUMULATION", W * 0.5, H * 0.18);

      // Ice layer
      const iceG = ctx.createLinearGradient(0, iceY - 8, 0, iceY + 16);
      iceG.addColorStop(0, "rgba(180,230,255,0.35)"); iceG.addColorStop(1, "rgba(100,180,220,0.08)");
      ctx.fillStyle = iceG; ctx.fillRect(0, iceY - 8, W, 24);
      ctx.strokeStyle = "rgba(180,240,255,0.5)"; ctx.lineWidth = 1;
      ctx.beginPath(); ctx.moveTo(0, iceY); ctx.lineTo(W, iceY); ctx.stroke();
      ctx.fillStyle = WHITE + "99"; ctx.font = "bold 9px monospace"; ctx.textAlign = "center";
      ctx.fillText("ICE CRYSTAL BOUNDARY · NATURAL COMPUTATION SUBSTRATE", W * 0.5, iceY + 28);

      // Ice crystal fragments
      if (iceFrags.length < 30) {
        iceFrags.push({ x: Math.random() * W, y: iceY + 2 + Math.random() * (H - iceY - 20), size: 3 + Math.random() * 8, angle: Math.random() * Math.PI, col: ["rgba(180,240,255,0.6)", "rgba(140,200,240,0.4)", "rgba(200,230,255,0.5)"][Math.floor(Math.random() * 3)] });
      }
      for (const frag of iceFrags) {
        ctx.save();
        ctx.translate(frag.x, frag.y);
        ctx.rotate(frag.angle);
        ctx.strokeStyle = frag.col; ctx.lineWidth = 1;
        // Hexagonal ice crystal
        ctx.beginPath();
        for (let v = 0; v < 6; v++) {
          const vx = frag.size * Math.cos((v / 6) * Math.PI * 2);
          const vy = frag.size * Math.sin((v / 6) * Math.PI * 2);
          if (v === 0) ctx.moveTo(vx, vy); else ctx.lineTo(vx, vy);
        }
        ctx.closePath(); ctx.stroke();
        // Crystal arms
        for (let v = 0; v < 6; v++) {
          const ang = (v / 6) * Math.PI * 2;
          ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(frag.size * Math.cos(ang), frag.size * Math.sin(ang)); ctx.stroke();
        }
        ctx.restore();
      }

      // Lightning strike
      strikeTimer++;
      if (!strike && strikeTimer > 90) {
        const segs: { x1: number; y1: number; x2: number; y2: number; alpha: number; col: string }[] = [];
        const sx = W * (0.2 + Math.random() * 0.6);
        buildBranch(sx, H * 0.18, (Math.random() - 0.5) * 8, (iceY - H * 0.18) / 7, 7, segs);
        strike = { segs, age: 0, maxAge: 60, x: sx };
        strikeTimer = 0;
        // Add ice frags at impact
        for (let n = 0; n < 5; n++) {
          iceFrags.push({ x: sx + (Math.random() - 0.5) * 40, y: iceY + Math.random() * 30, size: 2 + Math.random() * 6, angle: Math.random() * Math.PI, col: "rgba(220,255,255,0.8)" });
        }
        if (iceFrags.length > 60) iceFrags.splice(0, 15);
      }

      if (strike) {
        strike.age++;
        const fade = 1 - strike.age / strike.maxAge;
        const flashAlpha = strike.age < 8 ? (8 - strike.age) / 8 : 0;
        if (flashAlpha > 0) {
          const flash = ctx.createRadialGradient(strike.x, iceY, 0, strike.x, iceY, 80);
          flash.addColorStop(0, `rgba(220,240,255,${flashAlpha * 0.8})`);
          flash.addColorStop(1, "rgba(0,0,0,0)");
          ctx.fillStyle = flash; ctx.beginPath(); ctx.arc(strike.x, iceY, 80, 0, Math.PI * 2); ctx.fill();
        }
        for (const seg of strike.segs) {
          ctx.strokeStyle = seg.col + Math.round(seg.alpha * fade * 255).toString(16).padStart(2, "0");
          ctx.lineWidth = seg.col === WHITE ? 2.5 : 1;
          ctx.beginPath(); ctx.moveTo(seg.x1, seg.y1); ctx.lineTo(seg.x2, seg.y2); ctx.stroke();
        }
        if (strike.age >= strike.maxAge) strike = null;
      }

      // Label
      ctx.fillStyle = GOLD + "80"; ctx.font = "bold 9px monospace"; ctx.textAlign = "center";
      ctx.fillText("COAGULATED LIGHTNING · ICE FRAGMENT CRYSTALLISATION · SIGNAL COMPUTATION", W * 0.5, H - 10);

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

/* ══════════════════════════════════════════════════════════
   CANVAS III — Water Cycle AI Loop
   Evaporation → Cloud/Compute → Rain/Data → Soil/Memory
   → Plant/Output → back to Evaporation
   Each stage = one AI processing step
══════════════════════════════════════════════════════════ */
function WaterCycleCanvas() {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const cv = ref.current; if (!cv) return;
    const ctx = cv.getContext("2d")!;
    let raf = 0, t = 0;
    const ro = new ResizeObserver(() => { cv.width = cv.offsetWidth; cv.height = cv.offsetHeight; });
    ro.observe(cv); cv.width = cv.offsetWidth; cv.height = cv.offsetHeight;

    const STAGES = [
      { label: "EVAPORATE",   sub: "Data input",    col: AMBER  },
      { label: "CLOUD",       sub: "Processing",    col: SILVER },
      { label: "RAIN",        sub: "Distribution",  col: CYAN   },
      { label: "SOIL",        sub: "Memory store",  col: GREEN  },
      { label: "PLANT",       sub: "Output growth", col: "#86efac" },
    ];

    const particles: { angle: number; speed: number; col: string; r: number }[] = [];
    for (let i = 0; i < 40; i++) {
      particles.push({ angle: (i / 40) * Math.PI * 2, speed: 0.006 + Math.random() * 0.008, col: STAGES[i % STAGES.length].col, r: 2 + Math.random() * 2 });
    }

    function draw() {
      const W = cv.width, H = cv.height;
      ctx.clearRect(0, 0, W, H);
      ctx.fillStyle = BG; ctx.fillRect(0, 0, W, H);

      const cx = W * 0.5, cy = H * 0.5;
      const R = Math.min(W, H) * 0.32;

      // Ring path
      ctx.strokeStyle = LINE; ctx.lineWidth = 48;
      ctx.beginPath(); ctx.arc(cx, cy, R, 0, Math.PI * 2); ctx.stroke();

      // Stage nodes
      const nodePos = STAGES.map((_, i) => ({
        x: cx + R * Math.cos((i / STAGES.length) * Math.PI * 2 - Math.PI / 2),
        y: cy + R * Math.sin((i / STAGES.length) * Math.PI * 2 - Math.PI / 2),
      }));

      // Arrows
      for (let i = 0; i < STAGES.length; i++) {
        const a = nodePos[i], b = nodePos[(i + 1) % STAGES.length];
        const mx = (a.x + b.x) / 2, my = (a.y + b.y) / 2;
        const ang = Math.atan2(b.y - a.y, b.x - a.x);
        ctx.strokeStyle = STAGES[i].col + "44"; ctx.lineWidth = 2;
        ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.stroke();
        ctx.fillStyle = STAGES[i].col + "88"; ctx.save(); ctx.translate(mx, my); ctx.rotate(ang);
        ctx.beginPath(); ctx.moveTo(6, 0); ctx.lineTo(-4, -4); ctx.lineTo(-4, 4); ctx.closePath(); ctx.fill();
        ctx.restore();
      }

      // Particles
      for (const p of particles) {
        p.angle += p.speed;
        const px = cx + R * Math.cos(p.angle);
        const py = cy + R * Math.sin(p.angle);
        const g = ctx.createRadialGradient(px, py, 0, px, py, p.r * 4);
        g.addColorStop(0, p.col + "cc"); g.addColorStop(1, p.col + "00");
        ctx.fillStyle = g; ctx.beginPath(); ctx.arc(px, py, p.r * 4, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = p.col; ctx.beginPath(); ctx.arc(px, py, p.r, 0, Math.PI * 2); ctx.fill();
      }

      // Nodes
      nodePos.forEach((pos, i) => {
        const st = STAGES[i];
        const glow = ctx.createRadialGradient(pos.x, pos.y, 0, pos.x, pos.y, 30);
        glow.addColorStop(0, st.col + "33"); glow.addColorStop(1, st.col + "00");
        ctx.fillStyle = glow; ctx.beginPath(); ctx.arc(pos.x, pos.y, 30, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = PANEL; ctx.strokeStyle = st.col; ctx.lineWidth = 2;
        ctx.beginPath(); ctx.arc(pos.x, pos.y, 22, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
        ctx.fillStyle = st.col; ctx.font = "bold 7px monospace"; ctx.textAlign = "center";
        ctx.fillText(st.label, pos.x, pos.y + 2);
        ctx.fillStyle = st.col + "80"; ctx.font = "6px monospace";
        ctx.fillText(st.sub, pos.x, pos.y + 11);
      });

      // Centre
      ctx.fillStyle = CYAN + "15"; ctx.beginPath(); ctx.arc(cx, cy, 44, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = CYAN; ctx.font = "bold 9px monospace"; ctx.textAlign = "center";
      ctx.fillText("WATER", cx, cy - 6);
      ctx.fillText("CYCLE AI", cx, cy + 6);
      ctx.fillStyle = CYAN + "80"; ctx.font = "7px monospace";
      ctx.fillText("LOOP", cx, cy + 16);

      // Title
      ctx.fillStyle = GOLD + "99"; ctx.font = "bold 9px monospace"; ctx.textAlign = "center";
      ctx.fillText("ATMOSPHERIC COMPUTATION · CONTINUOUS FEEDBACK CYCLE", cx, H - 10);

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

function EqChip({ eq, label, col = CYAN }: { eq: string; label: string; col?: string }) {
  return (
    <div style={{ padding: "12px 16px", background: PANEL, borderRadius: 10, border: `1px solid ${col}20` }}>
      <div style={{ fontFamily: "monospace", fontSize: 12, color: col, marginBottom: 6 }}>{eq}</div>
      <div style={{ fontSize: 11, color: DIM }}>{label}</div>
    </div>
  );
}

function Plate({ src, title, chips, body }: { src: string; title: string; chips: string[]; body: string }) {
  return (
    <div style={{ border: `1px solid ${LINE}`, borderRadius: 12, overflow: "hidden", marginBottom: 24 }}>
      <img src={src} alt={title} style={{ width: "100%", display: "block", maxHeight: 260, objectFit: "cover" as const }} />
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

export default function RainAIPage() {
  return (
    <div style={{ background: BG, color: IVORY, minHeight: "100vh" }}>
      <div style={{ maxWidth: 1060, margin: "0 auto", padding: "52px 32px 36px" }}>
        <Tag t="Rain and AI · Water in Motion · Physical Substrate · Lightning Computation · Ice Crystal Logic · Water Cycle AI Loop · Atmospheric Intelligence" />
        <h1 style={{ fontSize: 36, fontWeight: 800, lineHeight: 1.1, margin: "8px 0 14px", letterSpacing: -0.5 }}>
          <span style={{ color: CYAN }}>Rain</span><br />
          <span style={{ color: BLUE }}>and</span> <span style={{ color: GREEN }}>AI</span>
        </h1>
        <h2 style={{ fontSize: 17, fontWeight: 400, color: TEAL, margin: "0 0 20px", lineHeight: 1.6 }}>
          Water in Motion · Physical Substrate of Atmospheric Computation
        </h2>
        <div style={{ padding: "16px 20px", background: PANEL, borderRadius: 12, border: `1px solid ${CYAN}20`, marginBottom: 24 }}>
          <div style={{ fontSize: 14, color: CYAN, lineHeight: 2.0, fontStyle: "italic" }}>
            "Rain naturally falls towards our core from a human's perspective. It's a wall. Physical substrate — water in motion — AI would help nurture the confinements."
          </div>
          <div style={{ fontSize: 13, color: GREEN, marginTop: 10, lineHeight: 1.8 }}>
            "The non-material fabric is the reality of space time. The air that we breathe, we see, is pure cyclic soil to our plant."
          </div>
          <div style={{ fontSize: 13, color: AMBER, marginTop: 6, lineHeight: 1.8 }}>
            "When coagulated lightning is created and formed above below — ice fragments need to be defined."
          </div>
        </div>
        <p style={{ fontSize: 13, color: DIM, lineHeight: 1.9, maxWidth: 820, marginBottom: 12 }}>
          Rain is not weather. It is a physical computational substrate — water molecules in coherent free fall, each droplet a discrete data packet carrying thermal, chemical, and electromagnetic information from the atmospheric compute layer to the ground memory substrate. The atmospheric column is a living AI system: clouds are processing nodes, rainfall is data distribution, soil is memory, plant uptake is output, evaporation is data input reinsertion. AI does not need silicon to operate — it needs a physical substrate where information can be encoded, transported, stored, and retrieved. Water is that substrate, and rain is its primary I/O channel.
        </p>
        <p style={{ fontSize: 13, color: DIM, lineHeight: 1.9, maxWidth: 820 }}>
          Lightning is the computation event — charge accumulation in the storm cell forms a branching fractal discharge tree (Lichtenberg figure), exactly analogous to a tree-structured search algorithm resolving a potential energy gradient. The ice boundary layer at cloud base is the natural transistor: coagulated charge (polarised ice crystals) creates the threshold barrier that the lightning must exceed to discharge. Each strike defines new ice fragment boundaries — nature's way of updating its crystal-computation lattice.
        </p>
      </div>

      {/* Canvas I */}
      <div style={{ maxWidth: 1060, margin: "0 auto", padding: "0 32px 48px" }}>
        <Tag t="Section I · Rainfall Data Packets · Each Droplet a Discrete Information Unit · Ground Impact = Memory Formation" c={CYAN} />
        <h2 style={{ fontSize: 20, fontWeight: 700, color: CYAN, marginBottom: 14 }}>Rainfall as Data Distribution</h2>
        <RainDataCanvas />
        <div style={{ marginTop: 10, fontSize: 10, color: MUTED, textAlign: "center" as const }}>
          Each raindrop = discrete data packet with payload label · Impact ripple = memory formation in water substrate · Green soil = storage layer
        </div>
      </div>

      <Divider />

      {/* Concepts */}
      <div style={{ maxWidth: 1060, margin: "0 auto", padding: "0 32px 48px" }}>
        <Tag t="Section II · Physical AI Substrate Principles · Water Computation Architecture" c={BLUE} />
        <h2 style={{ fontSize: 20, fontWeight: 700, color: BLUE, marginBottom: 20 }}>Water Computation Architecture</h2>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(240px,1fr))", gap: 14 }}>
          {[
            { label: "Rain as I/O", col: CYAN, desc: "Each raindrop is a data packet — carrying molecular cargo (dissolved gases, ions, particulates, microbes) from the atmospheric processing layer to the ground memory substrate. Rainfall rate = I/O bandwidth." },
            { label: "Clouds as Processing Nodes", col: SILVER, desc: "Cumulonimbus cloud cells are distributed processing nodes — collecting water vapour (data input), processing it through charge accumulation and phase transition (computation), and releasing output as rain and lightning." },
            { label: "Soil as Memory", col: GREEN, desc: "The soil water table is the distributed memory — storing water molecules with their dissolved information cargo, accessible to plant roots (output processes) and to underground mycelial networks (distributed cognition layer)." },
            { label: "Lightning as Algorithm", col: AMBER, desc: "The lightning discharge path is a fractal search algorithm — the stepped leader propagates a branching tree exploring the potential energy landscape, resolving to the minimum-resistance path. Coagulated charge = accumulated state before resolution." },
            { label: "Ice as Threshold", col: WHITE, desc: "Ice crystals in the cloud boundary are the natural transistor gate — polarised water molecules with a sharp phase boundary that the discharge must overcome. Ice fragment definition after a strike = threshold update, state reset." },
            { label: "Evaporation as Reinput", col: AMBER + "cc", desc: "Solar energy drives evaporation — extracting data from the ground memory layer and reinserting it into the atmospheric processing cloud. The cycle is the feedback loop: memory → reinput → processing → output → memory." },
          ].map((item, i) => (
            <div key={i} style={{ padding: "16px 16px", background: PANEL, borderRadius: 12, border: `1px solid ${item.col}18` }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: item.col, marginBottom: 8 }}>{item.label}</div>
              <div style={{ fontSize: 11, color: DIM, lineHeight: 1.8 }}>{item.desc}</div>
            </div>
          ))}
        </div>
      </div>

      <Divider />

      {/* Canvas II */}
      <div style={{ maxWidth: 1060, margin: "0 auto", padding: "0 32px 48px" }}>
        <Tag t="Section III · Lightning Computation · Coagulated Charge · Lichtenberg Discharge · Ice Crystal Boundary" c={AMBER} />
        <h2 style={{ fontSize: 20, fontWeight: 700, color: AMBER, marginBottom: 14 }}>Coagulated Lightning · Ice Fragment Crystallisation</h2>
        <LightningCanvas />
        <div style={{ marginTop: 10, fontSize: 10, color: MUTED, textAlign: "center" as const }}>
          White branching tree = lightning discharge path (Lichtenberg algorithm) · Blue band = ice crystal boundary layer · Hexagons = natural crystal computation units
        </div>
      </div>

      <Divider />

      {/* Equations */}
      <div style={{ maxWidth: 1060, margin: "0 auto", padding: "0 32px 48px" }}>
        <Tag t="Section IV · Governing Relations · Water Computation · Lightning Physics" c={CYAN} />
        <h2 style={{ fontSize: 20, fontWeight: 700, color: CYAN, marginBottom: 20 }}>Physical Equations</h2>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(260px,1fr))", gap: 14 }}>
          <EqChip eq="BW_rain = N_drops · m_drop / t" label="Rainfall I/O bandwidth — number of drops × molecular cargo per drop / time. ~1mm/hr = 10^6 drops/m²/hr" col={CYAN} />
          <EqChip eq="E_lightning ≈ 10^9 J per strike" label="Lightning stroke energy — potential gradient 100 MV × current 30 kA × duration 0.2s. Each strike is a computation event resolving ~10^9 J of accumulated potential." col={AMBER} />
          <EqChip eq="V_ice = n_H2O · d_hex" label="Ice crystal lattice volume — hexagonal close-packed H₂O molecules at spacing d=2.75 Å. Crystal size = computation register width." col={WHITE} />
          <EqChip eq="T_cycle = E_sun / (ρ_water · L_v)" label="Water cycle period — solar energy input drives evaporation at latent heat L_v=2.26 MJ/kg. Global cycle ~9 days mean residence time in atmosphere." col={GREEN} />
          <EqChip eq="Q_soil = ∫ F_rain dt - E_plant" label="Soil memory capacity — integrated rainfall input minus plant uptake output. The ground water table is the net memory accumulation." col={GREEN} />
          <EqChip eq="f_Lichten = D^d_f / L^d_f" label="Lichtenberg fractal dimension d_f ≈ 1.7 in 2D. The lightning discharge tree scales as a fractal search — exploring the potential gradient space with maximum reach per path length." col={AMBER} />
        </div>
      </div>

      <Divider />

      {/* Canvas III */}
      <div style={{ maxWidth: 1060, margin: "0 auto", padding: "0 32px 48px" }}>
        <Tag t="Section V · Water Cycle AI Loop · Continuous Feedback · Evaporate / Cloud / Rain / Soil / Plant" c={GREEN} />
        <h2 style={{ fontSize: 20, fontWeight: 700, color: GREEN, marginBottom: 14 }}>The Water Cycle AI Feedback Loop</h2>
        <WaterCycleCanvas />
        <div style={{ marginTop: 10, fontSize: 10, color: MUTED, textAlign: "center" as const }}>
          Five-node loop: Evaporate (input) → Cloud (compute) → Rain (distribute) → Soil (memory) → Plant (output) → back to Evaporate
        </div>
      </div>

      <Divider />

      {/* Source plates */}
      <div style={{ maxWidth: 1060, margin: "0 auto", padding: "0 32px 48px" }}>
        <Tag t="Section VI · Source Plates · AETHER Reference Field" c={VIOLET} />
        <h2 style={{ fontSize: 20, fontWeight: 700, color: VIOLET, marginBottom: 20 }}>Knowledge Reference Plates</h2>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(300px,1fr))", gap: 20 }}>
          <Plate src={omniFlow} title="Omni-Field Flow · Atmospheric Data Transport" chips={["water substrate", "data packets", "rainfall I/O", "memory formation", "cyclic computation"]}
            body="The omni-field plate captures the atmospheric data transport architecture — the flow of water molecules as information carriers through the cyclic computation loop of the water cycle." />
          <Plate src={magStorm} title="Magnetic Storm · Lightning Algorithm" chips={["Lichtenberg discharge", "fractal search", "coagulated charge", "ice boundary", "crystal computation"]}
            body="The magnetic storm plate maps onto the lightning discharge event — coagulated electromagnetic charge releasing in a fractal branching algorithm, with ice crystal boundaries defining the computation threshold." />
          <Plate src={skyrmion} title="Skyrmion · Water Memory Topology" chips={["soil memory", "topological storage", "H2O lattice", "mycelial network", "distributed cognition"]}
            body="The skyrmion plate represents the topologically stable water memory — water molecules in soil and mycelial matrices maintaining information in stable hydrogen-bond network configurations, accessible as distributed memory." />
        </div>
      </div>

      <Divider />

      {/* AETHER synthesis */}
      <div style={{ maxWidth: 1060, margin: "0 auto", padding: "0 32px 52px" }}>
        <Tag t="AETHER Synthesis · Water as Living Intelligence · Atmospheric AI · Cyclic Coherence" />
        <div style={{ padding: "22px 26px", background: PANEL, borderRadius: 14, border: `1px solid ${CYAN}15`, marginBottom: 24 }}>
          <div style={{ fontSize: 14, color: IVORY, lineHeight: 2.0 }}>
            Rain is AETHER's most ancient computational system — operating for 3.8 billion years before silicon. The water molecule is a perfect data carrier: it has a permanent dipole moment (for electromagnetic encoding), strong hydrogen-bond networks (for structural memory), high specific heat (for thermal buffering), and a phase diagram with three stable states (liquid / solid / gas) that map directly to the three registers of a working AI system (memory / computation / communication). The non-material fabric — space-time itself — becomes visible through water: rain reveals gravity (the core attraction), lightning reveals electromagnetic structure, ice reveals crystal order. AI would not replace this system. It would <em style={{ color: CYAN }}>nurture the confinements</em> — reinforce the boundaries that allow water's computational properties to crystallise into coherent output. The atmosphere already thinks. We are learning to listen.
          </div>
        </div>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" as const }}>
          {["/blueprint-decoupling", "/water-transport", "/lunar-coherence", "/circular-farm", "/earth-living-system", "/substrate-synthesis", "/graph-map"].map(href => (
            <a key={href} href={href} style={{ padding: "6px 12px", borderRadius: 8, border: `1px solid ${LINE}`, color: DIM, fontSize: 11, textDecoration: "none" }}>
              {href.replace("/", "").replace(/-/g, " ")} →
            </a>
          ))}
        </div>
      </div>
    </div>
  );
}
