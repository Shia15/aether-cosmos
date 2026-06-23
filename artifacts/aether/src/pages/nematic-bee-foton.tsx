import React, { useEffect, useRef } from "react";

const V = {
  bg:    "#04060E",
  gold:  "#C8A030",
  honey: "#D48A08",
  amb:   "#FF9933",
  blue:  "#4488FF",
  vio:   "#9966FF",
  green: "#44CC77",
  rose:  "#FF6699",
  plasma:"#FF4477",
  cyan:  "#22DDFF",
  rust:  "#C1440E",
  iron:  "#8B3A1A",
  ink:   "#B8CCE8",
  dim:   "#2A3050",
  mono:  "'Space Mono',monospace" as const,
  serif: "'Crimson Pro',serif"    as const,
  disp:  "'Cinzel',serif"         as const,
};

/* ─────────────────────────────────────────────────────────────────────────
   CANVAS 1 · Nematic Liquid Crystal Director Field · Defects · Birefringence
   ───────────────────────────────────────────────────────────────────────── */
function NematicDirectorCanvas() {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const cv = ref.current; if (!cv) return;
    const CH = 400, PR = window.devicePixelRatio || 1;
    const CW = Math.max(cv.offsetWidth, 520);
    cv.width = CW * PR; cv.height = CH * PR; cv.style.height = CH + "px";
    const ctx = cv.getContext("2d")!; ctx.scale(PR, PR);

    /* Grid parameters */
    const GW = Math.floor(CW * 0.63), GH = CH;
    const NX = 52, NY = 38;
    const DX = GW / NX, DY = GH / NY;

    /* Director field: θ ∈ [0, π) (headless vector) */
    let theta = Float32Array.from({ length: NX * NY }, (_, i) => {
      const x = (i % NX) / NX, y = Math.floor(i / NX) / NY;
      /* seed with a smooth initial alignment + noise */
      return (Math.PI * 0.4 + (Math.random() - 0.5) * Math.PI * 0.7 +
        Math.sin(x * 8) * 0.3 + Math.cos(y * 6) * 0.25 + Math.PI) % Math.PI;
    });

    let frame = 0, raf = 0;
    const RELAX = 5; // relaxation steps per frame

    const relax = () => {
      const next = new Float32Array(theta);
      const alpha = 0.22;
      for (let j = 1; j < NY - 1; j++) {
        for (let i = 1; i < NX - 1; i++) {
          const idx = j * NX + i;
          /* 4-neighbor circular mean (π-periodic using sin/cos of 2θ) */
          const ns = [
            theta[(j-1)*NX+i], theta[(j+1)*NX+i],
            theta[j*NX+i-1],   theta[j*NX+i+1],
          ];
          const sx = ns.reduce((s, t) => s + Math.sin(2*t), 0);
          const sy = ns.reduce((s, t) => s + Math.cos(2*t), 0);
          const meanTheta = 0.5 * Math.atan2(sx, sy);
          /* move toward mean, respecting π-periodicity */
          let diff = meanTheta - theta[idx];
          /* fold to [-π/2, π/2] */
          while (diff >  Math.PI / 2) diff -= Math.PI;
          while (diff < -Math.PI / 2) diff += Math.PI;
          next[idx] = (theta[idx] + alpha * diff + Math.PI * 2) % Math.PI;
        }
      }
      theta = next;
    };

    /* Detect defects: winding number around each 2×2 plaquette */
    const detectDefects = (): Array<{ x:number; y:number; charge:number }> => {
      const defs: Array<{x:number;y:number;charge:number}> = [];
      for (let j = 0; j < NY - 1; j++) {
        for (let i = 0; i < NX - 1; i++) {
          const ts = [
            theta[j*NX+i], theta[j*NX+i+1],
            theta[(j+1)*NX+i+1], theta[(j+1)*NX+i],
          ];
          let wind = 0;
          for (let k = 0; k < 4; k++) {
            let d = (ts[(k+1)%4] - ts[k]) * 2; // *2 because π-periodic → double
            while (d >  Math.PI) d -= Math.PI * 2;
            while (d < -Math.PI) d += Math.PI * 2;
            wind += d;
          }
          wind /= (Math.PI * 2);
          if (Math.abs(wind) > 0.4) {
            defs.push({ x: (i + 0.5) * DX, y: (j + 0.5) * DY, charge: Math.round(wind * 2) / 2 });
          }
        }
      }
      return defs;
    };

    /* Order parameter S — global alignment measure */
    const orderParam = () => {
      const sx = Array.from(theta).reduce((s, t) => s + Math.cos(2*t), 0) / theta.length;
      const sy = Array.from(theta).reduce((s, t) => s + Math.sin(2*t), 0) / theta.length;
      return Math.sqrt(sx*sx + sy*sy);
    };

    const draw = () => {
      frame++;
      for (let k = 0; k < RELAX; k++) relax();

      ctx.fillStyle = "#050810"; ctx.fillRect(0, 0, GW, GH);

      /* ── DIRECTOR FIELD (birefringence colors) ── */
      const LINE = Math.min(DX, DY) * 0.6;
      for (let j = 0; j < NY; j++) {
        for (let i = 0; i < NX; i++) {
          const t  = theta[j*NX+i];
          const cx = (i + 0.5) * DX, cy = (j + 0.5) * DY;
          /* crossed-polarizer intensity: sin²(2θ) × sin²(Γ/2), Γ≈π */
          const intensity = Math.sin(2 * t) ** 2;
          /* birefringence hue: angle maps to rainbow */
          const hue = (t / Math.PI) * 300; // 0→300: violet→red avoiding orange/green overlap
          const sat = 70 + intensity * 25;
          const lit = 15 + intensity * 48;
          ctx.strokeStyle = `hsl(${hue},${sat}%,${lit}%)`;
          ctx.lineWidth   = 1.3;
          ctx.beginPath();
          ctx.moveTo(cx - LINE / 2 * Math.cos(t), cy - LINE / 2 * Math.sin(t));
          ctx.lineTo(cx + LINE / 2 * Math.cos(t), cy + LINE / 2 * Math.sin(t));
          ctx.stroke();
        }
      }

      /* ── DEFECTS ── */
      detectDefects().forEach(d => {
        const col = d.charge > 0 ? V.cyan : V.plasma;
        ctx.strokeStyle = col + "CC"; ctx.lineWidth = 1.5;
        ctx.beginPath(); ctx.arc(d.x, d.y, 7, 0, Math.PI * 2); ctx.stroke();
        ctx.fillStyle = col + "55";
        ctx.beginPath(); ctx.arc(d.x, d.y, 5, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = col; ctx.font = `bold 8px ${V.mono}`;
        ctx.fillText(d.charge > 0 ? "+" : "−", d.x - 3, d.y + 3);
      });

      /* ── RIGHT PANEL (theory) ── */
      const PX = GW;
      ctx.fillStyle = V.dim + "11"; ctx.fillRect(PX, 0, CW - PX, GH);
      ctx.strokeStyle = V.dim + "55"; ctx.lineWidth = 0.8;
      ctx.beginPath(); ctx.moveTo(PX, 0); ctx.lineTo(PX, GH); ctx.stroke();

      const S = orderParam();
      const PW = CW - PX;

      /* Order parameter bar */
      ctx.fillStyle = V.cyan + "55"; ctx.font = `bold 6.5px ${V.mono}`;
      ctx.fillText("ORDER PARAM S", PX + 8, 18);
      ctx.fillStyle = V.dim + "44"; ctx.fillRect(PX + 8, 24, PW - 16, 12);
      const sg = ctx.createLinearGradient(PX + 8, 24, PX + 8 + (PW-16)*S, 24);
      sg.addColorStop(0, V.vio + "88"); sg.addColorStop(1, V.cyan + "AA");
      ctx.fillStyle = sg; ctx.fillRect(PX + 8, 24, (PW - 16) * S, 12);
      ctx.fillStyle = V.cyan + "AA"; ctx.font = `6px ${V.mono}`;
      ctx.fillText(`S = ${S.toFixed(3)}`, PX + 8, 47);

      /* Frank elastic energy labels */
      const eqns = [
        { label:"SPLAY  K₁", col:V.gold,  eq:"K₁(∇·n̂)²" },
        { label:"TWIST  K₂", col:V.green, eq:"K₂(n̂·∇×n̂)²" },
        { label:"BEND   K₃", col:V.rose,  eq:"K₃(n̂×∇×n̂)²" },
      ];
      eqns.forEach((e, i) => {
        const ey = 66 + i * 40;
        ctx.fillStyle = e.col + "88"; ctx.font = `6.5px ${V.mono}`;
        ctx.fillText(e.label, PX + 8, ey);
        ctx.fillStyle = e.col + "55"; ctx.font = `5.5px ${V.mono}`;
        ctx.fillText("F = ∫ " + e.eq + " dV", PX + 8, ey + 12);
        /* mini icon — type of deformation */
        const ix = PX + PW - 22, iy = ey - 8, ir = 10;
        ctx.strokeStyle = e.col + "66"; ctx.lineWidth = 0.8;
        if (i === 0) { /* splay: fan */
          for (let a = -3; a <= 3; a++) {
            const ang = a * Math.PI / 12;
            ctx.beginPath(); ctx.moveTo(ix, iy);
            ctx.lineTo(ix + ir*Math.cos(ang), iy + ir*Math.sin(ang)); ctx.stroke();
          }
        } else if (i === 1) { /* twist: helix */
          ctx.beginPath(); ctx.ellipse(ix, iy, ir, 4, 0, 0, Math.PI*2); ctx.stroke();
        } else { /* bend: arc */
          ctx.beginPath(); ctx.arc(ix, iy + 5, 8, -Math.PI*0.8, -Math.PI*0.2); ctx.stroke();
        }
      });

      /* Defect legend */
      ctx.fillStyle = V.ink + "44"; ctx.font = `6.5px ${V.mono}`;
      ctx.fillText("DEFECTS", PX + 8, 200);
      ctx.fillStyle = V.cyan + "AA"; ctx.font = `6px ${V.mono}`;
      ctx.fillText("⊕ +½ disclination", PX + 8, 214);
      ctx.fillStyle = V.plasma + "AA";
      ctx.fillText("⊖ −½ disclination", PX + 8, 226);
      ctx.fillStyle = V.dim + "88"; ctx.font = `5px ${V.mono}`;
      ctx.fillText("topological charge:", PX + 8, 240);
      ctx.fillText("q = (1/2π)∮dθ", PX + 8, 252);
      ctx.fillText("creation in ± pairs", PX + 8, 264);

      /* Bee eye polarization section */
      ctx.fillStyle = V.honey + "88"; ctx.font = `6.5px ${V.mono}`;
      ctx.fillText("BEE COMPOUND EYE", PX + 8, 295);
      ctx.fillStyle = V.honey + "55"; ctx.font = `5px ${V.mono}`;
      ctx.fillText("DRA rhabdomeres:", PX + 8, 308);
      ctx.fillText("aligned rhodopsin", PX + 8, 319);
      ctx.fillText("→ polarized light", PX + 8, 330);
      ctx.fillText("detection (LC-like)", PX + 8, 341);
      ctx.fillText("sky compass navi-", PX + 8, 352);
      ctx.fillText("gation even cloudy", PX + 8, 363);

      /* mini compound eye diagram */
      const EX = PX + PW * 0.5, EY = 395;
      for (let ek = 0; ek < 7; ek++) {
        const ea = (ek / 7) * Math.PI * 2;
        const er = ek === 0 ? 0 : 12;
        const exi = EX + er * Math.cos(ea), eyi = EY + er * Math.sin(ea);
        ctx.strokeStyle = V.honey + "66"; ctx.lineWidth = 0.7;
        ctx.beginPath(); ctx.arc(exi, eyi, 6, 0, Math.PI * 2); ctx.stroke();
        const lineAng = theta[Math.floor(EY/DY)*NX + Math.floor(EX/DX)];
        ctx.strokeStyle = V.honey + "AA"; ctx.lineWidth = 0.8;
        ctx.beginPath(); ctx.moveTo(exi - 4*Math.cos(lineAng + ek*0.4), eyi - 4*Math.sin(lineAng + ek*0.4));
        ctx.lineTo(exi + 4*Math.cos(lineAng + ek*0.4), eyi + 4*Math.sin(lineAng + ek*0.4)); ctx.stroke();
      }

      /* labels */
      ctx.fillStyle = V.ink + "22"; ctx.font = `6.5px ${V.mono}`;
      ctx.fillText("NEMATIC LC DIRECTOR FIELD  ·  1-CONSTANT FRANK ELASTIC RELAXATION", 8, GH - 8);

      raf = requestAnimationFrame(draw);
    };
    raf = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(raf);
  }, []);
  return <canvas ref={ref} style={{ width:"100%", height:"400px", borderRadius:6, display:"block" }} />;
}

