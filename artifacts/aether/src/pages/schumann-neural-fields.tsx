/*═══════════════════════════════════════════════════════════════
  Schumann Resonance · Neural Entrainment · Three-Field Manipulation
  Three decoupled coherent 2D spherical bubble networks
  Cellular dehydration forces · Derivative-based perceptual expansion

  Three canvases:
  I.  Three Bubble Networks — 3 decoupled coherent spherical bubbles
      each carrying its own internal node network (7.83 · 14.3 · 20.8 Hz)
  II. Cellular Dehydration Forces — osmotic pressure acts on bubble
      membrane, water expelled, coherence changes
  III.Three-Field Manipulation — overlapping gradient fields,
      dC/dx derivative arrows, perceptual expansion zones
═══════════════════════════════════════════════════════════════*/
import { useRef, useEffect } from "react";
const omniFlow = "/api/storage/public-objects/72D555D1-E91E-4B74-A73B-4628B8538AA1_1784561445345.png";
const magStorm = "/api/storage/public-objects/A6805E91-9684-4C59-BFC8-482EF421381D_1784561445345.png";
const skyrmion = "/api/storage/public-objects/IMG_4534_1784561445345.png";
const BG    = "#020508";
const PANEL = "#060a0f";
const IVORY = "#edf2f8";
const DIM   = "rgba(237,242,248,0.54)";
const MUTED = "rgba(237,242,248,0.28)";
const LINE  = "rgba(100,160,255,0.09)";
const GOLD  = "#f5c84c";
const AMBER = "#fb923c";
const CYAN  = "#22d3ee";
const BLUE  = "#60a5fa";
const VIOLET= "#a78bfa";
const GREEN = "#4ade80";
const ROSE  = "#fb7185";
const TEAL  = "#2dd4bf";
const WHITE = "#e8f0ff";
const SILVER= "#94a3b8";

// Schumann mode definitions
const MODES = [
  { f: 7.83,  label: "f₁",  col: GOLD,   name: "Delta-Theta",  hz: "7.83 Hz",  brain: "deep sleep · intuition" },
  { f: 14.3,  label: "f₂",  col: CYAN,   name: "Alpha-Beta",   hz: "14.3 Hz",  brain: "relaxed focus · flow" },
  { f: 20.8,  label: "f₃",  col: VIOLET, name: "Beta-Gamma",   hz: "20.8 Hz",  brain: "active cognition" },
];

function Tag({ t, c = BLUE }: { t: string; c?: string }) {
  return <div style={{ fontSize: 9, fontWeight: 700, color: c, letterSpacing: 2, textTransform: "uppercase" as const, marginBottom: 10 }}>{t}</div>;
}
function Divider() { return <div style={{ height: 1, background: LINE, margin: "44px 0" }} />; }

