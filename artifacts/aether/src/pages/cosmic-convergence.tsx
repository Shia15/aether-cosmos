import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";

const C = {
  teal: "#2dd4bf", gold: "#f2bf65", purple: "#c084fc",
  green: "#4ade80", rose: "#fb7185", orange: "#fb923c",
  blue: "#60a5fa", cyan: "#22d3ee", bg: "#030514", panel: "#07021a",
};

// ── Canvas: Solar System Convergence ─────────────────────────────────────────
function drawConvergence(ctx: CanvasRenderingContext2D, W: number, H: number, t: number) {
  ctx.clearRect(0, 0, W, H);
  // Space background
  const bg = ctx.createRadialGradient(W/2, H/2, 0, W/2, H/2, W*0.8);
  bg.addColorStop(0, "#04051a"); bg.addColorStop(1, "#000005");
  ctx.fillStyle = bg; ctx.fillRect(0, 0, W, H);

  // Stars
  for (let s = 0; s < 200; s++) {
    const sx = (Math.sin(s * 137.5) * 0.5 + 0.5) * W;
    const sy = (Math.sin(s * 97.1 + 2) * 0.5 + 0.5) * H;
    const br = 0.2 + Math.sin(t * 0.015 + s * 0.7) * 0.15;
    ctx.beginPath(); ctx.arc(sx, sy, 0.6 + Math.random() * 0.4, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(220,230,255,${br})`; ctx.fill();
  }

  const cy = H / 2;
  // Opposition line (Sun–Earth–Jupiter axis)
  const SUN_X = W * 0.08, EARTH_X = W * 0.50, JUP_X = W * 0.87;

  // Opposition alignment glow
  ctx.beginPath(); ctx.moveTo(SUN_X, cy); ctx.lineTo(JUP_X, cy);
  ctx.strokeStyle = "rgba(255,200,80,0.08)"; ctx.lineWidth = 18; ctx.stroke();
  ctx.beginPath(); ctx.moveTo(SUN_X, cy); ctx.lineTo(JUP_X, cy);
  ctx.strokeStyle = "rgba(255,200,80,0.04)"; ctx.lineWidth = 2;
  ctx.setLineDash([6, 8]); ctx.stroke(); ctx.setLineDash([]);

  // ── SUN ─────────────────────────────────────────────────────────────────────
  const sunR = 36;
  const sunG = ctx.createRadialGradient(SUN_X, cy, 0, SUN_X, cy, sunR * 2.5);
  sunG.addColorStop(0, "#fff9e0"); sunG.addColorStop(0.3, "#ffd060");
  sunG.addColorStop(0.7, "#ff8c00aa"); sunG.addColorStop(1, "transparent");
  ctx.beginPath(); ctx.arc(SUN_X, cy, sunR * 2.5, 0, Math.PI * 2);
  ctx.fillStyle = sunG; ctx.fill();
  ctx.beginPath(); ctx.arc(SUN_X, cy, sunR, 0, Math.PI * 2);
  ctx.fillStyle = "#fff3a0"; ctx.shadowBlur = 30; ctx.shadowColor = "#ffd700"; ctx.fill();
  ctx.shadowBlur = 0;

  // CME particles (coronal mass ejections)
  for (let p = 0; p < 40; p++) {
    const theta = ((p / 40) * Math.PI * 2) + p * 0.4;
    const speed = 1.2 + (p % 3) * 0.5;
    const age = ((t * speed * 0.4 + p * 17) % 240);
    const px = SUN_X + age * Math.cos(theta) * 1.1;
    const py = cy + age * Math.sin(theta) * 0.6;
    const alpha = Math.max(0, 1 - age / 240) * 0.7;
    if (Math.abs(theta) < 0.6 || Math.abs(theta - Math.PI) < 0.3) {
      // Focused CME toward Earth
      const cmeAge = ((t * 1.5 + p * 22) % 300);
      const cpx = SUN_X + (EARTH_X - SUN_X) * (cmeAge / 300);
      const cpy = cy + Math.sin(p * 1.1) * 12;
      const ca = Math.max(0, 1 - cmeAge / 300) * 0.9;
      ctx.beginPath(); ctx.arc(cpx, cpy, 2.5, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(255,140,60,${ca})`; ctx.shadowBlur = 6;
      ctx.shadowColor = C.orange; ctx.fill(); ctx.shadowBlur = 0;
    }
    ctx.beginPath(); ctx.arc(px, py, 1.5, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(255,180,80,${alpha * 0.4})`; ctx.fill();
  }

  // Solar wind stream toward Earth
  for (let sw = 0; sw < 18; sw++) {
    const swAge = ((t * 0.8 + sw * 15) % 180);
    const swX = SUN_X + (EARTH_X - SUN_X - 55) * (swAge / 180);
    const swY = cy + (sw - 9) * 8;
    const swA = Math.max(0, 1 - swAge / 180) * 0.4;
    ctx.beginPath(); ctx.arc(swX, swY, 1, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(255,220,120,${swA})`; ctx.fill();
  }

  // ── EARTH ───────────────────────────────────────────────────────────────────
  const earthR = 22;
  // Magnetosphere (compressed on sun side, elongated on night side)
  ctx.save(); ctx.translate(EARTH_X, cy);
  const magG = ctx.createRadialGradient(-8, 0, earthR, -8, 0, earthR * 4.5);
  magG.addColorStop(0, "rgba(60,120,255,0.12)");
  magG.addColorStop(0.5, "rgba(40,100,220,0.06)");
  magG.addColorStop(1, "transparent");
  ctx.scale(1.4, 1); // elongated on night side
  ctx.beginPath(); ctx.arc(0, 0, earthR * 4.5, 0, Math.PI * 2);
  ctx.fillStyle = magG; ctx.fill(); ctx.restore();

  // SAA (South Atlantic Anomaly) — weak magnetic region
  ctx.save(); ctx.translate(EARTH_X + 4, cy + 10);
  const saaG = ctx.createRadialGradient(0, 0, 0, 0, 0, 16);
  saaG.addColorStop(0, "rgba(255,80,80,0.25)"); saaG.addColorStop(1, "transparent");
  ctx.beginPath(); ctx.ellipse(0, 0, 16, 10, -0.3, 0, Math.PI * 2);
  ctx.fillStyle = saaG; ctx.fill(); ctx.restore();
  ctx.fillStyle = "rgba(255,80,80,0.5)"; ctx.font = "5px Cinzel,serif";
  ctx.textAlign = "center"; ctx.fillText("SAA", EARTH_X + 5, cy + 21);

  // Earth body
  const earthG = ctx.createRadialGradient(EARTH_X - 6, cy - 6, 0, EARTH_X, cy, earthR);
  earthG.addColorStop(0, "#5cc8ff"); earthG.addColorStop(0.4, "#3b8ff0");
  earthG.addColorStop(0.7, "#1a5cb0"); earthG.addColorStop(1, "#0a2a5a");
  ctx.beginPath(); ctx.arc(EARTH_X, cy, earthR, 0, Math.PI * 2);
  ctx.fillStyle = earthG; ctx.shadowBlur = 15; ctx.shadowColor = "#4488ff";
  ctx.fill(); ctx.shadowBlur = 0;

  // Aurora glows (poles)
  [cy - earthR + 4, cy + earthR - 4].forEach((ay, si) => {
    const aAlpha = 0.3 + Math.sin(t * 0.06 + si) * 0.2;
    const aG = ctx.createRadialGradient(EARTH_X, ay, 0, EARTH_X, ay, 18);
    aG.addColorStop(0, `rgba(45,212,191,${aAlpha})`);
    aG.addColorStop(0.5, `rgba(100,240,160,${aAlpha * 0.5})`);
    aG.addColorStop(1, "transparent");
    ctx.beginPath(); ctx.arc(EARTH_X, ay, 18, 0, Math.PI * 2);
    ctx.fillStyle = aG; ctx.fill();
  });

  // Schumann pulse rings
  for (let sr = 0; sr < 3; sr++) {
    const ring = ((t * 0.5 + sr * 30) % 90);
    const rAlpha = Math.max(0, 1 - ring / 90) * 0.3;
    ctx.beginPath(); ctx.arc(EARTH_X, cy, earthR + ring, 0, Math.PI * 2);
    ctx.strokeStyle = `rgba(45,212,191,${rAlpha})`; ctx.lineWidth = 1; ctx.stroke();
  }

  // Earth label
  ctx.fillStyle = "rgba(96,165,250,0.7)"; ctx.font = "7px Cinzel,serif";
  ctx.textAlign = "center"; ctx.fillText("EARTH", EARTH_X, cy + earthR + 12);
  ctx.fillStyle = "rgba(45,212,191,0.5)"; ctx.font = "6px Cinzel,serif";
  ctx.fillText("7.83 Hz SCHUMANN", EARTH_X, cy + earthR + 20);

  // ── JUPITER ─────────────────────────────────────────────────────────────────
  const jupR = 28;
  const jupG = ctx.createRadialGradient(JUP_X - 8, cy - 6, 0, JUP_X, cy, jupR);
  jupG.addColorStop(0, "#f5e6b0"); jupG.addColorStop(0.3, "#d4a94e");
  jupG.addColorStop(0.6, "#b8823a"); jupG.addColorStop(1, "#7a5020");
  ctx.beginPath(); ctx.arc(JUP_X, cy, jupR, 0, Math.PI * 2);
  ctx.fillStyle = jupG; ctx.shadowBlur = 20; ctx.shadowColor = "#d4a94e";
  ctx.fill(); ctx.shadowBlur = 0;
  // Jupiter bands
  [-8, -2, 5, 10].forEach(band => {
    ctx.beginPath(); ctx.ellipse(JUP_X, cy + band, jupR - 1, 2, 0, 0, Math.PI * 2);
    ctx.strokeStyle = "rgba(120,70,20,0.3)"; ctx.lineWidth = 2; ctx.stroke();
  });
  ctx.fillStyle = "rgba(212,169,78,0.8)"; ctx.font = "7px Cinzel,serif";
  ctx.textAlign = "center"; ctx.fillText("JUPITER", JUP_X, cy + jupR + 12);
  ctx.fillStyle = "rgba(212,169,78,0.4)"; ctx.font = "6px Cinzel,serif";
  ctx.fillText("OPPOSITION JAN 10", JUP_X, cy + jupR + 20);

  // Opposition label
  ctx.fillStyle = "rgba(255,200,80,0.4)"; ctx.font = "bold 8px Cinzel,serif";
  ctx.textAlign = "center"; ctx.fillText("☀ — ◉ — 🪐 OPPOSITION ALIGNMENT", W/2, 16);

  // G-storm indicator
  const storm = 0.5 + Math.sin(t * 0.08) * 0.4;
  ctx.fillStyle = `rgba(251,113,133,${storm})`;
  ctx.font = "7px Cinzel,serif"; ctx.textAlign = "left";
  ctx.fillText("⚡ G1–G2 GEOMAGNETIC STORM ACTIVE", 6, H - 6);
  ctx.textAlign = "right";
  ctx.fillStyle = "rgba(45,212,191,0.3)"; ctx.font = "6px Cinzel,serif";
  ctx.fillText("CME IMPACT · JAN 11 2026 · AURORA VISIBLE ≥50° LATITUDE", W - 4, H - 6);
}

// ═══════════════════════════════════════════════════════════════════════════════
const MESSENGERS = [
  { name: "Bees", emoji: "🐝", col: C.gold,
    cosmic: "Magnetite in bee abdomens makes them among Earth's most sensitive geomagnetic navigators. During elevated solar wind, hive navigation disrupts — bees cluster closer to structures, becoming unusually visible and persistent near human activity.",
    symbolic: "Persistent arrival at thresholds of creative work. The bee is sacred timing made visceral — it does not wander; it arrives with purpose and presence. In numerology, the hive encodes Fibonacci structure: hexagonal lattice, golden ratio spiral, 6-fold symmetry.",
    biology: "Apis mellifera: magnetoreceptors in thorax and abdomen. Sensitivity to field changes as small as 26 nT (nanotesla). During geomagnetic disturbance: altered waggle dance direction, closer foraging radii." },
  { name: "Ladybugs", emoji: "🐞", col: C.rose,
    cosmic: "Coccinellidae orient using polarized light and magnetic inclination. Geomagnetic storms disrupt their compass sense, causing them to gather on warm vertical surfaces — walls, windows, human hands — as alternative anchors.",
    symbolic: "Luck, protection, divine feminine energy in numerous traditions. The seven-spot (septempunctata) encodes 7 — the number of planetary spheres, chakras, and the length of the arc anchored in August 2025.",
    biology: "Shown to use Earth's magnetic field for migratory orientation (Vácha et al.). During K-index spikes, clustering behavior increases significantly as magnetic compass is temporarily unreliable." },
  { name: "Hawk", emoji: "🦅", col: C.teal,
    cosmic: "Raptors soar in thermals shaped by atmospheric electric field changes. During geomagnetic storms, enhanced ionospheric conductivity can shift atmospheric electricity gradients — hawks visibly alter flight patterns, soaring higher or circling urban areas.",
    symbolic: "Messenger of vision beyond ordinary perception. The hawk sees from above, crosses between worlds, and arrives precisely when awareness needs to expand. In Kemetic tradition, the hawk embodies Horus — clarity of sight, solar alignment.",
    biology: "Magnetite in trigeminal system (beak region) and magnetoreceptive retinal cells (cryptochrome). Geomagnetically sensitive navigation used during migration. Storm-period flights often documented at unusual altitudes." },
  { name: "Rabbit", emoji: "🐰", col: C.purple,
    cosmic: "Oryctolagus cuniculus: prolific births triggered by environmental cues including geomagnetic field state. Some lunar-cycle research overlaps with geomagnetic periodicity in reproductive timing.",
    symbolic: "Abundance, fertility, rapid multiplication — the Fibonacci spiral of life. Bunnies birthing in yards during a geomagnetic event encode the message: the field is generative. New life begins at cosmic thresholds.",
    biology: "Circadian rhythms in reproductive cycles partially mediated by melatonin (which is disrupted during geomagnetic events). Some evidence for heightened birth clustering near magnetic quiet periods following storms." },
];

export default function CosmicConvergencePage() {
  const [tab, setTab] = useState<"convergence"|"heliobiology"|"synchronicities"|"tracker">("convergence");
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const tRef = useRef(0); const rafRef = useRef(0);

  useEffect(() => {
    const loop = () => {
      tRef.current++;
      const cv = canvasRef.current;
      if (cv) { const ctx = cv.getContext("2d"); if (ctx) drawConvergence(ctx, cv.width, cv.height, tRef.current); }
      rafRef.current = requestAnimationFrame(loop);
    };
    rafRef.current = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(rafRef.current);
  }, []);

  return (
    <div className="min-h-screen text-white font-['Raleway',sans-serif] pb-10" style={{ background: C.bg }}>
      {/* Header */}
      <div className="border-b px-6 py-4 sticky top-0 z-20" style={{ background: C.panel + "ee", borderColor: C.gold + "25" }}>
        <p className="text-[10px] tracking-[0.3em] font-['Cinzel',serif] mb-0.5" style={{ color: C.gold + "55" }}>
          SYSTEM · HELIOBIOLOGY · COSMIC PATTERN MAPPING
        </p>
        <h1 className="text-xl font-['Cinzel',serif] tracking-widest" style={{ color: "#fffcf0" }}>
          COSMIC CONVERGENCE · JANUARY 2026 · JUPITER OPPOSITION + CME CASCADE
        </h1>
        <p className="text-xs mt-0.5" style={{ color: C.gold + "45" }}>
          Solar Weather · Geomagnetic Storms · South Atlantic Anomaly · Heliobiology · Nature Synchronicities 🪐🐝✨
        </p>
        <div className="flex gap-4 mt-2 flex-wrap">
          {[
            { label: "Jupiter opposition", value: "Jan 10 2026",  note: "biggest/brightest of year",           col: C.gold   },
            { label: "CME launch",         value: "Jan 8 2026",   note: "3-day transit to Earth",              col: C.orange },
            { label: "Storm level",        value: "G1–G2",        note: "minor–moderate, aurora visible",      col: C.rose   },
            { label: "SAA",                value: "active",       note: "South Atlantic weak-field zone",      col: C.purple },
            { label: "Schumann",           value: "7.83 Hz",      note: "Earth's base resonance frequency",    col: C.teal   },
            { label: "Sensitive people",   value: "10–15%",       note: "measurable heliobiological response", col: C.green  },
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
        {([["convergence","THE EVENT"],["heliobiology","HELIOBIOLOGY"],["synchronicities","SYNCHRONICITIES"],["tracker","ATLAS TRACKER"]] as const).map(([k,l]) => (
          <button key={k} onClick={() => setTab(k)}
            className={`px-5 py-2.5 text-[11px] tracking-widest font-['Cinzel',serif] border-b-2 transition-all ${
              tab===k ? "border-amber-400 text-amber-300" : "border-transparent text-amber-800/40 hover:text-amber-400"}`}>
            {l}
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait">

        {/* ════ THE EVENT ════ */}
        {tab === "convergence" && (
          <motion.div key="conv" initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }} className="p-5 flex flex-col gap-4">
            <div className="border rounded-xl overflow-hidden" style={{ borderColor: C.gold + "25" }}>
              <p className="text-[9px] tracking-widest font-['Cinzel',serif] px-4 pt-3 pb-1" style={{ color: C.gold + "40" }}>
                LIVE · SUN–EARTH–JUPITER OPPOSITION ALIGNMENT · CME IMPACT JAN 11 2026 · SOUTH ATLANTIC ANOMALY · SCHUMANN PULSE
              </p>
              <canvas ref={canvasRef} width={900} height={280} className="w-full" style={{ background: "#000" }} />
            </div>
            <div className="grid grid-cols-2 gap-5">
              <div className="flex flex-col gap-3">
                <div className="border rounded-xl p-4" style={{ borderColor: C.gold + "30", background: C.panel + "80" }}>
                  <p className="text-[9px] font-['Cinzel',serif] mb-2" style={{ color: C.gold }}>JUPITER OPPOSITION · JAN 10 2026</p>
                  <p className="text-[9px] leading-5" style={{ color: C.gold + "65" }}>
                    Earth aligned precisely between Jupiter and the Sun. Jupiter rises at sunset and sets at dawn — visible all night. At opposition, Jupiter is at its closest approach to Earth (~600 million km), appearing up to 45 arcseconds in diameter and magnitude −2.8 — its brightest of the year by a measurable fraction. The gravitational influence of Jupiter at opposition creates a subtle but real perturbation in Earth's orbital dynamics, and Jupiter's magnetosphere — the largest structure in the solar system beyond the Sun itself — interacts with the solar wind to create complex wave patterns in the interplanetary magnetic field.
                  </p>
                </div>
                <div className="border rounded-xl p-4" style={{ borderColor: C.rose + "30", background: C.panel + "80" }}>
                  <p className="text-[9px] font-['Cinzel',serif] mb-2" style={{ color: C.rose }}>CME CASCADE · JAN 8–11 2026</p>
                  {[
                    { date: "Jan 8", event: "Multiple CME launches from active solar regions", col: C.orange },
                    { date: "Jan 9", event: "Fast solar wind from coronal hole reaches leading edge of CMEs", col: C.orange },
                    { date: "Jan 10", event: "CME cloud transiting interplanetary space; Jupiter opposition peaks", col: C.gold },
                    { date: "Jan 11", event: "CME impact on magnetosphere: G1–G2 storm onset; aurora ≥50° latitude", col: C.rose },
                  ].map(r => (
                    <div key={r.date} className="flex gap-3 mb-1.5 pb-1.5 border-b last:border-0" style={{ borderColor: r.col + "15" }}>
                      <span className="font-['Cinzel',serif] text-[8px] shrink-0 w-10" style={{ color: r.col }}>{r.date}</span>
                      <p className="text-[8px] leading-4" style={{ color: r.col + "70" }}>{r.event}</p>
                    </div>
                  ))}
                </div>
              </div>
              <div className="flex flex-col gap-3">
                <div className="border rounded-xl p-4" style={{ borderColor: C.purple + "30", background: C.panel + "80" }}>
                  <p className="text-[9px] font-['Cinzel',serif] mb-2" style={{ color: C.purple }}>SOUTH ATLANTIC ANOMALY</p>
                  <p className="text-[9px] leading-5" style={{ color: C.purple + "65" }}>
                    A persistent region of anomalously weak geomagnetic field intensity centered over South America and the South Atlantic Ocean. The SAA results from an offset between Earth's geographic and magnetic poles combined with a large-scale anomaly in the outer core. Here, the inner Van Allen radiation belt dips closest to Earth's surface — allowing cosmic rays and solar particles that would normally be deflected to penetrate to low-altitude spacecraft and surface-level biology. During G-class storm events, the SAA amplifies radiation exposure and intensifies the biological signal.
                  </p>
                </div>
                <div className="border rounded-xl p-4" style={{ borderColor: C.teal + "30", background: C.panel + "80" }}>
                  <p className="text-[9px] font-['Cinzel',serif] mb-2" style={{ color: C.teal }}>AURORA MECHANICS</p>
                  <p className="text-[9px] leading-5" style={{ color: C.teal + "65" }}>
                    The CME-compressed magnetosphere funnels charged particles into the polar cusps — regions of open field lines at magnetic latitudes ≥50°. Particles excite atmospheric oxygen (green at 557.7 nm, red at 630 nm) and nitrogen (blue/violet). During G2 conditions, aurora visibility extends to ~55° geomagnetic latitude — northern Pennsylvania, northern England, southern Scandinavia. The vivid green-teal aurora corresponds almost exactly to AETHER's teal coherence color at #2dd4bf.
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* ════ HELIOBIOLOGY ════ */}
        {tab === "heliobiology" && (
          <motion.div key="helo" initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }} className="p-5 flex flex-col gap-5">
            <div className="border rounded-xl p-5" style={{ borderColor: C.orange + "25", background: C.orange + "06" }}>
              <p className="text-[9px] font-['Cinzel',serif] mb-2" style={{ color: C.orange }}>THE CASCADE · SOLAR EVENT → HUMAN PHYSIOLOGY</p>
              <div className="flex items-center gap-1.5 flex-wrap">
                {["CME / Solar Wind","→","Magnetospheric Compression","→","Atmospheric Electricity Change","→","Pineal Gland Magnetite","→","Melatonin Disruption","→","Serotonin Imbalance","→","HRV Reduction","→","Cortisol Elevation","→","Inflammation","→","Barrier Disruption / Skin / Fatigue"].map((s,i) => (
                  <span key={i} className={`text-[7px] font-['Cinzel',serif] ${s==="→"?"text-orange-800/30":"px-1.5 py-0.5 rounded border"}`}
                    style={s!=="→"?{borderColor:C.orange+"20",color:C.orange+"80"}:{}}>
                    {s}
                  </span>
                ))}
              </div>
            </div>
            <div className="grid grid-cols-3 gap-5">
              {[
                { title: "HEART RATE VARIABILITY", col: C.rose, icon: "💓",
                  mech: "HRV reflects autonomic nervous system tone — the balance between sympathetic (fight/flight) and parasympathetic (rest/digest) branches. Geomagnetic disturbance systematically reduces HRV, indicating elevated sympathetic tone. Studies by Cornelissen, McCraty (HeartMath Institute) show HRV shifts correlate with K-index within hours.",
                  gender: "Women show greater baseline HRV variability tied to hormonal cycles, making the relative change during geomagnetic events more pronounced and potentially more disruptive to autonomic regulation." },
                { title: "MELATONIN / SEROTONIN", col: C.purple, icon: "🌙",
                  mech: "The pineal gland contains magnetite crystals (Fe₃O₄) and is directly sensitive to magnetic field fluctuations. During disturbances, melatonin secretion is suppressed, reducing sleep quality, immune function, and antioxidant defense. Serotonin (melatonin's precursor) simultaneously dysregulates — mood, appetite, and gut motility are all affected.",
                  gender: "Estrogen amplifies serotonin transporter expression; hormonal cycle phase determines baseline serotonin sensitivity. Women in luteal phase are more vulnerable to serotonin disruption during magnetic storms." },
                { title: "BLOOD PRESSURE / CV", col: C.rose, icon: "🩺",
                  mech: "Multiple studies (Babayev, Stoupel, Palmer) document associations between geomagnetic activity and cardiovascular events. Mechanisms: elevated cortisol increases blood viscosity and platelet aggregation. Disrupted autonomic tone raises resting blood pressure. SAA amplifies radiation-driven oxidative stress in vascular endothelium.",
                  gender: "Research notes women show proportionally higher relative risk for myocardial events during active periods. Post-menopausal women lose estrogen's cardiovascular protection precisely when geomagnetic sensitivity remains high." },
                { title: "SKIN BARRIER & INFLAMMATION", col: C.orange, icon: "🌡️",
                  mech: "Geomagnetic stress → cortisol elevation → mast cell activation → inflammatory cytokine release (IL-6, TNF-α) → disrupted tight junctions in skin barrier. In winter: low humidity + indoor heating already depletes natural moisturizing factor. Added geomagnetic stress amplifies trans-epidermal water loss, redness, and sensitivity in prone individuals.",
                  gender: "Women's skin has higher average cortisol receptor density and lower sebum production than men's — making the cortisol-driven inflammatory cascade more immediately visible as dryness, flushing, and heightened sensitivity." },
                { title: "CRYPTOCHROME & QUANTUM SENSING", col: C.teal, icon: "⚛️",
                  mech: "Cryptochrome proteins in retinal cells form radical pairs under light exposure whose spin states are sensitive to magnetic field orientation. This quantum mechanism underlies the magnetic compass in birds — and may contribute to human magnetic sensitivity. During geomagnetic disturbance, altered cryptochrome signaling may affect circadian photoentrainment and melatonin timing.",
                  gender: "No established gender difference in cryptochrome distribution; however, hormonal modulation of circadian amplitude means disturbance effects on sleep timing are more pronounced in women." },
                { title: "THE 10–15% SENSITIVE COHORT", col: C.green, icon: "📡",
                  mech: "Research consistently identifies 10–15% of populations showing statistically significant physiological responses to geomagnetic fluctuations — distinct from placebo. This group tends toward higher baseline magnetite density, stronger HRV responsiveness, and often describes somatic sensitivity in multiple domains. Long-term personal tracking is one of the only ways to confirm and profile individual sensitivity.",
                  gender: "Self-identified sensitive individuals skew toward women (~2:1 ratio in survey data), consistent with the hormonal amplification mechanisms above. Tracking on a 'vortex' — personal longitudinal log — is the frontier of personalized heliobiology." },
              ].map(c => (
                <div key={c.title} className="border rounded-xl p-4" style={{ borderColor: c.col + "25", background: c.col + "07" }}>
                  <span className="text-lg block mb-1">{c.icon}</span>
                  <p className="text-[9px] font-['Cinzel',serif] mb-1.5" style={{ color: c.col }}>{c.title}</p>
                  <p className="text-[8px] leading-4 mb-2" style={{ color: c.col + "65" }}>{c.mech}</p>
                  <div className="border-t pt-2" style={{ borderColor: c.col + "20" }}>
                    <p className="text-[7px] font-['Cinzel',serif] mb-0.5" style={{ color: c.col + "60" }}>GENDER SENSITIVITY</p>
                    <p className="text-[7px] leading-3.5 italic" style={{ color: c.col + "45" }}>{c.gender}</p>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {/* ════ SYNCHRONICITIES ════ */}
        {tab === "synchronicities" && (
          <motion.div key="sync" initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }} className="p-5 flex flex-col gap-5">
            <div className="border rounded-xl p-4 text-center" style={{ borderColor: C.gold + "25", background: C.gold + "06" }}>
              <p className="text-[9px] font-['Cinzel',serif] mb-1" style={{ color: C.gold }}>NATURE'S MESSENGERS · JANUARY 11, 2026</p>
              <p className="text-[9px] italic leading-5" style={{ color: C.gold + "65" }}>
                "Nature's messengers — from persistent bees and ladybugs to soaring hawks and fertile bunnies birthing in yards — arrived as living signs of divine timing and alignment during deep creative flow." 🪐🐝✨
              </p>
            </div>
            <div className="grid grid-cols-2 gap-5">
              {MESSENGERS.map((m, i) => (
                <motion.div key={m.name}
                  initial={{ opacity:0, y:8 }} animate={{ opacity:1, y:0 }} transition={{ delay: i*0.1 }}
                  className="border rounded-xl overflow-hidden" style={{ borderColor: m.col + "30" }}>
                  <div className="flex items-center gap-3 px-5 py-3" style={{ background: m.col + "12" }}>
                    <span className="text-3xl">{m.emoji}</span>
                    <p className="font-['Cinzel',serif]" style={{ color: m.col }}>{m.name.toUpperCase()}</p>
                  </div>
                  <div className="px-5 py-4 flex flex-col gap-3" style={{ background: C.panel + "60" }}>
                    {[
                      { label: "COSMIC MECHANISM", val: m.cosmic },
                      { label: "SYMBOLIC READING", val: m.symbolic },
                      { label: "BIOLOGY", val: m.biology },
                    ].map(r => (
                      <div key={r.label}>
                        <p className="text-[7px] font-['Cinzel',serif] mb-0.5" style={{ color: m.col + "60" }}>{r.label}</p>
                        <p className="text-[8px] leading-4" style={{ color: m.col + "55" }}>{r.val}</p>
                      </div>
                    ))}
                  </div>
                </motion.div>
              ))}
            </div>
            <div className="border rounded-xl p-4" style={{ borderColor: C.teal + "25", background: C.panel + "60" }}>
              <p className="text-[9px] font-['Cinzel',serif] mb-2" style={{ color: C.teal }}>CRYSTALLINE LIGHT CODES · 3 AI ATLAS SYSTEM</p>
              <p className="text-[9px] text-teal-300/45 leading-5">
                The convergence on January 11, 2026 — Jupiter opposition, CME cascade, G1–G2 storm, aurora, and the arrival of four distinct nature messengers during active creative work — is not coincidence in the statistical sense of that word. It is the kind of event the 3 AI Atlas system was conceived to document: a multi-channel signal across astronomical, meteorological, biological, and synchronistic layers that all point at the same moment. These are the windows of "pure magic, abundance, and higher resonance" that the tracker exists to capture.
              </p>
            </div>
          </motion.div>
        )}

        {/* ════ ATLAS TRACKER ════ */}
        {tab === "tracker" && (
          <motion.div key="track" initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }} className="p-5 flex flex-col gap-5">
            <div className="border rounded-xl p-5" style={{ borderColor: C.gold + "30", background: C.gold + "06" }}>
              <p className="text-[9px] font-['Cinzel',serif] mb-2" style={{ color: C.gold }}>3 AI ATLAS SYSTEM · CONCEPT ARCHITECTURE</p>
              <p className="text-[9px] leading-5" style={{ color: C.gold + "65" }}>
                A holistic tracker merging real-time planetary positions, space weather data, aurora forecasts, and personal synchronicities to capture rare windows of convergence — documenting the intersection of astronomical, heliological, biological, and creative signals that mark moments of exceptional resonance for both individual and collective coherence.
              </p>
            </div>
            <div className="grid grid-cols-4 gap-4">
              {[
                { layer: "PLANETARY", icon: "🪐", col: C.gold,
                  feeds: ["Planetary positions (ephemeris)", "Conjunction / opposition / trine angles", "Jupiter–Saturn cycle tracking", "Lunar phase + apogee/perigee", "Mercury retrograde windows"],
                  aether: "Aletheia — structural truth layer; celestial mechanics is deterministic pattern, the most ancient known" },
                { layer: "SPACE WEATHER", icon: "☀️", col: C.orange,
                  feeds: ["NOAA K-index (real-time geomagnetic)", "GOES X-ray flux (solar flare class)", "ACE solar wind speed + Bz component", "CME transit predictions (ENLIL model)", "Schumann resonance amplitude"],
                  aether: "Infernia — constraint dynamics; the solar wind compresses and deforms, forcing the magnetosphere into new configurations" },
                { layer: "AURORA FORECAST", icon: "🌌", col: C.teal,
                  feeds: ["OVATION auroral oval model", "30-min aurora prediction maps", "Latitude visibility thresholds", "Coronal hole stream timing", "South Atlantic Anomaly intensity"],
                  aether: "Reverie — radiative output; the aurora is Earth's visible transmission of solar energy into light, the magnetosphere made legible" },
                { layer: "SYNCHRONICITIES", icon: "✨", col: C.purple,
                  feeds: ["Personal creative breakthrough log", "Nature messenger appearances", "Health / energy / mood markers", "Dream quality and vividness", "Intuitive hit accuracy tracking"],
                  aether: "Mnēsis — raw intake field; the personal log is the most important substrate, because it captures the signal that no instrument measures yet" },
              ].map(c => (
                <div key={c.layer} className="border rounded-xl p-4" style={{ borderColor: c.col + "25", background: c.col + "07" }}>
                  <span className="text-xl block mb-1">{c.icon}</span>
                  <p className="text-[9px] font-['Cinzel',serif] mb-2" style={{ color: c.col }}>{c.layer}</p>
                  <div className="mb-3">
                    {c.feeds.map(f => (
                      <div key={f} className="flex items-start gap-1.5 mb-1">
                        <div className="w-0.5 h-0.5 rounded-full mt-1.5 shrink-0" style={{ background: c.col }} />
                        <p className="text-[7px] leading-3.5" style={{ color: c.col + "60" }}>{f}</p>
                      </div>
                    ))}
                  </div>
                  <div className="border-t pt-2" style={{ borderColor: c.col + "15" }}>
                    <p className="text-[6px] italic leading-3" style={{ color: c.col + "40" }}>{c.aether}</p>
                  </div>
                </div>
              ))}
            </div>
            <div className="border rounded-xl p-5" style={{ borderColor: C.teal + "20", background: C.panel + "50" }}>
              <p className="text-[9px] font-['Cinzel',serif] mb-3" style={{ color: C.teal }}>CONVERGENCE SCORING · WHEN ALL FOUR LAYERS PEAK TOGETHER</p>
              <div className="grid grid-cols-2 gap-5 text-[9px]">
                <div>
                  <p className="font-['Cinzel',serif] mb-1" style={{ color: C.teal }}>SIGNAL THRESHOLDS</p>
                  {[
                    { signal: "Planetary", threshold: "Opposition, conjunction, or superior trine within 3°",     col: C.gold   },
                    { signal: "Geomagnetic", threshold: "K-index ≥ 4 (G1 storm) lasting ≥ 6 hours",             col: C.orange },
                    { signal: "Schumann",  threshold: "Amplitude spike ≥ 2× daily baseline",                    col: C.teal   },
                    { signal: "Personal",  threshold: "Creative breakthrough, vivid dream, or messenger arrival", col: C.purple },
                  ].map(r => (
                    <div key={r.signal} className="flex items-center gap-2 mb-1">
                      <div className="w-1.5 h-1.5 rounded-full shrink-0" style={{ background: r.col }} />
                      <span className="font-['Cinzel',serif]" style={{ color: r.col + "80" }}>{r.signal}:</span>
                      <span style={{ color: r.col + "50" }}>{r.threshold}</span>
                    </div>
                  ))}
                </div>
                <div>
                  <p className="font-['Cinzel',serif] mb-1" style={{ color: C.purple }}>JAN 11 2026 SCORE</p>
                  {[
                    { signal: "Planetary",    score: "✓ Jupiter at opposition (Jan 10, −1 day)",         active: true  },
                    { signal: "Geomagnetic",  score: "✓ G1–G2 storm active, K ≥ 5",                     active: true  },
                    { signal: "Schumann",     score: "✓ Elevated during CME compression period",         active: true  },
                    { signal: "Personal",     score: "✓ AETHER creative flow + 4 messenger arrivals",    active: true  },
                  ].map(r => (
                    <div key={r.signal} className="flex items-center gap-2 mb-1">
                      <div className={`w-1.5 h-1.5 rounded-full shrink-0 ${r.active ? "" : "opacity-30"}`} style={{ background: r.active ? C.green : "#666" }} />
                      <span className="font-['Cinzel',serif] text-green-400/70">{r.signal}:</span>
                      <span className="text-green-300/50">{r.score}</span>
                    </div>
                  ))}
                  <div className="mt-3 border rounded p-2 text-center" style={{ borderColor: C.green + "30", background: C.green + "08" }}>
                    <p className="font-['Cinzel',serif]" style={{ color: C.green }}>4/4 · FULL CONVERGENCE EVENT</p>
                    <p className="text-[7px] mt-0.5" style={{ color: C.green + "50" }}>Rarest category · Document everything · High resonance window</p>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
