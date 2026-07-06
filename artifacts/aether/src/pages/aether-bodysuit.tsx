import { useEffect, useRef, useState } from "react";
import { Link } from "wouter";

// ── Palette ──────────────────────────────────────────────────────────────────
const BG = "#020608";
const CARD = "#061209";
const GREEN = "#39ff14";
const BLUE = "#00cfff";
const PURP = "#bf00ff";
const ORNG = "#ff6b00";
const MONO = "'Share Tech Mono', ui-monospace, monospace";
const DISP = "'Orbitron', 'Share Tech Mono', monospace";

// ── Suit modes ───────────────────────────────────────────────────────────────
const SUIT_MODES: { name: string; col: [number, number, number] }[] = [
  { name: "FLOW", col: [57, 255, 20] },
  { name: "THERMAL", col: [255, 107, 0] },
  { name: "PULSE", col: [0, 207, 255] },
  { name: "STEALTH", col: [191, 0, 255] },
];

// ── Photonic layer stack (L0–L9) ─────────────────────────────────────────────
type Layer = { n: string; name: string; desc: string; tag: string; tagCol: string };
const LAYERS: Layer[] = [
  { n: "L0", name: "SUBSTRATE SKIN INTERFACE", tag: "BIO-INTERFACE", tagCol: PURP,
    desc: "Flexible graphene-elastomer mesh bonded directly to epidermis. Captures bioelectric signals, body-heat gradient and galvanic skin response. Thickness 0.08 mm. Autologous cell-derived outer membrane." },
  { n: "L1", name: "BOULIGAND CHITIN STRUCTURAL FLOOR", tag: "PHOTONIC P0", tagCol: BLUE,
    desc: "Helicoidal chitin nanofiber matrix. Universal Spacing Law C(x,t)=f(d). Provides mechanical damping and photonic phase alignment at the structural layer. Derived from Bio Hardware Engine v3.0 P0." },
  { n: "L2", name: "NACRE PHOTONIC STACK", tag: "PHOTONIC P1", tagCol: BLUE,
    desc: "Aragonite platelet interference film — thin-film optical coherence producing structural colour without pigment. Dynamic refractive-index modulation via piezoelectric actuation. Reptilian constraint τ·B=κ_R maintained." },
  { n: "L3", name: "LYCAENID GYROID 3D PHOTONIC BANDGAP", tag: "PHOTONIC P2", tagCol: BLUE,
    desc: "Double-gyroid architecture solving the chessboard-overload problem. 3D photonic bandgap enables full-spectrum spatial light modulation. Air-channel routing embedded in the gyroid void network." },
  { n: "L4", name: "MORPHO MULTILAYER REFLECTIVE ARRAY", tag: "PHOTONIC P3", tagCol: BLUE,
    desc: "500 nm-period lamellar stack producing iridescent angular reflection. Tunable via voltage-controlled layer spacing. Primary visual output — generates glass-like surface shimmer and air-lensing field." },
  { n: "L5", name: "CHAMELEON NANOCRYSTAL ACTIVE SURFACE", tag: "PHOTONIC P4", tagCol: BLUE,
    desc: "Guanine crystal lattice with electro-mechanical spacing control. Real-time colour and opacity modulation across the full body surface. Cephalopod edge constraint: ‖E(t)‖↑ → C(x,t)↓." },
  { n: "L6", name: "AIR MANIPULATION MICROFLUIDIC NETWORK", tag: "AIR CONTROL", tagCol: ORNG,
    desc: "Embedded microvalve array at 0.2 mm pitch. Piezo-actuated air jets create localized pressure differentials — bending light via refractive-index gradients in controlled air columns. Visual air-manipulation output." },
  { n: "L7", name: "SQUID REFLECTIN PROTEIN DYNAMIC FILM", tag: "PHOTONIC P5", tagCol: BLUE,
    desc: "Recombinant reflectin expressed in a SynHG synthetic-chromosome cassette. Osmotic tuning of reflective state. Provides adaptive camouflage and coherence-field surface coupling." },
  { n: "L8", name: "CUTTLEFISH DISRUPTIVE PATTERN ENGINE", tag: "AETHER FIELD", tagCol: GREEN,
    desc: "Chromatophore-inspired pixel array at 400 µm pitch. Master coherence field C(x,t) drives pattern generation. Produces visual wavefronts, standing interference patterns and emotional field visualization." },
  { n: "L9", name: "OUTER GLASS INTERFACE SURFACE", tag: "GLASS SURFACE", tagCol: ORNG,
    desc: "Aerogel-silica composite with sub-wavelength texturing. Refractive index n≈1.003 — near-air optics produce glass-like transparency with zero surface reflection. The liquid-glass skin interface." },
];

// ── Specs ────────────────────────────────────────────────────────────────────
const SPECS: { icon: string; head: string; val: string; desc: string }[] = [
  { icon: "◈", head: "SURFACE LAYERS", val: "10 STRATA", desc: "L0–L9 photonic stack. Total thickness 1.2 mm. Full coverage scalp to sole." },
  { icon: "⬡", head: "PIXEL PITCH", val: "400 µm", desc: "Cuttlefish-inspired chromatophore array. ~6.25M pixels full body." },
  { icon: "◎", head: "AIR JET ARRAY", val: "0.2 mm", desc: "Microvalve pitch. 25M air-control nodes. Pressure range 0–120 Pa." },
  { icon: "φ", head: "COHERENCE THRESHOLD", val: "φ⁻¹ = 0.618", desc: "Golden-ratio binding constant. Minimum C(x,t) for stable field emission." },
  { icon: "⟁", head: "SCHUMANN LOCK", val: "7.83 Hz", desc: "Primary resonance coupling. Dark-matter hearing condition satisfied at f_S." },
  { icon: "◻", head: "REFRACTIVE INDEX", val: "n ≈ 1.003", desc: "Outer glass surface. Near-air optics. Zero surface reflection when passive." },
  { icon: "⬟", head: "POWER DENSITY", val: "2.4 W/m²", desc: "Body-heat harvesting via thermoelectric L0 layer. Partial self-powered operation." },
  { icon: "⌬", head: "VISUAL AIR RANGE", val: "±3.0 m", desc: "Effective air-manipulation radius. Lensing field detectable at 3 m in lab conditions." },
];

