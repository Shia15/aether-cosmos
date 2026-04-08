import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";

// ─── Japanese color vocabulary ────────────────────────────────────────────────

interface JColor {
  id: string;
  name: string;
  romaji: string;
  hex: string;
  season: "spring" | "summer" | "autumn" | "winter" | "timeless";
  material: "silk" | "dye" | "paper" | "wood" | "stone";
  emotion: string;
  meaning: string;
  sx: number; sy: number; // position in the space 0-1
}

const COLORS: JColor[] = [
  { id:"uguisu",    name:"鶯色",   romaji:"Uguisu-iro",  hex:"#8a9a56", season:"spring",  material:"wood",  emotion:"stillness",   meaning:"The muted green of a bush warbler hiding within bamboo shadows. Inseparable from bird-call and early spring forest.",                   sx:0.25, sy:0.15 },
  { id:"moegi",     name:"萌黄色", romaji:"Moegi-iro",   hex:"#89c074", season:"spring",  material:"paper", emotion:"emergence",   meaning:"Sprout yellow-green — the precise moment new life pushes through soil. Captures emergence, not a static pigment.",                 sx:0.35, sy:0.22 },
  { id:"tokiwa",    name:"常磐色", romaji:"Tokiwa-iro",  hex:"#1e5631", season:"timeless",material:"wood",  emotion:"permanence",  meaning:"Deep evergreen referencing trees that remain unchanged even beneath winter snow. Symbol of endurance.",                         sx:0.20, sy:0.60 },
  { id:"sakura-nezu",name:"桜鼠", romaji:"Sakura Nezu", hex:"#c8a0ae", season:"spring",  material:"silk",  emotion:"echo",        meaning:"A gray infused with the faint memory of cherry blossom pink. The color feels like the echo of spring rather than its full expression.",sx:0.60, sy:0.18 },
  { id:"baicha",    name:"梅茶",   romaji:"Baicha",      hex:"#9b7a55", season:"autumn",  material:"wood",  emotion:"restraint",   meaning:"A refined earthy brown. Under Edo restrictions, such tones communicated elegance through restraint rather than display.",           sx:0.55, sy:0.55 },
  { id:"nasukon",   name:"茄子紺", romaji:"Nasukon",     hex:"#1b1d6e", season:"summer",  material:"dye",   emotion:"depth",       meaning:"A deep dark indigo at the beginning of the dye's life. Worn by warriors for its strength and groundedness.",                     sx:0.72, sy:0.75 },
  { id:"kachiro",   name:"褐色",   romaji:"Kachiro",     hex:"#1e4d8c", season:"summer",  material:"dye",   emotion:"vitality",    meaning:"Strong indigo historically associated with victory. Worn by warriors entering battle.",                                        sx:0.62, sy:0.72 },
  { id:"kame",      name:"甕覗",   romaji:"Kame no i",   hex:"#a8c5da", season:"timeless",material:"dye",   emotion:"tranquility", meaning:"A pale, nearly translucent blue achieved only after years of wear and exposure. A color of accumulated time.",                    sx:0.50, sy:0.30 },
  { id:"murasaki",  name:"紫",     romaji:"Murasaki",    hex:"#7b3d8b", season:"timeless",material:"dye",   emotion:"fragility",   meaning:"Purple dyed from the fragile Murasaki root. Its prestige emerged from scarcity and vulnerability — the highest rank.",            sx:0.78, sy:0.38 },
  { id:"hatao",     name:"羽多衣", romaji:"Hatao",        hex:"#847a8c", season:"timeless",material:"silk",  emotion:"ambiguity",   meaning:"A gray that occasionally reflects a trace of violet under certain lighting. A perceptual glitch — a color that appears only through subtle interaction.", sx:0.68, sy:0.48 },
  { id:"yamabuki",  name:"山吹色", romaji:"Yamabuki-iro",hex:"#e8a824", season:"autumn",  material:"paper", emotion:"brightness",  meaning:"The vivid yellow of the Japanese kerria flower in late spring and autumn. Associated with brilliance and clarity.",                sx:0.45, sy:0.38 },
  { id:"momiji",    name:"紅葉色", romaji:"Momiji-iro",  hex:"#c0392b", season:"autumn",  material:"wood",  emotion:"transience",  meaning:"The burning red of maple leaves. Deeply connected to the Japanese awareness of impermanence and seasonal passage.",              sx:0.35, sy:0.72 },
  { id:"ai",        name:"藍色",   romaji:"Ai-iro",      hex:"#2e5e93", season:"summer",  material:"dye",   emotion:"clarity",     meaning:"Pure indigo — the foundational Japanese blue. Produced through living fermentation, it evolves with the cloth as it ages.",       sx:0.55, sy:0.65 },
  { id:"yukishiro", name:"雪白",   romaji:"Yukishiro",   hex:"#f0ede6", season:"winter",  material:"silk",  emotion:"absence",     meaning:"Snow white — the color of silence. Carries an absence that feels full rather than empty.",                                     sx:0.22, sy:0.35 },
  { id:"sumi",      name:"墨色",   romaji:"Sumi-iro",    hex:"#2c2a28", season:"winter",  material:"paper", emotion:"focus",       meaning:"Ink black. The foundation of Japanese visual language — a tone that contains entire landscapes within a single brushstroke.",    sx:0.80, sy:0.85 },
];

