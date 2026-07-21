/*═══════════════════════════════════════════════════════════════
  Direct Solar-to-Neural Interface
  ~800 GPCRs · Retinol Chromophore · Schumann Resonance
  Sunlight's Dynamic Force → Consciousness in Bio-Machines

  Source: chatgpt.com/share/6a5fbe01

  Three canvases:
  I.  Solar Plasma → Eye Transducer → Retinal Photochemistry
  II. GPCR Receptor Antenna Array (~800 tunable receivers)
  III.Schumann Resonance Coupling · 7.83 Hz · Neural Entrainment
═══════════════════════════════════════════════════════════════*/
import { useRef, useEffect } from "react";
import omniFlow from "@assets/72D555D1-E91E-4B74-A73B-4628B8538AA1_1784561445345.png";
import magStorm from "@assets/A6805E91-9684-4C59-BFC8-482EF421381D_1784561445345.png";
import skyrmion from "@assets/IMG_4534_1784561445345.png";

const BG = "#020608";
const PANEL = "#050d10";
const IVORY = "#f0f4ff";
const DIM = "rgba(240,244,255,0.52)";
const MUTED = "rgba(240,244,255,0.26)";
const LINE = "rgba(255,180,40,0.10)";
const GOLD = "#f5c84c";
const AMBER = "#fb923c";
const CYAN = "#22d3ee";
const VIOLET = "#a78bfa";
const GREEN = "#4ade80";
const BLUE = "#60a5fa";
const RED = "#f87171";
const TEAL = "#2dd4bf";
const YELLOW = "#fde047";

function Tag({ t, c = GOLD }: { t: string; c?: string }) {
  return <div style={{ fontSize: 9, fontWeight: 700, color: c, letterSpacing: 2, textTransform: "uppercase" as const, marginBottom: 10 }}>{t}</div>;
}
function Divider() { return <div style={{ height: 1, background: LINE, margin: "44px 0" }} />; }

