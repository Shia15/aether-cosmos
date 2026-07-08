import { useCallback, useEffect, useRef, useState } from "react";

// ── Eye Evolution Stages ─────────────────────────────────────────────────
const STAGES = [
  {
    id: 0, mya: 600, era: "Ediacaran",
    name: "Photoreceptive Patch",
    organism: "Flatworm ancestor",
    cones: 1, rods: false, fovea: false, binocular: false,
    resolution: 0.01, fov: 180, depthPerception: false,
    spectrum: [[380, 500]], // UV-blue only
    mutation: "Opsins — light-sensitive proteins emerge in cell membranes. Simple G-protein cascade.",
    desc: "Scattered pigment cells detect light vs dark. No directional information. Simple on/off signalling. The very first step — a patch of cells expressing rhodopsin-like protein.",
    col: "#a78bfa",
  },
  {
    id: 1, mya: 540, era: "Cambrian",
    name: "Pit Eye (Eye Cup)",
    organism: "Early annelid / flatworm",
    cones: 1, rods: false, fovea: false, binocular: false,
    resolution: 0.05, fov: 120, depthPerception: false,
    spectrum: [[380, 550]],
    mutation: "Cell layer folds inward — cup morphogenesis. Shadow from pigment cup gives directional cue.",
    desc: "A cup-shaped depression of pigment cells surrounds photoreceptors. The shadow cast by the cup walls encodes light direction. First true directional vision — detects where light comes from.",
    col: "#60a5fa",
  },
  {
    id: 2, mya: 500, era: "Ordovician",
    name: "Pinhole Eye",
    organism: "Nautilus (living fossil)",
    cones: 1, rods: false, fovea: false, binocular: false,
    resolution: 0.1, fov: 300, depthPerception: false,
    spectrum: [[380, 580]],
    mutation: "Cup narrows to pinhole — aperture shrinks. Increased image resolution via diffraction limit.",
    desc: "The cup nearly closes, leaving only a pinhole aperture. Light rays are sorted by angle — a crude image forms on the retinal surface. No lens needed. Nautilus still uses this design today.",
    col: "#06b6d4",
  },
  {
    id: 3, mya: 450, era: "Ordovician-Silurian",
    name: "Primitive Lens",
    organism: "Early Polychaete",
    cones: 2, rods: false, fovea: false, binocular: false,
    resolution: 0.5, fov: 200, depthPerception: false,
    spectrum: [[360, 600]],
    mutation: "Crystallin proteins accumulate in pinhole. Transparent refractive body — first lens.",
    desc: "Transparent crystallin-protein cells fill the pinhole, refracting light to focus it. Dramatically better light gathering and resolution. The lens solves the brightness/resolution trade-off of the pinhole.",
    col: "#22c55e",
  },
  {
    id: 4, mya: 420, era: "Silurian-Devonian",
    name: "Spherical Fish Eye",
    organism: "Jawed fish (Gnathostomata)",
    cones: 4, rods: true, fovea: false, binocular: false,
    resolution: 5, fov: 340, depthPerception: false,
    spectrum: [[320, 700]], // UV + full visible
    mutation: "Lens becomes spherical for underwater optics. Four opsin genes — full tetrachromacy.",
    desc: "A spherical crystalline lens fills most of the eye globe — optimised for underwater where water and the cornea have similar refractive indices. Four cone types give tetrachromatic colour vision including UV. This eye design is 420 million years old and barely changed since.",
    col: "#4ade80",
  },
  {
    id: 5, mya: 300, era: "Carboniferous",
    name: "Reptile / Lizard Eye",
    organism: "Early Amniote / Lizard",
    cones: 4, rods: true, fovea: true, binocular: false,
    resolution: 20, fov: 320, depthPerception: false,
    spectrum: [[300, 700]],
    mutation: "Fovea develops. Oil droplet filters sharpen colour discrimination. Slit or round pupil.",
    desc: "The fovea — a depression of tightly-packed cones — emerges for high-acuity central vision. Oil droplets in cones sharpen spectral sensitivity. Many reptiles have UV vision. The diurnal lifestyle drives extreme colour sophistication.",
    col: "#f97316",
  },
  {
    id: 6, mya: 200, era: "Triassic",
    name: "Nocturnal Mammal Eye",
    organism: "Early Mammal (shrew-like)",
    cones: 2, rods: true, fovea: false, binocular: false,
    resolution: 8, fov: 310, depthPerception: false,
    spectrum: [[400, 650]], // lost UV + red channel
    mutation: "Nocturnal bottleneck — lost 2 cone types. Massive rod expansion. Tapetum lucidum.",
    desc: "165 million years of nocturnal living strips mammals down to 2 cone types (dichromacy). Rods massively expand for low-light sensitivity. The tapetum lucidum reflects unabsorbed light back through the retina — doubling sensitivity. A costly trade: colour vision is sacrificed for night survival.",
    col: "#c084fc",
  },
  {
    id: 7, mya: 50, era: "Eocene",
    name: "Primate / Human Eye",
    organism: "Homo sapiens",
    cones: 3, rods: true, fovea: true, binocular: true,
    resolution: 100, fov: 200, depthPerception: true,
    spectrum: [[380, 700]],
    mutation: "OPN1LW gene duplication restores trichromacy. Forward-facing eyes → binocular depth.",
    desc: "Trichromacy re-evolves via duplication of the OPN1LW gene on the X chromosome. Forward-facing eyes create ~120° binocular overlap — stereoscopic depth perception. The fovea packs ~180,000 cones/mm². 0.4 mm wide, it sees the world at 20/20. This eye is the culmination of 600 million years of evolution.",
    col: "#fbbf24",
  },
];

