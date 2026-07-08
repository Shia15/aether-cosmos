import React, { useEffect, useRef, useState } from "react";
import { Link } from "wouter";
import { ArrowUpRight } from "lucide-react";

const B = {
  bg: "#070918",
  ink: "#E7ECF7",
  dim: "#9AA3B8",
  gold: "#E6B85C",
  cyan: "#7CD7FF",
  green: "#7CE0B0",
  amber: "#F2A007",
  rose: "#F49AB6",
  violet: "#B49CFF",
  panel: "rgba(255,255,255,0.04)",
  line: "rgba(255,255,255,0.10)",
};

function H({ num, label, accent }: { num: string; label: string; accent: string }) {
  return (
    <div style={{ marginBottom: 14 }}>
      <div style={{ fontFamily: "Inter, sans-serif", fontSize: 11, letterSpacing: 2.2, color: B.dim, textTransform: "uppercase" }}>
        Section <span style={{ color: accent }}>{num}</span>
      </div>
      <h2 style={{ fontFamily: '"Cinzel", serif', fontSize: 26, color: B.ink, fontVariant: "small-caps", letterSpacing: 1, margin: 0, fontWeight: 500 }}>{label}</h2>
    </div>
  );
}

function Chip({ children, accent, kind = "solid" }: { children: React.ReactNode; accent: string; kind?: "solid" | "ghost" }) {
  return (
    <span style={{
      display: "inline-block",
      padding: "5px 12px",
      borderRadius: 999,
      fontFamily: "Inter, sans-serif",
      fontSize: 11,
      letterSpacing: 1.5,
      textTransform: "uppercase",
      color: accent,
      border: `1px solid ${accent}55`,
      background: kind === "ghost" ? "transparent" : `${accent}11`,
      marginRight: 8,
      marginBottom: 8,
    }}>
      {children}
    </span>
  );
}

function Card({ children, accent, className = "" }: { children: React.ReactNode; accent?: string; className?: string }) {
  return (
    <div className={className} style={{
      background: B.panel,
      border: `1px solid ${accent ? accent + "33" : B.line}`,
      borderRadius: 14,
      padding: 18,
    }}>
      {children}
    </div>
  );
}

function Bridge({ to, label, accent }: { to: string; label: string; accent: string }) {
  return (
    <Link
      href={to}
      data-testid={`bridge-${to.slice(1)}`}
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 6,
        padding: "10px 14px",
        borderRadius: 10,
        background: `${accent}11`,
        border: `1px solid ${accent}55`,
        color: accent,
        fontFamily: "Inter, sans-serif",
        fontSize: 12,
        letterSpacing: 1.2,
        textTransform: "uppercase",
        textDecoration: "none",
        marginRight: 10,
        marginBottom: 10,
      }}
    >
      {label} <ArrowUpRight size={12} />
    </Link>
  );
}

function Swatch({ hex, name }: { hex: string; name: string }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4, minWidth: 70 }}>
      <div style={{ width: 56, height: 56, borderRadius: 8, background: hex, border: `1px solid ${B.line}` }} />
      <div style={{ fontFamily: "Inter, sans-serif", fontSize: 9.5, color: B.dim, letterSpacing: 0.6, textAlign: "center" }}>
        <div style={{ color: B.ink }}>{name}</div>
        <div style={{ fontFamily: "ui-monospace, monospace", fontSize: 9 }}>{hex}</div>
      </div>
    </div>
  );
}

function RegionRow({ region, latin, common, accent }: { region: string; latin: string; common: string; accent: string }) {
  return (
    <div style={{
      display: "grid",
      gridTemplateColumns: "140px 1fr",
      gap: 14,
      padding: "8px 0",
      borderBottom: `1px dashed ${B.line}`,
      fontFamily: "Inter, sans-serif",
      fontSize: 12.5,
      color: B.ink,
    }}>
      <div style={{ color: accent, fontSize: 10.5, letterSpacing: 1.4, textTransform: "uppercase", paddingTop: 2 }}>{region}</div>
      <div>
        <div>{common}</div>
        <div style={{ color: B.dim, fontSize: 11, fontStyle: "italic" }}>{latin}</div>
      </div>
    </div>
  );
}

type SeasonData = {
  name: string;
  glyph: string;
  arc: string;
  signature: string;
  accent: string;
  palette: { hex: string; name: string }[];
  flora: { region: string; common: string; latin: string }[];
};