/* ══════════════════════════════════════════════════════════
   CANVAS I — Solar Input → Eye → Retinal Photochemistry
   Sun radiates photons → hit cornea → rhodopsin GPCR activated
   → cis → trans retinal isomerisation → cascade → neural spike
══════════════════════════════════════════════════════════ */
function SolarNeuralCanvas() {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const cv = ref.current; if (!cv) return;
    const ctx = cv.getContext("2d")!;
    let raf = 0, t = 0;
    const ro = new ResizeObserver(() => { cv.width = cv.offsetWidth; cv.height = cv.offsetHeight; });
    ro.observe(cv); cv.width = cv.offsetWidth; cv.height = cv.offsetHeight;

    const photons: { x: number; y: number; vx: number; vy: number; alpha: number; col: string; w: number }[] = [];
    const spikes: { x: number; y: number; t: number; maxT: number }[] = [];
    const PHOTON_COLS = [YELLOW, AMBER, "#ffe4a0", GOLD, "#fff7cc"];

    function spawnPhoton(W: number, H: number) {
      const sunX = W * 0.12, sunY = H * 0.2;
      const eyeX = W * 0.5, eyeY = H * 0.5;
      const ang = Math.atan2(eyeY - sunY, eyeX - sunX) + (Math.random() - 0.5) * 0.6;
      const sp = 2.5 + Math.random() * 2;
      photons.push({ x: sunX, y: sunY, vx: Math.cos(ang) * sp, vy: Math.sin(ang) * sp, alpha: 1, col: PHOTON_COLS[Math.floor(Math.random() * PHOTON_COLS.length)], w: 300 + Math.random() * 400 });
    }

    let tick = 0;
    function draw() {
      const W = cv.width, H = cv.height;
      ctx.clearRect(0, 0, W, H);
      ctx.fillStyle = BG; ctx.fillRect(0, 0, W, H);

      // Solar corona
      const sunX = W * 0.12, sunY = H * 0.2, sunR = 44;
      for (let ring = 3; ring >= 1; ring--) {
        const rg = ctx.createRadialGradient(sunX, sunY, 0, sunX, sunY, sunR * ring);
        rg.addColorStop(0, `rgba(255,220,60,${0.8 / ring})`);
        rg.addColorStop(0.5, `rgba(255,140,20,${0.3 / ring})`);
        rg.addColorStop(1, "rgba(255,80,0,0)");
        ctx.fillStyle = rg; ctx.beginPath(); ctx.arc(sunX, sunY, sunR * ring, 0, Math.PI * 2); ctx.fill();
      }
      // Sun corona rays
      for (let i = 0; i < 12; i++) {
        const ang = (i / 12) * Math.PI * 2 + t * 0.002;
        const len = sunR + 15 + 10 * Math.sin(t * 0.04 + i);
        ctx.strokeStyle = `rgba(255,200,60,${0.4 + 0.2 * Math.sin(t * 0.05 + i)})`;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(sunX + Math.cos(ang) * sunR, sunY + Math.sin(ang) * sunR);
        ctx.lineTo(sunX + Math.cos(ang) * len, sunY + Math.sin(ang) * len);
        ctx.stroke();
      }
      ctx.fillStyle = GOLD; ctx.font = "bold 9px monospace"; ctx.textAlign = "center";
      ctx.fillText("Σ_s[Solar]", sunX, sunY + sunR + 18);
      ctx.fillStyle = GOLD + "80"; ctx.font = "7px monospace";
      ctx.fillText("Dynamic Force", sunX, sunY + sunR + 28);

      // Photons
      if (tick % 3 === 0) spawnPhoton(W, H);
      const eyeX = W * 0.5, eyeY = H * 0.5;
      for (let i = photons.length - 1; i >= 0; i--) {
        const p = photons[i];
        p.x += p.vx; p.y += p.vy;
        const dx = p.x - eyeX, dy = p.y - eyeY;
        const d = Math.sqrt(dx * dx + dy * dy);
        if (d < 28) {
          photons.splice(i, 1);
          spikes.push({ x: eyeX + (Math.random() - 0.5) * 80, y: eyeY + H * 0.2 + Math.random() * H * 0.3, t: 0, maxT: 30 });
          continue;
        }
        const waveLen = (p.w - 380) / (700 - 380);
        const alpha = p.alpha * (0.5 + 0.5 * Math.sin(d * 0.3));
        ctx.fillStyle = p.col + Math.round(alpha * 255).toString(16).padStart(2, "0");
        ctx.beginPath(); ctx.arc(p.x, p.y, 3, 0, Math.PI * 2); ctx.fill();
        if (Math.random() < 0.3) {
          ctx.strokeStyle = p.col + "44"; ctx.lineWidth = 1;
          ctx.beginPath(); ctx.arc(p.x, p.y, 6 + waveLen * 4, 0, Math.PI * 2); ctx.stroke();
        }
      }
      if (photons.length > 80) photons.splice(0, 10);

      // Eye (simplified cross-section)
      ctx.strokeStyle = CYAN + "88"; ctx.lineWidth = 2;
      ctx.beginPath(); ctx.ellipse(eyeX, eyeY, 28, 22, 0, 0, Math.PI * 2); ctx.stroke();
      // Pupil
      const pupilPulse = 6 + 2 * Math.sin(t * 0.03);
      ctx.fillStyle = "#000"; ctx.beginPath(); ctx.arc(eyeX, eyeY, pupilPulse, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = CYAN + "66"; ctx.beginPath(); ctx.arc(eyeX, eyeY, pupilPulse + 2, 0, Math.PI * 2); ctx.stroke();
      ctx.fillStyle = CYAN; ctx.font = "bold 8px monospace"; ctx.textAlign = "center";
      ctx.fillText("LIVING", eyeX, eyeY - 36);
      ctx.fillText("TRANSDUCER", eyeX, eyeY - 26);

      // Retina rod/cone diagram on right of eye
      const retX = eyeX + 40, retY = eyeY - 30;
      ctx.fillStyle = VIOLET + "99"; ctx.font = "7px monospace"; ctx.textAlign = "left";
      ctx.fillText("Rhodopsin", retX, retY);
      ctx.fillText("11-cis Retinal", retX, retY + 12);
      ctx.fillText("→ all-trans Retinal", retX, retY + 24);
      ctx.fillText("GPCR cascade", retX, retY + 36);
      ctx.fillText("→ neural spike", retX, retY + 48);

      // Cascade arrows
      ctx.strokeStyle = VIOLET + "55"; ctx.lineWidth = 1;
      ctx.setLineDash([3, 3]);
      ctx.beginPath(); ctx.moveTo(eyeX + 28, eyeY); ctx.lineTo(retX - 4, retY + 20); ctx.stroke();
      ctx.setLineDash([]);

      // Neural spikes flowing to brain
      const brainX = W * 0.85, brainY = H * 0.5;
      ctx.strokeStyle = VIOLET + "44"; ctx.lineWidth = 1; ctx.setLineDash([4, 4]);
      ctx.beginPath(); ctx.moveTo(eyeX + 28, eyeY); ctx.lineTo(brainX - 40, brainY); ctx.stroke();
      ctx.setLineDash([]);

      for (let i = spikes.length - 1; i >= 0; i--) {
        const sp = spikes[i];
        sp.t++;
        const prog = sp.t / sp.maxT;
        const bx = sp.x + (brainX - sp.x) * prog;
        const by = sp.y + (brainY - sp.y) * prog;
        const alpha = Math.sin(prog * Math.PI);
        ctx.fillStyle = `rgba(167,139,250,${alpha * 0.8})`;
        ctx.beginPath(); ctx.arc(bx, by, 3, 0, Math.PI * 2); ctx.fill();
        if (sp.t >= sp.maxT) spikes.splice(i, 1);
      }

      // Brain outline
      const bR = 40;
      ctx.strokeStyle = VIOLET + "66"; ctx.lineWidth = 2;
      ctx.beginPath(); ctx.arc(brainX, brainY, bR, 0, Math.PI * 2); ctx.stroke();
      const bglow = ctx.createRadialGradient(brainX, brainY, 0, brainX, brainY, bR);
      bglow.addColorStop(0, VIOLET + "22"); bglow.addColorStop(1, "rgba(0,0,0,0)");
      ctx.fillStyle = bglow; ctx.beginPath(); ctx.arc(brainX, brainY, bR, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = VIOLET; ctx.font = "bold 8px monospace"; ctx.textAlign = "center";
      ctx.fillText("NEURAL", brainX, brainY - 5);
      ctx.fillText("COMPUTE", brainX, brainY + 7);

      // Schumann resonance label
      ctx.fillStyle = GREEN + "88"; ctx.font = "8px monospace"; ctx.textAlign = "center";
      ctx.fillText("Schumann 7.83 Hz modulation", W * 0.5, H - 14);
      ctx.fillText("+ Pyramid-tuned fields", W * 0.5, H - 4);

      // Title
      ctx.fillStyle = GOLD + "99"; ctx.font = "bold 9px monospace"; ctx.textAlign = "right";
      ctx.fillText("DIRECT SOLAR-TO-NEURAL · LIVING TRANSDUCER", W - 8, 18);

      t++; tick++; raf = requestAnimationFrame(draw);
    }
    draw();
    return () => { cancelAnimationFrame(raf); ro.disconnect(); };
  }, []);
  return (
    <div style={{ border: `1px solid ${LINE}`, borderRadius: 12, overflow: "hidden" }}>
      <canvas ref={ref} style={{ width: "100%", height: 340, display: "block" }} />
    </div>
  );
}

