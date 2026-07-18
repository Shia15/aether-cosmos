import { useEffect, useRef, useState } from "react";

/* ── palette ── */
const C = {
  bg:      "#020408",
  panel:   "#06090f",
  deep:    "#080c16",
  border:  "rgba(59,130,246,0.18)",
  cyan:    "#1fd4c8",
  violet:  "#8b5cf6",
  gold:    "#f5c84c",
  blue:    "#3b82f6",
  teal:    "#06b6d4",
  red:     "#ef4444",
  green:   "#22c55e",
  amber:   "#f59e0b",
  pink:    "#ec4899",
  lime:    "#a3e635",
  indigo:  "#6366f1",
  slate:   "#475569",
  text:    "#dbeafe",
  muted:   "#4a6080",
  dim:     "#0d1520",
};
const mono  = "'Space Mono', monospace";
const serif = "'Cinzel', serif";
const body  = "'Crimson Pro', Georgia, serif";

/* ── State definitions ── */
type StateKey =
  | "normal" | "topo_ins" | "weyl" | "bec"
  | "time_crystal" | "supersolid" | "spin_liquid" | "majorana";

interface ExoticState {
  key:         StateKey;
  name:        string;
  symbol:      string;
  invariant:   string;
  invVal:      string;
  color:       string;
  edgeColor:   string;
  bulkAlpha:   number;
  edgeGlow:    boolean;
  edgeModes:   boolean;
  weylNodes:   boolean;
  spinFlux:    boolean;
  timeDoubl:   boolean;
  superflow:   boolean;
  majorana:    boolean;
  desc:        string;
  formula:     string;
}

const STATES: ExoticState[] = [
  {
    key: "normal", name: "Normal Insulator", symbol: "◻",
    invariant: "Chern number", invVal: "𝒞 = 0",
    color: C.slate, edgeColor: C.slate,
    bulkAlpha: 0.85, edgeGlow: false, edgeModes: false,
    weylNodes: false, spinFlux: false, timeDoubl: false, superflow: false, majorana: false,
    desc: "Trivial band insulator. Bulk gap open, no protected surface states. Topologically equivalent to vacuum — adiabatically deformable to a band of isolated atoms without closing the gap.",
    formula: "H = Σ_k ε_k c†_k c_k   (gapped, 𝒞=0)",
  },
  {
    key: "topo_ins", name: "Topological Insulator", symbol: "◈",
    invariant: "Z₂ invariant", invVal: "ν = 1",
    color: C.cyan, edgeColor: "#7ff0eb",
    bulkAlpha: 0.25, edgeGlow: true, edgeModes: true,
    weylNodes: false, spinFlux: false, timeDoubl: false, superflow: false, majorana: false,
    desc: "Bulk insulating, surface conducting. Time-reversal symmetry protects gapless Dirac surface states that cannot be removed by any perturbation. The edge channels carry spin-momentum-locked electrons that cannot backscatter.",
    formula: "ν = (1/2π) ∮_BZ A·dk  mod 2   (Z₂=1 → protected edge)",
  },
  {
    key: "weyl", name: "Weyl Semimetal", symbol: "⊕⊖",
    invariant: "Chern number", invVal: "𝒞 = ±1",
    color: "#f97316", edgeColor: C.amber,
    bulkAlpha: 0.55, edgeGlow: true, edgeModes: true,
    weylNodes: true, spinFlux: false, timeDoubl: false, superflow: false, majorana: false,
    desc: "Gapless topological semimetal. Weyl nodes act as monopoles of Berry curvature in k-space (+1 source, −1 sink). Fermi arcs on the surface connect them — topologically robust open curves of surface states with no analogue in normal metals.",
    formula: "𝒞 = (1/2π) ∫_S Ω·dS = ±1   (Berry flux through sphere around node)",
  },
  {
    key: "bec", name: "Bose-Einstein Condensate", symbol: "Ψ₀",
    invariant: "Condensate fraction", invVal: "N₀/N → 1",
    color: C.blue, edgeColor: "#93c5fd",
    bulkAlpha: 0.9, edgeGlow: false, edgeModes: false,
    weylNodes: false, spinFlux: false, timeDoubl: false, superflow: false, majorana: false,
    desc: "Macroscopic quantum coherence. All bosons collapse into the same ground-state wavefunction — a single Ψ(r) describing the entire system. Breaks U(1) phase symmetry spontaneously. Superfluid, but here shown as a coherent bulk crystal where every site pulses in phase.",
    formula: "Ψ(r,t) = √N₀ · e^(iθ)   (single macroscopic phase θ, all sites locked)",
  },
  {
    key: "time_crystal", name: "Time Crystal", symbol: "⟲",
    invariant: "Time-translation", invVal: "broken (period 2T)",
    color: C.violet, edgeColor: "#c4b5fd",
    bulkAlpha: 0.7, edgeGlow: false, edgeModes: false,
    weylNodes: false, spinFlux: false, timeDoubl: true, superflow: false, majorana: false,
    desc: "Discrete time-translation symmetry breaking. Driven at period T, the system responds at period 2T — rigid subharmonic oscillation without energy dissipation. A crystal in the dimension of time, not space. First experimentally realized in trapped ion chains (2017).",
    formula: "U(T)|Ψ⟩ = e^(iφ)|Ψ⟩  but  U(2T)|Ψ⟩ = |Ψ⟩  (period doubled)",
  },
  {
    key: "supersolid", name: "Supersolid", symbol: "◈≈",
    invariant: "Dual order", invVal: "ρ_s > 0 + crystal",
    color: C.lime, edgeColor: "#bef264",
    bulkAlpha: 0.75, edgeGlow: false, edgeModes: false,
    weylNodes: false, spinFlux: false, timeDoubl: false, superflow: true, majorana: false,
    desc: "Simultaneous crystalline order AND superfluidity. Two broken symmetries at once: spatial translation (crystal) and U(1) phase (superfluid). Predicted in ⁴He solid (1969), unambiguously demonstrated in ultracold dipolar atoms (2019). The lattice is solid — but flows through itself.",
    formula: "F = F_crystal + F_superfluid   (two independent order parameters, non-zero simultaneously)",
  },
  {
    key: "spin_liquid", name: "Quantum Spin Liquid", symbol: "⟳",
    invariant: "Topological order", invVal: "Z₂ topo. order",
    color: C.pink, edgeColor: "#f9a8d4",
    bulkAlpha: 0.45, edgeGlow: false, edgeModes: false,
    weylNodes: false, spinFlux: true, timeDoubl: false, superflow: false, majorana: false,
    desc: "Highly entangled magnetic state with no long-range order even at T=0. Spins form resonating valence-bond pairs that never freeze — the quantum superposition of all possible pairings. Hosts anyonic excitations (spinons and visons) that braid with non-trivial phase. Candidate material: α-RuCl₃.",
    formula: "|QSL⟩ = Σ_configs c_D |dimer config D⟩   (resonating valence bond superposition)",
  },
  {
    key: "majorana", name: "Topological Superconductor · Majorana", symbol: "γ",
    invariant: "Chern number", invVal: "𝒞 = 1 (chiral)",
    color: "#e879f9", edgeColor: "#f5d0fe",
    bulkAlpha: 0.3, edgeGlow: true, edgeModes: false,
    weylNodes: false, spinFlux: false, timeDoubl: false, superflow: false, majorana: true,
    desc: "Chiral topological superconductor hosting Majorana zero modes at corners and vortex cores. Majorana fermions are their own antiparticle: γ† = γ. Non-Abelian anyons — braiding them performs quantum logic gates. The logical qubit protected by topology. Platform for fault-tolerant quantum computing.",
    formula: "γ = γ†   (Majorana condition: self-conjugate zero mode at edge/vortex)",
  },
];

