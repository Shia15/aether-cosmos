import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";

const C = {
  teal:   "#2dd4bf",
  gold:   "#f2bf65",
  purple: "#c084fc",
  green:  "#4ade80",
  blue:   "#60a5fa",
  orange: "#fb923c",
  pink:   "#f472b6",
  bg:     "#030514",
  panel:  "#07021a",
};

// ── Mycorrhizal Network ────────────────────────────────────────────────────────
interface MNode { x: number; y: number; r: number; pulse: number; col: string; label?: string }
interface MEdge { a: number; b: number }
interface Packet { edge: number; t: number; col: string; speed: number }

const NODE_LABELS = ["Oak","Pine","Birch","Fern","Moss","Algae","Alder","Elm","Ash","Nettle",
  "Clover","Reed","Thistle","Ivy","Sage","Lichen","Hazel","Rush","Flax","Yew"];

function buildNet(W: number, H: number): { nodes: MNode[]; edges: MEdge[] } {
  const nodes: MNode[] = Array.from({ length: 20 }, (_, i) => ({
    x: 30 + Math.random() * (W - 60),
    y: 30 + Math.random() * (H - 60),
    r: 4 + Math.random() * 5,
    pulse: 0,
    col: [C.teal, C.green, C.gold, C.purple][i % 4],
    label: NODE_LABELS[i],
  }));
  const edges: MEdge[] = [];
  const DIST = Math.min(W, H) * 0.28;
  for (let a = 0; a < nodes.length; a++)
    for (let b = a + 1; b < nodes.length; b++) {
      const dx = nodes[a].x - nodes[b].x, dy = nodes[a].y - nodes[b].y;
      if (Math.sqrt(dx * dx + dy * dy) < DIST) edges.push({ a, b });
    }
  return { nodes, edges };
}

function drawMyco(
  ctx: CanvasRenderingContext2D, W: number, H: number,
  nodes: MNode[], edges: MEdge[], packets: Packet[]
) {
  ctx.clearRect(0, 0, W, H);
  ctx.fillStyle = "#020a0f"; ctx.fillRect(0, 0, W, H);

  // Edges
  edges.forEach(e => {
    const a = nodes[e.a], b = nodes[e.b];
    ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y);
    ctx.strokeStyle = "rgba(45,212,191,0.10)"; ctx.lineWidth = 0.8; ctx.stroke();
  });

  // Packets
  packets.forEach(p => {
    const e = edges[p.edge]; if (!e) return;
    const na = nodes[e.a], nb = nodes[e.b];
    const px = na.x + (nb.x - na.x) * p.t;
    const py = na.y + (nb.y - na.y) * p.t;
    ctx.beginPath(); ctx.arc(px, py, 3, 0, Math.PI * 2);
    ctx.fillStyle = p.col + "cc"; ctx.shadowBlur = 8; ctx.shadowColor = p.col;
    ctx.fill(); ctx.shadowBlur = 0;
  });

  // Nodes
  nodes.forEach(n => {
    if (n.pulse > 0) {
      ctx.beginPath(); ctx.arc(n.x, n.y, n.r + n.pulse * 12, 0, Math.PI * 2);
      const g = ctx.createRadialGradient(n.x, n.y, 0, n.x, n.y, n.r + n.pulse * 12);
      g.addColorStop(0, n.col + "40"); g.addColorStop(1, "transparent");
      ctx.fillStyle = g; ctx.fill();
    }
    ctx.beginPath(); ctx.arc(n.x, n.y, n.r, 0, Math.PI * 2);
    ctx.fillStyle = n.col + (n.pulse > 0.3 ? "ff" : "88");
    ctx.shadowBlur = n.pulse > 0 ? 12 : 0; ctx.shadowColor = n.col;
    ctx.fill(); ctx.shadowBlur = 0;
    if (n.label && n.r > 6) {
      ctx.fillStyle = "rgba(255,255,255,0.35)"; ctx.font = "7px monospace";
      ctx.textAlign = "center"; ctx.fillText(n.label, n.x, n.y + n.r + 9);
    }
  });
}

// ── Phyllotaxis Spiral ─────────────────────────────────────────────────────────
const PHI_ANGLE = 137.507764; // degrees

