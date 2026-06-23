import { useEffect, useRef, useState } from "react";
import imgQuarks   from "@assets/image_1782210457403.png";
import imgDirac    from "@assets/antimatter_dirac.jpg";
import imgSModel   from "@assets/antimatter_standard_model.jpg";
import imgPet      from "@assets/antimatter_pet.jpg";
import imgDemons   from "@assets/antimatter_demons.jpg";
import imgSpine1   from "@assets/antimatter_spine_light.jpg";
import imgSpine2   from "@assets/antimatter_spine_wave.jpg";

/* ── palette ──────────────────────────────────── */
const BG   = "#030507";
const TEAL = "#1fd4c8";
const GOLD = "#c9a84c";
const VIO  = "#8b5cf6";
const GRN  = "#22c55e";
const RED  = "#ef4444";
const BLUE = "#3b82f6";
const PINK = "#ec4899";
const ORG  = "#f97316";
const DIM  = "#374858";
const MN   = "'Space Mono',monospace";
const OR   = "'Orbitron',sans-serif";

/* ─────────────────────────────────────────────── */
/* Animated canvas: time as wave + matter/antimatter annihilation */
function TimeWaveCanvas() {
  const ref = useRef<HTMLCanvasElement>(null);
  const raf = useRef(0);
  useEffect(() => {
    const cv = ref.current; if (!cv) return;
    const ctx = cv.getContext("2d")!;
    cv.width = 900; cv.height = 240;
    const W = cv.width, H = cv.height;
    let t = 0;

    // particles surfing the wave
    const particles = Array.from({ length: 24 }, (_, i) => ({
      phase: (i / 24) * Math.PI * 2,
      amp:   20 + Math.random() * 30,
      speed: 0.008 + Math.random() * 0.006,
      x:     (i / 24) * W,
      isAnti: i % 2 === 0,
      col:   i % 2 === 0 ? RED : TEAL,
      r:     2.5 + Math.random() * 2,
    }));

    const draw = () => {
      ctx.fillStyle = BG; ctx.fillRect(0, 0, W, H);

      /* ── draw the "time wave" as multiple sinusoidal layers ── */
      const waves = [
        { col: VIO,  amp: 28, freq: 1.8, phase: 0,       alpha: 0.18 },
        { col: TEAL, amp: 22, freq: 2.5, phase: 0.9,      alpha: 0.22 },
        { col: GOLD, amp: 16, freq: 3.4, phase: 1.8,      alpha: 0.20 },
        { col: BLUE, amp: 12, freq: 4.1, phase: 2.5,      alpha: 0.16 },
      ];

      waves.forEach(w => {
        ctx.beginPath();
        for (let x = 0; x < W; x++) {
          const y = H / 2 + w.amp * Math.sin((x / W) * Math.PI * w.freq * 2 + t * 0.022 + w.phase);
          x === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
        }
        ctx.strokeStyle = w.col + Math.round(w.alpha * 255).toString(16).padStart(2, "0");
        ctx.lineWidth = 1.5; ctx.stroke();
      });

      /* ── dominant time wave (bright) ── */
      ctx.beginPath();
      for (let x = 0; x < W; x++) {
        const y = H / 2 + 38 * Math.sin((x / W) * Math.PI * 3.2 + t * 0.028);
        x === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
      }
      const wg = ctx.createLinearGradient(0, 0, W, 0);
      wg.addColorStop(0,   VIO  + "44");
      wg.addColorStop(0.3, TEAL + "88");
      wg.addColorStop(0.6, GOLD + "88");
      wg.addColorStop(1,   PINK + "44");
      ctx.strokeStyle = wg; ctx.lineWidth = 2.5; ctx.stroke();

      /* ── CPT mirror wave (anti) ── */
      ctx.beginPath();
      for (let x = 0; x < W; x++) {
        // time-reversed = negative phase shift
        const y = H / 2 - 38 * Math.sin((x / W) * Math.PI * 3.2 + t * 0.028);
        x === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
      }
      ctx.strokeStyle = RED + "44"; ctx.lineWidth = 1.2;
      ctx.setLineDash([4, 6]); ctx.stroke(); ctx.setLineDash([]);

      /* ── particles on the wave ── */
      particles.forEach(p => {
        const waveY = H / 2 + 38 * Math.sin((p.x / W) * Math.PI * 3.2 + t * 0.028);
        const y = waveY + (p.isAnti ? -p.amp * 0.4 : p.amp * 0.4) * Math.sin(t * p.speed * 6 + p.phase);

        // glow
        const g = ctx.createRadialGradient(p.x, y, 0, p.x, y, p.r * 3);
        g.addColorStop(0, p.col + "88"); g.addColorStop(1, p.col + "00");
        ctx.beginPath(); ctx.arc(p.x, y, p.r * 3, 0, Math.PI * 2);
        ctx.fillStyle = g; ctx.fill();

        ctx.beginPath(); ctx.arc(p.x, y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = p.col; ctx.fill();

        // move along wave
        p.x = (p.x + 0.6) % W;
      });

      /* ── annihilation flash when matter meets antimatter ── */
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          if (particles[i].isAnti === particles[j].isAnti) continue;
          const dx = particles[i].x - particles[j].x;
          const wY1 = H / 2 + 38 * Math.sin((particles[i].x / W) * Math.PI * 3.2 + t * 0.028);
          const wY2 = H / 2 + 38 * Math.sin((particles[j].x / W) * Math.PI * 3.2 + t * 0.028);
          const dy = wY1 - wY2;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 18) {
            const fx = (particles[i].x + particles[j].x) / 2;
            const fy = (wY1 + wY2) / 2;
            const flash = (18 - dist) / 18;
            const fg = ctx.createRadialGradient(fx, fy, 0, fx, fy, 20 * flash);
            fg.addColorStop(0, `rgba(255,220,100,${flash})`);
            fg.addColorStop(0.5, `rgba(255,100,60,${flash * 0.5})`);
            fg.addColorStop(1, "transparent");
            ctx.beginPath(); ctx.arc(fx, fy, 20 * flash, 0, Math.PI * 2);
            ctx.fillStyle = fg; ctx.fill();
          }
        }
      }

      /* ── labels ── */
      ctx.fillStyle = TEAL + "88"; ctx.font = `7px ${OR}`; ctx.textAlign = "left";
      ctx.fillText("MATTER", 8, 18);
      ctx.fillStyle = RED + "88";
      ctx.fillText("ANTIMATTER", 8, 30);
      ctx.fillStyle = "rgba(200,180,255,0.25)"; ctx.font = `italic 8px Georgia`;
      ctx.textAlign = "center";
      ctx.fillText('"Time is not linear — it\'s a free-flowing dynamic wave"', W / 2, H - 10);

      t++; raf.current = requestAnimationFrame(draw);
    };
    draw();
    return () => cancelAnimationFrame(raf.current);
  }, []);
  return <canvas ref={ref} style={{ width:"100%", height:"auto", borderRadius:4, display:"block" }} />;
}

