import { useEffect, useRef, useState } from "react";

/* ── Palette ── */
const BG     = "#020408";
const PANEL  = "rgba(3,6,14,0.97)";
const BORDER = "#0a0f20";
const GOLD   = "#c9a84c";
const CYAN   = "#2ef0d8";
const VIOLET = "#9966ff";
const INDIGO = "#6680ff";
const GREEN  = "#44ee88";
const LIME   = "#b0f040";
const DIM    = "#203860";
const TEXT   = "#b0c0d8";
const MUTED  = "#2a4060";
const ROSE   = "#ff55aa";
const TEAL   = "#1fd4c8";
const AMBER  = "#e8c020";

const mono  = "'Space Mono', monospace";
const serif = "'Cinzel', serif";
const body  = "'Crimson Pro', Georgia, serif";

/* Golden angle in radians */
const GOLDEN_ANGLE = 2.39996322972865332; // 137.507764°

type CanvasTab = "spin" | "photorefractive" | "cavity" | "gain";

/* ══════════ GOLDEN-ANGLE FERMAT SPIRAL CANVAS ══════════ */
function SpinCanvas() {
  const cvRef = useRef<HTMLCanvasElement>(null);
  const raf   = useRef(0);
  const t0    = useRef(0);

  useEffect(() => {
    const cv = cvRef.current; if (!cv) return;
    const ctx = cv.getContext("2d"); if (!ctx) return;
    function resize() {
      const dpr = Math.min(2, window.devicePixelRatio || 1);
      const r = cv!.getBoundingClientRect();
      cv!.width = r.width * dpr; cv!.height = r.height * dpr;
      ctx!.setTransform(dpr, 0, 0, dpr, 0, 0);
    }
    resize(); window.addEventListener("resize", resize);

    function loop() {
      raf.current = requestAnimationFrame(loop);
      t0.current += 0.007;
      const T = t0.current;
      const r = cv!.getBoundingClientRect();
      const W = r.width, H = r.height;
      ctx!.clearRect(0, 0, W, H);
      ctx!.fillStyle = BG; ctx!.fillRect(0, 0, W, H);

      // Two views: left = Fermat spiral (top-down), right = side-view helix (time axis)
      const lW = W * 0.48, rX = W * 0.52;
      const lCX = lW / 2, lCY = H / 2;

      // ── LEFT: Golden-angle Fermat spiral (top-down, "outward") ──
      ctx!.save();
      ctx!.beginPath(); ctx!.rect(0, 0, lW, H); ctx!.clip();

      const N = 144; // Fibonacci number of points
      const aScale = Math.min(lW, H) * 0.038;
      // Concentric time planes
      for (let ring = 1; ring <= 5; ring++) {
        const ringR = (ring / 5) * aScale * Math.sqrt(N) * 0.9;
        ctx!.beginPath();
        ctx!.arc(lCX, lCY, ringR, 0, Math.PI * 2);
        ctx!.strokeStyle = VIOLET + "15"; ctx!.lineWidth = 0.8; ctx!.stroke();
      }

      // Fermat spiral points
      for (let n = 1; n <= N; n++) {
        const theta = n * GOLDEN_ANGLE + T * 0.3;
        const rn    = aScale * Math.sqrt(n);
        const x     = lCX + rn * Math.cos(theta);
        const y     = lCY + rn * Math.sin(theta);
        const frac  = n / N;

        // Color: violet (center) → cyan → green (edge)
        let col: string;
        if (frac < 0.33) col = VIOLET;
        else if (frac < 0.66) col = CYAN;
        else col = GREEN;

        const size  = 1.2 + frac * 2.2;
        const alpha = 0.4 + frac * 0.6;

        // Glow
        ctx!.beginPath(); ctx!.arc(x, y, size * 2.5, 0, Math.PI * 2);
        ctx!.fillStyle = col + Math.round(alpha * 28).toString(16).padStart(2,"0");
        ctx!.fill();
        // Core
        ctx!.beginPath(); ctx!.arc(x, y, size, 0, Math.PI * 2);
        ctx!.fillStyle = col + Math.round(alpha * 255).toString(16).padStart(2,"0");
        ctx!.fill();
      }
      // Labels
      ctx!.font = `7px ${mono}`; ctx!.textAlign = "center"; ctx!.fillStyle = GOLD + "80";
      ctx!.fillText("θₙ = n·α  rₙ = a√n", lCX, H - 22);
      ctx!.fillStyle = VIOLET + "70";
      ctx!.fillText("α = 137.508°  N = 144", lCX, H - 11);
      ctx!.fillStyle = MUTED + "cc";
      ctx!.fillText("OUTWARD", lCX, 10);
      ctx!.restore();

      // Divider
      ctx!.strokeStyle = MUTED + "40"; ctx!.lineWidth = 1; ctx!.setLineDash([3,5]);
      ctx!.beginPath(); ctx!.moveTo(W*0.5, 8); ctx!.lineTo(W*0.5, H-8);
      ctx!.stroke(); ctx!.setLineDash([]);

      // ── RIGHT: Side-view helix (time = upward) ──
      ctx!.save();
      ctx!.beginPath(); ctx!.rect(rX, 0, W - rX, H); ctx!.clip();

      const rCX = rX + (W - rX) / 2;
      const baseY = H * 0.88;

      // Time axis
      ctx!.strokeStyle = VIOLET + "35"; ctx!.lineWidth = 1; ctx!.setLineDash([4,6]);
      ctx!.beginPath(); ctx!.moveTo(rCX, H*0.05); ctx!.lineTo(rCX, baseY);
      ctx!.stroke(); ctx!.setLineDash([]);
      ctx!.font = `7px ${mono}`; ctx!.fillStyle = VIOLET + "66";
      ctx!.textAlign = "center"; ctx!.fillText("TIME ↑", rCX, H*0.05 - 4);

      // Helix projected: x = cx + r(t)cos(ωt), y = baseY - t·H·0.8
      const steps = 200;
      const ωθ = 3.5;
      ctx!.beginPath();
      for (let i = 0; i <= steps; i++) {
        const frac = i / steps;
        const θ    = frac * ωθ * Math.PI + T * 0.5;
        const rHel = 14 + frac * (W - rX) * 0.36;
        const x    = rCX + rHel * Math.cos(θ);
        const y    = baseY - frac * H * 0.82;
        const persp = rHel * Math.sin(θ) * 0.16;
        if (i === 0) ctx!.moveTo(x, y + persp);
        else ctx!.lineTo(x, y + persp);
      }
      const hGrad = ctx!.createLinearGradient(rCX, baseY, rCX, H*0.05);
      hGrad.addColorStop(0, VIOLET + "cc");
      hGrad.addColorStop(0.5, CYAN + "cc");
      hGrad.addColorStop(1, GREEN + "88");
      ctx!.strokeStyle = hGrad; ctx!.lineWidth = 1.8; ctx!.stroke();

      // Nodes on helix
      for (let n = 1; n <= 8; n++) {
        const frac = n / 9;
        const θ    = frac * ωθ * Math.PI + T * 0.5;
        const rHel = 14 + frac * (W - rX) * 0.36;
        const x    = rCX + rHel * Math.cos(θ);
        const y    = baseY - frac * H * 0.82 + rHel * Math.sin(θ) * 0.16;
        const pulse = 0.7 + 0.3 * Math.sin(T * 3 + n);
        const c = frac < 0.4 ? VIOLET : frac < 0.7 ? CYAN : GREEN;
        ctx!.beginPath(); ctx!.arc(x, y, 4 * pulse, 0, Math.PI*2);
        ctx!.fillStyle = c + "35"; ctx!.fill();
        ctx!.beginPath(); ctx!.arc(x, y, 2, 0, Math.PI*2);
        ctx!.fillStyle = c; ctx!.fill();
      }

      ctx!.font = `7px ${mono}`; ctx!.textAlign = "center"; ctx!.fillStyle = MUTED + "cc";
      ctx!.fillText("UPWARD", rCX, 10);
      ctx!.restore();

      // Bottom equation strip
      ctx!.fillStyle = PANEL;
      ctx!.fillRect(0, H - 32, W, 32);
      ctx!.font = `7px ${mono}`; ctx!.textAlign = "center";
      ctx!.fillStyle = GOLD + "88";
      ctx!.fillText("L = I·ω  ·  rₙ = a√n  ·  θₙ = n·137.508°  ·  Golden angle: φ = (1+√5)/2", W/2, H - 18);
      ctx!.fillStyle = MUTED;
      ctx!.fillText(`α = ${(GOLDEN_ANGLE * 180 / Math.PI).toFixed(3)}°  ·  T = ${T.toFixed(2)} s  ·  N = 144 Fibonacci`, W/2, H - 7);
    }
    loop();
    return () => { cancelAnimationFrame(raf.current); window.removeEventListener("resize", resize); };
  }, []);

  return <canvas ref={cvRef} style={{ display:"block", width:"100%", height:270 }} />;
}

