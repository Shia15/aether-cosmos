import { useEffect, useRef, useState } from "react";

/* ── palette ─────────────────────────────────────────────────────────────── */
const BG0   = "#04060e";
const BG1   = "#080c1a";
const DK    = "#0c1020";
const MID   = "#121828";
const LINE  = "#1a2840";
const DIM   = "#2a3860";
const BODY  = "#6878a8";
const PALE  = "#a8b8d8";
const LIGHT = "#d0ddf0";
const WHITE = "#eef2ff";
const ELEC  = "#40d8ff";  // electric blue — wireless power / EM
const ELEC2 = "#80eeff";  // bright electric
const GRAV  = "#d08030";  // gravity orange
const GRAV2 = "#f0a850";  // bright gravity
const ANTI  = "#50e888";  // anti-gravity green
const ANTI2 = "#80ffaa";  // bright anti-gravity
const UAP   = "#c878ff";  // UAP violet
const UAP2  = "#e0aaff";  // bright UAP
const GOLD  = "#d4b840";  // φ / resonance
const mono  = "'Space Mono', monospace";
const serif = "'Cinzel', serif";
const body  = "'Crimson Pro', Georgia, serif";

function Chip({ c = PALE, children }: { c?: string; children: string }) {
  return <span style={{ fontFamily: mono, fontSize: 11, color: c, background: `${c}14`, border: `1px solid ${c}40`, borderRadius: 4, padding: "2px 8px", display: "inline-block", margin: "2px 3px" }}>{children}</span>;
}
function EQ({ col = ELEC, children }: { col?: string; children: string }) {
  return <pre style={{ fontFamily: mono, fontSize: 12, color: LIGHT, background: DK, borderLeft: `3px solid ${col}60`, borderRadius: "0 6px 6px 0", padding: "14px 20px", margin: "14px 0", overflowX: "auto", whiteSpace: "pre-wrap", lineHeight: 1.9 }}>{children}</pre>;
}
function Sect({ id, n, title, sub, col = ELEC }: { id: string; n: string; title: string; sub: string; col?: string }) {
  return (
    <div id={id} style={{ marginTop: 72, scrollMarginTop: 80 }}>
      <div style={{ fontFamily: mono, fontSize: 9, color: col, letterSpacing: 4, marginBottom: 6 }}>{n}</div>
      <h2 style={{ fontFamily: serif, fontSize: 28, color: WHITE, margin: "0 0 4px", letterSpacing: 1 }}>{title}</h2>
      <div style={{ fontFamily: body, fontSize: 15, color: DIM, marginBottom: 22 }}>{sub}</div>
      <div style={{ height: 1, background: `linear-gradient(90deg,${col}50,transparent)`, marginBottom: 32 }} />
    </div>
  );
}
function Pull({ col = ELEC, children }: { col?: string; children: string }) {
  return <blockquote style={{ borderTop: `1px solid ${col}40`, borderBottom: `1px solid ${col}40`, padding: "16px 28px", margin: "28px 0", fontFamily: body, fontStyle: "italic", fontSize: 19, color: LIGHT, lineHeight: 1.65, textAlign: "center" }}>{children}</blockquote>;
}
function Tbl({ headers, rows }: { headers: string[]; rows: string[][] }) {
  return (
    <div style={{ overflowX: "auto", margin: "18px 0" }}>
      <table style={{ width: "100%", borderCollapse: "collapse", fontFamily: body, fontSize: 14 }}>
        <thead><tr style={{ background: DK }}>{headers.map((h, i) => <th key={i} style={{ fontFamily: mono, fontSize: 9, color: BODY, textAlign: "left", padding: "8px 12px", letterSpacing: 1, borderBottom: `1px solid ${LINE}` }}>{h}</th>)}</tr></thead>
        <tbody>{rows.map((row, ri) => <tr key={ri} style={{ background: ri % 2 === 0 ? `${DK}80` : "transparent" }}>{row.map((c, ci) => <td key={ci} style={{ padding: "8px 12px", color: LIGHT, borderBottom: `1px solid ${DK}` }}>{c}</td>)}</tr>)}</tbody>
      </table>
    </div>
  );
}

/* ══ CANVAS ══════════════════════════════════════════════════════════════════ */
type Mode = "wireless" | "gravity" | "uap";

