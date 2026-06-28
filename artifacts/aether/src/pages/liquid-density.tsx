import { useEffect, useRef, useState } from "react";

/* ── palette ─────────────────────────────────────────────────────────────── */
const BG0   = "#030810";
const BG1   = "#060c1c";
const SURF  = "#080f20";
const MID   = "#0b1530";
const LINE  = "#101e44";
const DIM   = "#182858";
const BODY  = "#5878a8";
const PALE  = "#98b0d8";
const LIGHT = "#c8d8f0";
const WHITE = "#eaf2ff";

const DENS  = "#40d0ff";
const DENS2 = "#80e8ff";
const MIX   = "#ff8020";
const MIX2  = "#ffc060";
const MAT   = "#20e890";
const MAT2  = "#60ffc0";
const LMT   = "#c080ff";
const LMT2  = "#e0b8ff";
const GOLD  = "#ffd060";

const mono  = "'Space Mono', monospace";
const serif = "'Cinzel', serif";
const body  = "'Crimson Pro', Georgia, serif";

/* ── material database ───────────────────────────────────────────────────── */
type Category = "Hydrocarbon" | "Alcohol" | "Aqueous" | "Bio-oil" | "Polymer" | "Bio-sugar"
  | "Halogenated" | "Magnetic" | "Liquid Metal" | "AETHER Substrate";

type LiquidDef = {
  id: string; name: string; formula: string; density: number;
  col: string; category: Category;
  notes: string; meltPt?: number; uses: string;
};

const MATERIALS: LiquidDef[] = [
  /* ── Hydrocarbons ── */
  { id:"hexane",    name:"Hexane",               formula:"C₆H₁₄",     density:0.659, col:"#FFE4A0", category:"Hydrocarbon",     notes:"Non-polar organic solvent; immiscible with water",    uses:"Lipid extraction, HPLC mobile phase" },
  { id:"toluene",   name:"Toluene",              formula:"C₇H₈",      density:0.867, col:"#FFCC80", category:"Hydrocarbon",     notes:"Aromatic; benzene substitute; immiscible with water", uses:"Lacquer solvent, paint thinner" },
  { id:"xylene",    name:"Xylene",               formula:"C₈H₁₀",     density:0.864, col:"#FFD898", category:"Hydrocarbon",     notes:"Mixed isomers; aromatic hydrocarbon",                uses:"Histology clearing agent, solvent" },
  /* ── Alcohols ── */
  { id:"ethanol",   name:"Ethanol",              formula:"C₂H₅OH",    density:0.789, col:"#E8F4FF", category:"Alcohol",         notes:"Miscible with water; polar protic",                   uses:"Solvent, antiseptic, density float" },
  { id:"isoprop",   name:"Isopropanol",          formula:"C₃H₇OH",    density:0.786, col:"#D8ECFF", category:"Alcohol",         notes:"Common IPA; fully miscible with water",               uses:"Semiconductor cleaning, antiseptic" },
  { id:"methanol",  name:"Methanol",             formula:"CH₃OH",     density:0.792, col:"#C8E8FF", category:"Alcohol",         notes:"Lightest alcohol; toxic; miscible",                   uses:"Fuel cell additive, solvent" },
  { id:"glycerol",  name:"Glycerol",             formula:"C₃H₈O₃",    density:1.261, col:"#FFE890", category:"Alcohol",         notes:"Viscous triol; hygroscopic; miscible",                uses:"Density column layer, cosmetics" },
  /* ── Aqueous ── */
  { id:"water",     name:"Water",                formula:"H₂O",       density:1.000, col:"#A0D8FF", category:"Aqueous",         notes:"Universal reference density at 4°C",                  uses:"Reference fluid, all biochemistry" },
  { id:"seawater",  name:"Seawater (3.5% NaCl)", formula:"H₂O+NaCl",  density:1.025, col:"#88C8FF", category:"Aqueous",         notes:"Ocean density; varies with salinity",                 uses:"Marine biology, buoyancy reference" },
  { id:"brine",     name:"Saturated Brine",      formula:"NaCl(aq)",  density:1.200, col:"#70BCFF", category:"Aqueous",         notes:"Saturated NaCl; 26.4% by weight at 20°C",            uses:"Food preservation, density medium" },
  { id:"sucrose",   name:"60% Sucrose solution", formula:"C₁₂H₂₂O₁₁", density:1.290, col:"#F8DCA0", category:"Aqueous",         notes:"Concentrated sugar; optical clarity",                 uses:"CsCl gradient alternative, optics" },
  /* ── Bio-oils ── */
  { id:"castor",    name:"Castor Oil",           formula:"C₅₇H₁₀₄O₉", density:0.961, col:"#F5DEB3", category:"Bio-oil",         notes:"Viscous; ricinoleic acid dominant; slightly < 1",     uses:"Density float layer, cosmetics" },
  { id:"olive",     name:"Olive Oil",            formula:"C₅₇H₁₀₄O₆", density:0.911, col:"#D4E880", category:"Bio-oil",         notes:"Primarily oleic acid; golden",                        uses:"Density column, food science" },
  { id:"coconut",   name:"Coconut Oil (liquid)", formula:"C₅₁H₉₄O₆",  density:0.924, col:"#FFF8D8", category:"Bio-oil",         notes:"Liquid above 24°C; saturated fatty acids",           uses:"Density column, cosmetics" },
  /* ── Polymer ── */
  { id:"silicone",  name:"Silicone Oil (5 cSt)", formula:"(SiO(CH₃)₂)ₙ",density:0.913, col:"#D8F0D8", category:"Polymer",      notes:"Low viscosity PDMS; chemically inert; immiscible",    uses:"Microfluidics, dielectric fluid" },
  { id:"pdms50",    name:"PDMS 50 cSt",          formula:"(SiO(CH₃)₂)ₙ",density:0.970, col:"#C8E8C8", category:"Polymer",      notes:"Higher viscosity; same chemistry",                    uses:"Soft lithography, lab-on-chip" },
  { id:"pfpe",      name:"PFPE (Krytox)",        formula:"CF₂CF(CF₃)O", density:1.900, col:"#F0F8FF", category:"Polymer",      notes:"Perfluoropolyether; very dense polymer fluid",        uses:"Droplet microfluidics carrier phase" },
  /* ── Bio-sugar ── */
  { id:"cornsyrup", name:"Corn Syrup",           formula:"(C₆H₁₀O₅)ₙ", density:1.380, col:"#D4A020", category:"Bio-sugar",     notes:"High-viscosity glucose polymer; amber",               uses:"Classic density column demo" },
  /* ── Halogenated ── */
  { id:"dcm",       name:"Dichloromethane",      formula:"CH₂Cl₂",    density:1.325, col:"#C8F0C8", category:"Halogenated",    notes:"Low bp (40°C); dense; immiscible with water",         uses:"Extraction, substrate cleaning" },
  { id:"chloroform",name:"Chloroform",           formula:"CHCl₃",     density:1.489, col:"#B0E8B0", category:"Halogenated",    notes:"Anaesthetic history; dense non-polar",                uses:"Organic extraction, NMR solvent" },
  { id:"ccl4",      name:"Carbon Tetrachloride", formula:"CCl₄",      density:1.594, col:"#A0D8A0", category:"Halogenated",    notes:"Non-flammable; ozone-depleting; banned for common use",uses:"Flame retardant research" },
  { id:"bromoform", name:"Bromoform",            formula:"CHBr₃",     density:2.890, col:"#B8C8B0", category:"Halogenated",    notes:"Heavy halogenated; high refractive index",            uses:"Mineral density separation" },
  { id:"diiodometh",name:"Diiodomethane",        formula:"CH₂I₂",     density:3.325, col:"#F0D060", category:"Halogenated",    notes:"Highest-density common organic liquid",               uses:"Gemology (wulfenite separation)" },
  /* ── Magnetic ── */
  { id:"ferrofluid",name:"Ferrofluid (EMG 905)", formula:"Fe₃O₄+surfactant",density:1.200,col:"#282828", category:"Magnetic",  notes:"Magnetic nanoparticles in carrier oil; tunable density with B-field",uses:"Levitation, AETHER magnetic substrate" },
  { id:"mrd",       name:"Magnetorheological",   formula:"Fe+silicone", density:3.100, col:"#303030", category:"Magnetic",     notes:"Density tunable 1.0–4.5 by field strength",           uses:"Active vibration control, AETHER" },
  /* ── Liquid Metals ── */
  { id:"gallium",   name:"Gallium",              formula:"Ga",         density:6.095, col:"#C0D4E8", category:"Liquid Metal",  meltPt:29.76,  notes:"Melts in palm of hand (29.8°C); non-toxic",      uses:"Stretchable electronics, bioprinting" },
  { id:"eGaIn",     name:"EGaIn (75%Ga/25%In)",  formula:"Ga₃In",      density:6.280, col:"#B0CCE0", category:"Liquid Metal",  meltPt:15.7,   notes:"Lower melting alloy; forms oxide skin",           uses:"Microfluidic channels, antennas" },
  { id:"galinstan", name:"Galinstan",            formula:"Ga₆₈In₂₂Sn₁₀",density:6.440,col:"#A0BCCC",category:"Liquid Metal",  meltPt:-19,    notes:"Room-temp liquid metal; replaces mercury in many uses",uses:"Thermometers, bioelectronics" },
  { id:"mercury",   name:"Mercury",              formula:"Hg",         density:13.534,col:"#D8D8D8", category:"Liquid Metal",  meltPt:-38.83, notes:"Densest room-temp liquid; neurotoxic; surface tension 485 mN/m",uses:"Barometers, Torricelli reference" },
  /* ── AETHER Substrates ── */
  { id:"spt",       name:"SPT (Sod. Polytungstate)",formula:"Na₆(H₂W₁₂O₄₀)",density:2.850, col:"#E8E0FF", category:"AETHER Substrate",notes:"Tunable 1.0–3.1 g/cm³ by dilution; non-toxic heavy liquid",uses:"Heavy mineral separation, AETHER L3 substrate" },
  { id:"lst",       name:"LST (Li·Na Tungstate)", formula:"Li₂WO₄·Na₂WO₄",density:2.900, col:"#E0D8FF", category:"AETHER Substrate",notes:"Stable to 3.0 g/cm³; fluorescence-compatible",       uses:"Palaeontology, micropalaeontology" },
  { id:"photoresist",name:"Photoresist (SU-8)",   formula:"epoxy+PAG",  density:1.070, col:"#FF9090", category:"AETHER Substrate",notes:"UV-patternable polymer; ~1.07 for SU-8 2000 series",   uses:"MEMS, CUCA L1/L2 patterning" },
  { id:"pedot",     name:"PEDOT:PSS",             formula:"C₆H₆O₂S·C₈H₈O₄S",density:1.011,col:"#6090FF",category:"AETHER Substrate",notes:"Conductive polymer dispersion; near-water density",    uses:"Organic electronics, CUCA L3 contact" },
  { id:"grapheneox",name:"Graphene Oxide (2mg/mL)",formula:"GO(aq)",     density:1.001, col:"#606060", category:"AETHER Substrate",notes:"Nearly water-density at low loading; films on drying",  uses:"Gray medium composite, AETHER fabric" },
  { id:"nafion",    name:"Nafion solution (5%)",  formula:"(CF₂CF₂)ₙ·(CF₂CF(OCF₂SO₃H))ₘ",density:1.980,col:"#FF80C0",category:"AETHER Substrate",notes:"Ion-exchange membrane; dense perfluoropolymer",       uses:"Fuel cells, CUCA L4 proton layer" },
  { id:"batio3",    name:"BaTiO₃ suspension",     formula:"BaTiO₃(aq)",  density:5.800, col:"#FFD8A0", category:"AETHER Substrate",notes:"Phase-conjugate ferroelectric; particles at 6.02 g/cm³",uses:"Phase conjugate mirror, AETHER L6 resonance" },
  { id:"graym",     name:"Gray Medium Substrate", formula:"C+H₂O+binder",density:2.100, col:"#909090", category:"AETHER Substrate",notes:"Graphite composite; AETHER proprietary substrate",      uses:"AETHER coherence field carrier medium" },
];

