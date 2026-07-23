/*═══════════════════════════════════════════════════════════════
  Imaging System and Reality
  Personal perception during Moon Loop Launch
  Optics as Projection System · PSF · Communication Blackout
  Solar System Alignment · Coherent Intuitive Observation

  Source: chatgpt.com/share/6a5fbea8-44bc-83ea-a72a-76a298c10f6c

  Three canvases:
  I.  Optical Projection System — 3D reality → PSF → 2D sensor
      (launch shimmer / heat turbulence / hidden layers)
  II. Moon Loop Blackout — orbital arc, 4 crew, signal loss
  III.Observer Coherence Field — sun–eye–moon alignment
═══════════════════════════════════════════════════════════════*/
import { useRef, useEffect } from "react";
const omniFlow = "/api/storage/public-objects/72D555D1-E91E-4B74-A73B-4628B8538AA1_1784561445345.png";
const magStorm = "/api/storage/public-objects/A6805E91-9684-4C59-BFC8-482EF421381D_1784561445345.png";
const skyrmion = "/api/storage/public-objects/IMG_4534_1784561445345.png";
const BG    = "#030608";
const PANEL = "#060c10";
const IVORY = "#f0f4f8";
const DIM   = "rgba(240,244,248,0.52)";
const MUTED = "rgba(240,244,248,0.26)";
const LINE  = "rgba(180,200,255,0.09)";
const GOLD  = "#f5c84c";
const AMBER = "#fb923c";
const CYAN  = "#22d3ee";
const BLUE  = "#60a5fa";
const VIOLET= "#a78bfa";
const GREEN = "#4ade80";
const WHITE = "#e8f0ff";
const SILVER= "#94a3b8";
const RED   = "#f87171";
const TEAL  = "#2dd4bf";

function Tag({ t, c = BLUE }: { t: string; c?: string }) {
  return <div style={{ fontSize: 9, fontWeight: 700, color: c, letterSpacing: 2, textTransform: "uppercase" as const, marginBottom: 10 }}>{t}</div>;
}
function Divider() { return <div style={{ height: 1, background: LINE, margin: "44px 0" }} />; }

