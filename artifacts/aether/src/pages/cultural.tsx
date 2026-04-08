import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";

// ─── Types & constants ────────────────────────────────────────────────────────

type EpistemicStatus = "DOC" | "EST" | "HYP";
type ColorLayer = "Archive" | "Iki" | "Aizome" | "Fragility" | "Process";
type Season = "spring" | "summer" | "autumn" | "winter" | "perennial" | "timeless" | "all";

interface JColor {
  id: string;
  name: string;
  romaji: string;
  hex: string;
  season: Season;
  material: string;
  emotion: string;
  meaning: string;
  layer: ColorLayer;
  epistemic: EpistemicStatus;
  special?: string;
  sx: number; sy: number;
}

const COLORS: JColor[] = [
  { id:"uguisu",    name:"鶯色",   romaji:"Uguisu-iro",  hex:"#8a9a5b", season:"spring",   material:"Feather",       emotion:"Listening",  layer:"Archive",   epistemic:"DOC",
    meaning:"Color of bush warbler in bamboo shadow — inseparable from sound. Not just green: a coordinate of time, place, and a particular quality of forest silence.", sx:0.25, sy:0.15 },
  { id:"moegi",     name:"萌黄色", romaji:"Moegi-iro",   hex:"#b5c468", season:"spring",   material:"Sprout",        emotion:"Emergence",  layer:"Archive",   epistemic:"DOC",
    meaning:"The moment new life pushes through soil — an event, not a pigment. Captures the exact moment of spring emergence rather than the static color of growth.", sx:0.35, sy:0.22 },
  { id:"tokiwa",    name:"常磐色", romaji:"Tokiwa-iro",  hex:"#2d6a4f", season:"perennial",material:"Pine",          emotion:"Permanence", layer:"Archive",   epistemic:"DOC",
    meaning:"Deep green unchanged beneath winter snow. Named for the trees that refuse seasonal death. A symbol of endurance — permanence as aesthetic statement.", sx:0.20, sy:0.60 },
  { id:"sakura-nezu",name:"桜鼠", romaji:"Sakura Nezu", hex:"#c8b8c0", season:"spring",   material:"Silk",          emotion:"Echo",       layer:"Iki",       epistemic:"DOC",
    meaning:"Gray with ghost of cherry blossoms — born from Edo restriction. A muted gray that subtly retains the memory of cherry blossom pink. Born from constraint.", sx:0.60, sy:0.18 },
  { id:"baicha",    name:"梅茶",   romaji:"Baicha",      hex:"#a08060", season:"all",      material:"Silk",          emotion:"Restraint",  layer:"Iki",       epistemic:"DOC",
    meaning:"One of 48 Edo-period browns. Elegance through restraint — sophistication demonstrated within the boundaries of what was forbidden rather than despite them.", sx:0.55, sy:0.55 },
  { id:"nasukon",   name:"茄子紺", romaji:"Nasukon",     hex:"#1c2a4a", season:"all",      material:"Living Indigo", emotion:"Depth",      layer:"Aizome",    epistemic:"DOC",
    meaning:"New indigo — biologically alive dye before time has touched it. Deep navy, at the beginning of the object's long biography of wear and exposure.", sx:0.72, sy:0.78 },
  { id:"kachiro",   name:"褐色",   romaji:"Kachiro",     hex:"#2a4870", season:"all",      material:"Warrior Cloth", emotion:"Victory",    layer:"Aizome",    epistemic:"DOC",
    meaning:"Warrior blue — kachi means to win. The indigo of battle-worn cloth carried the intention of warriors into the field. Victory encoded in color.", sx:0.62, sy:0.72 },
  { id:"kame",      name:"甕の井", romaji:"Kame no i",   hex:"#b8ccd8", season:"all",      material:"Aged Cloth",    emotion:"Memory",     layer:"Aizome",    epistemic:"DOC",
    meaning:"Pale blue achieved only after decades of wear. Time is the final dye — a color of accumulated exposure. The object records its own history in lightness.", sx:0.50, sy:0.30 },
  { id:"murasaki",  name:"紫",     romaji:"Murasaki",    hex:"#8b5e8a", season:"all",      material:"Murasaki Root", emotion:"Fragility",  layer:"Fragility", epistemic:"DOC", special:"color_decay",
    meaning:"Fragile dye — prestige from scarcity and vulnerability. Fades over time. Ranked highest precisely because it cannot endure. Scarcity is the mechanism of nobility.", sx:0.78, sy:0.38 },
  { id:"hatao",     name:"羽縹",   romaji:"Hatao",       hex:"#7888a0", season:"all",      material:"Technique",     emotion:"Illusion",   layer:"Fragility", epistemic:"EST", special:"context_dependent",
    meaning:"Gray that hints at violet only under certain light — a perceptual glitch. A color that exists only through subtle interactions of context. Observed but not reproducible.", sx:0.68, sy:0.48 },
  { id:"beni",      name:"紅",     romaji:"Beni",        hex:"#c04040", season:"summer",   material:"Safflower",     emotion:"Life Force", layer:"Process",   epistemic:"DOC", special:"requires_touch",
    meaning:"Activated by human body heat — cannot be replicated digitally. The yellow is removed first; the deep red waits beneath, completed only by the pH of living hands.", sx:0.40, sy:0.68 },
  { id:"yamabuki",  name:"山吹色", romaji:"Yamabuki-iro",hex:"#e8a824", season:"autumn",   material:"Paper",         emotion:"Brightness", layer:"Archive",   epistemic:"DOC",
    meaning:"The vivid yellow of the Japanese kerria flower. Clarity and brilliance — a color associated with the wealth of sun in late season.", sx:0.45, sy:0.38 },
  { id:"momiji",    name:"紅葉色", romaji:"Momiji-iro",  hex:"#c0392b", season:"autumn",   material:"Wood",          emotion:"Transience", layer:"Archive",   epistemic:"DOC",
    meaning:"Burning red of maple leaves — deeply connected to the Japanese awareness of impermanence. The most beautiful moment is the one about to end.", sx:0.35, sy:0.72 },
  { id:"yukishiro", name:"雪白",   romaji:"Yukishiro",   hex:"#f0ede6", season:"winter",   material:"Silk",          emotion:"Absence",    layer:"Archive",   epistemic:"DOC",
    meaning:"Snow white — the color of silence. Carries an absence that feels full rather than empty. Stillness as positive presence.", sx:0.22, sy:0.35 },
  { id:"sumi",      name:"墨色",   romaji:"Sumi-iro",    hex:"#2c2a28", season:"winter",   material:"Paper",         emotion:"Focus",      layer:"Archive",   epistemic:"DOC",
    meaning:"Ink black. The foundation of Japanese visual language — a tone that contains entire landscapes within a single brushstroke.", sx:0.80, sy:0.85 },
];

const SEASON_COLORS: Record<string, string> = {
  spring:"#89c074", summer:"#2e5e93", autumn:"#c0392b",
  winter:"#a0aec0", perennial:"#2d6a4f", timeless:"#a78bfa", all:"#64748b"
};
const MATERIAL_COLORS: Record<string, string> = {
  silk:"#f9a8d4", dye:"#818cf8", paper:"#fcd34d",
  wood:"#92400e", stone:"#9ca3af",
};
const LAYER_COLORS: Record<ColorLayer, string> = {
  Archive:"#89c074", Iki:"#a08060", Aizome:"#2a4870",
  Fragility:"#8b5e8a", Process:"#c04040"
};
const EPISTEMIC_COLORS: Record<EpistemicStatus, string> = {
  DOC:"#22c55e", EST:"#eab308", HYP:"#f97316"
};

// ─── Seven Perception Layers ──────────────────────────────────────────────────

const PERCEPTION_LAYERS = [
  { n:1, label:"Physical Spectrum",   sub:"λ: 380–730nm, UV → infrared",           col:"#e8a824", desc:"Electromagnetic radiation. The outermost ring — the physical world as it is, independent of any observer. Rayleigh scattering ∝ λ⁻⁴, which is why blue light scatters and sunsets are warm." },
  { n:2, label:"Biology",             sub:"S/M/L cones, opponent channels",         col:"#22c55e", desc:"Trichromacy collapses the full spectrum to three cone signals. Opponent channels (R↔G, B↔Y, L↔D) mean reddish-green is mathematically impossible to perceive." },
  { n:3, label:"Device Space (sRGB)", sub:"≈33% of visible gamut",                 col:"#0ea5e9", desc:"The RGB cube is a tiny subset of biological vision — a device-dependent approximation that cannot represent spectral yellows, deep violets, or infrared. Color is already compressed at this layer." },
  { n:4, label:"LAB / OKLab",         sub:"Perceptual uniformity geometry",         col:"#8b5cf6", desc:"CIE LAB (1976) and OKLab (2020) reshape color space so equal distances correspond to equal perceived differences. This is the first layer that models perception, not physics." },
  { n:5, label:"Animal Vision",        sub:"Bee UV, bird tetrachromacy, mantis 16",  col:"#ec4899", desc:"Bees see UV + blue + green. Birds are tetrachromats. Mantis shrimp have 12–16 receptors. Each species inhabits a completely different color universe on the same physical substrate." },
  { n:6, label:"Impossible Colors",   sub:"Stygian blue, reddish-green",            col:"#f97316", desc:"Colors that exist mathematically but cannot be perceived under normal conditions. Opponent channel constraints mean the brain cannot encode both ends of a channel simultaneously — until you force it." },
  { n:7, label:"Japanese Perception", sub:"Cultural space — time + season + material", col:"#bc6ff1", desc:"The innermost ring. Color as memory coordinate. Japanese names encode season, material, emotion, and temporal context — not just hue. This is culture reshaping the geometry of perception itself." },
];

// ─── Coherence colors (for interactive demo) ─────────────────────────────────

