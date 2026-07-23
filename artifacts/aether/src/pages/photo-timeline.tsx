import { useState, useRef, useEffect } from "react";

const imgFoundation = "/api/storage/public-objects/05F69282-BF36-4812-AF0F-FBAB52F12E79_1775556055904.jpeg";
const imgCoherence = "/api/storage/public-objects/1767110444938_1777481208115.jpeg";
const imgLattice = "/api/storage/public-objects/1767877706621_1776476947273.jpeg";
const imgOrganoid = "/api/storage/public-objects/1768187060155_1776476195607.jpeg";
const imgBAVS = "/api/storage/public-objects/1771048128470_1776472092826.jpeg";
const imgCaCO3 = "/api/storage/public-objects/1771091077676_1776472098040.jpeg";
const imgPhaseMap = "/api/storage/public-objects/1771631084537_1776471889837.jpeg";
const imgBridge = "/api/storage/public-objects/1771897171039_1776471894012.jpeg";
const imgPlasma = "/api/storage/public-objects/1773507882313_1776444095094.jpeg";
const imgKnot = "/api/storage/public-objects/1773507882402_1776444091428.jpeg";
const imgGeo = "/api/storage/public-objects/1773804564758_1776443821427.jpeg";
const imgCore = "/api/storage/public-objects/1774305389240_1776443829956.jpeg";
const imgLight = "/api/storage/public-objects/1774305390705_1776443829957.jpeg";
const imgMolecular = "/api/storage/public-objects/1774305391649_1776443829956.jpeg";
const imgAlignment = "/api/storage/public-objects/1776435373437_1776440919786.jpeg";
const imgCosmicLock = "/api/storage/public-objects/1776435373457_1776440915948.jpeg";
const imgBinaryMap = "/api/storage/public-objects/bianary_map_1776475138397.jpeg";
const imgDuaMind = "/api/storage/public-objects/duamind_1776472102804.jpeg";
const imgField = "/api/storage/public-objects/field_reception_shia_miller-01.jpg";
const imgFusion = "/api/storage/public-objects/HHvH_fdWwAYSagD_(1)_1778197246440.jpg";
// ── Photo entries — real attached_assets images with derived dates ─────────────
const PHOTOS = [
  { src: imgFoundation,  ts: 1775556055904, label: "Foundation Signal",     caption: "Early substrate field — the baseline scan before the AETHER crystallization model was formalised." },
  { src: imgCoherence,   ts: 1767110444938, label: "Coherence Seed",        caption: "First recorded coherence event. Phase-lock detected across three lattice nodes simultaneously." },
  { src: imgLattice,     ts: 1767877706621, label: "Lattice Emergence",     caption: "The discrete CGLE lattice self-organising from random initial conditions — ordered stripes appearing from noise." },
  { src: imgOrganoid,    ts: 1768187060155, label: "Neural Organoid Mk.I",  caption: "First cerebral organoid image used in AETHER neural substrate research. 45-day growth from iPSC source." },
  { src: imgBAVS,        ts: 1771048128470, label: "BAVS System v1",        caption: "Bio-Adaptive Vortex System first prototype. Five-spiral-arm configuration creating counter-rotating vortices." },
  { src: imgCaCO3,       ts: 1771091077676, label: "CaCO₃ Precipitation",   caption: "Violet-light accelerated calcium carbonate crystallisation — 88.7 mg/L at 180 minutes under 405 nm illumination." },
  { src: imgPhaseMap,    ts: 1771631084537, label: "Phase Map Alpha",       caption: "First full-body phase coherence map. The three-domain lattice (Immune · Fluid · Neural) rendered as colour fields." },
  { src: imgBridge,      ts: 1771897171039, label: "Substrate Bridge",      caption: "The morphic bridge moment — discrete CGLE lattice points dissolving into molecular geometry under the gold sweep line." },
  { src: imgPlasma,      ts: 1773507882313, label: "Plasma Ratio Study",    caption: "Plasma gas composition experiment — helium/argon/hydrogen blend optimised for EUROFER97 fusion blanket coating." },
  { src: imgKnot,        ts: 1773507882402, label: "Quantum Knotting",      caption: "Trefoil knot topology observed in the phase field — a topological invariant encoding substrate memory." },
  { src: imgGeo,         ts: 1773804564758, label: "Geological Accelerator",caption: "Five-stage geological formation simulation: Layer → Pulse → Cool → Warm → Dark. Hours instead of millennia." },
  { src: imgCore,        ts: 1774305389240, label: "AETHER Core v2",        caption: "Core engine upgrade — dual-stream coherence pipeline with integrated Mnêsis↔Infernia handoff timing." },
  { src: imgLight,       ts: 1774305390705, label: "Light as Sculptor",     caption: "The central hypothesis confirmed: photonic spatial intention can structure matter at the nanoscale." },
  { src: imgMolecular,   ts: 1774305391649, label: "Molecular Geometry",    caption: "DNA origami nanostructures with toroidal curvature governed by CGLE phase parameter. QT45/51 print record." },
  { src: imgAlignment,   ts: 1776435373437, label: "Convergence Event",     caption: "Six-planet alignment observed. Mercury–Venus–Jupiter–Saturn–Uranus–Neptune arc. φ-ratio coherence: 83.7%." },
  { src: imgCosmicLock,  ts: 1776435373457, label: "Cosmic Phase Lock",     caption: "Heliospheric coherence measurement during alignment — solar wind structured into Fibonacci-interval pulses." },
  { src: imgBinaryMap,   ts: 1776475138397, label: "Binary Map",            caption: "Binary state map of the CGLE field — ordered phase regions (1) vs turbulent chaos (0). Turing boundary visible." },
  { src: imgDuaMind,     ts: 1776472102804, label: "Dua Mind",              caption: "Dual-attractor mind model — two stable fixed points in phase space representing coherent and turbulent cognitive states." },
  { src: imgField,       ts: 1778000000000, label: "Field Reception",       caption: "Field reception schematic — spatial intention (A) mapping biological response through the substrate computation loop." },
  { src: imgFusion,      ts: 1778197246440, label: "Fusion Substrate",      caption: "AETHER // Quantum Substrate State — EUROFER97 blanket. TBR 1.248 ± 0.003. Coherence fidelity 1.000000 ± 2.1×10⁻¹⁸" },
].sort((a, b) => a.ts - b.ts);

