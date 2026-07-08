import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";

const C = {
  teal: "#2dd4bf", gold: "#f2bf65", purple: "#c084fc",
  green: "#4ade80", blue: "#60a5fa", rose: "#fb7185",
  bg: "#030514", panel: "#07021a",
};

// ── Timeline data ─────────────────────────────────────────────────────────────
const ANCHOR_YEAR = 2025 + 7/12; // August 2025 as decimal year
const ARC_START   = 2022.5;
const ARC_END     = 2033.0;
const MIDPOINT    = ANCHOR_YEAR + 3.5; // midpoint of 7-year arc

interface TEvent { year: number; label: string; note: string; key?: boolean }

const TRACKS: { id: string; label: string; col: string; events: TEvent[] }[] = [
  {
    id: "creative", label: "CREATIVE EMERGENCE", col: C.gold,
    events: [
      { year: 2022.8, label: "Documentation begins", note: "Personal pattern mapping initiated" },
      { year: 2023.7, label: "Convergence noticed", note: "Signals across domains start rhyming" },
      { year: 2024.5, label: "Pattern recognition", note: "Cross-domain acceleration logged" },
      { year: 2025.6, label: "August 2025 — ANCHOR", note: "Creative work accelerates; arc begins", key: true },
      { year: 2026.3, label: "Present: AETHER", note: "Convergence documented in system form" },
      { year: 2028.2, label: "Midpoint projection", note: "Systems that did not adapt face crisis" },
      { year: 2032.6, label: "Arc completion", note: "7-year cycle: new coherence or collapse" },
    ],
  },
  {
    id: "science", label: "SCIENTIFIC MILESTONES", col: C.teal,
    events: [
      { year: 2022.9, label: "GPT-4 / multimodal AI", note: "Large language models reach general-purpose capability" },
      { year: 2023.8, label: "AI medical diagnosis", note: "FDA-cleared AI outperforms specialists in radiology" },
      { year: 2024.7, label: "Quantum error correction", note: "Google Willow: first logical qubit breakthrough" },
      { year: 2025.5, label: "Bio-EM research surge", note: "Schumann-brainwave correlations gain institutional funding", key: true },
      { year: 2026.1, label: "AI-biology convergence", note: "Protein-folding AI redesigns drug pipelines" },
      { year: 2028.0, label: "Phase transition zone", note: "Quantum + bio + AI integration reaches deployment scale" },
      { year: 2030.5, label: "New substrate era", note: "Biological computing moves beyond silicon metaphor" },
    ],
  },
  {
    id: "symbolic", label: "SYMBOLIC FRAMEWORKS", col: C.purple,
    events: [
      { year: 2022.0, label: "Shemitah year 5782", note: "7-year Hebrew release cycle: debt, land, rest, renewal" },
      { year: 2023.4, label: "Kondratiev trough", note: "50-60yr economic wave: destruction preceding reconstruction" },
      { year: 2024.3, label: "Maya Tun alignment", note: "Haab calendar phase: infrastructure disruption → renewal" },
      { year: 2025.6, label: "Multi-framework convergence", note: "7-yr, 50-yr, Fibonacci, and celestial cycles overlap", key: true },
      { year: 2026.9, label: "Narrative crystallization", note: "Explanation follows pattern; pattern precedes explanation" },
      { year: 2029.0, label: "Vedic Dasha transition", note: "Planetary period shift: consolidation of 7-yr gains" },
      { year: 2032.0, label: "Shemitah 5790", note: "Next 7-year cycle opens: what was built in 2025 is tested" },
    ],
  },
  {
    id: "ethics", label: "ETHICAL INFLECTION", col: C.rose,
    events: [
      { year: 2023.0, label: "EU AI Act draft", note: "First binding AI governance framework in history" },
      { year: 2024.2, label: "WHO pandemic treaty", note: "Global health data transparency mandate drafted" },
      { year: 2024.9, label: "Long-term monitoring calls", note: "Post-deployment surveillance becomes standard demand" },
      { year: 2025.6, label: "Informed trust inflection", note: "Public shifts from blind trust to evidenced accountability", key: true },
      { year: 2026.5, label: "Transparency as standard", note: "Science accountability replaces opacity as default" },
      { year: 2028.5, label: "Midpoint reckoning", note: "Systems built without accountability face public correction" },
      { year: 2031.0, label: "New care paradigm", note: "Medicine redesigned around every human body, not averages" },
    ],
  },
];