/* ── helpers ─────────────────────────────────────────────────────────────── */
function Chip({ c = PALE, children }: { c?: string; children: string }) {
  return <span style={{ fontFamily: mono, fontSize: 11, color: c, background: `${c}14`, border: `1px solid ${c}40`, borderRadius: 4, padding: "2px 8px", display: "inline-block", margin: "2px 3px" }}>{children}</span>;
}
function EQBlock({ col = DENS, children }: { col?: string; children: string }) {
  return <pre style={{ fontFamily: mono, fontSize: 12, color: LIGHT, background: SURF, borderLeft: `3px solid ${col}60`, borderRadius: "0 6px 6px 0", padding: "14px 20px", margin: "14px 0", overflowX: "auto", whiteSpace: "pre-wrap", lineHeight: 1.9 }}>{children}</pre>;
}
function Sect({ id, n, title, sub, col = DENS }: { id: string; n: string; title: string; sub: string; col?: string }) {
  return (
    <div id={id} style={{ marginTop: 72, scrollMarginTop: 80 }}>
      <div style={{ fontFamily: mono, fontSize: 9, color: col, letterSpacing: 4, marginBottom: 6 }}>{n}</div>
      <h2 style={{ fontFamily: serif, fontSize: 28, color: WHITE, margin: "0 0 4px", letterSpacing: 1 }}>{title}</h2>
      <div style={{ fontFamily: body, fontSize: 15, color: DIM, marginBottom: 22 }}>{sub}</div>
      <div style={{ height: 1, background: `linear-gradient(90deg,${col}50,transparent)`, marginBottom: 32 }} />
    </div>
  );
}
function Pull({ col = DENS, children }: { col?: string; children: string }) {
  return <blockquote style={{ borderTop: `1px solid ${col}40`, borderBottom: `1px solid ${col}40`, padding: "16px 28px", margin: "28px 0", fontFamily: body, fontStyle: "italic", fontSize: 19, color: LIGHT, lineHeight: 1.65, textAlign: "center" }}>{children}</blockquote>;
}

const CATEGORIES: Category[] = [
  "Hydrocarbon","Alcohol","Aqueous","Bio-oil","Polymer","Bio-sugar","Halogenated","Magnetic","Liquid Metal","AETHER Substrate",
];
const CAT_COLORS: Record<Category, string> = {
  "Hydrocarbon": "#FFE090", "Alcohol": "#A0D8FF", "Aqueous": "#40C8FF",
  "Bio-oil": "#D4E890", "Polymer": "#C8F0C0", "Bio-sugar": "#D4A020",
  "Halogenated": "#B0E8B0", "Magnetic": "#A0A0B0", "Liquid Metal": LMT,
  "AETHER Substrate": GOLD,
};

/* ── canvas ──────────────────────────────────────────────────────────────── */
type Mode = "machine" | "column" | "scatter";

