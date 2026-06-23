import React, { useRef, useEffect, useState } from "react";

const V = {
  bg:     "#020408",
  aurora: "#00FFB2",
  gold:   "#C8A030",
  blue:   "#4488FF",
  violet: "#9966FF",
  amb:    "#FF9933",
  plasma: "#FF4477",
  green:  "#44CC77",
  dim:    "#3A5060",
  text:   "#B8CCE8",
  silver: "#C8D8E8",
  mono:   "'Space Mono', monospace",
  serif:  "'Crimson Pro', serif",
  display:"'Cinzel', serif",
};

const PHASES = [
  { name:"NEW MOON",        emoji:"🌑", angle:0,   illum:0,    spring:1.0,
    field:"Maximum spring tide. Solar + lunar gravity vectors coalign. Strongest coherent ambient EM field. Schumann resonance Q-factor peaks. Sap pressure lowest — roots absorb.",
    gw:"Groundwater spring tide peak. Aquifer tidal amplitude up to +30 cm above baseline. Artesian pressure maximized. Deep well output elevated.",
    biol:"Seed germination rates peak. Soil micro-organism activity highest. Human sleep architecture measurably shifts. Melatonin synthesis altered." },
  { name:"WAXING CRESCENT", emoji:"🌒", angle:45,  illum:0.15, spring:0.55,
    field:"Field building. Magnetic declination vectors orient NE. Electrostatic soil potential rising. Piezoelectric stress in quartz-bearing rock increases.",
    gw:"Water table ascending. Capillary rise in vadose zone accelerating. Root absorption zone expanding upward through soil column.",
    biol:"Plant shoot growth accelerating. Atmospheric ion concentration rising. Bird navigation more precise. Fungal hyphal extension rate elevated." },
  { name:"FIRST QUARTER",   emoji:"🌓", angle:90,  illum:0.5,  spring:0.0,
    field:"Neap tide. Sun and moon at 90° quadrature. Tidal forces partially cancel. Field oscillates in chaotic transition — lowest coherence state.",
    gw:"Water table at mid-amplitude. Oscillation period M2 dominant but spring-neap modulation at minimum. Artesian pressure stable.",
    biol:"Transition phase. Cellular mitosis rates shift. Immune system activity elevated. Plant leaf transpiration at daily equilibrium point." },
  { name:"WAXING GIBBOUS",  emoji:"🌔", angle:135, illum:0.85, spring:0.55,
    field:"Field approaching full-moon peak. Electrostatic charge building in soil. Ion concentration in groundwater elevated. ELF wave amplitude rising.",
    gw:"Tidal amplitude increasing toward spring. Pore pressure in consolidated sediments rising. Shallow wells show 8–15 cm uplift.",
    biol:"Peak foliar growth. Maximum chlorophyll synthesis rate. Animal nocturnal activity increasing. Fermentation and microbial yield elevated." },
  { name:"FULL MOON",       emoji:"🌕", angle:180, illum:1.0,  spring:1.0,
    field:"Maximum spring tide. Strongest ambient EM field coherence. Global Schumann resonance amplitude peaks. Tidal loading on Earth's crust measurable by GPS.",
    gw:"Second spring tide peak per month. Water table at maximum tidal elevation. Groundwater discharge to streams and springs peaks. Karst springs surge.",
    biol:"EEG amplitude in mammals measurably elevated. Blood pressure slightly higher. Coral spawning triggered. Plant sap at apex — optimal harvest." },
  { name:"WANING GIBBOUS",  emoji:"🌖", angle:225, illum:0.85, spring:0.55,
    field:"Field releasing. Lunar tidal force now decelerating Earth's crust. Ion concentration in soil moisture begins to drop. Piezoelectric relaxation.",
    gw:"Water table descending from spring peak. Aquifer draining slowly. Deep groundwater flow rate elevated — hydrological flushing phase.",
    biol:"Detoxification processes in biology elevated. Root systems pulling nutrients downward. Fungi network spore release maximized. Rest preparation." },
  { name:"LAST QUARTER",    emoji:"🌗", angle:270, illum:0.5,  spring:0.0,
    field:"Neap tide again. Field at secondary minimum. EM coherence low. Schumann Q-factor reduced. Atmospheric plasma density at monthly trough.",
    gw:"Water table at neap minimum. Tidal amplitude smallest of the cycle. Artesian pressure at baseline. Spring and stream discharge at local low.",
    biol:"Cellular rest phase. Minimum metabolic rate in many organisms. Soil bacteria sporulation rates peak — preservation mode." },
  { name:"WANING CRESCENT", emoji:"🌘", angle:315, illum:0.15, spring:0.55,
    field:"Withdrawal field — lunar draw retracts coherent field. Residual tidal stress releasing. Magnetic vectors return to solar-dominant orientation.",
    gw:"Final descent toward new-moon spring. Capillary water retreating. Soil moisture at monthly minimum just before new moon resets the cycle.",
    biol:"Composting field — decomposition maximized. Plant root activity deepest. Immune memory consolidation. Optimal time for pruning and clearing." },
];

