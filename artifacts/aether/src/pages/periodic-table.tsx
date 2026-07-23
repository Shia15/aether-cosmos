import { useMemo, useState, useEffect, useRef, type ReactElement, type ReactNode } from "react";
import { Link } from "wouter";
const imgAetherTable = "/api/storage/public-objects/13de39eb-e52f-42ff-8b68-3035082613d5_1782925137742.jpg";
const imgHydrostatic = "/api/storage/public-objects/805c76b0-3353-4c63-9310-1e7c2af8434f_1782925240255.jpg";
const imgIodine = "/api/storage/public-objects/9e367620-1836-47e7-ab0c-69cbb11dd5c5_1782925242089.jpg";
const C = {
  bg: "#05060C",
  panel: "#0b0e18",
  panel2: "#0e1224",
  border: "#1a2340",
  text: "#b8cce8",
  muted: "#5a708c",
  gold: "#C8A030",
};

type Cat = "visible" | "nearir" | "aether" | "biotic" | "mineral" | "operator";

type Sub = {
  z: number;
  sym: string;
  name: string;
  cat: Cat;
  disp: string;
  emit?: string;
  wl?: number;
  band?: string;
  type?: string;
  dens?: string;
  role: string;
  src: string;
  srcLabel: string;
  r?: number;
  c?: number;
};

const CAT_META: Record<Cat, { label: string; color: string }> = {
  visible: { label: "Photonic · Visible", color: "#33bbff" },
  nearir: { label: "Near-Infrared", color: "#e0417a" },
  aether: { label: "AETHER-Unknown · Void", color: "#a68bff" },
  biotic: { label: "Biotic Hydrogel", color: "#44ee88" },
  mineral: { label: "Crystalline Mineral", color: "#e8c020" },
  operator: { label: "Engine Operator", color: "#C8A030" },
};

const BIO = "/bioluminescence-spectrum";
const BIOL = "Bioluminescence Spectrum";

const EMITTERS: Sub[] = [
  { z: 1, sym: "Pv", name: "Proto-Violet", cat: "visible", disp: "#a64dff", emit: "#8800cc", wl: 388, band: "380-400 nm", role: "Highest-energy visible emitter; seeds crystallization pressure at the violet edge.", src: BIO, srcLabel: BIOL, r: 1, c: 1 },
  { z: 2, sym: "Dv", name: "Deep Violet", cat: "visible", disp: "#7d5cff", emit: "#6633ff", wl: 420, band: "400-440 nm", role: "Deep-violet pump band for early coherence nucleation.", src: BIO, srcLabel: BIOL, r: 1, c: 18 },
  { z: 3, sym: "Tb", name: "True Blue", cat: "visible", disp: "#4d6bff", emit: "#2244ff", wl: 455, band: "440-470 nm", role: "Structural blue emitter; primary boundary-layer signalling.", src: BIO, srcLabel: BIOL, r: 2, c: 1 },
  { z: 4, sym: "Ce", name: "Cerulean", cat: "visible", disp: "#33bbff", emit: "#00aaff", wl: 476, band: "470-490 nm", role: "476 nm bio-photonic emitter used in the SOI-building Cerulean node.", src: BIO, srcLabel: BIOL, r: 2, c: 2 },
  { z: 5, sym: "Cy", name: "Cyan", cat: "visible", disp: "#33e6d6", emit: "#00ddcc", wl: 493, band: "490-505 nm", role: "Cyan coherence carrier bridging blue and green channels.", src: BIO, srcLabel: BIOL, r: 2, c: 13 },
  { z: 6, sym: "Te", name: "Teal", cat: "visible", disp: "#33d69a", emit: "#00cc88", wl: 512, band: "505-525 nm", role: "Teal band; carrageenan sea-milk fluorescence window.", src: BIO, srcLabel: BIOL, r: 2, c: 14 },
  { z: 7, sym: "Gr", name: "Green", cat: "visible", disp: "#6cf06c", emit: "#44ee44", wl: 530, band: "525-545 nm", role: "Green emitter; peak biological luminance and chlorophyll coupling.", src: BIO, srcLabel: BIOL, r: 2, c: 15 },
  { z: 8, sym: "Ch", name: "Chartreuse", cat: "visible", disp: "#c2f23d", emit: "#aaee00", wl: 548, band: "545-560 nm", role: "Chartreuse transition band toward yellow synthesis.", src: BIO, srcLabel: BIOL, r: 2, c: 16 },
  { z: 9, sym: "Yg", name: "Yellow-Green", cat: "visible", disp: "#e8f24d", emit: "#ddee00", wl: 558, band: "560-575 nm", role: "Yellow-green emitter; high-visibility signalling band.", src: BIO, srcLabel: BIOL, r: 2, c: 17 },
  { z: 10, sym: "Am", name: "Amber-Yellow", cat: "visible", disp: "#ffd633", emit: "#ffcc00", wl: 572, band: "575-590 nm", role: "Amber emitter; warm coherence and calcite birefringence tint.", src: BIO, srcLabel: BIOL, r: 2, c: 18 },
  { z: 11, sym: "Or", name: "Orange", cat: "visible", disp: "#ff9a33", emit: "#ff8800", wl: 594, band: "590-615 nm", role: "Orange band; thermal-adjacent emission for warm substrates.", src: BIO, srcLabel: BIOL, r: 3, c: 1 },
  { z: 12, sym: "Ro", name: "Red-Orange", cat: "visible", disp: "#ff7033", emit: "#ff5500", wl: 617, band: "615-635 nm", role: "Red-orange emitter bridging into deep red channels.", src: BIO, srcLabel: BIOL, r: 3, c: 2 },
  { z: 13, sym: "Rd", name: "Red", cat: "visible", disp: "#ff4d4d", emit: "#ee2222", wl: 637, band: "635-655 nm", role: "Red emitter; deep-tissue penetration band.", src: BIO, srcLabel: BIOL, r: 3, c: 13 },
  { z: 14, sym: "Cr", name: "Crimson", cat: "visible", disp: "#ff3d6e", emit: "#cc0044", wl: 655, band: "655-675 nm", role: "Crimson emitter at the visible / near-IR boundary.", src: BIO, srcLabel: BIOL, r: 3, c: 14 },
  { z: 15, sym: "Ci", name: "Carmine-IR", cat: "nearir", disp: "#e0417a", emit: "#880033", wl: 690, band: "675-710 nm", role: "First near-IR band; onset of tissue-transparent emission.", src: BIO, srcLabel: BIOL, r: 3, c: 15 },
  { z: 16, sym: "Rv", name: "Rhodamine-Void", cat: "nearir", disp: "#c73f7f", emit: "#660022", wl: 728, band: "710-750 nm", role: "Near-IR void band; rhodamine-shifted deep emission.", src: BIO, srcLabel: BIOL, r: 3, c: 16 },
  { z: 17, sym: "Pi", name: "Phantom-IR", cat: "nearir", disp: "#b03f7f", emit: "#440011", wl: 760, band: "750-800 nm", role: "Phantom near-IR; last band before the AETHER-unknown regime.", src: BIO, srcLabel: BIOL, r: 3, c: 17 },
  { z: 18, sym: "φR", name: "φ-Resonance", cat: "aether", disp: "#c9a24c", emit: "#330008", wl: 831, band: "815-848 nm", role: "831 nm φ-resonance substrate; golden-ratio coherence gating.", src: BIO, srcLabel: BIOL, r: 3, c: 18 },
  { z: 19, sym: "Ve", name: "Void-Ember", cat: "aether", disp: "#ff7a45", emit: "#220005", wl: 880, band: "860-920 nm", role: "880 nm ember substrate; low-visibility high-coherence emission.", src: BIO, srcLabel: BIOL, r: 4, c: 1 },
  { z: 20, sym: "Cn", name: "Coherence-Node", cat: "aether", disp: "#35e0c0", emit: "#180004", wl: 940, band: "920-960 nm", role: "940 nm gated coherence node; the SOI-building 940 nm emitter.", src: BIO, srcLabel: BIOL, r: 4, c: 2 },
  { z: 21, sym: "Xi", name: "Crystal-IR", cat: "aether", disp: "#a68bff", emit: "#0f0002", wl: 1064, band: "1040-1090 nm", role: "1064 nm crystal-IR; Nd-class lattice pumping band.", src: BIO, srcLabel: BIOL, r: 4, c: 3 },
  { z: 22, sym: "Md", name: "Mycelium-Dark", cat: "aether", disp: "#c9a84c", emit: "#0a0001", wl: 1120, band: "1090-1200 nm", role: "1120 nm mycelium-dark substrate; filamentary dark routing.", src: BIO, srcLabel: BIOL, r: 4, c: 4 },
  { z: 23, sym: "Gn", name: "Gyroid-Null", cat: "aether", disp: "#9a7bff", emit: "#050001", wl: 1300, band: "1250-1400 nm", role: "1300 nm gyroid-null; photonic-bandgap suppression band.", src: BIO, srcLabel: BIOL, r: 4, c: 5 },
  { z: 24, sym: "φ²", name: "φ²-Overtone", cat: "aether", disp: "#ff5a8c", emit: "#030001", wl: 1377, band: "1350-1420 nm", role: "1377 nm φ² overtone of the φ-resonance substrate.", src: BIO, srcLabel: BIOL, r: 4, c: 6 },
  { z: 25, sym: "Sd", name: "Substrate-Dark", cat: "aether", disp: "#8aa0c0", emit: "#020000", wl: 1550, band: "1480-1650 nm", role: "1550 nm substrate-dark; the deep telecom / void emission floor.", src: BIO, srcLabel: BIOL, r: 4, c: 7 },
];