/* ══════════ PHOTOREFRACTIVE LIMITS CANVAS ══════════ */
function PhotoCanvas() {
  const cvRef = useRef<HTMLCanvasElement>(null);
  const raf   = useRef(0);
  const t0    = useRef(0);

  useEffect(() => {
    const cv = cvRef.current; if (!cv) return;
    const ctx = cv.getContext("2d"); if (!ctx) return;
    function resize() {
      const dpr = Math.min(2, window.devicePixelRatio || 1);
      const r = cv!.getBoundingClientRect();
      cv!.width = r.width * dpr; cv!.height = r.height * dpr;
      ctx!.setTransform(dpr, 0, 0, dpr, 0, 0);
    }
    resize(); window.addEventListener("resize", resize);

    function loop() {
      raf.current = requestAnimationFrame(loop);
      t0.current += 0.01;
      const T = t0.current;
      const r = cv!.getBoundingClientRect();
      const W = r.width, H = r.height;
      ctx!.clearRect(0, 0, W, H); ctx!.fillStyle = BG; ctx!.fillRect(0, 0, W, H);

      const padL = 58, padR = 22, padT = 18, padB = 38;
      const pW = W - padL - padR, pH = H - padT - padB;
      const ox = padL, oy = padT + pH;

      // Grid
      for (let g = 0; g <= 5; g++) {
        ctx!.strokeStyle = MUTED + "35"; ctx!.lineWidth = 0.5;
        ctx!.beginPath(); ctx!.moveTo(ox+(g/5)*pW, padT); ctx!.lineTo(ox+(g/5)*pW, oy); ctx!.stroke();
      }
      for (let g = 0; g <= 4; g++) {
        ctx!.beginPath(); ctx!.moveTo(ox, padT+(g/4)*pH); ctx!.lineTo(ox+pW, padT+(g/4)*pH); ctx!.stroke();
      }

      // Axes
      ctx!.strokeStyle = DIM + "cc"; ctx!.lineWidth = 1.5;
      ctx!.beginPath(); ctx!.moveTo(ox, padT-4); ctx!.lineTo(ox, oy+16); ctx!.stroke();
      ctx!.beginPath(); ctx!.moveTo(ox-10, oy); ctx!.lineTo(ox+pW+4, oy); ctx!.stroke();
      ctx!.font = `7px ${mono}`; ctx!.textAlign = "right"; ctx!.fillStyle = TEXT + "88";
      ctx!.fillText("Δn", ox-4, padT+5);
      ctx!.textAlign = "center"; ctx!.fillText("Intensity I  (W cm⁻²) →", ox+pW/2, oy+28);

      // Y-axis ticks
      ["Δnₛₐₜ","¾","½","¼"].forEach((l,i)=>{
        const y = padT + (i/3)*pH;
        ctx!.textAlign = "right"; ctx!.font = `6px ${mono}`; ctx!.fillStyle = CYAN+"70";
        ctx!.fillText(l, ox-5, y+3);
      });

      // ── Kerr saturation curve: Δn = Is·I/(I+Is) ──
      ctx!.beginPath();
      for (let px = 0; px <= pW; px++) {
        const xN = px / pW;
        const Is = 0.26;
        const n = xN / (xN + Is);
        if (px===0) ctx!.moveTo(ox+px, oy - n*pH);
        else ctx!.lineTo(ox+px, oy - n*pH);
      }
      const kG = ctx!.createLinearGradient(ox,0,ox+pW,0);
      kG.addColorStop(0, CYAN+"cc"); kG.addColorStop(0.45, GREEN+"cc");
      kG.addColorStop(0.72, AMBER+"bb"); kG.addColorStop(1, ROSE+"99");
      ctx!.strokeStyle = kG; ctx!.lineWidth = 2.5; ctx!.stroke();

      // ── Five limit boundaries ──
      const limits = [
        { x:0.18, color:CYAN,   label:"Diffraction\nΔx ≥ λ/2NA" },
        { x:0.35, color:TEAL,   label:"n limit\n(material index)" },
        { x:0.55, color:AMBER,  label:"Thermal\ndistortion" },
        { x:0.72, color:VIOLET, label:"Quantum\nnoise floor" },
        { x:0.84, color:ROSE,   label:"Coherence\nlength" },
      ];
      limits.forEach(lim => {
        const lx = ox + lim.x * pW;
        ctx!.beginPath(); ctx!.moveTo(lx, padT+4); ctx!.lineTo(lx, oy);
        ctx!.strokeStyle = lim.color + "55"; ctx!.lineWidth = 1; ctx!.setLineDash([3,5]);
        ctx!.stroke(); ctx!.setLineDash([]);
        // Label (alternating above/below)
        const pulse = 0.8 + 0.2 * Math.abs(Math.sin(T * 0.7 + lim.x * 5));
        ctx!.font = `6px ${mono}`; ctx!.textAlign = "center"; ctx!.fillStyle = lim.color + "cc";
        lim.label.split("\n").forEach((ln, li) =>
          ctx!.fillText(ln, lx, padT + 10 + li * 9)
        );
      });

      // ── Animated probe dot ──
      const probeX = ((Math.sin(T*0.45)+1)/2);
      const px2 = ox + probeX * pW;
      const Is = 0.26;
      const pn = probeX / (probeX + Is);
      const py2 = oy - pn * pH;
      ctx!.beginPath(); ctx!.arc(px2, py2, 6, 0, Math.PI*2);
      ctx!.fillStyle = GREEN+"35"; ctx!.fill();
      ctx!.beginPath(); ctx!.arc(px2, py2, 2.5, 0, Math.PI*2);
      ctx!.fillStyle = GREEN; ctx!.fill();
      ctx!.font = `7px ${mono}`; ctx!.textAlign = "left"; ctx!.fillStyle = GREEN+"cc";
      ctx!.fillText(`Δn = ${(pn).toFixed(3)}·Δnₛₐₜ`, px2+7, py2-3);

      // Kerr linear annotation
      ctx!.font = `7px ${mono}`; ctx!.textAlign = "left"; ctx!.fillStyle = CYAN+"70";
      ctx!.fillText("Kerr: Δn = n₂·I", ox+4, oy - pH*0.2);
    }
    loop();
    return () => { cancelAnimationFrame(raf.current); window.removeEventListener("resize", resize); };
  }, []);
  return <canvas ref={cvRef} style={{ display:"block", width:"100%", height:230 }} />;
}