// ─────────────────────────────────────────────────────────────────
// Canvas 1: Lunar Phase Field — moon + ambient EM field vectors
// ─────────────────────────────────────────────────────────────────
function LunarPhaseFieldCanvas({ dayIdx }: { dayIdx: number }) {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const canvas = ref.current; if (!canvas) return;
    const ctx = canvas.getContext("2d")!;
    let frame = 0, raf = 0;

    const T_synodic = 720;   // frames per full 29.53-day cycle
    const M2period  = 90;    // frames per M2 half-tide (12.42h)

    const draw = () => {
      const W = canvas.width, H = canvas.height;
      ctx.clearRect(0, 0, W, H);
      ctx.fillStyle = V.bg;
      ctx.fillRect(0, 0, W, H);

      // Phase from slider OR live animation
      const liveAngle = (frame / T_synodic) * Math.PI * 2;
      const phaseAngle = dayIdx >= 0
        ? (dayIdx / 29.53) * Math.PI * 2
        : liveAngle;

      const phaseIdx = Math.floor(((phaseAngle / (Math.PI * 2)) * 8 + 8) % 8);
      const phase = PHASES[phaseIdx];

      // Spring factor: cos²(phaseAngle/2) peaks at 0 (new) and π (full)
      const springFactor = (Math.cos(phaseAngle) * -0.5 + 0.5) * 0.6
        + (1 - Math.abs(Math.cos(phaseAngle))) * 0.4;

      const illum = (1 - Math.cos(phaseAngle)) / 2;

      // ── Stars ──
      for (let i = 0; i < 160; i++) {
        const sx = (i * 127.3 + 50) % W;
        const sy = (i * 73.7 + 30) % H;
        const twinkle = 0.25 + 0.55 * Math.sin(i * 1.7 + frame * 0.018);
        ctx.beginPath();
        ctx.arc(sx, sy, 0.6 + (i % 3) * 0.3, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(200,215,240,${twinkle * 0.7})`;
        ctx.fill();
      }

      // ── Moon ──
      const cx = W * 0.5, cy = H * 0.46;
      const moonR = Math.min(W, H) * 0.14;

      // Glow (spring-modulated)
      const glowR = moonR * (2.4 + springFactor * 1.2);
      const glow = ctx.createRadialGradient(cx, cy, moonR * 0.6, cx, cy, glowR);
      glow.addColorStop(0, `rgba(230,215,160,${0.06 + springFactor * 0.16})`);
      glow.addColorStop(0.4, `rgba(0,255,178,${springFactor * 0.04})`);
      glow.addColorStop(1, "transparent");
      ctx.beginPath();
      ctx.arc(cx, cy, glowR, 0, Math.PI * 2);
      ctx.fillStyle = glow;
      ctx.fill();

      // Moon dark body
      ctx.beginPath();
      ctx.arc(cx, cy, moonR, 0, Math.PI * 2);
      ctx.fillStyle = "#111828";
      ctx.fill();

      // Illuminated crescent/gibbous using clip
      ctx.save();
      ctx.beginPath();
      ctx.arc(cx, cy, moonR, 0, Math.PI * 2);
      ctx.clip();
      // limb: -moonR = full illumination, +moonR = new moon
      const limb = moonR * (1 - 2 * illum);
      ctx.beginPath();
      ctx.arc(cx + limb, cy, moonR, 0, Math.PI * 2);
      const moonGrad = ctx.createRadialGradient(cx + limb * 0.4, cy - moonR * 0.15, 0, cx + limb * 0.4, cy, moonR * 1.2);
      moonGrad.addColorStop(0, "rgba(255,245,220,0.95)");
      moonGrad.addColorStop(0.6, "rgba(220,200,160,0.9)");
      moonGrad.addColorStop(1, "rgba(180,160,120,0.8)");
      ctx.fillStyle = moonGrad;
      ctx.fill();
      ctx.restore();

      // Moon outline
      ctx.beginPath();
      ctx.arc(cx, cy, moonR, 0, Math.PI * 2);
      ctx.strokeStyle = `rgba(200,160,48,${0.15 + springFactor * 0.2})`;
      ctx.lineWidth = 1;
      ctx.stroke();

      // ── Ambient field lines ──
      const numLines = 32;
      for (let i = 0; i < numLines; i++) {
        const baseAngle = (i / numLines) * Math.PI * 2;
        // Organic wobble on each field line angle
        const wobble = 0.08 * Math.sin(i * 2.3 + frame * 0.025);
        const angle = baseAngle + wobble;

        const fieldMag = springFactor * (0.5 + 0.5 * Math.sin(i * 1.1 + frame * 0.015 + phaseAngle));
        const lineLen = moonR * (0.7 + fieldMag * 1.8);
        const startR = moonR + 4;

        const x1 = cx + Math.cos(angle) * startR;
        const y1 = cy + Math.sin(angle) * startR;
        const x2 = cx + Math.cos(angle) * (startR + lineLen);
        const y2 = cy + Math.sin(angle) * (startR + lineLen);

        // Color: aurora at spring, blue mid, dim at neap
        const col = springFactor > 0.65 ? V.aurora
          : springFactor > 0.3 ? V.blue : V.dim;
        const alpha = 0.1 + fieldMag * 0.55;

        ctx.beginPath();
        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y2);
        ctx.strokeStyle = col + Math.round(alpha * 255).toString(16).padStart(2, "0");
        ctx.lineWidth = 0.7 + fieldMag * 1.0;
        ctx.stroke();

        // Arrowhead on outer end
        if (fieldMag > 0.35) {
          const aA = Math.PI / 7;
          ctx.beginPath();
          ctx.moveTo(x2, y2);
          ctx.lineTo(x2 + Math.cos(angle + Math.PI + aA) * 6, y2 + Math.sin(angle + Math.PI + aA) * 6);
          ctx.moveTo(x2, y2);
          ctx.lineTo(x2 + Math.cos(angle + Math.PI - aA) * 6, y2 + Math.sin(angle + Math.PI - aA) * 6);
          ctx.strokeStyle = col + "88";
          ctx.lineWidth = 0.6;
          ctx.stroke();
        }
      }

      // ── Orbit ring ──
      ctx.beginPath();
      ctx.arc(cx, cy, moonR * 2.6, 0, Math.PI * 2);
      ctx.strokeStyle = "rgba(68,136,255,0.07)";
      ctx.lineWidth = 1;
      ctx.setLineDash([3, 9]);
      ctx.stroke();
      ctx.setLineDash([]);

      // Phase indicator dot on orbit
      const orbitR = moonR * 2.6;
      const ox = cx + Math.cos(phaseAngle - Math.PI / 2) * orbitR;
      const oy = cy + Math.sin(phaseAngle - Math.PI / 2) * orbitR;
      ctx.beginPath();
      ctx.arc(ox, oy, 4, 0, Math.PI * 2);
      ctx.fillStyle = V.gold;
      ctx.fill();

      // ── M2 tidal wave strip (bottom) ──
      const M2phase = (frame % M2period) / M2period;
      const waveY = H - 24;
      const waveAmp = 10 + springFactor * 14;
      ctx.beginPath();
      for (let x = 0; x < W; x++) {
        const t = (x / W + M2phase) * Math.PI * 2;
        const y = waveY + Math.sin(t) * waveAmp * 0.5
          + Math.sin(t * 1.93 + 0.4) * waveAmp * 0.3;
        if (x === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
      }
      const waveCol = springFactor > 0.65 ? V.aurora : V.blue;
      ctx.strokeStyle = waveCol + Math.round((0.3 + springFactor * 0.45) * 255).toString(16).padStart(2, "0");
      ctx.lineWidth = 1.5;
      ctx.stroke();

      // Second harmonic (K1 — diurnal)
      ctx.beginPath();
      for (let x = 0; x < W; x++) {
        const t = (x / W + M2phase * 0.52) * Math.PI * 2;
        const y = waveY - 6 + Math.sin(t * 0.97) * waveAmp * 0.35;
        if (x === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
      }
      ctx.strokeStyle = V.gold + "44";
      ctx.lineWidth = 1;
      ctx.stroke();

      // Labels
      ctx.fillStyle = `rgba(200,160,48,0.85)`;
      ctx.font = `bold 11px ${V.mono}`;
      ctx.textAlign = "center";
      ctx.fillText(`${phase.emoji}  ${phase.name}`, cx, cy + moonR * 2.6 + 20);

      ctx.fillStyle = "rgba(184,204,232,0.45)";
      ctx.font = `9px ${V.mono}`;
      ctx.fillText(
        `ILLUMINATION ${Math.round(illum * 100)}%   ·   SPRING FACTOR ${Math.round(springFactor * 100)}%   ·   DAY ${Math.round((phaseAngle / (Math.PI * 2)) * 29.53)}/${29}`,
        cx, cy + moonR * 2.6 + 35
      );

      ctx.fillStyle = "rgba(0,255,178,0.4)";
      ctx.font = `8px ${V.mono}`;
      ctx.textAlign = "left";
      ctx.fillText("M2 SEMI-DIURNAL (12.42 h)", 10, waveY - 18);
      ctx.fillStyle = "rgba(200,160,48,0.3)";
      ctx.fillText("K1 DIURNAL (23.93 h)", 10, waveY - 8);

      frame++;
      raf = requestAnimationFrame(draw);
    };

    draw();
    return () => cancelAnimationFrame(raf);
  }, [dayIdx]);

  return <canvas ref={ref} width={740} height={420} style={{ width: "100%", display: "block" }} />;
}

// ─────────────────────────────────────────────────────────────────
// Canvas 2: Groundwater Tide cross-section
// ─────────────────────────────────────────────────────────────────
function GroundwaterTideCanvas({ dayIdx }: { dayIdx: number }) {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const canvas = ref.current; if (!canvas) return;
    const ctx = canvas.getContext("2d")!;
    let frame = 0, raf = 0;

    const T_synodic = 720;
    const M2period  = 90;

    const LAYERS = [
      { name:"TOPSOIL",              frac:0.13, col:"rgba(110,75,35,0.75)", tc:"rgba(180,140,80,0.85)"  },
      { name:"VADOSE ZONE",          frac:0.22, col:"rgba(85,60,28,0.6)",   tc:"rgba(150,115,65,0.7)"  },
      { name:"WATER TABLE",          frac:0.03, col:"rgba(0,140,255,0.88)", tc:V.aurora                 },
      { name:"SATURATED ZONE",       frac:0.28, col:"rgba(0,85,190,0.22)",  tc:"rgba(68,136,255,0.85)" },
      { name:"CONFINING LAYER",      frac:0.05, col:"rgba(60,50,40,0.85)",  tc:"rgba(120,100,80,0.6)"  },
      { name:"CONFINED AQUIFER",     frac:0.14, col:"rgba(0,60,160,0.3)",   tc:"rgba(100,160,255,0.75)"},
      { name:"BEDROCK",              frac:0.15, col:"rgba(50,42,34,0.95)",  tc:"rgba(95,85,75,0.55)"   },
    ];

    const draw = () => {
      const W = canvas.width, H = canvas.height;
      ctx.clearRect(0, 0, W, H);
      ctx.fillStyle = V.bg;
      ctx.fillRect(0, 0, W, H);

      const phaseAngle = dayIdx >= 0
        ? (dayIdx / 29.53) * Math.PI * 2
        : (frame / T_synodic) * Math.PI * 2;

      const springFactor = (Math.cos(phaseAngle) * -0.5 + 0.5) * 0.6
        + (1 - Math.abs(Math.cos(phaseAngle))) * 0.4;

      const M2phase   = (frame % M2period) / M2period;
      const illum     = (1 - Math.cos(phaseAngle)) / 2;
      const phaseIdx  = Math.floor(((phaseAngle / (Math.PI * 2)) * 8 + 8) % 8);
      const phase     = PHASES[phaseIdx];

      // Tidal displacement in px: ±(10 + springFactor*28)
      const maxAmp   = 10 + springFactor * 28;
      const tidalPx  = Math.sin(M2phase * Math.PI * 2) * maxAmp;
      // Second harmonic (confined aquifer has different phase lag)
      const tidalPx2 = Math.sin(M2phase * Math.PI * 2 - 0.6) * maxAmp * 0.55;

      // ── Sky zone ──
      const skyH = H * 0.15;
      const skyGrad = ctx.createLinearGradient(0, 0, 0, skyH);
      skyGrad.addColorStop(0, "#020408");
      skyGrad.addColorStop(1, "rgba(5,10,22,0.7)");
      ctx.fillStyle = skyGrad;
      ctx.fillRect(0, 0, W, skyH);

      // Moon (top centre, small)
      const moonX = W * 0.5, moonY = skyH * 0.52;
      const moonR = 18;
      ctx.beginPath();
      ctx.arc(moonX, moonY, moonR, 0, Math.PI * 2);
      ctx.fillStyle = "#111828";
      ctx.fill();
      ctx.save();
      ctx.beginPath();
      ctx.arc(moonX, moonY, moonR, 0, Math.PI * 2);
      ctx.clip();
      const limb = moonR * (1 - 2 * illum);
      ctx.beginPath();
      ctx.arc(moonX + limb, moonY, moonR, 0, Math.PI * 2);
      ctx.fillStyle = "rgba(240,225,180,0.92)";
      ctx.fill();
      ctx.restore();

      // Tidal force arrow (down from moon)
      const arrowLen = 14 + springFactor * 22;
      const arrowBaseY = moonY + moonR + 3;
      ctx.beginPath();
      ctx.moveTo(moonX, arrowBaseY);
      ctx.lineTo(moonX, arrowBaseY + arrowLen);
      ctx.strokeStyle = `rgba(255,153,51,${0.45 + springFactor * 0.45})`;
      ctx.lineWidth = 2;
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(moonX, arrowBaseY + arrowLen);
      ctx.lineTo(moonX - 5, arrowBaseY + arrowLen - 7);
      ctx.lineTo(moonX + 5, arrowBaseY + arrowLen - 7);
      ctx.closePath();
      ctx.fillStyle = `rgba(255,153,51,${0.5 + springFactor * 0.4})`;
      ctx.fill();

      // Spring factor label beside moon
      ctx.fillStyle = "rgba(255,153,51,0.65)";
      ctx.font = `8px ${V.mono}`;
      ctx.textAlign = "left";
      ctx.fillText(`${phase.emoji} ${phase.name}`, moonX + moonR + 8, moonY - 2);
      ctx.fillStyle = "rgba(200,160,48,0.55)";
      ctx.fillText(`SPRING: ${Math.round(springFactor * 100)}%`, moonX + moonR + 8, moonY + 10);

      // ── Earth cross-section ──
      const groundStart = skyH;
      const groundH     = H - skyH - 10;
      // cross-section left block
      const blockW = W * 0.68;

      let curY = groundStart;
      LAYERS.forEach((layer, li) => {
        const lh = layer.frac * groundH;

        // Water-table offset
        const offset = li === 2 ? tidalPx
          : li === 3 ? tidalPx
          : li === 5 ? tidalPx2
          : 0;

        // Fill
        ctx.fillStyle = layer.col;
        ctx.fillRect(0, curY + offset, blockW, lh);

        // Grain / water texture
        if (li < 2) {
          // soil grain dots
          for (let i = 0; i < 60; i++) {
            const gx = 8 + (i * 83.1 % (blockW - 16));
            const gy = curY + offset + 4 + (i * 43.7 % (lh - 8));
            ctx.beginPath();
            ctx.arc(gx, gy, 1.1, 0, Math.PI * 2);
            ctx.fillStyle = li === 0 ? "rgba(130,95,50,0.35)" : "rgba(100,72,35,0.3)";
            ctx.fill();
          }
        }
        if (li === 3 || li === 5) {
          // floating water particles
          for (let i = 0; i < 50; i++) {
            const wx = 6 + (i * 117.3 % (blockW - 12));
            const wy = curY + offset + ((i * 59.3 + frame * 0.3) % lh);
            ctx.beginPath();
            ctx.arc(wx, wy, 1.5, 0, Math.PI * 2);
            ctx.fillStyle = li === 3
              ? `rgba(68,136,255,${0.25 + springFactor * 0.25})`
              : `rgba(100,160,255,${0.2 + springFactor * 0.2})`;
            ctx.fill();
          }
        }

        // Vertical displacement ticks on water table
        if (li === 2) {
          const tickX = blockW - 28;
          const baseY = curY + lh / 2;
          ctx.fillStyle = tidalPx > 0 ? V.aurora : V.violet;
          ctx.font = `7px ${V.mono}`;
          ctx.textAlign = "right";
          const cm = Math.round(Math.abs(tidalPx) / 28 * 30 * (0.3 + springFactor * 0.7));
          ctx.fillText(`${tidalPx > 0 ? "▲" : "▼"} ${cm} cm`, blockW - 6, baseY + offset + 4);
        }

        // Layer label
        ctx.fillStyle = layer.tc;
        ctx.font = `7px ${V.mono}`;
        ctx.textAlign = "left";
        ctx.fillText(layer.name, 6, curY + offset + lh / 2 + 3);

        // Right-side depth label
        ctx.fillStyle = "rgba(58,80,96,0.7)";
        ctx.textAlign = "right";
        const cumFrac = LAYERS.slice(0, li).reduce((a, l) => a + l.frac, 0);
        ctx.fillText(`−${Math.round(cumFrac * 35)}m`, blockW - 6, curY + offset + 12);

        curY += lh;
      });

      // Ground surface line
      ctx.beginPath();
      ctx.moveTo(0, groundStart);
      ctx.lineTo(blockW, groundStart);
      ctx.strokeStyle = "rgba(110,80,40,0.5)";
      ctx.lineWidth = 2;
      ctx.stroke();

      // ── Right panel: tidal amplitude time-series ──
      const panelX = blockW + 8;
      const panelW = W - panelX - 8;
      const panelH = H * 0.56;
      const panelY = groundStart + (H - groundStart - panelH) / 2;

      // Panel bg
      ctx.fillStyle = "rgba(4,10,22,0.85)";
      ctx.fillRect(panelX, panelY, panelW, panelH);
      ctx.strokeStyle = "rgba(68,136,255,0.12)";
      ctx.lineWidth = 1;
      ctx.strokeRect(panelX, panelY, panelW, panelH);

      // Panel title
      ctx.fillStyle = "rgba(68,136,255,0.6)";
      ctx.font = `7px ${V.mono}`;
      ctx.textAlign = "center";
      ctx.fillText("GROUNDWATER TIDE", panelX + panelW / 2, panelY + 11);
      ctx.fillText("HISTORY (cm)", panelX + panelW / 2, panelY + 20);

      // Zero line
      const zeroY = panelY + panelH / 2;
      ctx.beginPath();
      ctx.moveTo(panelX + 4, zeroY);
      ctx.lineTo(panelX + panelW - 4, zeroY);
      ctx.strokeStyle = "rgba(255,255,255,0.04)";
      ctx.lineWidth = 1;
      ctx.stroke();

      // Grid lines ±15cm
      [-1, 1].forEach(sign => {
        const gy = zeroY - sign * (panelH * 0.35);
        ctx.beginPath();
        ctx.moveTo(panelX + 4, gy);
        ctx.lineTo(panelX + panelW - 4, gy);
        ctx.strokeStyle = "rgba(255,255,255,0.03)";
        ctx.setLineDash([2, 5]);
        ctx.stroke();
        ctx.setLineDash([]);
        ctx.fillStyle = "rgba(58,80,96,0.5)";
        ctx.font = `6px ${V.mono}`;
        ctx.textAlign = "right";
        ctx.fillText(`${sign > 0 ? "+" : ""}${sign * 30}cm`, panelX + panelW - 4, gy + 3);
      });

      // Tidal trace (M2 + spring-neap envelope)
      const histLen = 200;
      // Unconfined aquifer
      ctx.beginPath();
      for (let fi = 0; fi < histLen; fi++) {
        const pf = frame - histLen + fi;
        const pa = dayIdx >= 0
          ? (dayIdx / 29.53) * Math.PI * 2
          : (pf / T_synodic) * Math.PI * 2;
        const ps = (Math.cos(pa) * -0.5 + 0.5) * 0.6 + (1 - Math.abs(Math.cos(pa))) * 0.4;
        const pm = ((pf % M2period) / M2period);
        const disp = Math.sin(pm * Math.PI * 2) * (10 + ps * 28);
        const px = panelX + 4 + (fi / histLen) * (panelW - 8);
        const py = zeroY - (disp / 38) * (panelH * 0.35);
        if (fi === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);
      }
      ctx.strokeStyle = `rgba(0,255,178,0.75)`;
      ctx.lineWidth = 1.5;
      ctx.stroke();

      // Confined aquifer (phase lag)
      ctx.beginPath();
      for (let fi = 0; fi < histLen; fi++) {
        const pf = frame - histLen + fi;
        const pa = dayIdx >= 0
          ? (dayIdx / 29.53) * Math.PI * 2
          : (pf / T_synodic) * Math.PI * 2;
        const ps = (Math.cos(pa) * -0.5 + 0.5) * 0.6 + (1 - Math.abs(Math.cos(pa))) * 0.4;
        const pm = ((pf % M2period) / M2period);
        const disp2 = Math.sin(pm * Math.PI * 2 - 0.6) * (10 + ps * 28) * 0.55;
        const px = panelX + 4 + (fi / histLen) * (panelW - 8);
        const py = zeroY - (disp2 / 38) * (panelH * 0.35);
        if (fi === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);
      }
      ctx.strokeStyle = `rgba(100,160,255,0.5)`;
      ctx.lineWidth = 1;
      ctx.stroke();

      // Current point
      const cpX = panelX + panelW - 5;
      const cpY = zeroY - (tidalPx / 38) * (panelH * 0.35);
      ctx.beginPath();
      ctx.arc(cpX, cpY, 3.5, 0, Math.PI * 2);
      ctx.fillStyle = V.aurora;
      ctx.fill();

      // Legend
      ctx.fillStyle = "rgba(0,255,178,0.6)";
      ctx.font = `6px ${V.mono}`;
      ctx.textAlign = "left";
      ctx.fillText("━ UNCONFINED AQUIFER", panelX + 5, panelY + panelH - 18);
      ctx.fillStyle = "rgba(100,160,255,0.5)";
      ctx.fillText("━ CONFINED AQUIFER", panelX + 5, panelY + panelH - 9);

      frame++;
      raf = requestAnimationFrame(draw);
    };

    draw();
    return () => cancelAnimationFrame(raf);
  }, [dayIdx]);

  return <canvas ref={ref} width={740} height={400} style={{ width: "100%", display: "block" }} />;
}

// ─────────────────────────────────────────────────────────────────
// Section + Divider helpers
// ─────────────────────────────────────────────────────────────────
function Section({ title, accent = V.gold, children, id }: {
  title: string; accent?: string; children: React.ReactNode; id?: string;
}) {
  return (
    <section id={id} style={{ marginBottom: 0 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 20 }}>
        <div style={{ width: 3, height: 22, background: accent, borderRadius: 2, flexShrink: 0 }} />
        <h2 style={{ margin: 0, fontFamily: V.mono, fontSize: "0.6rem", color: accent, letterSpacing: "0.2em", fontWeight: 400 }}>{title}</h2>
      </div>
      {children}
    </section>
  );
}
function Divider() {
  return <div style={{ margin: "40px 0", height: 1, background: "linear-gradient(90deg,transparent,rgba(255,255,255,0.06),transparent)" }} />;
}

// ─────────────────────────────────────────────────────────────────
// Main Page
// ─────────────────────────────────────────────────────────────────
export default function LunarAmbientFieldPage() {
  const [dayIdx, setDayIdx] = useState(-1); // -1 = live animation

  const activePhaseIdx = dayIdx >= 0
    ? Math.floor(((dayIdx / 29.53) * 8) % 8)
    : -1;

  return (
    <div style={{ height: "100%", overflowY: "auto", background: V.bg, color: V.text, fontFamily: V.serif, scrollBehavior: "smooth" }}>

      {/* ── Cinematic header ── */}
      <div style={{ padding: "32px 32px 0", borderBottom: `1px solid rgba(68,136,255,0.08)`, paddingBottom: 24 }}>
        <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
          {["LIVE SIMULATION", "LUNAR TIDE ENGINE", "GROUNDWATER COHERENCE", "AMBIENT FIELD VECTORS"].map(b => (
            <div key={b} style={{ border: `1px solid rgba(68,136,255,0.4)`, borderRadius: 2, padding: "3px 9px", fontSize: 8, letterSpacing: "0.2em", color: V.blue, fontFamily: V.mono, background: "rgba(68,136,255,0.05)" }}>{b}</div>
          ))}
        </div>
        <h1 style={{ margin: "0 0 6px", fontFamily: V.display, fontSize: "clamp(1.4rem,3.5vw,2.4rem)", color: "#fff", letterSpacing: 5, lineHeight: 1.2 }}>
          LUNAR AMBIENT FIELD
        </h1>
        <div style={{ fontFamily: V.mono, fontSize: "0.52rem", color: `${V.blue}88`, letterSpacing: 4, marginBottom: 16 }}>
          MOON-PHASE TIDE ENGINE · GROUNDWATER COHERENCE · ORGANIC TIME SCALE
        </div>
        <p style={{ maxWidth: 780, fontSize: "1.0rem", lineHeight: 1.9, color: `rgba(184,204,232,0.72)`, margin: 0 }}>
          Every ambient field — electromagnetic, acoustic, hydrological — follows the moon. The 29.53-day synodic cycle modulates a spring-neap envelope that rides the 12.42-hour M2 semi-diurnal tide. Below the surface, groundwater responds to both: the unconfined aquifer oscillates freely; the confined aquifer lags by hours, then rises. This is not folklore. These are measured, reproducible displacements of 5–30 cm in aquifer water tables, globally ubiquitous, and phase-locked to the moon.
        </p>
      </div>

      {/* ── Day slider / live toggle ── */}
      <div style={{ padding: "18px 32px", background: "rgba(4,10,22,0.6)", borderBottom: `1px solid rgba(255,255,255,0.04)`, display: "flex", alignItems: "center", gap: 20, flexWrap: "wrap" }}>
        <div style={{ fontFamily: V.mono, fontSize: "0.5rem", color: V.dim, letterSpacing: 3 }}>LUNAR DAY:</div>
        <button
          onClick={() => setDayIdx(-1)}
          style={{ padding: "5px 14px", borderRadius: 3, border: `1px solid ${dayIdx === -1 ? V.aurora : V.dim+"44"}`, background: dayIdx === -1 ? `${V.aurora}15` : "transparent", color: dayIdx === -1 ? V.aurora : V.dim, fontFamily: V.mono, fontSize: "0.5rem", cursor: "pointer", letterSpacing: 2 }}>
          ► LIVE
        </button>
        <input
          type="range" min={0} max={29} step={1}
          value={dayIdx >= 0 ? dayIdx : 0}
          onChange={e => setDayIdx(Number(e.target.value))}
          style={{ width: 220, accentColor: V.blue }}
        />
        {dayIdx >= 0 && (
          <div style={{ fontFamily: V.mono, fontSize: "0.5rem", color: V.blue }}>
            DAY {dayIdx}  ·  {PHASES[Math.floor(((dayIdx / 29.53) * 8) % 8)].emoji}  {PHASES[Math.floor(((dayIdx / 29.53) * 8) % 8)].name}
          </div>
        )}
        <div style={{ marginLeft: "auto", fontFamily: V.mono, fontSize: "0.44rem", color: V.dim, textAlign: "right" }}>
          SYNODIC MONTH: 29.53 DAYS  ·  M2 PERIOD: 12.42 H  ·  K1 PERIOD: 23.93 H
        </div>
      </div>

      {/* ── Canvas 1: Lunar Phase Field ── */}
      <div style={{ padding: "20px 24px 0" }}>
        <div style={{ background: "rgba(2,4,12,0.92)", border: `1px solid rgba(68,136,255,0.12)`, borderLeft: `3px solid ${V.blue}`, borderRadius: 10, overflow: "hidden" }}>
          <div style={{ padding: "10px 16px 6px", display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
            <div>
              <div style={{ fontFamily: V.mono, fontSize: 10, color: V.blue, letterSpacing: "0.14em" }}>AMBIENT FIELD VECTOR MAP · LUNAR PHASE ENGINE · SPRING-NEAP MODULATION</div>
              <div style={{ fontFamily: V.mono, fontSize: 9, color: `${V.blue}44`, marginTop: 3 }}>
                Field lines: aurora = spring tide max · blue = mid-cycle · dim = neap  ·  Orbit dot = current phase position
              </div>
            </div>
            <div style={{ fontFamily: V.mono, fontSize: "0.44rem", color: `${V.blue}44`, textAlign: "right", lineHeight: 1.8 }}>LIVE SIM<br />REAL-TIME</div>
          </div>
          <LunarPhaseFieldCanvas dayIdx={dayIdx} />
        </div>
      </div>

      {/* ── Canvas 2: Groundwater Tide ── */}
      <div style={{ padding: "16px 24px 0" }}>
        <div style={{ background: "rgba(2,4,12,0.92)", border: `1px solid rgba(0,140,255,0.12)`, borderLeft: `3px solid ${V.aurora}`, borderRadius: 10, overflow: "hidden" }}>
          <div style={{ padding: "10px 16px 6px", display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
            <div>
              <div style={{ fontFamily: V.mono, fontSize: 10, color: V.aurora, letterSpacing: "0.14em" }}>GROUNDWATER TIDE · EARTH CROSS-SECTION · UNCONFINED + CONFINED AQUIFER</div>
              <div style={{ fontFamily: V.mono, fontSize: 9, color: `${V.aurora}44`, marginTop: 3 }}>
                Water table oscillates with M2 period (12.42h) · Amplitude modulated by spring-neap cycle · Confined aquifer lags by phase offset
              </div>
            </div>
            <div style={{ fontFamily: V.mono, fontSize: "0.44rem", color: `${V.aurora}44`, textAlign: "right", lineHeight: 1.8 }}>CROSS-SECTION<br />−35m DEPTH</div>
          </div>
          <GroundwaterTideCanvas dayIdx={dayIdx} />
        </div>
      </div>

      <div style={{ maxWidth: 980, margin: "0 auto", padding: "48px 32px" }}>

        {/* ── Phase Calendar ── */}
        <Section title="1 · EIGHT-PHASE LUNAR CALENDAR · DAILY AMBIENT FIELD EFFECTS" accent={V.blue}>
          <p style={{ fontSize: "0.95rem", lineHeight: 1.9, color: `rgba(184,204,232,0.72)`, marginBottom: 22 }}>
            The lunar cycle divides cleanly into eight distinct field states. Each phase corresponds to a specific orientation of the Moon-Sun-Earth system, producing a measurable change in tidal force, electromagnetic field coherence, groundwater pressure, and biological activity. These are not metaphysical claims — they are the consequence of a 7.35 × 10²² kg mass orbiting at 384,400 km, exerting 2.2 × 10⁻⁵ m/s² gravitational acceleration differential across the Earth's diameter.
          </p>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 8 }}>
            {PHASES.map((ph, i) => {
              const isActive = activePhaseIdx === i;
              return (
                <div
                  key={ph.name}
                  onClick={() => setDayIdx(Math.round((i / 8) * 29))}
                  style={{
                    background: isActive ? `rgba(68,136,255,0.08)` : "rgba(4,10,20,0.8)",
                    border: `1px solid ${isActive ? V.blue + "55" : "rgba(68,136,255,0.1)"}`,
                    borderTop: `2px solid ${isActive ? V.blue : "rgba(68,136,255,0.15)"}`,
                    borderRadius: 8, padding: "14px 12px", cursor: "pointer",
                    transition: "border-color 0.2s",
                  }}>
                  <div style={{ fontSize: "1.6rem", marginBottom: 6 }}>{ph.emoji}</div>
                  <div style={{ fontFamily: V.mono, fontSize: "0.5rem", color: V.blue, letterSpacing: 2, marginBottom: 3 }}>{ph.name}</div>
                  <div style={{ fontFamily: V.mono, fontSize: "0.42rem", color: `${V.gold}77`, marginBottom: 8 }}>
                    DAY ≈{Math.round((i / 8) * 29.53)}  ·  SPRING {Math.round(ph.spring * 100)}%  ·  ILLUM {Math.round(ph.illum * 100)}%
                  </div>
                  <div style={{ fontSize: "0.76rem", lineHeight: 1.7, color: `rgba(184,204,232,0.6)`, marginBottom: 8 }}>{ph.field}</div>
                  <div style={{ fontFamily: V.mono, fontSize: "0.42rem", color: `rgba(0,200,255,0.55)`, lineHeight: 1.6 }}>GW: {ph.gw.substring(0, 70)}…</div>
                </div>
              );
            })}
          </div>
          <div style={{ marginTop: 10, fontFamily: V.mono, fontSize: "0.44rem", color: V.dim, textAlign: "center", letterSpacing: 2 }}>
            CLICK ANY PHASE TO LOCK SIMULATION TO THAT LUNAR DAY
          </div>
        </Section>

        <Divider />

        {/* ── Groundwater Physics ── */}
        <Section title="2 · GROUNDWATER TIDAL MECHANICS · M2 CONSTITUENT + SPRING-NEAP ENVELOPE" accent={V.aurora}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 28 }}>
            <div>
              <p style={{ fontSize: "0.95rem", lineHeight: 1.9, color: `rgba(184,204,232,0.72)`, marginBottom: 14 }}>
                Groundwater responds to two tidal forces simultaneously: the <strong style={{ color: V.aurora, fontWeight: 400 }}>solid Earth tide</strong> (the planet's crust itself rises and falls ≈ 20–30 cm with each M2 cycle, compressing and decompressing pore spaces) and the <strong style={{ color: V.blue, fontWeight: 400 }}>ocean tidal loading</strong> (the weight of ocean water shifting with the tides flexes the continental shelves). Both drive water-table oscillations measurable in wells worldwide — whether they are 50 km from the coast or 2,000 km inland.
              </p>
              <p style={{ fontSize: "0.95rem", lineHeight: 1.9, color: `rgba(184,204,232,0.72)` }}>
                The M2 semi-diurnal component (period: 12 hours 25.2 minutes) dominates in most latitudes, producing two high-water events per day in the water table. The spring-neap envelope (period: 14.77 days, half the synodic month) modulates the M2 amplitude: at spring tides (new + full moon), M2 amplitude can triple compared to neap tide minima. This is what gives groundwater its characteristically <em>organic</em> rhythm — a fast breath (12h M2) within a slow heartbeat (14.77d spring-neap) within a full cycle (29.53d synodic).
              </p>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {[
                { k:"M2 period",                 v:"12 h 25.2 min",            col:V.aurora,  note:"Dominant semi-diurnal. 2× per day high-water." },
                { k:"S2 period",                  v:"12 h 00.0 min",            col:V.blue,    note:"Solar semi-diurnal. Beats with M2 → spring-neap." },
                { k:"K1 period",                  v:"23 h 56 min",              col:V.gold,    note:"Lunisolar diurnal. Produces 1 high-water/day inequality." },
                { k:"Spring-neap period",          v:"14.77 days",               col:V.violet,  note:"Half synodic month. New+Full = spring; Quarters = neap." },
                { k:"Synodic month",               v:"29.53 days",               col:V.silver,  note:"New moon → new moon. Full spring-neap cycle × 2." },
                { k:"Unconfined aquifer ΔH",      v:"5 – 30 cm",                col:V.aurora,  note:"Free oscillation. Amplitude varies with porosity + K." },
                { k:"Confined aquifer ΔH",        v:"2 – 15 cm (phase lag)",    col:V.blue,    note:"Pore-pressure signal. Lag 1–8 h depending on storativity." },
                { k:"Solid Earth tide amplitude",  v:"≈ 20–30 cm (vertical)",    col:V.gold,    note:"Crust itself moves. Compresses pores → raises water table." },
                { k:"Detection threshold",         v:"< 1 mm (modern pressure)", col:V.green,   note:"High-resolution transducers resolve M2 in any well." },
              ].map(row => (
                <div key={row.k} style={{ background: `${row.col}06`, border: `1px solid ${row.col}18`, borderRadius: 7, padding: "10px 13px", display: "flex", gap: 12 }}>
                  <div style={{ minWidth: 140 }}>
                    <div style={{ fontFamily: V.mono, fontSize: "0.46rem", color: V.dim, marginBottom: 2 }}>{row.k}</div>
                    <div style={{ fontFamily: V.mono, fontSize: "0.58rem", color: row.col }}>{row.v}</div>
                  </div>
                  <div style={{ fontSize: "0.78rem", lineHeight: 1.6, color: `rgba(184,204,232,0.5)` }}>{row.note}</div>
                </div>
              ))}
            </div>
          </div>
        </Section>

        <Divider />

        {/* ── Ubiquitous Presence ── */}
        <Section title="3 · UBIQUITOUS PRESENCE · LUNAR ORIENTATION IN GROUNDWATER ACROSS ALL SCALES" accent={V.violet}>
          <p style={{ fontSize: "0.95rem", lineHeight: 1.9, color: `rgba(184,204,232,0.72)`, marginBottom: 22 }}>
            The lunar tidal signal in groundwater is not a coastal phenomenon — it is <strong style={{ color: V.violet, fontWeight: 400 }}>globally ubiquitous</strong>. It has been measured in wells in the Sahara, the Tibetan plateau, the Amazon basin, the Siberian permafrost fringe, and the interior of every continent. Anywhere there is porous rock + water + a measurement device sensitive to 1 cm, the moon's signature appears in the data, phase-locked, repeating without interruption for the life of the aquifer — which may be millions of years.
          </p>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 12, marginBottom: 24 }}>
            {[
              { icon:"🏔️", env:"HIGH ALTITUDE",  col:V.gold,
                body:"Mountain aquifer recharge zones respond directly to lunar tidal strain. Karst systems — limestone honeycombed with conduits — show the clearest M2 signal, sometimes with ΔH > 50 cm at spring tides. Glacial meltwater feeds are lunar-modulated via cryospheric strain." },
              { icon:"🌊", env:"COASTAL",         col:V.blue,
                body:"Ocean loading adds a second tidal signal on top of the solid Earth tide. Coastal aquifers oscillate with both M2 and the oceanic tidal envelope. Saltwater intrusion depth is directly governed by the spring-neap cycle — spring tides drive brackish water inland; neap tides allow freshwater wedge re-extension." },
              { icon:"🌾", env:"AGRICULTURAL",    col:V.green,
                body:"Crop root zones oscillate with the water table. Spring tides briefly elevate soil moisture in the capillary fringe. Irrigation well yields peak at new and full moon. Ancient agriculturalists who planted by the moon were optimizing for real capillary uplift — not myth." },
              { icon:"🌆", env:"URBAN",           col:V.violet,
                body:"City groundwater under impermeable pavement shows a muted but measurable lunar signal. Building foundations in waterlogged areas experience tidal pore pressure oscillation that drives micro-cracking. Long-term foundation design must account for ΔP cycles of 0.1–0.5 bar at M2 frequency." },
              { icon:"🔬", env:"DEEP SUBSURFACE", col:V.plasma,
                body:"In deep crystalline rock (>1 km), where no liquid water is expected, pore fluid pressures still show M2 tidal oscillations from elastic strain of the rock matrix itself. Deep mines measure it. Deep geothermal boreholes measure it. Even the mantle transition zone deforms tidally." },
              { icon:"🌿", env:"ECOSYSTEM",       col:V.aurora,
                body:"Riparian ecosystems (rivers + floodplains) pulse with lunar frequency. Wetland water tables rise toward new and full moon. Salmon runs, amphibian breeding, and aquatic insect emergence timing all correlate with spring tides at lunar precision. The biosphere breathes with the moon." },
            ].map(item => (
              <div key={item.env} style={{ background: `${item.col}06`, border: `1px solid ${item.col}18`, borderRadius: 9, padding: "16px 14px" }}>
                <div style={{ fontSize: "1.3rem", marginBottom: 8 }}>{item.icon}</div>
                <div style={{ fontFamily: V.mono, fontSize: "0.5rem", color: item.col, letterSpacing: 2, marginBottom: 8 }}>{item.env}</div>
                <div style={{ fontSize: "0.82rem", lineHeight: 1.75, color: `rgba(184,204,232,0.62)` }}>{item.body}</div>
              </div>
            ))}
          </div>
        </Section>

        <Divider />

        {/* ── Per-phase detail ── */}
        <Section title="4 · DAILY FIELD EFFECTS · PHASE-BY-PHASE GROUNDWATER + BIOLOGY" accent={V.gold}>
          <p style={{ fontSize: "0.95rem", lineHeight: 1.85, color: `rgba(184,204,232,0.72)`, marginBottom: 20 }}>
            The table below shows each of the eight major phases with its groundwater and biological field effects in detail. Use the slider above to lock the simulation to any day and observe the corresponding field state in the canvases.
          </p>
          <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
            {PHASES.map((ph, i) => {
              const isActive = activePhaseIdx === i;
              return (
                <div key={ph.name}
                  onClick={() => setDayIdx(Math.round((i / 8) * 29))}
                  style={{
                    display: "grid", gridTemplateColumns: "56px 120px 1fr 1fr 1fr",
                    gap: 0, borderRadius: 6, overflow: "hidden",
                    border: `1px solid ${isActive ? V.gold + "44" : "rgba(255,255,255,0.04)"}`,
                    cursor: "pointer", transition: "border-color 0.2s",
                  }}>
                  {/* Phase symbol */}
                  <div style={{ background: isActive ? "rgba(200,160,48,0.1)" : "rgba(4,10,20,0.9)", borderRight: `2px solid ${isActive ? V.gold + "44" : "rgba(255,255,255,0.04)"}`, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "14px 0", gap: 3 }}>
                    <div style={{ fontSize: "1.3rem" }}>{ph.emoji}</div>
                    <div style={{ fontFamily: V.mono, fontSize: "0.4rem", color: V.dim }}>DAY {Math.round((i / 8) * 29.53)}</div>
                  </div>
                  {/* Name + spring */}
                  <div style={{ background: "rgba(4,10,20,0.7)", borderRight: "1px solid rgba(255,255,255,0.04)", padding: "14px 12px", display: "flex", flexDirection: "column", justifyContent: "center", gap: 4 }}>
                    <div style={{ fontFamily: V.mono, fontSize: "0.48rem", color: V.blue, letterSpacing: 1 }}>{ph.name}</div>
                    <div style={{ fontFamily: V.mono, fontSize: "0.42rem", color: `${V.gold}77` }}>SPRING {Math.round(ph.spring * 100)}%</div>
                    <div style={{ fontFamily: V.mono, fontSize: "0.42rem", color: `${V.silver}55` }}>ILLUM {Math.round(ph.illum * 100)}%</div>
                  </div>
                  {/* Ambient field */}
                  <div style={{ background: "rgba(2,6,16,0.6)", borderRight: "1px solid rgba(255,255,255,0.03)", padding: "14px 14px" }}>
                    <div style={{ fontFamily: V.mono, fontSize: "0.4rem", color: `${V.blue}66`, letterSpacing: 2, marginBottom: 5 }}>AMBIENT FIELD</div>
                    <div style={{ fontFamily: V.serif, fontSize: "0.8rem", lineHeight: 1.7, color: `rgba(184,204,232,0.65)` }}>{ph.field}</div>
                  </div>
                  {/* Groundwater */}
                  <div style={{ background: "rgba(2,6,16,0.5)", borderRight: "1px solid rgba(255,255,255,0.03)", padding: "14px 14px" }}>
                    <div style={{ fontFamily: V.mono, fontSize: "0.4rem", color: `${V.aurora}55`, letterSpacing: 2, marginBottom: 5 }}>GROUNDWATER</div>
                    <div style={{ fontFamily: V.serif, fontSize: "0.8rem", lineHeight: 1.7, color: `rgba(184,204,232,0.6)` }}>{ph.gw}</div>
                  </div>
                  {/* Biology */}
                  <div style={{ background: "rgba(2,6,16,0.4)", padding: "14px 14px" }}>
                    <div style={{ fontFamily: V.mono, fontSize: "0.4rem", color: `${V.green}55`, letterSpacing: 2, marginBottom: 5 }}>BIOLOGY</div>
                    <div style={{ fontFamily: V.serif, fontSize: "0.8rem", lineHeight: 1.7, color: `rgba(184,204,232,0.55)` }}>{ph.biol}</div>
                  </div>
                </div>
              );
            })}
          </div>
        </Section>

        <Divider />

        {/* ── Closing ── */}
        <Section title="SYNTHESIS · THE MOON AS UBIQUITOUS FIELD ORGANIZER" accent={V.gold}>
          <div style={{ background: "rgba(0,255,178,0.02)", border: `1px solid rgba(0,255,178,0.1)`, borderRadius: 12, padding: "26px 30px" }}>
            <p style={{ fontSize: "1.05rem", fontStyle: "italic", lineHeight: 1.95, color: `rgba(200,216,240,0.8)`, marginBottom: 14 }}>
              The Moon does not merely pull the oceans. It pulls <strong style={{ color: V.aurora, fontWeight: 400 }}>everything</strong>: the solid crust, the water locked in rock pores 2 km underground, the ions in the soil, the sap in the cambium, the plasma in the ionosphere, and the electromagnetic cavity resonances of the entire biosphere. This pull arrives on an organic time scale — two tidal peaks per day, modulated by a 14.77-day spring-neap heartbeat, carried within a 29.53-day synodic cycle that itself nests within longer harmonics (18.6-year nodal, 8.85-year apsidal, 93-year Saros).
            </p>
            <p style={{ fontSize: "0.92rem", lineHeight: 1.9, color: `rgba(184,204,232,0.6)` }}>
              Every AETHER-grade building operating as a coherence engine must acknowledge this field. Groundwater under the foundation oscillates. The building's piezoelectric substrate (L0 granite or quartz) flexes with the solid Earth tide. The acoustic resonance chambers (L2) are re-tuned by the tidal change in air pressure and soil stiffness. The lunar field is not background noise — it is the <em>carrier wave</em> upon which the AETHER system rides.
            </p>
          </div>
        </Section>

      </div>
    </div>
  );
}