const SEASON_COLORS = { spring:"#89c074", summer:"#2e5e93", autumn:"#c0392b", winter:"#a0aec0", timeless:"#a78bfa" };
const MATERIAL_COLORS = { silk:"#f9a8d4", dye:"#818cf8", paper:"#fcd34d", wood:"#92400e", stone:"#9ca3af" };

// ─── Kasane fabric colors ────────────────────────────────────────────────────

const FABRIC_OPTIONS = [
  { id:"white",  name:"White Silk",  hex:"#f8f4ed" },
  { id:"red",    name:"Red Silk",    hex:"#c0392b" },
  { id:"indigo", name:"Indigo Silk", hex:"#1b1d6e" },
  { id:"green",  name:"Green Silk",  hex:"#1e5631" },
  { id:"gold",   name:"Gold Silk",   hex:"#d4a017" },
  { id:"purple", name:"Purple Silk", hex:"#7b3d8b" },
];

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

// ─── Indigo stages ────────────────────────────────────────────────────────────

const INDIGO_STAGES = [
  { name:"Nasukon", romaji:"茄子紺", hex:"#1b1d6e", age:"New — 0 years", desc:"Deep dark indigo at the beginning of the dye's life." },
  { name:"Kachiro",  romaji:"褐色",   hex:"#1e4d8c", age:"~5 years",     desc:"Strong indigo historically associated with victory, worn by warriors." },
  { name:"Ai-iro",   romaji:"藍色",   hex:"#2e5e93", age:"~15 years",    desc:"Pure indigo — the characteristic Japan Blue at mid-life." },
  { name:"Hanada",   romaji:"縹色",   hex:"#5b8db5", age:"~30 years",    desc:"A lightened, sky-like blue as the dye opens to air." },
  { name:"Kame no i",romaji:"甕覗",   hex:"#a8c5da", age:"~50+ years",   desc:"Pale translucent blue achieved only after decades of wear — a record of time." },
];

