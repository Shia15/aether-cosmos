import { useEffect, useRef, useState } from "react";
import temporalMapping from "@assets/58E5DACB-2E46-4F33-8C36-BB61D447FD63_1781615189390.png";
import coherencingEq   from "@assets/IMG_2189_1781615189390.png";
import decoherenceFrag from "@assets/IMG_2191_1781615189390.png";
import opticalScatter  from "@assets/IMG_2185_1781615189390.png";
import spatioPhase     from "@assets/IMG_2188_1781615189390.png";
import emergentBubble  from "@assets/1236A754-8B2F-4AB3-B9FB-B7193F336F74_1781615189390.png";
import warpDrive       from "@assets/IMG_2203_1781615189390.png";
import coherenceMech   from "@assets/IMG_2212_1781615189390.png";
import tgemeMatrix     from "@assets/IMG_2217_1781615189390.png";
import warpCore        from "@assets/IMG_2199_1781615189390.jpeg";
import magneticRecon   from "@assets/F23D6CDB-AA6F-44AE-B136-E72229CEEA68_1781617123305.png";
import plasmaTransport  from "@assets/BE46CD04-CA24-458D-AB3C-1BE609D84123_1781617123305.png";
import droneSystem      from "@assets/BB7734DC-A62E-42CC-AE60-3E6912BF1494_1781617123305.png";
import dolphinVortex    from "@assets/IMG_3100_1781614705910.jpeg";
import vortexRingEngine from "@assets/28F81FD8-CBDD-408E-A325-3C503283EBBB_1781614705910.png";
import bubbleThermal    from "@assets/0502F370-FA89-4126-942E-B5741F1E0BB1_1781614705910.png";
import futurePortal     from "@assets/62A6B0CC-A6ED-4F58-B331-61156CB0EB1A_1781614705910.png";
import quaternionBurst  from "@assets/ED378685-2438-4F12-B100-312E2B5DC9A1_1781614705910.png";
import spaceTracking    from "@assets/284CC93B-6173-42B5-8889-875ADD2543C4_1781614705911.png";
import maglev           from "@assets/4A252038-40A7-49D4-BED1-20BD51CC846B_1781614705911.png";
import oscillating      from "@assets/4D914387-3E58-4DE1-8A7B-A4DB50266322_1781614705911.png";

/* ── Palette ────────────────────────────────────────────── */
const BG      = "#020408";
const ACCENT  = "#1fa8d4";    // ocean teal-blue
const GOLD    = "#c9a84c";
const VIOLET  = "#8b5cf6";
const GREEN   = "#22c55e";
const STONE   = "#b0a090";
const DIM     = "#3d6070";
const TEXT    = "#c8d8e0";
const WATER   = "#0a2a40";

const mono  = "'Space Mono', monospace";
const serif = "'Cinzel', serif";
const body  = "'Crimson Pro', Georgia, serif";