const SUB_SYN = "/substrate-synthesis";
const SUB_SYNL = "Substrate Synthesis Studio";

const MATERIALS: Sub[] = [
  { z: 26, sym: "Kc", name: "κ-Carrageenan", cat: "biotic", disp: "#44ee88", type: "Hydrogel", dens: "1.01-1.06 g/cm³", role: "Seamoss gate dielectric and primary transceiver substrate.", src: SUB_SYN, srcLabel: SUB_SYNL },
  { z: 27, sym: "Lc", name: "λ-Carrageenan", cat: "biotic", disp: "#2ef0d8", type: "Fluid Gel", dens: "1.00-1.03 g/cm³", role: "Sea-milk fluid-gel medium for fluid vortex tracking.", src: SUB_SYN, srcLabel: SUB_SYNL },
  { z: 28, sym: "My", name: "Mycelium Network", cat: "biotic", disp: "#c9a84c", type: "Living fungal", dens: "0.15-0.40 g/cm³", role: "Living fungal wood-wide-web analogue for filamentary signal routing.", src: SUB_SYN, srcLabel: SUB_SYNL },
  { z: 29, sym: "Dh", name: "DNA Hydrogel Scaffold", cat: "biotic", disp: "#ff5580", type: "Self-assembled", dens: "1.05-1.12 g/cm³", role: "Programmable coherence lattice; sequence-encoded pattern.", src: SUB_SYN, srcLabel: SUB_SYNL },
  { z: 30, sym: "Gy", name: "Gyroid Photonic Crystal", cat: "mineral", disp: "#9966ff", type: "CUCA v3.0", dens: "1.2-1.8 g/cm³", role: "Photonic bandgap filter; geometry as information.", src: SUB_SYN, srcLabel: SUB_SYNL },
  { z: 31, sym: "Cc", name: "CaCO₃ Crystalline Matrix", cat: "mineral", disp: "#e8c020", type: "Biogenic calcite", dens: "2.71 g/cm³", role: "Birefringent; light-as-sculptor formation pressure.", src: SUB_SYN, srcLabel: SUB_SYNL },
  { z: 32, sym: "Si", name: "Silica Nanoporous Matrix", cat: "mineral", disp: "#66ccff", type: "Sol-gel mesoporous", dens: "0.4-0.8 g/cm³", role: "AQISP coherence; nano-confined luciferase array.", src: SUB_SYN, srcLabel: SUB_SYNL },
];

const ENG = "/aether-engine";
const ENGL = "AETHER Engine";

const OPERATORS: Sub[] = [
  { z: 33, sym: "□", name: "Boundary", cat: "operator", disp: "#4488ff", type: "d'Alembertian", role: "Boundary operator; defines the synthesis domain and input surface.", src: ENG, srcLabel: ENGL },
  { z: 34, sym: "∩", name: "Curvature", cat: "operator", disp: "#9966ff", type: "Ptah Grammar", role: "Curvature operator; imposes geometric form on the field.", src: ENG, srcLabel: ENGL },
  { z: 35, sym: "Hx", name: "Helix", cat: "operator", disp: "#00ffb2", type: "Γ, ω drive", role: "Helical drive; injects circulation Γ and angular velocity ω.", src: ENG, srcLabel: ENGL },
  { z: 36, sym: "Cx", name: "C(x,t) Field", cat: "operator", disp: "#C8A030", type: "Coherence field", role: "The coherence field itself; the master synthesis observable.", src: ENG, srcLabel: ENGL },
  { z: 37, sym: "ε", name: "Veil", cat: "operator", disp: "#ff9933", type: "Error term", role: "Veil error term; suppresses manifestation below threshold.", src: ENG, srcLabel: ENGL },
  { z: 38, sym: "S*", name: "Reference", cat: "operator", disp: "#ff6699", type: "Target state", role: "Reference target; the ideal toward which synthesis converges.", src: ENG, srcLabel: ENGL },
];

const ALL: Sub[] = [...EMITTERS, ...MATERIALS, ...OPERATORS];

function hexA(h: string, a: number) {
  const n = h.replace("#", "");
  const r = parseInt(n.slice(0, 2), 16);
  const g = parseInt(n.slice(2, 4), 16);
  const b = parseInt(n.slice(4, 6), 16);
  return `rgba(${r},${g},${b},${a})`;
}

const BISMUTH = "/bismuth";

// ── Diatomic molecules ─────────────────────────────────────────
type Dia = { sym: string; name: string; bond: string; len: string; energy: string; color: string; note: string; est?: boolean };
const DIATOMICS: Dia[] = [
  { sym: "H₂", name: "Dihydrogen", bond: "Single σ", len: "74 pm", energy: "436 kJ/mol", color: "#66ccff", note: "Lightest diatomic — the proton-pair coherence seed of matter synthesis." },
  { sym: "N₂", name: "Dinitrogen", bond: "Triple σ+2π", len: "110 pm", energy: "945 kJ/mol", color: "#4d8bff", note: "Strongest common bond; an inert coherence reservoir that resists decoherence." },
  { sym: "O₂", name: "Dioxygen", bond: "Double (paramagnetic)", len: "121 pm", energy: "498 kJ/mol", color: "#44ee88", note: "Triplet ground state with two unpaired electrons; the oxidation carrier." },
  { sym: "F₂", name: "Difluorine", bond: "Single σ", len: "142 pm", energy: "159 kJ/mol", color: "#e8f24d", note: "Weak bond, extreme oxidizer; head of the halogen family." },
  { sym: "Cl₂", name: "Dichlorine", bond: "Single σ", len: "199 pm", energy: "243 kJ/mol", color: "#8ae66c", note: "Green halogen gas; strong oxidizer, −1 to +7 oxidation ladder." },
  { sym: "Br₂", name: "Dibromine", bond: "Single σ", len: "228 pm", energy: "193 kJ/mol", color: "#ff8844", note: "The only liquid halogen at room temperature; heavier congener of chlorine." },
  { sym: "I₂", name: "Diiodine", bond: "Single σ", len: "267 pm", energy: "151 kJ/mol", color: "#a68bff", note: "Sublimes violet. Solid I₂ crystallizes ORTHORHOMBIC (Cmca) and is a narrow-gap semiconductor." },
  { sym: "At₂", name: "Diastatine", bond: "Single σ (predicted)", len: "~300 pm", energy: "~116 kJ/mol", color: "#ff6699", note: "Heaviest halogen pair — metallic character, barely bound. May not exist as a stable molecule.", est: true },
];