function DensityCanvas({ mode }: { mode: Mode }) {
  const cvs = useRef<HTMLCanvasElement>(null);
  const raf = useRef(0);
  const tick = useRef(0);
  const stateRef = useRef({
    layers: [] as { mat: LiquidDef; splashAge: number }[],
    blob: null as { mat: LiquidDef; y: number; targetY: number; radius: number } | null,
    nextTimer: 0,
    queue: [...MATERIALS].sort(() => Math.random() - 0.5),
    queueIdx: 0,
    ripples: [] as { x: number; y: number; age: number; col: string }[],
  });

  useEffect(() => {
    const canvas = cvs.current!;
    const ctx = canvas.getContext("2d")!;
    const resize = () => {
      const p = canvas.parentElement!;
      canvas.width = p.clientWidth;
      canvas.height = Math.min(520, Math.round(p.clientWidth * 0.56));
    };
    resize();
    window.addEventListener("resize", resize);

    /* reset state on mode change */
    const s = stateRef.current;
    s.layers = [];
    s.blob = null;
    s.nextTimer = 60;
    s.queue = [...MATERIALS].sort(() => Math.random() - 0.5);
    s.queueIdx = 0;
    s.ripples = [];
    tick.current = 0;

    const SORTED = [...MATERIALS].sort((a, b) => b.density - a.density); // densest first at bottom

    const draw = () => {
      const W = canvas.width, H = canvas.height;
      const t = tick.current++;
      ctx.clearRect(0, 0, W, H); ctx.fillStyle = BG0; ctx.fillRect(0, 0, W, H);

      /* ═══ MIXING MACHINE ════════════════════════════════════════════════ */
      if (mode === "machine") {
        const CW = Math.min(180, W * 0.26);
        const CH = Math.min(400, H * 0.82);
        const CX = W * 0.38;
        const CT = H * 0.5 - CH * 0.5;
        const CB = CT + CH;

        const MAX_LAYERS = 16;
        const LAYER_H = CH / MAX_LAYERS;
        const BLOB_ADD_INTERVAL = 110; // frames

        /* Add a new liquid */
        if (s.blob === null && t % BLOB_ADD_INTERVAL < 2) {
          if (s.queueIdx < s.queue.length) {
            const mat = s.queue[s.queueIdx % s.queue.length];
            s.queueIdx++;
            if (s.queueIdx >= s.queue.length) {
              s.queue = [...MATERIALS].sort(() => Math.random() - 0.5);
              s.queueIdx = 0;
              s.layers = []; // reset layers after full cycle
            }
            // Find target Y: sort layers by density (desc) + new mat
            const allMats = [...s.layers.map(l => l.mat), mat].sort((a, b) => b.density - a.density);
            const rank = allMats.findIndex(m => m.id === mat.id);
            const targetY = CT + (rank + 0.5) * LAYER_H;
            s.blob = { mat, y: CT - 24, targetY, radius: Math.min(CW * 0.35, 20) };
          }
        }

        /* Move blob */
        if (s.blob) {
          s.blob.y += 3.5;
          if (s.blob.y >= s.blob.targetY) {
            // Land the blob → add to layers
            const existing = s.layers.findIndex(l => l.mat.id === s.blob!.mat.id);
            if (existing === -1) s.layers.push({ mat: s.blob.mat, splashAge: 0 });
            else s.layers[existing].splashAge = 0;
            // Splash ripple
            s.ripples.push({ x: CX, y: s.blob.targetY, age: 0, col: s.blob.mat.col });
            s.blob = null;
          }
        }

        /* Increment splash ages */
        s.layers.forEach(l => l.splashAge++);
        s.ripples = s.ripples.filter(r => (r.age++, r.age < 40));

        /* Draw container glass */
        ctx.strokeStyle = `${DENS}40`; ctx.lineWidth = 1.5;
        ctx.strokeRect(CX - CW * 0.5, CT, CW, CH);
        // Glass highlight
        ctx.fillStyle = `${DENS}05`; ctx.fillRect(CX - CW * 0.5 + 1, CT + 1, CW - 2, CH - 2);
        // Meniscus line at top
        const filledTop = s.layers.length > 0 ? CT + s.layers.length * LAYER_H * 0 : CB;

        /* Draw layers sorted by density (densest at bottom) */
        const sortedLayers = [...s.layers].sort((a, b) => b.mat.density - a.mat.density);
        sortedLayers.forEach((layer, i) => {
          const ly = CT + i * LAYER_H;
          const alpha = Math.min(1, 0.5 + 0.5 * (layer.splashAge / 30));
          const col = layer.mat.col;
          const grad = ctx.createLinearGradient(CX - CW*0.5, 0, CX + CW*0.5, 0);
          grad.addColorStop(0, `${col}${Math.round(alpha * 0.6 * 255).toString(16).padStart(2,"0")}`);
          grad.addColorStop(0.3, `${col}${Math.round(alpha * 0.85 * 255).toString(16).padStart(2,"0")}`);
          grad.addColorStop(0.7, `${col}${Math.round(alpha * 0.85 * 255).toString(16).padStart(2,"0")}`);
          grad.addColorStop(1, `${col}${Math.round(alpha * 0.6 * 255).toString(16).padStart(2,"0")}`);
          ctx.fillStyle = grad;
          ctx.fillRect(CX - CW*0.5, ly, CW, LAYER_H);

          // Interface line
          if (i > 0) {
            ctx.beginPath(); ctx.moveTo(CX - CW*0.5, ly); ctx.lineTo(CX + CW*0.5, ly);
            ctx.strokeStyle = `${WHITE}20`; ctx.lineWidth = 0.5; ctx.stroke();
          }

          // Label on right side
          if (LAYER_H > 12) {
            ctx.font = `9px ${mono}`; ctx.fillStyle = `${WHITE}90`; ctx.textAlign = "left";
            const label = layer.mat.name.length > 16 ? layer.mat.name.slice(0, 15) + "…" : layer.mat.name;
            ctx.fillText(label, CX + CW*0.5 + 8, ly + LAYER_H * 0.6);
            ctx.fillStyle = `${layer.mat.col}cc`;
            ctx.fillText(`${layer.mat.density.toFixed(3)}`, CX + CW*0.5 + 8, ly + LAYER_H * 0.6 + 11);
          }
        });

        /* Draw blob */
        if (s.blob) {
          const { mat, y, radius } = s.blob;
          const glow = ctx.createRadialGradient(CX, y, 0, CX, y, radius * 2);
          glow.addColorStop(0, `${mat.col}60`); glow.addColorStop(1, "transparent");
          ctx.beginPath(); ctx.arc(CX, y, radius * 2, 0, Math.PI * 2);
          ctx.fillStyle = glow; ctx.fill();
          ctx.beginPath(); ctx.arc(CX, y, radius, 0, Math.PI * 2);
          ctx.fillStyle = `${mat.col}dd`; ctx.fill();
          ctx.strokeStyle = `${WHITE}50`; ctx.lineWidth = 0.8; ctx.stroke();
          // Falling trail
          ctx.beginPath(); ctx.moveTo(CX, CT - 20); ctx.lineTo(CX, y - radius);
          ctx.strokeStyle = `${mat.col}30`; ctx.lineWidth = 2; ctx.stroke();
          // Label below blob
          ctx.font = `9px ${mono}`; ctx.fillStyle = mat.col; ctx.textAlign = "center";
          ctx.fillText(mat.name.slice(0, 14), CX, y + radius + 13);
          ctx.fillText(`ρ=${mat.density}`, CX, y + radius + 24);
        }

        /* Ripples */
        s.ripples.forEach(r => {
          const frac = r.age / 40;
          const rr = 8 + frac * CW * 0.6;
          ctx.beginPath(); ctx.arc(r.x, r.y, rr, 0, Math.PI * 2);
          ctx.strokeStyle = `${r.col}${Math.round((1-frac)*80).toString(16).padStart(2,"0")}`;
          ctx.lineWidth = 1; ctx.stroke();
        });

        /* Density scale (left side) */
        const scaleX = CX - CW*0.5 - 52;
        const densities = [0.6, 1.0, 1.5, 2.0, 3.0, 5.0, 10.0, 13.5];
        const maxD = 13.6, minD = 0.6;
        densities.forEach(d => {
          const fracY = (d - minD) / (maxD - minD);
          const sy = CT + fracY * CH;
          ctx.beginPath(); ctx.moveTo(scaleX + 28, sy); ctx.lineTo(CX - CW*0.5, sy);
          ctx.strokeStyle = `${DENS}25`; ctx.lineWidth = 0.5; ctx.stroke();
          ctx.font = `8px ${mono}`; ctx.fillStyle = `${DENS}80`; ctx.textAlign = "right";
          ctx.fillText(`${d}`, scaleX + 25, sy + 3);
        });
        ctx.font = `7px ${mono}`; ctx.fillStyle = `${DENS}60`; ctx.textAlign = "center";
        ctx.save(); ctx.translate(scaleX, CT + CH*0.5); ctx.rotate(-Math.PI/2);
        ctx.fillText("DENSITY  g/cm³", 0, 0); ctx.restore();

        // Status
        ctx.font = `9px ${mono}`; ctx.fillStyle = `${MIX2}80`; ctx.textAlign = "left";
        ctx.fillText(`MIXING MACHINE  ·  ${s.layers.length} layers  ·  ${s.blob ? `adding ${s.blob.mat.name}` : "awaiting next drop"}`, 14, H - 10);

      /* ═══ DENSITY COLUMN ════════════════════════════════════════════════ */
      } else if (mode === "column") {
        const sorted = [...MATERIALS].sort((a, b) => b.density - a.density);
        const N = sorted.length;
        const itemH = Math.max(12, (H - 60) / N);
        const colW = Math.min(200, W * 0.32);
        const colX = W * 0.34;
        const colT = 28;

        // Pan vertically with time
        const panCycle = 320;
        const totalH = N * itemH;
        const visibleH = H - 60;
        let offset = 0;
        if (totalH > visibleH) {
          const panFrac = (Math.sin(t / panCycle * Math.PI * 2) * 0.5 + 0.5);
          offset = panFrac * (totalH - visibleH);
        }

        ctx.save(); ctx.rect(0, colT, W, H - colT); ctx.clip();

        sorted.forEach((mat, i) => {
          const y = colT + i * itemH - offset;
          if (y + itemH < colT - 10 || y > H + 10) return;

          const grad = ctx.createLinearGradient(colX - colW*0.5, 0, colX + colW*0.5, 0);
          const c = mat.col;
          const alpha = mat.category === "AETHER Substrate" ? 0.80 : 0.70;
          grad.addColorStop(0, `${c}${Math.round(alpha*0.5*255).toString(16).padStart(2,"0")}`);
          grad.addColorStop(0.5, `${c}${Math.round(alpha*255).toString(16).padStart(2,"0")}`);
          grad.addColorStop(1, `${c}${Math.round(alpha*0.5*255).toString(16).padStart(2,"0")}`);
          ctx.fillStyle = grad;
          ctx.fillRect(colX - colW*0.5, y, colW, itemH - 0.5);

          // Interface
          ctx.beginPath(); ctx.moveTo(colX - colW*0.5, y); ctx.lineTo(colX + colW*0.5, y);
          ctx.strokeStyle = `${WHITE}15`; ctx.lineWidth = 0.5; ctx.stroke();

          // Name label
          ctx.font = `${Math.min(10, itemH * 0.65)}px ${mono}`; ctx.fillStyle = `${WHITE}cc`; ctx.textAlign = "right";
          const name2 = mat.name.length > 22 ? mat.name.slice(0, 21) + "…" : mat.name;
          ctx.fillText(name2, colX - colW*0.5 - 6, y + itemH * 0.65);
          // Density
          ctx.fillStyle = mat.col; ctx.textAlign = "left";
          ctx.fillText(`${mat.density.toFixed(3)} g/cm³`, colX + colW*0.5 + 6, y + itemH * 0.65);
          // Formula (tiny)
          if (itemH > 16) {
            ctx.font = `7px ${mono}`; ctx.fillStyle = `${BODY}80`; ctx.textAlign = "left";
            ctx.fillText(mat.formula.slice(0, 18), colX + colW*0.5 + 6, y + itemH * 0.65 + 9);
          }
          // Category dot
          const catCol = CAT_COLORS[mat.category];
          ctx.beginPath(); ctx.arc(colX - colW*0.5 - 28, y + itemH*0.5, 3, 0, Math.PI*2);
          ctx.fillStyle = catCol; ctx.fill();
        });

        ctx.restore();

        // Title
        ctx.font = `9px ${mono}`; ctx.fillStyle = `${DENS}80`; ctx.textAlign = "center";
        ctx.fillText(`DENSITY COLUMN  ·  ${N} MATERIALS  ·  0.659 → 13.534 g/cm³  ·  TOP = DENSEST`, W*0.5, 18);

        // Category legend (bottom)
        const legendCats = ["Aqueous", "AETHER Substrate", "Liquid Metal", "Halogenated"] as Category[];
        legendCats.forEach((cat, ci) => {
          const lx = W*0.08 + ci * W * 0.22;
          ctx.beginPath(); ctx.arc(lx, H - 12, 4, 0, Math.PI*2);
          ctx.fillStyle = CAT_COLORS[cat]; ctx.fill();
          ctx.font = `8px ${mono}`; ctx.fillStyle = `${PALE}80`; ctx.textAlign = "left";
          ctx.fillText(cat, lx + 8, H - 9);
        });

      /* ═══ SCATTER PLOT ════════════════════════════════════════════════ */
      } else if (mode === "scatter") {
        const padL = 64, padR = 24, padT = 30, padB = 40;
        const plotW = W - padL - padR;
        const plotH = H - padT - padB;

        const catOrder = CATEGORIES;
        const maxD = 14;
        const xScale = (ci: number) => padL + (ci + 0.5) * (plotW / catOrder.length);
        const yScale = (d: number) => padT + plotH * (1 - Math.log10(d + 0.1) / Math.log10(maxD + 0.1));

        // Grid lines for density
        [0.5, 1.0, 2.0, 5.0, 10.0].forEach(d => {
          const y = yScale(d);
          ctx.beginPath(); ctx.moveTo(padL, y); ctx.lineTo(padL + plotW, y);
          ctx.strokeStyle = `${LINE}80`; ctx.lineWidth = 0.5; ctx.stroke();
          ctx.font = `8px ${mono}`; ctx.fillStyle = `${BODY}80`; ctx.textAlign = "right";
          ctx.fillText(`${d}`, padL - 4, y + 3);
        });

        // Y axis label
        ctx.font = `8px ${mono}`; ctx.fillStyle = `${DENS}80`; ctx.textAlign = "center";
        ctx.save(); ctx.translate(12, padT + plotH*0.5); ctx.rotate(-Math.PI/2);
        ctx.fillText("DENSITY  g/cm³  (log scale)", 0, 0); ctx.restore();

        // Category columns
        catOrder.forEach((cat, ci) => {
          const x = xScale(ci);
          // Column background
          ctx.fillStyle = `${CAT_COLORS[cat]}08`;
          ctx.fillRect(padL + ci * plotW / catOrder.length, padT, plotW / catOrder.length - 1, plotH);
          // Category label (rotated)
          ctx.font = `8px ${mono}`; ctx.fillStyle = `${CAT_COLORS[cat]}90`; ctx.textAlign = "center";
          ctx.save(); ctx.translate(x, padT + plotH + 6); ctx.rotate(Math.PI * 0.25);
          ctx.fillText(cat.replace(" Substrate",""), 0, 8); ctx.restore();
        });

        // Plot each material
        MATERIALS.forEach(mat => {
          const ci = catOrder.indexOf(mat.category);
          if (ci === -1) return;
          const x = xScale(ci) + (Math.sin(mat.density * 7.3) * 14);
          const y = yScale(mat.density);
          const glowR = Math.min(W, H) * 0.03;
          const glow = ctx.createRadialGradient(x, y, 0, x, y, glowR);
          glow.addColorStop(0, `${mat.col}60`); glow.addColorStop(1, "transparent");
          ctx.beginPath(); ctx.arc(x, y, glowR, 0, Math.PI*2); ctx.fillStyle = glow; ctx.fill();
          ctx.beginPath(); ctx.arc(x, y, 5, 0, Math.PI*2);
          ctx.fillStyle = mat.col; ctx.fill();
          ctx.strokeStyle = `${WHITE}30`; ctx.lineWidth = 0.5; ctx.stroke();

          // Hover-style label for notable materials
          if (["water","mercury","gallium","batio3","graym","ferrofluid"].includes(mat.id)) {
            ctx.font = `8px ${mono}`; ctx.fillStyle = `${mat.col}cc`; ctx.textAlign = "center";
            ctx.fillText(mat.name.split(" ")[0], x, y - 9);
          }
        });

        // Title
        ctx.font = `9px ${mono}`; ctx.fillStyle = `${DENS}80`; ctx.textAlign = "center";
        ctx.fillText("SUBSTRATE DENSITY MAP  ·  LOG SCALE  ·  EACH DOT = ONE MATERIAL", W*0.5, 18);
      }

      raf.current = requestAnimationFrame(draw);
    };

    draw();
    return () => { cancelAnimationFrame(raf.current); window.removeEventListener("resize", resize); };
  }, [mode]);

  return (
    <div style={{ borderRadius: 10, overflow: "hidden", border: `1px solid ${LINE}` }}>
      <canvas ref={cvs} style={{ display: "block", width: "100%" }} />
    </div>
  );
}

