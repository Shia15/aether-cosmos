import { useEffect, useRef, type ReactNode } from "react";
import { Link } from "wouter";

import imgSpiral from "@assets/download_(24)_1782927603039.jpg";
import imgVascular from "@assets/download_(22)_1782927615486.jpg";
import imgCoil from "@assets/download_(21)_1782927626797.jpg";
import imgCheckpoint from "@assets/download_(18)_1782927677739.jpg";
import imgBrainTree from "@assets/download_(17)_1782927692875.jpg";
import imgPlanet from "@assets/download_(16)_1782927706674.jpg";
import imgPipeline from "@assets/46839d4f-507d-4309-b8b6-5a38797d9962_1782927766796.jpg";

import vidHero from "@assets/grok-video-e531adf0-aa50-47dd-adc1-655663ea1efb_1782927381779.mp4";
import vidA from "@assets/7dc68708-761a-479c-9b05-10590262ccfe_hd_1782927461693.mp4";
import vidB from "@assets/grok-video-a2467162-1ad8-4fec-9f47-6cdfd25b9594_(1)_1782927489715.mp4";
import vidC from "@assets/338e357b-5c7e-46ab-a0e7-9d2991c94fea_hd_1782927551831.mp4";

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

const FACTS = [
  { k: "Convergence", v: "Biology · Magnetism · Medicine" },
  { k: "Proton Larmor", v: "42.58 MHz per tesla" },
  { k: "MRI field B₀", v: "1.5 – 3 T (clinical)" },
  { k: "Heart field", v: "≈ 100 pT (magnetocardiogram)" },
  { k: "Brain field", v: "≈ 100 fT (MEG)" },
  { k: "Earth field", v: "≈ 25 – 65 µT" },
  { k: "Schumann resonance", v: "≈ 7.83 Hz" },
  { k: "Mycelial network", v: "kilometres of hyphae per gram" },
];

const MATH = [
  { eq: "ω = γ · B₀", note: "Larmor precession. Protons in tissue precess at 42.58 MHz for every tesla of field. To couple energy into a living body magnetically, a device must ring at this exact resonance — the physics behind MRI and every honest magnetic-resonance instrument." },
  { eq: "M_z(t) = M₀ · (1 − e^(−t/T₁))", note: "Longitudinal relaxation. After a pulse tips the spins, magnetization recovers along the field with a time constant T₁ that differs by tissue. This difference is what lets a scanner read soft tissue — biology written in relaxation times." },
  { eq: "M_xy(t) = M₀ · e^(−t/T₂)", note: "Transverse decoherence. The spins start in phase and fan out; the shared signal decays with T₂. In AETHER language, T₂ is the coherence time τc of the tissue — how long the body holds a common phase." },
  { eq: "r = (1/N) · |Σ e^(iθ_k)|", note: "Kuramoto order parameter. r measures how synchronized a network of oscillators is: r → 1 when they lock to a common rhythm, r → 0 when they scatter. It is the single number for bio-magnetic coherence." },
  { eq: "dθ_k/dt = ω_k + (K/d)·Σ_(j∈neighbours) sin(θ_j − θ_k) + B·sin(Ωt − θ_k)", note: "Driven coupled oscillators. Each node has its own frequency ω_k, is pulled toward its graph neighbours (degree d) by coupling K, and is entrained by an external field of strength B at frequency Ω — the equation for a living network syncing to an applied field. The simulation sums over the mycelial web's local links, a sparse form of the classic all-to-all Kuramoto model." },
  { eq: "B_dipole = (μ₀ / 4π) · (m / r³)", note: "A coil's field falls off as 1/r³. Bio-magnetic coupling is therefore intensely near-field: the source must sit right against the tissue, which is why the scanner ring wraps the body and the healing device is pressed to the skin." },
  { eq: "B_heart ≈ 10⁻¹⁰ T,  B_brain ≈ 10⁻¹³ T", note: "The body's own magnetic fields are real and measurable — but 10⁸–10¹¹ times weaker than an MRI magnet. Honest scale: biology whispers magnetically; technology shouts. Convergence means learning to read the whisper." },
  { eq: "C(x,t) = A(x) · e^(i(φ − ωt))", note: "The AETHER coherence field — the through-line of the whole page. The same field object is carried across four substrates: neural tissue, the resonant coil, the mycelial web, and the planet. One equation, four bodies." },
];