const SEASONS: SeasonData[] = [
  {
    name: "Spring",
    glyph: "✿",
    arc: "Mar Equinox → Jun Solstice",
    signature: "Germination · cold→warm gradient unlocks",
    accent: B.green,
    palette: [
      { hex: "#B7E4C7", name: "Pale Jade" },
      { hex: "#FFB7C5", name: "Cherry Blush" },
      { hex: "#C7E1FF", name: "Sky Veil" },
      { hex: "#F2D27E", name: "Honey Gold" },
      { hex: "#E8D5F2", name: "Wisteria" },
    ],
    flora: [
      { region: "N · America",  common: "Eastern Redbud · Flowering Dogwood · Trillium",        latin: "Cercis canadensis · Cornus florida · Trillium grandiflorum" },
      { region: "S · America",  common: "Ipê Amarelo · Lapacho",                                 latin: "Handroanthus albus · Handroanthus impetiginosus" },
      { region: "Mesoamerica",  common: "Pink Trumpet · Jacaranda",                              latin: "Tabebuia rosea · Jacaranda mimosifolia" },
      { region: "Japan",        common: "Sakura · Tsutsuji",                                     latin: "Prunus serrulata · Rhododendron indicum" },
      { region: "China",        common: "Plum Blossom · Peach Blossom",                          latin: "Prunus mume · Prunus persica" },
      { region: "Europe",       common: "Snowdrop · Bluebell · Primrose",                        latin: "Galanthus nivalis · Hyacinthoides non-scripta · Primula vulgaris" },
      { region: "India",        common: "Palash · Kachnar",                                      latin: "Butea monosperma · Bauhinia variegata" },
      { region: "Africa",       common: "Coral Tree · Sweet Thorn Acacia",                       latin: "Erythrina abyssinica · Vachellia karroo" },
      { region: "Oceania",      common: "Wattle · Kowhai (NZ)",                                  latin: "Acacia pycnantha · Sophora microphylla" },
    ],
  },
  {
    name: "Summer",
    glyph: "☀",
    arc: "Jun Solstice → Sep Equinox",
    signature: "Culmination · longest light, full canopy",
    accent: B.amber,
    palette: [
      { hex: "#1B3A6F", name: "Deep Lapis" },
      { hex: "#F2A007", name: "Marigold" },
      { hex: "#2D6A4F", name: "Forest Green" },
      { hex: "#C53030", name: "Ember Red" },
      { hex: "#FFE066", name: "Solar Cream" },
    ],
    flora: [
      { region: "N · America",  common: "Southern Magnolia · Black-Eyed Susan · Sunflower",      latin: "Magnolia grandiflora · Rudbeckia hirta · Helianthus annuus" },
      { region: "S · America",  common: "Yellow Trumpet · Ceibo",                                latin: "Tabebuia chrysotricha · Erythrina crista-galli" },
      { region: "Mesoamerica",  common: "Frangipani · Cempasúchil",                              latin: "Plumeria rubra · Tagetes erecta" },
      { region: "Japan",        common: "Ajisai · Lotus · Morning Glory",                        latin: "Hydrangea macrophylla · Nelumbo nucifera · Ipomoea nil" },
      { region: "China",        common: "Lotus · Tree Peony",                                    latin: "Nelumbo nucifera · Paeonia suffruticosa" },
      { region: "Europe",       common: "Lavender · Damask Rose · Linden",                       latin: "Lavandula angustifolia · Rosa damascena · Tilia × europaea" },
      { region: "India",        common: "Gulmohar · Sampige · Mogra",                            latin: "Delonix regia · Magnolia champaca · Jasminum sambac" },
      { region: "Africa",       common: "Flamboyant · Bird of Paradise · Frangipani",            latin: "Delonix regia · Strelitzia reginae · Plumeria rubra" },
      { region: "Oceania",      common: "Pohutukawa (NZ Christmas) · Waratah",                   latin: "Metrosideros excelsa · Telopea speciosissima" },
    ],
  },
  {
    name: "Autumn",
    glyph: "❦",
    arc: "Sep Equinox → Dec Solstice",
    signature: "Release · chlorophyll withdraw, carotenoids reveal",
    accent: B.rose,
    palette: [
      { hex: "#C0392B", name: "Maple Red" },
      { hex: "#E67E22", name: "Persimmon" },
      { hex: "#B8860B", name: "Ochre" },
      { hex: "#6B3FA0", name: "Plum Dusk" },
      { hex: "#5C3A21", name: "Earth Brown" },
    ],
    flora: [
      { region: "N · America",  common: "Sugar Maple · Goldenrod · New England Aster",           latin: "Acer saccharum · Solidago canadensis · Symphyotrichum novae-angliae" },
      { region: "S · America",  common: "Quebracho Colorado · Erythrina (late)",                 latin: "Schinopsis balansae · Erythrina crista-galli" },
      { region: "Mesoamerica",  common: "Mexican Marigold · Cempasúchil (Day of the Dead)",      latin: "Tagetes lucida · Tagetes erecta" },
      { region: "Japan",        common: "Momiji · Higanbana · Kiku",                             latin: "Acer palmatum · Lycoris radiata · Chrysanthemum × morifolium" },
      { region: "China",        common: "Chrysanthemum · Osmanthus · Persimmon",                 latin: "Chrysanthemum × morifolium · Osmanthus fragrans · Diospyros kaki" },
      { region: "Europe",       common: "Heather · European Beech · Larch",                      latin: "Calluna vulgaris · Fagus sylvatica · Larix decidua" },
      { region: "India",        common: "Marigold · Frangipani · Champa",                        latin: "Tagetes erecta · Plumeria rubra · Plumeria alba" },
      { region: "Africa",       common: "King Protea · Bushwillow",                              latin: "Protea cynaroides · Combretum molle" },
      { region: "Oceania",      common: "Banksia · NZ Beech",                                    latin: "Banksia integrifolia · Lophozonia menziesii" },
    ],
  },
  {
    name: "Winter",
    glyph: "❄",
    arc: "Dec Solstice → Mar Equinox",
    signature: "Root · contraction, evergreen vigil, latent code",
    accent: B.cyan,
    palette: [
      { hex: "#E5E7EB", name: "Snow Silver" },
      { hex: "#14532D", name: "Pine Deep" },
      { hex: "#8B0000", name: "Holly Red" },
      { hex: "#1E1B4B", name: "Indigo Night" },
      { hex: "#C9A227", name: "Candle Gold" },
    ],
    flora: [
      { region: "N · America",  common: "American Holly · Witch Hazel · White Pine · Hellebore", latin: "Ilex opaca · Hamamelis virginiana · Pinus strobus · Helleborus orientalis" },
      { region: "S · America",  common: "Araucaria · Notro (winter-summer S Hem)",               latin: "Araucaria araucana · Embothrium coccineum" },
      { region: "Mesoamerica",  common: "Poinsettia · Cempasúchil (late)",                       latin: "Euphorbia pulcherrima · Tagetes erecta" },
      { region: "Japan",        common: "Tsubaki · Ume (late) · Nanten",                         latin: "Camellia japonica · Prunus mume · Nandina domestica" },
      { region: "China",        common: "Wintersweet · Bamboo · Plum (late)",                    latin: "Chimonanthus praecox · Phyllostachys edulis · Prunus mume" },
      { region: "Europe",       common: "Yew · Mistletoe · Hellebore · Scots Pine",              latin: "Taxus baccata · Viscum album · Helleborus niger · Pinus sylvestris" },
      { region: "India",        common: "Sarson (Mustard) · Chrysanthemum · Marigold",           latin: "Brassica juncea · Chrysanthemum × morifolium · Tagetes erecta" },
      { region: "Africa",       common: "Aloe Ferox · Silver Tree (Leucadendron)",               latin: "Aloe ferox · Leucadendron argenteum" },
      { region: "Oceania",      common: "Snow Gum · Mountain Ash",                               latin: "Eucalyptus pauciflora · Eucalyptus regnans" },
    ],
  },
];