/* ══════════ TOROIDAL MASER CAVITY CANVAS ══════════ */
function CavityCanvas() {
  const cvRef = useRef<HTMLCanvasElement>(null);
  const raf   = useRef(0);
  const t0    = useRef(0);

  useEffect(() => {
    const cv = cvRef.current; if (!cv) return;
    const ctx = cv.getContext("2d"); if (!ctx) return;
    function resize() {
      const dpr = Math.min(2, window.devicePixelRatio || 1);
      const r = cv!.getBoundingClientRect();
      cv!.width = r.width * dpr; cv!.height = r.height * dpr;
      ctx!.setTransform(dpr, 0, 0, dpr, 0, 0);
    }
    resize(); window.addEventListener("resize", resize);

    function loop() {
      raf.current = requestAnimationFrame(loop);
      t0.current += 0.01;
      const T = t0.current;
      const r = cv!.getBoundingClientRect();
      const W = r.width, H = r.height;
      ctx!.clearRect(0, 0, W, H); ctx!.fillStyle = BG; ctx!.fillRect(0, 0, W, H);

      const cx = W / 2, cy = H / 2;
      const Ro = Math.min(W, H) * 0.38; // outer radius of torus
      const Ri = Ro * 0.52;              // inner radius
      const Rb = Ro * 0.14;              // isotope core
      const persp = 0.35;                // y-squish for 3D look

      // ── Toroidal glow ──
      const toroGlow = ctx!.createRadialGradient(cx, cy, Ri*persp, cx, cy, Ro*1.1);
      toroGlow.addColorStop(0, "transparent");
      toroGlow.addColorStop(0.6, VIOLET + "08");
      toroGlow.addColorStop(1, "transparent");
      ctx!.beginPath(); ctx!.ellipse(cx, cy, Ro*1.15, Ro*1.15*persp*2.5, 0, 0, Math.PI*2);
      ctx!.fillStyle = toroGlow; ctx!.fill();

      // ── Outer torus ring ──
      ctx!.beginPath(); ctx!.ellipse(cx, cy, Ro, Ro*persp, 0, 0, Math.PI*2);
      ctx!.strokeStyle = INDIGO + "60"; ctx!.lineWidth = 2; ctx!.stroke();

      // ── Inner torus ring ──
      ctx!.beginPath(); ctx!.ellipse(cx, cy, Ri, Ri*persp, 0, 0, Math.PI*2);
      ctx!.strokeStyle = VIOLET + "50"; ctx!.lineWidth = 1.5; ctx!.stroke();

      // ── Fill torus channel with subtle gradient ──
      // Draw as series of radial lines along the channel
      const sectors = 48;
      for (let s = 0; s < sectors; s++) {
        const angle = (s / sectors) * Math.PI * 2 + T * 0.25;
        const pulse = 0.5 + 0.5 * Math.sin(T * 2 + s * (Math.PI * 2 / sectors) * 3);
        const xi1 = cx + Ri * Math.cos(angle);
        const yi1 = cy + Ri * persp * Math.sin(angle);
        const xo1 = cx + Ro * Math.cos(angle);
        const yo1 = cy + Ro * persp * Math.sin(angle);
        ctx!.beginPath(); ctx!.moveTo(xi1, yi1); ctx!.lineTo(xo1, yo1);
        ctx!.strokeStyle = `rgba(102,128,255,${0.04 + pulse*0.08})`;
        ctx!.lineWidth = 1; ctx!.stroke();
      }

      // ── Standing-wave pattern along torus midline ──
      const midR = (Ro + Ri) / 2;
      const modes = [3, 5, 7, 9]; // mode numbers for different isotopes
      const modeColors = [GOLD, CYAN, VIOLET, GREEN];
      modes.forEach((m, mi) => {
        ctx!.beginPath();
        for (let i = 0; i <= 240; i++) {
          const angle = (i / 240) * Math.PI * 2;
          const wave = Math.sin(angle * m + T * (1 + mi * 0.3)) * (Ro - Ri) * 0.18;
          const rw = midR + wave;
          const x = cx + rw * Math.cos(angle);
          const y = cy + rw * persp * Math.sin(angle);
          if (i === 0) ctx!.moveTo(x, y);
          else ctx!.lineTo(x, y);
        }
        ctx!.strokeStyle = modeColors[mi] + "70";
        ctx!.lineWidth = 1.2; ctx!.stroke();
      });

      // ── Phased microwave emitters ──
      const emitterN = 12;
      for (let e = 0; e < emitterN; e++) {
        const angle = (e / emitterN) * Math.PI * 2 + T * 0.05;
        const ex = cx + (Ro + 12) * Math.cos(angle);
        const ey = cy + (Ro + 12) * persp * Math.sin(angle);
        const pulse = 0.5 + 0.5 * Math.sin(T * 3 + e * (Math.PI * 2 / emitterN));
        // Emitter glow
        ctx!.beginPath(); ctx!.arc(ex, ey, 5 * pulse, 0, Math.PI*2);
        ctx!.fillStyle = CYAN + Math.round(pulse * 50).toString(16).padStart(2,"0");
        ctx!.fill();
        // Emitter dot
        ctx!.beginPath(); ctx!.arc(ex, ey, 2.5, 0, Math.PI*2);
        ctx!.fillStyle = CYAN; ctx!.fill();
        // Phase-lock beam to ring
        const rx = cx + Ro * Math.cos(angle);
        const ry = cy + Ro * persp * Math.sin(angle);
        ctx!.beginPath(); ctx!.moveTo(ex, ey); ctx!.lineTo(rx, ry);
        ctx!.strokeStyle = CYAN + "30"; ctx!.lineWidth = 0.8; ctx!.stroke();
      }

      // ── Superconducting wall label ──
      ctx!.font = `7px ${mono}`; ctx!.textAlign = "right"; ctx!.fillStyle = INDIGO + "88";
      ctx!.fillText("SUPERCONDUCTING WALLS", cx + Ro * 0.7, cy - Ro * persp - 6);

      // ── Isotope core ──
      const coreGrad = ctx!.createRadialGradient(cx, cy, 0, cx, cy, Rb * 2);
      coreGrad.addColorStop(0, GOLD + "aa");
      coreGrad.addColorStop(0.5, GOLD + "30");
      coreGrad.addColorStop(1, "transparent");
      ctx!.beginPath(); ctx!.ellipse(cx, cy, Rb * 2, Rb * 2 * persp * 2, 0, 0, Math.PI*2);
      ctx!.fillStyle = coreGrad; ctx!.fill();
      ctx!.beginPath(); ctx!.ellipse(cx, cy, Rb, Rb * persp * 2, 0, 0, Math.PI*2);
      ctx!.strokeStyle = GOLD + "aa"; ctx!.lineWidth = 1.5; ctx!.stroke();
      ctx!.font = `7px ${serif}`; ctx!.textAlign = "center"; ctx!.fillStyle = GOLD + "cc";
      ctx!.fillText("ISOTOPE CORE", cx, cy - 3);
      ctx!.font = `6px ${mono}`; ctx!.fillStyle = GOLD + "70";
      ctx!.fillText("¹³³Cs · f₀ = 9.193 GHz", cx, cy + 7);

      // ── Resonance node pulses (antinodes) ──
      const nodeN = 9;
      for (let n = 0; n < nodeN; n++) {
        const angle = (n / nodeN) * Math.PI * 2 + T * 0.18;
        const nodeX = cx + midR * Math.cos(angle);
        const nodeY = cy + midR * persp * Math.sin(angle);
        const p = 0.4 + 0.6 * Math.abs(Math.sin(T * 2 + n * Math.PI / nodeN));
        ctx!.beginPath(); ctx!.arc(nodeX, nodeY, 4 * p, 0, Math.PI*2);
        ctx!.fillStyle = AMBER + Math.round(p * 60).toString(16).padStart(2,"0");
        ctx!.fill();
        ctx!.beginPath(); ctx!.arc(nodeX, nodeY, 1.5, 0, Math.PI*2);
        ctx!.fillStyle = AMBER; ctx!.fill();
      }

      // ── Labels ──
      ctx!.font = `7px ${mono}`; ctx!.textAlign = "center"; ctx!.fillStyle = CYAN + "70";
      ctx!.fillText("×12 PHASED MASER EMITTERS", cx, cy + Ro * persp + 14);
      ctx!.fillStyle = MUTED;
      ctx!.fillText(`Q > 10⁹  ·  δν < 1 mHz  ·  TOROIDAL GEOMETRY`, cx, H - 10);
      ctx!.fillStyle = AMBER + "88";
      ctx!.fillText("● RESONANCE ANTINODE", cx, H - 22);
    }
    loop();
    return () => { cancelAnimationFrame(raf.current); window.removeEventListener("resize", resize); };
  }, []);
  return <canvas ref={cvRef} style={{ display:"block", width:"100%", height:250 }} />;
}