/* ══════════════════════════════════════════════════════════
   CANVAS I — Three Decoupled Coherent Bubble Networks
   Each bubble = 2D spherical oscillating membrane
   Inside each: node network (small dots connected by threads)
   Bubbles breathe at their Schumann frequency (simulated)
   Decoupled: each moves independently
   Coherent: each phase-locks to its own base frequency
══════════════════════════════════════════════════════════ */
function ThreeBubblesCanvas() {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const cv = ref.current; if (!cv) return;
    const ctx = cv.getContext("2d")!;
    let raf = 0, t = 0;
    const ro = new ResizeObserver(() => { cv.width = cv.offsetWidth; cv.height = cv.offsetHeight; });
    ro.observe(cv); cv.width = cv.offsetWidth; cv.height = cv.offsetHeight;

    // Each bubble has its own node network (seeded deterministically)
    type BubbleNode = { ax: number; ay: number }; // polar offsets, fraction of R
    const bubbleNodes: BubbleNode[][] = [[], [], []];
    const NODE_COUNT = 9;
    for (let b = 0; b < 3; b++) {
      for (let n = 0; n < NODE_COUNT; n++) {
        const ang = (n / NODE_COUNT) * Math.PI * 2 + b * 0.7;
        const r = 0.25 + 0.35 * ((n * 7 + b * 3) % 10) / 10;
        bubbleNodes[b].push({ ax: r * Math.cos(ang), ay: r * Math.sin(ang) });
      }
    }

    // Decoupled drift: each bubble has a slow wandering position offset
    const drift = [
      { x: 0, y: 0, vx: 0.18, vy: 0.12 },
      { x: 0, y: 0, vx: -0.14, vy: 0.17 },
      { x: 0, y: 0, vx: 0.11, vy: -0.15 },
    ];

    function draw() {
      const W = cv.width, H = cv.height;
      ctx.clearRect(0, 0, W, H);
      ctx.fillStyle = BG; ctx.fillRect(0, 0, W, H);

      // Base positions of three bubble centres
      const BASE = [
        { x: W * 0.22, y: H * 0.5 },
        { x: W * 0.50, y: H * 0.5 },
        { x: W * 0.78, y: H * 0.5 },
      ];
      const BASE_R = Math.min(W, H) * 0.16;
      const FREQS = [7.83, 14.3, 20.8];
      const COLS  = [GOLD, CYAN, VIOLET];

      MODES.forEach((mode, bi) => {
        // Drift position
        drift[bi].x += drift[bi].vx * 0.04;
        drift[bi].y += drift[bi].vy * 0.04;
        if (Math.abs(drift[bi].x) > 12) drift[bi].vx *= -1;
        if (Math.abs(drift[bi].y) > 8)  drift[bi].vy *= -1;

        const cx = BASE[bi].x + drift[bi].x;
        const cy = BASE[bi].y + drift[bi].y;
        const col = COLS[bi];
        const freq = FREQS[bi];

        // Bubble radius — breathing at Schumann frequency (time-scaled)
        const breathPhase = t * 0.015 * (freq / 7.83);
        const breathAmp   = BASE_R * 0.07;
        const R = BASE_R + breathAmp * Math.sin(breathPhase);

        // Outer glow
        const outerGlow = ctx.createRadialGradient(cx, cy, R * 0.7, cx, cy, R * 1.5);
        outerGlow.addColorStop(0, col + "18"); outerGlow.addColorStop(1, col + "00");
        ctx.fillStyle = outerGlow; ctx.beginPath(); ctx.arc(cx, cy, R * 1.5, 0, Math.PI * 2); ctx.fill();

        // Spherical membrane — draw as layered circle
        // Inner fill (very dark)
        const innerFill = ctx.createRadialGradient(cx - R * 0.25, cy - R * 0.25, 0, cx, cy, R);
        innerFill.addColorStop(0, col + "0a"); innerFill.addColorStop(1, col + "04");
        ctx.fillStyle = innerFill; ctx.beginPath(); ctx.arc(cx, cy, R, 0, Math.PI * 2); ctx.fill();

        // Membrane surface — pulsing stroke with highlights
        ctx.strokeStyle = col + "cc"; ctx.lineWidth = 1.8;
        ctx.beginPath(); ctx.arc(cx, cy, R, 0, Math.PI * 2); ctx.stroke();
        // Specular highlight
        ctx.strokeStyle = WHITE + "55"; ctx.lineWidth = 1;
        ctx.beginPath(); ctx.arc(cx - R * 0.18, cy - R * 0.22, R * 0.3, Math.PI * 1.1, Math.PI * 1.9); ctx.stroke();

        // Inner node network
        const nodes = bubbleNodes[bi];
        const worldNodes = nodes.map(n => ({
          x: cx + n.ax * R,
          y: cy + n.ay * R,
        }));

        // Threads between nodes (within bubble)
        for (let i = 0; i < nodes.length; i++) {
          for (let j = i + 1; j < nodes.length; j++) {
            const d = Math.hypot(worldNodes[j].x - worldNodes[i].x, worldNodes[j].y - worldNodes[i].y);
            if (d < R * 0.75) {
              const pulse = 0.4 + 0.35 * Math.sin(t * 0.02 * (freq / 7.83) + i + j);
              ctx.strokeStyle = col + Math.round(pulse * 80).toString(16).padStart(2, "0");
              ctx.lineWidth = 0.8;
              ctx.beginPath(); ctx.moveTo(worldNodes[i].x, worldNodes[i].y); ctx.lineTo(worldNodes[j].x, worldNodes[j].y); ctx.stroke();
            }
          }
        }

        // Node dots
        worldNodes.forEach((nd, ni) => {
          const nodePulse = 0.5 + 0.5 * Math.sin(t * 0.025 * (freq / 7.83) + ni * 0.9);
          ctx.fillStyle = col + Math.round(160 + nodePulse * 95).toString(16).padStart(2, "0");
          ctx.beginPath(); ctx.arc(nd.x, nd.y, 2.5 + nodePulse * 1.5, 0, Math.PI * 2); ctx.fill();
        });

        // Centre dot
        ctx.fillStyle = col;
        ctx.beginPath(); ctx.arc(cx, cy, 3.5, 0, Math.PI * 2); ctx.fill();

        // Labels
        ctx.fillStyle = col; ctx.font = "bold 10px monospace"; ctx.textAlign = "center";
        ctx.fillText(mode.label + " · " + mode.hz, cx, cy + R + 18);
        ctx.fillStyle = col + "88"; ctx.font = "7px monospace";
        ctx.fillText(mode.name, cx, cy + R + 30);
        ctx.fillText(mode.brain, cx, cy + R + 40);

        // Frequency readout
        const freqAnim = (freq + 0.15 * Math.sin(t * 0.01)).toFixed(2);
        ctx.fillStyle = col + "66"; ctx.font = "8px monospace";
        ctx.fillText(freqAnim + " Hz", cx, cy - R - 10);
      });

      // Coherence bridge: thin arcs connecting the three bubble centres
      for (let i = 0; i < 3; i++) {
        const a = BASE[i], b2 = BASE[(i + 1) % 3];
        const bridgePulse = 0.15 + 0.12 * Math.sin(t * 0.02 + i * 2);
        ctx.strokeStyle = `rgba(245,200,76,${bridgePulse})`; ctx.lineWidth = 1; ctx.setLineDash([3, 8]);
        ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b2.x, b2.y); ctx.stroke();
        ctx.setLineDash([]);
      }

      ctx.fillStyle = GOLD + "88"; ctx.font = "bold 9px monospace"; ctx.textAlign = "center";
      ctx.fillText("THREE DECOUPLED · COHERENT · 2D SPHERICAL BUBBLE NETWORKS · SCHUMANN MODES f₁ f₂ f₃", W * 0.5, H - 8);

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
   CANVAS II — Cellular Dehydration Forces on Bubble
   Central spherical bubble (cell membrane)
   Water molecules (small blue dots) expelled outward
   Osmotic force arrows pointing inward
   Interior: concentrated ions (gold dots) increasing as cell shrinks
   Three Schumann wave rings visible around bubble
══════════════════════════════════════════════════════════ */
function DehydrationCanvas() {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const cv = ref.current; if (!cv) return;
    const ctx = cv.getContext("2d")!;
    let raf = 0, t = 0;
    const ro = new ResizeObserver(() => { cv.width = cv.offsetWidth; cv.height = cv.offsetHeight; });
    ro.observe(cv); cv.width = cv.offsetWidth; cv.height = cv.offsetHeight;

    // Water molecules: [x, y, vx, vy, alpha]
    type WMol = { x: number; y: number; vx: number; vy: number; alpha: number; born: number };
    const waterMols: WMol[] = [];

    // Interior ions
    type Ion = { ax: number; ay: number };
    const ions: Ion[] = [];
    for (let i = 0; i < 18; i++) {
      const ang = (i / 18) * Math.PI * 2;
      const r = 0.1 + (i % 4) * 0.12;
      ions.push({ ax: r * Math.cos(ang), ay: r * Math.sin(ang) });
    }

    function draw() {
      const W = cv.width, H = cv.height;
      ctx.clearRect(0, 0, W, H);
      ctx.fillStyle = BG; ctx.fillRect(0, 0, W, H);

      const cx = W * 0.5, cy = H * 0.5;
      // Dehydration cycle: bubble slowly shrinks then resets
      const cycle = (t * 0.006) % 1;
      const dehydFrac = Math.sin(cycle * Math.PI); // 0 → max → 0
      const R = (Math.min(W, H) * 0.22) * (1 - dehydFrac * 0.22);

      // Schumann resonance rings (three frequencies) around bubble
      MODES.forEach((mode, mi) => {
        const ringPhase = t * 0.012 * (mode.f / 7.83) + mi * 0.8;
        for (let ring = 0; ring < 3; ring++) {
          const rp = (ringPhase - ring * 0.4) % 1;
          if (rp < 0 || rp > 1) return;
          const ringR = R + rp * (Math.min(W, H) * 0.28);
          const a = (1 - rp) * 0.18;
          ctx.strokeStyle = mode.col + Math.round(a * 255).toString(16).padStart(2, "0");
          ctx.lineWidth = 1;
          ctx.beginPath(); ctx.arc(cx, cy, ringR, 0, Math.PI * 2); ctx.stroke();
        }
      });

      // Osmotic force arrows (6 inward, distributed around bubble)
      const N_ARROWS = 12;
      for (let i = 0; i < N_ARROWS; i++) {
        const ang = (i / N_ARROWS) * Math.PI * 2;
        const outerR = R + 44, innerR = R + 12;
        const ax2 = cx + outerR * Math.cos(ang), ay2 = cy + outerR * Math.sin(ang);
        const bx = cx + innerR * Math.cos(ang), by2 = cy + innerR * Math.sin(ang);
        const arrowAlpha = 0.4 + 0.3 * dehydFrac;
        ctx.strokeStyle = `rgba(251,145,60,${arrowAlpha})`; ctx.lineWidth = 1.5;
        ctx.beginPath(); ctx.moveTo(ax2, ay2); ctx.lineTo(bx, by2); ctx.stroke();
        // Arrowhead pointing inward
        const dxA = bx - ax2, dyA = by2 - ay2;
        const len = Math.hypot(dxA, dyA);
        const ux = dxA / len, uy = dyA / len;
        ctx.beginPath();
        ctx.moveTo(bx, by2);
        ctx.lineTo(bx - ux * 6 - uy * 4, by2 - uy * 6 + ux * 4);
        ctx.lineTo(bx - ux * 6 + uy * 4, by2 - uy * 6 - ux * 4);
        ctx.closePath(); ctx.fillStyle = AMBER + Math.round(arrowAlpha * 255).toString(16).padStart(2, "0");
        ctx.fill();
      }
      ctx.fillStyle = AMBER + "88"; ctx.font = "7px monospace"; ctx.textAlign = "center";
      ctx.fillText("π_osm · osmotic pressure", cx, cy - R - 52);

      // Spawn water molecules being expelled
      if (t % 5 === 0 && waterMols.length < 60) {
        const ang = Math.random() * Math.PI * 2;
        const vr = 0.6 + Math.random() * 0.6;
        waterMols.push({ x: cx + (R - 4) * Math.cos(ang), y: cy + (R - 4) * Math.sin(ang),
          vx: Math.cos(ang) * vr, vy: Math.sin(ang) * vr, alpha: 0.9, born: t });
      }

      // Draw water molecules
      for (let i = waterMols.length - 1; i >= 0; i--) {
        const wm = waterMols[i];
        wm.x += wm.vx; wm.y += wm.vy; wm.alpha -= 0.008;
        ctx.fillStyle = CYAN + Math.round(wm.alpha * 220).toString(16).padStart(2, "0");
        ctx.beginPath(); ctx.arc(wm.x, wm.y, 2.2, 0, Math.PI * 2); ctx.fill();
        if (wm.alpha <= 0) waterMols.splice(i, 1);
      }

      // Outer glow
      const glow = ctx.createRadialGradient(cx, cy, R * 0.5, cx, cy, R * 1.6);
      glow.addColorStop(0, BLUE + "10"); glow.addColorStop(1, BLUE + "00");
      ctx.fillStyle = glow; ctx.beginPath(); ctx.arc(cx, cy, R * 1.6, 0, Math.PI * 2); ctx.fill();

      // Bubble membrane
      const memG = ctx.createRadialGradient(cx - R * 0.2, cy - R * 0.2, 0, cx, cy, R);
      memG.addColorStop(0, "rgba(10,20,40,0.9)"); memG.addColorStop(1, "rgba(5,10,25,0.95)");
      ctx.fillStyle = memG; ctx.beginPath(); ctx.arc(cx, cy, R, 0, Math.PI * 2); ctx.fill();
      ctx.strokeStyle = BLUE + "cc"; ctx.lineWidth = 2;
      ctx.beginPath(); ctx.arc(cx, cy, R, 0, Math.PI * 2); ctx.stroke();
      // Specular
      ctx.strokeStyle = WHITE + "40"; ctx.lineWidth = 1;
      ctx.beginPath(); ctx.arc(cx - R * 0.2, cy - R * 0.25, R * 0.28, Math.PI * 1.1, Math.PI * 1.85); ctx.stroke();

      // Interior ions (concentrated, more visible when dehydrated)
      ions.forEach((ion, idx) => {
        const ix = cx + ion.ax * R * 0.85;
        const iy = cy + ion.ay * R * 0.85;
        const ionPulse = 0.6 + 0.4 * Math.sin(t * 0.03 + idx);
        const ionAlpha = 0.4 + dehydFrac * 0.5;
        ctx.fillStyle = GOLD + Math.round(ionAlpha * 220).toString(16).padStart(2, "0");
        ctx.beginPath(); ctx.arc(ix, iy, 1.8 + ionPulse, 0, Math.PI * 2); ctx.fill();
      });

      // Centre label
      ctx.fillStyle = BLUE; ctx.font = "bold 8px monospace"; ctx.textAlign = "center";
      ctx.fillText("SPHERICAL", cx, cy - 5);
      ctx.fillText("BUBBLE", cx, cy + 7);
      ctx.fillStyle = BLUE + "88"; ctx.font = "7px monospace";
      const concLabel = (1 + dehydFrac * 2.5).toFixed(2) + "× conc.";
      ctx.fillText(concLabel, cx, cy + 20);

      // Dehydration state label
      const dehydPct = Math.round(dehydFrac * 100);
      ctx.fillStyle = dehydPct > 50 ? ROSE : GREEN; ctx.font = "bold 8px monospace"; ctx.textAlign = "center";
      ctx.fillText(`DEHYDRATION ${dehydPct}%`, cx, R > 0 ? cy + R + 18 : cy + 80);
      ctx.fillStyle = AMBER + "88"; ctx.font = "7px monospace";
      ctx.fillText("water expelled →", cx, cy + R + 30);

      // Legend
      ctx.fillStyle = CYAN + "88"; ctx.font = "7px monospace"; ctx.textAlign = "left";
      ctx.fillText("● water molecules expelled", 8, H - 34);
      ctx.fillStyle = GOLD + "88"; ctx.fillText("● ions (concentrated interior)", 8, H - 22);
      ctx.fillStyle = AMBER + "88"; ctx.textAlign = "right";
      ctx.fillText("↘ osmotic pressure arrows", W - 8, H - 34);
      ctx.fillStyle = SILVER + "66"; ctx.fillText("○ Schumann resonance rings", W - 8, H - 22);

      ctx.fillStyle = GOLD + "80"; ctx.font = "bold 9px monospace"; ctx.textAlign = "center";
      ctx.fillText("CELLULAR DEHYDRATION FORCES · OSMOTIC PRESSURE ON BUBBLE MEMBRANE · SCHUMANN COUPLING", W * 0.5, H - 8);

      t++; raf = requestAnimationFrame(draw);
    }
    draw();
    return () => { cancelAnimationFrame(raf); ro.disconnect(); };
  }, []);
  return (
    <div style={{ border: `1px solid ${LINE}`, borderRadius: 12, overflow: "hidden" }}>
      <canvas ref={ref} style={{ width: "100%", height: 400, display: "block" }} />
    </div>
  );
}

