import React, { useEffect, useRef } from "react";

const V = {
  bg:     "#03050C",
  aurora: "#00FFB2",
  gold:   "#C8A030",
  blue:   "#4488FF",
  vio:    "#9966FF",
  amb:    "#FF9933",
  rose:   "#FF6699",
  plasma: "#FF4477",
  green:  "#44CC77",
  cyan:   "#22DDFF",
  teal:   "#00CCBB",
  lime:   "#88EE44",
  dim:    "#2A3850",
  ink:    "#B8CCE8",
  mono:   "'Space Mono',monospace" as const,
  serif:  "'Crimson Pro',serif"    as const,
  disp:   "'Cinzel',serif"         as const,
};

/* ─────────────────────────────────────────────────────────────────────────
   CANVAS 1 · Pineal Gland — Fibonacci Chip + Calcite Crystals + Icons
   ───────────────────────────────────────────────────────────────────────── */
function PinealCanvas() {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const cv = ref.current; if (!cv) return;
    const CH = 380, PR = window.devicePixelRatio || 1;
    const CW = Math.max(cv.offsetWidth, 520);
    cv.width = CW * PR; cv.height = CH * PR; cv.style.height = CH + "px";
    const ctx = cv.getContext("2d")!; ctx.scale(PR, PR);

    const CYCLE = 1600;
    let frame = 0, raf = 0;

    /* Fibonacci sunflower (left) — pinecone chip structure */
    const FCX = CW * 0.28, FCY = CH * 0.52;
    const FR = Math.min(CW * 0.22, CH * 0.40);
    const N = 89;
    const GOLDEN = 2.399963;
    const cells = Array.from({ length: N }, (_, i) => ({
      x:         FCX + FR * Math.sqrt((i + 0.5) / N) * Math.cos(i * GOLDEN),
      y:         FCY + FR * Math.sqrt((i + 0.5) / N) * Math.sin(i * GOLDEN),
      isCrystal: i % 7 === 0 || i % 13 === 0,
      isCenter:  i < 8,
      phase:     Math.random() * Math.PI * 2,
    }));

    /* Cross-section layers (right) */
    const SCX = CW * 0.75, SCY = CH * 0.50, SR = Math.min(CW * 0.17, CH * 0.34);

    /* Melatonin particles */
    type MP = { x: number; y: number; vx: number; vy: number; alpha: number };
    const mels: MP[] = [];
    let spawnTick = 0;

    /* Draw Eye of Ra (simplified) */
    const drawEyeOfRa = (ex: number, ey: number, scale: number) => {
      ctx.save(); ctx.translate(ex, ey);
      ctx.strokeStyle = V.gold + "CC"; ctx.lineWidth = 1 * scale;
      /* almond eye */
      ctx.beginPath();
      ctx.moveTo(-18*scale, 0);
      ctx.quadraticCurveTo(-5*scale, -10*scale, 0, -7*scale);
      ctx.quadraticCurveTo(8*scale, -12*scale, 18*scale, 0);
      ctx.quadraticCurveTo(8*scale, 12*scale, 0, 8*scale);
      ctx.quadraticCurveTo(-5*scale, 10*scale, -18*scale, 0);
      ctx.stroke();
      /* pupil */
      ctx.fillStyle = V.gold + "88";
      ctx.beginPath(); ctx.arc(2*scale, 0, 5*scale, 0, Math.PI*2); ctx.fill();
      /* lower teardrop */
      ctx.strokeStyle = V.gold + "99";
      ctx.beginPath(); ctx.moveTo(0, 8*scale); ctx.lineTo(-4*scale, 16*scale); ctx.lineTo(-8*scale, 12*scale); ctx.stroke();
      /* spiral decoration */
      ctx.beginPath(); ctx.moveTo(18*scale, 0); ctx.quadraticCurveTo(24*scale, -6*scale, 20*scale, -10*scale); ctx.stroke();
      ctx.restore();
    };

    /* Draw triangle eye (all-seeing) */
    const drawTriangleEye = (tx: number, ty: number, scale: number) => {
      ctx.save(); ctx.translate(tx, ty);
      ctx.strokeStyle = V.vio + "CC"; ctx.lineWidth = 1 * scale;
      const h = 20 * scale;
      ctx.beginPath();
      ctx.moveTo(0, -h); ctx.lineTo(-h*0.9, h*0.55); ctx.lineTo(h*0.9, h*0.55); ctx.closePath(); ctx.stroke();
      /* rays */
      for (let k = 0; k < 8; k++) {
        const a = (k/8)*Math.PI*2;
        ctx.beginPath();
        ctx.moveTo(Math.cos(a)*h*0.7, Math.sin(a)*h*0.7);
        ctx.lineTo(Math.cos(a)*h*1.1, Math.sin(a)*h*1.1);
        ctx.stroke();
      }
      ctx.fillStyle = V.vio + "44";
      ctx.beginPath(); ctx.arc(0, 4*scale, 5*scale, 0, Math.PI*2); ctx.fill();
      ctx.strokeStyle = V.vio + "AA";
      ctx.beginPath(); ctx.arc(0, 4*scale, 5*scale, 0, Math.PI*2); ctx.stroke();
      ctx.restore();
    };

    const draw = () => {
      frame = (frame + 1) % CYCLE;
      const phase = frame / CYCLE;
      const nightIntensity = Math.max(0, Math.sin((phase - 0.5) * Math.PI * 2) * 0.5 + 0.5);
      const isNight = phase > 0.48 && phase < 0.98;
      const mltRatio = isNight ? Math.min(1, (phase - 0.48) / 0.12) : 0;

      ctx.fillStyle = V.bg; ctx.fillRect(0, 0, CW, CH);

      /* night sky wash */
      if (nightIntensity > 0.1) {
        const ns = ctx.createRadialGradient(FCX, FCY, 0, FCX, FCY, FR * 2.5);
        ns.addColorStop(0, `rgba(60,20,100,${nightIntensity * 0.15})`);
        ns.addColorStop(1, "rgba(0,0,0,0)");
        ctx.fillStyle = ns; ctx.fillRect(0, 0, CW, CH);
      }

      /* light ray from top during day */
      if (!isNight) {
        const dI = 1 - nightIntensity;
        const lg = ctx.createLinearGradient(FCX, 0, FCX, FCY);
        lg.addColorStop(0, `rgba(200,160,48,${dI * 0.2})`);
        lg.addColorStop(1, "rgba(0,0,0,0)");
        ctx.fillStyle = lg;
        ctx.fillRect(FCX - 40, 0, 80, FCY);
      }

      /* ── FIBONACCI CHIP (left) ── */
      cells.forEach((c, i) => {
        const pulse = 0.4 + 0.6 * Math.abs(Math.sin(frame * 0.015 + c.phase));
        const baseCol = c.isCrystal ? V.cyan : c.isCenter ? V.aurora : V.blue;
        const activity = c.isCenter ? mltRatio : c.isCrystal ? 0.3 + nightIntensity * 0.7 : 0.15 + nightIntensity * 0.5;
        const r = c.isCrystal ? 3.8 : c.isCenter ? 4.5 : 2.8;
        const glow = ctx.createRadialGradient(c.x, c.y, 0, c.x, c.y, r * 3);
        glow.addColorStop(0, baseCol + Math.round(activity * pulse * 180).toString(16).padStart(2,"00"));
        glow.addColorStop(1, "rgba(0,0,0,0)");
        ctx.fillStyle = glow; ctx.beginPath(); ctx.arc(c.x, c.y, r * 3, 0, Math.PI*2); ctx.fill();
        ctx.fillStyle = baseCol + Math.round(80 + activity * pulse * 175).toString(16).padStart(2,"0");
        ctx.beginPath(); ctx.arc(c.x, c.y, r, 0, Math.PI*2); ctx.fill();
      });

      /* fibonacci boundary ring */
      ctx.strokeStyle = V.dim + "44"; ctx.lineWidth = 0.8;
      ctx.beginPath(); ctx.arc(FCX, FCY, FR, 0, Math.PI*2); ctx.stroke();
      ctx.beginPath(); ctx.arc(FCX, FCY, FR + 14, 0, Math.PI*2); ctx.stroke();
      ctx.fillStyle = V.gold + "88"; ctx.font = `6px ${V.mono}`;
      ctx.fillText("PINECONE  φ-SPIRAL  8/13", FCX - 50, FCY + FR + 24);
      ctx.fillStyle = V.dim + "BB"; ctx.font = `5.5px ${V.mono}`;
      ctx.fillText("FIBONACCI CHIP STRUCTURE", FCX - 44, FCY + FR + 34);

      /* ── CROSS-SECTION (right) ── */
      /* outer capsule */
      ctx.strokeStyle = V.gold + "44"; ctx.lineWidth = 2;
      ctx.beginPath(); ctx.ellipse(SCX, SCY, SR, SR*0.82, 0, 0, Math.PI*2); ctx.stroke();
      ctx.fillStyle = V.gold + "06";
      ctx.beginPath(); ctx.ellipse(SCX, SCY, SR, SR*0.82, 0, 0, Math.PI*2); ctx.fill();

      /* pinealocyte layer */
      for (let k = 0; k < 24; k++) {
        const a = (k/24)*Math.PI*2;
        const rx = SCX + Math.cos(a)*(SR-8), ry = SCY + Math.sin(a)*(SR-8)*0.82;
        const act = 0.3 + (isNight ? 0.7 : 0.2) * Math.abs(Math.sin(frame*0.012+k*0.5));
        ctx.fillStyle = `rgba(0,255,178,${act * 0.7})`;
        ctx.beginPath(); ctx.ellipse(rx, ry, 3.5, 5, a, 0, Math.PI*2); ctx.fill();
      }

      /* calcite crystal layer */
      for (let k = 0; k < 16; k++) {
        const a = (k/16)*Math.PI*2 + 0.2;
        const rx = SCX + Math.cos(a)*(SR*0.60), ry = SCY + Math.sin(a)*(SR*0.60)*0.82;
        const pulse = 0.5 + 0.5*Math.sin(frame*0.04+k*1.1);
        ctx.fillStyle = V.cyan + Math.round(100+pulse*155).toString(16).padStart(2,"0");
        ctx.beginPath(); ctx.arc(rx, ry, 3+pulse*2, 0, Math.PI*2); ctx.fill();
      }

      /* center CSF channel */
      ctx.fillStyle = V.blue + "22";
      ctx.beginPath(); ctx.ellipse(SCX, SCY, SR*0.22, SR*0.18, 0, 0, Math.PI*2); ctx.fill();
      ctx.strokeStyle = V.blue + "55"; ctx.lineWidth = 0.8;
      ctx.beginPath(); ctx.ellipse(SCX, SCY, SR*0.22, SR*0.18, 0, 0, Math.PI*2); ctx.stroke();
      ctx.fillStyle = V.blue + "88"; ctx.font = `5.5px ${V.mono}`;
      ctx.fillText("CSF", SCX-8, SCY+3);

      /* section labels */
      ctx.fillStyle = V.aurora + "99"; ctx.font = `5.5px ${V.mono}`;
      ctx.fillText("PINEALOCYTES", SCX + SR - 2, SCY - SR*0.2);
      ctx.fillStyle = V.cyan + "99"; ctx.fillText("CALCITE", SCX + SR*0.65, SCY + SR*0.6);
      ctx.fillStyle = V.gold + "88"; ctx.fillText("CAPSULE", SCX + SR, SCY);
      ctx.fillStyle = V.vio + "88"; ctx.font = `6px ${V.mono}`;
      ctx.fillText(isNight ? "NIGHT · MELATONIN ↑" : "DAY · MELATONIN ↓", SCX - 38, SCY + SR*0.82 + 18);

      /* melatonin particles (night only) */
      if (isNight && ++spawnTick >= 4 && mels.length < 60) {
        spawnTick = 0;
        const a = Math.random() * Math.PI * 2;
        mels.push({
          x: SCX + Math.cos(a) * SR * 0.15, y: SCY + Math.sin(a) * SR * 0.15 * 0.82,
          vx: Math.cos(a) * (0.8 + Math.random() * 1.2),
          vy: Math.sin(a) * (0.8 + Math.random() * 1.2) * 0.82,
          alpha: 0.7 + Math.random() * 0.3,
        });
      }
      for (let i = mels.length-1; i >= 0; i--) {
        const m = mels[i];
        m.x += m.vx; m.y += m.vy; m.alpha -= 0.012;
        if (m.alpha <= 0) { mels.splice(i, 1); continue; }
        ctx.fillStyle = V.vio + Math.round(m.alpha * 220).toString(16).padStart(2,"0");
        ctx.beginPath(); ctx.arc(m.x, m.y, 2, 0, Math.PI*2); ctx.fill();
      }

      /* ── ICONS ── */
      drawEyeOfRa(50, 38, 0.9);
      ctx.fillStyle = V.gold + "66"; ctx.font = `5.5px ${V.mono}`;
      ctx.fillText("EYE OF RA", 14, 64);

      drawTriangleEye(CW - 56, 42, 0.85);
      ctx.fillStyle = V.vio + "66"; ctx.font = `5.5px ${V.mono}`;
      const te = "ALL-SEEING EYE";
      ctx.fillText(te, CW - 12 - ctx.measureText(te).width, 68);

      /* day/night progress bar */
      ctx.fillStyle = V.dim + "44"; ctx.fillRect(FCX - FR, CH - 18, FR*2, 4);
      const barCol = isNight ? V.vio : V.gold;
      ctx.fillStyle = barCol + "CC";
      ctx.fillRect(FCX - FR, CH - 18, FR*2*phase, 4);
      ctx.fillStyle = V.dim + "AA"; ctx.font = `6px ${V.mono}`;
      ctx.fillText(phase < 0.25 ? "DAWN" : phase < 0.48 ? "DAY" : phase < 0.72 ? "DUSK" : "NIGHT",
        FCX - 12, CH - 5);

      raf = requestAnimationFrame(draw);
    };
    raf = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(raf);
  }, []);
  return <canvas ref={ref} style={{ width:"100%", height:"380px", borderRadius:6, display:"block" }} />;
}

