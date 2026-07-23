/*═══════════════════════════════════════════════════════════════════
  Substrate Sandwich · Layered Life Potential
  How stacking substrates generates emergent organic coherence
  StarForge Black Box · Dense Water + Mirror · Helium-Water-Mirror
  3-6-9 Harmonics · φ-AETHER · Living Clock · Cytoplasm Tuning
═══════════════════════════════════════════════════════════════════*/
import { useRef, useEffect, useState } from "react";

const sandwichCube = "/api/storage/public-objects/IMG_4494_1784416489052.jpeg";
const deploymentImg = "/api/storage/public-objects/IMG_4495_1784416489052.jpeg";
const corningImg = "/api/storage/public-objects/IMG_4499_1784416489052.jpeg";
const magneticImg = "/api/storage/public-objects/IMG_4496_1784416489052.jpeg";
const cytoplasmImg = "/api/storage/public-objects/IMG_4487_1784416489052.png";
const livingClockImg = "/api/storage/public-objects/IMG_4485_1784416489052.png";
const dynTransImg = "/api/storage/public-objects/IMG_4489_1784416489052.png";
const phiAetherImg = "/api/storage/public-objects/BD89380E-EB70-480C-9A72-F65BCA1A3FFC_1784416547605.png";
const fractureImg = "/api/storage/public-objects/76747593-DBFD-4864-BFAA-77B3F99F9D70_1784416547605.png";
const denseWaterImg = "/api/storage/public-objects/C2B7568F-72DC-4DD7-9AFB-385136C3F224_1784416547605.png";
const heOxImg = "/api/storage/public-objects/816B918E-5D67-4582-B7A6-5F8538FE8933_1784416547605.png";
const hwmImg = "/api/storage/public-objects/D84C7F3C-A20A-4281-932D-37197BE96644_1784416547605.png";
const P = {
  bg: "#0b0906", panel: "#13100c", panel2: "#1a1510",
  gold: "#f5c84c", ivory: "#f4f1ea", dim: "rgba(244,241,234,0.5)",
  line: "rgba(245,200,76,0.12)", cyan: "#4fe8e8", purple: "#c084fc",
  blue: "#60a5fa", teal: "#2dd4bf", green: "#34d399",
};

function kx(k: string, v: React.CSSProperties): { [key: string]: React.CSSProperties } {
  return { [k]: v };
}

/* ── helper: section wrapper ── */
function Sec({ id, children }: { id?: string; children: React.ReactNode }) {
  return (
    <section id={id} style={{ borderTop: `1px solid ${P.line}`, padding: "52px 0" }}>
      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "0 32px" }}>
        {children}
      </div>
    </section>
  );
}

/* ── helper: image + description card ── */
function ImgCard({ src, alt, caption, desc, wide }: {
  src: string; alt: string; caption: string; desc: string; wide?: boolean;
}) {
  return (
    <div style={{ marginBottom: 36, maxWidth: wide ? "100%" : 780 }}>
      <img src={src} alt={alt} style={{ width: "100%", borderRadius: 12, border: `1px solid ${P.line}`, display: "block" }} />
      <div style={{ marginTop: 12, padding: "14px 18px", background: P.panel, borderRadius: 8, border: `1px solid ${P.line}` }}>
        <div style={{ fontSize: 11, fontWeight: 700, color: P.gold, letterSpacing: 1, textTransform: "uppercase", marginBottom: 6 }}>{caption}</div>
        <div style={{ fontSize: 13, color: P.dim, lineHeight: 1.75 }}>{desc}</div>
      </div>
    </div>
  );
}

