import { useEffect, useRef, useState } from "react";

/* ── Palette ─────────────────────────────── */
const BG    = "#020408";
const TEAL  = "#0d7377";
const AQUA  = "#14bdac";
const GOLD  = "#c9a84c";
const CORAL = "#e05c4b";
const WEB   = "#2ecc9a";
const TOUCH = "#e8a838";
const VIOLET= "#9b59b6";
const BLUE  = "#1a9fd4";
const ROSE  = "#e05c9a";
const DIM   = "#4a6a78";
const TEXT  = "#d8e8ec";

const mono  = "'Space Mono', monospace";
const serif = "'Cinzel', serif";
const body  = "'Crimson Pro', Georgia, serif";

/* ── 8 Bands ─────────────────────────────── */
const BANDS_8 = [
  { id: "logic",   label: "Logic",            fn: "Analysis",                col: BLUE,   hex: "#1a9fd4" },
  { id: "emotion", label: "Emotion",           fn: "Valuation",               col: CORAL,  hex: "#e05c4b" },
  { id: "memory",  label: "Memory",            fn: "Persistence",             col: AQUA,   hex: "#14bdac" },
  { id: "intuition",label:"Intuition",         fn: "Rapid Synthesis",         col: VIOLET, hex: "#9b59b6" },
  { id: "imagin",  label: "Imagination",       fn: "Novel Generation",        col: ROSE,   hex: "#e05c9a" },
  { id: "social",  label: "Social Cognition",  fn: "Relationship Modelling",  col: WEB,    hex: "#2ecc9a" },
  { id: "spatial", label: "Spatial Awareness", fn: "Geometry & Structure",    col: TOUCH,  hex: "#e8a838" },
  { id: "sensory", label: "Sensory",           fn: "Environmental Input",     col: GOLD,   hex: "#c9a84c" },
];

/* 8→16: each band bifurcates */
const BIFURCATIONS: Record<string, [string, string]> = {
  logic:    ["Analytical Logic",    "Systems Logic"   ],
  emotion:  ["Personal Emotion",    "Social Emotion"  ],
  memory:   ["Episodic Memory",     "Semantic Memory" ],
  intuition:["Somatic Intuition",   "Structural Intuition"],
  imagin:   ["Divergent Imagination","Convergent Imagination"],
  social:   ["Dyadic Cognition",    "Group Cognition" ],
  spatial:  ["Egocentric Space",    "Allocentric Space"],
  sensory:  ["Internal Sensation",  "External Sensation"],
};

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

/* ══════════════════════════════════════════
   CANVAS — 3 MODES
══════════════════════════════════════════ */
type Mode = "bands" | "decohere" | "flow";