/* ══════════ GAIN REGIONS CANVAS ══════════
   Four subsystems surrounding a central large toroidal resonator:
   MODE LOCKING · PHASE LOCKING · INTERFERENCE GRID · NODE CONTROL
══════════════════════════════════════════ */
function GainCanvas() {
  const cvRef = useRef<HTMLCanvasElement>(null);
  const raf   = useRef(0);
  const t0    = useRef(0);

  useEffect(() => {
    const cv = cvRef.current; if (!cv) return;
    const ctx = cv.getContext("2d"); if (!ctx) return;
    function resize() {
      const dpr = Math.min(2, window.devicePixelRatio || 1);
      const r = cv!.getBoundingClientRect();
      cv!.width = r.width * dpr; cv!.height = r.height * dpr;
      ctx!.setTransform(dpr, 0, 0, dpr, 0, 0);
    }
    resize(); window.addEventListener("resize", resize);

    function loop() {
      raf.current = requestAnimationFrame(loop);
      t0.current += 0.012;
      const T = t0.current;
      const r = cv!.getBoundingClientRect();
      const W = r.width, H = r.height;
      ctx!.clearRect(0, 0, W, H); ctx!.fillStyle = BG; ctx!.fillRect(0, 0, W, H);

      const cx = W / 2, cy = H / 2;
      const bigR = Math.min(W, H) * 0.28; // Large resonator ring radius
      const persp = 0.32;

      // ── Central large resonator glow ──
      const mainGlow = ctx!.createRadialGradient(cx, cy, 0, cx, cy, bigR * 1.6);
      mainGlow.addColorStop(0, AMBER + "18");
      mainGlow.addColorStop(0.5, VIOLET + "08");
      mainGlow.addColorStop(1, "transparent");
      ctx!.beginPath(); ctx!.ellipse(cx, cy, bigR*1.6, bigR*1.6*persp*2.2, 0, 0, Math.PI*2);
      ctx!.fillStyle = mainGlow; ctx!.fill();

      // ── Central resonator rings ──
      [1.0, 0.72, 0.5].forEach((scale, ri) => {
        const col = ri===0 ? INDIGO : ri===1 ? VIOLET : AMBER;
        ctx!.beginPath(); ctx!.ellipse(cx, cy, bigR*scale, bigR*scale*persp, 0, 0, Math.PI*2);
        ctx!.strokeStyle = col + (ri===0?"55":"30"); ctx!.lineWidth = ri===0?2:1; ctx!.stroke();
      });

      // ── Gain medium: energy density gradient across ring ──
      for (let a = 0; a < Math.PI*2; a += 0.06) {
        const gainPulse = 0.5 + 0.5 * Math.sin(T * 2.5 + a * 4);
        const gx = cx + bigR * 0.86 * Math.cos(a);
        const gy = cy + bigR * 0.86 * persp * Math.sin(a);
        ctx!.beginPath(); ctx!.arc(gx, gy, 2.5 * gainPulse, 0, Math.PI*2);
        ctx!.fillStyle = AMBER + Math.round(gainPulse * 70).toString(16).padStart(2,"0");
        ctx!.fill();
      }

      // ── Standing wave energy density (radially) ──
      const waveN = 7; // n=7 mode
      for (let a = 0; a < Math.PI*2; a += 0.04) {
        const standing = Math.abs(Math.cos(waveN * a + T * 0.3));
        const rw = bigR * (0.5 + 0.5 * standing) * 0.9;
        const wx = cx + rw * Math.cos(a);
        const wy = cy + rw * persp * Math.sin(a);
        ctx!.beginPath(); ctx!.arc(wx, wy, 1, 0, Math.PI*2);
        ctx!.fillStyle = GREEN + "40"; ctx!.fill();
      }

      // ── Center label: MASSIVE GAIN REGION ──
      ctx!.font = `7px ${serif}`; ctx!.textAlign = "center"; ctx!.fillStyle = AMBER + "cc";
      ctx!.fillText("MASSIVE GAIN REGION", cx, cy - 5);
      ctx!.font = `6px ${mono}`; ctx!.fillStyle = AMBER + "60";
      ctx!.fillText("L = nλ/2  ·  Q = 2π·E/ΔE_cycle", cx, cy + 5);
      ctx!.fillText("R(t) = (a√t·cos(αt), a√t·sin(αt), vt)", cx, cy + 15);

      // ══ FOUR SUBSYSTEM PANELS ══
      const panels = [
        { key:"MODE LOCKING",    x:W*0.13, y:H*0.20, color:CYAN,
          desc:"δ-pulse train locks all cavity modes to a single frequency comb", sub:"Δf = c/2L" },
        { key:"PHASE LOCKING",   x:W*0.87, y:H*0.20, color:VIOLET,
          desc:"PLL locks maser phase to Cs isotope reference — δφ < 1 mrad", sub:"φ_lock = ΔE/ℏ·t" },
        { key:"INTERFERENCE\nGRID", x:W*0.13, y:H*0.80, color:LIME,
          desc:"2D constructive interference pattern maps energy density", sub:"∑ cos(kₙ·r) → max" },
        { key:"NODE CONTROL",    x:W*0.87, y:H*0.80, color:ROSE,
          desc:"Standing-wave node placement via phase-array steering", sub:"x_node = nλ/2" },
      ];

      // ── Connection beams from center to each subsystem ──
      panels.forEach(p => {
        const pulseFrac = 0.5 + 0.5*Math.sin(T*1.8 + p.x*0.02);
        const bx = cx + (p.x - cx)*pulseFrac;
        const by = cy + (p.y - cy)*pulseFrac;
        ctx!.beginPath(); ctx!.moveTo(cx, cy); ctx!.lineTo(p.x, p.y);
        ctx!.strokeStyle = p.color+"20"; ctx!.lineWidth=0.8; ctx!.stroke();
        // Traveling pulse
        ctx!.beginPath(); ctx!.arc(bx, by, 2.5, 0, Math.PI*2);
        ctx!.fillStyle = p.color+"cc"; ctx!.fill();
      });

      panels.forEach(p => {
        const bw = W*0.19, bh = 60;
        const bx = p.x - bw/2, by = p.y - bh/2;

        // Box background
        ctx!.fillStyle = `${p.color}10`; ctx!.fillRect(bx, by, bw, bh);
        ctx!.strokeStyle = p.color+"55"; ctx!.lineWidth=1;
        ctx!.strokeRect(bx, by, bw, bh);

        // Title
        ctx!.font = `7px ${serif}`; ctx!.textAlign = "center"; ctx!.fillStyle = p.color+"cc";
        p.key.split("\n").forEach((ln, li) => ctx!.fillText(ln, p.x, by+12+li*10));
        const titleH = p.key.split("\n").length * 10;

        // Sub-equation
        ctx!.font = `6px ${mono}`; ctx!.fillStyle = p.color+"88";
        ctx!.fillText(p.sub, p.x, by+titleH+14);

        // Animation specific to each subsystem
        if (p.key === "MODE LOCKING") {
          // Multiple modes → locked to one
          for (let m=0; m<4; m++) {
            const mx = bx+6, mw = bw-12;
            const my = by+bh-14 + (m-1.5)*3.5;
            const lockProgress = Math.min(1, Math.sin(T*0.6+m)*0.5+0.5);
            const freq = 1 + m * 0.7 * (1-lockProgress);
            ctx!.beginPath();
            for (let px=0; px<=mw; px+=1) {
              const v = Math.sin(freq * px*0.35 + T*(1+m*0.3)) * 2;
              if (px===0) ctx!.moveTo(mx+px, my+v); else ctx!.lineTo(mx+px, my+v);
            }
            ctx!.strokeStyle = CYAN+Math.round(40+lockProgress*80).toString(16).padStart(2,"0");
            ctx!.lineWidth=0.7; ctx!.stroke();
          }

        } else if (p.key === "PHASE LOCKING") {
          // PLL circle with locked pointer
          const plcx = p.x, plcy = by+bh-20;
          ctx!.beginPath(); ctx!.arc(plcx, plcy, 10, 0, Math.PI*2);
          ctx!.strokeStyle = VIOLET+"40"; ctx!.lineWidth=1; ctx!.stroke();
          const lockAngle = T*2 - Math.sin(T*2)*0.8; // converging
          const pa = [lockAngle, lockAngle + 0.3].map(a => ({
            x: plcx+10*Math.cos(a), y: plcy+10*Math.sin(a)
          }));
          ctx!.beginPath(); ctx!.moveTo(plcx,plcy); ctx!.lineTo(pa[0].x,pa[0].y);
          ctx!.strokeStyle=VIOLET+"cc"; ctx!.lineWidth=1.5; ctx!.stroke();
          ctx!.beginPath(); ctx!.moveTo(plcx,plcy); ctx!.lineTo(pa[1].x,pa[1].y);
          ctx!.strokeStyle=CYAN+"60"; ctx!.lineWidth=1; ctx!.stroke();
          ctx!.font=`6px ${mono}`; ctx!.fillStyle=VIOLET+"88";
          ctx!.fillText("PLL", plcx+13, plcy+3);

        } else if (p.key.startsWith("INTERFERENCE")) {
          // 2D interference dots
          const gx0 = bx+4, gy0 = by+bh-20, gw = bw-8, gh=16;
          for (let ix=0; ix<=gw; ix+=8) {
            for (let iy=0; iy<=gh; iy+=8) {
              const val = (Math.cos(ix*0.5 + T*1.5) + Math.cos(iy*0.5 + T*1.5))/2;
              const alpha = Math.max(0, val);
              ctx!.beginPath(); ctx!.arc(gx0+ix, gy0+iy, 2.5*alpha+0.5, 0, Math.PI*2);
              ctx!.fillStyle = LIME+Math.round(alpha*160).toString(16).padStart(2,"0");
              ctx!.fill();
            }
          }

        } else { // NODE CONTROL
          // Standing wave with moveable node markers
          const nx0 = bx+6, nw = bw-12;
          const ny = by+bh-14;
          ctx!.beginPath();
          for (let px=0; px<=nw; px+=1) {
            const v = Math.sin(7 * px/nw * Math.PI + T*0.4) * 5;
            if (px===0) ctx!.moveTo(nx0+px, ny+v); else ctx!.lineTo(nx0+px, ny+v);
          }
          ctx!.strokeStyle = ROSE+"80"; ctx!.lineWidth=1; ctx!.stroke();
          // Node dots (zeros of standing wave)
          for (let n=0; n<=7; n++) {
            const nodeX = nx0 + (n/7)*nw;
            ctx!.beginPath(); ctx!.arc(nodeX, ny, 2.5, 0, Math.PI*2);
            ctx!.fillStyle = ROSE + "cc"; ctx!.fill();
          }
        }
      });

      // ── Spin-time propulsion sequence (bottom strip) ──
      const steps = [
        { n:"1", label:"COHERENCE\nESTABLISHED", color:CYAN   },
        { n:"2", label:"SPIRAL\nSPIN-UP",        color:VIOLET },
        { n:"3", label:"ENERGY DENSITY\nGRADIENT",color:AMBER },
        { n:"4", label:"REACTIONLESS\nTHRUST",   color:GREEN  },
      ];
      const stripY = H * 0.91, stepW = W / 5;
      ctx!.font = `6px ${mono}`; ctx!.textAlign = "center";
      steps.forEach((s, i) => {
        const sx = stepW * 0.6 + i * stepW;
        const active = Math.floor(T * 0.5) % 4 === i;
        ctx!.beginPath(); ctx!.arc(sx, stripY, 8, 0, Math.PI*2);
        ctx!.fillStyle = s.color + (active ? "aa" : "25"); ctx!.fill();
        ctx!.fillStyle = s.color + (active ? "ff" : "60");
        ctx!.fillText(s.n, sx, stripY + 3);
        s.label.split("\n").forEach((ln, li) => {
          ctx!.font = `5px ${mono}`; ctx!.fillStyle = s.color + "80";
          ctx!.fillText(ln, sx, stripY + 14 + li * 7);
        });
        if (i < 3) {
          ctx!.beginPath(); ctx!.moveTo(sx+11, stripY); ctx!.lineTo(sx+stepW-11, stripY);
          ctx!.strokeStyle = s.color+"30"; ctx!.lineWidth=0.8; ctx!.stroke();
          const arrowFrac = ((T*0.5)%1);
          const ax = sx+11 + arrowFrac*(stepW-22);
          ctx!.beginPath(); ctx!.arc(ax, stripY, 2, 0, Math.PI*2);
          ctx!.fillStyle = s.color+"aa"; ctx!.fill();
        }
      });
      ctx!.font = `6px ${mono}`; ctx!.textAlign = "right"; ctx!.fillStyle = MUTED;
      ctx!.fillText("SPIN-TIME PROPULSION SEQUENCE →", W-8, H-6);
    }
    loop();
    return () => { cancelAnimationFrame(raf.current); window.removeEventListener("resize", resize); };
  }, []);
  return <canvas ref={cvRef} style={{ display:"block", width:"100%", height:310 }} />;
}