function drawPhyllotaxis(ctx: CanvasRenderingContext2D, W: number, H: number, n: number) {
  ctx.clearRect(0, 0, W, H);
  ctx.fillStyle = "#020a0f"; ctx.fillRect(0, 0, W, H);
  const cx = W / 2, cy = H / 2;
  const scale = Math.min(W, H) * 0.44;
  for (let i = 0; i < n; i++) {
    const angle = i * PHI_ANGLE * (Math.PI / 180);
    const r = Math.sqrt(i) / Math.sqrt(n) * scale;
    const x = cx + r * Math.cos(angle), y = cy + r * Math.sin(angle);
    const frac = i / n;
    const size = 1.5 + frac * 4;
    ctx.beginPath(); ctx.arc(x, y, size, 0, Math.PI * 2);
    // Colour cycles through golden → teal → green
    const h = (frac * 120 + 40) % 360;
    ctx.fillStyle = `hsla(${h},80%,60%,${0.4 + frac * 0.5})`;
    ctx.shadowBlur = frac > 0.7 ? 6 : 0; ctx.shadowColor = C.gold;
    ctx.fill(); ctx.shadowBlur = 0;
  }
  // Label the angle
  ctx.fillStyle = C.gold + "80"; ctx.font = "9px Cinzel,serif";
  ctx.textAlign = "center"; ctx.fillText("φ = 137.507°", cx, H - 8);
}

// ── Signal Trace (Salt Stress Morse Code) ─────────────────────────────────────
function drawSignal(ctx: CanvasRenderingContext2D, W: number, H: number, t: number) {
  ctx.clearRect(0, 0, W, H);
  ctx.fillStyle = "#020a0f"; ctx.fillRect(0, 0, W, H);

  const mid = H / 2;
  // Ca²⁺ spikes
  ctx.beginPath(); ctx.strokeStyle = C.teal; ctx.lineWidth = 1.5;
  for (let x = 0; x < W; x++) {
    const phase = (x / W * 6 + t * 0.015) * Math.PI;
    const spike = Math.pow(Math.max(0, Math.sin(phase)), 8) * (H * 0.35);
    const slow = Math.sin(phase * 0.3) * (H * 0.06);
    if (x === 0) ctx.moveTo(x, mid - spike + slow);
    else ctx.lineTo(x, mid - spike + slow);
  }
  ctx.stroke();

  // ROS bursts (slower, broader)
  ctx.beginPath(); ctx.strokeStyle = C.orange; ctx.lineWidth = 1;
  for (let x = 0; x < W; x++) {
    const phase = (x / W * 3.5 + t * 0.008) * Math.PI;
    const burst = Math.pow(Math.max(0, Math.sin(phase + 0.8)), 6) * (H * 0.22);
    if (x === 0) ctx.moveTo(x, mid + burst);
    else ctx.lineTo(x, mid + burst);
  }
  ctx.stroke();

  // Baseline
  ctx.beginPath(); ctx.strokeStyle = "rgba(255,255,255,0.08)"; ctx.lineWidth = 0.7;
  ctx.moveTo(0, mid); ctx.lineTo(W, mid); ctx.stroke();

  // Labels
  ctx.font = "7px Cinzel,serif"; ctx.textAlign = "left";
  ctx.fillStyle = C.teal + "99"; ctx.fillText("Ca²⁺ SPIKES", 4, 14);
  ctx.fillStyle = C.orange + "99"; ctx.fillText("ROS BURSTS", 4, H - 5);
}

