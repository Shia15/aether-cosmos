import { useEffect, useRef, useState } from "react";

/* ── AETHER palette + warm amber time accent ─────────────────────────────── */
const BG0   = "#06060a";
const BG1   = "#0e0e18";
const DK    = "#12121e";
const MID   = "#1c1c2c";
const LINE  = "#2a2a42";
const DIM   = "#3c3c58";
const BODY  = "#7878a0";
const PALE  = "#a0a0c0";
const LIGHT = "#c4c4e0";
const WHITE = "#f0f0f8";
const AMBER = "#d4a448";  // time = warm gold
const AMBER2= "#e8c070";  // brighter gold
const TEAL  = "#48b8c8";  // space = cool teal
const TEAL2 = "#70d4e0";  // brighter teal
const ROSE  = "#c87878";  // observer/relativistic
const LAVD  = "#9898d0";  // AETHER processing
const mono  = "'Space Mono', monospace";
const serif = "'Cinzel', serif";
const body  = "'Crimson Pro', Georgia, serif";

function Chip({ c = PALE, children }: { c?: string; children: string }) {
  return <span style={{ fontFamily: mono, fontSize: 11, color: c, background: `${c}14`, border: `1px solid ${c}40`, borderRadius: 4, padding: "2px 8px", display: "inline-block", margin: "2px 3px" }}>{children}</span>;
}
function EQ({ children }: { children: string }) {
  return <pre style={{ fontFamily: mono, fontSize: 12, color: LIGHT, background: DK, borderLeft: `3px solid ${AMBER}60`, borderRadius: "0 6px 6px 0", padding: "14px 20px", margin: "14px 0", overflowX: "auto", whiteSpace: "pre-wrap", lineHeight: 1.9 }}>{children}</pre>;
}
function Sect({ id, n, title, sub, accent = AMBER }: { id: string; n: string; title: string; sub: string; accent?: string }) {
  return (
    <div id={id} style={{ marginTop: 72, scrollMarginTop: 80 }}>
      <div style={{ fontFamily: mono, fontSize: 9, color: accent, letterSpacing: 4, marginBottom: 6 }}>{n}</div>
      <h2 style={{ fontFamily: serif, fontSize: 28, color: WHITE, margin: "0 0 4px", letterSpacing: 1 }}>{title}</h2>
      <div style={{ fontFamily: body, fontSize: 15, color: DIM, marginBottom: 22 }}>{sub}</div>
      <div style={{ height: 1, background: `linear-gradient(90deg,${accent}50,transparent)`, marginBottom: 32 }} />
    </div>
  );
}
function Pull({ col = AMBER, children }: { col?: string; children: string }) {
  return <blockquote style={{ borderTop: `1px solid ${col}40`, borderBottom: `1px solid ${col}40`, padding: "16px 28px", margin: "28px 0", fontFamily: body, fontStyle: "italic", fontSize: 19, color: LIGHT, lineHeight: 1.65, textAlign: "center" }}>{children}</blockquote>;
}
function Tbl({ headers, rows }: { headers: string[]; rows: (string | React.ReactNode)[][] }) {
  return (
    <div style={{ overflowX: "auto", margin: "18px 0" }}>
      <table style={{ width: "100%", borderCollapse: "collapse", fontFamily: body, fontSize: 14 }}>
        <thead><tr style={{ background: DK }}>{headers.map((h, i) => <th key={i} style={{ fontFamily: mono, fontSize: 9, color: BODY, textAlign: "left", padding: "8px 12px", letterSpacing: 1, borderBottom: `1px solid ${LINE}` }}>{h}</th>)}</tr></thead>
        <tbody>{rows.map((row, ri) => <tr key={ri} style={{ background: ri % 2 === 0 ? `${DK}80` : "transparent" }}>{row.map((c, ci) => <td key={ci} style={{ padding: "8px 12px", color: LIGHT, borderBottom: `1px solid ${DK}` }}>{c}</td>)}</tr>)}</tbody>
      </table>
    </div>
  );
}

/* ══ CANVAS ══ */
type Mode = "lattice" | "clock" | "causal";