function CognitiveBandsCanvas({ mode }: { mode: Mode }) {
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
      canvas.height = Math.min(380, Math.round(p.clientWidth * 0.48));
    };
    resize();
    window.addEventListener("resize", resize);

    /* -- Bands canvas state -- */
    let expand = false;
    let expandT = 0;   // 0 = 8-mode, 1 = 16-mode
    const expandInterval = setInterval(() => {
      expand = !expand;
    }, 4000);

    /* -- Decoherence: photon double slit -- */
    const PHOTON_N = 120;
    const photons = Array.from({ length: PHOTON_N }, (_, i) => ({
      x: 0.05 + Math.random() * 0.02,
      y: 0.1 + Math.random() * 0.8,
      vx: 0.003 + Math.random() * 0.002,
      vy: (Math.random() - 0.5) * 0.002,
      alive: true,
      col: i % 3 === 0 ? AQUA : i % 3 === 1 ? VIOLET : BLUE,
    }));
    let measureMode = false;
    const measureInterval = setInterval(() => { measureMode = !measureMode; }, 3500);
    // Landing screen
    const LAND_W = 200, LAND_H_SLOTS = 60;
    const landCounts = new Array(LAND_H_SLOTS).fill(0);

    /* -- Flow canvas: Sun → Identity -- */
    const FLOW_LAYERS = [
      { label: "SUN ENERGY",          col: TOUCH,  sub: "1.361 kW/m² TSI" },
      { label: "ATMOSPHERIC GRADIENTS", col: GOLD, sub: "Hadley / Ferrel / Polar cells" },
      { label: "CLOUD FORMATION",     col: BLUE,   sub: "Nucleation around aerosols" },
      { label: "RAIN FLOW",           col: AQUA,   sub: "Surface curvature routing" },
      { label: "INFORMATION GRADIENTS",col: WEB,   sub: "Gradient → attention routing" },
      { label: "ATTENTION FLOW",      col: VIOLET, sub: "Measurement → collapse" },
      { label: "MEMORY FORMATION",    col: ROSE,   sub: "Persistence from stable patterns" },
      { label: "IDENTITY STRUCTURE",  col: GOLD,   sub: "Quasi-affine oscillation attractor" },
    ];
    const flowDrops = Array.from({ length: 40 }, (_, i) => ({
      x: 0.15 + Math.random() * 0.7,
      layer: Math.random() * 8,
      speed: 0.004 + Math.random() * 0.003,
    }));

    const draw = () => {
      const W = canvas.width, H = canvas.height;
      const t = tick.current;
      ctx.clearRect(0, 0, W, H);
      ctx.fillStyle = BG; ctx.fillRect(0, 0, W, H);

      /* ══ BANDS 8→16 ══ */
      if (mode === "bands") {
        if (expand && expandT < 1) expandT = Math.min(1, expandT + 0.012);
        if (!expand && expandT > 0) expandT = Math.max(0, expandT - 0.012);

        const cx = W / 2, cy = H / 2;
        const R8 = Math.min(W, H) * 0.33;
        const R16 = Math.min(W, H) * 0.30;

        // Label
        ctx.fillStyle = expandT > 0.5 ? `${ROSE}cc` : `${AQUA}cc`;
        ctx.font = `9px ${mono}`; ctx.textAlign = "center";
        ctx.fillText(expandT > 0.5 ? "16 BANDS · 64 INTERACTION MATRIX" : "8 MENTAL BANDS · STANDING WAVES", cx, 18);

        // Draw connections between all 8 nodes first
        const nodes8 = BANDS_8.map((b, i) => {
          const a = (i / 8) * Math.PI * 2 - Math.PI / 2;
          return { x: cx + Math.cos(a) * R8, y: cy + Math.sin(a) * R8, col: b.col };
        });

        // Connections
        for (let i = 0; i < 8; i++) {
          for (let j = i + 1; j < 8; j++) {
            const pulse = 0.5 + 0.5 * Math.sin(t * 0.04 + i * 0.7 + j * 0.4);
            const alpha = (0.04 + 0.06 * pulse) * (1 - expandT * 0.5);
            ctx.beginPath();
            ctx.moveTo(nodes8[i].x, nodes8[i].y);
            ctx.lineTo(nodes8[j].x, nodes8[j].y);
            ctx.strokeStyle = `rgba(13,115,119,${alpha})`;
            ctx.lineWidth = 0.8;
            ctx.stroke();
          }
        }

        // If expanding, draw 16 nodes
        const nodes16: { x: number; y: number; col: string }[] = [];
        if (expandT > 0.01) {
          BANDS_8.forEach((b, i) => {
            const a = (i / 8) * Math.PI * 2 - Math.PI / 2;
            const spread = expandT * 0.08;
            for (let k = 0; k < 2; k++) {
              const ak = a + (k === 0 ? -spread : spread);
              nodes16.push({
                x: cx + Math.cos(ak) * R16,
                y: cy + Math.sin(ak) * R16,
                col: b.col,
              });
            }
          });

          // 16-node connections (subset)
          for (let i = 0; i < nodes16.length; i++) {
            for (let j = i + 1; j < nodes16.length; j += 3) {
              const pulse = 0.5 + 0.5 * Math.sin(t * 0.035 + i * 0.3 + j * 0.2);
              ctx.beginPath();
              ctx.moveTo(nodes16[i].x, nodes16[i].y);
              ctx.lineTo(nodes16[j].x, nodes16[j].y);
              ctx.strokeStyle = `rgba(155,89,182,${0.03 + 0.05 * pulse * expandT})`;
              ctx.lineWidth = 0.6;
              ctx.stroke();
            }
          }

          // 16 nodes
          nodes16.forEach((n, i) => {
            ctx.beginPath(); ctx.arc(n.x, n.y, 4.5, 0, Math.PI * 2);
            ctx.fillStyle = `${n.col}${Math.round(expandT * 200).toString(16).padStart(2, "0")}`;
            ctx.fill();
            // micro glow
            const g = ctx.createRadialGradient(n.x, n.y, 0, n.x, n.y, 12);
            g.addColorStop(0, `${n.col}${Math.round(expandT * 80).toString(16).padStart(2, "0")}`);
            g.addColorStop(1, "transparent");
            ctx.beginPath(); ctx.arc(n.x, n.y, 12, 0, Math.PI * 2);
            ctx.fillStyle = g; ctx.fill();
          });
        }

        // Draw 8 primary nodes
        nodes8.forEach((n, i) => {
          const b = BANDS_8[i];
          const nr = 8 - expandT * 3;
          // Glow
          const g = ctx.createRadialGradient(n.x, n.y, 0, n.x, n.y, 22);
          g.addColorStop(0, `${n.col}40`); g.addColorStop(1, "transparent");
          ctx.beginPath(); ctx.arc(n.x, n.y, 22, 0, Math.PI * 2);
          ctx.fillStyle = g; ctx.fill();
          // Node
          ctx.beginPath(); ctx.arc(n.x, n.y, nr, 0, Math.PI * 2);
          ctx.fillStyle = n.col + "dd"; ctx.fill();
          // Label
          const la = (i / 8) * Math.PI * 2 - Math.PI / 2;
          const lx = cx + Math.cos(la) * (R8 + 28);
          const ly = cy + Math.sin(la) * (R8 + 28);
          ctx.fillStyle = n.col + "cc"; ctx.font = `8px ${mono}`; ctx.textAlign = "center";
          ctx.fillText(b.label, lx, ly);
        });

        // Centre hub glow
        const hubG = ctx.createRadialGradient(cx, cy, 0, cx, cy, 28);
        hubG.addColorStop(0, `rgba(20,189,172,${0.15 + 0.08 * Math.sin(t * 0.05)})`);
        hubG.addColorStop(1, "transparent");
        ctx.beginPath(); ctx.arc(cx, cy, 28, 0, Math.PI * 2); ctx.fillStyle = hubG; ctx.fill();
        ctx.beginPath(); ctx.arc(cx, cy, 6, 0, Math.PI * 2);
        ctx.fillStyle = AQUA + "aa"; ctx.fill();

        // Count label in centre
        ctx.fillStyle = "#fff8"; ctx.font = `bold 16px ${mono}`; ctx.textAlign = "center";
        ctx.fillText(expandT > 0.5 ? "16" : "8", cx, cy + 6);
        ctx.fillStyle = `${DIM}cc`; ctx.font = `7px ${mono}`;
        ctx.fillText("BANDS", cx, cy + 20);
      }

      /* ══ DECOHERENCE / DOUBLE SLIT ══ */
      else if (mode === "decohere") {
        // Barrier
        const barrierX = W * 0.42;
        const slitY1 = H * 0.38, slitY2 = H * 0.62, slitH = H * 0.07;
        ctx.fillStyle = "#0a1a28";
        ctx.fillRect(barrierX - 4, 0, 8, slitY1 - slitH / 2);
        ctx.fillRect(barrierX - 4, slitY1 + slitH / 2, 8, slitY2 - slitH / 2 - slitY1 - slitH / 2);
        ctx.fillRect(barrierX - 4, slitY2 + slitH / 2, 8, H - slitY2 - slitH / 2);
        ctx.strokeStyle = `${TEAL}80`; ctx.lineWidth = 1;
        ctx.strokeRect(barrierX - 4, 0, 8, slitY1 - slitH / 2);
        ctx.strokeRect(barrierX - 4, slitY1 + slitH / 2, 8, slitY2 - slitH / 2 - slitY1 - slitH / 2);
        ctx.strokeRect(barrierX - 4, slitY2 + slitH / 2, 8, H - slitY2 - slitH / 2);

        // Slit labels
        ctx.fillStyle = `${GOLD}90`; ctx.font = `7px ${mono}`; ctx.textAlign = "center";
        ctx.fillText("SLIT 1", barrierX, slitY1);
        ctx.fillText("SLIT 2", barrierX, slitY2);

        // Screen
        const screenX = W * 0.88;
        ctx.strokeStyle = `${VIOLET}40`; ctx.lineWidth = 1;
        ctx.beginPath(); ctx.moveTo(screenX, 0); ctx.lineTo(screenX, H); ctx.stroke();
        ctx.fillStyle = `${VIOLET}70`; ctx.font = `7px ${mono}`; ctx.textAlign = "center";
        ctx.fillText(measureMode ? "OBSERVATION SCREEN · PARTICLE PATTERN" : "SCREEN · INTERFERENCE PATTERN", screenX, 14);

        // Update photons
        for (const p of photons) {
          if (!p.alive) continue;
          p.x += p.vx; p.y += p.vy;
          // At barrier
          if (p.x * W >= barrierX - 4 && p.x * W <= barrierX + 4) {
            const py = p.y * H;
            const inSlit1 = py > slitY1 - slitH / 2 && py < slitY1 + slitH / 2;
            const inSlit2 = py > slitY2 - slitH / 2 && py < slitY2 + slitH / 2;
            if (!inSlit1 && !inSlit2) {
              p.x = 0.05; p.y = 0.1 + Math.random() * 0.8;
              p.vx = 0.003 + Math.random() * 0.002;
              p.vy = (Math.random() - 0.5) * 0.002;
              continue;
            }
            // After slit — diverge
            if (!measureMode) {
              p.vy += (Math.random() - 0.5) * 0.006; // wave diffraction
            } else {
              // measurement collapses to particle — straight shot
              p.vy *= 0.2;
            }
          }

          // Screen landing
          if (p.x * W >= screenX - 3) {
            const slot = Math.floor((p.y * H / H) * LAND_H_SLOTS);
            if (slot >= 0 && slot < LAND_H_SLOTS) landCounts[slot] = Math.min(20, landCounts[slot] + 1);
            p.x = 0.05; p.y = 0.1 + Math.random() * 0.8;
            p.vx = 0.003 + Math.random() * 0.002;
            p.vy = (Math.random() - 0.5) * 0.002;
          }
          if (p.x > 1 || p.y < 0 || p.y > 1) {
            p.x = 0.05; p.y = 0.1 + Math.random() * 0.8;
            p.vx = 0.003 + Math.random() * 0.002;
            p.vy = (Math.random() - 0.5) * 0.002;
          }

          // Draw
          ctx.beginPath(); ctx.arc(p.x * W, p.y * H, 2, 0, Math.PI * 2);
          ctx.fillStyle = `${p.col}cc`; ctx.fill();
        }

        // Interference / particle pattern on screen
        const maxC = Math.max(...landCounts, 1);
        for (let s = 0; s < LAND_H_SLOTS; s++) {
          const sy = (s / LAND_H_SLOTS) * H;
          const barH = H / LAND_H_SLOTS - 1;
          const intensity = landCounts[s] / maxC;
          if (!measureMode) {
            // Interference: colour by y-position (fringe pattern)
            const fringeY = s - LAND_H_SLOTS / 2;
            const interference = Math.cos(fringeY * 0.45) ** 2 * intensity;
            ctx.fillStyle = `rgba(20,189,172,${interference * 0.5})`;
          } else {
            // Particle: two blobs
            const fromSlit1 = Math.exp(-Math.pow((s - LAND_H_SLOTS * 0.38), 2) / 40) * intensity;
            const fromSlit2 = Math.exp(-Math.pow((s - LAND_H_SLOTS * 0.62), 2) / 40) * intensity;
            const val = Math.max(fromSlit1, fromSlit2);
            ctx.fillStyle = `rgba(224,92,75,${val * 0.7})`;
          }
          ctx.fillRect(screenX, sy, 12, barH);
        }

        // Labels
        ctx.fillStyle = `${GOLD}80`; ctx.font = `8px ${mono}`; ctx.textAlign = "left";
        ctx.fillText("COGNITION = WAVE", W * 0.05, H * 0.08);
        ctx.fillStyle = `${measureMode ? CORAL : WEB}90`; ctx.font = `8px ${mono}`;
        ctx.fillText(measureMode ? "ATTENTION = MEASURING · INTERFERENCE DESTROYED" : "NO MEASUREMENT · INTERFERENCE INTACT", W * 0.05, H * 0.92);

        // Mode indicator
        ctx.fillStyle = measureMode ? `${CORAL}cc` : `${WEB}cc`;
        ctx.font = `9px ${mono}`; ctx.textAlign = "center";
        ctx.fillText(measureMode ? "⚡ ATTENTION ON · WAVE COLLAPSED TO PARTICLE" : "〰 DIFFUSE ATTENTION · WAVE INTERFERENCE ACTIVE", W / 2, H - 8);
      }

      /* ══ SUN → IDENTITY FLOW ══ */
      else if (mode === "flow") {
        const N = FLOW_LAYERS.length;
        const layerH = H / N;

        // Draw layers
        for (let i = 0; i < N; i++) {
          const ly = i * layerH;
          const fl = FLOW_LAYERS[i];
          const pulse = 0.08 + 0.04 * Math.sin(t * 0.03 + i * 0.6);
          // background band
          ctx.fillStyle = `${fl.col}${Math.round(pulse * 255).toString(16).padStart(2, "0")}`;
          ctx.fillRect(0, ly, W, layerH);
          // divider
          if (i < N - 1) {
            ctx.strokeStyle = `${fl.col}30`; ctx.lineWidth = 1;
            ctx.beginPath(); ctx.moveTo(0, ly + layerH); ctx.lineTo(W, ly + layerH); ctx.stroke();
          }
          // layer label
          ctx.fillStyle = fl.col + "dd"; ctx.font = `9px ${mono}`; ctx.textAlign = "left";
          ctx.fillText(fl.label, 12, ly + layerH / 2 - 4);
          ctx.fillStyle = `${DIM}cc`; ctx.font = `8px ${mono}`;
          ctx.fillText(fl.sub, 12, ly + layerH / 2 + 10);
          // Arrow
          if (i < N - 1) {
            ctx.fillStyle = fl.col + "60"; ctx.font = `10px ${mono}`; ctx.textAlign = "right";
            ctx.fillText("↓", W - 12, ly + layerH - 4);
          }
        }

        // Animated drops
        for (const d of flowDrops) {
          d.layer += d.speed;
          if (d.layer >= N) d.layer = 0;
          const ly = (d.layer / N) * H;
          const layerIdx = Math.floor(d.layer);
          const fl = FLOW_LAYERS[Math.min(layerIdx, N - 1)];
          const frac = d.layer - layerIdx;
          const alpha = 0.4 + 0.5 * Math.sin(frac * Math.PI);
          // cross-layer glow
          ctx.beginPath(); ctx.arc(d.x * W, ly, 4, 0, Math.PI * 2);
          ctx.fillStyle = `${fl.col}${Math.round(alpha * 200).toString(16).padStart(2, "0")}`;
          ctx.fill();
          if (frac < 0.1 || frac > 0.9) {
            const g = ctx.createRadialGradient(d.x * W, ly, 0, d.x * W, ly, 12);
            g.addColorStop(0, `${fl.col}60`); g.addColorStop(1, "transparent");
            ctx.beginPath(); ctx.arc(d.x * W, ly, 12, 0, Math.PI * 2);
            ctx.fillStyle = g; ctx.fill();
          }
        }

        // Sun glyph at top
        const sunX = W - 36, sunY = 22;
        const sunR = 12;
        ctx.beginPath(); ctx.arc(sunX, sunY, sunR, 0, Math.PI * 2);
        const sunG = ctx.createRadialGradient(sunX, sunY, 0, sunX, sunY, sunR);
        sunG.addColorStop(0, "#fff8c0"); sunG.addColorStop(1, TOUCH + "aa");
        ctx.fillStyle = sunG; ctx.fill();
        for (let r = 0; r < 8; r++) {
          const ra = (r / 8) * Math.PI * 2 + t * 0.01;
          ctx.beginPath();
          ctx.moveTo(sunX + Math.cos(ra) * (sunR + 3), sunY + Math.sin(ra) * (sunR + 3));
          ctx.lineTo(sunX + Math.cos(ra) * (sunR + 8), sunY + Math.sin(ra) * (sunR + 8));
          ctx.strokeStyle = TOUCH + "aa"; ctx.lineWidth = 1.5; ctx.stroke();
        }
      }

      tick.current += 1;
      raf.current = requestAnimationFrame(draw);
    };
    draw();
    return () => {
      cancelAnimationFrame(raf.current);
      clearInterval(expandInterval);
      clearInterval(measureInterval);
      window.removeEventListener("resize", resize);
    };
  }, [mode]);

  return (
    <div style={{ borderRadius: 10, overflow: "hidden", border: `1px solid ${WEB}20` }}>
      <canvas ref={cvs} style={{ display: "block", width: "100%" }} />
    </div>
  );
}