// ── Canvas drawing ────────────────────────────────────────────────────────────
function drawTimeline(ctx: CanvasRenderingContext2D, W: number, H: number, scanX: number, t: number) {
  ctx.clearRect(0, 0, W, H);
  const bg = ctx.createLinearGradient(0, 0, 0, H);
  bg.addColorStop(0, "#020310"); bg.addColorStop(1, "#000000");
  ctx.fillStyle = bg; ctx.fillRect(0, 0, W, H);

  const PAD_L = 100, PAD_R = 30, PAD_T = 28, PAD_B = 24;
  const TW = W - PAD_L - PAD_R;
  const TH = H - PAD_T - PAD_B;
  const ROWS = TRACKS.length;
  const ROW_H = TH / ROWS;

  function xOf(year: number) { return PAD_L + ((year - ARC_START) / (ARC_END - ARC_START)) * TW; }

  // Year grid
  for (let yr = Math.ceil(ARC_START); yr <= ARC_END; yr++) {
    const x = xOf(yr);
    ctx.beginPath(); ctx.moveTo(x, PAD_T); ctx.lineTo(x, H - PAD_B);
    ctx.strokeStyle = "rgba(255,255,255,0.04)"; ctx.lineWidth = 1; ctx.stroke();
    ctx.fillStyle = "rgba(255,255,255,0.2)"; ctx.font = "7px monospace"; ctx.textAlign = "center";
    ctx.fillText(String(yr), x, H - 8);
  }

  // 7-year arc bracket
  const ax = xOf(ANCHOR_YEAR), ex = xOf(ANCHOR_YEAR + 7);
  ctx.beginPath(); ctx.moveTo(ax, PAD_T - 18); ctx.lineTo(ex, PAD_T - 18);
  ctx.strokeStyle = C.gold + "60"; ctx.lineWidth = 1.5; ctx.stroke();
  [ax, ex].forEach(bx => {
    ctx.beginPath(); ctx.moveTo(bx, PAD_T - 22); ctx.lineTo(bx, PAD_T - 14);
    ctx.strokeStyle = C.gold + "60"; ctx.lineWidth = 1.5; ctx.stroke();
  });
  ctx.fillStyle = C.gold + "80"; ctx.font = "7px Cinzel,serif"; ctx.textAlign = "center";
  ctx.fillText("7-YEAR ARC", (ax + ex) / 2, PAD_T - 22);

  // Midpoint zone
  const mx = xOf(MIDPOINT);
  const mzW = TW * 0.08;
  ctx.fillStyle = "rgba(251,113,133,0.06)";
  ctx.fillRect(mx - mzW, PAD_T, mzW * 2, TH);
  ctx.fillStyle = C.rose + "50"; ctx.font = "6px Cinzel,serif"; ctx.textAlign = "center";
  ctx.fillText("MIDPOINT", mx, PAD_T + 10);

  // Track lanes
  TRACKS.forEach((tr, ti) => {
    const cy = PAD_T + ROW_H * ti + ROW_H * 0.5;

    // Track label (left)
    ctx.fillStyle = tr.col + "50"; ctx.font = "6px Cinzel,serif"; ctx.textAlign = "right";
    ctx.fillText(tr.label, PAD_L - 6, cy + 2);

    // Track baseline
    ctx.beginPath(); ctx.moveTo(PAD_L, cy); ctx.lineTo(PAD_L + TW, cy);
    ctx.strokeStyle = tr.col + "20"; ctx.lineWidth = 0.5; ctx.stroke();

    // Events
    tr.events.forEach((ev, ei) => {
      const ex2 = xOf(ev.year);
      const r = ev.key ? 6 : 4;
      const glow = ev.key ? 20 : 8;
      const pulse = ev.key ? 1 + Math.sin(t * 0.04 + ei) * 0.3 : 1;

      // Dot
      ctx.beginPath(); ctx.arc(ex2, cy, r * pulse, 0, Math.PI * 2);
      ctx.fillStyle = tr.col + (ev.key ? "ff" : "cc");
      ctx.shadowBlur = glow * pulse; ctx.shadowColor = tr.col;
      ctx.fill(); ctx.shadowBlur = 0;

      // Label above/below alternating
      const above = ei % 2 === 0;
      ctx.fillStyle = tr.col + (ev.key ? "ee" : "80");
      ctx.font = `${ev.key ? "bold " : ""}7px Cinzel,serif`; ctx.textAlign = "center";
      ctx.fillText(ev.label, ex2, cy + (above ? -r - 4 : r + 9));
    });
  });

  // Vertical convergence lines connecting key events
  const kx = xOf(ANCHOR_YEAR);
  TRACKS.forEach((tr, ti) => {
    const cy = PAD_T + ROW_H * ti + ROW_H * 0.5;
    if (ti < TRACKS.length - 1) {
      const ny = PAD_T + ROW_H * (ti + 1) + ROW_H * 0.5;
      ctx.beginPath(); ctx.moveTo(kx, cy); ctx.lineTo(kx, ny);
      ctx.strokeStyle = C.gold + "30"; ctx.lineWidth = 1;
      ctx.setLineDash([2, 4]); ctx.stroke(); ctx.setLineDash([]);
    }
  });

  // Anchor line
  ctx.beginPath(); ctx.moveTo(kx, PAD_T); ctx.lineTo(kx, H - PAD_B);
  ctx.strokeStyle = C.gold + "50"; ctx.lineWidth = 2;
  const pulse2 = 0.4 + Math.abs(Math.sin(t * 0.03)) * 0.3;
  ctx.globalAlpha = pulse2; ctx.stroke(); ctx.globalAlpha = 1;
  ctx.fillStyle = C.gold; ctx.font = "bold 8px Cinzel,serif"; ctx.textAlign = "center";
  ctx.fillText("AUG 2025", kx, PAD_T + 6);

  // Scan cursor
  if (scanX > 0) {
    ctx.beginPath(); ctx.moveTo(scanX, PAD_T); ctx.lineTo(scanX, H - PAD_B);
    ctx.strokeStyle = "rgba(255,255,255,0.15)"; ctx.lineWidth = 1;
    ctx.setLineDash([3, 3]); ctx.stroke(); ctx.setLineDash([]);
    const yr = ARC_START + ((scanX - PAD_L) / TW) * (ARC_END - ARC_START);
    if (yr >= ARC_START && yr <= ARC_END) {
      ctx.fillStyle = "rgba(255,255,255,0.5)"; ctx.font = "7px monospace"; ctx.textAlign = "center";
      ctx.fillText(yr.toFixed(1), scanX, PAD_T + 4);
    }
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
function UnifiedTimelineHeaderCanvas() {
  const ref = useRef<HTMLCanvasElement>(null);
  const rafRef = useRef(0);
  useEffect(() => {
    const canvas = ref.current; if (!canvas) return;
    const ctx = canvas.getContext("2d")!;
    canvas.width = 900; canvas.height = 145;
    const W = canvas.width, H = canvas.height;
    let t=0;
    const events=8;
    const draw=()=>{
      ctx.fillStyle="rgba(2,4,8,0.3)"; ctx.fillRect(0,0,W,H);
      ctx.beginPath();ctx.moveTo(20,H/2);ctx.lineTo(W-20,H/2);ctx.strokeStyle="rgba(201,168,76,0.2)";ctx.lineWidth=0.5;ctx.stroke();
      for(let i=0;i<events;i++){
        const x=30+i*(W-60)/events;
        const pulse=0.5+0.5*Math.sin(t*0.05+i*0.8);
        const r=4+pulse*4;
        ctx.beginPath();ctx.arc(x,H/2,r,0,Math.PI*2);ctx.fillStyle=`rgba(201,168,76,${0.1+pulse*0.2})`;ctx.fill();
        ctx.beginPath();ctx.arc(x,H/2,3,0,Math.PI*2);ctx.fillStyle=`rgba(201,168,76,${0.4+pulse*0.4})`;ctx.fill();
        const lineH=20+pulse*15;
        ctx.beginPath();ctx.moveTo(x,H/2-3);ctx.lineTo(x,H/2-lineH);ctx.strokeStyle=`rgba(201,168,76,${0.2+pulse*0.2})`;ctx.lineWidth=0.6;ctx.stroke();
        ctx.fillStyle=`rgba(201,168,76,0.3)`;ctx.font="7px 'DM Mono',monospace";ctx.textAlign="center";ctx.fillText(`E${i+1}`,x,H/2-lineH-4);ctx.textAlign="left";
      }
      const scanX=(t*1.5)%W;
      ctx.beginPath();ctx.moveTo(scanX,0);ctx.lineTo(scanX,H);ctx.strokeStyle="rgba(201,168,76,0.06)";ctx.lineWidth=0.4;ctx.stroke();
      ctx.fillStyle="rgba(201,168,76,0.3)"; ctx.font="9px 'DM Mono',monospace";
      ctx.fillText("UNIFIED TIMELINE · CHRONOLOGICAL MAP · EVENT HORIZON · HISTORICAL ARC · AETHER",14,14);
      t++; rafRef.current=requestAnimationFrame(draw);
    };
    draw();
    return ()=>cancelAnimationFrame(rafRef.current);
  },[]);
  return <canvas ref={ref} style={{width:"100%",height:"auto",borderRadius:8,display:"block"}} />;
}

export default function UnifiedTimelinePage() {
  const [tab, setTab] = useState<"timeline"|"medicine"|"patterns"|"invitation">("timeline");
  const [hoveredTrack, setHoveredTrack] = useState<string | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rafRef    = useRef(0);
  const tRef      = useRef(0);
  const scanXRef  = useRef(-1);

  useEffect(() => {
    const loop = () => {
      tRef.current++;
      const cv = canvasRef.current;
      if (cv) {
        const ctx = cv.getContext("2d");
        if (ctx) drawTimeline(ctx, cv.width, cv.height, scanXRef.current, tRef.current);
      }
      rafRef.current = requestAnimationFrame(loop);
    };
    rafRef.current = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(rafRef.current);
  }, []);

  function handleCanvasMove(e: React.MouseEvent<HTMLCanvasElement>) {
    const rect = e.currentTarget.getBoundingClientRect();
    scanXRef.current = (e.clientX - rect.left) * (e.currentTarget.width / rect.width);
  }

  return (
    <div className="min-h-screen text-white font-['Raleway',sans-serif] pb-10" style={{ background: C.bg }}>
      {/* Header */}
      <div className="border-b px-6 py-4 sticky top-0 z-20"
        style={{ background: C.panel + "ee", borderColor: C.gold + "25" }}>
        <p className="text-[10px] tracking-[0.3em] font-['Cinzel',serif] mb-0.5" style={{ color: C.gold + "55" }}>
          SYSTEM · TEMPORAL COHERENCE · PATTERN MAP
        </p>
        <h1 className="text-xl font-['Cinzel',serif] tracking-widest" style={{ color: "#fef9e7" }}>
          LINING IT UP · A UNIFIED TIMELINE OF MEANING, SCIENCE, AND CREATIVE EMERGENCE
        </h1>
        <p className="text-xs mt-0.5" style={{ color: C.gold + "45" }}>
          7-Year Arc · Anchored August 2025 · 4 Convergent Tracks · Early Signal Detection
        </p>
        <div className="flex gap-4 mt-2 flex-wrap">
          {[
            { label: "Arc anchor",   value: "Aug 2025",  note: "creative acceleration begins",        col: C.gold },
            { label: "Arc length",   value: "7 years",   note: "completion: 2032",                    col: C.teal },
            { label: "Midpoint",     value: "2029",      note: "crisis or clarity",                    col: C.rose },
            { label: "Tracks",       value: "4",         note: "creative · science · symbolic · ethics", col: C.purple },
            { label: "Core thesis",  value: "informed trust", note: "built through truth & time",     col: C.green },
          ].map(m => (
            <div key={m.label} className="flex items-center gap-1.5">
              <div className="w-1.5 h-1.5 rounded-full" style={{ background: m.col }} />
              <span className="text-[9px]" style={{ color: m.col + "55" }}>{m.label}</span>
              <span className="text-[10px] font-['Cinzel',serif]" style={{ color: m.col }}>{m.value}</span>
              <span className="text-[8px] text-white/20">{m.note}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-amber-900/20 px-6" style={{ background: C.panel + "88" }}>
        {([["timeline","THE TIMELINE"],["medicine","MEDICINE & CLARITY"],["patterns","PATTERN DETECTION"],["invitation","INVITATION"]] as const).map(([k,l]) => (
          <button key={k} onClick={() => setTab(k)}
            className={`px-5 py-2.5 text-[11px] tracking-widest font-['Cinzel',serif] border-b-2 transition-all ${
              tab===k ? "border-amber-500 text-amber-300" : "border-transparent text-amber-800/40 hover:text-amber-400"}`}>
            {l}
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait">

        {/* ════ TIMELINE ════ */}
        {tab === "timeline" && (
          <motion.div key="tl" initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }} className="p-5 flex flex-col gap-4">
            <div className="border rounded-xl overflow-hidden" style={{ borderColor: C.gold + "25" }}>
              <p className="text-[9px] tracking-widest font-['Cinzel',serif] px-4 pt-3 pb-1 text-amber-400/40">
                MOVE CURSOR OVER TIMELINE TO SCAN · GOLD LINE = ARC ANCHOR (AUG 2025) · PINK ZONE = MIDPOINT CRISIS WINDOW
              </p>
              <canvas
                ref={canvasRef} width={980} height={300}
                className="w-full cursor-crosshair"
                style={{ background: "#000" }}
                onMouseMove={handleCanvasMove}
                onMouseLeave={() => { scanXRef.current = -1; }}
              />
            </div>

            {/* Track detail cards */}
            <div className="grid grid-cols-4 gap-4">
              {TRACKS.map(tr => (
                <motion.div key={tr.id}
                  className="border rounded-xl overflow-hidden"
                  style={{ borderColor: tr.col + "25" }}
                  whileHover={{ scale: 1.01 }}>
                  <div className="px-3 py-2" style={{ background: tr.col + "12" }}>
                    <p className="text-[8px] font-['Cinzel',serif]" style={{ color: tr.col }}>{tr.label}</p>
                  </div>
                  <div className="px-3 py-2" style={{ background: C.panel + "60" }}>
                    {tr.events.map(ev => (
                      <div key={ev.label} className={`mb-1.5 pb-1.5 border-b last:border-0 last:mb-0 last:pb-0 ${ev.key ? "bg-" : ""}`}
                        style={{ borderColor: tr.col + "15" }}>
                        <div className="flex items-center gap-1.5">
                          <div className="w-1.5 h-1.5 rounded-full shrink-0" style={{ background: tr.col + (ev.key ? "ff" : "60") }} />
                          <span className="text-[8px] font-['Cinzel',serif]" style={{ color: tr.col + (ev.key ? "ee" : "80") }}>{ev.label}</span>
                          <span className="text-[7px] ml-auto shrink-0" style={{ color: tr.col + "50" }}>{ev.year.toFixed(0)}</span>
                        </div>
                        <p className="text-[7px] leading-3 mt-0.5 pl-3" style={{ color: tr.col + "45" }}>{ev.note}</p>
                      </div>
                    ))}
                  </div>
                </motion.div>
              ))}
            </div>

            <div className="border rounded-xl p-4 flex items-center gap-4" style={{ borderColor: C.rose + "25", background: C.rose + "07" }}>
              <div className="shrink-0 text-center px-4">
                <p className="text-3xl font-['Cinzel',serif]" style={{ color: C.rose }}>2029</p>
                <p className="text-[8px] text-rose-400/50 font-['Cinzel',serif]">MIDPOINT</p>
              </div>
              <div>
                <p className="text-[9px] font-['Cinzel',serif] mb-1" style={{ color: C.rose }}>THE MIDPOINT CRISIS</p>
                <p className="text-[9px] text-rose-300/45 leading-4">"How do we recognize when a system has entered a new phase before the midpoint crisis forces clarity?" — Systems that fail to adapt in the first half of a 7-year arc face a reckoning at the midpoint. This is true in biology (immune overshoot), economics (Kondratiev trough), therapy (individuation crisis), and institutional design. The patterns were present before the crisis. The crisis makes them undeniable.</p>
              </div>
            </div>
          </motion.div>
        )}

        {/* ════ MEDICINE & CLARITY ════ */}
        {tab === "medicine" && (
          <motion.div key="med" initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }} className="p-5 flex flex-col gap-5">
            <div className="border rounded-xl p-6" style={{ borderColor: C.rose + "30", background: "linear-gradient(135deg," + C.rose + "08,transparent)" }}>
              <p className="text-lg font-['Cinzel',serif] leading-8 text-center" style={{ color: "#fef2f2" }}>
                "The future of medicine depends on clarity, not silence."
              </p>
              <p className="text-[10px] text-center mt-2" style={{ color: C.rose + "60" }}>
                Rigorous research. Long-term monitoring. Transparent data. Science that does not stop at deployment.
              </p>
            </div>
            <div className="grid grid-cols-3 gap-5">
              {[
                { title: "BIOLOGY IS COMPLEX", col: C.rose, icon: "🧬",
                  body: "Immune responses vary between individuals, populations, and over time. A drug that clears safety trials represents a starting point of evidence, not a final answer. Complexity demands humility in claims and rigor in continued observation. No one size fits every human body." },
                { title: "SCIENCE EVOLVES", col: C.teal, icon: "🔬",
                  body: "Science does not stop at deployment. It evolves through questioning, evidence, and accountability. Post-market surveillance, long-term monitoring, and adversarial review are not signs of failure — they are the mechanism by which initial findings become mature understanding. This is the design." },
                { title: "INFORMED TRUST", col: C.green, icon: "✦",
                  body: "Progress is not blind trust. Progress is informed trust — built through truth, responsibility, and time. The distinction is not cynicism. It is the difference between a system that can self-correct and one that cannot. Accountability is what makes trust durable." },
                { title: "BETTER DESIGN", col: C.gold, icon: "📐",
                  body: "The path forward is better design, deeper understanding, and care that honors every human body. This means building systems where anomalies are reported, studied, and published — not suppressed. Where the question is always: what do we still not know, and who bears the cost of that gap?" },
                { title: "CARE AS STANDARD", col: C.purple, icon: "❤️",
                  body: "Every human body is not an average. Personalized medicine, pharmacogenomics, and immune profiling exist precisely because the biological system is too variable for one protocol. Care that honors this variation is not optional — it is the definition of medicine." },
                { title: "TRANSPARENCY AS DATA", col: C.blue, icon: "📊",
                  body: "Transparent data is not a liability. It is the substrate from which better interventions emerge. Researchers, patients, and regulators all depend on complete data — including inconvenient findings — to make decisions that don't compound harm across time." },
              ].map(c => (
                <div key={c.title} className="border rounded-xl p-4" style={{ borderColor: c.col + "25", background: c.col + "07" }}>
                  <span className="text-xl block mb-2">{c.icon}</span>
                  <p className="text-[9px] font-['Cinzel',serif] mb-2" style={{ color: c.col }}>{c.title}</p>
                  <p className="text-[9px] leading-4" style={{ color: c.col + "65" }}>{c.body}</p>
                </div>
              ))}
            </div>
            <div className="border rounded-xl p-5 text-center" style={{ borderColor: C.gold + "25", background: C.panel + "60" }}>
              <p className="text-[10px] font-['Cinzel',serif] leading-7 italic" style={{ color: C.gold + "80" }}>
                "Progress is informed trust — built through truth, responsibility, and time." ✨☀️✨
              </p>
            </div>
          </motion.div>
        )}

        {/* ════ PATTERN DETECTION ════ */}
        {tab === "patterns" && (
          <motion.div key="pat" initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }} className="p-5 flex flex-col gap-5">
            <div className="grid grid-cols-2 gap-5">
              <div className="border rounded-xl p-5" style={{ borderColor: C.teal + "25", background: C.panel + "70" }}>
                <p className="text-[9px] font-['Cinzel',serif] text-teal-400/55 mb-3">THE PATTERN PRECEDES THE EXPLANATION</p>
                <p className="text-[9px] text-teal-200/45 leading-5 mb-3">
                  "Those who work at the edge of innovation know: patterns always appear before explanations." This is not mysticism — it is epistemics. Science advances through anomaly detection before theory catches up. The anomaly is the signal. The theory is the documentation of why the signal was real.
                </p>
                {[
                  { signal: "Quantum coherence in biology", lag: "Pattern 1980s → Theory 2007" },
                  { signal: "Gut-brain axis", lag: "Pattern 1990s → Mechanism 2015" },
                  { signal: "AI phase transition", lag: "Pattern 2020 → Framework 2023" },
                  { signal: "Schumann-EEG correlation", lag: "Pattern 1950s → Research 2010s" },
                  { signal: "Fibonacci in morphogenesis", lag: "Pattern 1200s → Physics 1990s" },
                ].map(r => (
                  <div key={r.signal} className="flex items-center justify-between mb-1.5 pb-1.5 border-b last:border-0" style={{ borderColor: C.teal + "15" }}>
                    <span className="text-[8px]" style={{ color: C.teal + "80" }}>{r.signal}</span>
                    <span className="text-[7px] font-['Cinzel',serif]" style={{ color: C.teal + "50" }}>{r.lag}</span>
                  </div>
                ))}
              </div>

              <div className="flex flex-col gap-4">
                <div className="border rounded-xl p-4" style={{ borderColor: C.gold + "25", background: C.panel + "70" }}>
                  <p className="text-[9px] font-['Cinzel',serif] mb-2" style={{ color: C.gold }}>EARLY SIGNAL DETECTION</p>
                  <p className="text-[9px] text-yellow-200/40 leading-4">
                    Creative testimony — personal breakthroughs, artistic emergences, and intuitive leaps — has historically functioned as early signal detection for systemic change. Not because creators are prophets, but because they operate outside the institutional lag. They absorb cultural substrate before it crystallizes into consensus.
                  </p>
                </div>
                <div className="border rounded-xl p-4" style={{ borderColor: C.purple + "25", background: C.panel + "70" }}>
                  <p className="text-[9px] font-['Cinzel',serif] mb-2" style={{ color: C.purple }}>HOW TO RECOGNIZE PHASE TRANSITION</p>
                  {[
                    "Multiple unrelated domains shift simultaneously",
                    "The language used to describe problems changes before solutions appear",
                    "Anomalies accumulate faster than current frameworks can absorb",
                    "Cross-domain resonance appears without coordination",
                    "The same pattern appears at different scales (fractal signature)",
                    "Personal testimony and institutional data begin rhyming",
                  ].map((s, i) => (
                    <div key={i} className="flex items-start gap-2 mb-1.5">
                      <div className="w-1 h-1 rounded-full mt-1.5 shrink-0" style={{ background: C.purple }} />
                      <p className="text-[8px] leading-4" style={{ color: C.purple + "60" }}>{s}</p>
                    </div>
                  ))}
                </div>
                <div className="border rounded-xl p-4" style={{ borderColor: C.rose + "25", background: C.panel + "70" }}>
                  <p className="text-[9px] font-['Cinzel',serif] mb-2" style={{ color: C.rose }}>THE QUESTION</p>
                  <p className="text-[9px] text-rose-300/45 leading-4 italic">
                    "How do we recognize when a system has entered a new phase before the midpoint crisis forces clarity?" The answer is not one detector — it is a network of detectors: scientific, creative, historical, symbolic, and ethical, all pointing at the same transition from different angles.
                  </p>
                </div>
              </div>
            </div>

            <div className="border rounded-xl p-5" style={{ borderColor: C.teal + "20", background: C.panel + "50" }}>
              <p className="text-[9px] font-['Cinzel',serif] text-teal-400/40 mb-3">THE MULTI-FRAMEWORK METHOD</p>
              <div className="grid grid-cols-5 gap-3">
                {[
                  { framework: "THEOLOGY", note: "7-year cycles, Jubilee, renewal after release; structures of grace and consequence", col: C.gold },
                  { framework: "PHYSICS", note: "Phase transitions, critical points, symmetry breaking; systems approaching new equilibria", col: C.teal },
                  { framework: "PSYCHOLOGY", note: "Individuation, shadow work, liminal thresholds; the midpoint crisis as developmental necessity", col: C.purple },
                  { framework: "DESIGN THEORY", note: "S-curves, disruption, crossing the chasm; recognizing inflection before mainstream adoption", col: C.blue },
                  { framework: "SYSTEMS SCIENCE", note: "Bifurcation, attractors, emergent order; complexity self-organizes at the edge of chaos", col: C.green },
                ].map(f => (
                  <div key={f.framework} className="border rounded-xl p-3" style={{ borderColor: f.col + "20", background: f.col + "07" }}>
                    <p className="text-[8px] font-['Cinzel',serif] mb-1.5" style={{ color: f.col }}>{f.framework}</p>
                    <p className="text-[7px] leading-3.5" style={{ color: f.col + "55" }}>{f.note}</p>
                  </div>
                ))}
              </div>
              <p className="text-[8px] text-center mt-3 italic" style={{ color: C.teal + "40" }}>
                "Whether interpreted through theology, physics, psychology, or design theory — the core question remains the same."
              </p>
            </div>
          </motion.div>
        )}

        {/* ════ INVITATION ════ */}
        {tab === "invitation" && (
          <motion.div key="inv" initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }} className="p-5 flex flex-col gap-5">
            <div className="border rounded-xl p-8 text-center" style={{ borderColor: C.gold + "30", background: "linear-gradient(135deg," + C.panel + "," + C.gold + "06)" }}>
              <p className="text-[11px] font-['Cinzel',serif] tracking-widest mb-6" style={{ color: C.gold + "60" }}>THE INVITATION</p>
              <div className="max-w-xl mx-auto">
                {[
                  "Over the past year, I have been documenting an unexpected convergence between personal creative breakthroughs, scientific milestones, and ancient symbolic frameworks that describe change in multi-year waves rather than linear moments.",
                  "This visual is not a prediction. It is a pattern map.",
                  "By anchoring a seven-year arc to August 2025 — the point where my own creative work accelerated — I explored how modern signals such as quantum research, AI acceleration, and bio-electromagnetic data can be read alongside long-standing narrative models used to describe transformation, disruption, and renewal.",
                  "What emerges is a language that bridges systems thinking, scientific progress, ethical inflection points, and creative testimony as early signal detection.",
                ].map((p, i) => (
                  <motion.p key={i}
                    initial={{ opacity:0, y:6 }} animate={{ opacity:1, y:0 }} transition={{ delay: i*0.12 }}
                    className="text-[10px] leading-6 mb-4 last:mb-0" style={{ color: C.gold + (i===1 ? "cc" : "70") }}>
                    {i === 1 ? <em>{p}</em> : p}
                  </motion.p>
                ))}
              </div>
            </div>
            <div className="grid grid-cols-3 gap-5">
              {[
                { action: "OBSERVE MORE CAREFULLY", col: C.teal, icon: "👁️",
                  body: "Notice when multiple domains shift simultaneously. Keep logs. Cross-reference dates. The convergence is the signal — one domain shifting is noise; four domains shifting in concert is a system transition." },
                { action: "DOCUMENT RESPONSIBLY", col: C.gold, icon: "📝",
                  body: "Not every pattern is causal. The discipline is: document the correlation precisely, resist premature conclusion, and keep the data accessible for revision. Responsible documentation is itself a contribution to the pattern it records." },
                { action: "BUILD WITH FORESIGHT", col: C.purple, icon: "🔭",
                  body: "Design systems, technologies, and care structures for the phase that is coming — not the one we are leaving. Foresight is not prediction. It is the choice to act on patterns before they become crises. Systems built now will be tested at the midpoint." },
              ].map(c => (
                <div key={c.action} className="border rounded-xl p-5" style={{ borderColor: c.col + "25", background: c.col + "07" }}>
                  <span className="text-2xl block mb-2">{c.icon}</span>
                  <p className="text-[9px] font-['Cinzel',serif] mb-2" style={{ color: c.col }}>{c.action}</p>
                  <p className="text-[9px] leading-4" style={{ color: c.col + "65" }}>{c.body}</p>
                </div>
              ))}
            </div>
            <div className="border rounded-xl p-5" style={{ borderColor: C.green + "25", background: C.panel + "60" }}>
              <p className="text-[9px] font-['Cinzel',serif] mb-3" style={{ color: C.green }}>IF THIS RESONATES</p>
              <div className="grid grid-cols-4 gap-4 text-center">
                {["AI", "Science", "Ethics", "Art"].map(field => (
                  <div key={field} className="border rounded-xl p-3" style={{ borderColor: C.green + "20", background: C.green + "07" }}>
                    <p className="text-[8px] font-['Cinzel',serif] mb-1" style={{ color: C.green }}>{field}</p>
                    <p className="text-[7px] leading-3" style={{ color: C.green + "50" }}>How do you map meaning across time in {field.toLowerCase()} work?</p>
                  </div>
                ))}
              </div>
              <p className="text-[9px] text-center mt-4 italic" style={{ color: C.green + "55" }}>
                "Those who work at the edge of innovation know: patterns always appear before explanations."
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