/* ── Lattice canvas ── */
function QuantumLatticeCanvas({ stateKey }: { stateKey: StateKey }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rafRef    = useRef(0);
  const stateRef  = useRef(stateKey);
  const tRef      = useRef(0);

  useEffect(() => { stateRef.current = stateKey; tRef.current = 0; }, [stateKey]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d")!;
    const W = 680, H = 360;
    canvas.width = W; canvas.height = H;

    const COLS = 15, ROWS = 7;
    const dx = 42, dy = 46;
    const ox = (W - (COLS - 1) * dx) / 2;
    const oy = (H - (ROWS - 1) * dy) / 2;

    /* build sites */
    interface Site { x: number; y: number; edge: boolean; corner: boolean; col: number; row: number }
    const sites: Site[] = [];
    for (let r = 0; r < ROWS; r++) {
      for (let c = 0; c < COLS; c++) {
        const x = ox + c * dx + (r % 2) * (dx / 2);
        const y = oy + r * dy;
        const edge   = r === 0 || r === ROWS - 1 || c === 0 || c === COLS - 1;
        const corner = (r === 0 || r === ROWS - 1) && (c === 0 || c === COLS - 1);
        sites.push({ x, y, edge, corner, col: c, row: r });
      }
    }

    /* nearest-neighbour bonds */
    interface Bond { a: number; b: number }
    const bonds: Bond[] = [];
    for (let i = 0; i < sites.length; i++) {
      for (let j = i + 1; j < sites.length; j++) {
        const ddx = sites[i].x - sites[j].x;
        const ddy = sites[i].y - sites[j].y;
        const d = Math.sqrt(ddx * ddx + ddy * ddy);
        if (d < dx * 1.35) bonds.push({ a: i, b: j });
      }
    }

    /* spin fluctuation partners for spin liquid */
    const spinPairs: number[][] = [];
    for (let k = 0; k < 28; k++) {
      const a = Math.floor(Math.random() * sites.length);
      const b = Math.floor(Math.random() * sites.length);
      if (a !== b) spinPairs.push([a, b, Math.random() * Math.PI * 2]);
    }

    function lerpColor(c1: string, c2: string, t: number): string {
      const parse = (s: string) => [
        parseInt(s.slice(1, 3), 16),
        parseInt(s.slice(3, 5), 16),
        parseInt(s.slice(5, 7), 16),
      ];
      const a = parse(c1 === C.slate ? "#475569" : c1.slice(0, 7));
      const b = parse(c2.slice(0, 7));
      const r = Math.round(a[0] + (b[0] - a[0]) * t);
      const g = Math.round(a[1] + (b[1] - a[1]) * t);
      const bl = Math.round(a[2] + (b[2] - a[2]) * t);
      return `rgb(${r},${g},${bl})`;
    }

    function draw() {
      ctx.clearRect(0, 0, W, H);
      ctx.fillStyle = "#020408";
      ctx.fillRect(0, 0, W, H);

      const st = STATES.find(s => s.key === stateRef.current)!;
      const t  = tRef.current;
      tRef.current++;

      /* ── bonds ── */
      bonds.forEach(({ a, b }) => {
        const sa = sites[a], sb = sites[b];
        const bothEdge = sa.edge && sb.edge;

        let alpha = 0.18;
        let bColor = "#3b82f6";

        if (st.key === "topo_ins") {
          alpha = bothEdge ? 0.6 + 0.2 * Math.sin(t * 0.06 + sa.col * 0.8) : 0.1;
          bColor = bothEdge ? st.edgeColor : C.slate;
        } else if (st.key === "weyl") {
          const pulse = 0.3 + 0.2 * Math.sin(t * 0.05 + (sa.col + sb.col) * 0.3);
          alpha = pulse;
          bColor = (sa.col < 5 || sb.col < 5) ? C.red : C.amber;
        } else if (st.key === "bec") {
          alpha = 0.35 + 0.25 * Math.sin(t * 0.08);
          bColor = C.blue;
        } else if (st.key === "time_crystal") {
          const phase = Math.floor(t / 25) % 2;
          alpha = phase === 0 ? 0.5 : 0.08;
          bColor = C.violet;
        } else if (st.key === "supersolid") {
          alpha = 0.28 + 0.18 * Math.sin(t * 0.04 + sa.row * 0.9);
          bColor = C.lime;
        } else if (st.key === "spin_liquid") {
          alpha = 0.06;
          bColor = C.pink;
        } else if (st.key === "majorana") {
          alpha = bothEdge ? 0.0 : 0.08;
          bColor = "#e879f9";
        } else {
          alpha = 0.15;
          bColor = C.slate;
        }

        ctx.beginPath();
        ctx.moveTo(sa.x, sa.y);
        ctx.lineTo(sb.x, sb.y);
        ctx.strokeStyle = bColor + Math.round(alpha * 255).toString(16).padStart(2, "0");
        ctx.lineWidth = bothEdge && st.edgeModes ? 2.2 : 1;
        ctx.stroke();
      });

      /* ── spin-liquid entanglement bonds ── */
      if (st.key === "spin_liquid") {
        spinPairs.forEach(([ai, bi, phase]) => {
          const sa = sites[ai], sb = sites[bi];
          const alpha = 0.15 + 0.15 * Math.sin(t * 0.03 + phase);
          ctx.beginPath();
          ctx.moveTo(sa.x, sa.y);
          ctx.lineTo(sb.x, sb.y);
          ctx.strokeStyle = `rgba(236,72,153,${alpha})`;
          ctx.lineWidth = 0.8;
          ctx.stroke();
        });
      }

      /* ── superfluid flow overlay ── */
      if (st.key === "supersolid") {
        for (let y = 0; y < H; y += 18) {
          const waveAlpha = 0.07 + 0.05 * Math.sin(t * 0.04 + y * 0.08);
          ctx.beginPath();
          for (let x = 0; x <= W; x += 4) {
            const wy = y + 8 * Math.sin((x + t * 2) * 0.04);
            if (x === 0) ctx.moveTo(x, wy); else ctx.lineTo(x, wy);
          }
          ctx.strokeStyle = `rgba(163,230,53,${waveAlpha})`;
          ctx.lineWidth = 1.2;
          ctx.stroke();
        }
      }

      /* ── sites ── */
      sites.forEach((s, idx) => {
        let color = st.color;
        let radius = 7;
        let alpha = st.bulkAlpha;
        let glow = false;
        let glowColor = st.edgeColor;
        let glowRadius = 18;

        if (st.key === "normal") {
          alpha = 0.6 + 0.1 * Math.sin(t * 0.02 + idx * 0.15);
          color = "#475569";
        } else if (st.key === "topo_ins") {
          if (s.edge) {
            alpha = 0.9 + 0.1 * Math.sin(t * 0.07 + s.col * 0.6);
            color = st.edgeColor;
            glow = true; glowRadius = 22;
          } else {
            alpha = 0.15;
            color = C.slate;
          }
        } else if (st.key === "weyl") {
          const side = s.col < COLS / 2 ? 0 : 1;
          color = side === 0 ? C.red : C.amber;
          alpha = s.edge ? 0.8 : 0.4 + 0.2 * Math.sin(t * 0.04 + idx * 0.2);
          glow = s.edge;
        } else if (st.key === "bec") {
          const sync = Math.sin(t * 0.07);
          alpha = 0.7 + 0.25 * sync;
          color = sync > 0 ? C.blue : "#93c5fd";
          radius = 7 + 2 * Math.abs(sync);
        } else if (st.key === "time_crystal") {
          const bigPhase = Math.floor(t / 25) % 2 === 0;
          alpha = bigPhase ? (0.8 + 0.15 * Math.sin(t * 0.3)) : 0.15;
          color = bigPhase ? C.violet : "#1e1b4b";
          glow = bigPhase && s.row === 3;
        } else if (st.key === "supersolid") {
          alpha = 0.7 + 0.2 * Math.sin(t * 0.05 + s.col * 0.4);
          color = C.lime;
          glow = false;
        } else if (st.key === "spin_liquid") {
          const flicker = Math.random() > 0.98;
          alpha = flicker ? 0.9 : (0.2 + 0.25 * Math.sin(t * 0.05 + idx));
          color = flicker ? "#fff" : C.pink;
          radius = flicker ? 9 : 6;
        } else if (st.key === "majorana") {
          if (s.corner) {
            alpha = 1.0;
            color = "#e879f9";
            glow = true; glowColor = "#f5d0fe"; glowRadius = 28;
            radius = 10;
          } else if (s.edge) {
            alpha = 0.12;
            color = "#e879f9";
          } else {
            alpha = 0.1;
            color = "#6d28d9";
          }
        }

        if (glow) {
          const gr = ctx.createRadialGradient(s.x, s.y, 0, s.x, s.y, glowRadius);
          gr.addColorStop(0, glowColor + "88");
          gr.addColorStop(1, glowColor + "00");
          ctx.beginPath();
          ctx.arc(s.x, s.y, glowRadius, 0, Math.PI * 2);
          ctx.fillStyle = gr;
          ctx.fill();
        }

        const alphaHex = Math.round(Math.min(1, Math.max(0, alpha)) * 255).toString(16).padStart(2, "0");
        const col6 = color.length === 7 ? color : "#8b5cf6";
        ctx.beginPath();
        ctx.arc(s.x, s.y, radius, 0, Math.PI * 2);
        ctx.fillStyle = col6 + alphaHex;
        ctx.fill();
      });

      /* ── Weyl nodes in k-space inset ── */
      if (st.key === "weyl") {
        const ix = W - 100, iy = 20, iw = 92, ih = 92;
        ctx.fillStyle = "rgba(8,12,22,0.92)";
        ctx.strokeStyle = "rgba(249,115,22,0.4)";
        ctx.lineWidth = 1;
        ctx.beginPath(); ctx.roundRect(ix, iy, iw, ih, 6); ctx.fill(); ctx.stroke();
        const cx2 = ix + iw / 2, cy2 = iy + ih / 2;
        ctx.font = `7px ${mono}`; ctx.fillStyle = C.amber + "99"; ctx.textAlign = "center";
        ctx.fillText("k-SPACE", cx2, iy + 10);
        // BZ boundary
        ctx.strokeStyle = "rgba(249,115,22,0.2)"; ctx.lineWidth = 1;
        ctx.strokeRect(ix + 12, iy + 16, iw - 24, ih - 24);
        // Weyl nodes
        const nr = 6 + 4 * Math.abs(Math.sin(t * 0.04));
        [[cx2 - 18, cy2, "+1", C.red], [cx2 + 18, cy2, "−1", C.green]].forEach(([nx, ny, label, nc]) => {
          const ng = ctx.createRadialGradient(nx as number, ny as number, 0, nx as number, ny as number, nr);
          ng.addColorStop(0, (nc as string) + "cc");
          ng.addColorStop(1, (nc as string) + "00");
          ctx.beginPath(); ctx.arc(nx as number, ny as number, nr, 0, Math.PI * 2);
          ctx.fillStyle = ng; ctx.fill();
          ctx.font = `8px ${mono}`; ctx.fillStyle = nc as string; ctx.textAlign = "center";
          ctx.fillText(label as string, nx as number, (ny as number) - nr - 2);
        });
        // Fermi arc connecting them
        ctx.beginPath();
        ctx.moveTo(cx2 - 18, cy2 - 28);
        ctx.bezierCurveTo(cx2 - 10, cy2 - 36, cx2 + 10, cy2 - 36, cx2 + 18, cy2 - 28);
        ctx.strokeStyle = C.amber + "99"; ctx.lineWidth = 1.5; ctx.stroke();
        ctx.font = `7px ${mono}`; ctx.fillStyle = C.amber + "88";
        ctx.fillText("Fermi arc", cx2, iy + ih - 6);
        ctx.textAlign = "left";
      }

      /* ── Topological invariant display ── */
      {
        const ix = 14, iy = 14;
        ctx.fillStyle = "rgba(6,9,15,0.88)";
        ctx.strokeStyle = st.color + "44";
        ctx.lineWidth = 1;
        ctx.beginPath(); ctx.roundRect(ix, iy, 148, 56, 6); ctx.fill(); ctx.stroke();
        ctx.font = `8px ${mono}`; ctx.fillStyle = C.muted; ctx.textAlign = "left";
        ctx.fillText(st.invariant.toUpperCase(), ix + 10, iy + 14);
        ctx.font = `bold 18px ${mono}`; ctx.fillStyle = st.edgeColor.slice(0, 7);
        ctx.fillText(st.invVal, ix + 10, iy + 36);
        ctx.font = `7px ${mono}`; ctx.fillStyle = C.muted;
        ctx.fillText(st.key === "normal" ? "TRIVIAL" : "NON-TRIVIAL", ix + 10, iy + 50);
      }

      /* ── State label bottom ── */
      {
        const lx = W / 2;
        ctx.font = `9px ${mono}`; ctx.fillStyle = st.color + "99"; ctx.textAlign = "center";
        ctx.fillText(`${st.symbol}  ${st.name.toUpperCase()}`, lx, H - 10);
        ctx.textAlign = "left";
      }

      rafRef.current = requestAnimationFrame(draw);
    }

    draw();
    return () => cancelAnimationFrame(rafRef.current);
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{ display: "block", width: "100%", height: "auto", borderRadius: 10 }}
    />
  );
}