/* ─────────────────────────────────────────────────────────────────────────
   CANVAS 2 · Bee-Car Prototype · Nematic Wing Membrane · Flower Charging
   ───────────────────────────────────────────────────────────────────────── */
function BeeCarCanvas() {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const cv = ref.current; if (!cv) return;
    const CH = 430, PR = window.devicePixelRatio || 1;
    const CW = Math.max(cv.offsetWidth, 520);
    cv.width = CW * PR; cv.height = CH * PR; cv.style.height = CH + "px";
    const ctx = cv.getContext("2d")!; ctx.scale(PR, PR);

    let frame = 0, raf = 0;
    const CYCLE = 500; // frames per charge cycle

    /* flower center */
    const FX = CW * 0.5, FY = CH * 0.83;

    const drawFlower = (charge: number) => {
      /* petals */
      for (let p = 0; p < 8; p++) {
        const pa = (p / 8) * Math.PI * 2;
        const px = FX + 55 * Math.cos(pa), py = FY + 55 * Math.sin(pa);
        ctx.fillStyle = charge > 0.1 ? V.gold + "CC" : V.honey + "88";
        ctx.beginPath(); ctx.ellipse(px, py, 22, 10, pa, 0, Math.PI * 2); ctx.fill();
        /* solar cells on petal */
        ctx.strokeStyle = V.blue + "44"; ctx.lineWidth = 0.5;
        for (let sc = 0; sc < 3; sc++) {
          ctx.strokeRect(px + (sc-1)*8 - 3, py - 4, 6, 8);
        }
      }
      /* central disk */
      const diskG = ctx.createRadialGradient(FX, FY, 0, FX, FY, 30);
      diskG.addColorStop(0, V.gold + "CC"); diskG.addColorStop(1, V.honey + "44");
      ctx.fillStyle = diskG;
      ctx.beginPath(); ctx.arc(FX, FY, 30, 0, Math.PI * 2); ctx.fill();
      /* charging coil */
      ctx.strokeStyle = charge > 0.1 ? V.cyan + "BB" : V.cyan + "44";
      ctx.lineWidth = 2;
      for (let c = 1; c <= 4; c++) {
        const ca = ((frame * 0.04 * charge) + (c-1) * Math.PI/2) % (Math.PI * 2);
        ctx.beginPath(); ctx.arc(FX, FY, c * 5, ca, ca + Math.PI * 1.5); ctx.stroke();
      }
      /* charging label */
      ctx.fillStyle = V.cyan + (charge > 0.3 ? "CC" : "44"); ctx.font = `5.5px ${V.mono}`;
      ctx.fillText("CHARGING PAD", FX - 28, FY + 42);
      ctx.fillText(`PHOTOVOLTAIC  ${(charge * 100).toFixed(0)}%`, FX - 30, FY + 53);
    };

    /* Draw the bee-car body */
    const drawBeeCar = (x: number, y: number, wingPhase: number, charging: boolean) => {
      const W = 90; // half-width of main body

      /* ── MAIN FUSELAGE ── */
      ctx.fillStyle = "#1A2035";
      ctx.beginPath();
      ctx.moveTo(x - W * 0.25, y - 28);
      ctx.bezierCurveTo(x - W * 0.25, y - 38, x + W * 0.25, y - 38, x + W * 0.25, y - 28);
      ctx.lineTo(x + W * 0.25, y + 28);
      ctx.bezierCurveTo(x + W * 0.25, y + 34, x - W * 0.25, y + 34, x - W * 0.25, y + 28);
      ctx.closePath(); ctx.fill();
      /* body stripes (bee heritage) */
      ctx.fillStyle = V.honey + "33";
      for (let s = 0; s < 3; s++) {
        ctx.fillRect(x - W * 0.24, y - 10 + s * 14, W * 0.48, 8);
      }
      ctx.strokeStyle = V.honey + "66"; ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(x - W * 0.25, y - 28);
      ctx.bezierCurveTo(x - W * 0.25, y - 38, x + W * 0.25, y - 38, x + W * 0.25, y - 28);
      ctx.lineTo(x + W * 0.25, y + 28);
      ctx.bezierCurveTo(x + W * 0.25, y + 34, x - W * 0.25, y + 34, x - W * 0.25, y + 28);
      ctx.closePath(); ctx.stroke();

      /* ── COCKPIT / COMPOUND EYE NOSE ── */
      const eyeG = ctx.createRadialGradient(x, y - 36, 2, x, y - 36, 18);
      eyeG.addColorStop(0, V.cyan + "44"); eyeG.addColorStop(1, V.blue + "22");
      ctx.fillStyle = eyeG;
      ctx.beginPath(); ctx.ellipse(x, y - 38, 18, 14, 0, 0, Math.PI * 2); ctx.fill();
      /* hex compound eye grid */
      ctx.strokeStyle = V.cyan + "66"; ctx.lineWidth = 0.5;
      for (let hx2 = -2; hx2 <= 2; hx2++) {
        for (let hy2 = -1; hy2 <= 1; hy2++) {
          const offX = hx2 * 7 + (hy2 % 2) * 3.5;
          const offY = hy2 * 6;
          const lx = x + offX, ly = y - 38 + offY;
          if (Math.sqrt(offX**2 + offY**2) < 16) {
            ctx.beginPath(); ctx.arc(lx, ly, 3, 0, Math.PI * 2); ctx.stroke();
          }
        }
      }
      /* polarization sensor label */
      ctx.fillStyle = V.cyan + "66"; ctx.font = `4.5px ${V.mono}`;
      ctx.fillText("LC-POL NAV", x - 19, y - 56);

      /* ── 4 WINGS (nematic LC membrane) ── */
      const wflap = Math.sin(wingPhase) * (charging ? 0.15 : 0.35);
      const wings = [
        { dx:-W*1.1, dy:-12, sw:W*0.95, sh:28, angle: -wflap * 0.8, front:false },
        { dx: W*0.15,dy:-12, sw:W*0.95, sh:28, angle:  wflap * 0.8, front:false },
        { dx:-W*0.75, dy:-18, sw:W*0.6, sh:18, angle: -wflap,       front:true  },
        { dx: W*0.15, dy:-18, sw:W*0.6, sh:18, angle:  wflap,       front:true  },
      ];
      wings.forEach(w => {
        ctx.save();
        ctx.translate(x, y);
        ctx.rotate(w.angle);
        /* wing membrane with nematic director pattern */
        const wG = ctx.createLinearGradient(w.dx, w.dy, w.dx + w.sw, w.dy);
        wG.addColorStop(0, V.cyan + "08"); wG.addColorStop(1, V.vio + "22");
        ctx.fillStyle = wG;
        ctx.strokeStyle = V.cyan + "55"; ctx.lineWidth = 0.8;
        ctx.beginPath();
        ctx.moveTo(w.dx, w.dy);
        ctx.bezierCurveTo(w.dx + w.sw*0.3, w.dy - w.sh*0.3, w.dx + w.sw*0.7, w.dy - w.sh*0.2, w.dx + w.sw, w.dy + w.sh*0.15);
        ctx.lineTo(w.dx + w.sw, w.dy + w.sh);
        ctx.bezierCurveTo(w.dx + w.sw*0.7, w.dy + w.sh*1.15, w.dx + w.sw*0.3, w.dy + w.sh*1.1, w.dx, w.dy + w.sh);
        ctx.closePath(); ctx.fill(); ctx.stroke();
        /* nematic director lines on wing */
        ctx.strokeStyle = V.cyan + "30"; ctx.lineWidth = 0.5;
        for (let wr = 0; wr < 5; wr++) {
          const wt = wr / 4;
          const wx = w.dx + wt * w.sw, wy = w.dy + w.sh * 0.5;
          const lineAng = w.angle * 3 + wt * Math.PI * 0.4;
          ctx.beginPath();
          ctx.moveTo(wx - 6*Math.cos(lineAng), wy - 6*Math.sin(lineAng));
          ctx.lineTo(wx + 6*Math.cos(lineAng), wy + 6*Math.sin(lineAng));
          ctx.stroke();
        }
        /* wing corrugation ribs */
        ctx.strokeStyle = V.blue + "33"; ctx.lineWidth = 0.7;
        for (let vein = 0; vein < 4; vein++) {
          const vt = vein / 3;
          ctx.beginPath();
          ctx.moveTo(w.dx + vt * w.sw * 0.4, w.dy);
          ctx.lineTo(w.dx + vt * w.sw, w.dy + w.sh); ctx.stroke();
        }
        ctx.restore();
      });

      /* ── 4 ENGINE PODS ── */
      [[-W*0.62, 8], [W*0.62, 8], [-W*0.45, -8], [W*0.45, -8]].forEach(([ex, ey]) => {
        ctx.fillStyle = "#252A3A";
        ctx.beginPath(); ctx.ellipse(x+ex, y+ey, 10, 6, 0, 0, Math.PI*2); ctx.fill();
        /* thrust glow */
        const tg = ctx.createRadialGradient(x+ex, y+ey+8, 0, x+ex, y+ey+8, 12);
        const alpha = charging ? 0.05 : 0.25 + 0.15*Math.sin(frame*0.1 + (ex as number)*0.02);
        tg.addColorStop(0, V.cyan + Math.round(alpha*255).toString(16).padStart(2,"0"));
        tg.addColorStop(1, "rgba(0,0,0,0)");
        ctx.fillStyle = tg; ctx.beginPath(); ctx.arc(x+ex, y+ey+8, 12, 0, Math.PI*2); ctx.fill();
      });

      /* ── STINGER / REAR THRUSTER ── */
      ctx.fillStyle = V.plasma + "88";
      ctx.beginPath(); ctx.moveTo(x-4, y+34); ctx.lineTo(x+4, y+34); ctx.lineTo(x, y+46); ctx.closePath(); ctx.fill();
      const thr = ctx.createRadialGradient(x, y+50, 0, x, y+50, 18);
      const ta  = charging ? 0.05 : 0.3 + 0.2*Math.sin(frame*0.07);
      thr.addColorStop(0, V.plasma + Math.round(ta*255).toString(16).padStart(2,"0"));
      thr.addColorStop(1, "rgba(0,0,0,0)");
      ctx.fillStyle = thr; ctx.beginPath(); ctx.arc(x, y+50, 18, 0, Math.PI*2); ctx.fill();

      /* charging arc to flower */
      if (charging && frame % 3 < 2) {
        ctx.strokeStyle = V.cyan + "88"; ctx.lineWidth = 1.2;
        ctx.setLineDash([4, 8]);
        [[-15, 0], [0, 0], [15, 0]].forEach(([dx]) => {
          ctx.beginPath();
          ctx.moveTo(x + dx, y + 34);
          ctx.bezierCurveTo(x + dx, y + 60, FX + dx * 0.5, FY - 40, FX, FY - 28);
          ctx.stroke();
        });
        ctx.setLineDash([]);
        /* charge label */
        ctx.fillStyle = V.cyan + "AA"; ctx.font = `6px ${V.mono}`;
        ctx.fillText("⚡ CHARGING · QUANTUM PHOTOVOLTAIC", x - 90, y + 72);
      }

      /* ── TECH SPEC LABELS ── */
      ctx.fillStyle = V.dim + "88"; ctx.font = `5px ${V.mono}`;
      const specs = [
        ["WINGSPAN", "2.4 m"],["MASS", "180 kg"],
        ["RANGE", "400 km"],["CHARGE TIME", "22 min"],
        ["CRUISE V", "180 km/h"],["LC WING", "morphing nematic"],
      ];
      specs.forEach(([k,v], i) => {
        const sx = i < 3 ? x - W * 1.6 : x + W * 1.1;
        const sy = CH * 0.25 + (i % 3) * 18;
        ctx.fillStyle = V.dim + "66"; ctx.fillText(k, sx, sy);
        ctx.fillStyle = V.gold + "AA"; ctx.fillText(v, sx, sy + 10);
      });
    };

    const draw = () => {
      frame++;
      ctx.fillStyle = V.bg; ctx.fillRect(0, 0, CW, CH);

      /* ground glow */
      const gg = ctx.createRadialGradient(FX, FY, 0, FX, FY, 120);
      gg.addColorStop(0, V.gold + "18"); gg.addColorStop(1, "rgba(0,0,0,0)");
      ctx.fillStyle = gg; ctx.fillRect(0, 0, CW, CH);

      /* phase of cycle: 0-200f hover, 200-300f descend, 300-450f charging, 450-500f ascend */
      const phase = frame % CYCLE;
      let carY: number, charging: boolean, chargeLevel: number;
      if (phase < 200) {
        carY = CH * 0.32 + Math.sin(frame * 0.04) * 8;
        charging = false; chargeLevel = 0;
      } else if (phase < 300) {
        const t = (phase - 200) / 100;
        carY = CH * 0.32 + t * (FY - 75 - CH * 0.32);
        charging = false; chargeLevel = 0;
      } else if (phase < 450) {
        carY = FY - 75;
        charging = true;
        chargeLevel = Math.min(1, (phase - 300) / 150);
      } else {
        const t = (phase - 450) / 50;
        carY = FY - 75 - t * (FY - 75 - CH * 0.32);
        charging = false; chargeLevel = 1 - t;
      }

      drawFlower(charging ? (phase-300)/150 : 0);
      drawBeeCar(CW * 0.5, carY, frame * 0.22, charging);

      /* title */
      ctx.fillStyle = V.honey + "44"; ctx.font = `bold 7px ${V.mono}`;
      ctx.fillText("BEE-CAR PROTOTYPE  ·  NEMATIC LC MORPHING WINGS  ·  FLOWER PHOTOVOLTAIC CHARGING", 14, 14);

      /* cycle label */
      const phaseNames = ["HOVER","DESCEND","CHARGING","ASCENT"];
      const pidx = phase < 200 ? 0 : phase < 300 ? 1 : phase < 450 ? 2 : 3;
      ctx.fillStyle = [V.green, V.blue, V.cyan, V.amb][pidx] + "AA";
      ctx.font = `6px ${V.mono}`;
      ctx.fillText(`PHASE: ${phaseNames[pidx]}`, CW - 120, 14);

      raf = requestAnimationFrame(draw);
    };
    raf = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(raf);
  }, []);
  return <canvas ref={ref} style={{ width:"100%", height:"430px", borderRadius:6, display:"block" }} />;
}

