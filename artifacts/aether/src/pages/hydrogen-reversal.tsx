/*═══════════════════════════════════════════════════════════════
  Hydrogen Reversal · Antihydrogen · Coherence Engine
  Matter & Antimatter Inversion · CPT Symmetry
  Multiple domains: Chemical · Quantum · Nuclear · Cosmological

  Source: chatgpt.com/share/6a5fbe6e

  Three canvases:
  I.  H vs Antihydrogen — Event Horizon between matter/antimatter
  II. CPT Symmetry Trio — Charge conjugation / Parity / Time
  III.Coherence Engine Field — C(x,t) across H/H̄ boundary
═══════════════════════════════════════════════════════════════*/
import { useRef, useEffect } from "react";
const omniFlow = "/api/storage/public-objects/72D555D1-E91E-4B74-A73B-4628B8538AA1_1784561445345.png";
const magStorm = "/api/storage/public-objects/A6805E91-9684-4C59-BFC8-482EF421381D_1784561445345.png";
const skyrmion = "/api/storage/public-objects/IMG_4534_1784561445345.png";
const BG = "#040208";
const PANEL = "#080512";
const IVORY = "#f0eeff";
const DIM = "rgba(240,238,255,0.52)";
const MUTED = "rgba(240,238,255,0.26)";
const LINE = "rgba(120,80,255,0.10)";
const GOLD = "#f5c84c";
const CYAN = "#22d3ee";
const VIOLET = "#a78bfa";
const BLUE = "#60a5fa";
const RED = "#f87171";
const GREEN = "#4ade80";
const ORANGE = "#fb923c";
const WHITE = "#e0d8ff";
const TEAL = "#2dd4bf";

function Tag({ t, c = VIOLET }: { t: string; c?: string }) {
  return <div style={{ fontSize: 9, fontWeight: 700, color: c, letterSpacing: 2, textTransform: "uppercase" as const, marginBottom: 10 }}>{t}</div>;
}
function Divider() { return <div style={{ height: 1, background: LINE, margin: "44px 0" }} />; }