/* ─────────────────────────────────────────────────────────────────────────
   CANVAS 2 · Vertebrate Vision — Spectrum + Cone Sensitivity
   ───────────────────────────────────────────────────────────────────────── */
function wavelengthToRGB(λ: number, alpha = 1): string {
  let r = 0, g = 0, b = 0;
  if      (λ < 350)              { r = 0.5; g = 0;   b = 0.8; }
  else if (λ < 380)              { r = 0.5*(380-λ)/30+0.3; g = 0; b = 1; }
  else if (λ < 440)              { r = (440 - λ) / 60; g = 0; b = 1; }
  else if (λ < 490)              { r = 0; g = (λ - 440) / 50; b = 1; }
  else if (λ < 510)              { r = 0; g = 1; b = (510 - λ) / 20; }
  else if (λ < 580)              { r = (λ - 510) / 70; g = 1; b = 0; }
  else if (λ < 645)              { r = 1; g = (645 - λ) / 65; b = 0; }
  else if (λ < 780)              { r = 1; g = 0; b = 0; }
  else                           { r = 0.4; g = 0; b = 0; }
  const fac = λ < 420 ? 0.3 + 0.7 * (λ - 380) / 40
            : λ > 700 ? 0.3 + 0.7 * (780 - λ) / 80 : 1;
  return `rgba(${Math.round(r*255*fac)},${Math.round(g*255*fac)},${Math.round(b*255*fac)},${alpha})`;
}