/* ══════════ DATA ══════════ */
const SPIN_EQS = [
  { label:"Golden angle",         eq:"α = 137.508°",                    note:"Derived from φ=(1+√5)/2: α = 360°(1−1/φ²). The angle that maximises angular spacing between consecutive points — densest packing with no repetition.", color:GOLD },
  { label:"Fermat spiral (r)",     eq:"rₙ = a√n",                       note:"Outward component: each successive point sits one unit of area further from the origin. The spiral expands uniformly in area, not radius.", color:CYAN },
  { label:"Fermat spiral (θ)",     eq:"θₙ = n · 137.508°",              note:"Upward component mapped to rotation: as n→∞ (time advances), the angle increments by exactly one golden angle. No two points share a spoke.", color:VIOLET },
  { label:"3D Helical Trajectory", eq:"R(t) = (a√t·cos(αt), a√t·sin(αt), vt)", note:"Adds the temporal axis z=vt to the Fermat spiral. As time advances the system spirals upward AND outward simultaneously — spin-time unity.", color:ROSE },
  { label:"Angular momentum",      eq:"L = I · ω",                      note:"I = moment of inertia. As r expands outward and I increases, ω must decrease to conserve L — the spin slows and spreads.", color:GREEN },
  { label:"Torsion tensor",        eq:"T^μ_νρ = Γ^μ_[νρ]",             note:"Non-zero when spin density ≠ 0 (Einstein-Cartan). The antisymmetric connection acts as additional force on geodesics — propulsion from rotation.", color:VIOLET },
  { label:"Frequency stability",   eq:"f = ΔE / h",                     note:"Isotope transition energy ΔE (nuclear hyperfine splitting) divided by Planck's constant gives the oscillator frequency — a physical constant.", color:TEAL },
  { label:"Gain region Q",         eq:"Q = 2π · E_stored / E_loss",     note:"Quality factor of the maser cavity. Gain regions (mode locking, phase locking) suppress all but the desired mode, maximising Q. High-Q → narrow linewidth.", color:AMBER },
];