const CALENDARS = [
  { name: "Gregorian",                  count: "4 quarters",     anchors: "Solstices · Equinoxes (Mar 20, Jun 21, Sep 22, Dec 21)" },
  { name: "Celtic Wheel of the Year",   count: "8 spokes",       anchors: "Imbolc · Ostara · Beltane · Litha · Lughnasadh · Mabon · Samhain · Yule" },
  { name: "Chinese 24 Jiéqì (节气)",     count: "24 nodes",       anchors: "Lìchūn → Dàhán · 15-day micro-seasons tracking the Sun" },
  { name: "Japanese Nijūshi Sekki",     count: "24 + 72 kō",     anchors: "Same 24 base · subdivided into 72 five-day phenological cards" },
  { name: "Hindu Ritu (ऋतु)",            count: "6 seasons",      anchors: "Vasanta · Grīṣma · Varṣā · Śarad · Hemanta · Śiśira" },
  { name: "Aztec Xiuhpōhualli",         count: "18 × 20 + 5",    anchors: "18 veintenas of 20 days + 5 nemontemi · solar 365" },
  { name: "Lakota Moon Calendar",       count: "13 moons",       anchors: "Moon When the Wolves Run Together · Moon of Popping Trees · 13 lunations" },
  { name: "Hopi Soyal Cycle",           count: "Solar year",     anchors: "Soyal (winter solstice) · Powamu · Niman · Wuwuchim — kachina arc" },
  { name: "Andean / Inka Year",         count: "12 months",      anchors: "Capac Raymi (Dec) · Inti Raymi (Jun) · solstice festivals" },
];

function radians(deg: number) { return (deg * Math.PI) / 180; }
function fmt(n: number, d = 3) { return n.toFixed(d); }