/* ─────────────────────────────────────────────── */
/* Annihilation Energy Calculator canvas */
function AnnihilationCanvas({ massGrams }: { massGrams: number }) {
  const ref = useRef<HTMLCanvasElement>(null);
  const raf = useRef(0);
  const massRef = useRef(massGrams);
  massRef.current = massGrams;
  useEffect(() => {
    const cv = ref.current; if (!cv) return;
    const ctx = cv.getContext("2d")!;
    cv.width = 700; cv.height = 200;
    const W = cv.width, H = cv.height;
    let t = 0;
    type Particle = { x: number; y: number; vx: number; vy: number; col: string; r: number; isMatter: boolean };
    const particles: Particle[] = [];
    for (let i = 0; i < 18; i++) {
      particles.push({ x: 40 + Math.random() * (W / 2 - 80), y: 30 + Math.random() * (H - 60), vx: 0.6 + Math.random() * 0.8, vy: (Math.random() - 0.5) * 1.2, col: TEAL, r: 5 + Math.random() * 3, isMatter: true });
      particles.push({ x: W - 40 - Math.random() * (W / 2 - 80), y: 30 + Math.random() * (H - 60), vx: -0.6 - Math.random() * 0.8, vy: (Math.random() - 0.5) * 1.2, col: RED, r: 5 + Math.random() * 3, isMatter: false });
    }
    type Flash = { x: number; y: number; r: number; alpha: number };
    const flashes: Flash[] = [];
    const draw = () => {
      ctx.fillStyle = "rgba(3,5,7,0.22)"; ctx.fillRect(0, 0, W, H);
      const m = massRef.current;
      const E_J = 2 * m * 0.001 * 9e16;
      const E_TNT = E_J / 4.184e9;
      particles.forEach(p => {
        p.x += p.vx; p.y += p.vy;
        if (p.y < p.r || p.y > H - p.r) p.vy *= -1;
        if (p.isMatter && p.x > W / 2) p.vx = -Math.abs(p.vx);
        if (!p.isMatter && p.x < W / 2) p.vx = Math.abs(p.vx);
        if (p.isMatter && p.x < p.r) p.vx = Math.abs(p.vx);
        if (!p.isMatter && p.x > W - p.r) p.vx = -Math.abs(p.vx);
      });
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          if (particles[i].isMatter === particles[j].isMatter) continue;
          const dx = particles[i].x - particles[j].x, dy = particles[i].y - particles[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 22) {
            flashes.push({ x: (particles[i].x + particles[j].x) / 2, y: (particles[i].y + particles[j].y) / 2, r: 6, alpha: 1 });
            particles[i].x = 40 + Math.random() * (W / 2 - 80); particles[i].y = 30 + Math.random() * (H - 60);
            particles[j].x = W - 40 - Math.random() * (W / 2 - 80); particles[j].y = 30 + Math.random() * (H - 60);
          }
        }
      }
      flashes.forEach((f, idx) => {
        const g = ctx.createRadialGradient(f.x, f.y, 0, f.x, f.y, f.r * 3);
        g.addColorStop(0, `rgba(255,230,80,${f.alpha})`);
        g.addColorStop(0.5, `rgba(255,100,30,${f.alpha * 0.5})`);
        g.addColorStop(1, "transparent");
        ctx.beginPath(); ctx.arc(f.x, f.y, f.r * 3, 0, Math.PI * 2);
        ctx.fillStyle = g; ctx.fill();
        f.r += 4; f.alpha -= 0.06;
        if (f.alpha <= 0) flashes.splice(idx, 1);
      });
      particles.forEach(p => {
        const g = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.r * 2.5);
        g.addColorStop(0, p.col + "bb"); g.addColorStop(1, p.col + "00");
        ctx.beginPath(); ctx.arc(p.x, p.y, p.r * 2.5, 0, Math.PI * 2); ctx.fillStyle = g; ctx.fill();
        ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2); ctx.fillStyle = p.col; ctx.fill();
        ctx.fillStyle = "#000"; ctx.font = `${p.isMatter ? 6 : 7}px Space Mono`; ctx.textAlign = "center";
        ctx.fillText(p.isMatter ? "e⁻" : "e⁺", p.x, p.y + 2);
      });
      ctx.strokeStyle = "rgba(200,200,200,0.1)"; ctx.lineWidth = 1.5; ctx.setLineDash([5, 5]);
      ctx.beginPath(); ctx.moveTo(W / 2, 0); ctx.lineTo(W / 2, H); ctx.stroke(); ctx.setLineDash([]);
      ctx.fillStyle = TEAL + "88"; ctx.font = `8px ${MN}`; ctx.textAlign = "center";
      ctx.fillText("MATTER", W / 4, 16); ctx.fillStyle = RED + "88";
      ctx.fillText("ANTIMATTER", 3 * W / 4, 16);
      ctx.fillStyle = GOLD; ctx.font = `9px ${MN}`; ctx.textAlign = "left";
      const tntStr = E_TNT > 1e6 ? `${(E_TNT / 1e6).toFixed(2)} Mt TNT` : E_TNT > 1e3 ? `${(E_TNT / 1e3).toFixed(2)} kt TNT` : `${E_TNT.toFixed(2)} t TNT`;
      ctx.fillText(`E = 2mc² = ${E_J.toExponential(2)} J = ${tntStr}`, 8, H - 10);
      t++; raf.current = requestAnimationFrame(draw);
    };
    draw();
    return () => cancelAnimationFrame(raf.current);
  }, []);
  return <canvas ref={ref} style={{ width: "100%", height: "auto", borderRadius: 4, display: "block" }} />;
}