const VERBAL = [
  { t: "One field, four substrates", d: "The convergence claim is simple: the phase-coherence field that describes a synchronized brain also describes a resonant coil, a mycelial network, and the Earth's own magnetosphere. Nothing new is invented — the same coherence object is carried from tissue to machine to planet, changing only its carrier." },
  { t: "Magnetism is the shared language", d: "Every biological process that involves moving charge — a heartbeat, a nerve impulse — radiates a magnetic field. Instruments already read these: the magnetocardiogram and MEG. Magnetic resonance is the two-way version, letting a field both listen to and drive the tissue at its Larmor frequency." },
  { t: "Mycelium as a living wire", d: "Fungal networks are not a metaphor here — they genuinely conduct electrical signals and route nutrients across kilometres of hyphae, rerouting around damage. As a substrate for the convergence they are a real, self-healing, distributed conductor: a biological internet already in the soil." },
  { t: "Grown, not manufactured", d: "The vehicles in these images are grown — vascular skins, root-like chassis, bio-luminescent veins. This is the biofabrication end of the idea: structure laid down by living or bio-templated growth rather than cut from stock. It is speculative as engineering, but it points at a real frontier." },
  { t: "Healing as re-coherence", d: "If illness is decoherence — spins, cells, or rhythms fanning out of phase — then a magnetic instrument that restores phase is doing the T₂-recovery move on a living body. Clinically, magnetic medicine today means imaging (MRI) and stimulation (TMS, PEMF); the fuller vision here is a horizon, not a product." },
  { t: "The planet is in the loop", d: "The Earth carries a magnetic field and rings at the Schumann resonance near 7.83 Hz. Placing the body, the machine, and the planet on one axis is not mysticism at the level of physics — all three are oscillating magnetic systems that can, in principle, share a phase reference." },
  { t: "Honest horizon", d: "Read this page as an AETHER synthesis: real magnetic-resonance physics (Larmor, T₁/T₂, Kuramoto, the honest field scales) used as scaffolding for a speculative convergence of biology and technology. The simulations are faithful to their equations; the grown cars and planetary healing are the dream the equations point toward." },
];

const PLATES = [
  { src: imgSpiral, cap: "Spacetime-spiral levitation · coral-mycelial lattice · resonance scanner — machine, medicine, and living network sharing one field." },
  { src: imgVascular, cap: "Diagnostic telemetry, a tree's neural root canopy, and a car grown with a vascular skin — biology used as the blueprint." },
  { src: imgCoil, cap: "A circular induction coil over a patient, Earth beyond, and a vehicle wound like a solenoid — magnetism as the shared substrate." },
  { src: imgCheckpoint, cap: "The convergence checkpoint — a mycelial sky meeting clinical infrastructure under the sign BIO MAGNETIC TECHNOLOGY CONVERGENCE." },
  { src: imgBrainTree, cap: "A brain-tree fungal canopy above a bio-luminescent vehicle — computation grown from a living network, not fabricated." },
  { src: imgPlanet, cap: "Planetary consciousness and personal healing on one axis — body, Earth, and instrument reading the same signal." },
  { src: imgPipeline, cap: "Data streaming from clinical monitors through a mycelial network into a rolling machine — the full convergence pipeline." },
];