const SPECIES = [
  {
    name: "HUMAN", sub: "Homo sapiens", cones: 3, range: [380,700],
    peaks: [{ nm:420, col:"#8888FF", lbl:"S" }, { nm:530, col:"#44FF88", lbl:"M" }, { nm:560, col:"#FF6622", lbl:"L" }],
  },
  {
    name: "BIRD (PIGEON)", sub: "Columba livia", cones: 4, range: [310,700],
    peaks: [{ nm:360, col:"#BB44FF", lbl:"UV" }, { nm:440, col:"#8888FF", lbl:"S" }, { nm:543, col:"#44FF88", lbl:"M" }, { nm:567, col:"#FF6622", lbl:"L" }],
  },
  {
    name: "DOG", sub: "Canis lupus", cones: 2, range: [400,650],
    peaks: [{ nm:430, col:"#8888FF", lbl:"S" }, { nm:555, col:"#AAFF44", lbl:"L" }],
  },
  {
    name: "HONEYBEE", sub: "Apis mellifera", cones: 3, range: [300,650],
    peaks: [{ nm:344, col:"#CC44FF", lbl:"UV" }, { nm:436, col:"#6688FF", lbl:"B" }, { nm:544, col:"#44EE88", lbl:"G" }],
  },
  {
    name: "MANTIS SHRIMP", sub: "Stomatopoda", cones: 16, range: [280,720],
    peaks: [{ nm:320,col:"#FF00FF",lbl:"1" },{ nm:380,col:"#AA44FF",lbl:"4" },{ nm:430,col:"#6666FF",lbl:"7" },{ nm:480,col:"#44AAFF",lbl:"10" },{ nm:530,col:"#44FF88",lbl:"12" },{ nm:580,col:"#FFFF44",lbl:"14" },{ nm:620,col:"#FF8844",lbl:"15" },{ nm:680,col:"#FF3322",lbl:"16" }],
  },
];

function VertebratevisionCanvas() {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const cv = ref.current; if (!cv) return;
    const CH = 300, PR = window.devicePixelRatio || 1;
    const CW = Math.max(cv.offsetWidth, 520);
    cv.width = CW * PR; cv.height = CH * PR; cv.style.height = CH + "px";
    const ctx = cv.getContext("2d")!; ctx.scale(PR, PR);

    const NM_MIN = 280, NM_MAX = 760;
    const BAR_Y = 24, BAR_H = 18;
    const LEFT_PAD = 140;
    const RIGHT_PAD = 20;
    const PLOT_W = CW - LEFT_PAD - RIGHT_PAD;
    let frame = 0, raf = 0;

    const nmToX = (nm: number) => LEFT_PAD + (nm - NM_MIN) / (NM_MAX - NM_MIN) * PLOT_W;

    const ROW_H = (CH - BAR_Y - BAR_H - 16) / SPECIES.length;

    const draw = () => {
      frame++;
      ctx.fillStyle = V.bg; ctx.fillRect(0, 0, CW, CH);

      /* spectrum bar */
      for (let x = 0; x < PLOT_W; x++) {
        const nm = NM_MIN + (x / PLOT_W) * (NM_MAX - NM_MIN);
        ctx.fillStyle = wavelengthToRGB(nm, nm < 380 || nm > 700 ? 0.35 : 0.95);
        ctx.fillRect(LEFT_PAD + x, BAR_Y, 1, BAR_H);
      }
      ctx.strokeStyle = V.dim + "66"; ctx.lineWidth = 0.8;
      ctx.strokeRect(LEFT_PAD, BAR_Y, PLOT_W, BAR_H);

      /* nm axis ticks */
      [300,350,400,450,500,550,600,650,700,750].forEach(nm => {
        const x = nmToX(nm);
        ctx.fillStyle = V.dim + "88"; ctx.font = `5.5px ${V.mono}`;
        ctx.fillText(String(nm), x - 8, BAR_Y + BAR_H + 10);
        ctx.strokeStyle = V.dim + "33"; ctx.lineWidth = 0.5;
        ctx.beginPath(); ctx.moveTo(x, BAR_Y + BAR_H); ctx.lineTo(x, BAR_Y + BAR_H + 4); ctx.stroke();
      });
      ctx.fillStyle = V.dim + "88"; ctx.font = `6px ${V.mono}`;
      ctx.fillText("nm →", LEFT_PAD + PLOT_W + 2, BAR_Y + BAR_H + 10);

      /* UV / IR labels */
      ctx.fillStyle = "#AA44FF99"; ctx.font = `5.5px ${V.mono}`;
      ctx.fillText("UV", LEFT_PAD + 2, BAR_Y + BAR_H - 4);
      ctx.fillStyle = "#FF333399"; ctx.font = `5.5px ${V.mono}`;
      ctx.fillText("IR", nmToX(730), BAR_Y + BAR_H - 4);

      /* species rows */
      SPECIES.forEach((sp, si) => {
        const rowY = BAR_Y + BAR_H + 18 + si * ROW_H;
        const mid  = rowY + ROW_H * 0.5;

        /* range band */
        const rx1 = nmToX(sp.range[0]), rx2 = nmToX(sp.range[1]);
        ctx.fillStyle = `rgba(68,136,255,0.07)`;
        ctx.fillRect(rx1, rowY + 2, rx2 - rx1, ROW_H - 4);
        ctx.strokeStyle = V.blue + "28"; ctx.lineWidth = 0.6;
        ctx.strokeRect(rx1, rowY + 2, rx2 - rx1, ROW_H - 4);

        /* sensitivity curves (Gaussian approx for each cone) */
        sp.peaks.forEach(pk => {
          const SIGMA = 35;
          ctx.beginPath();
          let first = true;
          for (let nm = NM_MIN; nm <= NM_MAX; nm += 2) {
            const sens = Math.exp(-((nm - pk.nm) ** 2) / (2 * SIGMA * SIGMA));
            const h = (ROW_H - 8) * sens;
            const cx = nmToX(nm), cy = mid + (ROW_H * 0.35) - h;
            if (first) { ctx.moveTo(cx, mid + ROW_H * 0.35); first = false; }
            ctx.lineTo(cx, cy);
          }
          ctx.lineTo(nmToX(NM_MAX), mid + ROW_H * 0.35);
          ctx.fillStyle = pk.col + "44"; ctx.fill();
          ctx.strokeStyle = pk.col + "CC"; ctx.lineWidth = 1.2;
          ctx.beginPath();
          for (let nm = NM_MIN; nm <= NM_MAX; nm += 2) {
            const sens = Math.exp(-((nm - pk.nm) ** 2) / (2 * SIGMA * SIGMA));
            const h = (ROW_H - 8) * sens;
            const cx = nmToX(nm), cy = mid + (ROW_H * 0.35) - h;
            if (nm === NM_MIN) ctx.moveTo(cx, cy); else ctx.lineTo(cx, cy);
          }
          ctx.stroke();
          /* cone label */
          const px = nmToX(pk.nm);
          const py = mid + (ROW_H * 0.35) - (ROW_H - 8) - 3;
          ctx.fillStyle = pk.col; ctx.font = `5.5px ${V.mono}`;
          ctx.fillText(pk.lbl, px - 3, py);
        });

        /* scanning photon */
        const scanNm = NM_MIN + ((frame * 0.8 + si * 80) % (NM_MAX - NM_MIN));
        const inRange = scanNm >= sp.range[0] && scanNm <= sp.range[1];
        const sx = nmToX(scanNm);
        ctx.fillStyle = wavelengthToRGB(scanNm, inRange ? 0.95 : 0.25);
        ctx.beginPath(); ctx.arc(sx, mid - 2, inRange ? 4 : 2.5, 0, Math.PI * 2); ctx.fill();
        if (inRange) {
          const gg = ctx.createRadialGradient(sx, mid-2, 0, sx, mid-2, 10);
          gg.addColorStop(0, wavelengthToRGB(scanNm, 0.5)); gg.addColorStop(1, "rgba(0,0,0,0)");
          ctx.fillStyle = gg; ctx.beginPath(); ctx.arc(sx, mid-2, 10, 0, Math.PI*2); ctx.fill();
        }

        /* species label */
        ctx.fillStyle = V.ink + "CC"; ctx.font = `bold 7px ${V.mono}`;
        ctx.fillText(sp.name, 6, mid - 2);
        ctx.fillStyle = V.dim + "AA"; ctx.font = `5.5px ${V.mono}`;
        ctx.fillText(sp.sub, 6, mid + 9);
        ctx.fillStyle = V.gold + "99"; ctx.font = `5.5px ${V.mono}`;
        ctx.fillText(`${sp.cones} cone${sp.cones>1?"s":""}`, 6, mid + 19);

        /* row separator */
        if (si < SPECIES.length - 1) {
          ctx.strokeStyle = V.dim + "22"; ctx.lineWidth = 0.5;
          ctx.beginPath(); ctx.moveTo(0, rowY + ROW_H); ctx.lineTo(CW, rowY + ROW_H); ctx.stroke();
        }
      });

      raf = requestAnimationFrame(draw);
    };
    raf = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(raf);
  }, []);
  return <canvas ref={ref} style={{ width:"100%", height:"300px", borderRadius:6, display:"block" }} />;
}