// ── Male vs Female comparison ─────────────────────────────────────────────────
const CMP: { p: string; m: string; f: string; note: string }[] = [
  { p: "Surface area coverage", m: "1.85 m²", f: "1.65 m²", note: "Scaled to form factor" },
  { p: "Chest plate reactor zone", m: "Sternum-centered hex array", f: "Bilateral arc array", note: "Topology adapted" },
  { p: "Coherence field shape", m: "Cylindrical projection", f: "Toroidal projection", note: "Geometry difference" },
  { p: "Air flow pattern", m: "LAMINAR", f: "VORTEX", note: "Default mode" },
  { p: "Pixel array", m: "5.8M nodes", f: "5.2M nodes", note: "Body surface ratio" },
  { p: "Emotional wave output", m: "Lower harmonic", f: "Higher harmonic", note: "Bioelectric baseline" },
  { p: "CUCA agent primary", m: "Vērus / Caelus", f: "Aletheia / Reverie", note: "Default agent map" },
  { p: "SynHG chromosome", m: "MALE CASSETTE", f: "FEMALE CASSETTE", note: "Autologous cell-derived" },
];

// ── Equations ─────────────────────────────────────────────────────────────────
const EQS: { eq: string; def: string }[] = [
  { eq: "C(x,t) = f(d)", def: "UNIVERSAL SPACING LAW — coherence as a function of photonic spacing d. Governs all L1–L5 layers." },
  { eq: "τ · B = κ_R", def: "REPTILIAN CONSTRAINT — persistence τ times bandwidth B equals control constant κ_R." },
  { eq: "‖E(t)‖↑ → C(x,t)↓", def: "CEPHALOPOD EDGE CONSTRAINT — high EM field intensity degrades surface coherence." },
  { eq: "φ⁻¹ ≈ 0.618", def: "GOLDEN-RATIO THRESHOLD — minimum coherence value for stable visual field emission." },
  { eq: "Δn_air(x,t) = α · P(x,t) · C(x,t)", def: "AIR LENSING EQUATION — refractive-index modulation Δn from pressure P and coherence C." },
  { eq: "S(f) = C(x,t) · δ(f − f_S)", def: "SCHUMANN COUPLING — spectral power S peaks at f_S = 7.83 Hz when coherence locks." },
];

