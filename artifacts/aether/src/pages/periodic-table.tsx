import { useMemo, useState, type ReactElement } from "react";
import { Link } from "wouter";

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

export default function PeriodicTablePage() {
  const [selected, setSelected] = useState<Sub | null>(null);
  const [activeCat, setActiveCat] = useState<Cat | null>(null);
  const [query, setQuery] = useState("");

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