function LiveEquation({ hemisphere, setHemisphere }: { hemisphere: "N" | "S"; setHemisphere: (h: "N" | "S") => void }) {
  const [now, setNow] = useState(new Date());
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 30000);
    return () => clearInterval(id);
  }, []);

  const startOfYearUTC = Date.UTC(now.getUTCFullYear(), 0, 1);
  const tDays = (now.getTime() - startOfYearUTC) / 86400000;
  const tDay  = (now.getUTCHours() + now.getUTCMinutes() / 60) / 24;

  const hemiPhase = hemisphere === "S" ? Math.PI : 0;
  const Phi_D = Math.cos(2 * Math.PI * tDay);
  const Phi_S = Math.cos(2 * Math.PI * (tDays / 91.31) + hemiPhase);
  const Phi_Y = Math.cos(2 * Math.PI * (tDays / 365.25) - radians(11.5) + hemiPhase);
  const yearsSinceEpoch = (now.getUTCFullYear() - 1900) + tDays / 365.25;
  const Phi_G = Math.cos(2 * Math.PI * (yearsSinceEpoch / 27));
  const C = (Phi_D + Phi_S + Phi_Y + Phi_G) / 4;

  const nSeasonIdx = Math.floor(((tDays + 365.25 - 79) % 365.25) / (365.25 / 4)) % 4;
  const seasonIdx = hemisphere === "S" ? (nSeasonIdx + 2) % 4 : nSeasonIdx;
  const seasonName = ["Spring", "Summer", "Autumn", "Winter"][seasonIdx];

  const rows: { k: string; v: string; col: string; sym: string }[] = [
    { k: "Φ_D · Daily",        v: fmt(Phi_D), col: B.amber,  sym: "T = 1 d" },
    { k: "Φ_S · Seasonal",     v: fmt(Phi_S), col: B.green,  sym: "T = 91.31 d" },
    { k: "Φ_Y · Yearly",       v: fmt(Phi_Y), col: B.cyan,   sym: "T = 365.25 d · φ = −11.5°" },
    { k: "Φ_G · Generational", v: fmt(Phi_G), col: B.violet, sym: "T = 27 a" },
  ];

  return (
    <Card accent={B.gold}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", flexWrap: "wrap", gap: 12 }}>
        <div style={{ fontFamily: "Inter, sans-serif", fontSize: 11, letterSpacing: 2, color: B.gold, textTransform: "uppercase" }}>
          Live · Φ(t) · {now.toUTCString().split(" GMT")[0]} UTC
        </div>
        <div style={{ display: "inline-flex", gap: 4, padding: 3, borderRadius: 8, border: `1px solid ${B.line}`, background: "rgba(0,0,0,0.3)" }}>
          {(["N", "S"] as const).map(h => (
            <button
              key={h}
              type="button"
              onClick={() => setHemisphere(h)}
              data-testid={`hemisphere-${h}`}
              style={{
                padding: "4px 12px",
                borderRadius: 6,
                background: hemisphere === h ? `${B.gold}33` : "transparent",
                color: hemisphere === h ? B.gold : B.dim,
                border: `1px solid ${hemisphere === h ? B.gold + "77" : "transparent"}`,
                fontFamily: "Inter, sans-serif",
                fontSize: 10.5,
                letterSpacing: 1.4,
                textTransform: "uppercase",
                cursor: "pointer",
              }}
            >
              {h === "N" ? "Northern" : "Southern"} Hem
            </button>
          ))}
        </div>
      </div>

      <div style={{
        marginTop: 14,
        padding: 16,
        background: "rgba(0,0,0,0.35)",
        border: `1px solid ${B.line}`,
        borderRadius: 10,
        fontFamily: "ui-monospace, monospace",
        fontSize: 14,
        color: B.ink,
        lineHeight: 1.7,
      }}>
        <div>Φ(t) = ¼ · [ Φ_D(t) + Φ_S(t) + Φ_Y(t) + Φ_G(t) ]</div>
        <div style={{ color: B.dim, fontSize: 12, marginTop: 4 }}>
          Φ_i(t) = A_i · cos(2π · t / T_i + φ_i)   ·   Cohere(t) ≡ Φ(t) ∈ [−1, +1]
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 10, marginTop: 14 }}>
        {rows.map(r => (
          <div key={r.k} style={{ background: "rgba(0,0,0,0.25)", border: `1px solid ${r.col}33`, borderRadius: 8, padding: 12 }}>
            <div style={{ fontFamily: "Inter, sans-serif", fontSize: 10.5, letterSpacing: 1.4, color: r.col, textTransform: "uppercase" }}>{r.k}</div>
            <div style={{ fontFamily: "ui-monospace, monospace", fontSize: 22, color: B.ink, marginTop: 4 }}>{r.v}</div>
            <div style={{ fontFamily: "ui-monospace, monospace", fontSize: 10.5, color: B.dim, marginTop: 2 }}>{r.sym}</div>
          </div>
        ))}
      </div>

      <div style={{
        marginTop: 14,
        padding: 14,
        background: `linear-gradient(90deg, ${B.gold}11, transparent)`,
        border: `1px solid ${B.gold}55`,
        borderRadius: 10,
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        flexWrap: "wrap",
        gap: 12,
      }}>
        <div>
          <div style={{ fontFamily: "Inter, sans-serif", fontSize: 10.5, letterSpacing: 1.6, color: B.dim, textTransform: "uppercase" }}>Coherence Φ(t)</div>
          <div style={{ fontFamily: "ui-monospace, monospace", fontSize: 28, color: B.gold }}>{fmt(C)}</div>
        </div>
        <div>
          <div style={{ fontFamily: "Inter, sans-serif", fontSize: 10.5, letterSpacing: 1.6, color: B.dim, textTransform: "uppercase" }}>Active Season</div>
          <div style={{ fontFamily: '"Cinzel", serif', fontSize: 22, color: B.ink, fontVariant: "small-caps", letterSpacing: 1 }}>{seasonName}</div>
        </div>
      </div>
    </Card>
  );
}

