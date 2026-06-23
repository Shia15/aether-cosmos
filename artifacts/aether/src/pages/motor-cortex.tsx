import { useEffect, useRef } from "react";

/* ── palette ──────────────────────────────────── */
const BG   = "#030408";
const TEAL = "#1fd4c8";
const GOLD = "#c9a84c";
const VIO  = "#8b5cf6";
const GRN  = "#22c55e";
const PINK = "#ec4899";
const BLUE = "#3b82f6";
const ORG  = "#f97316";
const DIM  = "#374858";
const MN   = "'Space Mono',monospace";
const OR   = "'Orbitron',sans-serif";

/* ── finger map (thumb=0 … pinky=4) ─────────── */
// Utah array: row 0-1 = thumb, 2-3 = index, 4-5 = middle, 6-7 = ring, 8-9 = pinky
const FINGER = [
  { name:"Thumb",  col:TEAL, rows:[0,1] },
  { name:"Index",  col:GRN,  rows:[2,3] },
  { name:"Middle", col:GOLD, rows:[4,5] },
  { name:"Ring",   col:VIO,  rows:[6,7] },
  { name:"Pinky",  col:ORG,  rows:[8,9] },
];

function ha(hex: string, a: number) {
  return hex + Math.round(a * 255).toString(16).padStart(2,"0");
}

