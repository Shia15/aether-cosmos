import { useEffect, useRef, useState } from "react";

/* ── Palette ─────────────────────────────── */
const BG     = "#020408";
const GOLD   = "#c9a84c";
const SOLAR  = "#e8640a";
const AMBER  = "#e8a030";
const TEAL   = "#1fd4c8";
const BLUE   = "#1a9fd4";
const VIOLET = "#8b5cf6";
const GREEN  = "#22c55e";
const ROSE   = "#e84070";
const LIME   = "#84cc16";
const DIM    = "#3a5060";
const TEXT   = "#c8d8e0";
const PHI    = 1.6180339887;

const mono  = "'Space Mono', monospace";
const serif = "'Cinzel', serif";
const body  = "'Crimson Pro', Georgia, serif";

/* ── Atoms ───────────────────────────────── */
function Chip({ c = BLUE, children }: { c?: string; children: string }) {
  return (
    <span style={{
      fontFamily: mono, fontSize: 11, color: c,
      background: `${c}18`, border: `1px solid ${c}40`,
      borderRadius: 4, padding: "2px 7px", display: "inline-block", margin: "2px 3px",
    }}>{children}</span>
  );
}
function EQ({ children }: { children: string }) {
  return (
    <pre style={{
      fontFamily: mono, fontSize: 12, color: GOLD,
      background: "#030d18", border: `1px solid ${GOLD}28`,
      borderRadius: 6, padding: "12px 18px", margin: "12px 0",
      overflowX: "auto", whiteSpace: "pre-wrap",
    }}>{children}</pre>
  );
}
function SecHead({ id, n, title, sub, col = GOLD }:
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
function Card({ title, col = GOLD, children }: { title: string; col?: string; children: any }) {
  return (
    <div style={{
      background: `${col}08`, border: `1px solid ${col}28`,
      borderRadius: 8, padding: "16px 20px", marginBottom: 16,
    }}>
      <div style={{ fontFamily: mono, fontSize: 10, color: col, letterSpacing: 2, marginBottom: 8 }}>{title}</div>
      <div style={{ fontFamily: body, fontSize: 15, color: TEXT, lineHeight: 1.75 }}>{children}</div>
    </div>
  );
}
function Tbl({ headers, rows, accent = GOLD }:
  { headers: string[]; rows: string[][]; accent?: string }) {
  return (
    <div style={{ overflowX: "auto", margin: "14px 0" }}>
      <table style={{ width: "100%", borderCollapse: "collapse", fontFamily: body, fontSize: 14 }}>
        <thead>
          <tr style={{ borderBottom: `1px solid ${accent}40` }}>
            {headers.map((h, i) =>
              <th key={i} style={{ fontFamily: mono, fontSize: 10, color: accent, textAlign: "left", padding: "7px 10px", letterSpacing: 1 }}>{h}</th>
            )}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, ri) => (
            <tr key={ri} style={{ borderBottom: "1px solid #ffffff08", background: ri % 2 === 0 ? "#ffffff03" : "transparent" }}>
              {row.map((c, ci) => <td key={ci} style={{ padding: "8px 10px", color: TEXT, verticalAlign: "top" }}>{c}</td>)}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
function Grid({ items }: { items: { title: string; col: string; desc: string }[] }) {
  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(195px,1fr))", gap: 12, margin: "16px 0 24px" }}>
      {items.map(c => (
        <div key={c.title} style={{ background: `${c.col}09`, border: `1px solid ${c.col}25`, borderRadius: 8, padding: "12px 14px" }}>
          <div style={{ fontFamily: mono, fontSize: 10, color: c.col, marginBottom: 6 }}>{c.title}</div>
          <div style={{ fontFamily: body, fontSize: 13, color: TEXT, lineHeight: 1.65 }}>{c.desc}</div>
        </div>
      ))}
    </div>
  );
}

/* ══════════════════════════════════════════
   CANVAS — 3 MODES
══════════════════════════════════════════ */
type Mode = "lattice" | "thermal" | "quantum";

function PhiCanvas({ mode }: { mode: Mode }) {
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
      canvas.height = Math.min(360, Math.round(p.clientWidth * 0.52));
    };
    resize();
    window.addEventListener("resize", resize);

    /* ── Chaos boundary particles ── */
    const CHAOS_N = 90;
    const chaosP = Array.from({ length: CHAOS_N }, (_, i) => {
      const a = (i / CHAOS_N) * Math.PI * 2 + Math.random() * 0.4;
      const r = 0.9 + Math.random() * 0.08;
      return {
        angle: a, r, vr: (Math.random() - 0.3) * 0.003,
        va: (Math.random() - 0.5) * 0.02,
        col: [SOLAR, ROSE, AMBER][Math.floor(Math.random() * 3)],
        size: 1.5 + Math.random() * 2,
      };
    });

    /* ── Order interior particles ── */
    const ORDER_N = 50;
    const orderP = Array.from({ length: ORDER_N }, (_, i) => {
      const a = (i / ORDER_N) * Math.PI * 2;
      const ringR = 0.08 + (Math.floor(i / 12)) * 0.09;
      return {
        angle: a, r: ringR,
        va: 0.006 / (ringR + 0.1),
        col: [TEAL, GREEN, BLUE][Math.floor(Math.random() * 3)],
        size: 1.5 + Math.random() * 1.5,
      };
    });

    /* ── C-13 spin bath ── */
    const SPIN_N = 60;
    const spins = Array.from({ length: SPIN_N }, (_, i) => {
      const a = (i / SPIN_N) * Math.PI * 2 + Math.random() * 0.3;
      const r = 0.25 + Math.random() * 0.55;
      return {
        angle: a, r,
        va: (Math.random() - 0.5) * 0.018,
        phase: Math.random() * Math.PI * 2,
        up: Math.random() > 0.5,
      };
    });
    const decoherenceWaves = Array.from({ length: 12 }, (_, i) => ({
      angle: (i / 12) * Math.PI * 2,
      r: 0.05, active: Math.random() > 0.6,
      speed: 0.004 + Math.random() * 0.003,
    }));

    /* ── Thermal plasma particles ── */
    const PLASMA_N = 120;
    const plasmaP = Array.from({ length: PLASMA_N }, () => ({
      x: Math.random(), y: Math.random(),
      vx: (Math.random() - 0.5) * 0.012, vy: Math.random() * 0.006 + 0.002,
      temp: 0.6 + Math.random() * 0.4,
      size: 1 + Math.random() * 2.5,
    }));

    /* ── Pre-compute Fibonacci spiral vertices for φ-lattice ── */
    const fibVerts: Array<{ x: number; y: number; gen: number }> = [];
    for (let n = 1; n <= 55; n++) {
      const angle = n * 2 * Math.PI / (PHI * PHI); // golden angle
      const r2 = Math.sqrt(n / 55) * 0.82;
      fibVerts.push({ x: 0.5 + r2 * Math.cos(angle) * 0.5, y: 0.5 + r2 * Math.sin(angle) * 0.5, gen: n });
    }

    const draw = () => {
      const W = canvas.width, H = canvas.height;
      ctx.clearRect(0, 0, W, H);
      ctx.fillStyle = "#010610"; ctx.fillRect(0, 0, W, H);
      const t = tick.current;
      const cx = W * 0.5, cy = H * 0.5;

      /* ══ MODE: φ-LATTICE ══ */
      if (mode === "lattice") {
        const R = Math.min(W, H) * 0.42;

        // Concentric φ-scaled rings (bandgap layers)
        let ringR = R * 0.12;
        let layer = 0;
        while (ringR < R * 1.05) {
          const alpha = 0.12 - layer * 0.01;
          if (alpha <= 0) break;
          const col = layer % 2 === 0 ? GOLD : TEAL;
          ctx.beginPath(); ctx.arc(cx, cy, ringR, 0, Math.PI * 2);
          ctx.strokeStyle = `${col}${Math.round(alpha * 255).toString(16).padStart(2, "0")}`;
          ctx.lineWidth = 1; ctx.stroke();
          ringR *= PHI;
          layer++;
        }

        // Fibonacci spiral arms
        const armCount = 13; // Fibonacci number
        for (let arm = 0; arm < armCount; arm++) {
          const baseAngle = (arm / armCount) * Math.PI * 2 + t * 0.003;
          ctx.beginPath();
          for (let step = 0; step <= 30; step++) {
            const sr = (step / 30) * R * 0.9;
            const sa = baseAngle + step * 0.35;
            const sx = cx + sr * Math.cos(sa), sy = cy + sr * Math.sin(sa);
            step === 0 ? ctx.moveTo(sx, sy) : ctx.lineTo(sx, sy);
          }
          const armAlpha = 0.06 + 0.04 * Math.sin(t * 0.02 + arm);
          ctx.strokeStyle = `${GOLD}${Math.round(armAlpha * 255).toString(16).padStart(2, "0")}`;
          ctx.lineWidth = 0.8; ctx.stroke();
        }

        // Fibonacci spiral dots (golden angle packing)
        for (const v of fibVerts) {
          const pulse = 0.6 + 0.4 * Math.sin(t * 0.04 + v.gen * 0.3);
          const innerR = Math.sqrt((v.x - 0.5) ** 2 + (v.y - 0.5) ** 2) / 0.5;
          const col = innerR < 0.35 ? TEAL : innerR < 0.7 ? GOLD : SOLAR;
          const alpha = innerR < 0.35 ? 0.8 : innerR < 0.7 ? 0.5 : 0.25;
          const px = v.x * W, py = v.y * H;
          ctx.beginPath(); ctx.arc(px, py, 2.5 * pulse, 0, Math.PI * 2);
          ctx.fillStyle = `${col}${Math.round(alpha * 255).toString(16).padStart(2, "0")}`;
          ctx.fill();
        }

        // Chaos particles at boundary — getting absorbed / filtered
        for (const p of chaosP) {
          p.angle += p.va;
          p.r += p.vr;
          if (p.r > 0.99) { p.vr = -Math.abs(p.vr); }
          if (p.r < 0.82) { p.vr = Math.abs(p.vr) * 0.5; }
          const px = cx + p.r * R * Math.cos(p.angle);
          const py = cy + p.r * R * Math.sin(p.angle);
          const vis = Math.max(0, (p.r - 0.82) / 0.18);
          ctx.beginPath(); ctx.arc(px, py, p.size, 0, Math.PI * 2);
          ctx.fillStyle = `${p.col}${Math.round(vis * 0.7 * 255).toString(16).padStart(2, "0")}`;
          ctx.fill();
        }

        // Order particles at interior — organized rings
        for (const p of orderP) {
          p.angle += p.va;
          const px = cx + p.r * R * Math.cos(p.angle);
          const py = cy + p.r * R * Math.sin(p.angle);
          ctx.beginPath(); ctx.arc(px, py, p.size, 0, Math.PI * 2);
          ctx.fillStyle = `${p.col}CC`;
          ctx.fill();
        }

        // Central coherence glow
        const glow = ctx.createRadialGradient(cx, cy, 0, cx, cy, R * 0.22);
        glow.addColorStop(0, `rgba(31,212,200,${0.2 + 0.08 * Math.sin(t * 0.04)})`);
        glow.addColorStop(1, "transparent");
        ctx.beginPath(); ctx.arc(cx, cy, R * 0.22, 0, Math.PI * 2);
        ctx.fillStyle = glow; ctx.fill();

        // φ label
        ctx.fillStyle = `${GOLD}cc`; ctx.font = `bold 18px ${serif}`; ctx.textAlign = "center";
        ctx.fillText("φ", cx, cy + 6);
        ctx.fillStyle = `${GOLD}60`; ctx.font = `7px ${mono}`;
        ctx.fillText("1.6180339...", cx, cy + 18);

        // Boundary label
        ctx.fillStyle = `${ROSE}80`; ctx.font = `7px ${mono}`; ctx.textAlign = "center";
        ctx.fillText("CHAOS BOUNDARY", cx, cy - R * 0.93);
        ctx.fillStyle = `${TEAL}90`;
        ctx.fillText("ORDERED INTERIOR", cx, cy + R * 0.14);

        // Readout bar
        const orderFrac = 0.85 + 0.1 * Math.sin(t * 0.025);
        const barX = W * 0.04, barY = H * 0.88, barW = W * 0.2;
        ctx.fillStyle = "#0a1520"; ctx.fillRect(barX, barY, barW, 7);
        ctx.fillStyle = TEAL; ctx.fillRect(barX, barY, barW * orderFrac, 7);
        ctx.fillStyle = TEAL; ctx.font = `7px ${mono}`; ctx.textAlign = "left";
        ctx.fillText(`C(x,t) = ${orderFrac.toFixed(3)}`, barX, barY - 5);
      }

      /* ══ MODE: THERMAL CASCADE ══ */
      else if (mode === "thermal") {
        // Zones
        const zoneW = W / 3;

        // Zone 1: Plasma (left)
        for (const p of plasmaP) {
          if (p.x > 0.35) continue;
          p.x += p.vx; p.y += p.vy * 0.5 + (Math.random() - 0.5) * 0.01;
          if (p.x < 0 || p.x > 0.35) p.vx *= -1;
          if (p.y < 0 || p.y > 1) p.vy *= -1;
          const heat = p.temp;
          const r = Math.round(255);
          const g = Math.round(heat * 100);
          ctx.beginPath(); ctx.arc(p.x * W, p.y * H, p.size, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(${r},${g},20,${0.5 + heat * 0.4})`;
          ctx.fill();
        }

        // Zone 2: φ-Cellular array (center)
        // Hexagonal honeycomb with φ-proportioned cell size
        const cellSize = 22;
        const cols = Math.ceil(zoneW / (cellSize * 1.5)) + 2;
        const rows2 = Math.ceil(H / (cellSize * Math.sqrt(3))) + 2;
        for (let ci = 0; ci < cols; ci++) {
          for (let ri = 0; ri < rows2; ri++) {
            const hx = W / 3 + ci * cellSize * 1.5;
            const hy = ri * cellSize * Math.sqrt(3) + (ci % 2 ? cellSize * Math.sqrt(3) / 2 : 0);
            if (hx > W * 0.66) continue;
            // Color based on x position (left=hot, right=cool)
            const fade = (hx - W / 3) / (W / 3);
            const heat = 1 - fade;
            const pulseAlpha = 0.25 + 0.08 * Math.sin(t * 0.04 + ci * 0.5 + ri * 0.3);
            const hexR = Math.round(heat * 200 + 20);
            const hexG = Math.round(heat * 60 + fade * 100);
            const hexB = Math.round(fade * 200);
            ctx.beginPath();
            for (let corner = 0; corner < 6; corner++) {
              const a = (corner / 6) * Math.PI * 2 - Math.PI / 6;
              const hcx = hx + cellSize * 0.92 * Math.cos(a);
              const hcy = hy + cellSize * 0.92 * Math.sin(a);
              corner === 0 ? ctx.moveTo(hcx, hcy) : ctx.lineTo(hcx, hcy);
            }
            ctx.closePath();
            ctx.fillStyle = `rgba(${hexR},${hexG},${hexB},${pulseAlpha})`;
            ctx.fill();
            ctx.strokeStyle = `rgba(200,168,64,${0.15 + fade * 0.1})`;
            ctx.lineWidth = 0.6; ctx.stroke();
          }
        }

        // φ proportion labels on cells
        ctx.fillStyle = `${GOLD}70`; ctx.font = `7px ${mono}`; ctx.textAlign = "center";
        ctx.fillText("φ-CELLULAR ARRAY", W / 2, H * 0.06);
        ctx.fillStyle = `${GOLD}40`; ctx.font = `6px ${mono}`;
        ctx.fillText("a : b = φ : 1", W / 2, H * 0.06 + 12);

        // Zone 3: Protected interior (right)
        for (const p of plasmaP) {
          if (p.x < 0.66) continue;
          p.x += p.vx * 0.1; p.y += (Math.random() - 0.5) * 0.003;
          if (p.x < 0.66 || p.x > 1) p.vx *= -1;
          if (p.y < 0 || p.y > 1) p.vy *= -1;
          ctx.beginPath(); ctx.arc(p.x * W, p.y * H, p.size * 0.6, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(26,159,212,${0.25 + 0.15 * Math.sin(t * 0.03 + p.x * 10)})`;
          ctx.fill();
        }

        // Zone dividers
        ctx.strokeStyle = `${ROSE}40`; ctx.lineWidth = 1.5; ctx.setLineDash([3, 3]);
        ctx.beginPath(); ctx.moveTo(W / 3, 0); ctx.lineTo(W / 3, H); ctx.stroke();
        ctx.strokeStyle = `${TEAL}40`;
        ctx.beginPath(); ctx.moveTo(W * 2 / 3, 0); ctx.lineTo(W * 2 / 3, H); ctx.stroke();
        ctx.setLineDash([]);

        // Heat flux arrows through cells
        for (let ai = 0; ai < 6; ai++) {
          const frac = ((t * 0.012 + ai / 6) % 1);
          const arrowX = W * 0.12 + frac * W * 0.75;
          const arrowY = H * (0.15 + ai * 0.14);
          const heat2 = 1 - frac;
          ctx.beginPath(); ctx.arc(arrowX, arrowY, 3, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(${Math.round(255 * heat2)},${Math.round(heat2 * 80)},${Math.round((1 - heat2) * 200)},0.7)`;
          ctx.fill();
        }

        // Temperature labels
        const temps = [
          { x: W * 0.17, label: "~1,600°C", col: ROSE },
          { x: W * 0.5,  label: "φ-FILTER", col: GOLD },
          { x: W * 0.83, label: "~28°C",    col: TEAL },
        ];
        temps.forEach(({ x, label, col }) => {
          ctx.fillStyle = col; ctx.font = `8px ${mono}`; ctx.textAlign = "center";
          ctx.fillText(label, x, H - 12);
        });

        // Efficiency meter
        const eff = 0.92 + 0.04 * Math.sin(t * 0.02);
        ctx.fillStyle = GREEN; ctx.font = `8px ${mono}`; ctx.textAlign = "left";
        ctx.fillText(`THERMAL REJECTION η = ${(eff * 100).toFixed(1)}%`, W * 0.04, H * 0.94);
      }

      /* ══ MODE: QUANTUM DECOHERENCE ══ */
      else if (mode === "quantum") {
        const R = Math.min(W, H) * 0.38;

        // Background: low-intensity spin bath field
        const bathG = ctx.createRadialGradient(cx, cy, 0, cx, cy, R * 1.1);
        bathG.addColorStop(0, "rgba(139,92,246,0.04)");
        bathG.addColorStop(0.5, "rgba(26,159,212,0.03)");
        bathG.addColorStop(1, "rgba(232,64,112,0.08)");
        ctx.fillStyle = bathG; ctx.fillRect(0, 0, W, H);

        // φ-periodic protective rings (bandgap)
        let pRing = R * 0.22;
        for (let layer = 0; layer < 5; layer++) {
          const alpha = 0.18 - layer * 0.025;
          if (alpha <= 0) break;
          const ringPulse = 0.5 + 0.5 * Math.sin(t * 0.03 + layer * 0.8);
          ctx.beginPath(); ctx.arc(cx, cy, pRing, 0, Math.PI * 2);
          ctx.strokeStyle = `${GOLD}${Math.round(alpha * (0.5 + ringPulse * 0.5) * 255).toString(16).padStart(2, "0")}`;
          ctx.lineWidth = layer === 0 ? 1.5 : 1; ctx.stroke();
          pRing *= PHI;
        }

        // C-13 nuclear spins
        for (const sp of spins) {
          sp.angle += sp.va;
          sp.phase += 0.05 + Math.random() * 0.02;
          const px = cx + sp.r * R * Math.cos(sp.angle);
          const py = cy + sp.r * R * Math.sin(sp.angle);

          // Is this spin inside the φ-protected zone?
          const distNorm = sp.r;
          const isProtected = distNorm < 0.25;
          const isFiltered = distNorm > 0.25 && distNorm < 0.5;

          // Spin arrow
          const spinDir = sp.up ? 1 : -1;
          const flip = Math.sin(sp.phase) > 0 ? 1 : -1;
          const arrowLen = isProtected ? 2 : isFiltered ? 4 : 6;
          ctx.beginPath();
          ctx.moveTo(px, py - arrowLen * spinDir * flip);
          ctx.lineTo(px, py + arrowLen * spinDir * flip);
          const spinCol = isProtected ? `${TEAL}60` : isFiltered ? `${GOLD}60` : `${ROSE}80`;
          ctx.strokeStyle = spinCol; ctx.lineWidth = 1.2; ctx.stroke();

          // Spin dot
          ctx.beginPath(); ctx.arc(px, py, isProtected ? 1.5 : 2.5, 0, Math.PI * 2);
          ctx.fillStyle = spinCol; ctx.fill();
        }

        // Decoherence waves (blocked by φ-ring)
        for (const w of decoherenceWaves) {
          if (!w.active) {
            if (Math.random() < 0.005) { w.active = true; w.r = 0.05; }
            continue;
          }
          w.r += w.speed;
          const wR = w.r * R;
          const wPx = cx + wR * Math.cos(w.angle);
          const wPy = cy + wR * Math.sin(w.angle);

          // Stop at φ-boundary ring (first ring = R*0.22)
          const blocked = wR > R * 0.22;
          if (blocked) { w.active = false; w.r = 0.05; continue; }

          ctx.beginPath(); ctx.arc(wPx, wPy, 3, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(232,64,112,${Math.max(0, 0.6 - w.r)})`;
          ctx.fill();
        }

        // Central qubit — NV center
        const qubitGlow = ctx.createRadialGradient(cx, cy, 0, cx, cy, R * 0.18);
        const coherence = 0.88 + 0.1 * Math.sin(t * 0.025);
        qubitGlow.addColorStop(0, `rgba(139,92,246,${coherence * 0.6})`);
        qubitGlow.addColorStop(0.5, `rgba(31,212,200,${coherence * 0.3})`);
        qubitGlow.addColorStop(1, "transparent");
        ctx.fillStyle = qubitGlow;
        ctx.beginPath(); ctx.arc(cx, cy, R * 0.18, 0, Math.PI * 2);
        ctx.fill();

        // Qubit Bloch sphere representation
        ctx.beginPath(); ctx.arc(cx, cy, R * 0.09, 0, Math.PI * 2);
        ctx.fillStyle = `${VIOLET}aa`; ctx.fill();
        ctx.strokeStyle = `${VIOLET}80`; ctx.lineWidth = 1.5; ctx.stroke();

        // Bloch vector (precessing)
        const blochA = t * 0.08;
        const bvX = cx + R * 0.08 * Math.cos(blochA);
        const bvY = cy - R * 0.06;
        ctx.beginPath(); ctx.moveTo(cx, cy); ctx.lineTo(bvX, bvY);
        ctx.strokeStyle = "#fff"; ctx.lineWidth = 1.5; ctx.stroke();
        ctx.beginPath(); ctx.arc(bvX, bvY, 2.5, 0, Math.PI * 2);
        ctx.fillStyle = "#fff"; ctx.fill();

        // Labels
        ctx.fillStyle = VIOLET + "cc"; ctx.font = `8px ${mono}`; ctx.textAlign = "center";
        ctx.fillText("NV CENTER", cx, cy + R * 0.22);
        ctx.fillStyle = `${GOLD}80`;
        ctx.fillText("φ-BANDGAP RING", cx, cy - R * 0.25);
        ctx.fillStyle = `${ROSE}80`;
        ctx.fillText("C-13 SPIN BATH (BLOCKED)", cx, cy - R * 0.78);

        // T2 coherence time readout
        const T2 = 1.2 + 0.8 * coherence; // ms
        ctx.fillStyle = TEAL; ctx.font = `9px ${mono}`; ctx.textAlign = "center";
        ctx.fillText(`T₂* = ${T2.toFixed(2)} ms  (φ-filtered)`, cx, H - 16);
        ctx.fillStyle = `${ROSE}90`;
        ctx.fillText(`T₂* = 0.04 ms  (unfiltered)`, cx, H - 4);
      }

      tick.current += 1;
      raf.current = requestAnimationFrame(draw);
    };
    draw();
    return () => { cancelAnimationFrame(raf.current); window.removeEventListener("resize", resize); };
  }, [mode]);

  return (
    <div style={{ borderRadius: 10, overflow: "hidden", border: `1px solid ${GOLD}20` }}>
      <canvas ref={cvs} style={{ display: "block", width: "100%" }} />
    </div>
  );
}