// ── Halogen oxidation ladder (Astatine vs Iodine) ──────────────
type Ox = { v: string; color: string; i: "common" | "rare" | "no"; at: "common" | "rare" | "no" };
const OX_LADDER: Ox[] = [
  { v: "+7", color: "#ff4477", i: "common", at: "rare" },
  { v: "+5", color: "#ff8844", i: "common", at: "common" },
  { v: "+3", color: "#ffcc33", i: "common", at: "common" },
  { v: "+1", color: "#66dd88", i: "common", at: "common" },
  { v: "0", color: "#8aa0c0", i: "common", at: "common" },
  { v: "−1", color: "#4488ff", i: "common", at: "common" },
];

// ── Hexiclical geology (deck slide 4) ──────────────────────────
const GEOLOGY_HEAD = ["Substrate", "κ", "Hex Structure", "Hexiclical Phase"];
const GEOLOGY: string[][] = [
  ["Halite (NaCl)", "0.96", "Fm3̄m face-centred cubic", "Maximum order · HCP variant"],
  ["Ice (H₂O)", "0.70", "P6₃/mmc · true HCP", "Hexagonal close-packed · φ-coherent"],
  ["Granite (quartz)", "0.92", "SiO₂ trigonal P3₂21", "High order · piezoelectric coupling"],
  ["Limestone (calcite)", "0.82", "CaCO₃ R3̄c rhombohedral", "Biogenic hexiclical memory"],
  ["Magnetite (Fe₃O₄)", "0.78", "Fd3̄m spinel cubic", "Threshold · φ_d ≈ φ⁻¹"],
  ["Basalt (columnar)", "0.45", "SiO₂ + feldspar amorphous", "Partial order · cooling geometry"],
  ["Lava (molten)", "0.08", "Amorphous silicate melt", "Maximum chaos · expansion seed"],
];

// ── Ten canonical earth substrates (deck slide 6) ──────────────
const SIGNATURE_HEAD = ["Substrate", "τ", "ρ", "η", "μ", "φ_d", "κ", "Class"];
const SIGNATURE: string[][] = [
  ["Lava / Magma", "0.97", "0.62", "0.71", "0.55", "0.88", "0.08", "CHAOTIC"],
  ["Granite Bedrock", "0.22", "0.68", "0.05", "0.35", "0.28", "0.92", "COHERENT"],
  ["Ocean Water", "0.28", "0.42", "0.12", "0.18", "0.42", "0.35", "MARGINAL"],
  ["Iron Ore Deposit", "0.38", "0.95", "0.04", "0.98", "0.62", "0.78", "THRESHOLD"],
  ["Permafrost", "0.15", "0.52", "0.30", "0.12", "0.18", "0.70", "COHERENT"],
  ["Hydrothermal Vent", "0.88", "0.55", "0.25", "0.62", "0.78", "0.15", "CHAOTIC"],
  ["Salt Flat / Evaporite", "0.20", "0.48", "0.03", "0.08", "0.22", "0.96", "MAX ORDER"],
  ["Mantle Peridotite", "0.75", "0.88", "0.62", "0.45", "0.82", "0.55", "CHAOTIC"],
  ["Limestone / Carbonate", "0.18", "0.55", "0.04", "0.10", "0.32", "0.82", "COHERENT"],
  ["Volcanic Ash", "0.42", "0.22", "0.08", "0.38", "0.65", "0.20", "MARGINAL"],
];

const SIX_PARAMS = [
  { k: "τ", name: "Thermal Gradient", color: "#ff5a5a", desc: "Temperature differential across probed depth. Lava 0.97 · Permafrost 0.15" },
  { k: "ρ", name: "Density", color: "#C8A030", desc: "Normalized mass/volume (osmium reference). Iron ore 0.95 · Ash 0.22" },
  { k: "η", name: "Viscosity", color: "#33d69a", desc: "Resistance to flow (log scale). Mantle 0.62 · Salt 0.03" },
  { k: "μ", name: "Magnetic Coupling", color: "#4d8bff", desc: "Coupling to external field. Iron ore 0.98 · Salt 0.08" },
  { k: "φ_d", name: "φ-Disruption", color: "#33bbff", desc: "Degradation of the golden-ratio harmonic. Threshold φ⁻¹ = 0.618" },
  { k: "κ", name: "Crystallinity", color: "#a68bff", desc: "Fraction of hexiclical lattice order — the primary identifier." },
];

const DATA_KEY = [
  { k: "Element / Symbol", d: "Substrate identity and short code" },
  { k: "Atomic Number Z", d: "Synthesis order (wavelength rank / element Z)" },
  { k: "Atomic Mass", d: "Effective mass or peak-wavelength weight" },
  { k: "Group / Block", d: "Category family (photonic · biotic · halogen · operator)" },
  { k: "Oxidation States", d: "Charge ladder available to the substrate" },
  { k: "Crystal Structure", d: "Lattice class (HCP · FCC · orthorhombic · rhombohedral)" },
  { k: "Semiconductor", d: "Band-gap behaviour under the orthorhombic lattice" },
  { k: "φ_d Disruption", d: "Coherence class: coherent < 0.618 < decoherent" },
];

const EQS = [
  "Ψ_probe(x,t) = Ψ₀ · e^{iωt} · e^{−x/λ}",
  "λ_probe = λ₀ · C_probe / (φ_d · τ · (1−κ))",
  "k* = argmax_k exp(−‖R − S_k‖² / 2σ²)",
  "‖R − S_k‖² = 0.30Δφ_d² + 0.25Δτ² + 0.20Δκ² + 0.10Δμ² + 0.10Δρ² + 0.05Δη²",
];