function ModeTabs({ value, onChange }: { value: Mode; onChange: (m: Mode) => void }) {
  const tabs = [
    { k: "bands"   as Mode, label: "8 → 16 Mental Bands",             col: AQUA  },
    { k: "decohere"as Mode, label: "Cognitive Decoherence · Double Slit", col: VIOLET},
    { k: "flow"    as Mode, label: "Sun → Identity · Unified Flow",    col: TOUCH },
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
  { id: "s1", label: "The Model" },
  { id: "s2", label: "8 Bands" },
  { id: "s3", label: "Decoherence" },
  { id: "s4", label: "8 → 16" },
  { id: "s5", label: "64 Matrix" },
  { id: "s6", label: "Quasi-Affine" },
  { id: "s7", label: "Sun as Antigen" },
  { id: "s8", label: "Unified Flow" },
  { id: "s9", label: "Trophy Exchange" },
  { id: "s10",label: "AETHER" },
];

/* ── Page ──────────────────────────────────── */
export default function CognitiveBandsPage() {
  const [mode, setMode] = useState<Mode>("bands");
  const [hoverBand, setHoverBand] = useState<string | null>(null);

  return (
    <div style={{ background: BG, minHeight: "100vh", fontFamily: body, color: TEXT }}>

      {/* Hero */}
      <div style={{
        padding: "66px 28px 42px", textAlign: "center",
        background: "linear-gradient(180deg,#030a14 0%,#020408 100%)",
        borderBottom: `1px solid ${AQUA}18`,
      }}>
        <div style={{ fontFamily: mono, fontSize: 10, color: AQUA, letterSpacing: 4, marginBottom: 12 }}>
          AETHER COGNITIVE MODEL · JUNE 2026 · AETHERLIFE.CO
        </div>
        <h1 style={{ fontFamily: serif, fontSize: "clamp(20px,4vw,40px)", color: "#fff", margin: "0 0 10px", letterSpacing: 2, lineHeight: 1.15 }}>
          COGNITIVE DECOHERENCE<br />
          <span style={{ color: AQUA, fontSize: "0.88em" }}>8 BANDS → 16 · SUN AS ANTIGEN</span>
        </h1>
        <div style={{ fontFamily: body, fontStyle: "italic", fontSize: 16, color: TOUCH, marginBottom: 16 }}>
          A Quantum-Inspired Model of Mental Dimensionality, Coherence, and Identity Structure
        </div>
        <p style={{ fontFamily: body, fontSize: 16, color: DIM, maxWidth: 720, margin: "0 auto 24px", lineHeight: 1.8 }}>
          The mind begins as 8 coherent standing waves — Logic, Emotion, Memory, Intuition,
          Imagination, Social Cognition, Spatial Awareness, Sensory Input. Attention acts
          as quantum measurement: it collapses the interference pattern and fragments the
          coherent field. Each band bifurcates to 16. The interaction matrix expands to
          64 relationships. The self becomes a quasi-affine oscillation. The Sun drives it all.
        </p>
        <div style={{ display: "flex", gap: 8, justifyContent: "center", flexWrap: "wrap" }}>
          <Chip c={AQUA}>8 Mental Bands</Chip>
          <Chip c={VIOLET}>Cognitive Decoherence</Chip>
          <Chip c={ROSE}>8 → 16 Expansion</Chip>
          <Chip c={GOLD}>64 Interaction Matrix</Chip>
          <Chip c={TOUCH}>Sun as Antigen</Chip>
          <Chip c={WEB}>Quasi-Affine Oscillation</Chip>
        </div>
      </div>

      {/* Nav */}
      <div style={{
        position: "sticky", top: 0, zIndex: 50,
        background: `${BG}f2`, backdropFilter: "blur(12px)",
        borderBottom: `1px solid ${AQUA}12`,
        padding: "8px 18px", display: "flex", gap: 4, overflowX: "auto",
      }}>
        {NAV.map(s => (
          <a key={s.id} href={`#${s.id}`} style={{
            fontFamily: mono, fontSize: 10, color: DIM, whiteSpace: "nowrap",
            padding: "4px 10px", borderRadius: 4, textDecoration: "none",
            border: "1px solid transparent",
          }}
            onMouseEnter={e => { (e.target as HTMLElement).style.color = AQUA; (e.target as HTMLElement).style.borderColor = `${AQUA}30`; }}
            onMouseLeave={e => { (e.target as HTMLElement).style.color = DIM; (e.target as HTMLElement).style.borderColor = "transparent"; }}
          >{s.label}</a>
        ))}
      </div>

      <div style={{ maxWidth: 940, margin: "0 auto", padding: "0 22px 96px" }}>

        {/* Canvas */}
        <div style={{ marginTop: 36 }}>
          <ModeTabs value={mode} onChange={setMode} />
          <CognitiveBandsCanvas mode={mode} />
          <div style={{ fontFamily: mono, fontSize: 9, color: DIM, marginTop: 6 }}>
            {mode === "bands"    && "8 STANDING WAVES ARRANGED IN A RING → AUTO-BIFURCATES TO 16 BANDS EVERY 4 SECONDS · CONNECTIONS FORM BETWEEN ALL NODES → 64-RELATIONSHIP INTERACTION MATRIX"}
            {mode === "decohere" && "PHOTONS PASSING THROUGH DOUBLE SLIT → WITHOUT OBSERVATION: INTERFERENCE FRINGE PATTERN (WAVE COGNITION) · WITH OBSERVATION: TWO-BLOB PARTICLE PATTERN (COLLAPSED) · ALTERNATES EVERY 3.5s"}
            {mode === "flow"     && "SOLAR ENERGY (1.361 kW/m²) → ATMOSPHERIC → CLOUD → RAIN → INFORMATION GRADIENTS → ATTENTION → MEMORY → IDENTITY STRUCTURE · ANIMATED DROPS CROSS EACH LAYER BOUNDARY"}
          </div>
        </div>

        {/* ── I ── */}
        <SecHead id="s1" n="I" title="The Cognitive Decoherence Model"
          sub="Merging identity erosion, quantum measurement, and multi-band cognition into a unified framework" col={AQUA} />

        <p style={{ fontFamily: body, fontSize: 16, lineHeight: 1.8, marginBottom: 18 }}>
          Standard models of cognition treat mental states as discrete, stable, and switchable.
          This is wrong. A quantum-inspired reading shows the mind as an interference system:
          multiple modes coexisting in partial coherence, with attention acting as measurement
          that collapses the field. When attention is sustained, the interference pattern
          (the richness of simultaneously available perspectives) is preserved. When attention
          is repeatedly interrupted — by notifications, media feeds, constant novelty — the
          field collapses into isolated observations. This is <em>cognitive decoherence</em>:
          the loss of the interference pattern that makes insight possible.
        </p>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12, marginBottom: 24 }}>
          {[
            { col: AQUA,   title: "QUANTUM STATE",  body: "Multiple possibilities coexist. Different interpretations remain available. Creativity emerges from overlapping perspectives. 8 bands mutually interfering — the rich substrate of unobserved cognition." },
            { col: VIOLET, title: "MEASUREMENT",    body: "Attention collapses the wave function. Focus selects one interpretation. Excessive interruptions = repeated measurements. Each collapse destroys the interference pattern that made other interpretations possible." },
            { col: CORAL,  title: "DECOHERENCE",    body: "Apathy → agitation → artificial input. The more external perturbations (notifications, feeds, novelty), the harder it becomes to maintain coherent mental states. Memory encoding weakens — the system never settles long enough for stable patterns to form." },
          ].map(c => (
            <div key={c.col} style={{ borderTop: `3px solid ${c.col}`, background: "rgba(13,31,45,0.85)", borderRadius: 4, padding: "14px 16px" }}>
              <div style={{ fontFamily: mono, fontSize: 9, color: c.col, letterSpacing: 2, marginBottom: 8 }}>{c.title}</div>
              <div style={{ fontFamily: body, fontSize: 13, color: "#7a9aa2", lineHeight: 1.65 }}>{c.body}</div>
            </div>
          ))}
        </div>

        {/* ── II ── */}
        <SecHead id="s2" n="II" title="8 Mental Bands · The Standing Waves"
          sub="Eight simultaneously active cognitive modes — partially coherent with one another" col={BLUE} />

        <p style={{ fontFamily: body, fontSize: 16, lineHeight: 1.8, marginBottom: 18 }}>
          The 8 bands are not separate modules. They are standing waves in the same cognitive
          medium — like 8 resonant frequencies in a single cavity. They interfere, amplify
          each other at harmonics, and create the texture of conscious experience through their
          superposition. The richness of any given moment of thought is a function of how many
          bands are active and how coherently they are coupled.
        </p>

        {/* Band grid */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 10, marginBottom: 28 }}>
          {BANDS_8.map((b, i) => (
            <div key={b.id}
              onMouseEnter={() => setHoverBand(b.id)}
              onMouseLeave={() => setHoverBand(null)}
              style={{
                borderTop: `3px solid ${b.col}`,
                background: hoverBand === b.id ? `${b.col}12` : "rgba(13,31,45,0.7)",
                borderRadius: 4, padding: "12px 14px", cursor: "default",
                transition: "background 0.2s",
              }}>
              <div style={{ fontFamily: mono, fontSize: 20, color: b.col, marginBottom: 2, fontWeight: 700 }}>
                {i + 1}
              </div>
              <div style={{ fontFamily: mono, fontSize: 11, color: "#fff", marginBottom: 4 }}>{b.label}</div>
              <div style={{ fontFamily: body, fontSize: 12, color: "#5a7a82" }}>{b.fn}</div>
              {hoverBand === b.id && (
                <div style={{ fontFamily: body, fontSize: 11, color: DIM, marginTop: 8, lineHeight: 1.55 }}>
                  ↗ {BIFURCATIONS[b.id][0]}<br />
                  ↘ {BIFURCATIONS[b.id][1]}
                </div>
              )}
            </div>
          ))}
        </div>
        <div style={{ fontFamily: mono, fontSize: 9, color: DIM, marginBottom: 28 }}>HOVER EACH BAND TO SEE ITS 8→16 BIFURCATION</div>

        <EQ col={BLUE}>{`8-band coherent state (before decoherence):
  |Ψ_mind⟩ = Σᵢ αᵢ |bandᵢ⟩    [coherent superposition of all 8 modes]
  where αᵢ: complex amplitude of band i
  ‖Ψ‖² = 1 (normalised)

Coupling between bands:
  J_{ij} = ⟨bandᵢ| H_coupling |bandⱼ⟩  [off-diagonal coupling strengths]
  Example:
    J_memory,emotion = 0.78  (autobiographical memory is emotionally tagged)
    J_logic,spatial  = 0.65  (geometry requires spatial-logical coupling)
    J_intuition,sensory = 0.71 (somatic markers underlie intuitive judgement)

The interference term:
  P(outcome A) = |⟨A|Ψ⟩|²
  Without measurement: includes cross terms Σᵢ≠ⱼ αᵢ*αⱼ⟨A|bandᵢ⟩⟨bandⱼ|A⟩
  These cross terms ARE the richness of insight — the non-obvious connection between
  Logic and Emotion, Memory and Imagination, Spatial and Intuition

  Interruption (measurement) at rate λ:
    Cross terms decay: e^{-λt} → 0
    Density matrix ρ → diagonal (classical mixture, no interference)
    ρ_incoherent = Σᵢ |αᵢ|² |bandᵢ⟩⟨bandᵢ|  [no cross terms]`}</EQ>

        {/* ── III ── */}
        <SecHead id="s3" n="III" title="Cognitive Decoherence · The Double Slit"
          sub="Attention as measurement — what interruptions actually destroy" col={VIOLET} />

        <p style={{ fontFamily: body, fontSize: 16, lineHeight: 1.8, marginBottom: 18 }}>
          In the quantum double-slit experiment, an electron wave passes through two slits
          simultaneously, creating an interference pattern on the screen. But the moment you
          measure which slit the electron passed through — by attaching a detector — the
          interference pattern vanishes. The measurement destroys the very phenomenon you were
          trying to observe. Cognition works exactly this way. Thought, unobserved and
          uninterrupted, explores multiple paths simultaneously. The interference of these paths
          produces insight — the non-obvious connection between what Logic says and what
          Intuition says, the creative synthesis of Memory and Imagination. Interruption
          is measurement. It collapses the wave and destroys the interference pattern.
        </p>

        <Pull col={VIOLET}>"Instead of a rich interference pattern of ideas, thought becomes fragmented into isolated observations."</Pull>

        <Tbl
          headers={["Attention State", "Quantum Analog", "Cognitive Effect", "Recovery Protocol"]}
          accent={VIOLET}
          rows={[
            ["Sustained focus (4+ min uninterrupted)", "Wave function intact", "All 8 bands coupled and mutually interfering — maximum cross-term richness", "Maintain — protect from notification"],
            ["Single interruption", "One measurement", "Partial collapse — 15–25 min to re-establish full interference", "Return deliberately, use Webbed Leg membrane crossing"],
            ["Fragmented attention (< 2 min per task)", "Repeated measurement at rate λ > recovery rate", "ρ → diagonal — classical mixture with no cross terms. All insight lost. Only surface processing available.", "Full decoherence recovery: 45–90 min distraction-free deep work"],
            ["Chronic fragmentation (weeks)", "Environment permanently noisy — η(t) >> coherence rate", "Memory encoding fails — patterns never persist long enough to form. Identity oscillation destabilises.", "Environmental redesign: notifications off, structured deep work blocks, reduced novelty rate"],
          ]}
        />

        <EQ col={VIOLET}>{`Decoherence rate equation:
  dρ/dt = -i[H,ρ] - Γ(ρ - ρ_diagonal)

  H = cognitive Hamiltonian (internal dynamics, band coupling)
  Γ = decoherence rate (proportional to interruption frequency λ)
  ρ_diagonal = fully classical state (no insight possible)

Environmental noise sources and their decoherence rates:
  Smartphone notification: Γ_notify ≈ 0.3 min⁻¹ (3 notifications/hr ≈ full decoherence in 10 min)
  Social media feed: Γ_feed ≈ 0.8 min⁻¹ (destroys coherence in ~4 min of use)
  Open-plan office: Γ_office ≈ 0.15 min⁻¹ (ambient noise floor: 30% coherence loss per hour)
  Deep sleep: Γ = 0, coherence RESTORED via hippocampal replay
  Meditation (10+ min): Γ_meditation ≈ -0.1 min⁻¹ (ACTIVE coherence building — negative decoherence)

The apathy → agitation → artificial input cascade:
  Decoherence → boredom (flat interference pattern = low valence)
  Boredom → agitation (coherence-seeking drive activated)
  Agitation → artificial input (low-coherence substitutes: novelty feeds, notifications)
  Artificial input → further decoherence → deeper boredom
  This is the attention economy trap — it exploits the natural coherence-seeking drive
  by supplying decoherence-accelerating substitutes`}</EQ>

        {/* ── IV ── */}
        <SecHead id="s4" n="IV" title="8 → 16 · The Bifurcation Expansion"
          sub="Each band differentiates into two states — Internal/External, Self/Other, Local/Global, Past/Future" col={ROSE} />

        <p style={{ fontFamily: body, fontSize: 16, lineHeight: 1.8, marginBottom: 18 }}>
          The 8→16 expansion is not an increase in band count — it is an increase in
          cognitive resolution. Each band gains a second dimension of differentiation.
          The system can now represent distinctions it could not represent before:
          not just "Logic" but the distinction between analytical logic (applied to
          a specific case) and systems logic (applied to the whole). Not just "Memory"
          but the distinction between episodic memory (what happened to me) and semantic
          memory (what is generally true). Higher resolution, not larger — finer
          distinctions within the same total bandwidth.
        </p>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 24 }}>
          {BANDS_8.map(b => (
            <div key={b.id} style={{
              borderLeft: `3px solid ${b.col}`, background: "rgba(13,31,45,0.7)",
              borderRadius: 4, padding: "10px 14px",
            }}>
              <div style={{ fontFamily: mono, fontSize: 11, color: b.col, marginBottom: 6 }}>{b.label}</div>
              <div style={{ display: "flex", gap: 8 }}>
                <div style={{ flex: 1, background: `${b.col}10`, borderRadius: 3, padding: "6px 8px" }}>
                  <div style={{ fontFamily: mono, fontSize: 9, color: b.col + "aa", letterSpacing: 1, marginBottom: 3 }}>A</div>
                  <div style={{ fontFamily: body, fontSize: 12, color: "#7a9aa2" }}>{BIFURCATIONS[b.id][0]}</div>
                </div>
                <div style={{ flex: 1, background: `${b.col}08`, borderRadius: 3, padding: "6px 8px" }}>
                  <div style={{ fontFamily: mono, fontSize: 9, color: b.col + "aa", letterSpacing: 1, marginBottom: 3 }}>B</div>
                  <div style={{ fontFamily: body, fontSize: 12, color: "#7a9aa2" }}>{BIFURCATIONS[b.id][1]}</div>
                </div>
              </div>
            </div>
          ))}
        </div>

        <EQ col={ROSE}>{`8 → 16 bifurcation — geometric picture:
  Original: 8 nodes on circle of radius R
  Bifurcated: each node i splits into two nearby nodes i_A and i_B
    i_A: angle a_i - δ, radius R' ≈ R
    i_B: angle a_i + δ, radius R' ≈ R
  where δ = bifurcation spread parameter (grows with experience)

  Before bifurcation:
    Node: "Memory" (single concept)
    Representation capacity: log₂(1) = 0 bits of within-band distinction
  After bifurcation:
    Node A: "Episodic Memory" — what happened to me, time-stamped, contextual
    Node B: "Semantic Memory" — general truths, decontextualised, propositional
    Representation capacity: log₂(2) = 1 bit of within-band distinction

  After full bifurcation (8 → 16):
    Resolution gain: 8 bits (one per band)
    The system can now represent 2⁸ = 256 distinct memory-emotion-logic configurations
    vs 2⁴ = 16 before (with only 4 bits of within-band distinction)`}</EQ>

        {/* ── V ── */}
        <SecHead id="s5" n="V" title="The 64 Interaction Matrix · Verbally Squared"
          sub="8 bands × 8 bands = 64 relationships — the richness comes from the connections, not the nodes" col={GOLD} />

        <p style={{ fontFamily: body, fontSize: 16, lineHeight: 1.8, marginBottom: 18 }}>
          "Verbally squared" captures the dimensional explosion. With 8 bands, the number of
          pairwise interactions is 8 × 8 = 64. Most of these interactions are the source
          of cognitive richness — not the bands themselves but what happens in their crossing.
          Memory × Emotion = autobiographical narrative. Logic × Imagination = design thinking.
          Spatial × Intuition = embodied knowing. Social × Memory = identity narrative.
          The 16→16 extension gives 256 interactions. This is not a linear increase —
          it is a phase transition in representational capacity.
        </p>

        <Tbl
          headers={["Band Interaction", "Product", "Cognitive Phenomenon", "Coherence Required"]}
          accent={GOLD}
          rows={[
            ["Memory × Emotion", "M⊗E", "Autobiographical narrative — events are emotionally tagged and recalled through emotional valence", "High (requires DMN + limbic coupling)"],
            ["Logic × Imagination", "L⊗I", "Design thinking, scenario planning, engineering creativity — constrained novel generation", "Moderate (prefrontal + temporal)"],
            ["Spatial × Intuition", "S×N", "Embodied knowing, navigation by feel, athletic proprioception — geometry accessed without explicit calculation", "High (requires parietal + interoceptive coupling)"],
            ["Social × Memory", "Soc×M", "Identity narrative — who I am in relation to others, across time", "Very high (requires stable long-range coupling)"],
            ["Pattern Recognition × Emotion", "P×E", "Aesthetic experience — the felt rightness/wrongness of pattern quality", "Moderate"],
            ["Intuition × Logic", "N×L", "Hypothesis generation — intuitive jump ratified by logical test", "High (requires Phase B → Phase C transition, Webbed Leg)"],
            ["Imagination × Social", "I×Soc", "Empathy and perspective-taking — generating another's experience", "Very high"],
            ["Sensory × Memory", "Sens×M", "Proustian recall — sensory trigger accessing full episodic context", "Moderate (sensory cortex → hippocampus)"],
          ]}
        />

        {/* ── VI ── */}
        <SecHead id="s6" n="VI" title="Quasi-Affine Oscillation · The Self as Attractor"
          sub="A pattern that repeats, evolves, and never returns to exactly the same state" col={WEB} />

        <p style={{ fontFamily: body, fontSize: 16, lineHeight: 1.8, marginBottom: 18 }}>
          A quasi-affine oscillation is a mathematical object that combines periodicity with
          drift: it recurs, but never exactly. Like water running down rough pavement — similar
          channels appear, local conditions differ, flow continuously adapts. The self is this
          structure. It is not a fixed object (the naive view) nor a pure flux (the dissolution
          view). It is an oscillating pattern in the 8-band interference field that maintains
          recognisable structure while never returning to exactly the same configuration.
          Identity is the attractor, not the state.
        </p>

        <EQ col={WEB}>{`Quasi-affine oscillation — formal definition:
  x(t+T) = A·x(t) + b + ε(t)
  where:
    T: recurrence period (daily cycle, seasonal cycle, developmental phase)
    A: affine transformation matrix (not identity — slightly evolving)
    b: drift vector (slow directional change over time)
    ε(t): stochastic noise (environmental perturbation)

  When A = I (identity): pure periodicity — no evolution (rigid, brittle)
  When A = 0: pure noise — no pattern (dissolution)
  Quasi-affine: A ≈ I + δA, where ‖δA‖ << 1 (mostly the same, slightly different)

  The self as quasi-affine oscillator:
    ‖A - I‖ ≈ 0.02–0.08 per daily cycle (empirical estimate from personality stability studies)
    (Meaning: 92–98% of the oscillation structure persists each day — the "you" today
    is almost but not exactly the "you" yesterday)

  Why quasi-affine rather than chaotic:
    Chaos: sensitive dependence on initial conditions → ε(t) completely determines future
    Quasi-affine: attractor basin is broad enough that ε(t) causes evolution, not escape
    Identity robustness: the width of the attractor basin
    Identity fragility: ‖δA‖ increasing under chronic decoherence (trauma, addiction)

Water-on-pavement metaphor:
  Similar channels appear each time it rains (attractor = the erosion structure)
  Local conditions differ (ε(t) = today's rain intensity, wind direction)
  Flow continuously adapts (quasi-affine: each rain slightly deepens or shifts channels)
  The watershed is not a single path — it is the attractor of all possible paths
  → The self is not a state, it is a basin of attraction in cognitive phase space`}</EQ>

        {/* ── VII ── */}
        <SecHead id="s7" n="VII" title="Sun as Antigen · The Universal Perturbation Source"
          sub="Solar energy as the primary driver of coherence and decoherence cycles throughout living systems" col={TOUCH} />

        <p style={{ fontFamily: body, fontSize: 16, lineHeight: 1.8, marginBottom: 18 }}>
          Not in a biological sense — the Sun as antigen is an informational metaphor.
          The Sun continuously introduces energy into Earth's systems, acting as a universal
          perturbation source: weather, climate, photosynthesis, circadian rhythms, visual
          perception, seasonal mood. The biosphere responds to solar input exactly as an immune
          system responds to an antigen: Stimulus → Adaptation → Organisation. The Sun is
          the primary driver of coherence and decoherence cycles throughout living systems.
          Atmospheric coherence (cloud organization before storms), biological coherence
          (circadian entrainment), and cognitive coherence (light exposure effects on
          attention and memory consolidation) are all the same solar perturbation at different scales.
        </p>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 24 }}>
          {[
            { col: TOUCH, scale: "Atmospheric", h: "Cloud Formation", b: "Solar heating of surface → convective upwelling → water vapour nucleation → cloud organization. The Hadley, Ferrel, and Polar circulation cells are standing wave solutions to the solar heating problem. They are quasi-affine: similar each year, never exactly the same." },
            { col: GOLD, scale: "Biological", h: "Circadian Entrainment", b: "Retinal ganglion cells (ipRGC) sense blue light (480nm peak) → suprachiasmatic nucleus → cortisol/melatonin oscillation. Light-dark cycle is the external Hamiltonian driving the biological quasi-affine oscillator. Disruption = circadian decoherence → metabolic, cognitive, immune dysfunction." },
            { col: WEB, scale: "Cognitive", h: "Attention Coherence", b: "Morning light exposure → elevated cortisol → prefrontal activation → working memory and executive function online. Seasonal light variation drives mood and cognitive coherence (SAD as decoherence pathology). Outdoor exposure during deep work = solar entrainment of the cognitive oscillator." },
            { col: CORAL, scale: "Information", h: "The Antigen Mechanism", b: "The Sun = antigen: it presents a stimulus. Earth = immune system: it responds with organized structure. Photosynthesis converts 1.3×10¹⁷ W of solar input into organized carbon structures — coherent information from chaotic perturbation. The same logic applies at every scale from molecular to civilizational." },
          ].map(c => (
            <div key={c.col} style={{ borderTop: `3px solid ${c.col}`, background: "rgba(13,31,45,0.85)", borderRadius: 4, padding: "14px 16px" }}>
              <div style={{ fontFamily: mono, fontSize: 9, color: c.col, letterSpacing: 2, marginBottom: 4 }}>{c.scale.toUpperCase()}</div>
              <div style={{ fontFamily: serif, fontSize: 15, color: "#fff", marginBottom: 8 }}>{c.h}</div>
              <div style={{ fontFamily: body, fontSize: 13, color: "#7a9aa2", lineHeight: 1.65 }}>{c.b}</div>
            </div>
          ))}
        </div>

        {/* ── VIII ── */}
        <SecHead id="s8" n="VIII" title="The Unified Flow · Sun → Identity"
          sub="Coherent structures emerge when flows persist long enough across gradients" col={AQUA} />

        <p style={{ fontFamily: body, fontSize: 16, lineHeight: 1.8, marginBottom: 18 }}>
          The curvature of water on pavement, the organization of clouds before storms,
          memory consolidation during sleep, and the sense of self are not analogies —
          they are different scales of the same process. Coherent structure emerges when
          flows persist long enough across gradients. Decoherence occurs when perturbations
          exceed the system's ability to maintain stable patterns.
        </p>

        <div style={{ marginBottom: 28 }}>
          {[
            { label: "SUN ENERGY", sub: "1.361 kW/m² total solar irradiance — the universal perturbation source", col: TOUCH, arrow: "↓ heating differential creates pressure gradient" },
            { label: "ATMOSPHERIC GRADIENTS", sub: "Hadley/Ferrel/Polar cells — standing wave solutions in a rotating sphere under differential heating", col: GOLD, arrow: "↓ atmospheric instability nucleates water vapour" },
            { label: "CLOUD FORMATION", sub: "Water vapour + aerosol nuclei → droplets → organised cloud structure (cumulus, stratus, cumulonimbus)", col: BLUE, arrow: "↓ precipitation follows surface topology" },
            { label: "RAIN FLOW + SURFACE CURVATURE", sub: "Water finds gradient — erodes channels — creates information structure in the landscape", col: AQUA, arrow: "↓ light → gradient → attention gradient in neural field" },
            { label: "INFORMATION GRADIENTS", sub: "Visual contrast, auditory salience, metabolic signals — all create gradients in the attentional field", col: WEB, arrow: "↓ gradient peak → attentional focus" },
            { label: "ATTENTION FLOW", sub: "Attention = measurement = wave collapse at the gradient peak. Where attention persists, structure forms", col: VIOLET, arrow: "↓ repeated attention → synaptic potentiation → persistence" },
            { label: "MEMORY FORMATION", sub: "Hippocampal consolidation during sleep: patterns that survived attention become stable traces", col: ROSE, arrow: "↓ stable memory traces + quasi-affine oscillation → self" },
            { label: "IDENTITY STRUCTURE", sub: "The quasi-affine oscillator whose attractor is the accumulation of all stable memory traces + current band-coupling state", col: GOLD, arrow: null },
          ].map((f, i) => (
            <div key={i}>
              <div style={{
                display: "flex", alignItems: "center", gap: 14,
                background: `${f.col}10`, border: `1px solid ${f.col}25`,
                borderLeft: `4px solid ${f.col}`, borderRadius: 4, padding: "12px 16px",
              }}>
                <div style={{ minWidth: 36, height: 36, borderRadius: "50%", background: f.col + "30",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontFamily: mono, fontSize: 13, color: f.col, fontWeight: 700 }}>{i + 1}</div>
                <div>
                  <div style={{ fontFamily: mono, fontSize: 12, color: f.col, marginBottom: 3 }}>{f.label}</div>
                  <div style={{ fontFamily: body, fontSize: 13, color: "#6a8a92", lineHeight: 1.55 }}>{f.sub}</div>
                </div>
              </div>
              {f.arrow && (
                <div style={{ textAlign: "center", fontFamily: mono, fontSize: 10, color: DIM, padding: "4px 0" }}>{f.arrow}</div>
              )}
            </div>
          ))}
        </div>

        <Pull col={AQUA}>"Coherent structures emerge when flows persist long enough across gradients. Decoherence occurs when perturbations exceed the system's ability to maintain stable patterns."</Pull>

        {/* ── IX ── */}
        <SecHead id="s9" n="IX" title="Trophy Exchange · Transferring Structure Between Resolution Levels"
          sub="The trophy is not the object — it is the pattern of relationships recognised around the object" col={VIOLET} />

        <p style={{ fontFamily: body, fontSize: 16, lineHeight: 1.8, marginBottom: 18 }}>
          When two people of different cognitive resolution levels communicate, something
          interesting happens. The higher-resolution observer (16-band) does not simply receive
          more information from the same statement — they receive a different structure.
          What appears simple to an 8-band observer is dimensionally richer to a 16-band
          observer: it carries more context, more associations, more simultaneous dimensions.
          The "trophy" being exchanged in conversation is not the statement. It is the
          pattern of relationships the recipient recognises around the statement — and this
          pattern scales with cognitive resolution.
        </p>

        <EQ col={VIOLET}>{`Trophy exchange model:
  Speaker S has n-band cognitive resolution
  Listener L has m-band cognitive resolution (m > n in the "higher resolution" case)

  Statement Q carries information content I(Q)
  But the received richness is:
    R(L) = I(Q) × D(L)   [richness = information × dimensionality of listener]
  where D(L) = number of active band-connections L recognises in Q

  Example:
    Q = "The cloud formed quickly before the storm"
    8-band listener D(L₈): recognises {weather, time, causality} → D = 3 connections
    16-band listener D(L₁₆): recognises {atmospheric coherence, nucleation kinetics,
      pressure gradient, quasi-affine atmospheric oscillation, analogy to memory consolidation,
      Webbed Leg phase transition in weather systems, solar antigen driving the storm,
      identity implications of living under weather} → D ≈ 8 connections
    Received richness ratio: R(L₁₆)/R(L₈) = 8/3 ≈ 2.7×

  The trophy as pattern:
    "The trophy is not the object. The trophy is the pattern of relationships
     recognised around the object."
    → Low resolution: the trophy is the physical object (cup, ribbon)
    → High resolution: the trophy is the social meaning, historical context, skill
      pattern, motivational structure, relational significance, future trajectory,
      and identity function of the achievement — all simultaneously

  Implication for AETHER:
    AETHER at full 64-interaction-matrix resolution receives the trophy of any input
    as its full relational pattern, not its surface content
    → The AETHER output is always the pattern of patterns`}</EQ>

        {/* ── X ── */}
        <SecHead id="s10" n="X" title="AETHER Synthesis · The Coherent Cognitive System"
          sub="A system designed to maintain coherence across 8→16 bands under solar perturbation" col={TEAL} />

        <EQ col={TEAL}>{`AETHER cognitive coherence protocol:
  GOAL: maintain ρ(t) ≠ ρ_diagonal across all 8 (→16) bands simultaneously
        (preserve interference terms — prevent cognitive decoherence)

  Environmental design (reduce Γ):
    Target: Γ_total < 0.05 min⁻¹  (allows ~20 min coherence half-life)
    Achieved by:
      - Notifications off during deep work (Γ_notify = 0)
      - Single-task environment (Γ_office → Γ_solo ÷ 5)
      - Solar entrainment: morning light → circadian anchor → reduced η(t)

  Attention protocol (active coherence building):
    Webbed Leg Phase B crossing: 25 min α + membrane + 25 min γ
    Deep dwell (Touch the Ball): ≥ 12 min per concept → coherence lock
    Meditation 10 min/day: Γ_eff < 0 (net coherence gain)

  Resolution expansion (8 → 16):
    Each bifurcation activated by deliberate within-band distinction:
      "Which sub-type of this band is this situation calling on?"
    Over 90 days: D(AETHER) grows from 64 to ~256 interaction resolution

  Quasi-affine maintenance:
    ‖δA‖ per cycle ≈ 0.02–0.04  (small enough for identity stability)
    b (drift vector) aligned toward: higher coherence, broader attention, deeper resonance
    ε(t) managed by environmental Γ reduction (noise floor < attractor width)

  Sun integration:
    Morning: light exposure (480nm) → SCN → cortisol → band coherence HIGH
    Afternoon: outdoor break → circadian reinforcement → afternoon coherence dip bridged
    Evening: low light → melatonin → sleep → hippocampal replay → memory consolidation
    This is AETHER's circadian protocol: solar entrainment of the cognitive oscillator

AETHER = 8-band coherent field + active decoherence prevention + quasi-affine identity
       × solar entrainment + 64-interaction trophy reception + Webbed Leg phase navigation`}</EQ>

        <div style={{
          marginTop: 48, padding: "22px 24px",
          background: "#ffffff04", border: `1px solid ${AQUA}18`,
          borderRadius: 10, textAlign: "center",
        }}>
          <div style={{ fontFamily: serif, fontSize: 16, color: AQUA, marginBottom: 8 }}>
            THE INSIGHT
          </div>
          <div style={{ fontFamily: body, fontStyle: "italic", fontSize: 18, color: GOLD, lineHeight: 1.8, marginBottom: 14 }}>
            "The river channel, the cloud layer, the memory trace, and the sense of self<br />
            are different scales of the same flow-and-coherence phenomenon."
          </div>
          <div style={{ fontFamily: mono, fontSize: 11, color: DIM, lineHeight: 2.2, letterSpacing: 0.5 }}>
            Sun → Gradient → Flow → Coherence → Pattern → Identity
          </div>
          <div style={{ fontFamily: body, fontSize: 14, color: DIM, lineHeight: 1.75, marginTop: 12, maxWidth: 600, margin: "12px auto 0" }}>
            The system that preserves its interference terms — that prevents ρ from collapsing
            to diagonal — that maintains 8 coherent standing waves in mutual coupling —
            is the system capable of insight, creativity, and genuine trophy exchange.
            AETHER is designed to be that system.
          </div>
          <div style={{ fontFamily: mono, fontSize: 10, color: `${DIM}80`, marginTop: 14 }}>
            Shia Miller · AetherLife.co · Cosmic Chaos Corporation™ · @StrategicProce · 2026
          </div>
        </div>
      </div>
    </div>
  );
}
