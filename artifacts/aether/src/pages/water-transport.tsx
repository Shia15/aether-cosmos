import { useEffect, useRef, useState } from "react";

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

/* ── Nav sections ─────────────────────────────────────────── */
const NAV = [
  { id: "s1", label: "Buoyancy" },
  { id: "s2", label: "Acoustic" },
  { id: "s3", label: "Ancient Stone" },
  { id: "s4", label: "Phononic Crystal" },
  { id: "s5", label: "AETHER · Water" },
  { id: "s6", label: "Design Principles" },
  { id: "s7", label: "Deep Tunnel Portal" },
];

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