function TimeCanvas({ mode }: { mode: Mode }) {
  const cvs = useRef<HTMLCanvasElement>(null);
  const raf = useRef(0);
  const tick = useRef(0);
  const [beta, setBeta] = useState(0.75); // v/c

  useEffect(() => {
    const canvas = cvs.current!;
    const ctx = canvas.getContext("2d")!;
    const resize = () => {
      const p = canvas.parentElement!;
      canvas.width = p.clientWidth;
      canvas.height = Math.min(420, Math.round(p.clientWidth * 0.5));
    };
    resize();
    window.addEventListener("resize", resize);

    const gamma = () => 1 / Math.sqrt(1 - beta * beta);

    const draw = () => {
      const W = canvas.width, H = canvas.height;
      const t = tick.current;
      ctx.clearRect(0, 0, W, H);

      /* ── LATTICE / GRID MODEL ── */
      if (mode === "lattice") {
        // Background
        ctx.fillStyle = BG0; ctx.fillRect(0, 0, W, H);

        const g = gamma();
        // Left: stationary frame — dense tall cells
        const STAT_COL = 5, STAT_ROW = 5;
        const cellW_stat = 56, cellH_stat = 44;
        const stat_x = W * 0.18 - (STAT_COL * cellW_stat) / 2;
        const stat_y = H * 0.28 - (STAT_ROW * cellH_stat) / 2;

        // Animate: one cell "fires" per tick (temporal update)
        const statTick = Math.floor(t / 6) % (STAT_COL * STAT_ROW);
        ctx.fillStyle = `${AMBER}08`; ctx.fillRect(stat_x, stat_y, STAT_COL * cellW_stat, STAT_ROW * cellH_stat);
        for (let r = 0; r < STAT_ROW; r++) {
          for (let c = 0; c < STAT_COL; c++) {
            const idx = r * STAT_COL + c;
            const active = idx === statTick;
            const recent = Math.abs(idx - statTick) <= 2;
            const cx = stat_x + c * cellW_stat, cy = stat_y + r * cellH_stat;
            ctx.strokeStyle = active ? AMBER2 : recent ? `${AMBER}60` : `${LINE}60`;
            ctx.lineWidth = active ? 1.5 : 0.8;
            ctx.strokeRect(cx + 1, cy + 1, cellW_stat - 2, cellH_stat - 2);
            if (active) {
              ctx.fillStyle = `${AMBER}20`; ctx.fillRect(cx + 1, cy + 1, cellW_stat - 2, cellH_stat - 2);
              // Glow
              const glow = ctx.createRadialGradient(cx + cellW_stat/2, cy + cellH_stat/2, 0, cx + cellW_stat/2, cy + cellH_stat/2, cellW_stat);
              glow.addColorStop(0, `${AMBER}25`); glow.addColorStop(1, "transparent");
              ctx.fillStyle = glow; ctx.fillRect(cx - 10, cy - 10, cellW_stat + 20, cellH_stat + 20);
            }
          }
        }
        // Label
        ctx.font = `bold 10px ${mono}`; ctx.fillStyle = AMBER2; ctx.textAlign = "center";
        ctx.fillText("STATIONARY", stat_x + (STAT_COL * cellW_stat) / 2, stat_y - 14);
        ctx.font = `9px ${mono}`; ctx.fillStyle = BODY;
        ctx.fillText(`${STAT_COL}×${STAT_ROW} cells · γ=1.00`, stat_x + (STAT_COL * cellW_stat) / 2, stat_y - 2);
        ctx.fillText(`${(STAT_COL*STAT_ROW)} temporal steps available`, stat_x + (STAT_COL * cellW_stat) / 2, stat_y + STAT_ROW * cellH_stat + 14);

        // Right: moving frame — squeezed wide cells (time dilated → fewer temporal updates)
        const MOV_COL = 7, MOV_ROW = Math.max(2, Math.round(STAT_ROW / g));
        const cellW_mov = 44, cellH_mov = Math.round(44 * (STAT_ROW / Math.max(MOV_ROW, 1)));
        const mov_x = W * 0.72 - (MOV_COL * cellW_mov) / 2;
        const mov_y = stat_y + (STAT_ROW * cellH_stat - MOV_ROW * cellH_mov) / 2;

        const movTick = Math.floor(t / (6 * g)) % (MOV_COL * MOV_ROW);
        ctx.fillStyle = `${TEAL}08`; ctx.fillRect(mov_x, mov_y, MOV_COL * cellW_mov, MOV_ROW * cellH_mov);
        for (let r = 0; r < MOV_ROW; r++) {
          for (let c = 0; c < MOV_COL; c++) {
            const idx = r * MOV_COL + c;
            const active = idx === movTick;
            const recent = Math.abs(idx - movTick) <= 2;
            const cx = mov_x + c * cellW_mov, cy = mov_y + r * cellH_mov;
            ctx.strokeStyle = active ? TEAL2 : recent ? `${TEAL}60` : `${LINE}60`;
            ctx.lineWidth = active ? 1.5 : 0.8;
            ctx.strokeRect(cx + 1, cy + 1, cellW_mov - 2, cellH_mov - 2);
            if (active) {
              ctx.fillStyle = `${TEAL}18`; ctx.fillRect(cx + 1, cy + 1, cellW_mov - 2, cellH_mov - 2);
            }
          }
        }
        ctx.font = `bold 10px ${mono}`; ctx.fillStyle = TEAL2; ctx.textAlign = "center";
        ctx.fillText(`MOVING  v = ${beta.toFixed(2)}c`, mov_x + (MOV_COL * cellW_mov) / 2, stat_y - 14);
        ctx.font = `9px ${mono}`; ctx.fillStyle = BODY;
        ctx.fillText(`${MOV_COL}×${MOV_ROW} cells · γ=${g.toFixed(2)}`, mov_x + (MOV_COL * cellW_mov) / 2, stat_y - 2);
        ctx.fillText(`${(MOV_COL*MOV_ROW)} temporal steps available`, mov_x + (MOV_COL * cellW_mov) / 2, stat_y + STAT_ROW * cellH_stat + 14);

        // Arrow D (diagonal processing path) from stationary to moving
        const ax1 = stat_x + STAT_COL * cellW_stat + 12;
        const ax2 = mov_x - 12;
        const ay  = stat_y + (STAT_ROW * cellH_stat) / 2;
        ctx.beginPath(); ctx.moveTo(ax1, ay); ctx.lineTo(ax2, ay);
        ctx.strokeStyle = `${AMBER}70`; ctx.lineWidth = 1.5; ctx.setLineDash([4, 4]); ctx.stroke(); ctx.setLineDash([]);
        // Arrowhead
        ctx.beginPath(); ctx.moveTo(ax2, ay); ctx.lineTo(ax2 - 10, ay - 5); ctx.lineTo(ax2 - 10, ay + 5); ctx.closePath();
        ctx.fillStyle = `${AMBER}80`; ctx.fill();
        ctx.font = `9px ${mono}`; ctx.fillStyle = AMBER; ctx.textAlign = "center";
        ctx.fillText("v →", (ax1 + ax2) / 2, ay - 8);
        ctx.fillText("D (diagonal path)", (ax1 + ax2) / 2, ay + 16);

        // Formula
        ctx.font = `13px ${mono}`; ctx.fillStyle = AMBER2; ctx.textAlign = "center";
        const fy = H * 0.87;
        ctx.fillText(`dt′ = dt / √(1 − v²/c²)`, W / 2, fy);
        ctx.font = `9px ${mono}`; ctx.fillStyle = BODY;
        ctx.fillText(`dt′ = ${(1/g).toFixed(3)} dt  (each proper second = ${(1/g).toFixed(3)} coordinate seconds at v=${beta.toFixed(2)}c)`, W / 2, fy + 16);

      /* ── CLOCK COMPARISON ── */
      } else if (mode === "clock") {
        ctx.fillStyle = BG0; ctx.fillRect(0, 0, W, H);
        const g = gamma();

        // Two light clocks: bouncing photon
        const CLK_H = H * 0.5, CLK_W = 80;
        const CLK_SEP = H * 0.45;

        // Stationary clock (vertical bouncing photon)
        const stat_cx = W * 0.28;
        const stat_cy = H * 0.45;
        const statPhase = (t % 60) / 60; // bounces 0→1→0
        const statPhotY = stat_cy + CLK_H * (statPhase < 0.5 ? statPhase * 2 - 0.5 : 1.5 - statPhase * 2);

        // Clock walls
        ctx.strokeStyle = `${AMBER}50`; ctx.lineWidth = 2;
        ctx.strokeRect(stat_cx - CLK_W / 2, stat_cy - CLK_H / 2, CLK_W, CLK_H);
        // Mirrors
        ctx.fillStyle = `${AMBER}80`;
        ctx.fillRect(stat_cx - CLK_W / 2 - 4, stat_cy - CLK_H / 2 - 2, CLK_W + 8, 4);
        ctx.fillRect(stat_cx - CLK_W / 2 - 4, stat_cy + CLK_H / 2 - 2, CLK_W + 8, 4);
        // Photon
        ctx.beginPath(); ctx.arc(stat_cx, statPhotY, 5, 0, Math.PI * 2);
        ctx.fillStyle = AMBER2; ctx.fill();
        const statGlow = ctx.createRadialGradient(stat_cx, statPhotY, 0, stat_cx, statPhotY, 16);
        statGlow.addColorStop(0, `${AMBER2}50`); statGlow.addColorStop(1, "transparent");
        ctx.beginPath(); ctx.arc(stat_cx, statPhotY, 16, 0, Math.PI * 2); ctx.fillStyle = statGlow; ctx.fill();
        // Label
        ctx.font = `bold 10px ${mono}`; ctx.fillStyle = AMBER2; ctx.textAlign = "center";
        ctx.fillText("STATIONARY", stat_cx, stat_cy - CLK_H / 2 - 18);
        ctx.font = `9px ${mono}`; ctx.fillStyle = BODY;
        ctx.fillText("γ = 1.000  ·  1 tick = 1 second", stat_cx, stat_cy + CLK_H / 2 + 18);
        // Tick counter
        const statTicks = Math.floor(t / 30);
        ctx.font = `11px ${mono}`; ctx.fillStyle = AMBER;
        ctx.fillText(`${statTicks} ticks`, stat_cx, stat_cy + CLK_H / 2 + 34);

        // Moving clock (angled — photon travels diagonal path D)
        const mov_cx = W * 0.72;
        const mov_cy = H * 0.45;
        const movPeriod = 60 * g;
        const movPhase = (t % movPeriod) / movPeriod;
        const movPhotY = mov_cy + CLK_H * (movPhase < 0.5 ? movPhase * 2 - 0.5 : 1.5 - movPhase * 2);
        const movPhotX = mov_cx + (beta * 30) * (movPhase * 2 - 1); // horizontal drift as clock moves

        ctx.strokeStyle = `${TEAL}50`; ctx.lineWidth = 2;
        ctx.strokeRect(mov_cx - CLK_W / 2, mov_cy - CLK_H / 2, CLK_W, CLK_H);
        ctx.fillStyle = `${TEAL}80`;
        ctx.fillRect(mov_cx - CLK_W / 2 - 4, mov_cy - CLK_H / 2 - 2, CLK_W + 8, 4);
        ctx.fillRect(mov_cx - CLK_W / 2 - 4, mov_cy + CLK_H / 2 - 2, CLK_W + 8, 4);
        // Photon path shows diagonal D
        ctx.beginPath(); ctx.arc(movPhotX, movPhotY, 5, 0, Math.PI * 2);
        ctx.fillStyle = TEAL2; ctx.fill();
        const movGlow = ctx.createRadialGradient(movPhotX, movPhotY, 0, movPhotX, movPhotY, 16);
        movGlow.addColorStop(0, `${TEAL2}50`); movGlow.addColorStop(1, "transparent");
        ctx.beginPath(); ctx.arc(movPhotX, movPhotY, 16, 0, Math.PI * 2); ctx.fillStyle = movGlow; ctx.fill();
        // Show diagonal path trace
        ctx.beginPath();
        ctx.moveTo(mov_cx - CLK_W / 2 + 6, mov_cy - CLK_H / 2 + 6);
        ctx.lineTo(mov_cx + CLK_W / 2 - 6 + beta * 30, mov_cy + CLK_H / 2 - 6);
        ctx.strokeStyle = `${TEAL}30`; ctx.lineWidth = 0.8; ctx.setLineDash([3, 3]); ctx.stroke(); ctx.setLineDash([]);
        // D label
        ctx.font = `italic 12px ${mono}`; ctx.fillStyle = `${TEAL}90`; ctx.textAlign = "left";
        ctx.fillText("D", mov_cx + CLK_W / 2 + 6, mov_cy + CLK_H / 2 - 10);

        ctx.font = `bold 10px ${mono}`; ctx.fillStyle = TEAL2; ctx.textAlign = "center";
        ctx.fillText(`MOVING  v = ${beta.toFixed(2)}c`, mov_cx, mov_cy - CLK_H / 2 - 18);
        ctx.font = `9px ${mono}`; ctx.fillStyle = BODY;
        ctx.fillText(`γ = ${g.toFixed(3)}  ·  1 tick = ${g.toFixed(3)} seconds`, mov_cx, mov_cy + CLK_H / 2 + 18);
        const movTicks = Math.floor(t / (30 * g));
        ctx.font = `11px ${mono}`; ctx.fillStyle = TEAL;
        ctx.fillText(`${movTicks} ticks`, mov_cx, mov_cy + CLK_H / 2 + 34);

        // Explanation: longer path D means fewer bounces
        ctx.font = `9px ${mono}`; ctx.fillStyle = `${AMBER}70`; ctx.textAlign = "center";
        ctx.fillText("Photon travels diagonal path D — longer distance at same speed c", W / 2, H * 0.85);
        ctx.fillText(`→ fewer bounces per coordinate second → moving clock runs slower by factor γ = ${g.toFixed(3)}`, W / 2, H * 0.85 + 16);
        ctx.fillStyle = PALE;
        ctx.fillText(`Stationary: ${statTicks} ticks | Moving: ${movTicks} ticks | Ratio: ${statTicks > 0 ? (statTicks / Math.max(movTicks, 1)).toFixed(2) : "—"} ≈ γ`, W / 2, H * 0.92);

      /* ── CAUSAL BANDWIDTH ── */
      } else if (mode === "causal") {
        ctx.fillStyle = BG0; ctx.fillRect(0, 0, W, H);
        const g = gamma();

        // Pie chart: spatial vs temporal processing budget
        const pie_cx = W * 0.32, pie_cy = H * 0.45;
        const pie_r = Math.min(W * 0.18, H * 0.3);

        const spatialFrac = beta;
        const temporalFrac = Math.sqrt(1 - beta * beta); // = 1/γ normalized

        // Spatial arc
        ctx.beginPath();
        ctx.moveTo(pie_cx, pie_cy);
        ctx.arc(pie_cx, pie_cy, pie_r, -Math.PI / 2, -Math.PI / 2 + spatialFrac * Math.PI * 2);
        ctx.closePath();
        ctx.fillStyle = `${TEAL}50`; ctx.fill();
        ctx.strokeStyle = `${TEAL}90`; ctx.lineWidth = 1.5; ctx.stroke();

        // Temporal arc
        ctx.beginPath();
        ctx.moveTo(pie_cx, pie_cy);
        ctx.arc(pie_cx, pie_cy, pie_r, -Math.PI / 2 + spatialFrac * Math.PI * 2, -Math.PI / 2 + Math.PI * 2);
        ctx.closePath();
        ctx.fillStyle = `${AMBER}50`; ctx.fill();
        ctx.strokeStyle = `${AMBER}90`; ctx.lineWidth = 1.5; ctx.stroke();

        // Inner circle
        ctx.beginPath(); ctx.arc(pie_cx, pie_cy, pie_r * 0.35, 0, Math.PI * 2);
        ctx.fillStyle = BG0; ctx.fill();
        ctx.font = `8px ${mono}`; ctx.fillStyle = WHITE; ctx.textAlign = "center";
        ctx.fillText("c = 1", pie_cx, pie_cy - 4); ctx.fillText("total", pie_cx, pie_cy + 8);

        // Labels
        const sp_angle = -Math.PI / 2 + spatialFrac * Math.PI;
        ctx.font = `bold 10px ${mono}`; ctx.fillStyle = TEAL2; ctx.textAlign = "center";
        ctx.fillText(`SPATIAL`, pie_cx + Math.cos(sp_angle) * pie_r * 1.4, pie_cy + Math.sin(sp_angle) * pie_r * 1.4 - 6);
        ctx.font = `9px ${mono}`; ctx.fillStyle = TEAL;
        ctx.fillText(`v/c = ${beta.toFixed(2)}`, pie_cx + Math.cos(sp_angle) * pie_r * 1.4, pie_cy + Math.sin(sp_angle) * pie_r * 1.4 + 8);

        const tp_angle = -Math.PI / 2 + spatialFrac * Math.PI * 2 + temporalFrac * Math.PI;
        ctx.font = `bold 10px ${mono}`; ctx.fillStyle = AMBER2; ctx.textAlign = "center";
        ctx.fillText(`TEMPORAL`, pie_cx + Math.cos(tp_angle) * pie_r * 1.5, pie_cy + Math.sin(tp_angle) * pie_r * 1.5 - 6);
        ctx.font = `9px ${mono}`; ctx.fillStyle = AMBER;
        ctx.fillText(`1/γ = ${temporalFrac.toFixed(3)}`, pie_cx + Math.cos(tp_angle) * pie_r * 1.5, pie_cy + Math.sin(tp_angle) * pie_r * 1.5 + 8);

        ctx.font = `10px ${mono}`; ctx.fillStyle = PALE; ctx.textAlign = "center";
        ctx.fillText("CAUSAL BANDWIDTH BUDGET", pie_cx, pie_cy - pie_r - 22);
        ctx.font = `8px ${mono}`; ctx.fillStyle = BODY;
        ctx.fillText("(v/c)² + (1/γ)² = 1", pie_cx, pie_cy + pie_r + 18);

        // Right: bar chart of γ vs v/c
        const chart_x = W * 0.58, chart_y = H * 0.12;
        const chart_w = W * 0.36, chart_h = H * 0.72;
        ctx.strokeStyle = LINE; ctx.lineWidth = 0.6;
        ctx.strokeRect(chart_x, chart_y, chart_w, chart_h);

        // Grid
        for (let gi = 0; gi <= 4; gi++) {
          const yy = chart_y + chart_h - gi / 4 * chart_h;
          ctx.beginPath(); ctx.moveTo(chart_x, yy); ctx.lineTo(chart_x + chart_w, yy);
          ctx.strokeStyle = `${LINE}40`; ctx.lineWidth = 0.5; ctx.stroke();
          ctx.font = `7px ${mono}`; ctx.fillStyle = BODY; ctx.textAlign = "right";
          ctx.fillText(`${(gi * 0.25).toFixed(2)}`, chart_x - 4, yy + 3);
        }

        // 1/γ curve (temporal fraction) — amber
        ctx.beginPath();
        for (let xi = 0; xi <= chart_w; xi++) {
          const b = xi / chart_w;
          const tFrac = Math.sqrt(1 - b * b);
          const px = chart_x + xi;
          const py = chart_y + chart_h - tFrac * chart_h;
          xi === 0 ? ctx.moveTo(px, py) : ctx.lineTo(px, py);
        }
        ctx.strokeStyle = AMBER; ctx.lineWidth = 2; ctx.stroke();

        // v/c line — teal
        ctx.beginPath();
        for (let xi = 0; xi <= chart_w; xi++) {
          const b = xi / chart_w;
          const px = chart_x + xi;
          const py = chart_y + chart_h - b * chart_h;
          xi === 0 ? ctx.moveTo(px, py) : ctx.lineTo(px, py);
        }
        ctx.strokeStyle = TEAL; ctx.lineWidth = 1.5; ctx.setLineDash([4, 3]); ctx.stroke(); ctx.setLineDash([]);

        // Current β marker
        const marker_x = chart_x + beta * chart_w;
        const marker_y_temp = chart_y + chart_h - Math.sqrt(1 - beta * beta) * chart_h;
        ctx.beginPath(); ctx.arc(marker_x, marker_y_temp, 5, 0, Math.PI * 2);
        ctx.fillStyle = AMBER; ctx.fill();
        ctx.beginPath(); ctx.moveTo(marker_x, chart_y); ctx.lineTo(marker_x, chart_y + chart_h);
        ctx.strokeStyle = `${WHITE}25`; ctx.lineWidth = 1; ctx.stroke();

        // Axis labels
        ctx.font = `7px ${mono}`; ctx.fillStyle = AMBER; ctx.textAlign = "left";
        ctx.fillText("← 1/γ  (temporal budget)", chart_x + 6, chart_y + 12);
        ctx.fillStyle = TEAL;
        ctx.fillText("← v/c  (spatial budget)", chart_x + 6, chart_y + 24);
        ctx.fillStyle = BODY; ctx.textAlign = "center";
        ctx.fillText("v/c  →", chart_x + chart_w / 2, chart_y + chart_h + 14);

        // AETHER processing formula
        ctx.font = `10px ${mono}`; ctx.fillStyle = AMBER2; ctx.textAlign = "center";
        ctx.fillText(`v=${beta.toFixed(2)}c → spatial ${(beta*100).toFixed(0)}% · temporal ${(temporalFrac*100).toFixed(0)}%`, W * 0.31, H * 0.87);
        ctx.font = `8px ${mono}`; ctx.fillStyle = BODY;
        ctx.fillText("(v/c)² + (dt′/dt)² = 1   ·   processing budget = c²", W * 0.31, H * 0.87 + 14);
      }

      tick.current++; raf.current = requestAnimationFrame(draw);
    };
    draw();
    return () => { cancelAnimationFrame(raf.current); window.removeEventListener("resize", resize); };
  }, [mode, beta]);

  return (
    <div>
      <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 12, flexWrap: "wrap" }}>
        <span style={{ fontFamily: mono, fontSize: 9, color: AMBER, letterSpacing: 2 }}>v/c</span>
        <input type="range" min="0.01" max="0.99" step="0.01" value={beta}
          onChange={e => setBeta(parseFloat(e.target.value))}
          style={{ flex: 1, accentColor: AMBER, minWidth: 120 }} />
        <span style={{ fontFamily: mono, fontSize: 11, color: AMBER2, minWidth: 54 }}>{beta.toFixed(2)}c</span>
        <span style={{ fontFamily: mono, fontSize: 11, color: LAVD, minWidth: 60 }}>γ = {(1/Math.sqrt(1-beta*beta)).toFixed(3)}</span>
        <span style={{ fontFamily: mono, fontSize: 11, color: PALE, minWidth: 80 }}>dt′ = {Math.sqrt(1-beta*beta).toFixed(3)} dt</span>
      </div>
      <div style={{ borderRadius: 10, overflow: "hidden", border: `1px solid ${LINE}` }}>
        <canvas ref={cvs} style={{ display: "block", width: "100%" }} />
      </div>
    </div>
  );
}