/* ══════════════════════════════════════════════════════════
   CANVAS III — Three-Field Manipulation
   Three overlapping circular gradient fields (f1/f2/f3)
   dC/dx derivative vectors at each field boundary
   Perceptual expansion zones (regions of high gradient)
   Central observer reads all three fields simultaneously
   Sliders implied by: colour intensity, field radius, overlap
══════════════════════════════════════════════════════════ */
function ThreeFieldCanvas() {
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
      const BASE_R = Math.min(W, H) * 0.28;

      // Field centres arranged in equilateral triangle
      const SQRT3 = Math.sqrt(3);
      const SEP = BASE_R * 0.75;
      const FCENTRES = [
        { x: cx,              y: cy - SEP * 0.65 },        // f1 top
        { x: cx - SEP * 0.6, y: cy + SEP * 0.35 },        // f2 bottom-left
        { x: cx + SEP * 0.6, y: cy + SEP * 0.35 },        // f3 bottom-right
      ];
      const FCOLS = [GOLD, CYAN, VIOLET];
      const FREQS = [7.83, 14.3, 20.8];

      // Draw each field as a radial gradient (additive via globalCompositeOperation)
      ctx.save();
      ctx.globalCompositeOperation = "screen";
      FCENTRES.forEach((fc, fi) => {
        const col = FCOLS[fi];
        const fPulse = 0.7 + 0.3 * Math.sin(t * 0.015 * (FREQS[fi] / 7.83));
        const fR = BASE_R * fPulse;
        const fg = ctx.createRadialGradient(fc.x, fc.y, 0, fc.x, fc.y, fR);
        fg.addColorStop(0, col + "2a"); fg.addColorStop(0.6, col + "14"); fg.addColorStop(1, col + "00");
        ctx.fillStyle = fg; ctx.beginPath(); ctx.arc(fc.x, fc.y, fR, 0, Math.PI * 2); ctx.fill();
      });
      ctx.restore();

      // Field boundary circles
      FCENTRES.forEach((fc, fi) => {
        const col = FCOLS[fi];
        const fPulse = 0.7 + 0.3 * Math.sin(t * 0.015 * (FREQS[fi] / 7.83));
        ctx.strokeStyle = col + "55"; ctx.lineWidth = 1.2; ctx.setLineDash([4, 6]);
        ctx.beginPath(); ctx.arc(fc.x, fc.y, BASE_R * fPulse, 0, Math.PI * 2); ctx.stroke();
        ctx.setLineDash([]);
        ctx.fillStyle = col; ctx.font = "bold 9px monospace"; ctx.textAlign = "center";
        ctx.fillText(MODES[fi].label + " " + MODES[fi].hz, fc.x, fc.y - BASE_R * fPulse - 10);
      });

      // Derivative vectors at field boundaries
      // Sample dC/dx along rings and show arrows where gradient is high
      FCENTRES.forEach((fc, fi) => {
        const col = FCOLS[fi];
        const fPulse = 0.7 + 0.3 * Math.sin(t * 0.015 * (FREQS[fi] / 7.83));
        const fR = BASE_R * fPulse;
        const N_VEC = 10;
        for (let v = 0; v < N_VEC; v++) {
          const ang = (v / N_VEC) * Math.PI * 2 + t * 0.01;
          // dC/dr at boundary (inward gradient, outward derivative arrow)
          const vx2 = Math.cos(ang), vy2 = Math.sin(ang);
          const bx = fc.x + fR * vx2, by = fc.y + fR * vy2;
          const gradMag = 0.3 + 0.4 * Math.abs(Math.sin(t * 0.02 * (FREQS[fi] / 7.83) + v));
          const arrowLen = 12 * gradMag;
          ctx.strokeStyle = col + Math.round(gradMag * 150).toString(16).padStart(2, "0");
          ctx.lineWidth = 1.2;
          ctx.beginPath(); ctx.moveTo(bx, by); ctx.lineTo(bx + vx2 * arrowLen, by + vy2 * arrowLen); ctx.stroke();
          // Arrowhead
          ctx.fillStyle = col + Math.round(gradMag * 120).toString(16).padStart(2, "0");
          ctx.beginPath();
          const perpX = -vy2 * 3, perpY = vx2 * 3;
          const tipX = bx + vx2 * arrowLen, tipY = by + vy2 * arrowLen;
          ctx.moveTo(tipX, tipY);
          ctx.lineTo(tipX - vx2 * 6 + perpX, tipY - vy2 * 6 + perpY);
          ctx.lineTo(tipX - vx2 * 6 - perpX, tipY - vy2 * 6 - perpY);
          ctx.closePath(); ctx.fill();
        }
      });

      // Perceptual expansion zones — high-gradient regions between overlapping fields
      // Show bright patches where fields overlap (interference)
      ctx.save();
      ctx.globalCompositeOperation = "screen";
      for (let fi = 0; fi < 3; fi++) {
        for (let fj = fi + 1; fj < 3; fj++) {
          const midX = (FCENTRES[fi].x + FCENTRES[fj].x) * 0.5;
          const midY = (FCENTRES[fi].y + FCENTRES[fj].y) * 0.5;
          const overlapPulse = 0.5 + 0.5 * Math.sin(t * 0.025 + fi + fj);
          const og = ctx.createRadialGradient(midX, midY, 0, midX, midY, SEP * 0.35);
          og.addColorStop(0, WHITE + Math.round(overlapPulse * 20).toString(16).padStart(2, "0"));
          og.addColorStop(1, WHITE + "00");
          ctx.fillStyle = og; ctx.beginPath(); ctx.arc(midX, midY, SEP * 0.35, 0, Math.PI * 2); ctx.fill();
          // dC/dx label at midpoint
          ctx.fillStyle = WHITE + "66"; ctx.font = "bold 7px monospace"; ctx.textAlign = "center";
          ctx.fillText("∂C/∂x", midX, midY);
        }
      }
      ctx.restore();

      // Central observer — reads all three fields
      const obsPulse = 0.6 + 0.4 * Math.sin(t * 0.04);
      const obsG = ctx.createRadialGradient(cx, cy, 0, cx, cy, 14 + obsPulse * 4);
      obsG.addColorStop(0, TEAL + "88"); obsG.addColorStop(1, TEAL + "00");
      ctx.fillStyle = obsG; ctx.beginPath(); ctx.arc(cx, cy, 18, 0, Math.PI * 2); ctx.fill();
      ctx.strokeStyle = TEAL + "cc"; ctx.lineWidth = 1.5;
      ctx.beginPath(); ctx.arc(cx, cy, 10, 0, Math.PI * 2); ctx.stroke();
      ctx.fillStyle = TEAL; ctx.font = "bold 7px monospace"; ctx.textAlign = "center";
      ctx.fillText("OBS", cx, cy + 3);

      // Connection lines from observer to each field centre
      FCENTRES.forEach((fc, fi) => {
        const pulseAlpha = 0.25 + 0.2 * Math.sin(t * 0.03 + fi);
        ctx.strokeStyle = FCOLS[fi] + Math.round(pulseAlpha * 255).toString(16).padStart(2, "0");
        ctx.lineWidth = 1; ctx.setLineDash([4, 6]);
        ctx.beginPath(); ctx.moveTo(cx, cy); ctx.lineTo(fc.x, fc.y); ctx.stroke();
        ctx.setLineDash([]);
      });

      // Derivative label
      ctx.fillStyle = GREEN + "99"; ctx.font = "7px monospace"; ctx.textAlign = "left";
      ctx.fillText("∂C/∂x = derivative vector (perceptual expansion)", 8, H - 22);
      ctx.fillStyle = TEAL + "88"; ctx.textAlign = "right";
      ctx.fillText("OBS = observer reading 3 fields simultaneously", W - 8, H - 22);

      ctx.fillStyle = GOLD + "80"; ctx.font = "bold 9px monospace"; ctx.textAlign = "center";
      ctx.fillText("THREE-FIELD MANIPULATION · ∂C/∂x DERIVATIVE VECTORS · PERCEPTUAL EXPANSION ZONES · OVERLAP INTERFERENCE", W * 0.5, H - 8);

      t++; raf = requestAnimationFrame(draw);
    }
    draw();
    return () => { cancelAnimationFrame(raf); ro.disconnect(); };
  }, []);
  return (
    <div style={{ border: `1px solid ${LINE}`, borderRadius: 12, overflow: "hidden" }}>
      <canvas ref={ref} style={{ width: "100%", height: 420, display: "block" }} />
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
      <img src={src} alt={title} style={{ width: "100%", display: "block", maxHeight: 240, objectFit: "cover" as const }} />
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

const DOMAIN_CARDS = [
  {
    col: GOLD, label: "Schumann Resonance · Earth's Electromagnetic Cavity",
    body: "The Earth-ionosphere cavity acts as a spherical resonator for extremely low frequency (ELF) electromagnetic waves. Lightning discharges globally excite standing waves at f₁ = 7.83 Hz, f₂ = 14.3 Hz, f₃ = 20.8 Hz — the first three Schumann modes. Each mode is a 2D spherical standing wave on the Earth's surface, coherent around the entire planet. These are not metaphors: the Schumann resonances are measurable, stable, and continuously driven by ~50 lightning strikes per second worldwide.",
  },
  {
    col: CYAN, label: "Neural Entrainment · Three Decoupled Coherent Parts",
    body: "The three Schumann modes map precisely onto human brainwave bands: f₁ (7.83 Hz) overlaps theta-alpha boundary (intuition, deep relaxation); f₂ (14.3 Hz) overlaps alpha-beta (focused relaxed states); f₃ (20.8 Hz) overlaps beta-low gamma (active cognition). Neural entrainment is the tendency of oscillating neural networks to phase-lock to external rhythmic fields. The three bubble networks are decoupled (each operates independently) but coherent (each phase-locks to its own Schumann mode). This is a three-channel entrainment architecture — each brain state has its own planetary-scale carrier.",
  },
  {
    col: VIOLET, label: "Cellular Dehydration Forces · Bubble Membrane Dynamics",
    body: "Cells maintain water content via osmotic pressure: π_osm = iMRT (van 't Hoff equation). When a cell dehydrates, it expels water molecules outward and concentrates interior solutes. This changes the cell's electromagnetic properties — dehydrated cells have higher ion concentration, altered membrane potential, and changed dielectric constant. Applied to the Schumann bubble model: cellular dehydration forces act on the 2D spherical bubble membrane, modulating the boundary conditions for the standing wave. A dehydrating cellular layer around a Schumann-coupled bio-system changes how the bubble membrane interacts with the external field.",
  },
  {
    col: GREEN, label: "Perceptual Expansion · Mathematical Derivative Basis",
    body: "The standard derivative df/dx measures the rate of change of a field at every point. Applied to the coherence field C(x,t): ∂C/∂x is the perceptual gradient — the direction and magnitude of maximum coherence change. Regions of high |∂C/∂x| are perceptually salient: the system is most sensitive to changes there. A 'perceptually expandable base' using the derivative means: locate the high-gradient zones at field boundaries (where Schumann bubbles overlap), and direct attention/perception there. This is literally where the three fields interfere — the most informationally rich zone.",
  },
  {
    col: ROSE, label: "Three-Field Manipulation · Use Case",
    body: "The use case: three Schumann fields (f₁/f₂/f₃) are each independently tunable through biological coupling — hydration state, breath rate, posture, and EEG entrainment all shift the coupling strength to each field. A practitioner who understands all three can independently modulate: (1) f₁ coupling — via slow breathing, hydration, deep restful states; (2) f₂ coupling — via relaxed focused attention, alpha-state practices; (3) f₃ coupling — via active cognitive engagement. The overlap zones (∂C/∂x) between fields are where field manipulation produces the largest perceptual shifts per unit of effort — they are the leverage points.",
  },
];

export default function SchumannNeuralFieldsPage() {
  return (
    <div style={{ background: BG, color: IVORY, minHeight: "100vh" }}>
      <div style={{ maxWidth: 1060, margin: "0 auto", padding: "52px 32px 36px" }}>
        <Tag t="Schumann Resonance · Neural Entrainment · Three Decoupled Coherent 2D Spherical Bubbles · Cellular Dehydration · Osmotic Forces · Perceptual Expansion · Derivative Basis · Three-Field Manipulation" />
        <h1 style={{ fontSize: 38, fontWeight: 800, lineHeight: 1.05, margin: "8px 0 14px", letterSpacing: -0.5 }}>
          <span style={{ color: GOLD }}>Schumann</span>{" "}
          <span style={{ color: CYAN }}>Resonance</span><br />
          <span style={{ color: VIOLET }}>Neural Entrainment</span>
        </h1>
        <h2 style={{ fontSize: 17, fontWeight: 400, color: SILVER, margin: "0 0 20px", lineHeight: 1.6 }}>
          Three Decoupled Coherent Bubble Networks · Cellular Dehydration Forces · Three-Field Manipulation
        </h2>
        <p style={{ fontSize: 13, color: DIM, lineHeight: 1.9, maxWidth: 840, marginBottom: 28 }}>
          The Schumann resonance modes are 2D spherical standing waves in the Earth–ionosphere cavity — three coherent, decoupled electromagnetic bubbles at 7.83, 14.3, and 20.8 Hz. Each carries an internal network structure and its own oscillation dynamics. Biological cells interact with these fields through their membrane boundaries: dehydration forces (osmotic pressure, ion concentration) change how cell membranes couple to the bubble surface. The standard mathematical derivative ∂C/∂x identifies where the three fields' gradients are steepest — the perceptually expandable zones where three-field manipulation is most effective.
        </p>

        {/* Schumann mode summary bar */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12, marginBottom: 36 }}>
          {MODES.map(m => (
            <div key={m.f} style={{ padding: "14px 16px", background: PANEL, borderRadius: 12, border: `1px solid ${m.col}22` }}>
              <div style={{ fontSize: 22, fontWeight: 800, color: m.col, fontFamily: "monospace" }}>{m.hz}</div>
              <div style={{ fontSize: 11, color: m.col + "cc", fontWeight: 600, marginTop: 2 }}>{m.label} · {m.name}</div>
              <div style={{ fontSize: 11, color: DIM, marginTop: 4 }}>{m.brain}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Canvas I */}
      <div style={{ maxWidth: 1060, margin: "0 auto", padding: "0 32px 48px" }}>
        <Tag t="Section I · Three Decoupled Coherent 2D Spherical Bubble Networks · f₁ f₂ f₃ · Internal Node Networks · Drift Motion" c={GOLD} />
        <h2 style={{ fontSize: 20, fontWeight: 700, color: GOLD, marginBottom: 14 }}>Three Bubble Networks · 7.83 · 14.3 · 20.8 Hz</h2>
        <ThreeBubblesCanvas />
        <div style={{ marginTop: 10, fontSize: 10, color: MUTED, textAlign: "center" as const }}>
          Gold=f₁ 7.83 Hz · Cyan=f₂ 14.3 Hz · Violet=f₃ 20.8 Hz · Each bubble breathes at its own Schumann frequency · Internal node network connected by coherence threads · Bubbles drift independently (decoupled) · Gold dashes = weak inter-bubble coherence bridge
        </div>
      </div>

      <Divider />

      {/* Canvas II */}
      <div style={{ maxWidth: 1060, margin: "0 auto", padding: "0 32px 48px" }}>
        <Tag t="Section II · Cellular Dehydration Forces · Osmotic Pressure · Water Expelled · Ion Concentration · Schumann Coupling" c={AMBER} />
        <h2 style={{ fontSize: 20, fontWeight: 700, color: AMBER, marginBottom: 14 }}>Cellular Dehydration Forces on Bubble Membrane</h2>
        <DehydrationCanvas />
        <div style={{ marginTop: 10, fontSize: 10, color: MUTED, textAlign: "center" as const }}>
          Bubble membrane (blue circle) shrinks under dehydration · Cyan dots = water molecules expelled outward · Orange arrows = osmotic pressure force (inward) · Gold dots inside = concentrated ions (increase with dehydration) · Coloured rings = three Schumann modes coupling to the membrane
        </div>
      </div>

      <Divider />

      {/* Equations */}
      <div style={{ maxWidth: 1060, margin: "0 auto", padding: "0 32px 48px" }}>
        <Tag t="Section III · Governing Relations · Schumann · Entrainment · Osmosis · Derivative · Three-Field" c={CYAN} />
        <h2 style={{ fontSize: 20, fontWeight: 700, color: CYAN, marginBottom: 20 }}>Physical Relations</h2>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(260px,1fr))", gap: 14 }}>
          <EqChip eq="fₙ = (c/2πa)√(n(n+1)/2)" label="Schumann frequency formula — c=speed of light, a=Earth radius (~6371 km). Gives f₁=7.83, f₂=14.3, f₃=20.8 Hz for n=1,2,3." col={GOLD} />
          <EqChip eq="Ψ(t) = A·cos(ωₙt + φₙ)" label="Spherical bubble wave — each Schumann mode is a 2D standing wave with amplitude A, angular frequency ωₙ=2πfₙ, and phase φₙ. Decoupled = independent φₙ for each mode." col={CYAN} />
          <EqChip eq="π_osm = iMRT" label="Osmotic pressure (van 't Hoff) — i=van 't Hoff factor, M=molarity of solutes, R=gas constant, T=temperature. Drives water out of dehydrating cell." col={AMBER} />
          <EqChip eq="∂C/∂x = lim_{Δx→0} ΔC/Δx" label="Standard derivative — rate of change of coherence field C at each point x. ∂C/∂x is maximum at field boundaries = perceptually expandable zone." col={GREEN} />
          <EqChip eq="C(x,t) = A(x)·e^{i(φ−ωt)}" label="AETHER coherence field — each Schumann bubble is one solution. Three bubbles = three independent C fields. Observer coupling ∝ |∂C/∂x| at their location." col={VIOLET} />
          <EqChip eq="F_overlap = C₁·C₂·cos(Δφ)" label="Inter-field overlap force — constructive when phases align (Δφ=0), destructive when opposed (Δφ=π). Overlap zones are maximum-gradient perceptual expansion bases." col={TEAL} />
        </div>
      </div>

      <Divider />

      {/* Canvas III */}
      <div style={{ maxWidth: 1060, margin: "0 auto", padding: "0 32px 48px" }}>
        <Tag t="Section IV · Three-Field Manipulation · ∂C/∂x Derivative Arrows · Perceptual Expansion Zones · Observer Coupling" c={VIOLET} />
        <h2 style={{ fontSize: 20, fontWeight: 700, color: VIOLET, marginBottom: 14 }}>Three-Field Manipulation · Derivative Perceptual Map</h2>
        <ThreeFieldCanvas />
        <div style={{ marginTop: 10, fontSize: 10, color: MUTED, textAlign: "center" as const }}>
          Three overlapping gradient fields: gold=f₁, cyan=f₂, violet=f₃ · Arrows = ∂C/∂x derivative vectors at each field boundary · White overlap zones = high-gradient perceptual expansion areas (∂C/∂x maximum) · Teal OBS = observer reading all three fields · Dashed lines = observer-field coupling
        </div>
      </div>

      <Divider />

      {/* Domain cards */}
      <div style={{ maxWidth: 1060, margin: "0 auto", padding: "0 32px 48px" }}>
        <Tag t="Section V · Five Domain Explanations · Schumann · Entrainment · Dehydration · Derivative · Field Manipulation" c={TEAL} />
        <h2 style={{ fontSize: 20, fontWeight: 700, color: TEAL, marginBottom: 20 }}>All Five Domains Explained</h2>
        <div style={{ display: "flex", flexDirection: "column" as const, gap: 12 }}>
          {DOMAIN_CARDS.map((d, i) => (
            <div key={i} style={{ display: "grid", gridTemplateColumns: "44px 1fr", gap: 16, alignItems: "start",
              padding: "16px 20px", background: PANEL, borderRadius: 12, border: `1px solid ${d.col}18` }}>
              <div style={{ fontSize: 26, fontWeight: 800, color: d.col }}>{i + 1}</div>
              <div>
                <div style={{ fontSize: 12, fontWeight: 700, color: d.col, marginBottom: 7, lineHeight: 1.5 }}>{d.label}</div>
                <div style={{ fontSize: 12, color: DIM, lineHeight: 1.85 }}>{d.body}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <Divider />

      {/* Source plates */}
      <div style={{ maxWidth: 1060, margin: "0 auto", padding: "0 32px 48px" }}>
        <Tag t="Section VI · Source Plates · AETHER Field Reference" c={VIOLET} />
        <h2 style={{ fontSize: 20, fontWeight: 700, color: VIOLET, marginBottom: 20 }}>Knowledge Reference Plates</h2>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(300px,1fr))", gap: 20 }}>
          <Plate src={omniFlow} title="Omni-Field · Three-Mode Cavity Architecture" chips={["Schumann f₁ f₂ f₃", "spherical bubble", "decoupled coherent", "neural entrainment", "field superposition"]}
            body="The omni-field plate captures the three-mode cavity: each Schumann frequency is an independent 2D spherical standing wave (bubble), decoupled in phase but coherent in frequency. The overlap zones between the three bubbles correspond to the maximum-derivative perceptual expansion zones." />
          <Plate src={magStorm} title="Magnetic Storm · Cellular Dehydration Coupling" chips={["osmotic pressure", "membrane coupling", "dehydration forces", "ion concentration", "Schumann boundary"]}
            body="The magnetic storm plate represents the cellular layer's coupling to the Schumann field: dehydration changes membrane dielectric properties, shifting how the cell's osmotic forces interact with the bubble boundary condition. Storm-scale perturbations of the Schumann resonance are measurable in biological systems." />
          <Plate src={skyrmion} title="Skyrmion · Topological Bubble Network Node" chips={["topological stability", "internal node", "coherence thread", "derivative field", "perceptual expansion"]}
            body="The skyrmion represents a topologically stable node inside each bubble network — a persistent internal structure that cannot be unwound by smooth deformations. These nodes are what make the bubble networks coherent: each node is a local minimum of the derivative field ∂C/∂x." />
        </div>
      </div>

      <Divider />

      {/* AETHER synthesis */}
      <div style={{ maxWidth: 1060, margin: "0 auto", padding: "0 32px 52px" }}>
        <Tag t="AETHER Synthesis · Three Bubbles · One Observer · Derivative Map · Perceptual Expansion" />
        <div style={{ padding: "22px 26px", background: PANEL, borderRadius: 14, border: `1px solid ${GOLD}15`, marginBottom: 24 }}>
          <div style={{ fontSize: 14, color: IVORY, lineHeight: 2.1 }}>
            The Schumann resonance gives the biosphere three independent electromagnetic carriers — three 2D spherical bubble networks each vibrating at a different frequency, each decoupled from the others in phase, but all coherent in that they are continuously maintained by the same global lightning source. Neural entrainment is the mechanism by which biological oscillators phase-lock to these carriers. The cellular dehydration forces act as a <em style={{ color: AMBER }}>boundary condition modulator</em> — by changing hydration state, the cell changes how its membrane interacts with the Schumann bubble surface, effectively tuning the coupling strength to each mode. The mathematical derivative ∂C/∂x is the <em style={{ color: GREEN }}>perceptual expansion instrument</em>: it identifies exactly where the three coherence fields are changing fastest — the overlap zones between bubbles — and these are the regions of maximum perceptual leverage. In AETHER terms: three fields, three bubbles, one derivative map, one observer. Manipulating the three fields means knowing which bubble you are coupling to at any moment, and directing attention (or hydration, or breath, or frequency entrainment) to shift that coupling. The overlap zones are not noise — they are the highest-information zones. Perception expands precisely there.
          </div>
        </div>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" as const }}>
          {["/lunar-coherence","/heliospheric-coherence","/neural-oscillations","/solar-neural-interface","/coherence-field-explorer","/synchrony-field","/three-oscillator","/graph-map"].map(href => (
            <a key={href} href={href} style={{ padding: "6px 12px", borderRadius: 8, border: `1px solid ${LINE}`, color: DIM, fontSize: 11, textDecoration: "none" }}>
              {href.replace("/", "").replace(/-/g, " ")} →
            </a>
          ))}
        </div>
      </div>
    </div>
  );
}
