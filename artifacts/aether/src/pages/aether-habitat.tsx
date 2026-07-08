import { useEffect, useRef, type ReactNode } from "react";
import { Link } from "wouter";

import imgVoronoi from "@assets/IMG_1076_1782927026649.jpeg";
import imgLab from "@assets/IMG_3786_1782927026649.jpeg";
import imgUI from "@assets/IMG_3785_1782927026649.jpeg";
import imgNightDome from "@assets/IMG_3781_1782927026649.jpeg";
import imgBubbleCut from "@assets/IMG_3782_1782927026649.jpeg";
import imgMultiBubble from "@assets/IMG_3778_1782927026649.jpeg";
import imgArchHabitat from "@assets/IMG_3777_1782927026649.jpeg";
import imgGrowRoom from "@assets/IMG_3776_1782927026649.jpeg";
import imgPodTower from "@assets/IMG_3773_1782927026649.jpeg";
import imgSpiralTower from "@assets/IMG_3770_1782927026649.jpeg";
import imgTowerAnno from "@assets/IMG_3760_1782927026649.jpeg";
import imgTowerHelix from "@assets/IMG_3767_1782927026649.jpeg";
import imgHighK from "@assets/IMG_3756_1782927026649.png";
import imgUAP from "@assets/IMG_3753_1782927026649.png";
import imgALD from "@assets/IMG_3755_1782927026649.png";
import imgInverbase from "@assets/IMG_3747_1782927026649.png";

import vidA from "@assets/_users_ba1dc190-cb0c-4f70-baae-2c0a87f5fdb6_generated_75633519_1782927026649.mp4";
import vidB from "@assets/_users_ba1dc190-cb0c-4f70-baae-2c0a87f5fdb6_generated_a2a8878e_1782927026649.mp4";
import vidC from "@assets/_users_ba1dc190-cb0c-4f70-baae-2c0a87f5fdb6_generated_7e5d4779_1782927026649.mp4";
import vidD from "@assets/_users_ba1dc190-cb0c-4f70-baae-2c0a87f5fdb6_generated_b9ef72e5_1782927026649.mp4";

const C = {
  bg: "#05060C",
  panel: "#0b0e18",
  panel2: "#0e1224",
  border: "#1a2340",
  text: "#b8cce8",
  muted: "#5a708c",
  cyan: "#3fd8d0",
  violet: "#a86bff",
  gold: "#ffb347",
  blue: "#4aa8ff",
  green: "#5ad19a",
};

const EPS0 = 8.854e-12; // F/m
const AREA = 1e-4; // m² (1 cm² reference plate)

const FACTS = [
  { k: "Core", v: "Central vortex regeneration column" },
  { k: "High-κ dielectric", v: "SrTiO₃ · κ ≈ 300 – 25,000+" },
  { k: "Field storage", v: "U = ½ κ ε₀ |E|²" },
  { k: "Piezo constant g₃₃", v: "≈ 10 – 25 mV·m/N (PZT)" },
  { k: "ALD growth", v: "≈ 0.1 nm per cycle" },
  { k: "Fibonacci helix", v: "137.5° golden-angle pods" },
  { k: "Base isolation", v: "T_iso ≫ T_ground (rocking base)" },
  { k: "Frame", v: "Tubular AETHER · topological gradients" },
];

const MATH = [
  { eq: "C = κ · ε₀ · A / d", note: "Parallel-plate capacitance. The habitat stores its field in a dielectric skin, and a high permittivity κ multiplies how much charge a given voltage can hold. SrTiO₃ pushes κ into the thousands — the physical basis of the 'field storage' layer in the source infographics." },
  { eq: "U = ½ · κ · ε₀ · |E|²", note: "Energy density of the stored field. Raising κ lets the same electric field E pack far more energy into the same volume. This is the honest engine behind the building's claim to hold power in its walls rather than in a battery." },
  { eq: "E_net = E₀ / κ", note: "Dielectric field suppression. Inside a high-κ medium the net field collapses by a factor of κ, which is exactly why the material can survive enormous stored charge without breaking down — the field the lattice actually feels is small." },
  { eq: "V_oc = g₃₃ · σ · t", note: "Piezoelectric open-circuit voltage. Mechanical stress σ across a slab of thickness t produces a voltage set by the piezo coefficient g₃₃. The 'bioluminescent piezo roots' harvest structural and water pressure into real electricity by this law." },
  { eq: "v_θ(r) = Γ/(2πr) · [r>a],  Ω·r · [r<a]", note: "Rankine vortex. The regeneration core spins as a solid body inside a small core radius a and as a free vortex outside it, avoiding the infinite speed a pure free vortex would have at the centre. It is the standard honest model for a stable swirling column." },
  { eq: "d = GPC · N", note: "Atomic-layer-deposition thickness. Each self-limiting cycle adds one atomic layer (growth-per-cycle ≈ 0.1 nm), so film thickness is simply cycles × GPC. This is how the conformal, pinhole-free field-confinement metamaterial skin is actually grown." },
  { eq: "T = 2π · √(m / k)", note: "Base-isolation period. Mounting the tower on a soft 'rocking boat' base lengthens its natural period T well past the ground's shaking period, so the building rides out a quake instead of resonating with it — real seismic engineering." },
  { eq: "C(x,t) = A(x) · e^(i(φ − ωt))", note: "The AETHER coherence field — the through-line. Vortex core, piezo roots, dielectric skin, and habitat frame are all read as one phase-coherent field carried across a single structure: architecture as a coherence device." },
];

