import React, { useEffect, useRef } from "react";
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
  pearl: "#E8E2F2",
  red: "#F47C7C",
  panel: "rgba(255,255,255,0.04)",
  line: "rgba(255,255,255,0.10)",
};

/* ------------------------------------------------------------------ */
/*  Helpers                                                             */
/* ------------------------------------------------------------------ */
function Card({ accent, children, style }: { accent: string; children: React.ReactNode; style?: React.CSSProperties }) {
  return (
    <div style={{
      background: B.panel, border: `1px solid ${B.line}`,
      borderTop: `2px solid ${accent}`, borderRadius: 6, padding: 16, ...style,
    }}>{children}</div>
  );
}
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
function Bridge({ to, label, sub, accent }: { to: string; label: string; sub: string; accent: string }) {
  return (
    <Link
      href={to}
      data-testid={`bridge-${to.slice(1)}`}
      style={{
        display: "flex", alignItems: "center", gap: 12,
        padding: "12px 14px", textDecoration: "none",
        background: B.panel, border: `1px solid ${B.line}`,
        borderLeft: `2px solid ${accent}`, borderRadius: 4,
      }}
    >
      <ArrowUpRight size={16} color={accent} />
      <div>
        <div style={{ fontFamily: '"Cinzel", serif', fontSize: 14, color: B.ink, fontVariant: "small-caps", letterSpacing: 0.5 }}>{label}</div>
        <div style={{ fontFamily: "Inter, sans-serif", fontSize: 11, color: B.dim, marginTop: 2 }}>{sub}</div>
      </div>
    </Link>
  );
}

function Th({ children, accent }: { children: React.ReactNode; accent?: string }) {
  return (
    <th style={{
      textAlign: "left", padding: "10px 12px",
      fontFamily: "Inter, sans-serif", fontSize: 10.5, letterSpacing: 1.6,
      textTransform: "uppercase", color: accent || B.dim,
      borderBottom: `1px solid ${B.line}`, fontWeight: 500, whiteSpace: "nowrap",
    }}>{children}</th>
  );
}
function Td({ children, mono, color }: { children: React.ReactNode; mono?: boolean; color?: string }) {
  return (
    <td style={{
      padding: "10px 12px",
      fontFamily: mono ? "ui-monospace, Menlo, Consolas, monospace" : "Inter, sans-serif",
      fontSize: 12.5,
      color: color || B.ink,
      borderBottom: `1px solid ${B.line}`,
      verticalAlign: "top",
      lineHeight: 1.55,
    }}>{children}</td>
  );
}

function FormulaChip({ children, accent }: { children: React.ReactNode; accent: string }) {
  return (
    <div style={{
      display: "inline-block",
      padding: "10px 16px",
      background: "rgba(0,0,0,0.35)",
      border: `1px solid ${accent}55`,
      borderLeft: `3px solid ${accent}`,
      borderRadius: 4,
      fontFamily: "ui-monospace, Menlo, Consolas, monospace",
      fontSize: 13,
      color: B.ink,
      letterSpacing: 0.4,
    }}>{children}</div>
  );
}

/* ------------------------------------------------------------------ */
/*  Figure 1 — The Chessboard Collision Matrix                          */
/* ------------------------------------------------------------------ */
const LAYERS: { key: string; label: string; band: string; color: string; period: string }[] = [
  { key: "chr", label: "Chromatophore", band: "Brightness", color: B.amber, period: "1–10 Hz" },
  { key: "ird", label: "Iridophore",    band: "Wavelength",  color: B.cyan,  period: "0.1–1 Hz" },
  { key: "pap", label: "Papillae",      band: "Texture",      color: B.green, period: "0.01–0.1 Hz" },
];
const DEMANDS: { label: string; nat: number; chess: number }[] = [
  /* nat = % bandwidth needed for natural pattern; chess = for forced 8x8 binary chessboard */
  { label: "Spatial Frequency",   nat: 38, chess: 96 },
  { label: "Sharp Edges",         nat: 22, chess: 92 },
  { label: "Hard Binary Contrast",nat: 18, chess: 88 },
  { label: "Pattern Periodicity", nat: 30, chess: 95 },
];