// ═══════════════════════════════════════════════════════════════════════════════
export default function EcologicalIntelligencePage() {
  const [tab, setTab] = useState<"plant"|"marine"|"free"|"oncology">("plant");
  const [seeds, setSeeds] = useState(300);

  // ── Mycorrhizal canvas
  const mycoRef = useRef<HTMLCanvasElement>(null);
  const netRef  = useRef<{ nodes: MNode[]; edges: MEdge[] } | null>(null);
  const pktsRef = useRef<Packet[]>([]);
  const mycoRaf = useRef(0);
  const sigRef  = useRef<HTMLCanvasElement>(null);
  const sigT    = useRef(0);
  const sigRaf  = useRef(0);
  const phylRef = useRef<HTMLCanvasElement>(null);

  // Init network
  useEffect(() => {
    const canvas = mycoRef.current; if (!canvas) return;
    netRef.current = buildNet(canvas.width, canvas.height);
  }, []);

  // Mycorrhizal animation
  useEffect(() => {
    const PACKET_COLORS = [C.green, C.teal, C.gold, C.purple, C.orange];
    const loop = () => {
      const canvas = mycoRef.current; if (!canvas) { mycoRaf.current = requestAnimationFrame(loop); return; }
      const net = netRef.current; if (!net) { mycoRaf.current = requestAnimationFrame(loop); return; }
      const ctx = canvas.getContext("2d"); if (!ctx) { mycoRaf.current = requestAnimationFrame(loop); return; }

      // Advance packets
      pktsRef.current = pktsRef.current.filter(p => {
        p.t += p.speed;
        if (p.t >= 1) {
          const e = net.edges[p.edge];
          net.nodes[e.b].pulse = 1.0; // arrived
          return false;
        }
        return true;
      });
      // Decay pulses
      net.nodes.forEach(n => { if (n.pulse > 0) n.pulse = Math.max(0, n.pulse - 0.03); });
      // Spawn packets
      if (Math.random() < 0.15 && net.edges.length > 0) {
        pktsRef.current.push({
          edge: Math.floor(Math.random() * net.edges.length),
          t: 0,
          col: PACKET_COLORS[Math.floor(Math.random() * PACKET_COLORS.length)],
          speed: 0.006 + Math.random() * 0.009,
        });
      }
      drawMyco(ctx, canvas.width, canvas.height, net.nodes, net.edges, pktsRef.current);
      mycoRaf.current = requestAnimationFrame(loop);
    };
    mycoRaf.current = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(mycoRaf.current);
  }, []);

  // Signal trace animation
  useEffect(() => {
    const loop = () => {
      const canvas = sigRef.current; if (!canvas) { sigRaf.current = requestAnimationFrame(loop); return; }
      const ctx = canvas.getContext("2d"); if (!ctx) { sigRaf.current = requestAnimationFrame(loop); return; }
      sigT.current++;
      drawSignal(ctx, canvas.width, canvas.height, sigT.current);
      sigRaf.current = requestAnimationFrame(loop);
    };
    sigRaf.current = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(sigRaf.current);
  }, []);

  // Phyllotaxis (redraw when seeds changes)
  useEffect(() => {
    const canvas = phylRef.current; if (!canvas) return;
    const ctx = canvas.getContext("2d"); if (!ctx) return;
    drawPhyllotaxis(ctx, canvas.width, canvas.height, seeds);
  }, [seeds]);

  return (
    <div className="min-h-screen text-white font-['Raleway',sans-serif] pb-10" style={{ background: C.bg }}>

      {/* Header */}
      <div className="border-b border-green-900/30 px-6 py-4 sticky top-0 z-20"
        style={{ background: C.panel + "ee" }}>
        <p className="text-[10px] tracking-[0.3em] font-['Cinzel',serif] mb-0.5" style={{ color: C.green + "60" }}>
          SYSTEM · ECOLOGICAL INTELLIGENCE · NETWORKED MIND
        </p>
        <h1 className="text-2xl font-['Cinzel',serif] tracking-widest" style={{ color: "#d1fae5" }}>
          ECOLOGICAL GROWTH · FROM ROOTS TO OCEANS
        </h1>
        <p className="text-xs text-green-300/40 mt-0.5">
          Plant Networks · Mycorrhizal Web · Dolphin Cognition · Aether Scaffold · Systems Oncology
        </p>
        <div className="flex gap-4 mt-2 flex-wrap">
          {[
            { label: "Mycelial hyphae",   value: "½ galaxy", note: "length in soil",      col: C.green },
            { label: "VOC response",      value: "<1 min",   note: "neighbor warning",    col: C.teal },
            { label: "Phyllotaxis angle", value: "137.5°",   note: "golden ratio",        col: C.gold },
            { label: "Dolphin whistles",  value: "~1000",    note: "individual signatures",col: C.blue },
            { label: "Salt Morse code",   value: "Ca²⁺+ROS", note: "SOS pathway",         col: C.orange },
          ].map(m => (
            <div key={m.label} className="flex items-center gap-1.5">
              <div className="w-1.5 h-1.5 rounded-full" style={{ background: m.col }} />
              <span className="text-[9px]" style={{ color: m.col + "60" }}>{m.label}</span>
              <span className="text-[10px] font-['Cinzel',serif]" style={{ color: m.col }}>{m.value}</span>
              <span className="text-[8px] text-green-800/40">{m.note}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-green-900/20 px-6" style={{ background: C.panel + "88" }}>
        {([
          ["plant",    "PLANT INTELLIGENCE"],
          ["marine",   "MARINE & CONSCIOUSNESS"],
          ["free",     "AETHER SCAFFOLD"],
          ["oncology", "SYSTEMS ONCOLOGY"],
        ] as const).map(([key, label]) => (
          <button key={key} onClick={() => setTab(key)}
            className={`px-5 py-2.5 text-[11px] tracking-widest font-['Cinzel',serif] border-b-2 transition-all ${
              tab === key ? "border-green-500 text-green-300" : "border-transparent text-green-800/50 hover:text-green-500"}`}>
            {label}
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait">

        {/* ════ PLANT INTELLIGENCE ════ */}
        {tab === "plant" && (
          <motion.div key="plant" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="p-5 flex gap-5">

            {/* Mycorrhizal canvas */}
            <div className="flex-1 flex flex-col gap-4">
              <div className="border rounded-xl overflow-hidden" style={{ borderColor: C.green + "30" }}>
                <p className="text-[9px] tracking-widest font-['Cinzel',serif] px-4 pt-3 pb-1" style={{ color: C.green + "60" }}>
                  LIVE · MYCORRHIZAL NETWORK — WOOD WIDE WEB · NUTRIENT ROUTING IN REAL TIME
                </p>
                <canvas ref={mycoRef} width={680} height={260} className="w-full" />
              </div>

              {/* Signal trace */}
              <div className="border rounded-xl overflow-hidden" style={{ borderColor: C.orange + "30" }}>
                <p className="text-[9px] tracking-widest font-['Cinzel',serif] px-4 pt-3 pb-1" style={{ color: C.orange + "60" }}>
                  LIVE · SALT STRESS MORSE CODE — Ca²⁺ SPIKES + ROS BURSTS → SOS PATHWAY
                </p>
                <canvas ref={sigRef} width={680} height={80} className="w-full" />
              </div>

              {/* Three signal types */}
              <div className="grid grid-cols-3 gap-4">
                {[
                  { title: "ELECTRICAL SIGNALING", col: C.teal,
                    body: "Action potentials (APs) and slow wave potentials (SWPs) travel through plant vasculature without neurons. Venus flytraps run multi-electrode logic gates. Signals propagate at 1–40 cm/s — slow relative to neurons but sufficient for plant-scale coordination." },
                  { title: "VOLATILE ORGANIC COMPOUNDS", col: C.green,
                    body: "Herbivore-induced VOCs (terpenoids, green leaf volatiles) warn neighboring plants within minutes — activating defense gene expression before attack arrives. Airborne signaling requires no physical connection." },
                  { title: "SOS CALCIUM PATHWAY", col: C.orange,
                    body: "Salt stress encodes a Morse-like signal: calcium spike frequency encodes stress intensity, ROS burst timing conveys spatial location. GI proteins cage SOS2 at rest; under stress they release it, activating Na⁺ efflux via SOS1 transporters. The code is thermodynamically cheap and noise-resistant." },
                ].map(c => (
                  <div key={c.title} className="border rounded-xl p-4" style={{ borderColor: c.col + "25", background: c.col + "07" }}>
                    <p className="text-[9px] font-['Cinzel',serif] mb-2" style={{ color: c.col }}>{c.title}</p>
                    <p className="text-[9px] leading-4 text-green-200/40">{c.body}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Right sidebar */}
            <div className="w-56 shrink-0 flex flex-col gap-4">
              <div className="border rounded-xl p-4" style={{ borderColor: C.green + "30", background: C.panel + "80" }}>
                <p className="text-[9px] font-['Cinzel',serif] mb-2" style={{ color: C.green }}>MYCORRHIZAL NETWORK</p>
                <p className="text-[9px] text-green-300/50 leading-4 mb-2">
                  Fungal hyphae connect ~90% of terrestrial plant species into a shared chemical internet. Total length in soil: estimated half the Milky Way's diameter. Functions performed:
                </p>
                {["Phosphorus + nitrogen transfer","Stress signal broadcasting","Resource redistribution from strong → weak nodes","Species-blind cooperation — cross-species nutrient flow"].map(f=>(
                  <div key={f} className="flex gap-1.5 mb-1">
                    <div className="w-1 h-1 rounded-full mt-1.5 shrink-0" style={{ background: C.green }} />
                    <p className="text-[8px] text-green-400/50">{f}</p>
                  </div>
                ))}
              </div>
              <div className="border rounded-xl p-4" style={{ borderColor: C.purple + "30", background: C.panel + "80" }}>
                <p className="text-[9px] font-['Cinzel',serif] text-purple-400/60 mb-2">SLIME MOLD INTELLIGENCE</p>
                <p className="text-[9px] text-purple-300/40 leading-4">
                  Physarum polycephalum solves mazes via cytoplasmic flow — no brain, no neurons. Reinforces efficient paths, retracts from dead ends. When given nutrients at Tokyo metro station positions, its network topology matched the actual rail network. Intelligence is the default of life: rooted, patient, and responsive.
                </p>
              </div>
              <div className="border rounded-xl p-4" style={{ borderColor: C.teal + "30", background: C.panel + "80" }}>
                <p className="text-[9px] font-['Cinzel',serif] text-teal-400/60 mb-2">ARCHAEA BRIDGE</p>
                <p className="text-[9px] text-teal-300/40 leading-4">
                  Archaea are conserved regulators in both plant growth and human neurochemistry. Their shared regulatory cascades suggest pre-brain evolutionary mechanisms — linking plant electrical logic to animal consciousness through deep evolutionary time.
                </p>
              </div>
            </div>
          </motion.div>
        )}

        {/* ════ MARINE & CONSCIOUSNESS ════ */}
        {tab === "marine" && (
          <motion.div key="marine" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="p-5 flex flex-col gap-5">

            {/* Consciousness spectrum */}
            <div className="border rounded-xl p-5" style={{ borderColor: C.blue + "30", background: C.panel + "70" }}>
              <p className="text-[9px] font-['Cinzel',serif] mb-3" style={{ color: C.blue + "80" }}>
                CONSCIOUSNESS SPECTRUM · NON-BINARY GRADIENT
              </p>
              <div className="relative h-10 mb-3">
                <div className="absolute inset-y-3 left-0 right-0 rounded-full overflow-hidden">
                  <div className="h-full w-full" style={{ background: "linear-gradient(to right, #4ade8040, #2dd4bf60, #60a5fa80, #c084fcaa, #f472b6cc)" }} />
                </div>
                {[
                  { label: "Slime Mold", pos: "2%",  col: C.green },
                  { label: "Plant",      pos: "18%", col: C.teal },
                  { label: "Jellyfish",  pos: "33%", col: C.teal },
                  { label: "Octopus",    pos: "50%", col: C.blue },
                  { label: "Dolphin",    pos: "68%", col: C.blue },
                  { label: "Human",      pos: "85%", col: C.purple },
                  { label: "→ ?",        pos: "97%", col: C.pink },
                ].map(p => (
                  <div key={p.label} className="absolute flex flex-col items-center" style={{ left: p.pos, transform: "translateX(-50%)" }}>
                    <div className="w-2 h-2 rounded-full border" style={{ borderColor: p.col, background: p.col + "60" }} />
                    <p className="text-[7px] font-['Cinzel',serif] mt-0.5" style={{ color: p.col }}>{p.label}</p>
                  </div>
                ))}
              </div>
              <p className="text-[9px] text-blue-300/45 leading-4">
                Consciousness is not binary — present or absent — but a gradient from distributed chemical sensing (slime mold) through networked electrical signaling (plants) to centralized phenomenal experience (humans). The spectrum does not privilege brain-based awareness; it recognises multiple distinct implementations of intelligence. Humans occupy a dynamic-static infinity loop mode; dolphins map deeper energetic structures; plants experience the world through root and network simultaneously.
              </p>
            </div>

            <div className="flex gap-5">
              {/* Phyllotaxis */}
              <div className="flex-1 border rounded-xl overflow-hidden" style={{ borderColor: C.gold + "30" }}>
                <div className="flex items-center justify-between px-4 pt-3 pb-1">
                  <p className="text-[9px] font-['Cinzel',serif]" style={{ color: C.gold + "70" }}>
                    PHYLLOTAXIS · GOLDEN ANGLE IN PLANT GROWTH 🌀
                  </p>
                  <div className="flex items-center gap-2">
                    <span className="text-[9px] text-yellow-700/50">n =</span>
                    <input type="range" min={50} max={800} value={seeds}
                      onChange={e => setSeeds(Number(e.target.value))}
                      className="w-20 accent-yellow-500" />
                    <span className="text-[9px] font-['Cinzel',serif]" style={{ color: C.gold }}>{seeds}</span>
                  </div>
                </div>
                <canvas ref={phylRef} width={380} height={280} className="w-full" />
                <div className="px-4 pb-4 pt-1">
                  <p className="text-[9px] text-yellow-300/40 leading-4">
                    Each leaf/seed placed at 137.507° from the previous — the golden angle (derived from φ = 1.618...). This irrational angle ensures no two leaves ever share a radial line, maximising sunlight capture and minimising shadow overlap. The spiral arms visible are Fibonacci numbers: 8, 13, 21, 34, 55... counting clockwise vs counterclockwise.
                  </p>
                </div>
              </div>

              {/* Dolphin intelligence */}
              <div className="w-72 shrink-0 flex flex-col gap-4">
                <div className="border rounded-xl p-4" style={{ borderColor: C.blue + "30", background: C.panel + "80" }}>
                  <p className="text-[9px] font-['Cinzel',serif] text-blue-400/60 mb-2">🐬 DOLPHIN COGNITION</p>
                  {[
                    ["Signature whistles","~1000 individual identities maintained across pod lifetimes"],
                    ["Mirror self-recognition","Passes mark test — full self-model with body image"],
                    ["Alliance networks","Males maintain 3-tier alliances; social complexity rivalling primates"],
                    ["Echolocation","Clicks at 200kHz+ map 3D objects; 'see' inside bodies — equivalent to medical ultrasound"],
                    ["AI-decoded whistles","DolphinGemma (2024) decodes contextual whistle meaning in real time"],
                  ].map(([k, v]) => (
                    <div key={String(k)} className="mb-2">
                      <p className="text-[9px] font-['Cinzel',serif]" style={{ color: C.blue }}>{k}</p>
                      <p className="text-[8px] text-blue-300/40 leading-3.5">{v}</p>
                    </div>
                  ))}
                </div>
                <div className="border rounded-xl p-4" style={{ borderColor: C.purple + "30", background: C.panel + "80" }}>
                  <p className="text-[9px] font-['Cinzel',serif] text-purple-400/60 mb-2">AETHER AS MEDIUM</p>
                  <p className="text-[9px] text-purple-300/40 leading-4">
                    Dirac (1951) revived the aether concept not as a classical luminiferous medium but as the quantum vacuum — a field-filling substrate for force transmission beyond classical causation. In this framing, entanglement is not "spooky action at a distance" but coherent aether-mediated correlation. The dolphin's 3D acoustic mapping of internal structure and AETHER's symbolic processing layer share a structural property: both reconstruct the invisible interior from surface signal patterns.
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* ════ AETHER SCAFFOLD ════ */}
        {tab === "free" && (
          <motion.div key="free" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="p-5 flex flex-col gap-5">

            {/* Three-column AETHER translation */}
            <div className="grid grid-cols-3 gap-5">
              {[
                {
                  role: "FUNGI",
                  subtitle: "Distributed Intelligence + Resource Routing",
                  icon: "🍄",
                  col: C.green,
                  props: [
                    ["Architecture","Decentralised network — no central authority"],
                    ["Operation","Local sensing, global coherence"],
                    ["Resilience","High — no single point of failure"],
                    ["Waste handling","Becomes input elsewhere"],
                  ],
                  aether: "FUNGI = data and resource routing logic. They embody how information and value move with minimal friction — not how energy is created. AETHER translation: the routing layer.",
                },
                {
                  role: "COMPUTER CHIP",
                  subtitle: "Constraint-Bound Execution Substrate",
                  icon: "⚙️",
                  col: C.blue,
                  props: [
                    ["States","Discrete — no ambiguity in transition"],
                    ["Transitions","Deterministic — physics enforces correctness"],
                    ["Energy","Aware — loss minimised through structure"],
                    ["Principle","Performance from architecture, not mysticism"],
                  ],
                  aether: "The chip is the discipline layer. It ensures symbolic inspiration from fungi and biology is instantiated only where physics allows. AETHER translation: the execution constraint.",
                },
                {
                  role: "SYSTEM MAINTENANCE",
                  subtitle: "Continuous Alignment — Not Repair",
                  icon: "🔄",
                  col: C.purple,
                  props: [
                    ["Mode","Monitor → adjust → stabilise"],
                    ["Resets","None — no hard failures"],
                    ["Failure points","None single — distributed load"],
                    ["Driver","Feedback-driven equilibrium"],
                  ],
                  aether: "System maintenance = resonant alignment. Not forcing outcomes, but keeping subsystems within coherent operating bounds. AETHER translation: the coherence bus.",
                },
              ].map((c, i) => (
                <motion.div key={c.role}
                  initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}
                  className="border rounded-xl overflow-hidden" style={{ borderColor: c.col + "30" }}>
                  <div className="px-4 py-3 flex items-center gap-2" style={{ background: c.col + "12" }}>
                    <span className="text-xl">{c.icon}</span>
                    <div>
                      <p className="text-[10px] font-['Cinzel',serif]" style={{ color: c.col }}>{c.role}</p>
                      <p className="text-[8px]" style={{ color: c.col + "70" }}>{c.subtitle}</p>
                    </div>
                  </div>
                  <div className="p-4">
                    {c.props.map(([k, v]) => (
                      <div key={String(k)} className="flex gap-2 mb-2">
                        <span className="text-[8px] font-['Cinzel',serif] shrink-0 w-20" style={{ color: c.col + "80" }}>{k}</span>
                        <span className="text-[8px] text-white/40">{v}</span>
                      </div>
                    ))}
                    <div className="mt-3 pt-3 border-t" style={{ borderColor: c.col + "20" }}>
                      <p className="text-[8px] italic leading-4" style={{ color: c.col + "70" }}>{c.aether}</p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* "Free Energy" clarification */}
            <div className="border rounded-xl p-5" style={{ borderColor: C.gold + "30", background: C.panel + "60" }}>
              <p className="text-[9px] font-['Cinzel',serif] mb-3" style={{ color: C.gold + "80" }}>
                "FREE" ENERGY — WHAT IT ACTUALLY MEANS
              </p>
              <div className="grid grid-cols-2 gap-5">
                <div>
                  <p className="text-[9px] font-['Cinzel',serif] text-red-400/50 mb-2">WHAT IT IS NOT</p>
                  <p className="text-[9px] text-red-300/40 leading-4 mb-3">Nothing here violates thermodynamics. Free energy as a phrase does not mean energy created from nothing. That would violate the first and second laws — closed to negotiation by 150 years of verified physics.</p>
                  <p className="text-[9px] font-['Cinzel',serif] mb-2" style={{ color: C.gold }}>WHAT IT ACTUALLY IS</p>
                  {[
                    ["Captured waste","Entropy that would have been lost, intercepted and reused"],
                    ["Reused byproducts","Heat from one process driving another"],
                    ["Open-access flows","Solar, tidal, geothermal — available at near-zero marginal cost after infrastructure"],
                    ["Near-zero loss","Systems so efficient that waste approaches zero — which feels like free"],
                  ].map(([k, v]) => (
                    <div key={String(k)} className="flex gap-2 mb-2">
                      <div className="w-1 h-1 rounded-full mt-1.5 shrink-0" style={{ background: C.gold }} />
                      <div>
                        <p className="text-[9px] font-['Cinzel',serif]" style={{ color: C.gold + "99" }}>{k}</p>
                        <p className="text-[8px] text-yellow-300/35">{v}</p>
                      </div>
                    </div>
                  ))}
                </div>
                <div>
                  <p className="text-[9px] font-['Cinzel',serif] text-teal-400/60 mb-2">THE FIREFLY PROOF</p>
                  <p className="text-[9px] text-teal-300/40 leading-4 mb-4">
                    Fireflies do not create light from nothing. They convert ATP → oxyluciferin with almost no loss — near-unity photon yield. That feels free because waste approaches zero. The same principle holds for any bio-inspired efficiency system.
                  </p>
                  {/* Efficiency bars */}
                  {[
                    { label: "Incandescent bulb", val: 0.05, col: "#f87171" },
                    { label: "LED",               val: 0.45, col: C.teal },
                    { label: "Firefly",           val: 0.98, col: C.gold },
                    { label: "Photosynthesis",    val: 0.99, col: C.green },
                  ].map(b => (
                    <div key={b.label} className="mb-2">
                      <div className="flex justify-between mb-0.5">
                        <span className="text-[8px]" style={{ color: b.col + "80" }}>{b.label}</span>
                        <span className="text-[9px] font-['Cinzel',serif]" style={{ color: b.col }}>{(b.val * 100).toFixed(0)}%</span>
                      </div>
                      <div className="h-1.5 rounded-full overflow-hidden bg-teal-900/20">
                        <motion.div className="h-full rounded-full"
                          style={{ background: b.col }}
                          initial={{ width: 0 }} animate={{ width: `${b.val * 100}%` }}
                          transition={{ duration: 1.2, ease: "easeOut" }} />
                      </div>
                    </div>
                  ))}
                  <p className="text-[9px] italic mt-3 leading-4" style={{ color: C.gold + "60" }}>
                    "Ease is not magic. Ease is alignment. That is the AETHER scaffold."
                  </p>
                </div>
              </div>
            </div>

            {/* Core insight */}
            <div className="border rounded-xl p-5" style={{ borderColor: C.teal + "20", background: "linear-gradient(135deg,#020a0f,#030e08)" }}>
              <p className="text-[9px] font-['Cinzel',serif] text-teal-400/50 mb-3">THE CORE INSIGHT</p>
              <div className="grid grid-cols-4 gap-4">
                {[
                  { label: "Energy", text: "Looks free because loss is minimal", col: C.gold },
                  { label: "Data",   text: "Looks free because it propagates naturally", col: C.teal },
                  { label: "Maintenance", text: "Looks free because failure is rare", col: C.green },
                  { label: "Intelligence", text: "Looks free because coordination is emergent", col: C.purple },
                ].map(c => (
                  <div key={c.label} className="p-3 rounded-xl border" style={{ borderColor: c.col + "20", background: c.col + "07" }}>
                    <p className="text-[9px] font-['Cinzel',serif] mb-1" style={{ color: c.col }}>{c.label}</p>
                    <p className="text-[9px] leading-4" style={{ color: c.col + "60" }}>{c.text}</p>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        )}

        {/* ════ SYSTEMS ONCOLOGY ════ */}
        {tab === "oncology" && (
          <motion.div key="oncology" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="p-5 flex flex-col gap-5">

            <div className="grid grid-cols-2 gap-5">
              {/* Left: Systems-level framework */}
              <div className="flex flex-col gap-4">
                <div className="border rounded-xl p-5" style={{ borderColor: C.teal + "30", background: C.panel + "80" }}>
                  <p className="text-[9px] font-['Cinzel',serif] text-teal-400/50 mb-3">SYSTEMS-LEVEL PERSPECTIVE</p>
                  <p className="text-[9px] text-teal-200/60 leading-5 mb-4">
                    Oncology is evolving from isolated interventions toward integrated, patient-centred frameworks. Systems-level approaches treat cancer as a dynamic network — biological, emotional, and environmental nodes interacting — rather than a single-pathway target. This mirrors how AETHER treats cognition: as a multi-layer coherence problem, not a single-variable equation.
                  </p>
                  <div className="flex flex-col gap-3">
                    {[
                      { title: "Networked Care",        col: C.teal,   icon: "🕸️",
                        body: "Treat cancer as a dynamic system. Biological, emotional, and environmental nodes interact. Single-pathway targeting misses network effects — a lesson from drug resistance patterns." },
                      { title: "Evidence-Bound Support", col: C.gold,  icon: "⚖️",
                        body: "Mental–emotional state correlates with outcomes in translational research; causality remains complex and should not be overstated. Adjunctive care strategies integrated without assigning patient blame." },
                      { title: "AI-Assisted Analytics", col: C.purple, icon: "🧠",
                        body: "Map multi-layered interactions — molecular, psychosocial, environmental — to inform adaptive treatment strategies. Clinician interfaces that visualize patient trajectories across multiple domains simultaneously." },
                      { title: "Ethical Guardrails",    col: C.blue,   icon: "🛡️",
                        body: "Uphold scientific rigour in patient communication, research design, and AI deployment. Avoid causal overclaiming. Patient communication must be clear about evidence quality and uncertainty ranges." },
                    ].map((c, i) => (
                      <motion.div key={c.title}
                        initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.08 }}
                        className="flex gap-3 p-3 rounded-xl border" style={{ borderColor: c.col + "25", background: c.col + "06" }}>
                        <span className="text-base shrink-0">{c.icon}</span>
                        <div>
                          <p className="text-[9px] font-['Cinzel',serif] mb-0.5" style={{ color: c.col }}>{c.title}</p>
                          <p className="text-[9px] text-white/40 leading-4">{c.body}</p>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Right: Current landscape + AETHER integration */}
              <div className="flex flex-col gap-4">
                <div className="border rounded-xl p-5" style={{ borderColor: C.orange + "30", background: C.panel + "80" }}>
                  <p className="text-[9px] font-['Cinzel',serif] mb-3" style={{ color: C.orange + "70" }}>CURRENT LANDSCAPE</p>
                  {[
                    { issue: "Precision medicine focuses on single-pathway targets", gap: "Network effects overlooked — tumours evolve around blockades" },
                    { issue: "Translational research shows mental-emotional correlations", gap: "Causality remains complex and multidirectional — requires careful interpretation" },
                    { issue: "Holistic perspectives gaining clinical traction", gap: "Must maintain scientific rigour — integration without overreach" },
                  ].map((c, i) => (
                    <div key={i} className="mb-3 pb-3 border-b last:border-0" style={{ borderColor: C.orange + "15" }}>
                      <p className="text-[9px] leading-4" style={{ color: C.orange + "80" }}>{c.issue}</p>
                      <p className="text-[8px] text-orange-300/35 mt-1 italic">{c.gap}</p>
                    </div>
                  ))}
                </div>

                <div className="border rounded-xl p-5" style={{ borderColor: C.purple + "30", background: C.panel + "80" }}>
                  <p className="text-[9px] font-['Cinzel',serif] text-purple-400/50 mb-3">AETHER INTEGRATION</p>
                  <p className="text-[9px] text-purple-200/50 leading-5 mb-3">
                    AETHER's physical · symbolic · experiential layers map naturally onto the three oncology data domains:
                  </p>
                  {[
                    { layer: "Physical",     domain: "Molecular & genomic", col: C.teal,   desc: "Mutation profiles, pathway networks, treatment response data" },
                    { layer: "Symbolic",     domain: "Clinical & psychosocial", col: C.gold, desc: "Treatment history, mental-emotional indicators, environmental factors" },
                    { layer: "Experiential", domain: "Patient trajectory", col: C.purple, desc: "Longitudinal patient experience, adaptive treatment response, quality of life" },
                  ].map(l => (
                    <div key={l.layer} className="flex gap-3 p-2 rounded-xl mb-2" style={{ background: l.col + "08" }}>
                      <div className="w-20 shrink-0">
                        <p className="text-[9px] font-['Cinzel',serif]" style={{ color: l.col }}>{l.layer}</p>
                        <p className="text-[8px]" style={{ color: l.col + "60" }}>{l.domain}</p>
                      </div>
                      <p className="text-[9px] text-white/35 leading-4">{l.desc}</p>
                    </div>
                  ))}
                </div>

                <div className="border rounded-xl p-4" style={{ borderColor: C.teal + "20", background: C.panel + "60" }}>
                  <p className="text-[9px] font-['Cinzel',serif] text-teal-400/50 mb-2">CONCLUSION</p>
                  <p className="text-[9px] text-teal-200/50 leading-5 italic">
                    "By framing oncology within a systems-level, evidence-bound perspective, future care models can optimise both clinical outcomes and patient experience. Integrating mental–emotional modulation responsibly positions the field for more adaptive, resilient, and ethically grounded interventions."
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