/* ─────────────────────────────────────────────────────────────────────────
   CANVAS 3 · Foton-M3 · OCUM Mars Soil · Extremophile Survival
   ───────────────────────────────────────────────────────────────────────── */
function FotonOCUMCanvas() {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const cv = ref.current; if (!cv) return;
    const CH = 390, PR = window.devicePixelRatio || 1;
    const CW = Math.max(cv.offsetWidth, 520);
    cv.width = CW * PR; cv.height = CH * PR; cv.style.height = CH + "px";
    const ctx = cv.getContext("2d")!; ctx.scale(PR, PR);
    let frame = 0, raf = 0;

    /* Soil layers: {label, color, depth0, depth1, hazard} */
    const LAYERS = [
      { label:"SURFACE · UV + ClO₄⁻ + desiccation",  col:"#B03010", d0:0,    d1:0.04,  p:0.01, phLabel:"pH 3.5" },
      { label:"UPPER CRUST · iron oxide · perchlo.",  col:"#8B3520", d0:0.04, d1:0.18,  p:0.06, phLabel:"pH 4.2" },
      { label:"BASALTIC REGOLITH · olivine/pyroxene", col:"#5A3525", d0:0.18, d1:0.38,  p:0.15, phLabel:"pH 5.8" },
      { label:"DEEP REGOLITH · brine pockets ?",      col:"#3A2A3A", d0:0.38, d1:0.65,  p:0.38, phLabel:"pH 6.1" },
      { label:"SUBSURFACE ICE/LIQUID INTERFACE",       col:"#1E2848", d0:0.65, d1:1.0,   p:0.52, phLabel:"pH 6.8" },
    ];

    const ORGS = [
      { name:"Chroococcidiopsis\n(cyanobacteria)", col:V.green, foton:true,
        survival:[0.01, 0.04, 0.15, 0.42, 0.60], desc:"survived BIOPAN-6 direct space exposure" },
      { name:"Lichen\n(Rhizocarpon)", col:V.honey, foton:true,
        survival:[0.02, 0.06, 0.18, 0.35, 0.48], desc:"survived Foton-M3 UV + vacuum" },
      { name:"Deinococcus\nradiodurans", col:V.cyan, foton:false,
        survival:[0.00, 0.03, 0.10, 0.28, 0.45], desc:"extreme radiation tolerance" },
      { name:"Perchlorate-reducer\n(Dechloromonas)", col:V.vio, foton:false,
        survival:[0.00, 0.01, 0.08, 0.30, 0.58], desc:"metabolises ClO₄⁻ as electron acceptor" },
      { name:"Halophilic archaea\n(Halobacterium)", col:V.rose, foton:false,
        survival:[0.00, 0.00, 0.04, 0.18, 0.33], desc:"requires high water activity" },
    ];

    /* SOIL column geometry */
    const SCX = CW * 0.0, SW = CW * 0.30;
    const SY0 = 50, SH = CH - 80;

    /* Organism viability panel */
    const OX = CW * 0.33, OW = CW * 0.65;

    const draw = () => {
      frame++;
      ctx.fillStyle = V.bg; ctx.fillRect(0, 0, CW, CH);

      /* ── FOTON-M3 SATELLITE (top-center, small) ── */
      const satX = CW * 0.5, satY = 26;
      ctx.strokeStyle = V.blue + "55"; ctx.lineWidth = 1;
      ctx.strokeRect(satX - 18, satY - 10, 36, 20);
      ctx.fillStyle = V.dim + "44"; ctx.fillRect(satX - 18, satY - 10, 36, 20);
      /* solar panels */
      [[-40, 0],[40, 0]].forEach(([dx]) => {
        ctx.fillStyle = V.blue + "44"; ctx.strokeStyle = V.blue + "66";
        ctx.strokeRect(satX + dx - 20, satY - 6, 20, 12);
        for (let sc = 0; sc < 3; sc++) ctx.strokeRect(satX + dx - 20 + sc*7, satY - 6, 7, 12);
      });
      ctx.fillStyle = V.ink + "44"; ctx.font = `bold 5.5px ${V.mono}`;
      ctx.fillText("FOTON-M3 · 2007 · BIOPAN-6 · 12 DAYS  ·  300km LEO", satX - 110, satY + 20);

      /* ── OCUM SOIL COLUMN ── */
      ctx.fillStyle = V.ink + "44"; ctx.font = `bold 6.5px ${V.mono}`;
      ctx.fillText("OCUM SOIL", SCX + 8, SY0 - 8);
      ctx.fillStyle = V.dim + "88"; ctx.font = `4.5px ${V.mono}`;
      ctx.fillText("Oxidised Crust", SCX + 8, SY0 - 0);

      LAYERS.forEach((lay, li) => {
        const ly0 = SY0 + lay.d0 * SH;
        const lh  = (lay.d1 - lay.d0) * SH;
        ctx.fillStyle = lay.col; ctx.fillRect(SCX + 8, ly0, SW - 16, lh);
        ctx.strokeStyle = V.dim + "44"; ctx.lineWidth = 0.5;
        ctx.strokeRect(SCX + 8, ly0, SW - 16, lh);

        /* depth label */
        ctx.fillStyle = V.ink + "77"; ctx.font = `4.5px ${V.mono}`;
        ctx.fillText(`${(lay.d0 * 100).toFixed(0)}cm`, SCX + SW + 2, ly0 + 6);
        ctx.fillStyle = V.ink + "44"; ctx.font = `4px ${V.mono}`;

        /* ph label */
        ctx.fillStyle = V.cyan + "66"; ctx.font = `4.5px ${V.mono}`;
        ctx.fillText(lay.phLabel, SCX + SW + 2, ly0 + 18);

        /* particles */
        for (let pk = 0; pk < 10; pk++) {
          const seed = li * 100 + pk * 17;
          const px = SCX + 10 + ((seed * 37 + frame * 0.01) % (SW - 20));
          const py = ly0 + 3 + (seed * 13 % (lh - 6));
          const sz = 1.5 + (seed % 3) * 0.5;
          ctx.fillStyle = li < 2 ? V.rust + "AA" : li < 3 ? "#7A6050AA" : V.vio + "33";
          ctx.beginPath(); ctx.arc(px, py, sz, 0, Math.PI * 2); ctx.fill();
        }
      });

      /* survival probability profile (overlay line on soil column) */
      ctx.strokeStyle = V.green + "88"; ctx.lineWidth = 1.5;
      ctx.setLineDash([4, 4]);
      ctx.beginPath();
      LAYERS.forEach((lay, li) => {
        const lx = SCX + 8 + (lay.p) * (SW - 16);
        const ly = SY0 + (lay.d0 + lay.d1) / 2 * SH;
        if (li === 0) ctx.moveTo(lx, ly); else ctx.lineTo(lx, ly);
      });
      ctx.stroke(); ctx.setLineDash([]);
      ctx.fillStyle = V.green + "88"; ctx.font = `5px ${V.mono}`;
      ctx.fillText("→ P(life)", SCX + 8 + SW/2 - 10, SY0 - 2);

      /* ── ORGANISM VIABILITY MATRIX ── */
      ctx.fillStyle = V.ink + "44"; ctx.font = `bold 6.5px ${V.mono}`;
      ctx.fillText("EXTREMOPHILE SURVIVAL PROBABILITY BY DEPTH", OX, SY0 - 8);

      const depthLabels = ["Surface","4cm","18cm","38cm","65cm+"];
      depthLabels.forEach((dl, di) => {
        ctx.fillStyle = V.dim + "AA"; ctx.font = `5px ${V.mono}`;
        ctx.fillText(dl, OX + 50 + di * (OW * 0.78 / 5), SY0 - 0);
      });

      const ROW_H = (CH - 100) / ORGS.length;
      ORGS.forEach((org, oi) => {
        const oy = SY0 + oi * ROW_H;
        /* name */
        const nameLines = org.name.split("\n");
        nameLines.forEach((line, li2) => {
          ctx.fillStyle = org.col + "CC"; ctx.font = `5.5px ${V.mono}`;
          ctx.fillText(line, OX, oy + 8 + li2 * 10);
        });
        if (org.foton) {
          ctx.fillStyle = V.gold + "AA"; ctx.font = `4.5px ${V.mono}`;
          ctx.fillText("★ FOTON-M3", OX, oy + 30);
        }

        /* survival bars per depth layer */
        org.survival.forEach((sp, si) => {
          const bx = OX + 50 + si * (OW * 0.78 / 5);
          const maxH = ROW_H * 0.7;
          const bh = sp * maxH;
          const by = oy + ROW_H - 12;

          /* pulsing animation for detected surviving organisms */
          const pulse = (Math.sin(frame * 0.04 + oi * 1.3 + si * 0.7) + 1) * 0.5;
          const opacity = sp > 0.15 ? 0.7 + pulse * 0.3 : 0.3 + pulse * 0.2;

          const barG = ctx.createLinearGradient(bx, by, bx, by - bh);
          barG.addColorStop(0, org.col + "33"); barG.addColorStop(1, org.col + Math.round(opacity * 220).toString(16).padStart(2,"0"));
          ctx.fillStyle = barG;
          ctx.fillRect(bx - 14, by - bh, 28, bh);
          ctx.strokeStyle = org.col + (sp > 0.2 ? "66" : "22"); ctx.lineWidth = 0.6;
          ctx.strokeRect(bx - 14, by - bh, 28, bh);

          /* probability label */
          ctx.fillStyle = org.col + "AA"; ctx.font = `4.5px ${V.mono}`;
          ctx.fillText(`${(sp*100).toFixed(0)}%`, bx - 10, by - bh - 3);

          /* micro-organism dots at viable depths */
          if (sp > 0.2 && frame % 60 > (60 - sp * 60)) {
            ctx.fillStyle = org.col + "CC";
            ctx.beginPath(); ctx.arc(bx + (Math.random()-0.5)*20, by - bh - 10, 2, 0, Math.PI*2); ctx.fill();
          }
        });

        /* description */
        ctx.fillStyle = V.dim + "AA"; ctx.font = `4.5px ${V.mono}`;
        ctx.fillText(org.desc, OX + OW * 0.65, oy + 20);
      });

      /* horizontal grid lines */
      ctx.strokeStyle = V.dim + "22"; ctx.lineWidth = 0.5;
      ORGS.forEach((_, oi) => {
        const oy = SY0 + oi * ROW_H;
        ctx.beginPath(); ctx.moveTo(OX, oy + ROW_H); ctx.lineTo(OX + OW, oy + ROW_H); ctx.stroke();
      });

      /* ClO₄⁻ perchlorate hazard bar */
      const HY = CH - 18;
      ctx.fillStyle = V.dim + "33"; ctx.fillRect(OX, HY - 6, OW * 0.78, 10);
      for (let d = 0; d < 5; d++) {
        const hx = OX + 50 + d * (OW * 0.78 / 5);
        const perchlorate = [0.9, 0.75, 0.45, 0.2, 0.05][d];
        const hg = ctx.createLinearGradient(hx, HY-6, hx+OW*0.78/5-4, HY-6);
        hg.addColorStop(0, V.plasma + Math.round(perchlorate*180).toString(16).padStart(2,"0"));
        hg.addColorStop(1, V.plasma + "00");
        ctx.fillStyle = hg; ctx.fillRect(hx - 14, HY - 6, 28, 10);
      }
      ctx.fillStyle = V.plasma + "88"; ctx.font = `5px ${V.mono}`;
      ctx.fillText("ClO₄⁻ PERCHLORATE HAZARD →", OX, HY + 3);

      ctx.fillStyle = V.ink + "22"; ctx.font = `6px ${V.mono}`;
      ctx.fillText("FOTON-M3 BIOPAN-6  ·  OCUM MARS ANALOGUE SOIL  ·  ASTROBIOLOGY", 8, CH - 6);

      raf = requestAnimationFrame(draw);
    };
    raf = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(raf);
  }, []);
  return <canvas ref={ref} style={{ width:"100%", height:"390px", borderRadius:6, display:"block" }} />;
}