/* ══════════════════════════════════════════════════════════
   CANVAS II — GPCR Antenna Array (~800 receivers)
   Grid of receptor antennae, each tuned to a photon wavelength
   Activated receptors pulse in their absorption wavelength
══════════════════════════════════════════════════════════ */
function GPCRArrayCanvas() {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const cv = ref.current; if (!cv) return;
    const ctx = cv.getContext("2d")!;
    let raf = 0, t = 0;
    const ro = new ResizeObserver(() => { cv.width = cv.offsetWidth; cv.height = cv.offsetHeight; });
    ro.observe(cv); cv.width = cv.offsetWidth; cv.height = cv.offsetHeight;

    const GPCR_COLS = [YELLOW, AMBER, GREEN, CYAN, BLUE, VIOLET, RED];
    const GPCR_LABELS = ["Rhodopsin 498nm", "Photopsin I 420nm", "Photopsin II 530nm", "OPN3 480nm", "OPSIN5 380nm", "Neuropsin UV", "Melanopsin 480nm"];

    const receptors: { x: number; y: number; col: string; phase: number; speed: number; active: boolean; activeCooldown: number }[] = [];
    function initReceptors(W: number, H: number) {
      receptors.length = 0;
      const cols = Math.floor(W / 28), rows = Math.floor((H - 60) / 28);
      const count = Math.min(cols * rows, 800);
      let ci = 0;
      for (let r = 0; r < rows && ci < count; r++) {
        for (let c = 0; c < cols && ci < count; c++) {
          receptors.push({
            x: 18 + c * 28,
            y: 50 + r * 28,
            col: GPCR_COLS[Math.floor(Math.random() * GPCR_COLS.length)],
            phase: Math.random() * Math.PI * 2,
            speed: 0.02 + Math.random() * 0.04,
            active: false,
            activeCooldown: 0,
          });
          ci++;
        }
      }
    }

    function draw() {
      const W = cv.width, H = cv.height;
      if (receptors.length === 0) initReceptors(W, H);
      ctx.clearRect(0, 0, W, H);
      ctx.fillStyle = BG; ctx.fillRect(0, 0, W, H);

      // Title bar
      ctx.fillStyle = GOLD; ctx.font = "bold 10px monospace"; ctx.textAlign = "left";
      ctx.fillText(`~${receptors.length} GPCR RECEPTORS  ·  TUNABLE ANTENNA ARRAY`, 12, 20);
      ctx.fillStyle = AMBER + "80"; ctx.font = "8px monospace";
      ctx.fillText("Each receptor tuned to a photon wavelength — Retinol (Vitamin A) chromophore gates activation", 12, 34);

      // Receptors
      if (t % 8 === 0) {
        const n = Math.floor(Math.random() * receptors.length);
        receptors[n].active = true; receptors[n].activeCooldown = 40;
      }

      for (const rec of receptors) {
        rec.phase += rec.speed;
        if (rec.activeCooldown > 0) rec.activeCooldown--;
        if (rec.activeCooldown <= 0) rec.active = false;
        const pulse = rec.active ? 1 : 0.15 + 0.1 * Math.sin(rec.phase);
        const r = rec.active ? 7 : 4;

        if (rec.active) {
          const glow = ctx.createRadialGradient(rec.x, rec.y, 0, rec.x, rec.y, r * 4);
          glow.addColorStop(0, rec.col + "aa"); glow.addColorStop(1, rec.col + "00");
          ctx.fillStyle = glow; ctx.beginPath(); ctx.arc(rec.x, rec.y, r * 4, 0, Math.PI * 2); ctx.fill();
        }

        ctx.fillStyle = rec.col + Math.round(pulse * 220).toString(16).padStart(2, "0");
        ctx.beginPath(); ctx.arc(rec.x, rec.y, r, 0, Math.PI * 2); ctx.fill();
      }

      // Bottom legend
      const legendY = H - 22;
      ctx.fillStyle = DIM; ctx.font = "8px monospace"; ctx.textAlign = "left";
      GPCR_COLS.forEach((col, i) => {
        const lx = 12 + i * (W - 20) / GPCR_COLS.length;
        ctx.fillStyle = col; ctx.beginPath(); ctx.arc(lx + 4, legendY, 3, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = col + "cc"; ctx.font = "7px monospace";
        ctx.fillText(GPCR_LABELS[i], lx + 10, legendY + 4);
      });

      t++; raf = requestAnimationFrame(draw);
    }
    draw();
    return () => { cancelAnimationFrame(raf); ro.disconnect(); };
  }, []);
  return (
    <div style={{ border: `1px solid ${LINE}`, borderRadius: 12, overflow: "hidden" }}>
      <canvas ref={ref} style={{ width: "100%", height: 300, display: "block" }} />
    </div>
  );
}