const COHERENCE_EXAMPLES = COLORS.slice(0, 6).map(c => ({
  id: c.id, name: c.romaji, hex: c.hex,
  vector: [
    { dim:"λ", val:`${c.emotion.toLowerCase()} wavelength range`, col:"#0ea5e9" },
    { dim:"season", val:c.season, col:"#22c55e" },
    { dim:"material", val:c.material.toLowerCase(), col:"#f97316" },
    { dim:"emotion", val:c.emotion.toLowerCase(), col:"#e64522" },
    { dim:"t", val:"time encoded in object", col:"#a78bfa" },
    { dim:"context", val:`${c.layer.toLowerCase()} cultural layer`, col:"#bc6ff1" },
  ]
}));

// ─── Kasane fabric colors ─────────────────────────────────────────────────────

const FABRIC_OPTIONS = [
  { id:"white",  name:"White Silk",  hex:"#f8f4ed" },
  { id:"red",    name:"Red Silk",    hex:"#c0392b" },
  { id:"indigo", name:"Indigo Silk", hex:"#1c2a4a" },
  { id:"green",  name:"Green Silk",  hex:"#2d6a4f" },
  { id:"gold",   name:"Gold Silk",   hex:"#d4a017" },
  { id:"purple", name:"Purple Silk", hex:"#8b5e8a" },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

function hexToRgb(hex: string) {
  const r = parseInt(hex.slice(1,3),16);
  const g = parseInt(hex.slice(3,5),16);
  const b = parseInt(hex.slice(5,7),16);
  return [r,g,b];
}
function opticalMix(h1: string, h2: string, opacity: number): string {
  const [r1,g1,b1] = hexToRgb(h1);
  const [r2,g2,b2] = hexToRgb(h2);
  const r = Math.round(r1*(1-opacity) + r2*opacity);
  const g = Math.round(g1*(1-opacity) + g2*opacity);
  const b = Math.round(b1*(1-opacity) + b2*opacity);
  return `rgb(${r},${g},${b})`;
}
function lerpColor(a: string, b: string, t: number): string {
  const [r1,g1,b1] = hexToRgb(a);
  const [r2,g2,b2] = hexToRgb(b);
  return `rgb(${Math.round(r1+t*(r2-r1))},${Math.round(g1+t*(g2-g1))},${Math.round(b1+t*(b2-b1))})`;
}

// ─── Indigo stages (corrected hex from knowledge thread) ──────────────────────

const INDIGO_STAGES = [
  { name:"Nasukon", romaji:"茄子紺", hex:"#1c2a4a", age:"New — 0 years",  desc:"New indigo — biologically alive dye at the beginning of its life. Deep navy." },
  { name:"Kachiro",  romaji:"褐色",  hex:"#2a4870", age:"~5 years",       desc:"Warrior blue — kachi means to win. The indigo of battle-worn cloth." },
  { name:"Ai-iro",   romaji:"藍色",  hex:"#3f6e9c", age:"~15 years",      desc:"Pure indigo — the characteristic Japan Blue, opened and deepened by wear." },
  { name:"Hanada",   romaji:"縹色",  hex:"#5080a0", age:"~30 years",      desc:"A lightened, sky-like blue as the dye breathes with decades of exposure." },
  { name:"Kame no i",romaji:"甕の井",hex:"#b8ccd8", age:"~50+ years",     desc:"Pale translucent blue achieved only after decades. Time is the final dye." },
];

function indigoAtTime(t: number): string {
  const idx = Math.min(Math.floor(t * (INDIGO_STAGES.length - 1)), INDIGO_STAGES.length - 2);
  const local = t * (INDIGO_STAGES.length - 1) - idx;
  return lerpColor(INDIGO_STAGES[idx].hex, INDIGO_STAGES[idx+1].hex, local);
}
function indigoStageAt(t: number) {
  return INDIGO_STAGES[Math.min(Math.round(t * (INDIGO_STAGES.length - 1)), INDIGO_STAGES.length - 1)];
}

// ─── Edo palette ──────────────────────────────────────────────────────────────

const EDO_RESTRICTED: string[] = [
  "#2c2a28","#3d3836","#4a423e","#5a4e49","#6b5c54",
  "#7a6760","#8c7b74","#9e8f88","#b0a09a","#c2b3ad",
  "#6b5840","#7a6248","#8a6e50","#9c7a55","#ac8a60",
  "#7a4d3a","#8a5942","#9a6450","#aa7060","#ba7c6e",
  "#5a5040","#6a6050","#7a706a","#8a8080","#9a9090",
  "#706860","#806e65","#907868","#a0846e","#b09075",
  "#4a4845","#5a5855","#6a6865","#7a7875","#8a8885",
  "#4a4040","#5a4f4f","#6a6060","#7a7070","#8a8080",
  "#3a3036","#4a4046","#5a5056","#6a6066","#7a7076",
  "#403040","#504050","#605060","#706070","#807080",
];

// ─── Main component ───────────────────────────────────────────────────────────

export default function CulturalPage() {
  // Color space
  const [selectedColor, setSelectedColor] = useState<JColor | null>(null);
  const [seasonFilter, setSeasonFilter] = useState<string>("all");
  // Layer cosmology
  const [hoveredLayer, setHoveredLayer] = useState<number | null>(null);
  // Kasane
  const [layer1, setLayer1] = useState(FABRIC_OPTIONS[0]);
  const [layer2, setLayer2] = useState(FABRIC_OPTIONS[1]);
  const [opacity, setOpacity] = useState(0.6);
  // Indigo
  const [indigoTime, setIndigoTime] = useState(0);
  // Purple decay
  const [purpleAge, setPurpleAge] = useState(0);
  const [autoAge, setAutoAge] = useState(false);
  const ageRef = useRef<ReturnType<typeof setInterval> | null>(null);
  // Coherence demo
  const [coherenceColor, setCoherenceColor] = useState(COHERENCE_EXAMPLES[0]);
  // Floral bridge
  const [floralPulse, setFloralPulse] = useState(false);
  // Beni
  const [beniPhase, setBeniPhase] = useState(0);
  const [beniHeat, setBeniHeat] = useState(0);
  const beniRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const [beniHeating, setBeniHeating] = useState(false);

  const startHeat = useCallback(() => { if (beniPhase < 4) setBeniHeating(true); }, [beniPhase]);
  const stopHeat = useCallback(() => setBeniHeating(false), []);

  useEffect(() => {
    if (autoAge) {
      ageRef.current = setInterval(() => setPurpleAge(a => Math.min(1, a + 0.003)), 80);
    } else {
      if (ageRef.current) clearInterval(ageRef.current);
    }
    return () => { if (ageRef.current) clearInterval(ageRef.current); };
  }, [autoAge]);

  useEffect(() => {
    if (beniHeating && beniPhase < 4) {
      beniRef.current = setInterval(() => {
        setBeniHeat(h => {
          const next = Math.min(1, h + 0.02);
          if (next >= 1) { setBeniPhase(p => Math.min(4, p + 1)); setBeniHeating(false); return 0; }
          return next;
        });
      }, 60);
    } else {
      if (beniRef.current) clearInterval(beniRef.current);
    }
    return () => { if (beniRef.current) clearInterval(beniRef.current); };
  }, [beniHeating, beniPhase]);

  const purpleHex = "#8b5e8a";
  const purpleFaded = lerpColor(purpleHex, "#4a4050", purpleAge);
  const purpleOpacity = Math.max(0.1, 1 - purpleAge * 0.8);
  const mixedColor = opticalMix(layer1.hex, layer2.hex, opacity);
  const currentIndigoStage = indigoStageAt(indigoTime);
  const currentIndigoColor = indigoAtTime(indigoTime);
  const filteredColors = seasonFilter === "all" ? COLORS : COLORS.filter(c => c.season === seasonFilter || c.season === "all");

  const SectionHeader = ({ title, right }: { title: string; right: string }) => (
    <div className="font-mono text-xs text-muted-foreground tracking-widest uppercase mb-2 flex items-center gap-3">
      <span>{title}</span>
      <span className="flex-1 h-px bg-border" />
      <span className="text-muted-foreground/40">{right}</span>
    </div>
  );

  return (
    <div className="h-full overflow-y-auto px-8 py-8 space-y-16">

      {/* ── Header ─────────────────────────────────────────────────────── */}
      <div className="flex items-start justify-between gap-8 flex-wrap">
        <div className="space-y-4 flex-1 min-w-0">
          <div className="flex items-center gap-3 flex-wrap">
            <span className="font-mono text-[10px] tracking-[0.3em] uppercase" style={{ color:"#bc6ff1" }}>
              AETHER LAYER VII
            </span>
            <span className="font-mono text-[9px] px-2 py-0.5 rounded border border-violet-500/30 text-violet-400/60">
              Cultural Perception Geometry
            </span>
          </div>
          <h1 className="font-serif text-4xl font-medium tracking-tight text-foreground">
            Traditional Japanese Color
          </h1>
          <p className="font-mono text-sm text-muted-foreground max-w-2xl leading-relaxed">
            Memory, Perception, and the Philosophy of Nuance. Culture reshapes the geometry of
            perception — color naming becomes a coordinate system layered on top of physical wavelengths.
          </p>
          <p className="font-mono text-xs text-muted-foreground/40 max-w-xl leading-relaxed">
            Color is not a property of light. It is computed by biology, transformed by neural encoding,
            compressed by culture, and indexed by time. This page explores the outermost and innermost
            rings of the AETHER color perception manifold.
          </p>
        </div>

        {/* Perception equation — EXTENDED with context */}
        <div className="shrink-0 rounded-xl border border-border/30 p-5 space-y-3 bg-white/2 min-w-[240px]">
          <div className="font-mono text-[9px] text-muted-foreground/40 uppercase tracking-widest">
            Master Equation
          </div>
          <div className="font-mono text-sm text-foreground/80 leading-loose">
            <span style={{ color:"#bc6ff1" }}>C</span> = f(<br />
            &nbsp;&nbsp;<span style={{ color:"#0ea5e9" }}>λ</span>,&nbsp;
            <span style={{ color:"#22c55e" }}>biology</span>,<br />
            &nbsp;&nbsp;<span style={{ color:"#f97316" }}>cognition</span>,<br />
            &nbsp;&nbsp;<span style={{ color:"#e64522" }}>culture</span>,<br />
            &nbsp;&nbsp;<span style={{ color:"#a78bfa" }}>context</span>,<br />
            &nbsp;&nbsp;<span style={{ color:"#bc6ff1" }}>t</span><br />
            )
          </div>
          <div className="space-y-0.5 pt-1 border-t border-border/20">
            {[
              { sym:"λ",         col:"#0ea5e9", desc:"wavelength physics" },
              { sym:"biology",   col:"#22c55e", desc:"cone receptors" },
              { sym:"cognition", col:"#f97316", desc:"opponent channels" },
              { sym:"culture",   col:"#e64522", desc:"naming + symbol" },
              { sym:"context",   col:"#a78bfa", desc:"lighting + contrast" },
              { sym:"t",         col:"#bc6ff1", desc:"time / memory / decay" },
            ].map(({ sym, col, desc }) => (
              <div key={sym} className="flex items-center gap-2 font-mono text-[9px]">
                <span style={{ color: col }} className="w-16 shrink-0">{sym}</span>
                <span className="text-muted-foreground/40">{desc}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Seven Perception Layers ───────────────────────────────────────── */}
      <div>
        <SectionHeader title="The Seven Perception Layers" right="Color Cosmology — Nested Manifolds" />
        <p className="font-mono text-xs text-muted-foreground/40 mb-5 leading-relaxed">
          Each layer is a nested subset of the one above it. Physical Spectrum is outermost — 
          the universe as it is. Japanese Perception is innermost — the most specific, most human, 
          most culturally compressed.
        </p>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          {/* Cosmology SVG */}
          <div className="lg:col-span-3 rounded-xl border border-border/20 overflow-hidden"
            style={{ background:"radial-gradient(ellipse at 50% 50%, #0c0814 0%, #060608 100%)" }}>
            <svg viewBox="0 0 500 480" className="w-full" style={{ maxHeight:420 }}>
              {/* Rings — outermost to innermost */}
              {PERCEPTION_LAYERS.slice().reverse().map((pl, ri) => {
                const r = 220 - (ri * 26);
                const isHovered = hoveredLayer === pl.n;
                return (
                  <g key={pl.n}
                    onMouseEnter={() => setHoveredLayer(pl.n)}
                    onMouseLeave={() => setHoveredLayer(null)}
                    style={{ cursor:"pointer" }}>
                    <circle cx={250} cy={240} r={r}
                      fill={`${pl.col}${isHovered ? "20" : "08"}`}
                      stroke={pl.col}
                      strokeWidth={isHovered ? 2 : 0.8}
                      strokeOpacity={isHovered ? 0.9 : 0.35}
                      style={{ transition:"all 0.2s" }}
                    />
                    {/* Layer number */}
                    <text
                      x={250 + (r - 12) * Math.cos(-Math.PI * 0.05 + ri * 0.08)}
                      y={240 + (r - 12) * Math.sin(-Math.PI * 0.05 + ri * 0.08)}
                      textAnchor="middle" fill={pl.col} fontSize="7"
                      fontFamily="monospace" opacity={isHovered ? 1 : 0.5}
                      style={{ userSelect:"none" }}>
                      {`VII`.slice(0, pl.n <= 4 ? pl.n : pl.n)}
                    </text>
                  </g>
                );
              })}

              {/* Layer label spokes */}
              {PERCEPTION_LAYERS.map((pl, i) => {
                const angle = (i / PERCEPTION_LAYERS.length) * Math.PI * 2 - Math.PI / 2;
                const r = 220 - (6 - i) * 26;
                const lx = 250 + (r + 22) * Math.cos(angle);
                const ly = 240 + (r + 22) * Math.sin(angle);
                const isHovered = hoveredLayer === pl.n;
                return (
                  <g key={`label-${pl.n}`}
                    onMouseEnter={() => setHoveredLayer(pl.n)}
                    onMouseLeave={() => setHoveredLayer(null)}
                    style={{ cursor:"pointer" }}>
                    <line
                      x1={250 + (r) * Math.cos(angle)}
                      y1={240 + (r) * Math.sin(angle)}
                      x2={lx} y2={ly}
                      stroke={pl.col} strokeWidth="0.4" opacity={isHovered ? 0.7 : 0.2} />
                    <text x={lx} y={ly}
                      textAnchor={lx > 250 ? "start" : "end"} fill={pl.col}
                      fontSize={isHovered ? "8" : "7"} fontFamily="monospace"
                      opacity={isHovered ? 1 : 0.45}
                      style={{ userSelect:"none" }}>
                      {`L${pl.n}`}
                    </text>
                  </g>
                );
              })}

              {/* Center label */}
              <text x={250} y={237} textAnchor="middle" fill="#bc6ff1" fontSize="10" fontFamily="serif" opacity="0.6">色</text>
              <text x={250} y={250} textAnchor="middle" fill="#bc6ff1" fontSize="5.5" fontFamily="monospace" opacity="0.4">AETHER</text>

              {/* Ring numbers — roman numerals on outer edge */}
              {PERCEPTION_LAYERS.map((pl, i) => {
                const r = 220 - (6 - i) * 26;
                const angle = Math.PI * 1.35 + i * 0.15;
                return (
                  <text key={`rn-${i}`}
                    x={250 + r * Math.cos(angle)} y={240 + r * Math.sin(angle)}
                    textAnchor="middle" fill={pl.col} fontSize="6"
                    fontFamily="monospace" opacity="0.4"
                    style={{ userSelect:"none" }}>
                    {["I","II","III","IV","V","VI","VII"][i]}
                  </text>
                );
              })}
            </svg>
          </div>

          {/* Layer detail panel */}
          <div className="lg:col-span-2 space-y-2">
            <AnimatePresence mode="wait">
              {hoveredLayer ? (
                (() => {
                  const pl = PERCEPTION_LAYERS.find(l => l.n === hoveredLayer)!;
                  return (
                    <motion.div key={pl.n}
                      initial={{ opacity:0, x:12 }} animate={{ opacity:1, x:0 }} exit={{ opacity:0, x:-12 }}
                      className="rounded-xl border p-5 space-y-3"
                      style={{ borderColor:`${pl.col}30`, background:`${pl.col}08` }}>
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg border flex items-center justify-center font-mono text-xs font-bold"
                          style={{ borderColor:`${pl.col}50`, color:pl.col, background:`${pl.col}15` }}>
                          {["I","II","III","IV","V","VI","VII"][pl.n-1]}
                        </div>
                        <div>
                          <div className="font-mono text-sm font-bold" style={{ color:pl.col }}>{pl.label}</div>
                          <div className="font-mono text-[9px] text-muted-foreground/50">{pl.sub}</div>
                        </div>
                      </div>
                      <p className="font-serif text-sm text-foreground/65 italic leading-relaxed">{pl.desc}</p>
                    </motion.div>
                  );
                })()
              ) : null}
            </AnimatePresence>

            {/* Layer list */}
            <div className="space-y-1.5">
              {PERCEPTION_LAYERS.map(pl => (
                <div key={pl.n}
                  onMouseEnter={() => setHoveredLayer(pl.n)}
                  onMouseLeave={() => setHoveredLayer(null)}
                  className="flex items-center gap-3 rounded-lg px-3 py-2 border cursor-pointer transition-all"
                  style={{
                    borderColor: hoveredLayer === pl.n ? `${pl.col}40` : `${pl.col}15`,
                    background: hoveredLayer === pl.n ? `${pl.col}10` : `${pl.col}05`,
                  }}>
                  <div className="w-5 text-center font-mono text-[8px] shrink-0" style={{ color:pl.col }}>
                    {["I","II","III","IV","V","VI","VII"][pl.n-1]}
                  </div>
                  <div className="w-3 h-3 rounded-full shrink-0" style={{ background:pl.col, opacity:0.7 }} />
                  <div className="font-mono text-[10px] text-muted-foreground/60 flex-1 min-w-0 truncate">{pl.label}</div>
                  {pl.n === 7 && (
                    <span className="font-mono text-[7px] px-1.5 py-0.5 rounded border border-violet-500/30 text-violet-400/60 shrink-0">
                      CURRENT
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ── Japanese Color Space ──────────────────────────────────────────── */}
      <div>
        <SectionHeader title="Color Space" right="Season × Material × Emotion" />
        <p className="font-mono text-xs text-muted-foreground/40 mb-5">
          Colors cluster by moments in nature, not numerical hue. Each node is a memory coordinate — 
          carrying season, material, emotion, and temporal context. Click any to reveal its full vector.
        </p>

        {/* Season + layer filter */}
        <div className="flex gap-2 mb-4 flex-wrap">
          {["all","spring","summer","autumn","winter","perennial"].map(s => (
            <button key={s} onClick={() => setSeasonFilter(s)}
              className="font-mono text-[9px] px-3 py-1 rounded border transition-all"
              style={{
                borderColor: seasonFilter === s ? (SEASON_COLORS[s] ?? "#bc6ff1") : "#334155",
                color: seasonFilter === s ? (SEASON_COLORS[s] ?? "#bc6ff1") : "#64748b",
                background: seasonFilter === s ? `${SEASON_COLORS[s] ?? "#bc6ff1"}15` : "transparent",
              }}>
              {s.toUpperCase()}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
          {/* SVG color space */}
          <div className="lg:col-span-3 relative rounded-xl border border-border/20 overflow-hidden"
            style={{ background:"radial-gradient(ellipse at 20% 80%, #1c2a4a08 0%, transparent 60%), radial-gradient(ellipse at 80% 20%, #8b5e8a08 0%, transparent 60%), #0d1117" }}>
            <div className="absolute top-3 left-1/2 -translate-x-1/2 font-mono text-[8px] text-muted-foreground/20 tracking-widest">
              EMOTIONAL RESONANCE ↑
            </div>
            <div className="absolute bottom-3 right-4 font-mono text-[8px] text-muted-foreground/20 tracking-widest">
              → MATERIAL INTERACTION
            </div>
            <div className="absolute bottom-10 left-4 font-mono text-[8px] text-muted-foreground/20 tracking-widest"
              style={{ writingMode:"vertical-rl", transform:"rotate(180deg)" }}>
              SEASONALITY ↑
            </div>

            <svg viewBox="0 0 400 320" className="w-full" style={{ maxHeight:320 }}>
              <line x1="30" y1="290" x2="380" y2="290" stroke="#1e293b" strokeWidth="0.5" />
              <line x1="30" y1="290" x2="30" y2="20" stroke="#1e293b" strokeWidth="0.5" />

              {filteredColors.map(c => {
                const cx = 30 + c.sx * 350;
                const cy = 290 - c.sy * 270;
                const isSelected = selectedColor?.id === c.id;
                const epColor = EPISTEMIC_COLORS[c.epistemic];
                return (
                  <g key={c.id} onClick={() => setSelectedColor(isSelected ? null : c)} style={{ cursor:"pointer" }}>
                    {/* Epistemic ring */}
                    <circle cx={cx} cy={cy} r={isSelected ? 22 : 16}
                      fill="none" stroke={epColor} strokeWidth="0.5"
                      strokeDasharray={c.epistemic === "DOC" ? undefined : "2,2"}
                      opacity={isSelected ? 0.5 : 0.2} />
                    <circle cx={cx} cy={cy} r={isSelected ? 14 : 9}
                      fill={c.hex}
                      opacity={isSelected ? 1 : 0.75}
                      style={{ transition:"all 0.2s",
                        filter: isSelected ? `drop-shadow(0 0 8px ${c.hex})` : undefined }}
                    />
                    <text x={cx} y={cy + (isSelected ? 30 : 22)}
                      textAnchor="middle" fill={c.hex} fontSize="6.5" fontFamily="serif"
                      opacity={isSelected ? 1 : 0.6} style={{ userSelect:"none" }}>
                      {c.romaji.split("-")[0]}
                    </text>
                  </g>
                );
              })}

              <text x="10" y="55"  fill="#89c074" fontSize="7" fontFamily="monospace" opacity="0.25">Spring</text>
              <text x="10" y="120" fill="#2e5e93" fontSize="7" fontFamily="monospace" opacity="0.25">Summer</text>
              <text x="10" y="190" fill="#c0392b" fontSize="7" fontFamily="monospace" opacity="0.25">Autumn</text>
              <text x="10" y="265" fill="#a0aec0" fontSize="7" fontFamily="monospace" opacity="0.25">Winter</text>
            </svg>
          </div>

          {/* Color detail panel */}
          <div className="lg:col-span-2">
            <AnimatePresence mode="wait">
              {selectedColor ? (
                <motion.div key={selectedColor.id}
                  initial={{ opacity:0, x:12 }} animate={{ opacity:1, x:0 }} exit={{ opacity:0, x:-12 }}
                  className="rounded-xl border p-5 h-full space-y-4"
                  style={{ borderColor:`${selectedColor.hex}30`, background:`${selectedColor.hex}08` }}>

                  <div className="flex items-start gap-4">
                    <div className="w-14 h-14 rounded-xl border shrink-0"
                      style={{ background:selectedColor.hex, borderColor:`${selectedColor.hex}60`,
                        boxShadow:`0 0 24px ${selectedColor.hex}40` }} />
                    <div>
                      <div className="font-serif text-2xl" style={{ color:selectedColor.hex }}>
                        {selectedColor.name}
                      </div>
                      <div className="font-mono text-xs text-muted-foreground/60">{selectedColor.romaji}</div>
                      <div className="font-mono text-[9px] mt-1" style={{ color:selectedColor.hex + "80" }}>
                        {selectedColor.hex}
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-1.5">
                    {[
                      { label: selectedColor.season, color: SEASON_COLORS[selectedColor.season] ?? "#64748b" },
                      { label: selectedColor.layer, color: LAYER_COLORS[selectedColor.layer] },
                      { label: selectedColor.emotion, color: selectedColor.hex },
                    ].map(({ label, color }) => (
                      <span key={label} className="font-mono text-[8px] px-2 py-0.5 rounded border"
                        style={{ borderColor:`${color}40`, color, background:`${color}10` }}>
                        {label}
                      </span>
                    ))}
                    {/* Epistemic badge */}
                    <span className="font-mono text-[8px] px-2 py-0.5 rounded border"
                      style={{
                        borderColor:`${EPISTEMIC_COLORS[selectedColor.epistemic]}40`,
                        color:EPISTEMIC_COLORS[selectedColor.epistemic],
                        background:`${EPISTEMIC_COLORS[selectedColor.epistemic]}10`
                      }}>
                      {selectedColor.epistemic === "DOC" ? "✓ DOC" : selectedColor.epistemic === "EST" ? "~ EST" : "? HYP"}
                    </span>
                  </div>

                  <p className="font-serif text-sm text-foreground/65 leading-relaxed italic">
                    "{selectedColor.meaning}"
                  </p>

                  {/* Target vector */}
                  <div className="rounded-lg border border-border/20 bg-black/20 p-3 space-y-1">
                    <div className="font-mono text-[8px] text-muted-foreground/30 uppercase tracking-widest mb-2">
                      X*(t) Target Vector
                    </div>
                    {[
                      { k:"season",  v:selectedColor.season,   col:"#22c55e" },
                      { k:"material",v:selectedColor.material, col:"#f97316" },
                      { k:"emotion", v:selectedColor.emotion,  col:"#e64522" },
                      { k:"layer",   v:selectedColor.layer,    col:LAYER_COLORS[selectedColor.layer] },
                      { k:"t",       v:"encoded in aging",     col:"#bc6ff1" },
                    ].map(({ k, v, col }) => (
                      <div key={k} className="flex gap-2 font-mono text-[9px]">
                        <span className="w-16 shrink-0" style={{ color:col }}>{k}</span>
                        <span className="text-muted-foreground/50">{v.toLowerCase()}</span>
                      </div>
                    ))}
                  </div>
                </motion.div>
              ) : (
                <motion.div key="empty" initial={{ opacity:0 }} animate={{ opacity:1 }}
                  className="rounded-xl border border-border/20 h-full flex flex-col items-center justify-center p-8 text-center space-y-3"
                  style={{ background:"#0d1117" }}>
                  <div className="font-serif text-3xl text-muted-foreground/10">色</div>
                  <div className="font-mono text-[9px] text-muted-foreground/30 tracking-widest uppercase">
                    Select a color to reveal its X*(t) vector
                  </div>
                  <div className="flex gap-1.5 mt-2 flex-wrap justify-center">
                    {Object.entries(EPISTEMIC_COLORS).map(([k,v]) => (
                      <span key={k} className="font-mono text-[7px] px-1.5 py-0.5 rounded border"
                        style={{ borderColor:`${v}30`, color:v }}>
                        {k === "DOC" ? "✓ Documented" : k === "EST" ? "~ Estimated" : "? Hypothesis"}
                      </span>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Color chips */}
        <div className="mt-4 flex flex-wrap gap-1.5">
          {filteredColors.map(c => (
            <button key={c.id} onClick={() => setSelectedColor(selectedColor?.id === c.id ? null : c)}
              className="flex items-center gap-1.5 rounded px-2 py-1 border transition-all"
              style={{
                borderColor: selectedColor?.id === c.id ? `${c.hex}60` : `${c.hex}20`,
                background: selectedColor?.id === c.id ? `${c.hex}12` : `${c.hex}05`,
              }}>
              <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background:c.hex }} />
              <span className="font-mono text-[9px]" style={{ color:c.hex }}>{c.romaji}</span>
              <span className="font-mono text-[7px]" style={{ color:EPISTEMIC_COLORS[c.epistemic], opacity:0.6 }}>
                {c.epistemic}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* ── Kasane Layering Simulator ────────────────────────────────────── */}
      <div>
        <SectionHeader title="Kasane Layering Algorithm" right="Optical Design — Pre-Digital Compositing" />
        <p className="font-mono text-xs text-muted-foreground/40 mb-5 leading-relaxed">
          Centuries before digital color theory, Japanese clothing designers layered fabrics to create
          color through light interaction rather than pigment blending. The air between layers acts
          as an optical filter — dynamically altering perceived color with motion.
        </p>
        <div className="rounded-xl border border-border/20 p-6 bg-white/2">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-center">
            <div className="space-y-3">
              <div className="font-mono text-[10px] text-muted-foreground/40 uppercase tracking-widest">Layer 1 (Base)</div>
              <div className="w-full h-20 rounded-lg border border-border/30"
                style={{ background:layer1.hex, boxShadow:`0 0 24px ${layer1.hex}30` }} />
              <div className="grid grid-cols-3 gap-1.5">
                {FABRIC_OPTIONS.map(f => (
                  <button key={f.id} onClick={() => setLayer1(f)}
                    className="h-8 rounded border-2 transition-all"
                    style={{ background:f.hex, borderColor:layer1.id===f.id?"#ffffff40":"transparent",
                      boxShadow:layer1.id===f.id?`0 0 8px ${f.hex}60`:undefined }} title={f.name} />
                ))}
              </div>
              <div className="font-mono text-[9px]" style={{ color:layer1.hex }}>{layer1.name}</div>
            </div>

            <div className="space-y-3 flex flex-col items-center">
              <div className="font-mono text-[10px] text-muted-foreground/40 uppercase tracking-widest text-center">
                Kasane Result
              </div>
              <div className="w-24 h-24 rounded-full border-4 border-white/10"
                style={{ background:mixedColor, boxShadow:`0 0 40px ${mixedColor}` }} />
              <div className="w-full space-y-2">
                <div className="flex justify-between font-mono text-[9px]">
                  <span className="text-muted-foreground/40">Transparency</span>
                  <span className="text-muted-foreground/60">{Math.round(opacity*100)}%</span>
                </div>
                <input type="range" min="0" max="100" value={Math.round(opacity*100)}
                  onChange={e => setOpacity(+e.target.value/100)}
                  className="w-full h-1 accent-violet-400" />
              </div>
              <div className="font-mono text-[9px] text-center text-muted-foreground/30">
                optical_mix(layer₁, layer₂, α={Math.round(opacity*100)/100})
              </div>
            </div>

            <div className="space-y-3">
              <div className="font-mono text-[10px] text-muted-foreground/40 uppercase tracking-widest">Layer 2 (Over)</div>
              <div className="w-full h-20 rounded-lg border border-border/30"
                style={{ background:layer2.hex, boxShadow:`0 0 24px ${layer2.hex}30` }} />
              <div className="grid grid-cols-3 gap-1.5">
                {FABRIC_OPTIONS.map(f => (
                  <button key={f.id} onClick={() => setLayer2(f)}
                    className="h-8 rounded border-2 transition-all"
                    style={{ background:f.hex, borderColor:layer2.id===f.id?"#ffffff40":"transparent",
                      boxShadow:layer2.id===f.id?`0 0 8px ${f.hex}60`:undefined }} title={f.name} />
                ))}
              </div>
              <div className="font-mono text-[9px]" style={{ color:layer2.hex }}>{layer2.name}</div>
            </div>
          </div>

          <div className="mt-6 rounded-lg bg-black/30 border border-border/20 p-4 font-mono text-[10px] text-muted-foreground/50 leading-relaxed">
            <span className="text-violet-400/60">color</span> = optical_mix(<br />
            &nbsp;&nbsp;<span style={{ color:layer1.hex }}>"{layer1.name.toLowerCase()}"</span>,&nbsp;
            <span style={{ color:layer2.hex }}>"{layer2.name.toLowerCase()}"</span>,<br />
            &nbsp;&nbsp;transparency=<span className="text-amber-400/60">{Math.round(opacity*100)/100}</span><br />
            ) → <span style={{ color:mixedColor }}>{mixedColor}</span>
          </div>
        </div>
      </div>

      {/* ── Edo Palette Compression ──────────────────────────────────────── */}
      <div>
        <SectionHeader title="Edo Palette Compression" right="Restricted Manifold — Fractal Resolution" />
        <p className="font-mono text-xs text-muted-foreground/40 mb-5 leading-relaxed">
          Sumptuary laws compressed the visible palette. Within this restricted region, artisans
          expanded perception by creating extremely fine distinctions — 48 browns, 100 grays.
          High resolution in small areas, similar to zooming into a fractal.
        </p>
        <div className="rounded-xl border border-border/20 p-6 bg-white/2 space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <div className="font-mono text-[9px] text-muted-foreground/40 uppercase tracking-widest">Full Color Universe</div>
              <div className="h-12 rounded overflow-hidden flex">
                {Array.from({length:60}).map((_,i) => (
                  <div key={i} className="flex-1" style={{ background:`hsl(${i*6},70%,50%)` }} />
                ))}
              </div>
              <div className="font-mono text-[9px] text-muted-foreground/25">All hues — full gamut accessible</div>
            </div>
            <div className="space-y-2">
              <div className="font-mono text-[9px] text-muted-foreground/40 uppercase tracking-widest">Edo Allowed Palette</div>
              <div className="h-12 rounded overflow-hidden flex">
                {EDO_RESTRICTED.map((hex,i) => (
                  <div key={i} className="flex-1" style={{ background:hex }} />
                ))}
              </div>
              <div className="font-mono text-[9px] text-muted-foreground/25">Compressed to subdued tones only</div>
            </div>
          </div>
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <div className="font-mono text-[9px] text-muted-foreground/40 uppercase tracking-widest">Zoomed — 48 Browns × 5 Rows</div>
              <div className="flex-1 h-px bg-border/20" />
              <div className="font-mono text-[9px] text-amber-600/40">High-resolution perception region</div>
            </div>
            <div className="space-y-1">
              {Array.from({length:5}).map((_,row) => (
                <div key={row} className="flex gap-0.5">
                  {Array.from({length:10}).map((_,col) => {
                    const hex = EDO_RESTRICTED[row*10+col] ?? "#333";
                    return (
                      <div key={col} className="flex-1 h-7 rounded-sm relative group"
                        style={{ background:hex }}>
                        <div className="absolute inset-0 rounded-sm border border-white/0 group-hover:border-white/25 transition-all" />
                      </div>
                    );
                  })}
                </div>
              ))}
            </div>
            <p className="font-mono text-[9px] text-muted-foreground/30 italic">
              "Iki — beauty through understatement, nuance, and quiet defiance. Constraint increases perceptual resolution."
            </p>
          </div>
        </div>
      </div>

      {/* ── AETHER Coherence Connection ───────────────────────────────────── */}
      <div>
        <SectionHeader title="AETHER Coherence Connection" right="Japanese Names as X*(t) Target Vectors" />
        <p className="font-mono text-xs text-muted-foreground/40 mb-5 leading-relaxed">
          Japanese color names are not labels — they are coherence target vectors. Each name encodes
          a desired perceptual state X*(t): the exact sensory, emotional, seasonal, and temporal
          dimensions that define the color's identity. Perception converges to coherence when the
          stimulus matches the cultural memory.
        </p>

        <div className="rounded-xl border border-border/20 p-6 bg-white/2 space-y-6">
          {/* Coherence formula */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="rounded-lg border border-violet-500/20 bg-violet-500/5 p-5 space-y-4">
              <div className="font-mono text-[9px] text-violet-400/60 uppercase tracking-widest">AETHER Coherence Functional</div>
              <div className="font-mono text-lg text-foreground/80 leading-loose">
                <span style={{ color:"#bc6ff1" }}>C</span>(x,t) = 1 −
                <span className="text-muted-foreground/50"> ‖</span><span style={{ color:"#e64522" }}>E</span>
                <span className="text-muted-foreground/50">(t)‖ / ‖</span><span style={{ color:"#22c55e" }}>X*</span>
                <span className="text-muted-foreground/50">(t)‖</span>
              </div>
              <div className="space-y-1.5 font-mono text-[9px]">
                {[
                  { sym:"X*(t)", col:"#22c55e", desc:"Target perceptual state — the color as named and remembered" },
                  { sym:"E(t)",  col:"#e64522", desc:"Error — distance between actual stimulus and cultural expectation" },
                  { sym:"C→1",   col:"#bc6ff1", desc:"When physics, culture, and perception align perfectly" },
                ].map(({ sym, col, desc }) => (
                  <div key={sym} className="flex gap-3 items-start">
                    <span className="w-12 shrink-0 font-bold" style={{ color:col }}>{sym}</span>
                    <span className="text-muted-foreground/50 leading-relaxed">{desc}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-3">
              <div className="font-mono text-[9px] text-muted-foreground/40 uppercase tracking-widest">The Deep Insight</div>
              <p className="font-serif text-sm text-foreground/60 italic leading-relaxed">
                "Japanese color names ARE the X*(t) encoding. Uguisu-iro sets the target — 
                bamboo shadow + bird sound + spring morning. Any green that activates that complex 
                achieves high coherence."
              </p>
              <p className="font-serif text-sm text-foreground/40 italic leading-relaxed">
                "RGB #8a9a5b without cultural context = low coherence. Just coordinates. The name 
                transforms it from a number into a target state vector — a moment in time."
              </p>
              <div className="rounded-lg border border-border/20 p-3 font-mono text-[9px] text-muted-foreground/40">
                <span className="text-green-400/60">// Japanese color philosophy</span><br />
                <span className="text-green-400/60">// = coherence encoding system</span><br />
                <span className="text-muted-foreground/30">name = X*(t) not just a label<br />
                stimulus → name → C(x,t) → 1</span>
              </div>
            </div>
          </div>

          {/* Interactive coherence demo */}
          <div className="space-y-3">
            <div className="font-mono text-[9px] text-muted-foreground/40 uppercase tracking-widest">
              Select a Color Name — View its Target State Vector X*(t)
            </div>
            <div className="flex gap-2 flex-wrap">
              {COHERENCE_EXAMPLES.map(ce => (
                <button key={ce.id} onClick={() => setCoherenceColor(ce)}
                  className="flex items-center gap-1.5 font-mono text-[9px] px-3 py-1.5 rounded border transition-all"
                  style={{
                    borderColor: coherenceColor.id === ce.id ? `${ce.hex}60` : `${ce.hex}20`,
                    color: ce.hex,
                    background: coherenceColor.id === ce.id ? `${ce.hex}15` : `${ce.hex}05`,
                  }}>
                  <span className="w-2 h-2 rounded-full" style={{ background:ce.hex }} />
                  {ce.name}
                </button>
              ))}
            </div>

            <AnimatePresence mode="wait">
              <motion.div key={coherenceColor.id}
                initial={{ opacity:0, y:8 }} animate={{ opacity:1, y:0 }} exit={{ opacity:0 }}
                className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Vector display */}
                <div className="rounded-lg border border-border/20 bg-black/20 p-4 space-y-2">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-8 h-8 rounded-lg border"
                      style={{ background:coherenceColor.hex, borderColor:`${coherenceColor.hex}60`,
                        boxShadow:`0 0 12px ${coherenceColor.hex}40` }} />
                    <div>
                      <div className="font-mono text-xs font-bold" style={{ color:coherenceColor.hex }}>
                        {coherenceColor.name}
                      </div>
                      <div className="font-mono text-[8px] text-muted-foreground/30">Target vector X*(t)</div>
                    </div>
                  </div>
                  {coherenceColor.vector.map(({ dim, val, col }) => (
                    <div key={dim} className="flex gap-3 font-mono text-[9px]">
                      <span className="w-16 shrink-0" style={{ color:col }}>{dim}</span>
                      <span className="text-muted-foreground/50">= {val}</span>
                    </div>
                  ))}
                </div>

                {/* Coherence meter */}
                <div className="rounded-lg border border-border/20 bg-black/20 p-4 space-y-3">
                  <div className="font-mono text-[9px] text-muted-foreground/40 uppercase tracking-widest">
                    Coherence C(x,t) when name matches moment
                  </div>
                  {[
                    { label:"RGB number only",    score:0.12, desc:"Just coordinates. No cultural context." },
                    { label:"Color + category",   score:0.45, desc:"Generic green, warm, spring-adjacent." },
                    { label:"Color + season",     score:0.68, desc:"Spring green at the right time of year." },
                    { label:"Full Japanese name", score:0.97, desc:`The exact moment ${coherenceColor.name} encodes.` },
                  ].map(({ label, score, desc }) => (
                    <div key={label} className="space-y-1">
                      <div className="flex justify-between font-mono text-[8px]">
                        <span className="text-muted-foreground/50">{label}</span>
                        <span style={{ color:score > 0.8 ? coherenceColor.hex : "#64748b" }}>
                          C = {score.toFixed(2)}
                        </span>
                      </div>
                      <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                        <motion.div className="h-full rounded-full"
                          initial={{ width:0 }} animate={{ width:`${score*100}%` }}
                          transition={{ duration:0.6 }}
                          style={{ background:score > 0.8 ? coherenceColor.hex : "#334155" }} />
                      </div>
                      <div className="font-mono text-[7px] text-muted-foreground/25 italic">{desc}</div>
                    </div>
                  ))}
                </div>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* ── Indigo Aging Timeline ────────────────────────────────────────── */}
      <div>
        <SectionHeader title="Indigo Aging Timeline" right="Aizome — Color as Biography" />
        <p className="font-mono text-xs text-muted-foreground/40 mb-5 leading-relaxed">
          Indigo dye evolves through exposure. A color's transformation over time becomes the
          biography of the object. Fading is not defect — it is documentation.
        </p>
        <div className="rounded-xl border border-border/20 p-6 bg-white/2 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
            <div className="flex flex-col items-center gap-3">
              <div className="w-24 h-32 rounded-xl border-2 border-white/10 transition-all duration-300"
                style={{ background:currentIndigoColor, boxShadow:`0 0 32px ${currentIndigoColor}50` }} />
              <div className="text-center">
                <div className="font-mono text-sm font-bold" style={{ color:currentIndigoColor }}>
                  {currentIndigoStage.name}
                </div>
                <div className="font-mono text-[9px] text-muted-foreground/40">{currentIndigoStage.romaji}</div>
                <div className="font-mono text-[9px] text-muted-foreground/30 mt-1">{currentIndigoStage.age}</div>
              </div>
            </div>

            <div className="md:col-span-2 space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between font-mono text-[9px]">
                  <span className="text-muted-foreground/40">Time of wear</span>
                  <span style={{ color:currentIndigoColor }}>{currentIndigoStage.age}</span>
                </div>
                <input type="range" min="0" max="100" value={Math.round(indigoTime*100)}
                  onChange={e => setIndigoTime(+e.target.value/100)}
                  className="w-full h-1.5 accent-blue-400" />
              </div>
              <p className="font-serif text-sm text-foreground/60 italic leading-relaxed">
                "{currentIndigoStage.desc}"
              </p>
              <div className="flex gap-2 items-center">
                {INDIGO_STAGES.map((stage, i) => (
                  <div key={stage.name} className="flex items-center gap-1.5">
                    <div className="w-8 h-8 rounded-lg border border-white/10 flex-shrink-0"
                      style={{ background:stage.hex,
                        boxShadow: currentIndigoStage.name === stage.name ? `0 0 12px ${stage.hex}` : undefined,
                        outline: currentIndigoStage.name === stage.name ? `2px solid ${stage.hex}60` : undefined,
                      }} />
                    {i < INDIGO_STAGES.length-1 && (
                      <span className="font-mono text-[8px] text-muted-foreground/20">→</span>
                    )}
                  </div>
                ))}
              </div>
              <div className="font-mono text-[8px] text-muted-foreground/25 text-center">
                indigo_state(t): deep_navy → warrior_blue → japan_blue → sky → pale_translucent
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Purple Fragility Vector ──────────────────────────────────────── */}
      <div>
        <SectionHeader title="Purple as a Fragility Vector" right="Murasaki — Stability vs. Decay Dimension" />
        <p className="font-mono text-xs text-muted-foreground/40 mb-5 leading-relaxed">
          Traditional dyes degrade. Purple from the fragile Murasaki root introduces a decay dimension
          absent from modern digital color. Color(t) = Color₀ × fading_rate^t
        </p>
        <div className="rounded-xl border border-border/20 p-6 bg-white/2 grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
          <div className="flex flex-col items-center gap-5">
            <div className="relative w-32 h-40 rounded-2xl border-2 transition-all duration-300"
              style={{ background:purpleFaded, borderColor:`${purpleFaded}60`, opacity:purpleOpacity,
                boxShadow:`0 0 ${Math.round(40*(1-purpleAge))}px ${purpleHex}${Math.round(40*(1-purpleAge)).toString(16).padStart(2,"0")}` }}>
              <div className="absolute inset-0 rounded-2xl flex items-center justify-center">
                <span className="font-serif text-3xl"
                  style={{ color:`rgba(255,255,255,${Math.max(0.1,purpleOpacity*0.7)})` }}>紫</span>
              </div>
            </div>
            <div className="text-center space-y-1">
              <div className="font-mono text-xs font-bold" style={{ color:purpleFaded, opacity:purpleOpacity+0.3 }}>
                Murasaki
              </div>
              <div className="font-mono text-[9px] text-muted-foreground/40">
                Color(t) = Color₀ × {(1-purpleAge*0.8).toFixed(2)}
              </div>
            </div>
            <div className="flex gap-3">
              <button onClick={() => { setAutoAge(false); setPurpleAge(0); }}
                className="font-mono text-[9px] px-3 py-1.5 rounded border border-border/30 hover:border-violet-500/40 transition-all text-muted-foreground/50 hover:text-violet-400">
                RESET
              </button>
              <button onClick={() => setAutoAge(!autoAge)}
                className="font-mono text-[9px] px-3 py-1.5 rounded border transition-all"
                style={{ borderColor:autoAge?"#8b5e8a60":"#334155", color:autoAge?"#8b5e8a":"#64748b",
                  background:autoAge?"#8b5e8a10":"transparent" }}>
                {autoAge ? "⏸ PAUSE DECAY" : "▶ SIMULATE DECAY"}
              </button>
            </div>
          </div>

          <div className="space-y-5">
            <div className="space-y-2">
              <div className="font-mono text-[9px] text-muted-foreground/40 uppercase tracking-widest">Decay Dimension</div>
              {[
                { label:"Digital Color (stable)", progress:100, color:"#22c55e" },
                { label:"Synthetic Dye", progress:Math.round(90*(1-purpleAge*0.3)), color:"#0ea5e9" },
                { label:"Indigo (Aizome)", progress:Math.round(80*(1-purpleAge*0.5)), color:"#2a4870" },
                { label:"Murasaki (fragile)", progress:Math.round(100*(1-purpleAge*0.8)), color:purpleFaded },
              ].map(({ label, progress, color }) => (
                <div key={label}>
                  <div className="flex justify-between font-mono text-[9px] mb-1">
                    <span className="text-muted-foreground/50">{label}</span>
                    <span style={{ color }}>{progress}%</span>
                  </div>
                  <div className="h-1 bg-white/5 rounded-full overflow-hidden">
                    <div className="h-full rounded-full transition-all duration-500"
                      style={{ width:`${progress}%`, background:color }} />
                  </div>
                </div>
              ))}
            </div>
            <div className="rounded-lg border border-violet-500/20 bg-violet-500/5 p-4 space-y-2">
              <div className="font-mono text-[9px] text-violet-400/60 uppercase tracking-widest">The Hatao Phenomenon <span className="ml-2 text-yellow-400/50">~ EST</span></div>
              <p className="font-serif text-sm text-foreground/60 italic leading-relaxed">
                "A gray tone that occasionally reflects a trace of violet under certain lighting —
                a perceptual glitch. A color that exists only through subtle interactions of light and context."
              </p>
              <div className="flex gap-2 items-center">
                <div className="w-8 h-8 rounded-lg" style={{ background:"#7888a0", boxShadow:"0 0 8px #8b5e8a30" }} />
                <div className="w-8 h-8 rounded-lg" style={{ background:"#8b5e8a" }} />
                <span className="font-mono text-[9px] text-muted-foreground/30">→ gray with trace of noble purple</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Beni — Living Color ──────────────────────────────────────────── */}
      <div>
        <SectionHeader title="Beni — Living Color" right="紅花 — Safflower × Human Body Heat" />
        <p className="font-mono text-xs text-muted-foreground/40 mb-5 leading-relaxed">
          We now possess over 16 million digital colors — perfect, uniform, instantly reproducible. But Beni,
          the deep red extracted from safflower, reveals something no RGB value can contain: a living reaction
          completed only by human hands. The yellow must be removed first. The red waits beneath — activated
          by the warmth and pH of the human body.
        </p>
        <div className="rounded-xl border border-border/20 p-6 bg-white/2 space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="rounded-lg border border-green-500/15 bg-green-500/5 p-4 space-y-3">
              <div className="flex items-center justify-between">
                <div className="font-mono text-[9px] text-green-400/60 uppercase tracking-widest">Digital RGB</div>
                <span className="font-mono text-[8px] px-2 py-0.5 rounded border border-green-500/30 text-green-400/50">Perfect</span>
              </div>
              <div className="flex gap-1 flex-wrap">
                {Array.from({length:30}).map((_,i) => (
                  <div key={i} className="w-5 h-5 rounded-sm"
                    style={{ background:`hsl(${(i*53)%360},${60+((i*7)%30)}%,${40+((i*11)%30)}%)` }} />
                ))}
              </div>
              <div className="font-mono text-[9px] text-muted-foreground/40">
                16,777,216 colors · Instant · Identical · Eternal
              </div>
            </div>
            <div className="rounded-lg border border-red-500/15 bg-red-500/5 p-4 space-y-3">
              <div className="flex items-center justify-between">
                <div className="font-mono text-[9px] text-red-400/60 uppercase tracking-widest">Beni / 紅花</div>
                <span className="font-mono text-[8px] px-2 py-0.5 rounded border border-red-500/30 text-red-400/50">Living</span>
              </div>
              <div className="flex gap-1 flex-wrap">
                {Array.from({length:30}).map((_,i) => {
                  const v = ((i * 7) % 40) - 20;
                  return (
                    <div key={i} className="w-5 h-5 rounded-sm"
                      style={{ background:`hsl(${355+v/3},${65+v/2}%,${35+v/2}%)` }} />
                  );
                })}
              </div>
              <div className="font-mono text-[9px] text-muted-foreground/40">
                1 color · Seasons · Unique batch · Mortal
              </div>
            </div>
          </div>

          {/* Extraction steps */}
          <div className="space-y-4">
            <div className="font-mono text-[9px] text-muted-foreground/40 uppercase tracking-widest">
              Extraction Process — Hold to Apply Human Heat
            </div>
            <div className="flex items-center gap-0 mb-2">
              {[
                { label:"Raw Flower", color:"#d4a843" },
                { label:"Yellow Wash", color:"#e8c34a" },
                { label:"Remove Yellow", color:"#b8964a" },
                { label:"Living Reaction", color:"#c04a3a" },
                { label:"Beni", color:"#c04040" },
              ].map((phase, i) => (
                <div key={phase.label} className="flex items-center gap-0 flex-1">
                  <div className="flex flex-col items-center gap-1 flex-1">
                    <div className={`w-3 h-3 rounded-full border-2 transition-all duration-500 ${i <= beniPhase ? "border-transparent" : "border-muted-foreground/20 bg-transparent"}`}
                      style={i <= beniPhase ? { background: phase.color, boxShadow:`0 0 8px ${phase.color}` } : {}} />
                    <div className="font-mono text-[7px] text-center text-muted-foreground/30 leading-tight w-14">
                      {phase.label}
                    </div>
                  </div>
                  {i < 4 && <div className="h-px w-4 bg-border/30 mb-3 shrink-0" />}
                </div>
              ))}
            </div>

            <div className="flex gap-6 items-center">
              <div className="relative w-32 h-40 shrink-0">
                <div className="absolute inset-0 rounded-b-3xl rounded-t-lg border-2 border-border/30 overflow-hidden"
                  style={{
                    background:beniPhase===0?"#8a6a30":beniPhase===1?`hsl(45,80%,${45+beniHeat*15}%)`
                      :beniPhase===2?lerpColor("#d4a843","#6b4520",beniHeat)
                      :beniPhase===3?lerpColor("#6b4520","#c04040",beniHeat):"#c04040",
                    boxShadow:beniPhase>=3?`0 0 ${20+beniHeat*20}px #c0404060`:undefined,
                    transition:"background 0.3s, box-shadow 0.3s",
                  }}>
                  {beniHeating && (
                    <div className="absolute top-2 left-0 right-0 flex justify-around">
                      {Array.from({length:5}).map((_,i) => (
                        <motion.div key={i}
                          animate={{ y:[-2,2,-2], opacity:[0.3,0.7,0.3] }}
                          transition={{ duration:0.8+i*0.2, repeat:Infinity }}
                          className="w-1 h-1 rounded-full bg-white/30" />
                      ))}
                    </div>
                  )}
                  <div className="absolute inset-0 flex flex-col items-center justify-center gap-1">
                    <div className="font-serif text-xs text-white/60">
                      {["紅花","黄","除黄","反応","紅"][beniPhase]}
                    </div>
                    {beniPhase < 4 && (
                      <div className="font-mono text-[8px] text-white/30">
                        {beniHeating ? `${Math.round(beniHeat*100)}%` : "apply heat"}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex-1 space-y-4">
                <div className="space-y-2">
                  {[
                    { phase:0, text:"Dried safflower petals soaked in water. The visible yellow pigment dissolves first." },
                    { phase:1, text:"Yellow wash floods the bath. Golden — but this is not the color you seek." },
                    { phase:2, text:"The yellow is removed by rinsing with alkali. What remains is hidden, insoluble, waiting." },
                    { phase:3, text:"Human hands enter the bath. Body temperature and skin pH trigger the living reaction — the red awakens." },
                    { phase:4, text:"Beni — deep crimson revealed. Every batch unique to the hands that completed it. No two the same." },
                  ].map(step => (
                    <motion.div key={step.phase} animate={{ opacity:step.phase===beniPhase?1:0.2 }}
                      className="flex gap-3 items-start">
                      <div className="w-4 h-4 rounded-full border shrink-0 mt-0.5 flex items-center justify-center font-mono text-[8px]"
                        style={{
                          borderColor:step.phase<=beniPhase?"#c0404050":"#334155",
                          color:step.phase<=beniPhase?"#c04040":"#475569",
                          background:step.phase===beniPhase?"#c0404010":"transparent",
                        }}>{step.phase+1}</div>
                      <p className="font-mono text-[10px] text-muted-foreground/60 leading-relaxed">{step.text}</p>
                    </motion.div>
                  ))}
                </div>
                {beniPhase < 4 ? (
                  <div className="space-y-2">
                    {beniHeating && (
                      <div className="h-0.5 bg-white/5 rounded-full overflow-hidden">
                        <div className="h-full rounded-full transition-none"
                          style={{ width:`${beniHeat*100}%`, background:"linear-gradient(90deg,#d4a843,#c04040)" }} />
                      </div>
                    )}
                    <button onMouseDown={startHeat} onMouseUp={stopHeat}
                      onTouchStart={startHeat} onTouchEnd={stopHeat} onMouseLeave={stopHeat}
                      className="font-mono text-[9px] px-4 py-2 rounded border transition-all select-none"
                      style={{ borderColor:beniHeating?"#c0404060":"#334155",
                        color:beniHeating?"#c04040":"#64748b", background:beniHeating?"#c0404010":"transparent" }}>
                      {beniHeating ? "🌡 Applying body heat…" : "☞ Hold to apply human heat"}
                    </button>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <div className="font-mono text-[9px] px-4 py-2 rounded border border-red-500/30 bg-red-500/5 text-red-400/70">
                      ✓ Beni complete — crimson revealed by living hands
                    </div>
                    <button onClick={() => { setBeniPhase(0); setBeniHeat(0); }}
                      className="font-mono text-[9px] px-3 py-1 rounded border border-border/20 text-muted-foreground/30 hover:text-muted-foreground/50 transition-all">
                      RESET EXTRACTION
                    </button>
                  </div>
                )}
              </div>

              <div className="shrink-0 w-16 flex flex-col items-center gap-2">
                <div className="w-14 h-20 rounded-xl border transition-all duration-500"
                  style={{ background:beniPhase<4?"#2c2826":"#c04040",
                    borderColor:beniPhase<4?"#334155":"#c0404060",
                    boxShadow:beniPhase>=4?"0 0 24px #c0404050":undefined }} />
                <div className="font-mono text-[8px] text-center"
                  style={{ color:beniPhase>=4?"#c04040":"#334155" }}>
                  {beniPhase>=4?"紅\nBeni":"—"}
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2 border-t border-border/15">
            {[
              { icon:"⬛", title:"Digital", body:"A color is a number. #C04040 is the same everywhere, everywhen, for everyone. Perfect. Featureless." },
              { icon:"🌿", title:"Living Material", body:"A color is a process. Beni requires seasons, patience, and the heat of a human body to complete." },
              { icon:"⏳", title:"Unnamed Colors", body:"True beauty may lie in colors that resist naming — the shade of fading memory, the tones of light outside your window right now." },
            ].map(({ icon, title, body }) => (
              <div key={title} className="rounded-lg border border-border/15 p-4 space-y-2">
                <div className="text-lg">{icon}</div>
                <div className="font-mono text-[10px] text-muted-foreground/50 uppercase tracking-widest">{title}</div>
                <p className="font-serif text-xs text-foreground/50 italic leading-relaxed">{body}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Floral Chemistry Bridge ───────────────────────────────────────── */}
      <div>
        <SectionHeader title="Floral Chemistry Bridge" right="Volatile Vectors ≡ Color Vectors — Same Mathematical Form" />
        <p className="font-mono text-xs text-muted-foreground/40 mb-5 leading-relaxed">
          Both floral volatile bouquets and Japanese color coordinates operate on the same mathematical structure:
          multi-dimensional signal vectors matched against stored reference patterns, driving behavioral response,
          and evolving over time. The equations are equivalent.
        </p>

        <div className="rounded-xl border border-border/20 p-6 bg-white/2 space-y-8">
          {/* Side-by-side comparison */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="rounded-lg border border-green-500/15 bg-green-500/5 p-5 space-y-4">
              <div className="font-mono text-[9px] text-green-400/60 uppercase tracking-widest">
                Floral Volatile Bouquet
              </div>
              <div className="font-mono text-sm text-foreground/70 leading-loose">
                <span className="text-green-400">V⃗</span> = (v₁, v₂, ... vₙ)<br />
                <span className="text-muted-foreground/30 text-xs">normalized compound concentrations</span>
              </div>
              <div className="space-y-2 font-mono text-[9px]">
                {[
                  { k:"signal",    v:"volatile compound mix", col:"#22c55e" },
                  { k:"match",     v:"cosine_sim(V⃗_query, V⃗_ref)", col:"#22c55e" },
                  { k:"response",  v:"pollinator behavioral choice", col:"#22c55e" },
                  { k:"evolution", v:"scent loss in Mimulus over 50 gen.", col:"#22c55e" },
                  { k:"measure",   v:"electroantennogram (EAG)", col:"#22c55e" },
                ].map(({ k, v, col }) => (
                  <div key={k} className="flex gap-2">
                    <span className="w-20 shrink-0" style={{ color:col }}>{k}</span>
                    <span className="text-muted-foreground/50">{v}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-lg border border-violet-500/15 bg-violet-500/5 p-5 space-y-4">
              <div className="font-mono text-[9px] text-violet-400/60 uppercase tracking-widest">
                Japanese Color Space
              </div>
              <div className="font-mono text-sm text-foreground/70 leading-loose">
                <span className="text-violet-400">C⃗</span> = (λ, season, material, emotion, t)<br />
                <span className="text-muted-foreground/30 text-xs">perceptual coordinates</span>
              </div>
              <div className="space-y-2 font-mono text-[9px]">
                {[
                  { k:"signal",    v:"cultural color name vector", col:"#a78bfa" },
                  { k:"match",     v:"cosine_sim(C⃗_stimulus, C⃗_memory)", col:"#a78bfa" },
                  { k:"response",  v:"aesthetic recognition / coherence", col:"#a78bfa" },
                  { k:"evolution", v:"Murasaki dye fading over decades", col:"#a78bfa" },
                  { k:"measure",   v:"neural response / cultural tagging", col:"#a78bfa" },
                ].map(({ k, v, col }) => (
                  <div key={k} className="flex gap-2">
                    <span className="w-20 shrink-0" style={{ color:col }}>{k}</span>
                    <span className="text-muted-foreground/50">{v}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Equivalence proof */}
          <div className="rounded-lg border border-border/20 p-5 space-y-4">
            <div className="font-mono text-[9px] text-muted-foreground/40 uppercase tracking-widest">
              The Coherence Bridge — Equivalent C(x,t) → 0 Trajectories
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
              <div className="space-y-2">
                <div className="font-mono text-[9px] text-green-400/70">Mimulus cardinalis</div>
                <div className="rounded-lg border border-green-500/20 bg-green-500/5 p-3 space-y-1">
                  <div className="font-mono text-[8px] text-muted-foreground/50">Floral scent loss</div>
                  <div className="font-mono text-[10px] text-green-400">C(x,t) → 0</div>
                  <div className="font-mono text-[8px] text-muted-foreground/30">evolutionary time</div>
                  <div className="font-mono text-[8px] text-muted-foreground/30">~50 generations</div>
                  <div className="h-1 bg-white/5 rounded-full mt-2">
                    <div className="h-full rounded-full" style={{ width:"15%", background:"#22c55e" }} />
                  </div>
                </div>
              </div>

              <div className="flex flex-col items-center gap-2">
                <div className="font-mono text-xl text-muted-foreground/20">≡</div>
                <div className="rounded-lg border border-border/20 p-3 space-y-2 w-full">
                  <div className="font-mono text-[9px] text-muted-foreground/40 text-center">Same functional form</div>
                  <div className="font-mono text-[10px] text-foreground/50 text-center leading-relaxed">
                    C(x,t) = 1 −<br />
                    ‖signal(t)‖ / ‖signal(0)‖
                  </div>
                  <div className="font-mono text-[8px] text-muted-foreground/30 text-center">
                    Both: coherence decays over time
                  </div>
                </div>
                <button onClick={() => setFloralPulse(!floralPulse)}
                  className="font-mono text-[9px] px-3 py-1 rounded border border-border/20 text-muted-foreground/30 hover:text-muted-foreground/60 transition-all">
                  {floralPulse ? "⏸ PAUSE" : "▶ PULSE"}
                </button>
              </div>

              <div className="space-y-2">
                <div className="font-mono text-[9px] text-violet-400/70">Murasaki (紫)</div>
                <div className="rounded-lg border border-violet-500/20 bg-violet-500/5 p-3 space-y-1">
                  <div className="font-mono text-[8px] text-muted-foreground/50">Dye fragility decay</div>
                  <div className="font-mono text-[10px] text-violet-400">C(x,t) → 0</div>
                  <div className="font-mono text-[8px] text-muted-foreground/30">material time</div>
                  <div className="font-mono text-[8px] text-muted-foreground/30">~decades of wear</div>
                  <div className="h-1 bg-white/5 rounded-full mt-2">
                    <div className="h-full rounded-full" style={{ width:`${Math.max(15, 100-purpleAge*85)}%`, background:"#8b5e8a" }} />
                  </div>
                </div>
              </div>
            </div>

            <div className="rounded-lg border border-amber-500/15 bg-amber-500/5 p-4 space-y-1">
              <div className="font-mono text-[9px] text-amber-500/60 uppercase tracking-widest">AETHER Hypothesis <span className="text-orange-400/50">HYP</span></div>
              <p className="font-serif text-sm text-foreground/60 italic leading-relaxed">
                "Floral volatile loss in Mimulus cardinalis and the fading of Murasaki dye are
                mathematically equivalent events. Both are C(x,t) → 0 trajectories. One happens in
                evolutionary time over 50 generations. The other happens in material time over decades.
                Same functional form."
              </p>
            </div>
          </div>

          {/* Epistemic summary */}
          <div className="grid grid-cols-3 gap-4">
            {[
              { status:"DOC" as EpistemicStatus, label:"Documented", items:["Japanese color history", "Kasane layering physics", "Aizome fermentation biology", "Murasaki root fragility", "Beni safflower extraction", "Mimulus EAG data (Byers 2014)"] },
              { status:"EST" as EpistemicStatus, label:"Estimated", items:["Hatao as perception glitch", "Exact Edo palette count", "Indigo aging hex values", "Coherence score mapping"] },
              { status:"HYP" as EpistemicStatus, label:"AETHER Hypothesis", items:["Japanese names as X*(t) vectors", "Floral ↔ color C(x,t) equivalence", "Culture as programmable perception", "Color cosmology as unified manifold"] },
            ].map(({ status, label, items }) => (
              <div key={status} className="rounded-lg border p-4 space-y-3"
                style={{ borderColor:`${EPISTEMIC_COLORS[status]}20`, background:`${EPISTEMIC_COLORS[status]}05` }}>
                <div className="flex items-center gap-2">
                  <span className="font-mono text-[8px] px-2 py-0.5 rounded border"
                    style={{ borderColor:`${EPISTEMIC_COLORS[status]}40`, color:EPISTEMIC_COLORS[status] }}>
                    {status}
                  </span>
                  <span className="font-mono text-[9px] text-muted-foreground/50">{label}</span>
                </div>
                <ul className="space-y-1">
                  {items.map(item => (
                    <li key={item} className="font-mono text-[8px] text-muted-foreground/40 flex gap-1.5">
                      <span style={{ color:EPISTEMIC_COLORS[status] }}>·</span>
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Perception Stack ─────────────────────────────────────────────── */}
      <div>
        <SectionHeader title="The Full Perception Stack" right="Layer VII in context" />
        <div className="max-w-sm mx-auto space-y-1">
          {[
            { label:"λ Wavelength",   col:"#e8a824", desc:"Physical radiation — 380–730nm" },
            { label:"↓ Biology",       col:"#22c55e", desc:"S/M/L cone trichromacy" },
            { label:"↓ Neural",        col:"#f97316", desc:"Opponent channel encoding" },
            { label:"↓ Perceptual",    col:"#0ea5e9", desc:"LAB / OKLab geometry" },
            { label:"↓ Psychology",    col:"#eab308", desc:"Weber–Fechner, adaptation" },
            { label:"↓ Culture",       col:"#e64522", desc:"Naming + symbol ← Layer VII" },
            { label:"↓ Context",       col:"#a78bfa", desc:"Lighting, contrast, surrounds" },
            { label:"↓ Memory / t",    col:"#bc6ff1", desc:"Decay, biography, aging" },
            { label:"= Perception C",  col:"#bc6ff1", desc:"The full equation converges" },
          ].map((step, i) => (
            <motion.div key={step.label}
              initial={{ opacity:0, x:-16 }} animate={{ opacity:1, x:0 }}
              transition={{ delay: i*0.04 }}
              className="flex items-center gap-4 rounded-lg border px-4 py-2.5"
              style={{
                borderColor: `${step.col}25`,
                background: `${step.col}06`,
                boxShadow: step.label.includes("Culture") ? `0 0 20px ${step.col}20` : undefined,
              }}>
              <div className="font-mono text-sm font-bold w-28 shrink-0" style={{ color:step.col }}>
                {step.label}
              </div>
              <div className="font-mono text-[10px] text-muted-foreground/50">{step.desc}</div>
              {step.label.includes("Culture") && (
                <span className="ml-auto font-mono text-[8px] px-2 py-0.5 rounded border border-red-500/40 text-red-400/70 shrink-0">
                  LAYER VII
                </span>
              )}
            </motion.div>
          ))}
        </div>
      </div>

      {/* ── Closing ──────────────────────────────────────────────────────── */}
      <div className="rounded-xl border border-border/20 p-8 text-center space-y-4"
        style={{ background:"linear-gradient(135deg, #0e0b1d, #0d1117)" }}>
        <div className="font-mono text-[9px] tracking-[0.4em] mb-2" style={{ color:"#bc6ff150" }}>
          BEYOND PERFECT COLOR
        </div>
        <p className="font-serif text-base text-foreground/50 italic max-w-2xl mx-auto leading-relaxed">
          "True beauty lies not in perfect, digital shades, but in those that are unnamed:
          the color of fading memory, or the fleeting colors outside your window right now."
        </p>
        <p className="font-serif text-sm text-foreground/30 italic">
          "These colors exist not in wavelengths, but in the relationship between perception, time, and experience."
        </p>
        {/* Final equation */}
        <div className="flex items-center justify-center gap-2 font-mono text-sm pt-2">
          <span style={{ color:"#bc6ff1" }}>C</span>
          <span className="text-muted-foreground/30">= f(</span>
          <span style={{ color:"#e8a824" }}>λ</span>
          <span className="text-muted-foreground/30">,</span>
          <span style={{ color:"#22c55e" }}>bio</span>
          <span className="text-muted-foreground/30">,</span>
          <span style={{ color:"#f97316" }}>cog</span>
          <span className="text-muted-foreground/30">,</span>
          <span style={{ color:"#e64522" }}>culture</span>
          <span className="text-muted-foreground/30">,</span>
          <span style={{ color:"#a78bfa" }}>context</span>
          <span className="text-muted-foreground/30">,</span>
          <span style={{ color:"#bc6ff1" }}>t</span>
          <span className="text-muted-foreground/30">)</span>
        </div>
        <div className="font-mono text-[9px] text-muted-foreground/15 mt-2">
          AETHER Layer VII — Cultural Perception Geometry · v2.0
        </div>
      </div>

      <div className="h-8" />
    </div>
  );
}