/* ── Main Page ────────────────────────────────── */
export default function MotorCortexPage() {
  const cortexRef = useRef<HTMLCanvasElement>(null);
  const arrayRef  = useRef<HTMLCanvasElement>(null);
  const handRef   = useRef<HTMLCanvasElement>(null);
  const animRef   = useRef(0);

  useEffect(() => {
    const cCortex = cortexRef.current;
    const cArray  = arrayRef.current;
    const cHand   = handRef.current;
    if (!cCortex || !cArray || !cHand) return;
    const xC = cCortex.getContext("2d")!;
    const xA = cArray.getContext("2d")!;
    const xH = cHand.getContext("2d")!;

    // Shared state buffers
    const firing = new Float32Array(100);   // 10×10 Utah array
    const fAct   = new Float32Array(5);     // per-finger activation 0-1

    let t = 0;

    /* ───────── UPDATE FIRING PATTERN ─────────── */
    function updateFiring() {
      const CYCLE = 420;
      const phase = (t % CYCLE) / CYCLE; // 0→1 each cycle

      // Sequential wave: thumb→index→middle→ring→pinky→repeat
      for (let f = 0; f < 5; f++) {
        const peak = f / 4;
        const d = Math.abs(phase - peak);
        const wd = Math.min(d, 1 - d);
        fAct[f] = Math.max(0, 1 - wd * 7);
      }

      // Map activation to electrodes with noise
      for (let r = 0; r < 10; r++) {
        const fi = Math.floor(r / 2); // 0-4
        const base = fAct[fi];
        for (let c = 0; c < 10; c++) {
          const noise = Math.random() * 0.15;
          const spike = Math.random() < 0.02 * base ? 0.6 : 0;
          firing[r * 10 + c] = Math.min(1, base * (0.7 + c * 0.03) + noise * base + spike);
        }
      }
    }

    /* ───────── DRAW MOTOR CORTEX MAP ─────────── */
    function drawCortex() {
      const W = cCortex.width, H = cCortex.height;
      xC.clearRect(0, 0, W, H);

      // Background gradient
      const bg = xC.createLinearGradient(0, 0, W, H);
      bg.addColorStop(0, "#050a14");
      bg.addColorStop(1, "#020508");
      xC.fillStyle = bg;
      xC.fillRect(0, 0, W, H);

      // Subtle dot grid
      xC.fillStyle = "rgba(31,212,200,0.06)";
      for (let gx = 30; gx < W; gx += 60)
        for (let gy = 30; gy < H; gy += 60)
          { xC.beginPath(); xC.arc(gx, gy, 1.2, 0, Math.PI*2); xC.fill(); }

      // ── Brain silhouette (lateral right hemisphere schematic) ──
      xC.save();
      xC.beginPath();
      xC.ellipse(W * 0.60, H * 0.50, W * 0.34, H * 0.44, 0, 0, Math.PI * 2);
      xC.fillStyle = "#0b1220";
      xC.fill();
      xC.strokeStyle = "rgba(60,90,140,0.35)";
      xC.lineWidth = 4;
      xC.stroke();
      xC.restore();

      // Add gyral texture hints
      for (let i = 0; i < 6; i++) {
        const gy = H * (0.18 + i * 0.12);
        xC.save();
        xC.beginPath();
        xC.moveTo(W * 0.30, gy);
        xC.bezierCurveTo(W*0.50, gy - 14, W*0.70, gy + 14, W*0.88, gy);
        xC.strokeStyle = "rgba(30,50,80,0.45)";
        xC.lineWidth = 8;
        xC.lineCap = "round";
        xC.stroke();
        xC.restore();
      }

      // ── M1 strip (precentral gyrus) ──
      // Vertical band from y=80 to y=740 at x=220-310
      const SL = W * 0.295, SR = W * 0.445;
      const ST = H * 0.09, SB = H * 0.90;
      const SH = SB - ST;

      // M1 background
      xC.save();
      xC.beginPath();
      xC.roundRect(SL, ST, SR - SL, SH, 6);
      xC.fillStyle = "rgba(15,28,50,0.7)";
      xC.fill();
      xC.strokeStyle = ha(TEAL, 0.12);
      xC.lineWidth = 2;
      xC.stroke();
      xC.restore();

      // Somatotopic region bands in M1 (medial=top → lateral=bottom)
      const regions = [
        { lbl:"Leg / Foot", y0:0.00, y1:0.14, col:GOLD, fi:-1 },
        { lbl:"Trunk",      y0:0.14, y1:0.22, col:BLUE, fi:-1 },
        { lbl:"Arm",        y0:0.22, y1:0.32, col:BLUE, fi:-1 },
        { lbl:"Pinky",      y0:0.32, y1:0.41, col:ORG,  fi:4  },
        { lbl:"Ring",       y0:0.41, y1:0.50, col:VIO,  fi:3  },
        { lbl:"Middle",     y0:0.50, y1:0.59, col:GOLD, fi:2  },
        { lbl:"Index",      y0:0.59, y1:0.68, col:GRN,  fi:1  },
        { lbl:"Thumb",      y0:0.68, y1:0.78, col:TEAL, fi:0  },
        { lbl:"Face",       y0:0.78, y1:0.92, col:PINK, fi:-1 },
      ];

      for (const r of regions) {
        const ry0 = ST + r.y0 * SH;
        const ry1 = ST + r.y1 * SH;
        const rh  = ry1 - ry0 - 2;
        const act = r.fi >= 0 ? fAct[r.fi] : 0;

        // Band fill
        xC.save();
        xC.beginPath();
        xC.rect(SL + 5, ry0 + 1, SR - SL - 10, rh);
        xC.fillStyle = ha(r.col, 0.08 + act * 0.28);
        xC.fill();
        if (act > 0.05) {
          xC.shadowColor = r.col;
          xC.shadowBlur  = 30 * act;
          xC.fillStyle   = ha(r.col, act * 0.45);
          xC.fill();
          xC.shadowBlur  = 0;
        }
        xC.restore();

        // Left accent bar
        xC.fillStyle = ha(r.col, 0.25 + act * 0.6);
        xC.fillRect(SL, ry0 + 1, 5, rh);

        // Label (right of strip → left side for bigger space)
        const ryM = ry0 + rh * 0.5;
        xC.textAlign = "right";
        xC.font = `${act > 0.15 ? "bold " : ""}${act > 0.15 ? 22 : 20}px ${MN}`;
        xC.fillStyle = ha(r.col, 0.45 + act * 0.55);
        xC.fillText(r.lbl, SL - 14, ryM + 7);

        // Leader line
        xC.save();
        xC.setLineDash([3, 5]);
        xC.strokeStyle = ha(r.col, 0.18 + act * 0.3);
        xC.lineWidth = 1;
        xC.beginPath(); xC.moveTo(SL - 10, ryM); xC.lineTo(SL, ryM); xC.stroke();
        xC.restore();
      }

      // ── Hand Knob omega shape ──
      const hkY0 = ST + 0.32 * SH;
      const hkY1 = ST + 0.78 * SH;
      const hkMid = (hkY0 + hkY1) * 0.5;
      const hkX   = (SL + SR) * 0.5;
      const anyHand = Math.max(...Array.from({ length: 5 }, (_, i) => fAct[i]));
      const omR = 36;

      // Omega outline (stylized)
      xC.save();
      xC.strokeStyle = ha(TEAL, 0.30 + anyHand * 0.50);
      xC.lineWidth = anyHand > 0.2 ? 3.5 : 2.5;
      xC.shadowColor = TEAL;
      xC.shadowBlur  = 8 + anyHand * 20;
      // Arc top
      xC.beginPath();
      xC.arc(hkX, hkMid - 8, omR, Math.PI * 0.75, Math.PI * 0.25, false);
      xC.stroke();
      // Left foot
      xC.beginPath();
      xC.moveTo(hkX - omR * 0.72, hkMid + 18);
      xC.lineTo(hkX - omR, hkMid + omR * 0.6);
      xC.stroke();
      // Right foot
      xC.beginPath();
      xC.moveTo(hkX + omR * 0.72, hkMid + 18);
      xC.lineTo(hkX + omR, hkMid + omR * 0.6);
      xC.stroke();
      // Base
      xC.beginPath();
      xC.moveTo(hkX - omR * 1.1, hkMid + omR * 0.6);
      xC.lineTo(hkX + omR * 1.1, hkMid + omR * 0.6);
      xC.stroke();
      xC.shadowBlur = 0;
      xC.restore();

      // Hand knob annotation
      xC.font = `bold 21px ${MN}`;
      xC.textAlign = "center";
      xC.fillStyle = ha(TEAL, 0.55 + anyHand * 0.4);
      xC.fillText("HAND KNOB", hkX, hkMid + omR + 28);
      xC.font = `17px ${MN}`;
      xC.fillStyle = ha(TEAL, 0.35 + anyHand * 0.3);
      xC.fillText("Ω omega-shaped gyrus", hkX, hkMid + omR + 50);

      // Central sulcus label
      xC.textAlign = "left";
      xC.font = `18px ${MN}`;
      xC.fillStyle = "rgba(90,130,200,0.5)";
      xC.fillText("Central Sulcus →", SR + 16, H * 0.46);
      xC.fillText("(boundary M1/S1)", SR + 16, H * 0.46 + 22);

      // Precentral sulcus (left edge of M1)
      xC.textAlign = "right";
      xC.fillStyle = "rgba(90,130,200,0.35)";
      xC.fillText("← Precentral Sulcus", SL - 14, H * 0.06);

      // Title
      xC.textAlign = "center";
      xC.font = `bold 28px ${OR}`;
      xC.fillStyle = TEAL;
      xC.shadowColor = TEAL;
      xC.shadowBlur = 12;
      xC.fillText("Primary Motor Cortex · M1", W * 0.5, 40);
      xC.shadowBlur = 0;
      xC.font = `18px ${MN}`;
      xC.fillStyle = "rgba(180,210,240,0.45)";
      xC.fillText("Somatotopic Map · Lateral View", W * 0.5, 64);
    }

    /* ───────── DRAW UTAH ELECTRODE ARRAY ────────── */
    function drawArray() {
      const W = cArray.width, H = cArray.height;
      xA.clearRect(0, 0, W, H);
      xA.fillStyle = "#040810";
      xA.fillRect(0, 0, W, H);

      // Title
      xA.textAlign = "center";
      xA.font = `bold 28px ${OR}`;
      xA.fillStyle = GOLD;
      xA.shadowColor = GOLD;
      xA.shadowBlur = 10;
      xA.fillText("Utah Electrode Array", W * 0.5, 40);
      xA.shadowBlur = 0;
      xA.font = `18px ${MN}`;
      xA.fillStyle = "rgba(180,210,240,0.4)";
      xA.fillText("10 × 10 · 100 electrodes · 400 μm pitch", W * 0.5, 64);

      // Grid layout
      const COLS = 10, ROWS = 10;
      const EL = 50, GAP = 6; // electrode size and gap
      const PITCH = EL + GAP;
      const gridW = COLS * PITCH - GAP;
      const gridH = ROWS * PITCH - GAP;
      const ox = (W - gridW) * 0.5;
      const oy = H * 0.10;

      // Column index labels
      xA.font = `18px ${MN}`;
      xA.textAlign = "center";
      xA.fillStyle = "rgba(150,180,220,0.35)";
      for (let c = 0; c < COLS; c++) {
        xA.fillText(String(c), ox + c * PITCH + EL * 0.5, oy - 12);
      }

      // Finger region labels on left
      for (let f = 0; f < 5; f++) {
        const r0 = FINGER[f].rows[0];
        const fy = oy + r0 * PITCH + PITCH * 0.5 + 4;
        xA.textAlign = "right";
        xA.font = `${fAct[f] > 0.1 ? "bold " : ""}19px ${MN}`;
        xA.fillStyle = ha(FINGER[f].col, 0.4 + fAct[f] * 0.55);
        xA.fillText(FINGER[f].name, ox - 16, fy);
      }

      // Draw electrodes
      for (let r = 0; r < ROWS; r++) {
        for (let c = 0; c < COLS; c++) {
          const idx = r * COLS + c;
          const v   = firing[idx];
          const fi  = Math.floor(r / 2);
          const col = FINGER[fi].col;
          const ex  = ox + c * PITCH;
          const ey  = oy + r * PITCH;

          // Electrode base
          xA.save();
          xA.fillStyle = ha(col, 0.08 + v * 0.12);
          xA.beginPath();
          xA.roundRect(ex, ey, EL, EL, 6);
          xA.fill();

          // Electrode fill (firing intensity)
          if (v > 0.05) {
            xA.shadowColor = col;
            xA.shadowBlur  = 8 + v * 28;
            xA.fillStyle   = ha(col, v * 0.75);
            xA.beginPath();
            xA.roundRect(ex + 3, ey + 3, EL - 6, EL - 6, 4);
            xA.fill();
            xA.shadowBlur = 0;
          }

          // Border
          xA.strokeStyle = ha(col, 0.15 + v * 0.4);
          xA.lineWidth   = 1.5;
          xA.beginPath();
          xA.roundRect(ex, ey, EL, EL, 6);
          xA.stroke();

          // Spike indicator dot (center)
          if (v > 0.5) {
            xA.fillStyle = ha("#ffffff", Math.min(1, v * 0.85));
            xA.beginPath();
            xA.arc(ex + EL * 0.5, ey + EL * 0.5, 3.5, 0, Math.PI * 2);
            xA.fill();
          }
          xA.restore();
        }
      }

      // Firing rate legend
      const legY = oy + gridH + 36;
      xA.textAlign = "center";
      xA.font = `17px ${MN}`;
      xA.fillStyle = "rgba(150,180,220,0.45)";
      xA.fillText("Firing Rate", W * 0.5, legY);
      const legW = 200, legX = (W - legW) * 0.5;
      const lgrd = xA.createLinearGradient(legX, 0, legX + legW, 0);
      lgrd.addColorStop(0, "#112030");
      lgrd.addColorStop(0.5, ha(TEAL, 0.5));
      lgrd.addColorStop(1, ha(TEAL, 0.95));
      xA.fillStyle = lgrd;
      xA.fillRect(legX, legY + 10, legW, 10);
      xA.fillStyle = "rgba(150,180,220,0.4)";
      xA.font = `16px ${MN}`;
      xA.textAlign = "left";  xA.fillText("0 Hz", legX, legY + 36);
      xA.textAlign = "right"; xA.fillText("120 Hz", legX + legW, legY + 36);
    }

    /* ───────── DRAW ANIMATED HAND ─────────── */
    function drawHand() {
      const W = cHand.width, H = cHand.height;
      xH.clearRect(0, 0, W, H);
      xH.fillStyle = "#04080f";
      xH.fillRect(0, 0, W, H);

      // Title
      xH.textAlign = "center";
      xH.font = `bold 28px ${OR}`;
      xH.fillStyle = GRN;
      xH.shadowColor = GRN;
      xH.shadowBlur = 10;
      xH.fillText("Motor Response · Hand", W * 0.5, 40);
      xH.shadowBlur = 0;
      xH.font = `18px ${MN}`;
      xH.fillStyle = "rgba(180,210,240,0.4)";
      xH.fillText("Dorsal View · Right Hand", W * 0.5, 64);

      const cx = W * 0.5;     // palm center X
      const palmY = H * 0.74; // palm center Y

      // ── Draw palm ──
      const palmW = 190, palmH = 170;
      xH.save();
      xH.beginPath();
      xH.roundRect(cx - palmW * 0.5, palmY - palmH * 0.5, palmW, palmH, 30);
      xH.fillStyle = "#0d1828";
      xH.fill();
      xH.strokeStyle = ha(TEAL, 0.20);
      xH.lineWidth = 2;
      xH.stroke();
      xH.restore();

      // Wrist
      xH.save();
      xH.beginPath();
      xH.roundRect(cx - 55, palmY + palmH * 0.5 - 6, 110, 60, [0, 0, 18, 18]);
      xH.fillStyle = "#0d1828";
      xH.fill();
      xH.strokeStyle = ha(TEAL, 0.15);
      xH.lineWidth = 2;
      xH.stroke();
      xH.restore();

      // Wrist bones hint (parallel lines)
      for (let i = -1; i <= 1; i++) {
        xH.save();
        xH.strokeStyle = ha(TEAL, 0.08);
        xH.lineWidth = 1;
        xH.beginPath();
        xH.moveTo(cx + i * 28, palmY + palmH * 0.5);
        xH.lineTo(cx + i * 28, palmY + palmH * 0.5 + 50);
        xH.stroke();
        xH.restore();
      }

      // ── Draw fingers ──
      // Finger base positions on palm (x offset from center)
      // Thumb is on the left side, offset lower
      const fingerDefs = [
        // fi, baseXOffset, baseYOffset (from palmTop), angle (up=−π/2), seg lens, widths
        { fi:0, bx: -102, by:  20, angle: -Math.PI * 0.72, lens:[50, 42, 34], ws:[22,18,14], name:"Thumb"  },
        { fi:1, bx:  -62, by: -80, angle: -Math.PI * 0.52, lens:[68, 54, 40], ws:[22,18,14], name:"Index"  },
        { fi:2, bx:   -8, by: -90, angle: -Math.PI * 0.50, lens:[76, 60, 44], ws:[24,20,16], name:"Middle" },
        { fi:3, bx:   46, by: -80, angle: -Math.PI * 0.50, lens:[68, 54, 40], ws:[22,18,14], name:"Ring"   },
        { fi:4, bx:  100, by: -52, angle: -Math.PI * 0.52, lens:[50, 40, 30], ws:[18,14,11], name:"Pinky"  },
      ];

      for (const fd of fingerDefs) {
        const col = FINGER[fd.fi].col;
        const act = fAct[fd.fi];
        const flex = act * (fd.fi === 0 ? 0.55 : 0.68); // max flex angle per joint

        const bx = cx + fd.bx;
        const by = palmY + fd.by;

        xH.save();
        xH.translate(bx, by);
        xH.rotate(fd.angle);

        for (let seg = 0; seg < 3; seg++) {
          const segLen = fd.lens[seg];
          const segW   = fd.ws[seg];
          const jAng   = seg === 0 ? 0 : flex; // only joints 1 & 2 flex

          if (seg > 0) {
            xH.translate(0, -fd.lens[seg - 1]);
            xH.rotate(-jAng);
          }

          // Phalange
          xH.save();
          xH.shadowColor = col;
          xH.shadowBlur  = 4 + act * 14;
          xH.fillStyle   = ha(col, 0.10 + act * 0.18);
          xH.beginPath();
          xH.roundRect(-segW * 0.5, -segLen, segW, segLen, segW * 0.28);
          xH.fill();
          xH.strokeStyle = ha(col, 0.25 + act * 0.50);
          xH.lineWidth   = 2;
          xH.stroke();
          xH.shadowBlur  = 0;
          xH.restore();

          // Joint dot
          if (seg < 2) {
            xH.beginPath();
            xH.arc(0, 0, 4, 0, Math.PI * 2);
            xH.fillStyle = ha(col, 0.35 + act * 0.5);
            xH.fill();
          }
          // Fingertip
          if (seg === 2) {
            xH.save();
            xH.shadowColor = col;
            xH.shadowBlur  = act * 18;
            xH.beginPath();
            xH.arc(0, -segLen, segW * 0.4, 0, Math.PI * 2);
            xH.fillStyle = ha(col, 0.30 + act * 0.55);
            xH.fill();
            xH.shadowBlur = 0;
            xH.restore();
          }
        }
        xH.restore();

        // Finger label
        const labelX = bx + fd.bx * 0.0;
        const labelY = by - (fd.lens[0] + fd.lens[1] + fd.lens[2]) * Math.cos(flex * 0.5) - 20;
        xH.textAlign = "center";
        xH.font = `${act > 0.15 ? "bold " : ""}17px ${MN}`;
        xH.fillStyle = ha(col, 0.35 + act * 0.6);
        xH.fillText(fd.name, bx, Math.min(H - 20, labelY));
      }

      // Activation status
      const anyAct = Math.max(...Array.from({ length: 5 }, (_, i) => fAct[i]));
      xH.textAlign = "center";
      xH.font = `18px ${MN}`;
      xH.fillStyle = ha(GRN, 0.3 + anyAct * 0.65);
      xH.fillText(anyAct > 0.4 ? "◉ ACTIVE · electrode drive" : "◎ standby", W * 0.5, H - 24);
    }

    /* ───────── MAIN LOOP ─────────── */
    const loop = () => {
      t++;
      updateFiring();
      drawCortex();
      drawArray();
      drawHand();
      animRef.current = requestAnimationFrame(loop);
    };
    loop();
    return () => cancelAnimationFrame(animRef.current);
  }, []);

  /* ── Reusable style helpers ── */
  const card = (col = TEAL): React.CSSProperties => ({
    background: "rgba(0,0,0,0.42)", border: `1px solid ${col}22`, borderRadius: 4, padding: "12px 16px",
  });
  const secLabel: React.CSSProperties = {
    fontFamily: MN, fontSize: 8, letterSpacing: "0.2em", color: DIM,
    textTransform: "uppercase", marginBottom: 10, paddingBottom: 4,
    borderBottom: "1px solid rgba(31,212,200,0.1)",
  };
  const h2 = (col = TEAL): React.CSSProperties => ({
    fontFamily: OR, fontSize: 11, color: col, letterSpacing: 1, margin: "0 0 8px",
  });
  const body: React.CSSProperties = {
    fontSize: 11.5, color: "rgba(200,210,228,0.72)", lineHeight: 1.72,
  };

  return (
    <div style={{ minHeight: "100%", background: BG, color: "#d4e4f4",
      fontFamily: "'Rajdhani',sans-serif", overflowY: "auto" }}>
      <div style={{ maxWidth: 1160, margin: "0 auto", padding: "16px 20px" }}>

        {/* ── Title ── */}
        <div style={{ marginBottom: 14 }}>
          <div style={{ display: "inline-block", border: `1px solid ${TEAL}55`,
            padding: "3px 10px", fontSize: 9, letterSpacing: "0.2em",
            fontFamily: MN, color: TEAL, marginBottom: 8, borderRadius: 2 }}>
            AETHER · MOTOR CORTEX
          </div>
          <h1 style={{ fontFamily: OR, fontSize: 26, color: "#fff",
            margin: "0 0 4px", letterSpacing: 2, textShadow: `0 0 24px ${TEAL}66` }}>
            Motor Cortex · Hand Knob · M1
          </h1>
          <p style={{ ...body, margin: 0, maxWidth: 820 }}>
            The <strong style={{ color: TEAL }}>hand knob</strong> is an omega-shaped (Ω) or epsilon-shaped
            fold in the primary motor cortex (M1) — the precentral gyrus — that exclusively controls fine hand and finger
            movement. A 10×10 <strong style={{ color: GOLD }}>Utah electrode array</strong> implanted here reads
            and writes single-neuron firing patterns across 100 platinum electrodes at 400 μm pitch, enabling
            prosthetic control and brain-computer interface (BCI) applications.
          </p>
        </div>

        {/* ── Three live canvases ── */}
        <div style={{ display: "flex", gap: 14, marginBottom: 20, alignItems: "flex-start" }}>
          {/* Canvas 1: Motor Cortex Map */}
          <div style={{ flex: 1.15, ...card(TEAL), padding: 0, overflow: "hidden", borderRadius: 6 }}>
            <div style={{ padding: "8px 14px", borderBottom: `1px solid ${TEAL}22` }}>
              <div style={{ fontFamily: OR, fontSize: 10, color: TEAL, letterSpacing: 1 }}>
                01 · SOMATOTOPIC MAP
              </div>
              <div style={{ fontFamily: MN, fontSize: 9, color: DIM }}>Medial → Lateral · M1 strip</div>
            </div>
            <canvas ref={cortexRef} width={680} height={800}
              style={{ width: "100%", height: "auto", display: "block" }} />
          </div>

          {/* Canvas 2: Utah Array */}
          <div style={{ flex: 1, ...card(GOLD), padding: 0, overflow: "hidden", borderRadius: 6 }}>
            <div style={{ padding: "8px 14px", borderBottom: `1px solid ${GOLD}22` }}>
              <div style={{ fontFamily: OR, fontSize: 10, color: GOLD, letterSpacing: 1 }}>
                02 · ELECTRODE FIRING
              </div>
              <div style={{ fontFamily: MN, fontSize: 9, color: DIM }}>10×10 Utah Array · sequential stimulation</div>
            </div>
            <canvas ref={arrayRef} width={680} height={830}
              style={{ width: "100%", height: "auto", display: "block" }} />
          </div>

          {/* Canvas 3: Hand */}
          <div style={{ flex: 0.85, ...card(GRN), padding: 0, overflow: "hidden", borderRadius: 6 }}>
            <div style={{ padding: "8px 14px", borderBottom: `1px solid ${GRN}22` }}>
              <div style={{ fontFamily: OR, fontSize: 10, color: GRN, letterSpacing: 1 }}>
                03 · MOTOR RESPONSE
              </div>
              <div style={{ fontFamily: MN, fontSize: 9, color: DIM }}>Finger flexion · BCI output</div>
            </div>
            <canvas ref={handRef} width={560} height={830}
              style={{ width: "100%", height: "auto", display: "block" }} />
          </div>
        </div>

        {/* ── Electrode → Finger mapping legend ── */}
        <div style={{ display: "flex", gap: 10, marginBottom: 16 }}>
          {FINGER.map((f, i) => (
            <div key={i} style={{ ...card(f.col), flex: 1, padding: "10px 12px" }}>
              <div style={{ fontFamily: OR, fontSize: 10, color: f.col, letterSpacing: 1, marginBottom: 4 }}>
                {f.name}
              </div>
              <div style={{ fontFamily: MN, fontSize: 9, color: DIM }}>
                Array rows {f.rows[0]}–{f.rows[1]}
              </div>
              <div style={{ fontFamily: MN, fontSize: 9, color: "rgba(180,200,230,0.5)", marginTop: 3 }}>
                {i === 0 ? "Most lateral · M1" : i === 4 ? "Near medial" : "Hand knob region"}
              </div>
            </div>
          ))}
        </div>

        {/* ── Scientific context ── */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10, marginBottom: 20 }}>
          <div style={card(TEAL)}>
            <div style={secLabel}>Anatomy</div>
            <div style={h2(TEAL)}>Hand Knob · Omega Sign</div>
            <div style={body}>
              The hand knob (also called the epsilon or omega sign) is the characteristic
              morphology of M1 in the central sulcus. Visible on axial MRI as a backward Ω
              shape, it is the most consistent anatomical landmark for hand motor representation.
              Brodmann Area 4 · precentral gyrus.
            </div>
          </div>
          <div style={card(GOLD)}>
            <div style={secLabel}>Utah Array · BCI</div>
            <div style={h2(GOLD)}>Intracortical Recording</div>
            <div style={body}>
              The Utah Electrode Array (Blackrock Neurotech) penetrates 1.5 mm into cortex.
              100 platinum-tipped silicon shanks at 400 μm spacing record single-unit and
              multiunit activity up to 120 Hz per electrode. Enables high-dimensional neural
              decoding for prosthetic hand control (BrainGate, Neuralink).
            </div>
          </div>
          <div style={card(GRN)}>
            <div style={secLabel}>AETHER Connection</div>
            <div style={h2(GRN)}>Caelus + Orin · Se + Te</div>
            <div style={body}>
              In the AETHER cognitive model, fine motor control maps to{" "}
              <strong style={{ color: GRN }}>Caelus</strong> (Se · present-moment input handler)
              receiving the electrode signal, and <strong style={{ color: GRN }}>Orin</strong>{" "}
              (Te · multi-system bridge) coordinating the motor output. The hand knob is where
              abstract intention crystallises into embodied action.
            </div>
          </div>
          <div style={card(VIO)}>
            <div style={secLabel}>Signal Chain</div>
            <div style={h2(VIO)}>Neuron → Electrode → Finger</div>
            <div style={body}>
              Pyramidal neurons in M1 fire action potentials → travel down corticospinal tract
              → synapse on spinal alpha-motor neurons → innervate hand intrinsic muscles
              (interossei, lumbricals) and extrinsic flexors/extensors → produce graded
              finger flexion/extension. Latency: ~20 ms cortex → fingertip.
            </div>
          </div>
          <div style={card(PINK)}>
            <div style={secLabel}>Somatotopy</div>
            <div style={h2(PINK)}>Homunculus Distortion</div>
            <div style={body}>
              The hand and face disproportionately dominate M1 cortical area — the hand
              alone occupies ~25% of M1 despite being less than 1% of body mass.
              This over-representation reflects the extraordinary dexterity demands of
              human fine motor control. The hand knob is the cortical correlate of this expansion.
            </div>
          </div>
          <div style={card(ORG)}>
            <div style={secLabel}>Clinical Applications</div>
            <div style={h2(ORG)}>BCI · Neuroprosthetics</div>
            <div style={body}>
              Electrode arrays implanted in the hand knob allow patients with spinal cord
              injury or ALS to control robotic hands with decoded neural intent.
              The simulation above represents the sequential stimulation pattern used in
              closed-loop prosthetic systems: decode firing → command actuator → record efference copy.
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