function formatDate(ts: number): string {
  return new Date(ts).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" });
}
function formatMonth(ts: number): string {
  return new Date(ts).toLocaleDateString("en-US", { year: "numeric", month: "long" });
}
function groupByMonth(photos: typeof PHOTOS) {
  const groups = new Map<string, typeof PHOTOS>();
  photos.forEach(p => {
    const key = formatMonth(p.ts);
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key)!.push(p);
  });
  return groups;
}

const C = {
  bg: "#020810", panel: "#060d1a",
  teal: "#00e5c0", violet: "#b47ef8", gold: "#c9a227",
  white: "#e2e8f0", dim: "#4a6080",
};

function PhotoTimelineHeaderCanvas() {
  const ref = useRef<HTMLCanvasElement>(null);
  const rafRef = useRef(0);
  useEffect(() => {
    const canvas = ref.current; if (!canvas) return;
    const ctx = canvas.getContext("2d")!;
    canvas.width = 900; canvas.height = 145;
    const W = canvas.width, H = canvas.height;
    let t=0;
    const events: {x:number;y:number;col:string;label:string;phase:number}[] = [
      {x:80,y:72,col:"#2ef0d8",label:"2020",phase:0},
      {x:200,y:48,col:"#9966ff",label:"2021",phase:1},
      {x:320,y:90,col:"#c9a84c",label:"2022",phase:2},
      {x:440,y:55,col:"#44aaff",label:"2023",phase:3},
      {x:560,y:80,col:"#44cc77",label:"2024",phase:4},
      {x:680,y:45,col:"#ff4477",label:"2025",phase:5},
      {x:800,y:72,col:"#2ef0d8",label:"2026",phase:6},
    ];
    const draw=()=>{
      ctx.fillStyle="rgba(2,4,8,0.3)"; ctx.fillRect(0,0,W,H);
      ctx.beginPath();for(let i=0;i<events.length;i++){i===0?ctx.moveTo(events[i].x,events[i].y):ctx.lineTo(events[i].x,events[i].y);}ctx.strokeStyle="rgba(46,240,216,0.15)";ctx.lineWidth=1;ctx.stroke();
      events.forEach(e=>{
        const pls=0.8+0.2*Math.sin(t*0.04+e.phase);
        ctx.beginPath();ctx.arc(e.x,e.y,9*pls,0,Math.PI*2);ctx.fillStyle=e.col+"33";ctx.fill();ctx.strokeStyle=e.col+"88";ctx.lineWidth=0.8;ctx.stroke();
        ctx.fillStyle=e.col;ctx.font="bold 7px 'DM Mono',monospace";ctx.textAlign="center";ctx.fillText(e.label,e.x,e.y+3);ctx.textAlign="left";
      });
      ctx.fillStyle="rgba(46,240,216,0.3)"; ctx.font="9px 'DM Mono',monospace";
      ctx.fillText("PHOTO TIMELINE · VISUAL ARCHIVE · TEMPORAL MEMORY · AETHER",14,14);
      t++; rafRef.current=requestAnimationFrame(draw);
    };
    draw();
    return ()=>cancelAnimationFrame(rafRef.current);
  },[]);
  return <canvas ref={ref} style={{width:"100%",height:"auto",borderRadius:8,display:"block"}} />;
}

