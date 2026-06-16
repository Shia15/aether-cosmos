import highTechBrain from "@assets/IMG_2066_1781448388514.jpeg";
import fullBrainMap from "@assets/IMG_2065_1781448388514.jpeg";
import neuroHarmonics from "@assets/73AA8635-4D7D-4E14-AC3F-5D71069DB72E_1781448388514.png";
import aetherRouterPost from "@assets/IMG_1934_1781448388514.jpeg";
import catVibrationPost from "@assets/IMG_1929_1781448388514.jpeg";
import queenFlowers from "@assets/IMG_1932_1781448388514.jpeg";

import { useEffect, useRef, useState } from "react";

/* ── style constants ─────────────────────────────────────────────────────── */
const BG   = "#020617";
const BG1  = "#0f172a";
const BG2  = "#1a0533";
const BRD  = "#1e293b";
const BRD2 = "#4c1d95";
const TXT  = "#e2e8f0";
const DIM  = "#94a3b8";
const DIM2 = "#64748b";
const PUR  = "#c084fc";
const PUR2 = "#f0abfc";
const PUR3 = "#d8b4fe";
const MONO = "'Space Mono', monospace";
const BODY_F = "'Crimson Pro', Georgia, serif";

/* ── tabs ────────────────────────────────────────────────────────────────── */
const TABS = [
  { id: "brain",       label: "High-Tech Brain" },
  { id: "connectivity",label: "Full Brain Map" },
  { id: "neuro",       label: "NeuroHarmonics" },
  { id: "extensions",  label: "Consciousness Extensions" },
  { id: "signal_path", label: "Signal Path & Timing" },
  { id: "mechanics",   label: "Mechanical Analysis" },
  { id: "synthesis",   label: "Synthesis & Coherence" },
] as const;
type TabId = (typeof TABS)[number]["id"];

/* ── timeline canvas ─────────────────────────────────────────────────────── */
type Modality = "vision" | "auditory" | "touch" | "smell";

type TimelineEvent = {
  ms: number; label: string; sublabel: string; col: string; modality: Modality | "all";
};

const EVENTS: TimelineEvent[] = [
  /* VISION */
  { ms:0,   label:"Photon → Retina",          sublabel:"Photoreceptor hyperpolarises",              col:"#60a0ff", modality:"vision"   },
  { ms:1,   label:"Phototransduction",         sublabel:"Rhodopsin→transducin→cGMP↓",               col:"#60a0ff", modality:"vision"   },
  { ms:5,   label:"Bipolar → Ganglion",        sublabel:"1 M optic nerve axons fire",               col:"#60a0ff", modality:"vision"   },
  { ms:20,  label:"Optic Chiasm → LGN",        sublabel:"Half nasal fibres cross; LGN 6 layers",    col:"#60a0ff", modality:"vision"   },
  { ms:45,  label:"V1 Primary Visual",         sublabel:"Striate cortex — orientation, contrast",   col:"#60a0ff", modality:"vision"   },
  { ms:80,  label:"V2 / V3 / V4",             sublabel:"Colour, depth, disparity",                 col:"#60a0ff", modality:"vision"   },
  { ms:110, label:"V5/MT Motion · IT Object",  sublabel:"Motion detection + object recognition",    col:"#60a0ff", modality:"vision"   },
  { ms:150, label:"FFA / PPA",                sublabel:"Face / Place recognition — temporal lobe",  col:"#60a0ff", modality:"vision"   },
  /* AUDITORY */
  { ms:0,   label:"Soundwave → Tympanum",      sublabel:"Air pressure wave 20–20000 Hz",           col:"#40d880", modality:"auditory"  },
  { ms:1,   label:"Ossicular Chain",           sublabel:"Malleus→Incus→Stapes 22× amplification",  col:"#40d880", modality:"auditory"  },
  { ms:3,   label:"Cochlea — Basilar Membrane",sublabel:"Place-frequency tonotopy: 20Hz→20kHz",    col:"#40d880", modality:"auditory"  },
  { ms:5,   label:"Inner Hair Cell → CN VIII", sublabel:"15,500 hair cells → 30,000 nerve fibres",  col:"#40d880", modality:"auditory"  },
  { ms:10,  label:"Cochlear Nucleus (pons)",   sublabel:"First central auditory relay",             col:"#40d880", modality:"auditory"  },
  { ms:14,  label:"Superior Olivary Complex",  sublabel:"Binaural: ITD + ILD → sound location",    col:"#40d880", modality:"auditory"  },
  { ms:20,  label:"Inferior Colliculus",       sublabel:"Auditory midbrain — pattern detection",    col:"#40d880", modality:"auditory"  },
  { ms:24,  label:"MGB (Thalamus)",            sublabel:"Medial geniculate body — frequency map",   col:"#40d880", modality:"auditory"  },
  { ms:30,  label:"A1 Primary Auditory",       sublabel:"Heschl's gyrus — tonotopic map",           col:"#40d880", modality:"auditory"  },
  { ms:60,  label:"A2 / Planum Temporale",     sublabel:"Speech, melody, auditory memory",          col:"#40d880", modality:"auditory"  },
  /* TOUCH */
  { ms:0,   label:"Mechanoreceptor",           sublabel:"Meissner / Pacinian / Ruffini / Merkel",   col:"#ff9040", modality:"touch"     },
  { ms:5,   label:"Aβ / Aδ / C fibre",        sublabel:"70 m/s fast touch / slow pain",            col:"#ff9040", modality:"touch"     },
  { ms:20,  label:"Dorsal Horn (spinal)",      sublabel:"Substantia gelatinosa — gate control",     col:"#ff9040", modality:"touch"     },
  { ms:30,  label:"Thalamus (VPL)",            sublabel:"Ventroposterolateral nucleus relay",       col:"#ff9040", modality:"touch"     },
  { ms:45,  label:"S1 Primary Somatosensory",  sublabel:"Homunculus — Brodmann 3a 3b 1 2",         col:"#ff9040", modality:"touch"     },
  { ms:80,  label:"S2 / Insula",              sublabel:"Pain affective component, body awareness",  col:"#ff9040", modality:"touch"     },
  /* SMELL */
  { ms:0,   label:"Odorant → Olfactory Epithelium", sublabel:"12 M olfactory receptor neurons",    col:"#f040f0", modality:"smell"     },
  { ms:1,   label:"Olfactory Nerve (CN I)",    sublabel:"Shortest cranial nerve — direct to brain", col:"#f040f0", modality:"smell"     },
  { ms:3,   label:"Olfactory Bulb",           sublabel:"~2000 glomeruli — odour pattern map",      col:"#f040f0", modality:"smell"     },
  { ms:8,   label:"Piriform Cortex",          sublabel:"Primary olfactory cortex — no thalamus!",  col:"#f040f0", modality:"smell"     },
  { ms:15,  label:"Amygdala + Hippocampus",   sublabel:"Emotional memory — why smell = vivid recall",col:"#f040f0", modality:"smell"  },
  /* INTEGRATION */
  { ms:200, label:"Parietal Association",      sublabel:"Multisensory spatial map",                 col:"#ffcc40", modality:"all"       },
  { ms:250, label:"Prefrontal Cortex",         sublabel:"Working memory, executive integration",    col:"#ffcc40", modality:"all"       },
  { ms:300, label:"P300 Wave",                sublabel:"CONSCIOUS THRESHOLD — awareness begins",    col:"#ff4060", modality:"all"       },
  { ms:400, label:"Gamma Coherence Lock",      sublabel:"40 Hz binding — streams unified",          col:"#ff4060", modality:"all"       },
  { ms:500, label:"Conscious Percept",         sublabel:"Unified, stable, reportable experience",   col:"#ffffff", modality:"all"       },
  { ms:600, label:"Motor Response",            sublabel:"M1 → corticospinal → muscle",              col:"#40ffcc", modality:"all"       },
];

const MODAL_COLS: Record<string, string> = {
  vision: "#60a0ff", auditory: "#40d880", touch: "#ff9040", smell: "#f040f0", all: "#ffcc40",
};