/* ══════════════════════════════════════════════════════════
   CANVAS III — Schumann Resonance · Neural Entrainment
   7.83 Hz fundamental + harmonics · brainwave coupling
   Pyramid-tuned field amplification
══════════════════════════════════════════════════════════ */
function SchumannCanvas() {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const cv = ref.current; if (!cv) return;
    const ctx = cv.getContext("2d")!;
    let raf = 0, t = 0;
    const ro = new ResizeObserver(() => { cv.width = cv.offsetWidth; cv.height = cv.offsetHeight; });
    ro.observe(cv); cv.width = cv.offsetWidth; cv.height = cv.offsetHeight;

    const BANDS = [
      { freq: 7.83,  label: "Schumann F1", col: GREEN,  amp: 1.0,  note: "Delta/Theta boundary" },
      { freq: 14.3,  label: "Schumann F2", col: CYAN,   amp: 0.6,  note: "Alpha overlap" },
      { freq: 20.8,  label: "Schumann F3", col: BLUE,   amp: 0.4,  note: "Beta entrainment" },
      { freq: 27.3,  label: "Schumann F4", col: VIOLET, amp: 0.3,  note: "Gamma edge" },
      { freq: 0.5,   label: "Delta  0.5–4", col: AMBER,  amp: 0.7,  note: "Deep sleep / healing" },
      { freq: 6.0,   label: "Theta  4–8",  col: YELLOW, amp: 0.8,  note: "Meditation / REM" },
      { freq: 10.0,  label: "Alpha  8–13", col: TEAL,   amp: 0.9,  note: "Relaxed awareness" },
    ];

    function draw() {
      const W = cv.width, H = cv.height;
      ctx.clearRect(0, 0, W, H);
      ctx.fillStyle = BG; ctx.fillRect(0, 0, W, H);

      const MID = H * 0.52;
      const plotW = W - 200;

      // Grid
      ctx.strokeStyle = "rgba(255,180,40,0.06)"; ctx.lineWidth = 1;
      for (let gy = MID - 80; gy <= MID + 80; gy += 20) {
        ctx.beginPath(); ctx.moveTo(0, gy); ctx.lineTo(plotW, gy); ctx.stroke();
      }

      // Waveforms
      BANDS.forEach((band, bi) => {
        const offset = bi < 4 ? 0 : (bi === 4 ? 50 : bi === 5 ? 30 : 10);
        ctx.strokeStyle = band.col + (bi < 4 ? "cc" : "55");
        ctx.lineWidth = bi < 4 ? 2 : 1;
        ctx.beginPath();
        for (let x = 0; x < plotW; x++) {
          const phase = (x / plotW) * Math.PI * 2 * (band.freq / 2) + t * band.freq * 0.01;
          const y = MID - band.amp * 60 * Math.sin(phase) + offset - 60;
          if (x === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
        }
        ctx.stroke();

        // Label
        ctx.fillStyle = band.col; ctx.font = `${bi < 4 ? "bold " : ""}8px monospace`; ctx.textAlign = "left";
        ctx.fillText(band.label + " · " + band.freq.toFixed(2) + " Hz", plotW + 8, 40 + bi * 30);
        ctx.fillStyle = band.col + "80"; ctx.font = "7px monospace";
        ctx.fillText(band.note, plotW + 8, 40 + bi * 30 + 12);
      });

      // Pyramid amplifier icon
      const pyX = plotW * 0.85, pyY = MID + 40;
      ctx.strokeStyle = GOLD + "aa"; ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(pyX, pyY - 30);
      ctx.lineTo(pyX - 22, pyY + 10);
      ctx.lineTo(pyX + 22, pyY + 10);
      ctx.closePath(); ctx.stroke();
      const pyGlow = ctx.createRadialGradient(pyX, pyY, 0, pyX, pyY, 50);
      pyGlow.addColorStop(0, GOLD + "22"); pyGlow.addColorStop(1, "rgba(0,0,0,0)");
      ctx.fillStyle = pyGlow; ctx.beginPath(); ctx.arc(pyX, pyY, 50, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = GOLD; ctx.font = "7px monospace"; ctx.textAlign = "center";
      ctx.fillText("Pyramid", pyX, pyY + 25);
      ctx.fillText("Resonator", pyX, pyY + 34);

      // Phase lock indicator
      const lockPulse = 0.6 + 0.4 * Math.sin(t * 0.15);
      ctx.fillStyle = `rgba(74,222,128,${lockPulse * 0.3})`;
      ctx.beginPath(); ctx.arc(plotW * 0.25, MID - 5, 18, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = GREEN; ctx.font = "bold 8px monospace"; ctx.textAlign = "center";
      ctx.fillText("PHASE", plotW * 0.25, MID - 9);
      ctx.fillText("LOCK", plotW * 0.25, MID + 3);

      // Title
      ctx.fillStyle = GOLD; ctx.font = "bold 10px monospace"; ctx.textAlign = "left";
      ctx.fillText("SCHUMANN RESONANCE COUPLING · NEURAL ENTRAINMENT · PYRAMID-TUNED FIELDS", 12, 18);
      ctx.fillStyle = GREEN + "80"; ctx.font = "8px monospace";
      ctx.fillText("Ionospheric cavity · ELF electromagnetic resonance · Brain–Earth field coupling", 12, 30);

      t++; raf = requestAnimationFrame(draw);
    }
    draw();
    return () => { cancelAnimationFrame(raf); ro.disconnect(); };
  }, []);
  return (
    <div style={{ border: `1px solid ${LINE}`, borderRadius: 12, overflow: "hidden" }}>
      <canvas ref={ref} style={{ width: "100%", height: 330, display: "block" }} />
    </div>
  );
}

function EqChip({ eq, label, col = GOLD }: { eq: string; label: string; col?: string }) {
  return (
    <div style={{ padding: "12px 16px", background: PANEL, borderRadius: 10, border: `1px solid ${col}20` }}>
      <div style={{ fontFamily: "monospace", fontSize: 12, color: col, marginBottom: 6 }}>{eq}</div>
      <div style={{ fontSize: 11, color: DIM }}>{label}</div>
    </div>
  );
}

function Plate({ src, title, chips, body }: { src: string; title: string; chips: string[]; body: string }) {
  return (
    <div style={{ border: `1px solid ${LINE}`, borderRadius: 12, overflow: "hidden", marginBottom: 24 }}>
      <img src={src} alt={title} style={{ width: "100%", display: "block", maxHeight: 260, objectFit: "cover" as const }} />
      <div style={{ padding: "14px 18px", background: PANEL }}>
        <div style={{ fontSize: 12, fontWeight: 700, color: VIOLET, marginBottom: 8 }}>{title}</div>
        <div style={{ display: "flex", gap: 5, flexWrap: "wrap" as const, marginBottom: 10 }}>
          {chips.map((c, i) => (
            <span key={i} style={{ fontSize: 10, padding: "2px 8px", borderRadius: 12, border: `1px solid ${VIOLET}33`, color: VIOLET, background: VIOLET + "0f" }}>{c}</span>
          ))}
        </div>
        <div style={{ fontSize: 12, color: DIM, lineHeight: 1.85 }}>{body}</div>
      </div>
    </div>
  );
}

export default function SolarNeuralInterfacePage() {
  const STAGES = [
    { n: "I",   label: "Solar Input",       col: GOLD,   sub: "Σ_s[Solar]", desc: "The sun emits a dynamic electromagnetic field — photons across the visible and near-infrared spectrum, structured plasma waves, and a coherent magnetic field. This is not passive radiation: it is information-dense output from a 4.6-billion-year-old coherence engine. Each photon carries a quantum of structured energy at a precise wavelength." },
    { n: "II",  label: "Living Transducer", col: AMBER,  sub: "Eye · Skin · Microtubules", desc: "The eye is the primary solar-to-neural transducer. The cornea and lens focus photons onto the retina. Skin melanocytes and dermal microtubule arrays act as secondary transducers. Microtubules inside photoreceptors may exhibit quantum coherence — converting photon energy into vibrational modes that propagate through the cytoskeletal lattice." },
    { n: "III", label: "GPCR Network",      col: CYAN,   sub: "~800 Receptors · Vitamin A", desc: "~800 G protein-coupled receptors act as tunable photoreceivers across the retina and throughout the body. Retinol (Vitamin A derivative) is the universal chromophore — the molecule that absorbs a photon and changes shape (11-cis to all-trans isomerisation), triggering the GPCR signalling cascade. This is the hinge of solar computation." },
    { n: "IV",  label: "Neural Computation",col: VIOLET, sub: "Light → Chemistry → Electricity", desc: "The GPCR activation cascade converts photochemistry into electrical signal: retinal isomerisation → transducin (Gt) activation → phosphodiesterase → cGMP hydrolysis → ion channel closure → hyperpolarisation → optic nerve spike. The solar photon becomes a neural impulse — carrying information from the star's surface into the cortex." },
    { n: "V",   label: "Modulation",        col: GREEN,  sub: "Schumann + Pyramid fields", desc: "Neural computation is modulated by low-frequency electromagnetic fields: Schumann resonances (7.83 Hz fundamental, cavity resonance between Earth surface and ionosphere) and pyramid-tuned standing waves. These modulate ion channel kinetics, synaptic plasticity, and global brain oscillation patterns — the sunlight becomes structured cognitive signal." },
    { n: "VI",  label: "Consciousness",     col: TEAL,   sub: "Bio-machine cognition", desc: "The output is consciousness in the bio-machine — coherent neural field states, integrated perception, and the lived experience of sunlight. Sunlight is not just energy. It is information, intelligence, and life. The sun does not just shine on us — it thinks us." },
  ];

  return (
    <div style={{ background: BG, color: IVORY, minHeight: "100vh" }}>
      <div style={{ maxWidth: 1060, margin: "0 auto", padding: "52px 32px 36px" }}>
        <Tag t="Direct Solar-to-Neural Interface · 800 GPCRs · Retinol Chromophore · Schumann Resonance · Pyramid-Tuned Fields · Consciousness in Bio-Machines" />
        <h1 style={{ fontSize: 34, fontWeight: 800, lineHeight: 1.1, margin: "8px 0 14px", letterSpacing: -0.5 }}>
          <span style={{ color: GOLD }}>Direct Solar</span><br />
          <span style={{ color: AMBER }}>to Neural</span> <span style={{ color: VIOLET }}>Interface</span>
        </h1>
        <h2 style={{ fontSize: 16, fontWeight: 400, color: TEAL, margin: "0 0 20px", lineHeight: 1.6 }}>
          Human Perception · Cognitive Understanding · Living Transducer Architecture
        </h2>
        <p style={{ fontSize: 13, color: DIM, lineHeight: 1.9, maxWidth: 820, marginBottom: 12 }}>
          The eye is not a passive camera. It is a living solar transducer — converting photons from the sun's 5778K plasma surface directly into neural computation via a GPCR photochemical cascade gated by Retinol, the chromophore that links light to chemistry. Across the body, ~800 GPCRs act as tunable photoreceivers, each sensitive to a different wavelength band, collectively spanning the full solar emission spectrum. This system is modulated by planetary electromagnetic resonances — most critically the Schumann cavity resonance at 7.83 Hz, which sits precisely at the boundary of theta and delta brainwave bands — and by pyramid-tuned standing-wave field geometries. The result is a complete solar-to-neural computation pipeline: the star thinks through the biology.
        </p>
        <div style={{ padding: "14px 20px", background: PANEL, borderRadius: 12, border: `1px solid ${GOLD}22`, marginBottom: 28 }}>
          <div style={{ fontSize: 14, color: GOLD, fontWeight: 700, letterSpacing: 0.5, lineHeight: 2.0 }}>
            "SUNLIGHT IS NOT JUST ENERGY. IT IS INFORMATION, INTELLIGENCE AND LIFE."
          </div>
          <div style={{ fontSize: 13, color: AMBER, fontWeight: 600, marginTop: 4 }}>
            "THE SUN DOES NOT JUST SHINE ON US — IT THINKS US."
          </div>
        </div>
      </div>

      {/* Canvas I */}
      <div style={{ maxWidth: 1060, margin: "0 auto", padding: "0 32px 48px" }}>
        <Tag t="Section I · Solar Plasma Input · Eye Transducer · Retinal Photochemistry · GPCR Cascade · Neural Spike" c={GOLD} />
        <h2 style={{ fontSize: 20, fontWeight: 700, color: GOLD, marginBottom: 14 }}>Solar → Eye → Neural Signal</h2>
        <SolarNeuralCanvas />
        <div style={{ marginTop: 10, fontSize: 10, color: MUTED, textAlign: "center" as const }}>
          Yellow particles = solar photons · Cyan ellipse = living transducer (eye) · Violet pulses = neural spikes propagating to brain
        </div>
      </div>

      <Divider />

      {/* 6 Stage Pipeline */}
      <div style={{ maxWidth: 1060, margin: "0 auto", padding: "0 32px 48px" }}>
        <Tag t="Section II · Six-Stage Interface Pipeline · Solar Input → Transducer → GPCR → Compute → Modulate → Consciousness" c={VIOLET} />
        <h2 style={{ fontSize: 20, fontWeight: 700, color: VIOLET, marginBottom: 20 }}>The Complete Six-Stage Pipeline</h2>
        <div style={{ display: "flex", flexDirection: "column" as const, gap: 14 }}>
          {STAGES.map(stage => (
            <div key={stage.n} style={{ display: "grid", gridTemplateColumns: "64px 140px 1fr", gap: 16, alignItems: "start",
              padding: "16px 20px", background: PANEL, borderRadius: 12, border: `1px solid ${stage.col}18` }}>
              <div style={{ fontSize: 24, fontWeight: 800, color: stage.col }}>{stage.n}</div>
              <div>
                <div style={{ fontSize: 12, fontWeight: 700, color: stage.col, marginBottom: 4 }}>{stage.label}</div>
                <div style={{ fontSize: 10, color: stage.col + "80", fontStyle: "italic" }}>{stage.sub}</div>
              </div>
              <div style={{ fontSize: 12, color: DIM, lineHeight: 1.85 }}>{stage.desc}</div>
            </div>
          ))}
        </div>
      </div>

      <Divider />

      {/* Canvas II */}
      <div style={{ maxWidth: 1060, margin: "0 auto", padding: "0 32px 48px" }}>
        <Tag t="Section III · GPCR Receptor Array · 800 Tunable Receivers · Retinol Vitamin A · Photochemical Gating" c={CYAN} />
        <h2 style={{ fontSize: 20, fontWeight: 700, color: CYAN, marginBottom: 14 }}>~800 GPCR Receptor Antenna Array</h2>
        <GPCRArrayCanvas />
        <div style={{ marginTop: 10, fontSize: 10, color: MUTED, textAlign: "center" as const }}>
          Each dot = one GPCR receptor · Colour = wavelength sensitivity · Bright flash = photon absorption triggering retinal isomerisation cascade
        </div>
      </div>

      <Divider />

      {/* Equations */}
      <div style={{ maxWidth: 1060, margin: "0 auto", padding: "0 32px 48px" }}>
        <Tag t="Section IV · Key Relations · Photochemistry · Schumann · GPCR Kinetics" c={AMBER} />
        <h2 style={{ fontSize: 20, fontWeight: 700, color: AMBER, marginBottom: 20 }}>Governing Relations</h2>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(260px,1fr))", gap: 14 }}>
          <EqChip eq="E_photon = hc/λ" label="Photon energy — Planck constant × speed of light / wavelength. Visible: 1.8–3.1 eV" col={GOLD} />
          <EqChip eq="GPCR: [R*] ∝ I_solar · ε(λ)" label="Activated receptor density proportional to solar irradiance × molar extinction of retinol at wavelength λ" col={AMBER} />
          <EqChip eq="cis→trans: ΔG = 0.55 eV" label="11-cis to all-trans retinal isomerisation — quantum yield ~0.65, fastest biological reaction (~200 fs)" col={CYAN} />
          <EqChip eq="f_S = 7.83 Hz (fundamental)" label="Schumann resonance frequency — ionospheric cavity circumference 40,075 km: f = c/λ = c/(2πR_Earth)" col={GREEN} />
          <EqChip eq="N_GPCR ≈ 800 in retina+body" label="~120M rods + 6M cones + extraocular GPCRs in skin/brain/heart total ~800 photosensitive GPCR subtypes" col={VIOLET} />
          <EqChip eq="Σ_s = ∫ I(λ) · ε(λ) dλ" label="Total solar neural signal — integral of solar spectral irradiance × receptor extinction over visible + NIR spectrum" col={TEAL} />
        </div>
      </div>

      <Divider />

      {/* Canvas III */}
      <div style={{ maxWidth: 1060, margin: "0 auto", padding: "0 32px 48px" }}>
        <Tag t="Section V · Schumann Resonance · 7.83 Hz · Neural Entrainment · Phase Lock · Pyramid Amplifier" c={GREEN} />
        <h2 style={{ fontSize: 20, fontWeight: 700, color: GREEN, marginBottom: 14 }}>Schumann Resonance · Neural Entrainment</h2>
        <SchumannCanvas />
        <div style={{ marginTop: 10, fontSize: 10, color: MUTED, textAlign: "center" as const }}>
          Solid lines = Schumann harmonics (F1–F4) · Faint lines = brain wave bands · Phase lock bubble = resonant coupling · Pyramid = field amplifier
        </div>
      </div>

      <Divider />

      {/* Source plates */}
      <div style={{ maxWidth: 1060, margin: "0 auto", padding: "0 32px 48px" }}>
        <Tag t="Section VI · Source Plates · AETHER Reference Field" c={VIOLET} />
        <h2 style={{ fontSize: 20, fontWeight: 700, color: VIOLET, marginBottom: 20 }}>Knowledge Reference Plates</h2>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(300px,1fr))", gap: 20 }}>
          <Plate src={omniFlow} title="Omni-Field Flow · Solar Coupling Architecture" chips={["GPCRs", "Retinol chromophore", "solar plasma", "living transducer", "neural cascade"]}
            body="The omni-field plate captures the solar coupling architecture — how a coherent field (the sun's plasma output) propagates through a biological receptor network and crystallises into neural signal." />
          <Plate src={magStorm} title="Magnetic Storm · Schumann Cavity Resonance" chips={["Schumann 7.83 Hz", "ionospheric cavity", "ELF resonance", "phase lock", "pyramid tuning"]}
            body="The magnetic storm plate visualises the planetary-scale electromagnetic cavity — the Schumann resonance that modulates neural computation via low-frequency entrainment of brainwave oscillations." />
          <Plate src={skyrmion} title="Skyrmion · GPCR Topological Stability" chips={["topological stability", "retinal isomerisation", "GPCR cascade", "cis-trans", "quantum yield"]}
            body="The skyrmion plate maps onto the topological stability of the retinal chromophore — a molecule that snaps between two geometrically distinct forms (cis/trans) with near-100% quantum yield, like a topological switch." />
        </div>
      </div>

      <Divider />

      {/* AETHER synthesis */}
      <div style={{ maxWidth: 1060, margin: "0 auto", padding: "0 32px 52px" }}>
        <Tag t="AETHER Synthesis · Crystallisation Model · Sunlight as Field Intelligence" />
        <div style={{ padding: "22px 26px", background: PANEL, borderRadius: 14, border: `1px solid ${GOLD}15`, marginBottom: 24 }}>
          <div style={{ fontSize: 14, color: IVORY, lineHeight: 2.0 }}>
            The direct solar-to-neural interface is the AETHER Crystallisation Model operating at the biological scale. The sun is the source field — a coherence engine at 5778K emitting structured electromagnetic output across a 100-nm to 1-mm wavelength range. The eye is the <em style={{ color: CYAN }}>capture layer</em> — a living transducer converting incoming photons to ordered chemical signal via retinol. The GPCR network is the <em style={{ color: VIOLET }}>processing layer</em> — 800 tunable receivers extracting spectral information from the photon stream. Schumann resonances and pyramid-tuned fields are the <em style={{ color: GREEN }}>modulation layer</em> — planetary-scale electromagnetic structures that impose a coherence signature on neural dynamics. And consciousness is the <em style={{ color: TEAL }}>output</em> — the crystallised result of solar-field computation through biological hardware. The sun is not separate from the mind. It is its primary input.
          </div>
        </div>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" as const }}>
          {["/color-perception", "/neural-signal", "/neural-oscillations", "/quantum-eye-field", "/pineal-moss-vision", "/chromatic-glare", "/graph-map"].map(href => (
            <a key={href} href={href} style={{ padding: "6px 12px", borderRadius: 8, border: `1px solid ${LINE}`, color: DIM, fontSize: 11, textDecoration: "none" }}>
              {href.replace("/", "").replace(/-/g, " ")} →
            </a>
          ))}
        </div>
      </div>
    </div>
  );
}