/* ─────────────────────────────────────────────── */
/* CP Violation / Baryon Asymmetry canvas */
function CPViolationCanvas() {
  const ref = useRef<HTMLCanvasElement>(null);
  const raf = useRef(0);
  useEffect(() => {
    const cv = ref.current; if (!cv) return;
    const ctx = cv.getContext("2d")!;
    cv.width = 900; cv.height = 200;
    const W = cv.width, H = cv.height;
    let t = 0;
    const TOTAL = 1_000_000_001;
    const draw = () => {
      ctx.fillStyle = BG; ctx.fillRect(0, 0, W, H);
      const tNorm = Math.min(1, t / 300);
      const matterN = Math.round(TOTAL * tNorm);
      const antimatterN = Math.round((TOTAL - 1) * tNorm);
      const surplus = matterN - antimatterN;
      const barW = (W - 80) / 2 - 10;
      const maxH = H - 60;
      const mFrac = matterN / TOTAL, aFrac = antimatterN / TOTAL;
      const mH = mFrac * maxH, aH = aFrac * maxH;
      const gM = ctx.createLinearGradient(40, H - 40 - mH, 40, H - 40);
      gM.addColorStop(0, TEAL + "22"); gM.addColorStop(1, TEAL + "66");
      ctx.fillStyle = gM; ctx.fillRect(40, H - 40 - mH, barW, mH);
      ctx.strokeStyle = TEAL + "88"; ctx.lineWidth = 1.5;
      ctx.strokeRect(40, H - 40 - mH, barW, mH);
      const gA = ctx.createLinearGradient(W / 2 + 10, H - 40 - aH, W / 2 + 10, H - 40);
      gA.addColorStop(0, RED + "22"); gA.addColorStop(1, RED + "66");
      ctx.fillStyle = gA; ctx.fillRect(W / 2 + 10, H - 40 - aH, barW, aH);
      ctx.strokeStyle = RED + "88"; ctx.lineWidth = 1.5;
      ctx.strokeRect(W / 2 + 10, H - 40 - aH, barW, aH);
      ctx.fillStyle = TEAL; ctx.font = `10px ${OR}`; ctx.textAlign = "center";
      ctx.fillText("MATTER", 40 + barW / 2, H - 24);
      ctx.fillText(`${matterN.toLocaleString()}`, 40 + barW / 2, H - 12);
      ctx.fillStyle = RED;
      ctx.fillText("ANTIMATTER", W / 2 + 10 + barW / 2, H - 24);
      ctx.fillText(`${antimatterN.toLocaleString()}`, W / 2 + 10 + barW / 2, H - 12);
      ctx.fillStyle = GOLD; ctx.font = `8px ${MN}`; ctx.textAlign = "left";
      ctx.fillText("CP VIOLATION · BIG BANG ASYMMETRY", 8, 18);
      ctx.font = `9px ${MN}`;
      ctx.fillText(`Surplus: +${surplus} matter particle${surplus !== 1 ? "s" : ""} per billion pairs`, 8, 34);
      if (tNorm > 0.6) {
        ctx.fillStyle = GOLD; ctx.font = `8px ${MN}`;
        ctx.fillText("Annihilation: 10⁹ pairs → pure photons", 8, 50);
        ctx.fillStyle = TEAL + "cc"; ctx.font = `9px ${OR}`;
        ctx.fillText("← This tiny excess = all stars, planets, life", 8, 66);
      }
      const arrowX = W - 60, arrowY = H / 2;
      const surplusFrac = (mH - aH);
      if (surplusFrac > 0.5) {
        ctx.fillStyle = GOLD + "88";
        ctx.fillRect(arrowX - 4, arrowY - surplusFrac / 2, 8, surplusFrac);
        ctx.fillStyle = GOLD; ctx.font = `8px ${MN}`; ctx.textAlign = "center";
        ctx.fillText("Δ", arrowX, arrowY - surplusFrac / 2 - 4);
        ctx.fillText("≈1ppb", arrowX, arrowY + surplusFrac / 2 + 12);
      }
      t++; raf.current = requestAnimationFrame(draw);
    };
    draw();
    return () => cancelAnimationFrame(raf.current);
  }, []);
  return <canvas ref={ref} style={{ width: "100%", height: "auto", borderRadius: 4, display: "block" }} />;
}

