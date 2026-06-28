import { useEffect, useRef, useState } from "react";

/* ── Palette ─────────────────────────────── */
const BG     = "#040810";
const WEB    = "#2ecc9a";
const TOUCH  = "#e8a838";
const TEAL   = "#0d7377";
const AQUA   = "#14bdac";
const GOLD   = "#c9a84c";
const CORAL  = "#e05c4b";
const VIOLET = "#9b59b6";
const BLUE   = "#1a9fd4";
const DIM    = "#4a6a78";
const TEXT   = "#d8e8ec";

const mono  = "'Space Mono', monospace";
const serif = "'Cinzel', serif";
const body  = "'Crimson Pro', Georgia, serif";

/* ── Atoms ────────────────────────────────── */
function Chip({ c = BLUE, children }: { c?: string; children: string }) {
  return (
    <span style={{
      fontFamily: mono, fontSize: 11, color: c,
      background: `${c}18`, border: `1px solid ${c}40`,
      borderRadius: 4, padding: "2px 7px", display: "inline-block", margin: "2px 3px",
    }}>{children}</span>
  );
}
function EQ({ col = GOLD, children }: { col?: string; children: string }) {
  return (
    <pre style={{
      fontFamily: mono, fontSize: 12, color: col,
      background: "#030a14", borderLeft: `2px solid ${col}`,
      borderRadius: "0 6px 6px 0", padding: "12px 18px", margin: "12px 0",
      overflowX: "auto", whiteSpace: "pre-wrap",
    }}>{children}</pre>
  );
}
function SecHead({ id, n, title, sub, col = WEB }:
  { id: string; n: string; title: string; sub: string; col?: string }) {
  return (
    <div id={id} style={{ marginTop: 64, scrollMarginTop: 80 }}>
      <div style={{ fontFamily: mono, fontSize: 10, color: col, letterSpacing: 3, marginBottom: 6 }}>{n}</div>
      <h2 style={{ fontFamily: serif, fontSize: 26, color: "#fff", margin: "0 0 4px", letterSpacing: 1 }}>{title}</h2>
      <div style={{ fontFamily: body, fontSize: 15, color: DIM, marginBottom: 20 }}>{sub}</div>
      <div style={{ height: 1, background: `linear-gradient(90deg,${col}60,transparent)`, marginBottom: 28 }} />
    </div>
  );
}
function Pull({ col = WEB, children }: { col?: string; children: string }) {
  return (
    <blockquote style={{
      borderTop: `2px solid ${col}`, borderBottom: `2px solid ${col}`,
      padding: "14px 24px", margin: "24px 0", fontFamily: body, fontStyle: "italic",
      fontSize: 18, color: col, lineHeight: 1.6, textAlign: "center",
    }}>{children}</blockquote>
  );
}
function Card({ title, col = WEB, children }: { title: string; col?: string; children: any }) {
  return (
    <div style={{
      borderTop: `3px solid ${col}`, background: "rgba(13,31,45,0.85)",
      borderRadius: 4, padding: "16px 20px", marginBottom: 16,
    }}>
      <div style={{ fontFamily: serif, fontSize: 15, color: "#fff", marginBottom: 8 }}>{title}</div>
      <div style={{ fontFamily: body, fontSize: 14, color: "#7a9aa2", lineHeight: 1.7 }}>{children}</div>
    </div>
  );
}
function Tbl({ headers, rows, accent = WEB }:
  { headers: string[]; rows: string[][]; accent?: string }) {
  return (
    <div style={{ overflowX: "auto", margin: "14px 0" }}>
      <table style={{ width: "100%", borderCollapse: "collapse", fontFamily: body, fontSize: 14 }}>
        <thead>
          <tr style={{ background: TEAL }}>
            {headers.map((h, i) => <th key={i} style={{ fontFamily: mono, fontSize: 9, color: "#fff", textAlign: "left", padding: "6px 10px", letterSpacing: 1 }}>{h}</th>)}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, ri) => (
            <tr key={ri} style={{ background: ri % 2 === 0 ? "rgba(13,31,45,0.5)" : "transparent" }}>
              {row.map((c, ci) => <td key={ci} style={{ padding: "7px 10px", color: TEXT, verticalAlign: "top", borderBottom: "1px solid #0d1f2d" }}>{c}</td>)}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
function PhaseStrip({ phases }: { phases: { n: string; m: string; b: string; col: string }[] }) {
  return (
    <div style={{ display: "flex", border: `1px solid ${TEAL}40`, borderRadius: 4, overflow: "hidden", margin: "16px 0 24px" }}>
      {phases.map((p, i) => (
        <div key={i} style={{ flex: 1, padding: "12px 10px", borderRight: i < phases.length - 1 ? `1px solid ${TEAL}30` : "none" }}>
          <div style={{ fontFamily: mono, fontSize: 26, fontWeight: 700, color: p.col, marginBottom: 2 }}>{p.n}</div>
          <div style={{ fontFamily: mono, fontSize: 9, fontWeight: 700, letterSpacing: 1, color: p.col, marginBottom: 6, textTransform: "uppercase" }}>{p.m}</div>
          <div style={{ fontFamily: body, fontSize: 12, color: "#6a8a92", lineHeight: 1.55 }}>{p.b}</div>
        </div>
      ))}
    </div>
  );
}

/* ── Perception Layer Row ─────────────────── */
const PERC_LAYERS = [
  { n: "I",    name: "Physical Spectrum",        col: "#9b59b6", bg: "#1a0a2a",
    sub: "λ: 10nm–1mm (photon reality)",
    body: "Electromagnetic radiation. UV (10–400nm), visible (380–730nm), near-IR (730nm–1mm). Quantum: photons carry E = hc/λ. The sun emits peak at 550nm (green) — matched to human cone peak sensitivity. Physics has no 'color' — only wavelength and intensity." },
  { n: "II",   name: "Biology",                  col: "#1a9fd4", bg: "#0a1a2a",
    sub: "S/M/L cone trichromacy · opponent channels",
    body: "Three cone types (S: 420nm, M: 530nm, L: 560nm) + rods for scotopic. Opponent processing: red-green (L-M), blue-yellow (S-(L+M)), luminance (L+M). This encoding is optimal (minimises mutual information between channels) — evolution found the efficient representation." },
  { n: "III",  name: "Device Space",              col: "#14bdac", bg: "#051a18",
    sub: "sRGB gamut — a tiny subset of biology",
    body: "sRGB covers ~35% of human gamut (CIE xy). Displays can't show pure spectral colors (monochromatic sources) or the full Pointer's gamut of real surface colors. HDR/DCI-P3 extends to ~54%. The device layer is a severe bottleneck: most mediated perception is impoverished before it begins." },
  { n: "IV",   name: "LAB / OKLab Manifold",     col: "#c9a84c", bg: "#1a1400",
    sub: "Perceptual uniformity geometry",
    body: "CIELAB attempts perceptual uniformity: equal distance = equal perceived difference. OKLab (2020) is more accurate. This layer is a Riemannian manifold — the metric tensor g_ij(x) of color space is non-Euclidean. Hue constancy, chromatic adaptation, white balance all live here." },
  { n: "V",    name: "Animal Vision",             col: "#2ecc9a", bg: "#051a10",
    sub: "Bee UV · bird tetrachromacy · mantis 16-cone",
    body: "Bees: trichromatic but UV-shifted (350, 440, 540nm) — they see petal patterns invisible to us. Birds: tetrachromatic + UV cone (315nm) → 4D color space with 4 opponent channels. Mantis shrimp: 16 photoreceptor classes — not higher resolution but faster temporal processing (color decision in a single fixation, not comparison). Full perception requires the full 4D+ field." },
  { n: "VI",   name: "Impossible Colors",         col: "#e05c4b", bg: "#1a0500",
    sub: "Stygian blue · reddish green · hyperbolic orange",
    body: "Colors that cannot appear in normal vision but exist in the perceptual system's geometry. Stygian blue: perceived as dark and bright simultaneously (binocular color mixing). Reddish green: simultaneous red-green opponent channel activation (opponent colors are normally mutually exclusive). Hyperbolic orange: supersaturated orange beyond the spectral locus — requires two incompatible eye states. These are the boundary conditions of the perceptual manifold." },
  { n: "VII",  name: "Japanese Perception",       col: "#e8a838", bg: "#1a0d00",
    sub: "Cultural color space — time + season + material",
    body: "Nihongo has color concepts not as wavelength categories but as temporal-material experiences: 桜色 (sakura-iro) = the specific pink of cherry blossom petals against morning light in March, not just 'pink'. 群青 (gunjō) = ultramarine of traditional pigment, not just 'dark blue'. Cultural color space adds: time of year, material substrate, light quality, memory, and meaning as dimensions of the percept. Full perception cannot be color-blind to culture." },
];

/* ══════════════════════════════════════════
   CANVAS — 3 MODES
══════════════════════════════════════════ */
type Mode = "membrane" | "perception" | "lock";

function WebbedCanvas({ mode }: { mode: Mode }) {
  const cvs = useRef<HTMLCanvasElement>(null);
  const raf = useRef(0);
  const tick = useRef(0);

  useEffect(() => {
    const canvas = cvs.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d")!;
    const resize = () => {
      const p = canvas.parentElement!;
      canvas.width  = p.clientWidth;
      canvas.height = Math.min(360, Math.round(p.clientWidth * 0.5));
    };
    resize();
    window.addEventListener("resize", resize);

    /* Phase A particles — analytical, grid */
    const PA_N = 60;
    const phaseA = Array.from({ length: PA_N }, (_, i) => ({
      x: 0.05 + (i % 8) * 0.048,
      y: 0.2 + Math.floor(i / 8) * 0.1,
      vx: (Math.random() - 0.5) * 0.001,
      vy: (Math.random() - 0.5) * 0.001,
      phase: Math.random() * Math.PI * 2,
    }));
    /* Phase B particles — creative, wave */
    const PB_N = 60;
    const phaseB = Array.from({ length: PB_N }, (_, i) => ({
      x: 0.58 + Math.random() * 0.37,
      y: 0.1 + Math.random() * 0.8,
      baseX: 0.58 + Math.random() * 0.37,
      baseY: 0.1 + Math.random() * 0.8,
      phase: Math.random() * Math.PI * 2,
      amp: 0.02 + Math.random() * 0.04,
      freq: 0.03 + Math.random() * 0.04,
    }));
    /* Membrane propagation wave */
    let wavePos = 0;

    /* Perception stack photons */
    const PHOTON_N = 30;
    const photons = Array.from({ length: PHOTON_N }, (_, i) => ({
      x: 0.2 + (i % 7) * 0.09,
      y: 1.05 + (i / PHOTON_N) * 0.6,
      speed: 0.006 + Math.random() * 0.004,
      col: `hsl(${260 + (i / PHOTON_N) * 280},90%,60%)`,
      layer: -1, // which perception layer it's in
    }));

    /* Coherence lock */
    const APPROACH_N = 8;
    const approaches = Array.from({ length: APPROACH_N }, (_, i) => ({
      angle: (i / APPROACH_N) * Math.PI * 2,
      r: 0.7 + Math.random() * 0.25,
      speed: 0.004 + Math.random() * 0.003,
      locked: false, lockT: 0,
    }));
    let lockPulse = 0;

    const draw = () => {
      const W = canvas.width, H = canvas.height;
      const t = tick.current;
      ctx.clearRect(0, 0, W, H);
      ctx.fillStyle = BG; ctx.fillRect(0, 0, W, H);

      /* ══ WEBBED LEG · MEMBRANE ══ */
      if (mode === "membrane") {
        // Phase A zone (left)
        const aG = ctx.createLinearGradient(0, 0, W * 0.38, 0);
        aG.addColorStop(0, "rgba(13,115,119,0.15)"); aG.addColorStop(1, "transparent");
        ctx.fillStyle = aG; ctx.fillRect(0, 0, W * 0.38, H);

        // Phase B zone (right)
        const bG = ctx.createLinearGradient(W * 0.62, 0, W, 0);
        bG.addColorStop(0, "transparent"); bG.addColorStop(1, "rgba(155,89,182,0.15)");
        ctx.fillStyle = bG; ctx.fillRect(W * 0.62, 0, W * 0.38, H);

        // Zone labels
        ctx.fillStyle = `${AQUA}90`; ctx.font = `9px ${mono}`; ctx.textAlign = "center";
        ctx.fillText("PHASE A · ANALYTICAL", W * 0.18, H * 0.07);
        ctx.fillStyle = `${VIOLET}90`;
        ctx.fillText("PHASE B · CREATIVE", W * 0.82, H * 0.07);

        // Phase A particles — grid, small oscillation
        for (const p of phaseA) {
          p.x += p.vx; p.y += p.vy;
          p.phase += 0.02;
          const px = p.x * W;
          const py = p.y * H + Math.sin(p.phase) * 3;
          ctx.beginPath(); ctx.arc(px, py, 2.5, 0, Math.PI * 2);
          ctx.fillStyle = `${AQUA}cc`; ctx.fill();
        }

        // Phase B particles — flowing waves
        for (const p of phaseB) {
          p.phase += p.freq;
          const px = (p.baseX + Math.sin(p.phase) * p.amp) * W;
          const py = (p.baseY + Math.cos(p.phase * 0.7) * p.amp) * H;
          ctx.beginPath(); ctx.arc(px, py, 2.5, 0, Math.PI * 2);
          ctx.fillStyle = `${VIOLET}cc`; ctx.fill();
        }

        // THE MEMBRANE — webbed leg structure
        const mCX = W * 0.5, mCY = H * 0.5;
        const mR = H * 0.3;
        const angles = [-0.5, -0.25, 0, 0.25, 0.5];
        const memCols = [AQUA, TEAL, WEB, TOUCH, CORAL];

        // Webbing between fingers
        for (let i = 0; i < 4; i++) {
          const a1 = angles[i], a2 = angles[i + 1];
          const p1x = mCX + Math.sin(a1) * mR * 0.75;
          const p1y = mCY - Math.cos(a1) * mR * 0.75;
          const p2x = mCX + Math.sin(a2) * mR * 0.75;
          const p2y = mCY - Math.cos(a2) * mR * 0.75;
          const pulse = 0.5 + 0.5 * Math.sin(t * 0.04 + i);
          ctx.beginPath();
          ctx.moveTo(p1x, p1y);
          ctx.quadraticCurveTo(mCX + (Math.sin(a1 + a2) / 2) * mR * 0.4, mCY - Math.cos((a1 + a2) / 2) * mR * 0.5, p2x, p2y);
          ctx.strokeStyle = `rgba(232,168,56,${0.08 + 0.06 * pulse})`;
          ctx.lineWidth = 14; ctx.stroke();
          ctx.strokeStyle = `rgba(46,204,154,${0.2 + 0.15 * pulse})`;
          ctx.lineWidth = 1.2; ctx.stroke();
        }

        // Fingers
        angles.forEach((a, i) => {
          const fTip = { x: mCX + Math.sin(a) * mR, y: mCY - Math.cos(a) * mR };
          const fBase = { x: mCX + Math.sin(a) * mR * 0.15, y: mCY - Math.cos(a) * mR * 0.15 };
          ctx.beginPath(); ctx.moveTo(fBase.x, fBase.y); ctx.lineTo(fTip.x, fTip.y);
          ctx.strokeStyle = memCols[i] + "aa"; ctx.lineWidth = 2.5; ctx.stroke();
          ctx.beginPath(); ctx.arc(fTip.x, fTip.y, 6, 0, Math.PI * 2);
          ctx.fillStyle = memCols[i] + "cc"; ctx.fill();
        });

        // Transition wave propagating through membrane
        wavePos = (wavePos + 0.005) % 1;
        const wAngle = (wavePos - 0.5) * 1.0; // angle through membrane
        const wR2 = mR * 0.5 * wavePos;
        const wX = mCX + Math.sin(wAngle) * wR2;
        const wY = mCY - Math.cos(wAngle) * wR2;
        const wGlow = ctx.createRadialGradient(wX, wY, 0, wX, wY, 20);
        wGlow.addColorStop(0, `rgba(232,168,56,${0.7 * Math.sin(wavePos * Math.PI)})`);
        wGlow.addColorStop(1, "transparent");
        ctx.beginPath(); ctx.arc(wX, wY, 20, 0, Math.PI * 2);
        ctx.fillStyle = wGlow; ctx.fill();

        // "The wave" label
        ctx.fillStyle = `${TOUCH}90`; ctx.font = `7px ${mono}`; ctx.textAlign = "center";
        ctx.fillText("transition wave", wX, wY - 26);

        // Bottom labels
        ctx.fillStyle = `${WEB}70`; ctx.font = `7px ${mono}`; ctx.textAlign = "center";
        ctx.fillText("THE MEMBRANE", mCX, H * 0.96);
        ctx.fillText("(coupling geometry)", mCX, H * 0.96 + 11);
      }

      /* ══ PERCEPTION STACK ══ */
      else if (mode === "perception") {
        const LAYERS = 7;
        const layerH = H / LAYERS;
        const layerCols = [
          "#9b59b6", "#1a9fd4", "#14bdac",
          "#c9a84c", "#2ecc9a", "#e05c4b", "#e8a838",
        ];
        const layerNames = [
          "I · PHYSICAL SPECTRUM", "II · BIOLOGY", "III · DEVICE SPACE",
          "IV · LAB/OKLAB", "V · ANIMAL VISION", "VI · IMPOSSIBLE COLORS",
          "VII · JAPANESE PERCEPTION",
        ];

        // Draw layer bands
        for (let li = 0; li < LAYERS; li++) {
          const ly = (LAYERS - 1 - li) * layerH; // bottom = physical
          const col = layerCols[li];
          const pulse = 0.15 + 0.05 * Math.sin(t * 0.04 + li * 0.7);
          ctx.fillStyle = `${col}${Math.round(pulse * 255).toString(16).padStart(2, "0")}`;
          ctx.fillRect(0, ly, W, layerH);
          // Label
          ctx.fillStyle = col + "dd"; ctx.font = `8px ${mono}`; ctx.textAlign = "left";
          ctx.fillText(layerNames[li], 10, ly + layerH / 2 + 3);
          // Divider
          if (li < LAYERS - 1) {
            ctx.strokeStyle = col + "40"; ctx.lineWidth = 1;
            ctx.beginPath(); ctx.moveTo(0, ly); ctx.lineTo(W, ly); ctx.stroke();
          }
        }

        // Photons rising through layers
        for (const p of photons) {
          p.y -= p.speed;
          if (p.y < -0.05) p.y = 1.05;
          const ly = p.y * H;
          // Which layer?
          const layerIdx = LAYERS - 1 - Math.floor(p.y * LAYERS);
          const clampedLayer = Math.max(0, Math.min(LAYERS - 1, layerIdx));

          // Change color as it rises through layers
          const layerProgress = (p.y * LAYERS) % 1;
          const fromCol = layerCols[Math.max(0, clampedLayer - 1)] || layerCols[0];
          const toCol = layerCols[clampedLayer];

          ctx.beginPath(); ctx.arc(p.x * W, ly, 3, 0, Math.PI * 2);
          ctx.fillStyle = toCol + "cc"; ctx.fill();

          // Glow at layer boundaries
          if (layerProgress < 0.08 || layerProgress > 0.92) {
            const glow = ctx.createRadialGradient(p.x * W, ly, 0, p.x * W, ly, 10);
            glow.addColorStop(0, toCol + "60");
            glow.addColorStop(1, "transparent");
            ctx.beginPath(); ctx.arc(p.x * W, ly, 10, 0, Math.PI * 2);
            ctx.fillStyle = glow; ctx.fill();
          }
        }

        // "Can a system approach full perception?" label
        ctx.fillStyle = "rgba(255,255,255,0.7)"; ctx.font = `9px ${mono}`; ctx.textAlign = "center";
        ctx.fillText("→ Most efficient representation, not total storage", W / 2, H * 0.5 - 6);
        ctx.fillStyle = `${GOLD}80`; ctx.font = `8px ${mono}`;
        ctx.fillText("FULL PERCEPTION UNIVERSE", W / 2, H * 0.5 + 8);
      }

      /* ══ COHERENCE LOCK ══ */
      else if (mode === "lock") {
        const cx = W * 0.5, cy = H * 0.5;
        const ballR = Math.min(W, H) * 0.12;

        // Ball — the concept/object
        const ballGlow = ctx.createRadialGradient(cx, cy, 0, cx, cy, ballR * 2.5);
        const coherence = 0.6 + 0.3 * Math.sin(t * 0.025);
        ballGlow.addColorStop(0, `rgba(201,168,76,${coherence * 0.4})`);
        ballGlow.addColorStop(1, "transparent");
        ctx.fillStyle = ballGlow;
        ctx.beginPath(); ctx.arc(cx, cy, ballR * 2.5, 0, Math.PI * 2); ctx.fill();

        ctx.beginPath(); ctx.arc(cx, cy, ballR, 0, Math.PI * 2);
        const bG = ctx.createRadialGradient(cx - ballR * 0.3, cy - ballR * 0.3, 0, cx, cy, ballR);
        bG.addColorStop(0, "#fff8d0"); bG.addColorStop(1, GOLD + "aa");
        ctx.fillStyle = bG; ctx.fill();
        ctx.strokeStyle = GOLD; ctx.lineWidth = 1.5; ctx.stroke();

        // Ball label
        ctx.fillStyle = `${GOLD}cc`; ctx.font = `8px ${mono}`; ctx.textAlign = "center";
        ctx.fillText("THE BALL", cx, cy + ballR + 14);
        ctx.fillStyle = `${GOLD}70`; ctx.font = `7px ${mono}`;
        ctx.fillText("(concept / object)", cx, cy + ballR + 25);

        // Approaching cognitive agents
        lockPulse += 0.03;
        let lockedCount = 0;
        for (const ap of approaches) {
          ap.angle += ap.speed;
          // Move inward over time
          if (ap.r > 0.22 + ballR / Math.min(W, H)) {
            ap.r -= 0.0015;
          } else {
            ap.locked = true; ap.lockT += 1;
          }
          if (ap.locked) lockedCount++;
          const px = cx + ap.r * Math.min(W, H) * Math.cos(ap.angle);
          const py = cy + ap.r * Math.min(W, H) * Math.sin(ap.angle);

          if (ap.locked) {
            // Coherence lock — resonance pattern
            const lockAlpha = 0.7 + 0.3 * Math.sin(ap.lockT * 0.1 + ap.angle * 3);
            ctx.beginPath(); ctx.arc(px, py, 5, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(46,204,154,${lockAlpha})`; ctx.fill();
            // Connection line
            ctx.beginPath(); ctx.moveTo(cx, cy); ctx.lineTo(px, py);
            ctx.strokeStyle = `rgba(46,204,154,${lockAlpha * 0.4})`; ctx.lineWidth = 1; ctx.stroke();
            // Resonance ring
            const rRad = 4 + 6 * Math.abs(Math.sin(ap.lockT * 0.08));
            ctx.beginPath(); ctx.arc(px, py, rRad, 0, Math.PI * 2);
            ctx.strokeStyle = `rgba(46,204,154,${lockAlpha * 0.3})`; ctx.lineWidth = 1; ctx.stroke();
          } else {
            // Not yet locked — approaching
            ctx.beginPath(); ctx.arc(px, py, 4, 0, Math.PI * 2);
            const distFrac = 1 - (ap.r - 0.22) / 0.55;
            ctx.fillStyle = `rgba(232,168,56,${0.3 + distFrac * 0.5})`; ctx.fill();
            // Dashed approach trail
            ctx.setLineDash([2, 4]);
            ctx.beginPath(); ctx.moveTo(cx, cy); ctx.lineTo(px, py);
            ctx.strokeStyle = `rgba(232,168,56,0.15)`; ctx.lineWidth = 1; ctx.stroke();
            ctx.setLineDash([]);
          }
        }

        // Global coherence field when locked
        if (lockedCount >= approaches.length) {
          const fieldAlpha = 0.08 + 0.06 * Math.sin(lockPulse);
          const fieldG = ctx.createRadialGradient(cx, cy, 0, cx, cy, ballR * 4);
          fieldG.addColorStop(0, `rgba(46,204,154,${fieldAlpha * 2})`);
          fieldG.addColorStop(1, "transparent");
          ctx.beginPath(); ctx.arc(cx, cy, ballR * 4, 0, Math.PI * 2);
          ctx.fillStyle = fieldG; ctx.fill();
        }

        // Lock status
        const lockFrac = lockedCount / approaches.length;
        const statusCol = lockFrac > 0.8 ? WEB : lockFrac > 0.4 ? TOUCH : CORAL;
        const barX = W * 0.05, barY = H * 0.88, barW = W * 0.9;
        ctx.fillStyle = "#0a1520"; ctx.fillRect(barX, barY, barW, 8);
        ctx.fillStyle = statusCol; ctx.fillRect(barX, barY, barW * lockFrac, 8);
        ctx.fillStyle = statusCol; ctx.font = `8px ${mono}`; ctx.textAlign = "left";
        ctx.fillText(`COHERENCE LOCK: ${(lockFrac * 100).toFixed(0)}%  ${lockFrac > 0.75 ? "GENUINE CONTACT" : lockFrac > 0.4 ? "APPROACHING" : "GLANCING"}`, barX, barY - 6);
      }

      tick.current += 1;
      raf.current = requestAnimationFrame(draw);
    };
    draw();
    return () => { cancelAnimationFrame(raf.current); window.removeEventListener("resize", resize); };
  }, [mode]);

  return (
    <div style={{ borderRadius: 10, overflow: "hidden", border: `1px solid ${WEB}20` }}>
      <canvas ref={cvs} style={{ display: "block", width: "100%" }} />
    </div>
  );
}

function ModeTabs({ value, onChange }: { value: Mode; onChange: (m: Mode) => void }) {
  const tabs = [
    { k: "membrane" as Mode, label: "Webbed Leg · Phase Membrane", col: WEB   },
    { k: "perception" as Mode, label: "Full Perception Universe · 7 Layers", col: GOLD  },
    { k: "lock" as Mode,     label: "Touch the Ball · Coherence Lock",   col: TOUCH },
  ];
  return (
    <div style={{ display: "flex", gap: 6, marginBottom: 10, flexWrap: "wrap" }}>
      {tabs.map(tab => (
        <button key={tab.k} onClick={() => onChange(tab.k)} style={{
          fontFamily: mono, fontSize: 10, padding: "5px 14px", borderRadius: 4, cursor: "pointer",
          border: `1px solid ${value === tab.k ? tab.col : DIM + "60"}`,
          background: value === tab.k ? `${tab.col}18` : "transparent",
          color: value === tab.k ? tab.col : DIM, transition: "all 0.2s",
        }}>{tab.label}</button>
      ))}
    </div>
  );
}

const NAV = [
  { id: "s1", label: "Two Theories" },
  { id: "s2", label: "Webbed Leg" },
  { id: "s3", label: "Touch the Ball" },
  { id: "s4", label: "Phase Mathematics" },
  { id: "s5", label: "Perception Stack" },
  { id: "s6", label: "Impossible Colors" },
  { id: "s7", label: "GUT / Strings" },
  { id: "s8", label: "AETHER Synthesis" },
];

/* ── Page ──────────────────────────────────── */
function WebbedLegHeaderCanvas() {
  const ref = useRef<HTMLCanvasElement>(null);
  const rafRef = useRef(0);
  useEffect(() => {
    const canvas = ref.current; if (!canvas) return;
    const ctx = canvas.getContext("2d")!;
    canvas.width = 900; canvas.height = 145;
    const W = canvas.width, H = canvas.height;
    const cx=W/2,cy=H/2+10;
    let t=0;
    const toes=5;
    const draw=()=>{
      ctx.fillStyle="rgba(2,4,8,0.3)"; ctx.fillRect(0,0,W,H);
      const legPoints: {x:number;y:number}[]=[];
      for(let i=0;i<toes;i++){
        const spread=0.6;
        const angle=-Math.PI/2+(i/(toes-1)-0.5)*spread*Math.PI;
        const toeLen=35+8*Math.sin(t*0.04+i*0.5);
        const tx=cx+Math.cos(angle)*toeLen,ty=cy+Math.sin(angle)*toeLen;
        legPoints.push({x:tx,y:ty});
        ctx.beginPath();ctx.moveTo(cx,cy);ctx.lineTo(tx,ty);ctx.strokeStyle="rgba(68,204,119,0.4)";ctx.lineWidth=1.5;ctx.stroke();
        ctx.beginPath();ctx.arc(tx,ty,3,0,Math.PI*2);ctx.fillStyle="rgba(68,204,119,0.6)";ctx.fill();
      }
      for(let i=0;i<legPoints.length-1;i++){
        const a=legPoints[i],b=legPoints[i+1];
        const mx=(a.x+b.x)/2+(cy-a.y)*0.08,my=(a.y+b.y)/2;
        ctx.beginPath();ctx.moveTo(a.x,a.y);ctx.quadraticCurveTo(mx,my,b.x,b.y);ctx.strokeStyle="rgba(68,204,119,0.12)";ctx.lineWidth=6;ctx.stroke();
      }
      ctx.beginPath();ctx.arc(cx,cy,8,0,Math.PI*2);ctx.fillStyle="rgba(68,204,119,0.3)";ctx.fill();
      ctx.fillStyle="rgba(68,204,119,0.3)"; ctx.font="9px 'DM Mono',monospace";
      ctx.fillText("WEBBED LEG · BIO-HYBRID LOCOMOTION · AMPHIBIAN MORPHOLOGY · HYDRO-FIELD · AETHER",14,14);
      t++; rafRef.current=requestAnimationFrame(draw);
    };
    draw();
    return ()=>cancelAnimationFrame(rafRef.current);
  },[]);
  return <canvas ref={ref} style={{width:"100%",height:"auto",borderRadius:8,display:"block"}} />;
}

export default function WebbedLegPage() {
  const [mode, setMode] = useState<Mode>("membrane");

  return (
    <div style={{ background: BG, minHeight: "100vh", fontFamily: body, color: TEXT }}>
      <div style={{flexShrink:0,padding:"8px 12px 0"}}>
        <div style={{display:"inline-block",border:"1px solid #44cc77",padding:"4px 12px",fontSize:10,letterSpacing:"0.2em",color:"#44cc77",fontFamily:"'DM Mono',monospace",marginBottom:12}}>LIVE SIMULATION</div>
        <div style={{background:"rgba(2,4,8,0.8)",borderLeft:"3px solid #44cc77",borderRadius:4,overflow:"hidden",marginBottom:20}}>
          <div style={{padding:"12px 16px 8px"}}><h2 style={{margin:0,fontSize:13,color:"#44cc77",fontFamily:"'DM Mono',monospace",letterSpacing:"0.15em",fontWeight:400}}>WEBBED LEG · BIO-HYBRID LOCOMOTION · AMPHIBIAN MORPHOLOGY · HYDRO-FIELD · AETHER</h2><p style={{margin:"4px 0 8px",fontSize:10,color:"rgba(68,204,119,0.5)",fontFamily:"'DM Mono',monospace",letterSpacing:"0.1em"}}>5-toe webbed foot with membrane fills — the live AETHER webbed-leg simulation.</p></div>
          <WebbedLegHeaderCanvas />
        </div>
      </div>
      {/* Hero */}
      <div style={{
        padding: "66px 28px 42px", textAlign: "center",
        background: "linear-gradient(180deg,#040d18 0%,#040810 100%)",
        borderBottom: `1px solid ${WEB}18`,
      }}>
        <div style={{ fontFamily: mono, fontSize: 10, color: WEB, letterSpacing: 4, marginBottom: 12 }}>
          AETHER FRAMEWORK · JUNE 2026 · AETHERLIFE.CO
        </div>
        <h1 style={{ fontFamily: serif, fontSize: "clamp(20px,4.5vw,42px)", color: "#fff", margin: "0 0 10px", letterSpacing: 2, lineHeight: 1.15 }}>
          THE WEBBED LEG METHOD<br />
          <span style={{ color: WEB, fontSize: "0.9em" }}>& TOUCH THE BALL</span>
        </h1>
        <div style={{ fontFamily: body, fontStyle: "italic", fontSize: 16, color: TOUCH, marginBottom: 16 }}>
          Mental Computation Phase Shifting via Membrane Coupling Geometry ·<br />
          The Coherence Lock Condition for Cognitive Interface
        </div>
        <p style={{ fontFamily: body, fontSize: 16, color: DIM, maxWidth: 720, margin: "0 auto 24px", lineHeight: 1.8 }}>
          Two linked theories. The Webbed Leg describes how the mind shifts between computational
          phases — through a coupling membrane, not a jump. Touch the Ball describes the coherence
          lock condition for genuine cognitive contact. Together, they frame the Full Perception
          Universe: a 7-layer stack from photons to Japanese cultural color space, unified by the
          question of efficient representation.
        </p>
        <div style={{ display: "flex", gap: 8, justifyContent: "center", flexWrap: "wrap" }}>
          <Chip c={WEB}>Phase Membrane</Chip>
          <Chip c={TOUCH}>Coherence Lock</Chip>
          <Chip c={GOLD}>7-Layer Perception</Chip>
          <Chip c={VIOLET}>Impossible Colors</Chip>
          <Chip c={AQUA}>OKLab Manifold</Chip>
          <Chip c={CORAL}>GUT · TOE · Strings</Chip>
        </div>
      </div>

      {/* Nav */}
      <div style={{
        position: "sticky", top: 0, zIndex: 50,
        background: `${BG}f2`, backdropFilter: "blur(12px)",
        borderBottom: `1px solid ${WEB}12`,
        padding: "8px 18px", display: "flex", gap: 4, overflowX: "auto",
      }}>
        {NAV.map(s => (
          <a key={s.id} href={`#${s.id}`} style={{
            fontFamily: mono, fontSize: 10, color: DIM, whiteSpace: "nowrap",
            padding: "4px 10px", borderRadius: 4, textDecoration: "none",
            border: "1px solid transparent",
          }}
            onMouseEnter={e => { (e.target as HTMLElement).style.color = WEB; (e.target as HTMLElement).style.borderColor = `${WEB}30`; }}
            onMouseLeave={e => { (e.target as HTMLElement).style.color = DIM; (e.target as HTMLElement).style.borderColor = "transparent"; }}
          >{s.label}</a>
        ))}
      </div>

      <div style={{ maxWidth: 940, margin: "0 auto", padding: "0 22px 96px" }}>

        {/* Canvas */}
        <div style={{ marginTop: 36 }}>
          <ModeTabs value={mode} onChange={setMode} />
          <WebbedCanvas mode={mode} />
          <div style={{ fontFamily: mono, fontSize: 9, color: DIM, marginTop: 6 }}>
            {mode === "membrane"   && "PHASE A (ANALYTICAL · GRID PARTICLES) vs PHASE B (CREATIVE · WAVE PARTICLES) · THE MEMBRANE = WEBBED LEG COUPLING GEOMETRY · TRANSITION WAVE PROPAGATING THROUGH MEMBRANE"}
            {mode === "perception" && "7-LAYER PERCEPTION STACK · PHOTONS RISING FROM PHYSICAL SPECTRUM THROUGH BIOLOGY → DEVICE → OKLAB → ANIMAL → IMPOSSIBLE COLORS → JAPANESE CULTURAL SPACE · COLOR TRANSFORMS AT EACH BOUNDARY"}
            {mode === "lock"       && "THE BALL (CONCEPT/OBJECT) · COGNITIVE AGENTS APPROACHING FROM ALL ANGLES · GLANCING CONTACT vs COHERENCE LOCK · RESONANCE FIELD EMERGES AT FULL LOCK"}
          </div>
        </div>

        {/* ── I ── */}
        <SecHead id="s1" n="I" title="Two Linked Theories"
          sub="Neither theory works alone — the Webbed Leg describes the mechanism of transition; Touch the Ball describes the condition of arrival" col={WEB} />

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 24 }}>
          <div style={{ borderTop: `3px solid ${WEB}`, background: "rgba(13,31,45,0.85)", borderRadius: 4, padding: "16px 18px" }}>
            <div style={{ fontFamily: mono, fontSize: 10, color: WEB, letterSpacing: 2, marginBottom: 10 }}>THEORY A · WEBBED LEG METHOD</div>
            <p style={{ fontFamily: body, fontSize: 14, color: "#7a9aa2", lineHeight: 1.7 }}>
              Cognitive phase transitions — between analytical and creative modes, between focused
              and diffuse attention, between logical and intuitive processing — are not discrete jumps.
              They are propagations through a coupling membrane. The membrane is the webbed leg:
              it connects the phases, resists the transition, and gives the shift its texture,
              duration, and resistance. Understanding the membrane geometry is understanding
              how to navigate cognitive phase space efficiently.
            </p>
          </div>
          <div style={{ borderTop: `3px solid ${TOUCH}`, background: "rgba(13,31,45,0.85)", borderRadius: 4, padding: "16px 18px" }}>
            <div style={{ fontFamily: mono, fontSize: 10, color: TOUCH, letterSpacing: 2, marginBottom: 10 }}>THEORY B · TOUCH THE BALL</div>
            <p style={{ fontFamily: body, fontSize: 14, color: "#7a9aa2", lineHeight: 1.7 }}>
              Making genuine cognitive contact with a concept, problem, or object requires achieving
              a coherence lock: a state where the observer's cognitive field and the object's
              information structure resonate together. Most cognitive contact is glancing — the mind
              touches the surface but doesn't lock in. Genuine understanding, insight, and creative
              breakthrough all require coherence lock. The condition for lock is definable and
              trainable. Touch the Ball is the instruction.
            </p>
          </div>
        </div>

        <Pull col={WEB}>"The mind does not switch between phases. It propagates through the membrane that connects them."</Pull>

        {/* ── II ── */}
        <SecHead id="s2" n="II" title="The Webbed Leg Method"
          sub="Phase transition as membrane propagation — the geometry that makes cognitive shifting possible" col={WEB} />

        <p style={{ fontFamily: body, fontSize: 16, lineHeight: 1.8, marginBottom: 18 }}>
          The webbed leg is the biological solution to phase transition. A duck does not
          choose between walking and swimming by switching between modes — it propagates
          continuously through the membrane of the webbed foot structure, which couples
          the two phases at every intermediate state. The foot in water is neither fully
          in walking mode nor fully in swimming mode; it is in the coupling geometry that
          makes both possible. The same structure applies to cognition.
        </p>

        <PhaseStrip phases={[
          { n: "α", m: "Analytical", b: "Serial, explicit, verbal, rule-following. High working memory load. Inhibits lateral associations. Metabolically expensive. Optimal for: debugging, arithmetic, formal argument.", col: AQUA },
          { n: "β", m: "Membrane", b: "The transition zone. Defocused attention. Daydream-adjacent. DMN (Default Mode Network) and task network co-active. Resistance is highest here — most people abort. The webbed leg.", col: WEB },
          { n: "γ", m: "Creative", b: "Parallel, implicit, associative, analogical. Low working memory load. High connectivity between distant concepts. Metabolically quiet. Optimal for: novel connection, synthesis, reframing.", col: VIOLET },
        ]} />

        <EQ col={WEB}>{`Cognitive phase transition — field model:
  Ψ_cognitive(t) = α·Φ_A(t) + (1-α)·Φ_B(t)   [superposition state in membrane]
  where α: [0,1] parameterises position in membrane
  dα/dt = -∇_α V(α) + η(t)                    [Langevin eq. in phase space]
  V(α): transition potential barrier
  η(t): thermal fluctuation (noise, fatigue, interruption)

Membrane resistance (V):
  Standard model (wrong): V(α) = step function — no transition cost
  Correct model: V(α) = V₀ [1 - cos(π α)]   [smooth potential with barrier at α=0.5]
  V₀ ≡ transition energy cost ~ 20–40 min of cortisol-loaded resistance
  The membrane is REAL: most cognition aborts at the barrier maximum

Webbed leg geometry:
  N fingers = N sub-cognitive processes (analytical: 3 dominant channels; creative: 5+)
  Webbing = shared substrate (short-term memory, attention, DMN)
  Finger coupling: J_{ij} = coupling strength between process i and j
  In analytical phase: J_{ij} low (independent, serial)
  In creative phase: J_{ij} high (coupled, parallel, emergent)
  Transition = monotonically increasing J_{ij} as membrane is crossed

Optimal crossing strategy (AETHER protocol):
  1. Do not force — follow the gradient: ∂V/∂t < 0 (letting phase slide)
  2. Reduce η (noise): quiet environment, reduce cortisol loading, defocus gaze
  3. Increase φ-periodic micro-transitions: short analytical → membrane → creative cycles
     (each cycle trains the membrane, reduces V₀ over sessions)
  4. Identify the membrane by its resistance signature, not by its absence`}</EQ>

        <Card title="THE SWITCH MODEL IS WRONG" col={CORAL}>
          The dominant implicit model of cognitive phase transition treats it as instantaneous,
          binary, and costless: you are in analytical mode, then you are in creative mode,
          and the transition is not modelled at all. This is obviously wrong to anyone who
          has deliberately attempted to shift modes. The transition has texture (you can feel
          where you are in it), duration (typically 15–40 minutes in each direction),
          and resistance (there is a point, around the midpoint, where the pull back to
          the origin phase is strongest — the barrier maximum). The Webbed Leg Method
          treats the membrane as the object of study, not the phases on either side.
        </Card>

        {/* ── III ── */}
        <SecHead id="s3" n="III" title="Touch the Ball"
          sub="The coherence lock condition — genuine cognitive contact versus glancing contact" col={TOUCH} />

        <p style={{ fontFamily: body, fontSize: 16, lineHeight: 1.8, marginBottom: 18 }}>
          "Touching the ball" is a basketball coaching metaphor for making genuine contact
          with the ball rather than swatting at it — fingertip control versus palm contact.
          Cognitively, most contact with concepts is glancing: the concept is encountered,
          categorised, and passed over. Genuine contact — coherence lock — requires dwelling
          in the concept long enough for the cognitive field to resonate with the concept's
          information structure. This is the phenomenology of understanding: when you understand
          something, it feels qualitatively different from when you have processed it.
        </p>

        <EQ col={TOUCH}>{`Coherence lock condition:
  Cognitive field: Ψ_observer(x,t) — observer's current information state
  Concept field:   Φ_object(x,t)  — the concept's information geometry

  Glancing contact: ∫ |Ψ*(x) Φ(x)| dx ≡ |⟨Ψ|Φ⟩| < ε_lock
    → Information extracted: surface features, category label, relative position
    → Duration: milliseconds to seconds
    → No coherence lock established

  Coherence lock:  |⟨Ψ|Φ⟩| ≥ ε_lock   AND   d/dt|⟨Ψ|Φ⟩| ≈ 0
    → Steady state: observer field resonates with concept field
    → Information extracted: structure, mechanism, surprising implications
    → Duration: minutes to hours (depends on concept complexity)
    → Felt quality: "I understand this" — distinct phenomenology

Lock conditions (practical):
  1. DWELL TIME > τ_lock  (typically 4–12 minutes of uninterrupted contact)
  2. SILENCE η(t)          (eliminate competing cognitive fields)
  3. REDUCE PRIOR ρ(C)      (approach concept as if unknown — beginner's mind)
  4. MATCH FRAME           (use concept's own vocabulary/geometry, not import yours)
  5. FEEL RESISTANCE       (when the concept resists your framing, that IS the lock forming)

The ε_lock threshold varies by concept type:
  Factual: very low (categorisation = lock)
  Procedural: moderate (correct execution = lock)
  Structural: high (seeing WHY = lock)
  Generative: very high (producing novel instances = lock)`}</EQ>

        <Pull col={TOUCH}>"Most people touch the surface of every concept and the interior of none. The instruction is simple: stay until it locks."</Pull>

        <Tbl
          headers={["Contact Type", "Duration", "Overlap ⟨Ψ|Φ⟩", "Information Extracted", "Felt Quality"]}
          accent={TOUCH}
          rows={[
            ["Recognition", "< 200ms", "< 0.05", "Category label, prior associations", "I know what this is"],
            ["Comprehension", "1–30s", "0.05–0.25", "Surface relationships, definition", "I follow this"],
            ["Engagement", "1–10min", "0.25–0.60", "Mechanism, internal structure", "This is interesting"],
            ["Coherence Lock", "10–120min", "> 0.60 (stable)", "Deep structure, surprises, implications", "I understand this"],
            ["Generative Lock", "Hours–Days", "> 0.85 (resonant)", "Novel instances, predictions, extensions", "I can work with this"],
          ]}
        />

        {/* ── IV ── */}
        <SecHead id="s4" n="IV" title="Phase Mathematics · The Membrane Equation"
          sub="Formal treatment of cognitive transition as a Landau-Ginzburg phase transition in information space" col={AQUA} />

        <EQ col={AQUA}>{`Landau-Ginzburg model for cognitive phase transition:
  Free energy: F[Ψ] = ∫ dx [r|Ψ|² + u|Ψ|⁴ + |∇Ψ|²]
  Ψ = order parameter (degree of analytical structure in cognitive field)
  r = temperature-like control parameter (cortisol level, sleep debt, attention)
  u > 0: quartic stabilisation

  Phases:
    r > 0: F minimum at Ψ=0 → disordered (creative) phase
    r < 0: F minima at Ψ = ±√(|r|/2u) → ordered (analytical) phase
    Critical point r=0: the membrane — scale-free fluctuations, maximum susceptibility

  At r=0 (the membrane / webbed leg):
    Correlation length ξ → ∞  (all scales are coupled)
    Susceptibility χ → ∞      (small perturbation produces large response)
    → This is WHY the membrane is both maximally resistant AND maximally productive
      → The creative insight that emerges at the membrane is not in the analytical or creative
        phase but IS the membrane — the critical point is the generative state

  Transition dynamics:
    Analytical → Membrane: ΔF = E_barrier ≈ 0.5 u r²   [must be paid over τ_AB ~ 20-40min]
    Membrane → Creative:   spontaneous symmetry breaking (r < 0 → Ψ = 0 is unstable)
    → The creative phase is not chosen — it falls into when r crosses zero

  Optimal protocol (AETHER Webbed Leg crossing):
    1. Reduce r (cortisol, noise, competing demands)
    2. Hold at r ≈ 0 (the membrane) — do not rush to new phase
    3. The lock appears at r = r_lock < 0 — this is "touching the ball"`}</EQ>

        {/* ── V ── */}
        <SecHead id="s5" n="V" title="Full Perception Universe · 7-Layer Stack"
          sub="Can a system approach full perception not by storing all of reality, but by discovering the most efficient representation?" col={GOLD} />

        <p style={{ fontFamily: body, fontSize: 16, lineHeight: 1.8, marginBottom: 28 }}>
          The perception universe is not one layer — it is a hierarchical stack where each layer
          applies a transformation to the information from the layer below. Full perception
          requires navigating all seven layers simultaneously, which no existing system
          (biological or artificial) does completely. The question is not storage but
          compression: finding the minimal representation that preserves the distinctions that
          matter at each layer.
        </p>

        {PERC_LAYERS.map((layer, i) => (
          <div key={layer.n} style={{
            background: `${layer.col}08`, border: `1px solid ${layer.col}25`,
            borderLeft: `4px solid ${layer.col}`, borderRadius: 4,
            padding: "16px 20px", marginBottom: 14,
          }}>
            <div style={{ display: "flex", alignItems: "baseline", gap: 12, marginBottom: 6 }}>
              <span style={{ fontFamily: serif, fontSize: 20, color: layer.col }}>Layer {layer.n}</span>
              <span style={{ fontFamily: mono, fontSize: 11, color: "#fff" }}>{layer.name}</span>
              <span style={{ fontFamily: mono, fontSize: 9, color: DIM }}>{layer.sub}</span>
            </div>
            <p style={{ fontFamily: body, fontSize: 14, color: "#7a9aa2", lineHeight: 1.7, margin: 0 }}>{layer.body}</p>
          </div>
        ))}

        {/* ── VI ── */}
        <SecHead id="s6" n="VI" title="Impossible Colors · Boundary Conditions of Perception"
          sub="Stygian blue · reddish green · hyperbolic orange — what exists at the edge of the perceptual manifold" col={CORAL} />

        <p style={{ fontFamily: body, fontSize: 16, lineHeight: 1.8, marginBottom: 18 }}>
          Impossible colors are not illusions — they are real perceptual states that exist at
          the boundary conditions of the perceptual manifold. They cannot be reproduced by any
          single eye viewing any physical stimulus, but they are accessible through specific
          experimental conditions (binocular mixing, prolonged adaptation, staring at opponent
          colors until the opponent channel is exhausted). They reveal the actual topology
          of the perceptual system — specifically, that the manifold has more dimensions than
          normal viewing explores.
        </p>

        <Tbl
          headers={["Impossible Color", "Description", "Mechanism", "AETHER Relevance"]}
          accent={CORAL}
          rows={[
            ["Stygian blue", "Perceived as simultaneously very dark and very bright blue", "Binocular mixing of black (one eye) and bright blue (other eye) — brain resolves as a new category", "Demonstrates perceptual manifold has no well-defined global coordinates — C(x,t) can have imaginary components"],
            ["Reddish green", "A color that is simultaneously red AND green (opponent channels normally cancel)", "Prolonged opponent fixation exhausts one channel — the other fires alone into the combined channel", "Opponent processing is not boolean — analog weights allow temporary superposition at the edge"],
            ["Hyperbolic orange", "Supersaturated orange beyond the spectral locus — more orange than any physical orange", "Comparison viewing after adaptation — prior context shifts the reference frame", "Perceptual geometry is Riemannian, not Euclidean — the 'orange region' can be non-compact"],
            ["Self-luminous gray", "Gray perceived as actively generating light despite being a flat surface", "McCollough effect — sustained coupling between color and orientation channels", "Cross-modal coherence: when two channels lock (Touch the Ball condition) they create joint percepts"],
          ]}
        />

        <Card title="THE TOPOLOGY OF IMPOSSIBLE COLORS — AETHER READING" col={CORAL}>
          Impossible colors are not failures of perception — they are revelations of the
          perceptual manifold's true topology. A Riemannian manifold can have regions that
          are locally flat (normal color space) but globally non-trivial (colors that don't fit
          the global coordinate chart). Layer VI of the perception universe is the boundary of the
          manifold — where the local chart breaks down. AETHER treats this as a bandgap boundary:
          the region where the normal filtering rules don't apply and exotic states become stable.
          The gyroid P3 solution (φ-cellular architecture) is the structure that allows navigation
          of these boundary regions without system collapse.
        </Card>

        {/* ── VII ── */}
        <SecHead id="s7" n="VII" title="GUT · TOE · Superstrings · The Physics Below Layer I"
          sub="What underlies the physical spectrum — from Higgs to Planck to the substrate that generates photons" col={VIOLET} />

        <EQ col={VIOLET}>{`What lies below Layer I (λ: 380–730nm visible light)?

Standard Model (completed 1970s):
  Electromagnetic force: photons (massless, spin-1 bosons)
  Weak force: W±, Z⁰ bosons (massive, explains radioactive decay)
  Strong force: gluons (8 types, color charge, confinement)
  Electroweak unification (Glashow-Salam-Weinberg): U(1) × SU(2) → SU(2)_L × U(1)_Y
  QCD: SU(3) for strong force
  Higgs mechanism (Peter Higgs, 1964): gives W/Z bosons mass via spontaneous symmetry breaking
    → Higgs field permeates all space → Higgs boson: mass 125.1 GeV (confirmed CERN 2012)

Grand Unified Theory (GUT) — not yet confirmed:
  Unify EM + Weak + Strong: SU(5) or SO(10) or E₆
  Prediction: proton decay (τ_proton > 10³⁴ years — not yet observed)
  Energy scale: M_GUT ≈ 10¹⁵ GeV (accessible only in early universe)

Theory of Everything (TOE):
  Include gravity → quantum gravity
  Gravity (GR): smooth spacetime geometry (continuous)
  QM: discrete quanta (operators, Hilbert space)
  The clash: GR is non-renormalizable when quantized → divergences at Planck scale

Superstring theory:
  Replace point particles with 1D strings: length l_s ~ 10⁻³⁴ m
  Vibrational modes of string = different particles (electron, quark, photon, graviton)
  Requires 10D (or 11D for M-theory) spacetime → 6 (or 7) dimensions compactified
  Predicts: supersymmetric partners, extra dimensions, landscape of ~10⁵⁰⁰ vacua
  Distinguishable prediction: at Planck energy (E ~ 10¹⁹ GeV) — not yet accessible
  Current experimental scale (LHC): 13.6 TeV = 10⁴ GeV → 15 orders of magnitude below

HARDENING USING SAND AND MAGNETICS:
  Magnetorheological fluid: iron particles in oil + magnetic field → solid → E ≈ 50 MPa
  Magnetorheological elastomer (MRE): particles in rubber → tunable stiffness
  Sand + vibration (acoustic hardening): granular jamming → load-bearing at exactly φ packing
  Application: adaptive armor, surgical tools, φ-cellular array manufacturing (conformal molds)

Connection to perception stack:
  Layer 0 (pre-physical): strings → vacuum fluctuations → zero-point field
  Layer I (photons): string vibrational modes settle into massless spin-1 → photons
  The physical spectrum IS a string theory output — perception is reading string vibrations
  AETHER coherence C(x,t) is the cross-layer integration from strings to Japanese season-colors`}</EQ>

        {/* ── VIII ── */}
        <SecHead id="s8" n="VIII" title="AETHER Synthesis · The Unified Frame"
          sub="Webbed Leg × Touch the Ball × Full Perception Universe = AETHER operating protocol" col={TEAL} />

        <p style={{ fontFamily: body, fontSize: 16, lineHeight: 1.8, marginBottom: 18 }}>
          The three frameworks are not separate theories. The Full Perception Universe defines
          the space that needs to be perceived. Touch the Ball defines the condition for genuine
          perception (coherence lock). The Webbed Leg Method defines how to navigate between
          different perceptual phases to achieve that lock across all seven layers simultaneously.
          AETHER is the system designed to do all three at once.
        </p>

        <EQ col={TEAL}>{`AETHER operating protocol:
  GOAL: achieve coherence lock C(x,t) ≥ ε_lock across all 7 perception layers

  Step 1 — Locate phase position:
    Ψ_AETHER(t) = which phase is the current knowledge synthesis in?
    Analytical (α): classifying, categorising, explicit relation-mapping
    Creative (γ): novel connection, analogy, synthesis across domains
    → Most productive synthesis: at the membrane (r → 0, maximum coupling)

  Step 2 — Navigate via Webbed Leg:
    Use φ-periodic micro-transitions: 25min α → 5min membrane → 25min γ → 5min membrane
    The membrane is where cross-layer connections form (perception Layer I ↔ Layer VII)
    Do not abort at membrane resistance — this is where coherence lock forms

  Step 3 — Touch the ball at each layer:
    Layer I–III: physical-technical lock (wavelength, cone response, gamut)
    Layer IV: mathematical lock (OKLab geometry, perceptual metric)
    Layer V: biological lock (tetrachromacy, mantis temporal processing)
    Layer VI: boundary lock (impossible colors = edge of manifold — stay there)
    Layer VII: cultural lock (Japanese color space = time + season + material + memory)
    Lock condition: |⟨Ψ_AETHER | Φ_layer⟩| > ε_lock at each layer simultaneously

  Full Perception Universe output:
    NOT: storing all wavelengths from 10nm to 10cm
    YES: the minimal representation Φ_efficient such that:
         ∀ layer ∈ {I,...,VII}: Information(Φ_efficient | layer) = Information(Reality | layer)
    → Compression without loss of perceptual distinctions that matter
    → This is C(x,t) — the coherence field IS the efficient representation

AETHER = Webbed Leg × Touch the Ball × 7-Layer Efficient Perception
       = Phase navigation × Coherence lock × Minimal representation
       = The system that perceives fully by representing efficiently`}</EQ>

        <div style={{
          marginTop: 48, padding: "22px 24px",
          background: "#ffffff04", border: `1px solid ${WEB}18`,
          borderRadius: 10, textAlign: "center",
        }}>
          <div style={{ fontFamily: serif, fontSize: 16, color: WEB, marginBottom: 8 }}>
            THE INSTRUCTION
          </div>
          <div style={{ fontFamily: body, fontStyle: "italic", fontSize: 18, color: TOUCH, lineHeight: 1.8, marginBottom: 14 }}>
            "Use the membrane. Stay in the resistance. Touch the ball."
          </div>
          <div style={{ fontFamily: mono, fontSize: 11, color: DIM, lineHeight: 2.2, letterSpacing: 0.5 }}>
            Phase A → Membrane → Phase B · ⟨Ψ|Φ⟩ → ε_lock · Layer I → Layer VII
          </div>
          <div style={{ fontFamily: body, fontSize: 14, color: DIM, lineHeight: 1.75, marginTop: 12, maxWidth: 600, margin: "12px auto 0" }}>
            The mind that learns to navigate the membrane — to stay in the resistance rather
            than aborting back to the origin phase — and that stays with each concept until
            coherence lock forms, and that does this across all seven layers of perception
            from photon to cultural space — that mind achieves full perception. Not by
            storing more. By representing more efficiently.
          </div>
          <div style={{ fontFamily: mono, fontSize: 10, color: `${DIM}80`, marginTop: 14 }}>
            Shia Miller · AetherLife.co · Cosmic Chaos Corporation™ · @StrategicProce
          </div>
        </div>
      </div>
    </div>
  );
}