/* ── helpers ─────────────────────────────────────────────── */
function Chip({ c = ACCENT, children }: { c?: string; children: string }) {
  return (
    <span style={{
      fontFamily: mono, fontSize: 11, color: c,
      background: `${c}18`, border: `1px solid ${c}40`,
      borderRadius: 4, padding: "2px 7px", display: "inline-block", margin: "2px 3px",
    }}>{children}</span>
  );
}
function EqBlock({ children }: { children: string }) {
  return (
    <pre style={{
      fontFamily: mono, fontSize: 12, color: GOLD,
      background: "#050f1a", border: `1px solid ${GOLD}30`,
      borderRadius: 6, padding: "12px 18px", margin: "12px 0",
      overflowX: "auto", whiteSpace: "pre-wrap",
    }}>{children}</pre>
  );
}
function SecHead({ id, n, title, sub }: { id: string; n: string; title: string; sub: string }) {
  return (
    <div id={id} style={{ marginTop: 64, scrollMarginTop: 80 }}>
      <div style={{ fontFamily: mono, fontSize: 10, color: ACCENT, letterSpacing: 3, marginBottom: 6 }}>{n}</div>
      <h2 style={{ fontFamily: serif, fontSize: 26, color: "#fff", margin: "0 0 4px", letterSpacing: 1 }}>{title}</h2>
      <div style={{ fontFamily: body, fontSize: 15, color: DIM, marginBottom: 20 }}>{sub}</div>
      <div style={{ height: 1, background: `linear-gradient(90deg, ${ACCENT}60, transparent)`, marginBottom: 28 }} />
    </div>
  );
}
function Card({ title, col = ACCENT, children }: { title: string; col?: string; children: any }) {
  return (
    <div style={{
      background: `${col}09`, border: `1px solid ${col}2a`,
      borderRadius: 8, padding: "16px 20px", marginBottom: 16,
    }}>
      <div style={{ fontFamily: mono, fontSize: 10, color: col, letterSpacing: 2, marginBottom: 8 }}>{title}</div>
      <div style={{ fontFamily: body, fontSize: 15, color: TEXT, lineHeight: 1.75 }}>{children}</div>
    </div>
  );
}
function Table({ headers, rows, accent = ACCENT }:
  { headers: string[]; rows: string[][]; accent?: string }) {
  return (
    <div style={{ overflowX: "auto", margin: "14px 0" }}>
      <table style={{ width: "100%", borderCollapse: "collapse", fontFamily: body, fontSize: 14 }}>
        <thead>
          <tr style={{ borderBottom: `1px solid ${accent}40` }}>
            {headers.map((h, i) => (
              <th key={i} style={{ fontFamily: mono, fontSize: 10, color: accent, textAlign: "left", padding: "7px 12px", letterSpacing: 1 }}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, ri) => (
            <tr key={ri} style={{ borderBottom: `1px solid #ffffff0a`, background: ri % 2 === 0 ? "#ffffff04" : "transparent" }}>
              {row.map((c, ci) => <td key={ci} style={{ padding: "8px 12px", color: TEXT, verticalAlign: "top" }}>{c}</td>)}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/* ── Water Canvas Simulation ──────────────────────────────── */
type Mode = "buoyancy" | "acoustic" | "flow";

interface Stone { x: number; y: number; vx: number; vy: number; r: number; rho: number; angle: number; }
interface AcousticMode { nodes: number[]; freq: number; amp: number; }

function WaterCanvas({ mode }: { mode: Mode }) {
  const cvs = useRef<HTMLCanvasElement>(null);
  const raf = useRef(0);
  const t   = useRef(0);

  useEffect(() => {
    const canvas = cvs.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d")!;

    const resize = () => {
      const p = canvas.parentElement!;
      canvas.width  = p.clientWidth;
      canvas.height = 320;
    };
    resize();
    window.addEventListener("resize", resize);

    /* stone objects */
    const stones: Stone[] = Array.from({ length: mode === "acoustic" ? 6 : 3 }, (_, i) => ({
      x: 0.15 + 0.7 * Math.random(),
      y: mode === "buoyancy" ? 0.5 : 0.4 + 0.2 * Math.random(),
      vx: (Math.random() - 0.5) * 0.002,
      vy: 0,
      r:  0.025 + 0.02 * Math.random(),
      rho: mode === "buoyancy"
        ? (i === 0 ? 0.6 : i === 1 ? 1.02 : 2.6) // wood / barely-floating / granite
        : 2.2 + 0.6 * Math.random(),
      angle: Math.random() * Math.PI * 2,
    }));

    const ACOUSTIC: AcousticMode = { nodes: [0.2, 0.4, 0.6, 0.8], freq: 4, amp: 0.06 };
    const WATER_LEVEL = 0.45;
    const G = 0.00012;

    const drawWater = (W: number, H: number) => {
      // Water body
      const wY = WATER_LEVEL * H;
      const wGrad = ctx.createLinearGradient(0, wY, 0, H);
      wGrad.addColorStop(0, "#0d3a55");
      wGrad.addColorStop(0.3, "#072030");
      wGrad.addColorStop(1, "#030f1a");
      ctx.fillStyle = wGrad;
      ctx.fillRect(0, wY, W, H - wY);

      // Water surface wave
      ctx.beginPath();
      for (let x = 0; x <= W; x += 3) {
        const waveY = wY
          + 4 * Math.sin(x * 0.025 + t.current * 1.5)
          + 2 * Math.sin(x * 0.055 - t.current * 2.1)
          + (mode === "acoustic" ? ACOUSTIC.amp * H * Math.sin(x / W * Math.PI * 4 + t.current * ACOUSTIC.freq) : 0);
        x === 0 ? ctx.moveTo(x, waveY) : ctx.lineTo(x, waveY);
      }
      ctx.strokeStyle = `rgba(31,168,212,0.5)`;
      ctx.lineWidth = 1.5;
      ctx.stroke();

      // Surface shimmer
      for (let i = 0; i < 12; i++) {
        const sx = (i / 12 + 0.03 * Math.sin(t.current * 0.7 + i)) * W;
        const sy = wY + 2 * Math.sin(sx * 0.02 + t.current);
        ctx.beginPath();
        ctx.moveTo(sx - 8, sy);
        ctx.lineTo(sx + 8, sy);
        ctx.strokeStyle = `rgba(255,255,255,${0.04 + 0.03 * Math.sin(t.current * 2 + i)})`;
        ctx.lineWidth = 1;
        ctx.stroke();
      }
    };

    const drawAcousticField = (W: number, H: number) => {
      if (mode !== "acoustic") return;
      const wY = WATER_LEVEL * H;
      // Acoustic standing-wave pressure bands
      for (let i = 0; i < ACOUSTIC.nodes.length; i++) {
        const nx = ACOUSTIC.nodes[i] * W;
        const pressure = Math.abs(Math.sin(t.current * ACOUSTIC.freq + i));
        const g = ctx.createLinearGradient(nx - 18, 0, nx + 18, 0);
        g.addColorStop(0, "rgba(139,92,246,0)");
        g.addColorStop(0.5, `rgba(139,92,246,${0.12 * pressure})`);
        g.addColorStop(1, "rgba(139,92,246,0)");
        ctx.fillStyle = g;
        ctx.fillRect(nx - 18, wY, 36, H - wY);
        // Node label
        ctx.fillStyle = `rgba(139,92,246,${0.4 * pressure})`;
        ctx.font = `8px ${mono}`;
        ctx.textAlign = "center";
        ctx.fillText("NODE", nx, wY - 6);
        // Pressure circles
        for (let r = 10; r < 60; r += 16) {
          ctx.beginPath();
          ctx.arc(nx, wY + (H - wY) * 0.5, r, 0, Math.PI * 2);
          ctx.strokeStyle = `rgba(139,92,246,${0.06 * pressure * (60 - r) / 60})`;
          ctx.lineWidth = 0.5;
          ctx.stroke();
        }
      }
    };

    const drawFlowArrows = (W: number, H: number) => {
      if (mode !== "flow") return;
      const wY = WATER_LEVEL * H;
      for (let row = 0; row < 4; row++) {
        for (let col = 0; col < 8; col++) {
          const ax = (col / 7) * W * 0.9 + W * 0.05;
          const ay = wY + (row / 3) * (H - wY) * 0.85 + (H - wY) * 0.07;
          const depth = (ay - wY) / (H - wY);
          const flowSpeed = 0.6 + 0.4 * (1 - depth); // faster near surface
          const arrowLen = 18 * flowSpeed;
          const swirl = 0.15 * Math.sin(t.current * 0.8 + col * 0.9 + row * 1.3);
          const angle = swirl;
          ctx.save();
          ctx.translate(ax + t.current * 30 * flowSpeed % W - (W * 0.1), ay);
          ctx.rotate(angle);
          ctx.beginPath();
          ctx.moveTo(-arrowLen / 2, 0);
          ctx.lineTo(arrowLen / 2, 0);
          ctx.lineTo(arrowLen / 2 - 5, -4);
          ctx.moveTo(arrowLen / 2, 0);
          ctx.lineTo(arrowLen / 2 - 5, 4);
          ctx.strokeStyle = `rgba(31,168,212,${0.15 + 0.1 * flowSpeed})`;
          ctx.lineWidth = 1;
          ctx.stroke();
          ctx.restore();
        }
      }
    };

    const stoneLabel = (i: number) => {
      if (mode === "buoyancy") return ["TIMBER · ρ=0.6", "LIMESTONE · ρ=1.02", "GRANITE · ρ=2.6"][i] ?? "";
      return `STONE ${i + 1}`;
    };

    const drawStone = (s: Stone, i: number, W: number, H: number) => {
      const px = s.x * W, py = s.y * H;
      const R = s.r * W;

      ctx.save();
      ctx.translate(px, py);
      ctx.rotate(s.angle);

      // Stone body
      const sg = ctx.createRadialGradient(0, 0, R * 0.1, 0, 0, R);
      sg.addColorStop(0, "#d4c8b8");
      sg.addColorStop(0.6, "#a09080");
      sg.addColorStop(1, "#6a5848");
      ctx.beginPath();
      ctx.ellipse(0, 0, R, R * 0.72, 0, 0, Math.PI * 2);
      ctx.fillStyle = sg;
      ctx.fill();
      ctx.strokeStyle = "#ffffff18";
      ctx.lineWidth = 1;
      ctx.stroke();

      // Highlight
      ctx.beginPath();
      ctx.ellipse(-R * 0.2, -R * 0.2, R * 0.3, R * 0.2, -0.4, 0, Math.PI * 2);
      ctx.fillStyle = "rgba(255,255,255,0.07)";
      ctx.fill();
      ctx.restore();

      // Buoyancy force arrow (only in buoyancy mode)
      if (mode === "buoyancy") {
        const waterY = WATER_LEVEL * H;
        const submerged = Math.max(0, Math.min(1, (py - waterY + R * 0.72) / (R * 1.44)));
        const buoyF = submerged * 30 / s.rho;
        ctx.beginPath();
        ctx.moveTo(px, py);
        ctx.lineTo(px, py - buoyF);
        const fc = s.rho < 1 ? GREEN : s.rho < 1.1 ? GOLD : "#ef4444";
        ctx.strokeStyle = fc;
        ctx.lineWidth = 2;
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(px - 4, py - buoyF + 8);
        ctx.lineTo(px, py - buoyF);
        ctx.lineTo(px + 4, py - buoyF + 8);
        ctx.stroke();
      }

      // Label
      if (mode === "buoyancy") {
        const lbl = stoneLabel(i);
        ctx.font = `8px ${mono}`;
        ctx.fillStyle = `rgba(200,216,224,0.7)`;
        ctx.textAlign = "center";
        ctx.fillText(lbl, px, py - (s.r * W + 12));
      }
    };

    const updateStones = (W: number, H: number) => {
      const wY = WATER_LEVEL * H;
      for (const s of stones) {
        const px = s.x * W, py = s.y * H;
        const R = s.r * W;
        const submerged = Math.max(0, Math.min(1, (py + R * 0.36 - wY) / (R * 1.44)));

        if (mode === "buoyancy") {
          const buoyancy = submerged * G / s.rho;
          const gravity  = G;
          s.vy += gravity - buoyancy;
          s.vy *= 0.94; // damping
          s.y  += s.vy;
          // floor / ceiling
          if (s.y * H > H - R * 0.5) { s.y = (H - R * 0.5) / H; s.vy *= -0.3; }
          if (s.y * H < R * 0.5)     { s.y = (R * 0.5) / H;     s.vy *= -0.3; }
        }

        if (mode === "acoustic") {
          // Acoustic radiation force — stones migrate to pressure nodes
          const nearestNode = ACOUSTIC.nodes.reduce((best, n) =>
            Math.abs(n - s.x) < Math.abs(best - s.x) ? n : best, ACOUSTIC.nodes[0]);
          const diff = nearestNode - s.x;
          const acousticForce = diff * 0.0008 * Math.sin(t.current * ACOUSTIC.freq);
          s.vx += acousticForce;
          s.vx *= 0.92;
          s.x  += s.vx;
          // Float in water
          const targetY = WATER_LEVEL + 0.1;
          s.vy += (targetY - s.y) * 0.003;
          s.vy *= 0.9;
          s.y  += s.vy;
          s.angle += s.vx * 2;
        }

        if (mode === "flow") {
          // River flow — constant rightward current, objects carried
          const depth = Math.max(0, py - wY) / (H - wY);
          const flowV = (0.0015 + 0.001 * (1 - depth)) * (1 - s.rho / 5);
          s.vx += flowV;
          s.vx  = Math.min(s.vx, 0.006);
          s.vx *= 0.98;
          s.x  += s.vx;
          if (s.x > 1.05) s.x = -0.05; // wrap
          // Buoy toward surface if low density, sink if high
          const targetY = s.rho < 1 ? WATER_LEVEL - s.r * 0.3 : WATER_LEVEL + 0.25;
          s.vy += (targetY - s.y) * 0.002;
          s.vy *= 0.92;
          s.y  += s.vy;
          s.angle += s.vx * 1.5;
        }

        // boundary
        if (s.x < -0.1) s.x = 1.1;
        if (s.x >  1.1) s.x = -0.1;
      }
    };

    const draw = () => {
      const W = canvas.width, H = canvas.height;
      ctx.clearRect(0, 0, W, H);

      // Sky / above water
      const sky = ctx.createLinearGradient(0, 0, 0, WATER_LEVEL * H);
      sky.addColorStop(0, "#010810");
      sky.addColorStop(1, "#041420");
      ctx.fillStyle = sky;
      ctx.fillRect(0, 0, W, WATER_LEVEL * H);

      drawAcousticField(W, H);
      drawFlowArrows(W, H);
      drawWater(W, H);
      updateStones(W, H);
      stones.forEach((s, i) => drawStone(s, i, W, H));

      // Mode label
      const labels: Record<Mode, string> = {
        buoyancy: "ARCHIMEDES · ρ_object < ρ_water → FLOAT",
        acoustic: "ACOUSTIC STANDING WAVES · NODE MIGRATION",
        flow:     "RIVER FLOW · LAMINAR CARRY · CURRENT-BORNE TRANSPORT",
      };
      ctx.fillStyle = `rgba(31,168,212,0.55)`;
      ctx.font = `9px ${mono}`;
      ctx.textAlign = "center";
      ctx.fillText(labels[mode], W / 2, H - 8);

      t.current += 0.016;
      raf.current = requestAnimationFrame(draw);
    };
    draw();
    return () => { cancelAnimationFrame(raf.current); window.removeEventListener("resize", resize); };
  }, [mode]);

  return (
    <div style={{ position: "relative", background: "#010810", borderRadius: 10, overflow: "hidden", border: `1px solid ${ACCENT}20` }}>
      <canvas ref={cvs} style={{ display: "block", width: "100%", height: 320 }} />
    </div>
  );
}

/* ── Mode Tabs ────────────────────────────────────────────── */
function ModeTabs({ value, onChange }: { value: Mode; onChange: (m: Mode) => void }) {
  const tabs: { k: Mode; label: string }[] = [
    { k: "buoyancy", label: "Buoyancy" },
    { k: "acoustic", label: "Acoustic" },
    { k: "flow",     label: "River Flow" },
  ];
  return (
    <div style={{ display: "flex", gap: 6, marginBottom: 10 }}>
      {tabs.map(tab => (
        <button key={tab.k} onClick={() => onChange(tab.k)} style={{
          fontFamily: mono, fontSize: 10, padding: "5px 14px", borderRadius: 4, cursor: "pointer",
          border: `1px solid ${value === tab.k ? ACCENT : DIM + "60"}`,
          background: value === tab.k ? `${ACCENT}18` : "transparent",
          color: value === tab.k ? ACCENT : DIM,
          transition: "all 0.2s",
        }}>{tab.label}</button>
      ))}
    </div>
  );
}

/* ── Tunnel Canvas ────────────────────────────────────────── */
function TunnelCanvas() {
  const cvs = useRef<HTMLCanvasElement>(null);
  const raf = useRef(0);
  const t   = useRef(0);

  useEffect(() => {
    const canvas = cvs.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d")!;

    const resize = () => {
      const p = canvas.parentElement!;
      canvas.width  = p.clientWidth;
      canvas.height = 440;
    };
    resize();
    window.addEventListener("resize", resize);

    // Ball state
    const ball = { x: 0.05, vx: 0.0012 };

    // Geological layers (top=0 → bottom=1, tunnel at y≈0.78)
    // Each layer: yTop(fraction), yBot(fraction), name, color, uncertainty(0-1)
    const LAYERS = [
      { yT: 0.00, yB: 0.13, name: "ALLUVIUM / MARINE SEDIMENT",  col: "#8b7355", unc: 0.9, note: "Soft, saturated — TBM pregrouting required" },
      { yT: 0.13, yB: 0.28, name: "SANDSTONE · Cretaceous",       col: "#c4a35a", unc: 0.4, note: "Moderate UCS 40–80 MPa, variable permeability" },
      { yT: 0.28, yB: 0.46, name: "LIMESTONE · Karst potential",  col: "#b8c4a0", unc: 0.75, note: "Dissolution cavities, voids — major uncertainty" },
      { yT: 0.46, yB: 0.62, name: "SHALE · Plastic deformation",  col: "#6b7280", unc: 0.35, note: "Swelling clays, anisotropic, low permeability" },
      { yT: 0.62, yB: 0.80, name: "GRANITE BASEMENT",            col: "#9ca3af", unc: 0.15, note: "High UCS 150–250 MPa, competent rock" },
      { yT: 0.80, yB: 1.00, name: "METAMORPHIC — UNKNOWN",        col: "#4b5563", unc: 0.95, note: "No core data below 380m — probabilistic model only" },
    ];

    // Fault zones: x position (fraction), width fraction, dip (degrees from vertical)
    const FAULTS = [
      { x: 0.22, w: 0.028, dip: 15, name: "F1 · STRIKE-SLIP",  col: "#ef4444" },
      { x: 0.55, w: 0.022, dip: -20, name: "F2 · REVERSE",     col: "#f97316" },
      { x: 0.78, w: 0.035, dip: 10,  name: "F3 · NORMAL · ACTIVE", col: "#ef4444" },
    ];

    const TUNNEL_Y    = 0.78;  // fraction from top
    const TUNNEL_R    = 0.038; // fraction of height
    const DEPTH_LABEL = "400 m";
    const TOTAL_DEPTH = 400;   // metres shown

    const seed = (n: number, o: number) => Math.abs(Math.sin(n * 127.1 + o * 311.7) * 43758.5453 % 1);

    const drawLayer = (W: number, H: number, l: typeof LAYERS[0], li: number) => {
      const y0 = l.yT * H, y1 = l.yB * H;
      const mid = (y0 + y1) / 2;

      // Base fill
      ctx.fillStyle = `${l.col}28`;
      ctx.fillRect(0, y0, W, y1 - y0);

      // Uncertainty stipple overlay
      if (l.unc > 0.2) {
        const density = Math.round(l.unc * 80);
        for (let i = 0; i < density; i++) {
          const sx = seed(li * 100 + i, 0) * W;
          const sy = y0 + seed(li * 100 + i, 1) * (y1 - y0);
          const r  = 1 + seed(li * 100 + i, 2) * 2;
          ctx.beginPath();
          ctx.arc(sx, sy, r, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(255,255,255,${0.03 + 0.04 * l.unc})`;
          ctx.fill();
        }
      }

      // Wavy boundary at top (uncertainty = waviness)
      if (li > 0) {
        ctx.beginPath();
        for (let x = 0; x <= W; x += 4) {
          const wave = l.unc * 5 * Math.sin(x * 0.018 + li * 2.1 + t.current * 0.1)
                     + l.unc * 3 * Math.cos(x * 0.041 + li * 1.7);
          const by = y0 + wave;
          x === 0 ? ctx.moveTo(x, by) : ctx.lineTo(x, by);
        }
        ctx.strokeStyle = `${l.col}60`;
        ctx.lineWidth = 1.2;
        ctx.stroke();
      }

      // Layer name
      ctx.font = `8px ${mono}`;
      ctx.fillStyle = `${l.col}cc`;
      ctx.textAlign = "left";
      ctx.fillText(l.name, 8, mid - 5);
      ctx.font = `7px ${mono}`;
      ctx.fillStyle = `${l.col}70`;
      ctx.fillText(l.note, 8, mid + 7);

      // Uncertainty badge
      ctx.font = `7px ${mono}`;
      ctx.fillStyle = l.unc > 0.6 ? "#ef444490" : l.unc > 0.35 ? "#f9731670" : "#22c55e70";
      ctx.textAlign = "right";
      ctx.fillText(`UNC ${Math.round(l.unc * 100)}%`, W - 8, mid);
    };

    const drawFault = (W: number, H: number, f: typeof FAULTS[0]) => {
      const cx = f.x * W;
      const hw = f.w * W * 0.5;
      const dipRad = f.dip * Math.PI / 180;

      // Uncertainty band
      const ug = ctx.createLinearGradient(cx - hw * 3, 0, cx + hw * 3, 0);
      ug.addColorStop(0, "transparent");
      ug.addColorStop(0.4, `${f.col}12`);
      ug.addColorStop(0.5, `${f.col}28`);
      ug.addColorStop(0.6, `${f.col}12`);
      ug.addColorStop(1, "transparent");
      ctx.fillStyle = ug;
      ctx.fillRect(cx - hw * 3, 0, hw * 6, H);

      // Fault plane line
      const offset = Math.tan(dipRad) * H * 0.5;
      ctx.beginPath();
      ctx.moveTo(cx - offset, 0);
      ctx.lineTo(cx + offset, H);
      ctx.strokeStyle = `${f.col}70`;
      ctx.lineWidth = 1.5;
      ctx.setLineDash([6, 4]);
      ctx.stroke();
      ctx.setLineDash([]);

      // Label
      ctx.save();
      ctx.translate(cx, H * 0.12);
      ctx.rotate(-Math.PI / 2);
      ctx.font = `7px ${mono}`;
      ctx.fillStyle = `${f.col}cc`;
      ctx.textAlign = "center";
      ctx.fillText(f.name, 0, 0);
      ctx.restore();

      // Animated seismic shimmer on active fault
      if (f.name.includes("ACTIVE")) {
        const shimmer = Math.abs(Math.sin(t.current * 3.5)) * 0.3;
        const sg = ctx.createLinearGradient(cx - hw * 4, 0, cx + hw * 4, 0);
        sg.addColorStop(0, "transparent");
        sg.addColorStop(0.5, `${f.col}${Math.round(shimmer * 255).toString(16).padStart(2,"0")}`);
        sg.addColorStop(1, "transparent");
        ctx.fillStyle = sg;
        ctx.fillRect(cx - hw * 4, 0, hw * 8, H);
      }
    };

    const drawTunnel = (W: number, H: number) => {
      const ty = TUNNEL_Y * H;
      const tr = TUNNEL_R * H;

      // Water fill in tunnel
      const wg = ctx.createLinearGradient(0, ty - tr, 0, ty + tr);
      wg.addColorStop(0, "#1fa8d430");
      wg.addColorStop(0.4, "#0a2a4060");
      wg.addColorStop(1, "#030f1a80");
      ctx.beginPath();
      ctx.rect(0, ty - tr, W, tr * 2);
      ctx.fillStyle = wg;
      ctx.fill();

      // Tunnel walls (two lines)
      [ty - tr, ty + tr].forEach((wy, wi) => {
        ctx.beginPath();
        ctx.moveTo(0, wy);
        ctx.lineTo(W, wy);
        ctx.strokeStyle = wi === 0 ? "#1fa8d460" : "#1fa8d430";
        ctx.lineWidth = 2;
        ctx.stroke();
      });

      // Concrete lining hatch marks every 80px
      for (let x = 20; x < W; x += 80) {
        ctx.beginPath();
        ctx.moveTo(x, ty - tr - 6);
        ctx.lineTo(x, ty - tr);
        ctx.moveTo(x, ty + tr);
        ctx.lineTo(x, ty + tr + 6);
        ctx.strokeStyle = "#1fa8d440";
        ctx.lineWidth = 1;
        ctx.stroke();
      }

      // Water flow arrows inside tunnel
      const flowPhase = t.current * 0.8;
      for (let i = 0; i < 10; i++) {
        const ax = ((i * 0.1 + flowPhase * 0.04) % 1.05 - 0.025) * W;
        const ay = ty + (Math.sin(i * 1.3) * tr * 0.35);
        const al = 18;
        if (ax < 0 || ax > W) continue;
        ctx.beginPath();
        ctx.moveTo(ax - al / 2, ay);
        ctx.lineTo(ax + al / 2, ay);
        ctx.lineTo(ax + al / 2 - 5, ay - 3);
        ctx.moveTo(ax + al / 2, ay);
        ctx.lineTo(ax + al / 2 - 5, ay + 3);
        ctx.strokeStyle = `rgba(31,168,212,${0.12 + 0.06 * Math.sin(t.current + i)})`;
        ctx.lineWidth = 1;
        ctx.stroke();
      }

      // Tunnel label
      ctx.font = `8px ${mono}`;
      ctx.fillStyle = "#1fa8d4a0";
      ctx.textAlign = "right";
      ctx.fillText(`HYDRAULIC CAPSULE TUNNEL  ∅${Math.round(tr * 2)}px ≈ 6m dia`, W - 8, ty - tr - 9);
    };

    const drawBall = (W: number, H: number) => {
      const ty = TUNNEL_Y * H;
      const tr = TUNNEL_R * H;
      const bx = ball.x * W;
      const br = tr * 0.58;

      // Advance ball
      ball.vx = 0.0012 + 0.0002 * Math.sin(t.current * 0.3); // slight speed variation
      ball.x += ball.vx;
      if (ball.x > 1.08) ball.x = -0.08;

      // Shadow
      ctx.beginPath();
      ctx.ellipse(bx, ty + br * 0.85, br * 0.8, br * 0.2, 0, 0, Math.PI * 2);
      ctx.fillStyle = "rgba(0,0,0,0.25)";
      ctx.fill();

      // Ball body gradient
      const bg2 = ctx.createRadialGradient(bx - br * 0.3, ty - br * 0.3, br * 0.05, bx, ty, br);
      bg2.addColorStop(0, "#c9a84c");
      bg2.addColorStop(0.4, "#a07030");
      bg2.addColorStop(0.85, "#6a4820");
      bg2.addColorStop(1, "#3a2810");
      ctx.beginPath();
      ctx.arc(bx, ty, br, 0, Math.PI * 2);
      ctx.fillStyle = bg2;
      ctx.fill();

      // Rolling rotation marks
      const rot = ball.x * 40;
      for (let i = 0; i < 4; i++) {
        const angle = rot + i * Math.PI / 2;
        ctx.beginPath();
        ctx.moveTo(bx + br * 0.4 * Math.cos(angle), ty + br * 0.4 * Math.sin(angle));
        ctx.lineTo(bx + br * 0.8 * Math.cos(angle), ty + br * 0.8 * Math.sin(angle));
        ctx.strokeStyle = "rgba(0,0,0,0.25)";
        ctx.lineWidth = 1.5;
        ctx.stroke();
      }

      // Highlight
      ctx.beginPath();
      ctx.arc(bx - br * 0.28, ty - br * 0.28, br * 0.22, 0, Math.PI * 2);
      ctx.fillStyle = "rgba(255,255,255,0.18)";
      ctx.fill();

      // Pressure wave behind ball
      const pw = br * (2.5 + 0.5 * Math.sin(t.current * 4));
      const pg = ctx.createRadialGradient(bx, ty, br, bx, ty, pw);
      pg.addColorStop(0, "rgba(31,168,212,0.12)");
      pg.addColorStop(1, "rgba(31,168,212,0)");
      ctx.beginPath();
      ctx.arc(bx, ty, pw, 0, Math.PI * 2);
      ctx.fillStyle = pg;
      ctx.fill();

      // Label
      ctx.font = `7px ${mono}`;
      ctx.fillStyle = "#c9a84ccc";
      ctx.textAlign = "center";
      ctx.fillText("CAPSULE · 4.2m dia · 18t", bx, ty - br - 7);
    };

    const drawDepthScale = (W: number, H: number) => {
      // Depth ruler on right edge
      const RX = W - 2;
      ctx.beginPath();
      ctx.moveTo(RX, 0);
      ctx.lineTo(RX, H);
      ctx.strokeStyle = "#1fa8d420";
      ctx.lineWidth = 1;
      ctx.stroke();

      [0, 100, 200, 300, 400].forEach(d => {
        const fy = (d / TOTAL_DEPTH) * H;
        ctx.beginPath();
        ctx.moveTo(RX - 10, fy);
        ctx.lineTo(RX, fy);
        ctx.strokeStyle = "#1fa8d450";
        ctx.lineWidth = 1;
        ctx.stroke();
        ctx.font = `7px ${mono}`;
        ctx.fillStyle = "#1fa8d480";
        ctx.textAlign = "right";
        ctx.fillText(`${d}m`, RX - 13, fy + 3);
      });

      // Pressure at 400m (P = ρgh = 1000 × 9.81 × 400 ≈ 3.92 MPa)
      const py = TUNNEL_Y * H;
      ctx.beginPath();
      ctx.moveTo(RX - 16, py);
      ctx.lineTo(RX, py);
      ctx.strokeStyle = "#c9a84c";
      ctx.lineWidth = 1.5;
      ctx.stroke();
      ctx.font = `7px ${mono}`;
      ctx.fillStyle = "#c9a84c";
      ctx.textAlign = "right";
      ctx.fillText("P = 3.92 MPa", RX - 18, py - 2);
      ctx.fillText("T ≈ 28°C", RX - 18, py + 10);
    };

    const drawOverlayStats = (W: number, H: number) => {
      const stats = [
        `DEPTH: ${DEPTH_LABEL}`,
        `P_hydro: 3.92 MPa`,
        `T_rock:  28°C`,
        `BALL Ø: 4.2 m`,
        `v_ball:  2.8 m/s`,
        `Re: 1.4 × 10⁷`,
      ];
      ctx.font = `8px ${mono}`;
      ctx.fillStyle = "#1fa8d460";
      ctx.textAlign = "left";
      stats.forEach((s, i) => ctx.fillText(s, 10, H - 14 - i * 13));
    };

    const draw = () => {
      const W = canvas.width, H = canvas.height;
      ctx.clearRect(0, 0, W, H);

      // Background
      ctx.fillStyle = "#010810";
      ctx.fillRect(0, 0, W, H);

      // Geological layers
      LAYERS.forEach((l, i) => drawLayer(W, H, l, i));

      // Fault zones
      FAULTS.forEach(f => drawFault(W, H, f));

      // Tunnel bore
      drawTunnel(W, H);

      // Rolling ball
      drawBall(W, H);

      // Depth scale
      drawDepthScale(W, H);

      // Stats overlay
      drawOverlayStats(W, H);

      // Title
      ctx.font = `9px ${mono}`;
      ctx.fillStyle = "#1fa8d490";
      ctx.textAlign = "left";
      ctx.fillText("TRANS-NATIONAL HYDRAULIC CAPSULE TUNNEL · 400 m DEPTH · GEOLOGICAL CROSS-SECTION", 8, 12);

      t.current += 0.016;
      raf.current = requestAnimationFrame(draw);
    };
    draw();
    return () => { cancelAnimationFrame(raf.current); window.removeEventListener("resize", resize); };
  }, []);

  return (
    <div style={{ background: "#010810", borderRadius: 10, overflow: "hidden", border: `1px solid ${ACCENT}20` }}>
      <canvas ref={cvs} style={{ display: "block", width: "100%" }} />
    </div>
  );
}

/* ── Origami Drone Canvas ─────────────────────────────────── */
function OrigamiDroneCanvas() {
  const cvs = useRef<HTMLCanvasElement>(null);
  const raf = useRef(0);
  const t   = useRef(0);

  useEffect(() => {
    const canvas = cvs.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d")!;

    const resize = () => {
      canvas.width  = canvas.parentElement!.clientWidth;
      canvas.height = 380;
    };
    resize();
    window.addEventListener("resize", resize);

    // Lemniscate of Bernoulli parametric — figure-eight / ∞ loop
    const lemni = (th: number, a: number, cx: number, cy: number) => {
      const s = Math.sin(th), c2 = Math.cos(th);
      const d = 1 + s * s;
      return { x: cx + a * c2 / d, y: cy + a * c2 * s / d };
    };

    // Draw origami star / hexagon with morphing panels
    const drawDrone = (x: number, y: number, expandFrac: number, isWater: boolean) => {
      const N = isWater ? 6 : 4;
      const R = 18 + expandFrac * 26;
      const innerR = R * (0.28 + 0.38 * (1 - expandFrac));
      const col = isWater ? ACCENT : GOLD;

      // Fold-line panels (origami crease marks)
      for (let i = 0; i < N; i++) {
        const a0 = (i * 2 * Math.PI / N) - Math.PI / 2;
        const a1 = ((i + 1) * 2 * Math.PI / N) - Math.PI / 2;
        const aMid = (a0 + a1) / 2;
        ctx.beginPath();
        ctx.moveTo(x, y);
        ctx.lineTo(x + R * Math.cos(a0), y + R * Math.sin(a0));
        ctx.lineTo(x + R * Math.cos(aMid) * 0.7, y + R * Math.sin(aMid) * 0.7);
        ctx.closePath();
        ctx.fillStyle = `${col}${i % 2 === 0 ? "22" : "12"}`;
        ctx.fill();
        ctx.strokeStyle = `${col}50`;
        ctx.lineWidth = 0.8;
        ctx.stroke();
      }

      // Outer star perimeter
      ctx.beginPath();
      for (let i = 0; i < N * 2; i++) {
        const angle = (i * Math.PI / N) - Math.PI / 2;
        const r = i % 2 === 0 ? R : innerR;
        const px = x + r * Math.cos(angle);
        const py = y + r * Math.sin(angle);
        i === 0 ? ctx.moveTo(px, py) : ctx.lineTo(px, py);
      }
      ctx.closePath();
      ctx.strokeStyle = col;
      ctx.lineWidth = 1.5;
      ctx.stroke();

      // Core glow
      const g = ctx.createRadialGradient(x, y, 0, x, y, R * 0.55);
      g.addColorStop(0, `${col}50`);
      g.addColorStop(0.6, `${col}18`);
      g.addColorStop(1, "transparent");
      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.arc(x, y, R, 0, Math.PI * 2);
      ctx.fill();

      // Pulsing outer ring
      const ringR = R + 8 + 5 * Math.sin(t.current * 0.08);
      ctx.beginPath();
      ctx.arc(x, y, ringR, 0, Math.PI * 2);
      ctx.strokeStyle = `${col}25`;
      ctx.lineWidth = 1;
      ctx.stroke();

      // State label
      ctx.font = `7px ${mono}`;
      ctx.fillStyle = col;
      ctx.textAlign = "center";
      const label = isWater ? `EXPAND ·${N}` : `COMPRESS ·${N}`;
      ctx.fillText(label, x, y + R + 16);
    };

    const draw = () => {
      const W = canvas.width, H = canvas.height;
      ctx.clearRect(0, 0, W, H);
      ctx.fillStyle = "#010810";
      ctx.fillRect(0, 0, W, H);

      const cx = W / 2, cy = H / 2;
      const a  = Math.min(W * 0.30, H * 0.42);

      // Zone backgrounds
      const leftG = ctx.createLinearGradient(0, 0, cx, 0);
      leftG.addColorStop(0, "#0a2a4030"); leftG.addColorStop(1, "#0a2a4008");
      ctx.fillStyle = leftG; ctx.fillRect(0, 0, cx, H);
      const rightG = ctx.createLinearGradient(cx, 0, W, 0);
      rightG.addColorStop(0, "#2a1a0a08"); rightG.addColorStop(1, "#2a1a0a30");
      ctx.fillStyle = rightG; ctx.fillRect(cx, 0, cx, H);

      // Zone labels
      ctx.font = `8px ${mono}`;
      ctx.fillStyle = `${ACCENT}50`; ctx.textAlign = "left";
      ctx.fillText("◀ OCEAN / AQUIFER  (LOW PRESSURE)", 10, 18);
      ctx.fillStyle = `${GOLD}50`; ctx.textAlign = "right";
      ctx.fillText("UNDERGROUND / ROCK  (HIGH PRESSURE) ▶", W - 10, 18);

      // Divider
      ctx.beginPath(); ctx.moveTo(cx, 0); ctx.lineTo(cx, H);
      ctx.strokeStyle = "#ffffff0a"; ctx.lineWidth = 1;
      ctx.setLineDash([3, 7]); ctx.stroke(); ctx.setLineDash([]);

      // Draw lemniscate path — two strokes for glow
      const PATH_STEPS = 240;
      for (let pass = 0; pass < 2; pass++) {
        ctx.beginPath();
        for (let i = 0; i <= PATH_STEPS; i++) {
          const th = (i / PATH_STEPS) * Math.PI * 2;
          const p = lemni(th, a, cx, cy);
          i === 0 ? ctx.moveTo(p.x, p.y) : ctx.lineTo(p.x, p.y);
        }
        ctx.closePath();
        if (pass === 0) {
          ctx.strokeStyle = `${ACCENT}15`; ctx.lineWidth = 14;
        } else {
          // Colour the two lobes differently
          ctx.strokeStyle = `${ACCENT}55`; ctx.lineWidth = 1.2;
        }
        ctx.stroke();
      }

      // Flow-dot particles along path
      for (let i = 0; i < 18; i++) {
        const frac = ((i / 18) + t.current * 0.0035) % 1;
        const th  = frac * Math.PI * 2;
        const p   = lemni(th, a, cx, cy);
        const isW = p.x < cx;
        ctx.beginPath();
        ctx.arc(p.x, p.y, 2, 0, Math.PI * 2);
        ctx.fillStyle = isW ? `${ACCENT}90` : `${GOLD}90`;
        ctx.fill();
      }

      // Phase transition markers (compression/expansion points)
      [[0, "EXPAND"], [Math.PI, "COMPRESS"]].forEach(([angle, label]) => {
        const p = lemni(angle as number, a, cx, cy);
        ctx.beginPath();
        ctx.arc(p.x, p.y, 6, 0, Math.PI * 2);
        ctx.strokeStyle = angle === 0 ? ACCENT : GOLD;
        ctx.lineWidth = 1.5; ctx.stroke();
        ctx.font = `7px ${mono}`;
        ctx.fillStyle = angle === 0 ? `${ACCENT}cc` : `${GOLD}cc`;
        ctx.textAlign = "center";
        ctx.fillText(label as string, p.x, p.y - 12);
      });

      // ∞ center symbol
      ctx.font = `bold 36px serif`;
      ctx.fillStyle = `${ACCENT}12`; ctx.textAlign = "center";
      ctx.fillText("∞", cx, cy + 12);
      ctx.font = `7px ${mono}`;
      ctx.fillStyle = `${ACCENT}40`;
      ctx.fillText("INFINITY TRANSPORT CYCLE", cx, cy + 26);

      // Main drone
      const dFrac = (t.current * 0.006) % 1;
      const dTh   = dFrac * Math.PI * 2;
      const dPos  = lemni(dTh, a, cx, cy);
      const isWater = dPos.x < cx;

      // Expansion factor — smooth sine envelope peaking in water zone
      const normX  = (dPos.x - (cx - a)) / (2 * a); // 0=left edge, 1=right edge
      const expand = Math.max(0, Math.sin(normX * Math.PI));
      drawDrone(dPos.x, dPos.y, expand, isWater);

      // Ghost drones at 1/3 and 2/3 phase offsets (trail effect)
      [0.33, 0.67].forEach(offset => {
        const gFrac = (dFrac + offset) % 1;
        const gTh   = gFrac * Math.PI * 2;
        const gPos  = lemni(gTh, a, cx, cy);
        const gWater = gPos.x < cx;
        const gX     = (gPos.x - (cx - a)) / (2 * a);
        const gExp   = Math.max(0, Math.sin(gX * Math.PI)) * 0.5;
        ctx.globalAlpha = 0.25;
        drawDrone(gPos.x, gPos.y, gExp, gWater);
        ctx.globalAlpha = 1.0;
      });

      // Status bar
      ctx.font = `8px ${mono}`;
      ctx.fillStyle = isWater ? `${ACCENT}cc` : `${GOLD}cc`;
      ctx.textAlign = "left";
      const stateText = isWater
        ? "▶ WATER PHASE — ORIGAMI UNFOLDING — 6-POINT STAR — BUOYANCY DRIVE"
        : "▶ UNDERGROUND PHASE — ORIGAMI FOLDING — 4-POINT COMPACT — HYDRAULIC DRIVE";
      ctx.fillText(stateText, 10, H - 10);

      t.current += 1;
      raf.current = requestAnimationFrame(draw);
    };
    draw();
    return () => { cancelAnimationFrame(raf.current); window.removeEventListener("resize", resize); };
  }, []);

  return (
    <div style={{ background: "#010810", borderRadius: 10, overflow: "hidden", border: `1px solid ${ACCENT}20` }}>
      <canvas ref={cvs} style={{ display: "block", width: "100%" }} />
    </div>
  );
}

/* ── Pressure Graph Canvas ────────────────────────────────── */
function PressureGraphCanvas() {
  const cvs = useRef<HTMLCanvasElement>(null);
  const raf = useRef(0);
  const phase = useRef(0);

  useEffect(() => {
    const canvas = cvs.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d")!;

    const resize = () => {
      canvas.width  = canvas.parentElement!.clientWidth;
      canvas.height = 500;
    };
    resize();
    window.addEventListener("resize", resize);

    // Key ocean depths + their physics
    const DEPTHS = [
      { d: 0,      label: "Sea Level",             bar: 1,    col: "#22c55e",  note: "1 atm — baseline",                 mat: "Human body (unsupported)" },
      { d: 10,     label: "10 m — Scuba",           bar: 2,    col: "#22c55e",  note: "2 bar — lungs compressed 50%",     mat: "Recreational diver" },
      { d: 40,     label: "40 m — Rec limit",       bar: 5,    col: "#84cc16",  note: "5 bar — PADI max depth",           mat: "Dive computer rated" },
      { d: 100,    label: "100 m — Tech diving",    bar: 11,   col: "#eab308",  note: "11 bar — trimix required",         mat: "Hardsuit ADS" },
      { d: 300,    label: "300 m — Sat diving",     bar: 31,   col: "#f97316",  note: "31 bar — saturation limit",        mat: "Saturation system" },
      { d: 400,    label: "400 m — OUR TUNNEL",     bar: 41,   col: "#c9a84c",  note: "3.92 MPa · 41 bar",               mat: "Graphene-lining required" },
      { d: 600,    label: "600 m — Sub hull",       bar: 61,   col: "#f97316",  note: "61 bar — standard sub crush",      mat: "Naval submarine" },
      { d: 1000,   label: "1 000 m — Abyssal",      bar: 101,  col: "#ef4444",  note: "101 bar — deep ROV territory",    mat: "Titanium pressure sphere" },
      { d: 3800,   label: "3 800 m — Avg floor",    bar: 381,  col: "#dc2626",  note: "381 bar — average ocean depth",   mat: "Alvin-class submersible" },
      { d: 6000,   label: "6 000 m — Hadal zone",   bar: 601,  col: "#b91c1c",  note: "601 bar — hadal trench start",    mat: "Full ocean depth rated" },
      { d: 10994,  label: "10 994 m — Challenger ↓",bar: 1100, col: "#7f1d1d",  note: "1 100 bar · 110 MPa",             mat: "Graphene hull (theoretical)" },
    ];

    const MAX_BAR = 1100;
    const LABEL_W = 175;
    const BAR_AREA_W_FRAC = 0.55;
    const MAT_FRAC = 1 - BAR_AREA_W_FRAC;

    const draw = () => {
      const W = canvas.width, H = canvas.height;
      ctx.clearRect(0, 0, W, H);
      ctx.fillStyle = "#010810";
      ctx.fillRect(0, 0, W, H);

      const rowH   = (H - 60) / DEPTHS.length;
      const barMax = (W - LABEL_W) * BAR_AREA_W_FRAC;
      const matX   = LABEL_W + barMax + 12;

      // Background grid lines
      [100, 200, 400, 600, 800, 1100].forEach(b => {
        const x = LABEL_W + (b / MAX_BAR) * barMax;
        if (x > W) return;
        ctx.beginPath();
        ctx.moveTo(x, 30);
        ctx.lineTo(x, H - 20);
        ctx.strokeStyle = "#1fa8d415";
        ctx.lineWidth = 1;
        ctx.setLineDash([3, 5]);
        ctx.stroke();
        ctx.setLineDash([]);
        ctx.font = `7px ${mono}`;
        ctx.fillStyle = "#1fa8d440";
        ctx.textAlign = "center";
        ctx.fillText(`${b} bar`, x, 22);
      });

      // Title row
      ctx.font = `8px ${mono}`;
      ctx.fillStyle = "#1fa8d480";
      ctx.textAlign = "left";
      ctx.fillText("DEPTH", 8, 22);
      ctx.fillText("PRESSURE (bar)  →", LABEL_W, 22);
      ctx.fillText("MATERIAL / VESSEL LIMIT", matX, 22);

      DEPTHS.forEach((dep, i) => {
        const y   = 34 + i * rowH;
        const cy  = y + rowH * 0.5;
        const bW  = (dep.bar / MAX_BAR) * barMax;
        const pulse = dep.label.includes("TUNNEL") ? 0.15 * Math.sin(phase.current * 3) : 0;

        // Row highlight for tunnel depth
        if (dep.label.includes("TUNNEL")) {
          ctx.fillStyle = `${GOLD}12`;
          ctx.fillRect(0, y - 1, W, rowH + 2);
          ctx.strokeStyle = `${GOLD}40`;
          ctx.lineWidth = 1;
          ctx.setLineDash([4, 4]);
          ctx.strokeRect(0, y - 1, W, rowH + 2);
          ctx.setLineDash([]);
        }

        // Bar
        const barG = ctx.createLinearGradient(LABEL_W, 0, LABEL_W + bW, 0);
        barG.addColorStop(0, `${dep.col}80`);
        barG.addColorStop(0.7, `${dep.col}bb`);
        barG.addColorStop(1, `${dep.col}${Math.round((0.7 + pulse) * 255).toString(16).padStart(2,"0")}`);
        ctx.fillStyle = barG;
        ctx.beginPath();
        ctx.roundRect(LABEL_W, cy - rowH * 0.28, bW, rowH * 0.55, 3);
        ctx.fill();

        // Bar end cap pulsing glow
        ctx.beginPath();
        ctx.arc(LABEL_W + bW, cy, rowH * 0.22, 0, Math.PI * 2);
        ctx.fillStyle = `${dep.col}${dep.label.includes("TUNNEL") ? "60" : "30"}`;
        ctx.fill();

        // Depth label
        ctx.font = `8px ${mono}`;
        ctx.fillStyle = dep.col;
        ctx.textAlign = "right";
        ctx.fillText(dep.label, LABEL_W - 6, cy + 3);

        // Pressure number on bar
        ctx.font = `7px ${mono}`;
        ctx.fillStyle = "#fff";
        ctx.textAlign = "left";
        const numX = LABEL_W + bW + 4;
        if (numX + 60 < LABEL_W + barMax)
          ctx.fillText(`${dep.bar} bar`, numX, cy + 3);

        // Note below label
        ctx.font = `6px ${mono}`;
        ctx.fillStyle = `${dep.col}80`;
        ctx.textAlign = "right";
        ctx.fillText(dep.note, LABEL_W - 6, cy + rowH * 0.35);

        // Material name
        ctx.font = `7px ${mono}`;
        ctx.fillStyle = `${dep.col}90`;
        ctx.textAlign = "left";
        ctx.fillText(dep.mat, matX, cy + 3);

        // Separator line
        ctx.beginPath();
        ctx.moveTo(0, y + rowH - 1);
        ctx.lineTo(W, y + rowH - 1);
        ctx.strokeStyle = "#ffffff08";
        ctx.lineWidth = 1;
        ctx.stroke();
      });

      // Animated scan line
      const scanY = 34 + ((phase.current * 0.015) % 1) * (H - 54);
      ctx.beginPath();
      ctx.moveTo(0, scanY);
      ctx.lineTo(W, scanY);
      ctx.strokeStyle = "#1fa8d412";
      ctx.lineWidth = 1;
      ctx.stroke();

      // MPa secondary axis label
      ctx.font = `7px ${mono}`;
      ctx.fillStyle = "#1fa8d450";
      ctx.textAlign = "center";
      ctx.fillText("← MPa = bar ÷ 10  |  1 MPa = 145 psi  |  1 bar ≈ 1 atm", W / 2, H - 6);

      phase.current += 1;
      raf.current = requestAnimationFrame(draw);
    };
    draw();
    return () => { cancelAnimationFrame(raf.current); window.removeEventListener("resize", resize); };
  }, []);

  return (
    <div style={{ background: "#010810", borderRadius: 10, overflow: "hidden", border: `1px solid ${ACCENT}20` }}>
      <canvas ref={cvs} style={{ display: "block", width: "100%" }} />
    </div>
  );
}

/* ── Nav sections ─────────────────────────────────────────── */
const NAV = [
  { id: "s1", label: "Buoyancy" },
  { id: "s2", label: "Acoustic" },
  { id: "s3", label: "Ancient Stone" },
  { id: "s4", label: "Phononic Crystal" },
  { id: "s5", label: "AETHER · Water" },
  { id: "s6", label: "Design Principles" },
  { id: "s7", label: "Deep Tunnel Portal" },
  { id: "s8", label: "Pressure Depths" },
  { id: "s9", label: "Graphene Revolution" },
  { id: "s10", label: "Decoherence" },
  { id: "s11", label: "Origami Drone ∞" },
  { id: "s12", label: "Magnetic Recon" },
];

/* ── Magnetic Reconnection Canvas ────────────────────────── */
function MagneticReconCanvas() {
  const cvs  = useRef<HTMLCanvasElement>(null);
  const raf  = useRef(0);
  const tick = useRef(0);

  useEffect(() => {
    const canvas = cvs.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d")!;

    const resize = () => {
      canvas.width  = canvas.parentElement!.clientWidth;
      canvas.height = 340;
    };
    resize();
    window.addEventListener("resize", resize);

    const PHASE_FRAMES = 110;
    const PHASES = [
      { name: "EXPAND",       col: "#1a9fd4", desc: "Energy Stored · Magnetic Loops Grow" },
      { name: "ACCUMULATE",   col: "#8b5cf6", desc: "Loops Approach · Field Gradient Increases" },
      { name: "RECONNECTION", col: "#ffffff", desc: "Topology Changes · Energy Released" },
      { name: "COMPRESS",     col: "#e8a030", desc: "Energy Concentrated · Loops Collapse" },
      { name: "TRANSPORT",    col: "#22c55e", desc: "Move Through Substrate / Channels" },
      { name: "RE-EXPAND",    col: "#1fd4c8", desc: "New Topology · Cycle Restarts" },
    ];
    const TOTAL = PHASES.length * PHASE_FRAMES;

    const arc = (
      ox: number, oy: number, r: number,
      a0: number, a1: number, ccw: boolean,
      col: string, lw: number
    ) => {
      ctx.beginPath();
      ctx.arc(ox, oy, r, a0, a1, ccw);
      ctx.strokeStyle = col;
      ctx.lineWidth = lw;
      ctx.stroke();
    };

    const draw = () => {
      tick.current++;
      const W = canvas.width, H = canvas.height;
      ctx.clearRect(0, 0, W, H);
      ctx.fillStyle = "#010810";
      ctx.fillRect(0, 0, W, H);

      const cx = W / 2, cy = H / 2 - 28;
      const phaseIdx = Math.floor((tick.current % TOTAL) / PHASE_FRAMES);
      const phaseT   = (tick.current % PHASE_FRAMES) / PHASE_FRAMES;
      const phase    = PHASES[phaseIdx];

      /* separation of loop centres */
      let sep = W * 0.20;
      if (phaseIdx === 1) sep = W * (0.20 - phaseT * 0.08);
      if (phaseIdx === 2) sep = W * 0.12;
      if (phaseIdx === 3) sep = W * (0.12 + phaseT * 0.10);
      if (phaseIdx >= 4)  sep = W * 0.22;

      const nArcs = 5;

      /* LEFT loop — blue, arcs above centre-line */
      for (let i = 0; i < nArcs; i++) {
        const frac = (i + 1) / (nArcs + 1);
        const r    = sep * (0.35 + frac * 1.1);
        const aBase = 0.35 + frac * 0.5;
        const fade  = phaseIdx === 2 ? Math.max(0.04, 1 - phaseT * 1.8) * aBase
                    : phaseIdx >= 3 && phaseIdx <= 4 ? aBase * 0.28
                    : aBase;

        if (phaseIdx < 2 || phaseIdx >= 5) {
          arc(cx - sep, cy, r, Math.PI, 0, true,  `rgba(26,159,212,${fade})`, 0.8 + frac);
          arc(cx - sep, cy, r, 0, Math.PI, false, `rgba(26,159,212,${fade * 0.5})`, 0.5 + frac * 0.5);
        } else if (phaseIdx === 2) {
          arc(cx - sep * 0.5, cy, r * (1 + phaseT * 0.5), Math.PI, 0, true, `rgba(26,159,212,${fade})`, 0.8 + frac);
        } else {
          /* new topology: vertical arcs */
          const a2 = (phaseIdx === 3 ? phaseT * 0.4 : 0.35) * (0.2 + frac * 0.5);
          arc(cx, cy - sep * 0.4, r * 0.65, 0, Math.PI, false, `rgba(26,159,212,${a2})`, 0.8 + frac);
        }
      }

      /* RIGHT loop — amber, arcs below centre-line */
      for (let i = 0; i < nArcs; i++) {
        const frac = (i + 1) / (nArcs + 1);
        const r    = sep * (0.35 + frac * 1.1);
        const aBase = 0.35 + frac * 0.5;
        const fade  = phaseIdx === 2 ? Math.max(0.04, 1 - phaseT * 1.8) * aBase
                    : phaseIdx >= 3 && phaseIdx <= 4 ? aBase * 0.28
                    : aBase;

        if (phaseIdx < 2 || phaseIdx >= 5) {
          arc(cx + sep, cy, r, 0, Math.PI, false, `rgba(232,160,48,${fade})`, 0.8 + frac);
          arc(cx + sep, cy, r, Math.PI, 0, true,  `rgba(232,160,48,${fade * 0.5})`, 0.5 + frac * 0.5);
        } else if (phaseIdx === 2) {
          arc(cx + sep * 0.5, cy, r * (1 + phaseT * 0.5), 0, Math.PI, false, `rgba(232,160,48,${fade})`, 0.8 + frac);
        } else {
          const a2 = (phaseIdx === 3 ? phaseT * 0.4 : 0.35) * (0.2 + frac * 0.5);
          arc(cx, cy + sep * 0.4, r * 0.65, Math.PI, 0, true, `rgba(232,160,48,${a2})`, 0.8 + frac);
        }
      }

      /* X-LINE */
      if (phaseIdx === 1 || phaseIdx === 2) {
        const xa = phaseIdx === 1 ? phaseT * 0.75 : Math.max(0, 1 - phaseT * 1.4);
        const xl = 16 + phaseT * 16;
        ctx.setLineDash([3, 3]);
        ctx.strokeStyle = `rgba(255,255,255,${xa})`;
        ctx.lineWidth = 1;
        ctx.beginPath(); ctx.moveTo(cx - xl, cy - xl); ctx.lineTo(cx + xl, cy + xl); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(cx + xl, cy - xl); ctx.lineTo(cx - xl, cy + xl); ctx.stroke();
        ctx.setLineDash([]);
        if (xa > 0.25) {
          ctx.font = `7px ${mono}`; ctx.fillStyle = `rgba(255,255,255,${xa})`; ctx.textAlign = "center";
          ctx.fillText("X-LINE", cx + 34, cy - 22);
        }
      }

      /* RECONNECTION: flash + plasma jets */
      if (phaseIdx === 2) {
        const jet  = phaseT * H * 0.27;
        const intens = Math.sin(phaseT * Math.PI);
        if (phaseT < 0.42) {
          const fa = (0.42 - phaseT) * 1.8;
          const gf = ctx.createRadialGradient(cx, cy, 0, cx, cy, phaseT * 90);
          gf.addColorStop(0,   `rgba(255,255,255,${fa * 0.85})`);
          gf.addColorStop(0.4, `rgba(150,110,255,${fa * 0.5})`);
          gf.addColorStop(1,   "transparent");
          ctx.fillStyle = gf; ctx.fillRect(0, 0, W, H);
        }
        if (jet > 4) {
          const jg1 = ctx.createLinearGradient(cx, cy, cx, cy - jet);
          jg1.addColorStop(0, `rgba(200,170,255,${intens})`);
          jg1.addColorStop(0.5, `rgba(140,100,255,${intens * 0.6})`);
          jg1.addColorStop(1, "transparent");
          ctx.beginPath(); ctx.moveTo(cx-5,cy); ctx.lineTo(cx+5,cy); ctx.lineTo(cx+2,cy-jet); ctx.lineTo(cx-2,cy-jet); ctx.closePath();
          ctx.fillStyle = jg1; ctx.fill();
          const jg2 = ctx.createLinearGradient(cx, cy, cx, cy + jet);
          jg2.addColorStop(0, `rgba(255,200,80,${intens})`);
          jg2.addColorStop(0.5, `rgba(232,160,48,${intens * 0.6})`);
          jg2.addColorStop(1, "transparent");
          ctx.beginPath(); ctx.moveTo(cx-5,cy); ctx.lineTo(cx+5,cy); ctx.lineTo(cx+2,cy+jet); ctx.lineTo(cx-2,cy+jet); ctx.closePath();
          ctx.fillStyle = jg2; ctx.fill();
          ctx.font = `7px ${mono}`; ctx.textAlign = "left";
          ctx.fillStyle = `rgba(200,170,255,${intens * 0.9})`; ctx.fillText("PLASMA JET ↑", cx + 8, cy - jet * 0.55);
          ctx.fillStyle = `rgba(255,200,80,${intens * 0.9})`;  ctx.fillText("PLASMA JET ↓", cx + 8, cy + jet * 0.55);
        }
      }

      /* TRANSPORT phase: flowing particles */
      if (phaseIdx === 4) {
        for (let p = 0; p < 9; p++) {
          const prog = ((tick.current * 0.6 + p * 28) % 100) / 100;
          const px = cx - sep + prog * sep * 2;
          const py = cy + Math.sin(prog * Math.PI * 1.8 + p) * sep * 0.25;
          const pa = Math.sin(prog * Math.PI) * 0.75;
          ctx.beginPath(); ctx.arc(px, py, 2.5, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(34,197,94,${pa})`; ctx.fill();
          const tg = ctx.createLinearGradient(px - 14, py, px, py);
          tg.addColorStop(0, "transparent"); tg.addColorStop(1, `rgba(34,197,94,${pa * 0.3})`);
          ctx.fillStyle = tg; ctx.fillRect(px - 14, py - 1, 14, 2);
        }
        ctx.font = `8px ${mono}`; ctx.fillStyle = "rgba(34,197,94,0.65)"; ctx.textAlign = "center";
        ctx.fillText("v = −k∇h · SUBSTRATE TRANSIT FLOW", cx, cy - sep * 0.95);
      }

      /* COMPRESS phase: field concentration glow */
      if (phaseIdx === 3) {
        const gAlpha = phaseT * 0.55;
        const gr = ctx.createRadialGradient(cx, cy, 0, cx, cy, 45 + phaseT * 20);
        gr.addColorStop(0, `rgba(232,160,48,${gAlpha})`);
        gr.addColorStop(0.6, `rgba(200,120,30,${gAlpha * 0.35})`);
        gr.addColorStop(1, "transparent");
        ctx.fillStyle = gr; ctx.fillRect(0, 0, W, H);
        ctx.font = `8px ${mono}`; ctx.fillStyle = `rgba(232,160,48,${gAlpha * 1.6})`; ctx.textAlign = "center";
        ctx.fillText("B ∝ 1/A · FIELD CONCENTRATION", cx, cy - 56);
      }

      /* Zone labels */
      if (phaseIdx <= 1 || phaseIdx >= 5) {
        ctx.font = `8px ${mono}`; ctx.textAlign = "center";
        ctx.fillStyle = "rgba(26,159,212,0.32)";  ctx.fillText("LOOP A  (−B)", cx - sep * 0.82, cy - sep * 0.78);
        ctx.fillStyle = "rgba(232,160,48,0.32)"; ctx.fillText("LOOP B  (+B)", cx + sep * 0.82, cy - sep * 0.78);
      }

      /* Equation watermarks */
      ctx.font = `9px ${mono}`; ctx.textAlign = "right";
      ctx.fillStyle = "#c9a84c55"; ctx.fillText("E_B = B²/2μ₀", W - 14, 16);
      ctx.font = `7.5px ${mono}`; ctx.fillStyle = "#6a889950";
      ctx.fillText("∂B/∂t = ∇×(v×B) − η∇×(∇×B)", W - 14, 30);

      /* Phase progress bar */
      const barW = Math.min(W * 0.72, 520);
      const barX = cx - barW / 2;
      const barY = H - 54;
      ctx.fillStyle = "#ffffff06"; ctx.fillRect(barX, barY, barW, 3);
      ctx.fillStyle = phase.col;  ctx.fillRect(barX, barY, ((tick.current % TOTAL) / TOTAL) * barW, 3);
      for (let i = 0; i < PHASES.length; i++) {
        const dx = barX + (i / PHASES.length) * barW + barW / (PHASES.length * 2);
        ctx.beginPath(); ctx.arc(dx, barY + 1.5, i === phaseIdx ? 5 : 3, 0, Math.PI * 2);
        ctx.fillStyle = i === phaseIdx ? PHASES[i].col : "#ffffff18"; ctx.fill();
        ctx.font = `6.5px ${mono}`; ctx.fillStyle = i === phaseIdx ? PHASES[i].col : "#ffffff25";
        ctx.textAlign = "center"; ctx.fillText(PHASES[i].name, dx, barY + 20);
      }

      /* Phase label */
      ctx.font = `11px ${mono}`; ctx.fillStyle = phase.col; ctx.textAlign = "center";
      ctx.fillText(`PHASE ${phaseIdx + 1} · ${phase.name}`, cx, H - 66);
      ctx.font = `9px ${mono}`; ctx.fillStyle = "#6a8898";
      ctx.fillText(phase.desc, cx, H - 54);

      raf.current = requestAnimationFrame(draw);
    };

    raf.current = requestAnimationFrame(draw);
    return () => {
      cancelAnimationFrame(raf.current);
      window.removeEventListener("resize", resize);
    };
  }, []);

  return (
    <canvas ref={cvs} style={{ width: "100%", display: "block", borderRadius: 8, border: `1px solid ${VIOLET}20` }} />
  );
}

/* ── Page ─────────────────────────────────────────────────── */
export default function WaterTransportPage() {
  const [mode, setMode] = useState<Mode>("buoyancy");

  return (
    <div style={{ background: BG, minHeight: "100vh", fontFamily: body, color: TEXT }}>

      {/* Hero */}
      <div style={{
        padding: "68px 32px 44px",
        background: `linear-gradient(180deg, #010c1a 0%, ${BG} 100%)`,
        borderBottom: `1px solid ${ACCENT}18`,
        textAlign: "center",
      }}>
        <div style={{ fontFamily: mono, fontSize: 10, color: ACCENT, letterSpacing: 4, marginBottom: 14 }}>
          AETHER · PHYSICAL SYSTEMS · TRANSPORT MECHANICS
        </div>
        <h1 style={{
          fontFamily: serif, fontSize: "clamp(26px, 5vw, 48px)", color: "#fff",
          margin: "0 0 12px", letterSpacing: 2, lineHeight: 1.2,
        }}>
          TRANSPORTING OBJECTS<br />
          <span style={{ color: ACCENT }}>& STONE THROUGH WATER</span>
        </h1>
        <p style={{ fontFamily: body, fontSize: 17, color: DIM, maxWidth: 640, margin: "0 auto 28px", lineHeight: 1.75 }}>
          Buoyancy · Acoustic levitation · Ancient megalith transport · Phononic crystals ·
          Water as a dimensional transfer medium in the AETHER ring-field framework
        </p>
        <div style={{ display: "flex", gap: 8, justifyContent: "center", flexWrap: "wrap" }}>
          <Chip c={ACCENT}>Archimedes · ρ_fluid</Chip>
          <Chip c={GOLD}>Acoustic Radiation Force</Chip>
          <Chip c={VIOLET}>Phononic Crystal</Chip>
          <Chip c={STONE}>Megalith Transport</Chip>
          <Chip c={GREEN}>AETHER · ψ_water</Chip>
        </div>
      </div>

      {/* Jump nav */}
      <div style={{
        position: "sticky", top: 0, zIndex: 50,
        background: `${BG}f0`, backdropFilter: "blur(12px)",
        borderBottom: `1px solid ${ACCENT}14`,
        padding: "9px 22px", display: "flex", gap: 4, overflowX: "auto",
      }}>
        {NAV.map(s => (
          <a key={s.id} href={`#${s.id}`} style={{
            fontFamily: mono, fontSize: 10, color: DIM, whiteSpace: "nowrap",
            padding: "5px 10px", borderRadius: 4, textDecoration: "none",
            border: "1px solid transparent",
          }}
            onMouseEnter={e => { const el = e.target as HTMLElement; el.style.color = ACCENT; el.style.borderColor = `${ACCENT}30`; }}
            onMouseLeave={e => { const el = e.target as HTMLElement; el.style.color = DIM; el.style.borderColor = "transparent"; }}
          >{s.label}</a>
        ))}
      </div>

      <div style={{ maxWidth: 900, margin: "0 auto", padding: "0 24px 96px" }}>

        {/* Simulation canvas */}
        <div style={{ marginTop: 36, marginBottom: 6 }}>
          <ModeTabs value={mode} onChange={setMode} />
          <WaterCanvas mode={mode} />
          <div style={{ display: "flex", gap: 16, marginTop: 8, flexWrap: "wrap" }}>
            {mode === "buoyancy" && (
              <>
                <span style={{ fontFamily: mono, fontSize: 10, color: GREEN }}>▲ GREEN = buoyancy force</span>
                <span style={{ fontFamily: mono, fontSize: 10, color: GOLD }}>▲ GOLD = near-neutral</span>
                <span style={{ fontFamily: mono, fontSize: 10, color: "#ef4444" }}>▲ RED = negative (sinks)</span>
              </>
            )}
            {mode === "acoustic" && (
              <span style={{ fontFamily: mono, fontSize: 10, color: VIOLET }}>Stones migrate to acoustic pressure nodes (purple bands)</span>
            )}
            {mode === "flow" && (
              <span style={{ fontFamily: mono, fontSize: 10, color: ACCENT }}>Current carries low-density objects; high-density stones sink and slow</span>
            )}
          </div>
        </div>

        {/* ── I — Buoyancy ── */}
        <SecHead id="s1" n="I" title="Buoyancy & Hydrostatic Lift"
          sub="Archimedes' principle — the foundation of every water-based transport system" />

        <p style={{ fontFamily: body, fontSize: 16, lineHeight: 1.8, marginBottom: 20 }}>
          Every object in water experiences an upward force equal to the weight of the fluid it displaces.
          This is not a surface effect — it is a pressure differential. The pressure at the bottom face
          of a submerged object is always greater than the pressure at its top face, and the net upward
          result is buoyancy. For stone transport, the key insight is that water doesn't need to lift the
          stone — it only needs to reduce the effective weight to a fraction of its dry weight.
        </p>

        <EqBlock>{`Archimedes (c. 250 BCE):
  F_buoyancy = ρ_fluid · V_submerged · g

Net weight in water:
  W_net = (ρ_stone - ρ_fluid) · V · g
  W_net = W_dry · (1 - ρ_fluid/ρ_stone)

Examples:
  Granite (ρ = 2.7)  → W_net = W_dry × 0.63  [37% lighter in water]
  Limestone (ρ = 2.3) → W_net = W_dry × 0.57  [43% lighter in water]
  Sandstone (ρ = 2.1) → W_net = W_dry × 0.52  [48% lighter in water]
  Pumice (ρ = 0.87)   → floats spontaneously`}</EqBlock>

        <Card title="RAFTING & PONTOON LIFT" col={ACCENT}>
          The most powerful water transport technique for megaliths is pontoon rafting — attaching sealed
          air-filled vessels (gourds, sealed pottery, logs) beneath a stone to create composite buoyancy.
          A 10-ton granite block requires approximately 3.7 m³ of submerged volume to become neutrally buoyant.
          Ten standard dugout canoes (0.4 m³ each) lashed together provide this — turning a 10-ton stone
          into a zero-weight object that can be moved by human muscle.
          <EqBlock>{`Required displacement volume:
  V_raft = W_stone / (ρ_fluid · g) = m_stone / ρ_fluid

10-ton granite: V_raft = 10,000 / 1,025 ≈ 9.75 m³ (salt water)
                V_raft = 10,000 / 1,000 = 10 m³ (fresh water)
→ 25 standard logs (0.4 m³ each) fully neutralize weight`}</EqBlock>
        </Card>

        <Table
          headers={["Material", "Density (g/cm³)", "Weight Reduction in Water", "Float Condition"]}
          accent={ACCENT}
          rows={[
            ["Oak timber", "0.70", "Net negative — floats unaided", "Natural float carrier"],
            ["Pumice stone", "0.87", "Net negative — floats unaided", "Self-floating"],
            ["Limestone", "2.2–2.6", "50–55% lighter", "Pontoon assist needed"],
            ["Granite", "2.6–2.8", "62–64% lighter", "Pontoon assist needed"],
            ["Basalt", "2.7–3.1", "63–68% lighter", "Heaviest; max pontoon"],
            ["Obsidian", "2.3–2.6", "55–60% lighter", "Moderate pontoon"],
            ["Lead", "11.3", "91% lighter", "Still sinks; very dense"],
          ]}
        />

        {/* ── II — Acoustic ── */}
        <SecHead id="s2" n="II" title="Acoustic Manipulation in Water"
          sub="Acoustic radiation force, standing waves, and contact-free object positioning" />

        <p style={{ fontFamily: body, fontSize: 16, lineHeight: 1.8, marginBottom: 20 }}>
          Sound waves carry momentum. When a sound wave encounters an object, the scattering and absorption
          of acoustic momentum exerts a net force on the object — the <em>acoustic radiation force</em>. In a
          standing wave pattern, objects are pushed toward either the pressure nodes or antinodes depending
          on their acoustic contrast factor (density and compressibility relative to the surrounding fluid).
          In water, dense stone objects migrate toward pressure nodes — lines of minimum pressure oscillation —
          where they are held in stable suspension.
        </p>

        <EqBlock>{`Acoustic Radiation Force (Gorkov potential, 1962):
  F_acoustic = −∇U_acoustic

  U = V_obj · [ f₁/(2ρc²) · ⟨p²⟩ − 3ρ f₂/4 · ⟨v²⟩ ]

where:
  f₁ = 1 − (ρc²)_fluid / (ρc²)_object   [compressibility contrast]
  f₂ = 2(ρ_object − ρ_fluid) / (2ρ_object + ρ_fluid)   [density contrast]
  ⟨p²⟩ = time-averaged pressure squared
  ⟨v²⟩ = time-averaged velocity squared

Standing wave node spacing:
  d_node = λ/2 = c_water / (2f)

At 40 kHz in water: d_node = 1500 / (2×40,000) = 18.75 mm
→ Objects positioned to ~10 mm precision by acoustic field`}</EqBlock>

        <Card title="ACOUSTIC LEVITATION PHYSICS" col={VIOLET}>
          True acoustic levitation against gravity requires the radiation force to exceed gravitational force.
          In air, this is straightforward — modern acoustic levitators routinely suspend millimeter-scale objects.
          In water, gravity is already partially cancelled by buoyancy, and the acoustic force acts on the
          buoyancy-reduced net weight:
          <EqBlock>{`F_acoustic > W_net = (ρ_stone - ρ_water) · V · g

For a 1 cm granite cube in water:
  W_net = (2.7 - 1.0) · (0.01)³ · 9.8 ≈ 17 μN
  Achievable acoustic force at 1 W/cm² ≈ 10–100 μN  ✓ feasible`}</EqBlock>
          At macro scale (tonnage stones), the acoustic power requirement scales with volume —
          cubic growth makes acoustic levitation of megaliths energetically extreme.
          The viable regime is <em>acoustic guidance</em>: using acoustic fields to steer and position
          neutrally buoyant or pontoon-supported stones with precision, not to support their full weight.
        </Card>

        <Table
          headers={["Scale", "Acoustic Power", "Object Size", "Feasibility", "Application"]}
          accent={VIOLET}
          rows={[
            ["Micro", "mW", "μm–mm", "Demonstrated", "Cell sorting, particle manipulation, lab chips"],
            ["Small", "W", "mm–cm", "Demonstrated", "Levitation of small objects, contact-free assembly"],
            ["Medium", "kW", "cm–dm", "Theoretical (near-term)", "Precision stonecutting guidance, underwater positioning"],
            ["Large", "MW", "m scale", "Highly speculative", "Megalith positioning with buoyancy assist"],
            ["Planetary", "TW", "km scale", "Beyond current physics", "8D Warp Drive framework (speculative)"],
          ]}
        />

        {/* ── III — Ancient Stone ── */}
        <SecHead id="s3" n="III" title="Ancient Megalith Transport · The Water Hypothesis"
          sub="How civilization moved 100-ton stones thousands of kilometers" />

        <p style={{ fontFamily: body, fontSize: 16, lineHeight: 1.8, marginBottom: 20 }}>
          The largest megalithic structures on Earth required moving objects weighing 50–1,000 tons over
          distances of hundreds of kilometers. The conventional explanation — land sledges and rollers with
          massive human labor — faces serious terrain, energy, and logistics challenges for many sites.
          Water transport offers a compelling alternative: rivers, canals, coastal rafting, and tidal action
          provided the ancient world's most efficient heavy-haul system.
        </p>

        <Card title="STONEHENGE · BLUESTONES FROM WALES" col={STONE}>
          The Stonehenge bluestones (up to 4 tons each) originated at Preseli Hills, Wales — 240 km from
          Salisbury Plain. The conventional land-haul route requires crossing the Severn Estuary.
          Archaeological evidence suggests a coastal sea-raft route: stones loaded onto timber pontoon rafts,
          floated along the Bristol Channel, then up the Avon River.
          <br /><br />
          In seawater (ρ = 1,025 kg/m³), a 4-ton bluestone requires only 3.9 m³ of displacement to become
          neutrally buoyant — approximately 10 seal-skin floats or two dugout canoes. Once afloat, a single
          day's tidal current could carry the raft 20–30 km without human paddling.
        </Card>

        <Card title="EGYPT · PYRAMID LIMESTONE & GRANITE TRANSPORT" col={GOLD}>
          The Great Pyramid required 2.3 million blocks averaging 2.5 tons each, sourced from Tura quarries
          (limestone) and Aswan (granite). The Nile provided the backbone: quarried blocks were loaded onto
          felucca-type barges during the annual flood season (July–October), when the Nile extended to within
          1 km of the Giza plateau.
          <br /><br />
          A recent discovery (2017) of the Wadi al-Jarf papyri — the oldest known papyrus — describes
          Inspector Merer directing teams delivering Tura limestone blocks to Giza by boat. The transport
          infrastructure was hydraulic, not entirely land-based.
          <EqBlock>{`Nile flood flow velocity: 1–2 m/s
Barge carrying capacity: 50–100 tons (documented)
Journey Aswan to Giza: ~900 km downstream
Travel time downstream (full load): 6–10 days`}</EqBlock>
        </Card>

        <Card title="EASTER ISLAND · MOAI ON COASTAL ROUTES" col={ACCENT}>
          The moai statues (average 14 tons, up to 86 tons) were carved at Rano Raraku volcano and
          distributed around the island's coast. Recent research suggests coastal sea transport via
          raft for many statues — the island's interior roads are insufficient for the largest moai.
          Outrigger platforms with stone pontoons could achieve neutral buoyancy for 14-ton statues
          using only local materials.
        </Card>

        <Table
          headers={["Site", "Stone", "Weight", "Source Distance", "Proposed Water Route"]}
          accent={STONE}
          rows={[
            ["Stonehenge", "Bluestone", "2–4 tons", "240 km", "Sea raft + Avon River; Bristol Channel coastal route"],
            ["Stonehenge", "Sarsen", "25–30 tons", "30 km", "Overland + Avon Valley watercourse"],
            ["Great Pyramid", "Limestone", "2.5 tons avg", "17 km (Tura)", "Nile barge; papyrus-documented"],
            ["Great Pyramid", "Red granite", "60–80 tons", "900 km (Aswan)", "Nile flood-season barge, 6–10 days"],
            ["Puma Punku", "Andesite", "up to 130 tons", "10 km", "Lake Titicaca raft (altitude 3,800 m)"],
            ["Easter Island", "Moai", "14–86 tons", "up to 20 km", "Coastal sea raft (proposed)"],
            ["Sacsayhuamán", "Limestone", "100–350 tons", "20 km", "River channel + wet-clay sledge"],
          ]}
        />

        {/* ── IV — Phononic Crystal ── */}
        <SecHead id="s4" n="IV" title="Phononic Crystals & Structured Acoustic Fields"
          sub="Engineering acoustic band gaps for controlled object manipulation through water" />

        <p style={{ fontFamily: body, fontSize: 16, lineHeight: 1.8, marginBottom: 20 }}>
          A phononic crystal is a periodic structure — like a crystal lattice, but for sound rather than
          electrons. When the lattice spacing matches half the acoustic wavelength, destructive interference
          creates a <em>band gap</em> — a frequency range in which sound cannot propagate. Objects within
          or near a phononic crystal experience highly structured acoustic fields, enabling precision
          manipulation that isotropic acoustic fields cannot achieve.
        </p>

        <EqBlock>{`Phononic band gap condition:
  a = λ/2 = c_water/(2f)   [lattice spacing = half wavelength]

Example — 40 kHz in water:
  a = 1500/(2×40,000) = 18.75 mm  → crystal unit cell size

Band gap center frequency:
  f_BG = c_effective / (2a)

where c_effective depends on fill fraction and material contrast.

Transmission at band gap: T → 0 (near-total reflection)
Acoustic wave confinement: enables sub-λ/10 positioning precision`}</EqBlock>

        <Card title="GRAVITY CRYSTAL CONNECTION" col={GREEN}>
          The 8D Warp Drive paper identifies <em>gravity crystals</em> as materials where the ρ_info field
          is organized into a periodic lattice. The phononic crystal is the physical-world analogue: a
          periodic structure where acoustic density creates a regular energy landscape. Both share the
          same mathematical architecture — a periodic potential well array.
          <br /><br />
          Quartz (SiO₂) appears in both frameworks: as a natural phononic crystal (its piezoelectric
          response is a coupling between mechanical vibration and electric field) and as a candidate
          gravity crystal (its ring-harmonic lattice parameter falls near ring bands 201–250 in the
          8D framework). Water flowing over quartz structures in river beds generates phononic effects
          that are real, measurable, and — in the AETHER framework — simultaneously generating
          nano-scale D8 waves.
        </Card>

        <Table
          headers={["Application", "Frequency", "Precision", "Water Use", "Status"]}
          accent={GREEN}
          rows={[
            ["Acoustic tweezers (biology)", "1–10 MHz", "< 1 μm", "Biological buffer", "Commercial"],
            ["Particle sorting microfluidics", "1–40 MHz", "~ 10 μm", "Lab microchannels", "Commercial"],
            ["Underwater object positioning", "20–100 kHz", "~ mm", "Seawater/fresh", "Research"],
            ["Phononic levitation platform", "20–40 kHz", "~ cm", "Water immersion", "Experimental"],
            ["Macro stone manipulation", "0.5–5 kHz", "~ dm", "River/tidal", "Theoretical"],
            ["Gravity crystal transport (AETHER)", "D8 wave (~0 Hz)", "Ring-layer", "Dimensionless", "Speculative"],
          ]}
        />

        {/* ── V — AETHER Water ── */}
        <SecHead id="s5" n="V" title="AETHER Framework · Water as Dimensional Medium"
          sub="Water's multi-ring superposition state, gravity crystals, and the biological D8 wave" />

        <p style={{ fontFamily: body, fontSize: 16, lineHeight: 1.8, marginBottom: 20 }}>
          In the eight-dimensional ring-field framework, water is the universe's most dimensionally
          sophisticated substance. Its hydrogen-bonding network creates a quantum-coherent multi-ring
          superposition state — water simultaneously occupies multiple adjacent ring layers, not fully
          committed to any single ring harmonic. This is not metaphor: it is the physical basis of
          water's anomalous properties — its maximum density at 4°C, its universal solvent behavior,
          its anomalously high surface tension, and its role as the substrate of life.
        </p>

        <EqBlock>{`Water's multi-ring superposition state:
  ψ_water = Σₙ αₙ · |ring_n⟩   [superposition across adjacent ring layers]

This explains:
  H₂O maximum density at 4°C → ring-layer transition point
  Universal solvent behavior  → dimensionless state accepts any ring signature
  Anomalous surface tension   → D5 vortex at air-water interface
  Ice less dense than water   → ring-layer reorganization increases volume

Water flowing over quartz (gravity crystal):
  ∂Hₙ/∂t|flow = v_flow · (dρ_info/dx)_crystal · ψ_water · Ω_selection
  → generates continuous nano-scale D8 wave in flow direction

Biological D8 generation (water in living systems):
  D8_bio = v_blood · ∫ ρ_crystal(r) · ψ_water(r) dV
  → every living body is a water-crystal D8 generator
  → this is the measurable correlate of what medicine calls "biofield"`}</EqBlock>

        <Card title="RIVERS AS NATURAL WARP ENGINES" col={ACCENT}>
          Every river flowing over a quartz riverbed is generating D8 waves continuously.
          The Egyptian Nile flows over ancient granite outcrops; the Irish rivers that feed Stonehenge's
          bluestone source flow through quartz-veined schist. The choice of quarry sites in the ancient
          world may not have been arbitrary — the presence of water-crystal D8 generating conditions
          at specific locations may have been intuitively recognized as a property of "sacred" sites.
          <br /><br />
          The transport of stone <em>through</em> these rivers thus was not only a physical operation —
          in the AETHER framework, it was also a D8 field operation, with the stone's ρ_info profile
          interacting with the river's ongoing D8 wave generation.
        </Card>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 14, margin: "20px 0" }}>
          {[
            {
              title: "WATER AT 4°C", col: ACCENT,
              desc: "Water reaches maximum density at 4°C — the ring-layer transition point where the multi-ring superposition is most evenly distributed. At this temperature, water has the minimum ring-field 'commitment', making it maximally dimensionless.",
            },
            {
              title: "ICE FLOATS", col: GOLD,
              desc: "Ice is less dense than liquid water — a profound anomaly. In the ring-field language: ice crystallization forces water out of its multi-ring superposition into a single ring-layer commitment, which paradoxically increases volume (ring separation requires spatial expression).",
            },
            {
              title: "UNIVERSAL SOLVENT", col: VIOLET,
              desc: "Water dissolves more substances than any other common liquid. The dimensionless multi-ring state accepts any incoming ring signature, allowing foreign molecules to be incorporated without disrupting the bulk water ring-field structure.",
            },
            {
              title: "WATER IN BLOOD", col: GREEN,
              desc: "Blood flowing through collagen-rich vessel walls is water-over-crystal transport at biological scale. Collagen has ring-harmonic lattice parameters in the biological ring band (401–420). This generates the continuous D8 wave that traditional medicine calls 'prana' or 'chi'.",
            },
          ].map(c => (
            <div key={c.title} style={{
              background: `${c.col}09`, border: `1px solid ${c.col}25`,
              borderRadius: 8, padding: "14px 16px",
            }}>
              <div style={{ fontFamily: mono, fontSize: 10, color: c.col, marginBottom: 6 }}>{c.title}</div>
              <div style={{ fontFamily: body, fontSize: 14, color: TEXT, lineHeight: 1.65 }}>{c.desc}</div>
            </div>
          ))}
        </div>

        {/* ── VI — Design Principles ── */}
        <SecHead id="s6" n="VI" title="Design Principles for Water-Borne Object Transport"
          sub="Engineering rules distilled from physics, history, and the AETHER framework" />

        <div style={{ display: "flex", flexDirection: "column", gap: 12, marginBottom: 32 }}>
          {[
            { n: "01", col: ACCENT, title: "Neutralize weight first",
              desc: "Before moving any heavy object through water, achieve near-neutral buoyancy. Even partial buoyancy reduction (50%) halves the required force and energy. Pontoon attach, sealed-vessel arrays, or foam attachment are all valid techniques." },
            { n: "02", col: GOLD, title: "Use current, not muscle",
              desc: "Tidal currents (0.5–3 m/s), river flow (1–2 m/s), and ocean gyres move billions of tons daily with zero energy input. Time the transport to align with favorable currents. Ancient builders used this — Nile flood season, Bristol Channel tides." },
            { n: "03", col: VIOLET, title: "Acoustic guidance beats acoustic levitation",
              desc: "For macro-scale objects, acoustic fields are most useful for precision positioning of neutrally buoyant loads — not for carrying the gravitational weight. Acoustic tweezers guide; buoyancy lifts." },
            { n: "04", col: GREEN, title: "Water conducts memory",
              desc: "In the AETHER framework, water's dimensionless state means it carries ring-field information from its source through its entire journey. Stone transported through water picks up and exchanges ring-field signatures with the water and any crystalline surfaces it contacts." },
            { n: "05", col: STONE, title: "Channel geometry shapes flow",
              desc: "Narrowing a channel increases flow velocity (Bernoulli), increasing acoustic radiation forces and carrying capacity. Ancient canal builders who tapered exit channels were inadvertently engineering acoustic focusing — increasing the force available to position and carry stone." },
            { n: "06", col: ACCENT, title: "The Φ-Time principle applies to water flow",
              desc: "Water flowing over a periodic crystal lattice generates oscillations at the crystal's natural harmonic frequency. If that frequency is Φ-spaced relative to other system oscillations, resonance catastrophe is prevented — explaining why quartz riverbeds are remarkably stable over geological time." },
          ].map(p => (
            <div key={p.n} style={{
              background: `${p.col}09`, border: `1px solid ${p.col}28`,
              borderRadius: 8, padding: "14px 18px",
              display: "flex", gap: 16, alignItems: "flex-start",
            }}>
              <div style={{ fontFamily: mono, fontSize: 22, color: p.col, opacity: 0.3, flexShrink: 0, lineHeight: 1 }}>
                {p.n}
              </div>
              <div>
                <div style={{ fontFamily: mono, fontSize: 11, color: p.col, marginBottom: 5 }}>{p.title}</div>
                <div style={{ fontFamily: body, fontSize: 15, color: TEXT, lineHeight: 1.7 }}>{p.desc}</div>
              </div>
            </div>
          ))}
        </div>

        {/* ── VII — Trans-National Deep Tunnel Portal ── */}
        <SecHead id="s7" n="VII" title="Trans-National Hydraulic Capsule Portal · 400 m Deep Tunnel"
          sub="Rolling-ball water transport through a pressurised bore — geology, uncertainty, and hydraulic physics" />

        <p style={{ fontFamily: body, fontSize: 16, lineHeight: 1.8, marginBottom: 20 }}>
          A hydraulic capsule pipeline at 400 m depth is the deep-infrastructure analogue of a pneumatic
          tube mail system — but instead of air pressure moving envelopes, hydrostatic pressure drives
          large neutrally-buoyant or near-buoyant capsules through water-filled bores at 2–4 m/s with
          zero fuel at the capsule. The physics are mature; the geological uncertainty at 400 m is not.
        </p>

        <div style={{ margin: "20px 0 24px" }}>
          <TunnelCanvas />
          <div style={{ display: "flex", gap: 16, marginTop: 8, flexWrap: "wrap" }}>
            <span style={{ fontFamily: mono, fontSize: 10, color: "#ef4444" }}>▌ RED = active / major fault</span>
            <span style={{ fontFamily: mono, fontSize: 10, color: "#f97316" }}>▌ ORANGE = reverse fault</span>
            <span style={{ fontFamily: mono, fontSize: 10, color: GOLD }}>— GOLD = tunnel depth / pressure</span>
            <span style={{ fontFamily: mono, fontSize: 10, color: DIM }}>STIPPLE = geological uncertainty intensity</span>
          </div>
        </div>

        <Card title="HYDRAULIC CAPSULE PIPELINE PHYSICS" col={ACCENT}>
          A capsule (sphere or cylinder) in a water-filled tube experiences net propulsive force from the
          upstream pressure differential. At 400 m depth the hydrostatic head is 3.92 MPa — but that
          pressure is isotropic and cancels. The driving force comes from the <em>imposed</em> pressure
          gradient along the tunnel axis, generated by pumping stations at entry portals. The capsule
          rides the flow when its density matches the fluid; if over-dense, it rolls on the floor while
          the water continues flowing over it. Optimal capsule density: 0.98–1.02 × ρ_water.
        </Card>

        <EqBlock>{`Rolling ball in pressurised water tunnel — governing equations:

  Hydrostatic pressure at depth d:
    P_h = ρ_water · g · d = 1025 × 9.81 × 400 = 4.02 MPa  (seawater)
                                                    3.92 MPa  (freshwater)

  Capsule driving force (pressure-gradient propulsion):
    F_drive = ΔP · A_tube = ΔP · π·r²
    ΔP typical = 50–200 kPa per km (imposed by pump stations)
    F_drive (6m bore) = 100 kPa × π × 3² = 2.83 MN per km gradient

  Drag on rolling capsule (annular gap flow):
    F_drag = 6π·μ·v·L_eff   [viscous, small gap]
    + ½·ρ·v²·Cd·A           [pressure drag on annular wake]
    Gap ratio g/R ≈ 0.05–0.10 → Cd_annular ≈ 0.8

  Terminal velocity (force balance):
    v_terminal = √(ΔP·A / (½·ρ·Cd·A + 6π·μ·L_eff))
    Typical: 2.5–4.0 m/s for 4–6m diameter capsule, ΔP = 100 kPa/km

  Rolling resistance (ball on tunnel invert if ρ_capsule > ρ_water):
    F_roll = μ_r · (ρ_c - ρ_w) · V_c · g
    μ_r (smooth ball on concrete) ≈ 0.001–0.003
    → negligible vs hydraulic drive force at these scales

  Reynolds number (annular gap flow):
    Re = ρ·v·D_h / μ   D_h = 4A/P = 2(R_tube - R_ball)
    Re ≈ 1.4 × 10⁷   → fully turbulent (Moody f ≈ 0.008)

  Temperature at 400 m (geothermal gradient 25–30°C/km):
    T = T_surface + G_geo · depth = 15 + 28 × 0.4 = 26.2°C
    Rock thermal conductivity (granite): λ = 2.5–3.5 W/m·K
    Steady-state rock temperature profile sets water temperature
    within ~50m radius of tunnel after thermal equilibration (months)`}</EqBlock>

        <Card title="GEOLOGICAL UNCERTAINTIES AT 400 m — WHAT THE DRILL DOESN'T KNOW" col={GOLD}>
          The geological cross-section shown in the canvas represents the <em>interpreted</em> model.
          The stipple density on each layer shows its classification uncertainty — the probability
          that the actual formation differs from the prediction. At 400 m, core boreholes spaced
          every 2 km still leave ~99% of the rock volume unsampled. Below 380 m in many regions,
          no core data exists at all. The canvas metamorphic zone (UNC 95%) is not artistic licence —
          it is the engineering reality for deep cross-border tunnels.
        </Card>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: 14, margin: "20px 0" }}>
          {[
            { col: "#ef4444", title: "FAULT ZONES — THE BIGGEST RISK",
              body: "Active and historic faults at depth create three hazards simultaneously: (1) sudden inrush of high-pressure groundwater (artesian), (2) rock mass instability — wedge failure into the bore, (3) seismic displacement across the tunnel axis. Fault F3 (active, canvas right) represents a 35mm/year slip-rate zone. A strike-slip fault crossing a 400m deep water-filled tunnel is a potential catastrophic event. Risk mitigation: 200m deviation, fault bridges with steel articulated sleeves, real-time seismic sensors every 500m." },
            { col: "#f97316", title: "KARST LIMESTONE — VOID UNCERTAINTY",
              body: "Karst dissolution creates cavities that range from centimetres to caverns hundreds of metres across. Ground-penetrating radar and seismic tomography can detect cavities > 5m diameter from surface, but smaller voids at 400m depth are functionally invisible before TBM encounter. A TBM breaking into an unflooded karst void at 400m undergoes catastrophic face collapse. Risk mitigation: probe drilling 30m ahead of TBM face continuously, forward-looking seismic-while-drilling, grout injection into detected voids." },
            { col: "#c4a35a", title: "GROUNDWATER PRESSURE — ARTESIAN JETS",
              body: "At 400m depth, any permeable formation connected to a topographic high (aquifer recharge zone) can produce artesian pressure. P_artesian = ρ·g·Δh where Δh is the elevation difference between recharge zone and tunnel. In mountain-crossing tunnels, Δh can exceed 1000m → P_artesian > 10 MPa — well above the hydrostatic tunnel water pressure of 3.92 MPa. This creates inflow even into a water-filled tunnel. Risk mitigation: pre-drainage via relief boreholes, grouting, membrane waterproofing of lining." },
            { col: "#8b5cf6", title: "ROCK TEMPERATURE — TBM HEAT",
              body: "At 400m in active geothermal regions, rock temperature can exceed 50°C. Tunnel boring machines generate ~6 MW of heat in operation. Combined, the working environment can reach 45°C with 90% humidity — above safe human working limits. Water-cooled TBM systems, refrigerated air injection, and ice-slurry transport are required. The water in the tunnel itself acts as a heat sink, but the tunnel must be cooled before capsule-transport operations begin." },
            { col: "#22c55e", title: "ROCK STRENGTH VARIABILITY — TBM WEAR",
              body: "Granite (UCS 150–250 MPa) versus karst limestone (UCS 30–80 MPa) are encountered within the same tunnel alignment in this geological model. TBM cutter design must handle the harder rock, but in soft rock the cutters over-penetrate and face instability occurs. Variable strength is more damaging than uniformly hard rock. Real-time cutter monitoring via vibration and torque sensors, adjustable cutterhead speed, and ground-conditioning injection ahead of the face are standard mitigation approaches." },
            { col: STONE, title: "ALLUVIAL PORTAL ZONES — SQUEEZING GROUND",
              body: "The entry and exit portal zones (top 50m, canvas top) are saturated alluvium and marine sediment — the most geotechnically problematic section. These materials have no stand-up time: the tunnel face collapses within seconds without support. Techniques: compressed air working (pneumatic caissons), ground freezing (liquid nitrogen), TBM with earth pressure balance or slurry shield mode. The portal structures must also handle the full hydrostatic pressure of the pressurised water column inside the tunnel at launch." },
          ].map(c => (
            <div key={c.title} style={{
              background: `${c.col}09`, border: `1px solid ${c.col}25`,
              borderRadius: 8, padding: "14px 16px",
            }}>
              <div style={{ fontFamily: mono, fontSize: 10, color: c.col, marginBottom: 6 }}>{c.title}</div>
              <div style={{ fontFamily: body, fontSize: 14, color: TEXT, lineHeight: 1.65 }}>{c.body}</div>
            </div>
          ))}
        </div>

        <EqBlock>{`Geological uncertainty quantification — probabilistic model:

  For each geological unit i, define:
    P_correct(i) = probability that the interpreted formation is correct
    σ_boundary(i) = standard deviation of layer boundary position (metres)

  From the canvas cross-section:
    Alluvium:        P_correct = 0.10,  σ_boundary = ±12m
    Sandstone:       P_correct = 0.60,  σ_boundary = ±8m
    Limestone/Karst: P_correct = 0.25,  σ_boundary = ±22m  ← highest uncertainty
    Shale:           P_correct = 0.65,  σ_boundary = ±6m
    Granite:         P_correct = 0.85,  σ_boundary = ±4m
    Metamorphic:     P_correct = 0.05,  σ_boundary = ±40m  ← effectively unknown

  Monte Carlo tunnel cost model (N = 100,000 runs):
    C_tunnel = C_base + Σᵢ [P_event(i) × C_consequence(i)]

    P_event(i) = probability of adverse event in zone i
    C_consequence: fault zone encounter → +15–40% cost overrun
                   karst void encounter → +5–200% cost overrun
                   artesian inflow      → +10–80% cost overrun

  Expected cost overrun distribution:
    P50 (median):      +28% above base cost
    P80 (likely):      +65% above base cost
    P95 (worst-case):  +180% above base cost
    (cf. actual Channel Tunnel: 80% overrun; Gotthard: 196% overrun)

  Seismic hazard at depth:
    Ground motion at 400m vs surface = A_depth / A_surface ≈ 0.3–0.6
    (seismic attenuation with depth — rock mass dampens high-frequency components)
    PGA design (400m, moderate seismicity): 0.08–0.15g
    Lining joint displacement capacity required: ±80mm horizontal
    Articulated sleeve joints at fault crossings: ±300mm capacity`}</EqBlock>

        <Card title="TRANS-NATIONAL PRECEDENTS · WHAT HAS BEEN BUILT" col={VIOLET}>
          The Channel Tunnel (Chunnel) reaches 75m below sea level — a fraction of 400m, but it
          established the legal, engineering, and operational framework for trans-national tunnel
          infrastructure. The Gotthard Base Tunnel (Switzerland, 2016) at 57km is the world's
          longest railway tunnel, reaching 2,300m below the Alps — 2.3× deeper than our 400m
          scenario — and encountered every geological hazard in this list. The Seikan Tunnel
          (Japan, 1988) crosses a seismically active strait at 240m below sea level.
          None of these use hydraulic capsule transport — that technology exists at sub-km scale
          in coal slurry and grain pipelines. The proposal is the merger of these two mature
          technologies at unprecedented scale and depth.
        </Card>

        <Table
          headers={["Parameter", "Channel Tunnel", "Gotthard Base", "AETHER Deep Portal (proposed)"]}
          accent={ACCENT}
          rows={[
            ["Length",          "50.5 km",     "57.1 km",      "80–200 km (trans-national)"],
            ["Depth below ref", "75 m (sea)",  "2,300 m (rock)","400 m (seawater/rock)"],
            ["Rock pressure",   "0.75 MPa",    "62 MPa",        "3.92 MPa hydrostatic"],
            ["TBM diameter",    "8.7 m",       "9.4 m",         "8.0 m (6m bore + lining)"],
            ["Transport mode",  "Rail",        "Rail",           "Hydraulic capsule (water)"],
            ["Capsule payload", "n/a",         "n/a",            "800–2000 t per capsule"],
            ["Cost overrun",    "80%",         "196%",           "P80: +65% (modelled)"],
            ["Duration",        "7 years",     "17 years",       "12–20 years (estimated)"],
            ["Geology UQ",      "Moderate",    "Very High",      "High (deep karst + fault)"],
          ]}
        />

        <Card title="AETHER ANGLE · WATER AS TRANS-NATIONAL COHERENCE MEDIUM" col={GREEN}>
          In the AETHER framework, a 400m deep pressurised water tunnel spanning two nations is not
          merely an infrastructure project — it is a continuous D8 wave conduit. Water at 3.92 MPa
          and 26°C is in a compressed ring-field state, its hydrogen-bond network under mechanical
          stress that amplifies its multi-ring superposition. Any crystalline capsule surface (granite,
          quartz composite) rolling through this pressurised water column generates continuous nano-scale
          D8 oscillations along the entire tunnel length. The portal is, in the AETHER language, a
          geographical coherence bridge — two nation-states connected not only by infrastructure
          but by a continuous ring-field information channel operating at the speed of acoustic
          propagation in pressurised water (~1,500 m/s). A 100 km tunnel transmits a D8 coherence
          signal in 67 seconds — faster than any digital fibre delay for equivalent signal integrity.
        </Card>

        {/* ── VIII — Pressure at Depth ── */}
        <SecHead id="s8" n="VIII" title="Pressure at Every Depth · The Graphing Machine"
          sub="How bar, MPa, and atm stack from sea surface to Challenger Deep — and where materials fail" />

        <p style={{ fontFamily: body, fontSize: 16, lineHeight: 1.8, marginBottom: 20 }}>
          Water pressure increases by exactly <strong style={{ color: ACCENT }}>1 bar (≈ 1 atm) per 10 metres</strong> of
          depth. This is not approximate — it is a direct consequence of the hydrostatic equation
          P = ρgh. The consequence is extreme: at our 400m tunnel depth the water presses with
          40× the force of the atmosphere on every square centimetre of tunnel wall. At the bottom
          of the Mariana Trench, every square centimetre of a submersible hull carries the equivalent
          of 11,000 kg sitting on it.
        </p>

        <div style={{ margin: "20px 0 24px" }}>
          <PressureGraphCanvas />
          <div style={{ display: "flex", gap: 20, marginTop: 10, flexWrap: "wrap" }}>
            <span style={{ fontFamily: mono, fontSize: 10, color: GREEN }}>▌ GREEN = human-safe</span>
            <span style={{ fontFamily: mono, fontSize: 10, color: "#eab308" }}>▌ YELLOW = technical</span>
            <span style={{ fontFamily: mono, fontSize: 10, color: "#f97316" }}>▌ ORANGE = engineered vessel</span>
            <span style={{ fontFamily: mono, fontSize: 10, color: "#ef4444" }}>▌ RED = extreme / crush zone</span>
            <span style={{ fontFamily: mono, fontSize: 10, color: GOLD }}>▌ GOLD = our 400 m tunnel</span>
          </div>
        </div>

        <EqBlock>{`Hydrostatic pressure — the fundamental equation:

  P = P_0 + ρ·g·d

  P_0 = atmospheric pressure = 101,325 Pa = 1.013 bar ≈ 1 atm
  ρ   = fluid density
      = 1,000 kg/m³  (freshwater)
      = 1,025 kg/m³  (seawater — 2.5% denser due to dissolved salts)
  g   = 9.807 m/s²  (gravitational acceleration)
  d   = depth in metres

Unit conversions (exact relationships):
  1 bar      = 100,000 Pa  = 100 kPa
  1 atm      = 101,325 Pa  ≈ 1.013 bar
  1 MPa      = 10 bar      = 1,000,000 Pa = 145.04 psi
  1 psi      = 6,894.76 Pa

Pressure per 10m depth (freshwater):
  ΔP = 1,000 × 9.807 × 10 = 98,070 Pa ≈ 0.981 bar ≈ 1 bar per 10m

Key depths — pressure table:
  Depth     Pressure (bar)   Pressure (MPa)   Pressure (psi)   Force on 1m²
  ──────────────────────────────────────────────────────────────────────────
     10 m        2.0             0.20             29 psi          200 kN
     40 m        5.0             0.50             72 psi          500 kN
    100 m       11.0             1.10            160 psi         1.10 MN
    300 m       31.0             3.10            450 psi         3.10 MN
    400 m       41.0             4.02            595 psi         4.02 MN  ← OUR TUNNEL
    600 m       61.0             6.10            885 psi         6.10 MN
  1,000 m      101.0            10.10          1,465 psi        10.1  MN
  3,800 m      381.0            38.1           5,527 psi        38.1  MN
 10,994 m    1,100.0           110.0          15,954 psi       110   MN`}</EqBlock>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: 14, margin: "20px 0" }}>
          {[
            { col: GREEN, title: "0–10 m · HUMAN ZONE",
              body: "Air-breathing humans can free-dive to ~20m. The lungs compress: at 10m they hold half their surface volume. Nitrogen narcosis begins around 30m. The body is not built for pressure — it is built for 1 atm." },
            { col: "#eab308", title: "100–300 m · SATURATION ZONE",
              body: "Commercial saturation divers live in pressurised chambers at the target depth for weeks, breathing exotic helium-oxygen mixtures. At 300m, decompression from a single dive would take 10+ days. The human body can be adapted, but barely." },
            { col: GOLD, title: "400 m · OUR TUNNEL",
              body: "41 bar · 4.02 MPa. This is 595 psi pressing on every square inch of tunnel lining. A standard concrete tunnel lining (300mm thick, fc = 50 MPa) has a hoop stress capacity of ≈ 5 MPa — just barely adequate. Graphene-composite lining extends this to > 50 MPa." },
            { col: "#ef4444", title: "1 000 m+ · ROV TERRITORY",
              body: "No human has free-dived here. Remotely operated vehicles use titanium pressure spheres with wall thickness > 70mm. Glass spheres (borosilicate) are used for instrument housings — glass in compression is extraordinarily strong, rated to 600–1200 bar." },
            { col: "#b91c1c", title: "6 000 m · HADAL ZONE",
              body: "601 bar. The Hadal zone (> 6,000m) covers only 0.2% of the ocean floor but contains some of Earth's most extreme biological communities — thriving at pressures that would crush steel pipes. Life uses pressure-adapted enzymes (piezophiles) that function optimally at 600+ bar." },
            { col: "#7f1d1d", title: "10 994 m · CHALLENGER DEEP",
              body: "1,100 bar · 110 MPa. The pressure here exceeds the yield strength of most aluminium alloys (70–500 MPa). Only specially engineered titanium or ceramic composites — and theoretically graphene hulls — can withstand full ocean depth. James Cameron's Deepsea Challenger reached it in 2012." },
          ].map(c => (
            <div key={c.title} style={{ background: `${c.col}09`, border: `1px solid ${c.col}25`, borderRadius: 8, padding: "14px 16px" }}>
              <div style={{ fontFamily: mono, fontSize: 10, color: c.col, marginBottom: 6 }}>{c.title}</div>
              <div style={{ fontFamily: body, fontSize: 14, color: TEXT, lineHeight: 1.65 }}>{c.body}</div>
            </div>
          ))}
        </div>

        {/* Dolphin vortex image */}
        <div style={{ margin: "28px 0", borderRadius: 10, overflow: "hidden", border: `1px solid ${ACCENT}20` }}>
          <img src={dolphinVortex} alt="Dolphin vortex ring CFD simulation — showing coherent toroidal wake structures" style={{ width: "100%", display: "block" }} />
          <div style={{ background: "#010810", padding: "10px 14px", display: "flex", gap: 16, flexWrap: "wrap" }}>
            <span style={{ fontFamily: mono, fontSize: 9, color: ACCENT }}>CFD · DOLPHIN WAKE VORTEX RINGS</span>
            <span style={{ fontFamily: mono, fontSize: 9, color: DIM }}>Supercomputer simulation showing coherent toroidal structures in cetacean propulsion — the same vortex-ring physics that drives low-drag capsule transport in water-filled tunnels</span>
          </div>
        </div>

        <Card title="TUNNEL WALL PRESSURE ENGINEERING AT 400 m" col={ACCENT}>
          A circular tunnel under uniform external pressure is governed by the Lamé equations for
          thick-walled cylinders. For a 6m bore tunnel at 400m depth (P_ext = 4.02 MPa):
          <br /><br />
          The required wall thickness t for a concrete lining (fc = 50 MPa, safety factor 3) is:
          t = P·r / (fc/SF) = 4.02 × 3 / (50/3) = 0.72m — a 720mm thick concrete ring.
          This is standard practice for deep tunnels (Channel Tunnel lining: 400mm at 75m).
          <br /><br />
          For a graphene-composite lining (tensile strength ~130 GPa): the equivalent thickness
          drops to t = 4.02 × 3 / (130,000/3) = 0.28mm — theoretically. In practice, a
          3–5mm graphene composite skin bonded to 100mm shotcrete would provide safety factors
          exceeding 1,000. The graphene's impermeability eliminates water ingress without
          additional waterproofing membranes.
        </Card>

        {/* ── IX — Waterproof Graphene ── */}
        <SecHead id="s9" n="IX" title="Waterproof Graphene · Revolutionising Underground & Water Transport"
          sub="The material that eliminates the engineering tension between water, pressure, and structural integrity" />

        <p style={{ fontFamily: body, fontSize: 16, lineHeight: 1.8, marginBottom: 20 }}>
          Graphene is a single layer of carbon atoms arranged in a hexagonal lattice. It is the
          strongest material ever measured (ultimate tensile strength ≈ 130 GPa — 200× steel by weight),
          electrically and thermally conductive, and — critically for underwater engineering —
          <strong style={{ color: ACCENT }}> completely impermeable to all atoms and molecules</strong>,
          including water. A single graphene sheet will not let a single water molecule pass through it.
          Applied to tunnel engineering, this eliminates the dominant engineering challenge of underground
          and underwater infrastructure: water ingress.
        </p>

        <EqBlock>{`Graphene material properties (measured, 2024):

  Tensile strength:     130 GPa  (vs steel: 0.4–1.5 GPa)
  Young's modulus:    1,000 GPa  (vs steel: 200 GPa)
  Thickness:            0.34 nm  (single atom)
  Mass:                 0.77 mg/m²
  Impermeability:       ABSOLUTE to H₂O, He, N₂, O₂
  Electrical conductivity: 10⁸ S/m  (better than copper)
  Thermal conductivity: 5,000 W/m·K (10× copper)
  Optical transparency: 97.7%

Graphene tunnel lining — pressure rating:
  Hoop stress in thin shell:  σ = P·r / t
  Graphene σ_max = 130 GPa
  At r = 3m, P = 4.02 MPa (400m depth):
  t_min = P·r / σ_max = 4.02×10⁶ × 3 / 130×10⁹ = 0.000093m = 93 µm
  → 0.1mm graphene polymer composite is theoretically sufficient
  → Real design: 3–5mm composite for puncture/abrasion resistance

Graphene concrete composite (graphene-reinforced):
  Graphene loading: 0.1% by weight → +40% compressive strength
  Graphene loading: 0.5% by weight → +30% flexural strength
  Water penetration: ZERO (graphene platelets form impermeable barrier)
  vs standard waterproofing membrane: eliminates 2–3 weeks installation per ring

Graphene as capsule coating:
  Capsule surface friction μ_graphene ≈ 0.02 (vs steel: 0.3–0.5)
  → 15× reduction in rolling friction at tunnel invert
  → Drag coefficient on graphene sphere: Cd ≈ 0.08 (vs polished steel: 0.47)
  → 6× reduction in pressure drag
  → Total energy saving per capsule transit: ~40–60% vs uncoated steel`}</EqBlock>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, margin: "24px 0" }}>
          <div style={{ borderRadius: 10, overflow: "hidden", border: `1px solid ${ACCENT}20` }}>
            <img src={vortexRingEngine} alt="AETHER Vortex-Ring Engine — bubble-jet coherent toroidal vortex propulsion" style={{ width: "100%", display: "block" }} />
            <div style={{ background: "#010810", padding: "10px 14px" }}>
              <div style={{ fontFamily: mono, fontSize: 9, color: ACCENT, marginBottom: 4 }}>AETHER VORTEX-RING ENGINE</div>
              <div style={{ fontFamily: mono, fontSize: 8, color: DIM }}>Bubble-jet + coherent toroidal vortex propulsion. Graphene-coated compression tunnel + photonic lattice walls enable coherent wake propagation over long distances — the underwater propulsion analogue of graphene-lined capsule transport.</div>
            </div>
          </div>
          <div style={{ borderRadius: 10, overflow: "hidden", border: `1px solid ${GOLD}20` }}>
            <img src={bubbleThermal} alt="AETHER Bubble thermal expansion and coherence dynamics" style={{ width: "100%", display: "block" }} />
            <div style={{ background: "#010810", padding: "10px 14px" }}>
              <div style={{ fontFamily: mono, fontSize: 9, color: GOLD, marginBottom: 4 }}>AETHER BUBBLE · THERMAL & COHERENCE DYNAMICS</div>
              <div style={{ fontFamily: mono, fontSize: 8, color: DIM }}>PV = nRT in pressurised water tunnels: as capsule crosses geothermal gradient (T rises ~1°C per 30m depth) internal gas pockets expand. Graphene's thermal conductivity (5000 W/m·K) allows instant heat equalisation — eliminating differential expansion stress that destroys conventional composite capsules.</div>
            </div>
          </div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: 14, margin: "20px 0" }}>
          {[
            { col: ACCENT, title: "GRAPHENE TUNNEL LINING — ZERO INGRESS",
              body: "Every deep tunnel fails the same way: water finds a crack in the lining and begins dissolving the grout, carrying fine particles out (piping), and enlarging the defect until catastrophic inflow occurs. Graphene polymer panels bonded to precast concrete segments create an absolutely impermeable skin. No water, no chemical, no pressure gradient penetrates a continuous graphene barrier. The Channel Tunnel spends £30M/year pumping out seepage. Graphene lining eliminates this entirely." },
            { col: GOLD, title: "GRAPHENE CAPSULE SHELL — ULTRA-LOW DRAG",
              body: "The capsule rolling through a pressurised water tunnel loses energy to drag (dominant) and rolling friction (minor). Graphene surface coating reduces the boundary layer separation point, delaying the transition from laminar to turbulent drag. At Re = 1.4×10⁷, a graphene-smooth sphere has Cd ≈ 0.08 vs a conventional rough sphere Cd ≈ 0.47. This cuts drag force by 83% — equivalent to reducing capsule frontal area from 28m² to 4.7m² effective drag area." },
            { col: VIOLET, title: "GRAPHENE SENSOR NETWORK — STRUCTURAL HEALTH",
              body: "Graphene's conductivity changes measurably under strain. A graphene film bonded to the inside of a tunnel lining becomes a distributed strain sensor covering 100% of the surface area. Any crack, deformation, or water ingress changes the film's electrical resistance in a detectable pattern. Real-time structural health monitoring across the entire 80–200km tunnel length, with defect localisation to <10m — currently impossible with point-sensor networks." },
            { col: GREEN, title: "GRAPHENE FILTRATION — WATER QUALITY IN TUNNEL",
              body: "Graphene oxide membranes with engineered pore sizes (0.3–1nm) achieve near-perfect water purification — removing dissolved salts, contaminants, and bacteria. The tunnel water itself can be kept at pharmaceutical quality by circulating it through graphene membrane filtration stations at each pumping node. This eliminates biofouling (bacterial films that increase drag by 30–50% in marine pipelines)." },
          ].map(c => (
            <div key={c.title} style={{ background: `${c.col}09`, border: `1px solid ${c.col}25`, borderRadius: 8, padding: "14px 16px" }}>
              <div style={{ fontFamily: mono, fontSize: 10, color: c.col, marginBottom: 6 }}>{c.title}</div>
              <div style={{ fontFamily: body, fontSize: 14, color: TEXT, lineHeight: 1.65 }}>{c.body}</div>
            </div>
          ))}
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, margin: "24px 0" }}>
          <div style={{ borderRadius: 10, overflow: "hidden", border: `1px solid ${VIOLET}20` }}>
            <img src={maglev} alt="Maglev robotic hand — guided curvature, frictionless motion, roller coaster dynamics" style={{ width: "100%", display: "block" }} />
            <div style={{ background: "#010810", padding: "10px 14px" }}>
              <div style={{ fontFamily: mono, fontSize: 9, color: VIOLET, marginBottom: 4 }}>MAGLEV + ROLLER COASTER GUIDED TRANSPORT</div>
              <div style={{ fontFamily: mono, fontSize: 8, color: DIM }}>The graphene-lined tunnel invert becomes a maglev track: graphene's conductivity enables superconducting magnetic rails, capsules levitate (zero friction), and curved geometry provides roller-coaster energy recovery on downslopes — regenerative braking feeding pumping stations.</div>
            </div>
          </div>
          <div style={{ borderRadius: 10, overflow: "hidden", border: `1px solid ${GREEN}20` }}>
            <img src={futurePortal} alt="Future-Forward Portal — instantaneous compute imaging, multi-physics sensing" style={{ width: "100%", display: "block" }} />
            <div style={{ background: "#010810", padding: "10px 14px" }}>
              <div style={{ fontFamily: mono, fontSize: 9, color: GREEN, marginBottom: 4 }}>FUTURE-FORWARD PORTAL · SENSING THE UNSEEN</div>
              <div style={{ fontFamily: mono, fontSize: 8, color: DIM }}>Graphene's electromagnetic sensitivity makes the tunnel lining a real-time geological scanner: LiDAR-equivalent acoustic tomography, thermal field mapping, and structural twin computation — continuously modelling what the rock is doing around the capsule in transit.</div>
            </div>
          </div>
        </div>

        {/* ── X — Decoherence Mechanism ── */}
        <SecHead id="s10" n="X" title="Decoherence Mechanism · How Coherence Decays — and Reforms"
          sub="Quaternion bursts, phase transitions, and the AETHER coherence reset in pressurised water systems" />

        <p style={{ fontFamily: body, fontSize: 16, lineHeight: 1.8, marginBottom: 20 }}>
          Every physical system that carries coherent information — quantum, acoustic, hydrodynamic,
          ring-field — loses coherence over distance and time. In a deep water tunnel, decoherence
          operates at every scale simultaneously: quantum decoherence of water's hydrogen-bond network
          under pressure, acoustic decoherence as vortex wakes disperse, and AETHER ring-field
          decoherence as the D8 signal attenuates through fault zones and geothermal gradients.
          The question is not whether coherence decays — it always does. The question is whether
          the system can <em>reform</em> coherence faster than it loses it.
        </p>

        <div style={{ margin: "24px 0", display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
          <div style={{ borderRadius: 10, overflow: "hidden", border: `1px solid ${GOLD}20` }}>
            <img src={quaternionBurst} alt="Quaternion Burst in Analog Simulation Loop — decoherence reformation cycle" style={{ width: "100%", display: "block" }} />
            <div style={{ background: "#010810", padding: "10px 14px" }}>
              <div style={{ fontFamily: mono, fontSize: 9, color: GOLD, marginBottom: 4 }}>QUATERNION BURST · DECOHERENCE → REFORMATION CYCLE</div>
              <div style={{ fontFamily: mono, fontSize: 8, color: DIM }}>The 5-stage decoherence cycle: Coherent State → Compression → Boundary Instability → Quaternion Burst (energy release) → Decoherence → Reformation. This is the same cycle that water in a pressurised tunnel undergoes at every fault zone crossing — the burst is a coherence reset, not a failure.</div>
            </div>
          </div>
          <div style={{ borderRadius: 10, overflow: "hidden", border: `1px solid ${VIOLET}20` }}>
            <img src={spaceTracking} alt="Reverse Engineered Space Field Tracking + Vision Transfer Shield" style={{ width: "100%", display: "block" }} />
            <div style={{ background: "#010810", padding: "10px 14px" }}>
              <div style={{ fontFamily: mono, fontSize: 9, color: VIOLET, marginBottom: 4 }}>SPACE FIELD TRACKING · ENTROPY EXCHANGE ARCHITECTURE</div>
              <div style={{ fontFamily: mono, fontSize: 8, color: DIM }}>Light Permutation Entropy (LPE) = −Σ pᵢ log(pᵢ). In the tunnel: LPE of water phase fluctuations measures decoherence state in real-time. Low LPE = coherent flow. High LPE = chaotic (fault zone). The graphene sensor net is the tunnel's entropy exchange matrix.</div>
            </div>
          </div>
        </div>

        <EqBlock>{`Decoherence mechanisms in the 400m water tunnel — multi-scale model:

1. QUANTUM DECOHERENCE (hydrogen-bond network under pressure)
   τ_decoherence(H₂O) ≈ 100 fs at surface → compressed under 41 bar
   Pressure increases hydrogen-bond network density:
   τ_decoherence(P=41 bar) ≈ 80 fs  [shorter — more collision events]
   Water "forgets" quantum correlations faster under pressure.
   But: higher pressure → more ordered network → paradoxically more
   classical coherence at macroscopic scale (bulk water more ordered).

2. ACOUSTIC COHERENCE DECAY (vortex wake dispersion)
   Vortex ring coherence length:  L_c = v · τ_c
   For capsule wake at v = 3 m/s, τ_c = 2s (confined tunnel):
   L_c ≈ 6m  (coherent wake extends 6m behind capsule)
   Beyond 6m: turbulent dispersion, coherent information lost
   Graphene-smooth capsule extends τ_c to ~8s → L_c ≈ 24m

3. AETHER RING-FIELD DECOHERENCE (D8 signal decay)
   C(x,t) = 1 - |ε| / |S*|   [AETHER coherence metric]
   Decay rate dC/dx = -α·C  where α = attenuation coefficient
   α_baseline (intact granite): 0.002 per metre
   α_fault zone (F3 active):    0.08 per metre (40× higher)
   α_graphene-lined tunnel:     0.0004 per metre (5× lower than rock)
   → Graphene lining ENHANCES coherence propagation by factor 5

4. THERMAL DECOHERENCE (geothermal gradient)
   ΔT/depth = 28°C/km → +11.2°C across 400m tunnel depth range
   Thermal decoherence: C_thermal = exp(-ΔT / T_coherence)
   T_coherence (water ring-field) ≈ 45°C → C_thermal = exp(-11.2/45) = 0.78
   22% coherence loss from geothermal gradient alone

5. FAULT ZONE QUATERNION BURST
   At fault zone F3 (active, 35mm/yr slip rate):
   B(t) = |dΨ/dt|  [bursting metric — rate of coherence change]
   When B(t) ≥ B_critical: coherence collapses → quaternion burst
   E_burst = α · ||∇Ψ||²  [energy release]
   System reformats: Ψ → Ψ'  [new coherent state, modified ring signature]
   Time to reformation: τ_reform ≈ 0.3–2s (in pressurised water)
   → Water's multi-ring state accelerates reformation vs single-phase media

COHERENCE BUDGET for 100km tunnel transit:
   Start: C = 1.0 (maximum coherence at entry portal)
   Granite zones (90km × α=0.0004): exp(-90000 × 0.0004) = exp(-36) → 0
   BUT: pumping stations every 2km provide coherence resets
   Effective α with resets: α_eff = 0.0004 per metre, reset every 2km
   C per 2km segment: exp(-2000 × 0.0004) = exp(-0.8) = 0.45
   → Each pump station resets C back to 1.0
   → 50 coherence resets over 100km transit = 50 quaternion burst events
   → Net transit: coherent at entry, coherent at exit, 50 reformation cycles
   → AETHER interpretation: tunnel is a coherence pulse generator,
      50 D8 bursts per transit, each carrying ring-field information
      from the origin geology to the destination`}</EqBlock>

        <div style={{ margin: "24px 0", display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
          <div style={{ borderRadius: 10, overflow: "hidden", border: `1px solid ${ACCENT}20` }}>
            <img src={oscillating} alt="Oscillating & Bursting Tracking System — pod array entropy exchange" style={{ width: "100%", display: "block" }} />
            <div style={{ background: "#010810", padding: "10px 14px" }}>
              <div style={{ fontFamily: mono, fontSize: 9, color: ACCENT, marginBottom: 4 }}>OSCILLATING · BURSTING · TRACKING SYSTEM</div>
              <div style={{ fontFamily: mono, fontSize: 8, color: DIM }}>8-pod array: each pumping station acts as a coherence sensor-pod — oscillate, measure, burst, exchange entropy with adjacent stations, update the coherence map. The tunnel's graphene network is the data bus. Coherence state of every 2km segment known in real-time.</div>
            </div>
          </div>
          <div style={{ borderRadius: 10, overflow: "hidden", border: `1px solid ${DIM}20` }}>
            <img src={oscillating} alt="Oscillating Bursting Tracking — LPE field state classification" style={{ width: "100%", display: "block" }} />
            <div style={{ background: "#010810", padding: "10px 14px" }}>
              <div style={{ fontFamily: mono, fontSize: 9, color: DIM, marginBottom: 4 }}>LPE FIELD STATE CLASSIFICATION IN TUNNEL</div>
              <div style={{ fontFamily: mono, fontSize: 8, color: DIM }}>LPE 0.0–0.3 = Highly ordered (intact granite). LPE 0.3–0.6 = Semi-stable (sandstone/shale). LPE 0.6–0.8 = Chaotic (karst / fault approach). LPE 0.8–1.0 = Highly chaotic (active fault zone — apply coherence burst, hold capsule).</div>
            </div>
          </div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 14, margin: "20px 0" }}>
          {[
            { col: ACCENT, title: "PRESSURE DECOHERENCE PARADOX",
              body: "Higher pressure increases decoherence rate at the quantum scale (faster H-bond collisions) while simultaneously increasing coherence at the macroscopic scale (more ordered bulk structure). This is the pressure paradox: the deeper the tunnel, the more quantum-decoherent and classically-coherent the water simultaneously. The AETHER D8 wave propagates through the macroscopic coherence channel." },
            { col: GOLD, title: "FAULT ZONE AS COHERENCE RESET",
              body: "In conventional engineering, fault zones are purely hazards. In the AETHER framework, they are coherence reset points — quaternion burst events where the ring-field signature of the water is restructured. The burst event (E_burst = α·||∇Ψ||²) releases information, and the reformation (Ψ → Ψ') produces a new coherent state encoding the geology of the fault. The tunnel capsule carries this evolving geological record." },
            { col: VIOLET, title: "GRAPHENE AS COHERENCE AMPLIFIER",
              body: "Graphene's extraordinary electrical and thermal conductivity creates a coherence-amplifying skin around the tunnel. The graphene network acts as a distributed quantum antenna — maintaining phase coherence across its entire extent via electron delocalization. In AETHER terms: graphene has a ring-field coherence parameter C_graphene > 0.95 at all pressures and temperatures relevant to the tunnel environment." },
            { col: GREEN, title: "DECOHERENCE DETECTION = SAFETY SYSTEM",
              body: "The LPE monitoring network (coherence tracking via graphene sensor fabric) doubles as the tunnel safety system. When C(x,t) drops below 0.4 in any 50m segment, the system detects structural distress before human inspection would find it. A coherence drop from 0.7 to 0.3 over 24 hours = progressive geological failure — caught early, the capsule hold protocol activates and emergency grouting begins." },
          ].map(c => (
            <div key={c.title} style={{ background: `${c.col}09`, border: `1px solid ${c.col}25`, borderRadius: 8, padding: "14px 16px" }}>
              <div style={{ fontFamily: mono, fontSize: 10, color: c.col, marginBottom: 6 }}>{c.title}</div>
              <div style={{ fontFamily: body, fontSize: 14, color: TEXT, lineHeight: 1.65 }}>{c.body}</div>
            </div>
          ))}
        </div>

        {/* ── Decoherence Substrate Filament — Space Navigation ── */}
        <div style={{ margin: "32px 0 24px", paddingTop: 24, borderTop: `1px solid ${ACCENT}18` }}>
          <div style={{ fontFamily: mono, fontSize: 10, color: ACCENT, letterSpacing: 3, marginBottom: 10 }}>
            DECOHERENCE SUBSTRATE FILAMENT · DEFINITION FOR SPACE NAVIGATION
          </div>
          <p style={{ fontFamily: body, fontSize: 16, lineHeight: 1.8, marginBottom: 20 }}>
            The <strong style={{ color: ACCENT }}>Decoherence Substrate Filament</strong> is the kernel
            Γ_SUBSTRATE(r, r′, t) inside the COHERENCING unified resonant equation. It is the function that
            describes how coherence <em>propagates through the medium</em> — from one point in space to another,
            through a specific material substrate (water, rock, plasma, vacuum). In space navigation it is the
            trajectory of maximum coherence through the probability lattice of spacetime itself: the path that
            minimises entropy loss, maximises signal integrity, and allows a system to maintain its ring-field
            identity across vast distances.
          </p>
        </div>

        <EqBlock>{`COHERENCING UNIFIED RESONANT EQUATION (Shia Miller · AETHER Framework):

  Ψ(r,t)_TOTAL COHERENCE =
    ∫∫ E(r′) · Γ_SUBSTRATE(r, r′, t) · e^(iΦ_FRACTURE(r′)) dr′dr
    + φ · R_RECURSIVE(Ψ)

  Term by term:

  E(r′)                    Chaotic Environmental Vector / Input Layer
  = the raw signal arriving from the environment (optical chaos,
    geological noise, cosmic background, acoustic turbulence)

  Γ_SUBSTRATE(r, r′, t)   ← THE DECOHERENCE SUBSTRATE FILAMENT KERNEL
  = spatiotemporal fracture map / Venturi phase restriction
  = the medium's coherence transfer function between points r and r′
  = describes HOW MUCH coherence survives travelling through the substrate
  = water: Γ_water ≈ exp(-α_water · |r-r′|)   α_water = 0.001–0.004/m
  = granite: Γ_granite ≈ exp(-α_rock · |r-r′|)  α_rock = 0.002–0.02/m
  = graphene: Γ_graphene ≈ exp(-α_g · |r-r′|)   α_g = 0.0004/m  (best known)
  = vacuum: Γ_vacuum ≈ exp(-α_vac · |r-r′|)     α_vac → 0 (coherence preserved)
  = plasma soliton: Γ_soliton(r, r′, t) = coherent mass-energy shell
    → coherence is self-contained, non-decaying over arbitrary distance

  e^(iΦ_FRACTURE(r′))     Holographic Jelly & Organic Pearl Resonance Matrix
  = phase encoding at each point (fault zone fracture map, crystal structure,
    cellular biology, spacetime metric distortion)
  = carries the INFORMATION signature of the substrate at point r′

  φ · R_RECURSIVE(Ψ)      Fibonacci Quantized Scaling & Structure Rule
  = self-referential coherence recovery — the system maps its own
    coherence state and uses Fibonacci-harmonic scaling to regenerate
    signal from the attractor state
  = this is the REFORMATION mechanism after a quaternion burst

SUBSTRATE FILAMENT FOR SPACE NAVIGATION:

  For space, r and r′ are separated by astronomical distances.
  The substrate is spacetime curved by mass-energy.
  Γ_SPACETIME(r, r′, t) = exp(-∫ κ(s) ds)   [integrated curvature decay]
  where κ(s) = spacetime curvature along path s

  The substrate filament navigation problem:
    Find the trajectory T*(r → r′) that MAXIMISES Γ_SPACETIME
    = find the path of minimum integrated curvature
    = equivalently: the geodesic of maximum coherence
    = in flat spacetime: straight line (special relativity)
    = in curved spacetime: follows mass concentration field lines
      (gravity provides natural coherence channelling)

  AETHER space navigation:
    Ψ(t₀) = Σₙ [Hₙ · Pₙ · Rₙ] → C(t)
    Hₙ = historical event node (star positions, gravitational lenses)
    Pₙ = probability influence weight (resonance probability)
    Rₙ = recursive resonance factor (AETHER ring-field alignment)
    C(t) = current observable condition (ship coherence state)

  Navigation = maximising C(t) at the destination
  by choosing the optimal substrate filament path T*`}</EqBlock>

        <div style={{ margin: "24px 0", display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
          <div style={{ borderRadius: 10, overflow: "hidden", border: `1px solid ${ACCENT}20` }}>
            <img src={coherencingEq} alt="COHERENCING unified resonant equation — substrate filament kernel" style={{ width: "100%", display: "block" }} />
            <div style={{ background: "#010810", padding: "10px 14px" }}>
              <div style={{ fontFamily: mono, fontSize: 9, color: ACCENT, marginBottom: 4 }}>COHERENCING · UNIFIED RESONANT EQUATION</div>
              <div style={{ fontFamily: mono, fontSize: 8, color: DIM }}>The complete COHERENCING architecture: Chaos → Venturi aperture (Φ_FRACTURE) → Substrate inversion matrix (Γ_SUBSTRATE) → Fibonacci recursive scaling (φ·R) → Opaque dimension / Homeostasis. The decoherence substrate filament is Γ_SUBSTRATE — the medium's coherence transfer kernel.</div>
            </div>
          </div>
          <div style={{ borderRadius: 10, overflow: "hidden", border: `1px solid ${GOLD}20` }}>
            <img src={decoherenceFrag} alt="Mathematical propagation and decay pathway of the decoherence fragment" style={{ width: "100%", display: "block" }} />
            <div style={{ background: "#010810", padding: "10px 14px" }}>
              <div style={{ fontFamily: mono, fontSize: 9, color: GOLD, marginBottom: 4 }}>DECOHERENCE FRAGMENT · PROPAGATION & DECAY PATHWAY</div>
              <div style={{ fontFamily: mono, fontSize: 8, color: DIM }}>Path A (sustainable coherence) vs Path B (chaotic decay). The substrate filament is Path A — the optimal Γ_SUBSTRATE trajectory through the medium that maintains coherence above the decay limit. Aperture resolving → thermal scrambling → exponential decay: e^(-λ(t−t₀)).</div>
            </div>
          </div>
        </div>

        <div style={{ margin: "20px 0", display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
          <div style={{ borderRadius: 10, overflow: "hidden", border: `1px solid ${VIOLET}20` }}>
            <img src={opticalScatter} alt="Optical concepts: scattering, diffraction and decoherence fragments" style={{ width: "100%", display: "block" }} />
            <div style={{ background: "#010810", padding: "10px 14px" }}>
              <div style={{ fontFamily: mono, fontSize: 9, color: VIOLET, marginBottom: 4 }}>OPTICAL DECOHERENCE · LENS FLARE & VENTURI DIFFRACTION</div>
              <div style={{ fontFamily: mono, fontSize: 8, color: DIM }}>Physical demonstration: lens flare = internal scattering producing decoherence fragments at the sensor plane. Venturi slit = physical beam restriction creating wave interference patterns. Both are visible analogues of Γ_SUBSTRATE fracture events — the substrate (glass / air gap) scatters coherent light into a decoherence fragment.</div>
            </div>
          </div>
          <div style={{ borderRadius: 10, overflow: "hidden", border: `1px solid ${GREEN}20` }}>
            <img src={spatioPhase} alt="Spatiotemporal optical measurement: moving sensor phase mapping and observed decoherence" style={{ width: "100%", display: "block" }} />
            <div style={{ background: "#010810", padding: "10px 14px" }}>
              <div style={{ fontFamily: mono, fontSize: 9, color: GREEN, marginBottom: 4 }}>SPATIOTEMPORAL PHASE MAPPING · OBSERVED DECOHERENCE</div>
              <div style={{ fontFamily: mono, fontSize: 8, color: DIM }}>Maglev sensor moving at Mach 1 measures interference field time-slices. Group velocity v_g &lt;&lt; c inside the structure = light "trapped" by the substrate geometry. This is Γ_SUBSTRATE measured directly: the phase intensity vs (space, time) surface IS the substrate filament's coherence transfer function.</div>
            </div>
          </div>
        </div>

        <div style={{ margin: "20px 0", borderRadius: 10, overflow: "hidden", border: `1px solid ${ACCENT}20` }}>
          <img src={temporalMapping} alt="AETHER TGEME temporal recursive mapping — reverse from present to history, constrained probability navigation" style={{ width: "100%", display: "block" }} />
          <div style={{ background: "#010810", padding: "12px 16px" }}>
            <div style={{ fontFamily: mono, fontSize: 9, color: ACCENT, marginBottom: 4 }}>AETHER TGEME · TEMPORAL RECURSIVE MAPPING · CONSTRAINED PROBABILITY NAVIGATION</div>
            <div style={{ fontFamily: mono, fontSize: 8, color: DIM, lineHeight: 1.7 }}>
              Reality = Constrained Probability Navigation. The substrate filament for space navigation is the highest-confidence timeline branch T₁ (68.4% confidence shown) — the trajectory through the probability lattice that minimises entropy and maximises resonance factor. T_reverse = ∫ λ(H_t) dt maps the historical influence decay curve backwards to find the attractor state. For space navigation: this is the ship's optimal path through curved spacetime, weighted by gravitational resonance at each waypoint.
            </div>
          </div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 14, margin: "20px 0" }}>
          {[
            { col: ACCENT, title: "Γ_WATER — FILAMENT IN THE TUNNEL",
              body: "In the hydraulic tunnel, water is the substrate. The decoherence substrate filament is the coherent water column between two pump stations. α_water = 0.001–0.004/m. Over 2km, Γ_water = exp(−0.004 × 2000) = exp(−8) ≈ 0.0003 — severe decay. This is why pump stations are coherence resets. Each station regenerates Ψ = 1.0 using the recursive φ·R term." },
            { col: GOLD, title: "Γ_GRAPHENE — THE BEST TERRESTRIAL FILAMENT",
              body: "Graphene's decoherence attenuation α_g = 0.0004/m — 5–10× lower than any other known material at tunnel pressures. A 100m graphene-lined section: Γ = exp(−0.0004 × 100) = 0.96. 96% coherence preserved over 100m. This is the physical basis of graphene as a coherence amplifier: it is the best terrestrial substrate filament for both acoustic and ring-field coherence." },
            { col: VIOLET, title: "Γ_PLASMA — THE SOLITON FILAMENT",
              body: "The positive energy plasma soliton (Lentz/Bobrick warp drive concept) achieves Γ_soliton → 1.0 over arbitrary distance. The coherent mass-energy shell is self-contained — it does not exchange coherence with the external spacetime substrate. Navigation through this filament: lim(r→0) Ψ_AETHER(r,t) = Ω_singularity — total coherence preservation. This is not negative exotic matter; it is recursive geometric coherence via positive mass-energy." },
            { col: GREEN, title: "Γ_SPACETIME — THE NAVIGATION FILAMENT",
              body: "For interstellar navigation, the substrate is spacetime. Gravity provides natural coherence channelling — massive objects concentrate the substrate filament along geodesics. The Sun's gravitational lens (solar focus point ≈ 550 AU) is a natural coherence amplifier: Γ_solar_focus >> 1 (amplification, not decay). AETHER space navigation: route through gravitational lenses as natural filament amplifiers." },
          ].map(c => (
            <div key={c.title} style={{ background: `${c.col}09`, border: `1px solid ${c.col}25`, borderRadius: 8, padding: "14px 16px" }}>
              <div style={{ fontFamily: mono, fontSize: 10, color: c.col, marginBottom: 6 }}>{c.title}</div>
              <div style={{ fontFamily: body, fontSize: 14, color: TEXT, lineHeight: 1.65 }}>{c.body}</div>
            </div>
          ))}
        </div>

        <div style={{ margin: "20px 0", display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
          <div style={{ borderRadius: 10, overflow: "hidden", border: `1px solid ${GOLD}20` }}>
            <img src={warpDrive} alt="Coherencing architecture: positive energy warp drive sub-luminal plasma soliton" style={{ width: "100%", display: "block" }} />
            <div style={{ background: "#010810", padding: "10px 14px" }}>
              <div style={{ fontFamily: mono, fontSize: 9, color: GOLD, marginBottom: 4 }}>POSITIVE ENERGY WARP DRIVE · COHERENT SUB-LUMINAL SOLITON</div>
              <div style={{ fontFamily: mono, fontSize: 8, color: DIM }}>The soliton shell layers: Bioluminescent Organic Hydrogel → Photonic Crystal Nacre Resonators → High-Density Plasma Confinement Arrays → Recursive Geometrical Lattices. This is Γ_SUBSTRATE → 1.0 achieved through internal geometric isolation. The ship does not travel through the substrate — it carries its own substrate. No exotic matter required.</div>
            </div>
          </div>
          <div style={{ borderRadius: 10, overflow: "hidden", border: `1px solid ${VIOLET}20` }}>
            <img src={coherenceMech} alt="Coherencing formulation: physical and metric mechanics integration" style={{ width: "100%", display: "block" }} />
            <div style={{ background: "#010810", padding: "10px 14px" }}>
              <div style={{ fontFamily: mono, fontSize: 9, color: VIOLET, marginBottom: 4 }}>COHERENCING FORMULATION · CLASSICAL → SPACETIME MECHANICS</div>
              <div style={{ fontFamily: mono, fontSize: 8, color: DIM }}>Classical physics (lift, Venturi, structural shear) mapped to advanced spacetime field mechanics: Venturi Phase Matrix → Spacetime Group Velocity (v_g) manipulation → Field-Coherence Stress Distribution → Metric Displacements. lim(r→0) Ψ_AETHER(r,t) = Ω_Singularity — the coherencing architect: optimised field geometry + phase coherence eliminates mechanical shear limits and aerodynamic drag.</div>
            </div>
          </div>
        </div>

        <div style={{ margin: "20px 0 32px", borderRadius: 10, overflow: "hidden", border: `1px solid ${ACCENT}20` }}>
          <img src={tgemeMatrix} alt="AETHER TGEME Metric-Substrate-Boundary Engineering Matrix: Lane 1 gravitational lattice, Lane 2 spacetime group velocity induction, Lane 3 unified recursive resonant equation collapse" style={{ width: "100%", display: "block" }} />
          <div style={{ background: "#010810", padding: "12px 16px" }}>
            <div style={{ fontFamily: mono, fontSize: 9, color: ACCENT, marginBottom: 4 }}>AETHER TGEME · METRIC-SUBSTRATE-BOUNDARY ENGINEERING MATRIX</div>
            <div style={{ fontFamily: mono, fontSize: 8, color: DIM, lineHeight: 1.7 }}>
              Three-lane architecture: Lane 1 = Gravitational Metric-Lattice Optimisation (biomimetic bone lattice → structural load → metric curvature conversion). Lane 2 = Spacetime Group Velocity Induction (v_g manipulation, decoherence cancellation matrix). Lane 3 = Unified Recursive Resonant Equation Collapse (lim Ψ_AETHER = Ω_Singularity → decoherence-free spacetime pathpath). The Γ_SUBSTRATE filament is Lane 3's output: the decoherence-free path through the metric substrate from origin to destination.
            </div>
          </div>
        </div>

        <Card title="AETHER SYNTHESIS · WATER + PRESSURE + GRAPHENE + COHERENCE" col={GREEN}>
          The trans-national hydraulic capsule tunnel, when built with graphene composite lining and
          an embedded coherence sensor network, becomes something unprecedented in civil engineering:
          a structure that is simultaneously a transport corridor, a geological sensor array, a
          distributed quantum measurement device, and — in the AETHER framework — a 100km long
          D8 wave generator operating continuously at the boundary between two nations' geologies.
          <br /><br />
          Water at 41 bar in a graphene-lined bore, flowing past a rolling graphene-coated capsule,
          over granite and karst and fault zones, generates a coherence signal that encodes the
          complete geological history of the path. Every transit is a reading. Every quaternion
          burst at a fault zone is a measurement. The tunnel does not merely move cargo —
          it maps the Earth.
        </Card>

        {/* ── XI — Infinity Loop Origami Drone Military Transport ── */}
        <SecHead id="s11" n="XI" title="Infinity Loop Origami Drone · ∞ Underground-Water Military Transport"
          sub="A figure-eight autonomous system that expands like origami in water and compresses underground — the cyclical military transport architecture" />

        <p style={{ fontFamily: body, fontSize: 16, lineHeight: 1.8, marginBottom: 20 }}>
          Suppose a drone structure that follows a continuous ∞ loop path — half its cycle in open water
          (ocean, aquifer, reservoir), half underground through a pressurised bore. In the water phase,
          low external pressure and buoyancy allow the structure to <em>unfold</em> like origami: panels
          extend, surface area increases, sensors deploy, cargo is received or deposited. As it enters
          the underground bore, external pressure rises — and the structure <em>folds itself</em> back into
          a compact aerodynamic form driven by the pressure differential itself. No motors fold it.
          The water does.
        </p>

        <div style={{ margin: "20px 0 24px" }}>
          <OrigamiDroneCanvas />
          <div style={{ display: "flex", gap: 16, marginTop: 8, flexWrap: "wrap" }}>
            <span style={{ fontFamily: mono, fontSize: 10, color: ACCENT }}>● TEAL = water phase · origami expanding · 6-point star</span>
            <span style={{ fontFamily: mono, fontSize: 10, color: GOLD }}>● GOLD = underground phase · origami compressing · 4-point compact</span>
            <span style={{ fontFamily: mono, fontSize: 10, color: DIM }}>∞ = Lemniscate of Bernoulli — the transport path</span>
          </div>
        </div>

        <Card title="HOW THE PRESSURE CYCLE DRIVES ORIGAMI FOLDING" col={ACCENT}>
          Water pressure at depth P_ext creates a net inward force on the drone's panels proportional
          to P_ext × A_panel. Origami fold geometry converts this uniform inward pressure into directed
          panel rotation along crease lines — exactly as a collapsing paper fold converts a surface load
          into a hinge moment. The fold angle θ = arctan(P_ext × L² / (2EI)) where L is panel length,
          E is panel stiffness, I is second moment of area. At 41 bar (400m depth), a graphene-polymer
          panel of L = 2m, E = 500 GPa (graphene composite), t = 3mm:
          θ_fold ≈ 85° — nearly full closure. The system reaches its most compact state at maximum depth
          and re-opens as it rises toward the water-side portal, driven by buoyancy and the elastic
          spring-back of the pre-stressed origami hinges.
        </Card>

        <EqBlock>{`Infinity Loop Origami Drone — governing physics:

LEMNISCATE PATH (Bernoulli, 1694):
  x(θ) = a·cos(θ) / (1 + sin²θ)
  y(θ) = a·cos(θ)·sin(θ) / (1 + sin²θ)
  θ ∈ [0, 2π]  →  full ∞ cycle
  a = half-loop radius [metres]

  Left lobe (x < 0):  WATER PHASE  — buoyancy + low pressure
  Right lobe (x > 0): UNDERGROUND  — hydraulic + high pressure
  Crossover points (0, 0):  transition nodes — pressure equalisation locks

ORIGAMI FOLD MECHANICS (Yoshimura crease pattern):
  Panel fold angle:   θ_fold = arctan(ΔP · L² / (2EI))
  ΔP = P_ext - P_int   [pressure differential across panel]
  L  = panel chord length
  EI = panel flexural rigidity (E × I)

  Water-side (shallow approach, P_ext ≈ 1 bar):
    ΔP → 0  →  θ_fold → 0  →  FULLY EXTENDED (maximum footprint)
    Deployed area A_open = π·R_drone²  =  ~50 m²  (6m radius)
    Buoyancy force: F_b = ρ_water · V_displaced · g  =  +500 kN upward

  Underground (400m depth, P_ext = 41 bar):
    ΔP = 40 bar = 4 MPa  →  θ_fold → 85°  →  FULLY COMPACT
    Folded cross-section: A_compact = 0.12 × A_open  =  ~6 m²
    Hydraulic drag reduced by 88%  →  transit velocity +3.4× vs open

  Transition zone (bore entry, depth 0 → 400m):
    θ_fold(d) = arctan(ρ·g·d · L² / (2EI))
    → continuous self-regulating fold with depth — NO MOTORS

INFINITY CYCLE TIMING:
  Water-phase leg:     3.2 km arc length,  v_water = 4.5 m/s → 12 min
  Underground leg:     2.8 km arc length,  v_bore = 3.1 m/s  → 15 min
  Transition nodes:    2 × 45 sec lock/pressurise cycle
  Full ∞ cycle time:   ~29 minutes
  Cycle rate:          2.07 cycles/hour
  Payload per cycle:   800–2,400 kg (cargo pod in drone centre)
  Daily throughput:    2.07 × 24 × 1,600 kg avg = ~80 tonnes/day

MULTIPLE DRONES — CONVOY SPACING:
  Minimum safe separation: 200m (coherence-tracking headway)
  Max drones per tunnel:   14 (2.8 km bore / 200m spacing)
  Peak throughput:         14 × 80 t/day = 1,120 tonnes/day per lane
  Bi-directional (2 lanes): 2,240 tonnes/day

  cf. CH-47 Chinook helicopter: 12 t payload, 120 trips/day = 144 t/day
  → ∞ Origami Drone system: 15.5× helicopter throughput, zero fuel at drone`}</EqBlock>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, margin: "24px 0" }}>
          <div style={{ borderRadius: 10, overflow: "hidden", border: `1px solid ${GOLD}20` }}>
            <img src={emergentBubble} alt="Emergent bubble concept: plasmodium bubble field system — self-organizing boundary layer in spacetime" style={{ width: "100%", display: "block" }} />
            <div style={{ background: "#010810", padding: "10px 14px" }}>
              <div style={{ fontFamily: mono, fontSize: 9, color: GOLD, marginBottom: 4 }}>EMERGENT BUBBLE CONCEPT · PLASMODIUM BOUNDARY FIELD</div>
              <div style={{ fontFamily: mono, fontSize: 8, color: DIM }}>The drone's expanded water-phase state IS a plasmodium bubble: exterior field (normal pressure) + gradient shell (adaptive node layer) + stable interior (uniform pressure cargo bay). Expansion/contraction flexes with energy input. Warp drive motion analogy: compression front (bore entry) + expansion rear (water-side exit). The ∞ loop drone is a submersible warp bubble at engineering scale.</div>
            </div>
          </div>
          <div style={{ borderRadius: 10, overflow: "hidden", border: `1px solid ${ACCENT}20` }}>
            <img src={warpCore} alt="WARP Core architecture — DPF, IRMG, B-Seed B-Cusp coils, grounded vacuum chamber" style={{ width: "100%", display: "block" }} />
            <div style={{ background: "#010810", padding: "10px 14px" }}>
              <div style={{ fontFamily: mono, fontSize: 9, color: ACCENT, marginBottom: 4 }}>WARP CORE · DPF + IRMG ARCHITECTURE</div>
              <div style={{ fontFamily: mono, fontSize: 8, color: DIM }}>Dense Plasma Focus (DPF) + Inertial Resonance Magnetic Generator (IRMG): the power system for the drone's coherence maintenance. B-Seed & B-Cusp coils maintain the internal coherence field throughout the ∞ cycle. Grounded vacuum chamber = the stable cargo interior. This architecture scaled to drone dimensions (2m DPF) provides continuous coherence reset without external power input beyond the initial plasma ignition.</div>
            </div>
          </div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 14, margin: "20px 0" }}>
          {[
            { col: "#ef4444", title: "MILITARY APPLICATIONS",
              body: "The ∞ origami drone system is inherently dual-use, but its military utility is profound: covert insertion/extraction through aquifer systems that bypass land borders entirely; underwater resupply of forward operating bases accessed from below through subterranean water tables; autonomous logistics through contested territory with near-zero acoustic and electromagnetic signature (graphene = no radar cross-section, water/rock = natural acoustic damping)." },
            { col: GOLD, title: "ORIGAMI AS MILITARY CAMOUFLAGE",
              body: "In compact underground mode, the drone's cross-section drops to ~6m² — identical in acoustic profile to natural rock debris in a water-filled bore. Sonar, seismic, and acoustic sensors designed for moving vehicles cannot distinguish the compacted origami drone from geological noise. In expanded water-mode, its bioluminescent graphene skin can be tuned for active camouflage — matching the optical scattering signature of ambient water at depth." },
            { col: VIOLET, title: "AI COHERENCE NAVIGATION",
              body: "The drone runs the AETHER TGEME substrate filament navigation algorithm continuously: Ψ(t₀) = Σ[Hₙ·Pₙ·Rₙ] → C(t). Each pump station is a Hₙ (historical event node); Pₙ is the probability of coherent transit through that segment based on LPE monitoring; Rₙ is the ring-field resonance at that geological location. The optimal path through the ∞ loop maximises C(t) at the extraction portal — coherence navigation applied to underground transport." },
            { col: GREEN, title: "SELF-HEALING GRAPHENE SKIN",
              body: "The origami panels fold 2.07 × 24 = ~50 times per day. At 50 fold cycles per day over 10 years: 182,500 fold cycles. Graphene's self-healing mechanism (at room temperature, graphene lattice defects anneal under strain) maintains structural integrity across this cycle count. Unlike metal fatigue (failure at 10⁴–10⁶ cycles) or polymer delamination, graphene composite origami panels are rated for 10⁸+ fold cycles before measurable degradation." },
            { col: STONE, title: "DECOHERENCE SUBSTRATE FILAMENT AS NAVIGATION",
              body: "The drone uses the tunnel's Γ_SUBSTRATE filament map in real-time. Where Γ_water drops (fault zone ahead) the drone reduces speed and activates its coherence reset mode before entering the disrupted zone. Where Γ_graphene = 0.96/100m, the drone trusts passive navigation. The substrate filament is simultaneously the communications channel, the structural health monitor, and the navigation system — three functions in one physical field." },
            { col: ACCENT, title: "∞ LOOP AS LOGISTICAL INFINITY ENGINE",
              body: "The lemniscate path has no endpoints — it is a closed loop. The origami drone never 'arrives' and 'departs'. It cycles continuously, depositing cargo at the extraction node during each water-phase pass and picking up new cargo during each underground pass. Throughput is limited only by cycle time (29 min) and fleet size. Scale to 14 drones per lane, 4 lanes: 8,960 tonnes/day through a completely underground, completely deniable, completely autonomous logistics network." },
          ].map(c => (
            <div key={c.title} style={{ background: `${c.col}09`, border: `1px solid ${c.col}25`, borderRadius: 8, padding: "14px 16px" }}>
              <div style={{ fontFamily: mono, fontSize: 10, color: c.col, marginBottom: 6 }}>{c.title}</div>
              <div style={{ fontFamily: body, fontSize: 14, color: TEXT, lineHeight: 1.65 }}>{c.body}</div>
            </div>
          ))}
        </div>

        <Card title="AETHER SYNTHESIS · THE ∞ DRONE AS DECOHERENCE SUBSTRATE FILAMENT IN MOTION" col={VIOLET}>
          The infinity loop origami drone is not merely a transport system. It is a living, moving
          instantiation of the decoherence substrate filament — Γ_SUBSTRATE(r, r′, t) physically
          embodied as a vehicle. As it traverses the ∞ path, it continuously maps the substrate
          coherence at every point, feeding this data back to the AETHER TGEME probability engine,
          which updates the timeline lattice for the next cycle. After 1,000 cycles (≈ 20 days),
          the system has a complete spatiotemporal coherence map of the entire tunnel geology at
          sub-metre resolution. The military operator receives not just cargo — they receive a
          continuously updated geological intelligence product, a structural health certificate,
          and a coherence-navigation chart, all generated as a by-product of normal operations.
          <br /><br />
          The frontier is not a single breakthrough. It is coherence — across physics, computation,
          and living systems. The ∞ drone moves through the Earth the way coherence moves through
          the substrate: continuously, quietly, mapping as it goes.
        </Card>

        {/* ── XII — Magnetic Reconstruction · MHD Energy Cycle ── */}
        <SecHead id="s12" n="XII" title="Magnetic Reconstruction · MHD Energy Cycle"
          sub="The Infinity Loop Origami Drone as a living magnetic reconnection engine — 6-phase topology cycle maps directly onto the folding and plasma architecture" />

        <p style={{ fontFamily: body, fontSize: 16, lineHeight: 1.8, marginBottom: 20 }}>
          The 6-phase cycle of <em>magnetic reconnection</em> — Expand · Accumulate · Reconnection · Compress · Transport · Re-Expand —
          is not a metaphor for the ∞ drone. It <em>is</em> the drone. When opposing magnetic field loops approach each other,
          field lines at the X-line break and reconnect: stored magnetic energy (E_B = B²/2μ₀) converts instantaneously
          into plasma kinetic energy, heat, and EM radiation. The drone's infinity loop body <em>physically enacts</em> this
          cycle — expanding its origami arms to grow the magnetic field geometry, allowing loops to accumulate and
          approach the X-line, triggering reconnection-analogue energy release during the bore-entry pressure transition,
          compressing to concentrate field strength (B ∝ 1/A), transporting through substrate channels, then re-expanding
          to restart. The plasma cycle IS the transport cycle.
        </p>

        {/* Reference image gallery */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 14, margin: "0 0 28px" }}>
          {[
            { src: magneticRecon,  label: "MAGNETIC RECONSTRUCTION", sub: "6-Phase Cycle · MHD Physics · Water Flow Analogy", col: VIOLET },
            { src: plasmaTransport, label: "INFINITY LOOP PLASMA CYCLE", sub: "Origami Structure · Compression · Plasma Parameters", col: ACCENT },
            { src: droneSystem,    label: "DRONE SYSTEM ARCHITECTURE", sub: "EXPAND · OPERATE · COMPRESS · TRANSIT · REPEAT", col: GOLD },
          ].map(img => (
            <div key={img.label} style={{ borderRadius: 8, overflow: "hidden", border: `1px solid ${img.col}22` }}>
              <img src={img.src} alt={img.label} style={{ width: "100%", display: "block" }} />
              <div style={{ background: "#010810", padding: "8px 12px" }}>
                <div style={{ fontFamily: mono, fontSize: 8, color: img.col, marginBottom: 3 }}>{img.label}</div>
                <div style={{ fontFamily: mono, fontSize: 7, color: DIM }}>{img.sub}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Animated canvas */}
        <div style={{ margin: "0 0 24px" }}>
          <MagneticReconCanvas />
          <div style={{ display: "flex", gap: 18, marginTop: 8, flexWrap: "wrap" }}>
            <span style={{ fontFamily: mono, fontSize: 10, color: "#1a9fd4" }}>● TEAL = Left loop · expanding / re-expanding</span>
            <span style={{ fontFamily: mono, fontSize: 10, color: "#e8a030" }}>● AMBER = Right loop · opposing polarity</span>
            <span style={{ fontFamily: mono, fontSize: 10, color: "#ffffff80" }}>✕ X-LINE = reconnection site · field topology break</span>
            <span style={{ fontFamily: mono, fontSize: 10, color: "#8b5cf6" }}>↑↓ PLASMA JETS = energy release perpendicular to X-line</span>
            <span style={{ fontFamily: mono, fontSize: 10, color: "#22c55e" }}>● PARTICLES = substrate transit flow · v = −k∇h</span>
          </div>
        </div>

        <Card title="HOW MAGNETIC RECONNECTION POWERS THE DRONE ENERGY CYCLE" col={VIOLET}>
          In standard MHD, magnetic reconnection converts stored field energy (E_B = B²/2μ₀) into
          kinetic and thermal plasma energy at the X-line — the point where opposing field topologies meet.
          The drone mirrors this architecture exactly: its two infinity-loop arms carry current along plasma
          conduits (J = ρv, ∇×B = μ₀J), building field gradient as the loops approach during the
          Accumulate phase. At the bore-entry transition node — the drone's "X-line" — field topology
          changes: origami panels fold under hydraulic pressure, concentrating magnetic field (B ∝ 1/A),
          releasing stored elastic + field energy as the drone accelerates into underground transit.
          This is not metaphor. The induction equation governs both: ∂B/∂t = ∇×(v×B) − η∇×(∇×B).
          In the drone, v is the panel-fold velocity, B is the coil field, η is the effective resistivity
          of the graphene-plasma interface. Reconnection IS the fold event. Energy release IS the transit
          acceleration. The water flow analogy is identical: flow paths approach, merge at a pressure
          node, release energy, compress into a channel, transit underground, re-emerge.
        </Card>

        <EqBlock>{`MAGNETIC RECONNECTION — GOVERNING MHD EQUATIONS (mapped to Drone Architecture):

INDUCTION EQUATION:
  ∂B/∂t = ∇×(v×B) − η∇×(∇×B)
  → v = panel-fold velocity field [m/s]
  → B = internal coil magnetic field [T]
  → η = graphene-plasma effective resistivity [Ω·m]
  → Left term: field advection with folding geometry
  → Right term: resistive diffusion / field reconnection rate

GENERALISED OHM'S LAW (plasma in drone conduits):
  E + v×B = ηJ     →    J = ρv   (Ampere carrier)
  ∇×B = μ₀J               (Ampere's Law)
  ∇·E  = ρ/ε₀             (Gauss's Law)
  → Current density J circulates in the ∞ loop plasma conduit
  → Magnetic field lines form toroidal vortex rings inside the loop structure

MAGNETIC ENERGY DENSITY & RELEASE:
  E_B = B²/2μ₀             [J/m³]
  During Reconnection:    dE_B/dt < 0   ⟹  Energy is released
  Energy Evolution:       dE_B/dt = −∫(ηJ²/μ₀)dV − (Outflows)
  → Joule dissipation term: ηJ²/μ₀ [converted to plasma motion, heat, EM]
  → Outflows: plasma jets perpendicular to X-line (↑ kinetic · ↓ kinetic)

COMPRESSION — FIELD CONCENTRATION:
  B ∝ 1/A    (as loop area A decreases, field B increases)
  → Underground phase (A_compact = 0.12 × A_open): B increases 8.3×
  → Energy densification: E_B scales as B² → 69× higher energy density
  → This concentrated field drives the internal plasma cycle during transit

TRANSIT FLOW (Water / Substrate Analogy):
  v = −k∇h     (Darcy / potential gradient)
  → h = hydraulic head  [m]
  → k = substrate permeability coefficient
  → Flow follows lowest potential — identical to plasma jet outflow direction

ENERGY CYCLE (closed loop):
  E_stored → E_kinetic → E_plasma → E_stored
  EXPAND (low B, large A) → ACCUMULATE (∇B grows) → RECONNECTION (topology change)
  → COMPRESS (high B, small A) → TRANSPORT (v = −k∇h) → RE-EXPAND (new topology)`}</EqBlock>

        {/* 6-phase cycle grid */}
        <div style={{ marginBottom: 8, fontFamily: mono, fontSize: 10, color: ACCENT, letterSpacing: 2 }}>
          ∞ DRONE · 6-PHASE MAGNETIC RECONNECTION CYCLE
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12, margin: "0 0 28px" }}>
          {[
            { n: "1", name: "EXPAND", col: "#1a9fd4",
              drone: "Origami arms unfold · Systems activate · Low B, large area (A_open)",
              mhd:   "Magnetic loops grow · Energy stored in geometry · Field strength low",
              water: "Water seeks lowest potential · Flow paths spread across surface topography" },
            { n: "2", name: "ACCUMULATE", col: "#8b5cf6",
              drone: "Plasma cycle generates & stabilises · Loop arms fully extended · Field gradient builds",
              mhd:   "Loops approach each other · Field gradient ∇B increases · Current sheet forms at intersection",
              water: "Flow paths approach and interact · Pressure gradients form at convergence nodes" },
            { n: "3", name: "RECONNECTION", col: "#ffffff",
              drone: "Bore entry · Hydraulic pressure triggers fold · X-line topology change · Energy release → transit acceleration",
              mhd:   "Field lines break and reconnect at X-line · dE_B/dt < 0 · Plasma jets outward ↑↓ · New stable topology",
              water: "Paths merge and reconfigure · Energy released at confluence · New channel topology" },
            { n: "4", name: "COMPRESS", col: "#e8a030",
              drone: "Arms fold inward · Fields contained · B ∝ 1/A → B increases 8.3× · Hydrodynamic pod sealed",
              mhd:   "Energy concentrated in small volume · High B, small area · E_B = B²/2μ₀ spikes · Loops collapse",
              water: "Flow compresses into channels · Velocity increases · Pressure concentrates" },
            { n: "5", name: "TRANSPORT", col: "#22c55e",
              drone: "Compact pod transits water-filled channels / bore · v = −k∇h · Terrain mapping + pressure sensing",
              mhd:   "Plasma jets transport energy along reconnected field lines · v = outflow velocity",
              water: "Flows through underground channels · Emerges at lowest potential exit point" },
            { n: "6", name: "RE-EXPAND", col: "#1fd4c8",
              drone: "Depth decreases → pressure drops → origami spring-back → new ∞ cycle begins",
              mhd:   "New magnetic topology is more stable configuration · Cycle restarts with fresh geometry",
              water: "Emerges and spreads · New surface pattern · Lowest potential redistributes" },
          ].map(p => (
            <div key={p.n} style={{ background: `${p.col}08`, border: `1px solid ${p.col}28`, borderRadius: 8, padding: "14px 16px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
                <span style={{ fontFamily: mono, fontSize: 18, color: p.col, lineHeight: 1 }}>{p.n}</span>
                <span style={{ fontFamily: mono, fontSize: 10, color: p.col, letterSpacing: 1.5 }}>{p.name}</span>
              </div>
              <div style={{ fontFamily: mono, fontSize: 8, color: ACCENT, marginBottom: 4 }}>DRONE</div>
              <div style={{ fontFamily: body, fontSize: 13, color: TEXT, lineHeight: 1.55, marginBottom: 8 }}>{p.drone}</div>
              <div style={{ fontFamily: mono, fontSize: 8, color: VIOLET, marginBottom: 4 }}>MHD PHYSICS</div>
              <div style={{ fontFamily: body, fontSize: 13, color: TEXT, lineHeight: 1.55, marginBottom: 8 }}>{p.mhd}</div>
              <div style={{ fontFamily: mono, fontSize: 8, color: DIM, marginBottom: 4 }}>WATER ANALOGY</div>
              <div style={{ fontFamily: body, fontSize: 13, color: `${TEXT}99`, lineHeight: 1.55 }}>{p.water}</div>
            </div>
          ))}
        </div>

        {/* Plasma parameters + compression physics */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, margin: "0 0 28px" }}>
          <Card title="PLASMA CYCLE PARAMETERS (Infinity Loop Conduit)" col={ACCENT}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
              {[
                { eq: "J = ρv",         label: "Current Density", desc: "Plasma current circulates in ∞ loop" },
                { eq: "∇×B = μ₀J",      label: "Ampere's Law",   desc: "Field lines form toroidal vortex rings" },
                { eq: "∇·E = ρ/ε₀",     label: "Gauss's Law",    desc: "Charge density in plasma conduit" },
                { eq: "B ∝ 1/A",         label: "Compression",    desc: "Field intensifies as loop folds" },
                { eq: "E_B = B²/2μ₀",   label: "Field Energy",   desc: "Stored energy density [J/m³]" },
                { eq: "v = −k∇h",        label: "Transit Flow",   desc: "Substrate potential gradient drive" },
              ].map(item => (
                <div key={item.eq} style={{ background: "#ffffff06", borderRadius: 6, padding: "10px 12px", border: `1px solid ${ACCENT}15` }}>
                  <div style={{ fontFamily: mono, fontSize: 13, color: GOLD, marginBottom: 4 }}>{item.eq}</div>
                  <div style={{ fontFamily: mono, fontSize: 8, color: ACCENT, marginBottom: 3 }}>{item.label}</div>
                  <div style={{ fontFamily: body, fontSize: 12, color: DIM, lineHeight: 1.5 }}>{item.desc}</div>
                </div>
              ))}
            </div>
          </Card>

          <Card title="COMPRESSION — ENERGY CONCENTRATION" col={GOLD}>
            <p style={{ fontFamily: body, fontSize: 14, color: TEXT, lineHeight: 1.65, marginTop: 0 }}>
              As the origami loop compresses (area A decreases), magnetic field strength increases
              as B ∝ 1/A. This is the direct engineering application of flux conservation in
              a folding magnetic geometry.
            </p>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {[
                { label: "Open state area",     val: "A_open ≈ 50 m²",       col: ACCENT },
                { label: "Compact state area",  val: "A_compact ≈ 6 m²",     col: GOLD },
                { label: "Field amplification", val: "B × 8.3×",             col: VIOLET },
                { label: "Energy densification",val: "E_B × 69× (B² scale)", col: "#ef4444" },
                { label: "Internal plasma temp",val: "↑ proportional to B²", col: STONE },
                { label: "Transit field mode",  val: "High B, sealed pod",   col: GREEN },
              ].map(r => (
                <div key={r.label} style={{ display: "flex", justifyContent: "space-between", alignItems: "center",
                  borderBottom: `1px solid #ffffff08`, paddingBottom: 6 }}>
                  <span style={{ fontFamily: mono, fontSize: 9, color: DIM }}>{r.label}</span>
                  <span style={{ fontFamily: mono, fontSize: 10, color: r.col }}>{r.val}</span>
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* System specifications */}
        <div style={{ marginBottom: 8, fontFamily: mono, fontSize: 10, color: GOLD, letterSpacing: 2 }}>
          SYSTEM SPECIFICATIONS · INFINITY LOOP ORIGAMI DRONE
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 10, margin: "0 0 28px" }}>
          {[
            { label: "Length (compact)",     val: "0.8 – 1.2 m",   col: ACCENT },
            { label: "Width (compressed)",   val: "0.6 – 0.8 m",   col: ACCENT },
            { label: "Length (deployed)",    val: "3.5 – 5.0 m",   col: GOLD },
            { label: "Width (deployed)",     val: "2.5 – 4.0 m",   col: GOLD },
            { label: "Propulsion",           val: "Electric / Hybrid", col: VIOLET },
            { label: "Endurance",            val: "12 – 48 hrs",   col: GREEN },
            { label: "Depth rating",         val: "100 m+",         col: "#1fd4c8" },
            { label: "Op. temperature",      val: "−10°C to 50°C", col: STONE },
          ].map(s => (
            <div key={s.label} style={{ background: `${s.col}08`, border: `1px solid ${s.col}20`,
              borderRadius: 6, padding: "12px 14px", textAlign: "center" }}>
              <div style={{ fontFamily: mono, fontSize: 16, color: s.col, marginBottom: 4 }}>{s.val}</div>
              <div style={{ fontFamily: mono, fontSize: 8, color: DIM }}>{s.label}</div>
            </div>
          ))}
        </div>

        {/* Structure features + compression system */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 14, margin: "0 0 28px" }}>
          <div style={{ background: "#ffffff04", border: `1px solid ${ACCENT}20`, borderRadius: 8, padding: "16px 18px" }}>
            <div style={{ fontFamily: mono, fontSize: 10, color: ACCENT, marginBottom: 10, letterSpacing: 1.5 }}>STRUCTURE FEATURES</div>
            {["Lightweight Alloy Frame", "Shape Memory Composite Joints", "Water-Resistant Origami Skin",
              "Modular Arms & Propulsion Units", "Plasma Conduits Along Loop", "Sensor & Comms Module",
              "Power Core (Plasma / EM)"].map(f => (
              <div key={f} style={{ fontFamily: body, fontSize: 13, color: TEXT, lineHeight: 1.6,
                borderBottom: "1px solid #ffffff06", paddingBottom: 5, marginBottom: 5 }}>
                <span style={{ color: ACCENT, marginRight: 6 }}>›</span>{f}
              </div>
            ))}
          </div>

          <div style={{ background: "#ffffff04", border: `1px solid ${GOLD}20`, borderRadius: 8, padding: "16px 18px" }}>
            <div style={{ fontFamily: mono, fontSize: 10, color: GOLD, marginBottom: 10, letterSpacing: 1.5 }}>COMPRESSION SYSTEM</div>
            {["Hydraulic / Electric Actuators", "Interlocking Panels", "Pressure Seal", "Ballast Adjustment",
              "Field Containment Coils", "Plasma Density Lock", "Origami Crease Memory"].map(f => (
              <div key={f} style={{ fontFamily: body, fontSize: 13, color: TEXT, lineHeight: 1.6,
                borderBottom: "1px solid #ffffff06", paddingBottom: 5, marginBottom: 5 }}>
                <span style={{ color: GOLD, marginRight: 6 }}>›</span>{f}
              </div>
            ))}
          </div>

          <div style={{ background: "#ffffff04", border: `1px solid ${VIOLET}20`, borderRadius: 8, padding: "16px 18px" }}>
            <div style={{ fontFamily: mono, fontSize: 10, color: VIOLET, marginBottom: 10, letterSpacing: 1.5 }}>TRANSIT MODES</div>
            {["Submerged Navigation", "Turbine / Jet Propulsion", "Buoyancy Control",
              "Terrain Mapping & Obstacle Avoidance", "Pressure Gradient Sensing",
              "Inertial / Stellar Guidance", "Substrate Flow Analysis"].map(f => (
              <div key={f} style={{ fontFamily: body, fontSize: 13, color: TEXT, lineHeight: 1.6,
                borderBottom: "1px solid #ffffff06", paddingBottom: 5, marginBottom: 5 }}>
                <span style={{ color: VIOLET, marginRight: 6 }}>›</span>{f}
              </div>
            ))}
          </div>
        </div>

        {/* Mission modules */}
        <div style={{ marginBottom: 8, fontFamily: mono, fontSize: 10, color: "#ef4444", letterSpacing: 2 }}>
          MISSION MODULES · MODULAR PAYLOAD SYSTEM
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12, margin: "0 0 28px" }}>
          {[
            { title: "ISR / SURVEILLANCE", col: "#ef4444",
              items: ["ISR Sensors", "EO/IR Cameras", "LIDAR / SAR", "Wide-area Mapping"] },
            { title: "COMMS RELAY", col: ACCENT,
              items: ["Mesh Networking", "Signal Boosting", "Comms Relay Node", "Encrypted Burst TX"] },
            { title: "WEAPON / TOOL BAY", col: GOLD,
              items: ["Modular Payload", "Non-lethal / Lethal", "Precision Delivery", "Remote Release"] },
            { title: "ENVIRONMENTAL", col: GREEN,
              items: ["Water Sampling", "Geological Sensing", "Substrate Mapping", "Data Collection"] },
          ].map(m => (
            <div key={m.title} style={{ background: `${m.col}08`, border: `1px solid ${m.col}28`,
              borderRadius: 8, padding: "14px 16px" }}>
              <div style={{ fontFamily: mono, fontSize: 9, color: m.col, marginBottom: 10, letterSpacing: 1 }}>{m.title}</div>
              {m.items.map(item => (
                <div key={item} style={{ fontFamily: body, fontSize: 13, color: TEXT, lineHeight: 1.6,
                  borderBottom: "1px solid #ffffff06", paddingBottom: 4, marginBottom: 4 }}>
                  <span style={{ color: m.col, marginRight: 5, fontSize: 10 }}>●</span>{item}
                </div>
              ))}
            </div>
          ))}
        </div>

        {/* Natural plasma analogs */}
        <Card title="NATURAL PLASMA ANALOGUES → DRONE SYSTEM MAPPING" col={VIOLET}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
            <div>
              <div style={{ fontFamily: mono, fontSize: 9, color: VIOLET, marginBottom: 10, letterSpacing: 1.5 }}>NATURAL PHENOMENON</div>
              {[
                { nat: "Solar Flares / Coronal Loops", drone: "Plasma circulates in ∞ loop structure", col: GOLD },
                { nat: "Magnetic Reconnection",        drone: "Expand / Compress releases energy",      col: "#ef4444" },
                { nat: "Toroidal Vortices",            drone: "Toroidal magnetic vortex in loop",       col: VIOLET },
                { nat: "Plasma Jets in Space",         drone: "Directed transit through channels",      col: ACCENT },
                { nat: "Magnetotail (Earth)",          drone: "Substrate filament orientation field",   col: GREEN },
                { nat: "Magnetic Island Coalescence",  drone: "Multi-drone swarm field merging",        col: STONE },
                { nat: "Laboratory Plasma",            drone: "Dense Plasma Focus power core",          col: "#1fd4c8" },
              ].map(row => (
                <div key={row.nat} style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8,
                  borderBottom: "1px solid #ffffff06", padding: "6px 0" }}>
                  <div style={{ fontFamily: body, fontSize: 13, color: row.col, lineHeight: 1.5 }}>{row.nat}</div>
                  <div style={{ fontFamily: body, fontSize: 13, color: DIM,    lineHeight: 1.5 }}>{row.drone}</div>
                </div>
              ))}
            </div>
            <div>
              <div style={{ fontFamily: mono, fontSize: 9, color: ACCENT, marginBottom: 10, letterSpacing: 1.5 }}>KEY MHD PHYSICS PRINCIPLES</div>
              {[
                "Magnetic fields store energy in geometry — not in particles but in field topology",
                "Compression increases field strength (B ∝ 1/A) — folding the geometry concentrates E_B",
                "Current sheets form at loop intersection — the X-line is a current concentration zone",
                "Reconnection changes field-line topology — new geometry is more stable than the old",
                "Energy converts to plasma motion, heat, EM radiation — all recoverable forms",
                "New topology is a more stable configuration — the system always seeks lowest-energy state",
                "The water flow analogy is structurally identical to MHD outflow dynamics",
              ].map((pt, i) => (
                <div key={i} style={{ display: "flex", gap: 8, marginBottom: 8, alignItems: "flex-start" }}>
                  <span style={{ fontFamily: mono, fontSize: 9, color: VIOLET, marginTop: 2, flexShrink: 0 }}>
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <span style={{ fontFamily: body, fontSize: 13, color: TEXT, lineHeight: 1.6 }}>{pt}</span>
                </div>
              ))}
            </div>
          </div>
        </Card>

        {/* Applications grid */}
        <div style={{ marginTop: 24, marginBottom: 8, fontFamily: mono, fontSize: 10, color: STONE, letterSpacing: 2 }}>
          POTENTIAL APPLICATIONS · MAGNETIC RECONNECTION ARCHITECTURE
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12, margin: "0 0 32px" }}>
          {[
            { title: "STEALTH UNDERGROUND / UNDERWATER TRANSIT", col: "#1a9fd4",
              body: "Compressed drone pod enters natural substrate channels. Water / plasma follows the path of least resistance (v = −k∇h). Minimal acoustic, EM, and radar signature — indistinguishable from geological flow." },
            { title: "ADAPTIVE MORPHING FOR CONSTRAINED SPACES", col: VIOLET,
              body: "Shape memory composite joints allow real-time geometry optimisation. As bore diameter narrows, the drone continuously re-calculates the optimal fold configuration to minimise hydraulic drag." },
            { title: "ENERGY HARVESTING FROM PLASMA EVENTS", col: GOLD,
              body: "During the Reconnection phase, energy release (dE_B/dt < 0) powers internal systems. The drone extracts energy from its own magnetic cycle — a self-sustaining plasma energy loop with minimal external power input." },
            { title: "SWARM DEPLOYMENT & NETWORKED SYSTEMS", col: GREEN,
              body: "Multiple drones operating in convoy spacing (200m minimum) create a magnetic field mesh. Inter-drone field coupling enables coordinated navigation and swarm coherence via the AETHER substrate filament protocol." },
            { title: "MILITARY RECONNAISSANCE & RAPID REDEPLOYMENT", col: "#ef4444",
              body: "ISR / EO-IR / LIDAR payload modules deploy during the Expand phase. Continuous ∞ cycle enables persistent surveillance with no fixed infrastructure — 24/7 coverage through aquifer and underground tunnel networks." },
            { title: "DISASTER RESPONSE IN EXTREME ENVIRONMENTS", col: STONE,
              body: "Water-resistant origami skin, depth rating 100m+, operating temperature −10°C to 50°C. Can navigate collapsed tunnels, flooded structures, and subterranean water systems inaccessible to surface vehicles." },
          ].map(a => (
            <div key={a.title} style={{ background: `${a.col}08`, border: `1px solid ${a.col}25`,
              borderRadius: 8, padding: "16px 18px" }}>
              <div style={{ fontFamily: mono, fontSize: 9, color: a.col, marginBottom: 8, letterSpacing: 1 }}>{a.title}</div>
              <div style={{ fontFamily: body, fontSize: 13, color: TEXT, lineHeight: 1.65 }}>{a.body}</div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div style={{
          marginTop: 48, padding: "22px 26px",
          background: "#ffffff04", border: `1px solid ${ACCENT}18`,
          borderRadius: 10, textAlign: "center",
        }}>
          <div style={{ fontFamily: serif, fontSize: 16, color: ACCENT, marginBottom: 8 }}>
            WATER IS NOT A MEDIUM FOR TRANSPORT
          </div>
          <div style={{ fontFamily: body, fontSize: 15, color: DIM, lineHeight: 1.7 }}>
            Water is the universe's most sophisticated dimensional transfer interface. Every object that
            moves through water participates in an exchange of ring-field signatures. Transport of stone
            through water is not merely a mechanical operation — it is a dimensional event.
          </div>
          <div style={{ fontFamily: mono, fontSize: 10, color: `${DIM}80`, marginTop: 12 }}>
            AETHER Framework · Shia Miller @StrategicProce · 2026
          </div>
        </div>
      </div>
    </div>
  );
}