const VERBAL = [
  { t: "The vortex core is a circulation engine", d: "Every image centres on a luminous vortex column threading the building top to bottom. Read honestly, that column is a circulation and mixing driver — moving air, water, heat, and nutrients on a stable swirling path (a Rankine vortex). The word 'regeneration' is the aspiration; the moving-fluid core underneath it is real fluid mechanics." },
  { t: "Roots that harvest, not decorate", d: "The glowing roots are not ornament: they are piezoelectric and mineral-probe harvesters. Piezoelectricity is genuine physics — stress on the right crystal makes voltage (V = g₃₃·σ·t). Structural sway, footsteps, and water pressure become milliwatts to watts. Honest scale: it trims the load, it does not power a city." },
  { t: "The walls store a field", d: "The infographics are about high-κ dielectric field storage: SrTiO₃ with a permittivity in the thousands lets a wall hold charge like a giant distributed capacitor (C = κε₀A/d, U = ½κε₀E²). The catch is real too — sub-nanometre films leak by quantum tunnelling, so the design trades thickness against density." },
  { t: "ALD grows the skin atom by atom", d: "Atomic layer deposition is a real, industrial self-limiting reaction: one atomic layer per cycle, perfectly conformal over 3D nanostructure. It is the honest fabrication route for the 'field-confinement metamaterial' — a pinhole-free dielectric stack grown, not machined, onto the frame." },
  { t: "A tubular frame on a rocking base", d: "The tower is a tubular AETHER frame with pods placed on a Fibonacci golden angle (137.5°) for even light and air, sitting on a base-isolation 'rocking boat' mount. Both are established structural ideas — tubular high-rises and seismic base isolation — recombined into one silhouette." },
  { t: "An ambient interface", d: "Dream Key, Breath Toggle, Flow Button, Wisp Field: the habitat is operated by a calm, gestural interface rather than switches and screens. This is the most speculative layer — a design language for living inside a coherence device — and it is presented as vision, not spec." },
  { t: "Honest horizon", d: "Every component here is real physics: capacitors, piezoelectrics, ALD, vortex flow, base isolation. The synthesis — a self-powering, self-regenerating living building whose walls store energy and whose roots feed it — is the AETHER dream the parts point toward. The simulations are faithful to their equations; the whole is a horizon." },
];

const HABITAT_PLATES = [
  { src: imgNightDome, cap: "Night dome habitat over a teal vortex plume feeding a lattice of luminous roots — the regeneration core seen from outside." },
  { src: imgBubbleCut, cap: "Bubble-dome cutaway: living floor above, a central vortex column below driving Root Flow and Vortex Intensity readouts into the soil." },
  { src: imgMultiBubble, cap: "Multi-bubble glass home, cross-sectioned to show the underground water body, light pillars, and glowing root network." },
  { src: imgArchHabitat, cap: "Arched family habitat — a vortex waterfall descends through piezo water pods and rooted mineral cavities beneath the living space." },
  { src: imgGrowRoom, cap: "Vertical grow room: a central vortex mist column between hydroponic towers, powered by piezo water tanks and root-current below." },
  { src: imgUI, cap: "The ambient interface — Dream Key · Breath Toggle · Flow Button · Wisp Field — glowing above a sunken pool fed by the vortex root." },
  { src: imgPodTower, cap: "Stacked bubble-pod home with a bright vortex spine, robot caretakers, and an underground hydroponic garden at the base." },
];

const TOWER_PLATES = [
  { src: imgSpiralTower, cap: "Spiral residential tower wound around a glowing vortex core — the regeneration column scaled up to a skyrise." },
  { src: imgTowerAnno, cap: "Annotated skyrise: Tubular AETHER Frame · Safe Animal Bubble System · Central Vortex Regeneration Core · Nutritional Safety & Alignment Flow." },
  { src: imgTowerHelix, cap: "Bubble-pod tower — Fibonacci helix + topological gradients, wrapping bubble habitats, smart-window wind harvesting, rocking-boat base isolation." },
];

const SUBSTRATE_PLATES = [
  { src: imgHighK, cap: "High-κ dielectric field storage: the scaling paradox, polarization mechanisms, C = κε₀A/d, U = ½κε₀|E|², and a radiation-shield veneer." },
  { src: imgUAP, cap: "Active strontium high-κ dielectric metamaterial core — layered shielding, quantum-paraelectric SrTiO₃ lattice, and active field confinement." },
  { src: imgALD, cap: "Atomic layer deposition for the field-confinement skin: the self-limiting cycle, linear growth-per-cycle, and nanolaminate blocking lattices." },
  { src: imgInverbase, cap: "The Inverbase — an inverted pyramid of water + piezo cavities and rising bioluminescent mycelial roots, wired with fibre-optic sensors to a data uplink." },
];