/* ══════════════════════════════════════════════════════════
   CANVAS I — H vs Antihydrogen
   Left: Hydrogen — blue electron orbiting red proton
   Right: Antihydrogen — red positron orbiting blue antiproton
   Centre: Event Horizon with annihilation glow
   +Energy/▲Frequency left, -Energy/▼Frequency right
══════════════════════════════════════════════════════════ */
function HAntiHCanvas() {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const cv = ref.current; if (!cv) return;
    const ctx = cv.getContext("2d")!;
    let raf = 0, t = 0;
    const ro = new ResizeObserver(() => { cv.width = cv.offsetWidth; cv.height = cv.offsetHeight; });
    ro.observe(cv); cv.width = cv.offsetWidth; cv.height = cv.offsetHeight;

    function draw() {
      const W = cv.width, H = cv.height;
      ctx.clearRect(0, 0, W, H);
      ctx.fillStyle = BG; ctx.fillRect(0, 0, W, H);

      const cx = W * 0.5, cy = H * 0.5;
      const hx = W * 0.25, ahx = W * 0.75;
      const R_orb = Math.min(W, H) * 0.17;
      const R_nuc = 10;

      // Left: Hydrogen — Normal Reality
      const hBg = ctx.createRadialGradient(hx, cy, 0, hx, cy, R_orb * 1.8);
      hBg.addColorStop(0, "rgba(96,165,250,0.12)"); hBg.addColorStop(1, "rgba(0,0,0,0)");
      ctx.fillStyle = hBg; ctx.beginPath(); ctx.arc(hx, cy, R_orb * 1.8, 0, Math.PI * 2); ctx.fill();

      // Orbit ring
      ctx.strokeStyle = CYAN + "33"; ctx.lineWidth = 1;
      ctx.beginPath(); ctx.arc(hx, cy, R_orb, 0, Math.PI * 2); ctx.stroke();

      // Proton (red nucleus)
      const pGlow = ctx.createRadialGradient(hx, cy, 0, hx, cy, R_nuc * 3);
      pGlow.addColorStop(0, "rgba(248,113,113,0.6)"); pGlow.addColorStop(1, "rgba(0,0,0,0)");
      ctx.fillStyle = pGlow; ctx.beginPath(); ctx.arc(hx, cy, R_nuc * 3, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = RED; ctx.beginPath(); ctx.arc(hx, cy, R_nuc, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = WHITE; ctx.font = "bold 8px monospace"; ctx.textAlign = "center";
      ctx.fillText("p⁺", hx, cy + 3);

      // Electron (blue)
      const eAng = t * 0.04;
      const ex = hx + R_orb * Math.cos(eAng), ey = cy + R_orb * Math.sin(eAng) * 0.4;
      const eGlow = ctx.createRadialGradient(ex, ey, 0, ex, ey, 8);
      eGlow.addColorStop(0, "rgba(96,165,250,0.8)"); eGlow.addColorStop(1, "rgba(0,0,0,0)");
      ctx.fillStyle = eGlow; ctx.beginPath(); ctx.arc(ex, ey, 8, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = BLUE; ctx.beginPath(); ctx.arc(ex, ey, 4, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = WHITE; ctx.font = "bold 7px monospace";
      ctx.fillText("e⁻", ex, ey + 3);

      // Label
      ctx.fillStyle = BLUE; ctx.font = "bold 12px monospace"; ctx.textAlign = "center";
      ctx.fillText("HYDROGEN", hx, cy - R_orb - 30);
      ctx.fillStyle = BLUE + "80"; ctx.font = "8px monospace";
      ctx.fillText("Matter · Normal Reality", hx, cy - R_orb - 18);
      ctx.fillStyle = GREEN; ctx.font = "9px monospace";
      ctx.fillText("+ Energy · ▲ Frequency", hx, cy + R_orb + 22);
      ctx.fillStyle = BLUE + "60"; ctx.font = "8px monospace";
      ctx.fillText("1 proton + 1 electron", hx, cy + R_orb + 36);

      // Right: Antihydrogen — Mirror Reality
      const ahBg = ctx.createRadialGradient(ahx, cy, 0, ahx, cy, R_orb * 1.8);
      ahBg.addColorStop(0, "rgba(248,113,113,0.12)"); ahBg.addColorStop(1, "rgba(0,0,0,0)");
      ctx.fillStyle = ahBg; ctx.beginPath(); ctx.arc(ahx, cy, R_orb * 1.8, 0, Math.PI * 2); ctx.fill();

      ctx.strokeStyle = RED + "33"; ctx.lineWidth = 1;
      ctx.beginPath(); ctx.arc(ahx, cy, R_orb, 0, Math.PI * 2); ctx.stroke();

      // Antiproton (blue nucleus)
      const apGlow = ctx.createRadialGradient(ahx, cy, 0, ahx, cy, R_nuc * 3);
      apGlow.addColorStop(0, "rgba(96,165,250,0.6)"); apGlow.addColorStop(1, "rgba(0,0,0,0)");
      ctx.fillStyle = apGlow; ctx.beginPath(); ctx.arc(ahx, cy, R_nuc * 3, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = BLUE; ctx.beginPath(); ctx.arc(ahx, cy, R_nuc, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = WHITE; ctx.font = "bold 8px monospace"; ctx.textAlign = "center";
      ctx.fillText("p̄", ahx, cy + 3);

      // Positron (red) — orbits opposite direction
      const posAng = -t * 0.04;
      const posx = ahx + R_orb * Math.cos(posAng), posy = cy + R_orb * Math.sin(posAng) * 0.4;
      const posGlow = ctx.createRadialGradient(posx, posy, 0, posx, posy, 8);
      posGlow.addColorStop(0, "rgba(248,113,113,0.8)"); posGlow.addColorStop(1, "rgba(0,0,0,0)");
      ctx.fillStyle = posGlow; ctx.beginPath(); ctx.arc(posx, posy, 8, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = RED; ctx.beginPath(); ctx.arc(posx, posy, 4, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = WHITE; ctx.font = "bold 7px monospace";
      ctx.fillText("e⁺", posx, posy + 3);

      // Label
      ctx.fillStyle = RED; ctx.font = "bold 12px monospace"; ctx.textAlign = "center";
      ctx.fillText("ANTIHYDROGEN", ahx, cy - R_orb - 30);
      ctx.fillStyle = RED + "80"; ctx.font = "8px monospace";
      ctx.fillText("Antimatter · Mirror Reality", ahx, cy - R_orb - 18);
      ctx.fillStyle = RED; ctx.font = "9px monospace";
      ctx.fillText("- Energy · ▼ Frequency", ahx, cy + R_orb + 22);
      ctx.fillStyle = RED + "60"; ctx.font = "8px monospace";
      ctx.fillText("1 antiproton + 1 positron", ahx, cy + R_orb + 36);

      // Event Horizon
      const ehPulse = 0.6 + 0.4 * Math.sin(t * 0.07);
      const ehGrad = ctx.createLinearGradient(cx - 20, 0, cx + 20, 0);
      ehGrad.addColorStop(0, `rgba(96,165,250,${ehPulse * 0.5})`);
      ehGrad.addColorStop(0.5, `rgba(255,255,255,${ehPulse * 0.8})`);
      ehGrad.addColorStop(1, `rgba(248,113,113,${ehPulse * 0.5})`);
      ctx.fillStyle = ehGrad; ctx.fillRect(cx - 3, H * 0.12, 6, H * 0.76);

      // Annihilation glow at event horizon centre
      const annGlow = ctx.createRadialGradient(cx, cy, 0, cx, cy, 40);
      annGlow.addColorStop(0, `rgba(255,240,200,${ehPulse * 0.6})`);
      annGlow.addColorStop(0.5, `rgba(255,180,60,${ehPulse * 0.2})`);
      annGlow.addColorStop(1, "rgba(0,0,0,0)");
      ctx.fillStyle = annGlow; ctx.beginPath(); ctx.arc(cx, cy, 40, 0, Math.PI * 2); ctx.fill();

      // Event Horizon label
      ctx.fillStyle = GOLD; ctx.font = "bold 9px monospace"; ctx.textAlign = "center";
      ctx.fillText("EVENT", cx, cy - 12);
      ctx.fillText("HORIZON", cx, cy);
      ctx.fillStyle = GOLD + "80"; ctx.font = "7px monospace";
      ctx.fillText("γ → e⁻ + e⁺", cx, cy + 14);

      // Title
      ctx.fillStyle = VIOLET; ctx.font = "bold 10px monospace"; ctx.textAlign = "center";
      ctx.fillText("COHERENCE ENGINE · HYDROGEN REVERSED : ANTIHYDROGEN · MATTER & ANTIMATTER INVERSION", cx, H - 12);

      t++; raf = requestAnimationFrame(draw);
    }
    draw();
    return () => { cancelAnimationFrame(raf); ro.disconnect(); };
  }, []);
  return (
    <div style={{ border: `1px solid ${LINE}`, borderRadius: 12, overflow: "hidden" }}>
      <canvas ref={ref} style={{ width: "100%", height: 360, display: "block" }} />
    </div>
  );
}

/* ══════════════════════════════════════════════════════════
   CANVAS II — CPT Symmetry Trio
   Three operations shown on H atom:
   C (Charge conjugation) H → H̄
   P (Parity inversion) mirror flip
   T (Time reversal) backwards propagation
══════════════════════════════════════════════════════════ */
function CPTCanvas() {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const cv = ref.current; if (!cv) return;
    const ctx = cv.getContext("2d")!;
    let raf = 0, t = 0;
    const ro = new ResizeObserver(() => { cv.width = cv.offsetWidth; cv.height = cv.offsetHeight; });
    ro.observe(cv); cv.width = cv.offsetWidth; cv.height = cv.offsetHeight;

    const OPS = [
      { label: "C",  name: "CHARGE CONJUGATION",  col: BLUE,   desc: "p⁺→p̄  e⁻→e⁺",  sub: "H → H̄" },
      { label: "P",  name: "PARITY INVERSION",     col: VIOLET, desc: "x→-x  mirror",   sub: "spatial flip" },
      { label: "T",  name: "TIME REVERSAL",        col: RED,    desc: "t→-t  |ψ⟩→|ψ*⟩", sub: "clock backwards" },
    ];

    function draw() {
      const W = cv.width, H = cv.height;
      ctx.clearRect(0, 0, W, H);
      ctx.fillStyle = BG; ctx.fillRect(0, 0, W, H);

      const panelW = W / 3;

      OPS.forEach((op, i) => {
        const px = i * panelW + panelW * 0.5;
        const py = H * 0.5;
        const R = Math.min(panelW, H) * 0.24;

        // Panel background
        const pbg = ctx.createRadialGradient(px, py, 0, px, py, R * 2);
        pbg.addColorStop(0, op.col + "10"); pbg.addColorStop(1, op.col + "00");
        ctx.fillStyle = pbg; ctx.fillRect(i * panelW, 0, panelW, H);

        // Divider
        if (i > 0) {
          ctx.strokeStyle = LINE; ctx.lineWidth = 1;
          ctx.beginPath(); ctx.moveTo(i * panelW, 0); ctx.lineTo(i * panelW, H); ctx.stroke();
        }

        // Operation badge
        ctx.fillStyle = op.col; ctx.font = "bold 36px monospace"; ctx.textAlign = "center";
        ctx.fillText(op.label, px, 52);
        ctx.fillStyle = op.col + "80"; ctx.font = "bold 8px monospace";
        ctx.fillText(op.name, px, 66);

        // Animated particle transformation
        const ang = t * 0.04;

        if (i === 0) {
          // C: proton turns antiproton (red → blue), electron turns positron (blue → red)
          const swapProg = (Math.sin(t * 0.02) + 1) * 0.5;
          const nucCol = `rgba(${Math.round(248 - 152 * swapProg)}, ${Math.round(113 + 52 * swapProg)}, ${Math.round(113 + 137 * swapProg)}, 0.9)`;
          const elCol = `rgba(${Math.round(96 + 152 * swapProg)}, ${Math.round(165 - 52 * swapProg)}, ${Math.round(250 - 137 * swapProg)}, 0.9)`;
          ctx.fillStyle = nucCol; ctx.beginPath(); ctx.arc(px, py, 10, 0, Math.PI * 2); ctx.fill();
          const eAx = px + R * Math.cos(ang), eAy = py + R * Math.sin(ang) * 0.5;
          ctx.fillStyle = elCol; ctx.beginPath(); ctx.arc(eAx, eAy, 5, 0, Math.PI * 2); ctx.fill();
          ctx.strokeStyle = op.col + "33"; ctx.lineWidth = 1;
          ctx.beginPath(); ctx.arc(px, py, R, 0, Math.PI * 2); ctx.stroke();
          // Swap arrow
          ctx.strokeStyle = op.col + "88"; ctx.lineWidth = 2;
          ctx.beginPath(); ctx.moveTo(px - 12, py - 25); ctx.bezierCurveTo(px, py - 45, px, py - 45, px + 12, py - 25); ctx.stroke();

        } else if (i === 1) {
          // P: electron orbits, then mirror of its position shown
          const eAx = px + R * Math.cos(ang), eAy = py + R * Math.sin(ang) * 0.5;
          const eMirX = px - (eAx - px), eMirY = py - (eAy - py);
          ctx.strokeStyle = op.col + "22"; ctx.lineWidth = 1;
          ctx.setLineDash([3, 3]);
          ctx.beginPath(); ctx.moveTo(px, py - R * 0.6); ctx.lineTo(px, py + R * 0.6); ctx.stroke();
          ctx.setLineDash([]);
          ctx.fillStyle = BLUE; ctx.beginPath(); ctx.arc(eAx, eAy, 5, 0, Math.PI * 2); ctx.fill();
          ctx.fillStyle = op.col + "60"; ctx.beginPath(); ctx.arc(eMirX, eMirY, 5, 0, Math.PI * 2); ctx.fill();
          ctx.strokeStyle = op.col + "55"; ctx.lineWidth = 1;
          ctx.beginPath(); ctx.moveTo(eAx, eAy); ctx.lineTo(eMirX, eMirY); ctx.stroke();
          ctx.fillStyle = RED; ctx.beginPath(); ctx.arc(px, py, 10, 0, Math.PI * 2); ctx.fill();
          ctx.strokeStyle = op.col + "33"; ctx.lineWidth = 1;
          ctx.beginPath(); ctx.arc(px, py, R, 0, Math.PI * 2); ctx.stroke();
          ctx.fillStyle = VIOLET + "80"; ctx.font = "8px monospace"; ctx.textAlign = "center";
          ctx.fillText("→ mirror", px, py + R + 18);

        } else {
          // T: electron in orbit, then same path shown backwards with ghost
          const eAx = px + R * Math.cos(ang), eAy = py + R * Math.sin(ang) * 0.5;
          const eBAx = px + R * Math.cos(-ang + Math.PI), eBAy = py + R * Math.sin(-ang + Math.PI) * 0.5;
          ctx.strokeStyle = op.col + "33"; ctx.lineWidth = 1;
          ctx.beginPath(); ctx.arc(px, py, R, 0, Math.PI * 2); ctx.stroke();
          ctx.fillStyle = RED; ctx.beginPath(); ctx.arc(px, py, 10, 0, Math.PI * 2); ctx.fill();
          ctx.fillStyle = BLUE; ctx.beginPath(); ctx.arc(eAx, eAy, 5, 0, Math.PI * 2); ctx.fill();
          ctx.fillStyle = RED + "50"; ctx.beginPath(); ctx.arc(eBAx, eBAy, 4, 0, Math.PI * 2); ctx.fill();
          // clock symbol
          const clkX = px, clkY = py + R + 20;
          ctx.strokeStyle = op.col + "66"; ctx.lineWidth = 1;
          ctx.beginPath(); ctx.arc(clkX, clkY, 12, 0, Math.PI * 2); ctx.stroke();
          // clock hands
          const hAng = -(t * 0.03);
          ctx.beginPath(); ctx.moveTo(clkX, clkY); ctx.lineTo(clkX + 8 * Math.cos(hAng), clkY + 8 * Math.sin(hAng)); ctx.stroke();
          ctx.fillStyle = op.col; ctx.font = "7px monospace"; ctx.textAlign = "center";
          ctx.fillText("← t", clkX, clkY + 22);
        }

        // Info
        ctx.fillStyle = op.col; ctx.font = "bold 11px monospace"; ctx.textAlign = "center";
        ctx.fillText(op.desc, px, H - 38);
        ctx.fillStyle = op.col + "80"; ctx.font = "8px monospace";
        ctx.fillText(op.sub, px, H - 24);
      });

      // Title
      ctx.fillStyle = GOLD + "88"; ctx.font = "bold 9px monospace"; ctx.textAlign = "center";
      ctx.fillText("CPT SYMMETRY · FUNDAMENTAL DISCRETE TRANSFORMATIONS", W * 0.5, H - 10);

      t++; raf = requestAnimationFrame(draw);
    }
    draw();
    return () => { cancelAnimationFrame(raf); ro.disconnect(); };
  }, []);
  return (
    <div style={{ border: `1px solid ${LINE}`, borderRadius: 12, overflow: "hidden" }}>
      <canvas ref={ref} style={{ width: "100%", height: 320, display: "block" }} />
    </div>
  );
}

/* ══════════════════════════════════════════════════════════
   CANVAS III — Coherence Engine C(x,t) Field
   Blue field on H side / Red field on H̄ side
   Event horizon at x=0 — coherence jumps sign
══════════════════════════════════════════════════════════ */
function CoherenceEngineCanvas() {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const cv = ref.current; if (!cv) return;
    const ctx = cv.getContext("2d")!;
    let raf = 0, t = 0;
    const ro = new ResizeObserver(() => { cv.width = cv.offsetWidth; cv.height = cv.offsetHeight; });
    ro.observe(cv); cv.width = cv.offsetWidth; cv.height = cv.offsetHeight;

    function draw() {
      const W = cv.width, H = cv.height;
      ctx.clearRect(0, 0, W, H);
      ctx.fillStyle = BG; ctx.fillRect(0, 0, W, H);

      const MID = H * 0.58;
      const plotH = H * 0.52;

      // Grid
      ctx.strokeStyle = "rgba(120,80,255,0.06)"; ctx.lineWidth = 1;
      for (let gy = MID - plotH * 0.5; gy <= MID + plotH * 0.5; gy += plotH / 4) {
        ctx.beginPath(); ctx.moveTo(0, gy); ctx.lineTo(W, gy); ctx.stroke();
      }
      // Centre vertical (event horizon)
      ctx.strokeStyle = GOLD + "55"; ctx.lineWidth = 1.5; ctx.setLineDash([4, 3]);
      ctx.beginPath(); ctx.moveTo(W * 0.5, 0); ctx.lineTo(W * 0.5, H); ctx.stroke();
      ctx.setLineDash([]);

      // H side C(x,t) — positive, blue
      ctx.strokeStyle = BLUE; ctx.lineWidth = 2;
      ctx.beginPath();
      for (let px = 0; px < W * 0.5; px++) {
        const x = px / (W * 0.5);
        const cx_ = (0.9 - 0.7 * x) * Math.cos(t * 0.04 + x * 8) * (plotH * 0.4);
        const y = MID - cx_;
        if (px === 0) ctx.moveTo(px, y); else ctx.lineTo(px, y);
      }
      ctx.stroke();

      // H̄ side C(x,t) — negative, red (phase-inverted)
      ctx.strokeStyle = RED; ctx.lineWidth = 2;
      ctx.beginPath();
      for (let px = 0; px < W * 0.5; px++) {
        const x = px / (W * 0.5);
        const cx_ = (0.2 + 0.7 * x) * Math.cos(-(t * 0.04 + x * 8) + Math.PI) * (plotH * 0.4);
        const y = MID - cx_;
        if (px === 0) ctx.moveTo(W * 0.5 + px, y); else ctx.lineTo(W * 0.5 + px, y);
      }
      ctx.stroke();

      // Annotations
      ctx.fillStyle = BLUE; ctx.font = "bold 10px monospace"; ctx.textAlign = "left";
      ctx.fillText("H · Matter Field", 12, 22);
      ctx.fillStyle = BLUE + "80"; ctx.font = "8px monospace";
      ctx.fillText("C(x,t) = A(x)·e^{i(φ−ωt)}", 12, 34);
      ctx.fillStyle = BLUE + "60"; ctx.font = "8px monospace";
      ctx.fillText("+Energy · +Frequency · Normal Reality", 12, 46);

      ctx.fillStyle = RED; ctx.font = "bold 10px monospace"; ctx.textAlign = "right";
      ctx.fillText("H̄ · Antimatter Field", W - 12, 22);
      ctx.fillStyle = RED + "80"; ctx.font = "8px monospace";
      ctx.fillText("C̄(x,t) = A(x)·e^{−i(φ−ωt)}", W - 12, 34);
      ctx.fillStyle = RED + "60"; ctx.font = "8px monospace";
      ctx.fillText("−Energy · −Frequency · Mirror Reality", W - 12, 46);

      // Event Horizon label
      ctx.fillStyle = GOLD; ctx.font = "bold 10px monospace"; ctx.textAlign = "center";
      ctx.fillText("EVENT HORIZON", W * 0.5, 22);
      ctx.fillStyle = GOLD + "80"; ctx.font = "8px monospace";
      ctx.fillText("Phase jump: φ → φ + π", W * 0.5, 34);
      ctx.fillText("C → C̄  (complex conjugate)", W * 0.5, 44);

      // Annihilation flash at horizon
      const annPulse = 0.3 + 0.2 * Math.sin(t * 0.08);
      const annGrad = ctx.createRadialGradient(W * 0.5, MID, 0, W * 0.5, MID, 40);
      annGrad.addColorStop(0, `rgba(255,240,180,${annPulse})`);
      annGrad.addColorStop(1, "rgba(0,0,0,0)");
      ctx.fillStyle = annGrad; ctx.beginPath(); ctx.arc(W * 0.5, MID, 40, 0, Math.PI * 2); ctx.fill();

      // Y axis label
      ctx.save(); ctx.translate(18, MID); ctx.rotate(-Math.PI / 2);
      ctx.fillStyle = VIOLET + "80"; ctx.font = "8px monospace"; ctx.textAlign = "center";
      ctx.fillText("C(x,t) — Coherence Field Amplitude", 0, 0);
      ctx.restore();

      ctx.fillStyle = VIOLET; ctx.font = "bold 9px monospace"; ctx.textAlign = "center";
      ctx.fillText("COHERENCE ENGINE · H vs H̄ · MATTER–ANTIMATTER FIELD BOUNDARY", W * 0.5, H - 10);

      t++; raf = requestAnimationFrame(draw);
    }
    draw();
    return () => { cancelAnimationFrame(raf); ro.disconnect(); };
  }, []);
  return (
    <div style={{ border: `1px solid ${LINE}`, borderRadius: 12, overflow: "hidden" }}>
      <canvas ref={ref} style={{ width: "100%", height: 320, display: "block" }} />
    </div>
  );
}

function EqChip({ eq, label, col = VIOLET }: { eq: string; label: string; col?: string }) {
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

export default function HydrogenReversalPage() {
  const DOMAINS = [
    { n: "1", label: "Chemical Reversal",     col: BLUE,   desc: "H₂ dissociation reversal: H₂ → 2H (standard bond-breaking reversed to 2H → H₂, exothermic at −436 kJ/mol). Hydride reversal: H⁰ → H⁻ — hydrogen gains an electron to become a hydride ion, reversing its charge polarity without invoking antimatter. Used in fuel cells and metal hydride storage." },
    { n: "2", label: "Quantum Spin Reversal", col: VIOLET, desc: "Spin flip: |↑⟩ → |↓⟩ — the electron or proton magnetic moment reverses relative to an applied field. This is the basis of NMR (nuclear magnetic resonance) and MRI imaging. The proton spin-flip in hydrogen at 21 cm (1420 MHz) is the most abundant spectral line in the universe — the cosmic hydrogen fingerprint." },
    { n: "3", label: "Nuclear Reversal",      col: ORANGE, desc: "Conceptually: if the proton and electron swapped roles (heavy negative particle + light positive particle), the atom would be a 'reversed hydrogen' — neutron-like in charge behaviour but still bound. In muonic hydrogen, the electron is replaced by a muon (207× heavier), compressing the orbital and probing the proton charge radius directly." },
    { n: "4", label: "Cosmological Reversal", col: RED,    desc: "Antihydrogen H̄ = 1 antiproton (p̄) + 1 positron (e⁺). First trapped at CERN ALPHA experiment (2010). The spectral lines of H̄ are identical to H to 12 significant figures — CPT symmetry holds. The cosmic matter-antimatter asymmetry (baryogenesis) remains one of the deepest unsolved problems: why is there ~10⁻¹⁰ more matter than antimatter per photon?" },
  ];

  return (
    <div style={{ background: BG, color: IVORY, minHeight: "100vh" }}>
      <div style={{ maxWidth: 1060, margin: "0 auto", padding: "52px 32px 36px" }}>
        <Tag t="Hydrogen Reversal · Antihydrogen · Coherence Engine · Matter Antimatter Inversion · CPT Symmetry · Event Horizon · Cosmological Asymmetry" />
        <h1 style={{ fontSize: 36, fontWeight: 800, lineHeight: 1.1, margin: "8px 0 14px", letterSpacing: -0.5 }}>
          <span style={{ color: BLUE }}>Hydrogen</span><br />
          <span style={{ color: VIOLET }}>Reversed</span>
        </h1>
        <h2 style={{ fontSize: 17, fontWeight: 400, color: TEAL, margin: "0 0 20px", lineHeight: 1.6 }}>
          Coherence Engine · Matter & Antimatter Inversion · Physics of Polarity Reversal
        </h2>
        <p style={{ fontSize: 13, color: DIM, lineHeight: 1.9, maxWidth: 820, marginBottom: 12 }}>
          "Hydrogen reversed" has four precise physical interpretations, each operating in a different domain — chemical, quantum mechanical, nuclear, and cosmological. At the deepest level, the reversal is antihydrogen: H̄ = 1 antiproton + 1 positron, the exact matter-antimatter mirror of the most abundant atom in the universe. Antihydrogen has been successfully trapped and measured at CERN. Its spectral lines are identical to hydrogen's to 12 significant figures — confirming CPT symmetry (Charge conjugation + Parity inversion + Time reversal) at extraordinary precision. The event horizon between H and H̄ is the annihilation boundary: when matter meets antimatter, both annihilate into gamma photons at E=mc² per pair.
        </p>
        <p style={{ fontSize: 13, color: DIM, lineHeight: 1.9, maxWidth: 820 }}>
          In AETHER terms: hydrogen is the most coherent natural atom (1 proton + 1 electron = the simplest standing-wave solution to the Schrodinger equation), and its reversal is the most coherent mirror state — a perfect inversion of the coherence field C(x,t) across the event horizon. The coherence engine holds both states simultaneously: the matter field with +frequency and the antimatter field with -frequency, phase-shifted by exactly pi, maintaining the CPT-symmetric structure that (asymmetrically, somehow) gave rise to the observable matter-dominated universe.
        </p>
      </div>

      {/* Canvas I */}
      <div style={{ maxWidth: 1060, margin: "0 auto", padding: "0 32px 48px" }}>
        <Tag t="Section I · Hydrogen vs Antihydrogen · Event Horizon · Matter-Antimatter Pair · Annihilation Boundary" c={BLUE} />
        <h2 style={{ fontSize: 20, fontWeight: 700, color: BLUE, marginBottom: 14 }}>H vs H̄ · The Matter-Antimatter Mirror</h2>
        <HAntiHCanvas />
        <div style={{ marginTop: 10, fontSize: 10, color: MUTED, textAlign: "center" as const }}>
          Left: Hydrogen (red proton, blue electron) · Right: Antihydrogen (blue antiproton, red positron, reversed orbit) · Centre: Event Horizon with annihilation glow
        </div>
      </div>

      <Divider />

      {/* 4 Domain breakdown */}
      <div style={{ maxWidth: 1060, margin: "0 auto", padding: "0 32px 48px" }}>
        <Tag t="Section II · Four Domains of Hydrogen Reversal · Chemical · Quantum · Nuclear · Cosmological" c={VIOLET} />
        <h2 style={{ fontSize: 20, fontWeight: 700, color: VIOLET, marginBottom: 20 }}>Four Domains of Reversal</h2>
        <div style={{ display: "flex", flexDirection: "column" as const, gap: 14 }}>
          {DOMAINS.map(domain => (
            <div key={domain.n} style={{ display: "grid", gridTemplateColumns: "56px 180px 1fr", gap: 16, alignItems: "start",
              padding: "16px 20px", background: PANEL, borderRadius: 12, border: `1px solid ${domain.col}18` }}>
              <div style={{ fontSize: 26, fontWeight: 800, color: domain.col }}>{domain.n}</div>
              <div style={{ fontSize: 12, fontWeight: 700, color: domain.col, marginTop: 4 }}>{domain.label}</div>
              <div style={{ fontSize: 12, color: DIM, lineHeight: 1.85 }}>{domain.desc}</div>
            </div>
          ))}
        </div>
      </div>

      <Divider />

      {/* Canvas II */}
      <div style={{ maxWidth: 1060, margin: "0 auto", padding: "0 32px 48px" }}>
        <Tag t="Section III · CPT Symmetry · Charge Conjugation · Parity Inversion · Time Reversal" c={VIOLET} />
        <h2 style={{ fontSize: 20, fontWeight: 700, color: VIOLET, marginBottom: 14 }}>CPT Symmetry · Three Discrete Transformations</h2>
        <CPTCanvas />
        <div style={{ marginTop: 10, fontSize: 10, color: MUTED, textAlign: "center" as const }}>
          C: proton/electron swap to antiproton/positron · P: spatial mirror (electron position flips) · T: time reversal (electron orbits backwards)
        </div>
      </div>

      <Divider />

      {/* Equations */}
      <div style={{ maxWidth: 1060, margin: "0 auto", padding: "0 32px 48px" }}>
        <Tag t="Section IV · Key Equations · CPT · Annihilation · Spectral Identity · Baryogenesis" c={GOLD} />
        <h2 style={{ fontSize: 20, fontWeight: 700, color: GOLD, marginBottom: 20 }}>Governing Relations</h2>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(260px,1fr))", gap: 14 }}>
          <EqChip eq="H̄ = p̄ + e⁺" label="Antihydrogen composition — one antiproton (p̄: mass=938.3 MeV, charge=-1) + one positron (e⁺: mass=0.511 MeV, charge=+1). Bound state identical in structure to H." col={BLUE} />
          <EqChip eq="H + H̄ → 2γ (511 keV each)" label="Positronium annihilation: matter-antimatter contact produces two 511 keV gamma photons, conserving energy and momentum. The event-horizon annihilation signature." col={RED} />
          <EqChip eq="E = mc² = 1876.6 MeV/pair" label="Rest mass energy of the H+H̄ pair — full conversion to photons. This is the coherence engine's maximum energy yield per matter-antimatter pair." col={GOLD} />
          <EqChip eq="ν_H = ν_H̄ to 10⁻¹²" label="CPT symmetry test — 1S-2S transition frequency of H and H̄ agree to 12 significant figures (CERN ALPHA 2022). The coherence field is identical across the event horizon." col={VIOLET} />
          <EqChip eq="η_B = (n_B - n_B̄)/n_γ ≈ 6×10⁻¹⁰" label="Baryon asymmetry — one extra baryon per 10^9 photon pairs. The deepest unsolved number in physics: why matter won over antimatter in the early universe." col={ORANGE} />
          <EqChip eq="CPT: C·P·T |H⟩ = |H̄⟩" label="CPT theorem — applying all three discrete symmetries maps hydrogen exactly to antihydrogen. The combined transformation is a fundamental symmetry of all local relativistic quantum field theories." col={CYAN} />
        </div>
      </div>

      <Divider />

      {/* Canvas III */}
      <div style={{ maxWidth: 1060, margin: "0 auto", padding: "0 32px 48px" }}>
        <Tag t="Section V · Coherence Engine · C(x,t) Field · H/H̄ Boundary · Phase Conjugate · Matter-Antimatter" c={GOLD} />
        <h2 style={{ fontSize: 20, fontWeight: 700, color: GOLD, marginBottom: 14 }}>Coherence Engine · C(x,t) Field Across the Event Horizon</h2>
        <CoherenceEngineCanvas />
        <div style={{ marginTop: 10, fontSize: 10, color: MUTED, textAlign: "center" as const }}>
          Blue: H matter coherence field · Red: H̄ antimatter field (phase-inverted) · Gold line: Event Horizon where C flips to its complex conjugate C̄
        </div>
      </div>

      <Divider />

      {/* Source plates */}
      <div style={{ maxWidth: 1060, margin: "0 auto", padding: "0 32px 48px" }}>
        <Tag t="Section VI · Source Plates · AETHER Reference Field" c={VIOLET} />
        <h2 style={{ fontSize: 20, fontWeight: 700, color: VIOLET, marginBottom: 20 }}>Knowledge Reference Plates</h2>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(300px,1fr))", gap: 20 }}>
          <Plate src={omniFlow} title="Omni-Field Flow · Matter-Antimatter Coherence" chips={["CPT symmetry", "coherence field", "event horizon", "H vs H̄", "matter field"]}
            body="The omni-field plate captures the dual-polarity coherence architecture — the H/H̄ pair as the simplest possible coherence engine, with matter and antimatter fields maintaining perfect CPT symmetry across the event horizon." />
          <Plate src={magStorm} title="Magnetic Storm · Proton Spin & 21cm Line" chips={["spin flip", "21cm hydrogen", "NMR", "cosmic fingerprint", "magnetic reversal"]}
            body="The magnetic storm plate maps onto the proton spin-flip in hydrogen — the 21 cm line at 1420 MHz, the most abundant spectral signature in the universe, produced by the quantum reversal of hydrogen's magnetic moment." />
          <Plate src={skyrmion} title="Skyrmion · Topological Baryogenesis" chips={["baryogenesis", "baryon asymmetry", "topological defect", "Sakharov conditions", "matter dominance"]}
            body="The skyrmion plate maps onto baryogenesis — the topological processes in the early universe that broke CPT-like symmetry (via sphaleron transitions) and produced the tiny baryon asymmetry η_B ≈ 6×10⁻¹⁰ that gives us matter." />
        </div>
      </div>

      <Divider />

      {/* AETHER synthesis */}
      <div style={{ maxWidth: 1060, margin: "0 auto", padding: "0 32px 52px" }}>
        <Tag t="AETHER Synthesis · Crystallisation Model · Hydrogen as Minimal Coherence Unit" />
        <div style={{ padding: "22px 26px", background: PANEL, borderRadius: 14, border: `1px solid ${VIOLET}15`, marginBottom: 24 }}>
          <div style={{ fontSize: 14, color: IVORY, lineHeight: 2.0 }}>
            Hydrogen is the minimal coherence unit — the simplest atom, one proton and one electron held in a perfect quantum standing wave by the electromagnetic force. Its reversal, antihydrogen, is the minimal anti-coherence unit: the exact same standing wave with every charge inverted. The coherence engine holds both simultaneously. The <em style={{ color: BLUE }}>matter field</em> is C(x,t) = A·e^{"{"}i(φ−ωt){"}"} — positive frequency, positive energy, the familiar crystallisation-toward-matter that AETHER models. The <em style={{ color: RED }}>antimatter field</em> is its complex conjugate C̄ = A·e^{"{"}−i(φ−ωt){"}"} — negative frequency, time-reversed, a perfect mirror. The event horizon between them is not empty — it is the most energetic point in the system, where every quantum of energy in H and H̄ annihilates into gamma photons. The 10⁻¹⁰ excess of matter that we are made of is not an accident of symmetry breaking. It is the minimal crystallisation asymmetry required to produce a universe capable of observing itself. AETHER is that observer.
          </div>
        </div>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" as const }}>
          {["/antimatter-wave", "/aether-engine", "/quantum-ringdown-biocycles", "/wave-collapse", "/electron-field", "/coherent-body", "/graph-map"].map(href => (
            <a key={href} href={href} style={{ padding: "6px 12px", borderRadius: 8, border: `1px solid ${LINE}`, color: DIM, fontSize: 11, textDecoration: "none" }}>
              {href.replace("/", "").replace(/-/g, " ")} →
            </a>
          ))}
        </div>
      </div>
    </div>
  );
}
