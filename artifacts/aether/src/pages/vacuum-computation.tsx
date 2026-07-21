/*═══════════════════════════════════════════════════════════════
  Vacuum, Everything & Computation
  AETHER Data–Math Map

  Source: chatgpt.com/share/6a5fbf2b-aa44-83ea-bdf8-f35439132723

  Domains:
  · Casimir effect & vacuum energy (real, verified)
  · Q~AETHER photonic reservoir (interference computation)
  · Nonlinear phase modulation
  · Fibonacci FQP ASIC (low-power control)
  · Bio-adaptive mycelial reinforcements (self-healing cavities)
  · Firefly bioluminescence (near-perfect energy coherence)
  · Solar flash / stellar dynamics
  · Warp drive timeline reduction via negative energy

  Three canvases:
  I.  Casimir Vacuum Engine — plates, virtual pairs, negative energy density
  II. Q~AETHER Photonic Reservoir — interference computation lattice
  III.AETHER Data-Math Map — unified node graph of all domains
═══════════════════════════════════════════════════════════════*/
import { useRef, useEffect } from "react";
import omniFlow from "@assets/72D555D1-E91E-4B74-A73B-4628B8538AA1_1784561445345.png";
import magStorm from "@assets/A6805E91-9684-4C59-BFC8-482EF421381D_1784561445345.png";
import skyrmion from "@assets/IMG_4534_1784561445345.png";

const BG     = "#02040a";
const PANEL  = "#060a12";
const IVORY  = "#eef2f8";
const DIM    = "rgba(238,242,248,0.55)";
const MUTED  = "rgba(238,242,248,0.28)";
const LINE   = "rgba(120,160,255,0.09)";
const GOLD   = "#f5c84c";
const AMBER  = "#fb923c";
const CYAN   = "#22d3ee";
const BLUE   = "#60a5fa";
const VIOLET = "#a78bfa";
const GREEN  = "#4ade80";
const TEAL   = "#2dd4bf";
const ROSE   = "#fb7185";
const WHITE  = "#e8f0ff";
const SILVER = "#94a3b8";

function Tag({ t, c = BLUE }: { t: string; c?: string }) {
  return <div style={{ fontSize: 9, fontWeight: 700, color: c, letterSpacing: 2, textTransform: "uppercase" as const, marginBottom: 10 }}>{t}</div>;
}
function Divider() { return <div style={{ height: 1, background: LINE, margin: "44px 0" }} />; }