function TimelineCanvas({ filterMod }: { filterMod: Modality | "all" }) {
  const cvs = useRef<HTMLCanvasElement>(null);
  const raf = useRef(0);
  const tick = useRef(0);

  useEffect(() => {
    const canvas = cvs.current!;
    const ctx = canvas.getContext("2d")!;
    const resize = () => {
      const p = canvas.parentElement!;
      canvas.width = p.clientWidth;
      canvas.height = Math.min(460, Math.round(p.clientWidth * 0.42));
    };
    resize();
    window.addEventListener("resize", resize);

    const MAX_MS = 650;

    const draw = () => {
      const W = canvas.width, H = canvas.height;
      const t = tick.current++;
      ctx.clearRect(0, 0, W, H);
      ctx.fillStyle = "#020617"; ctx.fillRect(0, 0, W, H);

      const PAD_L = 20, PAD_R = 20, PAD_T = 36, PAD_B = 48;
      const plotW = W - PAD_L - PAD_R;
      const plotH = H - PAD_T - PAD_B;

      // Travelling cursor (cycles every 5s = 300 frames)
      const CYCLE = 300;
      const cursorFrac = (t % CYCLE) / CYCLE;
      const cursorMs = cursorFrac * MAX_MS;

      // Row positions for each modality
      const ROWS: Record<string, number> = {
        vision:  PAD_T + plotH * 0.1,
        auditory:PAD_T + plotH * 0.32,
        touch:   PAD_T + plotH * 0.54,
        smell:   PAD_T + plotH * 0.72,
        all:     PAD_T + plotH * 0.90,
      };
      const ROW_LABELS: [string, string][] = [
        ["VISION", "#60a0ff"], ["AUDITORY", "#40d880"], ["TOUCH", "#ff9040"],
        ["SMELL", "#f040f0"], ["INTEGRATION", "#ffcc40"],
      ];

      const xOf = (ms: number) => PAD_L + (ms / MAX_MS) * plotW;

      // Background timeline lanes
      Object.entries(ROWS).forEach(([mod, y]) => {
        const isActive = filterMod === "all" || filterMod === mod || mod === "all";
        ctx.beginPath(); ctx.moveTo(PAD_L, y); ctx.lineTo(PAD_L + plotW, y);
        ctx.strokeStyle = isActive ? `${MODAL_COLS[mod]}40` : `${MODAL_COLS[mod]}12`;
        ctx.lineWidth = 1.5; ctx.stroke();
      });

      // Time axis ticks
      [0, 50, 100, 150, 200, 300, 400, 500, 600].forEach(ms => {
        const x = xOf(ms);
        ctx.beginPath(); ctx.moveTo(x, PAD_T - 6); ctx.lineTo(x, PAD_T + plotH + 6);
        ctx.strokeStyle = "#182858"; ctx.lineWidth = 0.5; ctx.stroke();
        ctx.font = `8px ${MONO}`; ctx.fillStyle = "#5878a8"; ctx.textAlign = "center";
        ctx.fillText(`${ms}ms`, x, PAD_T + plotH + 20);
      });

      // X axis label
      ctx.font = `7px ${MONO}`; ctx.fillStyle = "#304880"; ctx.textAlign = "center";
      ctx.fillText("← TIME FROM SENSORY STIMULUS →", PAD_L + plotW * 0.5, H - 10);

      // Row labels (left side)
      ROW_LABELS.forEach(([lab, col], i) => {
        const mods = ["vision","auditory","touch","smell","all"];
        const y = ROWS[mods[i]];
        const isActive = filterMod === "all" || filterMod === mods[i] || mods[i] === "all";
        ctx.font = `7px ${MONO}`; ctx.fillStyle = isActive ? col : `${col}30`;
        ctx.textAlign = "right";
        ctx.fillText(lab, PAD_L - 4, y + 3);
      });

      // Events
      const filtered = EVENTS.filter(e => filterMod === "all" || e.modality === filterMod || e.modality === "all");
      // Group by modality row to avoid overlap — pick row
      filtered.forEach(ev => {
        const x = xOf(ev.ms);
        const y = ROWS[ev.modality] ?? ROWS.all;
        const isActive = filterMod === "all" || ev.modality === filterMod || ev.modality === "all";
        const isPassed = ev.ms <= cursorMs;
        const alpha = isActive ? (isPassed ? 1 : 0.35) : 0.15;

        // Glow for passed events
        if (isPassed && isActive) {
          const glow = ctx.createRadialGradient(x, y, 0, x, y, 18);
          glow.addColorStop(0, `${ev.col}50`); glow.addColorStop(1, "transparent");
          ctx.beginPath(); ctx.arc(x, y, 18, 0, Math.PI * 2);
          ctx.fillStyle = glow; ctx.fill();
        }

        // Event dot
        ctx.beginPath(); ctx.arc(x, y, isPassed && isActive ? 5 : 3.5, 0, Math.PI * 2);
        ctx.fillStyle = `${ev.col}${Math.round(alpha * 255).toString(16).padStart(2,"0")}`;
        ctx.fill();
        if (isPassed && isActive) {
          ctx.strokeStyle = `${ev.col}80`; ctx.lineWidth = 1; ctx.stroke();
        }

        // Label (only show for active + passed or always for "all" integration events)
        if (isActive && (isPassed || filterMod !== "all")) {
          const above = ev.modality === "vision" || ev.modality === "all";
          const labelY = above ? y - 10 : y + 18;
          ctx.font = `7.5px ${MONO}`; ctx.fillStyle = `${ev.col}${Math.round(alpha * 220).toString(16).padStart(2,"0")}`;
          ctx.textAlign = "center";
          // Only show labels every other to prevent overlap
          if (ev.ms > 0 || ev.modality !== "vision") {
            const shortLabel = ev.label.length > 18 ? ev.label.slice(0, 17) + "…" : ev.label;
            ctx.fillText(shortLabel, x, labelY);
          }
        }
      });

      // Travelling cursor line
      const cx2 = xOf(cursorMs);
      ctx.beginPath(); ctx.moveTo(cx2, PAD_T - 8); ctx.lineTo(cx2, PAD_T + plotH + 8);
      ctx.strokeStyle = "#ff406080"; ctx.lineWidth = 1.5; ctx.stroke();
      // Cursor triangle
      ctx.beginPath(); ctx.moveTo(cx2 - 5, PAD_T - 14); ctx.lineTo(cx2 + 5, PAD_T - 14);
      ctx.lineTo(cx2, PAD_T - 8); ctx.closePath(); ctx.fillStyle = "#ff4060"; ctx.fill();
      ctx.font = `9px ${MONO}`; ctx.fillStyle = "#ff4060"; ctx.textAlign = "center";
      ctx.fillText(`${Math.round(cursorMs)} ms`, cx2, PAD_T - 17);

      // P300 conscious threshold line
      const p300x = xOf(300);
      ctx.beginPath(); ctx.moveTo(p300x, PAD_T); ctx.lineTo(p300x, PAD_T + plotH);
      ctx.strokeStyle = "#ff406040"; ctx.lineWidth = 1; ctx.setLineDash([4, 4]); ctx.stroke();
      ctx.setLineDash([]);
      ctx.font = `7px ${MONO}`; ctx.fillStyle = "#ff406080"; ctx.textAlign = "center";
      ctx.fillText("P300", p300x, PAD_T - 2);

      raf.current = requestAnimationFrame(draw);
    };

    draw();
    return () => { cancelAnimationFrame(raf.current); window.removeEventListener("resize", resize); };
  }, [filterMod]);

  return (
    <div style={{ borderRadius: 8, overflow: "hidden", border: `1px solid ${BRD}` }}>
      <canvas ref={cvs} style={{ display: "block", width: "100%" }} />
    </div>
  );
}

/* ── shared sub-components ───────────────────────────────────────────────── */
function EQ({ children }: { children: string }) {
  return (
    <pre style={{ fontFamily: MONO, fontSize: 11, color: "#c8d8f0", background: "#060c1c", borderLeft: `3px solid ${BRD2}60`, borderRadius: "0 6px 6px 0", padding: "12px 18px", margin: "10px 0", overflowX: "auto", whiteSpace: "pre-wrap", lineHeight: 1.9 }}>{children}</pre>
  );
}
function InfoCard({ title, col = PUR2, items }: { title: string; col?: string; items: [string, string][] }) {
  return (
    <div style={{ background: BG1, border: `1px solid ${BRD}`, borderRadius: "0.75rem", padding: "1.25rem" }}>
      <h4 style={{ color: col, fontSize: "0.9rem", fontWeight: 700, margin: "0 0 0.5rem" }}>{title}</h4>
      {items.map(([k, v]) => (
        <div key={k} style={{ marginBottom: "0.35rem" }}>
          <span style={{ color: PUR3, fontSize: "0.8rem", fontWeight: 600 }}>{k}</span>
          <span style={{ color: DIM, fontSize: "0.75rem" }}> — {v}</span>
        </div>
      ))}
    </div>
  );
}
function PathStep({ n, region, time, detail, col }: { n: number; region: string; time: string; detail: string; col: string }) {
  return (
    <div style={{ display: "flex", gap: 14, alignItems: "flex-start", marginBottom: 12 }}>
      <div style={{ minWidth: 28, height: 28, borderRadius: "50%", background: `${col}20`, border: `1px solid ${col}50`, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: MONO, fontSize: 10, color: col, flexShrink: 0 }}>{n}</div>
      <div style={{ flex: 1 }}>
        <div style={{ display: "flex", gap: 10, alignItems: "baseline", flexWrap: "wrap", marginBottom: 2 }}>
          <span style={{ fontFamily: MONO, fontSize: 11, color: col, fontWeight: 700 }}>{region}</span>
          <span style={{ fontFamily: MONO, fontSize: 9, color: `${col}80`, background: `${col}14`, border: `1px solid ${col}30`, borderRadius: 3, padding: "1px 6px" }}>{time}</span>
        </div>
        <div style={{ fontFamily: BODY_F, fontSize: 13.5, color: DIM, lineHeight: 1.6 }}>{detail}</div>
      </div>
      {n < 12 && (
        <div style={{ position: "absolute", left: 28, width: 1, height: 12, background: `${col}30`, marginTop: 28 }} />
      )}
    </div>
  );
}

