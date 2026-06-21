import { useEffect, useRef, useState } from "react";

/* ── palette ─────────────────────────────────────────────────────────────── */
const BG0   = "#030810";
const BG1   = "#05101a";
const SURF  = "#07142a";
const MID   = "#0b1c38";
const LINE  = "#122040";
const DIM   = "#1e3460";
const BODY  = "#5878a8";
const PALE  = "#98b0d8";
const LIGHT = "#c8d8f0";
const WHITE = "#e8f2ff";

const TIDE  = "#2090d8";   // ocean blue
const TIDE2 = "#50b8f0";   // bright water
const MOON  = "#c0d4f8";   // lunar silver
const MOON2 = "#e0ecff";   // bright moon
const SAND  = "#c89858";   // beach sand
const SAND2 = "#e8c070";   // bright sand
const BIO   = "#48d880";   // biology green
const BIO2  = "#80f0a8";   // bright bio
const BORE  = "#f04848";   // tidal bore red
const GOLD  = "#d4b840";   // φ gold

const mono  = "'Space Mono', monospace";
const serif = "'Cinzel', serif";
const body  = "'Crimson Pro', Georgia, serif";

/* ── small components ───────────────────────────────────────────────────── */
function Chip({ c = PALE, children }: { c?: string; children: string }) {
  return <span style={{ fontFamily: mono, fontSize: 11, color: c, background: `${c}14`, border: `1px solid ${c}40`, borderRadius: 4, padding: "2px 8px", display: "inline-block", margin: "2px 3px" }}>{children}</span>;
}
function EQ({ col = TIDE, children }: { col?: string; children: string }) {
  return <pre style={{ fontFamily: mono, fontSize: 12, color: LIGHT, background: SURF, borderLeft: `3px solid ${col}60`, borderRadius: "0 6px 6px 0", padding: "14px 20px", margin: "14px 0", overflowX: "auto", whiteSpace: "pre-wrap", lineHeight: 1.9 }}>{children}</pre>;
}
function Sect({ id, n, title, sub, col = TIDE }: { id: string; n: string; title: string; sub: string; col?: string }) {
  return (
    <div id={id} style={{ marginTop: 72, scrollMarginTop: 80 }}>
      <div style={{ fontFamily: mono, fontSize: 9, color: col, letterSpacing: 4, marginBottom: 6 }}>{n}</div>
      <h2 style={{ fontFamily: serif, fontSize: 28, color: WHITE, margin: "0 0 4px", letterSpacing: 1 }}>{title}</h2>
      <div style={{ fontFamily: body, fontSize: 15, color: DIM, marginBottom: 22 }}>{sub}</div>
      <div style={{ height: 1, background: `linear-gradient(90deg,${col}50,transparent)`, marginBottom: 32 }} />
    </div>
  );
}
function Pull({ col = TIDE, children }: { col?: string; children: string }) {
  return <blockquote style={{ borderTop: `1px solid ${col}40`, borderBottom: `1px solid ${col}40`, padding: "16px 28px", margin: "28px 0", fontFamily: body, fontStyle: "italic", fontSize: 19, color: LIGHT, lineHeight: 1.65, textAlign: "center" }}>{children}</blockquote>;
}
function Tbl({ headers, rows, col = TIDE }: { headers: string[]; rows: string[][]; col?: string }) {
  return (
    <div style={{ overflowX: "auto", margin: "18px 0" }}>
      <table style={{ width: "100%", borderCollapse: "collapse", fontFamily: body, fontSize: 14 }}>
        <thead><tr style={{ background: SURF }}>{headers.map((h, i) => <th key={i} style={{ fontFamily: mono, fontSize: 9, color: BODY, textAlign: "left", padding: "8px 12px", letterSpacing: 1, borderBottom: `1px solid ${LINE}` }}>{h}</th>)}</tr></thead>
        <tbody>{rows.map((row, ri) => <tr key={ri} style={{ background: ri % 2 === 0 ? `${SURF}80` : "transparent" }}>{row.map((c, ci) => <td key={ci} style={{ padding: "8px 12px", color: LIGHT, borderBottom: `1px solid ${LINE}` }}>{c}</td>)}</tr>)}</tbody>
      </table>
    </div>
  );
}

/* ── tidal constituents data ────────────────────────────────────────────── */
const CONSTITUENTS = [
  { name: "M2",  desc: "Principal lunar semidiurnal", period: 12.42, amp: 1.000, phase: 0,    col: TIDE2  },
  { name: "S2",  desc: "Principal solar semidiurnal",  period: 12.00, amp: 0.465, phase: 0.3,  col: MOON   },
  { name: "N2",  desc: "Larger lunar elliptic",        period: 12.66, amp: 0.192, phase: 0.8,  col: BIO2   },
  { name: "K1",  desc: "Lunisolar diurnal",             period: 23.93, amp: 0.531, phase: 1.2,  col: SAND2  },
  { name: "O1",  desc: "Principal lunar diurnal",       period: 25.82, amp: 0.377, phase: 2.1,  col: GOLD   },
  { name: "K2",  desc: "Lunisolar semidiurnal",         period: 11.97, amp: 0.125, phase: 0.5,  col: BIO    },
];

/* ── canvas modes ───────────────────────────────────────────────────────── */
type Mode = "harmonics" | "movement" | "current";