const NOTATION_PLATES = [
  { src: imgVoronoi, cap: "The coherence dome — a Voronoi mosaic of blue cells, each a shell of the coherence field |C| tiling a single luminous sphere." },
  { src: imgLab, cap: "The workbench of equations — photonic and field relations sketched over glassware, the notation layer beneath the built habitat." },
];

const VIDEOS = [
  { src: vidA, cap: "Vortex core in motion · the regeneration column circulating." },
  { src: vidB, cap: "Root current · piezo harvest pulsing through the substrate." },
  { src: vidC, cap: "Habitat field · coherence flowing through the dwelling." },
  { src: vidD, cap: "Tower dynamics · frame, pods, and base in living motion." },
];

function hexA(h: string, a: number) {
  const n = h.replace("#", "");
  return `rgba(${parseInt(n.slice(0, 2), 16)},${parseInt(n.slice(2, 4), 16)},${parseInt(n.slice(4, 6), 16)},${a})`;
}

function fitCanvas(cv: HTMLCanvasElement, ctx: CanvasRenderingContext2D) {
  const dpr = Math.min(2, window.devicePixelRatio || 1);
  const w = cv.clientWidth || 600;
  const h = cv.clientHeight || 300;
  cv.width = Math.round(w * dpr);
  cv.height = Math.round(h * dpr);
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  return { w, h };
}