export default function PeriodicTablePage() {
  const [selected, setSelected] = useState<Sub | null>(null);
  const [activeCat, setActiveCat] = useState<Cat | null>(null);
  const [query, setQuery] = useState("");
  const [diaSel, setDiaSel] = useState<Dia | null>(null);

  const q = query.trim().toLowerCase();
  const isDim = (s: Sub) => {
    if (activeCat && s.cat !== activeCat) return true;
    if (q && !(s.name.toLowerCase().includes(q) || s.sym.toLowerCase().includes(q))) return true;
    return false;
  };

  const matchCount = useMemo(() => ALL.filter((s) => !isDim(s)).length, [activeCat, q]);

  const Cell = ({ s }: { s: Sub }) => {
    const dim = isDim(s);
    const active = selected?.z === s.z;
    return (
      <button
        onClick={() => setSelected(s)}
        title={s.name}
        style={{
          gridColumn: s.c, gridRow: s.r,
          appearance: "none", cursor: "pointer", textAlign: "left",
          position: "relative", aspectRatio: "1 / 1", minWidth: 42,
          padding: "3px 4px", borderRadius: 7,
          border: `1px solid ${active ? s.disp : hexA(s.disp, 0.55)}`,
          background: active ? hexA(s.disp, 0.28) : hexA(s.disp, 0.1),
          boxShadow: active ? `0 0 14px ${hexA(s.disp, 0.55)}` : "none",
          opacity: dim ? 0.14 : 1,
          transition: "opacity 0.25s, transform 0.15s, box-shadow 0.2s, background 0.2s",
          display: "flex", flexDirection: "column", justifyContent: "space-between",
          overflow: "hidden",
        }}
        onMouseEnter={(e) => { if (!dim) e.currentTarget.style.transform = "translateY(-2px) scale(1.06)"; }}
        onMouseLeave={(e) => { e.currentTarget.style.transform = "none"; }}
      >
        <div style={{ fontSize: 8, color: hexA(s.disp, 0.85), fontFamily: "monospace", lineHeight: 1 }}>{s.z}</div>
        <div style={{ fontSize: 17, fontWeight: 800, color: s.disp, lineHeight: 1, textAlign: "center" }}>{s.sym}</div>
        <div style={{ fontSize: 6.5, color: C.muted, lineHeight: 1.05, textAlign: "center", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
          {s.wl ? `${s.wl} nm` : s.type}
        </div>
      </button>
    );
  };

  return (
    <div style={{ minHeight: "100vh", background: C.bg, color: C.text, fontFamily: "system-ui, Arial, sans-serif", padding: "26px 20px 60px", boxSizing: "border-box" }}>
      <div style={{ maxWidth: 1120, margin: "0 auto" }}>
        {/* Header */}
        <div style={{ textAlign: "center", marginBottom: 6 }}>
          <div style={{
            fontSize: 26, fontWeight: 900, letterSpacing: 1.5,
            background: "linear-gradient(90deg,#33bbff,#a68bff,#C8A030,#44ee88)",
            WebkitBackgroundClip: "text", backgroundClip: "text", color: "transparent",
          }}>
            AETHER PERIODIC TABLE
          </div>
          <div style={{ color: C.muted, fontSize: 12, marginTop: 6, letterSpacing: 1 }}>
            Matter Synthesis Substrates · 25 Emission Bands · 7 Materials · 6 Engine Operators
          </div>
        </div>

        {/* Controls */}
        <div style={{ display: "flex", flexWrap: "wrap", gap: 10, alignItems: "center", justifyContent: "center", margin: "18px 0 8px" }}>
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search substrate…"
            style={{
              background: C.panel, border: `1px solid ${C.border}`, color: C.text,
              borderRadius: 8, padding: "7px 12px", fontSize: 12, width: 200, outline: "none",
            }}
          />
          <div style={{ display: "flex", flexWrap: "wrap", gap: 6, justifyContent: "center" }}>
            {(Object.keys(CAT_META) as Cat[]).map((cat) => {
              const m = CAT_META[cat];
              const on = activeCat === cat;
              return (
                <button key={cat} onClick={() => setActiveCat(on ? null : cat)}
                  style={{
                    cursor: "pointer", fontSize: 11, padding: "5px 10px", borderRadius: 999,
                    border: `1px solid ${on ? m.color : hexA(m.color, 0.4)}`,
                    background: on ? hexA(m.color, 0.22) : "transparent",
                    color: on ? "#fff" : m.color, display: "flex", alignItems: "center", gap: 6,
                    transition: "all 0.2s",
                  }}>
                  <span style={{ width: 8, height: 8, borderRadius: "50%", background: m.color, display: "inline-block" }} />
                  {m.label}
                </button>
              );
            })}
          </div>
          <div style={{ color: C.muted, fontSize: 11, fontFamily: "monospace" }}>{matchCount} / {ALL.length} shown</div>
        </div>

        {/* Main table */}
        <div style={{ overflowX: "auto", padding: "8px 2px 4px" }}>
          <div style={{
            display: "grid", gridTemplateColumns: "repeat(18, minmax(42px, 1fr))",
            gridAutoRows: "1fr", gap: 5, minWidth: 800, margin: "0 auto",
          }}>
            {EMITTERS.map((s) => <Cell key={s.z} s={s} />)}
          </div>
        </div>

        {/* Detached series */}
        <div style={{ marginTop: 22 }}>
          <SeriesRow title="Material Substrates" subtitle="Physical media of synthesis" items={MATERIALS} Cell={Cell} />
          <SeriesRow title="Engine Operators" subtitle="Master-equation synthesis parts" items={OPERATORS} Cell={Cell} />
        </div>

        <div style={{ textAlign: "center", color: C.muted, fontSize: 11, marginTop: 26 }}>
          Click any substrate to inspect its full profile · atomic number = synthesis order by wavelength
        </div>

        {/* ── DIATOMIC MOLECULES ───────────────────────────────── */}
        <Section title="Diatomic Molecules" sub="Paired-atom substrates · click to inspect the bond" accent="#66ccff">
          <div style={{ display: "flex", flexWrap: "wrap", gap: 10, justifyContent: "center" }}>
            {DIATOMICS.map((d) => {
              const on = diaSel?.sym === d.sym;
              return (
                <button key={d.sym} onClick={() => setDiaSel(on ? null : d)} title={d.name} style={{
                  cursor: "pointer", width: 96, padding: "12px 8px", borderRadius: 12,
                  border: `1px solid ${on ? d.color : hexA(d.color, 0.5)}`,
                  background: on ? hexA(d.color, 0.22) : hexA(d.color, 0.08),
                  boxShadow: on ? `0 0 16px ${hexA(d.color, 0.5)}` : "none",
                  display: "flex", flexDirection: "column", alignItems: "center", gap: 6, transition: "all 0.2s",
                }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                    <span style={{ width: 14, height: 14, borderRadius: "50%", background: d.color, boxShadow: `0 0 8px ${d.color}` }} />
                    <span style={{ width: 12, height: 2, background: hexA(d.color, 0.7) }} />
                    <span style={{ width: 14, height: 14, borderRadius: "50%", background: d.color, boxShadow: `0 0 8px ${d.color}` }} />
                  </div>
                  <div style={{ fontSize: 18, fontWeight: 800, color: d.color }}>{d.sym}</div>
                  <div style={{ fontSize: 9, color: C.muted }}>{d.name}</div>
                </button>
              );
            })}
          </div>
          {diaSel && (
            <div style={{ marginTop: 14, background: C.panel, border: `1px solid ${hexA(diaSel.color, 0.4)}`, borderRadius: 12, padding: "14px 16px" }}>
              <div style={{ display: "flex", alignItems: "baseline", gap: 10, marginBottom: 8 }}>
                <div style={{ fontSize: 20, fontWeight: 800, color: diaSel.color }}>{diaSel.sym}</div>
                <div style={{ fontSize: 13, color: "#fff", fontWeight: 700 }}>{diaSel.name}</div>
                {diaSel.est && <div style={{ fontSize: 9, color: "#ffb84d", border: "1px solid #ffb84d55", borderRadius: 999, padding: "2px 7px" }}>ESTIMATED</div>}
              </div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 10 }}>
                <MiniStat k="Bond" v={diaSel.bond} />
                <MiniStat k="Length" v={diaSel.len} />
                <MiniStat k="Bond Energy" v={diaSel.energy} />
              </div>
              <div style={{ fontSize: 12.5, lineHeight: 1.55, color: C.text }}>{diaSel.note}</div>
            </div>
          )}
        </Section>

        {/* ── ORTHORHOMBIC SEMICONDUCTOR ───────────────────────── */}
        <Section title="Orthorhombic Structure as a Semiconductor" sub="a ≠ b ≠ c lattice, all angles 90° — the band-gap engine of solid iodine (Cmca)" accent="#33bbff">
          <OrthoSemiCanvas />
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(220px,1fr))", gap: 10, marginTop: 12 }}>
            <MathCard eq="σ(T) = σ₀ · e^(−E_g / 2kT)" note="Intrinsic conductivity rises exponentially as the band gap E_g shrinks or temperature T rises." />
            <MathCard eq="n_i ∝ T^(3/2) · e^(−E_g / 2kT)" note="Carrier concentration across the gap — the number of electrons promoted to the conduction band." />
            <MathCard eq="orthorhombic: a ≠ b ≠ c, α = β = γ = 90°" note="Three unequal axes at right angles. Solid I₂ is Cmca orthorhombic; heavier At trends metallic (gap → 0)." />
          </div>
        </Section>

        {/* ── STRUCTURE FLOW: FORM & DECAY ─────────────────────── */}
        <Section title="Structure Flow — Formation & Decay" sub="How the hexiclical lattice crystallizes and dissolves, driven by φ-disruption" accent="#a68bff">
          <StructureFlowCanvas />
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(220px,1fr))", gap: 10, marginTop: 12 }}>
            <MathCard eq="dκ/dt = α · (φ⁻¹ − φ_d)" note="Order parameter κ (crystallinity) grows when disruption φ_d is below the golden threshold φ⁻¹ = 0.618, and decays above it." />
            <MathCard eq="C(x,t) = κ · A(x) · cos(ωt − φ)" note="The coherence field amplitude scales with lattice order κ: full form when coherent, collapse when decoherent." />
            <MathCard eq="φ_d < 0.618 → FORM   ·   φ_d > 0.618 → DECAY" note="The single inversion boundary between matter crystallizing and matter dissolving back into the one atom." />
          </div>
        </Section>

        {/* ── ASTATINE & HYDROASTATIC ACID ─────────────────────── */}
        <Section title="Astatine · Hydroastatic Acid · Oxidation States" sub="At (Z=85) — the heaviest halogen, chemically a heavier iodine" accent="#ff6699">
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(260px,1fr))", gap: 14 }}>
            <div style={{ background: C.panel, border: `1px solid ${C.border}`, borderRadius: 12, padding: 16 }}>
              <div style={{ fontSize: 11, color: C.muted, fontFamily: "monospace", marginBottom: 10 }}>OXIDATION-STATE LADDER · At vs I</div>
              <div style={{ display: "flex", gap: 22, justifyContent: "center" }}>
                <OxColumn label="At" pick="at" />
                <OxColumn label="I" pick="i" />
              </div>
              <div style={{ display: "flex", gap: 14, justifyContent: "center", marginTop: 12, fontSize: 10, color: C.muted }}>
                <span><span style={{ opacity: 1 }}>█</span> common</span>
                <span><span style={{ opacity: 0.4 }}>█</span> rare / predicted</span>
              </div>
            </div>
            <div style={{ background: C.panel, border: `1px solid ${C.border}`, borderRadius: 12, padding: 16 }}>
              <div style={{ fontSize: 13, fontWeight: 800, color: "#ff6699", marginBottom: 8 }}>Hydroastatic Acid · HAt</div>
              <div style={{ fontSize: 12.5, lineHeight: 1.6, color: C.text }}>
                The astatine analogue of hydroiodic acid (HI). Like iodine, astatine forms a hydrogen halide HAt whose aqueous solution is a strong acid ("hydro-astatic acid"). Because At is heavier and more metallic than I, the H–At bond is the weakest of all hydrogen halides — it dissociates almost completely, and the At⁻ ion sits at the bottom of the oxidation ladder.
              </div>
              <div style={{ marginTop: 12, fontFamily: "monospace", fontSize: 12, color: "#ffb0cc" }}>HAt → H⁺ + At⁻ &nbsp;(oxidation state −1)</div>
              <Link href={BISMUTH} style={{
                display: "inline-flex", alignItems: "center", gap: 8, marginTop: 14, textDecoration: "none",
                fontSize: 12, padding: "8px 14px", borderRadius: 8,
                border: "1px solid #ff669988", color: "#ff9ac1", background: "#ff669918",
              }}>
                How astatine is made: Bismuth + alpha particles →
              </Link>
            </div>
          </div>
        </Section>

        {/* ── DATA UNDERNEATH THE TABLE ────────────────────────── */}
        <Section title="Data Underneath the Table" sub="Every substrate carries a full data record — pulled from across the AETHER system" accent="#C8A030">
          <div style={{ fontSize: 11, color: C.muted, fontFamily: "monospace", marginBottom: 8 }}>DATA FIELDS ENCODED PER ELEMENT</div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(200px,1fr))", gap: 8, marginBottom: 22 }}>
            {DATA_KEY.map((f) => (
              <div key={f.k} style={{ background: C.panel, border: `1px solid ${C.border}`, borderRadius: 8, padding: "8px 10px" }}>
                <div style={{ fontSize: 11.5, fontWeight: 700, color: "#e6eeff", marginBottom: 3 }}>{f.k}</div>
                <div style={{ fontSize: 10.5, color: C.muted, lineHeight: 1.4 }}>{f.d}</div>
              </div>
            ))}
          </div>

          <div style={{ fontSize: 11, color: C.muted, fontFamily: "monospace", marginBottom: 8 }}>SIX-PARAMETER SUBSTRATE SIGNATURE · S = (τ, ρ, η, μ, φ_d, κ)</div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(220px,1fr))", gap: 8, marginBottom: 22 }}>
            {SIX_PARAMS.map((p) => (
              <div key={p.k} style={{ background: C.panel, border: `1px solid ${hexA(p.color, 0.35)}`, borderLeft: `3px solid ${p.color}`, borderRadius: 8, padding: "8px 10px" }}>
                <div style={{ fontSize: 12, fontWeight: 800, color: p.color, marginBottom: 3 }}>{p.k} — {p.name}</div>
                <div style={{ fontSize: 10.5, color: C.muted, lineHeight: 1.4 }}>{p.desc}</div>
              </div>
            ))}
          </div>

          <div style={{ fontSize: 11, color: C.muted, fontFamily: "monospace", marginBottom: 8 }}>HEXICLICAL GEOLOGY · every rock is a phase of hexiclical expansion</div>
          <DeckTable head={GEOLOGY_HEAD} rows={GEOLOGY} accent="#33d69a" />

          <div style={{ fontSize: 11, color: C.muted, fontFamily: "monospace", margin: "22px 0 8px" }}>TEN CANONICAL EARTH SUBSTRATES · full signature vectors</div>
          <DeckTable head={SIGNATURE_HEAD} rows={SIGNATURE} accent="#C8A030" />

          <div style={{ fontSize: 11, color: C.muted, fontFamily: "monospace", margin: "22px 0 8px" }}>DECOHERENCE-INVERSION EQUATIONS</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {EQS.map((e, i) => (
              <div key={i} style={{ background: C.panel, border: `1px solid ${C.border}`, borderLeft: "3px solid #C8A030", borderRadius: 8, padding: "9px 12px", fontFamily: "monospace", fontSize: 12, color: "#e6d6a0", overflowX: "auto" }}>{e}</div>
            ))}
          </div>
        </Section>

        {/* ── SOURCE ATLAS ─────────────────────────────────────── */}
        <Section title="Source Atlas" sub="The AETHER periodic-table concept plates" accent="#a68bff">
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(240px,1fr))", gap: 12 }}>
            <Plate src={imgAetherTable} cap="AETHER periodic table — diatomic molecules, orthorhombic semiconductor, and matter-synthesis substrates." />
            <Plate src={imgHydrostatic} cap="AETHER System — hydrostatic acid, orthorhombic structure, and Astatine oxidation states." />
            <Plate src={imgIodine} cap="Clickable halogens — H₂, O₂, N₂, F₂, Br₂, I₂ diatomics with the full data key." />
          </div>
        </Section>
      </div>

      {/* Detail overlay */}
      {selected && (
        <div
          onClick={() => setSelected(null)}
          style={{
            position: "fixed", inset: 0, background: "rgba(2,3,8,0.72)", zIndex: 50,
            display: "flex", alignItems: "center", justifyContent: "center", padding: 20,
          }}
        >
          <div onClick={(e) => e.stopPropagation()} style={{
            width: "min(460px, 100%)", background: C.panel2,
            border: `1px solid ${hexA(selected.disp, 0.5)}`, borderRadius: 16,
            boxShadow: `0 0 40px ${hexA(selected.disp, 0.3)}`, padding: 22, position: "relative",
          }}>
            <button onClick={() => setSelected(null)} style={{
              position: "absolute", top: 12, right: 14, cursor: "pointer",
              background: "transparent", border: "none", color: C.muted, fontSize: 20, lineHeight: 1,
            }}>×</button>

            <div style={{ display: "flex", gap: 16, alignItems: "center", marginBottom: 16 }}>
              <div style={{
                width: 84, height: 84, borderRadius: 12, flexShrink: 0,
                border: `1px solid ${selected.disp}`, background: hexA(selected.disp, 0.16),
                display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center",
              }}>
                <div style={{ fontSize: 10, color: hexA(selected.disp, 0.85), fontFamily: "monospace" }}>{selected.z}</div>
                <div style={{ fontSize: 34, fontWeight: 900, color: selected.disp, lineHeight: 1 }}>{selected.sym}</div>
              </div>
              <div>
                <div style={{ fontSize: 19, fontWeight: 800, color: "#fff" }}>{selected.name}</div>
                <div style={{
                  display: "inline-block", marginTop: 6, fontSize: 10.5, padding: "3px 9px",
                  borderRadius: 999, border: `1px solid ${hexA(CAT_META[selected.cat].color, 0.5)}`,
                  color: CAT_META[selected.cat].color, background: hexA(CAT_META[selected.cat].color, 0.12),
                }}>{CAT_META[selected.cat].label}</div>
              </div>
            </div>

            {/* Stats */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 16 }}>
              {selected.band && <Stat k="Emission Band" v={selected.band} />}
              {selected.wl && <Stat k="Peak Wavelength" v={`${selected.wl} nm`} />}
              {selected.wl && <Stat k="Photon Energy" v={`${(1239.84 / selected.wl).toFixed(2)} eV`} />}
              {selected.type && <Stat k="Type" v={selected.type} />}
              {selected.dens && <Stat k="Density" v={selected.dens} />}
              {selected.emit && (
                <div style={{ background: C.panel, border: `1px solid ${C.border}`, borderRadius: 8, padding: "7px 9px" }}>
                  <div style={{ fontSize: 9, color: C.muted, fontFamily: "monospace", marginBottom: 4 }}>EMISSION COLOR</div>
                  <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
                    <span style={{ width: 16, height: 16, borderRadius: 4, background: selected.emit, border: `1px solid ${C.border}` }} />
                    <span style={{ fontSize: 12, color: C.text, fontFamily: "monospace" }}>{selected.emit}</span>
                  </div>
                </div>
              )}
            </div>

            {/* Role */}
            <div style={{ fontSize: 9, color: C.muted, fontFamily: "monospace", marginBottom: 5 }}>SYNTHESIS ROLE</div>
            <div style={{ fontSize: 13.5, lineHeight: 1.55, color: C.text, marginBottom: 18 }}>{selected.role}</div>

            <Link href={selected.src} style={{
              display: "inline-flex", alignItems: "center", gap: 8, textDecoration: "none",
              fontSize: 12, padding: "8px 14px", borderRadius: 8,
              border: `1px solid ${hexA(selected.disp, 0.5)}`, color: selected.disp,
              background: hexA(selected.disp, 0.1), cursor: "pointer",
            }}>
              Open source · {selected.srcLabel} →
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}

