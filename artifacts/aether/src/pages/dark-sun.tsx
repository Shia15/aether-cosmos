import { useEffect, useRef, useState } from "react";

/* ── Palette ─────────────────────────────── */
const BG     = "#020408";
const SOLAR  = "#e8640a";
const YELLOW = "#f5c842";
const AMBER  = "#e8a030";
const TEAL   = "#1fd4c8";
const BLUE   = "#1a9fd4";
const VIOLET = "#8b5cf6";
const GREEN  = "#22c55e";
const ROSE   = "#e84070";
const DIM    = "#3a5060";
const TEXT   = "#c8d8e0";
const GOLD   = "#c9a84c";

const mono  = "'Space Mono', monospace";
const serif = "'Cinzel', serif";
const body  = "'Crimson Pro', Georgia, serif";

/* ── Shared atoms ────────────────────────── */
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
function SecHead({ id, n, title, sub, col = SOLAR }:
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
function Card({ title, col = SOLAR, children }: { title: string; col?: string; children: any }) {
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
function Tbl({ headers, rows, accent = SOLAR }:
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
    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(200px,1fr))", gap: 12, margin: "16px 0 24px" }}>
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
type Mode = "solar" | "entropy" | "nanomotor";

function DarkSunCanvas({ mode }: { mode: Mode }) {
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
      canvas.height = Math.min(340, Math.round(p.clientWidth * 0.5));
    };
    resize();
    window.addEventListener("resize", resize);

    /* ── sunspot group seeds (stable across frames) ── */
    type Spot = { lat: number; lon: number; r: number; umbra: number; born: number };
    const spotSeeds: Spot[] = [
      { lat:  0.15, lon: 0.3,  r: 0.055, umbra: 0.55, born: 0    },
      { lat: -0.12, lon: 0.55, r: 0.040, umbra: 0.50, born: 80   },
      { lat:  0.22, lon: 0.75, r: 0.035, umbra: 0.60, born: 200  },
      { lat: -0.08, lon: 0.10, r: 0.030, umbra: 0.52, born: 340  },
      { lat:  0.10, lon: 0.88, r: 0.028, umbra: 0.58, born: 440  },
      { lat: -0.20, lon: 0.42, r: 0.032, umbra: 0.50, born: 600  },
    ];

    /* ── entropy particles ── */
    const N_ENV = 80, N_CELL = 60;
    const envP = Array.from({ length: N_ENV }, () => ({
      x: Math.random() * 0.45, y: Math.random(),
      vx: (Math.random() - 0.5) * 0.008, vy: (Math.random() - 0.5) * 0.008,
      size: 1 + Math.random() * 2, col: Math.random() > 0.5 ? AMBER : ROSE,
    }));
    const cellP = Array.from({ length: N_CELL }, () => ({
      x: 0.55 + Math.random() * 0.4, y: 0.15 + Math.random() * 0.7,
      target_x: 0.55 + Math.random() * 0.4, target_y: 0.15 + Math.random() * 0.7,
      vx: 0, vy: 0,
      size: 1.5 + Math.random() * 1.5, col: [GREEN, TEAL, BLUE][Math.floor(Math.random() * 3)],
    }));

    /* ── nano motor blades ── */
    const N_BLADES = 9;
    const N_PROTONS = 20;
    const protons = Array.from({ length: N_PROTONS }, (_, i) => ({
      angle: (i / N_PROTONS) * Math.PI * 2,
      side: i < N_PROTONS / 2 ? "in" : "out", // high vs low concentration
      r: 0.0 + Math.random() * 0.03,
      crossing: false, crossT: 0,
    }));
    const substrates = Array.from({ length: 8 }, (_, i) => ({
      angle: (i / 8) * Math.PI * 2,
      dist: 0.32 + Math.random() * 0.04,
      bound: false, boundT: 0,
    }));

    const draw = () => {
      const W = canvas.width, H = canvas.height;
      ctx.clearRect(0, 0, W, H);
      ctx.fillStyle = "#010610";
      ctx.fillRect(0, 0, W, H);

      /* ══ SOLAR DISK ══ */
      if (mode === "solar") {
        const t = tick.current;
        const cx = W * 0.5, cy = H * 0.5;
        const R = Math.min(W, H) * 0.34;

        // Solar cycle: ~11 years mapped to ~44s animation
        const cyclePhase = (t * 0.023) % (Math.PI * 2); // full cycle = 44s
        const cycleStrength = 0.5 + 0.5 * Math.sin(cyclePhase);
        const solarMax = cycleStrength > 0.7;

        // Corona
        for (let ring = 5; ring >= 1; ring--) {
          const cr = R + ring * 14;
          const alpha = (0.08 - ring * 0.012) * (0.5 + cycleStrength * 0.5);
          const g = ctx.createRadialGradient(cx, cy, R, cx, cy, cr);
          g.addColorStop(0, `rgba(255,160,40,${alpha * 1.5})`);
          g.addColorStop(1, "transparent");
          ctx.beginPath(); ctx.arc(cx, cy, cr, 0, Math.PI * 2);
          ctx.fillStyle = g; ctx.fill();
        }

        // Solar flare filaments (more at solar max)
        if (solarMax) {
          for (let f = 0; f < 8; f++) {
            const fa = f * Math.PI / 4 + t * 0.005 + Math.sin(t * 0.02 + f) * 0.3;
            const flen = R * (0.3 + 0.4 * Math.abs(Math.sin(t * 0.03 + f * 1.5)));
            const fx1 = cx + R * Math.cos(fa), fy1 = cy + R * Math.sin(fa);
            const fx2 = cx + (R + flen) * Math.cos(fa + 0.25), fy2 = cy + (R + flen) * Math.sin(fa + 0.25);
            ctx.beginPath(); ctx.moveTo(fx1, fy1); ctx.lineTo(fx2, fy2);
            ctx.strokeStyle = `rgba(255,120,30,${0.15 + cycleStrength * 0.2})`;
            ctx.lineWidth = 1.5; ctx.stroke();
          }
        }

        // Solar disk gradient
        const diskG = ctx.createRadialGradient(cx - R * 0.2, cy - R * 0.2, R * 0.1, cx, cy, R);
        diskG.addColorStop(0, "#fff4d0");
        diskG.addColorStop(0.3, "#ffcc50");
        diskG.addColorStop(0.7, "#f08020");
        diskG.addColorStop(1, "#c04010");
        ctx.beginPath(); ctx.arc(cx, cy, R, 0, Math.PI * 2);
        ctx.fillStyle = diskG; ctx.fill();

        // Granulation texture
        for (let g2 = 0; g2 < 120; g2++) {
          const seed = g2 * 137.5;
          const gx = cx + (Math.cos(seed) * R * (Math.random() * 0.0 + 0.92));
          const gy = cy + (Math.sin(seed * 0.7) * R * 0.92);
          const dist = Math.sqrt((gx - cx) ** 2 + (gy - cy) ** 2);
          if (dist > R * 0.95) continue;
          ctx.beginPath(); ctx.arc(gx, gy, 2 + Math.random() * 3, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(255,200,80,0.07)`;
          ctx.fill();
        }

        // Differential rotation: equator ω_eq > poles
        // ω(lat) = 14.33 - 2.77 sin²(lat) degrees/day
        spotSeeds.forEach((sp, si) => {
          const age = (t - sp.born) * 0.5;
          if (age < 0 || age > 400) return;
          const lifetime = 400;
          const lifeAlpha = Math.min(1, Math.min(age / 30, (lifetime - age) / 30));

          const latRad = sp.lat * Math.PI;
          const omegaDeg = 14.33 - 2.77 * Math.sin(latRad) ** 2;
          const rotAngle = sp.lon * Math.PI * 2 + (t * 0.008 * omegaDeg / 14.33);

          // Project 3D sphere position
          const cosLat = Math.cos(latRad);
          const sx3 = cosLat * Math.cos(rotAngle);
          const sy3 = Math.sin(latRad);
          const sz3 = cosLat * Math.sin(rotAngle);
          if (sz3 < -0.1) return; // behind limb

          const px = cx + sx3 * R;
          const py = cy - sy3 * R;
          const perspective = (sz3 + 1.2) / 2.2; // limb darkening proxy

          const spotR = sp.r * R * perspective * cycleStrength * lifeAlpha;
          if (spotR < 2) return;

          // Penumbra
          const penG = ctx.createRadialGradient(px, py, 0, px, py, spotR);
          penG.addColorStop(0, `rgba(0,0,0,${0.85 * lifeAlpha})`);
          penG.addColorStop(sp.umbra, `rgba(40,10,0,${0.75 * lifeAlpha})`);
          penG.addColorStop(1, `rgba(180,80,20,0)`);
          ctx.beginPath(); ctx.arc(px, py, spotR, 0, Math.PI * 2);
          ctx.fillStyle = penG; ctx.fill();

          // Label on first spot
          if (si === 0 && lifeAlpha > 0.8) {
            ctx.fillStyle = "rgba(255,255,255,0.5)";
            ctx.font = `8px ${mono}`; ctx.textAlign = "center";
            ctx.fillText("SUNSPOT", px, py - spotR - 6);
          }
        });

        // Limb darkening
        const limbG = ctx.createRadialGradient(cx, cy, R * 0.5, cx, cy, R);
        limbG.addColorStop(0, "transparent");
        limbG.addColorStop(1, "rgba(60,20,0,0.45)");
        ctx.beginPath(); ctx.arc(cx, cy, R, 0, Math.PI * 2);
        ctx.fillStyle = limbG; ctx.fill();

        // Solar cycle meter
        const meterX = W * 0.06, meterY = H * 0.85, meterW = W * 0.18, meterH = 8;
        ctx.fillStyle = "#0a1a28"; ctx.fillRect(meterX, meterY, meterW, meterH);
        const mCol = cycleStrength > 0.7 ? ROSE : cycleStrength > 0.4 ? AMBER : TEAL;
        ctx.fillStyle = mCol; ctx.fillRect(meterX, meterY, meterW * cycleStrength, meterH);
        ctx.fillStyle = mCol; ctx.font = `8px ${mono}`; ctx.textAlign = "left";
        ctx.fillText(`SOLAR CYCLE STRENGTH  ${(cycleStrength * 100).toFixed(0)}%`, meterX, meterY - 6);
        ctx.fillStyle = solarMax ? ROSE : TEAL;
        ctx.fillText(solarMax ? "SOLAR MAX" : "SOLAR MIN", meterX + meterW + 10, meterY + 6);

        // 11-year cycle curve (bottom strip)
        const stripY = H - 22, stripH = 18;
        ctx.fillStyle = "#020a10"; ctx.fillRect(W * 0.3, stripY - 2, W * 0.65, stripH + 2);
        ctx.beginPath();
        for (let xi = 0; xi <= 100; xi++) {
          const ph = (xi / 100) * Math.PI * 4 + (t * 0.023) - Math.PI * 2;
          const y = stripY + stripH / 2 - (Math.sin(ph / 2) * 0.5 + 0.5) * stripH * 0.8;
          const x = W * 0.3 + (xi / 100) * W * 0.65;
          xi === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
        }
        ctx.strokeStyle = AMBER; ctx.lineWidth = 1.5; ctx.stroke();
        ctx.fillStyle = "#5a7888"; ctx.font = `7px ${mono}`; ctx.textAlign = "left";
        ctx.fillText("11-YEAR CYCLE ───────────────────────────────────────►", W * 0.31, stripY - 6);
      }

      /* ══ ENTROPY FLOW ══ */
      else if (mode === "entropy") {
        const t = tick.current;

        // Background zones
        const envG = ctx.createLinearGradient(0, 0, W * 0.48, 0);
        envG.addColorStop(0, "rgba(40,10,5,0.6)"); envG.addColorStop(1, "rgba(10,5,2,0.2)");
        ctx.fillStyle = envG; ctx.fillRect(0, 0, W * 0.48, H);
        const cellG = ctx.createLinearGradient(W * 0.52, 0, W, 0);
        cellG.addColorStop(0, "rgba(2,15,10,0.2)"); cellG.addColorStop(1, "rgba(2,30,20,0.5)");
        ctx.fillStyle = cellG; ctx.fillRect(W * 0.52, 0, W * 0.48, H);

        // Zone labels
        ctx.fillStyle = `${AMBER}80`; ctx.font = `9px ${mono}`; ctx.textAlign = "center";
        ctx.fillText("HIGH ENTROPY", W * 0.22, H * 0.06);
        ctx.fillText("ENVIRONMENT", W * 0.22, H * 0.06 + 14);
        ctx.fillStyle = `${GREEN}80`;
        ctx.fillText("LOW ENTROPY", W * 0.78, H * 0.06);
        ctx.fillText("LIVING CELL", W * 0.78, H * 0.06 + 14);

        // Divider — cell membrane
        ctx.setLineDash([4, 3]);
        ctx.beginPath(); ctx.moveTo(W * 0.5, 0); ctx.lineTo(W * 0.5, H);
        ctx.strokeStyle = `${TEAL}40`; ctx.lineWidth = 1.5; ctx.stroke();
        ctx.setLineDash([]);
        ctx.fillStyle = `${TEAL}60`; ctx.font = `7px ${mono}`; ctx.textAlign = "center";
        ctx.fillText("MEMBRANE", W * 0.5, H * 0.5 - 4);

        // Env particles — chaotic
        for (const p of envP) {
          p.x += p.vx; p.y += p.vy;
          if (p.x < 0 || p.x > 0.46) p.vx *= -1;
          if (p.y < 0 || p.y > 1)    p.vy *= -1;
          const alpha = 0.5 + 0.3 * Math.sin(t * 0.05 + p.x * 10);
          ctx.beginPath(); ctx.arc(p.x * W, p.y * H, p.size, 0, Math.PI * 2);
          ctx.fillStyle = p.col + Math.round(alpha * 255).toString(16).padStart(2, "0");
          ctx.fill();
          // random velocity kick (disorder)
          if (Math.random() < 0.02) {
            p.vx += (Math.random() - 0.5) * 0.006;
            p.vy += (Math.random() - 0.5) * 0.006;
            const spd = Math.sqrt(p.vx * p.vx + p.vy * p.vy);
            if (spd > 0.012) { p.vx *= 0.012 / spd; p.vy *= 0.012 / spd; }
          }
        }

        // Cell particles — organize into ordered rings
        const ringCount = 3;
        for (let ri = 0; ri < ringCount; ri++) {
          const rr = 0.1 + ri * 0.08;
          const cx2 = 0.75, cy2 = 0.5;
          for (const p of cellP.slice(ri * 20, (ri + 1) * 20)) {
            // Drift toward ring position
            const targetAngle = Math.atan2(p.y - cy2, p.x - cx2) + 0.008;
            const tx = cx2 + rr * Math.cos(targetAngle);
            const ty = cy2 + rr * Math.sin(targetAngle);
            p.x += (tx - p.x) * 0.025;
            p.y += (ty - p.y) * 0.025;
            const alpha = 0.7 + 0.3 * Math.sin(t * 0.04 + ri * 1.2);
            ctx.beginPath();
            ctx.arc(p.x * W, p.y * H, p.size, 0, Math.PI * 2);
            ctx.fillStyle = p.col + Math.round(alpha * 255).toString(16).padStart(2, "0");
            ctx.fill();
          }
        }

        // Energy arrows: sun → cell (right) / waste heat → env (left)
        const arrowPhase = (t * 0.025) % 1;
        for (let i = 0; i < 5; i++) {
          const frac = (arrowPhase + i / 5) % 1;
          const ax = W * 0.1 + frac * W * 0.35;
          const ay = H * 0.25;
          ctx.beginPath(); ctx.arc(ax, ay, 2.5, 0, Math.PI * 2);
          ctx.fillStyle = SOLAR; ctx.fill();
        }
        // Arrow labels
        ctx.fillStyle = SOLAR + "cc"; ctx.font = `8px ${mono}`; ctx.textAlign = "left";
        ctx.fillText("ENERGY IN (SUN) ───────►", W * 0.08, H * 0.25 - 10);
        ctx.fillStyle = ROSE + "99"; ctx.textAlign = "left";
        ctx.fillText("◄─── WASTE HEAT OUT", W * 0.08, H * 0.75 + 4);
        // Waste arrows (reverse)
        for (let i = 0; i < 5; i++) {
          const frac = 1 - (arrowPhase + i / 5) % 1;
          const ax = W * 0.1 + frac * W * 0.35;
          const ay = H * 0.75;
          ctx.beginPath(); ctx.arc(ax, ay, 2, 0, Math.PI * 2);
          ctx.fillStyle = ROSE; ctx.fill();
        }

        // Entropy readouts
        const envEntropy = 0.85 + 0.1 * Math.sin(t * 0.02);
        const cellEntropy = 0.12 + 0.04 * Math.sin(t * 0.03 + 1);
        ctx.fillStyle = AMBER; ctx.font = `9px ${mono}`; ctx.textAlign = "center";
        ctx.fillText(`S_env = ${envEntropy.toFixed(3)}`, W * 0.22, H - 14);
        ctx.fillStyle = GREEN;
        ctx.fillText(`S_cell = ${cellEntropy.toFixed(3)}`, W * 0.78, H - 14);
        ctx.fillStyle = TEAL;
        ctx.fillText(`ΔS_exported = ${(envEntropy - cellEntropy).toFixed(3)}`, W * 0.5, H - 14);
      }

      /* ══ NANO MOTOR ══ */
      else if (mode === "nanomotor") {
        const t = tick.current;
        const cx = W * 0.5, cy = H * 0.5;
        const R = Math.min(W, H) * 0.28;
        const rotAngle = t * 0.025; // ATP synthase rotation

        // Proton gradient: left = high concentration (matrix), right = low (IMS)
        const leftG = ctx.createRadialGradient(cx - R * 1.6, cy, 0, cx - R * 1.6, cy, R * 1.2);
        leftG.addColorStop(0, "rgba(26,159,212,0.15)"); leftG.addColorStop(1, "transparent");
        ctx.fillStyle = leftG; ctx.fillRect(0, 0, W * 0.4, H);
        const rightG = ctx.createRadialGradient(cx + R * 1.6, cy, 0, cx + R * 1.6, cy, R * 1.2);
        rightG.addColorStop(0, "rgba(232,100,10,0.10)"); rightG.addColorStop(1, "transparent");
        ctx.fillStyle = rightG; ctx.fillRect(W * 0.6, 0, W * 0.4, H);

        // Membrane line (mitochondrial inner membrane)
        ctx.setLineDash([6, 3]);
        ctx.beginPath(); ctx.moveTo(cx - R * 0.08, H * 0.1); ctx.lineTo(cx - R * 0.08, H * 0.9);
        ctx.strokeStyle = `${VIOLET}40`; ctx.lineWidth = 2; ctx.stroke();
        ctx.setLineDash([]);
        ctx.fillStyle = `${VIOLET}70`; ctx.font = `7px ${mono}`; ctx.textAlign = "center";
        ctx.fillText("MEMBRANE", cx - R * 0.08, H * 0.1 - 6);

        // F0 ring (in membrane)
        for (let b = 0; b < N_BLADES; b++) {
          const ba = (b / N_BLADES) * Math.PI * 2 + rotAngle;
          const bx = cx + R * 0.35 * Math.cos(ba);
          const by = cy + R * 0.35 * Math.sin(ba);
          const bladeOn = Math.abs(Math.sin(ba + rotAngle * 2)) > 0.3;
          ctx.beginPath(); ctx.arc(bx, by, 6, 0, Math.PI * 2);
          ctx.fillStyle = bladeOn ? `${TEAL}90` : `${BLUE}40`;
          ctx.fill();
          ctx.strokeStyle = `${TEAL}30`; ctx.lineWidth = 0.8; ctx.stroke();
        }

        // Central stalk
        ctx.beginPath(); ctx.arc(cx, cy, R * 0.12, 0, Math.PI * 2);
        const axleG = ctx.createRadialGradient(cx, cy, 0, cx, cy, R * 0.12);
        axleG.addColorStop(0, YELLOW); axleG.addColorStop(1, AMBER + "80");
        ctx.fillStyle = axleG; ctx.fill();
        ctx.strokeStyle = AMBER; ctx.lineWidth = 1; ctx.stroke();

        // F1 head (catalytic domain) — rotating hexamer
        for (let h = 0; h < 6; h++) {
          const ha = (h / 6) * Math.PI * 2 + rotAngle * 0.333;
          const hx = cx + R * 0.32 * Math.cos(ha);
          const hy = cy + R * 0.32 * Math.sin(ha) + R * 0.6; // below center
          const phase = (h / 6 + rotAngle / (Math.PI * 2)) % 1;
          const isActive = phase < 0.33;
          ctx.beginPath(); ctx.arc(hx, hy, 8, 0, Math.PI * 2);
          ctx.fillStyle = isActive ? `${GREEN}90` : `${DIM}60`;
          ctx.fill();
          ctx.strokeStyle = isActive ? GREEN : DIM; ctx.lineWidth = 0.8; ctx.stroke();
        }
        ctx.fillStyle = `${GREEN}70`; ctx.font = `7px ${mono}`; ctx.textAlign = "center";
        ctx.fillText("F₁ CATALYTIC", cx, cy + R * 0.85 + 18);
        ctx.fillStyle = `${TEAL}70`;
        ctx.fillText("F₀ RING (c-RING)", cx, cy - 6);

        // Protons crossing membrane
        for (const p of protons) {
          p.angle += 0.002;
          const crossingAngle = -Math.PI / 2;
          const nearMembrane = Math.abs(((p.angle % (Math.PI * 2)) + Math.PI * 2) % (Math.PI * 2) - ((crossingAngle + Math.PI * 2) % (Math.PI * 2))) < 0.3;
          const pr = R * 0.35;
          const px = cx + pr * Math.cos(p.angle) - R * 0.08;
          const py = cy + pr * Math.sin(p.angle);
          const alpha = 0.7 + 0.3 * Math.sin(t * 0.1 + p.angle * 3);
          ctx.beginPath(); ctx.arc(px, py, 3, 0, Math.PI * 2);
          ctx.fillStyle = nearMembrane ? `rgba(255,220,50,${alpha})` : `rgba(26,159,212,${alpha * 0.7})`;
          ctx.fill();
        }

        // ATP product molecules
        for (const s of substrates) {
          s.angle += 0.003 + 0.001 * Math.sin(tick.current * 0.02 + s.dist);
          const sx2 = cx + (R * 1.4 + s.dist * R * 0.3) * Math.cos(s.angle);
          const sy2 = cy + (R * 0.7 + s.dist * R * 0.3) * Math.sin(s.angle) + R * 0.5;
          ctx.beginPath(); ctx.arc(sx2, sy2, 4, 0, Math.PI * 2);
          const abound = 0.5 + 0.4 * Math.sin(tick.current * 0.08 + s.angle * 2);
          ctx.fillStyle = `rgba(34,197,94,${abound})`;
          ctx.fill();
          if (abound > 0.75) {
            ctx.fillStyle = `${GREEN}80`; ctx.font = `7px ${mono}`; ctx.textAlign = "center";
            ctx.fillText("ATP", sx2, sy2 - 8);
          }
        }

        // Rotation arrow hint
        const arrowR = R * 0.52;
        ctx.beginPath();
        ctx.arc(cx, cy, arrowR, rotAngle, rotAngle + Math.PI * 1.5);
        ctx.strokeStyle = `${AMBER}50`; ctx.lineWidth = 1; ctx.stroke();
        const headA = rotAngle + Math.PI * 1.5;
        ctx.beginPath();
        ctx.moveTo(cx + arrowR * Math.cos(headA), cy + arrowR * Math.sin(headA));
        ctx.lineTo(cx + arrowR * Math.cos(headA - 0.3) - 5 * Math.sin(headA - 0.3), cy + arrowR * Math.sin(headA - 0.3) + 5 * Math.cos(headA - 0.3));
        ctx.lineTo(cx + arrowR * Math.cos(headA + 0.3) - 5 * Math.sin(headA + 0.3), cy + arrowR * Math.sin(headA + 0.3) + 5 * Math.cos(headA + 0.3));
        ctx.fillStyle = AMBER; ctx.fill();

        // Efficiency label
        ctx.fillStyle = YELLOW; ctx.font = `9px ${mono}`; ctx.textAlign = "center";
        ctx.fillText("η ATP SYNTHASE ≈ 95–100%", cx, H - 16);
        ctx.fillStyle = `${GREEN}90`;
        ctx.fillText("~100 ATP/sec per enzyme", cx, H - 4);

        // Quantum tunneling glow
        const qAlpha = 0.1 + 0.08 * Math.sin(t * 0.15);
        ctx.beginPath(); ctx.arc(cx, cy, R * 0.18, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(139,92,246,${qAlpha})`;
        ctx.fill();
        ctx.fillStyle = `${VIOLET}80`; ctx.font = `7px ${mono}`; ctx.textAlign = "center";
        ctx.fillText("QUANTUM", cx, cy + 3);
        ctx.fillText("TUNNELING", cx, cy + 13);

        // Zone labels
        ctx.fillStyle = `${BLUE}80`; ctx.font = `8px ${mono}`; ctx.textAlign = "center";
        ctx.fillText("H⁺ HIGH", W * 0.12, cy);
        ctx.fillStyle = `${SOLAR}80`;
        ctx.fillText("H⁺ LOW", W * 0.88, cy);
      }

      tick.current += 1;
      raf.current = requestAnimationFrame(draw);
    };
    draw();
    return () => { cancelAnimationFrame(raf.current); window.removeEventListener("resize", resize); };
  }, [mode]);

  return (
    <div style={{ borderRadius: 10, overflow: "hidden", border: `1px solid ${SOLAR}20` }}>
      <canvas ref={cvs} style={{ display: "block", width: "100%" }} />
    </div>
  );
}

function ModeTabs({ value, onChange }: { value: Mode; onChange: (m: Mode) => void }) {
  const tabs = [
    { k: "solar" as Mode,     label: "Solar Cycle · Sunspot Dynamics",   col: SOLAR  },
    { k: "entropy" as Mode,   label: "Entropy Reversal · Living Cell",    col: GREEN  },
    { k: "nanomotor" as Mode, label: "ATP Synthase · Nano Motor",         col: VIOLET },
  ];
  return (
    <div style={{ display: "flex", gap: 6, marginBottom: 10, flexWrap: "wrap" }}>
      {tabs.map(tab => (
        <button key={tab.k} onClick={() => onChange(tab.k)} style={{
          fontFamily: mono, fontSize: 10, padding: "5px 14px", borderRadius: 4, cursor: "pointer",
          border: `1px solid ${value === tab.k ? tab.col : DIM + "60"}`,
          background: value === tab.k ? `${tab.col}18` : "transparent",
          color: value === tab.k ? tab.col : DIM,
          transition: "all 0.2s",
        }}>{tab.label}</button>
      ))}
    </div>
  );
}

const NAV = [
  { id: "s1", label: "Solar Cycles" },
  { id: "s2", label: "Sunspot Physics" },
  { id: "s3", label: "24 Themis" },
  { id: "s4", label: "Citizen 24" },
  { id: "s5", label: "Ozone & Health" },
  { id: "s6", label: "Entropy Reversal" },
  { id: "s7", label: "DNA Piano" },
  { id: "s8", label: "Nano Motor" },
  { id: "s9", label: "AETHER Synthesis" },
];

/* ── Page ──────────────────────────────────── */
function DarkSunSimCanvas() {
  const ref = useRef<HTMLCanvasElement>(null);
  const rafRef = useRef(0);
  useEffect(() => {
    const canvas = ref.current; if (!canvas) return;
    const ctx = canvas.getContext("2d")!;
    canvas.width = 900; canvas.height = 200;
    const W = canvas.width, H = canvas.height;
    const cx=W/2, cy=H/2;
    let t=0;
    const prominences: {ang:number,len:number,phase:number}[]=[];
    for(let i=0;i<8;i++) prominences.push({ ang:i*(Math.PI*2/8), len:25+Math.random()*20, phase:Math.random()*Math.PI*2 });
    const draw=()=>{
      ctx.fillStyle="rgba(2,4,8,0.2)"; ctx.fillRect(0,0,W,H);
      t++;
      const corona=ctx.createRadialGradient(cx,cy,20,cx,cy,80);
      corona.addColorStop(0,"rgba(255,80,0,0.3)"); corona.addColorStop(0.5,"rgba(180,40,0,0.08)"); corona.addColorStop(1,"transparent");
      ctx.beginPath(); ctx.arc(cx,cy,80,0,Math.PI*2); ctx.fillStyle=corona; ctx.fill();
      prominences.forEach(p=>{
        const psi=0.5+0.5*Math.sin(t*0.04+p.phase);
        const len=p.len*(0.7+0.3*psi);
        const x1=cx+30*Math.cos(p.ang), y1=cy+30*Math.sin(p.ang);
        const x2=cx+(30+len)*Math.cos(p.ang), y2=cy+(30+len)*Math.sin(p.ang);
        ctx.beginPath(); ctx.moveTo(x1,y1); ctx.lineTo(x2,y2);
        ctx.strokeStyle=`rgba(255,${80+80*psi|0},0,0.6)`; ctx.lineWidth=2; ctx.stroke();
        ctx.beginPath(); ctx.arc(x2,y2,3,0,Math.PI*2);
        ctx.fillStyle=`rgba(255,200,50,0.8)`; ctx.fill();
      });
      const disk=ctx.createRadialGradient(cx,cy,0,cx,cy,28);
      disk.addColorStop(0,"rgba(255,255,200,0.9)"); disk.addColorStop(0.5,"rgba(255,150,0,0.7)"); disk.addColorStop(1,"rgba(180,30,0,0.5)");
      ctx.beginPath(); ctx.arc(cx,cy,28,0,Math.PI*2); ctx.fillStyle=disk; ctx.fill();
      ctx.fillStyle="rgba(255,100,30,0.4)"; ctx.font="9px 'DM Mono',monospace"; ctx.textAlign="left";
      ctx.fillText("DARK SUN · SOLAR COHERENCE · PLASMA PROMINENCE · CORONAL FIELD · AETHER",14,14);
      rafRef.current=requestAnimationFrame(draw);
    };
    draw();
    return ()=>cancelAnimationFrame(rafRef.current);
  },[]);
  return <canvas ref={ref} style={{ width:"100%", height:"auto", borderRadius:8, display:"block" }} />;
}

export default function DarkSunPage() {
  const [mode, setMode] = useState<Mode>("solar");
  return (
    <div style={{ background: BG, minHeight: "100vh", fontFamily: body, color: TEXT }}>
      <div style={{ padding:"24px 24px 0" }}>
        <div style={{ display:"inline-block", border:"1px solid #ff6418", borderRadius:4, padding:"4px 14px", fontSize:10, letterSpacing:"0.28em", color:"#ff6418", fontFamily:"'DM Mono',monospace", marginBottom:16 }}>LIVE SIMULATION</div>
        <div style={{ background:"rgba(2,4,8,0.9)", border:"1px solid rgba(255,100,30,0.15)", borderLeft:"3px solid #ff6418", borderRadius:10, padding:20, marginBottom:16 }}>
          <h2 style={{ fontFamily:"'DM Mono',monospace", fontSize:18, color:"#e0f8ff", margin:"0 0 6px" }}>
            Dark Sun · Solar Coherence · Plasma Prominence · Coronal Field · AETHER
          </h2>
          <p style={{ fontFamily:"'DM Mono',monospace", fontSize:12, color:"rgba(255,100,30,0.4)", margin:"0 0 14px", lineHeight:1.65 }}>
            Animated solar disk with eight pulsing plasma prominences and a corona gradient — the live AETHER dark sun coronal field simulation.
          </p>
          <DarkSunSimCanvas />
        </div>
      </div>

      {/* Hero */}
      <div style={{
        padding: "66px 28px 42px", textAlign: "center",
        background: "linear-gradient(180deg,#0d0500 0%,#020408 100%)",
        borderBottom: `1px solid ${SOLAR}18`,
      }}>
        <div style={{ fontFamily: mono, fontSize: 10, color: SOLAR, letterSpacing: 4, marginBottom: 12 }}>
          AETHER · HELIOPHYSICS · QUANTUM BIOLOGY · ENTROPY DYNAMICS
        </div>
        <h1 style={{ fontFamily: serif, fontSize: "clamp(22px,5vw,44px)", color: "#fff", margin: "0 0 12px", letterSpacing: 2, lineHeight: 1.2 }}>
          THE DARK SIDE<br /><span style={{ color: YELLOW }}>OF THE SUN</span>
        </h1>
        <p style={{ fontFamily: body, fontSize: 17, color: DIM, maxWidth: 700, margin: "0 auto 26px", lineHeight: 1.8 }}>
          14 years of solar cycles · Black sunspots as spacetime elasticity ·
          Asteroid 24 Themis · Citizen solar monitoring · Ozone & human health ·
          Quantum living systems decreasing entropy · DNA piano & epigenetics ·
          Molecular nanomachines & the 10ms heroic calculation
        </p>
        <div style={{ display: "flex", gap: 8, justifyContent: "center", flexWrap: "wrap" }}>
          <Chip c={SOLAR}>Solar Cycles</Chip>
          <Chip c={YELLOW}>Sunspot Elasticity</Chip>
          <Chip c={GREEN}>Entropy Reversal</Chip>
          <Chip c={VIOLET}>Molecular Nanomachine</Chip>
          <Chip c={TEAL}>DNA Piano</Chip>
          <Chip c={AMBER}>Lamarckian Evolution</Chip>
        </div>
      </div>

      {/* Sticky nav */}
      <div style={{
        position: "sticky", top: 0, zIndex: 50,
        background: `${BG}f2`, backdropFilter: "blur(12px)",
        borderBottom: `1px solid ${SOLAR}12`,
        padding: "8px 18px", display: "flex", gap: 4, overflowX: "auto",
      }}>
        {NAV.map(s => (
          <a key={s.id} href={`#${s.id}`} style={{
            fontFamily: mono, fontSize: 10, color: DIM, whiteSpace: "nowrap",
            padding: "4px 10px", borderRadius: 4, textDecoration: "none",
            border: "1px solid transparent",
          }}
            onMouseEnter={e => { (e.target as HTMLElement).style.color = SOLAR; (e.target as HTMLElement).style.borderColor = `${SOLAR}30`; }}
            onMouseLeave={e => { (e.target as HTMLElement).style.color = DIM; (e.target as HTMLElement).style.borderColor = "transparent"; }}
          >{s.label}</a>
        ))}
      </div>

      <div style={{ maxWidth: 920, margin: "0 auto", padding: "0 22px 96px" }}>

        {/* Canvas */}
        <div style={{ marginTop: 36 }}>
          <ModeTabs value={mode} onChange={setMode} />
          <DarkSunCanvas mode={mode} />
          <div style={{ fontFamily: mono, fontSize: 9, color: DIM, marginTop: 6 }}>
            {mode === "solar"     && "ANIMATED SOLAR DISK · DIFFERENTIAL ROTATION · SUNSPOT GROUPS · 11-YEAR CYCLE STRENGTH METER · CORONA FILAMENTS AT SOLAR MAX"}
            {mode === "entropy"   && "ENVIRONMENT (HIGH ENTROPY, CHAOTIC) vs LIVING CELL (LOW ENTROPY, ORDERED RINGS) · ENERGY IN FROM SUN · WASTE HEAT EXPORTED"}
            {mode === "nanomotor" && "ATP SYNTHASE F₀F₁ MOTOR · PROTON GRADIENT DRIVES ROTATION · F₁ HEXAMER SYNTHESIZES ATP · QUANTUM TUNNELING AT ACTIVE SITE"}
          </div>
        </div>

        {/* ── I ── */}
        <SecHead id="s1" n="I" title="Solar Cycles · 14 Years of Watching"
          sub="The 11-year cycle, solar maximum & minimum, and what changes when the sun intensifies" col={SOLAR} />

        <p style={{ fontFamily: body, fontSize: 16, lineHeight: 1.8, marginBottom: 18 }}>
          The sun is not a constant star — it breathes. Every ~11 years it completes a full
          activity cycle: from solar minimum (quiet sun, few sunspots, low UV) through solar
          maximum (intense magnetic activity, frequent sunspot groups, solar flares,
          coronal mass ejections) and back. Fourteen years of continuous observation spans
          roughly one and a quarter complete cycles — enough to see the full pattern twice
          and begin to understand the anomalies between them.
        </p>

        <EQ>{`Solar cycle metrics:
  Average period: 11.0 years (range: 9–14 years)
  Sunspot number at solar minimum: ~0–10
  Sunspot number at solar maximum: ~100–200 (Cycle 24: 116, Cycle 25 rising fast)

Solar irradiance variation:
  Total Solar Irradiance (TSI): ~1361 W/m² (min) → ~1362.1 W/m² (max)
  ΔF ≈ 0.1%  — small in total, but UV variation is ~6–8% (much larger)
  UV at 200–300nm: ±15% variation over cycle (ozone-forming wavelengths)

Earth surface effects:
  Solar min → reduced UV → less stratospheric ozone formation → colder lower strat
  Solar max → increased UV → more ozone → warmer stratosphere → affects jet stream
  Geomagnetic storm frequency: ~4/year (min) → ~200+/year (max)

14-year observation window spans:
  ~ Cycle 23 tail → Cycle 24 max → Cycle 24 min → Cycle 25 ramp
  Captures: two distinct maxima, one deep minimum (2019–2020, lowest in a century)`}</EQ>

        <Tbl
          headers={["Solar Phase", "Sunspot Number", "UV Output", "CME Frequency", "Earth Impact"]}
          accent={SOLAR}
          rows={[
            ["Deep minimum", "< 5", "Baseline", "< 1/month", "Quiet geomagnetic, enhanced GCR flux"],
            ["Rising phase", "10–80", "+3–5%", "2–4/month", "Increasing aurora activity"],
            ["Solar maximum", "100–200+", "+6–8%", "10–20/month", "Grid disruption risk, ozone increase"],
            ["Declining phase", "80–20", "–3%", "Decreasing", "Unpredictable storm intervals"],
            ["Anomalous minimum (2019)", "< 2 (record)", "–8%", "Near zero", "Enhanced cosmic ray penetration"],
          ]}
        />

        {/* ── II ── */}
        <SecHead id="s2" n="II" title="Black Sunspots · Infinity Elasticity"
          sub="Sunspot anatomy, magnetic flux tube geometry, and spacetime deformation through the solar plasma" col={YELLOW} />

        <p style={{ fontFamily: body, fontSize: 16, lineHeight: 1.8, marginBottom: 18 }}>
          A sunspot appears black because it is cooler — roughly 3,700 K versus the surrounding
          photosphere at 5,778 K. But that darkness is not absence; it is <em>concentration</em>.
          A sunspot is a region where magnetic field lines have burst through the solar surface,
          suppressing convective heat transport. The magnetic field strength in a sunspot
          (2,000–4,000 Gauss) is ten thousand times Earth's surface field. This extreme field
          creates a local deformation in the plasma — an "infinity elasticity" configuration
          where the field lines stretch dynamically in all directions without breaking.
        </p>

        <EQ>{`Sunspot thermal deficit:
  Photosphere T_eff = 5,778 K (Stefan-Boltzmann: F = σT⁴)
  Umbra (dark core) T_umbra ≈ 3,700 K
  Brightness ratio: (3700/5778)⁴ ≈ 0.17  (umbra is ~17% as bright)
  → Appears black by contrast, but emits more light than a full moon

Magnetic flux tube geometry:
  B (umbra) = 2,000–4,000 Gauss (0.2–0.4 Tesla)
  Wilson Effect: sunspots appear depressed into the sun (confirmed by limb observations)
    → The magnetic pressure suppresses upward plasma flow
    → Creates a 400–700 km depression below surrounding photosphere
  Flux tube equation: B²/8π = P_gas_difference + ρgh  [pressure balance]

Differential rotation — sunspots as rotation tracers:
  ω(b) = 14.33° − 2.77° sin²(b)   [b = heliographic latitude]
  Equator: 25.67-day rotation, Poles: ~35-day rotation
  → Sunspots at different latitudes rotate at different rates
  → This differential winds up magnetic field lines → eventual field reversal

Infinity elasticity (AETHER frame):
  The coronal magnetic loop above a sunspot pair is a topological structure
  that supports: stretching, twisting, kinking — without fracture
  Until the critical threshold: E_magnetic > E_binding
  → Magnetic reconnection event (solar flare, CME)
  → Energy released: up to 10²⁵ J in minutes (6×10¹¹ Hiroshima bombs)

Sunspot polarity (Hale's Law):
  Every cycle, polarity of leading spots reverses (22-year magnetic cycle)
  → 14 years = first half of the full magnetic Hale cycle`}</EQ>

        <Card title="FILAMENTS — PARTICLE ANTIGEN ANALOGY" col={YELLOW}>
          Solar filaments (prominences) are dense, cool plasma suspended in the corona by
          magnetic field lines — seemingly impossible structures, held up by magnetic tension
          against gravity for days or weeks. When viewed in H-alpha light, they appear as
          dark threads across the disk, or bright arching curtains at the limb.
          <br /><br />
          The antigen analogy is precise: a filament is a foreign body (cool, dense material
          in the hot corona) stabilised by a molecular-scale equivalent — magnetic topology.
          Just as an antigen is held in an immune complex by molecular bonds that can break
          under the right perturbation, a filament is held by magnetic topology that can erupt
          (filament eruption) when the topology becomes unstable. The eruption is the immune
          response — rapid removal of the "foreign" structure, with massive energy release.
        </Card>

        <Card title="BRIGHTNESS MEASUREMENT — SOLAR PHOTOMETRY" col={AMBER}>
          Measuring the brightness of solar features (and comets, which reflect sunlight)
          uses photometric magnitude: m = m₀ − 2.5 log₁₀(F/F₀). For the sun's own features,
          helioseismology measures oscillations in brightness to map the interior — <em>sunquakes</em>
          propagate outward from flare sites at up to 50,000 km/h. For comets, brightness
          depends on heliocentric distance r and observer distance Δ:
          H = m − 5 log₁₀(r·Δ) (absolute magnitude).
          Cometary brightness varies by up to 10 magnitudes (factor 10,000) on approach to the sun.
        </Card>

        {/* ── III ── */}
        <SecHead id="s3" n="III" title="Asteroid 24 Themis · Mars–Jupiter Resonance"
          sub="How orbital mechanics and solar radiation shape the asteroid belt — and why 24 Themis matters" col={BLUE} />

        <p style={{ fontFamily: body, fontSize: 16, lineHeight: 1.8, marginBottom: 18 }}>
          The asteroid belt between Mars and Jupiter is not a random collection of rocks — it is
          a gravitationally structured system shaped by Jupiter's orbital resonances. Asteroid
          <strong> 24 Themis</strong> (discovered 1853, diameter ~198 km) is the parent body of the
          Themis family — one of the largest collisional families in the belt. In 2010,
          water ice and organic compounds were detected on its surface — the first direct
          detection of water ice on a main-belt asteroid. This made 24 Themis a keystone object
          in understanding how water arrived on Earth.
        </p>

        <EQ>{`24 Themis orbital parameters:
  Semi-major axis: a = 3.135 AU
  Orbital period:  T = 5.55 years
  Eccentricity:    e = 0.135
  Inclination:     i = 0.76°
  Mean diameter:   D ≈ 198 km
  Rotation period: P_rot = 8.374 hours

Jupiter resonance structure (Kirkwood gaps):
  3:1 resonance: 2.50 AU — gap (cleared by Jupiter)
  5:2 resonance: 2.82 AU — gap
  7:3 resonance: 2.96 AU — gap
  2:1 resonance: 3.28 AU — gap
  24 Themis sits at 3.135 AU → within the outer main belt, stable zone

Yarkovsky effect (solar rotation link):
  Solar radiation exerts a tiny thermal force on rotating bodies
  F_Yarkovsky ~ D^(-1) × albedo × solar distance
  For 24 Themis: drift ~ 10^-4 AU / million years
  → Solar cycle amplitude modulates Yarkovsky force magnitude
  → Long-term orbital evolution of small bodies coupled to solar activity

Water ice detection (Rivkin & Emery, 2010):
  Absorption feature at 3.1 μm (water ice) confirmed
  Also: organic compounds (CH₂, CH₃ stretch features at 3.3–3.5 μm)
  Implication: outer belt asteroids may have delivered water + organics to early Earth`}</EQ>

        {/* ── IV ── */}
        <SecHead id="s4" n="IV" title="Citizen 24 · Mobile Solar Monitoring Platform"
          sub="AETHER's distributed heliophysics observatory — rootex dynamics in efficient engine architecture" col={TEAL} />

        <p style={{ fontFamily: body, fontSize: 16, lineHeight: 1.8, marginBottom: 18 }}>
          Citizen 24 is the mobile solar monitoring architecture — named for the 24-hour
          continuous solar observation cycle and the citizen-science mandate of asteroid 24 Themis
          (water-bearing, organically complex, community-discovered). The system applies AETHER's
          efficient engine architecture to distributed solar observation: many low-cost mobile nodes,
          each running rootex-derived signal processing, collectively providing continuous
          multi-wavelength solar monitoring from ground level.
        </p>

        <Grid items={[
          { title: "ROOTEX DYNAMICS", col: TEAL, desc: "The signal processing core — an efficient engine architecture that applies recursive Fourier decomposition to raw solar brightness data, extracting sunspot area, filament motion, and UV flux from a standard smartphone camera + UV filter kit." },
          { title: "MOBILE NODE HARDWARE", col: BLUE, desc: "Smartphone + f/1.8 lens + Baader solar film + UV-pass filter + 1° FOV reducer. App runs rootex algorithm: real-time sunspot detection, position tracking, brightness curve logging. $45 build cost." },
          { title: "CITIZEN SCIENCE MESH", col: GREEN, desc: "Nodes at distributed latitudes triangulate solar events (solar rotation, limb crossing timing, CME onset parallax). 100+ nodes worldwide provide continuous coverage impossible from a single observatory." },
          { title: "AETHER INTEGRATION", col: VIOLET, desc: "Citizen 24 data feeds into the AETHER knowledge graph: solar activity → C(x,t) modulation signal. When solar X-class flares occur, AETHER adjusts the biomarker pipeline sensitivity (geomagnetic storms affect HRV and circadian timing)." },
        ]} />

        {/* ── V ── */}
        <SecHead id="s5" n="V" title="Ozone Layer · Solar UV · Human Health Pipeline"
          sub="The atmospheric filter that mediates solar energy's biological reach" col={AMBER} />

        <EQ>{`UV-ozone-health transmission chain:
  UV-C (100–280nm): almost entirely absorbed by O₂ + O₃ above 30km — AETHER layer boundary
  UV-B (280–315nm): partial absorption by ozone — primary biologically active band
  UV-A (315–400nm): mostly transmitted — less energetic, reaches surface

Ozone formation (Chapman cycle):
  O₂ + hν (λ < 242nm) → 2O•    [photolysis]
  O• + O₂ + M → O₃ + M         [ozone formation]
  O₃ + hν (λ < 320nm) → O₂ + O•[photolysis]
  O₃ + O• → 2O₂                 [recombination]
  Net: solar UV + O₂ ⇌ O₃ (steady state)

Solar cycle → ozone link:
  +1% UV-B increase at solar max → +0.3% ozone production rate
  (partial compensation: more ozone → absorbs more UV → self-limiting)
  Net effect: stratospheric ozone +2–3% at solar max vs minimum

Human health pipeline:
  UV-B on skin: 7-dehydrocholesterol → previtamin D₃ → vitamin D₃
    D₃ production saturates at ~15–30 min midday exposure (solar max → same dose in less time)
  UV-B excess: DNA photolesion (cyclobutane pyrimidine dimers → melanoma pathway)
  UV-B deficit: vitamin D deficiency (> 1 billion people globally), immune suppression
  Geomagnetic storm (solar max): Kp > 5 → affects HRV, sleep onset, cortisol in sensitive populations

Ozone thinning consequences:
  1% ozone decrease → 1.5–2% increase in UV-B at surface
  Each 1% UV-B increase → ~3% increase in non-melanoma skin cancer incidence`}</EQ>

        {/* ── VI ── */}
        <SecHead id="s6" n="VI" title="Quantum Living Systems · Entropy Reversal"
          sub="How life maintains low entropy by exporting disorder — and the quantum mechanisms that make it efficient" col={GREEN} />

        <p style={{ fontFamily: body, fontSize: 16, lineHeight: 1.8, marginBottom: 18 }}>
          Schrödinger's 1944 question — <em>"What is Life?"</em> — has a thermodynamic answer:
          life is a system that locally decreases its entropy by importing free energy (sunlight,
          chemical bonds) and exporting high-entropy waste (heat, CO₂). The physics of this process,
          developed over the past hundred years from statistical mechanics through quantum biology,
          reveals that life doesn't just tolerate quantum effects — it <em>exploits</em> them
          for efficiency gains that classical machines cannot achieve.
        </p>

        <EQ>{`Second Law of Thermodynamics:
  dS_total/dt ≥ 0   [total entropy never decreases]
  But for an open system:
  dS_system/dt = σ_internal + dS_exchange/dt
  Living system: dS_exchange < 0 (exports entropy faster than internal production)
  → S_cell can decrease while S_universe increases ✓

Dissipative structures (Prigogine, 1977 Nobel):
  Far-from-equilibrium systems self-organise into ordered structures
  Maintained by continuous energy throughput (sunlight, ATP hydrolysis)
  Examples: Bénard convection cells, biological membranes, protein folding, ecosystems

Quantum effects in biology:
  1. PHOTOSYNTHESIS: quantum coherence in Fenna-Matthews-Olson (FMO) complex
     Energy transfer efficiency > 95% (classical: ~40% max)
     Explanation: quantum superposition explores all paths simultaneously
     Finding optimal path faster than classical diffusion

  2. ENZYME CATALYSIS: quantum tunneling
     H atom tunnels through activation energy barrier (k_tunnel > k_classical by 100×+)
     KIE (kinetic isotope effect): H vs D tunneling measured in alcohol dehydrogenase

  3. AVIAN MAGNETORECEPTION: entangled radical pairs in cryptochrome
     Earth's magnetic field modulates singlet/triplet ratio → directional signal
     Quantum entanglement maintained ~100μs at body temperature (unprecedented)

  4. OLFACTION (controversial): vibrational tunneling theory
     Odorant molecules recognized by quantum vibrational fingerprint, not shape alone

Entropy production rate in living systems:
  Bacterium: σ ≈ 10⁻¹³ W/K (10¹⁰× lower than equivalent chemical reaction)
  Human body: σ ≈ 1 W/K at rest, 10 W/K at exercise
  This low σ / high order = the quantum efficiency signature`}</EQ>

        <Card title="THE 100 YEARS OF PHYSICS THAT MATTER" col={GREEN}>
          From 1924 (de Broglie matter waves) through 1943 (Schrödinger's life equation)
          through 1977 (Prigogine's dissipative structures) through 2007 (quantum coherence
          in photosynthesis confirmed) through 2025 (quantum tunneling in DNA mutation confirmed):
          the picture assembles. Living systems are not merely chemical machines — they are
          quantum coherence engines running inside a warm, wet, noisy environment that
          classical physics predicted should destroy all coherence instantly.
          They survive by coupling the quantum to the classical at the exact right timescales.
          AETHER is pushing these limits: applying the same insight to information processing,
          knowledge synthesis, and the coherence field C(x,t).
        </Card>

        {/* ── VII ── */}
        <SecHead id="s7" n="VII" title="DNA Piano · Epigenetics · The Lamarckian Return"
          sub="Gene expression as music — environment plays the instrument, evolution learns the composition" col={TEAL} />

        <p style={{ fontFamily: body, fontSize: 16, lineHeight: 1.8, marginBottom: 18 }}>
          The DNA piano metaphor is precise: your genome is the instrument (fixed, heritable,
          ~20,000 keys / protein-coding genes). Epigenetics is the score — which keys get pressed,
          in what order, how loudly, for how long. The environment is the pianist. Sunlight,
          temperature, diet, stress, toxins, social experience: all of these operate as
          environmental information that reaches the genome and changes which genes are expressed,
          without changing the DNA sequence itself.
        </p>

        <EQ>{`Epigenetic mechanisms (the piano keys being pressed):
  1. DNA methylation: CH₃ group added to cytosine (5-mC)
     → Gene silenced when methylated at promoter CpG sites
     Enzyme: DNMT (DNA methyltransferase) — adds marks
             TET (ten-eleven translocation) — removes marks
  
  2. Histone modification:
     H3K4me3 → active transcription (euchromatin)
     H3K27me3 → gene repression (heterochromatin)
     H3K9ac → open chromatin, high transcription
     → These marks are written, erased, read by "writers, erasers, readers"

  3. Non-coding RNA (ncRNA):
     miRNA silences mRNA (post-transcriptional)
     lncRNA restructures chromatin domains
     piRNA defends genome against transposons

Environmental signals that rewrite epigenome:
  UV-B radiation → p53 activation → DNA repair methylome shift
  Cortisol (stress) → glucocorticoid receptor → FKBP5 methylation change
  Nutrition → SAM (S-adenosylmethionine) level → methyl group availability
  Sunlight → circadian clock genes (CLOCK, BMAL1) → ~15% of all genes cycle daily

Lamarckian inheritance (modern form — transgenerational epigenetics):
  Parent experiences trauma → cortisol methylation changes in sperm/eggs
  → Offspring show altered HPA axis sensitivity (confirmed in mice, emerging in humans)
  → Not Darwin's random mutation: environment-directed, targeted, reversible
  Warm-wet-swampy early Earth: temperature = chemical differentiation catalyst
  Moss + water + sunlight = photosynthesis origin = first entropy engine`}</EQ>

        <Card title="THE UNKA GENE — DNA AS ENVIRONMENTAL SENSOR" col={TEAL}>
          Every layer of environmental information has a molecular pathway into the genome.
          The "Unka gene" framework (unnamed, emerging) describes how environmental
          acoustic, electromagnetic, and chemical noise becomes biological signal: sound
          vibration → mechanoreceptors → cytoskeleton → nucleus → chromatin remodeling.
          The environment does not just select organisms (Darwin); it actively instructs them
          (Lamarck, partially rehabilitated by epigenetics). The piano metaphor upgrades:
          the environment doesn't just press keys — it teaches the pianist new compositions
          that can be passed to the next generation.
        </Card>

        <Tbl
          headers={["Evolutionary Model", "Mechanism", "Speed", "Heritability", "Modern Status"]}
          accent={TEAL}
          rows={[
            ["Classical Darwinism", "Random mutation + natural selection", "Thousands of generations", "Genetic (DNA sequence)", "Core — still correct for long-term"],
            ["Neo-Darwinism (Modern Synthesis)", "Mutation + selection + genetic drift + gene flow", "Variable", "Genetic", "Standard framework"],
            ["Epigenetic inheritance (neo-Lamarckian)", "Environmental signal → epigenome → heritable mark", "1–3 generations", "Epigenetic (reversible)", "Confirmed in plants, nematodes, mice"],
            ["Horizontal gene transfer", "Direct DNA exchange between organisms", "Instantaneous", "Genetic", "Dominant in bacteria, minor in eukaryotes"],
            ["Quantum mutation", "Proton tunneling in DNA → tautomeric shift → base pair error", "Femtoseconds", "Genetic (if in germ cells)", "Theoretically confirmed, quantitatively emerging"],
          ]}
        />

        {/* ── VIII ── */}
        <SecHead id="s8" n="VIII" title="The Nano Thermodynamic Motor · 10ms Heroic Calculation"
          sub="Molecular machines, quantum target-finding, and the thermodynamic efficiency of life's engines" col={VIOLET} />

        <p style={{ fontFamily: body, fontSize: 16, lineHeight: 1.8, marginBottom: 18 }}>
          ATP synthase is a physical protein motor that rotates at ~100 revolutions per second,
          synthesising ~100 ATP molecules per second per enzyme, at an efficiency approaching
          100% — far exceeding the Carnot limit for a heat engine at biological temperatures.
          It achieves this by operating not as a heat engine but as a <em>chemomechanical</em> engine:
          converting the electrochemical potential of the proton gradient directly into rotation.
          Below ATP synthase in the complexity hierarchy are even simpler nanomachines:
          kinesin (molecular cargo walker), myosin (muscle contraction), ribosome (protein factory).
        </p>

        <EQ>{`ATP Synthase thermodynamics:
  F₀ subunit: proton channel in membrane
    c-ring: 8–15 c-subunits (organism-dependent, human: 8)
    Each proton crossing rotates the ring by 1/c turn
    ~3 protons per ATP (human: 3.3 H⁺/ATP via 8-subunit c-ring)

  F₁ subunit: catalytic head (α₃β₃ hexamer + γ central stalk)
    Rotation of γ stalk → 3 catalytic sites cycle: Open → ADP+Pi binding → ATP synthesis → Release
    Enzymatic rate: ~100 ATP/sec per molecule at physiological conditions

  Thermodynamic efficiency:
    ΔG_ATP = +30.5 kJ/mol (synthesis, standard conditions)
    ΔG_proton gradient (ΔμH⁺) = -21.4 kJ/mol per proton (at ΔΨ=-180mV, ΔpH=1)
    3 protons → -64.2 kJ/mol available → efficiency = 30.5/64.2 ≈ 47%
    But under physiological load: ATP is under-saturated → efficiency → 95–100%

The 10ms heroic calculation — enzyme target-finding:
  kinesin walks 8nm per ATP hydrolysis, 100 steps/sec → 800nm/sec
  But: finding the target molecule (microtubule binding site) in 3D cytoplasm
  Diffusion-limited rate: k_on ~ 10⁸ M⁻¹s⁻¹ (nearly diffusion limit)
  Electrostatic steering reduces search space from 3D to 1D (funnel effect)
  Quantum tunneling: proton tunnels through energy barrier in < 1 femtosecond
  Net result: enzyme 'knows' where to go via: diffusion + electrostatics + quantum tunneling
  → The 10ms window is the complete computation: locate + bind + catalyse + release

Intrinsic mutation as quantum switching:
  DNA base pair: G:C normally (guanine:cytosine)
  Tautomeric shift: G* (enol form) via proton tunneling → G*:T mismatch → point mutation
  Rate: ~10⁻¹⁰ per base per replication (extremely rare, but critical at scale)
  This is quantum biology's 'intrinsic mutation' — not random (thermally), but quantum-probabilistic`}</EQ>

        <Grid items={[
          { title: "KINESIN · THE WALKER", col: BLUE, desc: "Two-headed molecular motor that walks along microtubule tracks, carrying cargo vesicles. Each 8nm step consumes one ATP. The 'head-over-head' walking mechanism resembles bipedal locomotion at the nanoscale. Operates at ~5 pN force." },
          { title: "MYOSIN · THE RATCHET", col: AMBER, desc: "Heart and muscle contraction engine. Converts ATP hydrolysis to a ~10nm conformational change (power stroke). 300 myosin motors per thick filament. In heart muscle: 1 beat = 10¹⁰ myosin power strokes simultaneously." },
          { title: "RIBOSOME · THE FACTORY", col: GREEN, desc: "4-RNA + 80-protein complex, 25nm diameter. Reads mRNA and synthesises protein at 20 amino acids/second. Makes 2,000 errors per billion amino acid additions. Each error is checked and corrected by GTPase proofreading." },
          { title: "DNA POLYMERASE · THE COPIER", col: ROSE, desc: "Replicates DNA at 1,000 bases/second (bacteria), 50 bases/second (human). Error rate before proofreading: 10⁻⁵. After 3'-5' exonuclease proofreading: 10⁻⁷. After mismatch repair: 10⁻⁹. The 3-layer quality system." },
        ]} />

        {/* ── IX ── */}
        <SecHead id="s9" n="IX" title="AETHER Synthesis · The Solar–Molecular Coherence Chain"
          sub="From sunspot to ATP: the full coherence stack that AETHER is designed to process" col={BLUE} />

        <EQ>{`The coherence chain — solar to molecular:

  SUN (nuclear fusion, 1.5×10⁷ K core)
  ↓ photons (8.3 min travel time)
  SOLAR SURFACE (sunspot = magnetic elasticity, filament = plasma antigen)
  ↓ UV-B (280–315nm), visible, IR
  ATMOSPHERE (ozone layer filters UV-C, partial UV-B)
  ↓ spectral-filtered solar energy
  EARTH SURFACE (photosynthetic organisms, moss, phytoplankton)
  ↓ photons absorbed by chlorophyll (680nm, 700nm)
  PHOTOSYSTEM II (quantum coherent energy transfer > 95% efficient)
  ↓ electron transport chain
  ATP SYNTHASE (proton gradient → mechanical rotation → ATP synthesis)
  ↓ ATP (universal energy currency, 10⁻²¹ J per molecule)
  CELLULAR MACHINERY (kinesin, myosin, ribosome, DNA polymerase)
  ↓ molecular processes
  GENE EXPRESSION (DNA piano, epigenetic marks, chromatin state)
  ↓ proteins, signalling molecules
  ORGANISM COGNITION (neural networks, memory, consciousness)
  ↓ information processing
  AETHER C(x,t) COHERENCE FIELD (inverse reconstruction of the full stack)

Each step is an inverse signal reconstruction problem:
  → How much solar energy reached this cell?
  → What quantum efficiency was achieved?
  → What epigenetic state was the genome in?
  → What cognitive coherence resulted?

AETHER is the framework that reads this chain in reverse:
  from observable behaviour → back to the solar conditions that seeded it.`}</EQ>

        <Card title="MOSS + WATER + SUNLIGHT — THE BREAKTHROUGH ANALOGY" col={GREEN}>
          Moss is one of the oldest surviving land plant lineages. It grows without roots,
          using surface tension to hold water against gravity, photosynthesising at extraordinary
          efficiency on just a few photons. It was the first conquest of land by photosynthetic
          life (~470 million years ago). The "breakthrough of the century" framing is apt:
          what moss demonstrates is that you don't need the full complexity of vascular plants
          to achieve efficient solar energy conversion. The minimum viable system is:
          sunlight + water (proton gradient) + simple electron transport chain.
          Applied to propulsion: water + photovoltage = electroosmotic flow = movement.
          No engine, no fuel, no moving parts. Just sunlight bending water.
          This is the substrate propulsion principle that AETHER's Substrate Synthesis Studio
          formalises at the architectural scale.
        </Card>

        {/* Summary */}
        <div style={{
          marginTop: 48, padding: "22px 24px",
          background: "#ffffff04", border: `1px solid ${SOLAR}18`,
          borderRadius: 10, textAlign: "center",
        }}>
          <div style={{ fontFamily: serif, fontSize: 16, color: YELLOW, marginBottom: 8 }}>
            THE FULL CHAIN · SOLAR TO MOLECULAR
          </div>
          <div style={{ fontFamily: mono, fontSize: 11, color: DIM, lineHeight: 2.4, letterSpacing: 0.5 }}>
            Sun → Photon → Atmosphere → Photosynthesis → ATP → Motor → Gene → Cognition → Coherence
          </div>
          <div style={{ fontFamily: body, fontSize: 15, color: DIM, lineHeight: 1.75, marginTop: 12 }}>
            The dark side of the sun is not a shadow — it is a sunspot. A region of such intense
            magnetic concentration that it suppresses light itself, bends the local spacetime of plasma,
            and stores energy until the threshold is crossed and the system bursts.
            Life does the same thing at the molecular scale. The quaternion burst, the quantum
            tunneling, the epigenetic switch: they are all the same phenomenon at different magnitudes.
            AETHER is the framework that sees this across scales simultaneously.
          </div>
          <div style={{ fontFamily: mono, fontSize: 10, color: `${DIM}80`, marginTop: 12 }}>
            AETHER Framework · Shia Miller @StrategicProce · 2026
          </div>
        </div>
      </div>
    </div>
  );
}