function SeasonWheel() {
  const cx = 140, cy = 140, r = 110;
  const labels = SEASONS.map((s, i) => {
    const angle = -90 + i * 90 + 45;
    const x = cx + (r - 18) * Math.cos(radians(angle));
    const y = cy + (r - 18) * Math.sin(radians(angle));
    return { ...s, angle, x, y };
  });
  return (
    <svg viewBox="0 0 280 280" style={{ width: "100%", maxWidth: 320, height: "auto" }}>
      <defs>
        <radialGradient id="wheel-bg" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#0e1430" />
          <stop offset="100%" stopColor="#070918" />
        </radialGradient>
      </defs>
      <circle cx={cx} cy={cy} r={r} fill="url(#wheel-bg)" stroke={B.line} />
      {[0, 90, 180, 270].map(a => {
        const x1 = cx + r * Math.cos(radians(a - 90));
        const y1 = cy + r * Math.sin(radians(a - 90));
        return <line key={a} x1={cx} y1={cy} x2={x1} y2={y1} stroke={B.line} />;
      })}
      {labels.map((l, i) => (
        <g key={i}>
          <circle cx={l.x} cy={l.y} r={22} fill={`${l.accent}22`} stroke={`${l.accent}77`} />
          <text x={l.x} y={l.y - 2} textAnchor="middle" fill={l.accent} style={{ fontFamily: "Inter, sans-serif", fontSize: 14 }}>{l.glyph}</text>
          <text x={l.x} y={l.y + 12} textAnchor="middle" fill={B.ink} style={{ fontFamily: "Inter, sans-serif", fontSize: 9, letterSpacing: 1 }}>{l.name.toUpperCase()}</text>
        </g>
      ))}
      <circle cx={cx} cy={cy} r={4} fill={B.gold} />
      <text x={cx} y={cy + 22} textAnchor="middle" fill={B.dim} style={{ fontFamily: "Inter, sans-serif", fontSize: 9, letterSpacing: 2 }}>Φ(t)</text>
    </svg>
  );
}