// ── Canvas drawing ─────────────────────────────────────────────────────────
function drawEye(canvas: HTMLCanvasElement, stage: typeof STAGES[0], t: number) {
  const ctx = canvas.getContext("2d")!;
  const W = canvas.width, H = canvas.height;
  const cx = W / 2, cy = H / 2;
  ctx.clearRect(0, 0, W, H);
  ctx.fillStyle = "rgb(2,8,18)";
  ctx.fillRect(0, 0, W, H);

  const id = stage.id;
  const pulse = 0.5 + 0.5 * Math.sin(t * 0.04);

  // ── Stage-specific eye anatomy ──────────────────────────────────────────
  if (id === 0) {
    // Photoreceptive patch — flat surface with receptor dots
    ctx.fillStyle = "rgba(100,60,20,0.6)";
    ctx.fillRect(cx - 80, cy - 8, 160, 18);
    for (let i = 0; i < 14; i++) {
      const x = cx - 65 + i * 10;
      ctx.beginPath(); ctx.arc(x, cy - 2, 4, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(167,139,250,${0.5 + 0.4 * Math.sin(t * 0.05 + i)})`;
      ctx.fill();
    }
    // Light arrows coming down
    for (let i = 0; i < 5; i++) {
      const x = cx - 60 + i * 30;
      ctx.strokeStyle = "rgba(255,255,180,0.5)";
      ctx.lineWidth = 1;
      ctx.beginPath(); ctx.moveTo(x, cy - 60); ctx.lineTo(x, cy - 12); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(x, cy - 12); ctx.lineTo(x - 4, cy - 20); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(x, cy - 12); ctx.lineTo(x + 4, cy - 20); ctx.stroke();
    }

  } else if (id === 1) {
    // Eye cup — U-shaped
    const r = 55;
    ctx.strokeStyle = "rgba(100,60,20,0.9)"; ctx.lineWidth = 10;
    ctx.beginPath(); ctx.arc(cx, cy, r, 0.2 * Math.PI, 0.8 * Math.PI, false); ctx.stroke();
    // receptors inside
    for (let a = 0.25; a < 0.75; a += 0.07) {
      const ax = cx + (r - 8) * Math.cos(a * Math.PI);
      const ay = cy + (r - 8) * Math.sin(a * Math.PI);
      ctx.beginPath(); ctx.arc(ax, ay, 3.5, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(96,165,250,${0.5 + 0.4 * Math.sin(t * 0.06 + a * 10)})`;
      ctx.fill();
    }
    // Light rays angled
    for (let i = -2; i <= 2; i++) {
      const ang = (i * 0.3);
      ctx.strokeStyle = "rgba(255,255,180,0.3)"; ctx.lineWidth = 1;
      ctx.beginPath(); ctx.moveTo(cx + i * 30, cy - 90);
      ctx.lineTo(cx + (r - 10) * Math.cos((0.5 + ang * 0.15) * Math.PI),
                 cy + (r - 10) * Math.sin((0.5 + ang * 0.15) * Math.PI));
      ctx.stroke();
    }

  } else if (id === 2) {
    // Pinhole eye — nearly closed circle
    const r = 60;
    ctx.strokeStyle = "rgba(100,60,20,0.9)"; ctx.lineWidth = 12;
    ctx.beginPath(); ctx.arc(cx, cy, r, 0, Math.PI * 2); ctx.stroke();
    // fill inside with dark
    ctx.fillStyle = "rgba(5,12,25,0.9)";
    ctx.beginPath(); ctx.arc(cx, cy, r - 7, 0, Math.PI * 2); ctx.fill();
    // pinhole at top
    ctx.fillStyle = "rgba(255,255,255,0.15)";
    ctx.fillRect(cx - 3, cy - r - 3, 6, 10);
    // light ray through pinhole
    ctx.strokeStyle = "rgba(255,255,180,0.6)"; ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(cx, cy - r - 30); ctx.lineTo(cx, cy - r + 3); ctx.stroke();
    // fan out inside
    for (let i = -2; i <= 2; i++) {
      ctx.strokeStyle = "rgba(255,255,180,0.15)"; ctx.lineWidth = 0.8;
      ctx.beginPath(); ctx.moveTo(cx, cy - r + 3); ctx.lineTo(cx + i * 20, cy + r - 10); ctx.stroke();
    }
    // retina
    for (let a = 0.1; a < 0.9; a += 0.06) {
      const ax = cx + (r - 10) * Math.cos(a * Math.PI * 2);
      const ay = cy + (r - 10) * Math.sin(a * Math.PI * 2);
      ctx.beginPath(); ctx.arc(ax, ay, 2.5, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(6,182,212,${0.3 + 0.3 * Math.sin(t * 0.05 + a * 15)})`;
      ctx.fill();
    }

  } else if (id === 3) {
    // Primitive lens — closed eye with refractive bulge
    const r = 58;
    ctx.strokeStyle = "rgba(120,80,30,0.9)"; ctx.lineWidth = 10;
    ctx.beginPath(); ctx.arc(cx, cy, r, 0, Math.PI * 2); ctx.stroke();
    ctx.fillStyle = "rgba(5,15,30,0.9)";
    ctx.beginPath(); ctx.arc(cx, cy, r - 6, 0, Math.PI * 2); ctx.fill();
    // Lens
    const g = ctx.createRadialGradient(cx, cy - r + 15, 2, cx, cy - r + 15, 18);
    g.addColorStop(0, "rgba(200,240,255,0.8)"); g.addColorStop(1, "rgba(100,200,255,0.1)");
    ctx.fillStyle = g;
    ctx.beginPath(); ctx.ellipse(cx, cy - r + 16, 12, 14, 0, 0, Math.PI * 2); ctx.fill();
    // light rays converging through lens
    for (let i = -2; i <= 2; i++) {
      ctx.strokeStyle = "rgba(255,255,180,0.35)"; ctx.lineWidth = 1;
      ctx.beginPath(); ctx.moveTo(cx + i * 25, cy - r - 25);
      ctx.lineTo(cx, cy - r + 20); ctx.lineTo(cx + i * 8, cy + r - 15); ctx.stroke();
    }
    // retina dots
    for (let a = 0.15; a < 0.85; a += 0.07) {
      const ax = cx + (r - 9) * Math.cos(a * Math.PI * 2);
      const ay = cy + (r - 9) * Math.sin(a * Math.PI * 2);
      ctx.beginPath(); ctx.arc(ax, ay, 2.5, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(34,197,94,${0.4 + 0.3 * Math.sin(t * 0.04 + a * 12)})`;
      ctx.fill();
    }

  } else if (id === 4) {
    // Spherical fish eye — large spherical lens
    const r = 65;
    ctx.strokeStyle = "rgba(30,100,50,0.8)"; ctx.lineWidth = 8;
    ctx.beginPath(); ctx.arc(cx, cy, r, 0, Math.PI * 2); ctx.stroke();
    ctx.fillStyle = "rgba(3,15,25,0.9)";
    ctx.beginPath(); ctx.arc(cx, cy, r - 5, 0, Math.PI * 2); ctx.fill();
    // Big spherical lens
    const lg = ctx.createRadialGradient(cx, cy, 0, cx, cy, 40);
    lg.addColorStop(0, "rgba(220,250,255,0.9)"); lg.addColorStop(0.6, "rgba(100,200,240,0.4)"); lg.addColorStop(1, "rgba(20,100,180,0.1)");
    ctx.fillStyle = lg;
    ctx.beginPath(); ctx.arc(cx, cy, 40, 0, Math.PI * 2); ctx.fill();
    ctx.strokeStyle = "rgba(100,200,240,0.4)"; ctx.lineWidth = 1;
    ctx.beginPath(); ctx.arc(cx, cy, 40, 0, Math.PI * 2); ctx.stroke();
    // Wide-angle light rays
    for (let i = -4; i <= 4; i++) {
      ctx.strokeStyle = "rgba(255,255,180,0.25)"; ctx.lineWidth = 0.8;
      ctx.beginPath(); ctx.moveTo(cx + i * 40, cy - r - 10);
      ctx.lineTo(cx, cy); ctx.stroke();
    }
    // retina — 4 color bands (tetrachromatic)
    const coneColors = ["#a78bfa","#3b82f6","#22c55e","#ef4444"];
    for (let a = 0; a < 1; a += 0.04) {
      const ci = Math.floor(a * 4) % 4;
      const ax = cx + (r - 8) * Math.cos(a * Math.PI * 2);
      const ay = cy + (r - 8) * Math.sin(a * Math.PI * 2);
      ctx.beginPath(); ctx.arc(ax, ay, 2.5, 0, Math.PI * 2);
      ctx.fillStyle = coneColors[ci] + "88"; ctx.fill();
    }
    // Optic nerve
    ctx.strokeStyle = "rgba(255,200,100,0.4)"; ctx.lineWidth = 6;
    ctx.beginPath(); ctx.moveTo(cx + r - 5, cy); ctx.lineTo(cx + r + 30, cy); ctx.stroke();

  } else if (id === 5) {
    // Reptile eye — slit pupil, oil droplets
    const r = 62;
    ctx.strokeStyle = "rgba(60,120,30,0.85)"; ctx.lineWidth = 8;
    ctx.beginPath(); ctx.arc(cx, cy, r, 0, Math.PI * 2); ctx.stroke();
    // iris
    const ig = ctx.createRadialGradient(cx, cy, 20, cx, cy, r - 6);
    ig.addColorStop(0, "rgba(2,8,15,1)"); ig.addColorStop(1, "rgba(40,80,20,0.8)");
    ctx.fillStyle = ig;
    ctx.beginPath(); ctx.arc(cx, cy, r - 5, 0, Math.PI * 2); ctx.fill();
    // lens
    const lg2 = ctx.createRadialGradient(cx, cy, 0, cx, cy, 22);
    lg2.addColorStop(0, "rgba(200,240,200,0.85)"); lg2.addColorStop(1, "rgba(80,160,80,0.1)");
    ctx.fillStyle = lg2;
    ctx.beginPath(); ctx.arc(cx, cy, 22, 0, Math.PI * 2); ctx.fill();
    // slit pupil
    ctx.fillStyle = "rgba(2,5,10,0.97)";
    ctx.beginPath(); ctx.ellipse(cx, cy, 4 + 2 * pulse, 20, 0, 0, Math.PI * 2); ctx.fill();
    // oil droplet cones on retina
    const oilCols = ["#a855f7","#3b82f6","#22c55e","#f97316","#ef4444"];
    for (let a = 0; a < 1; a += 0.035) {
      const ci = Math.floor(a * 5) % 5;
      const ax = cx + (r - 9) * Math.cos(a * Math.PI * 2);
      const ay = cy + (r - 9) * Math.sin(a * Math.PI * 2);
      ctx.beginPath(); ctx.arc(ax, ay, 2.5, 0, Math.PI * 2);
      ctx.fillStyle = oilCols[ci] + "99"; ctx.fill();
    }
    // fovea
    ctx.beginPath(); ctx.arc(cx, cy + r - 18, 8, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(255,200,50,${0.4 + 0.3 * pulse})`; ctx.fill();
    ctx.strokeStyle = "rgba(255,200,50,0.5)"; ctx.lineWidth = 1;
    ctx.stroke();
    ctx.fillStyle = "rgba(255,200,50,0.6)"; ctx.font = "7px monospace"; ctx.textAlign = "center";
    ctx.fillText("FOVEA", cx, cy + r - 8);

  } else if (id === 6) {
    // Mammal eye — large pupil, rods dominant
    const r = 62;
    ctx.strokeStyle = "rgba(60,30,80,0.85)"; ctx.lineWidth = 8;
    ctx.beginPath(); ctx.arc(cx, cy, r, 0, Math.PI * 2); ctx.stroke();
    // tapetum lucidum glow
    const tg = ctx.createRadialGradient(cx, cy, r - 20, cx, cy, r - 5);
    tg.addColorStop(0, "rgba(0,255,180,0.0)"); tg.addColorStop(1, `rgba(0,255,180,${0.15 + 0.1 * pulse})`);
    ctx.fillStyle = tg;
    ctx.beginPath(); ctx.arc(cx, cy, r - 5, 0, Math.PI * 2); ctx.fill();
    // dark interior
    ctx.fillStyle = "rgba(4,8,20,0.85)";
    ctx.beginPath(); ctx.arc(cx, cy, r - 14, 0, Math.PI * 2); ctx.fill();
    // lens
    const lg3 = ctx.createRadialGradient(cx, cy, 0, cx, cy, 24);
    lg3.addColorStop(0, "rgba(200,200,220,0.8)"); lg3.addColorStop(1, "rgba(80,80,120,0.1)");
    ctx.fillStyle = lg3;
    ctx.beginPath(); ctx.arc(cx, cy, 24, 0, Math.PI * 2); ctx.fill();
    // large round pupil
    const pupilR = 16 + 3 * pulse;
    ctx.fillStyle = "rgba(2,4,10,0.98)";
    ctx.beginPath(); ctx.arc(cx, cy, pupilR, 0, Math.PI * 2); ctx.fill();
    // rod-dominated retina (purple/dark)
    for (let a = 0; a < 1; a += 0.03) {
      const ax = cx + (r - 9) * Math.cos(a * Math.PI * 2);
      const ay = cy + (r - 9) * Math.sin(a * Math.PI * 2);
      ctx.beginPath(); ctx.arc(ax, ay, 2, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(180,130,255,${0.3 + 0.3 * Math.sin(t * 0.05 + a * 20)})`; ctx.fill();
    }
    // tapetum label
    ctx.fillStyle = "rgba(0,255,180,0.4)"; ctx.font = "7px monospace"; ctx.textAlign = "left";
    ctx.fillText("TAPETUM", cx + r - 45, cy - 8);

  } else {
    // Human eye — full complexity
    const r = 65;
    ctx.strokeStyle = "rgba(150,100,50,0.8)"; ctx.lineWidth = 8;
    ctx.beginPath(); ctx.arc(cx, cy, r, 0, Math.PI * 2); ctx.stroke();
    // vitreous
    ctx.fillStyle = "rgba(3,10,22,0.92)";
    ctx.beginPath(); ctx.arc(cx, cy, r - 5, 0, Math.PI * 2); ctx.fill();
    // cornea (front bulge)
    const cg = ctx.createRadialGradient(cx, cy - r + 8, 0, cx, cy - r + 8, 25);
    cg.addColorStop(0, "rgba(200,230,255,0.7)"); cg.addColorStop(1, "rgba(100,180,240,0.05)");
    ctx.fillStyle = cg;
    ctx.beginPath(); ctx.ellipse(cx, cy - r + 12, 20, 18, 0, 0, Math.PI * 2); ctx.fill();
    // iris
    ctx.beginPath(); ctx.arc(cx, cy - r + 15, 18, 0, Math.PI * 2);
    ctx.fillStyle = "rgba(60,80,140,0.7)"; ctx.fill();
    // pupil
    ctx.beginPath(); ctx.arc(cx, cy - r + 15, 8, 0, Math.PI * 2);
    ctx.fillStyle = "rgba(2,4,10,0.98)"; ctx.fill();
    // lens
    const lg4 = ctx.createRadialGradient(cx, cy - r + 28, 0, cx, cy - r + 28, 18);
    lg4.addColorStop(0, "rgba(200,220,240,0.85)"); lg4.addColorStop(1, "rgba(80,120,180,0.05)");
    ctx.fillStyle = lg4;
    ctx.beginPath(); ctx.ellipse(cx, cy - r + 30, 14, 12, 0, 0, Math.PI * 2); ctx.fill();
    // light rays through pupil → fovea
    for (let i = -2; i <= 2; i++) {
      ctx.strokeStyle = "rgba(255,255,180,0.2)"; ctx.lineWidth = 0.8;
      ctx.beginPath(); ctx.moveTo(cx + i * 12, cy - r - 20);
      ctx.lineTo(cx + i * 4, cy - r + 13);
      ctx.lineTo(cx, cy + r - 22); ctx.stroke();
    }
    // retina — 3-cone types
    const retCols = ["#3b82f6","#22c55e","#ef4444"];
    for (let a = 0.1; a < 0.9; a += 0.04) {
      const ci = Math.floor(a * 3) % 3;
      const ax = cx + (r - 9) * Math.cos(a * Math.PI * 2);
      const ay = cy + (r - 9) * Math.sin(a * Math.PI * 2);
      ctx.beginPath(); ctx.arc(ax, ay, 2.5, 0, Math.PI * 2);
      ctx.fillStyle = retCols[ci] + "88"; ctx.fill();
    }
    // fovea — bright spot
    const fovPulse = 0.6 + 0.3 * Math.sin(t * 0.06);
    ctx.beginPath(); ctx.arc(cx, cy + r - 20, 10, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(251,191,36,${fovPulse})`; ctx.fill();
    ctx.strokeStyle = "rgba(251,191,36,0.8)"; ctx.lineWidth = 1.5; ctx.stroke();
    ctx.fillStyle = "rgba(251,191,36,0.9)"; ctx.font = "7px monospace"; ctx.textAlign = "center";
    ctx.fillText("FOVEA", cx, cy + r - 8);
    // optic nerve
    ctx.strokeStyle = "rgba(200,150,80,0.5)"; ctx.lineWidth = 7;
    ctx.beginPath(); ctx.moveTo(cx + r - 6, cy + 15); ctx.lineTo(cx + r + 28, cy + 15); ctx.stroke();
    ctx.fillStyle = "rgba(200,150,80,0.4)"; ctx.font = "7px monospace";
    ctx.fillText("optic nerve", cx + r + 15, cy + 10);
    // binocular overlap arrows
    if (stage.binocular) {
      ctx.strokeStyle = `rgba(251,191,36,${0.2 + 0.15 * pulse})`; ctx.lineWidth = 1;
      ctx.beginPath(); ctx.moveTo(cx - r - 20, cy); ctx.lineTo(cx, cy - r + 15); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(cx + r + 20, cy); ctx.lineTo(cx, cy - r + 15); ctx.stroke();
    }
  }

  // ── Spectrum bar ────────────────────────────────────────────────────────
  const barY = H - 28, barX = 20, barW = W - 40, barH = 10;
  const specGrad = ctx.createLinearGradient(barX, 0, barX + barW, 0);
  specGrad.addColorStop(0,   "#7c3aed");
  specGrad.addColorStop(0.15,"#4f46e5");
  specGrad.addColorStop(0.3, "#2563eb");
  specGrad.addColorStop(0.5, "#16a34a");
  specGrad.addColorStop(0.7, "#ca8a04");
  specGrad.addColorStop(0.85,"#dc2626");
  specGrad.addColorStop(1,   "#7c2d12");
  ctx.fillStyle = "rgba(255,255,255,0.05)"; ctx.fillRect(barX - 2, barY - 2, barW + 4, barH + 4);
  ctx.fillStyle = specGrad; ctx.fillRect(barX, barY, barW, barH);

  // Visible range indicators
  const nm_min = stage.spectrum[0][0];
  const nm_max = stage.spectrum[0][1];
  const mapNm = (nm: number) => barX + ((nm - 280) / 500) * barW;
  ctx.strokeStyle = "#ffffff30"; ctx.lineWidth = 1;
  ctx.strokeRect(mapNm(nm_min), barY - 1, mapNm(nm_max) - mapNm(nm_min), barH + 2);
  ctx.fillStyle = "rgba(0,0,0,0.6)"; ctx.fillRect(barX, barY, mapNm(nm_min) - barX, barH);
  ctx.fillRect(mapNm(nm_max), barY, barX + barW - mapNm(nm_max), barH);
  ctx.fillStyle = "#ffffff60"; ctx.font = "7px monospace"; ctx.textAlign = "left";
  ctx.fillText(`${nm_min}nm`, mapNm(nm_min) + 2, barY + 8);
  ctx.fillText(`${nm_max}nm`, mapNm(nm_max) - 28, barY + 8);
  ctx.textAlign = "center"; ctx.fillStyle = "#ffffff30";
  ctx.fillText("VISIBLE SPECTRUM", barX + barW / 2, barY + barH + 12);

  // Stage label
  ctx.fillStyle = stage.col + "cc"; ctx.font = "bold 10px monospace"; ctx.textAlign = "left";
  ctx.fillText(`${stage.mya} MYA · ${stage.era}`, 14, 18);
}

// ── Main Page ─────────────────────────────────────────────────────────────
function EyeEvolutionCanvas() {
  const ref = useRef<HTMLCanvasElement>(null);
  const rafRef = useRef(0);
  useEffect(() => {
    const canvas = ref.current; if (!canvas) return;
    const ctx = canvas.getContext("2d")!;
    canvas.width = 900; canvas.height = 180;
    const W = canvas.width, H = canvas.height;
    const stages = [
      { cx: W * 0.1, r: 14, col: "#44aaff", label: "PATCH" },
      { cx: W * 0.28, r: 18, col: "#2ef0d8", label: "CUP" },
      { cx: W * 0.46, r: 22, col: "#c9a84c", label: "PINHOLE" },
      { cx: W * 0.64, r: 26, col: "#9966ff", label: "LENS" },
      { cx: W * 0.82, r: 30, col: "#ff4477", label: "FOVEA" },
    ];
    let t = 0;
    const draw = () => {
      ctx.clearRect(0, 0, W, H);
      ctx.fillStyle = "rgb(2,8,18)"; ctx.fillRect(0, 0, W, H);
      for (let i = 0; i < stages.length - 1; i++) {
        const a = stages[i], b = stages[i + 1];
        ctx.beginPath(); ctx.moveTo(a.cx, H / 2); ctx.lineTo(b.cx, H / 2);
        ctx.strokeStyle = "rgba(255,255,255,0.06)"; ctx.lineWidth = 1; ctx.stroke();
      }
      stages.forEach((s, i) => {
        const pls = 0.85 + 0.15 * Math.sin(t * 0.04 + i * 0.8);
        const rings = i + 1;
        for (let r = rings; r >= 1; r--) {
          ctx.beginPath(); ctx.arc(s.cx, H / 2, s.r * pls * (r / rings), 0, Math.PI * 2);
          ctx.strokeStyle = s.col + (r === rings ? "cc" : "33"); ctx.lineWidth = r === rings ? 1.5 : 0.8; ctx.stroke();
        }
        ctx.fillStyle = "#000"; ctx.beginPath(); ctx.arc(s.cx, H / 2, 5, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = s.col; ctx.font = "8px 'DM Mono',monospace"; ctx.textAlign = "center";
        ctx.fillText(s.label, s.cx, H / 2 + s.r + 14); ctx.textAlign = "left";
      });
      ctx.fillStyle = "rgba(68,170,255,0.3)"; ctx.font = "9px 'DM Mono',monospace";
      ctx.fillText("EYE EVOLUTION · 600 MILLION YEARS · PHOTORECEPTIVE PATCH → FOVEA · AETHER", 14, 14);
      t++; rafRef.current = requestAnimationFrame(draw);
    };
    draw();
    return () => cancelAnimationFrame(rafRef.current);
  }, []);
  return <canvas ref={ref} style={{ width: "100%", height: "auto", borderRadius: 8, display: "block" }} />;
}

export default function EyeEvolutionPage() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animRef   = useRef(0);
  const tRef      = useRef(0);
  const [stageIdx, setStageIdx] = useState(7);
  const [playing, setPlaying]   = useState(false);
  const [autoIdx, setAutoIdx]   = useState(0);

  const stageIdxRef = useRef(stageIdx);
  stageIdxRef.current = stageIdx;

  const tick = useCallback(() => {
    tRef.current++;
    const canvas = canvasRef.current;
    if (canvas) {
      canvas.width  = canvas.offsetWidth  || 440;
      canvas.height = canvas.offsetHeight || 440;
      drawEye(canvas, STAGES[stageIdxRef.current], tRef.current);
    }
    animRef.current = requestAnimationFrame(tick);
  }, []);

  useEffect(() => {
    animRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(animRef.current);
  }, [tick]);

  // Auto-play
  useEffect(() => {
    if (!playing) return;
    const int = setInterval(() => {
      setAutoIdx(i => {
        const next = (i + 1) % STAGES.length;
        setStageIdx(next);
        return next;
      });
    }, 3000);
    return () => clearInterval(int);
  }, [playing]);

  const stage = STAGES[stageIdx];

  const G = "#00ff88"; const BRD = "rgba(0,255,136,0.12)";
  const mono: React.CSSProperties = { fontFamily: "'Courier New', monospace" };

  return (
    <div style={{ height: "100%", display: "flex", flexDirection: "column", background: "rgb(2,8,18)", color: G, ...mono, overflow: "hidden", fontSize: 11 }}>
      {/* Header */}
      <div style={{ padding: "8px 16px", borderBottom: `1px solid ${BRD}`, flexShrink: 0, display: "flex", alignItems: "center", gap: 16 }}>
        <div>
          <span style={{ fontSize: 12, letterSpacing: 4, fontWeight: 700 }}>EYE EVOLUTION · 600 MILLION YEARS</span>
          <span style={{ fontSize: 8, opacity: 0.4, marginLeft: 16 }}>photoreceptive patch → pinhole → lens → fovea → human</span>
        </div>
        <div style={{ marginLeft: "auto", display: "flex", gap: 12, alignItems: "center" }}>
          <span style={{ color: stage.col, fontWeight: 700, letterSpacing: 3, fontSize: 10 }}>{stage.name.toUpperCase()}</span>
          <button onClick={() => setPlaying(p => !p)}
            style={{ background: "rgba(0,255,136,0.08)", border: `1px solid rgba(0,255,136,0.3)`, color: G, borderRadius: 4, padding: "2px 12px", cursor: "pointer", fontSize: 9 }}>
            {playing ? "⏸ PAUSE" : "▶ AUTOPLAY"}
          </button>
        </div>
      </div>

      {/* Timeline strip */}
      <div style={{ display: "flex", padding: "6px 12px", borderBottom: `1px solid ${BRD}`, gap: 4, flexShrink: 0, overflowX: "auto" }}>
        {STAGES.map((s, i) => (
          <button key={i} onClick={() => { setStageIdx(i); setPlaying(false); }}
            style={{ flex: "0 0 auto", padding: "4px 10px", borderRadius: 6, border: `1px solid ${stageIdx === i ? s.col : "rgba(255,255,255,0.08)"}`,
              background: stageIdx === i ? s.col + "18" : "transparent",
              color: stageIdx === i ? s.col : "rgba(255,255,255,0.3)", cursor: "pointer", fontSize: 8, textAlign: "center", transition: "all 0.2s" }}>
            <div style={{ letterSpacing: 1, fontWeight: stageIdx === i ? 700 : 400 }}>{s.name}</div>
            <div style={{ opacity: 0.5, fontSize: 7 }}>{s.mya} Mya</div>
          </button>
        ))}
      </div>

      {/* Main split */}
      <div style={{ flex: 1, display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, padding: 8, minHeight: 0 }}>

        {/* LEFT — canvas */}
        <div style={{ border: `1px solid ${stage.col}30`, borderRadius: 8, display: "flex", flexDirection: "column", overflow: "hidden" }}>
          <div style={{ padding: "5px 10px", fontSize: 8, letterSpacing: 3, color: stage.col, opacity: 0.8, borderBottom: `1px solid ${stage.col}20` }}>
            ◎ EYE CROSS-SECTION · {stage.organism.toUpperCase()}
          </div>
          <canvas ref={canvasRef} style={{ flex: 1, width: "100%", height: "100%", display: "block" }} />
        </div>

        {/* RIGHT — info */}
        <div style={{ display: "flex", flexDirection: "column", gap: 8, overflow: "auto" }}>

          {/* Stage header */}
          <div style={{ border: `1px solid ${stage.col}30`, borderRadius: 8, padding: "10px 14px" }}>
            <div style={{ fontSize: 15, fontWeight: 700, color: stage.col, letterSpacing: 3, marginBottom: 4 }}>{stage.name.toUpperCase()}</div>
            <div style={{ fontSize: 8, opacity: 0.5, marginBottom: 8 }}>{stage.mya} million years ago · {stage.era} period · {stage.organism}</div>
            <div style={{ fontSize: 9, opacity: 0.65, lineHeight: 1.7 }}>{stage.desc}</div>
          </div>

          {/* Key mutation */}
          <div style={{ border: "1px solid rgba(251,191,36,0.25)", borderRadius: 8, padding: "8px 12px" }}>
            <div style={{ fontSize: 7, letterSpacing: 2, color: "#fbbf24", marginBottom: 4 }}>⚡ KEY MUTATION / ADAPTATION</div>
            <div style={{ fontSize: 9, color: "#fbbf24aa", lineHeight: 1.6 }}>{stage.mutation}</div>
          </div>

          {/* Stats grid */}
          <div style={{ border: `1px solid rgba(0,255,136,0.15)`, borderRadius: 8, padding: "8px 12px" }}>
            <div style={{ fontSize: 7, letterSpacing: 2, opacity: 0.5, marginBottom: 6 }}>VISION PARAMETERS</div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "4px 12px" }}>
              {[
                { label:"Cone Types",     val:`${stage.cones}`,                      col: stage.cones >= 3 ? "#22c55e" : stage.cones === 2 ? "#fbbf24" : "#ef4444" },
                { label:"Rod Vision",     val: stage.rods ? "YES" : "NO",            col: stage.rods ? "#c084fc" : "#ffffff30" },
                { label:"Fovea",          val: stage.fovea ? "YES" : "NO",           col: stage.fovea ? "#fbbf24" : "#ffffff30" },
                { label:"Binocular",      val: stage.binocular ? "YES" : "NO",       col: stage.binocular ? "#06b6d4" : "#ffffff30" },
                { label:"Resolution",     val: `${stage.resolution}× relative`,      col: "#60a5fa" },
                { label:"Field of View",  val: `${stage.fov}°`,                      col: "#34d399" },
                { label:"Depth Percep.",  val: stage.depthPerception ? "YES" : "NO", col: stage.depthPerception ? "#fbbf24" : "#ffffff30" },
                { label:"Spectral Range", val: `${stage.spectrum[0][0]}–${stage.spectrum[0][1]}nm`, col: "#f97316" },
              ].map(row => (
                <div key={row.label} style={{ display: "flex", justifyContent: "space-between", fontSize: 8, borderBottom: "1px solid rgba(255,255,255,0.04)", paddingBottom: 2 }}>
                  <span style={{ opacity: 0.4 }}>{row.label}</span>
                  <span style={{ color: row.col, fontWeight: 700 }}>{row.val}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Evolution chain */}
          <div style={{ border: "1px solid rgba(255,255,255,0.06)", borderRadius: 8, padding: "8px 12px" }}>
            <div style={{ fontSize: 7, letterSpacing: 2, opacity: 0.4, marginBottom: 6 }}>COHERENCE GAIN PER MUTATION</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
              {STAGES.map((s, i) => (
                <div key={i} style={{ display: "flex", alignItems: "center", gap: 6, opacity: i <= stageIdx ? 1 : 0.2 }}>
                  <div style={{ width: 5, height: 5, borderRadius: "50%", background: i === stageIdx ? s.col : s.col + "50", flexShrink: 0 }} />
                  <div style={{ fontSize: 7, color: i === stageIdx ? s.col : "#ffffff40", flex: 1 }}>{s.name}</div>
                  <div style={{ height: 3, width: 60, background: "rgba(255,255,255,0.06)", borderRadius: 2 }}>
                    <div style={{ height: "100%", width: `${(i / (STAGES.length - 1)) * 100}%`, background: s.col, borderRadius: 2 }} />
                  </div>
                  <div style={{ fontSize: 6, color: s.col + "80", minWidth: 30, textAlign: "right" }}>{s.mya}Ma</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Footer theory */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", borderTop: `1px solid ${BRD}`, flexShrink: 0 }}>
        {[
          { title:"CONVERGENT EVOLUTION", col:"#60a5fa", body:"Eyes evolved independently ~40–65 times across animal groups. Molluscs, arthropods, vertebrates all arrived at similar solutions via different genetic routes. The optimum is universal — the path is not." },
          { title:"OPSIN GENE FAMILY", col:"#22c55e", body:"All eyes use opsin proteins. The vertebrate lineage carries OPN1SW (blue), OPN1MW (green), OPN1LW (red). Mammals lost two opsins 200 Mya — humans re-evolved trichromacy via X-chromosome duplication of OPN1LW." },
          { title:"THE FOVEA PARADOX", col:"#fbbf24", body:"The human fovea is wired backward — photoreceptors point away from incoming light, away from blood vessels that would scatter it. A blind spot compensates. The brain fills the gap. Imperfect design, extraordinary outcome." },
        ].map((t, i) => (
          <div key={t.title} style={{ padding: "6px 12px", borderLeft: i > 0 ? `1px solid ${BRD}` : "none" }}>
            <div style={{ fontSize: 7, letterSpacing: 2, color: t.col, opacity: 0.8, marginBottom: 2 }}>{t.title}</div>
            <div style={{ fontSize: 7, opacity: 0.3, lineHeight: 1.5 }}>{t.body}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