/* ── Canvas 1 · Central Vortex Regeneration Core (Rankine vortex column) ── */
function VortexCanvas() {
  const cvRef = useRef<HTMLCanvasElement | null>(null);
  const gammaRef = useRef(1.6);
  const coreRef = useRef(26);
  const inflowRef = useRef(1.0);
  const vOut = useRef<HTMLSpanElement | null>(null);
  const rOut = useRef<HTMLSpanElement | null>(null);
  const fOut = useRef<HTMLSpanElement | null>(null);

  useEffect(() => {
    const cv = cvRef.current;
    if (!cv) return;
    const ctx = cv.getContext("2d");
    if (!ctx) return;
    let raf = 0;

    type P = { r: number; a: number; y: number; sp: number };
    let parts: P[] = [];
    let seeded = false;
    let lastW = 0, lastH = 0;

    const seed = (w: number, h: number) => {
      parts = [];
      const N = 260;
      for (let i = 0; i < N; i++) {
        parts.push({
          r: 8 + Math.random() * (Math.min(w, h) * 0.42),
          a: Math.random() * Math.PI * 2,
          y: Math.random() * h,
          sp: 0.7 + Math.random() * 0.6,
        });
      }
      seeded = true;
    };

    const loop = () => {
      const { w, h } = fitCanvas(cv, ctx);
      if (!seeded || Math.abs(w - lastW) > 40 || Math.abs(h - lastH) > 40) {
        seed(w, h);
        lastW = w; lastH = h;
      }
      const cx = w * 0.5;
      const gamma = gammaRef.current;
      const core = coreRef.current;
      const inflow = inflowRef.current;
      const omega = gamma / (core * core); // solid-body rate inside core (continuity)

      ctx.clearRect(0, 0, w, h);
      const bg = ctx.createLinearGradient(0, 0, 0, h);
      bg.addColorStop(0, "#04060f");
      bg.addColorStop(1, "#070a16");
      ctx.fillStyle = bg;
      ctx.fillRect(0, 0, w, h);

      // funnel outline
      ctx.strokeStyle = hexA(C.cyan, 0.16);
      ctx.lineWidth = 1;
      for (let k = 1; k <= 4; k++) {
        const rr = core + k * 34;
        ctx.beginPath();
        ctx.ellipse(cx, h * 0.5, rr, rr * 0.34, 0, 0, Math.PI * 2);
        ctx.stroke();
      }

      let peakV = 0;
      let rSum = 0;
      for (const p of parts) {
        // Rankine tangential speed
        const vt = p.r < core ? omega * p.r : gamma / p.r;
        peakV = Math.max(peakV, vt);
        rSum += p.r;
        // advance
        p.a += (vt / Math.max(p.r, 2)) * 0.9;
        p.r -= 0.22 * inflow * p.sp; // slow inward spiral
        p.y += (0.5 + inflow * 1.4) * p.sp;
        if (p.r < 5 || p.y > h) {
          p.r = core + 8 + Math.random() * (Math.min(w, h) * 0.4);
          p.y = -4;
          p.a = Math.random() * Math.PI * 2;
        }
        const x = cx + Math.cos(p.a) * p.r;
        const yy = p.y;
        const t = Math.min(1, vt / (peakV || 1));
        const col = p.r < core ? C.gold : t > 0.5 ? C.cyan : C.blue;
        const rad = p.r < core ? 2.6 : 1.8;
        ctx.fillStyle = hexA(col, 0.85);
        ctx.shadowColor = col;
        ctx.shadowBlur = p.r < core ? 10 : 5;
        ctx.beginPath();
        ctx.arc(x, yy, rad, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.shadowBlur = 0;

      // core glow column
      const cg = ctx.createLinearGradient(cx, 0, cx, h);
      cg.addColorStop(0, hexA(C.cyan, 0.0));
      cg.addColorStop(0.5, hexA(C.gold, 0.22));
      cg.addColorStop(1, hexA(C.green, 0.0));
      ctx.fillStyle = cg;
      ctx.fillRect(cx - core * 0.8, 0, core * 1.6, h);

      if (vOut.current) vOut.current.textContent = peakV.toFixed(1);
      if (rOut.current) rOut.current.textContent = `${(rSum / parts.length).toFixed(0)} px`;
      if (fOut.current) fOut.current.textContent = `${(inflow * parts.length * 0.05).toFixed(1)} /s`;

      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, []);

  return (
    <div>
      <canvas ref={cvRef} style={{ width: "100%", height: 320, display: "block", borderRadius: 10, border: `1px solid ${C.border}` }} />
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(150px,1fr))", gap: 10, marginTop: 12 }}>
        <Slider label="Circulation Γ" min={0.4} max={4} step={0.05} def={1.6} onChange={(v) => (gammaRef.current = v)} />
        <Slider label="Core radius a" min={10} max={60} step={1} def={26} onChange={(v) => (coreRef.current = v)} />
        <Slider label="Inflow" min={0.2} max={2.5} step={0.05} def={1.0} onChange={(v) => (inflowRef.current = v)} />
      </div>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 16, marginTop: 12 }}>
        <Readout label="Peak swirl v_θ" refEl={vOut} accent={C.gold} />
        <Readout label="Mean radius" refEl={rOut} accent={C.cyan} />
        <Readout label="Regen flux" refEl={fOut} accent={C.green} />
      </div>
    </div>
  );
}

/* ── Canvas 2 · Piezo Bioluminescent Roots (pressure → charge harvest) ── */
function PiezoRootCanvas() {
  const cvRef = useRef<HTMLCanvasElement | null>(null);
  const sigRef = useRef(1.0);
  const gRef = useRef(1.2);
  const nRef = useRef(6);
  const vOut = useRef<HTMLSpanElement | null>(null);
  const pOut = useRef<HTMLSpanElement | null>(null);
  const eOut = useRef<HTMLSpanElement | null>(null);

  useEffect(() => {
    const cv = cvRef.current;
    if (!cv) return;
    const ctx = cv.getContext("2d");
    if (!ctx) return;
    let raf = 0;
    let t = 0;
    let harvested = 0;

    type Cav = { x: number; y: number };
    let cavs: Cav[] = [];
    type Seg = { ax: number; ay: number; bx: number; by: number; depth: number };
    let segs: Seg[] = [];
    let seeded = false;
    let lastW = 0, lastH = 0, lastN = -1;

    const build = (w: number, h: number, n: number) => {
      cavs = [];
      segs = [];
      const topY = h * 0.14;
      const rootX = w * 0.5;
      // recursive roots downward
      const grow = (x: number, y: number, ang: number, len: number, depth: number) => {
        if (depth > 4 || len < 12) {
          cavs.push({ x, y });
          return;
        }
        const bx = x + Math.cos(ang) * len;
        const by = y + Math.sin(ang) * len;
        segs.push({ ax: x, ay: y, bx, by, depth });
        const spread = 0.5 + Math.random() * 0.3;
        grow(bx, by, ang - spread, len * 0.72, depth + 1);
        grow(bx, by, ang + spread, len * 0.72, depth + 1);
      };
      const branches = Math.max(2, Math.round(n / 2));
      for (let i = 0; i < branches; i++) {
        const a = Math.PI / 2 + (i - (branches - 1) / 2) * 0.5;
        grow(rootX, topY, a, (h - topY) * 0.34, 0);
      }
      seeded = true;
    };

    const loop = () => {
      const { w, h } = fitCanvas(cv, ctx);
      const n = Math.round(nRef.current);
      if (!seeded || Math.abs(w - lastW) > 40 || Math.abs(h - lastH) > 40 || n !== lastN) {
        build(w, h, n);
        lastW = w; lastH = h; lastN = n;
      }
      t += 0.05;
      const sigma = sigRef.current;
      const g = gRef.current;
      const p = 0.5 + 0.5 * Math.sin(t * 2.0); // pressure wave 0..1
      const V = g * sigma * p; // proportional open-circuit voltage
      const power = V * V * 0.8; // ∝ V² into a fixed load
      harvested += power * 0.016;

      ctx.clearRect(0, 0, w, h);
      ctx.fillStyle = "#050308";
      ctx.fillRect(0, 0, w, h);
      // soil band
      const soil = ctx.createLinearGradient(0, h * 0.14, 0, h);
      soil.addColorStop(0, "#0a0d16");
      soil.addColorStop(1, "#120b06");
      ctx.fillStyle = soil;
      ctx.fillRect(0, h * 0.14, w, h);

      // pressure bar at top (the vortex above pressing down)
      ctx.fillStyle = hexA(C.cyan, 0.14 + p * 0.3);
      ctx.fillRect(0, 0, w, h * 0.13);
      ctx.fillStyle = hexA(C.text, 0.7);
      ctx.font = "10px monospace";
      ctx.fillText("VORTEX PRESSURE", 10, h * 0.08);

      // roots — glow pulses with pressure
      for (const s of segs) {
        const gl = 0.25 + p * 0.6 * (1 - s.depth * 0.14);
        ctx.strokeStyle = hexA(C.gold, Math.max(0.12, gl));
        ctx.lineWidth = Math.max(1, 4 - s.depth);
        ctx.shadowColor = C.gold;
        ctx.shadowBlur = 6 * p;
        ctx.beginPath();
        ctx.moveTo(s.ax, s.ay);
        ctx.lineTo(s.bx, s.by);
        ctx.stroke();
      }
      ctx.shadowBlur = 0;

      // piezo water cavities at leaves — flash with charge
      for (const cvp of cavs) {
        const glow = 0.3 + p * 0.7;
        ctx.fillStyle = hexA(C.green, 0.2 + p * 0.4);
        ctx.strokeStyle = hexA(C.cyan, glow);
        ctx.lineWidth = 1.4;
        ctx.shadowColor = C.green;
        ctx.shadowBlur = 12 * p;
        ctx.beginPath();
        ctx.ellipse(cvp.x, cvp.y, 8, 6, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
      }
      ctx.shadowBlur = 0;

      if (vOut.current) vOut.current.textContent = `${(V * 120).toFixed(0)} mV`;
      if (pOut.current) pOut.current.textContent = `${(power * cavs.length * 6).toFixed(0)} mW`;
      if (eOut.current) eOut.current.textContent = `${(harvested * cavs.length * 0.4).toFixed(1)} J`;

      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, []);

  return (
    <div>
      <canvas ref={cvRef} style={{ width: "100%", height: 320, display: "block", borderRadius: 10, border: `1px solid ${C.border}` }} />
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(150px,1fr))", gap: 10, marginTop: 12 }}>
        <Slider label="Pressure σ" min={0.2} max={2.5} step={0.05} def={1.0} onChange={(v) => (sigRef.current = v)} />
        <Slider label="Piezo coupling g₃₃" min={0.3} max={3} step={0.05} def={1.2} onChange={(v) => (gRef.current = v)} />
        <Slider label="Cavities" min={4} max={12} step={2} def={6} onChange={(v) => (nRef.current = v)} />
      </div>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 16, marginTop: 12 }}>
        <Readout label="Peak voltage" refEl={vOut} accent={C.gold} />
        <Readout label="Harvest power" refEl={pOut} accent={C.cyan} />
        <Readout label="Energy banked" refEl={eOut} accent={C.green} />
      </div>
    </div>
  );
}

/* ── Canvas 3 · High-κ Dielectric Field Storage (parallel-plate capacitor) ── */
function HighKCanvas() {
  const cvRef = useRef<HTMLCanvasElement | null>(null);
  const kRef = useRef(300);
  const eRef = useRef(1.2);
  const dRef = useRef(0.5);
  const cOut = useRef<HTMLSpanElement | null>(null);
  const uOut = useRef<HTMLSpanElement | null>(null);
  const enOut = useRef<HTMLSpanElement | null>(null);
  const lkOut = useRef<HTMLSpanElement | null>(null);

  useEffect(() => {
    const cv = cvRef.current;
    if (!cv) return;
    const ctx = cv.getContext("2d");
    if (!ctx) return;
    let raf = 0;
    let t = 0;

    const loop = () => {
      const { w, h } = fitCanvas(cv, ctx);
      t += 0.04;
      const kappa = kRef.current;
      const E0 = eRef.current; // arbitrary field units for the drawing
      const dNorm = dRef.current; // 0.15..1 (fraction of slab)

      ctx.clearRect(0, 0, w, h);
      ctx.fillStyle = "#05060e";
      ctx.fillRect(0, 0, w, h);

      const gapPx = 40 + dNorm * (h * 0.5);
      const midY = h * 0.5;
      const topY = midY - gapPx / 2;
      const botY = midY + gapPx / 2;
      const padX = w * 0.12;

      // plates
      ctx.fillStyle = hexA(C.blue, 0.9);
      ctx.fillRect(padX, topY - 10, w - padX * 2, 10);
      ctx.fillStyle = hexA(C.gold, 0.9);
      ctx.fillRect(padX, botY, w - padX * 2, 10);
      ctx.fillStyle = C.muted;
      ctx.font = "11px monospace";
      ctx.fillText("+  plate", padX, topY - 16);
      ctx.fillText("−  plate", padX, botY + 22);

      // dipoles aligning with field — alignment grows with E and κ
      const align = Math.tanh(E0 * (0.5 + Math.log10(kappa) / 4));
      const cols = 14;
      const rows = 5;
      for (let i = 0; i < cols; i++) {
        for (let j = 0; j < rows; j++) {
          const x = padX + 18 + (i / (cols - 1)) * (w - padX * 2 - 36);
          const y = topY + 14 + (j / (rows - 1)) * (gapPx - 28);
          if (y >= botY - 6) continue;
          const jitter = (1 - align) * Math.sin(t * 3 + i + j) * 0.9;
          const ang = -Math.PI / 2 + jitter; // point toward + plate when aligned
          const len = 9;
          ctx.strokeStyle = hexA(C.violet, 0.5 + align * 0.4);
          ctx.lineWidth = 1.6;
          ctx.beginPath();
          ctx.moveTo(x - Math.cos(ang) * len, y - Math.sin(ang) * len);
          ctx.lineTo(x + Math.cos(ang) * len, y + Math.sin(ang) * len);
          ctx.stroke();
          ctx.fillStyle = hexA(C.cyan, 0.8);
          ctx.beginPath();
          ctx.arc(x + Math.cos(ang) * len, y + Math.sin(ang) * len, 2, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      // field lines
      ctx.strokeStyle = hexA(C.cyan, 0.18);
      ctx.lineWidth = 1;
      for (let i = 0; i < 6; i++) {
        const x = padX + 30 + (i / 5) * (w - padX * 2 - 60);
        ctx.beginPath();
        ctx.moveTo(x, topY);
        ctx.lineTo(x, botY);
        ctx.stroke();
      }

      // leakage sparks when gap is very thin
      const leakRisk = dNorm < 0.28 ? (0.28 - dNorm) / 0.28 : 0;
      if (leakRisk > 0 && Math.sin(t * 8) > 1 - leakRisk) {
        ctx.strokeStyle = hexA("#ff5a6a", 0.8);
        ctx.lineWidth = 1.4;
        const lx = padX + 40 + Math.random() * (w - padX * 2 - 80);
        ctx.beginPath();
        ctx.moveTo(lx, topY);
        let yy = topY;
        while (yy < botY) {
          yy += 8;
          ctx.lineTo(lx + (Math.random() - 0.5) * 12, yy);
        }
        ctx.stroke();
      }

      // real physics readouts
      const dMeters = 1e-9 * (1 + dNorm * 99); // 1..100 nm
      const Cap = (kappa * EPS0 * AREA) / dMeters; // farads
      const Efield = E0 * 1e6; // V/m (arbitrary display field)
      const U = 0.5 * kappa * EPS0 * Efield * Efield; // J/m³
      const Enet = E0 / kappa;

      if (cOut.current) cOut.current.textContent = `${(Cap * 1e9).toFixed(1)} nF`;
      if (uOut.current) uOut.current.textContent = `${U.toExponential(1)} J/m³`;
      if (enOut.current) enOut.current.textContent = `${Enet.toExponential(1)} ×E₀`;
      if (lkOut.current) lkOut.current.textContent = leakRisk > 0 ? `${(leakRisk * 100).toFixed(0)}% risk` : "sealed";

      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, []);

  return (
    <div>
      <canvas ref={cvRef} style={{ width: "100%", height: 320, display: "block", borderRadius: 10, border: `1px solid ${C.border}` }} />
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(150px,1fr))", gap: 10, marginTop: 12 }}>
        <Slider label="Permittivity κ" min={1} max={25000} step={1} def={300} onChange={(v) => (kRef.current = v)} />
        <Slider label="Applied field E₀" min={0.2} max={3} step={0.05} def={1.2} onChange={(v) => (eRef.current = v)} />
        <Slider label="Gap d (thin → thick)" min={0.15} max={1} step={0.01} def={0.5} onChange={(v) => (dRef.current = v)} />
      </div>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 16, marginTop: 12 }}>
        <Readout label="Capacitance C" refEl={cOut} accent={C.gold} />
        <Readout label="Energy density U" refEl={uOut} accent={C.cyan} />
        <Readout label="Net field E₀/κ" refEl={enOut} accent={C.violet} />
        <Readout label="Leakage" refEl={lkOut} accent={C.green} />
      </div>
    </div>
  );
}

/* ── UI helpers ── */
function Slider({ label, min, max, step, def, onChange }: { label: string; min: number; max: number; step: number; def: number; onChange: (v: number) => void }) {
  const valRef = useRef<HTMLSpanElement | null>(null);
  return (
    <label style={{ display: "block", fontFamily: "monospace", fontSize: 11, color: C.muted }}>
      <span style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
        <span>{label}</span>
        <span ref={valRef} style={{ color: C.text }}>{def}</span>
      </span>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        defaultValue={def}
        onChange={(e) => {
          const v = parseFloat(e.target.value);
          onChange(v);
          if (valRef.current) valRef.current.textContent = String(v);
        }}
        style={{ width: "100%", accentColor: C.cyan }}
      />
    </label>
  );
}

function Readout({ label, refEl, accent }: { label: string; refEl: React.RefObject<HTMLSpanElement | null>; accent: string }) {
  return (
    <div style={{ flex: "0 0 auto" }}>
      <div style={{ fontFamily: "monospace", fontSize: 10, color: C.muted, textTransform: "uppercase", letterSpacing: 1 }}>{label}</div>
      <span ref={refEl} style={{ fontFamily: "monospace", fontSize: 14, color: accent }}>—</span>
    </div>
  );
}

function Section({ n, title, sub, children }: { n: string; title: string; sub?: string; children: ReactNode }) {
  return (
    <section style={{ marginBottom: 34 }}>
      <div style={{ display: "flex", alignItems: "baseline", gap: 12, marginBottom: 6 }}>
        <span style={{ fontFamily: "monospace", fontSize: 12, color: C.cyan }}>{n}</span>
        <h2 style={{ margin: 0, fontSize: 20, color: C.text, fontWeight: 600 }}>{title}</h2>
      </div>
      {sub && <p style={{ margin: "0 0 14px", color: C.muted, fontSize: 13, lineHeight: 1.6, maxWidth: 760 }}>{sub}</p>}
      <div style={{ background: C.panel, border: `1px solid ${C.border}`, borderRadius: 12, padding: 18 }}>{children}</div>
    </section>
  );
}

function Plate({ src, cap }: { src: string; cap: string }) {
  return (
    <figure style={{ margin: 0, background: C.panel2, border: `1px solid ${C.border}`, borderRadius: 12, overflow: "hidden" }}>
      <img src={src} alt={cap} loading="lazy" style={{ width: "100%", display: "block", borderBottom: `1px solid ${C.border}` }} />
      <figcaption style={{ fontSize: 10.5, color: "#8ea6c4", lineHeight: 1.5, padding: "9px 11px" }}>{cap}</figcaption>
    </figure>
  );
}

function PlateGrid({ plates }: { plates: { src: string; cap: string }[] }) {
  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(240px,1fr))", gap: 14 }}>
      {plates.map((p) => (
        <Plate key={p.cap} src={p.src} cap={p.cap} />
      ))}
    </div>
  );
}

export default function AetherHabitatPage() {
  return (
    <div style={{ minHeight: "100vh", background: C.bg, color: C.text, padding: "40px 22px 80px", fontFamily: "'Inter',system-ui,sans-serif" }}>
      <div style={{ maxWidth: 980, margin: "0 auto" }}>
        <div style={{ marginBottom: 8, fontFamily: "monospace", fontSize: 11, color: C.muted, letterSpacing: 2, textTransform: "uppercase" }}>
          AETHER · Substrate · Regenerative Habitat
        </div>
        <h1 style={{ fontSize: 34, margin: "0 0 10px", fontWeight: 700, background: `linear-gradient(90deg,${C.cyan},${C.violet},${C.gold})`, WebkitBackgroundClip: "text", backgroundClip: "text", color: "transparent" }}>
          AETHER Regenerative Habitat
        </h1>
        <p style={{ color: C.muted, fontSize: 15, lineHeight: 1.7, maxWidth: 780, margin: "0 0 20px" }}>
          A living building organised around a single vertical vortex. At the centre, a regeneration core circulates air, water, and light; beneath it, bioluminescent piezoelectric roots harvest pressure into charge; in the walls, a high-κ dielectric skin stores the field like a distributed capacitor, grown atom-by-atom with atomic-layer deposition; and the whole tower rides a base-isolation mount on a Fibonacci frame. This page grounds the dream in real physics — capacitance, piezoelectricity, ALD, vortex flow, and seismic isolation.
        </p>
        <p style={{ color: hexA(C.gold, 0.85), fontSize: 12, lineHeight: 1.6, maxWidth: 780, margin: "0 0 24px", fontStyle: "italic" }}>
          Note · every component below is real physics, and the simulations are faithful to their stated equations. The synthesis — a self-powering, self-regenerating living building — is a speculative AETHER vision, not a product spec.
        </p>

        {/* hero motion */}
        <figure style={{ margin: "0 0 30px", borderRadius: 14, overflow: "hidden", border: `1px solid ${C.border}`, background: "#000" }}>
          <video src={vidA} autoPlay muted loop playsInline preload="metadata" style={{ width: "100%", display: "block" }} />
          <figcaption style={{ fontSize: 11, color: "#8ea6c4", padding: "10px 12px", background: C.panel2 }}>
            The regeneration core · vortex circulation threading the habitat.
          </figcaption>
        </figure>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(190px,1fr))", gap: 10, marginBottom: 34 }}>
          {FACTS.map((f) => (
            <div key={f.k} style={{ background: C.panel, border: `1px solid ${C.border}`, borderRadius: 10, padding: "10px 12px" }}>
              <div style={{ fontFamily: "monospace", fontSize: 10, color: C.muted, textTransform: "uppercase", letterSpacing: 1 }}>{f.k}</div>
              <div style={{ fontSize: 13.5, color: C.text, marginTop: 3 }}>{f.v}</div>
            </div>
          ))}
        </div>

        <Section n="I" title="The Vortex Regeneration Core" sub="A stable swirling column threading the building. Modelled as a Rankine vortex — solid-body rotation inside the core radius a, free-vortex flow outside it — so the swirl never blows up to infinity at the centre. Raise the circulation Γ and inflow to drive faster circulation and higher regeneration flux.">
          <VortexCanvas />
        </Section>

        <Section n="II" title="Piezoelectric Bioluminescent Roots" sub="Beneath the floor, a branching root network of water + piezo cavities. The vortex above presses down in a rhythmic pressure wave; each cavity converts that stress into voltage by V = g₃₃·σ·t, and the glowing branches carry the harvest. Real piezoelectricity — honest scale is milliwatts to watts, enough to trim the load, not to power a city.">
          <PiezoRootCanvas />
        </Section>

        <Section n="III" title="High-κ Dielectric Field Storage" sub="The walls store energy as a field. A parallel-plate capacitor with a high-permittivity dielectric (SrTiO₃, κ up to tens of thousands) holds far more charge per volt — the dipoles align with the field and the net field inside collapses to E₀/κ. Push the gap too thin and quantum-tunnelling leakage appears (red arcs): the real engineering trade-off between density and integrity.">
          <HighKCanvas />
        </Section>

        <Section n="IV" title="The Vortex Habitat" sub="The dwellings themselves — dome and bubble homes cross-sectioned to reveal the central vortex core feeding a rooted underground. Each plate maps an image to the mechanism it dramatizes.">
          <PlateGrid plates={HABITAT_PLATES} />
        </Section>

        <Section n="V" title="The AETHER Tower" sub="The habitat scaled to a skyrise: a tubular AETHER frame on a Fibonacci helix, pods placed on the golden angle, a central vortex regeneration core, and a rocking-boat base for seismic isolation.">
          <PlateGrid plates={TOWER_PLATES} />
        </Section>

        <Section n="VI" title="The Energy Substrate" sub="The material science underneath the architecture — high-κ dielectric field storage, the active strontium metamaterial core, atomic-layer-deposition synthesis, and the Inverbase of piezo cavities and mycelial roots.">
          <PlateGrid plates={SUBSTRATE_PLATES} />
        </Section>

        <Section n="VII" title="Coherence & Notation" sub="The abstract layer — the coherence dome as a tiling of field shells, and the workbench of equations that the built habitat is a physical expression of.">
          <PlateGrid plates={NOTATION_PLATES} />
        </Section>

        <Section n="VIII" title="Motion Field" sub="Animated studies of the same habitat — vortex core, root current, dwelling field, and tower dynamics. Press play on any panel.">
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(240px,1fr))", gap: 14 }}>
            {VIDEOS.map((v) => (
              <figure key={v.cap} style={{ margin: 0, background: C.panel2, border: `1px solid ${C.border}`, borderRadius: 12, overflow: "hidden" }}>
                <video src={v.src} controls muted loop playsInline preload="metadata" style={{ width: "100%", display: "block", background: "#000" }} />
                <figcaption style={{ fontSize: 10.5, color: "#8ea6c4", lineHeight: 1.5, padding: "9px 11px" }}>{v.cap}</figcaption>
              </figure>
            ))}
          </div>
        </Section>

        <Section n="IX" title="The Mathematics" sub="Eight relations that hold the habitat together — from the capacitance and field-energy laws of the storage skin to the AETHER coherence field that reads the whole structure as one phase.">
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(280px,1fr))", gap: 12 }}>
            {MATH.map((m) => (
              <div key={m.eq} style={{ background: C.panel2, border: `1px solid ${C.border}`, borderRadius: 10, padding: "12px 14px" }}>
                <div style={{ fontFamily: "monospace", fontSize: 13.5, color: C.gold, marginBottom: 6 }}>{m.eq}</div>
                <div style={{ fontSize: 12.5, color: C.muted, lineHeight: 1.6 }}>{m.note}</div>
              </div>
            ))}
          </div>
        </Section>

        <Section n="X" title="In Words" sub="The habitat stated plainly — what is real physics, what is honest speculation, and where the one runs into the other.">
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(280px,1fr))", gap: 12 }}>
            {VERBAL.map((v) => (
              <div key={v.t} style={{ background: C.panel2, border: `1px solid ${C.border}`, borderRadius: 10, padding: "12px 14px" }}>
                <div style={{ fontSize: 14, color: C.cyan, fontWeight: 600, marginBottom: 6 }}>{v.t}</div>
                <div style={{ fontSize: 12.5, color: C.muted, lineHeight: 1.6 }}>{v.d}</div>
              </div>
            ))}
          </div>
        </Section>

        <div style={{ display: "flex", flexWrap: "wrap", gap: 14, marginTop: 40, paddingTop: 22, borderTop: `1px solid ${C.border}`, fontFamily: "monospace", fontSize: 12 }}>
          <Link href="/seismic-self-build" style={{ color: C.blue, textDecoration: "none" }}>→ Seismic Self-Build</Link>
          <Link href="/rhombus-gate" style={{ color: C.violet, textDecoration: "none" }}>→ Rhombus Gate · Piezo</Link>
          <Link href="/bio-magnetic-convergence" style={{ color: C.green, textDecoration: "none" }}>→ Bio-Magnetic Convergence</Link>
          <Link href="/graph-map" style={{ color: C.muted, textDecoration: "none" }}>→ Knowledge Graph</Link>
        </div>
      </div>
    </div>
  );
}