function ModeTabs({ value, onChange }: { value: Mode; onChange: (m: Mode) => void }) {
  const tabs: { k: Mode; label: string; col: string }[] = [
    { k: "lattice", label: "Lattice Grid · Processing Delay",     col: AMBER  },
    { k: "clock",   label: "Light Clock · Diagonal Path D",       col: TEAL   },
    { k: "causal",  label: "Causal Bandwidth · Spatial+Temporal", col: LAVD   },
  ];
  return (
    <div style={{ display: "flex", gap: 6, marginBottom: 12, flexWrap: "wrap" }}>
      {tabs.map(tab => (
        <button key={tab.k} onClick={() => onChange(tab.k)} style={{ fontFamily: mono, fontSize: 10, padding: "5px 16px", borderRadius: 4, cursor: "pointer", border: `1px solid ${value === tab.k ? tab.col : LINE}`, background: value === tab.k ? `${tab.col}14` : "transparent", color: value === tab.k ? tab.col : BODY, transition: "all 0.2s" }}>{tab.label}</button>
      ))}
    </div>
  );
}

const NAV = [
  { id: "s1", label: "The Formula" }, { id: "s2", label: "Lattice Model" },
  { id: "s3", label: "Processing Budget" }, { id: "s4", label: "Light Clock" },
  { id: "s5", label: "Information" }, { id: "s6", label: "Subjective Time" },
  { id: "s7", label: "AETHER" },
];

