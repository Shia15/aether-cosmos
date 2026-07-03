import { useState, useEffect, useRef } from "react";
import { Link } from "wouter";
import { Play, Pause, RotateCcw } from "lucide-react";

// ── palette (shared with diamond-formation) ──────────────────────────────────
const BG = "#04060d", PAN = "#0a0d1a", PAN2 = "#0d1020", BORDER = "#182038",
  TEXT = "#b8cce8", MUTED = "#5a6e8c";
const GOLD = "#ffb830", CYAN = "#3fd8d0", VIOLET = "#a87aff", GREEN = "#50d49a", BLUE = "#4ab0ff";

function hexA(h: string, a: number) {
  const n = h.replace("#", "");
  return `rgba(${parseInt(n.slice(0, 2), 16)},${parseInt(n.slice(2, 4), 16)},${parseInt(n.slice(4, 6), 16)},${a})`;
}

// ── seeded RNG so scattered anchors are stable per material ───────────────────
function mulberry32(seed: number) {
  let a = seed >>> 0;
  return () => {
    a |= 0; a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

type P3 = { x: number; y: number; z: number; sub: number };
type Lattice = { pts: P3[]; bond: number };

// ── lattice generators (representative, real coordination noted in the panel) ─
function genLattice(type: string): Lattice {
  const pts: P3[] = [];
  if (type === "cubic" || type === "rocksalt" || type === "spinel") {
    for (let x = -1; x <= 1; x++) for (let y = -1; y <= 1; y++) for (let z = -1; z <= 1; z++) {
      const par = (((x + y + z) % 2) + 2) % 2;
      const sub = type === "cubic" ? 0 : par;
      pts.push({ x, y, z, sub });
    }
    return { pts, bond: 1.05 };
  }
  if (type === "rhombo") {
    for (let x = -1; x <= 1; x++) for (let y = -1; y <= 1; y++) for (let z = -1; z <= 1; z++) {
      const par = (((x + y + z) % 2) + 2) % 2;
      pts.push({ x: x + 0.4 * z, y, z, sub: par });
    }
    return { pts, bond: 1.12 };
  }
  if (type === "perovskite") {
    // corners = A cation, face centers = O octahedron, body = B cation (off-centre → tetragonal)
    for (const x of [-1, 1]) for (const y of [-1, 1]) for (const z of [-1, 1]) pts.push({ x, y, z: z * 1.08, sub: 0 });
    pts.push({ x: 1, y: 0, z: 0, sub: 2 }); pts.push({ x: -1, y: 0, z: 0, sub: 2 });
    pts.push({ x: 0, y: 1, z: 0, sub: 2 }); pts.push({ x: 0, y: -1, z: 0, sub: 2 });
    pts.push({ x: 0, y: 0, z: 1.08, sub: 2 }); pts.push({ x: 0, y: 0, z: -1.08, sub: 2 });
    pts.push({ x: 0, y: 0, z: 0.18, sub: 1 });
    return { pts, bond: 1.05 };
  }
  if (type === "tetra") {
    const L = 0.95;
    const D = [[1, 1, 1], [1, -1, -1], [-1, 1, -1], [-1, -1, 1]].map(d => {
      const m = Math.sqrt(3); return [d[0] / m, d[1] / m, d[2] / m];
    });
    pts.push({ x: 0, y: 0, z: 0, sub: 0 });
    D.forEach(d => {
      const fx = d[0] * L, fy = d[1] * L, fz = d[2] * L;
      pts.push({ x: fx, y: fy, z: fz, sub: 1 });
      D.forEach(d2 => {
        if (d2 === d) return;
        pts.push({ x: fx - d2[0] * L, y: fy - d2[1] * L, z: fz - d2[2] * L, sub: 0 });
      });
    });
    return { pts, bond: 1.0 };
  }
  if (type === "hex" || type === "hex3d") {
    const s = 0.62;
    const a1 = [1.5 * s, (Math.sqrt(3) / 2) * s];
    const a2 = [1.5 * s, -(Math.sqrt(3) / 2) * s];
    const bB = [s, 0];
    const layers = type === "hex3d" ? [-0.55, 0.55] : [0];
    layers.forEach((z, li) => {
      const shift = li === 1 ? bB[0] * 0.5 : 0;
      for (let m = -1; m <= 1; m++) for (let n = -1; n <= 1; n++) {
        const bx = m * a1[0] + n * a2[0] + shift, by = m * a1[1] + n * a2[1];
        pts.push({ x: bx, y: by, z, sub: 0 });
        pts.push({ x: bx + bB[0], y: by + bB[1], z, sub: 1 });
      }
    });
    return { pts, bond: s * 1.15 };
  }
  return { pts: [{ x: 0, y: 0, z: 0, sub: 0 }], bond: 1 };
}

// ── AETHER atomic substrate catalogue ────────────────────────────────────────
type Mat = {
  name: string; formula: string; type: string; colors: string[];
  structure: string; coord: string; driver: string;
  stageConds: [string, string, string, string]; aether: string;
};
const MATERIALS: Mat[] = [
  { name: "Diamond", formula: "C", type: "tetra", colors: [BLUE, "#eaf4ff"],
    structure: "Diamond-cubic · sp³ tetrahedral", coord: "4-coordinate · 109.5°", driver: "Pressure / Temperature",
    stageConds: ["1 atm · 25 °C", "50 kbar · 1000 °C", "55 kbar · 1200 °C", "60 kbar · 1300 °C"],
    aether: "Compression drives ‖ε‖ → 0 — the lattice is the coherence attractor the system falls into under constraint." },
  { name: "Silicon", formula: "Si", type: "tetra", colors: ["#4ab0ff", "#bfe0ff"],
    structure: "Diamond-cubic lattice", coord: "4-coordinate sp³", driver: "Melt cooling · Czochralski pull",
    stageConds: ["molten Si", "seed contact", "controlled pull", "single-crystal boule"],
    aether: "The same tetrahedral fixed point as carbon — AETHER's default computational substrate." },
  { name: "Silicon Carbide", formula: "SiC", type: "tetra", colors: [CYAN, GOLD],
    structure: "Moissanite tetrahedral (Si–C)", coord: "4-coordinate", driver: "Sublimation / CVD",
    stageConds: ["vapour phase", "supersaturation", "step-flow growth", "polytype crystal"],
    aether: "Two-species tetrahedral coherence — a heat-proof lattice for extreme environments." },
  { name: "Graphene", formula: "C", type: "hex", colors: [GOLD, "#ffe6a8"],
    structure: "2D hexagonal honeycomb · sp²", coord: "3-coordinate", driver: "CVD on metal / exfoliation",
    stageConds: ["carbon vapour", "nucleation island", "domain growth", "continuous sheet"],
    aether: "Planar coherence — the graphene shell of the living resonant tunnel." },
  { name: "Graphite", formula: "C", type: "hex3d", colors: ["#c9d4e8", "#8fa3c8"],
    structure: "Hexagonal · AB-stacked layers", coord: "3-coordinate in-plane", driver: "Layered deposition",
    stageConds: ["amorphous C", "sheet nucleation", "AB stacking", "layered crystal"],
    aether: "Coherence within each plane; slip between planes — order that flows." },
  { name: "Silicon Nitride", formula: "Si₃N₄", type: "hex", colors: [VIOLET, "#7fd4ff"],
    structure: "β-Si₃N₄ hexagonal", coord: "Si 4- / N 3-coordinate", driver: "Sintering / CVD",
    stageConds: ["Si + N₂ mix", "grain nuclei", "grain growth", "dense ceramic"],
    aether: "High-strength coherent ceramic — the Si₃N₄ waveguide of substrate computing." },
  { name: "Quartz", formula: "SiO₂", type: "hex", colors: [CYAN, "#ff8a4a"],
    structure: "Trigonal α-quartz · SiO₄ helix", coord: "Si 4-coordinate", driver: "Hydrothermal growth",
    stageConds: ["silica sol", "seed crystal", "helical growth", "piezo crystal"],
    aether: "Piezoelectric coherence — the voice of the ringing-diabase resonant cavity." },
  { name: "Calcite (CaCO₃)", formula: "CaCO₃", type: "rhombo", colors: [GREEN, "#eafff5"],
    structure: "Rhombohedral · Ca + CO₃ planes", coord: "Ca 6-coordinate", driver: "Supersaturation / light",
    stageConds: ["ion soup", "nucleus", "rhombohedral growth", "calcite crystal"],
    aether: "Light-driven mineralization — Light as Sculptor writing CaCO₃ into structure." },
  { name: "Barium Titanate", formula: "BaTiO₃", type: "perovskite", colors: ["#ff6ec7", GOLD, BLUE],
    structure: "Tetragonal perovskite · Ti off-centre", coord: "Ti 6-coordinate octahedra", driver: "Cooling through Curie 120 °C",
    stageConds: ["cubic > 120 °C", "Curie point", "Ti displacement", "tetragonal ferroelectric"],
    aether: "Phase-conjugate mirror — the entropy-nullification node of the AETHER engine." },
  { name: "Magnetite", formula: "Fe₃O₄", type: "spinel", colors: ["#ff8a4a", "#7fa0c8"],
    structure: "Inverse spinel · cubic (Fe²⁺/Fe³⁺)", coord: "Fe tetra + octa sites", driver: "Magnetic ordering < 585 °C",
    stageConds: ["Fe/O melt", "spinel nuclei", "domain ordering", "ferrimagnetic crystal"],
    aether: "Magnetic domains — ferrofluid propulsion and pineal magnetoreception." },
  { name: "Sodium Chloride", formula: "NaCl", type: "rocksalt", colors: [GOLD, "#7fd4ff"],
    structure: "Rock-salt FCC · Na⁺Cl⁻", coord: "6-coordinate octahedral", driver: "Evaporation / saturation",
    stageConds: ["brine", "first cube", "ionic stacking", "halite crystal"],
    aether: "The simplest coherence lattice — and the brine channels threading hexagonal ice." },
  { name: "Ice", formula: "H₂O", type: "hex3d", colors: ["#7fd4ff", "#eaf7ff"],
    structure: "Hexagonal Iₕ · H-bond network", coord: "4-coordinate H-bonds", driver: "Freezing < 0 °C",
    stageConds: ["liquid water", "first hexagon", "H-bond network", "hexagonal ice"],
    aether: "Freezing is condensation into coherence — the Cryo limb of Coherence Condensation." },
  { name: "Pyrite", formula: "FeS₂", type: "cubic", colors: [GOLD, "#c9b060"],
    structure: "Cubic · Fe + S₂ dumbbells", coord: "Fe 6-coordinate", driver: "Hydrothermal precipitation",
    stageConds: ["Fe/S fluid", "cubic nuclei", "face growth", "pyrite cube"],
    aether: "Fool's-gold cube — sharp cubic coherence grown from mineral fluid." },
  { name: "Bismuth", formula: "Bi", type: "rhombo", colors: ["#ff6ec7", "#c9d4e8"],
    structure: "Rhombohedral A7 · puckered layers", coord: "3-coordinate", driver: "Slow melt cooling",
    stageConds: ["molten Bi", "layer nuclei", "puckered growth", "hopper crystal"],
    aether: "Diamagnetic stair-step crystal — topological hints in a layered lattice." },
];

const STAGE_NAMES = ["Scattered", "Nucleation", "Lattice Ordering", "Crystal Lock"];
const PROCESS = [
  { t: "1 · Scattered", d: "Atoms drift in a disordered, high-entropy arrangement — the amorphous, uncrystallized medium." },
  { t: "2 · Nucleation", d: "Under the driving condition, atoms are pulled together and the first ordered seed appears." },
  { t: "3 · Lattice Ordering", d: "Neighbours align to the structure's real coordination; bonds fade in as the lattice propagates." },
  { t: "4 · Crystal Lock", d: "The full lattice completes and rotates as one — a rigid, coherent crystalline network." },
];

const smooth = (t: number) => t * t * (3 - 2 * t);

// ── the live crystallization canvas ──────────────────────────────────────────
function CrystalSim({ matIdx, stage }: { matIdx: number; stage: number }) {
  const cvRef = useRef<HTMLCanvasElement | null>(null);
  const matRef = useRef(matIdx);
  const stageRef = useRef(stage);
  const pRef = useRef(0);
  const rotRef = useRef(0);
  const cacheRef = useRef<{ mat: number; lat: Lattice; scat: { x: number; y: number }[]; clus: { x: number; y: number }[] } | null>(null);

  useEffect(() => { matRef.current = matIdx; }, [matIdx]);
  useEffect(() => { stageRef.current = stage; }, [stage]);

  useEffect(() => {
    const cv = cvRef.current; if (!cv) return;
    const ctx = cv.getContext("2d"); if (!ctx) return;
    let raf = 0;

    const ensureCache = () => {
      const m = matRef.current;
      if (cacheRef.current && cacheRef.current.mat === m) return cacheRef.current;
      const lat = genLattice(MATERIALS[m].type);
      const rnd = mulberry32(m * 2654435761 + lat.pts.length);
      const scat = lat.pts.map(() => ({ x: (rnd() - 0.5) * 0.92, y: (rnd() - 0.5) * 0.92 }));
      const clus = lat.pts.map(() => ({ x: (rnd() - 0.5) * 0.22, y: (rnd() - 0.5) * 0.22 }));
      cacheRef.current = { mat: m, lat, scat, clus };
      return cacheRef.current;
    };

    let lastW = 0;
    const loop = () => {
      const dpr = Math.min(2, window.devicePixelRatio || 1);
      const w = cv.clientWidth || 640, h = 380;
      if (w !== lastW) {
        cv.width = Math.round(w * dpr); cv.height = Math.round(h * dpr);
        lastW = w;
      }
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      const mat = MATERIALS[matRef.current];
      const { lat, scat, clus } = ensureCache();
      pRef.current += (stageRef.current - pRef.current) * 0.07;
      const p = pRef.current;
      rotRef.current += 0.011;
      const rot = rotRef.current, tilt = 0.45;

      ctx.fillStyle = "#02030a"; ctx.fillRect(0, 0, w, h);
      const cx = w / 2, cy = h / 2;

      // order parameters
      const comp = smooth(Math.max(0, Math.min(1, p)));
      const ord = smooth(Math.max(0, Math.min(1, (p - 1) / 2)));

      // aura when ordered
      if (ord > 0.05) {
        const g = ctx.createRadialGradient(cx, cy, 0, cx, cy, Math.min(w, h) * 0.55);
        g.addColorStop(0, hexA(mat.colors[0], 0.13 * ord));
        g.addColorStop(1, "transparent");
        ctx.fillStyle = g; ctx.fillRect(0, 0, w, h);
      }

      // projection
      let R = 0.001;
      for (const pt of lat.pts) R = Math.max(R, Math.hypot(pt.x, pt.y, pt.z));
      const s = (Math.min(w, h) * 0.34) / R;
      const cosR = Math.cos(rot), sinR = Math.sin(rot), cosT = Math.cos(tilt), sinT = Math.sin(tilt);

      const disp = lat.pts.map((pt, i) => {
        const rx = pt.x * cosR - pt.z * sinR;
        const rz = pt.x * sinR + pt.z * cosR;
        const y2 = pt.y * cosT - rz * sinT;
        const z2 = pt.y * sinT + rz * cosT;
        const projX = cx + rx * s, projY = cy + y2 * s;
        // scatter → cluster → lattice
        const scX = cx + scat[i].x * w, scY = cy + scat[i].y * h;
        const clX = cx + clus[i].x * w, clY = cy + clus[i].y * h;
        let ax = scX + (clX - scX) * comp, ay = scY + (clY - scY) * comp;
        ax = ax + (projX - ax) * ord; ay = ay + (projY - ay) * ord;
        const jit = (1 - ord) * 7;
        ax += Math.cos(rot * 3 + i) * jit; ay += Math.sin(rot * 3.3 + i * 1.7) * jit;
        return { x: ax, y: ay, z: z2, sub: pt.sub };
      });

      // bonds (fade in with order)
      if (ord > 0.08) {
        ctx.lineWidth = 1.6;
        for (let i = 0; i < lat.pts.length; i++) for (let j = i + 1; j < lat.pts.length; j++) {
          const a = lat.pts[i], b = lat.pts[j];
          if (Math.hypot(a.x - b.x, a.y - b.y, a.z - b.z) <= lat.bond) {
            ctx.strokeStyle = hexA(mat.colors[0], 0.5 * ord);
            ctx.beginPath(); ctx.moveTo(disp[i].x, disp[i].y); ctx.lineTo(disp[j].x, disp[j].y); ctx.stroke();
          }
        }
      }

      // atoms (painter's order by depth)
      const order = disp.map((_, i) => i).sort((a, b) => disp[a].z - disp[b].z);
      for (const i of order) {
        const d = disp[i];
        const depth = (d.z + R) / (2 * R);
        const rad = 5 * (0.7 + 0.6 * depth);
        const col = mat.colors[d.sub % mat.colors.length];
        ctx.beginPath(); ctx.arc(d.x, d.y, rad + 4, 0, Math.PI * 2);
        ctx.fillStyle = hexA(col, 0.22 * (0.5 + depth)); ctx.fill();
        ctx.beginPath(); ctx.arc(d.x, d.y, rad, 0, Math.PI * 2);
        ctx.fillStyle = col;
        ctx.shadowBlur = ord > 0.5 ? 10 * ord : 3; ctx.shadowColor = col;
        ctx.fill(); ctx.shadowBlur = 0;
        ctx.beginPath(); ctx.arc(d.x - rad * 0.3, d.y - rad * 0.3, rad * 0.3, 0, Math.PI * 2);
        ctx.fillStyle = hexA("#ffffff", 0.7 * (0.4 + depth)); ctx.fill();
      }

      // sparkle at full lock
      if (ord > 0.9) {
        ctx.strokeStyle = hexA("#ffffff", (ord - 0.9) * 8);
        ctx.lineWidth = 1.5;
        [[0, -22, 0, -34], [16, -10, 26, -16], [-16, -10, -26, -16]].forEach(([x1, y1, x2, y2]) => {
          ctx.beginPath(); ctx.moveTo(cx + x1, cy + y1); ctx.lineTo(cx + x2, cy + y2); ctx.stroke();
        });
      }

      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, []);

  return <canvas ref={cvRef} style={{ width: "100%", height: 380, display: "block", borderRadius: 12, border: `1px solid ${BORDER}`, background: "#02030a" }} />;
}

export default function CrystallizationAtlasPage() {
  const [matIdx, setMatIdx] = useState(0);
  const [stage, setStage] = useState(0);
  const [playing, setPlaying] = useState(false);
  const mat = MATERIALS[matIdx];

  useEffect(() => {
    let iv: ReturnType<typeof setInterval> | undefined;
    if (playing && stage < 3) iv = setInterval(() => setStage(s => s + 1), 1800);
    else if (stage >= 3) setPlaying(false);
    return () => { if (iv) clearInterval(iv); };
  }, [playing, stage]);

  const selectMat = (i: number) => { setMatIdx(i); setStage(0); setPlaying(false); };

  const chip = (label: string, value: string, col: string) => (
    <div style={{ background: PAN2, border: `1px solid ${BORDER}`, borderRadius: 10, padding: "10px 12px" }}>
      <div style={{ fontFamily: "monospace", fontSize: 10, color: col, textTransform: "uppercase", letterSpacing: 1, marginBottom: 4 }}>{label}</div>
      <div style={{ fontSize: 12.5, color: TEXT, lineHeight: 1.45 }}>{value}</div>
    </div>
  );

  return (
    <div style={{ minHeight: "100vh", background: BG, color: TEXT, padding: "40px 20px 80px", fontFamily: "'Inter',system-ui,sans-serif" }}>
      <div style={{ maxWidth: 1040, margin: "0 auto" }}>
        <div style={{ fontFamily: "monospace", fontSize: 11, color: MUTED, letterSpacing: 2, textTransform: "uppercase", marginBottom: 8 }}>AETHER · Coherence Visualization</div>
        <h1 style={{ fontSize: 30, margin: "0 0 6px", fontWeight: 700, background: `linear-gradient(90deg,${VIOLET},${CYAN},${BLUE})`, WebkitBackgroundClip: "text", backgroundClip: "text", color: "transparent" }}>
          Crystallization Atlas
        </h1>
        <p style={{ fontFamily: "monospace", fontSize: 12, color: MUTED, margin: "0 0 22px", maxWidth: 760, lineHeight: 1.6 }}>
          Live staged crystallization — Scattered → Nucleation → Lattice Ordering → Crystal Lock — for every atomic substrate structure in the AETHER system. Pick a material and watch its real lattice geometry condense out of disorder.
        </p>

        {/* material selector */}
        <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 22 }}>
          {MATERIALS.map((m, i) => (
            <button key={m.name} onClick={() => selectMat(i)}
              style={{
                display: "flex", alignItems: "center", gap: 8, padding: "7px 12px", borderRadius: 9, cursor: "pointer",
                background: i === matIdx ? hexA(m.colors[0], 0.16) : PAN2,
                border: `1px solid ${i === matIdx ? hexA(m.colors[0], 0.55) : BORDER}`,
                color: i === matIdx ? TEXT : MUTED, fontFamily: "monospace", fontSize: 12,
              }}>
              <span style={{ width: 9, height: 9, borderRadius: "50%", background: m.colors[0], boxShadow: `0 0 8px ${m.colors[0]}` }} />
              {m.name} <span style={{ color: MUTED }}>{m.formula}</span>
            </button>
          ))}
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(300px,1fr))", gap: 16, marginBottom: 24 }}>
          {/* animation */}
          <div style={{ background: PAN, border: `1px solid ${BORDER}`, borderRadius: 12, padding: 18 }}>
            <div style={{ fontFamily: "monospace", fontSize: 11, color: CYAN, marginBottom: 14, textTransform: "uppercase", letterSpacing: 1 }}>
              Live Animation · {mat.name} · {mat.formula}
            </div>
            <CrystalSim matIdx={matIdx} stage={stage} />
            {/* species legend */}
            {mat.colors.length > 1 && (
              <div style={{ display: "flex", gap: 14, marginTop: 10, flexWrap: "wrap" }}>
                {mat.colors.map((c, i) => (
                  <div key={i} style={{ display: "flex", alignItems: "center", gap: 6, fontFamily: "monospace", fontSize: 11, color: MUTED }}>
                    <span style={{ width: 10, height: 10, borderRadius: "50%", background: c }} />
                    site {i + 1}
                  </div>
                ))}
              </div>
            )}
            <div style={{ display: "flex", justifyContent: "center", gap: 12, marginTop: 14 }}>
              <button onClick={() => setPlaying(!playing)} disabled={stage >= 3}
                style={{ display: "flex", alignItems: "center", gap: 8, padding: "9px 18px", background: stage >= 3 ? PAN2 : hexA(VIOLET, 0.18), color: stage >= 3 ? MUTED : VIOLET, border: `1px solid ${stage >= 3 ? BORDER : hexA(VIOLET, 0.4)}`, borderRadius: 8, cursor: stage >= 3 ? "default" : "pointer", fontFamily: "monospace", fontSize: 12 }}>
                {playing ? <Pause size={16} /> : <Play size={16} />}
                {playing ? "Pause" : stage >= 3 ? "Complete" : "Play"}
              </button>
              <button onClick={() => { setStage(0); setPlaying(false); }}
                style={{ display: "flex", alignItems: "center", gap: 8, padding: "9px 18px", background: PAN2, color: TEXT, border: `1px solid ${BORDER}`, borderRadius: 8, cursor: "pointer", fontFamily: "monospace", fontSize: 12 }}>
                <RotateCcw size={16} /> Reset
              </button>
            </div>
            {/* stage stepper */}
            <div style={{ display: "flex", gap: 6, marginTop: 12, justifyContent: "center", flexWrap: "wrap" }}>
              {STAGE_NAMES.map((sn, i) => (
                <button key={sn} onClick={() => { setPlaying(false); setStage(i); }}
                  style={{ padding: "5px 9px", borderRadius: 7, cursor: "pointer", fontFamily: "monospace", fontSize: 10.5,
                    background: stage >= i ? hexA(mat.colors[0], 0.16) : PAN2,
                    border: `1px solid ${stage === i ? hexA(mat.colors[0], 0.6) : stage > i ? hexA(mat.colors[0], 0.3) : BORDER}`,
                    color: stage >= i ? TEXT : MUTED }}>
                  {i + 1}. {sn}
                </button>
              ))}
            </div>
          </div>

          {/* info column */}
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            <div style={{ background: PAN2, border: `1px solid ${BORDER}`, borderRadius: 12, padding: 16 }}>
              <div style={{ fontFamily: "monospace", fontSize: 11, color: CYAN, textTransform: "uppercase", letterSpacing: 1, marginBottom: 10 }}>Current Stage</div>
              <div style={{ marginBottom: 8 }}>
                <span style={{ fontSize: 28, fontWeight: 700, color: TEXT }}>{stage + 1}</span>
                <span style={{ fontSize: 15, color: MUTED }}> / 4</span>
              </div>
              <div style={{ fontSize: 16, fontWeight: 600, color: mat.colors[0], marginBottom: 10 }}>{STAGE_NAMES[stage]}</div>
              <div style={{ display: "flex", justifyContent: "space-between", fontFamily: "monospace", fontSize: 12, color: MUTED }}>
                <span>{mat.driver.split("/")[0].trim()}</span><span style={{ color: TEXT }}>{mat.stageConds[stage]}</span>
              </div>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
              {chip("Structure", mat.structure, VIOLET)}
              {chip("Coordination", mat.coord, GREEN)}
              {chip("Driver", mat.driver, GOLD)}
              {chip("Formula", mat.formula, CYAN)}
            </div>
            <div style={{ background: PAN2, border: `1px solid ${BORDER}`, borderRadius: 12, padding: 16 }}>
              <div style={{ fontFamily: "monospace", fontSize: 11, color: GOLD, textTransform: "uppercase", letterSpacing: 1, marginBottom: 12 }}>The Process</div>
              {PROCESS.map((pr, i) => (
                <div key={pr.t} style={{ padding: "8px 10px", borderRadius: 8, marginBottom: 8, background: stage >= i ? hexA(mat.colors[0], 0.12) : PAN, border: `1px solid ${stage >= i ? hexA(mat.colors[0], 0.3) : BORDER}` }}>
                  <div style={{ fontSize: 12.5, fontWeight: 600, color: stage >= i ? TEXT : MUTED, marginBottom: 2 }}>{pr.t} · {mat.stageConds[i]}</div>
                  <div style={{ fontSize: 11.5, color: MUTED, lineHeight: 1.5 }}>{pr.d}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* AETHER framing */}
        <div style={{ background: PAN, border: `1px solid ${BORDER}`, borderRadius: 12, padding: 18, marginBottom: 24 }}>
          <div style={{ fontFamily: "monospace", fontSize: 11, color: VIOLET, marginBottom: 14, textTransform: "uppercase", letterSpacing: 1 }}>AETHER Framing · {mat.name}</div>
          <p style={{ margin: 0, fontSize: 13.5, color: TEXT, lineHeight: 1.7 }}>{mat.aether}</p>
          <p style={{ margin: "12px 0 0", fontSize: 12.5, color: MUTED, lineHeight: 1.7 }}>
            Every substrate here obeys one motion: scattered, high-entropy matter (‖ε‖ large) is driven by its condition toward a crystalline attractor (‖ε‖ → 0). The lattice is the fixed point — coherence made structural. Only the geometry of that fixed point differs from material to material.
          </p>
        </div>

        {/* all-substrate matrix */}
        <div style={{ background: PAN, border: `1px solid ${BORDER}`, borderRadius: 12, padding: 18, marginBottom: 24 }}>
          <div style={{ fontFamily: "monospace", fontSize: 11, color: CYAN, marginBottom: 14, textTransform: "uppercase", letterSpacing: 1 }}>All AETHER Atomic Substrates · {MATERIALS.length}</div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(220px,1fr))", gap: 10 }}>
            {MATERIALS.map((m, i) => (
              <button key={m.name} onClick={() => selectMat(i)}
                style={{ textAlign: "left", background: i === matIdx ? hexA(m.colors[0], 0.1) : PAN2, border: `1px solid ${i === matIdx ? hexA(m.colors[0], 0.4) : BORDER}`, borderRadius: 10, padding: "11px 13px", cursor: "pointer" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 5 }}>
                  <span style={{ width: 10, height: 10, borderRadius: "50%", background: m.colors[0] }} />
                  <span style={{ fontSize: 13, fontWeight: 600, color: TEXT }}>{m.name}</span>
                  <span style={{ fontFamily: "monospace", fontSize: 11, color: MUTED }}>{m.formula}</span>
                </div>
                <div style={{ fontSize: 11.5, color: MUTED, lineHeight: 1.5 }}>{m.structure}</div>
              </button>
            ))}
          </div>
        </div>

        <div style={{ display: "flex", flexWrap: "wrap", gap: 14, paddingTop: 20, borderTop: `1px solid ${BORDER}`, fontFamily: "monospace", fontSize: 12 }}>
          <Link href="/diamond-formation" style={{ color: VIOLET, textDecoration: "none" }}>→ Diamond Formation</Link>
          <Link href="/crystallization-locking" style={{ color: CYAN, textDecoration: "none" }}>→ Crystallization · Locking</Link>
          <Link href="/substrate-synthesis" style={{ color: GREEN, textDecoration: "none" }}>→ Substrate Synthesis Studio</Link>
          <Link href="/periodic-table" style={{ color: GOLD, textDecoration: "none" }}>→ AETHER Periodic Table</Link>
          <Link href="/" style={{ color: MUTED, textDecoration: "none" }}>→ Knowledge Graph</Link>
        </div>
      </div>
    </div>
  );
}