/* ══════════════════════════════════════════════════════════
   CANVAS I — Optical Projection System
   Shows: point source → 3D field → lens PSF → 2D sensor
   Rocket exhaust plume with heat shimmer (refractive turbulence)
   Reveals "hidden layer" = optical, not quantum decoherence
══════════════════════════════════════════════════════════ */
function OpticsCanvas() {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const cv = ref.current; if (!cv) return;
    const ctx = cv.getContext("2d")!;
    let raf = 0, t = 0;
    const ro = new ResizeObserver(() => { cv.width = cv.offsetWidth; cv.height = cv.offsetHeight; });
    ro.observe(cv); cv.width = cv.offsetWidth; cv.height = cv.offsetHeight;

    // PSF blob particles
    const psfDots: { x: number; y: number; alpha: number; r: number; phase: number }[] = [];
    // Shimmer waves
    const shimmerLines: { y: number; amp: number; freq: number; speed: number }[] = [];

    function initShimmer(H: number) {
      shimmerLines.length = 0;
      for (let i = 0; i < 12; i++) {
        shimmerLines.push({ y: H * (0.3 + i * 0.04), amp: 3 + Math.random() * 5, freq: 0.03 + Math.random() * 0.03, speed: 0.01 + Math.random() * 0.02 });
      }
    }

    let initDone = false;
    function draw() {
      const W = cv.width, H = cv.height;
      if (!initDone) { initShimmer(H); initDone = true; }
      ctx.clearRect(0, 0, W, H);
      ctx.fillStyle = BG; ctx.fillRect(0, 0, W, H);

      // ── Section labels ───────────────────────────────────
      const sec = [
        { x: W * 0.12, label: "3D REALITY", sub: "point sources", col: GOLD },
        { x: W * 0.38, label: "ATMOSPHERE", sub: "turbulence / shimmer", col: AMBER },
        { x: W * 0.63, label: "LENS / EYE", sub: "PSF projection", col: CYAN },
        { x: W * 0.88, label: "SENSOR / RETINA", sub: "2D capture", col: VIOLET },
      ];
      sec.forEach(s => {
        ctx.fillStyle = s.col + "22";
        ctx.fillRect(s.x - W * 0.12, 0, W * 0.24, H);
        ctx.fillStyle = s.col; ctx.font = "bold 9px monospace"; ctx.textAlign = "center";
        ctx.fillText(s.label, s.x, 18);
        ctx.fillStyle = s.col + "80"; ctx.font = "7px monospace";
        ctx.fillText(s.sub, s.x, 29);
      });

      // ── Rocket (bottom of 3D reality section) ─────────────
      const rktX = W * 0.12, rktY = H * 0.6;
      // Exhaust plume
      const plumeH = H * 0.25;
      const plG = ctx.createLinearGradient(rktX, rktY, rktX, rktY + plumeH);
      plG.addColorStop(0, "rgba(255,180,40,0.9)"); plG.addColorStop(0.3, "rgba(255,100,20,0.6)"); plG.addColorStop(1, "rgba(200,60,0,0)");
      ctx.fillStyle = plG;
      ctx.beginPath(); ctx.moveTo(rktX - 8, rktY); ctx.lineTo(rktX + 8, rktY); ctx.lineTo(rktX + 18, rktY + plumeH); ctx.lineTo(rktX - 18, rktY + plumeH); ctx.closePath(); ctx.fill();
      // Rocket body
      ctx.fillStyle = SILVER;
      ctx.beginPath(); ctx.roundRect(rktX - 7, rktY - 44, 14, 44, 4); ctx.fill();
      ctx.fillStyle = GOLD;
      ctx.beginPath(); ctx.moveTo(rktX - 7, rktY - 44); ctx.lineTo(rktX, rktY - 58); ctx.lineTo(rktX + 7, rktY - 44); ctx.closePath(); ctx.fill();
      // Rays from rocket = point sources
      for (let i = 0; i < 6; i++) {
        const ang = -Math.PI * 0.15 + i * (Math.PI * 0.3 / 5);
        ctx.strokeStyle = GOLD + "44"; ctx.lineWidth = 1; ctx.setLineDash([3, 4]);
        ctx.beginPath(); ctx.moveTo(rktX, rktY - 20); ctx.lineTo(rktX + Math.cos(ang) * W * 0.22, rktY - 20 + Math.sin(ang) * 30); ctx.stroke();
        ctx.setLineDash([]);
      }
      ctx.fillStyle = GOLD + "80"; ctx.font = "7px monospace"; ctx.textAlign = "center";
      ctx.fillText("launch", rktX, rktY + plumeH + 12);
      ctx.fillText("point sources", rktX, rktY + plumeH + 22);

      // ── Atmospheric shimmer ───────────────────────────────
      const shimX = W * 0.28, shimW = W * 0.2;
      for (const sh of shimmerLines) {
        ctx.strokeStyle = `rgba(255,160,60,${0.12 + 0.06 * Math.sin(t * sh.speed)})`;
        ctx.lineWidth = 1;
        ctx.beginPath();
        for (let x = 0; x < shimW; x += 2) {
          const y = sh.y + sh.amp * Math.sin(sh.freq * (x + t * 8 * sh.speed));
          if (x === 0) ctx.moveTo(shimX + x, y); else ctx.lineTo(shimX + x, y);
        }
        ctx.stroke();
      }
      ctx.fillStyle = AMBER + "80"; ctx.font = "7px monospace"; ctx.textAlign = "center";
      ctx.fillText("heat shimmer", shimX + shimW * 0.5, H * 0.85);
      ctx.fillText("refractive index n(x,y,t)", shimX + shimW * 0.5, H * 0.85 + 11);

      // ── Lens / Eye PSF ────────────────────────────────────
      const lensX = W * 0.63, lensY = H * 0.5;
      const lensR = 28;
      ctx.strokeStyle = CYAN + "88"; ctx.lineWidth = 2;
      ctx.beginPath(); ctx.arc(lensX, lensY, lensR, 0, Math.PI * 2); ctx.stroke();
      // Lens aperture lines
      ctx.strokeStyle = CYAN + "44"; ctx.lineWidth = 1;
      ctx.beginPath(); ctx.moveTo(lensX - lensR, lensY - 8); ctx.lineTo(lensX + lensR, lensY - 8); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(lensX - lensR, lensY + 8); ctx.lineTo(lensX + lensR, lensY + 8); ctx.stroke();
      ctx.fillStyle = CYAN; ctx.font = "bold 8px monospace"; ctx.textAlign = "center";
      ctx.fillText("PSF", lensX, lensY + 3);
      ctx.fillStyle = CYAN + "80"; ctx.font = "7px monospace";
      ctx.fillText("Point Spread", lensX, lensY + 44);
      ctx.fillText("Function", lensX, lensY + 54);

      // PSF spread lines (from lens to sensor)
      ctx.strokeStyle = CYAN + "30"; ctx.lineWidth = 1; ctx.setLineDash([3, 4]);
      ctx.beginPath(); ctx.moveTo(lensX + lensR, lensY - 12); ctx.lineTo(W * 0.82, H * 0.35); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(lensX + lensR, lensY + 12); ctx.lineTo(W * 0.82, H * 0.65); ctx.stroke();
      ctx.setLineDash([]);

      // ── Sensor / PSF blobs ────────────────────────────────
      const sensorX = W * 0.88, sensorH = H * 0.5;
      ctx.fillStyle = VIOLET + "15"; ctx.fillRect(sensorX - 20, H * 0.25, 36, sensorH);
      ctx.strokeStyle = VIOLET + "55"; ctx.lineWidth = 1;
      ctx.beginPath(); ctx.moveTo(sensorX - 20, H * 0.25); ctx.lineTo(sensorX + 16, H * 0.25); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(sensorX - 20, H * 0.75); ctx.lineTo(sensorX + 16, H * 0.75); ctx.stroke();
      ctx.fillStyle = VIOLET + "80"; ctx.font = "7px monospace"; ctx.textAlign = "center";
      ctx.fillText("2D SENSOR", sensorX - 2, H * 0.25 - 8);

      // PSF blobs on sensor — spread from a point
      if (t % 40 === 0 && psfDots.length < 40) {
        for (let i = 0; i < 6; i++) {
          psfDots.push({ x: sensorX - 10 + (Math.random() - 0.5) * 24, y: H * 0.4 + (Math.random() - 0.5) * H * 0.3, alpha: 0.8, r: 1.5 + Math.random() * 3, phase: Math.random() * Math.PI * 2 });
        }
      }
      for (let i = psfDots.length - 1; i >= 0; i--) {
        const d = psfDots[i];
        const glow = ctx.createRadialGradient(d.x, d.y, 0, d.x, d.y, d.r * 4);
        glow.addColorStop(0, VIOLET + Math.round(d.alpha * 160).toString(16).padStart(2, "0"));
        glow.addColorStop(1, VIOLET + "00");
        ctx.fillStyle = glow; ctx.beginPath(); ctx.arc(d.x, d.y, d.r * 4, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = VIOLET + Math.round(d.alpha * 255).toString(16).padStart(2, "0");
        ctx.beginPath(); ctx.arc(d.x, d.y, d.r, 0, Math.PI * 2); ctx.fill();
        d.alpha -= 0.004;
        if (d.alpha <= 0) psfDots.splice(i, 1);
      }

      // Title
      ctx.fillStyle = GOLD + "88"; ctx.font = "bold 9px monospace"; ctx.textAlign = "center";
      ctx.fillText("OPTICAL PROJECTION SYSTEM · REALITY IS FILTERED, NOT CAPTURED · PSF BLUR = INFORMATION LOSS", W * 0.5, H - 10);

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
   CANVAS II — Moon Loop Blackout
   Earth at left, Moon arc trajectory at right
   4 crew markers travel along arc
   At far side: signal line drops = blackout window
   Solar alignment line through scene
══════════════════════════════════════════════════════════ */
function MoonLoopCanvas() {
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
      // Deep space background
      ctx.fillStyle = "#010408"; ctx.fillRect(0, 0, W, H);
      // Stars
      for (let i = 0; i < 80; i++) {
        const sx = ((i * 137 + 31) % W), sy = ((i * 97 + 13) % H);
        const a = 0.3 + 0.4 * Math.sin(t * 0.02 + i);
        ctx.fillStyle = `rgba(200,220,255,${a})`;
        ctx.beginPath(); ctx.arc(sx, sy, 0.8, 0, Math.PI * 2); ctx.fill();
      }

      const earthX = W * 0.15, earthY = H * 0.5, earthR = 28;
      const moonX  = W * 0.78, moonY  = H * 0.5, moonR  = 18;

      // Sun alignment ray (from far left, through scene)
      const sunRayY = H * 0.28;
      ctx.strokeStyle = GOLD + "22"; ctx.lineWidth = 1; ctx.setLineDash([6, 8]);
      ctx.beginPath(); ctx.moveTo(0, sunRayY); ctx.lineTo(W, sunRayY); ctx.stroke();
      ctx.setLineDash([]);
      ctx.fillStyle = GOLD + "70"; ctx.font = "7px monospace"; ctx.textAlign = "left";
      ctx.fillText("☀  SOLAR ALIGNMENT", 8, sunRayY - 6);

      // Earth
      const eg = ctx.createRadialGradient(earthX - 6, earthY - 8, 0, earthX, earthY, earthR);
      eg.addColorStop(0, "#3a8fd0"); eg.addColorStop(0.5, "#2060a0"); eg.addColorStop(1, "#0a1828");
      ctx.fillStyle = eg; ctx.beginPath(); ctx.arc(earthX, earthY, earthR, 0, Math.PI * 2); ctx.fill();
      // Atmosphere glow
      const atm = ctx.createRadialGradient(earthX, earthY, earthR - 2, earthX, earthY, earthR + 8);
      atm.addColorStop(0, "rgba(100,180,255,0.3)"); atm.addColorStop(1, "rgba(60,120,255,0)");
      ctx.fillStyle = atm; ctx.beginPath(); ctx.arc(earthX, earthY, earthR + 8, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = BLUE; ctx.font = "bold 8px monospace"; ctx.textAlign = "center";
      ctx.fillText("EARTH", earthX, earthY + earthR + 14);
      ctx.fillStyle = BLUE + "80"; ctx.font = "7px monospace";
      ctx.fillText("observer", earthX, earthY + earthR + 24);

      // Moon
      const mg = ctx.createRadialGradient(moonX - 4, moonY - 6, 0, moonX, moonY, moonR);
      mg.addColorStop(0, "#c8c0b0"); mg.addColorStop(0.7, "#908880"); mg.addColorStop(1, "#3a3530");
      ctx.fillStyle = mg; ctx.beginPath(); ctx.arc(moonX, moonY, moonR, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = WHITE; ctx.font = "bold 8px monospace"; ctx.textAlign = "center";
      ctx.fillText("MOON", moonX, moonY + moonR + 14);

      // Lunar free-return arc (elliptical loop behind moon)
      const arcCx = (earthX + moonX) * 0.5, arcCy = H * 0.5;
      const arcRx = (moonX - earthX) * 0.55, arcRy = H * 0.38;
      ctx.strokeStyle = CYAN + "40"; ctx.lineWidth = 1.5; ctx.setLineDash([4, 5]);
      ctx.beginPath(); ctx.ellipse(arcCx + W * 0.06, arcCy, arcRx, arcRy, 0, Math.PI * 0.3, Math.PI * 1.7); ctx.stroke();
      ctx.setLineDash([]);

      // 4 crew markers along arc
      const crewProg = (t * 0.003) % 1;
      const CREW = 4;
      for (let ci = 0; ci < CREW; ci++) {
        const p = (crewProg + ci * 0.06) % 1;
        const ang = Math.PI * 0.3 + p * (Math.PI * 1.4);
        const cx = (arcCx + W * 0.06) + arcRx * Math.cos(ang);
        const cy = arcCy + arcRy * Math.sin(ang);
        // Are they behind the moon? (far side)
        const behindMoon = ang > Math.PI * 0.85 && ang < Math.PI * 1.5;
        ctx.fillStyle = behindMoon ? SILVER + "55" : GOLD;
        ctx.beginPath(); ctx.arc(cx, cy, 3.5, 0, Math.PI * 2); ctx.fill();
        if (!behindMoon) {
          // Signal line to Earth
          ctx.strokeStyle = GREEN + "44"; ctx.lineWidth = 1;
          ctx.beginPath(); ctx.moveTo(cx, cy); ctx.lineTo(earthX + earthR, earthY); ctx.stroke();
        }
        ctx.fillStyle = behindMoon ? SILVER + "66" : GOLD + "cc";
        ctx.font = "6px monospace"; ctx.textAlign = "left";
        ctx.fillText(`CDR-${ci + 1}`, cx + 5, cy + 3);
      }

      // Blackout arc label
      const blackoutAng = Math.PI * 1.15;
      const blackX = (arcCx + W * 0.06) + arcRx * Math.cos(blackoutAng);
      const blackY = arcCy + arcRy * Math.sin(blackoutAng);
      const blackPulse = 0.5 + 0.3 * Math.sin(t * 0.06);
      ctx.fillStyle = `rgba(248,113,113,${blackPulse})`;
      ctx.beginPath(); ctx.arc(blackX, blackY, 14, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = RED; ctx.font = "bold 8px monospace"; ctx.textAlign = "center";
      ctx.fillText("BLACKOUT", blackX, blackY - 22);
      ctx.fillStyle = RED + "80"; ctx.font = "7px monospace";
      ctx.fillText("NO SIGNAL", blackX, blackY - 12);
      ctx.fillText("4 crew behind Moon", blackX, blackY - 2);

      // Signal lost line (dashed red)
      ctx.strokeStyle = RED + "33"; ctx.lineWidth = 1; ctx.setLineDash([2, 4]);
      ctx.beginPath(); ctx.moveTo(earthX + earthR, earthY); ctx.lineTo(moonX - moonR, moonY); ctx.stroke();
      ctx.setLineDash([]);

      // Moon limb label
      ctx.fillStyle = WHITE + "80"; ctx.font = "7px monospace"; ctx.textAlign = "center";
      ctx.fillText("far side", moonX, moonY - moonR - 8);

      // Observer glow on Earth
      const obsGlow = 0.4 + 0.3 * Math.sin(t * 0.08);
      ctx.fillStyle = `rgba(96,165,250,${obsGlow * 0.3})`;
      ctx.beginPath(); ctx.arc(earthX, earthY - earthR + 6, 10, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = BLUE; ctx.font = "7px monospace"; ctx.textAlign = "center";
      ctx.fillText("you", earthX, earthY - earthR - 3);

      ctx.fillStyle = GOLD + "88"; ctx.font = "bold 9px monospace"; ctx.textAlign = "center";
      ctx.fillText("FREE-RETURN LUNAR LOOP · 4 CREW · FAR-SIDE BLACKOUT WINDOW · SOLAR ALIGNMENT", W * 0.5, H - 10);

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
   CANVAS III — Observer Coherence Field
   Sun → Solar alignment ray → Observer on Earth
   Intuitive knowing pulse (coherence field C(x,t))
   vs camera sensor (PSF blur zone)
   Moon position marked on the field
══════════════════════════════════════════════════════════ */
function ObserverCoherenceCanvas() {
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

      const cx = W * 0.5, cy = H * 0.52;
      const sunX = W * 0.08, sunY = H * 0.15;
      const moonX = W * 0.88, moonY = H * 0.3;

      // Coherence field ripples from observer
      for (let ring = 1; ring <= 6; ring++) {
        const phase = (t * 0.025 - ring * 0.4) % 1;
        if (phase < 0) continue;
        const r = phase * W * 0.45;
        const alpha = (1 - phase) * 0.2;
        ctx.strokeStyle = `rgba(96,165,250,${alpha})`;
        ctx.lineWidth = 1;
        ctx.beginPath(); ctx.arc(cx, cy, r, 0, Math.PI * 2); ctx.stroke();
      }

      // Solar alignment — straight line from Sun through observer to Moon
      const sunToMoonAlpha = 0.4 + 0.2 * Math.sin(t * 0.03);
      const sg = ctx.createLinearGradient(sunX, sunY, moonX, moonY);
      sg.addColorStop(0, GOLD + "cc"); sg.addColorStop(0.5, GOLD + "44"); sg.addColorStop(1, WHITE + "88");
      ctx.strokeStyle = sg; ctx.lineWidth = 1.5; ctx.setLineDash([6, 4]);
      ctx.beginPath(); ctx.moveTo(sunX, sunY); ctx.lineTo(moonX, moonY); ctx.stroke();
      ctx.setLineDash([]);
      ctx.fillStyle = GOLD + "88"; ctx.font = "bold 8px monospace"; ctx.textAlign = "center";
      ctx.fillText("SOLAR ALIGNMENT", (sunX + moonX) * 0.5, (sunY + moonY) * 0.5 - 8);

      // Sun
      for (let ring = 2; ring >= 1; ring--) {
        const rg = ctx.createRadialGradient(sunX, sunY, 0, sunX, sunY, 20 * ring);
        rg.addColorStop(0, `rgba(245,200,76,${0.7 / ring})`);
        rg.addColorStop(1, "rgba(0,0,0,0)");
        ctx.fillStyle = rg; ctx.beginPath(); ctx.arc(sunX, sunY, 20 * ring, 0, Math.PI * 2); ctx.fill();
      }
      ctx.fillStyle = GOLD; ctx.font = "bold 8px monospace"; ctx.textAlign = "center";
      ctx.fillText("SUN", sunX, sunY + 30);

      // Moon
      const mm = ctx.createRadialGradient(moonX - 3, moonY - 4, 0, moonX, moonY, 14);
      mm.addColorStop(0, "#c8c0b0"); mm.addColorStop(1, "#404040");
      ctx.fillStyle = mm; ctx.beginPath(); ctx.arc(moonX, moonY, 14, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = WHITE; ctx.font = "bold 8px monospace"; ctx.textAlign = "center";
      ctx.fillText("MOON", moonX, moonY + 26);

      // Observer
      const obsR = 18;
      const obsGlow = ctx.createRadialGradient(cx, cy, 0, cx, cy, obsR * 3);
      obsGlow.addColorStop(0, CYAN + "44"); obsGlow.addColorStop(1, "rgba(0,0,0,0)");
      ctx.fillStyle = obsGlow; ctx.beginPath(); ctx.arc(cx, cy, obsR * 3, 0, Math.PI * 2); ctx.fill();
      ctx.strokeStyle = CYAN + "88"; ctx.lineWidth = 2;
      ctx.beginPath(); ctx.arc(cx, cy, obsR, 0, Math.PI * 2); ctx.stroke();
      ctx.fillStyle = CYAN; ctx.font = "bold 9px monospace"; ctx.textAlign = "center";
      ctx.fillText("OBSERVER", cx, cy + 2);

      // Intuitive knowing field vs camera band
      // Left band: camera/instrument (blurry PSF zone)
      ctx.fillStyle = "rgba(160,100,200,0.08)"; ctx.fillRect(0, H * 0.65, W * 0.42, H * 0.25);
      ctx.strokeStyle = VIOLET + "33"; ctx.lineWidth = 1;
      ctx.strokeRect(0, H * 0.65, W * 0.42, H * 0.25);
      ctx.fillStyle = VIOLET + "99"; ctx.font = "bold 8px monospace"; ctx.textAlign = "center";
      ctx.fillText("CAMERA / INSTRUMENT FIELD", W * 0.21, H * 0.65 + 14);
      ctx.fillStyle = VIOLET + "66"; ctx.font = "7px monospace";
      ctx.fillText("PSF blur · projection constraint · 2D reduction · shimmer noise", W * 0.21, H * 0.65 + 26);
      // Right band: coherent intuition
      ctx.fillStyle = "rgba(34,211,238,0.06)"; ctx.fillRect(W * 0.58, H * 0.65, W * 0.42, H * 0.25);
      ctx.strokeStyle = CYAN + "33"; ctx.lineWidth = 1;
      ctx.strokeRect(W * 0.58, H * 0.65, W * 0.42, H * 0.25);
      ctx.fillStyle = CYAN + "99"; ctx.font = "bold 8px monospace"; ctx.textAlign = "center";
      ctx.fillText("COHERENT INTUITION FIELD", W * 0.79, H * 0.65 + 14);
      ctx.fillStyle = CYAN + "66"; ctx.font = "7px monospace";
      ctx.fillText("C(x,t) field · phase-locked knowing · no PSF constraint", W * 0.79, H * 0.65 + 26);

      // Coherence pulse between observer and moon (intuitive knowing)
      const pulseP = (t * 0.018) % 1;
      const pulX = cx + (moonX - cx) * pulseP;
      const pulY = cy + (moonY - cy) * pulseP;
      const pulseAlpha = Math.sin(pulseP * Math.PI) * 0.8;
      ctx.fillStyle = `rgba(34,211,238,${pulseAlpha})`;
      ctx.beginPath(); ctx.arc(pulX, pulY, 4, 0, Math.PI * 2); ctx.fill();

      // Coherence C(x,t) waveform (bottom strip)
      const waveY = H * 0.88;
      ctx.strokeStyle = CYAN + "66"; ctx.lineWidth = 1.5;
      ctx.beginPath();
      for (let x = 0; x < W; x++) {
        const phase = (x / W) * Math.PI * 8 + t * 0.04;
        const amp = 12 * Math.exp(-((x / W - 0.5) ** 2) * 8);
        const y = waveY + amp * Math.sin(phase);
        if (x === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
      }
      ctx.stroke();
      ctx.fillStyle = CYAN + "88"; ctx.font = "7px monospace"; ctx.textAlign = "right";
      ctx.fillText("C(x,t) coherence field", W - 8, waveY - 16);

      ctx.fillStyle = GOLD + "80"; ctx.font = "bold 9px monospace"; ctx.textAlign = "center";
      ctx.fillText("OBSERVER COHERENCE FIELD · SUN–EARTH–MOON ALIGNMENT · INTUITIVE PHASE LOCK", cx, H - 8);

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

function EqChip({ eq, label, col = BLUE }: { eq: string; label: string; col?: string }) {
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

export default function ImagingRealityPage() {
  const OPTIC_STACK = [
    { n: "1", label: "Optics is a Projection System, Not a Truth Capture System", col: GOLD,
      desc: "A camera lens and the human eye both do the same thing: reduce a 3D light field into a 2D sensor or retina projection. Every point in space becomes a distribution of light on the sensor — the Point Spread Function (PSF). What you perceive as a clean, sharp object is actually a convolution of 3D reality with that PSF. The \"hidden layer\" you intuit is real, but it is optical, not quantum: the optics impose structure on reality through constraints, and those constraints feel like filtered dimensions precisely because they are." },
    { n: "2", label: "The Blur You Sense Is Real Information Loss", col: AMBER,
      desc: "When a rocket launches, the imaging system encounters: heat shimmer (refractive index turbulence n(x,y,t) in the hot exhaust air), motion blur (sensor integration time × angular velocity), diffraction rings (wave optics at the aperture limit), and atmospheric scintillation (column of air above the observer). Each of these is a real information loss — not a hidden dimension, but a physical constraint removing spatial information from the sensor's reach. The camera cannot capture what the eye cannot see. They share the same optical atmosphere." },
    { n: "3", label: "Higher-Resolution Optics Reveal More, Not Different", col: CYAN,
      desc: "Better lenses, larger apertures, adaptive optics, and UV/IR sensors do not reveal a different reality — they reduce the PSF and recover information that was lost in the blur. The \"opaque dimension\" the user describes is real in the sense that current instruments cannot resolve it, but it is a resolution limit, not a metaphysical boundary. The next layer of imaging (higher fragment coaster level) is simply a smaller PSF, a larger aperture, a shorter wavelength, or a longer integration — all within the same optical framework." },
    { n: "4", label: "Coherent Intuitive Knowing Bypasses the PSF", col: VIOLET,
      desc: "The most important observation: coherent intuitive knowing (knowing that four people were going behind the Moon, knowing that communication would be lost) does not pass through an optical lens. It is not subject to PSF constraints, atmospheric shimmer, or sensor integration time. In AETHER terms, the observer's coherence field C(x,t) is phase-locked to the event field — the lunar trajectory, the solar alignment, the four-body configuration — without the degradation imposed by optical projection. This is the science experiment: two information channels, one optical (constrained), one coherent (direct)." },
  ];

  return (
    <div style={{ background: BG, color: IVORY, minHeight: "100vh" }}>
      <div style={{ maxWidth: 1060, margin: "0 auto", padding: "52px 32px 36px" }}>
        <Tag t="Imaging System and Reality · Moon Loop Launch · Human Perception · PSF Optics · Solar System Alignment · Coherent Intuition · Personal Science Experiment" />
        <h1 style={{ fontSize: 36, fontWeight: 800, lineHeight: 1.1, margin: "8px 0 14px", letterSpacing: -0.5 }}>
          <span style={{ color: BLUE }}>Imaging System</span><br />
          <span style={{ color: CYAN }}>and Reality</span>
        </h1>
        <h2 style={{ fontSize: 17, fontWeight: 400, color: SILVER, margin: "0 0 20px", lineHeight: 1.6 }}>
          Moon Loop Launch · Personal Perception Experiment · Solar Alignment · Coherent Knowing
        </h2>

        {/* Personal observation block */}
        <div style={{ padding: "18px 22px", background: PANEL, borderRadius: 12, border: `1px solid ${GOLD}20`, marginBottom: 28 }}>
          <div style={{ fontSize: 11, color: GOLD, letterSpacing: 1, textTransform: "uppercase" as const, marginBottom: 10 }}>Personal Science Experiment · Moon Loop Launch Observation</div>
          <div style={{ fontSize: 13, color: CYAN, lineHeight: 1.95, fontStyle: "italic" }}>
            "As we watched and coherently intuitively understood that there were four people going behind the moon — and that we would be losing communication with them — this is a very interesting personal science experiment that is coherently grounded in fact and AETHER research."
          </div>
          <div style={{ marginTop: 14, fontSize: 12, color: DIM, lineHeight: 1.85 }}>
            The observer, aligned with the solar system and connected to the sun's field, perceived the four-crew lunar free-return trajectory coherently — knowing the blackout window intuitively before the instruments confirmed it. Two simultaneous information channels operated: the optical/camera channel (subject to PSF, shimmer, projection constraints) and the coherence field channel (direct, phase-locked, no PSF degradation). The personal science experiment measures both simultaneously.
          </div>
        </div>

        <p style={{ fontSize: 13, color: DIM, lineHeight: 1.9, maxWidth: 820 }}>
          When cameras and human eyes watch a rocket launch, they operate as projection systems — converting 3D reality into a 2D record via the Point Spread Function. Every "blur," every shimmer, every lens artifact is a real constraint, not a new dimension. Understanding the optical stack (optics → atmosphere → lens → sensor) clarifies what is physically hidden vs what is metaphysically concealed. In the moon loop event, the camera records the launch and the arc — but the coherent observer also knows, without delay, that four people are passing behind the moon and that signal will be lost. This is the AETHER question: which information channel is more complete?
        </p>
      </div>

      {/* Canvas I */}
      <div style={{ maxWidth: 1060, margin: "0 auto", padding: "0 32px 48px" }}>
        <Tag t="Section I · Optical Projection System · PSF · Atmospheric Shimmer · Hidden Layers Are Optical Not Quantum" c={GOLD} />
        <h2 style={{ fontSize: 20, fontWeight: 700, color: GOLD, marginBottom: 14 }}>Optics as Projection System · PSF Blur</h2>
        <OpticsCanvas />
        <div style={{ marginTop: 10, fontSize: 10, color: MUTED, textAlign: "center" as const }}>
          Left: 3D point sources (rocket launch) · Centre: atmospheric heat shimmer (refractive turbulence) · Lens: PSF convolution · Right: 2D sensor — each point spreads into a blob
        </div>
      </div>

      <Divider />

      {/* 4 optic principles */}
      <div style={{ maxWidth: 1060, margin: "0 auto", padding: "0 32px 48px" }}>
        <Tag t="Section II · Four Principles · Optics · Projection · Blur · Coherent Knowing" c={CYAN} />
        <h2 style={{ fontSize: 20, fontWeight: 700, color: CYAN, marginBottom: 20 }}>The Optical Reality Stack</h2>
        <div style={{ display: "flex", flexDirection: "column" as const, gap: 14 }}>
          {OPTIC_STACK.map(item => (
            <div key={item.n} style={{ display: "grid", gridTemplateColumns: "52px 240px 1fr", gap: 16, alignItems: "start",
              padding: "16px 20px", background: PANEL, borderRadius: 12, border: `1px solid ${item.col}18` }}>
              <div style={{ fontSize: 28, fontWeight: 800, color: item.col }}>{item.n}</div>
              <div style={{ fontSize: 12, fontWeight: 700, color: item.col, marginTop: 4, lineHeight: 1.5 }}>{item.label}</div>
              <div style={{ fontSize: 12, color: DIM, lineHeight: 1.85 }}>{item.desc}</div>
            </div>
          ))}
        </div>
      </div>

      <Divider />

      {/* Canvas II */}
      <div style={{ maxWidth: 1060, margin: "0 auto", padding: "0 32px 48px" }}>
        <Tag t="Section III · Moon Loop Free-Return Trajectory · 4 Crew · Far-Side Communication Blackout · Solar Alignment" c={CYAN} />
        <h2 style={{ fontSize: 20, fontWeight: 700, color: CYAN, marginBottom: 14 }}>Moon Loop · 4 Crew · Far-Side Blackout</h2>
        <MoonLoopCanvas />
        <div style={{ marginTop: 10, fontSize: 10, color: MUTED, textAlign: "center" as const }}>
          Blue dot = observer on Earth · Gold dots = 4 crew on free-return arc · Red zone = far-side blackout (no signal) · Gold ray = solar alignment through scene
        </div>
      </div>

      <Divider />

      {/* Equations */}
      <div style={{ maxWidth: 1060, margin: "0 auto", padding: "0 32px 48px" }}>
        <Tag t="Section IV · Governing Relations · PSF · Coherence · Orbital Mechanics" c={AMBER} />
        <h2 style={{ fontSize: 20, fontWeight: 700, color: AMBER, marginBottom: 20 }}>Physical Relations</h2>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(260px,1fr))", gap: 14 }}>
          <EqChip eq="I(x,y) = O(x,y) ⊛ PSF(x,y)" label="Image formation — observed image I is a convolution of the true object O with the Point Spread Function. All blur, shimmer, and smear is captured in PSF." col={GOLD} />
          <EqChip eq="PSF = |FT{pupil function}|²" label="PSF is the squared magnitude of the Fourier transform of the aperture pupil function — determined by lens geometry, wavelength, and aberrations." col={AMBER} />
          <EqChip eq="n(x,y,t) = n₀ + δn(T,P)" label="Atmospheric refractive index — temperature and pressure fluctuations δn cause shimmer, distorting wavefronts and creating PSF-spreading for ground-based imaging." col={CYAN} />
          <EqChip eq="v_free = √(2GM/r)" label="Free-return trajectory — the lunar free-return arc requires a specific injection velocity near the Moon, allowing ballistic return to Earth without propulsion." col={BLUE} />
          <EqChip eq="t_blackout ≈ 45–50 min" label="Far-side communication blackout — crew behind the Moon have no line-of-sight to Earth or relay satellites. Duration depends on trajectory (typically 45-50 minutes on free-return)." col={VIOLET} />
          <EqChip eq="C(x,t) = A(x)·e^{i(φ−ωt)}" label="AETHER coherence field — observer's phase-locked field directly encodes the lunar event state without optical constraint. No PSF, no blur, no atmospheric shimmer." col={TEAL} />
        </div>
      </div>

      <Divider />

      {/* Canvas III */}
      <div style={{ maxWidth: 1060, margin: "0 auto", padding: "0 32px 48px" }}>
        <Tag t="Section V · Observer Coherence Field · Sun–Earth–Moon Alignment · Intuitive Phase Lock · C(x,t)" c={TEAL} />
        <h2 style={{ fontSize: 20, fontWeight: 700, color: TEAL, marginBottom: 14 }}>Observer Coherence Field · Solar Alignment</h2>
        <ObserverCoherenceCanvas />
        <div style={{ marginTop: 10, fontSize: 10, color: MUTED, textAlign: "center" as const }}>
          Gold line = solar alignment ray (Sun→Earth→Moon) · Cyan rings = observer coherence field expanding outward · Gold pulse = intuitive knowing of crew position · Purple box = camera/instrument PSF constraint vs cyan box = coherent field (no PSF)
        </div>
      </div>

      <Divider />

      {/* Source plates */}
      <div style={{ maxWidth: 1060, margin: "0 auto", padding: "0 32px 48px" }}>
        <Tag t="Section VI · Source Plates · AETHER Reference Field" c={VIOLET} />
        <h2 style={{ fontSize: 20, fontWeight: 700, color: VIOLET, marginBottom: 20 }}>Knowledge Reference Plates</h2>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(300px,1fr))", gap: 20 }}>
          <Plate src={omniFlow} title="Omni-Field Flow · Observer-Field Coupling" chips={["coherence field", "PSF constraint", "phase lock", "solar alignment", "observer coupling"]}
            body="The omni-field plate captures the dual-channel information architecture: the optical channel (PSF-constrained) and the coherence field channel (direct). The observer's coupling to the solar alignment field enables knowing without the optical bottleneck." />
          <Plate src={magStorm} title="Magnetic Storm · Atmospheric Shimmer Stack" chips={["refractive index", "heat shimmer", "atmospheric turbulence", "n(x,y,t)", "PSF spreading"]}
            body="The magnetic storm plate maps onto atmospheric refractive index turbulence — the same physical process that causes heat shimmer above a rocket launch, PSF spreading, and the 'decoherence fragment' the user observed in camera footage." />
          <Plate src={skyrmion} title="Skyrmion · Topological Coherence Knowing" chips={["topological stability", "free-return arc", "blackout window", "crew position", "coherent intuition"]}
            body="The skyrmion plate represents topologically stable coherent knowing — the observer's intuitive understanding of the lunar arc trajectory and blackout window, stable and accurate without requiring optical confirmation." />
        </div>
      </div>

      <Divider />

      {/* AETHER synthesis */}
      <div style={{ maxWidth: 1060, margin: "0 auto", padding: "0 32px 52px" }}>
        <Tag t="AETHER Synthesis · Dual Information Channels · Optical vs Coherence · Personal Science" />
        <div style={{ padding: "22px 26px", background: PANEL, borderRadius: 14, border: `1px solid ${GOLD}15`, marginBottom: 24 }}>
          <div style={{ fontSize: 14, color: IVORY, lineHeight: 2.1 }}>
            The personal science experiment during the moon loop launch reveals two simultaneous information channels available to the observer. The <em style={{ color: GOLD }}>optical channel</em> is subject to the full stack of physical constraints: atmospheric refractive index turbulence, lens PSF spreading, sensor integration limits, and 3D-to-2D projection loss. What the camera records is a convolution of 3D reality with all of these filters — a beautiful but constrained image. The <em style={{ color: CYAN }}>coherence channel</em> carries no such constraints. The observer aligned to the solar system — specifically to the Sun–Earth–Moon geometry — has direct phase access to the four-crew position field. Knowing that four people are going behind the Moon and that communication will be lost is not a guess: it is a coherence field reading. The AETHER model predicts that an observer with high coherence C(x,t) — grounded in factual understanding of the orbital mechanics, connected to the solar alignment, attending with full perceptual presence — will have richer, more immediate access to the event state than any camera. The camera is a PSF machine. The coherent observer is a field reader. The science experiment is to compare them, and to trust that what you know coherently is grounded — even when the optical record is blurred.
          </div>
        </div>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" as const }}>
          {["/solar-neural-interface", "/quantum-eye-field", "/color-perception", "/chromatic-glare", "/lunar-coherence", "/heliospheric-coherence", "/graph-map"].map(href => (
            <a key={href} href={href} style={{ padding: "6px 12px", borderRadius: 8, border: `1px solid ${LINE}`, color: DIM, fontSize: 11, textDecoration: "none" }}>
              {href.replace("/", "").replace(/-/g, " ")} →
            </a>
          ))}
        </div>
      </div>
    </div>
  );
}