export default function TimeProcessingPage() {
  const [mode, setMode] = useState<Mode>("lattice");

  return (
    <div style={{ background: BG0, minHeight: "100vh", fontFamily: body, color: PALE }}>

      {/* ── HERO ─────────────────────────────────────────────────────── */}
      <div style={{ position: "relative", overflow: "hidden" }}>
        <div style={{
          position: "absolute", inset: 0,
          background: `
            radial-gradient(ellipse 70% 50% at 50% 0%, rgba(212,164,72,0.12) 0%, transparent 60%),
            radial-gradient(ellipse 50% 80% at 15% 70%, rgba(72,184,200,0.08) 0%, transparent 50%),
            linear-gradient(180deg, ${BG1} 0%, ${BG0} 100%)
          `,
        }} />
        {/* Subtle vertical grid lines — the "lattice" */}
        {Array.from({ length: 12 }, (_, i) => (
          <div key={i} style={{ position: "absolute", left: `${(i + 1) * 8.33}%`, top: 0, bottom: 0, width: 1, background: `linear-gradient(180deg, transparent, ${AMBER}15, transparent)`, opacity: 0.5 }} />
        ))}
        <div style={{ position: "relative", padding: "72px 28px 54px", textAlign: "center" }}>
          <div style={{ fontFamily: mono, fontSize: 9, color: AMBER, letterSpacing: 6, marginBottom: 14 }}>
            AETHER · TIME THEORY · PROCESSING DELAY
          </div>
          <h1 style={{
            fontFamily: serif, fontSize: "clamp(22px,4vw,52px)",
            background: `linear-gradient(135deg, ${AMBER}80 0%, ${AMBER2} 40%, ${WHITE} 60%, ${LAVD} 100%)`,
            WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text",
            margin: "0 0 16px", letterSpacing: 3, lineHeight: 1.1,
          }}>
            TIME IS A<br/>PROCESSING DELAY
          </h1>
          <div style={{
            fontFamily: body, fontStyle: "italic", fontSize: 18,
            background: `linear-gradient(90deg, ${AMBER}60, ${PALE}, ${TEAL}60)`,
            WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text",
            marginBottom: 20,
          }}>
            Lorentz Time Dilation · Causal Bandwidth · Computational Spacetime · AETHER Coherence
          </div>
          <p style={{ fontFamily: body, fontSize: 16, color: BODY, maxWidth: 680, margin: "0 auto 24px", lineHeight: 1.9 }}>
            The Lorentz factor dt′ = dt/√(1−v²/c²) is not just a geometric curiosity of curved spacetime.
            It is a statement about causal processing bandwidth: a system moving at velocity v
            must spend v/c of its computational budget on spatial updates, leaving only √(1−v²/c²)
            for temporal evolution. Time slows because the system is <em>busy processing space</em>.
          </p>

          {/* Big formula display */}
          <div style={{ display: "inline-block", padding: "18px 36px", background: `${AMBER}0a`, border: `1px solid ${AMBER}30`, borderRadius: 10, marginBottom: 24 }}>
            <div style={{ fontFamily: mono, fontSize: "clamp(16px,3vw,28px)", color: AMBER2, letterSpacing: 2 }}>
              dt′ = dt / √(1 − v²/c²)
            </div>
            <div style={{ fontFamily: body, fontSize: 13, color: AMBER, marginTop: 6, fontStyle: "italic" }}>
              proper time = coordinate time × temporal processing fraction
            </div>
          </div>

          <div style={{ display: "flex", gap: 6, justifyContent: "center", flexWrap: "wrap" }}>
            <Chip c={AMBER}>Lorentz Factor γ</Chip>
            <Chip c={TEAL}>Light Clock Geometry</Chip>
            <Chip c={LAVD}>Causal Bandwidth</Chip>
            <Chip c={PALE}>Landauer Principle</Chip>
            <Chip c={AMBER2}>Diagonal Path D</Chip>
            <Chip c={TEAL2}>Minkowski Spacetime</Chip>
            <Chip c={ROSE}>Subjective Time</Chip>
            <Chip c={LAVD}>AETHER C(x,t)</Chip>
          </div>
        </div>
      </div>

      {/* Sticky nav */}
      <div style={{ position: "sticky", top: 0, zIndex: 50, background: `${BG0}f0`, backdropFilter: "blur(12px)", borderBottom: `1px solid ${LINE}`, padding: "8px 18px", display: "flex", gap: 4, overflowX: "auto" }}>
        {NAV.map(s => (
          <a key={s.id} href={`#${s.id}`} style={{ fontFamily: mono, fontSize: 10, color: BODY, whiteSpace: "nowrap", padding: "4px 10px", borderRadius: 4, textDecoration: "none" }}
            onMouseEnter={e => { (e.target as HTMLElement).style.color = AMBER; }}
            onMouseLeave={e => { (e.target as HTMLElement).style.color = BODY; }}
          >{s.label}</a>
        ))}
      </div>

      <div style={{ maxWidth: 940, margin: "0 auto", padding: "0 22px 96px" }}>

        {/* Canvas */}
        <div style={{ marginTop: 36 }}>
          <ModeTabs value={mode} onChange={setMode} />
          <TimeCanvas mode={mode} />
          <div style={{ fontFamily: mono, fontSize: 9, color: BODY, marginTop: 6, lineHeight: 1.8 }}>
            {mode === "lattice" && "DRAG SLIDER TO SET v/c · STATIONARY (AMBER): DENSE TALL GRID — MANY TEMPORAL PROCESSING STEPS · MOVING (TEAL): FEWER ROWS = FEWER TEMPORAL UPDATES PER COORDINATE SECOND · DIAGONAL PATH D REPRESENTS SPATIAL DISPLACEMENT CONSUMING COMPUTE BUDGET"}
            {mode === "clock" && "LIGHT CLOCK: PHOTON BOUNCES BETWEEN MIRRORS AT SPEED c · MOVING CLOCK: PHOTON TAKES DIAGONAL PATH D (LONGER DISTANCE AT SAME c) → FEWER BOUNCES PER SECOND → SLOWER CLOCK · TICK COUNTERS SHOW ACCUMULATING DESYNCHRONISATION"}
            {mode === "causal" && "PIE CHART: TOTAL PROCESSING BUDGET = c² = 1 · TEAL = SPATIAL (v/c) · AMBER = TEMPORAL (1/γ) · SUM: (v/c)² + (1/γ)² = 1 · RIGHT: 1/γ CURVE SHOWS HOW TEMPORAL FRACTION DROPS AS v APPROACHES c"}
          </div>
        </div>

        {/* ── I ── */}
        <Sect id="s1" n="I" title="The Formula and What It Actually Says" sub="dt′ = dt/√(1−v²/c²) — reading the Lorentz factor computationally" />
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 28 }}>
          <div style={{ background: `${AMBER}08`, border: `1px solid ${AMBER}30`, borderRadius: 8, padding: "18px 20px" }}>
            <div style={{ fontFamily: mono, fontSize: 10, color: AMBER, letterSpacing: 2, marginBottom: 10 }}>STANDARD READING</div>
            <div style={{ fontFamily: body, fontSize: 15, color: PALE, lineHeight: 1.85 }}>
              dt′ is the proper time — the time elapsed on a moving clock.<br />
              dt is coordinate time — the time elapsed in the stationary frame.<br />
              γ = 1/√(1−v²/c²) ≥ 1, so dt′ ≤ dt always.<br />
              Moving clocks always run <em>slower</em> than stationary ones.
            </div>
          </div>
          <div style={{ background: `${TEAL}08`, border: `1px solid ${TEAL}30`, borderRadius: 8, padding: "18px 20px" }}>
            <div style={{ fontFamily: mono, fontSize: 10, color: TEAL2, letterSpacing: 2, marginBottom: 10 }}>PROCESSING READING</div>
            <div style={{ fontFamily: body, fontSize: 15, color: PALE, lineHeight: 1.85 }}>
              A system moving at v uses fraction v/c of its causal budget on spatial processing.<br />
              Remaining budget for temporal processing: √(1−v²/c²).<br />
              Proper time rate = temporal processing fraction × coordinate time rate.<br />
              Time dilation is <em>the cost of being somewhere else</em>.
            </div>
          </div>
        </div>

        <EQ>{`Complete Lorentz transformation — all four components:

  Time dilation:      dt′ = dt / γ = dt √(1 − v²/c²)          [moving clock runs slower]
  Length contraction: L′ = L / γ = L √(1 − v²/c²)             [moving rulers shrink]
  Velocity addition:  u′ = (u − v)/(1 − uv/c²)                [no velocity exceeds c]
  Mass-energy:        E² = (pc)² + (mc²)²  →  E = γmc²        [moving mass increases]

The Lorentz factor γ:
  γ = 1/√(1 − v²/c²) = 1/√(1 − β²)    where β = v/c

  v = 0.00c:  γ = 1.000  →  1.000 second per coordinate second
  v = 0.50c:  γ = 1.155  →  0.866 seconds per coordinate second
  v = 0.75c:  γ = 1.512  →  0.661 seconds per coordinate second
  v = 0.87c:  γ = 2.028  →  0.493 seconds per coordinate second  (one c)
  v = 0.90c:  γ = 2.294  →  0.436 seconds per coordinate second
  v = 0.99c:  γ = 7.089  →  0.141 seconds per coordinate second
  v = 0.999c: γ = 22.37  →  0.045 seconds per coordinate second
  v → c:      γ → ∞      →  dt′ → 0  [photons: no proper time elapses at all]

Pythagorean identity (the key):
  (v/c)² + (dt′/dt)² = (v/c)² + (1/γ)² = β² + (1 − β²) = 1
  → Spatial velocity and temporal rate are components of a 4-velocity unit vector
  → Every system's total "velocity through spacetime" is exactly c`}</EQ>

        {/* ── II ── */}
        <Sect id="s2" n="II" title="The Lattice / Grid Model" sub="Each cell in the lattice fires once per Planck time — velocity consumes cell budget spatially" />
        <p style={{ fontFamily: body, fontSize: 16, color: BODY, lineHeight: 1.85, marginBottom: 18 }}>
          The diagram in the image shows two grids: a taller stationary grid (many rows = many temporal processing steps)
          and a shorter moving grid (fewer rows = fewer temporal updates, more columns = more spatial steps).
          This is not just a metaphor — it is the discrete structure of digital physics and cellular automaton models of spacetime.
        </p>
        <EQ>{`Lattice / cellular automaton model of spacetime:

  Fundamental cell: Planck volume l_P³ × Planck time t_P
    l_P = √(ħG/c³) = 1.616 × 10⁻³⁵ m
    t_P = l_P/c    = 5.391 × 10⁻⁴⁴ s

  Each cell performs one computation step per t_P ("fires once per Planck time")
  Total processing rate per cell: Ω_max = 1/t_P = 1.855 × 10⁴³ Hz
  This is the Planck frequency — the maximum clock speed of the universe.

  Stationary observer's grid (v = 0):
    All Ω_max goes to TEMPORAL processing
    → Maximum resolution of time-stepping: one update per t_P
    → Experienced time rate: dt′/dt = 1 (full temporal budget)

  Moving observer's grid (v = 0.75c):
    Fraction used for spatial tracking: β = 0.75 → 75% of Ω_max
    Remaining for temporal: √(1 − 0.75²) = 0.661 → 66.1% of Ω_max
    Experienced time rate: dt′/dt = 0.661

  The diagonal D in the image:
    D = path a photon (or the observer) takes through the lattice
    Stationary: photon bounces vertically (pure temporal path, D = ct)
    Moving at v: photon bounces diagonally (D = √((vt)² + (ct′)²) = ct by invariance)
    → c²t² = v²t² + c²t′²
    → t′² = t²(1 − v²/c²)
    → t′ = t/γ   ← This IS the Lorentz derivation

  Bekenstein-Hawking bound (maximum information per volume):
    I_max = A / 4l_P²  bits  (holographic bound — area not volume)
    → Maximum processing density = c³/(4ħG) ≈ 10⁹⁵ operations/m³/s
    → At this limit, adding more matter to a region creates a black hole
    → The processing lattice is physically real: exceed it → horizon forms`}</EQ>

        {/* ── III ── */}
        <Sect id="s3" n="III" title="Causal Processing Budget" sub="The Pythagorean identity — spatial + temporal velocities sum to c²" accent={TEAL} />
        <EQ>{`Four-velocity: every object moves through spacetime at exactly c.

  4-velocity vector: U^μ = (γc, γv_x, γv_y, γv_z)
  Norm: U^μ U_μ = γ²c² − γ²v² = γ²(c² − v²) = c²  [always]

  Decomposition:
    Temporal component: U^t = γc  (coordinate speed through time)
    Spatial component:  |U^space| = γv
    Invariant: c² = (U^t/γ)² + (|U^space|/γ)² only if at rest

  Processing budget interpretation:
    Define processing fraction p_t = dt′/dt = 1/γ (temporal processing share)
                             p_s = v/c             (spatial processing share)
    Then: p_s² + p_t² = (v/c)² + (1/γ)² = v²/c² + 1 − v²/c² = 1

    This is a unit circle: every object's processing state lies on the unit circle
    in (spatial, temporal) processing space.

    REST   (v=0):    p_s=0.000, p_t=1.000 → all budget = temporal  → maximum subjective time rate
    MOVING (v=0.5c): p_s=0.500, p_t=0.866 → 86.6% temporal budget  → time runs at 86.6%
    FAST   (v=0.9c): p_s=0.900, p_t=0.436 → 43.6% temporal budget  → time runs at 43.6%
    LIGHT  (v=c):    p_s=1.000, p_t=0.000 → 0% temporal budget     → photons: NO time passes

  The speed of light c is the total processing budget — a conservation law:
    If you spend v/c on spatial displacement, you must spend √(1−v²/c²) on time.
    This is not arbitrary — it follows from the structure of Minkowski spacetime
    where the metric signature (−,+,+,+) creates this exact Pythagorean trade-off.

  AETHER version:
    C(x,t) coherence field total rate: ∂_μ∂^μ C = 0 (wave equation, speed c)
    Spatial gradient energy: (∂C/∂x)² + (∂C/∂y)² + (∂C/∂z)²
    Temporal gradient energy: (∂C/∂t)²/c²
    Conservation: (∂C/∂t)²/c² + (∂C/∂x)² = const  [along each characteristic]
    → Moving C-field spends coherence bandwidth on spatial variation → less temporal variation
    → A highly spatially-varying C-field has LESS temporal variation → time runs slower inside it`}</EQ>

        {/* ── IV ── */}
        <Sect id="s4" n="IV" title="Light Clock · Diagonal Path D" sub="The visual proof — why moving clocks run slow by pure geometry" />
        <p style={{ fontFamily: body, fontSize: 16, color: BODY, lineHeight: 1.85, marginBottom: 18 }}>
          The light clock is the clearest derivation of time dilation, and it is entirely geometric.
          No field equations. No curved spacetime. Just: light goes at c, the clock moves at v,
          the diagonal path D is longer than the vertical path, and c = D/t always.
        </p>
        <EQ>{`Light clock derivation (the "diagonal path D"):

  Setup:
    Two parallel mirrors separated by distance L (perpendicular to motion).
    A photon bounces between them — one "tick" = one round trip.
    Stationary: photon travels 2L vertically per tick.
    Moving at v: photon travels diagonally (to reach the opposite mirror that has moved).

  Geometry (one half-bounce):
    Stationary half-period: t₀ = L/c
    Moving half-period:     t  = ?
    
    In the stationary frame, while photon bounces once:
      Horizontal distance traveled by clock: d = v·t
      Vertical distance: L (mirrors are perpendicular to motion, no contraction)
      Diagonal path: D = √(L² + d²) = √(L² + v²t²)
      
    Photon travels D at speed c:
      D = c·t  →  c·t = √(L² + v²t²)
      c²t² = L² + v²t²
      t²(c² − v²) = L²
      t = L/√(c² − v²) = (L/c)/√(1 − v²/c²) = t₀/√(1 − v²/c²)

    One tick of moving clock = 2t = 2t₀/√(1 − v²/c²) = 2t₀ · γ
    → Moving clock ticks γ times SLOWER per coordinate second
    → Proper time dt′ = dt/γ = dt · √(1 − v²/c²)      ← QED

  Physical interpretations of path D:
    1. GEOMETRIC: D is literally the longer path the photon takes.
    2. COMPUTATIONAL: D represents the combined spatial+temporal processing work.
       Vertical component = temporal processing = L = c·t₀
       Horizontal component = spatial processing = v·t
       Total = D = c·t (invariant speed c = total processing rate)
    3. SPACETIME: D is the interval ds² = c²dt² − dx² (Minkowski signature)
       The photon's worldline is null: ds = 0 → c²dt² = dx² → dx/dt = c
    4. AETHER: D is the coherence path C(x,t) must traverse — spatial deviation
       costs the same "computational distance" as temporal evolution at rate c.`}</EQ>

        {/* ── V ── */}
        <Sect id="s5" n="V" title="Information-Theoretic Derivation" sub="Landauer principle + holographic bound → time dilation as information cost" accent={LAVD} />
        <EQ>{`Time as computational cost — Landauer and the holographic bound:

  Landauer's principle (1961):
    Minimum energy to erase one bit: E_L = kT ln(2) ≈ 2.9 × 10⁻²¹ J at T=300K
    → Information processing has a thermodynamic cost
    → The universe's information processing is NOT free

  Margolus-Levitin theorem (1998):
    Maximum operations per second per unit energy: f_max = 2E/(πħ)
    → At Planck energy E_P = √(ħc⁵/G) = 1.956 × 10⁹ J:
      f_max = 2E_P/(πħ) ≈ 1.855 × 10⁴³ Hz = Planck frequency = 1/t_P
    → The universe operates AT its maximum computational rate (Planck scale)

  Holographic bound (Bekenstein 1972, 't Hooft 1993, Susskind 1995):
    Maximum information in a region of area A: I = A/4l_P² bits
    → A sphere of radius R: I_max = 4πR²/4l_P² = πR²/l_P²
    → Exceeding this creates a black hole — the ultimate processing bottleneck
    → Information is 2D (on the boundary), processed at the interior

  Time dilation as information routing:
    At rest: all I_max bits/s go to temporal updating (local clock ticks)
    At v: fraction (v/c) of spatial Planck cells must be updated per time step
           → These cells are "re-used" for spatial tracking, not temporal evolution
    Processing rate available for time: f_temporal = f_max × √(1 − v²/c²) = f_max/γ
    Subjective time rate ∝ f_temporal → dt′/dt = 1/γ   ← same result, new derivation

  Black hole time dilation (gravitational — Schwarzschild):
    At radius r from mass M:  dt′/dt = √(1 − r_s/r)   where r_s = 2GM/c²
    At r = r_s (event horizon): dt′/dt = 0 → time stops (infinite processing overhead)
    At r → ∞: dt′/dt → 1 (no gravitational cost)
    
    AETHER unification: both cases are the same C(x,t) depletion:
      Velocity: C-field bandwidth consumed by spatial processing (v/c fraction)
      Gravity: C-field bandwidth consumed by gravitational field curvature (r_s/r fraction)
      Unified: dt′/dt = √(1 − β² − r_s/r)  (first-order; exact form requires full GR)`}</EQ>

        {/* ── VI ── */}
        <Sect id="s6" n="VI" title="Subjective Time · The Experience of Processing" sub="Why time feels slow in boredom and fast in flow — processing rate is subjective" accent={ROSE} />
        <p style={{ fontFamily: body, fontSize: 16, color: BODY, lineHeight: 1.85, marginBottom: 18 }}>
          The relativistic processing model has a direct psychological correlate. If time is
          information processing rate, then subjective time — how fast time feels — should depend
          on the brain's current processing bandwidth, not the coordinate clock on the wall.
        </p>
        <Tbl headers={["STATE", "Brain Activity", "Info Processing Rate", "Subjective Time", "Mechanism"]}
          rows={[
            ["Boredom / Rest",      "Low, sparse firing", "Low bits/s",   "Drags — feels slow",     "Few events to process → low refresh rate → each second feels full"],
            ["Flow / Focus",        "High, coherent",     "High bits/s",  "Flies — feels fast",     "High-bandwidth state processes many 'frames' per second — minutes vanish"],
            ["Fear / Adrenaline",   "Very high, chaotic", "Burst bits/s", "Slows — hyper-detail",  "Emergency: max bandwidth → each fraction of second expands into rich detail"],
            ["Meditation / Still",  "Low, very coherent", "Refined bits/s","Expands, dissolves",   "Coherent low-bandwidth: temporal resolution maximal, spatial minimal"],
            ["Dream state",         "Variable, internal", "Internal loop", "Nonlinear, stretched",  "Processing loop decoupled from external clock → subjective time unconstrained"],
            ["Ketamine / psychedelics","Burst, disrupted", "High+chaotic", "Radically expanded",   "Processing rate uncoupled from memory-marking → hours feel like years"],
          ]}
        />
        <EQ>{`Subjective time model:
  
  Processing-based subjective time:
    T_subjective = ∫ f_process(t) dt   [total bits processed]
    where f_process(t) = neural firing rate × spike informativity (bits/spike)
    
  Relativistic analogy:
    f_process(at rest)   = f_max_brain ≈ 10¹⁴ bits/s (visual cortex alone)
    f_process(in flow)   = f_max_brain × efficiency ≈ high bits/s, fast T_subjective
    f_process(in boredom)= f_max_brain × 0.01 → slow T_subjective per coord. second
    
  The adrenaline/fear slow-motion effect:
    Measured: car-accident survivors report 2–5× expansion of perceived time
    Mechanism: catecholamine burst → β-adrenergic activation → 3–5× firing rate increase
               → f_process(fear) >> f_process(normal) → more subjective time per second
               → Consistent with: T_subj = ∫ f_process dt (more processing = more experienced time)
    
  AETHER: subjective time T_subj ∝ ∫ ‖∂C/∂t‖ dt
    The coherence field's temporal derivative is the subjective time rate.
    High C-field activity (coherent firing, flow states) → slow subjective time, rich experience.
    Low C-field activity (boredom) → fast subjective time, thin experience.
    → Meditation: coherence high, C-field gradient low → time expands
    → Psychedelics: coherence disrupted → temporal processing rate varies wildly`}</EQ>

        <Pull col={AMBER}>"At the event horizon, time stops — not because a clock breaks, but because every photon of processing bandwidth is consumed by the gravitational gradient. Time is computation, and the black hole is simply running a hotter process."</Pull>

        {/* ── VII ── */}
        <Sect id="s7" n="VII" title="AETHER Resolution · C(x,t) as the Processor" sub="The coherence field is the substrate in which time is computed — and time dilation is bandwidth depletion" accent={LAVD} />
        <EQ>{`AETHER time-processing unification:

  C(x,t) coherence field obeys the wave equation:
    □C = ∂²C/∂(ct)² − ∇²C = 0   [massless, propagates at c]
    Solutions: C(x,t) = A e^{i(kx − ωt)} with ω/k = c

  Processing interpretation:
    Each point in spacetime has a C-field value.
    The rate of change ∂C/∂t = the "clock speed" at that point.
    The gradient |∇C| = the "spatial processing demand" at that point.
    Wave equation: (∂C/∂t)² = c²(∇C)² → they must balance.
    High spatial gradient ∇C → high temporal derivative ∂C/∂t → fast evolution.
    But LOCALLY: if a system is moving at v, it is tracing a worldline in C-space
    where the spatial change per unit time is v · |∂C/∂x| = v/c times the max.
    → Remaining for ∂C/∂t: √(1 − v²/c²) × max → same Lorentz factor.

  Near massive objects (gravity = curved C-field):
    Gravitational field curves the coherence substrate: C_gravity ≈ C₀(1 − r_s/2r)
    Near the Schwarzschild radius: C → 0 → no coherence → no time → horizon
    Far from mass: C → C₀ → full coherence → coordinate time = proper time

  The unified picture:
    VELOCITY time dilation: system moving at v → spatial processing depletes C bandwidth
    GRAVITY time dilation:  gravitational gradient depletes C bandwidth directly
    BOTH: dt′/dt = ‖C_local/C_max‖ = local coherence fraction
    
    This gives a single equation for time dilation from any source:
    dt′/dt = C(x,t) / C_max   [the local coherence field value, normalised]
    
    LIMIT 1: flat spacetime, v=0 → C=C_max → dt′/dt = 1   ✓
    LIMIT 2: moving at v → C = C_max √(1−v²/c²) → dt′/dt = 1/γ   ✓
    LIMIT 3: at Schwarzschild radius → C = 0 → dt′/dt = 0   ✓
    LIMIT 4: inside black hole → C imaginary → time becomes spacelike   ✓ (GR prediction)

  Final statement:
    Time is not a fourth dimension that "just exists."
    Time is the rate at which the AETHER coherence field updates itself.
    Anything that depletes local C(x,t) — velocity, gravity, high processing load —
    slows the update rate, and therefore slows time.
    
    The Lorentz factor is not exotic. It is the simplest possible consequence
    of a universe where processing bandwidth is finite and conserved.`}</EQ>

        <div style={{ marginTop: 56, padding: "24px 28px", background: `${AMBER}08`, border: `1px solid ${AMBER}25`, borderRadius: 12, textAlign: "center" }}>
          <div style={{ fontFamily: serif, fontSize: 17, color: AMBER2, marginBottom: 10 }}>THE PROCESSING DELAY IS REAL</div>
          <div style={{
            fontFamily: body, fontStyle: "italic", fontSize: 18, lineHeight: 1.8,
            background: `linear-gradient(135deg, ${AMBER}90, ${WHITE}, ${TEAL}90)`,
            WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text",
            marginBottom: 18,
          }}>
            "You are not moving through time.<br/>
            You are processing it. Velocity is choosing<br/>
            to spend that processing on space instead."
          </div>
          <div style={{ fontFamily: mono, fontSize: 10, color: DIM, lineHeight: 2.2 }}>
            (v/c)² + (dt′/dt)² = 1   ·   β² + (1/γ)² = 1   ·   spatial + temporal = c²<br/>
            dt′ = dt √(1 − v²/c²)   ·   dt′ = dt · C_local/C_max   ·   □C = 0
          </div>
          <div style={{ fontFamily: mono, fontSize: 9, color: `${DIM}aa`, marginTop: 14 }}>
            Shia Millet · AetherLife.co · Cosmic Chaos Corporation™ · 2026
          </div>
        </div>
      </div>
    </div>
  );
}