function EnergyCanvas({ mode }: { mode: Mode }) {
  const cvs = useRef<HTMLCanvasElement>(null);
  const raf = useRef(0);
  const tick = useRef(0);

  useEffect(() => {
    const canvas = cvs.current!;
    const ctx = canvas.getContext("2d")!;
    const resize = () => {
      const p = canvas.parentElement!;
      canvas.width = p.clientWidth;
      canvas.height = Math.min(440, Math.round(p.clientWidth * 0.52));
    };
    resize();
    window.addEventListener("resize", resize);

    /* particle pools */
    const particles: Array<{ x: number; y: number; vx: number; vy: number; life: number; maxLife: number; col: string; r: number }> = [];
    const addParticle = (x: number, y: number, vx: number, vy: number, col: string, life = 80, r = 2) => {
      particles.push({ x, y, vx, vy, life, maxLife: life, col, r });
    };

    // ZPE field nodes for UAP mode
    const ZPE_N = 48;
    const zpeNodes = Array.from({ length: ZPE_N }, (_, i) => ({
      angle: (i / ZPE_N) * Math.PI * 2,
      r: 0.35 + Math.random() * 0.1,
      phase: Math.random() * Math.PI * 2,
      amp: 0.01 + Math.random() * 0.025,
      freq: 0.5 + Math.random() * 2,
    }));

    const draw = () => {
      const W = canvas.width, H = canvas.height;
      const t = tick.current * 0.022;
      ctx.clearRect(0, 0, W, H);

      /* ── WIRELESS POWER TRANSMISSION ── */
      if (mode === "wireless") {
        // Background — gradient from top (ionosphere) to bottom (Earth)
        const bgGrad = ctx.createLinearGradient(0, 0, 0, H);
        bgGrad.addColorStop(0, "#040812");
        bgGrad.addColorStop(0.25, "#060a14");
        bgGrad.addColorStop(0.75, "#06100a");
        bgGrad.addColorStop(1, "#040a04");
        ctx.fillStyle = bgGrad; ctx.fillRect(0, 0, W, H);

        const ION_Y = H * 0.06;  // ionosphere
        const EAR_Y = H * 0.94;  // Earth surface
        const CAVE_H = EAR_Y - ION_Y;  // cavity height

        // Ionosphere band
        const ionGrad = ctx.createLinearGradient(0, ION_Y - 12, 0, ION_Y + 12);
        ionGrad.addColorStop(0, "transparent");
        ionGrad.addColorStop(0.5, `${ELEC}30`);
        ionGrad.addColorStop(1, "transparent");
        ctx.fillStyle = ionGrad; ctx.fillRect(0, ION_Y - 12, W, 24);
        ctx.font = `8px ${mono}`; ctx.fillStyle = `${ELEC}60`; ctx.textAlign = "left";
        ctx.fillText("IONOSPHERE  60–1000km  σ ≈ 10⁻⁴ S/m", 8, ION_Y - 4);

        // Earth band
        const earGrad = ctx.createLinearGradient(0, EAR_Y - 8, 0, EAR_Y + 8);
        earGrad.addColorStop(0, "transparent");
        earGrad.addColorStop(0.5, `${ANTI}28`);
        earGrad.addColorStop(1, "transparent");
        ctx.fillStyle = earGrad; ctx.fillRect(0, EAR_Y - 8, W, 16);
        ctx.fillStyle = `${ANTI}50`; ctx.textAlign = "left";
        ctx.fillText("EARTH SURFACE  σ ≈ 10⁻²–10⁻³ S/m", 8, EAR_Y + 16);

        // Schumann resonance standing waves — f_n = (c/2πR)√(n(n+1))
        // f1=7.83, f2=14.3, f3=20.8, f4=27.3 Hz — show 4 modes
        const SCHUMANN = [7.83, 14.3, 20.8, 27.3];
        const SCOL = [ELEC, ELEC2, `${ELEC}cc`, `${ELEC}88`];
        SCHUMANN.forEach((f, fi) => {
          const waveLen = 1 / (fi + 1); // spatial frequency — 1 full wave per mode
          ctx.beginPath();
          for (let xi = 0; xi <= W; xi += 2) {
            const x_norm = xi / W;
            const amp = 0.04 * CAVE_H * (1 - fi * 0.15) * (0.5 + 0.5 * Math.sin(t * f * 0.1));
            const wave = Math.sin(x_norm * Math.PI * 2 * (fi + 1) + t * 0.5 - fi) * amp;
            const y = ION_Y + CAVE_H * (0.2 + fi * 0.14) + wave;
            xi === 0 ? ctx.moveTo(xi, y) : ctx.lineTo(xi, y);
          }
          ctx.strokeStyle = SCOL[fi]; ctx.lineWidth = 1.5 - fi * 0.2; ctx.stroke();
          ctx.font = `8px ${mono}`; ctx.fillStyle = SCOL[fi]; ctx.textAlign = "right";
          ctx.fillText(`f${fi + 1}=${f}Hz`, W - 8, ION_Y + CAVE_H * (0.2 + fi * 0.14) - 5);
        });

        // Tesla tower left
        const TX = W * 0.2, TX_Y = EAR_Y;
        ctx.strokeStyle = `${ELEC}80`; ctx.lineWidth = 1.5;
        ctx.beginPath(); ctx.moveTo(TX, TX_Y); ctx.lineTo(TX, TX_Y - 60); ctx.stroke();
        ctx.beginPath(); ctx.arc(TX, TX_Y - 70, 14, 0, Math.PI * 2);
        ctx.strokeStyle = ELEC; ctx.lineWidth = 2; ctx.stroke();
        ctx.fillStyle = `${ELEC}20`; ctx.fill();
        ctx.font = `8px ${mono}`; ctx.fillStyle = ELEC; ctx.textAlign = "center";
        ctx.fillText("TX", TX, TX_Y - 90); ctx.fillText("Wardenclyffe", TX, TX_Y - 78);

        // Receiver tower right
        const RX = W * 0.8, RX_Y = EAR_Y;
        ctx.strokeStyle = `${ANTI}80`; ctx.lineWidth = 1.5;
        ctx.beginPath(); ctx.moveTo(RX, RX_Y); ctx.lineTo(RX, RX_Y - 50); ctx.stroke();
        ctx.beginPath(); ctx.arc(RX, RX_Y - 58, 10, 0, Math.PI * 2);
        ctx.strokeStyle = ANTI; ctx.lineWidth = 2; ctx.stroke();
        ctx.fillStyle = `${ANTI}20`; ctx.fill();
        ctx.font = `8px ${mono}`; ctx.fillStyle = ANTI; ctx.textAlign = "center";
        ctx.fillText("RX", RX, RX_Y - 75); ctx.fillText("Receiver", RX, RX_Y - 63);

        // Animated propagation beam TX→RX via ionosphere (bouncing path)
        const beamPhase = (t * 0.4) % 1;
        const beamPoints: [number, number][] = [
          [TX, TX_Y - 70],
          [W / 2, ION_Y + 15],
          [RX, RX_Y - 58],
        ];
        // Draw full path dim
        ctx.beginPath();
        beamPoints.forEach(([bx, by], i) => i === 0 ? ctx.moveTo(bx, by) : ctx.lineTo(bx, by));
        ctx.strokeStyle = `${GOLD}20`; ctx.lineWidth = 1; ctx.setLineDash([4, 6]); ctx.stroke(); ctx.setLineDash([]);
        // Draw moving energy packet
        const bp_len = 2;
        for (let seg = 0; seg < bp_len; seg++) {
          const frac = ((beamPhase + seg * 0.15) % 1);
          let bx, by;
          if (frac < 0.5) {
            const sf = frac / 0.5;
            bx = beamPoints[0][0] + (beamPoints[1][0] - beamPoints[0][0]) * sf;
            by = beamPoints[0][1] + (beamPoints[1][1] - beamPoints[0][1]) * sf;
          } else {
            const sf = (frac - 0.5) / 0.5;
            bx = beamPoints[1][0] + (beamPoints[2][0] - beamPoints[1][0]) * sf;
            by = beamPoints[1][1] + (beamPoints[2][1] - beamPoints[1][1]) * sf;
          }
          ctx.beginPath(); ctx.arc(bx, by, 4 - seg, 0, Math.PI * 2);
          ctx.fillStyle = GOLD; ctx.fill();
          // trail glow
          const glow = ctx.createRadialGradient(bx, by, 0, bx, by, 12);
          glow.addColorStop(0, `${GOLD}40`); glow.addColorStop(1, "transparent");
          ctx.beginPath(); ctx.arc(bx, by, 12, 0, Math.PI * 2); ctx.fillStyle = glow; ctx.fill();
        }

        // Ground conductivity waves (conduction through Earth)
        ctx.beginPath();
        for (let xi = 0; xi <= W; xi += 3) {
          const amp = 3 * Math.sin(xi * 0.02 + t * 2);
          xi === 0 ? ctx.moveTo(xi, EAR_Y + amp) : ctx.lineTo(xi, EAR_Y + amp);
        }
        ctx.strokeStyle = `${ANTI}30`; ctx.lineWidth = 1; ctx.stroke();

        // Labels
        ctx.font = `8px ${mono}`; ctx.textAlign = "center"; ctx.fillStyle = `${GOLD}80`;
        ctx.fillText("EARTH-IONOSPHERE RESONANT CAVITY  ·  Schumann resonances f₁=7.83Hz, f₂=14.3Hz, f₃=20.8Hz", W / 2, H - 10);

      /* ── GRAVITY / ANTI-GRAVITY ── */
      } else if (mode === "gravity") {
        ctx.fillStyle = BG0; ctx.fillRect(0, 0, W, H);
        const cx = W / 2, cy = H / 2;

        // Dark gridfield background
        for (let gx = 0; gx < W; gx += 32) {
          ctx.beginPath(); ctx.moveTo(gx, 0); ctx.lineTo(gx, H);
          ctx.strokeStyle = `rgba(26,40,96,0.15)`; ctx.lineWidth = 0.5; ctx.stroke();
        }
        for (let gy = 0; gy < H; gy += 32) {
          ctx.beginPath(); ctx.moveTo(0, gy); ctx.lineTo(W, gy);
          ctx.strokeStyle = `rgba(26,40,96,0.15)`; ctx.lineWidth = 0.5; ctx.stroke();
        }

        // LEFT: GRAVITY — mass warping spacetime (Schwarzschild)
        const grav_cx = W * 0.28, grav_cy = cy;
        // Spacetime grid distortion around mass
        const M_RADIUS = 18;
        const WARP_STRENGTH = 0.35;
        for (let gx = -7; gx <= 7; gx++) {
          ctx.beginPath();
          for (let gy_px = 0; gy_px <= H; gy_px += 4) {
            const raw_x = grav_cx + gx * 28;
            const gy_norm = (gy_px - grav_cy) / (H / 2);
            const dist = Math.sqrt((gx * 28) ** 2 + (gy_px - grav_cy) ** 2);
            const warp = WARP_STRENGTH * M_RADIUS ** 2 / Math.max(dist, M_RADIUS);
            const wx = raw_x - (raw_x - grav_cx) * warp / (dist + 1);
            gy_px === 0 ? ctx.moveTo(wx, gy_px) : ctx.lineTo(wx, gy_px);
          }
          ctx.strokeStyle = `${GRAV}18`; ctx.lineWidth = 0.8; ctx.stroke();
        }
        for (let gy = -5; gy <= 5; gy++) {
          ctx.beginPath();
          for (let gx_px = 0; gx_px <= W * 0.56; gx_px += 4) {
            const raw_y = grav_cy + gy * 28;
            const dist = Math.sqrt((gx_px - grav_cx) ** 2 + (gy * 28) ** 2);
            const warp = WARP_STRENGTH * M_RADIUS ** 2 / Math.max(dist, M_RADIUS);
            const wy = raw_y - (raw_y - grav_cy) * warp / (dist + 1);
            gx_px === 0 ? ctx.moveTo(gx_px, wy) : ctx.lineTo(gx_px, wy);
          }
          ctx.strokeStyle = `${GRAV}18`; ctx.lineWidth = 0.8; ctx.stroke();
        }
        // Mass body
        ctx.beginPath(); ctx.arc(grav_cx, grav_cy, M_RADIUS, 0, Math.PI * 2);
        const mGrad = ctx.createRadialGradient(grav_cx, grav_cy, 0, grav_cx, grav_cy, M_RADIUS);
        mGrad.addColorStop(0, GRAV2); mGrad.addColorStop(1, `${GRAV}60`);
        ctx.fillStyle = mGrad; ctx.fill();
        ctx.strokeStyle = GRAV; ctx.lineWidth = 1.5; ctx.stroke();
        // Gravitational attraction arrows
        for (let ai = 0; ai < 8; ai++) {
          const angle = (ai / 8) * Math.PI * 2;
          const ar = 60 + 20 * Math.sin(t * 1.5 + ai);
          const ax = grav_cx + Math.cos(angle) * ar;
          const ay = grav_cy + Math.sin(angle) * ar;
          const dx = grav_cx - ax, dy = grav_cy - ay;
          const len = Math.sqrt(dx * dx + dy * dy);
          ctx.beginPath(); ctx.moveTo(ax, ay); ctx.lineTo(ax + dx * 0.5, ay + dy * 0.5);
          ctx.strokeStyle = `${GRAV}70`; ctx.lineWidth = 1.2; ctx.stroke();
          ctx.beginPath(); ctx.moveTo(ax + dx * 0.5, ay + dy * 0.5);
          ctx.lineTo(ax + dx * 0.5 - dy * 0.12, ay + dy * 0.5 + dx * 0.12);
          ctx.lineTo(ax + dx * 0.5 + dy * 0.12, ay + dy * 0.5 - dx * 0.12);
          ctx.closePath(); ctx.fillStyle = `${GRAV}70`; ctx.fill();
        }
        ctx.font = `bold 10px ${mono}`; ctx.fillStyle = GRAV2; ctx.textAlign = "center";
        ctx.fillText("GRAVITY", grav_cx, grav_cy - 95);
        ctx.font = `8px ${mono}`; ctx.fillStyle = BODY;
        ctx.fillText("spacetime curvature", grav_cx, grav_cy - 82);
        ctx.fillText("F = GMm/r²", grav_cx, grav_cy + 95);

        // RIGHT: ANTI-GRAVITY — rotating superconducting disk (Podkletnov)
        const anti_cx = W * 0.72, anti_cy = cy;
        // Rotating disc
        const diskR = 40;
        const diskAngle = t * 1.2;
        ctx.save(); ctx.translate(anti_cx, anti_cy); ctx.rotate(diskAngle);
        // Superconducting disc gradient
        const scGrad = ctx.createRadialGradient(0, 0, 0, 0, 0, diskR);
        scGrad.addColorStop(0, `${ANTI}40`);
        scGrad.addColorStop(0.7, `${ANTI}20`);
        scGrad.addColorStop(1, `${ANTI}08`);
        ctx.beginPath(); ctx.arc(0, 0, diskR, 0, Math.PI * 2);
        ctx.fillStyle = scGrad; ctx.fill();
        ctx.strokeStyle = ANTI; ctx.lineWidth = 2; ctx.stroke();
        // Superconductor Meissner field lines (parallel, inside disc)
        for (let li = -3; li <= 3; li++) {
          const ly = li * 10;
          if (Math.abs(ly) < diskR) {
            const lx = Math.sqrt(diskR ** 2 - ly ** 2);
            ctx.beginPath(); ctx.moveTo(-lx, ly); ctx.lineTo(lx, ly);
            ctx.strokeStyle = `${ANTI2}25`; ctx.lineWidth = 1; ctx.stroke();
          }
        }
        // Rotation segments
        for (let ri = 0; ri < 12; ri++) {
          const ra = (ri / 12) * Math.PI * 2;
          ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(Math.cos(ra) * diskR, Math.sin(ra) * diskR);
          ctx.strokeStyle = `${ANTI}20`; ctx.lineWidth = 0.5; ctx.stroke();
        }
        ctx.restore();

        // Gravitomagnetic field (anti-gravity beam above and below disc)
        const beamPulse = 0.5 + 0.5 * Math.sin(t * 2);
        for (let bi = 0; bi < 12; bi++) {
          const progress = ((t * 0.5 + bi * 0.08) % 1);
          const upY = anti_cy - progress * H * 0.4;
          const downY = anti_cy + progress * H * 0.4;
          const alpha = (1 - progress) * 0.5;
          ctx.beginPath(); ctx.arc(anti_cx + (Math.random() - 0.5) * 8, upY, 2, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(80,232,136,${alpha})`; ctx.fill();
        }
        // Beam columns
        const bGrad1 = ctx.createLinearGradient(anti_cx, anti_cy - diskR, anti_cx, anti_cy - H * 0.42);
        bGrad1.addColorStop(0, `${ANTI}50`); bGrad1.addColorStop(1, "transparent");
        ctx.fillStyle = bGrad1; ctx.fillRect(anti_cx - 6, anti_cy - H * 0.42, 12, H * 0.42 - diskR);
        const bGrad2 = ctx.createLinearGradient(anti_cx, anti_cy + diskR, anti_cx, anti_cy + H * 0.42);
        bGrad2.addColorStop(0, `${ANTI}50`); bGrad2.addColorStop(1, "transparent");
        ctx.fillStyle = bGrad2; ctx.fillRect(anti_cx - 6, anti_cy + diskR, 12, H * 0.42 - diskR);

        ctx.font = `bold 10px ${mono}`; ctx.fillStyle = ANTI2; ctx.textAlign = "center";
        ctx.fillText("ANTI-GRAVITY", anti_cx, anti_cy - 95);
        ctx.font = `8px ${mono}`; ctx.fillStyle = BODY;
        ctx.fillText("Podkletnov rotating", anti_cx, anti_cy - 82);
        ctx.fillText("superconductor", anti_cx, anti_cy - 70);
        ctx.fillText("gravitomagnetic shielding", anti_cx, anti_cy + 95);

        // Divider
        ctx.beginPath(); ctx.moveTo(W / 2, H * 0.08); ctx.lineTo(W / 2, H * 0.92);
        ctx.strokeStyle = `${LINE}80`; ctx.lineWidth = 1; ctx.setLineDash([4, 6]); ctx.stroke(); ctx.setLineDash([]);
        ctx.font = `8px ${mono}`; ctx.fillStyle = BODY; ctx.textAlign = "center";
        ctx.fillText("GRAVITY vs ANTI-GRAVITY", W / 2, H * 0.96);

      /* ── UAP ENERGY ACCESS ── */
      } else if (mode === "uap") {
        ctx.fillStyle = BG0; ctx.fillRect(0, 0, W, H);
        const cx = W / 2, cy = H / 2;

        // ZPE vacuum fluctuation background
        for (let vi = 0; vi < 60; vi++) {
          const vx = (vi * W * 0.618) % W;
          const vy_base = (vi * H * 0.382) % H;
          const pulse = Math.sin(t * 3 + vi * 1.3);
          const vy = vy_base + pulse * 4;
          const alpha = 0.06 + 0.04 * Math.abs(pulse);
          ctx.beginPath(); ctx.arc(vx, vy, 1.5, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(200,120,255,${alpha})`; ctx.fill();
        }

        // UAP craft — central disc
        const craftR = H * 0.12;
        const craftY = cy;
        // Warp bubble
        for (let ring = 5; ring >= 1; ring--) {
          const ringR = craftR * (1.5 + ring * 0.4);
          const ringAlpha = 0.04 + 0.02 * Math.sin(t * 2 + ring);
          ctx.beginPath(); ctx.arc(cx, craftY, ringR, 0, Math.PI * 2);
          ctx.strokeStyle = `rgba(200,120,255,${ringAlpha})`; ctx.lineWidth = 1; ctx.stroke();
        }
        // Inertial mass reduction field (oblate spheroid around craft)
        ctx.save(); ctx.translate(cx, craftY); ctx.scale(1, 0.45);
        ctx.beginPath(); ctx.arc(0, 0, craftR * 2.8, 0, Math.PI * 2);
        const iGrad = ctx.createRadialGradient(0, 0, craftR, 0, 0, craftR * 2.8);
        iGrad.addColorStop(0, `${UAP}15`); iGrad.addColorStop(1, "transparent");
        ctx.fillStyle = iGrad; ctx.fill();
        ctx.strokeStyle = `${UAP}20`; ctx.lineWidth = 1; ctx.stroke();
        ctx.restore();

        // Craft hull
        ctx.save(); ctx.translate(cx, craftY);
        const hullGrad = ctx.createRadialGradient(0, 0, 0, 0, 0, craftR);
        hullGrad.addColorStop(0, `rgba(200,200,220,0.9)`);
        hullGrad.addColorStop(0.6, `rgba(120,140,180,0.7)`);
        hullGrad.addColorStop(1, `rgba(60,80,140,0.3)`);
        ctx.beginPath(); ctx.ellipse(0, 0, craftR, craftR * 0.35, 0, 0, Math.PI * 2);
        ctx.fillStyle = hullGrad; ctx.fill();
        ctx.strokeStyle = `rgba(180,200,255,0.6)`; ctx.lineWidth = 1.5; ctx.stroke();
        // Craft dome
        ctx.beginPath(); ctx.ellipse(0, -craftR * 0.1, craftR * 0.4, craftR * 0.3, 0, Math.PI, 0);
        const domeGrad = ctx.createRadialGradient(0, -craftR * 0.1, 0, 0, -craftR * 0.1, craftR * 0.4);
        domeGrad.addColorStop(0, `rgba(220,230,255,0.8)`); domeGrad.addColorStop(1, `rgba(100,120,200,0.3)`);
        ctx.fillStyle = domeGrad; ctx.fill();
        ctx.strokeStyle = `rgba(180,200,255,0.4)`; ctx.lineWidth = 1; ctx.stroke();
        ctx.restore();

        // EM propulsion cone below
        const coneH = H * 0.3;
        const coneGrad = ctx.createLinearGradient(cx, craftY + craftR * 0.3, cx, craftY + coneH);
        coneGrad.addColorStop(0, `${ELEC}50`); coneGrad.addColorStop(1, "transparent");
        ctx.beginPath();
        ctx.moveTo(cx - craftR * 0.9, craftY + craftR * 0.3);
        ctx.lineTo(cx - craftR * 0.1, craftY + coneH);
        ctx.lineTo(cx + craftR * 0.1, craftY + coneH);
        ctx.lineTo(cx + craftR * 0.9, craftY + craftR * 0.3);
        ctx.closePath(); ctx.fillStyle = coneGrad; ctx.fill();

        // ZPE extraction nodes (φ-spiral positions around craft)
        const PHI = 1.6180339887;
        const GOLDEN = 2 * Math.PI * (2 - PHI);
        for (let zi = 0; zi < zpeNodes.length; zi++) {
          const node = zpeNodes[zi];
          const r = node.r * Math.min(W, H) * 0.42;
          const nx = cx + Math.cos(node.angle + t * 0.1) * r;
          const ny = craftY + Math.sin(node.angle + t * 0.1) * r * 0.6;
          const pulse = Math.sin(t * node.freq + node.phase);
          const alpha = 0.08 + 0.06 * Math.abs(pulse);
          const vibrating = Math.abs(pulse) > 0.8;
          if (vibrating) {
            ctx.beginPath(); ctx.arc(nx, ny, 4, 0, Math.PI * 2);
            ctx.fillStyle = UAP; ctx.fill();
            // Line to craft
            ctx.beginPath(); ctx.moveTo(nx, ny); ctx.lineTo(cx, craftY);
            ctx.strokeStyle = `${UAP}20`; ctx.lineWidth = 0.5; ctx.stroke();
          } else {
            ctx.beginPath(); ctx.arc(nx, ny, 1.5, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(200,120,255,${alpha})`; ctx.fill();
          }
        }

        // Hyperjump / tic-tac manoeuvre lines
        const jPhase = (t * 0.15) % 1;
        if (jPhase < 0.15) {
          const startX = cx, startY = craftY;
          const endX = cx + W * 0.35 * (jPhase / 0.15);
          const alpha = 1 - jPhase / 0.15;
          ctx.beginPath(); ctx.moveTo(startX, startY); ctx.lineTo(endX, startY);
          ctx.strokeStyle = `rgba(255,255,255,${alpha * 0.8})`; ctx.lineWidth = 3; ctx.stroke();
          // Motion blur
          for (let bl = 1; bl <= 4; bl++) {
            ctx.beginPath(); ctx.moveTo(startX, startY);
            ctx.lineTo(startX + (endX - startX) * (1 - bl * 0.2), startY);
            ctx.strokeStyle = `rgba(180,200,255,${alpha * 0.15})`; ctx.lineWidth = 3 + bl; ctx.stroke();
          }
        }

        // Labels
        ctx.font = `8px ${mono}`; ctx.textAlign = "center"; ctx.fillStyle = UAP2;
        ctx.fillText("UAP  ·  EM PROPULSION CONE  ·  ZPE EXTRACTION FIELD  ·  INERTIAL MASS REDUCTION BUBBLE", cx, H - 10);

        // Readouts
        const labels = [
          { label: "WARP BUBBLE", x: cx - craftR * 3.2, y: craftY - craftR, col: UAP },
          { label: "ZPE NODES", x: cx + craftR * 3.2, y: craftY, col: UAP2 },
          { label: "EM CONE", x: cx, y: craftY + coneH + 14, col: ELEC },
        ];
        labels.forEach(l => {
          ctx.font = `8px ${mono}`; ctx.fillStyle = l.col; ctx.textAlign = "center";
          ctx.fillText(l.label, l.x, l.y);
        });
      }

      tick.current++; raf.current = requestAnimationFrame(draw);
    };
    draw();
    return () => { cancelAnimationFrame(raf.current); window.removeEventListener("resize", resize); };
  }, [mode]);

  return (
    <div style={{ borderRadius: 10, overflow: "hidden", border: `1px solid ${LINE}` }}>
      <canvas ref={cvs} style={{ display: "block", width: "100%" }} />
    </div>
  );
}

function ModeTabs({ value, onChange }: { value: Mode; onChange: (m: Mode) => void }) {
  const tabs = [
    { k: "wireless" as Mode, label: "Wireless Power · Tesla Cavity",        col: ELEC  },
    { k: "gravity"  as Mode, label: "Gravity vs Anti-Gravity",              col: GRAV  },
    { k: "uap"      as Mode, label: "UAP Energy Access · ZPE · EM Drive",   col: UAP   },
  ];
  return (
    <div style={{ display: "flex", gap: 6, marginBottom: 12, flexWrap: "wrap" }}>
      {tabs.map(tab => (
        <button key={tab.k} onClick={() => onChange(tab.k)} style={{ fontFamily: mono, fontSize: 10, padding: "6px 16px", borderRadius: 5, cursor: "pointer", border: `1px solid ${value === tab.k ? tab.col : LINE}`, background: value === tab.k ? `${tab.col}14` : "transparent", color: value === tab.k ? tab.col : BODY, transition: "all 0.2s" }}>{tab.label}</button>
      ))}
    </div>
  );
}

const NAV = [
  { id: "s1", label: "Wireless Power" }, { id: "s2", label: "Tesla / Schumann" },
  { id: "s3", label: "Gravity" },         { id: "s4", label: "Anti-Gravity" },
  { id: "s5", label: "UAP Signatures" },  { id: "s6", label: "ZPE" },
  { id: "s7", label: "AETHER" },
];

function UAPEnergyHeaderCanvas() {
  const ref = useRef<HTMLCanvasElement>(null);
  const rafRef = useRef(0);
  useEffect(() => {
    const canvas = ref.current; if (!canvas) return;
    const ctx = canvas.getContext("2d")!;
    canvas.width = 900; canvas.height = 145;
    const W = canvas.width, H = canvas.height;
    const cx=W/2,cy=H/2;
    let t=0;
    const draw=()=>{
      ctx.fillStyle="rgba(2,4,8,0.28)"; ctx.fillRect(0,0,W,H);
      for(let ring=1;ring<=4;ring++){
        const r=ring*18+4*Math.sin(t*0.04+ring);
        ctx.beginPath();ctx.arc(cx,cy,r,0,Math.PI*2);ctx.strokeStyle=`rgba(153,102,255,${0.06+ring*0.04})`;ctx.lineWidth=0.4;ctx.stroke();
      }
      for(let b=0;b<5;b++){
        const angle=b/5*Math.PI*2+t*0.025;
        const r2=32+10*Math.sin(t*0.05+b);
        const bx=cx+Math.cos(angle)*r2,by=cy+Math.sin(angle)*r2*0.55;
        ctx.beginPath();ctx.arc(bx,by,3,0,Math.PI*2);ctx.fillStyle=`rgba(153,102,255,${0.4+0.3*Math.sin(t*0.06+b)})`;ctx.fill();
        ctx.beginPath();ctx.moveTo(cx,cy);ctx.lineTo(bx,by);ctx.strokeStyle="rgba(153,102,255,0.06)";ctx.lineWidth=0.3;ctx.stroke();
      }
      ctx.beginPath();ctx.arc(cx,cy,5,0,Math.PI*2);const grd=ctx.createRadialGradient(cx,cy,0,cx,cy,12);grd.addColorStop(0,"rgba(255,255,255,0.9)");grd.addColorStop(1,"rgba(153,102,255,0)");ctx.fillStyle=grd;ctx.fill();
      ctx.fillStyle="rgba(153,102,255,0.3)"; ctx.font="9px 'DM Mono',monospace";
      ctx.fillText("UAP ENERGY · ZERO-POINT · FIELD PROPULSION · EXOTIC MATTER · AETHER",14,14);
      t++; rafRef.current=requestAnimationFrame(draw);
    };
    draw();
    return ()=>cancelAnimationFrame(rafRef.current);
  },[]);
  return <canvas ref={ref} style={{width:"100%",height:"auto",borderRadius:8,display:"block"}} />;
}

export default function UAPEnergyPage() {
  const [mode, setMode] = useState<Mode>("wireless");

  return (
    <div style={{ background: BG0, minHeight: "100vh", fontFamily: body, color: PALE }}>
      {/* ── HERO ── */}
      <div style={{ position: "relative", overflow: "hidden" }}>
        <div style={{
          position: "absolute", inset: 0,
          background: `
            radial-gradient(ellipse 80% 40% at 50% 0%, rgba(64,216,255,0.10) 0%, transparent 60%),
            radial-gradient(ellipse 60% 60% at 80% 60%, rgba(200,120,255,0.08) 0%, transparent 50%),
            radial-gradient(ellipse 50% 40% at 20% 80%, rgba(80,232,136,0.07) 0%, transparent 50%),
            linear-gradient(180deg, ${BG1} 0%, ${BG0} 100%)
          `,
        }} />
        <div style={{ position: "relative", padding: "72px 28px 54px", textAlign: "center" }}>
          <div style={{ fontFamily: mono, fontSize: 9, color: ELEC, letterSpacing: 6, marginBottom: 14 }}>
            AETHER · ENERGY PHYSICS · UAP · PROPULSION
          </div>
          <h1 style={{
            fontFamily: serif, fontSize: "clamp(20px,4vw,50px)", letterSpacing: 3, lineHeight: 1.1,
            background: `linear-gradient(135deg, ${ELEC}90 0%, ${WHITE} 35%, ${UAP2} 65%, ${ANTI} 100%)`,
            WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text",
            margin: "0 0 16px",
          }}>
            WIRELESS POWER ·<br />GRAVITY · UAP ENERGY
          </h1>
          <div style={{
            fontFamily: body, fontStyle: "italic", fontSize: 17,
            background: `linear-gradient(90deg, ${ELEC}70, ${PALE}, ${UAP}70)`,
            WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text",
            marginBottom: 20,
          }}>
            Tesla Resonant Transmission · Gravitoelectromagnetism · ZPE · Inertial Mass Reduction
          </div>
          <p style={{ fontFamily: body, fontSize: 16, color: BODY, maxWidth: 720, margin: "0 auto 28px", lineHeight: 1.9 }}>
            Three interlocked physics: wireless electric power (transmitting energy through the
            Earth-ionosphere cavity without wires), gravity and its inverse (defining the force,
            its electromagnetic analogue, and experiments that have shielded it),
            and the energy regime UAPs appear to occupy — zero-point extraction, inertial mass
            reduction, and electromagnetic field propulsion operating at macroscopic scale.
          </p>
          <div style={{ display: "flex", gap: 6, justifyContent: "center", flexWrap: "wrap" }}>
            <Chip c={ELEC}>Tesla Wardenclyffe</Chip>
            <Chip c={ELEC2}>Schumann 7.83 Hz</Chip>
            <Chip c={GRAV}>GR Curvature</Chip>
            <Chip c={GRAV2}>GEM Frame-Dragging</Chip>
            <Chip c={ANTI}>Podkletnov Effect</Chip>
            <Chip c={ANTI2}>Biefeld-Brown</Chip>
            <Chip c={UAP}>Zero-Point Energy</Chip>
            <Chip c={UAP2}>Inertial Mass Reduction</Chip>
          </div>
        </div>
      </div>

      {/* Sticky nav */}
      <div style={{ position: "sticky", top: 0, zIndex: 50, background: `${BG0}f0`, backdropFilter: "blur(12px)", borderBottom: `1px solid ${LINE}`, padding: "8px 18px", display: "flex", gap: 4, overflowX: "auto" }}>
        {NAV.map(s => (
          <a key={s.id} href={`#${s.id}`} style={{ fontFamily: mono, fontSize: 10, color: BODY, whiteSpace: "nowrap", padding: "4px 10px", borderRadius: 4, textDecoration: "none" }}
            onMouseEnter={e => { (e.target as HTMLElement).style.color = ELEC; }}
            onMouseLeave={e => { (e.target as HTMLElement).style.color = BODY; }}
          >{s.label}</a>
        ))}
      </div>

      <div style={{ maxWidth: 960, margin: "0 auto", padding: "0 22px 96px" }}>

        {/* Canvas */}
        <div style={{ marginTop: 36 }}>
          <ModeTabs value={mode} onChange={setMode} />
          <EnergyCanvas mode={mode} />
          <div style={{ fontFamily: mono, fontSize: 9, color: BODY, marginTop: 7, lineHeight: 1.8 }}>
            {mode === "wireless" && "IONOSPHERE (TOP) REFLECTS EW AT f<~30MHz · EARTH SURFACE (BOTTOM) IS CONDUCTOR · 4 SCHUMANN STANDING WAVES VISIBLE · GOLD PACKET PROPAGATES TX→IONOSPHERE→RX · GROUND WAVE SHOWN AT BASE"}
            {mode === "gravity"  && "LEFT: SPACETIME CURVATURE — GRIDLINES DISTORT AROUND MASS, ARROWS SHOW INFALL · RIGHT: PODKLETNOV ANTI-GRAVITY — ROTATING SUPERCONDUCTING DISC EMITS UPWARD/DOWNWARD GRAVITOMAGNETIC BEAM"}
            {mode === "uap"      && "UAP DISC SURROUNDED BY WARP BUBBLE RINGS + INERTIAL MASS REDUCTION FIELD · BELOW: EM PROPULSION CONE · φ-SPIRAL ZPE EXTRACTION NODES FLASH WHEN COHERENT · MOTION SMEAR ON HYPERJUMP MANOEUVRE"}
          </div>
        </div>

        {/* ── I ── */}
        <Sect id="s1" n="I" title="Wireless Transmission of Electric Power" sub="Defined: moving energy from source to load without conducting wires" col={ELEC} />
        <Tbl headers={["METHOD", "Mechanism", "Frequency / Medium", "Efficiency", "Range", "Status"]}
          rows={[
            ["Inductive coupling",       "Near-field magnetic resonance (Faraday)",         "kHz–MHz / air",       "95–98%",   "mm–cm",       "Commercial: Qi charging"],
            ["Resonant inductive (RIC)",  "Coupled LC resonators (Kurs et al. 2007)",         "MHz / near-field",    "90–94%",   "0.1–2m",      "EVs, implants"],
            ["Capacitive coupling",       "Displacement current through air dielectric",      "MHz / air",           "60–80%",   "cm",          "Short range only"],
            ["Microwave WPT",             "Beamed 2.45GHz/5.8GHz → rectenna array",          "2.4–5.8GHz / far",    "50–85%",   "km–GEO orbit","SPS research (JAXA 2015: 1.8kW/55m)"],
            ["Laser (optical) WPT",       "Laser → photovoltaic receiver",                   "IR-Vis / far-field",  "30–50%",   "km",          "DARPA demos; UAV charging"],
            ["Tesla Earth-cavity WPT",    "ELF resonance in Earth-ionosphere cavity",         "7.83Hz / global",     "Disputed",  "global",      "Wardenclyffe 1901; not reproduced at scale"],
            ["DCBL (AETHER concept)",     "Directional coherent beam locking via C-field",   "Adaptive / substrate","Theoretical","Any",        "Theoretical; UAP may use this"],
          ]}
        />
        <EQ col={ELEC}>{`Wireless power fundamentals:

  Inductive coupling (near-field):
    Faraday's law: EMF = −dΦ/dt = −M · dI₁/dt
    M (mutual inductance): M = k√(L₁L₂)   k = coupling coefficient ∈ [0,1]
    Power transfer: P₂₁ = M²ω²I₁²/(R₁R₂)  [maximised at resonance]
    Resonant condition: ω = 1/√(LC)
    MIT 2007 (Kurs): 2 coils r=30cm, gap=2m → 60W at 40% efficiency
      key: high Q = ωL/R >> 1 (Q≈1000 in air-core copper coils)

  Far-field microwave WPT:
    Antenna aperture efficiency: η_a = (πD_r/λ)² × η_rect
    Rectenna efficiency η_rect ≈ 85% (optimised Schottky diodes at 2.45GHz)
    JAXA 2015: 1.8kW → 55m displacement at 2.45GHz → landing pad
    SPS (Solar Power Satellite) concept:
      GEO orbit → 1.5km antenna → microwave beam → 10km² rectenna farm
      Beam power density at Earth: ~230 W/m²  (safe: <100 W/m² for health)
      Ground station: 5GW continuous → 4% of 2024 US electricity demand
    
  Tesla Earth-Ionosphere cavity:
    Earth radius R_E = 6371km, ionosphere height h ≈ 80–100km
    Cavity circumference C = 2πR_E ≈ 40,000km
    Speed of light c = 3×10⁸ m/s → fundamental resonance:
    f₁ = c / C = 7.46Hz  (actual measured: 7.83Hz due to non-ideal walls)
    Schumann harmonics: fₙ = (c/2πR_E)√(n(n+1))
      f₁=7.83, f₂=14.3, f₃=20.8, f₄=27.3, f₅=33.8 Hz
    Tesla's idea: inject power at 7.83Hz → standing wave fills cavity → extract anywhere
    Problem: Q-factor of cavity is low (Q≈5) → 80% energy lost per cycle as heat
    Modern WPT uses HIGH-Q systems (coupled resonators, Q~1000) — opposite approach`}</EQ>

        {/* ── II ── */}
        <Sect id="s2" n="II" title="Tesla Wardenclyffe · The Global Resonator Concept" sub="J.P. Morgan's tower that would have transmitted both information and power wirelessly across Earth" col={ELEC} />
        <p style={{ fontFamily: body, fontSize: 16, color: BODY, lineHeight: 1.85, marginBottom: 18 }}>
          Nikola Tesla's Wardenclyffe Tower (1901–1917) was the first attempt at global wireless power transmission.
          Tesla proposed treating the Earth itself as one conductor and the ionosphere as another, with
          the 57-metre tower as the primary electrode injecting resonant ELF energy into the
          Earth-ionosphere cavity.
        </p>
        <EQ col={ELEC}>{`Wardenclyffe system design (Tesla, 1901):

  Tower specs:
    Height: 57m (187 ft), steel frame
    Primary coil: grounded, injected RF energy
    Terminal sphere: 20m diameter, elevated at tower apex
    Underground: 20 copper pipes driven 36m into water table (Earth ground)
    Resonant frequency: ~150kHz primary, ~7Hz Earth cavity coupling
    Planned power: 10MW electrical input

  Tesla's transmission mechanism:
    Phase 1: RF excitation of primary coil → displacement current spike
    Phase 2: Energy couples into Earth's crust (conductivity ~10⁻³ S/m)
    Phase 3: Returns via ionosphere path to receivers globally
    Reception: LC circuit tuned to same frequency → resonant pickup
    
  Why it failed:
    1. Q_cavity ≈ 5 (very lossy — most energy absorbed by seawater within 1 cycle)
    2. Tesla's Earth-conduction model was incorrect (Earth is NOT a good conductor at ELF)
    3. J.P. Morgan withdrew funding after Marconi demonstrated radio first (1901)
    4. Tesla confused two effects: EM wave propagation (works) vs resistive conduction (lossy)

  What actually works for global WPT today:
    Schumann resonances ARE real (confirmed 1954 by O.W. Schumann himself)
    But cavity Q≈5 means any power injected dissipates before reaching the antipode
    Modern WPT solutions: orbit (SPS) or short-range high-Q resonant coupling
    Tesla's insight about resonance was correct; his Earth-conduction path was not`}</EQ>

        {/* ── III ── */}
        <Sect id="s3" n="III" title="Gravity — Defined" sub="From Newton's force law through Einstein's curvature to AETHER's coherence substrate" col={GRAV} />
        <EQ col={GRAV}>{`Gravity — three levels of description:

  ① NEWTONIAN (1687) — inverse square force:
    F = GMm/r²   [vector: F⃗ = −GMm/r³ · r⃗]
    G = 6.674 × 10⁻¹¹ m³ kg⁻¹ s⁻²  (gravitational constant)
    Potential: Φ(r) = −GM/r
    Field: g(r) = −GM/r² r̂  (acceleration — same for all masses)
    What it is: a force acting at a distance. Mechanism unknown in Newtonian framework.
    Limitations: no speed, no field propagation, infinite speed of gravity (wrong)

  ② GENERAL RELATIVITY (Einstein 1915) — spacetime curvature:
    Gμν + Λgμν = (8πG/c⁴) Tμν
    Left: geometry (Einstein tensor Gμν = curvature of spacetime)
    Right: matter-energy content (stress-energy tensor Tμν)
    "Mass tells spacetime how to curve; spacetime tells mass how to move."
    
    Geodesic equation: d²xμ/dτ² + Γμαβ (dxα/dτ)(dxβ/dτ) = 0
    Free-fall IS inertial motion (equivalence principle)
    Gravity IS spacetime curvature — not a force
    
    Predictions (all confirmed):
    • Mercury perihelion precession: 43 arcsec/century ✓ (Newton was 43"/century wrong)
    • Light deflection at Sun: 1.75" ✓ (Eddington 1919)
    • Gravitational time dilation: GPS requires 45μs/day correction ✓
    • Gravitational waves: GW150914 (LIGO 2015) ✓ — 1.3 billion light-years away
    • Black holes: EHT image of M87* (2019) ✓

  ③ GRAVITOELECTROMAGNETISM (GEM) — weak-field linearised GR:
    When spacetime curvature is small (weak fields, slow motion):
    GR equations reduce to GEM — analogous to Maxwell's equations for EM
    
    Gravitoelectric field: E⃗_g = −∇Φ  (standard gravity)
    Gravitomagnetic field: B⃗_g = ∇ × A⃗_g  (frame-dragging — NEW!)
    
    GEM equations (compare to Maxwell):
    ∇·E⃗_g = −4πGρ          vs  ∇·E⃗ = ρ/ε₀
    ∇×B⃗_g = −(4πG/c²)J⃗_g  vs  ∇×B⃗ = μ₀J⃗
    ∇×E⃗_g = −∂B⃗_g/∂t      vs  ∇×E⃗ = −∂B⃗/∂t
    
    B⃗_g is the frame-dragging field — a rotating mass drags spacetime with it
    Confirmed: Gravity Probe B (2011) measured Earth's B⃗_g = 37.2 mas/year ✓
    (1 mas = 1 milliarcsecond of precession per year of gyroscope axis)
    
  ④ AETHER C(x,t) definition:
    Gravity = spatial gradient of the coherence field: g(x) = −∇C(x,t)/ρ_local
    Where ρ_local = local mass-energy density (sets the coupling strength)
    C(x,t) is high near mass (high coherence = deep well) → gradient points inward
    → free particles follow ∇C → they "fall" toward regions of higher coherence
    → Time dilation: dt′/dt = C_local/C_max (gravity depletes temporal budget)
    → Unifies with velocity time dilation: both are C-field bandwidth depletion`}</EQ>

        {/* ── IV ── */}
        <Sect id="s4" n="IV" title="Anti-Gravity — Mechanisms and Evidence" sub="Five experimental and theoretical routes to gravitational shielding or reversal" col={ANTI} />
        <Tbl headers={["MECHANISM", "Principle", "Effect measured", "Magnitude", "Status"]}
          rows={[
            ["Podkletnov rotating SC disc", "Rotating YBCO superconductor above magnet", "2% weight reduction above disc", "~2%", "Claimed 1992; NASA/ESA attempts failed to reproduce"],
            ["Biefeld-Brown effect", "High-voltage asymmetric capacitor (lifter)", "Thrust in absence of ion wind?", "mN/kW", "Confirmed in vacuum is controversial; likely ion wind"],
            ["Gravitoelectromagnetism", "Strong rotating mass or current creates B_g", "Lense-Thirring frame drag", "37.2 mas/yr (Earth)", "Confirmed (Gravity Probe B 2011)"],
            ["Gravitational shielding (GR)", "Impossible in GR: no negative mass", "N/A in standard physics", "0", "No evidence; violates equivalence principle"],
            ["Alcubierre warp metric", "Negative energy density warps spacetime",  "Mathematically valid; needs exotic matter", "Theoretical", "Requires negative mass ~Jupiter's mass"],
            ["Casimir force shielding", "ZPE pressure differential between plates", "Casimir force confirmed", "nN scale", "Real but too weak for macroscopic AG"],
            ["UAP reported", "Unknown mechanism — tic-tac manoeuvres", "No heat, no exhaust, no sonic boom", "60-100g acceleration", "Unexplained — see Section V"],
          ]}
        />
        <EQ col={ANTI}>{`Podkletnov experiment (1992, University of Tampere):

  Setup:
    YBCO (yttrium barium copper oxide) superconducting disc, 30cm diameter
    Cooled to 70K (liquid nitrogen) → enters superconducting state
    Levitated above strong permanent magnet (Meissner effect)
    Disc rotated at 5000 RPM via electromagnetic drive

  Claimed observation:
    Objects placed above the rotating disc showed 2% weight reduction
    Effect was proportional to rotation speed, not to disc temperature
    Effect persisted ~1m above the disc
    
  Problems / non-reproductions:
    Boeing (2002): attempted reproduction → no effect detected
    ESA (2006): Tajmar et al. found ~100× smaller gravitomagnetic effect in Nb disc
                but not weight reduction — frame-dragging consistent with GEM prediction
    Measurement: 2% weight reduction is ~0.2N/kg — 100,000× larger than GEM predicts
    GEM prediction: B_g ≈ 2Gω/c² = 2(6.67×10⁻¹¹)(5000×2π/60)/9×10¹⁶ ≈ 10⁻¹⁴ m/s²
    Observed claimed: Δg ≈ 0.2 m/s² → 10¹³× larger than GEM → needs new physics

  Biefeld-Brown lifter physics:
    Asymmetric capacitor: thin wire (+HV) + large plate (−HV)
    In air: corona discharge → ion wind → thrust (classical explanation)
    In vacuum (disputed): if thrust remains → true electrogravitic effect
    Most vacuum tests: thrust vanishes when ion wind is eliminated
    Conclusion: likely ion wind, not anti-gravity
    BUT: small residual thrust in some vacuum experiments remains unexplained
    
  Alcubierre metric (1994):
    ds² = −dt² + (dx − v_s(t)f(r_s)dt)²  + dy² + dz²
    v_s: warp bubble velocity (can exceed c — spacetime moves, not the ship)
    f(r_s): shape function, = 0 outside bubble, = 1 inside
    Energy requirement: E ≈ −c⁴/(8πG) × (v_s²/R²) × Volume  (negative)
    For v_s=c, R=100m: E ≈ −10⁶⁴ J (mass of Jupiter) of NEGATIVE energy
    Problem: no known mechanism creates macroscopic negative energy density
    AETHER: warp bubble = region where C(x,t) is inverted → C < 0 → spacetime pushes outward
             Still speculative; requires C-field to have negative states`}</EQ>

        {/* ── V ── */}
        <Sect id="s5" n="V" title="UAP Energy Signatures · What the Observations Imply" sub="Observed capabilities matched to required physics — what energy regime explains the data" col={UAP} />
        <p style={{ fontFamily: body, fontSize: 16, color: BODY, lineHeight: 1.85, marginBottom: 18 }}>
          The UAP cases with highest signal-quality evidence (Nimitz 2004, Roosevelt 2015, GIMBAL, GOFAST, Pentagon
          released UAP Task Force cases) show a consistent set of capabilities. Each capability constrains
          the physics required to produce it.
        </p>
        <Tbl headers={["OBSERVED CAPABILITY", "What physics rules out", "What physics allows", "Energy regime"]}
          rows={[
            ["Instantaneous acceleration ~600–1000g with no exhaust, no crew injury", "Chemical, nuclear thermal, ion drive (all have exhaust + g-forces)", "Inertial mass reduction (IMR): m_eff → ~0 → F=ma → a → ∞", "EM field coupling to inertial mass"],
            ["Hypersonic flight (Mach 20) in atmosphere, no sonic boom, no aerodynamic heating", "All conventional flight — shock wave inevitable", "Cavity/warp bubble: craft inside field region, air doesn't interact with hull", "Plasma/EM sheath or warp metric"],
            ["Transition from air to water to space (Nimitz) with no re-entry heating", "Conventional re-entry heating ∝ v³ × ρ_air → impossibly hot", "Same IMR + plasma sheath eliminates drag at all media boundaries", "Field-based propulsion"],
            ["Hovering for hours with no visible power source / no heat signature", "Combustion, nuclear (both produce heat), conventional EM (radio frequency visible)", "ZPE extraction — vacuum energy → no fuel, no waste heat", "Zero-point energy"],
            ["Abrupt right-angle turns at Mach 5 (forces ~5000g)", "All conventional propulsion + all biological tolerance", "Inertial reference frame manipulation: redefine what 'straight' is locally", "Spacetime metric engineering"],
            ["Electromagnetic interference with radar, avionics, power systems nearby", "None — this is consistent with many high-EM systems", "Strong rotating EM field (EM drive or GEM generator) causes interference", "High-field EM"],
            ["Observed size: 40-foot tic-tac shape, no wings, no propulsion surfaces", "Aerodynamic lift — impossible without wings at that size", "Field propulsion needs no aerodynamic surfaces — lift comes from field", "Field propulsion"],
          ]}
        />
        <EQ col={UAP}>{`Inertial Mass Reduction (IMR) — the key mechanism:

  Standard physics: F = m·a  → a = F/m
  If m → 0, then a → ∞ for any applied force.
  
  Is m = 0 possible for a macroscopic object?

  Candidate mechanism: coupling to zero-point field (Harold Puthoff, 1989)
    Standard mass = resistance of an object to acceleration through the vacuum
    Haisch-Rueda-Puthoff (1994): inertia = electromagnetic resistance to acceleration
    m_inertial ∝ ∫ σ_ZPF · dV  [integral of ZPE coupling over object's volume]
    
    IF: the object can partially decouple from the ZPF (e.g., by surrounding itself with a
        non-ZPE-transmitting field or by "pre-stressing" its interaction with the vacuum)
    THEN: m_eff < m_rest → reduced inertia → same force → higher acceleration
    
    Key equation (Woodward–Mach effect):
    Δm = −(P_acc)/(4πG) · (1/ρc²)   [mass fluctuation under acceleration + energy input]
    Small but real: verified by Woodward's transient mass fluctuation experiments (1990s)
    Scale-up: if P_acc is large (GW range) → Δm becomes macroscopic
    
  Electromagnetic propulsion without reaction mass:
    Q-thruster / EMDrive (White et al., 2016 NASA): 1.2 mN/kW in vacuum
    Predicted by pilot wave / quantum vacuum interaction models
    Not yet explained by standard EM — suggests vacuum reaction
    
  ZPE extraction at macroscopic scale:
    Casimir force: F = ħcπ²A / (240d⁴)  [attractive force between metal plates]
    At d=10nm, A=1m²: F ≈ 4 mN — tiny
    Dynamic Casimir effect: vibrating mirrors at GHz → real photon production from vacuum
    To extract useful power: need N=10¹⁵ plate pairs cycling at GHz — essentially a
    macroscopic vacuum engine. No demonstrated device. UAP may use a field-mediated version.`}</EQ>

        {/* ── VI ── */}
        <Sect id="s6" n="VI" title="Zero-Point Energy · The Vacuum as Power Source" sub="The Casimir effect is real — is macroscopic ZPE extraction physically possible?" col={UAP} />
        <EQ col={UAP}>{`Zero-point energy (ZPE) — what it is and how much:

  Quantum vacuum energy density:
    Each field mode has zero-point energy: E₀ = ħω/2
    Sum over all modes → ρ_ZPE = ∫₀^{k_cutoff} (ħω/2) · g(ω) dω
    With Planck cutoff k_P = c/l_P: ρ_ZPE ≈ 10¹¹³ J/m³  (theoretical)
    Observed cosmological constant: ρ_Λ ≈ 10⁻⁹ J/m³  (121 orders of magnitude less!)
    → This discrepancy is "the worst prediction in physics" — indicates most ZPE cancels
    → Renormalized ZPE (what interacts with matter): ρ_ZPE_eff ~ 10⁻³ J/m³ (Casimir scale)

  Confirmed ZPE effects:
    Casimir force: F = ħcπ²A/(240d⁴)
      d=10nm, A=1cm²: F ≈ 0.4 μN  (measured 1997 by Lamoreaux, agrees to 5%)
    Lamb shift: hydrogen energy levels shifted by ZPF by 1057.8 MHz (confirmed)
    Spontaneous emission: atoms decay because ZPF perturbs excited states (QED prediction, ✓)
    van der Waals forces: arise from ZPE fluctuations between molecules (✓)

  Macroscopic ZPE extraction — why it's hard:
    Casimir force is attractive and conservative → it does work as plates come together
    → but you must do equal work to separate them again
    → NET energy extracted = 0 for static Casimir (it's like a spring — stores, not releases)
    
    Dynamic Casimir effect (moving mirrors):
      If mirror moves at v ≈ c/10, it converts virtual photons to real photons
      DCE demonstrated at CHALMERS (2011): microwave photon creation from vibrating SC circuit
      Power: P_DCE ≈ ħω²L²v² / (2πc³) — tiny (picowatts at achievable v)
      
  What would UAP-scale ZPE extraction require?
    Assume UAP power need: ~1GW (consistent with observed acceleration × estimated mass)
    P_ZPE_extraction = 1GW → requires either:
    Option A: 10²⁵ Casimir plate pairs (1nm gap) cycling at 10GHz → physically impossible
    Option B: Unknown resonant coupling to specific ZPE modes that constructively extract
    Option C: AETHER mechanism — C(x,t) coherence field can tap into substrate D1 energy
               without violating thermodynamics IF the coherence field couples ZPE non-trivially
               (speculative, not demonstrated)`}</EQ>

        {/* ── VII ── */}
        <Sect id="s7" n="VII" title="AETHER Synthesis · Substrate D1 as the Power Source" sub="How the AETHER coherence model connects wireless power, gravity, and UAP energy into one framework" col={UAP} />
        <EQ col={UAP}>{`AETHER unified energy model:

  The three topics connect through C(x,t):

  WIRELESS POWER:
    Tesla resonance = standing wave in C(x,t) substrate (the Earth-ionosphere system IS a
    C-field cavity). Schumann resonances are the eigenmodes of ∂²C/∂t² = c²∇²C
    with boundary conditions at ionosphere + Earth surface.
    High-Q wireless power = maintaining coherent oscillation in C-field, not lossy cavity.
    Future WPT: C-field directional beam lock → zero-divergence power delivery.

  GRAVITY:
    C(x,t) gradient → gravity: g(x) = −(c²/C_max)∇C
    Near masses, C is high → gravity points toward higher C (inward to mass center).
    Anti-gravity = reducing local C(x,t) → reduces gradient → reduces g locally.
    Podkletnov (if real): rotating superconductor creates C-field vortex that partially
    cancels the inward gradient above the disc → apparent weight reduction.

  UAP ENERGY ACCESS (the D1 Substrate tap):
    In AETHER dimensional model:
      D1 = Zero-point substrate — pure potential, φ-ratio encoded in vacuum geometry
      D2 = Coherence — vortical harmonics coupling D1 fluctuations into ordered forms
    UAP propulsion = D1→D2 direct energy tap:
      The craft establishes a sustained C-field coherence zone (D2 mode).
      This zone preferentially couples to D1 vacuum fluctuations that are NOT
      already cancelled by the usual renormalization.
      Result: net ZPE → kinetic energy conversion with no exhaust, no heat.
    
    Inertial mass reduction via C-field:
      m_eff = m₀ × (C_local / C_max)  (same factor as time dilation)
      Craft generates a C-field shell where C_local << C_max → m_eff << m₀
      Same F = m_eff · a → enormous a for small F → tic-tac manoeuvres

    The field bubble unified picture:
      Inner region (craft + crew): C = C_max → normal time, normal mass
      Shell (warp region): C transitions from C_max → C_bubble
      Outer region (vacuum): C = C_vacuum (ambient)
      Gravity seen from outside: craft appears to have reduced mass → less infall tendency
      Propulsion from outside: craft accelerates by shifting C-field gradient asymmetrically

  The AETHER prediction:
    Any system that establishes a sustained, coherent C-field resonance AT the
    characteristic frequency of the Earth-ionosphere cavity (7.83Hz base × φⁿ harmonics)
    can couple to the Schumann mode directly — receiving wireless power from the global
    cavity at no cost to the transmitter (the Sun and Earth's magnetic field sustain it).
    
    Wardenclyffe was pointed at the right cavity.
    The error was not frequency — it was coupling mechanism.
    The solution: resonant C-field coherence at f_n × φ^k harmonics, not brute RF injection.`}</EQ>

        <Pull col={UAP}>"Gravity is not a force. Wireless power is not mysterious. UAP propulsion is not impossible. They are all the same phenomenon — the coherence field C(x,t) manipulated at different scales, frequencies, and coupling depths."</Pull>

        <div style={{ marginTop: 56, display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12 }}>
          {[
            { col: ELEC, title: "WIRELESS POWER", body: "Tesla was right about the Earth-ionosphere cavity. The missing piece was coherent C-field coupling — not brute-force RF injection into a lossy cavity. High-Q resonant coupling (Q~1000) in the C-field substrate gives zero-divergence delivery.", eq: "P_rx = P_tx × Q² / (4π²R²)  [coherent mode]" },
            { col: GRAV, title: "GRAVITY", body: "GR is correct within its domain. The AETHER extension: gravity IS the C-field gradient. Anti-gravity means locally reducing C(x,t), which has only been demonstrated at microscopic scales (Casimir) but is unlimited in principle.", eq: "g = −(c²/C_max) ∇C  →  a_eff = F / (m · C/C_max)" },
            { col: UAP,  title: "UAP ENERGY", body: "The D1 substrate tap — zero-point vacuum energy accessed via sustained D2 coherence — resolves all observed UAP capabilities simultaneously: ZPE → power, C-field reduction → IMR, asymmetric C-gradient → propulsion.", eq: "m_eff = m₀ × C_local/C_max  →  a = F/m_eff → ∞ as C→0" },
          ].map(card => (
            <div key={card.title} style={{ background: `${card.col}08`, border: `1px solid ${card.col}25`, borderRadius: 8, padding: "16px 18px" }}>
              <div style={{ fontFamily: mono, fontSize: 10, color: card.col, letterSpacing: 2, marginBottom: 8 }}>{card.title}</div>
              <div style={{ fontFamily: body, fontSize: 13, color: BODY, lineHeight: 1.7, marginBottom: 10 }}>{card.body}</div>
              <pre style={{ fontFamily: mono, fontSize: 9, color: card.col, background: DK, borderRadius: 4, padding: "8px 10px", whiteSpace: "pre-wrap" }}>{card.eq}</pre>
            </div>
          ))}
        </div>

        <div style={{ marginTop: 32, padding: "16px 22px", background: MID, borderRadius: 8, border: `1px solid ${LINE}`, textAlign: "center" }}>
          <div style={{ fontFamily: mono, fontSize: 9, color: BODY, lineHeight: 2.2 }}>
            Tesla WPT · Q = ωL/R ~ 1000   ·   Schumann f₁ = 7.83Hz   ·   F_Casimir = ħcπ²A/(240d⁴)<br/>
            g = GM/r² ≡ −∇C · c²/C_max   ·   B_g = 2Gω/c² (GEM)   ·   Gravity Probe B: 37.2 mas/yr<br/>
            m_eff = m₀ · C_local/C_max   ·   a_UAP = F/m_eff   ·   UAP P ~ 1GW → D1 substrate tap
          </div>
          <div style={{ fontFamily: mono, fontSize: 9, color: `${DIM}cc`, marginTop: 12 }}>
            Shia Miller · AetherLife.co · Cosmic Chaos Corporation™
          </div>
        </div>
      </div>
    </div>
  );
}