export default function PhotoTimelinePage() {
  const [selected, setSelected] = useState<typeof PHOTOS[0] | null>(null);
  const [view, setView] = useState<"timeline" | "grid">("timeline");

  const groups = groupByMonth(PHOTOS);

  // Keyboard navigation for lightbox
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (!selected) return;
      const idx = PHOTOS.indexOf(selected);
      if (e.key === "ArrowRight" && idx < PHOTOS.length - 1) setSelected(PHOTOS[idx + 1]);
      if (e.key === "ArrowLeft"  && idx > 0)                  setSelected(PHOTOS[idx - 1]);
      if (e.key === "Escape")                                   setSelected(null);
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [selected]);

  const panel = { background: "rgba(6,13,26,0.9)", border: "1px solid rgba(0,229,192,0.1)", borderRadius: 12 };

  return (
    <div style={{ minHeight: "100%", background: C.bg, color: C.white, fontFamily: "'DM Mono',monospace", overflowY: "auto" }}>
      {/* Header */}
      <div style={{ borderBottom: "1px solid rgba(0,229,192,0.1)", padding: "2rem 2.5rem 1.5rem" }}>
        <div style={{ fontSize: 10, letterSpacing: "0.35em", color: C.teal, textTransform: "uppercase", marginBottom: 8 }}>
          AETHER · ARCHIVE
        </div>
        <h1 style={{ fontSize: "2.4rem", fontFamily: "'Cinzel',serif", color: C.white, margin: "0 0 0.5rem" }}>
          Timeline Map
        </h1>
        <p style={{ fontSize: 13, color: "rgba(255,255,255,0.4)", maxWidth: 680, lineHeight: 1.7, margin: "0 0 1.2rem" }}>
          A photographic record of the AETHER research journey — substrate experiments, coherence events, and key milestones.
          Click any image to expand. Use ← → arrow keys to navigate the lightbox.
        </p>
        <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
          {(["timeline", "grid"] as const).map(v => (
            <button key={v} onClick={() => setView(v)} style={{
              fontFamily: "'DM Mono',monospace", fontSize: 10, letterSpacing: "0.2em",
              padding: "0.35rem 0.85rem", borderRadius: 6, cursor: "pointer", border: "1px solid",
              borderColor: view === v ? C.teal : "rgba(255,255,255,0.08)",
              background: view === v ? "rgba(0,229,192,0.1)" : "transparent",
              color: view === v ? C.teal : "rgba(255,255,255,0.3)", textTransform: "uppercase",
            }}>{v === "timeline" ? "⟡ Timeline" : "⊞ Grid"}</button>
          ))}
          <div style={{ marginLeft: "auto", fontSize: 9, color: C.dim, letterSpacing: "0.2em" }}>
            {PHOTOS.length} RECORDS · {groups.size} MONTHS
          </div>
        </div>
      </div>

      <div style={{ padding: "1.8rem 2.5rem" }}>

        {/* ── TIMELINE VIEW ── */}
        {view === "timeline" && (
          <div style={{ position: "relative" }}>
            {/* Central spine */}
            <div style={{
              position: "absolute", left: "50%", top: 0, bottom: 0, width: 2,
              background: "linear-gradient(to bottom, rgba(0,229,192,0.5), rgba(180,126,248,0.3), rgba(201,162,39,0.5))",
              transform: "translateX(-50%)", zIndex: 0,
            }} />

            {Array.from(groups.entries()).map(([month, photos], gi) => (
              <div key={month} style={{ marginBottom: "3rem" }}>
                {/* Month header */}
                <div style={{ textAlign: "center", position: "relative", zIndex: 1, marginBottom: "1.5rem" }}>
                  <div style={{
                    display: "inline-block", padding: "0.4rem 1.2rem",
                    background: C.bg, border: "1px solid rgba(0,229,192,0.25)", borderRadius: 20,
                    fontSize: 10, letterSpacing: "0.3em", color: C.teal, textTransform: "uppercase",
                  }}>{month}</div>
                </div>

                {photos.map((photo, pi) => {
                  const isLeft = (gi * 100 + pi) % 2 === 0;
                  return (
                    <div key={photo.ts} style={{
                      display: "grid", gridTemplateColumns: "1fr 40px 1fr",
                      marginBottom: "1.5rem", alignItems: "start", position: "relative", zIndex: 1,
                    }}>
                      <div style={{ paddingRight: "1.5rem", paddingTop: 8 }}>
                        {isLeft && <TimelineCard photo={photo} onSelect={setSelected} />}
                      </div>
                      {/* Spine dot */}
                      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", paddingTop: 16 }}>
                        <div style={{
                          width: 12, height: 12, borderRadius: "50%", flexShrink: 0,
                          background: C.teal, boxShadow: `0 0 12px ${C.teal}`, border: `2px solid ${C.bg}`,
                        }} />
                      </div>
                      <div style={{ paddingLeft: "1.5rem", paddingTop: 8 }}>
                        {!isLeft && <TimelineCard photo={photo} onSelect={setSelected} />}
                      </div>
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        )}

        {/* ── GRID VIEW ── */}
        {view === "grid" && (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(min(100%, 240px), 1fr))", gap: "1rem" }}>
            {PHOTOS.map(photo => (
              <div key={photo.ts}
                onClick={() => setSelected(photo)}
                style={{ ...panel, overflow: "hidden", cursor: "zoom-in", transition: "border-color 0.2s, transform 0.2s" }}
                onMouseEnter={e => { (e.currentTarget as HTMLDivElement).style.borderColor = "rgba(0,229,192,0.35)"; (e.currentTarget as HTMLDivElement).style.transform = "translateY(-2px)"; }}
                onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.borderColor = "rgba(0,229,192,0.1)"; (e.currentTarget as HTMLDivElement).style.transform = "translateY(0)"; }}
              >
                <div style={{ aspectRatio: "4/3", overflow: "hidden", background: "#030a15" }}>
                  <img src={photo.src} alt={photo.label} loading="lazy"
                    style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
                </div>
                <div style={{ padding: "0.75rem 0.9rem" }}>
                  <div style={{ fontSize: 9, color: C.teal, letterSpacing: "0.2em", marginBottom: 3 }}>{formatDate(photo.ts)}</div>
                  <div style={{ fontSize: 11, color: C.white, fontWeight: "bold", marginBottom: 4 }}>{photo.label}</div>
                  <div style={{ fontSize: 9, color: "rgba(255,255,255,0.35)", lineHeight: 1.5 }}>{photo.caption.slice(0, 80)}…</div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Lightbox */}
      {selected && (
        <div onClick={() => setSelected(null)} style={{
          position: "fixed", inset: 0, zIndex: 9999,
          background: "rgba(0,0,0,0.95)",
          display: "flex", alignItems: "center", justifyContent: "center",
          cursor: "zoom-out",
        }}>
          <div onClick={e => e.stopPropagation()} style={{
            maxWidth: "min(90vw, 900px)", width: "100%",
            background: C.panel, borderRadius: 16, overflow: "hidden",
            border: "1px solid rgba(0,229,192,0.15)",
            boxShadow: "0 0 80px rgba(0,229,192,0.1)",
          }}>
            <img src={selected.src} alt={selected.label}
              style={{ width: "100%", maxHeight: "60vh", objectFit: "contain", background: "#030a15", display: "block" }} />
            <div style={{ padding: "1.2rem 1.5rem" }}>
              <div style={{ fontSize: 9, color: C.teal, letterSpacing: "0.25em", marginBottom: 6 }}>
                {formatDate(selected.ts)} · {PHOTOS.indexOf(selected) + 1} of {PHOTOS.length}
              </div>
              <div style={{ fontSize: 16, color: C.white, fontWeight: "bold", marginBottom: 8 }}>{selected.label}</div>
              <p style={{ fontSize: 12, color: "rgba(255,255,255,0.5)", lineHeight: 1.7, margin: "0 0 1rem" }}>{selected.caption}</p>
              <div style={{ display: "flex", gap: 10 }}>
                {[
                  { label: "← Prev", disabled: PHOTOS.indexOf(selected) === 0,      onClick: () => { const i = PHOTOS.indexOf(selected); if (i > 0) setSelected(PHOTOS[i - 1]); } },
                  { label: "Next →", disabled: PHOTOS.indexOf(selected) === PHOTOS.length - 1, onClick: () => { const i = PHOTOS.indexOf(selected); if (i < PHOTOS.length - 1) setSelected(PHOTOS[i + 1]); } },
                ].map(b => (
                  <button key={b.label} disabled={b.disabled}
                    onClick={e => { e.stopPropagation(); b.onClick(); }}
                    style={{
                      padding: "0.4rem 1rem", borderRadius: 8, border: "1px solid rgba(0,229,192,0.25)",
                      background: "rgba(0,229,192,0.08)", color: C.teal, cursor: "pointer",
                      fontFamily: "'DM Mono',monospace", fontSize: 10,
                      opacity: b.disabled ? 0.3 : 1,
                    }}>{b.label}</button>
                ))}
                <button onClick={e => { e.stopPropagation(); setSelected(null); }}
                  style={{
                    marginLeft: "auto", padding: "0.4rem 1rem", borderRadius: 8,
                    border: "1px solid rgba(255,255,255,0.1)", background: "transparent",
                    color: "rgba(255,255,255,0.4)", cursor: "pointer",
                    fontFamily: "'DM Mono',monospace", fontSize: 10,
                  }}>✕ Close</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function TimelineCard({ photo, onSelect }: {
  photo: typeof PHOTOS[0];
  onSelect: (p: typeof PHOTOS[0]) => void;
}) {
  const [hovered, setHovered] = useState(false);
  return (
    <div onClick={() => onSelect(photo)}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background: "rgba(6,13,26,0.9)",
        border: `1px solid ${hovered ? "rgba(0,229,192,0.3)" : "rgba(0,229,192,0.1)"}`,
        borderRadius: 12, overflow: "hidden", cursor: "zoom-in",
        transform: hovered ? "scale(1.01)" : "scale(1)",
        transition: "border-color 0.2s, transform 0.2s",
      }}
    >
      <div style={{ aspectRatio: "16/10", overflow: "hidden", background: "#030a15" }}>
        <img src={photo.src} alt={photo.label} loading="lazy"
          style={{ width: "100%", height: "100%", objectFit: "cover", display: "block",
            transform: hovered ? "scale(1.04)" : "scale(1)", transition: "transform 0.3s" }} />
      </div>
      <div style={{ padding: "0.75rem 1rem" }}>
        <div style={{ fontSize: 8, color: "#00e5c0", letterSpacing: "0.22em", marginBottom: 4 }}>
          {new Date(photo.ts).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
        </div>
        <div style={{ fontSize: 12, color: "#e2e8f0", fontWeight: "bold", marginBottom: 5 }}>{photo.label}</div>
        <div style={{ fontSize: 9, color: "rgba(255,255,255,0.35)", lineHeight: 1.6 }}>{photo.caption}</div>
      </div>
    </div>
  );
}