/* ── helper: info card ── */
function Card({ title, body, color = P.gold }: { title: string; body: string; color?: string }) {
  return (
    <div style={{ padding: "16px 18px", background: P.panel, borderRadius: 10, border: `1px solid ${color}22` }}>
      <div style={{ fontSize: 11, fontWeight: 700, color, letterSpacing: 0.8, marginBottom: 7, textTransform: "uppercase" }}>{title}</div>
      <div style={{ fontSize: 13, color: P.dim, lineHeight: 1.7 }}>{body}</div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════
   CANVAS 1: Sandwich Resonator
   Stacked horizontal layers; photons bounce between mirrors,
   gaining phase from each medium; coherence meter builds.
═══════════════════════════════════════════════════════════ */
interface Photon {
  x: number; y: number; vy: number; phase: number; age: number;
}

function SandwichResonatorCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const layersRef = useRef(4);
  const freqRef   = useRef(6);
  const [layers, setLayersS] = useState(4);
  const [freq, setFreqS]     = useState(6);
  const coherenceRef = useRef(0);
  const [coherenceD, setCoherenceD] = useState(0);

  const LAYER_NAMES = ["Mirror", "Helium", "Dense Water", "Biological Substrate", "Magnetic Field", "Mirror"];
  const LAYER_COLORS = [
    "rgba(96,165,250,0.9)",  // mirror — blue
    "rgba(196,132,252,0.25)", // helium — purple
    "rgba(45,212,180,0.3)",  // dense water — teal
    "rgba(52,211,153,0.25)", // bio — green
    "rgba(245,200,76,0.2)",  // magnetic — gold
    "rgba(96,165,250,0.9)",  // mirror — blue
  ];

  useEffect(() => { layersRef.current = layers; }, [layers]);
  useEffect(() => { freqRef.current = freq; }, [freq]);

  useEffect(() => {
    const c = canvasRef.current;
    if (!c) return;
    const ctx = c.getContext("2d")!;
    let raf = 0;
    let t = 0;
    let photons: Photon[] = [];
    let coherence = 0;

    function resize() {
      c.width  = c.offsetWidth;
      c.height = c.offsetHeight;
    }
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(c);

    function spawnPhoton() {
      const W = c.width, H = c.height;
      photons.push({ x: 40 + Math.random() * (W - 80), y: H / 2, vy: (Math.random() > 0.5 ? 1 : -1) * (1.5 + Math.random()), phase: 0, age: 0 });
    }
    for (let i = 0; i < 12; i++) spawnPhoton();

    function draw() {
      const W = c.width, H = c.height;
      const nL = layersRef.current;
      ctx.clearRect(0, 0, W, H);

      // background
      ctx.fillStyle = "#0b0906";
      ctx.fillRect(0, 0, W, H);

      // draw sandwich layers
      const totalLayers = nL + 2; // +2 mirrors top/bottom
      const layerH = H / totalLayers;

      for (let i = 0; i < totalLayers; i++) {
        const y0 = i * layerH;
        const col = LAYER_COLORS[Math.min(i, LAYER_COLORS.length - 1)];
        ctx.fillStyle = col;
        ctx.fillRect(0, y0, W, layerH);

        // label
        const name = LAYER_NAMES[Math.min(i, LAYER_NAMES.length - 1)];
        ctx.fillStyle = "rgba(244,241,234,0.45)";
        ctx.font = "10px monospace";
        ctx.fillText(name, 8, y0 + layerH / 2 + 4);

        // boundary line
        if (i > 0) {
          ctx.strokeStyle = "rgba(245,200,76,0.3)";
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.moveTo(0, y0);
          ctx.lineTo(W, y0);
          ctx.stroke();
        }
      }

      // standing wave overlay (3-6-9)
      const fm = freqRef.current;
      ctx.strokeStyle = `rgba(245,200,76,0.25)`;
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      for (let x = 0; x <= W; x += 2) {
        const y = H / 2 + Math.sin((x / W) * Math.PI * fm + t * 0.02) * (H * 0.08);
        x === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
      }
      ctx.stroke();

      // photons
      photons.forEach(p => {
        p.y += p.vy;
        p.age++;
        p.phase += 0.05;

        // bounce off mirrors
        if (p.y < layerH) { p.vy = Math.abs(p.vy); p.phase += Math.PI / fm; }
        if (p.y > H - layerH) { p.vy = -Math.abs(p.vy); p.phase += Math.PI / fm; }

        // glow
        const glow = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, 6);
        glow.addColorStop(0, `rgba(79,232,232,${0.8 + 0.2 * Math.sin(p.phase)})`);
        glow.addColorStop(1, "transparent");
        ctx.fillStyle = glow;
        ctx.beginPath();
        ctx.arc(p.x, p.y, 6, 0, Math.PI * 2);
        ctx.fill();

        // trail
        ctx.strokeStyle = `rgba(79,232,232,0.15)`;
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(p.x, p.y);
        ctx.lineTo(p.x, p.y - p.vy * 8);
        ctx.stroke();
      });

      // spawn new photons periodically
      if (t % 40 === 0 && photons.length < 24) spawnPhoton();
      // prune old
      photons = photons.filter(p => p.age < 600);

      // coherence: grows with more layers and 3-6-9 resonance
      const target = ((nL / 5) * 0.6 + (fm % 9 === 0 || fm === 3 || fm === 6 ? 0.4 : 0.15));
      coherence += (target - coherence) * 0.005;
      coherenceRef.current = coherence;
      if (t % 20 === 0) setCoherenceD(Math.round(coherence * 100));

      // coherence bar
      const barW = Math.min(W - 120, 300);
      const barX = W - barW - 10;
      ctx.fillStyle = "rgba(11,9,6,0.7)";
      ctx.fillRect(barX - 4, 8, barW + 8, 18);
      ctx.fillStyle = `rgba(245,200,76,${0.4 + coherence * 0.6})`;
      ctx.fillRect(barX, 12, barW * coherence, 10);
      ctx.fillStyle = P.ivory;
      ctx.font = "9px monospace";
      ctx.fillText(`ORGANIC POTENTIAL ${Math.round(coherence * 100)}%`, barX, 9);

      t++;
      raf = requestAnimationFrame(draw);
    }
    draw();
    return () => { cancelAnimationFrame(raf); ro.disconnect(); };
  }, []);

  return (
    <div style={{ border: `1px solid ${P.line}`, borderRadius: 12, overflow: "hidden", marginBottom: 32 }}>
      <canvas ref={canvasRef} style={{ width: "100%", height: 340, display: "block" }} />
      <div style={{ padding: "12px 16px", background: P.panel, display: "flex", gap: 24, flexWrap: "wrap", alignItems: "center" }}>
        <div>
          <div style={{ fontSize: 10, color: P.dim, marginBottom: 4 }}>SUBSTRATE LAYERS · {layers}</div>
          <input type="range" min={1} max={4} value={layers} onChange={e => setLayersS(+e.target.value)} style={{ width: 120 }} />
        </div>
        <div>
          <div style={{ fontSize: 10, color: P.dim, marginBottom: 4 }}>HARMONIC MODE · {freq} {freq === 3 ? "· root 3" : freq === 6 ? "· root 6" : freq === 9 ? "· root 9" : ""}</div>
          <input type="range" min={1} max={9} value={freq} onChange={e => setFreqS(+e.target.value)} style={{ width: 120 }} />
        </div>
        <div style={{ fontSize: 11, color: P.gold }}>Organic Potential · <span style={{ fontWeight: 700 }}>{coherenceD}%</span></div>
        <div style={{ fontSize: 10, color: P.dim, marginLeft: "auto" }}>
          {freq % 9 === 0 || freq === 3 || freq === 6 ? "✦ 3-6-9 resonance active" : "◇ non-resonant mode"}
        </div>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════
   CANVAS 2: Magnetic Field Coupling Between Layers
   Two water plates; dipole field lines bridging them.
═══════════════════════════════════════════════════════════ */
function MagneticCouplingCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const strengthRef = useRef(0.7);
  const [strength, setStrengthS] = useState(0.7);

  useEffect(() => { strengthRef.current = strength; }, [strength]);

  useEffect(() => {
    const c = canvasRef.current;
    if (!c) return;
    const ctx = c.getContext("2d")!;
    let raf = 0, t = 0;

    function resize() { c.width = c.offsetWidth; c.height = c.offsetHeight; }
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(c);

    function draw() {
      const W = c.width, H = c.height;
      ctx.clearRect(0, 0, W, H);
      ctx.fillStyle = "#0b0906";
      ctx.fillRect(0, 0, W, H);

      const str = strengthRef.current;
      const layerH = 28;
      const midY = H / 2;
      const topPlate  = midY - 80;
      const botPlate  = midY + 80;

      // top water plate
      const g1 = ctx.createLinearGradient(0, topPlate - layerH, 0, topPlate);
      g1.addColorStop(0, "rgba(45,212,180,0.15)");
      g1.addColorStop(1, "rgba(45,212,180,0.45)");
      ctx.fillStyle = g1;
      ctx.fillRect(0, topPlate - layerH, W, layerH);
      ctx.fillStyle = "rgba(244,241,234,0.4)";
      ctx.font = "10px monospace";
      ctx.fillText("DENSE WATER PLATE — TOP", 10, topPlate - 10);

      // bottom water plate
      const g2 = ctx.createLinearGradient(0, botPlate, 0, botPlate + layerH);
      g2.addColorStop(0, "rgba(45,212,180,0.45)");
      g2.addColorStop(1, "rgba(45,212,180,0.15)");
      ctx.fillStyle = g2;
      ctx.fillRect(0, botPlate, W, layerH);
      ctx.fillStyle = "rgba(244,241,234,0.4)";
      ctx.font = "10px monospace";
      ctx.fillText("DENSE WATER PLATE — BOTTOM", 10, botPlate + 20);

      // helium/bio region
      ctx.fillStyle = "rgba(196,132,252,0.07)";
      ctx.fillRect(0, topPlate, W, botPlate - topPlate);

      // dipole field lines
      const cx = W / 2;
      const numLines = 8;
      for (let i = 0; i < numLines; i++) {
        const angle = (i / numLines) * Math.PI;
        const spread = 0.6 + str * 0.4;

        ctx.strokeStyle = `rgba(196,132,252,${0.3 + str * 0.4})`;
        ctx.lineWidth = 1.2;
        ctx.beginPath();

        const steps = 60;
        for (let s = 0; s <= steps; s++) {
          const pct = s / steps;
          const theta = Math.PI * pct;
          const r = spread * (botPlate - topPlate) / 2 * Math.sin(angle);
          const lx = cx + r * Math.cos(theta + angle + t * 0.01);
          const ly = (topPlate + botPlate) / 2 + (botPlate - topPlate) / 2 * Math.cos(theta);
          s === 0 ? ctx.moveTo(lx, ly) : ctx.lineTo(lx, ly);
        }
        ctx.stroke();
      }

      // pulsing nodes at poles
      const pulse = 0.7 + 0.3 * Math.sin(t * 0.04);
      [topPlate, botPlate].forEach(y => {
        const grd = ctx.createRadialGradient(cx, y, 0, cx, y, 22 * pulse);
        grd.addColorStop(0, "rgba(196,132,252,0.9)");
        grd.addColorStop(1, "transparent");
        ctx.fillStyle = grd;
        ctx.beginPath();
        ctx.arc(cx, y, 22 * pulse, 0, Math.PI * 2);
        ctx.fill();
      });

      // particles drifting along field lines
      const particleCount = Math.floor(6 + str * 8);
      for (let i = 0; i < particleCount; i++) {
        const phase = (t * 0.015 + i / particleCount * Math.PI * 2) % (Math.PI * 2);
        const r = (0.2 + 0.6 * (i / particleCount)) * (botPlate - topPlate) / 2;
        const px = cx + r * Math.cos(phase + i);
        const py = (topPlate + botPlate) / 2 + (botPlate - topPlate) / 2 * 0.8 * Math.sin(phase);
        ctx.fillStyle = `rgba(79,232,232,${0.5 + 0.3 * Math.sin(phase)})`;
        ctx.beginPath();
        ctx.arc(px, py, 2.5, 0, Math.PI * 2);
        ctx.fill();
      }

      // field strength readout
      ctx.fillStyle = "rgba(11,9,6,0.7)";
      ctx.fillRect(8, 8, 180, 18);
      ctx.fillStyle = P.gold;
      ctx.font = "10px monospace";
      ctx.fillText(`COUPLING STRENGTH  ${Math.round(str * 100)}%`, 12, 20);

      t++;
      raf = requestAnimationFrame(draw);
    }
    draw();
    return () => { cancelAnimationFrame(raf); ro.disconnect(); };
  }, []);

  return (
    <div style={{ border: `1px solid ${P.line}`, borderRadius: 12, overflow: "hidden", marginBottom: 32 }}>
      <canvas ref={canvasRef} style={{ width: "100%", height: 280, display: "block" }} />
      <div style={{ padding: "10px 16px", background: P.panel, display: "flex", gap: 20, alignItems: "center" }}>
        <div>
          <div style={{ fontSize: 10, color: P.dim, marginBottom: 4 }}>FIELD COUPLING STRENGTH</div>
          <input type="range" min={0} max={1} step={0.05} value={strength} onChange={e => setStrengthS(+e.target.value)} style={{ width: 140 }} />
        </div>
        <div style={{ fontSize: 11, color: P.purple }}>Dipole field bridging the sandwich gap — coupling increases organic transfer rate</div>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════
   CANVAS 3: 3-6-9 Standing Wave Cavity
   Digital root 9 harmonic; cavity tuned to 3, 6, or 9 mode.
═══════════════════════════════════════════════════════════ */
function ThreeSixNineCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const modeRef   = useRef<3 | 6 | 9>(6);
  const [mode, setModeS] = useState<3 | 6 | 9>(6);
  const [resonating, setResonating] = useState(false);

  useEffect(() => { modeRef.current = mode; }, [mode]);

  useEffect(() => {
    const c = canvasRef.current;
    if (!c) return;
    const ctx = c.getContext("2d")!;
    let raf = 0, t = 0, energy = 0;

    function resize() { c.width = c.offsetWidth; c.height = c.offsetHeight; }
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(c);

    function draw() {
      const W = c.width, H = c.height;
      ctx.clearRect(0, 0, W, H);
      ctx.fillStyle = "#0b0906";
      ctx.fillRect(0, 0, W, H);

      const m = modeRef.current;
      const isRes = [3, 6, 9].includes(m);
      energy += isRes ? 0.008 : -0.005;
      energy = Math.max(0, Math.min(1, energy));
      if (t % 10 === 0) setResonating(isRes);

      // cavity walls
      ctx.strokeStyle = `rgba(96,165,250,0.7)`;
      ctx.lineWidth = 3;
      ctx.strokeRect(40, 30, W - 80, H - 60);

      // standing waves — multiple harmonics
      const colors = ["rgba(79,232,232,0.8)", "rgba(196,132,252,0.6)", "rgba(245,200,76,0.5)"];
      for (let h = 0; h < 3; h++) {
        ctx.strokeStyle = colors[h];
        ctx.lineWidth = 1.2 + h * 0.3;
        ctx.beginPath();
        const harmonic = m * (h + 1);
        for (let x = 40; x <= W - 40; x += 2) {
          const frac = (x - 40) / (W - 80);
          const amp = (H - 60) * 0.15 * (1 - h * 0.25) * (energy + 0.1);
          const y = H / 2 + amp * Math.sin(frac * Math.PI * harmonic) * Math.cos(t * 0.02 * (h + 1));
          x === 40 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
        }
        ctx.stroke();
      }

      // node points (zero crossings = topological nodes)
      for (let node = 0; node <= m; node++) {
        const nx = 40 + (W - 80) * (node / m);
        const nr = 3 + 2 * energy;
        const ng = ctx.createRadialGradient(nx, H / 2, 0, nx, H / 2, nr * 3);
        ng.addColorStop(0, `rgba(245,200,76,${0.9 * energy})`);
        ng.addColorStop(1, "transparent");
        ctx.fillStyle = ng;
        ctx.beginPath();
        ctx.arc(nx, H / 2, nr * 3, 0, Math.PI * 2);
        ctx.fill();
      }

      // digital root label
      const dr = (m % 9 === 0 ? 9 : m % 9);
      ctx.fillStyle = "rgba(11,9,6,0.75)";
      ctx.fillRect(W - 180, 34, 168, 60);
      ctx.fillStyle = P.gold;
      ctx.font = "bold 22px monospace";
      ctx.fillText(`MODE ${m}`, W - 170, 58);
      ctx.font = "11px monospace";
      ctx.fillStyle = P.dim;
      ctx.fillText(`Digital Root = ${dr}`, W - 170, 76);
      ctx.fillText(isRes ? "✦ 3-6-9 RESONANT" : "◇ non-resonant", W - 170, 90);

      // energy bar
      ctx.fillStyle = "rgba(11,9,6,0.7)";
      ctx.fillRect(44, 34, 200, 14);
      const barCol = isRes ? P.gold : P.dim;
      ctx.fillStyle = barCol;
      ctx.fillRect(44, 36, 196 * energy, 10);
      ctx.fillStyle = P.ivory;
      ctx.font = "9px monospace";
      ctx.fillText(`RESONANT ENERGY ${Math.round(energy * 100)}%`, 46, 46);

      t++;
      raf = requestAnimationFrame(draw);
    }
    draw();
    return () => { cancelAnimationFrame(raf); ro.disconnect(); };
  }, []);

  return (
    <div style={{ border: `1px solid ${P.line}`, borderRadius: 12, overflow: "hidden", marginBottom: 32 }}>
      <canvas ref={canvasRef} style={{ width: "100%", height: 260, display: "block" }} />
      <div style={{ padding: "10px 16px", background: P.panel, display: "flex", gap: 12, alignItems: "center", flexWrap: "wrap" }}>
        <div style={{ fontSize: 10, color: P.dim }}>HARMONIC MODE:</div>
        {([3, 6, 9, 1, 4, 7, 12] as const).map(m => (
          <button
            key={m}
            onClick={() => setModeS(m as 3 | 6 | 9)}
            style={{ padding: "4px 14px", borderRadius: 6, border: `1px solid ${mode === m ? P.gold : P.line}`, background: mode === m ? P.gold + "22" : "transparent", color: mode === m ? P.gold : P.dim, fontSize: 12, cursor: "pointer" }}
          >
            {m}
          </button>
        ))}
        <div style={{ marginLeft: "auto", fontSize: 11, color: resonating ? P.gold : P.dim }}>
          {resonating ? "✦ Tesla 3-6-9 resonance — peak coherence" : "◇ shift to 3, 6, or 9 for resonance"}
        </div>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════
   MAIN PAGE
═══════════════════════════════════════════════════════════ */
export default function SubstrateSandwichPage() {

  const layerDefs = [
    { label: "Mirror (Corning Glass)", color: P.blue,   desc: "High-reflectivity optical surface · contains light · enables standing waves · R > 99.99%" },
    { label: "Helium Chamber",         color: P.purple,  desc: "Chemically inert · 7× less dense than air · thermal damping isolation · acoustic resonance" },
    { label: "Dense Water Plate",      color: P.teal,    desc: "n ≈ 1.33–1.45 · structured/compressed · tunes phase velocity · wet curved light coupling" },
    { label: "Biological Substrate",   color: P.green,   desc: "Cytoplasm/tissue/organism · 3-6-9 ordered · coherent antenna medium · information receiver" },
    { label: "Dense Water Plate",      color: P.teal,    desc: "Mirrored bottom water plate · reflects bio-information back upward · maintains resonance loop" },
    { label: "Mirror (Corning Glass)", color: P.blue,   desc: "Bottom mirror · completes the closed optical-acoustic cavity · vertical mode support" },
  ];

  return (
    <div style={{ background: P.bg, color: P.ivory, minHeight: "100vh", fontFamily: "inherit" }}>

      {/* ── HERO ── */}
      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "52px 32px 36px" }}>
        <div style={{ fontSize: 11, color: P.gold, letterSpacing: 2, textTransform: "uppercase", marginBottom: 10 }}>StarForge Black Box · Substrate Synthesis</div>
        <h1 style={{ fontSize: 36, fontWeight: 800, color: P.gold, lineHeight: 1.15, marginBottom: 14, letterSpacing: -0.5 }}>
          Substrate Sandwich<br />
          <span style={{ fontWeight: 300, color: P.ivory }}>Layered Life Potential</span>
        </h1>
        <p style={{ fontSize: 16, color: P.dim, lineHeight: 1.85, maxWidth: 720, marginBottom: 28 }}>
          When substrates stack — mirror, helium, dense water, biological tissue, magnetic field — something remarkable emerges at every boundary. Each interface is a phase gate, a coherence amplifier, a computation surface. The sandwich does not merely contain life: it generates it. This is the architecture of the StarForge Black Box, the Living Clock, and every self-replicating natural system from a cell to a star.
        </p>

        {/* Layer stack diagram */}
        <div style={{ display: "flex", flexDirection: "column", gap: 4, maxWidth: 700, marginBottom: 36 }}>
          {layerDefs.map((l, i) => (
            <div key={i} style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 16px", borderRadius: 8, background: P.panel, borderLeft: `3px solid ${l.color}` }}>
              <div style={{ width: 22, height: 22, borderRadius: "50%", background: l.color + "33", border: `1.5px solid ${l.color}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10, color: l.color, flexShrink: 0 }}>
                {i + 1}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 12, fontWeight: 700, color: l.color, marginBottom: 2 }}>{l.label}</div>
                <div style={{ fontSize: 11, color: P.dim }}>{l.desc}</div>
              </div>
            </div>
          ))}
          <div style={{ textAlign: "center", padding: "8px", fontSize: 11, color: P.gold, letterSpacing: 1 }}>
            ↕ COHERENCE EMERGES AT EVERY BOUNDARY ↕
          </div>
        </div>
      </div>

      {/* ── SECTION I: THE SANDWICH PRINCIPLE ── */}
      <Sec id="sandwich-principle">
        <div style={{ fontSize: 11, color: P.gold, letterSpacing: 2, textTransform: "uppercase", marginBottom: 8 }}>Section I</div>
        <h2 style={{ fontSize: 24, fontWeight: 700, color: P.gold, marginBottom: 16 }}>The Sandwich Principle</h2>
        <p style={{ fontSize: 14, color: P.dim, lineHeight: 1.85, maxWidth: 760, marginBottom: 28 }}>
          Organic potential is not a property of any single material — it is an emergent property of the interface between materials. When you place a dense medium between two reflective boundaries, something unavoidable happens: waves that enter the cavity cannot leave. They fold back, constructively interfere, and self-amplify. This is the universal template for life: a cell membrane is a sandwich (lipid-water-lipid). A neuron is a sandwich (myelin-axon-myelin). A planet is a sandwich (mantle-core-mantle). The StarForge Black Box formalizes this into an engineered resonant cavity.
        </p>

        <SandwichResonatorCanvas />

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(240px,1fr))", gap: 14, marginBottom: 32 }}>
          <Card title="Boundary Coherence" color={P.cyan}
            body="Every interface between two substrates is a site of constructive interference. Phase differences accumulate, then resolve into standing modes — stable energy configurations that don't dissipate." />
          <Card title="Organic Potential" color={P.green}
            body="'Organic potential' is the capacity of a layered system to generate self-sustaining patterns — oscillations that grow, replicate, and stabilize without external input." />
          <Card title="3-6-9 Tuning" color={P.gold}
            body="Tesla's insight: these numbers have a digital root of 9. Standing waves tuned to 3, 6, or 9 harmonics always return to a root-9 symmetry — the most stable resonant configuration in nature." />
          <Card title="Self-Replication" color={P.purple}
            body="Once coherence builds beyond threshold, the field pattern can imprint on adjacent matter — ordering it to match. This is how one crystal face induces another to crystallize: substrate-to-substrate coherence transfer." />
        </div>

        <ImgCard
          src={sandwichCube}
          alt="Layered substrate sandwich cube"
          caption="Figure 1 — The Substrate Sandwich Cube"
          desc="A glass-enclosed layered system showing two biological substrate tiers (coral-like biomatter, purple-orange DNA-strand nodules) flanking a central coherent light core. The core emits a burst of purple-cyan light that simultaneously reads both sandwich layers — top and bottom — and generates a new ordered state. The 3-6-9 numerical markers at the top indicate the harmonic tuning of the cavity. This is the visual essence of the sandwich principle: life sandwiched between coherence generates more life."
        />
      </Sec>

      {/* ── SECTION II: DENSE WATER + MIRROR ── */}
      <Sec id="dense-water-mirror">
        <div style={{ fontSize: 11, color: P.gold, letterSpacing: 2, textTransform: "uppercase", marginBottom: 8 }}>Section II</div>
        <h2 style={{ fontSize: 24, fontWeight: 700, color: P.gold, marginBottom: 16 }}>Dense Water Plate · The Tunable Bread</h2>
        <p style={{ fontSize: 14, color: P.dim, lineHeight: 1.85, maxWidth: 760, marginBottom: 28 }}>
          Ordinary water has a refractive index of ~1.33. Under high pressure (compressed/structured water), this rises to ~1.45 — enough to significantly slow light and bend its path. Placed between two high-reflectivity mirrors, this dense water plate becomes the "bread" of the sandwich: it tunes the effective optical path length of the cavity, shifts the resonant frequencies, and supports both acoustic and optical standing wave modes simultaneously. The cavity equation 2Ln_eff = mλ means every change in water density directly shifts which light frequencies are trapped and amplified.
        </p>

        <ImgCard
          src={denseWaterImg}
          alt="Dense Water Plate + Mirror Resonator"
          caption="Figure 2 — Dense Water Plate + Mirror Resonator Architecture"
          wide
          desc="The complete resonator architecture: high-reflectivity mirrors (R > 99.99%) form the top and bottom of the cavity. The dense water plate sits at the top, acting as a tunable refractive medium. Light enters, reflects between mirrors, and its phase velocity is modulated by the water density each pass. Resonance condition: 2Ln_eff = mλ (vertical) and 2Wn_eff = nλ (horizontal). Quality factor Q and mode volume V determine energy density U ∝ Q/V. As Q rises and V shrinks, U becomes extraordinary — enough to generate novel quantum states at the boundary layers."
        />

        <ImgCard
          src={hwmImg}
          alt="Helium-Water-Mirror Resonant System"
          caption="Figure 3 — Helium-Water-Mirror Resonant System · Full Architecture"
          wide
          desc="The complete multiphysics platform: optical resonance (photons reflecting between mirrors), acoustic resonance (pressure waves in helium and water), thermal management (helium 7× less dense than air, excellent heat conductor), and magnetic field coupling (coils carving stable pools in the helium chamber). The dense water plate interfaces with all three — it tunes optical phase, conducts acoustic waves, and provides a stable boundary for magnetic field lines. Together these create a coherent multi-physics environment where each layer informs every other."
        />
      </Sec>

      {/* ── SECTION III: STARFORGE BLACK BOX ── */}
      <Sec id="starforge">
        <div style={{ fontSize: 11, color: P.gold, letterSpacing: 2, textTransform: "uppercase", marginBottom: 8 }}>Section III</div>
        <h2 style={{ fontSize: 24, fontWeight: 700, color: P.gold, marginBottom: 16 }}>StarForge Black Box · The Sealed Engine</h2>
        <p style={{ fontSize: 14, color: P.dim, lineHeight: 1.85, maxWidth: 760, marginBottom: 28 }}>
          The StarForge Black Box is a sealed, helium-water-mirror resonant cavity that functions as a self-replicating coherent energy-information multiplier. "Self-replicating" here means: once the internal coherent state is established, the system can imprint its pattern onto adjacent matter — ordering water, tuning biological frequencies, crystallizing substrate — without consuming the original pattern. It is a star in miniature: a sustained fusion of information layers that outputs more coherent structure than it receives as raw input.
        </p>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20, marginBottom: 32 }}>
          <ImgCard
            src={corningImg}
            alt="Corning Glass StarForge resonator"
            caption="Figure 4 — Corning Glass Resonator · Lab-Scale Prototype"
            desc="The physical StarForge: a Corning precision glass enclosure (chosen for its optical flatness, λ/20 surface quality, and thermal stability) holding the resonant cavity. Purple magnetic field coils wrap the exterior. Inside, intersecting laser beams and purple ionization trails mark the active coherent zones. Blue plasma aurora crowns the top — the system is operating above threshold. This is what organized substrate sandwich looks like in hardware."
          />
          <ImgCard
            src={heOxImg}
            alt="Helium-Oxygen Catalytic Resonator"
            caption="Figure 5 — Helium-Oxygen Catalytic Resonator System"
            desc="Adding oxygen (from PSA — Pressure Swing Adsorption, 90–95% purity) to the helium chamber enables plasma chemistry. Reactive species (O·, OH·, O₂·) form inside the cavity. These radicals are not just chemical — they are coherent quantum entities generated by the resonant field. The laser-matter interaction inside this cavity can trigger catalytic oxidation, plasma chemistry, and photodynamic effects simultaneously, making it viable for ocean remediation, agricultural enhancement, and medical photodynamic therapy."
          />
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(230px,1fr))", gap: 14 }}>
          <Card title="Topological Order Preservation" color={P.blue}
            body="The cavity's resonant modes are topologically protected — small perturbations don't destroy the pattern. This is quasi-ontological safety: the system's logical structure is preserved across scale changes and environmental noise." />
          <Card title="Sun-Venus Harmonics" color={P.gold}
            body="Tuned to the 584-day Venus synodic cycle and 819 K'awil fold: these cosmic periods provide the clock signal for the replication harmonic. 5 Venus = 8 solar years = digital root 9 — perfect resonant lock." />
          <Card title="Multi-Environment Deployment" color={P.green}
            body="Same architecture scales: ocean (salt-water dense-plate version), human bio-chamber (body as the biological sandwich layer), animal multiplication (field imprinting on livestock health cycles)." />
          <Card title="Corning Glass Precision" color={P.cyan}
            body="λ/20 optical flatness — mirrors flat to within 30 nanometers across the full aperture. This maintains mode purity across thousands of round trips, enabling Q-factors high enough to reach exotic quantum states." />
        </div>
      </Sec>

      {/* ── SECTION IV: MAGNETIC COUPLING ── */}
      <Sec id="magnetic-coupling">
        <div style={{ fontSize: 11, color: P.gold, letterSpacing: 2, textTransform: "uppercase", marginBottom: 8 }}>Section IV</div>
        <h2 style={{ fontSize: 24, fontWeight: 700, color: P.gold, marginBottom: 16 }}>Magnetic Field Coupling · The Invisible Glue</h2>
        <p style={{ fontSize: 14, color: P.dim, lineHeight: 1.85, maxWidth: 760, marginBottom: 28 }}>
          Between the two dense water plates runs a dipole magnetic field — the "invisible glue" of the sandwich. Magnetic field lines are not constrained by chemistry; they flow freely through helium, water, glass, and biological tissue. Coils outside the cavity carve stable "pools" in the resting water — regions of locally elevated field that anchor resonant modes in specific spatial locations. Polyhedral nodes (hovering on magnetic pressure) define the topological queue of the coherent computation. Each node is a memory location in the substrate computer.
        </p>

        <MagneticCouplingCanvas />

        <ImgCard
          src={magneticImg}
          alt="Magnetic field lines between sandwich layers"
          caption="Figure 6 — Magnetic Field Coupling Between Sandwich Layers"
          wide
          desc="Two luminous water plate layers (cyan-teal surface ripples) with purple magnetic field lines flowing between them in a toroidal/dipole configuration. The field lines gather at the interface boundaries, concentrate at the center, and fan outward — exactly like a solenoid or MRI magnet geometry scaled to the substrate layer. The electronic substrate layer at bottom shows the computed field pattern as interference fringes. This field coupling is what transforms a passive stack of materials into an active, communicating sandwich: information flows along field lines from layer to layer."
        />
      </Sec>

      {/* ── SECTION V: BIOLOGICAL SANDWICH ── */}
      <Sec id="biological-sandwich">
        <div style={{ fontSize: 11, color: P.gold, letterSpacing: 2, textTransform: "uppercase", marginBottom: 8 }}>Section V</div>
        <h2 style={{ fontSize: 24, fontWeight: 700, color: P.gold, marginBottom: 16 }}>Biological Sandwich · Cytoplasm as the Tuned Medium</h2>
        <p style={{ fontSize: 14, color: P.dim, lineHeight: 1.85, maxWidth: 760, marginBottom: 28 }}>
          The human body is itself a substrate sandwich. Cytoplasm — the fluid interior of every cell — is structured water. It is not random liquid; it is ordered by ion gradients, protein scaffolds, and electromagnetic fields into a responsive medium with a refractive index profile, acoustic propagation characteristics, and magnetic susceptibility. When solar irradiance drives the retinal ipRGC → pineal melatonin → hormonal cascade → cellular water pathway, light is literally restructuring the sandwich medium inside every cell. The 3-6-9 neural code modulates this restructuring at the frequency of the Venus cycle, menstrual cycle, and circadian clock simultaneously.
        </p>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20, marginBottom: 28 }}>
          <ImgCard
            src={cytoplasmImg}
            alt="Cytoplasm ordering — the tuned medium"
            caption="Figure 7 — Cytoplasm Ordering · Step V: The Tuned Medium"
            desc="The cellular interior shown as a structured water lattice (hexagonal network, gold-cyan nodes). LH/FSH hormone signals drive structural ordering of cytoplasm water. The 3-6-9 neural code (frequency modulated) sets the ordering frequency. Venus 584 near-harmonics with menstrual (28d) and gestation periods phase-lock the body's sandwich to cosmic rhythms. Women as topological bridge: T_human ≈ 28×ℓ ≈ 260×p ≈ 1080×q×3^k — the body is a living resonant equation."
          />
          <ImgCard
            src={livingClockImg}
            alt="The Living Clock — harmonic concordance"
            caption="Figure 8 — The Living Clock · Harmonic Concordance of Human & Cosmic Rhythms"
            desc="The complete harmonic map: 819 K'awil (the Great Folded Number — all 5 visible planets fold into multiples of 819), Venus 584-day synodic cycle, 1080 (digital root 9, base-3 Tun harmonic), 2920-day Great Cycle (5 Venus = 8 solar years). The wet-curved-light mechanism: solar irradiance → retinal ipRGC → pineal melatonin → hormonal cascade → cellular water ordering → field coupling. This 6-step pathway is the photonic sandwich in the body: light enters at one mirror (retina), traverses the dense water medium (cytoplasm), and exits as ordered biological information."
          />
        </div>
      </Sec>

      {/* ── SECTION VI: DYNAMICAL TRANSITION ── */}
      <Sec id="dynamical-transition">
        <div style={{ fontSize: 11, color: P.gold, letterSpacing: 2, textTransform: "uppercase", marginBottom: 8 }}>Section VI</div>
        <h2 style={{ fontSize: 24, fontWeight: 700, color: P.gold, marginBottom: 16 }}>Dynamical Transition · Minimal Order to Perfect Symmetry</h2>
        <p style={{ fontSize: 14, color: P.dim, lineHeight: 1.85, maxWidth: 760, marginBottom: 28 }}>
          The sandwich does not start coherent. It begins in minimal order — high entropy, chaotic particle arrangement. What drives the transition from chaos to perfect symmetry? The trivial coherent line L: a single thread of phase-locked oscillation that, once established, recruits adjacent particles through resonant coupling. This is the 3-6-9 digital root 9 queue: each particle that locks adds to the field, which makes it easier for the next particle to lock. The process accelerates exponentially near threshold — the system crystallizes all at once. Cytoplasm ordering works identically: one coherent protein scaffold recruits the next, until the cell interior snaps into a tuned medium.
        </p>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20, marginBottom: 28 }}>
          <ImgCard
            src={dynTransImg}
            alt="Dynamical Transition: Minimal Order to Perfect Symmetry"
            caption="Figure 9 — Dynamical Transition: Minimal Order → Perfect Symmetry"
            desc="Left: minimal order phase — chaotic random particle trajectories (high entropy, low coherence). Center: the trivial coherent line L — a single straight thread of phase-locked particles. Right: perfectly symmetrical geometry — the substrate has crystallized. The Digital Root 9 queue (3-6-9 → 9 → 9 → … ) is the engine: each coherence event has digital root 9, so the chain never loses its resonant identity. The body shape in the center shows this transition happening at biological scale — the coherent electromagnetic field of the body is the 'perfect symmetry' state of its cellular sandwich."
          />
          <ImgCard
            src={fractureImg}
            alt="Coherent state fractures at threshold speed"
            caption="Figure 10 — Coherent State Fracture · Threshold Crossing → Pair Formation"
            desc="At a critical speed v_critical, the coherent sandwich state fractures and slips into correlated pairs. Coherence C drops rapidly, symmetry breaks, and the system splits into two entangled states (Pair A: phase +φ, Pair B: phase −φ). Energy(A) + Energy(B) = Constant — conservation is preserved. This is not failure; it is reproduction. The sandwich has generated a child sandwich. Real-world analogues: fluid vortex shedding (Reynolds threshold), plasma current sheet rupture (magnetic reconnection), and — speculatively — neural oscillation splitting into anti-phase pairs."
          />
        </div>
      </Sec>

      {/* ── SECTION VII: φ-AETHER SUBSTRATE COMPUTER ── */}
      <Sec id="phi-aether">
        <div style={{ fontSize: 11, color: P.gold, letterSpacing: 2, textTransform: "uppercase", marginBottom: 8 }}>Section VII</div>
        <h2 style={{ fontSize: 24, fontWeight: 700, color: P.gold, marginBottom: 16 }}>φ-AETHER Substrate Computer · Where Physics, Information, and Life Compute as One</h2>
        <p style={{ fontSize: 14, color: P.dim, lineHeight: 1.85, maxWidth: 760, marginBottom: 28 }}>
          The substrate sandwich is not just a physical structure — it is a computing architecture. The φ-AETHER Substrate Computer formalizes this: a Spinor Encoding Layer (rotating spinor basis, 4 orthogonal channels: +H, -H, +V, -V) feeds into a Multi-Scale Oscillation Stack (gamma/beta/alpha/theta/delta bands). This stack is processed through a Permutation Entropy Engine (2,6 permutation, delay τ=2, dimension m=6, all 720 possible ordinal patterns). The result is a Coherence State Map — a live picture of which frequencies are phase-locked across the substrate stack. The φ principle: Coherence through Scale, Information through Entropy, Intelligence through Integration.
        </p>

        <ImgCard
          src={phiAetherImg}
          alt="φ-AETHER Substrate Computer architecture"
          caption="Figure 11 — φ-AETHER Substrate Computer · Full Architecture"
          wide
          desc="The complete substrate computing architecture. Spinor encoding (4-channel orthogonal basis Ψ(t) = [+H(t), -H(t), +V(t), -V(t)]^T) captures physical signals. Multi-scale oscillation stack (γ 30-100Hz · β 12-30Hz · α 8-12Hz · θ 4-8Hz · δ 0.5-4Hz · ultra-slow < 0.5Hz) processes them in parallel via band-pass + phase lock at each scale. Permutation entropy H_perm = -Σ P(π) log P(π) / log(720) quantifies disorder across 720 ordinal patterns. Coherence metrics (spectral coherence C_xy(f), phase-locking value PLV, transfer entropy T_x→y) map the coupling between sandwich layers. Applied to TCGA multi-omics cancer data: cancer subtyping, survival prediction, therapy response — the substrate computer reads life's disorders as decoherence patterns."
        />
      </Sec>

      {/* ── SECTION VIII: 3-6-9 HARMONIC DEPLOYMENT ── */}
      <Sec id="harmonic-deployment">
        <div style={{ fontSize: 11, color: P.gold, letterSpacing: 2, textTransform: "uppercase", marginBottom: 8 }}>Section VIII</div>
        <h2 style={{ fontSize: 24, fontWeight: 700, color: P.gold, marginBottom: 16 }}>3-6-9 Harmonic Deployment · Ocean · Body · Animal</h2>
        <p style={{ fontSize: 14, color: P.dim, lineHeight: 1.85, maxWidth: 760, marginBottom: 28 }}>
          The sandwich principle scales. The same helium-water-mirror resonant cavity that operates in a lab can be deployed: as a floating ocean unit (helium-water buoy with salt-water dense plate, emitting 3-6-9 harmonic field into the sea), as a human bio-resonance chamber (body inside the sandwich — the person becomes the biological substrate layer), and as an animal health multiplication system (field imprints onto livestock reproductive cycles, coherently tuning their 3-6-9 biological harmonics). The digital root 9 ensures the resonant identity is preserved across all scale transitions.
        </p>

        <ThreeSixNineCanvas />

        <ImgCard
          src={deploymentImg}
          alt="Ocean Deployment → Bio-Application → Animal Multiplication"
          caption="Figure 12 — Three-Scale Deployment · Ocean · Bio · Animal"
          wide
          desc="Left: Ocean Deployment — a helium-charged buoy floating at the surface, emitting a 3-6-9 coherent field downward through salt water. Fish gather around the coherence zone. Center: Bio-Application — a human body inside a cylindrical resonant chamber. The 3-6-9 field envelops the body; concentric rings show the standing wave modes coupling to the body's own electromagnetic field. Bidirectional arrows indicate the body is both sender and receiver — it tunes the field and is tuned by it. Right: Animal Multiplication — cows in a field receiving the same coherent field transmitted through the ground/air interface. The field harmonizes reproductive cycles, supporting natural multiplcation."
        />

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(230px,1fr))", gap: 14 }}>
          <Card title="Digital Root 9 — Invariant" color={P.gold}
            body="3+6+9=18→9. 3×6×9=162→9. Any sequence of 3-6-9 operations always returns to 9. This mathematical invariant means the sandwich's resonant identity is preserved through any number of scale transformations or boundary interactions." />
          <Card title="819 K'awil Tuning" color={P.cyan}
            body="819 = 9×91 = 3×3×7×13. All five visible planets (Mercury, Venus, Mars, Jupiter, Saturn) have periods that fold into multiples of 819 days. This number is the cosmic clock signal the sandwich resonator is tuned to — a planetary coherence frequency." />
          <Card title="Menstrual / Gestational Lock" color={P.purple}
            body="Venus 584d ÷ Menstrual 28d = 20.86 ≈ 21 (3×7). Gestation 266d ÷ 28d = 9.5. The human reproductive sandwich is already harmonically locked to Venus — the StarForge cavity formalizes and amplifies this natural coupling." />
          <Card title="Sea Substrate Platform" color={P.teal}
            body="Ocean water is itself a dense water plate: high mineral content raises effective refractive index, salt ions support magnetic field coupling, and acoustic modes propagate thousands of kilometers. The ocean is a natural sandwich resonator awaiting helium and mirror completion." />
        </div>
      </Sec>

      {/* ── SYNTHESIS FOOTER ── */}
      <Sec id="synthesis">
        <div style={{ fontSize: 11, color: P.gold, letterSpacing: 2, textTransform: "uppercase", marginBottom: 10 }}>Synthesis</div>
        <h2 style={{ fontSize: 22, fontWeight: 700, color: P.ivory, marginBottom: 20 }}>The Universal Template</h2>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(280px,1fr))", gap: 14, marginBottom: 32 }}>
          <Card title="The Cell" color={P.green}
            body="Lipid bilayer (mirror) · cytoplasm (dense water) · nucleus (biological substrate) · lipid bilayer (mirror). Every cell is a StarForge Black Box operating at nanometer scale, tuned to 3-6-9 ionic oscillation frequencies." />
          <Card title="The Brain" color={P.purple}
            body="Skull (mirror) · cerebrospinal fluid (dense water, n≈1.33) · neural tissue (biological substrate) · skull (mirror). The brain is a cavity resonator. The pineal gland sits at the geometric center — the coherent core of the biological sandwich." />
          <Card title="The Planet" color={P.blue}
            body="Ionosphere (mirror, plasma reflector) · atmosphere (helium-like low-density medium) · ocean (dense water plate) · mantle/crust (biological substrate) · inner core (mirror, iron crystal). Earth is a StarForge scaled to planetary dimensions." />
          <Card title="The Star" color={P.gold}
            body="Photosphere (mirror surface, optical depth 1) · convective zone (plasma helium-density) · radiative zone (dense photon medium) · core fusion (biological-analogue coherent substrate). Stars are the original self-replicating sandwich engines." />
        </div>

        <div style={{ padding: "24px 28px", background: P.panel2, borderRadius: 14, border: `1px solid ${P.gold}33`, maxWidth: 720 }}>
          <div style={{ fontSize: 13, color: P.gold, fontWeight: 700, marginBottom: 10 }}>Master Sandwich Equation</div>
          <div style={{ fontSize: 15, fontFamily: "monospace", color: P.ivory, lineHeight: 2, marginBottom: 10 }}>
            𝒞_sandwich = ∏ᵢ C(layerᵢ) · e^(−κ·Γ_boundary) · Σⱼ Q(modeⱼ)/V(modeⱼ)
          </div>
          <div style={{ fontSize: 12, color: P.dim, lineHeight: 1.75 }}>
            Where 𝒞_sandwich is total sandwich coherence, C(layerᵢ) is the individual layer coherence field, κ·Γ_boundary is the boundary loss factor (minimized by 3-6-9 tuning), and Q(modeⱼ)/V(modeⱼ) sums over all resonant modes. High Q, small V, and 3-6-9 harmonic locking drive 𝒞 → 1 (perfect coherence). At 𝒞 = 1, organic potential is maximized and the system becomes self-replicating.
          </div>
        </div>

        <div style={{ marginTop: 36, display: "flex", gap: 14, flexWrap: "wrap" }}>
          {["/substrate-synthesis", "/coherence-field-explorer", "/crystallization-atlas", "/phonon-stack", "/invisible-wind"].map(href => (
            <a key={href} href={href} style={{ padding: "8px 18px", borderRadius: 8, border: `1px solid ${P.line}`, color: P.dim, fontSize: 12, textDecoration: "none" }}>
              {href.replace("/", "").replace(/-/g, " ")} →
            </a>
          ))}
        </div>
      </Sec>
    </div>
  );
}