/* ── helpers ── */
function SecHead({ n, title, sub, color = C.cyan }: { n: string; title: string; sub: string; color?: string }) {
  return (
    <div style={{ marginTop: 60 }}>
      <div style={{ fontFamily: mono, fontSize: 10, color, letterSpacing: 3, marginBottom: 6 }}>{n}</div>
      <h2 style={{ fontFamily: serif, fontSize: 24, color: "#fff", margin: "0 0 6px" }}>{title}</h2>
      <div style={{ fontFamily: body, fontSize: 15, color: C.muted, marginBottom: 20 }}>{sub}</div>
    </div>
  );
}

function Eq({ children }: { children: string }) {
  return (
    <div style={{
      fontFamily: mono, fontSize: 11, color: C.cyan,
      background: "#06090f", border: `1px solid ${C.cyan}20`,
      borderRadius: 6, padding: "12px 18px", margin: "10px 0",
      overflowX: "auto", whiteSpace: "pre",
    }}>{children}</div>
  );
}

/* ── Existing AETHER Exotic Matter inventory ── */
const INVENTORY = [
  { page: "/quantum-vacuum",        label: "Quantum Vacuum · Zero-Point Field",       col: C.violet },
  { page: "/phonon-stack",          label: "Phonon Stack · 3D Phononic Crystal",      col: C.cyan   },
  { page: "/spin-transport",        label: "Spin Transport · Spintronics",            col: C.pink   },
  { page: "/spin-vacuum",           label: "Spin Vacuum · Virtual Spin States",       col: C.pink   },
  { page: "/dark-matter-vol2",      label: "Dark Matter Vol 2 · Density Waves",       col: C.indigo },
  { page: "/dark-matter-vol3",      label: "Dark Matter Vol 3 · AETHER DM Synthesis", col: C.indigo },
  { page: "/crystallization-atlas", label: "Crystallization Atlas · 14 Substrates",  col: C.gold   },
  { page: "/antimatter-wave",       label: "Antimatter Wave · CP Violation",          col: C.red    },
  { page: "/alchemy-fusion",        label: "Alchemy-Fusion · Nuclear Transmutation",  col: C.amber  },
  { page: "/plasma-confinement",    label: "Plasma Confinement · Fusion States",      col: C.amber  },
  { page: "/gobekli-plasma",        label: "Gobekli Plasma · Ancient Plasma Events",  col: C.amber  },
  { page: "/cuca-gyroid",           label: "CUCA Gyroid v3.0 · Photonic Gyroid",      col: C.green  },
  { page: "/filament-lattice",      label: "Filament Lattice · Cosmic Web",           col: C.blue   },
  { page: "/node-lattice",          label: "Node Lattice · Quantum Node Network",     col: C.blue   },
  { page: "/wave-lattice",          label: "Wave Lattice · Interference States",      col: C.blue   },
  { page: "/phi-crystallization",   label: "Phi Crystallization · Golden Lattice",    col: C.gold   },
  { page: "/phi-lattice",           label: "Phi Lattice · Octonion Symmetry",         col: C.gold   },
  { page: "/knot-topology",         label: "Knot Topology · Topological Knots",       col: C.teal   },
  { page: "/plasma-knots",          label: "Plasma Knots · Linked Flux Tubes",        col: C.teal   },
  { page: "/wood-frog-knots",       label: "Wood Frog Knots · Bio Topology",          col: C.teal   },
  { page: "/quantum-living-systems",label: "Quantum Living Systems · Bio-Quantum",    col: C.lime   },
  { page: "/biomimetic-quantum",    label: "Biomimetic Quantum · Quantum Biology",    col: C.lime   },
  { page: "/phase-coupling",        label: "Phase Coupling · Coupled Oscillators",    col: C.violet },
  { page: "/quantum-gravity",       label: "Quantum Gravity · Planck Scale",          col: C.violet },
];