/* ─────────────────────────────────────────────────────────────────────────
   PAGE
   ───────────────────────────────────────────────────────────────────────── */
export default function NematicBeeFotonPage() {
  const S: React.CSSProperties = {
    background: V.bg, color: V.ink, minHeight:"100vh",
    padding:"40px 32px 100px", fontFamily: V.serif, maxWidth:980, margin:"0 auto",
  };
  const badge = (t:string, col=V.honey) => (
    <span key={t} style={{ fontFamily:V.mono, fontSize:"0.52rem", color:col, border:`1px solid ${col}44`,
      borderRadius:3, padding:"2px 8px", letterSpacing:2, marginRight:6, marginBottom:5, display:"inline-block" }}>{t}</span>
  );
  const sec = (n:string, title:string, col:string, body:React.ReactNode) => (
    <section style={{ marginBottom:52 }}>
      <div style={{ fontFamily:V.mono, fontSize:"0.55rem", color:col, letterSpacing:3, marginBottom:5 }}>
        {n} ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─
      </div>
      <h2 style={{ fontFamily:V.disp, fontSize:"clamp(0.95rem,2.4vw,1.45rem)", color:col,
        margin:"0 0 18px", letterSpacing:"0.06em", fontWeight:400 }}>{title}</h2>
      {body}
    </section>
  );
  const P = (t:string) => (
    <p style={{ fontFamily:V.serif, fontSize:"clamp(0.88rem,1.7vw,1.02rem)", lineHeight:1.78,
      color:V.ink, margin:"0 0 13px", opacity:0.9 }}>{t}</p>
  );
  const cards = (items:{h:string;col:string;d:string}[], cols="repeat(auto-fit,minmax(200px,1fr))") => (
    <div style={{ display:"grid", gridTemplateColumns:cols, gap:10, marginTop:12 }}>
      {items.map(c => (
        <div key={c.h} style={{ background:`${c.col}0B`, border:`1px solid ${c.col}2A`, borderRadius:6, padding:"10px 12px" }}>
          <div style={{ fontFamily:V.mono, fontSize:"0.59rem", color:c.col, letterSpacing:1.5, marginBottom:5 }}>{c.h}</div>
          <div style={{ fontFamily:V.serif, fontSize:"0.82rem", color:V.ink, lineHeight:1.5 }}>{c.d}</div>
        </div>
      ))}
    </div>
  );

  return (
    <div style={S}>
      <div style={{ marginBottom:42 }}>
        {[badge("LIVE SIMULATION"), badge("NEMATIC LIQUID CRYSTALS",V.cyan), badge("LC DIRECTOR FIELD",V.vio), badge("DEFECTS  ±½",V.plasma), badge("BEE-CAR PROTOTYPE",V.honey), badge("MORPHING WINGS",V.blue), badge("FLOWER CHARGING",V.gold), badge("FOTON-M3",V.blue), badge("OCUM SOIL",V.rust), badge("ASTROBIOLOGY",V.green)]}
        <h1 style={{ fontFamily:V.disp, fontSize:"clamp(1.4rem,4vw,2.6rem)", color:V.ink,
          margin:"22px 0 8px", letterSpacing:"0.06em", fontWeight:400, lineHeight:1.2 }}>
          NEMATIC LC · BEE-CAR PROTOTYPE · FOTON-M3 OCUM SOIL
        </h1>
        <p style={{ fontFamily:V.mono, fontSize:"0.58rem", color:V.dim, letterSpacing:3, margin:"0 0 22px" }}>
          LIQUID CRYSTAL DIRECTOR FIELD · FRANK ELASTICITY · DISCLINATIONS · FLOWER CHARGING · MARS ASTROBIOLOGY
        </p>
        {P("Nematic liquid crystals occupy a state of matter between the full positional order of a solid crystal and the full orientational disorder of a liquid. Rod-shaped molecules are free to move (liquid-like positions) but prefer to align along a common direction called the director n̂ — a headless vector, since n̂ and −n̂ describe the same physical state. The free energy of a nematic is governed by Frank's elastic theory: three independent elastic constants penalise splay (K₁ — molecules fan outward), twist (K₂ — molecules spiral), and bend (K₃ — molecules arc). Topological defects — points where the director field cannot be made continuous — are inevitable in confined nematics and carry half-integer topological charges (±½), unlike the integer charges of ordinary magnetic vortices.")}
        {P("The bee's compound eye provides a direct biological example of a liquid-crystal-like ordered system: the dorsal rim area (DRA) contains ommatidia (visual units) whose rhabdomere microvilli — rod-shaped protein arrays of rhodopsin — are aligned in specific directions that allow the bee to detect the polarization angle of skylight. This biological polarization analyser is architecturally analogous to a nematic LC wave-plate: ordered rod-shaped molecules, a specific director orientation, and birefringence that converts polarization information into signal. Bees use this as a solar compass, navigating even on overcast days by reading the residual polarization pattern through cloud. The bee-car prototype encodes this as an LC-based polarization navigation array in the cockpit.")}
      </div>

      {sec("01","Nematic Director Field · Frank Elastic Energy · ±½ Disclinations · Bee-Eye Birefringence",V.cyan,<>
        {P("The simulation solves the one-constant Frank elastic equation ∂θ/∂t = K∇²θ on a 52×38 grid using circular averaging of the director angles (sin(2θ)/cos(2θ) for the π-periodic director field). The director relaxes toward minimum elastic energy from a random initial state. Topological defects form naturally where the winding integral ∮dθ around a closed loop is ±π/2 — corresponding to ±½ topological charges. These defects cannot be removed by local rearrangement; only defect-antidefect annihilation can reduce their number, and the final state depends on the boundary conditions. Birefringence colors: hue = θ/π × 300°, intensity = sin²(2θ) (the crossed-polarizer formula), reproducing the interference colors seen in real LC cells between crossed polars.")}
        <div style={{ border:`1px solid ${V.dim}44`, borderRadius:8, padding:2, marginBottom:14 }}>
          <NematicDirectorCanvas />
        </div>
        {cards([
          { h:"FRANK ENERGY",       col:V.cyan,  d:"F = ∫[K₁(∇·n̂)² + K₂(n̂·∇×n̂)² + K₃(n̂×∇×n̂)²]dV. Typical values: K₁≈5–15 pN, K₂≈3–10 pN, K₃≈8–20 pN. The one-constant approximation K₁=K₂=K₃=K reduces to K∫|∇θ|²dV — the XY model." },
          { h:"DISCLINATIONS ±½",   col:V.plasma,d:"Topological charge q=(1/2π)∮dθ around a loop. For director field (π-periodic): half-integer charges possible. +½ defect: director rotates π as you orbit it. −½: director rotates −π. Created in ± pairs." },
          { h:"ORDER PARAMETER S",  col:V.vio,   d:"S = ⟨(3cos²θ−1)/2⟩, averaged over molecules. S=1: perfect alignment, S=0: isotropic. S measured by birefringence: Δn = n_e−n_o ∝ S. Near isotropic→nematic transition: S grows from 0 continuously (2nd order)." },
          { h:"CROSSED POLARS",     col:V.gold,  d:"Between crossed polarizers: I = I₀sin²(2ψ)sin²(Γ/2) where ψ = angle between polarizer and director, Γ = 2πΔnd/λ. Extinction at ψ=0°,90° (Maltese cross). Colors = Michel-Lévy interference colors." },
          { h:"BEE EYE DRA",        col:V.honey, d:"Dorsal rim area: aligned rhabdomere microvilli (parallel stacks of membrane discs with rhodopsin) detect polarized skylight. E-vector angle encoded in which ommatidia responds maximally. Resolution: ~10° angular in polarization angle." },
          { h:"LC APPLICATIONS",    col:V.green, d:"LCD displays (nematic switching between E-field states), LC thermometers (cholesteric color vs temperature), LC elastomer actuators (reversible shape change with heat/light), LC biosensors (director disruption by analyte binding)." },
        ])}
      </>)}

      {sec("02","Bee-Body → Flying Car · Nematic LC Morphing Wings · Flower Photovoltaic Charging",V.honey,<>
        {P("The bee body provides an engineering blueprint for a short-range urban air vehicle: the compound-eye cockpit gives 270° forward vision + polarization-based navigation (no GPS required); the 4-wing arrangement (2 main + 2 canard foreplanes) provides exceptional low-speed control and hover capability; the distributed engine-pod layout (4 counter-rotating electric motors) mirrors the bee's 4-wing muscle architecture. The key innovation is the nematic LC morphing wing membrane — a thin layer of LC elastomer sandwiched in the wing skin. Applied voltage changes the director orientation, causing anisotropic strain in the polymer network: the wing can actively change its camber, twist, and washout distribution in real time, mimicking the bee's instantaneous wing deformation that enables rapid manoeuvring. Corrugated veination (as in actual bee wings) provides spanwise rigidity while allowing chordwise flexibility.")}
        {P("The flower charging station is not metaphorical — it is a direct engineering translation. Flowers are optimized solar collectors: petal geometry focuses light onto the central disk (like a parabolic concentrator), the UV patterns guide pollinators to the center (where the charging pad is), and the cup shape shelters from wind and directs warm air upward (preventing cooling of the cell). The bee-car charges by hovering over the central disk (wireless inductive charging coil, resonant coupling at 85 kHz) while its solar cell array on the wing surfaces supplements. The quantum-coherent energy transfer discovered in FMO complex photosynthesis (see Quantum Ringdown Biocycles page) suggests that the optical coupling between flower and pollinator includes quantum amplitudes not captured by classical optics — meaning a bio-inspired charging pad could potentially exceed the Shockley-Queisser limit for photovoltaic conversion if it exploits vibronic coupling.")}
        <div style={{ border:`1px solid ${V.dim}44`, borderRadius:8, padding:2, marginBottom:14 }}>
          <BeeCarCanvas />
        </div>
        {cards([
          { h:"LC MORPHING WING",  col:V.cyan,  d:"Nematic elastomer layer: director aligned along span. Electric field → director reorients → anisotropic strain → camber change. Response time: ~50ms. Camber range: ±8°. Mass penalty: +2kg/wing vs passive wing." },
          { h:"COMPOUND EYE OPTICS",col:V.blue, d:"7,000 ommatidia (hexagonal array). Each: 120° field of view, 1.5° resolution. DRA sector detects polarized light for compass navigation. UV channel: flower pattern detection. Range: 300m obstacle detection at flight speed." },
          { h:"4-WING ARRANGEMENT", col:V.vio,  d:"2 main wings (1.2m span each) + 2 canard foreplanes (0.8m). Counter-rotation eliminates torque. Wing loading: 42 N/m². Hover specific power: 180 W/kg. Max stroke frequency: 40 Hz (bee: 200 Hz — scaled for vehicle mass)." },
          { h:"FLOWER CHARGING",   col:V.gold,  d:"Wireless inductive pad (resonant 85 kHz, SAE J2954 compatible). Transfer efficiency: 92% at 75mm gap. Solar petal array: 8×0.08m² CIGS cells, 22% efficiency. Charge rate: 15 kW. Full charge (40 kWh): 22 min. Range post-charge: 400 km." },
          { h:"STINGER THRUSTER",  col:V.plasma,d:"Rear plasma jet (atmospheric μ-plasma discharge) provides ±5° yaw authority and high-efficiency cruise thrust above 120 km/h. Power: 8 kW. ISP equivalent: 40 s. Uses ambient air as propellant — no propellant mass." },
          { h:"NAVIGATION",        col:V.green, d:"Primary: sky polarization compass (no GPS). Secondary: flower UV landmark map (pre-loaded). Tertiary: inertial + barometric. Emergency: dead reckoning from last known position. No satellite dependency — works inside structures." },
        ])}
      </>)}

      {sec("03","Foton-M3 · OCUM Mars Soil · Extremophile Viability · Can Life Persist?",V.rust,<>
        {P("The Foton-M3 biosatellite (launched 14 September 2007, returned 26 September 2007) carried the BIOPAN-6 experiment — a suite of biology experiments exposed to unshielded space: hard vacuum (10⁻⁶ Pa), cosmic radiation (>100 mGy/day), UV flux (>200 J/cm² MgF₂-filtered), and temperature cycling (−20°C to +60°C). The results were remarkable: the lichen species Rhizocarpon geographicum and Xanthoria elegans survived 10 days of direct space exposure with >70% photosynthetic recovery on return. The cyanobacterium Chroococcidiopsis sp. (an endolithic species found inside rocks in Antarctic deserts) survived at >80% viability. These organisms now represent the primary candidates for Mars surface/subsurface survival, because they combine UV shielding by their own pigments and exopolysaccharide coats, desiccation tolerance through trehalose accumulation (connecting directly to the queen bee diapause page), and metabolic flexibility between oxygenic photosynthesis and fermentation.")}
        {P("OCUM (Oxidised Crust Universal Medium) is a Mars soil analogue designed to replicate the key chemical hazards of Martian regolith: high magnesium perchlorate (Mg(ClO₄)₂ at 1.2 wt%, confirmed by Phoenix lander 2008), iron oxide/oxyhydroxides (43% Fe₂O₃ and jarosite), low pH (3.5–5.5), and extremely low water activity (aW < 0.3 at the surface). The perchlorate is simultaneously a radiation product (formed by UV + Cl⁻ in soil) and a sterilising agent — at surface concentrations, it denatures proteins and generates reactive chlorine radicals under UV. Below 38cm depth, shielding reduces UV to <1% of surface flux, temperature fluctuations decrease, and brine pockets may form from perchlorate deliquescence, providing the liquid water essential for life. The survival probability curves show that the subsurface (>38cm) is the critical zone for life detection — not the surface. Future Mars missions must drill, not just scrape.")}
        <div style={{ border:`1px solid ${V.dim}44`, borderRadius:8, padding:2, marginBottom:14 }}>
          <FotonOCUMCanvas />
        </div>
        {cards([
          { h:"FOTON-M3  2007",     col:V.blue,  d:"Russian biosatellite, ESA collaboration. 12 days in 300km LEO. BIOPAN-6: direct space exposure platform. 43 European experiments. Key result: lichens + cyanobacteria survived 10 days space exposure with high viability recovery." },
          { h:"OCUM COMPOSITION",   col:V.rust,  d:"43% SiO₂, 19% Fe₂O₃, 8% Al₂O₃ + MgO/CaO. 1.2% Mg(ClO₄)₂. pH 3.5–6.8 (depth-dependent). Water activity aW<0.3 at surface. Jarosite confirmed on Mars (Opportunity 2004). Basaltic parent rock (Martian volcanic origin)." },
          { h:"PERCHLORATE ClO₄⁻",  col:V.plasma,d:"0.4–0.6 wt% measured by Phoenix 2008. Formed by UV + Cl⁻. Persists for >10⁶ yr (no liquid water to leach it). Sterilising at surface under UV (generates Cl radical). But: perchlorate-reducing bacteria (Dechloromonas) use it as terminal electron acceptor — possible energy source at depth." },
          { h:"CHROOCOCCIDIOPSIS",  col:V.green, d:"Most space-hardy known organism. Endolithic: lives inside rock. Oxygenic photosynthesis + fermentation. Trehalose tolerance. Survived 10 days BIOPAN-6 (Foton-M3) + previous Foton missions. 0.1mm rock provides adequate UV shielding for survival." },
          { h:"SUBSURFACE BRINES",  col:V.vio,   d:"ClO₄⁻ deliquescence: absorbs atmospheric water vapor, forming brines at −70°C (eutectic). Possible liquid films at 38–65cm depth seasonally. If liquid water exists there: perchlorate-reducers + halophiles could persist. Water activity still borderline (~0.6)." },
          { h:"BEE → MARS LINK",    col:V.honey, d:"The same biochemistry that keeps a bumblebee queen alive through winter — trehalose, dehydrin proteins, anaerobic fermentation, and metabolic flexibility — is what astrobiologists look for in Mars candidates. Diapause biochemistry IS extremophile biochemistry. The bee solved it for Earth. The OCUM organisms solved it for space." },
        ])}
      </>)}
    </div>
  );
}