const PHOTO_LIMITS = [
  { name:"Diffraction",         eq:"Δx ≥ λ / (2·NA)",         color:CYAN,
    note:"Fundamental spatial resolution limit. NA = n·sinθ (numerical aperture). Shorter wavelength → tighter focus. Microwave masers face large λ → large Δx." },
  { name:"Material Index",      eq:"n = c / v_phase",         color:TEAL,
    note:"The refractive index of the photorefractive medium sets the maximum Δn achievable before the host crystal lattice becomes the dominant constraint." },
  { name:"Thermal Distortion",  eq:"dn/dT · ΔT = Δn_therm",  color:AMBER,
    note:"High-intensity illumination deposits heat → dn/dT causes index drift. Thermal lens defocuses the stored grating. Superconducting cavities eliminate this via cryogenic walls." },
  { name:"Quantum Noise",       eq:"SNR = N_photon / √N",     color:VIOLET,
    note:"Shot noise floor from photon statistics. At high Q, thermal photons (kT/hν ≫ 1 in microwave) dominate. Requires cryogenic operation to reach quantum-noise limit." },
  { name:"Coherence Length",    eq:"L_c = λ² / Δλ",           color:ROSE,
    note:"The spatial extent over which interference is possible. Narrow linewidth maser → very large L_c → can record extremely fine gratings across the full resonator length." },
];

const AETHER_STACK = [
  { label:"TIME ▲",         sub:"Spiral gradient ascends",              color:VIOLET, icon:"∞" },
  { label:"SPIRAL EXPANSION", sub:"θₙ = n·α · rₙ = a√n",              color:INDIGO, icon:"φ" },
  { label:"MASER RING",     sub:"12 phased emitters · phase-locked",   color:CYAN,   icon:"◎" },
  { label:"TOROIDAL FIELD", sub:"Superconducting cavity · Q > 10⁹",    color:TEAL,   icon:"⊙" },
  { label:"ISOTOPE CORE",   sub:"¹³³Cs 9.193 GHz · f = ΔE/h",        color:GOLD,   icon:"⊛" },
  { label:"RESONANCE NODE", sub:"Antinode lock · δν < 1 mHz",         color:GREEN,  icon:"◉" },
];

const ISOTOPES = [
  { sym:"¹³³Cs",  name:"Caesium-133",   f:"9.192 631 770 GHz", spin:"7/2", color:GOLD,   app:"SI second definition · primary clock" },
  { sym:"⁸⁷Rb",   name:"Rubidium-87",   f:"6.834 682 611 GHz", spin:"3/2", color:CYAN,   app:"Portable fountain clock · gain lock" },
  { sym:"⁸⁷Sr",   name:"Strontium-87",  f:"429.228 004 229 THz",spin:"9/2",color:ROSE,   app:"Optical lattice clock · 10⁻¹⁸ precision" },
  { sym:"²H",     name:"Deuterium",     f:"327.384 352 MHz",   spin:"1",   color:VIOLET, app:"NMR reference · 21cm hydrogen line" },
  { sym:"³He",    name:"Helium-3",      f:"8.665 650 GHz",     spin:"1/2", color:GREEN,  app:"Maser · magnetometry · gain medium" },
  { sym:"¹H",     name:"Hydrogen",      f:"1.420 405 751 GHz", spin:"1/2", color:TEAL,   app:"Hydrogen maser · deep space clock" },
];