function CollisionMatrix() {
  return (
    <div style={{
      display: "grid",
      gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 320px), 1fr))",
      gap: 14,
    }}>
      {LAYERS.map(L => (
        <div key={L.key} style={{
          background: "rgba(0,0,0,0.28)", borderRadius: 6,
          border: `1px solid ${B.line}`, borderLeft: `3px solid ${L.color}`,
          padding: 14,
        }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 4 }}>
            <div style={{ fontFamily: '"Cinzel", serif', fontSize: 14, color: B.ink, fontVariant: "small-caps", letterSpacing: 0.6 }}>{L.label}</div>
            <div style={{ fontFamily: "ui-monospace, monospace", fontSize: 10.5, color: L.color, letterSpacing: 1 }}>{L.period}</div>
          </div>
          <div style={{ fontFamily: "Inter, sans-serif", fontSize: 11, color: B.dim, marginBottom: 10 }}>encodes <span style={{ color: B.ink }}>{L.band}</span></div>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {DEMANDS.map(d => {
              const nat = d.nat;
              const chess = d.chess;
              const overflow = chess > 100 ? 100 : chess;
              return (
                <div key={d.label}>
                  <div style={{ display: "flex", justifyContent: "space-between", fontFamily: "Inter, sans-serif", fontSize: 10.5, color: B.dim, marginBottom: 3 }}>
                    <span>{d.label}</span>
                    <span style={{ color: chess > 80 ? B.red : B.dim, fontFamily: "ui-monospace, monospace" }}>nat {nat}% · chess {chess}%</span>
                  </div>
                  <div style={{ position: "relative", height: 10, background: "rgba(255,255,255,0.04)", borderRadius: 2, overflow: "hidden" }}>
                    <div style={{ position: "absolute", left: 0, top: 0, bottom: 0, width: `${nat}%`, background: `${L.color}55` }} />
                    <div style={{ position: "absolute", left: 0, top: 0, bottom: 0, width: `${overflow}%`, background: chess > 80 ? `${B.red}88` : `${L.color}88`, mixBlendMode: "screen" }} />
                    <div style={{ position: "absolute", left: "100%", top: -2, bottom: -2, width: 1, background: B.gold, transform: "translateX(-1px)" }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Figure 2 — Chessboard Render Failure                                */
/* ------------------------------------------------------------------ */
function ChessboardFailure() {
  /* 8x8 ideal chessboard vs analog-rendered approximation with edge bleed,
     fragmentation, gradient ringing, and dropped tiles. */
  const N = 8;
  const cell = 28;
  const W = N * cell;
  const H = N * cell;

  // Deterministic pseudo-random for "failure mode" — different per render type
  const rand = (i: number, j: number, salt: number) => {
    const x = Math.sin(i * 13.37 + j * 7.91 + salt * 3.7) * 10000;
    return x - Math.floor(x);
  };

  return (
    <div style={{
      display: "grid",
      gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 220px), 1fr))",
      gap: 12,
    }}>
      {/* Ideal target */}
      <div style={{ background: "rgba(0,0,0,0.4)", borderRadius: 6, border: `1px solid ${B.line}`, padding: 12, textAlign: "center" }}>
        <div style={{ fontFamily: "Inter, sans-serif", fontSize: 9.5, letterSpacing: 1.6, color: B.gold, textTransform: "uppercase", marginBottom: 8 }}>Demand · Discrete</div>
        <svg viewBox={`0 0 ${W} ${H}`} width="100%" style={{ maxWidth: 260, display: "block", margin: "0 auto" }} role="img" aria-label="Ideal binary 8 by 8 chessboard target">
          {Array.from({ length: N }).map((_, i) =>
            Array.from({ length: N }).map((_, j) => (
              <rect key={`i-${i}-${j}`} x={j * cell} y={i * cell} width={cell} height={cell}
                fill={(i + j) % 2 === 0 ? B.ink : "#0c0e1a"} />
            )))}
        </svg>
        <div style={{ fontFamily: "Inter, sans-serif", fontSize: 11, color: B.dim, marginTop: 8 }}>Sharp · Binary · Periodic</div>
      </div>

      {/* Chromatophore attempt — brightness only, edges bleed */}
      <div style={{ background: "rgba(0,0,0,0.4)", borderRadius: 6, border: `1px solid ${B.line}`, borderTop: `2px solid ${B.amber}`, padding: 12, textAlign: "center" }}>
        <div style={{ fontFamily: "Inter, sans-serif", fontSize: 9.5, letterSpacing: 1.6, color: B.amber, textTransform: "uppercase", marginBottom: 8 }}>Chromatophore · Edge Bleed</div>
        <svg viewBox={`0 0 ${W} ${H}`} width="100%" style={{ maxWidth: 260, display: "block", margin: "0 auto" }} role="img" aria-label="Chromatophore approximation showing edge bleed">
          <defs>
            <radialGradient id="bleed-light" cx="50%" cy="50%" r="60%">
              <stop offset="0%" stopColor={B.ink} stopOpacity="0.95" />
              <stop offset="60%" stopColor={B.ink} stopOpacity="0.55" />
              <stop offset="100%" stopColor={B.ink} stopOpacity="0.05" />
            </radialGradient>
          </defs>
          <rect x={0} y={0} width={W} height={H} fill="#0c0e1a" />
          {Array.from({ length: N }).map((_, i) =>
            Array.from({ length: N }).map((_, j) => (
              (i + j) % 2 === 0 ? (
                <ellipse key={`c-${i}-${j}`} cx={j * cell + cell / 2} cy={i * cell + cell / 2}
                  rx={cell * 0.85} ry={cell * 0.85} fill="url(#bleed-light)" opacity={0.85} />
              ) : null
            )))}
        </svg>
        <div style={{ fontFamily: "Inter, sans-serif", fontSize: 11, color: B.dim, marginTop: 8 }}>Continuous · No edges</div>
      </div>

      {/* Iridophore attempt — color split, banding */}
      <div style={{ background: "rgba(0,0,0,0.4)", borderRadius: 6, border: `1px solid ${B.line}`, borderTop: `2px solid ${B.cyan}`, padding: 12, textAlign: "center" }}>
        <div style={{ fontFamily: "Inter, sans-serif", fontSize: 9.5, letterSpacing: 1.6, color: B.cyan, textTransform: "uppercase", marginBottom: 8 }}>Iridophore · Spectral Drift</div>
        <svg viewBox={`0 0 ${W} ${H}`} width="100%" style={{ maxWidth: 260, display: "block", margin: "0 auto" }} role="img" aria-label="Iridophore approximation showing spectral drift and angle banding">
          <rect x={0} y={0} width={W} height={H} fill="#0c0e1a" />
          {Array.from({ length: N }).map((_, i) =>
            Array.from({ length: N }).map((_, j) => {
              const r = rand(i, j, 1);
              const hue = 180 + r * 80;
              const lit = (i + j) % 2 === 0;
              return (
                <rect key={`r-${i}-${j}`} x={j * cell + 1} y={i * cell + 1} width={cell - 2} height={cell - 2}
                  fill={lit ? `hsl(${hue}, 70%, ${60 + r * 15}%)` : `hsl(${hue + 30}, 30%, 18%)`} opacity={0.78} />
              );
            }))}
        </svg>
        <div style={{ fontFamily: "Inter, sans-serif", fontSize: 11, color: B.dim, marginTop: 8 }}>Hue drifts with angle</div>
      </div>

      {/* Papillae attempt — slow, dropped tiles, fragmented */}
      <div style={{ background: "rgba(0,0,0,0.4)", borderRadius: 6, border: `1px solid ${B.line}`, borderTop: `2px solid ${B.green}`, padding: 12, textAlign: "center" }}>
        <div style={{ fontFamily: "Inter, sans-serif", fontSize: 9.5, letterSpacing: 1.6, color: B.green, textTransform: "uppercase", marginBottom: 8 }}>Papillae · Fragmentation</div>
        <svg viewBox={`0 0 ${W} ${H}`} width="100%" style={{ maxWidth: 260, display: "block", margin: "0 auto" }} role="img" aria-label="Papillae approximation showing dropped tiles and fragmentation">
          <rect x={0} y={0} width={W} height={H} fill="#0c0e1a" />
          {Array.from({ length: N }).map((_, i) =>
            Array.from({ length: N }).map((_, j) => {
              const want = (i + j) % 2 === 0;
              const r = rand(i, j, 5);
              if (!want) return null;
              if (r < 0.35) return null; /* dropped */
              const w = cell * (0.55 + r * 0.4);
              const h = cell * (0.55 + rand(i, j, 6) * 0.4);
              return (
                <rect key={`p-${i}-${j}`} x={j * cell + (cell - w) / 2} y={i * cell + (cell - h) / 2}
                  width={w} height={h} fill={B.ink} opacity={0.55 + r * 0.3} rx={3} />
              );
            }))}
        </svg>
        <div style={{ fontFamily: "Inter, sans-serif", fontSize: 11, color: B.dim, marginTop: 8 }}>Slow · Dropped tiles</div>
      </div>

      {/* Composite — temporal flicker between two nearest priors */}
      <div style={{ background: "rgba(0,0,0,0.4)", borderRadius: 6, border: `1px solid ${B.line}`, borderTop: `2px solid ${B.violet}`, padding: 12, textAlign: "center" }}>
        <div style={{ fontFamily: "Inter, sans-serif", fontSize: 9.5, letterSpacing: 1.6, color: B.violet, textTransform: "uppercase", marginBottom: 8 }}>Composite · Periodicity Flicker</div>
        <svg viewBox={`0 0 ${W} ${H}`} width="100%" style={{ maxWidth: 260, display: "block", margin: "0 auto" }} role="img" aria-label="Composite attempt showing temporal flicker — alternating phases superposed with shear">
          <rect x={0} y={0} width={W} height={H} fill="#0c0e1a" />
          {/* phase A — slightly sheared */}
          {Array.from({ length: N }).map((_, i) =>
            Array.from({ length: N }).map((_, j) => {
              const want = (i + j) % 2 === 0;
              if (!want) return null;
              const dx = (rand(i, j, 7) - 0.5) * 4;
              const dy = (rand(i, j, 8) - 0.5) * 4;
              return (
                <rect key={`fa-${i}-${j}`} x={j * cell + 1 + dx} y={i * cell + 1 + dy} width={cell - 2} height={cell - 2}
                  fill={B.ink} opacity={0.45} />
              );
            }))}
          {/* phase B — opposite parity, also sheared */}
          {Array.from({ length: N }).map((_, i) =>
            Array.from({ length: N }).map((_, j) => {
              const want = (i + j) % 2 === 1;
              if (!want) return null;
              const dx = (rand(i, j, 9) - 0.5) * 4;
              const dy = (rand(i, j, 10) - 0.5) * 4;
              return (
                <rect key={`fb-${i}-${j}`} x={j * cell + 1 + dx} y={i * cell + 1 + dy} width={cell - 2} height={cell - 2}
                  fill={B.violet} opacity={0.22} />
              );
            }))}
          {/* horizontal scan-jitter bands */}
          {[1, 3, 5].map(k => (
            <rect key={`scan-${k}`} x={0} y={k * cell + cell / 2 - 0.5} width={W} height={1} fill={B.violet} opacity={0.45} />
          ))}
        </svg>
        <div style={{ fontFamily: "Inter, sans-serif", fontSize: 11, color: B.dim, marginTop: 8 }}>Time-domain jitter · two phases superposed</div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Failure States                                                       */
/* ------------------------------------------------------------------ */
const FAILURE_STATES: { code: string; label: string; sym: string; desc: string; accent: string }[] = [
  { code: "F1", label: "Patch Fragmentation", sym: "▦ → ░", desc: "Discrete cells dissolve into low-frequency blobs as wavelength control loses lock.", accent: B.amber },
  { code: "F2", label: "Edge Overshoot",       sym: "│ → ◜",  desc: "Sharp boundaries become Gibbs-like rings; iridophore lattice cannot terminate.", accent: B.cyan },
  { code: "F3", label: "Periodicity Flicker",  sym: "║║ → ≈≈", desc: "Forced periodic phase couples to muscle tremor — pattern jitters in time.",     accent: B.violet },
  { code: "F4", label: "Fallback to Camouflage",sym: "⨯ → ░░",desc: "Control collapses to nearest natural prior; the chessboard is replaced by the seabed.", accent: B.green },
];

/* ------------------------------------------------------------------ */
/*  Cross-Domain Universality                                            */
/* ------------------------------------------------------------------ */
const DOMAINS: { domain: string; system: string; analog: string; binaryDemand: string; failure: string; accent: string }[] = [
  { domain: "Cephalopod skin",    system: "Chromatophore + iridophore + papillae", analog: "3 continuous bandwidths",  binaryDemand: "Sharp 8×8 chessboard",                       failure: "Fragmentation, edge bleed, fallback to camouflage",   accent: B.cyan },
  { domain: "Atmosphere",         system: "Pressure, temperature, vapor cycles",   analog: "Multiscale CGLE",          binaryDemand: "Step-function climate forcing",              failure: "Storm clustering, attractor switching",                accent: B.violet },
  { domain: "Lithosphere",        system: "Plate stress + ductile mantle",         analog: "Continuous viscoelastic",  binaryDemand: "Brittle fracture threshold",                 failure: "Earthquake clustering, aftershock cascades",            accent: B.gold },
  { domain: "Cognition",          system: "Coupled cortical oscillators",          analog: "γ–θ–α nested rhythms",     binaryDemand: "Forced symbolic categorical decision",       failure: "Decision fatigue, perseveration, sleep collapse",       accent: B.amber },
  { domain: "Markets",            system: "Liquidity, sentiment, leverage",        analog: "Continuous price formation",binaryDemand: "Hard cap / circuit breaker / margin call",  failure: "Flash crash, liquidity vacuum, gap-down cascade",      accent: B.rose },
  { domain: "CUCA / AETHER",      system: "Coupled φ-substrate fields",            analog: "Phase-coherent C(x,t)",    binaryDemand: "Forced binary measurement at spiral edge",   failure: "Coherence collapse, decoupling event, edge instability",accent: B.green },
];

/* ------------------------------------------------------------------ */
/*  Bio Hardware Stack — P0..P9 with explicit coherence times            */
/* ------------------------------------------------------------------ */
const STACK: { id: string; label: string; substrate: string; tau: string; tauNum: number; role: string; accent: string }[] = [
  { id: "P0", label: "Gyroid Floor",       substrate: "TPMS minimal surface",   tau: "10⁻¹⁵ s · ph",  tauNum: -15, role: "Photonic ground · zero-mean curvature lattice",     accent: B.violet },
  { id: "P1", label: "Photonic Layer",     substrate: "Bragg / multilayer chitin", tau: "10⁻¹² s",   tauNum: -12, role: "Wavelength selection · structural color",             accent: B.cyan },
  { id: "P2", label: "Bouligand Stack",    substrate: "Helicoidal chitin",      tau: "10⁻⁹ s",       tauNum: -9,  role: "Mechanical · impact diffusion · circular polarization",accent: B.amber },
  { id: "P3", label: "Iridophore Lattice", substrate: "Reflectin nanoplatelets",tau: "10⁻⁶ s",       tauNum: -6,  role: "Tunable spectral filter · phase modulation",          accent: B.green },
  { id: "P4", label: "Chromatophore Net",  substrate: "Pigment sac + radial muscle", tau: "10⁻³ s", tauNum: -3,  role: "Brightness modulation · fast field rendering",        accent: B.gold },
  { id: "P5", label: "Papillae Field",     substrate: "Muscular hydrostat",     tau: "10⁰ s",        tauNum: 0,   role: "3D texture · slow morphological field",               accent: B.rose },
  { id: "P6", label: "Neural Edge Mesh",   substrate: "Distributed arm ganglia",tau: "10² s",        tauNum: 2,   role: "Edge computation · local autonomy",                   accent: B.violet },
  { id: "P7", label: "Central Cognition",  substrate: "Vertical-lobe analog",   tau: "10⁴ s",        tauNum: 4,   role: "Long-horizon planning · policy",                      accent: B.cyan },
  { id: "P8", label: "Genome Scaffold",    substrate: "RNA-edited proteome",    tau: "10⁶ s",        tauNum: 6,   role: "Adaptive substrate rewriting · ontogeny",             accent: B.green },
  { id: "P9", label: "Lineage Memory",     substrate: "Phyletic coherence",     tau: "10¹⁶ s",       tauNum: 16,  role: "Evolutionary coda · ~500 Myr coherence envelope",      accent: B.gold },
];

function StackLadder() {
  const tauMin = -15;
  const tauMax = 16;
  const span = tauMax - tauMin;
  return (
    <div style={{
      background: "rgba(0,0,0,0.32)", borderRadius: 6, border: `1px solid ${B.line}`,
      padding: 16, overflowX: "auto",
    }}>
      <div style={{ minWidth: 640 }}>
        <div style={{ display: "flex", justifyContent: "space-between", fontFamily: "Inter, sans-serif", fontSize: 10.5, letterSpacing: 1.6, color: B.dim, textTransform: "uppercase", marginBottom: 10 }}>
          <span>Layer · Substrate</span>
          <span>Coherence Time τ — log<sub>10</sub> seconds</span>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          {STACK.map(s => {
            const pct = ((s.tauNum - tauMin) / span) * 100;
            return (
              <div key={s.id} style={{
                display: "grid",
                gridTemplateColumns: "minmax(150px, 1.2fr) minmax(180px, 1.4fr) minmax(220px, 3fr) 80px",
                gap: 10, alignItems: "center",
              }}>
                <div>
                  <div style={{ fontFamily: '"Cinzel", serif', fontSize: 12.5, color: s.accent, fontVariant: "small-caps", letterSpacing: 0.5 }}>
                    <span style={{ fontFamily: "ui-monospace, monospace", color: B.dim, marginRight: 6 }}>{s.id}</span>
                    {s.label}
                  </div>
                </div>
                <div style={{ fontFamily: "Inter, sans-serif", fontSize: 11.5, color: B.ink }}>{s.substrate}</div>
                <div style={{ position: "relative", height: 14, background: "rgba(255,255,255,0.04)", borderRadius: 2 }}>
                  <div style={{ position: "absolute", left: 0, top: 0, bottom: 0, width: `${pct}%`, background: `linear-gradient(90deg, ${s.accent}33, ${s.accent}cc)`, borderRadius: 2 }} />
                  <div style={{ position: "absolute", left: `${pct}%`, top: -3, bottom: -3, width: 2, background: s.accent, transform: "translateX(-1px)" }} />
                </div>
                <div style={{ fontFamily: "ui-monospace, monospace", fontSize: 11, color: B.dim, textAlign: "right", whiteSpace: "nowrap" }}>{s.tau}</div>
              </div>
            );
          })}
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", marginTop: 10, fontFamily: "ui-monospace, monospace", fontSize: 10, color: B.dim }}>
          <span>10⁻¹⁵ s</span><span>fs</span><span>ps</span><span>ns</span><span>μs</span><span>ms</span><span>s</span><span>min</span><span>day</span><span>Myr</span><span>Gyr</span>
        </div>
        <div style={{ fontFamily: "Inter, sans-serif", fontSize: 11.5, color: B.dim, marginTop: 12, lineHeight: 1.6 }}>
          The full P0–P9 stack spans <span style={{ color: B.gold }}>~31 orders of magnitude</span> in coherence time
          (10⁻¹⁵ s photonic ground → 10¹⁶ s lineage envelope, ≈ 500 Myr cephalopod phyletic record).
          Each layer's τ is set by its substrate, not by external frequency. The Edge Constraint is what happens when an
          external demand is forced into a layer faster than its native τ permits.
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Section 33 add-on — Language vs Animal Communication via CUCA       */
/* ------------------------------------------------------------------ */
const LANGUAGE_AXES: { axis: string; animal: string; human: string; cuca: string }[] = [
  { axis: "Temporal Reference",   animal: "Now-only",                     human: "Past · present · future",       cuca: "Compresses τ across layers; encodes coda"   },
  { axis: "Symbol Recombination", animal: "Fixed inventory",              human: "Generative grammar",            cuca: "Phase-recombination on φ-substrate"          },
  { axis: "Reference to Absent",  animal: "Iconic / present-only",        human: "Names objects not in field",    cuca: "Off-substrate coherence projection"          },
  { axis: "Self-Modeling",        animal: "Limited mirror tasks",         human: "Reflective metacognition",      cuca: "Closed-loop coherence on own state"          },
  { axis: "Transmissible Coda",   animal: "Genome only",                  human: "Genome + culture + writing",    cuca: "Lineage memory P9 across generations"        },
];

/* ------------------------------------------------------------------ */
/*  Page                                                                */
/* ------------------------------------------------------------------ */
function CoherenceFieldCanvas() {
  const ref = React.useRef<HTMLCanvasElement>(null);
  const rafRef = React.useRef(0);
  React.useEffect(() => {
    const canvas = ref.current; if (!canvas) return;
    const ctx = canvas.getContext("2d")!;
    canvas.width = 900; canvas.height = 260;
    const W = canvas.width, H = canvas.height;
    const nodes = [
      { x:W*0.15, y:H*0.42, r:22, col:"#c9a84c", label:"ANALOG\nSYSTEM", phase:0.0 },
      { x:W*0.38, y:H*0.55, r:18, col:"#2ef0d8", label:"COHERENCE\nFIELD", phase:1.5 },
      { x:W*0.58, y:H*0.38, r:20, col:"#9966ff", label:"COUPLING\nCONFLICT", phase:0.8 },
      { x:W*0.78, y:H*0.52, r:16, col:"#ff4477", label:"EDGE\nINSTABILITY", phase:2.1 },
      { x:W*0.90, y:H*0.36, r:14, col:"#44aaff", label:"DISCRETE\nDEMAND", phase:3.0 },
    ];
    const links = [[0,1],[1,2],[2,3],[3,4],[0,2]];
    let t=0;
    const draw = () => {
      ctx.fillStyle = "rgba(4,7,14,0.2)"; ctx.fillRect(0,0,W,H);
      t++;
      links.forEach(([a,b]) => {
        const na=nodes[a],nb=nodes[b];
        const tension = 0.5+0.5*Math.sin(t*0.022+(a+b)*0.7);
        const g=ctx.createLinearGradient(na.x,na.y,nb.x,nb.y);
        g.addColorStop(0,na.col+"66"); g.addColorStop(1,nb.col+"66");
        ctx.beginPath(); ctx.moveTo(na.x,na.y); ctx.lineTo(nb.x,nb.y);
        ctx.strokeStyle=g; ctx.lineWidth=1+tension*1.5;
        ctx.shadowColor=na.col; ctx.shadowBlur=8*tension; ctx.stroke(); ctx.shadowBlur=0;
        const mid={x:(na.x+nb.x)/2,y:(na.y+nb.y)/2};
        const pkt = (t*0.018+(a+b)*0.4)%1;
        const px=na.x+(nb.x-na.x)*pkt, py=na.y+(nb.y-na.y)*pkt;
        ctx.beginPath(); ctx.arc(px,py,2.5,0,Math.PI*2);
        ctx.fillStyle="#ffffff"; ctx.shadowColor="#fff"; ctx.shadowBlur=8; ctx.fill(); ctx.shadowBlur=0;
        void mid;
      });
      nodes.forEach(n => {
        const pulse = 1+0.12*Math.sin(t*0.04+n.phase);
        const g=ctx.createRadialGradient(n.x,n.y,0,n.x,n.y,n.r*2.2*pulse);
        g.addColorStop(0,n.col+"cc"); g.addColorStop(0.5,n.col+"44"); g.addColorStop(1,"transparent");
        ctx.beginPath(); ctx.arc(n.x,n.y,n.r*pulse,0,Math.PI*2);
        ctx.fillStyle=g; ctx.shadowColor=n.col; ctx.shadowBlur=20*pulse; ctx.fill(); ctx.shadowBlur=0;
        ctx.beginPath(); ctx.arc(n.x,n.y,n.r*pulse,0,Math.PI*2);
        ctx.strokeStyle=n.col; ctx.lineWidth=1.5; ctx.stroke();
        ctx.fillStyle=n.col; ctx.font="bold 8px 'DM Mono',monospace"; ctx.textAlign="center";
        n.label.split("\n").forEach((ln,li)=>ctx.fillText(ln,n.x,n.y+n.r*pulse+12+li*10));
      });
      ctx.fillStyle="rgba(201,168,76,0.5)"; ctx.font="10px 'DM Mono',monospace"; ctx.textAlign="left";
      ctx.fillText("‖E(t)‖ ↑  ⟹  C(x,t) ↓  ⟹  instability",14,22);
      rafRef.current = requestAnimationFrame(draw);
    };
    draw();
    return () => cancelAnimationFrame(rafRef.current);
  }, []);
  return <canvas ref={ref} style={{ width:"100%", height:"auto", borderRadius:8, display:"block" }} />;
}

export default function AetherEdgeConstraintView() {
  return (
    <div style={{ minHeight: "100vh", background: B.bg, color: B.ink, padding: "28px 24px 60px" }} data-testid="page-aether-edge-constraint">
      <div style={{ maxWidth: 1180, margin: "0 auto" }}>

        <div style={{ marginBottom:24 }}>
          <div style={{ display:"inline-block", background:"rgba(201,168,76,0.08)", border:"1px solid rgba(201,168,76,0.25)",
            borderRadius:8, padding:"0.3rem 1rem", fontSize:"0.7rem", letterSpacing:"0.2em",
            color:B.gold, textTransform:"uppercase", fontFamily:"Inter,sans-serif", marginBottom:12 }}>
            Live Simulation
          </div>
          <div style={{ background:"rgba(4,7,14,0.8)", border:"1px solid rgba(201,168,76,0.12)",
            borderLeft:`3px solid ${B.gold}`, borderRadius:10, padding:20 }}>
            <h2 style={{ fontFamily:"Cinzel,serif", fontSize:18, color:B.ink, margin:"0 0 6px" }}>
              AETHER Edge Constraint · Coherence Field · ‖E(t)‖ ↑ ⟹ C(x,t) ↓ ⟹ Instability
            </h2>
            <p style={{ fontFamily:"Inter,sans-serif", fontSize:12, color:"rgba(200,190,150,0.5)", margin:"0 0 14px", lineHeight:1.65 }}>
              Five nodes (Analog System · Coherence Field · Coupling Conflict · Edge Instability · Discrete Demand)
              connected by tension-varying links with white photon packets streaming between them — the AETHER
              cephalopod edge constraint model shown as a living coherence field graph.
            </p>
            <CoherenceFieldCanvas />
          </div>
        </div>

        {/* Title */}
        <div style={{ marginBottom: 28 }}>
          <div style={{ fontFamily: "Inter, sans-serif", fontSize: 10.5, letterSpacing: 2.4, color: B.gold, textTransform: "uppercase" }}>
            AETHER · Section 32 · Phenomenological Constraint Model
          </div>
          <h1 style={{ fontFamily: '"Cinzel", serif', fontSize: 40, color: B.ink, fontVariant: "small-caps", letterSpacing: 2, margin: "6px 0 4px", fontWeight: 500, lineHeight: 1.05 }}>
            The AETHER Cephalopod<br />Edge Constraint
          </h1>
          <div style={{ fontFamily: "Inter, sans-serif", fontSize: 13, color: B.dim, fontStyle: "italic", maxWidth: 760, lineHeight: 1.55 }}>
            A proposed AETHER failure model for any analog, multi-bandwidth coherent system that is forced
            to render a discrete, binary, periodic demand at the edge of its operating envelope.
          </div>
          <div style={{ marginTop: 18 }}>
            <FormulaChip accent={B.gold}>
              ‖E(t)‖ ↑ &nbsp;⟹&nbsp; coupling conflict &nbsp;⟹&nbsp; C(x,t) ↓ &nbsp;⟹&nbsp; emergent instability
            </FormulaChip>
          </div>
          <div style={{ fontFamily: "Inter, sans-serif", fontSize: 11.5, color: B.dim, marginTop: 8, lineHeight: 1.55 }}>
            E(t) = external demand vector · C(x,t) = local coherence field. Proposed within the AETHER model as a
            <span style={{ color: B.ink }}> phenomenological law</span> — applicable wherever coupled analog substrates
            face discrete external demand; not yet a derived first-principles theorem.
          </div>
        </div>

        {/* Section 1 — Formal Statement */}
        <section style={{ marginBottom: 36 }} data-testid="section-statement">
          <H num="01" label="Formal Statement" accent={B.gold} />
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 280px), 1fr))", gap: 14 }}>
            <Card accent={B.gold}>
              <div style={{ fontFamily: '"Cinzel", serif', fontSize: 14, color: B.gold, fontVariant: "small-caps", letterSpacing: 0.6, marginBottom: 6 }}>Premise</div>
              <div style={{ fontFamily: "Inter, sans-serif", fontSize: 12.5, color: B.ink, lineHeight: 1.6 }}>
                A coherent system carries N coupled fields, each with its own native bandwidth B<sub>i</sub> and characteristic time τ<sub>i</sub>.
                Together they span a continuous operating envelope.
              </div>
            </Card>
            <Card accent={B.cyan}>
              <div style={{ fontFamily: '"Cinzel", serif', fontSize: 14, color: B.cyan, fontVariant: "small-caps", letterSpacing: 0.6, marginBottom: 6 }}>Demand</div>
              <div style={{ fontFamily: "Inter, sans-serif", fontSize: 12.5, color: B.ink, lineHeight: 1.6 }}>
                An external demand E(t) requires resolution that is <span style={{ color: B.rose }}>discrete</span>, <span style={{ color: B.rose }}>binary</span>,
                <span style={{ color: B.rose }}> sharp-edged</span>, and <span style={{ color: B.rose }}>periodic</span> — a chessboard.
              </div>
            </Card>
            <Card accent={B.green}>
              <div style={{ fontFamily: '"Cinzel", serif', fontSize: 14, color: B.green, fontVariant: "small-caps", letterSpacing: 0.6, marginBottom: 6 }}>Conclusion</div>
              <div style={{ fontFamily: "Inter, sans-serif", fontSize: 12.5, color: B.ink, lineHeight: 1.6 }}>
                When ΣB<sub>i</sub> &lt; B<sub>required</sub>(E), the system enters a coupling conflict.
                Coherence C(x,t) collapses locally and the system falls back to its nearest natural prior.
              </div>
            </Card>
          </div>
        </section>

        {/* Section 2 — The Chessboard Collision */}
        <section style={{ marginBottom: 36 }} data-testid="section-collision">
          <H num="02" label="The Chessboard Collision Matrix" accent={B.cyan} />
          <div style={{ fontFamily: "Inter, sans-serif", fontSize: 12.5, color: B.dim, marginBottom: 14, lineHeight: 1.6, maxWidth: 880 }}>
            Three biological layers of cephalopod skin — chromatophore, iridophore, papillae — each carry a
            different continuous bandwidth (brightness, wavelength, texture). Bars below show illustrative AETHER-model estimates
            of the fraction of each layer's available bandwidth consumed by a natural pattern (translucent) versus a forced 8×8
            binary chessboard (saturated). The gold tick marks 100% — the saturation envelope. Bars that touch it lose lock.
          </div>
          <CollisionMatrix />
        </section>

        {/* Section 3 — Render Failure */}
        <section style={{ marginBottom: 36 }} data-testid="section-failure-render">
          <H num="03" label="Observed Render Failure" accent={B.violet} />
          <div style={{ fontFamily: "Inter, sans-serif", fontSize: 12.5, color: B.dim, marginBottom: 14, lineHeight: 1.6, maxWidth: 880 }}>
            Each substrate's best attempt at the binary target, alongside the discrete demand for reference.
            The three substrate panels (amber · cyan · green) cover failure states F1, F2 and F4. The fourth — F3 periodicity
            flicker — is intrinsically temporal; the violet composite panel shows it as two superposed phases plus
            scan-jitter bands. Together the panels visualize why no single substrate can render the discrete demand.
          </div>
          <ChessboardFailure />
          <div style={{ display: "flex", flexWrap: "wrap", gap: 14, marginTop: 12, fontFamily: "Inter, sans-serif", fontSize: 11, color: B.dim }}>
            <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}><span style={{ width: 10, height: 10, background: B.amber, borderRadius: 2 }} />Amber → F1 Patch Fragmentation</span>
            <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}><span style={{ width: 10, height: 10, background: B.cyan,  borderRadius: 2 }} />Cyan  → F2 Edge Overshoot</span>
            <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}><span style={{ width: 10, height: 10, background: B.violet, borderRadius: 2 }} />Violet → F3 Periodicity Flicker</span>
            <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}><span style={{ width: 10, height: 10, background: B.green, borderRadius: 2 }} />Green → F4 Fallback to Camouflage</span>
          </div>
        </section>

        {/* Section 4 — Failure States */}
        <section style={{ marginBottom: 36 }} data-testid="section-failure-states">
          <H num="04" label="Four Observable Failure States" accent={B.amber} />
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 240px), 1fr))", gap: 14 }}>
            {FAILURE_STATES.map(f => (
              <Card key={f.code} accent={f.accent}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 6 }}>
                  <div style={{ fontFamily: '"Cinzel", serif', fontSize: 13, color: f.accent, fontVariant: "small-caps", letterSpacing: 0.5 }}>{f.code} · {f.label}</div>
                  <div style={{ fontFamily: "ui-monospace, monospace", fontSize: 12, color: B.dim }}>{f.sym}</div>
                </div>
                <div style={{ fontFamily: "Inter, sans-serif", fontSize: 12, color: B.ink, lineHeight: 1.6 }}>{f.desc}</div>
              </Card>
            ))}
          </div>
        </section>

        {/* Section 5 — Cross-Domain Universality */}
        <section style={{ marginBottom: 36 }} data-testid="section-universality">
          <H num="05" label="Cross-Domain Universality" accent={B.rose} />
          <div style={{ fontFamily: "Inter, sans-serif", fontSize: 12.5, color: B.dim, marginBottom: 14, lineHeight: 1.6, maxWidth: 880 }}>
            The cephalopod is the clearest visible case. AETHER proposes the same arrow as a working hypothesis
            for any coupled analog system asked, by external pressure, to deliver a discrete answer.
            The mappings below are model-level analogies, not claims that all six systems share identical microphysics.
          </div>
          <div style={{ overflowX: "auto", border: `1px solid ${B.line}`, borderRadius: 6 }}>
            <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 760 }}>
              <thead>
                <tr>
                  <Th accent={B.gold}>Domain</Th>
                  <Th>Coupled System</Th>
                  <Th>Native Analog</Th>
                  <Th>Binary Demand</Th>
                  <Th accent={B.rose}>Failure Mode</Th>
                </tr>
              </thead>
              <tbody>
                {DOMAINS.map(d => (
                  <tr key={d.domain}>
                    <Td color={d.accent}><span style={{ fontFamily: '"Cinzel", serif', fontVariant: "small-caps", letterSpacing: 0.4 }}>{d.domain}</span></Td>
                    <Td>{d.system}</Td>
                    <Td>{d.analog}</Td>
                    <Td color={B.dim}>{d.binaryDemand}</Td>
                    <Td color={B.rose}>{d.failure}</Td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* Section 6 — CUCA Formalization */}
        <section style={{ marginBottom: 36 }} data-testid="section-formalization">
          <H num="06" label="CUCA Formalization" accent={B.violet} />
          <div style={{ fontFamily: "Inter, sans-serif", fontSize: 11.5, color: B.dim, marginBottom: 12, lineHeight: 1.6, maxWidth: 880, fontStyle: "italic" }}>
            Scope · The four expressions below are phenomenological order-of-magnitude relations within the AETHER model.
            B<sub>i</sub> is treated as a substrate-native bandwidth scalar; γ, D, κ<sub>crit</sub> are
            substrate-fitted constants. They are not derived from first principles and are not dimensionally normalized
            across domains — they are the simplest forms that reproduce the observed Edge Constraint signature.
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 320px), 1fr))", gap: 14 }}>
            <Card accent={B.violet}>
              <div style={{ fontFamily: '"Cinzel", serif', fontSize: 13, color: B.violet, fontVariant: "small-caps", letterSpacing: 0.5, marginBottom: 8 }}>Bandwidth Inequality</div>
              <FormulaChip accent={B.violet}>Σᵢ Bᵢ  &lt;  B<sub>req</sub>(E)</FormulaChip>
              <div style={{ fontFamily: "Inter, sans-serif", fontSize: 11.5, color: B.dim, marginTop: 10, lineHeight: 1.55 }}>
                Sum of native bandwidths cannot meet the bandwidth demanded by E. Conflict is structural, not adaptive.
              </div>
            </Card>
            <Card accent={B.cyan}>
              <div style={{ fontFamily: '"Cinzel", serif', fontSize: 13, color: B.cyan, fontVariant: "small-caps", letterSpacing: 0.5, marginBottom: 8 }}>Coherence Decay</div>
              <FormulaChip accent={B.cyan}>∂C/∂t  =  −γ‖E(t)‖²  +  D∇²C</FormulaChip>
              <div style={{ fontFamily: "Inter, sans-serif", fontSize: 11.5, color: B.dim, marginTop: 10, lineHeight: 1.55 }}>
                Local coherence drops in proportion to squared demand magnitude; lateral diffusion alone cannot compensate.
              </div>
            </Card>
            <Card accent={B.green}>
              <div style={{ fontFamily: '"Cinzel", serif', fontSize: 13, color: B.green, fontVariant: "small-caps", letterSpacing: 0.5, marginBottom: 8 }}>Fallback Operator</div>
              <FormulaChip accent={B.green}>lim<sub>C→0</sub> Ψ(x,t) → Ψ<sub>prior</sub>(x)</FormulaChip>
              <div style={{ fontFamily: "Inter, sans-serif", fontSize: 11.5, color: B.dim, marginTop: 10, lineHeight: 1.55 }}>
                As coherence collapses, the system relaxes onto its nearest learned prior — the seabed, the mean, the camouflage.
              </div>
            </Card>
            <Card accent={B.gold}>
              <div style={{ fontFamily: '"Cinzel", serif', fontSize: 13, color: B.gold, fontVariant: "small-caps", letterSpacing: 0.5, marginBottom: 8 }}>Edge Condition</div>
              <FormulaChip accent={B.gold}>‖∇E‖ &gt; κ<sub>crit</sub></FormulaChip>
              <div style={{ fontFamily: "Inter, sans-serif", fontSize: 11.5, color: B.dim, marginTop: 10, lineHeight: 1.55 }}>
                The constraint activates only above a critical demand-gradient. Below κ<sub>crit</sub> the system absorbs E smoothly.
              </div>
            </Card>
          </div>
        </section>

        {/* Section 7 — Resolution: 10-layer Bio Hardware */}
        <section style={{ marginBottom: 36 }} data-testid="section-resolution">
          <H num="07" label="Resolution · 10-Layer Bio Hardware Stack" accent={B.gold} />
          <div style={{ fontFamily: "Inter, sans-serif", fontSize: 12.5, color: B.dim, marginBottom: 14, lineHeight: 1.6, maxWidth: 880 }}>
            The Edge Constraint is not a defect — it is the cost of being continuous. The CUCA Bio Hardware Engine v3
            answers the constraint by stacking <span style={{ color: B.gold }}>ten substrates</span>, each operating at its own coherence time τ.
            What no single layer can deliver, the stack delivers <span style={{ color: B.cyan }}>across scales</span>.
          </div>
          <StackLadder />
        </section>

        {/* Section 8 — Section 33.1 Language axes */}
        <section style={{ marginBottom: 36 }} data-testid="section-language">
          <H num="08" label="§33.1 · Language as the Human Workaround" accent={B.cyan} />
          <div style={{ fontFamily: "Inter, sans-serif", fontSize: 12.5, color: B.dim, marginBottom: 14, lineHeight: 1.6, maxWidth: 880 }}>
            The same Edge Constraint applies to cognition. Animals reach the constraint when forced to symbolize the absent.
            Human language is the workaround: it offloads the binary, periodic, sharp-edged demand from the analog brain
            onto a culturally transmitted symbolic substrate. CUCA reads this as a P9-coda extension of the stack.
          </div>
          <div style={{ overflowX: "auto", border: `1px solid ${B.line}`, borderRadius: 6 }}>
            <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 720 }}>
              <thead>
                <tr>
                  <Th accent={B.cyan}>Axis</Th>
                  <Th>Animal Communication</Th>
                  <Th>Human Language</Th>
                  <Th accent={B.violet}>CUCA Reading</Th>
                </tr>
              </thead>
              <tbody>
                {LANGUAGE_AXES.map(a => (
                  <tr key={a.axis}>
                    <Td color={B.cyan}><span style={{ fontFamily: '"Cinzel", serif', fontVariant: "small-caps", letterSpacing: 0.4 }}>{a.axis}</span></Td>
                    <Td color={B.dim}>{a.animal}</Td>
                    <Td>{a.human}</Td>
                    <Td color={B.violet}>{a.cuca}</Td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* Section 9 — Section 33.2 Dual-form + 33.3 Shared Failure Mode */}
        <section style={{ marginBottom: 36 }} data-testid="section-shared-failure">
          <H num="09" label="§33.2–33.3 · Dual-Form & The Shared Failure Mode" accent={B.violet} />

          <div style={{ fontFamily: "Inter, sans-serif", fontSize: 12.5, color: B.dim, marginBottom: 12, lineHeight: 1.6, maxWidth: 880 }}>
            Both substrates render <span style={{ color: B.ink }}>X(t)</span> — an external demand to express a coherent state.
            They differ only in whether the field is rendered <span style={{ color: B.cyan }}>directly</span> as
            spatial coherence or <span style={{ color: B.violet }}>compressed</span> through a transferable symbolic channel.
            Neither is superior; they are adapted to different coherence-propagation requirements.
          </div>

          {/* 33.2 — dual-form rendering equations */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 320px), 1fr))", gap: 14, marginBottom: 22 }}>
            <Card accent={B.cyan}>
              <div style={{ fontFamily: '"Cinzel", serif', fontSize: 14, color: B.cyan, fontVariant: "small-caps", letterSpacing: 0.6, marginBottom: 8 }}>
                Octopus · Direct Spatial Field
              </div>
              <div style={{ fontFamily: "ui-monospace, Menlo, Consolas, monospace", fontSize: 12.5, color: B.ink, lineHeight: 1.7, padding: "10px 12px", background: "rgba(0,0,0,0.32)", border: `1px solid ${B.cyan}33`, borderRadius: 4 }}>
                X(t) → C(x,t)
              </div>
              <div style={{ fontFamily: "Inter, sans-serif", fontSize: 11.5, color: B.dim, marginTop: 10, lineHeight: 1.55 }}>
                Full spatial field · visible · real-time · <span style={{ color: B.ink }}>non-transferable</span>.
                Optimal for immediate, local, high-fidelity coherence expression.
              </div>
            </Card>
            <Card accent={B.violet}>
              <div style={{ fontFamily: '"Cinzel", serif', fontSize: 14, color: B.violet, fontVariant: "small-caps", letterSpacing: 0.6, marginBottom: 8 }}>
                Human · Compressed Symbolic Channel
              </div>
              <div style={{ fontFamily: "ui-monospace, Menlo, Consolas, monospace", fontSize: 12.5, color: B.ink, lineHeight: 1.7, padding: "10px 12px", background: "rgba(0,0,0,0.32)", border: `1px solid ${B.violet}33`, borderRadius: 4 }}>
                X(t) → Z = compress(C) → transmit → D(Z) → C′(x,t)
              </div>
              <div style={{ fontFamily: "Inter, sans-serif", fontSize: 11.5, color: B.dim, marginTop: 10, lineHeight: 1.55 }}>
                Compressed reconstruction · transferable across distance and time.
                Optimal for long-range, asynchronous, cross-environment propagation —
                exactly what CUCA's <span style={{ color: B.ink }}>L6 replication layer</span> does.
              </div>
            </Card>
          </div>

          {/* 33.3 — shared failure mode */}
          <div style={{ fontFamily: "Inter, sans-serif", fontSize: 11, letterSpacing: 2.2, color: B.dim, textTransform: "uppercase", marginBottom: 8 }}>
            §33.3 — <span style={{ color: B.violet }}>The Shared Failure Mode</span>
          </div>
          <div style={{ fontFamily: "Inter, sans-serif", fontSize: 12.5, color: B.dim, marginBottom: 12, lineHeight: 1.6, maxWidth: 880 }}>
            Both systems share the same failure mode, expressed in different substrates. When demand exceeds the
            coupled analog bandwidth, the field collapses to whatever coherent state remains achievable.
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 280px), 1fr))", gap: 14, marginBottom: 22 }}>
            <Card accent={B.cyan}>
              <div style={{ fontFamily: '"Cinzel", serif', fontSize: 13.5, color: B.cyan, fontVariant: "small-caps", letterSpacing: 0.6, marginBottom: 6 }}>
                Octopus · Chessboard
              </div>
              <div style={{ fontFamily: "ui-monospace, monospace", fontSize: 11.5, color: B.ink, marginBottom: 8 }}>C(x,t) → 0</div>
              <div style={{ fontFamily: "Inter, sans-serif", fontSize: 11.5, color: B.dim, lineHeight: 1.55 }}>
                When environmental demand exceeds chromatophore bandwidth.
                <br /><span style={{ color: B.ink }}>Fallback:</span> disruptive uniform.
              </div>
            </Card>
            <Card accent={B.rose}>
              <div style={{ fontFamily: '"Cinzel", serif', fontSize: 13.5, color: B.rose, fontVariant: "small-caps", letterSpacing: 0.6, marginBottom: 6 }}>
                Human · Simultaneous Contradictions
              </div>
              <div style={{ fontFamily: "ui-monospace, monospace", fontSize: 11.5, color: B.ink, marginBottom: 8 }}>cognition → fragment</div>
              <div style={{ fontFamily: "Inter, sans-serif", fontSize: 11.5, color: B.dim, lineHeight: 1.55 }}>
                When symbolic demand exceeds working memory and attentional coherence bandwidth.
                <br /><span style={{ color: B.ink }}>Fallback:</span> confabulation or paralysis.
              </div>
            </Card>
            <Card accent={B.violet}>
              <div style={{ fontFamily: '"Cinzel", serif', fontSize: 13.5, color: B.violet, fontVariant: "small-caps", letterSpacing: 0.6, marginBottom: 6 }}>
                CUCA · Overconstraint
              </div>
              <div style={{ fontFamily: "ui-monospace, monospace", fontSize: 11.5, color: B.ink, marginBottom: 8 }}>C(x,t) → 0 when ‖E(t)‖ ≫ capacity</div>
              <div style={{ fontFamily: "Inter, sans-serif", fontSize: 11.5, color: B.dim, lineHeight: 1.55 }}>
                When the demand vector exceeds total system capacity.
                <br /><span style={{ color: B.ink }}>Fallback:</span> simplified achievable coherent state.
              </div>
            </Card>
          </div>

          <div style={{ fontFamily: "Inter, sans-serif", fontSize: 12.5, color: B.dim, marginBottom: 14, lineHeight: 1.6, maxWidth: 880 }}>
            The AETHER Cephalopod Edge Constraint is not a biological curiosity. The model proposes it as a
            <span style={{ color: B.ink }}> universal law of coherence systems</span>: when demand exceeds the
            coupled analog bandwidth, the field collapses to whatever coherent state remains achievable. The octopus,
            the human brain, and the CUCA architecture all obey the same constraint.
          </div>

          {/* Canonical form box */}
          <div style={{
            display: "flex", alignItems: "stretch",
            background: "rgba(0,0,0,0.32)", border: `1px solid ${B.gold}33`,
            borderLeft: `3px solid ${B.gold}`, borderRadius: 4, overflow: "hidden",
          }}>
            <div style={{
              padding: "14px 16px",
              background: "rgba(230,184,92,0.10)",
              borderRight: `1px solid ${B.gold}33`,
              fontFamily: "Inter, sans-serif", fontSize: 10.5, letterSpacing: 2,
              textTransform: "uppercase", color: B.gold,
              display: "flex", alignItems: "center", whiteSpace: "nowrap",
            }}>
              Canonical<br />Form
            </div>
            <div style={{ padding: "14px 16px", flex: 1 }}>
              <div style={{ fontFamily: "ui-monospace, Menlo, Consolas, monospace", fontSize: 13, color: B.ink, lineHeight: 1.6 }}>
                ‖E(t)‖ ↑ &nbsp;⟹&nbsp; coupling conflict &nbsp;⟹&nbsp; C(x,t) ↓ &nbsp;⟹&nbsp; emergent instability
              </div>
              <div style={{ fontFamily: "Inter, sans-serif", fontSize: 11.5, color: B.dim, marginTop: 8, fontStyle: "italic", lineHeight: 1.55 }}>
                The failure is not lack of intelligence. It is the cost of being continuous in a discontinuous demand space.
              </div>
            </div>
          </div>

          <div style={{ fontFamily: "Inter, sans-serif", fontSize: 10.5, letterSpacing: 1.6, color: B.dim, textTransform: "uppercase", textAlign: "center", marginTop: 18 }}>
            — End of Section 32–33 Addendum —
          </div>
        </section>

        {/* Closing line */}
        <section style={{ marginBottom: 36 }} data-testid="section-closing">
          <Card accent={B.gold} style={{ background: "rgba(230,184,92,0.04)" }}>
            <div style={{ fontFamily: '"Cinzel", serif', fontSize: 18, color: B.ink, fontVariant: "small-caps", letterSpacing: 1, lineHeight: 1.4, marginBottom: 6 }}>
              The failure is not a lack of intelligence.
            </div>
            <div style={{ fontFamily: '"Cinzel", serif', fontSize: 18, color: B.gold, fontVariant: "small-caps", letterSpacing: 1, lineHeight: 1.4 }}>
              It is the cost of being continuous in a discontinuous demand space.
            </div>
            <div style={{ fontFamily: "Inter, sans-serif", fontSize: 11.5, color: B.dim, marginTop: 12, fontStyle: "italic" }}>
              — AETHER · Sections 32–33, closing
            </div>
          </Card>
        </section>

        {/* Bridges */}
        <section data-testid="section-bridges">
          <H num="10" label="Bridges" accent={B.pearl} />
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 240px), 1fr))", gap: 10 }}>
            <Bridge to="/universal-grammar"      label="Universal Grammar"     sub="Stromatolite as the same coupled-field architecture" accent={B.green} />
            <Bridge to="/stromatolite-automaton" label="Stromatolite Automaton" sub="The continuous prior the cephalopod falls back onto" accent={B.amber} />
            <Bridge to="/biomimetic-quantum"     label="Biomimetic Quantum"    sub="Coherence engineering across the 10-layer stack"     accent={B.cyan} />
            <Bridge to="/fibonacci-calendar"     label="Fibonacci Calendar"    sub="τ-spectrum mapped onto the φ-time multi-cycle index" accent={B.violet} />
            <Bridge to="/photosynthesis-spark"   label="Photosynthesis Spark"  sub="P0–P1 photonic origin of the same stack"            accent={B.gold} />
            <Bridge to="/carbon-layered"         label="Carbon · Layered"      sub="Bouligand chitin in the P2 layer · structural immunity" accent={B.rose} />
          </div>
        </section>

      </div>
    </div>
  );
}