function SeasonalCoherenceCanvas() {
  const cvRef = useRef<HTMLCanvasElement>(null);
  const rafRef = useRef(0);
  const tRef = useRef(0);
  const W = 860, H = 200;
  const WAVES = [
    { label:"Daily · 24h",          color:"#E6B85C", freq:0.042, amp:26, phase:0 },
    { label:"Seasonal · 91d",        color:"#7CE0B0", freq:0.011, amp:32, phase:1.1 },
    { label:"Yearly · 365d",         color:"#7CD7FF", freq:0.0028, amp:20, phase:2.2 },
    { label:"Generational · 27y",    color:"#B49CFF", freq:0.0003, amp:38, phase:0.5 },
  ];
  useEffect(() => {
    const cv = cvRef.current; if (!cv) return;
    const ctx = cv.getContext("2d"); if (!ctx) return;
    cv.width = W; cv.height = H;
    function draw() {
      ctx.clearRect(0, 0, W, H);
      ctx.fillStyle = "#070918"; ctx.fillRect(0, 0, W, H);
      const midY = H / 2;
      const t = tRef.current;
      const sumLine: number[] = [];
      WAVES.forEach((w, wi) => {
        ctx.beginPath();
        for (let x = 0; x <= W; x++) {
          const theta = (x / W) * 6 * Math.PI + t * w.freq + w.phase;
          const y = midY + Math.sin(theta) * w.amp * 0.7;
          if (x === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
          sumLine[x] = (sumLine[x] || 0) + Math.sin(theta) * w.amp * 0.7;
        }
        ctx.strokeStyle = w.color + "88";
        ctx.lineWidth = 1.2;
        ctx.stroke();
        const labelX = 8 + wi * 210;
        const labelY = 14 + wi * 14;
        ctx.fillStyle = w.color;
        ctx.font = "8px 'Space Mono', monospace";
        ctx.fillText(w.label, labelX, labelY);
      });
      ctx.beginPath();
      for (let x = 0; x <= W; x++) {
        const y = midY + (sumLine[x] || 0) / 3.5;
        if (x === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
      }
      ctx.strokeStyle = "#ffffff";
      ctx.lineWidth = 2;
      ctx.stroke();
      ctx.fillStyle = "#ffffff";
      ctx.font = "bold 8px 'Space Mono', monospace";
      ctx.fillText("Φ(t) composite", W - 110, 14);
      ctx.strokeStyle = "rgba(255,255,255,0.08)";
      ctx.lineWidth = 1;
      ctx.beginPath(); ctx.moveTo(0, midY); ctx.lineTo(W, midY); ctx.stroke();
      tRef.current += 0.4;
      rafRef.current = requestAnimationFrame(draw);
    }
    draw();
    return () => cancelAnimationFrame(rafRef.current);
  }, []);
  return <canvas ref={cvRef} style={{ width:"100%", height:"auto", display:"block", borderRadius:6 }} />;
}

function SeasonalCoherenceHeaderCanvas() {
  const ref = useRef<HTMLCanvasElement>(null);
  const rafRef = useRef(0);
  useEffect(() => {
    const canvas = ref.current; if (!canvas) return;
    const ctx = canvas.getContext("2d")!;
    canvas.width = 900; canvas.height = 145;
    const W = canvas.width, H = canvas.height;
    let t=0;
    const seasons=[
      {x:115,col:"#2ef0d8",label:"SPRING"},
      {x:305,col:"#44cc77",label:"SUMMER"},
      {x:495,col:"#c9a84c",label:"AUTUMN"},
      {x:685,col:"#44aaff",label:"WINTER"},
    ];
    const draw=()=>{
      ctx.fillStyle="rgba(2,4,8,0.3)"; ctx.fillRect(0,0,W,H);
      seasons.forEach((s,i)=>{
        const amp=40+10*Math.sin(t*0.03+i*Math.PI/2);
        ctx.beginPath();
        for(let x=s.x-90;x<=s.x+90;x+=3){
          const y=H/2+amp*Math.sin((x-s.x)*0.05+t*0.04+i*Math.PI/2);
          x===s.x-90?ctx.moveTo(x,y):ctx.lineTo(x,y);
        }
        ctx.strokeStyle=s.col+"88";ctx.lineWidth=1;ctx.stroke();
        ctx.fillStyle=s.col;ctx.font="bold 7px 'DM Mono',monospace";ctx.textAlign="center";ctx.fillText(s.label,s.x,H-10);ctx.textAlign="left";
      });
      ctx.fillStyle="rgba(46,240,216,0.3)"; ctx.font="9px 'DM Mono',monospace";
      ctx.fillText("SEASONAL COHERENCE · CIRCADIAN RHYTHM · FIELD SYNC · AETHER",14,14);
      t++; rafRef.current=requestAnimationFrame(draw);
    };
    draw();
    return ()=>cancelAnimationFrame(rafRef.current);
  },[]);
  return <canvas ref={ref} style={{width:"100%",height:"auto",borderRadius:8,display:"block"}} />;
}

export default function SeasonalCoherencePage() {
  const [hemisphere, setHemisphere] = useState<"N" | "S">("N");
  return (
    <div data-testid="seasonal-coherence-page" style={{ background: B.bg, minHeight: "100vh", color: B.ink, padding: "40px 32px 80px" }}>
      <div style={{ maxWidth: 1180, margin: "0 auto" }}>

        <div style={{ marginBottom: 28 }}>
          <div style={{ fontFamily: "Inter, sans-serif", fontSize: 11, letterSpacing: 2.2, color: B.gold, textTransform: "uppercase" }}>
            Seasonal Coherence Engine · Daily ↻ Seasonal ↻ Yearly ↻ Generational
          </div>
          <h1 style={{ fontFamily: '"Cinzel", serif', fontSize: 44, fontVariant: "small-caps", letterSpacing: 1.5, marginTop: 6, marginBottom: 0, fontWeight: 500, color: B.ink }}>Φ(t) · One Equation, Four Clocks</h1>
          <div style={{ fontFamily: "Inter, sans-serif", fontSize: 14.5, color: B.ink, opacity: 0.92, marginTop: 12, maxWidth: 880, lineHeight: 1.65 }}>
            A single coherence equation that sums four oscillators — <em>day</em>, <em>season</em>, <em>year</em>, and <em>generation</em> —
            and a per-season library of colours, native trees, and flowers across the Americas, East Asia, Europe, India, Africa, and Oceania.
            The point is not to predict; the point is to keep one stable mathematical posture as the data changes.
          </div>

          <div style={{ marginTop: 14 }}>
            <Chip accent={B.gold}>Daily · 24h</Chip>
            <Chip accent={B.green}>Seasonal · 91.31d</Chip>
            <Chip accent={B.cyan}>Yearly · 365.25d</Chip>
            <Chip accent={B.violet}>Generational · 27a</Chip>
            <Chip accent={B.rose}>9 calendar systems</Chip>
            <Chip accent={B.amber}>9 regional flora rows × 4 seasons</Chip>
          </div>
        </div>

        <div style={{ marginBottom:28 }}>
          <div style={{ display:"inline-block", background:"rgba(230,184,92,0.1)", border:"1px solid rgba(230,184,92,0.3)",
            borderRadius:8, padding:"0.3rem 1rem", fontSize:"0.7rem", letterSpacing:"0.2em",
            color:B.gold, textTransform:"uppercase", fontFamily:"Inter,sans-serif", marginBottom:12 }}>
            Live Simulation
          </div>
          <div style={{ background:B.panel, border:`1px solid ${B.line}`, borderLeft:`3px solid ${B.gold}`,
            borderRadius:10, padding:20 }}>
            <h2 style={{ fontFamily:'"Cinzel",serif', fontSize:18, color:B.ink, margin:"0 0 6px", fontVariant:"small-caps" }}>
              Φ(t) · Four Coherence Oscillators
            </h2>
            <p style={{ fontFamily:"Inter,sans-serif", fontSize:12, color:B.dim, margin:"0 0 14px", lineHeight:1.65 }}>
              Daily (gold) · Seasonal (green) · Yearly (cyan) · Generational (violet) — each sine wave scrolls at its
              own frequency. The bright white line is Φ(t), their composite sum: one equation, four clocks.
            </p>
            <SeasonalCoherenceCanvas />
          </div>
        </div>

        <Card accent={B.gold} className="">
          <div style={{ fontFamily: "Inter, sans-serif", fontSize: 11, color: B.gold, letterSpacing: 1.8, textTransform: "uppercase" }}>How to read this page</div>
          <div style={{ fontFamily: "Inter, sans-serif", fontSize: 13.5, color: B.ink, marginTop: 8, lineHeight: 1.65 }}>
            <span style={{ color: B.gold }}>Section 01</span> states the equation and shows it computed live for this exact moment.
            <span style={{ color: B.green }}> Section 02</span> walks the four oscillators that feed Φ(t).
            <span style={{ color: B.cyan }}> Section 03</span> opens the four seasonal cards — colors, flora, regional naming.
            <span style={{ color: B.violet }}> Section 04</span> aligns nine calendar systems against the same wheel.
            The honest line at the bottom marks where this stops being physics and becomes ritual scaffolding.
          </div>
        </Card>

        <section data-testid="section-equation" style={{ marginTop: 36 }}>
          <H num="01" label="The Unified Equation · Φ(t)" accent={B.gold} />
          <LiveEquation hemisphere={hemisphere} setHemisphere={setHemisphere} />
        </section>

        <section data-testid="section-oscillators" style={{ marginTop: 36 }}>
          <H num="02" label="Four Oscillators · Daily ↻ Seasonal ↻ Yearly ↻ Generational" accent={B.green} />
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 12 }}>
            {[
              { c: B.amber,  k: "Daily · T = 1 d",          d: "Light/dark switching · cortisol→melatonin · core body temp 24-h sweep · mood floor & ceiling.",  glyph: "☀ ↔ ☾" },
              { c: B.green,  k: "Seasonal · T ≈ 91.3 d",   d: "Solstice→equinox quadrant · sap rise, leaf drop, hibernation · the fastest planetary mood swing.", glyph: "✿ ☀ ❦ ❄" },
              { c: B.cyan,   k: "Yearly · T = 365.25 d",   d: "Anniversary memory · annual calendars, harvests, religious cycles · the civic phase you negotiate with.", glyph: "↻ 1 yr" },
              { c: B.violet, k: "Generational · T ≈ 27 a", d: "Saeculum quarter · cohort identity, mythic shift · slowest visible oscillator inside one human life.",   glyph: "⏳ 27 a" },
            ].map(o => (
              <Card key={o.k} accent={o.c}>
                <div style={{ fontFamily: "Inter, sans-serif", fontSize: 10.5, letterSpacing: 1.6, color: o.c, textTransform: "uppercase" }}>{o.k}</div>
                <div style={{ fontFamily: '"Cinzel", serif', fontSize: 26, color: B.ink, marginTop: 6 }}>{o.glyph}</div>
                <div style={{ fontFamily: "Inter, sans-serif", fontSize: 12.5, color: B.ink, opacity: 0.88, marginTop: 8, lineHeight: 1.6 }}>{o.d}</div>
              </Card>
            ))}
          </div>
        </section>

        <section data-testid="section-seasons" style={{ marginTop: 36 }}>
          <H num="03" label="Four Seasons · Color · Tree · Flower · By Region" accent={B.cyan} />

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 18, alignItems: "start", marginBottom: 18 }}>
            <Card accent={B.cyan}>
              <div style={{ fontFamily: "Inter, sans-serif", fontSize: 11, letterSpacing: 1.6, color: B.cyan, textTransform: "uppercase" }}>The Year as a Wheel</div>
              <div style={{ display: "flex", justifyContent: "center", marginTop: 8 }}>
                <SeasonWheel />
              </div>
              <div style={{ fontFamily: "Inter, sans-serif", fontSize: 11.5, color: B.dim, marginTop: 6, lineHeight: 1.55 }}>
                Cardinal compass · NE = Spring, SE = Summer, SW = Autumn, NW = Winter (Northern reference; mirror for the Southern Hemisphere).
              </div>
            </Card>
            <Card accent={B.cyan}>
              <div style={{ fontFamily: "Inter, sans-serif", fontSize: 11, letterSpacing: 1.6, color: B.cyan, textTransform: "uppercase" }}>Reading the cards</div>
              <ul style={{ fontFamily: "Inter, sans-serif", fontSize: 13, color: B.ink, opacity: 0.92, lineHeight: 1.7, marginTop: 8, paddingLeft: 18 }}>
                <li><b>Palette</b> — five canonical hues per season, given as named swatches with hex.</li>
                <li><b>Flora</b> — nine rows: North America · South America · Mesoamerica · Japan · China · Europe · India · Africa · Oceania, each with common names and Latin binomial.</li>
                <li><b>Signature</b> — a one-line ecological posture (germination, culmination, release, root).</li>
                <li><b>Hemispheric note</b> — Southern Hemisphere entries (S America, S Africa, Oceania) are listed under their own ecological season, not the calendar month.</li>
              </ul>
            </Card>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 420px), 1fr))", gap: 18 }}>
            {SEASONS.map(s => (
              <Card key={s.name} accent={s.accent}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", gap: 12 }}>
                  <div>
                    <div style={{ fontFamily: "Inter, sans-serif", fontSize: 10.5, letterSpacing: 1.6, color: s.accent, textTransform: "uppercase" }}>{s.arc}</div>
                    <div style={{ fontFamily: '"Cinzel", serif', fontSize: 30, fontVariant: "small-caps", letterSpacing: 1, color: B.ink, marginTop: 2 }}>
                      <span style={{ color: s.accent, marginRight: 10 }}>{s.glyph}</span>{s.name}
                    </div>
                  </div>
                </div>
                <div style={{ fontFamily: "Inter, sans-serif", fontSize: 12.5, color: B.dim, marginTop: 4, fontStyle: "italic" }}>{s.signature}</div>

                <div style={{ marginTop: 14 }}>
                  <div style={{ fontFamily: "Inter, sans-serif", fontSize: 10.5, letterSpacing: 1.4, color: s.accent, textTransform: "uppercase", marginBottom: 8 }}>Palette</div>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
                    {s.palette.map(p => <Swatch key={p.hex} hex={p.hex} name={p.name} />)}
                  </div>
                </div>

                <div style={{ marginTop: 16 }}>
                  <div style={{ fontFamily: "Inter, sans-serif", fontSize: 10.5, letterSpacing: 1.4, color: s.accent, textTransform: "uppercase", marginBottom: 4 }}>Native Trees · Flowers · By Region</div>
                  {s.flora.map(f => <RegionRow key={f.region} region={f.region} latin={f.latin} common={f.common} accent={s.accent} />)}
                </div>
              </Card>
            ))}
          </div>
        </section>

        <section data-testid="section-calendars" style={{ marginTop: 36 }}>
          <H num="04" label="Nine Calendar Systems · Same Wheel, Different Spokes" accent={B.violet} />
          <Card accent={B.violet}>
            <div style={{ overflowX: "auto" }}>
              <table style={{
                width: "100%",
                borderCollapse: "collapse",
                fontFamily: "Inter, sans-serif",
                color: B.ink,
                fontSize: 12.5,
                minWidth: 560,
              }}>
                <thead>
                  <tr style={{ borderBottom: `1px solid ${B.violet}55` }}>
                    <th scope="col" style={{ textAlign: "left", padding: "0 12px 8px 0", fontSize: 10.5, letterSpacing: 1.4, color: B.violet, textTransform: "uppercase", fontWeight: 500, width: 220 }}>System</th>
                    <th scope="col" style={{ textAlign: "left", padding: "0 12px 8px 0", fontSize: 10.5, letterSpacing: 1.4, color: B.violet, textTransform: "uppercase", fontWeight: 500, width: 130 }}>Subdivision</th>
                    <th scope="col" style={{ textAlign: "left", padding: "0 0 8px 0",     fontSize: 10.5, letterSpacing: 1.4, color: B.violet, textTransform: "uppercase", fontWeight: 500 }}>Anchors / Notes</th>
                  </tr>
                </thead>
                <tbody>
                  {CALENDARS.map(c => (
                    <tr key={c.name} style={{ borderBottom: `1px dashed ${B.line}` }}>
                      <th scope="row" style={{ textAlign: "left", padding: "10px 12px 10px 0", color: B.ink, fontWeight: 400 }}>{c.name}</th>
                      <td style={{ padding: "10px 12px 10px 0", color: B.dim }}>{c.count}</td>
                      <td style={{ padding: "10px 0" }}>{c.anchors}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </section>

        <section data-testid="section-honest-line" style={{ marginTop: 36 }}>
          <H num="05" label="Honest Line · What Φ(t) Is and What It Is Not" accent={B.rose} />
          <Card accent={B.rose}>
            <ul style={{ fontFamily: "Inter, sans-serif", fontSize: 13.5, color: B.ink, lineHeight: 1.75, paddingLeft: 18 }}>
              <li><b style={{ color: B.green }}>Real:</b> the four oscillators are physically grounded — Earth's rotation (T<sub>D</sub>), axial tilt (T<sub>S</sub>, T<sub>Y</sub>), and a coarse 27-year demographic/social wave consistent with cohort studies.</li>
              <li><b style={{ color: B.cyan }}>Useful:</b> Φ(t) is a posture, not a prediction. It keeps day, season, year, and generation in the same equation so you stop arguing about which scale matters.</li>
              <li><b style={{ color: B.amber }}>Decorative:</b> the per-season palettes and flora lists are <i>cultural memory</i>, not biology — bloom timing varies by latitude, microclimate, and year.</li>
              <li><b style={{ color: B.rose }}>Not a prophecy:</b> Φ(t) does not forecast events. Coherence near +1 means the four clocks rhyme; near −1 means they cancel. Both are normal.</li>
              <li><b style={{ color: B.violet }}>Hemispheric note:</b> dates are Northern Hemisphere reference. For S Hem, swap Spring↔Autumn and Summer↔Winter, or rotate Φ_S and Φ_Y by π.</li>
            </ul>
          </Card>
        </section>

        <section data-testid="section-bridges" style={{ marginTop: 36 }}>
          <H num="06" label="Bridges · Where the Wheel Touches the Stack" accent={B.gold} />
          <div>
            <Bridge to="/phi-time"             label="φ-Time · The Unified Clock"            accent={B.cyan} />
            <Bridge to="/coherence-engine"     label="Coherence Engine · H ↔ H̄"             accent={B.green} />
            <Bridge to="/phi-coherent-wave"    label="φ-Coherent Wave · Eight Substrates"     accent={B.violet} />
            <Bridge to="/color-cosmology"      label="Color Cosmology · Six Shells"           accent={B.rose} />
            <Bridge to="/april-23-alignment"   label="April 23 Alignment · Reality vs Symbol" accent={B.amber} />
            <Bridge to="/as-above-so-below"    label="As Above, So Below · Geohistorical"     accent={B.gold} />
            <Bridge to="/aether-doctrine"      label="The Doctrine"                           accent={B.gold} />
          </div>
        </section>

      </div>
    </div>
  );
}