function TidalCanvas({ mode }: { mode: Mode }) {
  const cvs = useRef<HTMLCanvasElement>(null);
  const raf = useRef(0);
  const tick = useRef(0);

  useEffect(() => {
    const canvas = cvs.current!;
    const ctx = canvas.getContext("2d")!;
    const resize = () => {
      const p = canvas.parentElement!;
      canvas.width = p.clientWidth;
      canvas.height = Math.min(460, Math.round(p.clientWidth * 0.5));
    };
    resize();
    window.addEventListener("resize", resize);

    /* organism particles for movement mode */
    type Org = { x: number; y: number; type: "crab"|"bird"|"fish"|"plankton"; phase: number; baseY: number };
    const orgs: Org[] = [];
    const TYPES: Org["type"][] = ["crab","bird","fish","plankton"];
    for (let i = 0; i < 28; i++) {
      orgs.push({ x: Math.random(), y: 0, type: TYPES[i % 4], phase: Math.random() * Math.PI * 2, baseY: 0.4 + Math.random() * 0.5 });
    }

    /* current field nodes */
    const GRID_W = 12, GRID_H = 7;
    const currentNodes = Array.from({ length: GRID_W * GRID_H }, (_, i) => ({
      col: i % GRID_W, row: Math.floor(i / GRID_W),
      phase: Math.random() * Math.PI * 2,
    }));

    const draw = () => {
      const W = canvas.width, H = canvas.height;
      const t = tick.current * 0.016; // real-time seconds → tidal hours (sped up)
      const tidalHour = t * 3; // 1 real second = 3 tidal hours

      ctx.clearRect(0, 0, W, H);

      /* ═══ MODE: HARMONICS ═══════════════════════════════════════════════ */
      if (mode === "harmonics") {
        ctx.fillStyle = BG0; ctx.fillRect(0, 0, W, H);

        const PAD_L = 55, PAD_R = 20, PAD_T = 16, PAD_B = 36;
        const chartW = W - PAD_L - PAD_R;
        const rowH = (H - PAD_T - PAD_B) / (CONSTITUENTS.length + 1);
        const HOURS_SHOWN = 72; // 3 days

        /* Grid */
        ctx.strokeStyle = `rgba(18,32,64,0.8)`; ctx.lineWidth = 0.5;
        for (let h = 0; h <= HOURS_SHOWN; h += 12) {
          const x = PAD_L + (h / HOURS_SHOWN) * chartW;
          ctx.beginPath(); ctx.moveTo(x, PAD_T); ctx.lineTo(x, H - PAD_B); ctx.stroke();
          ctx.font = `8px ${mono}`; ctx.fillStyle = `${BODY}80`; ctx.textAlign = "center";
          if (h % 24 === 0) ctx.fillText(`${h}h`, x, H - PAD_B + 14);
        }

        /* Day markers */
        for (let d = 0; d <= 3; d++) {
          const x = PAD_L + (d * 24 / HOURS_SHOWN) * chartW;
          ctx.font = `8px ${mono}`; ctx.fillStyle = `${MOON}50`; ctx.textAlign = "center";
          if (d > 0) ctx.fillText(`Day ${d}`, x, H - PAD_B + 26);
        }

        /* Individual constituent rows */
        CONSTITUENTS.forEach((c, ci) => {
          const centerY = PAD_T + (ci + 0.5) * rowH;
          const ampPx = rowH * 0.38;

          ctx.beginPath();
          for (let px = 0; px <= chartW; px += 2) {
            const h = (px / chartW) * HOURS_SHOWN;
            const rad = (h / c.period) * Math.PI * 2 + c.phase;
            const y = centerY - Math.sin(rad) * ampPx * c.amp;
            px === 0 ? ctx.moveTo(PAD_L + px, y) : ctx.lineTo(PAD_L + px, y);
          }
          ctx.strokeStyle = c.col; ctx.lineWidth = 1.2; ctx.stroke();

          /* Label */
          ctx.font = `bold 9px ${mono}`; ctx.fillStyle = c.col; ctx.textAlign = "right";
          ctx.fillText(c.name, PAD_L - 5, centerY + 3);
          ctx.font = `7px ${mono}`; ctx.fillStyle = `${c.col}60`; ctx.textAlign = "right";
          ctx.fillText(`${c.period}h`, PAD_L - 5, centerY + 13);
        });

        /* Composite tide row at bottom */
        const compY = PAD_T + (CONSTITUENTS.length + 0.5) * rowH;
        const compAmpPx = rowH * 0.42;

        ctx.beginPath();
        for (let px = 0; px <= chartW; px += 1) {
          const h = (px / chartW) * HOURS_SHOWN;
          let tide = 0;
          CONSTITUENTS.forEach(c => { tide += c.amp * Math.sin((h / c.period) * Math.PI * 2 + c.phase); });
          tide /= CONSTITUENTS.reduce((s, c) => s + c.amp, 0); // normalise
          const y = compY - tide * compAmpPx;
          px === 0 ? ctx.moveTo(PAD_L + px, y) : ctx.lineTo(PAD_L + px, y);
        }
        ctx.strokeStyle = WHITE; ctx.lineWidth = 2; ctx.stroke();

        ctx.font = `bold 9px ${mono}`; ctx.fillStyle = WHITE; ctx.textAlign = "right";
        ctx.fillText("SUM", PAD_L - 5, compY + 3);

        /* Moving "now" cursor */
        const nowH = (tidalHour % HOURS_SHOWN);
        const nowX = PAD_L + (nowH / HOURS_SHOWN) * chartW;
        ctx.beginPath(); ctx.moveTo(nowX, PAD_T); ctx.lineTo(nowX, H - PAD_B);
        ctx.strokeStyle = `${GOLD}70`; ctx.lineWidth = 1.5; ctx.setLineDash([3, 4]); ctx.stroke(); ctx.setLineDash([]);
        ctx.font = `8px ${mono}`; ctx.fillStyle = GOLD; ctx.textAlign = "center";
        ctx.fillText("NOW", nowX, PAD_T - 4);

        /* Current composite value indicator */
        let nowTide = 0;
        CONSTITUENTS.forEach(c => { nowTide += c.amp * Math.sin((nowH / c.period) * Math.PI * 2 + c.phase); });
        nowTide /= CONSTITUENTS.reduce((s, c) => s + c.amp, 0);
        const tidePct = Math.round((nowTide + 1) * 50);
        ctx.font = `8px ${mono}`; ctx.fillStyle = nowTide > 0 ? TIDE2 : SAND;
        ctx.textAlign = "center";
        ctx.fillText(nowTide > 0 ? `▲ HIGH ${tidePct}%` : `▼ LOW ${tidePct}%`, nowX, H - PAD_B + 26);

        /* Title */
        ctx.font = `8px ${mono}`; ctx.fillStyle = `${BODY}80`; ctx.textAlign = "left";
        ctx.fillText("TIDAL HARMONIC CONSTITUENTS  ·  M2+S2+N2+K1+O1+K2 superposition  ·  3-day window", PAD_L, H - 4);

      /* ═══ MODE: MOVEMENT ════════════════════════════════════════════════ */
      } else if (mode === "movement") {

        /* Composite tide at current time */
        let nowTide = 0;
        CONSTITUENTS.forEach(c => { nowTide += c.amp * Math.sin((tidalHour / c.period) * Math.PI * 2 + c.phase); });
        nowTide /= CONSTITUENTS.reduce((s, c) => s + c.amp, 0); // -1..+1
        const tideNorm = (nowTide + 1) / 2; // 0=low, 1=high

        /* Sky */
        const skyGrad = ctx.createLinearGradient(0, 0, 0, H * 0.3);
        skyGrad.addColorStop(0, "#040c18"); skyGrad.addColorStop(1, "#081428");
        ctx.fillStyle = skyGrad; ctx.fillRect(0, 0, W, H * 0.3);

        /* Moon */
        const moonPhase = (tidalHour / (24.84 * 29.5)) * Math.PI * 2; // synodic
        const moonX = W * 0.78 + Math.cos(moonPhase) * W * 0.1;
        const moonY = H * 0.1 + Math.sin(moonPhase) * H * 0.05;
        const moonGlow = ctx.createRadialGradient(moonX, moonY, 0, moonX, moonY, 28);
        moonGlow.addColorStop(0, `${MOON}60`); moonGlow.addColorStop(1, "transparent");
        ctx.beginPath(); ctx.arc(moonX, moonY, 28, 0, Math.PI * 2); ctx.fillStyle = moonGlow; ctx.fill();
        ctx.beginPath(); ctx.arc(moonX, moonY, 11, 0, Math.PI * 2);
        const mGrad = ctx.createRadialGradient(moonX - 3, moonY - 3, 0, moonX, moonY, 11);
        mGrad.addColorStop(0, MOON2); mGrad.addColorStop(1, `${MOON}aa`);
        ctx.fillStyle = mGrad; ctx.fill();

        /* Beach profile: intertidal zone cross-section */
        const SHORE_L = W * 0.12;  // left = deep sea
        const SHORE_R = W * 0.92;  // right = cliff / dry land

        /* Sea-floor profile: gently sloped beach */
        const seaBed = (x: number) => {
          const prog = (x - SHORE_L) / (SHORE_R - SHORE_L); // 0=sea, 1=land
          return H * (0.3 + 0.55 * Math.pow(prog, 0.7));
        };

        /* Dynamic water surface: tide raises the water table */
        const baseWaterY = H * 0.5;
        const tideRange = H * 0.25;
        const waterY = baseWaterY - tideNorm * tideRange; // rises when high

        /* Find waterline x (where water surface meets beach) */
        let waterlineX = SHORE_L;
        for (let wx = SHORE_L; wx <= SHORE_R; wx += 2) {
          if (seaBed(wx) <= waterY) waterlineX = wx;
          else break;
        }

        /* Sea floor fill */
        ctx.beginPath(); ctx.moveTo(0, H);
        ctx.lineTo(SHORE_L, H); ctx.lineTo(SHORE_L, seaBed(SHORE_L));
        for (let x = SHORE_L; x <= waterlineX; x += 4) ctx.lineTo(x, seaBed(x));
        ctx.lineTo(waterlineX, H); ctx.closePath();
        const sandGrad = ctx.createLinearGradient(0, H * 0.6, 0, H);
        sandGrad.addColorStop(0, `${SAND}40`); sandGrad.addColorStop(1, `${SAND}18`);
        ctx.fillStyle = sandGrad; ctx.fill();

        /* Dry land (above waterline) */
        ctx.beginPath(); ctx.moveTo(waterlineX, waterY);
        for (let x = waterlineX; x <= SHORE_R; x += 4) ctx.lineTo(x, seaBed(x));
        ctx.lineTo(SHORE_R, H); ctx.lineTo(waterlineX, H); ctx.closePath();
        const landGrad = ctx.createLinearGradient(0, H * 0.5, 0, H);
        landGrad.addColorStop(0, `${SAND}70`); landGrad.addColorStop(1, `${SAND}30`);
        ctx.fillStyle = landGrad; ctx.fill();

        /* Water body */
        ctx.beginPath();
        ctx.moveTo(0, waterY);
        ctx.lineTo(waterlineX, waterY);
        for (let x = waterlineX; x >= 0; x -= 4) ctx.lineTo(x, waterY);
        ctx.lineTo(0, H); ctx.closePath();
        const waterGrad = ctx.createLinearGradient(0, waterY, 0, H);
        waterGrad.addColorStop(0, `${TIDE}55`);
        waterGrad.addColorStop(0.5, `${TIDE}30`);
        waterGrad.addColorStop(1, `${TIDE}15`);
        ctx.fillStyle = waterGrad; ctx.fill();

        /* Wave surface animation */
        ctx.beginPath();
        for (let wx = 0; wx <= waterlineX; wx += 3) {
          const wave = Math.sin(wx * 0.04 + t * 4) * 2.5 + Math.sin(wx * 0.07 - t * 3) * 1.5;
          wx === 0 ? ctx.moveTo(wx, waterY + wave) : ctx.lineTo(wx, waterY + wave);
        }
        ctx.strokeStyle = `${TIDE2}60`; ctx.lineWidth = 1.5; ctx.stroke();

        /* Tidal current arrow */
        const isFlood = nowTide < Math.sin((tidalHour - 0.5) / 12.42 * Math.PI); // rising = flood
        const flowDir = isFlood ? 1 : -1; // flood = rightward (landward), ebb = leftward
        const flowStrength = Math.abs(Math.cos((tidalHour / 12.42) * Math.PI * 2)) * 0.7 + 0.3;
        for (let ai = 0; ai < 5; ai++) {
          const arrowX = W * (0.1 + ai * 0.15);
          if (arrowX > waterlineX) break;
          const arrowY = waterY + (seaBed(arrowX) - waterY) * 0.5;
          const arrowLen = 22 * flowStrength;
          ctx.save();
          ctx.translate(arrowX, arrowY);
          ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(arrowLen * flowDir, 0);
          ctx.strokeStyle = `${TIDE2}80`; ctx.lineWidth = 1.5; ctx.stroke();
          ctx.beginPath(); ctx.moveTo(arrowLen * flowDir, 0);
          ctx.lineTo(arrowLen * flowDir - 5 * flowDir, -4);
          ctx.lineTo(arrowLen * flowDir - 5 * flowDir, 4);
          ctx.closePath(); ctx.fillStyle = TIDE2; ctx.fill();
          ctx.restore();
        }

        /* Organisms — move with tide */
        orgs.forEach(org => {
          const worldX = SHORE_L + org.x * (SHORE_R - SHORE_L);
          const bedY = seaBed(worldX);
          let screenX = worldX, screenY = bedY - 6;

          if (org.type === "fish") {
            // fish are in the water, depth-dependent
            if (worldX > waterlineX - 20) return; // out of water
            screenY = waterY + (bedY - waterY) * 0.4 + Math.sin(t * 1.5 + org.phase) * 8;
            // fish follow flood/ebb
            org.x = ((org.x + flowDir * 0.0003 * flowStrength) + 1) % 1;
          } else if (org.type === "plankton") {
            if (worldX > waterlineX - 10) return;
            const depth = (bedY - waterY);
            screenY = waterY + depth * (0.2 + 0.5 * Math.random()) + Math.sin(t * 2 + org.phase) * 6;
            org.x = ((org.x + flowDir * 0.0002) + 1) % 1;
          } else if (org.type === "crab") {
            // crabs on wet sand near waterline
            const wetZone = 0.1;
            const isExposed = worldX > waterlineX - W * wetZone && worldX < waterlineX + W * 0.05;
            if (!isExposed) { org.x = ((org.x + 0.0004 * flowDir) + 1) % 1; return; }
            screenX = worldX + Math.sin(t * 2 + org.phase) * 5;
            screenY = bedY - 4;
          } else if (org.type === "bird") {
            // birds feed at waterline
            screenX = waterlineX - 10 + Math.sin(t * 0.5 + org.phase) * W * 0.05;
            screenY = bedY - 8;
            if (screenX < SHORE_L || screenX > SHORE_R) return;
          }

          ctx.save(); ctx.translate(screenX, screenY);
          if (org.type === "fish") {
            // simple fish shape
            ctx.beginPath(); ctx.ellipse(0, 0, 7, 3, 0, 0, Math.PI * 2);
            ctx.fillStyle = flowDir > 0 ? `${BIO}cc` : `${TIDE2}cc`; ctx.fill();
            ctx.beginPath(); ctx.moveTo(-7, 0); ctx.lineTo(-12, -4); ctx.lineTo(-12, 4); ctx.closePath();
            ctx.fillStyle = `${BIO}80`; ctx.fill();
          } else if (org.type === "plankton") {
            ctx.beginPath(); ctx.arc(0, 0, 2, 0, Math.PI * 2);
            ctx.fillStyle = `${BIO2}70`; ctx.fill();
          } else if (org.type === "crab") {
            ctx.beginPath(); ctx.arc(0, 0, 4, 0, Math.PI * 2);
            ctx.fillStyle = `${SAND2}cc`; ctx.fill();
            for (let li = 0; li < 3; li++) {
              const angle = (li / 3) * Math.PI - Math.PI / 2;
              ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(Math.cos(angle) * 7, Math.sin(angle) * 3);
              ctx.strokeStyle = SAND2; ctx.lineWidth = 1; ctx.stroke();
              ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(-Math.cos(angle) * 7, Math.sin(angle) * 3);
              ctx.strokeStyle = SAND2; ctx.lineWidth = 1; ctx.stroke();
            }
          } else if (org.type === "bird") {
            ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(-6, 4); ctx.lineTo(6, 4); ctx.closePath();
            ctx.fillStyle = WHITE; ctx.fill();
            // beak
            ctx.beginPath(); ctx.moveTo(6, 2); ctx.lineTo(12, 3); ctx.strokeStyle = SAND2; ctx.lineWidth = 1; ctx.stroke();
          }
          ctx.restore();
        });

        /* Tide gauge */
        const gaugeX = W - 28, gaugeT = H * 0.1, gaugeB = H * 0.9;
        ctx.beginPath(); ctx.moveTo(gaugeX, gaugeT); ctx.lineTo(gaugeX, gaugeB);
        ctx.strokeStyle = `${LINE}80`; ctx.lineWidth = 1; ctx.stroke();
        const gaugeY = gaugeT + (1 - tideNorm) * (gaugeB - gaugeT);
        ctx.beginPath(); ctx.rect(gaugeX - 8, gaugeY, 16, gaugeB - gaugeY);
        const gGrad = ctx.createLinearGradient(0, gaugeY, 0, gaugeB);
        gGrad.addColorStop(0, `${TIDE2}80`); gGrad.addColorStop(1, `${TIDE}30`);
        ctx.fillStyle = gGrad; ctx.fill();
        ctx.font = `7px ${mono}`; ctx.fillStyle = TIDE2; ctx.textAlign = "center";
        ctx.fillText("H", gaugeX, gaugeT - 4);
        ctx.fillText("L", gaugeX, gaugeB + 10);
        ctx.fillStyle = MOON2; ctx.fillText(`${Math.round(tideNorm * 100)}%`, gaugeX, gaugeY - 6);

        /* Status line */
        ctx.font = `8px ${mono}`; ctx.fillStyle = `${BODY}90`; ctx.textAlign = "center";
        ctx.fillText(`${isFlood ? "▲ FLOOD (landward)" : "▼ EBB (seaward)"}  ·  TIDE ${tideNorm > 0.6 ? "HIGH" : tideNorm < 0.4 ? "LOW" : "MID"}  ·  hour ${(tidalHour % 24.84).toFixed(1)}`, W / 2, H - 6);

        /* Zone labels */
        ctx.font = `7px ${mono}`; ctx.textAlign = "center";
        const zones = [
          { label: "SUBTIDAL", x: waterlineX * 0.35, col: TIDE2 },
          { label: "INTERTIDAL", x: waterlineX * 0.88, col: BIO2 },
          { label: "SUPRATIDAL", x: waterlineX + (SHORE_R - waterlineX) * 0.5, col: SAND2 },
        ];
        zones.forEach(z => {
          if (z.x > SHORE_L && z.x < SHORE_R) {
            ctx.fillStyle = z.col;
            ctx.fillText(z.label, z.x, H * 0.32);
          }
        });

      /* ═══ MODE: CURRENT FIELD ═══════════════════════════════════════════ */
      } else if (mode === "current") {

        ctx.fillStyle = BG0; ctx.fillRect(0, 0, W, H);

        let nowTide = 0;
        CONSTITUENTS.forEach(c => { nowTide += c.amp * Math.sin((tidalHour / c.period) * Math.PI * 2 + c.phase); });
        nowTide /= CONSTITUENTS.reduce((s, c) => s + c.amp, 0);

        // Tidal phase angle drives the current direction rotation
        const tidalPhase = (tidalHour % 12.42) / 12.42; // 0..1 over one M2 cycle
        const globalAngle = tidalPhase * Math.PI * 2; // current rotates with tidal cycle

        /* Bathymetry colour field */
        for (let cy2 = 0; cy2 < H; cy2 += 4) {
          for (let cx2 = 0; cx2 < W; cx2 += 4) {
            const depth = 0.5 + 0.5 * Math.sin(cx2 * 0.008) * Math.cos(cy2 * 0.012);
            const alpha = 0.04 + depth * 0.06;
            ctx.fillStyle = `rgba(32,144,216,${alpha})`;
            ctx.fillRect(cx2, cy2, 4, 4);
          }
        }

        /* Current vectors on grid */
        const cellW = W / GRID_W, cellH = H / GRID_H;
        currentNodes.forEach(node => {
          const cx2 = (node.col + 0.5) * cellW;
          const cy2 = (node.row + 0.5) * cellH;

          // Local variation around global tide direction
          const localAngle = globalAngle + (node.phase - Math.PI) * 0.5;
          const speed = 0.4 + 0.6 * Math.abs(nowTide);

          const arrowLen = cellW * 0.35 * speed;
          const dx = Math.cos(localAngle) * arrowLen;
          const dy = Math.sin(localAngle) * arrowLen;

          // Color by speed
          const r = Math.round(32 + speed * 80);
          const g = Math.round(144 + speed * 80);
          const b = Math.round(216);
          const alpha = 0.3 + speed * 0.5;

          ctx.save();
          ctx.globalAlpha = alpha;
          ctx.strokeStyle = `rgb(${r},${g},${b})`;
          ctx.lineWidth = 1 + speed;
          ctx.beginPath(); ctx.moveTo(cx2, cy2); ctx.lineTo(cx2 + dx, cy2 + dy); ctx.stroke();
          // arrowhead
          const nx2 = cx2 + dx, ny2 = cy2 + dy;
          ctx.fillStyle = `rgb(${r},${g},${b})`;
          ctx.beginPath();
          ctx.moveTo(nx2, ny2);
          ctx.lineTo(nx2 - Math.cos(localAngle - 0.4) * 6, ny2 - Math.sin(localAngle - 0.4) * 6);
          ctx.lineTo(nx2 - Math.cos(localAngle + 0.4) * 6, ny2 - Math.sin(localAngle + 0.4) * 6);
          ctx.closePath(); ctx.fill();
          ctx.restore();
        });

        /* Spring/neap indicator */
        // M2+S2 alignment → spring; opposition → neap
        const M2phase = (tidalHour / CONSTITUENTS[0].period) * Math.PI * 2;
        const S2phase = (tidalHour / CONSTITUENTS[1].period) * Math.PI * 2 + 0.3;
        const phaseDiff = Math.abs(((M2phase - S2phase) % (Math.PI * 2)) - Math.PI);
        const isSpring = phaseDiff < Math.PI * 0.3;
        const isNeap   = phaseDiff > Math.PI * 0.7;

        ctx.font = `10px ${mono}`; ctx.textAlign = "left"; ctx.fillStyle = isSpring ? TIDE2 : isNeap ? MOON : PALE;
        ctx.fillText(isSpring ? "SPRING TIDE" : isNeap ? "NEAP TIDE" : "TRANSITIONAL", 14, 22);
        ctx.font = `8px ${mono}`; ctx.fillStyle = BODY;
        ctx.fillText(isSpring ? "M2 + S2 in phase → maximum range" : "M2 + S2 out of phase → minimum range", 14, 36);

        /* Tide arrow compass */
        const compX = W - 50, compY = H - 50;
        ctx.beginPath(); ctx.arc(compX, compY, 22, 0, Math.PI * 2);
        ctx.strokeStyle = `${LINE}`; ctx.lineWidth = 1; ctx.stroke();
        ctx.fillStyle = `${MID}cc`; ctx.fill();
        const cdx = Math.cos(globalAngle) * 16, cdy = Math.sin(globalAngle) * 16;
        ctx.beginPath(); ctx.moveTo(compX, compY); ctx.lineTo(compX + cdx, compY + cdy);
        ctx.strokeStyle = TIDE2; ctx.lineWidth = 2.5; ctx.stroke();
        ctx.beginPath(); ctx.moveTo(compX, compY); ctx.lineTo(compX - cdx * 0.5, compY - cdy * 0.5);
        ctx.strokeStyle = `${BORE}80`; ctx.lineWidth = 2; ctx.stroke();
        ctx.font = `7px ${mono}`; ctx.fillStyle = BODY; ctx.textAlign = "center";
        ctx.fillText("CURRENT", compX, compY + 36);

        /* Status */
        ctx.font = `8px ${mono}`; ctx.fillStyle = `${BODY}90`; ctx.textAlign = "center";
        ctx.fillText(`TIDAL CURRENT FIELD  ·  ${Math.round((tidalHour % 12.42) / 12.42 * 100)}% through M2 cycle  ·  speed ∝ |sin(phase)|`, W / 2, H - 8);
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
    { k: "harmonics" as Mode, label: "Tidal Harmonic Constituents",     col: TIDE2 },
    { k: "movement"  as Mode, label: "Movement Through the Tidal Zone", col: BIO   },
    { k: "current"   as Mode, label: "Tidal Current Field · Spring/Neap", col: MOON },
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
  { id: "s1", label: "Tidal Physics" }, { id: "s2", label: "Harmonics" },
  { id: "s3", label: "Movement" },       { id: "s4", label: "Organisms" },
  { id: "s5", label: "Estuaries" },      { id: "s6", label: "Spring/Neap" },
  { id: "s7", label: "AETHER" },
];

export default function TidalMovementPage() {
  const [mode, setMode] = useState<Mode>("harmonics");

  return (
    <div style={{ background: BG0, minHeight: "100vh", fontFamily: body, color: PALE }}>

      {/* ── HERO ── */}
      <div style={{ position: "relative", overflow: "hidden" }}>
        <div style={{
          position: "absolute", inset: 0,
          background: `
            radial-gradient(ellipse 90% 50% at 50% 0%, rgba(32,144,216,0.12) 0%, transparent 60%),
            radial-gradient(ellipse 60% 40% at 85% 70%, rgba(192,212,248,0.08) 0%, transparent 50%),
            radial-gradient(ellipse 50% 60% at 15% 80%, rgba(72,216,128,0.07) 0%, transparent 50%),
            linear-gradient(180deg, ${BG1} 0%, ${BG0} 100%)
          `,
        }} />
        <div style={{ position: "relative", padding: "72px 28px 54px", textAlign: "center" }}>
          <div style={{ fontFamily: mono, fontSize: 9, color: TIDE, letterSpacing: 6, marginBottom: 14 }}>
            AETHER · TIDAL DYNAMICS · LUNAR OSCILLATION · MOVEMENT
          </div>
          <h1 style={{
            fontFamily: serif, fontSize: "clamp(20px,4vw,48px)", letterSpacing: 3, lineHeight: 1.12,
            background: `linear-gradient(135deg, ${TIDE2} 0%, ${MOON2} 40%, ${BIO2} 70%, ${SAND2} 100%)`,
            WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text",
            margin: "0 0 16px",
          }}>
            MOVEMENT THROUGH<br />THE MOON'S TIDE
          </h1>
          <div style={{
            fontFamily: body, fontStyle: "italic", fontSize: 17,
            background: `linear-gradient(90deg, ${TIDE2}80, ${PALE}, ${BIO2}80)`,
            WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text",
            marginBottom: 20,
          }}>
            Harmonic Constituents · Tidal Currents · Biological Entrainment · Estuarine Circulation
          </div>
          <p style={{ fontFamily: body, fontSize: 16, color: BODY, maxWidth: 700, margin: "0 auto 28px", lineHeight: 1.9 }}>
            The ocean does not simply rise and fall — it breathes, pulses, and circulates.
            The Moon's gravitational pull combines with the Sun's to produce a rich harmonic
            spectrum of oscillations. Everything in the intertidal world — water, sediment,
            nutrients, organisms — moves through these rhythms, entrained to a clock set
            12,400 kilometres above at the Moon's centre of mass.
          </p>
          <div style={{ display: "flex", gap: 6, justifyContent: "center", flexWrap: "wrap" }}>
            <Chip c={TIDE2}>M2 · 12.42h</Chip>
            <Chip c={MOON}>S2 · 12.00h</Chip>
            <Chip c={BIO2}>K1 · 23.93h</Chip>
            <Chip c={SAND2}>O1 · 25.82h</Chip>
            <Chip c={GOLD}>Spring tide</Chip>
            <Chip c={TIDE}>Neap tide</Chip>
            <Chip c={BIO}>Tidal bore</Chip>
            <Chip c={MOON2}>Intertidal zone</Chip>
          </div>
        </div>
      </div>

      {/* Sticky nav */}
      <div style={{ position: "sticky", top: 0, zIndex: 50, background: `${BG0}f0`, backdropFilter: "blur(12px)", borderBottom: `1px solid ${LINE}`, padding: "8px 18px", display: "flex", gap: 4, overflowX: "auto" }}>
        {NAV.map(s => (
          <a key={s.id} href={`#${s.id}`} style={{ fontFamily: mono, fontSize: 10, color: BODY, whiteSpace: "nowrap", padding: "4px 10px", borderRadius: 4, textDecoration: "none" }}
            onMouseEnter={e => { (e.target as HTMLElement).style.color = TIDE2; }}
            onMouseLeave={e => { (e.target as HTMLElement).style.color = BODY; }}
          >{s.label}</a>
        ))}
      </div>

      <div style={{ maxWidth: 960, margin: "0 auto", padding: "0 22px 96px" }}>

        {/* Canvas */}
        <div style={{ marginTop: 36 }}>
          <ModeTabs value={mode} onChange={setMode} />
          <TidalCanvas mode={mode} />
          <div style={{ fontFamily: mono, fontSize: 9, color: BODY, marginTop: 7, lineHeight: 1.8 }}>
            {mode === "harmonics" && "SIX HARMONIC CONSTITUENTS SHOWN INDIVIDUALLY · BOTTOM ROW = SUPERPOSED COMPOSITE · GOLD CURSOR = NOW · COMPOSITE SHOWN IN WHITE · PERIOD LABELS ON RIGHT · 72-HOUR WINDOW"}
            {mode === "movement"  && "ANIMATED CROSS-SECTION OF INTERTIDAL BEACH · TIDE RISES/FALLS FROM HARMONIC SUM · BLUE ARROWS = TIDAL CURRENT (FLOOD / EBB) · GREEN=FISH · GOLD=CRAB · WHITE=BIRD · DIM=PLANKTON · RIGHT=TIDE GAUGE"}
            {mode === "current"   && "TOP-DOWN TIDAL CURRENT FIELD · ARROW DIRECTION ROTATES THROUGH M2 CYCLE · ARROW LENGTH ∝ SPEED · SPRING TIDE WHEN M2+S2 IN PHASE · NEAP WHEN OPPOSED · COMPASS = DOMINANT CURRENT DIRECTION"}
          </div>
        </div>

        {/* ── I ── */}
        <Sect id="s1" n="I" title="Tidal Oscillation — The Physics" sub="The Moon is not a switch; it is a forcing function with a rich harmonic spectrum" col={TIDE} />
        <p style={{ fontFamily: body, fontSize: 16, color: BODY, lineHeight: 1.85, marginBottom: 20 }}>
          Tides are the ocean's gravitational response to the time-varying differential pull of the
          Moon and Sun across Earth's diameter. They are not a single wave but a superposition
          of dozens of periodic components — the tidal harmonic constituents — each driven by a
          specific astronomical cycle.
        </p>
        <EQ col={TIDE}>{`Tidal forcing (equilibrium tide, Laplace):

  Gravitational potential of Moon at surface point r:
    Φ_M(r,θ) = −GM_M/|r − r_M|  [Taylor-expanded for small r/r_M]
    ≈ −(GM_M/r_M) [1 + (r/r_M)cos(θ) + (r/r_M)² P₂(cos θ) + ...]

  The P₂ (second Legendre polynomial) term is the TIDAL term:
    Φ_tidal = −(GM_M r²/r_M³) P₂(cos θ) = −(GM_M r²/2r_M³)(3cos²θ − 1)

  This creates TWO bulges: one facing the Moon, one opposite (centrifugal balance)
  → semidiurnal tides (two per lunar day)

  Earth rotates under these bulges → each coastal point cycles through:
    high → low → high → low  every 24.84 hours (lunar day)
  The 24.84h period splits into two: M2 = 12.42h (half lunar day)

  Sun adds its own forcing (weaker, 46% of Moon):
    Φ_S = −(GM_S r²/r_S³) P₂(cos θ_S)  → S2 = 12.00h constituent

  Spring tide: Moon and Sun aligned (new/full moon) → M2+S2 amplitudes ADD
    Tidal range: A_spring = A_M2 + A_S2 ≈ 1.46 × mean
  Neap tide: Moon and Sun at 90° (quarter moon) → amplitudes SUBTRACT
    Tidal range: A_neap = A_M2 − A_S2 ≈ 0.54 × mean
  Ratio: A_spring/A_neap ≈ 2.7  (spring tides ~2.7× bigger than neap)

  Moon's elliptical orbit adds N2 (12.66h) — periapsis amplification:
    At perigee: Moon is 12% closer → tidal force 36% stronger
    At apogee: tidal force 25% weaker
    N2 beats with M2 → 27.55-day amplitude modulation (anomalistic month)`}</EQ>

        {/* ── II ── */}
        <Sect id="s2" n="II" title="The Six Principal Constituents" sub="How M2, S2, N2, K1, O1, K2 combine to produce every real tide on Earth" col={TIDE2} />
        <Tbl headers={["NAME", "Full name", "Period (h)", "Origin", "Amplitude (rel)", "Type"]}
          rows={[
            ["M2", "Principal lunar semidiurnal", "12.4206", "Moon's orbital rotation", "1.000 (reference)", "Semidiurnal"],
            ["S2", "Principal solar semidiurnal",  "12.0000", "Sun's apparent rotation", "0.465", "Semidiurnal"],
            ["N2", "Larger lunar elliptic",        "12.6584", "Moon's orbital eccentricity", "0.192", "Semidiurnal"],
            ["K1", "Lunisolar diurnal",             "23.9345", "Moon+Sun declination combined", "0.531", "Diurnal"],
            ["O1", "Principal lunar diurnal",       "25.8194", "Moon's orbital declination", "0.377", "Diurnal"],
            ["K2", "Lunisolar semidiurnal",         "11.9672", "Moon+Sun declination squared", "0.125", "Semidiurnal"],
          ]}
        />
        <EQ col={TIDE2}>{`Harmonic analysis of tides (Kelvin/Darwin, 1868):

  Any tidal signal h(t) can be decomposed as:
    h(t) = Z₀ + Σₙ fₙ Hₙ cos(ωₙt + V₀ₙ + uₙ − gₙ)

  Where:
    Z₀    = mean sea level above chart datum
    fₙ    = nodal modulation factor (19-year cycle of Moon's orbital plane tilt)
    Hₙ    = constituent amplitude [metres] — specific to each location
    ωₙ    = constituent angular frequency [radians/hour]
    V₀ₙ   = astronomical argument (astronomical reference)
    uₙ    = nodal angle correction
    gₙ    = phase lag (local correction for basin shape, friction, resonance)

  Beat periods between constituents (spring/neap cycle):
    M2 and S2: beat period = 1/(1/12.42 − 1/12.00) = 354h = 14.76 days → fortnightly spring/neap
    M2 and N2: beat period = 1/(1/12.42 − 1/12.66) = 661h = 27.55 days → anomalistic month
    K1 and O1: beat period = 1/(1/23.93 − 1/25.82) ≈ 327h = 13.6 days → tropical fortnight

  Dominant tide type by latitude:
    Equatorial / mid-latitude: semidiurnal (M2 dominates) → 2 equal high/low per day
    High latitude / Pacific: mixed → unequal highs and lows (K1+O1 comparable to M2)
    Gulf of Mexico, parts SE Asia: diurnal → only 1 high, 1 low per day

  Resonance amplification:
    Bay of Fundy (Canada): 17m tidal range — fundamental resonance period ≈ 12.7h ≈ M2
    → standing wave fills bay in exactly one M2 half-cycle
    English Channel: 7–8m range from resonance with Atlantic tidal wave
    Open ocean: M2 amplitude only 0.2–0.5m (resonance is everything for big tides)`}</EQ>

        {/* ── III ── */}
        <Sect id="s3" n="III" title="Tidal Currents — Water in Motion" sub="The horizontal flow driven by the oscillating tidal pressure gradient" col={TIDE} />
        <EQ col={TIDE}>{`Tidal currents vs tidal height:

  HEIGHT describes the vertical oscillation of sea level.
  CURRENT describes the horizontal mass transport — the actual movement.

  They are 90° OUT OF PHASE:
    Maximum CURRENT occurs at mid-tide (rising or falling) = SLACK WATER at high/low
    Maximum HEIGHT occurs at high/low tide            = ZERO current (slack water)
    
  Current velocity:
    u(t) = U_max · cos(ωt + φ)   [simplified 1D tidal channel]
    
  In a real estuary:
    Flood current: water moves LANDWARD as tide rises (brings salt, nutrients, larvae)
    Ebb current:  water moves SEAWARD as tide falls (exports sediment, organic matter)
    Slack water:  brief zero-current period at each tide reversal

  Tidal current magnitudes (typical):
    Open ocean: 1–10 cm/s (barely perceptible)
    Continental shelf: 5–50 cm/s
    Estuary channels: 50–200 cm/s (1–4 knots)
    Tidal bore (Qiantang River, China): 7 m/s wave front
    Pentland Firth (Scotland): 4–5 m/s = fastest tidal strait on Earth

  Rotary tidal currents (offshore):
    Not oscillating back-and-forth but ROTATING — the current vector sweeps a full
    ellipse over one tidal cycle due to Earth's rotation (Coriolis + no coast to reflect)
    Northern hemisphere: predominantly clockwise rotation
    Ellipse aspect ratio depends on latitude: circular at poles, linear at equator
    
  Tidal power:
    P = ½ ρ A v³   [standard turbine formula]
    ρ = 1025 kg/m³ (seawater), A = turbine area, v = current speed
    At v=3m/s, A=314m² (10m turbine): P = ½×1025×314×27 ≈ 4.3 MW per turbine`}</EQ>

        {/* ── IV ── */}
        <Sect id="s4" n="IV" title="Movement of Life Through Tidal Oscillation" sub="How organisms navigate, feed, spawn, and migrate by reading tidal time" col={BIO} />
        <p style={{ fontFamily: body, fontSize: 16, color: BODY, lineHeight: 1.85, marginBottom: 20 }}>
          Tidal oscillation is not merely a backdrop to life in the intertidal zone — it is
          the primary organising signal. Organisms do not passively endure the tide; they
          actively move through it, riding flood and ebb currents to feed, disperse,
          and reproduce at precisely calibrated tidal moments.
        </p>
        <Tbl headers={["ORGANISM", "Tidal movement strategy", "Signal used", "Timing precision", "Example"]}
          rows={[
            ["Intertidal fish (blennies, gobies)", "Emerge at low tide to feed on exposed invertebrates; return before high", "Circatidal clock (12.4h)", "±15 min", "Xererpes fucorum on Pacific coast"],
            ["Shore crabs (Carcinus)", "Migrate up beach as tide floods; bury at high slack; emerge on ebb", "Tidal + circadian composite", "±30 min", "Carcinus maenas UK estuaries"],
            ["Oyster larvae (veliger)", "Ride surface flood current landward; sink and settle at slack water", "Vertical migration + current", "Tidal phase specific", "Crassostrea virginica Chesapeake"],
            ["Grunion (Leuresthes tenuis)", "Spawn precisely at highest spring tide — waves strand fish to lay eggs on wet sand", "Peak spring tide + night", "Night of spring tide ±1hr", "California coast, March–August"],
            ["Shorebirds (dunlin, sanderling)", "Feed on intertidal mudflats only when exposed; regroup at high tide roosts", "Visual: waterline position", "Tracks water edge in real time", "Estuaries globally"],
            ["Copepods / zooplankton", "Ascend in water column on flood (transported landward); descend on ebb", "Pressure + light/dark", "Minutes to hours", "Acartia tonsa, Calanus spp."],
            ["Eels (Anguilla)", "Migrate downstream to sea preferentially on ebb current", "Ebb current + lunar quarter", "Specific to dark new moon ebb", "European eel October–November"],
            ["Kelp spores", "Released at low neap tide → minimal current dispersal → local settlement", "Neap slack water", "Neap fortnightly", "Macrocystis pyrifera"],
          ]}
        />
        <EQ col={BIO}>{`The intertidal zone — most biologically rich interface on Earth:

  Zones defined by tidal exposure:
    Splash zone:     only wetted by spray and extreme spring tides
    High intertidal: covered by high spring tides only (2–4 hr/day exposed)
    Mid intertidal:  alternately covered and exposed each cycle (most species)
    Low intertidal:  exposed only at low spring tides (4–6 hr/tidal cycle covered)
    Subtidal:        permanently submerged

  Temperature stress on exposure:
    Rock surface at low tide, summer midday: up to 45°C (vs 15°C in water)
    Intertidal organisms tolerate ΔT ≈ 30°C in 6 hours — extreme eurythermy
    Adaptation strategy: heat-shock proteins calibrated to tidal exposure schedule

  Desiccation stress:
    Water loss rate ∝ exposed area × VPD × time
    Mussels (Mytilus): can lose 15% body water and survive; valve closure
    Limpets (Patella): seal to rock, trap a water film — desiccation tolerance
    Timing is everything: arrival of flood current is predicted, not waited for

  Circatidal clock (endogenous):
    Organisms maintain an internal ~12.4h clock independent of tidal cues
    Evidence: isolated in constant conditions, animals still anticipate tide timing
    Mechanism: separate from circadian (24h) clock; possibly pressure-sensitive
    Fiddler crabs (Uca): can maintain circatidal rhythm for weeks in lab
    Key insight: organisms move BEFORE the tide arrives — the clock predicts, not reacts`}</EQ>

        {/* ── V ── */}
        <Sect id="s5" n="V" title="Estuarine Circulation · Tidal Bores · Sediment Transport" sub="How the oscillating tide organises material flux at the land-sea interface" col={SAND} />
        <EQ col={SAND}>{`Estuarine circulation:

  An estuary is a semi-enclosed water body where fresh river water meets salty ocean.
  Salinity gradient + tidal oscillation drives a persistent two-layer circulation:

  Gravitational circulation (density-driven):
    Dense saltwater flows LANDWARD along the bottom (subtidal flood layer)
    Lighter freshwater flows SEAWARD at the surface (estuarine outflow)
    → NET particle movement: surface particles move seaward; bottom particles landward
    → Convergence zone: fine sediment (turbidity maximum) accumulates mid-estuary

  Tidal straining (Simpson et al. 1990):
    On FLOOD: tidal current mixes salt and freshwater vertically (stratification decreases)
    On EBB:  tidal current re-stratifies the water column (lighter water on top, heavy below)
    → Asymmetric mixing: FLOOD is more mixed than EBB
    → Net effect: more residual landward flow than expected from gravity alone

  Tidal asymmetry:
    Flood dominant (shallow water): flood current faster than ebb
      → net landward sediment transport → estuaries FILL (most UK estuaries)
    Ebb dominant (deep channels): ebb current faster than flood
      → net seaward sediment export → channels SCOUR

  Tidal bores — the dramatic face of tidal energy:
    A tidal bore is a solitary wave that travels upstream when:
      1. Tidal range is large (>6m)
      2. Funnel-shaped estuary amplifies the incoming tide
      3. River discharge is low (bore overtops normal river flow)
    
    Bore speed: c = √(gd)   [shallow water wave speed]
    d = water depth, g = 9.81 m/s²
    Qiantang River bore height: 8m, speed 15 km/h = 4.2 m/s
    Amazon pororoca: travels 500km upstream, height up to 4m
    Severn bore: 2m bore, travels 22km upstream at 20km/h
    
    Bore ecology: larvae, eggs, and zooplankton mass transported far upstream
    on a single bore event — a biological delivery mechanism.`}</EQ>

        {/* ── VI ── */}
        <Sect id="s6" n="VI" title="Spring and Neap Cycles · The Fortnightly Rhythm" sub="The 14.76-day beat between M2 and S2 — the tide's own month within a month" col={MOON} />
        <EQ col={MOON}>{`Spring-neap cycle — the fortnightly tidal heartbeat:

  SPRING TIDES:  M2 and S2 in phase → amplitudes sum
    Occurs: 1–2 days after New Moon and Full Moon (Earth-Moon-Sun aligned)
    Tidal range: A_spring = A_M2 + A_S2  (maximised)
    Example, Bay of Fundy: ~17m range at spring, ~9m at neap
    
  NEAP TIDES: M2 and S2 in quadrature (90° offset) → amplitudes partially cancel
    Occurs: 1–2 days after First and Last Quarter Moon
    Tidal range: A_neap = A_M2 − A_S2  (minimised)
    
  Period of spring-neap cycle:
    Beat frequency: f_beat = |f_M2 − f_S2| = |1/12.4206 − 1/12.0000| = 0.002836 /h
    Period = 1/f_beat = 352h = 14.67 days ≈ half synodic month (14.77 days)

  Biological responses to spring-neap cycle:
    Intertidal zone extent:
      Spring low tide exposes 30–60% MORE habitat than neap low tide
      Spring high tide covers 20–40% more habitat than neap
      → Biotic zonation is mapped onto spring-neap amplitude envelope, not mean tide
    
    Spawning synchrony:
      Palolo worm (Palola viridis, Samoa): releases gametes ONLY on last quarter
        moon of October/November — tidal phase precision ± 1 hour
      Horseshoe crabs (Limulus polyphemus): spawn on highest spring tides of May/June
      Coral mass spawning: 2–6 nights after full moon, correlated with falling tides
      
    Foraging area expansion:
      Shorebird flocks track the spring-neap envelope:
        Spring neap: most mudflat exposed → maximum feeding area → peak condition
        Neap: less exposed → birds must wait longer → higher competition
        
  Perigean spring tide ("king tide"):
    Occurs when spring tide coincides with Moon at perigee (closest approach)
    Moon 12% closer → tidal force 37% stronger
    A_perigean_spring ≈ 1.4 × normal spring tide
    Recurs every ~7.5 months (anomalistic + synodic month beat)
    Coastal flooding events disproportionately cluster around perigean springs`}</EQ>

        {/* ── VII ── */}
        <Sect id="s7" n="VII" title="AETHER · Tidal Oscillation as C(x,t) Modulation" sub="The Moon's tide is a gravitomagnetic pulse in the coherence field — everything moves through it" col={TIDE2} />
        <EQ col={TIDE2}>{`AETHER tidal model — C(x,t) under lunar forcing:

  Standard AETHER coherence field: C(x,t) = C₀ + ∫ κ(x,x′) · ρ(x′,t) d³x′
  where κ is the coherence kernel and ρ is local mass-energy density.

  Lunar tidal forcing modifies C locally:
    ΔC_tidal(x,t) = −(GM_M r²/r_M³) · γ · P₂(cos θ(t))  [tidal C-field modulation]
    γ = coherence-gravitational coupling constant
    P₂(cos θ) = ½(3cos²θ − 1)  [same Legendre polynomial as tidal potential]
    
  Key consequence: C(x,t) oscillates at M2, S2, K1, O1 frequencies
    → Every C-field-sensitive system on Earth experiences tidal coherence modulation
    → This includes: neural tissues, circadian clocks, DNA replication timing,
       cell membrane potential, enzyme reaction rates
      
  Why organisms anticipate the tide rather than react to it:
    The C-field modulation propagates at c (speed of light) → arrives before water
    The tidal M2 potential at Earth's surface leads the actual water movement by:
      τ_lead ≈ r_M/c ≈ 3.84×10⁸/3×10⁸ ≈ 1.28 seconds (gravitational travel time)
    BUT: ocean response to tidal forcing has a PHASE LAG of ~3–4 hours
    → The C-field signal arrives 3+ hours BEFORE the water
    → C-sensitive organisms (all life has magnetite, piezoelectric proteins) can
       "feel" the incoming tide through C-field before the water arrives
    → This explains the endogenous circatidal clock: it may be a C-field oscillator,
       not a purely biochemical timer
       
  Tidal coherence as AETHER substrate energy:
    The M2 oscillation at 7×10⁻⁵ Hz is far below Schumann resonances (7.83Hz)
    But it MODULATES the amplitude envelope of the Schumann cavity
    → Spring tides slightly change Earth-ionosphere cavity dimensions
    → → Schumann frequencies shift by ΔfSchumann ≈ ±0.02Hz during spring tides
    → This has been measured (Schlegel & Füllekrug, 1999)
    → It means the tidal C-field and the wireless-power cavity are coupled:
       tidal phase affects global EM coherence field amplitude
       
  Movement through tidal oscillation = movement through C(x,t) gradient:
    An organism moving up a beach at flood tide is moving through a strengthening
    C-field (approaching maximum tidal coherence). It receives more coherence budget
    per unit metabolism — this may be why intertidal organisms are metabolically
    more active at high tide despite hypoxic risk.
    Retreating on ebb = moving through falling C-gradient = conservation mode.`}</EQ>

        <Pull col={TIDE2}>"The tide is not water moving. It is a wave of coherence passing through water — and every living thing in its path has been reading that wave since the first cells formed in the Hadean tidal pools."</Pull>

        {/* Constituent summary cards */}
        <div style={{ marginTop: 48, display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(140px,1fr))", gap: 10 }}>
          {CONSTITUENTS.map(c => (
            <div key={c.name} style={{ background: `${c.col}0c`, border: `1px solid ${c.col}28`, borderRadius: 8, padding: "14px 16px" }}>
              <div style={{ fontFamily: mono, fontSize: 16, color: c.col, fontWeight: 700, marginBottom: 4 }}>{c.name}</div>
              <div style={{ fontFamily: body, fontSize: 12, color: BODY, lineHeight: 1.5, marginBottom: 6 }}>{c.desc}</div>
              <div style={{ fontFamily: mono, fontSize: 10, color: `${c.col}90` }}>T = {c.period}h</div>
              <div style={{ fontFamily: mono, fontSize: 10, color: `${c.col}70` }}>A = {(c.amp * 100).toFixed(0)}%</div>
            </div>
          ))}
        </div>

        <div style={{ marginTop: 32, padding: "16px 22px", background: MID, borderRadius: 8, border: `1px solid ${LINE}`, textAlign: "center" }}>
          <div style={{ fontFamily: mono, fontSize: 9, color: BODY, lineHeight: 2.2 }}>
            M2=12.42h  ·  S2=12.00h  ·  Spring T=14.77d  ·  Bay of Fundy range=17m  ·  Pentland Firth v=5m/s<br />
            Grunion spawn: peak spring  ·  Eel migration: new moon ebb  ·  Palolo worm: quarter moon Oct/Nov<br />
            ΔC_tidal = −(GM_M r²/r_M³)·γ·P₂(cosθ)  ·  Schumann shift ±0.02Hz at spring  ·  C-field precedes water by ~3h
          </div>
          <div style={{ fontFamily: mono, fontSize: 9, color: `${DIM}cc`, marginTop: 12 }}>
            Shia Miller · AetherLife.co · Cosmic Chaos Corporation™ · 2026
          </div>
        </div>
      </div>
    </div>
  );
}