/* ─────────────────────────────────────────────────────────────────────────
   CANVAS 3 · Moss Simulation + Solar Arc + Water Potency
   ───────────────────────────────────────────────────────────────────────── */
const MOSS_TYPES = [
  {
    name: "SPHAGNUM", sub: "Peat Moss", col: V.green,  cx: 0.18, shape: "broad",
    fact: "absorbs 20× weight in water",
  },
  {
    name: "POLYTRICHUM", sub: "Haircap", col: V.lime,   cx: 0.50, shape: "tall",
    fact: "conducting tissue like vascular plants",
  },
  {
    name: "BRYUM", sub: "Thread Moss", col: V.teal,  cx: 0.80, shape: "cushion",
    fact: "survives desiccation + urban surfaces",
  },
];

function MossWaterCanvas() {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const cv = ref.current; if (!cv) return;
    const CH = 420, PR = window.devicePixelRatio || 1;
    const CW = Math.max(cv.offsetWidth, 520);
    cv.width = CW * PR; cv.height = CH * PR; cv.style.height = CH + "px";
    const ctx = cv.getContext("2d")!; ctx.scale(PR, PR);

    const CYCLE = 1200;
    let frame = 0, raf = 0;

    const GROUND_Y = CH * 0.72;
    const SUN_CX = CW * 0.50, SUN_R = 20;
    const SUN_ARC_W = CW * 0.70, SUN_ARC_Y = CH * 0.06;

    /* solar arc: sun travels from left to right on half-sine */
    const getSunPos = (t: number) => ({
      x: SUN_CX - SUN_ARC_W/2 + t * SUN_ARC_W,
      y: SUN_ARC_Y + (1 - Math.sin(t * Math.PI)) * (GROUND_Y * 0.5),
    });

    /* moss growth segments — pre-generated */
    type MossCell = { x:number; y:number; angle:number; len:number; width:number };
    const mossSegments: { cells: MossCell[]; col: string }[] = MOSS_TYPES.map(mt => {
      const bx = mt.cx * CW;
      const cells: MossCell[] = [];
      if (mt.shape === "broad") {
        /* sphagnum: fan of upward + horizontal branches */
        for (let branch = 0; branch < 12; branch++) {
          const angle = (-0.55 + branch * 0.10) + (Math.random() - 0.5) * 0.05;
          const len = 14 + Math.random() * 22;
          let cx = bx + (Math.random()-0.5)*18, cy = GROUND_Y;
          cells.push({ x:cx, y:cy, angle, len, width: 1.8 + Math.random() });
          for (let seg = 0; seg < 3; seg++) {
            const nx = cx + Math.cos(-Math.PI/2 + angle)*len*0.7;
            const ny = cy - Math.abs(Math.sin(-Math.PI/2 + angle)*len*0.7);
            cells.push({ x:nx, y:ny, angle: angle + (Math.random()-0.5)*0.25, len: len*0.7, width:1.2 });
            cx = nx; cy = ny;
          }
        }
      } else if (mt.shape === "tall") {
        /* polytrichum: vertical stalks with horizontal leaf whorls */
        for (let stalk = 0; stalk < 8; stalk++) {
          let cx = bx + (Math.random()-0.5)*30, cy = GROUND_Y;
          const height = 50 + Math.random() * 55;
          cells.push({ x:cx, y:cy, angle:0, len:height, width:1.5 });
          /* leaves at each node */
          for (let node = 0; node < 5; node++) {
            const ny = cy - height * (0.15 + node*0.17);
            for (let leaf = 0; leaf < 6; leaf++) {
              const la = (leaf/6)*Math.PI*2;
              cells.push({ x:cx, y:ny, angle:la+Math.PI/2, len:8+Math.random()*6, width:0.9 });
            }
          }
        }
      } else {
        /* bryum: dense cushion of short curved stems */
        for (let stem = 0; stem < 30; stem++) {
          const off = (Math.random()-0.5)*38;
          const angle = -0.5 + Math.random()*1.0;
          cells.push({ x:bx+off, y:GROUND_Y, angle, len:10+Math.random()*18, width:1.1 });
        }
      }
      return { cells, col: mt.col };
    });

    /* water particles */
    type WP = { x:number; y:number; vy:number; alpha:number; mossIdx:number };
    const waters: WP[] = [];

    /* photon particles from sun */
    type PP = { x:number; y:number; tx:number; ty:number; t:number; mossIdx:number; hit:boolean };
    const photons: PP[] = [];
    let spawnTick = 0;

    const draw = () => {
      frame = (frame + 1) % CYCLE;
      const solarT = (frame / CYCLE);
      const sunPos  = getSunPos(solarT);
      const sunEnergy = Math.sin(solarT * Math.PI); // 0 at dawn/dusk, 1 at noon

      ctx.fillStyle = V.bg; ctx.fillRect(0, 0, CW, CH);

      /* sky gradient */
      const sky = ctx.createLinearGradient(0, 0, 0, GROUND_Y);
      const skyR = Math.round(4 + sunEnergy * 6), skyG = Math.round(6 + sunEnergy * 12), skyB = Math.round(12 + sunEnergy * 8);
      sky.addColorStop(0, `rgb(${skyR},${skyG},${skyB})`);
      sky.addColorStop(1, `rgb(${skyR+2},${skyG+4},${skyB+4})`);
      ctx.fillStyle = sky; ctx.fillRect(0, 0, CW, GROUND_Y);

      /* solar arc path */
      ctx.strokeStyle = V.gold + "18"; ctx.lineWidth = 1;
      ctx.setLineDash([4, 8]);
      ctx.beginPath();
      for (let t = 0; t <= 1; t += 0.02) {
        const p = getSunPos(t);
        if (t === 0) ctx.moveTo(p.x, p.y); else ctx.lineTo(p.x, p.y);
      }
      ctx.stroke(); ctx.setLineDash([]);

      /* sun */
      const sunGlow = ctx.createRadialGradient(sunPos.x, sunPos.y, 0, sunPos.x, sunPos.y, SUN_R * 4);
      sunGlow.addColorStop(0, `rgba(255,220,100,${sunEnergy * 0.6})`);
      sunGlow.addColorStop(1, "rgba(0,0,0,0)");
      ctx.fillStyle = sunGlow; ctx.beginPath(); ctx.arc(sunPos.x, sunPos.y, SUN_R*4, 0, Math.PI*2); ctx.fill();
      ctx.fillStyle = `rgba(255,220,80,${0.8 + sunEnergy*0.2})`;
      ctx.beginPath(); ctx.arc(sunPos.x, sunPos.y, SUN_R, 0, Math.PI*2); ctx.fill();

      /* sun time label */
      const hr = Math.round(6 + solarT * 12);
      ctx.fillStyle = V.gold + "AA"; ctx.font = `6px ${V.mono}`;
      ctx.fillText(`${hr}:00`, sunPos.x - 10, sunPos.y - SUN_R - 6);

      /* ground */
      ctx.fillStyle = "#0D1A08";
      ctx.fillRect(0, GROUND_Y, CW, CH - GROUND_Y);
      ctx.strokeStyle = V.dim + "55"; ctx.lineWidth = 0.8;
      ctx.beginPath(); ctx.moveTo(0, GROUND_Y); ctx.lineTo(CW, GROUND_Y); ctx.stroke();

      /* spawn photons toward each moss */
      if (sunEnergy > 0.05 && ++spawnTick >= 10 && photons.length < 60) {
        spawnTick = 0;
        const mi = Math.floor(Math.random() * MOSS_TYPES.length);
        const mt = MOSS_TYPES[mi];
        const tx = mt.cx * CW + (Math.random()-0.5)*35;
        const ty = GROUND_Y - 30 - Math.random() * 40;
        photons.push({ x:sunPos.x, y:sunPos.y, tx, ty, t:0, mossIdx:mi, hit:false });
      }
      for (let i = photons.length-1; i >= 0; i--) {
        const p = photons[i];
        p.t += 0.025 * (1 + sunEnergy*0.5);
        if (p.t >= 1) {
          if (!p.hit) {
            p.hit = true;
            /* spawn water absorption particle */
            waters.push({ x:p.tx, y:p.ty, vy:0.3+Math.random()*0.4, alpha:0.7, mossIdx:p.mossIdx });
          }
          photons.splice(i, 1); continue;
        }
        const x = p.x + (p.tx - p.x) * p.t;
        const y = p.y + (p.ty - p.y) * p.t;
        const a = 1 - p.t * 0.5;
        ctx.fillStyle = V.gold + Math.round(a * 200).toString(16).padStart(2,"0");
        ctx.beginPath(); ctx.arc(x, y, 1.5, 0, Math.PI*2); ctx.fill();
      }

      /* ── DRAW MOSS ── */
      const growProgress = Math.min(1, frame / 300); // grows in over 300 frames
      mossSegments.forEach((ms, mi) => {
        const mt = MOSS_TYPES[mi];
        const visCount = Math.floor(ms.cells.length * growProgress);
        ms.cells.slice(0, visCount).forEach(c => {
          if (mt.shape === "tall" && c.len > 20) {
            /* stalk */
            ctx.strokeStyle = ms.col + "BB"; ctx.lineWidth = c.width;
            ctx.beginPath(); ctx.moveTo(c.x, c.y); ctx.lineTo(c.x, c.y - c.len); ctx.stroke();
          } else if (mt.shape === "broad") {
            ctx.strokeStyle = ms.col + "AA"; ctx.lineWidth = c.width;
            ctx.beginPath();
            ctx.moveTo(c.x, c.y);
            ctx.lineTo(c.x + Math.cos(-Math.PI/2 + c.angle)*c.len,
                       c.y + Math.sin(-Math.PI/2 + c.angle)*c.len);
            ctx.stroke();
          } else {
            ctx.strokeStyle = ms.col + "99"; ctx.lineWidth = c.width;
            ctx.beginPath();
            ctx.moveTo(c.x, c.y);
            ctx.lineTo(c.x + Math.cos(-Math.PI/2 + c.angle)*c.len,
                       c.y + Math.sin(-Math.PI/2 + c.angle)*c.len);
            ctx.stroke();
          }
        });

        /* photosynthesis glow when hit */
        const recentHit = photons.some(p => p.mossIdx === mi && p.t > 0.85);
        if (recentHit) {
          const bx = mt.cx * CW, by = GROUND_Y - 30;
          const gg = ctx.createRadialGradient(bx, by, 0, bx, by, 28);
          gg.addColorStop(0, ms.col + "44"); gg.addColorStop(1, "rgba(0,0,0,0)");
          ctx.fillStyle = gg; ctx.beginPath(); ctx.arc(bx, by, 28, 0, Math.PI*2); ctx.fill();
        }

        /* label */
        ctx.fillStyle = ms.col + "CC"; ctx.font = `bold 7px ${V.mono}`;
        ctx.fillText(mt.name, mt.cx * CW - ctx.measureText(mt.name).width/2, GROUND_Y + 16);
        ctx.fillStyle = V.dim + "AA"; ctx.font = `6px ${V.mono}`;
        ctx.fillText(mt.sub, mt.cx * CW - ctx.measureText(mt.sub).width/2, GROUND_Y + 27);
        ctx.fillStyle = mt.col + "77"; ctx.font = `5.5px ${V.mono}`;
        const fw = ctx.measureText(mt.fact).width;
        ctx.fillText(mt.fact, mt.cx * CW - fw/2, GROUND_Y + 38);
      });

      /* water rhizoid particles */
      for (let i = waters.length-1; i >= 0; i--) {
        const w = waters[i];
        w.y += w.vy; w.alpha -= 0.008;
        if (w.alpha <= 0 || w.y > GROUND_Y + 30) { waters.splice(i, 1); continue; }
        ctx.fillStyle = V.blue + Math.round(w.alpha * 200).toString(16).padStart(2,"0");
        ctx.beginPath(); ctx.arc(w.x, w.y, 1.6, 0, Math.PI*2); ctx.fill();
      }

      /* ── WATER POTENCY INSET ── */
      const WX = CW - 145, WY = GROUND_Y + 52;
      ctx.fillStyle = V.dim + "33"; ctx.fillRect(WX, WY, 135, 115);
      ctx.strokeStyle = V.blue + "44"; ctx.lineWidth = 0.8;
      ctx.strokeRect(WX, WY, 135, 115);
      ctx.fillStyle = V.cyan + "CC"; ctx.font = `bold 6.5px ${V.mono}`;
      ctx.fillText("HOMEOPATHIC POTENCY", WX + 8, WY + 12);
      const vials = [
        { lbl:"6C",   dil:"10⁻¹²",  memo:"low",    col:V.blue  },
        { lbl:"30C",  dil:"10⁻⁶⁰",  memo:"medium", col:V.vio   },
        { lbl:"200C", dil:"10⁻⁴⁰⁰", memo:"high",   col:V.aurora},
      ];
      vials.forEach((v, vi) => {
        const vx = WX + 18 + vi * 40, vy = WY + 24;
        /* vial */
        ctx.strokeStyle = v.col + "88"; ctx.lineWidth = 1;
        ctx.strokeRect(vx - 7, vy, 14, 30);
        /* fill level */
        ctx.fillStyle = v.col + "22"; ctx.fillRect(vx - 7, vy, 14, 30);
        /* molecule dots (decreasing count) */
        const dots = vi === 0 ? 5 : vi === 1 ? 2 : 0;
        for (let d = 0; d < dots; d++) {
          ctx.fillStyle = V.gold;
          ctx.beginPath();
          ctx.arc(vx - 4 + (d%2)*8, vy + 5 + Math.floor(d/2)*8, 2, 0, Math.PI*2);
          ctx.fill();
        }
        /* H-bond network dots (increasing) */
        const hbCount = (vi+1)*3;
        for (let h = 0; h < hbCount; h++) {
          ctx.fillStyle = v.col + "AA";
          ctx.beginPath();
          ctx.arc(vx - 5 + (h%3)*5, vy + 14 + Math.floor(h/3)*7, 1.2, 0, Math.PI*2);
          ctx.fill();
        }
        ctx.fillStyle = v.col + "CC"; ctx.font = `bold 7px ${V.mono}`;
        ctx.fillText(v.lbl, vx - 5, vy + 38);
        ctx.fillStyle = V.dim + "BB"; ctx.font = `5.5px ${V.mono}`;
        ctx.fillText(v.dil, vx - 9, vy + 48);
        ctx.fillStyle = v.col + "88"; ctx.font = `5.5px ${V.mono}`;
        ctx.fillText(v.memo, vx - 8, vy + 58);
      });
      ctx.fillStyle = V.cyan + "55"; ctx.font = `5.5px ${V.mono}`;
      ctx.fillText("water memory · H-bond cluster", WX + 8, WY + 110);

      /* solar energy bar */
      ctx.fillStyle = V.dim + "44"; ctx.fillRect(12, CH - 22, 160, 4);
      ctx.fillStyle = V.gold + "CC"; ctx.fillRect(12, CH - 22, 160 * sunEnergy, 4);
      ctx.fillStyle = V.gold + "88"; ctx.font = `6px ${V.mono}`;
      ctx.fillText(`SOLAR IRRADIANCE  ${Math.round(sunEnergy*100)}%`, 12, CH - 8);

      raf = requestAnimationFrame(draw);
    };
    raf = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(raf);
  }, []);
  return <canvas ref={ref} style={{ width:"100%", height:"420px", borderRadius:6, display:"block" }} />;
}