function lerpColor(a: string, b: string, t: number): string {
  const [r1,g1,b1] = hexToRgb(a);
  const [r2,g2,b2] = hexToRgb(b);
  return `rgb(${Math.round(r1+t*(r2-r1))},${Math.round(g1+t*(g2-g1))},${Math.round(b1+t*(b2-b1))})`;
}
function indigoAtTime(t: number): string {
  // t: 0 → 1 across all stages
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
  const [selectedColor, setSelectedColor] = useState<JColor | null>(null);
  const [seasonFilter, setSeasonFilter] = useState<string>("all");
  const [layer1, setLayer1] = useState(FABRIC_OPTIONS[0]);
  const [layer2, setLayer2] = useState(FABRIC_OPTIONS[1]);
  const [opacity, setOpacity] = useState(0.6);
  const [indigoTime, setIndigoTime] = useState(0);
  const [purpleAge, setPurpleAge] = useState(0);
  const [autoAge, setAutoAge] = useState(false);
  const ageRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Purple live decay
  useEffect(() => {
    if (autoAge) {
      ageRef.current = setInterval(() => setPurpleAge(a => Math.min(1, a + 0.003)), 80);
    } else {
      if (ageRef.current) clearInterval(ageRef.current);
    }
    return () => { if (ageRef.current) clearInterval(ageRef.current); };
  }, [autoAge]);

  const purpleHex = "#7b3d8b";
  const purpleFaded = lerpColor(purpleHex, "#4a4050", purpleAge);
  const purpleOpacity = Math.max(0.1, 1 - purpleAge * 0.8);

  const mixedColor = opticalMix(layer1.hex, layer2.hex, opacity);
  const currentIndigoStage = indigoStageAt(indigoTime);
  const currentIndigoColor = indigoAtTime(indigoTime);

  const filteredColors = seasonFilter === "all" ? COLORS : COLORS.filter(c => c.season === seasonFilter);

  return (
    <div className="h-full overflow-y-auto px-8 py-8 space-y-16">

      {/* ── Header ─────────────────────────────────────────────────────── */}
      <div className="flex items-start justify-between gap-8">
        <div className="space-y-4">
          <div className="flex items-center gap-3">
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
        </div>
        {/* Perception equation */}
        <div className="shrink-0 rounded-xl border border-border/30 p-5 space-y-2 bg-white/2 min-w-[220px]">
          <div className="font-mono text-[9px] text-muted-foreground/40 uppercase tracking-widest">Perception Function</div>
          <div className="font-mono text-sm text-foreground/80 leading-loose">
            <span style={{ color:"#bc6ff1" }}>C</span> = f(
            <span style={{ color:"#0ea5e9" }}>λ</span>,&nbsp;
            <span style={{ color:"#22c55e" }}>bio</span>,&nbsp;
            <span style={{ color:"#f97316" }}>cog</span>,&nbsp;
            <span style={{ color:"#e64522" }}>culture</span>,&nbsp;
            <span style={{ color:"#a78bfa" }}>t</span>)
          </div>
          <div className="space-y-0.5">
            {[
              { sym:"λ",       col:"#0ea5e9", desc:"wavelength physics" },
              { sym:"bio",     col:"#22c55e", desc:"cone receptors" },
              { sym:"cog",     col:"#f97316", desc:"neural encoding" },
              { sym:"culture", col:"#e64522", desc:"naming + symbol" },
              { sym:"t",       col:"#a78bfa", desc:"time / memory" },
            ].map(({ sym, col, desc }) => (
              <div key={sym} className="flex items-center gap-2 font-mono text-[9px]">
                <span style={{ color: col }} className="w-12">{sym}</span>
                <span className="text-muted-foreground/40">{desc}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Japanese Color Space ──────────────────────────────────────────── */}
      <div>
        <div className="font-mono text-xs text-muted-foreground tracking-widest uppercase mb-2 flex items-center gap-3">
          <span>Color Space</span>
          <span className="flex-1 h-px bg-border" />
          <span className="text-muted-foreground/40">Season × Material × Emotion</span>
        </div>
        <p className="font-mono text-xs text-muted-foreground/40 mb-5">
          Colors cluster by moments in nature, not numerical hue. Click any node to reveal its memory.
        </p>

        {/* Season filter */}
        <div className="flex gap-2 mb-4 flex-wrap">
          {["all","spring","summer","autumn","winter","timeless"].map(s => (
            <button key={s} onClick={() => setSeasonFilter(s)}
              className="font-mono text-[9px] px-3 py-1 rounded border transition-all"
              style={{
                borderColor: seasonFilter === s ? (SEASON_COLORS[s as keyof typeof SEASON_COLORS] ?? "#bc6ff1") : "#334155",
                color: seasonFilter === s ? (SEASON_COLORS[s as keyof typeof SEASON_COLORS] ?? "#bc6ff1") : "#64748b",
                background: seasonFilter === s ? `${SEASON_COLORS[s as keyof typeof SEASON_COLORS] ?? "#bc6ff1"}15` : "transparent",
              }}>
              {s.toUpperCase()}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
          {/* SVG color space */}
          <div className="lg:col-span-3 relative rounded-xl border border-border/20 overflow-hidden"
            style={{ background:"radial-gradient(ellipse at 20% 80%, #1b1d6e08 0%, transparent 60%), radial-gradient(ellipse at 80% 20%, #7b3d8b08 0%, transparent 60%), #0d1117" }}>

            {/* Axis labels */}
            <div className="absolute top-3 left-1/2 -translate-x-1/2 font-mono text-[8px] text-muted-foreground/25 tracking-widest">
              EMOTIONAL RESONANCE ↑
            </div>
            <div className="absolute bottom-3 right-4 font-mono text-[8px] text-muted-foreground/25 tracking-widest">
              → MATERIAL INTERACTION
            </div>
            <div className="absolute bottom-10 left-4 font-mono text-[8px] text-muted-foreground/25 tracking-widest"
              style={{ writingMode:"vertical-rl", transform:"rotate(180deg)" }}>
              SEASONALITY ↑
            </div>

            <svg viewBox="0 0 400 320" className="w-full" style={{ maxHeight:320 }}>
              {/* Axis lines */}
              <line x1="30" y1="290" x2="380" y2="290" stroke="#1e293b" strokeWidth="0.5" />
              <line x1="30" y1="290" x2="30" y2="20" stroke="#1e293b" strokeWidth="0.5" />

              {/* Color nodes */}
              {filteredColors.map(c => {
                const cx = 30 + c.sx * 350;
                const cy = 290 - c.sy * 270;
                const isSelected = selectedColor?.id === c.id;
                return (
                  <g key={c.id} onClick={() => setSelectedColor(isSelected ? null : c)} style={{ cursor:"pointer" }}>
                    <circle cx={cx} cy={cy} r={isSelected ? 14 : 9}
                      fill={c.hex}
                      opacity={isSelected ? 1 : 0.75}
                      style={{ transition:"all 0.2s", filter: isSelected ? `drop-shadow(0 0 8px ${c.hex})` : undefined }}
                    />
                    <circle cx={cx} cy={cy} r={isSelected ? 20 : 13}
                      fill="none" stroke={c.hex} strokeWidth="0.6"
                      opacity={isSelected ? 0.5 : 0.15}
                    />
                    <text x={cx} y={cy + (isSelected ? 30 : 22)}
                      textAnchor="middle" fill={c.hex} fontSize="6.5" fontFamily="serif"
                      opacity={isSelected ? 1 : 0.6} style={{ userSelect:"none" }}>
                      {c.romaji.split("-")[0]}
                    </text>
                  </g>
                );
              })}

              {/* Season bands */}
              <text x="10" y="60" fill="#89c074" fontSize="7" fontFamily="monospace" opacity="0.3">Spring</text>
              <text x="10" y="130" fill="#2e5e93" fontSize="7" fontFamily="monospace" opacity="0.3">Summer</text>
              <text x="10" y="200" fill="#c0392b" fontSize="7" fontFamily="monospace" opacity="0.3">Autumn</text>
              <text x="10" y="270" fill="#a0aec0" fontSize="7" fontFamily="monospace" opacity="0.3">Winter</text>
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
                      { label: selectedColor.season, color: SEASON_COLORS[selectedColor.season] },
                      { label: selectedColor.material, color: MATERIAL_COLORS[selectedColor.material] },
                      { label: selectedColor.emotion, color: selectedColor.hex },
                    ].map(({ label, color }) => (
                      <span key={label} className="font-mono text-[8px] px-2 py-0.5 rounded border"
                        style={{ borderColor:`${color}40`, color, background:`${color}10` }}>
                        {label}
                      </span>
                    ))}
                  </div>

                  <p className="font-serif text-sm text-foreground/65 leading-relaxed italic">
                    "{selectedColor.meaning}"
                  </p>
                </motion.div>
              ) : (
                <motion.div key="empty" initial={{ opacity:0 }} animate={{ opacity:1 }}
                  className="rounded-xl border border-border/20 h-full flex flex-col items-center justify-center p-8 text-center space-y-3"
                  style={{ background:"#0d1117" }}>
                  <div className="font-serif text-3xl text-muted-foreground/10">色</div>
                  <div className="font-mono text-[9px] text-muted-foreground/30 tracking-widest uppercase">
                    Select a color to reveal its memory
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Color legend row */}
        <div className="mt-4 flex flex-wrap gap-2">
          {filteredColors.map(c => (
            <button key={c.id} onClick={() => setSelectedColor(selectedColor?.id === c.id ? null : c)}
              className="flex items-center gap-1.5 rounded px-2 py-1 border transition-all"
              style={{
                borderColor: selectedColor?.id === c.id ? `${c.hex}60` : `${c.hex}20`,
                background: selectedColor?.id === c.id ? `${c.hex}12` : `${c.hex}05`,
              }}>
              <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background:c.hex }} />
              <span className="font-mono text-[9px]" style={{ color:c.hex }}>{c.romaji}</span>
            </button>
          ))}
        </div>
      </div>

      {/* ── Kasane Layering Simulator ────────────────────────────────────── */}
      <div>
        <div className="font-mono text-xs text-muted-foreground tracking-widest uppercase mb-2 flex items-center gap-3">
          <span>Kasane Layering Algorithm</span>
          <span className="flex-1 h-px bg-border" />
          <span className="text-muted-foreground/40">Optical Design — Pre-Digital Compositing</span>
        </div>
        <p className="font-mono text-xs text-muted-foreground/40 mb-5 leading-relaxed">
          Centuries before digital color theory, Japanese clothing designers layered fabrics to create
          color through light interaction rather than pigment blending. The air between layers acts
          as an optical filter, dynamically altering perceived color.
        </p>

        <div className="rounded-xl border border-border/20 p-6 bg-white/2">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-center">
            {/* Layer 1 picker */}
            <div className="space-y-3">
              <div className="font-mono text-[10px] text-muted-foreground/40 uppercase tracking-widest">Layer 1 (Base)</div>
              <div className="w-full h-20 rounded-lg border border-border/30"
                style={{ background:layer1.hex, boxShadow:`0 0 24px ${layer1.hex}30` }} />
              <div className="grid grid-cols-3 gap-1.5">
                {FABRIC_OPTIONS.map(f => (
                  <button key={f.id} onClick={() => setLayer1(f)}
                    className="h-8 rounded border-2 transition-all"
                    style={{
                      background:f.hex,
                      borderColor: layer1.id === f.id ? "#ffffff40" : "transparent",
                      boxShadow: layer1.id === f.id ? `0 0 8px ${f.hex}60` : undefined,
                    }}
                    title={f.name} />
                ))}
              </div>
              <div className="font-mono text-[9px]" style={{ color:layer1.hex }}>{layer1.name}</div>
            </div>

            {/* Blend result */}
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
                optical_mix(layer₁, layer₂, transparency={Math.round(opacity*100)/100})
              </div>
            </div>

            {/* Layer 2 picker */}
            <div className="space-y-3">
              <div className="font-mono text-[10px] text-muted-foreground/40 uppercase tracking-widest">Layer 2 (Over)</div>
              <div className="w-full h-20 rounded-lg border border-border/30"
                style={{ background:layer2.hex, boxShadow:`0 0 24px ${layer2.hex}30` }} />
              <div className="grid grid-cols-3 gap-1.5">
                {FABRIC_OPTIONS.map(f => (
                  <button key={f.id} onClick={() => setLayer2(f)}
                    className="h-8 rounded border-2 transition-all"
                    style={{
                      background:f.hex,
                      borderColor: layer2.id === f.id ? "#ffffff40" : "transparent",
                      boxShadow: layer2.id === f.id ? `0 0 8px ${f.hex}60` : undefined,
                    }}
                    title={f.name} />
                ))}
              </div>
              <div className="font-mono text-[9px]" style={{ color:layer2.hex }}>{layer2.name}</div>
            </div>
          </div>

          {/* Code snippet */}
          <div className="mt-6 rounded-lg bg-black/30 border border-border/20 p-4 font-mono text-[10px] text-muted-foreground/50 leading-relaxed">
            <span className="text-violet-400/60">color</span> = optical_mix(<br />
            &nbsp;&nbsp;<span style={{ color:layer1.hex }}>"{layer1.name.toLowerCase()}"</span>,<br />
            &nbsp;&nbsp;<span style={{ color:layer2.hex }}>"{layer2.name.toLowerCase()}"</span>,<br />
            &nbsp;&nbsp;transparency=<span className="text-amber-400/60">{Math.round(opacity*100)/100}</span><br />
            ) → <span style={{ color:mixedColor }}>{mixedColor}</span>
          </div>
        </div>
      </div>

      {/* ── Edo Palette Compression ──────────────────────────────────────── */}
      <div>
        <div className="font-mono text-xs text-muted-foreground tracking-widest uppercase mb-2 flex items-center gap-3">
          <span>Edo Palette Compression</span>
          <span className="flex-1 h-px bg-border" />
          <span className="text-muted-foreground/40">Restricted Manifold — Fractal Resolution</span>
        </div>
        <p className="font-mono text-xs text-muted-foreground/40 mb-5 leading-relaxed">
          Sumptuary laws compressed the visible palette. Within this limited region, artisans expanded
          perception by creating extremely fine distinctions — 48 browns, 100 grays. High resolution
          in small areas, similar to zooming into a fractal.
        </p>

        <div className="rounded-xl border border-border/20 p-6 bg-white/2 space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Full palette hint */}
            <div className="space-y-2">
              <div className="font-mono text-[9px] text-muted-foreground/40 uppercase tracking-widest">Full Color Universe</div>
              <div className="h-12 rounded overflow-hidden flex">
                {Array.from({length:60}).map((_,i) => (
                  <div key={i} className="flex-1"
                    style={{ background:`hsl(${i*6},70%,50%)` }} />
                ))}
              </div>
              <div className="font-mono text-[9px] text-muted-foreground/25">██████████████████ All hues accessible</div>
            </div>

            {/* Edo restricted */}
            <div className="space-y-2">
              <div className="font-mono text-[9px] text-muted-foreground/40 uppercase tracking-widest">Edo Period Allowed Palette</div>
              <div className="h-12 rounded overflow-hidden flex">
                {EDO_RESTRICTED.map((hex,i) => (
                  <div key={i} className="flex-1" style={{ background:hex }} />
                ))}
              </div>
              <div className="font-mono text-[9px] text-muted-foreground/25">██░░░░░░░░░░░░░░░ Compressed to subdued tones</div>
            </div>
          </div>

          {/* Zoomed-in fractal region */}
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <div className="font-mono text-[9px] text-muted-foreground/40 uppercase tracking-widest">Zoomed — 48 Browns × 10 Rows</div>
              <div className="flex-1 h-px bg-border/20" />
              <div className="font-mono text-[9px] text-amber-600/40">High-resolution perception region</div>
            </div>
            <div className="space-y-1">
              {Array.from({length:5}).map((_,row) => (
                <div key={row} className="flex gap-0.5">
                  {Array.from({length:EDO_RESTRICTED.length/5}).map((_,col) => {
                    const hex = EDO_RESTRICTED[row*10+col] ?? "#333";
                    return (
                      <div key={col} className="flex-1 h-6 rounded-sm relative group"
                        style={{ background:hex }}>
                        <div className="absolute inset-0 rounded-sm border border-white/0 group-hover:border-white/20 transition-all" />
                      </div>
                    );
                  })}
                </div>
              ))}
            </div>
            <p className="font-mono text-[9px] text-muted-foreground/30 italic">
              "Iki — beauty through understatement, nuance, and quiet defiance. Subtlety became sophistication."
            </p>
          </div>
        </div>
      </div>

      {/* ── Indigo Aging Timeline ────────────────────────────────────────── */}
      <div>
        <div className="font-mono text-xs text-muted-foreground tracking-widest uppercase mb-2 flex items-center gap-3">
          <span>Indigo Aging Timeline</span>
          <span className="flex-1 h-px bg-border" />
          <span className="text-muted-foreground/40">Aizome — Color as Biography</span>
        </div>
        <p className="font-mono text-xs text-muted-foreground/40 mb-5 leading-relaxed">
          Indigo dye evolves through exposure. A color's transformation over time becomes the
          biography of the object. Drag the slider to simulate decades of wear.
        </p>

        <div className="rounded-xl border border-border/20 p-6 bg-white/2 space-y-6">
          {/* Main aging display */}
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

              {/* Stage color progression */}
              <div className="flex gap-2 items-center">
                {INDIGO_STAGES.map((stage, i) => (
                  <div key={stage.name} className="flex items-center gap-1.5">
                    <div className="w-8 h-8 rounded-lg border border-white/10 flex-shrink-0"
                      style={{ background:stage.hex,
                        boxShadow: indigoStageAt(indigoTime).name === stage.name ? `0 0 12px ${stage.hex}` : undefined,
                        outline: indigoStageAt(indigoTime).name === stage.name ? `2px solid ${stage.hex}60` : undefined,
                      }} />
                    {i < INDIGO_STAGES.length-1 && (
                      <span className="font-mono text-[8px] text-muted-foreground/20">→</span>
                    )}
                  </div>
                ))}
              </div>
              <div className="font-mono text-[8px] text-muted-foreground/25 text-center">
                indigo_state(t) = deep_navy → warrior_blue → japan_blue → sky → pale_translucent
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Purple Fragility Vector ──────────────────────────────────────── */}
      <div>
        <div className="font-mono text-xs text-muted-foreground tracking-widest uppercase mb-2 flex items-center gap-3">
          <span>Purple as a Fragility Vector</span>
          <span className="flex-1 h-px bg-border" />
          <span className="text-muted-foreground/40">Murasaki — Stability vs. Decay Dimension</span>
        </div>
        <p className="font-mono text-xs text-muted-foreground/40 mb-5 leading-relaxed">
          Traditional dyes degrade. Purple dyed from the fragile Murasaki root introduces a decay
          dimension absent from modern digital color. A new axis: stability vs. fragility.
        </p>

        <div className="rounded-xl border border-border/20 p-6 bg-white/2 grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
          <div className="flex flex-col items-center gap-5">
            {/* Fading swatch */}
            <div className="relative w-32 h-40 rounded-2xl border-2 transition-all duration-300"
              style={{
                background: purpleFaded,
                borderColor: `${purpleFaded}60`,
                opacity: purpleOpacity,
                boxShadow: `0 0 ${Math.round(40*(1-purpleAge))}px ${purpleHex}${Math.round(40*(1-purpleAge)).toString(16).padStart(2,"0")}`,
              }}>
              <div className="absolute inset-0 rounded-2xl flex items-center justify-center">
                <span className="font-serif text-3xl" style={{ color:`rgba(255,255,255,${Math.max(0.1,purpleOpacity*0.7)})` }}>紫</span>
              </div>
            </div>

            <div className="text-center space-y-1">
              <div className="font-mono text-xs font-bold" style={{ color: purpleFaded, opacity: purpleOpacity + 0.3 }}>
                Murasaki
              </div>
              <div className="font-mono text-[9px] text-muted-foreground/40">
                Color(t) = Color₀ × {(1-purpleAge*0.8).toFixed(2)}
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => { setAutoAge(false); setPurpleAge(0); }}
                className="font-mono text-[9px] px-3 py-1.5 rounded border border-border/30 hover:border-violet-500/40 transition-all text-muted-foreground/50 hover:text-violet-400">
                RESET
              </button>
              <button
                onClick={() => setAutoAge(!autoAge)}
                className="font-mono text-[9px] px-3 py-1.5 rounded border transition-all"
                style={{
                  borderColor: autoAge ? "#7b3d8b60" : "#334155",
                  color: autoAge ? "#7b3d8b" : "#64748b",
                  background: autoAge ? "#7b3d8b10" : "transparent",
                }}>
                {autoAge ? "⏸ PAUSE DECAY" : "▶ SIMULATE DECAY"}
              </button>
            </div>
          </div>

          <div className="space-y-5">
            <div className="space-y-3">
              <div className="font-mono text-[9px] text-muted-foreground/40 uppercase tracking-widest">Decay Dimension</div>
              <div className="space-y-2">
                {[
                  { label:"Digital Color (stable)", progress:100, color:"#22c55e" },
                  { label:"Synthetic Dye", progress:Math.round(90*(1-purpleAge*0.3)), color:"#0ea5e9" },
                  { label:"Indigo (Aizome)", progress:Math.round(80*(1-purpleAge*0.5)), color:"#2e5e93" },
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
            </div>

            <div className="rounded-lg border border-violet-500/20 bg-violet-500/5 p-4 space-y-2">
              <div className="font-mono text-[9px] text-violet-400/60 uppercase tracking-widest">The Hatao Phenomenon</div>
              <p className="font-serif text-sm text-foreground/60 italic leading-relaxed">
                "A gray tone that occasionally reflects a trace of violet under certain lighting — 
                a perceptual glitch. A color that exists only through subtle interactions of light and context."
              </p>
              <div className="flex gap-2 items-center">
                <div className="w-8 h-8 rounded-lg" style={{ background:"#847a8c", boxShadow:"0 0 8px #7b3d8b30" }} />
                <div className="w-8 h-8 rounded-lg" style={{ background:"#7b3d8b" }} />
                <span className="font-mono text-[9px] text-muted-foreground/30">→ gray with trace of noble purple</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Perception Stack ─────────────────────────────────────────────── */}
      <div>
        <div className="font-mono text-xs text-muted-foreground tracking-widest uppercase mb-6 flex items-center gap-3">
          <span>The Full Perception Stack</span>
          <span className="flex-1 h-px bg-border" />
          <span className="text-muted-foreground/40">Layer VII in context</span>
        </div>

        <div className="max-w-sm mx-auto space-y-1">
          {[
            { label:"λ Wavelength",   col:"#0ea5e9", desc:"Physical radiation" },
            { label:"↓ Biology",       col:"#22c55e", desc:"Cone receptors" },
            { label:"↓ Neural",        col:"#f97316", desc:"Opponent encoding" },
            { label:"↓ Psychology",    col:"#eab308", desc:"Pattern & memory" },
            { label:"↓ Culture",       col:"#e64522", desc:"Naming + symbol ← Layer VII" },
            { label:"↓ Memory",        col:"#a78bfa", desc:"Time & experience" },
            { label:"= Perception C",  col:"#bc6ff1", desc:"The full equation" },
          ].map((step, i) => (
            <motion.div key={step.label}
              initial={{ opacity:0, x:-16 }} animate={{ opacity:1, x:0 }}
              transition={{ delay: i*0.05 }}
              className="flex items-center gap-4 rounded-lg border px-4 py-3"
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
                  NEW
                </span>
              )}
            </motion.div>
          ))}
        </div>
      </div>

      {/* ── Closing ──────────────────────────────────────────────────────── */}
      <div className="rounded-xl border border-border/20 p-8 text-center space-y-3"
        style={{ background:"linear-gradient(135deg, #0e0b1d, #0d1117)" }}>
        <div className="font-mono text-[9px] tracking-[0.4em] mb-3" style={{ color:"#bc6ff150" }}>
          BEYOND PERFECT COLOR
        </div>
        <p className="font-serif text-base text-foreground/50 italic max-w-2xl mx-auto leading-relaxed">
          "The most meaningful colors may be those that resist classification —
          the color of fading memory, the shifting tones of light outside a window,
          the subtle difference between two moments in the same landscape."
        </p>
        <p className="font-serif text-sm text-foreground/30 italic">
          "These colors exist not in wavelengths, but in the relationship between perception, time, and experience."
        </p>
        <div className="font-mono text-[9px] text-muted-foreground/15 mt-4">
          AETHER Layer VII — Cultural Perception Geometry
        </div>
      </div>

      <div className="h-8" />
    </div>
  );
}