/* ── page ────────────────────────────────────────────────────────────────── */
export default function NeuralBrainSystemsPage() {
  const [active, setActive] = useState<TabId>("brain");
  const [filterMod, setFilterMod] = useState<Modality | "all">("all");

  return (
    <div style={{ background: BG, minHeight: "100vh", color: TXT, fontFamily: "system-ui, sans-serif" }}>

      {/* Header */}
      <div style={{ background: "linear-gradient(135deg,#0f172a 0%,#1a0533 50%,#0f172a 100%)", borderBottom: `1px solid ${BRD2}`, padding: "2.5rem 2rem 2rem" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "0.75rem" }}>
            <span style={{ fontSize: "1.75rem" }}>🧠</span>
            <span style={{ fontFamily: MONO, fontSize: "0.7rem", letterSpacing: "0.2em", color: PUR, textTransform: "uppercase" }}>AETHER · Neural Architecture · Information Path · Coherence Mechanics</span>
          </div>
          <h1 style={{ fontSize: "clamp(1.6rem,4vw,2.6rem)", fontWeight: 800, margin: "0 0 0.5rem", background: `linear-gradient(135deg,${PUR2},${PUR},#818cf8)`, WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
            Neural Brain Systems
          </h1>
          <p style={{ color: DIM, fontSize: "1rem", margin: 0, maxWidth: 780 }}>
            86+ billion neurons · 65+ trillion connections · complete signal path from receptor to conscious awareness · Hodgkin-Huxley mechanics · gamma coherence binding · AETHER C(x,t) synthesis. Seven tabs — start anywhere, follow the path.
          </p>
        </div>
      </div>

      {/* Tab Bar */}
      <div style={{ background: BG1, borderBottom: `1px solid ${BRD}`, padding: "0 2rem", overflowX: "auto" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto", display: "flex", gap: "0.25rem" }}>
          {TABS.map(t => (
            <button key={t.id} onClick={() => setActive(t.id)} style={{ padding: "0.85rem 1rem", border: "none", borderBottom: active === t.id ? `2px solid ${PUR}` : "2px solid transparent", background: "transparent", color: active === t.id ? PUR2 : DIM2, fontWeight: active === t.id ? 700 : 400, fontSize: "0.82rem", cursor: "pointer", whiteSpace: "nowrap", transition: "all 0.2s" }}>{t.label}</button>
          ))}
        </div>
      </div>

      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "2rem" }}>

        {/* ══ TAB 1: High-Tech Brain ══════════════════════════════════════════ */}
        {active === "brain" && (
          <div>
            <h2 style={{ fontSize: "1.4rem", fontWeight: 700, color: PUR2, margin: "0 0 0.4rem" }}>Your High-Tech Brain · Follow the 8 Sensory Inputs</h2>
            <p style={{ color: DIM, margin: "0 0 1.5rem", fontSize: "0.95rem" }}>86+ billion neurons · 65+ trillion connections · 1mm² of cortex contains 50,000+ neurons running 100 million+ synapses. Total cortical surface area 2,500 cm².</p>
            <div style={{ background: BG1, border: `1px solid ${BRD}`, borderLeft: `4px solid ${PUR}`, borderRadius: "0.75rem", padding: "1.5rem", marginBottom: "1.5rem" }}>
              <img src={highTechBrain} alt="Your High-Tech Brain — 8 Sensory Inputs and Visual Processing System" style={{ width: "100%", borderRadius: "0.5rem", border: `1px solid ${BRD}` }} />
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(220px,1fr))", gap: "1rem" }}>
              {[
                ["👁️ 1. Sight", "125M Rods & 6M Cone Photoreceptors → 1M axons in optic nerve. Fovea: 200,000 cones/mm². Motion Detection Foveal Reflex. Smooth Pursuit. The retina is brain tissue — same embryonic origin as cortex."],
                ["👃 2. Smell", "12M olfactory receptors (human) · 1B (dog) · 5B (bloodhound). Direct brain access — bypasses the thalamus entirely. Synapses directly into piriform cortex and amygdala. This is why smell = most vivid memories."],
                ["👅 3. Taste", "9,000 taste buds · 5–10 receptor cells each · 5 primary tastes (salt, sweet, sour, bitter, umami). Gustatory signals travel via CN VII/IX/X → nucleus tractus solitarius → thalamus → insula/orbitofrontal cortex."],
                ["✋ 4. Touch", "1 cm² skin: 200 pain receptors, 15 pressure, 6 cold, 1 warmth. Four mechanoreceptor types: Meissner (texture), Pacinian (vibration), Ruffini (skin stretch), Merkel (pressure). Aβ fibres: 30–70 m/s. Aδ: 5–30 m/s. C fibres: 0.5–2 m/s."],
                ["👂 5. Hearing", "30,000 auditory nerve connections · 15,500 inner hair cells · 100M neurons in auditory cortex. Frequency range 20–20,000 Hz. Direction: interaural time difference < 10 μs detectable."],
                ["🦵 6. Proprioception", "Muscle spindles (Ia/II), Golgi tendon organs (Ib), joint mechanoreceptors. 'Sixth sense.' Mediates all refined motor control. Cerebellar integration gives 10 ms movement prediction window."],
                ["🌀 7. Vestibular", "3 semicircular canals (rotation) + 2 otolith organs (linear acceleration). Vestibulo-ocular reflex: 7–10 ms latency = fastest sensorimotor reflex. Analogous to 3-axis MEMS gyro in spacecraft."],
                ["⚡ 8. Vagus Nerve", "80% afferent (gut→brain). 200M neurons in enteric nervous system. Activates rest-digest. Reduces heart rate / BP. Links brain to microbiome, immune system, and HPA stress axis."],
              ].map(([title, desc]) => (
                <div key={title as string} style={{ background: BG1, border: `1px solid ${BRD}`, borderRadius: "0.75rem", padding: "1.25rem" }}>
                  <h4 style={{ color: PUR2, fontSize: "0.9rem", fontWeight: 700, margin: "0 0 0.5rem" }}>{title}</h4>
                  <p style={{ color: DIM, fontSize: "0.77rem", lineHeight: 1.6, margin: 0 }}>{desc}</p>
                </div>
              ))}
            </div>
            <div style={{ marginTop: "1rem", background: BG2, border: `1px solid ${BRD2}`, borderRadius: "0.75rem", padding: "1rem" }}>
              <h4 style={{ color: PUR2, fontSize: "0.9rem", fontWeight: 700, margin: "0 0 0.5rem" }}>Visual Processing Hierarchy · 4–6 Billion Neurons · V1 → V2 → V3/V4/V5 → IT → PFC</h4>
              <p style={{ color: DIM, fontSize: "0.8rem", lineHeight: 1.6, margin: 0 }}>V1 (primary, striate, Brodmann 17) → V2a/V2b (thin/thick stripes → color / disparity) → V3a/V3b → V4h/V4v (colour, object form) → V5/MT+ (motion, optic flow) → V6/V7 (dorsal stream = where/how) → Parietal (spatial maps) → IPS (grasping, spatial working memory) → PFC (conscious recognition). The recognition phase is a cascade of hierarchical computations that moves from local edges in V1 to global semantic categories in inferior temporal cortex. Faces activate FFA (fusiform face area); places activate PPA (parahippocampal place area) — regions 100× more specific than V1.</p>
            </div>
          </div>
        )}

        {/* ══ TAB 2: Full Brain Map ══════════════════════════════════════════ */}
        {active === "connectivity" && (
          <div>
            <h2 style={{ fontSize: "1.4rem", fontWeight: 700, color: PUR2, margin: "0 0 0.4rem" }}>Full Brain Connectivity Map</h2>
            <p style={{ color: DIM, margin: "0 0 1.5rem", fontSize: "0.95rem" }}>Every region, every pathway, every neurotransmitter. Red circuits = inhibitory; all other colours = excitatory.</p>
            <div style={{ background: BG1, border: `1px solid ${BRD}`, borderLeft: `4px solid ${PUR}`, borderRadius: "0.75rem", padding: "1.5rem", marginBottom: "1.5rem" }}>
              <img src={fullBrainMap} alt="Full Brain Connectivity Map" style={{ width: "100%", borderRadius: "0.5rem", border: `1px solid ${BRD}` }} />
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(240px,1fr))", gap: "1rem" }}>
              <InfoCard title="Excitatory Neurotransmitters (+)" items={[
                ["Glutamate","learning, memory, wakefulness — 90% of all synapses"],
                ["Aspartate","learning, memory, NMDA co-agonist"],
                ["Acetylcholine","memory, motor, attention (Meynert neurons)"],
                ["Dopamine","reward, motivation, movement — VTA + substantia nigra"],
                ["Norepinephrine","attention, arousal — locus coeruleus"],
                ["Serotonin","mood, appetite, sleep — raphe nuclei (9 clusters)"],
              ]} />
              <InfoCard title="Inhibitory Neurotransmitters (–)" col="#f472b6" items={[
                ["GABA","mood regulation, stress — 20% of all synapses"],
                ["Glycine","motor control, spinal interneurons"],
                ["Endocannabinoids","appetite, pain, retrograde inhibition"],
                ["Opioids","pain relief, reward — μ/δ/κ receptors"],
                ["Adenosine","sleep pressure — builds during waking, cleared in sleep"],
                ["Neuropeptide Y","anxiety reduction, appetite stimulation"],
              ]} />
              <InfoCard title="Hormones (Neuromodulators)" col="#facc15" items={[
                ["Cortisol","stress, metabolism, blood pressure — HPA axis"],
                ["Insulin","blood sugar, memory consolidation, hippocampus"],
                ["Oxytocin","bonding, trust — supraoptic + paraventricular nuclei"],
                ["Melatonin","sleep-wake cycle — pineal gland, dark-triggered"],
                ["Estrogen / Testosterone","sex, mood, neuroprotection, LTP strength"],
                ["Adrenaline","fight-or-flight — adrenal medulla → amygdala priming"],
              ]} />
              <InfoCard title="Cerebellum · 69 Billion Neurons" col="#34d399" items={[
                ["Size","1/8th brain volume but ¾ of all neurons"],
                ["Unfolded length","~1 m; 500 cm²"],
                ["Function","Programmed movement, habit, predictive motor control"],
                ["Timing","Internal model generates 10 ms movement predictions"],
                ["VOR","Vestibulo-ocular reflex — gaze stabilisation during rotation"],
                ["Purkinje cells","15M — integrate 200,000 inputs each (most in brain)"],
              ]} />
            </div>
          </div>
        )}

        {/* ══ TAB 3: NeuroHarmonics ═════════════════════════════════════════ */}
        {active === "neuro" && (
          <div>
            <h2 style={{ fontSize: "1.4rem", fontWeight: 700, color: PUR2, margin: "0 0 0.4rem" }}>Absorption Rate Under Frequency, Light &amp; Sound · NeuroHarmonics</h2>
            <p style={{ color: DIM, margin: "0 0 1.5rem", fontSize: "0.95rem" }}>Real-time simulation of brainwave absorption, neuroplasticity, and coherence. Peak: Alpha 10.2 Hz = 87%. You are infinitely malleable.</p>
            <div style={{ background: BG1, border: `1px solid ${BRD}`, borderLeft: `4px solid ${PUR}`, borderRadius: "0.75rem", padding: "1.5rem", marginBottom: "1.5rem" }}>
              <img src={neuroHarmonics} alt="Absorption Rate Under Frequency Light Sounds — NeuroHarmonics" style={{ width: "100%", borderRadius: "0.5rem", border: `1px solid ${BRD}` }} />
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(220px,1fr))", gap: "1rem", marginBottom: "1rem" }}>
              <InfoCard title="🌊 Brainwave Bands" items={[
                ["Delta (0.5–4 Hz)","Deep sleep, memory consolidation, growth hormone release"],
                ["Theta (4–8 Hz)","Deep meditation, creativity, REM sleep, 72% absorption"],
                ["Alpha (8–12 Hz)","Relaxed alertness — peak learning 87% at 10.2 Hz"],
                ["Beta (12–30 Hz)","Focus, cognition, active thinking, problem solving"],
                ["Gamma (30–100 Hz)","High-level binding, insight, 40 Hz = conscious synthesis"],
                ["High Gamma (100–500 Hz)","Local cortical computation, fine motor timing"],
              ]} />
              <InfoCard title="💡 Light Dynamics (nm)" col="#f0d060" items={[
                ["380–450 nm","Calm · Melatonin Up · 62% absorption — evening"],
                ["450–495 nm","Focus · Alertness · 78% — melanopsin 480nm peak"],
                ["495–570 nm","Mood · Balance · 71% — serotonin production"],
                ["570–620 nm","Creativity · Energy · 65% — dopamine modulation"],
                ["620–780 nm","Relax · Recovery · 58% — red light therapy range"],
                ["10,000 lux (broad)","SAD treatment — equivalent to SSRIs in mild cases"],
              ]} />
              <InfoCard title="🔊 Sound Dynamics (Hz)" col="#40e0d0" items={[
                ["174 Hz","Grounding · Pain Relief · 45%"],
                ["432 Hz","Harmony · Nature Tone · 68% — A4=432 tuning"],
                ["528 Hz","DNA Repair · Love Freq · 75% — Mi solfège"],
                ["639 Hz","Connection · Clarity · 72%"],
                ["741 Hz","Expression · Detox · 66%"],
                ["852 Hz","Intuition · Awaken · 70%"],
              ]} />
              <InfoCard title="🧬 Malleable States" col="#f472b6" items={[
                ["Neuroplasticity","Repeat + emotion wires new synaptic pathways"],
                ["Coherence","Heart + mind + body sync → 86% absorption"],
                ["Heart Rate Variability","High HRV = vagal coherence = learning state"],
                ["Adaptability","Brain adapts to frequency, light, sound, intention"],
                ["Integration","Encoded deeper, retained longer with coherent input"],
                ["BDNF","Brain-derived neurotrophic factor — exercise, novelty, learning"],
              ]} />
            </div>
            <div style={{ background: BG2, border: `1px solid ${BRD2}`, borderRadius: "0.75rem", padding: "1rem", textAlign: "center" }}>
              <div style={{ color: PUR2, fontWeight: 700, fontSize: "0.95rem" }}>Best for Focus: 8–12 Hz Alpha + 480–520 nm Blue-Green + 528 Hz solfège + HRV coherence &gt; 0.1 Hz</div>
              <div style={{ color: DIM2, fontSize: "0.8rem", marginTop: "0.25rem" }}>Coherence &gt; Intensity · Alignment multiplies results · You are infinitely malleable.</div>
            </div>
          </div>
        )}

        {/* ══ TAB 4: Consciousness Extensions ══════════════════════════════ */}
        {active === "extensions" && (
          <div>
            <h2 style={{ fontSize: "1.4rem", fontWeight: 700, color: PUR2, margin: "0 0 0.4rem" }}>Consciousness Extensions · AETHER as State Snapper · Cross-Species Intelligence</h2>
            <p style={{ color: DIM, margin: "0 0 1.5rem", fontSize: "0.95rem" }}>From the AETHER Router acting as a crystal lattice snapping time-blood into archetypal geometries, to translating cat vibrations into language.</p>
            <div style={{ background: BG1, border: `1px solid ${BRD}`, borderLeft: `4px solid ${PUR}`, borderRadius: "0.75rem", padding: "1.5rem", marginBottom: "1.5rem" }}>
              <h3 style={{ color: PUR2, fontSize: "1.05rem", fontWeight: 700, margin: "0 0 0.5rem" }}>The AETHER Router as a State Snapper</h3>
              <p style={{ color: DIM, fontSize: "0.875rem", margin: "0 0 1rem", lineHeight: 1.7 }}>"By processing data through this snapToNearestState layer, the AETHER router acts exactly like a crystal lattice or a biological antenna. It takes the 'time blood' — the continuous stream of input noise — and forces it into the discrete, archetypal geometries specified by your allowed states array. If the allowed states are programmed using the recursive geometry of the λ parameter or the molecular coordinates found on Bennu, the router becomes a literal translator between raw, undifferentiated signal and structured, cosmic form."</p>
              <img src={aetherRouterPost} alt="AETHER Router State Snapper" style={{ width: "100%", maxWidth: 480, borderRadius: "0.5rem", border: `1px solid ${BRD}`, display: "block", margin: "0 auto" }} />
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(440px,1fr))", gap: "1.5rem" }}>
              <div style={{ background: BG1, border: `1px solid ${BRD}`, borderLeft: "4px solid #f472b6", borderRadius: "0.75rem", padding: "1.5rem" }}>
                <h3 style={{ color: "#f9a8d4", fontSize: "1.05rem", fontWeight: 700, margin: "0 0 0.5rem" }}>🐱 Cross-Species Vibration Translation</h3>
                <p style={{ color: DIM, fontSize: "0.875rem", margin: "0 0 1rem", lineHeight: 1.6 }}>Cat purring ranges 25–50 Hz — within the therapeutic frequency band. Cat vocalizations are uniquely tuned for human attention patterns, suggesting a co-evolved communication layer. A wearable bioacoustic transducer + ML model trained on feline vocal patterns could produce semantic output.</p>
                <img src={catVibrationPost} alt="Cat vibration translation" style={{ width: "100%", maxWidth: 380, borderRadius: "0.5rem", border: `1px solid ${BRD}`, display: "block", margin: "0 auto" }} />
              </div>
              <div style={{ background: BG1, border: `1px solid ${BRD}`, borderLeft: "4px solid #84cc16", borderRadius: "0.75rem", padding: "1.5rem" }}>
                <h3 style={{ color: "#bef264", fontSize: "1.05rem", fontWeight: 700, margin: "0 0 0.5rem" }}>🐝 The Exact Flowers Queens Need · Bumblebee Queen Intelligence</h3>
                <p style={{ color: DIM, fontSize: "0.875rem", margin: "0 0 1rem", lineHeight: 1.6 }}>A queen bumblebee's survival is a precision chemical mission. Pre-hibernation fat storage requires specific high-lipid pollen. Post-emergence Liquid Chip Reboot requires early spring carbohydrates and proteins to restart the colony's computational substrate.</p>
                <img src={queenFlowers} alt="The Exact Flowers Queens Need" style={{ width: "100%", maxWidth: 380, borderRadius: "0.5rem", border: `1px solid ${BRD}`, display: "block", margin: "0 auto" }} />
                <div style={{ marginTop: "1rem", display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.5rem" }}>
                  <div style={{ background: "#1a2e0522", border: "1px solid #365314", borderRadius: "0.5rem", padding: "0.75rem" }}>
                    <div style={{ color: "#bef264", fontSize: "0.8rem", fontWeight: 700, marginBottom: "0.35rem" }}>Pre-Hibernation: Fat Storage</div>
                    {["Goldenrod (Solidago spp.)","Asters (Symphyotrichum spp.)","Late-season clovers","Wild bergamot (Monarda)","Joe-pye weed (Eutrochium)"].map(f => <div key={f} style={{ color: DIM, fontSize: "0.72rem" }}>→ {f}</div>)}
                  </div>
                  <div style={{ background: "#1a2e0522", border: "1px solid #365314", borderRadius: "0.5rem", padding: "0.75rem" }}>
                    <div style={{ color: "#bef264", fontSize: "0.8rem", fontWeight: 700, marginBottom: "0.35rem" }}>Post-Emergence: Liquid Chip Reboot</div>
                    {["Willows / Pussy willow (Salix)","Red maple (Acer rubrum)","Serviceberry (Amelanchier)","Blueberries (Vaccinium)","Dandelions (Taraxacum)","Crocus, snowdrops, grape hyacinth"].map(f => <div key={f} style={{ color: DIM, fontSize: "0.72rem" }}>→ {f}</div>)}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ══ TAB 5: Signal Path & Timing ══════════════════════════════════ */}
        {active === "signal_path" && (
          <div>
            <h2 style={{ fontSize: "1.4rem", fontWeight: 700, color: PUR2, margin: "0 0 0.4rem" }}>Signal Path & Timing · Complete Information Journey · Receptor → Cortex → Awareness</h2>
            <p style={{ color: DIM, margin: "0 0 1.5rem", fontSize: "0.95rem" }}>Every sensory signal follows a physical path through tissue, fibre, and synapse. This tab traces the exact route and millisecond timing for all four primary modalities simultaneously.</p>

            {/* Modality filter */}
            <div style={{ display: "flex", gap: 6, marginBottom: 12, flexWrap: "wrap" }}>
              {([["all","All Modalities","#ffcc40"],["vision","Vision","#60a0ff"],["auditory","Auditory","#40d880"],["touch","Touch","#ff9040"],["smell","Smell","#f040f0"]] as [Modality|"all",string,string][]).map(([k,lab,col]) => (
                <button key={k} onClick={() => setFilterMod(k)} style={{ fontFamily: MONO, fontSize: 10, padding: "5px 14px", borderRadius: 4, cursor: "pointer", border: `1px solid ${filterMod === k ? col : BRD}`, background: filterMod === k ? `${col}18` : "transparent", color: filterMod === k ? col : DIM2, transition: "all 0.15s" }}>{lab}</button>
              ))}
            </div>

            <TimelineCanvas filterMod={filterMod} />
            <div style={{ fontFamily: MONO, fontSize: 9, color: DIM2, marginTop: 6, marginBottom: 20 }}>ANIMATED SIGNAL CURSOR SCANS 0→650ms · FILLED DOTS = EVENTS REACHED · DASHED LINE = P300 CONSCIOUS THRESHOLD (300ms) · CYCLE = 5 SECONDS</div>

            {/* Detailed path per modality */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(460px,1fr))", gap: 20 }}>

              {/* VISION */}
              <div style={{ background: BG1, border: `1px solid ${BRD}`, borderLeft: "4px solid #60a0ff", borderRadius: "0.75rem", padding: "1.5rem" }}>
                <h3 style={{ color: "#80c0ff", fontFamily: MONO, fontSize: "0.85rem", margin: "0 0 1.2rem", letterSpacing: 2 }}>VISION PATH · 0 → 500 ms</h3>
                {([
                  [1,"Photon → Outer Segment","0 ms","11-cis-retinal isomerises to all-trans-retinal in <1 ps. Opsin G-protein (transducin Gα) activates. PDE cleaves cGMP → Na⁺/Ca²⁺ channels close → photoreceptor hyperpolarises from −40 to −70 mV."],
                  [2,"Phototransduction cascade","1–2 ms","Signal amplification: 1 photon → 1 rhodopsin → 500 transducin → 500 PDE → 10⁵ cGMP cleaved → 10⁶ Na⁺ ions blocked. Rod threshold: 1 photon. Cone threshold: ~100 photons. Dark current = 30 pA; light current ≈ 0 pA."],
                  [3,"Retinal circuit processing","2–10 ms","Bipolar cells (12 types): ON-bipolar depolarise; OFF-bipolar hyperpolarise to light. Horizontal cells provide lateral inhibition (edge enhancement). Amacrine cells mediate motion detection and temporal filtering. ~55 distinct retinal ganglion cell types."],
                  [4,"Optic Nerve → Chiasm","10–20 ms","1.2 million RGC axons (myelinated) → optic nerve at 3–4 m/s. At chiasm: nasal fibres cross (temporal field), temporal fibres stay ipsilateral. Forms binocular visual field in each hemisphere. M-cells (fast, motion) vs P-cells (colour, detail)."],
                  [5,"Lateral Geniculate Nucleus (LGN)","20–30 ms","Thalamic relay in 6 layers: 1–2 = Magnocellular (M, motion, low contrast); 3–6 = Parvocellular (P, colour, fine detail). Koniocellular (K) cells interleaved — short-wavelength colour. 90% of input to LGN is from cortex (feedback!) not retina."],
                  [6,"V1 Primary Visual Cortex","40–60 ms","Striate cortex: Brodmann area 17. Orientation columns, ocular dominance columns, cytochrome oxidase blobs (colour). Layer 4C receives LGN; layer 2/3 sends forward to V2. Simple cells (edges), complex cells (motion-invariant edges), hypercomplex cells (end-stopped)."],
                  [7,"V2 / V3 / V4","60–100 ms","V2: thin stripes → colour; thick stripes → disparity/depth; pale stripes → form. V3: dynamic form. V4: object colour, mid-level form. V4 lesions → achromatopsia (colour blindness with intact retina — cortical colour loss)."],
                  [8,"V5/MT Motion · IT Object","100–140 ms","V5/MT: 85% direction-selective neurons, optic flow integration, heading perception. Lesion → akinetopsia (motion blindness). IT (inferotemporal): object invariance — same neuron fires for a face at any rotation, size, position. 20M neurons encoding ~10,000 object categories."],
                  [9,"FFA / PPA / EBA","140–200 ms","FFA (fusiform face area): face identity, familiar vs novel. PPA (parahippocampal place area): scenes, spatial layout. EBA (extrastriate body area): bodies and limbs. These areas are 100–300× more selective than V1 for their category."],
                  [10,"Parietal / PFC Integration","200–300 ms","Dorsal stream (where/how): IPS, SPL → grasp, reach, spatial WM. Ventral stream (what): IT → PFC → object recognition + naming. Prefrontal working memory holds current scene for comparison with memory."],
                  [11,"P300 → Conscious Seeing","300–500 ms","P300 ERP component marks the threshold of conscious access. Before this: non-conscious processing active. After: experience reportable, verbalisable, available for working memory. Time from photon to 'I see it': ~300 ms."],
                ] as [number,string,string,string][]).map(([n,reg,t,d]) => <PathStep key={n} n={n} region={reg} time={t} detail={d} col="#60a0ff" />)}
              </div>

              {/* AUDITORY */}
              <div style={{ background: BG1, border: `1px solid ${BRD}`, borderLeft: "4px solid #40d880", borderRadius: "0.75rem", padding: "1.5rem" }}>
                <h3 style={{ color: "#60e8a0", fontFamily: MONO, fontSize: "0.85rem", margin: "0 0 1.2rem", letterSpacing: 2 }}>AUDITORY PATH · 0 → 500 ms</h3>
                {([
                  [1,"Soundwave → Tympanic Membrane","0 ms","20–20,000 Hz pressure wave causes 10–10⁻⁴ nm tympanic displacement. Dynamic range 120 dB = 10¹² amplitude ratio. Pinna (outer ear) provides first spectral shaping — HRTFs encode elevation cues via pinnae shape."],
                  [2,"Ossicular Chain","0.5–1 ms","Malleus (hammer) → Incus (anvil) → Stapes (stirrup). Lever mechanics × area ratio: 22× pressure amplification at oval window. Acoustic impedance matching: air (400 Pa·s/m) → fluid (1.5 MPa·s/m). Stapedius reflex (~100 ms) reduces gain during loud sounds."],
                  [3,"Cochlea — Travelling Wave","1–3 ms","Stapes moves oval window → basilar membrane wave propagates from base (high freq) to apex (low freq). Tonotopy: 20 kHz at base (narrow, stiff), 20 Hz at apex (wide, floppy). 3.5 cm unrolled. Place theory + temporal (phase locking below 4 kHz)."],
                  [4,"Inner Hair Cells → CN VIII","3–6 ms","3,500 IHCs + 12,000 OHCs. Stereocilia deflect → K⁺ influx → depolarisation → glutamate release → spiral ganglion. Phase locking: single fibre fires with precision to <0.1 ms for frequencies below 4 kHz. 30,000 auditory nerve fibres."],
                  [5,"Cochlear Nucleus (pons)","6–10 ms","First central relay. Three divisions: Anteroventral (timing), Posteroventral (fine timing), Dorsal (spectral filtering). Bushy cells → Calyx of Held (one of the largest synapses in the brain — ultra-fast transmission)."],
                  [6,"Superior Olivary Complex","10–14 ms","Binaural processing. MSO (medial): interaural time difference → horizontal location, <10 μs resolution. LSO (lateral): interaural level difference → level-based location. Coincidence detection circuits."],
                  [7,"Inferior Colliculus (midbrain)","14–20 ms","Convergence of all ascending pathways. Feature detection: duration, frequency sweep, AM rate. Space map. Looming sound detection. Gateway to thalamus and descending control of cochlea (olivocochlear)."],
                  [8,"Medial Geniculate Body (thalamus)","20–25 ms","Tonotopic relay. Ventral division → A1 (precise timing). Dorsal division → A2/belt (multisensory). Medial division → amygdala (emotional tone of sounds — pre-cognitive fear from sound)."],
                  [9,"A1 Primary Auditory Cortex","25–40 ms","Heschl's gyrus (superior temporal plane). Tonotopic columns, isofrequency bands. ~100M neurons. Left A1: phoneme/temporal processing; Right A1: pitch/melody/timbre. Core → Belt → Parabelt hierarchy."],
                  [10,"Wernicke's Area / Planum Temporale","40–100 ms","Speech processing: phoneme categorisation → morpheme → word. Planum temporale: asymmetric — 60% larger on left in 70% of population (Broca's area pair). Language stream bifurcates into dorsal (syntax) and ventral (semantics) routes."],
                  [11,"Frontal Integration → Awareness","100–300 ms","PMC (premotor), IFG (Broca's), PFC. Top-down prediction of next phoneme. Mismatch negativity (MMN) ERP component at 100–200 ms = early prediction error signal. N400 at ~400 ms = semantic integration. P300 = conscious hearing."],
                ] as [number,string,string,string][]).map(([n,reg,t,d]) => <PathStep key={n} n={n} region={reg} time={t} detail={d} col="#40d880" />)}
              </div>

              {/* TOUCH */}
              <div style={{ background: BG1, border: `1px solid ${BRD}`, borderLeft: "4px solid #ff9040", borderRadius: "0.75rem", padding: "1.5rem" }}>
                <h3 style={{ color: "#ffb060", fontFamily: MONO, fontSize: "0.85rem", margin: "0 0 1.2rem", letterSpacing: 2 }}>SOMATOSENSORY PATH · 0 → 500 ms</h3>
                {([
                  [1,"Mechanoreceptor Activation","0 ms","Four types: Meissner corpuscles (light touch, 1–40 Hz, in ridged skin), Pacinian corpuscles (vibration, 40–500 Hz, deep tissue), Ruffini endings (skin stretch), Merkel discs (sustained pressure, texture). All transduce deformation into generator potential via mechanosensitive ion channels (Piezo1/2)."],
                  [2,"Generator Potential → Action Potential","1–2 ms","Generator potential graded by stimulus intensity → triggers AP at axon hillock when > −55 mV threshold. Aβ fibres (myelinated, 30–70 m/s): touch, pressure, vibration. Aδ (myelinated, 5–30 m/s): first pain, cold. C fibres (unmyelinated, 0.5–2 m/s): slow burning pain, warmth."],
                  [3,"Spinal Cord Entry","5–20 ms","Dorsal horn laminae I–V. Fast Aβ touch → lamina III/IV. Aδ pain → lamina I/V. C fibre → lamina I/II. Gate Control Theory (Melzack & Wall 1965): Aβ fibres activate inhibitory interneurons in lamina II (substantia gelatinosa) that gate C-fibre pain signals. This is how rubbing reduces pain."],
                  [4,"Ascending Pathways","10–30 ms","Medial lemniscal (touch/proprioception): cross at medulla → VPL thalamus. Spinothalamic (pain/temp): cross in spinal cord → VPL/VPM thalamus. Spinocerebellar: proprioception → cerebellum (no consciousness)."],
                  [5,"Thalamus (VPL)","30–40 ms","Ventroposterolateral nucleus: full somatotopic map. Body parts neighbour each other in precise topographic order. Relay with minimal processing — gate and gain control. Intralaminar nuclei: arousal and attention modulation of somatosensory signals."],
                  [6,"S1 Primary Somatosensory","40–60 ms","Brodmann areas 3a (muscle spindle), 3b (skin), 1 (skin texture), 2 (size/shape). Homunculus: lips and hands over-represented (10× more cortex than trunk). Cortical magnification factor: 1 cm² of fingertip = 1.5 cm² of S1."],
                  [7,"S2 / Insula","60–100 ms","S2: bilateral representation, tactile learning, object recognition by feel. Insula: interoception, pain affect, body ownership, temperature. Anterior insula: pain unpleasantness (emotional component), empathy for others' pain."],
                  [8,"Parietal / Frontal","100–250 ms","Posterior parietal: multisensory integration, body schema, peripersonal space. PMC: movement planning guided by touch. Long-loop reflexes (150–200 ms) for complex corrections vs spinal reflex (20 ms)."],
                ] as [number,string,string,string][]).map(([n,reg,t,d]) => <PathStep key={n} n={n} region={reg} time={t} detail={d} col="#ff9040" />)}
              </div>

              {/* SMELL */}
              <div style={{ background: BG1, border: `1px solid ${BRD}`, borderLeft: "4px solid #f040f0", borderRadius: "0.75rem", padding: "1.5rem" }}>
                <h3 style={{ color: "#f880f8", fontFamily: MONO, fontSize: "0.85rem", margin: "0 0 1.2rem", letterSpacing: 2 }}>OLFACTORY PATH · 0 → 300 ms  (NO THALAMUS!)</h3>
                {([
                  [1,"Olfactory Receptor Neurons","0 ms","12 million ORNs in olfactory epithelium (superior nasal cavity). 400 functional olfactory receptor (OR) genes in humans (vs 1000 in mice). Each ORN expresses ONE type of OR. Response: odorant binds → Golf (G-protein) → cAMP ↑ → CNG channels open → depolarisation."],
                  [2,"Olfactory Nerve (CN I)","1–3 ms","Shortest cranial nerve. Unmyelinated axons (50–100 μm thin bundles) pass through cribriform plate of ethmoid bone → olfactory bulb. No thalamic relay — direct cortical access. This is evolutionarily ancient — olfaction is the oldest sense."],
                  [3,"Olfactory Bulb Glomeruli","3–8 ms","~2000 glomeruli. ORNs expressing the same receptor type converge onto the SAME glomerulus (from both sides of the nose). Mitral cells (output) + tufted cells. Lateral inhibition from periglomerular and granule cells sharpens odour discrimination. Pattern-across-glomeruli encodes odour identity."],
                  [4,"Piriform Cortex","8–20 ms","PRIMARY olfactory cortex — no thalamus interposed. Receives direct olfactory bulb output. Distributed population code: each odour → unique pattern across piriform neurons. Size: ~6 cm² in humans. Connected to: amygdala (fear/pleasure), hippocampus (spatial memory), orbitofrontal cortex (conscious identification)."],
                  [5,"Amygdala + Hippocampus","15–40 ms","Amygdala: emotional valence — good/bad/danger. Direct piriform→amygdala connection = fast unconscious olfactory threat response. Hippocampus: episodic olfactory memory — smell as context for 'where I was'. The Proustian memory effect: smell → vivid autobiographical recall because of direct piriform→hippocampus connection."],
                  [6,"Orbitofrontal Cortex","40–100 ms","Conscious odour identification and naming. Flavour integration: smell + taste → unified flavour percept. OFC also receives taste, visual, and somatosensory input — multisensory flavour synthesis here. Reward value of food. OFC lesion → anosmia with intact olfactory bulb (cortical anosmia)."],
                  [7,"Thalamic Route (secondary)","80–150 ms","Dorsomedial thalamus receives OFC output → prefrontal cortex. This indirect route is the olfactory equivalent of the primary sensory thalamic relay — but it comes AFTER cortical processing, not before. Smell is first cortical, then thalamic. Every other sense is the opposite."],
                ] as [number,string,string,string][]).map(([n,reg,t,d]) => <PathStep key={n} n={n} region={reg} time={t} detail={d} col="#f040f0" />)}
              </div>
            </div>
          </div>
        )}

        {/* ══ TAB 6: Mechanical Analysis ════════════════════════════════════ */}
        {active === "mechanics" && (
          <div>
            <h2 style={{ fontSize: "1.4rem", fontWeight: 700, color: PUR2, margin: "0 0 0.4rem" }}>Mechanical Analysis · Action Potential Physics · Synaptic Mechanics · Conduction · Oscillations</h2>
            <p style={{ color: DIM, margin: "0 0 1.5rem", fontSize: "0.95rem" }}>The precise physical machinery beneath every thought, percept, and movement. All values are biologically measured.</p>

            {/* Action Potential */}
            <div style={{ background: BG2, border: `1px solid ${BRD2}`, borderRadius: "0.75rem", padding: "1.5rem", marginBottom: "1.5rem" }}>
              <h3 style={{ color: PUR2, fontSize: "1.05rem", fontWeight: 700, margin: "0 0 1rem" }}>⚡ Action Potential · Phase-by-Phase Mechanics</h3>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(200px,1fr))", gap: 10, marginBottom: 14 }}>
                {[
                  ["Resting",      "−70 mV", "Na⁺/K⁺ ATPase: 3Na⁺ out / 2K⁺ in per ATP. K⁺ leak channels set resting potential. [Na⁺]out=145mM, [Na⁺]in=12mM. [K⁺]out=4mM, [K⁺]in=140mM.", "#5060a0"],
                  ["Threshold",    "−55 mV", "15 mV depolarisation required. Voltage-gated Na⁺ channels begin opening. Positive feedback: depolarisation → more Na⁺ channels open → more depolarisation (Hodgkin cycle).", "#8060c0"],
                  ["Rising Phase", "−55→+35 mV", "10,000 Na⁺ channels open simultaneously. Na⁺ rushes in (driving force: 105 mV). Duration ~0.5 ms. Peak +35 mV (Nernst equilibrium for Na⁺ = +61 mV — never reached as K⁺ also opens).", "#c060d0"],
                  ["Repolarisation","0→−70 mV", "Voltage-gated Na⁺ channels inactivate (h-gate closes). Voltage-gated K⁺ channels open (slower, 0.5–1 ms lag). K⁺ rushes out. Repolarises membrane in 1–2 ms.", "#8080e0"],
                  ["Undershoot",   "−80 mV", "Hyperpolarisation: K⁺ channels slow to close → briefly more negative than rest. Absolute refractory: Na⁺ channels inactivated — no AP possible regardless of stimulus (2 ms).", "#60a0d0"],
                  ["Refractory",   "−70→−70 mV", "Relative refractory: Na⁺ channels recovering, threshold elevated — needs larger stimulus. Duration: 5–10 ms → limits firing rate to ~200 Hz. (Some interneurons reach 1000 Hz).", "#40c0c0"],
                ].map(([phase, mv, desc, col]) => (
                  <div key={phase as string} style={{ background: "#060c1c", border: `1px solid ${(col as string)}40`, borderRadius: "0.5rem", padding: "0.85rem" }}>
                    <div style={{ fontFamily: MONO, fontSize: 10, color: col as string, marginBottom: 4 }}>{phase}</div>
                    <div style={{ fontFamily: MONO, fontSize: 14, color: col as string, fontWeight: 700, marginBottom: 6 }}>{mv}</div>
                    <div style={{ fontFamily: BODY_F, fontSize: 12.5, color: DIM, lineHeight: 1.55 }}>{desc}</div>
                  </div>
                ))}
              </div>
              <EQ>{`Hodgkin-Huxley equations (Nobel Prize 1963):

  C_m · dV/dt = I_ext − g_Na·m³·h·(V − E_Na) − g_K·n⁴·(V − E_K) − g_L·(V − E_L)

  C_m  = 1 μF/cm²           (membrane capacitance)
  g_Na = 120 mS/cm²          (max Na⁺ conductance)
  g_K  = 36 mS/cm²           (max K⁺ conductance)
  g_L  = 0.3 mS/cm²          (leak conductance)
  E_Na = +55 mV  (Na⁺ Nernst potential)
  E_K  = −77 mV  (K⁺ Nernst potential)
  E_L  = −54 mV  (leak reversal)

  m, h, n = gating variables (0–1), each obey:
  dz/dt = α_z(V)·(1−z) − β_z(V)·z
  where α, β are voltage-dependent rate constants from Hodgkin & Huxley's squid data

  Nernst equation for any ion X:
  E_X = (RT/zF) · ln([X]_out / [X]_in)
  At 37°C: E_X = (26.7 mV / z) · ln([X]_out / [X]_in)`}</EQ>
            </div>

            {/* Conduction Velocity */}
            <div style={{ marginBottom: "1.5rem" }}>
              <h3 style={{ color: PUR2, fontSize: "1.05rem", fontWeight: 700, margin: "0 0 1rem" }}>🏎️ Conduction Velocity by Fibre Type</h3>
              <div style={{ overflowX: "auto" }}>
                <table style={{ width: "100%", borderCollapse: "collapse", fontFamily: BODY_F, fontSize: 13 }}>
                  <thead>
                    <tr style={{ background: "#0a0f20" }}>
                      {["Type","Diameter μm","Myelin","Velocity m/s","Latency arm→brain","Function"].map(h => (
                        <th key={h} style={{ fontFamily: MONO, fontSize: 9, color: DIM2, textAlign: "left", padding: "8px 10px", borderBottom: `1px solid ${BRD}`, letterSpacing: 1 }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {[
                      ["Aα","13–20","✓ Heavy","70–120","~8 ms","Proprioception (spindles, Golgi), Somatic motor (α-motoneuron)"],
                      ["Aβ","6–12","✓ Heavy","30–70","~15 ms","Touch, pressure, vibration — Meissner, Pacinian, Merkel"],
                      ["Aγ","4–8","✓ Light","15–30","~35 ms","Fusimotor — innervates muscle spindle intrafusal fibres"],
                      ["Aδ","1–5","✓ Light","5–30","~80 ms","First pain, cold, proprioception from joints (fast pain lancinating)"],
                      ["B","<3","✓ Light","3–15","~120 ms","Preganglionic autonomic fibres"],
                      ["C","0.2–1.5","✗ None","0.5–2","~600 ms","Slow pain, warmth, postganglionic autonomic, itch"],
                    ].map((row, ri) => (
                      <tr key={ri} style={{ background: ri % 2 === 0 ? BG1 : "transparent", borderBottom: `1px solid ${BRD}30` }}>
                        {row.map((cell, ci) => (
                          <td key={ci} style={{ padding: "7px 10px", color: ci === 0 ? "#80a0d0" : ci === 3 ? PUR3 : DIM, fontFamily: ci < 2 || ci === 3 ? MONO : undefined, fontSize: ci < 2 || ci === 3 ? 11 : 13 }}>{cell}</td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <EQ>{`Conduction velocity formulas:

  Unmyelinated (C fibres):
    v = √(a·g_m / (2·r_i·c_m))    ∝ √d   (square-root of diameter)
    Squid giant axon: d=500μm → v=25 m/s. Human C fibre: d=0.5μm → v≈0.8 m/s
    
  Myelinated (saltatory conduction, Ranvier nodes):
    v ≈ k·d    where k ≈ 6 m/s per μm diameter
    Saltatory: action potential jumps node-to-node (~1 mm apart)
    Internode: myelin increases resistance, reduces capacitance → current flows passively
    Myelination makes fibres 10–50× faster at 1/3 the energy cost
    
  Why your hand knows before your spinal reflex tells your brain:
    Spinal reflex arc (e.g., knee jerk):
      Stimulus → Aα afferent (70 m/s) → spinal cord → Aα efferent → muscle
      Latency: ~20 ms   (monosynaptic)
      
    Voluntary response (same stimulus):
      → up to brain → cortex decision → back down → muscle
      Latency: 150–300 ms (7.5–15× slower)
      
    The body uses local (spinal) computation for speed
    and central (cortical) computation for complexity.`}</EQ>
            </div>

            {/* Synaptic transmission */}
            <div style={{ background: BG1, border: `1px solid ${BRD}`, borderRadius: "0.75rem", padding: "1.5rem", marginBottom: "1.5rem" }}>
              <h3 style={{ color: PUR2, fontSize: "1.05rem", fontWeight: 700, margin: "0 0 1rem" }}>🔗 Synaptic Transmission Mechanics · 0.5–2 ms Total Synaptic Delay</h3>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(220px,1fr))", gap: 10 }}>
                {[
                  ["Ca²⁺ Influx","AP arrives at bouton → voltage-gated Ca²⁺ channels (Cav2.1/2.2) open → [Ca²⁺] rises from 100 nM to 10–100 μM locally. Latency: 0.1–0.2 ms. Ca²⁺ sensor: Synaptotagmin 1/2 (five C2 domains)."],
                  ["Vesicle Fusion","Ca²⁺–Synaptotagmin binding triggers SNARE complex zippering: VAMP (vesicle) + Syntaxin + SNAP-25 (membrane). Fusion pore opens in <0.2 ms. ~3,000–5,000 glutamate molecules released per vesicle. ~200 nm vesicle diameter."],
                  ["Diffusion Across Cleft","Cleft width: 20–40 nm. Diffusion time: ~0.02 ms. Glutamate concentration at peak: ~1 mM in cleft. Spillover to extrasynaptic receptors: 10–100 μs delayed, activates mGluR/NMDA."],
                  ["Receptor Binding → EPSP","AMPA receptors: fast (ms), Na⁺/K⁺, depolarise postsynaptic. NMDA: slow (tens ms), requires coincident pre+post activity (Mg²⁺ block), Ca²⁺ permeable — implements Hebbian learning. EPSP rises 1–5 ms, decays 10–50 ms."],
                  ["Reuptake & Recycling","Glutamate transporters (EAAT1–5) on astrocytes remove glutamate in 1–10 ms. Astrocyte converts glutamate → glutamine → returned to neuron. Vesicle recycling: kiss-and-run (fast, <100 ms) or full collapse + clathrin endocytosis (slow, ~30 s)."],
                  ["Long-Term Potentiation","NMDA Ca²⁺ influx activates CaMKII → phosphorylates AMPA → increases conductance. New AMPA receptors trafficked to synapse. Structural: spine enlargement, new spine growth. AMPA phosphorylation: minutes. Spine growth: hours. Protein synthesis (late LTP): days."],
                ].map(([title, desc]) => (
                  <div key={title as string} style={{ background: "#060c1c", borderRadius: "0.5rem", padding: "0.85rem" }}>
                    <div style={{ fontFamily: MONO, fontSize: 10, color: PUR3, marginBottom: 5 }}>{title}</div>
                    <div style={{ fontFamily: BODY_F, fontSize: 12.5, color: DIM, lineHeight: 1.55 }}>{desc}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Neural oscillations */}
            <div style={{ background: BG2, border: `1px solid ${BRD2}`, borderRadius: "0.75rem", padding: "1.5rem" }}>
              <h3 style={{ color: PUR2, fontSize: "1.05rem", fontWeight: 700, margin: "0 0 1rem" }}>〰️ Neural Oscillations · Coherence Mechanics</h3>
              <EQ>{`Neural oscillation physics:

  EEG signal: V_eeg(t) = Σᵢ Σⱼ k_ij · I_j(t) * G_ij(t − t')
  (summation of ~10,000 synchronised neurons under each electrode — dipole cancellation means
  only synchronised columns contribute to scalp signal)
  
  Oscillation generation mechanisms:
  
  1. Thalamo-cortical loops (alpha / sleep spindles):
     Thalamic relay neurons ↔ Reticular nucleus (inhibitory) ↔ Cortex
     Reticular nucleus fires → inhibits relay → rebound burst at ~10 Hz → alpha
     
  2. Cortical interneuron networks (gamma):
     Fast-spiking parvalbumin interneurons (PV⁺) form GABA synapses onto pyramidal neurons
     Pyramidal → PV⁺ → (delayed) inhibition of pyramidal → rebound at 30–80 Hz
     PING (Pyramidal-Interneuron Network Gamma) mechanism
     
  3. Hippocampal theta (4–8 Hz):
     Medial septum pacemaker neurons → cholinergic + GABAergic fibres → hippocampus
     Phase modulates spike timing → theta-phase coded information
     
  Cross-frequency coupling:
    Gamma amplitude is modulated by theta phase (theta-gamma coupling):
    A_gamma(t) = f(φ_theta(t))  — gamma bursts occur preferentially at theta peak
    Modulation Index (MI) = ‖ Σⱼ A_gamma(tⱼ)·e^(i·φ_theta(tⱼ)) ‖ / N
    
    High MI = working memory encoding active (hippocampus / PFC)
    MI correlates with digit-span capacity (r = 0.6, p < 0.001, Lisman & Jensen 2013)
    
  Phase-Locking Value (PLV) — coherence between brain areas:
    PLV(f) = | (1/N) Σₜ e^(i·(φ₁(f,t) − φ₂(f,t))) |
    φ₁, φ₂ = instantaneous phases of signals from area 1 and area 2
    PLV = 1 → perfect phase synchrony (coherent computation)
    PLV = 0 → random phase relationship (no functional coupling)
    
    Frontoparietal gamma PLV > 0.3 predicts correct working memory retrieval
    Visual-motor coherence peaks at beta (20 Hz) during movement preparation
    Hippocampal-PFC theta coherence peaks during spatial navigation`}</EQ>
            </div>
          </div>
        )}

        {/* ══ TAB 7: Synthesis & Coherence ══════════════════════════════════ */}
        {active === "synthesis" && (
          <div>
            <h2 style={{ fontSize: "1.4rem", fontWeight: 700, color: PUR2, margin: "0 0 0.4rem" }}>Synthesis & Coherence · The Binding Problem · Predictive Coding · AETHER C(x,t)</h2>
            <p style={{ color: DIM, margin: "0 0 1.5rem", fontSize: "0.95rem" }}>How four separate sensory streams — processed in anatomically distinct cortices — become one unified, coherent, stable experience. This is the deepest question in neuroscience.</p>

            {/* Binding problem */}
            <div style={{ background: BG2, border: `1px solid ${BRD2}`, borderRadius: "0.75rem", padding: "1.5rem", marginBottom: "1.5rem" }}>
              <h3 style={{ color: PUR2, fontSize: "1.05rem", fontWeight: 700, margin: "0 0 0.75rem" }}>🔗 The Binding Problem</h3>
              <p style={{ color: DIM, fontSize: "0.9rem", lineHeight: 1.7, marginBottom: "1rem" }}>
                A red ball bouncing in front of you activates: V4 (colour → red), V5/MT (motion → bouncing), IT (form → round), A1 (sound → thud), S1 (touch → impact). Each is processed in a different cortical region, at slightly different times (20–150 ms range). Yet you experience one unified object — "that red bouncing ball." How?
              </p>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(220px,1fr))", gap: 10, marginBottom: 16 }}>
                {[
                  ["Hypothesis 1: Convergence","One 'grandmother cell' receives all inputs and represents the whole object. Refuted: lesion studies show no single binding neuron. The brain is too distributed for a single convergence point.",false],
                  ["Hypothesis 2: Assembly Coding","The object is represented by a distributed ensemble. No single cell codes it — the pattern across thousands of cells does. Supported but incomplete: doesn't explain how ensembles are selected.",true],
                  ["Hypothesis 3: Temporal Binding (Gamma)","Features of the same object are represented by neurons firing coherently at gamma (30–80 Hz). Different objects fire out of phase. Evidence: V1 neurons coding same object synchronise their gamma oscillations. Disruption of gamma disrupts object perception.",true],
                  ["Hypothesis 4: Predictive Coding","The brain builds a generative model of the world. Perception = model update from prediction error. Binding happens because the model already represents objects as unified — bottom-up signals just update which object is present.",true],
                ].map(([title, desc, supported]) => (
                  <div key={title as string} style={{ background: "#060c1c", border: `1px solid ${(supported ? "#40a060" : "#a04040")}30`, borderRadius: "0.5rem", padding: "0.85rem" }}>
                    <div style={{ fontFamily: MONO, fontSize: 9, color: supported ? "#40c080" : "#c04040", marginBottom: 4 }}>{supported ? "✓ SUPPORTED" : "✗ REFUTED"}</div>
                    <div style={{ fontFamily: MONO, fontSize: 10, color: PUR3, marginBottom: 5 }}>{title}</div>
                    <div style={{ fontFamily: BODY_F, fontSize: 12.5, color: DIM, lineHeight: 1.55 }}>{desc}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Predictive coding */}
            <div style={{ background: BG1, border: `1px solid ${BRD}`, borderRadius: "0.75rem", padding: "1.5rem", marginBottom: "1.5rem" }}>
              <h3 style={{ color: PUR2, fontSize: "1.05rem", fontWeight: 700, margin: "0 0 1rem" }}>🔮 Predictive Coding Architecture (Friston, 2010)</h3>
              <EQ>{`The brain as a Bayesian inference machine:

  At every level of the cortical hierarchy, TWO signals flow:
  
  Prediction (feedback, top-down):    Level N+1 → Level N
    "This is what I expect to see"
    Carried by: deep pyramidal cells → feedback connections → superficial layers below
    
  Prediction Error (feedforward, bottom-up):   Level N → Level N+1
    "This is the difference between what I expected and what I got"
    Carried by: superficial pyramidal cells → feedforward connections → deep layers above
    
  Update rule (Bayesian):
    posterior ∝ likelihood × prior
    P(cause | sensation) ∝ P(sensation | cause) × P(cause)
    
  In neural terms (free energy minimisation, Friston):
    F = E_q[ln q(z) − ln p(z,x)]   [variational free energy]
    where q(z) = approximate posterior (brain's model)
          p(z,x) = true generative model (world + sensory mapping)
    
    Brain minimises F by:
    (a) Perceptual inference: update q(z) to match p(z|x)  [prediction error → update model]
    (b) Active inference: change x (act on world) to make p(x|z) closer to q(z)  [move so predictions come true]
    
  BINDING in predictive coding:
    The generative model represents objects as unified causes.
    When you see a "red bouncing ball", the binding happens in the model:
    the brain predicts a single cause (ball) that explains colour + motion + sound simultaneously.
    Prediction error signals are only sent for the residual — not for the parts that match the model.
    The experience of unity comes from the unity of the model's cause, not from neural convergence.
    
  Hierarchical timescales (Hasson, 2008):
    Each cortical area integrates information over a characteristic window:
    Primary sensory (V1/A1/S1): ~100 ms
    Secondary (V2/A2/S2):       ~200–500 ms
    Association (STS/PPC):       ~1–3 s
    Frontal (PFC/IFG):           ~4–12 s
    DMN (PCC/mPFC):              ~20–60 s
    
    "Temporal receptive windows" define the hierarchy.
    Top-level PFC integrates across ~10 seconds → working memory.
    This is why context (10 s) changes meaning of a word heard 5 seconds ago.`}</EQ>
            </div>

            {/* Gamma coherence binding */}
            <div style={{ background: BG2, border: `1px solid ${BRD2}`, borderRadius: "0.75rem", padding: "1.5rem", marginBottom: "1.5rem" }}>
              <h3 style={{ color: PUR2, fontSize: "1.05rem", fontWeight: 700, margin: "0 0 1rem" }}>⚡ Gamma Coherence Binding · 40 Hz Consciousness Machine</h3>
              <EQ>{`Gamma oscillation synthesis mechanics:

  The gamma (30–80 Hz, peak ~40 Hz) oscillation is the signature of active cortical processing.
  It appears when:
  - A stimulus enters awareness (visual: 60–80 ms post-stimulus onset for gamma emergence)
  - Attention is directed to a location
  - Working memory is actively maintained
  - Two brain areas communicate (coherence = transmission channel)
  
  PING (Pyramidal-Interneuron Network Gamma) mechanism:
    1. Excitatory drive → pyramidal neurons fire
    2. Pyramidal → fast-spiking PV⁺ interneuron (basket cells, chandelier cells)
    3. PV⁺ → GABA inhibition onto pyramidal → pyramidal silent (10 ms)
    4. Inhibition wears off → pyramidal rebound → next gamma cycle
    Period: 1/40 Hz = 25 ms cycle
    
  Binding by synchrony (Wolf Singer, 1989):
    V1 neuron A: codes RED at position (x,y)
    V5 neuron B: codes LEFTWARD MOTION at position (x,y)
    When they belong to the SAME OBJECT: A and B fire synchronously at 40 Hz (phase < 10 ms)
    When they belong to DIFFERENT OBJECTS: A and B fire asynchronously (phase random)
    
    Evidence:
    - Cat visual cortex: same-object neurons synchronise at gamma (Singer et al.)
    - Binocular rivalry: the "winning" percept = synchronised gamma activity
    - Gamma coherence between V1 and IT predicts correct object recognition
    - Disrupting gamma (thalamic lesions) → binding deficits without feature-detection loss
    
  Gamma and consciousness:
    Anesthesia: global decrease in long-range gamma coherence
    Deep sleep: local gamma preserved; global gamma coherence collapses
    Psychedelics (psilocybin, DMT): broadband power increase; gamma coherence decreases then re-emerges reorganised
    Meditation: increase in frontal gamma amplitude and gamma PLV between prefrontal and posterior areas
    
  Gamma coherence between hippocampus and neocortex:
    During MEMORY ENCODING: hippocampal gamma → drives phase reset in neocortex
    The neocortex "listens" to hippocampus during gamma windows to consolidate episodic memory
    Memory retrieval: reverse direction — neocortical gamma → hippocampal recall
    
  The 40 Hz / 25 ms window:
    This is the integration window for conscious synthesis.
    All features of the same conscious object must be processed within ONE gamma cycle (25 ms)
    for binding to occur. Features processed across multiple cycles → separate objects.
    This explains the temporal resolution of consciousness (~25–50 ms threshold between
    distinct vs. fused percepts).`}</EQ>
            </div>

            {/* Integration timeline */}
            <div style={{ background: BG1, border: `1px solid ${BRD}`, borderRadius: "0.75rem", padding: "1.5rem", marginBottom: "1.5rem" }}>
              <h3 style={{ color: PUR2, fontSize: "1.05rem", fontWeight: 700, margin: "0 0 1rem" }}>📍 Complete Synthesis Timeline · 0 → 600 ms</h3>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(240px,1fr))", gap: 8 }}>
                {[
                  ["0–5 ms",     "Receptors fire","All modalities transduce. Fastest Aα fibre already reaching cord.","#80a0ff"],
                  ["5–30 ms",    "First relay stations","Thalamic relay for most senses. Olfactory cortex already processing (no thalamic delay). Cochlear nucleus, LGN, VPL all active.","#a060e0"],
                  ["30–60 ms",   "Primary cortices","V1, A1, S1 all receiving first input. Early sensory ERP components (C1, N1). Features extracted: edges, frequencies, textures. Still pre-conscious.","#c040d0"],
                  ["60–120 ms",  "Secondary cortices","V2/V3/V4/V5, A2, S2. Object features assembled. Early mismatch detection (MMN ~100 ms). Emotional valence in amygdala.","#d040a0"],
                  ["120–200 ms", "Association cortex","STS (multisensory), IPL (spatial integration), temporal lobe (object identification). ERPs: N170 (faces), N200 (mismatch). Still mostly non-conscious.","#e04080"],
                  ["200–300 ms", "Prefrontal engagement","Working memory buffers activate. Top-down attention amplifies relevant signals 2–5×. Gamma coherence builds between frontoparietal areas.","#f06040"],
                  ["300–500 ms", "P300 — Conscious Access","P300 ERP = threshold of conscious reportability. Ignition: frontal and parietal areas simultaneously recruit into global workspace. Experience becomes unified.","#ff4060"],
                  ["400–500 ms", "Gamma Lock & Binding","40 Hz gamma coherence across visual, auditory, and somatosensory cortices phase-locks (PLV > 0.4). The unified percept is 'bound' — one red bouncing ball, not three separate features.","#ff6040"],
                  ["500–600 ms", "Motor & Memory Encoding","Decision — primary motor cortex (M1) Bereitschaftspotential (readiness potential). Hippocampus begins episodic encoding (theta-gamma coupling). Experience exits working memory into long-term storage.","#40e080"],
                ].map(([time, title, desc, col]) => (
                  <div key={title as string} style={{ background: "#060c1c", border: `1px solid ${(col as string)}25`, borderRadius: "0.5rem", padding: "0.85rem" }}>
                    <div style={{ display: "flex", gap: 8, marginBottom: 4, alignItems: "baseline", flexWrap: "wrap" }}>
                      <span style={{ fontFamily: MONO, fontSize: 10, color: col as string }}>{time}</span>
                      <span style={{ fontFamily: MONO, fontSize: 10, color: `${col as string}90` }}>{title}</span>
                    </div>
                    <div style={{ fontFamily: BODY_F, fontSize: 12.5, color: DIM, lineHeight: 1.55 }}>{desc}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* AETHER synthesis */}
            <div style={{ background: BG2, border: `1px solid ${BRD2}`, borderRadius: "0.75rem", padding: "1.5rem" }}>
              <h3 style={{ color: PUR2, fontSize: "1.05rem", fontWeight: 700, margin: "0 0 1rem" }}>🌀 AETHER C(x,t) as Neural Coherence Field</h3>
              <EQ>{`AETHER coherence applied to neural synthesis:

  Standard AETHER coherence field:
    C(x,t) = C₀ + ∫ κ(x,x′)·ρ(x′,t) d³x′

  Neural interpretation:
    C(x,t) = neural coherence at cortical location x at time t
    κ(x,x′) = long-range coupling kernel (falls off with distance; enhanced by myelination)
    ρ(x′,t) = local neural activity density (firing rate × synchrony)
    
  Phase-Locking Value as AETHER coherence:
    C_neural(area_i, area_j, f) = PLV(i,j,f) = |(1/T)∫ e^(i·(φᵢ(t)−φⱼ(t))) dt|
    
    PLV → 1: C(x,t) → 1  (coherent computation between areas)
    PLV → 0: C(x,t) → 0  (independent computation, no binding)
    
  AETHER threshold for conscious synthesis:
    Based on empirical EEG studies (Dehaene, 2014):
    CONSCIOUS ACCESS requires PLV_frontoparietal(gamma) > 0.35
    This maps to C(x,t) > 0.65 in the AETHER burst threshold language
    
    Same threshold appears across contexts:
    - LPE (Loop Persistence Energy) > 0.65 → burst in BaTiO₃ system
    - C(x,t) > 0.65 → coherence maintenance in CUCA substrate
    - PLV > 0.35 (≈ coherence 0.65 when normalized) → conscious gamma binding
    → The threshold is not arbitrary — it reflects the phase-locking required for
      stable information transmission in any physically coherent system
      
  The binding as C-field synthesis:
    At t = 400 ms, during gamma-lock phase:
    C(V4, V5, 40Hz) > 0.65  → colour and motion bound
    C(V5, A1, 40Hz) > 0.65  → motion and sound bound
    C(IT, PFC, 40Hz) > 0.65 → object identity and working memory bound
    
    When ALL three conditions are simultaneously met:
    The global workspace "ignites" — C(cortex_global, t=400ms) → peak
    This is the physical basis of the unified conscious experience.
    
  AETHER application:
    The CUCA stack's BaTiO₃ phase conjugate mirror (L6) serves the same role
    as PV⁺ interneurons in PING: it provides the timed reflective inhibition
    that resets the phase of the coherence oscillation, enabling the next
    integration cycle. The 40 Hz rate is not arbitrary — it is determined
    by the ~25 ms propagation time through the CUCA stack, just as cortical
    gamma is set by the ~10 ms axonal propagation + 5 ms synaptic delay
    in cortico-interneuron loops.
    
  Full formula for neural C(x,t):
    C_conscious(t) = ∏_{modalities m} [PLV_m(t) / PLV_threshold]  ≥ 1
    
    Interpretation: conscious experience of multiple modalities bound together
    requires ALL pairwise PLVs to simultaneously exceed the coherence threshold.
    If any one modality falls below → fragmentation of the unified percept.
    (This explains why inattentional blindness causes real objects to be
    invisible — they are processed but fail to reach the PLV binding threshold
    because attentional resource allocation is elsewhere.)`}</EQ>

              <div style={{ background: "#060c1c", border: `1px solid ${BRD2}40`, borderRadius: "0.5rem", padding: "1rem", marginTop: 14, textAlign: "center" }}>
                <div style={{ color: PUR2, fontWeight: 700, fontSize: "0.9rem", marginBottom: 6, fontFamily: MONO }}>
                  CONSCIOUSNESS = C(x,t) THRESHOLD CROSSING
                </div>
                <div style={{ color: DIM, fontSize: "0.82rem", lineHeight: 1.7 }}>
                  Receptor → 5 ms → First relay → 30 ms → Primary cortex → 120 ms → Association → 200 ms → Prefrontal → 300 ms → P300 threshold → 400 ms → Gamma lock (C &gt; 0.65) → 500 ms → Unified experience
                </div>
                <div style={{ color: DIM2, fontSize: "0.75rem", marginTop: 8, fontFamily: MONO }}>
                  300 ms of non-conscious processing precedes every moment of awareness · You are always in the past
                </div>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