/* ─────────────────────────────────────────────── */
/* PET Scanner simulation canvas */
function PETScannerCanvas() {
  const ref = useRef<HTMLCanvasElement>(null);
  const raf = useRef(0);
  useEffect(() => {
    const cv = ref.current; if (!cv) return;
    const ctx = cv.getContext("2d")!;
    cv.width = 900; cv.height = 240;
    const W = cv.width, H = cv.height;
    let t = 0;
    const cx = W / 2, cy = H / 2;
    const ringR = 100;
    const nDet = 24;
    type Gamma = { x: number; y: number; vx: number; vy: number; alpha: number; paired: boolean };
    const gammas: Gamma[] = [];
    type Emission = { x: number; y: number; age: number };
    const emissions: Emission[] = [];
    let nextEmit = 0;
    const detectors = Array.from({ length: nDet }, (_, i) => {
      const angle = (i / nDet) * Math.PI * 2;
      return { x: cx + Math.cos(angle) * ringR, y: cy + Math.sin(angle) * ringR, lit: 0 };
    });
    const draw = () => {
      ctx.fillStyle = "rgba(3,5,7,0.3)"; ctx.fillRect(0, 0, W, H);
      ctx.strokeStyle = `rgba(46,240,216,0.12)`; ctx.lineWidth = 1.5;
      ctx.beginPath(); ctx.arc(cx, cy, ringR, 0, Math.PI * 2); ctx.stroke();
      ctx.beginPath(); ctx.arc(cx, cy, ringR + 10, 0, Math.PI * 2);
      ctx.strokeStyle = `rgba(100,200,180,0.06)`; ctx.lineWidth = 8; ctx.stroke();
      detectors.forEach((det, i) => {
        const lit = det.lit > 0;
        const g = ctx.createRadialGradient(det.x, det.y, 0, det.x, det.y, 9);
        g.addColorStop(0, lit ? GRN + "cc" : TEAL + "33"); g.addColorStop(1, "transparent");
        ctx.beginPath(); ctx.arc(det.x, det.y, 9, 0, Math.PI * 2); ctx.fillStyle = g; ctx.fill();
        ctx.beginPath(); ctx.arc(det.x, det.y, 5, 0, Math.PI * 2);
        ctx.fillStyle = lit ? GRN : TEAL + "44"; ctx.fill();
        if (det.lit > 0) det.lit--;
      });
      const bodyR = 44;
      ctx.beginPath(); ctx.ellipse(cx, cy, bodyR, bodyR * 1.4, 0, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(255,150,80,0.07)`; ctx.fill();
      ctx.strokeStyle = AMB + "22"; ctx.lineWidth = 1; ctx.stroke();
      ctx.fillStyle = AMB + "55"; ctx.font = `7px ${MN}`; ctx.textAlign = "center";
      ctx.fillText("TISSUE", cx, cy - bodyR * 1.4 - 6);
      if (t > nextEmit) {
        const angle = Math.random() * Math.PI * 2;
        const er = Math.random() * bodyR * 0.9;
        const ex = cx + Math.cos(angle) * er, ey = cy + Math.sin(angle) * er;
        emissions.push({ x: ex, y: ey, age: 0 });
        const backAngle = Math.random() * Math.PI * 2;
        const speed = 3.5;
        gammas.push({ x: ex, y: ey, vx: Math.cos(backAngle) * speed, vy: Math.sin(backAngle) * speed, alpha: 1, paired: true });
        gammas.push({ x: ex, y: ey, vx: -Math.cos(backAngle) * speed, vy: -Math.sin(backAngle) * speed, alpha: 1, paired: true });
        nextEmit = t + 18 + Math.floor(Math.random() * 20);
      }
      emissions.forEach((e, idx) => {
        e.age++;
        const ga = Math.max(0, 1 - e.age / 12);
        const g = ctx.createRadialGradient(e.x, e.y, 0, e.x, e.y, 8);
        g.addColorStop(0, `rgba(255,100,50,${ga})`); g.addColorStop(1, "transparent");
        ctx.beginPath(); ctx.arc(e.x, e.y, 8, 0, Math.PI * 2); ctx.fillStyle = g; ctx.fill();
        if (e.age > 12) emissions.splice(idx, 1);
      });
      gammas.forEach((g2, idx) => {
        g2.x += g2.vx; g2.y += g2.vy;
        g2.alpha -= 0.018;
        const dist = Math.sqrt((g2.x - cx) ** 2 + (g2.y - cy) ** 2);
        if (dist > ringR - 5 && dist < ringR + 18) {
          const angle = Math.atan2(g2.y - cy, g2.x - cx);
          const detIdx = Math.round((angle / (Math.PI * 2) + 1) * nDet) % nDet;
          if (detIdx >= 0 && detIdx < detectors.length) detectors[detIdx].lit = 12;
          const g = ctx.createRadialGradient(g2.x, g2.y, 0, g2.x, g2.y, 10);
          g.addColorStop(0, `rgba(255,230,60,${Math.min(g2.alpha, 0.8)})`); g.addColorStop(1, "transparent");
          ctx.beginPath(); ctx.arc(g2.x, g2.y, 10, 0, Math.PI * 2); ctx.fillStyle = g; ctx.fill();
        }
        const trail = ctx.createLinearGradient(g2.x - g2.vx * 5, g2.y - g2.vy * 5, g2.x, g2.y);
        trail.addColorStop(0, "transparent");
        trail.addColorStop(1, GOLD + Math.round(g2.alpha * 180).toString(16).padStart(2, "0"));
        ctx.strokeStyle = trail; ctx.lineWidth = 1.5;
        ctx.beginPath(); ctx.moveTo(g2.x - g2.vx * 5, g2.y - g2.vy * 5); ctx.lineTo(g2.x, g2.y); ctx.stroke();
        if (g2.alpha <= 0 || dist > ringR + 20) gammas.splice(idx, 1);
      });
      ctx.fillStyle = GOLD; ctx.font = `8px ${MN}`; ctx.textAlign = "left";
      ctx.fillText("PET SCANNER · β⁺ DECAY → POSITRON → ANNIHILATION → 2γ AT 511 keV · COINCIDENCE DETECTION", 8, H - 10);
      t++; raf.current = requestAnimationFrame(draw);
    };
    draw();
    return () => cancelAnimationFrame(raf.current);
  }, []);
  return <canvas ref={ref} style={{ width: "100%", height: "auto", borderRadius: 4, display: "block" }} />;
}

/* ─────────────────────────────────────────────── */
/* Standard Model particle grid */
const QUARKS = [
  { name:"up",      charge:"+2/3", mass:"2.2 MeV",    gen:1, col:RED   },
  { name:"charm",   charge:"+2/3", mass:"1.28 GeV",   gen:2, col:RED   },
  { name:"top",     charge:"+2/3", mass:"173.1 GeV",  gen:3, col:RED   },
  { name:"down",    charge:"−1/3", mass:"4.7 MeV",    gen:1, col:ORG   },
  { name:"strange", charge:"−1/3", mass:"96 MeV",     gen:2, col:ORG   },
  { name:"bottom",  charge:"−1/3", mass:"4.18 GeV",   gen:3, col:ORG   },
];
const LEPTONS = [
  { name:"electron",        charge:"−1",   mass:"0.511 MeV",  gen:1, col:BLUE },
  { name:"muon",            charge:"−1",   mass:"105.7 MeV",  gen:2, col:BLUE },
  { name:"tau",             charge:"−1",   mass:"1.777 GeV",  gen:3, col:BLUE },
  { name:"e-neutrino",      charge:"0",    mass:"<1.1 eV",    gen:1, col:TEAL },
  { name:"μ-neutrino",      charge:"0",    mass:"<0.19 MeV",  gen:2, col:TEAL },
  { name:"τ-neutrino",      charge:"0",    mass:"<18.2 MeV",  gen:3, col:TEAL },
];

function ParticleCard({ name, charge, mass, col }: { name:string; charge:string; mass:string; col:string }) {
  return (
    <div style={{ background:`${col}10`, border:`1px solid ${col}44`, borderRadius:3,
      padding:"6px 8px", textAlign:"center", minWidth:70 }}>
      <div style={{ fontFamily:OR, fontSize:9.5, color:col, fontWeight:700 }}>{name}</div>
      <div style={{ fontFamily:MN, fontSize:7, color:col+"99", lineHeight:1.8 }}>
        q={charge}<br/>m={mass}
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────── */
export default function AntimatterWavePage() {
  const [massGrams, setMassGrams] = useState(0.25);
  const card = (col=TEAL): React.CSSProperties => ({
    background:"rgba(0,0,0,0.42)", border:`1px solid ${col}22`, borderRadius:4, padding:"12px 16px",
  });
  const secLabel: React.CSSProperties = {
    fontFamily:MN, fontSize:7.5, letterSpacing:"0.2em", color:DIM,
    textTransform:"uppercase", marginBottom:10, paddingBottom:4,
    borderBottom:"1px solid rgba(31,212,200,0.1)",
  };
  const h2 = (col=TEAL): React.CSSProperties => ({
    fontFamily:OR, fontSize:11, color:col, letterSpacing:1, margin:"0 0 8px",
  });
  const body: React.CSSProperties = {
    fontSize:11.5, color:"rgba(200,210,228,0.72)", lineHeight:1.72,
  };
  const q = (col=GOLD): React.CSSProperties => ({
    borderLeft:`2px solid ${col}66`, paddingLeft:12, margin:"10px 0",
    fontStyle:"italic", fontSize:12, color:`${col}cc`, lineHeight:1.7,
  });

  return (
    <div style={{ minHeight:"100%", background:BG, color:"#d4e4f4",
      fontFamily:"'Rajdhani',sans-serif", overflowY:"auto" }}>
      <div style={{ maxWidth:1100, margin:"0 auto", padding:"16px 20px" }}>

        {/* title */}
        <div style={{ marginBottom:16 }}>
          <div style={{ display:"inline-block", border:`1px solid ${PINK}55`,
            padding:"3px 10px", fontSize:9, letterSpacing:"0.2em",
            color:`${PINK}cc`, fontFamily:MN, marginBottom:8 }}>
            ANTIMATTER · STANDARD MODEL · TIME AS WAVE · CPT SYMMETRY · SPINE AS CARRIER
          </div>
          <h1 style={{ fontFamily:OR, fontSize:20, fontWeight:900, letterSpacing:2,
            color:PINK, textShadow:`0 0 24px ${PINK}44`, margin:"4px 0 6px" }}>
            Time Is Not Linear · Antimatter, the Standard Model &amp; the Wave Nature of Reality
          </h1>
          <div style={q(PINK)}>
            "Time is not linear — it's a free-flowing dynamic wave 🌊"
          </div>
          <p style={{ ...body, maxWidth:860, margin:0 }}>
            Paul Dirac's 1928 equation didn't just predict the electron — it predicted a mirror version of every particle in existence. Antimatter is not science fiction; it is a <strong style={{color:PINK}}>mathematical requirement</strong> of the Standard Model. And when we look at <strong style={{color:VIO}}>CPT symmetry</strong> — the deepest symmetry of physics — time reversal (T) is inseparable from matter/antimatter inversion (C) and spatial inversion (P). To understand antimatter is to understand that time itself has a mirror: it flows, it inverts, it annihilates and re-emerges. Not a line — a wave.
          </p>
        </div>

        {/* time wave canvas */}
        <div style={{ ...card(VIO), marginBottom:14 }}>
          <div style={secLabel}>Time as Wave · Matter (teal) + Antimatter (red) riding the temporal field · CPT mirror (dashed) · Annihilation flashes at contact</div>
          <TimeWaveCanvas />
        </div>

        {/* Annihilation energy calculator */}
        <div style={{ ...card(ORG), marginBottom:14 }}>
          <div style={secLabel}>Live simulation · E=2mc² · matter (teal) + antimatter (red) collision · annihilation flashes · energy yield calculator · adjust mass to scale yield</div>
          <h2 style={h2(ORG)}>Annihilation Energy · E = 2mc² · 100% Mass Conversion</h2>
          <div style={{ display:"grid", gridTemplateColumns:"1fr 280px", gap:14, alignItems:"start" }}>
            <div>
              <AnnihilationCanvas massGrams={massGrams} />
              <div style={{ marginTop:8 }}>
                <label style={{ fontFamily:MN, fontSize:8, color:ORG }}>
                  Antimatter mass: <strong style={{ color:TEAL }}>{massGrams.toFixed(3)} g</strong>
                  &nbsp;+&nbsp; equal matter mass = total <strong style={{ color:GOLD }}>{(massGrams*2).toFixed(3)} g annihilated</strong>
                </label>
                <input type="range" min={0.001} max={5} step={0.001} value={massGrams}
                  onChange={e=>setMassGrams(Number(e.target.value))}
                  style={{ width:"100%", accentColor:ORG, margin:"8px 0" }} />
              </div>
            </div>
            <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
              {[
                { col:ORG,  l:"Energy (Joules)", v:`${(2*massGrams*0.001*9e16).toExponential(3)} J` },
                { col:GOLD, l:"TNT equivalent", v:(()=>{const t2=2*massGrams*0.001*9e16/4.184e9; return t2>1e6?`${(t2/1e6).toFixed(3)} Mt`:t2>1e3?`${(t2/1e3).toFixed(3)} kt`:`${t2.toFixed(2)} t`;})() },
                { col:RED,  l:"Hiroshima (15 kt)", v:`${((2*massGrams*0.001*9e16/4.184e9)/15000).toFixed(4)}×` },
                { col:VIO,  l:"Efficiency vs fission", v:"~1000× (0.1% → 100%)" },
                { col:TEAL, l:"CERN annual output", v:"~10 nanograms/year" },
              ].map(({col,l,v})=>(
                <div key={l} style={{ background:`${col}0d`, border:`1px solid ${col}33`, borderRadius:3, padding:"7px 10px" }}>
                  <div style={{ fontFamily:MN, fontSize:7, color:DIM, letterSpacing:1 }}>{l}</div>
                  <div style={{ fontFamily:OR, fontSize:11, color:col, fontWeight:700 }}>{v}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Dirac + Standard Model */}
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:14, marginBottom:14 }}>

          <div style={card(GOLD)}>
            <div style={secLabel}>Antimatter Predicted 1928 · Paul Dirac · Observed 1932 · Carl Anderson · Angels &amp; Demons Lecture Night · York University</div>
            <img src={imgDirac} alt="Dirac antimatter prediction" style={{ width:"100%", borderRadius:3, marginBottom:10, opacity:0.88 }} />
            <h2 style={h2(GOLD)}>Dirac's Equation: The Most Uncomfortable Prediction in Physics</h2>
            <p style={body}>
              In 1928, combining <strong style={{color:GOLD}}>quantum mechanics</strong> and <strong style={{color:GOLD}}>special relativity</strong>, Dirac derived an equation for the electron. It had four solutions — two for the electron (spin up/down), and two for what appeared to be <strong style={{color:RED}}>negative energy states</strong>. Werner Heisenberg called this "the most miserable chapter in modern physics." Dirac held firm: if the equation says they exist, they exist.
            </p>
            <div style={{ background:`${GOLD}10`, border:`1px solid ${GOLD}33`, borderRadius:4, padding:"8px 12px", marginTop:8 }}>
              <div style={{ fontFamily:MN, fontSize:8, color:GOLD, marginBottom:4 }}>1932 · Carl Anderson · Cloud Chamber · Cosmic Rays</div>
              <p style={{ ...body, fontSize:10.5, margin:0 }}>
                A positron — an electron with positive charge (+e, same mass) — curved in the opposite direction in a magnetic field. The first antiparticle confirmed. Dirac was right. The negative energy states were real. The "Antiworld" was not a mathematical artefact; it was a physical observation. Anderson won the 1936 Nobel Prize.
              </p>
            </div>
            <div style={{ ...q(GOLD), marginTop:10 }}>
              "The 'Antiworld' is a Natural (and Required) Part of our Precise Description of the Physical World Known as the Standard Model."
            </div>
          </div>

          <div style={card(RED)}>
            <div style={secLabel}>Standard Model · Quarks · Leptons · Antiquarks · Antilepts · Full Mirror Structure</div>
            <img src={imgSModel} alt="Standard Model diagram" style={{ width:"100%", borderRadius:3, marginBottom:10, opacity:0.88 }} />
            <h2 style={h2(RED)}>For Every Particle, a Perfect Mirror</h2>
            <p style={body}>
              The Standard Model is a complete accounting of all fundamental particles and forces. Every particle in it has a corresponding antiparticle — identical in mass and spin, opposite in charge, lepton number, and baryon number. This mirror structure is not optional; it emerges from the mathematical symmetries of quantum field theory.
            </p>
            <div style={{ display:"flex", gap:10, marginTop:8 }}>
              {[
                { col:RED,  side:"Matter",    items:["Quarks: u,c,t / d,s,b","Leptons: e⁻, μ⁻, τ⁻","Neutrinos: νe, νμ, ντ"] },
                { col:PINK, side:"Antimatter",items:["Antiquarks: ū,c̄,t̄ / d̄,s̄,b̄","Antileptons: e⁺, μ⁺, τ⁺","Antineutrinos: ν̄e, ν̄μ, ν̄τ"] },
              ].map(s => (
                <div key={s.side} style={{ flex:1, background:`${s.col}0d`, border:`1px solid ${s.col}33`, borderRadius:4, padding:"8px 10px" }}>
                  <div style={{ fontFamily:OR, fontSize:9, color:s.col, marginBottom:4 }}>{s.side}</div>
                  {s.items.map(item => (
                    <div key={item} style={{ fontFamily:MN, fontSize:7.5, color:`${s.col}cc`, lineHeight:1.9 }}>{item}</div>
                  ))}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* quarks & leptons cartoon reference + data grid */}
        <div style={{ ...card(TEAL), marginBottom:14 }}>
          <div style={secLabel}>Standard Model · Quarks (6) + Leptons (6) · Charge · Mass · Generation · Particle Zoo Reference Image</div>
          <div style={{ display:"grid", gridTemplateColumns:"280px 1fr", gap:16, alignItems:"start" }}>
            <div>
              <img src={imgQuarks} alt="Quarks and leptons particle zoo" style={{ width:"100%", borderRadius:4, marginBottom:8 }} />
              <div style={{ fontFamily:MN, fontSize:7.5, color:DIM, lineHeight:1.7 }}>
                From the "Particle Zoo" visualisation — 6 quarks (left) + 6 leptons (right), each with cartoon character design representing their properties. Top row = generation 1&amp;2&amp;3 charge-up, bottom row = charge-down/neutral.
              </div>
            </div>
            <div>
              <div style={{ marginBottom:12 }}>
                <div style={{ fontFamily:OR, fontSize:9, color:RED, marginBottom:6 }}>Quarks · Colour Charge · Confinement · Always Bound</div>
                <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:6 }}>
                  {QUARKS.map(p => <ParticleCard key={p.name} {...p} />)}
                </div>
                <div style={{ ...body, fontSize:10.5, marginTop:8, padding:"7px 10px",
                  background:`${RED}0d`, borderRadius:4, border:`1px solid ${RED}22` }}>
                  Quarks are <strong style={{color:RED}}>never observed alone</strong> — colour confinement forces them to bind in groups (hadrons: baryons = 3 quarks, mesons = quark+antiquark). The proton is uud, the neutron is udd. The strong force (mediated by gluons) holds the nucleus together against electromagnetic repulsion.
                </div>
              </div>
              <div>
                <div style={{ fontFamily:OR, fontSize:9, color:BLUE, marginBottom:6 }}>Leptons · No Colour Charge · Free Particles</div>
                <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:6 }}>
                  {LEPTONS.map(p => <ParticleCard key={p.name} {...p} />)}
                </div>
                <div style={{ ...body, fontSize:10.5, marginTop:8, padding:"7px 10px",
                  background:`${BLUE}0d`, borderRadius:4, border:`1px solid ${BLUE}22` }}>
                  Leptons do not feel the strong force. The electron is stable; the muon (~207× heavier) and tau (~3,477× heavier) decay into lighter leptons + neutrinos. Neutrinos travel near light speed, pass through matter almost without interaction — billions pass through your body every second. Oscillation between flavours proves they have mass (2015 Nobel Prize).
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* CPT symmetry + time wave */}
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:14, marginBottom:14 }}>

          <div style={card(VIO)}>
            <div style={secLabel}>CPT Symmetry · The Deepest Mirror in Physics · Time Reversal T</div>
            <h2 style={h2(VIO)}>Why Antimatter Encodes Time's Wave Nature</h2>
            <p style={body}>
              The <strong style={{color:VIO}}>CPT theorem</strong> states that any valid quantum field theory is invariant under the simultaneous application of three operations: <strong style={{color:VIO}}>C</strong> (charge conjugation — swap matter/antimatter), <strong style={{color:VIO}}>P</strong> (parity — mirror spatial coordinates), and <strong style={{color:VIO}}>T</strong> (time reversal). None of the three symmetries is individually required — but their combination is inviolable.
            </p>
            <div style={{ display:"flex", flexDirection:"column", gap:8, marginTop:8 }}>
              {[
                { letter:"C", col:RED,  t:"Charge Conjugation",
                  b:"Swap every particle for its antiparticle. Positive ↔ negative charge. Matter ↔ Antimatter. The universe would look the same — if C symmetry were exact. It isn't: the weak force violates C." },
                { letter:"P", col:GOLD, t:"Parity / Spatial Inversion",
                  b:"Mirror every spatial coordinate: (x,y,z) → (−x,−y,−z). Left-handed → right-handed. The weak force violates P — neutrinos are always left-handed; antineutrinos always right-handed. No exceptions." },
                { letter:"T", col:VIO,  t:"Time Reversal",
                  b:"Reverse the direction of time: t → −t. In classical physics, Newton's laws are T-symmetric — a video of billiard balls looks the same forwards and backwards. At the quantum level, CP violation implies T violation (CPT theorem). Time has a preferred direction built in to the weak interaction." },
              ].map(({ letter, col, t, b }) => (
                <div key={letter} style={{ display:"flex", gap:10,
                  background:`${col}0d`, border:`1px solid ${col}33`, borderRadius:4, padding:"8px 12px" }}>
                  <div style={{ width:28, height:28, borderRadius:"50%",
                    background:`${col}22`, border:`2px solid ${col}`,
                    display:"flex", alignItems:"center", justifyContent:"center",
                    fontFamily:OR, fontSize:14, color:col, flexShrink:0 }}>{letter}</div>
                  <div>
                    <div style={{ fontFamily:MN, fontSize:8.5, color:col, fontWeight:700 }}>{t}</div>
                    <div style={{ ...body, fontSize:10.5, marginTop:3 }}>{b}</div>
                  </div>
                </div>
              ))}
            </div>
            <div style={q(VIO)}>
              CP violation explains why we live in a matter-dominated universe: the Big Bang produced slightly more matter than antimatter (~1 extra particle per billion). All of observable reality is that tiny asymmetry surviving annihilation.
            </div>
          </div>

          <div style={{ display:"flex", flexDirection:"column", gap:10 }}>

            {/* PET scan */}
            <div style={card(GRN)}>
              <div style={secLabel}>Antimatter from Radioactivity · PET Scan · Medical Imaging · Positron Emission Tomography</div>
              <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10, alignItems:"start" }}>
                <img src={imgPet} alt="PET scan antimatter" style={{ width:"100%", borderRadius:3, opacity:0.88 }} />
                <div>
                  <h2 style={h2(GRN)}>Antimatter Inside You · Right Now</h2>
                  <p style={{ ...body, fontSize:10.5 }}>
                    PET (Positron Emission Tomography) is antimatter medicine. A radioactive tracer (e.g. ¹⁸F-FDG) undergoes beta-plus decay: <strong style={{color:GRN}}>p → n + e⁺ + ν</strong>. The emitted positron travels a few millimetres, meets an electron in your tissue, and <strong style={{color:GRN}}>annihilates</strong> — producing two gamma-ray photons at 511 keV each, travelling in exactly opposite directions (180°). Detectors surrounding the body record both photons simultaneously (coincidence detection) to pinpoint the annihilation event in 3D space. The result: a functional map of metabolic activity — where glucose is being consumed, where tumours are growing, where the brain is active.
                  </p>
                </div>
              </div>
            </div>

            {/* Angels & Demons facts */}
            <div style={card(ORG)}>
              <div style={secLabel}>Angels &amp; Demons · Antimatter Energy Scale · Angels &amp; Demons Lecture Night · York University</div>
              <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10, alignItems:"start" }}>
                <div>
                  <h2 style={h2(ORG)}>¼ Gram · 10 Kilotons · The Energy of Complete Conversion</h2>
                  <p style={{ ...body, fontSize:10.5 }}>
                    E=mc² with <em>both</em> sides: when matter and antimatter annihilate, <strong style={{color:ORG}}>100% of mass converts to energy</strong> — the most efficient energy release possible. No fission (0.1% efficient), no fusion (0.7% efficient). Full conversion.
                  </p>
                  <div style={{ display:"flex", flexDirection:"column", gap:5, marginTop:6 }}>
                    {[
                      { col:ORG,  v:"¼ gram", l:"of antimatter (= 11 grains of rice)" },
                      { col:RED,  v:"+ ¼ gram", l:"of matter (annihilation partner)" },
                      { col:GOLD, v:"= 10 kt TNT", l:"equivalent explosive yield" },
                      { col:VIO,  v:"Nagasaki:", l:"20 kilotons — just 2× this tiny amount" },
                    ].map(({ col, v, l }) => (
                      <div key={l} style={{ display:"flex", gap:8, alignItems:"center",
                        background:`${col}0d`, border:`1px solid ${col}33`, borderRadius:3, padding:"5px 9px" }}>
                        <span style={{ fontFamily:OR, fontSize:9, color:col, minWidth:64 }}>{v}</span>
                        <span style={{ fontSize:10.5, color:"rgba(190,205,225,0.65)" }}>{l}</span>
                      </div>
                    ))}
                  </div>
                  <div style={{ ...body, fontSize:10.5, marginTop:8 }}>
                    Why don't we have antimatter weapons? Production: current CERN output ≈ 10 nanograms/year at enormous cost. Containment: antimatter must be suspended in magnetic fields — contact with any matter causes annihilation. The physics is real; the engineering is centuries away.
                  </div>
                </div>
                <img src={imgDemons} alt="Angels and Demons antimatter" style={{ width:"100%", borderRadius:3, opacity:0.88 }} />
              </div>
            </div>
          </div>
        </div>

        {/* spine as wave carrier */}
        <div style={{ ...card(TEAL), marginBottom:14 }}>
          <div style={secLabel}>The Body as Wave Carrier · Spine · Cerebrospinal Fluid · Kundalini · The Living Temporal Field · Grok AI Art</div>
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:14, alignItems:"start" }}>
            <img src={imgSpine1} alt="Spine light wave art" style={{ width:"100%", borderRadius:4, display:"block" }} />
            <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
              <h2 style={h2(TEAL)}>The Spine Is Not a Strut · It Is a Wave Conductor</h2>
              <p style={body}>
                The spinal column is not merely a structural support — it is the primary <strong style={{color:TEAL}}>wave conductor</strong> of the living body. Cerebrospinal fluid (CSF) pulses rhythmically through the subarachnoid space in synchrony with the cardiac cycle, respiratory rhythm, and the slower Mayer wave (≈0.1 Hz). These are not static pressures — they are travelling pressure waves, propagating up and down the spinal canal at measurable velocities.
              </p>
              {[
                { col:TEAL, t:"Craniosacral Rhythm",
                  b:"A subtle 6–12 cycle/min oscillation of CSF pressure detectable at the skull and sacrum — the basis of craniosacral therapy. The dura mater (membrane surrounding the cord) flexes with each wave." },
                { col:VIO,  t:"Sympathetic/Parasympathetic Wave",
                  b:"The autonomic nervous system runs bilateral chains along the thoracic and lumbar spine. HRV (heart rate variability) — the primary biomarker of resilience — reflects the wave-like push-pull between sympathetic (SNS) acceleration and parasympathetic (PNS) braking." },
                { col:GOLD, t:"Neural Propagation Velocity",
                  b:"Action potentials travel the spinal cord at 70–120 m/s (myelinated fibres) — a true wave of electrochemical potential, propagating as a depolarisation front with refractory phase. The spine is a high-bandwidth wave transmission line." },
                { col:PINK, t:"Kundalini / Sushumna",
                  b:"In yogic tradition, the central channel (Sushumna) running through the spine is the path of awakening energy — rising as a wave from the sacrum to the crown. This maps onto the CSF pressure wave and the ascending reticular activating system (ARAS) which mediates consciousness and wakefulness." },
              ].map(({ col, t, b }) => (
                <div key={t} style={{ background:`${col}0d`, border:`1px solid ${col}33`,
                  borderRadius:4, padding:"7px 10px" }}>
                  <div style={{ fontFamily:MN, fontSize:8, color:col, fontWeight:700, marginBottom:3 }}>{t}</div>
                  <div style={{ fontSize:10.5, color:"rgba(190,205,225,0.65)", lineHeight:1.6 }}>{b}</div>
                </div>
              ))}
            </div>
            <img src={imgSpine2} alt="Spine fluid wave art" style={{ width:"100%", borderRadius:4, display:"block" }} />
          </div>
        </div>

        {/* CP Violation / Baryon Asymmetry canvas */}
        <div style={{ ...card(VIO), marginBottom:14 }}>
          <div style={secLabel}>CP violation · baryon asymmetry · Big Bang · 1 in 10⁹ matter surplus · animated build-up · why the universe exists</div>
          <h2 style={h2(VIO)}>Why We Exist · CP Violation &amp; the 1-in-a-Billion Asymmetry</h2>
          <CPViolationCanvas />
          <div style={{ ...body, fontSize:10.5, marginTop:8, maxWidth:860 }}>
            If the Big Bang produced exactly equal matter and antimatter, mutual annihilation would have left only photons. CP violation — a tiny asymmetry in how the weak force treats particles vs antiparticles — left <strong style={{color:VIO}}>1 extra matter particle per billion pairs</strong>. All observable matter — every star, planet, atom in your body — is that surplus. The animated bars show matter building up to exactly 1,000,000,001 while antimatter reaches 1,000,000,000.
          </div>
        </div>

        {/* PET Scanner simulation */}
        <div style={{ ...card(GRN), marginBottom:14 }}>
          <div style={secLabel}>Live PET scanner · β⁺ decay · positron emission · e⁺+e⁻ annihilation → 2γ at 511 keV · coincidence detection ring · medical antimatter</div>
          <h2 style={h2(GRN)}>PET Scanner · Antimatter Medicine in Action</h2>
          <PETScannerCanvas />
          <div style={{ ...body, fontSize:10.5, marginTop:8, maxWidth:860 }}>
            Radiotracer (e.g. ¹⁸F-FDG) undergoes <strong style={{color:GRN}}>β⁺ decay</strong> inside your tissue. The emitted positron travels 1–3 mm before meeting an electron — annihilating to produce <strong style={{color:GOLD}}>two 511 keV gamma photons</strong> travelling in exactly opposite directions (conservation of momentum). A ring of scintillator detectors (shown) records both photons simultaneously — coincidence detection narrows the annihilation point to a line. Rotating geometry + computer reconstruction produces the 3D metabolic map. Green detector lights = coincidence pair detected.
          </div>
        </div>

        {/* AETHER synthesis */}
        <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:10, marginBottom:14 }}>
          {[
            { col:VIO,  t:"CPT Symmetry as the Deepest Mirror",
              b:"The prism principle (white light reveals spectrum), regulatory depth (genome reveals epigenome), the Standard Model (matter reveals antimatter) — all are instances of the same pattern: apparent unity conceals deep structure. CPT symmetry is the most fundamental version: every particle implies its mirror, and time itself is part of that mirror. Reality is symmetric at its deepest level — and asymmetric at the observable one. We live in the asymmetry." },
            { col:PINK, t:"Time as Field, Not Line",
              b:"Linear time is a cognitive simplification — a 1D projection of a higher-dimensional field. In QFT, time appears in the propagator as a complex exponential: e^{iHt}. Feynman diagrams allow antiparticles to be interpreted as particles moving backward in time. Time reversal is a symmetry operation, not an impossibility. The wave model of time is closer to the mathematical truth: oscillatory, bidirectional, entangled with space, curved by mass." },
            { col:GOLD, t:"The Big Bang Asymmetry: Why We Exist",
              b:"If CPT were exact and the Big Bang produced equal matter and antimatter, everything would have annihilated to pure photons. The universe exists because of CP violation — approximately 1 extra matter particle per billion matter-antimatter pairs. All the stars, planets, bodies, and thoughts are the surviving fraction of that asymmetry. Our existence is the residue of an almost-perfect cancellation." },
            { col:TEAL, t:"PET Scan: Antimatter as Diagnostic Tool",
              b:"The same physics that predicted the annihilation of the universe is used daily in hospital oncology departments. Positrons — antielectrons — annihilate inside you, and the resulting 511 keV photon pairs are triangulated by detectors to produce 3D maps of metabolic activity. The boundary between the physical universe and the body has always been thinner than it appears. Antimatter is not out there; it is in here." },
            { col:RED,  t:"Quarks Never Alone: Confinement as Coherence",
              b:"Quarks cannot be isolated — the energy required to separate them produces new quark-antiquark pairs instead. This is the AETHER principle in particle physics: the fundamental units do not exist in isolation. They are always already relational. The proton (uud) is not three quarks; it is the bound state of three quarks plus a sea of virtual quarks and gluons. Identity is always composite. Unity is always emergent." },
            { col:GRN,  t:"Spine Wave + Time Wave: The Living Field",
              b:"'Time is not linear — it's a free-flowing dynamic wave.' The spine is the body's primary wave conductor. CSF oscillates at craniosacral frequency; autonomic tone oscillates as HRV; neural signals propagate as action potential waves. The body is not an object moving through time — it is itself a wave pattern in the temporal field. Each breath, each heartbeat, each neural pulse: a local oscillation of a larger, non-linear field. The body surfs time exactly as the particle surfs the quantum field." },
          ].map(({ col, t, b }) => (
            <div key={t} style={{ background:"rgba(0,0,0,0.42)", border:`1px solid ${col}22`, borderRadius:4, padding:"10px 14px" }}>
              <div style={{ fontFamily:OR, fontSize:9, color:col, letterSpacing:1, marginBottom:6 }}>{t}</div>
              <div style={{ fontSize:10.5, color:"rgba(200,210,228,0.65)", lineHeight:1.65 }}>{b}</div>
            </div>
          ))}
        </div>

        <div style={{ paddingTop:10, borderTop:"1px solid rgba(31,212,200,0.08)",
          fontFamily:MN, fontSize:7.5, color:DIM, letterSpacing:"0.12em", textAlign:"center" }}>
          ANTIMATTER · PAUL DIRAC 1928 · CARL ANDERSON 1932 · CPT SYMMETRY · C CONJUGATION · P PARITY · T TIME REVERSAL ·
          STANDARD MODEL · QUARKS · LEPTONS · PET SCAN · POSITRON EMISSION · SPINE WAVE · CSF · KUNDALINI · TIME AS WAVE · AETHER CRYSTALLISATION
        </div>
      </div>
    </div>
  );
}