function Stat({ k, v }: { k: string; v: string }) {
  return (
    <div style={{ background: "#0b0e18", border: "1px solid #1a2340", borderRadius: 8, padding: "7px 9px" }}>
      <div style={{ fontSize: 9, color: "#5a708c", fontFamily: "monospace", marginBottom: 3 }}>{k.toUpperCase()}</div>
      <div style={{ fontSize: 13, color: "#e6eeff", fontWeight: 600 }}>{v}</div>
    </div>
  );
}

function SeriesRow({ title, subtitle, items, Cell }: {
  title: string; subtitle: string; items: Sub[];
  Cell: (props: { s: Sub }) => ReactElement;
}) {
  return (
    <div style={{ marginBottom: 16 }}>
      <div style={{ display: "flex", alignItems: "baseline", gap: 10, marginBottom: 8, paddingLeft: 2 }}>
        <div style={{ fontSize: 12, fontWeight: 800, color: "#b8cce8", letterSpacing: 0.5 }}>{title}</div>
        <div style={{ fontSize: 10.5, color: "#5a708c" }}>{subtitle}</div>
      </div>
      <div style={{ overflowX: "auto" }}>
        <div style={{ display: "flex", gap: 5, minWidth: "min-content" }}>
          {items.map((s) => (
            <div key={s.z} style={{ width: 62, flexShrink: 0 }}>
              <Cell s={s} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function Section({ title, sub, accent, children }: { title: string; sub: string; accent: string; children: ReactNode }) {
  return (
    <div style={{ marginTop: 40 }}>
      <div style={{ borderLeft: `3px solid ${accent}`, paddingLeft: 12, marginBottom: 16 }}>
        <div style={{ fontSize: 17, fontWeight: 800, color: "#fff" }}>{title}</div>
        <div style={{ fontSize: 11.5, color: "#5a708c", marginTop: 3 }}>{sub}</div>
      </div>
      {children}
    </div>
  );
}

function MiniStat({ k, v }: { k: string; v: string }) {
  return (
    <div style={{ background: "#0e1224", border: "1px solid #1a2340", borderRadius: 8, padding: "6px 10px" }}>
      <div style={{ fontSize: 8.5, color: "#5a708c", fontFamily: "monospace", marginBottom: 2 }}>{k.toUpperCase()}</div>
      <div style={{ fontSize: 12.5, color: "#e6eeff", fontWeight: 600 }}>{v}</div>
    </div>
  );
}

function MathCard({ eq, note }: { eq: string; note: string }) {
  return (
    <div style={{ background: "#0b0e18", border: "1px solid #1a2340", borderRadius: 10, padding: "10px 12px" }}>
      <div style={{ fontFamily: "monospace", fontSize: 12.5, color: "#7fd6ff", marginBottom: 6, overflowX: "auto" }}>{eq}</div>
      <div style={{ fontSize: 11, color: "#8ea6c4", lineHeight: 1.5 }}>{note}</div>
    </div>
  );
}

function OxColumn({ label, pick }: { label: string; pick: "i" | "at" }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 5 }}>
      <div style={{ fontSize: 13, fontWeight: 800, color: "#fff", marginBottom: 3 }}>{label}</div>
      {OX_LADDER.map((o) => {
        const state = pick === "i" ? o.i : o.at;
        const op = state === "common" ? 1 : state === "rare" ? 0.35 : 0.08;
        return (
          <div key={o.v} style={{
            width: 52, textAlign: "center", padding: "5px 0", borderRadius: 6,
            fontFamily: "monospace", fontSize: 12.5, fontWeight: 700,
            color: "#05060C", background: o.color, opacity: op,
          }}>{o.v}</div>
        );
      })}
    </div>
  );
}

function DeckTable({ head, rows, accent }: { head: string[]; rows: string[][]; accent: string }) {
  return (
    <div style={{ overflowX: "auto", border: "1px solid #1a2340", borderRadius: 10 }}>
      <table style={{ borderCollapse: "collapse", width: "100%", minWidth: 520, fontSize: 11.5 }}>
        <thead>
          <tr>
            {head.map((h) => (
              <th key={h} style={{ background: hexA(accent, 0.16), color: accent, textAlign: "left", padding: "8px 10px", fontWeight: 700, borderBottom: `1px solid ${hexA(accent, 0.4)}`, whiteSpace: "nowrap" }}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((r, ri) => (
            <tr key={ri} style={{ background: ri % 2 ? "#0b0e18" : "#0e1224" }}>
              {r.map((cell, ci) => (
                <td key={ci} style={{ padding: "7px 10px", color: ci === 0 ? "#e6eeff" : "#a8bcd8", borderBottom: "1px solid #14192e", whiteSpace: ci === 0 ? "nowrap" : "normal", fontWeight: ci === 0 ? 600 : 400 }}>{cell}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function Plate({ src, cap }: { src: string; cap: string }) {
  return (
    <figure style={{ margin: 0, background: "#0b0e18", border: "1px solid #1a2340", borderRadius: 12, overflow: "hidden" }}>
      <img src={src} alt={cap} style={{ width: "100%", display: "block", borderBottom: "1px solid #1a2340" }} />
      <figcaption style={{ fontSize: 10.5, color: "#8ea6c4", lineHeight: 1.5, padding: "9px 11px" }}>{cap}</figcaption>
    </figure>
  );
}

function fitCanvas(cv: HTMLCanvasElement, ctx: CanvasRenderingContext2D) {
  const dpr = Math.min(2, window.devicePixelRatio || 1);
  const w = cv.clientWidth || 600;
  const h = cv.clientHeight || 240;
  cv.width = Math.round(w * dpr);
  cv.height = Math.round(h * dpr);
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  return { w, h };
}

function OrthoSemiCanvas() {
  const cref = useRef<HTMLCanvasElement>(null);
  const egRef = useRef(0.6);
  const tRef = useRef(300);
  const sigOut = useRef<HTMLSpanElement>(null);
  const niOut = useRef<HTMLSpanElement>(null);
  const clsOut = useRef<HTMLSpanElement>(null);
  const [eg, setEg] = useState(0.6);
  const [temp, setTemp] = useState(300);

  useEffect(() => {
    const cv = cref.current;
    if (!cv) return;
    const ctx = cv.getContext("2d");
    if (!ctx) return;
    let raf = 0;
    let t = 0;
    let dim = fitCanvas(cv, ctx);
    const onR = () => { dim = fitCanvas(cv, ctx); };
    window.addEventListener("resize", onR);

    const carriers: { x: number; y: number; vx: number; ph: number }[] = [];

    const loop = () => {
      t += 0.016;
      const w = dim.w;
      const h = dim.h;
      ctx.clearRect(0, 0, w, h);
      ctx.fillStyle = "#070912";
      ctx.fillRect(0, 0, w, h);

      const kT = 8.617e-5 * tRef.current;
      const sigRel = Math.exp(-egRef.current / (2 * Math.max(1e-6, kT)));
      const safeSig = isFinite(sigRel) ? sigRel : 0;

      // ── LEFT: orthorhombic unit cell ──
      const cx = w * 0.26;
      const cy = h * 0.5;
      const a = 62, b = 42, c = 92; // a != b != c
      const ang = 0.5 + 0.12 * Math.sin(t * 0.4);
      const proj = (x: number, y: number, z: number) => {
        const xr = x * Math.cos(ang) + z * Math.sin(ang);
        const zr = -x * Math.sin(ang) + z * Math.cos(ang);
        return { X: cx + xr - zr * 0.32, Y: cy + y - zr * 0.22 };
      };
      const corners: { X: number; Y: number }[] = [];
      const cs = [-0.5, 0.5];
      for (const i of cs) for (const j of cs) for (const k of cs) corners.push(proj(i * a, j * b, k * c));
      const edges = [[0, 1], [0, 2], [0, 4], [1, 3], [1, 5], [2, 3], [2, 6], [3, 7], [4, 5], [4, 6], [5, 7], [6, 7]];
      ctx.strokeStyle = "rgba(51,187,255,0.55)";
      ctx.lineWidth = 1.4;
      for (const [p, qd] of edges) {
        ctx.beginPath();
        ctx.moveTo(corners[p].X, corners[p].Y);
        ctx.lineTo(corners[qd].X, corners[qd].Y);
        ctx.stroke();
      }
      for (const cpt of corners) {
        const g = ctx.createRadialGradient(cpt.X, cpt.Y, 0, cpt.X, cpt.Y, 8);
        g.addColorStop(0, "#9fe0ff");
        g.addColorStop(1, "rgba(51,187,255,0.1)");
        ctx.fillStyle = g;
        ctx.beginPath();
        ctx.arc(cpt.X, cpt.Y, 6, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.fillStyle = "rgba(120,150,190,0.7)";
      ctx.font = "10px monospace";
      ctx.fillText("a", cx + a * 0.5, cy + b * 0.5 + 18);
      ctx.fillText("b", cx - a * 0.5 - 12, cy);
      ctx.fillText("c", cx + a * 0.2, cy - b * 0.5 - 26);

      // ── RIGHT: band diagram ──
      const bx = w * 0.55;
      const bw = w * 0.4;
      const vbTop = h * 0.72;
      const cbBot = h * 0.28;
      const gapNorm = Math.min(1, egRef.current / 2);
      const gapPx = (vbTop - cbBot) * (0.25 + 0.55 * gapNorm);
      const gapTop = (vbTop + cbBot) / 2 + gapPx / 2;
      const gapBot = (vbTop + cbBot) / 2 - gapPx / 2;
      // valence band
      ctx.fillStyle = "rgba(70,110,160,0.35)";
      ctx.fillRect(bx, gapTop, bw, vbTop - gapTop + 10);
      // conduction band
      ctx.fillStyle = "rgba(168,132,58,0.28)";
      ctx.fillRect(bx, cbBot - 10, bw, gapBot - cbBot + 10);
      ctx.fillStyle = "rgba(200,220,255,0.7)";
      ctx.font = "10px monospace";
      ctx.fillText("conduction band", bx, cbBot - 16);
      ctx.fillText("valence band", bx, vbTop + 22);
      // gap arrow
      ctx.strokeStyle = "rgba(255,180,80,0.7)";
      ctx.beginPath();
      ctx.moveTo(bx + bw / 2, gapBot);
      ctx.lineTo(bx + bw / 2, gapTop);
      ctx.stroke();
      ctx.fillStyle = "#ffcf80";
      ctx.fillText(`E_g = ${egRef.current.toFixed(2)} eV`, bx + bw / 2 + 6, (gapTop + gapBot) / 2 + 3);

      // spawn carriers proportional to conductivity
      const pSpawn = Math.min(0.5, safeSig * 6000);
      if (Math.random() < pSpawn && carriers.length < 70) {
        carriers.push({ x: bx + 14 + Math.random() * (bw - 28), y: gapTop, vx: (Math.random() - 0.5) * 0.6, ph: 0 });
      }
      for (let i = carriers.length - 1; i >= 0; i--) {
        const p = carriers[i];
        p.ph += 0.02;
        p.y -= 1.1;
        p.x += p.vx;
        if (p.y < gapBot - 4) { p.y = gapBot - 4 - (2 + Math.sin(p.ph * 4) * 2); p.x += p.vx; }
        if (p.y < cbBot - 12 || p.x < bx + 4 || p.x > bx + bw - 4) { carriers.splice(i, 1); continue; }
        ctx.fillStyle = "#ffe1a0";
        ctx.beginPath();
        ctx.arc(p.x, p.y, 2.4, 0, Math.PI * 2);
        ctx.fill();
      }

      // readouts
      let cls = "Insulator";
      if (egRef.current <= 0.15) cls = "Conductor-like";
      else if (safeSig > 1e-4) cls = "Semiconductor";
      const ni = Math.pow(tRef.current, 1.5) * safeSig;
      if (sigOut.current) sigOut.current.textContent = safeSig.toExponential(2);
      if (niOut.current) niOut.current.textContent = (isFinite(ni) ? ni : 0).toExponential(2);
      if (clsOut.current) clsOut.current.textContent = cls;

      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => { cancelAnimationFrame(raf); window.removeEventListener("resize", onR); };
  }, []);

  return (
    <div>
      <canvas ref={cref} style={{ width: "100%", height: 240, display: "block", borderRadius: 12, border: "1px solid #1a2340", background: "#070912" }} />
      <div style={{ display: "flex", flexWrap: "wrap", gap: 18, alignItems: "center", marginTop: 12 }}>
        <label style={{ fontSize: 11, color: "#8ea6c4", display: "flex", flexDirection: "column", gap: 4, minWidth: 180 }}>
          <span>Band gap E_g — {eg.toFixed(2)} eV</span>
          <input type="range" min={0.05} max={2} step={0.01} value={eg} onChange={(e) => { const v = parseFloat(e.target.value); setEg(v); egRef.current = v; }} />
        </label>
        <label style={{ fontSize: 11, color: "#8ea6c4", display: "flex", flexDirection: "column", gap: 4, minWidth: 180 }}>
          <span>Temperature T — {temp} K</span>
          <input type="range" min={100} max={800} step={5} value={temp} onChange={(e) => { const v = parseFloat(e.target.value); setTemp(v); tRef.current = v; }} />
        </label>
        <div style={{ display: "flex", gap: 10 }}>
          <div style={{ background: "#0b0e18", border: "1px solid #1a2340", borderRadius: 8, padding: "6px 10px" }}>
            <div style={{ fontSize: 8.5, color: "#5a708c", fontFamily: "monospace" }}>σ / σ₀</div>
            <div style={{ fontSize: 12.5, color: "#7fd6ff", fontFamily: "monospace" }}><span ref={sigOut}>—</span></div>
          </div>
          <div style={{ background: "#0b0e18", border: "1px solid #1a2340", borderRadius: 8, padding: "6px 10px" }}>
            <div style={{ fontSize: 8.5, color: "#5a708c", fontFamily: "monospace" }}>n_i (rel)</div>
            <div style={{ fontSize: 12.5, color: "#ffe1a0", fontFamily: "monospace" }}><span ref={niOut}>—</span></div>
          </div>
          <div style={{ background: "#0b0e18", border: "1px solid #1a2340", borderRadius: 8, padding: "6px 10px" }}>
            <div style={{ fontSize: 8.5, color: "#5a708c", fontFamily: "monospace" }}>REGIME</div>
            <div style={{ fontSize: 12.5, color: "#a8ffcf", fontFamily: "monospace" }}><span ref={clsOut}>—</span></div>
          </div>
        </div>
      </div>
    </div>
  );
}

function StructureFlowCanvas() {
  const cref = useRef<HTMLCanvasElement>(null);
  const phiRef = useRef(0.4);
  const kOut = useRef<HTMLSpanElement>(null);
  const regOut = useRef<HTMLSpanElement>(null);
  const [phi, setPhi] = useState(0.4);

  useEffect(() => {
    const cv = cref.current;
    if (!cv) return;
    const ctx = cv.getContext("2d");
    if (!ctx) return;
    let raf = 0;
    let kappa = 0.5;
    let dim = fitCanvas(cv, ctx);
    const onR = () => { dim = fitCanvas(cv, ctx); };
    window.addEventListener("resize", onR);

    const COLS = 12, ROWS = 7;
    const sites: { ox: number; oy: number; ph: number }[] = [];
    for (let i = 0; i < COLS * ROWS; i++) {
      sites.push({ ox: (Math.random() - 0.5) * 60, oy: (Math.random() - 0.5) * 60, ph: Math.random() * Math.PI * 2 });
    }

    const loop = () => {
      const w = dim.w;
      const h = dim.h;
      const target = phiRef.current < 0.618 ? 1 : 0;
      kappa += (target - kappa) * 0.03;
      kappa = Math.max(0, Math.min(1, kappa));

      ctx.clearRect(0, 0, w, h);
      ctx.fillStyle = "#080611";
      ctx.fillRect(0, 0, w, h);

      const marginX = 60, marginY = 34;
      const gw = w - marginX * 2;
      const gh = h - marginY * 2;
      const pts: { x: number; y: number }[] = [];
      for (let r = 0; r < ROWS; r++) {
        for (let cc = 0; cc < COLS; cc++) {
          const idx = r * COLS + cc;
          const s = sites[idx];
          const lx = marginX + (cc / (COLS - 1)) * gw;
          const ly = marginY + (r / (ROWS - 1)) * gh;
          s.ph += 0.01;
          const wob = (1 - kappa) * 8;
          const x = lx * kappa + (lx + s.ox) * (1 - kappa) + Math.sin(s.ph) * wob;
          const y = ly * kappa + (ly + s.oy) * (1 - kappa) + Math.cos(s.ph) * wob;
          pts.push({ x, y });
        }
      }
      // bonds (only when ordered)
      ctx.strokeStyle = `rgba(166,139,255,${0.5 * kappa})`;
      ctx.lineWidth = 1;
      for (let r = 0; r < ROWS; r++) {
        for (let cc = 0; cc < COLS; cc++) {
          const idx = r * COLS + cc;
          if (cc < COLS - 1) { ctx.beginPath(); ctx.moveTo(pts[idx].x, pts[idx].y); ctx.lineTo(pts[idx + 1].x, pts[idx + 1].y); ctx.stroke(); }
          if (r < ROWS - 1) { ctx.beginPath(); ctx.moveTo(pts[idx].x, pts[idx].y); ctx.lineTo(pts[idx + COLS].x, pts[idx + COLS].y); ctx.stroke(); }
        }
      }
      // sites
      for (const p of pts) {
        const alpha = 0.2 + 0.8 * kappa;
        const rad = 3 + 3 * kappa;
        const g = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, rad + 4);
        g.addColorStop(0, `rgba(200,180,255,${alpha})`);
        g.addColorStop(1, "rgba(120,90,200,0)");
        ctx.fillStyle = g;
        ctx.beginPath();
        ctx.arc(p.x, p.y, rad + 4, 0, Math.PI * 2);
        ctx.fill();
      }

      if (kOut.current) kOut.current.textContent = (kappa * 100).toFixed(0) + "%";
      if (regOut.current) regOut.current.textContent = target === 1 ? "FORMING" : "DECAYING";

      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => { cancelAnimationFrame(raf); window.removeEventListener("resize", onR); };
  }, []);

  return (
    <div>
      <canvas ref={cref} style={{ width: "100%", height: 240, display: "block", borderRadius: 12, border: "1px solid #1a2340", background: "#080611" }} />
      <div style={{ display: "flex", flexWrap: "wrap", gap: 18, alignItems: "center", marginTop: 12 }}>
        <label style={{ fontSize: 11, color: "#8ea6c4", display: "flex", flexDirection: "column", gap: 4, minWidth: 240 }}>
          <span>φ-disruption φ_d — {phi.toFixed(3)} &nbsp;(threshold φ⁻¹ = 0.618)</span>
          <input type="range" min={0} max={1} step={0.005} value={phi} onChange={(e) => { const v = parseFloat(e.target.value); setPhi(v); phiRef.current = v; }} />
        </label>
        <div style={{ display: "flex", gap: 10 }}>
          <div style={{ background: "#0b0e18", border: "1px solid #1a2340", borderRadius: 8, padding: "6px 10px" }}>
            <div style={{ fontSize: 8.5, color: "#5a708c", fontFamily: "monospace" }}>κ ORDER</div>
            <div style={{ fontSize: 12.5, color: "#c8b0ff", fontFamily: "monospace" }}><span ref={kOut}>—</span></div>
          </div>
          <div style={{ background: "#0b0e18", border: "1px solid #1a2340", borderRadius: 8, padding: "6px 10px" }}>
            <div style={{ fontSize: 8.5, color: "#5a708c", fontFamily: "monospace" }}>REGIME</div>
            <div style={{ fontSize: 12.5, color: "#a8ffcf", fontFamily: "monospace" }}><span ref={regOut}>—</span></div>
          </div>
        </div>
      </div>
    </div>
  );
}