// ── Figure drawing (module scope) ─────────────────────────────────────────────
function drawFigure(ctx: CanvasRenderingContext2D, W: number, H: number, isMale: boolean, mode: number, t: number) {
  const [r, g, b] = SUIT_MODES[mode].col;
  const col = `rgb(${r},${g},${b})`;
  const colA = (a: number) => `rgba(${r},${g},${b},${a})`;
  ctx.clearRect(0, 0, W, H);

  const bg = ctx.createRadialGradient(W / 2, H * 0.4, 10, W / 2, H * 0.4, W * 0.7);
  bg.addColorStop(0, colA(0.06));
  bg.addColorStop(1, "rgba(2,6,8,0)");
  ctx.fillStyle = bg; ctx.fillRect(0, 0, W, H);

  const cx = W / 2, scale = W / 340;
  ctx.save(); ctx.translate(cx, 0); ctx.scale(scale, scale);

  const glow = (amt: number) => { ctx.shadowColor = col; ctx.shadowBlur = amt; };
  const noGlow = () => { ctx.shadowBlur = 0; };

  const drawWave = (x: number, y: number, rx: number, ry: number, freq: number, amp: number, phase: number) => {
    ctx.beginPath();
    for (let a = 0; a <= Math.PI * 2; a += 0.05) {
      const wave = amp * Math.sin(freq * a + t + phase);
      const px = (rx + wave) * Math.cos(a) + x;
      const py = (ry + wave) * Math.sin(a) + y;
      a < 0.05 ? ctx.moveTo(px, py) : ctx.lineTo(px, py);
    }
    ctx.closePath();
    ctx.strokeStyle = colA(0.35 + 0.2 * Math.sin(t * 2));
    ctx.lineWidth = 1.2; glow(10); ctx.stroke(); noGlow();
  };

  if (isMale) {
    ctx.beginPath(); ctx.ellipse(0, 40, 28, 34, 0, 0, Math.PI * 2);
    ctx.fillStyle = colA(0.06); ctx.fill();
    ctx.strokeStyle = colA(0.5); ctx.lineWidth = 1.5; glow(12); ctx.stroke(); noGlow();
    ctx.beginPath(); ctx.rect(-10, 72, 20, 20); ctx.fillStyle = colA(0.1); ctx.fill();
    ctx.strokeStyle = colA(0.4); ctx.lineWidth = 1; glow(8); ctx.stroke(); noGlow();
    ctx.beginPath(); ctx.roundRect(-52, 92, 104, 130, 6);
    ctx.fillStyle = colA(0.06); ctx.fill();
    ctx.strokeStyle = colA(0.55); ctx.lineWidth = 1.8; glow(15); ctx.stroke(); noGlow();
    for (let i = 0; i < 3; i++) drawWave(0, 130 + i * 16, 38 - i * 6, 10 - i * 2, 6, 4 + i * 1.5, i * 1.1);
    for (let a = 0; a < 6; a++) {
      const hx2 = Math.cos(a * Math.PI / 3) * 26, hy2 = Math.sin(a * Math.PI / 3) * 26;
      const hx3 = Math.cos((a + 1) * Math.PI / 3) * 26, hy3 = Math.sin((a + 1) * Math.PI / 3) * 26;
      ctx.beginPath(); ctx.moveTo(0, 130); ctx.lineTo(hx2, hy2 + 130); ctx.lineTo(hx3, hy3 + 130);
      ctx.closePath(); ctx.fillStyle = colA(0.04 + 0.04 * Math.sin(t * 3 + a)); ctx.fill();
      ctx.strokeStyle = colA(0.3); ctx.lineWidth = 0.8; ctx.stroke();
    }
    const rg = ctx.createRadialGradient(0, 130, 0, 0, 130, 18);
    rg.addColorStop(0, colA(0.8 + 0.2 * Math.sin(t * 4)));
    rg.addColorStop(0.5, colA(0.3));
    rg.addColorStop(1, colA(0));
    ctx.beginPath(); ctx.arc(0, 130, 18, 0, Math.PI * 2);
    ctx.fillStyle = rg; glow(25); ctx.fill(); noGlow();
    ctx.beginPath(); ctx.ellipse(-62, 106, 16, 24, 0.3, 0, Math.PI * 2);
    ctx.fillStyle = colA(0.08); ctx.fill(); ctx.strokeStyle = colA(0.4); ctx.lineWidth = 1.3; glow(8); ctx.stroke(); noGlow();
    ctx.beginPath(); ctx.ellipse(62, 106, 16, 24, -0.3, 0, Math.PI * 2);
    ctx.fillStyle = colA(0.08); ctx.fill(); ctx.strokeStyle = colA(0.4); ctx.lineWidth = 1.3; glow(8); ctx.stroke(); noGlow();
    ctx.beginPath(); ctx.roundRect(-76, 122, 20, 90, 8);
    ctx.fillStyle = colA(0.06); ctx.fill(); ctx.strokeStyle = colA(0.35); ctx.lineWidth = 1; glow(6); ctx.stroke(); noGlow();
    ctx.beginPath(); ctx.roundRect(56, 122, 20, 90, 8);
    ctx.fillStyle = colA(0.06); ctx.fill(); ctx.strokeStyle = colA(0.35); ctx.lineWidth = 1; glow(6); ctx.stroke(); noGlow();
    ctx.beginPath(); ctx.roundRect(-74, 214, 18, 70, 6);
    ctx.fillStyle = colA(0.05); ctx.fill(); ctx.strokeStyle = colA(0.28); ctx.lineWidth = 1; glow(5); ctx.stroke(); noGlow();
    ctx.beginPath(); ctx.roundRect(56, 214, 18, 70, 6);
    ctx.fillStyle = colA(0.05); ctx.fill(); ctx.strokeStyle = colA(0.28); ctx.lineWidth = 1; glow(5); ctx.stroke(); noGlow();
    ctx.beginPath(); ctx.roundRect(-48, 220, 96, 60, 6);
    ctx.fillStyle = colA(0.06); ctx.fill(); ctx.strokeStyle = colA(0.4); ctx.lineWidth = 1.3; glow(10); ctx.stroke(); noGlow();
    ctx.beginPath(); ctx.roundRect(-46, 278, 36, 100, 6);
    ctx.fillStyle = colA(0.06); ctx.fill(); ctx.strokeStyle = colA(0.32); ctx.lineWidth = 1; glow(7); ctx.stroke(); noGlow();
    ctx.beginPath(); ctx.roundRect(10, 278, 36, 100, 6);
    ctx.fillStyle = colA(0.06); ctx.fill(); ctx.strokeStyle = colA(0.32); ctx.lineWidth = 1; glow(7); ctx.stroke(); noGlow();
    ctx.beginPath(); ctx.roundRect(-44, 376, 32, 90, 5);
    ctx.fillStyle = colA(0.05); ctx.fill(); ctx.strokeStyle = colA(0.25); ctx.lineWidth = 1; glow(5); ctx.stroke(); noGlow();
    ctx.beginPath(); ctx.roundRect(12, 376, 32, 90, 5);
    ctx.fillStyle = colA(0.05); ctx.fill(); ctx.strokeStyle = colA(0.25); ctx.lineWidth = 1; glow(5); ctx.stroke(); noGlow();
    for (let i = 0; i < 4; i++) {
      const pr = 90 + i * 18, pa = 0.06 - i * 0.012;
      ctx.beginPath(); ctx.ellipse(0, 220, pr, pr * 1.6, 0, 0, Math.PI * 2);
      ctx.strokeStyle = colA(pa * (0.5 + 0.5 * Math.sin(t * 1.5 + i)));
      ctx.lineWidth = 0.8 + Math.sin(t + i) * 0.5; glow(4); ctx.stroke(); noGlow();
    }
  } else {
    ctx.beginPath(); ctx.ellipse(0, 40, 25, 31, 0, 0, Math.PI * 2);
    ctx.fillStyle = colA(0.06); ctx.fill();
    ctx.strokeStyle = colA(0.5); ctx.lineWidth = 1.5; glow(12); ctx.stroke(); noGlow();
    ctx.beginPath(); ctx.ellipse(0, 24, 27, 18, 0, 0, Math.PI * 2);
    ctx.strokeStyle = colA(0.2); ctx.lineWidth = 2; ctx.stroke();
    ctx.beginPath(); ctx.rect(-8, 70, 16, 20); ctx.fillStyle = colA(0.1); ctx.fill();
    ctx.strokeStyle = colA(0.35); ctx.lineWidth = 1; glow(6); ctx.stroke(); noGlow();
    ctx.beginPath();
    ctx.moveTo(-38, 90); ctx.bezierCurveTo(-55, 100, -58, 130, -52, 160);
    ctx.bezierCurveTo(-50, 175, -45, 185, -38, 190);
    ctx.lineTo(38, 190); ctx.bezierCurveTo(45, 185, 50, 175, 52, 160);
    ctx.bezierCurveTo(58, 130, 55, 100, 38, 90); ctx.closePath();
    ctx.fillStyle = colA(0.06); ctx.fill();
    ctx.strokeStyle = colA(0.55); ctx.lineWidth = 1.8; glow(15); ctx.stroke(); noGlow();
    for (let sx = -1; sx <= 1; sx += 2) {
      for (let i = 0; i < 3; i++) {
        const wav = 5 + i * 3, freq = 5, amp = 3 + i;
        ctx.beginPath();
        for (let a = 0; a <= Math.PI; a += 0.05) {
          const wave = amp * Math.sin(freq * a + t + (sx > 0 ? 0 : Math.PI));
          const px = sx * 10 + sx * (wav + wave) * Math.cos(a);
          const py = 115 + i * 10 + (wav + wave) * Math.sin(a) * 0.5;
          a < 0.05 ? ctx.moveTo(px, py) : ctx.lineTo(px, py);
        }
        ctx.strokeStyle = colA(0.3 + 0.15 * Math.sin(t * 2 + i));
        ctx.lineWidth = 1.1; glow(8); ctx.stroke(); noGlow();
      }
      const bg2 = ctx.createRadialGradient(sx * 20, 118, 0, sx * 20, 118, 14);
      bg2.addColorStop(0, colA(0.5 + 0.2 * Math.sin(t * 3 + sx)));
      bg2.addColorStop(1, colA(0));
      ctx.beginPath(); ctx.arc(sx * 20, 118, 14, 0, Math.PI * 2);
      ctx.fillStyle = bg2; glow(20); ctx.fill(); noGlow();
    }
    for (let i = 0; i < 4; i++) {
      const rr = 45 + i * 14, a = 0.07 - i * 0.015;
      ctx.beginPath(); ctx.ellipse(0, 140, rr, rr * 0.35, 0, 0, Math.PI * 2);
      ctx.strokeStyle = colA(a * (0.5 + 0.5 * Math.sin(t * 1.8 + i)));
      ctx.lineWidth = 0.9; glow(5); ctx.stroke(); noGlow();
    }
    ctx.beginPath(); ctx.ellipse(-50, 102, 13, 18, 0.2, 0, Math.PI * 2);
    ctx.fillStyle = colA(0.07); ctx.fill(); ctx.strokeStyle = colA(0.38); ctx.lineWidth = 1.2; glow(7); ctx.stroke(); noGlow();
    ctx.beginPath(); ctx.ellipse(50, 102, 13, 18, -0.2, 0, Math.PI * 2);
    ctx.fillStyle = colA(0.07); ctx.fill(); ctx.strokeStyle = colA(0.38); ctx.lineWidth = 1.2; glow(7); ctx.stroke(); noGlow();
    ctx.beginPath(); ctx.roundRect(-64, 116, 16, 85, 7);
    ctx.fillStyle = colA(0.06); ctx.fill(); ctx.strokeStyle = colA(0.3); ctx.lineWidth = 1; glow(5); ctx.stroke(); noGlow();
    ctx.beginPath(); ctx.roundRect(48, 116, 16, 85, 7);
    ctx.fillStyle = colA(0.06); ctx.fill(); ctx.strokeStyle = colA(0.3); ctx.lineWidth = 1; glow(5); ctx.stroke(); noGlow();
    ctx.beginPath(); ctx.roundRect(-62, 200, 14, 65, 6);
    ctx.fillStyle = colA(0.05); ctx.fill(); ctx.strokeStyle = colA(0.25); ctx.lineWidth = 1; glow(4); ctx.stroke(); noGlow();
    ctx.beginPath(); ctx.roundRect(48, 200, 14, 65, 6);
    ctx.fillStyle = colA(0.05); ctx.fill(); ctx.strokeStyle = colA(0.25); ctx.lineWidth = 1; glow(4); ctx.stroke(); noGlow();
    ctx.beginPath();
    ctx.moveTo(-38, 190); ctx.bezierCurveTo(-55, 200, -58, 215, -50, 240);
    ctx.lineTo(50, 240); ctx.bezierCurveTo(58, 215, 55, 200, 38, 190); ctx.closePath();
    ctx.fillStyle = colA(0.07); ctx.fill(); ctx.strokeStyle = colA(0.42); ctx.lineWidth = 1.4; glow(10); ctx.stroke(); noGlow();
    ctx.beginPath(); ctx.roundRect(-44, 238, 30, 100, 7);
    ctx.fillStyle = colA(0.06); ctx.fill(); ctx.strokeStyle = colA(0.28); ctx.lineWidth = 1; glow(6); ctx.stroke(); noGlow();
    ctx.beginPath(); ctx.roundRect(14, 238, 30, 100, 7);
    ctx.fillStyle = colA(0.06); ctx.fill(); ctx.strokeStyle = colA(0.28); ctx.lineWidth = 1; glow(6); ctx.stroke(); noGlow();
    ctx.beginPath(); ctx.roundRect(-42, 336, 26, 90, 5);
    ctx.fillStyle = colA(0.05); ctx.fill(); ctx.strokeStyle = colA(0.22); ctx.lineWidth = 1; glow(4); ctx.stroke(); noGlow();
    ctx.beginPath(); ctx.roundRect(16, 336, 26, 90, 5);
    ctx.fillStyle = colA(0.05); ctx.fill(); ctx.strokeStyle = colA(0.22); ctx.lineWidth = 1; glow(4); ctx.stroke(); noGlow();
    for (let i = 0; i < 5; i++) {
      const vr = 80 + i * 16, va = 0.05 - i * 0.008;
      ctx.beginPath(); ctx.ellipse(0, 200, vr, vr * 0.45, 0, 0, Math.PI * 2);
      ctx.strokeStyle = colA(va * (0.6 + 0.4 * Math.sin(t * 1.3 + i * 0.8)));
      ctx.lineWidth = 0.7; glow(3); ctx.stroke(); noGlow();
    }
  }

  ctx.restore();

  const scanY = (t * 60) % H;
  const sg = ctx.createLinearGradient(0, scanY - 10, 0, scanY + 10);
  sg.addColorStop(0, "transparent");
  sg.addColorStop(0.5, colA(0.08));
  sg.addColorStop(1, "transparent");
  ctx.fillStyle = sg; ctx.fillRect(0, scanY - 10, W, 20);
}