const VIDEOS = [
  { src: vidA, cap: "Field-entrained growth · living network resonance." },
  { src: vidB, cap: "Resonant vehicle · coil-wound biomechanics." },
  { src: vidC, cap: "Mycelial signal flow · biology to machine." },
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

function phaseColor(theta: number, l = 58) {
  const two = Math.PI * 2;
  const hue = (((theta % two) + two) % two) / two * 360;
  return `hsl(${hue.toFixed(0)},70%,${l}%)`;
}

/* ── Canvas 1 · Bio-magnetic coupling (driven Kuramoto on a living web) ── */
function CouplingCanvas() {
  const cvRef = useRef<HTMLCanvasElement | null>(null);
  const kRef = useRef(1.4);
  const bRef = useRef(0.9);
  const omRef = useRef(1.0);
  const rOut = useRef<HTMLSpanElement | null>(null);
  const entOut = useRef<HTMLSpanElement | null>(null);
  const drOut = useRef<HTMLSpanElement | null>(null);

  useEffect(() => {
    const cv = cvRef.current;
    if (!cv) return;
    const ctx = cv.getContext("2d");
    if (!ctx) return;
    let raf = 0;
    let t = 0;

    type Node = { x: number; y: number; th: number; om: number };
    let nodes: Node[] = [];
    let links: [number, number][] = [];
    let seeded = false;
    let lastW = 0, lastH = 0;

    const seed = (w: number, h: number) => {
      nodes = [];
      links = [];
      const N = 46;
      for (let i = 0; i < N; i++) {
        const a = i * 2.399963; // golden-angle spread
        const rad = (0.14 + 0.82 * (i / N)) * Math.min(w, h) * 0.44;
        const x = w * 0.5 + Math.cos(a) * rad + (Math.random() - 0.5) * 22;
        const y = h * 0.5 + Math.sin(a) * rad * 0.82 + (Math.random() - 0.5) * 22;
        nodes.push({ x, y, th: Math.random() * Math.PI * 2, om: 0.6 + Math.random() * 1.4 });
      }
      // connect each node to its 2 nearest neighbours (a mycelial web)
      for (let i = 0; i < N; i++) {
        const d: { j: number; dist: number }[] = [];
        for (let j = 0; j < N; j++) {
          if (i === j) continue;
          const dx = nodes[i].x - nodes[j].x, dy = nodes[i].y - nodes[j].y;
          d.push({ j, dist: dx * dx + dy * dy });
        }
        d.sort((a, b) => a.dist - b.dist);
        for (let m = 0; m < 2; m++) {
          const j = d[m].j;
          if (!links.some((l) => (l[0] === j && l[1] === i))) links.push([i, j]);
        }
      }
      seeded = true;
    };

    const loop = () => {
      const { w, h } = fitCanvas(cv, ctx);
      if (!seeded || Math.abs(w - lastW) > 40 || Math.abs(h - lastH) > 40) {
        seed(w, h);
        lastW = w; lastH = h;
      }
      ctx.clearRect(0, 0, w, h);
      ctx.fillStyle = "#04050b";
      ctx.fillRect(0, 0, w, h);
      const dt = 0.03;
      t += dt;

      const K = kRef.current;
      const B = bRef.current;
      const Om = omRef.current;
      const N = nodes.length;

      // integrate driven-Kuramoto phases
      const drive = Om * t;
      for (let i = 0; i < N; i++) {
        let coup = 0;
        for (const [a, b] of links) {
          if (a === i) coup += Math.sin(nodes[b].th - nodes[i].th);
          else if (b === i) coup += Math.sin(nodes[a].th - nodes[i].th);
        }
        const dth = nodes[i].om + (K / 4) * coup + B * Math.sin(drive - nodes[i].th);
        nodes[i].th += dth * dt;
      }

      // order parameter
      let sx = 0, sy = 0;
      for (const n of nodes) { sx += Math.cos(n.th); sy += Math.sin(n.th); }
      const r = Math.sqrt(sx * sx + sy * sy) / N;

      // pulsing external field ring
      const cx = w * 0.5, cy = h * 0.5;
      const pulse = 0.5 + 0.5 * Math.sin(drive);
      const ringR = Math.min(w, h) * 0.46;
      const rg = ctx.createRadialGradient(cx, cy, ringR * 0.2, cx, cy, ringR);
      rg.addColorStop(0, hexA(C.violet, 0));
      rg.addColorStop(1, hexA(C.violet, 0.05 + 0.12 * B * pulse));
      ctx.fillStyle = rg;
      ctx.fillRect(0, 0, w, h);
      ctx.strokeStyle = hexA(C.violet, 0.15 + 0.35 * B * pulse);
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.ellipse(cx, cy, ringR, ringR * 0.82, 0, 0, Math.PI * 2);
      ctx.stroke();

      // links
      for (const [a, b] of links) {
        const na = nodes[a], nb = nodes[b];
        const coh = 0.5 + 0.5 * Math.cos(na.th - nb.th);
        ctx.strokeStyle = hexA(C.cyan, 0.06 + 0.34 * coh);
        ctx.lineWidth = 0.6 + 1.6 * coh;
        ctx.beginPath();
        ctx.moveTo(na.x, na.y);
        ctx.lineTo(nb.x, nb.y);
        ctx.stroke();
      }

      // nodes coloured by phase
      for (const n of nodes) {
        const col = phaseColor(n.th);
        ctx.fillStyle = col;
        ctx.shadowColor = col;
        ctx.shadowBlur = 8;
        ctx.beginPath();
        ctx.arc(n.x, n.y, 4.2, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.shadowBlur = 0;

      // central coherence dial
      ctx.fillStyle = hexA("#04050b", 0.72);
      ctx.beginPath();
      ctx.arc(cx, cy, 30, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = hexA(C.border, 1);
      ctx.stroke();
      ctx.strokeStyle = C.gold;
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(cx, cy, 24, -Math.PI / 2, -Math.PI / 2 + r * Math.PI * 2);
      ctx.stroke();
      ctx.fillStyle = C.gold;
      ctx.font = "bold 13px monospace";
      ctx.textAlign = "center";
      ctx.fillText(r.toFixed(2), cx, cy + 4);
      ctx.textAlign = "left";

      if (rOut.current) rOut.current.textContent = r.toFixed(3);
      if (entOut.current) entOut.current.textContent = `${(r * 100).toFixed(0)} %`;
      if (drOut.current) drOut.current.textContent = `${Om.toFixed(2)} rad/s`;

      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, []);

  return (
    <div>
      <canvas ref={cvRef} style={{ width: "100%", height: 340, display: "block", borderRadius: 10, border: `1px solid ${C.border}` }} />
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(150px,1fr))", gap: 10, marginTop: 12 }}>
        <Slider label="Coupling K (network)" min={0} max={4} step={0.05} def={1.4} onChange={(v) => (kRef.current = v)} />
        <Slider label="Field strength B (drive)" min={0} max={3} step={0.05} def={0.9} onChange={(v) => (bRef.current = v)} />
        <Slider label="Drive frequency Ω" min={0.2} max={3} step={0.05} def={1.0} onChange={(v) => (omRef.current = v)} />
      </div>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 16, marginTop: 12 }}>
        <Readout label="Order r" refEl={rOut} accent={C.gold} />
        <Readout label="Entrained" refEl={entOut} accent={C.cyan} />
        <Readout label="Drive" refEl={drOut} accent={C.violet} />
      </div>
    </div>
  );
}

/* ── Canvas 2 · Resonant coil (Larmor precession + T1/T2 relaxation) ── */
function CoilCanvas() {
  const cvRef = useRef<HTMLCanvasElement | null>(null);
  const b0Ref = useRef(1.5);
  const t1Ref = useRef(1.2);
  const t2Ref = useRef(0.4);
  const larOut = useRef<HTMLSpanElement | null>(null);
  const mzOut = useRef<HTMLSpanElement | null>(null);
  const mxyOut = useRef<HTMLSpanElement | null>(null);

  useEffect(() => {
    const cv = cvRef.current;
    if (!cv) return;
    const ctx = cv.getContext("2d");
    if (!ctx) return;
    let raf = 0;
    let t = 0;         // seconds since last pulse
    const period = 4;  // re-pulse every 4 s
    const spins = Array.from({ length: 24 }, () => 0.85 + Math.random() * 0.3); // dephasing spread

    const loop = () => {
      const { w, h } = fitCanvas(cv, ctx);
      ctx.clearRect(0, 0, w, h);
      ctx.fillStyle = "#04050b";
      ctx.fillRect(0, 0, w, h);
      const dt = 0.016;
      t += dt;
      if (t > period) t = 0;

      const B0 = b0Ref.current;
      const T1 = t1Ref.current;
      const T2 = t2Ref.current;
      const larmor = 42.58 * B0; // MHz
      const precess = B0 * 3.2;  // visual precession rate

      // relaxation envelopes
      const Mz = 1 - Math.exp(-t / T1);
      const Mxy = Math.exp(-t / T2);

      const cx = w * 0.32, cy = h * 0.52;
      const R = Math.min(w, h) * 0.3;

      // coil rings around the sample
      for (let i = 0; i < 3; i++) {
        ctx.strokeStyle = hexA(C.blue, 0.25 + 0.15 * i);
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.ellipse(cx, cy, R * (1.25 - i * 0.05), R * (0.5 - i * 0.03), 0, 0, Math.PI * 2);
        ctx.stroke();
      }
      // field axis
      ctx.strokeStyle = hexA(C.muted, 0.5);
      ctx.setLineDash([4, 4]);
      ctx.beginPath();
      ctx.moveTo(cx, cy - R * 1.1);
      ctx.lineTo(cx, cy + R * 1.1);
      ctx.stroke();
      ctx.setLineDash([]);
      ctx.fillStyle = C.muted;
      ctx.font = "10px monospace";
      ctx.fillText("B₀", cx + 6, cy - R * 1.0);

      // ring of spins showing dephasing
      const nSpins = spins.length;
      for (let i = 0; i < nSpins; i++) {
        const a = (i / nSpins) * Math.PI * 2;
        const ox = cx + Math.cos(a) * R * 0.62;
        const oy = cy + Math.sin(a) * R * 0.3;
        // each spin precesses; spread grows the transverse dephasing
        const ph = t * precess * spins[i] + a;
        const tip = Mxy; // in-plane component
        const vx = Math.cos(ph) * 12 * tip;
        const vy = Math.sin(ph) * 5 * tip;
        const vz = -Mz * 14; // recovered longitudinal (up)
        ctx.strokeStyle = phaseColor(ph, 60);
        ctx.lineWidth = 1.6;
        ctx.beginPath();
        ctx.moveTo(ox, oy);
        ctx.lineTo(ox + vx, oy + vy + vz);
        ctx.stroke();
        ctx.fillStyle = phaseColor(ph, 60);
        ctx.beginPath();
        ctx.arc(ox + vx, oy + vy + vz, 2, 0, Math.PI * 2);
        ctx.fill();
      }

      // net magnetization vector
      const netPh = t * precess * 1.0;
      const nvx = Math.cos(netPh) * R * 0.5 * Mxy;
      const nvy = Math.sin(netPh) * R * 0.2 * Mxy;
      const nvz = -Mz * R * 0.55;
      ctx.strokeStyle = C.gold;
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.lineTo(cx + nvx, cy + nvy + nvz);
      ctx.stroke();
      ctx.fillStyle = C.gold;
      ctx.beginPath();
      ctx.arc(cx + nvx, cy + nvy + nvz, 4, 0, Math.PI * 2);
      ctx.fill();

      // pulse flash
      if (t < 0.18) {
        ctx.fillStyle = hexA(C.cyan, 0.3 * (1 - t / 0.18));
        ctx.beginPath();
        ctx.ellipse(cx, cy, R * 1.3, R * 0.55, 0, 0, Math.PI * 2);
        ctx.fill();
      }

      // relaxation bars on the right
      const bx = w * 0.72, bw = 26, bh = R * 1.4, by = cy - bh / 2;
      const bar = (x: number, frac: number, col: string, lab: string) => {
        ctx.strokeStyle = hexA(C.border, 1);
        ctx.strokeRect(x, by, bw, bh);
        ctx.fillStyle = hexA(col, 0.85);
        ctx.fillRect(x, by + bh * (1 - frac), bw, bh * frac);
        ctx.fillStyle = C.muted;
        ctx.font = "10px monospace";
        ctx.textAlign = "center";
        ctx.fillText(lab, x + bw / 2, by + bh + 14);
        ctx.fillText(`${(frac * 100).toFixed(0)}%`, x + bw / 2, by - 6);
        ctx.textAlign = "left";
      };
      bar(bx, Mz, C.violet, "Mz · T₁");
      bar(bx + 54, Mxy, C.cyan, "Mxy · T₂");

      if (larOut.current) larOut.current.textContent = `${larmor.toFixed(1)} MHz`;
      if (mzOut.current) mzOut.current.textContent = `${(Mz * 100).toFixed(0)} %`;
      if (mxyOut.current) mxyOut.current.textContent = `${(Mxy * 100).toFixed(0)} %`;

      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, []);

  return (
    <div>
      <canvas ref={cvRef} style={{ width: "100%", height: 320, display: "block", borderRadius: 10, border: `1px solid ${C.border}` }} />
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(150px,1fr))", gap: 10, marginTop: 12 }}>
        <Slider label="Field B₀ (tesla)" min={0.2} max={7} step={0.1} def={1.5} onChange={(v) => (b0Ref.current = v)} />
        <Slider label="T₁ recovery (s)" min={0.3} max={3} step={0.05} def={1.2} onChange={(v) => (t1Ref.current = v)} />
        <Slider label="T₂ coherence (s)" min={0.1} max={2} step={0.05} def={0.4} onChange={(v) => (t2Ref.current = v)} />
      </div>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 16, marginTop: 12 }}>
        <Readout label="Larmor freq" refEl={larOut} accent={C.gold} />
        <Readout label="Longitudinal Mz" refEl={mzOut} accent={C.violet} />
        <Readout label="Transverse Mxy" refEl={mxyOut} accent={C.cyan} />
      </div>
    </div>
  );
}

/* ── Canvas 3 · Mycelial signal propagation (biology → machine) ── */
function MycelialCanvas() {
  const cvRef = useRef<HTMLCanvasElement | null>(null);
  const rateRef = useRef(0.5);
  const speedRef = useRef(1.0);
  const branchRef = useRef(3);
  const thrOut = useRef<HTMLSpanElement | null>(null);
  const actOut = useRef<HTMLSpanElement | null>(null);
  const totOut = useRef<HTMLSpanElement | null>(null);

  useEffect(() => {
    const cv = cvRef.current;
    if (!cv) return;
    const ctx = cv.getContext("2d");
    if (!ctx) return;
    let raf = 0;

    type Pt = { x: number; y: number };
    let leaves: Pt[] = [];
    let edges: [Pt, Pt][] = [];
    let root: Pt = { x: 0, y: 0 };
    let seeded = false;
    let lastW = 0, lastH = 0, lastBranch = -1;

    type Pkt = { path: Pt[]; seg: number; f: number };
    let pkts: Pkt[] = [];
    let arrived = 0;
    const paths: Pt[][] = [];
    let spawnAcc = 0;

    const build = (w: number, h: number, branch: number) => {
      leaves = [];
      edges = [];
      paths.length = 0;
      root = { x: w * 0.08, y: h * 0.5 };
      const gen1 = branch;                 // first split
      const gen2 = 2;                       // each splits into 2
      for (let i = 0; i < gen1; i++) {
        const y1 = h * (0.5 + (i - (gen1 - 1) / 2) * 0.24);
        const n1 = { x: w * 0.38, y: y1 };
        edges.push([root, n1]);
        for (let j = 0; j < gen2; j++) {
          const y2 = y1 + (j - (gen2 - 1) / 2) * h * 0.14;
          const n2 = { x: w * 0.68, y: y2 };
          edges.push([n1, n2]);
          const leaf = { x: w * 0.9, y: y2 };
          edges.push([n2, leaf]);
          leaves.push(leaf);
          paths.push([root, n1, n2, leaf]);
        }
      }
      seeded = true;
    };

    const loop = () => {
      const { w, h } = fitCanvas(cv, ctx);
      const branch = Math.round(branchRef.current);
      if (!seeded || Math.abs(w - lastW) > 40 || Math.abs(h - lastH) > 40 || branch !== lastBranch) {
        build(w, h, branch);
        pkts = [];
        lastW = w; lastH = h; lastBranch = branch;
      }
      ctx.clearRect(0, 0, w, h);
      ctx.fillStyle = "#04050b";
      ctx.fillRect(0, 0, w, h);

      const rate = rateRef.current;
      const speed = speedRef.current;

      // edges (mycelial threads)
      for (const [a, b] of edges) {
        const g = ctx.createLinearGradient(a.x, a.y, b.x, b.y);
        g.addColorStop(0, hexA(C.green, 0.4));
        g.addColorStop(1, hexA(C.cyan, 0.4));
        ctx.strokeStyle = g;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(a.x, a.y);
        ctx.lineTo(b.x, b.y);
        ctx.stroke();
      }

      // bio source (left)
      ctx.fillStyle = C.green;
      ctx.shadowColor = C.green;
      ctx.shadowBlur = 16;
      ctx.beginPath();
      ctx.arc(root.x, root.y, 9, 0, Math.PI * 2);
      ctx.fill();
      ctx.shadowBlur = 0;
      ctx.fillStyle = C.muted;
      ctx.font = "10px monospace";
      ctx.fillText("BIO", root.x - 10, root.y + 24);

      // machine leaves (right, chips)
      for (const lf of leaves) {
        ctx.fillStyle = hexA(C.blue, 0.85);
        ctx.strokeStyle = C.blue;
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.rect(lf.x - 7, lf.y - 7, 14, 14);
        ctx.fill();
        ctx.stroke();
      }
      ctx.fillStyle = C.muted;
      ctx.fillText("MACHINE", w * 0.82, h * 0.06 + 10);

      // spawn packets
      spawnAcc += rate * 0.05;
      while (spawnAcc >= 1 && paths.length > 0) {
        spawnAcc -= 1;
        const p = paths[Math.floor(Math.random() * paths.length)];
        pkts.push({ path: p, seg: 0, f: 0 });
      }

      // advance + draw packets
      const alive: Pkt[] = [];
      for (const pk of pkts) {
        pk.f += speed * 0.02;
        while (pk.f >= 1 && pk.seg < pk.path.length - 1) {
          pk.f -= 1;
          pk.seg++;
        }
        if (pk.seg >= pk.path.length - 1) {
          arrived++;
          continue;
        }
        const a = pk.path[pk.seg], b = pk.path[pk.seg + 1];
        const x = a.x + (b.x - a.x) * pk.f;
        const y = a.y + (b.y - a.y) * pk.f;
        ctx.fillStyle = C.gold;
        ctx.shadowColor = C.gold;
        ctx.shadowBlur = 10;
        ctx.beginPath();
        ctx.arc(x, y, 3.4, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;
        alive.push(pk);
      }
      pkts = alive;

      if (thrOut.current) thrOut.current.textContent = `${(rate * speed * leaves.length).toFixed(1)} /s`;
      if (actOut.current) actOut.current.textContent = `${pkts.length}`;
      if (totOut.current) totOut.current.textContent = `${arrived}`;

      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, []);

  return (
    <div>
      <canvas ref={cvRef} style={{ width: "100%", height: 300, display: "block", borderRadius: 10, border: `1px solid ${C.border}` }} />
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(150px,1fr))", gap: 10, marginTop: 12 }}>
        <Slider label="Signal rate" min={0.1} max={2} step={0.05} def={0.5} onChange={(v) => (rateRef.current = v)} />
        <Slider label="Conduction speed" min={0.3} max={3} step={0.05} def={1.0} onChange={(v) => (speedRef.current = v)} />
        <Slider label="Branching" min={2} max={5} step={1} def={3} onChange={(v) => (branchRef.current = v)} />
      </div>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 16, marginTop: 12 }}>
        <Readout label="Throughput" refEl={thrOut} accent={C.gold} />
        <Readout label="Active packets" refEl={actOut} accent={C.cyan} />
        <Readout label="Delivered" refEl={totOut} accent={C.green} />
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

export default function BioMagneticConvergencePage() {
  return (
    <div style={{ minHeight: "100vh", background: C.bg, color: C.text, padding: "40px 22px 80px", fontFamily: "'Inter',system-ui,sans-serif" }}>
      <div style={{ maxWidth: 980, margin: "0 auto" }}>
        <div style={{ marginBottom: 8, fontFamily: "monospace", fontSize: 11, color: C.muted, letterSpacing: 2, textTransform: "uppercase" }}>
          AETHER · Substrate · Bio-Magnetic Convergence
        </div>
        <h1 style={{ fontSize: 34, margin: "0 0 10px", fontWeight: 700, background: `linear-gradient(90deg,${C.cyan},${C.violet},${C.gold})`, WebkitBackgroundClip: "text", backgroundClip: "text", color: "transparent" }}>
          Bio-Magnetic Technology Convergence
        </h1>
        <p style={{ color: C.muted, fontSize: 15, lineHeight: 1.7, maxWidth: 780, margin: "0 0 20px" }}>
          Where biology, magnetism, and medicine meet on a single field. A resonant coil reads a body, a mycelial network carries a signal, a vehicle is grown rather than built, and the planet hums underneath it all — four substrates sharing one coherence field. This page grounds the dream in real magnetic-resonance physics: Larmor precession, T₁/T₂ relaxation, and the synchronization of living networks.
        </p>
        <p style={{ color: hexA(C.gold, 0.85), fontSize: 12, lineHeight: 1.6, maxWidth: 780, margin: "0 0 24px", fontStyle: "italic" }}>
          Note · the simulations are faithful to their stated equations, but the fuller vision — grown vehicles, planetary healing — is a speculative AETHER synthesis. Clinically, magnetic medicine today means imaging (MRI) and stimulation (TMS · PEMF); the rest is horizon, not product.
        </p>

        {/* hero motion */}
        <figure style={{ margin: "0 0 30px", borderRadius: 14, overflow: "hidden", border: `1px solid ${C.border}`, background: "#000" }}>
          <video
            src={vidHero}
            autoPlay
            muted
            loop
            playsInline
            preload="metadata"
            style={{ width: "100%", display: "block" }}
          />
          <figcaption style={{ fontSize: 11, color: "#8ea6c4", padding: "10px 12px", background: C.panel2 }}>
            Convergence field · living resonance in motion.
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

        <Section n="I" title="Bio-Magnetic Coupling · a living web entrains to a field" sub="A network of biological oscillators (neurons, cells, hyphal segments) pulled together by internal coupling K and driven by an external magnetic field of strength B at frequency Ω. Watch the order parameter r climb toward 1 as the field entrains the population — coherence made visible.">
          <CouplingCanvas />
        </Section>

        <Section n="II" title="Resonant Coil · Larmor precession & relaxation" sub="The honest core of magnetic medicine. A coil rings the sample; every 4 seconds an RF pulse tips the spins into the transverse plane, where they precess at the Larmor frequency and dephase over T₂, while longitudinal magnetization recovers over T₁. Raise B₀ and the Larmor frequency scales at 42.58 MHz per tesla.">
          <CoilCanvas />
        </Section>

        <Section n="III" title="Mycelial Signal Propagation · biology to machine" sub="A branching fungal network carries packets from a living source on the left to machine nodes on the right — the pipeline where biological signal becomes device data. Fungal networks really do conduct electrical signals and reroute around damage; here they are the self-healing wire of the convergence.">
          <MycelialCanvas />
        </Section>

        <Section n="IV" title="The Convergence Atlas" sub="The source imagery that seeds this concept — machine, medicine, and living network repeatedly sharing one frame. Each plate maps an image to the mechanism it dramatizes.">
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(240px,1fr))", gap: 14 }}>
            {PLATES.map((p) => (
              <Plate key={p.cap} src={p.src} cap={p.cap} />
            ))}
          </div>
        </Section>

        <Section n="V" title="Motion Field" sub="Animated studies of the same convergence — field-entrained growth, resonant biomechanics, and mycelial signal flow. Press play on any panel.">
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(240px,1fr))", gap: 14 }}>
            {VIDEOS.map((v) => (
              <figure key={v.cap} style={{ margin: 0, background: C.panel2, border: `1px solid ${C.border}`, borderRadius: 12, overflow: "hidden" }}>
                <video src={v.src} controls muted loop playsInline preload="metadata" style={{ width: "100%", display: "block", background: "#000" }} />
                <figcaption style={{ fontSize: 10.5, color: "#8ea6c4", lineHeight: 1.5, padding: "9px 11px" }}>{v.cap}</figcaption>
              </figure>
            ))}
          </div>
        </Section>

        <Section n="VI" title="The Mathematics" sub="Eight relations that hold the convergence together — from the Larmor law that makes magnetic medicine possible to the AETHER coherence field that carries a single phase across all four substrates.">
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(280px,1fr))", gap: 12 }}>
            {MATH.map((m) => (
              <div key={m.eq} style={{ background: C.panel2, border: `1px solid ${C.border}`, borderRadius: 10, padding: "12px 14px" }}>
                <div style={{ fontFamily: "monospace", fontSize: 13.5, color: C.gold, marginBottom: 6 }}>{m.eq}</div>
                <div style={{ fontSize: 12.5, color: C.muted, lineHeight: 1.6 }}>{m.note}</div>
              </div>
            ))}
          </div>
        </Section>

        <Section n="VII" title="In Words" sub="The convergence stated plainly — what is real physics, what is honest speculation, and where the one runs into the other.">
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
          <Link href="/ultra-magnetism" style={{ color: C.blue, textDecoration: "none" }}>→ Ultra-Magnetism · SC</Link>
          <Link href="/regulatory-depth" style={{ color: C.green, textDecoration: "none" }}>→ Regulatory Depth · Biology</Link>
          <Link href="/" style={{ color: C.muted, textDecoration: "none" }}>→ Knowledge Graph</Link>
        </div>
      </div>
    </div>
  );
}