/* ══════════════════════════════════════════════════════════
   CANVAS I — Casimir Vacuum Engine
   Two parallel conductive plates (gold/silver)
   Virtual particle–antiparticle pairs flash between and outside
   Negative energy density band between plates (deeper blue)
   Outside: full vacuum energy density (brighter)
   Arrows: force pushing plates together
══════════════════════════════════════════════════════════ */
function CasimirCanvas() {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const cv = ref.current; if (!cv) return;
    const ctx = cv.getContext("2d")!;
    let raf = 0, t = 0;
    const ro = new ResizeObserver(() => { cv.width = cv.offsetWidth; cv.height = cv.offsetHeight; });
    ro.observe(cv); cv.width = cv.offsetWidth; cv.height = cv.offsetHeight;

    // Virtual particle pairs [x, y, inside, life, maxLife, vx, vy]
    type VPair = { x: number; y: number; inside: boolean; life: number; maxLife: number; vx: number; vy: number };
    const pairs: VPair[] = [];

    function draw() {
      const W = cv.width, H = cv.height;
      ctx.clearRect(0, 0, W, H);
      ctx.fillStyle = BG; ctx.fillRect(0, 0, W, H);

      const px = W * 0.5, plateH = H * 0.72, plateY = H * 0.14;
      const gap = W * 0.13; // half-gap from centre
      const plateL = px - gap, plateR = px + gap;
      const plateThick = 6;

      // Outside vacuum energy — brighter field texture
      for (let x = 0; x < W; x += 18) {
        for (let y = plateY; y < plateY + plateH; y += 18) {
          const inside = x > plateL && x < plateR;
          if (!inside) {
            const a = 0.04 + 0.02 * Math.sin(t * 0.03 + x * 0.1 + y * 0.08);
            ctx.fillStyle = `rgba(96,165,250,${a})`;
            ctx.fillRect(x, y, 2, 2);
          }
        }
      }

      // Between-plates: negative energy density zone (darker, richer blue)
      const negGrad = ctx.createLinearGradient(plateL, 0, plateR, 0);
      negGrad.addColorStop(0, "rgba(30,10,80,0.7)");
      negGrad.addColorStop(0.5, "rgba(10,5,50,0.85)");
      negGrad.addColorStop(1, "rgba(30,10,80,0.7)");
      ctx.fillStyle = negGrad;
      ctx.fillRect(plateL, plateY, gap * 2, plateH);

      // Casimir force arrows (pointing inward on each plate)
      const arrowY = plateY + plateH * 0.5;
      // Left plate → right (force pushing left plate rightward)
      ctx.strokeStyle = GOLD + "cc"; ctx.lineWidth = 2;
      ctx.beginPath(); ctx.moveTo(plateL - 24, arrowY); ctx.lineTo(plateL - 6, arrowY); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(plateL - 10, arrowY - 6); ctx.lineTo(plateL - 4, arrowY); ctx.lineTo(plateL - 10, arrowY + 6); ctx.stroke();
      // Right plate ← left (force pushing right plate leftward)
      ctx.beginPath(); ctx.moveTo(plateR + 24, arrowY); ctx.lineTo(plateR + 6, arrowY); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(plateR + 10, arrowY - 6); ctx.lineTo(plateR + 4, arrowY); ctx.lineTo(plateR + 10, arrowY + 6); ctx.stroke();

      ctx.fillStyle = GOLD + "99"; ctx.font = "7px monospace"; ctx.textAlign = "center";
      ctx.fillText("F_Casimir", px, arrowY + 16);

      // Spawn virtual pairs
      if (t % 4 === 0 && pairs.length < 80) {
        const inside = Math.random() < 0.35;
        const x = inside
          ? plateL + Math.random() * gap * 2
          : (Math.random() < 0.5 ? Math.random() * plateL : plateR + Math.random() * (W - plateR));
        const y = plateY + 10 + Math.random() * (plateH - 20);
        const life = 18 + Math.floor(Math.random() * 22);
        pairs.push({ x, y, inside, life, maxLife: life, vx: (Math.random() - 0.5) * 0.8, vy: (Math.random() - 0.5) * 0.8 });
      }

      // Draw + age virtual pairs
      for (let i = pairs.length - 1; i >= 0; i--) {
        const p = pairs[i];
        const progress = p.life / p.maxLife;
        // Appear → expand → collapse
        const r = 3 * Math.sin(progress * Math.PI);
        const alpha = Math.sin(progress * Math.PI) * (p.inside ? 0.9 : 0.55);
        // Particle (yellow) + antiparticle (rose) side by side
        const sep = r * 2.5;
        const col1 = p.inside ? VIOLET : CYAN;
        const col2 = p.inside ? ROSE : GREEN;
        ctx.fillStyle = col1 + Math.round(alpha * 255).toString(16).padStart(2, "0");
        ctx.beginPath(); ctx.arc(p.x - sep * 0.5, p.y, r, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = col2 + Math.round(alpha * 255).toString(16).padStart(2, "0");
        ctx.beginPath(); ctx.arc(p.x + sep * 0.5, p.y, r, 0, Math.PI * 2); ctx.fill();
        // Connection line
        ctx.strokeStyle = (p.inside ? VIOLET : CYAN) + Math.round(alpha * 100).toString(16).padStart(2, "0");
        ctx.lineWidth = 0.7;
        ctx.beginPath(); ctx.moveTo(p.x - sep * 0.5, p.y); ctx.lineTo(p.x + sep * 0.5, p.y); ctx.stroke();
        p.x += p.vx; p.y += p.vy; p.life--;
        if (p.life <= 0) pairs.splice(i, 1);
      }

      // Plates
      [plateL - plateThick * 0.5, plateR - plateThick * 0.5].forEach((px2, idx) => {
        const pg = ctx.createLinearGradient(px2, 0, px2 + plateThick, 0);
        pg.addColorStop(0, "#b0a060"); pg.addColorStop(0.5, "#f5c84c"); pg.addColorStop(1, "#b0a060");
        ctx.fillStyle = pg; ctx.fillRect(px2, plateY, plateThick, plateH);
      });

      // Labels
      ctx.fillStyle = GOLD; ctx.font = "bold 9px monospace"; ctx.textAlign = "center";
      ctx.fillText("CONDUCTOR", plateL - 18, plateY - 8);
      ctx.fillText("CONDUCTOR", plateR + 18, plateY - 8);
      ctx.fillStyle = VIOLET + "cc"; ctx.font = "bold 8px monospace";
      ctx.fillText("NEGATIVE ENERGY DENSITY", px, plateY - 8);
      ctx.fillStyle = VIOLET + "88"; ctx.font = "7px monospace";
      ctx.fillText("ρ_vac < 0 between plates", px, plateY + 14);
      ctx.fillStyle = CYAN + "88"; ctx.font = "7px monospace"; ctx.textAlign = "left";
      ctx.fillText("full vacuum energy density", 6, plateY + 14);
      ctx.textAlign = "right";
      ctx.fillText("full vacuum energy density", W - 6, plateY + 14);

      // Key equation strip
      ctx.fillStyle = PANEL + "ee"; ctx.fillRect(0, H - 34, W, 34);
      ctx.fillStyle = GOLD + "cc"; ctx.font = "bold 9px monospace"; ctx.textAlign = "center";
      ctx.fillText("F_Casimir = −(π²ℏc)/(240·d⁴) per unit area   ·   ρ_vac between plates < 0   ·   virtual pair lifespan Δt ~ ℏ/(2ΔE)", W * 0.5, H - 18);
      ctx.fillStyle = CYAN + "66"; ctx.font = "7px monospace";
      ctx.fillText("cyan/green = outside pairs (full vacuum)   ·   violet/rose = inside pairs (suppressed modes)", W * 0.5, H - 6);

      t++; raf = requestAnimationFrame(draw);
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
   CANVAS II — Q~AETHER Photonic Reservoir Computer
   Lattice of photonic nodes (circles)
   Light pulses travel between nodes
   Nonlinear phase rings show modulation
   Interference patterns (constructive = bright, destructive = dark)
   Fibonacci-spiral arrangement for FQP ASIC geometry
   Bio-mycelial reinforcement threads underneath
══════════════════════════════════════════════════════════ */
function PhotonicReservoirCanvas() {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const cv = ref.current; if (!cv) return;
    const ctx = cv.getContext("2d")!;
    let raf = 0, t = 0;
    const ro = new ResizeObserver(() => { cv.width = cv.offsetWidth; cv.height = cv.offsetHeight; });
    ro.observe(cv); cv.width = cv.offsetWidth; cv.height = cv.offsetHeight;

    // Fibonacci-spiral node positions
    const PHI = (1 + Math.sqrt(5)) / 2;
    const GOLDEN_ANGLE = (2 - PHI) * Math.PI * 2;
    const N_NODES = 48;
    type Node = { x: number; y: number; phase: number; freq: number; active: boolean };
    let nodes: Node[] = [];

    // Photon pulses [from, to, progress, alpha]
    type Pulse = { fx: number; fy: number; tx: number; ty: number; p: number; col: string };
    const pulses: Pulse[] = [];

    function buildNodes(W: number, H: number) {
      nodes = [];
      const cx = W * 0.5, cy = H * 0.5;
      const maxR = Math.min(W, H) * 0.42;
      for (let i = 0; i < N_NODES; i++) {
        const r = maxR * Math.sqrt(i / N_NODES);
        const angle = i * GOLDEN_ANGLE;
        nodes.push({ x: cx + r * Math.cos(angle), y: cy + r * Math.sin(angle), phase: Math.random() * Math.PI * 2, freq: 0.02 + Math.random() * 0.04, active: true });
      }
    }

    let builtW = 0, builtH = 0;
    function draw() {
      const W = cv.width, H = cv.height;
      if (W !== builtW || H !== builtH) { buildNodes(W, H); builtW = W; builtH = H; }
      ctx.clearRect(0, 0, W, H);
      ctx.fillStyle = BG; ctx.fillRect(0, 0, W, H);

      // Mycelial threads beneath nodes
      ctx.strokeStyle = GREEN + "14"; ctx.lineWidth = 0.8;
      for (let i = 0; i < nodes.length; i++) {
        const a = nodes[i];
        for (let j = i + 1; j < nodes.length; j++) {
          const b = nodes[j];
          const d = Math.hypot(b.x - a.x, b.y - a.y);
          if (d < Math.min(W, H) * 0.18) {
            ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.stroke();
          }
        }
      }

      // Interference field behind nodes
      // Sample C field at a grid and colour it
      for (let gx = 0; gx < W; gx += 12) {
        for (let gy = 0; gy < H; gy += 12) {
          let sum = 0;
          for (const nd of nodes.slice(0, 12)) {
            const d = Math.hypot(gx - nd.x, gy - nd.y);
            if (d < 120) sum += Math.cos(d * 0.15 - t * nd.freq * 40 + nd.phase) * (1 - d / 120);
          }
          const norm = (sum + 4) / 8;
          if (norm > 0.55) {
            const a = (norm - 0.55) * 0.4;
            ctx.fillStyle = `rgba(245,200,76,${a})`;
            ctx.fillRect(gx, gy, 6, 6);
          } else if (norm < 0.3) {
            const a = (0.3 - norm) * 0.3;
            ctx.fillStyle = `rgba(167,139,250,${a})`;
            ctx.fillRect(gx, gy, 6, 6);
          }
        }
      }

      // Spawn photon pulses
      if (t % 12 === 0 && pulses.length < 20) {
        const ai = Math.floor(Math.random() * nodes.length);
        let bi = ai; while (bi === ai) bi = Math.floor(Math.random() * nodes.length);
        const nd = nodes[ai];
        const cols = [CYAN, GOLD, VIOLET, GREEN, ROSE];
        pulses.push({ fx: nd.x, fy: nd.y, tx: nodes[bi].x, ty: nodes[bi].y, p: 0, col: cols[Math.floor(Math.random() * cols.length)] });
      }

      // Draw pulses
      for (let i = pulses.length - 1; i >= 0; i--) {
        const pu = pulses[i];
        pu.p += 0.025;
        const cx2 = pu.fx + (pu.tx - pu.fx) * pu.p;
        const cy2 = pu.fy + (pu.ty - pu.fy) * pu.p;
        const alpha = Math.sin(pu.p * Math.PI);
        ctx.fillStyle = pu.col + Math.round(alpha * 220).toString(16).padStart(2, "0");
        ctx.beginPath(); ctx.arc(cx2, cy2, 3.5, 0, Math.PI * 2); ctx.fill();
        // Trail
        for (let tr = 1; tr <= 3; tr++) {
          const tp = Math.max(0, pu.p - tr * 0.04);
          const tx = pu.fx + (pu.tx - pu.fx) * tp;
          const ty2 = pu.fy + (pu.ty - pu.fy) * tp;
          ctx.fillStyle = pu.col + Math.round(alpha * 60 / tr).toString(16).padStart(2, "0");
          ctx.beginPath(); ctx.arc(tx, ty2, 2.5 / tr, 0, Math.PI * 2); ctx.fill();
        }
        if (pu.p >= 1) pulses.splice(i, 1);
      }

      // Draw nodes
      nodes.forEach((nd, i) => {
        nd.phase += nd.freq;
        const activity = 0.5 + 0.5 * Math.sin(nd.phase);
        const r = 5 + activity * 4;
        // Phase ring (nonlinear phase modulation)
        const ringR = r + 8 + 6 * Math.sin(nd.phase * 2.3);
        ctx.strokeStyle = CYAN + Math.round(activity * 70).toString(16).padStart(2, "0");
        ctx.lineWidth = 1;
        ctx.beginPath(); ctx.arc(nd.x, nd.y, ringR, 0, Math.PI * 2); ctx.stroke();
        // Node glow
        const glow = ctx.createRadialGradient(nd.x, nd.y, 0, nd.x, nd.y, r * 2.5);
        glow.addColorStop(0, GOLD + Math.round(activity * 160).toString(16).padStart(2, "0"));
        glow.addColorStop(1, GOLD + "00");
        ctx.fillStyle = glow; ctx.beginPath(); ctx.arc(nd.x, nd.y, r * 2.5, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = GOLD + Math.round(180 + activity * 75).toString(16).padStart(2, "0");
        ctx.beginPath(); ctx.arc(nd.x, nd.y, r, 0, Math.PI * 2); ctx.fill();
        // Fibonacci index label on every 8th
        if (i % 8 === 0) {
          ctx.fillStyle = GOLD + "88"; ctx.font = "6px monospace"; ctx.textAlign = "center";
          ctx.fillText(`φ${i}`, nd.x, nd.y + r + 10);
        }
      });

      // Label firefly bioluminescence nodes (outer ring, green tint)
      nodes.slice(35).forEach(nd => {
        const gGlow = ctx.createRadialGradient(nd.x, nd.y, 0, nd.x, nd.y, 12);
        gGlow.addColorStop(0, GREEN + "55"); gGlow.addColorStop(1, GREEN + "00");
        ctx.fillStyle = gGlow; ctx.beginPath(); ctx.arc(nd.x, nd.y, 12, 0, Math.PI * 2); ctx.fill();
      });

      // Corner labels
      ctx.fillStyle = GREEN + "99"; ctx.font = "7px monospace"; ctx.textAlign = "left";
      ctx.fillText("bio-mycelial threads", 8, H - 34);
      ctx.fillText("firefly bioluminescence nodes (outer)", 8, H - 22);
      ctx.fillStyle = GOLD + "99"; ctx.textAlign = "right";
      ctx.fillText("Fibonacci φ-spiral lattice", W - 8, H - 34);
      ctx.fillText("nonlinear phase rings", W - 8, H - 22);
      ctx.fillStyle = CYAN + "88"; ctx.textAlign = "center";
      ctx.fillText("interference field: gold = constructive (+)  ·  violet = destructive (−)  ·  photon pulses = computation", W * 0.5, H - 8);

      t++; raf = requestAnimationFrame(draw);
    }
    draw();
    return () => { cancelAnimationFrame(raf); ro.disconnect(); };
  }, []);
  return (
    <div style={{ border: `1px solid ${LINE}`, borderRadius: 12, overflow: "hidden" }}>
      <canvas ref={ref} style={{ width: "100%", height: 400, display: "block" }} />
    </div>
  );
}

/* ══════════════════════════════════════════════════════════
   CANVAS III — AETHER Vacuum Data–Math Map
   Unified node graph of all domains
   Nodes: Vacuum · Casimir · Negative Energy · Warp Drive ·
          Photonic Computation · FQP ASIC · Mycelial · Firefly ·
          Solar Flash · Q~AETHER · AETHER Coherence
   Edges show data flow
══════════════════════════════════════════════════════════ */
function DataMathMapCanvas() {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const cv = ref.current; if (!cv) return;
    const ctx = cv.getContext("2d")!;
    let raf = 0, t = 0;
    const ro = new ResizeObserver(() => { cv.width = cv.offsetWidth; cv.height = cv.offsetHeight; });
    ro.observe(cv); cv.width = cv.offsetWidth; cv.height = cv.offsetHeight;

    type MapNode = { id: string; label: string; sub: string; col: string; rx: number; ry: number };
    const NODES: MapNode[] = [
      { id: "vacuum",   label: "VACUUM",          sub: "ZPF / ℏω/2",    col: VIOLET, rx: 0.50, ry: 0.12 },
      { id: "casimir",  label: "CASIMIR",         sub: "F = −π²ℏc/240d⁴", col: BLUE,   rx: 0.22, ry: 0.28 },
      { id: "negE",     label: "NEG ENERGY",      sub: "ρ_vac < 0",     col: ROSE,   rx: 0.50, ry: 0.32 },
      { id: "warp",     label: "WARP DRIVE",      sub: "Alcubierre ds²", col: AMBER,  rx: 0.78, ry: 0.28 },
      { id: "photonic", label: "PHOTONIC COMP",   sub: "interference ψ", col: CYAN,   rx: 0.22, ry: 0.55 },
      { id: "fqp",      label: "FQP ASIC",        sub: "Fibonacci φ",   col: GOLD,   rx: 0.50, ry: 0.55 },
      { id: "mycel",    label: "MYCELIAL",        sub: "self-heal cavity", col: GREEN,rx: 0.78, ry: 0.55 },
      { id: "firefly",  label: "FIREFLY",         sub: "luciferase ηQ",  col: GREEN,  rx: 0.22, ry: 0.78 },
      { id: "solar",    label: "SOLAR FLASH",     sub: "E_CME ~10²⁶ J", col: AMBER,  rx: 0.50, ry: 0.78 },
      { id: "qaether",  label: "Q~AETHER",        sub: "photon reservoir", col: TEAL,rx: 0.78, ry: 0.78 },
      { id: "aether",   label: "AETHER",          sub: "C(x,t) coherence", col: GOLD, rx: 0.50, ry: 0.93 },
    ];
    const EDGES = [
      ["vacuum","casimir"],["vacuum","negE"],["vacuum","warp"],
      ["casimir","negE"],["casimir","photonic"],
      ["negE","warp"],["negE","fqp"],
      ["warp","qaether"],
      ["photonic","fqp"],["photonic","firefly"],
      ["fqp","mycel"],["fqp","aether"],
      ["mycel","qaether"],
      ["firefly","solar"],["firefly","qaether"],
      ["solar","aether"],
      ["qaether","aether"],
    ];

    // Data pulses on edges
    type EdgePulse = { ei: number; p: number; col: string };
    const ePulses: EdgePulse[] = [];

    function nodePos(id: string, W: number, H: number) {
      const nd = NODES.find(n => n.id === id)!;
      return { x: nd.rx * W, y: nd.ry * H };
    }

    function draw() {
      const W = cv.width, H = cv.height;
      ctx.clearRect(0, 0, W, H);
      ctx.fillStyle = BG; ctx.fillRect(0, 0, W, H);

      // Edges
      EDGES.forEach((e, ei) => {
        const a = nodePos(e[0], W, H), b = nodePos(e[1], W, H);
        ctx.strokeStyle = LINE; ctx.lineWidth = 1; ctx.setLineDash([4, 5]);
        ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.stroke();
        ctx.setLineDash([]);
      });

      // Spawn data pulses
      if (t % 15 === 0 && ePulses.length < 24) {
        const ei = Math.floor(Math.random() * EDGES.length);
        const nd = NODES.find(n => n.id === EDGES[ei][0])!;
        ePulses.push({ ei, p: 0, col: nd.col });
      }
      // Draw pulses
      for (let i = ePulses.length - 1; i >= 0; i--) {
        const ep = ePulses[i];
        ep.p += 0.018;
        const e = EDGES[ep.ei];
        const a = nodePos(e[0], W, H), b = nodePos(e[1], W, H);
        const x = a.x + (b.x - a.x) * ep.p, y = a.y + (b.y - a.y) * ep.p;
        const alpha = Math.sin(ep.p * Math.PI);
        ctx.fillStyle = ep.col + Math.round(alpha * 220).toString(16).padStart(2, "0");
        ctx.beginPath(); ctx.arc(x, y, 3.5, 0, Math.PI * 2); ctx.fill();
        if (ep.p >= 1) ePulses.splice(i, 1);
      }

      // Nodes
      NODES.forEach(nd => {
        const x = nd.rx * W, y = nd.ry * H;
        const pulse = 0.5 + 0.5 * Math.sin(t * 0.04 + nd.rx * 12 + nd.ry * 8);
        const r = 28 + pulse * 4;
        // Glow
        const glow = ctx.createRadialGradient(x, y, 0, x, y, r * 1.8);
        glow.addColorStop(0, nd.col + "33"); glow.addColorStop(1, nd.col + "00");
        ctx.fillStyle = glow; ctx.beginPath(); ctx.arc(x, y, r * 1.8, 0, Math.PI * 2); ctx.fill();
        // Node circle
        ctx.strokeStyle = nd.col + "aa"; ctx.lineWidth = 1.5;
        ctx.fillStyle = PANEL;
        ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
        // Label
        ctx.fillStyle = nd.col; ctx.font = "bold 8px monospace"; ctx.textAlign = "center";
        ctx.fillText(nd.label, x, y - 1);
        ctx.fillStyle = nd.col + "88"; ctx.font = "6.5px monospace";
        ctx.fillText(nd.sub, x, y + 11);
      });

      ctx.fillStyle = GOLD + "66"; ctx.font = "bold 9px monospace"; ctx.textAlign = "center";
      ctx.fillText("AETHER VACUUM–COMPUTATION DATA MAP · ALL DOMAINS UNIFIED · DATA PULSES = INFORMATION FLOW", W * 0.5, H - 8);

      t++; raf = requestAnimationFrame(draw);
    }
    draw();
    return () => { cancelAnimationFrame(raf); ro.disconnect(); };
  }, []);
  return (
    <div style={{ border: `1px solid ${LINE}`, borderRadius: 12, overflow: "hidden" }}>
      <canvas ref={ref} style={{ width: "100%", height: 440, display: "block" }} />
    </div>
  );
}