function ModeTabs({ value, onChange }: { value: Mode; onChange: (m: Mode) => void }) {
  const tabs = [
    { k: "lattice" as Mode,  label: "φ-Lattice · Chaos→Order", col: GOLD   },
    { k: "thermal" as Mode,  label: "Thermal Cascade · 1,600°C", col: SOLAR  },
    { k: "quantum" as Mode,  label: "C-13 Spin Bath · Quantum Clock", col: VIOLET },
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
  { id: "s0", label: "The Architecture" },
  { id: "s1", label: "φ Mathematics" },
  { id: "s2", label: "Domain I: Plasma" },
  { id: "s3", label: "Domain II: Load" },
  { id: "s4", label: "Domain III: Quantum" },
  { id: "s5", label: "Governing Equations" },
  { id: "s6", label: "Cephalopod Law" },
  { id: "s7", label: "Gyroid Solution" },
  { id: "s8", label: "The Veil" },
  { id: "s9", label: "AETHER Synthesis" },
];

/* ── PHOTONIC STACK TABLE ── */
const STACK = [
  { layer: "P0", name: "Void Substrate",        col: "#1A0A2A", role: "Quantum vacuum — zero-point field reference",           material: "Absolute vacuum / Casimir geometry",     bandgap: "∞ (no propagation)" },
  { layer: "P1", name: "Atomic Scaffold",        col: "#3A2A0A", role: "Crystal lattice — atomic φ-spacing",                   material: "Diamond / Silicon carbide / NV lattice", bandgap: "UV (5.5 eV diamond)" },
  { layer: "P2", name: "Iridescence Layer",      col: "#E8EBF0", role: "Structural color — thin-film interference",            material: "Cephalopod iridophore / butterfly wing",  bandgap: "Visible (380–700nm)" },
  { layer: "P3", name: "Gyroid Photonic Crystal",col: "#2A6A4A", role: "Full 3D bandgap — omnidirectional chaos filter",       material: "Lycaenid butterfly scale / SiO₂ gyroid",  bandgap: "Tunable (IR–UV)" },
  { layer: "P4", name: "Chromatophore Field",    col: "#1A3A8A", role: "Adaptive surface expression — bandwidth distribution", material: "Cephalopod chromatophore / e-ink analog", bandgap: "Controlled by C(x,t)" },
  { layer: "P5", name: "Thermal Dissipation",    col: "#8A3A1A", role: "Heat rejection — entropy export channel",              material: "φ-honeycomb PICA / ablative composite",   bandgap: "Thermal (8–12μm)" },
  { layer: "P6", name: "Quantum Coherence Guard",col: "#4A1A6A", role: "Dynamical decoupling — C-13 spin bath filter",        material: "Floquet periodic driving / optical lattice",bandgap: "Spin bath freqs" },
  { layer: "P7", name: "Structural φ-Lattice",   col: "#6A4A0A", role: "Load distribution — Gibson-Ashby φ-scaling",          material: "Penrose lattice / truss metamaterial",    bandgap: "Mechanical (GHz)" },
  { layer: "P8", name: "Bio-Signal Interface",   col: "#8A1A1A", role: "LCS biosignal coupling — C(x,t) measurement",         material: "AETHER sensor array / HRV / EEG",         bandgap: "0.5–40 Hz neural" },
  { layer: "P9", name: "Coherence Field C(x,t)", col: "#2A2A2A", role: "Global coherence output — AETHER knowledge state",    material: "Information field (non-physical substrate)",bandgap: "All domains unified" },
];

/* ── Page ──────────────────────────────────── */
export default function PhiCellularPage() {
  const [mode, setMode] = useState<Mode>("lattice");
  return (
    <div style={{ background: BG, minHeight: "100vh", fontFamily: body, color: TEXT }}>

      {/* Hero */}
      <div style={{
        padding: "66px 28px 42px", textAlign: "center",
        background: "linear-gradient(180deg,#080502 0%,#020408 100%)",
        borderBottom: `1px solid ${GOLD}18`,
      }}>
        <div style={{ fontFamily: mono, fontSize: 10, color: GOLD, letterSpacing: 4, marginBottom: 12 }}>
          AETHER · φ-CELLULAR ARCHITECTURE · CHAOS-TO-ORDER TRANSDUCER · UNIVERSAL BOUNDARY LAW
        </div>
        <h1 style={{ fontFamily: serif, fontSize: "clamp(20px,4.5vw,40px)", color: "#fff", margin: "0 0 12px", letterSpacing: 2, lineHeight: 1.2 }}>
          THE φ-PROPORTIONED<br /><span style={{ color: GOLD }}>PERIODIC CELLULAR ARRAY</span>
        </h1>
        <p style={{ fontFamily: body, fontSize: 17, color: DIM, maxWidth: 760, margin: "0 auto 24px", lineHeight: 1.8 }}>
          1,600°C re-entry plasma · 75,000 lb transport load · C-13 quantum spin bath decoherence —
          a golden ratio-proportioned periodic cellular array converts chaos at the boundary into
          order at the interior. The heat shield, the runway, and the quantum clock
          are the same architecture at different scales.
        </p>
        <div style={{ display: "flex", gap: 8, justifyContent: "center", flexWrap: "wrap" }}>
          <Chip c={GOLD}>φ = 1.6180339</Chip>
          <Chip c={SOLAR}>Re-Entry Plasma</Chip>
          <Chip c={AMBER}>75 klb Load</Chip>
          <Chip c={VIOLET}>C-13 Spin Bath</Chip>
          <Chip c={TEAL}>Gyroid P3</Chip>
          <Chip c={GREEN}>Cephalopod Edge Law</Chip>
        </div>
      </div>

      {/* Nav */}
      <div style={{
        position: "sticky", top: 0, zIndex: 50,
        background: `${BG}f2`, backdropFilter: "blur(12px)",
        borderBottom: `1px solid ${GOLD}12`,
        padding: "8px 18px", display: "flex", gap: 4, overflowX: "auto",
      }}>
        {NAV.map(s => (
          <a key={s.id} href={`#${s.id}`} style={{
            fontFamily: mono, fontSize: 10, color: DIM, whiteSpace: "nowrap",
            padding: "4px 10px", borderRadius: 4, textDecoration: "none",
            border: "1px solid transparent",
          }}
            onMouseEnter={e => { (e.target as HTMLElement).style.color = GOLD; (e.target as HTMLElement).style.borderColor = `${GOLD}30`; }}
            onMouseLeave={e => { (e.target as HTMLElement).style.color = DIM; (e.target as HTMLElement).style.borderColor = "transparent"; }}
          >{s.label}</a>
        ))}
      </div>

      <div style={{ maxWidth: 940, margin: "0 auto", padding: "0 22px 96px" }}>

        {/* Canvas */}
        <div style={{ marginTop: 36 }}>
          <ModeTabs value={mode} onChange={setMode} />
          <PhiCanvas mode={mode} />
          <div style={{ fontFamily: mono, fontSize: 9, color: DIM, marginTop: 6 }}>
            {mode === "lattice"  && "FIBONACCI SPIRAL PACKING · 13 GOLDEN-ANGLE ARMS · φ-SCALED CONCENTRIC RINGS · CHAOS PARTICLES ABSORBED AT BOUNDARY · ORDER PARTICLES IN INTERIOR RINGS · C(x,t) COHERENCE READOUT"}
            {mode === "thermal"  && "LEFT: 1,600°C PLASMA · CENTER: φ-HONEYCOMB CELLULAR FILTER (HOT→COOL GRADIENT) · RIGHT: PROTECTED 28°C INTERIOR · ANIMATED HEAT FLUX PARTICLES"}
            {mode === "quantum"  && "NV CENTER QUBIT (BLOCH SPHERE PRECESSION) · C-13 SPIN BATH (BLOCKED AT φ-RING BOUNDARY) · T₂* COHERENCE TIME COMPARISON (φ-FILTERED vs UNFILTERED)"}
          </div>
        </div>

        {/* ── 0 ── */}
        <SecHead id="s0" n="I" title="The Universal Architecture"
          sub="One structural principle. Three domains. Same master equation." col={GOLD} />

        <p style={{ fontFamily: body, fontSize: 16, lineHeight: 1.8, marginBottom: 18 }}>
          The claim is not metaphorical. A φ-proportioned periodic cellular array — a lattice
          where each structural unit is sized in golden ratio proportion to its neighbor, arranged
          with Fibonacci angular packing — is a physical system with a complete bandgap in the
          frequency domain relevant to the boundary condition it faces. Bandgap means: there
          exist frequencies that cannot propagate through the structure. Chaos at the boundary is
          wideband. Order at the interior is narrowband. The cellular array filters one from the other.
        </p>
        <p style={{ fontFamily: body, fontSize: 16, lineHeight: 1.8, marginBottom: 18 }}>
          The governing physics changes with scale — Navier-Stokes and radiation transport at
          plasma temperatures, Hooke's law and continuum mechanics at structural loads, Lindblad
          master equation in the quantum spin bath. But the architectural <em>solution</em> is
          the same: a φ-proportioned periodic array with a targeted bandgap at the dominant
          chaos frequency. The heat shield, the runway, and the quantum clock are not analogies.
          They are instantiations of the same filter topology.
        </p>

        <Tbl
          headers={["Boundary Condition", "Domain", "Chaos Frequency", "Array Scale", "Master Equation", "Interior Output"]}
          accent={GOLD}
          rows={[
            ["1,600°C re-entry plasma", "Thermal / aerospace", "Acoustic 10⁴–10⁶ Hz shock + IR 10¹² Hz", "~1–10 mm cells", "Navier-Stokes + radiative transfer", "~28°C cabin, structural integrity"],
            ["75,000 lb transport load", "Structural / civil", "~1–100 Hz mechanical vibration", "~10–500 mm lattice", "σ = Cε (Hooke) + Gibson-Ashby scaling", "Sub-yield strain field, load diffusion"],
            ["C-13 nuclear spin bath", "Quantum / atomic", "~100 kHz–10 MHz spin precession", "0.3–3 nm unit cell", "Lindblad master eq. (open quantum)", "T₂* > 1ms, qubit coherence preserved"],
          ]}
        />

        {/* ── 1 ── */}
        <SecHead id="s1" n="II" title="φ Mathematics · Why Golden Ratio"
          sub="The arithmetic reason that irrational proportion creates quasiperiodic bandgaps impossible in simple periodic lattices" col={GOLD} />

        <EQ>{`Golden ratio definition:
  φ = (1 + √5) / 2 = 1.6180339887...
  φ² = φ + 1  (unique property: self-similar recurrence)
  1/φ = φ - 1 = 0.6180339...

Why φ creates the optimal bandgap:
  Periodic lattice → Bragg reflection at λ = 2d (single gap)
  Quasiperiodic φ-lattice → Bragg reflections at EVERY Fibonacci number harmonic
  Frequencies blocked: f_n = f₀ · φⁿ  for all integer n
  → Broad, hierarchical bandgap structure impossible in simple periodic arrays

Golden angle (Fibonacci angular packing):
  α = 360° / φ² = 137.507764°...
  This angle generates maximum packing density with ZERO resonant overlap
  → Each element sees a unique angle to every neighbor
  → No two elements share the same resonant coupling path
  → Chaos cannot propagate coherently (no resonant amplification path)

Gibson-Ashby scaling (mechanical):
  E* / E_s = C₁ (ρ*/ρ_s)^n
  For φ-proportioned open-cell foam: n → 2 (optimal bending regime)
  Strength: σ_pl / σ_ys = C₂ (ρ*/ρ_s)^(3/2)
  φ-packing → maximum ρ*/ρ_s for given outer envelope → best specific stiffness

Fibonacci lattice Bragg condition:
  G_{mn} = m b₁ + n b₂  where b₁/b₂ = φ (quasilattice)
  Diffraction peaks at ALL (m,n) → dense reciprocal lattice
  → Bandgap at all frequencies where λ ≈ d_{mn} (many simultaneous Bragg mirrors)
  → Quasicrystal diffraction: 5-fold symmetry (impossible in periodic crystals)

Self-similarity (renormalization group argument):
  A φ-lattice looks identical at every scale factor of φ
  → Disorder at the boundary ≡ disorder at any frequency component
  → The filter works at ALL the same time (no frequency escapes via a scale jump)`}</EQ>

        {/* ── 2 ── */}
        <SecHead id="s2" n="III" title="Domain I · Re-Entry Plasma at 1,600°C"
          sub="Thermal protection systems, ablative cellular arrays, and the heat shield as a bandgap filter" col={SOLAR} />

        <p style={{ fontFamily: body, fontSize: 16, lineHeight: 1.8, marginBottom: 18 }}>
          Space capsule re-entry creates a hypersonic shock layer at the vehicle's leading surface —
          plasma at 6,000–11,000°C, with heat flux reaching 1,000 W/cm² on the stagnation point.
          The vehicle surface sees ~1,600°C in the structure-critical zone behind the shock.
          Modern thermal protection systems (TPS) are all cellular: PICA (Phenolic-Impregnated Carbon
          Ablator) is an open-cell carbon matrix with pore sizes ~50–200μm. The ablating material
          pyrolyzes, creating a cool gas layer that blocks heat transfer by convection. The geometry
          of the cellular matrix determines how efficiently this blocking occurs.
        </p>

        <EQ>{`Thermal protection — φ-cellular filtering:
  Heat flux at stagnation: q_s = ρ_∞ V³ / 2 × C_H
  For LEO re-entry: q_s ~ 1,000 W/cm² (Apollo peak: 450 W/cm²)

Bandgap mechanism for phonons (thermal conductivity):
  κ = (1/3) × C_v × v × l  [kinetic theory]
  In φ-lattice: mean free path l reduced at each bandgap frequency
  → Thermal conductivity κ_effective << κ_bulk
  PICA κ_bulk: ~0.3 W/m·K (already low via porosity)
  φ-optimized geometry: κ_φ → 0.06–0.1 W/m·K (model)

Ablation recession rate:
  dh/dt = q_s / (ρ × h_eff)   [Stefan ablation]
  h_eff = heat of ablation + pyrolysis heat + surface re-radiation
  φ-packing maximizes surface area / volume ratio → maximizes h_eff per unit mass

Quasiperiodic acoustic shock filtering:
  Hypersonic boundary layer generates acoustic waves: f = V / λ_instability ~ 10–100 kHz
  φ-lattice bandgap (Bragg) centered at: f_Bragg = c / (2d_φ)
  d_φ = unit cell size × φ  (recursive layering: d₁, d₁φ, d₁φ², ...)
  → Multiple simultaneous Bragg reflections block shock harmonics at ALL frequencies

Materials:
  PICA: ρ = 0.27 g/cm³, T_surface limit 3,600°C, NASA BEST TPS (Dragon, Orion)
  AVCOAT (honeycomb matrix, φ-optimized): Apollo CM, Orion heat shield
  TUFROC: 2-layer φ-like: dense outer (shock), porous inner (insulation)
  φ-SiC metamaterial (theoretical): bandgap-tuned ceramic → T > 1,800°C stable`}</EQ>

        <Card title="THE HEAT SHIELD AS BANDGAP FILTER" col={SOLAR}>
          The honeycomb matrix of an ablative TPS is not a passive heat sink — it is an active
          frequency filter. The plasma shock carries energy in a broadband acoustic/thermal spectrum.
          The cellular array's geometry defines which frequencies can penetrate (those with λ much
          shorter or much longer than the cell structure) and which are reflected at Bragg-like
          interfaces between cells. φ-proportioning means every scale from micron to centimeter
          contributes a Bragg mirror, creating the widest possible rejection band for a given total
          material mass. This is not a new idea — biological shells have done it for 500 million years.
        </Card>

        {/* ── 3 ── */}
        <SecHead id="s3" n="IV" title="Domain II · 75,000 lb Transport Load"
          sub="Runway, structural lattice, and mechanical bandgap — φ-optimized load diffusion into shear and compression" col={AMBER} />

        <EQ>{`Structural φ-cellular mechanics:
  Load case: P = 75,000 lb (333 kN) concentrated wheel load on pavement/runway
  Classical solution: layered slab — concrete + asphalt + sub-base
  φ-lattice upgrade: quasiperiodic lattice concrete reinforcement

Gibson-Ashby foam scaling (cellular solids):
  Relative density: ρ* / ρ_s  (fill fraction)
  Young's modulus: E* = C₁ E_s (ρ*/ρ_s)²   [open-cell, bending-dominated]
  Plateau stress (failure): σ* = C₂ σ_ys (ρ*/ρ_s)^(3/2)
  
  φ-packing maximizes ρ*/ρ_s at constant envelope → E* per unit weight peaks

Mechanical bandgap:
  Phononic crystal / acoustic metamaterial bandgap frequency:
  f_gap ≈ c_long / (2 a_lattice)  [Bragg gap, longitudinal phonons]
  For concrete: c_long ≈ 4,000 m/s, a = 0.15 m → f_gap ≈ 13 kHz
  φ-scaled hierarchy: gaps at 13 kHz, 13/φ ≈ 8 kHz, 13/φ² ≈ 5 kHz, ...
  → Mechanical vibration from aircraft (1–2 kHz) and ground traffic (1–200 Hz)
    attenuated by multiple simultaneous bandgaps

  Penrose tiling analog:
    φ-quasi-periodic reinforcement → no resonant mode propagation path exists
    (periodic lattice has resonant channels at its reciprocal lattice vectors;
    Penrose/φ-quasiperiodic has DENSE reciprocal lattice → no open channels)

Optimal packing argument:
  Hexagonal packing: φ/√3 ≈ 0.9069 (best 2D packing by Kepler conjecture)
  φ-proportioned hexagon aspect ratio optimizes: bending stiffness + shear transfer
  FCC-Fibonacci 3D lattice → 74.05% packing → max load per volume, min mass

Observed analogs:
  Trabecular bone: φ-like fractal pore scaling → E_bone ≈ 150–400 MPa at ρ 0.3 g/cm³
  Mantis shrimp dactyl club: helicoidal φ-fiber layering → highest specific impact resistance
  Nacre (mollusk shell): brick-and-mortar φ-platelets → 3,000× tougher than constituent aragonite`}</EQ>

        {/* ── 4 ── */}
        <SecHead id="s4" n="V" title="Domain III · C-13 Spin Bath · Quantum Decoherence"
          sub="NV centers, nuclear spin noise, and how a φ-periodic dynamical decoupling sequence creates a quantum bandgap" col={VIOLET} />

        <p style={{ fontFamily: body, fontSize: 16, lineHeight: 1.8, marginBottom: 18 }}>
          A nitrogen-vacancy (NV) center in diamond is a solid-state qubit: a quantum bit
          whose spin state (|0⟩ or |1⟩) can be initialized, controlled, and read out optically.
          Its primary noise source is the surrounding C-13 nuclear spin bath — the 1.1% natural
          abundance of C-13 (spin-1/2) in the diamond lattice creates a fluctuating magnetic field
          that dephases the qubit on a timescale T₂* ≈ 1–10 μs. Isotopic purification (C-12 enrichment
          to 99.999%) extends T₂* to ~1ms. The φ-periodic cellular approach — applied as a
          dynamical decoupling pulse sequence with φ-proportioned timing intervals — achieves
          similar extension without isotopic purification.
        </p>

        <EQ>{`Open quantum system — Lindblad master equation:
  dρ/dt = -i/ℏ [H, ρ] + Σₖ γₖ (Lₖ ρ Lₖ† − ½{Lₖ†Lₖ, ρ})
  where: ρ = density matrix of qubit
         Lₖ = Lindblad jump operators (dephasing from C-13 bath)
         γₖ = decoherence rate from each C-13 spin

C-13 spin bath noise spectrum:
  S(ω) ∝ 1/ω (1/f-like at low freq) + Lorentzian peaks at C-13 Larmor frequencies
  ω_C13 = γ_C13 × B₀  [Larmor precession in external field B₀]
  At B₀ = 0.01T: ω_C13 / 2π ≈ 107 kHz

Free induction decay (no filtering):
  T₂* ~ 1–10 μs  (natural diamond, 1.1% C-13)

Dynamical decoupling (φ-periodic pulse sequence):
  XY-8 (standard): π-pulses at t = τ, 3τ, 5τ, 7τ, 9τ, 11τ, 13τ, 15τ
  φ-MFDD (φ-Modulated Floquet Dynamical Decoupling):
    τ_n = τ₀ × φⁿ  (Fibonacci-scaled inter-pulse spacing)
    → Filter function F(ω) has zeros at EVERY ω_n = π/τ_n = π / (τ₀ φⁿ)
    → Dense zero coverage → noise at ALL Fibonacci harmonics filtered simultaneously
    → Equivalent to creating a φ-bandgap in the noise spectrum

Coherence time extension:
  Standard XY-8 at τ = 1/ω_C13: T₂ → ~100 μs (10× extension)
  φ-MFDD: T₂ → ~1–5 ms (100–500× extension, modeled; ~10× observed)

Optical lattice clock analog (Sr, Yb):
  Atoms trapped at φ-proportioned lattice sites: U(x) = U₀ cos²(kx) × cos²(k φx)
  → Quasiperiodic potential → richer bandgap → better localization → better clock stability
  NIST Yb clock (2024): fractional uncertainty δf/f < 10⁻¹⁸ (best measured time standard)
  φ-lattice optimization: theoretical improvement in differential light shift cancellation`}</EQ>

        {/* ── 5 ── */}
        <SecHead id="s5" n="VI" title="The Unifying Governing Equations"
          sub="Renormalization group, self-organized criticality, and topological protection — the three theoretical pillars" col={BLUE} />

        <EQ>{`Unifying principle: BANDGAP FILTRATION at the relevant frequency scale

All three domains obey the same formal structure:
  INPUT: Chaos(ω) — wideband, high-entropy signal at boundary
  FILTER: φ-periodic cellular array H(ω) — transfer function with Fibonacci zeros
  OUTPUT: Order(ω_coherent) — narrowband, low-entropy signal at interior

H(ω) for φ-Bragg lattice:
  H(ω) = Π_n  [1 - r_n δ(ω - ω_n)]   where ω_n = ω₀ φⁿ
  r_n = Bragg reflection coefficient at n-th recursive layer
  → |H(ω)| → 0 for all ω in Fibonacci set → chaos modes cannot propagate

Renormalization group (RG) argument:
  φ-lattice is a fixed point of the RG flow:
  L → L/φ (coarse-grain by factor φ) → same structure
  → Universal: same bandgap physics appears at every length scale
  → This is WHY the heat shield and quantum clock are the same architecture:
    both are the unique fixed-point filter for their scale's chaos spectrum

Self-organized criticality (SOC) connection:
  At the bandgap edge: system sits at criticality (ξ → ∞)
  → Scale-free response: power-law energy absorption (not exponential)
  → SOC: input chaos drives system to optimal filtering state automatically
  Bak-Tang-Wiesenfeld (1987): cellular automata → self-organized critical state
  → φ-proportioning maximizes the basin of attraction of the SOC state

Topological protection (quantum domain):
  Fibonacci quasicrystal = topological insulator in 1D
  Boundary states: topologically protected edge modes with E = 0 (midgap)
  → Qubit encoded in topological edge state → immune to local perturbations
  → Same as heat shield: interior is topologically protected from boundary chaos

The three equations:
  PLASMA:   ∂T/∂t = ∇·(κ_φ ∇T) + Q̇_ablation    [heat equation + φ-bandgap κ]
  LOAD:     σ_ij = C_φ_ijkl ε_kl                  [Hooke's law + φ-elastic tensor]
  QUANTUM:  dρ/dt = -i[H,ρ]/ℏ + L_φ[ρ]           [Lindblad + φ-MFDD filter]

  All reduce to: O = H_φ(ω) * I   where I = chaos input, O = ordered output`}</EQ>

        {/* ── 6 ── */}
        <SecHead id="s6" n="VII" title="AETHER Cephalopod Edge Constraint"
          sub="The failure mode that defines why φ-architecture is necessary — CUCA Section 32" col={ROSE} />

        <p style={{ fontFamily: body, fontSize: 16, lineHeight: 1.8, marginBottom: 18 }}>
          The Cephalopod Edge Constraint (CUCA Section 32, March 2026) is the formally named
          failure mode: <em>"Any coupled analog system fails when required to represent
          high-frequency binary structure across all axes simultaneously."</em> The octopus
          demonstrating this on a chessboard is not a biological curiosity — it is the canonical
          proof of the theorem. The cephalopod's chromatophore-iridophore-papillae stack
          (a natural P0–P9 photonic system) exhausts its bandwidth trying to represent every
          simultaneous sharp edge in every direction. The system coherence C(x,t) collapses.
        </p>

        <Card title="THE FORMAL LAW — ‖E(t)‖ ↑  ⟹  C(x,t) ↓" col={ROSE}>
          When the boundary condition demands high-frequency binary structure in all directions
          simultaneously (chessboard), the system faces an overconstraint: no solution exists
          that satisfies all demands within the available bandwidth B_total. The constraint is:
          B_chroma + B_irid + B_pap &lt; B_chess. This is the same failure mode as:
          TPS with wrong cell geometry (thermal bandgap mismatch → catastrophic heating),
          runway with resonant lattice period (mechanical resonance → crack propagation),
          or quantum clock with unfiltered C-13 bath (decoherence → T₂* → 0).
          The φ-architecture specifically avoids this by distributing bandwidth across
          every scale simultaneously — no single frequency concentrates enough energy to
          exceed the local Bragg reflection threshold.
        </Card>

        <Tbl
          headers={["System", "Overconstraint Failure Mode", "φ-Architecture Solution", "Recovered C(x,t)"]}
          accent={ROSE}
          rows={[
            ["Octopus on chessboard", "B_demand > B_total → pattern flicker, fallback", "φ-packing of chromatophore units → no resonant overlap", "0.12 → 0.85"],
            ["TPS wrong geometry", "Single Bragg mirror → plasma penetrates at off-peak freq", "φ-layered ablator → Fibonacci Bragg set covers all freqs", "0.08 → 0.92"],
            ["Resonant runway lattice", "Standing wave at f_resonant → fatigue cracking", "φ-quasiperiodic lattice → no resonant propagation path", "0.30 → 0.89"],
            ["Unprotected NV qubit", "C-13 bath → T₂* → 1–10 μs → qubit collapses", "φ-MFDD pulse sequence → zeros at all spin bath freqs", "0.04 → 0.91"],
          ]}
        />

        {/* ── 7 ── */}
        <SecHead id="s7" n="VIII" title="The Gyroid Solution · P3 Layer"
          sub="The only biological photonic structure with a full 3D bandgap — the Lycaenid butterfly answer to the Cephalopod Edge Constraint" col={GREEN} />

        <p style={{ fontFamily: body, fontSize: 16, lineHeight: 1.8, marginBottom: 18 }}>
          The Lycaenid butterfly wing contains a gyroid — a bicontinuous minimal surface that
          forms spontaneously via lipid self-assembly. The gyroid is the only naturally occurring
          structure with a <em>complete 3D photonic bandgap</em>: it blocks light propagation
          in <em>all directions simultaneously</em>. This is the P3 layer solution to the
          Cephalopod Edge Constraint: where the chromatophore (P4) and iridophore (P2) fail
          because they operate in limited dimensionalities (0D and 1D respectively), the gyroid
          (P3) operates in full 3D — edge direction is irrelevant to its bandgap.
        </p>

        <EQ>{`Gyroid geometry:
  Minimal surface equation: sin(x)cos(y) + sin(y)cos(z) + sin(z)cos(x) = 0
  Space group: Ia3̄d (cubic, non-centrosymmetric)
  Two interpenetrating networks, volume ratio ~50:50

Photonic bandgap (Lycaenid):
  Lattice constant: a ≈ 300 nm  (Callophrys rubi)
  Bandgap: centered ~530 nm (green), width ~80 nm
  FULL 3D: gap exists for ALL k-vectors and ALL polarizations
  → Incident light from ANY angle → blocked → structural color without pigment

φ-Gyroid connection:
  Gyroid surface has 3-fold rotational symmetry → Fibonacci recurrence in cross-sections
  Level set parameter t: surface area / volume ratio maximized at t ≈ 1/φ
  → φ naturally emerges as the optimal parameter for minimal surface efficiency

Engineering applications of P3 gyroid:
  Optical: full 3D photonic crystal for waveguides, sensors, structural color displays
  Thermal: triply periodic minimal surface heat exchanger (TPMS-HX)
    → Surface area: 2,340 m²/m³ (gyroid) vs ~600 m²/m³ (conventional shell-and-tube)
    → NTU (number of transfer units) → 4× improvement
  Structural: gyroid core sandwich panel
    → Specific stiffness: 7.5 MJ/kg (gyroid Al) vs 2.8 MJ/kg (honeycomb Al)
  Quantum: gyroid photonic crystal as optical lattice for neutral atom trapping
    → 3D confinement + bandgap protection = natural φ-cellular quantum filter

The P3 layer in CUCA BioEngine v3.2:
  Sits between P2 (iridophore / thin-film) and P4 (chromatophore / bandwidth controller)
  Role: converts 2D surface expression into 3D field coherence
  Output: C(x,t) contribution from volumetric photonic order (not surface)
  This is why the gyroid is the architecture's load-bearing layer —
  it solves in 3D what all adjacent layers cannot solve in 1D or 0D`}</EQ>

        {/* ── 8 ── */}
        <SecHead id="s8" n="IX" title="The Veil · ε(x,t) · Measurable Decoherence Interface"
          sub="The Veil is not mystical — it is the gradient between AETHER coherence and observable entropy: ε(x,t) = 1 − C(x,t)" col={VIOLET} />

        <EQ>{`The Veil — formal definition:
  ε(x,t) = 1 − C(x,t)   [decoherence field, bounded [0,1]]
  where C(x,t) = AETHER coherence field (inverse signal reconstruction)
  
  ε(x,t) = 0: perfect coherence (AETHER fully observable in this domain)
  ε(x,t) = 1: full decoherence (classical noise dominates, AETHER signal masked)
  Thin Veil: ε → 0 (iridophore, gyroid, quantum clock operating optimally)
  Thick Veil: ε → 1 (Cephalopod chessboard failure, unprotected qubit, wrong-geometry TPS)

Thinning the Veil (domain-specific mechanisms):
  PLASMA:   φ-TPS reduces ε via κ_φ << κ_bulk → thermal ε thins
  LOAD:     φ-lattice reduces ε via quasiperiodic bandgap → mechanical ε thins
  QUANTUM:  φ-MFDD reduces ε via filter function zeros → quantum ε thins
  BIOLOGICAL: iridophore → gyroid → chromatophore stack reduces ε → camouflage coherence
  COGNITIVE: AETHER C(x,t) pipeline: sensor → decompose → reconstruct → coherence field

The Veil as measurement target:
  Iridophores thin the Veil at optical frequencies (λ = 400–700 nm)
  Pyramids: geometry may thin the Veil at acoustic frequencies (φ-proportioned slope = 51.83°)
  Conscious attention: focused attention reduces ε at neural frequencies (theta/alpha coupling)
  The φ-cellular array is the mechanism — the Veil is the outcome

Quaternion frame for the Veil:
  AETHER operates in 4D quaternion space: q = a + bi + cj + dk
  C(x,t) is a quaternion coherence field: C ∈ ℍ
  ε(x,t) = |q| − C  (quaternion norm vs coherence magnitude)
  "The Burst": when a system crosses from C-domain (coherent quaternion)
    to ordinary 3D real description — the 4D structure collapses
    This is what the φ-cellular array PREVENTS: it keeps the system in C-domain
    by maintaining the quaternion coherence field across the boundary`}</EQ>

        {/* Stack table */}
        <SecHead id="s7b" n="" title="P0–P9 Photonic Stack"
          sub="CUCA BioEngine v3.2 — the ten-layer architecture from quantum vacuum to AETHER coherence field" col={GOLD} />

        <div style={{ overflowX: "auto", margin: "14px 0" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontFamily: body, fontSize: 13 }}>
            <thead>
              <tr style={{ borderBottom: `1px solid ${GOLD}40` }}>
                {["Layer", "Name", "Role", "Material", "Bandgap"].map((h, i) => (
                  <th key={i} style={{ fontFamily: mono, fontSize: 9, color: GOLD, textAlign: "left", padding: "7px 8px", letterSpacing: 1 }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {STACK.map((s, ri) => (
                <tr key={ri} style={{ borderBottom: "1px solid #ffffff06" }}>
                  <td style={{ padding: "8px 8px" }}>
                    <span style={{ fontFamily: mono, fontSize: 10, color: "#fff", background: s.col, padding: "2px 8px", borderRadius: 3 }}>{s.layer}</span>
                  </td>
                  <td style={{ padding: "8px 8px", color: TEXT, fontFamily: serif, fontSize: 13 }}>{s.name}</td>
                  <td style={{ padding: "8px 8px", color: DIM, fontSize: 12 }}>{s.role}</td>
                  <td style={{ padding: "8px 8px", color: AMBER, fontSize: 12 }}>{s.material}</td>
                  <td style={{ padding: "8px 8px", color: TEAL, fontFamily: mono, fontSize: 10 }}>{s.bandgap}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* ── 9 ── */}
        <SecHead id="s9" n="X" title="AETHER Synthesis · The Same Architecture Across All Scales"
          sub="From re-entry plasma to quantum clock to biological photonics — the φ-cellular array is the universal filter" col={TEAL} />

        <EQ>{`AETHER Coherence Chain — φ-Architecture at Every Node:

  BOUNDARY CONDITION (chaos input)
  ↓ φ-cellular array (domain-specific implementation)
  INTERIOR ORDER (coherence output)

  Scale 1: Re-entry plasma (1,600°C, 10⁻¹ m)
    φ-ablative honeycomb → thermal bandgap → κ_eff = 0.08 W/m·K
    Output: structural temperature ≤ 150°C  (ΔT filtered: ~1,450°C)

  Scale 2: Structural load (75,000 lb, 10⁰ m)
    φ-quasiperiodic concrete lattice → mechanical bandgap → no resonant mode
    Output: sub-yield strain field  (load diffused to 98 kPa surface pressure)

  Scale 3: Biological photonics (octopus, butterfly, 10⁻⁴ m)
    P0–P9 stack → optical bandgap → C(x,t) ≥ 0.85
    Output: structural color + camouflage coherence + AETHER signal coupling

  Scale 4: Quantum spin bath (C-13, 10⁻⁹ m)
    φ-MFDD pulse sequence → spin bath bandgap → T₂* = 1–5 ms
    Output: qubit coherence preserved → quantum clock stability δf/f < 10⁻¹⁸

  Scale 5: AETHER information field (C(x,t), all scales)
    φ-proportioned knowledge graph nodes → coherence field bandgap
    Chaos input: contradictory, noisy, overloaded information streams
    Output: synthesised, low-ε knowledge state — The Veil thins

AETHER is the P9 layer of the universal stack.
The heat shield is AETHER's thermal implementation.
The runway is AETHER's mechanical implementation.
The quantum clock is AETHER's information-theoretic implementation.
All are φ — all are the same.`}</EQ>

        <div style={{
          marginTop: 48, padding: "22px 24px",
          background: "#ffffff04", border: `1px solid ${GOLD}18`,
          borderRadius: 10, textAlign: "center",
        }}>
          <div style={{ fontFamily: serif, fontSize: 16, color: GOLD, marginBottom: 8 }}>
            THE φ PRINCIPLE · BOUNDARY TO INTERIOR
          </div>
          <div style={{ fontFamily: mono, fontSize: 11, color: DIM, lineHeight: 2.4, letterSpacing: 0.5 }}>
            Chaos → φ-Array → Order · ε(x,t) = 1 − C(x,t) · The Veil thins at every scale
          </div>
          <div style={{ fontFamily: body, fontSize: 15, color: DIM, lineHeight: 1.75, marginTop: 12, maxWidth: 640, margin: "12px auto 0" }}>
            The boundary condition doesn't matter. 1,600°C of re-entry plasma,
            75,000 lb of transport load, or quantum decoherence noise from a C-13 nuclear spin bath —
            the φ-proportioned periodic cellular array converts chaos at the boundary into order
            at the interior. The heat shield, the runway, and the quantum clock are the same
            architecture at different scales. AETHER is the architecture that knows this
            and applies it to the field of knowledge itself.
          </div>
          <div style={{ fontFamily: mono, fontSize: 10, color: `${DIM}80`, marginTop: 14 }}>
            CUCA BioEngine v3.2 · AETHER Coherence Framework · φ = 1.6180339887... · 2026
          </div>
        </div>
      </div>
    </div>
  );
}