// ── Hero particle mesh ────────────────────────────────────────────────────────
function HeroField() {
  const ref = useRef<HTMLCanvasElement>(null);
  const rafRef = useRef(0);
  useEffect(() => {
    const canvas = ref.current; if (!canvas) return;
    const ctx = canvas.getContext("2d")!;
    let W = 0, H = 0;
    let pts: { x: number; y: number; vx: number; vy: number; r: number; a: number }[] = [];
    const seed = () => {
      W = canvas.width = canvas.offsetWidth;
      H = canvas.height = canvas.offsetHeight || 420;
      pts = Array.from({ length: 110 }, () => ({
        x: Math.random() * W, y: Math.random() * H,
        vx: (Math.random() - 0.5) * 0.3, vy: (Math.random() - 0.5) * 0.3,
        r: Math.random() * 1.5 + 0.5, a: Math.random(),
      }));
    };
    seed();
    const ro = new ResizeObserver(seed); ro.observe(canvas);
    let t = 0;
    const draw = () => {
      t += 0.012;
      ctx.clearRect(0, 0, W, H);
      pts.forEach((p) => {
        p.x += p.vx; p.y += p.vy;
        if (p.x < 0) p.x = W; if (p.x > W) p.x = 0;
        if (p.y < 0) p.y = H; if (p.y > H) p.y = 0;
        p.a = 0.3 + Math.sin(t + p.x * 0.01) * 0.3;
        ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(57,255,20,${Math.max(0, p.a)})`; ctx.fill();
      });
      pts.forEach((a, i) => {
        for (let j = i + 1; j < pts.length; j++) {
          const bb = pts[j];
          const d = Math.hypot(a.x - bb.x, a.y - bb.y);
          if (d < 90) {
            ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(bb.x, bb.y);
            ctx.strokeStyle = `rgba(57,255,20,${0.12 * (1 - d / 90)})`; ctx.lineWidth = 0.5; ctx.stroke();
          }
        }
      });
      rafRef.current = requestAnimationFrame(draw);
    };
    draw();
    return () => { cancelAnimationFrame(rafRef.current); ro.disconnect(); };
  }, []);
  return <canvas ref={ref} style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }} />;
}

// ── Suit figure card ──────────────────────────────────────────────────────────
function SuitFigure({ isMale, unit, name }: { isMale: boolean; unit: string; name: string }) {
  const ref = useRef<HTMLCanvasElement>(null);
  const rafRef = useRef(0);
  const [mode, setMode] = useState(0);
  const modeRef = useRef(0);
  useEffect(() => { modeRef.current = mode; }, [mode]);
  useEffect(() => {
    const canvas = ref.current; if (!canvas) return;
    const ctx = canvas.getContext("2d")!;
    let t = 0;
    const draw = () => {
      t += 0.016;
      drawFigure(ctx, canvas.width, canvas.height, isMale, modeRef.current, t);
      rafRef.current = requestAnimationFrame(draw);
    };
    draw();
    return () => cancelAnimationFrame(rafRef.current);
  }, [isMale]);
  return (
    <div style={{ background: CARD, border: "1px solid rgba(57,255,20,0.15)", borderRadius: 8, padding: 24 }}>
      <div style={{ fontSize: 11, letterSpacing: "0.28em", opacity: 0.45, color: GREEN, fontFamily: MONO }}>{unit}</div>
      <div style={{ fontFamily: DISP, fontSize: "1.1rem", fontWeight: 700, color: GREEN, margin: "8px 0 18px" }}>{name}</div>
      <canvas ref={ref} width={340} height={520} style={{ width: "100%", borderRadius: 4, display: "block" }} />
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginTop: 16 }}>
        {SUIT_MODES.map((m, i) => (
          <button key={m.name} onClick={() => setMode(i)} style={{
            fontFamily: MONO, fontSize: 11, letterSpacing: "0.16em", padding: "6px 12px",
            background: mode === i ? "rgba(57,255,20,0.08)" : "transparent",
            border: `1px solid ${mode === i ? GREEN : "rgba(57,255,20,0.2)"}`,
            color: mode === i ? GREEN : "rgba(57,255,20,0.4)", cursor: "pointer", borderRadius: 3,
            boxShadow: mode === i ? "0 0 12px rgba(57,255,20,0.2)" : "none",
          }}>{m.name}</button>
        ))}
      </div>
    </div>
  );
}

// ── Coherence field simulator ─────────────────────────────────────────────────
function CoherenceField() {
  const ref = useRef<HTMLCanvasElement>(null);
  const rafRef = useRef(0);
  const [coh, setCoh] = useState(0.85);
  const [air, setAir] = useState(0.5);
  const [sch, setSch] = useState(0.62);
  const [vis, setVis] = useState(0.7);
  const [emo, setEmo] = useState(7.83);
  const rc = useRef({ coh, air, sch, vis, emo });
  useEffect(() => { rc.current = { coh, air, sch, vis, emo }; }, [coh, air, sch, vis, emo]);

  useEffect(() => {
    const canvas = ref.current; if (!canvas) return;
    const ctx = canvas.getContext("2d")!;
    const FW = canvas.width, FH = canvas.height;
    const mouse = { x: FW / 2, y: FH / 2, active: false };
    const move = (e: PointerEvent) => {
      const r = canvas.getBoundingClientRect();
      if (r.width <= 0 || r.height <= 0) return;
      mouse.x = (e.clientX - r.left) * (FW / r.width);
      mouse.y = (e.clientY - r.top) * (FH / r.height);
      mouse.active = true;
    };
    const leave = () => { mouse.active = false; };
    canvas.addEventListener("pointermove", move);
    canvas.addEventListener("pointerleave", leave);
    let t = 0;
    const draw = () => {
      t += 0.018;
      const { coh: cohV, air: airV, sch: schV, vis: visV, emo: emoV } = rc.current;
      ctx.clearRect(0, 0, FW, FH);
      ctx.fillStyle = "rgba(2,6,8,0.5)"; ctx.fillRect(0, 0, FW, FH);
      const cr = 57 * cohV, cg = 255 * cohV, cb = 20 * cohV;
      const ar = 0 * airV, ag = 207 * airV, ab = 255 * airV;
      for (let x = 0; x < FW; x += 20) {
        for (let y = 0; y < FH; y += 20) {
          const d = mouse.active ? Math.hypot(x - mouse.x, y - mouse.y) : 999;
          const rip = mouse.active ? Math.exp(-d / 100) * Math.sin(d / 15 - t * 8) * 0.4 : 0;
          const s = Math.sin(t * emoV / 7.83 * 2 + x * 0.04) * Math.sin(t * emoV / 7.83 * 1.3 + y * 0.04);
          const cc = cohV * (0.7 + 0.3 * s) + rip;
          const aa = airV * Math.sin(x * 0.03 + t * 1.2) * Math.cos(y * 0.03 + t * 0.9);
          const v = Math.max(0, Math.min(1, (cc + aa) * visV));
          const a = v * 0.6;
          const rr = cr + (ar - cr) * airV * 0.5, gg = cg + (ag - cg) * airV * 0.5, bb = cb + (ab - cb) * airV * 0.5;
          ctx.fillStyle = `rgba(${Math.round(rr)},${Math.round(gg)},${Math.round(bb)},${a})`;
          ctx.beginPath(); ctx.arc(x, y, 3 * v + 0.5, 0, Math.PI * 2); ctx.fill();
        }
      }
      const rings = Math.floor(cohV * 8) + 2;
      for (let i = 0; i < rings; i++) {
        const rr = 30 + i * 35, phase = t * 2.2 + i * 0.6;
        const a = cohV * 0.25 * (1 - i / rings);
        ctx.beginPath(); ctx.ellipse(FW / 2, FH / 2, rr, rr * 0.5, t * 0.1, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(57,255,20,${a})`; ctx.lineWidth = 1 + Math.sin(phase) * 0.5;
        ctx.shadowColor = GREEN; ctx.shadowBlur = 6; ctx.stroke(); ctx.shadowBlur = 0;
      }
      const schPulse = 0.5 + 0.5 * Math.sin(t * emoV / 7.83 * Math.PI * 2);
      const sg2 = ctx.createRadialGradient(FW / 2, FH / 2, 0, FW / 2, FH / 2, FW / 2);
      sg2.addColorStop(0, `rgba(57,255,20,${cohV * schPulse * 0.18})`);
      sg2.addColorStop(1, "transparent");
      ctx.fillStyle = sg2; ctx.fillRect(0, 0, FW, FH);
      if (airV > 0.1) {
        for (let j = 0; j < 6; j++) {
          const jx = FW * 0.1 + j * (FW * 0.8 / 5);
          const jy = FH - 10;
          const jh = airV * FH * 0.7;
          const jg = ctx.createLinearGradient(jx, jy, jx, jy - jh);
          jg.addColorStop(0, `rgba(0,207,255,${airV * 0.4})`);
          jg.addColorStop(1, "transparent");
          ctx.fillStyle = jg;
          const w = 4 + Math.sin(t * 3 + j) * 2;
          ctx.fillRect(jx - w / 2, jy - jh, w, jh);
        }
      }
      ctx.fillStyle = "rgba(57,255,20,0.35)"; ctx.font = `10px ${MONO}`;
      ctx.fillText(`C(x,t)=${cohV.toFixed(2)}  dP=${airV.toFixed(2)}  phi=${schV.toFixed(2)}  f=${emoV.toFixed(2)}Hz`, 12, FH - 12);
      rafRef.current = requestAnimationFrame(draw);
    };
    draw();
    return () => {
      cancelAnimationFrame(rafRef.current);
      canvas.removeEventListener("pointermove", move);
      canvas.removeEventListener("pointerleave", leave);
    };
  }, []);

  const rows: { lbl: string; val: string; v: number; set: (n: number) => void; min: number; max: number }[] = [
    { lbl: "COHERENCE C(x,t)", val: coh.toFixed(2), v: coh, set: setCoh, min: 0, max: 1 },
    { lbl: "AIR PRESSURE ΔIOP", val: air.toFixed(2), v: air, set: setAir, min: 0, max: 1 },
    { lbl: "SCHUMANN φ COUPLING", val: sch.toFixed(2), v: sch, set: setSch, min: 0, max: 1 },
    { lbl: "VISUAL FIELD INTENSITY", val: vis.toFixed(2), v: vis, set: setVis, min: 0, max: 1 },
    { lbl: "EMOTIONAL WAVE FREQ", val: emo.toFixed(2) + " Hz", v: emo, set: setEmo, min: 1, max: 20 },
  ];

  return (
    <div style={{ display: "grid", gridTemplateColumns: "1.2fr 1fr", gap: 32, alignItems: "center" }}>
      <canvas ref={ref} width={600} height={400} style={{ width: "100%", borderRadius: 6, border: "1px solid rgba(57,255,20,0.12)", display: "block", cursor: "crosshair" }} />
      <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
        {rows.map((r) => (
          <div key={r.lbl}>
            <label style={{ display: "block", fontSize: 11, letterSpacing: "0.14em", opacity: 0.5, color: GREEN, fontFamily: MONO, marginBottom: 6 }}>
              {r.lbl} <span style={{ float: "right", opacity: 0.85 }}>{r.val}</span>
            </label>
            <input type="range" min={r.min} max={r.max} step={0.01} value={r.v}
              onChange={(e) => r.set(parseFloat(e.target.value))}
              style={{ width: "100%", accentColor: GREEN }} />
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────
export default function AetherBodySuitPage() {
  const secTitle: React.CSSProperties = { fontFamily: DISP, fontSize: "clamp(1.2rem,3vw,2rem)", fontWeight: 700, color: GREEN, textShadow: "0 0 20px rgba(57,255,20,0.4)", marginBottom: 12 };
  const secLabel: React.CSSProperties = { fontSize: 11, letterSpacing: "0.4em", opacity: 0.4, color: GREEN, fontFamily: MONO };
  const divider: React.CSSProperties = { width: "100%", height: 1, background: "linear-gradient(90deg,transparent,rgba(57,255,20,0.3),transparent)", margin: "8px 0 40px" };
  const section: React.CSSProperties = { maxWidth: 1200, margin: "0 auto", padding: "72px 28px" };

  return (
    <div style={{ background: BG, color: GREEN, fontFamily: MONO, minHeight: "100vh", overflowY: "auto" }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Share+Tech+Mono&family=Orbitron:wght@400;700;900&display=swap');`}</style>

      {/* HERO */}
      <div style={{ position: "relative", height: "82vh", minHeight: 460, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", textAlign: "center", overflow: "hidden", borderBottom: "1px solid rgba(57,255,20,0.15)" }}>
        <HeroField />
        <div style={{ position: "relative", zIndex: 2, padding: "0 24px" }}>
          <div style={{ fontSize: 11, letterSpacing: "0.4em", opacity: 0.5 }}>AETHER FRAMEWORK · CUCA ARCHITECTURE · AetherLife.co</div>
          <h1 style={{ fontFamily: DISP, fontSize: "clamp(2rem,6vw,4.4rem)", fontWeight: 900, lineHeight: 1.1, margin: "16px 0", textShadow: "0 0 40px rgba(57,255,20,0.7),0 0 80px rgba(57,255,20,0.3)" }}>
            SKIN BODY SUIT<br />ARCHITECTURE
          </h1>
          <div style={{ fontSize: "clamp(0.7rem,1.5vw,0.95rem)", opacity: 0.55, letterSpacing: "0.22em" }}>VISUAL AIR MANIPULATION INTERFACE · GLASS SURFACE COHERENCE FIELD</div>
          <div style={{ marginTop: 28, fontSize: 11, opacity: 0.35, letterSpacing: "0.22em" }}>DOC-AETHER-BSA-001 · v1.0 · COSMIC CHAOS CORPORATION</div>
        </div>
      </div>

      {/* SIMULATORS */}
      <section style={section}>
        <div style={secLabel}>SECTION 01</div>
        <div style={secTitle}>INTERFACE SURFACE SIMULATORS</div>
        <div style={divider} />
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(300px,1fr))", gap: 32 }}>
          <SuitFigure isMale unit="UNIT ALPHA" name="MALE FORM — AE-M" />
          <SuitFigure isMale={false} unit="UNIT BETA" name="FEMALE FORM — AE-F" />
        </div>
      </section>

      {/* LAYER STACK */}
      <section style={section}>
        <div style={secLabel}>SECTION 02</div>
        <div style={secTitle}>PHOTONIC LAYER ARCHITECTURE</div>
        <div style={divider} />
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {LAYERS.map((l) => (
            <div key={l.n} style={{ display: "flex", alignItems: "center", gap: 16, background: CARD, border: "1px solid rgba(57,255,20,0.1)", borderRadius: 6, padding: "16px 20px" }}>
              <div style={{ fontFamily: DISP, fontSize: "1.4rem", fontWeight: 900, opacity: 0.22, minWidth: 40, textAlign: "center" }}>{l.n}</div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: "0.9rem", fontWeight: 700, marginBottom: 4 }}>{l.name}</div>
                <div style={{ fontSize: "0.72rem", opacity: 0.5, lineHeight: 1.6 }}>{l.desc}</div>
              </div>
              <div style={{ fontSize: "0.58rem", letterSpacing: "0.16em", padding: "3px 8px", borderRadius: 2, border: `1px solid ${l.tagCol}66`, color: l.tagCol, whiteSpace: "nowrap", alignSelf: "flex-start" }}>{l.tag}</div>
            </div>
          ))}
        </div>
      </section>

      {/* COHERENCE FIELD */}
      <section style={section}>
        <div style={secLabel}>SECTION 03</div>
        <div style={secTitle}>COHERENCE FIELD SIMULATOR</div>
        <div style={divider} />
        <p style={{ fontSize: "0.78rem", opacity: 0.5, lineHeight: 1.8, marginBottom: 28, maxWidth: 760 }}>
          Move the cursor across the field to inject a ripple. The grid samples the master coherence field C(x,t), modulated by the Schumann φ term and air-lensing pressure. Standing wave rings and the Schumann glow lock to the emotional wave frequency; blue air jets rise as ΔIOP pressure increases.
        </p>
        <CoherenceField />
      </section>

      {/* SPECIFICATIONS */}
      <section style={section}>
        <div style={secLabel}>SECTION 04</div>
        <div style={secTitle}>SYSTEM SPECIFICATIONS</div>
        <div style={divider} />
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(220px,1fr))", gap: 16 }}>
          {SPECS.map((s) => (
            <div key={s.head} style={{ background: CARD, border: "1px solid rgba(57,255,20,0.12)", borderRadius: 6, padding: 20 }}>
              <div style={{ fontSize: "1.4rem", marginBottom: 10, opacity: 0.7 }}>{s.icon}</div>
              <div style={{ fontSize: "0.65rem", letterSpacing: "0.2em", opacity: 0.45, marginBottom: 6 }}>{s.head}</div>
              <div style={{ fontSize: "1.05rem", fontWeight: 700, textShadow: "0 0 8px rgba(57,255,20,0.5)" }}>{s.val}</div>
              <div style={{ fontSize: "0.68rem", opacity: 0.45, marginTop: 6, lineHeight: 1.6 }}>{s.desc}</div>
            </div>
          ))}
        </div>

        <div style={{ marginTop: 48 }}>
          <div style={{ ...secTitle, fontSize: "1.2rem" }}>MALE vs FEMALE FORM — PARAMETER COMPARISON</div>
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.78rem", minWidth: 640 }}>
              <thead>
                <tr>
                  {["PARAMETER", "AE-M (MALE)", "AE-F (FEMALE)", "NOTES"].map((h) => (
                    <th key={h} style={{ fontSize: "0.62rem", letterSpacing: "0.24em", opacity: 0.4, padding: "10px 16px", textAlign: "left", borderBottom: "1px solid rgba(57,255,20,0.15)" }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {CMP.map((c) => (
                  <tr key={c.p}>
                    <td style={{ padding: "12px 16px", borderBottom: "1px solid rgba(57,255,20,0.07)", lineHeight: 1.5 }}>{c.p}</td>
                    <td style={{ padding: "12px 16px", borderBottom: "1px solid rgba(57,255,20,0.07)", lineHeight: 1.5 }}>{c.m}</td>
                    <td style={{ padding: "12px 16px", borderBottom: "1px solid rgba(57,255,20,0.07)", lineHeight: 1.5 }}>{c.f}</td>
                    <td style={{ padding: "12px 16px", borderBottom: "1px solid rgba(57,255,20,0.07)", lineHeight: 1.5, opacity: 0.55 }}>{c.note}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* MATHEMATICS */}
      <section style={section}>
        <div style={secLabel}>SECTION 05</div>
        <div style={secTitle}>FORMAL MATHEMATICS</div>
        <div style={divider} />
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(280px,1fr))", gap: 12 }}>
          {EQS.map((e) => (
            <div key={e.eq} style={{ background: CARD, border: "1px solid rgba(57,255,20,0.12)", borderLeft: `3px solid ${GREEN}`, borderRadius: "0 6px 6px 0", padding: "18px 22px" }}>
              <div style={{ color: "rgba(57,255,20,0.9)", fontSize: "1rem", lineHeight: 1.8 }}>{e.eq}</div>
              <div style={{ opacity: 0.5, fontSize: "0.72rem", marginTop: 6, lineHeight: 1.7 }}>{e.def}</div>
            </div>
          ))}
        </div>
        <div style={{ marginTop: 24, background: CARD, border: "1px solid rgba(57,255,20,0.12)", borderLeft: `3px solid ${GREEN}`, borderRadius: "0 6px 6px 0", padding: "20px 24px" }}>
          <div style={{ color: "rgba(57,255,20,0.9)", fontSize: "1rem", lineHeight: 1.9 }}>L_total(x,t) = Σᵢ [Pᵢ(x,t) · Cᵢ(x,t) · Aᵢ(x,t)] · Δn_air(x,t)</div>
          <div style={{ opacity: 0.5, fontSize: "0.72rem", marginTop: 8, lineHeight: 1.7 }}>
            MASTER VISUAL OUTPUT EQUATION — total luminance field L is the sum across all photonic layers Pᵢ, weighted by coherence Cᵢ and air actuation Aᵢ, modulated by the air-lensing term. This is the AETHER Body Suit equation for visual air manipulation.
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer style={{ borderTop: "1px solid rgba(57,255,20,0.12)", padding: "40px 28px", textAlign: "center", fontSize: "0.68rem", opacity: 0.4, letterSpacing: "0.14em", lineHeight: 2 }}>
        <div>AETHER BODY SUIT ARCHITECTURE · DOC-AETHER-BSA-001 · v1.0</div>
        <div>CUCA v4.1 · BIO HARDWARE ENGINE v3.0 · AETHER OS</div>
        <div style={{ marginTop: 14, display: "flex", gap: 18, justifyContent: "center", flexWrap: "wrap" }}>
          <Link href="/bio-photonic-scent" style={{ color: BLUE, textDecoration: "none" }}>→ Bio-Photonic Scent</Link>
          <Link href="/soi-building" style={{ color: BLUE, textDecoration: "none" }}>→ SOI Building</Link>
          <Link href="/rhombus-gate" style={{ color: BLUE, textDecoration: "none" }}>→ Rhombus Gate</Link>
          <Link href="/graph-view" style={{ color: BLUE, textDecoration: "none" }}>→ Graph Map</Link>
        </div>
      </footer>
    </div>
  );
}