/* ── Page ── */
export default function QuantumExoticMatterPage() {
  const [selected, setSelected] = useState<StateKey>("normal");
  const st = STATES.find(s => s.key === selected)!;

  return (
    <div style={{ background: C.bg, minHeight: "100vh", color: C.text, fontFamily: body, paddingBottom: 100 }}>

      {/* ── Hero ── */}
      <div style={{
        background: `radial-gradient(ellipse 80% 50% at 50% 0%, ${C.violet}14 0%, ${C.cyan}08 50%, transparent 75%)`,
        borderBottom: `1px solid ${C.border}`,
        padding: "72px 24px 48px", textAlign: "center",
      }}>
        <div style={{ fontFamily: mono, fontSize: 10, color: C.cyan, letterSpacing: 4, marginBottom: 14 }}>
          AETHER · EXOTIC STATES · QUANTUM TOPOLOGICAL SYSTEMS
        </div>
        <h1 style={{ fontFamily: serif, fontSize: "clamp(26px, 5vw, 48px)", color: "#fff", margin: "0 0 16px", lineHeight: 1.15 }}>
          Exotic States of Matter
        </h1>
        <p style={{ fontSize: 16, color: C.muted, maxWidth: 640, margin: "0 auto", lineHeight: 1.8 }}>
          Beyond solid, liquid, gas, and plasma — matter organises into topologically protected states
          whose properties are immune to local perturbation. Touching the edge of a topological insulator
          is touching a thread of quantum information that cannot be cut.
        </p>
      </div>

      <div style={{ maxWidth: 940, margin: "0 auto", padding: "0 22px" }}>

        {/* ── Quantum Topological System ── */}
        <SecHead
          n="§ I · LIVE QUANTUM TOPOLOGICAL SYSTEM"
          title="Select a State — Watch the Lattice Transform"
          sub="Each button switches the matter state. The lattice responds: edge modes appear, bulk dims, Weyl nodes emerge in k-space, or the system breaks time-translation symmetry."
        />

        {/* State selector */}
        <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 16 }}>
          {STATES.map(s => (
            <button
              key={s.key}
              onClick={() => setSelected(s.key)}
              style={{
                fontFamily: mono, fontSize: 10, letterSpacing: 1,
                background: selected === s.key ? `${s.color}22` : C.deep,
                border: `1px solid ${selected === s.key ? s.color : C.muted + "40"}`,
                color: selected === s.key ? s.edgeColor.slice(0, 7) : C.muted,
                borderRadius: 6, padding: "7px 14px", cursor: "pointer",
                boxShadow: selected === s.key ? `0 0 14px ${s.color}44` : "none",
                transition: "all 0.2s",
              }}
            >
              {s.symbol} {s.name}
            </button>
          ))}
        </div>

        {/* Canvas */}
        <div style={{ background: C.deep, border: `1px solid ${st.color}30`, borderRadius: 12, padding: 10, marginBottom: 16 }}>
          <QuantumLatticeCanvas stateKey={selected} />
        </div>

        {/* Selected state info */}
        <div style={{
          background: `${st.color}0c`, border: `1px solid ${st.color}30`,
          borderRadius: 10, padding: "20px 24px", marginBottom: 20,
          display: "grid", gridTemplateColumns: "1fr auto", gap: 20, alignItems: "start",
        }}>
          <div>
            <div style={{ fontFamily: mono, fontSize: 9, color: st.color, letterSpacing: 3, marginBottom: 8 }}>
              {st.invariant.toUpperCase()} · {st.invVal}
            </div>
            <p style={{ fontSize: 14, color: C.muted, lineHeight: 1.8, margin: "0 0 12px" }}>{st.desc}</p>
            <Eq>{st.formula}</Eq>
          </div>
          <div style={{ textAlign: "center", minWidth: 80 }}>
            <div style={{ fontFamily: serif, fontSize: 42, color: st.color, lineHeight: 1 }}>{st.symbol}</div>
            <div style={{ fontFamily: mono, fontSize: 8, color: C.muted, marginTop: 6, letterSpacing: 1 }}>
              {st.key === "normal" ? "TRIVIAL" : "TOPOLOGICAL"}
            </div>
          </div>
        </div>

        {/* Comparison table */}
        <SecHead
          n="§ II · COMPARATIVE TOPOLOGY"
          title="Eight Phases, One Lattice"
          sub="How each exotic state transforms the bulk-edge relationship, topological invariant, and physical signature."
          color={C.violet}
        />
        <div style={{ background: C.deep, border: `1px solid ${C.border}`, borderRadius: 12, overflow: "hidden", marginBottom: 20 }}>
          <div style={{
            display: "grid", gridTemplateColumns: "1fr 90px 90px 1fr",
            background: C.panel, padding: "10px 18px",
            borderBottom: `1px solid ${C.border}`,
            fontFamily: mono, fontSize: 9, color: C.muted, letterSpacing: 2,
          }}>
            <span>STATE</span><span>BULK</span><span>EDGE</span><span>SIGNATURE</span>
          </div>
          {STATES.map((s, i) => (
            <div
              key={s.key}
              onClick={() => setSelected(s.key)}
              style={{
                display: "grid", gridTemplateColumns: "1fr 90px 90px 1fr",
                padding: "12px 18px",
                borderBottom: i < STATES.length - 1 ? `1px solid ${C.dim}` : "none",
                background: selected === s.key ? `${s.color}0e` : "transparent",
                cursor: "pointer", transition: "background 0.2s",
              }}
            >
              <div>
                <span style={{ fontFamily: mono, fontSize: 11, color: s.color }}>{s.symbol} {s.name}</span>
                <div style={{ fontFamily: mono, fontSize: 9, color: C.muted, marginTop: 2 }}>{s.invVal}</div>
              </div>
              <div style={{ fontSize: 12, color: s.bulkAlpha > 0.5 ? C.text : C.muted }}>
                {s.bulkAlpha > 0.5 ? "Conducting" : "Insulating"}
              </div>
              <div style={{ fontSize: 12, color: s.edgeModes || s.majorana ? s.edgeColor : C.muted }}>
                {s.edgeModes ? "Dirac modes" : s.majorana ? "Majorana γ" : s.key === "spin_liquid" ? "Anyons" : "Trivial"}
              </div>
              <div style={{ fontSize: 12, color: C.muted }}>
                {s.key === "normal"       ? "No topological protection"            : ""}
                {s.key === "topo_ins"     ? "Spin-momentum-locked edge channels"   : ""}
                {s.key === "weyl"         ? "Fermi arcs, chiral anomaly"           : ""}
                {s.key === "bec"          ? "Macroscopic wavefunction, superfluidity" : ""}
                {s.key === "time_crystal" ? "Period-doubling without energy input" : ""}
                {s.key === "supersolid"   ? "Crystalline + superfluid simultaneously" : ""}
                {s.key === "spin_liquid"  ? "Resonating valence bonds, anyons"    : ""}
                {s.key === "majorana"     ? "Non-Abelian anyons at corners/vortices" : ""}
              </div>
            </div>
          ))}
        </div>

        {/* Physics cards */}
        <SecHead
          n="§ III · PHYSICS DEPTH"
          title="What Makes Each State Exotic"
          sub="The topological protection principle: a property that cannot change under smooth deformation of the Hamiltonian without closing the energy gap."
          color={C.gold}
        />
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 24 }}>
          {[
            {
              col: C.cyan, title: "Topological Protection",
              body: "A topological invariant (Chern number, Z₂) is an integer that cannot change smoothly — only by a phase transition that closes the energy gap. This is why edge states are immune to disorder: you cannot remove them without a global change to the entire system.",
              eq:  "Δ𝒞 ≠ 0  iff  gap closes  (bulk-boundary correspondence)",
            },
            {
              col: C.violet, title: "Time Crystal Mechanism",
              body: "A Floquet system driven at period T spontaneously oscillates at 2T. This breaks discrete time-translation symmetry without breaking any spatial symmetry. The rigidity is protected by many-body localization — the system cannot thermalize and relax the order away.",
              eq:  "U(t+2T) = U(t)  even though  H(t+T) = H(t)",
            },
            {
              col: C.lime, title: "Supersolid Duality",
              body: "Two order parameters coexist: the crystal order parameter ρ_G (non-zero Fourier component of density) and the superfluid order parameter ψ (macroscopic wavefunction). Neither destroys the other — they are orthogonal broken symmetries occupying the same material.",
              eq:  "⟨ρ_G⟩ ≠ 0  AND  ⟨ψ⟩ ≠ 0  simultaneously",
            },
            {
              col: "#e879f9", title: "Majorana Zero Mode",
              body: "A Majorana fermion is its own antiparticle. At the boundary of a topological superconductor, the two halves of a Cooper pair separate — one half at each edge — and each half is a Majorana mode. Braiding two Majorana modes applies a unitary gate protected against local errors.",
              eq:  "γ† = γ  (self-conjugate)   ·   {γᵢ, γⱼ} = 2δᵢⱼ  (Clifford algebra)",
            },
            {
              col: C.pink, title: "Quantum Spin Liquid",
              body: "At T=0, geometric frustration (triangular/kagome lattice) prevents spins from forming any ordered configuration. Instead, the ground state is a quantum superposition of exponentially many dimer coverings — a resonating valence bond state with long-range entanglement but no local order parameter.",
              eq:  "|RVB⟩ = Σ_D c_D |D⟩   (topological ground-state degeneracy on torus: 4-fold for Z₂)",
            },
            {
              col: "#f97316", title: "Weyl Node Monopole",
              body: "A Weyl node is a point in k-space where two bands cross with linear dispersion. Berry curvature flows radially in/out like a magnetic monopole — the Chern number of a sphere enclosing the node is ±1. The total Chern number in the Brillouin zone must vanish, so nodes always come in pairs.",
              eq:  "∇_k · Ω(k) = Σᵢ χᵢ δ³(k − kᵢ)   (Berry curvature monopoles, Σ χᵢ = 0)",
            },
          ].map(c => (
            <div key={c.title} style={{
              background: C.panel, border: `1px solid ${c.col}22`, borderRadius: 10, padding: "18px 18px",
            }}>
              <div style={{ fontFamily: mono, fontSize: 9, color: c.col, letterSpacing: 2, marginBottom: 8 }}>{c.title}</div>
              <div style={{ fontSize: 13, color: C.muted, lineHeight: 1.75, marginBottom: 10 }}>{c.body}</div>
              <div style={{ fontFamily: mono, fontSize: 10, color: c.col, background: `${c.col}0a`, borderRadius: 4, padding: "6px 10px" }}>{c.eq}</div>
            </div>
          ))}
        </div>

        {/* AETHER existing exotic matter inventory */}
        <SecHead
          n="§ IV · AETHER EXOTIC MATTER LIBRARY"
          title="What Already Exists in AETHER"
          sub="24 existing pages covering exotic and quantum states. The eight states above are what was missing — now complete."
          color={C.gold}
        />
        <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 30 }}>
          {INVENTORY.map(item => (
            <a
              key={item.page}
              href={item.page}
              style={{
                fontFamily: mono, fontSize: 10,
                background: `${item.col}0d`,
                border: `1px solid ${item.col}30`,
                color: item.col,
                borderRadius: 6, padding: "6px 12px",
                textDecoration: "none", letterSpacing: 0.5,
              }}
            >{item.label}</a>
          ))}
        </div>

        {/* AETHER Hazard Interface connection */}
        <div style={{
          background: `${C.amber}08`, border: `1px solid ${C.amber}30`,
          borderRadius: 12, padding: "22px 26px", marginBottom: 24,
        }}>
          <div style={{ fontFamily: mono, fontSize: 9, color: C.amber, letterSpacing: 3, marginBottom: 10 }}>
            AETHER-FS / AETHER-IS · HAZARD INTERFACE BRIDGE
          </div>
          <p style={{ fontSize: 14, color: C.muted, lineHeight: 1.8, margin: 0 }}>
            The AETHER fire-and-ice suit interface (AETHER-FS / AETHER-IS) uses the same topological principle:
            a single shared architecture — one sigmoid growth function, one severity-indexed schema — drives
            two physically opposite hazard domains (fire: runaway thermal gain; ice: runaway thermal loss).
            This is topological design: the same invariant structure (the growth equation S(t)) is preserved
            across phase-opposite environments. Adding a third hazard domain (chemical, electrical, altitude)
            adds one entry to the mode table — the topology of the system is unchanged.
          </p>
        </div>

        {/* Synthesis callout */}
        <div style={{
          background: `linear-gradient(135deg, ${C.violet}0e, ${C.cyan}08)`,
          border: `1px solid ${C.violet}35`, borderRadius: 14, padding: "36px 40px", textAlign: "center",
        }}>
          <div style={{ fontFamily: mono, fontSize: 9, color: C.muted, letterSpacing: 3, marginBottom: 16 }}>THE AETHER SYNTHESIS</div>
          <p style={{ fontFamily: serif, fontSize: "clamp(15px,2.2vw,20px)", color: "#fff", lineHeight: 1.7, margin: "0 0 14px" }}>
            The AETHER coherence field C(x,t) is the macroscopic wavefunction of matter itself.
          </p>
          <p style={{ fontFamily: serif, fontSize: "clamp(14px,2vw,17px)", color: C.cyan, lineHeight: 1.7, margin: "0 0 14px" }}>
            Topological protection is what happens when C reaches unity and the system locks.
          </p>
          <p style={{ fontSize: 14, color: C.muted, maxWidth: 560, margin: "0 auto", lineHeight: 1.8 }}>
            Every exotic state on this page is a different regime of the same underlying field — a different value of the topological invariant. Matter is not simply "solid" or "liquid." It is a topological phase, and its protection is written in integers that cannot be changed by anything less than a global phase transition.
          </p>
        </div>

        {/* Footer links */}
        <div style={{
          marginTop: 48, paddingTop: 28, borderTop: `1px solid ${C.dim}`,
          display: "flex", flexWrap: "wrap", gap: 10,
        }}>
          {[
            { href: "/quantum-vacuum",         label: "→ Quantum Vacuum" },
            { href: "/phonon-stack",           label: "→ Phonon Stack" },
            { href: "/crystallization-atlas",  label: "→ Crystallization Atlas" },
            { href: "/spin-transport",         label: "→ Spin Transport" },
            { href: "/dark-matter-vol3",       label: "→ Dark Matter Vol 3" },
            { href: "/knot-topology",          label: "→ Knot Topology" },
            { href: "/phase-coupling",         label: "→ Phase Coupling" },
            { href: "/gradient-field",         label: "→ Gradient Field" },
          ].map(l => (
            <a key={l.href} href={l.href} style={{
              fontFamily: mono, fontSize: 11, color: C.cyan,
              background: `${C.cyan}10`, border: `1px solid ${C.cyan}30`,
              borderRadius: 6, padding: "6px 14px", textDecoration: "none",
            }}>{l.label}</a>
          ))}
        </div>
      </div>
    </div>
  );
}