/* ══════════ MAIN PAGE ══════════ */
export default function TorsionResonatorPage() {
  const [tab, setTab] = useState<CanvasTab>("spin");

  const panelBox: React.CSSProperties = {
    background:PANEL, border:`1px solid ${BORDER}`,
    borderRadius:2, padding:"10px 12px", marginBottom:10, position:"relative",
  };
  const topLine = (c = GOLD) => (
    <div style={{ position:"absolute",top:0,left:0,right:0,height:1,
      background:`linear-gradient(90deg,${c},transparent)`,opacity:0.4 }} />
  );
  const SH = ({ label, color=GOLD }:{label:string;color?:string}) => (
    <div style={{ fontSize:7,letterSpacing:"0.2em",textTransform:"uppercase",
      color,marginBottom:6,borderBottom:`1px solid ${BORDER}`,paddingBottom:3 }}>
      {label}
    </div>
  );

  const tabs: [CanvasTab, string, string][] = [
    ["spin",           "GOLDEN SPIRAL · SPIN",   VIOLET],
    ["photorefractive","PHOTOREFRACTIVE LIMITS",  CYAN  ],
    ["cavity",         "TOROIDAL MASER CAVITY",   GREEN ],
    ["gain",           "GAIN REGIONS",            AMBER ],
  ];

  return (
    <div style={{ background:BG, minHeight:"100vh", color:TEXT, fontFamily:mono, overflowY:"auto" }}>

      {/* ── HEADER ── */}
      <div style={{ padding:"12px 20px 10px", borderBottom:`1px solid ${BORDER}`,
        background:"rgba(2,4,14,0.98)", position:"sticky", top:0, zIndex:20 }}>
        <div style={{ position:"absolute", bottom:0, left:0, right:0, height:1,
          background:`linear-gradient(90deg,transparent,${VIOLET},${CYAN},${GREEN},transparent)`,
          opacity:0.5 }} />
        <div style={{ maxWidth:1400, margin:"0 auto", display:"flex", alignItems:"center",
          justifyContent:"space-between", gap:12, flexWrap:"wrap" }}>
          <div>
            <div style={{ fontSize:7, letterSpacing:"0.2em", color:VIOLET, marginBottom:3 }}>
              AETHER · TORSION DYNAMICS · GOLDEN-ANGLE FERMAT SPIRAL · TOROIDAL MASER RESONATOR
            </div>
            <div style={{ fontFamily:serif, fontSize:20, letterSpacing:2, color:"#fff" }}>
              TORSION RESONATOR
            </div>
            <div style={{ fontFamily:body, fontStyle:"italic", fontSize:11, color:DIM, marginTop:2 }}>
              θₙ = n·137.508° · rₙ = a√n · photorefractive limits · toroidal maser · isotope oscillator · max-Q
            </div>
          </div>
          <div style={{ display:"flex", gap:4 }}>
            {tabs.map(([id,label,c])=>(
              <button key={id} onClick={()=>setTab(id)} style={{
                padding:"6px 12px", fontFamily:mono, fontSize:8, letterSpacing:"0.1em",
                cursor:"pointer", borderRadius:2, transition:"all 0.15s",
                border:`1px solid ${tab===id ? c : BORDER}`,
                background: tab===id ? `${c}18` : "transparent",
                color: tab===id ? c : MUTED,
              }}>{label}</button>
            ))}
          </div>
          <div style={{ fontFamily:body, fontStyle:"italic", fontSize:10, color:MUTED,
            maxWidth:200, lineHeight:1.65 }}>
            The golden angle distributes phase information outward along a Fibonacci lattice — the most perfect spatial encoding without resonance beating.
          </div>
        </div>
      </div>

      {/* ── BODY ── */}
      <div style={{ maxWidth:1400, margin:"0 auto", padding:"14px 20px 32px",
        display:"grid", gridTemplateColumns:"230px 1fr 265px", gap:12 }}>

        {/* ══ LEFT ══ */}
        <div>
          <div style={panelBox}>
            {topLine(VIOLET)}
            <SH label="Spin-Time Mathematics" color={VIOLET} />
            <div style={{ fontFamily:body, fontSize:10, color:MUTED, marginBottom:8, lineHeight:1.65 }}>
              Upward = time advancing. Outward = spatial radius expanding. The golden angle ensures no two spiral arms ever resonate — maximum Q, minimum cross-talk.
            </div>
            {SPIN_EQS.map(e=>(
              <div key={e.eq} style={{ marginBottom:7, padding:"6px 8px",
                borderLeft:`2px solid ${e.color}50`, background:`${e.color}06`, borderRadius:2 }}>
                <div style={{ fontSize:8, color:MUTED, marginBottom:2 }}>{e.label}</div>
                <div style={{ fontFamily:serif, fontSize:11, color:e.color, letterSpacing:0.5, marginBottom:3 }}>{e.eq}</div>
                <div style={{ fontFamily:body, fontSize:9, color:TEXT, lineHeight:1.55 }}>{e.note}</div>
              </div>
            ))}
          </div>

          {/* Photorefractive 5 limits */}
          <div style={panelBox}>
            {topLine(CYAN)}
            <SH label="5 Photorefractive Limits" color={CYAN} />
            {PHOTO_LIMITS.map(pl=>(
              <div key={pl.name} style={{ marginBottom:6, padding:"6px 8px",
                borderLeft:`2px solid ${pl.color}50`, background:`${pl.color}06`, borderRadius:2 }}>
                <div style={{ fontSize:8, fontWeight:"bold", color:pl.color, marginBottom:1 }}>{pl.name}</div>
                <div style={{ fontFamily:serif, fontSize:9, color:pl.color, marginBottom:3, letterSpacing:0.3 }}>{pl.eq}</div>
                <div style={{ fontFamily:body, fontSize:9, color:TEXT, lineHeight:1.5 }}>{pl.note}</div>
              </div>
            ))}
          </div>
        </div>

        {/* ══ CENTER ══ */}
        <div>
          {/* Canvas */}
          <div style={{ ...panelBox, padding:0, overflow:"hidden" }}>
            <div style={{ padding:"6px 12px 5px", borderBottom:`1px solid ${BORDER}`,
              display:"flex", justifyContent:"space-between", alignItems:"center" }}>
              <div style={{ fontSize:7, color:MUTED, letterSpacing:"0.15em", textTransform:"uppercase" }}>
                {tab==="spin"           ? "Golden-Angle Fermat Spiral (left: outward) · Torsion Helix (right: upward)" :
                 tab==="photorefractive"? "Kerr Saturation Curve · 5 Photorefractive Limits" :
                 tab==="cavity"         ? "Toroidal Maser Cavity · Phased Emitters · Isotope Core · Resonance Antinodes" :
                 "Mode Locking · Phase Locking · Interference Grid · Node Control · Spin-Time Sequence"}
              </div>
              <div style={{ fontSize:8, color:tab==="spin"?VIOLET:tab==="photorefractive"?CYAN:tab==="cavity"?GREEN:AMBER }}>
                {tab==="spin"?"R(t)=(a√t·cos(αt), a√t·sin(αt), vt)":tab==="photorefractive"?"Δn = n₂·I → Δnₛₐₜ":tab==="cavity"?"Q > 10⁹ toroid":"Q = 2π·E_stored/E_loss"}
              </div>
            </div>
            {tab==="spin"           && <SpinCanvas />}
            {tab==="photorefractive" && <PhotoCanvas />}
            {tab==="cavity"         && <CavityCanvas />}
            {tab==="gain"           && <GainCanvas />}
          </div>

          {/* AETHER resonance stack */}
          <div style={{ ...panelBox, border:`1px solid ${VIOLET}40` }}>
            {topLine(VIOLET)}
            <SH label="AETHER Resonance Architecture Stack" color={VIOLET} />
            <div style={{ display:"flex", flexDirection:"column", gap:3 }}>
              {AETHER_STACK.map((s, i) => (
                <div key={s.label}>
                  <div style={{ display:"flex", alignItems:"center", gap:8, padding:"7px 10px",
                    background:`${s.color}08`, border:`1px solid ${s.color}30`, borderRadius:2 }}>
                    <div style={{ fontFamily:serif, fontSize:16, color:s.color, width:22, textAlign:"center" }}>{s.icon}</div>
                    <div style={{ flex:1 }}>
                      <div style={{ fontSize:9, fontWeight:"bold", color:s.color, letterSpacing:0.5 }}>{s.label}</div>
                      <div style={{ fontSize:8, color:MUTED, fontFamily:body }}>{s.sub}</div>
                    </div>
                  </div>
                  {i < AETHER_STACK.length - 1 && (
                    <div style={{ textAlign:"center", fontSize:10, color:MUTED, lineHeight:1.2 }}>│</div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Maser gain region + Q factor */}
          <div style={{ ...panelBox, border:`1px solid ${GREEN}35` }}>
            {topLine(GREEN)}
            <SH label="Narrow Maser Gain Regions · Maximum Q" color={GREEN} />
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:8 }}>
              {[
                [VIOLET, "Gain Region", "Population inversion ΔN in active medium. Gain: g(ν) = σ·ΔN·φ(ν). Narrow Doppler: cryogenic or ion-trap medium squeezes linewidth below natural limit."],
                [CYAN,   "Toroidal Cavity", "Toroidal geometry eliminates end-mirror losses. Superconducting walls → near-zero resistance → Q = ω₀·L/(c·α) → Q > 10⁹. δν < 1 mHz achievable."],
                [GREEN,  "Isotope Lock", "f_iso = f₀ + δf_mass + δf_vol. Mass shift + nuclear volume effect. Lock to ¹³³Cs → Δf/f < 10⁻¹⁵. The most perfect Q attainable without an optical lattice clock."],
              ].map(([c,t,d])=>(
                <div key={t as string} style={{ padding:"8px", background:`${c}08`, border:`1px solid ${c}25`, borderRadius:2 }}>
                  <div style={{ fontFamily:serif, fontSize:12, color:c as string, marginBottom:5 }}>{t}</div>
                  <div style={{ fontFamily:body, fontSize:10, color:TEXT, lineHeight:1.7 }}>{d}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Synthesis quote */}
          <div style={{ ...panelBox, border:`1px solid ${GOLD}30` }}>
            {topLine()}
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10 }}>
              <div>
                <div style={{ fontFamily:serif, fontSize:12, color:GOLD, marginBottom:5 }}>Maximum Q — The Physical Meaning</div>
                <div style={{ fontFamily:body, fontSize:11, color:TEXT, lineHeight:1.8 }}>
                  Q = ω₀ · (energy stored) / (power lost). For a toroidal superconducting cavity, power loss → 0. The resonator stores oscillation energy indefinitely. In practice, Q &gt; 10⁹ means a signal injected today is still ringing in 11 days. The isotope oscillator provides the frequency; the toroid provides the storage. Together: a clock that forgets nothing.
                </div>
              </div>
              <div>
                <div style={{ fontFamily:serif, fontSize:12, color:CYAN, marginBottom:5 }}>Golden Angle · Why It Maximises Q</div>
                <div style={{ fontFamily:body, fontSize:11, color:TEXT, lineHeight:1.8 }}>
                  If the spiral used any rational multiple of π, points would cluster on spokes — creating resonance beating and cross-coupling between modes. The golden angle α = 137.508° is the "most irrational" number: it takes the longest to approximate by a rational fraction. This means the Fibonacci lattice has maximum angular separation between all N emitters — minimum cross-talk, maximum coherent addition, highest Q.
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ══ RIGHT ══ */}
        <div>
          {/* Isotope table */}
          <div style={{ ...panelBox, border:`1px solid ${GOLD}40` }}>
            {topLine()}
            <SH label="Isotope Oscillator · Transition Frequencies" color={GOLD} />
            <div style={{ fontFamily:body, fontSize:10, color:MUTED, marginBottom:8, lineHeight:1.6 }}>
              Each isotope's hyperfine transition provides an absolute frequency standard locked to nuclear spin — independent of any external reference.
            </div>
            {ISOTOPES.map(iso=>(
              <div key={iso.sym} style={{ marginBottom:6, padding:"7px 9px",
                background:`${iso.color}08`, border:`1px solid ${iso.color}25`, borderRadius:2 }}>
                <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:2 }}>
                  <div style={{ fontFamily:serif, fontSize:14, color:iso.color }}>{iso.sym}</div>
                  <div style={{ fontSize:7, color:iso.color }}>I = {iso.spin}</div>
                </div>
                <div style={{ fontSize:8, color:iso.color, marginBottom:2 }}>{iso.f}</div>
                <div style={{ fontSize:8, color:TEXT, marginBottom:2 }}>{iso.name}</div>
                <div style={{ fontFamily:body, fontSize:9, color:MUTED }}>{iso.app}</div>
              </div>
            ))}
            <div style={{ marginTop:6, padding:"6px 9px",
              background:`${GOLD}08`, border:`1px solid ${GOLD}20`, borderRadius:2 }}>
              <div style={{ fontFamily:serif, fontSize:11, color:GOLD, marginBottom:2 }}>
                f = ΔE / h
              </div>
              <div style={{ fontFamily:body, fontSize:9, color:MUTED, lineHeight:1.5 }}>
                ΔE = hyperfine transition energy. h = Planck constant. Stability: Δf/f &lt; 10⁻¹⁵ with Cs fountain.
              </div>
            </div>
          </div>

          {/* Toroidal resonator specs */}
          <div style={{ ...panelBox, border:`1px solid ${CYAN}30` }}>
            {topLine(CYAN)}
            <SH label="Toroidal Resonator · Architecture" color={CYAN} />
            {[
              ["Geometry",       "Toroidal — eliminates end-mirror diffraction loss"],
              ["Cavity walls",   "Superconducting (Nb or YBCO at 4K)"],
              ["Emitter count",  "12 phased microwave sources"],
              ["Phase locking",  "Synchronized via Cs-clock reference"],
              ["Mode structure", "Standing wave with n = 3, 5, 7, 9 modes"],
              ["Q factor",       "> 10⁹ (superconducting)"],
              ["Linewidth δν",   "< 1 mHz at 9 GHz"],
              ["Frequency ref",  "¹³³Cs 9.192 GHz hyperfine"],
              ["Spiral emitters","Golden-angle lattice (α=137.508°)"],
              ["Noise floor",    "Quantum noise limited at 4K"],
            ].map(([k,v])=>(
              <div key={k} style={{ display:"flex", justifyContent:"space-between", gap:8,
                padding:"3px 0", borderBottom:`1px solid ${BORDER}` }}>
                <span style={{ fontSize:8, color:MUTED, flexShrink:0 }}>{k}</span>
                <span style={{ fontSize:8, color:TEXT, textAlign:"right" }}>{v}</span>
              </div>
            ))}
          </div>

          {/* AETHER synthesis */}
          <div style={{ ...panelBox, border:`1px solid ${VIOLET}30` }}>
            {topLine(VIOLET)}
            <SH label="AETHER Synthesis" color={VIOLET} />
            <div style={{ fontFamily:body, fontSize:11, color:TEXT, lineHeight:1.85 }}>
              The Fibonacci lattice and the maser cavity are both answers to the same question: how do you pack information into space without resonance beating? The golden angle solves it geometrically. The toroidal superconducting cavity solves it electromagnetically. The isotope oscillator solves it atomically. All three use the same mathematical principle:{" "}
              <span style={{ color:GOLD }}>the most irrational number produces the most stable encoding.</span>
              {" "}AETHER's coherence function C(x,t) is the same operation — compressing information into a representation with minimum self-interference.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