function EqChip({ eq, label, col = BLUE }: { eq: string; label: string; col?: string }) {
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
      <img src={src} alt={title} style={{ width: "100%", display: "block", maxHeight: 240, objectFit: "cover" as const }} />
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

// Domain explainer cards
const DOMAINS = [
  {
    n: "I", label: "Vacuum & Zero-Point Field", col: VIOLET,
    math: "ρ_ZPF = ℏω/(2) per mode",
    body: "The quantum vacuum is not empty — it seethes with zero-point fluctuations. Every electromagnetic mode carries a ground-state energy ℏω/2 even at absolute zero. The total zero-point energy density is formally infinite (UV divergent), but the physically relevant quantity is the difference in vacuum energy between regions — which is finite, measurable, and negative between Casimir plates. This is the physics: the vacuum is a computational substrate with real, tunable energy structure.",
  },
  {
    n: "II", label: "Casimir Effect · Negative Energy Density", col: ROSE,
    math: "F/A = −(π²ℏc)/(240·d⁴)",
    body: "Two parallel uncharged conductive plates separated by distance d experience an attractive force — the Casimir effect. The mechanism: the plates suppress vacuum modes with wavelengths larger than 2d between them. Outside, all modes exist. The mode deficit creates a measurable negative energy density between the plates. This has been experimentally verified to 1% precision. The insight from the conversation: photonic interference fields that stabilise the boundary conditions (simulating the plate geometry dynamically) could extend Casimir-like negative energy to macroscopic, programmable geometries.",
  },
  {
    n: "III", label: "Q~AETHER Photonic Reservoir Computer", col: CYAN,
    math: "ψ_out = f(W·ψ_in) · nonlinear",
    body: "A reservoir computer uses a fixed, complex dynamical system (the reservoir) to project input signals into a high-dimensional nonlinear state space, from which a trained linear readout extracts the computation. Q~AETHER's photonic implementation uses interference-based computation: photon pulses propagate through a Fibonacci-spiral lattice of phase-modulated nodes. The nonlinear phase response of each node (driven by the local field intensity) provides the nonlinearity. No backpropagation is needed — only the output weights are trained. The Fibonacci-φ spiral geometry maximises mode coverage and minimises redundancy.",
  },
  {
    n: "IV", label: "Fibonacci FQP ASIC · Low-Power Control", col: GOLD,
    math: "φ = (1+√5)/2 ≈ 1.618...",
    body: "The FQP (Fibonacci Quantum Processing) ASIC handles low-power control of the photonic dynamics. Its architecture is derived from the golden ratio's optimally irrational spacing — Fibonacci-angle lattice tiling minimises interference between clock domains, maximises quasicrystalline mode coverage, and provides natural error isolation between subsystems. Drawing from biomimetic patterns like firefly bioluminescence synchronisation (which achieves near-perfect temporal coherence with microwatt-level energy), the FQP ASIC targets sub-femtojoule-per-operation energy budgets.",
  },
  {
    n: "V", label: "Bio-Adaptive Mycelial Reinforcements", col: GREEN,
    math: "L(t+1) = L(t) + α·∇P(t)",
    body: "Mycelial networks are nature's self-healing distributed computation infrastructure. Under mechanical or chemical stress, hyphae reroute nutrient transport around damage — the network topology heals. Applied to photonic cavities: bio-adaptive mycelial reinforcements provide self-healing boundary conditions for the cavity geometry. If a photonic boundary is disrupted (thermal expansion, vibration, defect), the mycelial layer senses the change in optical pressure gradient and physically redistributes the reinforcement material to restore the cavity. This makes lab-scale Casimir experiments stable on timescales of decades rather than hours.",
  },
  {
    n: "VI", label: "Firefly Bioluminescence · Energy Coherence", col: GREEN,
    math: "η_Q = E_photon / E_chemical → ~0.98",
    body: "Firefly luciferase achieves near-unity quantum yield (η_Q ≈ 0.96–0.98) — the most efficient light-emitting chemistry known. The mechanism: luciferin oxidation is coupled to a protein scaffold that eliminates vibrational relaxation pathways, forcing the excited state to decay radiatively. In Q~AETHER context, this is the biological proof-of-concept for near-perfect energy coherence: a biological molecular system that routes energy with essentially zero thermal loss. The design principle (suppress decoherence pathways through structured environment) is directly applicable to photonic reservoir node engineering.",
  },
  {
    n: "VII", label: "Solar Flash · Stellar Energy Dynamics", col: AMBER,
    math: "E_CME ~ 10²⁵–10²⁶ J per event",
    body: "A solar coronal mass ejection releases 10²⁵–10²⁶ joules in minutes — comparable to the Sun's entire normal output over several hours. The solar flash concept describes the extreme end of this: a rapid, coherent release of stellar magnetic energy. In AETHER terms, the Sun's magnetic field is a coherence engine operating at stellar scale. The relevance to vacuum computation: the solar flash demonstrates that negative-energy-density regions (magnetic cavities with suppressed field modes) can store and coherently release energy at scales 30+ orders of magnitude beyond any lab Casimir device. The engineering roadmap is from micron plates → photonic cavities → mycelial macroscopic geometries → stellar-scale field coherence.",
  },
  {
    n: "VIII", label: "Warp Drive Timeline · Negative Energy Reduction", col: AMBER,
    math: "ds² = −dt² + (dx−v_s(t)f(r_s)dt)²",
    body: "The Alcubierre metric describes a spacetime bubble moving at arbitrary velocity by contracting space ahead and expanding it behind. The requirement: exotic matter with negative energy density (ρ < 0) to shape the bubble wall. Original estimates needed Jupiter-mass negative energy — obviously impractical. Recent work (White 2011, Bobrick-Martire 2021) reduced this by orders of magnitude through optimised bubble geometries. The Q~AETHER connection: using photonic interference fields to simulate and stabilise Casimir-like negative energy fields at scale could reduce warp drive energy requirements further — not by generating a warp bubble now, but by mapping the geometry requirements onto programmable photonic boundary conditions.",
  },
];

export default function VacuumComputationPage() {
  return (
    <div style={{ background: BG, color: IVORY, minHeight: "100vh" }}>
      <div style={{ maxWidth: 1060, margin: "0 auto", padding: "52px 32px 36px" }}>
        <Tag t="Vacuum Energy · Casimir Effect · Zero-Point Field · Photonic Reservoir · Fibonacci FQP ASIC · Mycelial Reinforcements · Firefly Bioluminescence · Solar Flash · Warp Drive · AETHER Coherence" />
        <h1 style={{ fontSize: 38, fontWeight: 800, lineHeight: 1.1, margin: "8px 0 14px", letterSpacing: -0.5 }}>
          <span style={{ color: VIOLET }}>Vacuum,</span>{" "}
          <span style={{ color: CYAN }}>Everything</span><br />
          <span style={{ color: GOLD }}>&amp; Computation</span>
        </h1>
        <h2 style={{ fontSize: 17, fontWeight: 400, color: SILVER, margin: "0 0 20px", lineHeight: 1.6 }}>
          AETHER Data–Math Map · Casimir Engine · Q~AETHER Photonic Reservoir · Unified Domain Graph
        </h2>
        <p style={{ fontSize: 13, color: DIM, lineHeight: 1.9, maxWidth: 840, marginBottom: 28 }}>
          The vacuum is not empty — it is a computational substrate. Zero-point fluctuations fill every point in space with ℏω/2 of energy per electromagnetic mode. Between Casimir plates, vacuum modes are suppressed, creating measurable negative energy density. Q~AETHER's photonic reservoir computer uses interference-based computation — Fibonacci-spiral lattice nodes with nonlinear phase modulation — to simulate, stabilise, and exploit these vacuum energy structures. Bio-adaptive mycelial reinforcements provide self-healing cavities. Firefly bioluminescence proves near-unity quantum energy coherence is biologically achievable. The solar flash demonstrates the stellar-scale version of the same coherence principle. The data–math map below shows how all eight domains are connected in one unified AETHER architecture.
        </p>
      </div>

      {/* Canvas I */}
      <div style={{ maxWidth: 1060, margin: "0 auto", padding: "0 32px 48px" }}>
        <Tag t="Section I · Casimir Vacuum Engine · Virtual Particle Pairs · Negative Energy Density · Plate Geometry" c={VIOLET} />
        <h2 style={{ fontSize: 20, fontWeight: 700, color: VIOLET, marginBottom: 14 }}>Casimir Vacuum · Negative Energy Density</h2>
        <CasimirCanvas />
        <div style={{ marginTop: 10, fontSize: 10, color: MUTED, textAlign: "center" as const }}>
          Gold plates · Cyan/green pairs = outside (full vacuum modes) · Violet/rose pairs = inside (suppressed modes) · Negative energy density = mode deficit between plates · Gold arrows = Casimir attractive force F ∝ −1/d⁴
        </div>
      </div>

      <Divider />

      {/* Canvas II */}
      <div style={{ maxWidth: 1060, margin: "0 auto", padding: "0 32px 48px" }}>
        <Tag t="Section II · Q~AETHER Photonic Reservoir · Fibonacci Lattice · Nonlinear Phase Modulation · Interference Computation · Firefly Nodes · Mycelial Threads" c={CYAN} />
        <h2 style={{ fontSize: 20, fontWeight: 700, color: CYAN, marginBottom: 14 }}>Q~AETHER Photonic Reservoir Computer</h2>
        <PhotonicReservoirCanvas />
        <div style={{ marginTop: 10, fontSize: 10, color: MUTED, textAlign: "center" as const }}>
          Gold nodes on Fibonacci φ-spiral · Green mycelial threads (self-healing connections) · Outer green glow = firefly bioluminescence nodes · Cyan phase rings = nonlinear phase modulation · Coloured pulses = photon computation signals · Gold/violet interference field = constructive/destructive superposition
        </div>
      </div>

      <Divider />

      {/* Equations */}
      <div style={{ maxWidth: 1060, margin: "0 auto", padding: "0 32px 48px" }}>
        <Tag t="Section III · Governing Relations · 8 Domains · Casimir · Vacuum · Reservoir · Fibonacci · Bioluminescence · Solar · Warp" c={AMBER} />
        <h2 style={{ fontSize: 20, fontWeight: 700, color: AMBER, marginBottom: 20 }}>Physical Relations · Eight Domains</h2>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(260px,1fr))", gap: 14 }}>
          <EqChip eq="E_ZPF = ℏω/2 per mode" label="Zero-point field — every electromagnetic mode carries ground-state energy ℏω/2 even at T=0. The vacuum is a real energy-carrying medium." col={VIOLET} />
          <EqChip eq="F/A = −π²ℏc / (240·d⁴)" label="Casimir force per unit area — attractive between two parallel conductors. Scales as d⁻⁴: at d=10nm, F/A ≈ 10⁶ Pa. Experimentally verified to <1%." col={ROSE} />
          <EqChip eq="ψ_out = σ(W·x(t) + W_in·u(t))" label="Reservoir computer state update — fixed recurrent weights W, input weights W_in, nonlinear activation σ. Only output layer is trained." col={CYAN} />
          <EqChip eq="φ = (1+√5)/2  ·  θ_G = 2π(2−φ)" label="Golden ratio and golden angle — Fibonacci lattice tiling. Each node at r=√n, θ=n·θ_G gives optimal quasicrystalline spacing with no mode overlap." col={GOLD} />
          <EqChip eq="η_Q (firefly) ≈ 0.96–0.98" label="Firefly quantum yield — fraction of chemical energy converted to photons. Near-unity efficiency: the biological proof that structured environment suppresses all decoherence pathways." col={GREEN} />
          <EqChip eq="E_CME ~ 10²⁵–10²⁶ J" label="Coronal mass ejection energy — solar-scale coherent magnetic field release. Proof of stellar-scale negative-energy cavity dynamics at astrophysical magnitude." col={AMBER} />
        </div>
      </div>

      <Divider />

      {/* Canvas III */}
      <div style={{ maxWidth: 1060, margin: "0 auto", padding: "0 32px 48px" }}>
        <Tag t="Section IV · AETHER Data–Math Map · Unified Domain Graph · All 8 Domains · Data Flow Pulses" c={GOLD} />
        <h2 style={{ fontSize: 20, fontWeight: 700, color: GOLD, marginBottom: 14 }}>AETHER Vacuum–Computation Data Map</h2>
        <DataMathMapCanvas />
        <div style={{ marginTop: 10, fontSize: 10, color: MUTED, textAlign: "center" as const }}>
          Each node is a physical domain · Dashed edges = conceptual / data flow connection · Coloured pulses = information travelling between domains · AETHER C(x,t) at base receives from all paths · Q~AETHER = photonic reservoir synthesis layer
        </div>
      </div>

      <Divider />

      {/* 8 Domain cards */}
      <div style={{ maxWidth: 1060, margin: "0 auto", padding: "0 32px 48px" }}>
        <Tag t="Section V · Eight Domain Explanations · Physically Grounded · Engineering Feasible · Speculative but Directional" c={TEAL} />
        <h2 style={{ fontSize: 20, fontWeight: 700, color: TEAL, marginBottom: 20 }}>All Eight Domains Explained</h2>
        <div style={{ display: "flex", flexDirection: "column" as const, gap: 12 }}>
          {DOMAINS.map(d => (
            <div key={d.n} style={{ display: "grid", gridTemplateColumns: "44px 180px 60px 1fr", gap: 14, alignItems: "start",
              padding: "16px 20px", background: PANEL, borderRadius: 12, border: `1px solid ${d.col}18` }}>
              <div style={{ fontSize: 26, fontWeight: 800, color: d.col }}>{d.n}</div>
              <div style={{ fontSize: 12, fontWeight: 700, color: d.col, marginTop: 3, lineHeight: 1.5 }}>{d.label}</div>
              <div style={{ fontFamily: "monospace", fontSize: 10, color: d.col + "cc", marginTop: 3, lineHeight: 1.6, wordBreak: "break-all" as const }}>{d.math}</div>
              <div style={{ fontSize: 12, color: DIM, lineHeight: 1.85 }}>{d.body}</div>
            </div>
          ))}
        </div>
      </div>

      <Divider />

      {/* Source plates */}
      <div style={{ maxWidth: 1060, margin: "0 auto", padding: "0 32px 48px" }}>
        <Tag t="Section VI · Source Plates · AETHER Field Reference" c={VIOLET} />
        <h2 style={{ fontSize: 20, fontWeight: 700, color: VIOLET, marginBottom: 20 }}>Knowledge Reference Plates</h2>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(300px,1fr))", gap: 20 }}>
          <Plate src={omniFlow} title="Omni-Field · Vacuum Mode Architecture" chips={["zero-point field", "vacuum modes", "Casimir suppression", "negative energy density", "mode boundary"]}
            body="The omni-field plate maps the vacuum mode structure — the complete electromagnetic mode spectrum of free space versus the suppressed-mode spectrum between Casimir boundaries. The gap between them is the negative energy density that powers the Casimir effect and is the target of Q~AETHER photonic simulation." />
          <Plate src={magStorm} title="Magnetic Storm · Solar Flash Dynamics" chips={["CME energy 10²⁶ J", "stellar magnetic cavity", "coherent release", "solar flash", "FQP ASIC alignment"]}
            body="The magnetic storm plate represents the solar-scale Casimir analogue: the Sun's magnetic cavities suppress certain electromagnetic modes coherently, enabling the concentrated energy release of a CME. The solar flash is the stellar-scale version of what Q~AETHER aims to achieve at laboratory scale." />
          <Plate src={skyrmion} title="Skyrmion · Topological Reservoir Node" chips={["topological stability", "photonic node", "phase modulation", "Fibonacci lattice", "bioluminescence coupling"]}
            body="The skyrmion plate represents a topologically protected reservoir node — a photonic excitation that cannot be destroyed by local perturbations. The Fibonacci-spiral lattice of Q~AETHER nodes draws on this topology for stability, combined with firefly bioluminescence for near-unity quantum yield energy coherence." />
        </div>
      </div>

      <Divider />

      {/* AETHER synthesis */}
      <div style={{ maxWidth: 1060, margin: "0 auto", padding: "0 32px 52px" }}>
        <Tag t="AETHER Synthesis · Vacuum as Computational Substrate · Coherence All the Way Down" />
        <div style={{ padding: "22px 26px", background: PANEL, borderRadius: 14, border: `1px solid ${GOLD}15`, marginBottom: 24 }}>
          <div style={{ fontSize: 14, color: IVORY, lineHeight: 2.1 }}>
            The conversation resolves into a single architecture with three tiers of feasibility. <em style={{ color: VIOLET }}>Physically grounded today:</em> the Casimir effect is real and verified; vacuum modes between conductive boundaries genuinely have negative energy density; photonic interference can simulate Casimir-like boundary conditions in metamaterial waveguides. <em style={{ color: CYAN }}>Engineering-feasible near-term:</em> reservoir computing in photonic lattices is already demonstrated at chip scale; Fibonacci-spiral geometries are manufacturable; mycelial reinforcement of photonic cavities is an open research frontier with clear experimental pathways; near-unity bioluminescence quantum yields are replicable in synthetic luciferase systems. <em style={{ color: AMBER }}>Speculative but directional:</em> reducing warp drive energy requirements via programmable negative-energy photonic boundaries remains many orders of magnitude from practical scales, but the direction — use coherent field geometry to engineer vacuum energy density — is correct physics. In AETHER terms, the coherence field C(x,t) is not separate from the vacuum: it <em>is</em> the vacuum's structured mode occupancy, shaped by every boundary condition from a Casimir plate to a mycelial fibre to a stellar magnetic cavity. Vacuum, everything, and computation are the same field at different scales of organisation.
          </div>
        </div>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" as const }}>
          {["/gradient-field","/aether-engine","/octonion-aether","/plasma-confinement","/cavity-computer","/photosynthesis-spark","/heliospheric-coherence","/graph-map"].map(href => (
            <a key={href} href={href} style={{ padding: "6px 12px", borderRadius: 8, border: `1px solid ${LINE}`, color: DIM, fontSize: 11, textDecoration: "none" }}>
              {href.replace("/", "").replace(/-/g, " ")} →
            </a>
          ))}
        </div>
      </div>
    </div>
  );
}