/* ── materials table ─────────────────────────────────────────────────────── */
function MaterialsTable() {
  const [search, setSearch] = useState("");
  const [cat, setCat] = useState<Category | "All">("All");
  const [sort, setSort] = useState<"density" | "name">("density");

  const filtered = MATERIALS
    .filter(m => cat === "All" || m.category === cat)
    .filter(m => {
      const q = search.toLowerCase();
      return !q || m.name.toLowerCase().includes(q) || m.formula.toLowerCase().includes(q) || m.notes.toLowerCase().includes(q);
    })
    .sort((a, b) => sort === "density" ? a.density - b.density : a.name.localeCompare(b.name));

  return (
    <div>
      <div style={{ display: "flex", gap: 10, marginBottom: 14, flexWrap: "wrap" }}>
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search name, formula, notes…" style={{ fontFamily: mono, fontSize: 11, padding: "6px 12px", borderRadius: 5, border: `1px solid ${LINE}`, background: SURF, color: LIGHT, flex: "1 1 200px", outline: "none" }} />
        <button onClick={() => setSort(s => s === "density" ? "name" : "density")} style={{ fontFamily: mono, fontSize: 10, padding: "6px 14px", borderRadius: 5, border: `1px solid ${LINE}`, background: SURF, color: BODY, cursor: "pointer" }}>Sort: {sort === "density" ? "ρ ↑" : "A–Z"}</button>
      </div>
      <div style={{ display: "flex", gap: 5, marginBottom: 14, flexWrap: "wrap" }}>
        {(["All", ...CATEGORIES] as (Category | "All")[]).map(c => (
          <button key={c} onClick={() => setCat(c)} style={{ fontFamily: mono, fontSize: 9, padding: "3px 10px", borderRadius: 4, border: `1px solid ${cat === c ? (c === "All" ? DENS : CAT_COLORS[c as Category]) : LINE}`, background: cat === c ? `${c === "All" ? DENS : CAT_COLORS[c as Category]}14` : "transparent", color: cat === c ? (c === "All" ? DENS : CAT_COLORS[c as Category]) : BODY, cursor: "pointer" }}>{c}</button>
        ))}
      </div>
      <div style={{ overflowX: "auto" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", fontFamily: body, fontSize: 13 }}>
          <thead>
            <tr style={{ background: SURF }}>
              {["Material","Formula","ρ g/cm³","Category","Notes","Uses"].map(h => (
                <th key={h} style={{ fontFamily: mono, fontSize: 9, color: BODY, textAlign: "left", padding: "8px 10px", borderBottom: `1px solid ${LINE}`, whiteSpace: "nowrap", letterSpacing: 1 }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map((m, i) => {
              const catCol = CAT_COLORS[m.category];
              return (
                <tr key={m.id} style={{ background: i % 2 === 0 ? `${BG1}` : "transparent", borderBottom: `1px solid ${LINE}30` }}>
                  <td style={{ padding: "7px 10px" }}>
                    <span style={{ display: "inline-block", width: 8, height: 8, borderRadius: "50%", background: m.col, marginRight: 7, verticalAlign: "middle" }} />
                    <span style={{ color: LIGHT }}>{m.name}</span>
                  </td>
                  <td style={{ padding: "7px 10px", fontFamily: mono, fontSize: 10, color: BODY }}>{m.formula}</td>
                  <td style={{ padding: "7px 10px", fontFamily: mono, fontSize: 11, color: catCol, fontWeight: 700 }}>{m.density.toFixed(3)}</td>
                  <td style={{ padding: "7px 10px" }}><span style={{ fontFamily: mono, fontSize: 9, color: catCol, background: `${catCol}14`, border: `1px solid ${catCol}30`, borderRadius: 3, padding: "1px 6px" }}>{m.category}</span></td>
                  <td style={{ padding: "7px 10px", color: BODY, maxWidth: 260 }}>{m.notes}</td>
                  <td style={{ padding: "7px 10px", color: PALE, maxWidth: 200, fontStyle: "italic" }}>{m.uses}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      <div style={{ fontFamily: mono, fontSize: 9, color: BODY, marginTop: 8 }}>{filtered.length} of {MATERIALS.length} materials shown</div>
    </div>
  );
}

/* ── nav ─────────────────────────────────────────────────────────────────── */
const NAV = [
  { id: "s1", label: "Materials" }, { id: "s2", label: "Physics" },
  { id: "s3", label: "Lab Techniques" }, { id: "s4", label: "Tunable ρ" },
  { id: "s5", label: "Liquid Metals" }, { id: "s6", label: "AETHER Stack" },
];

type CanvasMode = Mode;
const CANVAS_MODES: { k: CanvasMode; label: string; col: string }[] = [
  { k: "machine", label: "Mixing Machine",    col: MIX2  },
  { k: "column",  label: "Density Column",    col: DENS2 },
  { k: "scatter", label: "Substrate Scatter", col: MAT2  },
];

/* ── page ────────────────────────────────────────────────────────────────── */
function LiquidDensityHeaderCanvas() {
  const ref = useRef<HTMLCanvasElement>(null);
  const rafRef = useRef(0);
  useEffect(() => {
    const canvas = ref.current; if (!canvas) return;
    const ctx = canvas.getContext("2d")!;
    canvas.width = 900; canvas.height = 145;
    const W = canvas.width, H = canvas.height;
    const blobs: {x:number;y:number;vx:number;vy:number;r:number;col:string;density:number}[] = [];
    for(let i=0;i<12;i++) blobs.push({x:Math.random()*W,y:Math.random()*H,vx:(Math.random()-0.5)*0.8,vy:(Math.random()-0.5)*0.8,r:8+Math.random()*18,col:["#2ef0d8","#44aaff","#9966ff","#c9a84c"][Math.floor(Math.random()*4)],density:0.5+Math.random()*2});
    let t=0;
    const draw=()=>{
      ctx.fillStyle="rgba(3,8,16,0.3)"; ctx.fillRect(0,0,W,H);
      for(let layer=0;layer<3;layer++){
        const yline=H*(layer+1)/4;
        ctx.beginPath();ctx.moveTo(0,yline);ctx.lineTo(W,yline);
        ctx.strokeStyle=`rgba(68,170,255,${0.04+0.03*Math.sin(t*0.015+layer)})`;ctx.lineWidth=0.5;ctx.stroke();
      }
      blobs.forEach(b=>{
        b.x+=b.vx; b.y+=b.vy;
        const targetY=H*(1-b.density/3)*0.85;
        b.vy+=(targetY-b.y)*0.0005;
        b.vx*=0.998; b.vy*=0.998;
        if(b.x<b.r||b.x>W-b.r)b.vx*=-1; if(b.y<b.r||b.y>H-b.r)b.vy*=-1;
        const pls=0.9+0.1*Math.sin(t*0.04+b.density);
        ctx.beginPath();ctx.arc(b.x,b.y,b.r*pls,0,Math.PI*2);ctx.fillStyle=b.col+"55";ctx.fill();
        ctx.strokeStyle=b.col+"88";ctx.lineWidth=0.8;ctx.stroke();
      });
      ctx.fillStyle="rgba(68,170,255,0.3)"; ctx.font="9px 'DM Mono',monospace";
      ctx.fillText("LIQUID DENSITY · FLUID STRATIFICATION · BUOYANCY · PHASE SEPARATION · AETHER",14,14);
      t++; rafRef.current=requestAnimationFrame(draw);
    };
    draw();
    return ()=>cancelAnimationFrame(rafRef.current);
  },[]);
  return <canvas ref={ref} style={{width:"100%",height:"auto",borderRadius:8,display:"block"}} />;
}

export default function LiquidDensityPage() {
  const [mode, setMode] = useState<CanvasMode>("machine");

  return (
    <div style={{ background: BG0, minHeight: "100vh", fontFamily: body, color: PALE }}>
      <div style={{flexShrink:0}}>
        <div style={{padding:"8px 12px"}}><div style={{display:"inline-block",border:"1px solid #44aaff",padding:"4px 12px",fontSize:10,letterSpacing:"0.2em",color:"#44aaff",fontFamily:"'DM Mono',monospace",marginBottom:16}}>LIVE SIMULATION</div></div>
        <div style={{margin:"0 12px 20px",background:"rgba(3,8,16,0.8)",borderLeft:"3px solid #44aaff",borderRadius:4,overflow:"hidden"}}>
          <div style={{padding:"12px 16px 8px"}}><h2 style={{margin:0,fontSize:13,color:"#44aaff",fontFamily:"'DM Mono',monospace",letterSpacing:"0.15em",fontWeight:400}}>LIQUID DENSITY · FLUID STRATIFICATION · BUOYANCY · AETHER</h2><p style={{margin:"4px 0 8px",fontSize:10,color:"rgba(68,170,255,0.5)",fontFamily:"'DM Mono',monospace",letterSpacing:"0.1em"}}>12 density-stratified blobs — the live AETHER liquid density simulation.</p></div>
          <LiquidDensityHeaderCanvas />
        </div>
      </div>

      {/* HERO */}
      <div style={{ position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", inset: 0, background: `radial-gradient(ellipse 70% 50% at 50% 0%, rgba(64,208,255,0.13) 0%, transparent 60%), radial-gradient(ellipse 50% 40% at 85% 70%, rgba(255,128,32,0.09) 0%, transparent 50%), radial-gradient(ellipse 40% 50% at 10% 70%, rgba(32,232,144,0.07) 0%, transparent 50%), linear-gradient(180deg,${BG1} 0%,${BG0} 100%)` }} />
        <div style={{ position: "relative", padding: "72px 28px 54px", textAlign: "center" }}>
          <div style={{ fontFamily: mono, fontSize: 9, color: DENS, letterSpacing: 6, marginBottom: 14 }}>
            AETHER · SUBSTRATE MATERIALS · LIQUID DENSITY · MIXING MACHINE
          </div>
          <h1 style={{ fontFamily: serif, fontSize: "clamp(20px,4vw,50px)", letterSpacing: 3, lineHeight: 1.12, background: `linear-gradient(135deg,${DENS} 0%,${DENS2} 30%,${MAT2} 60%,${GOLD} 100%)`, WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text", margin: "0 0 16px" }}>
            LIQUID DENSITY<br />MIXING MACHINE
          </h1>
          <div style={{ fontFamily: body, fontStyle: "italic", fontSize: 17, background: `linear-gradient(90deg,${DENS2}90,${PALE},${GOLD}90)`, WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text", marginBottom: 20 }}>
            37 Substrate Materials · Density 0.659–13.534 g/cm³ · Stratification Physics · AETHER Stack Analogy
          </div>
          <p style={{ fontFamily: body, fontSize: 16, color: BODY, maxWidth: 720, margin: "0 auto 28px", lineHeight: 1.9 }}>
            Every material has a density. Liquids sort themselves by it. A Density column is the
            simplest act of physics: less dense floats, more dense sinks, the interface is
            inviolable without energy. This catalog covers 37 liquids — from hexane (0.659) through
            laboratory solvents, biofluids, magnetic fluids, halogenated heavyweights, AETHER
            substrates, and the liquid metals gallium and mercury (13.534) — with a live mixing
            machine that drops each one into the column and watches it find its layer.
          </p>
          <div style={{ display: "flex", gap: 6, justifyContent: "center", flexWrap: "wrap" }}>
            <Chip c={DENS}>ρ = m/V</Chip>
            <Chip c={MIX2}>37 materials</Chip>
            <Chip c={MAT2}>10 categories</Chip>
            <Chip c={GOLD}>AETHER substrates</Chip>
            <Chip c={LMT}>liquid metals</Chip>
            <Chip c="#B0E8B0">halogenated heavies</Chip>
            <Chip c={PALE}>Hg ρ=13.534</Chip>
          </div>
        </div>
      </div>

      {/* Sticky nav */}
      <div style={{ position: "sticky", top: 0, zIndex: 50, background: `${BG0}f0`, backdropFilter: "blur(12px)", borderBottom: `1px solid ${LINE}`, padding: "8px 18px", display: "flex", gap: 4, overflowX: "auto" }}>
        {NAV.map(s => (
          <a key={s.id} href={`#${s.id}`} style={{ fontFamily: mono, fontSize: 10, color: BODY, whiteSpace: "nowrap", padding: "4px 10px", borderRadius: 4, textDecoration: "none" }}
            onMouseEnter={e => { (e.target as HTMLElement).style.color = DENS2; }}
            onMouseLeave={e => { (e.target as HTMLElement).style.color = BODY; }}
          >{s.label}</a>
        ))}
      </div>

      <div style={{ maxWidth: 1080, margin: "0 auto", padding: "0 22px 96px" }}>

        {/* Canvas */}
        <div style={{ marginTop: 36 }}>
          <div style={{ display: "flex", gap: 6, marginBottom: 10, flexWrap: "wrap" }}>
            {CANVAS_MODES.map(m => (
              <button key={m.k} onClick={() => setMode(m.k)} style={{ fontFamily: mono, fontSize: 10, padding: "6px 16px", borderRadius: 5, cursor: "pointer", border: `1px solid ${mode === m.k ? m.col : LINE}`, background: mode === m.k ? `${m.col}14` : "transparent", color: mode === m.k ? m.col : BODY, transition: "all 0.2s" }}>{m.label}</button>
            ))}
          </div>
          <DensityCanvas mode={mode} />
          <div style={{ fontFamily: mono, fontSize: 9, color: BODY, marginTop: 7 }}>
            {mode === "machine" && "MIXING MACHINE · EACH LIQUID DROPPED FROM TOP · FALLS TO DENSITY-SORTED POSITION · AUTO-CYCLES ALL 37 MATERIALS · LAYER LABELS WITH ρ VALUES RIGHT OF CONTAINER · DENSITY SCALE (LOG) LEFT"}
            {mode === "column"  && "DENSITY COLUMN · ALL 37 MATERIALS SORTED DENSEST→LIGHTEST TOP→BOTTOM · AUTO-PANS UP-DOWN · LEFT: NAME · RIGHT: ρ + FORMULA · COLORED DOTS = CATEGORY"}
            {mode === "scatter" && "SUBSTRATE SCATTER MAP · LOG DENSITY SCALE · X = MATERIAL CATEGORY · Y = DENSITY · EACH CIRCLE = ONE MATERIAL · NOTABLE MATERIALS LABELLED"}
          </div>
        </div>

        {/* Materials table */}
        <div id="s1" style={{ marginTop: 48, scrollMarginTop: 80 }}>
          <div style={{ fontFamily: mono, fontSize: 9, color: DENS, letterSpacing: 4, marginBottom: 6 }}>I</div>
          <h2 style={{ fontFamily: serif, fontSize: 28, color: WHITE, margin: "0 0 4px" }}>Complete Materials Catalog</h2>
          <div style={{ fontFamily: body, fontSize: 15, color: DIM, marginBottom: 18 }}>37 substrate materials — searchable, filterable, sortable by density or name</div>
          <div style={{ height: 1, background: `linear-gradient(90deg,${DENS}50,transparent)`, marginBottom: 24 }} />
          <MaterialsTable />
        </div>

        {/* ── II ── */}
        <Sect id="s2" n="II" title="Physics of Density Stratification" sub="Why liquids layer by density, what determines the interface, and when layers mix" col={DENS} />
        <EQBlock col={DENS}>{`Archimedes' principle and buoyancy:

  For an object of density ρ_obj in a fluid of density ρ_fluid:
    Buoyant force:    F_b = ρ_fluid · V · g     (upward)
    Gravitational:    F_g = ρ_obj   · V · g     (downward)
    
    F_b > F_g  iff  ρ_fluid > ρ_obj  → FLOATS
    F_b < F_g  iff  ρ_fluid < ρ_obj  → SINKS
    F_b = F_g  iff  ρ_fluid = ρ_obj  → NEUTRAL (isopycnic point)
    
  Interface stability (Rayleigh-Taylor):
    A denser fluid sitting ABOVE a less dense fluid is UNSTABLE.
    Instability growth rate: σ = √(A·k·g)
    A = Atwood number = (ρ₂ − ρ₁)/(ρ₂ + ρ₁)
    k = wavenumber of perturbation
    
    The density column survives because denser fluids ARE below lighter fluids.
    Any small perturbation is suppressed (A < 0 → imaginary σ → oscillations not growth).
    
  Immiscibility condition:
    Two liquids coexist as separate phases (don't mix) if:
    ΔG_mix = ΔH_mix − T·ΔS_mix > 0   (positive Gibbs energy of mixing)
    
    For polar + nonpolar (water + hexane):
      ΔH_mix >> T·ΔS_mix  (enthalpy penalty dominates)
      → Phase separation regardless of density order
      
    For miscible liquids (ethanol + water):
      ΔG_mix < 0 at all compositions
      → No stable interface; they mix completely
      → Cannot form a permanent density layer
      
  Immiscible pairs in this catalog:
    Hexane | Water                   (non-polar + polar)
    Silicone oil | Water             (siloxane + aqueous)
    Chloroform | Water               (halogenated + aqueous, partially)
    Mercury | All organics           (metallic + molecular)
    Ferrofluid (oil-based) | Water   (carrier oil + aqueous)
    
  Miscible pairs (cannot be layered):
    Ethanol + Water   (any ratio)
    Methanol + Water
    Glycerol + Water  (above ~10% dilution)
    Acetone + Water
    
  ACTUAL density column construction uses only IMMISCIBLE layers.
  Miscible liquids must be gelled or kept very cold to slow mixing.
    
  Terminal velocity of a falling blob (Stokes' law):
    v_terminal = 2r² (ρ_blob − ρ_fluid) g / (9η)
    r = blob radius, η = fluid dynamic viscosity (Pa·s)
    
    Mercury blob (ρ=13.5) falling through water (η≈0.001 Pa·s), r=2mm:
    v = 2(0.002)²(12.5)(9.81)/(9×0.001) = 109 mm/s
    
    Gallium blob in silicone oil (η≈0.005 Pa·s), r=2mm:
    v = 2(0.002)²(5.1)(9.81)/(9×0.005) = 4.4 mm/s  (much slower — viscosity matters)`}</EQBlock>

        {/* ── III ── */}
        <Sect id="s3" n="III" title="Laboratory Separation Techniques" sub="How density columns, isopycnic centrifugation, and heavy liquids are used in practice" col={MAT} />
        <EQBlock col={MAT}>{`1. ISOPYCNIC CENTRIFUGATION (density gradient centrifugation):
    Used to separate biological particles by density, not size.
    
    CsCl gradient (ρ = 1.10–1.80 g/cm³ after centrifugation):
      DNA bands at exactly its buoyant density
      RNA: 1.6–1.8   DNA: 1.65–1.73   Proteins: 1.25–1.35
      Linear DNA: 1.70   Supercoiled DNA: 1.68 (structural density differs!)
      
    Sucrose gradient (5%–60%, ρ = 1.02–1.29 g/cm³):
      Gentler; preserves biological activity
      Ribosome separation: 40S vs 60S vs 80S by sedimentation coefficient
      
2. HEAVY LIQUID SEPARATION (mineral density separation):
    Used in geology, palaeontology, gemology.
    
    Bromoform (ρ = 2.89 g/cm³):
      Separates heavy minerals (garnet, staurolite at 3.5–4.2) from quartz (2.65)
      Highly toxic; being replaced by SPT and LST
      
    Diiodomethane / Methylene iodide (ρ = 3.325 g/cm³):
      Diamond identification: diamond ρ=3.51 sinks; most glass ρ<3.2 floats
      Gemstone sorting
      
    SPT (Sodium Polytungstate, Na₆(H₂W₁₂O₄₀)):
      Tunable 1.0–3.1 g/cm³ by dilution — single substance replaces many toxic heavies
      Non-toxic, water-soluble, recoverable by evaporation
      KEY AETHER USE: as L3 density tuning medium in Gray Substrate composite
      
    LST (Lithium Metatungstate, LiNa heteropolytungstate):
      Similar to SPT; stable to 2.95 g/cm³; fluorescence-safe (UV-transparent)
      
3. LIQUID METAL DENSITY SEPARATION:
    Mercury (ρ=13.534) floats all materials below:
      FLOATS ON MERCURY: everything in this catalog except nothing
      Gold (ρ=19.3) sinks through mercury → ancient gold panning
      Lead (ρ=11.3) sinks through mercury
      Iron (ρ=7.87) sinks; steel floats on mercury (density < 7.87)
      Humans float on mercury (avg ρ_human ≈ 0.985 g/cm³)
      
4. MICROFLUIDIC DENSITY SEPARATIONS:
    Lab-on-chip density gradient uses immiscible liquids in microchannels:
      PFPE (fluorocarbon, ρ=1.9) as outer carrier phase
      Aqueous droplets as inner phase (ρ≈1.0)
      Continuous density gradient chips separate cells in <1 min
      
5. MAGNETIC DENSITY SEPARATION:
    Ferrofluid in magnetic gradient field:
      Effective density of ferrofluid increases in field direction
      Non-magnetic objects can be levitated at their isopycnic height
      Herd et al. 2012: full metal sorting system using permanent magnet array
      Levitation height z = (ρ_obj − ρ_fluid) / (χ · dH²/dz)  → reads density directly`}</EQBlock>

        {/* ── IV ── */}
        <Sect id="s4" n="IV" title="Tunable Density Materials" sub="Substances whose density can be programmatically adjusted: SPT, ferrofluids, magnetorheological fluids" col={MIX} />
        <EQBlock col={MIX}>{`Density tuning mechanisms:

1. DILUTION-TUNABLE (SPT, LST):
    SPT density as function of concentration c (g/mL):
    ρ(c) = 1.000 + 0.0205·c − 2.8×10⁻⁵·c²   (fitted, 0 < c < 90 g/mL)
    
    Range: ρ = 1.000 (pure water) → 3.100 (saturated)
    Resolution: ±0.005 g/cm³ achievable with precision dilution
    Recovery: evaporate water → get back dry SPT
    
    AETHER use: Gray Medium Substrate is SPT-loaded graphene oxide composite.
    Tuning SPT concentration tunes substrate density layer → tunes resonance coupling
    with BaTiO₃ particles (ρ=5.8–6.0 depending on phase).
    
2. MAGNETIC FIELD-TUNABLE (ferrofluid):
    Effective density in field H along z:
    ρ_eff(z) = ρ₀ + μ₀·χ·M·(dH/dz) / (2g)
    
    M = magnetisation (A/m), dH/dz = field gradient (A/m²)
    χ = ferrofluid magnetic susceptibility (~0.1–1.0 SI)
    
    With commercial supermagnets: ρ_eff can shift ±0.3 g/cm³ locally
    Active density tuning rate: limited by ferrofluid relaxation time τ = 3η/(kT·N)
    
3. PRESSURE-TUNABLE (all liquids, small effect):
    dρ/dP = ρ · β_T     (isothermal compressibility)
    Water: β_T = 4.5×10⁻¹⁰ Pa⁻¹
    Δρ at 100 atm ≈ +0.004 g/cm³ (small but measurable)
    
    Mercury: β_T = 3.9×10⁻¹¹ Pa⁻¹ (much less compressible)
    
4. TEMPERATURE-TUNABLE:
    dρ/dT = −ρ · α_V    (volumetric thermal expansion)
    
    Water anomaly: ρ_max at 4°C (density decreases above AND below)
    Water 20°C: 0.9982   Water 4°C: 1.0000   Water 0°C: 0.9998
    
    Gallium: melts at 29.76°C; liquid ρ = 6.095 (vs solid 5.907)
    → Gallium EXPANDS on melting (like water) — unusual for metals
    → Expansion ratio: 3.4% volume increase on melting
    
5. ELECTROCHEMICAL TUNING (electrolytic solutions):
    Adding/removing dissolved ions changes density:
    CuSO₄(aq): ρ = 1.000 + 0.109·c − 0.004·c²   (c = moles/L)
    Range: 1.000 → 1.380 g/cm³ (0 → 2.5 M)
    Controlled by electrodeposition/dissolution of copper plates in solution
    → Electrically programmable density medium`}</EQBlock>

        {/* ── V ── */}
        <Sect id="s5" n="V" title="Liquid Metal Substrates" sub="Gallium, EGaIn, Galinstan, and Mercury — room-temperature liquid conductors" col={LMT} />
        <EQBlock col={LMT}>{`Room-temperature liquid metals in AETHER substrate context:

GALLIUM (Ga, ρ=6.095, melts 29.76°C):
  Electrical conductivity: 6.8×10⁶ S/m (vs copper 5.8×10⁷ — 8× less but still metallic)
  Surface tension: 735 mN/m (vs water 72 mN/m — 10× higher → forms beads)
  Oxide skin: spontaneous Ga₂O₃ forms in <1s in air; 0.5–3 nm thick
  Yield stress of skin: ~0.5 N/m → holds shape against gravity; breaks at ~5% strain
  Skin removal: 1M HCl etches Ga₂O₃ → bare Ga flows freely
  
  KEY PROPERTIES for stretchable electronics:
    Remains conductive under 1000% strain when microconfined
    Self-healing: broken contacts reseal when surfaces touch (oxide rejoins)
    Biocompatible: non-toxic, passes safety tests for skin-contact electronics
    
  AETHER application: Ga-filled microchannels in Gray Medium Substrate
    → Reconfigurable conductive pathways
    → Antenna frequency tunable by channel shape change
    → Density 6.095 places it above all organic substrates → clean density separation

EGaIn (75% Ga / 25% In by weight, ρ=6.280, melts 15.7°C):
  Lower melting point → liquid at room temperature without hand-warming
  Oxide skin slightly thinner than pure Ga
  Most common liquid metal for microfluidics research
  
GALINSTAN (68% Ga / 22% In / 10% Sn, ρ=6.440, melts −19°C):
  Liquid far below zero → cold-temperature applications
  Used in eco-thermometers (replacing mercury)
  Higher viscosity than EGaIn (~2.4 mPa·s vs 2.0)
  
MERCURY (Hg, ρ=13.534, melts −38.83°C):
  Densest room-temperature liquid on Earth
  Surface tension: 485 mN/m (most cohesive common liquid)
  Electrical conductivity: 1.04×10⁶ S/m
  Vapor pressure: 0.16 Pa at 20°C → toxic at room temperature (OSHA limit 25 μg/m³)
  
  Physical curiosities:
    An iron (ρ=7.87) ball SINKS through mercury
    A lead (ρ=11.3) ball SINKS through mercury  
    A gold (ρ=19.3) bar sinks through mercury — gold panning used mercury amalgamation
    A human body (avg ρ≈0.985) floats extremely easily on mercury surface
    
  Barometric use: 760 mm Hg = 1 atm = 101,325 Pa
    Derivation: P = ρ·g·h → h = P/(ρ·g) = 101325/(13534×9.81) = 0.7600 m
    A water barometer would need: h = 101325/(998×9.81) = 10.33 m
    Mercury's density makes the barometer pocket-sized.
    
  Replacement protocol (Ga alloys):
    Wherever Hg was used for its density + conductivity:
    → Use Ga/EGaIn (ρ≈6.1–6.4; acceptable for many applications)
    → For high-density requirements: use Bi-based alloys (ρ up to 10.1, non-toxic)
    
LIQUID METAL BIOELECTRONICS (AETHER interface):
  Ga alloys injected into living tissue as stretchable electrodes:
  Conductivity × stretchability product = σ × ε_max
  Ga: 6.8×10⁶ × 10 = 6.8×10⁷ S/m (best of any material)
  vs gold thin film: 4×10⁷ × 0.3 = 1.2×10⁷ (fails at 30% strain)
  → Gallium electrodes can follow neural tissue deformation without delaminating
  → AETHER CUCA L1 concept: Ga-microinject layer for conformal contact`}</EQBlock>

        {/* ── VI ── */}
        <Sect id="s6" n="VI" title="AETHER Substrate Stack Analogy" sub="The CUCA L0–L7 architecture as a density column: each layer a different material class" col={GOLD} />
        <EQBlock col={GOLD}>{`AETHER CUCA stack as a density column:

  The 8-layer CUCA (Coherent Unified Computational Architecture) stack:
  
  L0  Gray Medium substrate       ρ ≈ 2.1 g/cm³   (base field carrier)
  L1  PEDOT:PSS contact layer     ρ ≈ 1.011        (near-water density — soft bio interface)
  L2  Graphene oxide composite    ρ ≈ 1.001        (barely denser than water — floats on L1)
  L3  SPT density medium          ρ ≈ 1.5–2.8      (tunable! — the coupling control layer)
  L4  Nafion proton conductor     ρ ≈ 1.98         (ionic transport layer)
  L5  Photoresist (SU-8) pattern  ρ ≈ 1.07         (structural defining layer)
  L6  BaTiO₃ resonance layer      ρ ≈ 5.8–6.0      (heavy ferroelectric — sinks definitively)
  L7  Gray Medium cap             ρ ≈ 2.1          (symmetric to L0)
  
  BUT: the density column law says denser materials must be BELOW lighter ones.
  The CUCA stack VIOLATES this in several places:
    L6 (BaTiO₃, ρ=5.8) sits ABOVE L0 (Gray Medium, ρ=2.1)?
    L4 (Nafion, ρ=1.98) above L3 (SPT, ρ=1.5)?
    
  Resolution: The CUCA layers are NOT free liquids — they are thin film substrates.
  The interlayer adhesion energy >> gravitational potential for films < 100 μm thick:
  
    Gravitational PE per area: U_grav = ρ·g·h·d  [J/m²]
      For BaTiO₃ at h=50μm, d=10μm: U_grav = 5800×9.81×50e-6×10e-6 = 2.8 μJ/m²
      
    Surface adhesion energy: W_adh = 2γ cos(θ)  (Dupré work of adhesion)
      For BaTiO₃ on Nafion: W_adh ≈ 60–80 mJ/m²
      
    Adhesion >> Gravity by factor ~3000:
    → The stack holds its ordered structure against gravity for any film < 1 cm thick
    → Thin film deposition order is independent of density order — adhesion wins
    
  The CUCA density analogy works in a DIFFERENT way:
    Each layer's ρ determines its ACOUSTIC IMPEDANCE: Z = ρ · v_sound
    Z_L0 (Gray Medium): ρ=2100, v≈3000 m/s → Z ≈ 6.3 MRayl
    Z_L1 (PEDOT:PSS):   ρ=1011, v≈1600 m/s → Z ≈ 1.6 MRayl
    Z_L6 (BaTiO₃):      ρ=5800, v≈5100 m/s → Z ≈ 29.6 MRayl
    
    Acoustic reflection at interface L5/L6:
    R = ((Z_L6 − Z_L5)/(Z_L6 + Z_L5))² = ((29.6−1.7)/(29.6+1.7))² = 0.80
    → 80% of acoustic energy reflected at the BaTiO₃ interface
    → The layer acts as a near-perfect acoustic mirror — exactly the phase conjugate function!
    
  C(x,t) density field synthesis:
    The coherence function across the stack:
    C(x,t) = Π_L  exp(−|ρ_L − ρ_L-1|² / 2σ_ρ²)  [Gaussian coupling factor]
    
    Large density JUMP between layers → small C coupling factor → impedance barrier
    Small density jump → large C coupling → transparent to the coherence field
    
    Optimal stack: density monotonically increasing from bio-interface to resonance layer
    → Minimum total acoustic reflections → maximum C(x,t) propagation depth
    → BaTiO₃ at the top of the stack (L6) would be optimal for acoustic throughput,
       but the PHASE CONJUGATE reflection is the INTENDED function — not a defect.
    
    The CUCA violation of the density column IS the design.
    BaTiO₃ on top (high ρ, high Z) creates the reflective cap.
    PEDOT:PSS at the interface (low ρ, low Z) creates the transparent entry.
    The stack is an acoustic cavity — density jumps define its resonances.`}</EQBlock>

        <Pull col={GOLD}>"Every liquid finds its level. Every substrate finds its density. The mixing machine doesn't create order — it reveals the order that was always already there, written into each material's ratio of mass to volume. The CUCA stack does the same, acoustically."</Pull>

        {/* Quick reference */}
        <div style={{ marginTop: 32, padding: "16px 22px", background: MID, borderRadius: 8, border: `1px solid ${LINE}`, display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(200px,1fr))", gap: 16 }}>
          {[
            { title: "Lightest liquid", val: "Hexane  ρ=0.659", col: "#FFE4A0" },
            { title: "Water reference", val: "H₂O  ρ=1.000  @ 4°C", col: DENS },
            { title: "Densest organic", val: "CH₂I₂  ρ=3.325", col: "#F0D060" },
            { title: "Tunable (1–3.1)", val: "SPT  sodium polytungstate", col: GOLD },
            { title: "Lightest metal", val: "Ga  ρ=6.095  mp 29.8°C", col: LMT },
            { title: "Densest liquid", val: "Hg  ρ=13.534  −38.8°C", col: LMT2 },
            { title: "AETHER phase-conjugate", val: "BaTiO₃  ρ=5.8–6.0", col: MIX2 },
            { title: "Gray Medium", val: "ρ=2.1  graphite+H₂O+binder", col: PALE },
          ].map(r => (
            <div key={r.title}>
              <div style={{ fontFamily: mono, fontSize: 9, color: r.col, marginBottom: 3 }}>{r.title}</div>
              <div style={{ fontFamily: body, fontSize: 14, color: LIGHT }}>{r.val}</div>
            </div>
          ))}
        </div>
        <div style={{ fontFamily: mono, fontSize: 9, color: `${DIM}cc`, marginTop: 12, textAlign: "center" }}>
          Shia Miller · AetherLife.co · Cosmic Chaos Corporation™
        </div>
      </div>
    </div>
  );
}