/* ─────────────────────────────────────────────────────────────────────────
   PAGE
   ───────────────────────────────────────────────────────────────────────── */
export default function PinealMossVisionPage() {
  const S: React.CSSProperties = {
    background: V.bg, color: V.ink, minHeight:"100vh",
    padding:"40px 32px 100px", fontFamily: V.serif, maxWidth:980, margin:"0 auto",
  };
  const badge = (t:string, col=V.aurora) => (
    <span key={t} style={{ fontFamily:V.mono, fontSize:"0.52rem", color:col, border:`1px solid ${col}44`,
      borderRadius:3, padding:"2px 8px", letterSpacing:2, marginRight:6, marginBottom:5, display:"inline-block" }}>{t}</span>
  );
  const sec = (n:string, title:string, col:string, body:React.ReactNode) => (
    <section style={{ marginBottom:52 }}>
      <div style={{ fontFamily:V.mono, fontSize:"0.55rem", color:col, letterSpacing:3, marginBottom:5 }}>
        {n} ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─
      </div>
      <h2 style={{ fontFamily:V.disp, fontSize:"clamp(0.95rem,2.4vw,1.45rem)", color:col,
        margin:"0 0 18px", letterSpacing:"0.06em", fontWeight:400 }}>{title}</h2>
      {body}
    </section>
  );
  const P = (t:string) => (
    <p style={{ fontFamily:V.serif, fontSize:"clamp(0.88rem,1.7vw,1.02rem)", lineHeight:1.78,
      color:V.ink, margin:"0 0 13px", opacity:0.9 }}>{t}</p>
  );
  const cards = (items:{h:string;col:string;d:string}[], cols="repeat(auto-fit,minmax(200px,1fr))") => (
    <div style={{ display:"grid", gridTemplateColumns:cols, gap:10, marginTop:12 }}>
      {items.map(c => (
        <div key={c.h} style={{ background:`${c.col}0C`, border:`1px solid ${c.col}33`, borderRadius:6, padding:"10px 12px" }}>
          <div style={{ fontFamily:V.mono, fontSize:"0.59rem", color:c.col, letterSpacing:1.5, marginBottom:5 }}>{c.h}</div>
          <div style={{ fontFamily:V.serif, fontSize:"0.82rem", color:V.ink, lineHeight:1.5 }}>{c.d}</div>
        </div>
      ))}
    </div>
  );

  return (
    <div style={S}>

      {/* header */}
      <div style={{ marginBottom:42 }}>
        {[badge("LIVE SIMULATION"), badge("PINEAL GLAND",V.gold), badge("FIBONACCI CHIP",V.vio), badge("VERTEBRATE VISION",V.cyan), badge("MOSS SIMULATION",V.lime), badge("WATER POTENCY",V.blue), badge("SOLAR PLASMA",V.amb)]}
        <h1 style={{ fontFamily:V.disp, fontSize:"clamp(1.4rem,4vw,2.6rem)", color:V.ink,
          margin:"22px 0 8px", letterSpacing:"0.06em", fontWeight:400, lineHeight:1.2 }}>
          PINEAL · VISION · MOSS · WATER
        </h1>
        <p style={{ fontFamily:V.mono, fontSize:"0.58rem", color:V.dim, letterSpacing:3, margin:"0 0 22px" }}>
          PINECONE CHIP · CALCITE CRYSTALS · SPECTRUM PERCEPTION · SOLAR ARC · HOMEOPATHY · SPACE-TIME NAVIGATION
        </p>
        {P("The pineal gland is a pine cone — the shape was noticed in antiquity and embedded in every major symbol system from ancient Egypt to modern Freemasonry. It is not metaphor: the gland has the same Fibonacci spiral cell arrangement as a pine cone, contains calcite crystals (corpora arenacea) capable of piezoelectric transduction, and in most non-mammalian vertebrates is a literal photoreceptor — the original 'third eye'. In mammals, it responds to light indirectly via the retinohypothalamic tract, timing melatonin secretion to the solar cycle.")}
        {P("The solar cycle that drives the pineal drives everything here: vertebrate vision evolved to navigate specific spectral windows in sunlight, water's homeopathic potency theory relates to solar irradiance structuring H-bond clusters, and moss — the oldest land plant — uses solar angle and geomagnetic field (itself shaped by the sun's ionized plasma output) for orientation. Ionized solar hydrogen and helium produce the solar wind; this magnetized plasma interacts with Earth's field; organisms with magnetite nanocrystals — moss, migrating birds, the pineal itself — read this field as a navigational signal.")}
      </div>

      {/* S1 — Pineal */}
      {sec("01","Pineal Gland · Fibonacci Chip · Calcite Crystals · Icons",V.gold,<>
        {P("The pineal gland's 89 pinealocytes are arranged in a Fibonacci spiral — the same geometric packing that creates the 8/13 spiral of a pine cone and the 34/55 spiral of a sunflower. This is not coincidence: Fibonacci packing is the densest arrangement possible for circular objects on a spherical surface, minimizing inter-cell gap. The gland also contains corpora arenacea (brain sand) — calcite microcrystals in a hydroxyapatite matrix that exhibit piezoelectric behavior under mechanical or electromagnetic stress.")}
        {P("Across cultures, the pinecone and the eye appear together: Osiris carries a pinecone-topped staff, Dionysus's thyrsus is tipped with one, an eight-foot bronze pine cone stands in the Vatican courtyard, and the Eye of Ra/Horus in Egyptian iconography maps precisely onto the anatomy of a pineal cross-section overlaid on a mid-sagittal brain view. The all-seeing eye in the triangle encodes the same structure geometrically — a cone of vision projecting from the apex.")}
        <div style={{ border:`1px solid ${V.dim}44`, borderRadius:8, padding:2, marginBottom:14 }}>
          <PinealCanvas />
        </div>
        {cards([
          { h:"FIBONACCI 8/13 SPIRAL", col:V.gold,   d:"89 pinealocytes in golden-angle packing. 8 spirals clockwise, 13 counter. Same as pine cone. Maximally efficient cell array — the biological chip." },
          { h:"CALCITE CRYSTALS",      col:V.cyan,   d:"Corpora arenacea = brain sand. Piezoelectric: compress them and they generate voltage. EMF sensitive. Concentration increases from childhood onward." },
          { h:"THIRD EYE (LITERAL)",   col:V.vio,    d:"In lamprey, frog, lizard: pineal protrudes through skull, has its own lens and retina-like structure. Directly photosensitive. Mammals lost this function ~200 Ma." },
          { h:"MELATONIN + DMT",       col:V.rose,   d:"Highest serotonin concentration in the body. Melatonin peaks at 2-3am. Trace DMT detected in rodent pineal — possibly produced during REM and near-death states." },
          { h:"EYE OF RA / HORUS",     col:V.aurora, d:"The Egyptian eye maps onto the mid-sagittal brain: the thalamus = pupil, the pineal = tear drop, the corpus callosum = eyebrow, the hypothalamus = lower marking." },
          { h:"MAGNETITE NANOCRYSTALS",col:V.blue,   d:"Single-domain magnetite Fe₃O₄ crystals found in human pineal. These are geomagnetically sensitive — a candidate substrate for solar-wind → circadian coupling." },
        ])}
      </>)}

      {/* S2 — Vision */}
      {sec("02","Vertebrate Vision · Spectrum Comparison · What Humans Perceive",V.cyan,<>
        {P("Human trichromatic vision (3 cone types) covers 380–700 nm — a narrow window of the solar spectrum, optimized for the peak output of a G-type yellow dwarf star. Birds broke free of this constraint: pigeon UV cones detect 310 nm, allowing them to see UV patterns on flowers, mate plumage, and solar position through overcast sky. Bees navigate by UV polarization maps of the sky invisible to humans. Mantis shrimp carry 16 photoreceptor types spanning 280–720 nm and process colour locally in each receptor — they do not mix colours in the brain the way vertebrates do.")}
        {P("The scanning dot in each row below shows a photon traversing the spectrum — when it enters a species' sensitive range, it brightens and glows. Watch how the mantis shrimp is never without a 'seen' photon while all others go dark in UV and IR regions. The pineal gland in many species is a 17th detector: sensitive to circadian-relevant blue (480 nm) and melanopsin-sensitive wavelengths independently of retinal input.")}
        <div style={{ border:`1px solid ${V.dim}44`, borderRadius:8, padding:2, marginBottom:14 }}>
          <VertebratevisionCanvas />
        </div>
        {cards([
          { h:"HUMAN — 380–700 nm",     col:V.blue,   d:"Trichromatic. 6M cones, 120M rods. Red-green perception evolved for ripe fruit detection in forest canopy. ~10M distinguishable colours." },
          { h:"BIRD — 310–700 nm",      col:V.vio,    d:"Tetrachromatic. UV cone detects star positions for migration. Oil droplets in cones act as internal colour filters — pigment + optics." },
          { h:"DOG — 400–650 nm",       col:V.rose,   d:"Dichromatic (like red-green blind humans). Strong blue-violet and yellow. No red cone. Compensated by 250M olfactory receptors for world-building." },
          { h:"BEE — 300–650 nm",       col:V.gold,   d:"UV + blue + green. Sees UV nectar guides on flowers invisible to humans. Navigates by polarization patterns in overcast sky." },
          { h:"MANTIS SHRIMP 280–720nm",col:V.aurora, d:"16 photoreceptor types. Does NOT mix colours — identifies wavelength locally. Fastest strike in the ocean (23ms). Circular polarization vision." },
        ])}
      </>)}

      {/* S3 — Moss */}
      {sec("03","Moss Simulation · Solar Irradiance · Water as Growth Medium · Navigation",V.lime,<>
        {P("Moss (division Bryophyta) is 450 million years old — the first plant to colonise land. It has no vascular tissue (except Polytrichum, which independently evolved a conducting system), no roots, and no seeds. It survives by treating water itself as the growth medium: gametes swim through water films to fertilise, spores are released into the air, and the gametophyte body absorbs water and nutrients directly through its surface. This makes moss a living demonstration of water's homeopathic function — the water medium carries the chemical signal directly into the plant cells.")}
        {P("Moss uses solar irradiance angle, geomagnetic field, and humidity gradients for orientation. In the northern hemisphere, north-facing rock surfaces receive less direct sunlight — moss exploits this, growing preferentially on the north side and providing a passive compass for anyone who can read it. Sporophyte capsules orient toward maximum light. Some bryophytes contain magnetite nanocrystals and show magnetotaxis — growing directionally in response to applied magnetic fields. The solar plasma (ionized H/He from the Sun → solar wind → geomagnetic field modulation) ultimately powers this navigation: the same process that drives auroras drives moss orientation.")}
        <div style={{ border:`1px solid ${V.dim}44`, borderRadius:8, padding:2, marginBottom:14 }}>
          <MossWaterCanvas />
        </div>
        {cards([
          { h:"SPHAGNUM · PEAT MOSS",     col:V.green, d:"Absorbs 20× its dry weight in water. Cells are dead hollow tubes (hyaline cells) that act as capillaries. Creates peat bogs — stores more carbon than all world forests." },
          { h:"POLYTRICHUM · HAIRCAP",    col:V.lime,  d:"Tallest moss (up to 70cm). Has hydroids and leptoids — conducting cells analogous to xylem and phloem. Star-shaped leaf whorls maximise light capture at low angles." },
          { h:"BRYUM · THREAD MOSS",      col:V.teal,  d:"Urban survivor — colonizes concrete, gutters, rooftops. Survives desiccation (cryptobiosis) and revives with water. Model organism for space biology studies." },
          { h:"SOLAR NAVIGATION",         col:V.gold,  d:"Sporophytes orient toward peak irradiance. North-side growth bias is a magnetic + solar composite signal. Moss reading = primitive space-time navigation." },
        ], "repeat(auto-fit,minmax(210px,1fr))")}
      </>)}

      {/* S4 — Homeopathy */}
      {sec("04","Water Potency · Homeopathy · H-Bond Memory",V.blue,<>
        {P("Samuel Hahnemann's law of infinitesimals (1796) states that serial dilution increases therapeutic potency. At 6C (10⁻¹² dilution), one molecule of the original substance remains per trillion water molecules. At 30C (10⁻⁶⁰), the probability of a single original molecule being present is essentially zero — below Avogadro's number (6×10²³). At 200C, the dilution is 10⁻⁴⁰⁰ — a number with no physical meaning in terms of discrete molecules.")}
        {P("The water memory hypothesis proposes that hydrogen bond networks retain structural information about dissolved substances beyond the point of molecular absence. Standard chemistry: H-bonds break and reform in 1–10 picoseconds — no structural memory can persist. However, clathrate hydrates (cage structures of water molecules around solute) can persist for microseconds to milliseconds, and long-range water structure induced by dissolved ions extends 10–20 molecular layers. Whether this is sufficient for biological signalling remains unresolved. What is clear: plants respond to water quality at sub-molecular levels — growth rate, germination, and root architecture vary with the source water's history in ways not fully explained by standard mineral analysis.")}
        {cards([
          { h:"6C DILUTION  10⁻¹²",   col:V.blue,   d:"Still statistically likely to contain original molecules. Lowest potency in classical homeopathy. H-bond clusters around solute molecules begin forming." },
          { h:"30C DILUTION  10⁻⁶⁰",  col:V.vio,    d:"Beyond Avogadro's number. No original molecules likely present. H-bond network the sole information carrier — if any." },
          { h:"200C DILUTION  10⁻⁴⁰⁰",col:V.aurora, d:"Highest common potency. Pure water by any molecular analysis. Used for constitutional and miasmatic treatment in classical practice." },
          { h:"GROWTH MEDIUM",        col:V.green,  d:"Moss and seed germination studies show differential response to homeopathically prepared water vs controls. Mechanism: unknown. Confound: experimenter expectation effects high." },
        ])}
      </>)}

      {/* S5 — Solar plasma notes */}
      {sec("05","Solar Plasma · Ionized Gas · Kepler Mission · Space-Time Navigation Grid",V.amb,<>
        {P("The Sun fuses hydrogen (1 proton) into helium (2 protons + 2 neutrons), releasing ionized plasma — the solar wind — at 400–800 km/s. This ionized hydrogen and helium carries embedded magnetic field lines (Parker spiral) and interacts with Earth's magnetosphere, compressing the dayside and extending the nightside tail. The geomagnetic field that results is not static: it modulates in response to solar activity, creating a dynamic spacetime reference frame that biology reads.")}
        {P("Discharge of ionized gas through a magnetic field produces visible emission lines — the colors of nebulae (hydrogen-alpha at 656nm red, OIII at 495/500nm teal, SII at 671nm deep red). The Kepler mission read these colors statistically across 150,000 stars to detect planetary transits — a cosmic-scale application of the same spectroscopic principles that govern vertebrate vision, pineal photosensitivity, and moss solar orientation. Everything is reading the same ionized plasma field. The pineal's magnetite, the moss's magnetotaxis, the bird's UV cones, the bee's polarization navigation, the mantis shrimp's 16-channel spectrum — all are optimized interfaces with the solar electromagnetic output.")}
        {cards([
          { h:"SOLAR WIND 400–800 km/s", col:V.amb,    d:"Ionized H + He plasma from the Sun's corona. Carries the Parker spiral magnetic field. Drives auroras, geomagnetic storms, and biological magnetotaxis signals." },
          { h:"GEOMAGNETIC FIELD",       col:V.gold,   d:"Shaped by solar wind pressure. Modulates over 11-year solar cycles and shorter Birkeland current events. Organism magnetite nanocrystals track these variations." },
          { h:"EMISSION LINES",          col:V.aurora, d:"Ionized gas emits at fixed λ: Hα 656nm (red), OIII 500nm (teal), SII 671nm (deep red). Nebula colors are literal atomic fingerprints — spectroscopic navigation." },
          { h:"KEPLER + 3Ai ATLAS",      col:V.blue,   d:"Kepler detected 2,600 exoplanets via transit photometry against stellar emission. 3Ai Atlas astrophotography maps plasma interaction zones — fern-like filament structures in ionized gas clouds." },
          { h:"SPACE-TIME NAVIGATION",   col:V.vio,    d:"Organism magnetite + solar wind + geomagnetic = natural GPS. Moss grows north. Birds navigate by magnetic + UV-polarization composite. Pineal tracks solar day via magnetite + melanopsin." },
          { h:"PLASMA HANDLE",           col:V.rose,   d:"The interface point where biological magnetite engages the geomagnetic field is the 'plasma handle' — the organism's grip on the solar electromagnetic reference frame." },
        ], "repeat(auto-fit,minmax(220px,1fr))")}
      </>)}

    </div>
  );
}
